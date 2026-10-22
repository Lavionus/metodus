/* Doplňkové modely: produkty štěpení a školní model bezpečnostních funkcí.
   Číselné ukazatele havárií jsou bezrozměrné; nejde o provozní výpočet. */
const PRODUKTY = {
  ba: {
    title: 'Baryum-141', genitive: 'barya-141', symbol: 'Ba', a: 141, z: 56, half: '18,27 min', seconds: 18.27 * 60,
    chemistry: 'Baryum je měkký stříbřitý kov alkalických zemin. Snadno reaguje a vytváří sloučeniny. Tyto chemické vlastnosti určuje hlavně elektronový obal, nikoli radioaktivita.',
    fate: 'Nevznikne kousek čistého kovu, který by vypadl z reaktoru. Rychlý fragment se zabrzdí v palivu, předá mu energii a stane se součástí materiálu, často ve sloučenině.',
    chain: [['Ba', 'baryum', 56, '18,27 min'], ['La', 'lanthan', 57, '3,92 h'], ['Ce', 'cer', 58, 'přibližně 32,5 dne'], ['Pr', 'praseodym', 59, 'stabilní']]
  },
  kr: {
    title: 'Krypton-92', genitive: 'kryptonu-92', symbol: 'Kr', a: 92, z: 36, half: '1,84 s', seconds: 1.84,
    chemistry: 'Krypton je za běžných podmínek bezbarvý vzácný plyn bez zápachu. Chemicky reaguje jen velmi obtížně. Chemická netečnost ale neznamená, že izotop krypton-92 není radioaktivní.',
    fate: 'Také tento fragment nejprve předá pohybovou energii palivu. Plynné štěpné produkty mohou zůstávat zachycené v palivu nebo přecházet do prostoru pod jeho pokrytím. Kr-92 se rychle přeměňuje; nelze si jej představovat jako dlouho uloženou bublinu čistého kryptonu-92.',
    chain: [['Kr', 'krypton', 36, '1,84 s'], ['Rb', 'rubidium', 37, 'několik sekund'], ['Sr', 'stroncium', 38, 'přibližně 2,6 h'], ['Y', 'yttrium', 39, 'přibližně 3,5 h'], ['Zr', 'zirkonium', 40, 'stabilní']]
  }
};
const PROD = { kind: 'ba', stage: 0 };
function produktyPanel() {
  return `<section class="products-section" aria-labelledby="productsTitle">
    <div class="section-intro"><span class="eyebrow">Co je za značkami Ba a Kr?</span><h2 id="productsTitle">Příběh po rozštěpení jádra</h2><p>V našem příkladu vznikají <b>jádra barya-141 a kryptonu-92</b>. Nejsou to jediné možné produkty štěpení uranu: jiné události vytvoří jiné dvojice izotopů.</p></div>
    <div class="transport" id="productChoice" role="group" aria-label="Produkt štěpení"><button data-product="ba">¹⁴¹Ba · baryum</button><button data-product="kr">⁹²Kr · krypton</button></div>
    <div class="product-grid"><article class="panel" id="productInfo"></article><article class="panel"><h3>Kam se jádro přemění?</h3><div class="decay-route" id="productChain"></div><div class="product-current" id="productCurrent" aria-live="polite"></div><div class="transport"><button id="productBack">← Předchozí jádro</button><button id="productNext">Další β⁻ přeměna →</button></div><p class="vysvetlivka">Zobrazená hlavní větev není časová osa. Každý krok má jiný poločas a okamžik přeměny konkrétního jádra je náhodný. Drobné vedlejší větve zde vynecháváme.</p></article></div>
    <div class="product-grid"><article class="panel"><h3>Co znamená poločas tohoto izotopu?</h3><label for="productTime">Uplynulé poločasy původního izotopu <b id="productTimeLabel"></b></label><input class="timeline" id="productTime" type="range" min="0" max="5" step="1" value="1"><div class="isotope-dots" id="productDots" role="img"></div><p id="productHalf"></p><p class="vysvetlivka">Teoretický průměr pro 100 původních jader. Prázdné značky jsou přeměněná jádra, ne zmizelá hmota. Zbylé produkty mohou být dále radioaktivní.</p></article>
    <article class="panel"><h3>Proč zůstává palivo horké?</h3><p>Produkty štěpení mají často nadbytek neutronů. Při <b>β⁻ přeměně</b> se neutron změní na proton a vyletí elektron a elektronové antineutrino. Počet nukleonů A se nemění, ale Z se zvýší o 1: vzniká jiný prvek.</p><p>Uvolněná energie, jejíž část se zachytí v materiálu, přispívá ke <b>zbytkovému teplu</b>. Přeměny mohou doprovázet také fotony gama. Zasunutí regulačních tyčí tento radioaktivní rozpad nevypne.</p><p>Pr-141 a Zr-92 jsou stabilní konce těchto větví. Vyhořelé palivo ale obsahuje mnoho dalších radionuklidů, proto stále potřebuje chlazení, stínění a bezpečné uložení.</p><button id="productAccident">Vyzkoušet chlazení po odstavení →</button></article></div>
    <p class="inline-sources">Podklady: <a href="https://periodic-table.rsc.org/element/56/barium">RSC – baryum</a>, <a href="https://periodic-table.rsc.org/element/36/krypton">RSC – krypton</a>, <a href="https://www.nndc.bnl.gov/ensnds/141/Ba/adopted.pdf">NNDC – Ba-141</a>, <a href="https://www.nndc.bnl.gov/ensnds/92/Kr/beta_decay.pdf">NNDC – Kr-92</a>, <a href="https://www.nndc.bnl.gov/ensnds/141/Pr/adopted.pdf">Pr-141</a>, <a href="https://www.nndc.bnl.gov/ensnds/92/Zr/adopted.pdf">Zr-92</a>, <a href="https://www.nrc.gov/reading-rm/doc-collections/nuregs/knowledge/km0004/index">NRC – produkty v palivu</a>.</p>
  </section>`;
}
function produktyInit() {
  PROD.kind = 'ba'; PROD.stage = 0;
  $('productChoice').onclick = e => { const b = e.target.closest('[data-product]'); if (!b) return; PROD.kind = b.dataset.product; PROD.stage = 0; produktyKresli(); };
  $('productChain').onclick = e => { const b = e.target.closest('[data-decay]'); if (!b) return; PROD.stage = +b.dataset.decay; produktyKresli(); $('productChain').querySelector(`[data-decay="${PROD.stage}"]`).focus(); };
  $('productNext').onclick = () => { PROD.stage++; produktyKresli(); };
  $('productBack').onclick = () => { PROD.stage--; produktyKresli(); };
  $('productTime').oninput = produktyPolocas;
  $('productAccident').onclick = () => document.querySelector('[data-rezim="havarie"]').click();
  produktyKresli();
}
function produktyKresli() {
  const p = PRODUKTY[PROD.kind], current = p.chain[PROD.stage], stable = PROD.stage === p.chain.length - 1;
  document.querySelectorAll('[data-product]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.product === PROD.kind)));
  $('productInfo').innerHTML = `<div class="element-card"><span>${p.z} protonů · ${p.a-p.z} neutronů</span><b><sup>${p.a}</sup>${p.symbol}</b><strong>${p.title}</strong><span>radioaktivní izotop · T½ = ${p.half}</span></div><h3>Jaký je to prvek?</h3><p>${p.chemistry}</p><h3>Co se s ním děje v palivu?</h3><p>${p.fate}</p>`;
  $('productChain').innerHTML = p.chain.map((n,i) => `<button data-decay="${i}" aria-pressed="${i===PROD.stage}" aria-label="${n[1]} ${p.a}, ${n[3]}"><strong>${n[0]}-${p.a}</strong><small>${i===p.chain.length-1?'stabilní':'β⁻ →'}</small></button>`).join('');
  $('productCurrent').innerHTML = `<b>${current[1]}-${p.a}</b><p>${current[2]} protonů + ${p.a-current[2]} neutronů = ${p.a} nukleonů.</p><p>${stable?'Stabilní jádro: touto přeměnovou řadou už nepokračuje.':`Poločas: <b>${current[3]}</b>. Další β⁻ přeměnou vznikne ${p.chain[PROD.stage+1][1]}-${p.a}.`}</p>`;
  $('productBack').disabled = PROD.stage === 0; $('productNext').disabled = stable;
  produktyPolocas();
}
function produktyPolocas() {
  const p = PRODUKTY[PROD.kind], n = +$('productTime').value, left = 100 * 2 ** -n, seconds = p.seconds*n;
  const elapsed = seconds >= 60 ? `${fmt(seconds/60)} min` : `${fmt(seconds)} s`;
  $('productTimeLabel').textContent = `${n} T½`;
  $('productDots').innerHTML = Array.from({length:100},(_,i)=>`<i class="${i<Math.round(left)?'original':'changed'}"></i>`).join('');
  $('productDots').setAttribute('aria-label', `Po ${n} poločasech zbývá průměrně ${fmt(left)} procent původního izotopu`);
  $('productHalf').innerHTML = `Za <b>${elapsed}</b> zbývá v průměru <b>${fmt(left)} % ${p.genitive}</b>. ${n?'Zbytek již přešel na dceřiné produkty.':'Zatím se žádné původní jádro nepřeměnilo.'}`;
}

function rrVysvetleni() {
  return `<section class="rr-explainer" aria-labelledby="rrWhy"><div class="section-intro"><h2 id="rrWhy">Proč záleží na šířce a co dělá reflektor?</h2><p>Pro pokračování reakce musí neutron zasáhnout další štěpitelné jádro dřív, než se pohltí jinak nebo opustí aktivní zónu.</p></div>
  <div class="product-grid"><article class="panel"><h3>Širší zóna: delší cesta k okraji</h3><svg class="explain-svg" viewBox="0 0 480 205" role="img" aria-label="Při stejné typické dráze neutron opustí úzkou zónu, ale v širší má více příležitostí ke srážce"><rect x="25" y="42" width="76" height="115" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><rect x="235" y="42" width="216" height="115" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><path d="M60 100H178M265 100H383" stroke="var(--warn)" stroke-width="3" stroke-dasharray="5 4"/><circle cx="60" cy="100" r="6" fill="var(--accent)"/><circle cx="265" cy="100" r="6" fill="var(--accent)"/><circle cx="383" cy="100" r="12" fill="var(--danger)"/><text x="62" y="25" text-anchor="middle">úzká zóna</text><text x="342" y="25" text-anchor="middle">širší zóna</text><text x="24" y="185">neutron unikl →</text><text x="240" y="185">více příležitostí ke srážce</text></svg>
  <p>Při stejném složení a hustotě paliva se neutron v širší zóně obvykle dostane k okraji až po delší cestě. Roste šance na další srážku a případné štěpení. <b>Ne každá srážka způsobí štěpení.</b></p><p>Větší těleso podobného tvaru má menší poměr povrchu k objemu. U stejného materiálu tak obvykle uniká menší podíl neutronů. V tomto řezu měníme jen šířku; únik horním a dolním okrajem zůstává možný.</p><div class="transport"><button id="rrTryNarrow">Porovnat úzkou zónu</button><button id="rrTryWide">Porovnat širší zónu</button></div><p class="vysvetlivka">Tlačítka vyberou stejný stav bez tyčí a reflektoru. Pokus několikrát opakuj a porovnávej podíl uniklých neutronů, ne jen jejich celkový počet.</p></article>
  <article class="panel"><h3>Reflektor: návrat rozptylem</h3><svg class="explain-svg" viewBox="0 0 480 205" role="img" aria-label="Neutron opustí palivo, několikrát se rozptýlí v materiálu reflektoru a může se vrátit"><rect x="25" y="35" width="245" height="130" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/><rect x="280" y="35" width="165" height="130" rx="8" fill="var(--ok)" opacity=".2"/><text x="45" y="25">aktivní zóna</text><text x="287" y="25">reflektor</text><g fill="var(--text-muted)">${[0,1,2,3,4,5].map(i=>`<circle cx="${305+i%3*49}" cy="${66+Math.floor(i/3)*68}" r="10"/>`).join('')}</g><path d="M142 83L309 69L354 132L305 132L216 120" fill="none" stroke="var(--warn)" stroke-width="3"/><path d="M228 113L216 120L227 127" fill="none" stroke="var(--warn)" stroke-width="3"/><text x="28" y="192">Srážky mění směr; část neutronů se vrátí.</text></svg>
  <p>Nejde o optické zrcadlo. Neutron se sráží s jádry okolního materiálu a <b>mění směr</b>. Část neutronů se tak vrátí do paliva, jiné se pohltí nebo uniknou. Lehká jádra mohou neutron také zpomalovat.</p><div class="transport" id="rrMaterials" role="group" aria-label="Příklady materiálů reflektoru"><button data-material="water">Voda</button><button data-material="graphite">Grafit</button><button data-material="beryllium">Beryllium</button></div><p id="rrMaterialText" role="status"></p><p><b>Reflektor vrací neutrony; regulační tyče je pohlcují.</b> Moderátor je zpomaluje. Jeden materiál může plnit více funkcí.</p><p class="vysvetlivka">Zelený okraj v našem modelu je obecný reflektor. Nastavených 70 % návratů je ilustrativní parametr, ne naměřená vlastnost vody, grafitu ani beryllia. Výběr materiálu mění vysvětlení, ne tento parametr.</p></article></div>
  <p class="inline-sources"><a href="https://www.nrc.gov/reading-rm/basic-ref/glossary/reflector">NRC – princip a příklady materiálů reflektoru</a></p></section>`;
}
function rrVysvetleniInit() {
  for(const [id,width] of [['rrTryNarrow',45],['rrTryWide',150]]) $(id).onclick=()=>{ $('posTyce').value=0;$('posTyce').dispatchEvent(new Event('input'));$('chkReflektor').checked=false;$('chkReflektor').dispatchEvent(new Event('change'));$('posPalivo').value=width;$('posPalivo').dispatchEvent(new Event('input'));for(let i=0;i<4;i++)rrVystrel();rrKresli();rrStavovky();$('rrViewport').scrollIntoView({block:'center',behavior:'auto'}); };
  const descriptions = {water:'Voda kolem aktivní zóny může vracet neutrony rozptylem, zároveň je zpomaluje a v tlakovodním reaktoru odvádí teplo. Část neutronů se ve vodě pohltí.',graphite:'Grafit je forma uhlíku. V některých typech reaktorů slouží jako moderátor nebo reflektor. Není univerzální součástí každé elektrárny.',beryllium:'Beryllium je lehký kov používaný jako reflektor například v některých výzkumných reaktorech. Výběr materiálu závisí na konstrukci a spektru neutronů.'};
  $('rrMaterials').onclick=e=>{const b=e.target.closest('[data-material]');if(!b)return;document.querySelectorAll('[data-material]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('rrMaterialText').textContent=descriptions[b.dataset.material];};
  $('rrMaterials').firstElementChild.click();
}

const HAV_SCENARIOS = {
  blackout: {name:'Výpadek napájení', icon:'⚡', intro:'Síťové napájení vypadlo. Reaktor se automaticky odstavil, ale hlavní čerpadla nemají elektřinu. Samotné zastavení štěpení nestačí.', cause:'napájení čerpadel', solution:'Obnov napájení ze záložního zdroje a zprovozni nouzové chlazení. Chladicí cesta i voda jsou v tomto scénáři k dispozici.', actions:['power','cooling']},
  leak: {name:'Ztráta chladiva', icon:'💧', intro:'Po poruše těsnosti primárního okruhu ubývá voda. Reaktor se automaticky odstavil. Méně vody znamená horší odvod tepla a později odkrytí paliva.', cause:'množství vody', solution:'Zajisti doplňování vody a nouzový odvod tepla. Model předpokládá, že přívod vody zvládá zde zvolený únik. Poruchu těsnosti tím neodstraníš.', actions:['injection','cooling']},
  sink: {name:'Ztráta odvodu tepla', icon:'♨', intro:'Voda i napájení jsou k dispozici, ale běžná cesta předávání tepla do okolí selhala. Reaktor se automaticky odstavil. Pouhé proudění v uzavřeném okruhu jej dlouhodobě neochladí.', cause:'předávání tepla do okolí', solution:'Zajisti nezávislou cestu odvodu tepla a zapni nouzové chlazení. Záložní napájení samo o sobě tuto závadu neřeší.', actions:['sink','cooling']}
};
const HAV = {kind:'blackout', state:null, reference:null, playing:false, animace:null, history:[], log:[], outcome:null, phase:0};
function havState(kind) {
  return {t:0,heat:62,water:kind==='leak'?68:94,damage:0,reserve:100,power:kind!=='blackout',sink:kind!=='sink',injection:false,cooling:false,stable:0,generation:14,removal:0};
}
// Didaktická bilance: zásoba vody a rozdíl mezi vznikajícím a odváděným teplem.
// Hodnoty ani kroky modelu nejsou teploty, tlaky nebo skutečné havarijní časy.
function havPhysics(s, kind, dt) {
  s.t += dt;
  s.generation = 2 + 12 / Math.pow(1+s.t/25,.4);
  const feed = s.injection && s.power && s.reserve>0 ? 4 : 0;
  if(feed) s.reserve = Math.max(0,s.reserve-dt*.8);
  const loss = kind==='leak' ? 2.4 : 0;
  const evaporation = Math.max(0,s.heat-78)*.035;
  s.water = Math.max(0,Math.min(100,s.water+(feed-loss-evaporation)*dt));
  s.removal = s.cooling && s.power && s.sink ? 24*Math.min(1,s.water/75) : 0;
  s.heat = Math.max(10,Math.min(100,s.heat+(s.generation-s.removal)*.095*dt));
  if(s.heat>88 || s.water<25) s.damage = Math.min(100,s.damage+(Math.max(0,s.heat-88)*.08+Math.max(0,25-s.water)*.1)*dt);
  if(s.removal>=s.generation && s.water>=75 && s.heat<65 && s.damage===0) s.stable+=dt;
  else s.stable=0;
}
function havReset(kind=HAV.kind) {
  if(HAV.animace) cancelAnimationFrame(HAV.animace);
  HAV.kind=kind;HAV.state=havState(kind);HAV.reference=havState(kind);HAV.playing=false;HAV.animace=null;HAV.history=[];HAV.log=['0 · Automatické odstavení: řetězová reakce zastavena. Radioaktivní rozpad pokračuje.'];HAV.outcome=null;HAV.phase=0;
}
function havarie() {
  havReset();
  $('plocha').innerHTML = `<div class="zadani uloha-text"><b>Zastavit štěpení. Udržet palivo chlazené.</b> Vyzkoušej poruchu a sleduj, která bezpečnostní funkce chybí. Přerušení řetězové reakce nezastaví radioaktivní rozpad produktů štěpení.</div>
    <div class="transport" id="havScenarios" role="group" aria-label="Scénář poruchy">${Object.entries(HAV_SCENARIOS).map(([id,s])=>`<button data-accident="${id}">${s.icon} ${s.name}</button>`).join('')}</div>
    <section class="accident-intro panel"><h2 id="havTitle"></h2><p id="havIntro"></p><p class="model-note">Školní model bezpečnostních funkcí tlakovodního reaktoru. Ukazatele 0–100 a časové kroky jsou ilustrativní, bez jednotek; nejde o provozní postup ani rekonstrukci konkrétní historické havárie. Reálné ochrany spouštějí řadu opatření automaticky; zde je volíš sám, abys viděl jejich účinek.</p></section>
    <div class="accident-lab"><div><svg id="havDiagram" class="accident-art" viewBox="0 0 700 450" role="img" aria-label="Bezpečnostní model: odstavený reaktor, voda, záložní napájení a odvod tepla"></svg>
    <div class="transport"><button id="havPlay" class="primary">▶ Spustit průběh</button><button id="havStep">+ 1 krok</button><button id="havReset">↺ Stejný pokus znovu</button></div><p class="model-note" id="havClock"></p>
    <div class="hazard-meters"><label>Tepelné zatížení <b id="havHeat"></b><meter id="havHeatMeter" min="0" max="100" low="65" high="85" optimum="20"></meter></label><label>Voda u paliva <b id="havWater"></b><meter id="havWaterMeter" min="0" max="100" low="30" high="70" optimum="95"></meter></label><label>Poškození paliva <b id="havDamage"></b><meter id="havDamageMeter" min="0" max="100" low="1" high="15" optimum="0"></meter></label></div></div>
    <section class="panel accident-actions"><h3>Obnov bezpečnostní funkce</h3><p>Nejdřív se podívej, co chybí. Opatření můžeš připravit v pauze; účinek se projeví s časem.</p><button data-measure="power">⚡ Záložní napájení</button><button data-measure="injection">💧 Doplňování chladiva</button><button data-measure="cooling">❄ Nouzové chlazení</button><button data-measure="sink">↗ Náhradní odvod tepla</button><p id="havFeedback" role="status">Vyber opatření nebo nejprve posuň čas bez zásahu.</p><details><summary>Vysvětlit řešení tohoto scénáře</summary><p id="havSolution"></p></details><p class="model-note" id="havReserve"></p></section></div>
    <section class="hazard-result" id="havResult" role="status"></section>
    <section class="panel hazard-comparison"><h3>Stejná porucha: s opatřeními a bez nich</h3><svg id="havGraph" viewBox="0 0 720 205" role="img" aria-label="Srovnání tepelného zatížení při vlastních opatřeních a bez zásahu"></svg><p id="havCompareText"></p><p class="model-note">Plná modrá: tvůj pokus. Čárkovaná oranžová: souběžný výpočet bez obnovení bezpečnostních funkcí, se stejným automatickým odstavením. Čára označuje tepelný ukazatel, nikoli radioaktivitu.</p></section>
    <div class="product-grid"><section class="panel"><h3>Záznam událostí</h3><ol id="havLog" class="event-log"></ol></section><section class="panel"><h3>Co brání úniku radioaktivních látek?</h3><p>Palivo, jeho kovové pokrytí, tlakový okruh a ochranná obálka tvoří několik bariér. <b>Poškození paliva neznamená automaticky únik do okolí.</b></p><p>Model ukazuje ohrožení první bariéry. Pevnost nádoby, tlak, chemické reakce ani případný únik přes další bariéry nepočítá.</p><p>„Stabilizováno“ znamená pouze obnovený odvod tepla v zobrazeném úseku pokusu. Neznamená to konec havárie, opravu poruchy ani možnost přestat chladit.</p></section></div>
    <p class="inline-sources">Podklady: <a href="https://www.nrc.gov/reading-rm/basic-ref/glossary/emergency-core-cooling-systems-eccs">NRC – nouzové chlazení</a>, <a href="https://nrcoe.inl.gov/SysStudy/EPS">NRC – záložní napájení</a>, <a href="https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle">NRC – zbytkové teplo a ztráta chlazení</a>.</p>`;
  $('havScenarios').onclick=e=>{const b=e.target.closest('[data-accident]');if(!b)return;havReset(b.dataset.accident);havSetup();havAnimate();};
  $('havPlay').onclick=()=>{if(HAV.outcome)return;HAV.playing=!HAV.playing;havRender();};
  $('havStep').onclick=()=>{HAV.playing=false;for(let i=0;i<10;i++)havAdvance(.1);havRender();};
  $('havReset').onclick=()=>{havReset();havSetup();havAnimate();};
  document.querySelectorAll('[data-measure]').forEach(b=>b.onclick=()=>havMeasure(b.dataset.measure));
  havSetup();havAnimate();
}
function havSetup() {
  const scenario=HAV_SCENARIOS[HAV.kind];
  $('havTitle').textContent=scenario.name;$('havIntro').textContent=scenario.intro;$('havSolution').textContent=scenario.solution;
  $('havFeedback').textContent=`Chybí ${scenario.cause}. Štěpení už zastavila automatická ochrana.`;
  document.querySelectorAll('[data-accident]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.accident===HAV.kind)));
  $('havDiagram').innerHTML=`<defs><linearGradient id="havMetal"><stop stop-color="#577581"/><stop offset=".5" stop-color="#bed2da"/><stop offset="1" stop-color="#577581"/></linearGradient><clipPath id="havVesselClip"><rect x="181" y="101" width="158" height="244" rx="46"/></clipPath></defs>
  <path d="M78 360V134Q78 25 260 25Q444 25 444 134V360Z" fill="var(--accent-soft)" stroke="var(--border-strong)" stroke-width="3"/>
  <text x="261" y="48" text-anchor="middle" class="art-label">ochranná obálka</text>
  <rect x="169" y="89" width="182" height="268" rx="54" fill="url(#havMetal)"/><rect x="181" y="101" width="158" height="244" rx="46" fill="var(--bg-deep)"/>
  <rect id="havWaterArt" x="181" width="158" fill="#55a8d8" opacity=".5" clip-path="url(#havVesselClip)"/>
  <g id="havFuel">${[0,1,2,3,4].map(i=>`<rect x="${207+i*21}" y="190" width="13" height="126" rx="4" fill="#d39f63" stroke="#6f593d"/>`).join('')}</g>
  ${[0,1,2,3].map(i=>`<path d="M${226+i*21} 65V310" stroke="#9bb9c7" stroke-width="6"/>`).join('')}
  <path d="M211 65H300" stroke="#9bb9c7" stroke-width="7"/>
  <path id="havCoolingPath" d="M341 162H506V255H342" fill="none" stroke="#63c9bd" stroke-width="8"/>
  <circle id="havFlowDot" cx="345" cy="162" r="5" fill="#efffff"/>
  <rect x="474" y="171" width="126" height="74" rx="12" fill="var(--bg-panel)" stroke="var(--border-strong)" stroke-width="2"/><text x="537" y="202" text-anchor="middle" class="art-label">odvod tepla</text><text id="havSinkLabel" x="537" y="227" text-anchor="middle" class="art-label"></text>
  <path id="havHeatArrow" d="M600 204H657M645 194L657 204L645 214" stroke="#e6b65e" stroke-width="4" fill="none"/>
  <rect x="490" y="293" width="138" height="60" rx="10" fill="var(--bg-panel)" stroke="var(--border-strong)"/><text x="559" y="315" text-anchor="middle" class="art-label">napájení čerpadel</text><text id="havPowerLabel" x="559" y="339" text-anchor="middle" class="art-label"></text>
  <path id="havFeed" d="M85 289H177" stroke="#69c6ed" stroke-width="7" stroke-dasharray="8 5"/><text x="90" y="268" class="art-label">přívod vody</text>
  <g id="havLeak" stroke="#69c6ed" stroke-width="3"><path d="M337 322l49 20M335 328l33 32M334 333l16 29"/></g>
  <text x="260" y="390" text-anchor="middle" class="art-label">štěpení: zastaveno automaticky</text><text id="havDecayLabel" x="350" y="419" text-anchor="middle" class="art-label"></text>`;
  HAV.flowPath=$('havCoolingPath');HAV.flowLength=HAV.flowPath.getTotalLength();
  HAV.history.push({t:0,heat:HAV.state.heat,reference:HAV.reference.heat});
  havRender();
}
function havMeasure(action) {
  if(HAV.outcome) return;
  const s=HAV.state, names={power:'Záložní napájení připojeno.',injection:'Doplňování vody zapnuto.',cooling:'Nouzové chlazení zapnuto.',sink:'Náhradní cesta odvodu tepla připravena.'};
  if(action==='cooling' && s.cooling) {s.cooling=false;havLog('Nouzové chlazení vypnuto.');$('havFeedback').textContent='Zdroj tepla zůstává. Sleduj, co udělá přerušení jeho odvodu.';}
  else {s[action]=true;havLog(names[action]);$('havFeedback').textContent=names[action];}
  if(s.cooling&&!s.power) $('havFeedback').textContent='Chlazení je požadováno, ale čerpadla nemají napájení. Samotné zapnutí chlazení zatím nepomůže.';
  else if(s.cooling&&!s.sink) $('havFeedback').textContent='Čerpadla mohou běžet, ale chybí cesta pro předání tepla do okolí.';
  else if(s.cooling&&s.water<75&&!s.injection) $('havFeedback').textContent='Chlazení potřebuje dostatek vody. Únik pokračuje: doplň také chladivo.';
  havRender();
}
function havLog(message) {HAV.log.push(`${fmt(HAV.state.t)} · ${message}`);if(HAV.log.length>12)HAV.log.shift();}
function havAdvance(dt) {
  if(HAV.outcome) return;
  havPhysics(HAV.state,HAV.kind,dt);havPhysics(HAV.reference,HAV.kind,dt);HAV.phase+=dt;
  const s=HAV.state,last=HAV.history.at(-1);
  if(!last||s.t-last.t>=.4) HAV.history.push({t:s.t,heat:s.heat,reference:HAV.reference.heat});
  if(s.damage>=15) {HAV.outcome='damage';havLog('Model dosáhl poškození paliva. Přenos tepla nebyl včas obnoven.');}
  else if(s.stable>=6) {HAV.outcome='stable';havLog('V modelu je šest kroků udrženo účinné chlazení a dostatek vody.');}
  else if(s.t>=65) {HAV.outcome='review';havLog('Konec pozorování: podmínky stabilizace nebyly splněny.');}
  if(HAV.outcome) {HAV.playing=false;HAV.history.push({t:s.t,heat:s.heat,reference:HAV.reference.heat});}
}
function havRender() {
  if(!$('havDiagram'))return;const s=HAV.state,active=s.cooling&&s.power&&s.sink,damaged=s.damage>0;
  $('havPlay').textContent=HAV.playing?'⏸ Pozastavit':'▶ Spustit průběh';$('havPlay').disabled=!!HAV.outcome;$('havStep').disabled=!!HAV.outcome;
  $('havClock').textContent=`Modelový čas: ${fmt(s.t)} · ${HAV.playing?'běží':'pozastaveno'}`;
  for(const [id,value] of [['Heat',s.heat],['Water',s.water],['Damage',s.damage]]){$('hav'+id).textContent=Math.round(value)+' / 100';$('hav'+id+'Meter').value=Math.min(100,value);}
  $('havWaterArt').setAttribute('y',345-s.water*2.44);$('havWaterArt').setAttribute('height',s.water*2.44);
  [...$('havFuel').children].forEach(r=>r.setAttribute('fill',damaged?'#ef655b':s.heat>75?'#ed9550':'#d39f63'));
  $('havCoolingPath').setAttribute('opacity',active?1:.2);$('havHeatArrow').setAttribute('opacity',active?1:.15);
  $('havSinkLabel').textContent=s.sink?'cesta dostupná':'cesta nedostupná';$('havPowerLabel').textContent=s.power?'dostupné':'výpadek';
  $('havFeed').setAttribute('opacity',s.injection&&s.power&&s.reserve>0?1:.12);$('havLeak').setAttribute('opacity',HAV.kind==='leak'?1:0);
  const pos=HAV.flowPath.getPointAtLength(HAV.phase*85%HAV.flowLength);$('havFlowDot').setAttribute('cx',pos.x);$('havFlowDot').setAttribute('cy',pos.y);$('havFlowDot').setAttribute('opacity',active?1:0);
  $('havDecayLabel').textContent=`Zbytkové teplo: ${fmt(s.generation)} · odvod tepla: ${fmt(s.removal)} (modelové hodnoty)`;
  $('havDiagram').setAttribute('aria-label',`Odstavený reaktor. Tepelné zatížení ${Math.round(s.heat)}, voda ${Math.round(s.water)}, poškození ${Math.round(s.damage)}. Napájení ${s.power?'dostupné':'chybí'}, odvod tepla ${active?'aktivní':'neaktivní'}.`);
  $('havReserve').textContent=`Zásoba doplňovací vody: ${Math.round(s.reserve)} / 100. Model sleduje jen krátký úsek; zásoby nejsou neomezené.`;
  document.querySelectorAll('[data-measure]').forEach(b=>{const action=b.dataset.measure;const labels={power:s.power?'⚡ Napájení dostupné':'⚡ Připojit záložní napájení',injection:s.injection?'💧 Doplňování vody zapnuto':'💧 Doplňovat chladivo',cooling:s.cooling?'❄ Vypnout nouzové chlazení':'❄ Zapnout nouzové chlazení',sink:s.sink?'↗ Odvod tepla dostupný':'↗ Zajistit náhradní odvod tepla'};b.textContent=labels[action];b.setAttribute('aria-pressed',String(s[action]));b.disabled=!!HAV.outcome||(action!=='cooling'&&s[action]);});
  const messages={stable:'Odvod tepla stabilizován v tomto pokusu. Zbytkové teplo nekleslo na nulu: chlazení musí pokračovat. Porucha ani další rizika tím nejsou automaticky vyřešené.',damage:'Došlo k poškození paliva v modelu. Pouhé odstavení nestačilo nebo přišel odvod tepla pozdě. Nejde automaticky o únik do okolí. Zopakuj pokus a sleduj vodu, napájení i odvod tepla.',review:'Pozorování skončilo bez dosažení stabilizace. Podívej se na chybějící bezpečnostní funkce a vyzkoušej pokus znovu.'};
  $('havResult').className='hazard-result '+(HAV.outcome||'');const resultText=HAV.outcome?messages[HAV.outcome]:damaged?'Palivo se již poškozuje. Obnovení chlazení dosavadní poškození nevrátí.':active?'Odvod tepla funguje. Sleduj také množství vody a pokles tepelného zatížení.':'Štěpení je zastavené, odvod zbytkového tepla ale zatím není zajištěn.';
  if($('havResult').textContent!==resultText) $('havResult').textContent=resultText;
  const oldLog=$('havLog').dataset.count;if(oldLog!==String(HAV.log.length)+'|'+HAV.log.at(-1)){$('havLog').innerHTML=HAV.log.map(t=>`<li>${t}</li>`).join('');$('havLog').dataset.count=String(HAV.log.length)+'|'+HAV.log.at(-1);}
  havGraph();
}
function havGraph() {
  const end=Math.max(15,HAV.state.t),x=t=>48+t/end*640,y=v=>167-Math.min(100,v)/100*140;
  const line=key=>HAV.history.map((p,i)=>`${i?'L':'M'}${x(p.t)} ${y(p[key])}`).join(' ');
  $('havGraph').innerHTML=`<path d="M48 20V167H690" fill="none" stroke="var(--text-muted)"/><path d="M48 ${y(88)}H690" stroke="var(--border)" stroke-dasharray="4 6"/><text x="52" y="${y(88)-6}" font-size="11">oblast zvýšeného tepelného namáhání v modelu</text><path d="${line('reference')}" fill="none" stroke="var(--warn)" stroke-width="3" stroke-dasharray="6 5"/><path d="${line('heat')}" fill="none" stroke="var(--accent)" stroke-width="3"/><text x="12" y="30">100</text><text x="22" y="171">0</text><text x="48" y="192">0</text><text x="685" y="192" text-anchor="end">${fmt(end)} kroků modelu</text>`;
  $('havCompareText').textContent=`Tepelné zatížení nyní: s tvými opatřeními ${Math.round(HAV.state.heat)}, bez opatření ${Math.round(HAV.reference.heat)}. Oba reaktory mají zastavenou řetězovou reakci.`;
}
function havAnimate() {
  if(HAV.animace)cancelAnimationFrame(HAV.animace);let last=null;
  const frame=t=>{if(!$('havDiagram')){HAV.animace=null;return;}const dt=last===null?0:Math.min(.05,(t-last)/1000);last=t;if(HAV.playing&&!document.hidden){havAdvance(dt*1.5);havRender();}HAV.animace=requestAnimationFrame(frame);};HAV.animace=requestAnimationFrame(frame);
}
