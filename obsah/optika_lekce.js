/* ============================================================
   optika_lekce.js – interaktivní výklad „Světlo a optika“.

   Stavba:
     1. pomůcky (čísla, vektory, kreslení do SVG)
     2. Model – obrázek s úchopy (tažení myší, dotykem i klávesnicí)
     3. Úkoly a předpovědi (postup se ukládá do localStorage)
     4. Navigace (osnova, čipy, mapa lekce)
     5. Paprskový počítač: lom podle Snellova zákona, odraz,
        podíl odraženého světla podle Fresnelových vzorců
     6. Modely jednotlivých kapitol
     7. Procvičování (otázky pro fázi Procvič a Ověř se)

   Délky v modelech jsou v jednotkách viewBoxu; kde se ukazují
   centimetry, platí 10 jednotek = 1 cm (u oka 170 jednotek = 1 cm).
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
  const kmS = n => (Math.round(299792.458 / n / 1000) * 1000).toLocaleString('cs-CZ') + ' km/s';

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
  /* Paprsek: lomená čára, šipky uprostřed delších úseků a pohyblivé „světlo“. */
  function paprsek(g, pts, k, o = {}) {
    const sk = sv('g', { class: o.cls || 'c-paprsek' }, g);
    if (o.opacity != null && o.opacity < 1) sk.setAttribute('opacity', Math.max(0, o.opacity).toFixed(3));
    if (o.barva) sk.setAttribute('style', '--c:' + o.barva);
    cara(sk, pts, (o.tenky ? 'tenka ' : '') + (o.carkovany ? 'carkovana' : ''));
    if (o.tok !== false && !o.carkovany && !bezPohybu()) sv('path', { d: dCesta(pts), class: 'tok' }, sk);
    if (o.sipky !== false && !o.carkovany) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (l < 50 * k) continue;
        const u = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
        const t = l > 320 * k ? 0.35 : 0.55;
        hrot(sk, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], u, k, o.tenky ? 0.8 : 1);
      }
    }
    return sk;
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

  /* Barva světla dané vlnové délky (nm) – přibližný převod do sRGB. */
  function barvaVlny(l) {
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; }
    else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = (510 - l) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = (645 - l) / 65; }
    else r = 1;
    const f = l < 420 ? 0.35 + 0.65 * (l - 380) / 40 : l > 680 ? 0.35 + 0.65 * (780 - l) / 100 : 1;
    const k = v => Math.round(255 * Math.pow(Math.max(0, v * f), 0.8));
    return `rgb(${k(r)},${k(g)},${k(b)})`;
  }

  /* Svíčka: základna v (x, y), výška h (záporná = převrácená).
     styl: 'predmet' | 'skutecny' (plný obraz) | 'zdanlivy' (čárkovaný obrys). */
  function svicka(g, x, y, h, styl, k) {
    const v = Math.abs(h), sm = h >= 0 ? -1 : 1;
    const telo = 0.7 * v, sir = Math.max(0.22 * v, 7 * k);
    const sk = sv('g', { class: 'svicka svicka-' + styl }, g);
    const y1 = y + sm * telo;
    const obdelnik = [[x - sir / 2, y], [x + sir / 2, y], [x + sir / 2, y1], [x - sir / 2, y1]];
    const hp = v - telo - 0.03 * v;
    const zakl = y1 + sm * 0.03 * v, vrch = y + sm * v;
    const sp = sir * 0.42;
    const plamenD = `M${r1(x)} ${r1(vrch)} C${r1(x + sp)} ${r1(zakl - sm * hp * 0.45)} ${r1(x + sp * 0.8)} ${r1(zakl)} ${r1(x)} ${r1(zakl)} C${r1(x - sp * 0.8)} ${r1(zakl)} ${r1(x - sp)} ${r1(zakl - sm * hp * 0.45)} ${r1(x)} ${r1(vrch)}Z`;
    if (styl === 'predmet') {
      mnohouhelnik(sk, obdelnik, 'vypln c-predmet', 'opacity:.9');
      cara(sk, [[x, y1], [x, zakl]], 'tenka c-text');
      const pl = sv('path', { d: plamenD, class: 'plamen-telo' + (bezPohybu() ? '' : ' plamen') }, sk);
      pl.setAttribute('fill', '#ffab2e');
      sv('ellipse', { cx: r1(x), cy: r1(zakl - sm * hp * 0.3), rx: r1(sp * 0.35), ry: r1(hp * 0.25), fill: '#fff1b0' }, sk);
    } else if (styl === 'skutecny') {
      mnohouhelnik(sk, obdelnik, 'vypln c-obraz', 'opacity:.35');
      cara(sk, [...obdelnik, obdelnik[0]], 'tenka c-obraz');
      sv('path', { d: plamenD, class: 'vypln c-obraz', style: 'opacity:.6' }, sk);
    } else {
      cara(sk, [...obdelnik, obdelnik[0]], 'tenka carkovana c-obraz');
      sv('path', { d: plamenD, class: 'cara tenka carkovana c-obraz' }, sk);
    }
    return sk;
  }

  /* Oko z boku; smer = úhel pohledu (rad). */
  function oko(g, p, smer, k, velikost = 1) {
    const sk = sv('g', { transform: `translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(smer / RAD)}) scale(${velikost})` }, g);
    sv('path', { d: 'M-22 0 Q-2 -17 16 0 Q-2 17 -22 0Z', fill: 'var(--bg-panel)', stroke: 'var(--text-muted)', 'stroke-width': 1.6 * k }, sk);
    sv('circle', { cx: 8, cy: 0, r: 7.5, fill: '#4f86c6' }, sk);
    sv('circle', { cx: 10, cy: 0, r: 3.6, fill: '#0c0f14' }, sk);
    return sk;
  }

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
  const KLIC = 'metodus_optika_lekce';
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
    vidime: '<circle cx="22" cy="18" r="8" class="vypln c-paprsek"/><circle cx="92" cy="44" r="10" fill="#d9483b"/><path class="cara c-paprsek" d="M30 22 L82 40 M100 38 L138 28"/><path d="M130 28 Q140 20 152 28 Q140 36 130 28Z" fill="none" stroke="var(--text-muted)" stroke-width="1.5"/>',
    stin: '<rect x="14" y="16" width="6" height="28" rx="3" class="vypln c-paprsek"/><circle cx="70" cy="30" r="10" class="teleso"/><rect x="140" y="4" width="6" height="52" fill="var(--o-paprsek)" opacity=".85"/><rect x="140" y="22" width="6" height="16" fill="var(--o-stin)"/><rect x="140" y="16" width="6" height="6" fill="var(--o-stin)" opacity=".5"/><rect x="140" y="38" width="6" height="6" fill="var(--o-stin)" opacity=".5"/>',
    odraz: '<line x1="20" y1="50" x2="140" y2="50" class="cara silna c-zrcadlo"/><line x1="80" y1="50" x2="80" y2="6" class="cara tenka carkovana c-kolmice"/><path class="cara c-paprsek" d="M40 12 L80 50 L120 12"/>',
    lom: '<rect x="10" y="30" width="140" height="28" class="voda"/><line x1="80" y1="4" x2="80" y2="58" class="cara tenka carkovana c-kolmice"/><path class="cara c-paprsek" d="M44 4 L80 30 L96 58"/>',
    uplny: '<path d="M8 20 H70 A26 26 0 0 1 96 46 V58 H78 V46 A8 8 0 0 0 70 38 H8Z" class="sklo"/><path class="cara c-paprsek" d="M8 29 L40 21 L68 37 L90 24 L88 58"/>',
    barvy: '<path d="M70 8 L96 52 L44 52Z" class="sklo"/><path class="cara c-bile" d="M8 40 L58 30"/><path class="cara" style="--c:#ff4b3a" d="M84 32 L150 40"/><path class="cara" style="--c:#ffd23a" d="M84 32 L150 46"/><path class="cara" style="--c:#3ad26b" d="M84 32 L150 51"/><path class="cara" style="--c:#8a5cff" d="M84 32 L150 57"/>',
    cocky: '<ellipse cx="60" cy="30" rx="7" ry="26" class="sklo"/><path class="cara c-paprsek" d="M6 12 L60 12 L118 30 M6 30 L118 30 M6 48 L60 48 L118 30"/><circle cx="118" cy="30" r="3.5" class="vypln c-ohnisko"/>',
    zobrazeni: '<line x1="0" y1="38" x2="160" y2="38" class="cara tenka carkovana c-osa"/><rect x="18" y="18" width="7" height="20" class="vypln c-predmet"/><path d="M21.5 8 C25 13 24 18 21.5 18 C19 18 18 13 21.5 8Z" fill="#ffab2e"/><ellipse cx="72" cy="38" rx="5" ry="22" class="sklo"/><rect x="124" y="38" width="6" height="14" class="vypln c-obraz" opacity=".6"/><path d="M127 60 C129 57 129 53 127 52 C125 53 125 57 127 60Z" class="vypln c-obraz"/>',
    oko: '<ellipse cx="100" cy="30" rx="42" ry="26" fill="none" stroke="var(--text-muted)" stroke-width="1.5"/><ellipse cx="66" cy="30" rx="5" ry="12" class="sklo"/><path class="cara c-paprsek" d="M8 20 L66 20 L142 30 M8 40 L66 40 L142 30"/><path d="M140 12 A42 26 0 0 1 140 48" fill="none" stroke="#e06a6a" stroke-width="3"/>',
    pristroje: '<rect x="30" y="22" width="100" height="16" fill="none" stroke="var(--text-faint)" stroke-dasharray="4 3"/><ellipse cx="30" cy="30" rx="4" ry="16" class="sklo"/><ellipse cx="130" cy="30" rx="3" ry="10" class="sklo"/><path class="cara c-paprsek" d="M4 18 L30 18 L100 30 L130 36 L156 24 M4 42 L30 42 L100 30 L130 24 L156 36"/>',
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
     5. Paprskový počítač
     Těleso: { n: λ => index lomu, hrany: [...], pohlti? }
     Hrana:  { typ: 'usecka', a, b, normala }  – normála míří ven z tělesa
             { typ: 'oblouk', c, r, od, do, znam } – úhly (rad) v souřadnicích SVG,
               od < do; znam = +1 těleso je uvnitř kružnice, −1 vně (dutá plocha)
     Tělesa se nesmějí dotýkat ani překrývat; okolí má index nOkoli.
     ================================================================ */
  const EPS = 1e-6;
  function prusecik(o, d, h) {
    if (h.typ === 'usecka') {
      const e = V.sub(h.b, h.a);
      const den = d[0] * e[1] - d[1] * e[0];
      if (Math.abs(den) < 1e-12) return null;
      const w = V.sub(h.a, o);
      const t = (w[0] * e[1] - w[1] * e[0]) / den;
      const u = (w[0] * d[1] - w[1] * d[0]) / den;
      if (t > EPS && u >= -1e-9 && u <= 1 + 1e-9) return { t, p: V.add(o, V.mul(d, t)), n: h.normala };
      return null;
    }
    const f = V.sub(o, h.c);
    const b = V.dot(f, d), c = V.dot(f, f) - h.r * h.r;
    const disk = b * b - c;
    if (disk < 0) return null;
    const s = Math.sqrt(disk);
    const plny = h.do - h.od >= 2 * Math.PI - 1e-9;
    for (const t of [-b - s, -b + s]) {
      if (t <= EPS) continue;
      const p = V.add(o, V.mul(d, t));
      const u = Math.atan2(p[1] - h.c[1], p[0] - h.c[0]);
      const rel = ((u - h.od) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      if (plny || rel <= h.do - h.od + 1e-9) {
        return { t, p, n: V.mul([(p[0] - h.c[0]) / h.r, (p[1] - h.c[1]) / h.r], h.znam) };
      }
    }
    return null;
  }
  /* Podíl odraženého světla (nepolarizované světlo, Fresnelovy vzorce). */
  function fresnel(n1, n2, ci, ct) {
    const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
    const rp = (n1 * ct - n2 * ci) / (n1 * ct + n2 * ci);
    return (rs * rs + rp * rp) / 2;
  }
  function trasuj(scena, start, smer, lam, opt = {}) {
    const nOkoli = opt.nOkoli || 1, maxSeg = opt.maxSeg || 60, prah = opt.prah ?? 0.02, delka = opt.delka || 4000;
    const useky = [], udalosti = [];
    const zas = [{ o: start, d: V.norm(smer), w: 1, stopa: '', hl: 0 }];
    let pocet = 0;
    while (zas.length && pocet < 400) {
      const r = zas.pop();
      if (r.hl > maxSeg || r.w < prah) continue;
      pocet++;
      let nej = null;
      for (const tel of scena) for (const h of tel.hrany) {
        const x = prusecik(r.o, r.d, h);
        if (x && (!nej || x.t < nej.t)) nej = Object.assign(x, { tel, h });
      }
      if (!nej) { useky.push({ a: r.o, b: V.add(r.o, V.mul(r.d, delka)), w: r.w, stopa: r.stopa, ven: true }); continue; }
      useky.push({ a: r.o, b: nej.p, w: r.w, stopa: r.stopa });
      if (nej.tel.pohlti || nej.h.pohlti) { udalosti.push({ p: nej.p, w: r.w, pohlceno: true, h: nej.h, tel: nej.tel, d: r.d }); continue; }
      const cos1 = -V.dot(r.d, nej.n);
      const vstup = cos1 > 0;
      const N = vstup ? nej.n : V.mul(nej.n, -1);
      const ci = Math.abs(cos1);
      const odr = V.norm(V.add(r.d, V.mul(N, 2 * ci)));
      const nT = nej.tel.n(lam);
      const n1 = vstup ? nOkoli : nT, n2 = vstup ? nT : nOkoli;
      const eta = n1 / n2, k = 1 - eta * eta * (1 - ci * ci);
      const ud = { p: nej.p, uhel: Math.acos(Math.min(1, ci)), n1, n2, vstup, tir: k < 0, w: r.w, h: nej.h, tel: nej.tel };
      udalosti.push(ud);
      if (k < 0) { ud.R = 1; zas.push({ o: nej.p, d: odr, w: r.w, stopa: r.stopa + 'R', hl: r.hl + 1 }); continue; }
      const ct = Math.sqrt(k);
      const lom = V.norm(V.add(V.mul(r.d, eta), V.mul(N, eta * ci - ct)));
      const R = fresnel(n1, n2, ci, ct);
      ud.R = R;
      ud.prosle = r.w * (1 - R);
      if (opt.odrazy && r.w * R >= prah) zas.push({ o: nej.p, d: odr, w: r.w * R, stopa: r.stopa + 'R', hl: r.hl + 1 });
      zas.push({ o: nej.p, d: lom, w: opt.odrazy ? r.w * (1 - R) : r.w, stopa: r.stopa + 'T', hl: r.hl + 1 });
    }
    return { useky, udalosti };
  }
  /* Konvexní mnohoúhelník → hrany s normálami ven. */
  function hranyMnohouhelniku(body, navic = {}) {
    const c = body.reduce((s, p) => [s[0] + p[0] / body.length, s[1] + p[1] / body.length], [0, 0]);
    return body.map((a, i) => {
      const b = body[(i + 1) % body.length];
      let n = V.norm([b[1] - a[1], -(b[0] - a[0])]);
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (V.dot(n, V.sub(m, c)) < 0) n = V.mul(n, -1);
      return Object.assign({ typ: 'usecka', a, b, normala: n }, navic);
    });
  }

  /* ================================================================
     6. Modely kapitol
     ================================================================ */
  const MODELY = {};

  function laser(g, p, d, k) {
    const u = Math.atan2(d[1], d[0]) / RAD, m = Math.max(1, k * 0.7);
    const sk = sv('g', { transform: `translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(u)}) scale(${m.toFixed(3)})` }, g);
    sv('rect', { x: -52, y: -9, width: 50, height: 18, rx: 4, fill: 'var(--bg-control)', stroke: 'var(--text-faint)', 'stroke-width': 1.2 }, sk);
    sv('rect', { x: -7, y: -5, width: 7, height: 10, rx: 1.5, class: 'vypln c-paprsek' }, sk);
    return sk;
  }

  /* ---------- 1 · Jak vidíme ---------- */
  function modelVidime() {
    const m = new Model('obr-vidime', 900, 380);
    const s = { lampa: true, prostredi: 'nic' };
    MODELY.vidime = { m, s };
    const ZAR = [130, 118], PX = 300, JAB = [560, 266], RJ = 34, OKO = [826, 172];
    const PUP = [OKO[0] - 13, OKO[1]];
    const st = m.staticka;
    sv('rect', { x: 30, y: 300, width: 650, height: 10, rx: 3, fill: 'var(--bg-control)', stroke: 'var(--border-strong)' }, st);
    cara(st, [[ZAR[0], 0], [ZAR[0], ZAR[1] - 28]], 'tenka c-text');
    const rnd = nahoda(7);
    const rozptyl = Array.from({ length: 18 }, () => (rnd() - 0.5) * 2.2);
    const PRUCHOD = { nic: 1, sklo: 0.9, mlecne: 0.35, drevo: 0 };
    const NAZEV = { sklo: 'čiré sklo – průhledné', mlecne: 'mléčné sklo – průsvitné', drevo: 'dřevo – neprůhledné' };

    /* Paprsek ze žárovky k cíli přes překážku: vrátí propuštěnou část. */
    function pres(g, A, B, k, opt = {}) {
      const pr = s.prostredi;
      if (pr === 'nic') { paprsek(g, [A, B], k, opt); return; }
      const t = (PX - 8 - A[0]) / (B[0] - A[0]);
      const P = [PX - 8, A[1] + t * (B[1] - A[1])];
      const Q = [PX + 8, A[1] + (PX + 8 - A[0]) / (B[0] - A[0]) * (B[1] - A[1])];
      if (pr === 'sklo') { paprsek(g, [A, B], k, Object.assign({}, opt, { opacity: (opt.opacity ?? 1) * 0.92 })); return; }
      paprsek(g, [A, P], k, opt);
      if (pr === 'mlecne') {
        const u = V.norm(V.sub(B, A));
        for (let i = 0; i < 3; i++) {
          const d = V.rot(u, rozptyl[(opt.i || 0) * 3 + i]);
          paprsek(g, [Q, V.add(Q, V.mul(d, 62))], k, { tenky: true, sipky: false, tok: false, opacity: 0.4 });
        }
        paprsek(g, [Q, B], k, Object.assign({}, opt, { opacity: (opt.opacity ?? 1) * 0.35, tenky: true }));
      }
    }

    m.kresli = g => {
      const k = m.k, pr = s.prostredi;
      const jas = s.lampa ? PRUCHOD[pr] : 0;
      const hl = sv('g', { class: 'zare' }, g);
      if (pr !== 'nic') {
        sv('rect', { x: PX - 8, y: 70, width: 16, height: 230, rx: 2, class: pr === 'sklo' ? 'sklo' : pr }, g);
        if (pr === 'drevo') for (let y = 86; y < 296; y += 22) cara(g, [[PX - 5, y], [PX + 5, y + 9]], 'tenka', '--c:rgba(0,0,0,.35)');
        txt(g, PX, 58, NAZEV[pr], 't-maly t-stred');
      }
      if (s.lampa) {
        sv('circle', { cx: ZAR[0], cy: ZAR[1], r: 40, class: 'svetlo-vypln', opacity: 0.14 }, g);
        sv('circle', { cx: ZAR[0], cy: ZAR[1], r: 15, class: 'svetlo-vypln' }, g);
        sv('circle', { cx: ZAR[0] - 4, cy: ZAR[1] - 4, r: 5, fill: '#fff', opacity: 0.8 }, g);
        for (const u of [-160, -120, -80, -40, 70, 110, 150, 185]) {
          const d = [Math.cos(u * RAD), Math.sin(u * RAD)];
          paprsek(hl, [V.add(ZAR, V.mul(d, 22)), V.add(ZAR, V.mul(d, 70))], k, { tenky: true, sipky: false, tok: false, opacity: 0.55 });
        }
        const fi = Math.atan2(ZAR[1] - JAB[1], ZAR[0] - JAB[0]);
        [-0.9, -0.45, 0, 0.45, 0.9].forEach((o, i) => {
          const T = [JAB[0] + RJ * Math.cos(fi + o), JAB[1] + RJ * Math.sin(fi + o)];
          const A = V.add(ZAR, V.mul(V.norm(V.sub(T, ZAR)), 20));
          pres(hl, A, T, k, { i, tok: i === 2, tenky: i !== 2 });
        });
        const A = V.add(ZAR, V.mul(V.norm(V.sub(PUP, ZAR)), 20));
        pres(hl, A, PUP, k, { i: 5, opacity: 0.6, tenky: true, tok: false });
      }
      // jablko: jas podle toho, kolik světla na ně dopadá
      sv('circle', { cx: JAB[0], cy: JAB[1], r: RJ, fill: 'var(--bg-control)', stroke: 'var(--text-faint)', 'stroke-width': k }, g);
      sv('circle', { cx: JAB[0], cy: JAB[1], r: RJ, fill: '#d9483b', opacity: (0.06 + 0.94 * jas).toFixed(3) }, g);
      sv('circle', { cx: JAB[0] - 11, cy: JAB[1] - 12, r: 8, fill: '#fff', opacity: (0.35 * jas).toFixed(3) }, g);
      cara(g, [[JAB[0], JAB[1] - RJ + 2], [JAB[0] + 4, JAB[1] - RJ - 14]], 'silna', '--c:#7a5230');
      sv('path', { d: `M${JAB[0] + 4} ${JAB[1] - RJ - 8} q14 -12 24 -2 q-12 10 -24 2Z`, fill: '#4c9a4c', opacity: (0.3 + 0.7 * jas).toFixed(3) }, g);
      if (jas > 0.02) {
        for (const u of [-160, -125, -90, -55, -20, 15]) {
          const d = [Math.cos(u * RAD), Math.sin(u * RAD)];
          paprsek(hl, [V.add(JAB, V.mul(d, RJ + 2)), V.add(JAB, V.mul(d, RJ + 62))], k, { tenky: true, sipky: false, tok: false, opacity: 0.55 * jas });
        }
        const d = V.norm(V.sub(PUP, JAB));
        paprsek(hl, [V.add(JAB, V.mul(d, RJ + 2)), PUP], k, { opacity: 0.25 + 0.75 * jas, tok: jas > 0.5 });
      }
      if (!s.lampa) sv('circle', { cx: ZAR[0], cy: ZAR[1], r: 15, fill: 'var(--bg-control)', stroke: 'var(--text-faint)', 'stroke-width': k }, g);
      sv('rect', { x: ZAR[0] - 9, y: ZAR[1] - 31, width: 18, height: 15, rx: 3, fill: 'var(--bg-control)', stroke: 'var(--text-faint)', 'stroke-width': k }, g);
      oko(g, OKO, Math.PI, k, 1.35);
      txt(g, ZAR[0] + 26, ZAR[1] - 26, 'lampa – primární zdroj', 't-maly');
      txt(g, JAB[0], 334, 'jablko – samo nesvítí', 't-maly t-stred');
      txt(g, OKO[0], OKO[1] + 36, 'oko', 't-maly t-stred');
      m.zpravu(!s.lampa
        ? 'Lampa nesvítí. Jablko samo světlo nevydává, a tak do oka nic nedopadá – <b>oko nevidí nic</b>.'
        : {
          nic: 'Oko vidí lampu i jablko. Jablko je osvětlené a odráží světlo do všech stran – část doletí do oka.',
          sklo: 'Čiré sklo je <b>průhledné</b>: světlo projde skoro beze změny. Oko vidí lampu i jablko.',
          mlecne: 'Mléčné sklo je <b>průsvitné</b>: světlo projde, ale rozptýlí se. Jablko je osvětlené jen slabě a lampu oko vidí jen jako rozmazanou světlou skvrnu.',
          drevo: 'Dřevo je <b>neprůhledné</b>. Na jablko nedopadá světlo, a tak žádné neodráží – oko ho nevidí, i když lampa svítí.',
        }[pr]);
    };

    prepinac('vid-lampa', v => { s.lampa = v; m.naplanuj(); });
    segment($('#vid-prostredi'), s.prostredi, v => { s.prostredi = v; m.naplanuj(); });
    predpoved('vid-deska', {
      otazka: 'Lampa svítí, ale mezi ni a jablko postavíme dřevěnou desku. Co uvidí oko vpravo?',
      moznosti: ['Jablko uvidí – oko samo vysílá paprsky, kterými se dívá.', 'Jablko neuvidí – nedopadá na něj světlo, a tak ho ani neodráží do oka.', 'Uvidí jen obrys jablka, protože ho deska zakryje jen napůl.'],
      spravna: 1,
      vyzkousej: 'Nech lampu svítit a pod obrázkem vyber „dřevěná deska“.',
      splneno: () => s.lampa && s.prostredi === 'drevo',
      vysvetleni: 'Oko žádné paprsky nevysílá – jen přijímá světlo, které do něj dopadne. Jablko samo nesvítí; vidíme ho jen díky světlu, které na něj dopadá a které odráží. Deska světlo z lampy zastaví, jablko zůstane ve tmě a do oka od něj nic nedoletí. (Ve skutečném pokoji by jablko trochu osvětlilo světlo odražené od stěn – tady v modelu stěny nejsou.)',
      proc: { 0: 'Tak si to kdysi mysleli i staří Řekové. Oko ale světlo nevysílá, jen ho přijímá.', 2: 'Deska zakryje celou lampu – na jablko nesvítí žádná část zdroje.' },
    });
    Ukoly.definuj('vid-prusvitne', () => s.lampa && s.prostredi === 'mlecne',
      'Mléčné sklo je <b>průsvitné</b>: světlo propustí, ale rozptýlí ho do všech stran. Proto přes ně vidíme jen rozmazanou světlou skvrnu.');
  }

  /* ---------- 2 · Stín ---------- */
  function modelStin() {
    const m = new Model('obr-stin', 920, 380);
    const s = { zdroj: 30, koule: [420, 172], hranice: false, plny: 0, polo: 0 };
    MODELY.stin = { m, s };
    const Z = [80, 190], XS = 860, R = 38, Y0 = 20, Y1 = 360;
    const zdroje = () => {
      const n = s.zdroj > 0 ? 40 : 1;
      return Array.from({ length: n }, (_, i) => [Z[0], n === 1 ? Z[1] : Z[1] - s.zdroj + 2 * s.zdroj * i / (n - 1)]);
    };
    const vidi = (P, S) => {
      const d = V.sub(S, P), f = V.sub(P, s.koule);
      const t = omez(-V.dot(f, d) / V.dot(d, d), 0, 1);
      const q = V.add(P, V.mul(d, t));
      return Math.hypot(q[0] - s.koule[0], q[1] - s.koule[1]) > R;
    };
    const tecny = S => {
      const d = V.sub(s.koule, S), l = V.len(d);
      if (l <= R + 1) return null;
      const fi = Math.atan2(d[1], d[0]), th = Math.asin(R / l), tl = Math.sqrt(l * l - R * R);
      return [fi - th, fi + th].map(u => { const e = [Math.cos(u), Math.sin(u)]; return { e, t: V.add(S, V.mul(e, tl)) }; });
    };
    const naStinitko = (S, e) => V.add(S, V.mul(e, (XS - S[0]) / e[0]));

    m.kresli = g => {
      const k = m.k, zd = zdroje();
      mnohouhelnik(g, [[Z[0], Z[1] - s.zdroj], [XS, Y0], [XS, Y1], [Z[0], Z[1] + s.zdroj]], 'svetlo-vypln', 'opacity:.11');
      // každý bod zdroje vrhá vlastní stín; kde se překryjí všechny, je plný stín
      const a = 1 - Math.pow(0.18, 1 / zd.length);
      for (const S of zd) {
        const t = tecny(S);
        if (t) mnohouhelnik(g, [t[0].t, naStinitko(S, t[0].e), naStinitko(S, t[1].e), t[1].t], 'stin-vypln', `opacity:${a.toFixed(4)}`);
      }
      if (s.hranice) {
        const krajni = s.zdroj > 0 ? [zd[0], zd[zd.length - 1]] : [zd[0]];
        for (const S of krajni) { const t = tecny(S); if (t) for (const x of t) paprsek(g, [S, naStinitko(S, x.e)], k, { tenky: true, sipky: false, tok: false, opacity: 0.9 }); }
      }
      // stínítko: jak velkou část zdroje „vidí“ každé místo
      const N = 85, dy = (Y1 - Y0) / N, hod = [];
      sv('rect', { x: XS, y: Y0, width: 14, height: Y1 - Y0, class: 'stin-vypln' }, g);
      for (let i = 0; i < N; i++) {
        const P = [XS, Y0 + (i + 0.5) * dy];
        let v = 0;
        for (const S of zd) if (vidi(P, S)) v++;
        const f = v / zd.length;
        hod.push(f);
        if (f > 0) sv('rect', { x: XS, y: r1(Y0 + i * dy), width: 14, height: r1(dy + 0.6), class: 'svetlo-vypln', opacity: (0.08 + 0.92 * f).toFixed(3) }, g);
      }
      sv('rect', { x: XS, y: Y0, width: 14, height: Y1 - Y0, fill: 'none', stroke: 'var(--border-strong)', 'stroke-width': k }, g);
      const useky = [];
      hod.forEach((f, i) => {
        const druh = f < 0.02 ? 'plny' : f < 0.98 ? 'polo' : null;
        const u = useky[useky.length - 1];
        if (!u || u.druh !== druh) useky.push({ druh, od: i, do: i }); else u.do = i;
      });
      let plny = 0, polo = 0;
      for (const u of useky) {
        if (!u.druh) continue;
        const y1 = Y0 + u.od * dy, y2 = Y0 + (u.do + 1) * dy, d = y2 - y1;
        if (u.druh === 'plny') plny += d; else polo += d;
        cara(g, [[XS + 20, y1 + 1], [XS + 25, y1 + 1], [XS + 25, y2 - 1], [XS + 20, y2 - 1]], 'tenka c-text');
        if (d > 15 * k) txt(g, XS - 8, (y1 + y2) / 2 + 4 * k, u.druh === 'plny' ? 'plný stín' : 'polostín', 't-maly t-konec');
      }
      s.plny = plny; s.polo = polo;
      sv('circle', { cx: s.koule[0], cy: s.koule[1], r: R, class: 'teleso' }, g);
      if (s.zdroj === 0) {
        sv('circle', { cx: Z[0], cy: Z[1], r: 15, class: 'svetlo-vypln', opacity: 0.3 }, g);
        sv('circle', { cx: Z[0], cy: Z[1], r: 5.5, class: 'svetlo-vypln' }, g);
      } else sv('rect', { x: Z[0] - 6, y: Z[1] - s.zdroj, width: 12, height: 2 * s.zdroj, rx: 6, class: 'svetlo-vypln' }, g);
      txt(g, Z[0], Z[1] + s.zdroj + 28, 'zdroj', 't-maly t-stred');
      txt(g, XS + 7, 13, 'stínítko', 't-maly t-stred');
      txt(g, s.koule[0], s.koule[1] + R + 20, 'koule', 't-maly t-stred');
      m.odecet([['Plný stín na stínítku', cis(plny / 10, 1) + ' cm'], ['Polostín', cis(polo / 10, 1) + ' cm']]);
      m.zpravu(s.zdroj === 0 ? 'Bodový zdroj: stín má <b>ostré okraje</b>, polostín nevzniká.'
        : plny < 0.5 && polo > 0 ? 'Plný stín na stínítko nedosáhl – je tu <b>jen polostín</b>. Tak vypadá částečné zatmění Slunce.'
        : '');
    };
    m.uchop({
      popis: 'Koule – posuň ji',
      poloha: () => s.koule,
      tahni: p => { s.koule = [omez(p[0], 170, 780), omez(p[1], 60, 320)]; },
      klavesa: (dx, dy) => { s.koule = [omez(s.koule[0] + 4 * dx, 170, 780), omez(s.koule[1] + 4 * dy, 60, 320)]; },
      hodnota: () => `koule ${cis((s.koule[0] - Z[0]) / 10, 0)} cm od zdroje`,
    });
    posuvnik('stin-zdroj', v => v === 0 ? 'bodový' : cis(v / 5, 1) + ' cm', v => { s.zdroj = v; m.naplanuj(); });
    prepinac('stin-hranice', v => { s.hranice = v; m.naplanuj(); });
    Ukoly.definuj('stin-bodovy', () => s.zdroj === 0, 'Polostín zmizel: z bodového zdroje buď světlo do místa dopadne, nebo ne – nic mezi tím. Stín má <b>ostré okraje</b>.');
    Ukoly.definuj('stin-jen-polostin', () => s.zdroj > 0 && s.plny < 0.5 && s.polo > 0,
      'Přesně to se děje při <b>částečném zatmění Slunce</b>: plný stín Měsíce na dané místo nedosáhne, dopadá sem jen polostín.');
  }

  /* ---------- 3 · Zákon odrazu ---------- */
  function modelOdraz() {
    const m = new Model('obr-odraz', 900, 400);
    const s = { alfa: 35, drsny: false };
    MODELY.odraz = { m, s };
    const O = [450, 330], R = 235, X0 = 110, X1 = 790, RU = 150;
    const rnd = nahoda(11);
    const plosky = [];
    for (let x = X0; x < X1; x += 20) plosky.push({ x0: x, x1: x + 20, tau: (rnd() - 0.5) * 66 * RAD });
    const st = m.staticka;
    const obl = [];
    for (let u = 0; u <= 180; u += 3) obl.push([O[0] + RU * Math.cos((180 + u) * RAD), O[1] + RU * Math.sin((180 + u) * RAD)]);
    cara(st, obl, 'tenka c-text', 'opacity:.55');
    for (let th = -90; th <= 90; th += 10) {
      const d = [-Math.sin(th * RAD), -Math.cos(th * RAD)], vel = th % 30 === 0;
      cara(st, [V.add(O, V.mul(d, RU - (vel ? 13 : 6))), V.add(O, V.mul(d, RU))], 'tenka c-text', 'opacity:.6');
      if (vel && Math.abs(th) !== 90) txt(st, O[0] + d[0] * (RU + 16), O[1] + d[1] * (RU + 16) + 4, Math.abs(th) + '°', 't-maly t-stred');
    }
    cara(st, [O, [O[0], 52]], 'tenka carkovana c-kolmice');
    txt(st, O[0] + 8, 64, 'kolmice dopadu', 't-maly');

    m.kresli = g => {
      const k = m.k, a = s.alfa * RAD;
      const L = [O[0] - R * Math.sin(a), O[1] - R * Math.cos(a)];
      const d = [Math.sin(a), Math.cos(a)], p = [Math.cos(a), -Math.sin(a)];
      if (!s.drsny) {
        cara(g, [[X0, O[1]], [X1, O[1]]], 'silna c-zrcadlo');
        for (let x = X0 + 8; x < X1; x += 14) cara(g, [[x, O[1] + 4], [x - 9, O[1] + 14]], 'tenka c-text', 'opacity:.5');
        txt(g, X1, O[1] + 34, 'zrcadlo', 't-maly t-konec');
      } else {
        const body = [];
        for (const f of plosky) {
          const xc = (f.x0 + f.x1) / 2, t = [Math.cos(f.tau), Math.sin(f.tau)];
          f.a = [xc - 10 * t[0], O[1] - 10 * t[1]]; f.b = [xc + 10 * t[0], O[1] + 10 * t[1]];
          body.push(f.a, f.b);
        }
        mnohouhelnik(g, [...body, [X1, O[1] + 26], [X0, O[1] + 26]], 'teleso', 'opacity:.45;stroke:none');
        cara(g, body, 'c-zrcadlo');
        txt(g, X1, O[1] + 44, 'drsný papír pod lupou', 't-maly t-konec');
      }
      laser(g, L, d, k);
      const hl = sv('g', { class: 'zare' }, g);
      const posuny = s.drsny ? [-4, -3, -2, -1, 0, 1, 2, 3, 4] : [-2, -1, 0, 1, 2];
      for (const o of posuny) {
        const S = V.add(L, V.mul(p, o * 13));
        let H = V.add(S, V.mul(d, (O[1] - S[1]) / d[1]));
        let r;
        if (!s.drsny) r = [d[0], -d[1]];
        else {
          const f = plosky.find(f => H[0] >= f.x0 && H[0] < f.x1) || plosky[0];
          const x = prusecik(S, d, { typ: 'usecka', a: f.a, b: f.b, normala: [0, -1] });
          if (x) H = x.p;
          const n = [Math.sin(f.tau), -Math.cos(f.tau)];
          r = V.sub(d, V.mul(n, 2 * V.dot(d, n)));
          if (r[1] > -0.08) r = V.norm([r[0], -0.08]);
          cara(g, [H, V.add(H, V.mul(n, 30))], 'tenka carkovana c-kolmice');
        }
        const hlavni = o === 0 || s.drsny;
        paprsek(hl, [S, H, V.add(H, V.mul(r, s.drsny ? 190 : 250))], k, { opacity: hlavni ? 1 : 0.45, tok: hlavni, tenky: o !== 0 });
      }
      if (!s.drsny && s.alfa !== 0) {
        const m1 = obloukUhlu(g, O, 64, -Math.PI / 2, Math.atan2(L[1] - O[1], L[0] - O[0]), 'tenka c-paprsek');
        txt(g, O[0] + 84 * Math.cos(m1), O[1] + 84 * Math.sin(m1) + 5 * k, 'α', 't-velky t-stred t-paprsek');
        const m2 = obloukUhlu(g, O, 64, -Math.PI / 2, Math.atan2(-Math.cos(a), Math.sin(a)), 'tenka c-paprsek');
        txt(g, O[0] + 84 * Math.cos(m2), O[1] + 84 * Math.sin(m2) + 5 * k, 'α′', 't-velky t-stred t-paprsek');
      }
      if (s.drsny) {
        m.odecet([]);
        m.zpravu('Každá ploška papíru odráží podle zákona odrazu (čárkovaně jsou kolmice plošek), ale plošky jsou natočené různě – svazek se <b>rozptýlí</b> do všech stran.');
      } else {
        m.odecet([['Úhel dopadu α', Math.abs(s.alfa) + '°'], ['Úhel odrazu α′', Math.abs(s.alfa) + '°']]);
        m.zpravu(s.alfa === 0 ? 'Kolmý dopad: paprsek se odrazí zpátky po stejné přímce.' : 'Rovnoběžné paprsky se od hladkého zrcadla odrážejí zase rovnoběžně.');
      }
    };
    m.uchop({
      popis: 'Laser – úhel dopadu',
      poloha: () => [O[0] - R * Math.sin(s.alfa * RAD), O[1] - R * Math.cos(s.alfa * RAD)],
      tahni: p => { s.alfa = omez(Math.round(Math.atan2(O[0] - p[0], Math.max(1, O[1] - p[1])) / RAD), -80, 80); },
      klavesa: dx => { s.alfa = omez(s.alfa - dx, -80, 80); },
      hodnota: () => `úhel dopadu ${Math.abs(s.alfa)} stupňů`,
    });
    segment($('#odraz-povrch'), 'hladky', v => { s.drsny = v === 'drsny'; m.naplanuj(); });
    Ukoly.definuj('odraz-60', () => !s.drsny && Math.abs(s.alfa) === 60, 'Úhel odrazu je také <b>60°</b>. Zákon odrazu platí pro každý úhel dopadu.');
    predpoved('odraz-drsny', {
      otazka: 'Svazek rovnoběžných paprsků dopadne na drsný papír. Jak se odrazí?',
      moznosti: ['Všechny rovnoběžně jedním směrem, stejně jako od zrcadla.', 'Do různých směrů – svazek se rozptýlí.', 'Neodrazí se vůbec, papír všechno světlo pohltí.'],
      spravna: 1,
      vyzkousej: 'Přepni povrch na „drsný papír“.',
      splneno: () => s.drsny,
      vysvetleni: 'Pod lupou je papír hrbolatý. Každý paprsek dopadne na jinak nakloněnou plošku – a i když se odrazí přesně podle zákona odrazu (sleduj kolmice plošek), odletí jiným směrem. Takovému odrazu se říká <b>rozptyl</b>. Bílý papír přitom odrazí skoro všechno světlo, jen do všech stran.',
      proc: { 0: 'Rovnoběžně odráží jen hladký povrch. Papír je pod lupou hrbolatý.', 2: 'Kdyby papír pohltil všechno světlo, byl by černý. Bílý papír naopak odráží skoro všechno.' },
    });
  }

  /* ---------- 3b · Obraz v rovinném zrcadle ---------- */
  function modelZrcadlo() {
    const m = new Model('obr-zrcadlo', 900, 380);
    const s = { x: 330, oko: [140, 120], prodlouzit: false, obraz: false, vidi: { F: false, B: false } };
    MODELY.zrcadlo = { m, s };
    const XZ = 560, Z0 = 90, Z1 = 250, PODLAHA = 330, VYSKA = 120;
    const st = m.staticka;
    cara(st, [[40, PODLAHA], [860, PODLAHA]], 'tenka c-text');
    cara(st, [[XZ + 4, 0], [XZ + 4, Z0]], 'tenka c-text', 'opacity:.5');
    sv('rect', { x: XZ, y: Z0, width: 9, height: Z1 - Z0, fill: 'var(--bg-control)', stroke: 'var(--border-strong)' }, st);
    cara(st, [[XZ, Z0], [XZ, Z1]], 'silna c-zrcadlo');
    txt(st, XZ + 16, Z0 + 14, 'zrcadlo', 't-maly');

    m.kresli = g => {
      const k = m.k;
      const vrch = PODLAHA - VYSKA;
      const xo = 2 * XZ - s.x;
      // oko se dívá ke středu zrcadla, paprsky míří do zornice
      const smer = Math.atan2((Z0 + Z1) / 2 - s.oko[1], XZ - s.oko[0]);
      const E = V.add(s.oko, V.mul([Math.cos(smer), Math.sin(smer)], 13));
      /* Kterou část svíčky oko v zrcadle vidí: bod obrazu Q′ = [xo, y] je vidět, když spojnice
         Q′–oko protne zrcadlo mezi Z0 a Z1. Spojnice je lineární v y, takže okraje viditelné
         části dostaneme přímo z okrajů zrcadla. */
      let od = null, po = null;
      if (E[0] < XZ - 2 && s.x < XZ) {
        const t = (XZ - xo) / (E[0] - xo);                 // podíl cesty od obrazu k oku, kde je zrcadlo
        const yObrazu = yM => (yM - t * E[1]) / (1 - t);   // bod obrazu, jehož paprsek míří na výšku yM zrcadla
        const a = Math.max(vrch, Math.min(yObrazu(Z0), yObrazu(Z1)));
        const b = Math.min(PODLAHA, Math.max(yObrazu(Z0), yObrazu(Z1)));
        if (b - a > 0.5) { od = a; po = b; }
      }
      const hl = sv('g', { class: 'zare' }, g);
      const body = od == null ? [] : po - od < 3 ? [(od + po) / 2] : [od, po];
      for (const y of body) {
        const Q = [s.x, y], Qo = [xo, y];
        const t = (XZ - Qo[0]) / (E[0] - Qo[0]);
        const M = [XZ, Qo[1] + t * (E[1] - Qo[1])];
        paprsek(hl, [Q, M, E], k, { tenky: true });
        if (s.prodlouzit) cara(g, [M, Qo], 'tenka carkovana c-paprsek', 'opacity:.85');
      }
      const cela = od != null && od <= vrch + 0.5 && po >= PODLAHA - 0.5;
      const plamen = od != null && od <= vrch + VYSKA * 0.28, spodek = od != null && po >= PODLAHA - 0.5;
      s.vidi = { F: od != null && od <= vrch + 0.5, B: spodek };
      svicka(g, s.x, PODLAHA, VYSKA, 'predmet', k);
      txt(g, s.x, PODLAHA + 22, 'svíčka', 't-maly t-stred');
      if (od != null) {   // na skutečné svíčce vyznačit, kterou část oko v zrcadle vidí
        const xz = s.x - 26;
        cara(g, [[xz + 5, od], [xz, od], [xz, po], [xz + 5, po]], 'c-obraz');
      }
      if (s.obraz || s.prodlouzit) {
        svicka(g, xo, PODLAHA, VYSKA, 'zdanlivy', k);
        if (od != null) cara(g, [[xo + 21, od], [xo + 26, od], [xo + 26, po], [xo + 21, po]], 'c-obraz');
        txt(g, xo, PODLAHA + 22, 'obraz (zdánlivý)', 't-maly t-stred t-obraz');
      }
      oko(g, s.oko, smer, k, 1.35);
      const d = (XZ - s.x) / 10;
      m.odecet([['Svíčka je před zrcadlem', cis(d, 1) + ' cm'], (s.prodlouzit || s.obraz) && ['Obraz je za zrcadlem', cis(d, 1) + ' cm']]);
      const zobr = 'Zelená závorka u svíčky ukazuje, kterou její část oko v zrcadle vidí; paprsky vedou od jejích okrajů.';
      m.zpravu(od == null ? 'Oko svíčku v zrcadle nevidí – paprsky od ní se odrazí mimo oko.'
        : cela ? 'Oko vidí v zrcadle <b>celou svíčku</b>. ' + zobr
        : plamen ? 'Oko vidí v zrcadle <b>jen horní část svíčky</b>. Zvedni oko nebo ho přibliž k zrcadlu – uvidí i níž. ' + zobr
        : spodek ? 'Oko vidí v zrcadle <b>jen spodní část svíčky</b>: čím výš oko je, tím níž se v zavěšeném zrcadle dívá (jako když si stoupneš na židli a v zrcadle uvidíš podlahu). ' + zobr
        : 'Oko vidí v zrcadle <b>jen prostřední část svíčky</b>. ' + zobr);
    };
    m.uchop({
      popis: 'Svíčka', poloha: () => [s.x, PODLAHA - 42],
      tahni: p => { s.x = omez(p[0], 90, 520); },
      klavesa: dx => { s.x = omez(s.x + 4 * dx, 90, 520); },
      hodnota: () => `svíčka ${cis((XZ - s.x) / 10, 0)} cm před zrcadlem`,
    });
    m.uchop({
      popis: 'Oko', poloha: () => s.oko,
      tahni: p => { s.oko = [omez(p[0], 50, 520), omez(p[1], 40, 300)]; },
      klavesa: (dx, dy) => { s.oko = [omez(s.oko[0] + 4 * dx, 50, 520), omez(s.oko[1] + 4 * dy, 40, 300)]; },
    });
    prepinac('zrc-prodlouzit', v => { s.prodlouzit = v; m.naplanuj(); });
    prepinac('zrc-obraz', v => { s.obraz = v; m.naplanuj(); });
    predpoved('zrc-kde', {
      otazka: 'Kde leží obraz svíčky, který oko vidí v zrcadle?',
      moznosti: ['Přímo na povrchu zrcadla.', 'Za zrcadlem – stejně daleko, jako je svíčka před ním.', 'Před zrcadlem, mezi svíčkou a zrcadlem.'],
      spravna: 1,
      vyzkousej: 'Zapni „Prodloužit odražené paprsky za zrcadlo“ a sleduj, kam prodloužení vedou. (Oko musí svíčku v zrcadle vidět.)',
      splneno: () => s.prodlouzit && (s.vidi.F || s.vidi.B),
      vysvetleni: 'Odražené paprsky se rozbíhají, jako by vycházely z míst za zrcadlem – jejich prodloužení vedou do obrazu. Oko nerozliší, že se světlo odrazilo, a vidí svíčku právě tam. Obraz leží souměrně podle zrcadla – posuň svíčku a uvidíš, že obě vzdálenosti jsou pořád stejné.',
      proc: { 0: 'Na zrcadle se paprsky jen odrážejí; jejich prodloužení se protnou až za ním.', 2: 'Před zrcadlem se odražené paprsky ani jejich prodloužení neprotínají.' },
    });
    Ukoly.definuj('zrc-cela', () => s.vidi.F && s.vidi.B,
      'Z této polohy dopadnou do oka paprsky od plamene i od spodku svíčky. Zajímavost: aby člověk viděl v zrcadle celou postavu, stačí mu zrcadlo <b>poloviční výšky</b>.');
  }

  /* ---------- 4 · Lom světla (dvě instance: lom a mezní úhel) ---------- */
  const LATKY = [
    { id: 'vzduch', n: 1.00, nazev: 'vzduch', gen: 'vzduchu', cls: null },
    { id: 'voda', n: 1.33, nazev: 'voda', gen: 'vody', cls: 'voda' },
    { id: 'sklo', n: 1.50, nazev: 'sklo', gen: 'skla', cls: 'sklo-plocha' },
    { id: 'diamant', n: 2.42, nazev: 'diamant', gen: 'diamantu', cls: 'diamant' },
  ];
  const latka = id => LATKY.find(l => l.id === id);

  function modelLom(id, vychozi) {
    const m = new Model(id, 900, 440);
    const O = [450, 220], R = 195, LAM = 34, HW = 36;
    const s = Object.assign({ vlny: false, faze: 0, v: null }, vychozi);
    const cid = id.replace(/\W/g, '');
    const cpH = sv('clipPath', { id: cid + '-h' }, m.defs); sv('rect', { x: 0, y: 0, width: 900, height: 220 }, cpH);
    const cpD = sv('clipPath', { id: cid + '-d' }, m.defs); sv('rect', { x: 0, y: 220, width: 900, height: 220 }, cpD);
    for (const strana of ['nahore', 'dole']) {
      const el = m.fig.querySelector(`[data-latka="${strana}"]`);
      el.innerHTML = LATKY.map(l => `<button type="button" data-hodnota="${l.id}">${l.nazev}</button>`).join('');
      segment(el, s[strana], v => { s[strana] = v; m.naplanuj(); });
    }
    function vypocet() {
      const lL = latka(s.strana === 'nahore' ? s.nahore : s.dole), lT = latka(s.strana === 'nahore' ? s.dole : s.nahore);
      const zn = s.strana === 'nahore' ? 1 : -1, a = s.alfa * RAD;
      const L = [O[0] - R * Math.sin(a), O[1] - zn * R * Math.cos(a)];
      const d = [Math.sin(a), zn * Math.cos(a)];
      const sb = lL.n / lT.n * Math.sin(a), tir = Math.abs(sb) > 1;
      const b = tir ? null : Math.asin(sb);
      const t = tir ? null : [Math.sin(b), zn * Math.cos(b)];
      const r = [Math.sin(a), -zn * Math.cos(a)];
      const Rf = tir ? 1 : fresnel(lL.n, lT.n, Math.cos(a), Math.cos(b));
      const am = lL.n > lT.n ? Math.asin(lT.n / lL.n) : null;
      return { lL, lT, zn, a, L, d, b, t, r, tir, Rf, am };
    }
    function vlnoplochy(g, u, n, od, po, hw, clip) {
      const sk = sv('g', { 'clip-path': `url(#${clip})` }, g);
      sv('path', { d: dCesta([V.add(O, V.mul(u, od)), V.add(O, V.mul(u, po))]), class: 'pas', 'stroke-width': r1(2 * hw) }, sk);
      const lam = LAM / n, q = [-u[1], u[0]];
      for (let j = Math.ceil(od / lam - s.faze); j <= Math.floor(po / lam - s.faze); j++) {
        const C = V.add(O, V.mul(u, lam * (j + s.faze)));
        cara(sk, [V.add(C, V.mul(q, -hw)), V.add(C, V.mul(q, hw))], 'vlnoplocha');
      }
    }
    m.kresli = g => {
      const k = m.k, v = vypocet();
      s.v = v;
      const lH = latka(s.nahore), lD = latka(s.dole);
      if (lH.cls) sv('rect', { x: 0, y: 0, width: 900, height: 220, class: lH.cls }, g);
      if (lD.cls) sv('rect', { x: 0, y: 220, width: 900, height: 220, class: lD.cls }, g);
      cara(g, [[0, 220], [900, 220]], 'tenka c-text');
      txt(g, 16, 10 + 17 * k, `${lH.nazev} · n = ${cis(lH.n, 2)}`, 't-silny');
      txt(g, 16, 10 + 34 * k, `světlo letí ${kmS(lH.n)}`, 't-maly');
      txt(g, 16, 230 + 17 * k, `${lD.nazev} · n = ${cis(lD.n, 2)}`, 't-silny');
      txt(g, 16, 230 + 34 * k, `světlo letí ${kmS(lD.n)}`, 't-maly');
      cara(g, [[450, 12], [450, 428]], 'tenka carkovana c-kolmice');
      txt(g, 458, v.zn > 0 ? 428 : 24, 'kolmice', 't-maly');
      if (v.am != null) {
        for (const z of [-1, 1]) cara(g, [O, V.add(O, V.mul([z * Math.sin(v.am), -v.zn * Math.cos(v.am)], 178))], 'tenka teckovana c-text');
        const pp = V.add(O, V.mul([Math.sin(v.am), -v.zn * Math.cos(v.am)], 182));
        txt(g, pp[0] + 6, pp[1] + (v.zn > 0 ? 0 : 12), `mezní úhel ${cis(v.am / RAD, 1)}°`, 't-maly');
      }
      if (s.vlny) {
        const clipL = cid + (v.zn > 0 ? '-h' : '-d'), clipT = cid + (v.zn > 0 ? '-d' : '-h');
        vlnoplochy(g, v.d, v.lL.n, -R, HW * Math.abs(Math.tan(v.a)) + 8, HW, clipL);
        if (!v.tir) {
          const hwT = HW * Math.cos(v.b) / Math.cos(v.a);
          vlnoplochy(g, v.t, v.lT.n, -hwT * Math.abs(Math.tan(v.b)) - 8, 330, hwT, clipT);
        } else vlnoplochy(g, v.r, v.lL.n, -HW * Math.abs(Math.tan(v.a)) - 8, 260, HW, clipL);
      }
      laser(g, v.L, v.d, k);
      const hl = sv('g', { class: 'zare' }, g);
      paprsek(hl, [v.L, O], k);
      paprsek(hl, [O, V.add(O, V.mul(v.r, 240))], k, { opacity: v.tir ? 1 : omez(0.14 + 1.5 * v.Rf, 0.14, 1), tok: v.tir, tenky: !v.tir });
      if (!v.tir) paprsek(hl, [O, V.add(O, V.mul(v.t, 300))], k, { opacity: omez(1 - v.Rf, 0.3, 1) });
      if (s.alfa !== 0) {
        const m1 = obloukUhlu(g, O, 58, -v.zn * Math.PI / 2, Math.atan2(v.L[1] - O[1], v.L[0] - O[0]), 'tenka c-paprsek');
        txt(g, O[0] + 78 * Math.cos(m1), O[1] + 78 * Math.sin(m1) + 5 * k, 'α', 't-velky t-stred t-paprsek');
        if (!v.tir) {
          const m2 = obloukUhlu(g, O, 58, v.zn * Math.PI / 2, Math.atan2(v.t[1], v.t[0]), 'tenka c-paprsek');
          txt(g, O[0] + 78 * Math.cos(m2), O[1] + 78 * Math.sin(m2) + 5 * k, 'β', 't-velky t-stred t-paprsek');
        }
      }
      m.odecet([
        ['Úhel dopadu α', Math.abs(s.alfa) + '°'],
        ['Úhel lomu β', v.tir ? 'není (úplný odraz)' : cis(Math.abs(v.b) / RAD, 1) + '°'],
        ['Odrazí se', cis(100 * v.Rf, 0) + ' % světla'],
      ]);
      const am = v.am != null ? cis(v.am / RAD, 1) + '°' : '';
      m.zpravu(v.lL.n === v.lT.n ? 'Obě prostředí jsou stejná – světlo se neláme.'
        : v.tir ? `<span class="pozor">Úplný odraz!</span> Úhel dopadu je větší než mezní úhel ${am}. Do ${v.lT.gen} světlo vůbec nevyjde a celé se odrazí.`
        : s.alfa === 0 ? 'Světlo dopadá kolmo na rozhraní – projde bez lomu, jen zpomalí nebo zrychlí.'
        : v.lT.n > v.lL.n ? `Do opticky <b>hustšího</b> prostředí (světlo zpomalí) se láme <b>ke kolmici</b>: β &lt; α.`
        : `Do opticky <b>řidšího</b> prostředí (světlo zrychlí) se láme <b>od kolmice</b>: β &gt; α. Mezní úhel je ${am}.`);
    };
    m.uchop({
      popis: 'Laser – táhni po kruhu, i pod rozhraní',
      poloha: () => vypocet().L,
      tahni: p => {
        const w = V.sub(p, O);
        s.strana = w[1] < 0 ? 'nahore' : 'dole';
        s.alfa = omez(Math.round(Math.atan2(-w[0], Math.max(0.5, Math.abs(w[1]))) / RAD), -85, 85);
      },
      klavesa: (dx, dy) => { if (dy) s.strana = dy < 0 ? 'nahore' : 'dole'; else s.alfa = omez(s.alfa - dx, -85, 85); },
      hodnota: () => `úhel dopadu ${Math.abs(s.alfa)} stupňů, laser ${s.strana === 'nahore' ? 'nahoře' : 'dole'}`,
    });
    const chk = m.fig.querySelector('[data-vlny]');
    let bezi = false, posl = 0;
    const krok = t => {
      if (!s.vlny || !m.viditelny || bezPohybu()) { bezi = false; return; }
      if (posl) s.faze = (s.faze + (t - posl) / 1000 * 0.8) % 1;
      posl = t;
      m.vykresli();
      requestAnimationFrame(krok);
    };
    const animuj = () => { if (bezi || !s.vlny || !m.viditelny || bezPohybu()) return; bezi = true; posl = 0; requestAnimationFrame(krok); };
    m.priViditelnosti = animuj;
    if (chk) prepinac(chk, v => { s.vlny = v; m.naplanuj(); animuj(); });
    return { m, s };
  }

  function modelLomy() {
    MODELY.lom = modelLom('obr-lom', { nahore: 'vzduch', dole: 'voda', strana: 'nahore', alfa: 40 });
    MODELY.mezni = modelLom('obr-mezni', { nahore: 'vzduch', dole: 'sklo', strana: 'dole', alfa: 30 });
    const A = MODELY.lom.s, B = MODELY.mezni.s;
    const zdroj = s => s.strana === 'nahore' ? s.nahore : s.dole;
    const cil = s => s.strana === 'nahore' ? s.dole : s.nahore;
    Ukoly.definuj('lom-45', () => zdroj(A) === 'vzduch' && cil(A) === 'voda' && Math.abs(A.alfa) === 45,
      'Úhel lomu je asi <b>32°</b> – menší než úhel dopadu. Voda je opticky hustší než vzduch, světlo se v ní láme ke kolmici.');
    predpoved('lom-diamant', {
      otazka: 'Ze vzduchu pošleš světlo pod stejným úhlem jednou do vody a jednou do diamantu. Kde se zalomí víc?',
      moznosti: ['Víc ve vodě.', 'Víc v diamantu.', 'V obou stejně – záleží jen na úhlu dopadu.'],
      spravna: 1,
      vyzkousej: 'Nech laser ve vzduchu (nahoře) a dole vyber diamant. Úhel dopadu aspoň 20°.',
      splneno: () => zdroj(A) === 'vzduch' && cil(A) === 'diamant' && Math.abs(A.alfa) >= 20,
      vysvetleni: 'Diamant má index lomu 2,42 – světlo v něm letí jen asi 124 000 km/s. Čím víc světlo na rozhraní zpomalí, tím víc se stočí ke kolmici. Při úhlu dopadu 45° je úhel lomu ve vodě asi 32°, v diamantu jen asi 17°.',
      proc: { 0: 'Voda světlo zpomalí méně než diamant (n = 1,33 proti 2,42), proto ho láme méně.', 2: 'Úhel lomu závisí i na látkách – na tom, jak moc světlo zpomalí.' },
    });
    Ukoly.definuj('lom-vlny', () => A.vlny && (A.nahore === 'diamant' || A.dole === 'diamant'),
      'V diamantu. Světlo v něm letí nejpomaleji, a tak se vlny nahustí (zkrátí se vlnová délka). Řada vlnoploch se na rozhraní stočí – to je lom.');
    predpoved('mezni', {
      otazka: 'Světlo jde ze skla do vzduchu. Co se stane, když budeš úhel dopadu pomalu zvětšovat?',
      moznosti: ['Lomený paprsek se bude přibližovat ke kolmici.', 'Lomený paprsek se bude odklánět od kolmice, až světlo ven nevyjde a celé se odrazí.', 'Světlo projde vždycky, jen bude slabší.'],
      spravna: 1,
      vyzkousej: 'Táhni laser (pod rozhraním) do strany a sleduj lomený paprsek nahoře.',
      splneno: () => B.v && B.v.tir && B.v.lL.n > B.v.lT.n,
      vysvetleni: 'Ze skla do vzduchu se světlo láme od kolmice, takže úhel lomu je vždy větší než úhel dopadu. Při mezním úhlu (asi 42°) dosáhne úhel lomu 90° a paprsek klouže po rozhraní. Při větším úhlu dopadu už ven nevyjde nic – všechno světlo se odrazí zpět do skla.',
      proc: { 0: 'Ke kolmici se světlo láme jen při přechodu do opticky hustšího prostředí; vzduch je řidší než sklo.', 2: 'Za mezním úhlem ven neprojde nic – odražený paprsek má pak plný jas.' },
    });
    Ukoly.definuj('mezni-voda', () => zdroj(B) === 'voda' && cil(B) === 'vzduch' && B.v && B.v.tir && Math.abs(B.alfa) <= 50,
      'Mezní úhel voda–vzduch je asi <b>48,8°</b>. U skla je menší (asi 41,8°), protože sklo má větší index lomu.');
  }

  /* ---------- 4b · Tužka ve vodě ---------- */
  function tuzka(g, pts, druh) {
    const sk = sv('g', { class: 'tuzka tuzka-' + druh }, g);
    const n = pts.length, a = pts[n - 2], b = pts[n - 1];
    const u = V.norm(V.sub(b, a)), q = [-u[1], u[0]];
    if (druh === 'nad') {
      sv('path', { d: dCesta(pts), class: 'tuzka-telo' }, sk);
      const z = pts[0], w = V.norm(V.sub(pts[1], pts[0]));
      sv('path', { d: dCesta([z, V.add(z, V.mul(w, 14))]), class: 'tuzka-guma' }, sk);
      return;
    }
    const zakl = V.sub(b, V.mul(u, 20));
    sv('path', { d: dCesta([...pts.slice(0, n - 1), zakl]), class: 'tuzka-telo' }, sk);
    mnohouhelnik(sk, [V.add(zakl, V.mul(q, 5.5)), b, V.sub(zakl, V.mul(q, 5.5))], 'tuzka-spicka');
    mnohouhelnik(sk, [V.add(V.sub(b, V.mul(u, 7)), V.mul(q, 2)), b, V.sub(V.sub(b, V.mul(u, 7)), V.mul(q, 2))], 'tuzka-tuha');
  }
  function modelHloubka() {
    const m = new Model('obr-hloubka', 900, 420);
    const s = { sklon: 38, oko: [700, 40], skutecna: false, hloubka: 0, zdanliva: 0 };
    MODELY.hloubka = { m, s };
    const Y = 205, DNO = 405, X0 = 150, X1 = 750, NV = 1.33, P0 = [400, Y];
    const st = m.staticka;
    sv('rect', { x: X0, y: Y, width: X1 - X0, height: DNO - Y, class: 'voda' }, st);
    cara(st, [[X0, Y - 50], [X0, DNO], [X1, DNO], [X1, Y - 50]], 'c-text');
    cara(st, [[X0, Y], [X1, Y]], 'tenka', '--c:var(--o-voda-okraj)');
    txt(st, X0 + 12, DNO - 14, 'voda · n = 1,33', 't-maly');
    txt(st, 16, 26, 'vzduch · n = 1,00', 't-maly');

    /* Bod na hladině, kde se lomí paprsek z Q do oka E (hledání půlením). */
    function naHladine(Q, E) {
      let a = Math.min(Q[0], E[0]), b = Math.max(Q[0], E[0]);
      const f = x => NV * (x - Q[0]) / Math.hypot(x - Q[0], Q[1] - Y) - (E[0] - x) / Math.hypot(E[0] - x, Y - E[1]);
      for (let i = 0; i < 60 && b - a > 1e-7; i++) { const c = (a + b) / 2; if (f(c) > 0) b = c; else a = c; }
      return [(a + b) / 2, Y];
    }
    /* Kde bod Q vidí oko: na prodlouženém paprsku (od oka přes hladinu dolů) přímo nad Q.
       To je školní konstrukce a zároveň obraz, který vnímáme: paprsky rozbíhající se kolem
       svislice přes Q se po lomu zdánlivě sbíhají zpět na tuto svislici. Při pohledu shora
       dává známou zdánlivou hloubku h/n. */
    function zdanlivy(Q, E) {
      const S = naHladine(Q, E);
      const d = V.norm(V.sub(S, E));
      if (Math.abs(d[0]) < 1e-6) return [Q[0], Y + (Q[1] - Y) / NV];
      return [Q[0], S[1] + d[1] * (Q[0] - S[0]) / d[0]];
    }
    m.kresli = g => {
      const k = m.k, th = s.sklon * RAD, u = [Math.sin(th), Math.cos(th)];
      const Lw = Math.min(200, (DNO - 14 - Y) / u[1]);
      const nad = V.add(P0, V.mul(u, -140)), hrotB = V.add(P0, V.mul(u, Lw));
      const E = s.oko;
      const zd = [];
      for (let i = 1; i <= 16; i++) zd.push(zdanlivy(V.add(P0, V.mul(u, Lw * i / 16)), E));
      const Qz = zd[zd.length - 1];
      if (s.skutecna) {
        tuzka(g, [P0, hrotB], 'skutecna');
        txt(g, hrotB[0] + 12, hrotB[1] + 4, 'skutečná poloha', 't-maly');
      }
      tuzka(g, [nad, P0], 'nad');
      tuzka(g, [P0, ...zd], 'pod');
      const hl = sv('g', { class: 'zare' }, g);
      const S0 = naHladine(hrotB, E);
      paprsek(hl, [hrotB, S0, E], k);
      cara(g, [S0, Qz], 'tenka carkovana c-paprsek', 'opacity:.9');
      if (s.skutecna) cara(g, [hrotB, Qz], 'tenka teckovana c-text');
      const smer = Math.atan2(S0[1] - E[1], S0[0] - E[0]);
      oko(g, V.sub(E, V.mul([Math.cos(smer), Math.sin(smer)], 13)), smer, k, 1.35);
      s.hloubka = (hrotB[1] - Y) / 10; s.zdanliva = (Qz[1] - Y) / 10;
      m.odecet([['Hrot je pod hladinou', cis(s.hloubka, 1) + ' cm'], ['Oku se zdá jen', cis(s.zdanliva, 1) + ' cm']]);
    };
    m.uchop({
      popis: 'Oko – podívej se odjinud', poloha: () => s.oko,
      tahni: p => { s.oko = [omez(p[0], 60, 860), omez(p[1], 22, Y - 30)]; },
      klavesa: (dx, dy) => { s.oko = [omez(s.oko[0] + 4 * dx, 60, 860), omez(s.oko[1] + 4 * dy, 22, Y - 30)]; },
    });
    posuvnik('hl-sklon', v => v + '°', v => { s.sklon = v; m.naplanuj(); });
    prepinac('hl-skutecna', v => { s.skutecna = v; m.naplanuj(); });
    predpoved('hl-tuzka', {
      otazka: 'Jak uvidíš část tužky, která je ponořená ve vodě?',
      moznosti: ['Zalomenou nahoru – jako by byla mělčeji.', 'Zalomenou dolů – jako by byla hlouběji.', 'Rovnou, jako by voda nebyla.'],
      spravna: 0,
      vyzkousej: 'Zapni „Ukázat, kde tužka opravdu je“ a porovnej ji s tím, co vidí oko.',
      splneno: () => s.skutecna,
      vysvetleni: 'Paprsky z ponořené části se na hladině lámou od kolmice. Oko ale předpokládá, že světlo letělo rovně, a paprsek si prodlouží zpět (čárkovaně). Hrot proto vidí na tomto prodloužení – přímo nad skutečným hrotem, jen výš. Ponořená část se zdá mělčeji a tužka vypadá u hladiny zalomená. Ze stejného důvodu se bazén nebo potok zdá mělčí, než je – při pohledu shora asi jen na tři čtvrtiny skutečné hloubky.',
      proc: { 1: 'Prodloužený paprsek vede nad skutečný hrot, ne pod něj – ponořená část se zdá výš.', 2: 'Voda světlo láme, takže paprsky nepřicházejí do oka rovně od tužky.' },
    });
  }

  /* ---------- 5b · Optické vlákno ---------- */
  function modelVlakno() {
    const m = new Model('obr-vlakno', 900, 360);
    const s = { R: 200, sklon: 8, konec: 0, unik: 0, minUhel: 90 };
    MODELY.vlakno = { m, s };
    const W = 44, Y0 = 110, X0 = 90, X1 = 370, FI = 55 * RAD, L2 = 130, N = 1.5;
    const LASER = [30, Y0];
    function geometrie() {
      const Rb = s.R, C = [X1, Y0 + Rb], Ro = Rb + W / 2, Ri = Rb - W / 2;
      const a0 = -Math.PI / 2, a1 = a0 + FI;
      const e = [Math.cos(a1), Math.sin(a1)], t = [-Math.sin(a1), Math.cos(a1)];
      const Po = V.add(C, V.mul(e, Ro)), Pi = V.add(C, V.mul(e, Ri));
      const Po2 = V.add(Po, V.mul(t, L2)), Pi2 = V.add(Pi, V.mul(t, L2));
      const hrany = [
        { typ: 'usecka', a: [X0, Y0 - W / 2], b: [X1, Y0 - W / 2], normala: [0, -1] },
        { typ: 'usecka', a: [X0, Y0 + W / 2], b: [X1, Y0 + W / 2], normala: [0, 1] },
        { typ: 'usecka', a: [X0, Y0 - W / 2], b: [X0, Y0 + W / 2], normala: [-1, 0], vstupni: true },
        { typ: 'oblouk', c: C, r: Ro, od: a0, do: a1, znam: 1 },
        { typ: 'oblouk', c: C, r: Ri, od: a0, do: a1, znam: -1 },
        { typ: 'usecka', a: Po, b: Po2, normala: e },
        { typ: 'usecka', a: Pi, b: Pi2, normala: V.mul(e, -1) },
        { typ: 'usecka', a: Po2, b: Pi2, normala: t, vystupni: true },
      ];
      const obrys = [[X0, Y0 - W / 2], [X1, Y0 - W / 2]];
      for (let i = 1; i <= 24; i++) { const u = a0 + FI * i / 24; obrys.push([C[0] + Ro * Math.cos(u), C[1] + Ro * Math.sin(u)]); }
      obrys.push(Po2, Pi2);
      for (let i = 24; i >= 0; i--) { const u = a0 + FI * i / 24; obrys.push([C[0] + Ri * Math.cos(u), C[1] + Ri * Math.sin(u)]); }
      obrys.push([X0, Y0 + W / 2]);
      return { teleso: { n: () => N, hrany }, obrys, konec: [Po2, Pi2], t };
    }
    m.kresli = g => {
      const k = m.k, geo = geometrie();
      mnohouhelnik(g, geo.obrys, 'sklo');
      const smer = [Math.cos(s.sklon * RAD), Math.sin(s.sklon * RAD)];
      laser(g, LASER, smer, k);
      const r = trasuj([geo.teleso], LASER, smer, 550, { odrazy: true, prah: 0.004, maxSeg: 90 });
      const hl = sv('g', { class: 'zare' }, g);
      for (const u of r.useky) {
        const w = u.w;
        if (w < 0.004) continue;
        paprsek(hl, [u.a, u.ven ? V.add(u.a, V.mul(V.norm(V.sub(u.b, u.a)), 700)) : u.b], k,
          { opacity: omez(0.1 + w, 0.1, 1), tenky: w < 0.5, sipky: w > 0.3, tok: w > 0.6 });
      }
      let konec = 0, unik = 0, minU = 90;
      for (const x of r.udalosti) {
        if (x.pohlceno || x.vstup) continue;
        const stena = !x.h.vstupni && !x.h.vystupni;
        if (stena && x.w > 0.3) minU = Math.min(minU, x.uhel / RAD);
        if (x.tir) continue;
        if (x.h.vystupni) konec += x.prosle; else if (stena) unik += x.prosle;
      }
      s.konec = konec; s.unik = unik; s.minUhel = minU;
      txt(g, (geo.konec[0][0] + geo.konec[1][0]) / 2 + 14, (geo.konec[0][1] + geo.konec[1][1]) / 2 + 26, 'konec vlákna', 't-maly');
      txt(g, X0, Y0 - W / 2 - 12, 'skleněné vlákno, n = 1,50', 't-maly');
      m.odecet([
        ['Na konec vlákna dojde', cis(100 * konec, 0) + ' % světla'],
        ['Stěnami unikne', cis(100 * unik, 0) + ' %'],
        ['Nejmenší úhel dopadu na stěnu', cis(minU, 0) + '° (mezní 41,8°)'],
      ]);
      m.zpravu(unik > 0.1
        ? '<span class="pozor">Světlo uniká!</span> V ostrém ohybu dopadá na vnější stěnu pod úhlem menším než mezní (41,8°), a tak část světla projde ven.'
        : 'Světlo dopadá na stěny pod větším úhlem, než je mezní úhel 41,8° – pokaždé se <b>úplně odrazí</b>. (Pár procent se ztratí jen odrazem na koncích vlákna.)');
    };
    posuvnik('vl-ohyb', v => cis(v / 10, 1) + ' cm', v => { s.R = v; m.naplanuj(); });
    posuvnik('vl-sklon', v => cis(v, 0) + '°', v => { s.sklon = v; m.naplanuj(); });
    predpoved('vlakno', {
      otazka: 'Světlo dopadá na stěnu vlákna zevnitř. Proč z něj nevyletí ven, i když vlákno zatáčí?',
      moznosti: ['Na stěnu dopadá pod větším úhlem, než je mezní úhel, a tak se úplně odrazí.', 'Stěny vlákna jsou zevnitř pokovené jako zrcadlo.', 'Sklo přitahuje světlo ke svému středu.'],
      spravna: 0,
      vyzkousej: 'Zmenšuj poloměr ohybu (a zkus i sklon laseru), dokud světlo nezačne unikat.',
      splneno: () => s.unik > 0.1,
      vysvetleni: 'Dokud světlo dopadá na stěnu pod úhlem větším než mezní (sklo–vzduch asi 42°), úplně se odrazí – žádné zrcadlo není potřeba. V ostrém ohybu ale dopadá na vnější stěnu strměji, úhel dopadu klesne pod mezní a část světla uteče. Proto se optické kabely nesmějí ostře lámat.',
      proc: { 1: 'Vlákno pokovené není – stačí úplný odraz na rozhraní dvou látek s různým indexem lomu.', 2: 'Sklo světlo nepřitahuje; světlo se na rozhraní jen láme a odráží.' },
    });
  }

  /* Konec úsečky, která vychází z A směrem d, na okraji obdélníku 0..W × 0..H (nebo o kus dál). */
  function naOkraj(A, d, W, H) {
    let t = 5000;
    if (d[0] > 1e-9) t = Math.min(t, (W + 20 - A[0]) / d[0]);
    if (d[0] < -1e-9) t = Math.min(t, (-20 - A[0]) / d[0]);
    if (d[1] > 1e-9) t = Math.min(t, (H + 20 - A[1]) / d[1]);
    if (d[1] < -1e-9) t = Math.min(t, (-20 - A[1]) / d[1]);
    return V.add(A, V.mul(d, Math.max(0, t)));
  }
  /* Body paprsku z úseků počítače (poslední úsek oříznutý na okraj obrázku). */
  function bodyUseku(useky, W, H) {
    if (!useky.length) return [];
    const pts = [useky[0].a];
    for (const u of useky) pts.push(u.ven ? naOkraj(u.a, V.norm(V.sub(u.b, u.a)), W, H) : u.b);
    return pts;
  }

  /* ---------- 6 · Hranol ---------- */
  /* Index lomu podle Cauchyho vzorce n(λ) = A + B/λ², nastavený podle katalogu skel:
     BK7 (n_d = 1,5168, Abbeho číslo 64) a SF11 (n_d = 1,7847, Abbeho číslo 25,7). */
  const SKLA = {
    korunove: { nd: 1.5168, B: 0.00420, nazev: 'korunové sklo' },
    flintove: { nd: 1.7847, B: 0.01598, nazev: 'flintové sklo' },
  };
  function modelHranol() {
    const m = new Model('obr-hranol', 960, 420);
    const s = { sklo: 'korunove', zvetsit: false, rot: 0, odchylka: null, rozdil: null };
    MODELY.hranol = { m, s };
    const C = [400, 200], RHO = 150, LASER = [40, 264], XS = 900;
    const SMER = [Math.cos(-19 * RAD), Math.sin(-19 * RAD)];
    const nL = l => { const g = SKLA[s.sklo]; return g.nd + (s.zvetsit ? 4 : 1) * g.B * (1 / Math.pow(l / 1000, 2) - 1 / Math.pow(0.5876, 2)); };
    const vrcholy = () => [-90, 30, 150].map(u => { const a = (u + s.rot) * RAD; return [C[0] + RHO * Math.cos(a), C[1] + RHO * Math.sin(a)]; });
    const stinitko = { n: () => 1, pohlti: true, hrany: [{ typ: 'usecka', a: [XS, -200], b: [XS, 620], normala: [-1, 0] }] };
    const VLNY = [];
    for (let l = 400; l <= 700.1; l += 7.5) VLNY.push(l);
    const uhel = (a, b) => Math.acos(omez(V.dot(a, b), -1, 1)) / RAD;

    m.kresli = g => {
      const k = m.k, vr = vrcholy();
      const scena = [{ n: nL, hrany: hranyMnohouhelniku(vr) }, stinitko];
      mnohouhelnik(g, vr, 'sklo');
      sv('rect', { x: XS, y: 20, width: 10, height: 380, fill: 'var(--bg-control)', stroke: 'var(--border-strong)', 'stroke-width': k }, g);
      txt(g, XS + 5, 13, 'stínítko', 't-maly t-stred');
      laser(g, LASER, SMER, k);
      const sk = sv('g', { class: 'spektrum' }, g);
      const svetly = document.documentElement.dataset.tone === 'light';
      let bily = null;
      for (const l of VLNY) {
        const r = trasuj(scena, LASER, SMER, l, { maxSeg: 8 });
        bily = bily || r.useky[0];
        const barva = barvaVlny(l);
        const pts = bodyUseku(r.useky, 960, 420);
        for (let i = 1; i < r.useky.length; i++) {
          const uvnitr = r.useky[i].stopa === 'T';
          cara(sk, [pts[i], pts[i + 1]], 'tenka', `--c:${barva};opacity:${uvnitr ? (svetly ? 0.14 : 0.45) : 0.85}`);
        }
        if (l === 587.5 && svetly && r.useky[1]) cara(g, [r.useky[1].a, r.useky[1].b], 'tenka c-bile', 'opacity:.7');
        const dop = r.udalosti.find(x => x.pohlceno);
        if (dop) cara(g, [[XS, dop.p[1]], [XS + 10, dop.p[1]]], '', `--c:${barva};stroke-width:${(3.2 * k).toFixed(2)}px`);
      }
      paprsek(sv('g', { class: 'zare' }, g), [bily.a, bily.b], k, { cls: 'c-bile' });
      const P = V.add(LASER, V.mul(SMER, 130));
      txt(g, P[0] - 20, P[1] - 14, 'bílé světlo', 't-maly');
      txt(g, C[0], C[1] + RHO / 2 + 24, SKLA[s.sklo].nazev + (s.zvetsit ? ' · rozklad zveličen 4×' : ''), 't-maly t-stred');
      const mer = l => {
        const r = trasuj(scena, LASER, SMER, l, { maxSeg: 8 });
        const d = r.udalosti.find(x => x.pohlceno);
        return d ? { d: d.d, p: d.p } : null;
      };
      const zl = mer(589), cr = mer(656), fi = mer(410);
      if (cr) txt(g, XS - 44, cr.p[1] - 12, 'červená', 't-maly t-konec');
      if (fi) txt(g, XS - 44, fi.p[1] + 22, 'fialová', 't-maly t-konec');
      s.odchylka = zl ? uhel(SMER, zl.d) : null;
      s.rozdil = cr && fi ? uhel(cr.d, fi.d) : null;
      m.odecet([
        ['Odchylka žlutého světla', s.odchylka != null ? cis(s.odchylka, 1) + '°' : '–'],
        ['Rozdíl červená – fialová', s.rozdil != null ? cis(s.rozdil, 2) + '°' : '–'],
        ['Index lomu červená / fialová', `${cis(nL(656), 3)} / ${cis(nL(410), 3)}`],
      ]);
    };
    m.uchop({
      popis: 'Vrchol hranolu – otáčej hranolem',
      poloha: () => vrcholy()[0],
      tahni: p => { s.rot = omez(Math.round(Math.atan2(p[1] - C[1], p[0] - C[0]) / RAD + 90), -35, 35); },
      klavesa: dx => { s.rot = omez(s.rot + dx, -35, 35); },
      hodnota: () => `natočení hranolu ${s.rot} stupňů`,
    });
    segment($('#hr-sklo'), s.sklo, v => { s.sklo = v; m.naplanuj(); });
    prepinac('hr-zvetsit', v => { s.zvetsit = v; m.naplanuj(); });
    predpoved('hranol', {
      otazka: 'Které světlo se v hranolu láme (odchýlí od původního směru) nejvíc?',
      moznosti: ['Červené.', 'Zelené.', 'Fialové.'],
      spravna: 2,
      vyzkousej: 'Zapni „Zveličit rozklad 4×“ a podívej se, která barva dopadá na stínítko nejníž – nejdál od původního směru.',
      splneno: () => s.zvetsit,
      vysvetleni: 'Fialové světlo má ve skle největší index lomu – zpomalí nejvíc, a proto se láme nejvíc. Červené se láme nejméně. Totéž se děje v kapkách deště: proto má duha červenou barvu nahoře (venku) a fialovou dole (uvnitř).',
      proc: { 0: 'Červená se odchyluje nejméně – na stínítku je nejblíž k původnímu směru.', 1: 'Zelená je uprostřed spektra; víc se láme modrá a fialová.' },
    });
  }

  /* ---------- 6b · Duha ---------- */
  function modelDuha() {
    const m = new Model('obr-duha', 900, 470);
    const s = { b: 0.86, svazek: false };
    MODELY.duha = { m, s };
    const C = [610, 170], RK = 132;
    const nV = l => 1.3239 + 0.00313 / Math.pow(l / 1000, 2);   // voda, Cauchy
    const BARVY = [656, 610, 580, 550, 510, 470, 420];
    const kruh = [{ typ: 'oblouk', c: C, r: RK, od: -Math.PI, do: Math.PI, znam: 1 }];
    function cesta(b, l) {
      const r = trasuj([{ n: () => nV(l), hrany: kruh }], [0, C[1] - b * RK], [1, 0], l, { odrazy: true, prah: 1e-7, maxSeg: 3 });
      const najdi = st => r.useky.find(x => x.stopa === st);
      return { vstup: najdi(''), uvnitr: najdi('T'), odraz: najdi('TR'), ven: najdi('TRT') };
    }
    const uhelVen = u => Math.acos(omez(-V.norm(V.sub(u.b, u.a))[0], -1, 1)) / RAD;
    function maximum(l) {
      const n = nV(l);
      let nej = 0;
      for (let i = 1; i < 2000; i++) { const b = i / 2000; nej = Math.max(nej, (4 * Math.asin(b / n) - 2 * Math.asin(b)) / RAD); }
      return nej;
    }
    m.kresli = g => {
      const k = m.k;
      sv('circle', { cx: C[0], cy: C[1], r: RK, class: 'voda' }, g);
      sv('circle', { cx: C[0], cy: C[1], r: RK, fill: 'none', stroke: 'var(--o-voda-okraj)', 'stroke-width': 1.5 * k }, g);
      txt(g, C[0] + RK * 0.72, C[1] + RK + 18, 'kapka vody (hodně zvětšená)', 't-maly t-stred');
      txt(g, 14, 22, 'sluneční světlo →', 't-maly');
      const sk = sv('g', { class: 'spektrum' }, g);
      const smer = u => V.norm(V.sub(u.b, u.a));
      if (s.svazek) {
        for (let i = 0; i < 50; i++) {
          const u = cesta(0.03 + 0.96 * i / 49, 656);
          if (!u.ven) continue;
          cara(sk, [u.vstup.a, u.vstup.b], 'tenka c-bile', 'opacity:.22');
          cara(sk, [u.ven.a, V.add(u.ven.a, V.mul(smer(u.ven), 460))], 'tenka', `--c:${barvaVlny(656)};opacity:.5`);
        }
        const th = maximum(656);
        m.odecet([['Nejvíc červených paprsků vychází pod úhlem', '≈ ' + cis(th, 1) + '°'], ['u fialové', '≈ ' + cis(maximum(420), 1) + '°']]);
      } else {
        const u0 = cesta(s.b, 580);
        paprsek(sv('g', { class: 'zare' }, g), [u0.vstup.a, u0.vstup.b], k, { cls: 'c-bile' });
        let cervena = null, fialova = null;
        for (const l of BARVY) {
          const u = cesta(s.b, l);
          if (!u.ven) continue;
          const barva = barvaVlny(l);
          cara(sk, [u.uvnitr.a, u.uvnitr.b], 'tenka', `--c:${barva};opacity:.75`);
          cara(sk, [u.odraz.a, u.odraz.b], 'tenka', `--c:${barva};opacity:.75`);
          cara(sk, [u.ven.a, V.add(u.ven.a, V.mul(smer(u.ven), 460))], '', `--c:${barva};opacity:.9`);
          if (l === 656) cervena = u;
          if (l === 420) fialova = u;
        }
        if (cervena) {
          const E = cervena.ven.a, e = smer(cervena.ven);
          cara(g, [E, [E[0] - 260, E[1]]], 'tenka carkovana c-text');
          const mid = obloukUhlu(g, E, 150, Math.PI, Math.atan2(e[1], e[0]), 'tenka c-text');
          txt(g, E[0] + 170 * Math.cos(mid) - 6, E[1] + 170 * Math.sin(mid) + 6, cis(uhelVen(cervena.ven), 1) + '°', 't-silny t-konec');
        }
        m.odecet([
          ['Červená vychází pod úhlem', cervena ? cis(uhelVen(cervena.ven), 1) + '°' : '–'],
          ['fialová', fialova ? cis(uhelVen(fialova.ven), 1) + '°' : '–'],
          ['(měřeno od směru slunečních paprsků)', ''],
        ]);
      }
    };
    posuvnik('duha-vyska', v => cis(v / 100, 2) + ' poloměru', v => { s.b = v / 100; m.naplanuj(); });
    prepinac('duha-svazek', v => { s.svazek = v; m.naplanuj(); });
  }

  /* ---------- 7 · Čočka (skutečný lom na obou plochách) ---------- */
  function modelCocka() {
    const m = new Model('obr-cocka', 960, 400);
    const s = { typ: 'spojka', R: 300, n: 1.5, osa: false, rTip: null, f: null };
    MODELY.cocka = { m, s };
    const X0 = 320, Y = 200, H = 96;
    function geometrie(typ) {
      const R = Math.max(s.R, H + 12), sag = R - Math.sqrt(R * R - H * H), th = Math.asin(H / R);
      const nf = () => s.n, obrys = [];
      if (typ === 'rozptylka') {
        const tc = 8, cL = [X0 - tc / 2 - R, Y], cR = [X0 + tc / 2 + R, Y];
        for (let i = 0; i <= 30; i++) { const y = -H + 2 * H * i / 30; obrys.push([cL[0] + Math.sqrt(R * R - y * y), Y + y]); }
        for (let i = 30; i >= 0; i--) { const y = -H + 2 * H * i / 30; obrys.push([cR[0] - Math.sqrt(R * R - y * y), Y + y]); }
        const cocka = { n: nf, hrany: [
          { typ: 'oblouk', c: cL, r: R, od: -th, do: th, znam: -1 },
          { typ: 'oblouk', c: cR, r: R, od: Math.PI - th, do: Math.PI + th, znam: -1 },
          { typ: 'usecka', a: [X0 - tc / 2 - sag, Y - H], b: [X0 + tc / 2 + sag, Y - H], normala: [0, -1] },
          { typ: 'usecka', a: [X0 - tc / 2 - sag, Y + H], b: [X0 + tc / 2 + sag, Y + H], normala: [0, 1] },
        ] };
        return { telesa: [cocka], obrysy: [obrys], cocka };
      }
      const t = 2 * sag + 6, cL = [X0 - t / 2 + R, Y], cR = [X0 + t / 2 - R, Y];
      for (let i = 0; i <= 30; i++) { const y = -H + 2 * H * i / 30; obrys.push([cL[0] - Math.sqrt(R * R - y * y), Y + y]); }
      for (let i = 30; i >= 0; i--) { const y = -H + 2 * H * i / 30; obrys.push([cR[0] + Math.sqrt(R * R - y * y), Y + y]); }
      const cocka = { n: nf, hrany: [
        { typ: 'oblouk', c: cL, r: R, od: Math.PI - th, do: Math.PI + th, znam: 1 },
        { typ: 'oblouk', c: cR, r: R, od: -th, do: th, znam: 1 },
        { typ: 'usecka', a: [X0 - 3, Y - H], b: [X0 + 3, Y - H], normala: [0, -1] },
        { typ: 'usecka', a: [X0 - 3, Y + H], b: [X0 + 3, Y + H], normala: [0, 1] },
      ] };
      if (typ === 'spojka') return { telesa: [cocka], obrysy: [obrys], cocka };
      // spojka složená z hranolků: stěny jsou tečny ke skutečné čočce uprostřed každého pásu
      const K = 7, pas = 2 * H / K, telesa = [], obrysy = [], stredy = [];
      for (let j = 0; j < K; j++) {
        const ya = -H + j * pas + 1.5, yb = -H + (j + 1) * pas - 1.5, yc = (ya + yb) / 2;
        const PL = [cL[0] - Math.sqrt(R * R - yc * yc), Y + yc], nl = V.mul(V.sub(PL, cL), 1 / R);
        const PR = [cR[0] + Math.sqrt(R * R - yc * yc), Y + yc], nr = V.mul(V.sub(PR, cR), 1 / R);
        const xl = y => PL[0] - nl[1] * (Y + y - PL[1]) / nl[0];
        const xr = y => PR[0] - nr[1] * (Y + y - PR[1]) / nr[0];
        const body = [[xl(ya), Y + ya], [xr(ya), Y + ya], [xr(yb), Y + yb], [xl(yb), Y + yb]];
        telesa.push({ n: nf, hrany: hranyMnohouhelniku(body) });
        obrysy.push(body);
        stredy.push(yc);
      }
      return { telesa, obrysy, cocka, stredy, obrysCocky: obrys };
    }
    function osaX(useky) {
      const u = useky[useky.length - 1], d = V.norm(V.sub(u.b, u.a));
      if (Math.abs(d[1]) < 1e-12) return Infinity;
      return u.a[0] + d[0] * (Y - u.a[1]) / d[1];
    }
    m.kresli = g => {
      const k = m.k, geo = geometrie(s.typ);
      cara(g, [[0, Y], [960, Y]], 'tenka carkovana c-osa');
      txt(g, 952, Y - 8, 'optická osa', 't-maly t-konec');
      if (geo.obrysCocky) cara(g, [...geo.obrysCocky, geo.obrysCocky[0]], 'tenka carkovana', '--c:var(--o-sklo-okraj);opacity:.6');
      for (const o of geo.obrysy) mnohouhelnik(g, o, 'sklo');
      const xF = osaX(trasuj([geo.cocka], [0, Y - 0.5], [1, 0], 550, { maxSeg: 6 }).useky);
      s.f = (xF - X0) / 10;
      const vysky = geo.stredy || Array.from({ length: 9 }, (_, i) => (s.osa ? 0.24 : 0.9) * H * (-1 + 2 * i / 8));
      const hl = sv('g', { class: 'zare' }, g);
      let kraj = null;
      vysky.forEach((h, i) => {
        const r = trasuj(geo.telesa, [0, Y + h], [1, 0], 550, { maxSeg: 12 });
        const pts = bodyUseku(r.useky, 960, 400);
        paprsek(hl, pts, k, { tenky: Math.abs(h) > 1, tok: i % 2 === 0 });
        if (s.typ === 'rozptylka' && isFinite(xF)) {
          const u = r.useky[r.useky.length - 1], d = V.norm(V.sub(u.b, u.a));
          if (d[0] > 0) cara(g, [u.a, V.sub(u.a, V.mul(d, (u.a[0] - (xF - 14)) / d[0]))], 'tenka carkovana c-paprsek', 'opacity:.7');
        }
        if (i === 0) kraj = osaX(r.useky);
      });
      if (isFinite(xF)) {
        for (const [x, jm] of [[xF, 'F′'], [2 * X0 - xF, 'F']]) {
          sv('circle', { cx: x, cy: Y, r: 5 * k, class: 'vypln c-ohnisko' }, g);
          txt(g, x, Y + 22 * k, jm, 't-ohnisko t-stred');
        }
        const yk = Y + H + 34;
        cara(g, [[X0, yk - 6], [X0, yk + 6]], 'tenka c-text');
        cara(g, [[xF, yk - 6], [xF, yk + 6]], 'tenka c-text');
        cara(g, [[X0, yk], [xF, yk]], 'tenka c-text');
        txt(g, (X0 + xF) / 2, yk - 8, 'f ≈ ' + cis(Math.abs(s.f), 1) + ' cm', 't-maly t-stred');
      }
      const vada = s.typ === 'spojka' && !s.osa && isFinite(kraj) ? (xF - kraj) / 10 : 0;
      m.odecet([
        ['Ohnisková vzdálenost f', '≈ ' + cis(s.f, 1) + ' cm'],
        ['Optická mohutnost φ', '≈ ' + sePlus(100 / s.f, 1) + ' D'],
        vada > 0.3 && ['Okrajové paprsky protnou osu o', cis(vada, 1) + ' cm blíž'],
      ]);
      m.zpravu(s.typ === 'hranolky'
        ? 'Každý hranolek láme světlo k silnější straně – tedy k ose. Krajní hranolky mají stěny víc skloněné, a proto lámou víc. Paprsky se tak sejdou skoro v jednom bodě – přesně jako u čočky (čárkovaný obrys).'
        : s.typ === 'rozptylka'
          ? 'Rozptylka paprsky rozptyluje. Jejich prodloužení (čárkovaně) se protínají v ohnisku <b>před</b> čočkou – ohnisková vzdálenost i optická mohutnost jsou záporné.'
          : vada > 0.3 ? 'Paprsky u okraje se protínají o kousek blíž než paprsky u osy – to je vada čočky (viz „Pro zvídavé“ níže).' : '');
    };
    segment($('#co-typ'), s.typ, v => { s.typ = v; m.naplanuj(); });
    posuvnik('co-r', v => cis(v / 10, 1) + ' cm', v => { s.R = v; m.naplanuj(); });
    segment($('#co-n'), '1.5', v => { s.n = +v; m.naplanuj(); });
    prepinac('co-osa', v => { s.osa = v; m.naplanuj(); });
    predpoved('cocka-r', {
      otazka: 'Co se stane s ohniskem spojky, když ji víc vyklenete (zmenšíte poloměr zakřivení)?',
      moznosti: ['Ohnisko se přiblíží k čočce.', 'Ohnisko se vzdálí od čočky.', 'Ohnisko zůstane na stejném místě.'],
      spravna: 0,
      priTipu: () => { s.rTip = s.R; },
      vyzkousej: 'U spojky zmenši posuvníkem poloměr zakřivení aspoň o 6 cm a sleduj ohnisko F′.',
      splneno: () => s.typ !== 'rozptylka' && s.rTip != null && s.R < s.rTip && (s.R <= s.rTip - 60 || s.R <= 140),
      vysvetleni: 'Víc vyklenutá čočka má u okrajů strmější plochy, a tak láme paprsky víc – sejdou se blíž. Ohnisková vzdálenost se zkrátí a optická mohutnost vzroste. Proto jsou brýle s vysokými dioptriemi silnější a víc vyklenuté.',
      proc: { 1: 'Vzdálilo by se, kdyby byla čočka plošší – slabší.', 2: 'Tvar čočky rozhoduje o tom, jak moc světlo láme.' },
    });
    Ukoly.definuj('cocka-f15', () => s.typ === 'spojka' && s.f > 0 && 100 / s.f >= 6,
      'Silnější spojku dostaneš <b>menším poloměrem zakřivení</b> nebo <b>materiálem s větším indexem lomu</b> (flint). Obojí zkrátí ohniskovou vzdálenost.');
  }

  /* ---------- 8 · Zobrazení tenkou čočkou ---------- */
  const PRESETY = {
    fotoaparat: { typ: 'spojka', f: 10, a: 40, y: 8 },
    kopirka: { typ: 'spojka', f: 10, a: 20, y: 7 },
    projektor: { typ: 'spojka', f: 10, a: 14, y: 4 },
    lupa: { typ: 'spojka', f: 12, a: 7, y: 4 },
  };
  function modelZobrazeni() {
    const m = new Model('obr-zobrazeni', 1000, 460);
    const s = { typ: 'spojka', f: 10, a: 30, y: 6, paprsky: true, svazek: false, stinitko: false, xs: 20, krok: null, v: null };
    MODELY.zobrazeni = { m, s };
    const X0 = 560, Y = 230, S = 10, HL = 150, CLONA = 60;   // svazek jde středem čočky o průměru 12 cm
    const X = cm => X0 + cm * S;
    function vypocet() {
      const f = s.typ === 'spojka' ? s.f : -s.f, a = s.a;
      const nek = Math.abs(a - f) < 1e-9;
      const ap = nek ? Infinity : a * f / (a - f);
      const Z = nek ? Infinity : -ap / a;
      return { f, a, ap, Z, yp: nek ? Infinity : Z * s.y, nek, skutecny: !nek && ap > 0 };
    }
    const vlastnosti = v => {
      if (v.nek) return 'nevznikne';
      const z = Math.abs(v.Z);
      return `${v.skutecny ? 'skutečný' : 'zdánlivý'}, ${v.Z < 0 ? 'převrácený' : 'přímý'}, ${z > 1.005 ? 'zvětšený' : z < 0.995 ? 'zmenšený' : 'stejně velký'}`;
    };
    const pripad = () => s.typ === 'rozptylka' ? 'rozptylka' : Math.abs(s.a - 2 * s.f) < 0.01 ? '2f' : s.a > 2 * s.f ? 'za2f'
      : Math.abs(s.a - s.f) < 0.01 ? 'f' : s.a > s.f ? 'mezi' : 'pred';
    const ostre = v => v.skutecny && s.stinitko && Math.abs(s.xs - v.ap) < 0.3;

    const st = m.staticka;
    cara(st, [[0, Y], [1000, Y]], 'tenka carkovana c-osa');
    txt(st, 994, Y - 8, 'optická osa', 't-maly t-konec');
    cara(st, [[X(-55), 446], [X(44), 446]], 'tenka c-text', 'opacity:.6');
    for (let c = -55; c <= 44; c += 5) {
      cara(st, [[X(c), 446], [X(c), c % 10 === 0 ? 438 : 441]], 'tenka c-text', 'opacity:.6');
      if (c % 10 === 0) txt(st, X(c), 432, c === 0 ? '0' : String(Math.abs(c)), 't-maly t-stred');
    }
    txt(st, 996, 432, 'cm', 't-maly t-konec');

    function kresliCocku(g, k) {
      if (s.typ === 'spojka') sv('ellipse', { cx: X0, cy: Y, rx: 11, ry: HL, class: 'sklo' }, g);
      else sv('path', { d: `M${X0 - 13} ${Y - HL} Q${X0 - 1} ${Y} ${X0 - 13} ${Y + HL} L${X0 + 13} ${Y + HL} Q${X0 + 1} ${Y} ${X0 + 13} ${Y - HL}Z`, class: 'sklo' }, g);
      cara(g, [[X0, Y - HL], [X0, Y + HL]], 'tenka c-text');
      if (s.typ === 'spojka') { hrot(g, [X0, Y - HL], [0, -1], k, 1.1, 'c-text'); hrot(g, [X0, Y + HL], [0, 1], k, 1.1, 'c-text'); }
      else { hrot(g, [X0, Y - HL + 7 * k], [0, 1], k, 1.1, 'c-text'); hrot(g, [X0, Y + HL - 7 * k], [0, -1], k, 1.1, 'c-text'); }
      txt(g, X0 + 16, Y - HL + 6, s.typ, 't-maly');
    }
    function cislo(g, P, c, k) {
      sv('circle', { cx: P[0], cy: P[1], r: 10 * k, fill: 'var(--bg-panel)', stroke: 'var(--o-paprsek)', 'stroke-width': 1.5 * k }, g);
      txt(g, P[0], P[1] + 4.5 * k, String(c), 't-silny t-stred');
    }
    function vyznacne(v, T) {
      const Fp = [X(v.f), Y], Fo = [X(-v.f), Y], vysl = [];
      const L1 = [X0, T[1]];
      vysl.push({ c: 1, L: L1, d: s.typ === 'spojka' ? V.norm(V.sub(Fp, L1)) : V.norm(V.sub(L1, Fp)), zpet: s.typ === 'rozptylka' ? Fp : null });
      const L2 = [X0, Y];
      vysl.push({ c: 2, L: L2, d: V.norm(V.sub(L2, T)) });
      if (Math.abs(T[0] - Fo[0]) > 1e-6) {
        const y3 = T[1] + (X0 - T[0]) * (Fo[1] - T[1]) / (Fo[0] - T[0]);
        if (Math.abs(y3 - Y) < 3000) vysl.push({ c: 3, L: [X0, y3], d: [1, 0], odF: s.typ === 'spojka' && s.a < v.f ? Fo : null, doF: s.typ === 'rozptylka' ? Fo : null });
      }
      return vysl;
    }
    function textKroku(v) {
      const r = s.typ === 'rozptylka';
      switch (s.krok) {
        case 0: return 'Svíčka stojí před čočkou. Obraz špičky plamene najdeme pomocí paprsků, které z ní vycházejí. Stačí nám tři význačné.';
        case 1: return r ? '① Paprsek rovnoběžný s osou se v rozptylce láme od osy – jako by vycházel z ohniska F′ před čočkou (čárkovaně).'
          : '① Paprsek rovnoběžný s optickou osou se v čočce láme a pokračuje přes ohnisko F′.';
        case 2: return '② Paprsek, který jde středem čočky, se neláme – pokračuje rovně.';
        case 3: return r ? '③ Paprsek mířící do ohniska F za čočkou vychází z rozptylky rovnoběžně s osou.'
          : v.nek ? '③ Svíčka stojí přímo v ohnisku F – třetí paprsek tu nakreslit nejde.'
          : s.a < v.f ? '③ Paprsek, který míří od ohniska F (jako by z něj vycházel – čárkovaně), vychází z čočky rovnoběžně s osou.'
          : '③ Paprsek, který jde přes ohnisko F, vychází z čočky rovnoběžně s osou.';
        default: {
          const vel = Math.abs(v.Z) > 1.005 ? 'zvětšený' : Math.abs(v.Z) < 0.995 ? 'zmenšený' : 'stejně velký';
          if (v.nek) return 'Paprsky za čočkou jdou rovnoběžně a nikde se neprotnou – obraz nevznikne.';
          return v.skutecny
            ? `Paprsky se za čočkou protnuly – tam je obraz špičky plamene. Svíčka stojí na ose, takže i obraz jejího spodku je na ose. Obraz je <b>skutečný, převrácený a ${vel}</b> – zachytíš ho na stínítku.`
            : `Paprsky se za čočkou rozbíhají. Protnou se jen jejich prodloužení před čočkou – obraz je <b>zdánlivý, přímý a ${vel}</b>. Uvidíš ho, když se podíváš skrz čočku.`;
        }
      }
    }

    const nahled = $('#zob-nahled'), nsvg = $('svg', nahled), ntext = $('#zob-nahled-text');
    const obal = m.fig.querySelector('.obr-s-nahledem');
    const filtr = sv('filter', { id: 'zobRozmaz', x: '-100%', y: '-100%', width: '300%', height: '300%' }, sv('defs', null, nsvg));
    const rozmaz = sv('feGaussianBlur', { stdDeviation: 0 }, filtr);
    sv('rect', { x: 0, y: 0, width: 240, height: 150, fill: 'var(--bg-deep)' }, nsvg);
    const nObsah = sv('g', { filter: 'url(#zobRozmaz)' }, nsvg);
    let poslNahled = '';
    function kresliNahled(v) {
      nahled.hidden = !s.stinitko;
      obal.classList.toggle('ma-nahled', s.stinitko);
      if (!s.stinitko) return;
      const D = 2 * CLONA / S, MER = 5.5;
      const c = v.nek ? D : D * Math.abs(s.xs - v.ap) / Math.abs(v.ap);
      const vyska = -s.y * s.xs / s.a;
      const klic = [c.toFixed(2), vyska.toFixed(2)].join();
      if (klic !== poslNahled) {
        poslNahled = klic;
        nObsah.replaceChildren();
        rozmaz.setAttribute('stdDeviation', Math.min(40, c * MER / 2.4).toFixed(2));
        sv('circle', { cx: 120, cy: 75 - vyska * MER / 2, r: Math.max(4, c * MER / 2), class: 'svetlo-vypln', opacity: 0.18 }, nObsah);
        svicka(nObsah, 120, 75 - vyska * MER / 2, omez(vyska * MER, -140, 140), 'predmet', 1);
      }
      ntext.innerHTML = ostre(v) ? `<b class="ok">Ostrý obraz</b> – ${vlastnosti(v)}. Stínítko je ${cisK(s.xs, 1)} cm za čočkou.`
        : v.skutecny ? `Obraz je rozmazaný. Posuň stínítko <b>${s.xs < v.ap ? 'dál od čočky' : 'blíž k čočce'}</b>.`
        : 'Na stínítku je jen rozmazaná světlá skvrna – skutečný obraz tu nevzniká.';
    }

    const kPanel = $('#zob-krokovani'), kCislo = $('#zob-krok-cislo'), kText = $('#zob-krok-text');
    const rovnice = $('#zob-rovnice'), radky = $$('#zob-pripady tr[data-pripad]');

    m.kresli = g => {
      const k = m.k, v = vypocet();
      s.v = v;
      const T = [X(-s.a), Y - s.y * S];
      const I = v.nek ? null : [X(v.ap), Y - v.yp * S];
      const krok = s.krok;
      kresliCocku(g, k);
      for (const [P, jm] of [[[X(v.f), Y], 'F′'], [[X(-v.f), Y], 'F']]) {
        sv('circle', { cx: P[0], cy: P[1], r: 4.5 * k, class: 'vypln c-ohnisko' }, g);
        txt(g, P[0], P[1] + 34 * k, jm, 't-ohnisko t-stred');
      }
      if (s.typ === 'spojka') for (const [x, jm] of [[X(2 * s.f), '2F′'], [X(-2 * s.f), '2F']]) {
        cara(g, [[x, Y - 6 * k], [x, Y + 6 * k]], 'tenka c-ohnisko');
        txt(g, x, Y + 34 * k, jm, 't-maly t-stred');
      }
      const hl = sv('g', { class: 'zare' }, g);
      const konec = (L, d) => V.add(L, V.mul(d, (1030 - L[0]) / d[0]));
      // svazek (a paprsky na stínítko)
      if ((s.svazek && krok == null) || s.stinitko) {
        const xsP = X(s.xs), dopady = [];
        for (let j = 0; j < 9; j++) {
          const L = [X0, Y - CLONA + 2 * CLONA * j / 8];
          const d = v.nek ? V.norm(V.sub([X0, Y], T)) : v.skutecny ? V.norm(V.sub(I, L)) : V.norm(V.sub(L, I));
          if (d[0] <= 0) continue;
          let E = konec(L, d);
          if (s.stinitko) { E = V.add(L, V.mul(d, (xsP - L[0]) / d[0])); dopady.push(E[1]); }
          paprsek(hl, [T, L, E], k, { tenky: true, sipky: false, tok: false, opacity: s.svazek ? 0.5 : 0.3 });
          if (s.svazek && !v.skutecny && !v.nek) cara(g, [L, I], 'tenka carkovana c-paprsek', 'opacity:.3');
        }
        if (s.stinitko) {
          sv('rect', { x: xsP - 4, y: Y - 190, width: 8, height: 380, fill: 'var(--bg-control)', stroke: 'var(--border-strong)', 'stroke-width': k }, g);
          txt(g, xsP, Y - 196, 'stínítko', 't-maly t-stred');
          if (dopady.length) {
            const a = omez(Math.min(...dopady), Y - 190, Y + 190), b = omez(Math.max(...dopady), Y - 190, Y + 190);
            if (b - a < 3) sv('circle', { cx: xsP, cy: (a + b) / 2, r: 4.5 * k, class: 'svetlo-vypln' }, g);
            else cara(g, [[xsP, a], [xsP, b]], 'c-paprsek', `stroke-width:${(6 * k).toFixed(2)}px;opacity:.9`);
          }
        }
      }
      // tři význačné paprsky
      if (krok != null || s.paprsky) {
        for (const r of vyznacne(v, T)) {
          if (krok != null && r.c > krok) continue;
          paprsek(hl, [T, r.L, konec(r.L, r.d)], k, { tok: r.c === 1 });
          if (r.zpet) cara(g, [r.L, r.zpet], 'tenka carkovana c-paprsek');
          if (r.odF) cara(g, [r.odF, T], 'tenka carkovana c-paprsek');
          if (r.doF) cara(g, [r.L, r.doF], 'tenka carkovana c-paprsek');
          if (I && !v.skutecny && (krok == null || krok >= 4)) {
            if (r.c !== 2) cara(g, [r.L, I], 'tenka carkovana c-paprsek', 'opacity:.85');
            else if (V.len(V.sub(I, r.L)) > V.len(V.sub(T, r.L))) cara(g, [T, I], 'tenka carkovana c-paprsek', 'opacity:.85');
          }
          if (krok != null) cislo(g, V.add(r.L, V.mul(r.d, 95)), r.c, k);
        }
      }
      svicka(g, T[0], Y, s.y * S, 'predmet', k);
      txt(g, T[0], Y + 20 * k, 'předmět', 't-maly t-stred t-predmet');
      if (I && Math.abs(v.ap) < 80 && (krok == null || krok >= 4)) {
        svicka(g, I[0], Y, v.yp * S, v.skutecny ? 'skutecny' : 'zdanlivy', k);
        txt(g, I[0], v.yp < 0 ? I[1] + 20 * k : I[1] - 12 * k, v.skutecny ? 'obraz' : 'obraz (zdánlivý)', 't-maly t-stred t-obraz');
      }
      // odečty, rovnice, tabulka, náhled, krokování
      m.odecet([
        ['a =', cisK(s.a) + ' cm'],
        ['a′ =', v.nek ? '∞' : cisK(v.ap) + ' cm'],
        ['f =', `${cisK(v.f)} cm (φ = ${sePlus(100 / v.f, 1)} D)`],
        ['Z =', v.nek ? '–' : cis(v.Z, 2)],
        ['Obraz:', vlastnosti(v)],
      ]);
      const zl = (c, j) => `<span class="zl"><span>${c}</span><span>${j}</span></span>`;
      const zn = x => x < 0 ? `(${cisK(x)})` : cisK(x);
      const h = `Podle modelu: <span class="m">${zl(1, zn(s.a))} + ${zl(1, v.nek ? '∞' : zn(Math.round(v.ap * 10) / 10))} = ${zl(1, zn(v.f))}</span> <span class="vzorec-popis">(délky v centimetrech${v.nek ? '' : `; Z = −a′/a = ${cis(v.Z, 2)}`})</span>`;
      if (rovnice.innerHTML !== h) rovnice.innerHTML = h;
      const p = pripad();
      radky.forEach(tr => tr.classList.toggle('aktivni', tr.dataset.pripad === p));
      kresliNahled(v);
      if (krok != null) {
        const c = krok === 0 ? 'Začátek' : krok <= 3 ? `Krok ${krok} ze 3` : 'Výsledek';
        if (kCislo.textContent !== c) kCislo.textContent = c;
        const t = textKroku(v);
        if (kText.innerHTML !== t) kText.innerHTML = t;
        $('#zob-krok-zpet').disabled = krok === 0;
        $('#zob-krok-dal').textContent = krok >= 4 ? 'Hotovo ✓' : 'Další krok →';
      }
      m.zpravu(v.nek ? 'Svíčka stojí přímo v ohnisku: paprsky z plamene jdou za čočkou rovnoběžně a obraz nevznikne.'
        : ostre(v) ? '<span class="ok">Na stínítku je ostrý obraz!</span>'
        : s.typ === 'rozptylka' && s.stinitko ? 'Rozptylka paprsky rozptyluje – za ní se nikde neprotnou, a tak skutečný obraz nevznikne.'
        : '');
    };
    m.uchop({
      popis: 'Plamen svíčky – do stran mění vzdálenost od čočky, nahoru a dolů výšku',
      poloha: () => [X(-s.a), Y - s.y * S - 17 * m.k],
      tahni: p => {
        let a = omez((X0 - p[0]) / S, 3, 50);
        for (const c of [s.f, 2 * s.f]) if (Math.abs(a - c) < 0.4) a = c;
        s.a = Math.round(a * 10) / 10;
        s.y = omez(Math.round((Y - p[1] - 17 * m.k) / S * 2) / 2, 2, 12);
      },
      klavesa: (dx, dy) => {
        if (dx) s.a = omez(Math.round((s.a - dx * 0.5) * 10) / 10, 3, 50);
        if (dy) s.y = omez(s.y - dy * 0.5, 2, 12);
      },
      hodnota: () => `předmět ${cisK(s.a)} cm před čočkou, vysoký ${cisK(s.y)} cm`,
    });
    m.uchop({
      popis: 'Ohnisko F′ – mění ohniskovou vzdálenost',
      poloha: () => [X(s.typ === 'spojka' ? s.f : -s.f), Y],
      tahni: p => { s.f = omez(Math.round(Math.abs(p[0] - X0) / S * 2) / 2, 4, 20); },
      klavesa: dx => { s.f = omez(s.f + dx * 0.5 * (s.typ === 'spojka' ? 1 : -1), 4, 20); },
      hodnota: () => `ohnisková vzdálenost ${cisK(s.f)} cm`,
    });
    m.uchop({
      popis: 'Stínítko',
      poloha: () => s.stinitko ? [X(s.xs), Y + 172] : null,
      tahni: p => {
        let x = omez((p[0] - X0) / S, 2, 43);
        const v = vypocet();
        if (v.skutecny && Math.abs(x - v.ap) < 0.25) x = v.ap;
        s.xs = Math.round(x * 1000) / 1000;
      },
      klavesa: dx => { s.xs = omez(Math.round((s.xs + dx * 0.2) * 100) / 100, 2, 43); },
      hodnota: () => `stínítko ${cisK(s.xs)} cm za čočkou`,
    });

    const segTyp = segment($('#zob-typ'), s.typ, v => { s.typ = v; m.naplanuj(); });
    const chkP = prepinac('zob-paprsky', v => { s.paprsky = v; m.naplanuj(); });
    const chkS = prepinac('zob-svazek', v => { s.svazek = v; m.naplanuj(); });
    const chkT = prepinac('zob-stinitko', v => { s.stinitko = v; m.naplanuj(); });
    const zavriKroky = () => { s.krok = null; kPanel.hidden = true; };
    function nastav(p) {
      Object.assign(s, p);
      segTyp(s.typ);
      chkP.checked = s.paprsky; chkS.checked = s.svazek; chkT.checked = s.stinitko;
      zavriKroky();
      m.naplanuj();
    }
    const rolovat = () => m.fig.scrollIntoView({ behavior: bezPohybu() ? 'auto' : 'smooth', block: 'start' });
    $$('[data-zob-preset]').forEach(b => b.addEventListener('click', () => {
      nastav(PRESETY[b.dataset.zobPreset]);
      if (b.hasAttribute('data-rolovat')) rolovat();
    }));
    $('#zob-priklad-model').addEventListener('click', () => { nastav({ typ: 'spojka', f: 10, a: 15, y: 4, paprsky: true }); rolovat(); });
    $('#zob-krokuj').addEventListener('click', () => { s.krok = 0; kPanel.hidden = false; m.naplanuj(); $('#zob-krok-dal').focus({ preventScroll: true }); });
    $('#zob-krok-zpet').addEventListener('click', () => { s.krok = Math.max(0, s.krok - 1); m.naplanuj(); });
    $('#zob-krok-dal').addEventListener('click', () => { if (s.krok >= 4) zavriKroky(); else s.krok++; m.naplanuj(); });
    $('#zob-krok-konec').addEventListener('click', () => { zavriKroky(); m.naplanuj(); });
    MODELY.zobrazeni.nastav = nastav;

    predpoved('zob-30', {
      otazka: 'Svíčka stojí 30 cm před spojkou s ohniskovou vzdáleností 10 cm. Jaký obraz zachytíš na stínítku? (Model se po tvém tipu nastaví.)',
      moznosti: ['Menší a převrácený.', 'Větší a převrácený.', 'Stejně velký a vzpřímený.', 'Žádný – obraz nevznikne.'],
      spravna: 0,
      priTipu: () => nastav({ typ: 'spojka', f: 10, a: 30, y: 6 }),
      vyzkousej: 'Zapni stínítko a posouvej ho (za kroužek dole), dokud obraz plamene nebude ostrý.',
      splneno: () => s.v && ostre(s.v) && s.typ === 'spojka' && Math.abs(s.a - 30) < 0.05 && s.f === 10,
      vysvetleni: 'Svíčka je dál než 2f (20 cm), a tak je obraz skutečný, převrácený a zmenšený. Ostrý je 15 cm za čočkou: 1/30 + 1/15 = 1/10. Zvětšení Z = −15/30 = −0,5 – obraz je poloviční a hlavou dolů. Takhle funguje fotoaparát.',
      proc: { 1: 'Zvětšený skutečný obraz dá spojka, jen když je předmět mezi f a 2f.', 2: 'Vzpřímený obraz spojky je vždy zdánlivý – na stínítko ho nezachytíš.', 3: 'Obraz nevznikne jen pro a = f, kdy jdou paprsky za čočkou rovnoběžně.' },
    });
    Ukoly.definuj('zob-11', () => s.typ === 'spojka' && Math.abs(s.a - 2 * s.f) < 0.01,
      'Pro <b>a = 2f</b> je obraz skutečný, převrácený a <b>stejně velký</b>; leží také ve vzdálenosti 2f za čočkou.');
    Ukoly.definuj('zob-lupa', () => s.typ === 'spojka' && s.a < s.f - 0.01,
      'Předmět je blíž než ohnisko: paprsky se za čočkou rozbíhají a oko za čočkou vidí <b>zvětšený, vzpřímený, zdánlivý</b> obraz. To je lupa.');
    Ukoly.definuj('zob-rozptylka', () => s.typ === 'rozptylka' && s.stinitko,
      'Nejde to. Rozptylka paprsky vždy rozptýlí, takže se za ní nikde nesejdou. Její obraz je vždy <b>zdánlivý</b> – na stínítku zůstane jen rozmazaná skvrna.');
  }

  /* ---------- 9 · Oko a brýle ---------- */
  /* Zjednodušené (redukované) oko: jedna lámavá soustava, uvnitř oka index lomu 1,336.
     Oko má u všech typů stejnou délku; ostrý obraz na sítnici dá mohutnost PV. Vady jsou
     vady lomivosti: krátkozraké oko láme i uvolněné příliš (P0 > PV), dalekozraké málo
     (P0 < PV). Akomodace přidá až A dioptrií.
     Skutečné oko má PV ≈ 60 D; v kresbě počítáme s PV = 20 D, aby byl posun ohniska vadou
     a brýlemi vidět (u 60 D je to desetina milimetru). Dioptrie, blízký a daleký bod
     i potřebné brýle závisí jen na rozdílech mohutností, takže zůstávají skutečné. */
  const PV = 20;
  const OCI = {
    zdrave: { P0: 20, A: 4, nazev: 'zdravé' },
    kratkozrake: { P0: 23, A: 4, nazev: 'krátkozraké (láme o 3 D víc)' },
    dalekozrake: { P0: 17, A: 4, nazev: 'dalekozraké (láme o 3 D méně)' },
    stari: { P0: 20, A: 1, nazev: 've stáří (čočka ztuhla, akomodace jen 1 D)' },
  };
  function vzdalenostText(a) {
    if (a === Infinity || a > 9999) return '∞';
    return Math.round(a) < 100 ? Math.round(a) + ' cm' : cisK(a / 100, a < 1000 ? 1 : 0) + ' m';
  }
  function modelOko() {
    const m = new Model('obr-oko', 1000, 440);
    const s = { typ: 'zdrave', a: Infinity, G: 0, dD: 0, Pe: PV, ostre: true, bryleY: 0 };
    MODELY.oko = { m, s };
    const XE = 560, Y = 220, S = 50, NE = 1.336, D = 1.4, DK = 5, RP = 0.68;   // DK: kde jsou brýle nakreslené
    const X = cm => XE + cm * S, Yp = cm => Y - cm * S;
    const L = 100 * NE / PV;   // délka oka v cm – stejná pro všechny typy
    /* Vergence světla od předmětu ve vzdálenosti a (cm od oka), jak dorazí k oku přes brýle G. */
    function vergence(a, G) {
      if (G === 0) return a === Infinity ? 0 : -100 / a;
      const V0 = a === Infinity ? 0 : -100 / (a - D), V1 = V0 + G;
      return V1 / (1 - D / 100 * V1);
    }
    /* Kolik oko zaostří: snaží se o ostrý obraz, ale akomoduje jen tolik, kolik odpovídá
       vzdálenosti předmětu (dalekozraké oko navíc vyrovnává svou vadu), a nejvýš A.
       Proto příliš silná rozptylka obraz znovu rozmaže – oko se kvůli brýlím do dálky
       „nenamáhá“ – a stejně tak příliš slabá nebo příliš silná spojka na čtení. */
    function vypocet(a = s.a, G = s.G) {
      const o = OCI[s.typ], V2 = vergence(a, G);
      const narok = (a === Infinity ? 0 : 100 / a) + Math.max(0, PV - o.P0);
      const Pe = omez(PV - V2, o.P0, o.P0 + Math.min(o.A, narok));
      const V3 = V2 + Pe, dD = V3 - PV;
      return { o, L, V2, Pe, V3, dD, b: V3 > 0 ? 100 * NE / V3 : Infinity, ostre: Math.abs(dD) < 0.2 };
    }
    /* Rozsah ostrého vidění se spočítá tímtéž modelem (projde vzdálenosti 8 cm – 100 m a ∞). */
    function rozsahOstrosti() {
      const ostre = a => Math.abs(vypocet(a).dD) < 1e-3;
      const mez = (venku, uvnitr) => { for (let i = 0; i < 40; i++) { const c = Math.sqrt(venku * uvnitr); if (ostre(c)) uvnitr = c; else venku = c; } return uvnitr; };
      const N = 400, bod = i => 8 * Math.pow(10, 4.1 * i / N);
      let od = null, po = null;
      for (let i = 0; i <= N; i++) {
        if (!ostre(bod(i))) continue;
        if (od === null) od = i ? mez(bod(i - 1), bod(i)) : bod(i);
        po = i < N && !ostre(bod(i + 1)) ? mez(bod(i + 1), bod(i)) : bod(i);
        if (i < N && !ostre(bod(i + 1))) break;
      }
      if (ostre(Infinity) && (od === null || po >= bod(N))) { po = Infinity; if (od === null) od = Infinity; }
      return { od, po };
    }
    function paprsky(v) {
      const vysl = [], xl = -XE / S;
      for (const h of [1, 0.5, -0.5, -1]) {
        const ye = RP * h;
        let u, yg;
        if (s.a === Infinity) { u = 0; yg = ye / (1 - DK * s.G / 100); }
        else { u = ye / (s.a - (s.a - DK) * DK * s.G / 100); yg = u * (s.a - DK); }
        const body = s.G === 0 ? [[xl, ye + u * xl]] : [[xl, yg + u * (xl + DK)], [-DK, yg]];
        body.push([0, ye]);
        // v oku se paprsky sbíhají do ohniska b spočítaného z vergencí (se skutečnou vzdáleností brýlí)
        const naSitnici = isFinite(v.b) ? ye * (1 - v.L / v.b) : ye;
        body.push([v.L, naSitnici]);
        const za = v.b > v.L && X(v.b) < 995 ? [[v.L, naSitnici], [v.b, 0]] : null;
        vysl.push({ h, body: body.map(([x, y]) => [X(x), Yp(y)]), za: za && za.map(([x, y]) => [X(x), Yp(y)]) });
      }
      return vysl;
    }
    const nsvg = $('#oko-nahled svg'), ntext = $('#oko-nahled-text');
    const filtr = sv('filter', { id: 'okoRozmaz', x: '-20%', y: '-20%', width: '140%', height: '140%' }, sv('defs', null, nsvg));
    const rozmaz = sv('feGaussianBlur', { stdDeviation: 0 }, filtr);
    sv('rect', { x: 0, y: 0, width: 240, height: 150, fill: '#f6f3ea' }, nsvg);
    const tabule = sv('g', { filter: 'url(#okoRozmaz)', fill: '#15181d', 'font-family': 'Arial, Helvetica, sans-serif', 'font-weight': 700, 'text-anchor': 'middle' }, nsvg);
    const optotypy = sv('g', null, tabule), kniha = sv('g', { 'font-family': 'Georgia, serif', 'font-weight': 400, 'text-anchor': 'start' }, tabule);
    [['E', 46, 56], ['F  P', 28, 94], ['T  O  Z', 18, 121], ['L  P  E  D', 12, 141]].forEach(([t, v, y]) => txt(optotypy, 120, y, t, '', { 'font-size': v }));
    ['Byl jednou jeden král', 'a ten měl tři syny.', 'Nejmladší se jmenoval', 'Honza a rád četl', 'knihy o světle.'].forEach((t, i) => txt(kniha, 22, 34 + i * 25, t, '', { 'font-size': 17 }));

    m.kresli = g => {
      const k = m.k, v = vypocet();
      Object.assign(s, { dD: v.dD, Pe: v.Pe, ostre: v.ostre });
      const P0 = v.o.P0;
      const xr = X(v.L), xc0 = XE - 58, cx = (xc0 + xr) / 2, rx = (xr - xc0) / 2, ry = 170;
      sv('ellipse', { cx, cy: Y, rx, ry, class: 'bulva' }, g);
      const sit = [];
      for (let u = -52; u <= 52; u += 4) sit.push([cx + rx * Math.cos(u * RAD), Y + ry * Math.sin(u * RAD)]);
      cara(g, sit, 'silna', '--c:#d8646a');
      sv('path', { d: `M${r1(xr - 14)} ${Y + 50} L${r1(xr + 30)} ${Y + 64} L${r1(xr + 30)} ${Y + 86} L${r1(xr - 20)} ${Y + 76}Z`, fill: 'var(--bg-control)', stroke: 'var(--text-faint)', 'stroke-width': k }, g);
      sv('circle', { cx: xr - 2 * k, cy: Y, r: 5 * k, fill: '#e8c46a' }, g);
      sv('path', { d: `M${r1(xc0 + 18)} ${Y - 112} Q${r1(xc0 - 26)} ${Y} ${r1(xc0 + 18)} ${Y + 112}`, class: 'sklo' }, g);
      for (const z of [-1, 1]) cara(g, [[XE - 8, Y + z * (RP * S + 3)], [XE - 8, Y + z * 96]], '', '--c:#5a8fc9;stroke-width:7px');
      // tloušťka čočky podle celkové mohutnosti oka (krátkozraké láme víc, akomodace ji vyklene)
      sv('ellipse', { cx: XE + 12, cy: Y, rx: omez(8 + (v.Pe - 16) * 2.4, 6, 40), ry: 62, class: 'sklo' }, g);
      txt(g, xc0 - 6, Y - 124, 'rohovka', 't-maly t-konec');
      txt(g, XE + 12, Y - 76, 'čočka', 't-maly t-stred');
      txt(g, xr - 14, Y - ry * 0.84, 'sítnice', 't-maly t-konec');
      if (s.G !== 0 || s.bryleY || s.cilG) {
        const xg = X(-DK), t = 3 + Math.abs(s.G || s.cilG || 0) * 2.4;
        const g0 = sv('g', { transform: `translate(0 ${r1(s.bryleY)})` }, g);
        const Gz = s.G || s.cilG || 0;
        const d = Gz > 0
          ? `M${xg - 2} ${Y - 78} Q${xg - 2 - 2 * t} ${Y} ${xg - 2} ${Y + 78} L${xg + 2} ${Y + 78} Q${xg + 2 + 2 * t} ${Y} ${xg + 2} ${Y - 78}Z`
          : `M${xg - 2 - t} ${Y - 78} Q${xg - 2} ${Y} ${xg - 2 - t} ${Y + 78} L${xg + 2 + t} ${Y + 78} Q${xg + 2} ${Y} ${xg + 2 + t} ${Y - 78}Z`;
        sv('path', { d, class: 'sklo' }, g0);
        cara(g0, [[xg, Y - 80], [xg + 6, Y - 90], [xc0 + 6, Y - 100]], 'tenka c-text');
        txt(g0, xg, Y + 104, `brýle ${sePlus(Gz, 2)} D`, 't-maly t-stred');
      }
      const hl = sv('g', { class: 'zare' }, g);
      for (const p of paprsky(v)) {
        paprsek(hl, p.body, k, { tenky: Math.abs(p.h) < 1, tok: p.h === 1 });
        if (p.za) cara(g, p.za, 'tenka carkovana c-paprsek', 'opacity:.6');
      }
      if (s.G !== 0) {
        const v0 = vypocet(s.a, 0);
        if (isFinite(v0.b) && X(v0.b) < 995 && Math.abs(X(v0.b) - X(v.b)) > 5 * k) {
          sv('circle', { cx: X(v0.b), cy: Y, r: 5 * k, fill: 'none', stroke: 'var(--o-obraz)', 'stroke-width': 1.5 * k, 'stroke-dasharray': `${2 * k} ${2 * k}` }, g);
          txt(g, X(v0.b), Y - 14 * k, 'bez brýlí', 't-maly t-stred t-obraz');
          if (isFinite(v.b)) {
            const a0 = X(v0.b) + Math.sign(v.b - v0.b) * 7 * k, a1 = X(v.b) - Math.sign(v.b - v0.b) * 7 * k;
            if (Math.abs(a1 - a0) > 8 * k) {
              cara(g, [[a0, Y + 34 * k], [a1, Y + 34 * k]], 'tenka c-obraz');
              hrot(g, [a1, Y + 34 * k], [Math.sign(a1 - a0), 0], k, 0.8, 'c-obraz');
            }
          }
        }
      }
      if (isFinite(v.b) && X(v.b) < 995) {
        sv('circle', { cx: X(v.b), cy: Y, r: 4 * k, class: 'vypln c-obraz' }, g);
        txt(g, X(v.b), Y + 20 * k, s.G !== 0 ? 'obraz s brýlemi' : 'obraz', 't-maly t-stred t-obraz');
      }
      txt(g, 14, 26, '← předmět: ' + (s.a === Infinity ? 'velmi daleko (∞)' : vzdalenostText(s.a) + ' před okem'), 't-silny');
      const kde = v.ostre ? 'na sítnici ✓' : v.dD > 0 ? 'před sítnicí' : 'za sítnicí';
      const r = rozsahOstrosti();
      const rozsah = r.od === null ? 'nikde' : `od ${vzdalenostText(r.od)} do ${vzdalenostText(r.po)}`;
      m.odecet([
        ['Oko:', v.o.nazev],
        ['Akomodace', `${cis(v.Pe - P0, 1)} D z ${v.o.A} D`],
        ['Obraz vzniká', kde],
        ['S těmito brýlemi ostře vidí', rozsah],
      ]);
      const naplno = v.Pe >= P0 + v.o.A - 0.01;
      m.zpravu(s.bryleText && s.G !== 0 && v.ostre ? '<span class="ok">Oko vidí ostře.</span> ' + s.bryleText
        : v.ostre
        ? '<span class="ok">Oko vidí ostře.</span>' + (v.Pe > P0 + 0.05 ? ` Oční čočka se kvůli tomu vyklenula (akomodace ${cis(v.Pe - P0, 1)} D).` : ' Oční čočka je uvolněná.')
        : v.dD > 0
          ? 'Obraz vzniká <b>před sítnicí</b> – paprsky se lámou moc, i když je oční čočka uvolněná. '
            + (s.G > 0 ? 'Spojka v brýlích je <b>příliš silná</b>.' : s.G < 0 ? 'Rozptylka v brýlích je <b>příliš slabá</b>.' : 'Pomohla by <b>rozptylka</b> (záporné dioptrie).')
          : 'Obraz vzniká <b>za sítnicí</b> – paprsky se lámou málo' + (naplno ? ', i když se čočka vyklenula, co to jde. ' : '. ')
            + (s.G < 0 ? 'Rozptylka v brýlích je <b>příliš silná</b>.' : s.G > 0 ? 'Spojka v brýlích je <b>příliš slabá</b>.' : 'Pomohla by <b>spojka</b> (kladné dioptrie).'));
      rozmaz.setAttribute('stdDeviation', Math.min(14, Math.abs(v.dD) * 4.4).toFixed(2));
      const blizko = s.a < 100;
      optotypy.style.display = blizko ? 'none' : '';
      kniha.style.display = blizko ? '' : 'none';
      obnovTlacitko();
      ntext.textContent = v.ostre ? 'Ostře' : `Rozmazaně – zaostření chybí ${cis(Math.abs(v.dD), 1)} D`;
    };
    const zPosuvniku = v => v >= 995 ? Infinity : 10 * Math.pow(10, 3 * v / 1000);
    const naPosuvnik = a => a === Infinity ? 1000 : Math.round(1000 * Math.log10(a / 10) / 3);
    const nasadit = $('#oko-nasadit');
    const vzd = posuvnik('oko-vzdalenost', v => vzdalenostText(zPosuvniku(v)), v => { s.a = zPosuvniku(v); obnovTlacitko(); m.naplanuj(); });
    const textBryli = v => v === 0 ? 'bez brýlí' : `${sePlus(v, 2)} D (${v > 0 ? 'spojka' : 'rozptylka'})`;
    const bryle = posuvnik('oko-bryle', textBryli, v => { zastav(); s.G = v; obnovTlacitko(); m.naplanuj(); });
    let anim = null;
    /* Stav tlačítka se obnovuje hned při každé změně, ne až při překreslení – jinak by
       stisk hned po přepnutí oka narazil na starý (neaktivní) stav. */
    function obnovTlacitko() {
      const potreba = s.G === 0 && !anim ? spravneBryle() : 0;
      nasadit.textContent = s.G !== 0 || anim ? '✖ Sundat brýle' : potreba ? `👓 Nasadit brýle ${sePlus(potreba, 2)} D` : '👓 Brýle tu nejsou potřeba';
      nasadit.disabled = !anim && s.G === 0 && !potreba;
      nasadit.title = nasadit.disabled ? (s.typ === 'zdrave' ? 'Zdravé oko vidí ostře od 25 cm do dálky.' : 'Na tuto vzdálenost oko vidí ostře i bez brýlí.') : '';
    }
    function zastav() { if (anim) cancelAnimationFrame(anim); anim = null; s.bryleY = 0; s.cilG = 0; s.bryleText = ''; }
    segment($('#oko-typ'), s.typ, v => {
      s.typ = v;
      zastav();
      bryle.nastav(0);
      // každé oko ukážeme v situaci, kde se jeho vada projeví
      if (v === 'kratkozrake') vzd.nastav(1000);
      else if (v === 'dalekozrake' || v === 'stari') vzd.nastav(naPosuvnik(25));
      obnovTlacitko();
      m.naplanuj();
    });
    $$('[data-oko-vzdalenost]').forEach(b => b.addEventListener('click', () => vzd.nastav(b.dataset.okoVzdalenost === 'inf' ? 1000 : naPosuvnik(25))));
    /* Správné brýle pro dané oko: krátkozraké a dalekozraké na dálku (plná korekce vady),
       oko ve stáří na aktuální vzdálenost čtení (akomodace se využije jen napůl). */
    function spravneBryle() {
      const o = OCI[s.typ];
      if (s.typ === 'zdrave' || (s.G === 0 && vypocet(s.a, 0).ostre && s.typ !== 'dalekozrake')) return 0;
      const naBlizko = s.a !== Infinity && s.a <= 300;
      if (naBlizko && s.typ !== 'kratkozrake') {
        // brýle na čtení: oko pak zaostří s rezervou (nemusí akomodovat naplno)
        const V2 = PV - o.P0 - Math.max(o.A / 2, o.A - 0.5), V1 = V2 / (1 + D / 100 * V2), V0 = -100 / (s.a - D);
        return Math.round((V1 - V0) * 4) / 4;
      }
      if (s.typ === 'stari') return 0;
      // na dálku: plná korekce vady (uvolněné oko vidí ostře do nekonečna)
      const V2 = PV - o.P0, V1 = V2 / (1 + D / 100 * V2);
      return Math.round(V1 * 4) / 4;
    }
    nasadit.addEventListener('click', () => {
      zastav();
      const puvodni = s.G;
      const cil = puvodni !== 0 ? 0 : spravneBryle();
      if (puvodni === 0 && cil === 0) return;
      const rychle = bezPohybu(), t0 = performance.now(), DOJEZD = 550, NARUST = 1100;
      s.cilG = puvodni || cil;
      anim = -1;          // animace běží (skutečné id doplní requestAnimationFrame)
      obnovTlacitko();
      const krok = t => {
        const dt = rychle ? 1e9 : t - t0;
        if (cil !== 0) {        // nasazení: brýle sjedou shora, pak jejich síla plynule naroste
          const a = omez(dt / DOJEZD, 0, 1), b = omez((dt - DOJEZD) / NARUST, 0, 1);
          s.bryleY = -300 * Math.pow(1 - a, 2);
          s.G = a < 1 ? 0 : cil * (1 - Math.pow(1 - b, 3));
          if (a < 1) s.G = 0;
        } else {                // sundání: síla zmizí, brýle odjedou nahoru
          const b = omez(dt / 700, 0, 1), a = omez((dt - 700) / DOJEZD, 0, 1);
          s.G = puvodni * (1 - b);
          s.bryleY = -300 * a * a;
        }
        if (s.G === 0 && s.bryleY === 0 && cil === 0) s.cilG = 0;
        $('#oko-bryle-h').textContent = textBryli(Math.round(s.G * 100) / 100);
        m.vykresli();
        const hotovo = cil !== 0 ? dt >= DOJEZD + NARUST : dt >= 700 + DOJEZD;
        if (!hotovo) { anim = requestAnimationFrame(krok); return; }
        anim = null; s.bryleY = 0; s.cilG = 0;
        bryle.nastav(cil);
        obnovTlacitko();
        if (cil !== 0) s.bryleText = `👓 Brýle ${textBryli(cil)}${cil > 0 && s.a !== Infinity && s.a <= 300 ? ' na čtení' : ''} posunuly obraz na sítnici. ` + (cil < 0
          ? 'Rozptylka paprsky před okem trochu rozbíhá, takže se sejdou až na sítnici.'
          : 'Spojka pomůže oku paprsky soustředit dřív, takže se sejdou na sítnici.');
        m.naplanuj();
      };
      anim = requestAnimationFrame(krok);
    });
    predpoved('oko-bryle', {
      otazka: 'Krátkozraké oko vidí do dálky rozmazaně – obraz vzniká před sítnicí. Jakou čočku potřebuje do brýlí?',
      moznosti: ['Rozptylku – paprsky trochu rozbíhá, a obraz se posune dozadu na sítnici.', 'Spojku – paprsky víc soustředí.', 'Žádnou – stačí víc zaostřit (akomodovat).'],
      spravna: 0,
      vyzkousej: 'Vyber krátkozraké oko (předmět se sám dá do dálky) a posuvníkem Brýle najdi dioptrie, se kterými oko vidí ostře – nebo brýle nasaď tlačítkem a sleduj, co udělají.',
      splneno: () => s.typ === 'kratkozrake' && s.a === Infinity && s.ostre && s.G < 0,
      vysvetleni: 'Krátkozraké oko je pro vzdálené předměty příliš „silné“ – paprsky se sbíhají moc brzy. Rozptylka je před okem trochu rozbíhá, takže se sejdou až na sítnici. Tomuto oku stačí asi −3 D. Víc akomodovat nepomůže: akomodace oko ještě zesiluje a obraz by se posunul ještě víc dopředu.',
      proc: { 1: 'Spojka by paprsky soustředila ještě dřív – obraz by se posunul dál před sítnici.', 2: 'Akomodací se oční čočka vyklene a láme víc – krátkozrakému oku to při pohledu do dálky jen uškodí.' },
    });
    Ukoly.definuj('oko-daleko', () => s.typ === 'dalekozrake' && Math.abs(s.a - 25) < 1.5 && s.ostre && s.G > 0,
      'Dalekozrakému oku pomůže <b>spojka</b> – tady stačí asi +3,25 D a zbytek dorovná akomodace. Brýle na čtení jsou vždy spojky.');
  }

  /* ================================================================
     7. Procvičování
     ================================================================ */
  /* Každý generátor vrací { zadani, obrazek?, moznosti: [{ t, ok?, proc? }], napoveda, vysvetleni }.
     Právě jedna možnost je správná, u chybných je zdůvodnění. Duplicitní texty se vyřadí. */
  const LAT = [['vzduchu', 'vzduch', 1.00], ['vody', 'voda', 1.33], ['skla', 'sklo', 1.50], ['diamantu', 'diamant', 2.42]];
  const velke = t => t.charAt(0).toUpperCase() + t.slice(1);
  const st = x => cisK(x, 1) + '°';

  /* Malý obrázek k otázce: čočka, ohniska, svíčka (třídy jako v modelech). */
  function svgCocka({ typ, f, a, paprsky }) {
    const W = 600, H = 220, X0 = 380, Y = 124, M = 8;
    const p = [`<svg viewBox="0 0 ${W} ${H}" class="model" role="img" aria-label="Náčrt: čočka, ohniska a svíčka">`];
    p.push(`<path class="cara tenka carkovana c-osa" d="M0 ${Y}H${W}"/>`);
    if (typ === 'spojka') p.push(`<ellipse cx="${X0}" cy="${Y}" rx="8" ry="92" class="sklo"/>`);
    else p.push(`<path d="M${X0 - 10} ${Y - 92} Q${X0 - 1} ${Y} ${X0 - 10} ${Y + 92} L${X0 + 10} ${Y + 92} Q${X0 + 1} ${Y} ${X0 + 10} ${Y - 92}Z" class="sklo"/>`);
    const bod = (x, jm, maly) => `<circle cx="${x}" cy="${Y}" r="4" class="vypln c-ohnisko"/><text x="${x}" y="${Y + 20}" class="${maly ? 't-maly' : 't-ohnisko'} t-stred">${jm}</text>`;
    if (f) {
      const fo = typ === 'spojka' ? ['F', 'F′'] : ['F′', 'F'];
      p.push(bod(X0 - f * M, fo[0]), bod(X0 + f * M, fo[1]));
      if (typ === 'spojka' && X0 - 2 * f * M > 10) p.push(bod(X0 - 2 * f * M, '2F', true), bod(X0 + 2 * f * M, '2F′', true));
    }
    if (a) {
      const x = X0 - a * M, h = 52;
      p.push(`<rect x="${x - 6}" y="${Y - h * 0.7}" width="12" height="${h * 0.7}" class="vypln c-predmet"/>`);
      p.push(`<path d="M${x} ${Y - h} C${x + 6} ${Y - h * 0.84} ${x + 5} ${Y - h * 0.71} ${x} ${Y - h * 0.71} C${x - 5} ${Y - h * 0.71} ${x - 6} ${Y - h * 0.84} ${x} ${Y - h}Z" fill="#ffab2e"/>`);
      p.push(`<text x="${x}" y="${Y + 20}" class="t-maly t-stred t-predmet">${cisK(a)} cm</text>`);
    }
    if (paprsky) p.push(paprsky);
    p.push('</svg>');
    return p.join('');
  }

  const GENERATORY = [
    { id: 'zdroje', tema: 'svetlo', nazev: 'Zdroje světla', gen() {
      const v = vyber([0, 1, 2]);
      if (v === 0) {
        const ok = vyber(['Slunce', 'plamen svíčky', 'rozsvícený displej telefonu', 'blesk']);
        const spatne = zamichej(['Měsíc', 'bílý papír', 'zrcadlo', 'jablko na stole']).slice(0, 3);
        return { zadani: 'Které z těles je <b>primární</b> zdroj světla (světlo samo vyzařuje)?',
          moznosti: [{ t: velke(ok), ok: true }, ...spatne.map(t => ({ t: velke(t), proc: `${velke(t)} samo nesvítí – jen odráží světlo, které na ně dopadá.` }))],
          napoveda: 'Primární zdroj světlo sám vyrábí. Ostatní tělesa vidíme jen proto, že odrážejí cizí světlo.',
          vysvetleni: `${velke(ok)} světlo samo vyzařuje. Měsíc, papír nebo zrcadlo jen odrážejí světlo z jiného zdroje.` };
      }
      if (v === 1) {
        const [co, druh] = vyber([['mléčné sklo', 'průsvitné'], ['pečicí papír', 'průsvitné'], ['čiré sklo', 'průhledné'], ['voda v akváriu', 'průhledné'], ['dřevěná deska', 'neprůhledné'], ['hliníková fólie', 'neprůhledné']]);
        const proc = { 'průhledné': 'Průhledné prostředí světlo propustí skoro beze změny – viděli bychom přes ně ostře.', 'průsvitné': 'Průsvitné prostředí světlo propustí, ale rozptýlí – ostře přes ně nevidíme.', 'neprůhledné': 'Neprůhledné prostředí světlo nepropustí vůbec.' };
        return { zadani: `Jaké optické prostředí je <b>${co}</b>?`,
          moznosti: ['průhledné', 'průsvitné', 'neprůhledné'].map(t => ({ t: velke(t), ok: t === druh, proc: proc[t] })),
          napoveda: 'Průhledné = vidíme přes ně ostře, průsvitné = světlo projde, ale rozptýlí se, neprůhledné = světlo neprojde.',
          vysvetleni: `${velke(co)} je ${druh} prostředí. ${proc[druh]}` };
      }
      return { zadani: 'Slunce je od Země asi 150 milionů kilometrů. Jak dlouho k nám letí jeho světlo? (Rychlost světla je asi 300 000 km/s.)',
        moznosti: [{ t: 'Asi 8 minut.', ok: true }, { t: 'Asi 8 sekund.', proc: 'Za 8 sekund urazí světlo jen 2,4 milionu km.' }, { t: 'Asi 8 hodin.', proc: 'To je 60× víc – spočítej 150 000 000 : 300 000.' }, { t: 'Okamžitě, světlo nepotřebuje žádný čas.', proc: 'Světlo je velmi rychlé, ale jeho rychlost je konečná – asi 300 000 km/s.' }],
        napoveda: 't = s / v = 150 000 000 km : 300 000 km/s.',
        vysvetleni: '150 000 000 : 300 000 = 500 s, tedy asi 8 minut a 20 sekund.' };
    } },
    { id: 'stin', tema: 'svetlo', nazev: 'Stín', gen() {
      return vyber([
        { zadani: 'Kdy má stín předmětu nejostřejší okraje?',
          moznosti: [{ t: 'Když je zdroj světla malý (bodový).', ok: true }, { t: 'Když je zdroj světla velký, třeba zářivka.', proc: 'Velký zdroj vytvoří kolem plného stínu polostín – okraje jsou rozmazané.' }, { t: 'Když je předmět průhledný.', proc: 'Průhledný předmět stín skoro nevrhá.' }, { t: 'Nezáleží na tom, stín má vždy ostré okraje.', proc: 'Záleží na velikosti zdroje – vyzkoušej to na modelu stínu.' }],
          napoveda: 'Polostín vzniká tam, kam dopadá světlo jen z části zdroje.',
          vysvetleni: 'Z bodového zdroje do daného místa světlo buď dopadne, nebo ne. Proto je stín ostře ohraničený a polostín nevzniká.' },
        { zadani: 'Co je <b>polostín</b>?',
          moznosti: [{ t: 'Místo, kam dopadá světlo jen z části zdroje.', ok: true }, { t: 'Místo, kam nedopadá žádné světlo.', proc: 'To je plný stín.' }, { t: 'Stín průsvitného předmětu.', proc: 'Polostín vzniká i za neprůhledným předmětem, když je zdroj velký.' }, { t: 'Stín, který vrhá jen polovina předmětu.', proc: 'Polostín vrhá celý předmět – rozhoduje velikost zdroje.' }],
          napoveda: 'Představ si, že stojíš za překážkou a díváš se ke zdroji. Vidíš ho celý, část, nebo nic?',
          vysvetleni: 'V polostínu je zdroj zakrytý jen zčásti – dopadá sem jen část jeho světla, a proto je tu šero, ne tma.' },
        { zadani: '<b>Úplné</b> zatmění Slunce vidí člověk, který stojí…',
          moznosti: [{ t: 'v plném stínu Měsíce.', ok: true }, { t: 'v polostínu Měsíce.', proc: 'Z polostínu je vidět jen částečné zatmění – kousek Slunce zůstává odkrytý.' }, { t: 've stínu Země.', proc: 'Do stínu Země se dostává Měsíc při zatmění Měsíce.' }, { t: 'kdekoli na denní straně Země.', proc: 'Plný stín Měsíce na Zemi je jen pruh široký asi 100–200 km.' }],
          napoveda: 'Při zatmění Slunce vrhá stín Měsíc.',
          vysvetleni: 'Při zatmění Slunce stojí Měsíc mezi Sluncem a Zemí. Úplné zatmění je vidět jen z plného stínu Měsíce, z polostínu jen částečné.' },
      ]);
    } },
    { id: 'odraz', tema: 'odraz', nazev: 'Zákon odrazu', gen() {
      const a = vyber([15, 20, 25, 35, 40, 50, 55, 65, 70, 75]);
      if (Math.random() < 0.5) return {
        zadani: `Paprsek dopadá na rovinné zrcadlo pod úhlem dopadu ${a}° (měřeno od kolmice). Jaký je úhel odrazu?`,
        moznosti: [{ t: st(a), ok: true }, { t: st(90 - a), proc: 'To je úhel mezi odraženým paprskem a zrcadlem. Úhly se měří od kolmice.' }, { t: st(2 * a), proc: 'To je úhel mezi dopadajícím a odraženým paprskem dohromady.' }, { t: st(180 - 2 * a), proc: 'Úhel odrazu se měří od kolmice a je stejný jako úhel dopadu.' }],
        napoveda: 'Zákon odrazu: α′ = α. Oba úhly se měří od kolmice dopadu.',
        vysvetleni: `Úhel odrazu se rovná úhlu dopadu: α′ = α = ${a}°.` };
      const b = 90 - a;
      return {
        zadani: `Paprsek svírá s <b>povrchem</b> zrcadla úhel ${b}°. Jaký je úhel odrazu (měřený od kolmice)?`,
        moznosti: [{ t: st(a), ok: true }, { t: st(b), proc: 'Úhel od povrchu zrcadla není úhel odrazu – ten se měří od kolmice.' }, { t: st(2 * b), proc: 'Úhly se měří od kolmice: 90° − úhel od zrcadla.' }, { t: st(180 - 2 * b), proc: 'To je úhel mezi dopadajícím a odraženým paprskem.' }],
        napoveda: 'Kolmice svírá se zrcadlem 90°. Úhel od kolmice = 90° − úhel od zrcadla.',
        vysvetleni: `Úhel dopadu od kolmice je 90° − ${b}° = ${a}°. Úhel odrazu je stejný: ${a}°.` };
    } },
    { id: 'zrcadlo', tema: 'odraz', nazev: 'Rovinné zrcadlo', gen() {
      const v = vyber([0, 1, 2]);
      if (v === 0) {
        const d = vyber([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]);
        return { zadani: `Stojíš ${cisK(d)} m před rovinným zrcadlem. Jak daleko od tebe je tvůj obraz?`,
          moznosti: [{ t: cisK(2 * d, 2) + ' m', ok: true }, { t: cisK(d, 2) + ' m', proc: 'Tak daleko je obraz od zrcadla. Od tebe je dvakrát dál.' }, { t: cisK(d / 2, 2) + ' m', proc: 'Obraz není na zrcadle ani před ním – je za zrcadlem.' }, { t: cisK(3 * d, 2) + ' m', proc: 'Obraz je stejně daleko za zrcadlem, jako jsi ty před ním.' }],
          napoveda: 'Obraz je stejně daleko za zrcadlem, jako je předmět před ním.',
          vysvetleni: `Ty jsi ${cisK(d)} m před zrcadlem, obraz ${cisK(d)} m za ním – dohromady ${cisK(2 * d, 2)} m.` };
      }
      if (v === 1) {
        const x = vyber([0.5, 1, 1.5]);
        return { zadani: `Přistoupíš k zrcadlu o ${cisK(x)} m blíž. O kolik se přiblížíš ke svému obrazu?`,
          moznosti: [{ t: 'o ' + cisK(2 * x) + ' m', ok: true }, { t: 'o ' + cisK(x) + ' m', proc: 'Obraz se ti současně přiblíží také – od zrcadla je pořád stejně daleko jako ty.' }, { t: 'o ' + cisK(x / 2, 2) + ' m', proc: 'Přibližuješ se ty i obraz, rozdíl se tedy zvětší, ne zmenší.' }, { t: 'vůbec, obraz se vzdálí', proc: 'Obraz je vždy souměrně s tebou podle zrcadla – když jdeš k zrcadlu, jde k němu i obraz.' }],
          napoveda: 'Tvoje vzdálenost od zrcadla i vzdálenost obrazu od zrcadla se změní o stejně.',
          vysvetleni: `Ty se k zrcadlu přiblížíš o ${cisK(x)} m a obraz také – vzdálenost mezi vámi klesne o ${cisK(2 * x)} m.` };
      }
      return { zadani: 'Jaký obraz vytvoří rovinné zrcadlo?',
        moznosti: [{ t: 'Zdánlivý, přímý, stejně velký.', ok: true }, { t: 'Skutečný, převrácený, stejně velký.', proc: 'Za zrcadlem žádné světlo není – obraz nejde zachytit na stínítko, je zdánlivý.' }, { t: 'Zdánlivý, přímý, zmenšený.', proc: 'Zmenšený obraz dává vypuklé zrcadlo (třeba ve křižovatce). Rovinné dává stejně velký.' }, { t: 'Skutečný, přímý, zvětšený.', proc: 'Zvětšený obraz dává duté zrcadlo (kosmetické). Rovinné dává stejně velký zdánlivý obraz.' }],
        napoveda: 'Dá se obraz v zrcadle zachytit na papír?',
        vysvetleni: 'Obraz v rovinném zrcadle je zdánlivý (vzniká jen prodloužením paprsků), přímý a stejně velký. Je jen stranově převrácený – pravá ruka se v zrcadle zdá levá.' };
    } },
    { id: 'lom-smer', tema: 'odraz', nazev: 'Lom světla', gen() {
      const [x, y] = zamichej(LAT).slice(0, 2);
      const hustsi = y[2] > x[2];
      return {
        zadani: `Světlo přechází z ${x[0]} (n = ${cis(x[2], 2)}) do ${y[0]} (n = ${cis(y[2], 2)}) pod úhlem dopadu 20°. Jak se láme?`,
        moznosti: [
          { t: 'Ke kolmici – úhel lomu je menší než 20°.', ok: hustsi, proc: 'Ke kolmici se láme jen při přechodu do opticky hustšího prostředí (s větším n).' },
          { t: 'Od kolmice – úhel lomu je větší než 20°.', ok: !hustsi, proc: 'Od kolmice se láme při přechodu do opticky řidšího prostředí (s menším n).' },
          { t: 'Neláme se – pokračuje rovně.', proc: 'Rovně pokračuje jen kolmo dopadající světlo, nebo když mají obě látky stejný index lomu.' },
          { t: 'Celé se odrazí (úplný odraz).', proc: 'Úplný odraz může nastat jen při přechodu do řidšího prostředí a jen nad mezním úhlem. Ten je tady větší než 20°.' },
        ],
        napoveda: 'Porovnej indexy lomu. Větší n = opticky hustší prostředí = světlo v něm zpomalí.',
        vysvetleni: hustsi ? `${velke(y[1])} má větší index lomu než ${x[1]}. Světlo v něm zpomalí a láme se ke kolmici.`
          : `${velke(y[1])} má menší index lomu než ${x[1]}. Světlo v něm zrychlí a láme se od kolmice.` };
    } },
    { id: 'snell', tema: 'odraz', nazev: 'Úhel lomu (výpočet)', gen() {
      const [gen, , n] = vyber([['vody', 'voda', 1.33], ['skla', 'sklo', 1.50]]);
      const a = vyber([20, 30, 40, 50, 60, 70]);
      const sb = Math.sin(a * RAD) / n, b = Math.round(Math.asin(sb) / RAD);
      const kandidati = [
        { t: a + '°', proc: 'Světlo se na rozhraní láme – úhel se změní.' },
        { t: (90 - b) + '°', proc: 'To je úhel lomeného paprsku od rozhraní, ne od kolmice.' },
        n * Math.sin(a * RAD) < 1 ? { t: Math.round(Math.asin(n * Math.sin(a * RAD)) / RAD) + '°', proc: 'Tady je poměr indexů obráceně – úhel lomu by vyšel větší než úhel dopadu. To platí pro přechod do řidšího prostředí.' } : null,
        { t: Math.round(b / 2) + '°', proc: 'Zkontroluj výpočet: sin β = sin α / n.' },
        { t: Math.min(89, Math.round(b * 1.5)) + '°', proc: 'Zkontroluj výpočet: sin β = sin α / n.' },
      ].filter(x => x && Math.abs(parseInt(x.t, 10) - b) >= 3);
      return {
        zadani: `Světlo jde ze vzduchu do ${gen} (n = ${cis(n, 2)}) pod úhlem dopadu ${a}°. Jaký je přibližně úhel lomu?`,
        moznosti: [{ t: b + '°', ok: true }, ...kandidati.slice(0, 3)],
        napoveda: 'Snellův zákon: 1,00 · sin α = n · sin β, tedy sin β = sin α / n.',
        vysvetleni: `sin β = sin ${a}° / ${cis(n, 2)} = ${cis(Math.sin(a * RAD), 3)} / ${cis(n, 2)} = ${cis(sb, 3)}, takže β ≈ ${b}°. Do hustšího prostředí se světlo láme ke kolmici.`,
        rozsirujici: true };
    } },
    { id: 'mezni', tema: 'odraz', nazev: 'Mezní úhel', gen() {
      const L = [['vody', 'vodu', 1.33], ['skla', 'sklo', 1.50], ['diamantu', 'diamant', 2.42]];
      const i = Math.floor(Math.random() * 3), [gen, , n] = L[i];
      const am = Math.asin(1 / n) / RAD;
      return {
        zadani: `Jaký je přibližně mezní úhel pro světlo, které jde z ${gen} (n = ${cis(n, 2)}) do vzduchu?`,
        moznosti: [{ t: Math.round(am) + '°', ok: true },
          ...L.filter((_, j) => j !== i).map(x => ({ t: Math.round(Math.asin(1 / x[2]) / RAD) + '°', proc: `To je mezní úhel pro ${x[1]}. Čím větší index lomu, tím menší mezní úhel.` })),
          { t: '90°', proc: 'Při mezním úhlu dopadu je úhel lomu 90° – paprsek klouže po rozhraní. Samotný mezní úhel je menší.' }],
        napoveda: 'sin αm = n(vzduch) / n = 1 / n.',
        vysvetleni: `sin αm = 1 / ${cis(n, 2)} = ${cis(1 / n, 3)}, takže αm ≈ ${cis(am, 1)}°. Při větším úhlu dopadu nastane úplný odraz.`,
        rozsirujici: true };
    } },
    { id: 'uplny', tema: 'odraz', nazev: 'Úplný odraz', gen() {
      if (Math.random() < 0.5) return {
        zadani: 'Kdy může nastat úplný odraz?',
        moznosti: [{ t: 'Když světlo jde do opticky řidšího prostředí a úhel dopadu je větší než mezní úhel.', ok: true },
          { t: 'Když světlo jde do opticky hustšího prostředí pod velkým úhlem.', proc: 'Do hustšího prostředí se světlo láme ke kolmici – vždy nějaké projde.' },
          { t: 'Když světlo dopadá na rozhraní kolmo.', proc: 'Kolmo dopadající světlo projde bez lomu.' },
          { t: 'Pokaždé, když je rozhraní hladké.', proc: 'Na hladkém rozhraní se odrazí jen malá část světla – úplně jen za mezním úhlem a jen do řidšího prostředí.' }],
        napoveda: 'Vzpomeň si na laser ve skle: kdy světlo „nevyšlo“ do vzduchu?',
        vysvetleni: 'Při přechodu do řidšího prostředí se světlo láme od kolmice. Za mezním úhlem by úhel lomu musel být přes 90° – to nejde, a tak se všechno světlo odrazí.' };
      const ok = vyber(['z vody do vzduchu', 'ze skla do vzduchu', 'z diamantu do vody', 'ze skla do vody']);
      const spatne = zamichej(['ze vzduchu do vody', 'ze vzduchu do skla', 'z vody do skla', 'ze skla do diamantu']).slice(0, 3);
      return { zadani: 'Ve kterém případě může nastat úplný odraz?',
        moznosti: [{ t: 'Světlo jde ' + ok + '.', ok: true }, ...spatne.map(t => ({ t: 'Světlo jde ' + t + '.', proc: 'Tady jde světlo do opticky hustšího prostředí – láme se ke kolmici a úplný odraz nenastane.' }))],
        napoveda: 'Úplný odraz: jen z opticky hustšího do řidšího prostředí. Indexy: vzduch 1,00, voda 1,33, sklo 1,50, diamant 2,42.',
        vysvetleni: `Světlo jde ${ok}, tedy do opticky řidšího prostředí. Za mezním úhlem se proto celé odrazí.` };
    } },
    { id: 'hranol', tema: 'odraz', nazev: 'Rozklad světla', gen() {
      return vyber([
        { zadani: 'Která barva se v hranolu láme <b>nejvíc</b>?',
          moznosti: [{ t: 'Fialová.', ok: true }, { t: 'Červená.', proc: 'Červená se láme nejméně.' }, { t: 'Zelená.', proc: 'Zelená je uprostřed spektra.' }, { t: 'Všechny stejně.', proc: 'Kdyby se všechny barvy lámaly stejně, hranol by bílé světlo nerozložil.' }],
          napoveda: 'Která barva je ve spektru na opačném konci než červená?',
          vysvetleni: 'Fialové světlo má ve skle největší index lomu, proto se láme nejvíc. Červené nejméně.' },
        { zadani: 'Která barva se v hranolu láme <b>nejméně</b>?',
          moznosti: [{ t: 'Červená.', ok: true }, { t: 'Fialová.', proc: 'Fialová se láme nejvíc.' }, { t: 'Modrá.', proc: 'Modrá se láme víc než červená, zelená i žlutá.' }, { t: 'Všechny stejně.', proc: 'Kdyby se všechny barvy lámaly stejně, hranol by bílé světlo nerozložil.' }],
          napoveda: 'Která barva je v duze nahoře (venku)?',
          vysvetleni: 'Červené světlo má ve skle nejmenší index lomu – láme se nejméně.' },
        { zadani: 'Proč hranol rozloží bílé světlo na barvy?',
          moznosti: [{ t: 'Index lomu skla je pro každou barvu trochu jiný.', ok: true }, { t: 'Sklo barvy samo vyrábí.', proc: 'Barvy jsou už v bílém světle – hranol je jen rozdělí.' }, { t: 'Každá stěna hranolu propouští jinou barvu.', proc: 'Všechny stěny propouštějí všechny barvy; liší se jen úhel lomu.' }, { t: 'Barvy se v hranolu odrážejí od sebe navzájem.', proc: 'Světlo se o sebe neodráží; rozhoduje index lomu.' }],
          napoveda: 'Bílé světlo je směs barev. Co se s každou z nich děje na rozhraní?',
          vysvetleni: 'Každá barva se láme o trochu jiný úhel, protože má ve skle jiný index lomu (disperze). Proto se bílé světlo rozloží na spektrum.' },
      ]);
    } },
    { id: 'rovnice', tema: 'cocky', nazev: 'Zobrazovací rovnice', gen() {
      const [f, a, ap] = vyber([[10, 15, 30], [10, 20, 20], [10, 30, 15], [12, 18, 36], [8, 12, 24], [6, 9, 18], [5, 6, 30], [20, 30, 60], [15, 20, 60], [10, 60, 12], [4, 5, 20], [8, 24, 12], [6, 12, 12], [12, 20, 30], [10, 5, -10], [12, 4, -6], [20, 10, -20], [15, 10, -30], [12, 6, -12], [6, 3, -6]]);
      const popis = x => x > 0 ? `${cisK(x)} cm za čočkou (skutečný obraz)` : `${cisK(-x)} cm před čočkou (zdánlivý obraz)`;
      const soucet = a * f / (a + f);
      const moz = [{ t: popis(ap), ok: true },
        { t: popis(-ap), proc: ap > 0 ? 'Kladné a′ znamená obraz za čočkou – skutečný.' : 'a′ vyšlo záporné – obraz je před čočkou a je zdánlivý.' },
        { t: popis(soucet), proc: 'Pozor na znaménko: 1/a′ = 1/f − 1/a, ne 1/f + 1/a.' },
        { t: `${cisK(f)} cm za čočkou (v ohnisku)`, proc: 'V ohnisku se sbíhají jen paprsky rovnoběžné s osou – od velmi vzdáleného předmětu.' },
        a !== 2 * f && { t: popis(a), proc: 'Obraz je stejně daleko jako předmět jen pro a = 2f.' }].filter(Boolean);
      return {
        zadani: `Svíčka stojí ${a} cm před spojkou s ohniskovou vzdáleností ${f} cm. Kde vznikne obraz?`,
        obrazek: svgCocka({ typ: 'spojka', f, a }),
        moznosti: [moz[0], ...zamichej(moz.slice(1)).slice(0, 3)],
        napoveda: '1/a′ = 1/f − 1/a. Vyjde-li a′ záporné, je obraz před čočkou a je zdánlivý.',
        vysvetleni: `1/a′ = 1/${f} − 1/${a}, tedy a′ = a·f / (a − f) = ${a}·${f} / (${a} − ${f}) = ${cisK(ap)} cm. ${ap > 0 ? 'Obraz je skutečný, za čočkou.' : 'Záporné a′: obraz je zdánlivý, před čočkou (lupa).'}` };
    } },
    { id: 'vlastnosti', tema: 'cocky', nazev: 'Jaký je obraz', gen() {
      const TEXT = { za2f: 'skutečný, převrácený, zmenšený', '2f': 'skutečný, převrácený, stejně velký', mezi: 'skutečný, převrácený, zvětšený', pred: 'zdánlivý, přímý, zvětšený', rozptylka: 'zdánlivý, přímý, zmenšený' };
      const PROC = { za2f: 'Skutečný zmenšený obraz dá spojka, když je předmět dál než 2f.', '2f': 'Stejně velký obraz vznikne jen pro a = 2f.', mezi: 'Skutečný zvětšený obraz vznikne, když je předmět mezi f a 2f.', pred: 'Zdánlivý zvětšený obraz (lupa) vznikne, když je předmět blíž než f.', rozptylka: 'Zdánlivý zmenšený obraz dává rozptylka.' };
      const pripad = vyber(Object.keys(TEXT)), f = vyber([8, 10, 12]);
      const a = pripad === 'za2f' ? f * vyber([2.5, 3, 3.5]) : pripad === '2f' ? 2 * f : pripad === 'mezi' ? f * vyber([1.25, 1.5, 1.75]) : pripad === 'pred' ? f * vyber([0.4, 0.5, 0.6]) : f * vyber([0.8, 1.5, 2.5]);
      const typ = pripad === 'rozptylka' ? 'rozptylka' : 'spojka';
      const jine = zamichej(Object.keys(TEXT).filter(x => x !== pripad)).slice(0, 3);
      const kde = pripad === 'rozptylka' ? 'Rozptylka dává vždy zdánlivý, přímý a zmenšený obraz.'
        : pripad === 'za2f' ? `Svíčka je dál než 2f = ${2 * f} cm, obraz je proto skutečný, převrácený a zmenšený.`
        : pripad === '2f' ? `Svíčka je právě ve vzdálenosti 2f = ${2 * f} cm, obraz je skutečný, převrácený a stejně velký.`
        : pripad === 'mezi' ? `Svíčka je mezi f = ${f} cm a 2f = ${2 * f} cm, obraz je skutečný, převrácený a zvětšený.`
        : `Svíčka je blíž než ohnisko (f = ${f} cm), obraz je zdánlivý, přímý a zvětšený – čočka funguje jako lupa.`;
      return {
        zadani: `${velke(typ)} má ohniskovou vzdálenost ${f} cm a svíčka stojí ${cisK(a)} cm před ní. Jaký obraz vznikne?`,
        obrazek: svgCocka({ typ, f, a }),
        moznosti: [{ t: velke(TEXT[pripad]) + '.', ok: true }, ...jine.map(x => ({ t: velke(TEXT[x]) + '.', proc: PROC[x] }))],
        napoveda: 'Porovnej vzdálenost svíčky s f a 2f – na obrázku jsou vyznačená ohniska.',
        vysvetleni: kde };
    } },
    { id: 'zvetseni', tema: 'cocky', nazev: 'Velikost obrazu', gen() {
      const [f, a, ap] = vyber([[10, 15, 30], [10, 30, 15], [12, 18, 36], [8, 12, 24], [20, 30, 60], [10, 60, 12], [8, 24, 12], [12, 20, 30], [6, 9, 18]]);
      const y = vyber([2, 3, 4, 5, 6]), yp = y * ap / a;
      const moz = [{ t: `${cisK(yp)} cm, převrácený`, ok: true },
        { t: `${cisK(y * a / ap)} cm, převrácený`, proc: 'Zvětšení je a′/a, ne a/a′.' },
        { t: `${cisK(yp)} cm, vzpřímený`, proc: 'Skutečný obraz spojky je vždy převrácený.' },
        yp !== y && { t: `${cisK(y)} cm, převrácený`, proc: 'Stejně velký je obraz jen pro a = 2f.' }].filter(Boolean);
      return {
        zadani: `Svíčka vysoká ${y} cm stojí ${a} cm před spojkou (f = ${f} cm). Obraz vznikl ${ap} cm za čočkou. Jak velký je obraz?`,
        moznosti: moz,
        napoveda: 'Zvětšení Z = y′/y = −a′/a. Záporné Z znamená převrácený obraz.',
        vysvetleni: `Z = −a′/a = −${ap}/${a} = ${cis(-ap / a, 2)}. Výška obrazu y′ = Z · y = ${cisK(-yp)} cm – obraz je ${cisK(yp)} cm vysoký a převrácený.` };
    } },
    { id: 'mohutnost', tema: 'cocky', nazev: 'Optická mohutnost', gen() {
      if (Math.random() < 0.55) {
        const f = vyber([10, 20, 25, 40, 50, -20, -25, -50]), phi = 100 / f;
        const d = x => sePlus(x, 2) + ' D';
        return {
          zadani: `Jakou optickou mohutnost má ${f > 0 ? 'spojka' : 'rozptylka'} s ohniskovou vzdáleností ${cisK(f)} cm?`,
          moznosti: [{ t: d(phi), ok: true }, { t: d(f), proc: 'Ohniskovou vzdálenost je potřeba dosadit v metrech.' }, { t: d(1 / f), proc: 'f je v centimetrech – převeď ji nejdřív na metry.' }, { t: d(-phi), proc: 'Spojka má kladnou optickou mohutnost, rozptylka zápornou.' }],
          napoveda: 'φ = 1/f, kde f je v metrech. Například 25 cm = 0,25 m.',
          vysvetleni: `f = ${cisK(f)} cm = ${cisK(f / 100, 2)} m, φ = 1 / (${cisK(f / 100, 2)} m) = ${d(phi)}.` };
      }
      const D = vyber([-1, -2, -4, 2, 2.5, 4]), f = 100 / D;
      const druh = D > 0 ? 'spojka' : 'rozptylka', opak = D > 0 ? 'rozptylka' : 'spojka';
      return {
        zadani: `Brýlová čočka má optickou mohutnost ${sePlus(D, 1)} D. Jaká je to čočka a jakou má ohniskovou vzdálenost?`,
        moznosti: [{ t: `${velke(druh)}, f = ${cisK(f)} cm`, ok: true },
          { t: `${velke(opak)}, f = ${cisK(-f)} cm`, proc: 'Kladné dioptrie má spojka, záporné rozptylka.' },
          { t: `${velke(druh)}, f = ${cisK(D)} cm`, proc: 'f = 1/φ vychází v metrech: 1 / ' + cisK(Math.abs(D)) + ' = ' + cisK(Math.abs(f) / 100, 2) + ' m.' },
          { t: `${velke(druh)}, f = ${cisK(D * 100)} cm`, proc: 'f = 1/φ, ne φ krát sto.' }],
        napoveda: 'f = 1/φ (v metrech). Znaménko prozradí druh čočky.',
        vysvetleni: `f = 1 / (${sePlus(D, 1)}) m = ${cisK(f / 100, 2)} m = ${cisK(f)} cm. ${D > 0 ? 'Kladná mohutnost – spojka.' : 'Záporná mohutnost – rozptylka.'}` };
    } },
    { id: 'paprsky', tema: 'cocky', nazev: 'Význačné paprsky', gen() {
      const druh = vyber(['rovnobezny', 'stredem', 'ohniskem']);
      const X0 = 380, Y = 124, F = 88;   // stejné měřítko jako svgCocka (f = 11 cm, 8 jednotek na cm)
      const pr = (a, b) => `<path class="cara c-paprsek" d="M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}"/>`;
      const naX = (A, B, x) => [x, A[1] + (B[1] - A[1]) * (x - A[0]) / (B[0] - A[0])];
      let vstup, L, kandidati;
      if (druh === 'rovnobezny') {
        vstup = [60, 70]; L = [X0, 70];
        kandidati = [{ c: naX(L, [X0 + F, Y], 590), ok: true }, { c: [590, 70], proc: 'Spojka rovnoběžný paprsek zalomí k ose – do ohniska F′.' }, { c: naX(L, [X0 + 2 * F, Y], 590), proc: 'Rovnoběžný paprsek jde do ohniska F′, ne do 2F′.' }];
      } else if (druh === 'stredem') {
        vstup = [60, 60]; L = [X0, Y];
        const d = (Y - 60) / (X0 - 60);
        kandidati = [{ c: [590, Y + d * 210], ok: true }, { c: [590, Y + 1.9 * d * 210], proc: 'Paprsek středem čočky se neláme – pokračuje stejným směrem.' }, { c: [590, Y + 0.25 * d * 210], proc: 'Paprsek středem čočky se neláme – nemá se k ose přiklonit.' }];
      } else {
        vstup = [60, 60]; const Fo = [X0 - F, Y];
        L = naX(vstup, Fo, X0);
        kandidati = [{ c: [590, L[1]], ok: true }, { c: naX(vstup, L, 590), proc: 'Paprsek přes ohnisko F se v čočce láme – vychází rovnoběžně s osou.' }, { c: naX(L, [X0 + F, Y], 590), proc: 'Do F′ míří paprsek, který do čočky vstoupil rovnoběžně s osou. Paprsek přes F vychází rovnoběžně.' }];
      }
      const pismena = zamichej(['A', 'B', 'C']);
      kandidati.forEach((k, i) => { k.p = pismena[i]; });
      const obr = [];
      obr.push(pr(vstup, L));
      for (const k of kandidati) {
        obr.push(`<path class="cara tenka c-paprsek" d="M${r1(L[0])} ${r1(L[1])}L${r1(k.c[0])} ${r1(k.c[1])}"/>`);
        const T = naX(L, k.c, 560);
        obr.push(`<text x="${r1(T[0])}" y="${r1(T[1] - 8)}" class="t-silny t-stred">${k.p}</text>`);
      }
      const svg = svgCocka({ typ: 'spojka', f: F / 8, a: 0, paprsky: obr.join('') });
      const serazene = [...kandidati].sort((a, b) => a.p.localeCompare(b.p));
      const zadani = { rovnobezny: 'Paprsek dopadá na spojku <b>rovnoběžně s optickou osou</b>.', stredem: 'Paprsek jde <b>středem</b> spojky.', ohniskem: 'Paprsek jde před spojkou <b>přes ohnisko F</b>.' }[druh];
      const vys = { rovnobezny: 'Paprsek rovnoběžný s optickou osou se za spojkou láme do ohniska F′.', stredem: 'Paprsek středem čočky se neláme – pokračuje rovně.', ohniskem: 'Paprsek jdoucí ohniskem F vychází ze spojky rovnoběžně s optickou osou.' }[druh];
      return {
        zadani: zadani + ' Kudy pokračuje za čočkou?',
        obrazek: svg,
        moznosti: serazene.map(k => ({ t: 'Paprsek ' + k.p, ok: !!k.ok, proc: k.proc })),
        napoveda: 'Tři význačné paprsky: rovnoběžný → do F′, středem → rovně, přes F → rovnoběžně s osou.',
        vysvetleni: vys };
    } },
    { id: 'oko', tema: 'oko', nazev: 'Oko a brýle', gen() {
      return vyber([
        { zadani: 'U krátkozrakého oka vzniká obraz vzdáleného předmětu…',
          moznosti: [{ t: 'před sítnicí.', ok: true }, { t: 'za sítnicí.', proc: 'Za sítnicí vzniká obraz blízkých předmětů u dalekozrakého oka.' }, { t: 'přesně na sítnici.', proc: 'Pak by oko vidělo do dálky ostře – krátkozraké ale vidí do dálky rozmazaně.' }, { t: 'na čočce.', proc: 'Na čočce obraz nevzniká – čočka světlo jen láme.' }],
          napoveda: 'Krátkozraké oko je příliš dlouhé.',
          vysvetleni: 'Krátkozraké oko je příliš dlouhé (nebo příliš silně láme), paprsky ze vzdálených předmětů se sejdou už před sítnicí.' },
        { zadani: 'Jaké brýle potřebuje <b>krátkozraký</b> člověk?',
          moznosti: [{ t: 'S rozptylkou (záporné dioptrie).', ok: true }, { t: 'Se spojkou (kladné dioptrie).', proc: 'Spojka by paprsky soustředila ještě dřív – obraz by se posunul dál před sítnici.' }, { t: 'S obyčejným sklem bez dioptrií.', proc: 'Rovné sklo světlo nesoustředí ani nerozptýlí – nepomůže.' }, { t: 'Brýle nepomohou, jen operace.', proc: 'Krátkozrakost se běžně opravuje brýlemi nebo kontaktními čočkami.' }],
          napoveda: 'Obraz je před sítnicí – paprsky je potřeba trochu rozbíhat.',
          vysvetleni: 'Rozptylka paprsky před okem trochu rozbíhá, takže se sejdou až na sítnici.' },
        { zadani: 'Jaké brýle potřebuje <b>dalekozraký</b> člověk na čtení?',
          moznosti: [{ t: 'Se spojkou (kladné dioptrie).', ok: true }, { t: 'S rozptylkou (záporné dioptrie).', proc: 'Rozptylka by obraz posunula ještě dál za sítnici.' }, { t: 'S obyčejným sklem bez dioptrií.', proc: 'Rovné sklo světlo neláme k ose – nepomůže.' }, { t: 'Žádné – stačí držet text blíž.', proc: 'Dalekozraké oko naopak nezaostří na blízko – text by musel být dál.' }],
          napoveda: 'Obraz blízkého předmětu vzniká za sítnicí – oko láme málo.',
          vysvetleni: 'Spojka oku pomůže paprsky soustředit dřív, takže se sejdou na sítnici.' },
        { zadani: 'Jak oko zaostří na blízký předmět?',
          moznosti: [{ t: 'Oční čočka se víc vyklene a zkrátí se její ohnisková vzdálenost.', ok: true }, { t: 'Čočka se posune dopředu, dál od sítnice.', proc: 'Tak zaostřuje fotoaparát. Oko mění tvar čočky.' }, { t: 'Oko se protáhne.', proc: 'Délka oka se nemění – mění se tvar čočky.' }, { t: 'Zornice se zvětší.', proc: 'Zornice řídí, kolik světla projde, ne zaostření.' }],
          napoveda: 'Tomu ději se říká akomodace.',
          vysvetleni: 'Při akomodaci svaly dovolí oční čočce víc se vyklenout. Láme pak víc a obraz blízkého předmětu vznikne na sítnici.' },
      ]);
    } },
  ];

  const TEMATA = [['vse', 'Vše'], ['svetlo', 'Světlo a stín'], ['odraz', 'Odraz, lom, barvy'], ['cocky', 'Čočky a obraz'], ['oko', 'Oko a brýle']];

  /* Procvičování jede přes sdílený uloha.js: chybná odpověď se zatřese a jde zkusit znovu,
     správná se po pauze sama posune (tempo si žák volí v liště), do skóre se počítá
     jen odpověď napoprvé. Kostra z událostí uloha.js staví fázi Ověř se. */
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
      this.skore = Uloha.skore('metodus_optika_lekce_skore', $('#cv-skore'));
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
      $('#cv-tema').textContent = q.generator.nazev + (q.rozsirujici ? ' · rozšiřující' : '');
      $('#cv-zadani').innerHTML = q.zadani;
      const obr = $('#cv-obrazek');
      obr.hidden = !q.obrazek;
      obr.innerHTML = q.obrazek || '';
      if (q.obrazek) requestAnimationFrame(() => { const s = $('svg', obr); if (s && s.clientWidth) s.style.setProperty('--k', (600 / s.clientWidth).toFixed(3)); });
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
    for (const f of [modelVidime, modelStin, modelOdraz, modelZrcadlo, modelLomy, modelHloubka, modelVlakno, modelHranol, modelDuha, modelCocka, modelZobrazeni, modelOko]) {
      try { f(); } catch (e) { console.error('Model se nepodařilo spustit:', f.name, e); }
    }
    Navigace.init();
    odkazyNaLekce();
    Procvic.init();
    Model.vsechny.forEach(m => m.naplanuj());
  }
  window.addEventListener('metodus-theme', () => Model.vsechny.forEach(m => m.naplanuj()));
  window.OptikaLekce = { MODELY, Ukoly, Postup, Model, trasuj, fresnel, hranyMnohouhelniku, GENERATORY, get Procvic() { return Procvic; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
