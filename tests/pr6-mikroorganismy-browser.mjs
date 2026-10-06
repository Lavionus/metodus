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
  if (msg.method === 'Runtime.exceptionThrown') runtimeErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/pr6_mikroorganismy.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelectorAll('.mikro-grid img').length === 5`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
await ev(`Promise.all([...document.querySelectorAll('.mikro-grid img')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelectorAll('.mikro-grid details').length`), 5);
assert.ok(await ev(`[...document.querySelectorAll('.mikro-grid img')].every(i => i.naturalWidth === 768 && i.naturalHeight === 768 && i.alt.length > 30)`));
assert.equal(await ev(`ORGANISMY.filter(x => x.img).length`), 5);
assert.ok(await ev(`document.querySelector('.atlas-mikro > p').textContent.includes('ne mikrofotografie')`));

for (const mode of ['poznej', 'virusBakterie', 'uzitek', 'prevence']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
}
await ev(`window.__puvodniNahodne=Uloha.nahodne; Uloha.nahodne=()=>ORGANISMY[1]; poznej(); document.querySelector('.mikro-img').decode()`);
assert.ok(await ev(`document.querySelector('.mikro-img').src.endsWith('pr6-mikro-virus.webp')`));
assert.ok(await ev(`document.querySelector('.mikro-img').alt.includes('virové částice')`));
await ev(`[...document.querySelectorAll('#plocha .moznosti button')].find(b => b.textContent.trim() === 'virus').click()`);
assert.ok(await ev(`document.querySelector('#plocha .odezva').textContent.includes('virus')`));
await ev(`Uloha.nahodne=window.__puvodniNahodne`);

for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-pr-09: 5 models, atlas, quiz, 4 modes, themes and widths OK'], runtimeErrors}));
ws.close();
