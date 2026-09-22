/* IMG-aj-01: generované ilustrační řezy, bez syntetického poslechu. */
(() => {
  'use strict';
  const hlasky = [
    {id:'th-neznele', jazyk:'en', nazev:'Neznělé th /θ/', priklad:'think · three',
      alt:'Špička jazyka lehce mezi řezáky, rty uvolněné.',
      poloha:'Špičku jazyka dej lehce mezi řezáky. Nech úzkou mezeru pro vzduch; jazyk nekousej.',
      pokus:'Polož si prsty jemně na krk a vydechni přes mezeru u jazyka. Hlasivky při /θ/ nekmitají.',
      otazka:'Čím se tato hláska liší od znělého th?',
      odpoved:'Poloha úst je podobná, ale při /θ/ hlasivky nekmitají. Samotný obrázek rozdíl znělosti neukáže.'},
    {id:'th-znele', jazyk:'en', nazev:'Znělé th /ð/', priklad:'this · mother',
      alt:'Špička jazyka lehce mezi řezáky; stejná základní poloha jako u neznělého th.',
      poloha:'Jazyk zůstává lehce mezi řezáky. Úzkou mezerou proudí vzduch a současně kmitají hlasivky.',
      pokus:'Porovnej /θ/ a /ð/ s prsty jemně na krku. U znělé hlásky ucítíš chvění.',
      otazka:'Stačí k rozlišení obou th sledovat jazyk?',
      odpoved:'Nestačí. Důležitý je hlas: u /ð/ hlasivky kmitají. Polohu jazyka nemusíš výrazně měnit.'},
    {id:'w', jazyk:'en', nazev:'Anglické w /w/', priklad:'we · water',
      alt:'Rty jsou zaokrouhlené, zadní část jazyka vysoko a špička dole.',
      poloha:'Zaokrouhli a trochu vyšpul rty. Zadní část jazyka zvedni, ale neuzavírej průchod vzduchu.',
      pokus:'Připrav rty jako na „u“ a plynule přejdi do další samohlásky. Horní zuby se nedotýkají dolního rtu.',
      otazka:'Proč anglické w není stejné jako české v?',
      odpoved:'U českého v se horní zuby přibližují k dolnímu rtu. U /w/ pracují zaokrouhlené rty a zdvižená zadní část jazyka.'},
    {id:'ae', jazyk:'en', nazev:'Otevřené /æ/', priklad:'cat · black',
      alt:'Otevřená ústa, nezaokrouhlené rty a jazyk vpředu nízko.',
      poloha:'Otevři ústa více než pro české „e“. Jazyk drž vpředu a nízko, rty nezaokrouhluj.',
      pokus:'Před zrcadlem porovnej otevření úst pro „e“ a pro /æ/. Přesný zvuk si ověř podle učitele nebo nahrávky.',
      otazka:'Které dvě věci na obrázku pomáhají poznat /æ/?',
      odpoved:'Otevřená čelist a nízko položený jazyk vpředu. Rty nejsou našpulené.'},
    {id:'schwa', jazyk:'en', nazev:'Uvolněné /ə/', priklad:'about – první samohláska',
      alt:'Uvolněné rty a jazyk přibližně ve středu úst.',
      poloha:'Čelist i rty nech uvolněné. Jazyk je přibližně ve střední poloze; zvuk bývá krátký a nepřízvučný.',
      pokus:'Uvolni ústa. Nesnaž se vytvořit výrazné české „a“, „e“ ani „o“. Ve slově about je důraz na druhé slabice.',
      otazka:'Proč /ə/ není název jednoho anglického písmene?',
      odpoved:'Značka popisuje hlásku. V různých slovech ji mohou zapisovat různá písmena; v about je to první a.'},
    {id:'ue', jazyk:'de', nazev:'Dlouhé ü /yː/', priklad:'Tür · grün',
      alt:'Jazyk vysoko vpředu, rty zaokrouhlené.',
      poloha:'Připrav jazyk jako pro „í“, vysoko vpředu. Rty přitom zaokrouhli jako pro „ú“.',
      pokus:'Řekni dlouhé „í“ a při zachování polohy jazyka pomalu zaokrouhli rty.',
      otazka:'Co změníš při přechodu z „í“ k dlouhému ü?',
      odpoved:'Především tvar rtů: zaokrouhlíš je. Jazyk zůstává vysoko vpředu. Krátké ü má poněkud jinou polohu.'},
    {id:'oe', jazyk:'de', nazev:'Dlouhé ö /øː/', priklad:'schön · hören',
      alt:'Jazyk vpředu níže než u ü, rty zaokrouhlené.',
      poloha:'Jazyk drž vpředu, ale níže než u ü. Rty zaokrouhli; vyjdi z polohy pro zavřené „é“.',
      pokus:'Porovnej obrázky ü a ö: rty zůstávají zaokrouhlené, u ö má jazyk nižší polohu.',
      otazka:'Je dlouhé ö stejné jako české ó?',
      odpoved:'Ne. U ö je jazyk více vpředu. Karta ukazuje dlouhé /øː/; krátké ö, například v können, je otevřenější.'},
    {id:'nosovka', jazyk:'fr', nazev:'Nosové /ɑ̃/', priklad:'sans · enfant',
      alt:'Snížené měkké patro propojuje hltan s nosní dutinou; ústa zůstávají otevřená.',
      poloha:'Ústa jsou otevřená a jazyk nízko. Měkké patro je snížené, takže vzduch může proudit ústy i nosem.',
      pokus:'Sleduj zadní konec patra nad jazykem. Porovnej jeho polohu s ústní hláskou: otevřená cesta do nosu vytváří nosovost.',
      otazka:'Znamená nosovka, že za samohlásku přidáš české n?',
      odpoved:'Ne. Nosovost patří k samotné samohlásce. /ɑ̃/ je jen jeden příklad; jiné francouzské nosovky mají jinou polohu jazyka a rtů.'}
  ];
  document.querySelectorAll('[data-vyslovnost-atlas]').forEach((host, index) => {
    const languages = host.dataset.vyslovnostAtlas.split(',');
    const items = hlasky.filter(h => languages.includes(h.jazyk));
    if (!items.length) return;
    const uvod = document.createElement('p'); uvod.className = 'atlas-uvod';
    uvod.textContent = 'Vyber hlásku, prohlédni si polohu úst a vyzkoušej krátký úkol. Značky mezi lomítky označují zvuky, nikoli názvy písmen. Obrázek pomáhá s polohou mluvidel; přesný zvuk ověř s učitelem nebo kvalitní nahrávkou.';
    const volby = document.createElement('div'); volby.className = 'atlas-volby';
    volby.setAttribute('role', 'group'); volby.setAttribute('aria-label', 'Vyber hlásku');
    const detail = document.createElement('div'); detail.className = 'atlas-detail'; detail.id = 'atlas-detail-' + index;
    const figure = document.createElement('figure');
    const img = document.createElement('img'); img.width = 768; img.height = 768; img.loading = 'lazy'; img.decoding = 'async';
    const caption = document.createElement('figcaption'); caption.textContent = 'Zjednodušený boční řez; obličej směřuje doleva.';
    figure.append(img, caption);
    const vyklad = document.createElement('div'); vyklad.className = 'atlas-vyklad';
    detail.append(figure, vyklad);
    const poznamka = document.createElement('p'); poznamka.className = 'atlas-poznamka';
    const link = document.createElement('a'); link.href = 'vyslovnost.html'; link.textContent = 'Všechny obrázky výslovnosti →';
    if (items.length < hlasky.length) poznamka.append(link);
    function zobraz(h) {
      img.src = 'img/aj/vyslovnost-' + h.id + '.webp'; img.alt = h.alt;
      volby.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hlaska === h.id)));
      vyklad.replaceChildren();
      const title = document.createElement('h3'); title.textContent = h.nazev;
      const example = document.createElement('p'); example.textContent = h.priklad;
      const poloha = document.createElement('p'); poloha.textContent = h.poloha;
      const pokus = document.createElement('p'); const label = document.createElement('strong'); label.textContent = 'Vyzkoušej: ';
      pokus.append(label, h.pokus);
      const question = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = h.otazka;
      const answer = document.createElement('p'); answer.textContent = h.odpoved; question.append(summary, answer);
      vyklad.append(title, example, poloha, pokus, question);
    }
    items.forEach(h => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = h.nazev;
      b.dataset.hlaska = h.id; b.setAttribute('aria-controls', detail.id);
      b.addEventListener('click', () => zobraz(h)); volby.append(b);
    });
    host.append(uvod, volby, detail, poznamka); zobraz(items[0]);
  });
})();
