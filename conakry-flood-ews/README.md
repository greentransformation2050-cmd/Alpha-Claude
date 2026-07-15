# SAP Conakry — Flood Early-Warning System / Système d'Alerte Précoce Inondations

An operational-MVP flood early-warning system for **Conakry, Guinea**: one
responsive, French-first web application with two linked experiences — an
**emergency-operations dashboard** and a **public resident app** — sharing a
single risk engine. Live weather/flood data where available, realistic sample
data otherwise, commune-level risk plus clearly-labeled simulated hotspot pins.

## Views / routes

| Route | File | Audience & content |
|---|---|---|
| `/` | `index.html` | **Public resident view** — risk level for *my* commune with plain-language explanation, level-specific safety guidance, published alerts and history, 3-day rain outlook, alert subscription, "report flooding" form |
| `/dashboard` | `dashboard.html` | **Operations dashboard** — citywide risk status, commune + hotspot map, rainfall charts, per-commune scores with confidence, official-override workflow, active alerts, incoming incident reports |
| `/alerts` | `alerts.html` | **Alert drafting & approval** — French message generation (in-app / SMS / WhatsApp), workflow *brouillon → approuvée → publiée*, simulated delivery status |
| `/reports` | `reports.html` | **Incident intake & validation** — citizen reports with *à vérifier / validé / rejeté* states |

No build step, no framework, no API key. Any static host works (GitHub Pages,
Netlify, a machine at ANGUCH…).

## Quick start

```bash
cd conakry-flood-ews
npm run serve          # = python3 -m http.server 8000
# open http://localhost:8000
```

Tests (no dependencies beyond Node 18+; UI tests use Playwright if present):

```bash
npm test               # unit + adapter tests (node --test)
npm run test:ui        # Playwright UI flow tests (skipped if Playwright absent)
```

## Data sources — integrated, ready-to-plug, and planned

The system is honest about what it consumes: `SAP.SOURCES`
(`core/config.js`) is the registry of all ten recommended sources with their
integration status, rendered on the dashboard ("Sources de données"). v1
runs live on Open-Meteo only; everything else is either plumbed and waiting
for access, or scheduled as calibration input.

| # | Source | Status in this app | How it plugs in |
|---|---|---|---|
| 1 | **FANFAR** (West-African flood forecasting, SMHI/HYPE) | **Ready to plug** | Register at fanfar.eu, set `CONFIG.feeds.fanfarUrl`; feeds the discharge factor as a Conakry-relevant replacement/complement to GloFAS |
| 2 | **ANM Guinée** official alerts (CAP) | **Ready to plug** | CAP 1.x parser (`SAP.parseCap`) + feed poller (`SAP.adapters.officialAlerts`) are implemented and tested; set `CONFIG.feeds.capFeeds` when ANM grants a feed — official alerts then appear on the dashboard |
| 3 | **VOLTALARM** + open models (HYPE, wflow_sbm, LISFLOOD-FP) | Reference | Methodological model for building 1–10-day custom forecasts in a later modeling phase |
| 4 | **NASA GPM IMERG** satellite rainfall | Planned (backend) | Requires an Earthdata account and server-side processing; **bias correction (quantile mapping) against ANM ground data is mandatory** before it feeds the risk model |
| 5 | **UKCEH Nowcasting** (0–6 h storms, West Africa) | Access to request | Contact nowcasting-portal@ceh.ac.uk; would power a short-fuse warning tier |
| 6 | **Conakry GIS flood-susceptibility study** | Calibration | Replaces the simulated hotspots and the prototype `exposure`/`drainage` multipliers with validated priority zones (elevation, drainage density, soils) |
| 7 | **JICA historical water levels** | Calibration | Anchors "normal" vs "dangerous" levels; calibrates `next24Norm` / `dischargeRatioNorm` |
| 8 | **DNH / UNDP-GEF 64 telemetered hydro stations** | Access to request | Contact the Direction Nationale de l'Hydraulique; live river levels would become a first-class risk factor |
| 9 | **INS Guinée flood statistics** | Calibration | Past impact by neighborhood → prioritize zones and validate alert thresholds |
| 10 | **Open-Meteo Forecast + Flood (GloFAS)** | **Integrated (v1)** | The current live engine, described below |

Two structural consequences of this plan are already built in: the
**adapter seam** (every source lands as one more adapter behind
`SAP.loadData()` / `officialAlerts()`), and the **official-override
workflow** (until ANM's CAP feed is plugged, an ANM instruction received by
phone/bulletin is entered as a *décision officielle*, which outranks the
model).

## Data architecture

Adapters behind one loader (`assets/js/core/adapters.js`):

- **Weather adapter** — [Open-Meteo Forecast API](https://open-meteo.com/):
  hourly precipitation, precipitation probability, topsoil moisture + daily
  totals, fetched in one multi-point request for the five commune centroids
  (2 past + 7 forecast days, timezone `Africa/Conakry`, refresh every 30 min).
- **Flood adapter** — [Open-Meteo Flood API](https://open-meteo.com/en/docs/flood-api)
  (GloFAS river discharge, 31-day baseline + 7-day forecast). Coastal
  centroids often return nothing usable; `SAP.floodUsable()` detects this and
  the model runs without the discharge factor (confidence is lowered).
- **Sample adapter** — deterministic simulated rainy-season data so the app
  works offline or during API failures, always flagged **Mode démonstration**.
- **CAP adapter** — `SAP.parseCap()` parses Common Alerting Protocol
  documents (prefers the French `<info>` block) and
  `SAP.adapters.officialAlerts()` polls the feeds in `CONFIG.feeds.capFeeds`
  (empty by default). This is the landing point for ANM's official warnings.

`SAP.loadData()` orchestrates: live weather is required (full fallback to
sample data otherwise); river discharge is best-effort.

## Risk model (prototype values — see Assumptions)

Per commune (`assets/js/core/risk.js`, thresholds in `core/config.js`):

```
base  = 0.45 · min(rain_next_24h / 120 mm, 1)          ← forecast trigger
      + 0.25 · min(rain_past_48h / 160 mm, 1)          ← antecedent rainfall
      + 0.15 · min(soil_moisture / 0.40 m³/m³, 1)      ← ground saturation
      + 0.15 · min((Q_forecast/Q_ref − 1) / 2, 1)      ← river-discharge anomaly (when usable)
score = 100 · min(1, base × exposure × drainage)
```

- When discharge is unusable its weight is redistributed and **confidence**
  drops one notch (haute → moyenne → faible; sample data is always *faible*).
- `exposure` and `drainage` are per-commune multipliers (1.0–1.15) encoding
  baseline exposure and drainage sensitivity — highest for Matoto (Gbessia,
  Dabondy, Yimbaya) and Ratoma (Lambanyi, Sonfonia, Kaporo), matching where
  Conakry's recurrent flood damage concentrates (cf. ReliefWeb/IFRC flood
  history, UNICEF Guinea flash updates).
- **Manual official override**: operators can force a level per commune (with
  a reason); the model score stays visible, confidence shows *officielle*.
- Every zone ships **drivers**: each factor's value and its contribution in
  points, displayed as the "Pourquoi ce niveau ?" explanation.

Score → level: **Vert** < 25 ≤ **Jaune** < 50 ≤ **Orange** < 75 ≤ **Rouge**.
Citywide status = worst commune. Levels always render as icon + label +
color, never color alone.

## Public interfaces

```
RiskZone       { id, name, centroid{lat,lon}, riskLevel, score,
                 confidence: haute|moyenne|faible|officielle,
                 drivers[{key,label,value,contribution}], updatedAt }
Alert          { id, level, affectedZones[], title,
                 message{inapp,sms,whatsapp}, channelTargets[],
                 status: brouillon|approuvee|publiee|annulee,
                 createdAt, approvedAt, publishedAt,
                 delivery[{channel,targets,status,at}] }   // simulated in v1
IncidentReport { id, commune, quartier, severity, details,
                 contact (optional), photo (placeholder, v2),
                 validation: en_attente|valide|rejete, at }
```

Alert transitions are enforced (`SAP.alerts.transition` throws on shortcuts);
publication only **simulates** delivery — no real SMS/WhatsApp is sent in v1.

## Geographic model

- **Commune-level zones**: Kaloum, Dixinn, Matam, Ratoma, Matoto (centroids).
- **Hotspot pins** (`SAP.HOTSPOTS`): known flood-prone / low-drainage
  neighborhoods (Lambanyi, Sonfonia, Kaporo rails, Wanindara, Gbessia,
  Dabondy, Yimbaya, Bonfi, Coléah, Boulbinet). **All marked `simulated: true`**
  — positions and causes are indicative and so labeled in the UI, to be
  replaced by validated official datasets (ANGUCH / communes).

## Project layout

```
conakry-flood-ews/
├── index.html · dashboard.html · alerts.html · reports.html
├── package.json                 test/serve scripts (no dependencies)
├── assets/
│   ├── css/style.css            shared styles, light+dark tokens
│   └── js/
│       ├── core/                browser + Node (tested) modules
│       │   ├── config.js        zones, hotspots, levels, thresholds, templates
│       │   ├── adapters.js      weather / flood / sample + loadData()
│       │   ├── risk.js          scoring, confidence, drivers, overrides
│       │   ├── alerts.js        status machine, French templates, simulated publish
│       │   └── store.js         localStorage persistence (single backend seam)
│       ├── charts.js            dependency-free SVG charts (tooltips, dark mode)
│       ├── ui.js                shared badges/chips/formatting
│       └── page-*.js            one controller per view
└── tests/
    ├── unit.test.js             risk thresholds, overrides, transitions, templates
    ├── adapters.test.js         mocked API responses + failure fallback
    └── ui.test.js               Playwright flows + basic accessibility checks
```

## Test plan (implemented)

- **Unit**: level thresholds (25/50/75), calm vs extreme scenarios, zone
  exposure ordering, RiskZone interface completeness, official override,
  confidence degradation, alert status transitions (legal + forbidden),
  French template generation (all placeholders resolved, accent-free SMS),
  report validation states.
- **Integration**: weather/flood adapters against mocked API responses
  (multi-point + single-point + null handling), API-failure fallback to the
  sample adapter end-to-end through the risk engine.
- **UI (Playwright)**: dashboard loads with fallback data; public view shows
  the correct guidance for Jaune/Orange/Rouge; alert draft → approve →
  publish with simulated delivery visible publicly; incident report submitted
  publicly appears in operations and can be validated; basic accessibility
  (lang, labeled fields, keyboard focus).
- **Accessibility**: color-contrast-validated palette (light + dark), levels
  never color-alone, `aria-live` status regions, responsive mobile layout.

## Production roadmap

1. **Backend + database** for reports, subscriptions, alerts and overrides —
   `core/store.js` is the single seam to swap localStorage for an API.
2. **Real SMS/WhatsApp delivery** via Orange Guinée / MTN gateways or Twilio
   (message text and per-channel targeting already produced; delivery states
   already modeled). USSD enrollment for feature phones.
3. **Hydrological inputs**: telemetered or community-read drain/river gauges,
   tide tables for Kaloum, threshold calibration against ANGUCH's historical
   flood events.
4. **Validated geodata**: replace simulated hotspots and commune multipliers
   with official datasets; polygon zone geometries.
5. **Offline-first PWA** packaging (service worker + manifest).

## Assumptions & disclaimer

- This is a **prototype / decision-support tool**, not an official life-safety
  production system; alert issuance belongs to ANGUCH and the Direction
  Nationale de la Météorologie.
- French is the first interface language.
- Real SMS/WhatsApp sending is **out of scope for v1** — the workflow and
  delivery states are modeled, and every simulated send is labeled as such.
- Risk thresholds and zone multipliers are configurable prototype values that
  **must be reviewed by Guinean meteorological, hydrological, civil-protection
  and municipal authorities** before operational use.
- The app avoids false precision: hotspot pins remain labeled *simulé* until
  replaced by validated local datasets; emergency numbers shown in the app
  must be verified locally.
