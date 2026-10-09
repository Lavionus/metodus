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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/prv5_zdravy_styl.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('#plocha')`)); i++) await new Promise(r => setTimeout(r, 50));

assert.equal(await ev(`POTRAVINY.length`), 30);
assert.deepEqual(await ev(`[1,2,3,4,5].map(p => POTRAVINY.filter(x => x.patro === p).length)`), [7, 6, 3, 8, 6]);
assert.equal(await ev(`new Set(POTRAVINY.map(x => x.n)).size`), 30);
await ev(`document.querySelector('#plocha').innerHTML = POTRAVINY.map(x => obrazekJidla(x)).join(''); Promise.all([...document.querySelectorAll('.potravina-obrazek')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelectorAll('.potravina-obrazek').length`), 30);
assert.ok(await ev(`[...document.querySelectorAll('.potravina-obrazek')].every(i => i.complete && i.naturalWidth >= 640 && i.alt.length > 10)`));

for (const mode of ['pyramida', 'volba', 'rezimDne', 'mytus']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
  assert.ok(await ev(`document.querySelectorAll('#plocha button').length >= 2`));
}
for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 1000, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.querySelector('#plocha').innerHTML = obrazekJidla(POTRAVINY[0])`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-prv-06: 30 food cards, 5 levels, 4 modes, themes and widths OK'], runtimeErrors}));
ws.close();
