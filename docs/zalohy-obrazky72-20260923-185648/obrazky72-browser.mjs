import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => reject(Error(method + ' timeout')), 15000);
  pending.set(requestId, message => {
    clearTimeout(timer);
    message.error ? reject(Error(JSON.stringify(message.error))) : resolve(message.result);
  });
  ws.send(JSON.stringify({id: requestId, method, params}));
});
const ev = async expression => {
  const result = await call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const ready = async expression => {
  for (let i = 0; i < 100; i++) { if (await ev(expression)) return; await pause(50); }
  throw Error('Not ready: ' + expression);
};

const pages = ['cj1_pismena', 'slabiky', 'cj2_abeceda', 'cj2_tvrde_mekke', 'doplnovacky', 'vyjmenovana_slova'];
const results = [];
try {
  await call('Page.enable');
  await call('Runtime.enable');
  for (const page of pages) {
    await call('Page.navigate', {url: base + 'obsah/' + page + '.html'});
    await ready(`document.readyState === 'complete' && document.querySelector('#plocha, #tabule')`);

    if (page === 'cj1_pismena') {
      assert.equal(await ev('SLOVA.length'), 40);
      assert.ok(await ev(`document.querySelector('.obrazek-slova').naturalWidth > 0`));
      for (const mode of ['rozklad', 'skladani', 'prvni', 'posledni']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        await ev(`document.querySelector('.obrazek-slova').decode()`);
        assert.ok(await ev(`document.querySelector('.obrazek-slova').naturalWidth > 0`));
      }
    }
    if (page === 'slabiky') {
      await ev(`document.querySelector('[data-rezim="slova"]').click(); poradi=['pes']; idx=0; ukaz()`);
      await ev(`document.querySelector('.slovo-obrazek').decode()`);
      assert.ok(await ev(`document.querySelector('.slovo-obrazek').naturalWidth > 0`));
      assert.equal(await ev(`document.querySelector('.slovo-obrazek').alt`), 'Pes.');
    }
    if (page === 'cj2_abeceda') {
      assert.ok(await ev(`popisSlova('auto').includes('cj1-pismena-auto.webp')`));
      for (const mode of ['chybejici', 'prvni', 'serad']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'cj2_tvrde_mekke') {
      assert.equal(await ev(`document.querySelectorAll('.domek-pomucka').length`), 2);
      assert.ok(await ev(`[...document.querySelectorAll('.domek-pomucka')].every(i => i.naturalWidth > 0)`));
      for (const mode of ['doplnovani', 'trideni', 'kontrola']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'doplnovacky') {
      assert.equal(await ev(`document.querySelectorAll('.vyznamy img').length`), 8);
      assert.ok(await ev(`[...document.querySelectorAll('.vyznamy img')].every(i => i.naturalWidth > 0)`));
      await ev(`document.querySelector('[data-rezim="kontrola"]').click()`);
      assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
    }
    if (page === 'vyjmenovana_slova') {
      await ev(`document.querySelector('[data-rezim="prehled"]').click()`);
      assert.equal(await ev(`document.querySelectorAll('.obrazkova-rada img').length`), 41);
      await ev(`Promise.all([...document.querySelectorAll('.obrazkova-rada img')].map(i => i.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.obrazkova-rada img')].every(i => i.naturalWidth > 0)`));
      assert.ok(await ev(`obrazekSlova('býk').includes('vyjmenovana-b-byk.webp')`));
      assert.ok(await ev(`obrazekSlova('pelyněk').includes('vyjmenovana-l-pelynek.webp')`));
      assert.ok(await ev(`obrazekSlova('mýto').includes('vyjmenovana-m-myto.webp')`));
      assert.ok(await ev(`obrazekSlova('myš').includes('cj1-pismena-mys.webp')`));
      assert.ok(await ev(`obrazekSlova('slepýš').includes('vyjmenovana-p-slepys.webp')`));
      await ev(`document.querySelector('[data-rezim="serie"]').click()`);
      assert.ok(await ev(`document.querySelector('#plocha').textContent.includes('Spustit sérii')`));
      await ev(`document.querySelector('[data-rezim="prehled"]').click()`);
      await ev(`Promise.all([...document.querySelectorAll('.obrazkova-rada img')].map(i => i.decode()))`);
    }

    for (const width of [1280, 390, 320]) for (const theme of ['dark', 'light']) {
      await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: false});
      await ev(`document.documentElement.dataset.theme='${theme}'; Promise.all([...document.images].map(i => i.decode()))`);
      assert.equal(await ev(`document.documentElement.scrollWidth > innerWidth + 1`), false, page + ' overflow ' + width);
      assert.ok(await ev(`[...document.images].every(i => i.naturalWidth > 0)`));
      if (width === 390 && theme === 'light') {
        const shot = await call('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
        await writeFile('/tmp/obrazky72-' + page + '.png', Buffer.from(shot.data, 'base64'));
      }
    }
    results.push(page + ': images, modes, themes, widths OK');
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({results, runtimeErrors: errors}, null, 2));
} finally {
  ws.close();
}
