/* ============================================================
   osa-kviz.js – kvíz k časovým osám (české i světové dějiny).

   Obě stránky mají stejné režimy a stejné chování, proto je kvíz
   jen jeden: přehled (osa) a tři série nad společnými daty
   data/udalosti.js – rok → událost, událost → rok a napiš letopočet
   (s tolerancí ±3 roky, u starověku ±50). Série běží v procvic.js,
   takže mají druhý pokus, přehled chyb a napojení na Ověř se.

   Stránka potřebuje prvky #rezimy (tlačítka data-rezim; přehled má
   data-faze="vyuka"), #prehledObal, #plocha, #ovladani, #startBtn,
   #pokrok, #skore a zavolá:
     OsaKviz.spust({ pruh: 'cr' | 'svet', klic: 'metodus_…' });
   ============================================================ */
const OsaKviz = (function () {
  const rok = r => r < 0 ? `${-r} př. n. l.` : String(r);

  function spust({ pruh, klic, pocet = 10 }) {
    const $ = id => document.getElementById(id);
    const UD = METODUS_UDALOSTI.filter(u => u.pruh === pruh);
    let rezim = 'prehled', posledni = null;

    // nová událost, ne dvakrát za sebou tatáž
    function vyber() {
      let u; do { u = Uloha.nahodne(UD); } while (UD.length > 1 && u === posledni);
      posledni = u;
      return u;
    }
    // tři jiné události s jiným rokem (roky se v pruhu neopakují, ale pro jistotu)
    const jine = u => Uloha.zamichej(UD.filter(x => x.rok !== u.rok)).slice(0, 3);

    function generuj(r) {
      const u = vyber();
      const popis = u.popis ? ` – ${u.popis}` : '';
      if (r === 'rokudalost') {
        return {
          zadani: `<span class="druh">Co se stalo v roce</span><span class="rok">${rok(u.rok)}</span>`,
          odpoved: u.nazev,
          moznosti: Uloha.zamichej([u.nazev, ...jine(u).map(x => x.nazev)]),
          tridaMoznosti: 'udalosti',
          napoveda: rok(u.rok),
        };
      }
      if (r === 'udalostrok') {
        return {
          zadani: `<span class="druh">Ve kterém roce?</span><span class="fakt">${u.nazev}</span>`,
          odpoved: rok(u.rok),
          moznosti: Uloha.zamichej([rok(u.rok), ...jine(u).map(x => rok(x.rok))]),
          napoveda: u.nazev + popis,
        };
      }
      // napiš letopočet: př. n. l. se píše se znaménkem minus
      return {
        zadani: `<span class="druh">Napiš rok${u.rok < 0 ? ' (před n. l. se znaménkem −)' : ''}</span><span class="fakt">${u.nazev}</span>`,
        odpoved: u.rok,
        tolerance: u.rok < 0 ? 50 : 3,
        napoveda: rok(u.rok) + popis,
      };
    }

    const serie = Procvic.spust({
      klic, pocet, typ: 'number',
      plocha: $('plocha'), skoreEl: $('skore'), pokrokEl: $('pokrok'),
      rezim: () => rezim, generuj,
    });

    $('rezimy').addEventListener('click', e => {
      const b = e.target.closest('button[data-rezim]');
      if (!b) return;
      $('rezimy').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      rezim = b.dataset.rezim;
      const prehled = rezim === 'prehled';
      $('prehledObal').hidden = !prehled;
      $('plocha').hidden = $('ovladani').hidden = prehled;
      posledni = null;
      if (!prehled) serie.restart();
    });
    $('startBtn').onclick = () => serie.restart();
    return serie;
  }

  return { spust, rok };
})();
