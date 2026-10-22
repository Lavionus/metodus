// Snímek stránky z obsah/: node tools/snimek.mjs stranka.html vystup.jpg [selektor] [šířka] [motiv]  (AKCE="js" před snímkem)
import { writeFileSync } from 'node:fs';
const [, , stranka, out, sel = 'body', w = '1200', theme = 'dark'] = process.argv;
const t = (await (await fetch(process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json')).json()).find(t => t.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(o => ws.onopen = o);
let i = 0; const p = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) p.get(m.id)(m); };
const c = (method, params = {}) => new Promise(o => { const r = ++i; p.set(r, o); ws.send(JSON.stringify({ id: r, method, params })); });
const ev = async x => (await c('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result?.result?.value;
await c('Network.enable'); await c('Network.setCacheDisabled', { cacheDisabled: true }); await c('Network.setBypassServiceWorker', { bypass: true });
await c('Emulation.setDeviceMetricsOverride', { width: +w, height: 900, deviceScaleFactor: 1, mobile: +w < 600 });
await c('Page.navigate', { url: 'http://127.0.0.1:8766/obsah/' + stranka }); await new Promise(r => setTimeout(r, 2500));
await ev(`document.documentElement.dataset.theme='${theme}';document.querySelectorAll('img').forEach(i=>i.loading='eager');${process.env.AKCE || ''}`);
await new Promise(r => setTimeout(r, 1500));
const r = await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const b=e.getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:Math.min(b.height,4000)}})()`);
const s = await c('Page.captureScreenshot', { format: 'jpeg', quality: 70, captureBeyondViewport: true, clip: { ...r, scale: 1 } });
writeFileSync(out, Buffer.from(s.result.data, 'base64'));
await c('Network.setCacheDisabled', { cacheDisabled: false }); await c('Network.setBypassServiceWorker', { bypass: false });
await c('Page.navigate', { url: 'about:blank' }); ws.close();
