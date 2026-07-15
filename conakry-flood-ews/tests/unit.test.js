/* Tests unitaires : modèle de risque, seuils, repli, transitions d'alerte,
   gabarits de messages français. Exécution : npm test (node --test). */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const CORE = p => path.join(__dirname, '..', 'assets', 'js', 'core', p);
require(CORE('config.js'));
require(CORE('adapters.js'));
require(CORE('risk.js'));
require(CORE('alerts.js'));
require(CORE('store.js'));
const SAP = globalThis.SAP;

/* Fabrique une météo synthétique : mmPerHourNext appliqué aux prochaines
   heures, mmPerHourPast aux heures passées, humidité du sol constante. */
function makeWeather(opts) {
  const now = SAP.nowInConakry();
  const start = new Date(now.slice(0, 10) + 'T00:00:00Z');
  start.setUTCDate(start.getUTCDate() - 2);
  const w = { hourlyTime: [], precip: [], prob: [], soil: [], dailyTime: [], dailySum: [], dailyProbMax: [] };
  for (let d = 0; d < 9; d++) {
    const day = new Date(start); day.setUTCDate(day.getUTCDate() + d);
    const iso = day.toISOString().slice(0, 10);
    w.dailyTime.push(iso); w.dailySum.push(0); w.dailyProbMax.push(50);
    for (let h = 0; h < 24; h++) {
      const t = iso + 'T' + String(h).padStart(2, '0') + ':00';
      w.hourlyTime.push(t);
      w.precip.push(t <= now ? (opts.past || 0) : (opts.next || 0));
      w.prob.push(50);
      w.soil.push(opts.soil != null ? opts.soil : 0.2);
    }
  }
  return w;
}

function assessWith(opts, overrides) {
  const data = {
    source: opts.source || 'live',
    fetchedAt: SAP.nowInConakry(),
    weather: SAP.ZONES.map(() => makeWeather(opts)),
    flood: opts.flood === undefined ? null : opts.flood,
  };
  return SAP.assess(data, overrides || {});
}

test('seuils de niveau : bornes 25/50/75', () => {
  assert.equal(SAP.levelForScore(0).id, 'vert');
  assert.equal(SAP.levelForScore(24).id, 'vert');
  assert.equal(SAP.levelForScore(25).id, 'jaune');
  assert.equal(SAP.levelForScore(49).id, 'jaune');
  assert.equal(SAP.levelForScore(50).id, 'orange');
  assert.equal(SAP.levelForScore(74).id, 'orange');
  assert.equal(SAP.levelForScore(75).id, 'rouge');
  assert.equal(SAP.levelForScore(100).id, 'rouge');
});

test('temps calme => niveau vert partout', () => {
  const a = assessWith({ next: 0, past: 0, soil: 0.15 });
  for (const z of a.zones) assert.equal(z.riskLevel, 'vert', z.name + ' devrait être vert (score ' + z.score + ')');
  assert.equal(a.city.riskLevel, 'vert');
});

test('pluie extrême prévue + sols saturés => niveau élevé (orange ou rouge)', () => {
  // 8 mm/h sur 24 h = 192 mm prévus ; 4 mm/h passés = 192 mm sur 48 h ; sol saturé.
  const a = assessWith({ next: 8, past: 4, soil: 0.42 });
  for (const z of a.zones) {
    assert.ok(['orange', 'rouge'].includes(z.riskLevel), z.name + ' devrait être ≥ orange (score ' + z.score + ')');
  }
});

test('la vulnérabilité de zone ordonne les scores (Matoto ≥ Dixinn)', () => {
  const a = assessWith({ next: 3, past: 1, soil: 0.3 });
  const matoto = a.zones.find(z => z.id === 'matoto');
  const dixinn = a.zones.find(z => z.id === 'dixinn');
  assert.ok(matoto.score > dixinn.score, 'Matoto (' + matoto.score + ') devrait dépasser Dixinn (' + dixinn.score + ')');
});

test('RiskZone : interface publique complète', () => {
  const a = assessWith({ next: 3, past: 1, soil: 0.3 });
  const z = a.zones[0];
  for (const key of ['id', 'name', 'centroid', 'riskLevel', 'score', 'confidence', 'drivers', 'updatedAt']) {
    assert.ok(key in z, 'RiskZone.' + key + ' manquant');
  }
  assert.ok(z.drivers.length >= 3, 'les facteurs (drivers) expliquent le score');
  assert.ok(z.drivers.every(d => d.label && d.value !== undefined));
});

test('décision officielle : force le niveau et la confiance', () => {
  const a = assessWith({ next: 0, past: 0, soil: 0.15 }, {
    ratoma: { level: 'rouge', reason: 'instruction ANGUCH' },
  });
  const ratoma = a.zones.find(z => z.id === 'ratoma');
  assert.equal(ratoma.riskLevel, 'rouge');
  assert.equal(ratoma.computedLevel.id, 'vert', 'le niveau calculé reste visible');
  assert.equal(ratoma.confidence, 'officielle');
  assert.equal(ratoma.drivers[0].key, 'override');
  assert.equal(a.city.riskLevel, 'rouge', 'la synthèse ville suit la pire zone (décision incluse)');
});

test('confiance : haute en direct, faible sur données simulées, dégradée sans débit', () => {
  const flood = SAP.ZONES.map(() => ({
    time: Array.from({ length: 38 }, (_, i) => '2026-01-' + String((i % 28) + 1).padStart(2, '0')),
    discharge: Array.from({ length: 38 }, () => 10),
  }));
  const live = assessWith({ next: 1, past: 1, soil: 0.2, flood });
  assert.equal(live.zones[0].confidence, 'haute');
  const noFlood = assessWith({ next: 1, past: 1, soil: 0.2, flood: null });
  assert.equal(noFlood.zones[0].confidence, 'moyenne');
  const sample = assessWith({ next: 1, past: 1, soil: 0.2, source: 'sample' });
  assert.equal(sample.zones[0].confidence, 'faible');
});

test('débit de rivière : série nulle ou vide => non exploitable', () => {
  assert.equal(SAP.floodUsable(null), false);
  assert.equal(SAP.floodUsable({ time: [], discharge: [] }), false);
  assert.equal(SAP.floodUsable({ time: ['a', 'b'], discharge: [0, 0] }), false);
  const ok = { time: Array(20).fill('x'), discharge: Array(20).fill(5) };
  assert.equal(SAP.floodUsable(ok), true);
});

test('transitions d’alerte : circuit nominal brouillon → approuvée → publiée', () => {
  const alert = SAP.alerts.draft({ level: 'orange', zones: ['ratoma'], channels: ['inapp', 'sms'], data: { mm: 90 } });
  assert.equal(alert.status, 'brouillon');
  assert.equal(alert.publishedAt, null);
  SAP.alerts.transition(alert, 'approuvee');
  assert.equal(alert.status, 'approuvee');
  assert.ok(alert.approvedAt);
  SAP.alerts.publish(alert, [
    { channel: 'sms', commune: 'ratoma' },
    { channel: 'sms', commune: 'kaloum' }, // hors zone : non compté
    { channel: 'whatsapp', commune: 'ratoma' }, // autre canal : non compté
  ]);
  assert.equal(alert.status, 'publiee');
  assert.ok(alert.publishedAt);
  const sms = alert.delivery.find(d => d.channel === 'sms');
  assert.equal(sms.targets, 1, 'seuls les inscrits SMS des zones touchées sont ciblés');
  assert.match(sms.status, /simulé/, 'la diffusion est explicitement simulée');
});

test('transitions d’alerte : les raccourcis interdits lèvent une erreur', () => {
  const alert = SAP.alerts.draft({ level: 'rouge', zones: ['matoto'] });
  assert.throws(() => SAP.alerts.transition(alert, 'publiee'), /interdite/, 'brouillon → publiée interdit');
  SAP.alerts.transition(alert, 'approuvee');
  SAP.alerts.transition(alert, 'publiee');
  assert.throws(() => SAP.alerts.transition(alert, 'brouillon'), /interdite/);
  assert.throws(() => SAP.alerts.transition(alert, 'annulee'), /interdite/, 'une alerte publiée ne s’annule pas');
});

test('annulation possible depuis brouillon et approuvée', () => {
  const a1 = SAP.alerts.draft({ level: 'jaune', zones: ['dixinn'] });
  SAP.alerts.transition(a1, 'annulee');
  assert.equal(a1.status, 'annulee');
  const a2 = SAP.alerts.draft({ level: 'jaune', zones: ['dixinn'] });
  SAP.alerts.transition(a2, 'approuvee');
  SAP.alerts.transition(a2, 'annulee');
  assert.equal(a2.status, 'annulee');
});

test('gabarits français : tous les champs résolus, SMS sans accents', () => {
  const msg = SAP.alerts.buildMessages('orange', ['ratoma', 'matoto'], { mm: 85 });
  for (const key of ['inappTitle', 'inapp', 'sms', 'whatsapp']) {
    assert.ok(!/\{\w+\}/.test(msg[key]), key + ' contient un champ non résolu : ' + msg[key]);
  }
  assert.match(msg.sms, /ALERTE ORANGE/);
  assert.match(msg.sms, /Ratoma, Matoto/);
  assert.match(msg.sms, /85 mm/);
  assert.match(msg.sms, /18 \/ 117/);
  assert.ok(!/[À-ÿ]/.test(msg.sms), 'le SMS doit être sans accents (GSM-7) : ' + msg.sms);
  assert.match(msg.whatsapp, /Alerte Orange/);
  assert.match(msg.whatsapp, /Ratoma, Matoto/);
  assert.match(msg.inappTitle, /Orange/);
});

test('gabarits : niveau inconnu => erreur explicite', () => {
  assert.throws(() => SAP.alerts.buildMessages('violet', ['ratoma']), /Niveau inconnu/);
});

test('store : signalement créé en attente puis validé', () => {
  const r = SAP.store.addReport({ commune: 'matoto', communeName: 'Matoto', quartier: 'Gbessia', severity: 'grave', details: 'test' });
  assert.equal(r.validation, 'en_attente');
  assert.equal(r.photo, null, 'emplacement photo réservé');
  const updated = SAP.store.updateReport(r.id, { validation: 'valide' });
  assert.equal(updated.validation, 'valide');
  assert.ok(SAP.store.getReports().some(x => x.id === r.id));
});

test('store : décisions officielles posées et retirées', () => {
  SAP.store.setOverride('kaloum', { level: 'orange', reason: 'test' });
  assert.equal(SAP.store.getOverrides().kaloum.level, 'orange');
  SAP.store.setOverride('kaloum', null);
  assert.equal(SAP.store.getOverrides().kaloum, undefined);
});
