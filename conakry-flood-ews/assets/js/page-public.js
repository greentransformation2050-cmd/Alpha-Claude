/* SAP Conakry — vue publique (résidents). */
(function () {
  'use strict';

  let state = null;
  const $ = sel => document.querySelector(sel);
  const esc = SAP.ui.esc;

  function communeOptions(selectedId) {
    return SAP.ZONES.map(z =>
      '<option value="' + z.id + '"' + (z.id === selectedId ? ' selected' : '') + '>' + esc(z.name) + '</option>'
    ).join('');
  }

  function myZone() {
    const id = SAP.store.getCommune();
    return state.zones.find(z => z.id === id) || state.zones[0];
  }

  function renderPublicAlerts() {
    const mine = SAP.store.getPublishedAlerts()
      .filter(a => a.affectedZones.indexOf(SAP.store.getCommune()) !== -1)
      .slice(0, 2);
    $('#public-alerts').innerHTML = mine.map(function (a) {
      const level = SAP.levelById(a.level) || SAP.LEVELS[0];
      return '<div class="public-alert lvl-' + level.id + '">' +
        '<div class="title">' + level.icon + ' ' + esc(a.title) + '</div>' +
        '<div>' + esc(a.message.inapp).replace(/\n/g, '<br>') + '</div>' +
        '<div class="when">Publiée : ' + SAP.formatDateTime(a.publishedAt) + '</div>' +
        '</div>';
    }).join('');
  }

  function renderHero() {
    const z = myZone();
    const lvl = z.level;
    const hero = $('#alert-hero');
    hero.className = 'card hero lvl-' + lvl.id;
    const hotspots = SAP.HOTSPOTS.filter(h => h.zone === z.id).map(h => h.name);
    hero.innerHTML =
      '<div class="icon">' + lvl.icon + '</div>' +
      '<div>' +
        '<h1 class="title">' + esc(z.name) + ' : niveau <span class="lvl-name">' + lvl.name.toUpperCase() + '</span> — ' + esc(lvl.title) + '</h1>' +
        '<p>' + esc(lvl.advice) + '</p>' +
        (z.metrics.peak
          ? '<p><strong>Pic de pluie attendu :</strong> ' + SAP.formatDateTime(z.metrics.peak.time) + ' (' + z.metrics.peak.mm + ' mm/h). '
          : '<p>') +
        (hotspots.length ? 'Quartiers sensibles : ' + esc(hotspots.join(', ')) + '.' : '') + '</p>' +
        '<details><summary>Pourquoi ce niveau ? ' + SAP.ui.confidence(z.confidence) + '</summary>' +
        SAP.ui.drivers(z) + '</details>' +
      '</div>' +
      '<div class="meta">Score de risque<br><strong style="font-size:22px">' + z.score + '/100</strong></div>';
  }

  function renderGuidance() {
    const z = myZone();
    const g = $('#guidance');
    g.className = 'guidance lvl-' + z.level.id;
    g.innerHTML = '<p><strong>' + z.level.icon + ' Niveau ' + esc(z.level.name) + ' — ' + esc(z.level.title) + '</strong></p>' +
      '<ul class="checklist">' + z.level.guidance.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>';
  }

  function renderDays() {
    const z = myZone();
    const todayIso = state.now.slice(0, 10);
    const start = Math.max(0, z.weather.dailyTime.indexOf(todayIso));
    let html = '';
    for (let i = start; i < Math.min(start + 3, z.weather.dailyTime.length); i++) {
      html += '<div class="day-chip">' +
        '<div class="d">' + SAP.formatDayShort(z.weather.dailyTime[i]) + (i === start ? ' (auj.)' : '') + '</div>' +
        '<div class="mm">' + z.weather.dailySum[i] + ' mm</div>' +
        '<div class="p">prob. ' + z.weather.dailyProbMax[i] + ' %</div>' +
        '</div>';
    }
    $('#day-chips').innerHTML = html;
  }

  function renderHistory() {
    // Côté public, seules les alertes PUBLIÉES existent — jamais les
    // brouillons ni les alertes seulement approuvées.
    const alerts = SAP.store.getPublishedAlerts().slice(0, 10);
    $('#alert-history').innerHTML = alerts.length
      ? alerts.map(function (a) {
          const level = SAP.levelById(a.level) || SAP.LEVELS[0];
          return '<li>' + SAP.ui.levelBadge(level) + ' <span class="where">' + esc(a.title) + '</span>' +
            '<br><span class="when">' + SAP.formatDateTime(a.publishedAt) + '</span></li>';
        }).join('')
      : '<li class="empty">Aucune alerte publiée pour le moment.</li>';
  }

  function renderAll() {
    SAP.ui.setDemoBanner(state);
    SAP.ui.setUpdatedAt(state);
    renderPublicAlerts();
    renderHero();
    renderGuidance();
    renderDays();
    renderHistory();
  }

  async function refresh() {
    state = SAP.assess(await SAP.loadData(), SAP.store.getOverrides());
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', function () {
    const myId = SAP.store.getCommune();
    $('#my-commune').innerHTML = communeOptions(myId);
    $('#sub-commune').innerHTML = communeOptions(myId);
    $('#rep-commune').innerHTML = communeOptions(myId);

    $('#my-commune').addEventListener('change', function () {
      SAP.store.setCommune(this.value);
      $('#sub-commune').value = this.value;
      $('#rep-commune').value = this.value;
      if (state) renderAll();
    });

    $('#subscribe-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      const f = ev.target;
      SAP.store.addSubscriber({
        name: f.name.value.trim(),
        phone: f.phone.value.trim(),
        commune: f.commune.value,
        channel: f.channel.value,
      });
      $('#sub-msg').textContent = '✓ Inscription enregistrée pour ' +
        (SAP.zoneById(f.commune.value) || {}).name +
        '. Vous serez alerté par ' + (f.channel.value === 'sms' ? 'SMS' : 'WhatsApp') + ' à chaque changement de niveau (envoi simulé dans ce prototype).';
      f.reset();
      $('#sub-commune').value = SAP.store.getCommune();
    });

    $('#report-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      const f = ev.target;
      const zone = SAP.zoneById(f.commune.value);
      SAP.store.addReport({
        commune: f.commune.value,
        communeName: zone ? zone.name : f.commune.value,
        quartier: f.quartier.value.trim(),
        severity: f.severity.value,
        details: f.details.value.trim(),
        contact: f.contact.value.trim() || null,
      });
      $('#rep-msg').textContent = '✓ Signalement envoyé. Merci — il sera vérifié par la salle des opérations.';
      f.reset();
      $('#rep-commune').value = SAP.store.getCommune();
    });

    refresh();
    setInterval(refresh, SAP.CONFIG.refreshMinutes * 60 * 1000);
  });
})();
