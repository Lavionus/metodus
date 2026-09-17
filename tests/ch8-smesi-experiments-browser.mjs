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
 await call('Page.navigate',{url:base+'obsah/ch8_smesi.html'});await new Promise(r=>setTimeout(r,500));
 console.log(await evaluate(`(()=>{const check=(x,m)=>{if(!x)throw Error(m)};
 for(let i=0;i<APPARATUS.length;i++){
 document.querySelector('[data-apparatus="'+i+'"]').click();
 for(const t of [0,50,100]){$('apparatusTime').value=t;$('apparatusTime').dispatchEvent(new Event('input'));check(apparatusProgress===t,'seek');check($('apparatusScene').querySelector('svg'),'diagram');}
 document.querySelector('[data-prediction="0"]').click();check($('predictionFeedback').textContent.includes('✗'),'prediction wrong');
 document.querySelector('[data-prediction="'+APPARATUS[i].correct+'"]').click();check($('predictionFeedback').textContent.includes('✓'),'prediction correct');
 document.querySelector('[data-part="0"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));check($('apparatusDetail').textContent===APPARATUS[i].parts[0][1],'hotspot');
 $('apparatusReset').click();check(apparatusProgress===0,'reset');
 }
 document.querySelector('[data-rezim="mise"]').click();
 for(let i=0;i<MISSION_DATA.length;i++){
 document.querySelector('[data-mission="'+i+'"]').click();
 const m=MISSION_DATA[i];
 const wrong=Object.keys(MISSION_ACTIONS).find(x=>x!==m.steps[0]);document.querySelector('[data-operation="'+wrong+'"]').click();check(missionStep===0&&$('missionResponse').textContent.startsWith('✗'),'mission wrong');
 for(const step of m.steps)document.querySelector('[data-operation="'+step+'"]').click();
 check(missionStep===m.steps.length&&document.querySelector('.success-panel'),'mission completion');
 $('missionUndo').click();check(missionStep===m.steps.length-1,'undo');document.querySelector('[data-operation="'+m.steps.at(-1)+'"]').click();
 }
 check(missionDone.size===4,'mission count');
 document.querySelector('[data-rezim="roztok"]').click();
 check($('satResult').textContent.includes('20 g'),'initial solid');
 $('satHeat').click();check($('satResult').textContent.includes('Nenasycený'),'heat dissolves');
 $('satCool').click();check($('satResult').textContent.includes('Nasycený roztok + pevná'),'cool crystallizes');
 for(const temp of [20,40,60])for(const mass of [0,30,60,90]){
 $('satTemp').value=temp;$('satMass').value=mass;$('satMass').dispatchEvent(new Event('input'));
 const nums=[...$('satResult').querySelectorAll('strong')].slice(0,3).map(x=>parseFloat(x.textContent.replace(',','.')));check(Math.abs(nums[0]+nums[1]-mass)<.01,'mass conservation');check(nums[0]<=nums[2],'solubility limit');
 }
 return {apparatus:7,missions:4,saturationStates:12};})()`));
 for(const width of [1280,390,320])for(const theme of ['dark','light']){
 await call('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:false});await evaluate(`document.documentElement.dataset.theme='${theme}'`);
 for(const mode of ['aparatury','mise','roztok']){
 await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);
 assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'overflow '+width+mode);
 assert.equal(await evaluate("getComputedStyle(document.querySelector('.ovladani')).display"),'none','quiz controls hidden');
 if(mode==='aparatury')for(let index=0;index<7;index++){await evaluate(`document.querySelector('[data-apparatus="${index}"]').click()`);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'apparatus overflow '+index);}
 }}
 await evaluate(`document.querySelector('[data-rezim="aparatury"]').click();$('apparatusReset').click();$('apparatusPlay').click()`);
 const before=await evaluate('apparatusProgress');await new Promise(r=>setTimeout(r,250));assert.ok(await evaluate('apparatusProgress')>before,'animation advances');
 await evaluate(`$('apparatusPlay').click()`);const paused=await evaluate('apparatusProgress');await new Promise(r=>setTimeout(r,150));assert.equal(await evaluate('apparatusProgress'),paused,'pause');
 await evaluate(`document.querySelector('[data-part="1"]').focus()`);await call('Page.bringToFront');
 await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal(await evaluate(`$('apparatusDetail').textContent`),await evaluate('APPARATUS[apparatusIndex].parts[1][1]'),'keyboard hotspot');
 await evaluate(`$('apparatusPlay').click();document.querySelector('[data-rezim="mise"]').click()`);assert.equal(await evaluate('apparatusFrame'),null,'mode cleanup');
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: diagrams, predictions, missions, undo, mass conservation, keyboard, live animation, mobile, both themes');
}finally{ws.close();}
