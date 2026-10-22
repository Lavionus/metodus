// Barvy předmětů a Nastavení (22. 10. 2026): změna barvy, vypnutí podbarvení, motiv a mazání dat
// v obsah/nastaveni.html (v rámci rozcestníku) se propíše do menu rozcestníku.
// Spuštění: místní server 8766, Chromium s CDP 9223, pak node tests/barvy-nastaveni-browser.mjs
import assert from 'node:assert/strict';
const t = (await (await fetch(process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json')).json()).find(t => t.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(o => ws.onopen = o);
let i = 0; const p = new Map(); const chyby = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) p.get(m.id)(m); if (m.method === 'Runtime.exceptionThrown') chyby.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const c = (method, params = {}) => new Promise(o => { const r = ++i; p.set(r, o); ws.send(JSON.stringify({ id: r, method, params })); });
const ev = async x => (await c('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result?.result?.value;
const spi = ms => new Promise(r => setTimeout(r, ms));
await c('Runtime.enable'); await c('Network.enable'); await c('Network.setCacheDisabled', { cacheDisabled: true }); await c('Network.setBypassServiceWorker', { bypass: true });
await c('Emulation.setDeviceMetricsOverride', { width: 1300, height: 900, deviceScaleFactor: 1, mobile: false });
await c('Page.navigate', { url: 'http://127.0.0.1:8766/index.html' }); await spi(1500);
await ev(`localStorage.clear()`);
await c('Page.navigate', { url: 'http://127.0.0.1:8766/index.html#obsah/nastaveni.html' }); await spi(2500);
const vysl = {};
const blok = `getComputedStyle(document.querySelector('.predmet-blok[data-podbarva="cj"]'))`;
vysl.predtim = await ev(`${blok}.backgroundImage.slice(0,60)`);
vysl.ramec = await ev(`document.querySelector('iframe').contentWindow.location.pathname`);
await ev(`(() => { const f = document.querySelector('iframe').contentDocument; const v = f.querySelector('.predmet[data-id="cj"] input'); v.value = '#ff0000'; v.dispatchEvent(new Event('input', {bubbles:true})); })()`);
await spi(500);
vysl.rodicCj = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--podbarva-cj')`);
vysl.ulozeno = await ev(`localStorage.getItem('metodus_barvy_predmetu')`);
await ev(`document.querySelector('iframe').contentDocument.getElementById('zapnuto').click()`); await spi(400);
vysl.vypnuto = await ev(`${blok}.backgroundImage`);
await ev(`document.querySelector('iframe').contentDocument.getElementById('zapnuto').click()`); await spi(300);
// motiv ze záložky Nastavení → rozcestník
await ev(`document.querySelector('iframe').contentDocument.getElementById('tab-motiv').click()`);
await ev(`document.querySelector('iframe').contentDocument.querySelector('input[name="motiv"][value="sepia"]').click()`); await spi(500);
vysl.motivRodic = await ev(`MetodusTheme.get() + ' / ' + document.getElementById('temaVolba').value`);
// data: smazání oblíbených dvoukrokem
await ev(`localStorage.setItem('metodus_oblibene', '["obsah/cj4_pady.html"]'); localStorage.setItem('metodus_cj4_pady', '{"s":1}')`);
await ev(`document.querySelector('iframe').contentDocument.getElementById('tab-data').click()`); await spi(800);
vysl.radky = await ev(`[...document.querySelector('iframe').contentDocument.querySelectorAll('.popis-klice')].map(e => e.textContent)`);
await ev(`(() => { const b = document.querySelector('iframe').contentDocument.getElementById('smazatPostup'); b.click(); b.click(); })()`); await spi(500);
vysl.poSmazani = await ev(`Object.keys(localStorage).sort()`);
vysl.hlaska = await ev(`document.querySelector('iframe').contentDocument.getElementById('hlaskaLs').textContent`);
await ev(`(() => { const f = document.querySelector('iframe').contentDocument; f.getElementById('tab-barvy').click(); f.getElementById('vychoziBarvy').click(); })()`); await spi(300);
vysl.poObnoveni = await ev(`getComputedStyle(document.documentElement).getPropertyValue('--podbarva-cj')`);
vysl.prete = await ev(`document.querySelector('iframe').contentDocument.documentElement.scrollWidth > document.querySelector('iframe').clientWidth + 1`);
await ev(`MetodusTheme.set('dark'); localStorage.clear()`);
assert.equal(chyby.length, 0, 'bez chyb JS: ' + chyby.join(' | '));
assert.match(vysl.predtim, /^linear-gradient/, 'blok předmětu v menu je podbarvený');
assert.equal(vysl.ramec, '/obsah/nastaveni.html');
assert.equal(vysl.rodicCj.trim(), '#ff0000', 'nová barva dorazí do rozcestníku');
assert.deepEqual(JSON.parse(vysl.ulozeno).barvy, { cj: '#ff0000' }, 'ukládá se jen změněná barva');
assert.equal(vysl.vypnuto, 'none', 'vypnutí podbarvení');
assert.equal(vysl.motivRodic, 'sepia / sepia', 'motiv z Nastavení platí v rozcestníku');
assert.ok(vysl.radky.includes('Oblíbené stránky (★)') && vysl.radky.some(r => r.includes('Pády a vzory')), 'popisy uložených dat');
assert.ok(vysl.poSmazani.includes('metodus_barvy_predmetu') && vysl.poSmazani.includes('webapp_theme'), 'smazání výsledků nechá nastavení');
assert.ok(!['metodus_oblibene', 'metodus_nedavne', 'metodus_cj4_pady'].some(k => vysl.poSmazani.includes(k)), 'výsledky a historie smazány');
assert.match(vysl.hlaska, /^Smazáno: \d+ položk(a|y|ek)\./, 'hláška se skloňováním');
assert.equal(vysl.poObnoveni.trim(), '#f28b8b', 'obnovení výchozích barev');
assert.equal(vysl.prete, false, 'bez přetečení');
await c('Network.setCacheDisabled', { cacheDisabled: false }); await c('Network.setBypassServiceWorker', { bypass: false }); ws.close();
console.log('OK: barvy předmětů a Nastavení');
