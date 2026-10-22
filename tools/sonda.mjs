// Sonda pro ladění v prohlížeči: načte stránku z obsah/ a vyhodnotí v ní výraz.
// node tools/sonda.mjs stranka.html "výraz" ["akce před výrazem"] [šířka]
// Potřebuje místní server (127.0.0.1:8766) a Chromium s CDP (127.0.0.1:9223); vypne cache.
const [, , stranka, vyraz, akce, sirka = '1280'] = process.argv;
const t = (await (await fetch(process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json')).json()).find(t => t.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(o => ws.onopen = o);
let i = 0; const p = new Map(); const chyby = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) p.get(m.id)(m);
  if (m.method === 'Runtime.exceptionThrown') chyby.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
};
const c = (method, params = {}) => new Promise(o => { const r = ++i; p.set(r, o); ws.send(JSON.stringify({ id: r, method, params })); });
const ev = async x => { const r = (await c('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result; return r?.exceptionDetails ? 'VÝJIMKA: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) : r?.result?.value; };
await c('Runtime.enable'); await c('Network.enable');
await c('Network.setCacheDisabled', { cacheDisabled: true }); await c('Network.setBypassServiceWorker', { bypass: true });
await c('Emulation.setDeviceMetricsOverride', { width: +sirka, height: 900, deviceScaleFactor: 1, mobile: +sirka < 600 });
await c('Page.navigate', { url: 'http://127.0.0.1:8766/obsah/' + stranka }); await new Promise(r => setTimeout(r, 2500));
if (akce) { await ev(akce); await new Promise(r => setTimeout(r, 400)); }
console.log(JSON.stringify(await ev(vyraz), null, 1));
if (chyby.length) console.log('chyby JS:', chyby);
await c('Network.setCacheDisabled', { cacheDisabled: false }); await c('Network.setBypassServiceWorker', { bypass: false });
ws.close();
