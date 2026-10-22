
const $ = id => document.getElementById(id);
const skore = Uloha.skore('metodus_f9_jaderna', $('skore'));
let rezim = 'dej';
const omezenyPohyb = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = x => Number(Number(x).toFixed(2)).toLocaleString('cs-CZ');
function odezvaEl() { const d = document.createElement('div'); d.className = 'odezva'; return d; }

/* ============================================================
   1) Řetězová reakce
   Neutron může skončit trojím způsobem a každý je vidět zvlášť:
     • trefí jádro → štěpení a 2–3 nové neutrony,
     • pohltí ho regulační tyč,
     • uteče z aktivní zóny ven (to je ten důvod, proč existuje kritické množství).
   Z poměru těchto tří osudů se odhaduje k = ν · (štěpení / všechny konce).
   ============================================================ */
const RR = { jadra: [], neutrony: [], zabliknuti: [], events: [], polomer: 105, pohlceni: 30, reflektor: false, tyce: [], stepeni: 0, pohlceno: 0, uniklo: 0, okno: [], populace: [], cas: 0, animace: null, ctx: null, paused: false, limit: false, speed: .6 };
const RR_W=900, RR_H=550, RR_STRED={x:385,y:316}, RR_NU=2.5, RR_DOSAH=11, RR_OBNOVA=.85, RR_ODRAZ=.7;
function rrCore(){return {left:RR_STRED.x-RR.polomer*1.24,right:RR_STRED.x+RR.polomer*1.24,top:205,bottom:429};}
function rrTyce(){const core=rrCore(),w=Math.min(12,(core.right-core.left)/6*.25);return Array.from({length:5},(_,i)=>({x:core.left+(i+1)*(core.right-core.left)/6-w/2,y:core.top,w,h:(core.bottom-core.top)*RR.pohlceni/100}));}
function rrInsideRod(x,y){return RR.tyce.some(r=>r.h>0&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);}
function rrRozmisti(){const b=rrCore(),rows=Math.max(4,Math.round((b.right-b.left)*(b.bottom-b.top)/(6*850)));RR.jadra=[];for(let col=0;col<6;col++){const x=b.left+(col+.5)*(b.right-b.left)/6;for(let row=0;row<rows;row++)RR.jadra.push({x:x+(Math.random()-.5)*Math.min(12,(b.right-b.left)/6*.3),y:b.top+12+row*(b.bottom-b.top-24)/(rows-1),obnovaV:0});}}
function rrReset(){rrRozmisti();RR.tyce=rrTyce();RR.neutrony=[];RR.zabliknuti=[];RR.events=[];RR.stepeni=0;RR.pohlceno=0;RR.uniklo=0;RR.okno=[];RR.populace=[];RR.cas=0;RR.limit=false;}
function retezovka(){
  $('plocha').innerHTML=`<div class="zadani uloha-text"><b>Reaktor v podélném řezu.</b> V palivových článcích se štěpí jádra. Mezi články se shora zasouvají regulační tyče a pohlcují neutrony.</div>
  <div class="transport"><button id="rrZoom" aria-pressed="false">⊕ Zvětšit řez reaktorem</button></div><div class="scene-shell reactor-viewport" id="rrViewport" tabindex="0" role="region" aria-label="Řez reaktorem, po zvětšení lze posouvat do stran"><canvas id="plátnoRR" class="reactor-canvas" width="1800" height="1100" role="img" aria-label="Podélný řez reaktorem: svislé palivové články, tyče zasouvané shora a letící neutrony. Číselné výsledky jsou pod modelem."></canvas></div>
  <div class="particle-key"><span><i class="proton-dot"></i> jádro v palivu</span><span><i class="neutron-dot"></i> neutron + jeho stopa</span><span><i class="rod-dot"></i> pohlcující tyč</span><span>✧ štěpení / záchyt / únik</span></div>
  <div class="transport" id="scenare"><button data-scenar="pod">1 · Úzká aktivní zóna</button><button data-scenar="krit">2 · Částečně zasunuté tyče</button><button data-scenar="nad">3 · Vytažené tyče</button></div>
  <div class="reactor-controls"><section class="panel"><label for="posTyce">Zasunutí regulačních tyčí <b id="hodTyce"></b></label><input class="timeline" id="posTyce" type="range" min="0" max="100" step="5" value="${RR.pohlceni}"><div class="range-ends"><span>0 % · vytažené</span><span>100 % · zasunuté</span></div><div class="transport"><button id="rrInsert">↓ Zasunout úplně</button><button id="btnNeutron" class="primary">Vypustit neutron</button></div><p class="vysvetlivka">Neutron se může zachytit pouze v té části tyče, která je v aktivní zóně. Zasunutí nemění počet tyčí.</p></section>
  <section class="panel"><label for="posPalivo">Šířka aktivní zóny <b id="hodPalivo"></b></label><input class="timeline" type="range" id="posPalivo" min="45" max="150" step="5" value="${RR.polomer}"><label class="check-line"><input type="checkbox" id="chkReflektor"> Reflektor vrací část unikajících neutronů</label><div class="transport"><button id="rrPause">⏸ Pauza</button><button id="rrStep">Krok 0,1 s</button><button id="btnResetRR">↺ Nový pokus</button><label>Tempo <select id="rrSpeed"><option value="0.3">0,3×</option><option value="0.6">0,6×</option><option value="1">1×</option></select></label></div></section></div>
  <div class="stavovky"><div class="bunka a"><div class="nadpis">Neutrony v letu</div><div class="cislo" id="rrNeutrony"></div></div><div class="bunka c"><div class="nadpis">Štěpení celkem</div><div class="cislo" id="rrStepeni"></div></div><div class="bunka d"><div class="nadpis">Uniklo ze zóny</div><div class="cislo" id="rrUniklo"></div></div><div class="bunka b"><div class="nadpis">Odhad k</div><div class="cislo" id="rrK"></div></div></div>
  <div class="osudy" id="rrOsudy"></div><p class="verdikt" id="rrVerdikt"></p>
  <aside class="pokus"><b>Pokus: zastavíš růst počtu neutronů?</b><p>Zvol vytažené tyče, vypusť neutrony a sleduj reakci. Potom tyče zasuň úplně. Zkus stejný pokus několikrát: jednotlivé průběhy jsou náhodné.</p><details><summary>Co model zjednodušuje?</summary>Jde o dvourozměrný výřez s velmi zvětšenými jádry a zpomalenými neutrony. Šířka mění množství zobrazeného paliva a vzdálenost k okraji při přibližně stejné plošné hustotě jader; skutečnou hmotnost ani kritické množství nepočítá. Rozštěpené značky se obnovují, aby zastupovaly další nespotřebovaná jádra. Moderace neutronů a zbytkové teplo se zde nesimulují. k je odhad z osudů neutronů za poslední 3 sekundy modelu.</details></aside>${rrVysvetleni()}`;
  RR.ctx=$('plátnoRR').getContext('2d');RR.ctx.setTransform(2,0,0,2,0,0);RR.paused=omezenyPohyb();rrReset();
  const controls=()=>{$('hodTyce').textContent=RR.pohlceni+' %';$('hodPalivo').textContent=Math.round(RR.polomer/105*100)+' %';$('rrPause').textContent=RR.paused?'▶ Pokračovat':'⏸ Pauza';};
  $('rrZoom').onclick=()=>{const zoom=$('rrViewport').classList.toggle('zoomed');$('rrZoom').setAttribute('aria-pressed',String(zoom));$('rrZoom').textContent=zoom?'⊖ Celý řez reaktorem':'⊕ Zvětšit řez reaktorem';};
  $('rrPause').onclick=()=>{RR.paused=!RR.paused;controls();};$('rrStep').onclick=()=>{RR.paused=true;for(let i=0;i<10;i++)rrKrok(.01);controls();rrKresli();rrStavovky();};
  $('rrSpeed').value=String(RR.speed);$('rrSpeed').onchange=e=>RR.speed=+e.target.value;
  $('posTyce').oninput=e=>{RR.pohlceni=+e.target.value;RR.tyce=rrTyce();controls();rrKresli();};
  $('rrInsert').onclick=()=>{$('posTyce').value=100;$('posTyce').dispatchEvent(new Event('input'));};
  $('posPalivo').oninput=e=>{RR.polomer=+e.target.value;rrReset();controls();rrKresli();rrStavovky();};
  $('chkReflektor').checked=RR.reflektor;$('chkReflektor').onchange=e=>{RR.reflektor=e.target.checked;rrKresli();};
  $('btnNeutron').onclick=()=>rrVystrel();$('btnResetRR').onclick=()=>{rrReset();rrKresli();rrStavovky();};
  $('scenare').onclick=e=>{const b=e.target.closest('[data-scenar]');if(!b)return;const s={pod:[45,0],krit:[105,45],nad:[150,0]}[b.dataset.scenar];RR.polomer=s[0];RR.pohlceni=s[1];$('posPalivo').value=s[0];$('posTyce').value=s[1];rrReset();for(let i=0;i<4;i++)rrVystrel();controls();rrKresli();rrStavovky();};
  rrVysvetleniInit();controls();rrKresli();rrStavovky();rrStart();
}
function rrVystrel(){const a=Math.random()*Math.PI*2;RR.neutrony.push({x:RR_STRED.x,y:RR_STRED.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,trail:[]});}
function rrStart(){if(RR.animace)cancelAnimationFrame(RR.animace);let last=null;const frame=t=>{if(!$('plátnoRR')){RR.animace=null;return;}const dt=last===null?0:Math.min(.05,(t-last)/1000);last=t;if(!RR.paused&&!document.hidden){const n=3;for(let i=0;i<n;i++)rrKrok(dt*RR.speed/n);}rrKresli();rrStavovky();RR.animace=requestAnimationFrame(frame);};RR.animace=requestAnimationFrame(frame);}
function rrOsud(druh,x,y){RR.okno.push({t:RR.cas,druh});if(druh==='stepeni')RR.stepeni++;else if(druh==='pohlceno')RR.pohlceno++;else RR.uniklo++;if(RR.events.length<70)RR.events.push({x,y,kind:druh,life:1});}
function rrKrok(dt){
  RR.cas+=dt;const b=rrCore();for(const j of RR.jadra)if(j.obnovaV&&RR.cas>j.obnovaV)j.obnovaV=0;
  const next=[];
  for(const n of RR.neutrony){n.trail??=[];n.trail.push([n.x,n.y]);if(n.trail.length>12)n.trail.shift();n.x+=n.vx*dt;n.y+=n.vy*dt;
    if(n.x<b.left||n.x>b.right||n.y<b.top||n.y>b.bottom){
      if(RR.reflektor&&Math.random()<RR_ODRAZ){const nx=n.x<b.left?1:n.x>b.right?-1:0,ny=n.y<b.top?1:n.y>b.bottom?-1:0;const angle=Math.atan2(ny,nx)+(Math.random()-.5)*Math.PI*.8;const speed=Math.hypot(n.vx,n.vy);n.vx=Math.cos(angle)*speed;n.vy=Math.sin(angle)*speed;n.x=Math.max(b.left+1,Math.min(b.right-1,n.x));n.y=Math.max(b.top+1,Math.min(b.bottom-1,n.y));n.trail=[];}
      else{rrOsud('uniklo',n.x,n.y);continue;}
    }
    // Stejný obdélník pro kreslení i záchyt: žádné pohlcování pod špičkou tyče.
    if(rrInsideRod(n.x,n.y)&&Math.random()<1-Math.exp(-45*dt)){rrOsud('pohlceno',n.x,n.y);continue;}
    const hit=RR.jadra.find(j=>!j.obnovaV&&Math.hypot(n.x-j.x,n.y-j.y)<RR_DOSAH);
    if(hit){hit.obnovaV=RR.cas+RR_OBNOVA;rrOsud('stepeni',hit.x,hit.y);const count=Math.random()<.5?2:3;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2;next.push({x:hit.x,y:hit.y,vx:150*Math.cos(a),vy:150*Math.sin(a),trail:[]});}}
    else next.push(n);
  }
  if(next.length>500)RR.limit=true;RR.neutrony=next.slice(0,500);
  RR.events.forEach(e=>e.life-=dt*1.6);RR.events=RR.events.filter(e=>e.life>0);RR.okno=RR.okno.filter(o=>RR.cas-o.t<3);
  if(!RR.populace.length||RR.cas-RR.populace[RR.populace.length-1][0]>=.08){RR.populace.push([RR.cas,RR.neutrony.length]);if(RR.populace.length>100)RR.populace.shift();}
}
function rrSoucinitel(){return RR.okno.length<6?null:RR_NU*RR.okno.filter(o=>o.druh==='stepeni').length/RR.okno.length;}
function rrKresli(){
  const c=RR.ctx;if(!c)return;const css=getComputedStyle(document.documentElement),color=n=>css.getPropertyValue(n).trim(),b=rrCore();
  c.clearRect(0,0,RR_W,RR_H);
  const rect=(x,y,w,h,r,fill,stroke=null)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}};
  const txt=(text,x,y,size=16,fill=color('--text-muted'),align='left')=>{c.font=`${size}px system-ui`;c.fillStyle=fill;c.textAlign=align;c.fillText(text,x,y);};
  // Podélný řez s tlakovou nádobou, horními pohony a palivovými články.
  for(let x=20;x<900;x+=30){c.strokeStyle=color('--border');c.globalAlpha=.18;c.beginPath();c.moveTo(x,0);c.lineTo(x,550);c.stroke();}c.globalAlpha=1;
  txt('PODÉLNÝ ŘEZ REAKTOREM',28,35,15);txt('Neutrony jsou výrazně zvětšené',28,60,13);
  const vessel=c.createLinearGradient(160,0,610,0);vessel.addColorStop(0,'#4b6572');vessel.addColorStop(.5,'#a6bbc0');vessel.addColorStop(1,'#425762');
  rect(166,115,438,366,100,vessel);rect(179,128,412,340,88,color('--bg-deep'));
  c.fillStyle='#5eb6d2';c.globalAlpha=.10;c.beginPath();c.roundRect(190,153,390,302,65);c.fill();c.globalAlpha=1;
  if(RR.reflektor){c.strokeStyle='#6ccba0';c.lineWidth=8;c.setLineDash([7,4]);c.strokeRect(b.left-10,b.top-10,b.right-b.left+20,b.bottom-b.top+20);c.setLineDash([]);}
  rect(b.left,b.top,b.right-b.left,b.bottom-b.top,8,color('--bg-panel'),color('--border-strong'));
  // Palivo stojí v šestici článků, regulační tyče jsou mezi nimi.
  for(let col=0;col<6;col++){const x=b.left+(col+.5)*(b.right-b.left)/6;const grad=c.createLinearGradient(x-11,0,x+11,0);grad.addColorStop(0,'#614530');grad.addColorStop(.5,'#c59a62');grad.addColorStop(1,'#755638');rect(x-Math.min(10,(b.right-b.left)/6*.25),b.top+6,Math.min(20,(b.right-b.left)/6*.5),b.bottom-b.top-12,4,grad);}
  RR.jadra.forEach(j=>{c.beginPath();c.arc(j.x,j.y,j.obnovaV?2.5:4.8,0,Math.PI*2);c.fillStyle=j.obnovaV?'#51473d':'#ffc080';c.fill();});
  RR.tyce.forEach(r=>{rect(r.x-3,84,18,31,4,'#658693','#8eaab6');rect(r.x+4,114,4,b.top-114,1,'#91a5b0');const top=b.top-(b.bottom-b.top-r.h);c.save();c.beginPath();c.rect(r.x,119,r.w,b.bottom-119);c.clip();const grad=c.createLinearGradient(r.x,0,r.x+r.w,0);grad.addColorStop(0,'#718991');grad.addColorStop(.5,'#d1e2e6');grad.addColorStop(1,'#526974');rect(r.x,top,r.w,b.bottom-b.top,3,grad);c.restore();if(r.h>0){c.fillStyle='#b1d1de';c.fillRect(r.x,b.top+r.h-3,r.w,3);}});
  c.strokeStyle='#91a5b0';c.lineWidth=4;c.beginPath();c.moveTo(RR.tyce[0].x,79);c.lineTo(RR.tyce[4].x+12,79);c.stroke();
  txt('pohony tyčí',385,64,14,color('--text-muted'),'center');
  // Jasně viditelné stopy neutronů a odlišné události.
  RR.neutrony.forEach(n=>{if(n.trail?.length){c.beginPath();c.moveTo(...n.trail[0]);n.trail.forEach(p=>c.lineTo(...p));c.strokeStyle='#78dbee';c.lineWidth=2;c.globalAlpha=.35;c.stroke();c.globalAlpha=1;}c.beginPath();c.arc(n.x,n.y,3.5,0,Math.PI*2);c.fillStyle='#b8f7ff';c.fill();});
  RR.events.forEach(e=>{c.globalAlpha=e.life;const r=5+(1-e.life)*19;c.strokeStyle=e.kind==='stepeni'?'#ffca70':e.kind==='pohlceno'?'#80e5c3':'#ed7d81';c.lineWidth=2;c.beginPath();if(e.kind==='pohlceno'){c.moveTo(e.x-5,e.y-5);c.lineTo(e.x+5,e.y+5);c.moveTo(e.x+5,e.y-5);c.lineTo(e.x-5,e.y+5);}else c.arc(e.x,e.y,r,0,Math.PI*2);c.stroke();});c.globalAlpha=1;
  // Popisky a vysvětlení zůstávají mimo aktivní zónu.
  c.strokeStyle=color('--text-faint');c.lineWidth=1;c.beginPath();c.moveTo(606,185);c.lineTo(644,162);c.stroke();txt('Tlaková nádoba',656,160,16);
  txt('Regulační tyče',656,211,16);txt(`zasunutí ${RR.pohlceni} %`,656,237,20,color('--text'));
  txt('Palivové články',656,281,16);txt('oranžové svislé sloupce',656,303,13);
  txt('Voda kolem paliva',656,345,16);txt('chladivo a moderátor',656,367,13);
  txt('Únik = opuštění aktivní zóny,',28,505,14);txt('nikoli únik z elektrárny do okolí.',28,526,14);
  const gx=651,gy=405,gw=220,gh=72;rect(gx,gy,gw,gh,8,color('--bg-panel'),color('--border'));
  const max=Math.max(8,...RR.populace.map(p=>p[1]));c.strokeStyle='#72cbe1';c.lineWidth=2;c.beginPath();RR.populace.forEach(([t,n],i)=>{const x=gx+8+i/99*(gw-16),y=gy+gh-9-n/max*(gh-22);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();txt('počet neutronů v čase →',gx,500,13);
}

function rrStavovky() {
  if (!$('rrNeutrony')) return;
  $('rrNeutrony').textContent = RR.neutrony.length;
  $('rrStepeni').textContent = RR.stepeni;
  $('rrUniklo').textContent = RR.uniklo;

  const k = rrSoucinitel();
  $('rrK').textContent = k === null ? '—' : fmt(k);

  // rozpad osudů na tři pruhy
  const celkem = RR.stepeni + RR.pohlceno + RR.uniklo;
  const proc = n => celkem ? Math.round(n / celkem * 100) : 0;
  // popisky jsou pod pruhem v jedné řádce – v úzkém úseku by se ořízly
  $('rrOsudy').innerHTML = celkem
    ? `<div class="pruhy">
         <div style="flex:${Math.max(RR.stepeni, 0.01)};background:var(--ok)"></div>
         <div style="flex:${Math.max(RR.pohlceno, 0.01)};background:var(--text-faint)"></div>
         <div style="flex:${Math.max(RR.uniklo, 0.01)};background:var(--danger)"></div>
       </div>
       <div class="stitky">
         <span><i style="background:var(--ok)"></i>štěpení ${proc(RR.stepeni)} %</span>
         <span><i style="background:var(--text-faint)"></i>pohltily tyče ${proc(RR.pohlceno)} %</span>
         <span><i style="background:var(--danger)"></i>uniklo ven ${proc(RR.uniklo)} %</span>
       </div>`
    : `<div class="pruhy"><div style="flex:1;background:var(--border)"></div></div>
       <div class="stitky"><span>zatím žádný neutron neskončil</span></div>`;

  const el = $('rrVerdikt');
  if (RR.limit) { el.textContent = 'Dosažen limit 500 zobrazených neutronů. Model už růst nezobrazuje věrně; přidej tyče nebo spusť nový pokus.'; return; }
  if (k === null) {
    el.className = 'verdikt';
    el.textContent = RR.neutrony.length
      ? '⚪ Zatím málo událostí pro odhad k. Nech model běžet nebo jej krokuj.'
      : 'Vypusť neutron nebo zvol některý pokus nad ovladači. Porovnej vytažené a zasunuté tyče.';
  } else if (k < 0.95) {
    el.className = 'verdikt podkriticka';
    el.textContent = `🔵 Podkritická (k = ${fmt(k)}) — každá generace je slabší než ta předchozí, reakce uhasne.`;
  } else if (k > 1.08) {
    el.className = 'verdikt nadkriticka';
    el.textContent = `🔴 Nadkritická (k = ${fmt(k)}) — každá generace je početnější, počet neutronů roste lavinovitě.`;
  } else {
    el.className = 'verdikt kriticka';
    el.textContent = `🟢 Kritická (k = ${fmt(k)}) — odhad je blízko 1. Ve stabilním reaktoru jedno štěpení v průměru vyvolá jedno další.`;
  }
}

/* ============================================================
   2) Rozpad naživo – jednotlivé pokusy kolísají kolem teoretické křivky.
   ============================================================ */
const RZ = { jadra: [], t: 0, bezi: false, rychlost: 1, animace: null, mereni: [], izotop: 0 };
const RZ_POCET = 300, RZ_W = 560, RZ_H = 170;

function rzReset() {
  RZ.bezi = false;
  if ($('btnRZStart')) $('btnRZStart').textContent = '▶️ Spustit čas';
  if ($('rzHotovo')) $('rzHotovo').textContent = '';
  if ($('mereniBody')) $('mereniBody').innerHTML = '';
  if ($('rzZapis')) $('rzZapis').textContent = '';
  RZ.jadra = [];
  for (let i = 0; i < RZ_POCET; i++) {
    RZ.jadra.push({
      x: 12 + (i % 30) * ((RZ_W - 24) / 29),
      y: 14 + Math.floor(i / 30) * ((RZ_H - 28) / 9),
      zive: true,
    });
  }
  RZ.t = 0;
  RZ.mereni = [[0, RZ_POCET]];
}

function rozpad() {
  const p = $('plocha');
  const iz = IZOTOPY[RZ.izotop];
  p.innerHTML = `
    <div class="zadani uloha-text" style="max-width:560px">Každé jádro se rozpadá <b>náhodně</b> —
      nelze předpovědět které a kdy. Výsledky jednotlivých pokusů kolísají kolem teoretické křivky. Sleduj, kolik jich zbývá
      po každém poločasu.</div>
    <div class="ovladace" id="izotopy">${IZOTOPY.map((z, i) =>
      `<button data-iz="${i}"${i === RZ.izotop ? ' class="hlavniAkce"' : ''}>${z.n}</button>`).join('')}</div>
    <canvas role="img" aria-label="Vzorek 300 jader, velké tečky jsou původní jádra, malé přeměněná" class="scena" id="plátnoRZ" width="${RZ_W}" height="${RZ_H}"></canvas>
    <canvas role="img" aria-label="Graf zbývajících jader: plná čára je pokus, čárkovaná teorie; hodnoty jsou dostupné v zápisníku" class="scena" id="plátnoRZG" width="${RZ_W}" height="150"></canvas>
    <div class="ovladace">
      <button id="btnRZStart" class="hlavniAkce">▶️ Spustit čas</button>
      <button id="rzStep">+ 1 poločas a zapsat</button><button id="rzSave">Zapsat měření</button><button id="btnRZReset">↺ Nový pokus</button>
      <label>⏩ Rychlost
        <input type="range" id="posRychlost" min="0.2" max="4" step="0.2" value="${RZ.rychlost}">
        <span class="hodnota" id="hodRychlost"></span></label>
    </div>
    <div class="stavovky">
      <div class="bunka a"><div class="nadpis">Zbývá jader</div><div class="cislo" id="rzZbyva"></div></div>
      <div class="bunka b"><div class="nadpis">Uplynulo poločasů</div><div class="cislo" id="rzPolocasy"></div></div>
      <div class="bunka c"><div class="nadpis">Skutečný čas</div><div class="cislo" id="rzCas"></div></div>
      <div class="bunka d"><div class="nadpis">Teorie říká</div><div class="cislo" id="rzTeorie"></div></div>
    </div>
    <p class="verdikt" id="rzHotovo" role="status"></p>
    <aside class="pokus"><b>Nejdřív odhadni, potom změř</b><p>Ze 300 jader by po dvou poločasech mělo v průměru zbýt 75. Vyzkoušej dva kroky, pak nový vzorek. Dostaneš přesně stejné číslo?</p><table class="mereni"><caption>Zápisník pokusu (posledních 8 měření)</caption><thead><tr><th>Čas / T</th><th>Zbývá</th><th>Teorie</th><th>Odchylka</th></tr></thead><tbody id="mereniBody"></tbody></table><p id="rzZapis" role="status"></p></aside>
    <p class="vysvetlivka">Zaokrouhlený poločas izotopu <b>${iz.n}</b> je ${iz.t} ${iz.jednotka}. Modrá je skutečný
      počet jader v simulaci, oranžová je teoretická křivka. U většího vzorku bývá relativní odchylka menší. Malé tečky označují přeměněná jádra, nikoli zmizelou hmotu.</p>`;

  rzReset();
  $('izotopy').addEventListener('click', e => {
    const b = e.target.closest('button[data-iz]');
    if (!b) return;
    RZ.izotop = +b.dataset.iz;
    RZ.bezi = false;
    rozpad();
  });
  $('btnRZStart').addEventListener('click', () => {
    if (!RZ.bezi && RZ.jadra.every(j => !j.zive)) rzReset();   // po dopadu začínáme znovu
    RZ.bezi = !RZ.bezi;
    $('btnRZStart').textContent = RZ.bezi ? '⏸️ Pauza' : '▶️ Spustit čas';
    if ($('rzHotovo')) $('rzHotovo').textContent = '';
    if (RZ.bezi) rzStart();
  });
  $('btnRZReset').addEventListener('click', () => {
    rzReset();
    RZ.bezi = false;
    $('btnRZStart').textContent = '▶️ Spustit čas';
    $('rzHotovo').textContent = '';
    rzKresli(); rzStavovky();
  });
  $('posRychlost').addEventListener('input', e => {
    RZ.rychlost = +e.target.value;
    $('hodRychlost').textContent = fmt(RZ.rychlost) + '×';
  });
  $('rzSave').onclick = rzZapis;
  $('rzStep').onclick = () => {
    RZ.bezi = false; $('btnRZStart').textContent = '▶️ Spustit čas';
    RZ.t += 1;
    for (const j of RZ.jadra) if (j.zive && Math.random() < .5) j.zive = false;
    RZ.mereni.push([RZ.t, RZ.jadra.filter(j => j.zive).length]);
    rzKresli(); rzStavovky(); rzZapis();
    if (RZ.jadra.every(j => !j.zive)) rzKonec();
  };
  $('hodRychlost').textContent = fmt(RZ.rychlost) + '×';
  rzKresli(); rzStavovky();
  rzStart();
}

function rzStart() {
  if (RZ.animace) cancelAnimationFrame(RZ.animace);
  let posledni = null;
  const krok = t => {
    if (!$('plátnoRZ')) { RZ.animace = null; return; }
    if (posledni === null) posledni = t;
    const dt = Math.min(0.05, (t - posledni) / 1000);
    posledni = t;
    if (RZ.bezi && !document.hidden) {
      RZ.t += dt * RZ.rychlost * 0.5;              // 1 poločas ≈ 2 s při rychlosti 1×
      // pravděpodobnost rozpadu za dt odpovídá poločasu 1
      const p = 1 - Math.pow(0.5, dt * RZ.rychlost * 0.5);
      for (const j of RZ.jadra) if (j.zive && Math.random() < p) j.zive = false;
      const zive = RZ.jadra.filter(j => j.zive).length;
      RZ.mereni.push([RZ.t, zive]);
      if (RZ.mereni.length > 400) RZ.mereni.shift();
      // rozpadlo se poslední jádro – čas nemá dál co měřit, jinak by běžel donekonečna
      if (zive === 0) rzKonec();
    }
    rzKresli(); rzStavovky();
    RZ.animace = requestAnimationFrame(krok);
  };
  RZ.animace = requestAnimationFrame(krok);
}

/* Poslední jádro se rozpadlo: zastavíme čas a řekneme, kdy se to stalo. */
function rzKonec() {
  RZ.bezi = false;
  const iz = IZOTOPY[RZ.izotop];
  if ($('btnRZStart')) $('btnRZStart').textContent = '▶️ Spustit čas';
  if ($('rzHotovo')) {
    $('rzHotovo').className = 'verdikt kriticka';
    $('rzHotovo').innerHTML = `✅ Rozpadla se všechna jádra — trvalo to `
      + `<b>${fmt(RZ.t)}</b> poločasů, tedy asi <b>${fmt(RZ.t * iz.t)} ${iz.jednotka}</b>. `
      + `Teoretická křivka nemá konečný čas úplného rozpadu; okamžik posledního rozpadu v malém vzorku je náhodný.`;
  }
}

function rzKresli() {
  const pl = $('plátnoRZ'), gr = $('plátnoRZG');
  if (!pl || !gr) return;
  const s = getComputedStyle(document.documentElement);
  const barva = n => s.getPropertyValue(n).trim();
  const c = pl.getContext('2d');
  c.clearRect(0, 0, RZ_W, RZ_H);
  for (const j of RZ.jadra) {
    c.beginPath();
    c.arc(j.x, j.y, j.zive ? 5 : 2.5, 0, Math.PI * 2);
    c.fillStyle = j.zive ? barva('--accent') : barva('--border');
    c.fill();
  }

  // graf: naměřeno vs. teorie
  const g = gr.getContext('2d');
  const GW = RZ_W, GH = 150, X0 = 34, Y0 = 122, SIR = GW - X0 - 14, VYS = 100;
  g.clearRect(0, 0, GW, GH);
  // osa se roztáhne podle skutečně uplynulého času, jinak by se konec grafu
  // nalepil na pravý okraj a křivka by tam vypadala jako vodorovná čára
  const maxT = Math.max(5, Math.ceil(RZ.t));
  const X = t => X0 + Math.min(t, maxT) / maxT * SIR;
  const Y = n => Y0 - n / RZ_POCET * VYS;

  g.strokeStyle = barva('--border'); g.lineWidth = 1;
  for (let i = 0; i <= maxT; i++) {
    g.beginPath(); g.moveTo(X(i), 12); g.lineTo(X(i), Y0); g.stroke();
    g.fillStyle = barva('--text-faint'); g.font = '10px sans-serif'; g.textAlign = 'center';
    g.fillText(i + 'T', X(i), Y0 + 14);
  }
  g.strokeStyle = barva('--text-muted'); g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(X0, 12); g.lineTo(X0, Y0); g.lineTo(X0 + SIR, Y0); g.stroke();

  g.strokeStyle = barva('--warn'); g.lineWidth = 2; g.setLineDash([5, 4]);
  g.beginPath();
  for (let t = 0; t <= maxT; t += 0.05) {
    const n = RZ_POCET * Math.pow(0.5, t);
    t ? g.lineTo(X(t), Y(n)) : g.moveTo(X(t), Y(n));
  }
  g.stroke(); g.setLineDash([]);

  g.strokeStyle = barva('--accent'); g.lineWidth = 2.4;
  g.beginPath();
  RZ.mereni.forEach(([t, n], i) => { i ? g.lineTo(X(t), Y(n)) : g.moveTo(X(t), Y(n)); });
  g.stroke();

  g.fillStyle = barva('--text-faint'); g.font = '10px sans-serif'; g.textAlign = 'right';
  g.fillText(String(RZ_POCET), X0 - 4, Y(RZ_POCET) + 4);
  g.fillText('0', X0 - 4, Y0 + 4);
}

function rzStavovky() {
  if (!$('rzZbyva')) return;
  const iz = IZOTOPY[RZ.izotop];
  const zive = RZ.jadra.filter(j => j.zive).length;
  $('rzZbyva').textContent = zive + ' z ' + RZ_POCET;
  $('rzPolocasy').textContent = fmt(RZ.t);
  $('rzCas').textContent = fmt(RZ.t * iz.t) + ' ' + iz.jednotka;
  $('rzTeorie').textContent = Math.round(RZ_POCET * Math.pow(0.5, RZ.t)) + ' jader';
}

/* ============================================================
   3) Elektrárna zblízka – tři okruhy, které se nikdy nemíchají.
   ============================================================ */
const CASTI = {
  reaktor: { nazev: 'Reaktor', text: 'V palivových tyčích probíhá řízené štěpení uranu. Regulační tyče pohlcují neutrony a určují výkon. Vzniklé teplo odvádí voda primárního okruhu.' },
  parogen: { nazev: 'Parogenerátor', text: 'Předává teplo přes stěnu trubek. Voda primárního okruhu díky vysokému tlaku nevaří; voda sekundárního okruhu se mění v páru. V normálním provozu se vody nemísí.' },
  turbina: { nazev: 'Turbína', text: 'Pára roztáčí lopatky turbíny. Tady se tepelná energie mění na pohybovou.' },
  generator: { nazev: 'Generátor', text: 'Pohyb magnetického pole vůči cívkám indukuje elektrické napětí. Generátor mění mechanickou energii otáčení na elektrickou.' },
  kondenzator: { nazev: 'Kondenzátor', text: 'Použitá pára se ochladí zpátky na vodu a putuje znovu do parogenerátoru. Odpadní teplo přebírá terciární okruh.' },
  vez: { nazev: 'Chladicí věž', text: 'Odvádí odpadní teplo do vzduchu. Viditelný bílý oblak tvoří drobné kapky zkondenzované vody. Samotná vodní pára je neviditelná.' },
};
const SCH = { vybrano: 'reaktor', vykon: 70, faze: 0, animace: null };

function rzZapis() {
  const n = RZ.jadra.filter(j => j.zive).length, teorie = RZ_POCET * 2 ** (-RZ.t);
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${fmt(RZ.t)}</td><td>${n}</td><td>${fmt(teorie)}</td><td>${fmt(n-teorie)}</td>`;
  $('mereniBody').append(tr);
  if ($('mereniBody').children.length > 8) $('mereniBody').firstElementChild.remove();
  $('rzZapis').textContent = `Zapsáno: ${fmt(RZ.t)} T, zbývá ${n} jader.`;
}

const DEJ = [
  ['Neutron se blíží', 'Elektricky neutrální neutron může proniknout k jádru. Zde sledujeme jeden možný případ štěpení uranu-235.', '²³⁵₉₂U + ¹₀n'],
  ['Záchyt neutronu', 'Jádro zachytí neutron. Krátce vzniká excitované jádro uranu-236: má stále 92 protonů, ale o jeden neutron více.', '²³⁵₉₂U + ¹₀n → ²³⁶₉₂U*'],
  ['Jádro se štěpí', 'Nestabilní složené jádro se rozdělí na dvě lehčí jádra. Uvolní se energie a v tomto příkladu tři neutrony. Existují i jiné dvojice produktů.', '²³⁶₉₂U* → ¹⁴¹₅₆Ba + ⁹²₃₆Kr + 3 ¹₀n + energie'],
  ['Energie a pokračování', 'Produkty štěpení se rychle pohybují. Při srážkách předávají okolí energii a palivo se zahřívá. Nové neutrony mohou vyvolat další štěpení, být pohlceny nebo uniknout.', 'jaderná energie → pohyb částic → teplo']
];
// Jedna časová osa řídí obrázek, popisky i ovladače. Čas je didaktický, ne fyzikální.
const DJ = { t: 0, playing: false, speed: 1, animace: null, lastStage: -1 };
const clamp01 = x => Math.max(0, Math.min(1, x));
const smooth = x => { x=clamp01(x); return x*x*(3-2*x); };
const DJ_STOPS = [0, 1, 2, 3];
function dej() {
  if (DJ.animace) cancelAnimationFrame(DJ.animace);
  Object.assign(DJ, { t: 0, playing: false, animace: null, lastStage: -1 });
  $('plocha').innerHTML = `<div class="zadani uloha-text"><b>Jedno jádro, čtyři okamžiky.</b> Pusť zpomalený děj a sleduj, jak zachycený neutron vyvolá štěpení. Časovou osou se můžeš vrátit ke kterémukoli detailu.</div>
    <div class="laborator fission-lab"><div><svg id="dejObraz" class="nuclear-art" viewBox="0 0 760 440" role="img" aria-label="Animace štěpení uranu"></svg>
    <div class="transport"><button id="dejPlay" class="primary">▶ Přehrát děj</button><button id="dejReplay">↺ Znovu</button><label>Tempo <select id="dejSpeed"><option value="0.5">0,5× pomalu</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
    <label class="timeline-label" for="dejTime">Průběh děje <output id="dejProgress">0 %</output></label><input id="dejTime" class="timeline" type="range" min="0" max="3" step="0.005" value="0" aria-label="Časová osa štěpení">
    <div class="kroky" id="dejKroky">${DEJ.map((d,i)=>`<button data-krok="${i}" aria-label="Krok ${i+1}: ${d[0]}">${i+1}. ${d[0]}</button>`).join('')}</div></div>
    <section class="panel"><div id="dejText" aria-live="polite"></div><div class="kroky"><button id="dejZpet">← Zpět</button><button id="dejDalsi">Další krok →</button></div><div class="particle-key"><span><i class="proton-dot"></i> proton</span><span><i class="neutron-dot"></i> neutron</span></div><p class="vysvetlivka">Silně zpomaleno. Velikosti, rychlosti ani počet nakreslených nukleonů nejsou v měřítku. Nukleony se při tomto ději zachovávají.</p><details><summary>Jak číst zápis jádra?</summary>Horní číslo A je počet nukleonů, dolní Z počet protonů. Hvězdička označuje excitované jádro.</details></section></div>
    <div class="rovnice" id="dejRovnice"></div><aside class="pokus"><b>Ověř zákony zachování</b><p>Vzniknou Ba-141, Kr-92 a 3 neutrony. Kolik nukleonů je na každé straně rovnice?</p><div class="kroky" id="bilance"><button data-n="235">235</button><button data-n="236">236</button><button data-n="239">239</button></div><p id="bilanceText" role="status"></p></aside>${produktyPanel()}`;
  $('dejObraz').innerHTML = `<defs>
    <radialGradient id="djProton" cx="30%" cy="25%"><stop stop-color="#ffdbac"/><stop offset=".42" stop-color="#ed8b63"/><stop offset="1" stop-color="#a8393e"/></radialGradient>
    <radialGradient id="djNeutron" cx="30%" cy="25%"><stop stop-color="#e1faff"/><stop offset=".4" stop-color="#77d8ef"/><stop offset="1" stop-color="#287894"/></radialGradient>
    <radialGradient id="djHeat"><stop stop-color="#f7c566" stop-opacity=".5"/><stop offset="1" stop-color="#f7c566" stop-opacity="0"/></radialGradient>
    <pattern id="djGrid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="var(--border)" stroke-opacity=".3"/></pattern>
    </defs><rect width="760" height="440" fill="url(#djGrid)" rx="18"/>
    <text x="24" y="32" class="art-eyebrow">MIKROSVĚT · ZPOMALENÝ DĚJ</text>
    <path d="M50 215H352" stroke="var(--border-strong)" stroke-width="2" stroke-dasharray="5 8"/>
    <circle id="djHeatHalo" cx="385" cy="215" r="170" fill="url(#djHeat)" opacity="0"/>
    <g id="djNucleons">${Array.from({length:46},(_,i)=>`<circle r="${7.5+(i%3)*.5}" fill="url(#${i%5<2?'djProton':'djNeutron'})" stroke="var(--bg-deep)" stroke-width=".7"/>`).join('')}</g>
    <g id="djIncident"><path d="M-45 0H-12" stroke="#77d8ef" stroke-width="3" opacity=".6"/><circle r="9" fill="url(#djNeutron)"/><text x="0" y="-23" text-anchor="middle" class="art-label">neutron</text></g>
    <g id="djOutgoing">${[0,1,2].map(i=>`<g data-out="${i}"><path stroke="#77d8ef" stroke-width="3" opacity=".7"/><circle r="8" fill="url(#djNeutron)"/></g>`).join('')}</g>
    <g id="djWaves" fill="none" stroke="#eeb75a" stroke-width="2"><circle cx="385" cy="215"/><circle cx="385" cy="215"/></g>
    <text id="djParent" x="385" y="322" text-anchor="middle" class="art-big">U-235</text>
    <text id="djBa" text-anchor="middle" class="art-big">Ba-141</text><text id="djKr" text-anchor="middle" class="art-big">Kr-92</text>
    <text id="djEnergy" x="380" y="405" text-anchor="middle" class="art-label">Pohyb produktů štěpení → zahřívání paliva</text>
    <text id="djCaption" x="24" y="66" class="art-label"></text>`;
  DJ.dots=[...$('djNucleons').children];
  $('dejKroky').onclick=e=>{const b=e.target.closest('[data-krok]');if(b)dejSeek(+b.dataset.krok);};
  $('dejZpet').onclick=()=>dejSeek(Math.max(0,Math.ceil(DJ.t)-1));
  $('dejDalsi').onclick=()=>dejSeek(Math.min(3,Math.floor(DJ.t)+1));
  $('dejTime').oninput=e=>dejSeek(+e.target.value);
  $('dejSpeed').value=String(DJ.speed);$('dejSpeed').onchange=e=>DJ.speed=+e.target.value;
  $('dejPlay').onclick=()=>{if(DJ.t>=3)DJ.t=0;DJ.playing=!DJ.playing;dejPlayLabel();};
  $('dejReplay').onclick=()=>{DJ.t=0;DJ.lastStage=-1;DJ.playing=true;dejPlayLabel();dejKresli();};
  $('bilance').onclick=e=>{const b=e.target.closest('[data-n]');if(!b)return;$('bilanceText').textContent=+b.dataset.n===236?'Správně: 235 + 1 = 141 + 92 + 3 = 236. Také protony souhlasí: 92 = 56 + 36.':'Připočti i přilétající neutron. Na pravé straně sečti obě jádra a tři volné neutrony. Zkus to znovu.';};
  produktyInit();
  dejKresli();
  let last=null;
  const frame=t=>{if(!$('dejObraz')){DJ.animace=null;return;}const dt=last===null?0:Math.min(.05,(t-last)/1000);last=t;if(DJ.playing&&!document.hidden){DJ.t=Math.min(3,DJ.t+dt*DJ.speed/3.5);dejKresli();if(DJ.t===3){DJ.playing=false;dejPlayLabel();}}DJ.animace=requestAnimationFrame(frame);};
  DJ.animace=requestAnimationFrame(frame);
}
function dejPlayLabel(){if($('dejPlay')){$('dejPlay').textContent=DJ.playing?'⏸ Pozastavit':DJ.t>=3?'▶ Přehrát znovu':'▶ Přehrát děj';$('dejPlay').setAttribute('aria-pressed',String(DJ.playing));}}
function dejSeek(t){DJ.t=t;DJ.playing=false;dejPlayLabel();dejKresli();}
function dejKresli(){
  const t=DJ.t, sep=smooth((t-1.35)/.65), travel=smooth(t-2), wobble=Math.sin(t*55)*Math.sin(Math.PI*clamp01((t-.85)/.75))*4;
  // Rozložení obou budoucích fragmentů se plynule oddělí bez výměny obrázků.
  DJ.dots.forEach((dot,i)=>{
    const initialR=Math.sqrt((i+.5)/46)*66, angle=i*2.39996;
    const group=i<28?0:1,j=group?i-28:i,count=group?18:28;
    const r=Math.sqrt((j+.5)/count)*(group?36:45), a=j*2.39996;
    const cx=group?455+travel*70:294-travel*54,cy=group?270+travel*15:153-travel*9;
    const x=(385+Math.cos(angle)*initialR*(1+.22*Math.sin(Math.PI*clamp01(t-1)))+wobble)*(1-sep)+(cx+Math.cos(a)*r)*sep;
    const y=(215+Math.sin(angle)*initialR*(1-.18*Math.sin(Math.PI*clamp01(t-1))))*(1-sep)+(cy+Math.sin(a)*r)*sep;
    dot.setAttribute('cx',x);dot.setAttribute('cy',y);
  });
  $('djIncident').setAttribute('transform',`translate(${76+smooth(t)*300} 215)`);$('djIncident').setAttribute('opacity',1-smooth((t-.88)/.12));
  $('djOutgoing').setAttribute('opacity',sep);
  [...$('djOutgoing').children].forEach((g,i)=>{const ends=[[675,95],[693,222],[665,339]],f=clamp01((t-1.4)/1.6);const x=385+(ends[i][0]-385)*f,y=215+(ends[i][1]-215)*f;g.querySelector('circle').setAttribute('cx',x);g.querySelector('circle').setAttribute('cy',y);g.querySelector('path').setAttribute('d',`M${x-(ends[i][0]-385)*.10*f} ${y-(ends[i][1]-215)*.10*f}L${x} ${y}`);});
  $('djHeatHalo').setAttribute('opacity',sep*.7);$('djWaves').setAttribute('opacity',sep*(1-travel)*.5);
  [...$('djWaves').children].forEach((c,i)=>c.setAttribute('r',80+sep*110+i*25));
  $('djParent').setAttribute('opacity',1-smooth(sep*3));$('djParent').textContent=t<.97?'U-235':'U-236*';
  for(const [id,x,y] of [['djBa',294-travel*54,221-travel*9],['djKr',455+travel*70,330+travel*15]]){$(id).setAttribute('x',x);$(id).setAttribute('y',y);$(id).setAttribute('opacity',smooth((sep-.65)/.35));}
  $('djEnergy').setAttribute('opacity',travel);
  $('dejTime').value=t;$('dejTime').setAttribute('aria-valuetext',`${Math.round(t/3*100)} procent průběhu`);$('dejProgress').textContent=Math.round(t/3*100)+' %';
  const k=t<.97?0:t<1.35?1:t<2.75?2:3;
  if(DJ.lastStage!==k){DJ.lastStage=k;const [title,desc,equation]=DEJ[k];$('dejText').innerHTML=`<span class="eyebrow">Okamžik ${k+1} ze 4</span><h2>${title}</h2><p>${desc}</p>`;$('dejRovnice').textContent=equation;$('djCaption').textContent=title;$('dejObraz').setAttribute('aria-label',title+'. '+desc);document.querySelectorAll('[data-krok]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.krok===k)));}
  $('dejZpet').disabled=t<=0;$('dejDalsi').disabled=t>=3;
}

function schema(){
  SCH.paused=omezenyPohyb();SCH.faze=0;SCH.loop='all';
  $('plocha').innerHTML=`<div class="zadani uloha-text"><b>Sleduj cestu energie.</b> V podélném řezu tlakovodní elektrárnou uvidíš palivo, výměníky i rotující stroje. Vyber součást nebo si zvýrazni jeden okruh.</div>
  <div class="plant-tools transport"><button id="schPause">${SCH.paused?'▶ Spustit pohyb':'⏸ Zastavit pohyb'}</button><button id="schZoom" aria-pressed="false">⊕ Zvětšit schéma</button><span class="vysvetlivka">Na malé obrazovce lze zvětšený obrázek posouvat.</span></div>
  <div class="scene-shell plant-viewport" id="schViewport" tabindex="0" role="region" aria-label="Schéma elektrárny, po zvětšení lze posouvat do stran"><svg class="plant-art" id="scenaSch" viewBox="0 0 1040 580" role="group" aria-label="Tlakovodní elektrárna: reaktor, parogenerátor, turbína, generátor, kondenzátor a chladicí věž"></svg></div>
  <div class="transport loop-tools" id="schLoops" role="group" aria-label="Zvýraznění okruhů"><button data-loop="all" aria-pressed="true">Všechny okruhy</button><button data-loop="primary" aria-pressed="false">① Primární · voda</button><button data-loop="secondary" aria-pressed="false">② Sekundární · pára / voda</button><button data-loop="cooling" aria-pressed="false">③ Chladicí · voda</button></div>
  <div class="kroky" id="castiTlacitka">${Object.entries(CASTI).map(([id,c],i)=>`<button data-cast="${id}">${i+1}. ${c.nazev}</button>`).join('')}</div>
  <div class="plant-panels"><section class="panel"><div id="popisCasti" aria-live="polite"></div><div class="kroky"><button id="schDalsi">Další část →</button></div><p id="schLoopText" class="vysvetlivka">Částice v potrubí ukazují směr proudění. Při přenosu tepla mezi okruhy se voda za normálního provozu nemísí.</p></section>
  <section class="panel"><label for="posVykon">Modelový výkon <b id="hodVykon"></b></label><input class="timeline" type="range" id="posVykon" min="0" max="100" step="5" value="${SCH.vykon}"><div id="schBilance"></div><p class="vysvetlivka">Účinnost přibližně 33 %. Srovnáváme ustálené stavy. Rychlost animace znázorňuje výkon, nikoli skutečné otáčky stroje. Odstavení ani nutné odvádění zbytkového tepla tento model neřeší.</p></section></div>
  <aside class="pokus"><b>Předpověz: dostane se voda z reaktoru do turbíny?</b><div class="kroky"><button id="schAno">Ano, stejným potrubím</button><button id="schNe">Ne, předává jen teplo</button></div><p id="schOdpoved" role="status"></p></aside>`;
  $('posVykon').oninput=e=>{SCH.vykon=+e.target.value;schBilance();schFrame();};
  $('castiTlacitka').onclick=e=>{const b=e.target.closest('[data-cast]');if(b)schVyber(b.dataset.cast);};
  $('schDalsi').onclick=()=>{const keys=Object.keys(CASTI);schVyber(keys[(keys.indexOf(SCH.vybrano)+1)%keys.length]);};
  $('schPause').onclick=()=>{SCH.paused=!SCH.paused;$('schPause').textContent=SCH.paused?'▶ Spustit pohyb':'⏸ Zastavit pohyb';$('schPause').setAttribute('aria-pressed',String(SCH.paused));};
  $('schZoom').onclick=()=>{const zoom=$('schViewport').classList.toggle('zoomed');$('schZoom').setAttribute('aria-pressed',String(zoom));$('schZoom').textContent=zoom?'⊖ Celé schéma':'⊕ Zvětšit schéma';};
  $('schLoops').onclick=e=>{const b=e.target.closest('[data-loop]');if(b){SCH.loop=b.dataset.loop;schLoop();}};
  $('schAno').onclick=()=>{$('schOdpoved').textContent='Sleduj červený okruh: vrací se do reaktoru. Od druhého okruhu jej odděluje stěna trubek v parogenerátoru. Zkus odpovědět znovu.';};
  $('schNe').onclick=()=>{$('schOdpoved').textContent='Správně. Do druhého okruhu přechází teplo přes stěnu výměníku. V normálním provozu se obě vody nemísí.';};
  schKresli();schAnimuj();
}
function schKresli(){
  const group=(id,shape,inside)=>`<g class="dil" data-dil="${id}" role="button" tabindex="0" aria-label="${CASTI[id].nazev}" aria-pressed="false">${shape}${inside}</g>`;
  const label=(x,y,n,name)=>`<g class="device-label"><circle cx="${x}" cy="${y}" r="12"/><text x="${x}" y="${y+5}" text-anchor="middle" class="number">${n}</text><text x="${x+19}" y="${y+5}">${name}</text></g>`;
  const path=(id,d,color,loop)=>`<g data-circuit="${loop}"><path d="${d}" fill="none" stroke="var(--bg-deep)" stroke-width="13" stroke-linejoin="round"/><path id="${id}" d="${d}" fill="none" stroke="${color}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><g data-flow="${id}">${Array.from({length:12},()=>`<circle r="3" fill="${color}" stroke="var(--bg-deep)" stroke-width=".6"/>`).join('')}</g></g>`;
  $('scenaSch').innerHTML=`<defs>
    <linearGradient id="schMetal"><stop stop-color="#506875"/><stop offset=".4" stop-color="#b2c7d0"/><stop offset=".65" stop-color="#8da7b6"/><stop offset="1" stop-color="#405866"/></linearGradient>
    <linearGradient id="schWater" x2="0" y2="1"><stop stop-color="#79b8dd" stop-opacity=".1"/><stop offset="1" stop-color="#459dd3" stop-opacity=".45"/></linearGradient>
    <linearGradient id="schTower"><stop stop-color="#647c88"/><stop offset=".45" stop-color="#bdd0d6"/><stop offset="1" stop-color="#647c88"/></linearGradient>
    <radialGradient id="schGlow"><stop stop-color="#ffb765" stop-opacity=".65"/><stop offset="1" stop-color="#e99f43" stop-opacity="0"/></radialGradient>
    <pattern id="schGrid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="var(--border)" stroke-opacity=".2"/></pattern>
    </defs><rect width="1040" height="580" fill="url(#schGrid)"/>
    <path d="M30 467V178C30 42 423 42 423 178V467Z" fill="var(--accent-soft)" stroke="var(--border-strong)" stroke-width="3"/>
    <path d="M42 462V178C42 60 411 60 411 178" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="6 7"/>
    <text x="65" y="55" class="art-eyebrow">REAKTOROVÁ BUDOVA · OCHRANNÁ OBÁLKA</text>
    <path d="M22 480H1015" stroke="var(--border-strong)" stroke-width="5"/>
    <path d="M475 164H819V309H475Z" fill="var(--bg-elevated)" stroke="var(--border)"/>
    <text x="549" y="147" class="art-eyebrow">STROJOVNA</text>
    ${group('reaktor','<path class="obrys equipment" d="M90 263Q90 242 143 242Q196 242 196 263V386Q196 418 143 418Q90 418 90 386Z"/>',`
    <path d="M102 271H184V383Q184 405 143 405Q102 405 102 383Z" fill="url(#schWater)"/>
    <ellipse id="schCoreGlow" cx="143" cy="346" rx="52" ry="62" fill="url(#schGlow)"/>
    ${[0,1,2,3,4].map(i=>`<rect x="${112+i*13}" y="309" width="8" height="78" rx="3" fill="#d1a16a" stroke="#96683e"/>`).join('')}
    ${[0,1,2,3].map(i=>`<path d="M${122+i*13} 220V351" stroke="#9fb7c7" stroke-width="4"/>`).join('')}
    <path d="M113 220H175" stroke="#9fb7c7" stroke-width="6"/><ellipse cx="143" cy="256" rx="51" ry="13" fill="none" stroke="#c1d6df" stroke-width="2"/>
    `)}
    ${group('parogen','<rect class="obrys equipment" x="300" y="170" width="87" height="245" rx="39"/>',`
    <path d="M310 267H377V367Q377 402 344 402Q310 402 310 367Z" fill="url(#schWater)"/>
    <path d="M313 267Q323 259 333 267T353 267T373 267" fill="none" stroke="#83bfdc" stroke-width="2"/>
    <g id="schBubbles">${[0,1,2,3,4,5].map(i=>`<circle cx="${318+(i%3)*23}" cy="${245-i*9}" r="${3+i%3}" fill="none" stroke="#a2d3e8"/>`).join('')}</g>
    `)}
    ${group('turbina','<path class="obrys equipment" d="M496 195L616 177V280L496 262Z"/>',`
    <path d="M503 229H622" stroke="#d9cda5" stroke-width="7"/>
    ${[0,1,2,3,4,5].map(i=>`<g class="turbine-blade" data-blade="${i}"><path d="M${510+i*17} ${201-i*3}L${516+i*17} ${256+i*3}" stroke="#d0e0e5" stroke-width="5"/><path d="M${516+i*17} ${201-i*3}L${510+i*17} ${256+i*3}" stroke="#526b79" stroke-width="3"/></g>`).join('')}
    <path d="M505 265V280M605 282V295" stroke="#728b98" stroke-width="8"/>`)}
    <path d="M617 229H670" stroke="#d7b458" stroke-width="9"/><path d="M618 229H668" stroke="#ffe1a0" stroke-width="2"/>
    ${group('generator','<rect class="obrys equipment" x="669" y="188" width="119" height="81" rx="29"/>',`
    <ellipse cx="728" cy="229" rx="30" ry="30" fill="#2c495d" stroke="#bfdae0" stroke-width="2"/>
    <g id="schRotor" transform="rotate(0 728 229)"><path d="M728 201V257M700 229H756" stroke="#deae67" stroke-width="10"/><circle cx="728" cy="229" r="10" fill="#c9dbe0"/></g>
    <path d="M691 270V283M766 270V283" stroke="#728b98" stroke-width="8"/>`)}
    ${group('kondenzator','<rect class="obrys equipment" x="489" y="359" width="145" height="85" rx="17"/>',`
    <rect x="499" y="409" width="125" height="25" rx="5" fill="url(#schWater)"/>
    <g id="schCondense">${[0,1,2,3,4].map(i=>`<path d="M${511+i*23} 375q-5 8 0 10q5-2 0-10" fill="#a6d8ee"/>`).join('')}</g>`)}
    ${group('vez','<path class="obrys tower-body" d="M875 245Q901 323 863 443H998Q962 323 987 245Z"/>',`
    <ellipse cx="931" cy="245" rx="56" ry="12" fill="#56737f" stroke="#9fb6bf" stroke-width="2"/>
    <path d="M882 428H980M888 414H975M893 400H970" stroke="#688891" stroke-width="2"/>
    ${[0,1,2,3,4,5].map(i=>`<path d="M${875+i*22} 431V455" stroke="#9bb5bf" stroke-width="7"/>`).join('')}
    <rect x="860" y="452" width="141" height="12" rx="3" fill="#589eaf"/>
    <g id="schRain">${[0,1,2,3,4,5,6].map(i=>`<path d="M${893+i*12} 368v9" stroke="#78d1d4" stroke-width="2"/>`).join('')}</g>`)}
    <g id="schCloud" fill="var(--text-muted)">${[0,1,2,3,4].map(i=>`<ellipse data-cloud="${i}" cx="${917+(i%2)*24}" cy="${213-i*15}" rx="${24+i*6}" ry="${12+i*3}" opacity="${.18-i*.022}"/>`).join('')}</g>
    <text x="932" y="126" class="art-label" text-anchor="middle">teplo do okolí ↑</text>
    ${path('schPrimary','M180 288H273V293H332V370Q332 385 344 385Q356 385 356 370V310Q356 298 367 298V405H247V388H183V288','#ed8b71','primary')}
    ${path('schSteam','M343 174V119H468V203H508V247H553V359','#89c8ed','secondary')}
    ${path('schReturn','M552 444V470H437V436H375V395','#509bea','secondary')}
    ${path('schCooling','M885 451H669V397H506V419H694V345H930V385','#61c9bd','cooling')}
    <g data-circuit="secondary"><path d="M375 395V269Q353 260 343 232V174" fill="none" stroke="#77bde6" stroke-width="2" stroke-dasharray="4 7" opacity=".5"/></g>
    <g data-circuit="cooling"><path d="M930 385V451H885" fill="none" stroke="#61c9bd" stroke-width="2" stroke-dasharray="4 7" opacity=".5"/></g>
    <g data-circuit="electric"><path id="schPower" d="M788 229H822V86H1003" fill="none" stroke="#e3b956" stroke-width="4"/>
    <path d="M858 44L841 65H853L844 79L869 55H857L865 44" fill="none" stroke="#c6a65d" stroke-width="3"/><text x="1000" y="72" text-anchor="end" class="art-label">do sítě →</text><circle id="schSpark" r="5" fill="#ffdf89"/></g>
    <circle cx="250" cy="405" r="14" fill="#728c9a" stroke="#bdcfd7" stroke-width="2"/><path d="M245 397L259 405L245 413Z" fill="#d5e8f2"/>
    <circle cx="437" cy="456" r="12" fill="#728c9a" stroke="#bdcfd7" stroke-width="2"/>
    ${label(89,451,1,'reaktor')}${label(283,146,2,'parogenerátor')}${label(501,313,3,'turbína')}${label(675,313,4,'generátor')}${label(496,506,5,'kondenzátor')}${label(852,506,6,'chladicí věž')}
    <text x="172" y="276" class="pipe-label">horká voda →</text><text x="375" y="100" class="pipe-label">pára →</text><text x="285" y="458" class="pipe-label">← voda zpět</text>
    <g class="energy-chain"><text x="54" y="556">jaderná energie</text><text x="266" y="556">→ teplo</text><text x="439" y="556">→ otáčení turbíny</text><text x="708" y="556">→ elektřina</text></g>`;
  // Trasy i pohyblivé značky se uloží jednou; během animace se DOM nepřestavuje.
  SCH.flows=[...$('scenaSch').querySelectorAll('[data-flow]')].map(g=>{const path=$(g.dataset.flow);return {path,length:path.getTotalLength(),dots:[...g.children]};});
  SCH.powerPath=$('schPower');SCH.powerLength=SCH.powerPath.getTotalLength();
  document.querySelectorAll('#scenaSch .dil').forEach(g=>{g.onclick=()=>schVyber(g.dataset.dil);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();schVyber(g.dataset.dil);}};});
  // Potrubí nesmí přebírat kliknutí na zařízení pod ním.
  document.querySelectorAll('#scenaSch [data-circuit]').forEach(g=>g.style.pointerEvents='none');
  schBilance();schVyber(SCH.vybrano);schLoop();schFrame();
}
function schVyber(id){SCH.vybrano=id;document.querySelectorAll('#scenaSch .dil').forEach(g=>{g.classList.toggle('zap',g.dataset.dil===id);g.setAttribute('aria-pressed',String(g.dataset.dil===id));});document.querySelectorAll('[data-cast]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cast===id)));const c=CASTI[id];$('popisCasti').innerHTML=`<span class="eyebrow">Zařízení ${Object.keys(CASTI).indexOf(id)+1} ze 6</span><h2>${c.nazev}</h2><p>${c.text}</p>`;}
function schLoop(){document.querySelectorAll('[data-loop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.loop===SCH.loop)));document.querySelectorAll('[data-circuit]').forEach(g=>g.setAttribute('opacity',SCH.loop==='all'||g.dataset.circuit===SCH.loop?1:.13));const descriptions={all:'Částice v potrubí ukazují směr proudění. Okruhy si předávají teplo, jejich voda se za normálního provozu nemísí.',primary:'① Primární okruh: voda pod tlakem proudí z reaktoru trubkami parogenerátoru a vrací se zpět. Nevaří. Červená barva označuje samostatný okruh, nikoli plamen.',secondary:'② Sekundární okruh: pára z parogenerátoru roztáčí turbínu. V kondenzátoru se mění na vodu a čerpadlo ji vrací do parogenerátoru.',cooling:'③ Chladicí okruh: voda přebírá odpadní teplo v trubkách kondenzátoru a odvádí je do chladicí věže. Nemísí se s párou z turbíny.'};$('schLoopText').textContent=descriptions[SCH.loop];}
function schBilance(){const heat=SCH.vykon*30,electric=heat/3;$('hodVykon').textContent=SCH.vykon+' %';$('schBilance').innerHTML=`<div class="energy-stats"><div><span>Teplo z reaktoru</span><b>${fmt(heat)} MW</b></div><div><span>Elektřina do sítě</span><b>${fmt(electric)} MW</b></div><div><span>Teplo do okolí</span><b>${fmt(heat-electric)} MW</b></div></div><div class="tok" role="img" aria-label="Přibližně třetina tepla se mění na elektřinu"><span style="width:33.333%"></span><span style="width:66.667%"></span></div>`;}
function schFrame(){
  const t=SCH.faze,v=SCH.vykon/100;
  SCH.flows.forEach(({path,length,dots})=>dots.forEach((dot,i)=>{const p=path.getPointAtLength((i/dots.length*length+t*54)%length);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('opacity',v>0?1:0);}));
  $('schRotor').setAttribute('transform',`rotate(${t*130%360} 728 229)`);
  document.querySelectorAll('.turbine-blade').forEach((g,i)=>{const sx=.3+.7*Math.abs(Math.cos(t*4+i*.5)),x=513+i*17;g.setAttribute('transform',`translate(${x} 0) scale(${sx} 1) translate(${-x} 0)`);});
  $('schCoreGlow').setAttribute('opacity',v*(.8+.2*Math.sin(t*3)));
  [...$('schBubbles').children].forEach((c,i)=>{c.setAttribute('cy',265-(t*22+i*17)%70);c.setAttribute('opacity',v*.8);});
  [...$('schCondense').children].forEach((p,i)=>{p.setAttribute('transform',`translate(0 ${(t*25+i*5)%24})`);p.setAttribute('opacity',v*.85);});
  [...$('schCloud').children].forEach((e,i)=>{e.setAttribute('transform',`translate(${Math.sin(t*.6+i)*8} ${-((t*5+i*3)%18)})`);e.setAttribute('opacity',v*(.2-i*.025));});
  $('schRain').setAttribute('transform',`translate(0 ${t*28%24})`);$('schRain').setAttribute('opacity',v);
  const p=SCH.powerPath.getPointAtLength(t*85%SCH.powerLength);$('schSpark').setAttribute('cx',p.x);$('schSpark').setAttribute('cy',p.y);$('schSpark').setAttribute('opacity',v>0?1:0);
}
function schAnimuj(){if(SCH.animace)cancelAnimationFrame(SCH.animace);let last=null;const frame=t=>{if(!$('scenaSch')){SCH.animace=null;return;}const dt=last===null?0:Math.min(.05,(t-last)/1000);last=t;if(!SCH.paused&&!document.hidden&&SCH.vykon>0){SCH.faze+=dt*SCH.vykon/100;schFrame();}SCH.animace=requestAnimationFrame(frame);};SCH.animace=requestAnimationFrame(frame);}

function svgStepeni() {
  return `<svg class="schema" viewBox="0 0 360 180">
    <defs><marker id="hrot2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6"
      orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--text-muted)"/></marker></defs>
    <circle class="neutron" cx="30" cy="90" r="7"/>
    <line class="sipka" x1="42" y1="90" x2="95" y2="90"/>
    <circle class="jadro" cx="130" cy="90" r="28"/>
    <text class="popis" x="130" y="140">jádro U-235</text>
    <circle class="jadro" cx="250" cy="50" r="18"/>
    <circle class="jadro" cx="250" cy="130" r="16"/>
    <line class="sipka" x1="160" y1="80" x2="222" y2="55"/>
    <line class="sipka" x1="160" y1="100" x2="222" y2="126"/>
    <circle class="neutron" cx="300" cy="30" r="6"/>
    <circle class="neutron" cx="315" cy="90" r="6"/>
    <circle class="neutron" cx="300" cy="150" r="6"/>
    <text class="popis" x="300" y="172">nové neutrony</text>
  </svg>`;
}
const STEPENI = [
  { q: 'Co spustí štěpení jádra uranu 235?', a: 'zásah neutronem', b: ['zahřátí na 100 °C', 'elektrický proud', 'sluneční světlo'] },
  { q: 'Co vzniká při štěpení kromě energie?', a: 'lehčí jádra a další neutrony', b: ['jen teplo', 'kyslík', 'elektrony a světlo'] },
  { q: 'Co je řetězová reakce?', a: 'uvolněné neutrony štěpí další jádra a děj pokračuje sám', b: ['reakce probíhající v řadě zkumavek', 'spalování uhlí', 'rozpad atomu na elektrony'] },
  { q: 'Čím se v reaktoru řídí rychlost reakce?', a: 'regulačními tyčemi, které pohlcují neutrony', b: ['přidáváním kyslíku', 'chlazením vzduchem', 'zvyšováním tlaku'] },
  { q: 'Co je moderátor v reaktoru?', a: 'látka zpomalující neutrony, aby lépe štěpily jádra', b: ['zesilovač reakce', 'druh paliva', 'ochranný obal'] },
  { q: 'Odkud se v jaderné elektrárně bere teplo?', a: 'z energie uvolněné při štěpení jader', b: ['ze spalování plynu', 'z tření turbíny', 'ze slunečního záření'] },
  { q: 'Co je jaderná fúze?', a: 'slučování lehkých jader, které pohání Slunce', b: ['štěpení těžkých jader', 'rozpad neutronu', 'chlazení reaktoru'] },
  { q: 'Proč je uran označovaný jako U-235 zvláštní?', a: 'jde o izotop, který se snadno štěpí pomalými neutrony', b: ['je nejlehčí', 'nevyzařuje energii', 'je to plyn'] },
];
function stepeni() {
  const p = $('plocha');
  const u = Uloha.nahodne(STEPENI);
  p.innerHTML = `<div class="zadani uloha-text">${u.q}</div>
    <div class="karta">${svgStepeni()}</div>`;
  const odezva = odezvaEl();
  Uloha.vyber({
    kam: p, odezva,
    moznosti: Uloha.zamichej([u.a, ...u.b]).map(t => ({ klic: t, popis: t })),
    spravnyKlic: u.a,
    zpravaOk: `✅ ${u.a}`,
    zpravaChyba: 'Sleduj schéma: neutron zasáhne jádro, to se rozpadne a uvolní další neutrony.',
    poSpravne: skore.vyhodnot,
    dalsi: novaUloha,
  });
  p.appendChild(odezva);
}

const IZOTOPY = [
  { n: 'jod-131', t: 8, jednotka: 'dní' },
  { n: 'kobalt-60', t: 5.27, jednotka: 'let' },
  { n: 'cesium-137', t: 30, jednotka: 'let' },
  { n: 'uhlík-14', t: 5730, jednotka: 'let' },
];
function svgPolocas(pocetPolocasu) {
  let body = [];
  for (let i = 0; i <= 4; i += 0.1) body.push(`${30 + i * 70} ${160 - 120 * Math.pow(0.5, i)}`);
  let mrizka = '';
  for (let i = 0; i <= 4; i++) {
    mrizka += `<line class="mrizka" x1="${30 + i * 70}" y1="20" x2="${30 + i * 70}" y2="160"/>
      <text class="popis" x="${30 + i * 70}" y="176">${i}T</text>`;
  }
  return `<svg class="graf" viewBox="0 0 340 190">
    ${mrizka}
    <line class="osy" x1="30" y1="12" x2="30" y2="160"/>
    <line class="osy" x1="24" y1="160" x2="330" y2="160"/>
    <path class="krivka" d="M${body.join(' L')}"/>
    <circle cx="${30 + pocetPolocasu * 70}" cy="${160 - 120 * Math.pow(0.5, pocetPolocasu)}" r="6" fill="var(--warn)"/>
    <text class="popis" x="16" y="30">100 %</text>
  </svg>`;
}
function polocas() {
  const p = $('plocha');
  const iz = Uloha.nahodne(IZOTOPY);
  const n = Uloha.nahodneCislo(1, 4);
  const zbyva = 100 / Math.pow(2, n);
  const typ = Uloha.nahodne(['kolikZbude', 'jakDlouho', 'co']);
  let zadani, spravny, jine;

  if (typ === 'kolikZbude') {
    zadani = `Poločas rozpadu izotopu <b>${iz.n}</b> je ${iz.t} ${iz.jednotka}.
      Kolik procent původního množství zbude po <b>${fmt(n * iz.t)} ${iz.jednotka}</b>?`;
    spravny = fmt(zbyva) + ' %';
    jine = [fmt(100 / (n + 1)) + ' %', fmt(100 - n * 25) + ' %', fmt(zbyva * 2) + ' %'];
  } else if (typ === 'jakDlouho') {
    zadani = `Za jak dlouho zbude z izotopu <b>${iz.n}</b> jen <b>${fmt(zbyva)} %</b>?
      (poločas rozpadu je ${iz.t} ${iz.jednotka})`;
    spravny = fmt(n * iz.t) + ' ' + iz.jednotka;
    jine = [fmt(iz.t) + ' ' + iz.jednotka, fmt(n * iz.t * 2) + ' ' + iz.jednotka, fmt(iz.t / n) + ' ' + iz.jednotka];
  } else {
    zadani = 'Co znamená poločas rozpadu?';
    spravny = 'doba, za kterou se rozpadne polovina jader';
    jine = ['doba, za kterou se rozpadnou všechna jádra', 'polovina života reaktoru', 'čas do výbuchu'];
  }

  p.innerHTML = `<div class="zadani uloha-text">${zadani}</div>
    <div class="karta">${svgPolocas(n)}</div>`;
  const odezva = odezvaEl();
  Uloha.vyber({
    kam: p, odezva, trida: typ === 'co' ? '' : 'velke',
    moznosti: Uloha.zamichej([spravny, ...new Set(jine.filter(x => x !== spravny))]).map(t => ({ klic: t, popis: t })),
    spravnyKlic: spravny,
    zpravaOk: `✅ ${spravny}` + (typ !== 'co' ? ` – po každém poločasu zbude polovina: 100 → 50 → 25 → 12,5 %.` : ''),
    zpravaChyba: 'Každý poločas znamená vydělit množství dvěma, ne odečíst pevnou část.',
    poSpravne: skore.vyhodnot,
    dalsi: novaUloha,
  });
  p.appendChild(odezva);
}

const ELEKTRARNA = [
  { q: 'Co se v jaderné elektrárně děje s teplem z reaktoru?', a: 'ohřívá vodu na páru, která roztáčí turbínu', b: ['přímo vyrábí elektřinu', 'ohřívá domy v okolí jako jediné využití', 'uniká do vzduchu'] },
  { q: 'K čemu slouží chladicí věže?', a: 'odvádějí odpadní teplo; viditelný oblak tvoří drobné kapky vody', b: ['vypouštějí radioaktivní plyn', 'vyrábějí elektřinu', 'chladí palivo v reaktoru přímo'] },
  { q: 'Co je primární okruh?', a: 'uzavřený okruh vody, která odvádí teplo přímo z reaktoru', b: ['okruh s párou pro turbínu', 'rozvodná síť', 'chladicí věž'] },
  { q: 'Které jaderné elektrárny má Česká republika?', a: 'Dukovany a Temelín', b: ['Mělník a Chvaletice', 'Orlík a Slapy', 'Počerady a Tušimice'] },
  { q: 'Jaká je hlavní výhoda jaderné energetiky?', a: 'při výrobě elektřiny neprobíhá spalování a emise CO₂ jsou nízké', b: ['nevzniká žádný odpad', 'palivo je zdarma', 'nepotřebuje chlazení'] },
  { q: 'Jaká je hlavní nevýhoda?', a: 'radioaktivní odpad, který je nutné bezpečně uložit na dlouhou dobu', b: ['nízký výkon', 'nutnost slunečního svitu', 'velké množství popílku'] },
  { q: 'Co chrání okolí reaktoru?', a: 'silný betonový kontejnment a stínění', b: ['plechový plot', 'les kolem elektrárny', 'nic, není potřeba'] },
  { q: 'Proč se v okolí elektráren měří radiace?', a: 'aby se včas zjistil jakýkoli únik', b: ['kvůli počasí', 'kvůli hlučnosti', 'kvůli daním'] },
];
const ZDROJE = [
  { q: 'Který zdroj energie produkuje při provozu nejvíc oxidu uhličitého?', a: 'uhelná elektrárna', b: ['jaderná elektrárna', 'vodní elektrárna', 'větrná elektrárna'] },
  { q: 'Který zdroj je obnovitelný?', a: 'vítr', b: ['uran', 'černé uhlí', 'zemní plyn'] },
  { q: 'Co je nevýhodou solárních a větrných elektráren?', a: 'výkon kolísá podle počasí a denní doby', b: ['produkují hodně emisí', 'potřebují uran', 'vyrábějí radioaktivní odpad'] },
  { q: 'Proč se do energetiky zapojují úložiště energie?', a: 'vyrovnávají rozdíl mezi výrobou a spotřebou', b: ['nahrazují elektrárny', 'zvyšují emise', 'snižují napětí v síti na nulu'] },
  { q: 'Jak dlouho zůstává vyhořelé jaderné palivo nebezpečné?', a: 'obsahuje i dlouhožijící radionuklidy, proto vyžaduje izolaci na velmi dlouhou dobu', b: ['několik dní', 'asi rok', 'není nebezpečné vůbec'] },
  { q: 'Který zdroj má nejmenší nároky na plochu při stejné výrobě?', a: 'jaderná elektrárna', b: ['solární park', 'větrný park', 'biomasa'] },
  { q: 'Co je energetický mix?', a: 'složení zdrojů, ze kterých stát vyrábí elektřinu', b: ['směs paliv v jedné elektrárně', 'druh transformátoru', 'jednotka výkonu'] },
  { q: 'Co nejvíc sníží spotřebu energie v domácnosti?', a: 'zateplení, úsporné spotřebiče a rozumné chování', b: ['zvýšení teploty v bytě', 'svícení celý den', 'nákup většího mrazáku'] },
];
/* Provoz elektrárny a porovnání zdrojů byly dva kvízy bez jediného obrázku;
   spojené do jednoho dávají větší zásobu otázek a uvolnily místo na simulace. */
function provoz() {
  const p = $('plocha');
  const u = Uloha.nahodne([...ELEKTRARNA, ...ZDROJE]);
  p.innerHTML = `<div class="zadani uloha-text">${u.q}</div>`;
  const odezva = odezvaEl();
  Uloha.vyber({
    kam: p, odezva,
    moznosti: Uloha.zamichej([u.a, ...u.b]).map(t => ({ klic: t, popis: t })),
    spravnyKlic: u.a,
    zpravaOk: `✅ ${u.a}`,
    zpravaChyba: 'Reaktor dodává teplo, pára roztáčí turbínu a generátor vyrábí elektřinu. '
      + 'U zdrojů porovnávej emise, spolehlivost a odpad.',
    poSpravne: skore.vyhodnot,
    dalsi: novaUloha,
  });
  p.appendChild(odezva);
}

const REZIMY = { dej, retezovka, rozpad, schema, havarie, stepeni, polocas, provoz };
/* V bádacích režimech se neodpovídá – tlačítko v liště tam znamená „začni znovu“. */
const POPIS_TLACITKA = {
  dej: '↺ Od začátku',
  retezovka: '↺ Nové palivo',
  rozpad: '↺ Nový vzorek',
  schema: '↺ Zpět na reaktor',
  havarie: '↺ Nový havarijní pokus',
};

function novaUloha() {
  Uloha.zrusPosun();
  if (rezim === 'retezovka') { rrReset(); rrKresli(); rrStavovky(); return; }
  if (rezim === 'rozpad') { rzReset(); rzKresli(); rzStavovky(); return; }
  if (rezim === 'schema') { schVyber('reaktor'); return; }
  REZIMY[rezim]();
}

/* Běžící animace se musí zastavit, jinak by kreslily do zahozeného plátna. */
function zastavAnimace() {
  [RR, RZ, SCH, DJ, HAV].forEach(o => { if (o.animace) cancelAnimationFrame(o.animace); o.animace = null; });
  RR.bezi = false; RZ.bezi = false; DJ.playing = false; HAV.playing = false;
}

document.querySelectorAll('#rezimy button').forEach(b => b.addEventListener('click', () => {
  Uloha.zrusPosun();
  document.querySelectorAll('#rezimy button').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
  b.setAttribute('aria-pressed', 'true');
  b.classList.add('active');
  zastavAnimace();
  rezim = b.dataset.rezim;
  $('btnDalsi').textContent = POPIS_TLACITKA[rezim] || 'Přeskočit →';
  REZIMY[rezim]();
}));
$('btnDalsi').textContent = POPIS_TLACITKA[rezim] || 'Přeskočit →';
$('btnDalsi').addEventListener('click', novaUloha);
document.querySelectorAll('#rezimy button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rezim === rezim)));
REZIMY[rezim]();

matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { if (!e.matches) return; HAV.playing=false; if($('havDiagram')) havRender(); DJ.playing=false; RR.paused=true; SCH.paused=true; dejPlayLabel(); if($('rrPause')) $('rrPause').textContent='▶ Pokračovat'; if($('schPause')) $('schPause').textContent='▶ Spustit pohyb'; });
