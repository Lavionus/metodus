/* ============================================================
   vitr_lekce.js – interaktivní výklad „Vítr a proudění vzduchu“.

   Stavba (kostra je stejná jako u optika_lekce.js):
     1. pomůcky (čísla, kreslení do SVG)
     2. Model – obrázek s úchopy (tažení myší, dotykem i klávesnicí)
     3. Úkoly a předpovědi (postup se ukládá do localStorage)
     4. Navigace (osnova, čipy, mapa lekce)
     5. Větrný tunel – mřížkový Boltzmannův model (D2Q9) na plátně
     6. Modely jednotlivých kapitol
     7. Procvičování (otázky pro fázi Procvič a Ověř se)
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
  /* Pseudonáhoda se semínkem – stejné rozmístění při každém načtení. */
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
  const velke = t => t.charAt(0).toUpperCase() + t.slice(1);
  const svetly = () => document.documentElement.dataset.tone === 'light';


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
  const KLIC = 'metodus_vitr_lekce';
  const Postup = (() => {
    const data = { hotovo: {}, tipy: {} };
    try {
      const d = JSON.parse(localStorage.getItem(KLIC) || 'null');
      if (d && typeof d === 'object') { Object.assign(data.hotovo, d.hotovo || {}); Object.assign(data.tipy, d.tipy || {}); }
    } catch { /* bez úložiště začínáme vždy znovu */ }
    const uloz = () => { try { localStorage.setItem(KLIC, JSON.stringify(data)); } catch { /* bez paměti */ } };
    return {
      data, uloz,
      smaz() { for (const k in data.hotovo) delete data.hotovo[k]; for (const k in data.tipy) delete data.tipy[k]; uloz(); },
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
      if (r && u.reakce) r.innerHTML = u.reakce;
      if (nove) { Postup.data.hotovo[u.id] = true; Postup.uloz(); Navigace.obnov(); }
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
  const IKONY = {
    pricina: '<rect x="0" y="44" width="78" height="16" class="more"/><rect x="78" y="42" width="82" height="18" class="zeme"/><path class="cara c-proud" d="M30 36 H126 Q134 36 134 28 V18 Q134 10 126 10 H34 Q26 10 26 18 V28"/><path class="vypln c-proud" d="M120 31 L130 36 L120 41Z"/><circle cx="146" cy="10" r="7" fill="#ffcf4d"/>',
    sila: '<rect x="0" y="54" width="160" height="6" class="zeme"/><path d="M44 54 Q46 36 56 20" stroke="#7a5634" stroke-width="5" fill="none"/><circle cx="60" cy="18" r="12" class="koruna"/><circle cx="72" cy="24" r="9" class="koruna"/><path d="M118 54 V10" stroke="var(--text-muted)" stroke-width="2.5"/><path d="M118 12 L150 16 L150 24 L118 22Z" class="vlajka"/>',
    obtekani: '<circle cx="62" cy="30" r="13" class="teleso"/><path class="cara c-proud" d="M4 8 H40 Q62 2 84 8 H156 M4 18 H36 Q62 4 88 18 H156 M4 42 H36 Q62 56 88 42 H156 M4 52 H40 Q62 58 84 52 H156"/><path class="vir" d="M96 24 a6 6 0 1 1 6 6 M110 36 a6 6 0 1 0 6 -6"/>',
    odpor: '<rect x="44" y="12" width="7" height="36" class="teleso"/><path class="cara c-proud" d="M4 18 H36 M4 30 H36 M4 42 H36"/><path class="cara c-odpor" d="M52 30 H120"/><path class="vypln c-odpor" d="M118 23 L132 30 L118 37Z"/>',
    tlak: '<path class="stena" d="M4 6 H50 Q80 22 110 6 H156 V12 H110 Q80 28 50 12 H4Z"/><path class="stena" d="M4 54 H50 Q80 38 110 54 H156 V48 H110 Q80 32 50 48 H4Z"/><path class="cara c-proud" d="M8 30 H40 M68 30 H96 M120 30 H152"/><circle cx="82" cy="30" r="2.5" class="vypln c-odpor"/>',
    kridlo: '<path class="teleso" d="M20 38 C30 22 80 20 140 34 C90 38 40 44 20 38Z"/><path class="cara c-vztlak" d="M64 30 V6"/><path class="vypln c-vztlak" d="M58 10 L64 0 L70 10Z"/><path class="cara tenka c-proud" d="M2 20 Q70 6 158 28 M2 50 Q70 50 158 42"/>',
    stavby: '<rect x="0" y="54" width="160" height="6" class="zeme"/><path class="teleso" d="M40 54 V30 L56 18 L72 30 V54Z"/><path class="cara c-proud" d="M2 26 Q40 6 80 12 H158 M2 40 H30"/><path class="vir" d="M86 40 a8 8 0 1 0 8 -8"/>',
  };

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
     5. Větrný tunel
     Mřížkový Boltzmannův model D2Q9 (stejná fyzika jako vitr_tunel.html):
     v každé buňce se sleduje, kolik vzduchu teče kterým z devíti směrů.
     Tunel má pevnou mřížku (sloupce × řádky); plátno ji jen roztáhne,
     takže výpočet stojí na telefonu i na projektoru stejně.
     Okraje drží nastavený vítr, tlumicí pásmo u nich pohlcuje víry.
     Pevné buňky: 1 = překážka (počítá se do odporu), 2 = zem a sníh.
     ================================================================ */
  const EX = [0, 1, 0, -1, 0, 1, -1, -1, 1];
  const EY = [0, 0, -1, 0, 1, -1, -1, 1, 1];      // +1 = dolů
  const WQ = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
  const OMEGA = { vzduch: 1.92, med: 0.8 };      // návrat k rovnováze: blízko 2 = malé tření

  /* Barevná stupnice rychlosti (0 = stojí, 0,5 = vítr, 1 = dvojnásobek větru). */
  const STUPNICE = [[0, [8, 20, 48]], [0.25, [20, 72, 124]], [0.5, [34, 150, 160]], [0.75, [250, 206, 80]], [1, [255, 110, 60]]];
  const LUT = (() => {
    const t = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const x = i / 255;
      let j = 0; while (j < STUPNICE.length - 2 && x > STUPNICE[j + 1][0]) j++;
      const [x0, a] = STUPNICE[j], [x1, b] = STUPNICE[j + 1], u = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
      for (let k = 0; k < 3; k++) t[i * 3 + k] = a[k] + (b[k] - a[k]) * u;
    }
    return t;
  })();
  const gradientCSS = () => 'linear-gradient(90deg,' + STUPNICE.map(([x, c]) => `rgb(${c.join(',')}) ${x * 100}%`).join(',') + ')';

  /* Tvary v mřížkových souřadnicích */
  const kruh = (cx, cy, r, n = 48) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
  const obdelnik = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  function kapka(x0, cy, delka, tl) {                    // proudnicové těleso (profil NACA 00xx)
    const t = tl / delka, horni = [], dolni = [];
    for (let i = 0; i <= 40; i++) {
      const u = (i / 40) ** 1.6, y = 5 * t * delka * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1036 * u ** 4);
      horni.push([x0 + u * delka, cy - y]); dolni.unshift([x0 + u * delka, cy + y]);
    }
    return horni.concat(dolni.slice(1, -1));
  }
  function uvnitr(p, poly) {
    let v = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) v = !v;
    }
    return v;
  }

  class Tunel {
    constructor(id, cfg) {
      this.fig = document.getElementById(id);
      this.canvas = $('canvas', this.fig);
      this.ctx = this.canvas.getContext('2d');
      this.C = cfg.cols; this.R = cfg.rows; this.U = cfg.U || 0.1;
      this.sceny = cfg.sceny;
      this.cfg = cfg;
      this.s = { scena: cfg.vychozi, rezim: 'proudnice', tekutina: 'vzduch', nastroj: 'sonda', snih: false, bezi: true };
      this.sonda = { x: cfg.sonda[0], y: cfg.sonda[1], hodnota: 1, platna: false };
      this.odecty = $('.odecty', this.fig);
      this.zprava = $('.obr-zprava', this.fig);
      this.legenda = $('.tunel-legenda', this.fig);
      this.canvas.style.aspectRatio = `${this.C} / ${this.R}`;
      const n = this.C * this.R;
      this.f = []; this.f2 = [];
      for (let k = 0; k < 9; k++) { this.f.push(new Float32Array(n)); this.f2.push(new Float32Array(n)); }
      this.rho = new Float32Array(n); this.ux = new Float32Array(n); this.uy = new Float32Array(n);
      this.pevne = new Uint8Array(n); this.kresba = new Uint8Array(n); this.snihBunky = new Uint8Array(n);
      this.sponge = new Float32Array(n);
      this.kour = new Float32Array(n); this.kour2 = new Float32Array(n); this.kourJe = false;
      this.pom = document.createElement('canvas'); this.pom.width = this.C; this.pom.height = this.R;
      this.pctx = this.pom.getContext('2d'); this.img = this.pctx.createImageData(this.C, this.R);
      this.vrstva = document.createElement('canvas'); this.vrstva.width = this.C; this.vrstva.height = this.R;
      this.vctx = this.vrstva.getContext('2d'); this.vimg = this.vctx.createImageData(this.C, this.R);
      this.vrstvaPlatna = false;
      this.vlecky = []; this.vleckaId = 0;
      this.vlocky = []; this.vyskaSnehu = new Uint16Array(this.C); this.napadano = new Uint8Array(this.C);
      this.msKrok = 1; this.kroku = 4;
      this.viditelny = false;
      this.fx = 0; this.fyR = 0; this.fyP = 0; this.stridani = 0; this.znamenko = 0;
      this.krokuOdZmeny = 0;
      this.namereno = {};
      this.ovladani();
      this.postav();
      this.restart();
      this.zmerPlatno();
      if ('ResizeObserver' in window) new ResizeObserver(() => this.zmerPlatno()).observe(this.canvas);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(z => { this.viditelny = z[z.length - 1].isIntersecting; if (this.viditelny) Tunel.spust(); }, { rootMargin: '60px' }).observe(this.canvas);
      } else this.viditelny = true;
      Tunel.vsechny.push(this);
    }

    /* ---------- stavba scény ---------- */
    get scena() { return this.sceny[this.s.scena]; }
    postav() {
      const C = this.C, R = this.R, sc = this.scena;
      this.pevne.fill(0); this.kresba.fill(0); this.snihBunky.fill(0);
      this.vyskaSnehu.fill(0); this.napadano.fill(0); this.vlocky.length = 0; this.uP = null;
      this.zemVyska = sc.zem || 0;
      for (let y = R - this.zemVyska; y < R; y++) for (let x = 0; x < C; x++) this.pevne[y * C + x] = 2;
      for (const t of sc.telesa) {
        let x0 = C, x1 = 0, y0 = R, y1 = 0;
        for (const [x, y] of t.body) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(R - 1, Math.ceil(y1)); y++)
          for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(C - 1, Math.ceil(x1)); x++)
            if (uvnitr([x + 0.5, y + 0.5], t.body)) this.pevne[y * C + x] = t.zem ? 2 : 1;
      }
      // tlumicí pásmo: síla roste ke kraji; u scén se zemí se spodní okraj netlumí
      this.sponge.fill(0);
      const pasmo = Math.max(6, Math.round(Math.min(C, R) * 0.1));
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const okraj = this.zemVyska ? Math.min(x, y, C - 1 - x) : Math.min(x, y, C - 1 - x, R - 1 - y);
        if (okraj >= pasmo) continue;
        const t = (pasmo - okraj) / pasmo;
        this.sponge[y * C + x] = 0.5 * t * t;
      }
      this.vrstvaPlatna = false;
      this.zmena();
    }
    zmena() {
      this.krokuOdZmeny = 0; this.stridani = 0; this.znamenko = 0;
      this.sonda.platna = false;
    }
    restart() {
      for (let i = 0, n = this.C * this.R; i < n; i++) { this.rovnovaha(i, 1, this.U, 0); this.kour[i] = 0; }
      this.kourJe = false;
      this.vlecky.length = 0;
      this.fx = this.fyR = this.fyP = 0;
      this.zmena();
    }
    rovnovaha(i, r, vx, vy) {
      const u2 = 1.5 * (vx * vx + vy * vy);
      for (let k = 0; k < 9; k++) {
        const eu = 3 * (EX[k] * vx + EY[k] * vy);
        this.f[k][i] = WQ[k] * r * (1 + eu + 0.5 * eu * eu - u2);
      }
    }
    get ustaleno() { return this.krokuOdZmeny > 0.8 * this.C / this.U; }

    /* ---------- jeden krok fyziky (smyčky ručně rozepsané kvůli rychlosti) ---------- */
    krok() {
      const C = this.C, R = this.R, n = C * R, U = this.U, pevne = this.pevne, sponge = this.sponge;
      const rho = this.rho, ux = this.ux, uy = this.uy, omega = (this.cfg.omega || OMEGA)[this.s.tekutina];
      const [f0, f1, f2, f3, f4, f5, f6, f7, f8] = this.f;
      const [g0, g1, g2, g3, g4, g5, g6, g7, g8] = this.f2;
      const W1 = 1 / 9, W5 = 1 / 36;
      const uv2 = 1.5 * U * U;
      const q = WQ.map((w, k) => { const eu = 3 * EX[k] * U; return w * (1 + eu + 0.5 * eu * eu - uv2); });
      const [q0, q1, q2, q3, q4, q5, q6, q7, q8] = q;
      for (let i = 0; i < n; i++) {
        if (pevne[i]) { rho[i] = 1; ux[i] = uy[i] = 0; continue; }
        let a0 = f0[i], a1 = f1[i], a2 = f2[i], a3 = f3[i], a4 = f4[i], a5 = f5[i], a6 = f6[i], a7 = f7[i], a8 = f8[i];
        let r = a0 + a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8, vx, vy;
        if (r > 0.2) {
          vx = (a1 + a5 + a8 - a3 - a6 - a7) / r;
          vy = (a4 + a7 + a8 - a2 - a5 - a6) / r;
        } else {                                  // pojistka proti rozpadu výpočtu
          r = 1; vx = U; vy = 0;
          a0 = q0; a1 = q1; a2 = q2; a3 = q3; a4 = q4; a5 = q5; a6 = q6; a7 = q7; a8 = q8;
        }
        let v2 = vx * vx + vy * vy;
        if (v2 > 0.09) { const k = 0.3 / Math.sqrt(v2); vx *= k; vy *= k; v2 = 0.09; }
        rho[i] = r; ux[i] = vx; uy[i] = vy;
        const u2 = 1.5 * v2, r1_ = r * W1, r5 = r * W5, o = omega;
        let eu;
        a0 += o * (r * (4 / 9) * (1 - u2) - a0);
        eu = 3 * vx;         a1 += o * (r1_ * (1 + eu + 0.5 * eu * eu - u2) - a1);
        eu = -3 * vy;        a2 += o * (r1_ * (1 + eu + 0.5 * eu * eu - u2) - a2);
        eu = -3 * vx;        a3 += o * (r1_ * (1 + eu + 0.5 * eu * eu - u2) - a3);
        eu = 3 * vy;         a4 += o * (r1_ * (1 + eu + 0.5 * eu * eu - u2) - a4);
        eu = 3 * (vx - vy);  a5 += o * (r5 * (1 + eu + 0.5 * eu * eu - u2) - a5);
        eu = -3 * (vx + vy); a6 += o * (r5 * (1 + eu + 0.5 * eu * eu - u2) - a6);
        eu = 3 * (vy - vx);  a7 += o * (r5 * (1 + eu + 0.5 * eu * eu - u2) - a7);
        eu = 3 * (vx + vy);  a8 += o * (r5 * (1 + eu + 0.5 * eu * eu - u2) - a8);
        const s = sponge[i];
        if (s > 0) {
          a0 += s * (q0 - a0); a1 += s * (q1 - a1); a2 += s * (q2 - a2);
          a3 += s * (q3 - a3); a4 += s * (q4 - a4); a5 += s * (q5 - a5);
          a6 += s * (q6 - a6); a7 += s * (q7 - a7); a8 += s * (q8 - a8);
        }
        f0[i] = a0; f1[i] = a1; f2[i] = a2; f3[i] = a3; f4[i] = a4; f5[i] = a5; f6[i] = a6; f7[i] = a7; f8[i] = a8;
      }
      // proudění do sousedů; od pevné buňky se tok odrazí zpět (bounce-back)
      let fx = 0, fy = 0;
      for (let y = 1; y < R - 1; y++) {
        const rz = y * C;
        for (let x = 1; x < C - 1; x++) {
          const i = rz + x;
          if (pevne[i]) continue;
          g0[i] = f0[i];
          let s, p, v;
          s = i - 1;        p = pevne[s]; if (!p) g1[i] = f1[s]; else { v = f3[i]; g1[i] = v; if (p === 1) fx += 2 * (v - W1); }
          s = i + 1;        p = pevne[s]; if (!p) g3[i] = f3[s]; else { v = f1[i]; g3[i] = v; if (p === 1) fx -= 2 * (v - W1); }
          s = i + C;        p = pevne[s]; if (!p) g2[i] = f2[s]; else { v = f4[i]; g2[i] = v; if (p === 1) fy -= 2 * (v - W1); }
          s = i - C;        p = pevne[s]; if (!p) g4[i] = f4[s]; else { v = f2[i]; g4[i] = v; if (p === 1) fy += 2 * (v - W1); }
          s = i - 1 + C;    p = pevne[s]; if (!p) g5[i] = f5[s]; else { v = f7[i]; g5[i] = v; if (p === 1) { fx += 2 * (v - W5); fy -= 2 * (v - W5); } }
          s = i + 1 - C;    p = pevne[s]; if (!p) g7[i] = f7[s]; else { v = f5[i]; g7[i] = v; if (p === 1) { fx -= 2 * (v - W5); fy += 2 * (v - W5); } }
          s = i + 1 + C;    p = pevne[s]; if (!p) g6[i] = f6[s]; else { v = f8[i]; g6[i] = v; if (p === 1) { fx -= 2 * (v - W5); fy -= 2 * (v - W5); } }
          s = i - 1 - C;    p = pevne[s]; if (!p) g8[i] = f8[s]; else { v = f6[i]; g8[i] = v; if (p === 1) { fx += 2 * (v - W5); fy += 2 * (v - W5); } }
        }
      }
      const t = this.f; this.f = this.f2; this.f2 = t;
      // okraje tunelu drží nastavený vítr
      for (let x = 0; x < C; x++) { this.rovnovaha(x, 1, U, 0); this.rovnovaha((R - 1) * C + x, 1, U, 0); }
      for (let y = 0; y < R; y++) { this.rovnovaha(y * C, 1, U, 0); this.rovnovaha(y * C + C - 1, 1, U, 0); }
      // síla, kterou vzduch tlačí na překážku = opak hybnosti, kterou jí vrátil
      this.fx = this.fx * 0.995 + (-fx) * 0.005;
      this.fyR = this.fyR * 0.9 + (-fy) * 0.1;
      this.fyP = this.fyP * 0.998 + (-fy) * 0.002;
      this.krokuOdZmeny++;
      // střídavé odtrhávání vírů: boční síla kmitá kolem průměru
      const D = this.scena.D || 20, prah = 0.03 * 0.5 * U * U * D, d = this.fyR - this.fyP;
      if (this.krokuOdZmeny > 0.5 * C / U) {
        if (d > prah && this.znamenko !== 1) { if (this.znamenko) this.stridani++; this.znamenko = 1; }
        else if (d < -prah && this.znamenko !== -1) { if (this.znamenko) this.stridani++; this.znamenko = -1; }
      }
    }
    /* součinitel odporu (poměrné číslo, v rovině) */
    get odpor() { return this.fx / (0.5 * this.U * this.U * (this.scena.D || 20)); }

    rychlostV(x, y) {
      const C = this.C, R = this.R;
      const xi = omez(Math.floor(x), 0, C - 1), yi = omez(Math.floor(y), 0, R - 1), i = yi * C + xi;
      return this.pevne[i] ? null : Math.hypot(this.ux[i], this.uy[i]) / this.U;
    }

    /* ---------- kouř ---------- */
    posunKour(kroku) {
      if (!this.kourJe) return;
      const C = this.C, R = this.R, b = this.kour, b2 = this.kour2, ux = this.ux, uy = this.uy, pevne = this.pevne;
      let zbylo = 0;
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const i = y * C + x;
        if (pevne[i]) { b2[i] = 0; continue; }
        const px = x - ux[i] * kroku, py = y - uy[i] * kroku;
        if (px < 0 || py < 0 || px > C - 1.001 || py > R - 1.001) { b2[i] = 0; continue; }
        const x0 = px | 0, y0 = py | 0, tx = px - x0, ty = py - y0, i0 = y0 * C + x0;
        const h = (b[i0] * (1 - tx) + b[i0 + 1] * tx) * (1 - ty) + (b[i0 + C] * (1 - tx) + b[i0 + C + 1] * tx) * ty;
        b2[i] = h * 0.998; zbylo += b2[i];
      }
      this.kour = b2; this.kour2 = b;
      if (zbylo < 0.4) { this.kourJe = false; this.kour.fill(0); }
    }
    pustKour(gx, gy) {
      const C = this.C, R = this.R, r = 3;
      for (let y = Math.max(0, gy - r); y <= Math.min(R - 1, gy + r); y++)
        for (let x = Math.max(0, gx - r); x <= Math.min(C - 1, gx + r); x++) {
          const d = ((x - gx) ** 2 + (y - gy) ** 2) / (r * r), i = y * C + x;
          if (d <= 1 && !this.pevne[i]) { this.kour[i] = Math.min(1, this.kour[i] + (1 - d)); this.kourJe = true; }
        }
    }
    /* ---------- kreslení zdí ---------- */
    stetec(gx, gy, pridat) {
      const C = this.C, R = this.R, r = 3;
      let zmena = false;
      for (let y = Math.max(1, gy - r); y <= Math.min(R - 2, gy + r); y++)
        for (let x = Math.max(1, gx - r); x <= Math.min(C - 2, gx + r); x++) {
          if ((x - gx) ** 2 + (y - gy) ** 2 > r * r) continue;
          const i = y * C + x;
          if (pridat) { if (this.pevne[i]) continue; this.pevne[i] = 1; this.kresba[i] = 1; this.kour[i] = 0; this.rovnovaha(i, 1, 0, 0); zmena = true; }
          else if (this.kresba[i]) { this.pevne[i] = 0; this.kresba[i] = 0; this.rovnovaha(i, 1, this.U, 0); zmena = true; }
        }
      if (zmena) { this.vrstvaPlatna = false; this.zmena(); }
    }

    /* ---------- proudnice (kouřové vlečky) ---------- */
    posunVlecky(kroku) {
      const C = this.C, R = this.R;
      if (!this.vlecky.length) {
        const pocet = this.cfg.vlecek || 13, horni = 1.5, dolni = R - this.zemVyska - 1.5;
        for (let j = 0; j < pocet; j++) {
          const y = horni + (dolni - horni) * (j + 0.5) / pocet;
          this.vlecky.push({ zdroj: [1.5, y], body: [] });
        }
      }
      const davek = Math.max(1, Math.ceil(kroku / 3)), k = kroku * 1.0 / davek;
      for (const v of this.vlecky) {
        const zi = (v.zdroj[1] | 0) * C + 1;
        for (const b of v.body) {
          if (!b.z) continue;
          for (let d = 0; d < davek; d++) {
            const i = (b.y | 0) * C + (b.x | 0);
            const nx = b.x + this.ux[i] * k, ny = b.y + this.uy[i] * k;
            if (nx < 0.5 || ny < 0.5 || nx > C - 1.5 || ny > R - 1.5 || this.pevne[(ny | 0) * C + (nx | 0)]) { b.z = false; break; }
            b.x = nx; b.y = ny;
          }
        }
        const h = v.body[0];
        if (!this.pevne[zi] && (!h || (h.x - v.zdroj[0]) ** 2 + (h.y - v.zdroj[1]) ** 2 > 1.2))
          v.body.unshift({ x: v.zdroj[0], y: v.zdroj[1], z: true, id: this.vleckaId++ });
        if (v.body.length > 320) v.body.length = 320;
      }
    }

    /* ---------- sníh: vločky padají, v pomalém vzduchu se usadí ---------- */
    posunSnih(kroku) {
      const C = this.C, R = this.R, U = this.U, vs = (this.cfg.snihPad || 0.25) * U;
      // průměrná rychlost (víry za překážkou se střídají, rozhoduje dlouhodobě slabý vítr)
      if (!this.uP) { this.uP = new Float32Array(C * R); this.uP.fill(U); }
      const uP = this.uP, ux = this.ux, uy = this.uy;
      for (let i = 0, n = C * R; i < n; i++) uP[i] += (Math.hypot(ux[i], uy[i]) - uP[i]) * 0.02;
      const od = this.cfg.snihOd || 0.2, pas = this.cfg.snihPas || 0.3, zem = R - this.zemVyska;
      if (this.vlocky.length < 420) for (let i = 0; i < 5; i++)
        this.vlocky.push({ x: 1 + Math.random() * 2, y: zem - R * (od + Math.random() * pas) });
      const davek = Math.max(1, Math.ceil(kroku / 2)), k = kroku / davek;
      const maxV = Math.round(R * 0.32);
      for (const v of this.vlocky) {
        for (let d = 0; d < davek && !v.pryc; d++) {
          const i = (v.y | 0) * C + (v.x | 0);
          const nx = v.x + this.ux[i] * k, ny = v.y + (this.uy[i] + vs) * k;
          if (nx < 1 || nx > C - 2 || ny < 1) { v.pryc = true; break; }
          const j = (Math.min(R - 1, ny | 0)) * C + (nx | 0);
          if (ny < R - 1 && this.pevne[j] && !this.pevne[Math.min(R - 1, (v.y | 0) + 1) * C + (nx | 0)]) {
            v.y = Math.max(1, v.y - 1);                 // narazila do svislé stěny: proud ji nese vzhůru přes ni
            continue;
          }
          if (ny >= R - 1 || this.pevne[j]) {
            // dopad: kde vítr kousek nad zemí zeslábl (proti větru ve stejné výšce
            // na začátku tunelu), vločka zůstane ležet; jinak ji vítr znovu zvedne
            const yy = Math.max(1, (v.y | 0) - 2), tady = uP[yy * C + (v.x | 0)];
            if (tady < (this.cfg.snihPrah || 0.3) * U) { this.usad(v.x | 0, maxV); v.pryc = true; break; }
            v.x = nx; v.y = Math.max(1, v.y - 3);
            continue;
          }
          v.x = nx; v.y = ny;
        }
      }
      for (let i = this.vlocky.length - 1; i >= 0; i--) if (this.vlocky[i].pryc) this.vlocky.splice(i, 1);
    }
    usad(x, maxV) {
      const C = this.C, R = this.R, vyska = c => { let y = R - 1; while (y > 0 && this.pevne[y * C + c]) y--; return R - 1 - y; };
      // sníh se sesype, když by byl moc strmý
      let c = x;
      for (let n = 0; n < 6; n++) {
        const h = vyska(c), l = c > 1 ? vyska(c - 1) : 99, p = c < C - 2 ? vyska(c + 1) : 99;
        if (l < h - 1 && l <= p) c--; else if (p < h - 1) c++; else break;
      }
      if (++this.napadano[c] < 3) return;
      this.napadano[c] = 0;
      const h = vyska(c);
      if (h >= maxV) return;
      const y = R - 1 - h, i = y * C + c;
      if (y < 1 || this.pevne[i]) return;
      this.pevne[i] = 2; this.snihBunky[i] = 1; this.vyskaSnehu[c]++;
      this.vrstvaPlatna = false;
    }
    get snehuZaPlotem() {
      const x0 = this.scena.plotX || 0;
      let n = 0; for (let x = x0 + 2; x < this.C; x++) n += this.vyskaSnehu[x];
      return n;
    }

    /* ---------- vykreslení ---------- */
    zmerPlatno() {
      const w = this.canvas.clientWidth; if (!w) return;
      const dpr = window.devicePixelRatio || 1, h = w * this.R / this.C;
      const W = Math.round(w * dpr), H = Math.round(h * dpr);
      if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
      this.sirka = w; this.vyska = h; this.dpr = dpr;
      this.vykresli();
    }
    vykresli() {
      if (!this.sirka) return;
      const C = this.C, R = this.R, U = this.U, d = this.img.data, rez = this.s.rezim;
      const ux = this.ux, uy = this.uy, rho = this.rho, pevne = this.pevne, kour = this.kour;
      const D = this.scena.D || 20, vir = D / U * 0.22;
      for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
        const i = y * C + x, p = i * 4;
        let r, g, b;
        if (pevne[i]) { r = 10; g = 20; b = 34; }
        else if (rez === 'rychlost' || rez === 'proudnice') {
          const j = Math.min(255, Math.round(Math.hypot(ux[i], uy[i]) / (2 * U) * 255)) * 3;
          if (rez === 'rychlost') { r = LUT[j]; g = LUT[j + 1]; b = LUT[j + 2]; }
          else { r = 10 + LUT[j] * 0.22; g = 20 + LUT[j + 1] * 0.22; b = 34 + LUT[j + 2] * 0.22; }
        } else if (rez === 'viry') {
          const l = x > 0 ? i - 1 : i, pr = x < C - 1 ? i + 1 : i, n = y > 0 ? i - C : i, dn = y < R - 1 ? i + C : i;
          const w = ((uy[pr] - uy[l]) - (ux[dn] - ux[n])) * vir;
          const a = Math.min(1, Math.abs(w) ** 0.75);
          const r2 = w >= 0 ? 240 : 70, g2 = w >= 0 ? 80 : 140, b2 = w >= 0 ? 66 : 250;
          r = 14 + (r2 - 14) * a; g = 24 + (g2 - 24) * a; b = 38 + (b2 - 38) * a;
        } else {
          const cp = (rho[i] - 1) / 3 / (0.5 * U * U), t = Math.max(-1, Math.min(1, cp / (cp < 0 ? 1.5 : 1)));
          const a = Math.min(1, Math.abs(t) ** 0.8);
          const r2 = t >= 0 ? 245 : 70, g2 = t >= 0 ? 96 : 150, b2 = t >= 0 ? 70 : 250;
          r = 14 + (r2 - 14) * a; g = 24 + (g2 - 24) * a; b = 38 + (b2 - 38) * a;
        }
        const k = kour[i];
        if (k > 0.005) { const a = Math.min(1, k * 1.4); r += (240 - r) * a; g += (244 - g) * a; b += (250 - b) * a; }
        d[p] = r; d[p + 1] = g; d[p + 2] = b; d[p + 3] = 255;
      }
      this.pctx.putImageData(this.img, 0, 0);
      const ctx = this.ctx, sx = this.sirka / C, sy = this.vyska / R;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.pom, 0, 0, this.sirka, this.vyska);

      // tvary scény vektorově (bez schodů), kresba a sníh jako rozmazaná vrstva
      const sc = this.scena;
      ctx.lineJoin = 'round';
      if (this.zemVyska) {
        ctx.fillStyle = '#4a5a3c';
        ctx.fillRect(0, (R - this.zemVyska) * sy, this.sirka, this.zemVyska * sy);
      }
      for (const t of sc.telesa) {
        ctx.beginPath();
        t.body.forEach(([x, y], i) => i ? ctx.lineTo(x * sx, y * sy) : ctx.moveTo(x * sx, y * sy));
        ctx.closePath();
        ctx.fillStyle = t.zem ? '#4a5a3c' : '#6b7483';
        ctx.fill();
        ctx.strokeStyle = t.zem ? '#6f8458' : '#aeb6c3';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      if (!this.vrstvaPlatna) {
        const v = this.vimg.data;
        for (let i = 0, n = C * R; i < n; i++) {
          const p = i * 4;
          if (this.snihBunky[i]) { v[p] = 238; v[p + 1] = 244; v[p + 2] = 252; v[p + 3] = 255; }
          else if (this.kresba[i]) { v[p] = 150; v[p + 1] = 120; v[p + 2] = 96; v[p + 3] = 255; }
          else v[p + 3] = 0;
        }
        this.vctx.putImageData(this.vimg, 0, 0);
        this.vrstvaPlatna = true;
      }
      ctx.drawImage(this.vrstva, 0, 0, this.sirka, this.vyska);

      if (rez === 'proudnice') {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(190,232,255,.72)';
        ctx.beginPath();
        for (const v of this.vlecky) {
          let spoj = false;
          for (const b of v.body) {
            if (!b.z) { spoj = false; continue; }
            if (spoj) ctx.lineTo(b.x * sx, b.y * sy); else { ctx.moveTo(b.x * sx, b.y * sy); spoj = true; }
          }
        }
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (const v of this.vlecky) for (const b of v.body) {
          if (!b.z || b.id % 9) continue;
          ctx.moveTo(b.x * sx + 2.2, b.y * sy); ctx.arc(b.x * sx, b.y * sy, 2.2, 0, 2 * Math.PI);
        }
        ctx.fill();
      }
      if (this.s.snih) {
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.beginPath();
        for (const v of this.vlocky) { ctx.moveTo(v.x * sx + 1.8, v.y * sy); ctx.arc(v.x * sx, v.y * sy, 1.8, 0, 2 * Math.PI); }
        ctx.fill();
      }
      // sonda
      const px = this.sonda.x * sx, py = this.sonda.y * sy, hod = this.sonda.platna ? this.sonda.hodnota : null;
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#ffd34d';
      ctx.beginPath(); ctx.arc(px, py, 9, 0, 2 * Math.PI); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px - 14, py); ctx.lineTo(px - 4, py); ctx.moveTo(px + 4, py); ctx.lineTo(px + 14, py);
      ctx.moveTo(px, py - 14); ctx.lineTo(px, py - 4); ctx.moveTo(px, py + 4); ctx.lineTo(px, py + 14); ctx.stroke();
      const text = hod == null ? 'v překážce' : Math.round(hod * 100) + ' %';
      ctx.font = '600 13px ' + getComputedStyle(document.body).fontFamily;
      const tw = ctx.measureText(text).width + 12, tx = Math.min(this.sirka - tw - 2, px + 14), ty = Math.max(2, py - 32);
      ctx.fillStyle = 'rgba(8,16,28,.85)'; ctx.fillRect(tx, ty, tw, 20);
      ctx.fillStyle = '#ffd34d'; ctx.fillText(text, tx + 6, ty + 14.5);
      if (!this.s.bezi) {
        ctx.fillStyle = 'rgba(8,16,28,.75)'; ctx.fillRect(8, 8, 76, 22);
        ctx.fillStyle = '#fff'; ctx.fillText('⏸ pauza', 16, 23.5);
      }
    }

    /* ---------- snímek: fyzika + kresba ---------- */
    snimek(rozpocetMs) {
      if (this.s.bezi) {
        const t0 = performance.now();
        for (let i = 0; i < this.kroku; i++) this.krok();
        const ms = (performance.now() - t0) / this.kroku;
        this.msKrok = this.msKrok * 0.8 + ms * 0.2;
        this.kroku = omez(Math.round(rozpocetMs / Math.max(0.05, this.msKrok)), 1, 12);
        this.posunKour(this.kroku);
        if (this.s.rezim === 'proudnice') this.posunVlecky(this.kroku); else this.vlecky.length = 0;
        if (this.s.snih) this.posunSnih(this.kroku);
      }
      const v = this.rychlostV(this.sonda.x, this.sonda.y);
      if (v == null) this.sonda.platna = false;
      else if (!this.sonda.platna) { this.sonda.hodnota = v; this.sonda.platna = true; }
      else this.sonda.hodnota = this.sonda.hodnota * 0.85 + v * 0.15;
      this.vykresli();
    }

    /* ---------- ovládání ---------- */
    ovladani() {
      const fig = this.fig, tl = sel => $$(`[data-t="${sel}"]`, fig);
      this.segmenty = {};
      for (const el of tl('scena').concat(tl('tekutina'), tl('rezim'), tl('nastroj'))) {
        const klic = el.dataset.t;
        this.segmenty[klic] = segment(el, this.s[klic], v => this.nastav({ [klic]: v }));
      }
      for (const el of tl('snih')) el.addEventListener('change', () => this.nastav({ snih: el.checked }));
      for (const b of tl('pauza')) b.addEventListener('click', () => this.nastav({ bezi: !this.s.bezi }));
      for (const b of tl('restart')) b.addEventListener('click', () => { this.postav(); this.restart(); this.vykresli(); });
      this.aktualizujLegendu();
      // myš a dotyk
      const c = this.canvas;
      const bod = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * this.C, (e.clientY - r.top) / r.height * this.R]; };
      let tah = false;
      const pouzij = e => {
        const [x, y] = bod(e);
        if (x < 0 || y < 0 || x >= this.C || y >= this.R) return;
        const n = this.s.nastroj;
        if (n === 'sonda') { this.sonda.x = omez(x, 1, this.C - 2); this.sonda.y = omez(y, 1, this.R - 2); this.sonda.platna = false; }
        else if (n === 'kresli') this.stetec(Math.round(x), Math.round(y), true);
        else if (n === 'guma') this.stetec(Math.round(x), Math.round(y), false);
        else this.pustKour(Math.round(x), Math.round(y));
        if (!this.s.bezi) this.vykresli();
      };
      c.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch { /* syntetická událost */ } tah = true; pouzij(e); });
      c.addEventListener('pointermove', e => { if (tah) pouzij(e); });
      const konec = () => { tah = false; };
      c.addEventListener('pointerup', konec); c.addEventListener('pointercancel', konec);
      c.addEventListener('keydown', e => {
        const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (!m) return;
        e.preventDefault();
        const k = e.shiftKey ? 5 : 1;
        this.sonda.x = omez(this.sonda.x + m[0] * k, 1, this.C - 2);
        this.sonda.y = omez(this.sonda.y + m[1] * k, 1, this.R - 2);
        this.sonda.platna = false;
        if (!this.s.bezi) this.vykresli();
      });
    }
    nastav(z) {
      const stara = { ...this.s };
      Object.assign(this.s, z);
      for (const k in this.segmenty) this.segmenty[k](this.s[k]);
      if (z.scena != null && z.scena !== stara.scena) {
        this.postav(); this.restart();
        const sc = this.scena;
        if (sc.sonda) { this.sonda.x = sc.sonda[0]; this.sonda.y = sc.sonda[1]; }
      }
      if (z.tekutina != null && z.tekutina !== stara.tekutina) this.zmena();
      if (z.rezim != null) this.aktualizujLegendu();
      if (z.snih != null) {
        $$('[data-t="snih"]', this.fig).forEach(el => { el.checked = this.s.snih; });
        if (!this.s.snih) this.vlocky.length = 0;
      }
      if (z.bezi != null) $$('[data-t="pauza"]', this.fig).forEach(b => { b.textContent = this.s.bezi ? '⏸️ Pauza' : '▶️ Spustit'; b.classList.toggle('hlavni', !this.s.bezi); });
      this.vykresli();
      if (this.poZmene) this.poZmene();
      Ukoly.kontrola();
    }
    aktualizujLegendu() {
      if (!this.legenda) return;
      const r = this.s.rezim;
      this.legenda.innerHTML = r === 'rychlost'
        ? `<span>stojí</span><span class="pruh" style="background:${gradientCSS()}"></span><span>2× vítr</span><span>· modrozelená = rychlost volného větru</span>`
        : r === 'viry' ? '<span><b style="color:#f05042">●</b> vír po směru hodinových ručiček</span><span><b style="color:#4a8cfa">●</b> vír proti směru</span>'
        : r === 'tlak' ? `<span>podtlak</span><span class="pruh" style="background:linear-gradient(90deg,rgb(70,150,250),rgb(14,24,38) 50%,rgb(245,96,70))"></span><span>přetlak</span>`
        : '<span>Světlé čáry = proudnice (pramínky kouře), bílé tečky letí se vzduchem. Podklad je tím světlejší, čím rychleji vzduch proudí.</span>';
    }
  }
  Tunel.vsechny = [];
  /* Jedna smyčka pro všechny tunely: počítá jen ty, které jsou vidět,
     a rozdělí mezi ně rozpočet času na snímek. */
  Tunel.bezi = false;
  Tunel.spust = () => {
    if (Tunel.bezi) return;
    Tunel.bezi = true;
    let posl = 0, tik = 0;
    const smycka = t => {
      const vid = Tunel.vsechny.filter(x => x.viditelny);
      if (!vid.length || document.hidden) { Tunel.bezi = false; return; }
      requestAnimationFrame(smycka);
      if (t - posl < 24) return;            // nejvýš asi 40 snímků za sekundu
      posl = t;
      for (const x of vid) x.snimek(12 / vid.length);
      if (t - tik > 300) { tik = t; for (const x of vid) if (x.poTiku) x.poTiku(); Ukoly.kontrola(); }
    };
    requestAnimationFrame(smycka);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) Tunel.spust(); });

  /* Animace SVG modelu: běží jen, když je model vidět. */
  function animace(m, krok) {
    let bezi = false, posl = 0;
    const f = t => {
      if (!m.viditelny || document.hidden || bezPohybu()) { bezi = false; return; }
      const dt = posl ? Math.min(0.05, (t - posl) / 1000) : 0;
      posl = t;
      krok(dt);
      requestAnimationFrame(f);
    };
    const spust = () => { if (bezi || !m.viditelny || document.hidden || bezPohybu()) return; bezi = true; posl = 0; requestAnimationFrame(f); };
    m.priViditelnosti = spust;
    document.addEventListener('visibilitychange', spust);
    return spust;
  }
  /* Tečky jako jedna cesta (rychlé i při stovkách teček). */
  const teckyD = (body, r) => body.map(p => `M${r1(p[0] - r)} ${r1(p[1])}a${r} ${r} 0 1 0 ${r1(2 * r)} 0a${r} ${r} 0 1 0 ${r1(-2 * r)} 0`).join('');
  function animVrstva(m) { const g = sv('g', null); m.svg.insertBefore(g, m.uchopy); return g; }

  /* ================================================================
     6. Modely kapitol
     ================================================================ */
  const MODELY = {};
  const kmh = v => cisK(v * 3.6, 0) + ' km/h';

  /* ---------- 1 · Bríza: koloběh vzduchu nad pobřežím ---------- */
  function modelBriza() {
    const m = new Model('obr-briza', 1000, 400);
    const s = { doba: 'den', dT: 6, t: 0 };
    MODELY.briza = { m, s };
    const POB = 480, Y0 = 300;
    const X1 = 170, X2 = 830, YH = 104, YD = 268, RR = 44;
    // smyčka koloběhu: dole zleva doprava, vpravo nahoru, nahoře doleva, vlevo dolů (= denní směr)
    const smycka = (() => {
      const pts = [];
      const oblouk = (cx, cy, a0, a1) => { for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; pts.push([cx + RR * Math.cos(a), cy + RR * Math.sin(a)]); } };
      pts.push([X1 + RR, YD], [X2 - RR, YD]);
      oblouk(X2 - RR, YD - RR, Math.PI / 2, 0);
      pts.push([X2, YH + RR]);
      oblouk(X2 - RR, YH + RR, 0, -Math.PI / 2);
      pts.push([X1 + RR, YH]);
      oblouk(X1 + RR, YH + RR, -Math.PI / 2, -Math.PI);
      pts.push([X1, YD - RR]);
      oblouk(X1 + RR, YD - RR, Math.PI, Math.PI / 2);
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const L = cum[cum.length - 1];
      const bod = u => {
        const d = ((u % 1) + 1) % 1 * L;
        let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
        const t = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1), a = pts[i - 1], b = pts[i];
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (b[0] - a[0]), (b[1] - a[1])];
      };
      return { pts, L, bod };
    })();
    const n = 46, rnd = nahoda(7);
    const castice = Array.from({ length: n }, (_, i) => ({ u: i / n + rnd() * 0.01, o: (rnd() - 0.5) * 26 }));
    const anim = animVrstva(m);
    const vitr = () => 0.55 * s.dT;                    // m/s
    const teplota = () => 18 + (s.doba === 'den' ? 1 : -1) * s.dT;

    function kresliAnim() {
      anim.replaceChildren();
      const k = m.k, v = vitr(), smer = s.doba === 'den' ? 1 : -1;
      const tepla = [], studena = [];
      for (const c of castice) {
        const [x, y, dx, dy] = smycka.bod(c.u);
        const l = Math.hypot(dx, dy) || 1;
        const p = [x - dy / l * c.o, y + dx / l * c.o];
        const tepleX = s.doba === 'den' ? (x - X1) / (X2 - X1) : (X2 - x) / (X2 - X1);
        (s.dT > 0 && tepleX > 0.5 ? tepla : studena).push(p);
      }
      sv('path', { d: teckyD(tepla, 4.2 * k), class: 'tecky c-teply' }, anim);
      sv('path', { d: teckyD(studena, 4.2 * k), class: 'tecky c-studeny' }, anim);
      // větrný rukáv na pláži
      const xp = POB + 70, yp = Y0 - 88, uhel = v < 0.2 ? 0 : Math.min(84, 22 + v * 14) * RAD;
      const kmit = v < 0.2 ? 0 : Math.sin(s.t * (3 + v)) * 0.06;
      const d = [Math.sin(uhel + kmit) * smer, Math.cos(uhel + kmit)];
      const q = [-d[1], d[0]];
      const L = 72, h0 = 12, h1 = 7;
      const obrys = [[xp + q[0] * h0, yp + q[1] * h0], [xp + d[0] * L + q[0] * h1, yp + d[1] * L + q[1] * h1], [xp + d[0] * L - q[0] * h1, yp + d[1] * L - q[1] * h1], [xp - q[0] * h0, yp - q[1] * h0]];
      for (let i = 0; i < 5; i++) {
        const a = i / 5, b = (i + 1) / 5, ha = h0 + (h1 - h0) * a, hb = h0 + (h1 - h0) * b;
        mnohouhelnik(anim, [[xp + d[0] * L * a + q[0] * ha, yp + d[1] * L * a + q[1] * ha], [xp + d[0] * L * b + q[0] * hb, yp + d[1] * L * b + q[1] * hb],
          [xp + d[0] * L * b - q[0] * hb, yp + d[1] * L * b - q[1] * hb], [xp + d[0] * L * a - q[0] * ha, yp + d[1] * L * a - q[1] * ha]], '', `fill:${i % 2 ? '#f4f4f4' : '#e0503a'}`);
      }
      mnohouhelnik(anim, obrys, '', 'fill:none;stroke:var(--text-faint);stroke-width:' + r1(k));
    }
    animace(m, dt => {
      s.t += dt;
      const smer = s.doba === 'den' ? 1 : -1;
      for (const c of castice) c.u += smer * vitr() * 13 * dt / smycka.L;
      kresliAnim();
    });

    m.kresli = g => {
      const k = m.k, v = vitr(), den = s.doba === 'den', smer = den ? 1 : -1;
      sv('rect', { x: 0, y: 0, width: 1000, height: Y0, class: 'nebe' }, g);
      if (!den) sv('rect', { x: 0, y: 0, width: 1000, height: Y0, fill: 'rgba(10,20,60,.28)' }, g);
      if (den) {
        sv('circle', { cx: 920, cy: 52, r: 24, fill: '#ffcf4d' }, g);
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; cara(g, [[920 + 32 * Math.cos(a), 52 + 32 * Math.sin(a)], [920 + 42 * Math.cos(a), 52 + 42 * Math.sin(a)]], '', 'stroke:#ffcf4d'); }
      } else {
        sv('path', { d: 'M932 30 A24 24 0 1 0 932 76 A19 19 0 1 1 932 30Z', fill: '#e8e3c8' }, g);
      }
      sv('rect', { x: 0, y: Y0, width: POB + 10, height: 100, class: 'more' }, g);
      for (let x = 20; x < POB - 20; x += 60) cara(g, [[x, Y0 + 16], [x + 14, Y0 + 12], [x + 28, Y0 + 16]], 'tenka', 'stroke:rgba(255,255,255,.35)');
      mnohouhelnik(g, [[POB - 30, 400], [POB - 30, Y0 + 10], [POB + 40, Y0 - 6], [1000, Y0 - 6], [1000, 400]], 'zeme');
      // povrch: teplejší je barevně zvýrazněný
      const pevninaTepla = den && s.dT > 0, mořeTeple = !den && s.dT > 0;
      if (s.dT > 0) {
        cara(g, [[POB + 40, Y0 - 6], [1000, Y0 - 6]], 'silna', `stroke:var(${pevninaTepla ? '--v-teply' : '--v-studeny'})`);
        cara(g, [[0, Y0], [POB - 30, Y0]], 'silna', `stroke:var(${mořeTeple ? '--v-teply' : '--v-studeny'})`);
      }
      txt(g, 240, 378, `moře 18 °C`, 't-silny t-stred');
      txt(g, 760, 378, `pevnina ${teplota()} °C`, 't-silny t-stred');
      // koloběh
      cara(g, [...smycka.pts, smycka.pts[0]], 'tenka carkovana c-osa');
      if (s.dT > 0) {
        const vel = 0.8 + Math.min(1.4, v / 3);
        const sipka = (u) => { const [x, y, dx, dy] = smycka.bod(u); const l = Math.hypot(dx, dy) || 1; hrot(g, [x, y], [dx / l * smer, dy / l * smer], k, vel, 'c-proud'); };
        [0.13, 0.3, 0.4, 0.56, 0.72, 0.9].forEach(sipka);
        const nx = den ? X2 : X1, vx = den ? X1 : X2;
        txt(g, nx + (den ? 16 : -16), YH + 80, 'teplý vzduch stoupá', 't-teply ' + (den ? '' : 't-konec'));
        txt(g, vx + (den ? -16 : 16), YH + 80, 'chladný vzduch klesá', 't-studeny ' + (den ? 't-konec' : ''));
        const znacka = (x, pis, popis, cls) => {
          sv('circle', { cx: x, cy: Y0 + 30, r: 17 * k, class: 'vypln ' + cls, opacity: 0.35 }, g);
          txt(g, x, Y0 + 36, pis, 't-velky t-stred');
          txt(g, x + 26 * k, Y0 + 35, popis, 't-maly t-silny');
        };
        znacka(nx, 'N', 'nižší tlak', 'c-teply');
        znacka(vx, 'V', 'vyšší tlak', 'c-studeny');
        txt(g, 330, YD - 14, den ? 'vítr u země: od moře → k pevnině' : 'vítr u země: ← od pevniny k moři', 't-silny t-stred t-proud');
      } else {
        txt(g, 500, 190, 'stejná teplota → stejný tlak → bezvětří', 't-silny t-stred');
      }
      // stožár rukávu
      cara(g, [[POB + 70, Y0 - 6], [POB + 70, Y0 - 96]], 'silna c-text');
      m.odecet([['Moře', '18 °C'], ['Pevnina', teplota() + ' °C'],
        ['Vítr u země', s.dT ? `${den ? 'od moře k pevnině' : 'od pevniny k moři'}, ${cis(v)} m/s (${kmh(v)})` : 'bezvětří']]);
      m.zpravu(s.dT === 0 ? 'Pevnina i moře mají stejnou teplotu. Tlak je všude stejný, a tak se vzduch nemá kam hnát – je <b>bezvětří</b>.'
        : den ? 'Ve dne se <b>pevnina ohřeje rychleji než moře</b>. Vzduch nad ní stoupá a u země po něm zůstane nižší tlak. Od moře k pevnině proto proudí chladnější vzduch – <b>denní bríza</b>.'
          : 'V noci pevnina <b>vychladne rychleji</b> než moře, které si teplo drží. Teď stoupá vzduch nad mořem a koloběh se obrátí – u země fouká <b>z pevniny na moře</b>.');
      kresliAnim();
    };
    segment($('#briza-doba'), s.doba, v => { s.doba = v; m.naplanuj(); });
    posuvnik('briza-dt', v => v + ' °C', v => { s.dT = v; m.naplanuj(); });

    predpoved('briza-noc', {
      otazka: 'Ve dne fouká u země od moře na pevninu. Jak bude foukat <b>v noci</b>, když pevnina vychladne pod teplotu moře?',
      moznosti: ['Od pevniny k moři', 'Pořád od moře k pevnině', 'V noci vítr nefouká nikdy'],
      spravna: 0,
      proc: [null, 'Směr větru určuje, kde je teplejší povrch a nižší tlak. V noci je teplejší moře, takže se koloběh obrátí.', 'Vítr fouká, kdykoli jsou teploty (a tlaky) různé – v noci je jen teplejší moře.'],
      vyzkousej: 'Přepni na <b>🌙 noc</b> a sleduj praporek na pláži a tečky u země.',
      splneno: () => s.doba === 'noc' && s.dT >= 2,
      vysvetleni: 'V noci je teplejší moře. Vzduch nad ním stoupá, u moře je nižší tlak, a tak u země fouká z pevniny na moře – <b>noční bríza</b>.',
    });
    Ukoly.definuj('briza-klid', () => s.dT === 0,
      'Když mají pevnina a moře stejnou teplotu, je tlak všude stejný a vzduch se nehýbe. Vítr potřebuje <b>rozdíl tlaků</b>.');
  }

  /* ---------- 2 · Beaufortova stupnice ---------- */
  const BEAUFORT = [
    { n: 'bezvětří', od: 0, do: 0.2, p: 'Kouř stoupá kolmo vzhůru.' },
    { n: 'vánek', od: 0.3, do: 1.5, p: 'Směr větru se pozná podle kouře, ale ne podle větrné korouhve.' },
    { n: 'větřík', od: 1.6, do: 3.3, p: 'Vítr je cítit ve tváři, listí šelestí, korouhev se pohybuje.' },
    { n: 'slabý vítr', od: 3.4, do: 5.4, p: 'Listy a tenké větvičky jsou v trvalém pohybu, vítr napíná praporky.' },
    { n: 'mírný vítr', od: 5.5, do: 7.9, p: 'Vítr zvedá prach a papírky, pohybuje slabšími větvemi.' },
    { n: 'čerstvý vítr', od: 8.0, do: 10.7, p: 'Listnaté keře se hýbou, na rybnících se tvoří vlnky se zpěněnými hřebeny.' },
    { n: 'silný vítr', od: 10.8, do: 13.8, p: 'Pohybuje silnými větvemi, dráty sviští, deštník se drží těžko.' },
    { n: 'prudký vítr', od: 13.9, do: 17.1, p: 'Pohybuje celými stromy, chůze proti větru je nesnadná.' },
    { n: 'bouřlivý vítr', od: 17.2, do: 20.7, p: 'Ulamuje větve, chůze proti větru je skoro nemožná.' },
    { n: 'vichřice', od: 20.8, do: 24.4, p: 'Menší škody na stavbách – strhává tašky ze střech a komínové nástavce.' },
    { n: 'silná vichřice', od: 24.5, do: 28.4, p: 'Vyvrací stromy a působí větší škody na domech. Ve vnitrozemí je vzácná.' },
    { n: 'mohutná vichřice', od: 28.5, do: 32.6, p: 'Rozsáhlá pustošení. Ve vnitrozemí velmi vzácná.' },
    { n: 'orkán', od: 32.7, do: null, p: 'Ničivé účinky – jen v nejsilnějších bouřích (hurikány, tajfuny).' },
  ];
  function modelBeaufort() {
    const m = new Model('obr-beaufort', 1000, 380);
    const s = { b: 3, t: 0 };
    MODELY.beaufort = { m, s };
    const ZEM = 322, rnd = nahoda(3);
    const kour = Array.from({ length: 16 }, (_, i) => ({ a: i / 16 }));
    const listi = Array.from({ length: 18 }, () => ({ x: rnd() * 1000, y: 150 + rnd() * 160, f: rnd() * 6 }));
    const trava = Array.from({ length: 34 }, (_, i) => 30 + i * 28 + rnd() * 10);
    const anim = animVrstva(m);

    function kresliAnim() {
      anim.replaceChildren();
      const b = s.b, k = m.k, t = s.t;
      // kouř z komína
      const uhel = b === 0 ? 0 : Math.min(86, 22 + b * 11) * RAD, delka = b >= 8 ? 110 : 190 - b * 6;
      const kus = [];
      for (const c of kour) {
        const a = c.a, turb = Math.sin(a * 12 + t * 2) * (3 + b * 1.5) * a;
        const x = 204 + Math.sin(uhel) * a * delka + Math.cos(uhel) * turb, y = 188 - Math.cos(uhel) * a * delka + Math.sin(uhel) * turb * 0.4;
        kus.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(5 + a * 16)}" opacity="${r1((1 - a) * 0.75 * 100) / 100}"/>`);
      }
      const gk = sv('g', { class: 'kour' }, anim); gk.innerHTML = kus.join('');
      // strom
      const X = 540, V = 150, ohyb = b >= 10 ? 0 : Math.pow(b / 12, 1.4) * 70 + Math.sin(t * (1.2 + b * 0.5)) * (1 + b * 1.1);
      if (b >= 10) {
        const gs = sv('g', { transform: `rotate(74 ${X} ${ZEM})` }, anim);
        sv('path', { d: `M${X - 7} ${ZEM} Q${X - 4} ${ZEM - V / 2} ${X} ${ZEM - V} L${X + 4} ${ZEM - V} Q${X + 6} ${ZEM - V / 2} ${X + 9} ${ZEM}Z`, class: 'kmen' }, gs);
        [[0, -V - 10, 44], [-26, -V + 16, 30], [26, -V + 16, 30]].forEach(([dx, dy, r]) => sv('circle', { cx: X + dx, cy: ZEM + dy, r, class: 'koruna' }, gs));
        sv('path', { d: `M${X - 24} ${ZEM + 2} q12 -22 30 -6 q10 -14 22 2`, fill: 'none', stroke: '#7a5634', 'stroke-width': 4 * k }, anim);
      } else {
        const hx = X + ohyb, hy = ZEM - V + Math.abs(ohyb) * 0.25;
        sv('path', { d: `M${X - 9} ${ZEM} Q${X - 6} ${ZEM - V * 0.5} ${r1(hx - 3)} ${r1(hy)} L${r1(hx + 3)} ${r1(hy)} Q${X + 6} ${ZEM - V * 0.5} ${X + 9} ${ZEM}Z`, class: 'kmen' }, anim);
        const tr = 1 + Math.sin(t * (2 + b)) * 0.012 * b;
        [[0, -12, 46], [-30, 12, 34], [32, 10, 34], [ohyb * 0.25, -40, 30]].forEach(([dx, dy, r]) =>
          sv('circle', { cx: r1(hx + dx + ohyb * 0.15), cy: r1(hy + dy), r: r1(r * tr), class: 'koruna' }, anim));
      }
      // větve a listí ve vzduchu
      const letu = b >= 8 ? 10 : b >= 4 ? 6 : 0;
      const vlet = [];
      for (let i = 0; i < letu; i++) {
        const l = listi[i];
        const x = (l.x + t * (40 + b * 30)) % 1060 - 30, y = l.y + Math.sin(t * 3 + l.f) * 12;
        vlet.push([x, y]);
      }
      if (vlet.length) sv('path', { d: teckyD(vlet, 3.2), fill: b >= 8 ? '#7a5634' : '#6aa84f' }, anim);
      // větrný rukáv (korouhev)
      const xp = 820, yp = ZEM - 150;
      const uh = b === 0 ? 0 : Math.min(88, [0, 8, 30, 58, 78, 86][Math.min(b, 5)] || 88) * RAD + Math.sin(t * (2 + b)) * 0.04 * Math.min(b, 4);
      const d = [Math.sin(uh), Math.cos(uh)], q = [-d[1], d[0]], L = 86;
      for (let i = 0; i < 5; i++) {
        const a = i / 5, c = (i + 1) / 5, ha = 14 - 6 * a, hb = 14 - 6 * c, vl = Math.sin(t * (4 + b) + i) * Math.min(3, b * 0.5);
        mnohouhelnik(anim, [[xp + d[0] * L * a + q[0] * ha, yp + d[1] * L * a + q[1] * ha + vl], [xp + d[0] * L * c + q[0] * hb, yp + d[1] * L * c + q[1] * hb + vl],
          [xp + d[0] * L * c - q[0] * hb, yp + d[1] * L * c - q[1] * hb + vl], [xp + d[0] * L * a - q[0] * ha, yp + d[1] * L * a - q[1] * ha + vl]], '', `fill:${i % 2 ? '#f4f4f4' : '#e0503a'}`);
      }
      // tráva
      const tp = trava.map((x, i) => {
        const o = Math.pow(b / 12, 1.2) * 16 + Math.sin(t * (2 + b * 0.6) + i) * (1 + b * 0.35);
        return `M${r1(x)} ${ZEM}Q${r1(x + o * 0.3)} ${ZEM - 8} ${r1(x + o)} ${r1(ZEM - 15 + Math.abs(o) * 0.3)}`;
      }).join('');
      sv('path', { d: tp, fill: 'none', stroke: '#6aa84f', 'stroke-width': 2.2 * k, 'stroke-linecap': 'round' }, anim);
    }
    animace(m, dt => {
      s.t += dt;
      const b = s.b;
      for (const c of kour) { c.a += dt * (0.22 + b * 0.09); if (c.a > 1) c.a -= 1; }
      kresliAnim();
    });

    m.kresli = g => {
      const k = m.k, b = s.b, B = BEAUFORT[b];
      sv('rect', { x: 0, y: 0, width: 1000, height: ZEM, class: 'nebe' }, g);
      sv('rect', { x: 0, y: ZEM, width: 1000, height: 60, class: 'zeme' }, g);
      // dům s komínem
      mnohouhelnik(g, [[80, ZEM], [80, 236], [155, 190], [230, 236], [230, ZEM]], 'teleso');
      sv('rect', { x: 194, y: 188, width: 20, height: 40, class: 'teleso' }, g);
      sv('rect', { x: 110, y: 256, width: 30, height: 26, fill: 'var(--bg-deep)' }, g);
      if (b >= 9) {   // uvolněné tašky
        [[250, 170], [290, 140], [340, 160]].forEach(([x, y], i) => sv('rect', { x, y, width: 14, height: 7, transform: `rotate(${20 + i * 25} ${x} ${y})`, fill: '#b5533c' }, g));
      }
      // stožár
      cara(g, [[820, ZEM], [820, ZEM - 158]], 'silna c-text');
      // šipka síly větru
      if (b > 0) {
        const L = 40 + b * 16;
        cara(g, [[30, 60], [30 + L, 60]], 'silna c-proud');
        hrot(g, [34 + L, 60], [1, 0], k, 1.3, 'c-proud');
        txt(g, 30, 44, 'vítr', 't-proud');
      }
      txt(g, 500, 32, `${b} · ${B.n}`, 't-velky t-stred');
      m.odecet([['Stupeň', `${b} – ${B.n}`], ['Rychlost', B.do == null ? `${cis(B.od)} m/s a víc` : `${cis(B.od)}–${cis(B.do)} m/s`],
        ['V km/h', B.do == null ? `${Math.round(B.od * 3.6)} km/h a víc` : `${Math.round(B.od * 3.6)}–${Math.round(B.do * 3.6)} km/h`]]);
      m.zpravu(`<b>Projevy:</b> ${B.p}`);
      kresliAnim();
    };
    posuvnik('bf-stupen', v => v + ' · ' + BEAUFORT[v].n, v => { s.b = v; m.naplanuj(); });

    Ukoly.definuj('bf-stromy', () => s.b === 7,
      '<b>7 – prudký vítr</b> (13,9–17,1 m/s, asi 50–62 km/h). Při 6. stupni se hýbou jen silné větve, od 7. stupně celé stromy.');
    Ukoly.definuj('bf-kmh', () => s.b === 5,
      '30 km/h : 3,6 ≈ <b>8,3 m/s</b>. To patří do rozmezí 8,0–10,7 m/s – <b>5. stupeň, čerstvý vítr</b>.');
  }

  /* ---------- 3 · Obtékání překážek (tunel) ---------- */
  function modelObtekani() {
    const C = 200, R = 80, cy = R / 2 + 0.4;          // nepatrně mimo osu – souměrnost se pak rozbije sama
    const T = new Tunel('obr-obtekani', {
      cols: C, rows: R, U: 0.1, vychozi: 'valec', sonda: [112, cy], vlecek: 13,
      sceny: {
        valec: { telesa: [{ body: kruh(56, cy, 9.5) }], D: 19, x1: 66 },
        deska: { telesa: [{ body: obdelnik(55, cy - 11, 58, cy + 11) }], D: 22, x1: 58 },
        kapka: { telesa: [{ body: kapka(46, cy, 54, 20) }], D: 20, x1: 100 },
      },
    });
    MODELY.obtekani = T;
    const videno = {};                                  // ustálený odpor po scénách (jen ve vzduchu)
    const NAZ = { valec: 'válec', deska: 'deska', kapka: 'kapka' };
    const TEXT = {
      valec: 'Za válcem se proud odtrhává a vzniká <b>úplav</b> s víry.',
      deska: 'Od ostrých hran desky se proud odtrhne hned – úplav je <b>nejširší</b> a odpor největší.',
      kapka: 'Kapku vzduch obtéká skoro celou a za ní se proud znovu spojí. Úplav je <b>nejužší</b> a odpor ze všech tří nejmenší.',
    };
    T.poTiku = () => {
      const sc = T.s.scena, med = T.s.tekutina === 'med';
      if (T.ustaleno && !med) videno[sc] = T.odpor;
      const pol = [];
      pol.push(['Sonda', T.sonda.platna ? Math.round(T.sonda.hodnota * 100) + ' % rychlosti větru' : 'je v překážce']);
      pol.push(['Odpor', T.krokuOdZmeny > 0.3 * C / T.U ? cis(T.odpor, 2) + (T.ustaleno ? '' : ' (ustaluje se…)') : 'měří se…']);
      const zm = Object.keys(NAZ).filter(k => videno[k] != null).map(k => `${NAZ[k]} ${cis(videno[k], 2)}`);
      if (zm.length) pol.push(['Změřeno ve vzduchu', zm.join(' · ')]);
      const o = T.odecty, h = pol.map(([n, v]) => `<span>${n} <b>${v}</b></span>`).join('');
      if (o.innerHTML !== h) o.innerHTML = h;
      const z = med ? 'V hustém medu je tření velké: tekutina proudí klidně ve vrstvách (<b>laminárně</b>) a víry se neodtrhávají.' + (sc === 'valec' ? '' : ' ' + TEXT[sc])
        : T.stridani >= 4 && sc === 'valec' ? 'Víry se za válcem odtrhávají <b>střídavě</b> nahoře a dole – to je <b>Kármánova vírová stezka</b>.'
          : TEXT[sc] + (T.ustaleno ? '' : ' <i>Proudění se ještě ustaluje…</i>');
      if (T.zprava.innerHTML !== z) T.zprava.innerHTML = z;
    };
    predpoved('obt-tvar', {
      otazka: 'Válec, deska postavená napříč a kapka mají stejnou výšku. Za kterou z nich vznikne <b>nejširší úplav</b> a největší odpor?',
      moznosti: ['Za válcem', 'Za deskou', 'Za kapkou'],
      spravna: 1,
      proc: ['Válec je zaoblený, a tak ho vzduch obteče dál než desku. Úplav za ním je užší.', null, 'Kapka má proudnicový tvar – vzduch ji obteče celou a úplav je nejužší.'],
      vyzkousej: 'Ve vzduchu postupně vyber <b>válec</b>, <b>desku</b> a <b>kapku</b>. U každé chvíli počkej, až se proudění ustálí a změří se odpor.',
      splneno: () => videno.valec != null && videno.deska != null && videno.kapka != null,
      vysvetleni: 'Od ostrých hran desky se proud odtrhne hned a za deskou zůstane široká oblast vírů a podtlaku, která ji táhne dozadu. Kapka má odpor nejmenší – proto mají rychlá vozidla a letadla proudnicový tvar.',
    });
    Ukoly.definuj('obt-sonda', () => T.s.scena === 'valec' && T.ustaleno && T.sonda.platna && T.sonda.x > 66 && T.sonda.hodnota < 0.2,
      'Hned za válcem je úplav: vzduch tu skoro stojí, nebo se dokonce vrací zpátky k válci. Proto se za sloupem nebo za stromem dá schovat před větrem.');
    Ukoly.definuj('obt-viry', () => T.s.scena === 'valec' && T.s.tekutina === 'vzduch' && T.s.rezim === 'viry' && T.stridani >= 6,
      'Víry se odtrhávají střídavě – jeden po směru hodinových ručiček, druhý proti směru. Válec přitom dostává malé boční šťouchance nahoru a dolů.');
    Ukoly.definuj('obt-med', () => T.s.tekutina === 'med' && T.s.scena === 'valec' && T.krokuOdZmeny > 0.6 * C / T.U,
      'V medu je vnitřní tření tak velké, že tekutina proudí klidně ve vrstvách – <b>laminárně</b>. Za válcem se víry neodtrhávají. Klidné proudění ale neznamená malý odpor: lžička v medu jde ztuha.');
  }

  /* ---------- 4 · Odporová síla ---------- */
  const TVARY = { deska: { c: 1.2, n: 'deska' }, krychle: { c: 1.05, n: 'krychle' }, koule: { c: 0.47, n: 'koule' }, kapka: { c: 0.04, n: 'kapka' } };
  const RHO = 1.2;
  const odporF = (tvar, S, v) => 0.5 * TVARY[tvar].c * RHO * (S / 100) * v * v;   // S v dm²
  function modelOdpor() {
    const m = new Model('obr-odpor', 1000, 440);
    const s = { tvar: 'deska', v: 10, S: 5, t: 0, navst: {} };
    MODELY.odpor = { m, s };
    const OX = 250, OY = 220;
    const G = { x0: 640, x1: 970, y0: 380, y1: 60, vmax: 30, fmax: 70 };
    const gx = v => G.x0 + (G.x1 - G.x0) * v / G.vmax, gy = f => G.y0 - (G.y0 - G.y1) * Math.min(f, G.fmax * 1.02) / G.fmax;
    const anim = animVrstva(m);
    const zapis = () => { const k = s.tvar + '|' + s.S; (s.navst[k] = s.navst[k] || {})[s.v] = odporF(s.tvar, s.S, s.v); };
    const pul = () => 12 + 13 * Math.sqrt(s.S);            // poloviční výška tělesa v obrázku
    const proudnice = () => {
      const h = pul(), c = TVARY[s.tvar].c, ucpat = c > 0.3;
      const zadni = s.tvar === 'kapka' ? OX + 4.4 * h : s.tvar === 'deska' ? OX + 5 : OX + h;
      const cary = [];
      for (let j = -4; j <= 4; j++) {
        const y0 = OY + j * 38, d = Math.abs(y0 - OY);
        const pts = [];
        const odsun = (h * h * 1.15) / (d + h * 0.6);
        const uplav = ucpat && d < h * (0.9 + c * 0.5);
        for (let x = 20; x <= 590; x += 8) {
          if (uplav && x > zadni) break;
          const w = s.tvar === 'kapka' ? 2.2 * h : h * 1.1;
          const stred = s.tvar === 'kapka' ? OX + 1.6 * h : OX;
          let bump = Math.exp(-(((x - stred) / w) ** 2)) * odsun;
          if (ucpat && x > stred) bump = Math.max(bump, odsun * Math.exp(-(((x - stred) / (w + c * 160)) ** 2)));
          pts.push([x, y0 + Math.sign(j || 1) * (j === 0 ? 0 : bump)]);
        }
        cary.push({ pts, j, uplav });
      }
      return { cary, zadni };
    };
    function kresliAnim() {
      anim.replaceChildren();
      if (s.v <= 0) return;
      const k = m.k, { cary, zadni } = proudnice(), c = TVARY[s.tvar].c, h = pul();
      const body = [];
      for (const cr of cary) {
        if (cr.j === 0) continue;
        const n = cr.pts.length;
        for (let i = 0; i < n; i += 1) {
          const faze = ((cr.pts[i][0] - s.t * (20 + s.v * 9)) % 60 + 60) % 60;
          if (faze < 8) body.push(cr.pts[i]);
        }
      }
      sv('path', { d: teckyD(body, 2.6 * k), class: 'tecky c-proud' }, anim);
      // víry v úplavu
      if (c > 0.3) {
        const delka = 60 + c * 140, n = 4;
        for (let i = 0; i < n; i++) {
          const x = zadni + 22 + (i + ((s.t * (0.3 + s.v * 0.03)) % 1)) * delka / n, nahore = i % 2 === 0;
          const r = (8 + c * 10) * (0.7 + 0.3 * i / n) * Math.min(1, s.v / 6 + 0.3), y = OY + (nahore ? -1 : 1) * h * 0.45;
          const a0 = s.t * (2 + s.v * 0.2) * (nahore ? 1 : -1), body2 = [];
          for (let u = 0; u < 5.5; u += 0.25) body2.push([x + Math.cos(a0 + u * (nahore ? 1 : -1)) * r * u / 5.5, y + Math.sin(a0 + u * (nahore ? 1 : -1)) * r * u / 5.5]);
          cara(anim, body2, 'tenka c-proud', 'opacity:.75');
        }
      }
    }
    animace(m, dt => { s.t += dt; kresliAnim(); });

    m.kresli = g => {
      const k = m.k, h = pul(), F = odporF(s.tvar, s.S, s.v), { cary } = proudnice();
      // tunel
      sv('rect', { x: 10, y: 30, width: 590, height: 380, rx: 10, fill: 'none', stroke: 'var(--border-strong)', 'stroke-width': 1.2 * k }, g);
      for (const cr of cary) if (cr.j !== 0) cara(g, cr.pts, 'tenka c-proud', 'opacity:.55');
      for (let j = -3; j <= 3; j += 2) hrot(g, [44, OY + j * 38], [1, 0], k, 0.9, 'c-proud');
      // držák a těleso
      cara(g, [[OX + (s.tvar === 'kapka' ? 1.6 * h : 0), OY + h * (s.tvar === 'kapka' ? 0.35 : 1)], [OX + (s.tvar === 'kapka' ? 1.6 * h : 0), 402]], 'silna c-text');
      if (s.tvar === 'deska') sv('rect', { x: OX - 3, y: OY - h, width: 8, height: 2 * h, class: 'teleso' }, g);
      else if (s.tvar === 'krychle') sv('rect', { x: OX - h, y: OY - h, width: 2 * h, height: 2 * h, class: 'teleso' }, g);
      else if (s.tvar === 'koule') { sv('circle', { cx: OX, cy: OY, r: h, class: 'teleso' }, g); sv('ellipse', { cx: OX - h * 0.35, cy: OY - h * 0.35, rx: h * 0.3, ry: h * 0.18, fill: 'rgba(255,255,255,.25)' }, g); }
      else mnohouhelnik(g, kapka(OX - h * 0.6, OY, 4.8 * h, 2 * h), 'teleso');
      // síla
      if (F > 0.005) {
        const L = Math.min(300, 5 * F), x0 = OX + (s.tvar === 'kapka' ? 1.6 * h : 0);
        cara(g, [[x0, OY], [x0 + L, OY]], 'silna c-odpor');
        hrot(g, [x0 + L + 4 * k, OY], [1, 0], k, 1.5, 'c-odpor');
        if (5 * F > 300) txt(g, x0 + L - 20, OY + 24, '≫', 't-odpor');
        txt(g, x0 + (s.tvar === 'deska' ? 14 : s.tvar === 'kapka' ? 3.2 * h : h + 8), OY - 14, `F = ${cis(F, F < 1 ? 2 : 1)} N`, 't-odpor');
      }
      txt(g, 26, 400, 'vítr ' + cisK(s.v, 1) + ' m/s', 't-proud');
      // graf
      sv('rect', { x: G.x0 - 40, y: G.y1 - 30, width: G.x1 - G.x0 + 56, height: G.y0 - G.y1 + 76, rx: 10, class: 'graf-pozadi' }, g);
      for (let f = 0; f <= G.fmax; f += 10) { cara(g, [[G.x0, gy(f)], [G.x1, gy(f)]], '', 'stroke:var(--border);stroke-width:' + r1(k)); txt(g, G.x0 - 8, gy(f) + 4, String(f), 't-maly t-konec'); }
      for (let v = 0; v <= G.vmax; v += 10) txt(g, gx(v), G.y0 + 18, String(v), 't-maly t-stred');
      cara(g, [[G.x0, G.y1], [G.x0, G.y0], [G.x1, G.y0]], 'tenka c-osa');
      txt(g, G.x1, G.y0 + 36, 'rychlost v (m/s)', 't-maly t-konec');
      txt(g, G.x0 - 30, G.y1 - 12, 'odporová síla F (N)', 't-maly');
      const krivka = tvar => { const p = []; for (let v = 0; v <= G.vmax; v += 0.5) { const f = odporF(tvar, s.S, v); p.push([gx(v), gy(f)]); if (f > G.fmax) break; } return p; };
      for (const t in TVARY) {
        if (t === s.tvar) continue;
        const p = krivka(t);
        cara(g, p, 'tenka carkovana c-text');
        const kon = p[p.length - 1];
        txt(g, Math.min(kon[0] + 4, G.x1 - 2), kon[1] - 4, TVARY[t].n, 't-maly ' + (kon[0] > G.x1 - 50 ? 't-konec' : ''));
      }
      const p = krivka(s.tvar);
      cara(g, p, 'silna c-odpor');
      const bx = gx(s.v), by = gy(F);
      cara(g, [[bx, G.y0], [bx, by], [G.x0, by]], 'tenka carkovana c-odpor');
      sv('circle', { cx: bx, cy: by, r: 6 * k, class: 'vypln c-odpor' }, g);
      // zpráva o zdvojnásobení
      const zaz = s.navst[s.tvar + '|' + s.S] || {};
      const par = [[10, 20], [5, 10], [15, 30], [7.5, 15]].find(([a, b]) => zaz[a] != null && zaz[b] != null && (s.v === a || s.v === b));
      m.odecet([['Tvar', `${TVARY[s.tvar].n} (C = ${cis(TVARY[s.tvar].c, 2)})`], ['Rychlost', `${cisK(s.v, 1)} m/s = ${kmh(s.v)}`], ['Čelní plocha', `${s.S} dm²`],
        ['Odporová síla', `${cis(F, F < 1 ? 2 : 1)} N`], ['Jako tíha závaží', F >= 9.81 ? `${cis(F / 9.81, 1)} kg` : `${Math.round(F / 9.81 * 1000)} g`]]);
      m.zpravu(par ? `Při ${cisK(par[0], 1)} m/s je odpor ${cis(zaz[par[0]], 1)} N, při ${cisK(par[1], 1)} m/s už ${cis(zaz[par[1]], 1)} N – <b>${cisK(zaz[par[1]] / zaz[par[0]], 1)}× víc</b>, i když rychlost vzrostla jen 2×.`
        : s.tvar === 'kapka' ? `Kapka má ${Math.round(TVARY.deska.c / TVARY.kapka.c)}× menší odpor než deska se stejnou čelní plochou – vzduch ji obteče skoro bez vírů.`
          : s.v === 0 ? 'Vítr nefouká – odporová síla je nulová.' : 'Zkus rychlost zdvojnásobit a sleduj, kolikrát vzroste síla.');
      kresliAnim();
    };
    segment($('#odpor-tvar'), s.tvar, v => { s.tvar = v; zapis(); m.naplanuj(); });
    const posV = posuvnik('odpor-v', v => `${cisK(v, 1)} m/s`, v => { s.v = v; zapis(); m.naplanuj(); });
    posuvnik('odpor-s', v => `${v} dm²`, v => { s.S = v; zapis(); m.naplanuj(); });
    zapis();
    $('#odpor-priklad-model').addEventListener('click', () => {
      posV.nastav(10);
      m.fig.scrollIntoView({ behavior: bezPohybu() ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => posV.nastav(20), 1400);
    });

    predpoved('odpor-2x', {
      otazka: 'Rychlost větru zvýšíš z <b>10 m/s na 20 m/s</b>, tvar i plocha zůstanou stejné. Odporová síla bude…',
      moznosti: ['stejná', '2× větší', '4× větší', '8× větší'],
      spravna: 2,
      proc: ['Rychlejší vzduch naráží do tělesa víc – síla určitě vzroste.', 'Síla neroste s rychlostí rovnoměrně: dvojnásobná rychlost znamená dvakrát víc vzduchu za sekundu a ten navíc naráží dvakrát rychleji.', null, 'Tolik ne – 8× by to bylo, kdyby síla rostla s třetí mocninou rychlosti.'],
      vyzkousej: 'Nastav rychlost <b>10 m/s</b>, pak <b>20 m/s</b> (se stejným tvarem a plochou) a porovnej síly.',
      splneno: () => Object.values(s.navst).some(z => z[10] != null && z[20] != null),
      vysvetleni: 'Při dvojnásobné rychlosti narazí do tělesa za sekundu <b>dvakrát víc vzduchu</b> a každý jeho kousek naráží <b>dvakrát rychleji</b>. Odpor proto vzroste 2 · 2 = <b>4×</b>. Trojnásobná rychlost dá 9× větší odpor.',
    });
    Ukoly.definuj('odpor-kapka', () => s.tvar === 'kapka' && s.v >= 5,
      'Kapka má součinitel odporu jen 0,04, deska 1,2 – to je <b>30× méně</b>. Proto mají rychlovlaky, letadla i závodní přilby protáhlý proudnicový tvar.');
    Ukoly.definuj('odpor-10n', () => s.tvar === 'deska' && s.S === 5 && Math.abs(odporF('deska', 5, s.v) - 10) <= 0.5,
      `Stačí asi <b>17 m/s</b> (přes 60 km/h) – to je 7. stupeň, prudký vítr. Na desku velkou jako list papíru A4 by tlačil silou, jakou drží ruka litr vody.`);
  }

  /* ---------- 5 · Zúžení: rychlost a tlak ---------- */
  function modelZuzeni() {
    const m = new Model('obr-zuzeni', 1000, 420);
    const s = { sirka: 100, v: 3, tlak: false, t: 0 };
    MODELY.zuzeni = { m, s };
    const OS = 300, H = 62, TL = 12, XS = 500;
    const prof = x => { const d = Math.abs(x - XS); return d < 55 ? 1 : d > 175 ? 0 : Math.cos((d - 55) / 120 * Math.PI / 2) ** 2; };
    const pol = x => H - (H - H * s.sirka / 100) * prof(x);
    const rych = x => s.v * H / pol(x);
    const dp = x => -0.5 * RHO * (rych(x) ** 2 - s.v ** 2);     // Pa vůči okolí (za trubicí je tlak okolního vzduchu), v zúžení záporný
    const rnd = nahoda(11);
    const castice = Array.from({ length: 130 }, () => ({ x: 40 + rnd() * 920, e: (rnd() * 2 - 1) * 0.86 }));
    const anim = animVrstva(m);
    const MERIDLA = [[200, 'před'], [XS, 'v zúžení'], [800, 'za']];
    function kresliAnim() {
      anim.replaceChildren();
      const k = m.k, skup = [[], [], [], []];
      for (const c of castice) {
        const r = rych(c.x) / s.v, i = r < 1.25 ? 0 : r < 2 ? 1 : r < 3 ? 2 : 3;
        skup[i].push([c.x, OS + c.e * pol(c.x)]);
      }
      const barvy = [0, 35, 65, 100];
      skup.forEach((b, i) => sv('path', { d: teckyD(b, 3.4 * k), class: 'tecky', style: `fill:color-mix(in srgb, var(--v-odpor) ${barvy[i]}%, var(--v-proud))` }, anim));
    }
    animace(m, dt => {
      s.t += dt;
      for (const c of castice) { c.x += rych(c.x) * 22 * dt; if (c.x > 960) c.x -= 920; }
      kresliAnim();
    });
    m.kresli = g => {
      const k = m.k;
      const horni = [], dolni = [];
      for (let x = 40; x <= 960; x += 5) { horni.push([x, OS - pol(x)]); dolni.push([x, OS + pol(x)]); }
      mnohouhelnik(g, [...horni, [960, OS - pol(960) - TL], ...horni.map(([x, y]) => [x, y - TL]).reverse()], 'stena');
      mnohouhelnik(g, [...dolni, [960, OS + pol(960) + TL], ...dolni.map(([x, y]) => [x, y + TL]).reverse()], 'stena');
      txt(g, 44, OS - H - TL - 10, 'vzduch z ventilátoru →', 't-proud');
      // šipky rychlosti
      const sip = (x, y) => { const v = rych(x), L = 18 + v * 6; cara(g, [[x - L / 2, y], [x + L / 2, y]], 'c-proud'); hrot(g, [x + L / 2 + 3 * k, y], [1, 0], k, 1, 'c-proud'); txt(g, x, y + 28, `${cisK(v, 1)} m/s`, 't-silny t-stred'); };
      sip(200, OS + H + TL + 26); sip(XS, OS + H + TL + 26); sip(800, OS + H + TL + 26);
      {
        for (const [x, nazev] of MERIDLA) {
          const p = dp(x), yc = 104, r = 40, vrch = OS - pol(x) - TL;
          cara(g, [[x, vrch], [x, yc + r]], 'silna c-text');
          sv('circle', { cx: x, cy: yc, r, fill: 'var(--bg-panel)', stroke: 'var(--text-muted)', 'stroke-width': 2 * k }, g);
          for (let i = -4; i <= 4; i++) {           // stupnice −600 … +600 Pa, nula nahoře
            const a = -Math.PI / 2 + i * 0.3;
            cara(g, [[x + Math.cos(a) * (r - 4), yc + Math.sin(a) * (r - 4)], [x + Math.cos(a) * (r - (i ? 9 : 13)), yc + Math.sin(a) * (r - (i ? 9 : 13))]], 'tenka c-text');
          }
          txt(g, x - r + 6, yc + 22, '−', 't-maly t-podtlak'); txt(g, x + r - 12, yc + 22, '+', 't-maly t-pretlak');
          if (!s.tlak) {
            txt(g, x, yc + 10, '?', 't-velky t-stred');
            txt(g, x, yc - r - 10, nazev, 't-maly t-stred');
            continue;
          }
          const a = -Math.PI / 2 + omez(-p / 150, -4.2, 4.2) * 0.3 * -1;
          cara(g, [[x, yc], [x + Math.cos(a) * (r - 8), yc + Math.sin(a) * (r - 8)]], 'silna', `stroke:var(${p < -0.5 ? '--v-podtlak' : '--text'})`);
          sv('circle', { cx: x, cy: yc, r: 3.5 * k, fill: 'var(--text)' }, g);
          txt(g, x, yc - r - 10, nazev, 't-maly t-stred');
          txt(g, x + r + 8, yc + 5, (Math.abs(p) < 0.5 ? '0' : cis(-Math.abs(p), 0)) + ' Pa', 't-silny ' + (p < -0.5 ? 't-podtlak' : ''));
        }
      }
      const v2 = rych(XS), p2 = dp(XS);
      m.odecet([['Před zúžením', `${cisK(s.v, 1)} m/s`], ['V zúžení', `${cisK(v2, 1)} m/s`], ['Zrychlení', `${cisK(v2 / s.v, 2)}×`],
        s.tlak && ['Tlak v zúžení', Math.abs(p2) < 0.5 ? 'stejný jako okolo' : `o ${cis(-p2, 0)} Pa menší než okolo`]]);
      m.zpravu(s.sirka === 100 ? 'Trubice je všude stejně široká, vzduch v ní proudí všude stejně rychle.'
        : `Nejužší místo má ${s.sirka} % šířky trubice, a tak jím musí vzduch proudit ${cisK(100 / s.sirka, 2)}× rychleji – jinak by se před zúžením hromadil.`
          + (s.tlak ? ' Tlakoměr v zúžení ukazuje <b>podtlak</b>: kde vzduch proudí rychleji, je tlak menší.' : ''));
      kresliAnim();
    };
    posuvnik('zuz-sirka', v => v + ' %', v => { s.sirka = v; m.naplanuj(); });
    posuvnik('zuz-v', v => cisK(v, 1) + ' m/s', v => { s.v = v; m.naplanuj(); });
    prepinac('zuz-tlak', v => { s.tlak = v; m.naplanuj(); });

    predpoved('zuz-rychlost', {
      otazka: 'Trubici zúžíš v jednom místě na <b>polovinu</b> šířky. Jak rychle poletí vzduch v zúžení?',
      moznosti: ['Poloviční rychlostí – zúžení ho přibrzdí', 'Stejnou rychlostí', 'Dvojnásobnou rychlostí'],
      spravna: 2,
      proc: ['Vzduch se v trubici nemůže hromadit: kolik ho vteče, tolik musí projít i zúžením. Užším místem to stihne jen rychleji.', 'Stejnou rychlostí by užším místem prošlo jen půl vzduchu – zbytek by se před zúžením hromadil.'],
      vyzkousej: 'Nastav šířku zúžení na <b>50 %</b> a porovnej rychlosti.',
      splneno: () => s.sirka === 50,
      vysvetleni: 'Za sekundu musí zúžením projít stejně vzduchu jako širokou částí. Poloviční šířkou to stihne jen <b>dvojnásobnou rychlostí</b>. Stejně to funguje s vodou – proto palec na konci hadice udělá prudký proud.',
    });
    predpoved('zuz-tlak', {
      otazka: 'Kde bude v zúžené trubici <b>nejmenší tlak</b>?',
      moznosti: ['Před zúžením – vzduch tam naráží', 'V nejužším místě', 'Za zúžením'],
      spravna: 1,
      proc: ['Před zúžením je tlak stejný jako za ním. Vzduch se tam nehromadí – jen se začíná zrychlovat.', null, 'Za zúžením se vzduch zase zpomalí a tlak se vrátí na původní hodnotu.'],
      vyzkousej: 'Zapni <b>tlakoměry</b> a zuž trubici aspoň na 70 %.',
      splneno: () => s.tlak && s.sirka <= 70,
      vysvetleni: 'Aby se vzduch v zúžení zrychlil, musí ho tlačit větší tlak zezadu než zepředu. V nejužším místě, kde proudí nejrychleji, je proto tlak <b>nejmenší</b>.',
    });
    Ukoly.definuj('zuz-4x', () => s.sirka === 25,
      'Čtvrtinovou šířkou musí projít stejně vzduchu, proto proudí <b>4× rychleji</b>. A podtlak je tu mnohem větší než u zúžení na polovinu.');
  }

  /* ---------- 5b · Dva papíry ---------- */
  function modelPapiry() {
    const m = new Model('obr-papiry', 1000, 300);
    const s = { fouka: false, posun: 0, fouknuto: 0, t: 0 };
    MODELY.papiry = { m, s };
    const XL = 440, XR = 560, Y1 = 50, L = 210;
    const anim = animVrstva(m);
    function kresliAnim() {
      anim.replaceChildren();
      const k = m.k, p = s.posun;
      const papir = (x, sm) => {
        const dx = sm * p;
        sv('path', { d: `M${x - 3} ${Y1} Q${r1(x - 3)} ${Y1 + L * 0.55} ${r1(x - 3 + dx)} ${Y1 + L} L${r1(x + 3 + dx)} ${Y1 + L} Q${r1(x + 3)} ${Y1 + L * 0.55} ${x + 3} ${Y1}Z`, class: 'papir' }, anim);
      };
      papir(XL, 1); papir(XR, -1);
      if (s.fouka) {
        const body = [];
        for (let i = 0; i < 16; i++) { const y = Y1 - 10 + ((i * 17 + s.t * 420) % (L + 30)); body.push([500 + Math.sin(i * 2.1) * 12, y]); }
        sv('path', { d: teckyD(body, 3 * k), class: 'tecky c-proud' }, anim);
        for (const [x, sm] of [[XL - 70, 1], [XR + 70, -1]]) {
          cara(anim, [[x, Y1 + L * 0.7], [x + sm * 40, Y1 + L * 0.7]], 'silna c-pretlak');
          hrot(anim, [x + sm * 44, Y1 + L * 0.7], [sm, 0], k, 1.1, 'c-pretlak');
        }
        txt(anim, XL - 80, Y1 + L * 0.7 - 16, 'klidný vzduch – běžný tlak', 't-maly t-konec t-pretlak');
        txt(anim, XR + 80, Y1 + L * 0.7 - 16, 'klidný vzduch – běžný tlak', 't-maly t-pretlak');
        txt(anim, 500, Y1 + L + 30, 'rychlý proud – menší tlak', 't-maly t-stred t-podtlak');
      }
    }
    let posl = 0;
    const smycka = t => {
      const dt = posl ? Math.min(0.05, (t - posl) / 1000) : 0; posl = t;
      const cil = s.fouka ? 34 : 0;
      s.posun += (cil - s.posun) * Math.min(1, dt * (s.fouka ? 5 : 3));
      if (bezPohybu()) s.posun = cil;
      s.t += dt;
      if (s.fouka) s.fouknuto += dt;
      kresliAnim();
      Ukoly.kontrola();
      if (s.fouka || Math.abs(s.posun) > 0.3) requestAnimationFrame(smycka); else { posl = 0; s.posun = 0; kresliAnim(); }
    };
    m.kresli = g => {
      const k = m.k;
      cara(g, [[380, Y1 - 4], [620, Y1 - 4]], 'silna c-text');
      // brčko shora
      sv('rect', { x: 494, y: -10, width: 12, height: 40, rx: 3, fill: 'var(--v-teleso)', stroke: 'var(--v-teleso-okraj)' }, g);
      txt(g, 520, 22, 'brčko', 't-maly');
      m.zpravu(s.fouknuto > 0.8 ? 'Papíry se <b>přiblížily k sobě</b>. Mezi nimi proudí vzduch rychle a má menší tlak než klidný vzduch z vnější strany, který je k sobě přitlačí.'
        : 'Drž tlačítko a sleduj papíry.');
      kresliAnim();
    };
    const b = $('#papiry-foukni');
    const start = () => { if (s.fouka) return; s.fouka = true; posl = 0; requestAnimationFrame(smycka); };
    const stop = () => { if (!s.fouka) return; s.fouka = false; m.naplanuj(); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); start(); });
    b.addEventListener('pointerup', () => setTimeout(stop, 250));
    b.addEventListener('pointerleave', stop);
    b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); setTimeout(stop, 1600); } });
    b.addEventListener('click', e => { if (e.detail === 0) { start(); setTimeout(stop, 1600); } });

    predpoved('papiry', {
      otazka: 'Dva listy papíru visí kousek od sebe. Mezi ně silně foukneš. Co udělají?',
      moznosti: ['Rozletí se od sebe', 'Přiblíží se k sobě', 'Nepohnou se'],
      spravna: 1,
      proc: ['Tak by to vypadalo, kdyby proud do papírů narážel. Proud ale jde podél nich – a rychle proudící vzduch má menší tlak.', null, 'Pohnou se – tlaky z obou stran už nejsou stejné.'],
      vyzkousej: 'Podrž tlačítko <b>💨 Foukni mezi papíry</b>.',
      splneno: () => s.fouknuto > 0.8,
      vysvetleni: 'Mezi papíry proudí vzduch rychle, a proto má <b>menší tlak</b> než klidný vzduch z vnější strany. Ten papíry přitlačí k sobě. Pokus si vyzkoušej doma – funguje i se dvěma balónky na provázcích.',
    });
  }

  /* ---------- 6 · Křídlo: Žukovského profil ----------
     Kruh v rovině ζ (střed μ, poloměr R, prochází bodem 1) se zobrazením
     z = ζ + 1/ζ změní v profil křídla. Obtékání kruhu se známe přesně
     (proud + dipól + vír), Kuttova podmínka určí cirkulaci Γ tak, aby
     vzduch odtékal z ostré odtokové hrany. Proudnice se trasují v rovině ζ
     a zobrazí do z; obrázek je pak otočený, aby proud tekl vodorovně. */
  const Kx = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
    sc: (a, k) => [a[0] * k, a[1] * k], abs: a => Math.hypot(a[0], a[1]),
  };
  const PROFILY = { soumerny: { eps: 0.1, del: 0, aK: 14, n: 'souměrný' }, prohnuty: { eps: 0.1, del: 0.07, aK: 15, n: 'prohnutý' } };
  const KRIDLO = { S: 16, m: 1000 };                       // m², kg
  function zukovskij(profil, alfa) {
    const P = PROFILY[profil], mu = [-P.eps, P.del], R = Math.hypot(1 + P.eps, P.del), beta = Math.atan2(P.del, 1 + P.eps);
    const a = alfa * RAD, G = 4 * Math.PI * R * Math.sin(a + beta);
    const eA = [Math.cos(a), Math.sin(a)], eAm = [Math.cos(a), -Math.sin(a)];
    const dW = z => { const q = Kx.sub(z, mu); return Kx.add(Kx.sub(eAm, Kx.div(Kx.sc(eA, R * R), Kx.mul(q, q))), Kx.div([0, G / (2 * Math.PI)], q)); };
    const mapa = z => Kx.add(z, Kx.div([1, 0], z));
    const rychlostZ = z => { const d = Kx.sub([1, 0], Kx.div([1, 0], Kx.mul(z, z))); return Kx.abs(Kx.div(dW(z), d)); };
    // povrch a tětiva
    const povrch = [];
    for (let i = 0; i < 160; i++) { const t = -beta + 2 * Math.PI * i / 160; povrch.push({ t, z: mapa(Kx.add(mu, [R * Math.cos(t), R * Math.sin(t)])) }); }
    const xs = povrch.map(p => p.z[0]), tetiva = Math.max(...xs) - Math.min(...xs);
    return { P, mu, R, beta, a, G, eA, dW, mapa, rychlostZ, povrch, tetiva, stred: (Math.max(...xs) + Math.min(...xs)) / 2 };
  }
  /* Součinitel vztlaku skutečného křídla: sklon z teorie × 0,72 (konečné rozpětí, tření),
     za kritickým úhlem prudký pokles. */
  const TETIVA = {};
  function cL(profil, alfa) {
    const P = PROFILY[profil];
    if (!TETIVA[profil]) TETIVA[profil] = zukovskij(profil, 0);
    const Z = TETIVA[profil];
    const J = a => 0.72 * 2 * 4 * Math.PI * Z.R * Math.sin(a * RAD + Z.beta) / Z.tetiva;
    if (alfa <= P.aK) return J(alfa);
    const max = J(P.aK), d = alfa - P.aK;
    return max * (0.6 + 0.4 * Math.exp(-d / 2.2));
  }
  const cD = (profil, alfa) => 0.012 + 0.018 * cL(profil, Math.min(alfa, PROFILY[profil].aK)) ** 2 + Math.max(0, alfa - PROFILY[profil].aK) * 0.03;

  function modelKridlo() {
    const m = new Model('obr-kridlo', 1000, 480);
    const s = { profil: 'soumerny', a: 0, v: 50, znacky: false, tlak: false, t: 0, byl0: false };
    MODELY.kridlo = { m, s };
    const X0 = 350, Y0 = 250, SK = 118, KLIP = 715;
    const clip = sv('clipPath', { id: 'kr-klip' }, m.defs); sv('rect', { x: 0, y: 0, width: KLIP, height: 480 }, clip);
    const anim = animVrstva(m); anim.setAttribute('clip-path', 'url(#kr-klip)');
    let cache = null;
    const zobraz = (z, a) => { const c = Math.cos(a), sn = Math.sin(a); return [X0 + (z[0] * c + z[1] * sn) * SK, Y0 - (-z[0] * sn + z[1] * c) * SK]; };

    function spocitej() {
      const klic = s.profil + '|' + s.a;
      if (cache && cache.klic === klic) return cache;
      const P = PROFILY[s.profil], zak = s.a > P.aK, J = zukovskij(s.profil, Math.min(s.a, P.aK + 1));
      const a = s.a * RAD;
      const povrch = J.povrch.map(p => zobraz(Kx.sub(p.z, [J.stred, 0]), a));
      const cary = [];
      for (let sd = -2.6; sd <= 2.61; sd += 0.26) {
        let z = Kx.add(J.mu, Kx.mul(J.eA, [-6.5, sd]));
        const body = [], cas = [0];
        let naraz = false;
        for (let krok = 0; krok < 1400; krok++) {
          const w = J.dW(z), vel = [w[0], -w[1]], n = Kx.abs(vel);
          if (n < 1e-7) break;
          const vzd = Kx.abs(Kx.sub(z, J.mu)) - J.R;
          const h = 0.012 + 0.05 * Math.min(1, vzd / 1.2);
          const zm = Kx.add(z, Kx.sc(vel, h / 2 / n));
          const w2 = J.dW(zm), v2 = [w2[0], -w2[1]], n2 = Kx.abs(v2);
          const zn = Kx.add(z, Kx.sc(v2, h / (n2 || 1)));
          if (Kx.abs(Kx.sub(zn, J.mu)) < J.R * 1.0015) { naraz = true; break; }
          const pz = Kx.sub(J.mapa(z), [J.stred, 0]), pn = Kx.sub(J.mapa(zn), [J.stred, 0]);
          let rz = J.rychlostZ(Kx.sc(Kx.add(z, zn), 0.5));
          if (!isFinite(rz) || rz < 0.05) rz = 0.05;
          if (!body.length) body.push(zobraz(pz, a));
          body.push(zobraz(pn, a));
          cas.push(cas[cas.length - 1] + Kx.abs(Kx.sub(pn, pz)) / Math.min(rz, 4));
          z = zn;
          if (Kx.mul(Kx.sub(z, J.mu), [J.eA[0], -J.eA[1]])[0] > 5.5) break;
        }
        cary.push({ sd, body, cas, naraz });
      }
      // která proudnice jde nad a která pod křídlem (podle polohy nad středem tětivy)
      const hornY = x => { let best = null; for (const p of povrch) if (Math.abs(p[0] - x) < 6 && (best == null || p[1] < best)) best = p[1]; return best; };
      const yStred = hornY(X0) ?? Y0;
      for (const c of cary) {
        let nej = null; for (const p of c.body) if (nej == null || Math.abs(p[0] - X0) < Math.abs(nej[0] - X0)) nej = p;
        c.nahore = nej && Math.abs(nej[0] - X0) < 20 ? nej[1] < yStred + 4 : null;
      }
      // odtržení proudu za kritickým úhlem: blízké horní proudnice se od povrchu odpoutají
      const xNab = Math.min(...povrch.map(p => p[0])), xOdt = Math.max(...povrch.map(p => p[0]));
      const odtrh = { x: xNab + 0.12 * (xOdt - xNab) };
      if (zak) {
        const horni = cary.filter(c => c.nahore).sort((p, q) => p.sd - q.sd).slice(0, 4);
        horni.forEach((c, i) => {
          const j = c.body.findIndex(p => p[0] > odtrh.x);
          if (j < 2) return;
          const p0 = c.body[j], pp = c.body[j - 2];
          let d = V.norm([p0[0] - pp[0], p0[1] - pp[1]]);
          d = V.norm([d[0] + 0.4, d[1] - 0.25 - 0.1 * (3 - i)]);
          const nove = c.body.slice(0, j + 1), cas = c.cas.slice(0, j + 1);
          let p = p0;
          for (let k = 0; k < 90 && p[0] < KLIP + 20; k++) {
            const t = k / 40; const dd = V.norm([d[0] * (1 - Math.min(1, t)) + Math.min(1, t), d[1] * (1 - Math.min(1, t))]);
            p = [p[0] + dd[0] * 7, p[1] + dd[1] * 7]; nove.push(p); cas.push(cas[cas.length - 1] + 7 / SK / 0.8);
          }
          c.body = nove; c.cas = cas;
        });
        odtrh.hranice = horni.length ? horni[0] : null;
      }
      // tlak na povrchu: Cp = 1 − (v/U)²
      const tlak = [];
      for (let i = 0; i < J.povrch.length; i += 5) {
        const t = J.povrch[i].t;
        if (Math.abs(((t + J.beta) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)) < 0.25 || Math.abs(((t + J.beta) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - 2 * Math.PI) < 0.25) continue;
        const zeta = Kx.add(J.mu, [J.R * 1.001 * Math.cos(t), J.R * 1.001 * Math.sin(t)]);
        const v = J.rychlostZ(zeta); if (!isFinite(v)) continue;
        const dz = Kx.sub([1, 0], Kx.div([1, 0], Kx.mul(zeta, zeta)));
        const nZ = Kx.mul(dz, [Math.cos(t), Math.sin(t)]), nL = Kx.abs(nZ) || 1;
        const p = zobraz(Kx.sub(J.mapa(zeta), [J.stred, 0]), a);
        const c = Math.cos(a), sn = Math.sin(a), nx = (nZ[0] * c + nZ[1] * sn) / nL, ny = -(-nZ[0] * sn + nZ[1] * c) / nL;
        let cp = 1 - v * v;
        if (zak && ny < 0 && p[0] > odtrh.x) cp *= 0.25;
        tlak.push({ p, n: [nx, ny], cp: omez(cp, -3, 1) });
      }
      cache = { klic, J, povrch, cary, zak, tlak, odtrh, xNab, xOdt };
      return cache;
    }
    const vztlak = () => 0.5 * RHO * s.v * s.v * KRIDLO.S * cL(s.profil, s.a);
    const tiha = KRIDLO.m * 9.81;

    function kresliAnim() {
      anim.replaceChildren();
      const k = m.k, c = spocitej();
      if (s.znacky) {
        const T = 0.55, tt = (s.t * 0.9) % T, skupiny = { true: [], false: [] };
        for (let n = 0; n < 16; n++) {
          const tau = tt + n * T;
          for (const cr of c.cary) {
            if (cr.nahore == null || !cr.body.length || tau > cr.cas[cr.cas.length - 1]) continue;
            let i = 1; while (i < cr.cas.length - 1 && cr.cas[i] < tau) i++;
            const u = (tau - cr.cas[i - 1]) / ((cr.cas[i] - cr.cas[i - 1]) || 1), A = cr.body[i - 1], B = cr.body[i];
            (skupiny[cr.nahore][n] = skupiny[cr.nahore][n] || []).push({ sd: cr.sd, p: [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u] });
          }
        }
        const vse = [];
        for (const str of ['true', 'false']) skupiny[str].forEach(sk => {
          if (!sk) return;
          sk.sort((a, b) => a.sd - b.sd);
          cara(anim, sk.map(x => x.p), 'c-odpor', 'opacity:.85');
          sk.forEach(x => vse.push(x.p));
        });
        sv('path', { d: teckyD(vse, 3.4 * k), class: 'tecky c-odpor' }, anim);
      } else {
        const body = [];
        for (const cr of c.cary) {
          const L = cr.cas[cr.cas.length - 1];
          for (let tau = (s.t * 0.9) % 0.3; tau < L; tau += 0.3) {
            let i = 1; while (i < cr.cas.length - 1 && cr.cas[i] < tau) i++;
            const u = (tau - cr.cas[i - 1]) / ((cr.cas[i] - cr.cas[i - 1]) || 1), A = cr.body[i - 1], B = cr.body[i];
            if (A && B) body.push([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u]);
          }
        }
        sv('path', { d: teckyD(body, 2.4 * k), class: 'tecky c-proud' }, anim);
      }
      if (c.zak) {                                    // víry nad odtrženým proudem
        const hor = c.povrch.filter(p => p[0] > c.odtrh.x);
        for (let i = 0; i < 5; i++) {
          const x = c.odtrh.x + 40 + i * 70 + ((s.t * 40) % 70), p = hor.reduce((a, b) => Math.abs(b[0] - x) < Math.abs(a[0] - x) ? b : a, hor[0]);
          const y = Math.min(p ? p[1] : Y0, Y0) - 24 - i * 9, r = 12 + i * 3, a0 = s.t * 4 + i, b2 = [];
          for (let u = 0; u < 6; u += 0.25) b2.push([x + Math.cos(a0 + u) * r * u / 6, y + Math.sin(a0 + u) * r * u / 6]);
          cara(anim, b2, 'tenka c-proud', 'opacity:.8');
        }
      }
    }
    animace(m, dt => { s.t += dt; kresliAnim(); });

    m.kresli = g => {
      const k = m.k, c = spocitej(), cl = cL(s.profil, s.a), cd = cD(s.profil, s.a), L = vztlak();
      const gp = sv('g', { 'clip-path': 'url(#kr-klip)' }, g);
      for (const cr of c.cary) if (cr.body.length > 1) cara(gp, cr.body, 'tenka c-proud', 'opacity:.5');
      hrot(gp, [30, 60], [1, 0], k, 1.1, 'c-proud'); txt(gp, 20, 44, 'proud vzduchu', 't-proud t-maly');
      // tlak na povrchu
      if (s.tlak) for (const t of c.tlak) {
        const Lp = Math.min(70, Math.abs(t.cp) * 34);
        if (Lp < 3) continue;
        if (t.cp < 0) { const e = [t.p[0] + t.n[0] * Lp, t.p[1] + t.n[1] * Lp]; cara(gp, [t.p, e], 'c-podtlak'); hrot(gp, e, t.n, k, 0.7, 'c-podtlak'); }
        else { const z = [t.p[0] + t.n[0] * (Lp + 4), t.p[1] + t.n[1] * (Lp + 4)]; cara(gp, [z, t.p], 'c-pretlak'); hrot(gp, t.p, [-t.n[0], -t.n[1]], k, 0.7, 'c-pretlak'); }
      }
      mnohouhelnik(g, c.povrch, 'teleso');
      // tětiva a úhel náběhu
      const nab = c.povrch.reduce((a, b) => b[0] < a[0] ? b : a), odt = c.povrch.reduce((a, b) => b[0] > a[0] ? b : a);
      cara(g, [[nab[0] - 60, odt[1] + (nab[1] - odt[1]) * 0], [odt[0] + 30, odt[1]]], 'tenka carkovana c-osa');
      cara(g, [nab, odt], 'tenka carkovana c-text');
      if (Math.abs(s.a) >= 2) txt(g, nab[0] - 58, Math.min(nab[1], odt[1]) - 8, `α = ${s.a}°`, 't-silny');
      // síly (ze čtvrtiny tětivy)
      const q = [nab[0] + (odt[0] - nab[0]) * 0.28, nab[1] + (odt[1] - nab[1]) * 0.28];
      const Lv = omez(cl * 95, -60, 175), Ld = Math.min(170, cd * 420);
      if (Math.abs(Lv) > 4) { cara(g, [q, [q[0], q[1] - Lv]], 'silna c-vztlak'); hrot(g, [q[0], q[1] - Lv - Math.sign(Lv) * 4 * k], [0, -Math.sign(Lv)], k, 1.5, 'c-vztlak'); txt(g, q[0] + 10, q[1] - Lv + (Lv > 0 ? 10 : -4), 'vztlak', 't-vztlak'); }
      if (Ld > 14) { cara(g, [odt, [odt[0] + Ld, odt[1]]], 'silna c-odpor'); hrot(g, [odt[0] + Ld + 4 * k, odt[1]], [1, 0], k, 1.3, 'c-odpor'); }
      if (Ld > 30) txt(g, odt[0] + Ld - 6, odt[1] + 20, 'odpor', 't-odpor t-konec');
      if (c.zak) txt(g, (nab[0] + odt[0]) / 2, 36, '⚠ proud se odtrhl – pád', 't-velky t-stred t-pretlak');
      // graf c_L(α)
      const G = { x0: 780, x1: 975, y0: 205, y1: 40, amin: -6, amax: 24, cmin: -0.6, cmax: 1.8 };
      const gx = a => G.x0 + (G.x1 - G.x0) * (a - G.amin) / (G.amax - G.amin), gy = v => G.y0 - (G.y0 - G.y1) * (v - G.cmin) / (G.cmax - G.cmin);
      sv('rect', { x: 736, y: 14, width: 254, height: 452, rx: 10, class: 'graf-pozadi' }, g);
      txt(g, G.x0 - 34, G.y1 - 14, 'součinitel vztlaku', 't-maly');
      cara(g, [[G.x0, gy(0)], [G.x1, gy(0)]], 'tenka c-osa');
      cara(g, [[gx(0), G.y0], [gx(0), G.y1]], 'tenka c-osa');
      [0, 1].forEach(v => txt(g, G.x0 - 6, gy(v) + 4, String(v), 't-maly t-konec'));
      [0, 10, 20].forEach(a => txt(g, gx(a), G.y0 + 16, a + '°', 't-maly t-stred'));
      txt(g, G.x1, G.y0 + 32, 'úhel náběhu', 't-maly t-konec');
      for (const p of Object.keys(PROFILY)) {
        const body = []; for (let a = G.amin; a <= G.amax; a += 0.5) body.push([gx(a), gy(cL(p, a))]);
        cara(g, body, p === s.profil ? 'silna c-vztlak' : 'tenka carkovana c-text');
      }
      const potreba = tiha / (0.5 * RHO * s.v * s.v * KRIDLO.S);
      if (potreba < G.cmax) { cara(g, [[G.x0, gy(potreba)], [G.x1, gy(potreba)]], 'tenka carkovana c-tiha'); txt(g, G.x1 - 2, gy(potreba) - 5, 'potřeba unést 1 t', 't-maly t-konec'); }
      sv('circle', { cx: gx(s.a), cy: gy(cl), r: 6 * k, class: 'vypln c-vztlak' }, g);
      // vztlak × tíha
      const B = { y: 440, x1: 815, x2: 905, max: 160 / 20000 };
      const hL = Math.min(170, Math.max(0, L) * B.max), hW = tiha * B.max;
      txt(g, 862, 262, 'síly na letadlo', 't-maly t-stred');
      sv('rect', { x: B.x1 - 22, y: B.y - hL, width: 44, height: hL, class: 'vypln c-vztlak', opacity: 0.85 }, g);
      sv('rect', { x: B.x2 - 22, y: B.y - hW, width: 44, height: hW, class: 'vypln c-tiha', opacity: 0.85 }, g);
      if (L * B.max > 170) txt(g, B.x1, B.y - 176, '▲', 't-vztlak t-stred');
      txt(g, B.x1, B.y + 18, 'vztlak', 't-maly t-stred t-vztlak');
      txt(g, B.x2, B.y + 18, 'tíha', 't-maly t-stred');
      txt(g, B.x1, B.y - hL - 8, cis(L / 1000, 1) + ' kN', 't-maly t-stred');
      txt(g, B.x2, B.y - hW - 8, cis(tiha / 1000, 1) + ' kN', 't-maly t-stred');

      const stav = c.zak ? 'pad' : L > tiha * 1.03 ? 'stoupa' : L >= tiha * 0.97 ? 'rovne' : 'klesa';
      m.odecet([['Úhel náběhu', s.a + '°'], ['Součinitel vztlaku', cis(cl, 2)], ['Rychlost', `${s.v} m/s = ${kmh(s.v)}`],
        ['Vztlak', cis(L / 1000, 1) + ' kN'], ['Tíha', cis(tiha / 1000, 1) + ' kN']]);
      m.zpravu(c.zak ? '⚠️ <b>Proud se od horní strany křídla odtrhl.</b> Nad křídlem vznikly víry, podtlak zmizel, vztlak klesl a odpor prudce vzrostl. To je <b>pád</b> – pilot musí hned sklopit příď.'
        : s.a === 0 && s.profil === 'soumerny' ? 'Souměrné křídlo rovně po proudu: nahoře i dole proudí vzduch stejně rychle, tlaky jsou stejné a <b>vztlak je nulový</b>.'
          : stav === 'stoupa' ? 'Vztlak je větší než tíha – <b>letadlo stoupá</b>.'
            : stav === 'rovne' ? 'Vztlak se rovná tíze – <b>letadlo letí vodorovně</b>.'
              : L < 0 ? 'Záporný úhel tlačí křídlo <b>dolů</b> – takhle obrácené křídlo přitlačuje k silnici závodní auta.'
                : 'Vztlak je menší než tíha – <b>letadlo klesá</b>. Pomůže větší úhel náběhu nebo větší rychlost.');
      kresliAnim();
    };
    const nastavProfil = segment($('#kr-profil'), s.profil, v => { s.profil = v; m.naplanuj(); });
    const posA = posuvnik('kr-uhel', v => v + '°', v => { s.a = v; if (v === 0) s.byl0 = true; m.naplanuj(); });
    posuvnik('kr-v', v => `${v} m/s = ${kmh(v)}`, v => { s.v = v; m.naplanuj(); });
    prepinac('kr-znacky', v => { s.znacky = v; m.naplanuj(); });
    prepinac('kr-tlak', v => { s.tlak = v; m.naplanuj(); });

    predpoved('kr-uhel', {
      otazka: 'Souměrné křídlo stojí přesně po proudu (úhel 0°) a vztlak je nulový. Co se stane se vztlakem, když úhel náběhu zvětšíš na <b>8°</b>?',
      moznosti: ['Zůstane nulový – křídlo je přece souměrné', 'Vzroste – křídlo začne nadnášet', 'Vzroste jen odpor, vztlak ne'],
      spravna: 1,
      proc: ['Souměrné je křídlo, ale ne obtékání: nakloněné křídlo stáčí proud dolů a nad ním proudí vzduch rychleji.', null, 'Odpor opravdu trochu vzroste, ale hlavně se objeví vztlak.'],
      vyzkousej: 'U <b>souměrného</b> profilu nastav úhel náběhu <b>8°</b> a sleduj šipku vztlaku a graf.',
      priTipu: () => { nastavProfil('soumerny'); s.profil = 'soumerny'; posA.nastav(0); },
      splneno: () => s.profil === 'soumerny' && s.a >= 8,
      vysvetleni: 'Nakloněné křídlo stáčí proud vzduchu dolů. Nad ním proudí vzduch rychleji a má menší tlak, pod ním pomaleji a tlak je větší. Rozdíl tlaků tlačí křídlo nahoru – vzniká <b>vztlak</b>, který s úhlem roste.',
    });
    Ukoly.definuj('kr-znacky', () => s.znacky && s.a >= 4 && s.a <= PROFILY[s.profil].aK,
      '<b>Horní obláčky doletí dřív</b> – nad křídlem proudí vzduch rychleji. Obláčky, které se rozdělily na náběžné hraně, se za křídlem už znovu nepotkají: horní jsou napřed.');
    Ukoly.definuj('kr-pristani', () => s.profil === 'prohnuty' && s.v === 30 && s.a <= PROFILY.prohnuty.aK && vztlak() >= tiha,
      'Při 30 m/s potřebuje prohnuté křídlo úhel asi <b>10°</b>. Čím pomaleji letadlo letí, tím větší úhel náběhu potřebuje – proto při přistání zvedá příď. Pod asi 25 m/s by už nepomohl ani kritický úhel.');
    predpoved('kr-pad', {
      otazka: 'Co se stane se vztlakem, když úhel náběhu zvětšíš až na <b>20°</b>?',
      moznosti: ['Poroste dál – čím větší úhel, tím větší vztlak', 'Proud se od horní strany odtrhne a vztlak klesne', 'Vztlak se nezmění'],
      spravna: 1,
      proc: ['Jen do kritického úhlu (asi 15°). Pak se proud vzduchu už neudrží na horní straně křídla.', null, 'Změní se – a nebezpečně.'],
      vyzkousej: 'Zvětšuj úhel náběhu až na <b>20°</b> a sleduj graf a proudnice nad křídlem.',
      splneno: () => s.a >= 18,
      vysvetleni: 'Za <b>kritickým úhlem</b> se proud od horní strany křídla odtrhne, nad křídlem vzniknou víry a podtlak zmizí. Vztlak klesne a odpor vzroste – to je <b>pád</b> (stall). Letadla proto mají výstrahu, která pilota včas upozorní.',
    });
  }

  /* ---------- 7 · Vítr kolem budov a v krajině (tunel) ---------- */
  function modelStavby() {
    const C = 240, R = 100, Z = 5, zem = R - Z;
    const kopec = (() => { const b = [[0, R]]; for (let x = 0; x <= C; x += 2) b.push([x, zem - 30 * Math.exp(-(((x - 92) / 26) ** 2))]); b.push([C, R]); return b; })();
    const T = new Tunel('obr-stavby', {
      cols: C, rows: R, U: 0.1, vychozi: 'dum', sonda: [118, zem - 10], vlecek: 15,
      sceny: {
        dum: { zem: Z, telesa: [{ body: [[70, zem], [70, zem - 22], [81, zem - 33], [92, zem - 22], [92, zem]] }], D: 33, sonda: [118, zem - 8] },
        ulice: { telesa: [{ body: obdelnik(92, 12, 122, 45) }, { body: obdelnik(92, 55, 122, 88) }], D: 76, sonda: [107, 50] },
        plot: { zem: Z, telesa: [{ body: obdelnik(80, zem - 24, 82, zem) }], D: 24, plotX: 82, sonda: [104, zem - 6] },
        kopec: { zem: Z, telesa: [{ body: kopec, zem: true }], D: 30, sonda: [140, zem - 6] },
        prazdny: { zem: Z, telesa: [], D: 20, sonda: [120, 50] },
      },
    });
    MODELY.stavby = T;
    T.nastav({ nastroj: 'sonda' });
    const TEXT = {
      dum: 'Vítr naráží na <b>návětrnou</b> stěnu, přes střechu se zrychlí a za domem vzniká <b>závětří</b> s vírem, který se u země točí zpátky k domu.',
      ulice: 'Pohled shora na dva bloky domů. Část vzduchu se protlačí úzkou ulicí mezi nimi – a tam se <b>zrychlí</b>.',
      plot: 'Za plotem je <b>závětří</b>. Zapni ❄️ sníh a sleduj, kde se vločky usadí.',
      kopec: 'Na návětrném svahu vítr zrychluje, nejsilnější je na vrcholu. Za kopcem je závětří – proto se na hřebenech staví větrné elektrárny.',
      prazdny: 'Prázdná krajina: nástrojem <b>🧱 zeď</b> si postav vlastní překážky a sondou měř vítr kolem nich.',
    };
    T.poTiku = () => {
      const pol = [['Sonda', T.sonda.platna ? `${Math.round(T.sonda.hodnota * 100)} % rychlosti volného větru` : 'je v překážce']];
      if (T.s.snih) pol.push(['Napadlo sněhu', `${T.vyskaSnehu.reduce((a, b) => a + b, 0)} buněk`]);
      const h = pol.map(([n, v]) => `<span>${n} <b>${v}</b></span>`).join('');
      if (T.odecty.innerHTML !== h) T.odecty.innerHTML = h;
      let z = TEXT[T.s.scena];
      if (T.s.scena === 'plot' && T.s.snih && T.snehuZaPlotem > 10) z = 'Sníh se usazuje hlavně <b>za plotem v závětří</b>, kde vítr zeslábne a vločky už neunese. Tak rostou závěje – a proto se podél silnic stavějí zábrany proti sněhu kus od cesty.';
      if (!T.ustaleno) z += ' <i>Proudění se ustaluje…</i>';
      if (T.zprava.innerHTML !== z) T.zprava.innerHTML = z;
    };
    Ukoly.definuj('st-zavetri', () => T.s.scena === 'dum' && T.ustaleno && T.sonda.platna && T.sonda.x > 93 && T.sonda.hodnota <= 0.33,
      'Za domem je závětří: vzduch se tu točí ve velkém víru a u země fouká jen slabě, někdy i opačným směrem. Proto se před větrem schováváme <b>na závětrné straně</b>.');
    Ukoly.definuj('st-ulice', () => T.s.scena === 'ulice' && T.ustaleno && T.sonda.platna && T.sonda.x > 88 && T.sonda.x < 126 && T.sonda.y > 44 && T.sonda.y < 56 && T.sonda.hodnota >= 1.3,
      'V úzké ulici se proud vzduchu zúží, a proto zrychlí – stejně jako v zúžené trubici. Proto bývá mezi vysokými domy nepříjemný průvan.');
    predpoved('st-zavej', {
      otazka: 'U plotu padá sníh a fouká vítr. Kde se <b>nahromadí nejvíc sněhu</b>?',
      moznosti: ['Před plotem, kam vítr naráží', 'Za plotem v závětří', 'Rovnoměrně všude'],
      spravna: 1,
      proc: ['Před plotem se vítr jen trochu přibrzdí a stočí nahoru přes plot – většinu vloček unese dál.', null, 'Kde fouká silně, vločky se neudrží a vítr je unáší dál. Usadí se tam, kde zeslábne.'],
      vyzkousej: 'Vyber scénu <b>🚧 plot</b>, zapni <b>❄️ Sníh</b> a počkej, až se začne tvořit závěj.',
      priTipu: () => { if (T.s.scena !== 'plot') T.nastav({ scena: 'plot' }); },
      splneno: () => T.s.scena === 'plot' && T.s.snih && T.snehuZaPlotem > 10,
      vysvetleni: 'Za plotem je závětří: vítr tu zeslábne a vločky, které nesl, spadnou. Proto rostou závěje <b>za</b> překážkami a zábrany proti sněhu se staví kus od silnice – závěj vznikne za zábranou, a ne na cestě.',
    });
  }

  /* ================================================================
     7. Procvičování
     Každý generátor vrátí zadání, možnosti (právě jedna ok, chybné mají
     „proc“ – v čem je záměna), nápovědu a vysvětlení.
     ================================================================ */
  const GENERATORY = [
    { id: 'prevod', tema: 'vitr', nazev: 'Převod jednotek', gen() {
      if (Math.random() < 0.5) {
        const v = vyber([2, 4, 5, 8, 10, 12, 15, 20, 25, 30]), k = v * 3.6;
        return {
          zadani: `Vítr fouká rychlostí <b>${v} m/s</b>. Kolik je to km/h?`,
          moznosti: [{ t: `${cisK(k, 1)} km/h`, ok: true }, { t: `${cisK(v / 3.6, 1)} km/h`, proc: 'Z m/s na km/h se násobí 3,6, nedělí.' },
            { t: `${v * 60} km/h`, proc: 'Hodina nemá 60 sekund, ale 3 600 – a výsledek má být v kilometrech.' }, { t: `${cisK(v * 36, 0)} km/h`, proc: 'Násobí se 3,6, ne 36.' }],
          napoveda: 'Za hodinu (3 600 s) urazí vzduch 3 600× víc metrů, tedy 3,6× víc kilometrů.',
          vysvetleni: `${v} m/s · 3,6 = ${cisK(k, 1)} km/h.` };
      }
      const k = vyber([18, 36, 54, 72, 90, 108, 126, 144]), v = k / 3.6;
      return {
        zadani: `Předpověď hlásí vítr <b>${k} km/h</b>. Kolik je to m/s?`,
        moznosti: [{ t: `${cisK(v, 1)} m/s`, ok: true }, { t: `${cisK(k * 3.6, 1)} m/s`, proc: 'Z km/h na m/s se dělí 3,6, nenásobí.' },
          { t: `${cisK(k / 60, 1)} m/s`, proc: 'Dělí se 3,6 (3 600 s v hodině a 1 000 m v kilometru).' }, { t: `${cisK(k / 36, 1)} m/s`, proc: 'Dělí se 3,6, ne 36.' }],
        napoveda: 'Z km/h na m/s se dělí 3,6.',
        vysvetleni: `${k} km/h : 3,6 = ${cisK(v, 1)} m/s.` };
    } },
    { id: 'beaufort', tema: 'vitr', nazev: 'Beaufortova stupnice', gen() {
      const b = vyber([0, 2, 3, 5, 7, 8, 9, 12]), B = BEAUFORT[b];
      const jine = zamichej(BEAUFORT.map((x, i) => i).filter(i => Math.abs(i - b) >= 2)).slice(0, 3);
      return {
        zadani: `Jak se jmenuje vítr, když platí: <i>„${B.p}“</i>`,
        moznosti: [{ t: `${b} – ${B.n}`, ok: true }, ...jine.map(i => ({ t: `${i} – ${BEAUFORT[i].n}`, proc: `${velke(BEAUFORT[i].n)}: ${BEAUFORT[i].p}` }))],
        napoveda: 'Čím víc vítr ohýbá a láme, tím vyšší stupeň: 0 bezvětří, 6 silný vítr, 9 vichřice, 12 orkán.',
        vysvetleni: `Je to ${b}. stupeň – ${B.n} (${B.do == null ? 'od ' + cis(B.od) : cis(B.od) + '–' + cis(B.do)} m/s).` };
    } },
    { id: 'pricina', tema: 'vitr', nazev: 'Proč fouká vítr', gen() {
      return vyber([
        { zadani: 'Kam proudí vzduch u země?',
          moznosti: [{ t: 'Z místa s vyšším tlakem do místa s nižším tlakem.', ok: true }, { t: 'Z místa s nižším tlakem do místa s vyšším tlakem.', proc: 'Opačně – vzduch uniká z místa, kde je „natlačený“, jako z balónku.' },
            { t: 'Vždy od západu na východ.', proc: 'Převládající směr u nás sice je západní, ale vítr může foukat odkudkoli – podle rozložení tlaku.' }, { t: 'Z teplého místa do studeného.', proc: 'Nad teplým místem je u země níže – vzduch tam naopak přitéká.' }],
          napoveda: 'Vzpomeň si na nafouknutý balónek.',
          vysvetleni: 'Vzduch proudí z tlakové výše (V) do tlakové níže (N).' },
        { zadani: 'Slunečný letní den u moře. Jak fouká odpoledne u pláže vítr?',
          moznosti: [{ t: 'Od moře na pevninu.', ok: true }, { t: 'Z pevniny na moře.', proc: 'Tak fouká noční bríza, kdy je teplejší moře.' },
            { t: 'Nefouká, u moře je vždy bezvětří.', proc: 'Rozdíl teplot pevniny a moře vítr naopak vytváří.' }, { t: 'Svisle nahoru.', proc: 'Nahoru stoupá vzduch nad pevninou – u země ale vítr fouká vodorovně.' }],
          napoveda: 'Co se ve dne ohřeje víc – pevnina, nebo moře?',
          vysvetleni: 'Pevnina je teplejší, vzduch nad ní stoupá a u země vzniká nižší tlak. Od moře k ní proudí chladnější vzduch – denní bríza.' },
        { zadani: 'Proč vzduch nad teplým povrchem stoupá?',
          moznosti: [{ t: 'Ohřeje se, rozepne a je lehčí než chladnější vzduch okolo.', ok: true }, { t: 'Teplý povrch ho odpuzuje.', proc: 'Povrch vzduch neodpuzuje – jen ho ohřívá.' },
            { t: 'Protože nad ním fouká vítr.', proc: 'Je to naopak – stoupání teplého vzduchu vítr způsobuje.' }, { t: 'Protože teplý vzduch je těžší.', proc: 'Teplý vzduch má menší hustotu, je lehčí.' }],
          napoveda: 'Stejně vzlétá horkovzdušný balón.',
          vysvetleni: 'Ohřátý vzduch se rozepne, má menší hustotu, a tak ho chladnější okolní vzduch vytlačí nahoru.' },
      ]);
    } },
    { id: 'odpor-v', tema: 'odpor', nazev: 'Odpor a rychlost', gen() {
      const [n, t] = vyber([[2, '2×'], [3, '3×'], [0.5, 'na polovinu']]), F = vyber([20, 40, 50, 80, 120, 150]);
      const spr = F * n * n;
      return {
        zadani: `Při určité rychlosti působí na cyklistu odporová síla vzduchu <b>${F} N</b>. Jak velká bude, když rychlost ${n < 1 ? 'klesne' : 'vzroste'} <b>${t}</b>?`,
        moznosti: [{ t: `${cisK(spr, 1)} N`, ok: true }, { t: `${cisK(F * n, 1)} N`, proc: 'Odpor neroste s rychlostí rovnoměrně, ale s její druhou mocninou.' },
          { t: `${cisK(F * n * n * n, 1)} N`, proc: 'Tolik ne – odpor roste s druhou mocninou rychlosti, ne s třetí.' }, { t: `${F} N`, proc: 'Na rychlosti odpor vzduchu velmi záleží.' }],
        napoveda: 'Odporová síla roste s druhou mocninou rychlosti: 2× rychleji → 4× větší odpor.',
        vysvetleni: `Rychlost se změnila ${n < 1 ? 'na ½' : n + '×'}, odpor ${n < 1 ? 'na ¼' : n * n + '×'}: ${F} N · ${n < 1 ? '¼' : n * n} = ${cisK(spr, 1)} N.` };
    } },
    { id: 'tvar', tema: 'odpor', nazev: 'Tvar a odpor', gen() {
      const nejmensi = Math.random() < 0.5, klic = zamichej(Object.keys(TVARY)).slice(0, 3);
      if (!klic.includes('kapka') && nejmensi) klic[0] = 'kapka';
      if (!klic.includes('deska') && !nejmensi) klic[0] = 'deska';
      const serazene = [...klic].sort((a, b) => TVARY[a].c - TVARY[b].c), spr = nejmensi ? serazene[0] : serazene[2];
      return {
        zadani: `Tělesa mají stejnou čelní plochu a fouká do nich stejně silný vítr. Které má <b>${nejmensi ? 'nejmenší' : 'největší'}</b> odpor?`,
        moznosti: klic.map(k => ({ t: velke(TVARY[k].n), ok: k === spr, proc: k === spr ? '' : `${velke(TVARY[k].n)} má součinitel odporu ${cis(TVARY[k].c, 2)} – ${nejmensi ? 'víc' : 'méně'} než ${TVARY[spr].n} (${cis(TVARY[spr].c, 2)}).` })),
        napoveda: 'Proudnicový tvar má malý odpor, plocha napříč proudu velký.',
        vysvetleni: `Součinitele odporu: deska 1,2 · krychle 1,05 · koule 0,47 · kapka 0,04.` };
    } },
    { id: 'odpor-situace', tema: 'odpor', nazev: 'Odpor v praxi', gen() {
      return vyber([
        { zadani: 'Proč se cyklista při sjezdu <b>skrčí</b>?',
          moznosti: [{ t: 'Zmenší čelní plochu a odpor vzduchu.', ok: true }, { t: 'Přenese váhu, aby kolo jelo z kopce rychleji.', proc: 'Rychlost při sjezdu omezuje hlavně odpor vzduchu – skrčením ho zmenší.' },
            { t: 'Aby mu nefoukalo do očí.', proc: 'Jde o odpor vzduchu, který roste s čelní plochou.' }, { t: 'Aby byl těžší.', proc: 'Hmotnost se skrčením nezmění.' }],
          napoveda: 'Na čem závisí odporová síla?', vysvetleni: 'Menší čelní plocha a hladší tvar znamenají menší odpor.' },
        { zadani: 'Proč mají rychlovlaky <b>protáhlou zaoblenou příď</b>?',
          moznosti: [{ t: 'Vzduch je obteče plynule a za nimi vznikne méně vírů – menší odpor.', ok: true }, { t: 'Aby byly lehčí.', proc: 'Hmotnost s tvarem přídě nesouvisí.' },
            { t: 'Jen kvůli vzhledu.', proc: 'Při 300 km/h rozhoduje tvar o spotřebě energie – odpor je obrovský.' }, { t: 'Aby lépe brzdily.', proc: 'Proudnicový tvar odpor naopak zmenšuje.' }],
          napoveda: 'Vzpomeň si na desku a kapku v tunelu.', vysvetleni: 'Proudnicový tvar zmenší oblast vírů za vozidlem, a tím odpor i spotřebu.' },
        { zadani: 'Proč padá parašutista s otevřeným padákem pomalu?',
          moznosti: [{ t: 'Padák má velkou plochu a dutý tvar, takže má obrovský odpor vzduchu.', ok: true }, { t: 'Padák je lehčí než vzduch.', proc: 'Padák je z látky, která je těžší než vzduch – drží ho odpor, ne vztlak.' },
            { t: 'Pod padákem je vakuum.', proc: 'Pod padákem je naopak zvýšený tlak vzduchu, který padák brzdí.' }, { t: 'Gravitace na padák nepůsobí.', proc: 'Působí – ale odporová síla ji při malé rychlosti vyrovná.' }],
          napoveda: 'Na čem závisí odporová síla?', vysvetleni: 'Velká plocha a dutý tvar dají velký odpor. Vyrovná tíhu už při rychlosti asi 5 m/s.' },
      ]);
    } },
    { id: 'spojitost', tema: 'tlak', nazev: 'Zúžení', gen() {
      const [s1, s2] = vyber([[20, 10], [30, 10], [24, 6], [40, 10], [18, 6], [12, 4]]), v = vyber([2, 3, 4, 5]);
      const spr = v * s1 / s2;
      return {
        zadani: `Vítr fouká rychlostí <b>${v} m/s</b> mezi dva řady domů vzdálené ${s1} m. Ulice se zúží na <b>${s2} m</b>. Jak rychle zhruba fouká v zúžení?`,
        moznosti: [{ t: `${cisK(spr, 1)} m/s`, ok: true }, { t: `${cisK(v * s2 / s1, 1)} m/s`, proc: 'V užším místě vzduch zrychlí, nezpomalí.' },
          { t: `${v} m/s`, proc: 'Stejně rychle by užším místem prošlo méně vzduchu – kam by se zbytek poděl?' }, { t: `${cisK(v + s1 - s2, 1)} m/s`, proc: 'Rychlost se nepřičítá podle metrů – mění se v poměru šířek.' }],
        napoveda: 'Kolikrát je ulice užší, tolikrát rychleji musí vzduch proudit.',
        vysvetleni: `Ulice je ${cisK(s1 / s2, 1)}× užší, vítr proto proudí ${cisK(s1 / s2, 1)}× rychleji: ${v} · ${cisK(s1 / s2, 1)} = ${cisK(spr, 1)} m/s.` };
    } },
    { id: 'tlak', tema: 'tlak', nazev: 'Rychlost a tlak', gen() {
      return vyber([
        { zadani: 'Mezi dva visící papíry foukneš. Co udělají?',
          moznosti: [{ t: 'Přiblíží se k sobě.', ok: true }, { t: 'Rozletí se od sebe.', proc: 'Proud jde podél papírů, ne do nich. Rychlý vzduch mezi nimi má menší tlak.' },
            { t: 'Nepohnou se.', proc: 'Tlaky z obou stran už nejsou stejné.' }, { t: 'Oba se odkloní doleva.', proc: 'Situace je souměrná – oba se pohnou do středu.' }],
          napoveda: 'Kde proudí vzduch rychleji, je menší tlak.', vysvetleni: 'Mezi papíry je rychlý proud a menší tlak, klidný vzduch zvenku je přitlačí k sobě.' },
        { zadani: 'Proč vichřice <b>nadzvedne</b> střechu, místo aby ji zamáčkla?',
          moznosti: [{ t: 'Nad střechou proudí vzduch rychle a má menší tlak než klidný vzduch v domě.', ok: true }, { t: 'Vítr fouká zespodu.', proc: 'Vítr fouká vodorovně – rozhoduje rozdíl tlaků nad a pod střechou.' },
            { t: 'Střecha je lehčí než vzduch.', proc: 'Střecha je těžká – zvedne ji až velký rozdíl tlaků.' }, { t: 'Vzduch v domě se ohřeje.', proc: 'Ve vichřici jde o proudění, ne o teplotu.' }],
          napoveda: 'Porovnej tlak nad střechou a v domě.', vysvetleni: 'Rychlý vzduch nad střechou má menší tlak, běžný tlak v domě ji tlačí zespodu nahoru.' },
        { zadani: 'Dvě lodě plují těsně vedle sebe. Co hrozí?',
          moznosti: [{ t: 'Přitáhnou se k sobě.', ok: true }, { t: 'Odtlačí se od sebe.', proc: 'Voda mezi nimi proudí rychleji a má menší tlak – lodě se přitahují.' },
            { t: 'Nic, voda na lodě netlačí.', proc: 'Voda tlačí – a z vnější strany víc než z vnitřní.' }, { t: 'Obě zpomalí na nulu.', proc: 'Jde o boční sílu, ne o zastavení.' }],
          napoveda: 'Voda mezi loděmi proudí úzkým místem.', vysvetleni: 'Mezi loděmi se voda zrychlí, tlak klesne a vnější voda lodě k sobě přitlačí.' },
        { zadani: 'V trubici se zúžením proudí vzduch. Kde je tlak <b>nejmenší</b>?',
          moznosti: [{ t: 'V nejužším místě.', ok: true }, { t: 'Před zúžením.', proc: 'Před zúžením je tlak větší – právě ten vzduch v zúžení urychluje.' },
            { t: 'Za zúžením.', proc: 'Za zúžením se vzduch zpomalí a tlak se zase zvýší.' }, { t: 'Všude stejný.', proc: 'Kde proudí vzduch rychleji, je tlak menší.' }],
          napoveda: 'Kde proudí vzduch nejrychleji?', vysvetleni: 'V nejužším místě proudí vzduch nejrychleji, a proto má nejmenší tlak.' },
      ]);
    } },
    { id: 'kridlo', tema: 'kridlo', nazev: 'Křídlo', gen() {
      return vyber([
        { zadani: 'Co je <b>vztlaková síla</b> na křídle?',
          moznosti: [{ t: 'Síla kolmá na směr proudu, která křídlo nadnáší.', ok: true }, { t: 'Síla po směru proudu, která křídlo brzdí.', proc: 'To je odporová síla.' },
            { t: 'Tíha letadla.', proc: 'Tíha míří dolů – vztlak ji musí vyrovnat.' }, { t: 'Síla motoru.', proc: 'Motor dává tah dopředu. Vztlak vzniká obtékáním křídla.' }],
          napoveda: 'Odpor míří po proudu. Kam míří vztlak?', vysvetleni: 'Vztlak je kolmý na proud, odpor míří po proudu.' },
        { zadani: 'Kde má vzduch u letícího křídla <b>menší tlak</b>?',
          moznosti: [{ t: 'Nad křídlem, kde proudí rychleji.', ok: true }, { t: 'Pod křídlem.', proc: 'Pod křídlem proudí vzduch pomaleji a tlak je větší.' },
            { t: 'Všude stejný.', proc: 'Kdyby byl tlak všude stejný, vztlak by nevznikl.' }, { t: 'Před křídlem.', proc: 'Před náběžnou hranou se vzduch naopak přibrzdí a tlak je větší.' }],
          napoveda: 'Kde proudí vzduch rychleji?', vysvetleni: 'Nad křídlem proudí vzduch rychleji a má menší tlak – rozdíl tlaků tlačí křídlo nahoru.' },
        { zadani: 'Proč letadlo při startu a přistání <b>zvedá příď</b>?',
          moznosti: [{ t: 'Při malé rychlosti potřebuje větší úhel náběhu, aby měl dost vztlaku.', ok: true }, { t: 'Aby piloti lépe viděli.', proc: 'Příď se zvedá kvůli úhlu náběhu křídel.' },
            { t: 'Aby zmenšilo odpor.', proc: 'Větší úhel odpor spíš zvětší. Jde o vztlak.' }, { t: 'Aby motor lépe nasával vzduch.', proc: 'Rozhoduje úhel, pod kterým vzduch obtéká křídla.' }],
          napoveda: 'Na čem závisí vztlak?', vysvetleni: 'Vztlak roste s rychlostí a s úhlem náběhu. Pomalé letadlo proto potřebuje větší úhel.' },
        { zadani: 'Co se stane, když pilot zvětší úhel náběhu <b>nad kritický úhel</b>?',
          moznosti: [{ t: 'Proud se od horní strany křídla odtrhne a vztlak klesne – pád.', ok: true }, { t: 'Vztlak poroste dál.', proc: 'Jen do kritického úhlu (asi 15°), pak se proud odtrhne.' },
            { t: 'Odpor zmizí.', proc: 'Naopak – odpor prudce vzroste.' }, { t: 'Letadlo zrychlí.', proc: 'Velký odpor letadlo brzdí.' }],
          napoveda: 'Vzpomeň si na model křídla při 20°.', vysvetleni: 'Za kritickým úhlem se proud odtrhne – vztlak klesne, odpor vzroste. Tomu se říká pád (stall).' },
        (() => {
          const L = vyber([8, 9, 11, 12, 14]), W = 10;
          const spr = L > W ? 'Stoupá.' : 'Klesá.';
          return { zadani: `Na letadlo působí tíha <b>${W} kN</b> a vztlak <b>${L} kN</b>. Co letadlo dělá?`,
            moznosti: [{ t: spr, ok: true }, { t: L > W ? 'Klesá.' : 'Stoupá.', proc: L > W ? 'Vztlak je větší než tíha.' : 'Vztlak je menší než tíha.' },
              { t: 'Letí vodorovně.', proc: 'Vodorovně letí, když se vztlak rovná tíze.' }, { t: 'Padá volným pádem.', proc: 'Volný pád by byl bez vztlaku.' }],
            napoveda: 'Porovnej vztlak a tíhu.', vysvetleni: L > W ? 'Vztlak převažuje nad tíhou – letadlo stoupá.' : 'Tíha převažuje nad vztlakem – letadlo klesá.' };
        })(),
      ]);
    } },
    { id: 'stavby', tema: 'vitr', nazev: 'Vítr a stavby', gen() {
      return vyber([
        { zadani: 'Kde je u domu <b>závětří</b>?',
          moznosti: [{ t: 'Za domem, na straně odvrácené od větru.', ok: true }, { t: 'Před domem, kam vítr naráží.', proc: 'To je návětrná strana.' },
            { t: 'Nad střechou.', proc: 'Nad střechou se vítr naopak zrychluje.' }, { t: 'Na rohu domu.', proc: 'Na rozích se vítr zrychluje.' }],
          napoveda: 'Závětrná strana je odvrácená od větru.', vysvetleni: 'Za domem vítr slábne a víří – to je závětří.' },
        { zadani: 'Proč se za plotem tvoří <b>sněhové závěje</b>?',
          moznosti: [{ t: 'Za plotem je závětří – vítr zeslábne a sníh, který nesl, spadne.', ok: true }, { t: 'Plot sníh přitahuje.', proc: 'Plot nic nepřitahuje – rozhoduje, kde vítr zeslábne.' },
            { t: 'Za plotem je větší zima.', proc: 'Teplota je stejná. Sníh padá tam, kde vítr zeslábne.' }, { t: 'Sníh odráží plot.', proc: 'Vločky se od plotu neodrážejí – většina ho přeletí.' }],
          napoveda: 'Kde vítr zeslábne?', vysvetleni: 'Slabý vítr unese méně sněhu – ten se usadí v závětří.' },
        { zadani: 'Co se stane s větrem v <b>úzké uličce</b> mezi vysokými domy?',
          moznosti: [{ t: 'Zrychlí se.', ok: true }, { t: 'Zpomalí se.', proc: 'Vzduch, který přitéká, musí uličkou projít – v užším místě rychleji.' },
            { t: 'Nezmění se.', proc: 'Užší průřez znamená rychlejší proudění.' }, { t: 'Úplně ustane.', proc: 'Ulička není závětří – proud se do ní naopak natlačí.' }],
          napoveda: 'Vzpomeň si na zúženou trubici.', vysvetleni: 'Kolik vzduchu vteče, tolik musí vytéct – v užším místě rychleji.' },
      ]);
    } },
  ];

  const TEMATA = [['vse', 'Vše'], ['vitr', 'Vítr'], ['odpor', 'Odpor vzduchu'], ['tlak', 'Rychlost a tlak'], ['kridlo', 'Křídlo']];

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
      this.skore = Uloha.skore('metodus_vitr_lekce_skore', $('#cv-skore'));
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
      for (let pokus = 0; pokus < 30; pokus++) {
        const jine = nabidka.filter(x => x.id !== this.posledni);
        const g = vyber(jine.length ? jine : nabidka);
        const q = g.gen();
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
    for (const f of [modelBriza, modelBeaufort, modelObtekani, modelOdpor, modelZuzeni, modelPapiry, modelKridlo, modelStavby]) {
      try { f(); } catch (e) { console.error('Model se nepodařilo spustit:', f.name, e); }
    }
    Navigace.init();
    odkazyNaLekce();
    Procvic.init();
    Model.vsechny.forEach(m => m.naplanuj());
    Tunel.spust();
  }
  window.addEventListener('metodus-theme', () => { Model.vsechny.forEach(m => m.naplanuj()); Tunel.vsechny.forEach(t => t.vykresli()); });
  window.VitrLekce = { MODELY, Ukoly, Postup, Model, Tunel, zukovskij, cL, odporF, GENERATORY, get Procvic() { return Procvic; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
