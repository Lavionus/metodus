// Kontrast písma na barevných výplních (akcent, správně, špatně, varování)
// na všech stránkách katalogu v tmavém a světlém motivu.
// Spustit místní server (8766), Chromium s CDP (9223), pak:
//   node tests/vyplne.mjs [motiv …]      (výchozí: dark light)
// Úsporně: jedna záložka v izolovaném kontextu, stránky postupně, mezi
// nimi about:blank, pod 1,5 GB volné paměti průchod skončí. Záměrně tmavé
// WebGL stránky (glóbusy, ISS) se přeskakují – nemají výplně z motivu.
// Měří jen stav po načtení (aktivní režimy, zvýrazněná tlačítka); stavy
// po odpovědi hlídají testy jednotlivých komponent.
import { readFileSync, readdirSync } from 'node:fs';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const motivy = process.argv.slice(2).length ? process.argv.slice(2) : ['dark', 'light'];
const PRESKOCIT = new Set(['planet_globe.html', 'iss.html', 'AI_prednaska.html']);
const stranky = readdirSync(new URL('../obsah/', import.meta.url))
  .filter(f => f.endsWith('.html') && !PRESKOCIT.has(f))
  .filter(f => readFileSync(new URL('../obsah/' + f, import.meta.url), 'utf8').includes('kostra.js'));
const volnaPamet = () => { const m = readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/); return m ? +m[1] / 1024 : Infinity; };

const verze = await (await fetch(endpoint + '/version')).json();
const bws = new WebSocket(verze.webSocketDebuggerUrl);
await new Promise(r => bws.onopen = r);
let bid = 0; const bp = new Map();
bws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { bp.get(m.id)?.(m); bp.delete(m.id); } };
const bcall = (method, params = {}) => new Promise(res => { const n = ++bid; bp.set(n, m => res(m.result)); bws.send(JSON.stringify({ id: n, method, params })); });
const { browserContextId } = await bcall('Target.createBrowserContext', { disposeOnDetach: true });
const { targetId } = await bcall('Target.createTarget', { url: 'about:blank', browserContextId });
const target = (await (await fetch(endpoint)).json()).find(t => t.id === targetId);
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); } };
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; const t = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout ' + method)); }, 30000);
  pending.set(n, m => { clearTimeout(t); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expr => { const r = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result?.value; };
const cekej = ms => new Promise(r => setTimeout(r, ms));

const MERENI = `(() => {
  const barva = s => { const m = String(s).match(/-?[\\d.]+/g) || []; let [r = 0, g = 0, b = 0, a = 1] = m.map(Number);
    if (/^color\\(srgb/.test(s)) { r *= 255; g *= 255; b *= 255; } return { r, g, b, a }; };
  const jas = s => { const { r, g, b } = barva(s); const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2]; };
  const kontrast = (a, b) => { const x = jas(a), y = jas(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const s = getComputedStyle(document.documentElement);
  const vypne = ['--accent', '--accent-hover', '--ok', '--danger', '--warn'].map(n => {
    const d = document.createElement('i'); d.style.color = s.getPropertyValue(n).trim(); document.body.append(d);
    const c = getComputedStyle(d).color; d.remove(); return [n, barva(c)]; });
  const blizko = (c, v) => Math.abs(c.r - v.r) + Math.abs(c.g - v.g) + Math.abs(c.b - v.b) < 24;
  const nalezy = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
    const vlastniText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!vlastniText) continue;
    const cs = getComputedStyle(el), bg = barva(cs.backgroundColor);
    if (bg.a < 0.5) continue;
    const shoda = vypne.find(([, v]) => blizko(bg, v));
    if (!shoda) continue;
    const k = kontrast(cs.color, cs.backgroundColor);
    if (k < 4.5) nalezy.push({ vypln: shoda[0], k: Math.round(k * 100) / 100,
      prvek: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : ''),
      text: el.textContent.trim().slice(0, 30), barva: cs.color });
  }
  return nalezy;
})()`;

const vysledky = {};
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  for (const motiv of motivy) {
    await call('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('webapp_theme','${motiv}')}catch(e){}` });
    for (const f of stranky) {
      if (volnaPamet() < 1500) { console.log('Málo volné paměti – konec u', f); break; }
      await call('Page.navigate', { url: base + 'obsah/' + f });
      for (let i = 0; i < 100; i++) { if (await evaluate(`document.readyState==='complete'`)) break; await cekej(50); }
      await cekej(600);
      const n = await evaluate(MERENI).catch(() => null);
      if (n && n.length) (vysledky[motiv] ||= {})[f] = n;
      await call('Page.navigate', { url: 'about:blank' });
    }
  }
} finally {
  console.log(JSON.stringify(vysledky, null, 1));
  const pocet = Object.values(vysledky).reduce((a, m) => a + Object.keys(m).length, 0);
  console.log('stránek s nálezem:', pocet, '· prošlo stránek:', stranky.length, '× motivy', motivy.join(','));
  await bcall('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
  ws.close(); bws.close();
}
