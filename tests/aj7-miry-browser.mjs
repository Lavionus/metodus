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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/aj7_pocitatelnost.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('#plocha')`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
assert.equal(await ev(`MIRY.length`), 12);
assert.equal(await ev(`new Set(MIRY.map(x => x.img)).size`), 12);
await ev(`window.__puvodniNahodne = Uloha.nahodne`);
for (let i = 0; i < 12; i++) {
  await ev(`Uloha.nahodne = a => a === MIRY ? MIRY[${i}] : window.__puvodniNahodne(a); miry(); document.querySelector('.mira-obrazek').decode()`);
  assert.ok(await ev(`document.querySelector('.mira-obrazek').naturalWidth === 768`));
  assert.ok(await ev(`document.querySelector('.mira-obrazek').alt.length > 10`));
  assert.ok(await ev(`[...document.querySelectorAll('.moznosti button')].some(b => b.textContent.trim() === MIRY[${i}].spravne)`));
}
await ev(`Uloha.nahodne = window.__puvodniNahodne; delete window.__puvodniNahodne`);

for (const mode of ['trideni', 'someAny', 'muchMany', 'miry']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
}
for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-aj-11: 12 measure cards, correct choices, 4 modes, themes and widths OK'], runtimeErrors}));
ws.close();
