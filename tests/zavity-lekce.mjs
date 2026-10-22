// Interaktivní výklad „Závity a šrouby“ (obsah/zavity_lekce.html).
// Spustit místní server (8766), Chromium s CDP (9223), pak:
//   node tests/zavity-lekce.mjs
// Úsporně: jedna záložka v izolovaném kontextu (vlastní localStorage).
//
// Kontroluje: načtení bez chyb, kostru (5 fází, rodina), fyziku šroubu proti
// vzorcům (síla na klice, účinnost, samosvornost, posun matice, mikrometr,
// doporučené utahovací momenty), určení šroubu měřítkem a měrkou,
// tažení kliky myší, splnitelnost všech 27 úkolů a předpovědí, uložení
// a obnovení postupu, „Začít znovu“, generátory otázek (40× každý),
// procvičování přes uloha.js, Ověř se s uložením výsledku, Tahák,
// mobil 390/320 px bez přetečení a kontrast barev ve všech motivech.
import assert from 'node:assert/strict';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const STRANKA = 'obsah/zavity_lekce.html';

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
  await cekejNa(`document.readyState === 'complete' && !!window.ZavityLekce`);
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
    window.__M = id => ZavityLekce.MODELY[id];
    window.__barva = s => { const m = String(s).match(/-?[\\d.]+/g) || []; let [r = 0, g = 0, b = 0, a = 1] = m.map(Number);
      if (/^color\\(srgb/.test(s)) { r *= 255; g *= 255; b *= 255; } return { r, g, b, a }; };
    window.__jas = s => { const { r, g, b } = __barva(s);
      const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2]; };
    window.__pomer = (a, b) => { const x = __jas(a), y = __jas(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    window.__var = n => { const e = document.createElement('span'); e.style.color = 'var(' + n + ')'; document.body.append(e); const c = getComputedStyle(e).color; e.remove(); return c; };` });
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

  // 1) Načtení, kostra, všechny modely vykreslené.
  await call('Page.navigate', { url: base + STRANKA });
  await cekejNa(`!!window.ZavityLekce`);
  await evaluate(`localStorage.removeItem('metodus_zavity_lekce'); localStorage.removeItem('metodus_overeni')`);
  await nacti();
  assert.deepEqual(errors, [], 'bez chyb JS');
  const zaklad = await evaluate(`({
    faze: [...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze),
    rodina: document.querySelector('.kostra-rodina')?.textContent || '',
    modely: Object.keys(ZavityLekce.MODELY),
    prazdne: [...document.querySelectorAll('svg.model')].filter(s => s.querySelectorAll('path, circle, rect').length < 8).map(s => s.closest('figure').id),
    ukolu: ZavityLekce.Ukoly.vse.length,
    kapitol: document.querySelectorAll('#osnova li').length, mapa: document.querySelectorAll('#mapa a').length,
    karet: document.querySelectorAll('#tridicka .predmet-karta').length })`);
  assert.deepEqual(zaklad.faze, ['vyuka', 'ukazka', 'procvic', 'overse', 'tahak']);
  assert.match(zaklad.rodina, /Síla, pohyb a stroje/);
  assert.deepEqual(zaklad.modely, ['navin', 'profil', 'urci', 'zvedak', 'samo', 'utah', 'mikro', 'dilna']);
  assert.deepEqual(zaklad.prazdne, []);
  assert.equal(zaklad.ukolu, 27);
  assert.equal(zaklad.kapitol, 11); assert.equal(zaklad.mapa, 9);
  assert.equal(zaklad.karet, 10);
  vysledek.zaklad = { modelu: zaklad.modely.length, ukolu: zaklad.ukolu, faze: zaklad.faze.join(',') };

  // 2) Fyzika šroubu proti vzorcům.
  const fyz = await evaluate(`(() => { const out = {};
    const Z = __M('zvedak'), D = __M('dilna');
    // bez tření F = Q · Pₕ / (2πR): 10 000 N, 4 mm, 25 cm → 25,46 N
    out.ideal = Z.F(); out.idealVzorec = 10000 * 0.004 / (2 * Math.PI * 0.25);
    __zaskrtni('zv-treni', true); out.treni = [Z.F(), Z.eta(), Z.samosvorny()]; __zaskrtni('zv-treni', false);
    // samosvorný závit má vždy účinnost pod 50 % (mřížka nastavení dílny)
    let poruseni = 0, samo = 0, nesamo = 0;
    for (const d of [8, 16, 24, 40]) for (const P of [0.5, 2, 5, 10]) for (const n of [1, 2, 4]) for (const mu of [0.05, 0.1, 0.15, 0.3]) {
      Object.assign(D.s, { d, P, n, mu, treni: true });
      if (D.samosvorny()) { samo++; if (D.eta() >= 0.5) poruseni++; } else nesamo++;
    }
    out.mrizka = [poruseni, samo > 10, nesamo > 10];
    D.nastavStroj('zvedak');
    // zlaté pravidlo: práce ruky za otáčku = Q · Pₕ (bez tření)
    Object.assign(D.s, { treni: false }); out.zlate = D.F() * 2 * Math.PI * D.s.R / 100 - D.s.Q * D.Ph() / 1000;
    D.nastavStroj('zvedak');
    // doporučené momenty pro 8.8 odpovídají tabulkám (M6 10, M8 25, M10 49, M12 85 N·m)
    out.momenty = ['M6', 'M8', 'M10', 'M12'].map(v => { const [d, As] = ZavityLekce.SROUBY_88[v]; return Math.round(0.2 * d / 1000 * 0.65 * As * 640); });
    return out; })()`);
  assert.ok(Math.abs(fyz.ideal - fyz.idealVzorec) < 1e-9, 'síla bez tření');
  assert.ok(fyz.treni[0] > fyz.ideal * 3 && fyz.treni[1] > 0.25 && fyz.treni[1] < 0.35 && fyz.treni[2], 'zvedák s třením: ' + fyz.treni);
  assert.deepEqual(fyz.mrizka, [0, true, true], 'samosvornost ⇒ účinnost < 50 %');
  assert.ok(Math.abs(fyz.zlate) < 1e-9, 'zlaté pravidlo');
  assert.deepEqual(fyz.momenty, [10, 24, 48, 84]);

  // 3) Tažení kliky myší: otočení zvedne šroub o stoupání za otáčku.
  await evaluate(`document.getElementById('obr-zvedak').scrollIntoView({ block: 'center' })`);
  await snimek();
  const geo = await evaluate(`(() => { const Z = __M('zvedak'), sv = Z.m.svg, m = sv.getScreenCTM();
    const bod = (x, y) => { const p = new DOMPoint(x, y).matrixTransform(m); return [p.x, p.y]; };
    const h = document.querySelector('#obr-zvedak .uchop').getBoundingClientRect();
    const st = sv.querySelector('ellipse.cara').getBBox();
    return { h: [h.x + h.width / 2, h.y + h.height / 2], c: bod(st.x + st.width / 2, st.y + st.height / 2), rx: bod(st.x + st.width, 0)[0] - bod(st.x + st.width / 2, 0)[0], ry: bod(0, st.y + st.height)[1] - bod(0, st.y + st.height / 2)[1] }; })()`);
  await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: geo.h[0], y: geo.h[1], button: 'left', clickCount: 1 });
  const uhel0 = Math.atan2((geo.h[0] - geo.c[0]) / geo.rx, (geo.h[1] - geo.c[1]) / geo.ry);
  for (let i = 1; i <= 48; i++) {
    const u = uhel0 + i * Math.PI / 16;
    await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: geo.c[0] + geo.rx * Math.sin(u), y: geo.c[1] + geo.ry * Math.cos(u), button: 'left', buttons: 1 });
  }
  await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: geo.c[0] + geo.rx * Math.sin(uhel0 + 3 * Math.PI), y: geo.c[1] + geo.ry * Math.cos(uhel0 + 3 * Math.PI), button: 'left' });
  const otoceno = await evaluate(`[__M('zvedak').s.phi / (2 * Math.PI), __M('zvedak').z()]`);
  assert.ok(Math.abs(otoceno[0] - 1.5) < 0.1, 'tažením 1,5 otáčky: ' + otoceno[0]);
  assert.ok(Math.abs(otoceno[1] - 1.5 * 4) < 0.4, 'zdvih 6 mm: ' + otoceno[1]);
  await evaluate(`document.getElementById('zv-vychozi').click()`);

  // 4) Posun matice: pravý závit po směru hodinových ručiček k hlavě, levý od hlavy.
  const mat = await evaluate(`(async () => { const P = __M('profil'), out = {};
    const pockej = () => new Promise(r => setTimeout(r, 120));
    __seg('#pr-n', 2); __zmena('#pr-P', 3); document.getElementById('pr-cw').click(); await pockej();
    out.prava = P.s.xn; document.getElementById('pr-vychozi').click();
    __zaskrtni('pr-levy', true); document.getElementById('pr-cw').click(); await pockej(); out.leva = P.s.xn;
    __zaskrtni('pr-levy', false); document.getElementById('pr-vychozi').click(); __seg('#pr-n', 1); __zmena('#pr-P', 2.5);
    return out; })()`);
  assert.deepEqual(mat, { prava: -6, leva: 6 });

  // 5) Všechny úkoly a předpovědi jsou splnitelné.
  const tip = (id, i = 0) => evaluate(`document.querySelector('[data-predpoved="${id}"] .volby button[data-i="${i}"]').click()`);
  const otoc = (id, n = 1) => evaluate(`(() => { const z = __M('${id}'); z.s.phi = Math.min(z.s.phi + ${n} * 2 * Math.PI + 0.01, 40 / z.Ph() * 2 * Math.PI); z.m.vykresli(); })()`);
  const nastav = (id, co) => evaluate(`(() => { const m = __M('${id}'); Object.assign(m.s, ${JSON.stringify(co)}); m.m.vykresli(); })()`);
  // 1 · navinutí
  await nastav('navin', { w: 1 });
  await tip('nav-hustota'); await evaluate(`__zmena('#nav-P', 2.5)`);
  await evaluate(`__zmena('#nav-P', 1)`);
  // 2 · popis
  await evaluate(`__seg('#pr-profil', 'Tr'); __zmena('#pr-P', 3); __seg('#pr-n', 2)`);
  await evaluate(`document.getElementById('pr-cw').click()`); await cekej(150);
  await tip('pop-levy'); await evaluate(`__zaskrtni('pr-levy', true); document.getElementById('pr-vychozi').click(); document.getElementById('pr-cw').click()`); await cekej(150);
  // 3 · zvedák
  await otoc('zvedak', 2.5);
  await tip('zv-polovina'); await evaluate(`__zmena('#zv-P', 2)`); await otoc('zvedak');
  await evaluate(`__zaskrtni('zv-treni', true)`); await otoc('zvedak');
  // 4 · samosvornost
  const pust = (a, mu) => evaluate(`__seg('#sa-mu', '${mu}'); __zmena('#sa-a', ${a}); document.getElementById('sa-pust').click(); __M('samo').s.stav`);
  assert.equal(await pust(8, 0.15), 'drzi');
  assert.equal(await pust(9, 0.15), 'dole');
  await tip('sa-olej'); assert.equal(await pust(5, 0.05), 'dole');
  assert.equal(await pust(3, 0.1), 'drzi');
  // 5 · mikrometr
  await tip('mi-dilek'); await evaluate(`document.getElementById('mi-d-plus').click()`);
  await nastav('mikro', { x: 7.38 }); await nastav('mikro', { x: 12.87 });
  const mer = await evaluate(`(() => { __zaskrtni('mi-predmet', true); const M = __M('mikro'), out = {}; M.m.vykresli();
    const vstup = document.getElementById('mi-hodnota'), over = document.getElementById('mi-over'), vys = document.getElementById('mi-vysledek');
    out.odecetSkryty = !/údaj/.test(M.m.odecty.textContent);
    vstup.value = '1'; over.click(); out.nedotocene = vys.textContent;
    M.s.x = M.s.predmet; M.m.vykresli();
    vstup.value = String(M.s.predmet + 0.5).replace('.', ','); over.click(); out.pul = vys.textContent;
    vstup.value = M.s.predmet.toFixed(2).replace('.', ','); over.click(); out.ok = vys.textContent;
    __zaskrtni('mi-predmet', false); return out; })()`);
  assert.ok(mer.odecetSkryty, 'při měření se údaj neprozradí');
  assert.match(mer.nedotocene, /dotoč/); assert.match(mer.pul, /0,5 mm/); assert.match(mer.ok, /^✓/);
  // 3 · urči šroub: měřítko dosedne, měrka sedí jen se správným lístkem, tři správná určení
  const ur = await evaluate(`(() => { const U = __M('urci'), out = { urceno: [] };
    for (let n = 0; n < 3; n++) {
      const [z, d, P] = ZavityLekce.ZAVITY_M[U.s.i];
      U.s.yJ = 1e9; const h = document.querySelector('#obr-urci .uchop');
      h.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); U.m.vykresli();
      out.mereni = U.m.odecty.textContent;
      const jiny = [0.7, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5].find(l => l !== P);
      __seg('#ur-list', String(jiny)); U.m.vykresli(); const sedelJiny = U.m.svg.textContent.includes('bez mezer');
      __seg('#ur-list', String(P)); U.m.vykresli(); if (!U.m.svg.textContent.includes('bez mezer')) out.nesedi = z;
      const spatna = [...document.querySelectorAll('#ur-volby button')].find(b => b.textContent !== z); spatna.click();
      const chyba = U.s.urceno;
      [...document.querySelectorAll('#ur-volby button')].find(b => b.textContent === z).click();
      out.urceno.push([n, sedelJiny, chyba, U.s.urceno, Math.abs(parseFloat(out.mereni.match(/([\\d,]+) mm/)[1].replace(',', '.')) - (d - 0.02 * d - 0.06)) < 0.011]);
      document.getElementById('ur-dalsi').click();
    }
    return out; })()`);
  assert.equal(ur.nesedi, undefined, 'správný lístek sedí');
  assert.deepEqual(ur.urceno.map(x => [x[1], x[2], x[3], x[4]]), [[false, 0, 1, true], [false, 1, 2, true], [false, 2, 3, true]]);
  // 6 · utahování
  const ut = await evaluate(`(() => { const T = __M('utah'), out = [];
    const utahni = (v, F, r) => { __seg('#ut-v', v); __zmena('#ut-F', F); T.s.r = r; document.getElementById('ut-utahni').click(); out.push(T.s.stav); };
    utahni('M12', 200, 25); utahni('M12', 300, 25);
    document.querySelector('[data-predpoved="ut-m6"] .volby button[data-i="0"]').click();
    utahni('M6', 300, 30); utahni('M8', 100, 25); utahni('M8', 100, 35);
    return out; })()`);
  assert.deepEqual(ut, ['malo', 'spravne', 'prasklo', 'spravne', 'pretazeno']);
  // 8 · dílna
  await evaluate(`__seg('#hr-stroj', 'sverak')`); await otoc('dilna');
  await evaluate(`__seg('#hr-stroj', 'rychlo'); __zmena('#hr-P', 7)`); await otoc('dilna');
  const vratil = await evaluate(`(() => { const D = __M('dilna'); document.getElementById('hr-pust').click(); return [D.s.phi, D.samosvorny()]; })()`);
  assert.deepEqual(vratil, [0, false], 'nesamosvorný šroub se po puštění vrátí');
  await tip('hr-50'); await evaluate(`__seg('#hr-stroj', 'zvedak'); __seg('#hr-mu', '0.05'); __zmena('#hr-d', 8); __zmena('#hr-P', 10)`);
  // 7 · třídička (jedna chyba, pak vše správně)
  const tr = await evaluate(`(() => { const k = document.querySelector('#tridicka .predmet-karta');
    k.querySelector('button[data-ucel="dopr"]').click(); const chyba = k.classList.contains('chyba');
    for (const v of ZavityLekce.VECI) document.querySelector('#tridicka [data-predmet="' + v.id + '"] button[data-ucel="' + v.ucel + '"]').click();
    return [chyba, document.getElementById('tridicka-stav').textContent]; })()`);
  assert.deepEqual(tr, [true, 'Roztříděno správně: 10 z 10']);
  await evaluate(`ZavityLekce.Ukoly.kontrola()`);
  const nesplnene = await evaluate(`ZavityLekce.Ukoly.vse.filter(u => !u.hotovo).map(u => u.id)`);
  assert.deepEqual(nesplnene, [], 'nesplněné úkoly');
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /27 z 27/);
  assert.deepEqual(errors, [], 'bez chyb JS při úkolech');

  // 6) Postup přežije načtení; „Začít znovu“ ho smaže (po potvrzení).
  await nacti(600);
  assert.deepEqual(errors, [], 'bez chyb JS po načtení s postupem');
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /27 z 27/);
  assert.equal(await evaluate(`document.querySelectorAll('.predpoved.hotovo').length`), 7);
  assert.equal(await evaluate(`document.querySelectorAll('#tridicka .predmet-karta.spravne').length`), 10);
  await evaluate(`document.getElementById('zacitZnovu').click()`);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /27 z 27/, 'první klik jen žádá potvrzení');
  await evaluate(`document.getElementById('zacitZnovu').click()`);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /0 z 27/);
  assert.equal(await evaluate(`document.querySelectorAll('.predpoved.hotovo, .ukol.hotovo, #tridicka .spravne').length`), 0);

  // 7) Generátory otázek: 40× každý – jedna správná, různé texty, zdůvodnění u chybných,
  //    vysvětlení bez HTML (uloha.js ho vypisuje jako text), žádné NaN.
  const gen = await evaluate(`(() => { const chyby = [];
    for (const g of ZavityLekce.GENERATORY) for (let i = 0; i < 40; i++) {
      const q = g.gen(), texty = q.moznosti.map(m => m.t);
      const unik = new Set(texty);
      const vse = JSON.stringify(q);
      if (q.moznosti.filter(m => m.ok).length !== 1) chyby.push(g.id + ': správných ' + q.moznosti.filter(m => m.ok).length);
      if (unik.size < 3) chyby.push(g.id + ': jen ' + unik.size + ' různé možnosti');
      if (q.moznosti.some(m => !m.ok && !m.proc)) chyby.push(g.id + ': chybná bez zdůvodnění');
      if (/NaN|undefined|Infinity/.test(vse)) chyby.push(g.id + ': ' + vse.slice(0, 120));
      if (/<[a-z]/i.test(q.vysvetleni + q.napoveda + q.moznosti.map(m => (m.proc || '') + m.t).join(''))) chyby.push(g.id + ': HTML ve vysvětlení');
    }
    return { chyby: [...new Set(chyby)], pocet: ZavityLekce.GENERATORY.length }; })()`);
  assert.deepEqual(gen.chyby, []);
  vysledek.generatoru = gen.pocet;

  // 8) Procvič: chyba se vysvětlí, správná odpověď se započte napoprvé jen jednou.
  await evaluate(`localStorage.removeItem('metodus_zavity_lekce_skore'); document.querySelector('.kostra-faze [data-faze=procvic]').click()`);
  await snimek();
  const odpovez = spravne => evaluate(`(() => { const q = ZavityLekce.Procvic.otazka;
    const ok = q.moznosti.find(m => m.ok).t;
    const b = [...document.querySelectorAll('#cv-moznosti .moznosti button')].find(b => (b.textContent.slice(1) === ok) === ${spravne});
    b.click(); return document.getElementById('cv-odezva').textContent; })()`);
  assert.match(await odpovez(false), /^✗ .+Zkus jinou možnost\.$/);
  assert.match(await odpovez(true), /^✅ Správně\./);
  assert.match(await evaluate(`document.getElementById('cv-skore').textContent`), /0 z 1/);
  await evaluate(`document.querySelector('#cv-temata [data-tema=mikro]').click()`);
  for (let i = 0; i < 5; i++) { assert.equal(await evaluate(`ZavityLekce.Procvic.otazka.generator.tema`), 'mikro'); await evaluate(`document.getElementById('btnDalsi').click()`); }
  await evaluate(`document.querySelector('#cv-temata [data-tema=vse]').click()`);

  // 9) Ověř se: 8 otázek, výsledek se uloží.
  await evaluate(`localStorage.removeItem('metodus_overeni'); document.querySelector('.kostra-faze [data-faze=overse]').click()`);
  assert.ok(await cekejNa(`!!document.querySelector('.kostra-overeni')`));
  assert.equal(await evaluate(`getComputedStyle(document.getElementById('btnNapoveda')).display`), 'none');
  for (let i = 0; i < 8; i++) {
    await odpovez(i !== 2 && i !== 5);
    if (i === 2 || i === 5) await odpovez(true);
    if (await evaluate(`!!document.querySelector('.kostra-vysledek')`)) break;
    await cekejNa(`!!document.querySelector('.cviceni button.pokracovat')`, 3000);
    await evaluate(`document.querySelector('.cviceni button.pokracovat')?.click()`);
    await snimek();
  }
  assert.ok(await cekejNa(`!!document.querySelector('.kostra-vysledek')`, 4000), 'výsledek Ověř se');
  const ulozeno = await evaluate(`JSON.parse(localStorage.getItem('metodus_overeni'))['zavity_lekce.html'].at(-1)`);
  assert.equal(ulozeno.celkem, 8); assert.equal(ulozeno.spravne, 6);
  vysledek.overse = ulozeno;
  assert.deepEqual(errors, [], 'bez chyb JS v procvičování');

  // 10) Tahák: dialog kostry se sedmi kartami.
  await evaluate(`document.querySelector('.kostra-vysledek button:last-child').click(); document.querySelector('.kostra-faze [data-faze=tahak]').click()`);
  assert.ok(await evaluate(`document.querySelector('dialog.kostra-dialog').open && document.querySelectorAll('.kostra-tahak-obsah .tahak-karta').length === 7`));
  await evaluate(`document.querySelector('dialog.kostra-dialog').close()`);

  // 11) Mobil 390 a 320 px: nic nepřetéká, písmo v modelech zůstane čitelné (≥ 9 px).
  for (const w of [390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width: w, height: 844, deviceScaleFactor: 1, mobile: true });
    await nacti(800);
    const mob = await evaluate(`(() => { const t = document.querySelector('#obr-zvedak svg.model text');
      return { sirka: document.documentElement.scrollWidth, okno: innerWidth, pismo: t.getBoundingClientRect().height }; })()`);
    assert.ok(mob.sirka <= mob.okno, `přetečení ${mob.sirka} > ${mob.okno} (${w} px)`);
    assert.ok(mob.pismo >= 9, 'písmo v modelu ' + mob.pismo);
  }
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  // 12) Kontrast ve všech motivech: odečty a popisky ≥ 4,5 : 1, barvy chodů, tření a sil ≥ 3 : 1.
  const motivy = ['dark', 'light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola'];
  const barvy = ['--z-chod1', '--z-chod2', '--z-chod3', '--z-treni', '--m-sila', '--m-bremeno', '--m-rameno', '--m-draha'];
  const slabe = [];
  for (const t of motivy) {
    await evaluate(`localStorage.setItem('webapp_theme', '${t}')`);
    await nacti(500);
    const k = await evaluate(`(() => {
      const plocha = getComputedStyle(document.querySelector('#obr-samo .obr-plocha')).backgroundColor;
      const panel = getComputedStyle(document.querySelector('#obr-samo .odecty')).backgroundColor;
      const out = { odecet: __pomer(getComputedStyle(document.querySelector('#obr-samo .odecty span')).color, panel),
        popisek: __pomer(getComputedStyle(document.querySelector('#obr-samo svg.model text.t-maly')).fill, plocha) };
      for (const b of ${JSON.stringify(barvy)}) out[b] = __pomer(__var(b), plocha);
      return out; })()`);
    for (const [co, v] of Object.entries(k)) if (v < (co.startsWith('--') ? 3 : 4.5)) slabe.push(`${t}/${co} ${v.toFixed(2)}`);
  }
  await evaluate(`localStorage.removeItem('webapp_theme')`);
  assert.deepEqual(slabe, [], 'kontrast');
  vysledek.motivu = motivy.length;

  console.log('OK zavity_lekce', JSON.stringify(vysledek));
} finally {
  ws.close();
  await bcall('Target.disposeBrowserContext', { browserContextId });
  browserWs.close();
}
