// Spuštění: node ekologie-kontrola.mjs (Chromium s --remote-debugging-port=9333).
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const target = (await (await fetch('http://127.0.0.1:9333/json')).json()).find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let sequence=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
function assert(value,message){if(!value)throw Error(message);console.log('OK',message);}
const url=new URL('../pr9_ekologie.html',import.meta.url).href;
await call('Runtime.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url});
for(let i=0;i<50;i++){if(await evaluate("Boolean(document.querySelector('#organ-buttons button'))"))break;await new Promise(r=>setTimeout(r,100));}
assert(await evaluate("document.querySelectorAll('#organ-buttons button').length===6"),'šest organismů a načtení skriptu');
await evaluate("localStorage.setItem('metodus_posun',JSON.stringify({rezim:'rucne',tempo:'normal'})); localStorage.removeItem('metodus_pr9_ekologie');location.reload()");
await new Promise(r=>setTimeout(r,600));
for(const id of ['rasy','perloocky','plotice','okoun','stika','rozkladaci'])assert(await evaluate(`document.querySelector('#organ-buttons [data-organ="${id}"]').click(); document.querySelector('.node[data-organ="${id}"]').getAttribute('aria-pressed')==='true' && document.querySelector('#organ-detail').innerText.length>250`),'atlas '+id);
assert(await evaluate("document.querySelector('.node[data-organ=perloocky]').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));document.querySelector('#organ-detail h3').textContent==='Perloočky'"),'SVG ovládání klávesnicí');
assert(await evaluate("document.querySelectorAll('.flow.selected').length===3"),'potravní vazby perloočky');
assert(await evaluate("document.getElementById('energy-input').value=10000;document.getElementById('efficiency').value=10;document.getElementById('efficiency').dispatchEvent(new Event('input'));Array.from(document.querySelectorAll('.energy-row b')).map(e=>e.textContent.replace(/\\s/g,'')).join(',')==='10kJ,100kJ,1000kJ,10000kJ'"),'pyramida: dva i tři přenosy energie');
assert(await evaluate("document.getElementById('efficiency').value=20;document.getElementById('efficiency').dispatchEvent(new Event('input'));document.querySelector('.energy-row b').textContent==='80 kJ'"),'posuvník mění výpočet');
for(let i=0;i<4;i++)assert(await evaluate(`document.querySelector('[data-scenario="${i}"]').click();document.querySelectorAll('#scenario-detail .effect').length===3`),'scénář '+i);
for(const id of ['water','hedge','flowers'])assert(await evaluate(`document.querySelector('[data-action=${id}]').click();getComputedStyle(document.getElementById('land-${id}')).display!=='none'`),'krajina '+id);
assert(await evaluate("document.getElementById('land-reset').click();Array.from(document.querySelectorAll('[data-action]')).every(x=>!x.checked) && getComputedStyle(document.getElementById('land-water')).display==='none'"),'reset krajiny');
for(const id of ['krkonose','sumava','podyji','ceskeSvycarsko','palava','beskydy','ceskyRaj','jeseniky','soutok'])assert(await evaluate(`document.querySelector('[data-area=${id}]').click();document.querySelector('#map-study [data-klic=${id}]').getAttribute('aria-pressed')==='true'`),'mapa '+id);
const source=await readFile(new URL('./ekologie.js',import.meta.url),'utf8');
const banks={};for(const [mode,name,next] of [['pojmy','concepts','protection'],['ochrana','protection','impacts'],['zasah','impacts','banks']])banks[mode]=vm.runInNewContext(source.split(`const ${name} = `)[1].split(`const ${next}`)[0].trim().replace(/;$/,''));
let attempted=0;
for(const mode of Object.keys(banks)){
 if(mode!=='pojmy') await evaluate(`document.querySelector('[data-rezim=${mode}]').click()`);
 const seen=new Set();
 for(let i=0;i<banks[mode].length;i++){
 const q=await evaluate("document.querySelector('#plocha h3').textContent");const row=banks[mode].find(x=>x[0]===q);if(!row)throw Error('Neznámá otázka '+q);seen.add(q);
 const right=JSON.stringify(row[1]);
 if(i===0){assert(await evaluate(`Array.from(document.querySelectorAll('#plocha .moznosti button')).find(b=>b.textContent!==${right}).click();document.querySelector('#plocha .odezva').classList.contains('chyba')`),'chybná odpověď dovolí opravu '+mode);}
 assert(await evaluate(`Array.from(document.querySelectorAll('#plocha .moznosti button')).find(b=>b.textContent===${right}).click();document.querySelector('#plocha .odezva').classList.contains('ok') && Boolean(document.querySelector('#plocha .pokracovat'))`),'správná odpověď + vysvětlení '+mode+' '+(i+1));
 attempted++;
 await evaluate("document.getElementById('btnDalsi').click()");
 }
 assert(seen.size===banks[mode].length,'všechny otázky bez opakování '+mode);
}
const stored=await evaluate("JSON.parse(localStorage.getItem('metodus_pr9_ekologie'))");assert(stored.pokusy===attempted&&stored.spravne===attempted-3,'skóre započítává pouze odpovědi napoprvé');
await evaluate("document.querySelector('[data-rezim=mapa]').click()");
assert(await evaluate("document.querySelectorAll('#plocha .znacka[tabindex=\"0\"]').length===6 && document.querySelectorAll('#plocha .buttons button').length===6"),'slepá mapa má šest dostupných bodů');
// Odpověz na mapu postupně; nesprávné body musí umožnit další pokus.
for(let i=1;i<=6;i++){await evaluate(`document.querySelectorAll('#plocha .buttons button')[${i-1}].click()`);if(await evaluate("document.querySelector('#plocha .odezva').classList.contains('ok')"))break;}
assert(await evaluate("document.querySelector('#plocha .odezva').classList.contains('ok')"),'mapová úloha jde dokončit');
// Automatický časovač staré úlohy nesmí po přepnutí přepsat novou.
await evaluate("localStorage.setItem('metodus_posun',JSON.stringify({rezim:'auto',tempo:'normal'}));location.reload()");await new Promise(r=>setTimeout(r,600));
const q=await evaluate("document.querySelector('#plocha h3').textContent");const right=JSON.stringify(banks.pojmy.find(x=>x[0]===q)[1]);
await evaluate(`Array.from(document.querySelectorAll('#plocha .moznosti button')).find(b=>b.textContent===${right}).click();document.querySelector('[data-rezim=ochrana]').click()`);
const old=await evaluate("document.querySelector('#plocha h3').textContent");await new Promise(r=>setTimeout(r,6800));assert((await evaluate("document.querySelector('#plocha h3').textContent"))===old,'starý časovač nepřepíše nový režim');
for(const theme of ['dark','light']){
 await evaluate(`document.documentElement.dataset.theme='${theme}'`);
 for(const width of [1280,390,320]){await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});assert(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'bez vodorovného přetékání '+theme+' '+width);}
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
 await evaluate("document.querySelector('#organ-buttons [data-organ=rasy]').click();window.scrollTo(0,0)");
 const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1280,height:1900,scale:1}});await writeFile(new URL(`./ekologie-kontrola-${theme}.png`,import.meta.url),Buffer.from(shot.data,'base64'));
}
assert(errors.length===0,'žádné JavaScriptové výjimky');ws.close();
