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
await call('Page.navigate',{url:'http://127.0.0.1:8766/obsah/pr8_prvni_pomoc.html'});
for(let i=0;i<100&&!(await ev(`document.readyState==='complete'&&typeof POSTUP!=='undefined'`));i++)await new Promise(r=>setTimeout(r,50));

assert.equal(await ev(`POSTUP.length`),6);
assert.equal(await ev(`SITUACE.filter(s=>s.img).length`),3);
assert.equal(await ev(`new Set([...POSTUP.map(k=>k.img),...SITUACE.filter(s=>s.img).map(s=>s.img)]).size`),8);
await ev(`Promise.all([...new Set([...POSTUP.map(k=>k.img),...SITUACE.filter(s=>s.img).map(s=>s.img)])].map(n=>new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i.naturalWidth);i.onerror=ko;i.src='img/pr/pr8-prvni-pomoc-'+n+'.webp';})))`);

await ev(`postup()`);
assert.ok(await ev(`document.querySelector('#obrazekPostupu').src.endsWith('pr8-prvni-pomoc-bezpecnost.webp')`));
for(const krok of await ev(`POSTUP.map(k=>k.t)`)){
  await ev(`([...document.querySelectorAll('.kroky button')].find(b=>b.textContent===${JSON.stringify(krok)})).click()`);
}
assert.equal(await ev(`document.querySelectorAll('.kroky button.hotovy').length`),6);

await ev(`resuscitace()`);
assert.ok(await ev(`document.querySelector('.karta-prvni-pomoc').src.endsWith('pr8-prvni-pomoc-stlacovani.webp')`));
for(const width of [1366,390,320]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600});
  for(const theme of ['light','sepia-tmava']){
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)};resuscitace()`);
    assert.equal(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth`),false);
    assert.equal(await ev(`document.querySelector('.karta-prvni-pomoc').naturalWidth`),768);
  }
}
assert.deepEqual(runtimeErrors,[]);
console.log(JSON.stringify({results:['IMG-pr-17: eight local cards, procedure sequence, situation wiring, themes and widths OK'],runtimeErrors}));
ws.close();
