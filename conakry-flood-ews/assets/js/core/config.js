/* SAP Conakry — configuration : zones, points sensibles, niveaux d'alerte,
   seuils du modèle de risque et gabarits de messages.
   Fonctionne dans le navigateur (window.SAP) et sous Node (tests). */
var SAP = (typeof window !== 'undefined')
  ? (window.SAP = window.SAP || {})
  : (globalThis.SAP = globalThis.SAP || {});

SAP.CONFIG = {
  city: { name: 'Conakry', timezone: 'Africa/Conakry' },
  refreshMinutes: 30,
  api: {
    forecast: 'https://api.open-meteo.com/v1/forecast',
    flood: 'https://flood-api.open-meteo.com/v1/flood',
    hourly: ['precipitation', 'precipitation_probability', 'soil_moisture_0_to_1cm'],
    daily: ['precipitation_sum', 'precipitation_probability_max'],
    pastDays: 2,
    forecastDays: 7,
    floodPastDays: 31,   // référence de débit pour détecter une anomalie
    floodForecastDays: 7,
  },
  /* Flux supplémentaires à brancher quand l'accès est obtenu (voir
     SAP.SOURCES et README § Data sources). Vides par défaut. */
  feeds: {
    /* URLs de flux CAP (Common Alerting Protocol) officiels — ex. alertes de
       l'ANM (Agence Nationale de la Météorologie). Dès qu'une URL est
       renseignée, les alertes officielles apparaissent sur le tableau de bord. */
    capFeeds: [],
    /* Point d'accès FANFAR (prévision hydrologique ouest-africaine, projet
       SMHI/HYPE) — nécessite un compte : https://fanfar.eu */
    fanfarUrl: '',
  },
  /* Modèle de risque — VALEURS DE PROTOTYPE, configurables, à faire valider
     par la Météorologie nationale, l'hydrologie, la protection civile et les
     communes avant tout usage opérationnel (voir README § Assumptions).
     Calibrées sur le régime de mousson de Conakry (des cumuls > 100 mm/24 h
     sont le déclencheur classique des inondations urbaines). */
  model: {
    next24Norm: 120,        // mm prévus sur 24 h  => contribution saturée
    past48Norm: 160,        // mm tombés sur 48 h  => sols saturés
    soilNorm: 0.40,         // m³/m³              => saturation de surface
    dischargeRatioNorm: 3,  // débit prévu / débit de référence => anomalie forte
    weights: { next24: 0.45, past48: 0.25, soil: 0.15, discharge: 0.15 },
  },
};

/* Niveaux d'alerte. La couleur ne porte jamais seule le sens : toujours
   icône + libellé. `shortAdvice` : version courte sans accents pour SMS. */
SAP.LEVELS = [
  {
    id: 'vert', name: 'Vert', title: 'Situation normale', icon: '✓', min: 0,
    advice: "Pas de risque particulier. Restez attentif aux bulletins pendant la saison des pluies (juin–septembre).",
    shortAdvice: 'Situation normale. Restez informe.',
    guidance: [
      'Dégagez les caniveaux et rigoles autour de votre habitation.',
      "Repérez le point haut le plus proche et le chemin pour y aller.",
      "Gardez papiers, argent et médicaments dans un sac étanche.",
    ],
  },
  {
    id: 'jaune', name: 'Jaune', title: 'Vigilance', icon: '⚠️', min: 25,
    advice: "Pluies significatives attendues. Dégagez les caniveaux autour de chez vous, protégez vos documents importants et suivez les bulletins.",
    shortAdvice: 'Pluies fortes attendues. Degagez les caniveaux, suivez les bulletins.',
    guidance: [
      'Suivez les bulletins toutes les 6 heures.',
      'Dégagez les caniveaux et surélevez les biens sensibles.',
      "Évitez de laisser les enfants jouer près des rigoles et des berges.",
      'Chargez votre téléphone et préparez une lampe.',
    ],
  },
  {
    id: 'orange', name: 'Orange', title: 'Alerte', icon: '⚠️', min: 50,
    advice: "Risque d'inondation élevé. Évitez les zones basses et les traversées d'eau, surélevez vos biens, préparez une évacuation éventuelle.",
    shortAdvice: "Risque d'inondation eleve. Evitez les zones basses, preparez une evacuation.",
    guidance: [
      "Évitez les zones basses et ne traversez jamais une eau en mouvement.",
      'Surélevez biens, réserves et documents ; préparez un sac d’évacuation.',
      'Identifiez maintenant votre lieu de repli (école, mosquée, église, parent sur un point haut).',
      'Aidez les personnes âgées, malades ou isolées de votre concession.',
    ],
  },
  {
    id: 'rouge', name: 'Rouge', title: 'Alerte maximale', icon: '⛔', min: 75,
    advice: "Inondations probables ou en cours. Rejoignez un point haut, n'entrez jamais dans une eau en mouvement, suivez les consignes des autorités (ANGUCH, protection civile).",
    shortAdvice: 'Inondations probables ou en cours. Rejoignez un point haut. Urgences 18/117.',
    guidance: [
      'Rejoignez immédiatement un point haut avec votre famille.',
      "N'entrez jamais dans une eau en mouvement, même peu profonde.",
      "Coupez l'électricité si l'eau entre dans la maison.",
      'Suivez les consignes des autorités et signalez les personnes en danger (18 / 117).',
    ],
  },
];

/* Zones : les cinq communes de Conakry.
   `exposure` (population/biens en zone inondable) et `drainage` (sensibilité
   du réseau d'évacuation) sont des multiplicateurs PROTOTYPES à réviser avec
   les autorités locales. */
SAP.ZONES = [
  {
    id: 'kaloum', name: 'Kaloum', lat: 9.5095, lon: -13.7122, pop: 65000,
    exposure: 1.05, drainage: 1.05,
    notes: 'Presqu’île basse, submersion côtière possible à marée haute.',
  },
  {
    id: 'dixinn', name: 'Dixinn', lat: 9.547, lon: -13.6785, pop: 150000,
    exposure: 1.0, drainage: 1.0,
    notes: 'Front de mer de Camayenne, quartiers universitaires.',
  },
  {
    id: 'matam', name: 'Matam', lat: 9.5375, lon: -13.6533, pop: 148000,
    exposure: 1.0, drainage: 1.05,
    notes: 'Marché de Madina, quartiers denses de Bonfi et Coléah.',
  },
  {
    id: 'ratoma', name: 'Ratoma', lat: 9.6069, lon: -13.626, pop: 700000,
    exposure: 1.05, drainage: 1.15,
    notes: 'Croissance urbaine rapide, ruisseaux urbanisés (Lambanyi, Sonfonia).',
  },
  {
    id: 'matoto', name: 'Matoto', lat: 9.5793, lon: -13.592, pop: 800000,
    exposure: 1.10, drainage: 1.15,
    notes: 'Commune la plus peuplée ; cuvettes de Gbessia et Dabondy.',
  },
];

/* Points sensibles (quartiers régulièrement inondés).
   DONNÉES SIMULÉES : positions et causes indicatives, à remplacer par les
   relevés officiels (ANGUCH / communes) avant usage opérationnel. */
SAP.HOTSPOTS = [
  { id: 'lambanyi', zone: 'ratoma', name: 'Lambanyi', lat: 9.615, lon: -13.632, cause: 'Lit de ruisseau urbanisé, drainage insuffisant', simulated: true },
  { id: 'sonfonia', zone: 'ratoma', name: 'Sonfonia', lat: 9.650, lon: -13.598, cause: 'Zone basse, débordements récurrents', simulated: true },
  { id: 'kaporo', zone: 'ratoma', name: 'Kaporo rails', lat: 9.624, lon: -13.618, cause: 'Caniveaux obstrués le long de la voie', simulated: true },
  { id: 'wanindara', zone: 'ratoma', name: 'Wanindara', lat: 9.638, lon: -13.606, cause: 'Constructions dans les couloirs d’écoulement', simulated: true },
  { id: 'gbessia', zone: 'matoto', name: 'Gbessia', lat: 9.570, lon: -13.607, cause: 'Cuvette proche de l’aéroport, exutoires saturés', simulated: true },
  { id: 'dabondy', zone: 'matoto', name: 'Dabondy', lat: 9.575, lon: -13.622, cause: 'Point bas, réseau d’évacuation sous-dimensionné', simulated: true },
  { id: 'yimbaya', zone: 'matoto', name: 'Yimbaya', lat: 9.590, lon: -13.601, cause: 'Débordement des caniveaux principaux', simulated: true },
  { id: 'bonfi', zone: 'matam', name: 'Bonfi', lat: 9.528, lon: -13.655, cause: 'Quartier côtier bas, refoulement à marée haute', simulated: true },
  { id: 'coleah', zone: 'matam', name: 'Coléah', lat: 9.525, lon: -13.668, cause: 'Drainage vétuste, forte densité', simulated: true },
  { id: 'boulbinet', zone: 'kaloum', name: 'Boulbinet', lat: 9.507, lon: -13.717, cause: 'Submersion côtière, port artisanal', simulated: true },
];

/* Registre des sources de données du système : ce qui est intégré, ce qui
   est prêt à brancher, ce qui demande un accord formel, et ce qui sert à la
   calibration. Affiché sur le tableau de bord pour rester honnête sur ce que
   le système utilise réellement.
   status : integre | pret_a_brancher | acces_a_demander | calibration | reference */
SAP.SOURCES = [
  {
    id: 'open-meteo', name: 'Open-Meteo Forecast + Flood (GloFAS)', status: 'integre',
    role: 'Pluie horaire/quotidienne, humidité du sol, débit de rivière — moteur v1',
    action: 'Actif : adaptateurs weather/flood, repli simulé en cas de panne.',
  },
  {
    id: 'fanfar', name: 'FANFAR — prévision hydrologique ouest-africaine (SMHI/HYPE)', status: 'pret_a_brancher',
    role: 'Prévisions et alertes de crue régionales, conçues pour l’Afrique de l’Ouest',
    action: 'Créer un compte sur fanfar.eu puis renseigner CONFIG.feeds.fanfarUrl.',
  },
  {
    id: 'anm', name: 'ANM Guinée — alertes officielles (CAP)', status: 'pret_a_brancher',
    role: 'Vigilances météo nationales : la référence officielle pour déclencher',
    action: 'Demander le flux CAP à l’ANM puis renseigner CONFIG.feeds.capFeeds ; le parseur CAP est déjà intégré.',
  },
  {
    id: 'imerg', name: 'NASA GPM IMERG — pluie satellite temps quasi réel', status: 'acces_a_demander',
    role: 'Estimation de pluie observée là où il n’y a pas de pluviomètres',
    action: 'Compte Earthdata + traitement backend ; correction de biais (quantile mapping) avec les relevés ANM.',
  },
  {
    id: 'ukceh', name: 'UKCEH Nowcasting — orages à 0–6 h', status: 'acces_a_demander',
    role: 'Prévision immédiate des orages violents en Afrique de l’Ouest',
    action: 'Contacter nowcasting-portal@ceh.ac.uk pour l’accès au flux.',
  },
  {
    id: 'dnh', name: 'DNH / PNUD-FEM — 64 stations hydrologiques télémesurées', status: 'acces_a_demander',
    role: 'Niveaux d’eau en direct sur les cours d’eau guinéens',
    action: 'Contacter la Direction Nationale de l’Hydraulique pour l’accès au réseau réhabilité.',
  },
  {
    id: 'susceptibilite', name: 'Carte SIG de susceptibilité aux inondations de Conakry', status: 'calibration',
    role: 'Altitude, densité de drainage, sols → zones prioritaires validées',
    action: 'Remplacer les multiplicateurs exposure/drainage et les points sensibles simulés par cette couche.',
  },
  {
    id: 'jica', name: 'JICA — niveaux d’eau historiques', status: 'calibration',
    role: 'Niveaux « normaux » et « dangereux » observés par point de mesure',
    action: 'Caler les seuils du modèle (next24Norm, dischargeRatioNorm) sur ces références.',
  },
  {
    id: 'ins', name: 'Statistiques nationales des inondations (INS Guinée)', status: 'calibration',
    role: 'Quartiers touchés et dégâts passés → priorisation des zones',
    action: 'Pondérer l’exposition des communes et prioriser les quartiers d’alerte.',
  },
  {
    id: 'voltalarm', name: 'VOLTALARM / modèles ouverts (HYPE, wflow_sbm, LISFLOOD-FP)', status: 'reference',
    role: 'Méthodes opérationnelles éprouvées dans la sous-région (bassin de la Volta)',
    action: 'Référence méthodologique pour des prévisions propres à 1–10 jours (phase modélisation).',
  },
];

SAP.SOURCE_STATUS_LABELS = {
  integre: 'Intégré',
  pret_a_brancher: 'Prêt à brancher',
  acces_a_demander: 'Accès à demander',
  calibration: 'Calibration',
  reference: 'Référence',
};

/* Gabarits de messages d'alerte (français).
   Le SMS est volontairement sans accents (alphabet GSM-7, segments de 160
   caractères) ; les accents sont retirés au rendu par sécurité. */
SAP.TEMPLATES = {
  sms: 'SAP CONAKRY - ALERTE {LEVEL} : {zones}. {shortAdvice} Pluie prevue 24h : {mm} mm. Urgences : 18 / 117.',
  whatsapp: '🌊 *SAP Conakry — Alerte {level}*\n{title}\n\nCommunes concernées : {zones}\nPluie prévue (24 h) : {mm} mm\n\n{advice}\n\nUrgences : Sapeurs-pompiers 18 · Police secours 117\n_Bulletin du {date} — prochain point dans 6 h ou si la situation change._',
  inappTitle: 'Alerte {level} — {zones}',
  inapp: '{advice}\n\nPluie prévue (24 h) : {mm} mm. Bulletin du {date}.',
};

/* ---------- Utilitaires partagés ---------- */

SAP.levelForScore = function (score) {
  let level = SAP.LEVELS[0];
  for (const l of SAP.LEVELS) if (score >= l.min) level = l;
  return level;
};

SAP.levelById = function (id) {
  return SAP.LEVELS.find(l => l.id === id) || null;
};

SAP.zoneById = function (id) {
  return SAP.ZONES.find(z => z.id === id) || null;
};

/* Horloge de Conakry (GMT) au format "YYYY-MM-DDTHH:MM", comparable
   lexicographiquement aux horodatages Open-Meteo. */
SAP.nowInConakry = function () {
  return new Date().toLocaleString('sv-SE', { timeZone: SAP.CONFIG.city.timezone }).slice(0, 16).replace(' ', 'T');
};

SAP.formatDayShort = function (isoDate) {
  const d = new Date(isoDate + 'T12:00:00Z');
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
};

SAP.formatDateTime = function (iso) {
  const d = new Date(iso.length === 16 ? iso + ':00Z' : iso);
  return d.toLocaleString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  }) + ' (GMT)';
};

SAP.stripAccents = function (s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

SAP.escapeHtml = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
};

if (typeof module !== 'undefined') module.exports = SAP;
