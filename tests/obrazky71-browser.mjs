import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:8766/';
const target=(await (await fetch('http://127.0.0.1:9223/json')).json()).find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let id=0; const pending=new Map(), errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);} if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id; const timer=setTimeout(()=>reject(Error(method+' timeout')),15000);pending.set(n,m=>{clearTimeout(timer);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const ready=async expression=>{for(let i=0;i<100;i++){if(await ev(expression))return;await pause(50);}throw Error('Not ready: '+expression);};
const results=[];
try {
 await call('Page.enable'); await call('Runtime.enable');
 for(const page of ['prehled','osnova','vyslovnost','aj3_abeceda','dcj7_vyslovnost']) {
  await call('Page.navigate',{url:base+'obsah/'+page+'.html'});
  await ready(`document.readyState==='complete' && document.querySelector('${['prehled','osnova'].includes(page)?'.predmet-ilustrace':'.atlas-detail img'}')!==null`);
  if(page==='prehled') {
   assert.equal(await ev(`document.querySelectorAll('.predmet-ilustrace').length`),11);
   assert.ok(await ev(`[...document.querySelectorAll('.predmet')].every(a=>a.href.includes('#skupina='))`));
  }
  if(page==='osnova') {
   assert.equal(await ev(`document.querySelectorAll('#mrizka tbody th img').length`),11);
   await ev(`document.querySelectorAll('#mrizka tbody tr')[9].querySelector('button').click()`);
   assert.ok(await ev(`document.querySelector('#detail h2 img').src.endsWith('prehled-lupa-mapa.webp')`));
  }
  if(!['prehled','osnova'].includes(page)) {
   await ev(`document.querySelectorAll('details.vyslovnost-atlas').forEach(d=>d.open=true)`);
   const expected=page==='vyslovnost'?8:page==='aj3_abeceda'?5:3;
   assert.equal(await ev(`document.querySelectorAll('.atlas-volby button').length`),expected);
   for(let i=0;i<expected;i++) {
    await ev(`document.querySelectorAll('.atlas-volby button')[${i}].click()`);
    await ev(`document.querySelector('.atlas-detail img').loading='eager';document.querySelector('.atlas-detail img').decode()`);
    assert.equal(await ev(`document.querySelectorAll('.atlas-volby [aria-pressed="true"]').length`),1);
    await ev(`document.querySelector('.atlas-vyklad details').open=true`);
    assert.ok(await ev(`document.querySelector('.atlas-vyklad details p').textContent.length>40`));
   }
   await call('Page.bringToFront');
   await ev(`document.querySelector('.atlas-volby button').focus()`);
   await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
   await call('Input.dispatchKeyEvent',{type:'char',text:'\r'});
   await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
   assert.equal(await ev(`document.querySelector('.atlas-volby button').getAttribute('aria-pressed')`),'true');
   await ev(`document.querySelectorAll('.atlas-volby button')[1].focus()`);
   await call('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});
   await call('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
   assert.equal(await ev(`document.querySelectorAll('.atlas-volby button')[1].getAttribute('aria-pressed')`),'true');
   if(page==='vyslovnost') assert.equal(await ev(`getComputedStyle(document.querySelector('#setupCard')).display`),'none');
   else {
    const modes=await ev(`document.querySelectorAll('#rezimy button').length`);
    for(let i=0;i<modes;i++) {await ev(`document.querySelectorAll('#rezimy button')[${i}].click()`); assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length>10`));}
   }
  }
  for(const width of [1280,390,320]) for(const theme of ['dark','light']) {
   await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
   await ev(`document.documentElement.dataset.theme='${theme}';document.querySelectorAll('img').forEach(i=>i.loading='eager');Promise.all([...document.images].map(i=>i.decode()))`);
   assert.equal(await ev(`document.documentElement.scrollWidth>innerWidth+1`),false,page+' overflow '+width);
   assert.ok(await ev(`[...document.images].every(i=>i.naturalWidth>0)`));
   if(width===390 && theme==='light') {const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile('/tmp/obrazky71-'+page+'.png',Buffer.from(shot.data,'base64'));}
  }
  results.push(page+': images, themes, widths OK');
 }
 // Iframe contract: subject tiles still send the group filter to the parent.
 await call('Page.navigate',{url:base+'obsah/img/kapitola-7-1.html'});await ready(`document.readyState==='complete'`);
 await ev(`window.messages=[];addEventListener('message',e=>messages.push(e.data));const f=document.createElement('iframe');f.id='testFrame';f.src='../prehled.html';document.body.append(f)`);
 await ready(`document.querySelector('#testFrame').contentDocument.querySelectorAll('button.predmet').length===8`);
 await ev(`document.querySelector('#testFrame').contentDocument.querySelector('button.predmet').click()`);
 await ready(`messages.some(m=>m.skupina==='cestina')`);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({results,iframeFilter:true,keyboard:true,runtimeErrors:errors},null,2));
} finally {ws.close();}
