/* ============================================================
   barvy-predmetu.js – globální pastelové barvy předmětů (22. 10. 2026).

   Každý předmět má jemnou barvu, kterou se lehce podbarvují řádky menu,
   dlaždice úvodu, osnova, stránka předmětu a hlavička lekce. Barvy, sílu
   podbarvení a vypnutí si uživatel mění v obsah/nastaveni.html.

   Použití ve stránce (po theme.js):
     <script src="../barvy-predmetu.js"></script>
     MetodusBarvy.oznac(prvek, 'cj')           – prvek dostane podbarvení předmětu
     MetodusBarvy.oznac(prvek, polozkaKatalogu) – předmět podle položky (predmet/skupina)
   CSS: třída .podbarva kreslí barvu jako průsvitnou vrstvu nad vlastním
   pozadím prvku (background-image), takže hover a motivy fungují dál.
   Uložení: localStorage['metodus_barvy_predmetu'] = { zapnuto, sila, barvy: { id: '#rrggbb' } }.
   Změna se do ostatních oken dostane událostí `storage`, do rozcestníku
   a rámce i zprávou { metodusBarvy: 1 }.
   ============================================================ */
(function () {
  'use strict';
  const KLIC = 'metodus_barvy_predmetu';
  const PREDMETY = [
    { id: 'cj', label: 'Český jazyk', emoji: '📖' },
    { id: 'm', label: 'Matematika', emoji: '🔢' },
    { id: 'aj', label: 'Anglický jazyk', emoji: '🇬🇧' },
    { id: 'dcj', label: 'Další cizí jazyk', emoji: '🗣️' },
    { id: 'prv', label: 'Prvouka a vlastivěda', emoji: '🏡' },
    { id: 'inf', label: 'Informatika', emoji: '💻' },
    { id: 'f', label: 'Fyzika', emoji: '⚛️' },
    { id: 'ch', label: 'Chemie', emoji: '⚗️' },
    { id: 'pr', label: 'Přírodopis', emoji: '🧬' },
    { id: 'z', label: 'Zeměpis', emoji: '🌍' },
    { id: 'd', label: 'Dějepis', emoji: '📜' },
    { id: 'vo', label: 'Výchova k občanství', emoji: '⚖️' },
    { id: 'hv', label: 'Hudební výchova', emoji: '🎼' },
    { id: 'nastroje', label: 'Nástroje pro učení a učitele', emoji: '🧰' },
  ];
  // pastelové odstíny rozložené po barevném kruhu, ať se sousední předměty neslévají
  const VYCHOZI = {
    cj: '#f2b4b9', m: '#b4d3f2', aj: '#d6bdf2', dcj: '#f6cfaa', prv: '#cbe5a5', inf: '#c0c4f2', f: '#f5e6a3',
    ch: '#f2b4d3', pr: '#b0e2c0', z: '#a6e0d6', d: '#d9c3b1', vo: '#b8d1da', hv: '#e7b9e7', nastroje: '#c9ccd0',
  };
  // skupina menu (KATALOG_SKUPINY) → předmět
  const SKUPINY = {
    cestina: 'cj', matematika: 'm', anglictina: 'aj', dalsi_jazyk: 'dcj', prvouka: 'prv', informatika: 'inf',
    fyzika: 'f', chemie: 'ch', prirodopis: 'pr', zemepis: 'z', dejepis: 'd', obcanska: 'vo', hudba: 'hv', nastroje: 'nastroje',
    // dřívější id skupin
    jazyky: 'aj', priroda: 'f', spolecnost: 'z', dalsi: 'nastroje',
  };
  // podíl barvy ve vrstvě: světlé motivy snesou víc, na tmavém pozadí stačí málo
  const SILY = {
    jemna: { label: 'Jemné', svetla: 42, tmava: 12 },
    stredni: { label: 'Střední', svetla: 62, tmava: 19 },
    vyrazna: { label: 'Výrazné', svetla: 85, tmava: 28 },
  };
  const HEX = /^#[0-9a-f]{6}$/i;

  function nacti() {
    let ulozene = {};
    try { ulozene = JSON.parse(localStorage.getItem(KLIC)) || {}; } catch { ulozene = {}; }
    const barvy = {};
    PREDMETY.forEach(p => {
      const b = ulozene.barvy && ulozene.barvy[p.id];
      barvy[p.id] = HEX.test(b || '') ? b.toLowerCase() : VYCHOZI[p.id];
    });
    return {
      zapnuto: ulozene.zapnuto !== false,
      sila: SILY[ulozene.sila] ? ulozene.sila : 'jemna',
      barvy,
    };
  }

  let stav = nacti();
  const root = document.documentElement;

  function css(s) {
    const sila = SILY[s.sila];
    let t = ':root{' + PREDMETY.map(p => `--podbarva-${p.id}:${s.barvy[p.id]};`).join('')
      + `--podbarva-sila:${sila.svetla}%;}`
      + `:root[data-tone="dark"]{--podbarva-sila:${sila.tmava}%;}`
      + PREDMETY.map(p => `[data-podbarva="${p.id}"]{--podbarva:var(--podbarva-${p.id});}`).join('')
      + '.podbarva{background-image:linear-gradient(color-mix(in srgb,var(--podbarva,transparent) var(--podbarva-sila),transparent),'
      + 'color-mix(in srgb,var(--podbarva,transparent) var(--podbarva-sila),transparent));}';
    if (!s.zapnuto) t += '.podbarva{background-image:none;}';
    return t;
  }

  let styl = null;
  function pouzij() {
    if (!styl) {
      styl = document.createElement('style');
      styl.id = 'metodus-barvy-predmetu';
      (document.head || root).appendChild(styl);
    }
    styl.textContent = css(stav);
    root.dataset.podbarvy = stav.zapnuto ? 'ano' : 'ne';
    window.dispatchEvent(new CustomEvent('metodus-barvy', { detail: stav }));
  }

  function rozesli() {
    document.querySelectorAll('iframe').forEach(f => { try { f.contentWindow.postMessage({ metodusBarvy: 1 }, '*'); } catch { /* cizí rámec */ } });
    if (window.parent !== window) window.parent.postMessage({ metodusBarvy: 1 }, '*');
  }

  function uloz(novy) {
    stav = {
      zapnuto: novy.zapnuto !== false,
      sila: SILY[novy.sila] ? novy.sila : 'jemna',
      barvy: Object.assign({}, stav.barvy, novy.barvy || {}),
    };
    // ukládají se jen změněné barvy – výchozí paleta se tak může později vylepšit
    const zmenene = {};
    PREDMETY.forEach(p => { if (stav.barvy[p.id] !== VYCHOZI[p.id]) zmenene[p.id] = stav.barvy[p.id]; });
    try { localStorage.setItem(KLIC, JSON.stringify({ zapnuto: stav.zapnuto, sila: stav.sila, barvy: zmenene })); } catch { /* bez úložiště */ }
    pouzij();
    rozesli();
    return stav;
  }

  // id předmětu z textu, položky katalogu nebo skupiny
  function predmet(co) {
    if (!co) return 'nastroje';
    if (typeof co === 'string') return VYCHOZI[co] ? co : (SKUPINY[co] || 'nastroje');
    if (co.predmet && VYCHOZI[co.predmet]) return co.predmet;
    if (co.skupina && SKUPINY[co.skupina]) return SKUPINY[co.skupina];
    if (co.soubor && typeof KATALOG_SEKCE !== 'undefined') {
      const s = KATALOG_SEKCE.find(x => x.polozky.some(p => p.soubor === co.soubor));
      if (s) return SKUPINY[s.skupina] || 'nastroje';
    }
    return 'nastroje';
  }

  function oznac(el, co) {
    if (!el) return el;
    el.dataset.podbarva = predmet(co);
    el.classList.add('podbarva');
    return el;
  }

  window.addEventListener('storage', e => { if (e.key === KLIC || e.key === null) { stav = nacti(); pouzij(); } });
  window.addEventListener('message', e => {
    if (e.data && e.data.metodusBarvy) {
      stav = nacti(); pouzij();
      // rozcestník změnu z nastavení pošle dál ostatním rámcům
      if (e.source !== window) document.querySelectorAll('iframe').forEach(f => { if (f.contentWindow !== e.source) try { f.contentWindow.postMessage({ metodusBarvy: 1 }, '*'); } catch { /* cizí rámec */ } });
    }
  });

  window.MetodusBarvy = {
    KLIC, PREDMETY, VYCHOZI, SILY, SKUPINY,
    stav: () => JSON.parse(JSON.stringify(stav)),
    barva: id => stav.barvy[predmet(id)],
    predmet, oznac, uloz,
    obnov: () => uloz({ zapnuto: true, sila: 'jemna', barvy: Object.assign({}, VYCHOZI) }),
  };
  pouzij();
})();
