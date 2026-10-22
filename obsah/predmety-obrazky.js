/* Generované ilustrace IMG-00-02; původ a zadání: img/kapitola-7-1.md. */
window.PredmetyObrazky = (() => {
  const motivy = {
    cj: 'kniha-pero', m: 'teleso-pravitko', aj: 'slovniky', dcj: 'slovniky',
    prv: 'domek-strom', inf: 'notebook', f: 'atom', ch: 'banka',
    pr: 'list-bunka', z: 'globus', d: 'hrad', mapa: 'lupa-mapa',
    hv: 'housle', vo: 'vahy', nastroje: 'karticky'
  };
  // skupiny = předměty (KATALOG_SKUPINY)
  const skupiny = {
    cestina: ['cj'], matematika: ['m'], anglictina: ['aj'], dalsi_jazyk: ['dcj'], prvouka: ['prv'],
    informatika: ['inf'], fyzika: ['f'], chemie: ['ch'], prirodopis: ['pr'], zemepis: ['z'], dejepis: ['d'],
    obcanska: ['vo'], hudba: ['hv'], nastroje: ['nastroje']
  };
  function obrazek(predmet) {
    if (!motivy[predmet]) return null;
    const img = document.createElement('img');
    img.src = 'img/00/prehled-' + motivy[predmet] + '.webp';
    // Název předmětu je vždy hned vedle; ilustrace neopakuje jeho přístupný název.
    img.alt = ''; img.width = 768; img.height = 768;
    img.loading = 'lazy'; img.decoding = 'async'; img.className = 'predmet-ilustrace';
    return img;
  }
  function skupina(id) {
    if (!skupiny[id]) return null;
    const strip = document.createElement('span');
    strip.className = 'predmet-ilustrace-rada'; strip.setAttribute('aria-hidden', 'true');
    skupiny[id].forEach(predmet => strip.append(obrazek(predmet)));
    return strip;
  }
  return { obrazek, skupina };
})();
