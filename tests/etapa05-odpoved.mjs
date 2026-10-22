// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa05-odpoved.mjs.
// Společná reakce na odpověď (uloha.js): rušení naplánovaného posunu, živá oblast
// se zpětnou vazbou, ovládání a fokus z klávesnice, omezení pohybu.
// Test píše do izolovaného profilu prohlížeče (skóre, deník, volba tempa).
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
  Enter: { code: 'Enter', vk: 13, text: '\r' }, Tab: { code: 'Tab', vk: 9 },
  ' ': { code: 'Space', vk: 32, text: ' ' }, ArrowRight: { code: 'ArrowRight', vk: 39 }
};
const klavesa = async key => {
  const k = KLAVESY[key];
  const spolecne = { key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk };
  await call('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', ...spolecne, text: k.text });
  await call('Input.dispatchKeyEvent', { type: 'keyUp', ...spolecne });
};
// Každou otázku počítáme přes Uloha.vyber – tudy staví otázku všech 174 stránek.
const SLEDOVANI = `
  window.__pocet = 0;
  if (!window.__zahaceno) {
    window.__zahaceno = true;
    const puvodni = Uloha.vyber;
    // počítáme nové otázky a pamatujeme si správný klíč té aktuální
    Uloha.vyber = volby => { window.__pocet++; window.__spravny = volby.spravnyKlic; return puvodni(volby); };
  }
`;
const nacti = async (stranka, posun = { rezim: 'auto', tempo: 'normal' }) => {
  errors = [];
  await call('Page.addScriptToEvaluateOnNewDocument', {
    source: `try{localStorage.setItem('metodus_posun', '${JSON.stringify(posun)}')}catch(e){}`
  });
  await call('Page.navigate', { url: base + stranka });
  for (let i = 0; i < 200; i++) {
    if (await evaluate(`document.readyState==='complete' && typeof Uloha!=='undefined'`)) break;
    await new Promise(r => setTimeout(r, 50));
  }
  await evaluate(SLEDOVANI);
  // některé režimy jsou manipulace bez možností – najdeme ten s výběrem
  for (const i of [...Array(await evaluate(`document.querySelectorAll('#rezimy button').length`)).keys()]) {
    if (await evaluate(`!!document.querySelector('.moznosti button[data-klic]')`)) return;
    await evaluate(`document.querySelectorAll('#rezimy button')[${i}].click()`);
    await new Promise(r => setTimeout(r, 300));
  }
  if (!await evaluate(`!!document.querySelector('.moznosti button[data-klic]')`))
    throw new Error(stranka + ': nenašel jsem režim s výběrem možností');
};
// klikne na správnou / chybnou možnost aktuální otázky
const klikni = spravne => evaluate(`(() => {
  const b = [...document.querySelectorAll('.moznosti button')];
  const cil = ${spravne} ? b.find(x => x.dataset.klic === window.__spravny) : b.find(x => x.dataset.klic !== window.__spravny);
  cil.click(); return cil.textContent.trim().slice(0, 20);
})()`);
// nová otázka postavená přes Uloha.vyber (tudy jdou všechny kontrolované stránky)
const novaOtazka = async evaluate => {
  for (let i = 0; i < 6; i++) {
    await evaluate(`document.getElementById('btnDalsi').click()`);
    await new Promise(r => setTimeout(r, 250));
    if (await evaluate(`window.__spravny !== undefined && !!document.querySelector('.moznosti button[data-klic]')`)) return;
  }
  throw new Error('Nepodařilo se získat otázku s možnostmi');
};
try {
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Network.setBypassServiceWorker', { bypass: true });
  await call('Network.setCacheDisabled', { cacheDisabled: true });
  await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  const vysledky = {};
  const pilotni = ['obsah/m5_prumer.html', 'obsah/cj3_slovesa.html', 'obsah/m4_zlomky_uvod.html'];

  for (const stranka of pilotni) {
    // 1) Správná odpověď → právě jedna nová otázka, ani dvě, ani žádná.
    await nacti(stranka);
    await novaOtazka(evaluate);
    await evaluate(`window.__pocet = 0`);
    await klikni(true);
    assert.equal(await evaluate(`Uloha.cekaPosun()`), true, stranka + ' — po správné odpovědi je naplánovaný posun');
    await new Promise(r => setTimeout(r, 2500));
    const poAuto = await evaluate(`({ pocet: window.__pocet, ceka: Uloha.cekaPosun() })`);
    assert.equal(poAuto.pocet, 1, stranka + ' — automaticky vznikne jedna nová otázka, vzniklo ' + poAuto.pocet);
    assert.equal(poAuto.ceka, false, stranka + ' — po posunu nic nečeká');

    // 2) Přeskočení během čekání starý posun zruší (jinak vznikly dvě otázky).
    await klikni(true);
    await new Promise(r => setTimeout(r, 120));
    await evaluate(`window.__pocet = 0; document.getElementById('btnDalsi').click()`);
    await new Promise(r => setTimeout(r, 2500));
    const poPreskoceni = await evaluate(`({ pocet: window.__pocet, ceka: Uloha.cekaPosun() })`);
    assert.equal(poPreskoceni.pocet, 1, stranka + ' — přeskočení dá jednu otázku, vzniklo ' + poPreskoceni.pocet);
    assert.equal(poPreskoceni.ceka, false, stranka + ' — po přeskočení nic nečeká');

    // 3) Změna režimu během čekání ho také zruší.
    await klikni(true);
    await new Promise(r => setTimeout(r, 120));
    await evaluate(`window.__pocet = 0; [...document.querySelectorAll('#rezimy button')].find(b => !b.classList.contains('active'))?.click()`);
    await new Promise(r => setTimeout(r, 2500));
    const poRezimu = await evaluate(`({ pocet: window.__pocet, ceka: Uloha.cekaPosun() })`);
    assert.ok(poRezimu.pocet <= 1, stranka + ' — změna režimu nevyrobí druhou otázku, vzniklo ' + poRezimu.pocet);
    assert.equal(poRezimu.ceka, false, stranka + ' — po změně režimu nic nečeká');

    // 4) Zpětná vazba je živá oblast a chyba nekončí otázku.
    const odezva = await evaluate(`(() => {
      const el = document.querySelector('.odezva');
      return el ? { role: el.getAttribute('role'), live: el.getAttribute('aria-live') } : null;
    })()`);
    if (odezva) {
      assert.equal(odezva.role, 'status', stranka + ' — odezva má role="status"');
      assert.equal(odezva.live, 'polite', stranka + ' — odezva je aria-live="polite"');
    }
    assert.equal(errors.length, 0, stranka + ' — výjimka: ' + JSON.stringify(errors));
    vysledky[stranka] = { poAuto, poPreskoceni, poRezimu, odezva };
  }

  // 5) Ruční režim: místo časovače tlačítko, které drží tempo uživatele.
  await nacti('obsah/m5_prumer.html', { rezim: 'rucne', tempo: 'normal' });
  await novaOtazka(evaluate);
  await evaluate(`window.__pocet = 0`);
  await klikni(true);
  await new Promise(r => setTimeout(r, 2500));
  const rucne = await evaluate(`({
    pocet: window.__pocet, tlacitko: !!document.querySelector('button.pokracovat'),
    fokus: document.activeElement.className
  })`);
  assert.equal(rucne.pocet, 0, 'v ručním režimu stránka sama neskočí dál');
  assert.equal(rucne.tlacitko, true, 'nabídne se tlačítko Pokračovat');
  assert.match(rucne.fokus, /pokracovat/, 'fokus je na tlačítku, dá se pokračovat klávesnicí: ' + rucne.fokus);
  await klavesa('Enter');
  await new Promise(r => setTimeout(r, 400));
  const poEnteru = await evaluate(`({ pocet: window.__pocet, tlacitko: !!document.querySelector('button.pokracovat') })`);
  assert.equal(poEnteru.pocet, 1, 'Enter na tlačítku dá jednu novou otázku');
  assert.equal(poEnteru.tlacitko, false, 'staré tlačítko po pokračování zmizí');
  vysledky.rucne = { rucne, poEnteru };

  // 6) Přepnutí tempa během čekání: z automatiky na ruční se posun přepočítá.
  await nacti('obsah/m5_prumer.html');
  await novaOtazka(evaluate);
  await evaluate(`window.__pocet = 0`);
  await klikni(true);
  await new Promise(r => setTimeout(r, 120));
  await evaluate(`Uloha.nastav({ rezim: 'rucne' })`);
  await new Promise(r => setTimeout(r, 2500));
  const prepnuti = await evaluate(`({ pocet: window.__pocet, tlacitko: !!document.querySelector('button.pokracovat') })`);
  assert.equal(prepnuti.pocet, 0, 'po přepnutí na ruční režim už stránka sama neskočí');
  assert.equal(prepnuti.tlacitko, true, 'místo časovače se nabídne tlačítko');
  vysledky.prepnutiTempa = prepnuti;

  // 7) Klávesnice: chybná i správná odpověď a viditelný fokus na možnostech.
  await nacti('obsah/m5_prumer.html', { rezim: 'rucne', tempo: 'normal' });
  await novaOtazka(evaluate);
  await evaluate(`window.__pocet = 0; [...document.querySelectorAll('.moznosti button')].find(b => b.dataset.klic !== window.__spravny).focus()`);
  const fokus = await evaluate(`(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return {
      prvek: el.tagName, viditelnyFokus: el.matches(':focus-visible'),
      obrys: s.outlineWidth + ' ' + s.outlineStyle + ' ' + s.outlineColor
    };
  })()`);
  assert.equal(fokus.prvek, 'BUTTON', 'fokus je na možnosti');
  assert.equal(fokus.viditelnyFokus, true, 'možnost splňuje :focus-visible');
  assert.ok(!fokus.obrys.startsWith('0px') && !fokus.obrys.includes('none'),
    'fokus je vidět jako prstenec: ' + fokus.obrys);
  await klavesa('Enter');
  await new Promise(r => setTimeout(r, 200));
  const poChybe = await evaluate(`({
    trida: document.querySelector('.odezva')?.className || '',
    text: document.querySelector('.odezva')?.textContent.trim().slice(0, 40) || '',
    pocet: window.__pocet, moznosti: document.querySelectorAll('.moznosti button').length
  })`);
  assert.match(poChybe.trida, /chyba/, 'chybná odpověď z klávesnice dá chybovou odezvu');
  assert.equal(poChybe.pocet, 0, 'po chybě otázka běží dál');
  await evaluate(`[...document.querySelectorAll('.moznosti button')].find(b => b.dataset.klic === window.__spravny).focus()`);
  await klavesa('Enter');
  await new Promise(r => setTimeout(r, 300));
  const poSpravne = await evaluate(`({
    trida: document.querySelector('.odezva')?.className || '',
    tlacitko: !!document.querySelector('button.pokracovat')
  })`);
  assert.match(poSpravne.trida, /ok/, 'správná odpověď z klávesnice dá kladnou odezvu');
  assert.equal(poSpravne.tlacitko, true, 'a nabídne pokračování');
  vysledky.klavesnice = { fokus, poChybe, poSpravne };

  // 8) Omezení pohybu: zaklepání a přechody se vypnou.
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await nacti('obsah/m5_prumer.html');
  const pohyb = await evaluate(`(() => {
    const b = document.querySelector('.moznosti button');
    b.classList.add('trhni');
    const s = getComputedStyle(b);
    return { animace: s.animationName, prechod: s.transitionProperty };
  })()`);
  assert.equal(pohyb.animace, 'none', 'zaklepání je při omezení pohybu vypnuté: ' + pohyb.animace);
  assert.equal(pohyb.prechod, 'none', 'přechody jsou vypnuté: ' + pohyb.prechod);
  await call('Emulation.setEmulatedMedia', { features: [] });
  vysledky.omezenyPohyb = pohyb;

  // 9) Význam „Přeskočit" je popsaný stejně na všech kontrolovaných stránkách.
  for (const stranka of pilotni) {
    await nacti(stranka);
    const popis = await evaluate(`document.getElementById('btnDalsi')?.title || ''`);
    const text = await evaluate(`document.getElementById('btnDalsi')?.textContent.trim() || ''`);
    if (text.startsWith('Přeskočit')) assert.match(popis, /nezapočítá do skóre/, stranka + ' — popis přeskočení: ' + popis);
  }
  // 10) Širší vzorek stránek: společné chování nesmí nic rozbít.
  const vzorek = [
    'obsah/cj4_pady.html', 'obsah/cj7_neohebne.html', 'obsah/m8_valec.html', 'obsah/m9_prijimacky.html',
    'obsah/aj4_predlozky.html', 'obsah/prv5_statni_symboly.html', 'obsah/f8_teplo.html', 'obsah/ch9_ph.html',
    'obsah/pr7_ptaci_savci.html', 'obsah/z7_afrika.html', 'obsah/d6_pravek.html', 'obsah/inf4_hardware.html'
  ];
  const projite = [];
  for (const stranka of vzorek) {
    await nacti(stranka);
    await novaOtazka(evaluate);
    await evaluate(`window.__pocet = 0`);
    await klikni(true);
    await new Promise(r => setTimeout(r, 2600));
    const r = await evaluate(`({ pocet: window.__pocet, ceka: Uloha.cekaPosun(),
      odezva: document.querySelector('.odezva')?.getAttribute('aria-live') || null })`);
    assert.equal(r.pocet, 1, stranka + ' — jedna nová otázka, vzniklo ' + r.pocet);
    assert.equal(r.ceka, false, stranka + ' — po posunu nic nečeká');
    assert.equal(errors.length, 0, stranka + ' — výjimka: ' + JSON.stringify(errors));
    projite.push(stranka + (r.odezva ? ' (živá odezva)' : ''));
  }
  vysledky.vzorek = projite;

  console.log(JSON.stringify({ ok: true, ...vysledky }, null, 2));
} finally { ws.close(); }
