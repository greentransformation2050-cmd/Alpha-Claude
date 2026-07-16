/* SAP Conakry — petits composants d'interface partagés entre les pages. */
window.SAP = window.SAP || {};

(function () {
  'use strict';
  const esc = SAP.escapeHtml;

  SAP.ui = {
    esc: esc,

    /* Pastille de niveau : couleur + icône + libellé (jamais couleur seule). */
    levelBadge: function (level) {
      return '<span class="badge lvl-' + level.id + '">' + level.icon + ' ' + esc(level.name) + '</span>';
    },

    statusChip: function (status, labels) {
      const label = (labels || SAP.alerts.STATUS_LABELS)[status] || status;
      return '<span class="chip chip-' + esc(status) + '">' + esc(label) + '</span>';
    },

    confidence: function (c) {
      const label = { haute: 'confiance haute', moyenne: 'confiance moyenne', faible: 'confiance faible', officielle: 'décision officielle' }[c] || c;
      return '<span class="chip">' + esc(label) + '</span>';
    },

    drivers: function (zone) {
      return '<ul class="drivers">' + zone.drivers.map(d =>
        '<li><span>' + esc(d.label) + ' : ' + esc(d.value) + '</span>' +
        (d.contribution != null ? '<span class="c">+' + d.contribution + ' pts</span>' : '<span class="c"></span>') +
        '</li>').join('') + '</ul>';
    },

    setDemoBanner: function (state) {
      const el = document.getElementById('demo-banner');
      if (el) el.hidden = !state.demo;
    },

    setUpdatedAt: function (state) {
      const el = document.getElementById('updated-at');
      if (el) {
        el.textContent = 'Actualisé : ' + SAP.formatDateTime(state.fetchedAt) +
          (state.demo ? ' — données simulées' : ' — données en direct');
      }
    },

    severityLabel: function (s) {
      return s === 'grave' ? 'Inondation grave' : s === 'moderee' ? 'Inondation modérée' : 'Eau montante';
    },
    severityLevelId: function (s) {
      return s === 'grave' ? 'rouge' : s === 'moderee' ? 'orange' : 'jaune';
    },

    zoneNames: function (ids) {
      return ids.map(id => (SAP.zoneById(id) || { name: id }).name).join(', ');
    },
  };
})();
