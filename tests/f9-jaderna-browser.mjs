// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/f9-jaderna-browser.mjs.
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
 await call('Runtime.enable'); await call('Page.enable');await call('Runtime.discardConsoleEntries');errors.length=0;
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'}));`});
 await call('Page.navigate',{url:base+'obsah/f9_jaderna.html'});await new Promise(r=>setTimeout(r,500));
 console.log(await evaluate(`(()=>{
 const check=(x,m)=>{if(!x)throw Error(m)}, mode=id=>document.querySelector('[data-rezim="'+id+'"]').click();
 check($('dejObraz'),'initial page');
 for(let i=0;i<4;i++){document.querySelector('[data-krok="'+i+'"]').click();check($('dejText').textContent.includes(DEJ[i][0]),'fission '+i);}
 document.querySelector('[data-n="235"]').click();check($('bilanceText').textContent.includes('Připočti'),'wrong balance');
 document.querySelector('[data-n="236"]').click();check($('bilanceText').textContent.includes('Správně'),'balance');
 mode('retezovka');$('rrPause').click();check(RR.paused,'pause');$('btnNeutron').click();const t=RR.cas;$('rrStep').click();check(Math.abs(RR.cas-t-.1)<1e-6,'step');
 $('posTyce').value=90;$('posTyce').dispatchEvent(new Event('input'));check(RR.tyce.length===5&&Math.abs(RR.tyce[0].h-201.6)<.01,'rods insertion');
 $('chkReflektor').click();const reflector=RR.reflektor;mode('dej');mode('retezovka');check($('chkReflektor').checked===reflector,'reflector restored');
 for(const b of document.querySelectorAll('[data-scenar]')) {b.click();check(RR.neutrony.length===4,'scenario');}
 $('btnResetRR').click();check(RR.neutrony.length===0&&RR.stepeni===0,'chain reset');
 RR.pohlceni=50;RR.tyce=rrTyce();const rod=RR.tyce[0];check(rrInsideRod(rod.x+rod.w/2,rod.y+rod.h-1),'rod captures inside');check(!rrInsideRod(rod.x+rod.w/2,rod.y+rod.h+1),'no invisible rod below tip');
 const saveRandom=Math.random;Math.random=()=>0;RR.jadra=[];RR.neutrony=[{x:rod.x+rod.w/2,y:rod.y+rod.h/2,vx:0,vy:0,trail:[]}];rrKrok(.01);check(RR.pohlceno===1&&RR.neutrony.length===0,'rod absorption');
 RR.neutrony=[{x:rod.x+rod.w/2,y:rod.y+rod.h+3,vx:0,vy:0,trail:[]}];rrKrok(.01);check(RR.neutrony.length===1,'below-tip survival');Math.random=saveRandom;
 $('rrInsert').click();check(RR.pohlceni===100&&RR.tyce.every(r=>r.h===224),'full insertion');
 mode('rozpad');const random=Math.random;Math.random=()=>.25;$('rzStep').click();Math.random=random;
 check(RZ.t===1&&RZ.jadra.every(j=>!j.zive),'decay model');check($('mereniBody').children.length===1,'measurement');
 $('btnDalsi').click();check(RZ.t===0&&!RZ.bezi&&$('mereniBody').children.length===0,'decay reset');
 Math.random=()=>.75;$('rzStep').click();Math.random=random;check(RZ.jadra.every(j=>j.zive),'random survival');
 for(let i=0;i<10;i++)$('rzSave').click();check($('mereniBody').children.length===8,'notebook limit');
 document.querySelector('[data-iz="2"]').click();check(RZ.izotop===2&&RZ.t===0,'isotope reset');
 mode('schema');for(const b of document.querySelectorAll('[data-cast]')){b.click();check($('popisCasti').textContent.includes(CASTI[b.dataset.cast].nazev),'plant part');}
 $('posVykon').value=100;$('posVykon').dispatchEvent(new Event('input'));check($('schBilance').textContent.includes('1 000 MW'),'energy balance');
 $('schAno').click();check($('schOdpoved').textContent.includes('Zkus'),'plant retry');$('schNe').click();check($('schOdpoved').textContent.includes('Správně'),'plant correct');
 const orig=Uloha.vyber;window.options=null;Uloha.vyber=o=>{options=o;return orig(o)};
 for(const m of ['stepeni','polocas','provoz']){mode(m);for(let i=0;i<12;i++){const o=options,bs=[...document.querySelectorAll('.moznosti button')];check(new Set(o.moznosti.map(x=>x.klic)).size===o.moznosti.length,'unique options');bs.find(b=>b.dataset.klic!==o.spravnyKlic).click();check(o.odezva.classList.contains('chyba'),'wrong quiz');bs.find(b=>b.dataset.klic===o.spravnyKlic).click();check(o.odezva.classList.contains('ok'),'correct quiz');$('btnDalsi').click();}}
 Uloha.vyber=orig;return 'PASS: fission, balance, chain controls/scenarios, decay probability/reset/notebook, plant energy/parts, 36 quiz retries';})()`));
 await evaluate(`document.querySelector('[data-rezim="dej"]').click();$('dejPlay').click()`);
 await new Promise(r=>setTimeout(r,180));assert.ok(await evaluate('DJ.t>0&&DJ.playing'),'fission plays');
 await evaluate(`$('dejPlay').click();window.pausedTime=DJ.t`);await new Promise(r=>setTimeout(r,90));assert.ok(await evaluate('DJ.t===pausedTime'),'fission pause');
 await evaluate(`$('dejTime').value=2.4;$('dejTime').dispatchEvent(new Event('input'))`);assert.equal(await evaluate('DJ.t'),2.4);assert.ok(await evaluate(`+$('djBa').getAttribute('opacity')===1`),'fragments separated');
 await evaluate(`DJ.t=2.99;DJ.speed=2;DJ.playing=true`);await new Promise(r=>setTimeout(r,200));assert.ok(await evaluate('DJ.t===3&&!DJ.playing'),'fission completes');
 await evaluate(`$('dejReplay').click()`);assert.ok(await evaluate('DJ.playing&&DJ.t<.1'),'replay resets');
 await evaluate(`document.querySelector('[data-rezim="schema"]').click()`);assert.ok(await evaluate('DJ.animace===null&&!DJ.playing'),'fission disposed');
 const before=await evaluate(`$('schRotor').getAttribute('transform')`);await new Promise(r=>setTimeout(r,160));assert.notEqual(await evaluate(`$('schRotor').getAttribute('transform')`),before,'rotor moves');
 await evaluate(`$('schPause').click();window.plantT=SCH.faze`);await new Promise(r=>setTimeout(r,90));assert.ok(await evaluate('SCH.faze===plantT'),'plant paused');
 await evaluate(`$('posVykon').value=0;$('posVykon').dispatchEvent(new Event('input'));$('schPause').click();window.plantT=SCH.faze`);await new Promise(r=>setTimeout(r,90));assert.ok(await evaluate('SCH.faze===plantT'),'zero power stopped');
 assert.equal(await evaluate(`$('schSpark').getAttribute('opacity')`),'0','no zero power electricity');
 await evaluate(`document.querySelector('[data-loop="primary"]').click()`);assert.ok(await evaluate(`document.querySelector('[data-circuit="secondary"]').getAttribute('opacity')==='.13'||document.querySelector('[data-circuit="secondary"]').getAttribute('opacity')==='0.13'`),'loop filter');
 for(const width of [1280,390,320])for(const theme of ['dark','light']){
 await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='${theme}'`);
 for(const mode of ['dej','retezovka','rozpad','schema','havarie','stepeni','polocas','provoz']){
 await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);
 assert.ok(await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),'overflow '+width+' '+theme+' '+mode);
 }}
 await evaluate(`document.querySelector('[data-rezim="schema"]').click();document.querySelector('[data-dil="generator"]').focus()`);
 await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal(await evaluate('SCH.vybrano'),'generator');
 assert.ok(await evaluate(`document.activeElement.dataset.dil==='generator'`),'focus retained');
 await evaluate(`document.querySelector('[data-dil="kondenzator"]').focus()`);
 await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
 assert.equal(await evaluate('SCH.vybrano'),'kondenzator');
 await evaluate(`document.querySelector('[data-rezim="rozpad"]').click();$('btnRZStart').click()`);
 await new Promise(r=>setTimeout(r,200));
 assert.ok(await evaluate('RZ.t>0'),'running decay');
 await evaluate(`$('btnRZStart').click();window.stoppedAt=RZ.t`);
 await new Promise(r=>setTimeout(r,100));
 assert.ok(await evaluate('RZ.t===stoppedAt'),'paused decay');
 await evaluate(`$('rzSave').click();$('btnDalsi').click()`);
 assert.equal(await evaluate(`$('rzZapis').textContent`),'','notebook reset status');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for(const mode of ['schema','retezovka','dej']) {await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);assert.ok(await evaluate(mode==='schema'?'SCH.paused':mode==='dej'?'!DJ.playing':'RR.paused'),'reduced motion '+mode);}
 assert.equal(errors.length,0,JSON.stringify(errors));
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:1050,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='dark';SCH.vykon=70;document.querySelector('[data-rezim="schema"]').click()`);
 const fs=await import('node:fs/promises');
 await fs.writeFile('/tmp/nuclear-desktop.png',Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
 await evaluate(`document.querySelector('[data-rezim="retezovka"]').click();$('btnNeutron').click();$('rrStep').click()`);
 await fs.writeFile('/tmp/nuclear-chain.png',Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
 await evaluate(`document.querySelector('[data-rezim="dej"]').click();dejSeek(1.55)`);
 await fs.writeFile('/tmp/nuclear-fission.png',Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='light';document.querySelector('[data-rezim="dej"]').click()`);
 await fs.writeFile('/tmp/nuclear-mobile.png',Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
 await evaluate(`document.querySelector('[data-rezim="schema"]').click();$('schZoom').click()`);
 assert.ok(await evaluate(`$('schViewport').scrollWidth>$('schViewport').clientWidth`),'zoom inside viewport');
 assert.ok(await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),'zoom no page overflow');
 await evaluate(`document.querySelector('[data-rezim="retezovka"]').click();$('rrZoom').click()`);
 assert.ok(await evaluate(`$('rrViewport').scrollWidth>$('rrViewport').clientWidth`),'reactor zoom');
 assert.ok(await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),'reactor zoom no page overflow');
 console.log(await evaluate(`(()=>{const original=Math.random;let seed=123;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};let result=[];try{Math.random=rng;RR.reflektor=false;RR.polomer=105;for(const rods of [0,100]){seed=123;RR.pohlceni=rods;let fissions=0,captured=0;for(let trial=0;trial<12;trial++){rrReset();for(let n=0;n<4;n++)rrVystrel();for(let n=0;n<200;n++)rrKrok(.015);fissions+=RR.stepeni;captured+=RR.pohlceno;}result.push({rods,fissions,captured});}if(!(result[1].captured>0&&result[1].fissions<result[0].fissions))throw Error('rods should suppress reaction '+JSON.stringify(result));return result;}finally{Math.random=original;rrReset();}})()`));
 console.log('PASS: fission play/pause/seek/end, physical rod capture, plant rotation/pause/zero power, loop filtering and zoom');
 console.log('PASS: 8 modes, 1280/390/320 px, both themes, keyboard focus, reduced motion, no JS exceptions');
}finally{ws.close();}
