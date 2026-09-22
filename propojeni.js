(() => {
  const host=document.getElementById('ucelVyuky');
  if(!host || typeof KATALOG_SEKCE==='undefined')return;
  const lessons=[...new Map(KATALOG_SEKCE.flatMap(s=>s.polozky).filter(p=>p.vyuka).map(p=>[p.soubor,p])).values()];
  host.innerHTML='<h2>Co chci v hodině dělat?</h2><label for="ucel">Vyber účel</label><select id="ucel"><option value="vyklad">Vysvětlit na vedeném příkladu</option><option value="model">Zkoumat a měnit model</option><option value="badani">Pracovat s pramenem</option><option value="procvicovani">Procvičovat</option><option value="hodina">Připravit celou hodinu</option></select><p class="meta">Pět pilotních lekcí s konkrétním cílem a návaznostmi. Ostatní aplikace najdeš v katalogu; jejich rozsah zde zatím není posouzený.</p><div id="vysledkyUcelu" aria-live="polite"></div>';
  const box=host.querySelector('#vysledkyUcelu');
  function render(){
    const purpose=host.querySelector('select').value;box.replaceChildren();
    if(purpose==='hodina') {
      box.innerHTML='<p>Ověřený průchod pro 9. ročník: pH → společná aktivita → pracovní list → závěrečná otázka.</p><a href="priprava_hodiny.html">Otevřít přípravu hodiny o pH →</a>';return;
    }
    lessons.filter(p=>purpose==='vyklad'||p.vyuka.typy.includes(purpose)).forEach(p=>{
      const card=document.createElement('article');card.className='lekce';
      const title=document.createElement('h3');title.textContent=p.nazev;
      const goal=document.createElement('p');goal.textContent=p.vyuka.cil;
      const a=document.createElement('a');a.textContent=purpose==='procvicovani'?'Otevřít procvičování →':'Otevřít vedenou aktivitu →';
      // Přímý relativní odkaz zachová kotvu i uvnitř pracovní plochy rozcestníku.
      a.href=p.soubor.replace(/^obsah\//,'')+p.vyuka.vstupy[purpose==='procvicovani'?'procvicovani':'vyklad'];
      const links=document.createElement('p');links.className='meta';
      for(const [label,files] of [['Nejdřív',p.vyuka.predchozi],['Potom',p.vyuka.dalsi]]){
        links.append(label+': ');
        files.forEach((f,i)=>{const link=document.createElement('a');link.href=f.replace(/^obsah\//,'');link.textContent=KATALOG_SEKCE.flatMap(s=>s.polozky).find(x=>x.soubor===f)?.nazev||f;links.append(link,i<files.length-1?' · ':' ');});
      }
      card.append(title,goal,a,links);box.append(card);
    });
  }
  host.querySelector('select').addEventListener('change',render);render();
})();
