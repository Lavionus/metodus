/* ============================================================
   theme.js – sdílené přepínání světlého/tmavého tématu.
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
  function pouzij(tema) {
    if (tema === 'light') document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
  }

  // přes file:// nebo při zablokovaném úložišti getItem vyhodí výjimku
  try { pouzij(localStorage.getItem('webapp_theme')); }
  catch { pouzij(null); }

  // jiná záložka nebo samostatně otevřené okno
  window.addEventListener('storage', e => {
    if (e.key === 'webapp_theme') pouzij(e.newValue);
  });

  // rozcestník ve stejné záložce (iframe)
  window.addEventListener('message', e => {
    if (e.data && typeof e.data.tema === 'string') pouzij(e.data.tema);
  });
})();
