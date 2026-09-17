// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa04-vzhled.mjs.
// Vzhled starších stránek: eduMaps a eduSort musí jít s motivem webu, záměrně tmavé
// stránky (přednáška, glóbusy, ISS) musí zůstat tmavé a mít čitelné ovládání.
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
  const n = ++id; const timer = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout: ' + method)); }, 30000);
  pending.set(n, m => { clearTimeout(timer); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expression => {
  const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
// Pomůcky vložené do stránky: světlost barvy a kontrastní poměr podle WCAG.
const POMUCKY = `
  window.__barva = s => {
    const m = String(s).match(/-?[\\d.]+/g) || [];
    const [r, g, b, a = 1] = m.map(Number);
    return { r, g, b, a };
  };
  window.__jas = s => {
    const { r, g, b } = __barva(s);
    const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  };
  // skutečné pozadí prvku: průhledné vrstvy přeskočíme směrem k rodičům
  window.__pozadi = el => {
    for (let e = el; e; e = e.parentElement) {
      const b = getComputedStyle(e).backgroundColor;
      if (__barva(b).a > 0.5) return b;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  window.__kontrast = el => {
    const s = getComputedStyle(el);
    const a = __jas(s.color), b = __jas(__pozadi(el));
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  };
  window.__nejhorsi = vyber => [...document.querySelectorAll(vyber)]
    .filter(el => el.offsetParent !== null && el.textContent.trim())
    .map(el => ({ text: el.textContent.trim().slice(0, 30), kontrast: __kontrast(el) }))
    .sort((x, y) => x.kontrast - y.kontrast)[0] || null;
`;
const nacti = async (cesta, tema) => {
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.setItem('webapp_theme','${tema}')}catch(e){}` });
  errors = [];
  await call('Page.navigate', { url: base + cesta });
  for (let i = 0; i < 200; i++) {
    if (await evaluate(`document.readyState==='complete'`)) break;
    await new Promise(r => setTimeout(r, 50));
  }
  await new Promise(r => setTimeout(r, 400));
  await evaluate(POMUCKY);
};
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  const vysledky = {};

  // 1) eduMaps: světlý motiv se projeví a karty nezůstanou tmavé.
  await nacti('obsah/eduMaps.html', 'light');
  const mapy = await evaluate(`({
    tema: document.documentElement.dataset.theme || '(žádné)',
    stranka: __jas(getComputedStyle(document.body).backgroundColor),
    nejtmavsiKarta: Math.min(...[...document.querySelectorAll('.karta, .lekce, article, section')].map(e => __jas(__pozadi(e)))),
    gradienty: [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).backgroundImage.includes('gradient')).length,
    nejhorsiText: __nejhorsi('p, li, h1, h2, h3, a')
  })`);
  assert.equal(mapy.tema, 'light', 'eduMaps přebírá motiv');
  assert.ok(mapy.stranka > 0.5, 'světlé pozadí stránky');
  assert.ok(mapy.nejtmavsiKarta > 0.5, 'žádná tmavá karta ve světlém motivu: ' + mapy.nejtmavsiKarta);
  assert.equal(mapy.gradienty, 0, 'na stránce nezůstal gradient');
  assert.ok(mapy.nejhorsiText.kontrast >= 4.5, 'kontrast textu: ' + JSON.stringify(mapy.nejhorsiText));
  vysledky.eduMaps = mapy;

  // 2) eduSort: panely, plátno i popisek motivu odpovídají skutečnému motivu.
  for (const tema of ['light', 'dark']) {
    await nacti('obsah/eduSort.html', tema);
    const r = await evaluate(`({
      tema: document.documentElement.dataset.theme || 'dark',
      popisek: temaStav.textContent.trim(),
      stranka: __jas(getComputedStyle(document.body).backgroundColor),
      panel: __jas(__pozadi(document.querySelector('.panel'))),
      platno: __jas(__pozadi(document.getElementById('canvasWrap'))),
      statistika: __jas(__pozadi(document.querySelector('.stats'))),
      textPlatna: barvyPlatna.text, sloupec: barvyPlatna.modra,
      nejhorsiText: __nejhorsi('.small, .desc, .legend, label, h1')
    })`);
    const svetlo = tema === 'light';
    assert.equal(r.popisek, svetlo ? '🎨 Téma: světlé' : '🎨 Téma: tmavé', 'popisek motivu (' + tema + '): ' + r.popisek);
    for (const [co, jas] of [['panel', r.panel], ['plátno', r.platno], ['statistika', r.statistika]])
      assert.equal(jas > 0.5, svetlo, co + ' odpovídá motivu ' + tema + ' (jas ' + jas + ')');
    assert.equal(__jasTextu(r.textPlatna) < 0.5, svetlo, 'popisky v plátně mají opačný jas než podklad (' + tema + '): ' + r.textPlatna);
    assert.ok(r.nejhorsiText.kontrast >= 4.5, 'kontrast textu (' + tema + '): ' + JSON.stringify(r.nejhorsiText));
    vysledky['eduSort_' + tema] = r;
  }

  // 3) eduSort reaguje na přepnutí motivu za běhu (rozcestník posílá postMessage).
  await nacti('obsah/eduSort.html', 'dark');
  await evaluate(`window.postMessage({ tema: 'light' }, '*')`);
  await new Promise(r => setTimeout(r, 300));
  const poPrepnuti = await evaluate(`({ tema: document.documentElement.dataset.theme, popisek: temaStav.textContent.trim(), text: barvyPlatna.text })`);
  assert.equal(poPrepnuti.tema, 'light', 'postMessage přepne motiv');
  assert.equal(poPrepnuti.popisek, '🎨 Téma: světlé', 'popisek se přepne s motivem');
  assert.ok(__jasTextu(poPrepnuti.text) < 0.5, 'barvy plátna se obnoví: ' + poPrepnuti.text);
  vysledky.eduSortPrepnuti = poPrepnuti;

  // 4) Záměrně tmavé stránky zůstanou tmavé i při světlém motivu webu a mají čitelné ovládání.
  for (const [cesta, ovladani] of [
    ['obsah/AI_prednaska.html', '.nav-btn, button, .subtitle, p'],
    ['obsah/planet_globe.html', '.toolbar button, .toolbar a, .subtitle'],
    ['obsah/iss.html', '.toolbar button, .toolbar a, .panel .v, .panel .stav']
  ]) {
    await nacti(cesta, 'light');
    const r = await evaluate(`({
      tema: document.documentElement.dataset.theme || '(žádné)',
      stranka: __jas(getComputedStyle(document.body).backgroundColor),
      nejhorsiOvladani: __nejhorsi('${ovladani}')
    })`);
    assert.equal(r.tema, '(žádné)', cesta + ' zůstává bez data-theme (vlastní tmavá paleta)');
    assert.ok(r.stranka < 0.2, cesta + ' zůstává tmavá i při světlém motivu (jas ' + r.stranka + ')');
    assert.ok(r.nejhorsiOvladani && r.nejhorsiOvladani.kontrast >= 4.5,
      cesta + ' — kontrast ovládání: ' + JSON.stringify(r.nejhorsiOvladani));
    assert.equal(errors.length, 0, cesta + ' — výjimka: ' + JSON.stringify(errors));
    vysledky[cesta] = r;
  }

  // 5) Šířky bez přetečení v obou motivech.
  const sirky = [];
  for (const cesta of ['obsah/eduMaps.html', 'obsah/eduSort.html']) for (const tema of ['light', 'dark']) {
    await nacti(cesta, tema);
    for (const width of [1366, 390, 320]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await new Promise(r => setTimeout(r, 150));
      const s = await evaluate(`({width: innerWidth, scroll: document.documentElement.scrollWidth})`);
      assert.ok(s.scroll <= s.width + 1, cesta + ' přetéká při ' + width + ' ' + tema + ' (' + s.scroll + ')');
      sirky.push(cesta + ' ' + width + '/' + tema);
    }
    await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  }
  console.log(JSON.stringify({ ok: true, ...vysledky, sirky: sirky.length }, null, 2));
} finally { ws.close(); }

// jas barvy počítaný v Node (stejný vzorec jako __jas ve stránce)
function __jasTextu(s) {
  const t = String(s).trim();
  if (t.startsWith('#')) {
    const h = t.slice(1);
    return jasZ(h.length === 3 ? h.split('').map(c => parseInt(c + c, 16)) : [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)));
  }
  return jasZ((t.match(/-?[\d.]+/g) || []).slice(0, 3).map(Number));
}
function jasZ([r, g, b]) {
  const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
}
