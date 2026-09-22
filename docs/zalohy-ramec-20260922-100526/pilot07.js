/* Samostatné, nebodované aktivity; náhodné procvičování používá dál Uloha. */
(() => {
  'use strict';
  const root = document.querySelector('[data-pilot]');
  if (!root) return;
  const $ = id => root.querySelector('#' + id);
  const feedback = text => { $('pilotResult').textContent = text; };
  const result = '<div id="pilotResult" class="pilot-result" role="status" aria-live="polite"></div>';
  const resetButton = '<button id="pilotReset" type="button">Začít znovu</button>';
  const format = n => n.toLocaleString('cs-CZ', { maximumFractionDigits: 4 });

  function ph() {
    root.innerHTML = `<h2>Nejdřív předpověz, pak porovnej pH</h2>
      <p>Dva modelové vodné roztoky při 25 °C. Posuň hodnoty a odhadni, který má nižší pH. Barvy v lekci označují prostředí, nikoli skutečný vzhled roztoku.</p>
      <div class="pilot-grid">${['A','B'].map((x,i) => `<div><label for="ph${x}">Roztok ${x}: pH <output id="value${x}">${i ? 5 : 3}</output></label><input id="ph${x}" type="range" min="0" max="14" step="1" value="${i ? 5 : 3}"><div class="pilot-scale"><span>0 · kyselé</span><span>7</span><span>14 · zásadité</span></div></div>`).join('')}</div>
      <label for="phGuess">Který roztok má nižší pH?</label><select id="phGuess"><option value="">Vyber předpověď</option><option value="A">A</option><option value="B">B</option><option value="same">Mají stejné pH</option></select>
      <div class="pilot-actions"><button id="phCheck">Ověřit předpověď</button>${resetButton}</div>${result}
      <details><summary>Co znamená rozdíl jednoho pH?</summary><p>V modelu zředěných roztoků odpovídá pokles pH o 1 přibližně desetinásobné koncentraci oxoniových iontů H₃O⁺. Rozdíl 2 znamená stonásobek. Samotné pH neříká, zda jde o silnou kyselinu: záleží také na koncentraci.</p></details>
      <details><summary>Neutralizace: proč před vzorcem stojí číslo?</summary><p><b>H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O</b></p><p>Na obou stranách jsou 4 atomy H, 1 atom S, 6 atomů O a 2 atomy Na. Koeficient 2 násobí celý vzorec; dolní index je součást vzorce a při vyčíslování jej neměníme. Rovnice popisuje úplnou neutralizaci. Výsledné pH není vždy 7: záleží na látkách i jejich množství.</p></details>`;
    const clear = () => {
      for (const x of ['A','B']) $('value'+x).textContent = $('ph'+x).value;
      $('phGuess').value = ''; feedback('Zvol předpověď a ověř ji.');
    };
    for (const x of ['A','B']) $('ph'+x).addEventListener('input',clear);
    $('phCheck').onclick = () => {
      if (!$('phGuess').value) return feedback('Nejdřív vyber A, B, nebo stejné pH.');
      const a = +$('phA').value, b = +$('phB').value, right = a === b ? 'same' : a < b ? 'A' : 'B';
      const kind = n => n < 7 ? 'kyselé' : n > 7 ? 'zásadité' : 'neutrální';
      feedback(($('phGuess').value === right ? 'Správně. ' : 'Zkus porovnat čísla ještě jednou. ') +
        `A: pH ${a}, ${kind(a)} prostředí. B: pH ${b}, ${kind(b)} prostředí. ` +
        (a === b ? 'Stejné pH znamená v tomto modelu stejnou koncentraci H₃O⁺.' : `Nižší pH má ${right}; v modelu zředěných roztoků má přibližně ${format(10 ** Math.abs(a-b))}× vyšší koncentraci H₃O⁺. Rozdíl pH je ${Math.abs(a-b)}, poměr koncentrací není tento rozdíl.`));
    };
    $('pilotReset').onclick = () => { $('phA').value=3; $('phB').value=5; clear(); };
    clear();
  }

  function speech() {
    root.innerHTML = `<h2>Jeden rozhovor, dva vypravěči</h2><p><b>Pondělí, knihovna:</b> Anna říká Benovi:</p>
      <blockquote lang="en">“I will meet you here tomorrow.”</blockquote>
      <p><b>Středa, škola:</b> rozhovor převyprávíme Claře. V této ukázce použijeme posun času po <span lang="en">told</span>.</p>
      <label for="narrator">Kdo teď vypráví?</label><select id="narrator"><option value="ben">Ben (původní adresát)</option><option value="anna">Anna (původní mluvčí)</option></select>
      <p id="speechSentence" lang="en"></p><p id="speechStep"></p>
      <div class="pilot-actions"><button id="speechNext">Ukázat další změnu</button>${resetButton}</div>
      <fieldset><legend>Než ukážeme výsledek: na který den odkazuje „tomorrow“?</legend><label><input type="radio" name="day" value="tue"> Na úterý po původním rozhovoru</label><label><input type="radio" name="day" value="thu"> Na čtvrtek po vyprávění</label></fieldset>
      <button id="speechCheck">Ověřit den</button>${result}<p><small>Změna here → there odpovídá přesunu z knihovny do školy. Na stejném místě by here mohlo zůstat; zájmena se mění podle osob, nikoli podle pevné tabulky.</small></p>`;
    let step = 0;
    const render = () => {
      const ben = $('narrator').value === 'ben';
      const tokens = [ben ? 'she' : 'I', 'would', ben ? 'me' : 'him', 'there', 'the next day'];
      const original = ['I','will','you','here','tomorrow'];
      const part = i => step > i ? `<mark>${tokens[i]}</mark>` : original[i];
      $('speechSentence').innerHTML = step === 5 ? `${ben ? 'Anna told me' : 'I told Ben'} (that) ${tokens[0]} ${tokens[1]} meet ${tokens[2]} ${tokens[3]} ${tokens[4]}.` : `${part(0)} ${part(1)} meet ${part(2)} ${part(3)} ${part(4)}.`;
      const explanations = ['Nejdřív urči, kdo je I: v původní větě Anna.', ben ? 'I → she: Ben mluví o Anně.' : 'I zůstává I: Anna mluví sama o sobě.', 'will → would: v této úloze posouváme čas.', ben ? 'you → me: Ben byl adresát a teď mluví o sobě.' : 'you → him: Anna mluví o Benovi.', 'here → there: knihovna je jinde než místo vyprávění.', 'tomorrow → the next day: stále úterý. Celá věta používá told + adresát bez to.'];
      $('speechStep').textContent = `Krok ${step+1} ze 6. ${explanations[step]}`;
      $('speechNext').disabled = step === 5;
    };
    $('speechNext').onclick = () => { if(step < 5) step++; render(); };
    $('narrator').onchange = () => { step=0; render(); feedback('Změnil se vypravěč. Sleduj především zájmena.'); };
    $('speechCheck').onclick = () => {
      const day = root.querySelector('input[name=day]:checked')?.value;
      feedback(!day ? 'Nejdřív vyber den.' : day === 'tue' ? 'Správně: Anna v pondělí myslela úterý. Vyprávění ve středu tento den nemění.' : 'Čtvrtek by byl zítřek vypravěče ve středu. Původní tomorrow ale označovalo úterý.');
    };
    $('pilotReset').onclick = () => {step=0; $('narrator').value='ben'; root.querySelectorAll('[name=day]').forEach(x=>x.checked=false); render(); feedback('Projdi změny a urči den schůzky.');};
    $('speechStep').setAttribute('aria-live','polite'); $('pilotReset').click();
  }

  function history() {
    root.innerHTML = `<h2>Co nám opravdu říká pramen?</h2>
      <p><b>Zákon ze dne 28. října 1918 o zřízení samostatného státu československého</b>, později č. 11/1918 Sb. Níže je krátký doslovný přepis začátku, nikoli fotografie listiny.</p>
      <blockquote>„Samostatný stát československý vstoupil v život.“</blockquote>
      <details><summary>Pramenná karta: kdo, kdy a proč</summary><p>Vydal Národní výbor; návrh textu připravil Alois Rašín. Zákon byl veřejně vyhlášen 28. října 1918, ve Sbírce vyšel 6. listopadu. Účelem bylo ustavit nový stát a zajistit pokračování právního řádu. Jde o úřední písemný pramen, který něco vyhlašuje; není to průzkum názorů obyvatel.</p></details>
      <p><a href="https://www.zakonyprolidi.cz/cs/1918-11">Úplný přepis zákona</a> · <a href="https://www.psp.cz/sqw/hp.sqw?k=1701&amp;z=11928">Parlamentní knihovna: okolnosti vzniku a vyobrazení listiny</a>. Odkazy potřebují internet, ukázka zde funguje i bez něj.</p>
      <div class="pilot-grid"><div><label for="sourceAuthor">Kdo zákon vydal?</label><select id="sourceAuthor"><option value="">Vyber původce</option><option value="committee">Národní výbor</option><option value="historian">Dnešní historik</option></select></div>
      <div><label for="sourceDate">Kdy byl veřejně vyhlášen?</label><select id="sourceDate"><option value="">Vyber datum</option><option value="oct">28. října 1918</option><option value="nov">6. listopadu 1918</option></select></div>
      <div><label for="sourcePurpose">K čemu sloužil?</label><select id="sourcePurpose"><option value="">Vyber účel</option><option value="law">Ustavit stát a upravit právní přechod</option><option value="poll">Zjistit názory všech obyvatel</option></select></div></div>
      <fieldset><legend>1. Který závěr doložíš citovanou větou?</legend><label><input type="radio" name="claim" value="state"> Text vyhlašuje existenci samostatného československého státu.</label><label><input type="radio" name="claim" value="all"> Všichni obyvatelé se vznikem státu souhlasili.</label><label><input type="radio" name="claim" value="president"> Věta určuje jméno prvního prezidenta.</label></fieldset>
      <label for="evidence">2. Vyber slova, která jsou pro závěr dokladem</label><select id="evidence"><option value="">Vyber doklad</option><option value="life">„Samostatný stát československý vstoupil v život.“</option><option value="date">Datum vydání 28. října 1918</option></select>
      <div class="pilot-actions"><button id="historyCheck">Ověřit závěr a doklad</button>${resetButton}</div>${result}
      <details><summary>Co zkusí historik dál?</summary><p>Názory obyvatel by porovnával v dopisech, denících a dobovém tisku různých skupin. Ani jeden nadšený dopis nedokládá souhlas všech. Název dokumentu a datum pomáhají určit původ; závěr o jeho obsahu musíme opřít o konkrétní pasáž.</p></details>`;
    $('historyCheck').onclick = () => {
      if (!$('sourceAuthor').value || !$('sourceDate').value || !$('sourcePurpose').value) return feedback('Vyber původce, dobu a účel. Odpovědi najdeš v pramenné kartě.');
      if ($('sourceAuthor').value !== 'committee') return feedback('Zákon vydal Národní výbor v roce 1918. Dnešní historik jej zkoumá; není jeho původcem.');
      if ($('sourceDate').value !== 'oct') return feedback('Rozliš dvě události: veřejné vyhlášení 28. října a vydání ve Sbírce 6. listopadu 1918.');
      if ($('sourcePurpose').value !== 'law') return feedback('Zákon ustavuje stát a upravuje právní přechod. Nesbírá názory obyvatel jako průzkum.');
      const c = root.querySelector('[name=claim]:checked')?.value, e=$('evidence').value;
      if(!c || !e) return feedback('Vyber závěr i jeho doklad. Pramenná karta ti pomůže určit původ a účel.');
      if(c === 'all') return feedback('Úřední vyhlášení nedokládá souhlas všech obyvatel. Potřeboval bys další prameny zachycující jejich postoje.');
      if(c === 'president') return feedback('V citované větě není jméno prezidenta. Tento závěr úryvek nedokládá.');
      feedback(e === 'life' ? 'Správně: závěr dokládají slova „vstoupil v život“. Zákon vyhlašuje stát; z této věty nelze zjistit postoje všech obyvatel.' : 'Závěr je správný, ale datum dokládá dobu dokumentu. Pro vznik státu vyber slova z citované věty.');
    };
    $('pilotReset').onclick=()=>{root.querySelectorAll('[name=claim]').forEach(x=>x.checked=false);$('evidence').value='';['sourceAuthor','sourceDate','sourcePurpose'].forEach(id=>$(id).value='');feedback('Přečti úryvek a pramennou kartu. Pak spoj závěr s dokladem.');};
    $('pilotReset').click();
  }

  function sheet() {
    root.innerHTML = `<h2>Malá tabulka, živý vzorec</h2><p>V B2 a B3 jsou počty přečtených stran. B4 obsahuje vzorec. Před změnou odhadni: co se stane se součtem, když B2 zvýšíš o 5?</p>
      <table><caption>Čtení za dva dny · uprav buňky B2 a B3</caption><thead><tr><th scope="col">Řádek</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody><tr><th scope="row">1</th><td>Den</td><td>Strany</td></tr><tr><th scope="row">2</th><td>Pondělí</td><td><input id="cellB2" aria-label="B2, strany v pondělí" type="number" min="0" max="1000" step="1" value="12"></td></tr><tr><th scope="row">3</th><td>Úterý</td><td><input id="cellB3" aria-label="B3, strany v úterý" type="number" min="0" max="1000" step="1" value="8"></td></tr><tr><th scope="row">4</th><td>Výsledek vzorce</td><td><output id="cellB4">20</output></td></tr></tbody></table>
      <label for="sheetFormula">Vzorec v B4</label><input class="formula" id="sheetFormula" value="=SUMA(B2:B3)" spellcheck="false" aria-describedby="formulaHelp">
      <p id="formulaHelp"><small>Tato minitabulka umí =B2+B3, =B2-B3, =B2*B3, =B2/B3 a funkce SUMA, PRŮMĚR, MIN, MAX pro oblast B2:B3. Čísla jsou celá od 0 do 1000. Jiné vzorce zde nejsou podporované.</small></p>
      <label for="sheetGuess">Při zvýšení B2 o 5 se součet…</label><select id="sheetGuess"><option value="">Vyber předpověď</option><option value="five">zvýší o 5</option><option value="same">nezmění</option><option value="ten">zvýší o 10</option></select>
      <div class="pilot-actions"><button id="sheetExperiment">Ověřit na příkladu 12 + 8 → 17 + 8</button>${resetButton}</div>${result}`;
    const update=()=>{
      const inputs=[$('cellB2'),$('cellB3')];
      const invalid=inputs.some(x=>x.value==='' || !x.validity.valid || !Number.isFinite(x.valueAsNumber));
      inputs.forEach(x=>x.setAttribute('aria-invalid',String(x.value==='' || !x.validity.valid)));
      if(invalid){$('cellB4').textContent='—';feedback('Vyplň obě vstupní buňky celými čísly od 0 do 1000. Prázdná buňka zde není nula.');return;}
      const [a,b]=inputs.map(x=>x.valueAsNumber), f=$('sheetFormula').value.toUpperCase().replace(/\s/g,'');
      const formulas={'=B2+B3':()=>a+b,'=B2-B3':()=>a-b,'=B2*B3':()=>a*b,'=B2/B3':()=>b===0?null:a/b,'=SUMA(B2:B3)':()=>a+b,'=PRŮMĚR(B2:B3)':()=>(a+b)/2,'=MIN(B2:B3)':()=>Math.min(a,b),'=MAX(B2:B3)':()=>Math.max(a,b)};
      $('sheetFormula').setAttribute('aria-invalid',String(!Object.hasOwn(formulas,f)));
      if(!Object.hasOwn(formulas,f)){$('cellB4').textContent='—';feedback('Nepodporovaný vzorec. Začni znakem = a použij jeden z uvedených vzorců s B2 a B3.');return;}
      const value=formulas[f]();
      $('cellB4').textContent=value===null?'#DĚLENÍ/0!':format(value);
      feedback(value===null?'Nulou nelze dělit. Změň dělitel B3.':`B4: ${f} → ${format(value)}. Vstupy jsou B2 = ${a} a B3 = ${b}. Vzorec zůstává, výsledek se přepočítá z aktuálních hodnot.`);
    };
    ['cellB2','cellB3','sheetFormula'].forEach(id=>$(id).addEventListener('input',()=>{ $('sheetGuess').value='';update();}));
    $('sheetExperiment').onclick=()=>{
      const guess=$('sheetGuess').value;
      if(!guess)return feedback('Nejprve předpověz změnu součtu.');
      $('cellB2').value=17;$('cellB3').value=8;$('sheetFormula').value='=SUMA(B2:B3)';update();
      feedback((guess==='five'?'Správně. ':'Porovnej původní a nový součet. ')+'12 + 8 = 20 → 17 + 8 = 25. B2 vzrostlo o 5, součet také. Vzorec =SUMA(B2:B3) se nezměnil. Nyní zkus vlastní čísla nebo jiný vzorec.');
    };
    $('pilotReset').onclick=()=>{$('cellB2').value=12;$('cellB3').value=8;$('sheetFormula').value='=SUMA(B2:B3)';$('sheetGuess').value='';update();};update();
  }
  ({ch9_ph:ph,aj9_neprima_rec:speech,d6_prameny:history,inf6_tabulky:sheet})[root.dataset.pilot]();
  if (root.dataset.pilot === 'ch9_ph' && new URLSearchParams(location.search).get('tabule') === '1') {
    document.body.classList.add('pilot-tabule');
    const back=document.createElement('a');back.href='priprava_hodiny.html';back.textContent='← Zpět k průběhu hodiny';root.prepend(back);
  }
  document.querySelectorAll('a[data-lekce]').forEach(a=>a.addEventListener('click',e=>{
    if(window.parent===window || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button!==0)return;
    e.preventDefault();window.parent.postMessage({otevri:'obsah/'+a.getAttribute('href')},location.origin);
  }));
})();
