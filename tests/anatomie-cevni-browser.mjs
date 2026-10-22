// Biologie člověka – téma Cévní soustava (22. 10. 2026): ilustrace se načte, každá ze 13 struktur
// jde vybrat skutečnou myší v místě své kotvy (žádná oblast ji nepřekrývá), detail ukáže správný
// název, kvíz projde 13/13 a šířky 1366/390 px nepřetékají. Ostatní témata zůstala.
import assert from 'node:assert/strict';

const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(ok => ws.onopen = ok);
let id = 0; const pending = new Map(), chyby = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') chyby.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
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
const klik = async (x, y) => {
  for (const type of ['mousePressed', 'mouseReleased']) await call('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
};
// bod SVG (souřadnice ilustrace) → bod na obrazovce, po posunutí do zorného pole
const naObrazovku = (bx, by) => ev(`(() => {
  const s = document.querySelector('#regions').ownerSVGElement, p = s.createSVGPoint(); p.x = ${bx}; p.y = ${by};
  const v = document.getElementById('viewport');   // atlas má vlastní posuvnou oblast
  v.scrollIntoView({ block: 'center', behavior: 'instant' });
  let q = p.matrixTransform(s.getScreenCTM()), r = v.getBoundingClientRect();
  if (q.y < r.top + 20 || q.y > r.bottom - 20) { v.scrollTop += q.y - (r.top + r.height / 2); q = p.matrixTransform(s.getScreenCTM()); }
  if (q.x < r.left + 20 || q.x > r.right - 20) { v.scrollLeft += q.x - (r.left + r.width / 2); q = p.matrixTransform(s.getScreenCTM()); }
  return [q.x, q.y];
})()`);

await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
await call('Network.setCacheDisabled', { cacheDisabled: true });
await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:8766/obsah/anatomie.html' });
for (let i = 0; i < 100 && !(await ev(`!!document.querySelector('[data-topic="cevni"]')`)); i++) await new Promise(r => setTimeout(r, 100));

const temata = await ev(`[...document.querySelectorAll('[data-topic]')].map(b => b.dataset.topic)`);
for (const t of ['organy', 'kostra', 'nervova', 'cevni']) assert.ok(temata.includes(t), 'chybí téma ' + t);
await ev(`document.querySelector('[data-topic="cevni"]').click()`);
await new Promise(r => setTimeout(r, 400));
assert.equal(await ev(`document.getElementById('atlas-title').textContent`), 'Cévní soustava');
assert.ok(await ev(`(async () => { const i = [...document.querySelectorAll('#body-map image, #viewport img')].find(e => (e.getAttribute('href') || e.src || '').includes('anatomie-cevni'));
  if (!i) return false; if (i.tagName === 'IMG') return i.complete ? i.naturalWidth > 0 : new Promise(ok => i.onload = () => ok(true));
  return fetch(i.getAttribute('href')).then(r => r.ok); })()`), 'ilustrace se nenačetla');

const struktury = await ev(`window.ANATOMY_MODULES.find(m => m.topic === 'cevni').organs.map(o => ({ id: o.id, name: o.name, anchor: o.anchor }))`);
assert.equal(struktury.length, 13);
await ev(`document.getElementById('labels').checked = false; document.getElementById('labels').dispatchEvent(new Event('change'))`);
for (const s of struktury) {
  const [x, y] = await naObrazovku(...s.anchor);
  const pod = await ev(`document.elementFromPoint(${x}, ${y})?.closest('[data-organ]')?.dataset.organ`);
  assert.equal(pod, s.id, `${s.id}: v místě kotvy leží ${pod}`);
  await klik(x, y);
  assert.equal(await ev(`document.querySelector('#detail h3')?.textContent`), s.name, s.id + ': detail');
}
assert.match(await ev(`document.getElementById('explored').textContent`), /13 z 13/);

// kvíz skutečnou myší
await ev(`document.getElementById('quiz-mode').click()`);
for (let k = 0; k < 13; k++) {
  const otazka = await ev(`document.getElementById('question').textContent`);
  const s = [...struktury].sort((a, b) => b.name.length - a.name.length).find(s => otazka.includes(s.name));
  assert.ok(s, 'otázka bez známé struktury: ' + otazka);
  await klik(...await naObrazovku(...s.anchor));
  assert.equal(await ev(`document.getElementById('feedback').dataset.state`), 'correct', otazka);
  await ev(`document.getElementById('next').click()`);
}
assert.match(await ev(`document.getElementById('question').textContent`), /13 z 13/);

for (const width of [1366, 390]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  await new Promise(r => setTimeout(r, 300));
  assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, width + ' px přetéká');
}
assert.deepEqual(chyby, []);
await call('Network.setCacheDisabled', { cacheDisabled: false });
console.log('anatomie – cévní soustava: 13 struktur skutečnou myší, kvíz 13/13, 1366/390 px OK');
ws.close();
