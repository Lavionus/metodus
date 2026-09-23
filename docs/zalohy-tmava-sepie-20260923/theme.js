/* ============================================================
   theme.js – sdílené přepínání motivů: tmavý, světlý, vysoký kontrast, sépie,
   stará knihovna, škola, noční škola a volba „podle systému“.
   Vkládá se do <head> podstránek (před jejich vlastní <style>),
   aby se téma použilo ještě před vykreslením.

   Volbu ukládá rozcestník do localStorage['webapp_theme'].
   Do iframu se změna doručí přes postMessage — událost `storage`
   se ve stejné záložce nespouští, takže by přepnutí uvnitř
   rozcestníku podstránku nikdy nezasáhlo.
   ============================================================ */
/* Pojistka pro celý web: přes file:// (a při zablokovaném úložišti v přísném
   režimu soukromí) je kvóta nulová a localStorage.setItem vyhodí výjimku.
   Ta by shodila zbytek skriptu stránky – aplikace by se rozbila při prvním
   uložení. Obalíme zápis tak, aby místo výjimky jen tiše neuložil: stránka
   funguje dál, jen si nic nezapamatuje. */
(function () {
  try {
    const puvodni = Storage.prototype.setItem;
    Storage.prototype.setItem = function (klic, hodnota) {
      try { puvodni.call(this, klic, hodnota); }
      catch { /* bez trvalé paměti – hodnotu prostě neuložíme */ }
    };
  } catch { /* prohlížeč přepis nedovolí, necháme původní chování */ }
})();

/* Přejmenování webu Nodus → Metodus (září 2026): uložený postup, oblíbené
   a rekordy nesly klíče `nodus_*`. Při prvním načtení je přejmenujeme na
   `metodus_*`, aby uživatel o nic nepřišel; staré klíče se zahodí. Běží jen
   jednou (značka `metodus_migrace_nazvu`) a je to levné – jeden průchod
   seznamem klíčů. Musí proběhnout dřív než skripty stránky, proto je to tady
   v theme.js, který se vkládá do <head> synchronně. */
(function () {
  try {
    if (localStorage.getItem('metodus_migrace_nazvu')) return;
    for (const klic of Object.keys(localStorage)) {
      if (!klic.startsWith('nodus')) continue;
      const novy = 'metodus' + klic.slice('nodus'.length);
      if (localStorage.getItem(novy) === null) localStorage.setItem(novy, localStorage.getItem(klic));
      localStorage.removeItem(klic);
    }
    localStorage.setItem('metodus_migrace_nazvu', '1');
  } catch { /* zablokované úložiště – není co převádět */ }
})();

(function () {
  const root = document.documentElement;
  root.dataset.page = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
  /* Každý motiv má „tón“ – světlý nebo tmavý. Stránky se svými úpravami
     (CSS `:root[data-tone="light"]`, kreslení do plátna přes
     MetodusTheme.isLight()) se řídí tónem, takže sépie dostane světlé
     a stará knihovna tmavé varianty barev bez zvláštních pravidel. */
  const TONY = { dark: 'dark', light: 'light', kontrast: 'light', sepia: 'light', knihovna: 'dark', skola: 'light', 'nocni-skola': 'dark' };
  const JMENA = { auto: 'podle systému', dark: 'tmavé', light: 'světlé', kontrast: 'vysoký kontrast', sepia: 'sépie',
                  knihovna: 'stará knihovna', skola: 'škola', 'nocni-skola': 'noční škola' };
  const TEXTURY = { sepia: 'obsah/textures/recyklovany-papir.webp', knihovna: 'obsah/textures/knihovna-drevo.webp',
                    'nocni-skola': 'obsah/textures/tabule-krida.webp' };
  /* „auto“ není samostatný vzhled: vykreslí se tmavý nebo světlý motiv podle
     nastavení zařízení a při jeho změně (tablet v nočním režimu) se přepne za běhu.
     Ukládá se ale jako „auto“, aby volba přežila i změnu systému. */
  const themes = ['auto', ...Object.keys(TONY)];
  const systemSvetly = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  let current = 'dark';
  function normalize(value) { return themes.includes(value) ? value : (root.dataset.defaultTheme || 'dark'); }
  function vykresleny(volba) { return volba === 'auto' ? (systemSvetly?.matches ? 'light' : 'dark') : volba; }
  function apply(value) {
    current = normalize(value);
    const motiv = vykresleny(current);
    // tón napřed: pozorovatelé atributu data-theme už mají číst nový tón
    root.dataset.tone = TONY[motiv];
    if (motiv === 'dark') delete root.dataset.theme;
    else root.dataset.theme = motiv;
    window.dispatchEvent(new CustomEvent('metodus-theme', { detail: { theme: current, rendered: motiv } }));
  }
  systemSvetly?.addEventListener?.('change', () => { if (current === 'auto') apply('auto'); });
  function set(value) {
    apply(value);
    try { localStorage.setItem('webapp_theme', current); } catch { /* bez trvalé paměti */ }
    document.querySelectorAll('iframe').forEach(frame => frame.contentWindow?.postMessage({ tema: current }, '*'));
    if (window.parent !== window) window.parent.postMessage({ metodusTemaVolba: current }, '*');
    return current;
  }
  /* Vzorek textury motivu pro plátno (canvas neumí CSS pozadí). Dokud se
     obrázek nenačte, vrací plnou barvu; po načtení vyšle `metodus-paper-ready`. */
  const scriptURL = document.currentScript?.src || new URL('theme.js', location.href).href;
  const obrazky = {};
  const patterns = new WeakMap();
  function paper(ctx, fallback) {
    const tema = root.dataset.theme;
    if (!TEXTURY[tema]) return fallback;
    const zaklad = getComputedStyle(root).getPropertyValue('--bg-panel').trim() || fallback;
    let img = obrazky[tema];
    if (!img) {
      img = obrazky[tema] = new Image();
      img.onload = () => window.dispatchEvent(new CustomEvent('metodus-paper-ready'));
      img.src = new URL(TEXTURY[tema], scriptURL).href;
    }
    if (!img.complete || !img.naturalWidth) return zaklad;
    const klic = tema + zaklad;
    const ulozene = patterns.get(ctx);
    if (ulozene?.klic === klic) return ulozene.vzor;
    const tile = document.createElement('canvas'); tile.width = tile.height = 512;
    const c = tile.getContext('2d'); c.fillStyle = zaklad; c.fillRect(0, 0, 512, 512);
    c.globalCompositeOperation = tema === 'sepia' ? 'multiply' : 'overlay';
    c.drawImage(img, 0, 0, 512, 512);
    const vzor = ctx.createPattern(tile, 'repeat');
    patterns.set(ctx, { klic, vzor });
    return vzor;
  }
  window.MetodusTheme = {
    themes,
    get: () => current, set,
    rendered: () => vykresleny(current),
    next: () => set(themes[(themes.indexOf(current) + 1) % themes.length]),
    // u volby „podle systému“ doplní, co se právě vykresluje: „podle systému (tmavé)“
    name: (tema = current) => tema === 'auto' ? JMENA.auto + ' (' + JMENA[vykresleny('auto')] + ')' : JMENA[tema],
    isLight: () => root.dataset.tone === 'light',
    isSepia: () => root.dataset.theme === 'sepia',
    ink: (original, sepia = '#62513b') => root.dataset.theme === 'sepia' ? sepia : original,
    paper
  };
  try { apply(localStorage.getItem('webapp_theme')); } catch { apply(null); }
  window.addEventListener('storage', e => { if (e.key === 'webapp_theme') apply(e.newValue); });
  window.addEventListener('message', e => {
    if (e.data && themes.includes(e.data.tema)) apply(e.data.tema);
  });
})();
