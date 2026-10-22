/* Ekologie: lokální interakce; společné hodnocení a nastavení poskytuje Uloha. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const organisms = [
 {id:'rasy', name:'Řasy', kind:'producenti', x:20, y:128, icon:'algae', intro:'Malé organismy s velkou rolí: fotosyntézou vytvářejí organické látky a uvolňují kyslík.', food:'Potřebují světlo, oxid uhličitý, vodu a minerální živiny. Organickou potravu získávat nemusí.', link:'Planktonní řasy jsou potravou perlooček; řasy mohou přijímat i plotice.', lesson:'Producenty nejsou jen suchozemské rostliny. Ve vodě tuto roli plní také řasy a sinice.'},
 {id:'perloocky', name:'Perloočky', kind:'konzumenti', x:243, y:128, icon:'daphnia', intro:'Drobní korýši filtrují z vody částice potravy včetně planktonních řas.', food:'V našem řetězci přijímají řasy, a jsou tedy konzumenty prvního řádu.', link:'Loví je plotice a mladí okouni. Když perlooček ubude, může zeslábnout jejich vliv na množství řas.', lesson:'I téměř neviditelní živočichové mohou ovlivnit průhlednost vody.'},
 {id:'plotice', name:'Plotice', kind:'konzument', x:466, y:128, icon:'fish', intro:'Plotice obecná je všežravá ryba. Její jídelníček se mění s věkem a nabídkou potravy.', food:'Žere drobné bezobratlé včetně perlooček, ale také řasy a části rostlin.', link:'Menší plotice jsou potravou štik a větších okounů. Plotice propojuje několik cest v potravní síti.', lesson:'Všežravec nemusí mít v každém řetězci stejný potravní stupeň.'},
 {id:'okoun', name:'Okoun', kind:'konzument', x:243, y:263, icon:'perch', intro:'Okoun říční mění potravu během růstu: od planktonu přes bezobratlé až po menší ryby.', food:'Mladí okouni loví perloočky, větší jedinci i menší plotice.', link:'Menší okouny může ulovit štika. Okoun tedy může být predátorem i kořistí.', lesson:'Role predátora a kořisti se nevylučují. Záleží na tom, který vztah sleduješ.'},
 {id:'stika', name:'Štika', kind:'predátor', x:20, y:263, icon:'pike', intro:'Štika obecná obvykle číhá v úkrytu a krátkým výpadem loví ryby.', food:'Loví například plotice a menší okouny. Neživí se jen jediným druhem.', link:'Přes menší ryby může nepřímo ovlivňovat i zooplankton a řasy. Účinek závisí na podobě celé sítě.', lesson:'Úbytek predátora nemusí mít všude stejný následek: kořist má i další zdroje potravy a nepřátele.'},
 {id:'rozkladaci', name:'Bakterie a houby', kind:'rozkladači', x:230, y:391, icon:'microbe', intro:'Rozkládají odumřelé organismy a jejich zbytky ze všech potravních úrovní.', food:'Z rozkládané organické hmoty získávají látky a energii. Část živin se uvolňuje v minerální podobě.', link:'Minerální živiny mohou znovu přijmout producenti. Rozkladači jsou propojeni s celou sítí, ne jen s posledním predátorem.', lesson:'Při intenzivním rozkladu za přístupu kyslíku se kyslík spotřebovává. Nadbytek odumřelé hmoty tak může ohrozit ryby.'}
];
function icon(type) {
 if(type==='algae') return '<g stroke="#4e8c56" stroke-width="3" fill="#8fc475"><path d="M17 25Q7 14 16 2M20 25Q32 14 25 1"/><ellipse cx="10" cy="11" rx="6" ry="3"/><ellipse cx="28" cy="16" rx="7" ry="4"/></g>';
 if(type==='daphnia') return '<g fill="#dbc38d" stroke="#876b48" stroke-width="1.5"><ellipse cx="20" cy="15" rx="10" ry="13"/><path d="M14 5L3 0M24 5L34 0M14 13L7 20M25 13L32 20"/><circle cx="20" cy="7" r="2" fill="#30483d"/></g>';
 if(type==='microbe') return '<g fill="#ac9970" stroke="#6c604b" stroke-width="1.4"><rect x="4" y="3" width="20" height="8" rx="4" transform="rotate(25 14 7)"/><rect x="16" y="19" width="20" height="8" rx="4" transform="rotate(-20 26 23)"/><circle cx="6" cy="24" r="4"/></g>';
 return `<g fill="${type==='pike'?'#7b9666':type==='perch'?'#a7a65f':'#9fb8b4'}" stroke="#486157" stroke-width="1.5"><path d="M3 15L-4 5V25Z"/><path d="M2 15Q20 -1 39 15Q20 31 2 15Z"/><path d="M15 6L21 1L26 7"/><circle cx="31" cy="12" r="2" fill="#20372c"/>${type==='perch'?'<path d="M12 9L14 22M19 6L21 24M26 8L28 21"/>':''}</g>`;
}
function activateSvg(g, callback, label) {
 g.setAttribute('role','button'); g.setAttribute('tabindex','0'); g.setAttribute('aria-label', label);
 g.addEventListener('click', callback);
 g.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') {e.preventDefault(); callback();} });
}
function selectOrgan(id) {
 const o = organisms.find(x=>x.id===id);
 document.querySelectorAll('[data-organ]').forEach(el=>{const selected=el.dataset.organ===id; el.setAttribute('aria-pressed',String(selected)); el.classList.toggle('selected',selected);});
 document.querySelectorAll('.flow').forEach(el=>el.classList.toggle('selected',el.dataset.from===id||el.dataset.to===id));
 $('organ-detail').innerHTML=`<p class="eyebrow">${o.kind}</p><h3>${o.name}</h3><p>${o.intro}</p><dl><dt>Jak získává látky a energii?</dt><dd>${o.food}</dd><dt>S kým souvisí?</dt><dd>${o.link}</dd></dl><div class="remember">${o.lesson}</div>`;
}
$('pond-nodes').innerHTML=organisms.map(o=>`<g class="node" data-organ="${o.id}" transform="translate(${o.x} ${o.y})"><rect width="${o.id==='rozkladaci'?180:140}" height="72" rx="12"/><g transform="translate(14 10)">${icon(o.icon)}</g><text x="${o.id==='rozkladaci'?61:58}" y="26" ${o.id==='rozkladaci'?'style="font-size:12px"':''}>${o.name}</text><text class="kind" x="14" y="59">${o.kind}</text></g>`).join('');
organisms.forEach(o=>{const b=document.createElement('button'); b.type='button'; b.dataset.organ=o.id; b.textContent=o.name; b.addEventListener('click',()=>selectOrgan(o.id)); $('organ-buttons').append(b); activateSvg(document.querySelector(`.node[data-organ="${o.id}"]`),()=>selectOrgan(o.id),o.name);});
selectOrgan('rasy');
const number = n => n.toLocaleString('cs-CZ',{maximumFractionDigits:2});
function energy() {
 const base=Number($('energy-input').value), efficiency=Number($('efficiency').value);
 $('energy-value').textContent=number(base); $('efficiency-value').textContent=efficiency;
 const labels=['Producenti · řasy','Konzumenti I. řádu · perloočky','Konzumenti II. řádu · plotice','Konzumenti III. řádu · štika'];
 $('pyramid').innerHTML=[3,2,1,0].map(i=>`<div class="energy-row"><b>${number(base*(efficiency/100)**i)} kJ</b><span class="small">${labels[i]}</span></div>`).join('');
}
$('energy-input').addEventListener('input',energy); $('efficiency').addEventListener('input',energy); energy();
const scenarios = [
 {name:'Ubude štik', title:'Méně predátorů, více řas?', steps:[['1 · Menší ryby mají méně predátorů','Může přibýt plotic, které loví perloočky.'],['2 · Silnější tlak na perloočky','Perlooček může ubýt, a proto filtrují méně řas.'],['3 · Voda může být zelenější','Řas může přibýt. Jde o nepřímý účinek predátora přes několik potravních úrovní.']], care:'Chránit vhodná stanoviště a řešit skladbu rybí obsádky podle konkrétního rybníka. Samotné přidání štik neodstraní nadbytek živin.', caveat:'Další predátoři, potrava ryb i množství živin mohou předpokládaný výsledek změnit.'},
 {name:'Přiteče moc živin', title:'Eutrofizace: když je živin příliš', steps:[['1 · Přísun dusíku a fosforu','Například splach hnojiv nebo nedostatečně vyčištěná odpadní voda podpoří růst řas a sinic.'],['2 · Více biomasy, později více zbytků','Voda se zakalí, do hloubky proniká méně světla. Část organismů odumírá.'],['3 · Rozklad spotřebovává kyslík','Může vzniknout kyslíkový deficit, zvlášť v noci a u dna. Ohrožené jsou ryby i další organismy.']], care:'Omezit přísun živin u zdroje: účinně čistit odpadní vodu, vhodně hnojit a zachovat vegetační pásy u vody.', caveat:'Při fotosyntéze může být přes den kyslíku u hladiny hodně. To nevylučuje noční nebo hlubinný nedostatek.'},
 {name:'Louka se poseče najednou', title:'Květy zmizí během jediného dne', steps:[['1 · Ubyde nektaru, pylu a úkrytů','Hmyz přijde o velkou část aktuální nabídky potravy a prostředí.'],['2 · Zasažena jsou i vývojová stadia','Housenky a další larvy se nemohou vždy přesunout jinam.'],['3 · Změna se přenese dál','Méně hmyzu může znamenat méně potravy pro hmyzožravé ptáky.']], care:'Sekat mozaikovitě, ponechat část porostu a načasovat péči podle místních druhů. Nejde o úplné zrušení sečení.', caveat:'Bez vhodné péče může louka postupně zarůst keři a stromy a ztratit své luční druhy.'},
 {name:'Potok se napřímí', title:'Voda dostane rychlejší cestu z krajiny', steps:[['1 · Tok se zkrátí a zjednoduší','Ubývají zákruty, tůně a různorodé úkryty.'],['2 · Voda může rychleji odtékat','Zahloubení a odvodnění mohou oslabit kontakt toku s okolní nivou.'],['3 · Ubyde vhodných stanovišť','Vodní a mokřadní organismy ztrácejí část životního prostoru.']], care:'Kde to místní podmínky dovolí, obnovovat přirozenější koryto, nivu a mokřady.', caveat:'Účinek závisí na sklonu, půdě, průtocích a okolní zástavbě. Obnova toku vyžaduje posouzení místa.'}
];
function scenario(i) {
 const s=scenarios[i]; document.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scenario)===i)));
 $('scenario-detail').innerHTML=`<h3>${s.title}</h3><div class="grid">${s.steps.map(([title,text])=>`<div class="effect"><b>${title}</b><span>${text}</span></div>`).join('')}</div><div class="remember"><b>Co pomáhá:</b> ${s.care}</div><p class="small" style="margin-top:12px">${s.caveat}</p>`;
}
scenarios.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.dataset.scenario=i;b.textContent=s.name;b.addEventListener('click',()=>scenario(i));$('scenario-buttons').append(b);});scenario(0);
const actions = {water:'Meandry a mokřad poskytují prostor pro vodu i vodní organismy.',hedge:'Mez s keři nabízí úkryty, propojuje stanoviště a pomáhá omezovat erozi.',flowers:'Neposečené části zachovávají část potravy a úkrytů pro hmyz.'};
function landscape() {
 const selected=[];
 document.querySelectorAll('[data-action]').forEach(input=>{const id=input.dataset.action; $( 'land-'+id).style.display=input.checked?'inline':'none'; if(input.checked)selected.push(actions[id]);});
 const water=document.querySelector('[data-action="water"]').checked;
 document.querySelector('.landscape .drained').style.display=water?'none':'inline';
 $('land-result').textContent=selected.length ? selected.join(' ') : 'Výchozí stav: přímý tok, souvislé pole a jednolitě posečená louka. Vyber opatření a zjisti, komu pomůže.';
 $('land-desc').textContent=selected.length?selected.join(' '):'Pole bez keřové meze, přímý tok a jednolitě posečená louka.';
}
document.querySelectorAll('[data-action]').forEach(i=>i.addEventListener('change',landscape));
$('land-reset').addEventListener('click',()=>{document.querySelectorAll('[data-action]').forEach(i=>i.checked=false);landscape();});landscape();
const areas = [
 {klic:'krkonose',popis:'Krkonošský NP',lon:15.65,lat:50.72,type:'NP',place:'Sever Čech · hranice s Polskem',info:'Nejstarší český národní park, vyhlášený roku 1963. Chrání horskou krajinu včetně arktoalpínské tundry.',care:'Citlivé vrcholové porosty špatně snášejí sešlap. Respektuj vyznačené trasy a omezení.'},
 {klic:'sumava',popis:'NP Šumava',lon:13.60,lat:48.98,type:'NP',place:'Jihozápad Čech · hranice s Německem a Rakouskem',info:'Horské lesy, rašeliniště a ledovcová jezera. Rašeliniště uchovávají uhlík a mají zvláštní vodní režim.',care:'Chránit vodní režim rašelinišť a prostor pro přírodní procesy.'},
 {klic:'podyji',popis:'NP Podyjí',lon:15.90,lat:48.85,type:'NP',place:'Jižní Morava · okolí Znojma',info:'Hluboké údolí řeky Dyje s pestrou mozaikou lesů, skal a teplomilných stanovišť.',care:'Zachovat různorodá stanoviště říčního údolí i na ně vázané druhy.'},
 {klic:'ceskeSvycarsko',popis:'NP České Švýcarsko',lon:14.38,lat:50.88,type:'NP',place:'Severozápad Čech · Děčínsko',info:'Pískovcové skály, rokle a lesy. Známým skalním útvarem je Pravčická brána.',care:'Respektovat uzavírky a chránit citlivá stanoviště; před návštěvou ověřit aktuální přístupnost.'},
 {klic:'palava',popis:'CHKO Pálava',lon:16.65,lat:48.85,type:'CHKO',place:'Jižní Morava · Mikulovsko',info:'Vápencové kopce s teplomilnými trávníky, skalami a dubovými lesy.',care:'Cenné trávníky mohou potřebovat pastvu nebo sečení, aby nezarostly křovinami.'},
 {klic:'beskydy',popis:'CHKO Beskydy',lon:18.35,lat:49.45,type:'CHKO',place:'Východ Moravy a Slezska',info:'Horské lesy, louky a pastviny. Území je důležité také pro velké šelmy.',care:'Udržovat propojení lesních stanovišť a pečovat o cenné horské louky.'},
 {klic:'ceskyRaj',popis:'CHKO Český ráj',lon:15.20,lat:50.55,type:'CHKO',place:'Severovýchod Čech · Turnovsko a Jičínsko',info:'První česká CHKO, vyhlášená roku 1955. Typická jsou pískovcová skalní města.',care:'Omezovat erozi způsobenou sešlapem a zachovat pestrou kulturní krajinu.'},
 {klic:'jeseniky',popis:'CHKO Jeseníky',lon:17.20,lat:50.10,type:'CHKO',place:'Sever Moravy a Slezska · okolí Pradědu',info:'Horské lesy, vysokohorské bezlesí a rašeliniště s druhy vázanými na chladné podmínky.',care:'Chránit citlivé vrcholové prostředí a vodní režim rašelinišť.'},
 {klic:'soutok',popis:'CHKO Soutok',lon:16.97,lat:48.72,type:'CHKO',place:'Jižní Morava · soutok Moravy a Dyje',info:'CHKO vyhlášená s účinností od 1. července 2025. Lužní lesy, louky, tůně a staré solitérní duby.',care:'Obnovovat vodní režim nivy a zachovávat staré stromy i jejich budoucí nástupce.'}
];
function mapMarkup(items, prefix) {
 const holder=document.createElement('div'); holder.innerHTML=Mapy.svg('cesko',items);
 const svg=holder.querySelector('svg');svg.setAttribute('aria-label','Schematická mapa České republiky s očíslovanými body');
 holder.querySelectorAll('.znacka').forEach((g,i)=>{
  const c=g.querySelector('.terc'); c.setAttribute('r',['palava','soutok'].includes(items[i].klic)?'9':'12');g.querySelector('.stred').remove();
  const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',c.getAttribute('cx'));t.setAttribute('y',c.getAttribute('cy'));t.setAttribute('class','map-number');t.textContent=String(i+1);g.append(t);
  activateSvg(g,()=>prefix==='study'?selectArea(items[i].klic):answerMap(g,items[i]),prefix==='study'?`${i+1}. ${items[i].popis}`:`Bod ${i+1}`);
 }); return svg;
}
function selectArea(id) {
 const a=areas.find(x=>x.klic===id);
 document.querySelectorAll('[data-area]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.area===id)));
 $('map-study').querySelectorAll('.znacka').forEach(g=>{const selected=g.dataset.klic===id;g.classList.toggle('selected',selected);g.setAttribute('aria-pressed',String(selected));});
 $('map-detail').innerHTML=`<p class="eyebrow">${a.type} · ${a.place}</p><h3>${a.popis}</h3><p>${a.info}</p><div class="remember"><b>Co potřebuje ochranu?</b><br>${a.care}</div>`;
}
$('map-study').append(mapMarkup(areas,'study'));
areas.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.dataset.area=a.klic;b.textContent=`${i+1} · ${a.popis}`;b.addEventListener('click',()=>selectArea(a.klic));$('map-buttons').append(b);});selectArea('krkonose');
// q, správná odpověď, věrohodné chybné možnosti, vysvětlení, nápověda.
const concepts = [
 ['Co tvoří ekosystém?','Společenstvo a jeho neživé prostředí',['Pouze všechny rostliny a živočichové','Jedinci jednoho druhu na jednom místě','Jen prostředí bez organismů'],'Ekosystém zahrnuje živou i neživou složku a vztahy mezi nimi.','Nezapomeň na vodu, světlo a půdu.'],
 ['Který příklad označuje populaci?','Všechny štiky obecné v jednom rybníce v dané době',['Všechny ryby v českých řekách','Všechny organismy jednoho rybníka','Voda, dno i organismy rybníka'],'Populaci tvoří jedinci stejného druhu na určitém místě v určité době.','Hledej jeden druh, jedno území a určitou dobu.'],
 ['Která skupina patří mezi producenty?','Zelené rostliny a fotosyntetizující řasy',['Houby a žížaly','Perloočky a býložravé ryby','Všechny bakterie bez výjimky'],'Producenti vytvářejí organické látky z anorganických; zde využívají energii světla.','Kdo dokáže fotosyntetizovat?'],
 ['Kam vede šipka řasy → perloočka?','Od potravy k jejímu konzumentovi',['Od lovce ke kořisti','Od rozkladače k producentovi','Od většího organismu k menšímu'],'Šipka v potravním řetězci ukazuje směr předávání organické hmoty a v ní vázané energie.','Ptej se, kdo řasy přijímá jako potravu.'],
 ['Co se při rozkladu může vrátit k producentům?','Minerální živiny',['Veškerá energie původní potravy','Sluneční světlo','Hotové buňky živočichů'],'Rozkladači uvolňují živiny využitelné producenty. Energie se při životních dějích uvolňuje jako teplo.','Rozlišuj látky a energii.'],
 ['Co je abiotický faktor?','Teplota vody',['Počet predátorů','Konkurence o potravu','Napadení parazitem'],'Abiotické faktory jsou neživé podmínky prostředí.','Která možnost nepopisuje působení organismů?'],
 ['Jaký vztah mají čmelák a jím opylovaný jetel?','Mutualismus, oboustranný prospěch',['Konkurence o světlo','Parazitismus','Predace'],'Čmelák získává potravu, jeteli pomáhá přenosem pylu.','V tomto příkladu mají prospěch oba.'],
 ['Kdy vzniká konkurence?','Když organismy využívají stejný omezený zdroj',['Při každém setkání různých druhů','Jen při lovu kořisti','Pouze mezi jedinci stejného druhu'],'Soupeřit lze o světlo, potravu i prostor, uvnitř druhu i mezi druhy.','Rozhodující je omezená dostupnost zdroje.'],
 ['Co znamená sukcese?','Postupnou proměnu společenstva',['Pravidelné střídání dne a noci','Tok energie v jediné potravní vazbě','Sezonní migraci ptáků'],'Například opuštěná louka může postupně zarůstat bylinami, keři a stromy.','Představ si proměnu opuštěné plochy během mnoha let.'],
 ['Producenti mají 10 000 kJ. Kolik přejde při 10% přenosu o dvě úrovně výš?','100 kJ',['1 000 kJ','10 kJ','9 000 kJ'],'První přenos: 10 000 × 0,1 = 1 000 kJ. Druhý: 1 000 × 0,1 = 100 kJ.','Deseti procenty násobíš dvakrát.'],
 ['Musí být konzumentů vždy méně než producentů?','Ne; například jeden strom může živit mnoho housenek',['Ano, každá pyramida počtu má širokou základnu','Ano, počty organismů určují jejich velikosti','Ne, energie přibývá směrem k predátorům'],'Energetická pyramida a pyramida počtu jedinců nejsou totéž.','Porovnej počet stromů s počtem housenek a hmyzožravých ptáků.'],
 ['Co nejlépe vystihuje biodiverzitu?','Rozmanitost genů, druhů a ekosystémů',['Pouze počet jedinců nejhojnějšího druhu','Jen množství zelené hmoty','Pouze počet chráněných území'],'Biodiverzitu sledujeme na více úrovních, nejen jako počet druhů.','Rozmanitost existuje uvnitř druhů i mezi různými prostředími.']
];
const protection = [
 ['Co tvoří českou část soustavy Natura 2000?','Evropsky významné lokality a ptačí oblasti',['Pouze národní parky','Jen všechny chráněné krajinné oblasti','Výhradně zoologické zahrady'],'Soustava chrání vybrané druhy a stanoviště a může se překrývat s dalšími chráněnými územími.','Jde o dvě skupiny lokalit evropské soustavy.'],
 ['Proč ponechávat část mrtvého dřeva v lese?','Poskytuje prostředí organismům a podílí se na koloběhu živin',['Protože se dřevo už nikdy nerozloží','Protože mrtvé dřevo fotosyntetizuje','Aby se z lesa odstranili všichni rozkladači'],'Mrtvé dřevo hostí houby, bezobratlé i další organismy. Při rozkladu se uvolňují živiny.','Mrtvý strom může být živým prostředím.'],
 ['Co může pomoci druhově bohaté louce?','Vhodně načasované mozaikovité sečení nebo pastva',['Trvalé ponechání bez péče za všech podmínek','Pravidelné rozorávání celé plochy','Co největší přísun hnojiv'],'Řada cenných luk závisí na péči, která brání zarůstání a zachovává úkryty i potravu.','Louka může bez péče zarůst, ale plošný zásah může poškodit hmyz.'],
 ['Co hodnotí červený seznam?','Míru ohrožení druhů',['Povolený počet turistů v parku','Pouze nepůvodnost druhů','Automaticky stejnou právní ochranu všech uvedených druhů'],'Ohrožení a zákonná ochrana jsou související, ale odlišné věci.','Vědecké hodnocení ohrožení není samo o sobě právní seznam.'],
 ['Co nejlépe charakterizuje invazní nepůvodní druh?','Šíří se mimo původní areál a ohrožuje místní biodiverzitu',['Každý druh dovezený člověkem','Každý vzácný domácí druh','Každý predátor lovící domácí druhy'],'Ne každý nepůvodní druh je invazní. Podstatné je šíření a negativní dopad na místní přírodu.','Samotný původ mimo území nestačí.'],
 ['K čemu slouží klidová území národního parku?','K omezení rušení citlivé přírody regulací pohybu návštěvníků',['K označení všech parkovišť','K vyznačení míst bez jakékoli ochrany','Jsou jen jiným názvem pro CHKO'],'Klidová území upravují pohyb návštěvníků. Zonace naproti tomu stanovuje především cíle péče o území.','Rozlišuj návštěvní režim a způsob péče o ekosystémy.'],
 ['Která zóna NP má za cíl nerušený průběh přírodních procesů?','Zóna přírodní',['Zóna kulturní krajiny','Zóna soustředěné péče o přírodu','Každá CHKO jako celek'],'Zóna přírodní se vymezuje tam, kde převažují přirozené ekosystémy. Dnešní zonace NP používá názvy čtyř zón.','Hledej název spojený s přirozenými procesy.'],
 ['Proč propojovat stanoviště mezemi a remízky?','Usnadňují pohyb organismů a poskytují úkryty',['Zaručí neomezený růst všech populací','Odstraní veškerou konkurenci','Nahradí všem druhům původní prostředí'],'Propojení krajiny zmírňuje izolaci populací, ale jeho účinek závisí na potřebách konkrétních druhů.','Zkus si představit cestu živočicha přes rozlehlé holé pole.'],
 ['Co chrání CHKO Soutok?','Lužní lesy, louky a mokřady u Moravy a Dyje',['Vrcholovou tundru Krkonoš','Pískovcová skalní města severních Čech','Ledovcová jezera Šumavy'],'CHKO Soutok byla vyhlášena s účinností od 1. července 2025. Klíčová je zde říční niva a její vodní režim.','Název odkazuje na setkání dvou řek na jihu Moravy.'],
 ['Co ověřit před návštěvou chráněného území?','Aktuální pravidla, značení a případné uzavírky',['Jen nejkratší cestu mimo pěšiny','Pouze počet restaurací','Zda lze odnést chráněné rostliny domů'],'Podmínky se mohou měnit podle potřeb ochrany i bezpečnosti. Spolehlivým zdrojem je správa území.','Řiď se aktuálními informacemi příslušné správy.']
];
const impacts = [
 ['V řetězci tráva → hraboš → liška výrazně ubude hrabošů. Co lze očekávat?','Méně potravy pro lišky a menší okus trávy',['Více potravy pro lišky','Silnější okus trávy hraboši','Změní se jen neživé prostředí'],'Úbytek kořisti omezuje potravu predátora a současně oslabuje tlak na producenty.','Sleduj oba sousedy hraboše v řetězci.'],
 ['V jednoduchém řetězci tráva → hraboš → liška ubude lišek. Co může následovat?','Více hrabošů a silnější okus trávy',['Méně hrabošů kvůli silnějšímu lovu','Více trávy díky většímu počtu hrabošů','Úplné zastavení fotosyntézy'],'Menší tlak predátora může umožnit růst populace kořisti. Ve skutečnosti záleží i na dalších vlivech.','Méně lovců může znamenat více přežívající kořisti.'],
 ['V rybníce výrazně přibude ryb živících se perloočkami. Jaký nepřímý důsledek je možný?','Více řas kvůli úbytku perlooček',['Méně řas díky silnějšímu lovu perlooček','Více perlooček kvůli většímu počtu ryb','Žádný vliv na producenty není možný'],'Ryby mohou omezit filtrující perloočky, a tím nepřímo podpořit řasy.','Kdo požírá řasy a kdo požírá jeho?'],
 ['Do rybníka dlouhodobě přitéká nadbytek živin. Co může ohrozit ryby?','Nedostatek kyslíku při rozkladu přemnožené biomasy',['Přeměna veškeré vody na minerální látky','Zastavení všech rozkladných procesů','Přímé pojídání ryb všemi řasami'],'Nadbytek živin podporuje růst řas a sinic. Rozklad odumřelé biomasy může spotřebovat dostupný kyslík.','Přemýšlej, co se děje po odumření velkého množství řas.'],
 ['V sadu ubude opylujícího hmyzu. Co může následovat?','Menší tvorba plodů u druhů závislých na opylení hmyzem',['Vždy více plodů u všech stromů','Okamžité zmizení všech listů','Vyšší tvorba pylu automaticky nahradí přenašeče'],'Opylování je vztah mezi rostlinou a opylovačem. Není to řetězec hmyz → ovoce jako potrava hmyzu.','Přenos pylu je důležitý pro oplození a tvorbu semen.'],
 ['Na cenné louce se mnoho let neseče ani nepase. Co se může stát?','Zaroste keři a stromy, některé luční druhy ustoupí',['Zůstane navždy stejná','Zmizí veškeré rozkládání','Automaticky přibudou všechny ohrožené luční druhy'],'Sukcese mění podmínky, například dostupnost světla. Některá stanoviště vyžadují cílenou péči.','Louka a les poskytují jiné podmínky.'],
 ['Z potoka odstraníme zákruty a prohloubíme koryto. Jaký je možný důsledek?','Rychlejší odtok a úbytek pestrých vodních stanovišť',['Vždy větší propojení toku s nivou','Automatický vznik nových mokřadů','Stejné podmínky pro všechny druhy jako předtím'],'Napřímení zjednodušuje koryto a může omezit zadržování vody v okolní nivě.','Představ si rozdíl mezi přímým kanálem a členitým tokem.'],
 ['Proč ponechat při sečení část louky neposečenou?','Zachová část potravy a úkrytů pro hmyz',['Aby se zastavila všechna sukcese navždy','Protože hmyz využívá výhradně holou půdu','Aby rostliny nepotřebovaly světlo'],'Mozaikovitá péče zachovává různá stadia porostu a zmírňuje náhlý výpadek zdrojů.','Co by hmyzu chybělo po posečení celé louky?']
];
const banks={pojmy:concepts, zasah:impacts, ochrana:protection};
const score=Uloha.skore('metodus_pr9_ekologie',$('skore'));
let mode='pojmy', revision=0, currentMap=null;
const decks={};
function nextItem(key,items) {
 if(!decks[key]||!decks[key].length) decks[key]=Uloha.zamichej(items);
 return decks[key].pop();
}
function feedback() {const d=document.createElement('div');d.className='odezva';d.setAttribute('role','status');d.setAttribute('aria-live','polite');return d;}
function nextGuard(token) {return ()=>{if(revision===token) nextQuiz(true);};}
function finished(first) {score.vyhodnot(first);$('btnDalsi').textContent='Další otázka →';}
function answerMap(g,area) {
 if(!currentMap)return;
 const m=currentMap;
 Uloha.odpoved({prvek:g,spravne:area.klic===m.target.klic,stav:m.state,odezva:m.feedback,zpravaOk:`Správně. ${m.target.popis}: ${m.target.info}`,zpravaChyba:`Tento bod označuje ${area.popis}. Hledej: ${m.target.place}.`,poSpravne:finished,dalsi:nextGuard(m.token),prodleva:6500});
}
function nextQuiz(focus=false) {
 revision++;const token=revision;currentMap=null;$('btnDalsi').textContent='Přeskočit →';
 const p=$('plocha');p.replaceChildren();
 const label=document.createElement('p');label.className='quiz-label';label.textContent=mode==='mapa'?'Urči polohu podle mapy. Body vybírej kliknutím nebo klávesami Tab a Enter.':'Vyber jednu správnou odpověď.';p.append(label);
 const heading=document.createElement('h3');heading.tabIndex=-1;p.append(heading);
 const response=feedback();
 if(mode==='mapa') {
  const target=nextItem('mapa',areas);
  // Každá úloha obsahuje cíl, ale číslování i nabídka se mění.
  const items=Uloha.zamichej([target,...Uloha.zamichej(areas.filter(a=>a!==target)).slice(0,5)]);
  heading.textContent=`Najdi na mapě: ${target.popis}`;
  currentMap={target,state:{chyboval:false,hotovo:false},feedback:response,token};
  const svg=mapMarkup(items,'quiz');p.append(svg);
  const fallback=document.createElement('div');fallback.className='buttons';fallback.setAttribute('aria-label','Výběr bodu na mapě');
  items.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`Bod ${i+1}`;b.addEventListener('click',()=>answerMap(svg.querySelector(`[data-klic="${a.klic}"]`),a));fallback.append(b);});p.append(fallback);
 } else {
  const u=nextItem(mode,banks[mode]);heading.textContent=u[0];
  Uloha.vyber({kam:p,odezva:response,moznosti:Uloha.zamichej([u[1],...u[2]]).map(t=>({klic:t,popis:t})),spravnyKlic:u[1],zpravaOk:`Správně. ${u[3]}`,zpravaChyba:`Ještě ne. ${u[4]}`,poSpravne:finished,dalsi:nextGuard(token),prodleva:6500});
 }
 p.append(response);if(focus)heading.focus({preventScroll:true});
}
document.querySelectorAll('#rezimy button').forEach(b=>b.addEventListener('click',()=>{
 mode=b.dataset.rezim;document.querySelectorAll('#rezimy button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});nextQuiz();
}));$('btnDalsi').addEventListener('click',()=>nextQuiz(true));nextQuiz();
})();
