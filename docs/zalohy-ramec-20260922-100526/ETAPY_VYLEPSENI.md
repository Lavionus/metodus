# Metodus — malé etapy zlepšování

Průběžný pracovní přehled. Zahájeno 16. 9. 2026 podle [auditu všech 260 stránek](AUDIT_VYUKY_2026-09-16.md).

Každá etapa má konkrétní výstup a ověření. Nejprve dokončit a zkontrolovat rozpracovanou etapu, potom otevřít další. Jeden níže uvedený soubor je jedna malá pracovní jednotka; předmětové balíčky sdružují nejvýše čtyři stránky a nemusí se realizovat najednou. Rozsáhlou simulaci dále rozdělit na výklad, interakci a procvičení.

## 01 — Doložené obsahové chyby: hotovo

- [x] **01a · pH:** jedna hranice pro data, legendu a vyhodnocování; opravená klasifikace mléka a krve; konkrétní pH v úlohách na indikátory; vysvětlené barevné přechody a opravená čeština. Odstraněny duplicitní možnosti solí. Barvy přehledu jsou označené jako didaktické, hodnoty látek jako orientační.
- [x] **01b · Nepřímá řeč:** opraveno said to somebody / told somebody; zadání vymezuje posun časů a mluvčího/adresáta; doplněna výjimka pro stále platné sdělení a význam povinnosti u must. Odstraněny duplicitní možnosti časů.
- [x] **01c · Válec:** výklad a obě otázky používají rozměry 2πr a v místo vždy delší/kratší strany. Přidán protipříklad vysokého úzkého válce.
- [x] **01d · Státní symboly:** sedm symbolů, dva znaky počítané samostatně; výslovně odlišen úplný výčet od šestice v současné obrázkové poznávačce.
- [x] **01e · Ověření a cache:** cílená kontrola 99 otázek v Chromiu, všechny 4 režimy na každé stránce, chyba → oprava → ruční pokračování; kontroly rozměrů 320/390/1366 px v obou motivech, bez neošetřené JS výjimky. Syntaxe a diff v pořádku. Cache zvýšena z v73 na v74, aby po nasazení nepřetrvávala stará verze opravovaných lekcí.

Zálohy: [adresář původních souborů](docs/zalohy-etapa-01-20260916-115426/). Regresní kontrola: [tests/etapa01-browser.mjs](tests/etapa01-browser.mjs). Ověření proběhlo v izolovaném profilu; nedotklo se běžného žákovského skóre. Kontrola šířek není plným auditem přístupnosti ani testem všech kombinací zadání. Nasazení na veřejný web nebylo provedeno.

Vizuální kontrola při 390 px po dokončení animací: [pH a zpětná vazba](docs/etapa-01/ch9_ph-390-light.png), [nepřímá řeč](docs/etapa-01/aj9_neprima_rec-390-light.png).

Tato etapa opravuje doložené chyby; neoznačuje všechny další náměty pro tyto čtyři stránky za hotové. Například věrnější obrázky státních symbolů a rozsáhlejší názorná výuka pH zůstávají v předmětovém seznamu.

## 02 — Pravdivé popisy a dostupnost funkcí: hotovo

- [x] **02a · eduMaps:** stránka nabízí jen to, co skutečně existuje — pět mapových lekcí a přehled externích sbírek; tři činnosti do hodiny jsou přímo na stránce místo surového Markdownu. Sliby exportu do PNG, osmi typů map a testu vrstev jsou odstraněné. `mapovy_pruvodce.md` zůstává jen jako rozcestník na průvodce. V katalogu je název „🗺️ Mapy – lekce a průvodce".
- [x] **02b · Představení a přehled:** místo „nic se neinstaluje, funguje offline, data neopouštějí počítač" je rozlišené místní ukládání výsledků a síťové požadavky; přehled má rozbalovací návod, jak si hodinu bez sítě připravit. Komentář v `sw.js` a popis v `README.md` i `index.html` mluví stejně. Externí zdroje se necachují.
- [x] **02c · ISS:** panel ukazuje čas posledních dat a při výpadku i jejich stáří, zamrzlé hodnoty jsou zešedlé a označené textem, hlášení říká, že stanice už je jinde, a nabízí „Zkusit znovu". Podtitul uvádí, že stránka vyžaduje internet. Bez sítě od začátku se stránka nezasekne na načítání a hlásí, že data zatím nedorazila. Opraveno také zapamatování polohy pro dotaz na zemi pod stanicí — dřív se četla zpětně z glóbu.
- [x] **02d · Ověření:** [tests/etapa02-iss.mjs](tests/etapa02-iss.mjs) projde úspěšné načtení, výpadek, návrat spojení i start bez sítě (datová služba je nahrazena stubem, takže test nevolá `wheretheiss.at`); [tests/etapa02-stranky.mjs](tests/etapa02-stranky.mjs) ověří u pěti dotčených stránek všech 289 místních odkazů a kotev (255 v rozcestníku, 34 na zbylých čtyřech stránkách), obě témata a šířky 1366/390/320 px bez přetečení a bez neošetřené JS výjimky.

Zálohy: [adresář původních souborů](docs/zalohy-etapa-02-20260916-121121/). Vizuální kontrola při 390 px: [živá data](docs/etapa-02/iss-390-zive.png), [přerušené spojení](docs/etapa-02/iss-390-bez-spojeni.png). Cache je na `metodus-v75`. Nasazení na veřejný web nebylo provedeno.

Test běží proti stubu datové služby; nenahrazuje kontrolu chování skutečného API, rate-limitu ani dlouhého výpadku během hodiny. Kontrola odkazů ověřuje dostupnost souboru a existenci kotvy, ne obsah externích sbírek. Panel ISS se na úzké obrazovce překrývá s tlačítky v hlavičce — to je starší rozvržení stránky a patří k etapám vzhledu, ne k této opravě.

## 03 — Mobilní navigace: hotovo

- [x] **03a · index:** pod 700 px zůstanou v hlavičce jen ☰ menu, celý název „Metodus", 🏠 úvod a nabídka **⋯ Další**; osnova, kabinet, ukázky, motiv, projektor a nové okno se do ní přesunou. Hlavička je na jeden řádek (59 px místo dvou řad ikon) a název se už nezkracuje na „M…". Tlačítka se přesouvají, ne kopírují, takže si nesou posluchače i stav; na široké obrazovce jsou zase v hlavičce. V nabídce má každá akce slovní popis, v hlavičce zůstává jen ikona.
- [x] **03b · index:** nabídku otevírá Enter i mezerník, šipky přecházejí mezi položkami, Home/End skáčou na kraje, Esc ji zavře a vrátí fokus na tlačítko; klik nebo odchod tabulátorem mimo ji zavře také. Otevření ☰ posune fokus do hledání, Esc ho vrátí na ☰. Přibylo **✕ Zrušit filtry** — objeví se jen tehdy, když nějaký filtr ubírá položky, a vypíše, co zruší (předmět, ročník, hledání, skryté připravované). Ovládací prvky hlavičky mají viditelný fokus a na mobilu výšku 38 px.
- [x] **03c · ověření:** [tests/etapa03-navigace.mjs](tests/etapa03-navigace.mjs) projde hlavičku při 390 px, ovládání nabídky z klávesnice, přepnutí motivu z nabídky, otevření a zavření ☰ včetně fokusu, filtr → zrušení (24 → 255 viditelných položek), volbu ročníku, oblíbené, přímý odkaz `#obsah/…`, návrat na úvod a režim projektor. Šířky 1366/1024/768/700/390/320 px v obou motivech: bez přetečení, hlavička vždy na jednom řádku, nabídka „Další" jen pod 700 px.
- [x] **03d · projektor:** odchod z celé obrazovky nyní ukončí i režim projektor. V celé obrazovce Esc spolkne prohlížeč, takže dřív jedno Esc zrušilo zvětšení, ale režim nechalo zapnutý.

Záloha: [docs/zalohy-etapa-03-20260916-131513/](docs/zalohy-etapa-03-20260916-131513/). Snímky při 390 px: [hlavička](docs/etapa-03/index-390-hlavicka.png), [nabídka Další](docs/etapa-03/index-390-nabidka-dalsi.png), [zrušení filtrů](docs/etapa-03/index-390-zrusit-filtry.png). Cache zvýšena na `metodus-v76`, protože se změnil `index.html` z předcachovaného jádra. Nasazení na veřejný web nebylo provedeno.

Testy etap 02 a 03 nově obcházejí servisního workera i HTTP cache — bez toho kontrolovaly starou verzi stránky z `metodus-v75`. Kontrola je automatická: nenahrazuje zkoušku na skutečném telefonu, s odečítačem obrazovky ani při ovládání prstem.

## 04 — Vzhled starších stránek: hotovo

- [x] **04a · eduMaps:** tmavý gradient karet zmizel už s přepsáním stránky v etapě 02 — ověřeno, že ve světlém motivu nezůstal na stránce jediný gradient a žádná tmavá karta. Doplněna oprava kontrastu: odkazy na tlačítkovém podkladu (`nav a`, `.odkaz`) měly ve světlém motivu jen 4,1 : 1, teď berou sytější `--accent-hover`.
- [x] **04b · eduSort:** stránka nově linkuje `theme.js`, takže jde se zbytkem webu. Natvrdo zapsaná tmavá pozadí panelu, plátna a statistiky nahradily proměnné z `common.css`; popisek „🎨 Téma" už ukazuje skutečný motiv a přepne se i za běhu (rozcestník posílá `postMessage`). Sloupce a popisky v plátně čtou barvy z motivu — ve světlém režimu jsou tmavší, aby držely kontrast, význam legendy zůstává.
- [x] **04c · Záměrně tmavé stránky:** přednáška o AI, glóbusy planet i ISS mají vlastní tmavou paletu a `theme.js` nelinkují schválně — tmavé plátno je tam vesmír, respektive nesvítící pozadí promítané přednášky. Každá to teď říká komentářem v hlavičce, aby se nález neobjevoval znovu. Ověřen kontrast jejich ovládání: nejhorší prvek 6,5 : 1 (glóbusy), 6,9 : 1 (přednáška), 5,8 : 1 (ISS).
- [x] **04d · Podpisový pruh:** společný `podpis.js` měl ve světlém motivu odkaz „← Metodus" na 4,4 : 1 a text pruhu na 3,4 : 1. Odkaz bere `--accent-hover`, text `--text-muted`. Týká se všech 260 stránek.
- [x] **04e · Ověření:** [tests/etapa04-vzhled.mjs](tests/etapa04-vzhled.mjs) počítá jas pozadí a kontrastní poměry podle WCAG: eduMaps a eduSort odpovídají zvolenému motivu (panel, plátno, statistika, popisek), přepnutí motivu za běhu funguje, záměrně tmavé stránky zůstávají tmavé i při světlém nastavení webu a jejich ovládání má kontrast nad 4,5 : 1. Šířky 1366/390/320 px v obou motivech bez přetečení. Testy etap 01–03 prošly znovu (kvůli změně `podpis.js`).

Zálohy: [docs/zalohy-etapa-04-20260916-140000/](docs/zalohy-etapa-04-20260916-140000/). Snímky: [eduSort před](docs/etapa-04/edusort-1366-light-pred.png), [eduSort po (světlý)](docs/etapa-04/edusort-1366-light-po.png), [eduSort po (tmavý)](docs/etapa-04/edusort-1366-dark-po.png), [eduMaps ve světlém motivu](docs/etapa-04/edumaps-1366-light.png). Cache zůstává na `metodus-v76` z etapy 03 — od té doby se nic nenasazovalo. Nasazení na veřejný web nebylo provedeno.

Kontrast se měří jen u textu viditelného po načtení; barvy uvnitř plátna (sloupce) posuzuje test podle proměnných, ne podle výsledného obrázku. Zbylé stránky katalogu tímto měřením neprošly — etapa řešila čtyři doložené nálezy z auditu.

## 05 — Společná reakce na odpověď: hotovo

- [x] **05a · Rušení naplánovaného posunu:** `uloha.js` si naplánovaný posun drží a ruší ho. Novou otázku staví všech 174 stránek přes `Uloha.vyber`, takže přeskočení, změna režimu i pokračování zruší časovač té předchozí. Dřív časovač doběhl a přehodil žákovi otázku, kterou právě dostal. Přibylo `Uloha.zrusPosun()` a `Uloha.cekaPosun()`.
- [x] **05b · Tempo uživatele:** přepnutí tempa nebo režimu během čekání se hned promítne — z automatiky na ruční se místo doběhnutí časovače nabídne „Pokračovat →". Tlačítko po použití mizí, takže nezůstane u další otázky.
- [x] **05c · Přístupná zpětná vazba:** prvek `.odezva` dostává `role="status"` a `aria-live="polite"`, i když si ho stránka staví ke každé otázce znovu (hlídá `MutationObserver`). Bez toho se nevidomý žák o výsledku odpovědi nedozvěděl.
- [x] **05d · Odpověď klávesnicí:** 88 stránek má na Enter navázané „další otázka", takže Enter na vybrané možnosti odpověď přeskočil místo toho, aby ji poslal. `uloha.js` teď Enter/mezerník nad možností, pořadím nebo tlačítkem „Pokračovat" zastaví dřív, než se dostane ke globálnímu posluchači stránky; aktivace tlačítka proběhne normálně.
- [x] **05e · Viditelný fokus a omezení pohybu:** možnosti, režimy, ovládání i doplňovací pole mají prstenec `:focus-visible` (doplňovačky si `outline: none` dřív fokus úplně vypínaly). Při zapnutém omezení pohybu se vypne zaklepání u chyby i přechody; chybu pozná žák dál podle barvy a textu.
- [x] **05f · Význam přeskočení:** tlačítko „Přeskočit →" má na všech stránkách stejný popis „Přejde na jinou otázku. Tahle se nezapočítá do skóre." Popis se kontroluje u každé nové otázky, protože stránky text tlačítka mění podle režimu.
- [x] **05g · Ověření:** [tests/etapa05-odpoved.mjs](tests/etapa05-odpoved.mjs) na třech pilotních stránkách prochází: správná odpověď → právě jedna nová otázka, přeskočení a změna režimu během čekání → také jedna, ruční režim → žádný samovolný posun a fokus na tlačítku, přepnutí tempa za běhu, chybná i správná odpověď z klávesnice, prstenec fokusu (3 px), vypnutý pohyb při `prefers-reduced-motion`. Vzorek dalších 12 stránek napříč předměty prošel stejnou kontrolou. Testy etap 01–04 prošly znovu.

Zálohy: [docs/zalohy-etapa-05-20260916-150000/](docs/zalohy-etapa-05-20260916-150000/). Snímek ruční zpětné vazby: [odpověď v ručním režimu](docs/etapa-05/odpoved-rucni-rezim.png). Cache zůstává na `metodus-v76` — od etapy 03 se nic nenasazovalo. Nasazení na veřejný web nebylo provedeno.

Kontrola je automatická a pokrývá 15 stránek ze 174; nenahrazuje zkoušku s odečítačem obrazovky ani ovládání prstem. Stránky, které si posun plánují mimo `Uloha.vyber` (například doplňovačky s textovým vstupem), zrušení při nové otázce nedostanou automaticky — mají volat `Uloha.zrusPosun()` samy.

## 06 — Zlomky jako první vzorová lekce: hotovo

- [x] **06a · Cíl a vedený příklad:** nad ovladači stojí cíl („Po této lekci dokážu…"), ročník, odhad času, odkaz na předchozí dovednost a rozbalovací scénář pro učitele (5 / 15 / 45 minut). Přibyl režim **📘 Ukázka krok za krokem**: čtyři kroky, které z obrázku nejdřív přečtou jmenovatele, pak čitatele (oba se v zápisu rozsvítí), potom zlomek přečtou a shrnou. Tempo drží žák tlačítkem, poslední krok vede rovnou do procvičování.
- [x] **06b · Vybarvování bez myši:** díly koláče jsou tlačítka (`role="button"`, `tabindex`, `aria-pressed`, přístupný název „3. díl z 6 – prázdný"). Šipky přecházejí mezi díly, mezerník nebo Enter díl vybarví, zaostřený díl je zvýrazněný silnějším obrysem. Stav „Vybarveno 2 z 3 dílů" hlásí živá oblast. Úlohu tak jde dokončit jen klávesnicí — dřív se bez myši dokončit nedala.
- [x] **06c · Tři obrázky, jeden celek:** ke koláči přibyl proužek a číselná osa se **stejně velkým celkem** (stejný viewBox i šířka na stránce). V procvičování se střídají po řadě, takže žák uvidí všechny tři, a po správné odpovědi se tentýž zlomek ukáže ve všech třech najednou.
- [x] **06d · Práce s konkrétní chybou a návaznosti:** špatná možnost dostane vlastní vysvětlení — „2/8 je nevybarvená část", „máš prohozený zápis", „jmenovatel máš správně, vybarvených dílů ale není 7". Nabídka proto obsahuje typické záměny (nevybarvené díly, prohozený zápis, o jedna vedle). Stejně adresné jsou chyby v porovnávání a v části z počtu. Dole je blok **Kam dál** (dělení se zbytkem → počítání se zlomky → procenta), odkazy otevírá rozcestník ve své ploše.
- [x] **06e · Čeština generovaných vět:** zlomek se čte se správným tvarem („jedna čtvrtina", „dvě třetiny", „pět šestin" — dřív „5 šestiny") a počítané podstatné jméno se skloňuje podle počtu („1 díl / 2 díly / 5 dílů", „rozdělíme na 5 stejných částí").
- [x] **06f · Sdílené součásti:** `uloha.js` umí `zpravaChyba` jako funkci, která dostane klíč zvolené možnosti — díky tomu může kterákoli stránka pojmenovat konkrétní záměnu. Do `vyuka.css` přibyly společné styly `.cil` a `.navaznosti`, aby další vzorové lekce (etapa 07) vypadaly stejně.
- [x] **06g · Ověření:** [tests/etapa06-zlomky.mjs](tests/etapa06-zlomky.mjs) kontroluje cíl nad ovladači, scénář pro učitele, existenci cílů všech odkazů, čtyři kroky vedeného příkladu, české čtení všech zlomků od poloviny po osminy, počítané tvary, stejnou velikost celku ve třech obrázcích, střídání obrázků, jedinečné vysvětlení ke každé špatné možnosti, propojení tří obrázků po správné odpovědi, dokončení vybarvování klávesnicí a všech pět režimů. Šířky 1366/390/320 px v obou motivech bez přetečení. Testy etap 01–05 prošly znovu.

Zálohy: [docs/zalohy-etapa-06-20260916-160000/](docs/zalohy-etapa-06-20260916-160000/). Snímky: [vedený příklad](docs/etapa-06/zlomky-vedeny-priklad.png), [tři obrázky po odpovědi](docs/etapa-06/zlomky-tri-obrazky.png), [vybarvování s fokusem](docs/etapa-06/zlomky-vybarvi-klavesnici.png), [mobil](docs/etapa-06/zlomky-390.png). Cache zůstává na `metodus-v76`. Nasazení na veřejný web nebylo provedeno.

Lekce je vzor, ne hotová norma pro zbytek katalogu: ostatní stránky zatím cíl, návaznosti ani vedený příklad nemají. Ověření je automatické — nenahrazuje zkoušku s odečítačem obrazovky ani zkušenost žáka 4. třídy.

## 07 — Další čtyři vzory pro odlišné předměty: hotovo

- [x] **07a · ch9_ph:** dva nastavitelné modelové roztoky, vlastní předpověď nižšího pH a ověření včetně poměru koncentrací H₃O⁺. Výklad rozlišuje rozdíl pH od poměru koncentrací a vymezuje model zředěných roztoků při 25 °C. Všech pět neutralizačních rovnic má správné koeficienty v zadání i zpětné vazbě; rozbor H₂SO₄ + 2 NaOH vysvětluje počty atomů a odlišuje koeficient od indexu.
- [x] **07b · aj9_neprima_rec:** dialog Anny a Bena má konkrétní místo, den a adresáta. Šest kroků postupně zvýrazní změny zájmen, slovesa, místa a času; přepnutí vypravěče ukáže rozdíl mezi she/me a I/him. Samostatná otázka ověřuje, že „the next day“ stále označuje úterý původního rozhovoru.
- [x] **07c · d6_prameny:** doslovný krátký úryvek zákona č. 11/1918 Sb. s odkazy na úplný přepis a Parlamentní knihovnu. Žák určuje původce, dobu, účel, závěr i konkrétní doklad; zpětná vazba rozlišuje vyhlášení zákona od publikace ve Sbírce a právní akt od postojů obyvatel. Opravena také doložená chyba v počítání přes přelom letopočtu: mezi začátky roků se odečítá jeden rok, protože historický letopočet nemá rok nula.
- [x] **07d · inf6_tabulky:** editovatelné buňky B2/B3, vzorec B4 a okamžitý přepočet. Podporované jsou čtyři početní operace a SUMA/PRŮMĚR/MIN/MAX nad B2:B3. Předpověď změny součtu má ověřitelný příklad 12 + 8 → 17 + 8. Prázdný/neplatný vstup, nepodporovaný vzorec i dělení nulou dostávají konkrétní hlášení; reset vrací původní hodnoty. Vzorce se vyhodnocují omezenou sadou operací, nikoli spouštěním uživatelského kódu.
- [x] **07e · Společný rámec:** všechny čtyři lekce mají cíl, odhad času, scénář pro učitele a funkční návaznosti v samostatném okně i rozcestníku. Vedené aktivity jsou nebodované a mají vlastní reset. Jejich vzhled a chování jsou v `pilot07.css` a `pilot07.js`; společné knihovny procvičování se neměnily. Klávesové zkratky dějepisu a tabulek již neberou Enter a šipky vstupům a ovladačům.
- [x] **07f · Ověření:** [tests/etapa07-piloty.mjs](tests/etapa07-piloty.mjs) prošel v Chromiu přes CDP: správné/chybné/nevyplněné odpovědi, obě role dialogu, reset všech aktivit, hraniční pH, všechny podporované vzorce a chybové vstupy, Enter na ovladačích, návaznosti a původní režimy. Všechny čtyři režimy každé stránky při šířkách 1366/390/320 px v obou motivech a s rozbalenými vysvětleními bez horizontálního přetečení; bez neošetřené JS výjimky. Znovu prošel test etapy 01 (99 odpovědí), syntaxe JavaScriptu a `git diff --check`.

Zálohy: [docs/zalohy-etapa-07-20260922-082447/](docs/zalohy-etapa-07-20260922-082447/) a časované kopie vedle původních HTML. Snímky při 320 px: [pH](docs/etapa-07/ch9_ph-320-dark.png), [dialog](docs/etapa-07/aj9_neprima_rec-320-dark.png), [pramen](docs/etapa-07/d6_prameny-320-dark.png), [tabulka](docs/etapa-07/inf6_tabulky-320-dark.png). Cache zvýšena na `metodus-v77`, aby se po nasazení obnovily upravené lekce. Nasazení na veřejný web nebylo provedeno.

Ověření používá izolovaný profil Chromia a nenahrazuje zkoušku na skutečném telefonu ani s odečítačem. Minitabulka je výukový model s výslovně vymezenými vzorci, nikoli úplný tabulkový procesor; kopírování relativních odkazů zůstává námětem pro další rozvoj. Externí zdroje historického pramene vyžadují síť, přepis a aktivita jsou přímo v lekci.

## 08 — Propojení výuky: hotovo

- [x] **08a · apps.js:** pět pilotů (zlomky, pH, nepřímá řeč, prameny, tabulky) má jednotná metadata `vyuka`: konkrétní cíl, typy aktivit, předchozí a následující lekce, pilotní rozsah a přímé vstupy do výkladu/procvičování. Metadata jsou v `apps.js` a doplní se ke katalogovým položkám. Neposouzená lekce se neoznačuje jako chybějící; pilotní rozsah není potvrzením úplného pokrytí výstupu.
- [x] **08b · přehled a osnova:** přehled, osnova a kabinet mají výběr podle účelu: vedený příklad, model, práce s pramenem, procvičování, příprava celé hodiny. Karty přebírají cíl a návaznosti z katalogu. Osnova zobrazuje dostupnost aplikací, nikoli procento pokrytí RVP; uvádí výslovně, že mapování očekávaných výstupů není posouzené. Prázdná buňka znamená chybějící položku katalogu, nikoli tvrzení, že se předmět neučí. Vstup do procvičování zlomků skutečně zapíná procvičovací režim.
- [x] **08c · deník:** nový místní záznam `metodus_prubeh_v2` u výběrových úloh pěti pilotů rozlišuje zahájené otázky, jednotlivé odpovědi včetně oprav, dokončení, správnou odpověď napoprvé a žákem označenou podporu. Opakovaný klik po dokončení se nezapočítá; opuštěná otázka zůstává mezi zahájenými. Staré záznamy `metodus_aktivita` i ruční zápisy zůstávají zachované; neznámé údaje se zpětně nevymýšlejí. Deník ukazuje konkrétní počty místo výrazného procenta a vysvětluje omezení, překryv statistik i to, že napoprvé neznamená bez pomoci. Informatika už není řazena mezi kartičky; ruční předměty lze ovládat klávesnicí. Vymazání deníku odstraní i nové podrobnosti.
- [x] **08d · učitelské nástroje:** [příprava hodiny pH](obsah/priprava_hodiny.html) propojuje 45minutový scénář, skutečnou aktivitu v režimu pro tabuli, tříúlohový pracovní list v existujícím generátoru a závěrečnou otázku s očekávanou odpovědí a doporučením dalšího kroku. Návratové odkazy zachovávají souvislý průchod. Tisk obsahuje jen žákovský list; řešení pro učitele se netiskne. Běžný generátor zůstává dostupný samostatným odkazem.
- [x] **08e · ověření:** [tests/etapa08-propojeni.mjs](tests/etapa08-propojeni.mjs) prošel v Chromiu přes CDP: pět metadatových záznamů a jejich odkazy, filtry účelu, přímé procvičování, chyba → opravy → dokončení, podpora, přeskočení, obnova po načtení, zachování starých dat, reset deníku, učitelský průchod a tisk. Sedm stránek/režimů při 1366/390/320 px v obou motivech bez horizontálního přetečení a neošetřených JS výjimek. Prošel i průchod přehled → příprava → pracovní list uvnitř iframe rozcestníku. Regrese etap 03, 06 a 07, kontrola syntaxe a `git diff --check` prošly.

Zálohy: [docs/zalohy-etapa-08-20260922-084235/](docs/zalohy-etapa-08-20260922-084235/) a časované kopie upravovaných HTML. Doklady: [výsledek testu](docs/etapa-08/overeni.json), [deník při 320 px](docs/etapa-08/denik-320.png), [pracovní list při 320 px](docs/etapa-08/list-320.png), [vytištěný žákovský list PDF](docs/etapa-08/pracovni-list-ph.pdf). Cache zvýšena na `metodus-v78`. Nasazení na veřejný web nebylo provedeno.

Podrobný deník záměrně měří jen výběrové otázky uvedených pěti pilotů; vedené aktivity, vybarvování a jiné typy úloh nejsou tímto měřením pokryté. Podpora je vlastní označení žáka, nikoli automatické rozpoznání pomoci. Data jsou místní, uchovávají se nejvýše 120 zaznamenaných dní a nesynchronizují se mezi zařízeními. Automatická kontrola nenahrazuje zkoušku s odečítačem ani na skutečném telefonu. Učitelský průchod je hotový pro pH, nikoli pro všechny lekce katalogu.

## 09 a dále — Jednotlivé stránky po malých balíčcích

Níže je úplný seznam 260 stránek z auditu. Každá má vlastní doporučení v odkazovaném auditu. Při uzavření položky stručně zapsat skutečně provedenou změnu a ověření; hotová dílčí oprava z etapy 01 sama o sobě neuzavírá širší rozvoj stránky. Úkol splněný v pilotu už podruhé neprovádět, jen zde označit a odkázat na výsledek.

### 09 · Rozcestníky a nástroje · část 1

- [ ] [index](index.html) — Metodus – Interaktivní učení (P1 v původním auditu).
- [ ] [citation_generator](obsah/citation_generator.html) — 📚 Generátor citací (P2 v původním auditu).
- [ ] [edu_progress](obsah/edu_progress.html) — 🏅 Studijní deník (P1 v původním auditu).
- [ ] [flashcards](obsah/flashcards.html) — 🎴 Kartičky (flashcards) (P2 v původním auditu).

### 10 · Rozcestníky a nástroje · část 2

- [ ] [knihovna_sad](obsah/knihovna_sad.html) — Knihovna sad kartiček (P2 v původním auditu).
- [ ] [osnova](obsah/osnova.html) — Osnova – pokrytí učiva – Metodus (P1 v původním auditu).
- [ ] [pracovni_listy](obsah/pracovni_listy.html) — 🖨️ Generátor pracovních listů (P1 v původním auditu).
- [ ] [predstaveni](obsah/predstaveni.html) — Metodus – živé ukázky (P1 v původním auditu).

### 11 · Rozcestníky a nástroje · část 3

- [ ] [prehled](obsah/prehled.html) — Metodus – přehled učiva (P1 v původním auditu).
- [ ] [prezentace](obsah/prezentace.html) — 🖥️ Tvorba slidů a prezentace (P2 v původním auditu).
- [ ] [typing_trainer](obsah/typing_trainer.html) — ⌨️ Trenažér psaní (P2 v původním auditu).
- [ ] [ucitel](obsah/ucitel.html) — 🧑‍🏫 Kabinet učitele (P2 v původním auditu).

### 12 · Český jazyk a čtení · část 1

- [ ] [cj1_pismena](obsah/cj1_pismena.html) — Písmena a hlásky (P1 v původním auditu).
- [ ] [cj2_abeceda](obsah/cj2_abeceda.html) — Abeceda a řazení slov (P1 v původním auditu).
- [ ] [cj2_druhy_vet](obsah/cj2_druhy_vet.html) — Druhy vět (P2 v původním auditu).
- [ ] [cj2_tvrde_mekke](obsah/cj2_tvrde_mekke.html) — Tvrdé a měkké souhlásky (P2 v původním auditu).

### 13 · Český jazyk a čtení · část 2

- [ ] [cj3_parove](obsah/cj3_parove.html) — Párové souhlásky (P2 v původním auditu).
- [ ] [cj3_podstatna](obsah/cj3_podstatna.html) — Podstatná jména – rod a číslo (P2 v původním auditu).
- [ ] [cj3_slovesa](obsah/cj3_slovesa.html) — Slovesa – osoba, číslo, čas (P2 v původním auditu).
- [ ] [cj4_pady](obsah/cj4_pady.html) — Pády a vzory podstatných jmen (P1 v původním auditu).

### 14 · Český jazyk a čtení · část 3

- [ ] [cj4_prima_rec](obsah/cj4_prima_rec.html) — Přímá řeč (P2 v původním auditu).
- [ ] [cj4_stavba_slova](obsah/cj4_stavba_slova.html) — Stavba slova (P2 v původním auditu).
- [ ] [cj5_pridavna](obsah/cj5_pridavna.html) — Přídavná jména (P2 v původním auditu).
- [ ] [cj5_skladebni_dvojice](obsah/cj5_skladebni_dvojice.html) — Základní skladební dvojice (P2 v původním auditu).

### 15 · Český jazyk a čtení · část 4

- [ ] [cj5_zajmena_cislovky](obsah/cj5_zajmena_cislovky.html) — Zájmena a číslovky (P2 v původním auditu).
- [ ] [cj6_baje](obsah/cj6_baje.html) — Mýty, báje a pohádky (P2 v původním auditu).
- [ ] [cj6_slovni_zasoba](obsah/cj6_slovni_zasoba.html) — Slovní zásoba a význam slov (P2 v původním auditu).
- [ ] [cj7_neohebne](obsah/cj7_neohebne.html) — Neohebné slovní druhy (P1 v původním auditu).

### 16 · Český jazyk a čtení · část 5

- [ ] [cj7_rozvijejici](obsah/cj7_rozvijejici.html) — Rozvíjející větné členy (P2 v původním auditu).
- [ ] [cj7_slovotvorba](obsah/cj7_slovotvorba.html) — Slovotvorba (P1 v původním auditu).
- [ ] [cj8_prejata](obsah/cj8_prejata.html) — Přejatá slova (P2 v původním auditu).
- [ ] [cj8_sloh](obsah/cj8_sloh.html) — Slohové útvary – výklad a úvaha (P1 v původním auditu).

### 17 · Český jazyk a čtení · část 6

- [ ] [cj8_souveti](obsah/cj8_souveti.html) — Souvětí souřadné a podřadné (P2 v původním auditu).
- [ ] [cj9_literatura_20](obsah/cj9_literatura_20.html) — Literatura 20. století (P2 v původním auditu).
- [ ] [cj9_prijimacky](obsah/cj9_prijimacky.html) — Příprava na přijímací zkoušky – ČJ (P1 v původním auditu).
- [ ] [cj9_vyvoj_jazyka](obsah/cj9_vyvoj_jazyka.html) — Útvary a vývoj českého jazyka (P1 v původním auditu).

### 18 · Český jazyk a čtení · část 7

- [ ] [cteni_s_porozumenim](obsah/cteni_s_porozumenim.html) — 📖 Čtení s porozuměním (P1 v původním auditu).
- [ ] [diktat_gen](obsah/diktat_gen.html) — Generátor diktátů (P2 v původním auditu).
- [ ] [doplnovacky](obsah/doplnovacky.html) — Doplňovačky i/y (P2 v původním auditu).
- [ ] [literarni_smery](obsah/literarni_smery.html) — Literární směry a autoři (P1 v původním auditu).

### 19 · Český jazyk a čtení · část 8

- [ ] [reading_log](obsah/reading_log.html) — Čtenářský deník (P2 v původním auditu).
- [ ] [shoda_podmetu](obsah/shoda_podmetu.html) — Shoda podmětu s přísudkem (P2 v původním auditu).
- [ ] [slabiky](obsah/slabiky.html) — Slabiky a první čtení (P2 v původním auditu).
- [ ] [slovni_druhy](obsah/slovni_druhy.html) — Slovní druhy (P2 v původním auditu).

### 20 · Český jazyk a čtení · část 9

- [ ] [synonyma_antonyma](obsah/synonyma_antonyma.html) — Synonyma a antonyma (P2 v původním auditu).
- [ ] [vetny_rozbor](obsah/vetny_rozbor.html) — Rozbor věty – větné členy (P1 v původním auditu).
- [ ] [vyjmenovana_slova](obsah/vyjmenovana_slova.html) — Vyjmenovaná slova (P2 v původním auditu).

### 21 · Matematika · část 1

- [ ] [clock_learning](obsah/clock_learning.html) — 🕐 Učení hodin (P2 v původním auditu).
- [ ] [desetinna_cisla](obsah/desetinna_cisla.html) — 0,5 Desetinná čísla (P2 v původním auditu).
- [ ] [fraction_calc](obsah/fraction_calc.html) — ➗ Kalkulačka zlomků (P1 v původním auditu).
- [ ] [geo_tvary](obsah/geo_tvary.html) — Geometrické tvary a tělesa (P2 v původním auditu).

### 22 · Matematika · část 2

- [ ] [geometricke_konstrukce](obsah/geometricke_konstrukce.html) — 📏 Geometrické konstrukce (P2 v původním auditu).
- [ ] [geometrie_vzorce](obsah/geometrie_vzorce.html) — Obvody, obsahy, objemy (P1 v původním auditu).
- [ ] [grafy_funkci](obsah/grafy_funkci.html) — Grafy funkcí (P2 v původním auditu).
- [ ] [kombinatorika](obsah/kombinatorika.html) — 🎲 Kombinatorika a pravděpodobnost (P1 v původním auditu).

### 23 · Matematika · část 3

- [ ] [m1_porovnavani](obsah/m1_porovnavani.html) — Porovnávání a řady čísel (P2 v původním auditu).
- [ ] [m2_geo_zaklady](obsah/m2_geo_zaklady.html) — Bod, přímka, úsečka (P1 v původním auditu).
- [ ] [m3_deleni_zbytkem](obsah/m3_deleni_zbytkem.html) — Dělení se zbytkem (P2 v původním auditu).
- [ ] [m4_obvod_obsah](obsah/m4_obvod_obsah.html) — Obvod a obsah čtverce a obdélníku (P2 v původním auditu).

### 24 · Matematika · část 4

- [ ] [m4_pisemne_deleni](obsah/m4_pisemne_deleni.html) — Písemné dělení (P1 v původním auditu).
- [ ] [m4_pisemne_operace](obsah/m4_pisemne_operace.html) — Písemné sčítání, odčítání a násobení (P2 v původním auditu).
- [ ] [m4_soumernost](obsah/m4_soumernost.html) — Osová souměrnost (P2 v původním auditu).
- [ ] [m4_zlomky_uvod](obsah/m4_zlomky_uvod.html) — Zlomky – části celku (P1 v původním auditu).

### 25 · Matematika · část 5

- [ ] [m5_prumer](obsah/m5_prumer.html) — Aritmetický průměr (P2 v původním auditu).
- [ ] [m5_site_teles](obsah/m5_site_teles.html) — Sítě těles (P1 v původním auditu).
- [ ] [m5_slovni_ulohy](obsah/m5_slovni_ulohy.html) — Slovní úlohy a úsudek (P1 v původním auditu).
- [ ] [m6_delitelnost](obsah/m6_delitelnost.html) — Dělitelnost, prvočísla, NSD a NSN (P2 v původním auditu).

### 26 · Matematika · část 6

- [ ] [m6_krychle_kvadr](obsah/m6_krychle_kvadr.html) — Krychle a kvádr – povrch a objem (P2 v původním auditu).
- [ ] [m6_trojuhelnik](obsah/m6_trojuhelnik.html) — Trojúhelník – druhy a konstrukce (P2 v původním auditu).
- [ ] [m6_uhly](obsah/m6_uhly.html) — Úhel a jeho velikost (P2 v původním auditu).
- [ ] [m7_cela_cisla](obsah/m7_cela_cisla.html) — Celá čísla (P2 v původním auditu).

### 27 · Matematika · část 7

- [ ] [m7_ctyruhelniky](obsah/m7_ctyruhelniky.html) — Čtyřúhelníky a hranoly (P2 v původním auditu).
- [ ] [m7_pomer](obsah/m7_pomer.html) — Poměr a měřítko (P2 v původním auditu).
- [ ] [m7_shodnost](obsah/m7_shodnost.html) — Shodnost trojúhelníků (P2 v původním auditu).
- [ ] [m7_umernost](obsah/m7_umernost.html) — Přímá a nepřímá úměrnost (P2 v původním auditu).

### 28 · Matematika · část 8

- [ ] [m7_zlomky_operace](obsah/m7_zlomky_operace.html) — Počítání se zlomky (P1 v původním auditu).
- [ ] [m8_kruh](obsah/m8_kruh.html) — Kruh a kružnice (P2 v původním auditu).
- [ ] [m8_pythagoras](obsah/m8_pythagoras.html) — Pythagorova věta (P2 v původním auditu).
- [ ] [m8_statistika](obsah/m8_statistika.html) — Statistika – průměr, medián, modus (P2 v původním auditu).

### 29 · Matematika · část 9

- [ ] [m8_valec](obsah/m8_valec.html) — Válec (P0 v původním auditu).
- [ ] [m8_vyrazy](obsah/m8_vyrazy.html) — Výrazy a jejich úpravy (P2 v původním auditu).
- [ ] [m9_financni](obsah/m9_financni.html) — Finanční matematika (P1 v původním auditu).
- [ ] [m9_jehlan_kuzel](obsah/m9_jehlan_kuzel.html) — Jehlan, kužel a koule (P2 v původním auditu).

### 30 · Matematika · část 10

- [ ] [m9_lomene_vyrazy](obsah/m9_lomene_vyrazy.html) — Lomené výrazy (P2 v původním auditu).
- [ ] [m9_podobnost](obsah/m9_podobnost.html) — Podobnost (P2 v původním auditu).
- [ ] [m9_prijimacky](obsah/m9_prijimacky.html) — Příprava na přijímací zkoušky – M (P1 v původním auditu).
- [ ] [m9_soustavy](obsah/m9_soustavy.html) — Soustavy rovnic (P2 v původním auditu).

### 31 · Matematika · část 11

- [ ] [mental_math](obsah/mental_math.html) — 🧠 Trénink mentální matematiky (P2 v původním auditu).
- [ ] [mocniny_odmocniny](obsah/mocniny_odmocniny.html) — √ Mocniny a odmocniny (P2 v původním auditu).
- [ ] [multiplication](obsah/multiplication.html) — ✖️ Procvičování násobilky (P2 v původním auditu).
- [ ] [pocitani](obsah/pocitani.html) — Počítání do 20 a 100 (P1 v původním auditu).

### 32 · Matematika · část 12

- [ ] [prevody_jednotek](obsah/prevody_jednotek.html) — Převody jednotek (P2 v původním auditu).
- [ ] [procenta](obsah/procenta.html) — Procenta a trojčlenka (P1 v původním auditu).
- [ ] [roman_numerals](obsah/roman_numerals.html) — 🏛️ Římské číslice (P2 v původním auditu).
- [ ] [rovnice](obsah/rovnice.html) — Lineární rovnice (P2 v původním auditu).

### 33 · Matematika · část 13

- [ ] [trigonometrie](obsah/trigonometrie.html) — 📐 Trigonometrie v pravoúhlém trojúhelníku (P2 v původním auditu).

### 34 · Angličtina · část 1

- [ ] [aj3_abeceda](obsah/aj3_abeceda.html) — Angličtina – abeceda a hláskování (P1 v původním auditu).
- [ ] [aj3_pozdravy](obsah/aj3_pozdravy.html) — Angličtina – pozdravy a představení (P2 v původním auditu).
- [ ] [aj4_mnozne_cislo](obsah/aj4_mnozne_cislo.html) — Angličtina – množné číslo a členy (P1 v původním auditu).
- [ ] [aj4_predlozky](obsah/aj4_predlozky.html) — Angličtina – předložky místa a času (P2 v původním auditu).

### 35 · Angličtina · část 2

- [ ] [aj4_pritomny_prosty](obsah/aj4_pritomny_prosty.html) — Angličtina – přítomný čas prostý (P2 v původním auditu).
- [ ] [aj5_modalni](obsah/aj5_modalni.html) — Angličtina – can, must (P2 v původním auditu).
- [ ] [aj5_pritomny_prubehovy](obsah/aj5_pritomny_prubehovy.html) — Angličtina – přítomný čas průběhový (P2 v původním auditu).
- [ ] [aj6_minuly_cas](obsah/aj6_minuly_cas.html) — Angličtina – minulý čas prostý (P2 v původním auditu).

### 36 · Angličtina · část 3

- [ ] [aj6_stupnovani](obsah/aj6_stupnovani.html) — Angličtina – stupňování přídavných jmen (P2 v původním auditu).
- [ ] [aj7_budouci](obsah/aj7_budouci.html) — Budoucí čas – will a going to (P2 v původním auditu).
- [ ] [aj7_pocitatelnost](obsah/aj7_pocitatelnost.html) — Počitatelná a nepočitatelná podstatná jména (P2 v původním auditu).
- [ ] [aj8_predpritomny](obsah/aj8_predpritomny.html) — Předpřítomný čas (P2 v původním auditu).

### 37 · Angličtina · část 4

- [ ] [aj8_trpny_rod](obsah/aj8_trpny_rod.html) — Trpný rod (P2 v původním auditu).
- [ ] [aj9_neprima_rec](obsah/aj9_neprima_rec.html) — Nepřímá řeč (P0 v původním auditu).
- [ ] [aj9_podminkove](obsah/aj9_podminkove.html) — Podmínkové věty (P1 v původním auditu).
- [ ] [aj_slovesa](obsah/aj_slovesa.html) — Anglická nepravidelná slovesa (P2 v původním auditu).

### 38 · Angličtina · část 5

- [ ] [aj_slovicka](obsah/aj_slovicka.html) — Angličtina – první slovíčka (P2 v původním auditu).
- [ ] [casovani_sloves](obsah/casovani_sloves.html) — 🔤 Časování sloves (P2 v původním auditu).

### 39 · Další cizí jazyky · část 1

- [ ] [dcj7_cleny](obsah/dcj7_cleny.html) — Členy a rod podstatných jmen (P2 v původním auditu).
- [ ] [dcj7_vyslovnost](obsah/dcj7_vyslovnost.html) — Výslovnost a abeceda (NJ/FJ) (P1 v původním auditu).
- [ ] [dcj8_casovani](obsah/dcj8_casovani.html) — Časování pravidelných sloves (P2 v původním auditu).
- [ ] [dcj8_cislovky_cas](obsah/dcj8_cislovky_cas.html) — Číslovky a určování času (P2 v původním auditu).

### 40 · Další cizí jazyky · část 2

- [ ] [dcj9_minuly](obsah/dcj9_minuly.html) — Minulý čas – úvod (P2 v původním auditu).
- [ ] [de_slovicka](obsah/de_slovicka.html) — 🇩🇪 Němčina – slovíčka (P2 v původním auditu).
- [ ] [fr_slovicka](obsah/fr_slovicka.html) — 🇫🇷 Francouzština – slovíčka (P2 v původním auditu).
- [ ] [vyslovnost](obsah/vyslovnost.html) — 🔊 Výslovnost a poslech (P1 v původním auditu).

### 41 · Prvouka a vlastivěda · část 1

- [ ] [prv1_cesta_skola](obsah/prv1_cesta_skola.html) — Cesta do školy a bezpečnost (P2 v původním auditu).
- [ ] [prv1_rocni_obdobi](obsah/prv1_rocni_obdobi.html) — Roční období a čas (P2 v původním auditu).
- [ ] [prv1_rodina](obsah/prv1_rodina.html) — Rodina a domov (P2 v původním auditu).
- [ ] [prv1_smysly](obsah/prv1_smysly.html) — Lidské tělo a smysly (P2 v původním auditu).

### 42 · Prvouka a vlastivěda · část 2

- [ ] [prv2_zdravi](obsah/prv2_zdravi.html) — Zdraví, nemoc a první pomoc (P1 v původním auditu).
- [ ] [prv2_zvirata](obsah/prv2_zvirata.html) — Domácí a volně žijící zvířata (P2 v původním auditu).
- [ ] [prv3_obec](obsah/prv3_obec.html) — Naše obec a kraj (P2 v původním auditu).
- [ ] [prv3_voda_vzduch](obsah/prv3_voda_vzduch.html) — Voda, vzduch a půda (P2 v původním auditu).

### 43 · Prvouka a vlastivěda · část 3

- [ ] [prv3_ziva_neziva](obsah/prv3_ziva_neziva.html) — Živá a neživá příroda (P1 v původním auditu).
- [ ] [prv4_ekosystemy](obsah/prv4_ekosystemy.html) — Ekosystémy – les, louka, voda (P2 v původním auditu).
- [ ] [prv4_horniny](obsah/prv4_horniny.html) — Horniny a nerosty (P1 v původním auditu).
- [ ] [prv4_mapy_smery](obsah/prv4_mapy_smery.html) — Mapa, plán a světové strany (P1 v původním auditu).

### 44 · Prvouka a vlastivěda · část 4

- [ ] [prv4_nejstarsi_dejiny](obsah/prv4_nejstarsi_dejiny.html) — Nejstarší české dějiny (P2 v původním auditu).
- [ ] [prv5_dejiny_20](obsah/prv5_dejiny_20.html) — 20. století v našich dějinách (P2 v původním auditu).
- [ ] [prv5_energie](obsah/prv5_energie.html) — Energie a její zdroje (P2 v původním auditu).
- [ ] [prv5_statni_symboly](obsah/prv5_statni_symboly.html) — Státní symboly a instituce (P0 v původním auditu).

### 45 · Prvouka a vlastivěda · část 5

- [ ] [prv5_zdravy_styl](obsah/prv5_zdravy_styl.html) — Zdravý životní styl (P1 v původním auditu).

### 46 · Fyzika a astronomické modely · část 1

- [ ] [elektrina](obsah/elektrina.html) — ⚡ Elektřina – obvody, Ohmův zákon a magnetismus (P2 v původním auditu).
- [ ] [f6_hustota](obsah/f6_hustota.html) — Hustota (P2 v původním auditu).
- [ ] [f6_mereni](obsah/f6_mereni.html) — Měření fyzikálních veličin (P2 v původním auditu).
- [ ] [f6_vlastnosti_latek](obsah/f6_vlastnosti_latek.html) — Vlastnosti látek a těles (P2 v původním auditu).

### 47 · Fyzika a astronomické modely · část 2

- [ ] [f7_pohyb](obsah/f7_pohyb.html) — Pohyb tělesa – dráha a rychlost (P1 v původním auditu).
- [ ] [f7_sila](obsah/f7_sila.html) — Síla, těžiště a Newtonovy zákony (P2 v původním auditu).
- [ ] [f7_tlak](obsah/f7_tlak.html) — Tlak v kapalinách a plynech (P2 v původním auditu).
- [ ] [f8_prace_energie](obsah/f8_prace_energie.html) — Práce, výkon a energie (P2 v původním auditu).

### 48 · Fyzika a astronomické modely · část 3

- [ ] [f8_teplo](obsah/f8_teplo.html) — Teplo a změny skupenství (P1 v původním auditu).
- [ ] [f9_jaderna](obsah/f9_jaderna.html) — Jaderná energie (P2 v původním auditu).
- [ ] [f9_stridavy_proud](obsah/f9_stridavy_proud.html) — Střídavý proud a rozvod elektřiny (P2 v původním auditu).
- [ ] [f9_zvuk](obsah/f9_zvuk.html) — Zvukové jevy (P2 v původním auditu).

### 49 · Fyzika a astronomické modely · část 4

- [ ] [gravitacni_hriste](obsah/gravitacni_hriste.html) — 🎯 Kosmický prak: oběžné dráhy (P1 v původním auditu).
- [ ] [gravitacni_hriste2](obsah/gravitacni_hriste2.html) — 🌀 Gravitační hřiště: Vzájemná přitažlivost (P2 v původním auditu).
- [ ] [iss](obsah/iss.html) — 🛰️ ISS živě (P1 v původním auditu).
- [ ] [optika](obsah/optika.html) — 🔦 Optika – odraz, lom a čočky (P2 v původním auditu).

### 50 · Fyzika a astronomické modely · část 5

- [ ] [optika_soustava](obsah/optika_soustava.html) — 🧩 Stavba optické soustavy (P2 v původním auditu).
- [ ] [paka](obsah/paka.html) — ⚖️ Páka a jednoduché stroje (P2 v původním auditu).
- [ ] [physics_playground](obsah/physics_playground.html) — 🔬 Fyzikální hřiště pro děti (P2 v původním auditu).
- [ ] [physics_ref](obsah/physics_ref.html) — ⚛️ Fyzikální vzorce a konstanty (P2 v původním auditu).

### 51 · Fyzika a astronomické modely · část 6

- [ ] [planet_globe](obsah/planet_globe.html) — 🌐 Glóbusy planet (P2 v původním auditu).
- [ ] [pohyb_vesmirem](obsah/pohyb_vesmirem.html) — 🌌 Pohyb vesmírem (P1 v původním auditu).
- [ ] [proudove_motory](obsah/proudove_motory.html) — 🛫 Proudové motory – jak jimi proudí vzduch (P2 v původním auditu).
- [ ] [sky_events](obsah/sky_events.html) — 🌠 Astronomický kalendář úkazů (P2 v původním auditu).

### 52 · Fyzika a astronomické modely · část 7

- [ ] [solar_system](obsah/solar_system.html) — 🪐 Sluneční soustava (P2 v původním auditu).
- [ ] [star_map](obsah/star_map.html) — 🌌 Hvězdná obloha (P2 v původním auditu).
- [ ] [vitr_tunel](obsah/vitr_tunel.html) — 💨 Vítr a překážky – aerodynamický tunel (P2 v původním auditu).
- [ ] [vodni_hladina](obsah/vodni_hladina.html) — 💧 Vodní hladina – vlny a slapy (P2 v původním auditu).

### 53 · Fyzika a astronomické modely · část 8

- [ ] [vrtacka_lis](obsah/vrtacka_lis.html) — 🛠️ Vrtačka a lis: síly při práci (P2 v původním auditu).

### 54 · Chemie · část 1

- [ ] [ch8_atom](obsah/ch8_atom.html) — Atom, molekula a chemická vazba (P1 v původním auditu).
- [ ] [ch8_bezpecnost](obsah/ch8_bezpecnost.html) — Bezpečnost práce a výstražné značky (P1 v původním auditu).
- [ ] [ch8_smesi](obsah/ch8_smesi.html) — Směsi a jejich oddělování (P2 v původním auditu).
- [ ] [ch8_voda_vzduch](obsah/ch8_voda_vzduch.html) — Voda a vzduch (P2 v původním auditu).

### 55 · Chemie · část 2

- [ ] [ch9_derivaty](obsah/ch9_derivaty.html) — Deriváty uhlovodíků (P2 v původním auditu).
- [ ] [ch9_ph](obsah/ch9_ph.html) — Kyseliny, hydroxidy a pH (P0 v původním auditu).
- [ ] [ch9_prirodni_latky](obsah/ch9_prirodni_latky.html) — Přírodní látky (P1 v původním auditu).
- [ ] [ch9_redoxni](obsah/ch9_redoxni.html) — Redoxní reakce a elektrolýza (P2 v původním auditu).

### 56 · Chemie · část 3

- [ ] [ch9_uhlovodiky](obsah/ch9_uhlovodiky.html) — Uhlovodíky (P2 v původním auditu).
- [ ] [ch9_zivotni_prostredi](obsah/ch9_zivotni_prostredi.html) — Chemie a životní prostředí (P1 v původním auditu).
- [ ] [chem_nazvoslovi](obsah/chem_nazvoslovi.html) — Chemické názvosloví (P2 v původním auditu).
- [ ] [periodic_table](obsah/periodic_table.html) — ⚛️ Periodická tabulka (P2 v původním auditu).

### 57 · Chemie · část 4

- [ ] [vycislovani_rovnic](obsah/vycislovani_rovnic.html) — Vyčíslování chemických rovnic (P1 v původním auditu).

### 58 · Přírodopis · část 1

- [ ] [anatomie](obsah/anatomie.html) — Biologie člověka · Interaktivní atlas (P2 v původním auditu).
- [ ] [bunka](obsah/bunka.html) — Stavba buňky – interaktivní atlas a procvičování (P2 v původním auditu).
- [ ] [potravni_retezec](obsah/potravni_retezec.html) — 🌾 Potravní řetězce (P1 v původním auditu).
- [ ] [pr6_bezobratli](obsah/pr6_bezobratli.html) — Bezobratlí (P2 v původním auditu).

### 59 · Přírodopis · část 2

- [ ] [pr6_clenovci](obsah/pr6_clenovci.html) — Členovci (P1 v původním auditu).
- [ ] [pr6_houby](obsah/pr6_houby.html) — Houby a lišejníky (P1 v původním auditu).
- [ ] [pr6_mikroorganismy](obsah/pr6_mikroorganismy.html) — Bakterie, viry a jednobuněčné organismy (P2 v původním auditu).
- [ ] [pr7_obratlovci_studenokrevni](obsah/pr7_obratlovci_studenokrevni.html) — Ryby, obojživelníci a plazi (P2 v původním auditu).

### 60 · Přírodopis · část 3

- [ ] [pr7_ptaci_savci](obsah/pr7_ptaci_savci.html) — Ptáci a savci (P2 v původním auditu).
- [ ] [pr7_rostliny](obsah/pr7_rostliny.html) — Stavba a systém rostlin (P2 v původním auditu).
- [ ] [pr8_prvni_pomoc](obsah/pr8_prvni_pomoc.html) — Zdraví a první pomoc (P1 v původním auditu).
- [ ] [pr8_rozmnozovani](obsah/pr8_rozmnozovani.html) — Rozmnožování a vývoj člověka (P1 v původním auditu).

### 61 · Přírodopis · část 4

- [ ] [pr9_ekologie](obsah/pr9_ekologie.html) — Ekologie a ochrana přírody · Metodus (P2 v původním auditu).
- [ ] [pr9_geologicke_deje](obsah/pr9_geologicke_deje.html) — Geologické děje (P2 v původním auditu).
- [ ] [pr9_mineraly](obsah/pr9_mineraly.html) — Minerály a horniny (P1 v původním auditu).
- [ ] [pr9_vyvoj_zeme](obsah/pr9_vyvoj_zeme.html) — Vývoj Země a života (P2 v původním auditu).

### 62 · Přírodopis · část 5

- [ ] [punnett](obsah/punnett.html) — Punnettův čtverec (genetika) (P1 v původním auditu).

### 63 · Zeměpis · část 1

- [ ] [eduMaps](obsah/eduMaps.html) — 🗺️ Mapové nástroje pro školu (P1 v původním auditu).
- [ ] [flags_quiz](obsah/flags_quiz.html) — 🏳️ Kvíz vlajky a hlavní města (P2 v původním auditu).
- [ ] [reky_pohori](obsah/reky_pohori.html) — 🏔️ Řeky a pohoří ČR (P1 v původním auditu).
- [ ] [slepa_mapa](obsah/slepa_mapa.html) — Slepá mapa ČR (P2 v původním auditu).

### 64 · Zeměpis · část 2

- [ ] [slepa_mapa_evropa](obsah/slepa_mapa_evropa.html) — Slepá mapa Evropy (P2 v původním auditu).
- [ ] [svetova_hlavni_mesta](obsah/svetova_hlavni_mesta.html) — 🌍 Světová hlavní města (P2 v původním auditu).
- [ ] [z6_atmosfera](obsah/z6_atmosfera.html) — Atmosféra a počasí (P2 v původním auditu).
- [ ] [z6_hydrosfera](obsah/z6_hydrosfera.html) — Hydrosféra (P2 v původním auditu).

### 65 · Zeměpis · část 3

- [ ] [z6_litosfera](obsah/z6_litosfera.html) — Litosféra a povrch Země (P2 v původním auditu).
- [ ] [z6_mapa_souradnice](obsah/z6_mapa_souradnice.html) — Mapa, měřítko a souřadnice (P2 v původním auditu).
- [ ] [z6_planeta_zeme](obsah/z6_planeta_zeme.html) — Planeta Země – tvar a pohyby (P2 v původním auditu).
- [ ] [z7_afrika](obsah/z7_afrika.html) — Afrika (P2 v původním auditu).

### 66 · Zeměpis · část 4

- [ ] [z7_amerika](obsah/z7_amerika.html) — Amerika (P2 v původním auditu).
- [ ] [z7_asie](obsah/z7_asie.html) — Asie (P2 v původním auditu).
- [ ] [z7_australie_oceanie](obsah/z7_australie_oceanie.html) — Austrálie, Oceánie a polární oblasti (P1 v původním auditu).
- [ ] [z8_cr_hospodarstvi](obsah/z8_cr_hospodarstvi.html) — ČR – obyvatelstvo a hospodářství (P1 v původním auditu).

### 67 · Zeměpis · část 5

- [ ] [z8_cr_prirodni](obsah/z8_cr_prirodni.html) — ČR – povrch, podnebí a vodstvo (P2 v původním auditu).
- [ ] [z8_evropa_regiony](obsah/z8_evropa_regiony.html) — Evropa – regiony (P1 v původním auditu).
- [ ] [z9_globalni_problemy](obsah/z9_globalni_problemy.html) — Globální problémy a životní prostředí (P2 v původním auditu).
- [ ] [z9_hospodarstvi_svet](obsah/z9_hospodarstvi_svet.html) — Světové hospodářství a globalizace (P2 v původním auditu).

### 68 · Zeměpis · část 6

- [ ] [z9_obyvatelstvo](obsah/z9_obyvatelstvo.html) — Obyvatelstvo a sídla světa (P1 v původním auditu).

### 69 · Dějepis · část 1

- [ ] [casova_osa](obsah/casova_osa.html) — Časová osa českých dějin (P2 v původním auditu).
- [ ] [d6_prameny](obsah/d6_prameny.html) — Čas, prameny a práce historika (P1 v původním auditu).
- [ ] [d6_pravek](obsah/d6_pravek.html) — Pravěk (P2 v původním auditu).
- [ ] [d6_recko](obsah/d6_recko.html) — Starověké Řecko (P2 v původním auditu).

### 70 · Dějepis · část 2

- [ ] [d6_rim](obsah/d6_rim.html) — Starověký Řím (P2 v původním auditu).
- [ ] [d6_stary_orient](obsah/d6_stary_orient.html) — Starověký Egypt a Mezopotámie (P2 v původním auditu).
- [ ] [d7_husitstvi](obsah/d7_husitstvi.html) — Husitství (P2 v původním auditu).
- [ ] [d7_lucemburkove](obsah/d7_lucemburkove.html) — Lucemburkové a Karel IV. (P2 v původním auditu).

### 71 · Dějepis · část 3

- [ ] [d7_premyslovci](obsah/d7_premyslovci.html) — Přemyslovci (P2 v původním auditu).
- [ ] [d7_rany_stredovek](obsah/d7_rany_stredovek.html) — Raný středověk a příchod Slovanů (P2 v původním auditu).
- [ ] [d8_objevy_renesance](obsah/d8_objevy_renesance.html) — Zámořské objevy a renesance (P2 v původním auditu).
- [ ] [d8_osvicenstvi](obsah/d8_osvicenstvi.html) — Osvícenství a revoluce (P2 v původním auditu).

### 72 · Dějepis · část 4

- [ ] [d8_prumyslova_revoluce](obsah/d8_prumyslova_revoluce.html) — Průmyslová revoluce a národní obrození (P2 v původním auditu).
- [ ] [d8_reformace](obsah/d8_reformace.html) — Reformace a třicetiletá válka (P2 v původním auditu).
- [ ] [d9_csr](obsah/d9_csr.html) — Vznik ČSR a meziválečné období (P2 v původním auditu).
- [ ] [d9_druha_valka](obsah/d9_druha_valka.html) — Druhá světová válka a holokaust (P1 v původním auditu).

### 73 · Dějepis · část 5

- [ ] [d9_prvni_valka](obsah/d9_prvni_valka.html) — První světová válka (P2 v původním auditu).
- [ ] [d9_studena_valka](obsah/d9_studena_valka.html) — Studená válka a rok 1989 (P2 v původním auditu).
- [ ] [eu_instituce](obsah/eu_instituce.html) — 🇪🇺 Instituce EU (P2 v původním auditu).
- [ ] [historicke_mapy_odkazy](obsah/historicke_mapy_odkazy.html) — 📜 Kde najít historické mapy (P2 v původním auditu).

### 74 · Dějepis · část 6

- [ ] [svetove_dejiny](obsah/svetove_dejiny.html) — 📜 Časová osa světových dějin (P2 v původním auditu).

### 75 · Informatika · část 1

- [ ] [AI_prednaska](obsah/AI_prednaska.html) — 🤖 Úvod do AI pro laiky (P1 v původním auditu).
- [ ] [eduSort](obsah/eduSort.html) — 🔢 Vizualizace řadících algoritmů (P1 v původním auditu).
- [ ] [inf4_data](obsah/inf4_data.html) — Data, informace a kódování (P2 v původním auditu).
- [ ] [inf4_hardware](obsah/inf4_hardware.html) — Hardware a bezpečné chování (P2 v původním auditu).

### 76 · Informatika · část 2

- [ ] [inf4_sekvence](obsah/inf4_sekvence.html) — Programování – sekvence příkazů (P2 v původním auditu).
- [ ] [inf5_cykly](obsah/inf5_cykly.html) — Programování – cykly a větvení (P2 v původním auditu).
- [ ] [inf5_zdroje](obsah/inf5_zdroje.html) — Informace na internetu a ověřování (P1 v původním auditu).
- [ ] [inf6_digitalni_stopa](obsah/inf6_digitalni_stopa.html) — Digitální stopa a bezpečnost (P2 v původním auditu).

### 77 · Informatika · část 3

- [ ] [inf6_promenne](obsah/inf6_promenne.html) — Programování – proměnné a podmínky (P1 v původním auditu).
- [ ] [inf6_tabulky](obsah/inf6_tabulky.html) — Tabulkový procesor – vzorce (P1 v původním auditu).
- [ ] [inf7_funkce](obsah/inf7_funkce.html) — Programování – funkce a parametry (P2 v původním auditu).
- [ ] [inf7_sifrovani](obsah/inf7_sifrovani.html) — Šifrování a kódování dat (P1 v původním auditu).

### 78 · Informatika · část 4

- [ ] [inf7_site](obsah/inf7_site.html) — Počítačové sítě a internet (P2 v původním auditu).
- [ ] [inf8_databaze](obsah/inf8_databaze.html) — Databáze a strukturovaná data (P1 v původním auditu).
- [ ] [inf8_licence](obsah/inf8_licence.html) — Autorská práva a licence (P1 v původním auditu).
- [ ] [inf9_ai_etika](obsah/inf9_ai_etika.html) — Umělá inteligence a etika (P2 v původním auditu).

### 79 · Informatika · část 5

- [ ] [inf9_model_simulace](obsah/inf9_model_simulace.html) — Modely a simulace (P2 v původním auditu).
- [ ] [morse_code](obsah/morse_code.html) — 📡 Morseova abeceda (P2 v původním auditu).

### 80 · Další výuka (2 stránky) · část 1

- [ ] [music_theory](obsah/music_theory.html) — 🎼 Hudební nauka (P2 v původním auditu).
- [ ] [notes_reading](obsah/notes_reading.html) — 🎼 Notová osnova – čtení not (P2 v původním auditu).

## Způsob uzavření každé malé etapy

1. Záloha upravovaných stránek a respektování existujících rozpracovaných změn.
2. Jedna konkrétní změna s didaktickým cílem.
3. Kontrola obsahu, správné i chybné odpovědi a relevantního ovládání.
4. Kontrola úzkého zobrazení a obou motivů; u modelu navíc reset a hraniční hodnoty.
5. Záznam výsledku zde, aktualizace cache podle potřeby.
