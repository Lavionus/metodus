/* ============================================================
   zavity_lekce.js – interaktivní výklad „Závity a šrouby“.

   Stavba (stejná jako paka_lekce.js a optika_lekce.js, aby lekce
   fungovaly stejně):
     1. pomůcky (čísla, vektory, kreslení do SVG)
     2. Model – obrázek s úchopy (tažení myší, dotykem i klávesnicí)
     3. Úkoly a předpovědi (postup se ukládá do localStorage)
     4. Navigace (osnova, čipy, mapa lekce)
     5. Kreslení (šipky sil, kóty, země, animace)
     6. Modely kapitol: navinutý trojúhelník, popis závitu, zvedák
        a dílna (společný šroubový stroj), samosvornost, mikrometr,
        třídička „k čemu je závit“
     7. Procvičování (otázky pro fázi Procvič a Ověř se)

   Fyzika šroubu: jedna otáčka = nakloněná rovina se základnou 2πr
   (obvod šroubu) a výškou Pₕ (stoupání). Síla po obvodu
   F₀ = Q · tg(α + φ), kde tg α = Pₕ / (2πr) a tg φ = μ (úhel tření).
   Na klice F = F₀ · r / R. Bez tření F = Q · Pₕ / (2πR) – zlaté
   pravidlo mechaniky. Samosvorný závit: α ≤ φ. Účinnost
   η = tg α / tg(α + φ); samosvorný závit má vždy η < 50 %.
   ============================================================ */
(function () {
  'use strict';

  /* ================================================================
     1. Pomůcky
     ================================================================ */
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RAD = Math.PI / 180;
  const omez = (x, a, b) => Math.min(b, Math.max(a, x));
  const r1 = x => Math.round(x * 10) / 10;
  const bezPohybu = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Číslo s desetinnou čárkou a pravým minusem. */
  function cis(x, d = 1) {
    if (x === Infinity || x === -Infinity) return '∞';
    if (!isFinite(x)) return '–';
    const t = Math.abs(x).toFixed(d);
    return (x < 0 && Number(t) !== 0 ? '−' : '') + t.replace('.', ',');
  }
  /* Bez zbytečné ,0 (30 cm, ale 13,3 cm). */
  function cisK(x, d = 1) {
    const t = cis(x, d);
    return t.includes(',') ? t.replace(/,?0+$/, '') : t;
  }
  const sePlus = (x, d = 1) => (x > 0 && Number(Math.abs(x).toFixed(d)) !== 0 ? '+' : '') + cisK(x, d);
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, k) => [a[0] * k, a[1] * k],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1],
    len: a => Math.hypot(a[0], a[1]),
    norm: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
    rot: (a, u) => [a[0] * Math.cos(u) - a[1] * Math.sin(u), a[0] * Math.sin(u) + a[1] * Math.cos(u)],
  };

  function sv(tag, attrs, rodic) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) { const v = attrs[k]; if (v != null && v !== false) e.setAttribute(k, v); }
    if (rodic) rodic.appendChild(e);
    return e;
  }
  function txt(g, x, y, t, cls, extra) {
    const e = sv('text', Object.assign({ x: r1(x), y: r1(y), class: cls || '' }, extra || {}), g);
    e.textContent = t;
    return e;
  }
  const dCesta = (pts, uzavrit) => 'M' + pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + (uzavrit ? 'Z' : '');
  function cara(g, pts, cls, styl) {
    const e = sv('path', { d: dCesta(pts), class: 'cara ' + (cls || '') }, g);
    if (styl) e.setAttribute('style', styl);
    return e;
  }
  function mnohouhelnik(g, pts, cls, styl) {
    const e = sv('path', { d: dCesta(pts, true), class: cls || '' }, g);
    if (styl) e.setAttribute('style', styl);
    return e;
  }
  /* Trojúhelníková šipka ve směru u (jednotkový vektor). */
  function hrot(g, p, u, k, velikost = 1, cls) {
    const s = 6.5 * k * velikost, q = [-u[1], u[0]];
    const a = [p[0] + u[0] * s, p[1] + u[1] * s];
    const b = [p[0] - u[0] * s + q[0] * s * 0.72, p[1] - u[1] * s + q[1] * s * 0.72];
    const c = [p[0] - u[0] * s - q[0] * s * 0.72, p[1] - u[1] * s - q[1] * s * 0.72];
    return sv('path', { d: dCesta([a, b, c], true), class: 'hrot ' + (cls || '') }, g);
  }
  /* Oblouk úhlu mezi dvěma směry (úhly v radiánech, v souřadnicích SVG). */
  function obloukUhlu(g, c, r, u1, u2, cls) {
    let d = u2 - u1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const n = Math.max(4, Math.ceil(Math.abs(d) / (5 * RAD)));
    const pts = [];
    for (let i = 0; i <= n; i++) { const u = u1 + d * i / n; pts.push([c[0] + r * Math.cos(u), c[1] + r * Math.sin(u)]); }
    cara(g, pts, cls || 'tenka c-text');
    return u1 + d / 2;
  }
  /* Pseudonáhoda se semínkem – drsný povrch musí být při každém překreslení stejný. */
  function nahoda(seed) {
    let t = seed >>> 0;
    return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  }
  function zamichej(pole) {
    const a = [...pole];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const vyber = pole => pole[Math.floor(Math.random() * pole.length)];
  const bezpecne = f => { try { return !!f(); } catch { return false; } };
  const bezpecnyText = f => { try { return f(); } catch { return ''; } };

  /* ================================================================
     2. Model (obrázek s úchopy)
     ================================================================ */
  class Model {
    constructor(id, sirka, vyska) {
      this.fig = document.getElementById(id);
      this.svg = this.fig.querySelector('svg.model');
      this.W = sirka; this.H = vyska;
      this.svg.setAttribute('viewBox', `0 0 ${sirka} ${vyska}`);
      this.k = 1;
      this.defs = sv('defs', null, this.svg);
      this.staticka = sv('g', null, this.svg);
      this.vrstva = sv('g', null, this.svg);
      this.uchopy = sv('g', null, this.svg);
      this.odecty = this.fig.querySelector('.odecty');
      this.zprava = this.fig.querySelector('.obr-zprava');
      this.poslZprava = null;
      this.poslOdecet = null;
      this.viditelny = true;
      this.seznamUchopu = [];
      this.kresli = () => {};
      this._plan = false;
      const zmer = () => {
        const w = this.svg.getBoundingClientRect().width;
        if (!w) return;
        const k = this.W / w;
        if (Math.abs(k - this.k) < 1e-3 && this._zmereno) return;
        this._zmereno = true;
        this.k = k;
        this.svg.style.setProperty('--k', k.toFixed(4));
        this.naplanuj();
      };
      if ('ResizeObserver' in window) new ResizeObserver(zmer).observe(this.svg);
      requestAnimationFrame(zmer);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(z => {
          this.viditelny = z[z.length - 1].isIntersecting;
          if (this.priViditelnosti) this.priViditelnosti();
        }, { rootMargin: '150px' }).observe(this.svg);
      }
      Model.vsechny.push(this);
    }
    naplanuj() {
      if (this._plan) return;
      this._plan = true;
      requestAnimationFrame(() => { this._plan = false; this.vykresli(); });
    }
    vykresli() {
      this.vrstva.replaceChildren();
      this.kresli(this.vrstva);
      for (const u of this.seznamUchopu) u.aktualizuj();
      Ukoly.kontrola();
    }
    zpravu(html) {
      if (!this.zprava || html === this.poslZprava) return;
      this.poslZprava = html;
      this.zprava.innerHTML = html;
    }
    odecet(polozky) {
      if (!this.odecty) return;
      const h = polozky.filter(Boolean).map(([n, v]) => `<span>${n} <b>${v}</b></span>`).join('');
      if (h === this.poslOdecet) return;
      this.poslOdecet = h;
      this.odecty.innerHTML = h;
    }
    bod(e) {
      const m = this.svg.getScreenCTM();
      if (!m) return [0, 0];
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return [p.x, p.y];
    }
    /* Úchop: poloha() → [x, y] nebo null (skrytý), tahni([x, y]), klavesa(dx, dy), hodnota() → text pro odečítač. */
    uchop({ popis, poloha, tahni, klavesa, hodnota }) {
      const g = sv('g', { class: 'uchop vyzva', tabindex: '0', role: 'slider', 'aria-label': popis }, this.uchopy);
      sv('circle', { class: 'uchop-terc', r: 23 }, g);
      sv('circle', { class: 'uchop-puls', r: 10 }, g);
      sv('circle', { class: 'uchop-fokus', r: 15 }, g);
      sv('circle', { class: 'uchop-krouzek', r: 10 }, g);
      sv('circle', { class: 'uchop-stred', r: 3.2 }, g);
      const u = { g };
      u.aktualizuj = () => {
        const p = poloha();
        if (!p) { g.style.display = 'none'; return; }
        g.style.display = '';
        g.setAttribute('transform', `translate(${r1(p[0])} ${r1(p[1])}) scale(${this.k.toFixed(4)})`);
        if (hodnota) g.setAttribute('aria-valuetext', hodnota());
      };
      let tah = null;
      const konec = () => { if (!tah) return; tah = null; g.classList.remove('tazeny'); this.naplanuj(); };
      g.addEventListener('pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        try { g.focus({ preventScroll: true }); } catch { /* starší prohlížeč */ }
        const p = this.bod(e), q = poloha() || p;
        tah = [q[0] - p[0], q[1] - p[1]];   // úchop neposkočí pod prst
        try { g.setPointerCapture(e.pointerId); } catch { /* syntetická událost */ }
        g.classList.add('tazeny');
        this.bezVyzvy();
      });
      g.addEventListener('pointermove', e => {
        if (!tah) return;
        const p = this.bod(e);
        tahni([p[0] + tah[0], p[1] + tah[1]]);
        this.naplanuj();
      });
      g.addEventListener('pointerup', konec);
      g.addEventListener('pointercancel', konec);
      g.addEventListener('lostpointercapture', konec);
      g.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
      g.addEventListener('keydown', e => {
        const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (!m || !klavesa) return;
        e.preventDefault();
        this.bezVyzvy();
        const x = e.shiftKey ? 5 : 1;
        klavesa(m[0] * x, m[1] * x);
        this.naplanuj();
      });
      this.seznamUchopu.push(u);
      return u;
    }
    bezVyzvy() { this.uchopy.querySelectorAll('.vyzva').forEach(x => x.classList.remove('vyzva')); }
  }
  Model.vsechny = [];

  /* Ovládací prvky pod obrázkem */
  function segment(el, hodnota, zmena) {
    const tl = $$('button', el);
    const nastav = v => tl.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hodnota === String(v))));
    tl.forEach(b => b.addEventListener('click', () => { nastav(b.dataset.hodnota); zmena(b.dataset.hodnota); }));
    nastav(hodnota);
    return nastav;
  }
  function posuvnik(id, format, zmena) {
    const i = document.getElementById(id), o = document.getElementById(id + '-h');
    const obnov = () => { if (o) o.textContent = format(+i.value); };
    i.addEventListener('input', () => { obnov(); zmena(+i.value); });
    obnov();
    return { el: i, nastav(v) { i.value = v; obnov(); zmena(+i.value); } };
  }
  function prepinac(id, zmena) {
    const i = typeof id === 'string' ? document.getElementById(id) : id;
    i.addEventListener('change', () => zmena(i.checked));
    return i;
  }

  /* ================================================================
     3. Úkoly a předpovědi
     ================================================================ */
  const KLIC = 'metodus_zavity_lekce';
  const Postup = (() => {
    const data = { hotovo: {}, tipy: {}, reakce: {} };
    try {
      const d = JSON.parse(localStorage.getItem(KLIC) || 'null');
      if (d && typeof d === 'object') { Object.assign(data.hotovo, d.hotovo || {}); Object.assign(data.tipy, d.tipy || {}); Object.assign(data.reakce, d.reakce || {}); }
    } catch { /* bez úložiště začínáme vždy znovu */ }
    const uloz = () => { try { localStorage.setItem(KLIC, JSON.stringify(data)); } catch { /* bez paměti */ } };
    return {
      data, uloz,
      smaz() { for (const k in data) for (const x in data[k]) delete data[k][x]; uloz(); },
    };
  })();

  const Ukoly = {
    vse: [],
    definuj(id, splneno, reakce) {
      const el = document.querySelector(`[data-ukol="${id}"]`);
      if (!el) return;
      const u = { id, el, typ: 'ukol', kapitola: el.closest('.kapitola').id, splneno, reakce, hotovo: false };
      this.vse.push(u);
      if (Postup.data.hotovo[id]) this.oznac(u, false);
      else el.querySelector('.stav').textContent = 'čeká na splnění';
    },
    oznac(u, nove) {
      u.hotovo = true;
      u.el.classList.add('hotovo');
      u.el.querySelector('.stav').textContent = '✓ Splněno';
      const r = u.el.querySelector('.ukol-reakce');
      /* Reakce počítaná ze stavu modelu se uloží – po načtení už model ten stav nemá. */
      const text = typeof u.reakce === 'function' ? (nove ? bezpecnyText(u.reakce) : Postup.data.reakce[u.id] || '') : u.reakce;
      if (r && text) r.innerHTML = text;
      if (nove) { Postup.data.hotovo[u.id] = true; if (typeof u.reakce === 'function') Postup.data.reakce[u.id] = text; Postup.uloz(); Navigace.obnov(); }
    },
    kontrola() {
      for (const u of this.vse) {
        if (u.typ === 'ukol') { if (!u.hotovo && bezpecne(u.splneno)) this.oznac(u, true); }
        else u.kontrola();
      }
    },
  };

  /* Předpověď: 1 · předpověz (výběr) → 2 · vyzkoušej (model sám pozná splnění) → 3 · vysvětli. */
  function predpoved(id, cfg) {
    const el = document.querySelector(`[data-predpoved="${id}"]`);
    if (!el) return;
    el.innerHTML = `
      <div class="ukol-hlava"><h4>🤔 Předpověz, pak ověř</h4><span class="stav"></span></div>
      <div class="krok" data-krok="tip"><p class="krok-nazev">1 · Předpověz</p><p>${cfg.otazka}</p><div class="volby"></div></div>
      <div class="krok" data-krok="pokus"><p class="krok-nazev">2 · Vyzkoušej</p><p>${cfg.vyzkousej}</p></div>
      <div class="krok" data-krok="vysvetli"><p class="krok-nazev">3 · Vysvětli</p><div class="vysledek" aria-live="polite"></div></div>`;
    const volby = $('.volby', el);
    const tl = cfg.moznosti.map((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = t; b.dataset.i = i;
      b.addEventListener('click', () => zvol(i));
      volby.append(b);
      return b;
    });
    const nevim = document.createElement('button');
    nevim.type = 'button'; nevim.textContent = '🤷 Nevím – chci to rovnou vyzkoušet';
    nevim.addEventListener('click', () => zvol(-1));
    volby.append(nevim);
    const kroky = { tip: $('[data-krok="tip"]', el), pokus: $('[data-krok="pokus"]', el), vysvetli: $('[data-krok="vysvetli"]', el) };
    const p = { id, el, typ: 'predpoved', kapitola: el.closest('.kapitola').id, hotovo: false, stav: 'tip', tip: null };

    function kresli() {
      const poradi = ['tip', 'pokus', 'vysvetli'];
      const i = p.stav === 'hotovo' ? 3 : poradi.indexOf(p.stav);
      poradi.forEach((k, j) => { kroky[k].dataset.stav = j < i ? 'hotovy' : j === i ? 'aktivni' : 'ceka'; });
      [...tl, nevim].forEach(b => {
        b.disabled = p.stav !== 'tip';
        b.setAttribute('aria-pressed', String(p.tip != null && Number(b.dataset.i ?? -1) === p.tip && (b !== nevim || p.tip === -1)));
      });
      $('.stav', el).textContent = p.stav === 'hotovo' ? '✓ Hotovo' : p.stav === 'pokus' ? 'teď to vyzkoušej' : '';
      el.classList.toggle('hotovo', p.stav === 'hotovo');
      const vys = $('.vysledek', el);
      if (p.stav !== 'hotovo') { vys.innerHTML = '<p>Vysvětlení se ukáže, až to na modelu vyzkoušíš.</p>'; return; }
      let h = '';
      if (p.tip === cfg.spravna) h += '<p class="verdikt ok">✓ Tvoje předpověď se potvrdila.</p>';
      else if (p.tip >= 0) h += `<p class="verdikt chyba">✗ Model ukázal něco jiného než tvůj tip.</p>${cfg.proc && cfg.proc[p.tip] ? `<p>${cfg.proc[p.tip]}</p>` : ''}`;
      h += `<p><b>Správně:</b> ${cfg.moznosti[cfg.spravna]}</p><p>${cfg.vysvetleni}</p>`;
      vys.innerHTML = h;
    }
    function zvol(i) {
      if (p.stav !== 'tip') return;
      p.tip = i;
      Postup.data.tipy[id] = i;
      Postup.uloz();
      p.stav = 'pokus';
      if (cfg.priTipu) cfg.priTipu();
      kresli();
      p.kontrola();
    }
    p.kontrola = () => {
      if (p.stav !== 'pokus' || !bezpecne(cfg.splneno)) return;
      p.stav = 'hotovo'; p.hotovo = true;
      Postup.data.hotovo[id] = true;
      Postup.uloz();
      kresli();
      Navigace.obnov();
    };
    p.reset = () => { if (p.typ !== 'predpoved') return; p.stav = 'tip'; p.tip = null; p.hotovo = false; kresli(); };
    if (Postup.data.hotovo[id]) {
      p.stav = 'hotovo'; p.hotovo = true;
      p.tip = Number.isInteger(Postup.data.tipy[id]) ? Postup.data.tipy[id] : -1;
    }
    kresli();
    Ukoly.vse.push(p);
  }

  /* ================================================================
     4. Navigace
     ================================================================ */
  /* IKONY kapitol pro mapu lekce – doplní je oddíl 5 (kreslení strojů). */
  const IKONY = {};

  const Navigace = {
    kapitoly: [],
    init() {
      this.kapitoly = $$('.kapitola').map(k => ({
        id: k.id, el: k, nazev: k.dataset.nazev, popis: k.dataset.popis || '',
        cislo: $('.kap-cislo', k).textContent.trim(), zvlast: k.hasAttribute('data-zvlast'),
      }));
      const ol = $('#osnova'), cipy = $('#cipy'), mapa = $('#mapa');
      for (const k of this.kapitoly) {
        const li = document.createElement('li');
        if (k.zvlast) li.className = 'zvlast';
        li.innerHTML = `<a href="#${k.id}"><span class="c">${k.zvlast ? k.cislo : k.cislo}</span><span>${k.nazev}</span></a>`;
        ol.append(li);
        k.odkazOsnova = li;
        const a = document.createElement('a');
        a.href = '#' + k.id;
        a.textContent = (k.zvlast ? k.cislo + ' ' : k.cislo + ' · ') + k.nazev;
        cipy.append(a);
        k.odkazCip = a;
        if (!k.zvlast) {
          const m = document.createElement('a');
          m.href = '#' + k.id;
          m.innerHTML = `<svg viewBox="0 0 160 60" class="ikona" aria-hidden="true">${IKONY[k.id] || ''}</svg><span class="cislo">Kapitola ${k.cislo}</span><b>${k.nazev}</b><small>${k.popis}</small>`;
          mapa.append(m);
          k.odkazMapa = m;
        }
      }
      if ('IntersectionObserver' in window) {
        const viditelne = new Map();
        const io = new IntersectionObserver(zaznamy => {
          for (const z of zaznamy) viditelne.set(z.target.id, z.isIntersecting);
          const akt = this.kapitoly.find(k => viditelne.get(k.id));
          this.kapitoly.forEach(k => {
            const a = k === akt;
            $('a', k.odkazOsnova).setAttribute('aria-current', String(a));
            k.odkazCip.setAttribute('aria-current', String(a));
            if (a && k.odkazCip.parentElement.scrollWidth > k.odkazCip.parentElement.clientWidth) {
              const c = k.odkazCip, p = c.parentElement;
              p.scrollTo({ left: c.offsetLeft - p.clientWidth / 2 + c.clientWidth / 2, behavior: bezPohybu() ? 'auto' : 'smooth' });
            }
          });
        }, { rootMargin: '-30% 0px -65% 0px' });
        this.kapitoly.forEach(k => io.observe(k.el));
      }
      const znovu = $('#zacitZnovu');
      let potvrdit = 0;
      znovu.addEventListener('click', () => {
        if (Date.now() - potvrdit > 4000) {
          potvrdit = Date.now();
          znovu.textContent = 'Opravdu smazat postup? Klikni znovu';
          setTimeout(() => { if (Date.now() - potvrdit >= 4000) znovu.textContent = '↺ Začít lekci znovu'; }, 4100);
          return;
        }
        potvrdit = 0;
        Postup.smaz();
        for (const u of Ukoly.vse) {
          if (u.typ === 'ukol') {
            u.hotovo = false; u.el.classList.remove('hotovo');
            $('.stav', u.el).textContent = 'čeká na splnění';
            const r = $('.ukol-reakce', u.el); if (r) r.textContent = '';
          } else u.reset();
        }
        znovu.textContent = '↺ Začít lekci znovu';
        this.obnov();
        Model.vsechny.forEach(m => m.naplanuj());
        document.dispatchEvent(new CustomEvent('lekce:reset'));
      });
      this.obnov();
    },
    obnov() {
      let hotovo = 0, celkem = 0;
      for (const k of this.kapitoly) {
        const u = Ukoly.vse.filter(x => x.kapitola === k.id);
        const h = u.filter(x => x.hotovo).length;
        hotovo += h; celkem += u.length;
        const cela = u.length > 0 && h === u.length;
        k.odkazOsnova.classList.toggle('hotovo', cela);
        k.odkazCip.classList.toggle('hotovo', cela);
        if (k.odkazMapa) k.odkazMapa.classList.toggle('hotovo', cela);
      }
      const t = $('#pokrokText'), p = $('#pokrokPruh');
      if (t) t.textContent = `Splněno ${hotovo} z ${celkem} úkolů`;
      if (p) p.style.width = (celkem ? 100 * hotovo / celkem : 0) + '%';
    },
  };

  /* Odkaz na jinou lekci: v rozcestníku ji otevře rozcestník (jako kostra.js). */
  function odkazyNaLekce() {
    $$('a[data-lekce]').forEach(a => a.addEventListener('click', e => {
      if (window.self === window.top || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      try { window.parent.postMessage({ otevri: a.dataset.lekce }, location.protocol === 'file:' ? '*' : location.origin); }
      catch { location.href = a.href; }
    }));
  }
  /* ================================================================
     5. Kreslení (šipky sil, kóty, země, animace)
     ================================================================ */
  const G_ZEM = 10;   // N/kg – v celé lekci (a na celém webu) g = 10 N/kg
  const MODELY = {};

  /* Šipka síly z a do b (hrot v b). */
  function sipka(g, a, b, k, cls, o = {}) {
    const d = V.sub(b, a), l = V.len(d);
    if (l < 0.5) return;
    const u = V.mul(d, 1 / l), vel = o.vel || 1.3, s = 6.5 * k * vel;
    const telo = l > 2.2 * s ? V.sub(b, V.mul(u, 1.6 * s)) : a;
    cara(g, [a, telo], (o.silna === false ? '' : 'silna ') + cls);
    hrot(g, V.sub(b, V.mul(u, s)), u, k, vel, cls);
  }
  /* Kóta mezi a a b s popiskem (strana: +1 / −1 vůči směru a→b). */
  function kota(g, a, b, k, text, o = {}) {
    const cls = o.cls || 'c-rameno', tcls = o.tcls || 't-rameno';
    const d = V.norm(V.sub(b, a)), n = [-d[1], d[0]], t = 5 * k;
    if (V.len(V.sub(b, a)) < 1) return;
    cara(g, [a, b], 'tenka ' + cls);
    for (const p of [a, b]) cara(g, [V.add(p, V.mul(n, t)), V.sub(p, V.mul(n, t))], 'tenka ' + cls);
    if (text) {
      const m = V.mul(V.add(a, b), 0.5), st = o.strana || -1;
      const p = V.add(m, V.mul(n, st * 12 * k));
      txt(g, p[0], p[1] + 4.5 * k, text, 't-maly t-stred ' + tcls);
    }
  }
  /* Značka pravého úhlu v bodě p mezi směry u a v. */
  function pravyUhel(g, p, u, v, k) {
    const s = 9 * k;
    cara(g, [V.add(p, V.mul(u, s)), V.add(V.add(p, V.mul(u, s)), V.mul(v, s)), V.add(p, V.mul(v, s))], 'tenka c-rameno');
  }
  /* Podpěra (trojúhelník) s osou otáčení na vrcholu. */
  function podpera(g, p, k, vyska = 34, sirka = 20) {
    mnohouhelnik(g, [p, [p[0] - sirka, p[1] + vyska], [p[0] + sirka, p[1] + vyska]], 'podpera');
    osaBod(g, p, k);
  }
  function osaBod(g, p, k, r = 5) { sv('circle', { cx: r1(p[0]), cy: r1(p[1]), r: r1(r * k), class: 'osa-bod' }, g); }
  /* Země: čára a šrafy pod ní. */
  function zem(g, x1, x2, y, k) {
    cara(g, [[x1, y], [x2, y]], 'c-slaby');
    const d = [];
    for (let x = x1 + 6; x < x2; x += 14) d.push(`M${r1(x)} ${r1(y)}l${r1(-9 * k)} ${r1(9 * k)}`);
    sv('path', { d: d.join(''), class: 'zem' }, g);
  }
  /* Dítě sedící na prkně v bodě p (hmotnost mění velikost). */
  function sila(F, d = 1) { return cisK(F, d) + ' N'; }
  function metry(x, d = 2) { return cisK(x, d) + ' m'; }
  function cm(x, d = 1) { return cisK(x, d) + ' cm'; }

  /* Jednoduchá animace modelu: krok(dt) vrací true, dokud má běžet. */
  function animace(m, krok) {
    let posl = null, bezi = false;
    const tik = t => {
      const dt = posl == null ? 0.016 : Math.min(0.05, (t - posl) / 1000);
      posl = t;
      const dal = krok(dt);
      m.vykresli();
      if (dal) requestAnimationFrame(tik); else { bezi = false; posl = null; }
    };
    return () => { if (!bezi) { bezi = true; posl = null; requestAnimationFrame(tik); } };
  }
  /* Plynulé přiblížení úhlu k cíli (°/s); vrací true, pokud ještě není u cíle. */
  function kCili(s, klic, cil, dt, rychlost = 38) {
    if (bezPohybu()) { s[klic] = cil; return false; }
    const d = cil - s[klic], krok = rychlost * dt;
    if (Math.abs(d) <= krok) { s[klic] = cil; return false; }
    s[klic] += Math.sign(d) * krok;
    return true;
  }
  const obalUhlu = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

  const mm = (x, d = 2) => cisK(x, d) + ' mm';
  const stup = x => cisK(x, 1) + '°';
  const proc = x => Math.round(x * 100) + ' %';
  const zlom = v => v - Math.floor(v);
  const r2 = x => Math.round(x * 100) / 100;
  /* Barvy chodů (a otáček) šroubovice – stejné v celé lekci. */
  const CHODY = ['c-chod1', 'c-chod2', 'c-chod3', 'c-chod4'];

  /* Svislá kóta s popiskem vedle (vpravo nebo vlevo). */
  function kotaSvisla(g, x, y1, y2, k, text, o = {}) {
    const cls = o.cls || 'c-draha', tcls = o.tcls || 't-draha', t = 5 * k;
    if (Math.abs(y2 - y1) < 1) return;
    cara(g, [[x, y1], [x, y2]], 'tenka ' + cls);
    cara(g, [[x - t, y1], [x + t, y1]], 'tenka ' + cls);
    cara(g, [[x - t, y2], [x + t, y2]], 'tenka ' + cls);
    if (text) txt(g, x + (o.vlevo ? -8 : 8) * k, (y1 + y2) / 2 + 4 * k, text, 't-maly ' + tcls + (o.vlevo ? ' t-konec' : ''));
  }

  /* ---------- ikony kapitol v mapě lekce ---------- */
  Object.assign(IKONY, {
    navin: '<path d="M8 54 L78 54 L78 18Z" class="papir"/><path d="M8 54 L31 42 M31 42 L55 30 M55 30 L78 18" class="cara silna"/><path d="M8 54 L31 42" class="cara silna c-chod1"/><path d="M31 42 L55 30" class="cara silna c-chod2"/><path d="M55 30 L78 18" class="cara silna c-chod3"/><rect x="112" y="10" width="20" height="46" class="drevo"/><path d="M112 50 L132 44 M112 38 L132 32 M112 26 L132 20" class="cara silna c-chod1"/>',
    popis: '<rect x="10" y="22" width="16" height="22" class="kov"/><path d="M26 24 L32 18 L38 24 L44 18 L50 24 L56 18 L62 24 L68 18 L74 24 L80 18 L86 24 L92 18 L98 24 L104 18 L110 24 L116 18 L122 24 L128 18 L134 24 L134 42 L128 48 L122 42 L116 48 L110 42 L104 48 L98 42 L92 48 L86 42 L80 48 L74 42 L68 48 L62 42 L56 48 L50 42 L44 48 L38 42 L32 48 L26 42Z" class="kov"/><path d="M32 18 L38 48 M44 18 L50 48 M56 18 L62 48 M68 18 L74 48" class="cara tenka c-chod1"/><rect x="92" y="10" width="22" height="46" class="kov-tmavy"/>',
    urci: '<rect x="8" y="22" width="14" height="22" class="kov"/><rect x="22" y="26" width="84" height="14" class="kov"/><path d="M30 26 L36 40 M42 26 L48 40 M54 26 L60 40 M66 26 L72 40 M78 26 L84 40 M90 26 L96 40" class="cara tenka c-slaby"/><path d="M28 24 L34 16 L40 24 L46 16 L52 24 L58 16 L64 24 V8 H28Z" class="merka"/><rect x="128" y="4" width="10" height="54" class="kov-svetly"/><rect x="92" y="18" width="46" height="6" class="kov-tmavy"/><rect x="92" y="42" width="46" height="6" class="kov-tmavy"/>',
    utah: '<circle cx="28" cy="32" r="16" class="kov"/><path d="M18 26 L28 20 L38 26 V38 L28 44 L18 38Z" class="kov-tmavy"/><rect x="40" y="27" width="70" height="10" rx="4" class="kov"/><path d="M100 40 V58" class="cara silna c-sila"/><rect x="120" y="44" width="36" height="8" class="zona-ok"/><rect x="120" y="44" width="14" height="8" class="zona-malo"/><rect x="146" y="44" width="10" height="8" class="zona-prask"/>',
    sila: '<path d="M30 58 L58 58 L50 36 L38 36Z" class="kov"/><rect x="40" y="14" width="8" height="24" class="kov"/><rect x="24" y="4" width="40" height="10" class="bremeno-vypln"/><ellipse cx="44" cy="26" rx="34" ry="9" fill="none" class="cara tenka carkovana c-sila"/><path d="M96 56 L156 56 L156 40Z" class="rampa"/><rect x="118" y="38" width="14" height="9" class="kov" transform="rotate(-15 125 43)"/>',
    samosvornost: '<path d="M10 56 L120 56 L120 22Z" class="rampa"/><rect x="72" y="28" width="22" height="13" class="kov" transform="rotate(-17 83 35)"/><path d="M70 50 L46 57" class="cara silna c-treni"/><path d="M138 10 V50" class="cara tenka c-text"/><text x="146" y="36" font-size="18" fill="currentColor">?</text>',
    mikrometr: '<path d="M10 20 H22 V44 H70 V20 H84 V56 H10Z" class="kov-tmavy"/><rect x="84" y="24" width="38" height="12" class="kov"/><rect x="104" y="18" width="40" height="24" rx="2" class="kov"/><path d="M22 30 H40" class="cara silna c-text"/>',
    hriste: '<rect x="20" y="8" width="76" height="9" class="kov"/><rect x="24" y="17" width="6" height="40" class="kov"/><rect x="86" y="17" width="6" height="40" class="kov"/><rect x="55" y="4" width="6" height="40" class="kov"/><rect x="42" y="44" width="32" height="5" class="kov-tmavy"/><rect x="40" y="50" width="36" height="8" class="bremeno-vypln"/><ellipse cx="58" cy="6" rx="26" ry="5" fill="none" class="cara tenka c-sila"/><text x="112" y="40" font-size="22">🛠️</text>',
    kolem: '<rect x="12" y="34" width="56" height="20" class="drevo"/><rect x="34" y="8" width="12" height="5" class="kov"/><path d="M37 13 h6 v20 l-3 8 l-3 -8z" class="kov"/><path d="M88 54 V30 Q88 22 98 20 H110 Q120 22 120 30 V54Z" class="sklo"/><rect x="94" y="8" width="20" height="13" rx="2" class="vicko"/><circle cx="144" cy="30" r="12" class="vicko"/>',
  });

  /* ================================================================
     6. Modely kapitol
     ================================================================ */

  /* ---------- 1 · Závit je navinutá nakloněná rovina ---------- */
  function modelNavin() {
    const m = new Model('obr-navin', 840, 400);
    const SK = 15, SK2 = 30, D = 2, OBV = Math.PI * D, N = 3;     // trojúhelník 15 px/cm, tužka 2× větší
    const X0 = 40, Y0 = 340, C = OBV * SK, L = N * C;
    const CX = 650, YB = 366, R = D / 2 * SK2, E = 10;
    const s = { P: 1.5, w: 0.3, P0: null };
    MODELY.navin = { m, s };
    const alfa = () => Math.atan(s.P / OBV) / RAD;

    m.kresli = gg => {
      const k = m.k, H = N * s.P * SK, xw = X0 + s.w * L;
      const vy = x => Y0 - (x - X0) / L * H;
      // papírový trojúhelník: navinutá část je jen bledá stopa
      if (s.w > 0) mnohouhelnik(gg, [[X0, Y0], [xw, Y0], [xw, vy(xw)]], 'papir navinuto');
      if (s.w < 1) mnohouhelnik(gg, [[xw, Y0], [X0 + L, Y0], [X0 + L, Y0 - H], [xw, vy(xw)]], 'papir');
      for (let i = 0; i < N; i++) {
        const xa = X0 + i * C, xb = xa + C;
        if (xw > xa) cara(gg, [[xa, vy(xa)], [Math.min(xb, xw), vy(Math.min(xb, xw))]], 'silna navinuto ' + CHODY[i]);
        if (xw < xb) cara(gg, [[Math.max(xa, xw), vy(Math.max(xa, xw))], [xb, vy(xb)]], 'silna ' + CHODY[i]);
        if (i > 0) cara(gg, [[xa, Y0], [xa, vy(xa)]], 'tenka carkovana c-slaby');
        txt(gg, (xa + xb) / 2, Y0 + 18, (i + 1) + '. otáčka', 't-maly t-stred');
      }
      kota(gg, [X0, Y0 + 34], [X0 + C, Y0 + 34], k, 'obvod tužky π · d', { cls: 'c-draha', tcls: 't-draha', strana: 1 });
      kotaSvisla(gg, X0 + L + 14, Y0 - (N - 1) * s.P * SK, Y0 - H, k, 'P', { cls: 'c-rameno', tcls: 't-rameno' });
      const mid = obloukUhlu(gg, [X0, Y0], 52, 0, Math.atan2(-H, L), 'tenka c-text');
      txt(gg, X0 + 66 * Math.cos(mid), Y0 + 66 * Math.sin(mid) + 4, 'α', 't-silny t-stred');
      // kurzor – kam až je papír navinutý
      cara(gg, [[xw, Y0], [xw, vy(xw)]], 'tenka c-osa');
      txt(gg, X0, 40, 'Papírový pravoúhlý trojúhelník', 't-silny');
      txt(gg, X0, 58, 'přepona = nakloněná rovina', 't-maly');

      // tužka (nakreslená 2× větší)
      const YT = YB - N * 2.5 * SK2 - 18;
      sv('ellipse', { cx: CX, cy: YB, rx: R, ry: E, class: 'drevo' }, gg);
      sv('rect', { x: CX - R, y: YT, width: 2 * R, height: YB - YT, class: 'drevo' }, gg);
      mnohouhelnik(gg, [[CX - R, YT], [CX + R, YT], [CX + 6, YT - 40], [CX - 6, YT - 40]], 'tuzka-orez');
      mnohouhelnik(gg, [[CX - 6, YT - 40], [CX + 6, YT - 40], [CX, YT - 54]], 'kov-tmavy');
      cara(gg, [[CX - R * 0.35, YT], [CX - R * 0.35, YB + E * 0.94]], 'tenka c-slaby');
      cara(gg, [[CX + R * 0.35, YT], [CX + R * 0.35, YB + E * 0.94]], 'tenka c-slaby');
      // šroubovice: přední část plně, zadní čárkovaně
      const tMax = s.w * N * 2 * Math.PI, y0 = YB - 8, krok = 4 * RAD;
      const bod = t => [CX + R * Math.sin(t), y0 - t / (2 * Math.PI) * s.P * SK2 + E * Math.cos(t)];
      const useky = [];
      let akt = null;
      for (let t = 0; t <= tMax + 1e-9; t += krok) {
        const tt = Math.min(t, tMax), predni = Math.cos(tt) >= 0, i = Math.min(N - 1, Math.floor(tt / (2 * Math.PI) + 1e-9));
        const klic = predni + '|' + i;
        if (!akt || akt.klic !== klic) { const p0 = akt ? akt.body[akt.body.length - 1] : null; akt = { klic, predni, i, body: p0 ? [p0] : [] }; useky.push(akt); }
        akt.body.push(bod(tt));
        if (tt === tMax) break;
      }
      if (tMax > 0) { const kon = bod(tMax); if (akt) akt.body.push(kon); }
      for (const u of useky) if (!u.predni && u.body.length > 1) cara(gg, u.body, 'tenka carkovana zadni ' + CHODY[u.i]);
      for (const u of useky) if (u.predni && u.body.length > 1) cara(gg, u.body, 'silna ' + CHODY[u.i]);
      if (tMax > 0) { const kon = bod(tMax); sv('circle', { cx: r1(kon[0]), cy: r1(kon[1]), r: r1(4.5 * k), class: 'osa-bod' }, gg); }
      txt(gg, CX, 40, 'Tužka (2× zvětšená)', 't-silny t-stred');
      txt(gg, CX, 58, 'přepona se navine do šroubovice', 't-maly t-stred');

      m.odecet([
        ['obvod tužky', 'π · d = ' + cm(OBV, 2)], ['stoupání', 'P = ' + cm(s.P, 2)],
        ['úhel stoupání', 'α = ' + stup(alfa())], ['navinuto', cisK(s.w * N, 1) + ' z 3 otáček'],
      ]);
      if (s.w >= 0.999) m.zpravu('<span class="ok">✓ Celý trojúhelník je na tužce.</span> Z přepony – nakloněné roviny – se stala <b>šroubovice</b>. Každý úsek dlouhý jako obvod tužky dal jeden závit a vystoupal o <b>P = ' + cm(s.P, 2) + '</b>.');
      else m.zpravu('Táhni kroužek doprava a sleduj, jak se přepona navíjí na tužku. Barva ukazuje, který kus přepony se stane kterým závitem.');
    };
    m.uchop({ popis: 'Navíjení – táhni doprava', poloha: () => [X0 + s.w * L, Y0],
      tahni: p => { s.w = omez((p[0] - X0) / L, 0, 1); if (s.w > 0.985) s.w = 1; },
      klavesa: (dx, dy) => { s.w = omez(r2(s.w + (dx || -dy) * 0.02), 0, 1); }, hodnota: () => cisK(s.w * N, 1) + ' otáčky navinuto' });
    posuvnik('nav-P', v => cm(v, 2), v => { s.P = v; m.naplanuj(); });
    $('#nav-odvin').addEventListener('click', () => { s.w = 0; m.naplanuj(); });

    Ukoly.definuj('nav-cely', () => s.w >= 0.999,
      'Každý kus přepony dlouhý jako obvod tužky se stal jedním závitem. <b>Závit je nakloněná rovina navinutá na válec.</b>');
    predpoved('nav-hustota', {
      otazka: 'Vystřihneš <b>vyšší</b> trojúhelník (větší stoupání <i>P</i>), tužka zůstane stejná. Jak budou vypadat závity na tužce?',
      moznosti: ['Budou strmější a dál od sebe', 'Budou hustší', 'Nezmění se – otáčky jsou pořád tři'],
      spravna: 0,
      proc: [null, 'Vyšší trojúhelník znamená, že každá otáčka vystoupá výš – závity se od sebe vzdálí.', 'Počet otáček je stejný, ale každá vystoupá výš: šroubovice je strmější a závity řidší.'],
      priTipu: () => { s.P0 = s.P; },
      vyzkousej: 'Naviň celý trojúhelník a pak posuvníkem změň stoupání aspoň o <b>0,5 cm</b>. Sleduj tužku.',
      splneno: () => s.P0 != null && Math.abs(s.P - s.P0) >= 0.5 - 1e-9 && s.w >= 0.999,
      vysvetleni: 'Stoupání <i>P</i> je výška, o kterou šroubovice vystoupá za jednu otáčku. Větší <i>P</i> = strmější nakloněná rovina = větší úhel stoupání α.',
    });
    Ukoly.definuj('nav-mirny', () => alfa() < 10 && s.w >= 0.999,
      () => `Úhel stoupání je ${stup(alfa())}. Skutečné šrouby jsou ještě mírnější – asi 2 až 4°. Čím mírnější nakloněná rovina, tím menší síla stačí, ale tím víc otáček je potřeba.`);
  }

  /* ---------- 2 · Popis závitu ---------- */
  const PROFILY = {
    M:  { nazev: 'metrický', uhel: '60°', h: 0.541, a: 0.0625, b: 0.125 },   // a, b = půl vrcholové a patní plošky (v roztečích)
    Tr: { nazev: 'lichoběžníkový', uhel: '30°', h: 0.5, a: 0.183, b: 0.183 },
    Rd: { nazev: 'oblý', uhel: '30°', h: 0.42, obly: true },
    Sq: { nazev: 'plochý', uhel: '0°', h: 0.5, a: 0.245, b: 0.245 },
  };
  /* Výška profilu (0 = pata, 1 = vrchol) ve vzdálenosti u od vrcholu (v roztečích, 0…0,5). */
  function profilVyska(pr, u) {
    if (pr.obly) return 0.5 + 0.5 * Math.cos(2 * Math.PI * u);
    if (u <= pr.a) return 1;
    if (u >= 0.5 - pr.b) return 0;
    return 1 - (u - pr.a) / (0.5 - pr.b - pr.a);
  }
  function znackaZavitu(pr, d, P, n, levy) {
    const Ph = n * P, lh = levy ? ' LH' : '';
    if (pr === 'M') return (n === 1 ? `M${d}×${cisK(P, 2)}` : `M${d}×Ph${cisK(Ph, 2)}P${cisK(P, 2)}`) + lh;
    if (pr === 'Tr') return (n === 1 ? `Tr${d}×${cisK(P, 2)}` : `Tr${d}×${cisK(Ph, 2)}(P${cisK(P, 2)})`) + lh;
    if (pr === 'Rd') return 'oblý – třeba E27 u žárovky' + lh;
    return 'plochý – dnes vzácný' + lh;
  }

  function modelProfil() {
    const m = new Model('obr-profil', 840, 390);
    const AX = 200, XH = 100, XE = 760, SK = 7, D = 20, R = D / 2 * SK, XN0 = 600, WN = 64;
    const XNMIN = -66, XNMAX = 19;
    const s = { pr: 'M', P: 2.5, n: 1, levy: false, xn: 0, ang: 0, bezi: false, id: 0, posledni: null, tipId: 0, hlaska: '' };
    MODELY.profil = { m, s };
    const Ph = () => s.n * s.P;

    m.kresli = gg => {
      const k = m.k, pr = PROFILY[s.pr], Ppx = s.P * SK, Lpx = Ph() * SK, hpx = pr.h * Ppx, rIn = R - hpx;
      const xF = XH + 8;          // fáze: vrchol závitu
      // hlava šroubu
      sv('rect', { x: 40, y: AX - 84, width: XH - 40, height: 168, rx: 4, class: 'kov' }, gg);
      cara(gg, [[40, AX - 42], [XH, AX - 42]], 'tenka c-slaby');
      cara(gg, [[40, AX + 42], [XH, AX + 42]], 'tenka c-slaby');
      // obrys dříku se závitem
      const horni = [], dolni = [];
      for (let x = XH; x <= XE; x += 1.5) {
        const u1 = zlom((x - xF) / Ppx), u2 = zlom((x - xF - Lpx / 2) / Ppx);
        horni.push([x, AX - rIn - hpx * profilVyska(pr, Math.min(u1, 1 - u1))]);
        dolni.push([x, AX + rIn + hpx * profilVyska(pr, Math.min(u2, 1 - u2))]);
      }
      mnohouhelnik(gg, [...horni, [XE + 4, AX - rIn + 4], [XE + 4, AX + rIn - 4], ...dolni.reverse()], 'kov');
      cara(gg, [[XH, AX - rIn], [XE, AX - rIn]], 'tenka carkovana c-slaby');
      cara(gg, [[XH, AX + rIn], [XE, AX + rIn]], 'tenka carkovana c-slaby');
      // vrcholy závitu na přední straně (pravý závit „\“, levý „/“)
      const smer = s.levy ? -1 : 1;
      const j0 = Math.floor((XH - xF) / Ppx) - s.n - 2, j1 = Math.ceil((XE - xF) / Ppx) + s.n + 2;
      for (let j = j0; j <= j1; j++) {
        const xt = xF + j * Ppx, xb = xt + smer * Lpx / 2;
        if (Math.min(xt, xb) < XH + 2 || Math.max(xt, xb) > XE - 2) continue;
        cara(gg, [[xt, AX - R], [xb, AX + R]], (s.n > 1 ? 'silna ' : '') + CHODY[((j % s.n) + s.n) % s.n]);
      }
      // kóty rozteče a stoupání (u levého kraje matice nepřekáží)
      const ja = Math.ceil((200 - xF) / Ppx), xa = xF + ja * Ppx;
      for (let i = 0; i <= s.n; i++) cara(gg, [[xa + i * Ppx, AX - R - 4], [xa + i * Ppx, AX - R - (i === 0 || i === s.n ? 52 : 22)]], 'tenka c-slaby');
      kota(gg, [xa, AX - R - 18], [xa + Ppx, AX - R - 18], k, s.n > 1 ? 'P' : 'P = Pₕ', { cls: 'c-rameno', tcls: 't-rameno', strana: -1 });
      if (s.n > 1) kota(gg, [xa, AX - R - 48], [xa + Lpx, AX - R - 48], k, 'stoupání Pₕ = ' + s.n + ' · P', { cls: 'c-draha', tcls: 't-draha', strana: -1 });
      kotaSvisla(gg, XE + 26, AX - R, AX + R, k, 'd', { cls: 'c-text', tcls: 't-silny' });
      kotaSvisla(gg, XE + 52, AX - rIn, AX + rIn, k, 'd₁', { cls: 'c-text', tcls: 't-silny' });

      // matice (šestihran z boku, otáčí se)
      const XN = XN0 + s.xn * SK, RN = R + 30;
      const ys = [];
      for (let i = 0; i < 6; i++) { const a = s.ang + i * Math.PI / 3; ys.push({ y: AX - RN * Math.cos(a), vpredu: Math.sin(a) > 0.02 }); }
      const yMin = Math.min(...ys.map(v => v.y)), yMax = Math.max(...ys.map(v => v.y));
      sv('rect', { x: r1(XN - WN / 2), y: r1(yMin), width: WN, height: r1(yMax - yMin), rx: 3, class: 'matice' }, gg);
      for (const v of ys) if (v.vpredu && v.y > yMin + 2 && v.y < yMax - 2) cara(gg, [[XN - WN / 2, v.y], [XN + WN / 2, v.y]], 'tenka c-slaby');
      txt(gg, XN, yMax + 18, 'matice', 't-maly t-stred');
      if (s.posledni) {
        const p = s.posledni;
        txt(gg, XN, yMin - 12, p.smer === 'cw' ? '↻' : '↺', 't-velky t-stred');
      }
      txt(gg, 44, 40, 'Šroub M20 z boku', 't-silny');

      m.odecet([
        ['značka', znackaZavitu(s.pr, D, s.P, s.n, s.levy)], ['profil', `${pr.nazev} (${pr.uhel})`],
        ['rozteč', 'P = ' + mm(s.P, 1)], ['chody', String(s.n)], ['stoupání', `Pₕ = ${s.n} · P = ${mm(Ph(), 1)}`],
        ['malý průměr', 'd₁ ≈ ' + mm(D - 2 * pr.h * s.P, 1)], ['smysl', s.levy ? 'levý (LH)' : 'pravý'],
      ]);
      if (s.hlaska) m.zpravu(s.hlaska);
      else m.zpravu('Otoč maticí tlačítky pod obrázkem. Díváš se na ni od volného konce šroubu (zprava).');
    };

    const dokonci = (smer, podil, posun) => {
      s.id++;
      s.posledni = { id: s.id, smer, levy: s.levy, n: s.n, P: s.P, posun, cela: podil >= 0.999 };
      const kam = posun < 0 ? 'k hlavě – <b>utahuje se</b>' : 'od hlavy – <b>povoluje se</b>';
      let h = `Matice se ${podil >= 0.999 ? 'za jednu otáčku' : 'za ' + cisK(podil, 2) + ' otáčky'} posunula o <b>${mm(Math.abs(posun), 1)}</b> ${kam}.`;
      if (podil < 0.999) h += posun < 0 ? ' Dál nejde, dosedla na hlavu šroubu.' : ' Dál nejde, sjela by z konce šroubu.';
      else if (s.n > 1) h += ` To je stoupání Pₕ = ${s.n} · ${mm(s.P, 1)}.`;
      s.hlaska = h;
      Navigace.obnov();
    };
    let anim = null;
    const otoc = smer => {
      if (s.bezi) return;
      const zaOtacku = (smer === 'cw' ? -1 : 1) * (s.levy ? -1 : 1) * Ph();   // mm, záporně = k hlavě
      const cil = omez(s.xn + zaOtacku, XNMIN, XNMAX), podil = Math.abs(cil - s.xn) / Ph();
      if (podil < 0.01) { s.hlaska = zaOtacku < 0 ? '<span class="pozor">Matice už sedí na hlavě šroubu.</span> Otoč opačně.' : '<span class="pozor">Matice je na konci šroubu.</span> Otoč opačně.'; m.naplanuj(); return; }
      const x0 = s.xn, a0 = s.ang, dA = (smer === 'cw' ? -1 : 1) * 2 * Math.PI * podil;
      let t = 0;
      s.bezi = true; s.hlaska = '';
      const krok = dt => {
        t = bezPohybu() ? 1 : Math.min(1, t + dt / (0.9 + 0.5 * podil));
        s.xn = x0 + (cil - x0) * t; s.ang = a0 + dA * t;
        if (t >= 1) { s.bezi = false; dokonci(smer, podil, cil - x0); return false; }
        return true;
      };
      anim = animace(m, krok);
      anim();
    };
    segment($('#pr-profil'), s.pr, v => { s.pr = v; s.hlaska = ''; m.naplanuj(); });
    segment($('#pr-n'), s.n, v => { s.n = +v; s.hlaska = ''; m.naplanuj(); });
    posuvnik('pr-P', v => mm(v, 1), v => { s.P = v; s.hlaska = ''; m.naplanuj(); });
    prepinac('pr-levy', v => { s.levy = v; s.hlaska = ''; m.naplanuj(); });
    $('#pr-cw').addEventListener('click', () => otoc('cw'));
    $('#pr-ccw').addEventListener('click', () => otoc('ccw'));
    $('#pr-vychozi').addEventListener('click', () => { if (!s.bezi) { s.xn = 0; s.ang = 0; s.posledni = null; s.hlaska = ''; m.naplanuj(); } });

    Ukoly.definuj('pop-tr', () => s.pr === 'Tr' && s.P === 3 && s.n === 2 && !s.levy,
      '<b>Tr</b> = lichoběžníkový profil, <b>20</b> = velký průměr v mm, <b>6</b> = stoupání Pₕ, <b>(P3)</b> = rozteč. Stoupání je dvojnásobek rozteče – závit je dvouchodý.');
    Ukoly.definuj('pop-2chod', () => s.posledni && s.posledni.n === 2 && s.posledni.cela,
      () => `Za jednu otáčku se matice posunula o ${mm(Math.abs(s.posledni.posun), 1)} – o dvě rozteče. Dvouchodý závit posouvá dvakrát rychleji než jednochodý se stejnou roztečí, ale potřebuje větší sílu.`);
    predpoved('pop-levy', {
      otazka: 'Na šroubu s <b>levým závitem</b> otočíš maticí <b>po směru hodinových ručiček</b> – tak, jak se běžná matice utahuje. Co se stane?',
      moznosti: ['Matice se posune od hlavy – povolí se', 'Matice se utáhne jako obvykle', 'Matice se nepohne, levý závit se otáčí jen jedním směrem'],
      spravna: 0,
      proc: [null, 'Levý závit je stočený obráceně, a tak se i utahuje obráceně – proti směru hodinových ručiček.', 'Levým závitem se dá otáčet oběma směry, jen je utahování a povolování prohozené.'],
      priTipu: () => { s.tipId = s.id; },
      vyzkousej: 'Zaškrtni <b>levý závit</b> a otoč maticí <b>↻ po směru hodinových ručiček</b>.',
      splneno: () => s.posledni && s.posledni.id > s.tipId && s.posledni.levy && s.posledni.smer === 'cw',
      vysvetleni: 'Šroubovice levého závitu je zrcadlová. Utahuje se proti směru hodinových ručiček. Používá se tam, kde by se pravý závit sám povoloval – na levém pedálu jízdního kola nebo na lahvích s hořlavým plynem (aby se nedaly zaměnit).',
    });
  }

  /* ---------- 3 · Urči neznámý šroub (posuvné měřítko a závitová měrka) ---------- */
  /* Metrické závity s hrubou roztečí (ISO): značka, průměr, rozteč. */
  const ZAVITY_M = [['M4', 4, 0.7], ['M5', 5, 0.8], ['M6', 6, 1], ['M8', 8, 1.25], ['M10', 10, 1.5], ['M12', 12, 1.75], ['M16', 16, 2], ['M20', 20, 2.5]];
  const LISTKY = [0.7, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5];
  /* Skutečný šroub je o kousek tenčí než jmenovitý průměr (vůle pro matici). */
  const skutecnyPrumer = d => r2(d - 0.02 * d - 0.06);

  function modelUrci() {
    const m = new Model('obr-urci', 840, 400);
    const AX = 236, XH = 90, XE = 560, YLD = 352;
    const s = { i: 4, yJ: 60, list: null, urceno: 0, zmereno: false, merkaOk: false, hlaska: '', odpoved: null };
    MODELY.urci = { m, s };
    const sroub = () => { const [z, d, P] = ZAVITY_M[s.i]; return { z, d, P, SK: Math.min(16, 150 / d) }; };
    const R = () => { const b = sroub(); return skutecnyPrumer(b.d) / 2 * b.SK; };
    const yStop = () => AX - R();                                  // horní čelist dosedne na šroub
    const yMin = () => Math.max(24, AX + R() - 32 * sroub().SK);   // měřítko měří nejvýš 32 mm
    const mereni = () => (AX + R() - s.yJ) / sroub().SK;
    const novy = () => {
      let i;
      do i = Math.floor(Math.random() * ZAVITY_M.length); while (i === s.i);
      Object.assign(s, { i, yJ: yMin(), list: null, zmereno: false, odpoved: null, hlaska: '' });
      s.yJ = yMin();
      nastavList(null); obnovVolby();
      m.naplanuj();
    };

    m.kresli = gg => {
      const k = m.k, b = sroub(), pr = PROFILY.M, Ppx = b.P * b.SK, hpx = pr.h * Ppx, Rr = R(), rIn = Rr - hpx, xF = XH + 6;
      txt(gg, 24, 30, 'Neznámý šroub – změř ho', 't-silny');
      // hlava a dřík se závitem
      sv('rect', { x: XH - 46, y: r1(AX - Rr * 1.6), width: 46, height: r1(Rr * 3.2), rx: 4, class: 'kov' }, gg);
      const horni = [], dolni = [];
      for (let x = XH; x <= XE; x += 1) {
        const u1 = zlom((x - xF) / Ppx), u2 = zlom((x - xF - Ppx / 2) / Ppx);
        horni.push([x, AX - rIn - hpx * profilVyska(pr, Math.min(u1, 1 - u1))]);
        dolni.push([x, AX + rIn + hpx * profilVyska(pr, Math.min(u2, 1 - u2))]);
      }
      mnohouhelnik(gg, [...horni, [XE + 3, AX - rIn + 3], [XE + 3, AX + rIn - 3], ...dolni.reverse()], 'kov');
      for (let j = 0; xF + j * Ppx + Ppx / 2 < XE - 2; j++) {
        const xt = xF + j * Ppx;
        if (xt > XH + 1) cara(gg, [[xt, AX - Rr], [xt + Ppx / 2, AX + Rr]], 'tenka c-slaby');
      }
      // závitová měrka: hřebínek s roztečí lístku
      if (s.list) {
        const Lpx = s.list * b.SK, hc = pr.h * Lpx, sedi = Math.abs(s.list - b.P) < 1e-9;
        const xa = 130, xb = 330, x0 = xF + (Math.ceil((xa - xF) / Ppx - 0.5) + 0.5) * Ppx;
        const zdvih = sedi ? 0 : hpx * 0.7;
        const yApex = AX - rIn - zdvih, yZub = yApex - hc, yHor = yZub - 26;
        const body = [[xa - 10, yHor], [xb + 10, yHor], [xb + 10, yZub]];
        for (let x = x0 + Math.floor((xb - x0) / Lpx) * Lpx; x >= xa; x -= Lpx) body.push([x + Lpx / 2, yZub], [x, yApex], [x - Lpx / 2, yZub]);
        body.push([xa - 10, yZub]);
        mnohouhelnik(gg, body.map(p => [omez(p[0], xa - 10, xb + 10), p[1]]), 'merka');
        txt(gg, (xa + xb) / 2, yHor + 17, cisK(s.list, 2), 't-maly t-stred t-nasvetle');
        txt(gg, (xa + xb) / 2, yHor - 8, sedi ? '✓ lístek sedí bez mezer' : 'mezi zuby prosvítá – nesedí', 't-maly t-stred ' + (sedi ? 't-ok' : 't-treni'));
      }
      // posuvné měřítko: pevná čelist dole, posuvná nahoře, svislé pravítko vpravo
      const XB = 610, xj = 400;
      sv('rect', { x: XB, y: 14, width: 30, height: YLD + 30 - 14, rx: 3, class: 'kov-svetly' }, gg);
      for (let mmx = 0; mmx <= 32; mmx++) {
        const y = AX + Rr - mmx * b.SK;
        if (y < 18) break;
        cara(gg, [[XB, y], [XB + (mmx % 5 ? 7 : 13), y]], 'tenka c-text');
        if (mmx % 5 === 0 && b.SK * 5 >= 14) txt(gg, XB + 34, y + 4, String(mmx), 't-maly');
      }
      sv('rect', { x: xj, y: r1(AX + Rr), width: XB - xj, height: 16, class: 'kov-tmavy' }, gg);
      sv('rect', { x: xj, y: r1(s.yJ - 16), width: XB + 30 - xj, height: 16, class: 'kov-tmavy' }, gg);
      sv('rect', { x: XB + 46, y: r1(s.yJ - 34), width: 108, height: 34, rx: 4, class: 'displej' }, gg);
      txt(gg, XB + 100, s.yJ - 11, mm(mereni(), 2), 't-silny t-stred');
      const dosedlo = s.yJ >= yStop() - 0.5;
      m.odecet([
        ['posuvné měřítko', dosedlo ? mm(mereni(), 2) + ' (dosedlo)' : mm(mereni(), 2)],
        ['lístek měrky', s.list ? mm(s.list, 2) : 'žádný'], ['určeno šroubů', String(s.urceno)],
      ]);
      m.zpravu(s.hlaska || (dosedlo
        ? 'Čelisti se dotýkají vrcholů závitu. Teď vyber lístek závitové měrky, který do závitu zapadne bez mezer.'
        : 'Stáhni horní čelist posuvného měřítka dolů, až dosedne na šroub.'));
    };
    m.uchop({ popis: 'Horní čelist posuvného měřítka – táhni dolů', poloha: () => [500, s.yJ - 8],
      tahni: p => { s.yJ = omez(p[1] + 8, yMin(), yStop()); s.hlaska = ''; if (s.yJ >= yStop() - 0.5) s.zmereno = true; },
      klavesa: (dx, dy) => { s.yJ = omez(s.yJ + (dy || dx) * 4, yMin(), yStop()); s.hlaska = ''; if (s.yJ >= yStop() - 0.5) s.zmereno = true; },
      hodnota: () => mm(mereni(), 2) });

    const listy = $('#ur-list');
    listy.innerHTML = LISTKY.map(l => `<button type="button" data-hodnota="${l}">${cisK(l, 2)}</button>`).join('');
    const nastavList = segment(listy, '', v => {
      s.list = +v; s.hlaska = '';
      if (Math.abs(s.list - sroub().P) < 1e-9) s.merkaOk = true;
      m.naplanuj();
    });
    const volby = $('#ur-volby');
    volby.innerHTML = ZAVITY_M.map(([z], i) => `<button type="button" data-i="${i}">${z}</button>`).join('');
    const obnovVolby = () => $$('button', volby).forEach(b => { b.disabled = false; b.classList.remove('spravne', 'spatne'); });
    $$('button', volby).forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, b0 = sroub(), [z, d, P] = ZAVITY_M[i];
      if (i === s.i) {
        b.classList.add('spravne'); $$('button', volby).forEach(x => { x.disabled = true; });
        s.urceno++;
        s.hlaska = `<span class="ok">✓ Je to ${z}.</span> Měřítko ukázalo ${mm(skutecnyPrumer(b0.d), 2)} – skutečný šroub je o kousek tenčí než jmenovitých ${b0.d} mm. Rozteč ${mm(b0.P, 2)} je hrubá rozteč pro ${z}. Pokračuj tlačítkem <b>Další šroub</b>.`;
      } else {
        b.classList.add('spatne'); b.disabled = true;
        s.hlaska = `<span class="pozor">✗ ${z} to není.</span> ` + (Math.abs(d - b0.d) > 1.1 ? `${z} má průměr ${d} mm – změř průměr znovu.` : `Průměr by seděl, ale ${z} má rozteč ${mm(P, 2)}. Zkus závitovou měrku.`);
      }
      m.naplanuj(); Ukoly.kontrola();
    }));
    $('#ur-dalsi').addEventListener('click', novy);
    s.i = Math.floor(Math.random() * ZAVITY_M.length);
    s.yJ = yMin();

    Ukoly.definuj('ur-d', () => s.zmereno,
      'Posuvné měřítko ukáže průměr přes vrcholy závitu. Je o pár setin až desetin milimetru menší než číslo ve značce – šroub M10 měří asi 9,8 mm.');
    Ukoly.definuj('ur-merka', () => s.merkaOk,
      'Lístek, jehož zuby zapadnou do závitu bez mezer, má stejnou rozteč jako šroub. Číslo na lístku je rozteč v milimetrech.');
    Ukoly.definuj('ur-tri', () => s.urceno >= 3,
      'Postup: průměr posuvným měřítkem → zaokrouhlit nahoru na nejbližší velikost M → roztečí ze závitové měrky ověřit, že jde o běžný (hrubý) závit.');
    return { novy };
  }

  /* ---------- 6 · Utahování: moment a předpětí ---------- */
  /* Šrouby pevnosti 8.8: průřez závitu As [mm²], mez kluzu 640 MPa. Předpětí F = M / (0,2 · d). */
  const SROUBY_88 = { M6: [6, 20.1], M8: [8, 36.6], M10: [10, 58], M12: [12, 84.3], M16: [16, 157] };
  const mezKluzu = v => SROUBY_88[v][1] * 640;                       // N
  const doporucenyMoment = v => 0.2 * SROUBY_88[v][0] / 1000 * 0.65 * mezKluzu(v);   // N·m

  function modelUtah() {
    const m = new Model('obr-utah', 840, 400);
    const O = [150, 200], SK = 9;                   // 1 cm klíče = 9 jednotek
    const s = { v: 'M12', r: 25, F: 200, M: 0, stav: 'volny', id: 0 };
    MODELY.utah = { m, s };
    const Mklic = () => s.F * s.r / 100;
    const predpeti = () => s.M / (0.2 * SROUBY_88[s.v][0] / 1000);
    const urci = () => {
      const p = predpeti() / mezKluzu(s.v);
      return s.M <= 0 ? 'volny' : p > 1 ? 'prasklo' : p > 0.8 ? 'pretazeno' : p >= 0.5 ? 'spravne' : 'malo';
    };

    m.kresli = gg => {
      const k = m.k, d = SROUBY_88[s.v][0], Fk = mezKluzu(s.v), Fp = predpeti(), P = [O[0] + s.r * SK, O[1]];
      txt(gg, 24, 30, 'Klíč na matici (pohled shora)', 't-silny');
      // klíč a matice
      const hex = [];
      const rn = 14 + d * 2.2;
      for (let i = 0; i < 6; i++) hex.push([O[0] + rn * Math.cos(i * Math.PI / 3 + Math.PI / 6), O[1] + rn * Math.sin(i * Math.PI / 3 + Math.PI / 6)]);
      sv('rect', { x: O[0], y: O[1] - 11, width: 41 * SK, height: 22, rx: 10, class: 'kov' }, gg);
      sv('circle', { cx: O[0], cy: O[1], r: r1(rn + 12), class: 'kov' }, gg);
      mnohouhelnik(gg, hex, s.stav === 'prasklo' ? 'kov-tmavy prasklo' : 'kov-tmavy');
      osaBod(gg, O, k, 4);
      for (let c = 10; c <= 40; c += 10) txt(gg, O[0] + c * SK, O[1] + 30, c + ' cm', 't-maly t-stred');
      sv('circle', { cx: r1(P[0]), cy: O[1], r: 12, class: 'ruka' }, gg);
      sipka(gg, [P[0], O[1] + 14], [P[0], O[1] + 30 + s.F * 0.25], k, 'c-sila');
      txt(gg, P[0] + 12, O[1] + 34 + s.F * 0.2, 'F = ' + sila(s.F, 0), 't-sila');
      kota(gg, [O[0], O[1] - 30], [P[0], O[1] - 30], k, 'r = ' + cm(s.r, 0), { strana: -1 });
      txt(gg, O[0], O[1] - rn - 20, s.v, 't-velky t-stred');

      // řez spojem: dvě desky stažené šroubem, ukazatel síly ve šroubu
      const XS = 640, YS = 190, w = 6 + d * 1.6, tah = Math.min(1.25, Fp / Fk), prask = s.stav === 'prasklo';
      txt(gg, XS, 30, 'Řez spojem', 't-silny t-stred');
      sv('rect', { x: XS - 110, y: YS - 40, width: 220, height: 38, class: 'drevo' }, gg);
      sv('rect', { x: XS - 110, y: YS + 2, width: 220, height: 38, class: 'drevo' }, gg);
      const nat = tah * 6;
      if (prask) {
        sv('rect', { x: XS - w / 2, y: YS - 66, width: w, height: 70, class: 'kov' }, gg);
        sv('rect', { x: XS - w / 2, y: YS + 14, width: w, height: 56, class: 'kov', transform: `rotate(8 ${XS} ${YS + 70})` }, gg);
        txt(gg, XS + 70, YS + 4, '💥', 't-velky t-stred');
      } else {
        sv('rect', { x: XS - w / 2, y: YS - 66 - nat / 2, width: w, height: 132 + nat, class: 'kov' }, gg);
        sv('rect', { x: XS - w / 2 - 10, y: r1(YS + 40), width: w + 20, height: 16, rx: 2, class: 'kov-tmavy' }, gg);
      }
      sv('rect', { x: XS - w / 2 - 14, y: r1(YS - 58 - nat / 2), width: w + 28, height: 18, rx: 3, class: 'kov-tmavy' }, gg);
      if (!prask && Fp > 0) {
        const dl = 14 + 34 * Math.min(1, Fp / Fk);
        sipka(gg, [XS - 80, YS - 40 - dl], [XS - 80, YS - 42], k, 'c-bremeno');
        sipka(gg, [XS - 80, YS + 40 + dl], [XS - 80, YS + 42], k, 'c-bremeno');
        txt(gg, XS - 80, YS - 48 - dl, 'svěrná síla', 't-maly t-stred t-bremeno');
      }
      // ukazatel: 0 … 120 % meze kluzu, zóny
      const GX = 520, GW = 260, GY = 318, sk = GW / 1.2;
      const zona = (a, b, cls) => sv('rect', { x: r1(GX + a * sk), y: GY, width: r1((b - a) * sk), height: 14, class: cls }, gg);
      zona(0, 0.5, 'zona-malo'); zona(0.5, 0.8, 'zona-ok'); zona(0.8, 1, 'zona-pozor'); zona(1, 1.2, 'zona-prask');
      txt(gg, GX + 0.25 * sk, GY + 32, 'málo', 't-maly t-stred'); txt(gg, GX + 0.65 * sk, GY + 32, 'správně', 't-maly t-stred t-ok');
      txt(gg, GX + 1.1 * sk, GY + 32, 'praskne', 't-maly t-stred t-treni');
      txt(gg, GX, GY - 20, 'síla ve šroubu (předpětí)', 't-maly');
      const xu = GX + Math.min(1.2, Fp / Fk) * sk;
      if (s.M > 0) mnohouhelnik(gg, [[xu, GY - 1], [xu - 7, GY - 13], [xu + 7, GY - 13]], 'vypln c-text');

      m.odecet([
        ['moment klíče', `M = F · r = ${cisK(Mklic(), 1)} N·m`], ['šroub', `${s.v}, pevnost 8.8`],
        ['doporučený moment', 'asi ' + cisK(doporucenyMoment(s.v), 0) + ' N·m'],
        s.M > 0 && ['předpětí', `${cisK(Fp / 1000, 1)} kN (${proc(Fp / Fk)} meze kluzu)`],
      ]);
      const H = {
        volny: 'Nastav délku klíče (táhni ruku) a sílu, pak šroub utáhni tlačítkem <b>Utáhnout</b>.',
        malo: '<span class="pozor">Utaženo málo.</span> Spoj drží slabě a otřesy ho mohou povolit.',
        spravne: '<span class="ok">✓ Utaženo správně.</span> Šroub je napnutý jako silná pružina a pevně svírá desky.',
        pretazeno: '<span class="pozor">Přetaženo!</span> Šroub je blízko meze kluzu – ještě kousek a trvale se natáhne.',
        prasklo: '<span class="pozor">Šroub praskl!</span> Předpětí překročilo mez kluzu. Malý šroub nesnese moment velkého.',
      };
      m.zpravu(H[s.stav]);
    };
    m.uchop({ popis: 'Ruka na klíči – posouvej po rukojeti', poloha: () => [O[0] + s.r * SK, O[1]],
      tahni: p => { s.r = omez(Math.round((p[0] - O[0]) / SK), 8, 40); },
      klavesa: (dx, dy) => { s.r = omez(s.r + (dx || -dy), 8, 40); }, hodnota: () => cm(s.r, 0) });
    posuvnik('ut-F', v => sila(v, 0), v => { s.F = v; m.naplanuj(); });
    segment($('#ut-v'), s.v, v => { s.v = v; s.M = 0; s.stav = 'volny'; m.naplanuj(); });
    $('#ut-utahni').addEventListener('click', () => {
      s.M = Mklic(); s.stav = urci(); s.id++;
      s.posledni = { v: s.v, F: s.F, r: s.r, stav: s.stav, id: s.id };
      m.vykresli();
    });
    $('#ut-povol').addEventListener('click', () => { s.M = 0; s.stav = 'volny'; m.naplanuj(); });

    Ukoly.definuj('ut-kolo', () => s.posledni && s.posledni.v === 'M12' && s.posledni.stav === 'spravne',
      () => `Moment ${cisK(s.posledni.F * s.posledni.r / 100, 0)} N·m. Servis kola utahuje momentovým klíčem, který při nastaveném momentu cvakne – „od oka“ se to správně trefit nedá.`);
    Ukoly.definuj('ut-m8', () => s.posledni && s.posledni.v === 'M8' && s.posledni.stav === 'spravne' && s.posledni.F <= 100,
      () => `Stačil klíč ${cm(s.posledni.r, 0)}. Proto jsou klíče na malé šrouby krátké: rukou bys s nimi malý šroub těžko přetáhl.`);
    predpoved('ut-m6', {
      otazka: 'Šroub <b>M6</b> utáhneš stejně jako kolo auta: klíč <b>30 cm</b>, síla <b>300 N</b>. Co se stane?',
      moznosti: ['Šroub praskne', 'Bude utažený pevněji, a tedy lépe', 'Nic – malý šroub větší moment nepřenese, klíč prokluzuje'],
      spravna: 0,
      proc: [null, 'Šroub je jako pružina – snese jen určité natažení. M6 má průřez čtyřikrát menší než M12.', 'Klíč neprokluzuje: matice se točí dál a šroub se natahuje, dokud nepraskne.'],
      vyzkousej: 'Vyber <b>M6</b>, posuň ruku na <b>30 cm</b>, nastav sílu <b>300 N</b> a utáhni.',
      splneno: () => s.posledni && s.posledni.v === 'M6' && s.posledni.stav === 'prasklo',
      vysvetleni: 'Moment 90 N·m by v M6 vyvolal předpětí asi 75 kN, mez kluzu je jen 13 kN. Malý šroub potřebuje asi 10 N·m – devětkrát méně.',
    });
  }

  /* ---------- 4 a 8 · Šroubový stroj (zvedák, svěrák, lis) ---------- */
  const STROJE = {
    zvedak: { typ: 'zvedak', nazev: 'Zvedák auta', predmet: 'auto', d: 20, P: 4, n: 1, R: 25, Q: 10000, mu: 0.15 },
    sverak: { typ: 'lis', nazev: 'Svěrák', predmet: 'dřevo', d: 20, P: 3, n: 1, R: 15, Q: 3000, mu: 0.15 },
    lis: { typ: 'lis', nazev: 'Lis na ovoce', predmet: 'ovoce', d: 40, P: 8, n: 1, R: 40, Q: 8000, mu: 0.1 },
    rychlo: { typ: 'lis', nazev: 'Rychloupínací šroub', predmet: 'deska', d: 16, P: 4, n: 3, R: 8, Q: 500, mu: 0.1 },
  };

  function zavitovyStroj(cfg) {
    const m = new Model(cfg.id, 840, 440);
    const s = Object.assign({ stroj: 'zvedak', treni: false, phi: 0, phiOd: 0, prevys: true, vraci: false, drzi: false }, STROJE.zvedak, cfg.s || {});
    const ZMAX = 40, SKZ = 2, CX = 220, X1 = 470, YB = 382, W = 280, PSI0 = 0.9;
    const mu = () => (s.treni ? s.mu : 0);
    const Ph = () => s.n * s.P;
    const r = () => s.d / 2;
    const tga = () => Ph() / (2 * Math.PI * r());
    const alfa = () => Math.atan(tga());
    const fi = () => Math.atan(mu());
    const F0 = () => s.Q * Math.tan(alfa() + fi());
    const F = () => F0() * r() / (s.R * 10);
    const Fid = () => s.Q * Ph() / (2 * Math.PI * s.R * 10);
    const eta = () => tga() / Math.tan(alfa() + fi());
    const samosvorny = () => mu() > 0 && alfa() <= fi() + 1e-12;
    const z = () => Ph() * s.phi / (2 * Math.PI);
    const phiMax = () => ZMAX / Ph() * 2 * Math.PI;
    const sgn = () => (s.typ === 'zvedak' ? 1 : -1);
    const rw = () => s.d * 0.75;
    const Rpx = () => Math.max(rw() + 16, s.R * 4.2);
    const otocenoOd = () => (s.phi - s.phiOd) / (2 * Math.PI);
    /* Lis: klika nad příčníkem (220–250 px) sjede za celý zdvih o 60 px a dosedne k němu. */
    const SKL = 1.5;
    const yc = () => (s.typ === 'zvedak' ? 320 - z() * SKZ : 110 + z() * SKL);
    const klika = () => { const p = PSI0 + sgn() * s.phi, Rp = Rpx(); return [CX + Rp * Math.sin(p), yc() + 0.3 * Rp * Math.cos(p)]; };
    const api = { m, s, F, Fid, eta, samosvorny, z, Ph, alfa, otocenoOd };

    function kresliSroub(gg, y1, y2) {
      const w = rw(), Pv = s.P * SKZ, Lv = Ph() * SKZ, krok = Math.max(1, Math.ceil(3 / Pv));
      sv('rect', { x: r1(CX - w), y: r1(y1), width: r1(2 * w), height: r1(y2 - y1), class: 'kov' }, gg);
      // závit je vůči matici v klidu (šroub stoupá i se točí) – kreslí se k pevné výšce
      const yRef = 400;
      const j0 = Math.floor((y1 - yRef) / Pv) - 1, j1 = Math.ceil((y2 + Lv - yRef) / Pv) + 1;
      for (let j = j0; j <= j1; j++) {
        if (((j % krok) + krok) % krok) continue;
        const y = yRef + j * Pv;
        if (y > y2 || y - Lv / 2 < y1) continue;
        cara(gg, [[CX - w, y], [CX + w, y - Lv / 2]], 'tenka ' + CHODY[((j % s.n) + s.n) % s.n]);
      }
      const p = sgn() * s.phi;
      if (Math.cos(p) > 0) cara(gg, [[CX + w * Math.sin(p), y1], [CX + w * Math.sin(p), y2]], 'c-osa');
    }
    function kresliKliku(gg, predni) {
      const p = PSI0 + sgn() * s.phi, H = klika();
      if ((Math.cos(p) >= 0) !== predni) return;
      cara(gg, [[CX, yc()], H], 'silna c-kov klika');
      sv('rect', { x: r1(H[0] - 5), y: r1(H[1] - 24), width: 10, height: 26, rx: 4, class: 'drevo' }, gg);
    }
    function kresliPredmet(gg, x, y, w, h) {
      mnohouhelnik(gg, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 'bremeno-vypln');
      if (s.predmet === 'auto') {
        for (const dx of [26, w - 26]) sv('circle', { cx: x + dx, cy: y + h, r: 14, class: 'kov-tmavy' }, gg);
      }
      txt(gg, x + w / 2, y + h / 2 + 5, s.predmet, 't-bremeno t-stred');
    }

    m.kresli = gg => {
      const k = m.k, ycc = yc(), H = klika(), f = F();
      txt(gg, 24, 30, s.nazev, 't-silny');
      if (s.typ === 'zvedak') {
        zem(gg, 20, 430, 412, k);
        mnohouhelnik(gg, [[CX - 74, 412], [CX + 74, 412], [CX + 40, 340], [CX - 40, 340]], 'kov-tmavy');
        txt(gg, CX, 396, 'matice', 't-maly t-stred t-nasvetle');
        kresliKliku(gg, false);
        kresliSroub(gg, ycc, 340);
        sv('rect', { x: r1(CX - rw() - 10), y: r1(ycc - 8), width: r1(2 * rw() + 20), height: 16, rx: 3, class: 'kov-tmavy' }, gg);
        sv('rect', { x: CX - 9, y: r1(ycc - 44), width: 18, height: 36, class: 'kov' }, gg);
        sv('rect', { x: CX - 60, y: r1(ycc - 54), width: 120, height: 10, rx: 2, class: 'kov' }, gg);
        kresliPredmet(gg, CX - 90, ycc - 120, 180, 66);
        sipka(gg, [CX + 70, ycc - 176], [CX + 70, ycc - 124], k, 'c-bremeno');
        txt(gg, CX + 80, ycc - 150, 'Q = ' + sila(s.Q, 0), 't-bremeno');
      } else {
        zem(gg, 20, 430, 420, k);
        sv('rect', { x: CX - 130, y: 404, width: 260, height: 16, class: 'kov-tmavy' }, gg);
        for (const x of [CX - 124, CX + 104]) sv('rect', { x, y: 220, width: 20, height: 184, class: 'kov-tmavy' }, gg);
        const yPl = 264 + z() * SKL;
        kresliPredmet(gg, CX - 64, 336, 128, 68);
        kresliKliku(gg, false);
        kresliSroub(gg, ycc, yPl);
        // příčník s maticí až po šroubu – šroub v něm zmizí
        sv('rect', { x: CX - 130, y: 220, width: 260, height: 30, rx: 3, class: 'kov-tmavy' }, gg);
        txt(gg, CX + 72, 240, 'matice', 't-maly t-stred t-nasvetle');
        sv('rect', { x: r1(CX - rw() - 10), y: r1(ycc - 8), width: r1(2 * rw() + 20), height: 16, rx: 3, class: 'kov-tmavy' }, gg);
        sv('rect', { x: CX - 70, y: r1(yPl), width: 140, height: 12, rx: 2, class: 'kov' }, gg);
        sipka(gg, [CX + 92, yPl + 70], [CX + 92, yPl + 16], k, 'c-bremeno');
        txt(gg, CX + 100, yPl + 50, 'Q = ' + sila(s.Q, 0), 't-bremeno');
      }
      // dráha kliky a klika vpředu
      sv('ellipse', { cx: CX, cy: r1(ycc), rx: r1(Rpx()), ry: r1(0.3 * Rpx()), class: 'cara tenka carkovana c-sila' }, gg);
      kresliKliku(gg, true);
      const p = PSI0 + sgn() * s.phi, t = V.norm([sgn() * Rpx() * Math.cos(p), -sgn() * 0.3 * Rpx() * Math.sin(p)]);
      const dl = 26 + Math.min(70, f * 0.5);
      sipka(gg, V.add(H, V.mul(t, 10)), V.add(H, V.mul(t, 10 + dl)), k, 'c-sila');
      const lp = V.add(H, V.mul(t, 26 + dl));
      txt(gg, lp[0], lp[1] - 8, 'F = ' + sila(f, f < 10 ? 1 : 0), 't-sila t-stred');

      // jedna otáčka rozvinutá do roviny
      const tg = tga(), ex = s.prevys ? Math.max(1, Math.min(10, Math.floor(0.5 / tg))) : 1;
      let Wv = W, Hv = W * tg * ex;
      if (Hv > 260) { Wv = 260 / (tg * ex); Hv = 260; }
      txt(gg, X1, 30, 'Rozvinutá otáčka', 't-silny');
      txt(gg, X1, 48, ex > 1 ? `výška ${ex}× zvětšená` : 'skutečný sklon', 't-maly');
      mnohouhelnik(gg, [[X1, YB], [X1 + Wv, YB], [X1 + Wv, YB - Hv]], 'rampa');
      kota(gg, [X1, YB + 16], [X1 + Wv, YB + 16], k, `obvod 2πr = ${mm(2 * Math.PI * r(), 0)}`, { cls: 'c-draha', tcls: 't-draha', strana: 1 });
      kotaSvisla(gg, X1 + Wv + 10, YB, YB - Hv, k, 'Pₕ = ' + mm(Ph(), 1), { cls: 'c-rameno', tcls: 't-rameno', vlevo: true });
      const a = Math.atan2(-Hv, Wv);
      const mid = obloukUhlu(gg, [X1, YB], 48, 0, a, 'tenka c-text');
      txt(gg, X1 + 62 * Math.cos(mid) + 4, YB + 62 * Math.sin(mid) + 2, 'α = ' + stup(alfa() / RAD), 't-maly');
      let fr = zlom(s.phi / (2 * Math.PI) + 1e-9);
      if (s.phi > 1e-6 && fr < 1e-6) fr = 1;
      const nahoru = [Math.cos(a), Math.sin(a)], kolmo = [Math.sin(a), -Math.cos(a)];
      const q = 0.08 + 0.84 * fr, c = V.add([X1 + q * Wv, YB - q * Hv], V.mul(kolmo, 12));
      const rohy = [[-20, -12], [20, -12], [20, 12], [-20, 12]].map(([u, v]) => V.add(c, V.add(V.mul(nahoru, u), V.mul(kolmo, -v))));
      mnohouhelnik(gg, rohy, 'matice');
      sipka(gg, c, [c[0], c[1] + 52], k, 'c-bremeno');
      txt(gg, c[0] - 8, c[1] + 48, 'Q', 't-bremeno t-konec');
      const dF = 20 + Math.min(60, 120 * Math.tan(alfa() + fi()));
      sipka(gg, [c[0] + 22, c[1]], [c[0] + 22 + dF, c[1]], k, 'c-sila');
      txt(gg, c[0] + 26 + dF, c[1] - 8, 'F₀', 't-sila');
      txt(gg, X1 + Wv + 10, YB - Hv - 14, `${Math.floor(s.phi / (2 * Math.PI) + 1e-9) + (fr === 1 ? 0 : 1)}. otáčka`, 't-maly t-konec');

      const ruka = 2 * Math.PI * s.R;                       // cm za otáčku
      const Wr = f * ruka / 100, Wq = s.Q * Ph() / 1000;    // J za otáčku
      m.odecet([
        ['síla ruky', 'F = ' + sila(f, f < 10 ? 2 : 1) + (s.treni ? ` (bez tření ${sila(Fid(), 1)})` : '')],
        ['za otáčku ruka', cm(ruka, 0)], ['za otáčku šroub', mm(Ph(), 1)],
        ['zdvih', mm(z(), 1)], ['výhoda bez tření', cisK(ruka * 10 / Ph(), 0) + '×'],
        s.treni && ['účinnost', 'η = ' + proc(eta())], ['drží sám?', samosvorny() ? 'ano – samosvorný' : 'ne'],
      ]);
      let h;
      if (s.vraci) h = '<span class="pozor">Šroub se roztáčí zpátky!</span> Závit není samosvorný – břemeno ho tlačí dolů po strmé nakloněné rovině a tření ho neudrží.';
      else if (s.drzi) h = '<span class="ok">✓ Šroub drží sám.</span> Úhel stoupání ' + stup(alfa() / RAD) + ' je menší než úhel tření ' + stup(fi() / RAD) + ' – závit je samosvorný.';
      else {
        h = `Za jednu otáčku: ruka <b>F · 2πR = ${cisK(Wr, 1)} J</b>, ${s.typ === 'zvedak' ? 'auto' : 'břemeno'} <b>Q · Pₕ = ${cisK(Wq, 1)} J</b>.`;
        h += s.treni ? ` Rozdíl ${cisK(Wr - Wq, 1)} J spotřebuje tření (účinnost ${proc(eta())}).` : ' Práce je stejná – <b>zlaté pravidlo mechaniky</b>.';
        if (s.phi >= phiMax() - 1e-6) h = '<span class="ok">✓ Šroub je na konci dráhy (40 mm).</span> ' + h;
      }
      m.zpravu(h);
    };

    m.uchop({ popis: 'Držadlo kliky – otáčej dokola', poloha: () => klika(),
      tahni: p => {
        const Rp = Rpx(), psi = Math.atan2((p[0] - CX) / Rp, (p[1] - yc()) / (0.3 * Rp));
        const d = obalUhlu(psi - PSI0 - sgn() * s.phi);
        s.vraci = false; s.drzi = false;
        s.phi = omez(s.phi + sgn() * d, 0, phiMax());
      },
      klavesa: (dx, dy) => { s.vraci = false; s.drzi = false; s.phi = omez(s.phi + (dx || -dy) * 0.26, 0, phiMax()); },
      hodnota: () => cisK(s.phi / (2 * Math.PI), 2) + ' otáčky, zdvih ' + mm(z(), 1) });

    const ovl = {}, I = cfg.ids;
    const zmena = () => { s.phi = Math.min(s.phi, phiMax()); s.phiOd = s.phi; s.vraci = false; s.drzi = false; m.naplanuj(); };
    if (I.d) ovl.d = posuvnik(I.d, v => mm(v, 0), v => { s.d = v; zmena(); });
    if (I.P) ovl.P = posuvnik(I.P, v => mm(v, 1), v => { s.P = v; zmena(); });
    if (I.R) ovl.R = posuvnik(I.R, v => cm(v, 0), v => { s.R = v; zmena(); });
    if (I.Q) ovl.Q = posuvnik(I.Q, v => sila(v, 0), v => { s.Q = v; zmena(); });
    if (I.n) ovl.n = segment($('#' + I.n), s.n, v => { s.n = +v; zmena(); });
    if (I.mu) ovl.mu = segment($('#' + I.mu), s.treni ? s.mu : 0, v => { s.mu = +v || s.mu; s.treni = +v > 0; zmena(); });
    if (I.treni) prepinac(I.treni, v => { s.treni = v; zmena(); });
    if (I.prevys) prepinac(I.prevys, v => { s.prevys = v; m.naplanuj(); });
    if (I.vychozi) $('#' + I.vychozi).addEventListener('click', () => { s.phi = 0; s.phiOd = 0; s.vraci = false; s.drzi = false; m.naplanuj(); });
    for (const k of ['d', 'P', 'R', 'Q']) if (ovl[k]) s[k] = +ovl[k].el.value;

    /* Pustit kliku: samosvorný šroub drží, jiný se roztočí zpátky. */
    const zpet = animace(m, dt => {
      if (!s.vraci) return false;
      const w = 2 * Math.PI * Math.min(3, 0.5 + 8 * (tga() - mu()));
      s.phi = Math.max(0, s.phi - w * dt);
      if (s.phi <= 0) { s.vraci = false; s.phiOd = 0; return false; }
      return true;
    });
    api.pust = () => {
      s.pustil = true;
      if (samosvorny()) { s.drzi = true; s.vraci = false; m.naplanuj(); return; }
      s.drzi = false;
      if (s.phi <= 0) { s.phi = Math.min(phiMax(), Math.PI); }
      s.vraci = true;
      if (bezPohybu()) { s.phi = 0; s.vraci = false; m.naplanuj(); } else zpet();
    };
    if (I.pust) $('#' + I.pust).addEventListener('click', api.pust);
    api.nastavStroj = id => {
      const p = STROJE[id];
      if (!p) return;
      Object.assign(s, p, { stroj: id, treni: p.mu > 0, phi: 0, phiOd: 0, vraci: false, drzi: false });
      for (const k of ['d', 'P', 'R', 'Q']) if (ovl[k]) { ovl[k].el.value = p[k]; ovl[k].el.dispatchEvent(new Event('input')); }
      if (ovl.n) ovl.n(p.n);
      if (ovl.mu) ovl.mu(p.mu);
      zmena();
    };
    if (I.stroj) segment($('#' + I.stroj), s.stroj, v => api.nastavStroj(v));
    return api;
  }

  function modelZvedak() {
    const z = zavitovyStroj({ id: 'obr-zvedak', s: { treni: false, bylo4: false },
      ids: { R: 'zv-R', P: 'zv-P', Q: 'zv-Q', treni: 'zv-treni', prevys: 'zv-prevys', vychozi: 'zv-vychozi' } });
    const s = z.s;
    MODELY.zvedak = z;
    const kresli = z.m.kresli;
    z.m.kresli = gg => { if (s.P === 4) s.bylo4 = true; kresli(gg); };
    Ukoly.definuj('zv-auto', () => s.Q === 10000 && !s.treni && z.F() <= 30 + 1e-9 && z.z() >= 10 - 1e-9,
      () => `Ruka táhla jen ${sila(z.F(), 1)} – ${cisK(s.Q / z.F(), 0)}× méně, než je tíha auta. Zaplatil(a) jsi za to dráhou: na každý milimetr zdvihu urazí ruka ${mm(2 * Math.PI * s.R * 10 / z.Ph(), 0)}.`);
    predpoved('zv-polovina', {
      otazka: 'Zmenšíš stoupání závitu na polovinu – ze <b>4 mm</b> na <b>2 mm</b>. Klika zůstane stejná. Co se stane?',
      moznosti: ['Síla ruky klesne na polovinu, ale na stejný zdvih budeš točit dvakrát víc', 'Síla klesne na polovinu a otáček bude stejně', 'Síla se zdvojnásobí, protože je závit hustší'],
      spravna: 0,
      proc: [null, 'Za jednu otáčku se šroub zvedne jen o 2 mm místo 4 mm – na stejný zdvih je potřeba dvakrát víc otáček.', 'Hustší závit je mírnější nakloněná rovina – síla je menší, ne větší.'],
      priTipu: () => { s.bylo4 = s.P === 4; },
      vyzkousej: 'Vypni tření, nastav stoupání <b>4 mm</b>, potom <b>2 mm</b> a otoč klikou jednou dokola. Porovnej sílu a zdvih za otáčku.',
      splneno: () => s.bylo4 && s.P === 2 && !s.treni && z.otocenoOd() >= 0.99,
      vysvetleni: 'F = Q · Pₕ / (2πR): poloviční stoupání = poloviční síla. Za otáčku ale šroub vystoupá jen o 2 mm, takže na stejný zdvih je potřeba dvakrát víc otáček. Práce zůstane stejná.',
    });
    Ukoly.definuj('zv-treni', () => s.treni && z.otocenoOd() >= 0.99,
      () => `Se třením táhneš ${sila(z.F(), 1)} místo ${sila(z.Fid(), 1)}. Do zvedání jde jen ${proc(z.eta())} práce, zbytek se mění v teplo. Za to ale šroub drží auto sám – kliku můžeš pustit a auto nespadne.`);
  }

  function modelDilna() {
    const z = zavitovyStroj({ id: 'obr-dilna', s: { treni: true },
      ids: { stroj: 'hr-stroj', d: 'hr-d', P: 'hr-P', n: 'hr-n', R: 'hr-R', Q: 'hr-Q', mu: 'hr-mu', prevys: 'hr-prevys', vychozi: 'hr-vychozi', pust: 'hr-pust' } });
    const s = z.s;
    MODELY.dilna = z;
    Ukoly.definuj('hr-sverak', () => s.Q >= 3000 && z.F() <= 50 + 1e-9 && s.treni && s.mu >= 0.1 && z.samosvorny() && z.otocenoOd() >= 0.99,
      () => `Sevřeno silou ${sila(s.Q, 0)}, ruka jen ${sila(z.F(), 1)}. Závit drží sám, takže svěrák se po puštění nepovolí.`);
    Ukoly.definuj('hr-rychly', () => z.Ph() >= 20 - 1e-9 && z.otocenoOd() >= 0.99,
      () => `Stoupání ${mm(z.Ph(), 1)} – šroub ujede za otáčku ${cm(z.Ph() / 10, 1)}. ` + (z.samosvorny()
        ? 'Překvapivě drží sám – máš velký průměr nebo hodně tření.'
        : 'Sám ale <b>nedrží</b> (zkus „Pustit kliku“). Strmý závit se pod zatížením roztočí – proto mají rychloupínáky ještě páčku nebo západku.'));
    predpoved('hr-50', {
      otazka: 'Dá se postavit závit, který <b>drží sám</b> (je samosvorný) a zároveň má <b>účinnost nad 50 %</b>?',
      moznosti: ['Ne – samosvorný závit má účinnost vždycky pod 50 %', 'Ano, stačí ho dobře namazat', 'Ano, stačí delší klika'],
      spravna: 0,
      proc: [null, 'Namazání účinnost zvýší, ale zmenší i tření – a závit pak přestane držet sám.', 'Klika zmenší sílu, ale účinnost ani samosvornost nezmění – obě závisí jen na úhlu stoupání a tření.'],
      vyzkousej: 'Hledej závit s účinností nad 50 % (tření nech zapnuté). Sleduj, jestli pořád drží sám.',
      splneno: () => z.eta() > 0.5 && s.treni,
      vysvetleni: 'Aby závit držel, musí být úhel stoupání menší než úhel tření. Pak ale tření „sní“ víc než polovinu práce. Vysoká účinnost a samosvornost jdou proti sobě – konstruktér si musí vybrat.',
    });
    Ukoly.definuj('hr-ucinnost', () => z.eta() > 0.5 && s.treni,
      () => `Účinnost ${proc(z.eta())}. Drží sám? <b>${z.samosvorny() ? 'ano' : 'ne'}</b>. Účinné závity (kuličkové šrouby v obráběcích strojích) potřebují brzdu, samosvorné (zvedák, svěrák) mají účinnost pod 50 %.`);
  }

  /* ---------- 4 · Tření a samosvornost ---------- */
  function modelSamo() {
    const m = new Model('obr-samo', 840, 420);
    const X0 = 50, Y0 = 320, LP = 440, DELKA = 3;
    const s = { a: 12, mu: 0.15, p: 0.85, v: 0, stav: 'stoji', testy: {} };
    MODELY.samo = { m, s };
    const tg = () => Math.tan(s.a * RAD);
    const klic = () => `${s.mu}|${s.a}`;
    const drzi = () => tg() <= s.mu + 1e-12;

    const jed = animace(m, dt => {
      if (s.stav !== 'jede') return false;
      const acc = 9.81 * (Math.sin(s.a * RAD) - s.mu * Math.cos(s.a * RAD));
      s.v = Math.max(0, s.v + acc * dt);
      if (s.v <= 0 && acc <= 0) { s.stav = 'drzi'; return false; }
      s.p -= s.v * dt / DELKA;
      if (s.p <= 0) { s.p = 0; s.stav = 'dole'; return false; }
      return true;
    });

    m.kresli = gg => {
      const k = m.k, a = s.a * RAD, T = [X0 + LP * Math.cos(a), Y0 - LP * Math.sin(a)];
      zem(gg, 20, 560, Y0, k);
      mnohouhelnik(gg, [[X0, Y0], [T[0], Y0], T], 'rampa');
      const mid = obloukUhlu(gg, [X0, Y0], 64, 0, -a, 'tenka c-text');
      txt(gg, X0 + 80 * Math.cos(mid) + 6, Y0 + 80 * Math.sin(mid) + 5, 'α = ' + s.a + '°', 't-silny');
      const nahoru = [Math.cos(-a), Math.sin(-a)], kolmo = [Math.sin(-a), -Math.cos(-a)];
      const c = V.add([X0 + s.p * LP * Math.cos(a), Y0 - s.p * LP * Math.sin(a)], V.mul(kolmo, 16));
      const rohy = [[-28, -16], [28, -16], [28, 16], [-28, 16]].map(([u, v]) => V.add(c, V.add(V.mul(nahoru, u), V.mul(kolmo, -v))));
      mnohouhelnik(gg, rohy, 'matice');
      const G = 120;
      sipka(gg, c, [c[0], c[1] + G], k, 'c-bremeno');
      txt(gg, c[0] + 8, c[1] + G - 4, 'G', 't-bremeno');
      const dolu = V.mul(nahoru, -1), Fs = G * Math.sin(a), Ft = G * s.mu * Math.cos(a);
      const pod = V.add(c, V.mul(kolmo, -16));
      sipka(gg, pod, V.add(pod, V.mul(dolu, Fs)), k, 'c-draha');
      sipka(gg, V.add(c, V.mul(kolmo, 22)), V.add(V.add(c, V.mul(kolmo, 22)), V.mul(nahoru, Ft)), k, 'c-treni');

      // srovnávací pruhy (v násobcích tíhy G)
      const PX = 300, yA = 352, yB = 388;
      txt(gg, X0, yA - 6, 'sklouzávací síla G · sin α', 't-maly t-draha');
      sv('rect', { x: X0, y: yA, width: r1(Math.max(1, PX * Math.sin(a))), height: 12, rx: 2, class: 'vypln c-draha' }, gg);
      txt(gg, X0 + PX * Math.sin(a) + 8, yA + 11, cisK(Math.sin(a), 2) + ' · G', 't-maly');
      txt(gg, X0, yB - 6, 'tření nejvýš μ · G · cos α', 't-maly t-treni');
      sv('rect', { x: X0, y: yB, width: r1(Math.max(1, PX * s.mu * Math.cos(a))), height: 12, rx: 2, class: 'vypln c-treni' }, gg);
      txt(gg, X0 + PX * s.mu * Math.cos(a) + 8, yB + 11, cisK(s.mu * Math.cos(a), 2) + ' · G', 't-maly');

      // takový závit na šroubu
      const CXs = 712, rs = 44, yT = 70, yD = 330, Ph = 2 * Math.PI * rs * tg(), E = 9;
      txt(gg, CXs, 40, 'Takový závit na šroubu', 't-silny t-stred');
      sv('rect', { x: CXs - rs, y: yT, width: 2 * rs, height: yD - yT, class: 'kov' }, gg);
      sv('ellipse', { cx: CXs, cy: yT, rx: rs, ry: E, class: 'kov-svetly' }, gg);
      for (let j = 0, y0 = yD - 6; j < 80 && y0 > yT - Ph; j++, y0 -= Ph) {
        const body = [];
        for (let t = -Math.PI / 2; t <= Math.PI / 2 + 1e-9; t += Math.PI / 24) {
          const y = y0 - (t + Math.PI / 2) * rs * tg() + E * Math.cos(t);
          if (y > yT + E && y < yD) body.push([CXs + rs * Math.sin(t), y]);
        }
        if (body.length > 1) cara(gg, body, 'c-chod1');
      }
      kotaSvisla(gg, CXs + rs + 16, yD - 6, yD - 6 - Math.min(Ph, 200), k, Ph <= 200 ? 'Pₕ' : '', { cls: 'c-rameno', tcls: 't-rameno' });
      txt(gg, CXs, yD + 24, `průměr ${mm(2 * rs / 4.4, 0)}, Pₕ ≈ ${mm(Ph / 4.4, 1)}`, 't-maly t-stred');

      m.odecet([
        ['úhel stoupání', 'α = ' + s.a + '°'], ['součinitel tření', 'μ = ' + cisK(s.mu, 2)],
        ['úhel tření', 'φ ≈ ' + stup(Math.atan(s.mu) / RAD)],
      ]);
      const H = {
        stoji: `Bude matice na nakloněné rovině držet? Porovnej pruhy pod obrázkem a pak ji pusť.`,
        drzi: '<span class="ok">✓ Matice drží.</span> Tření může být až ' + cisK(s.mu * Math.cos(a), 2) + ' · G, sklouzávací síla je jen ' + cisK(Math.sin(a), 2) + ' · G. Takový závit je <b>samosvorný</b> – pod zatížením se sám nepovolí.',
        jede: '<span class="pozor">Matice sjíždí!</span> Sklouzávací síla je větší, než kolik tření dokáže udržet.',
        dole: '<span class="pozor">Matice sjela dolů.</span> Takový závit <b>není samosvorný</b> – zatížený šroub by se sám roztočil zpátky.',
      };
      m.zpravu(H[s.stav]);
    };
    m.uchop({ popis: 'Matice – posuň po nakloněné rovině', poloha: () => { const a = s.a * RAD; return V.add([X0 + s.p * LP * Math.cos(a), Y0 - s.p * LP * Math.sin(a)], V.mul([Math.sin(-a), -Math.cos(-a)], 16)); },
      tahni: p => { const a = s.a * RAD, d = [Math.cos(a), -Math.sin(a)]; s.p = omez(V.dot(V.sub(p, [X0, Y0]), d) / LP, 0.15, 0.95); s.stav = 'stoji'; s.v = 0; },
      klavesa: (dx, dy) => { s.p = omez(s.p + (dx || -dy) * 0.03, 0.15, 0.95); s.stav = 'stoji'; s.v = 0; }, hodnota: () => Math.round(s.p * 100) + ' % roviny' });
    const zmena = () => { if (s.stav !== 'jede') s.stav = 'stoji'; m.naplanuj(); };
    posuvnik('sa-a', v => v + '°', v => { s.a = v; zmena(); });
    segment($('#sa-mu'), s.mu, v => { s.mu = +v; zmena(); });
    s.pust = () => {
      if (s.stav === 'jede') return;
      if (s.p < 0.1) s.p = 0.85;
      s.v = 0;
      if (drzi()) { s.stav = 'drzi'; s.testy[klic()] = 'drzi'; m.naplanuj(); return; }
      s.stav = 'jede'; s.testy[klic()] = 'jede';
      if (bezPohybu()) { s.p = 0; s.stav = 'dole'; m.naplanuj(); } else jed();
    };
    $('#sa-pust').addEventListener('click', s.pust);
    $('#sa-zpet').addEventListener('click', () => { s.p = 0.85; s.v = 0; s.stav = 'stoji'; m.naplanuj(); });

    Ukoly.definuj('sa-hranice', () => s.testy['0.15|8'] === 'drzi' && s.testy['0.15|9'] === 'jede',
      'Při 8° matice drží, při 9° už sjede. Hranicí je <b>úhel tření</b> φ ≈ 8,5° – úhel, při kterém se sklouzávací síla právě vyrovná největšímu tření. Závit drží sám, když je úhel stoupání menší než úhel tření.');
    predpoved('sa-olej', {
      otazka: 'Závit se sklonem <b>5°</b> z oceli na sucho (μ = 0,15) drží. Co se stane, když ho <b>namažeš olejem</b> (μ = 0,05)?',
      moznosti: ['Matice začne sama sjíždět', 'Bude držet ještě lépe', 'Nic se nezmění – úhel je pořád 5°'],
      spravna: 0,
      proc: [null, 'Olej tření zmenšuje, ne zvětšuje.', 'Úhel se nezměnil, ale tření ano – a to rozhoduje, jestli matice udrží.'],
      vyzkousej: 'Nastav sklon <b>5°</b>, povrch <b>ocel mazaná (0,05)</b> a pusť matici.',
      splneno: () => s.testy['0.05|5'] === 'jede',
      vysvetleni: 'Při μ = 0,05 je úhel tření jen asi 2,9°, menší než sklon 5°. Proto se namazané šrouby ve strojích, které se třesou, zajišťují pojistnou maticí, podložkou nebo lepidlem.',
    });
    Ukoly.definuj('sa-m10', () => s.testy['0.1|3'] === 'drzi',
      'Běžný šroub M10 má úhel stoupání asi 3°, takže drží i lehce namazaný. Proto se šroub v nábytku ani v kole sám nepovolí – pokud ho neroztřásají otřesy.');
  }

  /* ---------- 5 · Mikrometr ---------- */
  const MK = { Y: 120, XA: 70, SK: 12, XS0: 400, RT: 46, RS: 15, WT: 96 };
  function kresliMikrometr(g, x, predmet) {
    const { Y, XA, SK, XS0, RT, RS, WT } = MK, XT = XS0 + x * SK, XV = XA + x * SK;
    if (predmet) {
      sv('rect', { x: XA, y: Y - 26, width: r1(predmet * SK), height: 52, rx: 3, class: 'bremeno-vypln' }, g);
    }
    sv('path', { d: `M30 ${Y - 22} H66 V${Y + 20} Q66 226 120 226 H330 Q350 226 350 ${Y + 30} V${Y - 26} H386 V${Y + 30} Q386 262 330 262 H100 Q30 262 30 ${Y + 20} Z`, class: 'kov-tmavy' }, g);
    sv('rect', { x: XA - 14, y: Y - 10, width: 14, height: 20, class: 'kov' }, g);
    if (XV < 350) sv('rect', { x: r1(XV), y: Y - 10, width: r1(350 - XV), height: 20, class: 'kov' }, g);
    // objímka se stupnicí
    // objímka je vidět jen vlevo od bubínku, zbytek je schovaný pod ním
    sv('rect', { x: 386, y: Y - RS, width: r1(XT + 14 - 386), height: 2 * RS, class: 'kov-svetly' }, g);
    cara(g, [[386, Y], [XT + 4, Y]], 'tenka c-text');
    for (let i = 0; i <= 25; i++) {
      const xx = XS0 + i * SK;
      if (xx > XT + 0.5) break;
      cara(g, [[xx, Y], [xx, Y - (i % 5 ? 8 : 13)]], 'tenka c-text');
      if (i % 5 === 0) txt(g, xx, Y - RS - 6, String(i), 't-maly t-stred');
      if (i < 25 && xx + SK / 2 <= XT + 0.5) cara(g, [[xx + SK / 2, Y], [xx + SK / 2, Y + 8]], 'tenka c-text');
    }
    // bubínek
    mnohouhelnik(g, [[XT, Y - RT + 10], [XT + 12, Y - RT], [XT + WT, Y - RT], [XT + WT, Y + RT], [XT + 12, Y + RT], [XT, Y + RT - 10]], 'bubinek');
    for (let xx = XT + 56; xx < XT + WT - 2; xx += 5) cara(g, [[xx, Y - RT + 2], [xx, Y + RT - 2]], 'tenka c-slaby');
    sv('rect', { x: r1(XT + WT), y: Y - 18, width: 34, height: 36, rx: 3, class: 'kov' }, g);
    const t = Math.round(x * 100) % 50;
    for (let j = t - 14; j <= t + 14; j++) {
      const th = (j - t) * 2 * Math.PI / 50;
      if (Math.abs(th) > 1.3) continue;
      const y = Y + RT * Math.sin(th), op = (0.35 + 0.65 * Math.cos(th)).toFixed(2);
      const e = cara(g, [[XT + 1, y], [XT + (j % 5 ? 12 : 19), y]], (j === t ? '' : 'tenka ') + 'c-text');
      e.setAttribute('opacity', op);
      if (j % 5 === 0) { const tt = txt(g, XT + 24, y + 4, String(((j % 50) + 50) % 50), 't-maly'); tt.setAttribute('opacity', op); }
    }
  }
  function svgMikrometr(x) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '330 50 480 130');
    s.setAttribute('class', 'model');
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', 'Stupnice mikrometru');
    kresliMikrometr(sv('g', null, s), x, null);
    return s.outerHTML;
  }

  function modelMikrometr() {
    const m = new Model('obr-mikro', 840, 290);
    const s = { x: 4.5, predmet: null, zmereno: false, d01: false };
    MODELY.mikro = { m, s };
    const nastav = v => { s.x = r2(omez(v, s.predmet || 0, 25)); m.naplanuj(); };
    /* Lupa: zvětšená objímka a bubínek kolem čtecí linky (na mobilu je celý mikrometr drobný). */
    const lupa = $('#mi-lupa'), LW = 250;
    const kresliLupu = () => {
      if (!lupa) return;
      const XT = MK.XS0 + s.x * MK.SK;
      lupa.setAttribute('viewBox', `${r1(XT - 160)} ${MK.Y - 58} ${LW} 116`);
      const w = lupa.getBoundingClientRect().width;
      if (w) lupa.style.setProperty('--k', (LW / w).toFixed(3));
      lupa.replaceChildren();
      kresliMikrometr(sv('g', null, lupa), s.x, s.predmet);
    };
    m.kresli = gg => {
      kresliMikrometr(gg, s.x, s.predmet);
      kresliLupu();
      const dosedl = s.predmet && Math.abs(s.x - s.predmet) < 0.005;
      if (s.predmet) txt(gg, MK.XA + s.predmet * MK.SK / 2, MK.Y + 44, 'součástka', 't-maly t-stred t-bremeno');
      txt(gg, 40, 30, 'Mikrometr: stoupání 0,5 mm, bubínek 50 dílků', 't-silny');
      const cele = Math.floor(s.x * 2 + 1e-9) / 2, dil = Math.round(s.x * 100) % 50;
      if (s.predmet && !s.zmereno) {
        m.odecet([['vřeteno', dosedl ? 'dosedlo na součástku – odečti' : 'ještě nedosedlo']]);
        m.zpravu(dosedl ? 'Vřeteno se dotýká součástky. Přečti údaj na objímce a bubínku a napiš ho do políčka.' : 'Otáčej bubínkem, dokud vřeteno nedosedne na součástku.');
        return;
      }
      m.odecet([
        ['objímka', mm(cele, 1)], ['bubínek', `${dil} · 0,01 mm = ${mm(dil / 100, 2)}`], ['údaj', mm(s.x, 2)],
        ['otočení bubínku', cisK(s.x / 0.5, 2) + ' otáček'],
      ]);
      m.zpravu(`Objímka ukazuje <b>${mm(cele, 1)}</b>${cele % 1 ? ' (pod linkou je odkrytá půlmilimetrová čárka)' : ''}, na bubínku je u linky dílek <b>${dil}</b>. Údaj: ${mm(cele, 1)} + ${mm(dil / 100, 2)} = <b>${mm(s.x, 2)}</b>.`);
    };
    m.uchop({ popis: 'Bubínek – táhni do stran, šipkami jemně', poloha: () => [MK.XS0 + s.x * MK.SK + MK.WT / 2, MK.Y + MK.RT + 24],
      tahni: p => nastav((p[0] - MK.WT / 2 - MK.XS0) / MK.SK),
      klavesa: (dx, dy) => { if (dx) { s.d01 = true; nastav(s.x + dx * 0.01); } else nastav(s.x - dy * 0.5); },
      hodnota: () => mm(s.x, 2) });
    const tl = (id, d) => $(id).addEventListener('click', () => { if (Math.abs(d) < 0.1) s.d01 = true; nastav(s.x + d); });
    tl('#mi-o-minus', -0.5); tl('#mi-d-minus', -0.01); tl('#mi-d-plus', 0.01); tl('#mi-o-plus', 0.5);
    const mereni = $('#mi-mereni'), vstup = $('#mi-hodnota'), vys = $('#mi-vysledek');
    prepinac('mi-predmet', v => {
      s.predmet = v ? r2(1.2 + Math.random() * 17.5) : null;
      s.zmereno = false;
      if (v) s.x = Math.min(25, r2(s.predmet + 3.3));
      mereni.hidden = !v; vys.textContent = ''; vstup.value = '';
      m.naplanuj();
    });
    $('#mi-over').addEventListener('click', () => {
      if (!s.predmet) return;
      const h = parseFloat(String(vstup.value).replace(',', '.').replace(/\s|mm/g, ''));
      if (Math.abs(s.x - s.predmet) > 0.004) { vys.className = 'mi-vysledek chyba'; vys.textContent = 'Nejdřív dotoč vřeteno až k součástce.'; return; }
      if (!isFinite(h)) { vys.className = 'mi-vysledek chyba'; vys.textContent = 'Napiš číslo v milimetrech, třeba 7,38.'; return; }
      if (Math.abs(h - s.predmet) < 0.005) {
        s.zmereno = true; vys.className = 'mi-vysledek ok'; vys.textContent = `✓ Správně, součástka měří ${mm(s.predmet, 2)}.`;
      } else {
        vys.className = 'mi-vysledek chyba';
        const pul = Math.abs(Math.abs(h - s.predmet) - 0.5) < 0.005;
        vys.textContent = pul ? '✗ Liší se to přesně o 0,5 mm – zkontroluj půlmilimetrovou čárku pod linkou.' : '✗ To nesedí. Sečti milimetry z objímky (i půlku pod linkou) a setiny z bubínku.';
      }
      m.naplanuj();
      Ukoly.kontrola();
    });
    vstup.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#mi-over').click(); } });

    predpoved('mi-dilek', {
      otazka: 'Závit mikrometru má stoupání <b>0,5 mm</b> a bubínek má <b>50 dílků</b>. O kolik se posune vřeteno, když bubínkem otočíš o <b>jeden dílek</b>?',
      moznosti: ['o 0,01 mm', 'o 0,1 mm', 'o 0,5 mm'],
      spravna: 0,
      proc: [null, 'Celá otáčka (50 dílků) posune vřeteno o 0,5 mm. Jeden dílek je padesátina z 0,5 mm.', 'O 0,5 mm se vřeteno posune až za celou otáčku – tedy za 50 dílků.'],
      priTipu: () => { s.d01 = false; },
      vyzkousej: 'Stiskni tlačítko <b>+1 dílek</b> a sleduj údaj.',
      splneno: () => s.d01,
      vysvetleni: '0,5 mm : 50 = 0,01 mm. Velké otočení se změní v nepatrný posun – stejně jako u zvedáku, jen to tu využíváme k přesnému měření.',
    });
    Ukoly.definuj('mi-738', () => !s.predmet && Math.abs(s.x - 7.38) < 0.004,
      'Objímka: 7 mm (půlmilimetrová čárka 7,5 ještě není vidět), bubínek: 38 dílků = 0,38 mm. Celkem 7,38 mm.');
    Ukoly.definuj('mi-1287', () => !s.predmet && Math.abs(s.x - 12.87) < 0.004,
      'Objímka: 12,5 mm (pod linkou je odkrytá půlmilimetrová čárka), bubínek: 37 dílků = 0,37 mm. Celkem 12,87 mm.');
    Ukoly.definuj('mi-zmer', () => s.zmereno, 'Mikrometrem se měří s přesností na setinu milimetru – tloušťka papíru je asi 0,1 mm, vlas asi 0,07 mm.');
  }

  /* ---------- 7 · K čemu je závit – třídička ---------- */
  const UCEL = { spoj: 'spojuje a drží', sila: 'zvedá a tlačí', meri: 'přesně posouvá a měří', dopr: 'dopravuje látku' };
  const VECI = [
    { id: 'vrut', nazev: 'Vrut do dřeva', ucel: 'spoj', proc: 'Závit se zařízne do dřeva a pevně spojí dva kusy.',
      kresba: '<rect x="20" y="78" width="180" height="40" class="drevo"/><rect x="92" y="16" width="36" height="10" rx="2" class="kov"/><path d="M104 26 h12 v66 l-6 18 l-6 -18z" class="kov"/><path d="M104 36 l12 -5 M104 46 l12 -5 M104 56 l12 -5 M104 66 l12 -5 M104 76 l12 -5 M104 86 l12 -5" class="cara tenka c-text"/>' },
    { id: 'matice', nazev: 'Šroub s maticí', ucel: 'spoj', proc: 'Šroub a matice stáhnou díly k sobě; dá se to zase rozebrat.',
      kresba: '<rect x="30" y="52" width="160" height="16" class="drevo"/><rect x="30" y="70" width="160" height="16" class="drevo"/><rect x="92" y="30" width="36" height="20" rx="2" class="kov"/><rect x="103" y="50" width="14" height="64" class="kov"/><rect x="90" y="88" width="40" height="18" rx="2" class="kov-tmavy"/><path d="M103 112 l14 -4 M103 118 l14 -4" class="cara tenka c-text"/>' },
    { id: 'vicko', nazev: 'Víčko PET láhve', ucel: 'spoj', proc: 'Závit drží víčko pevně na hrdle a těsní láhev.',
      kresba: '<path d="M78 128 V76 Q78 60 96 54 H124 Q142 60 142 76 V128Z" class="sklo"/><rect x="92" y="18" width="36" height="34" rx="3" class="vicko"/><path d="M98 22 V48 M104 22 V48 M110 22 V48 M116 22 V48 M122 22 V48" class="cara tenka c-slaby"/>' },
    { id: 'zvedak', nazev: 'Zvedák auta', ucel: 'sila', proc: 'Malou silou na klice zvedne auto – za cenu mnoha otáček.',
      kresba: '<rect x="20" y="16" width="180" height="34" rx="8" class="bremeno-vypln"/><circle cx="50" cy="50" r="12" class="kov-tmavy"/><circle cx="170" cy="50" r="12" class="kov-tmavy"/><path d="M84 124 H136 L124 92 H96Z" class="kov-tmavy"/><rect x="104" y="58" width="12" height="36" class="kov"/><path d="M104 66 l12 -4 M104 74 l12 -4 M104 82 l12 -4" class="cara tenka c-text"/><rect x="92" y="52" width="36" height="7" class="kov"/><path d="M110 76 L180 92" class="cara silna c-kov"/>' },
    { id: 'sverak', nazev: 'Svěrák', ucel: 'sila', proc: 'Šroub tlačí čelist a sevře předmět velkou silou.',
      kresba: '<rect x="20" y="100" width="180" height="16" class="kov-tmavy"/><rect x="40" y="40" width="30" height="60" class="kov-tmavy"/><rect x="120" y="40" width="30" height="60" class="kov-tmavy"/><rect x="70" y="56" width="50" height="34" class="drevo"/><rect x="150" y="66" width="44" height="10" class="kov"/><path d="M156 66 l4 10 M164 66 l4 10 M172 66 l4 10 M180 66 l4 10" class="cara tenka c-text"/><path d="M196 46 V96" class="cara silna c-kov"/>' },
    { id: 'lis', nazev: 'Lis na ovoce', ucel: 'sila', proc: 'Šroub tlačí desku na ovoce a vymačká z něj šťávu.',
      kresba: '<rect x="62" y="70" width="96" height="50" rx="4" class="drevo"/><circle cx="90" cy="96" r="10" fill="#c0505a"/><circle cx="112" cy="102" r="10" fill="#d0a040"/><circle cx="132" cy="94" r="10" fill="#c0505a"/><rect x="66" y="58" width="88" height="10" class="kov"/><rect x="104" y="14" width="12" height="44" class="kov"/><path d="M104 22 l12 -4 M104 30 l12 -4 M104 38 l12 -4 M104 46 l12 -4" class="cara tenka c-text"/><path d="M70 16 H150" class="cara silna c-kov"/>' },
    { id: 'mikrometr', nazev: 'Mikrometr', ucel: 'meri', proc: 'Otáčka bubínku posune vřeteno jen o 0,5 mm – měří se na setiny milimetru.',
      kresba: '<path d="M20 40 H40 V90 H120 V40 H136 V110 H20Z" class="kov-tmavy"/><rect x="136" y="44" width="30" height="16" class="kov-svetly"/><rect x="160" y="36" width="44" height="32" rx="3" class="bubinek"/><path d="M40 52 H70" class="cara silna c-text"/>' },
    { id: 'mikroskop', nazev: 'Ostření mikroskopu', ucel: 'meri', proc: 'Šroub posouvá tubus nebo stolek o zlomky milimetru, aby byl obraz ostrý.',
      kresba: '<rect x="60" y="112" width="100" height="12" class="kov-tmavy"/><path d="M128 112 V40 Q128 30 118 30" class="cara silna c-kov" style="stroke-width:10px"/><rect x="78" y="14" width="22" height="58" rx="3" class="kov" transform="rotate(-20 89 43)"/><rect x="64" y="84" width="60" height="8" class="kov-tmavy"/><circle cx="138" cy="74" r="12" class="bubinek"/>' },
    { id: 'archimedes', nazev: 'Archimédův šroub', ucel: 'dopr', proc: 'Otáčející se šroubovice v trubce vynáší vodu nahoru.',
      kresba: '<rect x="10" y="100" width="90" height="26" class="voda"/><g transform="rotate(-30 110 80)"><rect x="30" y="64" width="170" height="32" rx="6" class="sklo"/><path d="M40 96 L52 64 M60 96 L72 64 M80 96 L92 64 M100 96 L112 64 M120 96 L132 64 M140 96 L152 64 M160 96 L172 64 M180 96 L192 64" class="cara c-chod1"/></g>' },
    { id: 'mlynek', nazev: 'Mlýnek na maso', ucel: 'dopr', proc: 'Šnek uvnitř posouvá maso k nožům a sítku.',
      kresba: '<rect x="40" y="58" width="120" height="40" rx="10" class="kov"/><path d="M80 58 L70 22 H120 L110 58Z" class="kov"/><path d="M52 98 L62 58 M72 98 L82 58 M92 98 L102 58 M112 98 L122 58 M132 98 L142 58" class="cara c-chod1"/><rect x="160" y="62" width="10" height="32" class="kov-tmavy"/><path d="M40 78 H20 V40" class="cara silna c-kov"/>' },
  ];

  function tridicka() {
    const box = $('#tridicka'), stav = $('#tridicka-stav');
    if (!box) return;
    const karty = VECI.map(p => {
      const el = document.createElement('article');
      el.className = 'predmet-karta';
      el.dataset.predmet = p.id;
      el.innerHTML = `<svg viewBox="0 0 220 130" role="img" aria-label="${p.nazev}">${p.kresba}</svg>
        <h4>${p.nazev}</h4>
        <div class="volby-druhu" role="group" aria-label="K čemu je závit – ${p.nazev}">
          ${Object.entries(UCEL).map(([k, n]) => `<button type="button" data-ucel="${k}">${n}</button>`).join('')}
        </div>
        <p class="verdikt-druhu" aria-live="polite"></p>`;
      box.append(el);
      const hotovo = () => {
        el.classList.remove('chyba');
        el.classList.add('spravne', 'ukazano');
        $$('button', el).forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', String(b.dataset.ucel === p.ucel)); });
        $('.verdikt-druhu', el).innerHTML = `<b>✓ ${velke(UCEL[p.ucel])}.</b> ${p.proc}`;
      };
      $$('button', el).forEach(b => b.addEventListener('click', () => {
        if (b.dataset.ucel === p.ucel) {
          hotovo();
          Postup.data.hotovo['tr-' + p.id] = true;
          Postup.uloz();
        } else {
          el.classList.add('chyba', 'ukazano');
          b.disabled = true;
          $('.verdikt-druhu', el).innerHTML = '<b>✗ To tu není hlavní úkol závitu.</b> Co se stane, když šroubem otočíš?';
        }
        obnov();
        Ukoly.kontrola();
      }));
      return { p, el, hotovo };
    });
    const obnov = () => {
      const n = karty.filter(k => k.el.classList.contains('spravne')).length;
      stav.innerHTML = `Roztříděno správně: <b>${n} z ${karty.length}</b>`;
    };
    const nacti = () => {
      for (const k of karty) {
        k.el.classList.remove('spravne', 'chyba', 'ukazano');
        $$('button', k.el).forEach(b => { b.disabled = false; b.removeAttribute('aria-pressed'); });
        $('.verdikt-druhu', k.el).textContent = '';
        if (Postup.data.hotovo['tr-' + k.p.id]) k.hotovo();
      }
      obnov();
    };
    nacti();
    document.addEventListener('lekce:reset', nacti);
    Ukoly.definuj('kol-tridicka', () => karty.every(k => k.el.classList.contains('spravne')),
      'Závit umí čtyři věci: <b>spojit</b> (vrut, víčko), <b>znásobit sílu</b> (zvedák, lis), <b>přesně posunout</b> (mikrometr, mikroskop) a <b>dopravovat</b> (Archimédův šroub, mlýnek). Vždy jde o nakloněnou rovinu navinutou na válec.');
  }

  /* ================================================================
     7. Procvičování
     ================================================================ */
  /* Každý generátor vrací { zadani, obrazek?, moznosti: [{ t, ok?, proc? }], napoveda, vysvetleni }.
     Právě jedna možnost je správná, u chybných je zdůvodnění. Duplicitní texty se vyřadí. */
  const velke = t => t.charAt(0).toUpperCase() + t.slice(1);
  const N = (x, d = 1) => cisK(x, d) + ' N';

  const GENERATORY = [
    { id: 'stoupani', tema: 'popis', nazev: 'Rozteč a stoupání', gen() {
      const n = vyber([2, 3, 4]), P = vyber([1, 1.5, 2, 2.5, 3, 4]);
      return { zadani: `Závit je <b>${n}chodý</b> a má rozteč <b>P = ${mm(P, 1)}</b>. Jaké je jeho stoupání – o kolik se matice posune za jednu otáčku?`,
        moznosti: [{ t: mm(n * P, 1), ok: true },
          { t: mm(P, 1), proc: 'To je rozteč – vzdálenost sousedních vrcholů. U vícechodého závitu matice za otáčku přeskočí víc roztečí.' },
          { t: mm(P / n, 2), proc: 'Víc chodů posun zvětšuje, ne zmenšuje.' },
          { t: mm(n + P, 1), proc: 'Stoupání je součin: Pₕ = n · P.' }],
        napoveda: 'Pₕ = počet chodů · rozteč.',
        vysvetleni: `Pₕ = ${n} · ${mm(P, 1)} = ${mm(n * P, 1)}.` };
    } },
    { id: 'posun', tema: 'popis', nazev: 'Posun matice', gen() {
      const Ph = vyber([0.5, 1, 1.25, 1.5, 2, 3]), k = vyber([4, 6, 8, 10, 12, 20]);
      return { zadani: `Šroub má stoupání <b>${mm(Ph, 2)}</b>. O kolik se matice posune, když s ní otočíš <b>${k}×</b>?`,
        moznosti: [{ t: mm(k * Ph, 2), ok: true },
          { t: mm(Ph, 2), proc: 'O stoupání se matice posune za jednu otáčku. Otáček je ' + k + '.' },
          { t: mm(k / Ph, 2), proc: 'Posun = počet otáček · stoupání, nedělí se.' },
          { t: mm(k + Ph, 2), proc: 'Každá otáčka přidá jedno stoupání – násobí se.' }],
        napoveda: 'Za jednu otáčku se matice posune o stoupání.',
        vysvetleni: `${k} · ${mm(Ph, 2)} = ${mm(k * Ph, 2)}.` };
    } },
    { id: 'otacky', tema: 'popis', nazev: 'Počet otáček', gen() {
      const Ph = vyber([0.5, 1.5, 2, 2.5]), n = vyber([8, 10, 12, 16, 20]), s = n * Ph;
      return { zadani: `Vrut se stoupáním <b>${mm(Ph, 1)}</b> má zajet do dřeva o <b>${mm(s, 0)}</b>. Kolikrát jím musíš otočit?`,
        moznosti: [{ t: n + '×', ok: true },
          { t: cisK(s * Ph, 1) + '×', proc: 'Dráhu je potřeba stoupáním vydělit, ne vynásobit.' },
          { t: cisK(s, 0) + '×', proc: 'Jedna otáčka posune vrut o ' + mm(Ph, 1) + ', ne o 1 mm.' }],
        napoveda: 'Počet otáček = dráha : stoupání.',
        vysvetleni: `${mm(s, 0)} : ${mm(Ph, 1)} = ${n} otáček.` };
    } },
    { id: 'znacka', tema: 'popis', nazev: 'Značka závitu', gen() {
      return vyber([
        { zadani: 'Na sáčku se šrouby je napsáno <b>M12×1,75</b>. Co znamená číslo 1,75?',
          moznosti: [{ t: 'Rozteč (stoupání) závitu v milimetrech.', ok: true },
            { t: 'Průměr šroubu v centimetrech.', proc: 'Průměr je číslo hned za M – 12 mm.' },
            { t: 'Délku šroubu v centimetrech.', proc: 'Délka se píše zvlášť, třeba M12×1,75×60.' },
            { t: 'Počet závitů na centimetr.', proc: 'Metrický závit se popisuje roztečí v mm, ne počtem závitů.' }],
          napoveda: 'M = metrický, 12 = velký průměr v mm.',
          vysvetleni: 'M12×1,75: metrický závit, velký průměr 12 mm, rozteč 1,75 mm.' },
        { zadani: 'Co znamená značka <b>Tr24×10(P5)</b>?',
          moznosti: [{ t: 'Lichoběžníkový dvouchodý závit: stoupání 10 mm, rozteč 5 mm.', ok: true },
            { t: 'Lichoběžníkový závit s deseti chody.', proc: 'Počet chodů = stoupání : rozteč = 10 : 5 = 2.' },
            { t: 'Trubkový závit dlouhý 10 cm.', proc: 'Tr znamená lichoběžníkový (trapézový) profil.' }],
          napoveda: 'Za × je stoupání, v závorce rozteč.',
          vysvetleni: 'Tr = lichoběžníkový profil 30°, 24 mm průměr, Pₕ = 10 mm, P = 5 mm → dva chody.' },
        { zadani: 'Co znamená <b>LH</b> na konci značky závitu (např. M10 LH)?',
          moznosti: [{ t: 'Levý závit – utahuje se proti směru hodinových ručiček.', ok: true },
            { t: 'Lehký šroub z hliníku.', proc: 'LH je z angličtiny left hand – levý závit.' },
            { t: 'Dlouhý šroub.', proc: 'LH = levý závit (left hand).' }],
          napoveda: 'Left hand.',
          vysvetleni: 'LH = levý závit. Bez označení je závit pravý.' },
      ]);
    } },
    { id: 'rovina', tema: 'rovina', nazev: 'Závit a nakloněná rovina', gen() {
      return vyber([
        { zadani: 'Čím je závit z hlediska jednoduchých strojů?',
          moznosti: [{ t: 'Nakloněnou rovinou navinutou na válec.', ok: true },
            { t: 'Pákou.', proc: 'Páka se otáčí kolem osy; závit vznikne navinutím nakloněné roviny.' },
            { t: 'Kladkou.', proc: 'Kladka je kolo s lanem. Závit je navinutá nakloněná rovina.' },
            { t: 'Klínem.', proc: 'Klín jsou dvě nakloněné roviny zády k sobě, závit je jedna navinutá na válec.' }],
          napoveda: 'Zkus si obtočit papírový trojúhelník kolem tužky.',
          vysvetleni: 'Přepona papírového trojúhelníku navinutá na tužku dá šroubovici – závit.' },
        { zadani: 'Rozvineš jeden závit šroubu do roviny. Co vznikne?',
          moznosti: [{ t: 'Pravoúhlý trojúhelník – základna je obvod šroubu, výška stoupání.', ok: true },
            { t: 'Obdélník, jehož strany jsou průměr a délka šroubu.', proc: 'Jeden závit je jedna otáčka: vodorovně obvod, svisle stoupání.' },
            { t: 'Kružnice.', proc: 'Kružnice by vznikla bez stoupání. Závit při otáčce i stoupá.' }],
          napoveda: 'Za jednu otáčku urazíš obvod a vystoupáš o stoupání.',
          vysvetleni: 'Základna = π · d, výška = stoupání, přepona = rozvinutý závit (nakloněná rovina).' },
      ]);
    } },
    { id: 'strmost', tema: 'rovina', nazev: 'Strmost závitu', gen() {
      const a = { d: vyber([10, 20, 30]), P: vyber([1, 1.5, 2]) };
      const b = { d: a.d, P: a.P * vyber([2, 3]) };
      const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
      const ok = x.P > y.P ? 'A' : 'B';
      return { zadani: `Šroub A má průměr ${mm(x.d, 0)} a stoupání ${mm(x.P, 1)}, šroub B průměr ${mm(y.d, 0)} a stoupání ${mm(y.P, 1)}. Který má <b>strmější</b> závit (větší úhel stoupání)?`,
        moznosti: [{ t: 'Šroub ' + ok, ok: true },
          { t: 'Šroub ' + (ok === 'A' ? 'B' : 'A'), proc: 'Při stejném obvodu je strmější ten, který za otáčku vystoupá výš.' },
          { t: 'Oba stejně – mají stejný průměr.', proc: 'Úhel závisí na poměru stoupání a obvodu. Stoupání se liší.' }],
        napoveda: 'Nakloněná rovina: základna π · d, výška stoupání.',
        vysvetleni: `Obvod mají stejný, šroub ${ok} ale za otáčku vystoupá výš – jeho nakloněná rovina je strmější.` };
    } },
    { id: 'sila', tema: 'sila', nazev: 'Síla na klice', gen() {
      const [Q, Ph, R] = vyber([[10000, 4, 25], [6280, 5, 20], [12560, 2, 40], [3140, 4, 10], [9420, 3, 30], [5000, 2, 10]]);
      const F = Q * Ph / 1000 / (2 * Math.PI * R / 100);
      return { zadani: `Zvedák má stoupání <b>${mm(Ph, 0)}</b> a kliku dlouhou <b>R = ${cm(R, 0)}</b>. Jakou silou točíš, když zvedáš <b>${sila(Q, 0)}</b>? (Tření zanedbej.)`,
        moznosti: [{ t: N(F, 0), ok: true },
          { t: N(F * 100, 0), proc: 'Jednotky: stoupání i kliku dosaď v metrech (4 mm = 0,004 m, 25 cm = 0,25 m).' },
          { t: N(Q * Ph / 1000 / (R / 100), 0), proc: 'Ruka za otáčku urazí celý obvod kruhu 2πR, ne jen R.' },
          { t: N(Q, 0), proc: 'Závit sílu zmenšuje – stejně jako nakloněná rovina.' }],
        napoveda: 'Zlaté pravidlo pro jednu otáčku: F · 2πR = Q · Pₕ.',
        vysvetleni: `F = ${sila(Q, 0)} · ${metry(Ph / 1000, 3)} : (2π · ${metry(R / 100, 2)}) ≈ ${N(F, 0)}.` };
    } },
    { id: 'vyhoda', tema: 'sila', nazev: 'Kolikrát menší síla', gen() {
      const R = vyber([10, 20, 30]), Ph = vyber([2, 4, 5]), k = 2 * Math.PI * R * 10 / Ph;
      return { zadani: `Klika je dlouhá <b>${cm(R, 0)}</b>, stoupání závitu je <b>${mm(Ph, 0)}</b>. Kolikrát menší silou točíš, než je tíha břemene (bez tření)?`,
        moznosti: [{ t: 'asi ' + cisK(Math.round(k), 0) + '×', ok: true },
          { t: 'asi ' + cisK(Math.round(R * 10 / Ph), 0) + '×', proc: 'Ruka za otáčku opíše celý kruh – obvod 2πR, ne jen poloměr.' },
          { t: 'asi ' + cisK(Math.round(R / Ph), 0) + '×', proc: 'Délky musí být ve stejných jednotkách: ' + cm(R, 0) + ' = ' + mm(R * 10, 0) + '.' },
          { t: 'stejnou silou', proc: 'Šroub je nakloněná rovina – sílu zmenšuje.' }],
        napoveda: 'Poměr dráhy ruky za otáčku (2πR) a stoupání.',
        vysvetleni: `2π · ${mm(R * 10, 0)} : ${mm(Ph, 0)} ≈ ${cisK(Math.round(k), 0)}.` };
    } },
    { id: 'zlate', tema: 'sila', nazev: 'Zlaté pravidlo', gen() {
      return vyber([
        { zadani: 'Zvedák zvedne auto, i když na kliku tlačíš jen silou 25 N. Čím za to „platíš“?',
          moznosti: [{ t: 'Dlouhou dráhou ruky – musíš udělat hodně otáček.', ok: true },
            { t: 'Ničím, zvedák práci ušetří.', proc: 'Žádný jednoduchý stroj práci neušetří: F · s je bez tření stejné.' },
            { t: 'Tím, že auto zvedne rychleji.', proc: 'Naopak – auto stoupá velmi pomalu, jen o stoupání za otáčku.' }],
          napoveda: 'Práce = síla · dráha.',
          vysvetleni: 'Zlaté pravidlo mechaniky: F · 2πR = Q · Pₕ. Malá síla, ale dlouhá dráha.' },
        { zadani: 'Co se stane se silou na klice, když <b>zdvojnásobíš délku kliky</b>?',
          moznosti: [{ t: 'Klesne na polovinu.', ok: true },
            { t: 'Zdvojnásobí se.', proc: 'Delší klika = delší dráha ruky za otáčku = menší síla.' },
            { t: 'Nezmění se, rozhoduje jen závit.', proc: 'Síla závisí na stoupání i na délce kliky: F = Q · Pₕ / (2πR).' }],
          napoveda: 'F = Q · Pₕ / (2πR).',
          vysvetleni: 'R je ve jmenovateli: dvojnásobná klika – poloviční síla.' },
      ]);
    } },
    { id: 'samo', tema: 'samo', nazev: 'Samosvornost', gen() {
      const [a, mu, nazev] = vyber([[3, 0.15, 'ocel na sucho'], [3, 0.1, 'ocel s olejem'], [5, 0.05, 'mazaná ocel'], [15, 0.15, 'ocel na sucho'], [2, 0.05, 'mazaná ocel'], [20, 0.3, 'dřevo']]);
      const fi = Math.atan(mu) / RAD, drzi = a <= fi;
      return { zadani: `Závit má úhel stoupání <b>${a}°</b>. Materiál: ${nazev}, úhel tření je asi <b>${stup(fi)}</b>. Udrží zatížený šroub sám?`,
        moznosti: [{ t: 'Ano, je samosvorný.', ok: drzi, proc: drzi ? '' : 'Úhel stoupání je větší než úhel tření – sklouzávací síla přemůže tření.' },
          { t: 'Ne, sám se roztočí zpátky.', ok: !drzi, proc: drzi ? 'Úhel stoupání je menší než úhel tření – tření sklouzávací sílu udrží.' : '' },
          { t: 'Záleží na délce kliky.', proc: 'Klika jen mění sílu ruky. Jestli šroub drží, rozhoduje úhel stoupání a tření.' }],
        napoveda: 'Šroub drží sám, když je úhel stoupání menší než úhel tření.',
        vysvetleni: drzi ? `${a}° < ${stup(fi)} – závit je samosvorný.` : `${a}° > ${stup(fi)} – závit není samosvorný.` };
    } },
    { id: 'samo-koncept', tema: 'samo', nazev: 'Tření v závitu', gen() {
      return vyber([
        { zadani: 'Proč se šroub, který drží poličku, sám nepovolí?',
          moznosti: [{ t: 'Závit je mírná nakloněná rovina a tření ho udrží.', ok: true },
            { t: 'Pravý závit se povolovat nemůže.', proc: 'Povolit se dá každý závit – jen tomu brání tření.' },
            { t: 'Šroub drží magnetismus.', proc: 'Drží ho tření v závitu a pod hlavou šroubu.' }],
          napoveda: 'Samosvornost.',
          vysvetleni: 'Úhel stoupání běžného šroubu (2–4°) je menší než úhel tření – závit je samosvorný.' },
        { zadani: 'Samosvorný závit (zvedák, svěrák) má účinnost…',
          moznosti: [{ t: 'vždycky pod 50 %.', ok: true },
            { t: 'vždycky přes 90 %.', proc: 'Tak účinné jsou jen kuličkové šrouby – ty ale samy nedrží.' },
            { t: 'přesně 100 %, protože drží.', proc: 'Drží právě díky tření, které část práce mění v teplo.' }],
          napoveda: 'Aby závit držel, musí být tření velké.',
          vysvetleni: 'Tření, které šroub udrží, spotřebuje víc než polovinu vykonané práce.' },
        { zadani: 'Proč má <b>levý pedál</b> jízdního kola levý závit?',
          moznosti: [{ t: 'Aby se šlapáním neuvolňoval, ale spíš dotahoval.', ok: true },
            { t: 'Aby se dal snáz sundat.', proc: 'Jde o to, aby se pedál za jízdy sám nepovolil.' },
            { t: 'Kvůli úspoře materiálu.', proc: 'Levý a pravý závit spotřebují stejně materiálu.' }],
          napoveda: 'Pedál se v klice otáčí určitým směrem.',
          vysvetleni: 'Na levé straně by se pravý závit při šlapání postupně povoloval. Levý závit se naopak dotahuje.' },
      ]);
    } },
    { id: 'mikrometr', tema: 'mikro', nazev: 'Odečti mikrometr', gen() {
      const cele = vyber([2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 21]), pul = Math.random() < 0.5 ? 0.5 : 0, dil = 3 + Math.floor(Math.random() * 44);
      const x = r2(cele + pul + dil / 100);
      return { zadani: 'Kolik ukazuje mikrometr? (Stoupání 0,5 mm, bubínek 50 dílků.)', obrazek: svgMikrometr(x),
        moznosti: [{ t: mm(x, 2), ok: true },
          { t: mm(pul ? x - 0.5 : x + 0.5, 2), proc: pul ? 'Pod linkou je odkrytá půlmilimetrová čárka – přičti 0,5 mm.' : 'Pod linkou ještě není vidět další půlmilimetrová čárka.' },
          { t: mm(cele + pul + dil / 10, 1), proc: 'Dílek bubínku je setina milimetru, ne desetina.' }],
        napoveda: 'Milimetry nad linkou + půlmilimetr pod linkou + dílky bubínku · 0,01 mm.',
        vysvetleni: `${mm(cele + pul, 1)} + ${dil} · 0,01 mm = ${mm(x, 2)}.` };
    } },
    { id: 'mikro-koncept', tema: 'mikro', nazev: 'Mikrometr', gen() {
      return vyber([
        { zadani: 'Proč má mikrometr závit s malým stoupáním (0,5 mm)?',
          moznosti: [{ t: 'Velké otočení bubínkem dá nepatrný posun – dá se jemně nastavit a přesně odečíst.', ok: true },
            { t: 'Aby se vřeteno pohybovalo co nejrychleji.', proc: 'Rychlost tu nevadí – jde o přesnost.' },
            { t: 'Aby se nedal poškodit.', proc: 'Malé stoupání slouží k přesnosti: 1 dílek = 0,01 mm.' }],
          napoveda: 'Jedna otáčka = 0,5 mm.',
          vysvetleni: 'Otáčku lze rozdělit na 50 dílků, takže dílek je 0,01 mm.' },
        { zadani: 'Bubínek mikrometru otočíš o <b>dvě celé otáčky</b>. O kolik se posune vřeteno (stoupání 0,5 mm)?',
          moznosti: [{ t: '1 mm', ok: true }, { t: '0,5 mm', proc: 'O 0,5 mm se posune za jednu otáčku.' }, { t: '0,02 mm', proc: '0,01 mm je jeden dílek, ne otáčka.' }],
          napoveda: 'Posun = otáčky · stoupání.',
          vysvetleni: '2 · 0,5 mm = 1 mm.' },
      ]);
    } },
    { id: 'urci', tema: 'prakt', nazev: 'Urči šroub', gen() {
      const i = 1 + Math.floor(Math.random() * (ZAVITY_M.length - 2)), [z, d, P] = ZAVITY_M[i];
      const [z1, d1] = ZAVITY_M[i - 1], [z2, , P2] = ZAVITY_M[i + 1];
      return { zadani: `Posuvné měřítko ukázalo průměr <b>${mm(skutecnyPrumer(d), 2)}</b> a závitová měrka sedí s lístkem <b>${cisK(P, 2)}</b>. Jaký je to šroub?`,
        moznosti: [{ t: z, ok: true },
          { t: z1, proc: `${z1} má průměr jen ${d1} mm. Skutečný šroub bývá o kousek tenčí než jmenovitý – zaokrouhli nahoru.` },
          { t: z2, proc: `${z2} je výrazně silnější a má rozteč ${cisK(P2, 2)} mm.` },
          { t: 'M' + cisK(P * 10, 0), proc: 'Číslo za M je průměr v milimetrech, ne rozteč.' }],
        napoveda: 'Průměr zaokrouhli nahoru na nejbližší velikost M, rozteč ověř v tabulce.',
        vysvetleni: `${z}: jmenovitý průměr ${d} mm, hrubá rozteč ${cisK(P, 2)} mm. Naměřený průměr je o vůli menší.` };
    } },
    { id: 'moment', tema: 'prakt', nazev: 'Moment při utahování', gen() {
      const F = vyber([50, 80, 100, 150, 200, 250]), r = vyber([10, 15, 20, 25, 30, 40]), M = F * r / 100;
      return { zadani: `Utahuješ matici klíčem a táhneš silou <b>${F} N</b> ve vzdálenosti <b>${r} cm</b> od osy šroubu. Jaký moment vyvineš?`,
        moznosti: [{ t: cisK(M, 1) + ' N·m', ok: true },
          { t: cisK(F * r, 0) + ' N·m', proc: 'Rameno dosaď v metrech: ' + r + ' cm = ' + cisK(r / 100, 2) + ' m.' },
          { t: cisK(F / (r / 100), 0) + ' N·m', proc: 'Moment je součin síly a ramene, ne podíl.' },
          { t: cisK(F, 0) + ' N·m', proc: 'Moment závisí i na délce klíče: M = F · r.' }],
        napoveda: 'M = F · r, rameno v metrech.',
        vysvetleni: `M = ${F} N · ${cisK(r / 100, 2)} m = ${cisK(M, 1)} N·m.` };
    } },
    { id: 'utahovani', tema: 'prakt', nazev: 'Utahování šroubů', gen() {
      return vyber([
        { zadani: 'Proč se důležité šrouby (kola auta, hlava motoru) utahují <b>momentovým klíčem</b>?',
          moznosti: [{ t: 'Aby síla ve šroubu nebyla malá (povolil by se), ani velká (praskl by).', ok: true },
            { t: 'Aby se utáhly co nejvíc.', proc: 'Příliš utažený šroub se natáhne nebo praskne.' },
            { t: 'Protože obyčejným klíčem šroub utáhnout nejde.', proc: 'Jde, ale „od oka“ nepoznáš, kolik je dost.' }],
          napoveda: 'Utažený šroub je napnutý jako pružina.',
          vysvetleni: 'Momentový klíč cvakne při nastaveném momentu, takže předpětí šroubu vyjde správně.' },
        { zadani: 'Šroub <b>M6</b> utáhneš momentem, který je správný pro <b>M12</b>. Co se nejspíš stane?',
          moznosti: [{ t: 'Šroub se přetrhne.', ok: true },
            { t: 'Bude držet lépe.', proc: 'M6 má asi čtyřikrát menší průřez než M12 – tak velkou sílu neunese.' },
            { t: 'Nic, moment se rozloží do matice.', proc: 'Matice se točí dál a šroub se natahuje, dokud nepraskne.' }],
          napoveda: 'Menší šroub = menší průřez = menší síla, kterou vydrží.',
          vysvetleni: 'M6 snese asi 10 N·m, M12 asi 85 N·m. Moment pro M12 by M6 přetrhl.' },
        { zadani: 'Proč jsou klíče na malé šrouby <b>krátké</b>?',
          moznosti: [{ t: 'Krátkým klíčem malý šroub rukou tak snadno nepřetáhneš.', ok: true },
            { t: 'Aby se ušetřil materiál.', proc: 'Hlavní důvod je bezpečnost šroubu: M = F · r.' },
            { t: 'Krátký klíč dá větší moment.', proc: 'Kratší rameno dá při stejné síle menší moment.' }],
          napoveda: 'M = F · r.',
          vysvetleni: 'Délka klíče roste s velikostí šroubu – moment, který ruka vyvine, pak zhruba odpovídá tomu, co šroub snese.' },
        { zadani: 'Čím nejsnáz zjistíš <b>rozteč</b> závitu neznámého šroubu?',
          moznosti: [{ t: 'Závitovou měrkou – hledáš lístek, který zapadne bez mezer.', ok: true },
            { t: 'Posuvným měřítkem přes vrcholy závitu.', proc: 'Tak změříš průměr, ne rozteč.' },
            { t: 'Zvážením šroubu.', proc: 'Hmotnost o rozteči nic neříká.' }],
          napoveda: 'Hřebínek s lístky, na každém je číslo v mm.',
          vysvetleni: 'Na lístku, který sedí, je rozteč v milimetrech. Průměr se měří posuvným měřítkem.' },
      ]);
    } },
  ];
  const TEMATA = [['vse', 'Vše'], ['rovina', 'Závit a rovina'], ['popis', 'Popis závitu'], ['prakt', 'Šrouby v praxi'], ['sila', 'Síla a zlaté pravidlo'], ['samo', 'Samosvornost'], ['mikro', 'Mikrometr']];

  const Procvic = {
    tema: 'vse', otazka: null, posledni: null, skore: null,
    init() {
      const t = $('#cv-temata');
      if (!t || typeof Uloha === 'undefined') return;
      t.innerHTML = TEMATA.map(([id, n]) => `<button type="button" data-tema="${id}" aria-pressed="${id === this.tema}">${n}</button>`).join('');
      $$('button', t).forEach(b => b.addEventListener('click', () => {
        this.tema = b.dataset.tema;
        $$('button', t).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        this.nova();
      }));
      this.skore = Uloha.skore('metodus_zavity_lekce_skore', $('#cv-skore'));
      $('#btnNapoveda').addEventListener('click', () => { $('#cv-napoveda').hidden = false; $('#btnNapoveda').disabled = true; });
      $('#btnDalsi').addEventListener('click', () => this.nova());
      $('.cviceni').addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea, select')) return;
        const b = $$('#cv-moznosti .moznosti button')[Number(e.key) - 1];
        if (b && !b.disabled) { e.preventDefault(); b.click(); }
      });
      this.nova();
    },
    vygeneruj() {
      const nabidka = GENERATORY.filter(g => this.tema === 'vse' || g.tema === this.tema);
      for (let pokus = 0; pokus < 40; pokus++) {
        const jine = nabidka.filter(x => x.id !== this.posledni);
        const g = vyber(jine.length ? jine : nabidka);
        const q = g.gen();
        if (!q) continue;
        const videno = new Set();
        q.moznosti = q.moznosti.filter(m => !videno.has(m.t) && videno.add(m.t));
        if (q.moznosti.length >= 3 && q.moznosti.filter(m => m.ok).length === 1) { q.generator = g; return q; }
      }
      return null;
    },
    nova() {
      const q = this.vygeneruj();
      if (!q) return;
      this.otazka = q; this.posledni = q.generator.id;
      $('#cv-tema').textContent = q.generator.nazev;
      $('#cv-zadani').innerHTML = q.zadani;
      const obr = $('#cv-obrazek');
      obr.hidden = !q.obrazek;
      obr.innerHTML = q.obrazek || '';
      if (q.obrazek) requestAnimationFrame(() => { const s = $('svg', obr); if (s && s.clientWidth) s.style.setProperty('--k', (s.viewBox.baseVal.width / s.clientWidth).toFixed(3)); });
      const napoveda = $('#cv-napoveda');
      napoveda.hidden = true;
      napoveda.textContent = '💡 ' + q.napoveda;
      $('#btnNapoveda').disabled = false;
      const odezva = $('#cv-odezva');
      odezva.className = 'odezva';
      odezva.textContent = '';
      const moz = $('#cv-moznosti');
      moz.replaceChildren();
      const poradi = zamichej(q.moznosti);
      Uloha.vyber({
        kam: moz, odezva,
        moznosti: poradi.map((m, i) => ({ klic: String(i), popis: m.t, ikona: String(i + 1) })),
        spravnyKlic: String(poradi.findIndex(m => m.ok)),
        zpravaOk: '✅ Správně. ' + q.vysvetleni,
        zpravaChyba: klic => '✗ ' + (poradi[Number(klic)].proc || 'Tohle není ono.') + ' Zkus jinou možnost.',
        poSpravne: napoprve => { this.skore.vyhodnot(napoprve); $('#btnNapoveda').disabled = true; },
        dalsi: () => this.nova(),
        prodleva: () => Math.min(9000, 1600 + q.vysvetleni.length * 28),
      });
    },
  };

  /* ================================================================
     Start
     ================================================================ */
  function start() {
    for (const f of [modelNavin, modelProfil, modelUrci, modelZvedak, modelSamo, modelUtah, modelMikrometr, modelDilna, tridicka]) {
      try { f(); } catch (e) { console.error('Model se nepodařilo spustit:', f.name, e); }
    }
    Navigace.init();
    odkazyNaLekce();
    Procvic.init();
    Model.vsechny.forEach(m => m.naplanuj());
  }
  window.addEventListener('metodus-theme', () => Model.vsechny.forEach(m => m.naplanuj()));
  window.ZavityLekce = { MODELY, Ukoly, Postup, Model, GENERATORY, VECI, STROJE, ZAVITY_M, SROUBY_88, get Procvic() { return Procvic; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
