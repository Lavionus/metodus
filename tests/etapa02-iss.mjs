// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa02-iss.mjs.
// Datová služba je nahrazena stubem: test ověřuje úspěšné načtení i výpadek spojení
// bez dotazu na wheretheiss.at a bez závislosti na aktuální poloze stanice.
import assert from 'node:assert/strict';
const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(x => x.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
const pending = new Map(); let id = 0; const errors = [];
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
const cekej = async (expr, popis) => {
  for (let i = 0; i < 120; i++) { if (await evaluate(expr)) return; await new Promise(r => setTimeout(r, 100)); }
  throw new Error('Timeout: ' + popis);
};
const panel = () => evaluate(`({
  stav: stav.textContent, tridaStavu: stav.className, cas: cas.textContent, stari: stariZnacka.textContent,
  vyska: vyska.textContent, chyba: getComputedStyle(chyba).display, chybaText: chybaText.textContent,
  zastarale: mrizka.classList.contains('zastarale'), loader: loader.classList.contains('skryt')
})`);
try {
  await call('Runtime.enable'); await call('Page.enable');
  // servisní worker by podával starou verzi z cache — test musí číst soubory ze serveru
  await call('Network.enable'); await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  // Stub datové služby: první odpovědi projdou, další se dají přepnout na výpadek.
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__sit = !location.search.includes('bezsite');
    const puvodni = window.fetch;
    window.fetch = (url, opts) => {
      const u = String(url);
      if (!u.includes('wheretheiss.at')) return puvodni(url, opts);
      if (!window.__sit) return Promise.reject(new TypeError('Failed to fetch'));
      const telo = u.includes('/positions')
        ? new URL(u, location).searchParams.get('timestamps').split(',')
            .map(t => ({ timestamp: Number(t), latitude: 10, longitude: 20, altitude: 420 }))
        : u.includes('/coordinates/') ? { country_code: 'CZ' }
        : { latitude: 50.08, longitude: 14.43, altitude: 419.7, velocity: 27600, visibility: 'daylight' };
      return Promise.resolve(new Response(JSON.stringify(telo), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    };` });
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: base + 'obsah/iss.html' });
  await cekej(`document.readyState==='complete'`, 'načtení stránky');

  // 1) Úspěšné načtení: živý stav, čas posledních dat, skryté hlášení o chybě.
  await cekej(`stav.classList.contains('zivy')`, 'živá data');
  const zivy = await panel();
  assert.match(zivy.stav, /živá poloha/, 'živý stav');
  assert.match(zivy.cas, /^\d{1,2}:\d{2}:\d{2}$/, 'čas posledních dat: ' + zivy.cas);
  assert.equal(zivy.chyba, 'none', 'hlášení o chybě při funkčním spojení');
  assert.equal(zivy.zastarale, false, 'hodnoty nejsou označené jako zastaralé');
  assert.equal(zivy.vyska, '420 km', 'výška ze stubu');
  await cekej(`nad.textContent.includes('CZ')`, 'země pod stanicí');
  await cekej(`loader.classList.contains('skryt')`, 'skrytí loaderu');
  const casZivy = zivy.cas;

  // 2) Výpadek spojení: zamrzlá data s časem a stářím, srozumitelné hlášení.
  await evaluate(`window.__sit=false; aktualizujPolohu()`);
  await cekej(`stav.classList.contains('bez')`, 'stav bez spojení');
  const bez = await panel();
  assert.match(bez.stav, /bez spojení · zobrazená poloha je z \d{1,2}:\d{2}:\d{2}/, 'stav: ' + bez.stav);
  assert.equal(bez.cas, casZivy, 'čas zůstává na posledních datech');
  assert.equal(bez.zastarale, true, 'hodnoty označené jako zastaralé');
  assert.equal(bez.chyba, 'block', 'viditelné hlášení');
  assert.match(bez.chybaText, /Spojení se přerušilo/, 'text hlášení: ' + bez.chybaText);
  assert.match(await evaluate(`popisStav(false), stariZnacka.textContent`), /před \d+ (s|min|h)/, 'stáří dat');

  // 3) Tlačítko Zkusit znovu vrátí živý stav po obnovení spojení.
  await evaluate(`window.__sit=true; znovuBtn.click()`);
  await cekej(`stav.classList.contains('zivy')`, 'obnovení po Zkusit znovu');
  const obnoveno = await panel();
  assert.equal(obnoveno.chyba, 'none', 'hlášení po obnovení');
  assert.equal(obnoveno.zastarale, false, 'označení zastaralosti po obnovení');

  // 4) Výpadek hned od začátku: stránka nezůstane za loaderem a řekne, že data nedorazila.
  await call('Page.navigate', { url: base + 'obsah/iss.html?bezsite' });
  await cekej(`document.readyState==='complete' && typeof stav!=='undefined' && stav.classList.contains('bez')`, 'stav bez dat');
  await cekej(`loader.classList.contains('skryt')`, 'skrytí loaderu bez sítě');
  const bezDat = await panel();
  assert.match(bezDat.stav, /data zatím nedorazila/, 'stav bez dat: ' + bezDat.stav);
  assert.equal(bezDat.cas, 'zatím žádná', 'čas bez dat');
  assert.equal(bezDat.zastarale, false, 'bez dat se nic neoznačuje jako zastaralé');
  assert.match(bezDat.chybaText, /Glóbus a ovládání fungují dál/, 'text bez dat');

  // 5) Šířky a přetečení v obou motivech.
  const sirky = [];
  for (const width of [1366, 390, 320]) for (const theme of ['dark', 'light']) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.documentElement.dataset.theme='${theme}'`);
    const s = await evaluate(`({width:innerWidth, scroll:document.documentElement.scrollWidth})`);
    assert.ok(s.scroll <= s.width + 1, 'přetečení při ' + width + ' ' + theme);
    sirky.push(width + '/' + theme);
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(JSON.stringify({ ok: true, zivy, bez, bezDat, sirky, runtimeErrors: errors.length }, null, 2));
} finally { ws.close(); }
