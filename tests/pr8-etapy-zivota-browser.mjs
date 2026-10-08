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
await call('Page.navigate', {url: 'http://127.0.0.1:8766/obsah/pr8_rozmnozovani.html'});
for (let i = 0; i < 100 && !(await ev(`document.readyState === 'complete' && document.querySelectorAll('.etapy-rada img').length === 8`)); i++) {
  await new Promise(resolve => setTimeout(resolve, 50));
}
await ev(`Promise.all([...document.querySelectorAll('.etapy-rada img')].map(i => i.decode()))`);
assert.equal(await ev(`document.querySelectorAll('.etapy-rada li').length`), 8);
assert.ok(await ev(`[...document.querySelectorAll('.etapy-rada img')].every(i => i.naturalWidth === 768 && i.naturalHeight === 768 && i.alt.length > 20)`));
assert.deepEqual(await ev(`[...document.querySelectorAll('.etapy-rada figcaption')].map(x => x.textContent.trim())`),
  ['novorozenec', 'batole', 'předškolák', 'školák', 'dospívající', 'dospělý', 'starší dospělý', 'senior']);
assert.equal(await ev(`ETAPY.length`), 8);
assert.equal(await ev(`document.querySelectorAll('[data-atlas]').length`), 2);
assert.equal(await ev(`document.querySelectorAll('.hotspot').length`), 4);
await ev(`document.querySelector('#atlasObrazek img').decode()`);
assert.ok(await ev(`document.querySelector('#atlasObrazek img').naturalWidth === 768`));
await ev(`document.querySelector('.hotspot').click()`);
assert.ok(await ev(`document.querySelector('#atlasDetail h3').textContent.includes('Vaječník')`));
assert.equal(await ev(`document.querySelector('.hotspot').getAttribute('aria-pressed')`), 'true');
await ev(`document.querySelector('[data-atlas="muzska"]').click(); document.querySelector('#atlasObrazek img').decode()`);
assert.ok(await ev(`document.querySelector('#atlasObrazek img').src.endsWith('pr8-soustava-muzska.webp')`));
assert.equal(await ev(`document.querySelectorAll('.hotspot').length`), 4);
await ev(`document.querySelector('.hotspot').focus()`);
assert.ok(await ev(`document.activeElement.classList.contains('hotspot')`));

for (const mode of ['soustava', 'predNarozenim', 'etapy', 'dospivani']) {
  await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
  assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
}
await ev(`window.__puvodniNahodne=Uloha.nahodne; window.__puvodniRandom=Math.random; Uloha.nahodne=()=>ETAPY[7]; Math.random=()=>0; etapy(); document.querySelector('.etapy-obrazek').decode()`);
assert.ok(await ev(`document.querySelector('.etapy-obrazek').src.endsWith('pr8-etapy-senior.webp')`));
assert.ok(await ev(`document.querySelector('.etapa').textContent.includes('stáří')`));
await ev(`[...document.querySelectorAll('#plocha .moznosti button')].find(b => b.textContent.includes('přibližně od 65 let')).click()`);
assert.ok(await ev(`document.querySelector('#plocha .odezva').textContent.includes('stáří')`));
await ev(`Uloha.nahodne=window.__puvodniNahodne; Math.random=window.__puvodniRandom`);

for (const width of [1366, 390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: width < 600});
  for (const theme of ['light', 'sepia-tmava']) {
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth > document.documentElement.clientWidth`), false, `overflow ${width} ${theme}`);
  }
}
assert.deepEqual(runtimeErrors, []);
console.log(JSON.stringify({results: ['IMG-pr-15: 8 life stages and timeline OK', 'IMG-pr-16: 2 atlas diagrams, 8 hotspots, keyboard focus, 4 modes, themes and widths OK'], runtimeErrors}));
ws.close();
