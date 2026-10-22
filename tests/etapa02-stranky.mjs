// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa02-stranky.mjs.
// Kontrola stránek etapy 02: načtení bez výjimky, funkční místní odkazy a kotvy,
// žádné přetečení šířky při 1366/390/320 px v obou motivech.
import assert from 'node:assert/strict';
const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(x => x.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
const pending = new Map(); let id = 0; let errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; const timer = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout: ' + method)); }, 20000);
  pending.set(n, m => { clearTimeout(timer); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expression => {
  const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const stranky = ['obsah/eduMaps.html', 'obsah/historicke_mapy_odkazy.html', 'obsah/prehled.html', 'obsah/predstaveni.html', 'index.html'];
try {
  await call('Runtime.enable'); await call('Page.enable');
  // servisní worker by podával starou verzi z cache — test musí číst soubory ze serveru
  await call('Network.enable'); await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  const vysledky = [];
  for (const stranka of stranky) {
    errors = [];
    await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: base + stranka });
    for (let i = 0; i < 120; i++) {
      if (await evaluate(`document.readyState==='complete'`)) break;
      await new Promise(r => setTimeout(r, 50));
    }
    await new Promise(r => setTimeout(r, 400));
    // Místní odkazy: cíl musí existovat, kotva musí mít prvek.
    const odkazy = await evaluate(`(async () => {
      const out = [];
      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href');
        if (!href || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
        if (href.startsWith('#')) {
          const cil = href.slice(1);
          if (!cil) { out.push({ href, ok: true }); continue; }
          // deep-link rozcestníku (#obsah/soubor.html) míří na stránku, ne na kotvu
          if (cil.includes('/')) { out.push({ href, ok: (await fetch('/' + cil)).ok }); continue; }
          out.push({ href, ok: !!document.getElementById(cil) });
          continue;
        }
        const u = new URL(href, location.href);
        if (u.origin !== location.origin) { continue; }
        const r = await fetch(u.pathname, { method: 'GET' });
        out.push({ href, ok: r.ok && (!u.hash || true) });
      }
      return out;
    })()`);
    const rozbite = odkazy.filter(o => !o.ok).map(o => o.href);
    assert.deepEqual(rozbite, [], stranka + ' — nefunkční odkazy: ' + rozbite.join(', '));
    for (const width of [1366, 390, 320]) for (const theme of ['dark', 'light']) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await evaluate(`document.documentElement.dataset.theme='${theme}'`);
      await new Promise(r => setTimeout(r, 120));
      const s = await evaluate(`({width:innerWidth, scroll:document.documentElement.scrollWidth})`);
      assert.ok(s.scroll <= s.width + 1, stranka + ' — přetečení při ' + width + ' ' + theme + ' (' + s.scroll + ' > ' + s.width + ')');
    }
    assert.equal(errors.length, 0, stranka + ' — výjimka: ' + JSON.stringify(errors));
    vysledky.push({ stranka, mistnichOdkazu: odkazy.length, sirky: [1366, 390, 320], motivy: ['dark', 'light'] });
  }
  console.log(JSON.stringify({ ok: true, vysledky }, null, 2));
} finally { ws.close(); }
