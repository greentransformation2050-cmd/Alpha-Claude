/* Tests d'intégration des adaptateurs : réponses API simulées (fetch mocké)
   et repli sur les données d'exemple en cas de panne. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const CORE = p => path.join(__dirname, '..', 'assets', 'js', 'core', p);
require(CORE('config.js'));
require(CORE('adapters.js'));
require(CORE('risk.js'));
const SAP = globalThis.SAP;

function fakeForecast() {
  const hours = 9 * 24;
  return {
    hourly: {
      time: Array.from({ length: hours }, (_, i) => '2026-07-' + String(13 + Math.floor(i / 24)).padStart(2, '0') + 'T' + String(i % 24).padStart(2, '0') + ':00'),
      precipitation: Array.from({ length: hours }, (_, i) => i % 7 === 0 ? 2.5 : 0),
      precipitation_probability: Array.from({ length: hours }, () => 60),
      soil_moisture_0_to_1cm: Array.from({ length: hours }, () => 0.3),
    },
    daily: {
      time: Array.from({ length: 9 }, (_, i) => '2026-07-' + String(13 + i).padStart(2, '0')),
      precipitation_sum: Array.from({ length: 9 }, () => 8.5),
      precipitation_probability_max: Array.from({ length: 9 }, () => 80),
    },
  };
}

function fakeFlood(discharge) {
  const days = 38;
  return {
    daily: {
      time: Array.from({ length: days }, (_, i) => '2026-0' + (i < 30 ? '6' : '7') + '-' + String((i % 30) + 1).padStart(2, '0')),
      river_discharge: Array.from({ length: days }, (_, i) => discharge == null ? null : discharge + (i > 30 ? 5 : 0)),
    },
  };
}

function mockFetch(handler) {
  globalThis.fetch = async function (url) {
    const body = handler(String(url));
    if (body === 'HTTP500') return { ok: false, status: 500, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => body };
  };
}

test('adaptateur météo : réponse multi-points (tableau) normalisée', async () => {
  mockFetch(url => {
    assert.match(url, /api\.open-meteo\.com\/v1\/forecast/);
    assert.match(url, /timezone=Africa%2FConakry/);
    return SAP.ZONES.map(() => fakeForecast());
  });
  const weather = await SAP.adapters.weather();
  assert.equal(weather.length, SAP.ZONES.length);
  assert.equal(weather[0].precip.length, 9 * 24);
  assert.equal(weather[0].dailySum.length, 9);
  assert.ok(weather[0].soil.every(v => v === 0.3));
});

test('adaptateur météo : réponse mono-point (objet) acceptée', async () => {
  mockFetch(() => fakeForecast());
  const weather = await SAP.adapters.weather();
  assert.equal(weather.length, 1);
  assert.equal(weather[0].dailyTime.length, 9);
});

test('adaptateur météo : les valeurs nulles deviennent 0', async () => {
  const f = fakeForecast();
  f.hourly.precipitation = f.hourly.precipitation.map(() => null);
  mockFetch(() => [f]);
  const weather = await SAP.adapters.weather();
  assert.ok(weather[0].precip.every(v => v === 0));
});

test('adaptateur débit : normalisation et détection d’exploitabilité', async () => {
  mockFetch(url => {
    assert.match(url, /flood-api\.open-meteo\.com\/v1\/flood/);
    assert.match(url, /daily=river_discharge/);
    return SAP.ZONES.map((z, i) => fakeFlood(i === 0 ? null : 12));
  });
  const flood = await SAP.adapters.flood();
  assert.equal(flood.length, SAP.ZONES.length);
  assert.equal(SAP.floodUsable(flood[0]), false, 'série nulle => inexploitable');
  assert.equal(SAP.floodUsable(flood[1]), true, 'série réelle => exploitable');
});

test('loadData : météo OK + débit OK => source live avec débit', async () => {
  mockFetch(url => url.includes('flood-api')
    ? SAP.ZONES.map(() => fakeFlood(12))
    : SAP.ZONES.map(() => fakeForecast()));
  const data = await SAP.loadData();
  assert.equal(data.source, 'live');
  assert.ok(Array.isArray(data.flood));
});

test('loadData : météo OK mais débit en panne => live sans débit', async () => {
  mockFetch(url => url.includes('flood-api') ? 'HTTP500' : SAP.ZONES.map(() => fakeForecast()));
  const data = await SAP.loadData();
  assert.equal(data.source, 'live');
  assert.equal(data.flood, null);
});

test('loadData : météo en panne => repli complet sur les données simulées', async () => {
  globalThis.fetch = async () => { throw new Error('réseau coupé'); };
  const data = await SAP.loadData();
  assert.equal(data.source, 'sample');
  assert.equal(data.weather.length, SAP.ZONES.length);
  assert.equal(data.flood.length, SAP.ZONES.length);
  // Le jeu simulé doit alimenter le moteur de bout en bout.
  const a = SAP.assess(data, {});
  assert.equal(a.zones.length, SAP.ZONES.length);
  assert.ok(a.zones.every(z => z.score >= 0 && z.score <= 100));
  assert.ok(a.zones.every(z => z.confidence === 'faible'), 'les données simulées plafonnent la confiance à faible');
});

test('loadData : erreur HTTP météo (500) => repli simulé aussi', async () => {
  mockFetch(() => 'HTTP500');
  const data = await SAP.loadData();
  assert.equal(data.source, 'sample');
});

const SAMPLE_CAP = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>ANM-GN-2026-07-15-001</identifier>
  <sender>anm@meteo.gov.gn</sender>
  <sent>2026-07-15T12:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <info>
    <language>en-US</language>
    <event>Heavy rain</event>
    <severity>Severe</severity>
    <headline>Heavy rain over Basse Guinee</headline>
    <area><areaDesc>Conakry</areaDesc></area>
  </info>
  <info>
    <language>fr-GN</language>
    <event>Fortes pluies</event>
    <severity>Severe</severity>
    <urgency>Expected</urgency>
    <certainty>Likely</certainty>
    <headline>Orages et fortes pluies sur la Basse Guinée</headline>
    <description><![CDATA[Cumuls de 80 à 120 mm attendus en 24 h sur Conakry & environs.]]></description>
    <instruction>Évitez les zones basses et les traversées d'eau.</instruction>
    <onset>2026-07-15T15:00:00-00:00</onset>
    <expires>2026-07-16T15:00:00-00:00</expires>
    <area><areaDesc>Conakry</areaDesc></area>
    <area><areaDesc>Coyah</areaDesc></area>
  </info>
</alert>`;

test('CAP : document ANM analysé, bloc francophone préféré', () => {
  const a = SAP.parseCap(SAMPLE_CAP);
  assert.equal(a.identifier, 'ANM-GN-2026-07-15-001');
  assert.equal(a.status, 'Actual');
  assert.equal(a.infos.length, 2);
  assert.equal(a.info.language, 'fr-GN', 'le bloc info francophone est retenu');
  assert.equal(a.info.event, 'Fortes pluies');
  assert.match(a.info.description, /80 à 120 mm/, 'les CDATA sont dépliés');
  assert.deepEqual(a.info.areas, ['Conakry', 'Coyah']);
  assert.equal(a.info.severity, 'Severe');
});

test('CAP : contenu invalide ou vide => null', () => {
  assert.equal(SAP.parseCap(''), null);
  assert.equal(SAP.parseCap('<rss><item>pas du CAP</item></rss>'), null);
  assert.equal(SAP.parseCap('<alert><identifier>x</identifier></alert>'), null, 'alerte sans <info> ignorée');
});

test('officialAlerts : sans flux configuré => liste vide, sans réseau', async () => {
  globalThis.fetch = async () => { throw new Error('ne doit pas être appelé'); };
  SAP.CONFIG.feeds.capFeeds = [];
  assert.deepEqual(await SAP.adapters.officialAlerts(), []);
});

test('officialAlerts : flux configuré => alertes parsées, tests CAP filtrés', async () => {
  SAP.CONFIG.feeds.capFeeds = ['https://exemple.gn/cap.xml'];
  globalThis.fetch = async () => ({
    ok: true, status: 200,
    text: async () => SAMPLE_CAP + SAMPLE_CAP.replace('<status>Actual</status>', '<status>Test</status>'),
  });
  const alerts = await SAP.adapters.officialAlerts();
  assert.equal(alerts.length, 1, 'les messages de statut Test sont exclus');
  assert.equal(alerts[0].info.headline, 'Orages et fortes pluies sur la Basse Guinée');
  SAP.CONFIG.feeds.capFeeds = [];
});

test('officialAlerts : flux en panne => [] (le système continue)', async () => {
  SAP.CONFIG.feeds.capFeeds = ['https://exemple.gn/cap.xml'];
  globalThis.fetch = async () => { throw new Error('réseau coupé'); };
  assert.deepEqual(await SAP.adapters.officialAlerts(), []);
  SAP.CONFIG.feeds.capFeeds = [];
});

test('registre des sources : complet et honnête sur l’état d’intégration', () => {
  assert.ok(SAP.SOURCES.length >= 10, 'les 10 sources recommandées sont recensées');
  for (const s of SAP.SOURCES) {
    assert.ok(s.name && s.role && s.action, s.id + ' : entrée complète');
    assert.ok(SAP.SOURCE_STATUS_LABELS[s.status], s.id + ' : statut connu');
  }
  const integrated = SAP.SOURCES.filter(s => s.status === 'integre');
  assert.equal(integrated.length, 1, 'v1 n’intègre en direct qu’Open-Meteo — le registre ne doit pas surpromettre');
});

test('données simulées : déterministes d’un appel à l’autre', () => {
  const a = SAP.adapters.sample();
  const b = SAP.adapters.sample();
  assert.deepEqual(a.weather[0].dailySum, b.weather[0].dailySum);
  assert.deepEqual(a.flood[2].discharge, b.flood[2].discharge);
});
