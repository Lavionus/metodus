// Fotografické sady C a historické doklady E (21. 10. 2026 a dál):
// obrázky se načtou, stránka vypíše seznam zdrojů (autor, licence, odkaz)
// a v šířkách 1366/390/320 px ve světlém i tmavém motivu nic nepřetéká.
// Spuštění: node tests/foto-atlasy-browser.mjs [stranka.html …]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const STRANKY = {
  'd6_recko.html': { sada: 'IMG-d-01', obrazku: 7 },
  'pr6_houby.html': { sada: 'IMG-pr-01', obrazku: 35 },
  'pr7_obratlovci_studenokrevni.html': { sada: 'IMG-pr-05', obrazku: 14 },
  'pr7_ptaci_savci.html': { sada: 'IMG-pr-05', obrazku: 20 },
  'pr6_bezobratli.html': { sada: 'IMG-pr-05', obrazku: 6 },
  'pr7_rostliny.html': { sada: 'IMG-pr-10', obrazku: 12 },
  'prv3_ziva_neziva.html': { sada: 'IMG-prv-12', obrazku: 16 },
  'd9_prvni_valka.html': { sada: 'IMG-d-20', obrazku: 8 },
  'd9_druha_valka.html': { sada: 'IMG-d-22', obrazku: 9 },
  'cj9_literatura_20.html': { sada: 'IMG-cj-13', obrazku: 15 },
  'eu_instituce.html': { sada: 'IMG-d-19', obrazku: 4 },
  'd6_rim.html': { sada: 'IMG-d-03', obrazku: 6 },
  'd6_stary_orient.html': { sada: 'IMG-d-05', obrazku: 6 },
  'd6_prameny.html': { sada: 'IMG-d-06', obrazku: 8 },
  'd6_pravek.html': { sada: 'IMG-d-08', obrazku: 5 },
  'd7_rany_stredovek.html': { sada: 'IMG-d-10', obrazku: 5 },
  'd7_husitstvi.html': { sada: 'IMG-d-12', obrazku: 5 },
  'd7_lucemburkove.html': { sada: 'IMG-d-13', obrazku: 7 },
  'd7_premyslovci.html': { sada: 'IMG-d-14', obrazku: 4 },
  'prv4_nejstarsi_dejiny.html': { sada: 'IMG-prv-22', obrazku: 6 },
};
const vyber = process.argv.slice(2);
const zdroje = JSON.parse(readFileSync(new URL('../data/obrazky-zdroje.json', import.meta.url)));

const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(ok => ws.onopen = ok);
let id = 0; const pending = new Map(); let chyby = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') chyby.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
};
const call = (method, params = {}) => new Promise((ok, ko) => {
  const r = ++id, t = setTimeout(() => ko(Error(method + ' timeout')), 20000);
  pending.set(r, m => { clearTimeout(t); m.error ? ko(Error(JSON.stringify(m.error))) : ok(m.result); });
  ws.send(JSON.stringify({ id: r, method, params }));
});
const ev = async expression => {
  const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const cekej = async (vyraz, ms = 8000) => {
  for (let t = 0; t < ms; t += 100) { if (await ev(vyraz)) return true; await new Promise(r => setTimeout(r, 100)); }
  return false;
};

await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
// vždy čerstvé soubory: bez HTTP cache a bez service workeru
await call('Network.setCacheDisabled', { cacheDisabled: true }); await call('Network.setBypassServiceWorker', { bypass: true });
const vysledky = [];
for (const [stranka, { sada, obrazku }] of Object.entries(STRANKY)) {
  if (vyber.length && !vyber.includes(stranka)) continue;
  chyby = [];
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: 'http://127.0.0.1:8766/obsah/' + stranka });
  await cekej(`document.readyState === 'complete'`);
  // všechny obrázky sady jsou na stránce a načtou se
  const nacteno = await ev(`(async () => {
    const imgs = [...document.querySelectorAll('img[src*="img/"]')];
    imgs.forEach(i => i.loading = 'eager');
    return Promise.all(imgs.map(i => i.complete && i.naturalWidth ? i.getAttribute('src')
      : new Promise(ok => { i.onload = () => ok(i.getAttribute('src')); i.onerror = () => ok('CHYBA ' + i.getAttribute('src')); })));
  })()`);
  assert.deepEqual(nacteno.filter(s => s.startsWith('CHYBA')), [], stranka);
  const ocekavane = zdroje.stranky['obsah/' + stranka].map(i => zdroje.zdroje[i]);
  // seznam zdrojů: všechny položky, každá s odkazem na zdroj
  assert.ok(await cekej(`!!document.querySelector('details.zdroje-obrazku')`), stranka + ': chybí seznam zdrojů');
  const polozek = await ev(`document.querySelectorAll('.zdroje-obrazku li').length`);
  assert.equal(polozek, ocekavane.length, stranka + ': počet zdrojů');
  assert.ok(ocekavane.length >= obrazku, stranka + `: v datech jen ${ocekavane.length} zdrojů sady ${sada}`);
  assert.equal(await ev(`[...document.querySelectorAll('.zdroje-obrazku li')].every(li => li.querySelector('a[href^="https://"]'))`), true, stranka + ': položka bez odkazu');
  // šířky a motivy
  for (const width of [1366, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
    for (const theme of ['light', 'dark']) {
      await ev(`document.documentElement.dataset.theme = ${JSON.stringify(theme)}; document.querySelector('.zdroje-obrazku').open = true`);
      await new Promise(r => setTimeout(r, 150));
      const pretok = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
      assert.ok(pretok <= 0, `${stranka} ${width}px ${theme}: přetéká o ${pretok} px`);
    }
  }
  assert.deepEqual(chyby, [], stranka + ': chyby JS');
  vysledky.push(`${sada} ${stranka}: ${nacteno.length} obrázků, ${polozek} zdrojů, 1366/390/320 OK`);
  await call('Page.navigate', { url: 'about:blank' });
}
console.log(vysledky.join('\n'));
ws.close();
