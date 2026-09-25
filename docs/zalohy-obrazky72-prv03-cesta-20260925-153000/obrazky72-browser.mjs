import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';

const base = process.env.METODUS_TEST_URL || 'http://127.0.0.1:8766/';
const endpoint = process.env.METODUS_CDP_URL || 'http://127.0.0.1:9223/json';
const target = (await (await fetch(endpoint)).json()).find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.onopen = resolve);
let id = 0;
const pending = new Map();
const errors = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
};
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const requestId = ++id;
  const timer = setTimeout(() => reject(Error(method + ' timeout')), 15000);
  pending.set(requestId, message => {
    clearTimeout(timer);
    message.error ? reject(Error(JSON.stringify(message.error))) : resolve(message.result);
  });
  ws.send(JSON.stringify({id: requestId, method, params}));
});
const ev = async expression => {
  const result = await call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const ready = async expression => {
  for (let i = 0; i < 100; i++) { if (await ev(expression)) return; await pause(50); }
  throw Error('Not ready: ' + expression);
};

const pages = ['cj1_pismena', 'slabiky', 'cteni_s_porozumenim', 'cj2_abeceda', 'cj2_tvrde_mekke', 'doplnovacky', 'vyjmenovana_slova', 'cj2_druhy_vet', 'cj3_slovesa', 'cj6_slovni_zasoba', 'cj6_baje', 'cj8_sloh', 'm3_deleni_zbytkem', 'm4_zlomky_uvod', 'm5_slovni_ulohy', 'm7_cela_cisla', 'procenta', 'clock_learning', 'm8_pythagoras', 'm9_podobnost', 'aj_slovicka', 'aj5_pritomny_prubehovy', 'prv1_rodina', 'de_slovicka', 'fr_slovicka'];
const results = [];
try {
  await call('Page.enable');
  await call('Runtime.enable');
  for (const page of pages) {
    await call('Page.navigate', {url: base + 'obsah/' + page + '.html'});
    await ready(`document.readyState === 'complete' && document.querySelector('#plocha, #tabule, #gameCard, .container')`);

    if (page === 'cj1_pismena') {
      assert.equal(await ev('SLOVA.length'), 40);
      assert.ok(await ev(`document.querySelector('.obrazek-slova').naturalWidth > 0`));
      for (const mode of ['rozklad', 'skladani', 'prvni', 'posledni']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        await ev(`document.querySelector('.obrazek-slova').decode()`);
        assert.ok(await ev(`document.querySelector('.obrazek-slova').naturalWidth > 0`));
      }
    }
    if (page === 'slabiky') {
      await ev(`document.querySelector('[data-rezim="slova"]').click(); poradi=['pes']; idx=0; ukaz()`);
      await ev(`document.querySelector('.slovo-obrazek').decode()`);
      assert.ok(await ev(`document.querySelector('.slovo-obrazek').naturalWidth > 0`));
      assert.equal(await ev(`document.querySelector('.slovo-obrazek').alt`), 'Pes.');
      const vety = {
        'Máma má mísu.': 'slabiky-veta-mama-misa', 'Ema má maso.': 'slabiky-veta-ema-maso',
        'Táta je doma.': 'slabiky-veta-tata-doma', 'Pes leží u boudy.': 'slabiky-veta-pes-bouda',
        'Sova sedí na dubu.': 'slabiky-veta-sova-dub', 'Jana nese jahody.': 'slabiky-veta-jana-jahody',
        'U lesa je louka.': 'slabiky-veta-les-louka', 'Kolo je u domu.': 'slabiky-veta-kolo-dum',
        'Míša pije kakao.': 'slabiky-veta-misa-kakao', 'Teta peče koláče.': 'slabiky-veta-teta-kolace',
      };
      await ev(`document.querySelector('[data-rezim="vety"]').click()`);
      for (const [veta, soubor] of Object.entries(vety)) {
        await ev(`poradi=[${JSON.stringify(veta)}]; idx=0; ukaz()`);
        await ev(`document.querySelector('.veta-obrazek').decode()`);
        assert.ok(await ev(`document.querySelector('.veta-obrazek').naturalWidth > 0`));
        assert.ok(await ev(`document.querySelector('.veta-obrazek').src.includes(${JSON.stringify(soubor)})`));
      }
    }
    if (page === 'cteni_s_porozumenim') {
      assert.equal(await ev(`TEXTY[1].length`), 8);
      assert.ok(await ev(`TEXTY[1].every(i => i.img && i.img.length === 2)`));
      for (let i = 0; i < 8; i++) {
        await ev(`pool=[TEXTY[1][${i}]]; idx=0; document.querySelector('#gameCard').style.display='block'; loadText()`);
        await ev(`document.querySelector('#textIlustrace').decode()`);
        assert.ok(await ev(`!document.querySelector('#textIlustrace').hidden && document.querySelector('#textIlustrace').naturalWidth > 0`));
        assert.ok(await ev(`document.querySelector('#textIlustrace').alt.length > 12`));
      }
      await ev(`pool=[TEXTY[2][0]]; idx=0; loadText()`);
      assert.ok(await ev(`document.querySelector('#textIlustrace').hidden && !document.querySelector('#textIlustrace').hasAttribute('src') && getComputedStyle(document.querySelector('#textIlustrace')).display === 'none'`));
      await ev(`pool=[TEXTY[1][0]]; idx=0; loadText()`);
    }
    if (page === 'cj2_abeceda') {
      assert.ok(await ev(`popisSlova('auto').includes('cj1-pismena-auto.webp')`));
      for (const mode of ['chybejici', 'prvni', 'serad']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'cj2_tvrde_mekke') {
      assert.equal(await ev(`document.querySelectorAll('.domek-pomucka').length`), 2);
      assert.ok(await ev(`[...document.querySelectorAll('.domek-pomucka')].every(i => i.naturalWidth > 0)`));
      for (const mode of ['doplnovani', 'trideni', 'kontrola']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'doplnovacky') {
      assert.equal(await ev(`document.querySelectorAll('.vyznamy img').length`), 8);
      assert.ok(await ev(`[...document.querySelectorAll('.vyznamy img')].every(i => i.naturalWidth > 0)`));
      await ev(`document.querySelector('[data-rezim="kontrola"]').click()`);
      assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
    }
    if (page === 'vyjmenovana_slova') {
      await ev(`document.querySelector('[data-rezim="prehled"]').click()`);
      assert.equal(await ev(`document.querySelectorAll('.obrazkova-rada img').length`), 65);
      await ev(`Promise.all([...document.querySelectorAll('.obrazkova-rada img')].map(i => i.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.obrazkova-rada img')].every(i => i.naturalWidth > 0)`));
      assert.ok(await ev(`obrazekSlova('býk').includes('vyjmenovana-b-byk.webp')`));
      assert.ok(await ev(`obrazekSlova('pelyněk').includes('vyjmenovana-l-pelynek.webp')`));
      assert.ok(await ev(`obrazekSlova('mýto').includes('vyjmenovana-m-myto.webp')`));
      assert.ok(await ev(`obrazekSlova('myš').includes('cj1-pismena-mys.webp')`));
      assert.ok(await ev(`obrazekSlova('slepýš').includes('vyjmenovana-p-slepys.webp')`));
      assert.ok(await ev(`obrazekSlova('sýček').includes('vyjmenovana-s-sycek.webp')`));
      assert.ok(await ev(`obrazekSlova('výheň').includes('vyjmenovana-v-vyhen.webp')`));
      assert.ok(await ev(`obrazekSlova('Ruzyně').includes('vyjmenovana-z-ruzyne.webp')`));
      await ev(`document.querySelector('[data-rezim="serie"]').click()`);
      assert.ok(await ev(`document.querySelector('#plocha').textContent.includes('Spustit sérii')`));
      await ev(`document.querySelector('[data-rezim="prehled"]').click()`);
      await ev(`Promise.all([...document.querySelectorAll('.obrazkova-rada img')].map(i => i.decode()))`);
    }
    if (page === 'cj2_druhy_vet') {
      assert.equal(await ev(`document.querySelectorAll('#scenkyVolby button').length`), 4);
      for (const klic of ['stul', 'hriste', 'trida', 'obchod']) {
        await ev(`document.querySelector('[data-scenka="${klic}"]').click()`);
        await ev(`document.querySelector('#scenkaObrazek').decode()`);
        assert.ok(await ev(`document.querySelector('#scenkaObrazek').src.includes('cj2-druhy-vet-${klic}.webp')`));
        assert.equal(await ev(`document.querySelectorAll('#scenkaVety .bublina').length`), 4);
      }
      for (const mode of ['druh', 'znamenko', 'najdi']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'cj3_slovesa') {
      assert.equal(await ev(`document.querySelectorAll('.osoba-obrazek img').length`), 6);
      assert.ok(await ev(`[...document.querySelectorAll('.osoba-obrazek img')].every(i => i.naturalWidth > 0)`));
      for (const mode of ['cas', 'osoba', 'cislo', 'prevod']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
      await ev(`rozsvitOsobu({mnozne:false,osoba:0})`);
      assert.equal(await ev(`document.querySelector('.osoba-obrazek.sviti').dataset.zajmeno`), 'ja');
      await ev(`rozsvitOsobu({mnozne:true,osoba:2})`);
      assert.equal(await ev(`document.querySelector('.osoba-obrazek.sviti').dataset.zajmeno`), 'oni');
    }
    if (page === 'cj6_slovni_zasoba') {
      assert.equal(await ev(`document.querySelectorAll('#slovaVolby button').length`), 8);
      for (const slovo of ['koruna', 'kohoutek', 'oko', 'list', 'pero', 'zámek', 'jazyk', 'kolej']) {
        await ev(`document.querySelector('[data-slovo="${slovo}"]').click()`);
        assert.equal(await ev(`document.querySelectorAll('#vyznamyObrazky img').length`), 3);
        await ev(`Promise.all([...document.querySelectorAll('#vyznamyObrazky img')].map(i => i.decode()))`);
        assert.ok(await ev(`[...document.querySelectorAll('#vyznamyObrazky img')].every(i => i.naturalWidth > 0)`));
      }
      for (const mode of ['vztah', 'mnohoznacnost', 'vyznamVeVete', 'nadrazene']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'cj6_baje') {
      assert.equal(await ev(`document.querySelectorAll('.zanr-vineta').length`), 4);
      await ev(`Promise.all([...document.querySelectorAll('.zanr-vineta')].map(i => i.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.zanr-vineta')].every(i => i.naturalWidth > 0 && i.alt.length > 12)`));
      assert.deepEqual(await ev(`[...document.querySelectorAll('.skupina')].map(x => [x.dataset.h, x.querySelector('.zanr-vineta').src.split('/').pop()])`), [
        ['pohadka', 'cj6-zanr-pohadka.webp'], ['povest', 'cj6-zanr-povest.webp'],
        ['baje', 'cj6-zanr-baje.webp'], ['bajka', 'cj6-zanr-bajka.webp'],
      ]);
      for (const mode of ['zanr', 'bohove', 'hrdinove', 'pojmy']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'cj8_sloh') {
      assert.equal(await ev(`document.querySelectorAll('.tema-obrazek').length`), 1);
      await ev(`document.querySelector('.tema-obrazek').decode()`);
      assert.ok(await ev(`document.querySelector('.tema-obrazek').naturalWidth > 0 && document.querySelector('.tema-obrazek').alt.length > 30`));
      assert.equal(await ev(`document.querySelectorAll('.tema-otazky span').length`), 3);
      assert.deepEqual(await ev(`[...document.querySelectorAll('.tema-otazky span')].map(x => x.textContent.includes(':'))`), [true, true, true]);
      for (const mode of ['utvar', 'znaky', 'osnova', 'jazyk']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'm3_deleni_zbytkem') {
      assert.equal(await ev(`PREDMETY.length`), 6);
      await ev(`window.__puvodniNahodne = Uloha.nahodne`);
      for (let i = 0; i < 6; i++) {
        await ev(`Uloha.nahodne = a => a[${i}]; obrazek()`);
        await ev(`Promise.all([...document.querySelectorAll('.hromada .predmet')].map(x => x.decode()))`);
        assert.ok(await ev(`document.querySelectorAll('.hromada .predmet').length >= 9`));
        assert.ok(await ev(`[...document.querySelectorAll('.hromada .predmet')].every(x => x.naturalWidth > 0 && x.src.includes(PREDMETY[${i}].soubor))`));
      }
      await ev(`Uloha.nahodne = window.__puvodniNahodne; delete window.__puvodniNahodne`);
      for (const mode of ['vypocet', 'obrazek', 'zkouska']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
      await ev(`document.querySelector('[data-rezim="obrazek"]').click()`);
    }
    if (page === 'm4_zlomky_uvod') {
      assert.equal(await ev(`document.querySelectorAll('.realne-celky img').length`), 4);
      assert.equal(await ev(`document.querySelectorAll('.deleni-overlay').length`), 4);
      await ev(`Promise.all([...document.querySelectorAll('.realne-celky img')].map(x => x.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.realne-celky img')].every(x => x.naturalWidth > 0 && x.alt.length > 20)`));
      assert.deepEqual(await ev(`[...document.querySelectorAll('.celek-karta figcaption')].map(x => x.textContent.includes(':'))`), [true, true, true, true]);
      for (const mode of ['ukazka', 'prectiZlomek', 'vybarvi', 'porovnej', 'zCelku']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'm5_slovni_ulohy') {
      assert.equal(await ev(`SABLONY.length`), 6);
      await ev(`window.__puvodniNahodne = Uloha.nahodne`);
      for (let i = 0; i < 6; i++) {
        await ev(`Uloha.nahodne = a => a === SABLONY ? a[${i}] : window.__puvodniNahodne(a); vyres()`);
        await ev(`document.querySelector('.scena-ulohy img').decode()`);
        assert.ok(await ev(`document.querySelector('.scena-ulohy img').naturalWidth > 0`));
        assert.ok(await ev(`document.querySelector('.scena-ulohy img').src.includes(['obchod','vlak','zahrada','jidelna','sbirka','cyklo'][${i}])`));
        assert.ok(await ev(`document.querySelector('.zadani-ulohy').querySelectorAll('b').length >= 2`));
      }
      await ev(`Uloha.nahodne = window.__puvodniNahodne; delete window.__puvodniNahodne`);
      for (const mode of ['vyres', 'prvniKrok', 'odhad']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('.scena-ulohy img').naturalWidth > 0`));
      }
    }
    if (page === 'm7_cela_cisla') {
      assert.equal(await ev(`document.querySelectorAll('.kontext-cisla').length`), 3);
      assert.equal(await ev(`document.querySelectorAll('.kontext-stupnice').length`), 3);
      await ev(`Promise.all([...document.querySelectorAll('.kontext-cisla img')].map(x => x.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.kontext-cisla img')].every(x => x.naturalWidth > 0 && x.alt.length > 20)`));
      assert.ok(await ev(`[...document.querySelectorAll('.kontext-stupnice')].every(x => x.textContent.includes('0'))`));
      for (const mode of ['osa', 'porovnani', 'operace', 'soucin', 'absolutni']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'procenta') {
      assert.equal(await ev(`document.querySelectorAll('.procenta-kontext').length`), 4);
      assert.equal(await ev(`document.querySelectorAll('.procenta-udaj').length`), 4);
      await ev(`Promise.all([...document.querySelectorAll('.procenta-kontext img')].map(x => x.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.procenta-kontext img')].every(x => x.naturalWidth > 0 && x.alt.length > 20)`));
      for (const mode of ['zceho', 'kolikpct', 'zaklad', 'trojclenka']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'clock_learning') {
      assert.equal(await ev(`document.querySelectorAll('.denni-krok').length`), 6);
      assert.equal(await ev(`document.querySelectorAll('.denni-cas').length`), 6);
      await ev(`Promise.all([...document.querySelectorAll('.denni-krok img')].map(x => x.decode()))`);
      assert.ok(await ev(`[...document.querySelectorAll('.denni-krok img')].every(x => x.naturalWidth > 0 && x.alt.length > 20)`));
      for (const pane of ['poznej', 'nastav', 'volne']) {
        await ev(`document.querySelector('[data-pane="${pane}"]').click()`);
        assert.ok(await ev(`document.querySelector('#${pane}').classList.contains('active')`));
      }
    }
    if (page === 'm8_pythagoras') {
      assert.equal(await ev(`SLOVNI.length`), 4);
      await ev(`window.__puvodniNahodne = Uloha.nahodne`);
      for (let i = 0; i < 4; i++) {
        await ev(`Uloha.nahodne = a => a === SLOVNI ? a[${i}] : window.__puvodniNahodne(a); slovni()`);
        await ev(`document.querySelector('.slovni-scena img').decode()`);
        assert.ok(await ev(`document.querySelector('.slovni-scena img').naturalWidth > 0`));
        assert.ok(await ev(`document.querySelector('.slovni-scena img').src.includes(['zebrik','drak','zkratka','stozar'][${i}])`));
      }
      await ev(`Uloha.nahodne = window.__puvodniNahodne; delete window.__puvodniNahodne`);
      for (const mode of ['dukaz', 'prepona', 'odvesna', 'slovni']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
    }
    if (page === 'm9_podobnost') {
      await ev(`document.querySelector('[data-rezim="stin"]').click()`);
      assert.equal(await ev(`document.querySelectorAll('.stin-ilustrace img').length`), 1);
      await ev(`document.querySelector('.stin-ilustrace img').decode()`);
      assert.ok(await ev(`document.querySelector('.stin-ilustrace img').naturalWidth > 0 && document.querySelector('.stin-ilustrace img').alt.length > 40`));
      assert.ok(await ev(`document.querySelector('#scena') && document.querySelector('#posUhel')`));
      for (const mode of ['stejnolehlost', 'stin', 'poznej', 'vety', 'pomer', 'dopocet', 'meritko', 'vlastnosti']) {
        await ev(`document.querySelector('[data-rezim="${mode}"]').click()`);
        assert.ok(await ev(`document.querySelector('#plocha').textContent.trim().length > 10`));
      }
      await ev(`document.querySelector('[data-rezim="stin"]').click()`);
    }
    if (page === 'aj_slovicka') {
      assert.equal(await ev(`TEMATA['Zvířata'].length`), 12);
      assert.ok(await ev(`TEMATA['Zvířata'].every(s => s[4]?.endsWith('.webp'))`));
      assert.ok(await ev(`document.querySelector('#kEmoji img')?.naturalWidth > 0`));
      for (let i = 0; i < 12; i++) {
        await ev(`document.querySelector('#kDalsi').click(); document.querySelector('#kEmoji img').decode()`);
        assert.ok(await ev(`document.querySelector('#kEmoji img').naturalWidth > 0`));
      }
      await ev(`document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 12);
      await ev(`document.querySelector('[data-rezim="slovo"]').click()`);
      assert.ok(await ev(`document.querySelector('.obrazek-slova img')?.naturalWidth > 0`));
      assert.equal(await ev(`TEMATA['Jídlo'].length`), 10);
      assert.ok(await ev(`TEMATA['Jídlo'].every(s => s[4]?.endsWith('.webp'))`));
      await ev(`document.querySelector('[data-kat="Jídlo"]').click(); document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 10);
      await ev(`document.querySelector('[data-rezim="karticky"]').click()`);
      for (let i = 0; i < 10; i++) {
        await ev(`document.querySelector('#kDalsi').click(); document.querySelector('#kEmoji img').decode()`);
        assert.ok(await ev(`document.querySelector('#kEmoji img').naturalWidth > 0`));
      }
      assert.equal(await ev(`TEMATA['Škola'].length`), 9);
      assert.ok(await ev(`TEMATA['Škola'].every(s => s[4]?.endsWith('.webp'))`));
      await ev(`document.querySelector('[data-kat="Škola"]').click(); document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 9);
      await ev(`document.querySelector('[data-rezim="karticky"]').click()`);
      for (let i = 0; i < 9; i++) {
        await ev(`document.querySelector('#kDalsi').click(); document.querySelector('#kEmoji img').decode()`);
        assert.ok(await ev(`document.querySelector('#kEmoji img').naturalWidth > 0`));
      }
      assert.equal(await ev(`TEMATA['Rodina'].length`), 7);
      assert.ok(await ev(`TEMATA['Rodina'].every(s => s[4]?.endsWith('.webp'))`));
      await ev(`document.querySelector('[data-kat="Rodina"]').click(); document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 7);
      await ev(`document.querySelector('[data-rezim="karticky"]').click()`);
      for (let i = 0; i < 7; i++) {
        await ev(`document.querySelector('#kDalsi').click(); document.querySelector('#kEmoji img').decode()`);
        assert.ok(await ev(`document.querySelector('#kEmoji img').naturalWidth > 0`));
      }
      assert.equal(await ev(`TEMATA['Dům a nábytek'].length`), 9);
      assert.ok(await ev(`TEMATA['Dům a nábytek'].every(s => s[4]?.endsWith('.webp'))`));
      await ev(`document.querySelector('[data-kat="Dům a nábytek"]').click(); document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 9);
      assert.equal(await ev(`TEMATA['Oblečení'].length`), 10);
      assert.ok(await ev(`TEMATA['Oblečení'].every(s => s[4]?.endsWith('.webp'))`));
      await ev(`document.querySelector('[data-kat="Oblečení"]').click(); document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 10);
      assert.ok(await ev(`[...document.querySelectorAll('.emoji-bunka img')].every(i => i.naturalWidth > 0)`));
      await ev(`document.querySelector('[data-rezim="karticky"]').click()`);
      for (let i = 0; i < 10; i++) {
        await ev(`document.querySelector('#kDalsi').click(); document.querySelector('#kEmoji img').decode()`);
        assert.ok(await ev(`document.querySelector('#kEmoji img').naturalWidth > 0`));
      }
      await ev(`document.querySelector('[data-kat="Barvy"]').click(); document.querySelector('[data-rezim="karticky"]').click()`);
      assert.equal(await ev(`document.querySelector('#kEmoji img')`), null);
      assert.ok(await ev(`document.querySelector('#kEmoji').textContent.trim().length > 0`));
      await ev(`document.querySelector('[data-kat="Oblečení"]').click()`);
    }
    if (page === 'aj5_pritomny_prubehovy') {
      assert.equal(await ev(`OBRAZKY.length`), 10);
      assert.equal(await ev(`new Set(OBRAZKY.map(x => x.v)).size`), 10);
      await ev(`document.querySelector('[data-rezim="popisObrazku"]').click()`);
      await ev(`document.querySelector('.park-scena img').decode()`);
      assert.ok(await ev(`document.querySelector('.park-scena img').naturalWidth > 0`));
      assert.equal(await ev(`document.querySelectorAll('.park-bod').length`), 10);
      assert.equal(await ev(`document.querySelectorAll('.park-bod.cil[aria-current="true"]').length`), 1);
      assert.equal(await ev(`document.querySelectorAll('.moznosti button').length`), 4);
      await ev(`document.querySelector('.park-bod:not(.cil)').click()`);
      assert.equal(await ev(`document.querySelectorAll('.park-bod.cil[aria-current="true"]').length`), 1);
      assert.equal(await ev(`document.activeElement.classList.contains('park-bod')`), false);
      for (let i = 0; i < 10; i++) {
        await ev(`novaUloha(); document.querySelector('.park-scena img').decode()`);
        assert.equal(await ev(`document.querySelectorAll('.park-bod').length`), 10);
        assert.equal(await ev(`document.querySelectorAll('.park-bod.cil').length`), 1);
      }
    }
    if (page === 'prv1_rodina') {
      assert.equal(await ev(`PATRA.flatMap(p => p.clenove).length`), 8);
      assert.ok(await ev(`PATRA.flatMap(p => p.clenove).every(x => x.img?.endsWith('.webp'))`));
      await ev(`Promise.all([...document.querySelectorAll('.kartik img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.kartik img').length`), 8);
      assert.ok(await ev(`[...document.querySelectorAll('.kartik img')].every(i => i.naturalWidth > 0)`));
      await ev(`for (const b of [...document.querySelectorAll('.kartik')]) { const p = PATRA.flatMap((x,i) => x.clenove.map(c => [c.id,i])).find(x => x[0] === b.dataset.id)[1]; b.click(); document.querySelector('.misto:not(.plne)[data-patro="'+p+'"]').click(); }`);
      assert.equal(await ev(`document.querySelectorAll('.misto.plne img').length`), 8);
      await ev(`document.querySelector('[data-rezim="vztahy"]').click(); Promise.all([...document.querySelectorAll('.rodina-portret')].map(i => i.decode()))`);
      assert.ok(await ev(`document.querySelectorAll('.moznosti .rodina-portret').length === 4 && [...document.querySelectorAll('.rodina-portret')].every(i => i.naturalWidth > 0)`));
      await ev(`document.querySelector('[data-rezim="rodokmen"]').click()`);
    }
    if (page === 'de_slovicka' || page === 'fr_slovicka') {
      assert.equal(await ev(`Object.keys(OBRAZKY_DOMOV).length`), 9);
      await ev(`document.querySelector('[data-kat="domov"]').click(); document.querySelector('[data-rezim="prehled"]').click(); Promise.all([...document.querySelectorAll('.emoji-bunka img')].map(i => i.decode()))`);
      assert.equal(await ev(`document.querySelectorAll('.emoji-bunka img').length`), 9);
      assert.ok(await ev(`[...document.querySelectorAll('.emoji-bunka img')].every(i => i.naturalWidth > 0)`));
      await ev(`document.querySelector('[data-rezim="karticky"]').click()`);
      for (let i = 0; i < 9; i++) {
        await ev(`document.querySelector('#kDalsi').click(); document.querySelector('#kEmoji img').decode()`);
        assert.ok(await ev(`document.querySelector('#kEmoji img').naturalWidth > 0`));
      }
    }

    for (const width of [1280, 390, 320]) for (const theme of ['dark', 'light']) {
      await call('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: false});
      await ev(`document.documentElement.dataset.theme='${theme}'; Promise.all([...document.images].filter(i => i.hasAttribute('src')).map(i => i.decode()))`);
      assert.equal(await ev(`document.documentElement.scrollWidth > innerWidth + 1`), false, page + ' overflow ' + width);
      assert.ok(await ev(`[...document.images].filter(i => i.hasAttribute('src')).every(i => i.naturalWidth > 0)`));
      if (width === 390 && theme === 'light') {
        if (page === 'cj8_sloh') await ev(`document.querySelector('.spolecne-tema').scrollIntoView({block:'start'})`);
        if (page === 'm4_zlomky_uvod') await ev(`document.querySelector('.realne-celky').scrollIntoView({block:'start'})`);
        if (page === 'm5_slovni_ulohy') await ev(`document.querySelector('.scena-ulohy').scrollIntoView({block:'start'})`);
        if (page === 'm7_cela_cisla') await ev(`document.querySelector('.kontexty-celych').scrollIntoView({block:'start'})`);
        if (page === 'procenta') await ev(`document.querySelector('.procenta-kontexty').scrollIntoView({block:'start'})`);
        if (page === 'clock_learning') await ev(`document.querySelector('.denni-pas').scrollIntoView({block:'start'})`);
        if (page === 'm8_pythagoras') { await ev(`document.querySelector('[data-rezim="slovni"]').click()`); await ev(`document.querySelector('.slovni-scena').scrollIntoView({block:'start'})`); }
        if (page === 'm9_podobnost') { await ev(`document.querySelector('[data-rezim="stin"]').click()`); await ev(`document.querySelector('.stin-ilustrace').scrollIntoView({block:'start'})`); }
        if (page === 'aj_slovicka') { await ev(`document.querySelector('[data-rezim="karticky"]').click()`); await ev(`document.querySelector('.karticka').scrollIntoView({block:'start'})`); }
        if (page === 'aj5_pritomny_prubehovy') { await ev(`document.querySelector('[data-rezim="popisObrazku"]').click()`); await ev(`document.querySelector('.park-scena').scrollIntoView({block:'start'})`); }
        if (page === 'prv1_rodina') await ev(`document.querySelector('#plocha').scrollIntoView({block:'start'})`);
        if (page === 'de_slovicka' || page === 'fr_slovicka') { await ev(`document.querySelector('[data-rezim="karticky"]').click()`); await ev(`document.querySelector('.karticka').scrollIntoView({block:'start'})`); }
        await pause(300);
        const shot = await call('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
        await writeFile('/tmp/obrazky72-' + page + '.png', Buffer.from(shot.data, 'base64'));
      }
    }
    results.push(page + ': images, modes, themes, widths OK');
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({results, runtimeErrors: errors}, null, 2));
} finally {
  ws.close();
}
