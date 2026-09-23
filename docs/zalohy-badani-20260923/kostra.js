/* ============================================================
   kostra.js – společná kostra každé výukové stránky.

   Stránka nemusí nic vypisovat sama: skript si najde svou položku
   v katalogu (apps.js) a vloží pod nadpis stránky
     • proužek předmětu (barva a ikona předmětu, sekce, ročník),
     • cíl lekce z katalogu („Po této lekci …"),
     • lištu fází  📖 Výuka · 📘 Ukázka · ✏️ Procvič · 🎯 Ověř se · 📌 Tahák
       – jen ty, které stránka opravdu má,
     • cestu rodiny témat (hlavní lekce, předchozí a další krok)
   a na konec stránky blok „Kam dál".

   Fáze se hledají v obsahu stránky. Stránka je může určit i výslovně
   atributem data-faze="vyuka|ukazka|procvic|tahak" na libovolném prvku.
   „Ověř se" staví krátký test z vlastních režimů stránky – stačí, že
   stránka odpovídá přes Uloha (uloha.js ohlašuje otázky a odpovědi),
   nebo sama zavolá Kostra.odpoved(spravne).

   Vkládá se do <head> jako <script src="../kostra.js" defer>. Styly
   (kostra.css) a případně katalog (apps.js) si načte sám.
   ============================================================ */
(function () {
  'use strict';
  const KOREN = new URL('.', document.currentScript.src);
  const SOUBOR = 'obsah/' + decodeURIComponent(location.pathname.split('/').pop() || '');
  const V_RAMU = window.self !== window.top;

  const FAZE = [
    { id: 'vyuka', ikona: '📖', nazev: 'Výuka' },
    { id: 'ukazka', ikona: '📘', nazev: 'Ukázka' },
    { id: 'procvic', ikona: '✏️', nazev: 'Procvič' },
    { id: 'overse', ikona: '🎯', nazev: 'Ověř se' },
    { id: 'tahak', ikona: '📌', nazev: 'Tahák' },
  ];
  const OVERENI_KLIC = 'metodus_overeni';
  const OTAZEK = 8;

  /* ---- načtení stylů a katalogu --------------------------------------- */
  function pripojStyl() {
    if (document.querySelector('link[data-kostra]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL('kostra.css', KOREN).href;
    l.dataset.kostra = '';
    document.head.appendChild(l);
  }

  function nactiKatalog() {
    if (typeof KATALOG_SEKCE !== 'undefined') return Promise.resolve();
    return new Promise((ok, chyba) => {
      const s = document.createElement('script');
      s.src = new URL('apps.js', KOREN).href;
      s.onload = ok;
      s.onerror = chyba;
      document.head.appendChild(s);
    });
  }

  /* ---- pomocné -------------------------------------------------------- */
  const el = (znacka, trida, text) => {
    const e = document.createElement(znacka);
    if (trida) e.className = trida;
    if (text != null) e.textContent = text;
    return e;
  };
  const vsechnyPolozky = () => KATALOG_SEKCE.flatMap(s => s.polozky.map(p => ({ ...p, sekce: s.nazev })));
  const najdi = soubor => vsechnyPolozky().find(p => p.soubor === soubor);
  const nazevBezIkony = n => n.replace(/^[^\p{L}\p{N}]+/u, '').trim();

  function rocniky(r) {
    if (!r || !r.length) return '';
    const a = Math.min(...r), b = Math.max(...r);
    const souvisle = r.length === b - a + 1;
    if (a === b) return a + '. ročník';
    return souvisle ? `${a}.–${b}. ročník` : r.join('., ') + '. ročník';
  }

  /* Odkaz na jinou lekci: uvnitř rozcestníku ji otevře rozcestník (zůstane
     menu i adresa #obsah/…), samostatně otevřená stránka jde přímo. */
  function odkazNaLekci(soubor, text) {
    const a = el('a', 'kostra-lekce', text);
    a.href = new URL(soubor, KOREN).href;
    a.addEventListener('click', e => {
      if (!V_RAMU || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      const cilovyPuvod = location.protocol === 'file:' ? '*' : location.origin;
      try { window.parent.postMessage({ otevri: soubor }, cilovyPuvod); }
      catch { location.href = a.href; }
    });
    return a;
  }

  function rolujNa(prvek) {
    if (!prvek) return;
    const plynule = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    prvek.scrollIntoView({ behavior: plynule ? 'smooth' : 'auto', block: 'start' });
    prvek.classList.remove('kostra-zvyrazni');
    void prvek.offsetWidth;
    prvek.classList.add('kostra-zvyrazni');
    setTimeout(() => prvek.classList.remove('kostra-zvyrazni'), 1600);
  }

  /* ---- rozpoznání fází na stránce ------------------------------------ */
  const mimoKostru = e => !e.closest('.kostra, .kostra-zapati, .kostra-dialog');
  const mimoUlohu = e => !e.closest('#plocha, .plocha, .odezva, #rezimy, .rezimy');

  function rezimoveTlacitko(rezim) {
    return document.querySelector(`#rezimy [data-rezim="${rezim}"], .rezimy [data-rezim="${rezim}"]`);
  }

  function najdiFaze() {
    const faze = {};
    const vyslovne = id => [...document.querySelectorAll(`[data-faze="${id}"]`)].filter(mimoKostru);

    // Tahák: výslovně označené, jinak pravidla a pomůcky mimo úlohu.
    let tahak = vyslovne('tahak');
    if (!tahak.length) {
      tahak = [...document.querySelectorAll('.pomucka, .napoveda, .pravidla, .tahak')]
        .filter(e => mimoKostru(e) && mimoUlohu(e) && e.textContent.trim().length > 20);
      tahak = tahak.filter(e => !tahak.some(j => j !== e && j.contains(e)));
    }
    if (tahak.length) faze.tahak = { prvky: tahak };

    // Výuka: výslovně označená, jinak výklad (pomůcka), jinak celý model
    // stránky bez procvičování (simulace, atlas, nástroj).
    let vyuka = vyslovne('vyuka');
    if (!vyuka.length && tahak.length) vyuka = [tahak[0]];
    if (vyuka.length) faze.vyuka = { cil: vyuka[0] };

    // Ukázka: vedená aktivita pilotů, nebo režim „ukázka".
    const ukazka = vyslovne('ukazka')[0] || document.getElementById('vedena-aktivita');
    const ukazkaRezim = document.querySelector('#rezimy [data-rezim="ukazka"], .rezimy [data-rezim="ukazka"]');
    if (ukazka) faze.ukazka = { cil: ukazka };
    else if (ukazkaRezim) faze.ukazka = { cil: ukazkaRezim.closest('#rezimy, .rezimy'), rezim: ukazkaRezim };

    // Procvič: úlohy, na které se odpovídá. Přepínače pohledů v simulacích
    // (.rezimy bez úloh) procvičováním nejsou – stránka bez uloha.js musí
    // procvičování označit výslovně (data-faze="procvic").
    const umiOdpovedi = typeof Uloha !== 'undefined' || !!document.querySelector('[data-kostra-odpovedi]');
    const procvic = vyslovne('procvic')[0] ||
      (umiOdpovedi && (document.querySelector('#rezimy, .rezimy') || document.querySelector('#plocha, .plocha') ||
        document.querySelector('[data-kostra-odpovedi]')));
    if (procvic) faze.procvic = { cil: procvic };

    // Ověř se: jen kde jde odpovědi sledovat (uloha.js, nebo stránka volá
    // Kostra.odpoved a má atribut data-kostra-odpovedi) a jsou na to úlohy.
    const bezOvereni = !!document.querySelector('[data-kostra-overeni="ne"]');
    if (procvic && umiOdpovedi && !bezOvereni && document.querySelector('#plocha, .plocha, [data-kostra-odpovedi]')) faze.overse = {};

    // Stránka bez procvičování (model, atlas, nástroj) má Výuku v celé ploše.
    if (!faze.vyuka && !faze.procvic) faze.vyuka = { cil: null };
    return faze;
  }

  /* ---- Tahák ---------------------------------------------------------- */
  function otevriTahak(prvky, nadpis) {
    let dlg = document.querySelector('dialog.kostra-dialog');
    if (!dlg) {
      dlg = el('dialog', 'kostra-dialog');
      dlg.setAttribute('aria-labelledby', 'kostraTahakNadpis');
      document.body.appendChild(dlg);
      dlg.addEventListener('close', () => document.body.classList.remove('kostra-tisk-tahaku'));
    }
    dlg.replaceChildren();
    const h = el('h2', null, '📌 Tahák · ' + nadpis);
    h.id = 'kostraTahakNadpis';
    const obsah = el('div', 'kostra-tahak-obsah');
    prvky.forEach(p => {
      const kopie = p.cloneNode(true);
      kopie.removeAttribute('id');
      kopie.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
      kopie.querySelectorAll('.sviti').forEach(x => x.classList.remove('sviti'));
      kopie.querySelectorAll('details').forEach(d => { d.open = true; });
      if (kopie.tagName === 'DETAILS') kopie.open = true;
      kopie.hidden = false;
      obsah.appendChild(kopie);
    });
    const tlacitka = el('div', 'kostra-dialog-tlacitka');
    const tisk = el('button', null, '🖨️ Vytisknout');
    tisk.type = 'button';
    tisk.addEventListener('click', () => {
      document.body.classList.add('kostra-tisk-tahaku');
      window.print();
    });
    const zavrit = el('button', 'hlavni', 'Zavřít');
    zavrit.type = 'button';
    zavrit.addEventListener('click', () => dlg.close());
    tlacitka.append(tisk, zavrit);
    dlg.append(h, obsah, tlacitka);
    dlg.showModal();
    zavrit.focus();
  }

  /* ---- Ověř se -------------------------------------------------------- */
  const Overeni = (function () {
    let beh = null;   // { rezimy, otazky:[{rezim, ok}], cekaNaRotaci, aktivni, pruh }

    function rezimy() {
      return [...document.querySelectorAll('#rezimy [data-rezim], .rezimy [data-rezim]')]
        .filter(b => b.dataset.rezim !== 'ukazka' && !b.disabled && b.offsetParent !== null);
    }
    const plocha = () => document.querySelector('#plocha, .plocha');
    const maUlohu = () => {
      const p = plocha() || document.querySelector('[data-kostra-odpovedi]');
      return !!(p && p.querySelector('.moznosti button, input:not([type=hidden]):not([type=checkbox]), select, [data-klic], textarea'));
    };
    const snimek = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const aktivniRezim = () => document.querySelector('#rezimy .active, .rezimy .active')?.dataset.rezim || '';
    const popisRezimu = r => {
      const b = rezimoveTlacitko(r);
      return b ? b.textContent.trim() : 'procvičování';
    };

    /* Které režimy jsou úlohy: každý se krátce zapne a ověří se, že na ploše
       vznikla otázka s odpovědí. Režimy typu přehled nebo kalkulačka odpadnou. */
    async function testovatelneRezimy() {
      const vsechny = rezimy().filter(b => !b.dataset.faze || b.dataset.faze === 'procvic');
      if (!vsechny.length) return maUlohu() ? [''] : [];
      const puvodni = aktivniRezim();
      const ok = [];
      let otazka = false;
      const hlidej = () => { otazka = true; };
      document.addEventListener('metodus:otazka', hlidej);
      for (const b of vsechny) {
        otazka = false;
        b.click();
        await snimek();
        if (otazka || plocha()?.querySelector('.moznosti button')) ok.push(b.dataset.rezim);
      }
      document.removeEventListener('metodus:otazka', hlidej);
      const zpet = rezimoveTlacitko(puvodni);
      if (zpet) zpet.click();
      return ok;
    }

    function zamichej(p) {
      const a = [...p];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function planRezimu(ok) {
      // Rovnoměrně napříč režimy, v náhodném pořadí.
      const plan = [];
      while (plan.length < OTAZEK) plan.push(...zamichej(ok));
      return plan.slice(0, OTAZEK);
    }

    function zapniRezim(r) {
      if (!r) return;
      const b = rezimoveTlacitko(r);
      if (b && aktivniRezim() !== r) b.click();
      else if (b && !maUlohu()) b.click();
    }

    function vykresliPruh() {
      if (!beh) return;
      const hotovo = beh.otazky.length;
      beh.stav.textContent = hotovo < OTAZEK
        ? `🎯 Ověř se · otázka ${Math.min(hotovo + 1, OTAZEK)} z ${OTAZEK} · bez nápovědy`
        : `🎯 Ověř se · všech ${OTAZEK} otázek zodpovězeno`;
      beh.body.replaceChildren(...beh.plan.map((r, i) => {
        const t = el('span', 'kostra-bod');
        const o = beh.otazky[i];
        if (o) t.classList.add(o.ok ? 'ok' : 'chyba');
        else if (i === hotovo) t.classList.add('ted');
        t.title = o ? (o.ok ? 'správně napoprvé' : 'chyba') : '';
        return t;
      }));
    }

    async function spust() {
      if (beh) return;
      const tlac = document.querySelector('.kostra-faze [data-faze="overse"]');
      const ok = await testovatelneRezimy();
      if (!ok.length) {
        hlaseni('Tahle stránka zatím nemá úlohy, ze kterých by se dalo sestavit ověření.');
        return;
      }
      const pruh = el('div', 'kostra-overeni');
      pruh.setAttribute('role', 'region');
      pruh.setAttribute('aria-label', 'Ověř se');
      const stav = el('p', 'kostra-overeni-stav');
      stav.setAttribute('aria-live', 'polite');
      const body = el('div', 'kostra-body');
      body.setAttribute('aria-hidden', 'true');
      const konec = el('button', null, 'Ukončit ověřování');
      konec.type = 'button';
      konec.addEventListener('click', () => ukonci(true));
      pruh.append(stav, body, konec);
      const cil = document.querySelector('#rezimy, .rezimy') || plocha() || document.querySelector('[data-kostra-odpovedi]');
      cil.parentElement.insertBefore(pruh, cil);
      beh = { ok, plan: planRezimu(ok), otazky: [], pruh, stav, body, videne: new WeakSet(), cekaNaRotaci: false, tlac };
      document.body.classList.add('kostra-overuje');
      tlac?.setAttribute('aria-pressed', 'true');
      vykresliPruh();
      zapniRezim(beh.plan[0]);
      rolujNa(pruh);
    }

    function zaznamenej(detail) {
      if (!beh || !detail.prvniPokus || beh.otazky.length >= OTAZEK) return;
      if (detail.stav) {
        if (beh.videne.has(detail.stav)) return;
        beh.videne.add(detail.stav);
      }
      beh.otazky.push({ rezim: aktivniRezim() || beh.plan[beh.otazky.length], ok: detail.spravne });
      vykresliPruh();
      if (beh.otazky.length >= OTAZEK) {
        // Po poslední otázce ještě chvíli, ať žák uvidí zpětnou vazbu.
        if (detail.spravne) setTimeout(vysledek, 1100);
        else beh.cekaNaOpravu = true;
      } else {
        beh.cekaNaRotaci = true;
      }
    }

    function poOdpovedi(detail) {
      if (!beh) return;
      zaznamenej(detail);
      if (beh && beh.cekaNaOpravu && detail.spravne) { beh.cekaNaOpravu = false; setTimeout(vysledek, 1100); }
    }

    /* Stránka po odpovědi sama připraví další otázku ve stejném režimu.
       Když má další otázka patřit jinému režimu, přepne se sem. */
    function poNoveOtazce() {
      if (!beh) return;
      // poslední otázka byla chybně a stránka už jde dál (bez opravy) → výsledek
      if (beh.cekaNaOpravu) { beh.cekaNaOpravu = false; setTimeout(vysledek, 0); return; }
      if (!beh.cekaNaRotaci) return;
      beh.cekaNaRotaci = false;
      const dalsi = beh.plan[beh.otazky.length];
      if (dalsi && dalsi !== aktivniRezim()) setTimeout(() => zapniRezim(dalsi), 0);
    }

    function ulozVysledek(v) {
      try {
        const data = JSON.parse(localStorage.getItem(OVERENI_KLIC) || '{}');
        const soubor = SOUBOR.replace(/^obsah\//, '');
        const seznam = Array.isArray(data[soubor]) ? data[soubor] : [];
        seznam.push(v);
        data[soubor] = seznam.slice(-5);
        localStorage.setItem(OVERENI_KLIC, JSON.stringify(data));
      } catch { /* bez úložiště se výsledek jen zobrazí */ }
    }

    function vysledek() {
      if (!beh) return;
      const { otazky, pruh } = beh;
      const spravne = otazky.filter(o => o.ok).length;
      const chybne = {};
      otazky.filter(o => !o.ok).forEach(o => { chybne[o.rezim] = (chybne[o.rezim] || 0) + 1; });
      const d = new Date();
      ulozVysledek({
        datum: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        spravne, celkem: otazky.length, chyby: chybne,
      });
      ukonci(false);
      const karta = el('section', 'kostra-vysledek');
      karta.setAttribute('aria-label', 'Výsledek ověření');
      karta.append(el('h2', null, `🎯 Správně napoprvé ${spravne} z ${otazky.length}`));
      karta.append(el('p', null, spravne === otazky.length
        ? 'Všechno napoprvé. Můžeš pokračovat další lekcí.'
        : 'Chyby nevadí – ukazují, co si ještě zopakovat. Počítá se jen první odpověď u každé otázky.'));
      if (Object.keys(chybne).length) {
        const p = el('p', 'kostra-zopakuj', 'Zopakuj si: ');
        Object.entries(chybne).forEach(([r, n]) => {
          const b = el('button', null, `${popisRezimu(r)} (${n}×)`);
          b.type = 'button';
          b.addEventListener('click', () => { karta.remove(); zapniRezim(r); rolujNa(rezimoveTlacitko(r) || plocha()); });
          p.append(b);
        });
        karta.append(p);
      }
      const znovu = el('button', 'hlavni', '🔄 Nové ověření');
      znovu.type = 'button';
      znovu.addEventListener('click', () => { karta.remove(); spust(); });
      const zavri = el('button', null, 'Zavřít');
      zavri.type = 'button';
      zavri.addEventListener('click', () => karta.remove());
      const radek = el('div', 'kostra-dialog-tlacitka');
      radek.append(znovu, zavri);
      karta.append(radek);
      pruh.replaceWith(karta);
      aktualizujNaposledy();
      karta.querySelector('h2').tabIndex = -1;
      karta.querySelector('h2').focus();
    }

    function ukonci(odebratPruh) {
      if (!beh) return;
      if (odebratPruh) beh.pruh.remove();
      beh.tlac?.setAttribute('aria-pressed', 'false');
      beh = null;
      document.body.classList.remove('kostra-overuje');
    }

    document.addEventListener('metodus:odpoved', e => poOdpovedi(e.detail || {}));
    document.addEventListener('metodus:otazka', poNoveOtazce);
    return { spust, ukonci, bezi: () => !!beh };
  })();

  function hlaseni(text) {
    const h = document.querySelector('.kostra-hlaseni');
    if (!h) return;
    h.textContent = text;
    h.hidden = false;
    clearTimeout(hlaseni.t);
    hlaseni.t = setTimeout(() => { h.hidden = true; }, 6000);
  }

  function aktualizujNaposledy() {
    const b = document.querySelector('.kostra-faze [data-faze="overse"] .kostra-naposledy');
    if (!b) return;
    try {
      const data = JSON.parse(localStorage.getItem(OVERENI_KLIC) || '{}');
      const s = data[SOUBOR.replace(/^obsah\//, '')];
      const v = Array.isArray(s) && s[s.length - 1];
      b.textContent = v ? ` · naposledy ${v.spravne}/${v.celkem}` : '';
    } catch { b.textContent = ''; }
  }

  /* ---- sestavení hlavičky -------------------------------------------- */
  function sestav(polozka) {
    const predmet = (typeof KATALOG_PREDMETY !== 'undefined' && KATALOG_PREDMETY.find(p => p.id === polozka.predmet)) || null;
    const idPredmetu = predmet ? predmet.id : 'nastroj';
    document.body.classList.add('kostra-stranka');
    document.documentElement.style.setProperty('--predmet', `var(--predmet-${idPredmetu})`);

    const hlava = el('section', 'kostra');
    hlava.setAttribute('aria-label', 'O této lekci');

    // 1) proužek předmětu
    const radek = el('p', 'kostra-radek');
    radek.append(el('span', 'kostra-predmet', predmet ? `${predmet.emoji} ${predmet.label}` : '🧰 Nástroj'));
    const sekce = nazevBezIkony(polozka.sekce);
    if (!predmet || sekce.toLowerCase() !== predmet.label.toLowerCase()) radek.append(el('span', 'kostra-sekce', sekce));
    const r = rocniky(polozka.rocniky);
    if (r) radek.append(el('span', 'kostra-rocnik', r));
    hlava.append(radek);

    // 2) cíl – jen když ho stránka nemá vlastní (piloty mají rozepsaný blok .cil)
    const vlastniCil = document.querySelector('.cil:not(.kostra *)');
    if (polozka.cil && !vlastniCil) {
      const p = el('p', 'kostra-cil');
      p.append(el('b', null, '🎯 Po této lekci: '), document.createTextNode(polozka.cil));
      hlava.append(p);
    }

    // 3) fáze
    const faze = najdiFaze();
    const pocet = Object.keys(faze).length;
    if (pocet >= 2 || faze.procvic) {
      const nav = el('nav', 'kostra-faze');
      nav.setAttribute('aria-label', 'Fáze lekce');
      FAZE.forEach(f => {
        if (!faze[f.id]) return;
        const b = el('button', null);
        b.type = 'button';
        b.dataset.faze = f.id;
        b.append(el('span', 'kostra-ikona', f.ikona), document.createTextNode(' ' + f.nazev));
        if (f.id === 'overse') {
          b.setAttribute('aria-pressed', 'false');
          b.title = `Krátké ověření: ${OTAZEK} otázek napříč režimy, bez nápovědy`;
          b.append(el('span', 'kostra-naposledy'));
        }
        if (f.id === 'tahak') b.title = 'Shrnutí na jednu obrazovku, dá se vytisknout';
        b.addEventListener('click', () => aktivujFazi(f.id, faze, polozka));
        nav.append(b);
      });
      hlava.append(nav);
    }
    const hl = el('p', 'kostra-hlaseni');
    hl.hidden = true;
    hl.setAttribute('role', 'status');
    hlava.append(hl);

    // 4) rodina témat (v jednořádkové kostře jen předchozí/další krok)
    const rodina = typeof KATALOG_RODINY !== 'undefined' && KATALOG_RODINY.find(x => x.cesta.includes(SOUBOR));

    // umístění – viz najdiMisto(); aplikace na celou obrazovku dostanou
    // jednořádkovou kostru bez zápatí, ať nepřijdou o pracovní plochu.
    const misto = najdiMisto();
    const h1 = misto.h1;
    if (misto.kompakt) {
      hlava.classList.add('kostra-kompakt');
      if (rodina) hlava.append(sestavKroky(rodina));
    } else if (rodina) hlava.append(sestavRodinu(rodina));
    if (misto.pred) {
      misto.pred.before(hlava);
      // zarovnat se středěným obsahem stránky (kontejner s max. šířkou)
      if (!misto.kompakt) {
        const r = misto.pred.getBoundingClientRect(), k = hlava.getBoundingClientRect();
        hlava.style.maxWidth = Math.round(r.width) + 'px';
        hlava.style.marginLeft = Math.max(0, Math.round(r.left - k.left + parseFloat(getComputedStyle(hlava).marginLeft))) + 'px';
      }
    }
    else if (misto.po) misto.po.after(hlava);
    else { document.body.prepend(hlava); hlava.classList.add('kostra-nahore'); }
    // Aplikace na celou výšku okna si mohou odečíst místo kostry:
    // height: calc(100% - var(--kostra-vyska, 0px))
    const zmer = () => document.documentElement.style.setProperty('--kostra-vyska', hlava.offsetHeight + 'px');
    zmer();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(zmer).observe(hlava);
    if (h1) h1.classList.add('kostra-nadpis');

    // 5) zápatí „Kam dál" – jen když stránka nemá vlastní návaznosti
    if (rodina && !misto.kompakt && !document.querySelector('.navaznosti:not(.kostra-zapati)')) {
      (misto.zapati || document.body).append(sestavZapati(rodina));
    }
    aktualizujNaposledy();
  }

  /* Kam kostru vložit:
     • stránka může určit místo sama: data-kostra-misto="po" (vložit za prvek);
     • nadpis v běžném toku stránky → pod nadpis a podtitul;
     • nadpis uvnitř vodorovné lišty (aplikace, simulace) → pod celou lištu,
       v jednořádkové podobě;
     • stránka bez nadpisu → na začátek těla, jednořádkově. */
  function najdiMisto() {
    const zapati = document.querySelector('[data-kostra-zapati]');
    const vyslovne = document.querySelector('[data-kostra-misto="po"]');
    const pred = document.querySelector('[data-kostra-misto="pred"]');
    const h1 = [...document.querySelectorAll('h1')].find(mimoKostru) || null;
    const celaObrazovka = getComputedStyle(document.body).overflow === 'hidden' ||
      getComputedStyle(document.documentElement).overflow === 'hidden';
    if (pred) return { pred, h1: null, kompakt: celaObrazovka, zapati };
    if (vyslovne) return { po: vyslovne, h1, kompakt: celaObrazovka, zapati };
    if (!h1) return { po: null, h1, kompakt: true, zapati };
    const vRadku = e => {
      const r = e && e !== document.body && getComputedStyle(e);
      return r && ((r.display.includes('flex') && !r.flexDirection.startsWith('column')) || r.display.includes('grid'));
    };
    let a = h1;
    while (a.parentElement && a.parentElement !== document.body && vRadku(a.parentElement)) a = a.parentElement;
    if (a !== h1) return { po: a, h1, kompakt: true, zapati };
    let kotva = h1, dalsi = h1.nextElementSibling;
    while (dalsi && dalsi.matches('.podtitul, .subtitle, .pod-nadpisem')) { kotva = dalsi; dalsi = dalsi.nextElementSibling; }
    return { po: kotva, h1, kompakt: celaObrazovka, zapati };
  }

  /* V jednořádkové kostře: jen předchozí a další krok tématu. */
  function sestavKroky(rodina) {
    const i = rodina.cesta.indexOf(SOUBOR);
    const nav = el('nav', 'kostra-kroky');
    nav.setAttribute('aria-label', 'Téma ' + rodina.nazev);
    nav.append(el('span', 'kostra-rodina-stitek', '🧭 ' + rodina.nazev));
    const pridej = (f, text) => {
      const p = f && najdi(f);
      if (p) { const a = odkazNaLekci(f, text); a.title = nazevBezIkony(p.nazev); nav.append(a); }
    };
    if (i > 0) pridej(rodina.cesta[i - 1], '← předchozí');
    if (i < rodina.cesta.length - 1) pridej(rodina.cesta[i + 1], 'další →');
    return nav;
  }

  function sestavRodinu(rodina) {
    const nav = el('nav', 'kostra-rodina');
    nav.setAttribute('aria-label', 'Rodina témat: ' + rodina.nazev);
    const d = el('details');
    const s = el('summary');
    const i = rodina.cesta.indexOf(SOUBOR);
    s.append(el('span', 'kostra-rodina-stitek', '🧭 Téma'), document.createTextNode(' ' + rodina.nazev + ' '),
      el('span', 'kostra-rodina-poradi', `· krok ${i + 1} z ${rodina.cesta.length}`));
    d.append(s);
    if (rodina.popis) d.append(el('p', 'kostra-rodina-popis', rodina.popis));
    const ol = el('ol', 'kostra-cesta');
    rodina.cesta.forEach(f => {
      const p = najdi(f);
      if (!p) return;
      const li = el('li');
      const nazev = nazevBezIkony(p.nazev);
      if (f === SOUBOR) {
        const t = el('span', 'kostra-tady', nazev);
        t.setAttribute('aria-current', 'page');
        li.append(t);
      } else {
        li.append(odkazNaLekci(f, nazev));
      }
      const rr = rocniky(p.rocniky);
      if (rr) li.append(el('small', null, ' ' + rr.replace(' ročník', '')));
      if (f === rodina.hlavni) li.append(el('span', 'kostra-hlavni', '★ hlavní lekce'));
      ol.append(li);
    });
    d.append(ol);
    nav.append(d);
    return nav;
  }

  function sestavZapati(rodina) {
    const i = rodina.cesta.indexOf(SOUBOR);
    const nav = el('nav', 'navaznosti kostra-zapati');
    nav.setAttribute('aria-label', 'Kam dál');
    nav.append(el('h2', null, 'Kam dál'));
    const radek = el('div', 'radek');
    const pridej = (popis, f) => {
      const p = f && najdi(f);
      if (!p) return;
      const s = el('span', null, popis + ': ');
      s.append(odkazNaLekci(f, nazevBezIkony(p.nazev)));
      radek.append(s);
    };
    if (i > 0) pridej('Předchozí krok', rodina.cesta[i - 1]);
    if (i < rodina.cesta.length - 1) pridej('Další krok', rodina.cesta[i + 1]);
    if (rodina.hlavni !== SOUBOR) pridej('Hlavní lekce tématu', rodina.hlavni);
    nav.append(radek);
    return nav;
  }

  function aktivujFazi(id, faze, polozka) {
    const f = faze[id];
    if (id !== 'overse' && Overeni.bezi()) Overeni.ukonci(true);
    if (id === 'tahak') return otevriTahak(f.prvky, nazevBezIkony(polozka.nazev));
    if (id === 'overse') return Overeni.bezi() ? Overeni.ukonci(true) : Overeni.spust();
    if (id === 'ukazka' && f.rezim) { f.rezim.click(); return rolujNa(f.cil); }
    // cílem fáze může být tlačítko režimu (data-faze na tlačítku v .rezimy)
    if (f.cil && f.cil.matches('button, [data-rezim], .tab, [role="tab"]')) {
      f.cil.click();
      return rolujNa(f.cil.closest('#rezimy, .rezimy, .tabs, [role="tablist"]') || f.cil);
    }
    if (id === 'procvic') {
      // z ukázky nebo výkladu rovnou do prvního procvičovacího režimu
      const jeVyklad = b => b.dataset.rezim === 'ukazka' || (b.dataset.faze && b.dataset.faze !== 'procvic');
      const aktivni = document.querySelector('#rezimy .active, .rezimy .active');
      if (aktivni && jeVyklad(aktivni)) {
        const prvni = [...document.querySelectorAll('#rezimy [data-rezim], .rezimy [data-rezim]')].find(b => !jeVyklad(b));
        prvni?.click();
      }
    }
    if (f.cil) rolujNa(f.cil);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- veřejné rozhraní pro stránky bez uloha.js ---------------------- */
  const odpovedi = new WeakMap();
  window.Kostra = {
    /* Stránka bez uloha.js ohlásí odpověď: Kostra.odpoved(spravne, otazka),
       kde `otazka` je libovolný objekt jedné otázky (první volání = první pokus). */
    odpoved(spravne, otazka) {
      const klic = otazka || {};
      const prvniPokus = !odpovedi.has(klic);
      odpovedi.set(klic, true);
      document.dispatchEvent(new CustomEvent('metodus:odpoved', { detail: { spravne: !!spravne, prvniPokus, stav: klic } }));
    },
    otazka() { document.dispatchEvent(new CustomEvent('metodus:otazka', { detail: {} })); },
  };

  /* ---- start ---------------------------------------------------------- */
  pripojStyl();
  function start() {
    nactiKatalog().then(() => {
      const polozka = najdi(SOUBOR);
      if (!polozka) return;   // stránka mimo katalog (rozcestníky, testy)
      sestav(polozka);
    }).catch(() => { /* bez katalogu stránka funguje jako dřív */ });
  }
  /* Kostra je `defer`, takže běží ještě před DOMContentLoaded – a před
     ostatními odloženými skripty stránky. Některé stránky si apps.js načítají
     samy (také odloženě); katalog se proto hledá až po DOMContentLoaded,
     jinak by se načetl dvakrát. */
  let spusteno = false;
  const jednou = () => { if (!spusteno) { spusteno = true; start(); } };
  if (document.readyState === 'complete') jednou();
  else {
    document.addEventListener('DOMContentLoaded', jednou);
    window.addEventListener('load', jednou);
  }
})();
