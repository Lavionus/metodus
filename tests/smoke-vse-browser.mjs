// Kouřový test celého katalogu (22. 10. 2026): každá stránka se načte, projdou se všechny
// režimy (#rezimy / .rezimy button[data-rezim]) a hlídají se běhové chyby JS a vodorovné
// přetečení na 390 px. Jedna záložka, stránky postupně, pod 1,5 GB volné paměti test skončí.
// Spuštění: node tests/smoke-vse-browser.mjs [stranka.html …]   (bez argumentů = celý katalog)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const katalog = readFileSync(new URL('../apps.js', import.meta.url), 'utf8');
const vse = [...katalog.matchAll(/"soubor": "obsah\/([^"]+)"/g)].map(m => m[1]);
const stranky = process.argv.slice(2).length ? process.argv.slice(2) : [...new Set(vse)];
// známé výjimky: plné simulace, které mají přetečení řešené vlastním posuvníkem
const PRETOK_OK = new Set(['optika.html']);

const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(ok => ws.onopen = ok);
let id = 0; const pending = new Map(); let chyby = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    chyby.push((d.exception?.description || d.text || '').split('\n')[0]);
  }
};
const call = (method, params = {}) => new Promise((ok, ko) => {
  const r = ++id, t = setTimeout(() => ko(Error(method + ' timeout')), 20000);
  pending.set(r, m => { clearTimeout(t); m.error ? ko(Error(JSON.stringify(m.error))) : ok(m.result); });
  ws.send(JSON.stringify({ id: r, method, params }));
});
const ev = async x => {
  const r = await call('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const pauza = ms => new Promise(r => setTimeout(r, ms));
const volno = () => Number(readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/)[1]);

await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
await call('Network.setCacheDisabled', { cacheDisabled: true }); await call('Network.setBypassServiceWorker', { bypass: true });
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 860, deviceScaleFactor: 1, mobile: true });

const vadne = [];
let i = 0;
for (const s of stranky) {
  if (volno() < 1_500_000) { console.log('málo volné paměti – konec po', i, 'stránkách'); break; }
  i++;
  chyby = [];
  await call('Page.navigate', { url: 'http://127.0.0.1:8766/obsah/' + s });
  for (let k = 0; k < 60 && !(await ev(`document.readyState === 'complete'`).catch(() => false)); k++) await pauza(100);
  await pauza(600);
  const rezimu = await ev(`document.querySelectorAll('#rezimy button[data-rezim], .rezimy button[data-rezim]').length`).catch(() => 0);
  for (let r = 0; r < rezimu; r++) {
    await ev(`document.querySelectorAll('#rezimy button[data-rezim], .rezimy button[data-rezim]')[${r}]?.click()`).catch(() => {});
    await pauza(250);
  }
  const pretok = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`).catch(() => 0);
  const problem = [];
  if (chyby.length) problem.push('JS: ' + [...new Set(chyby)].slice(0, 3).join(' | '));
  if (pretok > 1 && !PRETOK_OK.has(s)) problem.push(`přetéká o ${pretok} px na 390 px`);
  if (problem.length) vadne.push(`${s}: ${problem.join('; ')}`);
  await call('Page.navigate', { url: 'about:blank' });
}
await call('Network.setCacheDisabled', { cacheDisabled: false }); await call('Network.setBypassServiceWorker', { bypass: false });
ws.close();
console.log(`${i} stránek, ${vadne.length} s problémem`);
vadne.forEach(v => console.log('  ' + v));
assert.equal(vadne.length, 0, 'stránky s chybou');
