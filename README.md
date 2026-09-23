# ◈ Metodus

Samostatný web s interaktivními výukovými aplikacemi pro základní školu —
čeština, matematika, cizí jazyky, prvouka a vlastivěda, přírodní vědy, zeměpis,
dějepis a informatika. Výukové úlohy běží v prohlížeči bez registrace.
Service worker ukládá jádro webu a postupně navštívené místní soubory. Offline
fungují lekce, jejichž potřebné soubory už jsou uložené; otevření rozcestníku
nestáhne celý katalog. Před výukou bez sítě je potřeba vybrané režimy ověřit.
Externí zdroje a živá data (například ISS) vyžadují internet. Skóre, deník a
vlastní sady jsou místní data daného prohlížeče, bez automatické synchronizace;
externí zdroje, datová API a některé hlasy mohou komunikovat se svými službami.

Katalog je zároveň **kostrou osnov ZŠ**: 245 témat v 11 předmětech a 9 ročnících
plus 10 nástrojů bez vazby na předmět — dohromady 255 položek. Osnova je momentálně
pokrytá celá, žádné téma nezůstalo jen jako zástupce (🚧). Přehled je na stránce
[Osnova](obsah/osnova.html).

Živě: <https://lavionus.github.io/site/metodus/>

Web se do září 2026 jmenoval **Nodus**. Přejmenovaná je složka, všechny texty,
značka (nové logo „M" v `Logo/Logo_1254x1254.png`, z něj generované ikony)
i klíče v `localStorage`: `nodus_*` → `metodus_*`. Staré hodnoty převede při
prvním načtení jednorázová migrace v `theme.js`, starou cache `nodus-*` smaže
`sw.js` při aktivaci a staré odkazy na `/nodus/` odchytí přesměrovávač
`../nodus/index.html`.

## Struktura

| Cesta | Obsah |
|---|---|
| `index.html` | rozcestník — menu, hledání, oblíbené, deep-linky přes `#obsah/…` |
| `apps.js` | katalog (jediný zdroj pravdy pro menu, hledání i úvodní přehled) |
| `obsah/prehled.html` | úvodní stránka v pracovní ploše (ročníky, předměty, tip dne, oblíbené) |
| `obsah/osnova.html` | mřížka ročníků × předmětů s přehledem pokrytí učiva |
| `obsah/ucitel.html` | kabinet učitele – rozcestník pro přípravu a nástroje do hodiny (ve dvou úrovních záložek) |
| `obsah/prezentace.html` | tvorba slidů, promítání na plátno a tisk podkladů |
| `obsah/predstaveni.html` | živé ukázky – zkrácené, ale funkční verze šesti aplikací na jedné stránce |
| `obsah/*.html` | jednotlivé výukové aplikace |
| `obsah/lib/`, `obsah/textures/`, `obsah/Anatomy/` | knihovny a data aplikací |
| `common.css`, `theme.js` | sdílený vzhled a přepínání motivů (podle systému, tmavý, světlý, vysoký kontrast, sépie, stará knihovna, škola, noční škola) |
| `kontrast.css`, `sepia.css`, `sepia-tmava.css`, `knihovna.css`, `skola.css`, `nocni-skola.css` | palety a textury dalších motivů (importuje je `common.css`) |
| `projektor.js` | zvětšení obrazu pro projektor a tabuli – používá rozcestník i prezentace |
| `podpis.js` | podpis (`© Metodus · hdm@seznam.cz`) ve vlastním pruhu dole – patří do `<head>` **každé** stránky; text skládají konstanty `DILO` a `MAIL` na začátku souboru |
| `rec.js` | čtení nahlas – systémový hlas, jinak vestavěný ze složky `hlas/` |
| `uloha.js` | společné chování úloh: zaklepání u chyby, zelená a automatický posun u správné odpovědi, skóre |
| `vyjmenovana.js` | řady vyjmenovaných slov (jediný zdroj pro doplňovačky, vyjmenovaná slova i diktáty) |
| `vyuka.css` | společný vzhled procvičovacích aplikací (plocha, možnosti, odezva, řazení, pravopisné díly) |
| `kostra.js`, `kostra.css` | společná kostra každé lekce: proužek předmětu, cíl z katalogu, fáze Výuka · Ukázka · Procvič · Ověř se · Tahák, cesta rodiny témat a blok „Kam dál“ – viz [Společná kostra stránky](#společná-kostra-stránky) |
| `nazor.js`, `nazor.css` | knihovna sdílených názorných prvků (koláč, proužek, číselná osa, procenta, věta s větnými členy, časová osa, mapa) – ukázky v `docs/nazor-ukazky.html` |
| `data/` | společná data rodin témat: `udalosti.js` (české a světové dějiny), `staty.js` (státy, hlavní města, vlajky), `horniny.js` (vzorky hornin a nerostů), `tisnova_cisla.js` |
| `hlas/` | vestavěný syntetizér řeči (meSpeak/eSpeak, GPL) – viz `hlas/LICENCE.md` |
| `fonty/` | školní psací písmo Playwrite CZ (OFL) – viz `fonty/LICENCE.md` |
| `sw.js`, `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | PWA (cache `metodus-vN`) |
| `logo.svg` | značka (uzel) pro manifest a další použití; v hlavičkách je stejná cesta vložená inline (bere barvu z motivu a nezávisí na načtení souboru) |
| `favicon.svg`, `favicon.ico` | ikona v záložce prohlížeče |
| `Logo/` | zdrojové obrázky značky + `build_ikon.sh`, který z nich generuje celou sadu |

## Katalog a osnova

Každá položka v `apps.js` má kromě `soubor`, `nazev` a `tagy` také:

| Pole | Význam |
|---|---|
| `predmet` | id z `KATALOG_PREDMETY` (`cj`, `m`, `aj`, `dcj`, `prv`, `inf`, `f`, `ch`, `pr`, `z`, `d`); nástroje bez vazby na předmět ho nemají |
| `rocniky` | ročníky ZŠ, kterých se téma týká — podle nich filtruje menu i mřížka osnovy |
| `stav` | `'plan'` u připravovaných témat; hotové aplikace pole nemají |

Menu filtruje ve třech nezávislých osách (předmět, ročník, zobrazení
připravovaných — ten se skryje, dokud katalog žádné `stav: 'plan'` neobsahuje)
a hledání jde napříč všemi. Stránka `obsah/osnova.html` počítá
mřížku pokrytí přímo z katalogu — druhý zdroj pravdy neexistuje.

Rozdělení témat do ročníků odpovídá obvyklé praxi českých ŠVP. RVP ZV samo
stanovuje očekávané výstupy po obdobích (1.–3. a 4.–5. ročník, 2. stupeň),
ne po jednotlivých ročnících. Revidované RVP ZV bylo schváleno v lednu 2025
a povinné bude od září 2027 pro 1. a 6. ročník.

## Společná kostra stránky

Každá stránka katalogu má v `<head>` řádek `<script src="../kostra.js" defer></script>`.
Skript si najde svou položku v katalogu (`apps.js`; když ho stránka nenačítá, načte si ho sám)
a pod nadpis vloží jednotnou hlavičku:

- **proužek předmětu** – barva a ikona předmětu (`--predmet-*` v `common.css`), sekce, ročník;
- **cíl lekce** z `KATALOG_CILE` („Po této lekci: …“, v první osobě, popisuje to, co stránka umí dnes).
  Pilotní lekce s vlastním rozepsaným blokem `.cil` ho neopakují;
- **lištu fází** 📖 Výuka · 📘 Ukázka · ✏️ Procvič · 🎯 Ověř se · 📌 Tahák – jen ty, které stránka má;
- **cestu rodiny témat** (`KATALOG_RODINY`) a na konec stránky blok **Kam dál** (předchozí a další krok,
  hlavní lekce). Stránky s vlastním `.navaznosti` si ho nechávají.

Aplikace na celou obrazovku (tělo s `overflow: hidden` nebo nadpis ve vodorovné liště) dostanou
jednořádkovou kostru s odkazy „← předchozí · další →“ a bez zápatí. Výšku kostry zveřejňuje
proměnná `--kostra-vyska`, takže mřížka na celou výšku si ji může odečíst
(`height: calc(100% - var(--kostra-vyska, 0px))`).

Fáze se hledají automaticky (pomůcka `.pomucka`/`.napoveda` = Výuka a Tahák, `#rezimy`/`#plocha` =
Procvič, `#vedena-aktivita` nebo režim `ukazka` = Ukázka). Kde to nestačí, stránka je určí sama:

| Atribut | Význam |
|---|---|
| `data-faze="vyuka"` / `"ukazka"` / `"procvic"` / `"tahak"` | prvek (sekce, záložka, tlačítko režimu) patří dané fázi; tlačítko režimu se při volbě fáze stiskne |
| `data-kostra-overeni="ne"` | stránka má vlastní sérii otázek, „Ověř se“ se nenabízí |
| `data-kostra-odpovedi` | stránka bez `uloha.js` ohlašuje odpovědi přes `Kostra.odpoved()` (viz níže) |
| `data-kostra-misto="po"` / `"pred"` | kam kostru vložit, když nadpis stránky není na vhodném místě |

**Ověř se** složí 8 otázek napříč režimy stránky, skryje nápovědy a pomůcky a počítá první odpověď
u každé otázky. Výsledek s doporučením, které režimy zopakovat, se uloží do `localStorage`
(`metodus_overeni`, posledních 5 pokusů na stránku). Stačí k tomu, že stránka staví otázky přes
`Uloha.vyber`/`Uloha.odpoved` – `uloha.js` ohlašuje události `metodus:otazka` a `metodus:odpoved`.
Starší stránky bez `uloha.js` volají `Kostra.odpoved(spravne, otazka)` (objekt `otazka` = jedna otázka)
a `Kostra.otazka()` při nové otázce. Režimy, které nejsou úlohou (přehled, model, kalkulačka),
se ze zkoušky vyřadí: nemají `data-faze="procvic"`, nebo nevytvoří otázku.

**Jednotné názvy tlačítek:** ✔️ Zkontrolovat · Pokračovat → (po odpovědi) · Přeskočit → (bez započtení) ·
▶️ Spustit sérii / 🔄 Nová série · 💡 Nápověda · 👁️ Ukázat řešení · ⏸️ Pauza · ↺ Výchozí stav.
„Další →“ zůstává jen u listování kartičkami.

### Knihovna názorných prvků

`nazor.js` + `nazor.css`: stejný jev se na celém webu kreslí stejně. Zlomky (koláč, proužek, osa se
stejně velkým celkem) používají zlomky úvod; číselná osa s posunem celá čísla; proužek 0–100 %
procenta; časová osa se souběžnými pruhy Česko/svět (měřítko „pořadí“ nebo skutečné) obě časové osy.
Barvy větných členů (`--clen-*`) jsou v `common.css` a berou je rozbor věty, skladební dvojice,
rozvíjející členy i shoda podmětu. Mapy obstarává dál `mapy.js` (`Nazor.mapa` je jen tenký obal).

### Úkoly k modelu (simulace)

`badani.js` + `badani.css` dávají simulaci učební cestu: panel **🧪 Úkoly k modelu** vede žáka
ve třech krocích – 🤔 **předpověz** (tip dřív, než cokoli zkusí), 🔬 **vyzkoušej** (panel sám pozná,
že model dosáhl požadovaného stavu, a zapíše, co ukázal) a 💬 **vysvětli** (porovnání tipu s pokusem
a výběr vysvětlení; každá chybná možnost má vlastní zdůvodnění). Panel je nemodální: na obrazovce
od 900 px se ukotví jako boční sloupec a stránka se o něj zúží (model se překreslí do zbylého místa),
na užší obrazovce plave, na mobilu je to list u spodní hrany. Poprvé se na širší obrazovce otevře sám.

Napojení na kostru: úkoly jsou fáze 📖 Výuka, záložka **❓ Otázky** fáze ✏️ Procvič a z otázek
staví kostra 🎯 **Ověř se** (panel má `data-kostra-odpovedi` a odpovědi ohlašuje přes `Kostra.odpoved`).
Shrnutí úkolů je 📌 Tahák. Postup se ukládá do `metodus_badani` (po stránkách).

Stránka vloží na konec `<body>` až za svůj skript:

```html
<script src="../badani.js"></script>
<script>
Badani.start({
  nad: '#stav',            // plovoucí panel se drží nad stavovým řádkem
  zakryt: '#vyklad',       // výklad, který by prozradil odpověď, se do tipu rozmaže
  ukoly: [{ id, nazev, predpoved: { otazka, moznosti, spravna }, priprava, pokus,
            splneno: () => …, ukaz, pozorovani, vysvetli: { otazka, moznosti }, shrnuti }],
  otazky: [{ otazka, moznosti: [{ t, ok, proc }], vysvetleni }, () => ({ … })],
});
</script>
```

`priprava` a `ukaz` jsou buď mapa `{'#posuvnik': hodnota}` (komponenta hodnotu zapíše a vyvolá
`input` + `change`, jako by to udělal žák), nebo funkce. `splneno` čte stav modelu přímo (globální
objekty simulace); kontroluje se po každé akci a čtyřikrát za sekundu, takže zachytí i animaci.
Otázka může být funkce, která vrací nové zadání s náhodnými čísly. Každá musí mít právě jednu
správnou možnost a u chybných zdůvodnění – hlídá to [tests/badani.mjs](tests/badani.mjs)
na 40 vygenerovaných zadáních každé otázky. Zavedeno na 18 stránkách (viz `VYCHOZI` v testu).

Když model potřebuje čas (proudění se ustaluje, planetka musí oblétnout Slunce), porovnává úkol až
ustálené nebo zapsané hodnoty – stránka si je v bloku úkolů sama měří (např. `namereno` u tunelu,
`hotove` u řazení). Úkol nestavět na jevu, který model spolehlivě neukáže: než se napíše předpověď,
ověřit v prohlížeči, co model opravdu dělá (tunel má odpor skoro lineární se sílou větru, proto na
tom úkol nestojí). Tmavé stránky s plošným `button { color: … }` pro světlý tón musí vyjmout
`.badani` i `.kostra` – s úkoly se na nich poprvé objeví lišta fází.

### Starší samostatné stránky (F) pod společným motorem

Kvízy, které si dřív řešily vlastní skóre a vlastní „tlačítka“ (často `<div>` s `onclick`,
tedy bez klávesnice), jedou přes `procvic.js` (série s druhým pokusem, přehledem chyb
a „Zopakovat chyby“) nebo `uloha.js` (průběžné procvičování). Stavba stránky je stejná jako
u lekcí: `#rezimy` (výkladový režim s `data-faze="vyuka"`), `#plocha`, `.ovladani`, tahák
`.napoveda`. Výkladová část (převodník, přehled, osa) se při procvičování skryje atributem
`hidden`. Tím všechny dostaly Ověř se, ovládání klávesnicí, hlášení odečítači a jednotný vzhled
v motivech. Obě časové osy sdílejí kvíz `osa-kviz.js` (`OsaKviz.spust({ pruh, klic })`),
slovíčka AJ/NJ/FJ modul `slovicka.js` + `slovicka.css` (`Slovicka.spust({ klic, lang, jazyk,
slova, kategorie, cleny, plne, plneHtml, pravidlo })` – přehled, kartičky, série a u jazyků se
členy režim „který člen?“).

Otázka v `procvic.js` umí kromě `zadani`, `odpoved`, `moznosti`, `napoveda` také:
`poVyhodnoceni(karta, spravne)` – co se ukáže na kartě po uzavření otázky (postup, proužek,
celé slovíčko); `varianty` – další uznávané odpovědi (was/were); `presne: true` – záleží na
velikosti písmen (vzorce CO × Co); `vlastni: { vykresli(karta, potvrd), spravne(), znovu(),
zamkni() }` – vlastní vstup s víc políčky (koeficienty chemické rovnice).
Test: [tests/prevod-f.mjs](tests/prevod-f.mjs) – fáze, klávesnice, série do konce, žádné
dvě stejné možnosti, Ověř se, kontrast, mobil.

### Barvy na výplních

Písmo na výplni akcentu, zelené a červené je `--na-akcentu`. V tmavém motivu (bez `data-theme`)
je tmavé (`#10151c`), protože akcent i stavové barvy jsou světlé – bílá na nich měla 2,0–3,6 : 1.
Světlý motiv má sytější `--ok` a `--danger`, aby bílá držela ≥ 6 : 1; červený text zpětné
vazby má v tmavém motivu `--danger-text: #ec7474`. Tématické motivy si `--na-akcentu` určují
samy. Hlídá to [tests/vyplne.mjs](tests/vyplne.mjs) (všechny stránky, tmavý a světlý motiv).

### Rodiny témat

`KATALOG_RODINY` v `apps.js`: 43 rodin, každá s hlavní lekcí a doporučeným pořadím napříč ročníky;
stránka patří nejvýš do jedné rodiny, nástroje (kartičky, kabinet…) do žádné. Rodiny ukazuje hlavička
každé lekce, blok Kam dál a stránka Osnova (oddíl „Rodiny témat“). Souběžné stránky čtou společná
data z `data/` (a `vyjmenovana.js`), aby si neodporovaly – například kvíz vlajek a kvíz hlavních měst
dřív uváděly různé názvy téhož hlavního města.

## Generátor pracovních listů

`obsah/pracovni_listy.html` skládá tisknutelné listy z vlastního katalogu
generátorů úloh (konstanta `G` uvnitř stránky). Každé téma má stejná metadata
jako katalog Metodusu, takže se výběr filtruje ve dvou osách jako menu:

| Pole | Význam |
|---|---|
| `p` | hlavní předmět — id z `PREDMETY` (shodné s `KATALOG_PREDMETY` v `apps.js`) |
| `p2` | vedlejší předměty; krajská města patří do vlastivědy i zeměpisu a filtr je najde v obou |
| `r` | ročníky, kterých se téma týká — podle nich filtruje nabídka |
| `t`, `instr` | název tématu a pokyn nad úlohami na listu |
| `gen(d, R)` | vrátí `{q, a}` pro obtížnost `d` a generátor náhody `R` |
| `sig` | podpis tvaru úlohy — úlohy se pak rozprostřou mezi všechny tvary, aby se na listu neopakovala stejná věta |

Volba ročníku zúží seznam témat a předvyplní obtížnost (1.–3. lehká,
4.–6. střední, 7.–9. těžká). Jakmile si ji učitel přenastaví ručně, ročník
už do ní nesahá.

Řešení se výchozím nastavením tiskne **na zvláštní stránce** a **kód listu**
(podle něj se dá tentýž list vyrobit znovu) jde jen na ni — na listy pro žáky
se tiskne, jen když si to učitel přepne volbou *Tisknout kód listu*. Celé
nastavení včetně textů v hlavičce, vybraných témat a kódu listu se průběžně
ukládá do `localStorage` (`worksheet_gen_v2`), takže se stránka otevře tam,
kde ji učitel opustil.

Arch v náhledu je vždy bílý papír, proto uvnitř `.sheet-page` **nesmí být
proměnné motivu** — ve světlém režimu vycházelo `--bg-hover` na bílém papíře
jako neviditelná čísla úloh a linka na jméno, a to i v tisku.

## Pro učitele

Učitelské stránky drží pohromadě `obsah/ucitel.html` (**Kabinet učitele**).
Stránka se přepíná mezi **dvěma částmi** (přepínač nahoře, volba se pamatuje
v `metodus_ucitel_cast`):

- **📋 Příprava na hodinu** — rozcestník po přípravných nástrojích (pracovní listy,
  slidy, osnova, ukázky, knihovna sad, kartičky, citace).
- **🧰 Nástroje do hodiny** — to, co běží přímo v hodině.

Nástroje jsou uvnitř ve **dvou úrovních záložek**: nahoře skupina, pod ní nástroje.

| Skupina | Nástroje |
|---|---|
| 🧭 Průběh hodiny | časovač (i stopky), semafor hluku |
| 🎲 Náhoda | kostka, mince |
| 👥 Práce se třídou | losování žáka, skupiny, skóre týmů |

Práce se třídou je schválně **poslední a schovaná** — uprostřed hodiny se sahá
spíš po časovači a kostce, seznam žáků se řeší při přípravě.

Pravidla, kterými se stránka řídí:

- **Čte se z poslední lavice.** Čísla i jména jsou v `clamp()` škále přes celou
  šířku, ne v okénku — nástroj se pouští na plátno, ne na notebook.
- **Celá obrazovka na plátno.** Časovač, semafor, kostka, mince, losování
  i skóre mají tlačítko ⛶ (klávesa `F`). Používá se Fullscreen API a když ho
  prohlížeč nebo rám odmítne, nástroj se roztáhne přes okno třídou `zvetseno`
  (`position: fixed`) — ve fullscreenu se skryjí ovládací drobnosti (`.drobne`)
  a písmo povyroste.
- **Seznam třídy je jeden.** Losování, skupiny i výběr do týmů berou jména
  ze stejného `metodus_tridy_v1`, aby se třída psala jen jednou. Tříd může být víc.
- **Losování bez opakování.** Dokud se kolo neuzavře, nikdo nepadne dvakrát
  (a vylosovaní jsou v seznamu odškrtnutí). Po vyčerpání začne samo nové kolo —
  losování nikdy nezůstane stát. Bez téhle volby aspoň nepadne tentýž žák dvakrát za sebou.
  Losovat jde i víc žáků naráz (dvojice, trojice) — vylosovaní jsou vždy různí.
- **Okno pro třídu.** Tlačítko „🖵 Okno pro třídu“ otevře tutéž stránku
  s `?tabule=1`; ta schová celé ovládání a ukazuje jen to, co má vidět třída
  (čas s prstencem, jméno, kostky, semafor, skupiny, skóre). Posílá se přes
  `BroadcastChannel('metodus_ucitel_tabule')` a **vysílá vždy jen otevřený nástroj** —
  jinak by si časovač a losování přebíjely obrazovku. Nové okno se po načtení
  zeptá zprávou `{dotaz:true}` a kabinet mu pošle poslední stav. Čas se posílá jen
  při změně sekundy, ne každý snímek. `sw.js` proto při hledání v cache zkouší
  i `ignoreSearch` — jinak by stránka s parametrem offline spadla.
- **Displej nesmí zhasnout.** Když běží odpočet nebo svítí semafor, drží stránka
  `navigator.wakeLock`; po návratu na záložku si ho vezme znovu.
- **Kdo dnes chybí.** Klik na jméno v losování žáka označí absenci — vypadne
  z losování i z dělení do skupin. Absence je vedle seznamu třídy
  (`metodus_absence_v1`) a platí jen na dnešek, takže se jména nemusí mazat a dopisovat.
- **Záloha do souboru.** `⤓ Záloha` uloží třídy i týmy jako JSON, `⤒ Obnovit` je
  načte zpátky — localStorage je jen v jednom prohlížeči, doma i ve škole by se
  jinak seznamy psaly dvakrát.
- **Klávesy platí jen v části s nástroji.** V přípravě mezerník nic nespouští,
  aby se stránka dala normálně procházet.
- **Odkazy respektují rám.** Uvnitř rozcestníku se dlaždice otevírají v jeho
  pracovní ploše (`postMessage`), samostatně otevřená stránka odkazuje přímo.

- **Výběr délky časovač nespouští.** Předvolba (i vlastní počet minut) jen nastaví čas
  a tlačítko „Spustit“ začne pulsovat (`.btn.puls`, u `prefers-reduced-motion` místo
  animace obrys) — učitel pustí odpočet, až je třída připravená, ne když si vybírá délku.
- **Časovač počítá z hodin, ne přičítáním sekund.** Stav se v `requestAnimationFrame`
  smyčce dopočítává z `performance.now()`; `setInterval` v zabrané záložce zaostává
  a odpočet by lhal. Prstenec kolem číslic je SVG kružnice řízená `stroke-dashoffset`
  (u stopek ukazuje vteřiny v minutě). `+1 min` přičítá i do celku, jinak by prstenec přetekl.
- **Kostka umí víc než šestku.** Sady k4–k100 i vlastní rozsah, až deset kostek
  najednou se součtem, historie posledních dvanácti hodů a volitelná **paměť**:
  do vyčerpání kola padne každé číslo jen jednou (nad 200 čísel se paměť vypne,
  seznam by se nedal přečíst). Rozsah 1–6 se kreslí puntíky, ostatní číslicí.
  Nastavení i paměť drží `metodus_kostka_v1`.

- **Zvuk konce se plánuje dopředu.** Ve skryté záložce prohlížeč zastaví
  `requestAnimationFrame` a časovače přiškrtí; tóny naplánované do `AudioContextu`
  (`o.start(currentTime + zbývá)`) ale zazní přesně, takže konec času je slyšet,
  i když učitel mezitím přepnul do prezentace. Odpočet navíc jede kromě rAF
  i v `setInterval(500)`, který v pozadí běží dál.
- **Kostka i mince kreslí histogram.** Sloupečky četností (u víc kostek četnosti
  součtů) dělají z pomůcky pokus do pravděpodobnosti; jiný rozsah nebo počet kostek
  začíná nový pokus, nad 30 sloupečků se graf skryje.
- **Skupiny umí role a jmenovky.** Volitelně přidělí prvním členům role (mluvčí,
  zapisovatel, časoměřič, materiály) a `🏷 Jmenovky na lavice` je vytiskne
  po dvou na šířku (třída `tisk-jmenovky` přepne, co se tiskne).
- **Skóre se dá vzít zpět.** Překliknutí `+5` místo `+1` vrátí `↶ Vrátit bod`;
  zásobník změn se maže při vynulování, smazání týmů i obnovení ze zálohy.
- **Záložky jsou opravdové záložky.** `role="tablist"`/`tab`/`tabpanel`,
  `aria-selected` a přepínání šipkami; ve fullscreenu se řádek podzáložek
  přestěhuje dovnitř zvětšeného nástroje, takže se dá přepnout nástroj
  bez opuštění celé obrazovky (fullscreen převezme nový nástroj).

Časovač si zvuk skládá v `AudioContext` — žádný soubor navíc, funguje offline.
Skóre týmů a seznamy tříd zůstávají v `localStorage`, takže soutěž může běžet
přes několik hodin i dnů.

## Tvorba slidů a prezentace

`obsah/prezentace.html` skládá výklad ze slidů deseti druhů a promítá je na
plátno. Kromě editoru má **okno pro učitele**, **kvíz s vyhodnocením**,
**časovač úkolu** a tisk podkladů.

| Druh slidu | K čemu je |
|---|---|
| titulní | název hodiny a podtitul |
| text | nadpis a odrážky |
| dva sloupce | text vedle textu, nebo text vedle obrázku (dají se prohodit) |
| otázka | zadání; odpověď se odkryje až dalším posunem |
| kvíz | až šest možností, třída hádá, klik nebo klávesa `1`–`9` vyhodnotí |
| obrázek | z adresy, nebo soubor vložený přímo do prezentace |
| citát | velký text s podpisem autora |
| aplikace | **živá aplikace Metodusu** přímo ve slidu |
| časovač | velký odpočet pro samostatnou nebo skupinovou práci |
| tabule | prázdná plocha na kreslení při výkladu |

Na čem stránka stojí:

- **Jedno vykreslení pro všechno.** Náhled, miniatura v seznamu, promítané
  plátno, přehled slidů, okno pro učitele i miniatura v tisku prochází funkcí
  `vykresli`. Promítaný a vytištěný slide se proto nemůžou rozejít a nový druh
  slidu stačí přidat na jediném místě.
- **Pevné plátno 1280 px.** Slide má vždy stejné rozměry (720 px na výšku při
  16:9, 960 při 4:3) a teprve celý se škáluje do místa (`Projektor.vmestnej`).
  Kdyby se místo toho počítalo písmo podle okna, vypadala by příprava na
  projektoru jinak než na notebooku, kde vznikala — a učitel by to zjistil
  až ve třídě.
- **Živě běží jen promítaný slide.** Aplikace se vkládá do rámu jen na plátně;
  v seznamu, v přehledu a v tisku je místo ní zástupce. Dvacet současně
  běžících aplikací by z prohlížeče udělalo topení. Konec promítání rám
  vyprázdní, takže aplikace pod editorem dál neběží.
- **Text se nikdy nevkládá jako HTML.** Zápis zná jen odrážku (`- `),
  mezinadpis (`## `) a `**zvýraznění**`; všechno ostatní projde přes escape.
- **Zadání dřív než řešení.** Otázka i kvíz mají dva kroky (`odkryto`).
  U kvízu špatná volba zčervená a otázka běží dál, správná odkryje řešení
  i vysvětlení — vysvětlení se po chybě **neukáže**, jinak by si ho třída
  přečetla dřív, než dojde ke správné odpovědi.
- **Do podkladů se odpovědi netisknou.** Žák dostane prázdné pole, učitel si
  svou kopii vytiskne s volbou *Tisknout odpovědi a řešení kvízů*.

### Okno pro učitele

Tlačítko *Okno pro učitele* otevře druhé okno téže stránky (adresa s kotvou
`#prezenter`; kotva a ne parametr proto, že service worker má stránku v cache
pod čistou adresou a s parametrem by se okno offline nenačetlo). Na plátně
zůstane slide, na notebooku učitel vidí **poznámky, následující slide, hodiny
a čas od začátku hodiny** a může odtud prezentaci ovládat.

Obě okna spojuje `BroadcastChannel`; kde chybí, zaskočí událost `storage` —
obě cesty doručují jen do *ostatních* oken, takže se okno neposlouchá samo.
Zprávy mají pořadové číslo, jinak by v prohlížeči, kde fungují obě cesty,
přišel každý posun dvakrát. Kanálem chodí **jen pozice**, ne sada: prezentace
s vloženými obrázky má klidně megabajty a posílat je při každém posunu by
okno zadusilo. Okno pro učitele si sadu čte ze stejného `localStorage`.

### Ovládání při promítání

`→`/`mezerník` další, `←` zpět, `1`–`9` odpověď v kvízu, `B` černá, `W` bílá,
`O` přehled slidů, `P` pero, `Z` zpět poslední tah, `E` smazat kresbu,
`T` pozastavit časovač, `N` poznámky, `F` celá obrazovka, `Esc` konec.
Pero má tři tloušťky včetně poloprůhledného zvýrazňovače a kresba se drží
u slidu, ne u obrazovky. Ovládací lišta se sama schová, aby na plátně
nesvítila přes výklad.

Když učitel klikne do aplikace ve slidu, klávesy chytá rám. Přeposílají se
proto do stránky klávesy prezentačního klikátka (`PageUp`/`PageDown`) a `Esc` —
šipky a mezerník ne, ty v aplikaci patří tomu, kdo v ní zrovna něco ovládá.

### Sestavení z textu

Celou prezentaci lze nasypat jako text (`Sada → Sestavit z textu`) a stejně tak
zpátky vypsat — učitel má přípravu v textovém editoru a nemusí ji překlikávat:

```
# Pravěk            → titulní slide (další řádek je podtitul)
---                 → oddělovač slidů
## Doba kamenná     → slide s textem
- paleolit          → odrážka
> zeptat se na …    → poznámka pro učitele (na plátno se nedostane)
? Otázka   / = Odpověď
?? Kvíz    / + správná možnost / * špatná možnost
! adresa | popisek  → obrázek        " text | autor → citát
@ obsah/bunka.html | nadpis → aplikace
T 10 | zadání       → časovač na 10 minut      ___ → tabule
```

Převod tam i zpět zachovává druhy slidů, poznámky i správné odpovědi (hlídá
to test). Čtyři **šablony hodin** (výklad, opakování, skupinová práce, pokus)
jsou popsané stejným zápisem — jsou to jen texty, ne zvláštní kód.

### Další drobnosti, které se osvědčily

- Seznam slidů má miniatury (tentýž `vykresli`, jen zmenšený) a **přetahování myší**;
  `Alt`+`↑`/`↓` posune vybraný, `Ctrl`+`D` duplikuje, `Ctrl`+`Z` vrátí smazaný.
  Mazání se proto na nic neptá — potvrzovací otázka u každého slidu při skládání
  prezentace jen zdržuje.
- Obrázek se dá do slidu **přetáhnout myší**; zmenší se na 1600 px a uloží se
  přímo do prezentace, takže funguje i bez internetu.
- Zápis do `localStorage` má kvótu kolem 5 MB a přeteče typicky vložený obrázek.
  Selhání se **hlásí** — mlčet by znamenalo, že učitel přijde o přípravu, aniž
  by tušil proč.
- Podklady se tisknou po 3 (s linkami na poznámky žáka), 6, 2, nebo po jednom
  na stránku na šířku — poslední volba slouží k uložení prezentace do PDF.
  Arch je vždy bílý papír, i když je prezentace tmavá.

Sady se ukládají do `localStorage` (`metodus_prezentace_v1`) a dají se vyvézt
i načíst jako JSON — tak se příprava přenese na školní počítač.

Testy: `python3 _test/run.py slidy.html` (druhy slidů, textový zápis, kvíz,
časovač, okno pro učitele, vkládání obrázku a tisk).

## Motiv a záměrně tmavé stránky

Většina stránek linkuje `theme.js` a jde se zbytkem webu. Motivy se vybírají
z výklopného seznamu v hlavičce rozcestníku (nativní `<select id="temaVolba">`;
na úzké obrazovce se i s popiskem „Motiv“ přesune do nabídky „Další“). Seznam má
dvě skupiny: **Základní** (čitelnost – podle systému, tmavý, světlý, vysoký kontrast)
a **Tematické** (nálada – sépie, tmavá sépie, stará knihovna, škola, noční škola).
**Motiv mění jen barvy a textury pozadí, nikdy písmo** – hlídá to `tests/motivy.mjs`.

| Motiv | `data-theme` | `data-tone` | Vzhled |
|---|---|---|---|
| Tmavý (výchozí) | *(žádný)* | `dark` | `common.css` |
| Světlý | `light` | `light` | `common.css` |
| Podle systému | vykreslí `light` / *(žádný)* | podle zařízení | uloží se `auto`; `theme.js` vybere světlý/tmavý podle `prefers-color-scheme` a při změně systému přepne za běhu (`MetodusTheme.get()` vrací volbu, `rendered()` vykreslený motiv) |
| Vysoký kontrast | `kontrast` | `light` | `kontrast.css` – černá na bílé, text AAA (≥ 7 : 1), zřetelné okraje, podtržené odkazy v textu, výrazný fokus; pro projektor a slabší zrak, bez textur |
| Sépie | `sepia` | `light` | `sepia.css` – recyklovaný papír (`obsah/textures/recyklovany-papir.webp`, image_gen, zadání vedle) |
| Tmavá sépie | `sepia-tmava` | `dark` | `sepia-tmava.css` – tmavý hnědý papír se stejnou jemnou recyklovanou texturou a teplým inkoustem |
| Stará knihovna | `knihovna` | `dark` | `knihovna.css` – ořechové dřevo (`obsah/textures/knihovna-drevo.webp`, procedurálně z `knihovna-drevo.py`), starozlatý akcent |
| Škola | `skola` | `light` | `skola.css` – sešitový papír se čtverečkovou linkou (jen CSS přechod), modrý inkoust, červené opravy |
| Noční škola | `nocni-skola` | `dark` | `nocni-skola.css` – zelená tabule (`obsah/textures/tabule-krida.webp`, procedurálně z `tabule-krida.py`), křídově bílý text, žlutá křída |

Výchozí motiv pro nového návštěvníka zůstává tmavý.

**Úpravy stránek se řídí tónem, ne jménem motivu.** Kdo dorovnává barvy pro
světlé pozadí, píše `:root[data-tone="light"] …` a v JS
`MetodusTheme.isLight()` (případně `dataset.tone === 'light'`) — pak úprava
platí i pro sépii a nový motiv nevyžaduje zásah do stránek. `theme.js` nastaví
`data-tone` dřív než `data-theme`, takže `MutationObserver` nad `data-theme`
už čte nový tón. Jména motivů pro popisky dává `MetodusTheme.name()`.

**Pole formulářů** mají pozadí `var(--bg-input)`, nikdy `var(--border)` (ve vysokém
kontrastu je okraj tmavě šedý a text v poli by zanikl).

**Text na barevné výplni** (pozadí `var(--accent)`, `--ok`, `--warn`, `--danger`)
se píše `color: var(--na-akcentu, #fff)`, ne natvrdo bílou. Ve většině motivů je
`--na-akcentu` bílá; knihovna a noční škola mají světlé výplně (zlato, křída),
a tak tmavý inkoust.

Textury se na povrchy kladou jen jako `background-image` s režimem prolnutí
(sépie `multiply`, knihovna `overlay`) a **nikdy nepřepisují barvu pozadí**:
záměrně tmavé simulace (sluneční soustava, gravitační hřiště) tak zůstanou
tmavé i v sépii. Textura je jen na `body` a na prvcích, které mají vlastní
barvu pozadí — na průhledném prvku by se nakreslila „holá“ (v knihovně jako
šedé dřevo).

Čtyři stránky mají vlastní
tmavou paletu a `theme.js` **schválně nelinkují**:

| Stránka | Proč zůstává tmavá |
|---|---|
| `obsah/iss.html`, `obsah/planet_globe.html` | černé pozadí je samotný vesmír kolem tělesa |
| `obsah/AI_prednaska.html` | promítaná přednáška – tmavé plátno nesvítí do třídy |

Každá to říká komentářem ve své hlavičce. Kdo přidává další takovou stránku:
buď převezme motiv (`theme.js` + proměnné z `common.css`), nebo si přepíše
proměnné natvrdo a důvod napíše do hlavičky — polovičatý stav (světlé
proměnné a tmavé panely natvrdo) je to, co se opravovalo v etapě 04.

Stránka, která motiv sdílí, nesmí mít barvy zapsané natvrdo ani v plátně:
`obsah/eduSort.html` čte barvy sloupců i popisků z CSS proměnných a obnovuje
je přes `MutationObserver` nad `data-theme`, jinak by po přepnutí zůstaly
popisky nečitelné.

## Hlavička rozcestníku na mobilu

Na širokém zobrazení jsou akce v hlavičce vedle sebe jako ikony. Pod **700 px**
zůstanou v hlavičce jen ☰ menu, název, 🏠 úvod a nabídka **⋯ Další**; osnova,
kabinet, ukázky, motiv, projektor a nové okno se do ní přesunou — a to
přesunem prvků, ne kopií, takže si tlačítka nesou své posluchače i stav
(zvýrazněný projektor, ikona motivu). Zpátky do hlavičky je vrátí
`presunOvladani()` při změně šířky. Popisek u každé akce je ve zdroji stále
(`<span class="popis">`), v hlavičce ho jen skrývá CSS.

Nabídku otevírá Enter i mezerník, šipky v ní přecházejí mezi položkami,
Home/End skáčou na kraje, Esc ji zavře a vrátí fokus na tlačítko. Otevření
hlavního menu ☰ posune fokus do hledání a Esc ho vrátí zpět na ☰.

Ve filtrech je tlačítko **✕ Zrušit filtry**, které se objeví jen tehdy, když
nějaký filtr ubírá položky, a vypíše, co zruší (předmět, ročník, hledání,
skryté připravované). Bez něj nebylo na telefonu poznat, proč je vidět jen
část katalogu.

## Režim projektor

`projektor.js` zvětšuje obraz pro plátno nebo interaktivní tabuli. Zapíná se
v rozcestníku tlačítkem 📽️ (na telefonu v nabídce **⋯ Další**) nebo klávesou
**F8**: schová menu i hlavičku, požádá o celou obrazovku a nechá na obrazovce
jen plovoucí lištu (zvětšení −/+, výběr aplikace, celá obrazovka, konec).
Úroveň zvětšení si režim pamatuje (`metodus_projektor`). Odchod z celé
obrazovky ukončí i režim — v celé obrazovce totiž Esc spolkne prohlížeč
a bez toho by režim zůstal zapnutý bez zvětšení.

Zvětšuje se **rám, ne obsah v něm**: rámu se nastaví rozměr zmenšený
o zvolený násobek a `transform: scale()` ho vykreslí na celou plochu.
Stránka uvnitř tak vidí menší okno a rozloží se podle něj. Zkoušelo se
i `zoom` vložený do dokumentu v rámu — u stránek, které staví na `100vh`
(a takových je tu většina: plátna, mapy, glóbusy), se plocha zvětšila i na
výšku, stránka přetekla a začala rolovat. Cena škálování rámu je měkčí
plátno při velkém zvětšení; text a SVG se překreslují ostře.

Rám s aplikací má v `index.html` atribut `allowfullscreen` — bez něj prohlížeč
odmítne celou obrazovku vyžádanou stránkou uvnitř rámu (typicky promítání
z `prezentace.html`).

Testy učitelských stránek: `python3 _test/run.py ucitelske.html`
(kabinet, slidy, promítání, podklady k tisku a režim projektor).

## Stránka živých ukázek

`obsah/predstaveni.html` je stránka, kterou se Metodus ukazuje kolegům, rodičům
nebo na projektoru. Neříká, co web umí — **nechá to vyzkoušet**: sedm zkrácených,
ale plně funkčních aplikací pod sebou.

| Ukázka | Co se v ní dá dělat | Předloha |
|---|---|---|
| Gravitační hřiště | tažením vystřelit planetku s předpovědí dráhy, zapnout gravitační pole a vektory, sledovat elipsu, dobu oběhu a výstřednost | `gravitacni_hriste.html` |
| Periodická tabulka | všech 118 prvků, klik dopočítá konfiguraci a rozběhne Bohrův model | `periodic_table.html` |
| Aerodynamický tunel | táhnout překážku proudem, měnit velikost a rychlost větru | `vitr_tunel.html` |
| Stavba buňky | klikat na části v modelu rostlinné buňky nebo v seznamu, sledovat, kolik částí už je prohlédnutých | `bunka.html` (atlas 1:1 – model, obrysy i popisky) |
| Kvadratická funkce | jezdci měnit a, b, c, sledovat vrchol, kořeny a diskriminant | `grafy_funkci.html` |
| Procvičování | odpovídat na 34 úloh z 11 předmětů s kartičkou „proč“ | jádro `uloha.js` |
| Generátor testů | složit a vytisknout list podle ročníku, tématu a obtížnosti | `pracovni_listy.html` |

Stránka **záměrně neodkazuje nikam** — ani na plné verze aplikací, ani do
rozcestníku Metodusu, ani na nadřazený web. Je to čistě ukázka: každá karta
nese štítek *Ukázková verze* a pořadí (`3 / 7`) a nic neodvádí pozornost pryč.
Jediné, co se podle prostředí liší, jsou čísla v hlavičce — berou se z `apps.js`
a bez katalogu se blok odstraní.

Kolem ukázek je pak to, co potřebují ostatní dvě publika: pás **pro školu**
(bez instalace, uložené lekce offline, místní ukládání výsledků, podle osnovy ZŠ) pro toho,
kdo o nasazení rozhoduje — mluví **jen o provozu, ne o ceně a účtech**, aby si
web nechal otevřené dveře k případné monetizaci, a **lepivá lišta ukázek** pro toho, kdo stránku
promítá — skáče se s ní mezi ukázkami a zvýrazněná položka říká, kde v pořadí
zrovna jsme. V hlavičce se kreslí síť uzlů (značka Metodusu je uzel); je to jen
kulisa pod obsahem, která se při `prefers-reduced-motion` nakreslí jednou
a zůstane stát.

Pravidla, kterými se stránka řídí:

- **Soběstačnost.** Stránka je **jediný soubor bez jediné vnější závislosti** —
  pošle se mailem, nahraje kamkoli a funguje. Má vlastní kopii palety
  z `common.css`, vlastní přepínač motivu i vlastní vyhodnocení odpovědí; sdílené
  `podpis.js` a `apps.js` jsou v ní jen jako doplněk (bez nich zmizí čísla
  v hlavičce a podpis si stránka dopíše do patičky sama). Model buňky je proto
  vložený rovnou v souboru jako `data:` URI.

  Ukázka buňky je převzatá z `bunka.html` beze změny, včetně obrysů částí, aby
  neukazovala zastaralé schéma — jen z ní zůstala **rostlinná buňka** (plná verze
  má i živočišnou a jejich srovnání). Když se model v `bunka.html` změní, je
  potřeba data URI vyrobit znovu; postup je v komentáři u ukázky v souboru:

  ```bash
  magick Prirodopis/bunka_rostlinna.png -dither None -colors 96 /tmp/b.png
  cwebp -lossless -z 9 -m 6 /tmp/b.png -o /tmp/b.webp && base64 -w0 /tmp/b.webp
  ```

  Bezztrátový WebP z 96 barev je vizuálně shodný s originálem a v base64 zabere
  145 kB místo 256 kB z původního PNG. Cena soběstačnosti: stránka má 284 kB.
- **Nasazuje se i mimo tenhle web.** Soběstačnost není samoúčelná: stránka běží
  ještě jednou ve vlastním repozitáři a vlastním GitHub Pages, aby návštěvník,
  který si v adresním řádku odmaže cestu, neskončil v Metodusu a na hlavním webu.
  Zdrojem zůstává tenhle soubor; kopii vyrábí skript ve složce
  `../metodus-ukazka/` (vedle repozitáře webu) – po každé úpravě ukázky je
  potřeba ho spustit, jinak se verze rozejdou. Podrobnosti v jeho `README.md`.
- **Vlastní motiv.** Jako jediná stránka Metodusu startuje ve **světlém** režimu –
  promítá se a ukazuje. `theme.js` proto nelinkuje (srovnával by ji se zbytkem
  webu) a volbu si pamatuje pod vlastním klíčem `metodus_ukazky_tema`; přepnutí
  tady nepřeklopí celý Metodus ani naopak. Výchozí `data-theme="light"` je rovnou
  v `<html>`, aby při načtení neproblesklo tmavé pozadí.
- **Tři režimy podle katalogu.** Podle toho, jestli se povedlo načíst `apps.js`,
  se stránka chová jako podstránka rozcestníku (volba se posílá rodiči přes
  `postMessage`), jako samostatně otevřená stránka Metodusu (odkazy na
  `../index.html#soubor`), nebo jako osamocený soubor — pak se odkazy do Metodusu,
  čísla katalogu i podpisový pruh nahradí tím, co dává smysl bez zbytku webu.
- **Data se neopisují.** Prvky, výpočet elektronové konfigurace, popisky organel
  i banky úloh generátoru jsou převzaté ze zdrojů plných verzí, aby ukázka
  neříkala něco jiného než aplikace, kterou má představit. Výjimkou je schéma
  buňky: to je nakreslené znovu (plná verze stojí na fotografii `Anatomy/Cell.png`,
  a 1,2 MB obrázku by ze stránky udělalo něco, co se nedá poslat jako jeden soubor).
  Kresba drží vlastní barvy nezávisle na motivu — organely mají v učebnicích
  ustálené barvy a na tmavém podkladu by ztratily kontrast.
- **Předpověď kreslí totéž, co pak poletí.** Dráha při míření se v gravitačním
  hřišti dopočítává **stejným leapfrogem** jako běžící simulace, dopředu do
  prvního oběhu, pádu do hvězdy nebo úniku z plátna; barva rovnou říká výsledek
  (zelená / červená / oranžová). Kdyby předpověď byla vlastní aproximace,
  ukázka by lhala. Gravitace samotná se dá **přikreslit** tlačítkem *Ukázat
  gravitaci* (výchozí je vypnutá, ať je v prázdném vesmíru vidět hlavně dráha):
  mřížka šipek k hvězdě s délkou podle 1/r² a u každé planetky žlutý vektor síly
  se zeleným vektorem rychlosti. Na fyziku přepínač nesahá, ta běží pořád.
- **Běží jen to, co je vidět.** Každé plátno má vlastní `IntersectionObserver`;
  šest současně běžících animací by jinak zbytečně vytěžovalo notebook i tablet.

Pasti, na které se při psaní narazilo:

1. `grid-template-columns: 1fr` u sloupce s periodickou tabulkou se na mobilu
   roztáhl na šířku mřížky (580 px), vodorovný posuv uvnitř neměl co posouvat
   a tabulka se jen oříznula. Správně je **`minmax(0, 1fr)`** plus `min-width: 0`
   na položkách mřížky.
2. Duhová škála rychlosti (modrá → zelená → červená) v tunelu udělala ze
   **zeleného** volného proudu vizuální šum. Škála je proto zakotvená v rychlosti
   větru (modrá) a teprve zrychlení hoří do oranžova; ve světlém režimu má
   vlastní, tmavší sadu, jinak na bílém papíře zmizí.
3. Graf funkce musí **posunout výřez za vrcholem** — u malého `a` nebo velkého
   `c` leží vrchol mimo plátno a jezdec pak vypadá, že nic nedělá.
4. Skok z lišty musel dostat **vlastní obsluhu**: samotné `scroll-margin-top`
   nestačilo, protože `scrollIntoView` na zvýrazněné položce lepivé lišty
   dorovnával i svislé rolování a hlavička karty skončila schovaná pod lištou.
   Lištou se proto posouvá jen vodorovně a stránka se roluje ručně.
5. Míchaný list (*Mix témat ročníku*) nesmí být jen seznam úloh: u zadání jako
   „hustota →“ nebylo poznat, co se má dělat. Vybere se proto **pár témat**
   (zhruba jedno na čtyři úlohy, ne celý ročník) a úlohy se sázejí **po oddílech**
   s pokynem nad každým z nich; číslování běží přes celý list.
6. Linka na odpověď patří jen k úlohám, kde se odpovídá **za** zadání.
   Doplňovačky (vyjmenovaná slova, bě/pě/vě/mě) se vyplňují přímo ve slově —
   generátor je proto značí `vText: true` a linka se u nich vynechá; stejně tak
   u zadání, které si místo udělalo samo („značka ____, jednotka ____“).
7. Arch generátoru testů je jako v plné verzi **vždycky bílý papír**, takže
   uvnitř `.list` schválně nejsou proměnné motivu; ve světlém režimu by se
   jinak linky na jméno a čísla úloh slily s papírem.
8. Tisk schovává obsah pravidlem **„všechno kromě archu“**
   (`body > *:not(.obal)`, `.obal > *:not(#test)`), ne výčtem konkrétních
   prvků — ten se rozešel s obsahem, jakmile stránka dostala pás pro školu
   a lištu ukázek, a ty pak vyjely na papír nad arch. `@page { margin: 14mm }`
   musí být **mimo** `@media print`; vnořené `@page` Chrome zahodí a arch
   doléhá na ořezovou hranu.

## Psaní nové procvičovací aplikace

Stránka vystačí s krátkou kostrou – styly řeší `vyuka.css`, chování odpovědí `uloha.js`:

```html
<link rel="stylesheet" href="../common.css">
<link rel="stylesheet" href="../vyuka.css">
<script src="../theme.js"></script>
<script src="../podpis.js" defer></script>
<script src="../rec.js"></script>
<script src="../uloha.js"></script>
```
```js
const skore = Uloha.skore('metodus_muj_klic', document.getElementById('skore'));
Uloha.vyber({
  kam: plocha, odezva, moznosti: [{ klic: 'a', ikona: '🌷', popis: 'jaro' }, …],
  spravnyKlic: 'a', zpravaOk: '✅ …', poSpravne: skore.vyhodnot, dalsi: novaUloha,
});
```

K dispozici jsou i `Uloha.zamichej`, `Uloha.nahodne`, `Uloha.nahodneCislo` a `Uloha.trhni`
(pro vlastní úlohy typu klikání do obrázku nebo řazení do pořadí).

Volitelné pole `prodleva` říká, za jak dlouho se nabídne další otázka. Smí to být
i funkce `(napoprve) => ms` — stránky, které po odpovědi ukazují kartičku
s vysvětlením, potřebují delší pauzu, a po chybě ještě delší, protože právě
tehdy si má žák vysvětlení přečíst. Bez pole platí `Uloha.PRODLEVA` (900 ms).

## Posun na další otázku

Jak dlouho se po odpovědi čeká, si řídí **uživatel** — každý čte kartičku
„proč“ jinak rychle. Volba je jediná pro celý Metodus (`metodus_posun`
v `localStorage`) a `uloha.js` si k ní sám vloží přepínač do lišty `.ovladani`
každé procvičovací stránky; do stránek se kvůli tomu nesahá.

| Volba | Co dělá |
|---|---|
| automaticky – normálně / déle / hodně dlouho | pauzu, kterou si spočítala stránka, **násobí** 1× / 1,8× / 3× |
| ručně | místo časovače se pod kartičku vloží tlačítko **Pokračovat →** |

Násobek (a ne pevný počet vteřin) je zvolený schválně: zachová poměr mezi
krátkým „✅ Správně“ a rozborem souvětí, takže si stránky dál řídí vlastní
tempo a nastavení jen posune celou škálu.

Nové stránky nemusí dělat nic — stačí `dalsi` v `Uloha.odpoved`. Kdo si posun
plánuje sám (například po druhé chybě), volá místo `setTimeout(novaUloha, ms)`
funkci **`Uloha.posun(novaUloha, ms)`**; jinak by na takové stránce volba
neplatila.

Naplánovaný posun je **jen jeden a dá se zrušit**. `Uloha.vyber` ho ruší sám,
takže přeskočení, změna režimu i tlačítko „Pokračovat" zahodí časovač předchozí
otázky — bez toho doběhl a přehodil žákovi otázku, kterou právě dostal.
Stránka, která staví otázku mimo `Uloha.vyber`, si zruší posun sama přes
**`Uloha.zrusPosun()`**; `Uloha.cekaPosun()` řekne, jestli se na něco čeká.
Přepnutí tempa nebo režimu během čekání se přepočítá hned — přechod na „ručně"
tedy nabídne tlačítko místo toho, aby dojel starý časovač.

## Vzorová lekce: co má obsahovat

`obsah/m4_zlomky_uvod.html` je vzor, podle kterého se předělávají další lekce.
Kostra je pořád stejná (`vyuka.css`), přibývají k ní čtyři věci:

1. **Cíl nad ovladači** v bloku `.cil`: jedna věta „Po této lekci dokážu…",
   ročník, odhad času, odkaz na dovednost, která se hodí předtím, a
   `<details>` se scénářem pro učitele na 5 / 15 / 45 minut.
2. **Vedený příklad** jako první režim: pár kroků, které z obrázku postupně
   přečtou zadání (u zlomků nejdřív jmenovatel, pak čitatel) a v zápisu vždy
   rozsvítí tu část, o které je řeč. Kroky posouvá tlačítko, ne časovač —
   tempo drží žák. Poslední krok vede rovnou do procvičování.
3. **Víc pohledů na tutéž věc se stejně velkým celkem.** Koláč, proužek
   i číselná osa mají stejný `viewBox` i šířku, střídají se po řadě a po
   správné odpovědi se ukážou pohromadě. Bez stejně velkého celku obrázky
   neukazují tentýž zlomek, ale tři nesouvisející obrázky.
4. **Blok `.navaznosti`** na konci: „Nejdřív potřebuji / Pokračuj na / Později".
   Odkazy se značí `data-lekce` a otevírá je rozcestník ve své ploše
   (`postMessage({otevri})`), aby lekce nevypadla z rámu.

**Chyba má pojmenovat záměnu.** `zpravaChyba` v `Uloha.vyber` smí být funkce,
která dostane klíč zvolené možnosti — lekce tak odpoví „máš prohozený zápis"
místo „zkus jinou možnost". Aby bylo co pojmenovat, obsahuje nabídka typické
záměny (u zlomků: nevybarvené díly, prohozený zápis, o jedna vedle).

**Čeština generovaných vět** se kontroluje včetně tvarů: „jedna čtvrtina",
„dvě třetiny", „pět šestin", „1 díl / 2 díly / 5 dílů". Pomocné funkce jsou
zatím v lekci (`slovyZlomek`, `tvar`); kdo je bude potřebovat jinde, přesune
je do sdíleného souboru.

**Obrázek, na který se klepe, musí jít ovládat i klávesnicí.** Díly koláče
jsou `role="button"` s `tabindex`, `aria-pressed` a přístupným názvem; šipky
mezi nimi přecházejí, mezerník vybarvuje a zaostřený díl má silnější obrys.
Šipky i Enter je potřeba zastavit (`stopPropagation`), jinak je spolkne
klávesová zkratka stránky pro „další otázku".

## Zpětná vazba, klávesnice a pohyb

Tohle všechno řeší `uloha.js` a `vyuka.css` společně pro všechny procvičovací
stránky; do jednotlivých souborů se kvůli tomu nesahá:

- **Odečítač obrazovky.** Prvek `.odezva` dostává `role="status"` a
  `aria-live="polite"`, i když ho stránka staví ke každé otázce znovu (hlídá
  `MutationObserver`). Zpětná vazba tak není jen vidět, ale i slyšet.
- **Enter patří odpovědi.** Většina stránek má na Enter navázané „další
  otázka". Když je fokus na možnosti, na prvku pořadí nebo na „Pokračovat",
  `uloha.js` klávesu zastaví v záchytné fázi, takže odpověď opravdu odejde
  a stránka místo ní nevygeneruje novou otázku.
- **Viditelný fokus.** Prstenec `:focus-visible` mají možnosti, pořadí,
  režimy, lišta ovládání i doplňovací pole. Do polí nepatří `outline: none` —
  právě to fokus dřív schovávalo.
- **Omezení pohybu.** Při `prefers-reduced-motion: reduce` se vypne zaklepání
  u chyby i přechody tlačítek. Chyba zůstane poznat podle barvy a textu.
- **Přeskočit ≠ odpověď.** Tlačítko `#btnDalsi` s textem „Přeskočit →" dostane
  popis „Přejde na jinou otázku. Tahle se nezapočítá do skóre." Kontroluje se
  u každé otázky, protože stránky text tlačítka mění podle režimu.

## Pravopisné a mluvnické stránky

Stránky o pravopisu (`doplnovacky`, `vyjmenovana_slova`, `shoda_podmetu`,
`diktat_gen`, `cj2_tvrde_mekke`, `cj3_parove`, `cj2_abeceda`) a celá skupina
**Tvarosloví & skladba** (`cj2_druhy_vet`, `slovni_druhy`, `cj3_slovesa`,
`cj3_podstatna`, `cj4_pady`, `synonyma_antonyma`, `cj4_stavba_slova`,
`cj5_pridavna`, `cj5_skladebni_dvojice`, `cj5_zajmena_cislovky`, `vetny_rozbor`,
`cj6_slovni_zasoba`, `cj7_rozvijejici`, `cj7_neohebne`, `cj7_slovotvorba`,
`cj8_souveti`, `cj9_vyvoj_jazyka`), skupina **Čtení & literatura**
(`slabiky`, `cteni_s_porozumenim`, `cj6_baje`, `cj9_literatura_20`,
`literarni_smery`) a **Sloh a komunikace** (`cj4_prima_rec`, `cj8_sloh`)
drží stejný postup, aby se dítě neučilo pokaždé nové ovládání.
Díly na to jsou ve `vyuka.css`:

| Třída | K čemu je |
|---|---|
| `.veta-uloha` | věta nebo slovo s vynechaným písmenem; `.mezera.prazdna` je prázdné místo, `.mezera.doplneno` už doplněné |
| `.spoust` | písmeno, **podle kterého se pravopis rozhoduje** (obojetná souhláska, souhláska před i/y) – svítí žlutě už v zadání |
| `.podmet`, `.slovo-klik` | podtržený podmět a klikací slova ve větě (tečkovaná linka je vidět i na dotykovém displeji, kde není hover) |
| `.pravidlo` | kartička **proč** – ukáže se až po odpovědi (`.ok`), nebo na vyžádání jako nápověda (`.tip`) |
| `.rada` | pás vyjmenovaných slov; `span.sviti` rozsvítí to, o které v úloze šlo |
| `.pomucka` | trvalý přehled pod úlohou (souhlásky, páry, rody, abeceda); `.znak.sviti` rozsvítí právě probírané místo |
| `.klavesy`, `kbd` | klávesové zkratky vypsané u úlohy, ne až v patičce |
| `.pruh` | ukazatel postupu série |

Pravidla, která z toho plynou:

1. **Kde se rozhoduje, musí být vidět předem** (`.spoust`, podtržený podmět),
   **proč to tak je, až potom** (`.pravidlo.ok`). Kartička s pravidlem se nikdy
   neukazuje dřív než odpověď – jinak není co procvičovat.
2. **Nápověda zužuje, neprozrazuje.** Ukáže řadu, ve které se má hledat, rozsvítí
   souhlásku v přehledu, ztlumí polovinu možností — správnou odpověď neřekne.
3. **Chyba nezavírá úlohu.** Špatná možnost zaklepe a zčervená, otázka běží dál
   (řeší `uloha.js`); do skóre se počítá jen odpověď napoprvé.
4. **Přehled pod úlohou žije.** Souhláska, pár, rod, vzor nebo druh se v něm po
   odpovědi rozsvítí — přehled tak není jen text, ale ukazuje, kam probíraný jev patří.
5. **Odpověď se vysvětlí, ne jen potvrdí.** Po správné odpovědi přibude
   `.pravidlo.ok` s celým rozborem (mluvnické určení, schéma souvětí, stavba slova)
   a s větou, *proč* to tak je. Kvůli tomu má stránka delší `prodleva`
   (zhruba 2 s napoprvé, 3 s po chybě) — jinak kartička zmizí dřív, než se přečte.
6. **Nápověda je v `#btnNapoveda` a na klávese `H`.** Vloží `.pravidlo.tip`
   s postupem („na co se zeptej“) a ztlumí polovinu špatných možností. Sérii
   správných odpovědí napoprvé ukazuje `.ovladani .serie` (🔥 od tří).

## Zpracování připravovaného tématu

Momentálně žádné připravované téma v katalogu není, ale mechanika zůstává pro
další rozšiřování osnovy. Placeholder stránka popisuje, co má aplikace umět,
a cituje očekávaný výstup RVP. Až téma zpracuješ:

1. Přepiš `obsah/<slug>.html` na skutečnou aplikaci
   (v `<head>` nalinkovat `../common.css`, `../theme.js` a `../podpis.js`).
2. V `apps.js` u položky **smaž pole `stav`** — tím zmizí značka 🚧 z menu
   a téma se v osnově přepne na hotové.
3. Zvyš verzi cache v `sw.js` (`metodus-vN`), jinak návštěvníci uvidí novinku
   až při druhém načtení.

## Přidání nového tématu

Záznam do příslušné sekce v `apps.js` (`soubor`, `nazev`, `tagy`, `predmet`,
`rocniky`, případně `stav: 'plan'`) a odpovídající stránka v `obsah/`.

## Vrtačka a lis

`obsah/vrtacka_lis.html` ukazuje dva stroje z dílny a síly, které v nich působí —
na jedné stránce, ve dvou záložkách. Obě scény se kreslí do virtuálního plátna
1000 × 700 a do plochy se jen zvětší, takže drží proporce i na mobilu.

- **Vrtačka** počítá z měrné řezné síly materiálu `kc`: řeznou rychlost
  v<sub>c</sub> = π·d·n/1000, krouticí moment M<sub>k</sub> = kc·f·d²/8000,
  přítlačnou sílu F<sub>f</sub> = 0,25·kc·f·d a z nich výkon a čas provrtání.
  Proto sedí i to, co učebnice říká slovy: dvakrát tlustší vrták potřebuje
  čtyřikrát větší moment a nerez se vrtá desetkrát pomaleji než dřevo.
  Tlačítko *Doporučené otáčky* dopočítá `n` na 75 % horní meze pásma materiálu —
  test hlídá, že výsledek u všech pěti materiálů opravdu do pásma padne.
- **Hydraulický lis** stojí na Pascalově zákonu: p = F₁/S₁ a F₂ = p·S₂.
  Zdvih velkého pístu h₂ = h₁·S₁/S₂ z toho plyne, takže zlaté pravidlo
  mechaniky není nakreslené „pro ilustraci" — počet zdvihů pákou, o který se
  scéna opírá, z něj vychází (`potreba = (mezera + dráha) / h₂`).

Kresba drží dvě věci, které se nesmí rozejít:

- **Geometrie lisu se počítá, nekreslí od oka.** Výchozí poloha velkého pístu
  `PIST0` se skládá zpětně z traverzy, mezery `MEZERA · PMM`, výšky předmětu,
  desky a pístnice. Když se změní mezera nebo měřítko, mezera na obrazovce
  odpovídá dál — jinak by displej hlásil dotyk, který v kresbě není.
- **Stroje mají vlastní kovové barvy** (`KOV`) nezávislé na motivu. S barvami
  z `common.css` se ve světlém režimu rám lisu slil s podkladem. Text, šipky
  a stavový řádek si barvu z motivu berou dál.

Jediná vědomá úleva oku: čím víc zdvihů práce potřebuje, tím rychleji se pumpuje
(`doba = 8 / potreba`, nejvýš 0,35 s a nejméně 0,04 s na zdvih), aby lisování
netrvalo minuty. Počet zdvihů, dráhy i práce zůstávají skutečné — zrychluje se
jen kreslení ruky na páce.

Přepínače *Síly*, *Moment / tlak*, *Práce a dráhy* a *Čísla u šipek* jsou
společné pro obě scény, takže se stejná stránka dá pustit jako holá animace
i jako plně popsané schéma. Úkoly (🎯) se **nevyhodnocují tlačítkem** — zadání
se kontroluje průběžně podle toho, jak jsou stroje nastavené, takže žák vidí
odezvu už při tažení posuvníku.

Testy: `python3 _test/run.py vrtacka_lis.html` (vzorce, vrtání skrz, hlášky,
lisování s dostatečnou i nedostatečnou silou, úkoly a přepínače zobrazení),
`vl_uzky.html` (okno 420 px) a `vl_snimky.html`, který uloží snímky obou scén
do `_test/vl_*.png` — kresbu je potřeba kontrolovat okem.

## Proudové motory

`obsah/proudove_motory.html` ukazuje v řezu osm druhů motorů (turbo-jet,
turbo-fan, turbo-prop, turbo-shaft, ram-jet, scramjet, raketový motor a
průmyslovou plynovou turbínu) a nechá jimi protékat vzduch. Stojí na dvou
věcech, které se nesmí rozejít:

- **Geometrie.** Každý motor je pár kanálů popsaných klíčovými body
  `[x, vnější poloměr, vnitřní poloměr]`; kreslí se horní polovina a zrcadlí
  se dolů. `hranice` říká, kudy vede stěna, `vypln` (jen dvouproudový motor)
  kudy sahá výplň kanálu před rozdělovačem a `stenaIn` kde se kreslí
  rozdělovač proudů. Body za `hranice` slouží jen vlečce za tryskou.
- **Fyzika.** Tlaky a teploty počítá Braytonův cyklus z tlakového poměru
  kompresoru, teploty před turbínou a náporu (`ramT`, `ramP`) — proto čísla
  v měřicím panelu odpovídají skutečným motorům a proto ram-jet pod M 0,8 sám
  hlásí, že nemá tah. Rychlost proudu se **nekreslí od oka**: plyne z rovnice
  kontinuity `v ~ T / (p · A)`, takže se proud sám zrychlí v trysce a zpomalí
  v širokém sání. Ze stejného vzorce žije i graf pod motorem.

Dvě vědomé úlevy oku: teplota a tlak mají škálu společnou pro všechny motory
(jinak by 1 400 K výtok rakety vypadal stejně žhavě jako komora turbo-jetu) a
rychlost částic se násobí `stav.zisk`, protože turbovrtulový motor má výtok
130 m/s a proudový 900 — bez srovnání by jeden stál a druhý mihotal. Naměřená
čísla v panelu zůstávají skutečná.

Testy: `python3 _test/run.py motory.html` (cyklus, proudění a vykreslení všech
osmi motorů), `motory_paticka.html` (úzké okno 420 px) a `motory_snimky.html`,
který uloží snímek každého motoru do `_test/motor_*.png` — geometrii je potřeba
kontrolovat okem.

## Psací písmo

Ve složce `fonty/` je **Playwrite CZ** – česká varianta školní psací abecedy
(OFL, plná diakritika, 68 kB). `common.css` ho deklaruje jako `--font-psaci`,
takže stránka jen napíše:

```css
.pismenko { font-family: var(--font-psaci); line-height: 1.9; }
```

Soubor se stáhne až ve chvíli, kdy ho stránka opravdu použije; v `sw.js` je
v `JADRO`, takže funguje i offline. Vysoký řádek není zbytečnost – psací tvary
mají nahoře kličku a dole smyčku a při `line-height: 1` lezou z rámce ven.

Zatím ho používá `obsah/cj1_pismena.html` (úloha *Velké a malé*), kde si dítě
přepne mezi tiskacím a psacím písmem; volba se pamatuje v `localStorage`.

## Čtení nahlas

Stránky s procvičováním umí předříkat zadání přes Web Speech API. Volá se přes
sdílený `rec.js`, nikdy ne přímo `speechSynthesis` – samotné `'speechSynthesis'
in window` je totiž pravda i v prohlížeči bez jediného nainstalovaného hlasu
a řeč se pak „přehraje“ do ticha.

```html
<script src="../rec.js"></script>
```
```js
Rec.mluv('máma', { rychlost: 0.8 });          // vrací false, když hlas chybí
Rec.hlidejTlacitko(document.getElementById('btnCist'));
Rec.poznamkaOHlasu(rodicovskyPrvek);          // vysvětlivka, když hlas chybí
```

Pořadí je dané: **systémový hlas** (zní nejlíp), a když žádný pro daný jazyk
není, sáhne se po **vestavěném hlasu** ve složce `hlas/` (meSpeak = eSpeak
v JavaScriptu). Web tak mluví i na počítači bez jediného nainstalovaného hlasu –
typicky na Linuxu, kde `speech-dispatcher` bez syntetizéru hlásí jen modul `dummy`.

Vestavěný hlas se stahuje **až při prvním přehrání** (jádro 1,5 MB, gzipem asi
0,5 MB), pak si ho service worker drží v cache a funguje i offline. Zní strojově;
hezčí je systémový hlas (na Linuxu `sudo pacman -S espeak-ng`, ověření
`spd-say -l cs "ahoj"`, pak restart prohlížeče).

Podporované jazyky vestavěného hlasu: čeština, angličtina, němčina, francouzština
(přidání dalšího popisuje `hlas/LICENCE.md`).

## Samostatný web, žádná vazba ven

Metodus je od září 2026 **vlastní repozitář a vlastní GitHub Pages**
(`Lavionus/metodus` → <https://lavionus.github.io/metodus/>), ne podsložka
hlavního webu. Důvod je jediný: kdo dostane odkaz sem, nesmí se odmazáváním
adresy v prohlížeči dostat na hlavní web — a naopak. Proto:

- **žádná stránka Metodusu neodkazuje ven** (nic nevede na `../` ani `../../`),
- **hlavní web neodkazuje na Metodus** — ani z menu, ani přesměrováním starých
  odkazů; co si od Metodusu půjčoval (textury Země pro glóbus s počasím,
  stránku s historickými mapami), má dnes ve vlastní kopii.

Ukázková stránka `obsah/predstaveni.html` je nasazená ještě jednou, ve třetím
repozitáři `Lavionus/metodus-ukazka` — ze stejného důvodu. Zdrojem zůstává
soubor tady; kopii vyrábí `../metodus-ukazka/aktualizuj.sh`.

Nahrávání všech tří webů naráz obstará `upload.sh` v repozitáři hlavního webu
(ukázku si před nahráním vyrobí ze zdroje sám).

## Vývoj a nasazení

```bash
python3 -m http.server 8000     # z téhle složky, pak http://localhost:8000/
```

Nahrávání dělá `upload.sh` v repozitáři hlavního webu — spouští se jednou
a nahraje hlavní web, Metodus i ukázkovou stránku.

Testovat vždy přes lokální server — otevření přes `file://` blokuje CORS
(textury, fetch, moduly).

Postupné opravy podle [auditu všech stránek](AUDIT_VYUKY_2026-09-16.md) vede
[ETAPY_VYLEPSENI.md](ETAPY_VYLEPSENI.md); zálohy původních souborů a snímky
z ověření leží v `docs/`. Regresní kontroly ve složce `tests/` se spouští proti
místnímu serveru a Chromiu s laděním po CDP:

```bash
python3 -m http.server 8766 --bind 127.0.0.1
chromium --headless=new --remote-debugging-port=9223 --user-data-dir=/tmp/metodus-profil about:blank
node tests/etapa01-browser.mjs    # obsahové opravy pH, nepřímé řeči, válce a symbolů
node tests/etapa02-iss.mjs        # ISS: živá data, výpadek, návrat spojení, start bez sítě
node tests/etapa02-stranky.mjs    # odkazy, kotvy, šířky a motivy stránek etapy 02
node tests/etapa03-navigace.mjs   # mobilní hlavička, nabídka Další, klávesnice, zrušení filtrů
node tests/etapa04-vzhled.mjs     # soulad s motivem a kontrast textu na starších stránkách
node tests/motivy.mjs             # motivy: výklopný seznam, podle systému, tón, tmavé simulace, textury, kontrast (AAA u kontrastu), stejné písmo
node tests/etapa05-odpoved.mjs    # rušení posunu, živá odezva, klávesnice, omezení pohybu
node tests/etapa06-zlomky.mjs     # vzorová lekce: cíl, vedený příklad, tři obrázky, klávesnice
```

Testy používají vlastní profil prohlížeče, aby nepřepisovaly žákovské skóre;
test ISS nahrazuje datovou službu stubem, takže nevolá `wheretheiss.at`.
Obcházejí také servisního workera a HTTP cache — jinak by četly starou verzi
stránky z `metodus-vN` a kontrolovaly by nasazený web místo pracovní kopie.
