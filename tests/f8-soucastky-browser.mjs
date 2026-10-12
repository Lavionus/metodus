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

await call('Page.enable'); await call('Runtime.enable');
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/elektrina.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('#c')?.width > 0`)); i++) await new Promise(r => setTimeout(r, 50));

assert.equal(await ev(`SOUCASTKY.length`), 9);
assert.equal(await ev(`document.querySelectorAll('.souc-karta').length`), 9);
await ev(`document.querySelector('#btnSoucastky').click(); Promise.all([...document.querySelectorAll('.souc-karta img')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelector('#dilna').open`), true);
assert.ok(await ev(`[...document.querySelectorAll('.souc-karta img')].every(i => i.complete && i.naturalWidth === 640 && i.naturalHeight === 640 && i.alt.length > 8)`));
assert.ok(await ev(`[...document.querySelectorAll('.souc-karta')].every(b => b.getAttribute('aria-pressed') === 'false' && b.tagName === 'BUTTON')`));
assert.equal(await ev(`(() => { const b=document.querySelector('.souc-karta'); b.click(); return b.getAttribute('aria-pressed'); })()`), 'true');
assert.equal(await ev(`getComputedStyle(document.querySelector('.souc-karta .souc-znacka')).display`), 'grid');
assert.equal(await ev(`document.querySelectorAll('.souc-znacka svg').length`), 9);
assert.ok(await ev(`document.querySelector('.souc-tip').textContent.includes('sériově') && document.querySelector('.souc-tip').textContent.includes('paralelně')`));
await ev(`document.querySelector('#dilnaZavri').click(); document.querySelector('#tabZapoj').click()`);
assert.equal(await ev(`rezim`), 'zapoj');
assert.equal(await ev(`document.querySelector('#panelZapoj').classList.contains('skryto')`), false);
await ev(`document.querySelector('#tabOhm').click(); document.querySelector('#u').value=18; document.querySelector('#u').dispatchEvent(new Event('input',{bubbles:true}))`);
assert.equal(await ev(`ohm.U`), 18);

for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}; if(!document.querySelector('#dilna').open) document.querySelector('#btnSoucastky').click()`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false);
    assert.equal(await ev(`document.querySelector('#dilna').scrollWidth > document.querySelector('#dilna').clientWidth`), false);
    await ev(`document.querySelector('#dilna').close()`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results:['IMG-f-10: 9 components, image-to-symbol cards, preserved simulation, themes and widths OK'],runtimeErrors}));
ws.close();
