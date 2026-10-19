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
await call('Page.navigate',{url:'http://127.0.0.1:8766/obsah/iss.html'});
for(let i=0;i<120&&!(await ev(`document.readyState==='complete'&&document.querySelector('#photosBtn')`));i++)await new Promise(r=>setTimeout(r,50));

assert.equal(await ev(`document.querySelectorAll('#photoDialog figure').length`),2);
assert.deepEqual(await ev(`Promise.all([...document.querySelectorAll('#photoDialog img')].map(img=>img.complete&&img.naturalWidth>0?true:new Promise(ok=>{img.onload=()=>ok(true);img.onerror=()=>ok(false)})))`),[true,true]);
for(const width of [1366,390,320]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<600});
  await ev(`document.querySelector('#photosBtn').click()`);
  assert.equal(await ev(`document.querySelector('#photoDialog').open`),true);
  assert.equal(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth`),false);
  assert.equal(await ev(`document.querySelector('#photoDialog').scrollWidth>document.querySelector('#photoDialog').clientWidth`),false);
  await ev(`document.querySelector('#photosClose').click()`);
}
assert.deepEqual(runtimeErrors,[]);
console.log(JSON.stringify({results:['IMG-f-19: two local NASA photos load; dialog opens and fits at 1366/390/320 px'],runtimeErrors}));
ws.close();
