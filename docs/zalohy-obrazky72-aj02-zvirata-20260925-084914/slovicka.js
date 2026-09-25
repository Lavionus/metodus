/* ============================================================
   slovicka.js – slovíčka cizích jazyků (angličtina, němčina,
   francouzština).

   Všechny tři stránky mají stejné díly: přehled s hledáním,
   obrázkové kartičky (výuka) a série kvízu v procvic.js (druhý
   pokus, přehled chyb, napojení na Ověř se). Liší se jen daty
   a členy, proto je kód jen jeden.

   Stránka potřebuje prvky:
     #rezimy     tlačítka data-rezim: prehled, karticky (obě data-faze="vyuka"),
                 slovo (obrázek → cizí slovo), preklad (cizí slovo → česky),
                 clen (jen jazyky se členy)
     #kategorie  místo pro přepínače témat (platí pro všechny režimy)
     #prehledObal s #hledej a tabulkou #prehledTabulka
     #karticky   s #kEmoji, #kSlovo, #kCesky, #kOtoc, #kZpet, #kDalsi, #kPocet
     #plocha, #ovladani, #startBtn, #pokrok, #skore, #btnZvuk
   a zavolá:
     Slovicka.spust({
       klic: 'metodus_…', lang: 'de-DE', jazyk: 'německy',
       slova: [{ slovo, clen?, emoji, cz, kat, vyslov? }],
       kategorie: [{ klic, nazev }], vychoziKat: '',
       cleny: ['der', 'die', 'das'] | null,
       plne: s => 'der Hund',                 // text (možnosti, čtení)
       plneHtml: s => '<span …>der</span> Hund', // s obarveným členem
       proClen: s => true,                    // která slova jdou do režimu „člen"
       pravidlo: s => '…' | '',               // tip po otázce na člen
     });
   ============================================================ */
const Slovicka = (function () {
  function spust(o) {
    const $ = id => document.getElementById(id);
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const plneHtml = o.plneHtml || (s => esc(o.plne(s)));
    let rezim = 'prehled', kat = o.vychoziKat || '', zvuk = true, posledni = null;

    const vKategorii = () => o.slova.filter(s => !kat || s.kat === kat);
    const rekni = text => { if (zvuk && window.Rec) Rec.mluv(text, { lang: o.lang, rychlost: 0.85 }); };

    /* ---- témata ---- */
    const chipy = [{ klic: '', nazev: 'Vše' }, ...o.kategorie];
    $('kategorie').innerHTML = chipy.map(k =>
      `<button type="button" data-kat="${k.klic}" class="${k.klic === kat ? 'active' : ''}">${k.nazev}</button>`).join('');
    $('kategorie').addEventListener('click', e => {
      const b = e.target.closest('button[data-kat]');
      if (!b) return;
      $('kategorie').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      kat = b.dataset.kat;
      obnov();
    });

    /* ---- přehled ---- */
    const sVyslovnosti = o.slova.some(s => s.vyslov);
    const sClenem = !!o.cleny;
    $('prehledTabulka').querySelector('thead').innerHTML = '<tr><th></th>'
      + `<th>${o.jazyk[0].toUpperCase() + o.jazyk.slice(1)}</th>`
      + (sVyslovnosti ? '<th>Výslovnost</th>' : '') + '<th>Česky</th></tr>';
    function vykresliPrehled() {
      const f = $('hledej').value.trim().toLowerCase();
      const radky = vKategorii().filter(s => !f || [o.plne(s), s.cz].some(x => x.toLowerCase().includes(f)));
      const sloupcu = 3 + (sVyslovnosti ? 1 : 0);
      $('prehledTabulka').querySelector('tbody').innerHTML = radky.map((s, i) =>
        `<tr><td class="emoji-bunka">${s.emoji}</td>`
        + `<td class="cizi"><button type="button" class="cist" data-i="${o.slova.indexOf(s)}" title="Přečíst nahlas">${plneHtml(s)}</button></td>`
        + (sVyslovnosti ? `<td class="vyslov">[${esc(s.vyslov || '')}]</td>` : '')
        + `<td class="cesky">${esc(s.cz)}</td></tr>`).join('')
        || `<tr><td colspan="${sloupcu}" class="nic">Nic nenalezeno.</td></tr>`;
    }
    $('hledej').addEventListener('input', vykresliPrehled);
    $('prehledTabulka').addEventListener('click', e => {
      const b = e.target.closest('button.cist');
      if (b) rekni(o.plne(o.slova[+b.dataset.i]));
    });

    /* ---- kartičky ---- */
    let karty = [], idx = 0, otoceno = false;
    function ukazKartu() {
      const s = karty[idx];
      otoceno = false;
      $('kEmoji').textContent = s.emoji;
      $('kSlovo').innerHTML = plneHtml(s) + (s.vyslov ? `<span class="vyslov">[${esc(s.vyslov)}]</span>` : '');
      $('kCesky').textContent = s.cz;
      $('kCesky').classList.add('skryto');
      $('kOtoc').textContent = 'Ukázat překlad';
      $('kPocet').textContent = `${idx + 1} / ${karty.length}`;
      rekni(o.plne(s));
    }
    function otoc() {
      otoceno = !otoceno;
      $('kCesky').classList.toggle('skryto', !otoceno);
      $('kOtoc').textContent = otoceno ? 'Skrýt překlad' : 'Ukázat překlad';
    }
    const posunKartu = d => { idx = (idx + d + karty.length) % karty.length; ukazKartu(); };
    $('kOtoc').onclick = otoc;
    $('kEmoji').onclick = otoc;
    $('kSlovo').onclick = () => rekni(o.plne(karty[idx]));
    $('kDalsi').onclick = () => posunKartu(1);
    $('kZpet').onclick = () => posunKartu(-1);
    document.addEventListener('keydown', e => {
      if (rezim !== 'karticky' || e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') posunKartu(1);
      else if (e.key === 'ArrowLeft') posunKartu(-1);
      else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); otoc(); }
    });

    /* ---- kvíz ---- */
    function vyberSlovo(pool) {
      let s; do { s = Uloha.nahodne(pool); } while (pool.length > 1 && s === posledni);
      posledni = s;
      return s;
    }
    // tři jiné možnosti s jiným textem (některá slova mají stejný překlad)
    function moznosti(pool, s, text) {
      const jine = [...new Set(Uloha.zamichej(pool.filter(x => x !== s)).map(text))].filter(t => t !== text(s));
      return Uloha.zamichej([text(s), ...jine.slice(0, 3)]);
    }
    // po uzavření otázky celé slovo s překladem (a u členu tip), přečíst nahlas
    const doplnek = (s, tip) => karta => {
      karta.insertAdjacentHTML('beforeend', `<div class="slovo-doplnek"><span class="emoji-maly">${s.emoji}</span> `
        + `<b>${plneHtml(s)}</b> = ${esc(s.cz)}${tip ? `<div class="tip">💡 ${tip}</div>` : ''}</div>`);
      rekni(o.plne(s));
    };

    function generuj(r) {
      if (r === 'clen') {
        let pool = vKategorii().filter(o.proClen || (() => true));
        if (pool.length < 2) pool = o.slova.filter(o.proClen || (() => true));
        const s = vyberSlovo(pool);
        return {
          zadani: `<span class="obrazek-slova">${s.emoji}</span><span class="druh">Který člen?</span>`
            + `<span class="slovo-zadani">___ ${esc(s.slovo)}</span><span class="cesky-zadani">${esc(s.cz)}</span>`,
          odpoved: s.clen,
          moznosti: [...o.cleny],
          tridaMoznosti: o.cleny.length === 2 ? 'dve' : 'cleny',
          napoveda: '',
          poVyhodnoceni: doplnek(s, o.pravidlo ? o.pravidlo(s) : ''),
        };
      }
      const pool = vKategorii().length >= 4 ? vKategorii() : o.slova;
      const s = vyberSlovo(pool);
      if (r === 'preklad') {
        return {
          zadani: `<span class="druh">Co to znamená česky?</span><span class="slovo-zadani">${plneHtml(s)}</span>`,
          odpoved: s.cz,
          moznosti: moznosti(pool, s, x => x.cz),
          napoveda: '',
          poVykresleni: () => rekni(o.plne(s)),
          poVyhodnoceni: doplnek(s),
        };
      }
      return {
        zadani: `<span class="obrazek-slova">${s.emoji}</span><span class="druh">Jak se to řekne ${o.jazyk}?</span>`
          + `<span class="cesky-zadani">${esc(s.cz)}</span>`,
        odpoved: o.plne(s),
        moznosti: moznosti(pool, s, o.plne),
        napoveda: '',
        poVyhodnoceni: doplnek(s),
      };
    }

    const serie = Procvic.spust({
      klic: o.klic, pocet: 10, typ: 'text',
      plocha: $('plocha'), skoreEl: $('skore'), pokrokEl: $('pokrok'),
      rezim: () => rezim, generuj,
    });

    /* ---- přepínání režimů ---- */
    function obnov() {
      posledni = null;
      if (rezim === 'prehled') vykresliPrehled();
      else if (rezim === 'karticky') { karty = Uloha.zamichej(vKategorii()); idx = 0; ukazKartu(); }
      else serie.restart();
    }
    $('rezimy').addEventListener('click', e => {
      const b = e.target.closest('button[data-rezim]');
      if (!b) return;
      $('rezimy').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      rezim = b.dataset.rezim;
      $('prehledObal').hidden = rezim !== 'prehled';
      $('karticky').hidden = rezim !== 'karticky';
      $('plocha').hidden = $('ovladani').hidden = rezim === 'prehled' || rezim === 'karticky';
      obnov();
    });
    $('startBtn').onclick = () => serie.restart();

    const zvukBtn = $('btnZvuk');
    if (zvukBtn) {
      zvukBtn.onclick = () => { zvuk = !zvuk; zvukBtn.textContent = '🔊 Číst nahlas: ' + (zvuk ? 'zap' : 'vyp'); };
      if (window.Rec) Rec.hlidejTlacitko(zvukBtn, { lang: o.lang });
      else zvukBtn.hidden = true;
    }

    const aktivni = $('rezimy').querySelector('button.active') || $('rezimy').querySelector('button');
    aktivni.click();
    return serie;
  }

  return { spust };
})();
