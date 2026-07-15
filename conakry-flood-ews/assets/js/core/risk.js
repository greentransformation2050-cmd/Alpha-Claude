/* SAP Conakry — moteur de risque.
   Transforme les données (météo + débit) en RiskZone :
   { id, name, centroid, riskLevel, score, confidence, drivers, updatedAt }
   avec prise en compte d'une décision officielle manuelle (override).
   Modèle et seuils : assets/js/core/config.js + README § Risk model. */
var SAP = (typeof window !== 'undefined')
  ? (window.SAP = window.SAP || {})
  : (globalThis.SAP = globalThis.SAP || {});

(function () {
  'use strict';

  function sum(arr, from, to) {
    let s = 0;
    for (let i = Math.max(0, from); i < Math.min(arr.length, to); i++) s += arr[i] || 0;
    return s;
  }

  function round1(v) { return Math.round(v * 10) / 10; }

  function nowIndex(hourlyTime, now) {
    for (let i = hourlyTime.length - 1; i >= 0; i--) {
      if (hourlyTime[i] <= now) return i;
    }
    return 0;
  }

  /* Une série de débit est exploitable si elle contient des valeurs
     numériques non nulles (les centroïdes côtiers renvoient souvent 0/null). */
  SAP.floodUsable = function (floodSeries) {
    if (!floodSeries || !Array.isArray(floodSeries.discharge)) return false;
    const vals = floodSeries.discharge.filter(v => typeof v === 'number' && isFinite(v));
    if (vals.length < 10) return false;
    return vals.some(v => v > 0.1);
  };

  /* Anomalie de débit : max prévu / référence (moyenne de la période passée). */
  function dischargeRatio(flood, todayIso) {
    const split = flood.time.findIndex(t => t >= todayIso);
    const past = flood.discharge.slice(0, split < 0 ? flood.discharge.length : split).filter(v => v != null);
    const future = flood.discharge.slice(split < 0 ? 0 : split).filter(v => v != null);
    if (!past.length || !future.length) return null;
    const ref = past.reduce((a, b) => a + b, 0) / past.length;
    if (!(ref > 0)) return null;
    return Math.max(...future) / ref;
  }

  function assessZone(weather, flood, zone, now, source, override) {
    const m = SAP.CONFIG.model;
    const i = nowIndex(weather.hourlyTime, now);
    const todayIso = now.slice(0, 10);

    const past48 = round1(sum(weather.precip, i - 48, i));
    const next24 = round1(sum(weather.precip, i, i + 24));
    const next72 = round1(sum(weather.precip, i, i + 72));

    const drivers = [];
    let confidence = source === 'sample' ? 1 : 3; // 3 haute, 2 moyenne, 1 faible

    // Humidité du sol : moyenne des 6 prochaines heures ; sinon estimation.
    const soilVals = (weather.soil || []).slice(i, i + 6).filter(v => v != null);
    let soilNow;
    if (soilVals.length) {
      soilNow = soilVals.reduce((a, b) => a + b, 0) / soilVals.length;
    } else {
      soilNow = Math.min(0.45, 0.15 + past48 / 500);
      confidence -= 1;
    }

    // Débit de rivière (optionnel).
    let ratio = null;
    const usable = SAP.floodUsable(flood);
    if (usable) ratio = dischargeRatio(flood, todayIso);
    if (ratio == null) confidence -= 1;

    // Contributions pondérées ; sans débit exploitable, son poids est
    // redistribué proportionnellement sur les autres facteurs.
    const w = Object.assign({}, m.weights);
    if (ratio == null) {
      const scale = 1 / (1 - w.discharge);
      w.next24 *= scale; w.past48 *= scale; w.soil *= scale; w.discharge = 0;
    }

    const parts = [
      { key: 'rain24', label: 'Pluie prévue (24 h)', value: next24 + ' mm', frac: Math.min(next24 / m.next24Norm, 1), weight: w.next24 },
      { key: 'rain48', label: 'Pluie tombée (48 h)', value: past48 + ' mm', frac: Math.min(past48 / m.past48Norm, 1), weight: w.past48 },
      { key: 'soil', label: 'Saturation du sol', value: Math.round(soilNow * 100) / 100 + ' m³/m³', frac: Math.min(soilNow / m.soilNorm, 1), weight: w.soil },
    ];
    if (ratio != null) {
      parts.push({ key: 'discharge', label: 'Débit de rivière (GloFAS)', value: '×' + (Math.round(ratio * 10) / 10) + ' vs référence 30 j', frac: Math.min(Math.max(ratio - 1, 0) / (m.dischargeRatioNorm - 1), 1), weight: w.discharge });
    }

    const base = parts.reduce((s, p) => s + p.weight * p.frac, 0);
    const multiplier = zone.exposure * zone.drainage;
    const score = Math.round(100 * Math.min(1, base * multiplier));

    for (const p of parts) {
      drivers.push({ key: p.key, label: p.label, value: p.value, contribution: Math.round(100 * p.weight * p.frac) });
    }
    drivers.push({
      key: 'zone', label: 'Exposition et drainage de la zone',
      value: '×' + (Math.round(multiplier * 100) / 100) + ' (valeur prototype)',
      contribution: null,
    });
    if (ratio == null) {
      drivers.push({ key: 'no-discharge', label: 'Débit de rivière', value: usable ? 'référence indisponible' : 'non exploitable ici — facteur ignoré', contribution: null });
    }

    const computedLevel = SAP.levelForScore(score);
    let level = computedLevel;
    let confidenceLabel = { 3: 'haute', 2: 'moyenne', 1: 'faible' }[Math.max(1, confidence)];

    // Décision officielle manuelle : prime sur le modèle.
    if (override && SAP.levelById(override.level)) {
      level = SAP.levelById(override.level);
      confidenceLabel = 'officielle';
      drivers.unshift({
        key: 'override', label: 'Décision officielle',
        value: 'niveau ' + level.name + (override.reason ? ' — ' + override.reason : ''),
        contribution: null,
      });
    }

    // Pic de pluie sur 48 h (pour l'affichage).
    let peakIdx = i, peakMm = 0;
    for (let h = i; h < Math.min(weather.precip.length, i + 48); h++) {
      if (weather.precip[h] > peakMm) { peakMm = weather.precip[h]; peakIdx = h; }
    }

    return {
      id: zone.id,
      name: zone.name,
      centroid: { lat: zone.lat, lon: zone.lon },
      riskLevel: level.id,
      level: level,
      computedLevel: computedLevel,
      score: score,
      confidence: confidenceLabel,
      drivers: drivers,
      updatedAt: now,
      override: override || null,
      metrics: {
        next24, past48, next72,
        soilNow: Math.round(soilNow * 100) / 100,
        dischargeRatio: ratio == null ? null : Math.round(ratio * 10) / 10,
        peak: peakMm > 0 ? { time: weather.hourlyTime[peakIdx], mm: round1(peakMm) } : null,
      },
      weather: weather,
      nowIdx: i,
      zone: zone,
    };
  }

  /* Évalue toutes les zones + synthèse ville.
     data: résultat de SAP.loadData() ; overrides: { zoneId: {level, reason, by, at} } */
  SAP.assess = function (data, overrides) {
    overrides = overrides || {};
    const now = SAP.nowInConakry();
    const zones = SAP.ZONES.map((z, i) => assessZone(
      data.weather[i],
      data.flood ? data.flood[i] : null,
      z, now, data.source, overrides[z.id]
    ));

    const order = SAP.LEVELS.map(l => l.id);
    let worst = zones[0];
    for (const z of zones) {
      const a = order.indexOf(z.riskLevel), b = order.indexOf(worst.riskLevel);
      if (a > b || (a === b && z.score > worst.score)) worst = z;
    }

    return {
      source: data.source,
      demo: data.source === 'sample',
      fetchedAt: data.fetchedAt,
      now: now,
      zones: zones,
      city: {
        level: worst.level,
        riskLevel: worst.riskLevel,
        score: worst.score,
        worstZone: worst,
        next24max: Math.max(...zones.map(z => z.metrics.next24)),
        past48max: Math.max(...zones.map(z => z.metrics.past48)),
        soilMax: Math.max(...zones.map(z => z.metrics.soilNow)),
        floodUsableCount: zones.filter(z => z.metrics.dischargeRatio != null).length,
      },
    };
  };
})();

if (typeof module !== 'undefined') module.exports = SAP;
