/* SAP Conakry — salle des opérations (tableau de bord). */
(function () {
  'use strict';

  let state = null;
  let map = null;
  let mapLayers = [];
  let selectedCommune = 'all';
  let overrideZoneId = null;

  const $ = sel => document.querySelector(sel);
  const esc = SAP.ui.esc;

  /* ---------- Niveau global ---------- */

  function renderHero(a) {
    const hero = $('#alert-hero');
    const lvl = a.city.level;
    hero.className = 'card hero lvl-' + lvl.id;
    hero.innerHTML =
      '<div class="icon">' + lvl.icon + '</div>' +
      '<div>' +
        '<h1 class="title">Niveau <span class="lvl-name">' + lvl.name.toUpperCase() + '</span> — ' + esc(lvl.title) + '</h1>' +
        '<p>' + esc(lvl.advice) + '</p>' +
      '</div>' +
      '<div class="meta">Commune la plus exposée :<br><strong>' + esc(a.city.worstZone.name) +
      '</strong> (score ' + a.city.worstZone.score + '/100) ' + SAP.ui.confidence(a.city.worstZone.confidence) + '</div>';
  }

  /* ---------- Tuiles ---------- */

  function tile(label, value, unit, note) {
    return '<div class="tile"><div class="label">' + label + '</div>' +
      '<div class="value">' + value + (unit ? ' <small>' + unit + '</small>' : '') + '</div>' +
      (note ? '<div class="note">' + note + '</div>' : '') + '</div>';
  }

  function renderTiles(a) {
    const pending = SAP.store.getReports().filter(r => r.validation === 'en_attente').length;
    $('#tiles').innerHTML =
      tile('Pluie prévue — prochaines 24 h', a.city.next24max, 'mm', 'maximum sur les 5 communes') +
      tile('Pluie tombée — dernières 48 h', a.city.past48max, 'mm', 'maximum sur les 5 communes') +
      tile('Humidité du sol (0–1 cm)', Math.round(a.city.soilMax * 100), '%', 'saturation ≈ 40 m³/m³') +
      tile('Signalements à vérifier', pending, '', '<a href="reports.html">valider →</a>');
  }

  /* ---------- Carte ---------- */

  function statusColor(lvl) {
    const styles = getComputedStyle(document.documentElement);
    const vars = { vert: '--status-good', jaune: '--status-warning', orange: '--status-serious', rouge: '--status-critical' };
    return styles.getPropertyValue(vars[lvl.id]).trim() || '#888';
  }

  function renderMap(a) {
    const el = $('#map');
    if (typeof L === 'undefined') { renderMapFallback(a, el); renderLegend(); return; }

    if (!map) {
      map = L.map(el, { scrollWheelZoom: false }).setView([9.565, -13.65], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
    }
    mapLayers.forEach(l => map.removeLayer(l));
    mapLayers = [];

    for (const z of a.zones) {
      const color = statusColor(z.level);
      const marker = L.circleMarker([z.centroid.lat, z.centroid.lon], {
        radius: 12 + z.score * 0.16,
        color: color, weight: 2, fillColor: color, fillOpacity: 0.35,
      }).addTo(map);
      marker.bindPopup(
        '<strong>' + esc(z.name) + '</strong> — ' + z.level.icon + ' ' + z.level.name +
        ' (score ' + z.score + '/100, confiance ' + esc(z.confidence) + ')<br>' +
        'Pluie prévue 24 h : ' + z.metrics.next24 + ' mm · tombée 48 h : ' + z.metrics.past48 + ' mm<br>' +
        (z.metrics.peak ? 'Pic attendu : ' + SAP.formatDateTime(z.metrics.peak.time) + ' (' + z.metrics.peak.mm + ' mm/h)<br>' : '') +
        (z.override ? '<em>Décision officielle active</em>' : '')
      );
      const label = L.marker([z.centroid.lat, z.centroid.lon], {
        icon: L.divIcon({ className: '', html: '<div style="font-size:12px;font-weight:600;transform:translate(-50%,-190%);white-space:nowrap;text-shadow:0 0 3px var(--surface-1),0 0 3px var(--surface-1)">' + esc(z.name) + '</div>' }),
        interactive: false,
      }).addTo(map);
      mapLayers.push(marker, label);
    }

    // Points sensibles — pins simulés, clairement marqués comme tels.
    for (const h of SAP.HOTSPOTS) {
      const pin = L.marker([h.lat, h.lon], {
        icon: L.divIcon({ className: '', html: '<div style="font-size:16px;transform:translate(-50%,-90%)" title="' + esc(h.name) + '">📍</div>' }),
      }).addTo(map);
      pin.bindPopup(
        '<strong>📍 ' + esc(h.name) + '</strong> (' + esc((SAP.zoneById(h.zone) || {}).name || h.zone) + ')<br>' +
        esc(h.cause) + '<br><em>Donnée simulée — à valider avec les relevés officiels.</em>'
      );
      mapLayers.push(pin);
    }
    renderLegend();
  }

  function renderMapFallback(a, el) {
    const box = { lonMin: -13.75, lonMax: -13.55, latMin: 9.47, latMax: 9.68 };
    el.outerHTML = '<div id="map" class="map-fallback">' + a.zones.map(function (z) {
      const x = (z.centroid.lon - box.lonMin) / (box.lonMax - box.lonMin) * 100;
      const y = (box.latMax - z.centroid.lat) / (box.latMax - box.latMin) * 100;
      return '<div class="pin lvl-' + z.level.id + '" style="left:' + x + '%;top:' + y + '%">' +
        '<span class="badge">' + esc(z.name) + ' · ' + z.score + '</span></div>';
    }).join('') + SAP.HOTSPOTS.map(function (h) {
      const x = (h.lon - box.lonMin) / (box.lonMax - box.lonMin) * 100;
      const y = (box.latMax - h.lat) / (box.latMax - box.latMin) * 100;
      return '<div class="pin" style="left:' + x + '%;top:' + y + '%" title="' + esc(h.name) + ' — ' + esc(h.cause) + ' (simulé)">📍</div>';
    }).join('') + '</div>';
  }

  function renderLegend() {
    $('#map-legend').innerHTML = SAP.LEVELS.map(l =>
      '<span class="badge lvl-' + l.id + '">' + l.icon + ' ' + l.name + ' — ' + l.title + '</span>'
    ).join('') + '<span class="chip chip-simule">📍 point sensible (simulé)</span>';
  }

  /* ---------- Tableau des zones + décisions officielles ---------- */

  function renderTable(a) {
    $('#zone-table tbody').innerHTML = a.zones.map(z =>
      '<tr>' +
        '<td><strong>' + esc(z.name) + '</strong></td>' +
        '<td class="num">' + z.metrics.next24 + ' mm</td>' +
        '<td class="num">' + z.metrics.past48 + ' mm</td>' +
        '<td class="num">' + z.score + '</td>' +
        '<td>' + SAP.ui.levelBadge(z.level) + (z.override ? ' <span class="chip">décision</span>' : '') + '</td>' +
        '<td>' + SAP.ui.confidence(z.confidence) + '</td>' +
        '<td><button class="small ghost ov-btn" data-zone="' + z.id + '">Décision…</button></td>' +
      '</tr>'
    ).join('');

    document.querySelectorAll('.ov-btn').forEach(btn =>
      btn.addEventListener('click', () => openOverrideDialog(btn.dataset.zone)));
  }

  function openOverrideDialog(zoneId) {
    overrideZoneId = zoneId;
    const zone = SAP.zoneById(zoneId);
    const current = SAP.store.getOverrides()[zoneId];
    $('#ov-zone-name').textContent = zone.name;
    $('#ov-level').innerHTML = '<option value="">— Suivre le modèle (retirer la décision) —</option>' +
      SAP.LEVELS.map(l => '<option value="' + l.id + '"' + (current && current.level === l.id ? ' selected' : '') + '>' +
        l.icon + ' ' + l.name + ' — ' + l.title + '</option>').join('');
    $('#ov-reason').value = current ? (current.reason || '') : '';
    $('#override-dialog').showModal();
  }

  /* ---------- Graphiques ---------- */

  function seriesFor(a) {
    if (selectedCommune !== 'all') {
      const z = a.zones.find(x => x.id === selectedCommune);
      return { daily: z.weather.dailySum, dailyTime: z.weather.dailyTime, dailyProb: z.weather.dailyProbMax, hourly: z.weather.precip, hourlyTime: z.weather.hourlyTime, nowIdx: z.nowIdx };
    }
    const n = a.zones.length;
    const first = a.zones[0].weather;
    const daily = first.dailySum.map((_, i) =>
      Math.round(a.zones.reduce((s, z) => s + (z.weather.dailySum[i] || 0), 0) / n * 10) / 10);
    const dailyProb = first.dailyProbMax.map((_, i) =>
      Math.round(a.zones.reduce((s, z) => s + (z.weather.dailyProbMax[i] || 0), 0) / n));
    const hourly = first.precip.map((_, i) =>
      Math.round(a.zones.reduce((s, z) => s + (z.weather.precip[i] || 0), 0) / n * 100) / 100);
    return { daily, dailyTime: first.dailyTime, dailyProb, hourly, hourlyTime: first.hourlyTime, nowIdx: a.zones[0].nowIdx };
  }

  function renderCharts(a) {
    const s = seriesFor(a);
    const todayIso = a.now.slice(0, 10);
    const todayIdx = s.dailyTime.indexOf(todayIso);

    SAP.barChart($('#chart-daily'), {
      labels: s.dailyTime.map(SAP.formatDayShort),
      values: s.daily,
      unit: 'mm',
      highlightIndex: -1,
      tipLabel: i => SAP.formatDayShort(s.dailyTime[i]) + (i === todayIdx ? ' (aujourd’hui)' : ''),
    });

    const from = Math.max(0, s.nowIdx - 12);
    const to = Math.min(s.hourly.length, s.nowIdx + 48);
    SAP.lineChart($('#chart-hourly'), {
      times: s.hourlyTime.slice(from, to),
      values: s.hourly.slice(from, to),
      unit: 'mm/h',
      nowIndex: s.nowIdx - from,
      xLabel: i => s.hourlyTime[from + i].slice(11, 16),
      tipLabel: i => SAP.formatDateTime(s.hourlyTime[from + i]),
    });

    $('#daily-table tbody').innerHTML = s.dailyTime.map((d, i) =>
      '<tr><td>' + SAP.formatDayShort(d) + (i === todayIdx ? ' (aujourd’hui)' : '') + '</td>' +
      '<td class="num">' + s.daily[i] + '</td><td class="num">' + s.dailyProb[i] + '</td></tr>'
    ).join('');
  }

  function initCommuneSelect() {
    const sel = $('#commune-select');
    sel.innerHTML = '<option value="all">Toutes les communes (moyenne)</option>' +
      SAP.ZONES.map(z => '<option value="' + z.id + '">' + esc(z.name) + '</option>').join('');
    sel.addEventListener('change', function () {
      selectedCommune = sel.value;
      if (state) renderCharts(state);
    });
  }

  /* ---------- Alertes actives + signalements ---------- */

  function renderActiveAlerts() {
    const alerts = SAP.store.getPublishedAlerts().slice(0, 5);
    $('#active-alerts').innerHTML = alerts.length
      ? alerts.map(function (a) {
          const level = SAP.levelById(a.level) || SAP.LEVELS[0];
          return '<div class="alert-item"><div class="head">' + SAP.ui.levelBadge(level) +
            '<span class="title">' + esc(a.title) + '</span>' + SAP.ui.statusChip(a.status) + '</div>' +
            '<div class="when">Publiée : ' + SAP.formatDateTime(a.publishedAt) + ' · Canaux : ' +
            a.channelTargets.map(c => SAP.alerts.CHANNEL_LABELS[c]).join(', ') + ' (envoi simulé)</div></div>';
        }).join('')
      : '<p class="empty">Aucune alerte publiée.</p>';
  }

  function renderReports() {
    const reports = SAP.store.getReports().slice(0, 6);
    $('#reports').innerHTML = reports.length
      ? reports.map(r =>
          '<li><span class="where">' + esc(r.communeName) + (r.quartier ? ' — ' + esc(r.quartier) : '') + '</span>' +
          ' · <span class="badge lvl-' + SAP.ui.severityLevelId(r.severity) + '">' + SAP.ui.severityLabel(r.severity) + '</span>' +
          ' ' + SAP.ui.statusChip(r.validation, { en_attente: 'À vérifier', valide: 'Validé', rejete: 'Rejeté' }) +
          (r.details ? '<br>' + esc(r.details) : '') +
          '<br><span class="when">' + SAP.formatDateTime(r.at) + '</span></li>'
        ).join('')
      : '<li class="empty">Aucun signalement pour le moment.</li>';
  }

  /* ---------- Sources de données + alertes officielles (CAP) ---------- */

  function renderSources() {
    const chipClass = { integre: 'chip-valide', pret_a_brancher: 'chip-approuvee', acces_a_demander: 'chip-en_attente', calibration: 'chip-brouillon', reference: 'chip-brouillon' };
    $('#sources-table tbody').innerHTML = SAP.SOURCES.map(s =>
      '<tr>' +
        '<td><strong>' + esc(s.name) + '</strong></td>' +
        '<td>' + esc(s.role) + '</td>' +
        '<td><span class="chip ' + (chipClass[s.status] || '') + '">' + esc(SAP.SOURCE_STATUS_LABELS[s.status] || s.status) + '</span></td>' +
        '<td>' + esc(s.action) + '</td>' +
      '</tr>'
    ).join('');
  }

  async function renderOfficialAlerts() {
    const el = $('#official-alerts');
    const feeds = (SAP.CONFIG.feeds && SAP.CONFIG.feeds.capFeeds) || [];
    if (!feeds.length) {
      el.innerHTML = '<p class="sub">Aucun flux CAP officiel configuré (le parseur est prêt : renseignez <code>CONFIG.feeds.capFeeds</code> quand l\'ANM fournit l\'accès).</p>';
      return;
    }
    const alerts = await SAP.adapters.officialAlerts();
    el.innerHTML = alerts.length
      ? alerts.slice(0, 5).map(a =>
          '<div class="alert-item"><div class="head"><span class="chip chip-publiee">Alerte officielle</span>' +
          '<span class="title">' + esc(a.info.headline || a.info.event || 'Alerte') + '</span>' +
          (a.info.severity ? '<span class="chip">' + esc(a.info.severity) + '</span>' : '') + '</div>' +
          (a.info.description ? '<div>' + esc(a.info.description) + '</div>' : '') +
          (a.info.instruction ? '<div><strong>Consigne :</strong> ' + esc(a.info.instruction) + '</div>' : '') +
          '<div class="when">' + esc(a.sender || '') + (a.sent ? ' · ' + esc(a.sent) : '') +
          (a.info.areas.length ? ' · Zones : ' + esc(a.info.areas.join(', ')) : '') + '</div></div>'
        ).join('')
      : '<p class="sub">Flux CAP configuré, aucune alerte officielle active (ou flux injoignable).</p>';
  }

  /* ---------- Cycle de vie ---------- */

  async function refresh() {
    $('#updated-at').textContent = 'Chargement des données…';
    state = SAP.assess(await SAP.loadData(), SAP.store.getOverrides());
    SAP.ui.setDemoBanner(state);
    renderHero(state);
    renderTiles(state);
    renderMap(state);
    renderTable(state);
    renderCharts(state);
    renderActiveAlerts();
    renderReports();
    renderSources();
    renderOfficialAlerts();
    SAP.ui.setUpdatedAt(state);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCommuneSelect();
    renderLegend();
    refresh();
    setInterval(refresh, SAP.CONFIG.refreshMinutes * 60 * 1000);

    $('#refresh').addEventListener('click', refresh);

    $('#override-form').addEventListener('submit', function (ev) {
      const submitter = ev.submitter;
      if (!submitter || submitter.value !== 'save' || !overrideZoneId) return;
      const level = $('#ov-level').value;
      SAP.store.setOverride(overrideZoneId, level ? { level: level, reason: $('#ov-reason').value.trim() } : null);
      refresh();
    });

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (state) renderCharts(state); }, 200);
    });
  });
})();
