'use strict';
// Schémata vysvětlují principy; čas animace není měřítkem reálné rychlosti děje.
const APPARATUS = [
 {id:'filtrace',name:'Filtrace',property:'Velikost částic',input:'Písek a slaná voda',output:'Písek na filtru; solný roztok ve filtrátu.',limit:'Rozpuštěnou sůl papírový filtr nezachytí.',phases:['Směs naléváme na navlhčený filtrační papír v nálevce.','Voda s rozpuštěnou solí prochází póry. Zrnka písku zůstávají na papíru.','Filtrát obsahuje vodu i sůl. Filtrace odstranila písek, ne všechny příměsi.'],question:'Co bude ve filtrátu?',answers:['Čistá voda','Voda s rozpuštěnou solí','Pouze písek'],correct:1,why:'Ionty rozpuštěné soli projdou běžným papírovým filtrem spolu s vodou.',parts:[['Filtrační papír','Póry propouštějí kapalinu a rozpuštěné látky. Větší pevné částice se zachytí.'],['Filtrát','Kapalina, která prošla filtrem. Není nutně čistá ani pitná.']]},
 {id:'destilace',name:'Destilace',property:'Rozdílná těkavost',input:'Voda s rozpuštěnou solí',output:'Zachycená voda (destilát); koncentrovanější solný roztok v baňce.',limit:'U směsí těkavých kapalin nemusí jediná destilace dát čisté složky.',phases:['Solný roztok zahříváme. Chladičem proudí chladicí voda zdola nahoru.','Vodní pára odchází z baňky do chladiče. Sůl v tomto modelu zůstává v baňce.','Pára v chladiči kondenzuje. V přijímací nádobě sbíráme kapalný destilát.'],question:'Proč musí být za baňkou chladič?',answers:['Aby se zachytila sůl','Aby se pára změnila v kapalinu','Aby voda rychleji vřela'],correct:1,why:'Chladič odnímá páře teplo. Z plynu opět vzniká kapalina.',parts:[['Varná baňka','Obsahuje solný roztok. Vodu odpařujeme, sůl je za těchto podmínek netěkavá.'],['Chladič','Pára prochází vnitřní trubicí. Chladicí voda proudí odděleným pláštěm.']]},
 {id:'usazovani',name:'Usazování',property:'Hustota a velikost částic',input:'Hrubý písek ve vodě',output:'Usazenina u dna a čirší kapalina nad ní.',limit:'Velmi jemné částice se usazují pomalu. Rozpuštěné látky se takto neoddělí.',phases:['Pevné částice jsou rozptýlené ve vodě. Nádobu necháme v klidu.','Zrnka písku mají větší hustotu než voda a klesají působením gravitace.','Písek je u dna. Kapalinu můžeme opatrně slít (dekantace).'],question:'Co usazování ze slané kalné vody neodstraní?',answers:['Hrubý písek','Rozpuštěnou sůl','Částice s větší hustotou'],correct:1,why:'Rozpuštěné ionty soli se neusadí jako zrnka písku.',parts:[['Usazenina','Pevné částice nahromaděné u dna.'],['Kapalina nad ní','Může být čirší, ale stále obsahovat rozpuštěné látky i jemné částice.']]},
 {id:'odparovani',name:'Odpařování',property:'Těkavost rozpouštědla',input:'Kuchyňská sůl ve vodě',output:'Pevná sůl; voda uniká do okolí.',limit:'Na rozdíl od destilace zde páru nezachycujeme.',phases:['Roztok je v odpařovací misce. Voda se může odpařovat i bez varu.','Vody ubývá a roztok se koncentruje. Po dosažení nasycení se vylučuje sůl.','Po odpaření vody zůstane pevná sůl. Vodu jsme nezískali zpět.'],question:'Chci získat sůl i vodu. Stačí tato miska?',answers:['Ano, obě látky zůstanou','Ne, vodní páru musím zachytit a ochladit'],correct:1,why:'Pro zachycení rozpouštědla použijeme destilaci.',parts:[['Odpařovací miska','Velký povrch usnadňuje odpařování vody.'],['Pára','Odchází do okolí; v tomto uspořádání se nesbírá.']]},
 {id:'krystalizace',name:'Krystalizace',property:'Rozpustnost',input:'Teplý nasycený roztok vhodné látky',output:'Krystaly a matečný roztok.',limit:'Závislost rozpustnosti na teplotě se u různých látek liší.',phases:['Teplý nasycený roztok obsahuje rozpuštěnou látku.','Při ochlazování se u zvolené látky snižuje rozpustnost. Látka se začíná vylučovat.','Rostou krystaly. Část látky zůstává rozpuštěná v matečném roztoku.'],question:'Je kapalina kolem krystalů čistá voda?',answers:['Ano, všechna látka vykrystalizovala','Ne, část látky zůstává rozpuštěná'],correct:1,why:'Při dané teplotě má látka určitou rozpustnost; matečný roztok ji stále obsahuje.',parts:[['Krystaly','Částice látky se uspořádávají do krystalové struktury.'],['Matečný roztok','Kapalina, z níž krystaly rostou. Stále obsahuje rozpuštěnou látku.']]},
 {id:'magnet',name:'Magnet',property:'Magnetické vlastnosti',input:'Železné piliny a písek',output:'Železné piliny u magnetu; písek zvlášť.',limit:'Magnet nepřitahuje všechny kovy. Například měď takto neoddělíme.',phases:['Ve směsi jsou železné piliny a nemagnetický písek.','Přibližujeme magnet. Železné piliny se k němu přitahují.','Magnet odneseme i s pilinami. Písek zůstal v misce.'],question:'Přitáhne magnet také měděné piliny?',answers:['Ano, přitahuje všechny kovy','Ne, měď takto neoddělíme'],correct:1,why:'Pro tento postup potřebujeme vhodné magnetické vlastnosti, nestačí to, že jde o kov.',parts:[['Magnet','Přitahuje železné piliny; písek nikoli.'],['Zbytek směsi','V misce zůstává nemagnetická složka.']]},
 {id:'odstredovani',name:'Odstřeďování',property:'Hustota v rotující soustavě',input:'Suspenze ve vyvážených zkumavkách',output:'Usazenina u vnějšího konce zkumavky a kapalina nad ní.',limit:'Zkumavky musí být vyvážené. Jde o schéma principu, ne návod k obsluze.',phases:['Zkumavky jsou v rotoru umístěné proti sobě a vyvážené.','Při rotaci se částice s větší hustotou než kapalina posouvají směrem od osy.','Po zastavení je sediment u vnějšího konce zkumavky. Oddělení bylo rychlejší než při stání.'],question:'Kam se přesouvají hustší pevné částice?',answers:['Směrem k ose rotace','Směrem od osy rotace'],correct:1,why:'V rotující soustavě se hustší částice hromadí na vzdálenějším konci zkumavky.',parts:[['Rotor','Otáčí vyváženými zkumavkami kolem osy.'],['Sediment','Hustší částice se shromažďují směrem od osy.']]}
];
let apparatusIndex=0, apparatusProgress=0, apparatusPaused=true, apparatusFrame=null, apparatusLast=0;
function stopApparatus(){if(apparatusFrame!==null)cancelAnimationFrame(apparatusFrame);apparatusFrame=null;}
const lerp=(a,b,t)=>a+(b-a)*t;
function diagram(id,t){
 const dot=(x,y,r=4,color='var(--warn)')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
 const label=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${s}</text>`;
 const beaker=(x,y,w,h)=>`<path class="glass" d="M${x} ${y}v${h}h${w}v-${h}"/>`;
 let s='';
 if(id==='filtrace'){
  s=`<path class="glass" d="M165 40H375L270 174v45"/><path d="M178 52H362L270 158Z" fill="var(--bg-control)" stroke="var(--text-muted)"/><path class="liquid" d="M${lerp(181,229,t)} ${lerp(57,105,t)}H${lerp(359,311,t)}L270 147Z"/>${beaker(200,228,140,100)}<path class="liquid" d="M202 ${322-t*60}H338V326H202Z"/><path class="flow" d="M270 180V${t>0?270:182}"/>`;
  for(let i=0;i<18;i++)s+=`<rect x="${252+i%6*6}" y="${103+Math.floor(i/6)*7}" width="6" height="5" fill="#bd9253"/>`;
  for(let i=0;i<10;i++)s+=dot(220+i%5*24,320-Math.floor(i/5)*15*t,2.5);
  s+=label(466,100,'písek na filtru')+`<path d="M400 106L295 118" class="glass"/>`+label(448,280,'solný roztok')+`<path d="M389 280H342" class="glass"/>`;
 }else if(id==='destilace'){
  s=`<path class="glass" d="M133 74V145a64 64 0 1 0 34 0V74Z"/><path class="liquid" d="M93 ${206+t*30}Q150 290 207 ${206+t*30}Z"/><path class="glass" d="M167 96L245 96L459 208V249"/><path class="glass" d="M251 80L455 188L444 213L239 105Z"/><path stroke="var(--accent)" fill="none" stroke-width="6" opacity=".3" d="M250 94L447 199"/><path class="flow hot-flow" d="M154 140V100H242L450 209V245"/><path class="glass" d="M258 83V55M431 214V239"/><path class="flow" d="M430 240V200L258 110V55"/>${beaker(423,257,85,71)}<path class="liquid" d="M425 ${325-t*45}H506V326H425Z"/><rect x="100" y="283" width="100" height="21" rx="5" class="heat"/>${label(150,330,'ohřev')}${label(318,49,'chladič')}${label(530,254,'destilát')}<text x="320" y="354" text-anchor="middle" class="small">chladicí voda: vstup dole → výstup nahoře</text>`;
  for(let i=0;i<9;i++)s+=dot(125+i*17%47,215+t*24+i*7%17,2.5);
 }else if(id==='usazovani'){
  s=beaker(165,46,270,279)+`<path class="liquid" d="M167 76H433V323H167Z"/>`;
  for(let i=0;i<38;i++){const x=180+i*47%238,y=lerp(90+i*31%196,303+i%4*5,t);s+=`<rect x="${x}" y="${y}" width="7" height="5" fill="#bd9253"/>`;}
  s+=label(300,353,t<.5?'částice klesají ke dnu':'usazenina + kapalina nad ní');
 }else if(id==='odparovani'){
  s=`<path class="glass" d="M125 207Q300 370 475 207Z"/><path class="liquid" opacity="${1-t}" d="M140 217Q300 346 460 217Z"/><rect x="225" y="310" width="150" height="18" rx="5" class="heat"/>`;
  for(let i=0;i<12;i++)s+=dot(215+i%6*29,280+Math.floor(i/6)*9,2+t*3);
  for(let i=0;i<5;i++)s+=`<path class="flow" opacity="${t<1?.7:0}" d="M${210+i*42} 185q-15 -20 0 -40t0 -40"/>`;
  s+=label(300,68,'voda odchází do okolí')+label(300,354,'v misce zůstává sůl');
 }else if(id==='krystalizace'){
  s=beaker(170,54,260,270)+`<path class="liquid" d="M172 93H428V322H172Z"/>`;
  for(let i=0;i<30;i++)s+=dot(186+i*47%222,112+i*31%150,2,'var(--accent)');
  for(let i=0;i<9;i++){const x=204+i%5*43,y=285+Math.floor(i/5)*21,r=t*(6+i%3*5);s+=`<path d="M${x} ${y-r}l${r} ${r}l-${r} ${r}l-${r} -${r}Z" fill="var(--accent)" stroke="var(--text-muted)"/>`;}
  s+=label(300,354,'ochlazování → růst krystalů');
 }else if(id==='magnet'){
  s=`<path class="glass" d="M90 290Q310 350 530 290"/><g transform="translate(${t*70},${-t*30})"><path d="M180 74v54a40 40 0 0 0 80 0V74" stroke="var(--danger)" stroke-width="22" fill="none"/><path d="M180 74v25M260 74v25" stroke="var(--accent)" stroke-width="22"/><text x="180" y="63">N</text><text x="260" y="63">S</text></g>`;
  for(let i=0;i<22;i++){const x=125+i*37%350;s+=dot(x,295+i%3*7,4,'#bd9253');s+=`<rect x="${lerp(x,245+i%5*12,t)}" y="${lerp(287+i%4*5,133+i%4*6,t)}" width="10" height="3" fill="var(--text-muted)"/>`;}
  s+=label(450,100,'železo k magnetu')+label(310,354,'písek zůstává');
 }else{
  s=`<circle cx="320" cy="165" r="119" class="glass"/><g transform="rotate(${t*1080} 320 165)"><path d="M220 165H420" class="glass"/><rect x="204" y="142" width="70" height="46" rx="12" class="liquid"/><rect x="366" y="142" width="70" height="46" rx="12" class="liquid"/>`;
  for(let i=0;i<14;i++){s+=dot(lerp(216+i*7%44,210+i%3*4,t),150+i%5*7,2,'#bd9253');s+=dot(lerp(374+i*7%44,426+i%3*3,t),150+i%5*7,2,'#bd9253');}
  s+=`</g>${dot(320,165,12,'var(--text-muted)')}${label(320,330,'hustší částice → od osy rotace')}`;
 }
 const m=APPARATUS.find(x=>x.id===id);
 s=s.replace(/class="flow( hot-flow)?"/g, (_,hot)=>`class="flow${hot||''}" style="animation-delay:-${t*9}s"`);
 const hotspots=m.parts.map((p,i)=>`<g class="method-hotspot" role="button" tabindex="0" data-part="${i}" aria-label="Vysvětlit: ${p[0]}"><rect x="${15+i*305}" y="371" width="290" height="30" rx="7"/><text x="${160+i*305}" y="391">${p[0]} · info</text></g>`).join('');
 return `<svg viewBox="0 0 640 418" role="group" aria-label="Schéma: ${m.name}. ${m.phases[Math.min(2,Math.floor(t*3))]}">${s}${hotspots}</svg>`;
}
function aparatury(){
 stopApparatus(); const m=APPARATUS[apparatusIndex];
 $('plocha').innerHTML=`<header class="section-head"><span class="eyebrow">01 / Pozoruj princip</span><h2>Každá metoda využívá jinou vlastnost</h2><p>Vyber aparaturu, vyslov svůj odhad a pusť děj. Posuvníkem můžeš zkoumat libovolný okamžik.</p></header><div class="apparatus-layout"><nav class="method-nav" aria-label="Dělicí metody">${APPARATUS.map((x,i)=>`<button data-apparatus="${i}" aria-pressed="${i===apparatusIndex}">${x.name}<small>${x.property}</small></button>`).join('')}</nav><div class="apparatus-main"><div class="experiment-stage paused" id="apparatusScene"></div><div class="apparatus-controls"><button class="action" id="apparatusPlay">▶ Spustit</button><button class="action" id="apparatusReset">↺</button><label for="apparatusTime">Průběh</label><input id="apparatusTime" type="range" min="0" max="100" value="${apparatusProgress}" aria-label="Průběh pokusu v procentech"><output id="apparatusPercent"></output></div><p class="apparatus-detail" id="apparatusDetail" role="status">Klepni na název části pod obrázkem a prozkoumej její funkci.</p><div class="experiment-caption" id="apparatusCaption" aria-live="polite"></div><div class="prediction"><b>Nejdřív odhadni: ${m.question}</b><div class="lab-controls">${m.answers.map((a,i)=>`<button data-prediction="${i}">${a}</button>`).join('')}</div><p id="predictionFeedback" role="status"></p></div></div></div><div class="fact-grid"><article><h3>Vstupní směs</h3>${m.input}</article><article><h3>Co získáme</h3>${m.output}</article><article><h3>Hranice metody</h3>${m.limit}</article></div><p class="vysvetlivka">Aparatury jsou zjednodušená schémata. Posuvník vyjadřuje postup děje, nikoli skutečný čas. Barevné cesty v chladiči odlišují cestu páry a chladicí vody.</p>`;
 apparatusPaused=true;renderApparatus();
 document.querySelectorAll('[data-apparatus]').forEach(b=>b.addEventListener('click',()=>{apparatusIndex=+b.dataset.apparatus;apparatusProgress=0;aparatury();}));
 $('apparatusReset').setAttribute('aria-label','Vrátit pokus na začátek');
 $('apparatusPlay').addEventListener('click',()=>{apparatusPaused=!apparatusPaused;if(!apparatusPaused){if(apparatusProgress>=100)apparatusProgress=0;apparatusLast=performance.now();apparatusFrame=requestAnimationFrame(tickApparatus);}else stopApparatus();renderApparatus();});
 $('apparatusTime').addEventListener('input',()=>{stopApparatus();apparatusPaused=true;apparatusProgress=+$('apparatusTime').value;renderApparatus();});
 $('apparatusReset').addEventListener('click',()=>{stopApparatus();apparatusPaused=true;apparatusProgress=0;renderApparatus();});
 $('apparatusScene').addEventListener('click',e=>{const part=e.target.closest('[data-part]');if(part)$('apparatusDetail').textContent=m.parts[+part.dataset.part][1];});
 $('apparatusScene').addEventListener('focusin',()=>{if(!apparatusPaused){stopApparatus();apparatusPaused=true;$('apparatusScene').classList.add('paused');$('apparatusPlay').textContent='▶ Spustit';$('apparatusPlay').setAttribute('aria-pressed','false');}});
 $('apparatusScene').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-part]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 document.querySelectorAll('[data-prediction]').forEach(b=>b.addEventListener('click',()=>{$('predictionFeedback').textContent=(+b.dataset.prediction===m.correct?'✓ Správně. ':'✗ Zkus svůj odhad přehodnotit. ')+m.why;}));
}
function renderApparatus(){
 if(!$('apparatusScene'))return;
 const focus=document.activeElement?.dataset.part;
 $('apparatusScene').innerHTML=diagram(APPARATUS[apparatusIndex].id,apparatusProgress/100);
 if(focus!==undefined&&apparatusPaused)$('apparatusScene').querySelector(`[data-part="${focus}"]`)?.focus();
 $('apparatusScene').classList.toggle('paused',apparatusPaused);
 const phase=Math.min(2,Math.floor(apparatusProgress/100*3)),m=APPARATUS[apparatusIndex];
 const text=`<b>${phase+1}. ${['Výchozí stav','Průběh oddělování','Výsledek'][phase]}</b>${m.phases[phase]}`;
 if($('apparatusCaption').innerHTML!==text)$('apparatusCaption').innerHTML=text;
 $('apparatusTime').value=apparatusProgress;$('apparatusPercent').textContent=Math.round(apparatusProgress)+' %';
 $('apparatusPlay').textContent=apparatusPaused?'▶ Spustit':'Ⅱ Pozastavit';$('apparatusPlay').setAttribute('aria-pressed',String(!apparatusPaused));
}
function tickApparatus(now){
 if(apparatusPaused||!$('apparatusScene')){stopApparatus();return;}
 apparatusProgress=Math.min(100,apparatusProgress+(now-apparatusLast)/90);apparatusLast=now;
 if(apparatusProgress>=100)apparatusPaused=true;
 renderApparatus();if(!apparatusPaused)apparatusFrame=requestAnimationFrame(tickApparatus);else stopApparatus();
}
const MISSION_DATA=[
 {name:'Tři pevné složky',subtitle:'železo · písek · sůl',goal:'Získej zvlášť železo, písek a sůl. Začni využitím magnetických vlastností.',materials:[['Železo',10],['Písek',20],['Sůl',10]],steps:['magnet','voda','filtrace','odparovani'],notes:['Magnet zachytil železo. Písek se solí zůstaly.','Sůl se rozpustila v přidaných 100 g vody, písek nikoli.','Na filtru je písek; filtrát obsahuje sůl a vodu.','Voda se odpařila. Zůstala sůl. Získali jsme všechny tři pevné složky.'],recovered:[['Železo',10],null,['Písek',20],['Sůl',10]],explain:'V ideálním modelu jsme získali 40 g původních pevných složek. V reálném pokusu mohou vznikat ztráty při přelévání; písek na filtru je nutné vysušit.'},
 {name:'Voda z roztoku',subtitle:'voda · kuchyňská sůl',goal:'Ze solného roztoku zachyť vodu. Sůl nechej v původní nádobě.',materials:[['Voda',100],['Sůl',10]],steps:['destilace'],notes:['Vodní pára prošla chladičem a zkondenzovala. Získali jsme část vody; zbytek je se solí v baňce.'],recovered:[['Destilovaná voda',50]],explain:'Model zachytil 50 g vody. V baňce zůstalo 50 g vody a 10 g soli: bilance 50 + 60 = 110 g. Roztok neodpařujeme do sucha.'},
 {name:'Dvě kapalné vrstvy',subtitle:'olej · voda',goal:'Počkej na rozdělení oleje a vody a odděl spodní vodní vrstvu dělicí nálevkou.',materials:[['Olej',20],['Voda',80]],steps:['stat','nalevka'],notes:['Po odstátí se kapičky spojily: olej je nahoře, voda dole.','Kohoutem dělicí nálevky jsme odpustili spodní vodní vrstvu. Olej zůstal v nálevce.'],recovered:[null,['Voda',80]],explain:'Máme 80 g vody a zvlášť 20 g oleje. Dělicí nálevka je vhodná pro nemísitelné kapaliny; roztok lihu a vody by takto rozdělit nešel.'},
 {name:'Krystaly z roztoku',subtitle:'rozpuštěná látka · voda',goal:'Z teplého nasyceného roztoku získáš krystaly látky, jejíž rozpustnost se při ochlazení snižuje. Pak je odděl od kapaliny.',materials:[['Voda',100],['Rozpuštěná látka',60]],steps:['chladit','filtrace'],notes:['Po ochlazení vykrystalizovalo 30 g látky. Dalších 30 g zůstalo rozpuštěných.','Filtr zachytil krystaly. Matečný roztok prošel filtrem.'],recovered:[null,['Krystaly',30]],explain:'Bilance modelu: 30 g krystalů + 130 g matečného roztoku = 160 g. Čísla jsou zvolená pro výuku, nikoli naměřená data konkrétní látky.'}
];
const MISSION_ACTIONS={magnet:'🧲 Přiložit magnet',voda:'💧 Přidat vodu',filtrace:'▽ Filtrovat',odparovani:'♨ Odpařovat',destilace:'⚗ Destilovat',stat:'◷ Nechat odstát',nalevka:'◈ Dělicí nálevka',chladit:'❄ Ochladit'};
let missionChoice=0,missionStep=0,missionJournal=[],missionCollected=[],missionDone=new Set();
function mise(){
 const m=MISSION_DATA[missionChoice],done=missionStep===m.steps.length;
 $('plocha').innerHTML=`<header class="section-head"><span class="eyebrow">03 / Rozhoduj jako chemik</span><h2>Laboratorní mise</h2><p>Rozhoduje požadovaný výsledek i pořadí operací. Chybný krok směs nezmění; dozvíš se, proč zde nepomáhá.</p></header><div class="mission-select">${MISSION_DATA.map((x,i)=>`<button data-mission="${i}" aria-pressed="${i===missionChoice}"><b>${missionDone.has(i)?'✓ ':''}${x.name}</b><span>${x.subtitle}</span></button>`).join('')}</div><div class="mission-workbench"><section class="lab-panel"><span class="tag">Mise ${missionChoice+1} ze 4 · krok ${Math.min(missionStep+1,m.steps.length)} z ${m.steps.length}</span><h2 style="margin-top:10px">${m.name}</h2><p>${m.goal}</p><h3>Výchozí směs</h3><div class="material-tray">${m.materials.map(([n,g])=>`<div class="material">${n}<strong>${g} g</strong></div>`).join('')}</div><h3>Už odděleno</h3><div class="material-tray">${missionCollected.length?missionCollected.map(([n,g])=>`<div class="material">✓ ${n}<strong>${g} g</strong></div>`).join(''):'<p>Zatím žádná složka.</p>'}</div><div class="lab-controls"><button id="missionUndo">↶ O krok zpět</button><button id="missionRestart">Začít znovu</button></div></section><section class="lab-panel">${done?`<div class="success-panel"><h2>✓ Mise splněna</h2><p>${m.explain}</p></div>`:`<h2>Zvol další postup</h2><div class="mission-actions">${Object.entries(MISSION_ACTIONS).map(([k,v])=>`<button data-operation="${k}">${v}</button>`).join('')}</div>`}<p id="missionResponse" role="status" class="lab-feedback"></p><h3>Laboratorní deník</h3><ol class="journal">${missionJournal.map(t=>`<li>${t}</li>`).join('')||'<li>Zvol první krok.</li>'}</ol></section></div><p class="vysvetlivka">Ideální model bez ztrát. Bilance sleduje hmotnost, nikoli objem. Dokončené mise: ${missionDone.size} / 4 v tomto otevření stránky.</p>`;
 document.querySelectorAll('[data-mission]').forEach(b=>b.addEventListener('click',()=>{missionChoice=+b.dataset.mission;resetMission();}));
 $('missionUndo').disabled=missionStep===0;
 $('missionUndo').addEventListener('click',()=>{missionStep--;missionJournal.pop();missionCollected=m.recovered.slice(0,missionStep).filter(Boolean);mise();});
 $('missionRestart').addEventListener('click',resetMission);
 document.querySelectorAll('[data-operation]').forEach(b=>b.addEventListener('click',()=>{
 const op=b.dataset.operation;
 if(op===m.steps[missionStep]){missionJournal.push(m.notes[missionStep]);const recovered=m.recovered[missionStep];if(recovered)missionCollected.push(recovered);missionStep++;if(missionStep===m.steps.length)missionDone.add(missionChoice);mise();$('missionResponse').textContent='✓ '+missionJournal.at(-1);}
 else $('missionResponse').textContent=missionError(op,m);
 }));
}
function resetMission(){missionStep=0;missionJournal=[];missionCollected=[];mise();}
function missionError(op,m){
 if(op==='magnet')return '✗ Magnet zde další složku neoddělí. Přitahuje železo, nikoli sůl, olej nebo písek.';
 if(op==='filtrace')return '✗ Filtr zachytí vhodné nerozpuštěné pevné částice. Teď nejprve potřebujeme: '+MISSION_ACTIONS[m.steps[missionStep]].replace(/^\S+ /,'')+'.';
 if(op==='odparovani'&&missionChoice===1)return '✗ Voda by unikla do okolí. Tvým cílem je vodu zachytit, proto potřebuješ také chladič.';
 if(op==='nalevka')return '✗ Dělicí nálevka odděluje dvě nemísitelné kapalné vrstvy. Nejprve musí být zřetelně rozdělené.';
 if(op==='voda')return '✗ Další voda zde neřeší požadované oddělení. Přečti si cíl a poslední záznam v deníku.';
 return '✗ Tento krok nyní nevede k cíli mise. Využij vhodnou odlišnost složek; správným dalším krokem je '+MISSION_ACTIONS[m.steps[missionStep]].replace(/^\S+ /,'')+'.';
}
function saturationMarkup(){return `<section class="saturation"><header class="section-head"><span class="eyebrow">Co když přidám příliš mnoho?</span><h2>Nasycení není totéž co koncentrace</h2><p>Výuková látka X: ve 100 g vody se při 20 °C rozpustí nejvýše 30 g, při 60 °C nejvýše 60 g. Mezi těmito body používáme zjednodušený lineární model.</p></header><div class="lab-grid"><section class="lab-panel"><label for="satMass">Přidáno látky X: <output id="satMassValue"></output><input id="satMass" type="range" min="0" max="90" step="5" value="50"></label><label for="satTemp">Teplota: <output id="satTempValue"></output><input id="satTemp" type="range" min="20" max="60" step="5" value="20"></label><p>Hmotnost vody je stále <b>100 g</b>. Předpokládáme ustálený stav a zanedbáváme odpařování.</p><div class="lab-controls"><button id="satHeat">Ohřát na 60 °C</button><button id="satCool">Ochladit na 20 °C</button></div></section><section class="lab-panel"><div id="satDrawing"></div><div id="satResult" aria-live="polite"></div></section></div><p class="vysvetlivka">Látka X je modelová. Čísla nelze používat jako rozpustnost kuchyňské soli ani jiné konkrétní látky.</p></section>`;}
function setupSaturation(){
 const render=()=>{
 const mass=+$('satMass').value,temp=+$('satTemp').value,limit=30+(temp-20)*.75,dissolved=Math.min(mass,limit),solid=mass-dissolved;
 $('satMassValue').textContent=mass+' g';$('satTempValue').textContent=temp+' °C';
 let particles='';for(let i=0;i<Math.round(dissolved/2);i++)particles+=`<circle class="particle" cx="${45+i*31%160}" cy="${38+i*23%100}" r="3" fill="var(--warn)"/>`;
 for(let i=0;i<Math.round(solid/2);i++)particles+=`<rect x="${42+i*17%170}" y="${159-Math.floor(i/11)*7}" width="6" height="6" fill="var(--warn)"/>`;
 $('satDrawing').innerHTML=`<svg class="lab-scene" viewBox="0 0 260 190" role="img" aria-label="${dissolved} gramů rozpuštěno, ${solid} gramů pevné látky"><path class="water" d="M30 24H230V170H30Z"/>${particles}<path class="glass" d="M30 15V170H230V15"/></svg>`;
 $('satResult').innerHTML=`<div class="balance-grid"><div><strong>${fmt(dissolved)} g</strong><span>rozpuštěno</span></div><div><strong>${fmt(solid)} g</strong><span>pevný zbytek</span></div><div><strong>${fmt(limit)} g</strong><span>mez rozpustnosti</span></div></div><p><b>${mass===0?'Čistá voda':mass<limit?'Nenasycený roztok':solid>0?'Nasycený roztok + pevná látka':'Právě nasycený roztok'}</b></p><p>Hmotnost kapalného roztoku: 100 + ${fmt(dissolved)} = <b>${fmt(100+dissolved)} g</b>.<br>Obsah látky v roztoku: <b>${fmt(dissolved/(100+dissolved)*100)} %</b>.</p><p>Pevný zbytek ${fmt(solid)} g do hmotnosti <b>roztoku</b> nepočítáme. Celá směs váží ${mass+100} g.</p>`;
 };
 ['satMass','satTemp'].forEach(id=>$(id).addEventListener('input',render));
 $('satHeat').addEventListener('click',()=>{$('satTemp').value=60;render();});$('satCool').addEventListener('click',()=>{$('satTemp').value=20;render();});render();
}
function roztok(){
 roztokZaklad();
 $('plocha').insertAdjacentHTML('afterbegin','<header class="section-head"><span class="eyebrow">02 / Měň jednu veličinu</span><h2>Kolik látky je skutečně rozpuštěné?</h2><p>Nejprve míchej nenasycený solný roztok. Pak prozkoumej, co se změní při dosažení meze rozpustnosti.</p></header>');
 $('plocha').insertAdjacentHTML('beforeend',saturationMarkup());setupSaturation();
}
function castice(){
 casticeZaklad();
 const v=MIX_VIEWS[mixIndex];
 const classification=mixIndex===0?'Stejnorodá směs':'Různorodá směs';
 $('plocha').insertAdjacentHTML('afterbegin',`<header class="section-head"><span class="eyebrow">Od běžného pohledu k částicím</span><h2>Podobný vzhled, jiné uspořádání</h2><p>Porovnej šest druhů směsí. Rozhoduje, jaké fáze obsahují, nikoli jen to, jestli se nám kapalina zdá čirá.</p></header>`);
 const facts=[['Rozptýlená složka','ionty soli','zrnka písku','olejové kapičky','plynové bubliny','pevné částice','vodní kapičky'],['Prostředí','voda','voda','voda','kapalina','vzduch','vzduch']];
 $('plocha').insertAdjacentHTML('beforeend',`<div class="fact-grid"><article><h3>Zařazení</h3>${classification}</article>${facts.map(f=>`<article><h3>${f[0]}</h3>${f[mixIndex+1]}</article>`).join('')}</div><div class="prediction" style="width:100%"><b>Pozorování ≠ závěr</b><p>${mixIndex===0?'Slaná voda může být čirá stejně jako čistá voda. Samotný pohled nerozhodne, zda obsahuje rozpuštěnou sůl.':mixIndex===2?'Mléko vypadá jednolitě, přesto obsahuje rozptýlené tukové kapičky. Kromě tuku obsahuje i další složky.':v.note}</p></div>`);
}
