/* SAP Conakry — cycle de vie des alertes.
   Alert : { id, level, affectedZones[], title, message{inapp,sms,whatsapp},
             channelTargets[], status, createdAt, approvedAt, publishedAt,
             delivery[] }
   États : brouillon → approuvée → publiée (+ annulée depuis brouillon/approuvée).
   L'envoi est SIMULÉ dans ce prototype : aucun SMS/WhatsApp réel ne part
   (voir README § Production roadmap pour le branchement d'une passerelle). */
var SAP = (typeof window !== 'undefined')
  ? (window.SAP = window.SAP || {})
  : (globalThis.SAP = globalThis.SAP || {});

(function () {
  'use strict';

  const STATUS = { DRAFT: 'brouillon', APPROVED: 'approuvee', PUBLISHED: 'publiee', CANCELLED: 'annulee' };

  const TRANSITIONS = {
    brouillon: ['approuvee', 'annulee'],
    approuvee: ['publiee', 'annulee'],
    publiee: [],
    annulee: [],
  };

  const STATUS_LABELS = {
    brouillon: 'Brouillon',
    approuvee: 'Approuvée',
    publiee: 'Publiée',
    annulee: 'Annulée',
  };

  function render(template, ctx) {
    return template.replace(/\{(\w+)\}/g, (m, key) =>
      Object.prototype.hasOwnProperty.call(ctx, key) ? String(ctx[key]) : m);
  }

  /* Génère les messages français pour un niveau + des zones données.
     data (optionnel) : { mm } pluie prévue 24 h max sur les zones. */
  function buildMessages(levelId, zoneIds, data) {
    const level = SAP.levelById(levelId);
    if (!level) throw new Error('Niveau inconnu : ' + levelId);
    const zoneNames = zoneIds
      .map(id => (SAP.zoneById(id) || { name: id }).name)
      .join(', ');
    const ctx = {
      level: level.name,
      LEVEL: SAP.stripAccents(level.name).toUpperCase(),
      title: level.title,
      zones: zoneNames,
      advice: level.advice,
      shortAdvice: level.shortAdvice,
      mm: data && data.mm != null ? data.mm : '—',
      date: SAP.formatDateTime(SAP.nowInConakry()),
    };
    return {
      inappTitle: render(SAP.TEMPLATES.inappTitle, ctx),
      inapp: render(SAP.TEMPLATES.inapp, ctx),
      sms: SAP.stripAccents(render(SAP.TEMPLATES.sms, Object.assign({}, ctx, { zones: SAP.stripAccents(zoneNames) }))),
      whatsapp: render(SAP.TEMPLATES.whatsapp, ctx),
    };
  }

  SAP.alerts = {
    STATUS: STATUS,
    STATUS_LABELS: STATUS_LABELS,
    CHANNELS: ['inapp', 'sms', 'whatsapp'],
    CHANNEL_LABELS: { inapp: 'Application', sms: 'SMS', whatsapp: 'WhatsApp' },

    buildMessages: buildMessages,

    /* Crée un brouillon d'alerte. */
    draft: function (opts) {
      const zones = opts.zones && opts.zones.length ? opts.zones : SAP.ZONES.map(z => z.id);
      const channels = opts.channels && opts.channels.length ? opts.channels : ['inapp'];
      const msg = buildMessages(opts.level, zones, opts.data);
      return {
        id: 'a' + Date.now() + Math.floor(Math.random() * 1000),
        level: opts.level,
        affectedZones: zones,
        title: opts.title || msg.inappTitle,
        message: {
          inapp: opts.messageInapp || msg.inapp,
          sms: opts.messageSms || msg.sms,
          whatsapp: opts.messageWhatsapp || msg.whatsapp,
        },
        channelTargets: channels,
        status: STATUS.DRAFT,
        createdAt: SAP.nowInConakry(),
        approvedAt: null,
        publishedAt: null,
        delivery: null,
      };
    },

    canTransition: function (from, to) {
      return (TRANSITIONS[from] || []).indexOf(to) !== -1;
    },

    /* Applique une transition d'état ; lève une erreur si elle est interdite. */
    transition: function (alert, to) {
      if (!SAP.alerts.canTransition(alert.status, to)) {
        throw new Error('Transition interdite : ' + alert.status + ' → ' + to);
      }
      alert.status = to;
      if (to === STATUS.APPROVED) alert.approvedAt = SAP.nowInConakry();
      if (to === STATUS.PUBLISHED) alert.publishedAt = SAP.nowInConakry();
      return alert;
    },

    /* Publication : SIMULE la diffusion sur chaque canal ciblé.
       subscribers : liste des inscrits (pour compter les destinataires). */
    publish: function (alert, subscribers) {
      SAP.alerts.transition(alert, STATUS.PUBLISHED);
      const subs = subscribers || [];
      alert.delivery = alert.channelTargets.map(function (ch) {
        const targets = ch === 'inapp'
          ? null // affichée à tous les utilisateurs de l'application
          : subs.filter(s => s.channel === (ch === 'sms' ? 'sms' : 'whatsapp') &&
              alert.affectedZones.indexOf(s.commune) !== -1).length;
        return {
          channel: ch,
          targets: targets,
          status: 'envoyé (simulé)',
          at: alert.publishedAt,
        };
      });
      return alert;
    },
  };
})();

if (typeof module !== 'undefined') module.exports = SAP;
