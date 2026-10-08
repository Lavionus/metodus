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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/aj6_stupnovani.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('#plocha')`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
assert.equal(await ev(`OBRAZKY.length`), 5);
assert.equal(await ev(`OBRAZKY.flatMap(x => x.soubory).length`), 15);
await ev(`window.__puvodniNahodne = Uloha.nahodne; window.__puvodniRandom = Math.random`);
for (let i = 0; i < 5; i++) {
  await ev(`Uloha.nahodne = a => a === OBRAZKY ? OBRAZKY[${i}] : window.__puvodniNahodne(a); Math.random = () => 0; porovnani(); Promise.all([...document.querySelectorAll('.porovnani img')].map(x => x.decode()))`);
  assert.equal(await ev(`document.querySelectorAll('.porovnani img').length`), 3);
  assert.ok(await ev(`[...document.querySelectorAll('.porovnani img')].every(x => x.naturalWidth === 768 && x.alt.length > 5)`));
  assert.ok(await ev(`document.querySelector('.veta-en').textContent.includes('than')`));
  await ev(`Math.random = () => 0.9; porovnani(); Promise.all([...document.querySelectorAll('.porovnani img')].map(x => x.decode()))`);
  assert.ok(await ev(`document.querySelector('.veta-en').textContent.includes('large') && !document.querySelector('.veta-en').textContent.includes('than')`));
}
await ev(`Uloha.nahodne = window.__puvodniNahodne; Math.random = window.__puvodniRandom`);
for (const mode of ['stupen', 'pravidlo', 'veta', 'porovnani']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
}
for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.querySelector('[data-rezim="porovnani"]').click()`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-aj-09: 5 triplets, 15 images, comparative/superlative, 4 modes, themes and widths OK'], runtimeErrors}));
ws.close();
