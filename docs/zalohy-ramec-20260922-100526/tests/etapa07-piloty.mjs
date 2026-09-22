// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa06-zlomky.mjs.
// Etapa 07: čtyři vedené aktivity, původní režimy, klávesnice a mobil.
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
const click = id => evaluate(`document.getElementById('${id}').click()`);
const set = (id,value) => evaluate(`(()=>{const x=document.getElementById(${JSON.stringify(id)}); x.value=${JSON.stringify(value)};x.dispatchEvent(new Event('input',{bubbles:true}));})()`);
const message=()=>evaluate(`document.getElementById('pilotResult').textContent`);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try {
  await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
  await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'}));`});
  const results=[];
  for(const file of ['ch9_ph','aj9_neprima_rec','d6_prameny','inf6_tabulky']) {
    await call('Page.navigate',{url:base+'obsah/'+file+'.html'});await pause(450);
    assert.ok(await evaluate(`!!document.querySelector('.pilot button')`),file+' activity loads');
    for(const href of await evaluate(`[...document.querySelectorAll('a[data-lekce]')].map(x=>x.getAttribute('href'))`)) assert.ok((await fetch(base+'obsah/'+href)).ok,href);
    if(file==='ch9_ph') {
      await click('phCheck');assert.match(await message(),/Nejdřív/);
      await set('phGuess','B');await click('phCheck');assert.match(await message(),/Zkus.*100×/);
      await set('phGuess','A');await click('phCheck');assert.match(await message(),/Správně.*100×/);
      await set('phA','7');await set('phB','7');await set('phGuess','same');await click('phCheck');assert.match(await message(),/Správně.*neutrální/);
      await set('phA','14');await set('phB','0');await set('phGuess','B');await click('phCheck');assert.match(await message(),/Správně.*zásadité/);
      await click('pilotReset');assert.equal(await evaluate(`document.getElementById('phA').value`),'3');
      assert.deepEqual(await evaluate(`NEUTRALIZACE.map(x=>x.rovnice)`),['HCl + NaOH → NaCl + H₂O','H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O','HNO₃ + KOH → KNO₃ + H₂O','HCl + KOH → KCl + H₂O','H₂CO₃ + Ca(OH)₂ → CaCO₃ + 2 H₂O']);
    } else if(file==='aj9_neprima_rec') {
      await evaluate(`document.getElementById('speechNext').focus()`);await klavesa('Enter');
      assert.match(await evaluate(`document.getElementById('speechStep').textContent`),/Krok 2/);
      for(let i=0;i<4;i++)await click('speechNext');
      assert.equal(await evaluate(`document.getElementById('speechSentence').textContent`),'Anna told me (that) she would meet me there the next day.');
      await evaluate(`document.getElementById('narrator').value='anna';document.getElementById('narrator').dispatchEvent(new Event('change'))`);
      for(let i=0;i<5;i++)await click('speechNext');
      assert.equal(await evaluate(`document.getElementById('speechSentence').textContent`),'I told Ben (that) I would meet him there the next day.');
      await evaluate(`document.querySelector('[value=thu]').click()`);await click('speechCheck');assert.match(await message(),/Čtvrtek/);
      await evaluate(`document.querySelector('[value=tue]').click()`);await click('speechCheck');assert.match(await message(),/Správně/);
      await click('pilotReset');assert.match(await evaluate(`document.getElementById('speechStep').textContent`),/Krok 1/);
    } else if(file==='d6_prameny') {
      await click('historyCheck');assert.match(await message(),/Vyber/);
      await set('sourceAuthor','historian');await set('sourceDate','nov');await set('sourcePurpose','poll');
      await click('historyCheck');assert.match(await message(),/Dnešní historik/);
      await set('sourceAuthor','committee');await click('historyCheck');assert.match(await message(),/dvě události/);
      await set('sourceDate','oct');await click('historyCheck');assert.match(await message(),/Nesbírá názory/);
      await set('sourcePurpose','law');
      await evaluate(`document.querySelector('[value=all]').click()`);await set('evidence','life');await click('historyCheck');assert.match(await message(),/nedokládá souhlas/);
      await evaluate(`document.querySelector('[value=president]').click()`);await click('historyCheck');assert.match(await message(),/není jméno/);
      await evaluate(`document.querySelector('[value=state]').click()`);await set('evidence','date');await click('historyCheck');assert.match(await message(),/datum dokládá/);
      await set('evidence','life');await evaluate(`document.getElementById('historyCheck').focus()`);await klavesa('Enter');assert.match(await message(),/Správně/);
      await click('pilotReset');assert.equal(await evaluate(`document.querySelector('[name=claim]:checked')`),null);
    } else {
      const value=()=>evaluate(`document.getElementById('cellB4').textContent`);
      assert.equal(await value(),'20');await set('cellB2','17');assert.equal(await value(),'25');
      for(const [formula,want] of [['=B2+B3','25'],['=B2-B3','9'],['=B2*B3','136'],['=B2/B3','2,125'],['=PRŮMĚR(B2:B3)','12,5'],['=MIN(B2:B3)','8'],['=MAX(B2:B3)','17']]) {await set('sheetFormula',formula);assert.equal(await value(),want);}
      await set('sheetFormula','=B2/B3');await set('cellB3','0');assert.equal(await value(),'#DĚLENÍ/0!');
      for(const invalid of ['','-1','1001','1.5']) {await set('cellB2',invalid);assert.equal(await value(),'—');}
      await click('pilotReset');await set('sheetFormula','=alert(1)');assert.equal(await value(),'—');
      await click('pilotReset');await set('sheetGuess','same');await click('sheetExperiment');assert.match(await message(),/Porovnej/);
      await set('sheetGuess','five');await evaluate(`document.getElementById('sheetExperiment').focus()`);await klavesa('Enter');assert.match(await message(),/Správně/);
      await click('pilotReset');assert.equal(await value(),'20');
      await evaluate(`document.getElementById('cellB2').focus()`);await klavesa('ArrowRight');assert.equal(await value(),'20');
    }
    // Existing modes: wrong answer, correction and manual continuation.
    await evaluate(`window.oldChoice=Uloha.vyber; Uloha.vyber=o=>{window.choice=o;return oldChoice(o)};`);
    if(file==='d6_prameny') {
      const yearCheck=await evaluate(`(()=>{const pick=Uloha.nahodne, number=Uloha.nahodneCislo;Uloha.nahodne=()=> 'rozdil';Uloha.nahodneCislo=(a,b)=>a;try{letopocty();return {key:choice.spravnyKlic,text:choice.zpravaOk};}finally{Uloha.nahodne=pick;Uloha.nahodneCislo=number;}})()`);
      assert.equal(yearCheck.key,'299');assert.match(yearCheck.text,/rok nula/);
    }
    for(const mode of await evaluate(`Object.keys(REZIMY)`)) {
      await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);
      if(await evaluate(`!!document.querySelector('#plocha .moznosti')`)) {
        await evaluate(`document.querySelector('#plocha .moznosti button:not([data-klic="'+CSS.escape(String(choice.spravnyKlic))+'"])').click()`);
        assert.ok(await evaluate(`choice.odezva.classList.contains('chyba')`));
        await evaluate(`[...document.querySelectorAll('#plocha .moznosti button')].find(x=>x.dataset.klic===String(choice.spravnyKlic)).click()`);
        assert.ok(await evaluate(`choice.odezva.classList.contains('ok')`));
      }
    }
    // Expanded explanations and every practice mode at desktop/mobile widths.
    await evaluate(`document.querySelectorAll('details').forEach(x=>x.open=true)`);
    for(const width of [1366,390,320]) for(const theme of ['light','dark']) {
      await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
      await evaluate(`document.documentElement.dataset.theme='${theme}'`);
      for(const mode of await evaluate(`Object.keys(REZIMY)`)) {
        await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);await pause(50);
        const size=await evaluate(`({w:innerWidth,s:document.documentElement.scrollWidth})`);
        assert.ok(size.s<=size.w+1,`${file} ${mode} ${width} ${theme}: ${size.s}`);
      }
    }
    const {writeFile}=await import('node:fs/promises');
    const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    await writeFile('docs/etapa-07/'+file+'-320-dark.png',Buffer.from(shot.data,'base64'));
    results.push({file,activity:true,modes:4,widths:[1366,390,320],themes:2});
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log(JSON.stringify({ok:true,results},null,2));
} finally {ws.close();}
