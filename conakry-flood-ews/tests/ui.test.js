/* Tests d'interface (Playwright + Chromium).
   - Les appels réseau externes sont bloqués => le mode démonstration
     (repli déterministe) est exercé, comme lors d'une panne d'API.
   - Sautés proprement si Playwright n'est pas installé.
   Exécution : npm run test:ui */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');

let chromium = null;
for (const candidate of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
  try { chromium = require(candidate).chromium; break; } catch (e) { /* essayer le suivant */ }
}

const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = req.url.split('?')[0];
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

test('parcours d’interface complet', { skip: !chromium && 'Playwright non installé' }, async t => {
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Bloque tout le trafic externe : force le repli déterministe (mode démo).
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  await t.test('le tableau de bord charge avec les données de repli', async () => {
    await page.goto(base + '/dashboard.html');
    await page.waitForSelector('#alert-hero .title');
    assert.match(await page.textContent('#alert-hero'), /Niveau/);
    assert.equal(await page.isVisible('#demo-banner'), true, 'le bandeau « mode démonstration » doit être visible');
    assert.equal((await page.$$('#zone-table tbody tr')).length, 5, 'les 5 communes sont listées');
    assert.ok((await page.$$('#chart-daily svg, #chart-hourly svg')).length >= 2, 'les graphiques sont rendus');
  });

  await t.test('vue publique : consignes adaptées au niveau (jaune/orange/rouge)', async () => {
    await page.goto(base + '/index.html');
    await page.waitForSelector('#guidance ul');
    // Force chaque niveau via une décision officielle et vérifie la consigne affichée.
    const cases = [
      { level: 'jaune', expect: /Suivez les bulletins/i },
      { level: 'orange', expect: /zones basses|évacuation/i },
      { level: 'rouge', expect: /point haut/i },
    ];
    for (const c of cases) {
      await page.evaluate(([level]) => {
        SAP.store.setOverride(SAP.store.getCommune(), { level: level, reason: 'test UI' });
      }, [c.level]);
      await page.reload();
      await page.waitForSelector('#guidance ul');
      const guidance = await page.textContent('#guidance');
      assert.match(guidance, new RegExp(c.level, 'i'), 'le niveau ' + c.level + ' est affiché');
      assert.match(guidance, c.expect, 'consignes du niveau ' + c.level);
      const hero = await page.textContent('#alert-hero');
      assert.match(hero, /décision officielle/i, 'la confiance affiche la décision officielle');
    }
    await page.evaluate(() => SAP.store.setOverride(SAP.store.getCommune(), null));
  });

  await t.test('alerte : brouillon → approbation → publication simulée', async () => {
    await page.goto(base + '/alerts.html');
    await page.waitForSelector('#draft-form');
    await page.selectOption('#draft-level', 'orange');
    await page.click('#gen-messages');
    const sms = await page.inputValue('#msg-sms');
    assert.match(sms, /ALERTE ORANGE/);
    await page.click('#draft-form button[type=submit]');
    await page.waitForSelector('.alert-item');
    assert.match(await page.textContent('.alert-item'), /Brouillon/);

    await page.click('.alert-item .act[data-to="approuvee"]');
    await page.waitForSelector('.alert-item .act[data-to="publiee"]');
    assert.match(await page.textContent('.alert-item'), /Approuvée/);

    await page.click('.alert-item .act[data-to="publiee"]');
    await page.waitForSelector('.alert-item .delivery');
    const item = await page.textContent('.alert-item');
    assert.match(item, /Publiée/);
    assert.match(item, /simulé/, 'la diffusion est marquée comme simulée');

    // L'alerte publiée apparaît côté public (toutes zones cochées par défaut).
    await page.goto(base + '/index.html');
    await page.waitForSelector('#public-alerts .public-alert');
    assert.match(await page.textContent('#public-alerts'), /Orange/i);
  });

  await t.test('signalement : envoi public puis validation en salle des opérations', async () => {
    await page.goto(base + '/index.html');
    await page.waitForSelector('#report-form');
    await page.selectOption('#rep-commune', 'matoto');
    await page.fill('#rep-quartier', 'Gbessia');
    await page.selectOption('#rep-severity', 'grave');
    await page.fill('#rep-details', 'Test UI : habitations touchées.');
    await page.click('#report-form button[type=submit]');
    await page.waitForSelector('#rep-msg:not(:empty)');

    await page.goto(base + '/reports.html');
    await page.waitForSelector('.alert-item');
    const before = await page.textContent('.alert-item');
    assert.match(before, /Gbessia/);
    assert.match(before, /À vérifier/);
    await page.click('.alert-item .val[data-v="valide"]');
    await page.waitForSelector('.chip-valide');
    assert.match(await page.textContent('.alert-item'), /Validé/);
  });

  await t.test('accessibilité de base : libellés, langue, navigation clavier', async () => {
    await page.goto(base + '/index.html');
    assert.equal(await page.getAttribute('html', 'lang'), 'fr');
    // Chaque champ de formulaire a un libellé associé.
    const unlabeled = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input:not([type=file]), select, textarea'))
        .filter(el => !el.labels || !el.labels.length)
        .filter(el => !el.getAttribute('aria-label'))
        .map(el => el.id || el.name));
    assert.deepEqual(unlabeled, [], 'champs sans libellé : ' + unlabeled.join(', '));
    // La navigation clavier atteint les liens principaux.
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.tagName);
    assert.ok(['A', 'SELECT', 'INPUT', 'BUTTON'].includes(focused), 'le focus clavier démarre sur un élément interactif');
  });

  assert.deepEqual(pageErrors, [], 'aucune erreur JavaScript de page : ' + pageErrors.join(' | '));

  await browser.close();
  server.close();
});
