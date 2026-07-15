/* SAP Conakry — adaptateurs de données.
   - weather : Open-Meteo Forecast (pluie horaire/quotidienne, humidité du sol)
   - flood   : Open-Meteo Flood API (débit de rivière GloFAS), optionnel
   - sample  : générateur déterministe de secours (hors ligne / API en panne)
   SAP.loadData() orchestre : météo en direct sinon repli complet sur `sample`,
   débit en « meilleur effort » (le modèle fonctionne sans). */
var SAP = (typeof window !== 'undefined')
  ? (window.SAP = window.SAP || {})
  : (globalThis.SAP = globalThis.SAP || {});

(function () {
  'use strict';

  function fetchOpts() {
    const opts = {};
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) opts.signal = AbortSignal.timeout(15000);
    return opts;
  }

  function asArray(json) { return Array.isArray(json) ? json : [json]; }

  function normalizeWeather(raw) {
    const hourly = raw.hourly || {};
    const daily = raw.daily || {};
    return {
      hourlyTime: hourly.time || [],
      precip: (hourly.precipitation || []).map(v => v == null ? 0 : v),
      prob: (hourly.precipitation_probability || []).map(v => v == null ? 0 : v),
      soil: hourly.soil_moisture_0_to_1cm || [],
      dailyTime: daily.time || [],
      dailySum: (daily.precipitation_sum || []).map(v => v == null ? 0 : v),
      dailyProbMax: (daily.precipitation_probability_max || []).map(v => v == null ? 0 : v),
    };
  }

  function normalizeFlood(raw) {
    const daily = raw.daily || {};
    return {
      time: daily.time || [],
      discharge: daily.river_discharge || [],
    };
  }

  SAP.adapters = {
    /* Prévisions météo par centroïde de commune (une seule requête multi-points). */
    weather: async function () {
      const cfg = SAP.CONFIG;
      const params = new URLSearchParams({
        latitude: SAP.ZONES.map(z => z.lat).join(','),
        longitude: SAP.ZONES.map(z => z.lon).join(','),
        hourly: cfg.api.hourly.join(','),
        daily: cfg.api.daily.join(','),
        past_days: String(cfg.api.pastDays),
        forecast_days: String(cfg.api.forecastDays),
        timezone: cfg.city.timezone,
      });
      const res = await fetch(cfg.api.forecast + '?' + params, fetchOpts());
      if (!res.ok) throw new Error('Open-Meteo forecast HTTP ' + res.status);
      return asArray(await res.json()).map(normalizeWeather);
    },

    /* Débit de rivière (GloFAS). Renvoie une série par zone ; certaines
       coordonnées côtières ne donnent rien d'exploitable — le moteur de
       risque le détecte (SAP.floodUsable) et s'en passe. */
    flood: async function () {
      const cfg = SAP.CONFIG;
      const params = new URLSearchParams({
        latitude: SAP.ZONES.map(z => z.lat).join(','),
        longitude: SAP.ZONES.map(z => z.lon).join(','),
        daily: 'river_discharge',
        past_days: String(cfg.api.floodPastDays),
        forecast_days: String(cfg.api.floodForecastDays),
        timezone: cfg.city.timezone,
      });
      const res = await fetch(cfg.api.flood + '?' + params, fetchOpts());
      if (!res.ok) throw new Error('Open-Meteo flood HTTP ' + res.status);
      return asArray(await res.json()).map(normalizeFlood);
    },

    /* Données simulées, déterministes (mêmes valeurs à chaque exécution)
       pour démonstration hors ligne et tests. */
    sample: function () {
      const cfg = SAP.CONFIG;
      const totalDays = cfg.api.pastDays + cfg.api.forecastDays;
      const now = SAP.nowInConakry();
      const start = new Date(now.slice(0, 10) + 'T00:00:00Z');
      start.setUTCDate(start.getUTCDate() - cfg.api.pastDays);

      function mulberry32(seed) {
        return function () {
          seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      const weather = SAP.ZONES.map(function (z, zi) {
        const rand = mulberry32(1234 + zi * 97);
        const w = { hourlyTime: [], precip: [], prob: [], soil: [], dailyTime: [], dailySum: [], dailyProbMax: [] };
        let soilLevel = 0.24;
        for (let d = 0; d < totalDays; d++) {
          const day = new Date(start); day.setUTCDate(day.getUTCDate() + d);
          const dayIso = day.toISOString().slice(0, 10);
          w.dailyTime.push(dayIso);
          const wet = rand() < 0.65;
          const intensity = wet ? (rand() < 0.3 ? 90 : 35) : 4;
          let sum = 0, probMax = 0;
          for (let h = 0; h < 24; h++) {
            w.hourlyTime.push(dayIso + 'T' + String(h).padStart(2, '0') + ':00');
            const diurnal = (h >= 15 && h <= 21) || h <= 6 ? 1 : 0.35; // pluies de mousson : nuit et fin d'après-midi
            const burst = rand() < 0.28 * diurnal ? rand() * intensity / 4 : 0;
            const mm = Math.round(burst * 10) / 10;
            w.precip.push(mm); sum += mm;
            const p = mm > 0 ? 70 + Math.round(rand() * 30) : Math.round(rand() * 45);
            w.prob.push(p); probMax = Math.max(probMax, p);
            soilLevel = Math.min(0.44, Math.max(0.14, soilLevel + mm / 300 - 0.0012));
            w.soil.push(Math.round(soilLevel * 1000) / 1000);
          }
          w.dailySum.push(Math.round(sum * 10) / 10);
          w.dailyProbMax.push(probMax);
        }
        return w;
      });

      // Débit simulé : base stable + crue corrélée aux jours pluvieux.
      const floodStart = new Date(now.slice(0, 10) + 'T00:00:00Z');
      floodStart.setUTCDate(floodStart.getUTCDate() - cfg.api.floodPastDays);
      const flood = SAP.ZONES.map(function (z, zi) {
        const rand = mulberry32(4321 + zi * 53);
        const f = { time: [], discharge: [] };
        let q = 8;
        for (let d = 0; d < cfg.api.floodPastDays + cfg.api.floodForecastDays; d++) {
          const day = new Date(floodStart); day.setUTCDate(day.getUTCDate() + d);
          f.time.push(day.toISOString().slice(0, 10));
          q = Math.max(4, q + (rand() - 0.45) * 4);
          if (rand() < 0.12) q += 10 + rand() * 15; // épisode de crue
          f.discharge.push(Math.round(q * 10) / 10);
        }
        return f;
      });

      return { source: 'sample', fetchedAt: now, weather, flood };
    },
  };

  /* Charge météo (obligatoire) + débit (optionnel).
     source: 'live' | 'sample'. flood peut être null en mode live. */
  SAP.loadData = async function () {
    let weather;
    try {
      weather = await SAP.adapters.weather();
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('SAP: API météo injoignable, données simulées.', err && err.message);
      return SAP.adapters.sample();
    }
    let flood = null;
    try {
      flood = await SAP.adapters.flood();
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('SAP: API débit (flood) injoignable, modèle sans débit.', err && err.message);
    }
    return { source: 'live', fetchedAt: SAP.nowInConakry(), weather, flood };
  };
})();

if (typeof module !== 'undefined') module.exports = SAP;
