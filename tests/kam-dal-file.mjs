// Regrese: odkazy „Kam dál“ musí fungovat i při místním otevření indexu přes file://.
import assert from 'node:assert/strict';

const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(x => x.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => { ws.onopen = resolve; });

const pending = new Map();
let id = 0;
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  }
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  pending.set(requestId, message => message.error
    ? reject(new Error(JSON.stringify(message.error)))
    : resolve(message.result));
  ws.send(JSON.stringify({ id: requestId, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const waitFor = async expression => {
  for (let elapsed = 0; elapsed < 6000; elapsed += 100) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Časový limit při čekání na: ' + expression);
};

try {
  await call('Runtime.enable');
  await call('Page.enable');
  const start = new URL('../index.html#obsah/ch9_ph.html', import.meta.url).href;
  await call('Page.navigate', { url: start });
  await waitFor(`document.querySelector('iframe')?.contentDocument?.querySelector('.navaznosti a[data-lekce]')`);
  assert.equal(await evaluate(`location.protocol`), 'file:');
  await evaluate(`document.querySelector('iframe').contentDocument.querySelector('.navaznosti a[data-lekce]').click()`);
  await waitFor(`location.hash === '#obsah/vycislovani_rovnic.html'`);
  assert.match(await evaluate(`document.querySelector('iframe').src`), /\/obsah\/vycislovani_rovnic\.html$/);
  console.log('OK: file:// index → Kam dál → vycislovani_rovnic.html');
} finally {
  ws.close();
}
