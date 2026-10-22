// Starší samostatné stránky (F) převedené pod uloha.js / procvic.js.
// Spustit místní server (8766), Chromium s CDP (9223), pak:
//   node tests/prevod-f.mjs [stranka.html …]
// Úsporně: jedna záložka v izolovaném kontextu, stránky postupně,
// pod 1,5 GB volné paměti test skončí.
//
// Na každé stránce: fáze kostry (Procvič + Ověř se), možnosti jsou tlačítka
// a dají se ovládat klávesnicí (Tab + Enter), chyba → druhý pokus, série
// doběhne do přehledu s „Nová série“, Ověř se doběhne do výsledku a uloží ho,
// každý režim postaví otázku, 390/320 px bez přetečení, kontrast možností
// a zpětné vazby ve světlém i tmavém motivu, bez výjimek JS.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const VYCHOZI = ['flags_quiz.html', 'svetova_hlavni_mesta.html', 'reky_pohori.html', 'eu_instituce.html', 'casova_osa.html', 'svetove_dejiny.html',
  'potravni_retezec.html', 'pocitani.html', 'notes_reading.html', 'roman_numerals.html', 'morse_code.html', 'slabiky.html', 'music_theory.html',
  'procenta.html', 'rovnice.html', 'geometrie_vzorce.html', 'geo_tvary.html', 'aj_slovicka.html', 'de_slovicka.html', 'fr_slovicka.html',
  'aj_slovesa.html', 'chem_nazvoslovi.html', 'vycislovani_rovnic.html'];
const stranky = process.argv.slice(2).length ? process.argv.slice(2) : VYCHOZI;
const volnaPamet = () => { const m = readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+)/); return m ? +m[1] / 1024 : Infinity; };

const verze = await (await fetch(endpoint + '/version')).json();
const bws = new WebSocket(verze.webSocketDebuggerUrl);
await new Promise(r => bws.onopen = r);
let bid = 0; const bp = new Map();
bws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { bp.get(m.id)?.(m); bp.delete(m.id); } };
const bcall = (method, params = {}) => new Promise(res => { const n = ++bid; bp.set(n, m => res(m.result)); bws.send(JSON.stringify({ id: n, method, params })); });
const { browserContextId } = await bcall('Target.createBrowserContext', { disposeOnDetach: true });
const { targetId } = await bcall('Target.createTarget', { url: 'about:blank', browserContextId });
const target = (await (await fetch(endpoint)).json()).find(t => t.id === targetId);
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); let errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; const t = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout ' + method)); }, 30000);
  pending.set(n, m => { clearTimeout(t); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expr => {
  const r = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const cekej = ms => new Promise(r => setTimeout(r, ms));
const cekejNa = async (v, ms = 5000) => { for (let t = 0; t < ms; t += 100) { if (await evaluate(v)) return true; await cekej(100); } return false; };
const klavesa = async (key, code = key) => {
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: key === 'Enter' ? 13 : key === 'Tab' ? 9 : 0,
    ...(key === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {}) });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
};
const POMUCKY = `
  window.__barva = s => { const m = String(s).match(/-?[\\d.]+/g) || []; let [r = 0, g = 0, b = 0, a = 1] = m.map(Number);
    if (/^color\\(srgb/.test(s)) { r *= 255; g *= 255; b *= 255; } return { r, g, b, a }; };
  window.__jas = s => { const { r, g, b } = __barva(s); const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2]; };
  window.__pozadi = el => { for (let e = el; e; e = e.parentElement) { const b = getComputedStyle(e).backgroundColor; if (__barva(b).a > 0.5) return b; } return getComputedStyle(document.body).backgroundColor; };
  window.__kontrast = el => { const a = __jas(getComputedStyle(el).color), b = __jas(__pozadi(el)); return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100; };
  // počet nových otázek (uloha.js i procvic.js ohlašují metodus:otazka)
  window.__otazek = 0; document.addEventListener('metodus:otazka', () => window.__otazek++);
  // odpoví na aktuální otázku: zkouší možnosti, dokud některá nezezelená
  // nebo nejsou všechny zamčené; vrátí, zda sedla první
  window.__odpovez = async () => {
    const plocha = document.querySelector('#plocha');
    // psaná odpověď (jedno pole, nebo vlastní vstup s víc políčky – koeficienty rovnice)
    const pole = plocha.querySelector('input.odpoved-pole:not(:disabled)') || plocha.querySelector('input:not(:disabled)');
    if (pole) {   // dvakrát vedle → správná odpověď se ukáže a jde se dál
      for (let k = 0; k < 2 && !pole.disabled; k++) {
        pole.value = '9797';
        pole.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await new Promise(r => setTimeout(r, 30));
      }
      return 'pole';
    }
    const tl = [...plocha.querySelectorAll('.moznosti button')];
    const texty = tl.map(b => b.textContent.trim());
    if (new Set(texty).size !== texty.length) (window.__duplicity ||= []).push(texty.join(' | '));
    for (let i = 0; i < tl.length; i++) {
      if (tl[i].disabled) continue;
      tl[i].click();
      await new Promise(r => setTimeout(r, 30));
      if (tl[i].classList.contains('spravne')) return i === 0 ? 'prvni' : 'pozdeji';
      if (tl.every(b => b.disabled)) return 'druha-chyba';
    }
    return 'nic';
  };
`;
const nacti = async (f, tema = 'dark') => {
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('webapp_theme','${tema}');localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'}))}catch(e){}` });
  await call('Page.navigate', { url: base + 'obsah/' + f });
  for (let i = 0; i < 100; i++) { if (await evaluate(`document.readyState==='complete'`)) break; await cekej(50); }
  await cekejNa(`!!document.querySelector('.kostra-faze')`, 4000);
  await cekej(300);
  await evaluate(POMUCKY);
};
const pokracuj = () => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && /Pokračovat/.test(b.textContent) && !b.closest('.kostra')); if (b) { b.click(); return true; } return false; })()`);

const vysledky = {};
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  for (const f of stranky) {
    if (volnaPamet() < 1500) { console.log('Málo paměti – konec před', f); break; }
    const v = vysledky[f] = {}; errors = [];
    await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
    await nacti(f);
    await evaluate(`localStorage.removeItem('metodus_overeni')`);

    // 1) fáze a tlačítka
    const faze = await evaluate(`[...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze)`);
    assert.ok(faze.includes('procvic') && faze.includes('overse'), 'fáze Procvič a Ověř se: ' + faze);
    v.faze = faze.join(',');
    // stránka může začínat výkladem (přehled) – pak první procvičovací režim
    await evaluate(`document.querySelectorAll('#plocha .moznosti button').length || document.querySelector('#rezimy [data-rezim]:not([data-faze])')?.click()`);
    await cekej(150);
    const psana = await evaluate(`!!document.querySelector('#plocha input') && !document.querySelector('#plocha .moznosti button')`);
    if (psana) {
      // psaná odpověď: pole má fokus, napíšu nesmysl a Enter → druhý pokus
      assert.ok(await evaluate(`document.activeElement === document.querySelector('#plocha input')`), 'pole odpovědi má fokus');
      await call('Input.insertText', { text: '999' });
      await klavesa('Enter');
      await cekej(150);
      assert.match(await evaluate(`document.querySelector('#plocha .odezva').textContent`), /Ještě ne/, 'Enter odešle odpověď, po chybě druhý pokus');
    } else {
      assert.ok(await evaluate(`document.querySelectorAll('#plocha .moznosti button').length >= 2`), 'možnosti jsou tlačítka');
      // 2) klávesnice: fokus na první možnost, Enter odpoví
      await evaluate(`document.querySelector('#plocha .moznosti button').focus()`);
      await klavesa('Enter');
      await cekej(150);
      assert.ok(await evaluate(`[...document.querySelectorAll('#plocha .moznosti button')].some(b => b.classList.contains('spravne') || b.classList.contains('spatne') || b.disabled) || /Ještě|Správně/.test(document.querySelector('#plocha .odezva')?.textContent || '')`),
        'Enter na možnosti odpoví');
    }

    // 3) každý režim postaví otázku
    const rezimy = await evaluate(`[...document.querySelectorAll('#rezimy [data-rezim]:not([data-faze])')].map(b => b.dataset.rezim)`);
    for (const r of rezimy) {
      await evaluate(`document.querySelector('#rezimy [data-rezim="${r}"]').click()`);
      await cekej(120);
      assert.ok(await evaluate(`document.querySelectorAll('#plocha .moznosti button').length >= 2 || !!document.querySelector('#plocha input')`), 'režim ' + r + ' má otázku');
      assert.ok(!/undefined|NaN/.test(await evaluate(`document.querySelector('#plocha').textContent`)), 'režim ' + r + ' bez undefined/NaN');
    }
    v.rezimu = rezimy.length;

    // 4) série (s ukazatelem #pokrok) doběhne do přehledu; průběžné procvičování
    //    musí po každé odpovědi dát novou otázku
    await evaluate(`document.querySelector('#rezimy [data-rezim]:not([data-faze])')?.click()`);
    await cekej(120);
    const jeSerie = await evaluate(`!!document.getElementById('pokrok')`);
    let kola = 0;
    if (jeSerie) {
      while (kola < 40 && await evaluate(`!document.querySelector('#plocha .vysledky')`)) {
        await evaluate(`__odpovez()`);
        await cekej(80); await pokracuj(); await cekej(80);
        kola++;
      }
      assert.ok(await evaluate(`!!document.querySelector('#plocha .vysledky')`), 'série doběhne do výsledku');
      assert.ok(await evaluate(`[...document.querySelectorAll('#plocha .vysledky button')].some(b => /Nová série/.test(b.textContent))`), 'Nová série na konci');
    } else {
      for (; kola < 12; kola++) {
        await evaluate(`window.__pred = window.__otazek`);
        const r = await evaluate(`__odpovez()`);
        assert.notEqual(r, 'nic', 'otázka ' + kola + ' má odpověď');
        await cekej(80); await pokracuj();
        assert.ok(await cekejNa(`window.__otazek > window.__pred && (document.querySelectorAll('#plocha .moznosti button:not(:disabled)').length >= 2 || !!document.querySelector('#plocha input:not(:disabled)'))`, 4000), 'po odpovědi další otázka');
      }
    }
    assert.deepEqual(await evaluate(`window.__duplicity || []`), [], 'žádná otázka nemá dvě stejné možnosti');
    v.serie = (jeSerie ? 'série ' : 'průběžně ') + kola + ' otázek';

    // 5) Ověř se
    await evaluate(`document.querySelector('.kostra-faze [data-faze="overse"]').click()`);
    assert.ok(await cekejNa(`!!document.querySelector('.kostra-overeni')`, 4000), 'Ověř se se spustí');
    for (let k = 0; k < 20 && !(await evaluate(`!!document.querySelector('.kostra-vysledek')`)); k++) {
      if (await evaluate(`!!document.querySelector('#plocha .vysledky')`)) await evaluate(`[...document.querySelectorAll('#plocha .vysledky button')].find(b => /Nová série/.test(b.textContent)).click()`);
      await evaluate(`__odpovez()`);
      await cekej(80); await pokracuj(); await cekej(150);
    }
    assert.ok(await cekejNa(`!!document.querySelector('.kostra-vysledek')`, 4000), 'Ověř se doběhne do výsledku');
    assert.equal(await evaluate(`JSON.parse(localStorage.getItem('metodus_overeni') || '{}')['${f}']?.at(-1)?.celkem`), 8, 'výsledek Ověř se uložen');

    // 6) motivy: kontrast možností a zpětné vazby
    v.kontrast = {};
    for (const tema of ['dark', 'light']) {
      await nacti(f, tema);
      await evaluate(`document.querySelectorAll('#plocha .moznosti button').length || document.querySelector('#rezimy [data-rezim]:not([data-faze])')?.click()`);
      await cekej(150);
      await evaluate(`__odpovez()`); await cekej(700);
      const k = await evaluate(`Math.min(...[...document.querySelectorAll('#plocha .moznosti button, #plocha .odezva, #plocha .velky-text, #plocha .odpoved-pole, .ovladani button, #rezimy button')]
        .filter(e => e.offsetParent && e.textContent.trim()).map(__kontrast))`);
      v.kontrast[tema] = k;
      assert.ok(k >= 4.5, `kontrast ${tema}: ${k}`);
    }

    // 7) mobil
    for (const w of [390, 320]) {
      await call('Emulation.setDeviceMetricsOverride', { width: w, height: 740, deviceScaleFactor: 1, mobile: true });
      await nacti(f);
      assert.equal(await evaluate(`document.documentElement.scrollWidth > innerWidth`), false, w + ' px bez přetečení');
    }
    assert.deepEqual(errors, [], 'bez výjimek JS');
    v.ok = true;
    await call('Page.navigate', { url: 'about:blank' });
  }
} finally {
  console.log(JSON.stringify(vysledky, null, 1));
  await bcall('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
  ws.close(); bws.close();
}
