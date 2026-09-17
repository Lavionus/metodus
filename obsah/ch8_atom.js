'use strict';
const MISSIONS = [
  {name:'1 · Z atomu sodíku kation', start:{z:11,n:12,e:11}, target:{z:11,n:12,e:10}, prompt:'Vytvoř Na⁺ z neutrálního sodíku. Zachovej jeho jádro.', hint:'Kladný náboj vznikne odebráním jednoho elektronu. Protony ani neutrony neměň.'},
  {name:'2 · Z atomu chloru anion', start:{z:17,n:18,e:17}, target:{z:17,n:18,e:18}, prompt:'Vytvoř Cl⁻. Změň pouze elektronový obal.', hint:'Záporný náboj znamená, že elektronů je více než protonů. Přidej jeden elektron.'},
  {name:'3 · Jiný izotop uhlíku', start:{z:6,n:6,e:6}, target:{z:6,n:8,e:6}, prompt:'Sestav neutrální uhlík-14 z uhlíku-12. Které částice se změní?', hint:'A = protony + neutrony. Uhlík má vždy 6 protonů; do 14 chybí 8 neutronů.'},
  {name:'4 · Hořečnatý ion', start:{z:12,n:12,e:12}, target:{z:12,n:12,e:10}, prompt:'Sestav Mg²⁺ z neutrálního hořčíku-24.', hint:'Náboj +2 znamená o dva elektrony méně než protonů: 12 − 10 = 2.'},
  {name:'5 · Rozlušti zápis kyslíku', start:{z:1,n:0,e:1}, target:{z:8,n:10,e:8}, prompt:'Sestav neutrální kyslík-18: Z = 8, A = 18.', hint:'Protonů je Z = 8, neutronů A − Z = 10 a elektronů u neutrálního atomu také 8.'},
  {name:'6 · Stejný obal, jiný prvek', start:{z:10,n:10,e:10}, target:{z:11,n:12,e:10}, prompt:'Z modelu neonu-20 vytvoř model sodíku-23 s nábojem +1. Zachovej počet elektronů. Jde o porovnání modelů, nikoli chemickou reakci.', hint:'Sodík má 11 protonů. Do A = 23 doplň 12 neutronů. Deset elektronů ponech.'}
];
let missionIndex = 0;
let savedAtom = null;
function setupMissions() {
  $('missionSelect').innerHTML = MISSIONS.map((m,i)=>`<option value="${i}">${m.name}</option>`).join('');
  $('missionSelect').value = missionIndex;
  const show = () => { $('missionPrompt').textContent=MISSIONS[missionIndex].prompt; $('missionStatus').textContent=''; };
  $('missionSelect').addEventListener('change',()=>{missionIndex=+$('missionSelect').value;show();});
  $('missionStart').addEventListener('click',()=>{
    Object.assign(ST,MISSIONS[missionIndex].start);savedAtom={...ST};stavbaKresli();
    $('missionStatus').textContent='Výchozí model je připravený a uložený pro porovnání. Uprav počty částic nahoře.';
  });
  $('missionHint').addEventListener('click',()=>{$('missionStatus').textContent=MISSIONS[missionIndex].hint;});
  $('missionCheck').addEventListener('click',()=>{
    const target=MISSIONS[missionIndex].target;
    const wrong=['z','n','e'].filter(k=>ST[k]!==target[k]);
    $('missionStatus').textContent=wrong.length ? 'Ještě uprav: '+wrong.map(k=>({z:'počet protonů',n:'počet neutronů',e:'počet elektronů'}[k])).join(', ')+'. Můžeš použít nápovědu.' : '✓ Splněno! Z = '+ST.z+', A = '+(ST.z+ST.n)+', náboj = '+(ST.z-ST.e)+'. '+(missionIndex===2?'Změnou neutronů vznikl jiný izotop, prvek zůstal stejný.':'Porovnej jádro a obal obou modelů.');
  });
  $('saveAtom').addEventListener('click',()=>{savedAtom={...ST};renderComparison();});
  $('clearAtom').addEventListener('click',()=>{savedAtom=null;renderComparison();});
  show();
}
function renderComparison() {
  const el=$('atomCompare'); if(!el)return;
  el.hidden=!savedAtom; if(!savedAtom){el.replaceChildren();return;}
  const card=(s,title)=>`<article><h3>${title} · ${podleZ(s.z)?.znak || 'bez protonů'}</h3>${svgAtom(s,{naboj:s.z-s.e})}<p>${s.z} p⁺ · ${s.n} n · ${s.e} e⁻<br>A = ${s.z+s.n} · náboj = ${s.z-s.e}</p></article>`;
  el.innerHTML=card(savedAtom,'Uložený model')+card(ST,'Nyní')+`<p style="grid-column:1/-1">Změna: protony ${signed(ST.z-savedAtom.z)}, neutrony ${signed(ST.n-savedAtom.n)}, elektrony ${signed(ST.e-savedAtom.e)}. ${ST.z!==savedAtom.z?'Změnil se chemický prvek.':ST.n!==savedAtom.n?'Stejný prvek, jiný izotop.':'Jádro zůstalo stejné.'} ${ST.e!==savedAtom.e?'Změna elektronů ovlivňuje náboj.':''}</p>`;
}
function signed(n) {return n>0?'+'+n:String(n);}
function setupTimeline() {
  VZ.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pauseButton=$('vzPause');
  const label=()=>{pauseButton.textContent=VZ.paused?'Spustit animaci':'Pozastavit';pauseButton.setAttribute('aria-pressed',String(VZ.paused));};
  const seek=()=>{
    if(VZ.animace)cancelAnimationFrame(VZ.animace);
    VZ.paused=true;const now=performance.now();VZ.start=now-Number($('vzTime').value)*1000;VZ.posledni=now;
    vzSmycka(now);label();
  };
  $('vzTime').addEventListener('input',seek);
  pauseButton.addEventListener('click',()=>{
    if(!VZ.paused){VZ.paused=true;if(VZ.animace)cancelAnimationFrame(VZ.animace);}
    else {VZ.paused=false;const now=performance.now();VZ.start=now-Number($('vzTime').value)*1000;VZ.posledni=now;VZ.animace=requestAnimationFrame(vzSmycka);}
    label();
  });
  // U kovu nejde o jednorázový děj: posuvník by nevystihoval náhodný pohyb elektronů.
  $('vzTime').parentElement.hidden=VZ.druh==='kov';
  label();vzSmycka(performance.now());
}
document.querySelectorAll('#rezimy button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.rezim===rezim));
