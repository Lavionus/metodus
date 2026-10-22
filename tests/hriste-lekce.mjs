// Interaktivní výklad „Fyzikální hřiště“ (obsah/physics_playground.html).
// Spustit místní server (8766), Chromium s CDP (9223), pak:
//   node tests/hriste-lekce.mjs
// Úsporně: jedna záložka v izolovaném kontextu (vlastní localStorage).
//
// Kontroluje: načtení bez chyb, kostru (5 fází, rodina), fyziku modelů proti
// vzorcům (tření a zrychlení, nakloněná rovina, zachování energie na rampě,
// doba kmitu kyvadla, hybnost a energie při srážkách), animační smyčku,
// tažení úchopů a klávesnici, splnitelnost všech 17 úkolů a předpovědí,
// tabulku měření, uložení a obnovení postupu, „Začít znovu“, generátory
// otázek (40× každý), procvičování přes uloha.js, Ověř se s uložením výsledku,
// Tahák, mobil 390/320 px bez přetečení a kontrast barev ve všech motivech.
import assert from 'node:assert/strict';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const STRANKA = 'obsah/physics_playground.html';

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
  await cekejNa(`document.readyState === 'complete' && !!window.HristeLekce`);
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
    window.__M = id => HristeLekce.MODELY[id];
    window.__barva = s => { const m = String(s).match(/-?[\\d.]+/g) || []; let [r = 0, g = 0, b = 0, a = 1] = m.map(Number);
      if (/^color\\(srgb/.test(s)) { r *= 255; g *= 255; b *= 255; } return { r, g, b, a }; };
    window.__jas = s => { const { r, g, b } = __barva(s);
      const k = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2]; };
    window.__pomer = (a, b) => { const x = __jas(a), y = __jas(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    window.__var = n => { const e = document.createElement('span'); e.style.color = 'var(' + n + ')'; document.body.append(e); const c = getComputedStyle(e).color; e.remove(); return c; };` });

  // 1) Načtení, kostra, všechny modely vykreslené.
  await call('Page.navigate', { url: base + STRANKA });
  await cekejNa(`!!window.HristeLekce`);
  await evaluate(`localStorage.removeItem('metodus_hriste'); localStorage.removeItem('metodus_overeni')`);
  await nacti();
  assert.deepEqual(errors, [], 'bez chyb JS');
  const zaklad = await evaluate(`({
    faze: [...document.querySelectorAll('.kostra-faze button')].map(b => b.dataset.faze),
    rodina: document.querySelector('.kostra-rodina')?.textContent || '',
    modely: Object.keys(HristeLekce.MODELY),
    prazdne: [...document.querySelectorAll('svg.model')].filter(s => s.querySelectorAll('path, circle, rect').length < 8).map(s => s.closest('figure').id),
    ukolu: HristeLekce.Ukoly.vse.length,
    kapitol: document.querySelectorAll('#osnova li').length, mapa: document.querySelectorAll('#mapa a').length,
    uhel: document.querySelector('#obr-kyvadlo svg.model').textContent.includes('20°') })`);
  assert.deepEqual(zaklad.faze, ['vyuka', 'ukazka', 'procvic', 'overse', 'tahak']);
  assert.match(zaklad.rodina, /Síla, pohyb a stroje/);
  assert.deepEqual(zaklad.modely, ['vozik', 'rovina', 'rampa', 'kyvadlo', 'srazka']);
  assert.deepEqual(zaklad.prazdne, []);
  assert.equal(zaklad.ukolu, 17);
  assert.equal(zaklad.kapitol, 7); assert.equal(zaklad.mapa, 5);
  assert.ok(zaklad.uhel, 'kyvadlo je na začátku vychýlené o 20°');
  vysledek.zaklad = { modelu: zaklad.modely.length, ukolu: zaklad.ukolu };

  // 2) Fyzika modelů proti vzorcům.
  const fyz = await evaluate(`(() => { const out = {}, g = 9.81;
    // bedna: z klidu tahem 25 N, 5 kg na dřevě (f = 0,3) – za 2 s
    const V = __M('vozik'); V.reset(); V.nastav({ povrch: 'drevo', m: 5, F: 25 }); V.tahni(true); V.simuluj(2);
    out.vozik = V.s.v; V.tahni(false); V.simuluj(10); out.vozikStoji = V.s.v; V.reset();
    // tah menší než tření: bedna stojí, tření drží přesně tah
    V.nastav({ povrch: 'koberec', F: 20 }); V.tahni(true); V.simuluj(1); out.koberec = [V.s.v, V.sily().Ft]; V.reset();
    // nakloněná rovina: 30°, dřevo – rychlost na konci 4 m
    const R = __M('rovina'); R.nastav({ alfa: 30, povrch: 'drevo', m: 2 }); R.pust(); R.simuluj(5); out.rovina = [R.s.v, R.s.dojelo];
    R.nastav({ alfa: 16 }); R.pust(); R.simuluj(1); out.drzi16 = R.s.drzi && R.s.x === 0;
    R.nastav({ alfa: 12 }); R.nahoru();
    // rampa bez tření: energie se zachová, druhá strana do stejné výšky
    const U = __M('rampa'); U.nastav({ treni: 'zadne', h: 1.5, m: 1 }); U.pust(); U.simuluj(9);
    const e = U.energie(); out.rampa = [Math.abs(e.Ep + e.Ek - e.E0) / e.E0, U.s.hDruha, U.s.vmax, e.Q];
    U.nastav({ treni: 'male', h: 1.5 }); U.pust(); U.simuluj(4); const e2 = U.energie(); out.rampaTreni = [e2.Q > 0.1 * e2.E0, Math.abs(e2.Ep + e2.Ek + e2.Q - e2.E0) < 1e-9];
    U.nastav({ treni: 'zadne', h: 2 });
    // kyvadlo: doba kmitu proti vzorci (malá výchylka 5°), Měsíc, hmotnost
    const K = __M('kyvadlo'), T = (l, gg) => 2 * Math.PI * Math.sqrt(l / gg);
    K.nastav({ uhel: 5, A: { l: 1, m: 1 }, misto: 'zeme', dve: false }); K.pust(); K.simuluj(5); out.kyv1 = K.s.A.T / T(1, 9.81);
    K.nastav({ A: { l: 0.25 } }); K.pust(); K.simuluj(3); out.kyv025 = K.s.A.T / T(0.25, 9.81);
    K.nastav({ A: { l: 1 }, misto: 'mesic' }); K.pust(); K.simuluj(9); out.mesic = K.s.A.T / T(1, 1.62);
    K.nastav({ misto: 'zeme', dve: true, A: { l: 1, m: 0.2 }, B: { l: 1, m: 5 } }); K.pust(); K.simuluj(5); out.hmotnost = Math.abs(K.s.A.T - K.s.B.T);
    K.nastav({ uhel: 60, dve: false }); K.pust(); K.simuluj(5); out.velkyUhel = K.s.A.T / T(1, 9.81);
    K.nastav({ uhel: 20, dve: false, A: { l: 1, m: 1 } });
    // srážky: hybnost vždy, energie jen u pružné; stejné vozíky si vymění rychlosti
    const S = __M('srazka'); out.srazky = {};
    for (const typ of ['pruzna', 'castecna', 'nepruzna']) {
      S.nastav({ m1: 3, u1: 2, m2: 1, u2: -1, typ }); S.pust(); S.simuluj(4);
      out.srazky[typ] = [S.s.srazilo, S.s.po.p - S.s.pred.p, S.s.po.E / S.s.pred.E, S.s.po.v1, S.s.po.v2];
    }
    S.nastav({ m1: 1, u1: 2, m2: 1, u2: 0, typ: 'pruzna' }); S.pust(); S.simuluj(3); out.vymena = [S.s.po.v1, S.s.po.v2];
    S.nastav({ m1: 1, u1: 1, m2: 1, u2: 2, typ: 'pruzna' }); out.nesrazi = document.querySelector('#obr-srazka .obr-zprava').textContent;
    S.nastav({ m1: 1, u1: 2, m2: 1, u2: 0, typ: 'pruzna' });
    return out; })()`);
  const cca = (a, b, eps, co) => assert.ok(Math.abs(a - b) <= eps, `${co}: ${a} × ${b}`);
  cca(fyz.vozik, (25 - 0.3 * 5 * 9.81) / 5 * 2, 0.01, 'bedna za 2 s');
  assert.equal(fyz.vozikStoji, 0, 'tření bednu zastaví');
  assert.deepEqual(fyz.koberec, [0, 20], 'koberec drží 20 N');
  const aR = 9.81 * (Math.sin(Math.PI / 6) - 0.3 * Math.cos(Math.PI / 6));
  cca(fyz.rovina[0], Math.sqrt(2 * aR * 4), 0.01, 'rovina 30°'); assert.ok(fyz.rovina[1]);
  assert.ok(fyz.drzi16, 'při 16° dřevo drží');
  assert.ok(fyz.rampa[0] < 1e-9, 'zachování energie ' + fyz.rampa[0]);
  cca(fyz.rampa[1], 1.5, 0.005, 'výška na druhé straně');
  cca(fyz.rampa[2], Math.sqrt(2 * 9.81 * 1.5), 0.02, 'rychlost dole');
  assert.ok(fyz.rampa[3] < 1e-6, 'bez tření žádné teplo');
  assert.deepEqual(fyz.rampaTreni, [true, true]);
  cca(fyz.kyv1, 1, 0.003, 'T(1 m)'); cca(fyz.kyv025, 1, 0.003, 'T(0,25 m)'); cca(fyz.mesic, 1, 0.003, 'T na Měsíci');
  assert.ok(fyz.hmotnost < 0.002, 'hmotnost dobu kmitu nemění');
  assert.ok(fyz.velkyUhel > 1.06 && fyz.velkyUhel < 1.08, 'velká výchylka prodlouží kmit ' + fyz.velkyUhel);
  for (const [typ, [srazilo, dp, podil]] of Object.entries(fyz.srazky)) {
    assert.ok(srazilo, typ); assert.ok(Math.abs(dp) < 1e-9, 'hybnost ' + typ);
    if (typ === 'pruzna') cca(podil, 1, 1e-9, 'energie pružná'); else assert.ok(podil < 0.99, 'ztráta energie ' + typ);
  }
  cca(fyz.srazky.nepruzna[3], fyz.srazky.nepruzna[4], 1e-12, 'nepružná: společná rychlost');
  cca(fyz.srazky.nepruzna[3], 1.25, 1e-9, 'nepružná: (3·2 − 1)/4');
  assert.deepEqual(fyz.vymena.map(x => Math.round(x * 1e9) / 1e9), [0, 2], 'výměna rychlostí');
  assert.match(fyz.nesrazi, /nesrazí/);
  vysledek.fyzika = { rovina30: +fyz.rovina[0].toFixed(3), kyvadlo60: +fyz.velkyUhel.toFixed(4) };
  assert.deepEqual(errors, [], 'bez chyb JS ve fyzice');

  // 3) Animační smyčka: model viditelný na obrazovce se po stisku tlačítka opravdu hýbe.
  await evaluate(`__M('vozik').reset(); __M('vozik').nastav({ povrch: 'drevo', m: 5, F: 25 }); document.getElementById('obr-vozik').scrollIntoView({ block: 'center' }); document.getElementById('voz-tahni').click()`);
  await cekej(900);
  const beh = await evaluate(`[__M('vozik').s.v, __M('vozik').s.t, document.getElementById('voz-tahni').textContent]`);
  assert.ok(beh[0] > 0.3 && beh[1] > 0.4, 'bedna se rozjela ' + beh);
  assert.match(beh[2], /Pustit provaz/);
  await evaluate(`document.getElementById('voz-reset').click()`);

  // 4) Tažení úchopů a klávesnice: sklon roviny a závaží kyvadla.
  const tahni = (fig, i, x, y) => evaluate(`(() => {
    const svg = document.querySelector('#${fig} svg.model'), u = svg.querySelectorAll('.uchop')[${i}];
    u.scrollIntoView({ block: 'center' });
    const m = svg.getScreenCTM(), cil = new DOMPoint(${x}, ${y}).matrixTransform(m);
    const r = u.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    const ev = (typ, x, y) => u.dispatchEvent(new PointerEvent(typ, { bubbles: true, clientX: x, clientY: y, pointerId: 7, button: 0, isPrimary: true }));
    ev('pointerdown', x0, y0);
    for (let i = 1; i <= 6; i++) ev('pointermove', x0 + (cil.x - x0) * i / 6, y0 + (cil.y - y0) * i / 6);
    ev('pointerup', cil.x, cil.y); })()`);
  await tahni('obr-rovina', 0, 70 + 400 * Math.cos(Math.PI / 6), 420 - 400 * Math.sin(Math.PI / 6));
  await snimek();
  assert.equal(await evaluate(`__M('rovina').s.alfa`), 30, 'tažení sklonu');
  assert.equal(await evaluate(`document.getElementById('rov-sklon').value`), '30', 'posuvník sleduje úchop');
  await evaluate(`document.querySelector('#obr-rovina .uchop').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))`);
  await snimek();
  assert.equal(await evaluate(`__M('rovina').s.alfa`), 31);
  await evaluate(`__M('rovina').nastav({ alfa: 12 })`);
  // závaží kyvadla: 1,5 m pod závěsem vlevo pod úhlem 30°
  await tahni('obr-kyvadlo', 0, 450 - 1.5 * 170 * Math.sin(Math.PI / 6), 58 + 1.5 * 170 * Math.cos(Math.PI / 6));
  await snimek();
  assert.deepEqual(await evaluate(`[__M('kyvadlo').s.A.l, __M('kyvadlo').s.uhel, __M('kyvadlo').s.strana, document.getElementById('kyv-delka').value]`), [1.5, 30, -1, '1.5']);
  await evaluate(`__M('kyvadlo').nastav({ A: { l: 1 }, uhel: 20, strana: 1 })`);
  // kulička na rampě: tažením na výšku 1 m (x = −2 m)
  await tahni('obr-rampa', 0, 330 - 2 * 95, 345 - 1 * 95);
  await snimek();
  assert.ok(Math.abs(await evaluate(`__M('rampa').h0()`) - 1) < 0.02, 'tažení kuličky');
  assert.equal(await evaluate(`document.getElementById('ram-vyska').value`), '1');

  // 5) Všechny úkoly a předpovědi jdou splnit.
  const tip = (idP, i) => `document.querySelectorAll('[data-predpoved="${idP}"] .volby button')[${i}].click()`;
  const kroky = [
    tip('voz-led', 1), `(() => { const V = __M('vozik'); V.reset(); V.nastav({ povrch: 'led', m: 5, F: 20 }); V.tahni(true); V.simuluj(1); V.tahni(false); V.simuluj(2.5); })()`,
    `(() => { const V = __M('vozik'); V.reset(); V.nastav({ povrch: 'koberec', m: 5, F: 29.5 }); V.tahni(true); V.simuluj(0.5); })()`,
    `(() => { const V = __M('vozik'); V.reset(); V.nastav({ povrch: 'drevo', m: 5, F: 25 }); V.tahni(true); V.simuluj(1); __zmena('#voz-sila', 14.5); V.simuluj(2); V.tahni(false); })()`,
    tip('rov-tezsi', 1), `(() => { const R = __M('rovina'); R.nastav({ povrch: 'drevo', m: 4, alfa: 17 }); R.pust(); R.simuluj(2); })()`,
    `__M('rovina').nastav({ alfa: 45, rozklad: true })`,
    `(() => { const R = __M('rovina'); R.nastav({ povrch: 'guma', alfa: 38, mez: false }); R.pust(); R.simuluj(2); if (R.s.rozjel && R.s.x > 0.02 && R.s.alfa === 38) throw new Error('38° nemá jet'); R.nastav({ alfa: 39 }); R.pust(); R.simuluj(2); })()`,
    tip('ram-vyska', 1), `(() => { const U = __M('rampa'); U.nastav({ treni: 'zadne', h: 2 }); U.pust(); U.simuluj(3); })()`,
    `(() => { const U = __M('rampa'); U.nastav({ treni: 'zadne', h: 1.9 }); U.pust(); U.simuluj(2); })()`,
    `(() => { const U = __M('rampa'); U.nastav({ treni: 'velke', h: 2 }); U.pust(); U.simuluj(15); })()`,
    tip('kyv-delka', 0), `(() => { const K = __M('kyvadlo'); K.nastav({ misto: 'zeme', dve: false, A: { l: 2 } }); K.pust(); K.simuluj(5); })()`,
    `(() => { const K = __M('kyvadlo'); for (const l of [0.5, 1, 1.5]) { K.nastav({ A: { l } }); K.pust(); K.simuluj(4); document.getElementById('kyv-zapsat').click(); } })()`,
    `(() => { const K = __M('kyvadlo'); K.nastav({ A: { l: 1 } }); K.pust(); K.simuluj(4); })()`,
    `(() => { const K = __M('kyvadlo'); K.nastav({ misto: 'mesic' }); K.pust(); K.simuluj(8); })()`,
    tip('kyv-hmotnost', 2), `(() => { const K = __M('kyvadlo'); K.nastav({ misto: 'zeme', dve: true, A: { l: 1, m: 1 }, B: { l: 1, m: 4 } }); K.pust(); K.simuluj(4); })()`,
    tip('sr-stejne', 1), `(() => { document.querySelector('[data-sr-preset=kulecnik]').click(); __M('srazka').simuluj(3); })()`,
    tip('sr-lehky', 0), `(() => { document.querySelector('[data-sr-preset=lehky]').click(); __M('srazka').simuluj(3); })()`,
    `(() => { const S = __M('srazka'); S.nastav({ m1: 2, u1: 1.5, m2: 1, u2: -3, typ: 'nepruzna' }); S.pust(); S.simuluj(3); })()`,
  ];
  for (const k of kroky) { await evaluate(k); await snimek(); }
  await snimek();
  const stav = await evaluate(`HristeLekce.Ukoly.vse.filter(u => !u.hotovo).map(u => u.id)`);
  assert.deepEqual(stav, [], 'nesplněné úkoly');
  assert.deepEqual(errors, [], 'bez chyb JS při úkolech');
  const pred = await evaluate(`(() => { const p = document.querySelector('[data-predpoved="sr-lehky"]');
    return { verdikt: p.querySelector('.verdikt').textContent, vys: p.querySelector('.vysledek').textContent.length, stav: p.querySelector('.stav').textContent }; })()`);
  assert.match(pred.verdikt, /jiného/); assert.ok(pred.vys > 150); assert.match(pred.stav, /Hotovo/);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /17 z 17/);
  assert.equal(await evaluate(`document.querySelectorAll('#osnova li.hotovo').length`), 5);
  const tab = await evaluate(`[document.querySelectorAll('#kyv-tabulka tbody tr').length, document.getElementById('kyv-tabulka-prazdna').hidden, document.querySelectorAll('#obr-kyv-graf circle.bod-mereni').length]`);
  assert.deepEqual(tab, [3, true, 3], 'tabulka a graf měření');
  // řešený příklad nastaví model a pustí ho
  await evaluate(`document.getElementById('ram-priklad-model').click()`);
  assert.ok(await cekejNa(`__M('rampa').s.bezi && Math.abs(__M('rampa').h0() - 1.8) < 1e-9 && __M('rampa').s.m === 0.5`, 3000), 'příklad v modelu');
  await cekej(1200);
  assert.ok(await evaluate(`__M('rampa').s.vmax > 5.9 && __M('rampa').s.vmax < 5.95`), 'příklad: 5,9 m/s');

  // 6) Postup i tabulka přežijí načtení; „Začít znovu“ je smaže (po potvrzení).
  await nacti(600);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /17 z 17/);
  assert.equal(await evaluate(`document.querySelectorAll('.predpoved.hotovo').length`), 7);
  assert.equal(await evaluate(`document.querySelectorAll('#kyv-tabulka tbody tr').length`), 3);
  assert.match(await evaluate(`document.querySelector('[data-predpoved="voz-led"] .verdikt').textContent`), /potvrdila/);
  await evaluate(`document.getElementById('zacitZnovu').click()`);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /17 z 17/, 'první klik jen žádá potvrzení');
  await evaluate(`document.getElementById('zacitZnovu').click()`);
  assert.match(await evaluate(`document.getElementById('pokrokText').textContent`), /0 z 17/);
  assert.equal(await evaluate(`document.querySelectorAll('.predpoved.hotovo, .ukol.hotovo').length`), 0);
  assert.equal(await evaluate(`document.querySelectorAll('#kyv-tabulka tbody tr').length`), 0, 'tabulka smazána');

  // 7) Generátory otázek: 40× každý – jedna správná, různé texty, zdůvodnění u chybných,
  //    vysvětlení bez HTML (uloha.js ho vypisuje jako text), žádné NaN.
  const gen = await evaluate(`(() => { const chyby = [];
    for (const g of HristeLekce.GENERATORY) for (let i = 0; i < 40; i++) {
      const q = g.gen(), texty = q.moznosti.map(m => m.t);
      const unik = new Set(texty);
      const vse = JSON.stringify(q);
      if (q.moznosti.filter(m => m.ok).length !== 1) chyby.push(g.id + ': správných ' + q.moznosti.filter(m => m.ok).length);
      if (unik.size < 3) chyby.push(g.id + ': jen ' + unik.size + ' různé možnosti');
      if (q.moznosti.some(m => !m.ok && !m.proc)) chyby.push(g.id + ': chybná bez zdůvodnění');
      if (/NaN|undefined|Infinity/.test(vse)) chyby.push(g.id + ': ' + vse.slice(0, 120));
      if (/<[a-z]/i.test(q.vysvetleni + q.napoveda + q.moznosti.map(m => (m.proc || '') + m.t).join(''))) chyby.push(g.id + ': HTML ve vysvětlení');
    }
    return { chyby: [...new Set(chyby)], pocet: HristeLekce.GENERATORY.length }; })()`);
  assert.deepEqual(gen.chyby, []);
  vysledek.generatoru = gen.pocet;

  // 8) Procvič: chyba se zatřese a vysvětlí, správná odpověď se započte napoprvé jen jednou.
  await evaluate(`localStorage.removeItem('metodus_hriste_skore'); document.querySelector('.kostra-faze [data-faze=procvic]').click()`);
  await snimek();
  const odpovez = spravne => evaluate(`(() => { const q = HristeLekce.Procvic.otazka;
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
  await evaluate(`document.querySelector('#cv-moznosti .moznosti button').focus(); document.querySelector('.cviceni').dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }))`);
  assert.ok(await evaluate(`/✅|✗/.test(document.getElementById('cv-odezva').textContent)`), 'klávesa 1');
  await evaluate(`document.querySelector('#cv-temata [data-tema=kyvadlo]').click()`);
  for (let i = 0; i < 5; i++) { assert.equal(await evaluate(`HristeLekce.Procvic.otazka.generator.tema`), 'kyvadlo'); await evaluate(`document.getElementById('btnDalsi').click()`); }
  await evaluate(`document.querySelector('#cv-temata [data-tema=vse]').click()`);

  // 9) Ověř se: 8 otázek bez nápovědy a výkladu, výsledek se uloží.
  await evaluate(`localStorage.removeItem('metodus_overeni'); document.querySelector('.kostra-faze [data-faze=overse]').click()`);
  assert.ok(await cekejNa(`!!document.querySelector('.kostra-overeni')`));
  const skryte = await evaluate(`[getComputedStyle(document.getElementById('btnNapoveda')).display, getComputedStyle(document.getElementById('energie')).display]`);
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
  const ulozeno = await evaluate(`JSON.parse(localStorage.getItem('metodus_overeni'))['physics_playground.html'].at(-1)`);
  assert.equal(ulozeno.celkem, 8); assert.equal(ulozeno.spravne, 6);
  vysledek.overse = ulozeno;
  assert.deepEqual(errors, [], 'bez chyb JS v procvičování');

  // 10) Tahák: dialog kostry se šesti kartami.
  await evaluate(`document.querySelector('.kostra-vysledek button:last-child').click(); document.querySelector('.kostra-faze [data-faze=tahak]').click()`);
  assert.ok(await evaluate(`document.querySelector('dialog.kostra-dialog').open && document.querySelectorAll('.kostra-tahak-obsah .tahak-karta').length === 6`));
  await evaluate(`document.querySelector('dialog.kostra-dialog').close()`);

  // 11) Mobil 390 a 320 px: nic nepřetéká, písmo v modelech zůstane čitelné (≥ 10 px).
  for (const w of [390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width: w, height: 844, deviceScaleFactor: 1, mobile: true });
    await nacti(800);
    const mob = await evaluate(`(() => { const t = document.querySelector('#obr-vozik svg.model text');
      return { sirka: document.documentElement.scrollWidth, okno: innerWidth, pismo: t.getBoundingClientRect().height }; })()`);
    assert.ok(mob.sirka <= mob.okno, `přetečení ${mob.sirka} > ${mob.okno} (${w} px)`);
    assert.ok(mob.pismo >= 10, 'písmo v modelu ' + mob.pismo);
  }
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  // 12) Kontrast ve všech motivech: odečty a popisky v modelu ≥ 4,5 : 1, barvy sil a energií ≥ 3 : 1.
  const motivy = ['dark', 'light', 'kontrast', 'sepia', 'sepia-tmava', 'knihovna', 'skola', 'nocni-skola'];
  const barvy = ['--h-tiha', '--h-slozka', '--h-podlozka', '--h-treni', '--h-tah', '--h-rychlost', '--h-hybnost', '--h-ep', '--h-ek', '--h-teplo', '--h-celkem', '--h-a', '--h-b'];
  const slabe = [];
  for (const t of motivy) {
    await evaluate(`localStorage.setItem('webapp_theme', '${t}')`);
    await nacti(500);
    const k = await evaluate(`(() => {
      const plocha = getComputedStyle(document.querySelector('#obr-rampa .obr-plocha')).backgroundColor;
      const panel = getComputedStyle(document.querySelector('#obr-rampa .odecty')).backgroundColor;
      const out = { odecet: __pomer(getComputedStyle(document.querySelector('#obr-rampa .odecty span')).color, panel),
        popisek: __pomer(getComputedStyle(document.querySelector('#obr-rampa svg.model text.t-maly')).fill, plocha) };
      for (const b of ${JSON.stringify(barvy)}) out[b] = __pomer(__var(b), plocha);
      return out; })()`);
    for (const [co, v] of Object.entries(k)) if (v < (co.startsWith('--') ? 3 : 4.5)) slabe.push(`${t}/${co} ${v.toFixed(2)}`);
  }
  await evaluate(`localStorage.removeItem('webapp_theme')`);
  assert.deepEqual(slabe, [], 'kontrast');
  vysledek.motivu = motivy.length;

  console.log('OK physics_playground', JSON.stringify(vysledek));
} finally {
  ws.close();
  await bcall('Target.disposeBrowserContext', { browserContextId });
  browserWs.close();
}
