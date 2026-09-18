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
 await call('Runtime.enable');await call('Page.enable');await call('Runtime.discardConsoleEntries');errors.length=0;
 await call('Page.navigate',{url:base+'obsah/f9_jaderna.html'});await new Promise(r=>setTimeout(r,500));
 console.log(await evaluate(`(()=>{
 const check=(x,m)=>{if(!x)throw Error(m)}, mode=id=>document.querySelector('[data-rezim="'+id+'"]').click();
 for(const kind of ['ba','kr']){
 document.querySelector('[data-product="'+kind+'"]').click();const p=PRODUKTY[kind];
 check($('productInfo').textContent.includes(p.title),'product card');
 for(let stage=0;stage<p.chain.length;stage++){
 check(PROD.stage===stage,'stage');check($('productCurrent').textContent.includes(p.a+' nukleonů'),'mass conserved');
 if(stage<p.chain.length-1)$('productNext').click();
 }
 check($('productNext').disabled,'stable stop');check($('productCurrent').textContent.includes('Stabilní jádro'),'stable explanation');
 $('productTime').value=2;$('productTime').dispatchEvent(new Event('input'));check(document.querySelectorAll('#productDots .original').length===25,'quarter after 2 half-lives');
 $('productBack').click();check(!($('productNext').disabled),'chain previous');
 }
 $('productAccident').click();check(rezim==='havarie','from products to cooling');
 for(const kind of Object.keys(HAV_SCENARIOS)){
 document.querySelector('[data-accident="'+kind+'"]').click();
 check(!HAV.playing&&HAV.state.t===0,'scenario paused');
 for(let i=0;i<650;i++)havAdvance(.1);havRender();
 check(HAV.outcome==='damage','no actions causes damage '+kind);
 check(HAV.state.generation>0,'decay heat persists');
 $('havReset').click();
 for(const action of HAV_SCENARIOS[kind].actions)document.querySelector('[data-measure="'+action+'"]').click();
 for(let i=0;i<650;i++)havAdvance(.1);havRender();
 check(HAV.outcome==='stable','correct actions stabilize '+kind);
 check(HAV.state.heat<HAV.reference.heat&&HAV.state.damage===0,'comparison '+kind);
 check(HAV.state.generation>0,'stabilized but decay persists');
 check($('havPlay').disabled,'end stops');
 }
 document.querySelector('[data-accident="blackout"]').click();
 document.querySelector('[data-measure="cooling"]').click();check($('havFeedback').textContent.includes('nemají napájení'),'missing power feedback');
 havAdvance(1);check(HAV.state.removal===0&&HAV.state.heat>62,'pump without power');
 document.querySelector('[data-measure="power"]').click();havAdvance(1);check(HAV.state.removal>HAV.state.generation,'powered cooling');
 document.querySelector('[data-measure="cooling"]').click();havAdvance(1);check(HAV.state.removal===0,'cooling off');
 const sample=havState('blackout');sample.damage=5;sample.cooling=true;sample.power=true;havPhysics(sample,'blackout',1);check(sample.damage>=5,'damage irreversible');
 mode('retezovka');$('rrTryNarrow').click();check(RR.polomer===45&&!RR.reflektor&&RR.pohlceni===0,'narrow comparison');
 $('rrTryWide').click();check(RR.polomer===150&&!RR.reflektor&&RR.pohlceni===0,'wide comparison');
 for(const kind of ['water','graphite','beryllium']){document.querySelector('[data-material="'+kind+'"]').click();check($('rrMaterialText').textContent.length>60,'reflector explanation');}
 const b=rrCore();RR.jadra=[];RR.reflektor=true;RR.tyce=[];const random=Math.random;Math.random=()=>.25;
 RR.neutrony=[{x:b.right+1,y:300,vx:100,vy:0,trail:[]}];rrKrok(.001);Math.random=random;
 check(RR.neutrony.length===1&&RR.neutrony[0].vx<0,'reflector sends neutron inward');rrReset();
 return 'PASS: both product chains, half-lives, 3 accident failures and recoveries, power interlock, irreversible damage, comparison presets, reflector scattering';})()`));
 await evaluate(`document.querySelector('[data-rezim="havarie"]').click();$('havPlay').click()`);
 await new Promise(r=>setTimeout(r,180));assert.ok(await evaluate('HAV.state.t>0'),'live simulation');
 await evaluate(`$('havPlay').click();window.pausedT=HAV.state.t`);await new Promise(r=>setTimeout(r,90));assert.ok(await evaluate('HAV.state.t===pausedT'),'pause');
 await evaluate(`document.querySelector('[data-rezim="dej"]').click()`);assert.ok(await evaluate('HAV.animace===null&&!HAV.playing'),'cleanup');
 for(const width of [1280,390,320])for(const theme of ['dark','light']){
 await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='${theme}'`);
 for(const mode of ['dej','retezovka','havarie']){
 await evaluate(`document.querySelector('[data-rezim="${mode}"]').click()`);
 assert.ok(await evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),'overflow '+width+' '+theme+' '+mode);
 }}
 await evaluate(`document.querySelector('[data-rezim="dej"]').click();document.querySelector('[data-product="kr"]').focus()`);
 await call('Page.bringToFront');
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});assert.equal(await evaluate('PROD.kind'),'kr');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await evaluate(`document.querySelector('[data-rezim="havarie"]').click()`);assert.ok(await evaluate('!HAV.playing'),'no auto movement');
 assert.equal(errors.length,0,JSON.stringify(errors));
 const fs=await import('node:fs/promises');
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:1050,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='dark';document.querySelector('[data-accident="leak"]').click();for(let i=0;i<10;i++)havAdvance(.1);havRender();window.scrollTo(0,0)`);
 await fs.writeFile('/tmp/nuclear-accident.png',Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:false});
 await evaluate(`document.documentElement.dataset.theme='light';document.querySelector('[data-rezim="dej"]').click();$('productsTitle').scrollIntoView()`);
 await fs.writeFile('/tmp/nuclear-products-mobile.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
 console.log('PASS: playback/pause/disposal, keyboard, reduced motion, 1280/390/320 px in both themes, no JS exceptions');
}finally{ws.close();}
