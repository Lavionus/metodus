import assert from 'node:assert/strict';

const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let id = 0;
const pending = new Map(), runtimeErrors = [];
ws.onmessage = event => {
  const msg = JSON.parse(event.data);
  if (msg.id) { pending.get(msg.id)?.(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') runtimeErrors.push(msg.params.exceptionDetails.text);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => reject(Error(method + ' timeout')), 15000);
  pending.set(requestId, msg => { clearTimeout(timer); msg.error ? reject(Error(JSON.stringify(msg.error))) : resolve(msg.result); });
  ws.send(JSON.stringify({id: requestId, method, params}));
});
const ev = async expression => {
  const result = await call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};

await call('Page.enable');
await call('Runtime.enable');
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/ch9_zivotni_prostredi.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('#plocha img')`)); i++) await new Promise(r => setTimeout(r, 50));

assert.equal(await ev(`SADY.kviz1.length`), 32);
assert.equal(await ev(`new Set(SADY.kviz1.map(x => x.img)).size`), 32);
assert.equal(await ev(`document.querySelectorAll('.kontejner img').length`), 6);
assert.ok(await ev(`[...document.querySelectorAll('.kontejner img')].every(i => i.complete && i.naturalWidth === 640 && i.alt.length > 8)`));
await ev(`document.querySelector('#plocha').innerHTML = SADY.kviz1.map(x => '<img class="test-odpad" src="' + x.img + '" alt="' + x.alt + '">').join(''); Promise.all([...document.querySelectorAll('.test-odpad')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelectorAll('.test-odpad').length`), 32);
assert.ok(await ev(`[...document.querySelectorAll('.test-odpad')].every(i => i.complete && i.naturalWidth > 0 && i.naturalHeight > 0 && i.alt.length > 5)`));

await ev(`document.querySelector('[data-rezim="kviz1"]').click()`);
assert.equal(await ev(`document.querySelectorAll('#plocha .odpad-karta img').length`), 1);
assert.equal(await ev(`(() => { const u = SADY.kviz1.find(x => x.q === document.querySelector('#plocha .zadani').textContent); const b = [...document.querySelectorAll('#plocha button')].find(x => x.textContent.trim() === u.a); b.click(); return document.querySelector('#plocha .odezva').classList.contains('ok'); })()`), true);
assert.equal(await ev(`document.querySelector('#plocha .odezva').getAttribute('role')`), 'status');

for (const mode of ['kviz1', 'kviz2', 'kviz3', 'kviz4']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 20`));
}
for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.querySelector('[data-rezim="kviz1"]').click()`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false);
    assert.equal(await ev(`document.querySelectorAll('.kontejner img').length`), 6);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-ch-06: 32 waste cards, 6 bins, answer flow, 4 modes, themes and widths OK'], runtimeErrors}));
ws.close();
