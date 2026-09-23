// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/ramec-kostra.mjs.
// Společný rámec (todo.txt): kostra stránky, fáze, jednotná tlačítka,
// knihovna názorných prvků (nazor.js), rodiny témat a jejich společná data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(x => x.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
const pending = new Map(); let id = 0; let errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; const timer = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout: ' + method)); }, 30000);
  pending.set(n, m => { clearTimeout(timer); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expression => {
  const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const pause = ms => new Promise(r => setTimeout(r, ms));
const nav = async (soubor, cekej = 700) => { errors = []; await call('Page.navigate', { url: base + soubor }); await pause(cekej); };
const cekejNa = async (vyraz, ms = 6000) => { for (let t = 0; t < ms; t += 150) { if (await evaluate(vyraz)) return true; await pause(150); } return false; };
const velikost = (w, h, mobil = false) => call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mobil });
const vysledek = {};

try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true }); await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('metodus_posun', JSON.stringify({ rezim: 'auto', tempo: 'normal' }));
    window.__vyb = []; window.__ev = [];
    document.addEventListener('metodus:odpoved', e => window.__ev.push(e.detail.prvniPokus ? 'O1' : 'O'));
    document.addEventListener('DOMContentLoaded', () => { if (typeof Uloha !== 'undefined') { const o = Uloha.vyber; Uloha.vyber = v => { const r = o(v); window.__vyb.push({ v, r }); return r; }; } });` });

  // 1) Katalog: cíl u každé položky, rodiny bez duplicit, existující soubory.
  await nav('obsah/osnova.html');
  const katalog = await evaluate(`({ polozky: KATALOG_SEKCE.flatMap(s => s.polozky).map(p => ({ soubor: p.soubor, cil: p.cil, rodina: p.rodina || '' })),
    rodiny: KATALOG_RODINY.map(r => ({ id: r.id, hlavni: r.hlavni, cesta: r.cesta })) })`);
  const soubory = [...new Set(katalog.polozky.map(p => p.soubor))].sort();
  assert.equal(soubory.length, 255);
  for (const p of katalog.polozky) assert.ok(p.cil && p.cil.length > 15, 'cíl ' + p.soubor);
  const clenove = katalog.rodiny.flatMap(r => r.cesta);
  assert.equal(clenove.length, new Set(clenove).size, 'stránka nejvýš v jedné rodině');
  for (const r of katalog.rodiny) { assert.ok(r.cesta.includes(r.hlavni), r.id); for (const f of r.cesta) assert.ok(soubory.includes(f), f); }
  assert.equal(await evaluate(`document.querySelectorAll('#rodinyMrizka .rodina').length`), katalog.rodiny.length);
  vysledek.katalog = { polozek: soubory.length, rodin: katalog.rodiny.length, vRodinach: clenove.length };

  // 2) Kostra na všech stránkách katalogu: bez výjimek, na 390 px bez přetečení.
  await velikost(390, 844, true);
  const bezKostry = [], sChybou = [], pretek = [];
  for (const f of soubory) {
    await nav(f, 500);
    if (!await cekejNa(`!!document.querySelector('.kostra')`, f.endsWith('iss.html') || f.endsWith('planet_globe.html') ? 12000 : 5000)) bezKostry.push(f);
    if (errors.length) sChybou.push(f + ': ' + (errors[0].exception?.description || errors[0].text).split('\n')[0]);
    if (await evaluate(`document.documentElement.scrollWidth > innerWidth + 1`)) pretek.push(f);
  }
  assert.deepEqual(bezKostry, []); assert.deepEqual(sChybou, []); assert.deepEqual(pretek, []);
  await velikost(1366, 900);
  vysledek.kostra = { stranek: soubory.length };

  // 3) Hlavička lekce: předmět, cíl z katalogu, fáze, rodina, zápatí.
  await nav('obsah/cj4_pady.html', 900);
  const hlava = await evaluate(`({
    predmet: document.querySelector('.kostra-predmet').textContent,
    cil: document.querySelector('.kostra-cil').textContent,
    faze: [...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze),
    kroky: document.querySelectorAll('.kostra-cesta li').length,
    zapati: document.querySelectorAll('.kostra-zapati a').length,
    barva: getComputedStyle(document.documentElement).getPropertyValue('--predmet').trim(),
    barvaCj: getComputedStyle(document.documentElement).getPropertyValue('--predmet-cj').trim() })`);
  assert.match(hlava.predmet, /Český jazyk/);
  assert.match(hlava.cil, /Po této lekci: Určím pád/);
  assert.deepEqual(hlava.faze, ['vyuka', 'procvic', 'overse', 'tahak']);
  assert.equal(hlava.kroky, katalog.rodiny.find(r => r.cesta.includes('obsah/cj4_pady.html')).cesta.length);
  assert.ok(hlava.zapati >= 2);
  assert.equal(hlava.barva, hlava.barvaCj);
  // pilot má vlastní rozepsaný cíl – kostra ho neopakuje; Ukázka vede na vedenou aktivitu
  await nav('obsah/ch9_ph.html', 900);
  assert.equal(await evaluate(`document.querySelector('.kostra-cil')`), null);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze)`), ['vyuka', 'ukazka', 'procvic', 'overse', 'tahak']);
  // simulace na celou obrazovku: jednořádková kostra, bez zápatí, nic mimo okno
  await nav('obsah/geometricke_konstrukce.html', 1200);
  const app = await evaluate(`({ kompakt: document.querySelector('.kostra').classList.contains('kostra-kompakt'),
    spodek: document.querySelector('.app').getBoundingClientRect().bottom, okno: innerHeight, zapati: !!document.querySelector('.kostra-zapati') })`);
  assert.ok(app.kompakt && !app.zapati && app.spodek <= app.okno);
  vysledek.hlavicka = hlava;

  // 4) Tahák: dialog s pravidly ze stránky.
  await nav('obsah/cj4_pady.html', 900);
  await evaluate(`document.querySelector('.kostra-faze [data-faze=tahak]').click()`);
  assert.ok(await evaluate(`document.querySelector('dialog.kostra-dialog').open && /Vzory rodu mužského/i.test(document.querySelector('.kostra-tahak-obsah').textContent)`));
  await evaluate(`document.querySelector('dialog.kostra-dialog').close()`);

  // 5) Ověř se na lekci s uloha.js: 8 otázek napříč režimy, bez nápovědy, výsledek se uloží.
  await evaluate(`localStorage.removeItem('metodus_overeni'); document.querySelector('.kostra-faze [data-faze=overse]').click()`);
  await cekejNa(`!!document.querySelector('.kostra-overeni')`);
  assert.equal(await evaluate(`getComputedStyle(document.getElementById('btnNapoveda')).display`), 'none');
  const rezimy = new Set();
  for (let i = 0; i < 8; i++) {
    const n0 = await evaluate(`window.__vyb.length`);
    rezimy.add(await evaluate(`document.querySelector('#rezimy .active').dataset.rezim`));
    await evaluate(`(() => { const p = window.__vyb.at(-1); const bs = [...p.r.prvek.querySelectorAll('button')];
      if (${i % 3 === 1}) bs.find(b => b.dataset.klic !== String(p.v.spravnyKlic)).click();
      bs.find(b => b.dataset.klic === String(p.v.spravnyKlic)).click(); })()`);
    if (i < 7) await cekejNa(`window.__vyb.length > ${n0}`, 8000);
  }
  assert.ok(await cekejNa(`!!document.querySelector('.kostra-vysledek')`, 6000));
  const ulozeno = await evaluate(`JSON.parse(localStorage.getItem('metodus_overeni'))['cj4_pady.html'].at(-1)`);
  assert.equal(ulozeno.celkem, 8); assert.equal(ulozeno.spravne, 5);
  assert.ok(rezimy.size >= 3, 'otázky napříč režimy');
  assert.notEqual(await evaluate(`getComputedStyle(document.getElementById('btnNapoveda')).display`), 'none');
  assert.match(await evaluate(`document.querySelector('[data-faze=overse]').textContent`), /naposledy 5\/8/);
  vysledek.overse = { ...ulozeno, rezimu: rezimy.size };

  // 6) Ověř se na úloze s vlastním vstupem (procvic.js „vlastni“ – víc políček
  // pro koeficienty rovnice). Ručně psané Kostra.odpoved už žádná stránka nemá.
  await nav('obsah/vycislovani_rovnic.html', 900);
  await evaluate(`localStorage.removeItem('metodus_overeni'); document.querySelector('.kostra-faze [data-faze=overse]').click()`);
  await cekejNa(`!!document.querySelector('.kostra-overeni')`);
  for (let i = 0; i < 120 && !await evaluate(`!!document.querySelector('.kostra-vysledek')`); i++) {
    await evaluate(`(() => {
      const inp = document.querySelector('#plocha .clen input:not(:disabled)');
      if (inp) { inp.value = '9797'; inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); return; }
      const dal = [...document.querySelectorAll('button')].find(b => b.offsetParent && /Pokračovat/.test(b.textContent) && !b.closest('.kostra'));
      if (dal) dal.click();
    })()`);
    await pause(250);
  }
  assert.ok(await evaluate(`!!document.querySelector('.kostra-vysledek')`), 'úloha s vlastním vstupem doběhne do výsledku');
  const vycisl = await evaluate(`JSON.parse(localStorage.getItem('metodus_overeni'))['vycislovani_rovnic.html'].at(-1)`);
  assert.equal(vycisl.celkem, 8); assert.equal(vycisl.spravne, 0);

  // 7) Jednotná tlačítka: žádné staré popisky u úloh.
  const stare = [];
  for (const [f, sel] of [['obsah/procenta.html', '#startBtn'], ['obsah/rovnice.html', '#startBtn'], ['obsah/m1_porovnavani.html', '#btnDalsi'], ['obsah/flags_quiz.html', '#startBtn'], ['obsah/vycislovani_rovnic.html', '#startBtn']]) {
    await nav(f, 500);
    const t = await evaluate(`document.querySelector('${sel}').textContent.trim()`);
    if (/^(Potvrdit|Další →|▶️ Start|💡 Napovědět)$/.test(t)) stare.push(f + ': ' + t);
  }
  assert.deepEqual(stare, []);

  // 8) Knihovna názorných prvků: zlomky, osa, procenta, věta, časová osa.
  await nav('docs/nazor-ukazky.html', 600);
  const prvky = await evaluate(`({ kolac: document.querySelectorAll('.nazor-kolac path.plna').length, osa: document.querySelectorAll('.nazor-osa').length,
    procenta: !!document.querySelector('.nazor-procenta'), clenu: document.querySelectorAll('.nazor-slovo[class*=clen-]').length,
    cas: document.querySelectorAll('.nazor-cas-udalost').length, minus: document.querySelector('.nazor-osa text').textContent })`);
  assert.deepEqual([prvky.kolac, prvky.osa, prvky.procenta, prvky.clenu, prvky.cas], [3, 2, true, 5, 6]);
  assert.equal(prvky.minus, '−5');
  // barvy větných členů jsou na všech stránkách stejné (tokeny v common.css)
  const barvy = [];
  for (const f of ['obsah/vetny_rozbor.html', 'obsah/cj5_skladebni_dvojice.html', 'obsah/shoda_podmetu.html']) {
    await nav(f, 500); barvy.push(await evaluate(`getComputedStyle(document.documentElement).getPropertyValue('--clen-podmet').trim()`));
  }
  assert.equal(new Set(barvy).size, 1);
  // celá čísla: po správném sčítání posun po společné ose
  await nav('obsah/m7_cela_cisla.html', 800);
  await evaluate(`document.querySelector('[data-rezim=operace]').click()`); await pause(200);
  await evaluate(`(() => { const p = window.__vyb.at(-1); [...p.r.prvek.querySelectorAll('button')].find(b => b.dataset.klic === String(p.v.spravnyKlic)).click(); })()`);
  assert.ok(await cekejNa(`!!document.querySelector('#plocha .nazor-osa')`, 2000));
  // procenta: proužek 0–100 % po odpovědi
  await nav('obsah/procenta.html', 600);
  for (let k = 0; k < 2; k++) {   // dvakrát vedle → karta ukáže postup a proužek
    await evaluate(`(() => { const p = document.querySelector('#plocha input.odpoved-pole'); p.value = '9797'; p.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()`);
    await pause(100);
  }
  assert.ok(await evaluate(`!!document.querySelector('#plocha .karta .nazor-procenta')`));

  // 9) Společná data rodin: jedna pravda pro souběžné stránky.
  await nav('obsah/flags_quiz.html', 500);
  const vlajky = await evaluate(`WORLD.find(s => s[1] === 'USA')[2]`);
  await nav('obsah/svetova_hlavni_mesta.html', 500);
  assert.equal(await evaluate(`STATY.find(s => s[0] === 'USA')[1]`), vlajky);
  assert.ok(await evaluate(`STATY.some(s => s[2] === 'Evropa')`));
  await nav('obsah/casova_osa.html', 500);
  assert.equal(await evaluate(`UDALOSTI.length`), await evaluate(`METODUS_UDALOSTI.filter(u => u.pruh === 'cr').length`));
  assert.ok(await evaluate(`document.querySelectorAll('#osaNazor .nazor-cas-pruh').length === 2`));
  await nav('obsah/pr9_mineraly.html', 500);
  await evaluate(`document.querySelector('[data-rezim=vzorky]').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('.stul-vzorku tbody tr').length`), await evaluate(`METODUS_HORNINY.length`));
  await nav('obsah/prv4_horniny.html', 500);
  assert.equal(await evaluate(`VZORKY === METODUS_HORNINY`), true);
  for (const f of ['obsah/prv2_zdravi.html', 'obsah/pr8_prvni_pomoc.html']) {
    await nav(f, 500); assert.equal(await evaluate(`METODUS_TISNOVA.length`), 4);
  }

  // 10) Bez stálých postav (Anna a Ben odstraněni).
  await nav('obsah/aj9_neprima_rec.html', 800);
  assert.ok(!await evaluate(`/\\bAnna\\b|\\bBen\\b/.test(document.body.textContent)`));

  // 11) Service worker předcachuje sdílené soubory rámce.
  const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  for (const f of ['kostra.js', 'kostra.css', 'nazor.js', 'nazor.css', 'data/udalosti.js', 'data/staty.js', 'data/horniny.js', 'data/tisnova_cisla.js']) assert.ok(sw.includes(`'./${f}'`), f);

  console.log(JSON.stringify({ ok: true, ...vysledek }, null, 2));
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  ws.close();
}
