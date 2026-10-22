// Interaktivní výklad „Světlo a optika“ (obsah/optika_lekce.html).
// Spustit místní server (8766), Chromium s CDP (9223), pak:
//   node tests/optika-lekce.mjs
// Úsporně: jedna záložka v izolovaném kontextu (vlastní localStorage).
//
// Kontroluje: načtení bez chyb, kostru (5 fází, rodina), fyziku modelů proti
// vzorcům (Snell, Fresnel, mezní úhel, tlustá čočka, zobrazovací rovnice,
// hranol v minimu odchylky, duhový úhel, oko), splnitelnost všech 24 úkolů
// a předpovědí (i skutečným tažením úchopu), uložení a obnovení postupu,
// „Začít znovu“, generátory otázek (40× každý), procvičování přes uloha.js,
// Ověř se s uložením výsledku, mobil 390 px bez přetečení a kontrast
// popisků i paprsků ve všech motivech.
import assert from 'node:assert/strict';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const STRANKA = 'obsah/optika_lekce.html';

const verze = await (await fetch(endpoint + '/version')).json();
const browserWs = new WebSocket(verze.webSocketDebuggerUrl);
await new Promise(r => browserWs.onopen = r);
let bid = 0; const bpending = new Map();
browserWs.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { bpending.get(m.id)?.(m); bpending.delete(m.id); } };
const bcall = (method, params = {}) => new Promise(res => { const n = ++bid; bpending.set(n, m => res(m.result)); browserWs.send(JSON.stringify({ id: n, method, params })); });
const { browserContextId } = await bcall('Target.createBrowserContext', { disposeOnDetach: true });
const { targetId } = await bcall('Target.createTarget', { url: 'about:blank', browserContextId });
const target = (await (await fetch(endpoint)).json()).find(t => t.id === targetId);

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
const pending = new Map(); let id = 0; let errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push({ text: m.params.args.map(a => a.value || a.description).join(' ') });
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
const snimek = () => evaluate('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
const nacti = async (cekat = 900) => {
  errors = [];
  await call('Page.navigate', { url: base + STRANKA });
  await cekejNa(`document.readyState === 'complete' && !!window.OptikaLekce`);
  await cekejNa(`!!document.querySelector('.kostra')`, 5000);
  await cekej(cekat);
};
const vysledek = {};

try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true }); await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    try { localStorage.setItem('metodus_posun', JSON.stringify({ rezim: 'rucne', tempo: 'normal' })); } catch {}
    window.__zmena = (sel, v) => { const e = document.querySelector(sel); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    window.__seg = (sel, v) => document.querySelector(sel + ' [data-hodnota="' + v + '"]').click();
    window.__zaskrtni = (id, v) => { const e = document.getElementById(id); if (e.checked !== v) e.click(); };
    window.__nastav = (model, zmeny) => { const M = OptikaLekce.MODELY[model]; Object.assign(M.s, zmeny); M.m.vykresli(); };
    window.__barva = s => { const m = String(s).match(/-?[\\d.]+/g) || []; let [r = 0, g = 0, b = 0, a = 1] = m.map(Number);
      if (/^color\\(srgb/.test(s)) { r *= 255; g *= 255; b *= 255; } return { r, g, b, a }; };
    window.__jas = s => { const { r, g, b } = __barva(s);
      const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2]; };
    window.__pomer = (a, b) => { const x = __jas(a), y = __jas(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };` });

  // 1) Načtení, kostra, všechny modely vykreslené.
  await call('Page.navigate', { url: base + STRANKA });
  await cekejNa(`!!window.OptikaLekce`);
  await evaluate(`localStorage.removeItem('metodus_optika_lekce'); localStorage.removeItem('metodus_overeni')`);
  await nacti();
  assert.deepEqual(errors, [], 'bez chyb JS');
  const zaklad = await evaluate(`({
    faze: [...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze),
    rodina: document.querySelector('.kostra-rodina')?.textContent || '',
    modely: Object.keys(OptikaLekce.MODELY),
    prazdne: [...document.querySelectorAll('svg.model')].filter(s => !s.closest('details:not([open])') && s.querySelectorAll('path, circle, rect').length < 5).map(s => s.closest('figure').id),
    ukolu: OptikaLekce.Ukoly.vse.length,
    kapitol: document.querySelectorAll('#osnova li').length, mapa: document.querySelectorAll('#mapa a').length })`);
  assert.deepEqual(zaklad.faze, ['vyuka', 'ukazka', 'procvic', 'overse', 'tahak']);
  assert.match(zaklad.rodina, /Světlo, zvuk a vlnění/);
  assert.equal(zaklad.modely.length, 13, 'modely: ' + zaklad.modely);
  assert.deepEqual(zaklad.prazdne, []);
  assert.equal(zaklad.ukolu, 24);
  assert.equal(zaklad.kapitol, 12); assert.equal(zaklad.mapa, 10);
  vysledek.zaklad = { modelu: zaklad.modely.length, ukolu: zaklad.ukolu };

  // 2) Fyzika modelů proti vzorcům.
  const fyz = await evaluate(`(() => {
    const O = OptikaLekce, R = Math.PI / 180, out = {};
    // planparalelní deska: paprsek vyjde rovnoběžně s dopadajícím
    const deska = { n: () => 1.5, hrany: O.hranyMnohouhelniku([[100, 0], [200, 0], [200, 300], [100, 300]]) };
    const d0 = [Math.cos(30 * R), Math.sin(30 * R)];
    const r = O.trasuj([deska], [0, 50], d0, 550);
    const u = r.useky.at(-1), d1 = [u.b[0] - u.a[0], u.b[1] - u.a[1]], l = Math.hypot(...d1);
    out.deska = Math.abs(d1[0] / l - d0[0]) + Math.abs(d1[1] / l - d0[1]);
    out.fresnel = O.fresnel(1, 1.5, 1, 1);
    // lom 45° ze vzduchu do vody a mezní úhel skla
    __nastav('lom', { nahore: 'vzduch', dole: 'voda', strana: 'nahore', alfa: 45 });
    out.lom45 = Math.abs(O.MODELY.lom.s.v.b) / R;
    __nastav('mezni', { nahore: 'vzduch', dole: 'sklo', strana: 'dole', alfa: 41 }); out.tir41 = O.MODELY.mezni.s.v.tir;
    __nastav('mezni', { alfa: 42 }); out.tir42 = O.MODELY.mezni.s.v.tir;
    __nastav('mezni', { alfa: 30 });
    // tlustá spojka (poloměr 300, n = 1,5, výška 96, okraj 6): ohnisko za čočkou
    __nastav('cocka', { typ: 'spojka', R: 300, n: 1.5, osa: true });
    out.cocka = O.MODELY.cocka.s.f;
    __nastav('cocka', { typ: 'rozptylka' }); out.rozptylka = O.MODELY.cocka.s.f;
    __nastav('cocka', { typ: 'spojka', osa: false });
    // zobrazovací rovnice
    const zob = O.MODELY.zobrazeni;
    zob.nastav({ typ: 'spojka', f: 10, a: 30, y: 6 }); zob.m.vykresli(); out.ap30 = zob.s.v.ap;
    zob.nastav({ a: 15 }); zob.m.vykresli(); out.ap15 = zob.s.v.ap; out.Z15 = zob.s.v.Z;
    zob.nastav({ a: 5 }); zob.m.vykresli(); out.ap5 = zob.s.v.ap;
    zob.nastav({ typ: 'rozptylka', a: 20 }); zob.m.vykresli(); out.apR = zob.s.v.ap;
    zob.nastav({ typ: 'spojka', f: 10, a: 30, y: 6 }); zob.m.vykresli();
    // hranol v minimu odchylky (korunové sklo, výchozí natočení)
    out.hranol = O.MODELY.hranol.s.odchylka;
    // oko: rozsah ostrého vidění z odečtů
    const oko = t => { __nastav('oko', { typ: t, a: Infinity, G: 0 }); return document.querySelector('#obr-oko .odecty').textContent; };
    out.okoZdrave = oko('zdrave'); out.okoKratko = oko('kratkozrake'); out.okoDaleko = oko('dalekozrake'); out.okoStari = oko('stari');
    __nastav('oko', { typ: 'zdrave' });
    return out; })()`);
  assert.ok(fyz.deska < 1e-9, 'deska: ' + fyz.deska);
  assert.ok(Math.abs(fyz.fresnel - 0.04) < 1e-9);
  const beta = Math.asin(Math.sin(45 * Math.PI / 180) / 1.33) * 180 / Math.PI;
  assert.ok(Math.abs(fyz.lom45 - beta) < 1e-6, 'lom 45°');
  assert.equal(fyz.tir41, false); assert.equal(fyz.tir42, true);
  // Gullstrand pro tlustou čočku: zadní ohnisková vzdálenost + půl tloušťky
  const Rc = 300, n = 1.5, H = 96, t = 2 * (Rc - Math.sqrt(Rc * Rc - H * H)) + 6;
  const f = 1 / ((n - 1) * (2 / Rc - (n - 1) * t / (n * Rc * Rc)));
  const zaStredem = (f * (1 - (n - 1) * t / (n * Rc)) + t / 2) / 10;
  assert.ok(Math.abs(fyz.cocka - zaStredem) < 0.05, `čočka ${fyz.cocka} × ${zaStredem}`);
  assert.ok(fyz.rozptylka < -25 && fyz.rozptylka > -35, 'rozptylka ' + fyz.rozptylka);
  assert.ok(Math.abs(fyz.ap30 - 15) < 1e-9 && Math.abs(fyz.ap15 - 30) < 1e-9 && Math.abs(fyz.Z15 + 2) < 1e-9);
  assert.ok(Math.abs(fyz.ap5 + 10) < 1e-9 && Math.abs(fyz.apR + 20 / 3) < 1e-9);
  const dMin = (2 * Math.asin(1.5168 * Math.sin(30 * Math.PI / 180)) * 180 / Math.PI) - 60;
  assert.ok(Math.abs(fyz.hranol - dMin) < 0.3, `hranol ${fyz.hranol} × ${dMin}`);
  assert.match(fyz.okoZdrave, /od 25 cm do ∞/);
  assert.match(fyz.okoKratko, /od 14 cm do 33 cm/);
  assert.match(fyz.okoDaleko, /od 1(,0)? m do ∞/);
  assert.match(fyz.okoStari, /od 1(,0)? m do ∞/);
  const duha = await evaluate(`(() => { document.querySelector('#obr-duha').closest('details').open = true; __zaskrtni('duha-svazek', true); OptikaLekce.MODELY.duha.m.vykresli();
    const t = document.querySelector('#obr-duha .odecty').textContent; __zaskrtni('duha-svazek', false); return t; })()`);
  assert.match(duha, /≈ 42,[2-4]°/, 'duhový úhel: ' + duha);
  vysledek.fyzika = { lom45: +fyz.lom45.toFixed(2), cocka: +fyz.cocka.toFixed(2), hranol: +fyz.hranol.toFixed(2) };

  // 3) Skutečné tažení úchopu: laser u zákona odrazu na 60°.
  await evaluate(`(() => { __seg('#odraz-povrch', 'hladky'); document.getElementById('obr-odraz').scrollIntoView({ block: 'center' }); })()`);
  await snimek();
  const tah = await evaluate(`(() => {
    const svg = document.querySelector('#obr-odraz svg.model'), u = svg.querySelector('.uchop');
    const m = svg.getScreenCTM(), bod = (x, y) => new DOMPoint(x, y).matrixTransform(m);
    const r = u.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    const cil = bod(450 - 235 * Math.sin(Math.PI / 3), 330 - 235 * Math.cos(Math.PI / 3));
    const ev = (typ, x, y) => u.dispatchEvent(new PointerEvent(typ, { bubbles: true, clientX: x, clientY: y, pointerId: 7, button: 0, isPrimary: true }));
    ev('pointerdown', x0, y0);
    for (let i = 1; i <= 6; i++) ev('pointermove', x0 + (cil.x - x0) * i / 6, y0 + (cil.y - y0) * i / 6);
    ev('pointerup', cil.x, cil.y);
    return OptikaLekce.MODELY.odraz.s.alfa; })()`);
  assert.equal(tah, 60, 'tažení laseru');
  await snimek();
  assert.ok(await evaluate(`OptikaLekce.Ukoly.vse.find(u => u.id === 'odraz-60').hotovo`), 'úkol odraz-60 po tažení');
  // klávesnice: šipka posune laser o 1°
  await evaluate(`document.querySelector('#obr-odraz .uchop').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))`);
  await snimek();
  assert.equal(await evaluate(`OptikaLekce.MODELY.odraz.s.alfa`), 61);

  // 4) Všechny úkoly a předpovědi jdou splnit.
  const tip = (idP, i = 0) => `document.querySelectorAll('[data-predpoved="${idP}"] .volby button')[${i}].click()`;
  const kroky = [
    tip('vid-deska', 1), `__zaskrtni('vid-lampa', true); __seg('#vid-prostredi', 'drevo')`,
    `__seg('#vid-prostredi', 'mlecne')`,
    `__zmena('#stin-zdroj', 0)`,
    `__zmena('#stin-zdroj', 70); __nastav('stin', { koule: [240, 190] })`,
    tip('odraz-drsny', 0), `__seg('#odraz-povrch', 'drsny')`,
    tip('zrc-kde', 1), `__nastav('zrcadlo', { oko: [480, 150] }); __zaskrtni('zrc-prodlouzit', true)`,
    `__nastav('zrcadlo', { x: 330, oko: [500, 150] })`,
    `__nastav('lom', { nahore: 'vzduch', dole: 'voda', strana: 'nahore', alfa: 45 })`,
    tip('lom-diamant', 1), `__seg('#obr-lom [data-latka=dole]', 'diamant')`,
    `(() => { const c = document.querySelector('#obr-lom [data-vlny]'); if (!c.checked) c.click(); })()`,
    tip('hl-tuzka', 2), `__zaskrtni('hl-skutecna', true)`,
    tip('mezni', 1), `__nastav('mezni', { nahore: 'vzduch', dole: 'sklo', strana: 'dole', alfa: 60 })`,
    `__seg('#obr-mezni [data-latka=dole]', 'voda'); __nastav('mezni', { alfa: 49 })`,
    tip('vlakno', 0), `__zmena('#vl-ohyb', 30)`,
    tip('hranol', 2), `__zaskrtni('hr-zvetsit', true)`,
    `__seg('#co-typ', 'spojka'); __zmena('#co-r', 380)`, tip('cocka-r', 0), `__zmena('#co-r', 300)`,
    `__seg('#co-n', '1.7'); __zmena('#co-r', 180)`,
    tip('zob-30', 0), `__zaskrtni('zob-stinitko', true); __nastav('zobrazeni', { xs: 15 })`,
    `OptikaLekce.MODELY.zobrazeni.nastav({ a: 20 })`,
    `OptikaLekce.MODELY.zobrazeni.nastav({ a: 6 })`,
    `__seg('#zob-typ', 'rozptylka'); __zaskrtni('zob-stinitko', true)`,
    tip('oko-bryle', 0), `__seg('#oko-typ', 'kratkozrake'); __zmena('#oko-vzdalenost', 1000); __zmena('#oko-bryle', -3.25)`,
    `__seg('#oko-typ', 'dalekozrake'); document.querySelector('[data-oko-vzdalenost="25"]').click(); __zmena('#oko-bryle', 3.5)`,
  ];
  for (const k of kroky) { await evaluate(k); await snimek(); }
  await snimek();
  const stav = await evaluate(`OptikaLekce.Ukoly.vse.filter(u => !u.hotovo).map(u => u.id)`);
  assert.deepEqual(stav, [], 'nesplněné úkoly');
  assert.deepEqual(errors, [], 'bez chyb JS při úkolech');
  const pred = await evaluate(`(() => { const p = document.querySelector('[data-predpoved="odraz-drsny"]');
    return { verdikt: p.querySelector('.verdikt').textContent, vys: p.querySelector('.vysledek').textContent.length, stav: p.querySelector('.stav').textContent }; })()`);
  assert.match(pred.verdikt, /jiného/); assert.ok(pred.vys > 150); assert.match(pred.stav, /Hotovo/);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /24 z 24/);
  assert.equal(await evaluate(`document.querySelectorAll('#osnova li.hotovo').length`), 9);   // kapitola Přístroje úkoly nemá

  // 4b) Tlačítko „Nasadit brýle“: každá vada se opraví (krátkozraké do dálky, dalekozraké a stáří na čtení).
  for (const typ of ['kratkozrake', 'dalekozrake', 'stari']) {
    await evaluate(`__seg('#oko-typ', '${typ}'); document.getElementById('oko-nasadit').click()`);
    assert.ok(await cekejNa(`OptikaLekce.MODELY.oko.s.G !== 0 && OptikaLekce.MODELY.oko.s.ostre && document.getElementById('oko-nasadit').textContent.includes('Sundat')`, 4000), 'brýle pro ' + typ);
  }
  await evaluate(`__seg('#oko-typ', 'zdrave')`); await snimek();
  assert.ok(await evaluate(`document.getElementById('oko-nasadit').disabled && /nejsou potřeba/.test(document.getElementById('oko-nasadit').textContent)`));
  // oko má u všech vad stejnou délku; příliš silné i slabé brýle obraz rozmažou
  const oko = await evaluate(`(() => { const M = OptikaLekce.MODELY.oko, r = {};
    const zkus = (typ, a, G) => { Object.assign(M.s, { typ, a, G }); M.m.vykresli(); return { ostre: M.s.ostre, sitnice: Math.round(document.querySelector('#obr-oko ellipse.bulva').getAttribute('rx')) }; };
    r.a = zkus('zdrave', Infinity, 0); r.b = zkus('kratkozrake', Infinity, -3.25); r.c = zkus('kratkozrake', Infinity, -4.5);
    r.d = zkus('kratkozrake', Infinity, -2); r.e = zkus('stari', 25, 3.75); r.f = zkus('stari', 25, 5); r.g = zkus('stari', 25, 2.5);
    r.h = zkus('dalekozrake', 25, 0); zkus('zdrave', Infinity, 0); return r; })()`);
  assert.equal(new Set(Object.values(oko).map(x => x.sitnice)).size, 1, 'stejně velké oko');
  assert.deepEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(k => oko[k].ostre), [true, true, false, false, true, false, false, false]);
  // tužka: při pohledu shora je zdánlivá hloubka hrotu hloubka / 1,33
  const hl = await evaluate(`(() => { const M = OptikaLekce.MODELY.hloubka; const hrotX = 400 + Math.sin(M.s.sklon * Math.PI / 180) * 200;
    __nastav('hloubka', { oko: [hrotX + 1, 30] }); return [M.s.hloubka, M.s.zdanliva]; })()`);
  assert.ok(Math.abs(hl[1] - hl[0] / 1.33) < 0.15, 'zdánlivá hloubka ' + hl);

  // 5) Postup přežije načtení; „Začít znovu“ ho smaže (po potvrzení).
  await nacti(600);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /24 z 24/);
  assert.equal(await evaluate(`document.querySelectorAll('.predpoved.hotovo').length`), 11);
  assert.match(await evaluate(`document.querySelector('[data-predpoved="vid-deska"] .verdikt').textContent`), /potvrdila/);
  await evaluate(`document.getElementById('zacitZnovu').click()`);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /24 z 24/, 'první klik jen žádá potvrzení');
  await evaluate(`document.getElementById('zacitZnovu').click()`);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /0 z 24/);
  assert.equal(await evaluate(`document.querySelectorAll('.predpoved.hotovo, .ukol.hotovo').length`), 0);

  // 6) Generátory otázek: 40× každý – jedna správná, různé texty, zdůvodnění u chybných,
  //    vysvětlení bez HTML (uloha.js ho vypisuje jako text), žádné NaN.
  const gen = await evaluate(`(() => { const chyby = [];
    for (const g of OptikaLekce.GENERATORY) for (let i = 0; i < 40; i++) {
      const q = g.gen(), texty = q.moznosti.map(m => m.t);
      const unik = new Set(texty);
      const vse = JSON.stringify(q);
      if (q.moznosti.filter(m => m.ok).length !== 1) chyby.push(g.id + ': správných ' + q.moznosti.filter(m => m.ok).length);
      if (unik.size < 3) chyby.push(g.id + ': jen ' + unik.size + ' různé možnosti');
      if (q.moznosti.some(m => !m.ok && !m.proc)) chyby.push(g.id + ': chybná bez zdůvodnění');
      if (/NaN|undefined|Infinity/.test(vse)) chyby.push(g.id + ': ' + vse.slice(0, 120));
      if (/<[a-z]/i.test(q.vysvetleni + q.napoveda + q.moznosti.map(m => (m.proc || '') + m.t).join(''))) chyby.push(g.id + ': HTML ve vysvětlení');
    }
    return { chyby: [...new Set(chyby)], pocet: OptikaLekce.GENERATORY.length }; })()`);
  assert.deepEqual(gen.chyby, []);
  vysledek.generatoru = gen.pocet;

  // 7) Procvič: chyba se zatřese a vysvětlí, správná odpověď se započte napoprvé jen jednou.
  await evaluate(`localStorage.removeItem('metodus_optika_lekce_skore'); document.querySelector('.kostra-faze [data-faze=procvic]').click()`);
  await snimek();
  const odpovez = spravne => evaluate(`(() => { const q = OptikaLekce.Procvic.otazka;
    const ok = q.moznosti.find(m => m.ok).t;
    const b = [...document.querySelectorAll('#cv-moznosti .moznosti button')].find(b => (b.textContent.slice(1) === ok) === ${spravne});
    b.click(); return document.getElementById('cv-odezva').textContent; })()`);
  const chyba = await odpovez(false);
  assert.match(chyba, /^✗ .+Zkus jinou možnost\.$/);
  const dobre = await odpovez(true);
  assert.match(dobre, /^✅ Správně\./);
  assert.ok(await evaluate(`!!document.querySelector('.cviceni button.pokracovat')`), 'ruční posun nabídne Pokračovat');
  assert.match(await evaluate(`document.getElementById('cv-skore').textContent`), /0 z 1/);
  await evaluate(`document.querySelector('.cviceni button.pokracovat').click()`);
  assert.ok(await evaluate(`!!document.querySelector('.posun-obal')`), 'lišta má volbu tempa');
  // klávesa 1–4 odpoví
  await evaluate(`document.querySelector('#cv-moznosti .moznosti button').focus(); document.querySelector('.cviceni').dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }))`);
  assert.ok(await evaluate(`/✅|✗/.test(document.getElementById('cv-odezva').textContent)`), 'klávesa 1');
  // téma omezí otázky
  await evaluate(`document.querySelector('#cv-temata [data-tema=oko]').click()`);
  for (let i = 0; i < 5; i++) { assert.equal(await evaluate(`OptikaLekce.Procvic.otazka.generator.tema`), 'oko'); await evaluate(`document.getElementById('btnDalsi').click()`); }
  await evaluate(`document.querySelector('#cv-temata [data-tema=vse]').click()`);

  // 8) Ověř se: 8 otázek bez nápovědy a výkladu, výsledek se uloží.
  await evaluate(`localStorage.removeItem('metodus_overeni'); document.querySelector('.kostra-faze [data-faze=overse]').click()`);
  assert.ok(await cekejNa(`!!document.querySelector('.kostra-overeni')`));
  const skryte = await evaluate(`[getComputedStyle(document.getElementById('btnNapoveda')).display, getComputedStyle(document.getElementById('lom')).display]`);
  assert.deepEqual(skryte, ['none', 'none']);
  for (let i = 0; i < 8; i++) {
    await odpovez(i !== 2 && i !== 5);
    if (i === 2 || i === 5) await odpovez(true);
    if (await evaluate(`!!document.querySelector('.kostra-vysledek')`)) break;
    await cekejNa(`!!document.querySelector('.cviceni button.pokracovat')`, 3000);
    await evaluate(`document.querySelector('.cviceni button.pokracovat')?.click()`);
    await snimek();
  }
  assert.ok(await cekejNa(`!!document.querySelector('.kostra-vysledek')`, 4000), 'výsledek Ověř se');
  const ulozeno = await evaluate(`JSON.parse(localStorage.getItem('metodus_overeni'))['optika_lekce.html'].at(-1)`);
  assert.equal(ulozeno.celkem, 8); assert.equal(ulozeno.spravne, 6);
  vysledek.overse = ulozeno;
  assert.deepEqual(errors, [], 'bez chyb JS v procvičování');

  // 9) Tahák: dialog kostry s kartami.
  await evaluate(`document.querySelector('.kostra-vysledek button:last-child').click(); document.querySelector('.kostra-faze [data-faze=tahak]').click()`);
  assert.ok(await evaluate(`document.querySelector('dialog.kostra-dialog').open && document.querySelectorAll('.kostra-tahak-obsah .tahak-karta').length === 6`));
  await evaluate(`document.querySelector('dialog.kostra-dialog').close()`);

  // 10) Mobil 390 px: nic nepřetéká, písmo v modelech zůstane čitelné (≥ 10 px).
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await nacti(800);
  const mob = await evaluate(`(() => { const t = document.querySelector('#obr-zobrazeni svg.model text');
    return { sirka: document.documentElement.scrollWidth, okno: innerWidth, pismo: t.getBoundingClientRect().height }; })()`);
  assert.ok(mob.sirka <= mob.okno, `přetečení ${mob.sirka} > ${mob.okno}`);
  assert.ok(mob.pismo >= 10, 'písmo v modelu ' + mob.pismo);
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  // 11) Kontrast ve všech motivech: text odečtů a popisky v modelu ≥ 4,5 : 1, paprsek a obraz ≥ 3 : 1.
  const motivy = ['dark', 'light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola'];
  const slabe = [];
  for (const t of motivy) {
    await evaluate(`localStorage.setItem('webapp_theme', '${t}')`);
    await nacti(500);
    const k = await evaluate(`(() => {
      const plocha = getComputedStyle(document.querySelector('#obr-lom .obr-plocha')).backgroundColor;
      const panel = getComputedStyle(document.querySelector('#obr-lom .odecty')).backgroundColor;
      const barva = sel => getComputedStyle(document.querySelector(sel)).fill;
      const cara = sel => getComputedStyle(document.querySelector(sel)).stroke;
      return { odecet: __pomer(getComputedStyle(document.querySelector('#obr-lom .odecty span')).color, panel),
        popisek: __pomer(barva('#obr-lom svg.model text.t-maly'), plocha),
        paprsek: __pomer(cara('#obr-lom .c-paprsek .cara'), plocha),
        obraz: (() => { const e = document.createElement('span'); e.style.color = 'var(--o-obraz)'; document.body.append(e);
          const c = getComputedStyle(e).color; e.remove(); return __pomer(c, plocha); })() }; })()`);
    for (const [co, min] of [['odecet', 4.5], ['popisek', 4.5], ['paprsek', 3], ['obraz', 3]]) if (k[co] < min) slabe.push(`${t}/${co} ${k[co].toFixed(2)}`);
  }
  await evaluate(`localStorage.removeItem('webapp_theme')`);
  assert.deepEqual(slabe, [], 'kontrast');
  vysledek.motivu = motivy.length;

  console.log('OK optika_lekce', JSON.stringify(vysledek));
} finally {
  ws.close();
  await bcall('Target.disposeBrowserContext', { browserContextId });
  browserWs.close();
}
