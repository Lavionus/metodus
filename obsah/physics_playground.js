/* ============================================================
   physics_playground.js – interaktivní výklad „Fyzikální hřiště“
   (síla a pohyb, nakloněná rovina, energie, kyvadlo, srážky).

   Stavba (stejná jako lekce optiky, optika_lekce.js):
     1. pomůcky (čísla, kreslení do SVG, šipky sil)
     2. Model – obrázek s úchopy (tažení myší, dotykem i klávesnicí)
        a Animace – společná smyčka pro modely, které se hýbou
     3. Úkoly a předpovědi (postup se ukládá do localStorage)
     4. Navigace (osnova, čipy, mapa lekce)
     5. Modely kapitol: bedna, nakloněná rovina, U-rampa, kyvadlo, srážky
     6. Procvičování (otázky pro fázi Procvič a Ověř se)

   Fyzika běží v jednotkách SI s g = 9,81 N/kg (Měsíc 1,62, Mars 3,71);
   otázky v Procvič počítají se zaokrouhleným g = 10 N/kg.
   Každý model počítá v malých krocích (1–4 ms), takže výsledek nezávisí
   na rychlosti počítače; simuluj(t) spustí model bez kreslení (pro testy).
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
  const G = 9.81;
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
  /* Bez zbytečné ,0 (30 N, ale 14,7 N). */
  function cisK(x, d = 1) {
    const t = cis(x, d);
    return t.includes(',') ? t.replace(/,?0+$/, '') : t;
  }

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
  /* Text s dolními indexy: 'F_{G}' → F s indexem G. Index se posouvá přes dy,
     protože baseline-shift v SVG některé prohlížeče neumějí. */
  function popis(g, x, y, t, cls, extra) {
    const e = sv('text', Object.assign({ x: r1(x), y: r1(y), class: cls || '' }, extra || {}), g);
    let dole = false;
    for (const c of String(t).split(/(_\{[^}]*\})/)) {
      if (!c) continue;
      if (c.startsWith('_{')) {
        const s = sv('tspan', { dy: '0.32em', 'font-size': '78%' }, e);
        s.textContent = c.slice(2, -1);
        dole = true;
      } else if (dole) {
        const s = sv('tspan', { dy: '-0.32em' }, e);
        s.textContent = c;
        dole = false;
      } else e.appendChild(document.createTextNode(c));
    }
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
  /* Trojúhelníková šipka ve směru u (jednotkový vektor), hrot v p + u·s. */
  function hrot(g, p, u, k, velikost = 1, cls) {
    const s = 6.5 * k * velikost, q = [-u[1], u[0]];
    const a = [p[0] + u[0] * s, p[1] + u[1] * s];
    const b = [p[0] - u[0] * s + q[0] * s * 0.72, p[1] - u[1] * s + q[1] * s * 0.72];
    const c = [p[0] - u[0] * s - q[0] * s * 0.72, p[1] - u[1] * s - q[1] * s * 0.72];
    return sv('path', { d: dCesta([a, b, c], true), class: 'hrot ' + (cls || '') }, g);
  }
  /* Šipka síly (nebo rychlosti) z bodu p o vektor v; cls určí barvu (c-tiha…).
     o.odsad posune popisek kolmo na šipku, o.dal ho oddálí od hrotu. */
  function sipka(g, p, v, cls, k, text, o = {}) {
    const l = Math.hypot(v[0], v[1]);
    if (!(l >= 4 * k)) return null;               // kratší šipka než hrot nedává smysl
    const u = [v[0] / l, v[1] / l];
    const sk = sv('g', { class: 'sila ' + cls }, g);
    const vel = o.velikost || 1, s = 6.5 * k * vel;
    const konec = [p[0] + v[0], p[1] + v[1]];
    const stred = [konec[0] - u[0] * s, konec[1] - u[1] * s];
    cara(sk, [p, stred]);
    hrot(sk, stred, u, k, vel);
    if (text) {
      const q = [-u[1], u[0]], od = (o.odsad || 0) * k, d = (13 + (o.dal || 0)) * k;
      popis(sk, konec[0] + u[0] * d + q[0] * od, konec[1] + u[1] * d + q[1] * od, text, 't-barva t-stred', { 'dominant-baseline': 'middle' });
    }
    return sk;
  }
  function zamichej(pole) {
    const a = [...pole];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const vyber = pole => pole[Math.floor(Math.random() * pole.length)];
  const bezpecne = f => { try { return !!f(); } catch { return false; } };

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
    // nastav() se chová jako posun rukou, ukaz() jen srovná posuvník s modelem (po tažení úchopu)
    return { el: i, nastav(v) { i.value = v; obnov(); zmena(+i.value); }, ukaz(v) { i.value = v; obnov(); } };
  }
  function prepinac(id, zmena) {
    const i = typeof id === 'string' ? document.getElementById(id) : id;
    i.addEventListener('change', () => zmena(i.checked));
    return i;
  }

  /* ================================================================
     3. Úkoly a předpovědi
     ================================================================ */
  const KLIC = 'metodus_hriste';
  const Postup = (() => {
    const data = { hotovo: {}, tipy: {}, mereni: [] };
    try {
      const d = JSON.parse(localStorage.getItem(KLIC) || 'null');
      if (d && typeof d === 'object') {
        Object.assign(data.hotovo, d.hotovo || {}); Object.assign(data.tipy, d.tipy || {});
        if (Array.isArray(d.mereni)) data.mereni = d.mereni.filter(r => r && isFinite(r.l) && isFinite(r.T)).slice(-40);
      }
    } catch { /* bez úložiště začínáme vždy znovu */ }
    const uloz = () => { try { localStorage.setItem(KLIC, JSON.stringify(data)); } catch { /* bez paměti */ } };
    return {
      data, uloz,
      smaz() { for (const k in data.hotovo) delete data.hotovo[k]; for (const k in data.tipy) delete data.tipy[k]; data.mereni.length = 0; uloz(); },
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

  /* Společná smyčka pro modely, které se hýbou. Běží jen tehdy, když aspoň
     jeden model jede; model mimo obrazovku stojí (čas se mu nepočítá),
     takže úkoly „nechej chvíli jet“ nedoběhnou bez dozoru. */
  const Animace = {
    seznam: [], id: 0, posl: 0,
    pridej(model, krok, bezi) { this.seznam.push({ model, krok, bezi }); },
    spust() {
      if (this.id) return;
      this.posl = 0;
      this.id = requestAnimationFrame(t => this.tik(t));
    },
    tik(t) {
      this.id = 0;
      const dt = this.posl ? Math.min(0.05, (t - this.posl) / 1000) : 0;
      this.posl = t;
      let neco = false;
      for (const a of this.seznam) {
        if (!a.bezi()) continue;
        neco = true;
        if (!a.model.viditelny) continue;
        if (dt > 0) a.krok(dt);
        a.model.vykresli();
      }
      if (neco) this.id = requestAnimationFrame(t2 => this.tik(t2));
    },
  };

  /* Model běží v malých pevných krocích; tempo (zpomalení) jen zkrátí čas. */
  function kroky(dt, h, f) {
    const n = Math.max(1, Math.ceil(dt / h - 1e-9));
    const d = dt / n;
    for (let i = 0; i < n; i++) if (f(d) === false) break;
  }

  /* ================================================================
     4. Navigace
     ================================================================ */
  const IKONY = {
    sila: '<line x1="4" y1="50" x2="156" y2="50" class="cara tenka c-text"/><rect x="50" y="22" width="40" height="28" rx="3" class="bedna"/><path class="cara c-tah" d="M90 36 L140 36"/><path class="hrot c-tah" d="M150 36 L138 30 L138 42Z"/><path class="cara c-treni" d="M60 48 L28 48"/><path class="hrot c-treni" d="M18 48 L30 42 L30 54Z"/>',
    rovina: '<path d="M8 54 L150 54 L150 8Z" class="klin"/><rect x="92" y="18" width="22" height="16" transform="rotate(-18 103 26)" class="bedna"/><path class="cara c-tiha" d="M102 30 L102 50"/><path class="hrot c-tiha" d="M102 58 L96 48 L108 48Z"/>',
    energie: '<path d="M10 8 Q80 96 150 8" fill="none" class="cara c-text"/><circle cx="36" cy="30" r="7" class="kulicka"/><rect x="118" y="36" width="8" height="18" class="sloupec c-ep"/><rect x="130" y="44" width="8" height="10" class="sloupec c-ek"/>',
    kyvadlo: '<line x1="60" y1="6" x2="100" y2="6" class="cara c-text"/><line x1="80" y1="6" x2="112" y2="46" class="cara tenka c-text"/><path d="M48 46 Q80 64 112 46" fill="none" class="cara tenka carkovana c-slabe"/><circle cx="112" cy="46" r="8" class="zavazi-a"/>',
    srazky: '<line x1="4" y1="52" x2="156" y2="52" class="cara c-text"/><rect x="22" y="26" width="42" height="20" rx="3" class="vuz-a"/><rect x="96" y="26" width="42" height="20" rx="3" class="vuz-b"/><path class="cara c-rychlost" d="M36 16 L64 16"/><path class="hrot c-rychlost" d="M72 16 L62 11 L62 21Z"/>',
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
        document.dispatchEvent(new CustomEvent('hriste-znovu'));
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
     5. Modely kapitol
     ================================================================ */
  const MODELY = {};

  /* ---------------- 1. Bedna na podlaze: tah, tření, setrvačnost ---------------- */
  const PODLAHY = { led: 0.03, drevo: 0.3, koberec: 0.6 };
  function modelVozik() {
    const m = new Model('obr-vozik', 900, 330);
    const GY = 240, PX = 55, BX = 300, KRAJ = 520, BW = 90, BH = 70;
    const s = { m: 5, F: 20, povrch: 'drevo', tahne: false, x: 0, v: 0, t: 0, graf: [[0, 0]], dalsiBod: 0.05,
      vysledna: false, pomalu: false, rovnovaha: 0, volno: 0, vPusteni: 0, rozjezd: null, zastavilo: false };
    const M = { m, s };
    MODELY.vozik = M;

    /* V klidu tření drží přesně tolik, kolik je potřeba (nanejvýš f · Fn);
       v pohybu má plnou velikost f · Fn a míří proti pohybu. */
    function sily() {
      const f = PODLAHY[s.povrch], Fg = s.m * G, Tmax = f * Fg;
      const F = s.tahne ? s.F : 0;
      let Ft, a;
      if (s.v <= 1e-9) {
        if (F > Tmax) { Ft = Tmax; a = (F - Tmax) / s.m; } else { Ft = F; a = 0; }
      } else { Ft = Tmax; a = (F - Tmax) / s.m; }
      return { f, Fg, Tmax, F, Ft, Fv: F - Ft, a };
    }
    M.sily = sily;

    function krok(dt) {
      kroky(dt * (s.pomalu ? 0.25 : 1), 1 / 400, h => {
        const f = sily();
        const stala = s.v <= 1e-9;
        s.v = Math.min(20, Math.max(0, s.v + f.a * h));
        if (stala && s.v > 1e-9) { s.rozjezd = { F: s.F, povrch: s.povrch, m: s.m }; s.zastavilo = false; }
        if (!stala && s.v <= 1e-9) { s.v = 0; s.zastavilo = true; }
        s.x += s.v * h;
        s.t += h;
        // tah vyrovná tření → výsledná síla nulová → stálá rychlost
        if (s.tahne && s.v > 0.3 && Math.abs(s.F - f.Tmax) <= 0.5) s.rovnovaha += h; else s.rovnovaha = 0;
        if (!s.tahne && s.v > 1e-9) s.volno += h;
        if (s.t >= s.dalsiBod) { s.graf.push([s.t, s.v]); s.dalsiBod = s.t + 0.05; }
      });
      while (s.graf.length > 2 && s.graf[0][0] < s.t - 12) s.graf.shift();
    }
    M.krok = krok;
    M.bezi = () => s.tahne || s.v > 1e-9;
    M.simuluj = t => { kroky(t, 0.02, d => krok(d)); m.vykresli(); };
    Animace.pridej(m, krok, M.bezi);

    function reset() {
      Object.assign(s, { x: 0, v: 0, t: 0, graf: [[0, 0]], dalsiBod: 0.05, tahne: false, rovnovaha: 0, volno: 0, vPusteni: 0, rozjezd: null, zastavilo: false });
    }
    M.reset = reset;

    const tl = $('#voz-tahni');
    const obnovTl = () => {
      if (tl.dataset.stav === String(s.tahne)) return;
      tl.dataset.stav = String(s.tahne);
      tl.textContent = s.tahne ? '🖐️ Pustit provaz' : '✋ Táhnout';
      tl.classList.toggle('hlavni', !s.tahne);
      tl.setAttribute('aria-pressed', String(s.tahne));
    };
    M.tahni = chci => {
      if (chci === s.tahne) return;
      s.tahne = chci;
      if (!chci) s.vPusteni = s.v;
      s.volno = 0;
      Animace.spust();
      m.naplanuj();
    };
    tl.addEventListener('click', () => M.tahni(!s.tahne));
    const silaPos = posuvnik('voz-sila', v => cisK(v) + ' N', v => { s.F = v; m.naplanuj(); });
    const hmotPos = posuvnik('voz-hmotnost', v => v + ' kg', v => { s.m = v; m.naplanuj(); });
    const povrch = segment($('#voz-povrch'), s.povrch, v => { s.povrch = v; m.naplanuj(); });
    prepinac('voz-vysledna', c => { s.vysledna = c; m.naplanuj(); });
    prepinac('voz-pomalu', c => { s.pomalu = c; });
    $('#voz-reset').addEventListener('click', () => { reset(); m.naplanuj(); });
    M.nastav = z => {
      if ('F' in z) silaPos.ukaz(z.F);
      if ('m' in z) hmotPos.ukaz(z.m);
      if ('povrch' in z) povrch(z.povrch);
      Object.assign(s, z);
      m.vykresli();
    };

    m.kresli = g => {
      const k = m.k, f = sily();
      obnovTl();
      const cam = Math.max(0, s.x - (KRAJ - BX) / PX);
      const X = x => BX + (x - cam) * PX;
      // podlaha, povrch a značky po metru
      sv('rect', { x: 0, y: GY, width: 900, height: 44, class: 'podlaha' }, g);
      sv('rect', { x: 0, y: GY, width: 900, height: 9, class: 'povrch-' + s.povrch }, g);
      const od = Math.floor(cam - BX / PX) - 1, po = Math.ceil(cam + (900 - BX) / PX) + 1;
      for (let i = Math.max(-6, od); i <= po; i++) {
        const x = X(i);
        cara(g, [[x, GY + 9], [x, GY + (i % 5 === 0 ? 22 : 15)]], 'tenka c-slabe');
        if (i % 5 === 0 && i >= 0) txt(g, x, GY + 37, i + ' m', 't-maly t-stred');
      }
      const bx = X(s.x), L = bx - BW / 2, T = GY - BH, py = GY - BH / 2;
      // provaz a ruka
      if (s.tahne) {
        const rx = bx + BW / 2 + 130;
        sv('path', { d: `M${r1(bx + BW / 2)} ${py}L${r1(rx - 8)} ${py}`, class: 'provaz' }, g);
        sv('rect', { x: r1(rx + 4), y: py - 7, width: 34, height: 14, rx: 6, class: 'ruka' }, g);
        sv('ellipse', { cx: r1(rx), cy: py, rx: 12, ry: 10, class: 'ruka' }, g);
      } else {
        sv('path', { d: `M${r1(bx + BW / 2)} ${py}Q${r1(bx + BW / 2 + 40)} ${GY - 3} ${r1(bx + BW / 2 + 100)} ${GY - 2}`, class: 'provaz' }, g);
      }
      // bedna
      sv('rect', { x: r1(L), y: T, width: BW, height: BH, rx: 3, class: 'bedna' }, g);
      sv('path', { d: `M${r1(L + 6)} ${T + 6}L${r1(L + BW - 6)} ${GY - 6}M${r1(L + BW - 6)} ${T + 6}L${r1(L + 6)} ${GY - 6}`, class: 'bedna-lat' }, g);
      txt(g, L + 2, T - 10, 'bedna ' + cisK(s.m) + ' kg', 't-maly');
      // síly – společné měřítko, aby šly porovnat délkou
      const sk = Math.min(3.2, 80 / f.Fg);
      sipka(g, [bx - 12, py], [0, f.Fg * sk], 'c-tiha', k, 'F_{G}', { odsad: -14 });
      sipka(g, [bx + 12, GY], [0, -f.Fg * sk], 'c-podlozka', k, 'F_{p}', { odsad: 16 });
      if (f.F > 0) sipka(g, [bx + BW / 2, py], [f.F * sk, 0], 'c-tah', k, 'F', { odsad: -14 });
      if (f.Ft > 0.01) sipka(g, [bx - 4, GY - 4], [-f.Ft * sk, 0], 'c-treni', k, 'F_{t}', { odsad: -14 });
      if (s.vysledna) {
        if (Math.abs(f.Fv) * sk >= 4 * k) sipka(g, [bx, T + 14], [f.Fv * sk, 0], 'vysledna c-vysledna', k, 'F_{v}', { odsad: -12 });
        else txt(g, bx, T + 18, 'F_v = 0', 't-maly t-stred');
      }
      // rychlost nad bednou
      const vg = sv('g', { class: 'c-rychlost' }, g);
      if (s.v > 0.02) {
        sipka(vg, [L, T - 30], [s.v * 18, 0], 'c-rychlost', k);
        txt(vg, L + s.v * 18 + 10 * k, T - 26, 'v = ' + cis(s.v, 1) + ' m/s', 't-maly t-barva');
      }
      // graf rychlosti
      const GX = 606, GYg = 10, GW = 280, GH = 118;
      sv('rect', { x: GX, y: GYg, width: GW, height: GH, rx: 8, class: 'panel-graf' }, g);
      const vmax = Math.max(3, Math.ceil(Math.max(...s.graf.map(b => b[1])) + 0.2));
      const x0 = GX + 34, x1 = GX + GW - 12, y0 = GYg + GH - 22, y1 = GYg + 24;
      const t0 = Math.max(0, s.t - 12);
      const Xg = t => x0 + (t - t0) / 12 * (x1 - x0), Yg = v => y0 - v / vmax * (y0 - y1);
      cara(g, [[x0, y1 - 4], [x0, y0], [x1, y0]], 'tenka c-text');
      cara(g, [[x0, Yg(vmax)], [x1, Yg(vmax)]], 'tenka c-slabe', 'opacity:.4');
      txt(g, x0 - 5, y0 + 4, '0', 't-maly t-konec');
      txt(g, x0 - 5, Yg(vmax) + 4, String(vmax), 't-maly t-konec');
      txt(g, GX + 10, GYg + 16, 'rychlost v (m/s)', 't-maly');
      txt(g, x1, y0 + 16, 'čas → (12 s)', 't-maly t-konec');
      if (s.graf.length > 1) cara(sv('g', { class: 'c-rychlost' }, g), s.graf.map(b => [Xg(b[0]), Yg(b[1])]), '');

      m.odecet([
        ['Tah', cisK(f.F) + ' N'],
        ['Tření', cisK(f.Ft) + ' N' + (s.v <= 1e-9 ? ` (nejvýš ${cisK(f.Tmax)} N)` : '')],
        ['Výsledná síla', Math.abs(f.Fv) < 0.05 ? '0 N' : cisK(Math.abs(f.Fv)) + ' N ' + (f.Fv > 0 ? 'dopředu' : 'dozadu')],
        ['Rychlost', cis(s.v, 2) + ' m/s'],
        ['Dráha', cis(s.x, 1) + ' m'],
      ]);
      let z;
      if (!s.tahne && s.v <= 1e-9) z = s.zastavilo
        ? `Tření bednu zastavilo. Ujela celkem ${cis(s.x, 1)} m.`
        : 'Bedna stojí. Tíha a síla podložky jsou stejně velké a míří opačně – vyruší se. Stiskni <b>✋ Táhnout</b>.';
      else if (s.tahne && s.v <= 1e-9) z = `Táhneš silou ${cisK(f.F)} N, ale tření dokáže bednu držet silou až ${cisK(f.Tmax)} N. <span class="pozor">Bedna se nehne</span> – přidej tah.`;
      else if (s.tahne && Math.abs(s.F - f.Tmax) <= 0.5) z = '<span class="ok">Tah a tření jsou (skoro) stejně velké: výsledná síla je nulová a bedna jede stálou rychlostí.</span>';
      else if (s.tahne && f.Fv > 0) z = `Tah (${cisK(f.F)} N) je větší než tření (${cisK(f.Ft)} N): výsledná síla míří dopředu a bedna <b>zrychluje</b>.`;
      else if (s.tahne) z = `Tah (${cisK(f.F)} N) je menší než tření (${cisK(f.Ft)} N): výsledná síla míří dozadu a bedna <b>zpomaluje</b>.`;
      else z = s.povrch === 'led'
        ? 'Nikdo netáhne a bedna jede dál <b>setrvačností</b>. Led ji brzdí jen málo, a tak zpomaluje velmi pomalu.'
        : 'Nikdo netáhne. Bedna jede <b>setrvačností</b> a tření ji brzdí – zpomaluje.';
      m.zpravu(z);
    };

    Ukoly.definuj('voz-koberec', () => s.rozjezd && s.rozjezd.povrch === 'koberec' && s.rozjezd.m === 5 && s.rozjezd.F <= 30.5,
      'Tření na koberci dokáže bednu 5 kg držet silou až <b>29,4 N</b> (0,6 · 5 kg · 9,81 N/kg). Rozjede ji teprve větší tah, tedy asi 30 N. Na dřevě by stačilo 15 N, na ledu necelé 2 N.');
    Ukoly.definuj('voz-rovnomerne', () => s.povrch === 'drevo' && s.rovnovaha >= 1.5,
      'Když je tah stejně velký jako tření, výsledná síla je nulová a bedna jede <b>stálou rychlostí</b> – graf rychlosti je vodorovná čára. Síla je potřeba na <b>změnu</b> rychlosti. Na udržení stálé rychlosti stačí vyrovnat tření.');
    predpoved('voz-led', {
      otazka: 'Bedna jede po ledě rychlostí asi 3 m/s a ty najednou <b>pustíš provaz</b>. Co bude bedna dělat?',
      moznosti: ['Hned se zastaví – nikdo ji už netáhne.', 'Pojede dál a jen pomalu zpomaluje.', 'Ještě chvíli zrychluje a pak se zastaví.'],
      spravna: 1,
      proc: ['Pohyb nepotřebuje sílu, která by ho „udržovala“. K zastavení je potřeba síla – a tou je tady jen malé tření o led.', null,
        'Bez tahu na bednu dopředu nic nepůsobí, zrychlovat nemůže. Působí jen tření proti pohybu.'],
      vyzkousej: 'Nastav <b>led</b>, rozjeď bednu aspoň na <b>2,5 m/s</b> a pak stiskni <b>🖐️ Pustit provaz</b>. Sleduj bednu a graf rychlosti aspoň 2 sekundy.',
      splneno: () => s.povrch === 'led' && !s.tahne && s.vPusteni >= 2.5 && s.volno >= 2,
      vysvetleni: 'Tělesa mají <b>setrvačnost</b>: když na ně nepůsobí výsledná síla, jedou dál stejnou rychlostí. Na ledu brzdí bednu jen malé tření (u bedny 5 kg asi 1,5 N), a tak zpomaluje jen o 0,3 m/s za sekundu. Na koberci by se zastavila skoro hned.',
    });
  }

  /* ---------------- 2. Nakloněná rovina: rozklad tíhy, mezní úhel ---------------- */
  const ROVINY = { led: 0.05, drevo: 0.3, guma: 0.8 };
  function modelRovina() {
    const m = new Model('obr-rovina', 900, 460);
    const P0 = [70, 420], DELKA = 4, LF = 120, HW = 32, HH = 44;
    const s = { alfa: 12, m: 2, povrch: 'drevo', rozklad: true, mez: false, x: 0, v: 0, jede: false, drzi: false, dojelo: false, rozjel: false };
    const M = { m, s };
    MODELY.rovina = M;
    M.mez = () => Math.atan(ROVINY[s.povrch]) / RAD;

    function sily() {
      const a = s.alfa * RAD, f = ROVINY[s.povrch], Fg = s.m * G;
      const Fr = Fg * Math.sin(a), Fk = Fg * Math.cos(a), Tmax = f * Fk;
      const pohyb = s.v > 1e-9 || (s.jede && Fr > Tmax);
      return { a, f, Fg, Fr, Fk, Tmax, Ft: pohyb ? Tmax : Math.min(Fr, Tmax), zr: pohyb ? G * (Math.sin(a) - f * Math.cos(a)) : 0 };
    }
    M.sily = sily;
    function geometrie() {
      const a = s.alfa * RAD;
      const LP = Math.min(790, 355 / Math.max(Math.sin(a), 1e-3));
      const u = [Math.cos(a), -Math.sin(a)];        // nahoru po svahu
      const d = [-u[0], -u[1]];                      // dolů po svahu
      const n = [-Math.sin(a), -Math.cos(a)];        // kolmo ven z roviny
      const T = [P0[0] + u[0] * LP, P0[1] + u[1] * LP];
      const sc = (LP - 150) / DELKA;                 // px na metr dráhy
      const o = 76 + s.x * sc;
      const C = [T[0] + d[0] * o, T[1] + d[1] * o];  // střed spodní hrany kvádru
      return { a, LP, u, d, n, T, C };
    }
    function nahoru() { Object.assign(s, { x: 0, v: 0, jede: false, drzi: false, dojelo: false }); }
    M.nahoru = nahoru;

    function krok(dt) {
      if (!s.jede) return;
      kroky(dt, 1 / 400, h => {
        const f = sily();
        if (s.v <= 1e-9 && f.Fr <= f.Tmax) { s.v = 0; s.jede = false; s.drzi = true; return false; }
        s.v += f.zr * h;
        if (s.v <= 0) { s.v = 0; s.jede = false; s.drzi = true; return false; }
        s.x += s.v * h;
        if (s.x > 0.02) s.rozjel = true;
        if (s.x >= DELKA) { s.x = DELKA; s.jede = false; s.dojelo = true; return false; }
      });
    }
    M.krok = krok;
    M.bezi = () => s.jede;
    M.pust = () => { if (s.x > 0 || s.dojelo || s.drzi) nahoru(); s.jede = true; Animace.spust(); m.naplanuj(); };
    M.simuluj = t => { kroky(t, 0.02, d => krok(d)); m.vykresli(); };
    Animace.pridej(m, krok, M.bezi);

    $('#rov-pustit').addEventListener('click', M.pust);
    const sklonPos = posuvnik('rov-sklon', v => v + '°', v => { s.alfa = v; nahoru(); m.naplanuj(); });
    const hmotPos = posuvnik('rov-hmotnost', v => v + ' kg', v => { s.m = v; nahoru(); m.naplanuj(); });
    const povrch = segment($('#rov-povrch'), s.povrch, v => { s.povrch = v; nahoru(); m.naplanuj(); });
    prepinac('rov-rozklad', c => { s.rozklad = c; m.naplanuj(); });
    const mezCb = prepinac('rov-mez', c => { s.mez = c; m.naplanuj(); });
    $('#rov-reset').addEventListener('click', () => { nahoru(); m.naplanuj(); });
    const nastavSklon = v => { v = omez(Math.round(v), 0, 60); if (v !== s.alfa) { s.alfa = v; nahoru(); } sklonPos.ukaz(v); };
    m.uchop({
      popis: 'Vrchol svahu – mění sklon',
      poloha: () => geometrie().T,
      tahni: p => nastavSklon(Math.atan2(P0[1] - p[1], p[0] - P0[0]) / RAD),
      klavesa: (dx, dy) => nastavSklon(s.alfa + dx - dy),
      hodnota: () => 'sklon ' + s.alfa + '°',
    });
    M.nastav = z => {
      if ('alfa' in z) sklonPos.ukaz(z.alfa);
      if ('m' in z) hmotPos.ukaz(z.m);
      if ('povrch' in z) povrch(z.povrch);
      if ('mez' in z) mezCb.checked = z.mez;
      Object.assign(s, z);
      m.vykresli();
    };

    m.kresli = g => {
      const k = m.k, f = sily(), q = geometrie();
      const { T, u, d, n, C, LP, a } = q;
      cara(g, [[10, P0[1]], [890, P0[1]]], 'tenka c-slabe');
      mnohouhelnik(g, [P0, T, [T[0], P0[1]]], 'klin');
      mnohouhelnik(g, [P0, T, [T[0] - n[0] * 7, T[1] - n[1] * 7], [P0[0] - n[0] * 7, P0[1] - n[1] * 7]], 'povrch-' + s.povrch);
      // úhel sklonu
      if (s.alfa > 0) sv('path', { d: `M${P0[0] + 62} ${P0[1]}A62 62 0 0 0 ${r1(P0[0] + 62 * Math.cos(a))} ${r1(P0[1] - 62 * Math.sin(a))}`, class: 'oblouk-uhlu' }, g);
      if (s.alfa >= 10) txt(g, P0[0] + 84 * Math.cos(a / 2) + 4, P0[1] - 84 * Math.sin(a / 2) + 5, 'α = ' + s.alfa + '°', 't-silny');
      else txt(g, P0[0] + 70, P0[1] + 24, 'α = ' + s.alfa + '°', 't-silny');
      // mezní úhel
      if (s.mez) {
        const am = M.mez() * RAD, dm = LP * 0.72;
        sv('path', { d: dCesta([P0, [P0[0] + dm * Math.cos(am), P0[1] - dm * Math.sin(am)]]), class: 'mez' }, g);
        txt(g, P0[0] + (dm + 8) * Math.cos(am), P0[1] - (dm + 8) * Math.sin(am), 'mezní úhel ' + cisK(M.mez(), 0) + '°', 't-mez');
      }
      // kvádr
      const b1 = [C[0] + d[0] * HW, C[1] + d[1] * HW], b2 = [C[0] - d[0] * HW, C[1] - d[1] * HW];
      const b3 = [b2[0] + n[0] * HH, b2[1] + n[1] * HH], b4 = [b1[0] + n[0] * HH, b1[1] + n[1] * HH];
      mnohouhelnik(g, [b1, b2, b3, b4], 'bedna');
      const K = [C[0] + n[0] * HH / 2, C[1] + n[1] * HH / 2];
      // síly: tíha má vždy stejnou délku, ostatní ve stejném měřítku
      const sk = LF / f.Fg;
      if (s.rozklad && s.alfa > 0) {
        const vr = [d[0] * f.Fr * sk, d[1] * f.Fr * sk], vk = [-n[0] * f.Fk * sk, -n[1] * f.Fk * sk];
        const kon = [K[0], K[1] + LF];
        cara(g, [[K[0] + vr[0], K[1] + vr[1]], kon], 'tenka carkovana c-slozka');
        cara(g, [[K[0] + vk[0], K[1] + vk[1]], kon], 'tenka carkovana c-slozka');
        const r = 11;
        sv('path', { d: dCesta([[K[0] + d[0] * r, K[1] + d[1] * r], [K[0] + d[0] * r - n[0] * r, K[1] + d[1] * r - n[1] * r], [K[0] - n[0] * r, K[1] - n[1] * r]]), class: 'pravy-uhel' }, g);
        sipka(g, K, vr, 'slozka c-slozka', k, 'F_{∥}', { odsad: 12 });
        sipka(g, K, vk, 'slozka c-slozka', k, 'F_{⊥}', { odsad: -12 });
      }
      sipka(g, K, [0, LF], 'c-tiha', k, 'F_{G}');
      const Cp = [C[0] - u[0] * 14, C[1] - u[1] * 14];
      sipka(g, Cp, [n[0] * f.Fk * sk, n[1] * f.Fk * sk], 'c-podlozka', k, 'F_{p}');
      if (f.Ft > 0.01) {
        const Ct = [C[0] + n[0] * 3, C[1] + n[1] * 3];
        sipka(g, Ct, [u[0] * f.Ft * sk, u[1] * f.Ft * sk], 'c-treni', k, 'F_{t}', { odsad: -12 });
      }
      if (s.v > 0.02) {
        const V = [K[0] + n[0] * (HH / 2 + 34), K[1] + n[1] * (HH / 2 + 34)];
        sipka(g, V, [d[0] * s.v * 22, d[1] * s.v * 22], 'c-rychlost', k, 'v');
      }

      m.odecet([
        ['Sklon', s.alfa + '°'],
        ['Tíha F<sub>G</sub>', cisK(f.Fg) + ' N'],
        ['F<sub>∥</sub> podél svahu', cisK(f.Fr) + ' N'],
        ['F<sub>⊥</sub> do podložky', cisK(f.Fk) + ' N'],
        ['Tření nejvýš', cisK(f.Tmax) + ' N'],
        ['Rychlost', cis(s.v, 2) + ' m/s'],
      ]);
      let z;
      if (s.alfa === 0) z = 'Rovina je vodorovná: celá tíha tlačí do podložky a nic kvádr netáhne podél ní.';
      else if (s.dojelo) z = `Kvádr sjel celé 4 metry a dole jede rychlostí <b>${cis(s.v, 1)} m/s</b>. Čím větší sklon a menší tření, tím rychleji.`;
      else if (f.Fr <= f.Tmax) z = `<span class="pozor">Kvádr drží.</span> Tření ho udrží silou až ${cisK(f.Tmax)} N a dolů po svahu ho táhne jen ${cisK(f.Fr)} N.` +
        (s.mez ? '' : ' Zvětšuj sklon.');
      else if (s.jede || s.v > 0) z = `Tah dolů po svahu (${cisK(f.Fr)} N) přemohl tření (${cisK(f.Tmax)} N). Výsledná síla ${cisK(f.Fr - f.Tmax)} N kvádr <b>zrychluje</b>.`;
      else z = `Tah dolů po svahu (${cisK(f.Fr)} N) je větší než největší tření (${cisK(f.Tmax)} N). Po puštění se kvádr rozjede – stiskni <b>▶️ Pustit</b>.`;
      m.zpravu(z);
    };

    Ukoly.definuj('rov-45', () => s.rozklad && s.alfa === 45,
      'Při sklonu <b>45°</b> jsou obě složky stejně velké. Pod 45° tíha víc tlačí do podložky, nad 45° víc táhne dolů po svahu. Na svislé stěně (90°) by celá tíha táhla dolů a do podložky by netlačila vůbec.');
    Ukoly.definuj('rov-mez', () => s.povrch === 'guma' && s.alfa === 39 && s.rozjel && !s.mez,
      'Při 38° guma kvádr ještě udrží, při <b>39°</b> se rozjede – zpočátku velmi pomalu, protože tah dolů jen o kousek převáží tření. Mezní úhel pro gumu (<i>f</i> = 0,8) je asi 38,7°.');
    predpoved('rov-tezsi', {
      otazka: 'Kvádr o hmotnosti 2 kg se na dřevěném svahu rozjede při sklonu asi 17°. Při jakém sklonu se rozjede kvádr <b>dvakrát těžší</b> (4 kg)?',
      moznosti: ['Při menším sklonu – je těžší, víc ho to táhne dolů.', 'Při stejném sklonu, asi 17°.', 'Až při větším sklonu – těžší kvádr víc tře.'],
      spravna: 1,
      proc: ['Těžšímu kvádru opravdu vzroste tah dolů po svahu. Stejně tolikrát ale vzroste i přítlak do podložky, a tím i tření.', null,
        'Tření opravdu vzroste. Stejně tolikrát ale vzroste i tah dolů po svahu.'],
      vyzkousej: 'Nastav podložku <b>dřevo</b> a hmotnost aspoň <b>4 kg</b>. Zvětšuj sklon po jednom stupni a pokaždé stiskni ▶️ Pustit, dokud se kvádr nerozjede.',
      splneno: () => s.povrch === 'drevo' && s.m >= 4 && s.rozjel && s.alfa <= 18,
      vysvetleni: 'Tah dolů po svahu i tření jsou úměrné tíze. Když tíhu zdvojnásobíš, zdvojnásobí se obě síly a jejich poměr zůstane stejný. Mezní úhel proto <b>nezávisí na hmotnosti</b>, jen na tom, jak moc povrchy třou.',
    });
  }

  /* ---------------- 3. U-rampa: polohová a pohybová energie ---------------- */
  const RAMPY = { zadne: 0, male: 0.12, velke: 0.5 };   // útlum v 1/s (tření + odpor vzduchu)
  function modelRampa() {
    const m = new Model('obr-rampa', 900, 390);
    const O = [330, 345], PX = 95, XM = 3.2, HB = 220, RX = 668;
    const hx = x => x * x / 4;                           // tvar rampy: h = x² / 4 (v metrech)
    const s = { m: 1, treni: 'zadne', xs: -2 * Math.SQRT2, x: 0, v: 0, bezi: false, vmax: 0, stopa: [], dalsiStopa: 0, t: 0,
      prejel: false, hDruha: 0, obratDruha: false, konec: false, pomalu: false };
    s.x = s.xs;
    const M = { m, s };
    MODELY.rampa = M;
    const h0 = () => hx(s.xs);
    const E0 = () => s.m * G * h0();
    function energie() {
      const h = hx(s.x), Ep = s.m * G * h, Ek = 0.5 * s.m * s.v * s.v, e0 = E0();
      return { h, Ep, Ek, Q: Math.max(0, e0 - Ep - Ek), E0: e0 };
    }
    M.energie = energie;
    M.h0 = h0;
    function naStart() {
      Object.assign(s, { x: s.xs, v: 0, bezi: false, vmax: 0, stopa: [], dalsiStopa: 0, t: 0, prejel: false, hDruha: 0, obratDruha: false, konec: false });
    }
    M.naStart = naStart;

    function krok(dt) {
      if (!s.bezi) return;
      const c = RAMPY[s.treni], H0 = h0(), strana = Math.sign(s.xs) || -1;
      kroky(dt * (s.pomalu ? 0.25 : 1), 1 / 1000, h => {
        const hp = s.x / 2, q = Math.sqrt(1 + hp * hp);
        s.v += (-G * hp / q - c * s.v) * h;
        s.x += s.v / q * h;
        const hh = hx(s.x);
        if (c === 0) {
          // bez tření srovnáme rychlost se zákonem zachování – malé chyby výpočtu by jinak narůstaly
          if (hh >= H0) { s.x = Math.sign(s.x) * 2 * Math.sqrt(H0); s.v = 0; }
          else if (s.v !== 0) s.v = Math.sign(s.v) * Math.sqrt(2 * G * (H0 - hh));
        }
        s.t += h;
        s.vmax = Math.max(s.vmax, Math.abs(s.v));
        if (!s.prejel && Math.sign(s.x) === -strana) s.prejel = true;
        if (s.prejel && Math.sign(s.x) === -strana) {
          s.hDruha = Math.max(s.hDruha, hx(s.x));
          if (s.v * strana >= 0) s.obratDruha = true;     // na druhé straně se zastavila a vrací se
        }
        if (s.t >= s.dalsiStopa) { s.stopa.push(s.x); if (s.stopa.length > 70) s.stopa.shift(); s.dalsiStopa = s.t + 0.03; }
        if (c > 0 && s.m * G * hx(s.x) + 0.5 * s.m * s.v * s.v < 0.004 * E0()) {
          s.x = 0; s.v = 0; s.bezi = false; s.konec = true; return false;
        }
      });
    }
    M.krok = krok;
    M.bezi = () => s.bezi;
    M.pust = () => { if (s.konec) naStart(); s.bezi = true; Animace.spust(); m.naplanuj(); };
    M.simuluj = t => { kroky(t, 0.02, d => krok(d)); m.vykresli(); };
    Animace.pridej(m, krok, M.bezi);

    const pust = $('#ram-pustit');
    pust.addEventListener('click', () => { if (s.bezi) { s.bezi = false; m.naplanuj(); } else M.pust(); });
    const vyskaPos = posuvnik('ram-vyska', v => cisK(v, 1) + ' m', v => { s.xs = (Math.sign(s.xs) || -1) * 2 * Math.sqrt(v); naStart(); m.naplanuj(); });
    const hmotPos = posuvnik('ram-hmotnost', v => cisK(v, 1) + ' kg', v => { s.m = v; m.naplanuj(); });
    const treni = segment($('#ram-treni'), s.treni, v => { s.treni = v; naStart(); m.naplanuj(); });
    prepinac('ram-pomalu', c => { s.pomalu = c; });
    $('#ram-reset').addEventListener('click', () => { naStart(); m.naplanuj(); });
    const nastavStart = x => {
      x = omez(x, -XM + 0.02, XM - 0.02);
      if (Math.abs(x) < 0.3) x = (Math.sign(x) || -1) * 0.3;
      s.xs = x; naStart();
      vyskaPos.ukaz(Math.round(h0() * 10) / 10);
    };
    const X = x => O[0] + x * PX, Y = h => O[1] - h * PX;
    const kulicka = x => {
      const n = Math.hypot(x / 2, 1);
      return [X(x) + (-x / 2) / n * 15, Y(hx(x)) - 1 / n * 15];
    };
    m.uchop({
      popis: 'Kulička – místo startu',
      poloha: () => (s.bezi ? null : kulicka(s.x)),
      tahni: p => nastavStart((p[0] - O[0]) / PX),
      klavesa: dx => nastavStart(s.xs + dx * 0.05),
      hodnota: () => 'výška startu ' + cis(h0(), 2) + ' m',
    });
    M.nastav = z => {
      if ('h' in z) { s.xs = (Math.sign(s.xs) || -1) * 2 * Math.sqrt(z.h); vyskaPos.ukaz(z.h); delete z.h; }
      if ('m' in z) hmotPos.ukaz(z.m);
      if ('treni' in z) treni(z.treni);
      Object.assign(s, z);
      naStart();
      m.vykresli();
    };
    $('#ram-priklad-model').addEventListener('click', () => {
      M.nastav({ m: 0.5, h: 1.8, treni: 'zadne' });
      document.getElementById('obr-rampa').scrollIntoView({ block: 'center', behavior: bezPohybu() ? 'auto' : 'smooth' });
      setTimeout(M.pust, 500);
    });

    m.kresli = g => {
      const k = m.k, e = energie(), H0 = h0();
      if (pust.dataset.stav !== String(s.bezi)) {
        pust.dataset.stav = String(s.bezi);
        pust.textContent = s.bezi ? '✋ Zastavit' : '▶️ Pustit';
        pust.classList.toggle('hlavni', !s.bezi);
      }
      // rampa
      const pts = [];
      for (let i = 0; i <= 80; i++) { const x = -XM + 2 * XM * i / 80; pts.push([X(x), Y(hx(x))]); }
      mnohouhelnik(g, [...pts, [X(XM), O[1] + 18], [X(-XM), O[1] + 18]], 'rampa-plocha');
      sv('path', { d: dCesta(pts), class: 'rampa-hrana' }, g);
      // pravítko výšky
      cara(g, [[RX, Y(0)], [RX, Y(2.5)]], 'tenka c-text');
      for (let h = 0; h <= 2.5 + 1e-9; h += 0.5) {
        cara(g, [[RX - 5, Y(h)], [RX + 5, Y(h)]], 'tenka c-text');
        txt(g, RX + 9, Y(h) + 4, cisK(h, 1) + ' m', 't-maly');
      }
      // výška startu
      const xh = 2 * Math.sqrt(H0);
      const sg = sv('g', { class: 'c-ep' }, g);
      cara(sg, [[X(-xh) - 16, Y(H0)], [Math.max(X(xh) + 16, RX - 8), Y(H0)]], 'tenka carkovana');
      txt(sg, X(0), Y(H0) - 8, 'výška startu ' + cisK(H0, 2) + ' m', 't-maly t-barva t-stred');
      // stopa a kulička
      if (s.stopa.length > 1) sv('path', { d: dCesta(s.stopa.map(kulicka)), class: 'stopa c-rychlost' }, g);
      const B = kulicka(s.x);
      cara(g, [[B[0], Y(e.h)], [RX, Y(e.h)]], 'teckovana c-text');
      if (Math.abs(s.x) > 0.05) txt(g, RX - 8, Y(e.h) - 6, 'h = ' + cis(e.h, 2) + ' m', 't-maly t-konec');
      sv('circle', { cx: r1(B[0]), cy: r1(B[1]), r: 15, class: 'kulicka' }, g);
      sv('circle', { cx: r1(B[0] - 5), cy: r1(B[1] - 5), r: 4, class: 'kulicka-lesk' }, g);
      if (Math.abs(s.v) > 0.05) {
        const n = Math.hypot(1, s.x / 2), sm = Math.sign(s.v);
        const L = Math.abs(s.v) * 14;
        sipka(g, B, [sm / n * L, sm * (-s.x / 2) / n * L], 'c-rychlost', k, 'v = ' + cis(Math.abs(s.v), 1) + ' m/s', { dal: 30 });
      }
      // sloupce energie
      const sc = HB / (s.m * G * 2.5);
      const sl = [['E_{p}', e.Ep, 'c-ep'], ['E_{k}', e.Ek, 'c-ek'], ['teplo', e.Q, 'c-teplo']];
      const BX0 = 722, BW = 34, KR = 42;
      txt(g, BX0 + 2 * KR - 4, Y(0) - HB - 22, 'Energie', 't-silny t-stred');
      cara(g, [[BX0 - 6, Y(0)], [BX0 + 4 * KR, Y(0)]], 'tenka c-text');
      cara(g, [[BX0 - 6, Y(0) - e.E0 * sc], [BX0 + 4 * KR, Y(0) - e.E0 * sc]], 'teckovana c-celkem');
      sl.forEach(([n, E, cls], i) => {
        const x = BX0 + i * KR, hgt = E * sc;
        const gg = sv('g', { class: cls }, g);
        sv('rect', { x, y: r1(Y(0) - hgt), width: BW, height: r1(Math.max(0, hgt)), class: 'sloupec' }, gg);
        popis(gg, x + BW / 2, Y(0) + 16, n, 't-maly t-stred t-barva');
        txt(gg, x + BW / 2, Y(0) - hgt - 6, cisK(E, 1), 't-maly t-stred t-barva');
      });
      // celkem: tři druhy energie na sobě
      const xc = BX0 + 3 * KR;
      let y = Y(0);
      for (const [, E, cls] of sl) {
        const hgt = E * sc;
        if (hgt > 0.2) sv('rect', { x: xc, y: r1(y - hgt), width: BW, height: r1(hgt), class: 'sloupec ' + cls }, g);
        y -= hgt;
      }
      sv('rect', { x: xc, y: r1(Y(0) - e.E0 * sc), width: BW, height: r1(e.E0 * sc), class: 'sloupec-ram' }, g);
      const cg = sv('g', { class: 'c-celkem' }, g);
      txt(cg, xc + BW / 2, Y(0) + 16, 'celkem', 't-maly t-stred t-barva');
      txt(cg, xc + BW / 2, Y(0) - e.E0 * sc - 6, cisK(e.E0, 1), 't-maly t-stred t-barva');
      txt(g, BX0 + 2 * KR - 4, Y(0) + 32, 'v joulech (J)', 't-maly t-stred');

      m.odecet([
        ['Výška', cis(e.h, 2) + ' m'],
        ['Rychlost', cis(Math.abs(s.v), 2) + ' m/s'],
        ['E<sub>p</sub> = m·g·h', cisK(e.Ep, 1) + ' J'],
        ['E<sub>k</sub> = ½·m·v²', cisK(e.Ek, 1) + ' J'],
        ['Teplo', cisK(e.Q, 1) + ' J'],
        ['Celkem', cisK(e.E0, 1) + ' J'],
      ]);
      let z;
      const c = RAMPY[s.treni];
      if (s.konec) z = `Kulička zůstala ležet dole. Celá její energie (${cisK(e.E0, 1)} J) se třením změnila na <b>teplo</b>.`;
      else if (!s.bezi && s.t === 0) z = `Kulička stojí ve výšce ${cis(H0, 2)} m. Má polohovou energii E<sub>p</sub> = m · g · h = ${cisK(e.Ep, 1)} J, pohybovou žádnou. Pusť ji.`;
      else if (!s.bezi) z = 'Model stojí. Pokračuj tlačítkem ▶️ Pustit.';
      else {
        if (Math.abs(s.x) < 0.3) z = c === 0 ? 'Dno rampy: výška je nulová a všechna energie je teď pohybová – kulička je <b>nejrychlejší</b>.' : 'Dno rampy: polohová energie se skoro celá změnila na pohybovou.';
        else if (Math.abs(s.v) < 0.5) z = 'Krajní poloha: kulička se na okamžik zastavila a její energie je zase <b>polohová</b>.';
        else if (s.x * s.v < 0) z = 'Cestou dolů ubývá polohové energie a stejně tolik přibývá pohybové.';
        else z = 'Cestou nahoru se pohybová energie mění zpátky na polohovou.';
        if (c > 0) z += ' Tření přitom průběžně mění část energie na <b>teplo</b> – sloupec „celkem“ ale zůstává stejně vysoký.';
      }
      m.zpravu(z);
    };

    Ukoly.definuj('ram-6', () => s.treni === 'zadne' && s.vmax >= 6 && h0() <= 1.95,
      'Stačí výška asi <b>1,84 m</b>. Dole je E<sub>k</sub> = E<sub>p</sub>, tedy ½ · m · v² = m · g · h, a z toho v = √(2 · g · h) = √(2 · 9,81 · 1,84) ≈ 6 m/s. Na hmotnosti nezáleží – zkus ji změnit.');
    Ukoly.definuj('ram-teplo', () => s.treni === 'velke' && E0() > 0.3 && energie().Q >= 0.97 * E0(),
      'Energie nezmizela: třením a odporem vzduchu se změnila na <b>teplo</b>. Kulička, rampa i vzduch se nepatrně ohřály. Sloupec „celkem“ měl po celou dobu stejnou výšku – to je zákon zachování energie.');
    predpoved('ram-vyska', {
      otazka: 'Kulička startuje bez tření z výšky <b>2 m</b> na levé straně rampy. Jak vysoko vyjede na pravé straně?',
      moznosti: ['Níž než 2 m – cestou ztratí energii.', 'Přesně do 2 m.', 'Výš než 2 m – dole nabere rychlost.'],
      spravna: 1,
      proc: ['Ztrácela by energii, jen kdyby ji něco brzdilo. Tady je tření vypnuté.', null,
        'Rychlost, kterou dole nabere, získala právě z výšky. Na větší výšku by energii musela odněkud vzít – energie ale nevzniká.'],
      vyzkousej: 'Nech tření <b>žádné</b>, výšku startu aspoň 1 m a pusť kuličku (▶️ Pustit). Sleduj, kam na pravé straně vyjede – čárkovaná čára ukazuje výšku startu.',
      splneno: () => s.treni === 'zadne' && h0() >= 1 && s.obratDruha,
      vysvetleni: 'Bez tření se energie jen přelévá: nahoře je všechna polohová, dole pohybová, na druhé straně zase polohová. Celková energie se nemění, a tak kulička vyjede <b>přesně do výšky startu</b>, zastaví se a vrací se.',
    });
  }

  /* ---------------- 4. Kyvadlo: doba kmitu, měření, graf ---------------- */
  const MISTA = { zeme: { g: 9.81, nazev: 'Země' }, mesic: { g: 1.62, nazev: 'Měsíc' }, mars: { g: 3.71, nazev: 'Mars' } };
  function modelKyvadlo() {
    const m = new Model('obr-kyvadlo', 900, 470);
    const PY = 58, PX = 170;
    const nove = (l, hm) => ({ l, m: hm, th: 0, w: 0, T: null, pruchody: [], pocet: 0, stopa: [], dalsiStopa: 0 });
    const s = { A: nove(1, 1), B: nove(1, 1), dve: false, uhel: 20, strana: 1, misto: 'zeme', odpor: false, sily: true, pusteno: false, t: 0, pomalu: false };
    const M = { m, s };
    MODELY.kyvadlo = M;
    const g0 = () => MISTA[s.misto].g;
    const osa = kyv => (s.dve ? (kyv === s.A ? 250 : 650) : 450);
    function naStart() {
      for (const kv of [s.A, s.B]) Object.assign(kv, { th: s.strana * s.uhel * RAD, w: 0, T: null, pruchody: [], pocet: 0, stopa: [], dalsiStopa: 0 });
      s.t = 0; s.pusteno = false;
    }
    M.naStart = naStart;
    const zr = (kv, th, w) => -(g0() / kv.l) * Math.sin(th) - (s.odpor ? 0.12 : 0) * w;
    /* Runge–Kutta 4. řádu; dobu kmitu měříme z průchodů nejnižším bodem
       (tři průchody = jeden celý kmit, okamžik průchodu se dopočítá lineárně). */
    function krokKyv(kv, h) {
      const a1 = zr(kv, kv.th, kv.w), v1 = kv.w;
      const v2 = kv.w + a1 * h / 2, a2 = zr(kv, kv.th + v1 * h / 2, v2);
      const v3 = kv.w + a2 * h / 2, a3 = zr(kv, kv.th + v2 * h / 2, v3);
      const v4 = kv.w + a3 * h, a4 = zr(kv, kv.th + v3 * h, v4);
      const th = kv.th + h / 6 * (v1 + 2 * v2 + 2 * v3 + v4);
      const w = kv.w + h / 6 * (a1 + 2 * a2 + 2 * a3 + a4);
      if (kv.th !== 0 && (kv.th < 0) !== (th < 0)) {
        kv.pruchody.push(s.t + h * kv.th / (kv.th - th));
        kv.pocet++;
        if (kv.pruchody.length > 3) kv.pruchody.shift();
        const p = kv.pruchody;
        if (p.length === 3) kv.T = p[2] - p[0];
      }
      kv.th = th; kv.w = w;
    }
    function krok(dt) {
      if (!s.pusteno) return;
      kroky(dt * (s.pomalu ? 0.25 : 1), 1 / 500, h => {
        krokKyv(s.A, h);
        if (s.dve) krokKyv(s.B, h);
        s.t += h;
        for (const kv of [s.A, s.B]) if (s.t >= kv.dalsiStopa) { kv.stopa.push(kv.th); if (kv.stopa.length > 50) kv.stopa.shift(); kv.dalsiStopa = s.t + 0.025; }
      });
    }
    M.krok = krok;
    M.bezi = () => s.pusteno;
    M.simuluj = t => { kroky(t, 0.02, d => krok(d)); m.vykresli(); };
    Animace.pridej(m, krok, M.bezi);

    /* ----- tabulka a graf měření ----- */
    const graf = new Model('obr-kyv-graf', 460, 300);
    M.graf = graf;
    function vykresliTabulku(nove = 0) {
      const d = Postup.data.mereni, sB = d.some(r => r.kyv === 'B');
      $('#kyv-tabulka tbody').innerHTML = d.map((r, i) =>
        `<tr${i >= d.length - nove ? ' class="nove"' : ''}><td>${i + 1}${sB ? ' · ' + r.kyv : ''}</td><td>${cis(r.l, 2)} m</td><td>${cis(r.m, 1)} kg</td><td>${r.uhel}°</td><td>${MISTA[r.misto] ? MISTA[r.misto].nazev : ''}</td><td><b>${cis(r.T, 2)} s</b></td></tr>`).join('');
      $('#kyv-tabulka-prazdna').hidden = d.length > 0;
      $('#kyv-smazat').hidden = !d.length;
    }
    function zapis() {
      const nove = [];
      for (const [kv, jm] of [[s.A, 'A'], [s.B, 'B']]) {
        if ((jm === 'B' && !s.dve) || !kv.T) continue;
        nove.push({ l: kv.l, m: kv.m, uhel: s.uhel, misto: s.misto, T: Math.round(kv.T * 1000) / 1000, kyv: jm });
      }
      if (!nove.length) return;
      Postup.data.mereni.push(...nove);
      while (Postup.data.mereni.length > 40) Postup.data.mereni.shift();
      Postup.uloz();
      vykresliTabulku(nove.length);
      graf.naplanuj();
    }
    M.zapis = zapis;
    const TRIDY = { zeme: 'c-celkem', mesic: 'c-hybnost', mars: 'c-teplo' };
    graf.kresli = g => {
      const d = Postup.data.mereni.filter(r => MISTA[r.misto]), k = graf.k;
      const OX = 58, OY = 254, SX = 180;
      const mista = [...new Set([...d.map(r => r.misto), s.misto])];
      const teor = (l, gg) => 2 * Math.PI * Math.sqrt(l / gg);
      const Tmax = Math.ceil(Math.max(3, ...d.map(r => r.T), ...mista.map(mi => teor(2, MISTA[mi].g))));
      const krokT = Tmax > 6 ? 2 : 1, SY = 224 / Tmax;
      const X = l => OX + l * SX, Y = T => OY - T * SY;
      for (let l = 0; l <= 2 + 1e-9; l += 0.5) {
        cara(g, [[X(l), OY], [X(l), Y(Tmax)]], 'tenka c-slabe', 'opacity:.35');
        txt(g, X(l), OY + 18, cisK(l, 1), 't-maly t-stred');
      }
      for (let T = 0; T <= Tmax; T += krokT) {
        cara(g, [[OX, Y(T)], [X(2), Y(T)]], 'tenka c-slabe', 'opacity:.35');
        txt(g, OX - 8, Y(T) + 4, String(T), 't-maly t-konec');
      }
      cara(g, [[OX, OY], [X(2.1), OY]], 'c-text');
      cara(g, [[OX, OY], [OX, Y(Tmax) - 8]], 'c-text');
      txt(g, X(2.1), OY + 34, 'délka l (m)', 't-maly t-konec');
      txt(g, OX + 8, Y(Tmax) - 2, 'doba kmitu T (s)', 't-maly');
      for (const mi of mista) {
        const pts = [];
        for (let i = 1; i <= 60; i++) { const l = 2 * i / 60; pts.push([X(l), Y(teor(l, MISTA[mi].g))]); }
        const gg = sv('g', { class: TRIDY[mi] }, g);
        cara(gg, pts, 'carkovana');
        txt(gg, X(2) - 4, Y(teor(2, MISTA[mi].g)) - 8, MISTA[mi].nazev, 't-maly t-konec t-barva');
      }
      for (const r of d) sv('circle', { cx: r1(X(r.l)), cy: r1(Y(r.T)), r: r1(6 * k), class: 'bod-mereni', fill: r.kyv === 'B' ? 'var(--h-b)' : 'var(--h-a)' }, g);
      if (!d.length) txt(g, X(1.05), Y(Tmax * 0.55), 'zatím žádné měření', 't-stred');
    };

    /* ----- ovládání ----- */
    const pust = $('#kyv-pustit'), zap = $('#kyv-zapsat');
    M.pust = () => { s.pusteno = true; Animace.spust(); m.naplanuj(); };
    pust.addEventListener('click', () => { if (s.pusteno) { s.pusteno = false; m.naplanuj(); } else M.pust(); });
    zap.addEventListener('click', zapis);
    const reset = () => { naStart(); m.naplanuj(); };
    const pos = {
      la: posuvnik('kyv-delka', v => cis(v, 2) + ' m', v => { s.A.l = v; reset(); }),
      ma: posuvnik('kyv-hmotnost', v => cis(v, 1) + ' kg', v => { s.A.m = v; reset(); }),
      uhel: posuvnik('kyv-uhel', v => v + '°', v => { s.uhel = v; reset(); }),
      lb: posuvnik('kyv-delka-b', v => cis(v, 2) + ' m', v => { s.B.l = v; reset(); }),
      mb: posuvnik('kyv-hmotnost-b', v => cis(v, 1) + ' kg', v => { s.B.m = v; reset(); }),
    };
    s.A.l = +pos.la.el.value; s.A.m = +pos.ma.el.value; s.uhel = +pos.uhel.el.value;
    s.B.l = +pos.lb.el.value; s.B.m = +pos.mb.el.value;
    const dveCb = prepinac('kyv-dve', c => { s.dve = c; $('#kyv-b').hidden = !c; reset(); });
    prepinac('kyv-odpor', c => { s.odpor = c; });
    prepinac('kyv-sily', c => { s.sily = c; m.naplanuj(); });
    prepinac('kyv-pomalu', c => { s.pomalu = c; });
    const misto = segment($('#kyv-misto'), s.misto, v => { s.misto = v; reset(); graf.naplanuj(); });
    $('#kyv-reset').addEventListener('click', reset);
    $('#kyv-b-jako-a').addEventListener('click', () => { s.B.l = s.A.l; s.B.m = s.A.m; pos.lb.ukaz(s.B.l); pos.mb.ukaz(s.B.m); reset(); });
    $('#kyv-smazat').addEventListener('click', () => { Postup.data.mereni.length = 0; Postup.uloz(); vykresliTabulku(); graf.naplanuj(); });
    document.addEventListener('hriste-znovu', () => { vykresliTabulku(); graf.naplanuj(); });
    vykresliTabulku();
    naStart();

    const zavazi = kv => {
      const L = kv.l * PX;
      return [osa(kv) + L * Math.sin(kv.th), PY + L * Math.cos(kv.th)];
    };
    const tahni = kv => p => {
      const dx = p[0] - osa(kv), dy = Math.max(1, p[1] - PY);
      const l = omez(Math.round(Math.hypot(dx, dy) / PX / 0.05) * 0.05, 0.2, 2);
      const a = Math.atan2(dx, dy) / RAD;
      kv.l = Math.round(l * 100) / 100;
      s.strana = a < 0 ? -1 : 1;
      s.uhel = omez(Math.round(Math.abs(a)), 5, 60);
      srovnej();
      naStart();
    };
    const klavesa = kv => (dx, dy) => {
      const a = s.strana * s.uhel + dx;
      s.strana = a < 0 ? -1 : 1;
      s.uhel = omez(Math.abs(a), 5, 60);
      kv.l = Math.round(omez(kv.l + dy * 0.05, 0.2, 2) * 100) / 100;
      srovnej();
      naStart();
    };
    function srovnej() { pos.la.ukaz(s.A.l); pos.lb.ukaz(s.B.l); pos.uhel.ukaz(s.uhel); pos.ma.ukaz(s.A.m); pos.mb.ukaz(s.B.m); }
    m.uchop({ popis: 'Závaží kyvadla A – výchylka a délka', poloha: () => zavazi(s.A), tahni: tahni(s.A), klavesa: klavesa(s.A),
      hodnota: () => `délka ${cis(s.A.l, 2)} m, výchylka ${s.uhel}°` });
    m.uchop({ popis: 'Závaží kyvadla B – výchylka a délka', poloha: () => (s.dve ? zavazi(s.B) : null), tahni: tahni(s.B), klavesa: klavesa(s.B),
      hodnota: () => `délka ${cis(s.B.l, 2)} m, výchylka ${s.uhel}°` });
    M.nastav = z => {
      if (z.A) Object.assign(s.A, z.A);
      if (z.B) Object.assign(s.B, z.B);
      for (const k of ['uhel', 'misto', 'odpor', 'sily', 'strana']) if (k in z) s[k] = z[k];
      if ('dve' in z) { s.dve = z.dve; dveCb.checked = z.dve; $('#kyv-b').hidden = !z.dve; }
      if ('misto' in z) misto(z.misto);
      srovnej();
      naStart();
      m.vykresli(); graf.vykresli();
    };

    m.kresli = g => {
      const k = m.k;
      if (pust.dataset.stav !== String(s.pusteno)) {
        pust.dataset.stav = String(s.pusteno);
        pust.textContent = s.pusteno ? '✋ Zastavit' : '▶️ Pustit';
        pust.classList.toggle('hlavni', !s.pusteno);
      }
      zap.disabled = !s.A.T;
      txt(g, 18, 28, '⏱ ' + cis(s.t, 1) + ' s', 't-velky');
      txt(g, 18, 48, MISTA[s.misto].nazev + ': g = ' + cisK(g0(), 2) + ' N/kg', 't-maly');
      const kresliJedno = (kv, jm, cls) => {
        const cx = osa(kv), L = kv.l * PX, th0 = s.uhel * RAD;
        const poz = th => [cx + L * Math.sin(th), PY + L * Math.cos(th)];
        cara(g, [[cx - 34, PY], [cx + 34, PY]], 'silna c-text');
        for (let i = -32; i <= 26; i += 8) cara(g, [[cx + i, PY], [cx + i + 6, PY - 7]], 'tenka c-slabe');
        cara(g, [[cx, PY], [cx, PY + L + 22]], 'tenka carkovana c-slabe');
        const obl = [];
        for (let i = 0; i <= 32; i++) obl.push(poz(-th0 + 2 * th0 * i / 32));
        cara(g, obl, 'teckovana c-slabe');
        if (kv.stopa.length > 1) sv('path', { d: dCesta(kv.stopa.map(poz)), class: 'stopa ' + cls }, g);
        const B = poz(kv.th), r = 8 + 6 * Math.cbrt(kv.m);
        // úhel od svislice
        const rO = Math.min(50, L * 0.45);
        const ob = [];
        for (let i = 0; i <= 16; i++) { const t = kv.th * i / 16; ob.push([cx + rO * Math.sin(t), PY + rO * Math.cos(t)]); }
        if (Math.abs(kv.th) > 0.02) cara(g, ob, 'tenka c-text');
        const ukazUhel = Math.abs(kv.th) > 0.5 * RAD;
        let uP = kv.th / 2;
        const lp = [cx + (rO + 16) * Math.sin(uP), PY + (rO + 16) * Math.cos(uP)];
        if (Math.hypot(lp[0] - B[0], lp[1] - B[1]) < r + 18) uP = -kv.th / 2;
        if (ukazUhel) txt(g, cx + (rO + 16) * Math.sin(uP), PY + (rO + 16) * Math.cos(uP) + 4, cisK(Math.abs(kv.th) / RAD, 0) + '°', 't-maly t-stred');
        cara(g, [[cx, PY], B], 'c-text');
        sv('circle', { cx: r1(B[0]), cy: r1(B[1]), r: r1(r), class: kv === s.A ? 'zavazi-a' : 'zavazi-b' }, g);
        if (s.sily) {
          const FL = 12 + 9 * kv.m, t = [Math.cos(kv.th), -Math.sin(kv.th)];
          sipka(g, B, [0, FL + r], 'c-tiha', k, 'F_{G}', { odsad: 12 });
          const Fr = -(FL + r) * Math.sin(kv.th);
          sipka(g, B, [t[0] * Fr, t[1] * Fr], 'slozka c-slozka', k, 'F_{∥}', { odsad: -12 });
          const rad = [Math.sin(kv.th), Math.cos(kv.th)], V = [B[0] + rad[0] * (r + 12), B[1] + rad[1] * (r + 12)];
          const v = kv.w * kv.l * 30;
          sipka(g, V, [t[0] * v, t[1] * v], 'c-rychlost', k, 'v');
        }
        const pg = sv('g', { class: cls }, g);
        txt(pg, cx, PY - 18, jm + ' · ' + cis(kv.l, 2) + ' m · ' + cis(kv.m, 1) + ' kg', 't-maly t-stred t-barva');
      };
      kresliJedno(s.A, s.dve ? 'A' : 'kyvadlo', 'c-a');
      if (s.dve) kresliJedno(s.B, 'B', 'c-b');

      const mereno = kv => (kv.T ? cis(kv.T, 2) + ' s' : s.pusteno ? 'měřím…' : '–');
      m.odecet([
        ['g', cisK(g0(), 2) + ' N/kg'],
        [s.dve ? 'Doba kmitu A' : 'Doba kmitu', mereno(s.A)],
        s.dve ? ['Doba kmitu B', mereno(s.B)] : null,
        ['Počet kmitů', String(Math.floor(s.A.pocet / 2))],
        ['Rychlost' + (s.dve ? ' A' : ''), cis(Math.abs(s.A.w) * s.A.l, 2) + ' m/s'],
      ]);
      let z;
      if (!s.pusteno && !s.A.T) z = `Kyvadlo je vychýlené o ${s.uhel}° a čeká. Nastav délku, hmotnost nebo výchylku a pusť ho.`;
      else if (!s.pusteno) z = 'Kyvadlo stojí. ▶️ Pustit pokračuje, ↺ ho vrátí do výchylky.';
      else if (!s.A.T || (s.dve && !s.B.T)) z = 'Měřím dobu kmitu – kyvadlo musí aspoň třikrát projít nejnižším bodem.';
      else if (s.dve) {
        const rozdil = s.B.T - s.A.T;
        if (Math.abs(rozdil) < 0.015) z = `Obě kyvadla kmitají <b>stejně</b> (T = ${cis(s.A.T, 2)} s)` + (s.A.m !== s.B.m && s.A.l === s.B.l ? ', i když mají různou hmotnost.' : '.');
        else z = `Kyvadlo ${rozdil > 0 ? 'B' : 'A'} kmitá pomaleji (má delší dobu kmitu).` + (s.A.l !== s.B.l ? ' Rozhoduje délka závěsu.' : '');
      } else z = `Doba kmitu je <b>${cis(s.A.T, 2)} s</b>. Zapiš ji do tabulky (📝) a zkus jinou délku.`;
      m.zpravu(z);
    };

    Ukoly.definuj('kyv-tabulka', () => new Set(Postup.data.mereni.map(r => Number(r.l).toFixed(2))).size >= 3,
      'Body v grafu leží na křivce, která stoupá čím dál pomaleji: doba kmitu roste s délkou, ale ne přímo úměrně. Čtyřikrát delší kyvadlo kmitá jen dvakrát pomaleji.');
    Ukoly.definuj('kyv-sekundove', () => s.misto === 'zeme' && s.A.T && Math.abs(s.A.T - 2) < 0.05,
      'Kyvadlo s dobou kmitu 2 s je dlouhé asi <b>1 metr</b> (přesně 0,99 m). Říká se mu <b>sekundové kyvadlo</b>, protože každý kyv tam nebo zpět trvá sekundu. Kyvadlové hodiny s ním odměřují čas.');
    Ukoly.definuj('kyv-mesic', () => s.misto === 'mesic' && s.A.T,
      'Na Měsíci kmitá kyvadlo asi <b>2,5krát pomaleji</b>. Tíha ho tam táhne zpět šestkrát slaběji, a tak se vrací pomaleji. Kyvadlové hodiny by na Měsíci šly hodně pozadu.');
    predpoved('kyv-hmotnost', {
      otazka: 'Dvě kyvadla mají stejně dlouhý závěs. Kyvadlo B má ale <b>čtyřikrát těžší</b> závaží. Které bude kmitat rychleji (bude mít kratší dobu kmitu)?',
      moznosti: ['Těžší kyvadlo B.', 'Lehčí kyvadlo A.', 'Obě stejně.'],
      spravna: 2,
      proc: ['Na těžší závaží sice působí větší tíha, ale zároveň se hůř rozpohybuje (má větší setrvačnost). Obojí roste stejně.',
        'Lehčí závaží se snáz rozpohybuje, ale působí na něj i menší tíha. Účinky se vyrovnají.', null],
      vyzkousej: 'Zapni <b>🪀🪀 Druhé kyvadlo</b>, dej oběma stejnou délku a kyvadlu B aspoň <b>čtyřikrát větší hmotnost</b> než A. Pusť je a počkej, až model změří obě doby kmitu.',
      splneno: () => s.dve && Math.abs(s.A.l - s.B.l) < 1e-9 && s.B.m >= 4 * s.A.m - 1e-9 && s.A.T && s.B.T,
      vysvetleni: 'Obě kyvadla kmitají <b>stejně</b>. Těžší závaží táhne tíha silněji, ale stejně tolikrát hůř se rozpohybuje. Doba kmitu proto na hmotnosti nezávisí – jen na délce závěsu a na g.',
    });
    predpoved('kyv-delka', {
      otazka: 'Kyvadlo s délkou <b>0,5 m</b> má dobu kmitu asi 1,4 s. Jakou dobu kmitu bude mít kyvadlo <b>čtyřikrát delší</b> (2 m)?',
      moznosti: ['Asi 2,8 s – dvakrát delší.', 'Asi 5,7 s – čtyřikrát delší.', 'Stejnou, asi 1,4 s.'],
      spravna: 0,
      proc: [null, 'Doba kmitu s délkou roste, ale pomaleji než délka – s její druhou odmocninou. √4 = 2.',
        'Délka na dobu kmitu vliv má: houpačka na dlouhých lanech se houpe pomaleji než na krátkých.'],
      vyzkousej: 'Na Zemi nastav délku <b>2,00 m</b> (posuvníkem nebo tažením závaží) a pusť kyvadlo. Počkej na změřenou dobu kmitu.',
      splneno: () => s.misto === 'zeme' && Math.abs(s.A.l - 2) < 1e-9 && s.A.T,
      vysvetleni: 'Doba kmitu roste s <b>druhou odmocninou</b> délky: čtyřikrát delší kyvadlo kmitá dvakrát pomaleji. Pro 2 m model naměří asi 2,8 s.',
    });
  }

  /* ---------------- 5. Srážky vozíků: hybnost a energie ---------------- */
  const NARAZNIKY = { pruzna: { e: 1, px: 22 }, castecna: { e: 0.5, px: 10 }, nepruzna: { e: 0, px: 6 } };
  const PRESETY_SRAZKY = {
    kulecnik: { m1: 1, u1: 2, m2: 1, u2: 0, typ: 'pruzna' },
    tezky: { m1: 4, u1: 2, m2: 1, u2: 0, typ: 'pruzna' },
    lehky: { m1: 0.5, u1: 2, m2: 4, u2: 0, typ: 'pruzna' },
    celne: { m1: 1, u1: 2, m2: 1, u2: -1, typ: 'castecna' },
  };
  function modelSrazka() {
    const m = new Model('obr-srazka', 900, 340);
    const PX = 90, X0 = 45, DELKA = 9, RY = 258;
    const s = { m1: 1, m2: 1, u1: 2, u2: 0, typ: 'pruzna', x1: 2.4, x2: 6, v1: 2, v2: 0, bezi: false, srazilo: false, pred: null, po: null, konec: false, pomalu: false, t: 0 };
    const M = { m, s };
    MODELY.srazka = M;
    const sirka = hm => 64 + 10 * hm, vyska = hm => 24 + 7 * hm;
    const hw = hm => sirka(hm) / 2 / PX;
    function naStart() {
      Object.assign(s, { x1: 2.4, x2: 6, v1: s.u1, v2: s.u2, bezi: false, srazilo: false, po: null, konec: false, t: 0 });
      s.pred = { v1: s.u1, v2: s.u2, p: s.m1 * s.u1 + s.m2 * s.u2, E: 0.5 * s.m1 * s.u1 ** 2 + 0.5 * s.m2 * s.u2 ** 2 };
    }
    M.naStart = naStart;
    naStart();
    function krok(dt) {
      if (!s.bezi) return;
      kroky(dt * (s.pomalu ? 0.25 : 1), 1 / 500, h => {
        s.x1 += s.v1 * h; s.x2 += s.v2 * h; s.t += h;
        const dotyk = hw(s.m1) + hw(s.m2) + NARAZNIKY[s.typ].px / PX;
        if (s.x2 - s.x1 <= dotyk && s.v1 > s.v2 + 1e-9) {
          // srážka se součinitelem restituce e (1 pružná, 0 dokonale nepružná)
          const { m1, m2 } = s, e = NARAZNIKY[s.typ].e, a = s.v1, b = s.v2, p = m1 * a + m2 * b;
          s.v1 = (p + m2 * e * (b - a)) / (m1 + m2);
          s.v2 = (p + m1 * e * (a - b)) / (m1 + m2);
          const pr = dotyk - (s.x2 - s.x1);
          s.x1 -= pr / 2; s.x2 += pr / 2;
          s.srazilo = true;
          s.po = { v1: s.v1, v2: s.v2, p: m1 * s.v1 + m2 * s.v2, E: 0.5 * m1 * s.v1 ** 2 + 0.5 * m2 * s.v2 ** 2 };
        }
        const stoji = Math.abs(s.v1) < 1e-9 && Math.abs(s.v2) < 1e-9;
        if (s.x1 - hw(s.m1) <= 0 || s.x2 + hw(s.m2) >= DELKA || stoji) {
          s.x1 = Math.max(s.x1, hw(s.m1)); s.x2 = Math.min(s.x2, DELKA - hw(s.m2));
          s.bezi = false; s.konec = true; return false;
        }
      });
    }
    M.krok = krok;
    M.bezi = () => s.bezi;
    M.pust = () => { naStart(); s.bezi = true; Animace.spust(); m.naplanuj(); };
    M.simuluj = t => { kroky(t, 0.02, d => krok(d)); m.vykresli(); };
    Animace.pridej(m, krok, M.bezi);

    $('#sr-pustit').addEventListener('click', M.pust);
    $('#sr-reset').addEventListener('click', () => { naStart(); m.naplanuj(); });
    const zmena = () => { naStart(); m.naplanuj(); };
    const fm = v => cisK(v, 1) + ' kg', fv = v => cisK(v, 1) + ' m/s';
    const pos = {
      m1: posuvnik('sr-m1', fm, v => { s.m1 = v; zmena(); }), u1: posuvnik('sr-v1', fv, v => { s.u1 = v; zmena(); }),
      m2: posuvnik('sr-m2', fm, v => { s.m2 = v; zmena(); }), u2: posuvnik('sr-v2', fv, v => { s.u2 = v; zmena(); }),
    };
    const typ = segment($('#sr-typ'), s.typ, v => { s.typ = v; zmena(); });
    prepinac('sr-pomalu', c => { s.pomalu = c; });
    M.nastav = z => {
      Object.assign(s, z);
      for (const k of ['m1', 'u1', 'm2', 'u2']) pos[k].ukaz(s[k]);
      typ(s.typ);
      naStart();
      m.vykresli();
    };
    $$('[data-sr-preset]').forEach(b => b.addEventListener('click', () => { M.nastav(PRESETY_SRAZKY[b.dataset.srPreset]); M.pust(); }));

    m.kresli = g => {
      const k = m.k, P = s.pred;
      const X = x => X0 + x * PX;
      const pT = s.m1 * s.v1 + s.m2 * s.v2, ET = 0.5 * s.m1 * s.v1 ** 2 + 0.5 * s.m2 * s.v2 ** 2;
      // bilance: hybnost (může mířit doleva) a pohybová energie + teplo
      const pruh = (x, y, w, cls) => { if (Math.abs(w) >= 0.5) sv('rect', { x: r1(Math.min(x, x + w)), y: y - 7, width: r1(Math.abs(w)), height: 14, rx: 3, class: 'sloupec ' + cls }, g); };
      const hodnota = (x, y, w, t, cls) => txt(sv('g', { class: cls }, g), x + w + (w < 0 ? -8 : 8), y + 4, t, 't-maly t-barva' + (w < 0 ? ' t-konec' : ''));
      const ZP = 470, sP = Math.min(60, 230 / Math.max(0.5, Math.abs(P.p)));
      txt(g, 16, 30, 'hybnost před', 't-maly'); txt(g, 16, 54, 'hybnost teď', 't-maly');
      cara(g, [[ZP, 18], [ZP, 64]], 'tenka c-slabe');
      pruh(ZP, 26, P.p * sP, 'c-hybnost'); hodnota(ZP, 26, P.p * sP, cis(P.p, 2) + ' kg·m/s', 'c-hybnost');
      pruh(ZP, 50, pT * sP, 'c-hybnost'); hodnota(ZP, 50, pT * sP, cis(pT, 2) + ' kg·m/s', 'c-hybnost');
      const EX = 200, sE = 420 / Math.max(0.1, P.E), ztrata = Math.max(0, P.E - ET);
      txt(g, 16, 94, 'pohybová energie před', 't-maly'); txt(g, 16, 118, 'pohybová energie teď', 't-maly');
      pruh(EX, 90, P.E * sE, 'c-ek'); hodnota(EX, 90, P.E * sE, cis(P.E, 2) + ' J', 'c-ek');
      pruh(EX, 114, ET * sE, 'c-ek'); pruh(EX + ET * sE, 114, ztrata * sE, 'c-teplo');
      hodnota(EX, 114, (ET + ztrata) * sE, cis(ET, 2) + ' J' + (ztrata > 0.005 ? ` + teplo ${cis(ztrata, 2)} J` : ''), ztrata > 0.005 ? 'c-teplo' : 'c-ek');
      // kolejnice
      cara(g, [[X(0), RY], [X(DELKA), RY]], 'silna c-text');
      cara(g, [[X(0), RY - 26], [X(0), RY]], 'silna c-text'); cara(g, [[X(DELKA), RY - 26], [X(DELKA), RY]], 'silna c-text');
      // vozíky
      const vuz = (x, hm, v, trida, jm, vpravo) => {
        const w = sirka(hm), hh = vyska(hm), cx = X(x), L = cx - w / 2, T = RY - 14 - hh;
        sv('rect', { x: r1(L), y: r1(T), width: w, height: hh, rx: 5, class: trida }, g);
        for (const kx of [L + 14, L + w - 14]) sv('circle', { cx: r1(kx), cy: RY - 8, r: 8, class: 'kolo' }, g);
        txt(g, cx, T + hh / 2 + 5, jm + ' · ' + cisK(hm, 1) + ' kg', 't-silny t-stred');
        // nárazník na přivrácené straně
        const my = T + hh / 2;
        if (s.typ === 'pruzna' && vpravo) {
          const z = [[L + w, my]];
          for (let i = 1; i <= 6; i++) z.push([L + w + i * 3.3, my + (i % 2 ? -7 : 7)]);
          z.push([L + w + 22, my]);
          sv('path', { d: dCesta(z), class: 'pruzina' }, g);
          cara(g, [[L + w + 22, my - 9], [L + w + 22, my + 9]], 'silna c-text');
        } else if (s.typ === 'castecna') sv('rect', { x: r1(vpravo ? L + w : L - 5), y: r1(my - 10), width: 5, height: 20, rx: 2, class: 'guma-naraznik' }, g);
        else if (s.typ === 'nepruzna') sv('rect', { x: r1(vpravo ? L + w : L - 3), y: r1(T + 4), width: 3, height: hh - 8, class: 'zip' }, g);
        const vg = sv('g', { class: 'c-rychlost' }, g);
        if (Math.abs(v) > 0.01) sipka(vg, [cx, T - 16], [v * 45, 0], 'c-rychlost', k, 'v = ' + cis(v, 1) + ' m/s', { odsad: -14, dal: 20 });
        else txt(vg, cx, T - 12, 'stojí', 't-maly t-stred t-barva');
        const p = hm * v;
        if (Math.abs(p) > 0.01) sipka(g, [cx, RY + 24], [p * 22, 0], 'c-hybnost', k, 'p = ' + cis(p, 1) + ' kg·m/s', { odsad: 14, dal: 40 });
      };
      vuz(s.x1, s.m1, s.v1, 'vuz-a', 'A', true);
      vuz(s.x2, s.m2, s.v2, 'vuz-b', 'B', false);

      m.odecet([
        ['Před: v<sub>A</sub>; v<sub>B</sub>', `${cis(P.v1, 1)}; ${cis(P.v2, 1)} m/s`],
        s.po ? ['Po: v<sub>A</sub>; v<sub>B</sub>', `${cis(s.po.v1, 2)}; ${cis(s.po.v2, 2)} m/s`] : null,
        ['Hybnost před → teď', `${cis(P.p, 2)} → ${cis(pT, 2)} kg·m/s`],
        ['Pohybová energie před → teď', `${cis(P.E, 2)} → ${cis(ET, 2)} J`],
      ]);
      let z;
      if (!s.srazilo && s.u1 <= s.u2) z = '<span class="pozor">Vozíky se nesrazí:</span> A stojí vlevo, a proto musí jet doprava rychleji než B.';
      else if (!s.srazilo && !s.bezi) z = 'Stiskni <b>▶️ Spustit srážku</b> a sleduj proužky nahoře: horní je vždy stav před srážkou, dolní stav teď.';
      else if (!s.srazilo) z = `Celková hybnost před srážkou je ${cis(P.p, 2)} kg·m/s. Sleduj, jestli se po srážce změní.`;
      else {
        const zt = Math.max(0, P.E - s.po.E), pr = P.E > 0 ? Math.round(zt / P.E * 100) : 0;
        if (s.typ === 'pruzna') {
          z = `<span class="ok">Pružná srážka:</span> hybnost zůstala ${cis(P.p, 2)} kg·m/s a pohybová energie se nezměnila.`;
          if (s.m1 === s.m2 && P.v2 === 0) z += ' Stejně těžké vozíky si <b>vyměnily rychlosti</b>.';
          else if (s.po.v1 < -1e-9) z += ' Lehčí vozík A se odrazil zpět.';
        } else if (s.typ === 'castecna') z = `Hybnost se zachovala (${cis(P.p, 2)} kg·m/s), ale ${cis(zt, 2)} J pohybové energie (${pr} %) se změnilo na teplo a deformaci gumy.`;
        else if (Math.abs(s.po.p) < 1e-9) z = '<span class="ok">Celková hybnost byla nulová</span> – spojené vozíky proto stojí. Veškerá pohybová energie se změnila na teplo a deformaci.';
        else z = `Vozíky se spojily a jedou spolu rychlostí ${cis(s.po.v1, 2)} m/s. Hybnost se zachovala, ${cis(zt, 2)} J pohybové energie (${pr} %) se ztratilo.`;
      }
      m.zpravu(z);
    };

    Ukoly.definuj('sr-zastav', () => s.typ === 'nepruzna' && s.srazilo && s.pred.v1 !== 0 && s.pred.v2 !== 0 && Math.abs(s.po.p) < 1e-9,
      'Oba vozíky zastaví, když je celková hybnost před srážkou <b>nulová</b>: hybnost A doprava je stejně velká jako hybnost B doleva, třeba 2 kg · 1,5 m/s = 1 kg · 3 m/s. Pohybová energie se přitom celá změnila na teplo a deformaci.');
    predpoved('sr-stejne', {
      otazka: 'Vozík A (1 kg) narazí rychlostí 2 m/s do <b>stejně těžkého</b> vozíku B, který <b>stojí</b>. Nárazník je pružina (pružná srážka). Co se stane?',
      moznosti: ['Oba pojedou spolu rychlostí 1 m/s.', 'A se zastaví a B odjede rychlostí 2 m/s.', 'A se odrazí zpět a B zůstane stát.'],
      spravna: 1,
      proc: ['Hybnost by se tak zachovala, ale ztratila by se polovina pohybové energie – to se stane jen při nepružné srážce (suchý zip).', null,
        'Pak by se hybnost nezachovala: před srážkou míří doprava, po ní by mířila doleva.'],
      vyzkousej: 'Nastav oběma vozíkům stejnou hmotnost, B nech stát (rychlost 0), vyber <b>pružinu</b> a spusť srážku. Nebo stiskni 🎱 kulečník.',
      splneno: () => s.typ === 'pruzna' && s.srazilo && s.m1 === s.m2 && s.pred.v2 === 0 && s.pred.v1 > 0,
      vysvetleni: 'Při pružné srážce se zachová hybnost i pohybová energie. U stejně těžkých vozíků to jde jedině tak, že si <b>vymění rychlosti</b>: A zastaví, B odjede. Přesně tohle vidíš u kulečníku a Newtonovy kolébky.',
    });
    predpoved('sr-lehky', {
      otazka: 'Lehký vozík A (0,5 kg) narazí pružně do stojícího vozíku B, který je <b>osmkrát těžší</b> (4 kg). Co udělá lehký vozík A?',
      moznosti: ['Zastaví se.', 'Odrazí se a pojede zpět.', 'Pojede dál stejným směrem, jen pomaleji.'],
      spravna: 1,
      proc: ['Zastaví se jen vozík, který narazí do stejně těžkého.', null, 'To by se stalo, kdyby naopak těžší vozík narazil do lehčího.'],
      vyzkousej: 'Stiskni <b>🚲 lehký do těžkého</b>, nebo nastav A 0,5 kg, B aspoň 2 kg a stojící, nárazník pružinu – a spusť srážku.',
      splneno: () => s.typ === 'pruzna' && s.srazilo && s.pred.v2 === 0 && s.m2 >= 4 * s.m1 && s.po.v1 < 0,
      vysvetleni: 'Lehký vozík se od těžkého <b>odrazí zpět</b> – jako míček od zdi. Těžký vozík se rozjede jen pomalu. Hybnost se zachovala: A má teď hybnost doleva (zápornou), B doprava a jejich součet je stejný jako před srážkou.',
    });
  }

  /* ================================================================
     6. Procvičování
     ================================================================ */
  /* Každý generátor vrací { zadani, moznosti: [{ t, ok?, proc? }], napoveda, vysvetleni }.
     Právě jedna možnost je správná, u chybných je zdůvodnění. Duplicitní texty se vyřadí.
     Texty možností, zdůvodnění, nápovědy a vysvětlení jsou bez HTML (uloha.js je vypisuje jako text).
     Počítá se s g = 10 N/kg. */
  const N = x => cisK(x, 2);
  const varianta = pole => vyber(pole)();
  const GENERATORY = [
    { id: 'tiha', tema: 'rovina', nazev: 'Tíha', gen() {
      const m = vyber([0.2, 0.5, 1.5, 2, 3, 4.5, 12, 25, 60]);
      return { zadani: `Jakou tíhu má těleso o hmotnosti <b>${N(m)} kg</b>? (g = 10 N/kg)`,
        moznosti: [{ t: N(10 * m) + ' N', ok: true },
          { t: N(m) + ' N', proc: 'To je jen číslo hmotnosti. Tíha je m · g, tedy desetkrát víc.' },
          { t: N(m / 10) + ' N', proc: 'Hmotností se násobí, ne dělí: F = m · g.' },
          { t: N(100 * m) + ' N', proc: 'Na Zemi je g asi 10 N/kg, ne 100 N/kg.' }],
        napoveda: 'Tíha = hmotnost · g, kde g je asi 10 N/kg.',
        vysvetleni: `F = m · g = ${N(m)} kg · 10 N/kg = ${N(10 * m)} N.` };
    } },
    { id: 'hmotnost', tema: 'rovina', nazev: 'Hmotnost z tíhy', gen() {
      const F = vyber([5, 30, 150, 450, 800, 12]);
      return { zadani: `Siloměr ukazuje, že zavěšené těleso má tíhu <b>${F} N</b>. Jakou má hmotnost? (g = 10 N/kg)`,
        moznosti: [{ t: N(F / 10) + ' kg', ok: true },
          { t: N(F * 10) + ' kg', proc: 'Tady se hmotnost počítá z tíhy: m = F : g, tedy dělíme deseti.' },
          { t: N(F) + ' kg', proc: 'Newtony a kilogramy nejsou totéž. Kilogram má tíhu asi 10 N.' },
          { t: N(F / 100) + ' kg', proc: 'Dělíme g = 10 N/kg, ne stem.' }],
        napoveda: 'Jeden kilogram má tíhu asi 10 N.',
        vysvetleni: `m = F : g = ${F} N : 10 N/kg = ${N(F / 10)} kg.` };
    } },
    { id: 'vysledna', tema: 'sila', nazev: 'Výsledná síla', gen() {
      const F1 = vyber([20, 30, 40, 50, 60]), F2 = vyber([10, 15, 25, 35].filter(x => x < F1));
      if (Math.random() < 0.5) return {
        zadani: `Dva kamarádi tlačí skříň stejným směrem: jeden silou <b>${F1} N</b>, druhý silou <b>${F2} N</b>. Jaká je výsledná síla?`,
        moznosti: [{ t: `${F1 + F2} N`, ok: true },
          { t: `${F1 - F2} N`, proc: 'Síly míří stejným směrem – sčítají se, neodečítají.' },
          { t: `${F1} N`, proc: 'Menší síla se neztratí – obě působí stejným směrem a sečtou se.' }],
        napoveda: 'Síly stejného směru se sčítají.',
        vysvetleni: `Obě síly míří stejně: ${F1} N + ${F2} N = ${F1 + F2} N ve směru tlačení.` };
      return {
        zadani: `Přetahovaná: jedno družstvo táhne lano silou <b>${F1} N</b> doleva, druhé silou <b>${F2} N</b> doprava. Jaká je výsledná síla?`,
        moznosti: [{ t: `${F1 - F2} N doleva`, ok: true },
          { t: `${F1 + F2} N doleva`, proc: 'Síly opačného směru se odečítají, ne sčítají.' },
          { t: '0 N', proc: 'Nulová by byla, jen kdyby obě družstva táhla stejně velkou silou.' },
          { t: `${F1 - F2} N doprava`, proc: 'Výsledná síla míří na stranu větší síly – tedy doleva.' }],
        napoveda: 'Síly opačného směru se odečítají; výsledná míří ve směru větší síly.',
        vysvetleni: `${F1} N − ${F2} N = ${F1 - F2} N, směr má větší síla – doleva.` };
    } },
    { id: 'setrvacnost', tema: 'sila', nazev: 'Setrvačnost', gen() {
      return varianta([
        () => ({ zadani: 'Autobus prudce zabrzdí. Kam se pohnou stojící cestující?',
          moznosti: [{ t: 'Dopředu, ve směru jízdy.', ok: true },
            { t: 'Dozadu.', proc: 'Dozadu se zapotácí při rozjezdu autobusu. Při brzdění jejich těla pokračují dopředu.' },
            { t: 'Zůstanou stát na místě.', proc: 'Autobus zpomalí, ale na cestující nic nepůsobí, co by je stejně rychle zabrzdilo – pokračují dál.' }],
          napoveda: 'Těleso si chce udržet svou rychlost.',
          vysvetleni: 'Cestující mají setrvačnost: jejich těla pokračují dál rychlostí autobusu, i když autobus brzdí. Proto se máme držet a v autě poutat.' }),
        () => ({ zadani: 'Hokejový puk klouže po ledě. Proč se nakonec zastaví?',
          moznosti: [{ t: 'Brzdí ho tření o led a odpor vzduchu.', ok: true },
            { t: 'Došla mu síla, kterou dostal od hokejky.', proc: 'Síla si „nenese“ s sebou. Bez tření by puk jel stále stejnou rychlostí.' },
            { t: 'Pohyb se sám od sebe zpomaluje.', proc: 'Sám od sebe se pohyb nezpomalí – to je zákon setrvačnosti. Vždy ho brzdí nějaká síla.' }],
          napoveda: 'K zastavení je potřeba síla. Která tady působí?',
          vysvetleni: 'Podle zákona setrvačnosti by puk jel pořád. Zastaví ho až tření o led a odpor vzduchu – na ledu jsou malé, a proto puk dojede daleko.' }),
        () => ({ zadani: 'Kosmická sonda letí daleko ve vesmíru s vypnutými motory a nic ji nebrzdí. Co dělá?',
          moznosti: [{ t: 'Letí dál stejnou rychlostí stejným směrem.', ok: true },
            { t: 'Postupně zpomaluje, až se zastaví.', proc: 'Zpomalovat by musela nějaká síla – odpor vzduchu ani tření ve vesmíru nejsou.' },
            { t: 'Okamžitě se zastaví.', proc: 'Pohyb nepotřebuje motor, který by ho udržoval. Motor je potřeba jen na změnu rychlosti.' }],
          napoveda: 'Co říká první Newtonův zákon?',
          vysvetleni: 'Když výsledná síla je nulová, těleso se pohybuje rovnoměrně přímočaře. Sondy tak letí roky bez paliva.' }),
      ]);
    } },
    { id: 'rovnovaha', tema: 'sila', nazev: 'Pohyb stálou rychlostí', gen() {
      const [co, kde, sily] = vyber([
        ['Auto jede po rovné silnici stálou rychlostí 50 km/h.', 'auto', 'Tah motoru a odpor vzduchu s valivým třením jsou stejně velké'],
        ['Parašutista s otevřeným padákem klesá stálou rychlostí 5 m/s.', 'parašutista', 'Tíha a odpor vzduchu jsou stejně velké'],
        ['Bednu táhneš po podlaze tak, že jede pořád stejně rychle.', 'bedna', 'Tah a tření jsou stejně velké'],
      ]);
      return { zadani: `${co} Jaká je <b>výsledná síla</b>, která na ${kde === 'auto' ? 'auto' : kde === 'bedna' ? 'bednu' : 'parašutistu'} působí?`,
        moznosti: [{ t: 'Nulová.', ok: true },
          { t: 'Míří ve směru pohybu.', proc: 'Výsledná síla ve směru pohybu by rychlost zvětšovala. Rychlost se ale nemění.' },
          { t: 'Míří proti pohybu.', proc: 'Výsledná síla proti pohybu by těleso brzdila. Rychlost se ale nemění.' }],
        napoveda: 'Mění se rychlost? Co to říká o výsledné síle?',
        vysvetleni: `${sily} a míří opačně, takže se vyruší. Stálá rychlost znamená nulovou výslednou sílu.` };
    } },
    { id: 'treni', tema: 'sila', nazev: 'Třecí síla', gen() {
      const m = vyber([2, 4, 5, 8, 10, 20]), f = vyber([0.2, 0.3, 0.5]);
      const Ft = f * m * 10;
      return { zadani: `Bedna o hmotnosti <b>${m} kg</b> leží na vodorovné podlaze. Součinitel tření je <b>${N(f)}</b>. Jakou nejmenší vodorovnou silou ji rozjedeš? (g = 10 N/kg)`,
        moznosti: [{ t: `větší než ${N(Ft)} N`, ok: true },
          { t: `větší než ${N(m * 10)} N`, proc: 'To je celá tíha bedny. Tření je jen její část: f · Fn.' },
          { t: `větší než ${N(f * m)} N`, proc: 'Tření se počítá z tlakové síly v newtonech, ne z hmotnosti: Ft = f · m · g.' },
          { t: 'jakoukoli, i malou', proc: 'Malou silou bednu neposuneš – tření ji drží, dokud síla nepřekročí f · Fn.' }],
        napoveda: 'Tření Ft = f · Fn; na vodorovné podlaze je Fn rovna tíze m · g.',
        vysvetleni: `Fn = ${m} · 10 = ${m * 10} N, tření nejvýš Ft = ${N(f)} · ${m * 10} N = ${N(Ft)} N. Tah musí být větší.` };
    } },
    { id: 'treni-pojem', tema: 'sila', nazev: 'Na čem závisí tření', gen() {
      return varianta([
        () => ({ zadani: 'Do bedny, kterou táhneš po podlaze, přiložíš další náklad. Co se stane s třecí silou?',
          moznosti: [{ t: 'Zvětší se – bedna víc tlačí na podlahu.', ok: true },
            { t: 'Zmenší se.', proc: 'Těžší bedna tlačí na podlahu víc, a tak se tření zvětší.' },
            { t: 'Nezmění se.', proc: 'Tření závisí na síle, kterou bedna tlačí na podložku – a ta se zvětšila.' }],
          napoveda: 'Ft = f · Fn.', vysvetleni: 'Tření je úměrné tlakové síle na podložku. Těžší bedna tlačí víc, a tak je tření větší.' }),
        () => ({ zadani: 'Proč se v zimě sypou chodníky pískem?',
          moznosti: [{ t: 'Písek zvětší tření mezi botou a ledem.', ok: true },
            { t: 'Písek led rozpustí.', proc: 'Led rozpouští sůl. Písek jen zdrsní povrch.' },
            { t: 'Písek zmenší tření, abychom neklouzali.', proc: 'Aby noha neklouzala, potřebujeme tření větší, ne menší.' }],
          napoveda: 'Klouzání = malé tření.', vysvetleni: 'Na hladkém ledu je součinitel tření velmi malý. Písek povrch zdrsní, tření vzroste a noha neuklouzne.' }),
        () => ({ zadani: 'Kterým směrem působí třecí síla na bednu, kterou tlačíš doprava?',
          moznosti: [{ t: 'Doleva – proti pohybu.', ok: true },
            { t: 'Doprava – ve směru pohybu.', proc: 'Tření pohyb vždy brzdí, míří tedy proti němu.' },
            { t: 'Svisle dolů.', proc: 'Svisle dolů míří tíha. Tření působí podél styčné plochy.' }],
          napoveda: 'Tření pohyb brzdí.', vysvetleni: 'Třecí síla působí v místě dotyku podél podložky a vždy proti směru pohybu.' }),
      ]);
    } },
    { id: 'mezni', tema: 'rovina', nazev: 'Mezní úhel', gen() {
      const [kolik, kolikrat] = vyber([['dvakrát', 2], ['třikrát', 3], ['desetkrát', 10]]);
      return { zadani: `Na stejnou nakloněnou rovinu se stejným povrchem položíš <b>${kolik} těžší</b> kvádr. Rozjede se při menším sklonu?`,
        moznosti: [{ t: 'Ne, rozjede se při stejném sklonu.', ok: true },
          { t: 'Ano, těžší kvádr se rozjede dřív.', proc: 'Těžšímu kvádru roste tah dolů po svahu, ale stejně tolikrát i přítlak a s ním tření.' },
          { t: 'Ne, těžší se rozjede až při větším sklonu.', proc: 'Tření sice vzroste, ale tah dolů po svahu vzroste stejně. Mezní úhel zůstane stejný.' }],
        napoveda: 'Obě síly – tah dolů po svahu i tření – jsou úměrné tíze.',
        vysvetleni: `Obě síly vzrostou ${kolikrat}krát, jejich poměr se nezmění. Mezní úhel určuje jen tření: tg α = f.` };
    } },
    { id: 'rozklad', tema: 'rovina', nazev: 'Složky tíhy', gen() {
      return varianta([
        () => ({ zadani: 'Co se stane se složkami tíhy, když svah uděláš <b>strmější</b>?',
          moznosti: [{ t: 'Složka podél svahu roste, složka do podložky klesá.', ok: true },
            { t: 'Obě složky rostou.', proc: 'Tíha se nemění – když jedna složka roste, druhá musí klesat.' },
            { t: 'Složka podél svahu klesá, složka do podložky roste.', proc: 'Je to naopak: na strmém svahu tíha víc táhne dolů a méně tlačí do podložky.' }],
          napoveda: 'Představ si extrémy: vodorovnou podlahu a svislou stěnu.',
          vysvetleni: 'Na vodorovné rovině tlačí celá tíha do podložky, na svislé stěně táhne celá dolů. Mezi tím se poměr plynule mění.' }),
        () => ({ zadani: 'Při jakém sklonu je složka tíhy <b>podél svahu nulová</b>?',
          moznosti: [{ t: '0° – na vodorovné rovině.', ok: true },
            { t: '45°.', proc: 'Při 45° jsou obě složky stejně velké, žádná není nulová.' },
            { t: '90°.', proc: 'Na svislé stěně je naopak celá tíha podél stěny a do podložky netlačí nic.' }],
          napoveda: 'Kdy těleso vůbec nic netáhne podél povrchu?',
          vysvetleni: 'Na vodorovné rovině míří celá tíha kolmo do podložky. Podél ní netáhne nic, a proto těleso samo nesjede.' }),
        () => ({ zadani: 'Při jakém sklonu jsou obě složky tíhy (podél svahu a do podložky) <b>stejně velké</b>?',
          moznosti: [{ t: '45°.', ok: true },
            { t: '30°.', proc: 'Při 30° je složka do podložky ještě větší (asi 0,87 tíhy proti 0,5).' },
            { t: '60°.', proc: 'Při 60° už převažuje složka podél svahu.' }],
          napoveda: 'Úhel přesně v polovině mezi vodorovnou a svislou.',
          vysvetleni: 'Při 45° je rovnoběžník sil čtverec – obě složky jsou stejné (asi 0,71 tíhy).' }),
      ]);
    } },
    { id: 'ep', tema: 'energie', nazev: 'Polohová energie', gen() {
      const m = vyber([0.5, 1, 2, 4, 5, 60]), h = vyber([2, 3, 5, 10, 20]);
      const E = 10 * m * h;
      return { zadani: `Těleso o hmotnosti <b>${N(m)} kg</b> je ve výšce <b>${h} m</b>. Jakou má polohovou energii? (g = 10 N/kg)`,
        moznosti: [{ t: N(E) + ' J', ok: true },
          { t: N(m * h) + ' J', proc: 'Chybí g ≈ 10 N/kg: Ep = m · g · h.' },
          { t: N(E / 2) + ' J', proc: 'Polovina patří do vzorce pro pohybovou energii, ne pro polohovou.' },
          { t: N(10 * m + h) + ' J', proc: 'Veličiny se ve vzorci násobí, ne sčítají: Ep = m · g · h.' }],
        napoveda: 'Ep = m · g · h.',
        vysvetleni: `Ep = ${N(m)} · 10 · ${h} = ${N(E)} J.` };
    } },
    { id: 'ek', tema: 'energie', nazev: 'Pohybová energie', gen() {
      const m = vyber([2, 4, 6, 10, 1000]), v = vyber([3, 4, 5, 10]);
      const E = 0.5 * m * v * v;
      const co = m === 1000 ? 'Auto o hmotnosti <b>1 000 kg</b>' : `Těleso o hmotnosti <b>${m} kg</b>`;
      return { zadani: `${co} se pohybuje rychlostí <b>${v} m/s</b>. Jakou má pohybovou energii?`,
        moznosti: [{ t: N(E) + ' J', ok: true },
          { t: N(m * v * v) + ' J', proc: 'Zapomněl(a) jsi na polovinu: Ek = ½ · m · v².' },
          { t: N(0.5 * m * v) + ' J', proc: 'Rychlost se ve vzorci umocňuje na druhou: Ek = ½ · m · v².' },
          { t: N(m * v) + ' J', proc: 'm · v je hybnost (v kg·m/s), ne energie.' }],
        napoveda: 'Ek = ½ · m · v².',
        vysvetleni: `Ek = ½ · ${N(m)} · ${v}² = ½ · ${N(m)} · ${v * v} = ${N(E)} J.` };
    } },
    { id: 'dopad', tema: 'energie', nazev: 'Rychlost dopadu', gen() {
      const [h, v] = vyber([[0.2, 2], [0.8, 4], [1.8, 6], [3.2, 8], [5, 10], [7.2, 12]]);
      return { zadani: `Míček spadne z výšky <b>${N(h)} m</b>. Jak rychle dopadne na zem? (bez odporu vzduchu, g = 10 N/kg)`,
        moznosti: [{ t: `${v} m/s`, ok: true },
          { t: `${N(2 * v)} m/s`, proc: 'Rychlost plyne z rovnosti energií ½ · m · v² = m · g · h, tedy v = √(2 · g · h).' },
          { t: `${N(20 * h)} m/s`, proc: 'Zapomněl(a) jsi odmocnit: v² = 2 · g · h.' },
          { t: 'Záleží na hmotnosti míčku.', proc: 'Hmotnost se na obou stranách rovnosti energií zkrátí – bez odporu vzduchu padá lehké i těžké stejně.' }],
        napoveda: 'Dole je veškerá polohová energie pohybová: ½ · m · v² = m · g · h.',
        vysvetleni: `v² = 2 · g · h = 2 · 10 · ${N(h)} = ${v * v}, tedy v = ${v} m/s.` };
    } },
    { id: 'zachovani', tema: 'energie', nazev: 'Zákon zachování energie', gen() {
      return varianta([
        () => { const h = vyber([1, 1.5, 2, 3]); return { zadani: `Kulička na rampě bez tření startuje z výšky <b>${N(h)} m</b>. Do jaké výšky vyjede na druhé straně?`,
          moznosti: [{ t: `Přesně do ${N(h)} m.`, ok: true },
            { t: `Níž než ${N(h)} m.`, proc: 'Energii by ztrácela jen třením – a tření tu není.' },
            { t: `Výš než ${N(h)} m.`, proc: 'Na větší výšku by potřebovala víc energie, než měla na startu. Energie ale nevzniká.' }],
          napoveda: 'Celková energie se bez tření nemění.',
          vysvetleni: 'Polohová energie se změní na pohybovou a zpět. Bez ztrát kulička vyjede přesně do výšky startu.' }; },
        () => ({ zadani: 'Kde má kulička kutálející se v U-rampě <b>největší pohybovou energii</b>?',
          moznosti: [{ t: 'V nejnižším bodě.', ok: true },
            { t: 'V krajní poloze.', proc: 'V krajní poloze se kulička na okamžik zastaví – pohybovou energii tam nemá žádnou.' },
            { t: 'Všude stejnou.', proc: 'Mění se výška, a s ní i rychlost. Stejná je jen celková energie.' }],
          napoveda: 'Kde je kulička nejrychlejší?',
          vysvetleni: 'Dole je výška nejmenší, polohové energie nejméně – a pohybové nejvíc. Kulička je tam nejrychlejší.' }),
        () => ({ zadani: 'Kulička na rampě s třením se nakonec zastaví dole. Co se stalo s její energií?',
          moznosti: [{ t: 'Třením se změnila na teplo.', ok: true },
            { t: 'Zanikla.', proc: 'Energie nezaniká – jen se mění z jedné formy na jinou.' },
            { t: 'Zůstala v kuličce jako polohová energie.', proc: 'Dole je výška nulová, polohovou energii kulička nemá.' }],
          napoveda: 'Energie nevzniká ani nezaniká.',
          vysvetleni: 'Tření mění pohybovou energii na vnitřní energii – kulička, rampa i vzduch se nepatrně ohřejí.' }),
      ]);
    } },
    { id: 'kyv-delka', tema: 'kyvadlo', nazev: 'Délka kyvadla', gen() {
      const [l, co, T] = vyber([[4, '4 m', 4], [0.25, '0,25 m', 1], [9, '9 m', 6], [16, '16 m', 8]]);
      return { zadani: `Kyvadlo s délkou závěsu 1 m má dobu kmitu asi 2 s. Jakou dobu kmitu bude mít kyvadlo s délkou <b>${co}</b>?`,
        moznosti: [{ t: `${N(T)} s`, ok: true },
          { t: `${N(2 * l)} s`, proc: `Doba kmitu neroste s délkou přímo, ale s její druhou odmocninou: √${N(l)} = ${N(Math.sqrt(l))}.` },
          { t: '2 s', proc: 'Doba kmitu na délce závěsu závisí: delší kyvadlo kmitá pomaleji.' }],
        napoveda: 'T roste s druhou odmocninou délky.',
        vysvetleni: `Délka se změnila ${N(l)}krát, doba kmitu √${N(l)} = ${N(Math.sqrt(l))}krát: 2 s · ${N(Math.sqrt(l))} = ${N(T)} s.` };
    } },
    { id: 'kyv-mereni', tema: 'kyvadlo', nazev: 'Měření doby kmitu', gen() {
      const n = vyber([10, 20, 30, 40]), T = vyber([0.5, 1.5, 2, 2.5]), t = n * T;
      return { zadani: `Kyvadlo vykoná <b>${n} kmitů</b> za <b>${N(t)} s</b>. Jaká je jeho doba kmitu?`,
        moznosti: [{ t: `${N(T)} s`, ok: true },
          { t: `${N(n / t)} s`, proc: 'Tohle je počet kmitů za sekundu (frekvence v Hz), ne doba jednoho kmitu.' },
          { t: `${N(t * n)} s`, proc: 'Celkový čas se mezi kmity dělí, nenásobí.' },
          { t: `${N(t)} s`, proc: 'To je čas všech kmitů dohromady, ne jednoho.' }],
        napoveda: 'Doba kmitu = celkový čas : počet kmitů.',
        vysvetleni: `T = ${N(t)} s : ${n} = ${N(T)} s. Měřit víc kmitů najednou je přesnější než stopovat jeden.` };
    } },
    { id: 'kyv-pojem', tema: 'kyvadlo', nazev: 'Na čem závisí doba kmitu', gen() {
      return varianta([
        () => ({ zadani: 'Kyvadlu vyměníš závaží za <b>třikrát těžší</b>, délka zůstane stejná. Jak se změní doba kmitu?',
          moznosti: [{ t: 'Nezmění se.', ok: true },
            { t: 'Zkrátí se na třetinu.', proc: 'Těžší závaží táhne tíha silněji, ale stejně tolikrát hůř se rozpohybuje.' },
            { t: 'Prodlouží se třikrát.', proc: 'Hmotnost dobu kmitu neovlivní – rozhoduje délka závěsu a g.' }],
          napoveda: 'Co je ve vzorci T = 2π · √(l / g)?',
          vysvetleni: 'Doba kmitu nezávisí na hmotnosti závaží, jen na délce závěsu a na g.' }),
        () => ({ zadani: 'Stejné kyvadlo přeneseš ze Země na <b>Měsíc</b>, kde je g asi šestkrát menší. Jak se změní doba kmitu?',
          moznosti: [{ t: 'Prodlouží se – kyvadlo kmitá pomaleji.', ok: true },
            { t: 'Zkrátí se.', proc: 'Slabší tíha kyvadlo vrací pomaleji, doba kmitu se prodlouží.' },
            { t: 'Nezmění se.', proc: 'Doba kmitu závisí na g: T = 2π · √(l / g).' }],
          napoveda: 'Menší g = slabší tíha, která kyvadlo vrací.',
          vysvetleni: 'Na Měsíci kmitá kyvadlo asi 2,5krát pomaleji (√6 ≈ 2,45).' }),
        () => ({ zadani: 'Kde má závaží kyvadla <b>největší rychlost</b>?',
          moznosti: [{ t: 'V nejnižším bodě.', ok: true },
            { t: 'V krajní poloze.', proc: 'V krajní poloze se závaží na okamžik zastaví a otočí.' },
            { t: 'Všude stejnou.', proc: 'Rychlost se mění – polohová energie se mění na pohybovou a zpět.' }],
          napoveda: 'Kde má závaží nejméně polohové energie?',
          vysvetleni: 'Dole je závaží nejníž, polohová energie se změnila na pohybovou – rychlost je největší.' }),
        () => ({ zadani: 'Tlumené kyvadlo se po chvíli zastaví. Kam se poděla jeho energie?',
          moznosti: [{ t: 'Změnila se na teplo – odporem vzduchu a třením v závěsu.', ok: true },
            { t: 'Zanikla.', proc: 'Energie nezaniká, jen se mění z jedné formy na jinou.' },
            { t: 'Uložila se v závěsu.', proc: 'Závěs se nezvedá ani nenapíná – energie odešla jako teplo do okolí.' }],
          napoveda: 'Zákon zachování energie platí vždy.',
          vysvetleni: 'Celková energie se nezmění, jen se přemění na teplo, které odejde do okolí.' }),
      ]);
    } },
    { id: 'hybnost', tema: 'srazky', rozsirujici: true, nazev: 'Hybnost', gen() {
      const m = vyber([0.5, 3, 4, 60]), v = vyber([3, 4, 5]);
      return { zadani: `Těleso o hmotnosti <b>${N(m)} kg</b> se pohybuje rychlostí <b>${v} m/s</b>. Jakou má hybnost?`,
        moznosti: [{ t: `${N(m * v)} kg·m/s`, ok: true },
          { t: `${N(m * v * v / 2)} kg·m/s`, proc: 'To je pohybová energie ½ · m · v² (v joulech). Hybnost je p = m · v.' },
          { t: `${N(m + v)} kg·m/s`, proc: 'Hmotnost a rychlost se násobí, nesčítají: p = m · v.' }],
        napoveda: 'p = m · v.',
        vysvetleni: `p = m · v = ${N(m)} · ${v} = ${N(m * v)} kg·m/s.` };
    } },
    { id: 'spojeni', tema: 'srazky', rozsirujici: true, nazev: 'Nepružná srážka', gen() {
      const m = vyber([1, 2, 3]), v = vyber([2, 4, 6]);
      return { zadani: `Vozík (${m} kg) jede rychlostí <b>${v} m/s</b> a narazí do stejně těžkého stojícího vozíku. Vozíky se <b>spojí</b> a jedou dál spolu. Jak rychle?`,
        moznosti: [{ t: `${N(v / 2)} m/s`, ok: true },
          { t: `${v} m/s`, proc: 'Stejná hybnost se teď rozdělí na dvojnásobnou hmotnost, takže rychlost klesne na polovinu.' },
          { t: '0 m/s', proc: 'Hybnost se zachová – spojené vozíky se musí dál pohybovat.' },
          { t: `${N(2 * v)} m/s`, proc: 'Rychlost vzrůst nemůže – hybnost se zachová, ale hmotnost se zdvojnásobí.' }],
        napoveda: 'Hybnost před srážkou = hybnost po srážce.',
        vysvetleni: `Hybnost ${m} · ${v} = ${m * v} kg·m/s nese teď ${2 * m} kg: v = ${m * v} : ${2 * m} = ${N(v / 2)} m/s.` };
    } },
    { id: 'srazka-pojem', tema: 'srazky', rozsirujici: true, nazev: 'Pružná a nepružná srážka', gen() {
      return varianta([
        () => ({ zadani: 'Co se zachová při <b>nepružné</b> srážce (tělesa se spojí)?',
          moznosti: [{ t: 'Hybnost, ale ne pohybová energie.', ok: true },
            { t: 'Hybnost i pohybová energie.', proc: 'Pohybová energie se zachová jen při pružné srážce. Při nepružné se část změní na teplo a deformaci.' },
            { t: 'Jen pohybová energie.', proc: 'Je to naopak: hybnost se zachová při každé srážce, energie jen při pružné.' }],
          napoveda: 'Jedna z veličin se zachovává vždy.',
          vysvetleni: 'Hybnost se zachovává vždy, pohybová energie jen při dokonale pružné srážce.' }),
        () => ({ zadani: 'Kulečníková koule narazí přímo do stejné stojící koule (pružná srážka). Co se stane?',
          moznosti: [{ t: 'První koule se zastaví a druhá odjede její rychlostí.', ok: true },
            { t: 'Obě pojedou spolu poloviční rychlostí.', proc: 'Tak by to dopadlo při nepružné srážce – ztratila by se polovina energie.' },
            { t: 'První se odrazí zpět a druhá zůstane stát.', proc: 'Hybnost by se nezachovala – před srážkou mířila dopředu.' }],
          napoveda: 'Při pružné srážce se zachová hybnost i energie.',
          vysvetleni: 'Stejně těžká tělesa si při pružné srážce vymění rychlosti.' }),
        () => ({ zadani: 'Proč mají auta vpředu a vzadu <b>deformační zóny</b>?',
          moznosti: [{ t: 'Při nárazu se zmačkají a spotřebují pohybovou energii, takže chrání cestující.', ok: true },
            { t: 'Aby se auto od překážky odrazilo zpět.', proc: 'Pružný odraz by byl pro cestující horší – rychlost by se změnila ještě víc.' },
            { t: 'Aby se při srážce zachovala hybnost.', proc: 'Hybnost se zachová při každé srážce – na tom deformační zóna nic nemění.' }],
          napoveda: 'Srážka s deformací je nepružná. Kam jde energie?',
          vysvetleni: 'Deformační zóna udělá ze srážky nepružnou: pohybová energie se spotřebuje na zmačkání plechu a náraz se prodlouží.' }),
      ]);
    } },
  ];

  const TEMATA = [['vse', 'Vše'], ['sila', 'Síla a pohyb'], ['rovina', 'Tíha a svah'], ['energie', 'Energie'], ['kyvadlo', 'Kyvadlo'], ['srazky', 'Srážky']];

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
      this.skore = Uloha.skore('metodus_hriste_skore', $('#cv-skore'));
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
      obr.hidden = true;
      obr.innerHTML = '';
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
    for (const f of [modelVozik, modelRovina, modelRampa, modelKyvadlo, modelSrazka]) {
      try { f(); } catch (e) { console.error('Model se nepodařilo spustit:', f.name, e); }
    }
    Navigace.init();
    odkazyNaLekce();
    Procvic.init();
    Model.vsechny.forEach(m => m.naplanuj());
  }
  window.addEventListener('metodus-theme', () => Model.vsechny.forEach(m => m.naplanuj()));
  window.HristeLekce = { MODELY, Ukoly, Postup, Model, Animace, GENERATORY, get Procvic() { return Procvic; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
