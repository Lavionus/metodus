// Úkoly k modelu (badani.js) na simulacích.
// Spustit místní server (8766), Chromium s CDP (9223), pak:
//   node tests/badani.mjs [stranka.html …]
// Úsporně: jedna záložka, izolovaný kontext (vlastní localStorage), stránky
// postupně, pod 1,5 GB volné paměti test skončí.
//
// Na každé stránce: panel a fáze kostry, každý úkol přes předpověď →
// 🙋 Ukaž mi (pokus musí model opravdu splnit) → chybné a správné
// vysvětlení, obnovení po načtení, obsah otázek (jedna správná možnost,
// různé texty, žádné NaN) na 40 vygenerovaných zadáních, Procvič,
// Ověř se s uložením výsledku, Tahák, klávesy v panelu nejdou do modelu,
// Esc, mobil 390/320 px bez přetečení a kontrast ve světlém i tmavém motivu.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const VYCHOZI = ['paka.html', 'elektrina.html', 'optika.html', 'vrtacka_lis.html',
  'vitr_tunel.html', 'vodni_hladina.html', 'optika_soustava.html', 'proudove_motory.html', 'gravitacni_hriste.html',
  'gravitacni_hriste2.html', 'solar_system.html', 'pohyb_vesmirem.html', 'grafy_funkci.html', 'punnett.html',
  'eduSort.html', 'star_map.html', 'physics_ref.html'];
const stranky = process.argv.slice(2).length ? process.argv.slice(2) : VYCHOZI;

const volnaPamet = () => {
  const m = readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/);
  return m ? +m[1] / 1024 : Infinity;   // MB
};

// izolovaný kontext = vlastní úložiště, žádné sdílení s jinými záložkami
const verze = await (await fetch(endpoint + '/version')).json();
const browserWs = new WebSocket(verze.webSocketDebuggerUrl);
await new Promise(r => browserWs.onopen = r);
let bid = 0; const bpending = new Map();
browserWs.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { bpending.get(m.id)?.(m); bpending.delete(m.id); } };
const bcall = (method, params = {}) => new Promise(res => { const n = ++bid; bpending.set(n, m => res(m.result)); browserWs.send(JSON.stringify({ id: n, method, params })); });
const { browserContextId } = await bcall('Target.createBrowserContext', { disposeOnDetach: true });
const { targetId } = await bcall('Target.createTarget', { url: 'about:blank', browserContextId });
const seznam = await (await fetch(endpoint)).json();
const target = seznam.find(t => t.id === targetId);

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
const cekej = ms => new Promise(r => setTimeout(r, ms));
const cekejNa = async (vyraz, ms = 6000) => {
  for (let t = 0; t < ms; t += 100) { if (await evaluate(vyraz)) return true; await cekej(100); }
  return false;
};
const POMUCKY = `
  // color-mix() vrací color(srgb r g b / a) v rozsahu 0–1
  window.__barva = s => { const m = String(s).match(/-?[\\d.]+/g) || []; let [r = 0, g = 0, b = 0, a = 1] = m.map(Number);
    if (/^color\\(srgb/.test(s)) { r *= 255; g *= 255; b *= 255; } return { r, g, b, a }; };
  window.__jas = s => { const { r, g, b } = __barva(s);
    const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2]; };
  window.__pozadi = el => { for (let e = el; e; e = e.parentElement) { const b = getComputedStyle(e).backgroundColor; if (__barva(b).a > 0.5) return b; }
    return getComputedStyle(document.body).backgroundColor; };
  window.__kontrast = el => { const a = __jas(getComputedStyle(el).color), b = __jas(__pozadi(el));
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100; };
  window.__klik = sel => { const e = document.querySelector(sel); if (!e) throw new Error('chybí ' + sel); e.click(); return true; };
  window.__tlac = text => [...document.querySelectorAll('.badani button')].find(b => b.offsetParent && b.textContent.includes(text));
`;
const nacti = async (cesta, tema = 'dark') => {
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('webapp_theme','${tema}')}catch(e){}` });
  await call('Page.navigate', { url: base + cesta });
  for (let i = 0; i < 200; i++) {
    if (await evaluate(`document.readyState==='complete'`)) break;
    await cekej(50);
  }
  await cekejNa(`!!document.querySelector('.kostra-faze')`, 5000);
  await cekej(300);
  await evaluate(POMUCKY);
};
const vyrovnej = async (sirka, vyska = 900) =>
  call('Emulation.setDeviceMetricsOverride', { width: sirka, height: vyska, deviceScaleFactor: 1, mobile: sirka < 700 });

/* Obsah definice: každá otázka (i generovaná) má právě jednu správnou
   možnost, různé texty a žádné NaN/undefined. */
async function zkontrolujObsah(stranka) {
  return evaluate(`(() => {
    const d = Badani.definice(), chyby = [];
    const spatny = t => /NaN|undefined|Infinity|null/.test(t);
    d.ukoly.forEach(u => {
      const moz = u.predpoved.moznosti;
      if (!(u.predpoved.spravna >= 0 && u.predpoved.spravna < moz.length)) chyby.push(u.id + ': spravna mimo rozsah');
      if (new Set(moz).size !== moz.length) chyby.push(u.id + ': stejné předpovědi');
      const ok = u.vysvetli.moznosti.filter(m => m.ok).length;
      if (ok !== 1) chyby.push(u.id + ': vysvětlení má ' + ok + ' správných');
      u.vysvetli.moznosti.filter(m => !m.ok && !m.proc).forEach(m => chyby.push(u.id + ': chybná možnost bez zdůvodnění: ' + m.t));
      if (!u.shrnuti || !u.pokus || typeof u.splneno !== 'function') chyby.push(u.id + ': chybí pokus/shrnutí/splneno');
    });
    for (let k = 0; k < 40; k++) d.otazky.forEach((q, i) => {
      const o = typeof q === 'function' ? q() : q;
      const texty = o.moznosti.map(m => m.t);
      const ok = o.moznosti.filter(m => m.ok).length;
      if (ok !== 1) chyby.push('otázka ' + i + ': ' + ok + ' správných – ' + o.otazka);
      if (new Set(texty).size !== texty.length) chyby.push('otázka ' + i + ': stejné možnosti ' + texty.join(' | '));
      if (spatny(o.otazka + texty.join('') + (o.vysvetleni || ''))) chyby.push('otázka ' + i + ': NaN/undefined – ' + o.otazka + ' ' + texty.join(' | '));
      o.moznosti.filter(m => !m.ok && !m.proc).forEach(m => chyby.push('otázka ' + i + ': chybná možnost bez zdůvodnění: ' + m.t));
    });
    return { chyby: [...new Set(chyby)], ukolu: d.ukoly.length, otazek: d.otazky.length };
  })()`);
}

/* Jeden úkol od předpovědi po shrnutí. `spatnaPredpoved` ověří
   i srovnání „pokus ukázal jinak“. */
async function projdiUkol(i, spatnaPredpoved) {
  await evaluate(`__klik('.badani-zalozky button:nth-child(${i + 1})')`);
  const info = await evaluate(`(() => { const u = Badani.definice().ukoly[${i}];
    return { spravna: u.predpoved.spravna, pocet: u.predpoved.moznosti.length, ukaz: !!u.ukaz, vysvetli: u.vysvetli.moznosti.map(m => !!m.ok) }; })()`);
  const volba = spatnaPredpoved ? (info.spravna + 1) % info.pocet : info.spravna;
  await evaluate(`document.querySelectorAll('.badani-ukol .badani-krok:nth-of-type(1) .badani-volby button')[${volba}].click()`);
  await cekej(150);
  const poPredpovedi = await evaluate(`({ kroky: document.querySelectorAll('.badani-ukol .badani-krok').length,
    ceka: document.querySelector('.badani-stav-pokusu')?.textContent || '',
    splnenoHned: (() => { try { return Badani.definice().ukoly[${i}].splneno(); } catch (e) { return 'chyba ' + e.message; } })() })`);
  assert.equal(poPredpovedi.kroky, 2, `úkol ${i + 1}: po předpovědi krok 2`);
  assert.equal(poPredpovedi.splnenoHned, false, `úkol ${i + 1}: připravený model ještě není splněný`);
  assert.match(poPredpovedi.ceka, /čeká/, `úkol ${i + 1}: čeká na pokus`);
  assert.ok(info.ukaz, `úkol ${i + 1}: má 🙋 Ukaž mi`);
  await evaluate(`__tlac('Ukaž mi').click()`);
  const hotovo = await cekejNa(`document.querySelector('.badani-stav-pokusu')?.classList.contains('badani-ok')`, 40000);
  assert.ok(hotovo, `úkol ${i + 1}: Ukaž mi splní pokus`);
  const pozorovani = await evaluate(`document.querySelector('.badani-stav-pokusu').textContent`);
  assert.ok(!/NaN|undefined/.test(pozorovani), `úkol ${i + 1}: pozorování bez NaN: ${pozorovani}`);
  await evaluate(`__tlac('Pokračovat').click()`);
  await cekej(100);
  const srovnani = await evaluate(`document.querySelector('.badani-srovnani').textContent`);
  if (spatnaPredpoved) assert.match(srovnani, /pokus ukázal/, `úkol ${i + 1}: srovnání chybné předpovědi`);
  else assert.match(srovnani, /potvrdila/, `úkol ${i + 1}: srovnání správné předpovědi`);
  // chybné vysvětlení → zdůvodnění, pak správné
  const tlacitka = await evaluate(`[...document.querySelectorAll('.badani-vysvetleni button')].map(b => b.textContent)`);
  const def = await evaluate(`Badani.definice().ukoly[${i}].vysvetli.moznosti.map(m => ({ t: m.t, ok: !!m.ok }))`);
  const textSpravne = def.find(m => m.ok).t, textChybne = def.find(m => !m.ok).t;
  const idx = t => tlacitka.findIndex(x => x === t.replace(/<[^>]+>/g, ''));
  await evaluate(`document.querySelectorAll('.badani-vysvetleni button')[${idx(textChybne)}].click()`);
  const odezva = await evaluate(`document.querySelector('.badani-odezva').textContent`);
  assert.match(odezva, /^✗ ./, `úkol ${i + 1}: zdůvodnění chybného vysvětlení`);
  await evaluate(`document.querySelectorAll('.badani-vysvetleni button')[${idx(textSpravne)}].click()`);
  await cekej(100);
  const konec = await evaluate(`({ shrnuti: !!document.querySelector('.badani-shrnuti'), fokus: document.activeElement?.className,
    zalozka: document.querySelector('.badani-zalozky button:nth-child(${i + 1})').textContent })`);
  assert.ok(konec.shrnuti, `úkol ${i + 1}: shrnutí`);
  assert.equal(konec.fokus, 'badani-shrnuti', `úkol ${i + 1}: fokus na shrnutí`);
  assert.match(konec.zalozka, /^✅/, `úkol ${i + 1}: záložka hotová`);
}

/* Odpoví na aktuální otázku: zkouší možnosti postupně, vrátí, zda první sedla. */
async function odpovezOtazku() {
  const n = await evaluate(`document.querySelectorAll('.badani-otazky .moznosti button').length`);
  for (let k = 0; k < n; k++) {
    const r = await evaluate(`(() => { const b = document.querySelectorAll('.badani-otazky .moznosti button')[${k}];
      if (b.disabled) return 'x'; b.click(); return b.classList.contains('badani-spravne') ? 'ok' : 'chyba'; })()`);
    if (r === 'ok') return k === 0;
  }
  throw new Error('žádná možnost nebyla správná');
}

const vysledky = {};
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });

  for (const stranka of stranky) {
    if (volnaPamet() < 1500) { console.log('Málo volné paměti – test končí před', stranka); break; }
    const v = vysledky[stranka] = {};
    errors = [];
    await vyrovnej(1366, 900);
    await nacti('obsah/' + stranka);
    await evaluate(`localStorage.removeItem('metodus_badani'); localStorage.removeItem('metodus_overeni'); localStorage.removeItem('metodus_badani_strana')`);
    await nacti('obsah/' + stranka);

    // 1) panel a fáze kostry
    const zaklad = await evaluate(`({ panel: !!document.querySelector('.badani'), otevreno: !document.getElementById('badaniOkno').hidden,
      faze: [...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze),
      prekryvaVodorovne: document.documentElement.scrollWidth > innerWidth })`);
    assert.ok(zaklad.panel, 'panel existuje');
    assert.ok(zaklad.otevreno, 'na širší obrazovce se panel poprvé otevře');
    assert.deepEqual(zaklad.faze, ['vyuka', 'procvic', 'overse', 'tahak'], 'fáze kostry');
    assert.equal(zaklad.prekryvaVodorovne, false, 'bez vodorovného přetečení');
    // široká obrazovka: panel je boční sloupec a nic ze stránky nezakrývá
    const dok = await evaluate(`(() => { const p = document.querySelector('.badani').getBoundingClientRect();
      const obsah = [...document.body.querySelectorAll('canvas, svg, .plocha, main')].filter(e => !e.closest('.badani') && e.offsetParent !== null);
      return { dok: document.documentElement.classList.contains('badani-dok'), prekryv: obsah.filter(e => e.getBoundingClientRect().right > p.left + 1).length }; })()`);
    assert.ok(dok.dok, 'na 1366 px je panel ukotvený');
    assert.equal(dok.prekryv, 0, 'ukotvený panel nezakrývá model');
    v.obsah = await zkontrolujObsah(stranka);
    assert.deepEqual(v.obsah.chyby, [], 'obsah úkolů a otázek');
    assert.ok(v.obsah.ukolu >= 3 && v.obsah.otazek >= 8, 'aspoň 3 úkoly a 8 otázek');

    // 2) klávesy v panelu nejdou do modelu
    const pred = await evaluate(`JSON.stringify([...document.querySelectorAll('input,select')].map(e => e.type === 'checkbox' ? e.checked : e.value))`);
    await evaluate(`document.querySelector('.badani-zalozky button').focus()`);
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', ' ']) {
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key === ' ' ? 'Space' : key });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key === ' ' ? 'Space' : key });
    }
    const po = await evaluate(`JSON.stringify([...document.querySelectorAll('input,select')].map(e => e.type === 'checkbox' ? e.checked : e.value))`);
    assert.equal(po, pred, 'šipky v panelu nemění model');

    // 3) všechny úkoly (první s chybnou předpovědí)
    for (let i = 0; i < v.obsah.ukolu; i++) await projdiUkol(i, i === 0);
    const spoustec = await evaluate(`document.querySelector('.badani-spoustec').textContent`);
    assert.match(spoustec, new RegExp(`${v.obsah.ukolu}/${v.obsah.ukolu}`), 'počítadlo hotových úkolů');
    assert.ok(await evaluate(`!!__tlac('na otázky')`), 'po posledním úkolu nabídka otázek');

    // 4) obnovení po načtení
    await nacti('obsah/' + stranka);
    const obnova = await evaluate(`({ hotove: [...document.querySelectorAll('.badani-zalozky button')].filter(b => b.textContent.startsWith('✅')).length,
      otevreno: !document.getElementById('badaniOkno').hidden })`);
    assert.equal(obnova.hotove, v.obsah.ukolu, 'hotové úkoly se pamatují');
    assert.ok(obnova.otevreno, 'panel zůstal otevřený');

    // 5) Procvič: fáze otevře otázky, odpověď, Pokračovat
    await evaluate(`__klik('.kostra-faze [data-faze="procvic"]')`);
    await cekej(150);
    assert.ok(await evaluate(`!document.querySelector('.badani-otazky').hidden`), 'Procvič otevře otázky');
    await odpovezOtazku();
    assert.ok(await evaluate(`document.activeElement.classList.contains('badani-pokracovat')`), 'fokus na Pokračovat');
    await evaluate(`document.activeElement.click()`);

    // 6) Ověř se: 8 otázek, výsledek odpovídá prvním pokusům a uloží se
    await evaluate(`Badani.sbalit()`);   // Ověř se musí panel otevřít sám
    await evaluate(`__klik('.kostra-faze [data-faze="overse"]')`);
    assert.ok(await cekejNa(`!!document.querySelector('.badani .kostra-overeni')`, 4000), 'Ověř se běží v panelu');
    assert.ok(await evaluate(`!document.getElementById('badaniOkno').hidden && getComputedStyle(document.querySelector('.badani-zalozky')).display === 'none'`),
      'Ověř se otevře panel a skryje záložky');
    let napoprve = 0;
    for (let k = 0; k < 8; k++) {
      if (await odpovezOtazku()) napoprve++;
      await cekej(50);
      if (k < 7) await evaluate(`document.querySelector('.badani-pokracovat').click()`);
    }
    assert.ok(await cekejNa(`!!document.querySelector('.badani .kostra-vysledek')`, 4000), 'výsledek Ověř se');
    const vysl = await evaluate(`({ h: document.querySelector('.kostra-vysledek h2').textContent,
      ulozeno: JSON.parse(localStorage.getItem('metodus_overeni') || '{}')['${stranka}'] })`);
    assert.equal(vysl.h, `🎯 Správně napoprvé ${napoprve} z 8`, 'výsledek odpovídá prvním pokusům');
    assert.equal(vysl.ulozeno?.at(-1)?.spravne, napoprve, 'výsledek se uložil');
    await evaluate(`[...document.querySelectorAll('.kostra-vysledek button')].find(b => b.textContent === 'Zavřít').click()`);

    // 7) Tahák se shrnutími
    await evaluate(`__klik('.kostra-faze [data-faze="tahak"]')`);
    const tahak = await evaluate(`({ open: document.querySelector('dialog.kostra-dialog')?.open, body: document.querySelectorAll('dialog.kostra-dialog li').length })`);
    assert.ok(tahak.open, 'Tahák se otevře');
    assert.equal(tahak.body, v.obsah.ukolu, 'Tahák má shrnutí každého úkolu');
    await evaluate(`document.querySelector('dialog.kostra-dialog').close()`);

    // 8) Výuka otevře úkoly, Esc sbalí a vrátí fokus na spouštěč
    await evaluate(`__klik('.kostra-faze [data-faze="vyuka"]')`);
    assert.ok(await evaluate(`!document.querySelector('.badani-ukol').hidden`), 'Výuka otevře úkoly');
    await evaluate(`document.querySelector('.badani-zalozky button').focus()`);
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
    assert.ok(await evaluate(`document.getElementById('badaniOkno').hidden && document.activeElement.classList.contains('badani-spoustec')`), 'Esc sbalí panel');

    // 9) motivy: kontrast textu v panelu
    v.kontrast = {};
    for (const tema of ['light', 'dark', 'sepia', 'kontrast', 'nocni-skola']) {
      await nacti('obsah/' + stranka, tema);
      await evaluate(`Badani.otevri(0)`);
      await cekej(200);
      // i lišta fází kostry – s úkoly se objeví i na simulacích, které ji dřív neměly
      const k = await evaluate(`Math.min(...[...document.querySelectorAll('.badani h2, .badani h3, .badani h4, .badani p, .badani button, .badani .badani-pocet, .kostra button, .kostra-cil')]
        .filter(e => e.offsetParent && e.textContent.trim()).map(e => __kontrast(e)))`);
      v.kontrast[tema] = k;
      assert.ok(k >= 4.5, `kontrast v motivu ${tema}: ${k}`);
    }

    // 10) mobil: poprvé sbalený, bez přetečení, otevřený panel se vejde
    for (const sirka of [390, 320]) {
      await vyrovnej(sirka, 740);
      await nacti('obsah/' + stranka);
      await evaluate(`localStorage.removeItem('metodus_badani')`);
      await nacti('obsah/' + stranka);
      const m = await evaluate(`({ sbaleno: document.getElementById('badaniOkno').hidden, pretok: document.documentElement.scrollWidth > innerWidth,
        spoustec: (() => { const r = document.querySelector('.badani-spoustec').getBoundingClientRect(); return r.right <= innerWidth && r.bottom <= innerHeight && r.left >= 0; })() })`);
      assert.ok(m.sbaleno, `${sirka}px: panel poprvé sbalený`);
      assert.equal(m.pretok, false, `${sirka}px: bez přetečení`);
      assert.ok(m.spoustec, `${sirka}px: spouštěč na obrazovce`);
      await evaluate(`document.querySelector('.badani-spoustec').click()`);
      await cekej(150);
      const o = await evaluate(`(() => { const r = document.querySelector('.badani-okno').getBoundingClientRect();
        return { vejde: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, vyska: Math.round(r.height / innerHeight * 100) }; })()`);
      assert.ok(o.vejde, `${sirka}px: otevřený panel se vejde`);
      v['mobil' + sirka] = o.vyska + ' % výšky';
    }
    await vyrovnej(1366, 900);
    assert.deepEqual(errors.map(e => e.exception?.description || e.text), [], 'bez výjimek JS');
    v.ok = true;
    await call('Page.navigate', { url: 'about:blank' });
  }
} finally {
  console.log(JSON.stringify(vysledky, null, 1));
  await bcall('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
  ws.close(); browserWs.close();
}
