// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa06-zlomky.mjs.
// Vzorová lekce m4_zlomky_uvod: cíl, vedený příklad, tři obrázky téhož celku,
// vybarvování klávesnicí, adresná zpětná vazba a všech pět režimů.
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
const KLAVESY = {
  Enter: { code: 'Enter', vk: 13, text: '\r' }, ' ': { code: 'Space', vk: 32, text: ' ' },
  ArrowRight: { code: 'ArrowRight', vk: 39 }, ArrowLeft: { code: 'ArrowLeft', vk: 37 }, Tab: { code: 'Tab', vk: 9 }
};
const klavesa = async key => {
  const k = KLAVESY[key];
  const spolecne = { key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk };
  await call('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', ...spolecne, text: k.text });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', ...spolecne });
};
const nacti = async (posun = { rezim: 'rucne', tempo: 'normal' }) => {
  errors = [];
  await call('Page.addScriptToEvaluateOnNewDocument', {
    source: `try{localStorage.setItem('metodus_posun','${JSON.stringify(posun)}');
             localStorage.removeItem('metodus_m4_zlomky');}catch(e){}`
  });
  await call('Page.navigate', { url: base + 'obsah/m4_zlomky_uvod.html' });
  for (let i = 0; i < 200; i++) {
    if (await evaluate(`document.readyState==='complete' && typeof REZIMY!=='undefined'`)) break;
    await new Promise(r => setTimeout(r, 50));
  }
  // zapamatujeme si zadání každé otázky (správný klíč i nabídku)
  await evaluate(`if (!window.__hak) { window.__hak = true; const p = Uloha.vyber;
    Uloha.vyber = v => { window.__v = v; return p(v); }; }`);
};
const odpovez = spravne => evaluate(`(() => {
  const b = [...document.querySelectorAll('.moznosti button')];
  const cil = ${spravne} ? b.find(x => x.dataset.klic === __v.spravnyKlic) : b.find(x => x.dataset.klic !== __v.spravnyKlic);
  cil.click(); return cil.dataset.klic;
})()`);
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Emulation.setDeviceMetricsOverride', { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });
  // bez fokusu okna Chromium nevyhodnocuje :focus – kontrola prstence by lhala
  await call('Page.bringToFront');
  const vysledky = {};

  // 1) Cíl stojí před ovladači a lekce nabízí scénář pro učitele i návaznosti.
  await nacti();
  const uvod = await evaluate(`(() => {
    const cil = document.querySelector('.cil'), rezimy = document.getElementById('rezimy');
    const odkazy = [...document.querySelectorAll('a[data-lekce]')].map(a => a.getAttribute('href'));
    return {
      cil: cil.textContent.replace(/\\s+/g, ' ').trim().slice(0, 60),
      predOvladaci: cil.getBoundingClientRect().top < rezimy.getBoundingClientRect().top,
      proUcitele: !!cil.querySelector('details summary'),
      odkazy, navaznosti: !!document.querySelector('.navaznosti')
    };
  })()`);
  assert.match(uvod.cil, /Po této lekci dokážu/, 'cíl lekce: ' + uvod.cil);
  assert.equal(uvod.predOvladaci, true, 'cíl je nad ovladači');
  assert.equal(uvod.proUcitele, true, 'rozbalovací scénář pro učitele');
  assert.equal(uvod.navaznosti, true, 'blok návazností');
  assert.deepEqual([...new Set(uvod.odkazy)].sort(),
    ['m3_deleni_zbytkem.html', 'm7_zlomky_operace.html', 'procenta.html'],
    'návaznosti míří na existující lekce: ' + uvod.odkazy);
  for (const href of new Set(uvod.odkazy))
    assert.equal((await fetch(base + 'obsah/' + href)).ok, true, 'cíl odkazu existuje: ' + href);
  vysledky.uvod = uvod;

  // 2) Vedený příklad: čtyři kroky, čitatel a jmenovatel proti obrázku, na konci tři obrázky.
  const kroky = [];
  for (let i = 0; i < 4; i++) {
    kroky.push(await evaluate(`(() => {
      const k = document.querySelector('.krok');
      return {
        cislo: k.querySelector('.krok-cislo').textContent.trim(),
        text: k.querySelector('.odezva').textContent.replace(/\\s+/g, ' ').trim().slice(0, 70),
        zvyrazneno: [...document.querySelectorAll('.zlomek .zvyrazni')].length,
        obrazku: document.querySelectorAll('.karta svg').length,
        tlacitko: k.querySelector('button.pokracovat')?.textContent.trim()
      };
    })()`));
    if (i < 3) { await evaluate(`document.querySelector('.krok button.pokracovat').click()`); await new Promise(r => setTimeout(r, 200)); }
  }
  assert.match(kroky[0].cislo, /Krok 1 ze 4/, 'číslování kroků: ' + kroky[0].cislo);
  assert.match(kroky[0].text, /Jmenovatel/, 'první krok vysvětluje jmenovatele: ' + kroky[0].text);
  assert.match(kroky[1].text, /Čitatel/, 'druhý krok vysvětluje čitatele: ' + kroky[1].text);
  assert.equal(kroky[0].zvyrazneno, 1, 'v prvním kroku svítí jen jmenovatel');
  assert.equal(kroky[1].zvyrazneno, 1, 've druhém kroku svítí jen čitatel');
  assert.equal(kroky[2].obrazku, 3, 'třetí krok ukáže tři obrázky, ukázal ' + kroky[2].obrazku);
  assert.match(kroky[3].tlacitko, /Zkusit sám/, 'poslední krok vede do procvičování: ' + kroky[3].tlacitko);
  vysledky.vedenyPriklad = kroky;

  // 2b) Čtení zlomku česky: tvar jmenovatele se řídí čitatelem.
  const cestina = await evaluate(`(() => {
    const out = [];
    for (const j of [2, 3, 4, 5, 6, 7, 8]) for (let c = 1; c < j; c++) out.push(c + '/' + j + ' = ' + slovyZlomek(c, j));
    return out;
  })()`);
  const RADY = { 2: ['polovina', 'poloviny', 'polovin'], 3: ['třetina', 'třetiny', 'třetin'],
    4: ['čtvrtina', 'čtvrtiny', 'čtvrtin'], 5: ['pětina', 'pětiny', 'pětin'],
    6: ['šestina', 'šestiny', 'šestin'], 7: ['sedmina', 'sedminy', 'sedmin'], 8: ['osmina', 'osminy', 'osmin'] };
  const CISLOVKY = { 1: 'jedna', 2: 'dvě', 3: 'tři', 4: 'čtyři', 5: 'pět', 6: 'šest', 7: 'sedm' };
  const ocekavane = [];
  for (const j of [2, 3, 4, 5, 6, 7, 8]) for (let c = 1; c < j; c++)
    ocekavane.push(c + '/' + j + ' = ' + CISLOVKY[c] + ' ' + (c === 1 ? RADY[j][0] : c < 5 ? RADY[j][1] : RADY[j][2]));
  assert.deepEqual(cestina, ocekavane, 'české čtení zlomků');
  assert.ok(cestina.includes('5/6 = pět šestin') && cestina.includes('2/3 = dvě třetiny') && cestina.includes('1/4 = jedna čtvrtina'),
    'ukázky čtení: ' + cestina.slice(0, 3));
  vysledky.cestina = ['1/4 = jedna čtvrtina', '2/3 = dvě třetiny', '5/6 = pět šestin'];

  // 2c) Počítané tvary v generovaných větách (1 díl / 2 díly / 5 dílů).
  const tvary = await evaluate(`[1,2,3,4,5,6,8].map(n => dily(n))`);
  assert.deepEqual(tvary, ['1 díl', '2 díly', '3 díly', '4 díly', '5 dílů', '6 dílů', '8 dílů'], 'tvary počtu dílů: ' + tvary);
  const vety = await evaluate(`(() => {
    const out = [];
    for (const n of [1, 2, 4, 5, 12]) out.push(n + ' → ' + tvar(n, 'stejnou část', 'stejné části', 'stejných částí'));
    return out;
  })()`);
  assert.deepEqual(vety, ['1 → stejnou část', '2 → stejné části', '4 → stejné části', '5 → stejných částí', '12 → stejných částí'],
    'tvary počtu částí: ' + vety);
  vysledky.pocitaneTvary = tvary;

  // 3) Koláč, proužek a osa mají stejně velký celek (stejná šířka na stránce).
  const sirky = await evaluate(`(() => {
    const s = [...document.querySelectorAll('.trojice svg')].map(x => Math.round(x.getBoundingClientRect().width));
    return { sirky: s, stejne: new Set(s).size === 1, pohledy: [...document.querySelectorAll('.trojice svg')].map(x => x.getAttribute('viewBox')) };
  })()`);
  assert.equal(sirky.stejne, true, 'všechny tři obrázky jsou stejně široké: ' + sirky.sirky);
  assert.equal(new Set(sirky.pohledy).size, 1, 'stejný viewBox: ' + sirky.pohledy);
  vysledky.stejnyCelek = sirky;

  // 4) „Zkusit sám" přepne do procvičování a obrázky se v něm střídají.
  await evaluate(`document.querySelector('.krok button.pokracovat').click()`);
  await new Promise(r => setTimeout(r, 200));
  const druhy = [];
  for (let i = 0; i < 3; i++) {
    druhy.push(await evaluate(`document.querySelector('.zadani').textContent.match(/\\((.+)\\)/)?.[1] || '?'`));
    await evaluate(`document.getElementById('btnDalsi').click()`);
    await new Promise(r => setTimeout(r, 200));
  }
  assert.deepEqual(druhy, ['koláč', 'proužek', 'číselná osa'], 'obrázky se střídají: ' + druhy);
  vysledky.stridani = druhy;

  // 5) Adresná zpětná vazba: každá špatná možnost dostane vlastní vysvětlení.
  const zpravy = new Set();
  for (let i = 0; i < 8; i++) {
    const rozbor = await evaluate(`(() => {
      const spravny = Number(__v.spravnyKlic);
      const vysledky = [];
      for (const b of document.querySelectorAll('.moznosti button')) {
        if (Number(b.dataset.klic) === spravny) continue;
        vysledky.push(__v.zpravaChyba(b.dataset.klic));
      }
      return vysledky;
    })()`);
    rozbor.forEach(z => zpravy.add(z));
    assert.equal(new Set(rozbor).size, rozbor.length, 'každá špatná možnost má vlastní zprávu: ' + JSON.stringify(rozbor));
    await evaluate(`document.getElementById('btnDalsi').click()`);
    await new Promise(r => setTimeout(r, 150));
  }
  const pojmenovane = [...zpravy].filter(z => /nevybarvené|prohozený|Jmenovatel/.test(z));
  assert.ok(pojmenovane.length >= 3, 'zpětná vazba pojmenuje konkrétní záměny, našel jsem ' + pojmenovane.length);
  vysledky.adresnaZpetnaVazba = pojmenovane.slice(0, 3);

  // 6) Chyba v úloze: vysvětlení odpovídá zvolené možnosti a otázka běží dál.
  const klic = await odpovez(false);
  await new Promise(r => setTimeout(r, 200));
  const poChybe = await evaluate(`(() => {
    const o = document.querySelector('.odezva');
    return { trida: o.className, text: o.textContent.trim(), ocekavane: __v.zpravaChyba('${klic}'),
             moznosti: document.querySelectorAll('.moznosti button').length };
  })()`);
  assert.match(poChybe.trida, /chyba/, 'chybová odezva');
  assert.equal(poChybe.text, poChybe.ocekavane, 'text odpovídá zvolené možnosti');
  assert.ok(poChybe.moznosti >= 2, 'otázka po chybě běží dál');

  // 7) Po správné odpovědi se ukáže tentýž zlomek ve třech obrázcích.
  await odpovez(true);
  await new Promise(r => setTimeout(r, 400));
  const poSpravne = await evaluate(`({
    trida: document.querySelector('.odezva').className,
    obrazku: document.querySelectorAll('#karta svg').length,
    popis: document.querySelector('#karta .popis')?.textContent.trim() || '',
    tlacitko: !!document.querySelector('button.pokracovat')
  })`);
  assert.match(poSpravne.trida, /ok/, 'kladná odezva');
  assert.equal(poSpravne.obrazku, 3, 'po odpovědi se propojí tři obrázky, je jich ' + poSpravne.obrazku);
  assert.match(poSpravne.popis, /Stejný zlomek/, 'popis propojení: ' + poSpravne.popis);
  assert.equal(poSpravne.tlacitko, true, 'v ručním režimu se nabídne Pokračovat');
  vysledky.poSpravne = poSpravne;

  // 8) Vybarvování jde dokončit bez myši: šipky přecházejí, mezerník vybarvuje.
  await evaluate(`prepniRezim('vybarvi')`);
  await new Promise(r => setTimeout(r, 200));
  const zadani = await evaluate(`({
    dily: document.querySelectorAll('.kolac path').length,
    role: document.querySelector('.kolac path').getAttribute('role'),
    tabindex: document.querySelector('.kolac path').getAttribute('tabindex'),
    popis: document.querySelector('.kolac path').getAttribute('aria-label'),
    stav: document.querySelector('.kolac path').getAttribute('aria-pressed'),
    potreba: Number(document.querySelector('.odezva').textContent.match(/z (\\d+)/)[1]),
    odezvaZiva: document.querySelector('.odezva').getAttribute('aria-live')
  })`);
  assert.equal(zadani.role, 'button', 'díl je tlačítko');
  assert.equal(zadani.tabindex, '0', 'díl je v pořadí tabulátoru');
  assert.match(zadani.popis, /díl z \d+/, 'díl má přístupný název: ' + zadani.popis);
  assert.equal(zadani.stav, 'false', 'stav výběru je v aria-pressed');
  assert.equal(zadani.odezvaZiva, 'polite', 'stav vybarvení se hlásí odečítači');
  await evaluate(`document.querySelector('.kolac path').focus()`);
  const fokus = await evaluate(`(() => {
    const el = document.activeElement, s = getComputedStyle(el);
    const jiny = getComputedStyle([...document.querySelectorAll('.kolac path')].find(x => x !== el));
    return { znacka: el.tagName, tloustka: s.strokeWidth, obrys: s.stroke, jinyDil: jiny.strokeWidth };
  })()`);
  assert.equal(fokus.znacka, 'path', 'fokus je na dílu');
  assert.notEqual(fokus.tloustka, fokus.jinyDil,
    'zaostřený díl je zvýrazněný oproti ostatním: ' + JSON.stringify(fokus));
  for (let i = 0; i < zadani.potreba; i++) {
    await klavesa(' ');
    await new Promise(r => setTimeout(r, 80));
    if (i < zadani.potreba - 1) { await klavesa('ArrowRight'); await new Promise(r => setTimeout(r, 80)); }
  }
  await new Promise(r => setTimeout(r, 300));
  const poVybarveni = await evaluate(`({
    trida: document.querySelector('.odezva').className,
    text: document.querySelector('.odezva').textContent.trim(),
    stav: document.querySelector('.kolac path').getAttribute('aria-pressed'),
    tlacitko: !!document.querySelector('button.pokracovat')
  })`);
  assert.match(poVybarveni.trida, /ok/, 'úloha se dokončí klávesnicí: ' + poVybarveni.text);
  assert.equal(poVybarveni.stav, 'true', 'vybarvený díl to hlásí v aria-pressed');
  assert.equal(poVybarveni.tlacitko, true, 'i tady se nabídne Pokračovat');
  vysledky.vybarvovaniKlavesnici = { zadani, poVybarveni };

  // 9) Všech pět režimů: každý postaví úlohu a přeskočení dá další.
  const rezimy = await evaluate(`Object.keys(REZIMY)`);
  assert.deepEqual(rezimy, ['ukazka', 'prectiZlomek', 'vybarvi', 'porovnej', 'zCelku'], 'režimy: ' + rezimy);
  const stav = {};
  for (const r of rezimy) {
    await evaluate(`prepniRezim('${r}')`);
    await new Promise(r2 => setTimeout(r2, 250));
    const m = await evaluate(`({
      zadani: !!document.querySelector('.zadani'),
      interakce: document.querySelectorAll('.moznosti button, .kolac.klikaci path, .krok button').length,
      aktivni: document.querySelector('#rezimy button.active').dataset.rezim
    })`);
    assert.equal(m.zadani, true, r + ' — má zadání');
    assert.ok(m.interakce > 0, r + ' — má s čím pracovat');
    assert.equal(m.aktivni, r, r + ' — režim je označený jako aktivní');
    if (r !== 'ukazka' && r !== 'vybarvi') {
      await odpovez(true);
      await new Promise(r2 => setTimeout(r2, 300));
      assert.match(await evaluate(`document.querySelector('.odezva').className`), /ok/, r + ' — správná odpověď projde');
    }
    stav[r] = m;
  }
  vysledky.rezimy = stav;

  // 10) Šířky a motivy bez přetečení.
  for (const width of [1366, 390, 320]) for (const tema of ['dark', 'light']) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.documentElement.dataset.theme='${tema}'`);
    await new Promise(r => setTimeout(r, 150));
    const s = await evaluate(`({width: innerWidth, scroll: document.documentElement.scrollWidth})`);
    assert.ok(s.scroll <= s.width + 1, 'přetečení při ' + width + ' ' + tema + ' (' + s.scroll + ')');
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(JSON.stringify({ ok: true, ...vysledky }, null, 2));
} finally { ws.close(); }
