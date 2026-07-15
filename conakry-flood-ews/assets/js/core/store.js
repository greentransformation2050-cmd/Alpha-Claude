/* SAP Conakry — persistance locale (localStorage) : signalements, alertes,
   inscriptions, décisions officielles (overrides), préférences.
   Point d'intégration unique à remplacer par un backend en production
   (README § Production roadmap). Sous Node (tests), utilise une Map mémoire. */
var SAP = (typeof window !== 'undefined')
  ? (window.SAP = window.SAP || {})
  : (globalThis.SAP = globalThis.SAP || {});

(function () {
  'use strict';

  const KEYS = {
    reports: 'sap.reports',
    subscribers: 'sap.subscribers',
    commune: 'sap.commune',
    alerts: 'sap.alerts',
    overrides: 'sap.overrides',
  };

  const memory = new Map();
  const hasLocal = (function () {
    try { return typeof localStorage !== 'undefined' && !!localStorage; } catch (e) { return false; }
  })();

  function read(key, fallback) {
    try {
      const raw = hasLocal ? localStorage.getItem(key) : memory.get(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (hasLocal) localStorage.setItem(key, raw); else memory.set(key, raw);
    } catch (e) { /* stockage indisponible : on continue en mémoire */ memory.set(key, raw); }
  }

  SAP.store = {
    /* --- Signalements citoyens (IncidentReport) --- */
    getReports: function () { return read(KEYS.reports, []); },
    addReport: function (report) {
      const reports = read(KEYS.reports, []);
      report.id = 'r' + Date.now() + Math.floor(Math.random() * 1000);
      report.at = SAP.nowInConakry();
      report.validation = 'en_attente'; // en_attente | valide | rejete
      report.photo = report.photo || null; // emplacement réservé (v2)
      reports.unshift(report);
      write(KEYS.reports, reports.slice(0, 500));
      return report;
    },
    updateReport: function (id, patch) {
      const reports = read(KEYS.reports, []);
      const r = reports.find(x => x.id === id);
      if (!r) return null;
      Object.assign(r, patch);
      write(KEYS.reports, reports);
      return r;
    },

    /* --- Alertes --- */
    getAlerts: function () { return read(KEYS.alerts, []); },
    saveAlert: function (alert) {
      const alerts = read(KEYS.alerts, []);
      const idx = alerts.findIndex(a => a.id === alert.id);
      if (idx === -1) alerts.unshift(alert); else alerts[idx] = alert;
      write(KEYS.alerts, alerts.slice(0, 200));
      return alert;
    },
    getPublishedAlerts: function () {
      return read(KEYS.alerts, []).filter(a => a.status === 'publiee');
    },

    /* --- Inscriptions aux alertes --- */
    getSubscribers: function () { return read(KEYS.subscribers, []); },
    addSubscriber: function (sub) {
      const subs = read(KEYS.subscribers, []);
      sub.at = SAP.nowInConakry();
      subs.push(sub);
      write(KEYS.subscribers, subs);
      return sub;
    },

    /* --- Décisions officielles par zone (override du modèle) --- */
    getOverrides: function () { return read(KEYS.overrides, {}); },
    setOverride: function (zoneId, override) {
      const o = read(KEYS.overrides, {});
      if (override) {
        override.at = SAP.nowInConakry();
        o[zoneId] = override;
      } else {
        delete o[zoneId];
      }
      write(KEYS.overrides, o);
      return o;
    },

    /* --- Préférences --- */
    getCommune: function () { return read(KEYS.commune, 'ratoma'); },
    setCommune: function (id) { write(KEYS.commune, id); },
  };
})();

if (typeof module !== 'undefined') module.exports = SAP;
