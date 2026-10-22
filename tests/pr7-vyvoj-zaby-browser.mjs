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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/pr7_obratlovci_studenokrevni.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelectorAll('.vyvoj-rada img').length === 5`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
await ev(`Promise.all([...document.querySelectorAll('.vyvoj-rada img')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelectorAll('.vyvoj-rada li').length`), 5);
assert.ok(await ev(`[...document.querySelectorAll('.vyvoj-rada img')].every(i => i.naturalWidth === 768 && i.naturalHeight === 768 && i.alt.length > 25)`));
assert.deepEqual(await ev(`[...document.querySelectorAll('.vyvoj-rada figcaption')].map(x => x.textContent.trim())`),
  ['vajíčka', 'pulec', 'pulec s nohama', 'mladá žabka', 'dospělá žába']);
assert.equal(await ev(`VYVOJ_ZABY.length`), 5);

for (const mode of ['skupina', 'stavba', 'poznavacka', 'tvrzeni', 'vyvoj']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
}
await ev(`window.__puvodniNahodne = Uloha.nahodne; Uloha.nahodne = () => VYVOJ_ZABY[2]; vyvoj(); document.querySelector('.druh-obrazek').decode()`);
assert.ok(await ev(`document.querySelector('.druh-obrazek').src.endsWith('pr7-vyvoj-zaby-pulec-nohy.webp')`));
assert.equal(await ev(`document.querySelectorAll('#plocha .moznosti button').length`), 5);
await ev(`[...document.querySelectorAll('#plocha .moznosti button')].find(b => b.textContent.includes('pulec s nohama')).click()`);
assert.ok(await ev(`document.querySelector('#plocha .odezva').textContent.includes('pulec s nohama')`));
await ev(`Uloha.nahodne = window.__puvodniNahodne`);

for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-pr-12: 5 stages, exercise, 5 modes, themes and widths OK'], runtimeErrors}));
ws.close();
