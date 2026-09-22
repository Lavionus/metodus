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
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const nav=async file=>{await call('Page.navigate',{url:base+'obsah/'+file});await pause(400);};
const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
try {
 await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
 await call('Network.setBypassServiceWorker',{bypass:true});await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'}));`});
 await nav('prehled.html');
 const meta=await evaluate(`Object.entries(KATALOG_VYUKA)`);assert.equal(meta.length,5);
 for(const [file,m] of meta){assert.ok(m.cil&&m.typy.length&&m.rozsah==='pilot');for(const link of [file,...m.predchozi,...m.dalsi])assert.ok((await fetch(base+link)).ok,link);}
 for(const file of ['prehled.html','osnova.html','ucitel.html']){
  await nav(file);assert.equal(await evaluate(`document.querySelectorAll('#vysledkyUcelu .lekce').length`),5);
  for(const [purpose,n] of [['model',3],['badani',1],['procvicovani',5],['vyklad',5]]){
   await evaluate(`document.getElementById('ucel').value='${purpose}';document.getElementById('ucel').dispatchEvent(new Event('change'))`);
   assert.equal(await evaluate(`document.querySelectorAll('#vysledkyUcelu .lekce').length`),n);
  }
  await evaluate(`document.getElementById('ucel').value='hodina';document.getElementById('ucel').dispatchEvent(new Event('change'))`);
  assert.equal(await evaluate(`document.querySelector('#vysledkyUcelu a').getAttribute('href')`),'priprava_hodiny.html');
  if(file==='osnova.html')assert.match(await evaluate(`document.getElementById('souhrn').textContent`),/neznamená úplné pokrytí/);
 }
 // Purpose link opens actual practice, not the default guided example.
 await nav('prehled.html');
 await evaluate(`document.getElementById('ucel').value='procvicovani';document.getElementById('ucel').dispatchEvent(new Event('change'))`);
 await click('a[href*="m4_zlomky_uvod.html?"]');await pause(300);
 assert.equal(await evaluate(`document.querySelector('#rezimy .active').dataset.rezim`),'prectiZlomek');
 // Preserve old data; count every attempt, including abandoned questions and support.
 await nav('ch9_ph.html');
 await evaluate(`localStorage.removeItem('metodus_prubeh_v2');localStorage.setItem('metodus_aktivita',JSON.stringify({'2026-01-01':{'ch9_ph.html':{ok:3,pokusy:5}}}));window.pick=Uloha.vyber;Uloha.vyber=o=>{window.choice=o;return pick(o)};novaUloha();`);
 const answer=async correct=>evaluate(`[...document.querySelectorAll('#plocha .moznosti button')].find(b=>(b.dataset.klic===String(choice.spravnyKlic))===${correct}).click()`);
 await answer(false);await answer(false);await answer(true);await answer(true);
 await click('#btnDalsi');await click('.prubeh-podpora input');await answer(true);
 await click('#btnDalsi');await answer(false);await click('#btnDalsi');
 let data=await evaluate(`Object.values(Prubeh.read()).flatMap(x=>Object.values(x))[0]`);
 assert.deepEqual(data,{zahajene:3,odpovedi:5,dokoncene:2,napoprve:1,sPodporou:1});
 await nav('ch9_ph.html');
 assert.deepEqual(await evaluate(`Object.values(Prubeh.read()).flatMap(x=>Object.values(x))[0]`),data);
 // Keyboard changes the explicit support marker; it does not answer a question.
 await evaluate(`document.querySelector('.prubeh-podpora input').focus()`);await klavesa(' ');
 assert.ok(await evaluate(`document.querySelector('.prubeh-podpora input').checked`));
 await nav('edu_progress.html');
 assert.match(await evaluate(`document.getElementById('podrobnyPrubeh').textContent`),/Odeslané odpovědi.*5.*Dokončené: 2.*napoprvé: 1.*podporou: 1/);
 assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('metodus_aktivita'))['2026-01-01']['ch9_ph.html']`),{ok:3,pokusy:5});
 assert.match(await evaluate(`document.body.textContent`),/Není známkou/);
 // A lesson with non-choice modes remains explicitly outside detailed coverage.
 await nav('m4_zlomky_uvod.html');await click('[data-rezim=prectiZlomek]');assert.ok(await evaluate(`!!document.querySelector('.prubeh-podpora input')`));
 // Full teacher route: actual board activity, worksheet print view, exit question.
 await nav('priprava_hodiny.html');await click('a[href*="tabule=1"]');await pause(300);
 assert.ok(await evaluate(`document.body.classList.contains('pilot-tabule')`));
 assert.equal(await evaluate(`getComputedStyle(document.getElementById('plocha')).display`),'none');
 await evaluate(`document.getElementById('phGuess').value='A'`);await click('#phCheck');assert.match(await evaluate(`document.getElementById('pilotResult').textContent`),/Správně/);
 await click('.pilot > a');await pause(300);await click('a[href*="lekce=ch9_ph"]');await pause(300);
 assert.ok(await evaluate(`!!document.getElementById('listPilot')`));
 await call('Emulation.setEmulatedMedia',{media:'print'});
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.app')).display`),'none');
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('#listPilot .noprint')).display`),'none');
 assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#listPilot h1')).display`),'none');
 const pdf=await call('Page.printToPDF',{printBackground:true});
 const {writeFile}=await import('node:fs/promises');await writeFile('docs/etapa-08/pracovni-list-ph.pdf',Buffer.from(pdf.data,'base64'));
 await call('Emulation.setEmulatedMedia',{media:''});
 await click('a[href="priprava_hodiny.html#zaver"]');await pause(300);assert.equal(await evaluate(`location.hash`),'#zaver');
 const pages=['prehled.html','osnova.html','ucitel.html','edu_progress.html','priprava_hodiny.html','pracovni_listy.html?lekce=ch9_ph','ch9_ph.html?tabule=1'];
 for(const file of pages){
  await nav(file);
  for(const width of [1366,390,320])for(const theme of ['light','dark']){
   await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
   await evaluate(`document.documentElement.dataset.theme='${theme}'`);await pause(80);
   const size=await evaluate(`({w:innerWidth,s:document.documentElement.scrollWidth})`);assert.ok(size.s<=size.w+1,`${file} ${width} ${theme}: ${size.s}`);
  }
  if(file==='edu_progress.html'||file==='pracovni_listy.html?lekce=ch9_ph'){
   const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile('docs/etapa-08/'+(file.startsWith('edu')?'denik':'list')+'-320.png',Buffer.from(shot.data,'base64'));
  }
 }
 await nav('edu_progress.html');await click('#resetBtn');assert.deepEqual(await evaluate(`Prubeh.read()`),{});assert.match(await evaluate(`document.getElementById('podrobnyPrubeh').textContent`),/Zatím nejsou/);
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log(JSON.stringify({ok:true,pilots:5,purposeFilters:5,telemetry:data,legacyPreserved:true,teacherFlow:true,print:true,pages,widths:[1366,390,320],themes:2},null,2));
}finally{ws.close();}
