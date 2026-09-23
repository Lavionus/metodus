// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa03-navigace.mjs.
// Mobilní navigace rozcestníku: hlavička na jednom řádku, nabídka „Další",
// ovládání klávesnicí a zřetelné zrušení filtrů. Test používá izolovaný profil.
import assert from 'node:assert/strict';
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
  const n = ++id; const timer = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout: ' + method)); }, 20000);
  pending.set(n, m => { clearTimeout(timer); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expression => {
  const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
// Klávesa se posílá tak, jak ji posílá prohlížeč — jinak tlačítko Enter neaktivuje.
const KLAVESY = {
  Enter: { code: 'Enter', vk: 13, text: '\r' },
  Escape: { code: 'Escape', vk: 27 },
  ArrowDown: { code: 'ArrowDown', vk: 40 },
  ArrowUp: { code: 'ArrowUp', vk: 38 },
  Tab: { code: 'Tab', vk: 9 },
  ' ': { code: 'Space', vk: 32, text: ' ' }
};
const klavesa = async key => {
  const k = KLAVESY[key];
  const spolecne = { key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk };
  await call('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', ...spolecne, text: k.text });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', ...spolecne });
};
const sirka = async w => call('Emulation.setDeviceMetricsOverride', { width: w, height: 844, deviceScaleFactor: 1, mobile: false });
const nacti = async (url = base) => {
  await call('Page.navigate', { url });
  for (let i = 0; i < 160; i++) {
    // konec skriptu poznáme podle proměnných z jeho poslední části (dřív jsou v TDZ)
    if (await evaluate(`document.readyState==='complete' && (()=>{try{return !!viceMenu && !!zrusitFiltry}catch(e){return false}})()`)) break;
    await new Promise(r => setTimeout(r, 50));
  }
  await new Promise(r => setTimeout(r, 300));
};
try {
  await call('Runtime.enable'); await call('Page.enable');
  // servisní worker by podával starou verzi z cache — test musí číst soubory ze serveru
  await call('Network.enable'); await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  // čistý výchozí stav filtrů, ať test nezávisí na dřívějším profilu
  await call('Page.addScriptToEvaluateOnNewDocument', { source:
    `try{['metodus_skupina','metodus_rocnik','metodus_zobraz_plan','metodus_oblibene'].forEach(k=>localStorage.removeItem(k));}catch(e){}` });
  const vysledky = {};

  // 1) Úzká hlavička: jeden řádek, celý název, jen čtyři ovládací prvky.
  await sirka(390); await nacti();
  const hlavicka = await evaluate(`(() => {
    const h1 = document.querySelector('.hlavicka h1');
    const viditelne = [...document.querySelectorAll('.hlavicka button')].filter(b => b.offsetParent !== null);
    // řádky poznáme podle svislých středů: rozdíl do 8 px je stále jeden řádek
    const stredy = viditelne.map(b => { const r = b.getBoundingClientRect(); return r.top + r.height / 2; });
    const radky = stredy.reduce((acc, s) => (acc.some(x => Math.abs(x - s) <= 8) ? acc : [...acc, s]), []);
    return {
      nazev: h1.textContent.trim(), orezany: h1.scrollWidth > h1.clientWidth + 1,
      tlacitka: viditelne.map(b => b.id), radku: radky.length,
      vyskaHlavicky: Math.round(document.querySelector('.hlavicka').getBoundingClientRect().height),
      viceSkryte: viceMenu.hidden
    };
  })()`);
  assert.equal(hlavicka.nazev, 'Metodus', 'celý název v hlavičce: ' + hlavicka.nazev);
  assert.equal(hlavicka.orezany, false, 'název není oříznutý');
  assert.deepEqual(hlavicka.tlacitka, ['hamburger', 'btnDomu', 'btnVice'], 'viditelná tlačítka: ' + hlavicka.tlacitka);
  assert.equal(hlavicka.radku, 1, 'hlavička na jednom řádku');
  assert.equal(hlavicka.viceSkryte, true, 'nabídka Další je zavřená');
  vysledky.hlavicka390 = hlavicka;

  // 2) Nabídka „Další" obsahuje zbylé akce i s popiskem a funguje z klávesnice.
  await evaluate(`btnVice.focus()`);
  await klavesa('Enter');
  const nabidka = await evaluate(`({
    otevrena: !viceMenu.hidden, aria: btnVice.getAttribute('aria-expanded'),
    polozky: [...viceMenu.querySelectorAll('button, select')].map(b => b.id),
    popisky: [...viceMenu.querySelectorAll('button, select')].map(b => (b.closest('label') || b).querySelector('.popis')?.textContent.trim()),
    role: viceMenu.querySelector('button').getAttribute('role'),
    fokus: document.activeElement.id
  })`);
  assert.equal(nabidka.otevrena, true, 'nabídka se otevře Enterem');
  assert.equal(nabidka.aria, 'true', 'aria-expanded po otevření');
  assert.deepEqual(nabidka.polozky, ['btnOsnova', 'btnUcitel', 'btnPredstaveni', 'temaVolba', 'btnProjektor', 'btnNoveOkno'], 'obsah nabídky');
  assert.ok(nabidka.popisky.every(p => p && p.length > 2), 'každá položka má slovní popis: ' + JSON.stringify(nabidka.popisky));
  assert.equal(nabidka.role, 'menuitem', 'role položek');
  assert.equal(nabidka.fokus, 'btnOsnova', 'fokus skočí na první položku, byl: ' + nabidka.fokus);
  await klavesa('ArrowDown');
  assert.equal(await evaluate('document.activeElement.id'), 'btnUcitel', 'šipka dolů posune fokus');
  await klavesa('ArrowUp'); await klavesa('ArrowUp');
  assert.equal(await evaluate('document.activeElement.id'), 'btnNoveOkno', 'šipka nahoru cyklí');
  await klavesa('Escape');
  assert.equal(await evaluate(`({h:viceMenu.hidden, f:document.activeElement.id}).h`), true, 'Esc zavře nabídku');
  assert.equal(await evaluate('document.activeElement.id'), 'btnVice', 'Esc vrátí fokus na tlačítko');
  vysledky.nabidka = nabidka;

  // 3) Motiv se vybere z výklopného seznamu v nabídce; volba nabídku zavře.
  const vyber = hodnota => evaluate(`btnVice.click(); temaVolba.value = '${hodnota}';
    temaVolba.dispatchEvent(new Event('change', { bubbles: true }))`);
  await vyber('light');
  const tema = await evaluate(`({
    tema: document.documentElement.dataset.theme || 'dark', hodnota: temaVolba.value,
    moznosti: [...temaVolba.options].map(o => o.value), popis: temaObal.querySelector('.popis').textContent,
    zavreno: viceMenu.hidden
  })`);
  assert.equal(tema.tema, 'light', 'výběr světlého motivu');
  assert.equal(tema.hodnota, 'light', 'seznam ukazuje zvolený motiv');
  assert.deepEqual(tema.moznosti, ['auto', 'dark', 'light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola'], 'všechny motivy v seznamu');
  assert.equal(tema.popis, 'Motiv', 'seznam má v nabídce slovní popis');
  assert.equal(tema.zavreno, true, 'nabídka se po volbě zavře');
  await vyber('dark');
  assert.equal(await evaluate(`document.documentElement.dataset.theme || 'dark'`), 'dark', 'návrat na tmavý motiv');

  // 4) Vysouvací menu: otevření dá fokus do hledání, Esc zavře a vrátí ho na hamburger.
  await evaluate(`hamburger.focus()`);
  await klavesa('Enter');
  assert.equal(await evaluate(`hlavniMenu.classList.contains('open')`), true, 'menu se otevře Enterem');
  assert.equal(await evaluate('document.activeElement.id'), 'hledatMenu', 'fokus v hledání');
  await klavesa('Escape');
  assert.equal(await evaluate(`hlavniMenu.classList.contains('open')`), false, 'Esc zavře menu');
  assert.equal(await evaluate('document.activeElement.id'), 'hamburger', 'fokus zpět na hamburgeru');

  // 5) Zrušení filtrů: skryté bez filtru, jmenuje, co zruší, a vrátí plný katalog.
  assert.equal(await evaluate('zrusitFiltry.hidden'), true, 'bez filtru se tlačítko neukazuje');
  await evaluate(`vyberRocnik('3'); vyberSkupinu('cestina')`);
  const sFiltrem = await evaluate(`({
    skryte: zrusitFiltry.hidden, co: zrusitCo.textContent,
    vidno: [...document.querySelectorAll('#menuSekce a[data-page]')].filter(a => !a.closest('li').classList.contains('skryto')).length
  })`);
  assert.equal(sFiltrem.skryte, false, 'tlačítko se objeví');
  assert.match(sFiltrem.co, /předmět/, 'popis zrušení: ' + sFiltrem.co);
  assert.match(sFiltrem.co, /3\. ročník/, 'popis zmiňuje ročník: ' + sFiltrem.co);
  await evaluate(`zrusitFiltry.click()`);
  const poZruseni = await evaluate(`({
    skupina: aktivniSkupina, rocnik: aktivniRocnik, skryte: zrusitFiltry.hidden, fokus: document.activeElement.id,
    vidno: [...document.querySelectorAll('#menuSekce a[data-page]')].filter(a => !a.closest('li').classList.contains('skryto')).length
  })`);
  assert.equal(poZruseni.skupina, 'vse', 'předmět zrušen');
  assert.equal(poZruseni.rocnik, 'vse', 'ročník zrušen');
  assert.equal(poZruseni.skryte, true, 'tlačítko zase zmizí');
  assert.equal(poZruseni.fokus, 'hledatMenu', 'fokus po zrušení');
  assert.ok(poZruseni.vidno > sFiltrem.vidno, 'po zrušení je vidět víc učiva (' + sFiltrem.vidno + ' → ' + poZruseni.vidno + ')');
  vysledky.filtry = { sFiltrem, poZruseni };

  // 6) Ročník, oblíbené a otevření tématu na mobilu i přímým odkazem.
  await evaluate(`vyberRocnik('4')`);
  assert.equal(await evaluate(`aktivniRocnik`), '4', 'volba ročníku');
  const oblibena = await evaluate(`(() => {
    const h = document.querySelector('#menuSekce li:not(.skryto) .hvezda');
    const pred = oblibene.length; h.click();
    return { pred, po: oblibene.length, jeOblibena: h.classList.contains('je-oblibena'), ulozeno: (localStorage.getItem('metodus_oblibene') || '').length };
  })()`);
  assert.equal(oblibena.pred, 0, 'test začíná bez oblíbených');
  assert.equal(oblibena.po, 1, 'hvězdička přidá oblíbené: ' + JSON.stringify(oblibena));
  assert.ok(oblibena.ulozeno > 2, 'oblíbené se uloží do prohlížeče: ' + JSON.stringify(oblibena));
  await evaluate(`vyberRocnik('vse'); zrusitFiltry.click()`);
  await nacti(base + '#obsah/m4_zlomky_uvod.html');
  assert.match(await evaluate(`document.querySelector('iframe[name="okno"]').getAttribute('src')`), /m4_zlomky_uvod/, 'přímý odkaz otevře lekci');
  await evaluate(`btnDomu.click()`);
  assert.match(await evaluate(`document.querySelector('iframe[name="okno"]').getAttribute('src')`), /prehled/, 'návrat z lekce na úvod');

  // 6b) Projektor se zapne z nabídky, lišta je vidět a Esc ho ukončí.
  await evaluate(`btnVice.click(); btnProjektor.click()`);
  const projZap = await evaluate(`({
    trida: document.body.classList.contains('projektor'),
    lista: getComputedStyle(projektorLista).display !== 'none',
    hlavicka: getComputedStyle(document.querySelector('.hlavicka')).display
  })`);
  assert.equal(projZap.trida, true, 'projektor se zapne z nabídky');
  assert.equal(projZap.lista, true, 'lišta projektoru je vidět');
  assert.equal(projZap.hlavicka, 'none', 'hlavička se v projektoru schová');
  // Esc funguje, když je fokus v rozcestníku; uvnitř zvětšeného rámu ho dostane aplikace,
  // proto má lišta i vlastní tlačítko pro ukončení.
  await evaluate(`projKonec.focus()`);
  await klavesa('Escape');
  // v celé obrazovce Esc nejdřív ukončí fullscreen; režim projektor musí skončit s ním
  for (let i = 0; i < 40 && await evaluate(`document.body.classList.contains('projektor')`); i++)
    await new Promise(r => setTimeout(r, 50));
  const poEsc = await evaluate(`({ proj: projektorZap, fs: !!document.fullscreenElement, lista: getComputedStyle(projektorLista).display !== 'none' })`);
  assert.equal(poEsc.proj, false, 'Esc ukončí projektor: ' + JSON.stringify(poEsc));
  assert.equal(poEsc.fs, false, 'a zároveň celou obrazovku');
  await evaluate(`btnVice.click(); btnProjektor.click()`);
  await evaluate(`projKonec.click()`);
  assert.equal(await evaluate(`document.body.classList.contains('projektor')`), false, 'tlačítko ✕ ukončí projektor');

  // 7) Šířky a motivy bez přetečení; na širokém zobrazení jsou akce zpět v hlavičce.
  const sirky = [];
  for (const w of [1366, 1024, 768, 700, 390, 320]) for (const theme of ['dark', 'light']) {
    await sirka(w);
    await evaluate(`document.documentElement.dataset.theme='${theme}'`);
    await new Promise(r => setTimeout(r, 150));
    const s = await evaluate(`({
      width: innerWidth, scroll: document.documentElement.scrollWidth,
      radku: [...document.querySelectorAll('.hlavicka button, .hlavicka select')].filter(b => b.offsetParent !== null)
        .map(b => { const r = b.getBoundingClientRect(); return r.top + r.height / 2; })
        .reduce((acc, s) => (acc.some(x => Math.abs(x - s) <= 8) ? acc : [...acc, s]), []).length,
      viceVidno: !btnVice.hidden, vHlavicce: temaObal.closest('.ovladani') !== null
    })`);
    assert.ok(s.scroll <= s.width + 1, 'přetečení při ' + w + ' ' + theme + ' (' + s.scroll + ')');
    assert.equal(s.radku, 1, 'hlavička na jeden řádek při ' + w + ' ' + theme);
    assert.equal(s.viceVidno, w <= 700, 'nabídka Další jen na úzké hlavičce (' + w + ')');
    assert.equal(s.vHlavicce, w > 700, 'akce zpět v hlavičce na široké obrazovce (' + w + ')');
    sirky.push({ sirka: w, motiv: theme, radku: s.radku });
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(JSON.stringify({ ok: true, ...vysledky, sirky, runtimeErrors: errors.length }, null, 2));
} finally { ws.close(); }
