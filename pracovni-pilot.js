(() => {
 if(new URLSearchParams(location.search).get('lekce')!=='ch9_ph')return;
 document.body.classList.add('list-pilot');
 const host=document.createElement('section');host.id='listPilot';host.className='propojeni';
 host.innerHTML=`<h1>Pracovní list · pH a neutralizace</h1><p>Jméno: _____________________ Datum: _____________________</p><p>Model vodných zředěných roztoků při 25 °C. Vysvětli postup vlastními slovy.</p>
 <h2>1. Porovnej roztoky</h2><p>A má pH 2, B má pH 5. Který má vyšší koncentraci H₃O⁺ a přibližně kolikrát?</p><div class="psani"></div>
 <h2>2. Najdi hranici</h2><p>Zařaď pH 6, 7 a 8 jako kyselé, neutrální nebo zásadité. Proč není celé rozmezí 6–8 neutrální?</p><div class="psani"></div>
 <h2>3. Zachovej atomy</h2><p>Doplň koeficienty: H₂SO₄ + ___ NaOH → Na₂SO₄ + ___ H₂O. Ověř počty atomů Na a H na obou stranách.</p><div class="psani"></div>
 <div class="noprint"><button id="tiskPilotu" type="button">Vytisknout / uložit PDF</button><p>Tisk obsahuje jen tento žákovský list. Klíč zůstává na obrazovce.</p><details><summary>Klíč pro učitele</summary><p>1. A, přibližně 1000× (10³). 2. Kyselé, neutrální, zásadité; neutrální je při 25 °C pH 7. 3. Oba koeficienty jsou 2; vlevo i vpravo jsou 2 atomy Na a 4 atomy H.</p></details><p><a href="priprava_hodiny.html#zaver">Další krok: závěrečná otázka →</a> · <a href="pracovni_listy.html">Běžný generátor listů</a></p></div>`;
 document.querySelector('.wrap').prepend(host);
 document.querySelector('.app').hidden=true;
 host.querySelector('button').onclick=()=>window.print();
})();
