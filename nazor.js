/* ============================================================
   nazor.js – knihovna sdílených názorných prvků Metodusu.

   Stejný jev se na celém webu kreslí stejně: zlomek je vždy tentýž
   koláč, proužek a číselná osa, větné členy mají všude stejné barvy,
   letopočty leží na stejné časové ose. Stránky prvky nekreslí samy,
   ale berou je odsud.

     Nazor.kolac(dilu, vybarvene, volby)      → SVG řetězec
     Nazor.prouzek(dilu, vybarvene, volby)    → SVG řetězec
     Nazor.zlomekNaOse(citatel, jmenovatel)   → SVG řetězec (osa 0–1)
     Nazor.osa(volby)                         → SVG řetězec (celá/desetinná čísla)
     Nazor.procenta(cast, celek, volby)       → HTML proužek 0–100 %
     Nazor.veta(slova, volby)                 → HTML věta s barevnými členy
     Nazor.legenda(cleny)                     → HTML legenda větných členů
     Nazor.casovaOsa(udalosti, volby)         → HTML časová osa (pruhy ČR/svět)
     Nazor.mapa(kontinent, znacky)            → SVG slepé mapy (mapy.js)
     Nazor.rok(r)                             → „776 př. n. l." / „1918"

   Barvy a velikosti jsou v nazor.css (proměnné z common.css, oba motivy).
   Ukázky všech prvků: docs/nazor-ukazky.html
   ============================================================ */
const Nazor = (function () {
  'use strict';

  const esc = t => String(t).replace(/[&<>"]/g, z => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[z]));
  // česká desetinná čárka a typografické minus (−5, ne -5)
  const cislo = (x, mist = 2) => Number(x.toFixed(mist)).toLocaleString('cs-CZ').replace('-', '−');
  const tridy = (zaklad, volby) => zaklad + (volby && volby.trida ? ' ' + volby.trida : '');

  /* ---- zlomek: koláč, proužek, osa – stejně velký celek (180 jednotek) ---- */
  function vysec(i, n) {
    const cx = 90, cy = 90, r = 84;
    if (n === 1) return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    const a1 = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const a2 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / n;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const velky = (a2 - a1) > Math.PI ? 1 : 0;
    return `M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} `
      + `A${r} ${r} 0 ${velky} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  }
  const seznam = v => Array.isArray(v) ? v : [...Array(v || 0).keys()];

  /* dilu – na kolik stejných dílů je celek rozdělený,
     vybarvene – počet prvních dílů, nebo pole indexů,
     volby.klikaci – díly jsou klikací (stránka si navěsí obsluhu),
     volby.trida – třída navíc (kvůli starším stylům stránky). */
  function kolac(dilu, vybarvene, volby = {}) {
    const v = seznam(vybarvene);
    let cesty = '';
    for (let i = 0; i < dilu; i++) {
      cesty += `<path class="${v.includes(i) ? 'plna' : 'prazdna'}" data-i="${i}" d="${vysec(i, dilu)}"/>`;
    }
    return `<svg class="${tridy('nazor-kolac' + (volby.klikaci ? ' klikaci' : ''), volby)}" viewBox="0 0 180 180" role="img"
      aria-label="Koláč rozdělený na ${dilu} dílů, vybarvených ${v.length}">${cesty}</svg>`;
  }

  function prouzek(dilu, vybarvene, volby = {}) {
    const v = seznam(vybarvene);
    const sirka = 176 / dilu;
    let obd = '';
    for (let i = 0; i < dilu; i++) {
      obd += `<rect class="${v.includes(i) ? 'plna' : 'prazdna'}" data-i="${i}"`
        + ` x="${(2 + i * sirka).toFixed(1)}" y="60" width="${sirka.toFixed(1)}" height="60"/>`;
    }
    return `<svg class="${tridy('nazor-prouzek', volby)}" viewBox="0 0 180 180" role="img"
      aria-label="Proužek rozdělený na ${dilu} dílů, vybarvených ${v.length}">${obd}</svg>`;
  }

  function zlomekNaOse(c, j, volby = {}) {
    const x = i => 10 + (160 * i) / j;
    let znacky = '';
    for (let i = 0; i <= j; i++) {
      znacky += `<line class="znacka" x1="${x(i).toFixed(1)}" y1="82" x2="${x(i).toFixed(1)}" y2="98"/>`;
    }
    return `<svg class="${tridy('nazor-zlomek-osa', volby)}" viewBox="0 0 180 180" role="img"
      aria-label="Číselná osa od nuly do jedné rozdělená na ${j} dílů, značka na ${c} dílech">
      <line x1="10" y1="90" x2="170" y2="90"/>${znacky}
      <circle class="bod" cx="${x(c).toFixed(1)}" cy="90" r="6"/>
      <text x="10" y="118">0</text><text x="170" y="118">1</text>
      <text x="${x(c).toFixed(1)}" y="70">${c}/${j}</text></svg>`;
  }

  /* ---- číselná osa pro celá a desetinná čísla --------------------------
     volby = { od, do, krok (velké značky), jemny (malé značky, nepovinné),
               body: [{ hodnota, popis?, druh? ('hlavni'|'druhy'|'chyba') }],
               skok: { z, na, popis? } – oblouk pohybu po ose,
               popisek: funkce hodnota → text značky, nula: zvýraznit nulu } */
  function osa(volby) {
    const od = volby.od, dok = volby.do;
    const krok = volby.krok || 1;
    const S = 600, V = 120, L = 30, P = 570, Y = 70;
    const x = h => L + ((h - od) / (dok - od)) * (P - L);
    const popisek = volby.popisek || (h => cislo(h, 3));
    const prvky = [];
    prvky.push(`<line class="cara" x1="${L - 14}" y1="${Y}" x2="${P + 14}" y2="${Y}"/>`);
    prvky.push(`<path class="cara" d="M${P + 14} ${Y} l-9 -6 M${P + 14} ${Y} l-9 6"/>`);
    if (volby.jemny) {
      const n = Math.round((dok - od) / volby.jemny);
      for (let i = 0; i <= n; i++) {
        const h = od + i * volby.jemny;
        prvky.push(`<line class="jemna" x1="${x(h).toFixed(1)}" y1="${Y - 5}" x2="${x(h).toFixed(1)}" y2="${Y + 5}"/>`);
      }
    }
    const n = Math.round((dok - od) / krok);
    for (let i = 0; i <= n; i++) {
      const h = od + i * krok;
      const nula = Math.abs(h) < 1e-9 && volby.nula !== false;
      prvky.push(`<line class="znacka${nula ? ' nula' : ''}" x1="${x(h).toFixed(1)}" y1="${Y - 10}" x2="${x(h).toFixed(1)}" y2="${Y + 10}"/>`);
      prvky.push(`<text class="${nula ? 'nula' : ''}" x="${x(h).toFixed(1)}" y="${Y + 30}">${esc(popisek(h))}</text>`);
    }
    if (volby.skok) {
      const x1 = x(volby.skok.z), x2 = x(volby.skok.na), vyska = Math.min(40, Math.abs(x2 - x1) / 2 + 10);
      prvky.push(`<path class="skok" d="M${x1.toFixed(1)} ${Y - 12} Q${((x1 + x2) / 2).toFixed(1)} ${Y - 12 - vyska} ${x2.toFixed(1)} ${Y - 12}"/>`);
      prvky.push(`<path class="skok-hrot" d="M${x2.toFixed(1)} ${Y - 12} l${x2 > x1 ? -8 : 8} -5 v10 z"/>`);
      if (volby.skok.popis) prvky.push(`<text class="skok-popis" x="${((x1 + x2) / 2).toFixed(1)}" y="${(Y - 18 - vyska).toFixed(1)}">${esc(volby.skok.popis)}</text>`);
    }
    (volby.body || []).forEach(b => {
      const bx = x(b.hodnota).toFixed(1);
      prvky.push(`<circle class="bod ${b.druh || 'hlavni'}" cx="${bx}" cy="${Y}" r="7"/>`);
      if (b.popis) prvky.push(`<text class="bod-popis ${b.druh || 'hlavni'}" x="${bx}" y="${Y - 16}">${esc(b.popis)}</text>`);
    });
    const popis = volby.popis || `Číselná osa od ${popisek(od)} do ${popisek(dok)}`
      + ((volby.body || []).length ? ', vyznačeno: ' + volby.body.map(b => b.popis || popisek(b.hodnota)).join(', ') : '');
    return `<svg class="${tridy('nazor-osa', volby)}" viewBox="0 0 ${S} ${V}" role="img" aria-label="${esc(popis)}">${prvky.join('')}</svg>`;
  }

  /* ---- procenta: proužek hodnot nad proužkem 0–100 % ------------------ */
  function procenta(cast, celek, volby = {}) {
    const p = celek ? Math.max(0, Math.min(100, (cast / celek) * 100)) : 0;
    const jednotka = volby.jednotka ? ' ' + volby.jednotka : '';
    return `<div class="${tridy('nazor-procenta', volby)}" role="img"
        aria-label="${esc(`${cislo(cast)}${jednotka} z ${cislo(celek)}${jednotka} je ${cislo(p)} %`)}">
      <div class="nazor-procenta-radek"><span class="nazor-procenta-stitek">hodnota</span>
        <div class="nazor-procenta-pas"><div class="nazor-procenta-dil" style="width:${p.toFixed(2)}%"></div></div>
        <span class="nazor-procenta-kraj">${cislo(celek)}${jednotka}</span></div>
      <div class="nazor-procenta-radek"><span class="nazor-procenta-stitek">procenta</span>
        <div class="nazor-procenta-pas nazor-procenta-stupnice">${[0, 25, 50, 75, 100].map(k => `<i style="left:${k}%">${k} %</i>`).join('')}
          <div class="nazor-procenta-dil" style="width:${p.toFixed(2)}%"></div></div>
        <span class="nazor-procenta-kraj">100 %</span></div>
      <p class="nazor-procenta-popis">${esc(cislo(cast))}${jednotka} z ${esc(cislo(celek))}${jednotka} = <b>${cislo(p)} %</b></p>
    </div>`;
  }

  /* ---- věta s větnými členy -------------------------------------------
     slova: [{ t: 'Pes', clen: 'podmet' }, …] nebo [['Pes', 'podmet'], …]
     clen: podmet | prisudek | predmet | privlastek | urceni | doplnek | (prázdné)
     volby.znacky – pod slovo napsat zkratku členu,
     volby.zvyraz – index zvýrazněného slova. */
  const CLENY = {
    podmet: { nazev: 'podmět', zkratka: 'Po', otazka: 'kdo? co?' },
    prisudek: { nazev: 'přísudek', zkratka: 'Př', otazka: 'co dělá? co se děje?' },
    predmet: { nazev: 'předmět', zkratka: 'Pt', otazka: 'pádové otázky kromě 1. a 5. pádu' },
    privlastek: { nazev: 'přívlastek', zkratka: 'Pk', otazka: 'jaký? který? čí?' },
    urceni: { nazev: 'příslovečné určení', zkratka: 'Pu', otazka: 'kde? kdy? jak? proč?' },
    doplnek: { nazev: 'doplněk', zkratka: 'D', otazka: 'jako kdo? jako co?' },
  };
  function veta(slova, volby = {}) {
    const html = slova.map((s, i) => {
      const [t, clen] = Array.isArray(s) ? s : [s.t, s.clen];
      const c = clen && CLENY[clen];
      const znacka = volby.znacky && c ? `<small>${c.zkratka}</small>` : '';
      return `<span class="nazor-slovo${c ? ' clen-' + clen : ''}${volby.zvyraz === i ? ' zvyraz' : ''}"`
        + (c ? ` title="${c.nazev}"` : '') + `>${esc(t)}${znacka}</span>`;
    }).join(' ');
    return `<span class="${tridy('nazor-veta', volby)}">${html}</span>`;
  }
  function legenda(cleny = Object.keys(CLENY)) {
    return `<span class="nazor-legenda">` + cleny.filter(c => CLENY[c]).map(c =>
      `<span class="clen-${c}"><b>${CLENY[c].zkratka}</b> ${CLENY[c].nazev}</span>`).join('') + `</span>`;
  }

  /* ---- časová osa ------------------------------------------------------
     udalosti: [{ rok, nazev, popis?, pruh? }], rok < 0 = před naším letopočtem
     volby.pruhy: [{ id, nazev }] – souběžné pruhy (například ČR a svět),
     volby.od, volby.do – rozsah; jinak podle událostí. Rok 0 neexistuje:
     mezi 1 př. n. l. a 1 n. l. je jen jeden rok.
     volby.meritko: 'linearni' (výchozí, vzdálenost = počet let) nebo 'poradi'
     (stejné rozestupy v pořadí – čitelné u hustých období; oba pruhy sdílejí
     jedno pořadí, takže je vidět, co se dělo současně). */
  const rok = r => r < 0 ? `${-r} př. n. l.` : String(r);
  const naOse = r => r < 0 ? r + 1 : r;   // posun, aby osa neměla rok 0
  function casovaOsa(udalosti, volby = {}) {
    const pruhy = volby.pruhy && volby.pruhy.length ? volby.pruhy : [{ id: '', nazev: '' }];
    const roky = udalosti.map(u => naOse(u.rok));
    const od = volby.od != null ? naOse(volby.od) : Math.min(...roky);
    const dok = volby.do != null ? naOse(volby.do) : Math.max(...roky);
    const rozpeti = Math.max(1, dok - od);
    const kroky = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    const krok = kroky.find(k => rozpeti / k <= 12) || 1000;
    const poradi = volby.meritko === 'poradi';
    const serazene = [...new Set(udalosti.map(u => u.rok))].sort((a, b) => a - b);
    const poloha = poradi
      ? r => serazene.length > 1 ? (serazene.indexOf(r) / (serazene.length - 1)) * 100 : 50
      : r => ((naOse(r) - od) / rozpeti) * 100;
    // značky na kulatých skutečných letopočtech; místo neexistujícího roku 0 rok 1
    const znacky = [];
    const odSkutecny = od <= 0 ? od - 1 : od;
    for (let z = Math.ceil(odSkutecny / krok) * krok; !poradi && naOse(z || 1) <= dok; z += krok) {
      const r = z === 0 ? 1 : z;
      if (naOse(r) < od) continue;
      znacky.push(`<span class="nazor-cas-znacka" style="left:${poloha(r).toFixed(2)}%">${rok(r)}</span>`);
    }
    const radky = pruhy.map(p => {
      const vPruhu = udalosti.filter(u => !p.id || (u.pruh || '') === p.id).sort((a, b) => a.rok - b.rok);
      const body = vPruhu.map((u, i) => `<li class="nazor-cas-udalost${i % 2 ? ' dole' : ''}" style="left:${poloha(u.rok).toFixed(2)}%">
          <span class="nazor-cas-bod" aria-hidden="true"></span>
          <span class="nazor-cas-text"><b>${esc(rok(u.rok))}</b> ${esc(u.nazev)}</span></li>`).join('');
      return `<div class="nazor-cas-pruh">${p.nazev ? `<span class="nazor-cas-nazev">${esc(p.nazev)}</span>` : ''}
        <ol class="nazor-cas-udalosti" aria-label="${esc(p.nazev || 'Události')}">${body}</ol></div>`;
    }).join('');
    const sirka = poradi ? Math.max(640, serazene.length * 74) : Math.max(640, udalosti.length * 90);
    return `<div class="${tridy('nazor-cas' + (poradi ? ' nazor-cas-poradi' : ''), volby)}" style="--nazor-cas-sirka:${sirka}px">
      <div class="nazor-cas-vnitrek">${radky}<div class="nazor-cas-stupnice" aria-hidden="true">${znacky.join('')}</div></div></div>`;
  }

  /* ---- mapa: slepá mapa světadílu ze sdíleného mapy.js ---------------- */
  function mapa(kontinent, znacky, volby) {
    if (typeof Mapy === 'undefined') return '<p class="nazor-chyba">Mapa se nenačetla (chybí mapy.js).</p>';
    return Mapy.svg(kontinent, znacky, volby);
  }

  return { kolac, prouzek, zlomekNaOse, osa, procenta, veta, legenda, CLENY, casovaOsa, rok, mapa };
})();
