// Spustit místní server (8766), Chromium s CDP (9223), pak node tests/etapa01-browser.mjs.
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
  await call('Runtime.enable'); await call('Page.enable');
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('metodus_posun', JSON.stringify({rezim:'rucne',tempo:'normal'}));` });
  const results = [];
  for (const file of ['ch9_ph','aj9_neprima_rec','m8_valec','prv5_statni_symboly']) {
    await call('Page.navigate', { url: base + 'obsah/' + file + '.html' });
    for (let i = 0; i < 100; i++) {
      if (await evaluate(`document.readyState==='complete' && typeof REZIMY!=='undefined'`)) break;
      await new Promise(r => setTimeout(r, 50));
    }
    await evaluate(`window.testCount=0; window.originalPick=Uloha.nahodne; window.originalChoice=Uloha.vyber;
      Uloha.vyber = options => { window.lastChoice=options; return originalChoice(options); };
      window.checkQuestion = () => {
        const q=lastChoice, keys=q.moznosti.map(x=>x.klic);
        if(new Set(keys).size!==keys.length) throw Error('Duplicate answers: '+keys);
        if(keys.filter(x=>x===q.spravnyKlic).length!==1) throw Error('Missing/ambiguous answer');
        const buttons=[...document.querySelectorAll('.moznosti button')];
        buttons.find(b=>b.dataset.klic!==q.spravnyKlic).click();
        if(!q.odezva.classList.contains('chyba')) throw Error('Missing wrong feedback');
        buttons.find(b=>b.dataset.klic===q.spravnyKlic).click();
        if(!q.odezva.classList.contains('ok')) throw Error('Missing correct feedback');
        if(!document.querySelector('.pokracovat')) throw Error('Missing manual continuation');
        testCount++;
      };`);
    if (file === 'ch9_ph') await evaluate(`
      for(const [ph,expected] of [[-1,'kyselé'],[6.6,'kyselé'],[7,'neutrální'],[7.4,'zásadité'],[15,'zásadité']])
        if(druhPodlePh(ph)!==expected) throw Error('pH boundary '+ph);
      const random=Math.random;
      for(const l of LATKY) for(const chance of [0.2,0.9]) {
        Uloha.nahodne = a => a===LATKY ? l : originalPick(a); Math.random=()=>chance;
        stupnice(); checkQuestion();
        if(l.ph===6.6 && l.druh!=='kyselé') throw Error('Milk');
        if(l.ph===7.4 && l.druh!=='zásadité') throw Error('Blood');
      }
      Math.random=random;
      for(const ind of INDIKATORY) for(const sample of ind.vzorky) {
        Uloha.nahodne = a => a===INDIKATORY ? ind : a===ind.vzorky ? sample : originalPick(a);
        indikatory(); checkQuestion();
        if(!document.getElementById('ukazkaIndikatoru').textContent.includes(sample.barva)) throw Error('Swatch feedback');
      }
      const methyl=INDIKATORY.find(x=>x.i==='methyloranž');
      if(methyl.vzorky.find(x=>x.ph===7).barva!=='žlutá') throw Error('Methyl orange neutral');
      const phenol=INDIKATORY.find(x=>x.i==='fenolftalein');
      if(phenol.vzorky.find(x=>x.ph===8).barva!=='bezbarvý roztok') throw Error('Phenolphthalein weak base');
      for(const reaction of NEUTRALIZACE) for(const chance of [0.2,0.9]) {
        Uloha.nahodne=a=>a===NEUTRALIZACE?reaction:originalPick(a); Math.random=()=>chance;
        neutralizace(); checkQuestion();
      }
      Math.random=random; Uloha.nahodne=originalPick;`);
    if (file === 'aj9_neprima_rec') await evaluate(`
      for(const [data,fn] of [[PREVODY,prevod],[CASY,casy],[ZAJMENA,zajmena],[OTAZKY,otazky]])
        for(const item of data) { Uloha.nahodne=a=>a===data?item:originalPick(a); fn(); checkQuestion(); }
      if(!document.body.textContent.includes('said to somebody') || !document.body.textContent.includes('told somebody')) throw Error('Say/tell');
      Uloha.nahodne=originalPick;`);
    if (file === 'm8_valec') await evaluate(`
      for(const item of SIT) { Uloha.nahodne=a=>a===SIT?item:originalPick(a);sit();checkQuestion(); }
      if(!document.querySelector('.napoveda').textContent.includes('r = 1 cm a v = 10 cm')) throw Error('Tall cylinder example');
      Uloha.nahodne=originalPick;`);
    if (file === 'prv5_statni_symboly') await evaluate(`
      if(!document.querySelector('.napoveda').textContent.includes('sedm státních symbolů')) throw Error('Symbol count');`);
    // Každý zachovaný režim: chybná i správná odpověď a ruční pokračování.
    await evaluate(`for(const b of document.querySelectorAll('#rezimy button')) { b.click(); checkQuestion(); }
      document.querySelector('.pokracovat').click();
      if(document.querySelector('.pokracovat')) throw Error('Continuation did not reset question');`);
    const count = await evaluate('testCount');
    for (const width of [1366,390,320]) for (const theme of ['dark','light']) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await evaluate(`document.documentElement.dataset.theme='${theme}'`);
      const sizes = await evaluate(`({width:innerWidth, scroll:document.documentElement.scrollWidth})`);
      assert.ok(sizes.scroll <= sizes.width + 1, file + ' overflow at ' + width + ' ' + theme);
    }
    results.push({file, answeredQuestions:count, viewportWidths:[1366,390,320], themes:['dark','light']});
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(JSON.stringify({ok:true, results, runtimeErrors:errors.length},null,2));
} finally { ws.close(); }
