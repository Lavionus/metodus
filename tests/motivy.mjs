// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/motivy.mjs.
// Čtyři motivy: přepínač rozcestníku je střídá dokola a posílá do lekce,
// data-tone odpovídá motivu, záměrně tmavé simulace zůstanou tmavé i v sépii,
// textura se nekreslí na průhledné prvky a hlavní text drží kontrast.
import assert from 'node:assert/strict';
const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
// vlastní záložka: v seznamu mohou být i záložky jiných běžících testů
const target = await (await fetch(endpoint.replace(/\/json$/, '/json/new?about:blank'), { method: 'PUT' })).json();
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
  window.__holaTextura = () => [...document.body.querySelectorAll('*')].filter(el => {
    const s = getComputedStyle(el);
    return /recyklovany|knihovna-drevo|tabule-krida/.test(s.backgroundImage) && __barva(s.backgroundColor).a === 0 && el.offsetParent !== null;
  }).length;
`;
const nacti = async (cesta, tema) => {
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('webapp_theme','${tema}')}catch(e){}` });
  errors = [];
  await call('Page.navigate', { url: base + cesta });
  for (let i = 0; i < 200; i++) {
    if (await evaluate(`document.readyState==='complete'`)) break;
    await cekej(50);
  }
  await cekej(900);   // přechody barev tlačítek doběhnou
  await evaluate(POMUCKY);
};
const TONY = { dark: 'dark', light: 'light', kontrast: 'light', sepia: 'light', 'sepia-tmava': 'dark', knihovna: 'dark', skola: 'light', 'nocni-skola': 'dark' };
const vysledky = {};
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  // 1) Rozcestník: výklopný seznam nabídne všechny motivy (ve skupinách) a volbu pošle do lekce v iframu.
  await nacti('index.html#obsah/eduSort.html', 'dark');
  await cekej(800);
  const kolo = [];
  const PORADI = ['light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola', 'dark'];
  assert.deepEqual(await evaluate(`[...temaVolba.options].map(o => o.value)`), ['auto', 'dark', 'light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola'], 'motivy v seznamu');
  assert.deepEqual(await evaluate(`[...temaVolba.querySelectorAll('optgroup')].map(g => g.label)`), ['Základní', 'Tematické'], 'skupiny seznamu');
  for (const volba of PORADI) {
    await evaluate(`temaVolba.value = '${volba}'; temaVolba.dispatchEvent(new Event('change', { bubbles: true }))`);
    await cekej(300);
    kolo.push(await evaluate(`(() => { const f = document.querySelector('iframe'); const d = f.contentDocument.documentElement;
      return { tema: MetodusTheme.get(), tone: document.documentElement.dataset.tone, popis: temaVolba.selectedOptions[0].textContent, hodnota: temaVolba.value,
        ramec: d.dataset.theme || 'dark', ramecTone: d.dataset.tone, stitek: f.contentDocument.getElementById('temaStav')?.textContent,
        ulozeno: localStorage.getItem('webapp_theme') }; })()`));
  }
  assert.deepEqual(kolo.map(k => k.tema), PORADI, 'zvolené motivy: ' + JSON.stringify(kolo));
  for (const k of kolo) {
    assert.equal(k.tone, TONY[k.tema], 'tón rozcestníku ' + k.tema);
    assert.equal(k.ramec, k.tema, 'lekce v iframu převzala motiv ' + k.tema);
    assert.equal(k.ramecTone, TONY[k.tema], 'tón lekce ' + k.tema);
    assert.equal(k.ulozeno, k.tema, 'volba se uloží');
    assert.equal(k.hodnota, k.tema, 'seznam ukazuje zvolený motiv');
    assert.ok(k.popis.length > 3, 'položka seznamu má název: ' + k.popis);
  }
  assert.equal(kolo[2].stitek, '🎨 Téma: sépie', 'eduSort pojmenuje sépii');
  assert.equal(kolo[3].stitek, '🎨 Téma: tmavá sépie', 'eduSort pojmenuje tmavou sépii');
  assert.equal(kolo[4].stitek, '🎨 Téma: stará knihovna', 'eduSort pojmenuje knihovnu');
  assert.equal(kolo[6].stitek, '🎨 Téma: noční škola', 'eduSort pojmenuje noční školu');
  assert.equal(kolo[1].stitek, '🎨 Téma: vysoký kontrast', 'eduSort pojmenuje vysoký kontrast');
  assert.equal(errors.length, 0, 'rozcestník — výjimka: ' + JSON.stringify(errors));
  vysledky.prepinac = kolo.map(k => k.tema + '/' + k.tone);

  // 2) Záměrně tmavé simulace zůstanou tmavé ve všech motivech; ve světlém tónu mají čitelné lišty.
  for (const cesta of ['obsah/solar_system.html', 'obsah/gravitacni_hriste.html', 'obsah/pohyb_vesmirem.html']) {
    for (const tema of ['kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola']) {
      await nacti(cesta, tema);
      const r = await evaluate(`({ telo: __jas(getComputedStyle(document.body).backgroundColor),
        tlacitka: Math.min(...[...document.querySelectorAll('button')].filter(b => b.offsetParent && b.textContent.trim() && !b.matches('.aktivni,.on,.active')).map(__kontrast)),
        hola: __holaTextura() })`);
      assert.ok(r.telo < 0.1, cesta + ' zůstává tmavá v motivu ' + tema + ' (jas ' + r.telo + ')');
      assert.ok(r.tlacitka >= 4.5, cesta + ' — kontrast tlačítek v motivu ' + tema + ': ' + r.tlacitka);
      assert.equal(r.hola, 0, cesta + ' — textura na průhledném prvku (' + tema + ')');
      assert.equal(errors.length, 0, cesta + ' — výjimka: ' + JSON.stringify(errors));
      vysledky[cesta + ' ' + tema] = r;
    }
  }

  // 3) Běžné lekce: pozadí odpovídá tónu, textura je načtená, text a nadpis drží kontrast.
  for (const cesta of ['index.html', 'obsah/m4_zlomky_uvod.html', 'obsah/aj3_abeceda.html', 'obsah/osnova.html', 'obsah/pocitani.html']) {
    for (const tema of ['kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola']) {
      await nacti(cesta, tema);
      const r = await evaluate(`(async () => ({ telo: __jas(__pozadi(document.body)),
        textura: getComputedStyle(document.body).backgroundImage,
        texturaNactena: await new Promise(res => { const m = getComputedStyle(document.body).backgroundImage.match(/url\\("?(.*?)"?\\)/);
          if (!m) return res(/linear-gradient/.test(getComputedStyle(document.body).backgroundImage)); const i = new Image(); i.onload = () => res(i.naturalWidth > 0); i.onerror = () => res(false); i.src = m[1]; }),
        nadpis: __kontrast(document.querySelector('h1') || document.body),
        odstavec: Math.min(...[...document.querySelectorAll('p, li, label, a, h2, h3, summary')].filter(e => e.offsetParent && e.textContent.trim()).slice(0, 40).map(__kontrast)),
        hola: __holaTextura(),
        preteka: document.documentElement.scrollWidth > innerWidth + 1 }))()`);
      if (TONY[tema] === 'light') assert.ok(r.telo > 0.6, cesta + ' má světlé pozadí v motivu ' + tema + ' (jas ' + r.telo + ')');
      else assert.ok(r.telo < 0.05, cesta + ' má tmavé pozadí v motivu ' + tema + ' (jas ' + r.telo + ')');
      const TEX = { kontrast: /^none$/, sepia: /recyklovany-papir/, 'sepia-tmava': /recyklovany-papir/, knihovna: /knihovna-drevo/, skola: /linear-gradient/, 'nocni-skola': /tabule-krida/ };
      assert.match(r.textura, TEX[tema], cesta + ' — textura motivu');
      if (tema !== 'kontrast') assert.ok(r.texturaNactena, cesta + ' — textura se načte (' + tema + ')');
      assert.ok(r.nadpis >= 4.5, cesta + ' — kontrast nadpisu ' + tema + ': ' + r.nadpis);
      // vysoký kontrast slibuje úroveň AAA (7 : 1), ostatní motivy AA (4,5 : 1)
      assert.ok(r.odstavec >= (tema === 'kontrast' ? 7 : 4.5), cesta + ' — kontrast textu ' + tema + ': ' + r.odstavec);
      if (tema === 'kontrast') assert.ok(r.nadpis >= 7, cesta + ' — nadpis ve vysokém kontrastu: ' + r.nadpis);
      assert.equal(r.hola, 0, cesta + ' — textura na průhledném prvku (' + tema + ')');
      assert.equal(r.preteka, false, cesta + ' přetéká (' + tema + ')');
      assert.equal(errors.length, 0, cesta + ' — výjimka: ' + JSON.stringify(errors));
      vysledky[cesta + ' ' + tema] = { telo: r.telo, nadpis: r.nadpis, odstavec: r.odstavec };
    }
  }

  // 4) Plátno: MetodusTheme.paper() dá v sépii i knihovně vzorek, jinde vrátí zadanou barvu.
  await nacti('obsah/m4_zlomky_uvod.html', 'knihovna');
  const vzorek = await evaluate(`new Promise(res => { const c = document.createElement('canvas').getContext('2d');
    const prvni = MetodusTheme.paper(c, '#123456');
    window.addEventListener('metodus-paper-ready', () => res({ prvni: typeof prvni, pak: MetodusTheme.paper(c, '#123456') instanceof CanvasPattern }), { once: true });
    setTimeout(() => res({ prvni: typeof prvni, pak: MetodusTheme.paper(c, '#123456') instanceof CanvasPattern }), 3000); })`);
  assert.equal(vzorek.pak, true, 'paper() vrátí CanvasPattern po načtení textury');
  await nacti('obsah/m4_zlomky_uvod.html', 'light');
  assert.equal(await evaluate(`MetodusTheme.paper(document.createElement('canvas').getContext('2d'), '#123456')`), '#123456', 've světlém motivu paper() vrací zadanou barvu');

  // 5) Úzká obrazovka: každý motiv zůstane bez vodorovného přetečení a zachová čitelný text.
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (const tema of Object.keys(TONY)) {
    await nacti('obsah/m4_zlomky_uvod.html', tema);
    const r = await evaluate(`(() => { const prvky = [...document.querySelectorAll('p, li, label, a, h2, h3, summary')]
      .filter(e => e.offsetParent && e.textContent.trim()).slice(0, 40).map(e => ({ e, k: __kontrast(e) }));
      const minimum = prvky.sort((a, b) => a.k - b.k)[0]; return { preteka: document.documentElement.scrollWidth > innerWidth + 1,
        text: minimum.k, prvek: minimum.e.outerHTML.slice(0, 240), barva: getComputedStyle(minimum.e).color, pozadi: __pozadi(minimum.e) }; })()`);
    assert.equal(r.preteka, false, 'mobilní lekce přetéká (' + tema + ')');
    assert.ok(r.text >= (tema === 'kontrast' ? 7 : 4.5), 'mobilní kontrast textu ' + tema + ': ' + JSON.stringify(r));
    assert.equal(errors.length, 0, 'mobilní lekce — výjimka (' + tema + '): ' + JSON.stringify(errors));
  }
  await nacti('obsah/m4_zlomky_uvod.html', 'sepia-tmava');
  assert.deepEqual(await evaluate(`[MetodusTheme.isSepia(), MetodusTheme.ink('#123456'), MetodusTheme.ink('#123456', '#654321', '#fedcba')]`),
    [true, '#f0dfc0', '#fedcba'], 'API sépie rozliší tmavý inkoust');
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  // 6) „Podle systému“: vykreslí tmavý/světlý podle zařízení a přepne se za běhu i v lekci v iframu.
  const system = hodnota => call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: hodnota }] });
  await system('light');
  await nacti('index.html#obsah/eduSort.html', 'auto');
  await cekej(800);
  const stavAuto = () => evaluate(`(() => { const d = document.querySelector('iframe').contentDocument;
    return { volba: temaVolba.value, tema: document.documentElement.dataset.theme || 'dark', tone: document.documentElement.dataset.tone,
      ramec: d.documentElement.dataset.theme || 'dark', stitek: d.getElementById('temaStav')?.textContent,
      ulozeno: localStorage.getItem('webapp_theme') }; })()`);
  let a = await stavAuto();
  assert.deepEqual([a.volba, a.tema, a.tone, a.ramec, a.ulozeno], ['auto', 'light', 'light', 'light', 'auto'], 'auto + světlý systém: ' + JSON.stringify(a));
  assert.equal(a.stitek, '🎨 Téma: podle systému (světlé)', 'popisek eduSort u volby podle systému');
  await system('dark'); await cekej(400);
  a = await stavAuto();
  assert.deepEqual([a.volba, a.tema, a.tone, a.ramec], ['auto', 'dark', 'dark', 'dark'], 'systém přepnut na tmavý za běhu: ' + JSON.stringify(a));
  await call('Emulation.setEmulatedMedia', { features: [] });
  vysledky.auto = a;

  // 7) Motiv mění jen barvy: písmo nadpisů, textu a ovládání je ve všech motivech stejné.
  const pisma = {};
  for (const tema of ['dark', 'light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola']) {
    await nacti('obsah/aj3_abeceda.html', tema);
    pisma[tema] = await evaluate(`['h1', 'h2', 'p', 'button', 'body'].map(v => { const e = document.querySelector(v);
      return e ? v + ': ' + getComputedStyle(e).fontFamily + ' ' + getComputedStyle(e).fontWeight : ''; }).join(' | ')`);
  }
  for (const [tema, p] of Object.entries(pisma)) assert.equal(p, pisma.dark, 'motiv ' + tema + ' mění písmo: ' + p);
  vysledky.pisma = pisma.dark;

  console.log(JSON.stringify(vysledky, null, 1));
  console.log('motivy: OK');
} finally {
  ws.close();
  await fetch(endpoint.replace(/\/json$/, '/json/close/') + target.id);
}
