/* ============================================================
   badani.js – úkoly k modelu: předpověz → vyzkoušej → vysvětli.

   Velké simulace (páka, optika, elektřina …) mají hotový model, ale
   žádnou učební cestu. Tahle komponenta k nim přidá nemodální panel
   „🧪 Úkoly k modelu“, který žáka vede třemi kroky:

     1. 🤔 Předpověz – žák si tipne výsledek, dřív než cokoli zkusí,
     2. 🔬 Vyzkoušej – nastaví model; panel sám pozná, že pokus proběhl
        (stránka dodá funkci splneno), a zapíše, co model ukázal,
     3. 💬 Vysvětli – porovná předpověď s pokusem a vybere vysvětlení;
        každá chybná možnost má vlastní zdůvodnění.

   Záložka „❓ Otázky“ je procvičování k modelu. Na ní staví fáze
   🎯 Ověř se ze společné kostry (kostra.js): otázky ohlašují odpovědi
   přes Kostra.odpoved, takže výsledek se ukládá stejně jako u lekcí.
   Shrnutí všech úkolů je fáze 📌 Tahák.

   Stránka vloží na konec <body> (za svůj skript):
     <script src="../badani.js"></script>
     <script> Badani.start({ ukoly: [...], otazky: [...] }); </script>

   Úkol:
     { id, nazev,
       uvod?,                       // krátký kontext (HTML)
       predpoved: { otazka, moznosti: ['…', …], spravna: index },
       priprava: {'#f1': 30, …} | function,   // výchozí stav modelu
       pokus: 'co udělat (HTML)',
       splneno: () => bool,         // je pokus hotový? (čte stav modelu)
       ukaz?: {…} | function,       // „🙋 Ukaž mi“ – model nastaví sám
       pozorovani: 'HTML' | () => 'HTML',   // co model ukázal (zapíše se)
       vysvetli: { otazka, moznosti: [{ t, ok?, proc? }, …] },
       shrnuti: 'HTML' }            // pravidlo, jde i do Taháku
   Otázka: objekt { otazka, moznosti: [{ t, ok?, proc? }], vysvetleni?, poradi? }
           nebo funkce, která takový objekt vrátí (generované zadání).
   Volby stránky: strana ('vpravo' | 'vlevo'), nad (selektor spodní lišty,
   nad kterou se plovoucí panel drží), zakryt (selektor výkladu stránky,
   který by prozradil odpověď – rozmaže se, dokud žák nezapíše předpověď).

   Obsah (texty úkolů a otázek) píše autor stránky – vkládá se jako HTML.
   ============================================================ */
(function () {
  'use strict';
  const KOREN = new URL('.', document.currentScript.src);
  const SOUBOR = decodeURIComponent(location.pathname.split('/').pop() || '');
  const KLIC = 'metodus_badani';
  /* Od této šířky se otevřený panel ukotví jako boční sloupec: stránka se
     o něj zúží, takže nezakryje žádnou část modelu. Užší obrazovky mají
     plovoucí panel (na mobilu list u spodní hrany). */
  const DOK = matchMedia('(min-width: 900px)');

  /* ---- pomocné -------------------------------------------------------- */
  const el = (znacka, trida, html) => {
    const e = document.createElement(znacka);
    if (trida) e.className = trida;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const tlacitko = (text, trida, akce) => {
    const b = el('button', trida, text);
    b.type = 'button';
    if (akce) b.addEventListener('click', akce);
    return b;
  };
  const hodnotaTextu = x => (typeof x === 'function' ? x() : x) || '';
  const zamichej = p => {
    const a = [...p];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const cislo = (x, d = 0) => {
    const r = Number(x).toFixed(d);
    return (d ? r.replace(/\.?0+$/, '') : r).replace('.', ',').replace('-', '−');
  };

  function pripojStyl() {
    if (document.querySelector('link[data-badani]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL('badani.css', KOREN).href;
    l.dataset.badani = '';
    document.head.appendChild(l);
  }

  /* Nastaví ovládací prvky modelu tak, jako by to udělal žák: hodnotu
     zapíše a vyvolá input + change, aby na ni stránka zareagovala. */
  function nastav(mapa) {
    if (typeof mapa === 'function') { mapa(); return; }
    Object.entries(mapa || {}).forEach(([sel, v]) => {
      const e = document.querySelector(sel);
      if (!e) return;
      if (e.type === 'checkbox' || e.type === 'radio') e.checked = !!v;
      else e.value = v;
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  const hodnota = sel => {
    const e = document.querySelector(sel);
    if (!e) return NaN;
    if (e.type === 'checkbox') return e.checked;
    const n = Number(e.value);
    return e.value !== '' && !isNaN(n) ? n : e.value;
  };

  /* ---- uložený postup --------------------------------------------------- */
  function nactiVse() {
    try { return JSON.parse(localStorage.getItem(KLIC) || '{}') || {}; } catch { return {}; }
  }
  function nactiStav() {
    const s = nactiVse()[SOUBOR];
    return s && typeof s === 'object' ? { ukoly: s.ukoly || {}, otevreno: s.otevreno, strana: s.strana } : { ukoly: {} };
  }
  function ulozStav() {
    try {
      const vse = nactiVse();
      vse[SOUBOR] = { ukoly: stav.ukoly, otevreno: stav.otevreno, strana: stav.strana };
      localStorage.setItem(KLIC, JSON.stringify(vse));
    } catch { /* bez úložiště panel funguje, jen si nic nepamatuje */ }
  }

  let def = null;       // definice ze stránky
  let stav = null;      // { ukoly: {id: {...}}, otevreno }
  let ui = null;        // odkazy na prvky panelu
  let zalozka = 0;      // index úkolu, nebo 'otazky'

  const stavUkolu = u => (stav.ukoly[u.id] = stav.ukoly[u.id] || {});
  const hotovo = () => def.ukoly.filter(u => stav.ukoly[u.id]?.hotovo).length;
  const prvniNehotovy = () => Math.max(0, def.ukoly.findIndex(u => !stav.ukoly[u.id]?.hotovo));

  /* ---- panel ------------------------------------------------------------ */
  function sestavPanel() {
    const panel = el('aside', 'badani');
    panel.setAttribute('aria-label', 'Úkoly k modelu');
    // Strana podle stránky (kde model nemá důležité části), žák ji může přehodit.
    panel.dataset.strana = stav.strana || def.strana || 'vpravo';

    const spoustec = tlacitko('', 'badani-spoustec', () => otevri(zalozka));
    spoustec.setAttribute('aria-controls', 'badaniOkno');
    spoustec.setAttribute('aria-expanded', 'false');

    const okno = el('div', 'badani-okno');
    okno.id = 'badaniOkno';
    okno.setAttribute('role', 'region');
    okno.setAttribute('aria-labelledby', 'badaniNadpis');
    okno.hidden = true;

    const hlava = el('div', 'badani-hlava');
    const h = el('h2', null, '🧪 Úkoly k modelu');
    h.id = 'badaniNadpis';
    const prehod = tlacitko('⇄', 'badani-ikona', () => {
      panel.dataset.strana = panel.dataset.strana === 'vlevo' ? 'vpravo' : 'vlevo';
      stav.strana = panel.dataset.strana;
      ulozStav();
      ukotvi();
    });
    prehod.title = 'Přesunout panel na druhou stranu';
    prehod.setAttribute('aria-label', 'Přesunout panel na druhou stranu');
    const sbal = tlacitko('—', 'badani-ikona', sbalit);
    sbal.title = 'Sbalit panel (Esc)';
    sbal.setAttribute('aria-label', 'Sbalit panel');
    hlava.append(h, prehod, sbal);

    const zalozky = el('nav', 'badani-zalozky');
    zalozky.setAttribute('aria-label', 'Úkoly a otázky');

    const telo = el('div', 'badani-telo');
    const ukol = el('section', 'badani-ukol');
    ukol.dataset.faze = 'vyuka';
    ukol.setAttribute('aria-live', 'off');
    const otazky = el('section', 'badani-otazky');
    otazky.dataset.faze = 'procvic';
    otazky.setAttribute('data-kostra-odpovedi', '');
    otazky.setAttribute('aria-label', 'Otázky k modelu');
    telo.append(ukol, otazky);

    okno.append(hlava, zalozky, telo);

    // Tahák: shrnutí všech úkolů; kostra ho zkopíruje do dialogu 📌 Tahák.
    const tahak = el('div', 'badani-tahak');
    tahak.dataset.faze = 'tahak';
    tahak.hidden = true;
    tahak.append(el('h3', null, 'Co ukázaly pokusy s modelem'));
    const ul = el('ul');
    def.ukoly.forEach(u => ul.append(el('li', null, `<b>${u.nazev}:</b> ${u.shrnuti}`)));
    tahak.append(ul);
    if (def.tahak) tahak.append(el('div', 'badani-tahak-navic', def.tahak));

    panel.append(spoustec, okno, tahak);
    document.body.append(panel);

    // Šipky a písmena v panelu nemají ovládat model pod ním (simulace
    // poslouchají klávesy na window). Esc panel sbalí.
    panel.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !okno.hidden) { e.preventDefault(); sbalit(); spoustec.focus(); }
      e.stopPropagation();
    });

    ui = { panel, spoustec, okno, zalozky, ukol, otazky, h };
  }

  function popisSpoustece(upozorneni) {
    const n = def.ukoly.length, k = hotovo();
    ui.spoustec.innerHTML = `🧪 Úkoly k modelu <span class="badani-pocet">${k}/${n}</span>` +
      (upozorneni ? ` <span class="badani-upozorneni">${upozorneni}</span>` : '');
    ui.spoustec.classList.toggle('badani-upozorni', !!upozorneni);
  }

  function otevri(kam) {
    if (kam != null) zalozka = kam;
    ui.okno.hidden = false;
    ui.panel.classList.add('badani-otevreno');
    ui.spoustec.setAttribute('aria-expanded', 'true');
    stav.otevreno = true;
    ulozStav();
    popisSpoustece();
    vykresli();
    ukotvi();
  }
  function sbalit() {
    ui.okno.hidden = true;
    ui.panel.classList.remove('badani-otevreno');
    ui.spoustec.setAttribute('aria-expanded', 'false');
    stav.otevreno = false;
    ulozStav();
    popisSpoustece();
    ukotvi();
    zakryjVyklad();
  }

  function ukotvi() {
    const root = document.documentElement;
    const dok = DOK.matches && !ui.okno.hidden;
    const strana = ui.panel.dataset.strana;
    if (root.classList.contains('badani-dok') === dok && root.dataset.badaniStrana === strana) return;
    root.classList.toggle('badani-dok', dok);
    root.dataset.badaniStrana = strana;
    // Plátna simulací se přepočítávají při resize okna – šířka stránky se
    // ale změnila bez něj, tak ho vyvoláme (stejně jako podpis.js).
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }

  function vykresliZalozky() {
    ui.zalozky.replaceChildren();
    def.ukoly.forEach((u, i) => {
      const s = stav.ukoly[u.id] || {};
      const b = tlacitko(`${s.hotovo ? '✅' : i + 1}<span class="badani-skryte"> ${u.nazev}</span>`, null, () => { zalozka = i; vykresli(); ui.ukol.querySelector('h3')?.focus(); });
      b.title = `Úkol ${i + 1}: ${u.nazev}${s.hotovo ? ' (hotovo)' : ''}`;
      b.setAttribute('aria-pressed', String(zalozka === i));
      ui.zalozky.append(b);
    });
    if (def.otazky && def.otazky.length) {
      const b = tlacitko('❓ Otázky', 'badani-zalozka-otazky', () => { zalozka = 'otazky'; vykresli(); });
      b.setAttribute('aria-pressed', String(zalozka === 'otazky'));
      b.title = 'Otázky k modelu – procvičování, na nich stojí i 🎯 Ověř se';
      ui.zalozky.append(b);
    }
  }

  function vykresli() {
    vykresliZalozky();
    const naOtazkach = zalozka === 'otazky';
    ui.otazky.hidden = !naOtazkach;
    ui.ukol.hidden = naOtazkach;
    if (!naOtazkach) vykresliUkol(def.ukoly[zalozka] ? zalozka : 0);
    zakryjVyklad();
  }

  /* Výklad stránky, který by prozradil odpověď, se rozmaže, dokud žák
     u otevřeného úkolu nezapíše předpověď. */
  function zakryjVyklad() {
    if (!def.zakryt) return;
    const u = typeof zalozka === 'number' ? def.ukoly[zalozka] : null;
    const cekaNaTip = !!u && !ui.okno.hidden && stav.ukoly[u.id]?.predpoved == null;
    document.querySelectorAll(def.zakryt).forEach(e => {
      e.classList.toggle('badani-zakryto', cekaNaTip);
      if (cekaNaTip) {
        e.setAttribute('aria-hidden', 'true');
        e.title = 'Výklad se ukáže, až si v panelu 🧪 Úkoly k modelu tipneš.';
      } else {
        e.removeAttribute('aria-hidden');
        e.removeAttribute('title');
      }
    });
  }

  /* ---- jeden úkol --------------------------------------------------------- */
  function krok(cislo, nazev, stavKroku) {
    const k = el('div', 'badani-krok');
    k.dataset.stav = stavKroku;   // hotovy | aktivni
    const h = el('h4', null, `<span class="badani-krok-cislo" aria-hidden="true">${cislo}</span> ${nazev}`);
    h.tabIndex = -1;
    k.append(h);
    return k;
  }

  function vykresliUkol(i) {
    const u = def.ukoly[i];
    const s = stavUkolu(u);
    const box = ui.ukol;
    box.replaceChildren();
    const h3 = el('h3', null, `Úkol ${i + 1} z ${def.ukoly.length} · ${u.nazev}`);
    h3.tabIndex = -1;
    box.append(h3);
    if (u.uvod) box.append(el('p', 'badani-uvod', u.uvod));

    // 1) Předpověz
    // Hotový krok se sbalí do jednoho řádku, ať panel nezakrývá model.
    const k1 = krok(1, '🤔 Předpověz', s.predpoved == null ? 'aktivni' : 'hotovy');
    if (s.predpoved == null) {
      k1.append(el('p', null, u.predpoved.otazka));
      const volby = el('div', 'badani-volby');
      u.predpoved.moznosti.forEach((t, j) => volby.append(tlacitko(t, null, () => zapisPredpoved(i, j))));
      k1.append(volby);
      k1.append(el('p', 'badani-pozn', 'Tipni si dřív, než cokoli zkusíš. Za tip se nic nepočítá – potom ho porovnáš s tím, co ukáže model.'));
      box.append(k1);
      return;
    }
    const tip = el('p', 'badani-souhrn', `Tvůj tip: <b>${u.predpoved.moznosti[s.predpoved]}</b>`);
    tip.title = u.predpoved.otazka.replace(/<[^>]+>/g, '');
    k1.append(tip);
    box.append(k1);

    // 2) Vyzkoušej
    const k2 = krok(2, '🔬 Vyzkoušej', s.pokus ? 'hotovy' : 'aktivni');
    const pokusSbaleny = s.pokus && s.vysvetleni;
    if (!pokusSbaleny) k2.append(el('p', null, u.pokus));
    const stavPokusu = el('p', 'badani-stav-pokusu');
    if (!pokusSbaleny) stavPokusu.setAttribute('role', 'status');
    if (s.pokus) {
      stavPokusu.innerHTML = `✅ <b>Pokus hotový.</b> ${s.pozorovani || ''}` + (s.pomoc ? ' <span class="badani-pozn">(s ukázkou)</span>' : '');
      stavPokusu.classList.add('badani-ok');
    } else {
      stavPokusu.innerHTML = '⏳ Model čeká na tvůj pokus. Panel pozná sám, až bude hotový.';
    }
    k2.append(stavPokusu);
    if (pokusSbaleny) {
      stavPokusu.classList.add('badani-souhrn');
      box.append(k2);
    }
    const akce2 = el('div', 'badani-akce');
    akce2.append(tlacitko('↺ Připravit model znovu', null, () => nastav(u.priprava)));
    if (u.ukaz && !s.pokus) akce2.append(tlacitko('🙋 Ukaž mi', null, () => {
      s.pomoc = true;
      ulozStav();
      nastav(u.ukaz);
      zkontrolujPokus();
    }));
    if (s.pokus && !s.vysvetleni) {
      const dal = tlacitko('Pokračovat →', 'badani-hlavni', () => { s.vysvetleni = 'otevreno'; ulozStav(); vykresliUkol(i); zaostri('.badani-krok:last-of-type h4'); });
      akce2.append(dal);
    }
    if (!pokusSbaleny) {
      k2.append(akce2);
      box.append(k2);
      return;
    }

    // 3) Vysvětli
    const k3 = krok(3, '💬 Vysvětli', s.hotovo ? 'hotovy' : 'aktivni');
    const potvrdila = s.predpoved === u.predpoved.spravna;
    k3.append(el('p', 'badani-srovnani ' + (potvrdila ? 'badani-ok' : 'badani-jinak'),
      potvrdila
        ? `✔ Tvoje předpověď <b>„${u.predpoved.moznosti[s.predpoved]}“</b> se potvrdila.`
        : `✗ Tvoje předpověď byla <b>„${u.predpoved.moznosti[s.predpoved]}“</b>, pokus ukázal <b>„${u.predpoved.moznosti[u.predpoved.spravna]}“</b>. Nevadí – právě kvůli tomu se pokusy dělají.`));
    k3.append(el('p', null, u.vysvetli.otazka));
    const moz = el('div', 'badani-volby badani-vysvetleni');
    const odezva = el('p', 'badani-odezva');
    odezva.setAttribute('role', 'status');
    const moznosti = s.poradiVysvetleni && s.poradiVysvetleni.length === u.vysvetli.moznosti.length
      ? s.poradiVysvetleni : zamichej(u.vysvetli.moznosti.map((_, j) => j));
    s.poradiVysvetleni = moznosti;
    moznosti.forEach(j => {
      const m = u.vysvetli.moznosti[j];
      const b = tlacitko(m.t, null, () => {
        if (m.ok) {
          b.classList.add('badani-spravne');
          moz.querySelectorAll('button').forEach(x => { x.disabled = true; });
          if (s.hotovo !== true) {
            s.napoprve = !(s.chybneVysvetleni && s.chybneVysvetleni.length);
            s.hotovo = true;
            ulozStav();
          }
          vykresliUkol(i);
          popisSpoustece();
          vykresliZalozky();
          zaostri('.badani-shrnuti');
        } else {
          b.classList.add('badani-spatne');
          b.disabled = true;
          s.chybneVysvetleni = [...new Set([...(s.chybneVysvetleni || []), j])];
          ulozStav();
          odezva.className = 'badani-odezva badani-chyba';
          odezva.innerHTML = '✗ ' + (m.proc || 'Tohle model nepotvrdil. Zkus jiné vysvětlení.');
        }
      });
      if (s.hotovo) {
        b.disabled = true;
        if (m.ok) b.classList.add('badani-spravne');
      } else if ((s.chybneVysvetleni || []).includes(j)) {
        b.disabled = true;
        b.classList.add('badani-spatne');
      }
      moz.append(b);
    });
    k3.append(moz, odezva);
    box.append(k3);
    if (!s.hotovo) return;

    const shrnuti = el('div', 'badani-shrnuti', `<b>📌 Zapamatuj si:</b> ${u.shrnuti}`);
    shrnuti.tabIndex = -1;
    box.append(shrnuti);
    const akce = el('div', 'badani-akce');
    const dalsi = def.ukoly.findIndex((x, j) => j !== i && !stav.ukoly[x.id]?.hotovo);
    if (dalsi >= 0) akce.append(tlacitko(`Další úkol →`, 'badani-hlavni', () => { zalozka = dalsi; vykresli(); zaostri('h3'); }));
    else if (def.otazky && def.otazky.length) akce.append(tlacitko('Všechny úkoly hotové – na otázky →', 'badani-hlavni', () => { zalozka = 'otazky'; vykresli(); zaostri('.badani-otazka-text'); }));
    akce.append(tlacitko('↺ Zkusit úkol znovu', null, () => {
      delete stav.ukoly[u.id];
      ulozStav();
      popisSpoustece();
      vykresli();   // vykreslí i zakrytí výkladu
      zaostri('h3');
    }));
    box.append(akce);
  }

  function zaostri(sel) {
    requestAnimationFrame(() => {
      const cil = (zalozka === 'otazky' ? ui.otazky : ui.ukol).querySelector(sel);
      if (cil) { if (!cil.hasAttribute('tabindex')) cil.tabIndex = -1; cil.focus({ preventScroll: false }); }
    });
  }

  function zapisPredpoved(i, j) {
    const u = def.ukoly[i];
    const s = stavUkolu(u);
    s.predpoved = j;
    delete s.pokus; delete s.pozorovani; delete s.pomoc; delete s.vysvetleni;
    ulozStav();
    nastav(u.priprava);           // model do výchozího stavu úkolu
    vykresliUkol(i);
    zakryjVyklad();
    zaostri('.badani-krok:nth-of-type(2) h4');
    // splněno už po přípravě? (nemělo by, ale pro jistotu až po vykreslení)
    setTimeout(zkontrolujPokus, 0);
  }

  /* ---- rozpoznání pokusu --------------------------------------------------- */
  let planovano = false;
  function naplanujKontrolu() {
    if (planovano) return;
    planovano = true;
    requestAnimationFrame(() => { planovano = false; zkontrolujPokus(); });
  }
  function zkontrolujPokus() {
    if (!def) return;
    // Kontroluje se úkol, který má žák rozdělaný (i při sbaleném panelu).
    const i = typeof zalozka === 'number' ? zalozka : -1;
    const u = def.ukoly[i];
    if (!u) return;
    const s = stav.ukoly[u.id];
    if (!s || s.predpoved == null || s.pokus) return;
    let ok = false;
    try { ok = !!u.splneno(); } catch { ok = false; }
    if (!ok) return;
    s.pokus = true;
    try { s.pozorovani = hodnotaTextu(u.pozorovani); } catch { s.pozorovani = ''; }
    ulozStav();
    if (!ui.okno.hidden) vykresliUkol(i);
    popisSpoustece(ui.okno.hidden ? '✅ pokus hotový' : '');
  }

  /* ---- otázky (procvičování a základ pro Ověř se) ------------------------ */
  const Otazky = (function () {
    let fronta = [];
    let aktualni = null;     // { data, token, odpovezeno, chyby }
    let skore = { napoprve: 0, celkem: 0 };

    function dalsiData() {
      if (!fronta.length) fronta = zamichej(def.otazky.map((_, i) => i));
      const q = def.otazky[fronta.shift()];
      return typeof q === 'function' ? q() : q;
    }

    function nova() {
      aktualni = { data: dalsiData(), token: {}, odpovezeno: false, chyby: 0 };
      vykresli();
      if (window.Kostra) window.Kostra.otazka();
    }

    function vykresli() {
      const box = ui.otazky;
      box.replaceChildren();
      const q = aktualni.data;
      const p = el('p', 'badani-otazka-text', q.otazka);
      p.tabIndex = -1;
      box.append(p);
      const moz = el('div', 'moznosti badani-volby');
      const odezva = el('p', 'badani-odezva odezva');
      odezva.setAttribute('role', 'status');
      odezva.setAttribute('aria-live', 'polite');
      const moznosti = q.poradi ? q.moznosti : zamichej(q.moznosti);
      moznosti.forEach(m => {
        const b = tlacitko(m.t, null, () => odpovez(m, b, moz, odezva));
        moz.append(b);
      });
      box.append(moz, odezva);
      const akce = el('div', 'badani-akce');
      const dal = tlacitko('Pokračovat →', 'badani-hlavni badani-pokracovat', nova);
      dal.hidden = true;
      akce.append(dal);
      const sk = el('span', 'badani-skore');
      sk.textContent = skore.celkem ? `Správně napoprvé ${skore.napoprve} z ${skore.celkem}` : '';
      akce.append(sk);
      box.append(akce);
    }

    function odpovez(m, b, moz, odezva) {
      if (!aktualni || aktualni.odpovezeno) return;
      const prvni = aktualni.chyby === 0;
      if (window.Kostra) window.Kostra.odpoved(!!m.ok, aktualni.token);
      if (m.ok) {
        aktualni.odpovezeno = true;
        if (prvni) skore.napoprve++;
        skore.celkem++;
        b.classList.add('badani-spravne', 'spravne');
        moz.querySelectorAll('button').forEach(x => { x.disabled = true; });
        odezva.className = 'badani-odezva odezva badani-ok ok';
        odezva.innerHTML = '✔ Správně. ' + (aktualni.data.vysvetleni || '');
        const dal = ui.otazky.querySelector('.badani-pokracovat');
        dal.hidden = false;
        ui.otazky.querySelector('.badani-skore').textContent = `Správně napoprvé ${skore.napoprve} z ${skore.celkem}`;
        dal.focus();
      } else {
        if (prvni) skore.celkem++;
        aktualni.chyby++;
        b.classList.add('badani-spatne', 'spatne');
        b.disabled = true;
        odezva.className = 'badani-odezva odezva badani-chyba chyba';
        odezva.innerHTML = '✗ ' + (m.proc || 'To ne. Zkus to znovu.');
        ui.otazky.querySelector('.badani-skore').textContent = `Správně napoprvé ${skore.napoprve} z ${skore.celkem}`;
      }
    }

    return { nova, maOtazku: () => !!aktualni };
  })();

  /* ---- napojení na kostru ------------------------------------------------ */
  // Lišta fází: 📖 Výuka otevře rozdělaný úkol, ✏️ Procvič a 🎯 Ověř se otázky.
  document.addEventListener('metodus:faze', e => {
    if (!ui) return;
    const id = e.detail && e.detail.id;
    if (id === 'vyuka') otevri(typeof zalozka === 'number' ? zalozka : prvniNehotovy());
    else if (id === 'procvic' || id === 'overse') otevri('otazky');
  });

  /* Panel se drží nad spodní lištou stránky (stavový řádek s hodnotami
     modelu), aby ji nezakrýval: def.nad = selektor té lišty. */
  function drzNad(sel) {
    const lista = document.querySelector(sel);
    if (!lista) return;
    const umisti = () => {
      const r = lista.getBoundingClientRect();
      const dole = r.height && r.top < innerHeight ? Math.max(0, Math.round(innerHeight - r.top)) : 0;
      ui.panel.style.setProperty('--badani-dole', dole + 'px');
    };
    umisti();
    addEventListener('resize', umisti);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(umisti).observe(lista);
  }

  /* ---- start ------------------------------------------------------------- */
  function start(definice) {
    if (def) return;
    def = definice;
    def.ukoly = def.ukoly || [];
    def.otazky = def.otazky || [];
    stav = nactiStav();
    pripojStyl();
    sestavPanel();
    zalozka = prvniNehotovy();
    if (def.otazky.length) Otazky.nova();
    popisSpoustece();
    vykresli();
    if (def.nad) drzNad(def.nad);
    DOK.addEventListener('change', ukotvi);
    // Poprvé se panel na širší obrazovce sám otevře, na mobilu zůstane
    // sbalený (zakryl by model). Potom si pamatuje, jak ho žák nechal.
    const siroka = matchMedia('(min-width: 900px)').matches;
    if (stav.otevreno === true || (stav.otevreno == null && siroka)) otevri();

    ['input', 'change', 'click', 'pointerup', 'keyup'].forEach(t =>
      document.addEventListener(t, naplanujKontrolu, true));
    // animace modelu mění stav i bez událostí (tažení lana, zdvih páky)
    setInterval(zkontrolujPokus, 400);
  }

  window.Badani = {
    start, nastav, hodnota, cislo,
    otevri: kam => ui && otevri(kam),
    sbalit: () => ui && sbalit(),
    definice: () => def,          // pro kontrolu obsahu v testech
  };
})();
