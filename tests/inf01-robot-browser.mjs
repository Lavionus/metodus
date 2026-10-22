import assert from 'node:assert/strict';

const endpoint=process.env.METODUS_CDP_URL||'http://127.0.0.1:9223/json';
const target=(await (await fetch(endpoint)).json()).find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>ws.onopen=resolve);
let id=0; const pending=new Map(),runtimeErrors=[];
ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id){pending.get(msg.id)?.(msg);pending.delete(msg.id);}if(msg.method==='Runtime.exceptionThrown')runtimeErrors.push(msg.params.exceptionDetails.text);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;const timer=setTimeout(()=>reject(Error(method+' timeout')),15000);pending.set(requestId,msg=>{clearTimeout(timer);msg.error?reject(Error(JSON.stringify(msg.error))):resolve(msg.result);});ws.send(JSON.stringify({id:requestId,method,params}));});
const ev=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;};
const navigate=async url=>{await call('Page.navigate',{url});for(let i=0;i<100&&!(await ev(`document.readyState==='complete'&&document.querySelector('#plocha')`));i++)await new Promise(r=>setTimeout(r,50));};

await call('Page.enable');await call('Runtime.enable');
await navigate('http://127.0.0.1:8766/obsah/inf4_sekvence.html');
assert.equal(await ev(`Object.keys(SMER_OBRAZEK).length`),4);
assert.equal(await ev(`PREKAZKY.length`),3);
assert.equal(await ev(`SBIRANE.length`),2);
assert.equal(await ev(`document.querySelectorAll('.hriste image').length`),6);
await ev(`Promise.all([...document.querySelectorAll('.hriste image')].map(i=>new Promise((ok,ko)=>{const im=new Image();im.onload=ok;im.onerror=ko;im.src=i.href.baseVal;})))`);
assert.ok(await ev(`[...document.querySelectorAll('.hriste image')].every(i=>i.href.baseVal.includes('img/inf/inf-robot-'))`));
await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'.',bubbles:true}))`);
assert.ok(await ev(`document.querySelector('#robotObrazek').getAttribute('href').endsWith('inf-robot-vpravo.webp')`));
assert.equal(await ev(`document.querySelector('#sbirka').classList.contains('sebrano')`),true);
assert.ok(await ev(`document.querySelector('.info').textContent.includes('sebrán')`));
await ev(`document.querySelector('[data-rezim="najdiChybu"]').click()`);
assert.equal(await ev(`document.querySelectorAll('#robotObrazek').length`),1);

await navigate('http://127.0.0.1:8766/obsah/inf5_cykly.html');
await ev(`document.querySelector('[data-rezim="kdeSkonci"]').click()`);
assert.equal(await ev(`document.querySelectorAll('.hriste image').length`),1);
assert.ok(await ev(`document.querySelector('.hriste image').getAttribute('href').includes('img/inf/inf-robot-')`));

for(const page of [
  {url:'http://127.0.0.1:8766/obsah/inf4_sekvence.html',mode:'bludiste'},
  {url:'http://127.0.0.1:8766/obsah/inf5_cykly.html',mode:'kdeSkonci'}
]){
  await navigate(page.url);
  for(const width of [1366,390,320]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<600});
    for(const theme of ['light','sepia-tmava']){
      await ev(`document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelector('[data-rezim="${page.mode}"]').click()`);
      assert.equal(await ev(`document.documentElement.scrollWidth>document.documentElement.clientWidth`),false);
      assert.ok(await ev(`document.querySelectorAll('.hriste image').length>0`));
    }
  }
}
assert.deepEqual(runtimeErrors,[]);
console.log(JSON.stringify({results:['IMG-inf-01: local tiles, robot direction, bonus pickup, both lessons, themes and widths OK'],runtimeErrors}));
ws.close();
