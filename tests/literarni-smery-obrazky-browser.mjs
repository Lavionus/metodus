import assert from 'node:assert/strict';

const endpoint=process.env.METODUS_CDP_URL||'http://127.0.0.1:9223/json';
const target=(await (await fetch(endpoint)).json()).find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>ws.onopen=resolve);
let id=0;const pending=new Map(),runtimeErrors=[];
ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id){pending.get(msg.id)?.(msg);pending.delete(msg.id);}if(msg.method==='Runtime.exceptionThrown')runtimeErrors.push(msg.params.exceptionDetails.text);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id,timer=setTimeout(()=>reject(Error(method+' timeout')),15000);pending.set(requestId,msg=>{clearTimeout(timer);msg.error?reject(Error(JSON.stringify(msg.error))):resolve(msg.result);});ws.send(JSON.stringify({id:requestId,method,params}));});
const ev=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;};

await call('Page.enable');await call('Runtime.enable');
await call('Page.navigate',{url:'http://127.0.0.1:8766/obsah/literarni_smery.html'});
for(let i=0;i<120&&!(await ev(`document.readyState==='complete'&&typeof novaUloha==='function'`));i++)await new Promise(r=>setTimeout(r,50));
assert.equal(await ev(`Object.keys(VYTVARNE_KOTVY).length`),8);
assert.equal(await ev(`document.querySelectorAll('.vytvarna-kotva').length`),8);
assert.equal(await ev(`document.querySelectorAll('.vytvarna-kotva figcaption').length`),8);
await ev(`[...document.querySelectorAll('.vytvarna-kotva img')].forEach(img=>{img.loading='eager';img.src=img.src})`);
for(let i=0;i<120&&!(await ev(`[...document.querySelectorAll('.vytvarna-kotva img')].every(img=>img.complete&&img.naturalWidth>0)`));i++)await new Promise(r=>setTimeout(r,50));
assert.equal(await ev(`[...document.querySelectorAll('.vytvarna-kotva img')].every(img=>img.complete&&img.naturalWidth>0)`),true);
assert.equal(await ev(`[...document.querySelectorAll('.vytvarna-kotva figcaption')].every(x=>x.textContent.includes('Vizuální znak:'))`),true);
for(const mode of ['prehled','autor','dilo','obdobi']){
  await ev(`document.querySelector('[data-rezim=${JSON.stringify(mode)}]').click()`);
  assert.equal(await ev(`document.querySelector('[data-rezim=${JSON.stringify(mode)}]').classList.contains('active')`),true);
  if(mode!=='prehled')assert.equal(await ev(`document.querySelector('#plocha').children.length>0`),true);
}
for(const width of [1366,390,320]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600});
  for(const theme of ['light','sepia-tmava']){
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('[data-rezim="prehled"]').click()`);
    const overflow=await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth`);
    if(overflow)console.log(await ev(`JSON.stringify({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,prvky:[...document.querySelectorAll('body *')].filter(x=>x.getBoundingClientRect().right>document.documentElement.clientWidth+1).slice(0,8).map(x=>({tag:x.tagName,cls:x.className,text:x.textContent.trim().slice(0,60),right:Math.round(x.getBoundingClientRect().right),sw:x.scrollWidth,cw:x.clientWidth}))})`));
    assert.equal(overflow,false);
    assert.equal(await ev(`document.querySelectorAll('.vytvarna-kotva').length`),8);
  }
}
assert.deepEqual(runtimeErrors,[]);
console.log(JSON.stringify({results:['IMG-cj-14: eight art anchors load; four modes, themes and 1366/390/320 px fit OK'],runtimeErrors}));
ws.close();
