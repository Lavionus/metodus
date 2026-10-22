/* ============================================================
   vyklad.js – chování společného výkladu a vedeného příkladu (22. 10. 2026).

   Značky ve stránce (vše statické HTML, žádná data v JS):

     <details class="vyklad" data-faze="vyuka">
       <summary>📖 Výklad: Název tématu</summary>
       <div class="obsah"> … odstavce, .vyklad-karty > .vyklad-karta, <aside class="zapamatuj"> … </div>
     </details>

     <details class="ukazka-kroky" data-faze="ukazka">
       <summary>📘 Ukázka: řešený příklad</summary>
       <div class="obsah">
         <p class="zadani-ukazky">Zadání…</p>
         <ol class="kroky"><li>krok 1</li><li>krok 2</li>…</ol>
         <p class="vysledek-ukazky">Výsledek…</p>
       </div>
     </details>

   Výklad i ukázka jsou ve výchozím stavu sbalené, aby procvičování zůstalo nahoře.
   Otevřou se kliknutím na nadpis nebo volbou fáze v kostře (událost metodus:faze).
   Ukázka odkrývá kroky tlačítkem „Další krok →“ (nebo „Ukázat celé řešení“).
   ============================================================ */
(function () {
  'use strict';
  function pripravUkazku(blok) {
    const kroky = [...blok.querySelectorAll('ol.kroky > li')];
    const vysledek = blok.querySelector('.vysledek-ukazky');
    if (!kroky.length || blok.querySelector('.ovladani-kroku')) return;
    let ukazano = 0;
    const ovl = document.createElement('div');
    ovl.className = 'ovladani-kroku';
    const dalsi = document.createElement('button');
    dalsi.type = 'button'; dalsi.className = 'hlavni'; dalsi.textContent = 'Další krok →';
    const vse = document.createElement('button');
    vse.type = 'button'; vse.textContent = '👁️ Ukázat celé řešení';
    const znovu = document.createElement('button');
    znovu.type = 'button'; znovu.textContent = '↺ Od začátku';
    const stav = document.createElement('span');
    stav.className = 'stav'; stav.setAttribute('aria-live', 'polite');
    ovl.append(dalsi, vse, znovu, stav);
    (vysledek || kroky[kroky.length - 1].parentElement).after(ovl);

    function vykresli(novy) {
      kroky.forEach((li, i) => {
        li.classList.toggle('skryty', i >= ukazano);
        li.classList.toggle('novy', i === novy);
      });
      const hotovo = ukazano >= kroky.length;
      if (vysledek) vysledek.classList.toggle('skryty', !hotovo);
      dalsi.disabled = hotovo; vse.disabled = hotovo; znovu.hidden = ukazano === 0;
      stav.textContent = hotovo ? 'Hotovo – teď to zkus sám v procvičování.' : `Krok ${ukazano} z ${kroky.length}`;
    }
    dalsi.addEventListener('click', () => { ukazano++; vykresli(ukazano - 1); });
    vse.addEventListener('click', () => { ukazano = kroky.length; vykresli(-1); });
    znovu.addEventListener('click', () => { ukazano = 0; vykresli(-1); dalsi.focus(); });
    vykresli(-1);
  }

  function start() {
    document.querySelectorAll('.ukazka-kroky').forEach(pripravUkazku);
    // volba fáze v kostře otevře odpovídající blok
    document.addEventListener('metodus:faze', e => {
      const id = e.detail && e.detail.id;
      const blok = id === 'vyuka' ? document.querySelector('details.vyklad')
        : id === 'ukazka' ? document.querySelector('details.ukazka-kroky') : null;
      if (blok) blok.open = true;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
