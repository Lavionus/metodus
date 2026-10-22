import assert from 'node:assert/strict';

const endpoint=process.env.METODUS_CDP_URL||'http://127.0.0.1:9223/json';
const target=(await (await fetch(endpoint)).json()).find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>ws.onopen=resolve);
let id=0; const pending=new Map(),runtimeErrors=[];
ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id){pending.get(msg.id)?.(msg);pending.delete(msg.id);}if(msg.method==='Runtime.exceptionThrown')runtimeErrors.push(msg.params.exceptionDetails.text);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;const timer=setTimeout(()=>reject(Error(method+' timeout')),15000);pending.set(requestId,msg=>{clearTimeout(timer);msg.error?reject(Error(JSON.stringify(msg.error))):resolve(msg.result);});ws.send(JSON.stringify({id:requestId,method,params}));});
const ev=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;};

await call('Page.enable');await call('Runtime.enable');
// test začíná bez pokroku: jiné testy (např. kouřový) mohou v profilu nechat skóre
await call('Page.navigate',{url:'http://127.0.0.1:8766/obsah/edu_progress.html'});
for(let i=0;i<100&&!(await ev(`document.readyState==='complete'`));i++)await new Promise(r=>setTimeout(r,50));
await ev(`localStorage.clear()`);
await call('Page.navigate',{url:'http://127.0.0.1:8766/obsah/edu_progress.html'});
await new Promise(r=>setTimeout(r,300));
for(let i=0;i<100&&!(await ev(`document.readyState==='complete'&&document.querySelectorAll('.badge').length===12`));i++)await new Promise(r=>setTimeout(r,50));

assert.equal(await ev(`ODZNAKY.length`),12);
assert.equal(await ev(`document.querySelectorAll('.badge').length`),12);
assert.equal(await ev(`document.querySelectorAll('.badge.earned').length`),0);
assert.equal(await ev(`document.querySelectorAll('.badge img').length`),12);
await ev(`Promise.all([...document.querySelectorAll('.badge img')].map(img=>img.complete&&img.naturalWidth?true:new Promise((ok,ko)=>{img.onload=ok;img.onerror=ko;})))`);
assert.ok(await ev(`[...document.querySelectorAll('.badge img')].every(img=>img.naturalWidth===512&&img.naturalHeight===512)`));
assert.ok(await ev(`[...document.querySelectorAll('.badge')].every(b=>b.getAttribute('aria-label').includes('zatím nezískáno'))`));

await ev(`KATALOG=new Map([
  ['cj.html',{predmet:'cj'}],['m.html',{predmet:'m'}],['aj.html',{predmet:'aj'}],
  ['pr.html',{predmet:'pr'}],['z.html',{predmet:'z'}],['inf.html',{predmet:'inf'}]
]);renderOdznaky(28,1000,30,{'2026-10-12':{'cj.html':{},'m.html':{},'aj.html':{},'pr.html':{},'z.html':{},'inf.html':{},'karticky.html':{}}})`);
assert.equal(await ev(`document.querySelectorAll('.badge.earned').length`),12);
assert.ok(await ev(`[...document.querySelectorAll('.badge')].every(b=>b.getAttribute('aria-label').includes('získáno'))`));

for(const width of [1366,390,320]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600});
  for(const theme of ['light','sepia-tmava']){
    await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
    assert.equal(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth`),false);
    assert.equal(await ev(`document.querySelectorAll('.badge img').length`),12);
  }
}
assert.deepEqual(runtimeErrors,[]);
console.log(JSON.stringify({results:['IMG-00-04: 12 badges, locked/earned states, local 512px assets, themes and widths OK'],runtimeErrors}));
ws.close();
