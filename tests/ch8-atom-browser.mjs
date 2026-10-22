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
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'}));`});
 await call('Page.navigate',{url:base+'obsah/ch8_atom.html'});await new Promise(r=>setTimeout(r,700));
 console.log(await evaluate(`(()=>{
 const check=(x,m)=>{if(!x)throw Error(m)};
 for(let i=0;i<MISSIONS.length;i++) {
 $('missionSelect').value=i;$('missionSelect').dispatchEvent(new Event('change'));$('missionStart').click();
 $('missionCheck').click();check($('missionStatus').textContent.includes('Ještě'),'mission wrong '+i);
 Object.assign(ST,MISSIONS[i].target);stavbaKresli();$('missionCheck').click();check($('missionStatus').textContent.includes('Splněno'),'mission '+i);
 check(!$('atomCompare').hidden,'compare');
 }
 $('clearAtom').click();check($('atomCompare').hidden,'clear');
 for(const b of document.querySelectorAll('[data-preset]')){b.click();check(document.querySelectorAll('#stavbaObraz .elektron').length===ST.e,'electrons');check(document.querySelectorAll('#stavbaObraz .proton').length===ST.z,'protons');}
 document.querySelector('[data-rezim="vznik"]').click();$('vzPause').click();check(VZ.paused,'pause');
 $('vzTime').value=8;$('vzTime').dispatchEvent(new Event('input'));check($('vzText').textContent.includes('mřížce'),'ionic end');
 document.querySelector('[data-druh="koval"]').click();$('vzTime').value=8;$('vzTime').dispatchEvent(new Event('input'));check($('vzText').textContent.includes('kovalentní'),'covalent end');
 document.querySelector('[data-druh="kov"]').click();$('vzNapeti').click();check(VZ.napeti,'voltage');$('vzOhyb').click();check(VZ.ohybCil===28,'bend');
 document.querySelector('[data-rezim="molekuly"]').click();for(let i=0;i<MOLEKULY.length;i++){document.querySelector('[data-mol="'+i+'"]').click();check(document.querySelector('.molInfo').textContent.includes(MOLEKULY[i].nazev),'molecule');}
 const orig=Uloha.vyber;window.lastOptions=null;Uloha.vyber=o=>{lastOptions=o;return orig(o)};
 for(const mode of ['castice','vazby','pojmy']){document.querySelector('[data-rezim="'+mode+'"]').click();const o=lastOptions;
 const buttons=[...document.querySelectorAll('.moznosti button')];buttons.find(b=>b.dataset.klic!==o.spravnyKlic).click();check(o.odezva.classList.contains('chyba'),'wrong quiz');buttons.find(b=>b.dataset.klic===o.spravnyKlic).click();check(o.odezva.classList.contains('ok'),'correct quiz');}
 Uloha.vyber=orig;return 'PASS: 6 missions, presets, comparison, 3 animations, molecules, quizzes';})()`));
 for(const width of [1280,390,320]) for(const theme of ['dark','light']){
 await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='${theme}'`);
 for(const mode of ['stavebnice','vznik','molekuly','castice','model','vazby','pojmy']){
 await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);
 assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'overflow '+width+' '+mode);
 }}
 await evaluate(`document.querySelector('[data-rezim="model"]').click();document.querySelector('.cast').focus()`);
 await call('Page.bringToFront');
 await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.ok(await evaluate(`document.querySelector('.odezva').textContent.length>0`),'keyboard SVG');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await evaluate(`document.querySelector('[data-rezim="vznik"]').click()`);
 assert.ok(await evaluate('VZ.paused'),'reduced motion');
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log('PASS: 7 modes at 1280/390/320, both themes, SVG keyboard, reduced motion, no JS errors');
} finally {ws.close();}
