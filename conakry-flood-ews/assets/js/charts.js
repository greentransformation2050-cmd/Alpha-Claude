/* SAP Conakry — graphiques SVG sans dépendance.
   Marques : barres ≤ 24 px à sommet arrondi 4 px, lignes 2 px,
   grille en trait fin, infobulle au survol. Une seule série par
   graphique (pluie) => pas de légende, le titre nomme la série. */
window.SAP = window.SAP || {};

(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  function svgEl(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function niceTicks(max, count) {
    if (!(max > 0)) max = 1;
    const raw = max / (count || 4);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
    const ticks = [];
    for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(Math.round(v * 100) / 100);
    return ticks;
  }

  function makeTip(container) {
    let tip = container.querySelector('.chart-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tip';
      tip.hidden = true;
      container.appendChild(tip);
    }
    return tip;
  }

  function placeTip(tip, container, x, y) {
    const cw = container.clientWidth;
    tip.style.left = Math.min(Math.max(4, x - tip.offsetWidth / 2), cw - tip.offsetWidth - 4) + 'px';
    tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + 'px';
  }

  /* Chemin de barre : sommet arrondi (4 px), base carrée sur l'axe. */
  function barPath(x, yTop, w, yBase) {
    const r = Math.min(4, w / 2, Math.max(0, yBase - yTop));
    return 'M' + x + ',' + yBase +
      ' L' + x + ',' + (yTop + r) +
      ' Q' + x + ',' + yTop + ' ' + (x + r) + ',' + yTop +
      ' L' + (x + w - r) + ',' + yTop +
      ' Q' + (x + w) + ',' + yTop + ' ' + (x + w) + ',' + (yTop + r) +
      ' L' + (x + w) + ',' + yBase + ' Z';
  }

  /* Diagramme en colonnes.
     opts: { labels[], values[], unit, highlightIndex, tipLabel(i) } */
  SAP.barChart = function (container, opts) {
    container.classList.add('chart');
    container.innerHTML = '';
    const W = Math.max(300, container.clientWidth || 560), H = 240;
    const m = { l: 40, r: 10, t: 16, b: 26 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' }, container);
    const plotW = W - m.l - m.r, plotH = H - m.t - m.b;
    const n = opts.values.length;
    const max = Math.max.apply(null, opts.values.concat([1]));
    const ticks = niceTicks(max, 4);
    const top = ticks[ticks.length - 1];
    const y = v => m.t + plotH * (1 - v / top);

    for (const t of ticks) {
      if (t > 0) svgEl('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), class: 'grid' }, svg);
      svgEl('text', { x: m.l - 6, y: y(t) + 3, class: 'tick', 'text-anchor': 'end' }, svg)
        .textContent = String(t);
    }
    svgEl('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), class: 'axis' }, svg);

    const band = plotW / n;
    const barW = Math.min(24, Math.max(6, band - 8));
    const maxIdx = opts.values.indexOf(Math.max.apply(null, opts.values));
    const tip = makeTip(container);

    for (let i = 0; i < n; i++) {
      const cx = m.l + band * i + band / 2;
      const v = opts.values[i];
      const yTop = y(v);
      const bar = svgEl('path', {
        d: barPath(cx - barW / 2, Math.min(yTop, y(0) - 0), barW, y(0)),
        class: 'bar' + (i === opts.highlightIndex ? ' bar-hl' : ''),
      }, svg);
      if (v <= 0) bar.setAttribute('opacity', '0');

      // Étiquette directe : uniquement le maximum (étiquetage sélectif).
      if (i === maxIdx && v > 0) {
        svgEl('text', { x: cx, y: yTop - 5, class: 'val', 'text-anchor': 'middle' }, svg)
          .textContent = v + (opts.unit ? ' ' + opts.unit : '');
      }
      svgEl('text', { x: cx, y: H - 8, class: 'tick', 'text-anchor': 'middle' }, svg)
        .textContent = opts.labels[i];

      // Cible de survol plus large que la marque.
      const hit = svgEl('rect', {
        x: m.l + band * i, y: m.t, width: band, height: plotH + m.b, fill: 'transparent',
      }, svg);
      hit.addEventListener('mouseenter', function () {
        bar.classList.add('hover');
        tip.hidden = false;
        tip.textContent = (opts.tipLabel ? opts.tipLabel(i) : opts.labels[i]) + ' : ' + v + ' ' + (opts.unit || '');
        placeTip(tip, container, (m.l + band * i + band / 2) / W * container.clientWidth, yTop / H * H);
      });
      hit.addEventListener('mouseleave', function () {
        bar.classList.remove('hover');
        tip.hidden = true;
      });
    }
  };

  /* Courbe horaire avec aplat léger, repère "maintenant", réticule + infobulle.
     opts: { times[], values[], unit, nowIndex, xLabel(i), tipLabel(i) } */
  SAP.lineChart = function (container, opts) {
    container.classList.add('chart');
    container.innerHTML = '';
    const W = Math.max(300, container.clientWidth || 560), H = 240;
    const m = { l: 40, r: 12, t: 16, b: 26 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' }, container);
    const plotW = W - m.l - m.r, plotH = H - m.t - m.b;
    const n = opts.values.length;
    const max = Math.max.apply(null, opts.values.concat([1]));
    const ticks = niceTicks(max, 4);
    const top = ticks[ticks.length - 1];
    const x = i => m.l + plotW * (n === 1 ? 0.5 : i / (n - 1));
    const y = v => m.t + plotH * (1 - v / top);

    for (const t of ticks) {
      if (t > 0) svgEl('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), class: 'grid' }, svg);
      svgEl('text', { x: m.l - 6, y: y(t) + 3, class: 'tick', 'text-anchor': 'end' }, svg)
        .textContent = String(t);
    }
    svgEl('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), class: 'axis' }, svg);

    let line = '', area = 'M' + x(0) + ',' + y(0);
    for (let i = 0; i < n; i++) {
      line += (i ? ' L' : 'M') + x(i) + ',' + y(opts.values[i]);
      area += ' L' + x(i) + ',' + y(opts.values[i]);
    }
    area += ' L' + x(n - 1) + ',' + y(0) + ' Z';
    svgEl('path', { d: area, class: 'area' }, svg);
    svgEl('path', { d: line, class: 'line' }, svg);

    // Repère « maintenant ».
    if (opts.nowIndex != null && opts.nowIndex >= 0 && opts.nowIndex < n) {
      const nx = x(opts.nowIndex);
      svgEl('line', { x1: nx, x2: nx, y1: m.t, y2: y(0), class: 'now-line' }, svg);
      svgEl('text', { x: nx + 4, y: m.t + 9, class: 'tick' }, svg).textContent = 'maintenant';
    }

    // Graduations X toutes les 6 heures.
    for (let i = 0; i < n; i += 6) {
      svgEl('text', { x: x(i), y: H - 8, class: 'tick', 'text-anchor': 'middle' }, svg)
        .textContent = opts.xLabel ? opts.xLabel(i) : String(i);
    }

    const cross = svgEl('line', { x1: 0, x2: 0, y1: m.t, y2: y(0), class: 'crosshair', visibility: 'hidden' }, svg);
    const dot = svgEl('circle', { r: 4.5, class: 'dot', visibility: 'hidden' }, svg);
    const tip = makeTip(container);
    const hit = svgEl('rect', { x: m.l, y: m.t, width: plotW, height: plotH, fill: 'transparent' }, svg);

    hit.addEventListener('mousemove', function (ev) {
      const rect = svg.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width * W;
      const i = Math.max(0, Math.min(n - 1, Math.round((px - m.l) / plotW * (n - 1))));
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
      cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(opts.values[i]));
      dot.setAttribute('visibility', 'visible');
      tip.hidden = false;
      tip.textContent = (opts.tipLabel ? opts.tipLabel(i) : i) + ' : ' + opts.values[i] + ' ' + (opts.unit || '');
      placeTip(tip, container, x(i) / W * container.clientWidth, y(opts.values[i]));
    });
    hit.addEventListener('mouseleave', function () {
      cross.setAttribute('visibility', 'hidden');
      dot.setAttribute('visibility', 'hidden');
      tip.hidden = true;
    });
  };
})();
