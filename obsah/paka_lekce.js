/* ============================================================
   paka_lekce.js – interaktivní výklad „Páka a jednoduché stroje“.

   Stavba (stejná jako optika_lekce.js, aby lekce fungovaly stejně):
     1. pomůcky (čísla, vektory, kreslení do SVG)
     2. Model – obrázek s úchopy (tažení myší, dotykem i klávesnicí)
     3. Úkoly a předpovědi (postup se ukládá do localStorage)
     4. Navigace (osnova, čipy, mapa lekce)
     5. Kreslení strojů (šipky sil, kóty, podpěry, závaží)
     6. Modely kapitol a třídička pák
     7. Procvičování (otázky pro fázi Procvič a Ověř se)

   Fyzika: g = 10 N/kg, kladky, lana a tyče jsou lehké a bez tření
   (tření jen tam, kde ho lze zapnout). Délky v modelech jsou
   v jednotkách viewBoxu; měřítko je uvedeno u každého modelu.
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
  const KLIC = 'metodus_paka_lekce';
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
      if (r && u.reakce) r.innerHTML = typeof u.reakce === 'function' ? u.reakce() : u.reakce;
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
     5. Kreslení strojů (šipky sil, kóty, podpěry, závaží, postavy)
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
  /* Stoh závaží (každé 1 N) zavěšený pod bodem p. */
  function stohZavazi(g, p, n, k, provaz = 26) {
    const x = p[0], y0 = p[1] + provaz;
    cara(g, [p, [x, y0]], 'tenka c-text');
    for (let i = 0; i < n; i++) {
      const y = y0 + i * 15;
      sv('rect', { x: r1(x - 13), y: r1(y), width: 26, height: 13, rx: 2.5, class: 'zavazi' }, g);
      cara(g, [[x - 13, y + 4], [x + 13, y + 4]], 'tenka c-slaby');
    }
    return [x, y0 + n * 15];
  }
  /* Dítě sedící na prkně v bodě p (hmotnost mění velikost). */
  function dite(g, p, m, k, barva) {
    const sz = 0.72 + m / 110, sk = sv('g', { transform: `translate(${r1(p[0])} ${r1(p[1])}) scale(${sz.toFixed(3)})` }, g);
    sv('path', { d: 'M-11 0 L-9 -34 Q0 -40 9 -34 L11 0Z', class: barva }, sk);
    sv('circle', { cx: 0, cy: -48, r: 11, class: 'kuze' }, sk);
    sv('path', { d: 'M-8 -2 L-14 12 L-6 30 M8 -2 L14 12 L6 30', class: 'cara nohy' }, sk);
    sv('path', { d: 'M-9 -28 L-18 -10 M9 -28 L18 -10', class: 'cara nohy' }, sk);
  }
  function hmotnost(m) { return cisK(m, 1) + ' kg'; }
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

  /* ---------- ikony kapitol v mapě lekce ---------- */
  Object.assign(IKONY, {
    stroje: '<rect x="10" y="30" width="62" height="6" rx="2" class="drevo"/><path d="M41 36 l-7 12 h14z" class="podpera"/><circle cx="112" cy="16" r="9" class="kov"/><path d="M103 16 V44 M121 16 V52" class="lano"/><rect x="95" y="44" width="16" height="12" class="zavazi"/><path d="M130 58 L156 58 L156 38Z" class="rampa"/>',
    moment: '<circle cx="30" cy="34" r="12" class="kov"/><rect x="36" y="29" width="104" height="10" rx="4" class="kov"/><path d="M128 44 V14" class="cara silna c-sila"/><path d="M128 8 l-6 10 h12z" class="vypln c-sila"/><path d="M30 50 H128" class="cara tenka c-rameno"/>',
    rovnovaha: '<rect x="12" y="24" width="136" height="7" rx="3" class="drevo"/><path d="M80 31 l-9 16 h18z" class="podpera"/><path d="M32 31 V38 M138 31 V38" class="cara tenka c-text"/><rect x="24" y="38" width="16" height="9" class="zavazi"/><rect x="24" y="48" width="16" height="9" class="zavazi"/><rect x="130" y="38" width="16" height="9" class="zavazi"/>',
    druhy: '<circle cx="30" cy="50" r="9" fill="none" class="cara c-text"/><path d="M36 42 L70 20 L150 26" class="cara silna c-text"/><circle cx="30" cy="50" r="4" class="osa-bod"/><path d="M80 18 V44" class="cara c-bremeno"/><path d="M146 44 V18" class="cara c-sila"/>',
    kladky: '<rect x="40" y="2" width="80" height="6" class="strop"/><circle cx="66" cy="18" r="9" class="kov"/><circle cx="84" cy="44" r="9" class="kov"/><path d="M57 8 V44 M75 18 V44 M93 44 V18 M75 18 L75 18" class="lano"/><path d="M57 8 L57 44" class="lano"/><path d="M93 18 V58" class="lano"/>',
    hridel: '<circle cx="70" cy="28" r="24" fill="none" class="cara tenka carkovana c-sila"/><circle cx="70" cy="28" r="8" class="drevo"/><path d="M70 28 L90 14" class="cara silna c-text"/><circle cx="90" cy="14" r="4" class="vypln c-sila"/><path d="M78 28 V52" class="lano"/><path d="M72 52 h12 l-2 8 h-8z" class="kov"/>',
    prevody: '<circle cx="54" cy="30" r="16" class="kolo-a kolo-zuby"/><circle cx="96" cy="30" r="26" class="kolo-b kolo-zuby"/><circle cx="54" cy="30" r="3" class="osa-bod"/><circle cx="96" cy="30" r="3" class="osa-bod"/>',
    rovina: '<path d="M10 56 L150 56 L150 14Z" class="rampa"/><rect x="84" y="26" width="18" height="13" class="bremeno-vypln" transform="rotate(-16.7 93 33)"/><path d="M106 26 L132 18" class="cara c-sila"/>',
    zlate: '<path d="M20 54 V6 M20 54 H150" class="cara tenka c-text"/><rect x="20" y="14" width="26" height="40" class="plocha-prace obrys c-bremeno"/><rect x="20" y="44" width="104" height="10" class="plocha-prace c-sila"/>',
  });

  /* ================================================================
     6. Modely kapitol
     ================================================================ */

  /* ---------- 2 · Moment síly: klíč na matici ---------- */
  function modelKlic() {
    const m = new Model('obr-klic', 840, 400), g = m.vrstva;
    const O = [180, 200], SK = 16;      // 1 cm = 16 jednotek
    const s = { r: 20, phi: -90, F: 80, M0: 30, rameno: true };
    MODELY.klic = { m, s };
    const P = () => [O[0] + s.r * SK, O[1]];
    const smer = () => [Math.cos(s.phi * RAD), Math.sin(s.phi * RAD)];
    const delkaSipky = () => 30 + s.F * 0.4;
    const spocti = () => {
      const u = smer(), p = P();
      const rel = V.sub(O, p);
      const d = Math.abs(rel[0] * u[1] - rel[1] * u[0]) / SK;       // rameno v cm
      const Mpov = -(s.r / 100) * s.F * u[1];                          // moment povolující (proti směru hodinových ručiček)
      const alfa = Math.acos(omez(u[0], -1, 1)) / RAD;                 // úhel síly s klíčem
      return { u, p, d, M: s.F * d / 100, Mpov, alfa };
    };
    MODELY.klic.v = spocti;

    m.kresli = gg => {
      const k = m.k, v = spocti(), povoleno = v.Mpov >= s.M0 - 1e-9;
      // klíč
      sv('circle', { cx: O[0], cy: O[1], r: 36, class: 'kov' }, gg);
      sv('rect', { x: O[0] + 24, y: O[1] - 12, width: 30 * SK + 18, height: 24, rx: 11, class: 'kov' }, gg);
      sv('rect', { x: O[0] + 20 * SK, y: O[1] - 12, width: 10 * SK + 18, height: 24, rx: 11, class: 'kov-tmavy', opacity: 0.35 }, gg);
      for (let c = 5; c <= 30; c += 5) {
        const x = O[0] + c * SK;
        cara(gg, [[x, O[1] + 12], [x, O[1] + 20]], 'tenka c-slaby');
        txt(gg, x, O[1] + 34, c + ' cm', 't-maly t-stred');
      }
      // matice (šestihran) se otáčí, když se povoluje
      const mat = sv('g', { class: povoleno ? 'toci' : '' }, gg);
      const hex = [];
      for (let i = 0; i < 6; i++) hex.push([O[0] + 20 * Math.cos(i * Math.PI / 3), O[1] + 20 * Math.sin(i * Math.PI / 3)]);
      mnohouhelnik(mat, hex, 'kov-tmavy');
      sv('circle', { cx: O[0], cy: O[1], r: 9, class: 'kov' }, mat);
      osaBod(gg, O, k, 4.5);
      txt(gg, O[0], O[1] - 48, 'osa otáčení', 't-maly t-stred t-osa');
      // přímka síly a rameno
      const Lp = delkaSipky(), hrotP = V.add(v.p, V.mul(v.u, Lp));
      if (s.rameno) {
        cara(gg, [V.sub(v.p, V.mul(v.u, 900)), V.add(v.p, V.mul(v.u, 900))], 'tenka carkovana c-slaby');
        const t = V.dot(V.sub(O, v.p), v.u), pata = V.add(v.p, V.mul(v.u, t));
        if (v.d > 0.4) {
          cara(gg, [O, pata], 'silna c-rameno');
          const n = V.norm(V.sub(O, pata));
          pravyUhel(gg, pata, n, V.mul(v.u, Math.sign(-t) || 1), k);
          const stred = V.mul(V.add(O, pata), 0.5);
          txt(gg, stred[0] + 10 * k, stred[1] - 8 * k, 'rameno ' + cm(v.d), 't-rameno');
        } else txt(gg, O[0] + 40, O[1] - 60, 'rameno = 0', 't-rameno');
      }
      // ruka a síla
      sv('ellipse', { cx: v.p[0], cy: v.p[1], rx: 16, ry: 19, class: 'ruka' }, gg);
      sipka(gg, v.p, hrotP, k, 'c-sila');
      const lp = V.add(hrotP, V.mul(v.u, 16 * k));
      txt(gg, lp[0], lp[1] + 4 * k, 'F = ' + sila(s.F, 0), 't-sila t-stred');
      // oblouk směru otáčení
      if (Math.abs(v.Mpov) > 0.05) {
        const proti = v.Mpov > 0;
        const a1 = proti ? -0.35 : -2.8, a2 = proti ? -2.8 : -0.35;
        obloukUhlu(gg, O, 56, a1, a2, 'tenka ' + (povoleno ? 'c-rameno' : 'c-slaby'));
        const kon = [O[0] + 56 * Math.cos(a2), O[1] + 56 * Math.sin(a2)];
        const tg = proti ? [Math.sin(a2), -Math.cos(a2)] : [-Math.sin(a2), Math.cos(a2)];
        hrot(gg, kon, tg, k, 0.8, povoleno ? 'c-rameno' : 'c-slaby');
      }
      // ukazatel momentu
      const X = 560, Y = 360, Wd = 240, podil = omez(Math.max(0, v.Mpov) / (s.M0 * 1.5), 0, 1);
      sv('rect', { x: X, y: Y, width: Wd, height: 12, rx: 6, fill: 'var(--bg-control)' }, gg);
      sv('rect', { x: X, y: Y, width: r1(Wd * podil), height: 12, rx: 6, fill: povoleno ? 'var(--ok)' : 'var(--m-sila)' }, gg);
      const xm = X + Wd / 1.5;
      cara(gg, [[xm, Y - 5], [xm, Y + 17]], 'c-osa');
      txt(gg, xm, Y - 10, 'potřeba ' + cisK(s.M0) + ' N·m', 't-maly t-stred t-osa');
      txt(gg, X, Y - 10, 'moment', 't-maly');

      m.odecet([
        ['síla', sila(s.F, 0)], ['ruka od osy', cm(s.r, 0)], ['úhel síly s klíčem', Math.round(v.alfa) + '°'],
        ['rameno síly', cm(v.d)], ['moment', cisK(v.M, 1) + ' N·m'],
      ]);
      if (v.d < 0.4) m.zpravu('Síla míří přímo do osy (nebo od ní). <b>Rameno je nulové</b>, a proto i moment – klíč se neotočí, ať táhneš jakkoli silně.');
      else if (v.Mpov < 0) m.zpravu('Tahle síla by matici <b>utahovala</b>. Otoč šipku síly na druhou stranu klíče.');
      else if (povoleno) m.zpravu(`<span class="ok">✓ Matice se povoluje.</span> Moment ${cisK(v.Mpov, 1)} N·m dosáhl potřebných ${s.M0} N·m.`);
      else m.zpravu(`Moment ${cisK(v.Mpov, 1)} N·m nestačí – matice potřebuje ${s.M0} N·m. Chyť klíč dál od osy, zatlač víc nebo kolměji.`);
    };

    m.uchop({ popis: 'Ruka na klíči – vzdálenost od osy', poloha: () => P(),
      tahni: p => { s.r = omez(Math.round((p[0] - O[0]) / SK), 3, 30); },
      klavesa: dx => { s.r = omez(s.r + dx, 3, 30); }, hodnota: () => cm(s.r, 0) });
    m.uchop({ popis: 'Směr síly', poloha: () => V.add(P(), V.mul(smer(), delkaSipky())),
      tahni: p => { const d = V.sub(p, P()); if (V.len(d) > 8) s.phi = Math.round(Math.atan2(d[1], d[0]) / RAD); },
      klavesa: (dx, dy) => { s.phi = Math.round(obalUhlu((s.phi + 5 * (dx || dy)) * RAD) / RAD); }, hodnota: () => Math.round(spocti().alfa) + '° s klíčem' });

    MODELY.klic.F = posuvnik('klic-F', v => sila(v, 0), v => { s.F = v; m.naplanuj(); });
    MODELY.klic.matice = segment($('#klic-matice'), s.M0, v => { s.M0 = +v; m.naplanuj(); });
    prepinac('klic-rameno', v => { s.rameno = v; m.naplanuj(); });

    Ukoly.definuj('mom-povol', () => s.M0 === 30 && s.F <= 120 && spocti().Mpov >= 30 - 1e-9,
      'Při síle 120 N potřebuješ rameno aspoň 30 N·m : 120 N = 0,25 m. Klíč musíš chytit nejméně 25 cm od osy a táhnout kolmo.');
    Ukoly.definuj('mom-sikmo', () => { const v = spocti(); return s.r >= 28 && (Math.abs(v.alfa - 30) <= 2 || Math.abs(v.alfa - 150) <= 2); },
      'Rameno síly (zelená kolmice) je teď jen polovina vzdálenosti ruky od osy. Stejná síla má poloviční moment – proto na klíč tlačíme kolmo.');
    predpoved('mom-konec', {
      otazka: 'Matice je <b>zarezlá</b>. Kam je nejlepší klíč chytit, abys ji povolil(a) co nejmenší silou?',
      moznosti: ['Co nejblíž k matici – tam je síla „nejblíž u věci“', 'Doprostřed klíče', 'Na úplný konec klíče'],
      spravna: 2,
      proc: ['Blízko osy je rameno krátké a moment malý – potřebuješ obrovskou sílu.', 'Uprostřed je rameno jen poloviční – síla musí být dvojnásobná.'],
      vyzkousej: 'Přepni matici na <b>zarezlou</b> (60 N·m) a povol ji silou <b>nejvýš 200 N</b>. Kam musíš ruku posunout?',
      splneno: () => s.M0 === 60 && s.F <= 200 && spocti().Mpov >= 60 - 1e-9,
      vysvetleni: 'Moment <i>M</i> = <i>F</i> · <i>r</i>. Při síle 200 N potřebuješ rameno 60 N·m : 200 N = 0,3 m – celou délku klíče. Kdo chytí klíč u matice, nepovolí ji ani silou 1000 N.',
    });
    predpoved('mom-podel', {
      otazka: 'Co se stane, když za konec klíče zatáhneš <b>podél klíče</b> – směrem od matice – silou 300 N?',
      moznosti: ['Matice se povolí – 300 N je velká síla', 'Matice se neotočí vůbec', 'Matice se otočí jen trochu'],
      spravna: 1,
      proc: ['Velikost síly nestačí – záleží i na směru. Tahle síla míří od osy.', 'Moment je buď dost velký, nebo ne. Tady je nulový.'],
      vyzkousej: 'Nastav sílu <b>300 N</b> a otoč šipku tak, aby mířila <b>podél klíče od matice</b>.',
      splneno: () => { const v = spocti(); return s.F >= 300 && v.u[0] > 0.99; },
      vysvetleni: 'Přímka síly prochází osou, rameno je nulové, a tak i moment <i>M</i> = 300 N · 0 m = 0. Síla klíč jen táhne pryč od matice.',
    });
  }

  /* ---------- 3a · Školní páka se závažím ---------- */
  function modelLab() {
    const m = new Model('obr-lab', 800, 430), g = m.vrstva;
    const C = [400, 150], D = 50, CM = 5;        // dírky po 50 jednotkách = 5 cm
    const s = { nL: 2, pL: 3, nR: 2, pR: 5, uhel: 0, momenty: true };
    MODELY.lab = { m, s };
    const ML = () => s.nL * s.pL * CM / 100, MR = () => s.nR * s.pR * CM / 100;   // N·m
    const bod = (pos, uhel) => [C[0] + pos * D * Math.cos(uhel * RAD), C[1] + pos * D * Math.sin(uhel * RAD)];
    const spust = animace(m, dt => kCili(s, 'uhel', cil(), dt));
    const cil = () => { const d = s.nR * s.pR - s.nL * s.pL; return d === 0 ? 0 : Math.sign(d) * 11; };

    // stojan (statický)
    const st = m.staticka;
    sv('rect', { x: C[0] - 6, y: C[1], width: 12, height: 212, class: 'kov' }, st);
    sv('rect', { x: C[0] - 90, y: C[1] + 206, width: 180, height: 12, rx: 3, class: 'kov' }, st);

    m.kresli = gg => {
      const k = m.k, u = s.uhel, c = cil();
      if (Math.abs(u - c) > 1e-3) spust();
      const dir = [Math.cos(u * RAD), Math.sin(u * RAD)], n = [-dir[1], dir[0]];
      // tyč s dírkami
      const a = bod(-6.3, u), b = bod(6.3, u);
      mnohouhelnik(gg, [V.add(a, V.mul(n, -8)), V.add(b, V.mul(n, -8)), V.add(b, V.mul(n, 8)), V.add(a, V.mul(n, 8))], 'drevo');
      for (let i = -6; i <= 6; i++) {
        if (!i) continue;
        const p = bod(i, u);
        sv('circle', { cx: r1(p[0]), cy: r1(p[1]), r: 3.2, fill: 'var(--bg-deep)' }, gg);
        const t = V.add(p, V.mul(n, -17 * k));
        txt(gg, t[0], t[1] + 4 * k, String(Math.abs(i)), 't-maly t-stred');
      }
      osaBod(gg, C, k, 6);
      // závaží a tíhy
      const strany = [[-s.pL, s.nL, 'c-bremeno', 't-bremeno', 'F₁'], [s.pR, s.nR, 'c-sila', 't-sila', 'F₂']];
      for (const [pos, n_, cls, tcls, jm] of strany) {
        const hak = bod(pos, u);
        const dno = stohZavazi(gg, hak, n_, k);
        sipka(gg, [hak[0], dno[1] + 4], [hak[0], dno[1] + 10 + n_ * 9], k, cls);
        txt(gg, hak[0] + (pos < 0 ? -14 : 14) * k, dno[1] + 12 + n_ * 4.5, `${jm} = ${n_} N`, tcls + (pos < 0 ? ' t-konec' : ''));
      }
      // ramena
      const yk = C[1] - 44;
      const xL = bod(-s.pL, u)[0], xR = bod(s.pR, u)[0];
      kota(gg, [xL, yk], [C[0], yk], k, 'r₁ = ' + cm(s.pL * CM, 0));
      kota(gg, [C[0], yk], [xR, yk], k, 'r₂ = ' + cm(s.pR * CM, 0));
      cara(gg, [[C[0], yk - 8], [C[0], C[1]]], 'tenka carkovana c-slaby');
      // momenty jako pruhy
      if (s.momenty) {
        const Y = 400, sk = 280 / 36;
        const mL = s.nL * s.pL, mR = s.nR * s.pR;
        sv('rect', { x: r1(C[0] - mL * sk), y: Y, width: r1(mL * sk), height: 14, rx: 3, class: 'vypln c-bremeno', opacity: 0.8 }, gg);
        sv('rect', { x: C[0], y: Y, width: r1(mR * sk), height: 14, rx: 3, class: 'vypln c-sila', opacity: 0.8 }, gg);
        cara(gg, [[C[0], Y - 6], [C[0], Y + 20]], 'c-text');
        txt(gg, C[0] - mL * sk - 8, Y + 12, 'M₁ = ' + cisK(ML(), 2) + ' N·m', 't-maly t-konec t-bremeno');
        txt(gg, C[0] + mR * sk + 8, Y + 12, 'M₂ = ' + cisK(MR(), 2) + ' N·m', 't-maly t-sila');
      }
      m.odecet([
        ['vlevo', `${s.nL} N · ${cisK(s.pL * CM / 100, 2)} m = ${cisK(ML(), 2)} N·m`],
        ['vpravo', `${s.nR} N · ${cisK(s.pR * CM / 100, 2)} m = ${cisK(MR(), 2)} N·m`],
      ]);
      const d = s.nR * s.pR - s.nL * s.pL;
      if (!d) m.zpravu(`<span class="ok">✓ Rovnováha.</span> Momenty jsou stejné: ${s.nL} N · ${s.pL * CM} cm = ${s.nR} N · ${s.pR * CM} cm.`);
      else m.zpravu(`Páka se otáčí na stranu <b>většího momentu</b> – převažuje ${d < 0 ? 'levá' : 'pravá'} strana (${cisK(Math.max(ML(), MR()), 2)} N·m &gt; ${cisK(Math.min(ML(), MR()), 2)} N·m).`);
    };
    const tahni = strana => p => {
      const cos = Math.cos(s.uhel * RAD) || 1;
      const i = Math.round((p[0] - C[0]) / D / cos);
      if (strana < 0) s.pL = omez(-i, 1, 6); else s.pR = omez(i, 1, 6);
    };
    m.uchop({ popis: 'Háček se závažím vlevo', poloha: () => bod(-s.pL, s.uhel), tahni: tahni(-1),
      klavesa: dx => { s.pL = omez(s.pL - dx, 1, 6); }, hodnota: () => s.pL + '. dírka' });
    m.uchop({ popis: 'Háček se závažím vpravo', poloha: () => bod(s.pR, s.uhel), tahni: tahni(1),
      klavesa: dx => { s.pR = omez(s.pR + dx, 1, 6); }, hodnota: () => s.pR + '. dírka' });
    const fmt = v => `${v} × 1 N`;
    const nL = posuvnik('lab-nL', fmt, v => { s.nL = v; m.naplanuj(); });
    const nR = posuvnik('lab-nR', fmt, v => { s.nR = v; m.naplanuj(); });
    MODELY.lab.nastav = (a, pa, b, pb) => { s.pL = pa; s.pR = pb; nL.nastav(a); nR.nastav(b); };
    prepinac('lab-momenty', v => { s.momenty = v; m.naplanuj(); });
    $('#lab-vychozi').addEventListener('click', () => MODELY.lab.nastav(2, 3, 2, 5));
    const vyvazeno = () => s.nL * s.pL === s.nR * s.pR;

    Ukoly.definuj('rov-4na3', () => s.nL === 4 && s.pL === 3 && s.nR === 2 && vyvazeno(),
      '4 N · 15 cm = 2 N · 30 cm. Poloviční síla potřebuje dvojnásobné rameno – dvě závaží patří na 6. dírku.');
    Ukoly.definuj('rov-1zavazi', () => s.nL === 6 && s.pL === 1 && s.nR === 1 && vyvazeno(),
      '6 N · 5 cm = 1 N · 30 cm. Jediné závaží vyrovná šest, když má šestkrát delší rameno.');
    predpoved('rov-posun', {
      otazka: 'Na páce visí vlevo i vpravo <b>2 závaží na 3. dírce</b> – páka je v rovnováze. Co se stane, když pravá závaží posuneš o <b>jednu dírku dál</b> od osy?',
      moznosti: ['Nic – závaží jsou pořád stejně těžká', 'Pravá strana klesne', 'Levá strana klesne'],
      spravna: 1,
      proc: ['Tíhy se nezměnily, ale rozhoduje součin síly a ramene – a pravé rameno se prodloužilo.', null, 'Levá strana zůstala stejná, zvětšil se moment vpravo.'],
      priTipu: () => MODELY.lab.nastav(2, 3, 2, 3),
      vyzkousej: 'Páka je připravená (2 a 2 závaží na 3. dírkách). Posuň pravý háček na <b>4. dírku</b>.',
      splneno: () => s.nL === 2 && s.pL === 3 && s.nR === 2 && s.pR === 4,
      vysvetleni: 'Vpravo je teď moment 2 N · 20 cm = 0,4 N·m, vlevo jen 2 N · 15 cm = 0,3 N·m. Páka se otočí na stranu většího momentu.',
    });
  }

  /* ---------- 3b · Houpačka ---------- */
  function modelHoupacka() {
    const m = new Model('obr-houpacka', 840, 370), g = m.vrstva;
    const C = [420, 232], SK = 180, ZEM = 292;       // 1 m = 180 jednotek; prkno 4 m
    const s = { m1: 40, x1: 1.0, m2: 25, x2: 1.5, uhel: 0, sily: true };
    MODELY.houpacka = { m, s };
    const M1 = () => s.m1 * G_ZEM * s.x1, M2 = () => s.m2 * G_ZEM * s.x2;
    const cil = () => { const d = M2() - M1(); return Math.abs(d) < 1e-6 ? 0 : Math.sign(d) * 9.6; };
    const spust = animace(m, dt => kCili(s, 'uhel', cil(), dt, 30));
    const bod = (x, uhel) => [C[0] + x * SK * Math.cos(uhel * RAD), C[1] + x * SK * Math.sin(uhel * RAD)];

    zem(m.staticka, 20, 820, ZEM, 1);
    mnohouhelnik(m.staticka, [C, [C[0] - 34, ZEM], [C[0] + 34, ZEM]], 'podpera');

    m.kresli = gg => {
      const k = m.k, u = s.uhel;
      if (Math.abs(u - cil()) > 1e-3) spust();
      const dir = [Math.cos(u * RAD), Math.sin(u * RAD)], n = [-dir[1], dir[0]];
      const a = bod(-2, u), b = bod(2, u);
      mnohouhelnik(gg, [V.add(a, V.mul(n, -9)), V.add(b, V.mul(n, -9)), V.add(b, V.mul(n, 3)), V.add(a, V.mul(n, 3))], 'drevo');
      osaBod(gg, C, k, 6);
      const deti = [[-s.x1, s.m1, 'dite-a', 'c-bremeno', 't-bremeno', 'G₁'], [s.x2, s.m2, 'dite-b', 'c-sila', 't-sila', 'G₂']];
      for (const [x, mm, barva, cls, tcls, jm] of deti) {
        const p = V.add(bod(x, u), V.mul(n, -9));
        dite(gg, p, mm, k, barva);
        if (s.sily) {
          const G = mm * G_ZEM, konec = [p[0], p[1] + 16 + G * 0.12];
          sipka(gg, [p[0], p[1] + 6], konec, k, cls);
          txt(gg, p[0] + (x < 0 ? -12 : 12) * k, konec[1] - 2, `${jm} = ${sila(G, 0)}`, tcls + (x < 0 ? ' t-konec' : ''));
        }
      }
      if (s.sily) {
        const x1 = bod(-s.x1, u)[0], x2 = bod(s.x2, u)[0];
        kota(gg, [x1, ZEM + 30], [C[0], ZEM + 30], k, 'r₁ = ' + metry(s.x1, 1), { strana: 1 });
        kota(gg, [C[0], ZEM + 30], [x2, ZEM + 30], k, 'r₂ = ' + metry(s.x2, 1), { strana: 1 });
      }
      m.odecet([
        ['vlevo', `${sila(s.m1 * G_ZEM, 0)} · ${metry(s.x1, 1)} = ${cisK(M1(), 0)} N·m`],
        ['vpravo', `${sila(s.m2 * G_ZEM, 0)} · ${metry(s.x2, 1)} = ${cisK(M2(), 0)} N·m`],
      ]);
      const d = M2() - M1();
      if (Math.abs(d) < 1e-6) m.zpravu(`<span class="ok">✓ Rovnováha.</span> Obě děti mají stejný moment ${cisK(M1(), 0)} N·m.`);
      else {
        const lehci = s.m1 === s.m2 ? null : (s.m1 < s.m2 ? 'levé' : 'pravé');
        const dolu = d > 0 ? 'pravé' : 'levé';
        m.zpravu(`Dolů jde <b>${dolu}</b> dítě – má větší moment.` + (lehci === dolu ? ' Je sice lehčí, ale sedí dál od osy.' : ''));
      }
    };
    const tahni = strana => p => {
      const cos = Math.cos(s.uhel * RAD) || 1;
      const x = Math.round(((p[0] - C[0]) / SK / cos) * 10) / 10;
      if (strana < 0) s.x1 = omez(-x, 0.2, 2); else s.x2 = omez(x, 0.2, 2);
    };
    const nad = x => { const u = s.uhel, n = [Math.sin(u * RAD), -Math.cos(u * RAD)]; return V.add(bod(x, u), V.mul(n, 30)); };
    m.uchop({ popis: 'Dítě vlevo – vzdálenost od osy', poloha: () => nad(-s.x1), tahni: tahni(-1),
      klavesa: dx => { s.x1 = omez(Math.round((s.x1 - dx * 0.1) * 10) / 10, 0.2, 2); }, hodnota: () => metry(s.x1, 1) });
    m.uchop({ popis: 'Dítě vpravo – vzdálenost od osy', poloha: () => nad(s.x2), tahni: tahni(1),
      klavesa: dx => { s.x2 = omez(Math.round((s.x2 + dx * 0.1) * 10) / 10, 0.2, 2); }, hodnota: () => metry(s.x2, 1) });
    const p1 = posuvnik('hou-m1', hmotnost, v => { s.m1 = v; m.naplanuj(); });
    const p2 = posuvnik('hou-m2', hmotnost, v => { s.m2 = v; m.naplanuj(); });
    prepinac('hou-sily', v => { s.sily = v; m.naplanuj(); });
    MODELY.houpacka.nastav = (m1, x1, m2, x2) => { s.x1 = x1; s.x2 = x2; p1.nastav(m1); p2.nastav(m2); };
    $('#rov-priklad-model').addEventListener('click', () => {
      MODELY.houpacka.nastav(75, 0.8, 30, 2);
      $('#obr-houpacka').scrollIntoView({ behavior: bezPohybu() ? 'auto' : 'smooth', block: 'center' });
    });
    Ukoly.definuj('hou-lehci', () => s.m1 !== s.m2 && (s.m1 < s.m2 ? M1() > M2() : M2() > M1()),
      'Lehčí dítě sedí dál od osy, a tak má větší moment. Houpačka se naklání podle momentů, ne podle hmotností.');
  }

  /* ---------- 4 · Stavební kolečko ---------- */
  function modelKolecko() {
    const m = new Model('obr-kolecko', 820, 380), g = m.vrstva;
    const O = [150, 268], SK = 400, R2 = 1.4, ZEM = 313;      // 1 m = 400 jednotek
    const s = { m: 80, x: 0.55, bylDaleko: false };
    MODELY.kolecko = { m, s };
    const F = () => s.m * G_ZEM * s.x / R2;
    const H = [O[0] + R2 * SK, 222];
    const naRame = x => [O[0] + x * SK, O[1] + (H[1] - O[1]) * x / R2];

    const st = m.staticka;
    zem(st, 30, 800, ZEM, 1);
    // kolo, rám, korba, noha
    sv('circle', { cx: O[0], cy: O[1], r: 45, fill: 'var(--m-kov-tmavy)' }, st);
    sv('circle', { cx: O[0], cy: O[1], r: 30, fill: 'var(--bg-deep)', stroke: 'var(--m-kov)', 'stroke-width': 3 }, st);
    cara(st, [O, H], 'silna c-kov');
    cara(st, [naRame(1.05), [O[0] + 1.05 * SK + 6, ZEM - 18]], 'silna c-kov');
    mnohouhelnik(st, [[O[0] + 0.08 * SK, 150], [O[0] + 0.85 * SK, 150], [O[0] + 0.72 * SK, naRame(0.72)[1] - 10], [O[0] + 0.14 * SK, naRame(0.14)[1] - 10]], 'kov');
    sv('rect', { x: H[0] - 8, y: H[1] - 7, width: 44, height: 14, rx: 7, fill: 'var(--m-kov-tmavy)' }, st);

    m.kresli = gg => {
      const k = m.k, G = s.m * G_ZEM, f = F();
      if (s.x >= 0.7) s.bylDaleko = true;
      osaBod(gg, O, k, 6);
      txt(gg, O[0], O[1] + 64, 'osa', 't-maly t-stred t-osa');
      // náklad (cihly)
      const w = 40 + s.m * 0.45, h = 20 + s.m * 0.22, cx = O[0] + s.x * SK, y0 = 196;
      sv('rect', { x: r1(cx - w / 2), y: r1(y0 - h), width: r1(w), height: r1(h), rx: 3, class: 'bremeno-vypln' }, gg);
      for (let yy = y0 - h + 10; yy < y0; yy += 10) cara(gg, [[cx - w / 2, yy], [cx + w / 2, yy]], 'tenka c-bremeno');
      txt(gg, cx, y0 - h - 8, hmotnost(s.m), 't-maly t-stred t-bremeno');
      // síly
      const tez = [cx, y0 - h / 2];
      sipka(gg, tez, [cx, tez[1] + 30 + G * 0.1], k, 'c-bremeno');
      txt(gg, cx + 12, tez[1] + 30 + G * 0.1, 'G = ' + sila(G, 0), 't-bremeno');
      sipka(gg, [H[0] + 20, H[1] - 4], [H[0] + 20, H[1] - 14 - f * 0.1], k, 'c-sila');
      txt(gg, H[0] + 32, H[1] - 14 - f * 0.1 + 12, 'F = ' + sila(f, 0), 't-sila');
      // ramena
      kota(gg, [O[0], ZEM + 24], [cx, ZEM + 24], k, 'r₁ = ' + metry(s.x, 2), { strana: 1 });
      kota(gg, [O[0], ZEM + 50], [H[0] + 20, ZEM + 50], k, 'r₂ = ' + metry(R2, 1), { strana: 1 });
      cara(gg, [[cx, tez[1]], [cx, ZEM + 24]], 'tenka teckovana c-slaby');
      cara(gg, [[H[0] + 20, H[1]], [H[0] + 20, ZEM + 50]], 'tenka teckovana c-slaby');
      m.odecet([['tíha nákladu', sila(G, 0)], ['r₁', metry(s.x, 2)], ['r₂', metry(R2, 1)], ['síla rukou', sila(f, 0)]]);
      m.zpravu(`Rukama zvedáš jen <b>${sila(f, 0)}</b> – jako by náklad vážil ${cisK(f / G_ZEM, 0)} kg místo ${s.m} kg. Rukojeti jsou ${cisK(R2 / s.x, 1)}× dál od osy než náklad.`);
    };
    m.uchop({ popis: 'Náklad – vzdálenost od osy kola', poloha: () => [O[0] + s.x * SK, 180 - s.m * 0.11],
      tahni: p => { s.x = omez(Math.round((p[0] - O[0]) / SK * 20) / 20, 0.2, 0.75); },
      klavesa: dx => { s.x = omez(Math.round((s.x + dx * 0.05) * 20) / 20, 0.2, 0.75); }, hodnota: () => metry(s.x, 2) });
    posuvnik('kol-m', hmotnost, v => { s.m = v; m.naplanuj(); });
    Ukoly.definuj('kol-250', () => s.m === 100 && F() <= 250 + 1e-9,
      'F = 1000 N · 0,35 m : 1,4 m = 250 N. Náklad blízko osy má krátké rameno – a malý moment.');
    predpoved('kol-kam', {
      otazka: 'Vezeš <b>100 kg</b> cihel. Kam je do kolečka naložíš, aby se rukojeti zvedaly co nejsnáz?',
      moznosti: ['Co nejblíž ke kolu', 'Doprostřed korby', 'Co nejblíž k rukojetím – ať je váha u rukou'],
      spravna: 0,
      proc: [null, 'Uprostřed je rameno nákladu delší než u kola, síla bude větší.', 'U rukojetí má náklad nejdelší rameno – nesl(a) bys skoro celou tíhu.'],
      vyzkousej: 'Nastav náklad <b>100 kg</b>, posuň ho nejdřív co nejblíž k rukojetím a pak co nejblíž ke kolu. Sleduj sílu rukou.',
      priTipu: () => { s.bylDaleko = false; },
      splneno: () => s.m === 100 && s.bylDaleko && s.x <= 0.25,
      vysvetleni: 'Osa je v kole. Náklad blízko kola má krátké rameno, a tak jeho moment i potřebná síla rukou jsou malé. U rukojetí bys nesl(a) skoro celou tíhu.',
    });
  }

  /* ---------- 4 · Předloktí (pro zvídavé) ---------- */
  function modelPredlokti() {
    const m = new Model('obr-predlokti', 700, 320);
    const E = [170, 226], SK = 14, s = { m: 2 };
    MODELY.predlokti = { m, s };
    const st = m.staticka;
    sv('path', { d: `M${E[0] - 26} 10 L${E[0] + 20} 10 L${E[0] + 22} ${E[1] - 10} L${E[0] - 22} ${E[1] + 16}Z`, class: 'kuze', opacity: 0.55 }, st);
    sv('path', { d: `M${E[0] - 10} ${E[1] - 20} L${E[0] + 32 * SK} ${E[1] - 16} L${E[0] + 32 * SK + 6} ${E[1] + 14} L${E[0] - 12} ${E[1] + 20}Z`, class: 'kuze', opacity: 0.55 }, st);
    sv('path', { d: `M${E[0] - 4} 40 C${E[0] + 46} 90 ${E[0] + 64} 180 ${E[0] + 4 * SK} ${E[1] - 12} L${E[0] + 4 * SK - 14} ${E[1] - 14} C${E[0] + 30} 170 ${E[0] + 18} 90 ${E[0] - 16} 44Z`, class: 'sval' }, st);
    txt(st, E[0] + 70, 110, 'biceps', 't-maly');
    m.kresli = gg => {
      const k = m.k, G = s.m * G_ZEM, Fs = G * 32 / 4;
      osaBod(gg, E, k, 6);
      txt(gg, E[0] - 16, E[1] + 30, 'loket = osa', 't-maly t-osa');
      const H = [E[0] + 32 * SK, E[1] - 18];
      if (s.m > 0) sv('circle', { cx: H[0], cy: H[1] - 10 - s.m * 1.4, r: r1(10 + s.m * 1.6), class: 'zavazi' }, gg);
      const A = [E[0] + 4 * SK, E[1] - 12];
      sipka(gg, A, [A[0], A[1] - 12 - Math.max(0, Fs) * 0.28], k, 'c-sila');
      txt(gg, A[0] + 12, A[1] - 12 - Fs * 0.28 + 14, 'F sval = ' + sila(Fs, 0), 't-sila');
      if (G > 0) {
        sipka(gg, [H[0], E[1]], [H[0], E[1] + 12 + G * 0.28], k, 'c-bremeno');
        txt(gg, H[0] - 12, E[1] + 26, 'G = ' + sila(G, 0), 't-bremeno t-konec');
      }
      kota(gg, [E[0], E[1] + 46], [A[0], E[1] + 46], k, '4 cm', { strana: -1 });
      kota(gg, [E[0], E[1] + 70], [H[0], E[1] + 70], k, '32 cm', { strana: 1 });
      m.odecet([['v dlani', hmotnost(s.m)], ['tíha', sila(G, 0)], ['síla bicepsu', sila(Fs, 0)], ['poměr', '8×']]);
    };
    posuvnik('ruka-m', hmotnost, v => { s.m = v; m.naplanuj(); });
    const det = m.fig.closest('details');
    if (det) det.addEventListener('toggle', () => m.naplanuj());
  }

  /* ---------- 5 · Kladky a kladkostroj ---------- */
  function modelKladky() {
    const m = new Model('obr-kladky', 760, 480), g = m.vrstva;
    const R = 20, SKH = 2, STROP = 34;       // svisle 1 cm = 2 jednotky
    const s = { druh: 'kladkostroj', k: 2, G: 400, h: 0, cilH: null };
    MODELY.kladky = { m, s };
    const n = () => s.druh === 'pevna' ? 1 : s.druh === 'volna' ? 2 : 2 * s.k;
    const hMax = () => s.druh === 'volna' ? 40 : Math.min(45, Math.floor(120 / n()));
    const F = () => s.G / n();
    const spust = animace(m, dt => {
      if (s.cilH == null) return false;
      const krok = 30 * dt, d = s.cilH - s.h;
      if (Math.abs(d) <= krok || bezPohybu()) { s.h = s.cilH; s.cilH = null; return false; }
      s.h += Math.sign(d) * krok;
      return true;
    });
    sv('rect', { x: 60, y: 0, width: 640, height: STROP, class: 'strop' }, m.staticka);

    // geometrie: vrátí kladky, prameny (nosné zvlášť), háček břemene a polohu ruky
    function sestava() {
      const hs = s.h * SKH, nn = n();
      const kl = [], pr = [], nos = [];
      let hak, ruka, smerRuky;
      if (s.druh === 'pevna') {
        const T = [330, 96];
        kl.push({ c: T, pevna: true });
        pr.push([[T[0], STROP], T, true]);
        hak = [T[0] - R, 330 - hs];
        nos.push([[T[0] - R, T[1]], hak]);
        ruka = [T[0] + R, 250 + hs]; smerRuky = 1;
        pr.push([[T[0] + R, T[1]], ruka]);
      } else if (s.druh === 'volna') {
        const B = [330, 330 - hs];
        kl.push({ c: B });
        nos.push([[B[0] - R, STROP], [B[0] - R, B[1]]]);
        ruka = [B[0] + R, 300 - 2 * hs]; smerRuky = -1;
        nos.push([[B[0] + R, B[1]], ruka]);
        hak = [B[0], B[1] + R + 22];
        pr.push([B, hak]);
      } else {
        const X0 = 270, yT = 92, yB = 316 - hs;
        const bottom = [];
        for (let i = 0; i < s.k; i++) {
          const xb = X0 + 4 * R * i, xt = xb + 2 * R;
          kl.push({ c: [xt, yT], pevna: true });
          kl.push({ c: [xb, yB] });
          bottom.push(xb);
          nos.push([[xb + R, yB], [xt - R, yT]]);
          if (i === 0) nos.push([[xb - R, yT - 18], [xb - R, yB]]);
          else nos.push([[xb - R, yB], [X0 + 4 * R * (i - 1) + 2 * R + R, yT]]);
        }
        const xk = X0 + 4 * R * (s.k - 1) + 2 * R;
        ruka = [xk + R, 200 + n() * hs]; smerRuky = 1;
        pr.push([[xk + R, yT], ruka]);
        // horní kladnice a spodní třmen
        pr.push([[X0 - R, yT - 18], [xk + R, yT - 18], true]);
        pr.push([[X0 + (xk - X0) / 2, STROP], [X0 + (xk - X0) / 2, yT - 18], true]);
        for (let i = 0; i < s.k; i++) pr.push([[X0 + 4 * R * i + 2 * R, yT - 18], [X0 + 4 * R * i + 2 * R, yT], true]);
        const xs = (bottom[0] + bottom[bottom.length - 1]) / 2;
        pr.push([[bottom[0] - R * 0.6, yB + R + 8], [bottom[bottom.length - 1] + R * 0.6, yB + R + 8], true]);
        for (const xb of bottom) pr.push([[xb, yB], [xb, yB + R + 8], true]);
        hak = [xs, yB + R + 22];
        pr.push([[xs, yB + R + 8], hak]);
      }
      return { kl, pr, nos, hak, ruka, smerRuky, nn };
    }
    MODELY.kladky.sestava = sestava;

    m.kresli = gg => {
      const k = m.k, S = sestava(), f = F();
      // lana
      for (const [a, b, kov] of S.pr) cara(gg, [a, b], kov ? 'silna c-kov' : 'c-slaby');
      for (const [a, b] of S.nos) sv('path', { d: dCesta([a, b]), class: 'lano' }, gg);
      // nosné prameny: ty, které drží spodní kladky (nebo břemeno u pevné kladky)
      const nosne = s.druh === 'pevna' ? [S.nos[0]] : S.nos;
      [...nosne].sort((p, q) => p[0][0] - q[0][0]).forEach(([a, b], i) => {
        const yS = (a[1] + b[1]) / 2, x = a[0];
        sv('circle', { cx: r1(x), cy: r1(yS), r: 8.5, fill: 'var(--bg-panel)', stroke: 'var(--m-bremeno)', 'stroke-width': 1.5 }, gg);
        txt(gg, x, yS + 4, String(i + 1), 't-maly t-stred t-bremeno');
      });
      // kladky
      for (const q of S.kl) {
        sv('circle', { cx: r1(q.c[0]), cy: r1(q.c[1]), r: R, class: 'kov' }, gg);
        sv('circle', { cx: r1(q.c[0]), cy: r1(q.c[1]), r: R - 6, fill: 'none', stroke: 'var(--m-kov-tmavy)', 'stroke-width': 1.2 }, gg);
        sv('circle', { cx: r1(q.c[0]), cy: r1(q.c[1]), r: 3.5, class: q.pevna ? 'osa-bod' : 'kov-tmavy' }, gg);
      }
      // volné lano pro ruku (pevná kladka) – ruka táhne dolů
      if (s.druh === 'pevna') sv('path', { d: dCesta([[S.kl[0].c[0] + R, S.kl[0].c[1]], S.ruka]), class: 'lano' }, gg);
      if (s.druh === 'kladkostroj') sv('path', { d: dCesta(S.pr[0]), class: 'lano' }, gg);
      // břemeno
      const bw = 70 + s.G * 0.05, bh = 44 + s.G * 0.03;
      cara(gg, [S.hak, [S.hak[0], S.hak[1] + 10]], 'c-text');
      sv('rect', { x: r1(S.hak[0] - bw / 2), y: r1(S.hak[1] + 10), width: r1(bw), height: r1(bh), rx: 4, class: 'bremeno-vypln' }, gg);
      txt(gg, S.hak[0], S.hak[1] + 10 + bh / 2 + 5, sila(s.G, 0), 't-stred t-bremeno');
      const dno = S.hak[1] + 10 + bh;
      sipka(gg, [S.hak[0], dno + 2], [S.hak[0], dno + 10 + s.G * 0.09], k, 'c-bremeno');
      txt(gg, S.hak[0] + 12, dno + 16, 'G', 't-bremeno');
      // ruka se siloměrem
      const rk = S.ruka, sm = S.smerRuky;
      sv('rect', { x: r1(rk[0] - 8), y: r1(sm > 0 ? rk[1] : rk[1] - 56), width: 16, height: 56, rx: 4, fill: 'var(--bg-panel)', stroke: 'var(--m-sila)', 'stroke-width': 1.6 }, gg);
      const ruk = [rk[0], rk[1] + sm * 70];
      sv('ellipse', { cx: r1(ruk[0]), cy: r1(ruk[1]), rx: 14, ry: 16, class: 'ruka' }, gg);
      sipka(gg, [rk[0] + 26, rk[1] + sm * 20], [rk[0] + 26, rk[1] + sm * (30 + f * 0.09)], k, 'c-sila');
      txt(gg, rk[0] + 40, rk[1] + sm * 34, 'F = ' + sila(f, 0), 't-sila');
      // dráhy
      if (s.h > 0.5) {
        const xh = S.hak[0] - bw / 2 - 16;
        kota(gg, [xh, dno + s.h * SKH], [xh, dno], k, 'h = ' + cm(s.h, 0), { cls: 'c-draha', tcls: 't-draha', strana: 1 });
        const xs = rk[0] + 66, y0 = rk[1] - sm * n() * s.h * SKH;
        kota(gg, [xs, y0], [xs, rk[1]], k, 's = ' + cm(n() * s.h, 0), { cls: 'c-draha', tcls: 't-draha', strana: -1 });
      }
      m.odecet([
        ['nosné prameny', 'n = ' + n()], ['síla', `F = ${s.G} N : ${n()} = ${sila(f, 1)}`],
        ['břemeno stouplo', 'h = ' + cm(s.h, 0)], ['lana vytaženo', 's = ' + cm(n() * s.h, 0)],
        ['práce', `F · s = ${cisK(f * n() * s.h / 100, 1)} J, G · h = ${cisK(s.G * s.h / 100, 1)} J`],
      ]);
      const text = {
        pevna: 'Pevná kladka jen <b>mění směr</b> síly – táhneš dolů celou tíhou břemene.',
        volna: 'Břemeno visí na <b>dvou pramenech</b>; každý nese polovinu tíhy. Ruka ale táhne nahoru a urazí dvojnásobnou dráhu.',
        kladkostroj: `Břemeno visí na <b>${n()} pramenech</b> – síla je ${n()}× menší, lana ale vytáhneš ${n()}× víc.`,
      };
      m.zpravu(text[s.druh]);
    };
    m.uchop({ popis: 'Ruka se siloměrem – táhni za lano', poloha: () => { const S = sestava(); return [S.ruka[0], S.ruka[1] + S.smerRuky * 70]; },
      tahni: p => {
        const nn = n(), S0 = s.h; s.h = 0;
        const S = sestava(); s.h = S0;
        const posun = (p[1] - (S.ruka[1] + S.smerRuky * 70)) * S.smerRuky;
        s.h = omez(Math.round(posun / (nn * SKH)), 0, hMax()); s.cilH = null;
      },
      klavesa: (dx, dy) => { s.h = omez(s.h + (dy || dx) * 2, 0, hMax()); s.cilH = null; }, hodnota: () => 'zvednuto ' + cm(s.h, 0) });

    const obal = $('#kl-n-obal');
    const zobraz = () => { obal.hidden = s.druh !== 'kladkostroj'; obal.style.display = s.druh === 'kladkostroj' ? '' : 'none'; };
    MODELY.kladky.druh = segment($('#kl-druh'), s.druh, v => { s.druh = v; s.h = 0; s.cilH = null; zobraz(); m.naplanuj(); });
    const pn = posuvnik('kl-n', v => v + ' (n = ' + 2 * v + ')', v => { s.k = v; s.h = 0; s.cilH = null; m.naplanuj(); });
    const pG = posuvnik('kl-G', v => sila(v, 0), v => { s.G = v; m.naplanuj(); });
    zobraz();
    MODELY.kladky.nastav = (druh, k, G) => { s.druh = druh; MODELY.kladky.druh(druh); zobraz(); pn.nastav(k); pG.nastav(G); s.h = 0; m.naplanuj(); };
    $('#kl-tahni').addEventListener('click', () => { s.cilH = hMax(); spust(); });
    $('#kl-dolu').addEventListener('click', () => { s.cilH = 0; spust(); });
    $('#kl-priklad-model').addEventListener('click', () => {
      MODELY.kladky.nastav('kladkostroj', 2, 240);
      $('#obr-kladky').scrollIntoView({ behavior: bezPohybu() ? 'auto' : 'smooth', block: 'center' });
    });

    predpoved('kl-pevna', {
      otazka: 'Pevnou kladkou zvedáš břemeno o tíze <b>200 N</b>. Jakou silou musíš táhnout za lano?',
      moznosti: ['Asi 100 N – kladka pomáhá', 'Přesně 200 N', 'Víc než 200 N – kladku je potřeba ještě roztočit'],
      spravna: 1,
      proc: ['Polovinu ušetří až volná kladka. Pevná kladka se jen otáčí na místě.', null, 'Bez tření je síla přesně stejná jako tíha.'],
      priTipu: () => MODELY.kladky.nastav('pevna', s.k, 200),
      vyzkousej: 'Model je přepnutý na pevnou kladku. Zvedni břemeno 200 N aspoň o <b>20 cm</b> a sleduj siloměr.',
      splneno: () => s.druh === 'pevna' && s.G === 200 && s.h >= 20,
      vysvetleni: 'Pevná kladka je dvojzvratná páka se stejně dlouhými rameny (obě jsou poloměrem kladky). Sílu nezmenší, jen obrátí její směr – táhnout dolů je pohodlnější, můžeš se do lana opřít vlastní vahou.',
    });
    Ukoly.definuj('kl-100', () => n() === 4 && s.G === 400 && s.h >= 30,
      'Břemeno visí na 4 pramenech, každý nese 100 N. Za 30 cm zvednutí jsi ale musel(a) vytáhnout 120 cm lana.');
    predpoved('kl-lano', {
      otazka: 'Kladkostrojem se <b>4 nosnými prameny</b> zvedneš břemeno o <b>30 cm</b>. Kolik lana přitom vytáhneš?',
      moznosti: ['7,5 cm – síla je čtvrtinová, tak i lana je čtvrtina', '30 cm – stejně jako břemeno', '120 cm – čtyřikrát víc'],
      spravna: 2,
      proc: ['Kladkostroj šetří sílu, ne dráhu. Kdyby šetřil obojí, vznikala by práce z ničeho.', 'O 30 cm se musí zkrátit každý ze 4 nosných pramenů.'],
      vyzkousej: 'Nastav <b>kladkostroj se 2 volnými kladkami</b> a zvedni břemeno o <b>30 cm</b>. Sleduj fialovou dráhu ruky.',
      splneno: () => n() === 4 && s.h >= 30,
      vysvetleni: 'Aby břemeno stouplo o 30 cm, musí se o 30 cm zkrátit každý ze 4 nosných pramenů: 4 · 30 cm = 120 cm lana.',
    });
  }

  /* ---------- 6 · Kolo na hřídeli (rumpál) ---------- */
  function modelHridel() {
    const m = new Model('obr-hridel', 760, 470), g = m.vrstva;
    const O = [300, 186], SK = 2.6, ROB = 330, HMAX = 150;
    const s = { R: 30, r: 10, G: 120, theta: 0, bylo20: false };
    MODELY.hridel = { m, s };
    const F = () => s.G * s.r / s.R;
    const h = () => s.r * s.theta;                  // cm
    const psi = () => -s.theta - Math.PI / 4;       // úhel kliky na obrazovce
    const kl = () => [O[0] + s.R * SK * Math.cos(psi()), O[1] + s.R * SK * Math.sin(psi())];

    const st = m.staticka;
    mnohouhelnik(st, [[O[0] - 8, O[1]], [O[0] + 8, O[1]], [O[0] + 150, ROB], [O[0] + 132, ROB]], 'drevo');
    mnohouhelnik(st, [[O[0] - 8, O[1]], [O[0] + 8, O[1]], [O[0] - 132, ROB], [O[0] - 150, ROB]], 'drevo');
    zem(st, 30, 740, ROB, 1);
    sv('rect', { x: O[0] - 84, y: ROB - 26, width: 34, height: 26, class: 'kov', rx: 3 }, st);
    sv('rect', { x: O[0] + 90, y: ROB - 26, width: 34, height: 26, class: 'kov', rx: 3 }, st);
    sv('rect', { x: O[0] - 50, y: ROB, width: 140, height: 140, fill: 'var(--bg-control)', opacity: 0.6 }, st);

    m.kresli = gg => {
      const k = m.k, P = kl(), f = F(), vx = O[0] + s.r * SK;
      if (s.R === 20 && s.r === 10) s.bylo20 = true;
      // dráha kliky a hřídel s navinutým lanem
      sv('circle', { cx: O[0], cy: O[1], r: r1(s.R * SK), fill: 'none', class: 'cara tenka carkovana c-sila' }, gg);
      sv('circle', { cx: O[0], cy: O[1], r: r1(s.r * SK), class: 'drevo' }, gg);
      const zavity = Math.min(10, 1 + Math.floor(h() / 12));
      for (let i = 1; i <= zavity; i++) sv('circle', { cx: O[0], cy: O[1], r: r1(s.r * SK - i * 1.6), fill: 'none', stroke: 'var(--m-lano)', 'stroke-width': 1.1, opacity: 0.8 }, gg);
      // lano a vědro
      const yV = 425 - h() * 0.7;
      sv('path', { d: dCesta([[vx, O[1]], [vx, yV - 30]]), class: 'lano' }, gg);
      mnohouhelnik(gg, [[vx - 22, yV - 26], [vx + 22, yV - 26], [vx + 17, yV + 12], [vx - 17, yV + 12]], 'kov');
      cara(gg, [[vx - 22, yV - 26], [vx, yV - 42], [vx + 22, yV - 26]], 'tenka c-kov');
      sipka(gg, [vx, yV + 14], [vx, yV + 22 + s.G * 0.12], k, 'c-bremeno');
      txt(gg, vx + 12, yV + 30, 'G = ' + sila(s.G, 0), 't-bremeno');
      // klika a ramena
      cara(gg, [O, P], 'silna c-kov');
      kota(gg, [O[0], O[1]], [vx, O[1]], k, 'r', { strana: 1 });
      const n = V.norm(V.sub(P, O));
      const pp = V.add(O, V.mul(n, s.R * SK * 0.5));
      txt(gg, pp[0] - n[1] * 14, pp[1] + n[0] * 14 + 4, 'R', 't-rameno t-stred');
      sv('circle', { cx: r1(P[0]), cy: r1(P[1]), r: 9, class: 'drevo' }, gg);
      const tg = [Math.sin(psi()), -Math.cos(psi())];
      sipka(gg, V.add(P, V.mul(tg, 12)), V.add(P, V.mul(tg, 30 + f * 0.6)), k, 'c-sila');
      const lp = V.add(P, V.mul(tg, 44 + f * 0.6));
      txt(gg, lp[0], lp[1], 'F = ' + sila(f, 0), 't-sila t-stred');
      osaBod(gg, O, k, 5);
      const ot = s.theta / (2 * Math.PI);
      m.odecet([
        ['klika R', cm(s.R, 0)], ['hřídel r', cm(s.r, 0)], ['síla', `F = ${s.G} N · ${s.r} : ${s.R} = ${sila(f, 1)}`],
        ['otáčky', cisK(ot, 2)], ['vědro stouplo', cm(h(), 0)], ['ruka urazila', cm(2 * Math.PI * s.R * ot, 0)],
      ]);
      if (h() >= HMAX - 0.5) m.zpravu('<span class="ok">✓ Vědro je nahoře.</span>');
      else m.zpravu(`Klika je ${cisK(s.R / s.r, 1)}× delší než poloměr hřídele, proto stačí ${cisK(s.R / s.r, 1)}× menší síla. Ruka ale opisuje ${cisK(s.R / s.r, 1)}× delší kruh.`);
    };
    m.uchop({ popis: 'Držadlo kliky – otáčej', poloha: () => kl(),
      tahni: p => {
        const a = Math.atan2(p[1] - O[1], p[0] - O[0]);
        const d = obalUhlu(a - psi());
        s.theta = omez(s.theta - d, 0, HMAX / s.r);
      },
      klavesa: (dx, dy) => { s.theta = omez(s.theta + (dx || -dy) * 0.2, 0, HMAX / s.r); }, hodnota: () => cisK(s.theta / (2 * Math.PI), 2) + ' otáčky' });
    const zmena = () => { s.theta = Math.min(s.theta, HMAX / s.r); m.naplanuj(); };
    posuvnik('hr-R', v => cm(v, 0), v => { s.R = v; zmena(); });
    posuvnik('hr-r', v => cm(v, 0), v => { s.r = v; s.theta = 0; zmena(); });
    posuvnik('hr-G', v => sila(v, 0), v => { s.G = v; zmena(); });
    $('#hr-dolu').addEventListener('click', () => { s.theta = 0; m.naplanuj(); });

    Ukoly.definuj('hr-ctvrt', () => s.R === 4 * s.r,
      'Klika je 4× delší než poloměr hřídele: F · 4r = G · r, takže F = G/4.');
    Ukoly.definuj('hr-otocka', () => s.theta >= 2 * Math.PI - 0.03,
      () => `Vědro stouplo o obvod hřídele (2π · ${s.r} cm ≈ ${cisK(2 * Math.PI * s.r, 0)} cm), ruka urazila obvod kliky (2π · ${s.R} cm ≈ ${cisK(2 * Math.PI * s.R, 0)} cm) – ${cisK(s.R / s.r, 1)}× delší dráhu.`);
    predpoved('hr-delsi', {
      otazka: 'Prodloužíš kliku rumpálu na <b>dvojnásobek</b>. Co se stane?',
      moznosti: ['Síla klesne na polovinu, ruka ale urazí dvakrát delší dráhu', 'Síla klesne na polovinu a dráha ruky zůstane stejná', 'Síla se nezmění, jen se bude točit pomaleji'],
      spravna: 0,
      proc: [null, 'Delší klika opisuje větší kruh – za otáčku urazí ruka dvojnásobnou dráhu.', 'Delší klika je delší rameno síly – moment stejné síly se zdvojnásobí.'],
      priTipu: () => { s.bylo20 = false; },
      vyzkousej: 'Nastav hřídel <b>r = 10 cm</b> a kliku <b>R = 20 cm</b>, pak kliku prodluž na <b>40 cm</b>. Porovnej sílu i dráhu ruky za otáčku.',
      splneno: () => s.bylo20 && s.R === 40 && s.r === 10,
      vysvetleni: 'Při R = 20 cm je síla G/2, při R = 40 cm jen G/4. Za jednu otáčku ale ruka urazí 2π · 40 cm ≈ 251 cm místo 126 cm.',
    });
  }

  /* ---------- 7a · Ozubená kola ---------- */
  function cestaKola(c, z, fi, M = 6.4) {
    const rp = z * M / 2, ra = rp + M, rf = rp - 1.25 * M, tau = 2 * Math.PI / z;
    const b = [];
    for (let i = 0; i < z; i++) {
      const a0 = fi + i * tau;
      for (const [r, da] of [[rf, -0.5], [rf, -0.3], [ra, -0.16], [ra, 0.16], [rf, 0.3]]) {
        b.push([c[0] + r * Math.cos(a0 + da * tau), c[1] + r * Math.sin(a0 + da * tau)]);
      }
    }
    return dCesta(b, true);
  }
  function modelKola() {
    const m = new Model('obr-kola', 820, 390), g = m.vrstva;
    const M = 6.4, ZM = 10, Y = 196;
    const s = { z1: 12, z2: 24, mezi: false, fi: -Math.PI / 2, ot1: 0, motor: false };
    MODELY.kola = { m, s };
    const rp = z => z * M / 2;
    const i = () => s.z2 / s.z1;
    const stredy = () => {
      const w = s.mezi ? 2 * rp(s.z1) + 2 * rp(ZM) + 2 * rp(s.z2) : 2 * rp(s.z1) + 2 * rp(s.z2);
      const x1 = 410 - w / 2 + rp(s.z1);
      const xm = x1 + rp(s.z1) + rp(ZM);
      const x2 = s.mezi ? xm + rp(ZM) + rp(s.z2) : x1 + rp(s.z1) + rp(s.z2);
      return { c1: [x1, Y], cm: [xm, Y], c2: [x2, Y] };
    };
    const zaber = (fiA, zA, zB) => -(zA / zB) * fiA + Math.PI + Math.PI / zB;
    const uhly = () => {
      const f1 = s.fi;
      if (!s.mezi) return { f1, f2: zaber(f1, s.z1, s.z2) };
      const fm = zaber(f1, s.z1, ZM);
      return { f1, fm, f2: zaber(fm, ZM, s.z2) };
    };
    const spust = animace(m, dt => {
      if (!s.motor || !m.viditelny) return false;
      const d = 2 * Math.PI * dt;           // 60 otáček za minutu
      s.fi += d; s.ot1 += d / (2 * Math.PI);
      return true;
    });
    m.priViditelnosti = () => { if (s.motor && m.viditelny) spust(); };

    function kolo(gg, c, z, fi, cls, popisek) {
      sv('path', { d: cestaKola(c, z, fi, M), class: 'kolo-zuby ' + cls }, gg);
      sv('circle', { cx: r1(c[0]), cy: r1(c[1]), r: r1(rp(z) * 0.62), fill: 'none', stroke: 'var(--m-kov-tmavy)', 'stroke-width': 1, opacity: 0.6 }, gg);
      const zn = [c[0] + rp(z) * 0.62 * Math.cos(fi), c[1] + rp(z) * 0.62 * Math.sin(fi)];
      cara(gg, [c, zn], 'tenka c-kov');
      sv('circle', { cx: r1(zn[0]), cy: r1(zn[1]), r: 5.5, class: 'znacka-otacky' }, gg);
      sv('circle', { cx: r1(c[0]), cy: r1(c[1]), r: 7, class: 'kov' }, gg);
      osaBod(gg, c, m.k, 3.5);
      txt(gg, c[0], c[1] + rp(z) + M + 22, popisek, 't-maly t-stred t-silny');
    }
    function smerOtaceni(gg, c, z, poSmeru, cls) {
      const r = rp(z) + M + 12, a1 = -2.4, a2 = -0.8;
      const [od, do_] = poSmeru ? [a1, a2] : [a2, a1];
      obloukUhlu(gg, c, r, od, do_, 'tenka ' + cls);
      const kon = [c[0] + r * Math.cos(do_), c[1] + r * Math.sin(do_)];
      const tg = poSmeru ? [-Math.sin(do_), Math.cos(do_)] : [Math.sin(do_), -Math.cos(do_)];
      hrot(gg, kon, tg, m.k, 0.9, cls);
    }
    m.kresli = gg => {
      const S = stredy(), U = uhly();
      kolo(gg, S.c1, s.z1, U.f1, 'kolo-a', `hnací · ${s.z1} zubů`);
      if (s.mezi) kolo(gg, S.cm, ZM, U.fm, 'kolo-m', `mezikolo · ${ZM}`);
      kolo(gg, S.c2, s.z2, U.f2, 'kolo-b', `hnané · ${s.z2} zubů`);
      smerOtaceni(gg, S.c1, s.z1, true, 'c-sila');
      smerOtaceni(gg, S.c2, s.z2, s.mezi, 'c-bremeno');
      const ot2 = s.ot1 / i();
      m.odecet([
        ['převodový poměr', `i = ${s.z2} : ${s.z1} = ${cisK(i(), 2)}`],
        ['otáčky (motor)', `${cisK(60, 0)} → ${cisK(60 / i(), 1)} za minutu`],
        ['napočítáno', `hnací ${cisK(Math.abs(s.ot1), 2)} ot. · hnané ${cisK(Math.abs(ot2), 2)} ot.`],
        ['moment', `M₂ = ${cisK(i(), 2)} · M₁`],
      ]);
      const druh = i() > 1.001 ? 'do pomala: hnané kolo je pomalejší, ale má větší moment' : i() < 0.999 ? 'do rychla: hnané kolo je rychlejší, ale má menší moment' : 'stejně velká kola – mění se jen směr otáčení';
      m.zpravu(`Převod <b>${druh}</b>. ` + (s.mezi ? 'Mezikolo obrátilo směr – krajní kola se točí stejně.' : 'Kola v záběru se točí proti sobě.'));
    };
    m.uchop({ popis: 'Hnací kolo – otáčej', poloha: () => { const c = stredy().c1, r = rp(s.z1) * 0.62; return [c[0] + r * Math.cos(s.fi), c[1] + r * Math.sin(s.fi)]; },
      tahni: p => { const c = stredy().c1, a = Math.atan2(p[1] - c[1], p[0] - c[0]), d = obalUhlu(a - s.fi); s.fi += d; s.ot1 += d / (2 * Math.PI); },
      klavesa: (dx, dy) => { const d = (dx || dy) * Math.PI / 12; s.fi += d; s.ot1 += d / (2 * Math.PI); }, hodnota: () => cisK(s.ot1, 2) + ' otáčky' });
    const nuluj = () => { s.ot1 = 0; };
    posuvnik('ko-z1', v => String(v), v => { s.z1 = v; nuluj(); m.naplanuj(); });
    posuvnik('ko-z2', v => String(v), v => { s.z2 = v; nuluj(); m.naplanuj(); });
    prepinac('ko-mezikolo', v => { s.mezi = v; nuluj(); m.naplanuj(); });
    const tl = $('#ko-motor');
    tl.addEventListener('click', () => {
      s.motor = !s.motor;
      tl.textContent = s.motor ? '⏸️ Zastavit motor' : '▶️ Pustit motor';
      if (s.motor) spust(); else m.naplanuj();
    });
    $('#ko-nuluj').addEventListener('click', () => { nuluj(); m.naplanuj(); });

    predpoved('ko-velke', {
      otazka: 'Malé kolo (<b>12 zubů</b>) pohání velké kolo (<b>36 zubů</b>). Malé kolo se otočí <b>jednou</b>. Kolikrát se otočí velké?',
      moznosti: ['Třikrát – je třikrát větší', 'Jednou – kola jsou spojená', 'Jen o třetinu otáčky'],
      spravna: 2,
      proc: ['Je to naopak: velké kolo má víc zubů, a tak se za stejný počet zubů v záběru otočí méně.', 'Spojená jsou jen zuby – po obvodu se posunou o stejný počet zubů, ne o stejný počet otáček.'],
      vyzkousej: 'Nastav <b>z₁ = 12</b> a <b>z₂ = 36</b> (otáčky se vynulují) a otoč hnacím kolem jednou dokola – táhnutím nebo motorem.',
      splneno: () => s.z1 === 12 && s.z2 === 36 && !s.mezi && Math.abs(s.ot1) >= 1 - 0.01,
      vysvetleni: 'Za jednu otáčku malého kola projde záběrem 12 zubů. Velké kolo se tím pootočí o 12 ze svých 36 zubů – o třetinu otáčky. Zato má trojnásobný moment.',
    });
    Ukoly.definuj('ko-3', () => s.z2 === 3 * s.z1 && Math.abs(s.ot1) >= 1 - 0.01,
      'Převodový poměr i = z₂ : z₁ = 3. Hnané kolo má třikrát menší otáčky a třikrát větší moment.');
    predpoved('ko-mezi', {
      otazka: 'Mezi dvě kola vložíš <b>mezikolo</b>. Co se stane s hnaným kolem?',
      moznosti: ['Začne se točit stejným směrem jako hnací, jeho otáčky se nezmění', 'Bude se točit rychleji', 'Bude se točit pomaleji a opačně'],
      spravna: 0,
      proc: [null, 'Zuby mezikola se v poměru vykrátí – rychlost hnaného kola se nezmění.', 'Otáčky se nezmění a směr se naopak obrátí na stejný, jako má hnací kolo.'],
      vyzkousej: 'Zapni <b>Mezikolo</b> a otoč hnacím kolem aspoň o půl otáčky. Porovnej směr a otáčky krajních kol.',
      splneno: () => s.mezi && Math.abs(s.ot1) >= 0.5,
      vysvetleni: 'Každá dvojice kol v záběru obrací směr. Po dvou záběrech se točí hnané kolo stejně jako hnací. Zuby mezikola se vykrátí: (z<sub>m</sub> : z₁) · (z₂ : z<sub>m</sub>) = z₂ : z₁.',
    });
  }

  /* ---------- 7b · Převody jízdního kola ---------- */
  function modelBicykl() {
    const m = new Model('obr-bicykl', 820, 350), g = m.vrstva;
    const A = [240, 196], B = [600, 196], SK = 2.2, KLIKA = 120, OBVOD = 2.1;
    const s = { zp: 32, zz: 21, fi: -Math.PI / 2, draha: 0, otP: 0, fiKolo: 0 };
    MODELY.bicykl = { m, s };
    const pomer = () => s.zp / s.zz;

    function retez(ra, rb) {
      const d = B[0] - A[0], nx = (rb - ra) / d, ny = Math.sqrt(1 - nx * nx);
      const nH = [nx, -ny], nD = [nx, ny];
      const pts = [];
      pts.push(V.add(A, V.mul(nH, ra)), V.add(B, V.mul(nH, rb)));
      const aH = Math.atan2(nH[1], nH[0]), aD = Math.atan2(nD[1], nD[0]);
      for (let t = 1; t <= 16; t++) { const a = aH + (aD - aH) * t / 16; pts.push([B[0] + rb * Math.cos(a), B[1] + rb * Math.sin(a)]); }
      pts.push(V.add(A, V.mul(nD, ra)));
      let a0 = aD, a1 = aH + 2 * Math.PI;
      for (let t = 1; t <= 24; t++) { const a = a0 + (a1 - a0) * t / 24; pts.push([A[0] + ra * Math.cos(a), A[1] + ra * Math.sin(a)]); }
      return pts;
    }
    m.kresli = gg => {
      const k = m.k, ra = s.zp * SK, rb = s.zz * SK;
      // zadní kolo
      sv('circle', { cx: B[0], cy: B[1], r: 146, fill: 'none', stroke: 'var(--m-kov-tmavy)', 'stroke-width': 9 }, gg);
      for (let j = 0; j < 12; j++) { const a = s.fiKolo + j * Math.PI / 6; cara(gg, [B, [B[0] + 140 * Math.cos(a), B[1] + 140 * Math.sin(a)]], 'tenka c-slaby'); }
      // ozubená kola a řetěz
      sv('path', { d: cestaKola(A, s.zp, s.fi, SK * 2), class: 'kolo-zuby kolo-a' }, gg);
      sv('path', { d: cestaKola(B, s.zz, s.fi * pomer(), SK * 2), class: 'kolo-zuby kolo-b' }, gg);
      const r = sv('path', { d: dCesta(retez(ra, rb), true), class: 'retez' }, gg);
      r.style.strokeDashoffset = r1(-(s.fi + Math.PI / 2) * ra);
      // klika s pedálem
      const P = [A[0] + KLIKA * Math.cos(s.fi), A[1] + KLIKA * Math.sin(s.fi)];
      cara(gg, [A, P], 'silna c-kov');
      sv('rect', { x: r1(P[0] - 18), y: r1(P[1] - 6), width: 36, height: 12, rx: 3, class: 'kov-tmavy' }, gg);
      osaBod(gg, A, k, 4); osaBod(gg, B, k, 4);
      txt(gg, A[0], A[1] + 150, `převodník ${s.zp} zubů`, 't-maly t-stred t-sila');
      txt(gg, B[0], B[1] - 158, `pastorek ${s.zz} zubů`, 't-maly t-stred t-bremeno');
      // počítadlo
      txt(gg, 800, 30, 'ujeto ' + metry(s.draha, 1), 't-velky t-konec');
      m.odecet([
        ['převod', `${s.zp} : ${s.zz} = ${cisK(pomer(), 2)}`],
        ['1 otáčka pedálů', `${cisK(pomer(), 2)} otáčky kola = ${metry(pomer() * OBVOD, 1)}`],
        ['síla do pedálů', pomer() < 1 ? 'malá (lehký převod)' : pomer() > 2.4 ? 'velká (těžký převod)' : 'střední'],
      ]);
      m.zpravu(pomer() < 1
        ? 'Lehký převod: zadní kolo se otočí <b>méně než jednou</b> za šlápnutí. Jede se pomalu, ale do kopce se šlape snadno.'
        : `Za jedno šlápnutí se zadní kolo otočí <b>${cisK(pomer(), 2)}×</b>. ${pomer() > 2.4 ? 'Rychlá jízda po rovině nebo z kopce – do pedálů se musí tlačit hodně.' : 'Převod na běžnou jízdu.'}`);
    };
    m.uchop({ popis: 'Pedál – šlapej', poloha: () => [A[0] + KLIKA * Math.cos(s.fi), A[1] + KLIKA * Math.sin(s.fi)],
      tahni: p => {
        const a = Math.atan2(p[1] - A[1], p[0] - A[0]), d = obalUhlu(a - s.fi);
        s.fi += d;
        if (d > 0) { s.otP += d / (2 * Math.PI); s.fiKolo += d * pomer(); s.draha += d / (2 * Math.PI) * pomer() * OBVOD; }
      },
      klavesa: (dx, dy) => { const d = (dx || -dy) * Math.PI / 12; s.fi += d; if (d > 0) { s.otP += d / (2 * Math.PI); s.fiKolo += d * pomer(); s.draha += d / (2 * Math.PI) * pomer() * OBVOD; } },
      hodnota: () => cisK(s.otP, 2) + ' otáčky pedálů' });
    const zmena = () => { s.otP = 0; m.naplanuj(); };
    MODELY.bicykl.predni = segment($('#bi-predni'), s.zp, v => { s.zp = +v; zmena(); });
    MODELY.bicykl.zadni = segment($('#bi-zadni'), s.zz, v => { s.zz = +v; zmena(); });
    Ukoly.definuj('bi-kopec', () => s.zp === 22 && s.zz === 34 && s.otP >= 0.99,
      'Převod 22 : 34 ≈ 0,65. Za šlápnutí ujedeš jen asi 1,4 m, ale do pedálů stačí nejmenší síla.');
    Ukoly.definuj('bi-rychle', () => s.zp === 44 && s.zz === 11 && s.otP >= 0.99,
      'Převod 44 : 11 = 4. Zadní kolo se otočí čtyřikrát a ujedeš asi 8,4 m – do pedálů se ale musí tlačit nejvíc.');
  }

  /* ---------- 8 · Nakloněná rovina ---------- */
  function modelRovina() {
    const m = new Model('obr-rovina', 840, 390), g = m.vrstva;
    const ZEM = 330, SK = 110, XK = 700, MU = 0.2;
    const s = { l: 2, G: 600, p: 0.2, treni: false, bylo2: false };
    MODELY.rovina = { m, s };
    const beh = () => Math.sqrt(s.l * s.l - 1);
    const pata = () => [XK - beh() * SK, ZEM];
    const vrch = [XK, ZEM - SK];
    const F = () => s.G * (1 / s.l) + (s.treni ? MU * s.G * beh() / s.l : 0);
    const bodNa = p => V.add(pata(), V.mul(V.sub(vrch, pata()), p));

    const st = m.staticka;
    zem(st, 20, 830, ZEM, 1);
    sv('rect', { x: XK, y: ZEM - SK, width: 130, height: 26, class: 'kov', rx: 2 }, st);
    sv('rect', { x: XK + 6, y: ZEM - SK + 26, width: 118, height: 50, fill: 'var(--bg-control)' }, st);
    for (const x of [XK + 30, XK + 100]) sv('circle', { cx: x, cy: ZEM - 22, r: 22, fill: 'var(--m-kov-tmavy)' }, st);

    m.kresli = gg => {
      const k = m.k, P = pata(), f = F(), a = Math.atan2(vrch[1] - P[1], vrch[0] - P[0]);
      if (s.l === 2 && !s.treni) s.bylo2 = true;
      mnohouhelnik(gg, [P, vrch, [XK, ZEM]], 'rampa');
      // bedna
      const c = bodNa(s.p), nahoru = [Math.cos(a), Math.sin(a)], kolmo = [Math.sin(a), -Math.cos(a)];
      const st0 = V.add(c, V.mul(kolmo, 24));
      const rohy = [[-32, -24], [32, -24], [32, 24], [-32, 24]].map(([u, v]) => V.add(st0, V.add(V.mul(nahoru, u), V.mul(kolmo, -v))));
      mnohouhelnik(gg, rohy, 'bremeno-vypln');
      txt(gg, st0[0], st0[1] + 4, sila(s.G, 0), 't-maly t-stred t-bremeno');
      sipka(gg, st0, [st0[0], st0[1] + 26 + s.G * 0.1], k, 'c-bremeno');
      txt(gg, st0[0] - 10, st0[1] + 26 + s.G * 0.1, 'G', 't-bremeno t-konec');
      const zac = V.add(st0, V.mul(nahoru, 34));
      sipka(gg, zac, V.add(zac, V.mul(nahoru, 14 + f * 0.2)), k, 'c-sila');
      const lp = V.add(V.add(zac, V.mul(nahoru, 24 + f * 0.2)), V.mul(kolmo, 14));
      txt(gg, lp[0], lp[1], 'F = ' + sila(f, 0), 't-sila t-stred');
      // kóty
      kota(gg, V.add(P, V.mul(kolmo, -18)), V.add(vrch, V.mul(kolmo, -18)), k, 'l = ' + metry(s.l, 1), { cls: 'c-draha', tcls: 't-draha', strana: 1 });
      kota(gg, [XK + 146, ZEM], [XK + 146, ZEM - SK], k, 'h = 1 m', { cls: 'c-draha', tcls: 't-draha', strana: 1 });
      const W = f * s.l;
      m.odecet([
        ['sklon', Math.round(Math.asin(1 / s.l) / RAD) + '°'], ['tažná síla', `F = ${sila(f, 0)}`],
        ['práce po rampě', `F · l = ${cisK(W, 0)} J`], ['zvednutí rovnou', `G · h = ${s.G} J`],
      ]);
      if (s.p >= 0.999) m.zpravu(`<span class="ok">✓ Bedna je nahoře.</span> Vykonal(a) jsi práci ${cisK(W, 0)} J` + (s.treni ? ` – o ${cisK(W - s.G, 0)} J víc než při zvedání rovnou nahoru; ty spotřebovalo tření.` : ' – stejnou jako při zvedání rovnou nahoru.'));
      else m.zpravu(`Rampa je ${cisK(s.l, 1)}× delší než vysoká, proto stačí ${s.treni ? 'asi ' : ''}${cisK(s.G / f, 1)}× menší síla než tíha.`);
    };
    m.uchop({ popis: 'Bedna – táhni po rampě', poloha: () => { const a = Math.atan2(vrch[1] - pata()[1], vrch[0] - pata()[0]); return V.add(bodNa(s.p), V.mul([Math.sin(a), -Math.cos(a)], 24)); },
      tahni: p => { const P = pata(), d = V.sub(vrch, P); s.p = omez(V.dot(V.sub(p, P), d) / V.dot(d, d), 0, 1); if (s.p > 0.97) s.p = 1; },
      klavesa: (dx, dy) => { s.p = omez(s.p + (dx || -dy) * 0.05, 0, 1); }, hodnota: () => Math.round(s.p * 100) + ' % rampy' });
    posuvnik('ro-l', v => metry(v, 1), v => { s.l = v; m.naplanuj(); });
    posuvnik('ro-G', v => sila(v, 0), v => { s.G = v; m.naplanuj(); });
    prepinac('ro-treni', v => { s.treni = v; m.naplanuj(); });
    predpoved('ro-delsi', {
      otazka: 'Rampu ke korbě (výška 1 m) prodloužíš ze <b>2 m</b> na <b>4 m</b>. Jak se změní síla potřebná k vytažení bedny (bez tření)?',
      moznosti: ['Zmenší se na polovinu', 'Nezmění se – bedna je pořád stejně těžká', 'Zmenší se na čtvrtinu'],
      spravna: 0,
      proc: [null, 'Tíha se nemění, ale na delší rampě se zvedání rozloží na delší dráhu.', 'Rampa je jen 2× delší, síla je tedy 2× menší: F = G · h / l.'],
      priTipu: () => { s.bylo2 = false; },
      vyzkousej: 'Nech tření vypnuté, nastav délku <b>2 m</b> a pak <b>4 m</b>. Sleduj tažnou sílu.',
      splneno: () => s.bylo2 && s.l === 4 && !s.treni,
      vysvetleni: 'F = G · h / l: při 2 m je to G/2, při 4 m G/4 – síla klesla na polovinu. Bednu ale táhneš dvakrát delší cestou.',
    });
    Ukoly.definuj('ro-sud', () => s.G === 600 && !s.treni && F() <= 200 + 1e-9 && s.p >= 0.999,
      'F = G · h / l = 600 N · 1 m : 3 m = 200 N. Bednu jsi ale musel(a) táhnout 3 m místo zvednutí o 1 m.');
  }

  /* ---------- 9 · Zlaté pravidlo: práce jako obsah obdélníku ---------- */
  function modelZlate() {
    const m = new Model('obr-zlate', 820, 390), g = m.vrstva;
    const O = [96, 330], SX = 105, SY = 0.45, G = 500, ETA = 0.8;
    const s = { stroj: 'kladkostroj', k: 4, treni: false };
    MODELY.zlate = { m, s };
    const vyhoda = () => s.stroj === 'ruce' ? 1 : s.k;
    const F = () => G / vyhoda() / (s.treni && s.stroj !== 'ruce' ? ETA : 1);
    const dr = () => vyhoda();
    const popis = {
      ruce: 'zvedání rukama',
      paka: k => `páka s rameny 1 : ${k}`,
      kladkostroj: k => `kladkostroj s ${k} nosnými prameny`,
      rovina: k => `rampa dlouhá ${k} m na výšku 1 m`,
      hridel: k => `rumpál s klikou ${k}× delší než hřídel`,
    };
    const st = m.staticka;
    cara(st, [[O[0], 20], O, [790, O[1]]], 'c-text');
    for (let x = 1; x <= 6; x++) { cara(st, [[O[0] + x * SX, O[1]], [O[0] + x * SX, O[1] + 6]], 'tenka c-text'); txt(st, O[0] + x * SX, O[1] + 22, x + ' m', 't-maly t-stred'); }
    for (let y = 100; y <= 600; y += 100) { cara(st, [[O[0] - 6, O[1] - y * SY], [O[0], O[1] - y * SY]], 'tenka c-text'); txt(st, O[0] - 10, O[1] - y * SY + 4, y + ' N', 't-maly t-konec'); }
    txt(st, 790, O[1] - 10, 'dráha ruky s', 't-maly t-konec');
    txt(st, O[0] + 8, 26, 'síla F', 't-maly');
    m.kresli = gg => {
      const f = F(), d = dr(), W = f * d;
      sv('rect', { x: O[0], y: r1(O[1] - G * SY), width: SX, height: r1(G * SY), class: 'plocha-prace obrys c-bremeno' }, gg);
      if (s.stroj !== 'ruce') {
        sv('rect', { x: O[0], y: r1(O[1] - f * SY), width: r1(d * SX), height: r1(f * SY), class: 'plocha-prace c-sila' }, gg);
        txt(gg, O[0] + d * SX / 2, O[1] - f * SY / 2 + 5, `W = ${cisK(f, 0)} N · ${d} m = ${cisK(W, 0)} J`, 't-stred t-silny');
      }
      txt(gg, O[0] + SX + 10, O[1] - G * SY + 16, 'rukama: 500 N · 1 m = 500 J', 't-maly t-bremeno');
      txt(gg, 790, 44, typeof popis[s.stroj] === 'function' ? popis[s.stroj](s.k) : popis[s.stroj], 't-velky t-konec');
      m.odecet([['síla', sila(f, 0)], ['dráha ruky', metry(d, 0)], ['vykonaná práce', cisK(W, 0) + ' J'], ['užitečná práce', '500 J']]);
      if (s.stroj === 'ruce') m.zpravu('Pytel o tíze 500 N zvedáš rovnou o 1 m: práce 500 J. Vyber stroj a porovnej obdélníky.');
      else if (s.treni) m.zpravu(`Tření „sní“ část práce: vykonáš ${cisK(W, 0)} J, užitečných je jen 500 J. Účinnost 80 %.`);
      else m.zpravu(`Síla je ${d}× menší, dráha ${d}× delší. Obdélník je nižší a širší, ale <b>jeho obsah – práce – je stejný</b>.`);
      $$('#zl-tabulka tr[data-stroj]').forEach(tr => tr.classList.toggle('aktivni', tr.dataset.stroj === s.stroj));
    };
    const obal = $('#zl-k-obal');
    const zobraz = () => { obal.style.display = s.stroj === 'ruce' ? 'none' : ''; };
    MODELY.zlate.stroj = segment($('#zl-stroj'), s.stroj, v => { s.stroj = v; zobraz(); m.naplanuj(); });
    posuvnik('zl-k', v => v + '×', v => { s.k = v; m.naplanuj(); });
    prepinac('zl-treni', v => { s.treni = v; m.naplanuj(); });
    zobraz();
    predpoved('zl-prace', {
      otazka: 'Kolik <b>práce</b> ti ušetří kladkostroj se 4 nosnými prameny při zvedání pytle?',
      moznosti: ['Čtvrtinu práce', 'Tři čtvrtiny práce', 'Žádnou – práce zůstane stejná'],
      spravna: 2,
      proc: ['Síla je čtvrtinová, ale dráha čtyřnásobná – práce se nezmění.', 'Kdyby stroj šetřil práci, dal by se sestrojit perpetuum mobile.'],
      vyzkousej: 'Vyber <b>kladkostroj</b> s výhodou <b>4×</b> (bez tření) a porovnej obsahy obou obdélníků.',
      splneno: () => s.stroj === 'kladkostroj' && s.k === 4 && !s.treni,
      vysvetleni: 'Síla klesla na 125 N, dráha vzrostla na 4 m: 125 N · 4 m = 500 J – stejně jako rukama. S třením by byla práce dokonce o něco větší.',
    });
    Ukoly.definuj('zl-100', () => s.stroj !== 'ruce' && F() <= 100 + 1e-9,
      () => `Síla ${sila(F(), 0)} je ${cisK(G / F(), 0)}× menší než tíha, a tak ruka urazí ${metry(dr(), 0)}. Práce zůstala 500 J.`);
  }

  /* ---------- 4 · Třídička pák ---------- */
  /* Náčrtek předmětu (SVG 220×130) a vrstva sil: osa, břemeno (modře), síla ruky (oranžově). */
  function sipkaS(x1, y1, x2, y2, cls) {
    const l = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / l, uy = (y2 - y1) / l, s = 9, w = 5.5;
    const bx = x2 - ux * s, by = y2 - uy * s;
    return `<path class="cara silna ${cls}" d="M${x1} ${y1}L${r1(bx)} ${r1(by)}"/><path class="vypln ${cls}" d="M${x2} ${y2}L${r1(bx - uy * w)} ${r1(by + ux * w)}L${r1(bx + uy * w)} ${r1(by - ux * w)}Z"/>`;
  }
  const osaS = (x, y) => `<circle cx="${x}" cy="${y}" r="6" class="osa-bod"/>`;
  const PREDMETY = [
    { id: 'houpacka', nazev: 'Houpačka', druh: 'dvoj',
      kresba: '<path d="M110 80 L92 112 H128Z" class="podpera"/><rect x="18" y="72" width="184" height="8" rx="3" class="drevo"/><circle cx="40" cy="44" r="9" class="kuze"/><path d="M31 72 L33 54 H47 L49 72Z" class="dite-a"/><circle cx="182" cy="48" r="8" class="kuze"/><path d="M174 72 L176 57 H188 L190 72Z" class="dite-b"/>',
      sily: osaS(110, 80) + sipkaS(40, 82, 40, 118, 'c-bremeno') + sipkaS(182, 82, 182, 112, 'c-sila'),
      proc: 'Osa je uprostřed, děti sedí na opačných stranách a obě tlačí dolů.' },
    { id: 'nuzky', nazev: 'Nůžky', druh: 'dvoj',
      kresba: '<path d="M60 85 L205 48" class="cara silna c-kov" style="stroke-width:6px"/><path d="M60 39 L205 76" class="cara silna c-kov" style="stroke-width:6px"/><circle cx="46" cy="90" r="13" fill="none" stroke="var(--m-kov-tmavy)" stroke-width="5"/><circle cx="46" cy="34" r="13" fill="none" stroke="var(--m-kov-tmavy)" stroke-width="5"/><rect x="182" y="56" width="30" height="12" fill="var(--bg-panel)" stroke="var(--text-faint)"/>',
      sily: osaS(150, 62) + sipkaS(46, 6, 46, 24, 'c-sila') + sipkaS(190, 70, 190, 96, 'c-bremeno'),
      proc: 'Osa (šroubek) leží mezi prsty a stříhaným papírem.' },
    { id: 'klesta', nazev: 'Kombinačky', druh: 'dvoj',
      kresba: '<path d="M18 46 Q90 50 160 62 L204 54" class="cara silna c-kov" style="stroke-width:7px"/><path d="M18 80 Q90 76 160 62 L204 70" class="cara silna c-kov" style="stroke-width:7px"/><path d="M18 46 Q70 49 110 54 M18 80 Q70 77 110 72" class="cara" style="--c:#d9483b;stroke-width:9px"/><circle cx="196" cy="62" r="4" fill="var(--text-muted)"/>',
      sily: osaS(160, 62) + sipkaS(40, 18, 40, 40, 'c-sila') + sipkaS(196, 48, 196, 28, 'c-bremeno'),
      proc: 'Kloub je mezi rukojetí a čelistmi – dlouhé rukojeti, krátké čelisti.' },
    { id: 'pacidlo', nazev: 'Páčidlo pod kamenem', druh: 'dvoj',
      kresba: '<ellipse cx="184" cy="72" rx="30" ry="22" class="teleso"/><path d="M24 30 L204 100" class="cara silna c-kov" style="stroke-width:6px"/><path d="M150 82 L136 108 H164Z" class="podpera"/><path d="M0 110 H220" class="zem-cara"/>',
      sily: osaS(150, 82) + sipkaS(30, 8, 30, 30, 'c-sila') + sipkaS(190, 78, 190, 118, 'c-bremeno'),
      proc: 'Podložený kámen (osa) je mezi rukou a zvedaným balvanem.' },
    { id: 'vahy', nazev: 'Rovnoramenné váhy', druh: 'dvoj',
      kresba: '<rect x="106" y="40" width="8" height="70" class="kov"/><rect x="80" y="106" width="60" height="8" class="kov"/><path d="M30 40 H190" class="cara silna c-kov"/><path d="M30 40 L16 80 M30 40 L44 80 M190 40 L176 80 M190 40 L204 80" class="cara tenka c-text"/><path d="M12 80 H48 Q30 94 12 80Z M172 80 H208 Q190 94 172 80Z" class="kov"/>',
      sily: osaS(110, 40) + sipkaS(30, 90, 30, 122, 'c-bremeno') + sipkaS(190, 90, 190, 122, 'c-sila'),
      proc: 'Osa je přesně uprostřed mezi miskami.' },
    { id: 'kolecko', nazev: 'Stavební kolečko', druh: 'jedno',
      kresba: '<circle cx="36" cy="94" r="18" fill="var(--m-kov-tmavy)"/><path d="M36 94 L208 66" class="cara silna c-kov"/><path d="M52 50 H140 L128 80 H62Z" class="kov"/><path d="M130 82 L136 112" class="cara silna c-kov"/>',
      sily: osaS(36, 94) + sipkaS(96, 58, 96, 96, 'c-bremeno') + sipkaS(204, 96, 204, 70, 'c-sila'),
      proc: 'Osou je kolo na kraji, náklad je mezi osou a rukama.' },
    { id: 'louskacek', nazev: 'Louskáček', druh: 'jedno',
      kresba: '<path d="M22 64 L206 40 M22 64 L206 88" class="cara silna c-kov" style="stroke-width:6px"/><circle cx="72" cy="64" r="11" fill="#a8743f" stroke="#6c4521"/>',
      sily: osaS(22, 64) + sipkaS(72, 52, 72, 26, 'c-bremeno') + sipkaS(186, 16, 186, 40, 'c-sila'),
      proc: 'Kloub je na konci, ořech i ruka jsou na stejné straně od něj.' },
    { id: 'otvirak', nazev: 'Otvírák na lahve', druh: 'jedno',
      kresba: '<rect x="150" y="70" width="40" height="60" rx="6" fill="var(--m-rameno)" opacity=".35"/><rect x="146" y="62" width="48" height="10" rx="2" class="kov"/><path d="M28 50 L196 60" class="cara silna c-kov" style="stroke-width:8px"/><path d="M150 58 Q148 72 158 74" class="cara silna c-kov"/>',
      sily: osaS(194, 60) + sipkaS(36, 72, 36, 44, 'c-sila') + sipkaS(158, 62, 158, 92, 'c-bremeno'),
      proc: 'Osou je okraj víčka na druhém konci; víčko i ruka jsou na stejné straně od něj.' },
    { id: 'pinzeta', nazev: 'Pinzeta', druh: 'jedno',
      kresba: '<path d="M18 64 L204 48 M18 64 L204 80" class="cara silna c-kov" style="stroke-width:5px"/><circle cx="208" cy="64" r="6" fill="var(--m-bremeno)" opacity=".7"/>',
      sily: osaS(18, 64) + sipkaS(104, 32, 104, 54, 'c-sila') + sipkaS(196, 52, 196, 28, 'c-bremeno'),
      proc: 'Spojený konec je osa, prsty tisknou uprostřed a špička drží předmět – obě síly jsou na jedné straně osy.' },
    { id: 'predlokti', nazev: 'Předloktí s míčem', druh: 'jedno',
      kresba: '<path d="M30 8 L52 8 L50 96 L28 96Z" class="kuze" opacity=".7"/><path d="M34 86 L196 88 L196 104 L34 106Z" class="kuze" opacity=".7"/><path d="M44 16 C70 40 72 70 64 88" class="cara silna" style="--c:#c0505a;stroke-width:6px"/><circle cx="196" cy="74" r="13" fill="#e58a3a"/>',
      sily: osaS(40, 96) + sipkaS(64, 90, 64, 56, 'c-sila') + sipkaS(196, 104, 196, 126, 'c-bremeno'),
      proc: 'Osou je loket. Biceps i míč působí na stejné straně od lokte.' },
  ];
  const DRUH = { dvoj: 'dvojzvratná', jedno: 'jednozvratná' };

  function tridicka() {
    const box = $('#tridicka'), stav = $('#tridicka-stav');
    if (!box) return;
    const karty = PREDMETY.map(p => {
      const el = document.createElement('article');
      el.className = 'predmet-karta';
      el.dataset.predmet = p.id;
      el.innerHTML = `<svg viewBox="0 0 220 130" role="img" aria-label="${p.nazev}">${p.kresba}<g class="sily">${p.sily}</g></svg>
        <h4>${p.nazev}</h4>
        <div class="volby-druhu" role="group" aria-label="Druh páky – ${p.nazev}">
          <button type="button" data-druh="dvoj">Dvojzvratná</button><button type="button" data-druh="jedno">Jednozvratná</button>
        </div>
        <p class="verdikt-druhu" aria-live="polite"></p>`;
      box.append(el);
      const hotovo = () => {
        el.classList.remove('chyba');
        el.classList.add('spravne', 'ukazano');
        $$('button', el).forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', String(b.dataset.druh === p.druh)); });
        $('.verdikt-druhu', el).innerHTML = `<b>✓ ${velke(DRUH[p.druh])} páka.</b> ${p.proc}`;
      };
      $$('button', el).forEach(b => b.addEventListener('click', () => {
        if (b.dataset.druh === p.druh) {
          hotovo();
          Postup.data.hotovo['tr-' + p.id] = true;
          Postup.uloz();
        } else {
          el.classList.add('chyba', 'ukazano');
          b.disabled = true;
          $('.verdikt-druhu', el).innerHTML = `<b>✗ Není to ${DRUH[b.dataset.druh]} páka.</b> Podívej se, kde je osa (červená) vzhledem k oběma silám.`;
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
    Ukoly.definuj('druhy-tridicka', () => karty.every(k => k.el.classList.contains('spravne')),
      'Rozhoduje poloha osy: leží-li mezi silami, je páka dvojzvratná; jsou-li obě síly na jedné straně osy, je jednozvratná.');
  }

  /* ================================================================
     7. Procvičování
     ================================================================ */
  /* Každý generátor vrací { zadani, obrazek?, moznosti: [{ t, ok?, proc? }], napoveda, vysvetleni }.
     Právě jedna možnost je správná, u chybných je zdůvodnění. Duplicitní texty se vyřadí. */
  const velke = t => t.charAt(0).toUpperCase() + t.slice(1);
  const N = x => cisK(x, 2) + ' N';
  const Nm = x => cisK(x, 2) + ' N·m';

  /* Malý obrázek páky k otázce. */
  function svgPaka({ F1, r1: a, F2, r2: b, jednotka = 'cm' }) {
    const W = 600, H = 170, C = 300, Y = 70, sk = 240 / Math.max(a, b);
    const xL = C - a * sk, xR = C + b * sk;
    const t = (x, y, s, cls) => `<text x="${x}" y="${y}" class="t-maly t-stred ${cls}">${s}</text>`;
    const sip = (x, cls) => `<path class="cara silna ${cls}" d="M${x} ${Y + 8}L${x} ${Y + 58}"/><path class="hrot ${cls}" d="M${x} ${Y + 70}L${x - 7} ${Y + 56}L${x + 7} ${Y + 56}Z"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="model" role="img" aria-label="Náčrt páky">
      <rect x="${xL - 12}" y="${Y - 6}" width="${xR - xL + 24}" height="12" rx="4" class="drevo"/>
      <path d="M${C} ${Y + 6}L${C - 16} ${Y + 36}H${C + 16}Z" class="podpera"/><circle cx="${C}" cy="${Y}" r="5" class="osa-bod"/>
      ${sip(xL, 'c-bremeno')}${sip(xR, 'c-sila')}
      <path class="cara tenka c-rameno" d="M${xL} ${Y - 24}H${xR}M${xL} ${Y - 30}V${Y - 18}M${C} ${Y - 30}V${Y - 18}M${xR} ${Y - 30}V${Y - 18}"/>
      ${t((xL + C) / 2, Y - 32, a ? `r₁ = ${cisK(a)} ${jednotka}` : 'r₁ = ?', 't-rameno')}${t((xR + C) / 2, Y - 32, b ? `r₂ = ${cisK(b)} ${jednotka}` : 'r₂ = ?', 't-rameno')}
      ${t(xL, Y + 92, F1 ? `F₁ = ${cisK(F1)} N` : 'F₁ = ?', 't-bremeno')}${t(xR, Y + 92, F2 ? `F₂ = ${cisK(F2)} N` : 'F₂ = ?', 't-sila')}
    </svg>`;
  }

  const GENERATORY = [
    { id: 'moment', tema: 'paka', nazev: 'Moment síly', gen() {
      const F = vyber([20, 40, 50, 80, 120, 150]), rcm = vyber([10, 20, 25, 30, 40, 50]), M = F * rcm / 100;
      return { zadani: `Na klíč působíš kolmo silou <b>${F} N</b> ve vzdálenosti <b>${rcm} cm</b> od osy matice. Jaký je moment síly?`,
        moznosti: [{ t: Nm(M), ok: true },
          { t: Nm(F * rcm), proc: 'Rameno je potřeba dosadit v metrech: ' + rcm + ' cm = ' + cisK(rcm / 100, 2) + ' m.' },
          { t: Nm(F / (rcm / 100)), proc: 'Moment je součin síly a ramene, ne podíl.' },
          { t: Nm(F + rcm / 100), proc: 'Síla a rameno se násobí: M = F · r.' }],
        napoveda: 'M = F · r, rameno převeď na metry.',
        vysvetleni: `M = ${F} N · ${cisK(rcm / 100, 2)} m = ${Nm(M)}.` };
    } },
    { id: 'rameno-koncept', tema: 'paka', nazev: 'Rameno síly', gen() {
      return vyber([
        { zadani: 'Co je <b>rameno síly</b>?',
          moznosti: [{ t: 'Kolmá vzdálenost osy otáčení od přímky, ve které síla působí.', ok: true },
            { t: 'Délka celé tyče (klíče, páky).', proc: 'Rameno se měří od osy, a jen k přímce síly.' },
            { t: 'Vzdálenost od osy k místu, kde se tyče dotýká ruka – vždy.', proc: 'To platí jen pro sílu kolmou k tyči. Šikmá síla má rameno kratší.' },
            { t: 'Velikost síly vynásobená vzdáleností.', proc: 'To je moment síly, ne rameno.' }],
          napoveda: 'Představ si přímku, ve které síla působí, a spusť na ni z osy kolmici.',
          vysvetleni: 'Rameno síly je délka kolmice z osy na přímku síly. U síly kolmé k páce je to vzdálenost působiště od osy.' },
        { zadani: 'Za klíč zatáhneš silou, která míří <b>přímo do osy</b> matice. Co se stane?',
          moznosti: [{ t: 'Nic – rameno je nulové, moment také.', ok: true },
            { t: 'Matice se povolí, když je síla dost velká.', proc: 'Moment je F · 0 = 0, ať je síla jakkoli velká.' },
            { t: 'Matice se utáhne.', proc: 'K utažení je potřeba moment opačného směru – tady žádný moment není.' }],
          napoveda: 'Jaká je vzdálenost osy od přímky síly, když přímka osou prochází?',
          vysvetleni: 'Přímka síly prochází osou – rameno je nulové, a tak i moment síly je nulový.' },
        { zadani: 'Proč je klika dveří co nejdál od pantů?',
          moznosti: [{ t: 'Delší rameno – ke stejnému momentu stačí menší síla.', ok: true },
            { t: 'Aby se dveře nerozbily.', proc: 'Jde o otáčivý účinek síly: moment M = F · r.' },
            { t: 'U pantů by se klika nevešla.', proc: 'Rozhoduje rameno síly – daleko od pantů je nejdelší.' }],
          napoveda: 'Panty jsou osa otáčení. Co je rameno?',
          vysvetleni: 'Panty jsou osa, vzdálenost kliky od nich je rameno. Dlouhé rameno = velký moment i při malé síle.' },
      ]);
    } },
    { id: 'rovnovaha-F2', tema: 'paka', nazev: 'Rovnováha na páce', gen() {
      const k = vyber([2, 3, 4, 5]), a = vyber([10, 15, 20]), F2 = vyber([5, 10, 15, 20, 30]), F1 = F2 * k, b = a * k;
      return { zadani: `Dvojzvratná páka: břemeno <b>F₁ = ${F1} N</b> je <b>${a} cm</b> od osy. Jakou silou <b>F₂</b> ho vyrovnáš na rameni <b>${b} cm</b>?`,
        obrazek: svgPaka({ F1, r1: a, r2: b }),
        moznosti: [{ t: N(F2), ok: true },
          { t: N(F1 * k), proc: 'Delší rameno sílu nezvětšuje, ale zmenšuje: F₂ = F₁ · r₁ / r₂.' },
          { t: N(F1), proc: 'Stejná síla by stačila jen při stejně dlouhých ramenech.' },
          { t: N(F1 / 2), proc: `Rameno je ${k}× delší, síla tedy ${k}× menší – ne poloviční.` }],
        napoveda: 'F₁ · r₁ = F₂ · r₂, takže F₂ = F₁ · r₁ / r₂.',
        vysvetleni: `F₂ = ${F1} · ${a} / ${b} = ${F2} N. Rameno je ${k}× delší, síla ${k}× menší.` };
    } },
    { id: 'rovnovaha-r2', tema: 'paka', nazev: 'Rovnováha na páce', gen() {
      const F1 = vyber([6, 8, 12, 20, 30]), a = vyber([10, 20, 30]), d = vyber([2, 3, 4]), F2 = F1 / d;
      if (!Number.isInteger(F2)) return null;
      const b = a * d;
      return { zadani: `Na páce visí vlevo <b>${F1} N</b> ve vzdálenosti <b>${a} cm</b> od osy. Jak daleko od osy musí vpravo viset <b>${F2} N</b>, aby byla páka v rovnováze?`,
        obrazek: svgPaka({ F1, r1: a, F2 }),
        moznosti: [{ t: cm(b, 0), ok: true },
          { t: cm(a / d, 1), proc: 'Menší síla potřebuje delší rameno, ne kratší.' },
          { t: cm(a, 0), proc: 'Se stejným ramenem by musely být stejné i síly.' },
          { t: cm(a + F1 - F2, 0), proc: 'Momenty se rovnají: F₁ · r₁ = F₂ · r₂ – nesčítá se.' }],
        napoveda: 'r₂ = F₁ · r₁ / F₂.',
        vysvetleni: `r₂ = ${F1} · ${a} / ${F2} = ${b} cm. Síla je ${d}× menší, rameno musí být ${d}× delší.` };
    } },
    { id: 'houpacka', tema: 'paka', nazev: 'Houpačka', gen() {
      const [m1, m2] = vyber([[40, 20], [50, 25], [60, 30], [60, 40], [45, 30], [80, 40], [70, 35]]);
      const x1 = vyber([0.8, 1, 1.2]), x2 = m1 * x1 / m2;
      if (x2 > 2.5) return null;
      return { zadani: `Na houpačce sedí vlevo dítě o hmotnosti <b>${m1} kg</b> ve vzdálenosti <b>${metry(x1, 1)}</b> od osy. Kam si musí sednout kamarád o hmotnosti <b>${m2} kg</b>, aby byla houpačka v rovnováze?`,
        moznosti: [{ t: metry(x2, 1) + ' od osy', ok: true },
          { t: metry(x1 * m2 / m1, 1) + ' od osy', proc: 'Lehčí dítě musí sedět dál, ne blíž.' },
          { t: metry(x1, 1) + ' od osy', proc: 'Stejně daleko by stačilo jen stejně těžké dítě.' },
          { t: metry(x1 + (m1 - m2) / 50, 1) + ' od osy', proc: 'Počítej s momenty: m₁ · r₁ = m₂ · r₂.' }],
        napoveda: 'Tíhy jsou úměrné hmotnostem, a tak stačí m₁ · r₁ = m₂ · r₂.',
        vysvetleni: `${m1} · ${cisK(x1, 1)} = ${m2} · r₂ ⇒ r₂ = ${metry(x2, 1)}.` };
    } },
    { id: 'druh-paky', tema: 'paka', nazev: 'Druhy pák', gen() {
      const p = vyber(PREDMETY);
      return { zadani: `Jakou pákou je <b>${p.nazev.toLowerCase()}</b>?`,
        obrazek: `<svg viewBox="0 0 220 130" class="model" role="img" aria-label="${p.nazev}" style="max-height:200px">${p.kresba}</svg>`,
        moznosti: [{ t: 'Dvojzvratná – osa leží mezi silami.', ok: p.druh === 'dvoj', proc: p.druh === 'dvoj' ? '' : p.proc },
          { t: 'Jednozvratná – obě síly jsou na jedné straně osy.', ok: p.druh === 'jedno', proc: p.druh === 'jedno' ? '' : p.proc },
          { t: 'Není to páka – nic se tu neotáčí.', proc: 'Každá část, která se otáčí kolem kloubu nebo podpěry, je páka.' }],
        napoveda: 'Najdi osu otáčení (kloub, podpěru). Leží mezi rukou a břemenem?',
        vysvetleni: `${p.nazev}: ${DRUH[p.druh]} páka. ${p.proc}` };
    } },
    { id: 'naklani', tema: 'paka', nazev: 'Rovnováha na páce', gen() {
      return vyber([
        { zadani: 'Páka se naklání na stranu břemene. Co to znamená?',
          moznosti: [{ t: 'Moment břemene je větší: F₁ · r₁ > F₂ · r₂.', ok: true },
            { t: 'Břemeno je těžší než síla na druhé straně: F₁ > F₂.', proc: 'Rozhoduje součin síla × rameno. Těžké břemeno blízko osy přetáhne i lehčí síla daleko od osy.' },
            { t: 'Rameno břemene je delší: r₁ > r₂.', proc: 'Samotná délka ramene nestačí – rozhoduje součin síla × rameno.' }],
          napoveda: 'Páka se otáčí na stranu většího momentu.',
          vysvetleni: 'Páka se otáčí na stranu většího momentu M = F · r.' },
        { zadani: 'Kam je nejlepší položit těžký náklad do stavebního kolečka?',
          moznosti: [{ t: 'Co nejblíž ke kolu.', ok: true },
            { t: 'Co nejblíž k rukojetím.', proc: 'U rukojetí má náklad nejdelší rameno – nesl(a) bys skoro celou tíhu.' },
            { t: 'Je to jedno, náklad váží pořád stejně.', proc: 'Tíha je stejná, ale moment závisí na rameni.' }],
          napoveda: 'Osou kolečka je náprava kola.',
          vysvetleni: 'Náklad blízko osy (kola) má krátké rameno, rukám pak stačí menší síla.' },
        { zadani: 'Biceps se upíná 4 cm od lokte, míč v dlani je 32 cm od lokte. Míč má tíhu 10 N. Jakou silou táhne sval?',
          moznosti: [{ t: '80 N', ok: true }, { t: '10 N', proc: 'Sval má 8× kratší rameno než míč – musí táhnout 8× větší silou.' },
            { t: '1,25 N', proc: 'Kratší rameno znamená větší sílu, ne menší.' }, { t: '40 N', proc: 'Poměr ramen je 32 : 4 = 8.' }],
          napoveda: 'F · 4 cm = 10 N · 32 cm.',
          vysvetleni: 'F = 10 N · 32 : 4 = 80 N. Tělo ztrácí sílu, ale získává rychlost a rozsah pohybu dlaně.' },
      ]);
    } },
    { id: 'kladka-sila', tema: 'kladky', nazev: 'Kladkostroj', gen() {
      const volne = vyber([1, 2, 3]), n = 2 * volne, G = vyber([120, 240, 360, 480, 600]);
      return { zadani: `Kladkostroj má <b>${volne} ${volne === 1 ? 'volnou kladku' : 'volné kladky'}</b> a zvedá břemeno o tíze <b>${G} N</b>. Jakou silou táhneš?`,
        moznosti: [{ t: N(G / n), ok: true },
          volne > 1 ? { t: N(G / volne), proc: `Každá volná kladka visí na dvou pramenech – nosných pramenů je ${n}, ne ${volne}.` }
                    : { t: N(2 * G), proc: 'Kladkostroj sílu nezvětšuje. Volná kladka visí na dvou pramenech.' },
          { t: N(G), proc: 'Celou tíhu táhneš jen u samotné pevné kladky.' }],
        napoveda: 'Spočítej nosné prameny: každá volná kladka visí na dvou.',
        vysvetleni: `Nosných pramenů je 2 · ${volne} = ${n}, takže F = ${G} : ${n} = ${N(G / n)}.` };
    } },
    { id: 'kladka-lano', tema: 'kladky', nazev: 'Kladkostroj', gen() {
      const n = vyber([2, 4, 6]), h = vyber([20, 30, 50, 100]);
      return { zadani: `Kladkostrojem se <b>${n} nosnými prameny</b> zvedáš břemeno o <b>${h} cm</b>. Kolik lana přitom vytáhneš?`,
        moznosti: [{ t: cm(n * h, 0), ok: true },
          { t: cm(h, 0), proc: 'O kolik se zvedne břemeno, o tolik se musí zkrátit každý nosný pramen – a těch je víc.' },
          { t: cm(h / n, 1), proc: 'Kladkostroj šetří sílu, ne dráhu – lana vytáhneš víc, ne méně.' }],
        napoveda: 's = n · h.',
        vysvetleni: `s = ${n} · ${h} cm = ${cm(n * h, 0)}. Menší síla se platí delší dráhou.` };
    } },
    { id: 'kladka-koncept', tema: 'kladky', nazev: 'Kladky', gen() {
      return vyber([
        { zadani: 'K čemu je <b>pevná kladka</b>, když sílu nezmenší?',
          moznosti: [{ t: 'Mění směr síly – můžeš táhnout dolů a pomoct si vlastní vahou.', ok: true },
            { t: 'Zmenší potřebnou práci na polovinu.', proc: 'Práci neušetří žádný jednoduchý stroj.' },
            { t: 'Zmenší sílu na polovinu.', proc: 'To dělá volná kladka. Na pevné kladce táhneš celou tíhu.' }],
          napoveda: 'Pevná kladka se jen otáčí na místě.',
          vysvetleni: 'Pevná kladka jen obrací směr: táhnout lano dolů je pohodlnější než zvedat břemeno nahoru.' },
        { zadani: 'Volnou kladkou zvedáš břemeno <b>300 N</b>. Jakou silou táhneš (kladka a lano jsou lehké)?',
          moznosti: [{ t: '150 N', ok: true }, { t: '300 N', proc: 'Volná kladka visí na dvou pramenech – každý nese polovinu.' }, { t: '600 N', proc: 'Kladka sílu nezvětšuje.' }],
          napoveda: 'Kolik pramenů drží volnou kladku?',
          vysvetleni: 'Dva prameny, každý nese polovinu: 300 N : 2 = 150 N.' },
      ]);
    } },
    { id: 'hridel', tema: 'prevody', nazev: 'Kolo na hřídeli', gen() {
      const r = vyber([5, 8, 10, 12]), k = vyber([2, 3, 4, 5]), R = r * k, G = vyber([60, 120, 180, 240]);
      return { zadani: `Rumpál má hřídel o poloměru <b>${r} cm</b> a kliku dlouhou <b>${R} cm</b>. Jakou silou točíš klikou, když vědro váží <b>${G} N</b>?`,
        moznosti: [{ t: N(G / k), ok: true },
          { t: N(G * k), proc: 'Dlouhá klika sílu zmenšuje: F = G · r / R.' },
          { t: N(G), proc: 'Stejná síla by stačila jen při kliče stejně dlouhé jako poloměr hřídele.' },
          { t: N(G / 2), proc: `Klika je ${k}× delší než poloměr hřídele, ne 2×.` }],
        napoveda: 'F · R = G · r.',
        vysvetleni: `F = ${G} N · ${r} cm : ${R} cm = ${N(G / k)}.` };
    } },
    { id: 'prevod', tema: 'prevody', nazev: 'Ozubená kola', gen() {
      const z1 = vyber([10, 12, 15, 20]), k = vyber([2, 3]), rychlo = Math.random() < 0.35;
      const zh = rychlo ? z1 * k : z1, zn = rychlo ? z1 : z1 * k, n1 = vyber([30, 60, 90, 120]), n2 = n1 * zh / zn;
      return { zadani: `Hnací kolo má <b>${zh} zubů</b> a točí se <b>${n1}× za minutu</b>. Pohání kolo s <b>${zn} zuby</b>. Kolikrát za minutu se otočí hnané kolo?`,
        moznosti: [{ t: cisK(n2, 1) + '×', ok: true },
          { t: cisK(n1 * zn / zh, 1) + '×', proc: 'Je to obráceně: kolo s víc zuby se točí pomaleji. n₂ = n₁ · z₁ / z₂.' },
          { t: n1 + '×', proc: 'Stejně rychle by se točila jen kola se stejným počtem zubů.' }],
        napoveda: 'Za minutu projde záběrem stejný počet zubů na obou kolech.',
        vysvetleni: `n₂ = ${n1} · ${zh} : ${zn} = ${cisK(n2, 1)}. ${n2 < n1 ? 'Převod do pomala – větší moment.' : 'Převod do rychla – menší moment.'}` };
    } },
    { id: 'prevod-koncept', tema: 'prevody', nazev: 'Převody', gen() {
      return vyber([
        { zadani: 'Mezi dvě ozubená kola vložíš <b>mezikolo</b>. Co se změní?',
          moznosti: [{ t: 'Jen smysl otáčení – převodový poměr zůstane stejný.', ok: true },
            { t: 'Převodový poměr se zvětší.', proc: 'Zuby mezikola se v poměru vykrátí: (z_m : z₁) · (z₂ : z_m) = z₂ : z₁.' },
            { t: 'Nic se nezmění.', proc: 'Poměr ne, ale hnané kolo se teď točí stejně jako hnací – dřív se točilo opačně.' }],
          napoveda: 'Každý záběr obrací směr.',
          vysvetleni: 'Dvě kola v záběru se točí proti sobě; mezikolo směr ještě jednou obrátí.' },
        { zadani: 'Jedeš na kole do kopce. Proč přeřadíš vzadu na <b>větší kolečko</b> (víc zubů)?',
          moznosti: [{ t: 'Převod do pomala: šlape se snadněji, jede se pomaleji.', ok: true },
            { t: 'Větší kolečko roztočí zadní kolo rychleji.', proc: 'Víc zubů na hnaném kolečku znamená menší otáčky kola.' },
            { t: 'Řetěz se méně natahuje.', proc: 'Rozhoduje poměr zubů: vzadu víc zubů → větší moment na kole.' }],
          napoveda: 'Hnané kolo s více zuby: menší otáčky, větší moment.',
          vysvetleni: 'Pastorek s více zuby dává větší moment na zadním kole za cenu nižší rychlosti.' },
        { zadani: 'Převodník má 44 zubů, pastorek 11 zubů. Kolikrát se otočí zadní kolo za jednu otáčku pedálů?',
          moznosti: [{ t: '4×', ok: true }, { t: '¼ otáčky', proc: 'Malý pastorek je hnané kolo s málo zuby – točí se rychleji.' }, { t: '1×', proc: 'Poměr zubů je 44 : 11.' }],
          napoveda: '44 : 11.',
          vysvetleni: 'Za jednu otáčku pedálů projde 44 článků řetězu, pastorek s 11 zuby se otočí 4×.' },
      ]);
    } },
    { id: 'rovina', tema: 'rovina', nazev: 'Nakloněná rovina', gen() {
      const G = vyber([300, 400, 600, 800, 1000]), h = vyber([0.5, 1, 1.5]), k = vyber([2, 3, 4, 5]), l = h * k;
      return { zadani: `Bednu o tíze <b>${G} N</b> vytahuješ po rampě dlouhé <b>${metry(l, 1)}</b> do výšky <b>${metry(h, 1)}</b>. Jak velkou silou (bez tření)?`,
        moznosti: [{ t: N(G / k), ok: true },
          { t: N(G), proc: 'Nakloněná rovina sílu zmenšuje – zvedání se rozloží na delší dráhu.' },
          { t: N(G * h), proc: 'Počítej F = G · h / l.' },
          { t: N(G * k), proc: 'Delší rampa sílu zmenšuje, nezvětšuje.' }],
        napoveda: 'F · l = G · h.',
        vysvetleni: `F = ${G} N · ${cisK(h, 1)} m : ${cisK(l, 1)} m = ${N(G / k)}.` };
    } },
    { id: 'zlate', tema: 'rovina', nazev: 'Zlaté pravidlo mechaniky', gen() {
      const G = vyber([200, 400, 600, 900]), h = vyber([1, 2, 3]), k = vyber([2, 3, 4]);
      return { zadani: `Stroj zvedne břemeno o tíze <b>${G} N</b> do výšky <b>${h} m</b>, když táhneš silou <b>${cisK(G / k, 1)} N</b>. Jak dlouhou dráhu urazí tvoje ruka (bez tření)?`,
        moznosti: [{ t: metry(h * k, 1), ok: true },
          { t: metry(h, 1), proc: 'Menší síla se vždy platí delší dráhou.' },
          { t: metry(h / k, 2), proc: 'Kdyby se zmenšila síla i dráha, vznikla by práce z ničeho.' }],
        napoveda: 'F₁ · s₁ = F₂ · s₂.',
        vysvetleni: `${G} N · ${h} m = ${cisK(G / k, 1)} N · s ⇒ s = ${metry(h * k, 1)}.` };
    } },
    { id: 'zlate-koncept', tema: 'rovina', nazev: 'Zlaté pravidlo mechaniky', gen() {
      return vyber([
        { zadani: 'Co platí pro <b>všechny jednoduché stroje</b> – páku, kladkostroj, rampu i převody?',
          moznosti: [{ t: 'Co získáš na síle, ztratíš na dráze – práce zůstane stejná.', ok: true },
            { t: 'Zmenší práci, kterou musíš vykonat.', proc: 'Práce F · s vyjde se strojem i bez něj stejně (bez tření).' },
            { t: 'Zmenší sílu i dráhu zároveň.', proc: 'Tak by vznikla práce z ničeho.' }],
          napoveda: 'Práce = síla · dráha.',
          vysvetleni: 'Zlaté pravidlo mechaniky: F₁ · s₁ = F₂ · s₂.' },
        { zadani: 'Proč vedou silnice do hor v serpentinách?',
          moznosti: [{ t: 'Delší cesta s menším sklonem – auto potřebuje menší tažnou sílu.', ok: true },
            { t: 'Serpentiny zkracují cestu.', proc: 'Naopak, cesta je delší – zato mírnější.' },
            { t: 'Auto pak vykoná menší práci.', proc: 'Práce na zvednutí auta je stejná, jen se rozloží na delší dráhu.' }],
          napoveda: 'Serpentina je nakloněná rovina.',
          vysvetleni: 'Serpentina je dlouhá nakloněná rovina: F = G · h / l – delší l, menší síla.' },
        { zadani: 'Který z předmětů je <b>klín</b>?',
          moznosti: [{ t: 'Sekera', ok: true }, { t: 'Rumpál', proc: 'Rumpál je kolo na hřídeli.' }, { t: 'Houpačka', proc: 'Houpačka je dvojzvratná páka.' }, { t: 'Kladkostroj', proc: 'Kladkostroj tvoří kladky.' }],
          napoveda: 'Klín jsou dvě nakloněné roviny zády k sobě.',
          vysvetleni: 'Ostří sekery je klín: úder shora rozrazí dřevo do stran.' },
      ]);
    } },
  ];
  const TEMATA = [['vse', 'Vše'], ['paka', 'Moment a páka'], ['kladky', 'Kladky'], ['prevody', 'Hřídel a převody'], ['rovina', 'Rovina a zlaté pravidlo']];

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
      this.skore = Uloha.skore('metodus_paka_lekce_skore', $('#cv-skore'));
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
    for (const f of [modelKlic, modelLab, modelHoupacka, modelKolecko, modelPredlokti, modelKladky, modelHridel, modelKola, modelBicykl, modelRovina, modelZlate, tridicka]) {
      try { f(); } catch (e) { console.error('Model se nepodařilo spustit:', f.name, e); }
    }
    Navigace.init();
    odkazyNaLekce();
    Procvic.init();
    Model.vsechny.forEach(m => m.naplanuj());
  }
  window.addEventListener('metodus-theme', () => Model.vsechny.forEach(m => m.naplanuj()));
  window.PakaLekce = { MODELY, Ukoly, Postup, Model, GENERATORY, PREDMETY, get Procvic() { return Procvic; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
