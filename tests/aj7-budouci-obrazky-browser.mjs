import assert from 'node:assert/strict';

const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let id = 0;
const pending = new Map();
const runtimeErrors = [];
ws.onmessage = event => {
  const msg = JSON.parse(event.data);
  if (msg.id) { pending.get(msg.id)?.(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') runtimeErrors.push(msg.params.exceptionDetails.text);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => reject(Error(method + ' timeout')), 15000);
  pending.set(requestId, msg => {
    clearTimeout(timer);
    msg.error ? reject(Error(JSON.stringify(msg.error))) : resolve(msg.result);
  });
  ws.send(JSON.stringify({id: requestId, method, params}));
});
const ev = async expression => {
  const result = await call('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true});
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
};

await call('Page.enable');
await call('Runtime.enable');
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/aj7_budouci.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && typeof volba === 'function'`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
assert.equal(await ev(`SITUACE.filter(s => s.img).length`), 4);
assert.equal(await ev(`beTvar('The glass <span>?</span> fall.')`), 'is');
assert.equal(await ev(`beTvar('The car <span>?</span> stop.')`), 'is');
assert.equal(await ev(`beTvar('My sister <span>?</span> study.')`), 'is');

for (let index = 0; index < 4; index++) {
  await ev(`Uloha.nahodne=()=>SITUACE.filter(s=>s.img)[${index}]; volba(); document.querySelector('.dukaz-obrazek').decode()`);
  assert.ok(await ev(`document.querySelector('.dukaz-obrazek').naturalWidth > 0 && document.querySelector('.dukaz-obrazek').alt.length > 20`));
  await ev(`funkce(); document.querySelector('.dukaz-obrazek').decode()`);
  assert.ok(await ev(`document.querySelector('.dukaz-obrazek').naturalWidth > 0`));
}

for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['aj7_budouci: 4 images, grammar, modes, themes, widths OK'], runtimeErrors}));
ws.close();
