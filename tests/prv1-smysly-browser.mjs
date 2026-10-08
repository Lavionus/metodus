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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/prv1_smysly.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelector('.postava')?.complete`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
assert.ok(await ev(`document.querySelector('.postava').naturalWidth > 0`));
assert.equal(await ev(`document.querySelectorAll('.postava-wrap .cast').length`), 10);
assert.ok(await ev(`[...document.querySelectorAll('.postava-wrap .cast')].every(b => b.tagName === 'BUTTON' && b.getAttribute('aria-label'))`));
await ev(`document.querySelector('.postava-wrap .cast[data-cast="'+CASTI.find(c => c.nazev === document.querySelector('.zadani b').textContent).id+'"]').click()`);
assert.ok(await ev(`document.querySelector('.odezva').textContent.includes('Správně')`));

const vjemy = ['zvonek', 'citron', 'ruze', 'ohen', 'zmrzlina', 'trava', 'kocka', 'duha', 'bubinek', 'polstar'];
assert.equal(await ev(`VJEMY.filter(v => v.img).length`), 10);
await ev(`window.__puvodniVjemy = [...VJEMY]`);
for (const motiv of vjemy) {
  await ev(`VJEMY.splice(0, VJEMY.length, window.__puvodniVjemy.find(v => v.img === 'prv1-vjem-${motiv}')); vjem()`);
  await ev(`document.querySelector('.vjem-obrazek').decode()`);
  assert.ok(await ev(`document.querySelector('.vjem-obrazek').naturalWidth === 768`));
  assert.ok(await ev(`document.querySelector('.vjem-obrazek').src.endsWith('prv1-vjem-${motiv}.webp')`));
  assert.ok(await ev(`document.querySelector('.vjem-obrazek').alt.length > 15`));
}
await ev(`VJEMY.splice(0, VJEMY.length, ...window.__puvodniVjemy); delete window.__puvodniVjemy`);

for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
    assert.ok(await ev(`getComputedStyle(document.querySelector('.vjem-obrazek')).display !== 'none'`));
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['prv1_smysly: body image, 10 hotspots, 10 sense cards, answer, themes, widths OK'], runtimeErrors}));
ws.close();
