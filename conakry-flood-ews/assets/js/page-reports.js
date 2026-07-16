/* SAP Conakry — réception et validation des signalements citoyens. */
(function () {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const esc = SAP.ui.esc;
  const LABELS = { en_attente: 'À vérifier', valide: 'Validé', rejete: 'Rejeté' };

  function render() {
    const filter = $('#filter').value;
    const reports = SAP.store.getReports().filter(r => filter === 'tous' || r.validation === filter);

    $('#report-list').innerHTML = reports.length ? reports.map(function (r) {
      const actions = r.validation === 'en_attente'
        ? '<div class="actions">' +
            '<button class="small primary val" data-id="' + r.id + '" data-v="valide">Valider</button>' +
            '<button class="small danger val" data-id="' + r.id + '" data-v="rejete">Rejeter</button>' +
          '</div>'
        : '';
      return '<div class="alert-item">' +
        '<div class="head">' +
          '<span class="badge lvl-' + SAP.ui.severityLevelId(r.severity) + '">' + SAP.ui.severityLabel(r.severity) + '</span>' +
          '<span class="title">' + esc(r.communeName) + (r.quartier ? ' — ' + esc(r.quartier) : '') + '</span>' +
          SAP.ui.statusChip(r.validation, LABELS) +
        '</div>' +
        (r.details ? '<div>' + esc(r.details) + '</div>' : '') +
        '<div class="when">Reçu : ' + SAP.formatDateTime(r.at) +
          (r.contact ? ' · Contact : ' + esc(r.contact) : ' · Contact non fourni') +
          ' · Photo : ' + (r.photo ? esc(r.photo) : 'aucune (fonction à venir)') + '</div>' +
        actions +
        '</div>';
    }).join('') : '<p class="empty">Aucun signalement' + (filter !== 'tous' ? ' dans cet état' : '') + '.</p>';

    document.querySelectorAll('.val').forEach(btn => btn.addEventListener('click', function () {
      SAP.store.updateReport(btn.dataset.id, { validation: btn.dataset.v, validatedAt: SAP.nowInConakry() });
      render();
    }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('#filter').addEventListener('change', render);
    render();
  });
})();
