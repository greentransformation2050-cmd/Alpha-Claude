/* SAP Conakry — rédaction, approbation et publication (simulée) des alertes. */
(function () {
  'use strict';

  let state = null;
  const $ = sel => document.querySelector(sel);
  const esc = SAP.ui.esc;

  function selectedZones() {
    return Array.from(document.querySelectorAll('#draft-zones input:checked')).map(i => i.value);
  }
  function selectedChannels() {
    return Array.from(document.querySelectorAll('#draft-channels input:checked')).map(i => i.value);
  }

  /* Pluie 24 h max sur les zones sélectionnées (pré-remplit {mm}). */
  function mmForZones(zoneIds) {
    if (!state) return null;
    const zs = state.zones.filter(z => zoneIds.indexOf(z.id) !== -1);
    return zs.length ? Math.max(...zs.map(z => z.metrics.next24)) : null;
  }

  function updateSmsCount() {
    const len = $('#msg-sms').value.length;
    $('#sms-count').textContent = len + ' caractères (' + Math.max(1, Math.ceil(len / 160)) + ' segment' + (len > 160 ? 's' : '') + ')';
  }

  function generateMessages() {
    const zones = selectedZones();
    if (!zones.length) { $('#draft-msg').textContent = 'Sélectionnez au moins une commune.'; return; }
    const msg = SAP.alerts.buildMessages($('#draft-level').value, zones, { mm: mmForZones(zones) });
    $('#msg-inapp').value = msg.inapp;
    $('#msg-sms').value = msg.sms;
    $('#msg-whatsapp').value = msg.whatsapp;
    $('#draft-preview').hidden = false;
    $('#draft-msg').textContent = '';
    updateSmsCount();
  }

  function renderAlerts() {
    const alerts = SAP.store.getAlerts();
    $('#alert-list').innerHTML = alerts.length ? alerts.map(function (a) {
      const level = SAP.levelById(a.level) || SAP.LEVELS[0];
      const S = SAP.alerts.STATUS;
      const actions = [];
      if (SAP.alerts.canTransition(a.status, S.APPROVED)) {
        actions.push('<button class="small primary act" data-id="' + a.id + '" data-to="' + S.APPROVED + '">Approuver</button>');
      }
      if (SAP.alerts.canTransition(a.status, S.PUBLISHED)) {
        actions.push('<button class="small primary act" data-id="' + a.id + '" data-to="' + S.PUBLISHED + '">Publier</button>');
      }
      if (SAP.alerts.canTransition(a.status, S.CANCELLED)) {
        actions.push('<button class="small danger act" data-id="' + a.id + '" data-to="' + S.CANCELLED + '">Annuler</button>');
      }
      const delivery = (a.delivery || []).map(d =>
        SAP.alerts.CHANNEL_LABELS[d.channel] + ' : ' +
        (d.targets == null ? 'tous les utilisateurs' : d.targets + ' destinataire(s)') +
        ' — ' + d.status).join(' · ');

      return '<div class="alert-item">' +
        '<div class="head">' + SAP.ui.levelBadge(level) +
          '<span class="title">' + esc(a.title) + '</span>' +
          SAP.ui.statusChip(a.status) + '</div>' +
        '<div class="when">Créée : ' + SAP.formatDateTime(a.createdAt) +
          (a.approvedAt ? ' · Approuvée : ' + SAP.formatDateTime(a.approvedAt) : '') +
          (a.publishedAt ? ' · Publiée : ' + SAP.formatDateTime(a.publishedAt) : '') +
          ' · Zones : ' + esc(SAP.ui.zoneNames(a.affectedZones)) +
          ' · Canaux : ' + a.channelTargets.map(c => SAP.alerts.CHANNEL_LABELS[c]).join(', ') + '</div>' +
        (delivery ? '<div class="delivery">📤 ' + esc(delivery) + '</div>' : '') +
        '<details><summary>Voir les messages</summary>' +
          '<pre>' + esc(a.message.inapp) + '</pre>' +
          '<pre>SMS : ' + esc(a.message.sms) + '</pre>' +
          '<pre>WhatsApp : ' + esc(a.message.whatsapp) + '</pre>' +
        '</details>' +
        (actions.length ? '<div class="actions">' + actions.join('') + '</div>' : '') +
        '</div>';
    }).join('') : '<p class="empty">Aucune alerte. Créez un brouillon ci-dessus.</p>';

    document.querySelectorAll('.act').forEach(btn => btn.addEventListener('click', function () {
      const alerts = SAP.store.getAlerts();
      const alert = alerts.find(x => x.id === btn.dataset.id);
      if (!alert) return;
      try {
        if (btn.dataset.to === SAP.alerts.STATUS.PUBLISHED) {
          SAP.alerts.publish(alert, SAP.store.getSubscribers());
        } else {
          SAP.alerts.transition(alert, btn.dataset.to);
        }
        SAP.store.saveAlert(alert);
        renderAlerts();
      } catch (e) {
        window.alert(e.message);
      }
    }));
  }

  document.addEventListener('DOMContentLoaded', async function () {
    $('#draft-level').innerHTML = SAP.LEVELS.map(l =>
      '<option value="' + l.id + '"' + (l.id === 'orange' ? ' selected' : '') + '>' + l.icon + ' ' + l.name + ' — ' + l.title + '</option>'
    ).join('');
    $('#draft-zones').innerHTML = SAP.ZONES.map(z =>
      '<label><input type="checkbox" value="' + z.id + '" checked> ' + esc(z.name) + '</label>'
    ).join('');

    $('#gen-messages').addEventListener('click', generateMessages);
    $('#msg-sms').addEventListener('input', updateSmsCount);

    $('#draft-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      const zones = selectedZones();
      if (!zones.length) { $('#draft-msg').textContent = 'Sélectionnez au moins une commune.'; return; }
      if ($('#draft-preview').hidden) generateMessages();
      const alert = SAP.alerts.draft({
        level: $('#draft-level').value,
        zones: zones,
        channels: selectedChannels(),
        data: { mm: mmForZones(zones) },
        messageInapp: $('#msg-inapp').value,
        messageSms: $('#msg-sms').value,
        messageWhatsapp: $('#msg-whatsapp').value,
      });
      SAP.store.saveAlert(alert);
      $('#draft-msg').textContent = '✓ Brouillon enregistré. Approuvez-le puis publiez-le ci-dessous.';
      $('#draft-preview').hidden = true;
      renderAlerts();
    });

    renderAlerts();

    state = SAP.assess(await SAP.loadData(), SAP.store.getOverrides());
    SAP.ui.setDemoBanner(state);
    SAP.ui.setUpdatedAt(state);
  });
})();
