// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa01-browser.mjs.
// Test používá izolovaný profil prohlížeče: zapisuje procvičovací skóre a ruční tempo.
import assert from 'node:assert/strict';
const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(x => x.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
const pending = new Map(); let id = 0; const errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id; const timer = setTimeout(() => { pending.delete(n); reject(new Error('CDP timeout: ' + method)); }, 15000);
  pending.set(n, m => { clearTimeout(timer); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async expression => {
  const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
try {
 await call('Runtime.enable');await call('Page.enable');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'}));`});
 await call('Page.navigate',{url:base+'obsah/ch8_smesi.html'});await new Promise(r=>setTimeout(r,600));
 console.log(await evaluate(`(()=>{
 const check=(x,m)=>{if(!x)throw Error(m)};
 document.querySelector('[data-rezim="castice"]').click();
 for(let i=0;i<MIX_VIEWS.length;i++){
 document.querySelector('[data-mix="'+i+'"]').click();check(document.querySelector('.lab-scene'),'scene');
 if($('mixSettle')){$('mixSettle').click();check($('mixStatus').textContent.length>0,'settling');$('mixShake').click();}
 }
 $('mixPause').click();check(document.querySelector('.lab-scene').classList.contains('paused'),'pause');$('mixPause').click();
 document.querySelector('[data-rezim="laborator"]').click();
 for(let stage=0;stage<3;stage++){
 document.querySelector('[data-action="3"]').click();check(labStage===stage&&$('labStatus').textContent.includes('Magnet'),'wrong action');
 document.querySelector('[data-action="'+stage+'"]').click();check(labStage===stage+1,'step');
 }
 check($('labStatus').textContent.includes('Získali'),'completion');$('labReset').click();check(labStage===0,'reset');
 document.querySelector('[data-rezim="roztok"]').click();$('solutionCheck').click();check($('solutionFeedback').textContent.includes('Správně'),'10 percent');
 $('dilute').click();check(solutionWater===230&&solutionSalt===20,'dilution');check($('solutionNumber').textContent==='8 %','8 percent');
 $('solutionCheck').click();check($('solutionFeedback').textContent.includes('Ještě'),'wrong solution');
 $('saltMass').value=0;$('saltMass').dispatchEvent(new Event('input'));check($('solutionMath').textContent.includes('čistou vodu'),'pure water');
 const orig=Uloha.vyber,pick=Uloha.nahodne;let last;Uloha.vyber=o=>{last=o;return orig(o)};
 let count=0;
 for(const [data,mode] of [[SMESI,'metoda'],[PRIKLADY,'druh'],[POJMY,'pojmy']]) for(const item of data){
 Uloha.nahodne=a=>a===data?item:pick(a);rezim=mode;novaUloha();
 const opts=[...document.querySelectorAll('.moznosti button')];check(new Set(last.moznosti.map(x=>x.klic)).size===4,'unique');
 opts.find(b=>b.dataset.klic!==last.spravnyKlic).click();check(last.odezva.classList.contains('chyba'),'wrong quiz');
 opts.find(b=>b.dataset.klic===last.spravnyKlic).click();check(last.odezva.classList.contains('ok'),'correct quiz');count++;
 }
 Uloha.nahodne=pick;
 for(let i=0;i<30;i++){rezim='zlomek';novaUloha();check(new Set(last.moznosti.map(x=>x.klic)).size===4,'fraction choices');document.querySelector('[data-klic="'+last.spravnyKlic+'"]').click();check(last.odezva.classList.contains('ok'),'fraction');count++;}
 Uloha.vyber=orig;return {quizQuestions:count,mixtureViews:6,labSteps:3};})()`));
 for(const width of [1280,390,320])for(const theme of ['dark','light']){
 await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='${theme}'`);
 for(const mode of ['aparatury','mise','castice','laborator','roztok','metoda','druh','zlomek','pojmy']){
 await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);
 assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'overflow '+width+' '+mode);
 }}
 await evaluate(`document.querySelector('[data-rezim="castice"]').click();document.querySelector('[data-mix="0"]').click();$('mixPause').focus()`);
 await call('Page.bringToFront');
 await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await call('Input.dispatchKeyEvent',{type:'char',text:'\r',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.ok(await evaluate('mixPaused'),'keyboard pause');
 await evaluate(`$('mixPause').click()`);
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.particle')).animationPlayState`),'running');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert.equal(await evaluate(`getComputedStyle(document.querySelector('.particle')).animationName`),'none');
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log('PASS: 9 modes, 1280/390/320 px, both themes, keyboard, animations and reduced motion, zero runtime errors');
} finally {ws.close();}
