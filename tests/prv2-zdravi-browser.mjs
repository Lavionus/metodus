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
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
};

await call('Page.enable'); await call('Runtime.enable');
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/prv2_zdravi.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('#plocha')`)); i++) await new Promise(r => setTimeout(r, 50));

assert.equal(await ev(`Object.keys(ZDRAVI_OBRAZKY).length`), 9);
assert.equal(await ev(`POMOC.filter(x => x.img).length`), 4);
assert.equal(await ev(`SITUACE.filter(x => x.img).length`), 2);
assert.ok(await ev(`POMOC.some(x => x.img === 'nos') && POMOC.some(x => x.img === 'vosa')`));
await ev(`document.querySelector('#plocha').innerHTML = Object.keys(ZDRAVI_OBRAZKY).map(obrazek).join(''); Promise.all([...document.querySelectorAll('.situace-obrazek')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelectorAll('.situace-obrazek').length`), 9);
assert.ok(await ev(`[...document.querySelectorAll('.situace-obrazek')].every(i => i.naturalWidth === 640 && i.alt.length > 25)`));
assert.ok(await ev(`[...document.querySelectorAll('.prehled-cisel img')].every(i => i.complete && i.naturalWidth === 640 && i.alt.length > 20)`));

for (const mode of ['cisla', 'pomoc', 'navyky']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
  assert.ok(await ev(`document.querySelectorAll('#plocha button').length >= 2`));
}
for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.querySelector('#plocha').innerHTML = obrazek('nos')`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-prv-05: 9 images, 3 modes, emergency overview, themes and widths OK'], runtimeErrors}));
ws.close();
