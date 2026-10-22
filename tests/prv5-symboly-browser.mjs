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
await call('Page.navigate',{url:'http://127.0.0.1:8766/obsah/prv5_statni_symboly.html'});
for(let i=0;i<120&&!(await ev(`document.readyState==='complete'&&typeof novaUloha==='function'`));i++)await new Promise(r=>setTimeout(r,50));
assert.equal(await ev(`SYMBOLY.length`),7);
assert.equal(await ev(`SYMBOLY.some(s=>s.n==='státní pečeť'&&s.img.endsWith('prv5-symbol-statni-pecet.webp'))`),true);
assert.equal(await ev(`SYMBOLY.some(s=>s.n==='státní hymna'&&s.audio.endsWith('kde-domov-muj.ogg'))`),true);
assert.deepEqual(await ev(`Promise.all(SYMBOLY.filter(s=>s.img).map(async s=>(await fetch(s.img)).ok))`),[true,true,true,true,true]);
assert.equal(await ev(`fetch('audio/kde-domov-muj.ogg').then(r=>r.ok)`),true);
for(let i=0;i<7;i++){
  await ev(`Uloha.nahodne=a=>a===SYMBOLY?SYMBOLY[${i}]:a[0];symboly()`);
  assert.equal(await ev(`document.querySelector('.karta [data-symbol]')?.dataset.symbol`),await ev(`SYMBOLY[${i}].n`));
}
for(const width of [1366,390,320]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600});
  for(const theme of ['light','sepia-tmava']){
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)};symboly()`);
    assert.equal(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth`),false);
  }
}
assert.deepEqual(runtimeErrors,[]);
console.log(JSON.stringify({results:['IMG-prv-23: all seven symbols, exact local assets, anthem audio, themes and 1366/390/320 px fit OK'],runtimeErrors}));
ws.close();
