# Metodus: podklad pro vylepšování stránek

Datum: 22. 9. 2026. Podklad: aktuální lokální kopie webu (katalog `apps.js`, všech 261 HTML stránek), [audit z 16. 9.](AUDIT_VYUKY_2026-09-16.md) a [etapy vylepšování](ETAPY_VYLEPSENI.md) včetně hotových etap 01–08.

## K čemu dokument slouží

Pracovní karta ke každé stránce: kam patří, co na ní je, co umí, co se má žák naučit, jak ji udělat interaktivnější a názornější a jaké obrázky potřebuje. Druhým cílem je, aby stránky **dohromady působily jako jeden celek**, ne jako slepenec. Proto oddíly 1–4 popisují společný rámec a karty se na něj odkazují.

Vztah k existujícím dokumentům:

- **Audit** hledá chyby a určuje priority P0–P2. Tady se nálezy auditu neopakují, pokud nejsou potřeba k pochopení návrhu. Hotové opravy z etap 01–08 se berou jako výchozí stav.
- **Etapy** jsou plán práce po malých balíčcích. Karty z tohoto dokumentu mohou sloužit jako zadání jednotlivých balíčků 09–80.
- Tento dokument popisuje **cílový stav** stránky a **potřebné podklady**. Není to seznam provedených změn.

Jak číst kartu:

| Pole | Obsah |
|---|---|
| **Zařazení** | skupina › sekce katalogu · ročníky · typ stránky podle oddílu 1 |
| **Popis** | co stránka je a jak vypadá |
| **Funkčnost** | režimy a ovládání, jak jsou dnes |
| **Cíl výuky** | co má žák po práci se stránkou umět (formulováno jako „Žák dokáže…“) |
| **Vylepšení** | konkrétní návrhy; 🔗 označuje návrh pro jednotu webu, 🧩 sdílenou komponentu z oddílu 3 |
| **Obrázky** | co je potřeba vyrobit nebo sehnat; ID odkazuje do [přílohy A](#příloha-a--seznam-obrázků-k-výrobě), styl do [oddílu 4](#4-jednotný-ilustrační-styl) |

Priorita obrázků: 🔴 bez obrázku stránka neučí dobře nebo učí zavádějícím způsobem · 🟠 obrázek výrazně zlepší názornost · ⚪ doplněk, atmosféra.

---

## 1. Celkový obraz: z čeho se web dnes skládá

Stránky vznikaly v různých dobách a podle různých vzorů. Podle stavby se dělí do sedmi rodin:

| Rodina | Počet | Poznávací znaky | Příklady |
|---|---|---|---|
| **A · Procvičovací lekce** (`uloha.js` + `vyuka.css`) | 168 | nadpis, podtitul „Pro X. ročník: …“, 3–5 režimů, tahák s pravidlem, „Přeskočit →“, „💡 Nápověda“ | `cj4_pady`, `m7_pomer`, `d9_csr` |
| **B · Lekce s modelem** (`uloha.js` + velký interaktivní model) | 8 | vlastní laboratoř nebo atlas před procvičováním | `ch8_smesi`, `m9_podobnost`, `f9_jaderna`, `bunka` |
| **C · Pilotní vzorové lekce** (etapy 06–07) | 5 | cíl „Po této lekci dokážu…“, scénář 5/15/45 min, vedená aktivita, „Kam dál“ | `m4_zlomky_uvod`, `ch9_ph`, `aj9_neprima_rec`, `d6_prameny`, `inf6_tabulky` |
| **D · Rychlý dril** (`procvic.js`) | 5 | 2–4 kB, série příkladů, „🔄 Nová série“, druhá šance | `desetinna_cisla`, `mocniny_odmocniny`, `trigonometrie`, `kombinatorika`, `casovani_sloves` |
| **E · Velká simulace nebo nástroj** | 21 | canvas, panel posuvníků, vlastní nápověda „❓“, bez cíle a bez procvičování | `paka`, `optika`, `elektrina`, `vitr_tunel`, `solar_system`, `pracovni_listy` |
| **F · Samostatná malá stránka** (starší vzor) | 48 | vlastní skóre „0 Správně 0/10“, „▶️ Start“ / „Potvrdit“ / „Další →“, často bez `uloha.js` | `pocitani`, `procenta`, `rovnice`, `flags_quiz`, `casova_osa`, `punnett` |
| **G · Rozcestníky mimo katalog** | 6 | `index`, `prehled`, `osnova`, `predstaveni`, `priprava_hodiny`, `vyslovnost` (vypnutá) | — |

### Proč web působí jako slepenec

1. **Různé hlavičky.** Lekce A začínají „Pro 5. ročník: …“. Atlasy přírodopisu (`bunka`, `pr7_rostliny`, `anatomie`, `pr9_ekologie`, `ch8_smesi`) mají velkou úvodní plochu s nadtitulkem „Přírodopis · 7. ročník · Studijní atlas“. Simulace E začínají rovnou panelem nástrojů. Starší stránky F mají v nadpisu emoji a jinou typografii.
2. **Různé ovládání se stejným významem.** Pro „další úloha“ existuje nejméně šest podob: „Přeskočit →“, „Další →“, „Nová úloha →“, „🔄 Nová série“, „▶️ Start / 🔄 Znovu“, „🎲 Nový“. Pro kontrolu odpovědi: „Potvrdit“, „✔️ Zkontrolovat“, „Ověřit“, Enter.
3. **Různé počítání výsledků.** Skóre `uloha.js`, vlastní počítadla stránek F, rekordy `rekord.js`, vysvědčení v `pocitani`, SM-2 v kartičkách, nový deník `metodus_prubeh_v2` jen u pilotů. Žák nevidí jeden souvislý obraz svého pokroku.
4. **Výrazná vizuální nerovnováha.** Přírodopis má kvalitní akvarelové ilustrace (buňka, rostlina, ekologie, anatomie). Zbytek webu obrázky skoro nemá. Zvířata, jídlo a předměty zastupují emoji (`aj_slovicka`, `pr6_clenovci`, `prv2_zvirata`), houby a horniny se poznávají jen podle slovního popisu. Přírodopis tak vypadá jako jiný web.
5. **Model bez úkolu, úkol bez modelu.** Velké simulace E nemají cíl ani otázky. Většina lekcí A nemá žádný model a učí jen výběrem ze tří možností. Názornost a procvičování se potkávají jen v 8 lekcích B a 5 pilotech.
6. **Souběžné stránky na stejné téma bez vazby.** Například horniny (`prv4_horniny`, `pr9_mineraly`, `z6_litosfera`), první pomoc (`prv2_zdravi`, `pr8_prvni_pomoc`), potravní řetězce (`potravni_retezec`, `prv4_ekosystemy`, `pr9_ekologie`), zlomky (`m4_zlomky_uvod`, `m7_zlomky_operace`, `fraction_calc`), časové osy (`casova_osa`, `svetove_dejiny` a osy v každé dějepisné lekci). Každá má vlastní data i vlastní vysvětlení, takže si mohou odporovat.
7. **Nejednotné značení.** Povrch tělesa S i P, tíhové zrychlení 10 i 9,81, barvy větných členů se liší mezi `cj5_skladebni_dvojice`, `cj7_rozvijejici` a `vetny_rozbor`, rod v cizích jazycích nemá stálou barvu.
8. **Záměrně tmavé stránky** (`AI_prednaska`, `planet_globe`, `iss`) jsou v pořádku, ale nemají společný prvek, který by je s webem spojil.

---

## 2. Společná kostra stránky

> **Stav 22. 9. 2026: zavedeno** – `kostra.js`, `kostra.css`, cíle `KATALOG_CILE` v `apps.js`; popis a atributy `data-faze` v README (oddíl „Společná kostra stránky“), průběh v [etapách](ETAPY_VYLEPSENI.md) (oddíl R). Odchylky od návrhu níže: čas lekce se neuvádí (katalog ho nemá), hlavička stojí pod nadpisem stránky, aplikace na celou obrazovku mají jednořádkovou podobu.

Cíl: kdokoli otevře kteroukoli stránku, pozná během dvou sekund, že je v Metodusu, co se tu naučí a kde je „další krok“. Stavět na tom, co už funguje v pilotech (`pilot07.css`, `pilot07.js`, `.cil`, `.navaznosti` ve `vyuka.css`) a v katalogu (`KATALOG_VYUKA`).

### 2.1 Hlavička (jedna komponenta pro všechny typy)

```
┌──────────────────────────────────────────────────────────────┐
│ ▌📖 Český jazyk · Tvarosloví · 4.–5. ročník · ~15 min        │  ← proužek v barvě předmětu
│  Pády a vzory podstatných jmen                               │  ← název bez emoji
│  🎯 Po této lekci dokážu určit pád podle otázky ve větě…     │  ← cíl z KATALOG_VYUKA
│  Nejdřív: Podstatná jména – rod a číslo · Pro učitele ▸      │
├──────────────────────────────────────────────────────────────┤
│  📖 Výuka   📘 Ukázka   ✏️ Procvič   🎯 Ověř se   📌 Tahák   │  ← fáze (jen ty, které stránka má)
└──────────────────────────────────────────────────────────────┘
```

- Proužek a ikona předmětu podle `KATALOG_PREDMETY` (emoji už existují). Doplnit do `common.css` proměnnou `--predmet` pro každý předmět, v obou motivech. Stránka si barvu vezme z `apps.js`, nemusí ji mít zapsanou.
- Cíl, ročník, čas a návaznosti číst z katalogu. Stránka je sama nevypisuje. Tím zůstane jediný zdroj pravdy.
- Simulace E dostanou stejnou hlavičku ve sbalené podobě (jeden řádek), aby nepřišly o plochu.

### 2.2 Fáze lekce

| Fáze | Co obsahuje | Kdo ji dnes má |
|---|---|---|
| 📖 **Výuka** | model, ilustrace nebo otázka „Co myslíš, že se stane?“; žák manipuluje a předpovídá | lekce B, simulace E (bez otázek) |
| 📘 **Ukázka** | vedený příklad krok za krokem, tempo drží žák | 5 pilotů |
| ✏️ **Procvič** | dnešní režimy `uloha.js`, nápověda, vysvětlená chyba | lekce A, B, C |
| 🎯 **Ověř se** | 5–8 otázek napříč režimy, bez nápovědy, výsledek se zapíše do deníku | nikdo (jen „Test na čas“ u přijímaček) |
| 📌 **Tahák** | shrnutí na jednu obrazovku, lze vytisknout; nahradí dnešní rámeček s pravidlem | lekce A (rámeček nad úlohou) |

Stránka nemusí mít všech pět fází. Dril D má jen Procvič a Ověř se, simulace E hlavně Výuku s přidanými úkoly. **Názvy a pořadí fází se ale nemění**, takže žák ví, kde co hledat.

### 2.3 Jednotný slovník ovládání

| Význam | Jednotný text | Nahrazuje |
|---|---|---|
| zkontrolovat odpověď | **✔️ Zkontrolovat** (a Enter) | Potvrdit, Ověřit, Zkontrolovat poměr |
| další úloha po odpovědi | **Pokračovat →** | Další →, Nová úloha → |
| vynechat bez odpovědi | **Přeskočit →** (nezapočítá se) | — (už sjednoceno etapou 05) |
| nová sada úloh | **▶️ Spustit sérii** (na začátku) / **🔄 Nová série** (po skončení) | ▶️ Start, 🔄 Znovu, Hrát znovu |
| nápověda k úloze | **💡 Nápověda** (stupňovaná: 1. nasměrování, 2. postup, 3. řešení) | 💡 Ukaž podmět, Nevím, ukaž řešení, 💡 Napovědět |
| návod k simulaci | **❓ Nápověda** (ponecháno – je už jednotná ve všech simulacích a nepoplete se s 💡 Nápovědou k úloze) | — |
| vrátit model | **↺ Výchozí stav** | ↺ Reset (akce specifické pro simulaci, např. 🧹 Uklidnit, zůstávají) |
| zastavit animaci | **⏸ Pauza / ▶ Pokračovat** | — |

### 2.4 Pokrok a deník

Všechny rodiny zapisují do jednoho deníku (`metodus_prubeh_v2`). Stránky F a D přejdou na `uloha.js` nebo alespoň volají jeho zápis. Na konci každé fáze „Ověř se“ stejná závěrečná karta: kolik správně napoprvé, co zopakovat (odkaz na konkrétní režim) a „Kam dál“.

### 2.5 Zápatí

Blok **Kam dál** (už je ve `vyuka.css`), odkaz na **pracovní list** s předvyplněným tématem v `pracovni_listy.html` a sbalitelný **Pro učitele** (5/15/45 minut). Scénář stačí napsat pro hlavní lekci každé rodiny témat (oddíl 5), satelity odkazují na ni.

---

## 3. Sdílené názorné komponenty

> **Stav 22. 9. 2026: knihovna založena** – `nazor.js` a `nazor.css` obsahují zlomek (koláč, proužek, osa), číselnou osu, procenta, větu s větnými členy, časovou osu a obal mapy (`mapy.js`); ukázky v `docs/nazor-ukazky.html`. Zapojeno ve zlomcích, celých číslech, procentech, obou časových osách a v barvách větných členů čtyř lekcí češtiny. Ostatní komponenty z tabulky (řádová tabulka, pole, váhy, ciferník, graf, částice, molekula, schéma, obrázek s hotspoty, síť, robot, dialog, pramen) zatím žijí jen ve svých stránkách.

Nejsilnější nástroj pro dojem jednoho celku: **stejný jev se na celém webu kreslí stejně.** Žák, který zná proužek ze zlomků, ho pozná v procentech, poměru i ve finanční matematice. Navrhuji malou knihovnu (například `nazor.js` + `nazor.css`), kterou lekce skládají jako stavebnici. Karty ji označují 🧩.

| Komponenta | Co umí | Kde se použije |
|---|---|---|
| 🧩 **Číselná osa** | posun, přiblížení, značky, záporná čísla, zlomky, desetinná čísla, odhad tažením | `m1_porovnavani`, `m4_zlomky_uvod`, `desetinna_cisla`, `m7_cela_cisla`, `mocniny_odmocniny`, `casova_osa`, `f8_teplo` (teploměr) |
| 🧩 **Proužek a koláč** (stejný celek) | dělení na díly, vybarvení, porovnání dvou proužků | zlomky, `procenta`, `m7_pomer`, `m9_financni`, `ch8_smesi` (hmotnostní zlomek), `ch8_voda_vzduch` |
| 🧩 **Řádová tabulka** | tisíce–setiny, přenos a půjčování, posun čárky | písemné operace, `desetinna_cisla`, `prevody_jednotek`, `f6_mereni` |
| 🧩 **Pole a mřížka** | obdélníkové pole teček, čtvercová síť, krychličky | `multiplication`, `m6_delitelnost`, `m4_obvod_obsah`, `m8_vyrazy`, `m6_krychle_kvadr`, `mocniny_odmocniny` |
| 🧩 **Váhy** | dvě misky, přidávání a odebírání | `rovnice`, `m5_prumer`, `m1_porovnavani`, `f6_hustota` |
| 🧩 **Ciferník** | tažení ručiček, digitální čas | `clock_learning`, `dcj8_cislovky_cas`, `aj4_predlozky` (at 7 o'clock), `prv1_rocni_obdobi` |
| 🧩 **Graf** (souřadnice, sloupce, čára) | synchronizace s tabulkou hodnot a modelem | `grafy_funkci`, `m7_umernost`, `m8_statistika`, `f7_pohyb`, `f8_teplo`, `z6_atmosfera` (klimatogram) |
| 🧩 **Věta s větnými členy** | barvy členů, šipky závislostí, značky slovních druhů | všech 17 lekcí tvarosloví a skladby |
| 🧩 **Časová osa** | měřítko, přiblížení, souběžné pruhy (ČR / svět), před/po n. l. bez roku 0 | všech 21 dějepisných lekcí, `prv4_nejstarsi_dejiny`, `prv5_dejiny_20`, `pr9_vyvoj_zeme`, `cj9_literatura_20`, `literarni_smery` |
| 🧩 **Mapa** (rozšířit `mapy.js`) | vrstvy, hledání, značky, měřítko, stejná data států | 14 zeměpisných lekcí, slepé mapy, `d7_rany_stredovek`, `d7_husitstvi`, `cj9_vyvoj_jazyka`, `prv3_obec` |
| 🧩 **Glóbus** (už existuje v `planet_globe`/`iss`) | natočení Země, den/noc, souřadnice | `z6_planeta_zeme`, `z6_mapa_souradnice`, `solar_system` |
| 🧩 **Částicový model** | pohyb částic podle teploty a skupenství | `f6_vlastnosti_latek`, `f8_teplo`, `ch8_smesi`, `prv3_voda_vzduch` |
| 🧩 **Molekula a atom** | kuličkový model, vazby, počty atomů | `ch8_atom`, `vycislovani_rovnic`, `chem_nazvoslovi`, `ch9_uhlovodiky`, `ch9_derivaty`, `ch9_ph` |
| 🧩 **Obvodové schéma** | značky součástek, proud, napětí | `elektrina`, `f9_stridavy_proud`, `prv5_energie` |
| 🧩 **Obrázek s hotspoty** | ilustrace + klikací/klávesnicové body a popisky v SVG | atlasy přírodopisu (už je), všechny nové ilustrace z přílohy A |
| 🧩 **Řetězec a síť** | uzly se šipkami, přetažení, odebrání uzlu | `potravni_retezec`, `prv4_ekosystemy`, `pr9_ekologie`, `inf7_site`, příčiny a důsledky v dějepise |
| 🧩 **Robot na mřížce** | příkazy, krokování, zvýraznění řádku | `inf4_sekvence`, `inf5_cykly`, `inf6_promenne`, `inf7_funkce` |
| 🧩 **Dialog** (bubliny dvou postav) | střídání mluvčích, poslech, doplňování | AJ/NJ/FJ lekce, `cj4_prima_rec`, `aj9_neprima_rec` (už má), `prv1_cesta_skola`, `inf6_digitalni_stopa` |
| 🧩 **Pramen** | ukázka textu/obrazu, otázky autor–doba–účel–doklad | `d6_prameny` (vzor), všechny dějepisné lekce, `cj9_literatura_20`, `inf5_zdroje` |

Pravidlo: když karta navrhuje nový model, **nejdřív se hledá existující komponenta**. Teprve když chybí, vznikne nová, a to rovnou jako sdílená.

---

## 4. Jednotný ilustrační styl

Cíl: obrázky na různých stránkách vypadají, jako by je nakreslil jeden ilustrátor. Výchozí bod je to nejlepší, co už na webu je: botanická rostlina (`img/pr7_rostlina-botanicka.png`) a ekologické scény (`Prirodopis/ekologie-*-ilustrace`). Obojí je akvarel s jemnou tuší na teplém papíře.

### 4.1 Pět stylů

| Styl | Kdy | Popis pro zadání | Formát |
|---|---|---|---|
| **A · Akvarelová scéna** | krajiny, prostředí, děje, rekonstrukce | „natural-history watercolor and gouache with fine ink detail, warm ivory paper, muted sage/jade/ochre palette, soft daylight, contemporary educational book, no text, no labels, no arrows, no frame“ | 3:2, 1536 × 1024 |
| **B · Akvarelová karta** | jeden objekt pro poznávání, slovíčka, postavy | stejná technika jako A, **jeden objekt na středu**, pohled 3/4 nebo z boku, rovnoměrné okraje 12 %, jednobarevné slonovinové pozadí, stejné světlo zleva nahoře | 1:1, 768 × 768 |
| **C · Fotografie** | určování druhů, horniny, skutečné předměty, místa | skutečná fotografie s licencí (Wikimedia Commons, vlastní foto), ořez na stejný poměr, záznam autora a licence | 1:1 nebo 3:2 |
| **D · Schéma v kódu** | grafy, řezy, mapy, diagramy, geometrie | **nevyrábět jako obrázek**. Kreslí se SVG/canvasem v barvách webu, aby fungovalo v obou motivech a šlo s ním hýbat | — |
| **E · Historický doklad** | portréty, dobové mapy, dokumenty, fotografie | skutečný sken (Wikimedia Commons, Národní knihovna, Kramerius, Europeana), ne generovaný obraz | podle předlohy |

Pravidla, která drží jednotu i poctivost:

- **Do generovaných obrázků nikdy nepatří text, popisky, šipky ani čísla.** Popisky kreslí web (🧩 obrázek s hotspoty), takže jsou čitelné, přeložitelné, přístupné čtečce a mění barvu s motivem.
- **Generovaný obraz se nesmí vydávat za doklad.** V dějepise je rekonstrukce (styl A) označená „rekonstrukce“; portréty, prameny a dobové mapy jsou jen styl E. Stejně tak určovací obrázky hub, minerálů a živočichů jsou styl C, protože AI obraz může mít vymyšlené znaky. U hub jde o bezpečnost.
- **Tmavý motiv:** ilustrace A/B leží na „listu papíru“ (zaoblená karta se slonovinovým pozadím a jemným stínem). V tmavém i světlém motivu vypadá stejně, takže se obrázky nemusí vyrábět dvakrát.
- **Emoji zůstávají jen jako ikony ovládání a předmětů.** Tam, kde emoji dnes zastupuje objekt k poznávání (zvíře, jídlo, předmět), je nahradí karta B.
- **Žádné stálé postavy.** Web nepoužívá opakující se pojmenované postavy. Ve scénkách vystupují obecné role (žák, učitelka, prodavač, řidič), v cizích jazycích běžná jednorázová jména podle potřeby úlohy.

### 4.2 Technika a ukládání

- Složka `obsah/img/<předmět>/` (například `obsah/img/pr/`, `obsah/img/z/`). Existující `Prirodopis/` a `img/` zůstávají, nové obrázky jdou do nové struktury.
- Název `<stranka>-<motiv>.webp`, originál PNG vedle, zadání v `<stranka>-<motiv>.prompt.txt` podle existujícího vzoru `pr7_rostlina-botanicka.prompt.txt`. U stylu C a E soubor `<...>.zdroj.txt` s autorem, licencí a odkazem.
- WebP do 200 kB (scéna), do 60 kB (karta). U atlasů s hotspoty zapsat do zadání přibližné souřadnice částí v procentech, jako to dělá zadání rostliny. Pak jde hotspoty umístit bez ručního ladění.
- U každého obrázku `alt` s popisem, co je na něm podstatné pro úlohu (ne „obrázek“).
- Po přidání obrázků zvýšit verzi cache v `sw.js`. Obrázky se necachují předem, jen po návštěvě.

### 4.3 Jak z karty sestavit zadání pro generátor

Karta uvádí motiv a styl stručně česky. Anglické zadání se složí takto:

```
Use case: scientific-educational. Asset type: <styl A/B> for an interactive Czech school website.
<popis stylu z tabulky 4.1>
Subject: <motiv z karty, přeložený; u scén rozmístění objektů v % šířky a výšky>.
Keep every selectable part visually distinct: <seznam částí pro hotspoty>.
No text, no labels, no arrows, no numbers, no border, no watermark.
```

---

## 5. Rodiny témat a učební cesty

> **Stav 22. 9. 2026: zavedeno** – závazný seznam je `KATALOG_RODINY` v `apps.js` (43 rodin, jemněji dělených než tabulka níže; např. čeština má zvlášť pravopis, slovní druhy, větu, slovo a literaturu). Společná data: `data/udalosti.js`, `data/staty.js`, `data/horniny.js`, `data/tisnova_cisla.js`, `vyjmenovana.js`. Rodiny ukazuje hlavička lekce, blok Kam dál a Osnova.

Stránky na stejné téma se propojí do **rodin**: jedna hlavní lekce s modelem a výkladem, kolem ní satelity (dril, poznávačka, nástroj), které sdílejí data a odkazují na hlavní lekci. Tak zmizí rozpory mezi souběžnými stránkami a návaznosti v `KATALOG_VYUKA` dostanou strukturu.

| Rodina | Hlavní lekce | Satelity | Společná data a komponenty |
|---|---|---|---|
| Zlomky → procenta → peníze | `m4_zlomky_uvod` → `m7_zlomky_operace` → `procenta` | `fraction_calc`, `m7_pomer`, `m9_financni`, `desetinna_cisla` | 🧩 proužek, osa |
| Počítání a násobilka | `m1_porovnavani`, `pocitani` | `multiplication`, `mental_math`, `m3_deleni_zbytkem`, písemné operace | 🧩 pole, řádová tabulka |
| Rovnice a funkce | `rovnice` | `m8_vyrazy`, `m9_soustavy`, `grafy_funkci`, `m7_umernost`, `m9_lomene_vyrazy` | 🧩 váhy, graf |
| Geometrie v rovině | `m2_geo_zaklady` → `m6_uhly` → `m6_trojuhelnik` | `geometricke_konstrukce`, `m7_shodnost`, `m9_podobnost`, `m8_pythagoras`, `trigonometrie`, `geometrie_vzorce` | stejné značení vrcholů a stran |
| Tělesa | `m5_site_teles` → `m6_krychle_kvadr` | `m7_ctyruhelniky` (hranol), `m8_valec`, `m9_jehlan_kuzel`, `geo_tvary` | 🧩 mřížka krychliček, jednotné S |
| Měření a jednotky | `f6_mereni` | `prevody_jednotek`, `clock_learning`, `m6_krychle_kvadr` (převody), `physics_ref` | 🧩 řádová tabulka |
| Síla a stroje | `f7_sila` | `paka`, `vrtacka_lis`, `f7_tlak`, `physics_playground`, `f8_prace_energie` | jednotné g, šipky sil |
| Látky a částice | `f6_vlastnosti_latek` | `f6_hustota`, `f8_teplo`, `prv3_voda_vzduch`, `ch8_smesi` | 🧩 částicový model |
| Světlo | `optika` | `optika_soustava` | stejné barvy paprsků |
| Elektřina a energie | `elektrina` | `f9_stridavy_proud`, `prv5_energie`, `f9_jaderna` | 🧩 schéma |
| Vesmír | `solar_system` | `gravitacni_hriste`, `gravitacni_hriste2`, `pohyb_vesmirem`, `planet_globe`, `star_map`, `sky_events`, `iss`, `z6_planeta_zeme` | 🧩 glóbus, společná data planet |
| Stavba látek | `ch8_atom` | `periodic_table`, `chem_nazvoslovi`, `vycislovani_rovnic`, `ch9_redoxni` | 🧩 molekula |
| Život a buňka | `bunka` | `pr6_mikroorganismy`, `pr7_rostliny`, `anatomie`, `pr8_rozmnozovani`, `punnett` | atlasový vzor |
| Ekosystémy | `pr9_ekologie` | `potravni_retezec`, `prv4_ekosystemy`, `prv2_zvirata` | 🧩 síť, ilustrace krajiny |
| Horniny a Země | `pr9_mineraly` | `prv4_horniny`, `z6_litosfera`, `pr9_geologicke_deje`, `pr9_vyvoj_zeme` | fotografie vzorků C |
| Zdraví a první pomoc | `pr8_prvni_pomoc` | `prv2_zdravi`, `prv5_zdravy_styl`, `ch9_prirodni_latky`, `ch8_bezpecnost` | jeden odborně revidovaný postup |
| Mapa a orientace | `z6_mapa_souradnice` | `prv4_mapy_smery`, `prv3_obec`, `eduMaps`, `slepa_mapa`, `slepa_mapa_evropa` | 🧩 mapa |
| Státy a světadíly | `z8_evropa_regiony`, `z7_*` | `flags_quiz`, `svetova_hlavni_mesta`, `reky_pohori` | jedna datová sada států |
| Čas v dějinách | `d6_prameny` + `casova_osa` | `svetove_dejiny`, všechny dějepisné lekce | 🧩 časová osa, 🧩 pramen |
| Pravopis i/y | `vyjmenovana_slova` | `cj2_tvrde_mekke`, `doplnovacky`, `diktat_gen`, `cj3_parove` | jedna sada slov a příbuzných |
| Věta | `cj5_skladebni_dvojice` → `cj7_rozvijejici` → `vetny_rozbor` | `slovni_druhy`, `cj7_neohebne`, `cj8_souveti`, `shoda_podmetu` | 🧩 věta s členy |
| Slovesné časy (AJ) | `aj4_pritomny_prosty` → `aj6_minuly_cas` → `aj8_predpritomny` | `aj5_pritomny_prubehovy`, `aj7_budouci`, `aj_slovesa`, `casovani_sloves` | časová osa sloves, dialog |
| Druhý jazyk (NJ/FJ) | `dcj7_cleny` | `de_slovicka`, `fr_slovicka`, `dcj7_vyslovnost`, `dcj8_casovani`, `dcj8_cislovky_cas`, `dcj9_minuly` | stálé barvy rodu |
| Programování | `inf4_sekvence` → `inf5_cykly` → `inf6_promenne` → `inf7_funkce` | `eduSort`, `inf9_model_simulace` | 🧩 robot |
| Bezpečně online | `inf6_digitalni_stopa` | `inf4_hardware`, `inf5_zdroje`, `inf8_licence`, `inf9_ai_etika`, `AI_prednaska` | fiktivní scénky bez stálých postav |

Mezipředmětové cesty, které stojí za výslovné odkazy „Souvisí s…“: měřítko (`m7_pomer` ↔ `z6_mapa_souradnice` ↔ `prv4_mapy_smery`), procenta ↔ složení vzduchu a statistika obyvatel, koloběh vody (`prv3_voda_vzduch` ↔ `z6_hydrosfera` ↔ `f8_teplo`), pravěk ↔ vývoj člověka (`d6_pravek` ↔ `pr9_vyvoj_zeme`), 20. století (`prv5_dejiny_20` ↔ `d9_*` ↔ `cj9_literatura_20`), úměrnost ↔ pohyb ↔ Ohmův zákon.

---

## 6. Doporučené pořadí

1. **Kostra a slovník** (oddíl 2): hlavička z katalogu, fáze, jednotné texty tlačítek, barvy předmětů. Mění se sdílené soubory, přínos je na všech stránkách najednou.
2. **Převedení 48 stránek F a 5 drilů D** pod `uloha.js` a společnou hlavičku. Právě ony nejvíc kazí dojem celku.
3. **Knihovna komponent** (oddíl 3) postupně podle rodin: nejdřív 🧩 věta, osa, proužek, časová osa a mapa. Pokrývají nejvíc stránek.
4. **Obrázky** podle přílohy A: nejdřív 🔴, pak karty B nahrazující emoji, nakonec scény ⚪.
5. **Úkoly pro simulace E**: ke každé tři úkoly „předpověz → vyzkoušej → vysvětli“ a krátké Ověř se. Modely jsou hotové, chybí jim učební cesta.
6. **Rodiny** (oddíl 5): sjednotit data souběžných stránek a doplnit metadata `vyuka` postupně ke všem položkám katalogu.

---

## 7. Karty stránek

### 7.1 Rozcestníky a stránky mimo katalog

#### Metodus – rozcestník · [index.html](index.html)
- **Zařazení:** web › rámec · všechny ročníky · rozcestník G
- **Popis:** Hlavní okno webu. Vlevo menu katalogu se skupinami a sekcemi, vpravo pracovní plocha (iframe), ve které se otevírají lekce. Hlavička s úvodem, osnovou, kabinetem, ukázkami, motivem, projektorem a novým oknem; pod 700 px je sbalená do nabídky „⋯ Další“.
- **Funkčnost:** filtr předmětu a ročníku, hledání, oblíbené, naposledy otevřené, přímé odkazy `#obsah/…`, režim projektor se zvětšením, zrušení filtrů jedním tlačítkem.
- **Cíl výuky:** Žák i učitel najdou do půl minuty lekci podle předmětu, ročníku nebo slova.
- **Vylepšení:**
  - 🔗 Barevný proužek předmětu u položek menu a v hlavičce otevřené lekce (stejná barva jako hlavička stránky podle oddílu 2.1).
  - Hledání i podle cíle a typu aktivity z `KATALOG_VYUKA` („model“, „vedený příklad“), nejen podle názvu a tagů.
  - U položky v menu malá značka typu stránky (lekce, model, nástroj), aby učitel věděl, co otevírá.
  - V hlavičce otevřené lekce drobečková navigace „Předmět › Sekce › Lekce“ a šipky na předchozí/další lekci v rodině (oddíl 5).
- **Obrázky:** žádné. Logo a ikony existují.

#### Přehled učiva · [prehled.html](obsah/prehled.html)
- **Zařazení:** web › úvodní plocha · rozcestník G
- **Popis:** Úvodní stránka v pracovní ploše: ročníky, předměty, osnova, sekce pro učitele, tip na dnešek, oblíbené, naposledy otevřené, výběr podle účelu (etapa 08) a návod k přípravě hodiny bez internetu.
- **Funkčnost:** dlaždice ročníků a předmětů filtrují menu, výběr podle účelu (vedený příklad, model, pramen, procvičování, příprava hodiny).
- **Cíl výuky:** Dát žákovi rychlý vstup „co dnes procvičit“ a učiteli „co použít v hodině“.
- **Vylepšení:**
  - Pro žáka dlaždice **„Zopakuj si“** z deníku (lekce, kde byly chyby nebo které dlouho neotevřel).
  - Po výběru ročníku zobrazit učební cesty z oddílu 5 jako řadu karet („Zlomky → procenta → peníze“), ne jen seznam lekcí.
  - 🔗 Dlaždice předmětů v barvách předmětů a s jednou kartou B jako ilustrací předmětu.
- **Obrázky:**
  - `IMG-00-02` ⚪ **B** · sada 11 ilustrací předmětů (kniha a pero, geometrické těleso a pravítko, glóbus, baňka, list s buňkou, lupa nad mapou, hrad, notebook, anglický a německý slovník, domek se stromem, atom) ve stejném stylu — dlaždice předmětů na přehledu a v osnově

#### Osnova · [osnova.html](obsah/osnova.html)
- **Zařazení:** web › přehled pokrytí · rozcestník G
- **Popis:** Mřížka ročník × předmět s počtem hotových aplikací; kliknutím se vypíší témata. Výslovně uvádí, že nejde o posouzení pokrytí RVP.
- **Funkčnost:** buňky s počty, výpis témat, filtr podle účelu (etapa 08), sekce nástrojů napříč ročníky.
- **Cíl výuky:** Učitel vidí, co je pro jeho ročník k dispozici a jak témata navazují.
- **Vylepšení:**
  - V buňce kromě počtu i skladba typů (kolik lekcí má model, kolik jen procvičování) — ukáže, kde chybí názornost.
  - Přepínač „Rodiny témat“: tytéž lekce seskupené podle oddílu 5 přes ročníky, se šipkami návazností.
- **Obrázky:** žádné (případně dlaždice předmětů z `IMG-00-02`).

#### Živé ukázky · [predstaveni.html](obsah/predstaveni.html)
- **Zařazení:** web › prezentace webu · rozcestník G
- **Popis:** Sedm zkrácených, ale funkčních ukázek na jedné stránce (gravitace, periodická tabulka, aerodynamický tunel, buňka, kvadratická funkce, procvičování s vysvětlením, generátor testů).
- **Funkčnost:** každá ukázka je interaktivní, odkaz „Skočit“ na plnou aplikaci.
- **Cíl výuky:** Přesvědčit učitele za dvě minuty, že web je použitelný v hodině.
- **Vylepšení:**
  - 🔗 Ukázky postavit ze sdílených komponent (oddíl 3). Tím se stránka sama udržuje a nebude se rozcházet s plnými aplikacemi (dnes 274 kB kopií kódu).
  - U každé ukázky jednou větou „co se žák naučí“ a odkaz na přípravu hodiny, pokud existuje.
- **Obrázky:** žádné.

#### Příprava hodiny pH · [priprava_hodiny.html](obsah/priprava_hodiny.html)
- **Zařazení:** web › učitelský průchod (etapa 08) · chemie 9. r. · nástroj G
- **Popis:** 45minutový scénář: připomenutí, aktivita na tabuli, pracovní list, závěrečná otázka s očekávanou odpovědí. Odkazy vedou do lekce pH, do režimu pro tabuli a do generátoru listů.
- **Funkčnost:** časové bloky s odkazy, tisk žákovského listu bez řešení.
- **Cíl výuky:** Učitel odučí celou hodinu z jedné stránky.
- **Vylepšení:**
  - Zobecnit na **šablonu přípravy** čtenou z katalogu: pro každou hlavní lekci rodiny (oddíl 5) jeden scénář. Stránka se stane `priprava_hodiny.html?lekce=…`.
  - Uložení poznámek učitele k hodině a vazba na `prezentace.html` (vytvořit slidy ze scénáře).
- **Obrázky:** žádné.

#### Výslovnost a poslech · [vyslovnost.html](obsah/vyslovnost.html)
- **Zařazení:** cizí jazyky › vypnutá stránka mimo katalog
- **Popis:** Poslechová stránka pro AJ/NJ/FJ, dočasně vypnutá kvůli nekvalitnímu syntetickému hlasu; odkazuje na jiné lekce.
- **Funkčnost:** výběr jazyka, start, přehrát znovu — dnes bez provozu.
- **Cíl výuky:** Žák rozliší a napodobí hlásky, které čeština nemá.
- **Vylepšení:**
  - Místo syntetického hlasu **nahrávky rodilých mluvčích** s volnou licencí (Wikimedia Commons, Lingua Libre, Forvo s licencí) pro sadu asi 60 slov na jazyk.
  - Do té doby vizuální režim: obrázek polohy úst a jazyka, minimální dvojice (ship/sheep, Bett/Beet, dessus/dessous).
- **Obrázky:**
  - `IMG-aj-01` 🟠 **B** · 8 karet „poloha úst a jazyka“ pro hlásky th (neznělé a znělé), w, æ, ə, ü, ö, francouzské nosovky — boční řez hlavou, zjednodušeně, bez textu

### 7.2 Český jazyk (35 stránek)

Společné pro celou češtinu: 🔗 jedna paleta pro větné členy a slovní druhy (🧩 věta s členy), stejné pořadí „najdi → urči → zdůvodni“ a zdůvodnění jako součást odpovědi, ne jen volba správného tvaru. Obrázky potřebuje hlavně 1.–2. ročník; od 3. ročníku stačí dobře navržené SVG a jednoduché ilustrační scénky.

#### Písmena a hlásky · [cj1_pismena.html](obsah/cj1_pismena.html)
- **Zařazení:** Čeština › Pravopis · 1. r. · lekce A
- **Popis:** Rozklad slova na hlásky a skládání zpět, první a poslední hláska, velká a malá písmena. Předčítání hlasem.
- **Funkčnost:** 5 režimů (Rozlož slovo, Slož slovo, První hláska, Poslední hláska, Velké a malé), tlačítko „🔊 Přečti“.
- **Cíl výuky:** Žák dokáže sluchem rozložit krátké slovo na hlásky, složit ho z hlásek a poznat, že ch je jedna hláska a dvě písmena.
- **Vylepšení:**
  - Každé slovo s obrázkem (karta B): prvňák, který ještě nečte, pozná slovo podle obrázku a pracuje sluchem.
  - Dvojice „slyším / vidím“: hlásky jako barevné kuličky nad písmeny; u CH dvě písmena pod jednou kuličkou, u OU dvě kuličky.
  - Skládání slova tažením písmen do okének (dnes výběr), s alternativou klepnutí.
- **Obrázky:**
  - `IMG-cj-01` 🔴 **B** · sada 40 karet jednoduchých předmětů a zvířat pro první čtení (máma, les, pes, auto, ucho, chleba, dům, míč, kolo, ryba…) — jednoznačný motiv bez textu; sdílet s `slabiky` a `cj2_abeceda`

#### Tvrdé a měkké souhlásky · [cj2_tvrde_mekke.html](obsah/cj2_tvrde_mekke.html)
- **Zařazení:** Čeština › Pravopis · 2. r. · lekce A
- **Popis:** Doplňování i/y po tvrdých a měkkých souhláskách, třídění souhlásek, hledání chyby. Rámečky „tvrdé“ a „měkké“ souhlásky.
- **Funkčnost:** 3 režimy, nápověda zvýrazní souhlásku, předčítání.
- **Cíl výuky:** Žák určí souhlásku před i/y a podle ní správně doplní.
- **Vylepšení:**
  - Dva „domečky“ (tvrdý a měkký) jako stálá pomůcka: žák přetáhne souhlásku do domečku, teprve pak doplní písmeno. Zdůvodnění se tak stane krokem úlohy.
  - Chybná slova vrátit na konci série v jiné větě.
  - 🔗 Stejné domečky použít v `vyjmenovana_slova` a `doplnovacky` (obojetné souhlásky jako třetí domeček).
- **Obrázky:**
  - `IMG-cj-02` ⚪ **B** · dva domečky: tvrdý (kamenný, hranatý) a měkký (dřevěný s polštáři) — pozadí pomůcky

#### Abeceda a řazení slov · [cj2_abeceda.html](obsah/cj2_abeceda.html)
- **Zařazení:** Čeština › Pravopis · 2.–3. r. · lekce A
- **Popis:** Chybějící písmeno v abecedě, které slovo je první, řazení slov. Abecední pás se rozsvěcuje podle úlohy.
- **Funkčnost:** 3 režimy, abecední pás, nápověda.
- **Cíl výuky:** Žák seřadí slova podle abecedy včetně slov se stejným začátkem a s CH.
- **Vylepšení:**
  - Řazení tažením kartiček na poličku (nyní výběr); při shodném prvním písmenu se pás posune na druhé písmeno a obě slova se zarovnají pod sebe.
  - Minihra „slovník“: najdi slovo v krátkém rejstříku — přenos do praxe.
- **Obrázky:** využít karty `IMG-cj-01` jako obrázky ke slovům.

#### Doplňovačky i/y · [doplnovacky.html](obsah/doplnovacky.html)
- **Zařazení:** Čeština › Pravopis · 3.–5. r. · lekce A
- **Popis:** Doplňování i/í, y/ý ve vyjmenovaných a příbuzných slovech, hledání chyby, výběr řady obojetné souhlásky.
- **Funkčnost:** 2 režimy, volba řady, nápověda.
- **Cíl výuky:** Žák doplní i/y po obojetné souhlásce a zdůvodní to vyjmenovaným nebo příbuzným slovem.
- **Vylepšení:**
  - Po doplnění občas otázka „proč?“ s výběrem zdůvodnění (vyjmenované slovo / příbuzné k … / není příbuzné).
  - Dvojice významů (být – bít, výr – vír) jako obrázkové páry: žák vybere obrázek odpovídající větě.
  - 🔗 Sdílet data slov a rodin s `vyjmenovana_slova` a `diktat_gen` (jedna sada, oddíl 5).
- **Obrázky:**
  - `IMG-cj-03` 🟠 **B** · dvojice karet slov, která znějí stejně: být/bít, mýt/mít, výr/vír, vít (věnec)/výt (vlk), případně další s jednoznačně kreslitelným významem — rozlišení významu obrázkem

#### Generátor diktátů · [diktat_gen.html](obsah/diktat_gen.html)
- **Zařazení:** Čeština › Pravopis · 3.–9. r. · lekce A
- **Popis:** Věta se zobrazí s vynechanými písmeny; doplnit, nebo přepsat celou větu podle poslechu.
- **Funkčnost:** 2 režimy, kontrola, ukázat správně.
- **Cíl výuky:** Žák napíše větu bez chyb v procvičovaných jevech a sám najde, kde chyboval.
- **Vylepšení:**
  - Osobní sada chyb: slova, v nichž žák chyboval, se vracejí v dalších diktátech.
  - Po kontrole rozbor chyby s odkazem na lekci jevu (i/y → `vyjmenovana_slova`, shoda → `shoda_podmetu`).
  - Poslech po úsecích a pomalejší tempo pod kontrolou žáka.
- **Obrázky:** žádné.

#### Párové souhlásky · [cj3_parove.html](obsah/cj3_parove.html)
- **Zařazení:** Čeština › Pravopis · 3. r. · lekce A
- **Popis:** Doplnění b/p, d/t, z/s…, výběr ověřovacího slova, hledání chyby. Rámeček párů „jednu slyšíme, druhou píšeme“.
- **Funkčnost:** 3 režimy, předčítání, nápověda.
- **Cíl výuky:** Žák ověří párovou souhlásku změnou tvaru slova (dub → duby) a správně ji napíše.
- **Vylepšení:**
  - Animace ověření: slovo „du?“ se „protáhne“ na „duby“, souhláska se vyjasní a vrátí se do původního slova.
  - Kombinovaný režim: nejdřív vybrat ověřovací slovo, pak doplnit.
  - Dva řádky nad slovem: „slyším [dup]“ a „píšu dub“.
- **Obrázky:** využít karty `IMG-cj-01` (dub, hrad, had, zub, led).

#### Vyjmenovaná slova · [vyjmenovana_slova.html](obsah/vyjmenovana_slova.html)
- **Zařazení:** Čeština › Pravopis · 3.–5. r. · lekce A (hlavní lekce rodiny i/y)
- **Popis:** Série slov k doplnění, doplnění řady zpaměti, přehled všech řad.
- **Funkčnost:** 3 režimy, přehled, nápověda.
- **Cíl výuky:** Žák zná řady vyjmenovaných slov, pozná slova příbuzná a rozliší je od stejně znějících nepříbuzných.
- **Vylepšení:**
  - **Strom příbuzných slov**: kořen (my-) uprostřed, větve mýdlo, umyvadlo, mycí; žák přidává slova a web kontroluje.
  - Obrázková řada: ke každému vyjmenovanému slovu karta, řady se učí jako „obrázkový příběh“.
  - 🔗 Sdílená datová sada i/y pro celou rodinu (oddíl 5).
- **Obrázky:**
  - `IMG-cj-04` 🟠 **B** · ilustrace k vyjmenovaným slovům, 8 řad × 6–10 karet (například B: být, bydlet, obyvatel, byt, příbytek, nábytek, dobytek, kobyla, býk, Bydžov…) — pomůcka k zapamatování; u slov bez obrazu (bystrý, zbytek) vynechat

#### Shoda podmětu s přísudkem · [shoda_podmetu.html](obsah/shoda_podmetu.html)
- **Zařazení:** Čeština › Pravopis · 6.–7. r. · lekce A
- **Popis:** Doplnění koncovky přísudku, hledání podmětu, určení rodu, hledání chyby. Postup „najdi podmět → urči rod → doplň“.
- **Funkčnost:** 4 režimy, nápověda „💡 Ukaž podmět“.
- **Cíl výuky:** Žák najde podmět včetně nevyjádřeného a několikanásobného, určí jeho rod a životnost a podle toho doplní i/y/a v příčestí.
- **Vylepšení:**
  - 🧩 Věta s členy: podmět a přísudek spojí šipka a nad ní se objeví „rod mužský životný → -i“.
  - Stupně obtížnosti: jednoduchý podmět → nevyjádřený → několikanásobný → smíšené rody.
  - Tabulka koncovek jako tahák se zvýrazněním řádku, který právě platí.
- **Obrázky:** žádné.

#### Přejatá slova · [cj8_prejata.html](obsah/cj8_prejata.html)
- **Zařazení:** Čeština › Pravopis · 8. r. · lekce A
- **Popis:** Pravopis (s/z, dy/di…), český význam, skloňování, původ slova.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák správně napíše a skloňuje běžná přejatá slova, zná jejich význam a přibližný původ.
- **Vylepšení:**
  - Mapa původu: slovo „přiletí“ ze země původu (🧩 mapa, jednoduchá vrstva Evropy a světa).
  - Jedna věta pro každé slovo — pravopis, význam i tvar se procvičí v kontextu.
  - U dvojího pravopisu obě podoby jako správné se značkou „obě platí“.
- **Obrázky:** žádné.

#### Příprava na přijímací zkoušky – ČJ · [cj9_prijimacky.html](obsah/cj9_prijimacky.html)
- **Zařazení:** Čeština › Pravopis · 9. r. · lekce A (souhrnná)
- **Popis:** Úlohy ve stylu jednotné přijímací zkoušky: pravopis, tvarosloví, skladba, práce s textem, test na čas s rozborem.
- **Funkčnost:** 5 režimů + test na čas.
- **Cíl výuky:** Žák zvládne typové úlohy přijímací zkoušky a ví, které oblasti má dotrénovat.
- **Vylepšení:**
  - Rozbor výsledku jako mapa dovedností s odkazem na konkrétní lekci ke každé slabé oblasti.
  - Delší výchozí text s více otázkami a nutností označit v textu doklad (🧩 pramen).
  - Jasně oddělený „trénink“ (s nápovědou) a „simulace“ (časomíra, bez nápovědy, závěrečné vyhodnocení).
- **Obrázky:** žádné.

#### Druhy vět · [cj2_druhy_vet.html](obsah/cj2_druhy_vet.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 2.–3. r. · lekce A
- **Popis:** Určení druhu věty (oznamovací, tázací, rozkazovací, přací), doplnění znaménka, hledání věty daného druhu.
- **Funkčnost:** 3 režimy, předčítání.
- **Cíl výuky:** Žák pozná druh věty podle záměru mluvčího a napíše správné znaménko.
- **Vylepšení:**
  - Jedna scénka, čtyři věty: děti u stolu („Podej mi chleba.“ / „Podáš mi chleba?“ / „Kéž by byl chleba!“ / „Chleba je na stole.“). Žák přiřadí bubliny k situaci.
  - Poslech s intonací a volba znaménka až po poslechu.
- **Obrázky:**
  - `IMG-cj-05` 🟠 **A** · 4 scénky dětí (u stolu, na hřišti, ve třídě, v obchodě), každá s prázdným místem pro bublinu — situace ke čtyřem druhům vět

#### Slovní druhy · [slovni_druhy.html](obsah/slovni_druhy.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 3.–6. r. · lekce A
- **Popis:** Určení slovního druhu, ohebný/neohebný, odpovídající otázka.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák určí slovní druh slova ve větě a zdůvodní ho otázkou nebo ohebností.
- **Vylepšení:**
  - 🧩 Věta s členy v režimu „slovní druhy“: celá věta se obarví a žák opravuje jedno slovo.
  - Stejné slovo v různých větách (kolem jako příslovce i předložka, to jako zájmeno i částice).
  - 🔗 Stálé barvy deseti slovních druhů na celém webu (stejné v `cj7_neohebne`, `cj5_pridavna`…).
- **Obrázky:** žádné.

#### Slovesa – osoba, číslo, čas · [cj3_slovesa.html](obsah/cj3_slovesa.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 3.–4. r. · lekce A
- **Popis:** Určení času, osoby a čísla, převod do jiného času. Rámečky čas/osoba/číslo.
- **Funkčnost:** 4 režimy, předčítání.
- **Cíl výuky:** Žák určí osobu, číslo a čas slovesa a převede větu do jiného času.
- **Vylepšení:**
  - Časová osa včera – dnes – zítra (🧩 časová osa, zjednodušená) s posuvníkem: věta se přepisuje podle polohy.
  - Osoby jako obrázky mluvčích: já, ty, on/ona, my, vy, oni — mluví v bublinách.
- **Obrázky:**
  - `IMG-cj-06` 🟠 **B** · karty osob: dítě ukazuje na sebe, dítě ukazuje na druhého, skupinka dětí, dvojice, ukazování „ty/vy“ — vizualizace mluvnických osob

#### Podstatná jména – rod a číslo · [cj3_podstatna.html](obsah/cj3_podstatna.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 3.–4. r. · lekce A
- **Popis:** Určení rodu (ten/ta/to), čísla, převod do množného, hledání podstatného jména.
- **Funkčnost:** 4 režimy, rámečky rodů, předčítání.
- **Cíl výuky:** Žák určí rod a číslo podstatného jména včetně názvů vlastností a dějů.
- **Vylepšení:**
  - Tři „krabice“ ten/ta/to pro přetahování karet slov s obrázkem.
  - Jedno/mnoho: obrázek jednoho předmětu se rozmnoží a žák píše tvar.
  - Abstraktní slova (radost, běh) ukázat v situaci, aby bylo vidět, že i to jsou podstatná jména.
- **Obrázky:** využít `IMG-cj-01` (jeden a více předmětů — generovat varianty „tři míče“ v téže sadě).

#### Pády a vzory podstatných jmen · [cj4_pady.html](obsah/cj4_pady.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 4.–5. r. · lekce A
- **Popis:** Pád podle otázky, určení pádu ve větě, doplnění tvaru, hledání vzoru; přehled vzorů podle rodů.
- **Funkčnost:** 4 režimy, rámečky vzorů.
- **Cíl výuky:** Žák určí pád podstatného jména ve větě podle otázky a přiřadí ho ke vzoru podle 1. a 2. pádu.
- **Vylepšení:**
  - Otázka se vloží přímo do věty (Vidím ___ (koho? co?) → psa) a žák ji tam „zkusí“.
  - Skloňovací tabulka slova, ve které se zvýrazní řádek právě určeného pádu.
  - Určení vzoru jako rozhodovací strom (rod → životnost → zakončení 1. a 2. pádu), ne pouhý výběr.
- **Obrázky:** žádné.

#### Synonyma a antonyma · [synonyma_antonyma.html](obsah/synonyma_antonyma.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 4.–7. r. · lekce A
- **Popis:** Mix synonym a antonym, jen synonyma, jen antonyma, určení vztahu.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák najde slovo souznačné a protikladné a posoudí, zda je ve větě zaměnitelné.
- **Vylepšení:**
  - Vložit zvolené synonymum do věty a posoudit, zda věta zní stejně (dům/stavení v pohádce a v inzerátu).
  - Antonyma jako posuvník („studený – vlažný – teplý – horký“), aby bylo vidět škálu.
- **Obrázky:** žádné.

#### Stavba slova · [cj4_stavba_slova.html](obsah/cj4_stavba_slova.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 4.–5. r. · lekce A
- **Popis:** Hledání kořene, určení části slova, slova příbuzná, předpona × předložka.
- **Funkčnost:** 4 režimy, barevné rámečky předpona/kořen/přípona.
- **Cíl výuky:** Žák rozloží slovo na předponu, kořen, příponu a koncovku a najde slova příbuzná.
- **Vylepšení:**
  - Rozstříhání slova: žák klepnutím vkládá hranice mezi části, web obarví díly.
  - Strom rodiny slov (stejná komponenta jako u `vyjmenovana_slova`).
  - Předpona × předložka: dvojice „zahrada“ / „za hradem“ se zvýrazněnou mezerou.
- **Obrázky:** žádné.

#### Přídavná jména · [cj5_pridavna.html](obsah/cj5_pridavna.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 5.–6. r. · lekce A
- **Popis:** Druh přídavného jména, doplnění koncovky, stupňování, tvrdý a měkký vzor.
- **Funkčnost:** 4 režimy, předčítání.
- **Cíl výuky:** Žák určí druh a vzor přídavného jména a napíše správnou koncovku podle rodu, čísla a pádu.
- **Vylepšení:**
  - Přepínač podstatného jména: „mladý pes / mladá kočka / mladé kuře / mladí psi“ — koncovka se mění před očima.
  - Stupňování jako tři sloupce různé výšky.
  - Postup zdůvodnění: druh → vzor → shoda → koncovka.
- **Obrázky:** žádné.

#### Základní skladební dvojice · [cj5_skladebni_dvojice.html](obsah/cj5_skladebni_dvojice.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 5.–6. r. · lekce A (hlavní lekce rodiny „věta“)
- **Popis:** Hledání podmětu a přísudku, typ podmětu, zda patří k sobě; rámečky podmět (modrý), přísudek (žlutý), shoda.
- **Funkčnost:** 4 režimy, předčítání.
- **Cíl výuky:** Žák najde ve větě podmět a přísudek, pozná nevyjádřený podmět a spojí je ve skladební dvojici.
- **Vylepšení:**
  - 🧩 Věta s členy: žák klepne na přísudek, pak na podmět, a mezi nimi se nakreslí oblouk.
  - Srovnávací dvojice „Prší.“ (bezpodmětá) × „Přišel.“ (nevyjádřený podmět).
  - 🔗 Barvy podmětu a přísudku převzít jako standard pro `cj7_rozvijejici`, `vetny_rozbor` a `shoda_podmetu`.
- **Obrázky:** žádné.

#### Zájmena a číslovky · [cj5_zajmena_cislovky.html](obsah/cj5_zajmena_cislovky.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 5.–6. r. · lekce A
- **Popis:** Druhy zájmen a číslovek, mě/mně, zájmeno × číslovka.
- **Funkčnost:** 4 režimy, pomůcka tebe/tobě.
- **Cíl výuky:** Žák určí druh zájmena a číslovky a správně napíše mě/mně.
- **Vylepšení:**
  - Záměna tebe/tobě přímo ve větě tlačítkem: žák vidí, která náhrada dává smysl.
  - Číslovky na obrázku: „tři jablka, třetí jablko, trojí jablka“ se zvýrazněnou polohou.
- **Obrázky:** žádné.

#### Rozbor věty – větné členy · [vetny_rozbor.html](obsah/vetny_rozbor.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 6.–8. r. · lekce A
- **Popis:** Určení větného členu, hledání ve větě, rozbor celé věty; postup od přísudku.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák provede rozbor jednoduché věty a nakreslí závislosti členů.
- **Vylepšení:**
  - 🧩 Věta s členy s **grafem závislostí** (klasický školní zápis větného rozboru), který žák skládá tažením.
  - Kontrola po krocích: nejdřív dvojice, pak rozvíjející členy, chyba se hlásí na konkrétní vazbě.
- **Obrázky:** žádné.

#### Slovní zásoba a význam slov · [cj6_slovni_zasoba.html](obsah/cj6_slovni_zasoba.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 6.–7. r. · lekce A
- **Popis:** Vztahy mezi slovy (synonyma, antonyma, homonyma, nadřazenost), mnohoznačnost, význam v kontextu.
- **Funkčnost:** 4 režimy, rámečky vztahů.
- **Cíl výuky:** Žák rozliší mnohoznačné slovo od homonyma a určí význam slova podle kontextu.
- **Vylepšení:**
  - Obrázkové páry homonym a mnohoznačných slov (koruna stromu / královská / peníze; kohoutek na vodu / pták).
  - Strom nadřazenosti (zvíře → savec → pes → jezevčík) jako rozbalovací schéma.
- **Obrázky:**
  - `IMG-cj-07` 🟠 **B** · 8 trojic karet pro mnohoznačná slova a homonyma (koruna, kohoutek, oko, list, pero, zámek, jazyk, kolej) — význam podle obrázku

#### Rozvíjející větné členy · [cj7_rozvijejici.html](obsah/cj7_rozvijejici.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 7.–8. r. · lekce A
- **Popis:** Předmět, přívlastek, příslovečné určení; druh příslovečného určení, hledání ve větě, co přívlastek rozvíjí.
- **Funkčnost:** 4 režimy, rámečky členů.
- **Cíl výuky:** Žák určí rozvíjející větný člen otázkou od řídícího slova a rozliší druhy příslovečného určení.
- **Vylepšení:**
  - 🧩 Věta s členy: šipka od řídícího slova s otázkou na šipce.
  - „Rozviň větu“: z holé věty žák přidáváním členů staví delší a web ukazuje, co přidal.
- **Obrázky:** žádné.

#### Neohebné slovní druhy · [cj7_neohebne.html](obsah/cj7_neohebne.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 7. r. · lekce A
- **Popis:** Příslovce, předložky, spojky, částice, citoslovce; příslovce × předložka, spojky souřadicí/podřadicí.
- **Funkčnost:** 4 režimy, rámečky druhů 6–10.
- **Cíl výuky:** Žák určí neohebný slovní druh podle funkce ve větě.
- **Vylepšení:**
  - Dvojice „šel kolem“ / „šel kolem domu“: předložka se vizuálně „přilepí“ k podstatnému jménu.
  - Spojky jako spojovací kolejnice mezi větami (souřadné rovně, podřadné dolů) — navazuje na `cj8_souveti`.
- **Obrázky:** žádné.

#### Slovotvorba · [cj7_slovotvorba.html](obsah/cj7_slovotvorba.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 7. r. · lekce A
- **Popis:** Odvozování, skládání, zkracování, stavba slova, tvoření slov, zkratky.
- **Funkčnost:** 4 režimy, rámečky způsobů.
- **Cíl výuky:** Žák pozná, jak slovo vzniklo, a sám vytvoří slovo odvozením nebo složením.
- **Vylepšení:**
  - Dílna slov: kostky předpon, kořenů a přípon, žák skládá a web ověřuje, zda slovo existuje.
  - Skládání slov jako spojení dvou obrázků (vodopád = voda + pád).
  - 🔗 Stejné kostky jako v `cj4_stavba_slova`.
- **Obrázky:** žádné (případně 6 karet ze sady `IMG-cj-01` pro složená slova).

#### Souvětí souřadné a podřadné · [cj8_souveti.html](obsah/cj8_souveti.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 8.–9. r. · lekce A
- **Popis:** Souřadné × podřadné, druh vedlejší věty, čárky, poměry mezi větami.
- **Funkčnost:** 4 režimy, rámečky typů souvětí.
- **Cíl výuky:** Žák určí stavbu souvětí, druh vedlejší věty a zdůvodní čárku.
- **Vylepšení:**
  - Graf souvětí: věty jako bloky, podřadné o stupeň níž, šipka s otázkou.
  - Čárka: po umístění se ukáže, mezi kterými bloky grafu leží, takže je vidět důvod.
- **Obrázky:** žádné.

#### Útvary a vývoj českého jazyka · [cj9_vyvoj_jazyka.html](obsah/cj9_vyvoj_jazyka.html)
- **Zařazení:** Čeština › Tvarosloví a skladba · 9. r. · lekce A (s mapou)
- **Popis:** Spisovná a nespisovná čeština, nářeční oblasti na mapě, vývoj jazyka, stará a nová slova.
- **Funkčnost:** 4 režimy, mapa nářečí (`mapy.js`).
- **Cíl výuky:** Žák rozliší útvary jazyka, pozná hlavní nářeční oblasti a vysvětlí, jak se jazyk mění.
- **Vylepšení:**
  - Nářeční mapa s ukázkou věty v každém nářečí (text, případně nahrávka z volných zdrojů).
  - Časová osa vývoje jazyka se skutečnými ukázkami (Hospodine, pomiluj ny; Kralická bible; obrozenecký text; dnešní text).
- **Obrázky:**
  - `IMG-cj-08` 🟠 **E** · sken rukopisu Hospodine, pomiluj ny, strana Bible kralické, titulní list Jungmannova slovníku — ukázky vývoje písma a pravopisu

#### Slabiky a první čtení · [slabiky.html](obsah/slabiky.html)
- **Zařazení:** Čeština › Čtení a literatura · 1.–2. r. · samostatná F
- **Popis:** Tabule s kartami: písmena → slabiky → slova → věty; barevné slabiky, automatické čtení.
- **Funkčnost:** 4 úrovně, předchozí/další, předčítání, „Číst samo“.
- **Cíl výuky:** Žák čte slabiky a krátká slova a rozumí přečtené větě.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js` a společnou hlavičku.
  - Po přečtení slova volba ze tří obrázků (porozumění), u vět volba obrázku, který větu vystihuje.
  - Postupné ubírání barevné podpory.
- **Obrázky:** sdílet sadu `IMG-cj-01`; navíc:
  - `IMG-cj-09` 🟠 **A** · 10 jednoduchých scén k větám pro první čtení (Máma má mísu. Ema mele maso. Pes leží u domu…) — obrázek ke kontrole porozumění

#### Čtení s porozuměním · [cteni_s_porozumenim.html](obsah/cteni_s_porozumenim.html)
- **Zařazení:** Čeština › Čtení a literatura · 2.–9. r. · lekce B
- **Popis:** Text se čtyřmi otázkami, tři úrovně náročnosti, nápověda, předčítání.
- **Funkčnost:** volba úrovně, start, nápověda (H), přečíst text.
- **Cíl výuky:** Žák vyhledá informaci v textu, vyvodí z něj závěr a odpověď doloží místem v textu.
- **Vylepšení:**
  - Po odpovědi zvýraznit v textu větu, která odpověď dokládá; u vyvozovací otázky dvě věty.
  - Typ otázky (najdi / vyvoď / posuď) viditelný jako štítek; rozbor výsledku podle typu.
  - Úloha „označ v textu“: žák místo výběru možnosti klepne na větu.
- **Obrázky:**
  - `IMG-cj-10` ⚪ **A** · jedna ilustrace ke každému textu 1. stupně (odhadem 10–15) — motivace a kontext, bez prozrazení odpovědí

#### Čtenářský deník · [reading_log.html](obsah/reading_log.html)
- **Zařazení:** Čeština › Čtení a literatura · 4.–9. r. · nástroj F
- **Popis:** Evidence knih (chci číst / čtu / přečtená), hodnocení, poznámky, export a import JSON, řazení a filtr.
- **Funkčnost:** formulář, seznam, filtry, export/import.
- **Cíl výuky:** Žák vede záznam o četbě a formuluje vlastní názor na knihu.
- **Vylepšení:**
  - Volitelné otázky k zápisu (hlavní postava, co se změnilo, citát, doporučil/a bych, protože…).
  - Tisk jedné knihy jako list do sešitu.
  - 🔗 Společná hlavička a vzhled jako `edu_progress`, přidání do deníku (přečtená kniha = záznam).
- **Obrázky:** žádné.

#### Mýty, báje a pohádky · [cj6_baje.html](obsah/cj6_baje.html)
- **Zařazení:** Čeština › Čtení a literatura · 6. r. · lekce A
- **Popis:** Určení žánru, řečtí bohové, báje a hrdinové, literární pojmy; rámečky pohádka, pověst, báje, bajka.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší pohádku, pověst, báji a bajku podle znaků v ukázce.
- **Vylepšení:**
  - Krátké ukázky, v nichž žák označí znak žánru (kouzlo, skutečné místo, bůh, zvíře s ponaučením).
  - Rodokmen olympských bohů jako rozklikávací schéma se symboly.
- **Obrázky:**
  - `IMG-cj-11` 🟠 **E** · antické zobrazení 8–10 řeckých bohů a hrdinů (vázy, sochy; Wikimedia Commons) — skutečné atributy bohů, ne vymyšlené
  - `IMG-cj-12` ⚪ **A** · 4 malé vinety žánrů (pohádkový zámek, skutečný hrad s pověstí, Olymp, liška s havranem) — záhlaví rámečků žánrů

#### Literatura 20. století · [cj9_literatura_20.html](obsah/cj9_literatura_20.html)
- **Zařazení:** Čeština › Čtení a literatura · 9. r. · lekce A
- **Popis:** Autor a dílo, poznej ukázku, směry, doba a literatura; oficiální literatura, samizdat, exil.
- **Funkčnost:** 4 režimy, časová osa desetiletí.
- **Cíl výuky:** Žák zařadí autora a dílo do doby a směru a doloží to znakem z ukázky.
- **Vylepšení:**
  - 🧩 Časová osa se souběžnými pruhy: dějiny ČR, literatura oficiální, samizdat, exil.
  - Ukázky s úkolem „označ znak směru v textu“.
  - 🔗 Propojit s `d9_*` (stejná událost na ose) a `literarni_smery`.
- **Obrázky:**
  - `IMG-cj-13` ⚪ **E** · portréty 10–12 autorů (Čapek, Seifert, Hrabal, Škvorecký, Kundera, Havel…) z volných zdrojů, obálky samizdatových edic (Edice Petlice) — karty autorů

#### Literární směry a autoři · [literarni_smery.html](obsah/literarni_smery.html)
- **Zařazení:** Čeština › Čtení a literatura · 9. r. (a SŠ) · lekce A
- **Popis:** Přehled směrů, autor → směr, dílo → autor, směr → období.
- **Funkčnost:** 4 režimy, přehled.
- **Cíl výuky:** Žák přiřadí autora a dílo ke směru podle znaků, ne jen podle doby.
- **Vylepšení:**
  - 🧩 Časová osa směrů s překryvy, autor může zasahovat do více směrů.
  - Každý směr s jedním výtvarným dílem stejné doby (romantismus – Friedrich, realismus – Courbet…) jako vizuální kotva.
- **Obrázky:**
  - `IMG-cj-14` 🟠 **E** · 8 reprodukcí volných děl výtvarného umění ke směrům (romantismus, realismus, impresionismus, symbolismus, kubismus, surrealismus…) — vizuální znak směru

#### Přímá řeč · [cj4_prima_rec.html](obsah/cj4_prima_rec.html)
- **Zařazení:** Čeština › Sloh a komunikace · 4.–5. r. · lekce A
- **Popis:** Správný zápis, poloha uvozovací věty, přímá × nepřímá řeč; rámečky tří poloh.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák zapíše přímou řeč s uvozovací větou vpředu, vzadu i uprostřed se správnou interpunkcí.
- **Vylepšení:**
  - 🧩 Dialog: řečová bublina se přemění na zápis s uvozovkami; barevně spárované uvozovky, čárka a znaménko.
  - Žák přetahuje uvozovací větu na tři místa a interpunkce se přestaví.
- **Obrázky:** žádné (bubliny kreslí web).

#### Slohové útvary · [cj8_sloh.html](obsah/cj8_sloh.html)
- **Zařazení:** Čeština › Sloh a komunikace · 8.–9. r. · lekce A
- **Popis:** Poznávání útvarů (výklad, úvaha, popis, vypravování, charakteristika, zpráva), jejich znaky, stavba a jazyk.
- **Funkčnost:** 4 režimy, rámečky útvarů.
- **Cíl výuky:** Žák rozpozná slohový útvar podle znaků a napíše krátký text podle zadání.
- **Vylepšení:**
  - Jedno téma (například „kolo“) zpracované šesti útvary vedle sebe, žák přiřazuje.
  - Psací dílna: zadání, kontrolní seznam znaků útvaru, vlastní odškrtávání (bez automatického hodnocení).
- **Obrázky:**
  - `IMG-cj-15` ⚪ **A** · jedna scéna (například cyklista na venkovské silnici) jako společné téma pro popis, vypravování a charakteristiku

### 7.3 Matematika (49 stránek)

Společné pro celou matematiku: 🔗 každé téma má jeden **názorný obraz**, který se opakuje od prvního výkladu po procvičování (🧩 osa, proužek, pole, váhy, graf). Chyba se vysvětluje v tomto obrazu, ne jen textem. Obrázky kreslí kód (styl D); vyrobit je potřeba jen skutečné situace do slovních úloh a pár fotografií měřidel.

#### Porovnávání a řady čísel · [m1_porovnavani.html](obsah/m1_porovnavani.html)
- **Zařazení:** Matematika › Čísla a operace · 1.–2. r. · samostatná F
- **Popis:** Porovnání čísel, doplnění řady, které číslo je na ose, ukázání čísla; rozsah do 10/20/100.
- **Funkčnost:** 4 režimy, volba rozsahu, předčítání; pomůcka „hladová pusa“.
- **Cíl výuky:** Žák porovná čísla do 100, doplní číselnou řadu a najde číslo na číselné ose.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js` a společnou hlavičku.
  - 🧩 Číselná osa + 🧩 pole: stejné číslo jako tečky v rámečku po deseti, číslice a bod na ose současně.
  - Odhad polohy na ose tažením (kde je 37?), teprve pak se ukáže správné místo.
- **Obrázky:** žádné (styl D).

#### Počítání do 20 a 100 · [pocitani.html](obsah/pocitani.html)
- **Zařazení:** Matematika › Čísla a operace · 1.–3. r. · samostatná F
- **Popis:** Série 10 příkladů na sčítání a odčítání s vysvědčením na konci.
- **Funkčnost:** rozsah, operace, potvrzení.
- **Cíl výuky:** Žák sčítá a odčítá do 20 s přechodem přes desítku a do 100.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`, sjednotit vysvědčení se závěrečnou kartou „Ověř se“.
  - 🧩 Pole: rámeček po deseti s rozkladem 8 + 5 = 8 + 2 + 3, kostičky přeskakují do druhé desítky.
  - Po chybě ukázat postup na počítadle, ne jen správný výsledek.
- **Obrázky:** žádné (styl D).

#### Procvičování násobilky · [multiplication.html](obsah/multiplication.html)
- **Zařazení:** Matematika › Čísla a operace · 2.–4. r. · lekce A (dril)
- **Popis:** Rychlostní dril s deseti sekundami na příklad a přehledem chyb, rekordy.
- **Funkčnost:** rozsah, počet příkladů, operace, start, Enter.
- **Cíl výuky:** Žák zná zpaměti násobilku do 10 a odvodí dělení z násobení.
- **Vylepšení:**
  - Režim „Pochop“ bez časomíry: 🧩 pole teček 6 × 7, které se dá otočit (7 × 6) a rozdělit (5 × 7 + 1 × 7).
  - Tabulka násobilky, která se postupně vybarvuje podle zvládnutých dvojic.
  - Slabé dvojice vrátit s jiným rozkladem.
- **Obrázky:** žádné.

#### Dělení se zbytkem · [m3_deleni_zbytkem.html](obsah/m3_deleni_zbytkem.html)
- **Zařazení:** Matematika › Čísla a operace · 3.–4. r. · lekce A
- **Popis:** Výpočet, kolik zbude, zkouška; pravidlo „zbytek je menší než dělitel“.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák vydělí se zbytkem a ověří výsledek zkouškou.
- **Vylepšení:**
  - Rozdělování předmětů do krabiček tažením; zbytek zůstane stranou a je vidět, proč je menší než počet krabiček.
  - Slovní úlohy, kde se zbytek musí interpretovat (kolik aut pro 23 dětí po 4?).
- **Obrázky:**
  - `IMG-m-01` ⚪ **B** · 6 karet předmětů k rozdělování (jablko, bonbon, pastelka, míček, kartička, krabička) — v jednotném stylu místo emoji

#### Písemné sčítání, odčítání a násobení · [m4_pisemne_operace.html](obsah/m4_pisemne_operace.html)
- **Zařazení:** Matematika › Čísla a operace · 4. r. · lekce A
- **Popis:** Počítání pod sebou do milionu, hledání chyby.
- **Funkčnost:** 3 režimy, pomůcka zápisu podle řádů (`pisemne.js`).
- **Cíl výuky:** Žák písemně sčítá, odčítá a násobí a najde chybný krok v cizím výpočtu.
- **Vylepšení:**
  - 🧩 Řádová tabulka nad zápisem: přenos jako malá kulička, která „přeskočí“ do vyššího řádu.
  - Hledání chyby jako klepnutí na první špatnou číslici, s vysvětlením.
- **Obrázky:** žádné.

#### Písemné dělení · [m4_pisemne_deleni.html](obsah/m4_pisemne_deleni.html)
- **Zařazení:** Matematika › Čísla a operace · 4.–5. r. · lekce A
- **Popis:** Dělení jednociferným a dvojciferným dělitelem, první číslice podílu, zkouška.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák písemně dělí a zdůvodní každý krok (dělím – násobím – odčítám – snáším).
- **Vylepšení:**
  - Krokový režim s barevným rámečkem právě dělené části a šipkou „snesu další číslici“.
  - Zvlášť nula uvnitř podílu (408 : 4) jako záludný případ.
- **Obrázky:** žádné.

#### Zlomky – části celku · [m4_zlomky_uvod.html](obsah/m4_zlomky_uvod.html)
- **Zařazení:** Matematika › Čísla a operace · 4.–5. r. · pilot C (hlavní lekce rodiny zlomků)
- **Popis:** Vzorová lekce: cíl, scénář pro učitele, ukázka krok za krokem, koláč, proužek a číselná osa se stejným celkem, adresné chyby, „Kam dál“.
- **Funkčnost:** 5 režimů (ukázka, jaký je to zlomek, vybarvi, co je víc, část z počtu), ovládání klávesnicí.
- **Cíl výuky:** Žák přečte a znázorní zlomek jako část celku a porovná dva zlomky.
- **Vylepšení:**
  - 🧩 Vytáhnout koláč, proužek a osu do sdílené knihovny — tato lekce je jejich vzor.
  - Skutečné situace „část z celku“ (pizza, čokoláda, třída) jako druhý krok po abstraktním obrázku.
  - Fáze Ověř se na konci (dnes chybí).
- **Obrázky:**
  - `IMG-m-02` ⚪ **B** · 4 karty skutečných celků k dělení (pizza shora, tabulka čokolády, pás látky, skupina 12 dětí) — přenos zlomku do situace; dělicí čáry kreslí web

#### Římské číslice · [roman_numerals.html](obsah/roman_numerals.html)
- **Zařazení:** Matematika › Čísla a operace · 4.–6. r. · samostatná F (převodník)
- **Popis:** Obousměrný převodník arabských a římských číslic, tabulka základních hodnot, pravidlo odčítání.
- **Funkčnost:** dvě pole s okamžitým převodem.
- **Cíl výuky:** Žák přečte a zapíše římské číslo do 3999.
- **Vylepšení:**
  - 🔗 Doplnit procvičování pod `uloha.js` (čti, zapiš, najdi chybu) — dnes je to jen převodník.
  - Rozklad čísla po řádech: 1994 = M + CM + XC + IV, barevně nad zápisem.
  - Kde římské číslice potkáme: ciferník, letopočet na budově, kapitoly.
- **Obrázky:**
  - `IMG-m-03` ⚪ **C** · 4 fotografie římských číslic ve skutečnosti (ciferník věžních hodin, letopočet na průčelí, náhrobek, číslování kapitol) — čtení v kontextu

#### Mentální matematika · [mental_math.html](obsah/mental_math.html)
- **Zařazení:** Matematika › Čísla a operace · 4.–9. r. · lekce A (dril)
- **Popis:** Rychlostní dril z hlavy s volbou operace, obtížnosti a délky, přehled problémových příkladů, rekordy.
- **Funkčnost:** volby, start, Enter.
- **Cíl výuky:** Žák pohotově počítá zpaměti a volí výhodnou strategii (zaokrouhlení, rozklad).
- **Vylepšení:**
  - Režim bez času se strategiemi: po příkladu 49 + 36 nabídnout „50 + 36 − 1“ jako možný postup.
  - Výsledky rozdělit na přesnost a rychlost; do deníku zapisovat jen přesnost.
- **Obrázky:** žádné.

#### Desetinná čísla · [desetinna_cisla.html](obsah/desetinna_cisla.html)
- **Zařazení:** Matematika › Čísla a operace · 5.–6. r. · dril D
- **Popis:** Sčítání a odčítání, porovnávání, zaokrouhlování; druhá šance, přehled chyb.
- **Funkčnost:** 3 režimy, nová série.
- **Cíl výuky:** Žák porovná, zaokrouhlí a sečte desetinná čísla a ví, že 0,5 = 0,50.
- **Vylepšení:**
  - 🔗 Převést z `procvic.js` pod `uloha.js`.
  - 🧩 Řádová tabulka a 🧩 osa s přiblížením: 2,35 leží mezi 2,3 a 2,4.
  - Typická chyba „0,12 > 0,5, protože 12 > 5“ jako výslovný protipříklad.
  - Peníze a délky jako kontext (Kč a haléře, metry a centimetry).
- **Obrázky:** žádné.

#### Slovní úlohy a úsudek · [m5_slovni_ulohy.html](obsah/m5_slovni_ulohy.html)
- **Zařazení:** Matematika › Čísla a operace · 5.–6. r. · lekce A
- **Popis:** Úlohy o více krocích, co spočítat nejdřív, odhad výsledku.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák rozloží slovní úlohu na údaje, otázku, plán a výpočet a odpoví s jednotkou.
- **Vylepšení:**
  - Pásové schéma (🧩 proužek) k zadání: žák přetahuje údaje na pás.
  - Pět kroků jako formulář (údaje → otázka → plán → výpočet → odpověď), zvýrazněné čísla v textu.
  - Úlohy s nadbytečným údajem.
- **Obrázky:**
  - `IMG-m-04` ⚪ **A** · 6 scén ke slovním úlohám (obchod, výlet vlakem, zahrada, školní jídelna, sbírka, cyklovýlet) — kontext úlohy; čísla doplňuje web

#### Kalkulačka zlomků · [fraction_calc.html](obsah/fraction_calc.html)
- **Zařazení:** Matematika › Čísla a operace · 6.–7. r. · nástroj F
- **Popis:** Zadání dvou zlomků a operace, výsledek.
- **Funkčnost:** čtyři operace, výsledek.
- **Cíl výuky:** Žák si ověří výsledek a pochopí postup výpočtu se zlomky.
- **Vylepšení:**
  - Rozbalitelný postup: společný jmenovatel, rozšíření, výpočet, krácení; ke každému kroku 🧩 proužek.
  - Nejdřív odhad („bude výsledek větší než 1?“), pak výpočet.
  - 🔗 Stát se nástrojem uvnitř `m7_zlomky_operace` (panel „Ověř si“), ne samostatnou stránkou v menu.
- **Obrázky:** žádné.

#### Dělitelnost, prvočísla, NSD a NSN · [m6_delitelnost.html](obsah/m6_delitelnost.html)
- **Zařazení:** Matematika › Čísla a operace · 6. r. · lekce A
- **Popis:** Znaky dělitelnosti, prvočíslo/složené, rozklad na prvočinitele, NSD a NSN.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák použije znaky dělitelnosti, rozloží číslo na prvočinitele a spočítá NSD a NSN v úloze.
- **Vylepšení:**
  - 🧩 Pole: číslo jako obdélníky z teček — prvočíslo jde složit jen do jedné řady.
  - Strom rozkladu, který žák rozvětvuje klepnutím.
  - Eratosthenovo síto jako interaktivní tabulka 1–100.
  - NSN v situaci (dva autobusy, bliká maják), NSD při dělení balíčků.
- **Obrázky:** žádné.

#### Poměr a měřítko · [m7_pomer.html](obsah/m7_pomer.html)
- **Zařazení:** Matematika › Čísla a operace · 7. r. · lekce A
- **Popis:** Krácení poměru, dělení v poměru, zvětšení a zmenšení, měřítko mapy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozdělí celek v daném poměru a použije měřítko mapy.
- **Vylepšení:**
  - 🧩 Proužek: 3 : 2 jako pět stejných dílků, dva barevné úseky.
  - Recept, který se přepočítá na jiný počet porcí.
  - 🔗 Měřítko na stejné mapě jako `z6_mapa_souradnice` (🧩 mapa s pravítkem).
- **Obrázky:** žádné.

#### Celá čísla · [m7_cela_cisla.html](obsah/m7_cela_cisla.html)
- **Zařazení:** Matematika › Čísla a operace · 7. r. · lekce A
- **Popis:** Číslo na ose, porovnávání, sčítání a odčítání, násobení a dělení, opačné číslo a absolutní hodnota.
- **Funkčnost:** 5 režimů, osa v SVG.
- **Cíl výuky:** Žák počítá s celými čísly a vysvětlí sčítání a odčítání jako pohyb po ose.
- **Vylepšení:**
  - 🧩 Osa se „skokanem“: +3 = tři kroky doprava, −(−3) = otočka a kroky.
  - Kontexty: teploměr, výtah s podzemními patry, účet.
- **Obrázky:**
  - `IMG-m-05` ⚪ **B** · 3 karty kontextů (teploměr venku v zimě, výtah se štítky pater −2 až 5 bez čísel, potápěč pod hladinou) — pozadí osy

#### Počítání se zlomky · [m7_zlomky_operace.html](obsah/m7_zlomky_operace.html)
- **Zařazení:** Matematika › Čísla a operace · 7. r. · lekce A
- **Popis:** Krácení a rozšiřování, sčítání a odčítání, násobení a dělení, porovnávání.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák sčítá, odčítá, násobí a dělí zlomky a každý krok vysvětlí na obrázku.
- **Vylepšení:**
  - 🧩 Proužek: sčítání s převodem na společné dělení proužku, násobení jako obdélník (plocha), dělení jako „kolikrát se vejde“.
  - Vedený příklad krok za krokem jako v `m4_zlomky_uvod`.
  - 🔗 Vložit kalkulačku zlomků jako panel „Ověř si“.
- **Obrázky:** žádné.

#### Procenta a trojčlenka · [procenta.html](obsah/procenta.html)
- **Zařazení:** Matematika › Čísla a operace · 7.–9. r. · samostatná F
- **Popis:** Kolik je p % z čísla, kolik % je a z b, výpočet základu, trojčlenka.
- **Funkčnost:** 4 typy úloh, potvrzení.
- **Cíl výuky:** Žák vypočítá procentovou část, počet procent i základ a vysvětlí to pomocí 1 %.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`, cíl a návaznosti (zlomky → procenta → finance).
  - 🧩 Proužek 0–100 % pod proužkem hodnot; žák nejdřív označí celek a 1 %.
  - Sleva, zdražení a dvě po sobě jdoucí změny; procenta × procentní body.
- **Obrázky:**
  - `IMG-m-06` ⚪ **B** · 4 karty situací (cenovka se slevou bez čísel, výsledkový graf voleb bez popisků, etiketa potraviny, spořitelní kasička) — kontext úloh; čísla vkládá web

#### Mocniny a odmocniny · [mocniny_odmocniny.html](obsah/mocniny_odmocniny.html)
- **Zařazení:** Matematika › Čísla a operace · 8.–9. r. · dril D
- **Popis:** Druhé a třetí mocniny, druhé odmocniny, mix; druhá šance.
- **Funkčnost:** 4 režimy, nová série.
- **Cíl výuky:** Žák zná druhé mocniny do 20, odhadne odmocninu mezi dvěma celými čísly.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - 🧩 Mřížka: čtverec 7 × 7 a krychle 3 × 3 × 3 z krychliček.
  - Odhad √50 na ose mezi 7 a 8.
- **Obrázky:** žádné.

#### Příprava na přijímací zkoušky – M · [m9_prijimacky.html](obsah/m9_prijimacky.html)
- **Zařazení:** Matematika › Čísla a operace · 9. r. · lekce A (souhrnná)
- **Popis:** Typové úlohy (počítání, výrazy a rovnice, geometrie, slovní úlohy), test na čas.
- **Funkčnost:** 5 režimů.
- **Cíl výuky:** Žák zvládne typové úlohy přijímací zkoušky a zná své slabé oblasti.
- **Vylepšení:**
  - Rozbor výsledku jako mapa dovedností s odkazy na lekce (stejná komponenta jako v `cj9_prijimacky`).
  - Geometrické úlohy s obrázkem (dnes převážně text).
  - Oddělený trénink a simulace.
- **Obrázky:** žádné (geometrie jako styl D).

#### Učení hodin · [clock_learning.html](obsah/clock_learning.html)
- **Zařazení:** Matematika › Měření a jednotky · 1.–3. r. · samostatná F
- **Popis:** Kolik je hodin, nastav čas tažením ručiček, prozkoumej; celé hodiny až po 5 minutách.
- **Funkčnost:** 3 režimy, tlačítka ±1 h/±5 min, aktuální čas, série.
- **Cíl výuky:** Žák přečte čas na ručičkových hodinách a nastaví zadaný čas.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`, ciferník vytáhnout do 🧩 ciferníku pro další lekce.
  - Délka trvání: „Film začíná v 16:40 a trvá 35 minut“ — ručička se posune a ukáže přechod přes celou.
  - Denní program školáka (vstávání, škola, oběd…) na ose dne propojený s ciferníkem.
- **Obrázky:**
  - `IMG-m-07` ⚪ **B** · 6 karet denních činností (vstávání, snídaně, škola, oběd, kroužek, spaní) — denní režim k nastavení času

#### Převody jednotek · [prevody_jednotek.html](obsah/prevody_jednotek.html)
- **Zařazení:** Matematika › Měření a jednotky · 4.–7. r. · lekce A
- **Popis:** Délka, hmotnost, objem, čas, metricky i v jednotkách USA; lehké a těžší převody, volba procvičovaného.
- **Funkčnost:** obtížnost, výběr veličin, „Nevím, ukaž řešení“.
- **Cíl výuky:** Žák převede jednotky délky, hmotnosti, objemu a času a vysvětlí, proč se násobí 10, 100, 1000.
- **Vylepšení:**
  - 🧩 Řádová tabulka se „schody“ jednotek: posun čárky se ukáže jako přesun o schod.
  - U plochy a objemu čtverec 1 m² rozdělený na 100 × 100 dm² (přibližovací animace).
  - Odhad: „Kolik váží jablko?“ se skutečnými předměty.
- **Obrázky:**
  - `IMG-m-08` 🟠 **C** · fotografie 8 referenčních předmětů s přibližnou velikostí a hmotností (kancelářská sponka, jablko, litrová láhev, dveře, balení mouky 1 kg, lžička, kostka cukru, fotbalové hřiště z výšky) — odhad jednotek

#### Geometrické tvary a tělesa · [geo_tvary.html](obsah/geo_tvary.html)
- **Zařazení:** Matematika › Geometrie · 1.–5. r. · samostatná F
- **Popis:** Přehled rovinných útvarů a těles, kvíz útvarů a těles.
- **Funkčnost:** přehled, 2 kvízy.
- **Cíl výuky:** Žák pozná a pojmenuje základní rovinné útvary a tělesa i v otočené poloze.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Útvary v náhodném otočení a poměru stran; tělesa otáčet tažením (jednoduché 3D, sdílené s `m5_site_teles`).
  - „Najdi ve světě“: fotografie předmětů, žák určí těleso.
- **Obrázky:**
  - `IMG-m-09` 🟠 **C** · 12 fotografií předmětů tvaru těles (kostka cukru, krabice mléka, plechovka, míč, kornout, pyramida, stan, toblerone, válcová pastelka…) — poznávání těles v okolí

#### Bod, přímka, úsečka · [m2_geo_zaklady.html](obsah/m2_geo_zaklady.html)
- **Zařazení:** Matematika › Geometrie · 2.–3. r. · lekce A
- **Popis:** Poznávání útvarů, měření úsečky, rýsování podle zadání.
- **Funkčnost:** 3 režimy, SVG pravítko.
- **Cíl výuky:** Žák rozliší bod, přímku, polopřímku a úsečku, změří úsečku a narýsuje ji v dané délce.
- **Vylepšení:**
  - Posuvné pravítko, které žák přiloží sám; zvýrazněná nula a typická chyba „měřím od okraje“.
  - Upozornění „na obrazovce nejsou skutečné centimetry“ a kalibrace podle kreditní karty (volitelně).
- **Obrázky:** žádné.

#### Obvod a obsah čtverce a obdélníku · [m4_obvod_obsah.html](obsah/m4_obvod_obsah.html)
- **Zařazení:** Matematika › Geometrie · 4.–5. r. · lekce A
- **Popis:** Obsah ve čtvercové síti, výpočet obvodu a obsahu, rýsování obdélníku.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák spočítá obvod a obsah obdélníku a rozliší „obejít okraj“ od „pokrýt plochu“.
- **Vylepšení:**
  - Mravenec, který obchází okraj (obvod), a dlaždičky, které pokrývají plochu (obsah) — dva různé děje.
  - „Stejný plot, jiná zahrádka“: přestavování obdélníku se stálým obvodem a sledování obsahu.
- **Obrázky:** žádné.

#### Osová souměrnost · [m4_soumernost.html](obsah/m4_soumernost.html)
- **Zařazení:** Matematika › Geometrie · 4.–5. r. · lekce A
- **Popis:** Je útvar souměrný, kolik má os, dokreslení podle osy.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák najde osu souměrnosti a dokreslí útvar souměrně podle osy.
- **Vylepšení:**
  - Překlopení podle osy animací (papír se přeloží), dvojice odpovídajících bodů.
  - Šikmá osa a útvary „skoro souměrné“.
  - Souměrnost v přírodě a architektuře.
- **Obrázky:**
  - `IMG-m-10` ⚪ **C** · 8 fotografií souměrných a téměř souměrných objektů (motýl, list, průčelí zámku, obličej, sněhová vločka, dopravní značka, logo, most) — hledání os ve skutečnosti

#### Sítě těles · [m5_site_teles.html](obsah/m5_site_teles.html)
- **Zařazení:** Matematika › Geometrie · 5.–6. r. · lekce A
- **Popis:** Která síť složí krychli, stěny/hrany/vrcholy, poznej těleso.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák rozhodne, zda síť složí krychli, a určí počet stěn, hran a vrcholů tělesa.
- **Vylepšení:**
  - Animované skládání sítě ve 3D; u neplatné sítě se zvýrazní překrývající se stěny.
  - Protější stěny barevně (stejná barva = protější).
  - Předpověď před animací.
- **Obrázky:** žádné.

#### Geometrické konstrukce kružítkem · [geometricke_konstrukce.html](obsah/geometricke_konstrukce.html)
- **Zařazení:** Matematika › Geometrie · 6.–9. r. · simulace E (rýsovací nástroj)
- **Popis:** Plnohodnotná rýsovací plocha s kružítkem a pravítkem, úlohy s postupem, kontrola konstrukce, mřížka, přichycení, export/import.
- **Funkčnost:** nástroje, zpět/vpřed, zobrazení úhlů a délek, kontrola, export PNG/SVG.
- **Cíl výuky:** Žák provede základní konstrukce (osa úsečky, osa úhlu, kolmice, trojúhelník) a zapíše postup.
- **Vylepšení:**
  - 🔗 Společná hlavička a fáze: úlohy seřadit do cesty od osy úsečky po konstrukci trojúhelníku sss/sus/usu.
  - Učitelský režim „krok za krokem na tabuli“ a žákovský bez předlohy.
  - Kontrola vztahů (kružnice má střed v bodě A a prochází B), ne jen blízkosti bodů.
- **Obrázky:** žádné.

#### Obvody, obsahy, objemy · [geometrie_vzorce.html](obsah/geometrie_vzorce.html)
- **Zařazení:** Matematika › Geometrie · 6.–9. r. · samostatná F (tahák a výpočty)
- **Popis:** Přehled vzorců pro útvary a tělesa a počítání příkladů.
- **Funkčnost:** přehled, 2 typy úloh, potvrzení.
- **Cíl výuky:** Žák vybere správný vzorec a dosadí s jednotkami.
- **Vylepšení:**
  - 🔗 Přeměnit na **společný tahák geometrie**: každý vzorec s obrázkem a odkazem do lekce, kde se vysvětluje. Procvičování přenechat lekcím.
  - Sjednotit značení povrchu (S) na celém webu.
- **Obrázky:** žádné (styl D).

#### Úhel a jeho velikost · [m6_uhly.html](obsah/m6_uhly.html)
- **Zařazení:** Matematika › Geometrie · 6. r. · lekce A
- **Popis:** Druh úhlu, kolik má stupňů, nastavení úhlu tažením, počítání s úhly.
- **Funkčnost:** 4 režimy, SVG úhloměr.
- **Cíl výuky:** Žák změří a narýsuje úhel úhloměrem a určí jeho druh.
- **Vylepšení:**
  - Úhloměr, který žák přikládá a otáčí; dvě stupnice a otázka „od které nuly čtu?“.
  - Úhly ve skutečnosti: nůžky, ručičky hodin, otevřené dveře, rampa.
- **Obrázky:** žádné (případně fotografie z `IMG-m-10`).

#### Krychle a kvádr – povrch a objem · [m6_krychle_kvadr.html](obsah/m6_krychle_kvadr.html)
- **Zařazení:** Matematika › Geometrie · 6.–7. r. · lekce A (hlavní lekce rodiny těles)
- **Popis:** Objem, povrch, převody jednotek, slovní úlohy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák spočítá objem a povrch kvádru a rozliší, kdy úloha chce povrch a kdy objem.
- **Vylepšení:**
  - 🧩 Mřížka: kvádr z jednotkových krychliček, které se dají vrstvit; povrch jako rozložená síť.
  - Úloha „krabice“: kolik se vejde (objem) × kolik papíru na obal (povrch) se stejnými rozměry.
- **Obrázky:** žádné.

#### Trojúhelník – druhy a konstrukce · [m6_trojuhelnik.html](obsah/m6_trojuhelnik.html)
- **Zařazení:** Matematika › Geometrie · 6. r. · lekce A
- **Popis:** Druhy podle stran a úhlů, trojúhelníková nerovnost, věty o konstrukci.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák určí druh trojúhelníku, rozhodne, zda jde sestrojit, a vybere konstrukční větu.
- **Vylepšení:**
  - Tři tyčky dané délky, které se „zavírají“ — pokud nerovnost neplatí, konce se nedotknou.
  - Odkaz na konstrukci v `geometricke_konstrukce` s předvyplněnou úlohou.
- **Obrázky:** žádné.

#### Shodnost trojúhelníků · [m7_shodnost.html](obsah/m7_shodnost.html)
- **Zařazení:** Matematika › Geometrie · 7. r. · lekce A
- **Popis:** Věty sss, sus, usu, zda údaje stačí, odpovídající prvky, postup konstrukce.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozhodne podle vět o shodnosti, zda jsou trojúhelníky shodné, a přiřadí odpovídající prvky.
- **Vylepšení:**
  - Průsvitná kopie trojúhelníku, kterou žák posouvá, otáčí a překlápí přes druhý.
  - Při nedostatečných údajích (ssu) ukázat dva různé trojúhelníky splňující zadání.
- **Obrázky:** žádné.

#### Čtyřúhelníky a hranoly · [m7_ctyruhelniky.html](obsah/m7_ctyruhelniky.html)
- **Zařazení:** Matematika › Geometrie · 7. r. · lekce A
- **Popis:** Poznávání čtyřúhelníků, vlastnosti, obsah a obvod, hranol.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák třídí čtyřúhelníky podle vlastností a odvodí obsah rovnoběžníku a lichoběžníku.
- **Vylepšení:**
  - Tvarovatelný čtyřúhelník s táhly, který drží zvolené vlastnosti (rovnoběžné strany, pravé úhly).
  - Strom vztahů (čtverec je obdélník i kosočtverec).
  - Odvození obsahu přestřižením a přesunutím trojúhelníku.
- **Obrázky:** žádné.

#### Kruh a kružnice · [m8_kruh.html](obsah/m8_kruh.html)
- **Zařazení:** Matematika › Geometrie · 8. r. · lekce A
- **Popis:** Obvod a obsah, části kruhu, přímka a kružnice, poloměr a průměr.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vypočítá obvod a obsah kruhu a vysvětlí, odkud se bere π.
- **Vylepšení:**
  - Odvalení kola po přímce (obvod ≈ 3,14 průměru) a přeskládání výsečí do „obdélníku“ (obsah).
  - Odhad před výpočtem.
- **Obrázky:** žádné.

#### Pythagorova věta · [m8_pythagoras.html](obsah/m8_pythagoras.html)
- **Zařazení:** Matematika › Geometrie · 8. r. · lekce A
- **Popis:** Jak věta funguje (čtverce nad stranami), výpočet přepony a odvěsny, slovní úlohy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák najde přeponu v libovolně otočeném pravoúhlém trojúhelníku a vypočítá chybějící stranu.
- **Vylepšení:**
  - Přeskládání čtverců (důkaz bez slov) jako animace.
  - Trojúhelníky v náhodném otočení; žák nejdřív klepne na přeponu.
  - Slovní úlohy s obrázkem (žebřík u zdi, úhlopříčka televize, zkratka přes park).
- **Obrázky:**
  - `IMG-m-11` ⚪ **A** · 4 scény k úlohám (žebřík opřený o dům, drak na provázku, zkratka přes trávník, stožár s kotvicím lanem) — kontext; rozměry kreslí web

#### Válec · [m8_valec.html](obsah/m8_valec.html)
- **Zařazení:** Matematika › Geometrie · 8. r. · lekce A
- **Popis:** Síť válce, objem, povrch, slovní úlohy (oprava z etapy 01).
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák nakreslí síť válce a spočítá jeho povrch a objem.
- **Vylepšení:**
  - Rozvinutí pláště s posuvníky r a v — vysoký úzký i nízký široký válec.
  - Úloha „plechovka“: kolik plechu a kolik se vejde.
- **Obrázky:** žádné.

#### Trigonometrie · [trigonometrie.html](obsah/trigonometrie.html)
- **Zařazení:** Matematika › Geometrie · 9. r. · dril D
- **Popis:** Odvěsna z přepony, přepona z odvěsny, mix; canvas s trojúhelníkem.
- **Funkčnost:** 3 režimy, nová série.
- **Cíl výuky:** Žák použije sin, cos a tg k výpočtu strany pravoúhlého trojúhelníku.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Posuvník úhlu: přilehlá, protilehlá a přepona se obarví vzhledem ke zvolenému vrcholu.
  - Měření výšky stromu (úhloměr + vzdálenost) jako praktická úloha.
- **Obrázky:** využít `IMG-m-11` (strom, stožár).

#### Podobnost · [m9_podobnost.html](obsah/m9_podobnost.html)
- **Zařazení:** Matematika › Geometrie · 9. r. · lekce B
- **Popis:** Zvětšovadlo, měření stínem, podobné/nepodobné, věty o podobnosti, poměr podobnosti, dopočet strany, plány a modely.
- **Funkčnost:** 8 režimů, interaktivní modely.
- **Cíl výuky:** Žák určí poměr podobnosti a dopočítá délky i obsahy podobných útvarů.
- **Vylepšení:**
  - Ve zvětšovadle vedle poměru délek i poměr obsahů (k²).
  - Měření stínem se scénou a otázkou, kdy je metoda použitelná.
  - 🔗 Rozdělit osm režimů do fází Výuka / Procvič, aby lekce nepůsobila jako seznam.
- **Obrázky:**
  - `IMG-m-12` ⚪ **A** · scéna „měření stínem“: strom a tyč na louce ve stejném slunci, dlouhé stíny — model pro úlohu; úsečky a čísla kreslí web

#### Jehlan, kužel a koule · [m9_jehlan_kuzel.html](obsah/m9_jehlan_kuzel.html)
- **Zařazení:** Matematika › Geometrie · 9. r. · lekce B
- **Popis:** Modelárna, rozbalení sítě, proč třetina, jehlan, kužel, koule, poznej vzorec.
- **Funkčnost:** 7 režimů.
- **Cíl výuky:** Žák spočítá objem a povrch jehlanu, kuželu a koule a vysvětlí třetinu v objemu.
- **Vylepšení:**
  - Jedno nastavení rozměrů sdílené modelárnou, sítí i výpočtem.
  - „Proč třetina“: přelévání písku z jehlanu do hranolu stejné podstavy a výšky.
- **Obrázky:** žádné.

#### Lineární rovnice · [rovnice.html](obsah/rovnice.html)
- **Zařazení:** Matematika › Algebra a funkce · 8.–9. r. · samostatná F
- **Popis:** Rovnice jako váhy a pět typů rovnic s celočíselným řešením.
- **Funkčnost:** váhy, volba typu, potvrzení.
- **Cíl výuky:** Žák řeší lineární rovnice ekvivalentními úpravami a provede zkoušku.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`; váhy vytáhnout do 🧩 vah.
  - Historie úprav vedle vah: každý krok „−3 na obou stranách“ jako řádek.
  - Zkouška dosazením jako povinný poslední krok; hranice modelu vah u záporných čísel.
- **Obrázky:** žádné.

#### Výrazy a jejich úpravy · [m8_vyrazy.html](obsah/m8_vyrazy.html)
- **Zařazení:** Matematika › Algebra a funkce · 8. r. · lekce A
- **Popis:** Roznásobení plochou, roznásobení závorky, vytýkání, vzorce, dosazování.
- **Funkčnost:** 5 režimů, model plochou.
- **Cíl výuky:** Žák roznásobí a vytkne výraz a použije vzorce (a ± b)².
- **Vylepšení:**
  - Chyba (a + b)² = a² + b² vyvrácená chybějícími obdélníky 2ab ve čtverci.
  - Algebraické dlaždice (x², x, 1) k přetahování.
- **Obrázky:** žádné.

#### Grafy funkcí · [grafy_funkci.html](obsah/grafy_funkci.html)
- **Zařazení:** Matematika › Algebra a funkce · 9. r. · simulace F
- **Popis:** Vykreslování funkcí s posuvníky parametrů, hra „Trefa: uhodni parametry“.
- **Funkčnost:** volba funkce, posuvníky, režim trefy.
- **Cíl výuky:** Žák popíše, jak parametry mění graf lineární a kvadratické funkce.
- **Vylepšení:**
  - 🔗 Společná hlavička a fáze; ke hře vysvětlení, co posun způsobil.
  - 🧩 Graf s propojenou tabulkou hodnot a situací (taxi: nástupní cena + cena za km).
- **Obrázky:** žádné.

#### Lomené výrazy · [m9_lomene_vyrazy.html](obsah/m9_lomene_vyrazy.html)
- **Zařazení:** Matematika › Algebra a funkce · 9. r. · lekce A
- **Popis:** Kde výraz „spadne“, podmínky, krácení, sčítání a odčítání, násobení a dělení.
- **Funkčnost:** 5 režimů, živá část.
- **Cíl výuky:** Žák určí podmínky lomeného výrazu a upraví ho krácením a společným jmenovatelem.
- **Vylepšení:**
  - Graf výrazu s dírou v zakázaném bodě, i když zjednodušený zápis tam existuje.
  - 🔗 Paralela se zlomky: stejný postup společného jmenovatele jako v `m7_zlomky_operace`.
- **Obrázky:** žádné.

#### Soustavy rovnic · [m9_soustavy.html](obsah/m9_soustavy.html)
- **Zařazení:** Matematika › Algebra a funkce · 9. r. · lekce A
- **Popis:** Průsečík naživo, řešení soustavy, postup, grafické řešení, slovní úlohy.
- **Funkčnost:** 5 režimů.
- **Cíl výuky:** Žák vyřeší soustavu dvou rovnic dosazovací a sčítací metodou a interpretuje řešení graficky.
- **Vylepšení:**
  - V modelu průsečíku i rovnoběžné a totožné přímky (žádné / nekonečně mnoho řešení).
  - Každý algebraický krok zvýraznit v obou rovnicích.
- **Obrázky:** žádné.

#### Aritmetický průměr · [m5_prumer.html](obsah/m5_prumer.html)
- **Zařazení:** Matematika › Data a finance · 5.–6. r. · lekce A
- **Popis:** Srovnávání sloupečků, výpočet průměru, doplnění chybějícího čísla, porovnání průměrů.
- **Funkčnost:** 4 režimy, tažení sloupců.
- **Cíl výuky:** Žák spočítá průměr a vysvětlí ho jako „rozdělení nastejno“.
- **Vylepšení:**
  - Přesouvání kostiček mezi sloupci, dokud nejsou stejně vysoké.
  - Případ, kdy průměr není žádná z hodnot (2,5 dítěte).
- **Obrázky:** žádné.

#### Přímá a nepřímá úměrnost · [m7_umernost.html](obsah/m7_umernost.html)
- **Zařazení:** Matematika › Data a finance · 7.–8. r. · lekce A
- **Popis:** Úměrnost naživo, přímá/nepřímá, trojčlenka, doplnění tabulky, poznání grafu.
- **Funkčnost:** 5 režimů, živý model.
- **Cíl výuky:** Žák rozliší přímou a nepřímou úměrnost v situaci, tabulce i grafu.
- **Vylepšení:**
  - 🧩 Graf propojený s tabulkou a situací: klepnutí na bod zvýrazní řádek tabulky.
  - Situace, které úměrnost nejsou (věk a výška), aby žák nepředpokládal úměrnost vždy.
- **Obrázky:** žádné.

#### Statistika – průměr, medián, modus · [m8_statistika.html](obsah/m8_statistika.html)
- **Zařazení:** Matematika › Data a finance · 8.–9. r. · lekce A
- **Popis:** Dílna dat, výpočet charakteristik, čtení diagramu, odlehlá hodnota, pojmy.
- **Funkčnost:** 5 režimů, tažení hodnot.
- **Cíl výuky:** Žák spočítá průměr, medián a modus a vybere vhodnou charakteristiku.
- **Vylepšení:**
  - Stejná data se dvěma různě nastavenými osami grafu — „zavádějící graf“.
  - Sběr vlastních dat třídy (výška, cesta do školy) přímo do dílny.
- **Obrázky:** žádné.

#### Kombinatorika a pravděpodobnost · [kombinatorika.html](obsah/kombinatorika.html)
- **Zařazení:** Matematika › Data a finance · 9. r. · dril D
- **Popis:** Řazení a výběr, pravděpodobnost, mix; vzorce permutací a kombinací.
- **Funkčnost:** 3 režimy, nová série.
- **Cíl výuky:** Žák spočítá počet možností výpisem nebo stromem a určí pravděpodobnost jednoduchého jevu.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Strom možností a vypisování karet před vzorcem; otázky „záleží na pořadí?“ a „lze opakovat?“.
  - Simulace hodu kostkou nebo mincí (již existuje v kabinetu) s relativní četností.
- **Obrázky:** žádné.

#### Finanční matematika · [m9_financni.html](obsah/m9_financni.html)
- **Zařazení:** Matematika › Data a finance · 9. r. · lekce A
- **Popis:** Kalkulačka, jednoduchý a složený úrok, porovnání půjček, rodinný rozpočet.
- **Funkčnost:** 5 režimů.
- **Cíl výuky:** Žák spočítá úrok, porovná nabídky půjček podle celkové částky a sestaví jednoduchý rozpočet.
- **Vylepšení:**
  - Časová osa splátek a rozpad celkové částky (jistina × úroky) jako 🧩 proužek.
  - Rozpočet třídy na školní výlet (spoření po měsících).
  - Vyznačit modelové předpoklady (pevná sazba, bez poplatků).
- **Obrázky:** žádné.

### 7.4 Cizí jazyky (25 stránek)

Společné pro jazyky: 🔗 gramatika se učí **v krátkém dialogu nebo scénce**, ne na izolovaných větách. 🧩 Dialog, 🧩 časová osa sloves a stálé barvy rodu (der/le modrá, die/la červená, das zelená) na všech stránkách. Emoji u slovíček nahradí karty B. Poslech řešit nahrávkami, ne syntetickým hlasem (viz `vyslovnost`).

#### Angličtina – první slovíčka · [aj_slovicka.html](obsah/aj_slovicka.html)
- **Zařazení:** Cizí jazyky › Slovní zásoba · AJ 3.–5. r. · samostatná F
- **Popis:** Obrázkové kartičky (emoji) se slovem, výslovností a překladem; kvíz „Co je to anglicky?“.
- **Funkčnost:** kartičky, kvíz, čtení nahlas, ukázat překlad.
- **Cíl výuky:** Žák pozná a pojmenuje anglicky asi 100 běžných věcí a zvířat.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js` a sdílet data s kartičkami (`knihovna_sad`).
  - Emoji nahradit jednotnými kartami B, rozdělit do témat (zvířata, jídlo, dům, škola, oblečení, rodina).
  - Poslech → výběr obrázku ze čtyř; pak krátká věta („The dog is under the table“) s obrázkem.
- **Obrázky:**
  - `IMG-aj-02` 🔴 **B** · sada asi 120 karet slovíček ve 6 tématech (zvířata, jídlo a pití, dům a nábytek, škola, oblečení, rodina a lidé) — jednoznačný motiv, stejné světlo a okraj; **sdílet s `de_slovicka`, `fr_slovicka`, `cj1_pismena`**

#### Pozdravy a představení · [aj3_pozdravy.html](obsah/aj3_pozdravy.html)
- **Zařazení:** Cizí jazyky › Slovní zásoba · AJ 3. r. · lekce A
- **Popis:** Co pozdrav znamená, co odpovíš, pozdravy podle denní doby.
- **Funkčnost:** 3 režimy, předčítání.
- **Cíl výuky:** Žák pozdraví, odpoví na pozdrav a představí se podle situace a denní doby.
- **Vylepšení:**
  - 🧩 Dialog: dva spolužáci se potkají ráno, odpoledne, večer; žák volí repliku.
  - Denní doba jako posuvník slunce na obloze, pozdrav se mění.
  - Odlišit „Good night“ (loučení) od pozdravů při setkání.
- **Obrázky:**
  - `IMG-aj-03` 🟠 **A** · 4 scénky setkání dvou dětí (ráno před školou, odpoledne v parku, večer u domu, loučení před spaním) — kontext pozdravů

#### Anglická nepravidelná slovesa · [aj_slovesa.html](obsah/aj_slovesa.html)
- **Zařazení:** Cizí jazyky › Slovní zásoba · AJ 6.–9. r. · samostatná F
- **Popis:** Tabulka infinitiv – past simple – past participle – význam, doplňování tvarů.
- **Funkčnost:** přehled, doplň tvary, kontrola.
- **Cíl výuky:** Žák zná tři tvary nejčastějších nepravidelných sloves a použije je ve větě.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js` a zařadit do rodiny slovesných časů.
  - Rodiny podobných sloves (sing–sang–sung, drink–drank–drunk; buy–bought, think–thought).
  - Věta ke každému tvaru („Yesterday I went…“, „I have never been…“) s 🧩 časovou osou.
- **Obrázky:** žádné.

#### Němčina – slovíčka · [de_slovicka.html](obsah/de_slovicka.html)
- **Zařazení:** Cizí jazyky › Slovní zásoba · NJ 7.–9. r. · samostatná F
- **Popis:** Slovíčka se členy der/die/das po tématech, přehled, kartičky, kvíz.
- **Funkčnost:** 3 režimy, filtry témat.
- **Cíl výuky:** Žák zná základní slovní zásobu vždy se členem.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`; stálé barvy rodu; kartičky sdílet s `IMG-aj-02`.
  - Hodnotit celý výraz se členem; přidat množné číslo a jednu větu.
- **Obrázky:** sdílet `IMG-aj-02`.

#### Francouzština – slovíčka · [fr_slovicka.html](obsah/fr_slovicka.html)
- **Zařazení:** Cizí jazyky › Slovní zásoba · FJ 7.–9. r. · samostatná F
- **Popis:** Slovíčka se členy le/la/les po tématech, přehled, kartičky, kvíz.
- **Funkčnost:** 3 režimy, filtry témat.
- **Cíl výuky:** Žák zná základní slovní zásobu se členem a pozná rod.
- **Vylepšení:**
  - Stejné jako u němčiny (sjednotit obě stránky do jedné komponenty s volbou jazyka).
  - Vysvětlit l' před samohláskou na příkladech.
- **Obrázky:** sdílet `IMG-aj-02`.

#### Číslovky a určování času (NJ/FJ) · [dcj8_cislovky_cas.html](obsah/dcj8_cislovky_cas.html)
- **Zařazení:** Cizí jazyky › Slovní zásoba · NJ/FJ 8. r. · lekce A
- **Popis:** Číslovky a hodiny v němčině a francouzštině.
- **Funkčnost:** 4 režimy, ciferník v SVG.
- **Cíl výuky:** Žák přečte a řekne čísla do 100 a čas v NJ i FJ.
- **Vylepšení:**
  - 🧩 Ciferník sdílený s `clock_learning`.
  - Skládání čísla z dílků (ein-und-zwanzig; soixante-dix = 60 + 10) barevně.
- **Obrázky:** žádné.

#### Abeceda a hláskování (AJ) · [aj3_abeceda.html](obsah/aj3_abeceda.html)
- **Zařazení:** Cizí jazyky › Gramatika a výslovnost · AJ 3.–4. r. · lekce A
- **Popis:** Jak se čte písmeno, které písmeno slyším, hláskované slovo, co následuje.
- **Funkčnost:** 4 režimy, předčítání.
- **Cíl výuky:** Žák vyjmenuje anglickou abecedu a vyhláskuje své jméno.
- **Vylepšení:**
  - 🧩 Dialog „What's your name? How do you spell it?“ s hláskováním jména.
  - Rozlišit název písmene (A = ej) od zvuku písmene ve slově.
- **Obrázky:** žádné.

#### Přítomný čas prostý · [aj4_pritomny_prosty.html](obsah/aj4_pritomny_prosty.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 4.–5. r. · lekce A (hlavní lekce rodiny časů)
- **Popis:** Doplnění slovesa, do/does, zápor, hledání chyby.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák tvoří oznamovací věty, otázky a zápory v přítomném čase prostém včetně 3. osoby.
- **Vylepšení:**
  - Denní režim jednoho školáka (obrázkový komiks), žák popisuje, co dělá každý den.
  - Barevně putující -s: „He plays“ → „Does he play?“ (-s se přesune do does).
- **Obrázky:**
  - `IMG-aj-04` 🟠 **A** · 8 scén běžného dne jednoho školáka (vstává, snídá, jede do školy, hraje fotbal, dělá úkoly, dívá se na TV, čte, spí) — obrázkový denní režim; použít i v `aj5_pritomny_prubehovy`

#### Předložky místa a času · [aj4_predlozky.html](obsah/aj4_predlozky.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 4.–5. r. · lekce A
- **Popis:** Kde je kočka (SVG), předložky času, význam.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák popíše polohu předmětu předložkami in, on, under, next to, behind a použije in/on/at u času.
- **Vylepšení:**
  - Žák sám přetáhne kočku na místo podle věty (a naopak napíše větu podle polohy).
  - Časové předložky na kalendáři a ciferníku (🧩), ne jako seznam.
- **Obrázky:**
  - `IMG-aj-05` 🟠 **B** · pokoj s krabicí, stolem, židlí a postelí + samostatná karta kočky (průhledné pozadí) — kočka se přetahuje na různá místa

#### Množné číslo a členy · [aj4_mnozne_cislo.html](obsah/aj4_mnozne_cislo.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 4. r. · lekce A
- **Popis:** Množné číslo (-s, -es, -ies), nepravidelná množná čísla, a/an.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák vytvoří množné číslo a zvolí a/an podle prvního zvuku.
- **Vylepšení:**
  - Obrázek jednoho a více předmětů; žák napíše tvar.
  - a/an podle zvuku: „an hour, a university“ jako výslovné protipříklady.
- **Obrázky:** sdílet `IMG-aj-02` (varianty „jeden / tři“ u 20 karet).

#### Trenažér časování sloves · [casovani_sloves.html](obsah/casovani_sloves.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ/NJ/FJ 4.–9. r. · dril D
- **Popis:** Přítomný čas v angličtině, němčině a francouzštině, druhá šance.
- **Funkčnost:** volba jazyka, nová série.
- **Cíl výuky:** Žák správně vyčasuje pravidelná a nejčastější nepravidelná slovesa v přítomném čase.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`; sjednotit data s `dcj8_casovani` a `aj4_pritomny_prosty`, aby hodnocení stejných tvarů bylo stejné.
  - Tabulka časování, ve které se po odpovědi rozsvítí příslušná osoba.
- **Obrázky:** žádné.

#### Přítomný čas průběhový · [aj5_pritomny_prubehovy.html](obsah/aj5_pritomny_prubehovy.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 5.–6. r. · lekce A
- **Popis:** Tvar s -ing, am/is/are, prostý × průběhový, popis obrázku (dnes emoji).
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše, co se právě děje, a rozliší to od toho, co se děje obvykle.
- **Vylepšení:**
  - Rušná scéna (park), žák klepne na postavu a popíše, co dělá právě teď.
  - Dvojice „obvykle / právě teď“ (chlapec obvykle hraje fotbal, ale teď čte).
- **Obrázky:**
  - `IMG-aj-06` 🔴 **A** · rušná scéna v parku s 10 osobami, z nichž každá dělá jednu jasnou činnost (běží, čte, jí zmrzlinu, venčí psa, hraje na kytaru, spí na lavičce, jede na kole, fotí, krmí kachny, maluje) — hotspoty pro popis „právě teď“

#### Can, must – modální slovesa · [aj5_modalni.html](obsah/aj5_modalni.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 5.–6. r. · lekce A
- **Popis:** Význam, doplnění slovesa, značky a pravidla, správný tvar.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák použije can, can't, must, mustn't a rozliší zákaz od nepovinnosti.
- **Vylepšení:**
  - Značky a pravidla jako skutečné cedule (koupaliště, knihovna, silnice).
  - Dvojice „mustn't × don't have to“ na situacích.
- **Obrázky:**
  - `IMG-aj-07` 🟠 **B** · 8 cedulí bez textu (zákaz koupání, zákaz psů, zákaz telefonu, povinná přilba, zákaz jízdy na kole, ticho v knihovně, povinnost mýt ruce, zákaz krmení zvířat) — piktogramy v jednotném stylu

#### Minulý čas prostý · [aj6_minuly_cas.html](obsah/aj6_minuly_cas.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 6.–7. r. · lekce A
- **Popis:** Tvar slovesa, nepravidelná slovesa, otázka a zápor s did, kdy patří minulý čas.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vypráví o včerejšku v minulém čase včetně otázek a záporů.
- **Vylepšení:**
  - Příběh „Výlet k moři“ v obrázcích, žák doplňuje tvary v souvislém textu.
  - Poslech výslovnosti -ed (/t/, /d/, /ɪd/) tříděním do tří košů.
- **Obrázky:**
  - `IMG-aj-08` 🟠 **A** · 6 obrázků příběhu „Výlet k moři“ (balení, vlak, pláž, déšť, kavárna, návrat) — vyprávění v minulém čase

#### Stupňování přídavných jmen · [aj6_stupnovani.html](obsah/aj6_stupnovani.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 6.–7. r. · lekce A
- **Popis:** Druhý a třetí stupeň, pravidla, doplnění do věty, porovnání obrázků (emoji).
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák porovná dvě a více věcí správným stupněm přídavného jména.
- **Vylepšení:**
  - Tři objekty s měnitelnými vlastnostmi (velikost, rychlost, cena) — žák tvoří věty.
  - Stejné tři objekty, jiná vlastnost → jiné pořadí.
- **Obrázky:**
  - `IMG-aj-09` 🟠 **B** · 5 trojic ke srovnání (tři psi různé velikosti, tři auta, tři domy, tři hory, tři dorty) — stejný styl, na kartě jeden objekt

#### Budoucí čas – will a going to · [aj7_budouci.html](obsah/aj7_budouci.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 7. r. · lekce A
- **Popis:** will × going to, správný tvar, otázka a zápor, k čemu slouží.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší okamžité rozhodnutí, plán a předpověď a zvolí will nebo going to.
- **Vylepšení:**
  - Situace s kontextem: „Look at those clouds! It's going to rain“ (vidím důkaz) × „I think it will rain tomorrow“.
  - U vět, kde jsou možné obě formy, přijímat obě.
- **Obrázky:**
  - `IMG-aj-10` ⚪ **A** · 4 situace s viditelným důkazem (tmavé mraky, sklenice na kraji stolu, prázdná nádrž, dívka s lístky na koncert) — kontext going to

#### Počitatelná a nepočitatelná podstatná jména · [aj7_pocitatelnost.html](obsah/aj7_pocitatelnost.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 7. r. · lekce A
- **Popis:** Počitatelné/nepočitatelné, some/any, much/many/a lot of, míry.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší počitatelná a nepočitatelná podstatná jména a vyjádří množství.
- **Vylepšení:**
  - Nákupní seznam a nádoby (a bottle of, a loaf of, a piece of) přetahované k potravinám.
  - Nabídky se some v otázce („Would you like some tea?“).
- **Obrázky:**
  - `IMG-aj-11` 🟠 **B** · 12 karet nádob a porcí (láhev, bochník, kus, sklenice, balíček, plechovka, miska, šálek, kostka, plátek, pytel, krabice) — míry nepočitatelných věcí

#### Členy a rod podstatných jmen (NJ/FJ) · [dcj7_cleny.html](obsah/dcj7_cleny.html)
- **Zařazení:** Cizí jazyky › Gramatika · NJ/FJ 7.–8. r. · lekce A (hlavní lekce druhého jazyka)
- **Popis:** der/die/das, rod podle koncovky, le/la, un/une.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák se učí podstatná jména se členem a zná pomůcky pro určení rodu.
- **Vylepšení:**
  - 🔗 Stálé barvy rodu na celém webu (i v kartičkách a tabulkách).
  - Tři barevné „domky“ pro třídění karet s obrázkem.
  - Koncovky jako pomůcka s výjimkami.
- **Obrázky:** sdílet `IMG-aj-02`.

#### Výslovnost a abeceda (NJ/FJ) · [dcj7_vyslovnost.html](obsah/dcj7_vyslovnost.html)
- **Zařazení:** Cizí jazyky › Gramatika a výslovnost · NJ/FJ 7. r. · lekce A
- **Popis:** Jak se čte (NJ, FJ), hláskování, zvláštní znaky; český přepis.
- **Funkčnost:** 4 režimy (bez hlasu).
- **Cíl výuky:** Žák přečte typické skupiny hlásek (ei, ie, sch; ou, eau, oi) a napíše zvláštní znaky.
- **Vylepšení:**
  - Nahrávky slov (viz `vyslovnost`), poloha úst u ü/ö a nosovek.
  - Pravidlo → slovo → nahrávka jako tři sloupce.
- **Obrázky:** sdílet `IMG-aj-01`.

#### Časování pravidelných sloves (NJ/FJ) · [dcj8_casovani.html](obsah/dcj8_casovani.html)
- **Zařazení:** Cizí jazyky › Gramatika · NJ/FJ 8. r. · lekce A
- **Popis:** Doplnění tvaru v NJ a FJ, tabulka, určení osoby.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vyčasuje pravidelné sloveso v přítomném čase.
- **Vylepšení:**
  - Osoby jako obrázky mluvčích (ich = mluvčí ukazuje na sebe, du = na druhého…).
  - Kmen a koncovka barevně odlišené.
  - 🔗 Stejná data jako `casovani_sloves`.
- **Obrázky:** využít karty osob `IMG-cj-06`.

#### Předpřítomný čas · [aj8_predpritomny.html](obsah/aj8_predpritomny.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 8. r. · lekce A
- **Popis:** have/has + příčestí, předpřítomný × minulý, ever/never/just/already/yet, zkušenosti.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák použije předpřítomný čas pro zkušenosti a změny s dopadem na přítomnost a odliší ho od minulého.
- **Vylepšení:**
  - 🧩 Časová osa sloves: minulý čas = uzavřený bod, předpřítomný = oblouk až do „teď“.
  - Rozhovor o zkušenostech („Have you ever…?“) s odpověďmi v minulém čase (kdy přesně).
- **Obrázky:** žádné.

#### Trpný rod · [aj8_trpny_rod.html](obsah/aj8_trpny_rod.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 8.–9. r. · lekce A
- **Popis:** Převod do trpného rodu, tvar be, třetí tvar, kdy trpný rod použít.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák převede větu do trpného rodu a zvolí ho, když je důležitý děj, ne původce.
- **Vylepšení:**
  - Věta jako bloky: podmět a předmět si vymění místo, by + původce se odsune.
  - Novinové titulky a návody („Bread is made from…“) jako přirozený kontext.
- **Obrázky:** žádné.

#### Minulý čas – úvod (NJ/FJ) · [dcj9_minuly.html](obsah/dcj9_minuly.html)
- **Zařazení:** Cizí jazyky › Gramatika · NJ/FJ 9. r. · lekce A
- **Popis:** haben/sein, Partizip II, avoir/être, doplnění tvaru.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vytvoří perfektum a passé composé a zvolí pomocné sloveso.
- **Vylepšení:**
  - Rámcová konstrukce věty (pomocné sloveso na 2. místě, příčestí na konci) jako dva bloky.
  - Slovesa pohybu a změny stavu jako „dům être“ (známá pomůcka) nakreslená jako schéma.
- **Obrázky:** žádné.

#### Nepřímá řeč · [aj9_neprima_rec.html](obsah/aj9_neprima_rec.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 9. r. · pilot C
- **Popis:** Vzorová lekce: dialog učitelky a žáka s místem a časem, šest kroků posunu zájmen, času a místa, přepnutí vypravěče, procvičování.
- **Funkčnost:** vedená aktivita, 4 režimy procvičování, návaznosti.
- **Cíl výuky:** Žák převypráví sdělení podle mluvčího, adresáta, času a místa.
- **Vylepšení:**
  - 🧩 Vytáhnout dialog do sdílené komponenty (vzor pro všechny jazyky).
  - Obrázek situace k dialogu (knihovna, škola) — dnes jen text.
  - Fáze Ověř se.
- **Obrázky:** využít karty osob `IMG-cj-06`.

#### Podmínkové věty · [aj9_podminkove.html](obsah/aj9_podminkove.html)
- **Zařazení:** Cizí jazyky › Gramatika · AJ 9. r. · lekce A
- **Popis:** Který kondicionál, první a druhý kondicionál, reálné × nereálné.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší reálnou a nereálnou podmínku a vytvoří věty nultého, prvního a druhého kondicionálu.
- **Vylepšení:**
  - Rozcestí: „If it rains…“ → dvě větve se skutečnými následky; „If I were a bird…“ → větev ve snové bublině.
  - Žák vysvětlí rozdíl významu dvou podobných vět.
- **Obrázky:** žádné.

### 7.5 Prvouka a vlastivěda (17 stránek)

Společné pro prvouku: 🔗 malý žák se učí z **obrazu a situace**, ne ze slovního popisu. Zde je potřeba obrázků nejvíc. Doporučuji jednu společnou ilustrovanou **„naši vesnici“** (scéna A), ze které vycházejí plán obce, cesta do školy, roční období i ekosystémy. Stejná krajina ve čtyřech ročních obdobích spojí stránky do celku.

#### Rodina a domov · [prv1_rodina.html](obsah/prv1_rodina.html)
- **Zařazení:** Prvouka › Člověk a jeho svět · 1.–2. r. · samostatná F
- **Popis:** Rodokmen, kdo je kdo, co se kde doma dělá; upozornění na různé podoby rodin.
- **Funkčnost:** 3 režimy, předčítání.
- **Cíl výuky:** Žák pojmenuje členy rodiny a jejich vztahy a přiřadí činnosti k místnostem.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Rodokmen fiktivní rodiny (bez sdílení vlastních údajů), klepací postavy.
  - Řez domem s místnostmi, přetahování činností.
- **Obrázky:**
  - `IMG-prv-01` 🔴 **B** · karty členů rozšířené fiktivní rodiny (babička, dědeček, máma, táta, teta, strýc, bratranec, mladší sourozenec) v jednotném stylu — rodokmen
  - `IMG-prv-02` 🟠 **A** · řez rodinným domem (kuchyň, obývák, koupelna, dětský pokoj, ložnice, předsíň) bez lidí — hotspoty místností

#### Cesta do školy a bezpečnost · [prv1_cesta_skola.html](obsah/prv1_cesta_skola.html)
- **Zařazení:** Prvouka › Člověk a jeho svět · 1.–2. r. · samostatná F
- **Popis:** Co je na cestě, kdy smím přejít, jak se zachovám.
- **Funkčnost:** 3 režimy, SVG, předčítání.
- **Cíl výuky:** Žák bezpečně přejde silnici, pozná nebezpečná místa a ví, jak se zachovat.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Plán cesty (z naší vesnice) s rozhodovacími místy: přechod, zaparkované auto, semafor, cizí člověk.
  - Pohled „co vidí řidič / co vidí dítě“ za zaparkovaným autem.
- **Obrázky:**
  - `IMG-prv-03` 🔴 **A** · pohled shora na cestu do školy v naší vesnici (dům, chodník, přechod se semaforem, přechod bez semaforu, zastávka, zaparkovaná auta, škola) — hotspoty rozhodovacích míst
  - `IMG-prv-04` 🟠 **B** · 8 karet dopravních značek a situací (přechod, semafor červená/zelená, dítě za autem, reflexní prvky, cyklista s přilbou) — piktogramy bez textu

#### Zdraví, nemoc a první pomoc · [prv2_zdravi.html](obsah/prv2_zdravi.html)
- **Zařazení:** Prvouka › Člověk a jeho svět · 2.–3. r. · lekce A
- **Popis:** Komu zavolat (155, 150, 158, 112), co udělat při úrazu, zdravé/nezdravé.
- **Funkčnost:** 3 režimy, předčítání.
- **Cíl výuky:** Žák zavolá pomoc, řekne, co se stalo a kde, a zvládne ošetření drobného poranění.
- **Vylepšení:**
  - Nacvičený telefonát: dispečer (text/hlas) se ptá, žák vybírá odpovědi (kdo, co, kde).
  - 🔗 Postupy převzít z revidované lekce `pr8_prvni_pomoc` (jeden zdroj pravdy), uvést datum revize.
- **Obrázky:**
  - `IMG-prv-05` 🟠 **B** · karty záchranných složek (sanitka, hasiči, policie) a 6 situací (odřené koleno, krvácení z nosu, popálení, bodnutí vosou, pád z kola, cizí člověk v bezvědomí) — bez krve a drastických detailů

#### Zdravý životní styl · [prv5_zdravy_styl.html](obsah/prv5_zdravy_styl.html)
- **Zařazení:** Prvouka › Člověk a jeho svět · 5. r. · lekce A
- **Popis:** Potravinová pyramida, co je zdravější, režim dne, pravda/mýtus.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák sestaví pestrý jídelníček a vyvážený režim dne.
- **Vylepšení:**
  - Talíř (místo binárního zdravé/nezdravé): žák skládá oběd z karet a vidí poměr skupin.
  - Režim dne jako kruh 24 hodin (spánek, škola, pohyb, obrazovka).
  - Doporučení s věkovým rozsahem a zdrojem.
- **Obrázky:**
  - `IMG-prv-06` 🟠 **B** · 30 karet potravin (sdílet s jídlem v `IMG-aj-02`, doplnit celozrnné pečivo, luštěniny, ořechy, sladkosti, slazené nápoje) — skládání talíře

#### Roční období a čas · [prv1_rocni_obdobi.html](obsah/prv1_rocni_obdobi.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 1.–2. r. · samostatná F
- **Popis:** Které období, seřaď měsíce, měsíc a období, dny v týdnu.
- **Funkčnost:** 4 režimy, předčítání.
- **Cíl výuky:** Žák vyjmenuje roční období, měsíce a dny a pozná období podle znaků v přírodě.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Kruh roku: stejná krajina naší vesnice ve čtyřech obdobích, posuvník měsíců.
  - Znaky období na obrázku (hotspoty: kvetoucí strom, odlétající ptáci, sníh).
- **Obrázky:**
  - `IMG-prv-07` 🔴 **A** · naše vesnice ze stejného úhlu ve 4 ročních obdobích (jaro, léto, podzim, zima), se stejným stromem, rybníkem, polem a zahradou — **klíčová sada pro celou prvouku**

#### Lidské tělo a smysly · [prv1_smysly.html](obsah/prv1_smysly.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 1.–2. r. · samostatná F
- **Popis:** Části těla, čím co poznám, smysl a orgán.
- **Funkčnost:** 3 režimy, SVG postava, předčítání.
- **Cíl výuky:** Žák pojmenuje části těla a přiřadí vjem ke smyslu a orgánu.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Postava dítěte s hotspoty (hmat po celé kůži).
  - Pozorovací úkoly do třídy („zavři oči a poznej předmět hmatem“).
- **Obrázky:**
  - `IMG-prv-08` 🟠 **B** · celá postava dítěte zepředu v neutrálním postoji — hotspoty částí těla
  - `IMG-prv-09` ⚪ **B** · 10 karet vjemů (zvonek, citron, růže, oheň, zmrzlina, tráva, kočka, duha, bubínek, polštář) — čím to poznám

#### Domácí a volně žijící zvířata · [prv2_zvirata.html](obsah/prv2_zvirata.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 2.–3. r. · lekce A
- **Popis:** Domácí × volně žijící, mláďata, kde bydlí, k čemu je chováme.
- **Funkčnost:** 4 režimy (textové).
- **Cíl výuky:** Žák rozliší domácí a volně žijící zvířata, pojmenuje mláďata a příbytky.
- **Vylepšení:**
  - Poznávání podle obrázku (dnes jen slovo).
  - Dvojice dospělec–mládě k přiřazení.
  - Statek a les z naší vesnice jako dvě scény, zvířata se přetahují.
- **Obrázky:**
  - `IMG-prv-10` 🔴 **B** · 30 karet zvířat: 15 domácích (kráva, prase, koza, ovce, kůň, slepice, husa, kachna, králík, pes, kočka, morče, osel, krůta, včela) a 15 volně žijících (liška, srna, zajíc, ježek, veverka, divočák, jezevec, sova, datel, čáp, žába, ropucha, užovka, vydra, bobr)
  - `IMG-prv-11` 🟠 **B** · 12 karet mláďat k domácím zvířatům (tele, sele, kůzle, jehně, hříbě, kuře…) — dvojice dospělec–mládě

#### Živá a neživá příroda · [prv3_ziva_neziva.html](obsah/prv3_ziva_neziva.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 3. r. · lekce A
- **Popis:** Živé/neživé, třídění přírodnin, znaky života.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák rozliší živé a neživé přírodniny podle znaků života a zná hraniční případy.
- **Vylepšení:**
  - Kontrolní seznam znaků života, žák odškrtává u konkrétní přírodniny (krystal roste, ale nedýchá).
  - Hraniční případy: semeno, suchý list, houba, krystal soli.
- **Obrázky:**
  - `IMG-prv-12` 🟠 **C** · 16 fotografií přírodnin (kámen, krystal soli, semeno fazole, klíčící fazole, suchý list, zelený list, houba, mech, voda, oblak, šnek, mravenec, peří, kost, písek, jablko)

#### Voda, vzduch a půda · [prv3_voda_vzduch.html](obsah/prv3_voda_vzduch.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 3.–4. r. · lekce A
- **Popis:** Skupenství vody, koloběh vody, vzduch a půda.
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák popíše skupenství vody a koloběh vody v přírodě a vysvětlí význam vzduchu a půdy.
- **Vylepšení:**
  - Koloběh vody jako animovaná scéna (odpařování, mraky, déšť, řeka); 🧩 částicový model v jednoduché podobě.
  - Pokus do třídy (sklenice s ledem) a otázka „odkud jsou kapky?“.
  - Řez půdou s vrstvami a živočichy.
- **Obrázky:**
  - `IMG-prv-13` 🔴 **A** · koloběh vody v krajině (moře/rybník, slunce, stoupající pára, mraky, déšť nad horami, řeka, podzemní voda) — podklad animace; šipky kreslí web
  - `IMG-prv-14` 🟠 **A** · řez půdou (tráva a kořeny, humus, podorniční vrstva, hornina, žížala, krtek) — hotspoty vrstev

#### Ekosystémy – les, louka, voda · [prv4_ekosystemy.html](obsah/prv4_ekosystemy.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 4.–5. r. · lekce A
- **Popis:** Kam organismus patří, potravní řetězec, kdo je kdo, lesní patra.
- **Funkčnost:** 4 režimy (textové).
- **Cíl výuky:** Žák přiřadí organismy k ekosystému, sestaví potravní řetězec a popíše patra lesa.
- **Vylepšení:**
  - Tři scény (les, louka, rybník) s hotspoty organismů; všechny režimy pracují se stejnými obrazy.
  - 🧩 Řetězec a síť: přetahování karet, směr šipky „kdo je potravou komu“.
  - 🔗 Návaznost na `pr9_ekologie` (stejné ilustrace ve zjednodušené podobě).
- **Obrázky:**
  - `IMG-prv-15` 🔴 **A** · les v řezu s patry (kořenové, mechové, bylinné, keřové, stromové) a 12 typickými organismy — hotspoty
  - `IMG-prv-16` 🔴 **A** · louka a pole s 10 organismy (sdílený styl s `ekologie-krajina-ilustrace`) — hotspoty
  - pro rybník použít existující `Prirodopis/ekologie-rybnik-ilustrace`

#### Horniny a nerosty · [prv4_horniny.html](obsah/prv4_horniny.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 4.–5. r. · lekce A
- **Popis:** Poznej podle popisu, hornina × nerost, k čemu se používá (vše textově).
- **Funkčnost:** 3 režimy.
- **Cíl výuky:** Žák pozná běžné horniny a nerosty podle vzhledu a vlastností a ví, k čemu se používají.
- **Vylepšení:**
  - Poznávání podle fotografie, ne podle slovního popisu.
  - Virtuální zkoušky: vryp nehtem, ocel, ocet (šumí/nešumí) jako animace.
  - 🔗 Stejné fotografie a data jako `pr9_mineraly` (jedna sada).
- **Obrázky:**
  - `IMG-prv-17` 🔴 **C** · fotografie 16 vzorků (žula, pískovec, vápenec, čedič, břidlice, mramor, uhlí, křemen, živec, slída, kalcit, sůl kamenná, sádrovec, pyrit, grafit, magnetit) na neutrálním pozadí se stejným světlem; **sdílet s `pr9_mineraly`**
  - `IMG-prv-18` ⚪ **C** · 8 fotografií využití (dlažba ze žuly, pískovcová socha, vápenka, uhelný lom, sklo z písku, sádra, tužka, solnička)

#### Energie a její zdroje · [prv5_energie.html](obsah/prv5_energie.html)
- **Zařazení:** Prvouka › Příroda kolem nás · 5. r. · lekce A
- **Popis:** Obnovitelné zdroje, poznej elektrárnu, cesta elektřiny, jak ušetřit.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší obnovitelné a neobnovitelné zdroje a popíše cestu elektřiny do zásuvky.
- **Vylepšení:**
  - Krajina s elektrárnami (hotspoty), cesta elektřiny jako animované vedení až do domu v naší vesnici.
  - Spotřebiče doma s „ukazatelem spotřeby“ (🔗 navazuje na `elektrina` – spotřeba a cena).
- **Obrázky:**
  - `IMG-prv-19` 🟠 **A** · krajina s elektrárnami (vodní, větrná, solární pole, uhelná, jaderná, bioplynová stanice) propojená vedením k vesnici — hotspoty; sdílet s `f9_stridavy_proud`

#### Naše obec a kraj · [prv3_obec.html](obsah/prv3_obec.html)
- **Zařazení:** Prvouka › Naše vlast · 3.–4. r. · lekce A
- **Popis:** Světové strany, plán obce, kam zajdeš (úřady a služby), kraje a města.
- **Funkčnost:** 4 režimy, SVG plán.
- **Cíl výuky:** Žák se orientuje na plánu obce podle světových stran a ví, kam jít pro jakou službu.
- **Vylepšení:**
  - Plán naší vesnice (stejná ilustrace, pohled shora) se skutečnou cestou a popisem odbočení.
  - Otočený plán se severkou.
  - 🧩 Mapa krajů s vyhledáním vlastního kraje a obce.
- **Obrázky:**
  - `IMG-prv-20` 🔴 **A** · plán naší vesnice/městečka shora (obecní úřad, pošta, škola, lékař, obchod, knihovna, hasičská zbrojnice, kostel, nádraží, park) — hotspoty; stejné místo jako `IMG-prv-03` a `IMG-prv-07`

#### Nejstarší české dějiny · [prv4_nejstarsi_dejiny.html](obsah/prv4_nejstarsi_dejiny.html)
- **Zařazení:** Prvouka › Naše vlast a dějiny · 4.–5. r. · lekce A
- **Popis:** Kdo to byl, kdy to bylo, seřaď události, staré pověsti.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák seřadí hlavní období od příchodu Slovanů po Karla IV. a odliší pověst od doložené události.
- **Vylepšení:**
  - 🧩 Časová osa pro 1. stupeň (století jako dílky), s obrázkovými kartami období.
  - Rámeček „pověst / víme z pramenů“ u každé postavy.
  - Každodenní život (dům, jídlo, práce) v Sámově době a za Karla IV. jako dvě scény.
- **Obrázky:**
  - `IMG-prv-21` 🟠 **A** · 2 rekonstrukce každodenního života (slovanské hradiště 9. století, Praha za Karla IV.) označené jako rekonstrukce — srovnání
  - `IMG-prv-22` ⚪ **E** · 6 doložených vyobrazení (Karel IV. z Karlštejna, Svatováclavská koruna, Vyšehradský kodex, velkomoravský šperk…) — skutečné doklady

#### Mapa, plán a světové strany · [prv4_mapy_smery.html](obsah/prv4_mapy_smery.html)
- **Zařazení:** Prvouka › Naše vlast · 4.–5. r. · lekce A
- **Popis:** Mapové značky, kde to leží, měřítko mapy.
- **Funkčnost:** 3 režimy, SVG.
- **Cíl výuky:** Žák čte mapové značky, určí směr podle severky a změří vzdálenost podle měřítka.
- **Vylepšení:**
  - Stejné místo jako obrázek (naše vesnice) a jako mapa se značkami vedle sebe — přechod od obrazu k mapě.
  - Měření vzdálenosti pravítkem na mapě a převod měřítkem.
- **Obrázky:** využít `IMG-prv-20` (plán) jako protějšek mapy.

#### Státní symboly a instituce · [prv5_statni_symboly.html](obsah/prv5_statni_symboly.html)
- **Zařazení:** Prvouka › Naše vlast · 5. r. · lekce A
- **Popis:** Poznej symbol (dva státní znaky ve SVG), kdo co má na starost, tři moci, státní svátky.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák pozná sedm státních symbolů, rozliší tři moci ve státě a zná státní svátky.
- **Vylepšení:**
  - Všech sedm symbolů v přesné podobě (vlajka, prezidentská standarta, pečeť, barvy, hymna s poslechem).
  - Přiřazení symbolu k situaci použití (budova úřadu, pas, sportovní utkání).
  - Tři moci jako tři budovy s rolí (Sněmovna, vláda, soud).
- **Obrázky:**
  - `IMG-prv-23` 🔴 **E** · přesné předlohy zbývajících symbolů: státní vlajka, vlajka prezidenta republiky, státní pečeť (SVG z Wikimedia Commons) + nahrávka hymny s volnou licencí
  - `IMG-prv-24` 🟠 **C** · fotografie budov Poslanecké sněmovny, Senátu, Úřadu vlády, Pražského hradu, Ústavního soudu

#### 20. století v našich dějinách · [prv5_dejiny_20.html](obsah/prv5_dejiny_20.html)
- **Zařazení:** Prvouka › Naše vlast a dějiny · 5. r. · lekce A
- **Popis:** Kdy se to stalo, co se stalo, kdo to byl, seřaď události (1918–1989).
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák seřadí hlavní mezníky 20. století a popíše, jak změnily život lidí.
- **Vylepšení:**
  - 🧩 Časová osa s dobovou fotografií u každého mezníku a otázkou „co se změnilo pro rodinu?“.
  - Příběh jedné (fiktivní, ale věrohodné) rodiny přes celé století.
  - 🔗 Stejná osa a fotografie jako `d9_*` pro 9. ročník.
- **Obrázky:**
  - `IMG-prv-25` 🟠 **E** · 8 dobových fotografií s volnou licencí (28. říjen 1918, Masaryk, mobilizace 1938, osvobození 1945, únor 1948, srpen 1968, listopad 1989 na Václavském náměstí, první svobodné volby) — sdílet s dějepisem 9. r.

### 7.6 Fyzika (23 stránek)

Společné pro fyziku: web má **výborné simulace** (páka, optika, elektřina, tunel, vodní hladina), ale bez učební cesty, a **krátké kvízové lekce** bez modelu. 🔗 Spojit je: každá kvízová lekce A dostane fázi Výuka z příslušné simulace (odkaz s nastaveným stavem nebo vložený zjednodušený model) a každá simulace E tři úkoly „předpověz → vyzkoušej → vysvětli“ a fázi Ověř se. Jednotné značení veličin a stálé barvy: síla červená šipka, rychlost modrá, energie zelená; g = 9,81 N/kg s poznámkou „ve výpočtech 10“ na jednom místě webu. Obrázky potřebuje fyzika hlavně jako **fotografie skutečných přístrojů a situací**, samotné děje kreslí kód.

#### Hustota · [f6_hustota.html](obsah/f6_hustota.html)
- **Zařazení:** Přírodní vědy › Fyzika · 6.–7. r. · lekce A
- **Popis:** Výpočet hustoty, hmotnosti, bude plavat, co je těžší.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák vypočítá hustotu z hmotnosti a objemu a předpoví, zda těleso plave.
- **Vylepšení:**
  - Virtuální laboratoř: váha + odměrný válec, žák kostku zváží, ponoří a z odečtených hodnot spočítá hustotu.
  - Stejný objem různých látek na vahách (🧩 váhy) a stejná hmotnost různých objemů.
  - Plavání: kostka se ponoří do vody, oleje a rtuti; loď z oceli jako „průměrná hustota“.
- **Obrázky:**
  - `IMG-f-01` 🟠 **B** · 8 karet krychlí stejné velikosti z různých materiálů (dřevo, korek, led, hliník, železo, olovo, polystyren, sklo) — vzhled materiálu pro laboratoř

#### Fyzikální vzorce · [physics_ref.html](obsah/physics_ref.html)
- **Zařazení:** Přírodní vědy › Fyzika · 6.–9. r. · nástroj F (tahák s modelem)
- **Popis:** Výběr vzorce, posuvníky, schéma a graf závislosti, tabulka konstant CODATA.
- **Funkčnost:** výběr vzorce, posuvníky, živé schéma a graf.
- **Cíl výuky:** Žák najde vzorec, pochopí závislost veličin a dosadí s jednotkami.
- **Vylepšení:**
  - 🔗 Stát se **společným tahákem fyziky**: u každého vzorce odkaz do lekce, kde se vysvětluje, a předpoklady použití.
  - Ukázka dosazení s jednotkami krok za krokem.
- **Obrázky:** žádné.

#### Měření fyzikálních veličin · [f6_mereni.html](obsah/f6_mereni.html)
- **Zařazení:** Přírodní vědy › Fyzika · 6. r. · lekce A (hlavní lekce rodiny měření)
- **Popis:** Jednotky, čím se měří, převody, odečet hodnoty ze stupnice.
- **Funkčnost:** 4 režimy, SVG stupnice.
- **Cíl výuky:** Žák zvolí vhodné měřidlo, odečte hodnotu ze stupnice a zapíše ji s jednotkou.
- **Vylepšení:**
  - Realistické stupnice (odměrný válec s meniskem, teploměr, siloměr, posuvné měřidlo) s volbou dílku.
  - Úloha „vyber rozsah“: měřit tloušťku papíru pravítkem nebo sto listů najednou.
- **Obrázky:**
  - `IMG-f-02` 🟠 **C** · 10 fotografií měřidel (pravítko, svinovací metr, posuvné měřidlo, kuchyňská váha, digitální váha, odměrný válec, teploměr lihový a digitální, stopky, siloměr) — poznávání měřidel

#### Fyzikální hřiště · [physics_playground.html](obsah/physics_playground.html)
- **Zařazení:** Přírodní vědy › Fyzika · 6.–7. r. · simulace E
- **Popis:** Kyvadlo, nakloněná rovina, srážky; tempo, krokování, síly, stopa, popisky, energie.
- **Funkčnost:** 3 scény, pauza, krok, tempo ¼–1×, zobrazení sil a energie.
- **Cíl výuky:** Žák pozoruje, jak se mění rychlost a energie tělesa, a vysvětlí to silami.
- **Vylepšení:**
  - 🔗 Společná hlavička a tři úkoly na scénu (Kdy je kyvadlo nejrychlejší? Co změní sklon? Co se stane při srážce stejně těžkých koulí?).
  - Uložené výchozí stavy pro srovnání „před/po“.
- **Obrázky:** žádné.

#### Vlastnosti látek a těles · [f6_vlastnosti_latek.html](obsah/f6_vlastnosti_latek.html)
- **Zařazení:** Přírodní vědy › Fyzika · 6. r. · lekce A s modely (hlavní lekce rodiny látek)
- **Popis:** Látka × těleso, skupenství, částicová stavba, vlastnosti látek, Archimédův zákon.
- **Funkčnost:** 5 režimů, canvas s částicemi a Archimédovou ukázkou.
- **Cíl výuky:** Žák rozliší látku a těleso, popíše skupenství částicovým modelem a vysvětlí vztlak.
- **Vylepšení:**
  - 🧩 Částicový model vytáhnout do knihovny (sdílet s `f8_teplo`, `ch8_smesi`).
  - Archimédes: vytlačená voda do odměrky a síla na siloměru současně.
- **Obrázky:**
  - `IMG-f-03` ⚪ **C** · 12 fotografií předmětů k třídění látka × těleso (sklenice, sklo, lžíce, ocel, svíčka, vosk, cihla, jíl…) — dvojice těleso–látka

#### Páka a jednoduché stroje · [paka.html](obsah/paka.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7.–8. r. · simulace E (velká)
- **Popis:** Páka (dvojzvratná, jednozvratná, páčidlo, vytržení pařezu), kladky a kladkostroj, ozubená kola a soukolí, hodinový strojek; úkoly a dopočítání rovnováhy.
- **Funkčnost:** 3 hlavní části, mnoho scén, tažení, úkoly, nápověda.
- **Cíl výuky:** Žák použije rovnováhu na páce (F₁ · r₁ = F₂ · r₂) a vysvětlí, co ušetří kladka a převod (sílu, ne práci).
- **Vylepšení:**
  - 🔗 Rozdělit do tří doporučených cest („síla a rameno“, „kladky“, „převody“) s cílem a Ověř se.
  - Fotografie skutečného stroje u každé scény (houpačka, nůžky, kolečko, jeřáb, kolo).
- **Obrázky:**
  - `IMG-f-04` 🟠 **C** · 12 fotografií jednoduchých strojů v praxi (houpačka, nůžky, kleště, otvírák, kolečko, louskáček, pinzeta, stavební jeřáb s kladkostrojem, studna s rumpálem, převody jízdního kola, hodinový strojek, klika) — spojení modelu se světem

#### Vrtačka a lis · [vrtacka_lis.html](obsah/vrtacka_lis.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7.–8. r. · simulace E
- **Popis:** Vrtačka (materiál, vrták, otáčky, posuv) a hydraulický lis (úkoly od ložiska po plechovku).
- **Funkčnost:** 2 části, parametry, úkoly, doporučené otáčky.
- **Cíl výuky:** Žák vysvětlí, jak hydraulický lis znásobí sílu za cenu delší dráhy pístu.
- **Vylepšení:**
  - Předpověď síly a dráhy před spuštěním úkolu.
  - 🔗 Propojit s `f7_tlak` (Pascalův zákon) a s `paka` (stejné pravidlo „co získám na síle, ztratím na dráze“).
- **Obrázky:**
  - `IMG-f-05` ⚪ **C** · fotografie stojanové vrtačky a dílenského hydraulického lisu, hydraulického zvedáku auta — skutečné stroje

#### Gravitační hřiště: vzájemná přitažlivost · [gravitacni_hriste2.html](obsah/gravitacni_hriste2.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7. a 9. r. · simulace E
- **Popis:** Tělesa se vzájemně přitahují, těžiště, pole, mřížka, lupy, přednastavené soustavy (dvojhvězda, planeta s měsícem, tři tělesa).
- **Funkčnost:** mnoho scén, vytváření těles, přepínače zobrazení, údaje.
- **Cíl výuky:** Žák pozoruje, že se přitahují obě tělesa, a vysvětlí, co je společné těžiště.
- **Vylepšení:**
  - 🔗 Společná hlavička a úkoly: „Proč Slunce skoro nehne?“, „Kde je těžiště Země a Měsíce?“.
  - Jasně odlišit od `gravitacni_hriste` (dráhy kolem pevného Slunce).
- **Obrázky:** žádné.

#### Tlak v kapalinách a plynech · [f7_tlak.html](obsah/f7_tlak.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7.–8. r. · lekce A
- **Popis:** Hydrostatický tlak, plave/potopí, hydraulický lis, tlak pevného tělesa.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák vypočítá tlak a vysvětlí, na čem závisí hydrostatický tlak.
- **Vylepšení:**
  - Nádoby různého tvaru se stejnou hloubkou (hydrostatický paradox) s ukazatelem tlaku u dna.
  - Tlak pevného tělesa: cihla na třech stěnách, sněžnice × boty.
  - Odkaz na `vrtacka_lis` pro hydrauliku.
- **Obrázky:**
  - `IMG-f-06` ⚪ **B** · karty situací tlaku (sněžnice ve sněhu, jehla, housenkový pás, potápěč, přehrada s tlustou hrází dole) — kontext

#### Kosmický prak: oběžné dráhy · [gravitacni_hriste.html](obsah/gravitacni_hriste.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7. a 9. r. · simulace F
- **Popis:** Vystřelování těles kolem Slunce, stopy, plochy (2. Keplerův zákon), elipsa, vektory, úniková rychlost.
- **Funkčnost:** tažení, přepínače, 4 přednastavené pokusy, údaje.
- **Cíl výuky:** Žák vysvětlí, proč těleso obíhá, a pozoruje Keplerovy zákony.
- **Vylepšení:**
  - Předpověď dráhy před vypuštěním (žák nakreslí odhad).
  - Úkoly ke Keplerovým zákonům s měřením ploch.
- **Obrázky:** žádné.

#### Pohyb tělesa – dráha a rychlost · [f7_pohyb.html](obsah/f7_pohyb.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7. r. · lekce A
- **Popis:** s = v · t, převody m/s ↔ km/h, čtení grafu, rovnoměrný/nerovnoměrný pohyb.
- **Funkčnost:** 4 režimy, SVG graf.
- **Cíl výuky:** Žák vypočítá dráhu, rychlost a čas a přečte graf dráhy na čase.
- **Vylepšení:**
  - Animovaný běžec nebo auto a 🧩 graf s(t) a v(t), na nichž běží stejný okamžik.
  - Předpověď grafu pro zastavení, návrat a zrychlení.
- **Obrázky:** žádné.

#### Proudové motory · [proudove_motory.html](obsah/proudove_motory.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8.–9. r. · simulace E
- **Popis:** Proudění vzduchu motorem, barva podle rychlosti/teploty/tlaku, plyn a rychlost letu, průběh podél motoru.
- **Funkčnost:** posuvníky, 3 barevné režimy, tempo, popisky, graf.
- **Cíl výuky:** Žák popíše čtyři fáze proudového motoru a vysvětlí, co pohání kompresor.
- **Vylepšení:**
  - Krokování sání – komprese – spalování – expanze – výstup s pozastavením.
  - Fotografie skutečného motoru a letadla.
- **Obrázky:**
  - `IMG-f-07` ⚪ **C** · fotografie proudového motoru v řezu (muzejní exponát) a dopravního letadla při startu

#### Vítr a překážky – aerodynamický tunel · [vitr_tunel.html](obsah/vitr_tunel.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7.–8. r. · simulace E
- **Popis:** Proudění kolem válce, desky, křídla, budov, kopce; kreslení překážek, kouř, víry, tlak.
- **Funkčnost:** mnoho překážek, zobrazení, kreslení, tempo, detail.
- **Cíl výuky:** Žák pozoruje, jak tvar překážky ovlivní proudění, a vysvětlí vznik vírů a vztlaku na křídle.
- **Vylepšení:**
  - Srovnání dvou tvarů vedle sebe při stejném větru.
  - Úkoly (Kde je za budovou závětří? Proč má auto zaoblenou příď?).
- **Obrázky:**
  - `IMG-f-08` ⚪ **C** · 4 fotografie proudění ve skutečnosti (kouřový tunel, sněhové závěje za plotem, vlajka ve větru, cyklista ve skrčené poloze)

#### Síla, těžiště a Newtonovy zákony · [f7_sila.html](obsah/f7_sila.html)
- **Zařazení:** Přírodní vědy › Fyzika · 7. r. · lekce A (hlavní lekce rodiny síly)
- **Popis:** Výslednice sil, gravitační síla, těžiště, Newtonovy zákony.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák složí síly, určí gravitační sílu a těžiště a použije Newtonovy zákony v situaci.
- **Vylepšení:**
  - Přetahování lanem: žák přidává síly a vidí výslednici.
  - Těžiště: vyvažování tvaru na špičce prstu (tažení podpěrného bodu).
  - U 3. zákona dvě tělesa, dvě barvy šipek (na koho síla působí).
- **Obrázky:**
  - `IMG-f-09` ⚪ **B** · karty situací Newtonových zákonů (bruslař na ledě, raketa, dva bruslaři se odstrkují, autobus brzdí a cestující se nakloní) — kontext zákonů

#### Elektřina – obvody a magnetismus · [elektrina.html](obsah/elektrina.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8.–9. r. · simulace E (hlavní lekce rodiny elektřiny)
- **Popis:** Ohmův zákon, sériové a paralelní zapojení, magnetické pole vodiče a cívky, indukce, spotřeba a cena.
- **Funkčnost:** 5 částí, posuvníky, přepínače zapojení, pojistka.
- **Cíl výuky:** Žák sestaví jednoduchý obvod, použije Ohmův zákon a vysvětlí rozdíl sériového a paralelního zapojení.
- **Vylepšení:**
  - 🔗 Doporučené průchody pro 8. a 9. ročník a Ověř se.
  - 🧩 Obvodové schéma vedle „realistického“ zapojení (baterie, žárovky, dráty).
  - Spotřeba a cena → odkaz na `m9_financni` (rodinný rozpočet).
- **Obrázky:**
  - `IMG-f-10` 🟠 **B** · karty součástek realisticky (plochá baterie, žárovka v objímce, spínač, rezistor, ampérmetr, voltmetr, pojistka, cívka, kompas) — propojení se schématickými značkami

#### Teplo a změny skupenství · [f8_teplo.html](obsah/f8_teplo.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8. r. · lekce A
- **Popis:** Výpočet tepla, graf ohřevu, změny skupenství, měrná tepelná kapacita.
- **Funkčnost:** 4 režimy, SVG graf.
- **Cíl výuky:** Žák vypočítá teplo potřebné k ohřátí, vysvětlí graf ohřevu a odliší teplotu od tepla.
- **Vylepšení:**
  - 🧩 Částicový model synchronizovaný s grafem ohřevu ledu až po páru (tání na plochém úseku).
  - Srovnání ohřevu vody a oleje stejnou energií.
- **Obrázky:** žádné.

#### Vodní hladina – vlny a slapy · [vodni_hladina.html](obsah/vodni_hladina.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8.–9. r. · simulace E
- **Popis:** Vlny na hladině (kamínky, žabky, kámen, kláda, rákosí), slapové vlny, zobrazení výšky a vrstevnic.
- **Funkčnost:** 2 části, mnoho nástrojů, nastavení.
- **Cíl výuky:** Žák pozoruje šíření, odraz a interferenci vln a vysvětlí příčinu přílivu a odlivu.
- **Vylepšení:**
  - Úkoly (dvě vlny se potkají — co se stane?).
  - U slapů společný čas pro glóbus a graf přístavu; poznámka o zjednodušení.
- **Obrázky:**
  - `IMG-f-11` ⚪ **C** · fotografie přílivu a odlivu na stejném místě (dvojice) — skutečný rozdíl hladin

#### Optika – odraz, lom a čočky · [optika.html](obsah/optika.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8.–9. r. · simulace E (hlavní lekce rodiny světla)
- **Popis:** Odraz a lom na rozhraní látek, čočky a zrcadla, hranol, dalekohled.
- **Funkčnost:** 4 části, volba látek, úhly, typy čoček a dalekohledů.
- **Cíl výuky:** Žák vysvětlí zákon odrazu a lom světla a sestrojí obraz spojkou.
- **Vylepšení:**
  - Scénáře od jedné čočky po dalekohled, s úkolem v každém kroku.
  - Fotografie jevů (lžička ve sklenici, duha, lupa).
  - 🔗 Stejné barvy paprsků jako `optika_soustava`.
- **Obrázky:**
  - `IMG-f-12` 🟠 **C** · 6 fotografií optických jevů (lžíce „zlomená“ ve sklenici vody, duha, hranol s barevným spektrem, obraz v lžíci, lupa, odraz v klidném jezeře)

#### Stavba optické soustavy · [optika_soustava.html](obsah/optika_soustava.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8.–9. r. · simulace E
- **Popis:** Hotové přístroje (lupa, promítačka, Keplerův, Galileův, Cassegrainův a pozemní dalekohled, mikroskop) a stavba vlastní soustavy na lavici.
- **Funkčnost:** dvě části (pochopit / postavit), krokování cesty světla, prvky na lavici.
- **Cíl výuky:** Žák vysvětlí, jak přístroj vytváří zvětšený obraz, a sestaví jednoduchou soustavu.
- **Vylepšení:**
  - Řízené úkoly: zaostři, převrať obraz, zvětši.
  - Fotografie skutečného přístroje vedle modelu.
- **Obrázky:**
  - `IMG-f-13` 🟠 **C** · fotografie 7 přístrojů (lupa, diaprojektor, Keplerův refraktor, divadelní kukátko, Cassegrainův teleskop, triedr, školní mikroskop)

#### Práce, výkon a energie · [f8_prace_energie.html](obsah/f8_prace_energie.html)
- **Zařazení:** Přírodní vědy › Fyzika · 8. r. · lekce A
- **Popis:** Práce, výkon, polohová a pohybová energie, přeměny energie.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák vypočítá práci, výkon a energii a popíše přeměny energie včetně ztrát.
- **Vylepšení:**
  - Horská dráha s energetickými sloupci (polohová, pohybová, teplo), tření jako posuvník.
  - 🔗 Odkaz na `physics_playground` (kyvadlo s energií).
- **Obrázky:** žádné.

#### Jaderná energie · [f9_jaderna.html](obsah/f9_jaderna.html)
- **Zařazení:** Přírodní vědy › Fyzika · 9. r. · lekce B (velká)
- **Popis:** Štěpení krok za krokem, řetězová reakce, rozpad naživo, elektrárna zblízka, havárie a chlazení, kvízy, provoz a zdroje.
- **Funkčnost:** 8 částí, animace, kvízy.
- **Cíl výuky:** Žák vysvětlí štěpení a řetězovou reakci, poločas rozpadu a princip jaderné elektrárny.
- **Vylepšení:**
  - 🔗 Seřadit části do fází Výuka / Ukázka / Procvič / Ověř se.
  - Rozpad: několik opakování stejného souboru a srovnání rozptylu.
  - Fotografie Temelína a Dukovan jako kotva.
- **Obrázky:**
  - `IMG-f-14` ⚪ **C** · fotografie JE Temelín a Dukovany (chladicí věže), palivového souboru (muzejní model)

#### Zvukové jevy · [f9_zvuk.html](obsah/f9_zvuk.html)
- **Zařazení:** Přírodní vědy › Fyzika · 9. r. · lekce A
- **Popis:** Čtení zvukové vlny, rychlost zvuku a ozvěna, výška a hlasitost, sluch a hluk.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák spojí výšku tónu s frekvencí a hlasitost s amplitudou a vypočítá vzdálenost z ozvěny.
- **Vylepšení:**
  - Tónový generátor (WebAudio, omezená hlasitost) s nezávislými posuvníky frekvence a amplitudy a živou vlnou.
  - Hlukové situace na stupnici decibelů (šepot, třída, sekačka, koncert).
- **Obrázky:**
  - `IMG-f-15` ⚪ **B** · 8 karet zdrojů zvuku pro decibelovou stupnici (list, šepot, rozhovor, třída, sekačka, motorka, koncert, letadlo)

#### Střídavý proud a rozvod elektřiny · [f9_stridavy_proud.html](obsah/f9_stridavy_proud.html)
- **Zařazení:** Přírodní vědy › Fyzika · 9. r. · lekce A
- **Popis:** Cesta elektřiny, transformátor, vlastnosti proudu, bezpečnost.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák popíše cestu elektřiny z elektrárny do zásuvky a vysvětlí, proč se přenáší vysokým napětím.
- **Vylepšení:**
  - Animace sinusovky a transformátoru s posuvníkem počtu závitů.
  - Model ztrát ve vedení při stejném výkonu a různém napětí.
- **Obrázky:** sdílet krajinu `IMG-prv-19`; navíc:
  - `IMG-f-16` ⚪ **C** · fotografie rozvodny, stožárů vysokého napětí, transformátoru na sloupu, domovní pojistkové skříně

### 7.7 Astronomie (6 stránek)

Společné: 🔗 jednotné ovládání (pauza, rychlost času, popisky) a společná data planet napříč `solar_system`, `planet_globe`, gravitačními hřišti a `z6_planeta_zeme`. Záměrně tmavé stránky spojit s webem proužkem hlavičky v barvě fyziky.

#### Hvězdná obloha · [star_map.html](obsah/star_map.html)
- **Zařazení:** Přírodní vědy › Astronomie · 6. a 9. r. · simulace F
- **Popis:** Nejjasnější hvězdy a souhvězdí nad obzorem pro místo a čas.
- **Funkčnost:** datum a čas, souřadnice, předvolby, tlačítko „Teď“.
- **Cíl výuky:** Žák najde Polárku a hlavní souhvězdí a vysvětlí, proč se obloha během noci otáčí.
- **Vylepšení:**
  - Scénář „co uvidím dnes večer“ a animace otáčení oblohy během noci.
  - Hledání Polárky podle Velkého vozu jako vedený úkol.
  - Kresby souhvězdí jako volitelná vrstva.
- **Obrázky:**
  - `IMG-f-17` ⚪ **A** · jemné obrysové kresby 12 souhvězdí (Velký vůz/Velká medvědice, Kasiopeja, Orion, Labuť, Lyra, Orel, Blíženci, Býk, Lev, Štír, Pegas, Malý vůz) na průhledném pozadí — volitelná vrstva nad mapou

#### Pohyb vesmírem · [pohyb_vesmirem.html](obsah/pohyb_vesmirem.html)
- **Zařazení:** Přírodní vědy › Astronomie · 6. a 9. r. · simulace F
- **Popis:** Země a Měsíc, let galaxií, oběh galaxií; stopy, pohled.
- **Funkčnost:** 3 scény, pauza, stopy, přepínání pohledu.
- **Cíl výuky:** Žák vysvětlí, že tvar dráhy závisí na tom, odkud pohyb pozorujeme.
- **Vylepšení:**
  - Vedle sebe dva pohledy na stejný pohyb (ze Slunce a ze Země).
  - Otázky ke každé scéně a poznámka o zjednodušení galaktického modelu.
- **Obrázky:** žádné.

#### Glóbusy planet · [planet_globe.html](obsah/planet_globe.html)
- **Zařazení:** Přírodní vědy › Astronomie · 6. a 9. r. · simulace E (záměrně tmavá)
- **Popis:** Otočné 3D glóbusy těles sluneční soustavy s texturami, srovnání velikostí, informace.
- **Funkčnost:** výběr tělesa, rotace, srovnání velikostí, informace.
- **Cíl výuky:** Žák porovná velikosti těles a popíše jejich povrch.
- **Vylepšení:**
  - Srovnávací karta dvou těles (velikost, den, rok, teplota, měsíce).
  - Úkoly k povrchovým útvarům (najdi Velkou rudou skvrnu, Olympus Mons).
  - Označit, co je fotografie, mapa a rekonstrukce.
- **Obrázky:** existují textury; doplnit jen chybějící tělesa, pokud se rozšíří výběr.

#### Astronomický kalendář úkazů · [sky_events.html](obsah/sky_events.html)
- **Zařazení:** Přírodní vědy › Astronomie · 6. a 9. r. · nástroj F
- **Popis:** Meteorické roje, slunovraty a rovnodennosti, úplňky a novy pro zvolený rok.
- **Funkčnost:** volba roku, tabulky.
- **Cíl výuky:** Žák najde příští astronomický úkaz a naplánuje jeho pozorování.
- **Vylepšení:**
  - Kalendář jako 🧩 časová osa roku s ikonami úkazů; klepnutí otevře `star_map` s nastaveným datem.
  - Fáze Měsíce jako obrázková řada.
- **Obrázky:**
  - `IMG-f-18` ⚪ **C** · fotografie 8 fází Měsíce ze stejného místa (volná licence) a fotografie meteoru — obrázková řada fází

#### Sluneční soustava · [solar_system.html](obsah/solar_system.html)
- **Zařazení:** Přírodní vědy › Astronomie · 6. a 9. r. · simulace E (hlavní lekce rodiny vesmíru)
- **Popis:** Oběh planet, popisky, dráhy, skutečné měřítko, fáze Měsíce, roční období.
- **Funkčnost:** rychlost, pauza, přepínače, pohledy.
- **Cíl výuky:** Žák popíše stavbu sluneční soustavy a vysvětlí fáze Měsíce a roční období.
- **Vylepšení:**
  - 🔗 Společná hlavička, tři úkoly na pohled a Ověř se.
  - Trvalé upozornění, kdy jsou velikosti a vzdálenosti upravené, a přepínač „skutečné měřítko“ viditelnější.
  - Odkazy na `planet_globe` u každé planety.
- **Obrázky:** žádné.

#### ISS živě · [iss.html](obsah/iss.html)
- **Zařazení:** Přírodní vědy › Astronomie · 9. r. · simulace E (živá data, záměrně tmavá)
- **Popis:** Poloha ISS v reálném čase na 3D glóbu, den/noc, stáří dat, stav spojení (etapa 02).
- **Funkčnost:** sledování, den/noc, zkusit znovu.
- **Cíl výuky:** Žák spočítá, za jak dlouho ISS oběhne Zemi, a zjistí, kdy přeletí nad ČR.
- **Vylepšení:**
  - Úlohy: délka oběhu z rychlosti a výšky, kolikrát za den vidí posádka východ Slunce.
  - Označený záznam jednoho oběhu pro výuku bez internetu.
- **Obrázky:**
  - `IMG-f-19` ⚪ **C** · fotografie ISS (NASA, volné dílo) a snímek Země z paluby — skutečný pohled

### 7.8 Chemie (13 stránek)

Společné pro chemii: 🔗 **jeden molekulový model** (🧩 molekula a atom) pro atom, názvosloví, rovnice, uhlovodíky i pH. Stejné barvy prvků (C černá, O červená, H bílá, N modrá, Cl zelená — běžná konvence CPK). Laboratorní vzhled z `ch8_smesi` (nejpropracovanější chemická stránka) převzít jako vzor pro ostatní lekce s laboratoří. Obrázky: fotografie skutečných látek a pomůcek, GHS piktogramy už existují.

#### Bezpečnost práce a výstražné značky · [ch8_bezpecnost.html](obsah/ch8_bezpecnost.html)
- **Zařazení:** Přírodní vědy › Chemie · 8. r. · lekce A
- **Popis:** Poznej značku (GHS SVG), značka k látce, první pomoc, pravidla laboratoře.
- **Funkčnost:** 4 režimy, 9 piktogramů GHS.
- **Cíl výuky:** Žák pozná piktogramy GHS, přečte etiketu a ví, jak se chovat v laboratoři a při úrazu.
- **Vylepšení:**
  - Čtení skutečné etikety (modelová etiketa s piktogramy, H- a P-větami) jako úloha „co smím a co ne“.
  - Obrázek laboratoře s chybami („najdi 6 prohřešků“).
  - 🔗 První pomoc z jednoho revidovaného zdroje (`pr8_prvni_pomoc`).
- **Obrázky:**
  - `IMG-ch-01` 🟠 **A** · školní laboratoř se 6–8 nebezpečnými situacemi (jídlo na stole, chybějící brýle, rozpuštěné vlasy u kahanu, láhev bez víčka, pipetování ústy, rozlitá kapalina) — hotspoty „najdi chybu“
  - `IMG-ch-02` 🟠 **C** · fotografie 6 skutečných domácích výrobků s piktogramy (čistič odpadů, odstraňovač rzi, lak, plynová kartuše, hnojivo, líh) — piktogram v praxi; značky výrobců rozmazat

#### Chemické názvosloví · [chem_nazvoslovi.html](obsah/chem_nazvoslovi.html)
- **Zařazení:** Přírodní vědy › Chemie · 8.–9. r. · samostatná F (s dílnou)
- **Popis:** Od koncovky k oxidačnímu číslu, dílna vzorců (vyrovnání nábojů), procvičování vzorec ↔ název, přehled.
- **Funkčnost:** 3 kroky, dílna, 3 režimy procvičování.
- **Cíl výuky:** Žák odvodí vzorec z názvu a název ze vzorce u oxidů, halogenidů, hydroxidů a kyselin.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js` a společnou hlavičku (dílna jako fáze Ukázka).
  - Dílna jako kostičky nábojů, které do sebe zapadnou (Fe³⁺ + O²⁻ → dvě a tři kostičky).
  - 🧩 Molekula: index = počet atomů v modelu.
- **Obrázky:** žádné.

#### Atom, molekula a chemická vazba · [ch8_atom.html](obsah/ch8_atom.html)
- **Zařazení:** Přírodní vědy › Chemie · 8. r. · lekce B (hlavní lekce rodiny stavby látek)
- **Popis:** Stavebnice atomu, vznik vazby, molekuly, počty částic, model atomu, poznej vazbu, pojmy.
- **Funkčnost:** 7 režimů, canvas a SVG, stavebnice.
- **Cíl výuky:** Žák určí počet protonů, neutronů a elektronů, vysvětlí vznik iontu a kovalentní vazby.
- **Vylepšení:**
  - 🧩 Vytáhnout stavebnici atomu a molekuly do sdílené knihovny.
  - Propojit stavebnici s periodickou tabulkou (přidám proton → posunu se o políčko).
- **Obrázky:** žádné.

#### Periodická tabulka · [periodic_table.html](obsah/periodic_table.html)
- **Zařazení:** Přírodní vědy › Chemie · 8.–9. r. · simulace E (tabulka + kvíz)
- **Popis:** Interaktivní tabulka prvků s detaily a kvízem.
- **Funkčnost:** výběr prvku, kvíz.
- **Cíl výuky:** Žák vyhledá prvek, přečte z tabulky základní údaje a vysvětlí uspořádání do skupin a period.
- **Vylepšení:**
  - 🔗 Společná hlavička, kvíz pod `uloha.js`.
  - Fotografie prvku (vzorek) v detailu a „kde ho potkáš“.
  - Hledací úkoly podle vlastností a porovnání dvou prvků.
- **Obrázky:**
  - `IMG-ch-03` 🟠 **C** · fotografie vzorků asi 40 běžných prvků (Wikimedia Commons „Periodic table of elements“ fotografie s licencí CC BY) — detail prvku

#### Voda a vzduch · [ch8_voda_vzduch.html](obsah/ch8_voda_vzduch.html)
- **Zařazení:** Přírodní vědy › Chemie · 8. r. · lekce A
- **Popis:** Složení vzduchu, úprava vody, vlastnosti vody, znečištění.
- **Funkčnost:** 4 režimy, SVG koláč.
- **Cíl výuky:** Žák popíše složení vzduchu, postup úpravy pitné vody a zdroje znečištění.
- **Vylepšení:**
  - 🧩 Koláč s lupou na malé podíly (argon, CO₂).
  - Úpravna vody jako schéma, žák skládá kroky do správného pořadí; odlišit čistírnu odpadních vod.
- **Obrázky:**
  - `IMG-ch-04` 🟠 **A** · řez úpravnou pitné vody (odběr z nádrže, česle, čiření, usazovací nádrž, pískový filtr, dezinfekce, vodojem) — hotspoty kroků

#### Směsi a jejich oddělování · [ch8_smesi.html](obsah/ch8_smesi.html)
- **Zařazení:** Přírodní vědy › Chemie · 8. r. · lekce B (vzor laboratorní lekce)
- **Popis:** Atlas aparatur, pod lupou, oddělovací laboratoř, namíchej roztok, laboratorní mise, jak směs oddělit, druh směsi, hmotnostní zlomek, pojmy.
- **Funkčnost:** 10 režimů, animované aparatury.
- **Cíl výuky:** Žák rozliší druhy směsí, zvolí metodu oddělení a vypočítá hmotnostní zlomek.
- **Vylepšení:**
  - 🔗 Vzor pro laboratorní vzhled chemie; stejné hlavičky a fáze jako ostatní lekce.
  - Hmotnostní zlomek jako 🧩 proužek hmotnosti (sůl + voda).
- **Obrázky:**
  - `IMG-ch-05` ⚪ **C** · fotografie skutečných aparatur (filtrace, destilace, odpařování, dělicí nálevka, chromatografie na papíře) jako protějšek animací

#### Vyčíslování chemických rovnic · [vycislovani_rovnic.html](obsah/vycislovani_rovnic.html)
- **Zařazení:** Přírodní vědy › Chemie · 8.–9. r. · samostatná F
- **Popis:** Doplnění koeficientů, kontrola, nápověda.
- **Funkčnost:** zkontrolovat, napovědět, další.
- **Cíl výuky:** Žák vyčíslí rovnici a vysvětlí rozdíl mezi koeficientem a indexem.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Živá bilance atomů vlevo/vpravo a 🧩 molekuly, které se při zvýšení koeficientu namnoží.
  - Pokus změnit index → model ukáže jinou látku (zakázaný krok).
- **Obrázky:** žádné.

#### Chemie a životní prostředí · [ch9_zivotni_prostredi.html](obsah/ch9_zivotni_prostredi.html)
- **Zařazení:** Přírodní vědy › Chemie · 9. r. · lekce A
- **Popis:** Třídění odpadu, recyklace, paliva a emise, ochrana vody a ovzduší.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák správně třídí odpad, popíše cestu recyklace a vliv spalování na ovzduší.
- **Vylepšení:**
  - Přetahování odpadu do barevných kontejnerů (obrázky předmětů, ne slova).
  - Životní cyklus plastové láhve jako kruh (výroba → použití → třídění → nový výrobek).
- **Obrázky:**
  - `IMG-ch-06` 🔴 **B** · 30 karet odpadu (PET láhev, kelímek od jogurtu, noviny, krabice od mléka, sklenice, plechovka, slupky, baterie, žárovka, textil, polystyren, obal od chipsů…) + karty 6 kontejnerů v barvách — třídění

#### Přírodní látky · [ch9_prirodni_latky.html](obsah/ch9_prirodni_latky.html)
- **Zařazení:** Přírodní vědy › Chemie · 9. r. · lekce A
- **Popis:** Sacharidy, tuky a bílkoviny, vitaminy a minerály, energie ve stravě.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák zařadí potraviny podle hlavních živin a spočítá energii z nutriční tabulky.
- **Vylepšení:**
  - Čtení modelové nutriční etikety a výpočet energie porce.
  - 🔗 Karty potravin sdílet s `prv5_zdravy_styl`.
- **Obrázky:** sdílet `IMG-prv-06`.

#### Redoxní reakce a elektrolýza · [ch9_redoxni.html](obsah/ch9_redoxni.html)
- **Zařazení:** Přírodní vědy › Chemie · 9. r. · lekce A
- **Popis:** Oxidační čísla, oxidace a redukce, elektrolýza, články a koroze.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák určí oxidační čísla, pozná oxidaci a redukci a popíše galvanický článek a elektrolýzu.
- **Vylepšení:**
  - Animace přesunu elektronů a změny oxidačních čísel současně.
  - Daniellův článek a elektrolýza vedle sebe (směr energie).
- **Obrázky:**
  - `IMG-ch-07` ⚪ **C** · fotografie koroze (rezavý hřebík, měděná střecha s patinou), pozinkovaného plechu, citronové baterie

#### Uhlovodíky · [ch9_uhlovodiky.html](obsah/ch9_uhlovodiky.html)
- **Zařazení:** Přírodní vědy › Chemie · 9. r. · lekce A
- **Popis:** Názvosloví, typy vazeb, ropa a paliva, uhlovodíky kolem nás.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák pojmenuje jednoduché alkany, alkeny a alkyny a popíše zpracování ropy.
- **Vylepšení:**
  - 🧩 Molekula: stavebnice řetězce, která hlídá čtyřvaznost uhlíku.
  - Destilační kolona s frakcemi (plyn, benzin, nafta, asfalt) a jejich použitím.
- **Obrázky:**
  - `IMG-ch-08` ⚪ **A** · řez frakční destilační kolonou s patry — podklad hotspotů (popisky frakcí kreslí web)

#### Kyseliny, hydroxidy a pH · [ch9_ph.html](obsah/ch9_ph.html)
- **Zařazení:** Přírodní vědy › Chemie · 9. r. · pilot C
- **Popis:** Vzorová lekce: dva modelové roztoky, předpověď nižšího pH, poměr koncentrací, neutralizace s koeficienty; procvičování.
- **Funkčnost:** vedená aktivita, 4 režimy, návaznosti, příprava hodiny.
- **Cíl výuky:** Žák porovná pH dvou roztoků a vysvětlí vyčíslenou neutralizaci.
- **Vylepšení:**
  - Fotografie skutečných indikátorů (červené zelí, lakmus) v roztocích různého pH.
  - 🧩 Molekulový model neutralizace.
- **Obrázky:**
  - `IMG-ch-09` 🟠 **C** · řada 8 zkumavek s výluhem červeného zelí v roztocích od pH 1 po 13, fotografie pH papírku se stupnicí — skutečné barvy indikátorů

#### Deriváty uhlovodíků · [ch9_derivaty.html](obsah/ch9_derivaty.html)
- **Zařazení:** Přírodní vědy › Chemie · 9. r. · lekce A
- **Popis:** Funkční skupiny, alkoholy, kyseliny a estery, deriváty v praxi.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák pozná funkční skupinu a přiřadí k ní třídu látek a příklad použití.
- **Vylepšení:**
  - Záměna funkční skupiny na stejném řetězci a sledování změny třídy a názvu.
  - Karty výrobků (ocet, líh, aceton, aspirin) propojené se strukturou.
- **Obrázky:**
  - `IMG-ch-10` ⚪ **B** · 8 karet běžných výrobků s deriváty (láhev octa, dezinfekce, odlakovač, aspirin, parfém, nemrznoucí směs, PET láhev, mýdlo) bez značek

### 7.9 Přírodopis (17 stránek)

Společné pro přírodopis: čtyři stránky (`bunka`, `pr7_rostliny`, `anatomie`, `pr9_ekologie`) jsou **nejlepší část webu**: atlas s ilustracemi, výklad souvislostí a procvičování. 🔗 Tento vzor přenést na ostatní lekce přírodopisu v jednodušší podobě: jedna ilustrace s hotspoty + dnešní režimy. Pro poznávačky a určování jen styl C (fotografie), pro stavbu těla styl A/B se stejnou technikou jako rostlina.

#### Potravní řetězce · [potravni_retezec.html](obsah/potravni_retezec.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 6. a 9. r. · samostatná F
- **Popis:** Klikáním doplnit organismy do řetězce ve správném pořadí.
- **Funkčnost:** skládání řetězce, kontrola, skóre.
- **Cíl výuky:** Žák sestaví potravní řetězec a vysvětlí směr šipky jako tok energie.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`, začlenit jako režim do `pr9_ekologie` nebo `prv4_ekosystemy`, případně zrušit samostatnou položku.
  - 🧩 Řetězec a síť: od řetězce k síti, odebrání organismu a předpověď následků.
- **Obrázky:** karty organismů ze `IMG-prv-10` a `IMG-pr-05`.

#### Houby a lišejníky · [pr6_houby.html](obsah/pr6_houby.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 6. r. · lekce A
- **Popis:** Jedlá/jedovatá, poznej houbu (podle slovního popisu znaků), stavba a rozmnožování, lišejníky.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše stavbu houby, pozná nejznámější jedlé a jedovaté druhy podle znaků a zná zásady bezpečného sběru.
- **Vylepšení:**
  - Poznávání podle **fotografií**, u každého druhu více snímků (mladá, dospělá, spodní strana klobouku) a vedle sebe nebezpečné záměny (muchomůrka zelená × holubinka, hřib satan × hřib kovář).
  - Výrazné upozornění: poznávačka není návod ke sběru.
  - Řez plodnicí a podhoubím s hotspoty.
- **Obrázky:**
  - `IMG-pr-01` 🔴 **C** · fotografie 14 druhů hub, u každého 2–3 pohledy (hřib smrkový, hřib kovář, klouzek, bedla vysoká, liška obecná, václavka, pečárka, muchomůrka červená, muchomůrka zelená, muchomůrka tygrovaná, hřib satan, čirůvka tygrovaná, pavučinec plyšový, ucháč obecný) — **nikdy generované**
  - `IMG-pr-02` 🟠 **A** · řez houbou (klobouk, rourky/lupeny, prsten, třeň, pochva, podhoubí v půdě) v botanickém stylu rostliny — hotspoty
  - `IMG-pr-03` ⚪ **C** · fotografie 4 typů lišejníků (terčovník, provazovka, dutohlávka, mapovník)

#### Bezobratlí · [pr6_bezobratli.html](obsah/pr6_bezobratli.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 6.–7. r. · lekce A
- **Popis:** Do kterého kmene, poznej živočicha, stavba těla, význam.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák zařadí bezobratlého do kmene podle stavby těla a popíše jeho význam.
- **Vylepšení:**
  - Srovnávací tabule stavby těla (žahavec, ploštěnec, hlístice, měkkýš, kroužkovec) — stejné pohledy a měřítko.
  - Žák určuje znak, podle něhož zařazuje.
- **Obrázky:**
  - `IMG-pr-04` 🟠 **B** · 6 karet stavby těla v botanickém stylu (nezmar, ploštěnka, škrkavka, hlemýžď v řezu, žížala s články, škeble) — srovnávací tabule s hotspoty
  - fotografie do poznávačky: součást `IMG-pr-05`

#### Stavba buňky · [bunka.html](obsah/bunka.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 6. r. · lekce B (vzorový atlas)
- **Popis:** Atlas živočišné a rostlinné buňky s ilustracemi a hotspoty, srovnání, spolupráce organel (od jádra po export), procvičování, časté záměny.
- **Funkčnost:** průzkum, srovnání, animovaná spolupráce, 3 typy procvičování.
- **Cíl výuky:** Žák pojmenuje hlavní části buňky, popíše jejich funkci a rozdíly rostlinné a živočišné buňky.
- **Vylepšení:**
  - Přenos na skutečný mikroskopický snímek (cibulová pokožka, ústní sliznice) — co je vidět a co ne.
  - 🔗 Hlavička a fáze podle oddílu 2, aby vzor zapadl do celku.
- **Obrázky:**
  - `IMG-pr-06` 🟠 **C** · mikrofotografie pokožky cibule, buněk ústní sliznice, listu mechu (chloroplasty), prvoka trepky — protějšek modelu

#### Členovci · [pr6_clenovci.html](obsah/pr6_clenovci.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 6.–7. r. · lekce A
- **Popis:** Do které třídy, kolik má nohou, proměna hmyzu (emoji), význam.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák zařadí členovce do třídy podle počtu nohou a článkování těla a popíše proměnu dokonalou a nedokonalou.
- **Vylepšení:**
  - Srovnávací obraz těla (hmyz, pavoukovec, korýš, stonožka) s hotspoty článků a končetin.
  - Proměna na konkrétním druhu (babočka, kobylka) v obrázcích místo emoji.
- **Obrázky:**
  - `IMG-pr-07` 🔴 **B** · 4 karty stavby těla ve stejném měřítku a pohledu shora (včela, křižák, rak, stonožka) — hotspoty částí
  - `IMG-pr-08` 🟠 **B** · proměna dokonalá (babočka: vajíčko, housenka, kukla, motýl) a nedokonalá (kobylka: vajíčko, nymfa, dospělec) — 7 karet

#### Bakterie, viry a jednobuněčné organismy · [pr6_mikroorganismy.html](obsah/pr6_mikroorganismy.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 6. r. · lekce A
- **Popis:** Poznej organismus, virus × bakterie, prospěšné/škodlivé, jak se chránit.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák vysvětlí rozdíl mezi virem a bakterií a ví, jak se chránit před nákazou.
- **Vylepšení:**
  - Škála velikostí s přiblížením (vlas → buňka → bakterie → virus).
  - Užitečné bakterie (jogurt, kořenové hlízky) jako protiváha.
- **Obrázky:**
  - `IMG-pr-09` 🟠 **B** · 5 schematických karet v jednotném stylu (bakterie s bičíkem, virus s obalem, trepka, měňavka, kvasinka) — ne mikrofotografie, ale čitelný model

#### Stavba a systém rostlin · [pr7_rostliny.html](obsah/pr7_rostliny.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 7. r. · lekce B (atlas)
- **Popis:** Botanická fazole s hotspoty šesti částí, spolupráce orgánů, fotosyntéza, dýchání, voda, od květu k semenu, skupiny rostlin, procvičování.
- **Funkčnost:** atlas, výklad, 4 režimy.
- **Cíl výuky:** Žák pojmenuje orgány rostliny a jejich funkce a vysvětlí fotosyntézu a dýchání.
- **Vylepšení:**
  - Animace cesty vody a cukru rostlinou (xylém nahoru, floém dolů) nad stejnou ilustrací.
  - Systém rostlin s fotografiemi zástupců.
- **Obrázky:**
  - `IMG-pr-10` 🟠 **C** · fotografie 12 zástupců skupin (mech ploník, kapraď samec, přeslička, plavuň, smrk, borovice, tis, pryskyřník, hrách, pampeliška, pšenice, tulipán) — systém rostlin

#### Ryby, obojživelníci a plazi · [pr7_obratlovci_studenokrevni.html](obsah/pr7_obratlovci_studenokrevni.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 7. r. · lekce A
- **Popis:** Do které skupiny, stavba těla a dýchání, poznávačka (textová), platí to?
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák porovná stavbu těla, dýchání a rozmnožování ryb, obojživelníků a plazů a pozná naše zástupce.
- **Vylepšení:**
  - Tabule tří modelových organismů (kapr, skokan, ještěrka) s hotspoty (šupiny, žábry, kůže, plíce).
  - Proměna žáby (vajíčka → pulec → žabka).
  - Poznávačka podle fotografií.
- **Obrázky:**
  - `IMG-pr-11` 🟠 **B** · 3 karty stavby těla (kapr, skokan hnědý, ještěrka obecná) ze stejného úhlu — hotspoty
  - `IMG-pr-12` 🟠 **B** · vývoj žáby v 5 krocích (vajíčka, pulec, pulec s nohama, žabka, dospělá žába)
  - `IMG-pr-05` 🔴 **C** · fotografie 40 zástupců pro poznávačky přírodopisu 6.–7. r. (bezobratlí, ryby, obojživelníci, plazi, ptáci, savci ČR); **společná sada** pro `pr6_bezobratli`, tuto stránku, `pr7_ptaci_savci`, `potravni_retezec`

#### Ptáci a savci · [pr7_ptaci_savci.html](obsah/pr7_ptaci_savci.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 7. r. · lekce A
- **Popis:** Zobák a potrava, končetiny a způsob života, poznávačka, řády savců.
- **Funkčnost:** 4 režimy (textové).
- **Cíl výuky:** Žák vysvětlí přizpůsobení zobáku, končetin a chrupu potravě a prostředí a pozná naše zástupce.
- **Vylepšení:**
  - Obrázkové páry zobák → potrava (datel, kachna, káně, pěnkava, čáp) a končetina → způsob života.
  - Úloha „navrhni ptáka“ — žák složí zobák a nohy pro dané prostředí.
- **Obrázky:**
  - `IMG-pr-13` 🔴 **B** · 8 karet hlav ptáků se zobáky ve stejném pohledu z profilu (datel, kachna, káně, pěnkava, čáp, kos, vlaštovka, sýkora) a 6 karet nohou (kachní plovací, dravčí pařát, datlí šplhavá, pštrosí běhavá, pěvčí, brodivá)
  - `IMG-pr-14` 🟠 **B** · 6 karet chrupu savců (šelma, hlodavec, přežvýkavec, hmyzožravec, všežravec, zajíc) — lebky z boku

#### Rozmnožování a vývoj člověka · [pr8_rozmnozovani.html](obsah/pr8_rozmnozovani.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 8. r. · lekce A
- **Popis:** Orgány a jejich funkce, vývoj před narozením, etapy života, dospívání.
- **Funkčnost:** 4 režimy (textové).
- **Cíl výuky:** Žák popíše rozmnožovací soustavu, vývoj plodu a etapy lidského života.
- **Vylepšení:**
  - 🧩 Časová osa těhotenství s velikostí plodu v měsících (srovnání s ovocem).
  - Etapy života jako řada postav od novorozence po stáří.
  - 🔗 Anatomické schéma ve stylu `anatomie` (atlas), citlivé a věcné.
- **Obrázky:**
  - `IMG-pr-15` 🟠 **B** · 8 karet etap života (novorozenec, batole, předškolák, školák, dospívající, dospělý, starší dospělý, senior) jako jedna rodina — řada etap
  - `IMG-pr-16` 🟠 **A** · schématické řezy mužskou a ženskou rozmnožovací soustavou ve stylu atlasu anatomie, bez textu — hotspoty; zadání stejné techniky jako `organy-atlas`

#### Zdraví a první pomoc · [pr8_prvni_pomoc.html](obsah/pr8_prvni_pomoc.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 8. r. · lekce A (hlavní lekce rodiny zdraví)
- **Popis:** Tísňová volání, co udělat, postup krok za krokem, resuscitace.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák zavolá pomoc a poskytne základní první pomoc včetně resuscitace podle platných doporučení.
- **Vylepšení:**
  - Postup krok za krokem jako obrázkový příběh s rozhodováním (dýchá? → zotavovací poloha / resuscitace).
  - Metronom 100–120/min k nácviku rytmu stlačování.
  - Odborná revize a datum; jeden zdroj pro `prv2_zdravi` a `ch8_bezpecnost`.
- **Obrázky:**
  - `IMG-pr-17` 🔴 **B** · 8 karet postupu (kontrola bezpečí, oslovení a zatřesení, záklon hlavy a kontrola dechu, volání 155, stlačování hrudníku — poloha rukou, zotavovací poloha, zástava krvácení tlakem, chlazení popáleniny) — věcné, bez krve; nechat zkontrolovat zdravotníkem

#### Biologie člověka · [anatomie.html](obsah/anatomie.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 8. r. · simulace E (atlas)
- **Popis:** Interaktivní atlas orgánů zepředu a zezadu, kostra, svaly, nervová soustava, smysly, detail srdce, průchod oběhem, spolupráce soustav, procvičování.
- **Funkčnost:** prozkoumat/procvičit, pohledy, zvětšení, filtry soustav.
- **Cíl výuky:** Žák najde a pojmenuje hlavní orgány, popíše funkci soustav a jejich spolupráci.
- **Vylepšení:**
  - Jednoduchý výchozí průchod pro 8. ročník (8 orgánů) a rozšířený režim.
  - Úkoly „co se změní při běhu“ nad existujícím propojením soustav.
  - 🔗 Hlavička a fáze.
- **Obrázky:** existují; doplnit jen trávicí soustavu detailně, pokud chybí (viz `Prirodopis/anatomie-streva-zada-prompty.md`).

#### Ekologie a ochrana přírody · [pr9_ekologie.html](obsah/pr9_ekologie.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 9. r. · lekce B (hlavní lekce rodiny ekosystémů)
- **Popis:** Populace, společenstvo, ekosystém, rybník, vztahy, energetická pyramida, rozklad, dopad zásahu, slepá mapa chráněných území, ochrana přírody.
- **Funkčnost:** ilustrace s hotspoty, modely, 4 režimy, mapa.
- **Cíl výuky:** Žák vysvětlí vztahy v ekosystému, tok energie a oběh látek a posoudí dopad zásahu do krajiny.
- **Vylepšení:**
  - Terénní úkol: pozorovací list pro místní rybník nebo louku (tisk).
  - U dopadu zásahu časová škála (za rok, za 10 let).
- **Obrázky:** existují (`ekologie-rybnik`, `ekologie-krajina`).

#### Geologické děje · [pr9_geologicke_deje.html](obsah/pr9_geologicke_deje.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 9. r. · lekce A
- **Popis:** Litosférické desky, sopky, zemětřesení, vnější děje.
- **Funkčnost:** 4 režimy (textové).
- **Cíl výuky:** Žák popíše typy rozhraní desek a vysvětlí vznik sopek, zemětřesení a působení vnějších dějů.
- **Vylepšení:**
  - Animované řezy třemi typy rozhraní (rozbíhání, podsouvání, posun) s posuvníkem času.
  - 🧩 Mapa desek se sopkami a zemětřeseními (propojit se `z6_litosfera`).
- **Obrázky:**
  - `IMG-pr-18` 🟠 **A** · 3 řezy deskovými rozhraními (středooceánský hřbet, subdukce s vulkanickým obloukem, transformní zlom) ve stejném stylu a měřítku — podklad animací
  - `IMG-pr-19` ⚪ **C** · fotografie 6 geologických jevů v ČR (Pravčická brána, propast Macocha, Říp, Komorní hůrka, Adršpašské skály, meandry Lužnice) — vnitřní a vnější děje v krajině

#### Minerály a horniny · [pr9_mineraly.html](obsah/pr9_mineraly.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 9. r. · lekce A (hlavní lekce rodiny hornin)
- **Popis:** Poznej minerál, vlastnosti a tvrdost, vznik hornin, suroviny.
- **Funkčnost:** 4 režimy (textové).
- **Cíl výuky:** Žák určí minerál podle vlastností (tvrdost, vryp, lesk, štěpnost) a zařadí horninu podle vzniku.
- **Vylepšení:**
  - Virtuální „stůl vzorků“ s fotografiemi a zkouškami (vryp na porcelánu, tvrdost nehtem/nožem/sklem).
  - Koloběh hornin jako kruhové schéma.
  - 🔗 Sdílená data a fotografie s `prv4_horniny`.
- **Obrázky:** sdílet `IMG-prv-17`; navíc:
  - `IMG-pr-20` 🟠 **C** · fotografie Mohsovy stupnice (10 minerálů) a vrypů na porcelánové destičce (hematit, pyrit, malachit)

#### Vývoj Země a života · [pr9_vyvoj_zeme.html](obsah/pr9_vyvoj_zeme.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 9. r. · lekce A
- **Popis:** Geologická období, vývoj života, zkameněliny, vývoj člověka.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák seřadí geologická období, pozná typické zkameněliny a vysvětlí vývoj života jako větvení.
- **Vylepšení:**
  - 🧩 Časová osa s poměrnými délkami a přiblížením (4,6 miliardy let na jednom pásu; „kdyby historie Země byla jeden den“).
  - Strom života místo žebříčku.
- **Obrázky:**
  - `IMG-pr-21` 🟠 **C** · fotografie 8 zkamenělin (trilobit, amonit, belemnit, přeslička z karbonu, zub žraloka, otisk kapradiny, jantar s hmyzem, archeopteryx — odlitek)
  - `IMG-pr-22` ⚪ **A** · 4 rekonstrukce krajin (prvohorní moře, karbonský les, druhohorní krajina s dinosaury, čtvrtohorní tundra s mamuty) — označit jako rekonstrukce

#### Punnettův čtverec · [punnett.html](obsah/punnett.html)
- **Zařazení:** Přírodní vědy › Přírodopis · 9. r. · nástroj F
- **Popis:** Zadání genotypů rodičů a vyplnění čtverce, popis znaku.
- **Funkčnost:** vstup genotypů, předvolby, výsledek.
- **Cíl výuky:** Žák sestaví Punnettův čtverec, určí poměr genotypů a fenotypů a vysvětlí pravděpodobnost.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Vznik gamet jako krok před čtvercem; simulace 4, 40 a 400 potomků (poměr se ustálí až při velkém počtu).
  - Znak s obrázkem (barva hrachu, barva srsti).
- **Obrázky:**
  - `IMG-pr-23` ⚪ **B** · karty znaků pro křížení (žlutý/zelený hrách, hladký/svraštělý hrách, černé/hnědé morče, červený/bílý květ hrachu) — fenotypy

### 7.10 Zeměpis (21 stránek)

Společné pro zeměpis: 🔗 **jedna datová sada států a jedna mapová komponenta** (rozšířený `mapy.js`) pro slepé mapy, lekce světadílů, kvízy vlajek a hlavních měst i dějepisné mapy. Lekce světadílů mají stejnou stavbu (slepá mapa – státy, slepá mapa – příroda, přírodní poměry, lidé a hospodářství); doplnit každé stejnou čtveřici podkladů: **řez krajinou, dva klimatogramy, dvě fotografie míst, jeden příběh člověka**. Klimatogramy a řezy kreslí kód (🧩 graf), fotografie jsou styl C. Údaje o obyvatelstvu a hospodářství vždy s rokem a zdrojem.

#### Atmosféra a počasí · [z6_atmosfera.html](obsah/z6_atmosfera.html)
- **Zařazení:** Zeměpis a dějepis › Zeměpis · 6.–7. r. · lekce A
- **Popis:** Podnebné pásy, vrstvy atmosféry, počasí a podnebí, meteorologické jevy.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák odliší počasí od podnebí, popíše vrstvy atmosféry a vysvětlí vznik podnebných pásů.
- **Vylepšení:**
  - 🧩 Glóbus se slunečními paprsky dopadajícími pod různým úhlem → pásy.
  - Týdenní měření počasí třídou zapsané do 🧩 grafu a srovnání s klimatogramem místa.
  - Fotografie jevů (bouřka, mlha, jinovatka, duha) k určování.
- **Obrázky:**
  - `IMG-z-01` 🟠 **C** · fotografie 8 meteorologických jevů (kupovitá oblaka, bouřkový oblak, mlha, jinovatka, kroupy, duha, halo, inverze v údolí)
  - `IMG-z-02` ⚪ **A** · svislý řez atmosférou (troposféra s mraky a letadlem, stratosféra s ozonem a balonem, mezosféra s meteory, termosféra s polární září a ISS) — hotspoty vrstev

#### Hydrosféra · [z6_hydrosfera.html](obsah/z6_hydrosfera.html)
- **Zařazení:** Zeměpis › 6.–7. r. · lekce A
- **Popis:** Vodstvo a pojmy, koloběh vody, oceány a moře, rekordy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše složky hydrosféry a koloběh vody a ukáže na mapě oceány a velké řeky.
- **Vylepšení:**
  - Podíly vody jako vnořené čtverce (veškerá voda → sladká → dostupná).
  - 🔗 Koloběh vody sdílet s prvoukou (`IMG-prv-13`) doplněný o podzemní vodu a ledovce.
  - Řeka od pramene k ústí (horní, střední, dolní tok) s tvary.
- **Obrázky:**
  - `IMG-z-03` 🟠 **A** · řeka od pramene po ústí v jedné panoramatické scéně (pramen v horách, peřeje, údolí, meandry, delta, moře) — hotspoty pojmů

#### Planeta Země – tvar a pohyby · [z6_planeta_zeme.html](obsah/z6_planeta_zeme.html)
- **Zařazení:** Zeměpis › 6. r. · lekce A
- **Popis:** Který pohyb, důsledky pohybů, významné dny, fakta o Zemi.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák vysvětlí střídání dne a noci a ročních období a časová pásma.
- **Vylepšení:**
  - 🔗 Vložit pohled „Roční období“ ze `solar_system` a 🧩 glóbus s terminátorem.
  - Přepnutí polokoule: proč je v Austrálii léto v prosinci.
  - Časová pásma: kolik je teď hodin v Tokiu (mapa pásem).
- **Obrázky:** žádné (modely existují).

#### Mapa, měřítko a souřadnice · [z6_mapa_souradnice.html](obsah/z6_mapa_souradnice.html)
- **Zařazení:** Zeměpis › 6. r. · lekce A (hlavní lekce rodiny map)
- **Popis:** Zeměpisná síť, určení souřadnic, měřítko, druhy map.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák určí zeměpisné souřadnice, použije měřítko a vybere vhodnou mapu k účelu.
- **Vylepšení:**
  - Bod na 🧩 glóbu a na ploché mapě současně; posuvníky šířky a délky.
  - Měření cesty na mapě (pravítko) a převod měřítkem, stejná úloha na dvou měřítcích.
  - Druhy map jako skutečné výřezy (turistická, silniční, obecně zeměpisná, tematická).
- **Obrázky:**
  - `IMG-z-04` 🟠 **C** · 4 výřezy map stejného území v různých měřítkách a typech (OpenStreetMap, turistická mapa s licencí, ortofoto) — srovnání druhů map

#### Mapy – lekce a průvodce · [eduMaps.html](obsah/eduMaps.html)
- **Zařazení:** Zeměpis › 4.–9. r. · rozcestník F (opraveno v etapě 02)
- **Popis:** Rozcestník pěti mapových lekcí a historických map, tři aktivity pro učitele, příprava bez internetu.
- **Funkčnost:** karty lekcí, tisk aktivit.
- **Cíl výuky:** Učitel vybere mapovou aktivitu podle cíle.
- **Vylepšení:**
  - 🔗 Doplnit všechny mapové lekce webu (dnes pět) a řadit je jako učební cestu od plánu obce po souřadnice.
  - Karty s náhledem mapy (stejný vzhled jako dlaždice přehledu).
- **Obrázky:** žádné.

#### Litosféra a povrch Země · [z6_litosfera.html](obsah/z6_litosfera.html)
- **Zařazení:** Zeměpis › 6. r. · lekce A
- **Popis:** Stavba Země, vnitřní a vnější děje, tvary povrchu, pojmy.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák popíše stavbu Země a vysvětlí, jak vnitřní a vnější děje tvarují povrch.
- **Vylepšení:**
  - Řez Zemí s přiblížením až na desky.
  - Tvary povrchu na fotografiích (údolí ve tvaru V a U, kaňon, sopka, vrásy).
  - 🔗 Řezy desek sdílet s `pr9_geologicke_deje` (`IMG-pr-18`).
- **Obrázky:**
  - `IMG-z-05` 🟠 **C** · fotografie 8 tvarů povrchu (údolí V, ledovcové údolí U, kaňon, sopka, vrásy ve skále, písečné duny, meandry, útesy) — poznávání tvarů
  - `IMG-z-06` ⚪ **A** · řez Zemí (kůra, plášť, vnější a vnitřní jádro) s výsekem — hotspoty vrstev

#### Afrika · [z7_afrika.html](obsah/z7_afrika.html)
- **Zařazení:** Zeměpis › 7. r. · lekce A (s mapou)
- **Popis:** Slepá mapa států a přírody, přírodní poměry, lidé a hospodářství.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák ukáže státy a přírodní útvary Afriky a vysvětlí souvislost podnebných pásů a způsobu života.
- **Vylepšení:**
  - Řez od Středozemního moře přes Saharu a savanu k pralesu (symetrie pásů podle rovníku).
  - Dva klimatogramy (Káhira, Kinshasa) a dva příběhy dětí z různých regionů.
- **Obrázky:**
  - `IMG-z-07` 🟠 **A** · panoramatický řez Afrikou sever–jih (pobřeží, poušť, polopoušť, savana, tropický deštný les) — hotspoty pásů
  - `IMG-z-08` ⚪ **C** · 4 fotografie míst (Káhira s Nilem, Sahara, savana v Tanzanii, Kapské Město)

#### Kvíz světových hlavních měst · [svetova_hlavni_mesta.html](obsah/svetova_hlavni_mesta.html)
- **Zařazení:** Zeměpis › 7. a 9. r. · samostatná F
- **Popis:** Kvíz hlavních měst podle kontinentu (15 otázek).
- **Funkčnost:** volba kontinentu, start, skóre.
- **Cíl výuky:** Žák zná hlavní města vybraných států a ukáže je na mapě.
- **Vylepšení:**
  - 🔗 Sloučit s `flags_quiz` do jednoho kvízu „Státy světa“ (vlajka, město, poloha) pod `uloha.js` a se sdílenými daty.
  - Po odpovědi ukázat stát a město na 🧩 mapě.
- **Obrázky:** žádné (vlajky jako SVG).

#### Amerika · [z7_amerika.html](obsah/z7_amerika.html)
- **Zařazení:** Zeměpis › 7. r. · lekce A (s mapou)
- **Popis:** Slepá mapa států a přírody, přírodní poměry, lidé a hospodářství.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák ukáže státy a přírodní útvary Ameriky a vysvětlí vliv polohy a reliéfu na podnebí.
- **Vylepšení:**
  - Řez od Tichého oceánu přes Andy/Kordillery do vnitrozemí; klimatogramy Lima × Manaus.
  - Srovnání dvou měst (Toronto × São Paulo).
- **Obrázky:**
  - `IMG-z-09` 🟠 **A** · řez Jižní Amerikou západ–východ (pobřežní poušť Atacama, Andy, Amazonský prales, pobřeží Atlantiku) — hotspoty
  - `IMG-z-10` ⚪ **C** · 4 fotografie míst (Grand Canyon, New York, Machu Picchu, Amazonie)

#### Asie · [z7_asie.html](obsah/z7_asie.html)
- **Zařazení:** Zeměpis › 7. r. · lekce A (s mapou)
- **Popis:** Slepá mapa států a přírody, přírodní poměry, lidé a hospodářství.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák ukáže státy a přírodní útvary Asie a vysvětlí monzun a jeho vliv na život.
- **Vylepšení:**
  - Přepínač léto/zima: šipky monzunu na mapě a klimatogram Bombaje.
  - Několik studijních regionů (Sibiř, Blízký východ, Indie, Čína, Japonsko).
- **Obrázky:**
  - `IMG-z-11` 🟠 **A** · dvojice scén stejné indické vesnice v období sucha a monzunových dešťů — dopad monzunu
  - `IMG-z-12` ⚪ **C** · 4 fotografie míst (Himálaj, rýžové terasy, Tokio, poušť Gobi)

#### Kvíz vlajky a města · [flags_quiz.html](obsah/flags_quiz.html)
- **Zařazení:** Zeměpis › 7.–9. r. · samostatná F
- **Popis:** Vlajka → země, země → hlavní město, město → země, smíšené; Evropa nebo svět.
- **Funkčnost:** typ, region, počet otázek, série, skóre.
- **Cíl výuky:** Žák pozná vlajky a hlavní města států.
- **Vylepšení:**
  - 🔗 Sloučit se `svetova_hlavni_mesta` (viz výše).
  - Zaměňované vlajky vedle sebe (Rumunsko × Čad, Indonésie × Monako).
- **Obrázky:** žádné.

#### Austrálie, Oceánie a polární oblasti · [z7_australie_oceanie.html](obsah/z7_australie_oceanie.html)
- **Zařazení:** Zeměpis › 7. r. · lekce A (s mapou)
- **Popis:** Slepá mapa měst a přírody, příroda a zvláštnosti, polární oblasti.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák popíše zvláštnosti Austrálie, Oceánie a polárních oblastí a ukáže je na mapě.
- **Vylepšení:**
  - Srovnání tří prostředí (vnitrozemí Austrálie, korálový ostrov, Antarktida) stejnými měřítky.
  - Endemity Austrálie na fotografiích.
- **Obrázky:**
  - `IMG-z-13` ⚪ **C** · fotografie (Uluru, Velký bariérový útes, korálový atol, Antarktida s tučňáky, klokan, ptakopysk)

#### ČR – povrch, podnebí a vodstvo · [z8_cr_prirodni.html](obsah/z8_cr_prirodni.html)
- **Zařazení:** Zeměpis › 8. r. · lekce A (s mapou)
- **Popis:** Slepá mapa pohoří a vodstva, řeky a úmoří, povrch a podnebí.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák ukáže pohoří, nížiny a řeky ČR, určí úmoří a popíše podnebí.
- **Vylepšení:**
  - Přepínatelné vrstvy (výšky, srážky, řeky, úmoří) nad stejnou mapou.
  - „Kam doteče voda od naší školy?“ — sledování toku až k moři.
  - 🔗 Sloučit `reky_pohori` jako režim této lekce.
- **Obrázky:**
  - `IMG-z-14` ⚪ **C** · 6 fotografií krajin ČR (Krkonoše, Šumava, Polabí, Českomoravská vrchovina, Beskydy, Pálava)

#### Evropa – regiony · [z8_evropa_regiony.html](obsah/z8_evropa_regiony.html)
- **Zařazení:** Zeměpis › 8. r. · lekce A (s mapou)
- **Popis:** Slepá mapa států a přírody, regiony Evropy, hospodářství a EU.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák ukáže státy Evropy, zařadí je do regionů a porovná regiony podle přírody a hospodářství.
- **Vylepšení:**
  - Srovnávací karta regionů se stejnými kritérii (podnebí, reliéf, hustota, hlavní odvětví).
  - 🔗 Stejná data států jako `slepa_mapa_evropa`.
- **Obrázky:**
  - `IMG-z-15` ⚪ **C** · 6 fotografií typických krajin regionů (fjord, Středomoří, Alpy, nížina Nizozemska, ruská tajga, britské pobřeží)

#### Řeky a pohoří ČR · [reky_pohori.html](obsah/reky_pohori.html)
- **Zařazení:** Zeměpis › 8. r. · samostatná F
- **Popis:** Kvíz řek a pohoří (12 otázek).
- **Funkčnost:** volba, start, skóre.
- **Cíl výuky:** Žák zná hlavní řeky a pohoří ČR a ukáže je na mapě.
- **Vylepšení:**
  - 🔗 Začlenit jako režim do `z8_cr_prirodni` a zrušit samostatnou položku, nebo převést na mapovou úlohu (klepni na řeku).
- **Obrázky:** žádné.

#### ČR – obyvatelstvo a hospodářství · [z8_cr_hospodarstvi.html](obsah/z8_cr_hospodarstvi.html)
- **Zařazení:** Zeměpis › 8.–9. r. · lekce A (s mapou)
- **Popis:** Slepá mapa krajských měst a hospodářství, obyvatelstvo, hospodářství.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák popíše rozmístění obyvatel a hospodářství ČR a vysvětlí příčiny.
- **Vylepšení:**
  - Věková pyramida ČR (🧩 graf) s posuvníkem roku (data ČSÚ, uvést rok).
  - Cesta výrobku (například automobil) mezi kraji.
- **Obrázky:** žádné (data a mapy kódem).

#### Slepá mapa Evropy · [slepa_mapa_evropa.html](obsah/slepa_mapa_evropa.html)
- **Zařazení:** Zeměpis › 8. r. · simulace E (mapa)
- **Popis:** Hledání států na slepé mapě, prohlížení, malé státy tečkou.
- **Funkčnost:** 2 režimy, SVG mapa.
- **Cíl výuky:** Žák najde na mapě všechny evropské státy.
- **Vylepšení:**
  - 🔗 Společná hlavička a zápis do deníku; mapa ze sdílené komponenty.
  - Postupné ubírání nápovědy (sousedé, region) a opakování chybných.
  - Ovládání klávesnicí a výběr ze seznamu jako alternativa.
- **Obrázky:** žádné.

#### Slepá mapa ČR · [slepa_mapa.html](obsah/slepa_mapa.html)
- **Zařazení:** Zeměpis › 8. r. · simulace E (mapa)
- **Popis:** Kraje a krajská města, prohlížení.
- **Funkčnost:** 3 režimy, SVG mapa.
- **Cíl výuky:** Žák najde kraje a krajská města ČR.
- **Vylepšení:** stejné jako u slepé mapy Evropy; navíc vrstva „můj kraj“ a okresy pro pokročilé.
- **Obrázky:** žádné.

#### Světové hospodářství a globalizace · [z9_hospodarstvi_svet.html](obsah/z9_hospodarstvi_svet.html)
- **Zařazení:** Zeměpis › 9. r. · lekce A (s mapou)
- **Popis:** Hospodářská centra, obchodní cesty a suroviny, sektory, globalizace.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák popíše sektory hospodářství a na příkladu výrobku vysvětlí globální dodavatelský řetězec.
- **Vylepšení:**
  - Cesta mobilního telefonu (nebo trička) na mapě: suroviny → výroba → montáž → prodej → odpad.
  - Co se stane, když se jedna cesta zavře (Suezský průplav) — změna trasy a času.
- **Obrázky:**
  - `IMG-z-16` ⚪ **B** · 6 karet fází výrobku (důl, továrna, kontejnerová loď, sklad, obchod, skládka/recyklace) — zastávky na mapě

#### Obyvatelstvo a sídla světa · [z9_obyvatelstvo.html](obsah/z9_obyvatelstvo.html)
- **Zařazení:** Zeměpis › 9. r. · lekce A (s mapou)
- **Popis:** Oblasti zalidnění, velkoměsta, obyvatelstvo, migrace a sídla.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák vysvětlí nerovnoměrné rozmístění obyvatel, porovná věkové pyramidy a popíše příčiny migrace.
- **Vylepšení:**
  - Srovnání věkových pyramid (Niger × Japonsko) 🧩 grafem.
  - Hustota × počet obyvatel (Bangladéš × Rusko) na mapě se dvěma vrstvami.
  - Příběh migrace s více příčinami.
- **Obrázky:**
  - `IMG-z-17` ⚪ **C** · 4 fotografie sídel (vesnice v Sahelu, slum a mrakodrapy v Bombaji, předměstí USA, historické centrum evropského města)

#### Globální problémy a životní prostředí · [z9_globalni_problemy.html](obsah/z9_globalni_problemy.html)
- **Zařazení:** Zeměpis › 9. r. · lekce A (s mapou)
- **Popis:** Ohrožené oblasti, zásahy do krajiny, klimatická změna, řešení a udržitelnost.
- **Funkčnost:** 4 režimy, mapy.
- **Cíl výuky:** Žák rozliší pozorovaná data, výklad příčin a návrh řešení u globálních problémů.
- **Vylepšení:**
  - Graf teploty a CO₂ (skutečná data s rokem a zdrojem), žák čte trend.
  - Rozhodovací případ (nová přehrada / dálnice) s více cíli a důsledky.
  - Fotografie „tehdy a dnes“ (ledovec, Aralské jezero).
- **Obrázky:**
  - `IMG-z-18` 🟠 **C** · 3 dvojice fotografií „tehdy a dnes“ se stejným záběrem (ústup alpského ledovce, Aralské jezero ze satelitu, odlesňování v Amazonii ze satelitu) — NASA/ESA, volná díla

### 7.11 Dějepis a společnost (21 stránek)

Společné pro dějepis: dnešní lekce mají stejnou čtveřici režimů (osobnosti, časová osa, události, pojmy) a učí hlavně **letopočty a jména**. 🔗 Do každé lekce přidat **pramen** (🧩 pramen podle vzoru `d6_prameny`), **mapu** a **příčinu a důsledek** (🧩 síť). Časová osa jedna pro celý web s pruhy ČR a svět. Obrázky: styl E (skutečné prameny, portréty, mapy, fotografie), rekonstrukce stylem A jen výslovně označené. U citlivých témat (holokaust, válka) žádné generované obrazy utrpení.

#### Starověké Řecko · [d6_recko.html](obsah/d6_recko.html)
- **Zařazení:** Zeměpis a dějepis › Dějepis · 6. r. · lekce A
- **Popis:** Kdo to byl, pojmy a stavby, události a letopočty, seřaď události.
- **Funkčnost:** 4 režimy, předčítání.
- **Cíl výuky:** Žák popíše městské státy, athénskou demokracii a přínos řecké kultury.
- **Vylepšení:**
  - 🧩 Mapa polis a kolonií.
  - Kdo v Athénách hlasoval (občané) a kdo ne (ženy, otroci, cizinci) jako obrázkové rozdělení obyvatel.
  - Architektura: tři řády sloupů k poznávání.
- **Obrázky:**
  - `IMG-d-01` 🟠 **E** · fotografie Parthenónu, tří řádů sloupů (dórský, iónský, korintský), černofigurové a červenofigurové vázy, olympijského stadionu v Olympii
  - `IMG-d-02` ⚪ **A** · rekonstrukce athénské agory se shromážděním (označit „rekonstrukce“)

#### Starověký Řím · [d6_rim.html](obsah/d6_rim.html)
- **Zařazení:** Dějepis › 6.–7. r. · lekce A
- **Popis:** Kdo to byl, pojmy a stavby, události a letopočty, seřaď.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše vývoj Říma od království po císařství a římský přínos (právo, stavby, jazyk).
- **Vylepšení:**
  - Mapa území v několika obdobích na stejném podkladu (posuvník času).
  - Římské stavby a vynálezy jako karty (akvadukt, silnice, lázně, amfiteátr).
  - Rozlišení dokladu (Pompeje) a rekonstrukce.
- **Obrázky:**
  - `IMG-d-03` 🟠 **E** · fotografie Kolosea, Pont du Gard, římské silnice, Pompejí, římské mince, nápisu na oblouku
  - `IMG-d-04` ⚪ **A** · rekonstrukce římského fóra (označit)

#### Starověký Egypt a Mezopotámie · [d6_stary_orient.html](obsah/d6_stary_orient.html)
- **Zařazení:** Dějepis › 6. r. · lekce A
- **Popis:** Kdo to byl, pojmy a stavby, události, seřaď.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vysvětlí, proč první státy vznikly u velkých řek, a popíše přínos písma a zákonů.
- **Vylepšení:**
  - Schéma řeka → zavlažování → úroda → města → správa → písmo (🧩 síť).
  - Pramenný úkol: úryvek Chammurapiho zákoníku, hieroglyfy „přečti své jméno“.
- **Obrázky:**
  - `IMG-d-05` 🟠 **E** · fotografie stély Chammurapiho zákoníku, klínopisné destičky, Rosettské desky, pyramid v Gíze, zikkuratu v Uru, papyru s hieroglyfy

#### Kde najít historické mapy · [historicke_mapy_odkazy.html](obsah/historicke_mapy_odkazy.html)
- **Zařazení:** Dějepis › 6.–9. r. · rozcestník F
- **Popis:** Odkazy na externí sbírky historických map s návodem.
- **Funkčnost:** odkazy.
- **Cíl výuky:** Učitel i žák najdou historickou mapu a porovnají místo tehdy a dnes.
- **Vylepšení:**
  - Hotové pracovní zadání „stejné místo tehdy a dnes“ (například obec na mapě stabilního katastru a dnes).
  - 🔗 Sloučit s `eduMaps` do jednoho mapového rozcestníku, nebo propojit obousměrně.
- **Obrázky:** žádné.

#### Časová osa světových dějin · [svetove_dejiny.html](obsah/svetove_dejiny.html)
- **Zařazení:** Dějepis › 6.–9. r. · samostatná F
- **Popis:** Osa a kvíz (10 otázek).
- **Funkčnost:** osa, kvíz, skóre.
- **Cíl výuky:** Žák zařadí hlavní světové události do období a souvislostí.
- **Vylepšení:**
  - 🔗 Sloučit s `casova_osa` do jedné 🧩 časové osy s pruhy ČR / Evropa / svět a filtrem ročníku.
  - Souběžnost: co se dělo jinde ve stejné době (Čína, Amerika).
- **Obrázky:** karty událostí převzít z obrázků dějepisných lekcí.

#### Čas, prameny a práce historika · [d6_prameny.html](obsah/d6_prameny.html)
- **Zařazení:** Dějepis › 6. r. · pilot C (hlavní lekce rodiny dějepisu)
- **Popis:** Vzorová lekce: úryvek zákona č. 11/1918 Sb., určení původce, doby, účelu a dokladu; počítání letopočtů přes přelom letopočtu; procvičování.
- **Funkčnost:** vedená aktivita, 4 režimy, návaznosti.
- **Cíl výuky:** Žák určí původ a účel pramene a doloží závěr jeho slovy.
- **Vylepšení:**
  - 🧩 Pramen jako sdílená komponenta pro všechny dějepisné lekce.
  - Hmotné prameny na fotografiích (mince, nástroj, stavba) k třídění.
- **Obrázky:**
  - `IMG-d-06` 🟠 **E** · fotografie 8 pramenů různých typů (pravěký nástroj, římská mince, středověká listina s pečetí, kronika, dobová fotografie, noviny z roku 1918, plakát, pohlednice) — třídění pramenů

#### Pravěk · [d6_pravek.html](obsah/d6_pravek.html)
- **Zařazení:** Dějepis › 6. r. · lekce A
- **Popis:** Které období, seřaď vývoj, vývoj člověka, život v pravěku.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše období pravěku podle materiálu nástrojů a vysvětlí význam zemědělství.
- **Vylepšení:**
  - Archeologická sonda: vrstvy s nálezy, žák vyvozuje, co z nálezu víme a co ne.
  - Vývoj člověka jako strom s časovým překryvem (🔗 `pr9_vyvoj_zeme`).
- **Obrázky:**
  - `IMG-d-07` 🟠 **A** · rekonstrukce dvou sídlišť: lovci a sběrači (starší doba kamenná) a první zemědělci (mladší doba kamenná, dlouhé domy) — označit
  - `IMG-d-08` 🟠 **E** · fotografie nálezů (pěstní klín, Věstonická venuše, keramika s lineární výzdobou, bronzový meč, keltská mince)
  - `IMG-d-09` ⚪ **A** · řez archeologickou sondou s vrstvami a nálezy — hotspoty

#### Raný středověk a příchod Slovanů · [d7_rany_stredovek.html](obsah/d7_rany_stredovek.html)
- **Zařazení:** Dějepis › 7. r. · lekce A (s mapou)
- **Popis:** Mapa hradišť, časová osa, stěhování národů, Velká Morava.
- **Funkčnost:** 4 režimy, mapa.
- **Cíl výuky:** Žák popíše příchod Slovanů, Sámovu říši a Velkou Moravu a ukáže hradiště na mapě.
- **Vylepšení:**
  - Mapa hradišť s obchodními cestami a nálezy.
  - Rozlišení jistého a nejistého poznání (u Sámovy říše).
- **Obrázky:**
  - `IMG-d-10` 🟠 **E** · fotografie velkomoravských nálezů (gombíky, náušnice, základy kostela v Mikulčicích), hlaholice
  - `IMG-d-11` ⚪ **A** · rekonstrukce hradiště (Mikulčice) — sdílet s `IMG-prv-21`

#### Husitství · [d7_husitstvi.html](obsah/d7_husitstvi.html)
- **Zařazení:** Dějepis › 7.–8. r. · lekce A (s mapou)
- **Popis:** Mapa bitev, časová osa, osobnosti, pojmy a myšlenky.
- **Funkčnost:** 4 režimy, mapa.
- **Cíl výuky:** Žák vysvětlí příčiny husitského hnutí, jeho požadavky a důsledky.
- **Vylepšení:**
  - Čtyři artikuly pražské jako pramen s otázkami.
  - Dvě dobová svědectví s odlišným pohledem (husitský a katolický kronikář).
  - Příčiny → události → důsledky jako 🧩 síť.
- **Obrázky:**
  - `IMG-d-12` 🟠 **E** · Jenský kodex (Hus na hranici, husité), Betlémská kaple, vozová hradba z dobové iluminace

#### Lucemburkové a Karel IV. · [d7_lucemburkove.html](obsah/d7_lucemburkove.html)
- **Zařazení:** Dějepis › 7. r. · lekce A (s mapou Prahy)
- **Popis:** Stavby v Praze, kdo to byl, časová osa, doba Karla IV.
- **Funkčnost:** 4 režimy, SVG mapa staveb.
- **Cíl výuky:** Žák popíše vládu Karla IV. a jeho stavby a vysvětlí jejich význam pro Prahu.
- **Vylepšení:**
  - Mapa Prahy se stavbami, u každé rok založení a dokončení a funkce.
  - Pramen: úryvek zakládací listiny univerzity nebo Vita Caroli.
- **Obrázky:**
  - `IMG-d-13` 🟠 **E** · fotografie Karlova mostu, Karlštejna, katedrály sv. Víta, Karolina, votivního obrazu Jana Očka (portrét Karla IV.)

#### Přemyslovci · [d7_premyslovci.html](obsah/d7_premyslovci.html)
- **Zařazení:** Dějepis › 7. r. · lekce A
- **Popis:** Kdo to byl, letopočty, kdo vládl dřív, rodokmen.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák seřadí nejvýznamnější Přemyslovce a vysvětlí vznik a upevnění českého státu.
- **Vylepšení:**
  - Rodokmen propojený s osou a mapou území (rozšíření za Přemysla Otakara II.).
  - Zlatá bula sicilská jako pramen.
- **Obrázky:**
  - `IMG-d-14` 🟠 **E** · Zlatá bula sicilská, svatováclavská přilba, Kosmova kronika (iluminace), rotunda sv. Kateřiny ve Znojmě

#### Časová osa českých dějin · [casova_osa.html](obsah/casova_osa.html)
- **Zařazení:** Dějepis › 7.–9. r. · samostatná F
- **Popis:** Přehled událostí a tři kvízy (rok → událost, událost → rok, napiš letopočet).
- **Funkčnost:** osa, 3 kvízy.
- **Cíl výuky:** Žák zná klíčové letopočty českých dějin a zařadí událost do období.
- **Vylepšení:**
  - 🔗 Sloučit se `svetove_dejiny` do jedné 🧩 časové osy (hlavní lekce rodiny „čas v dějinách“).
  - Kvízy intervalů a pořadí místo přesných letopočtů; karta události s obrázkem a odkazem do lekce.
- **Obrázky:** karty událostí z obrázků dějepisných lekcí.

#### Zámořské objevy a renesance · [d8_objevy_renesance.html](obsah/d8_objevy_renesance.html)
- **Zařazení:** Dějepis › 8. r. · lekce A
- **Popis:** Mořeplavci a umělci, časová osa, objevy a důsledky, renesance a humanismus.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše objevné plavby a jejich důsledky pro různé skupiny obyvatel a pozná znaky renesance.
- **Vylepšení:**
  - 🧩 Mapa tras plaveb s animací.
  - Důsledky pro Evropany, původní obyvatele a Afričany jako tři sloupce.
  - Poznávání renesance na konkrétním díle (hotspoty znaků: perspektiva, antické motivy).
- **Obrázky:**
  - `IMG-d-15` 🟠 **E** · reprodukce (Leonardo — Mona Lisa, Vitruviánský muž; Michelangelo — David; Botticelli — Zrození Venuše), renesanční zámek Litomyšl, dobová mapa světa (Waldseemüller)

#### Průmyslová revoluce a národní obrození · [d8_prumyslova_revoluce.html](obsah/d8_prumyslova_revoluce.html)
- **Zařazení:** Dějepis › 8.–9. r. · lekce A
- **Popis:** Osobnosti, časová osa, vynálezy a společnost, národní obrození.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vysvětlí, jak vynálezy změnily výrobu, město a práci, a popíše národní obrození.
- **Vylepšení:**
  - Den dělníka v manufaktuře a v továrně (srovnání).
  - Mapa železnic 1850 × 1900.
- **Obrázky:**
  - `IMG-d-16` 🟠 **E** · dobové obrazy a fotografie (Wattův parní stroj, tovární haly, první lokomotiva, Národní divadlo, portréty Jungmanna a Palackého)

#### Osvícenství a revoluce · [d8_osvicenstvi.html](obsah/d8_osvicenstvi.html)
- **Zařazení:** Dějepis › 8. r. · lekce A
- **Popis:** Osobnosti, časová osa, osvícenství a reformy, francouzská revoluce.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vysvětlí osvícenské myšlenky, reformy Marie Terezie a Josefa II. a příčiny francouzské revoluce.
- **Vylepšení:**
  - „Co reforma změnila pro jednu rodinu“ (škola, robota, náboženství) jako interaktivní příběh.
  - Deklarace práv člověka a občana jako pramen.
- **Obrázky:**
  - `IMG-d-17` 🟠 **E** · portréty Marie Terezie a Josefa II., Deklarace práv člověka a občana (dobový tisk), dobytí Bastily (dobový obraz)

#### Reformace a třicetiletá válka · [d8_reformace.html](obsah/d8_reformace.html)
- **Zařazení:** Dějepis › 8. r. · lekce A
- **Popis:** Osobnosti, časová osa, reformace, třicetiletá válka.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vysvětlí příčiny reformace a průběh a důsledky třicetileté války pro české země.
- **Vylepšení:**
  - 🧩 Mapa náboženství v Evropě kolem roku 1600 a 1650.
  - Síť vazeb náboženství – politika – válka.
- **Obrázky:**
  - `IMG-d-18` 🟠 **E** · Lutherovy teze (dobový tisk), defenestrace 1618 (dobová rytina), Staroměstská exekuce (dobový leták), portrét Komenského

#### Instituce Evropské unie · [eu_instituce.html](obsah/eu_instituce.html)
- **Zařazení:** Dějepis a společnost › 9. r. · samostatná F
- **Popis:** Přehled institucí a kvíz (10 otázek).
- **Funkčnost:** přehled, kvíz.
- **Cíl výuky:** Žák rozliší hlavní instituce EU a popíše, jak vzniká evropský předpis.
- **Vylepšení:**
  - 🔗 Převést pod `uloha.js`.
  - Cesta předpisu mezi institucemi jako animované schéma.
  - Srovnání institucí s podobnými názvy (Evropská rada × Rada EU × Rada Evropy).
- **Obrázky:**
  - `IMG-d-19` ⚪ **C** · fotografie budov Evropského parlamentu (Štrasburk), Evropské komise (Brusel), Soudního dvora (Lucemburk)

#### První světová válka · [d9_prvni_valka.html](obsah/d9_prvni_valka.html)
- **Zařazení:** Dějepis › 9. r. · lekce A
- **Popis:** Osobnosti, časová osa, průběh války, důsledky a nové státy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší příčiny, spouštěč a důsledky války a popíše život na frontě a v zázemí.
- **Vylepšení:**
  - Příčiny × spouštěč × důsledky jako tři oddělené sloupce (🧩 síť).
  - Mapa Evropy 1914 × 1920 s posuvníkem.
  - Dopis z fronty jako pramen.
- **Obrázky:**
  - `IMG-d-20` 🟠 **E** · dobové fotografie (zákopy, legionáři, fronta v Itálii, fronty na chléb v zázemí), válečná pohlednice

#### Vznik ČSR a meziválečné období · [d9_csr.html](obsah/d9_csr.html)
- **Zařazení:** Dějepis › 9. r. · lekce A
- **Popis:** Osobnosti, časová osa, stát a společnost, hospodářství a kultura.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše vznik a uspořádání první republiky, její národnostní složení a cestu k Mnichovu.
- **Vylepšení:**
  - Národnostní mapa ČSR a demokratické instituce.
  - Dva dobové zdroje k Mnichovu (český a německý tisk).
  - 🔗 Navazuje na pramen z `d6_prameny` (zákon 11/1918).
- **Obrázky:**
  - `IMG-d-21` 🟠 **E** · dobové fotografie (28. říjen 1918 v Praze, T. G. Masaryk, Baťovy závody, mobilizace 1938), plakát

#### Druhá světová válka a holokaust · [d9_druha_valka.html](obsah/d9_druha_valka.html)
- **Zařazení:** Dějepis › 9. r. · lekce A (citlivé téma)
- **Popis:** Osobnosti, časová osa, průběh války, protektorát, odboj a holokaust.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše průběh války, život v protektorátu, odboj a holokaust a vysvětlí, proč si oběti připomínáme.
- **Vylepšení:**
  - Oddělit faktografický kvíz od reflexe: část o holokaustu bez skóre, s osobním příběhem (materiály Památníku Terezín, Paměti národa, Kameny zmizelých).
  - Mapa válečných front v čase.
- **Obrázky:**
  - `IMG-d-22` 🟠 **E** · pečlivě vybrané dobové fotografie (Praha 15. 3. 1939, parašutisté operace Anthropoid, Lidice před a po, Terezín) a dětské kresby z Terezína (s licencí Židovského muzea) — **žádné generované obrazy**

#### Studená válka a rok 1989 · [d9_studena_valka.html](obsah/d9_studena_valka.html)
- **Zařazení:** Dějepis › 9. r. · lekce A
- **Popis:** Osobnosti, časová osa, rozdělený svět, Československo 1948–1989.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák popíše rozdělení světa, život v komunistickém Československu a události roku 1989.
- **Vylepšení:**
  - Mapa bloků s konflikty v čase.
  - Svědectví různých lidí (disident, dělník, student) z Paměti národa.
  - Pramen: úryvek Charty 77.
- **Obrázky:**
  - `IMG-d-23` 🟠 **E** · dobové fotografie (únor 1948, srpen 1968, Berlínská zeď, Václavské náměstí v listopadu 1989), prohlášení Charty 77 — sdílet s `IMG-prv-25`

### 7.12 Informatika (18 stránek)

Společné pro informatiku: 🔗 programování (4.–7. r.) má projít **jedním prostředím**: 🧩 robot na mřížce s krokováním, které se od sekvencí přes cykly a proměnné dostane k funkcím. Žák tak nezačíná v každém ročníku v jiném rozhraní. Bezpečnost a etika stavět na fiktivních scénkách (příspěvky, zprávy, chaty) bez stálých postav. Obrázky: hlavně jednotné ilustrace hardwaru (styl B) a fiktivní ukázky obrazovek kreslené kódem (nikdy napodobeniny skutečných sítí a značek).

#### Programování – sekvence příkazů · [inf4_sekvence.html](obsah/inf4_sekvence.html)
- **Zařazení:** Informatika › Algoritmy a programování · 4. r. · lekce A (hlavní lekce rodiny programování)
- **Popis:** Sestavení cesty robota k cíli, spuštění programu, hledání chyby v programu.
- **Funkčnost:** 2 režimy, SVG mřížka, nová úloha.
- **Cíl výuky:** Žák sestaví posloupnost příkazů, která dovede robota k cíli, a opraví chybný program.
- **Vylepšení:**
  - 🧩 Robot: krokování se zvýrazněným právě vykonaným příkazem, tlačítko „krok“.
  - Při chybě se robot zastaví na prvním špatném kroku a žák opraví jediný příkaz.
  - Unplugged varianta: vytisknout mřížku pro hru ve dvojicích.
- **Obrázky:**
  - `IMG-inf-01` 🟠 **B** · postavička robota (4 natočení: nahoru, dolů, vlevo, vpravo), cíl (vlajka), překážky (kámen, strom, voda), sbíraný předmět (klíč, jablko) — sada dlaždic pro 🧩 robot, společná pro 4 lekce

#### Programování – cykly a větvení · [inf5_cykly.html](obsah/inf5_cykly.html)
- **Zařazení:** Informatika › 5.–6. r. · lekce A
- **Popis:** Zkrácení programu cyklem, kde robot skončí, doplnění podmínky, kolikrát se to provede.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák nahradí opakující se příkazy cyklem a použije podmínku.
- **Vylepšení:**
  - Stejný program rozepsaně a s cyklem vedle sebe, žák vidí, že robot jde stejně.
  - Podmínka s aktuální pravdivostí (zelená/červená) a změna prostředí, která rozhodnutí obrátí.
- **Obrázky:** sdílet `IMG-inf-01`.

#### Programování – proměnné a podmínky · [inf6_promenne.html](obsah/inf6_promenne.html)
- **Zařazení:** Informatika › 6.–7. r. · lekce A
- **Popis:** Jaká je hodnota, co program vypíše, porovnávání, pojmy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák sleduje hodnotu proměnné během programu a předpoví výstup.
- **Vylepšení:**
  - Krokový vykonávač s tabulkou proměnných (stará hodnota přeškrtnutá, nová vedle).
  - Proměnná jako krabička se štítkem; přiřazení vs. rovnost (x = x + 1 není rovnice).
  - 🧩 Robot se sbíráním předmětů do proměnné „počet“.
- **Obrázky:** sdílet `IMG-inf-01`.

#### Programování – funkce a parametry · [inf7_funkce.html](obsah/inf7_funkce.html)
- **Zařazení:** Informatika › 7.–8. r. · lekce A
- **Popis:** Co program udělá, správné volání, co dát do funkce, parametry a návratová hodnota.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák vytvoří funkci s parametrem a použije ji opakovaně.
- **Vylepšení:**
  - Průchod voláním funkce (skok do těla a návrat) animací.
  - Robot kreslí tvary: funkce „čtverec(velikost)“ a kreslení domečku z volání.
- **Obrázky:** žádné.

#### Algoritmy řazení · [eduSort.html](obsah/eduSort.html)
- **Zařazení:** Informatika › 8.–9. r. · simulace F (sjednocená v etapě 04)
- **Popis:** Vizualizace sedmi algoritmů řazení s rychlostí, počtem prvků, statistikou a exportem.
- **Funkčnost:** výběr algoritmu, start/pauza/reset, nová data, export statistik.
- **Cíl výuky:** Žák popíše princip alespoň dvou algoritmů řazení a porovná jejich rychlost.
- **Vylepšení:**
  - 🔗 Společná hlavička a jednotná tlačítka.
  - Krokování s popisem („porovnávám 5 a 3 → prohodím“).
  - Dva algoritmy vedle sebe na stejných datech; „řaď sám“ s kartami a počítáním porovnání.
- **Obrázky:** žádné.

#### Modely a simulace · [inf9_model_simulace.html](obsah/inf9_model_simulace.html)
- **Zařazení:** Informatika › 9. r. · lekce A s modelem
- **Popis:** Model populace, co udělá změna parametru, model a skutečnost, pojmy.
- **Funkčnost:** 4 režimy, SVG graf.
- **Cíl výuky:** Žák změní parametry modelu, předpoví výsledek a posoudí, co model zanedbává.
- **Vylepšení:**
  - Porovnání modelu se skutečnými daty (například populace kamzíků nebo bobrů v ČR) a výpočet odchylky.
  - 🔗 Odkaz na `pr9_ekologie` a `m7_umernost` (modely v jiných předmětech).
- **Obrázky:** žádné.

#### Data, informace a kódování · [inf4_data.html](obsah/inf4_data.html)
- **Zařazení:** Informatika › Data a sítě · 4.–5. r. · lekce A
- **Popis:** Obrázek podle kódu, dvojková soustava, tajná zpráva.
- **Funkčnost:** 3 režimy, SVG mřížka.
- **Cíl výuky:** Žák zakóduje a dekóduje jednoduchý obrázek a číslo ve dvojkové soustavě.
- **Vylepšení:**
  - Obrázek a kód vedle sebe s okamžitou změnou; oprava chybného pixelu.
  - Dvojková čísla jako karty s tečkami (1, 2, 4, 8, 16) otáčené lícem/rubem.
- **Obrázky:** žádné.

#### Morseova abeceda · [morse_code.html](obsah/morse_code.html)
- **Zařazení:** Informatika › Data a sítě · 5.–7. r. · nástroj F
- **Popis:** Převod textu na Morse a zpět, přehrání zvukem, referenční tabulka.
- **Funkčnost:** převod, přehrání, rychlost, tón.
- **Cíl výuky:** Žák zakóduje a dekóduje krátkou zprávu v Morseově abecedě a vysvětlí princip kódování.
- **Vylepšení:**
  - 🔗 Doplnit procvičování pod `uloha.js` (poslech → písmeno).
  - Synchronizace přehrávaného znaku se zvýrazněním a světelným signálem (blikání).
  - Morseův strom (tečka vlevo, čárka vpravo) jako pomůcka.
- **Obrázky:** žádné.

#### Tabulkový procesor – vzorce · [inf6_tabulky.html](obsah/inf6_tabulky.html)
- **Zařazení:** Informatika › Data a sítě · 6.–7. r. · pilot C
- **Popis:** Vzorová lekce: editovatelná minitabulka se vzorci a okamžitým přepočtem, předpověď změny, procvičování adres, vzorců a funkcí.
- **Funkčnost:** vedená aktivita, 4 režimy, návaznosti.
- **Cíl výuky:** Žák změní vstupní buňku a vysvětlí přepočet vzorce.
- **Vylepšení:**
  - Kopírování vzorce dolů s posunem relativních odkazů (zvýraznění, kam odkaz „ukazuje“).
  - Malý graf z tabulky (🧩 graf).
- **Obrázky:** žádné.

#### Počítačové sítě a internet · [inf7_site.html](obsah/inf7_site.html)
- **Zařazení:** Informatika › Data a sítě · 7.–8. r. · lekce A
- **Popis:** Cesta dat, pojmy, prvky sítě, bezpečně na síti.
- **Funkčnost:** 4 režimy, SVG.
- **Cíl výuky:** Žák popíše cestu dat od zařízení k serveru (DNS, router, server) a pozná prvky sítě.
- **Vylepšení:**
  - Animace požadavku po krocích (paket jako obálka s adresou).
  - Porucha v jednom místě a úloha „kde je chyba?“.
- **Obrázky:**
  - `IMG-inf-02` 🟠 **B** · karty prvků sítě v jednotném stylu (notebook, telefon, Wi-Fi router, přepínač, serverovna, optický kabel, vysílač mobilní sítě, datové centrum) — uzly animace

#### Šifrování a kódování dat · [inf7_sifrovani.html](obsah/inf7_sifrovani.html)
- **Zařazení:** Informatika › Data a sítě · 7.–8. r. · lekce A
- **Popis:** Zašifruj (Caesar), rozlušti, komprese, kódování.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozliší kódování, šifrování a kompresi a použije Caesarovu šifru.
- **Vylepšení:**
  - Šifrovací kolo (dva kotouče) k otáčení.
  - Luštění podle četnosti písmen s grafem.
  - Ztrátová komprese obrázku s posuvníkem kvality.
- **Obrázky:**
  - `IMG-inf-03` ⚪ **A** · jedna fotografie podobného stylu (krajina) jako vzor pro ztrátovou kompresi — lze použít `ekologie-krajina-ilustrace`

#### Databáze a strukturovaná data · [inf8_databaze.html](obsah/inf8_databaze.html)
- **Zařazení:** Informatika › Data a sítě · 8.–9. r. · lekce A
- **Popis:** Filtrování, řazení, návrh tabulky, pojmy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák filtruje a řadí záznamy a navrhne tabulku s jednoznačným klíčem.
- **Vylepšení:**
  - Editovatelná databáze (knihovna třídy) se skutečným filtrem a řazením.
  - Chyba bez klíče (dva Jan Novák) a její řešení.
  - 🔗 Stejné prostředí jako minitabulka v `inf6_tabulky`.
- **Obrázky:** žádné.

#### Hardware a bezpečné chování · [inf4_hardware.html](obsah/inf4_hardware.html)
- **Zařazení:** Informatika › Bezpečnost a etika · 4.–5. r. · lekce A
- **Popis:** K čemu to je, vstup/výstup, bezpečné heslo, jak se zachovám.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák pojmenuje části počítače, rozliší vstupní a výstupní zařízení a vytvoří bezpečné heslo.
- **Vylepšení:**
  - Pracovní stůl s hotspoty zařízení; zařízení vstup i výstup (dotyková obrazovka, sluchátka s mikrofonem).
  - Měřič síly hesla (lokální, bez odesílání) s vysvětlením.
- **Obrázky:**
  - `IMG-inf-04` 🔴 **A** · pracovní stůl s počítačem (monitor, klávesnice, myš, reproduktory, mikrofon, webkamera, tiskárna, skener, flash disk, sluchátka) — hotspoty zařízení
  - `IMG-inf-05` 🟠 **B** · rozložená počítačová skříň (základní deska, procesor, paměť RAM, disk, zdroj, grafická karta) — hotspoty součástí

#### Informace na internetu a ověřování · [inf5_zdroje.html](obsah/inf5_zdroje.html)
- **Zařazení:** Informatika › Bezpečnost a etika · 5.–6. r. · lekce A
- **Popis:** Dá se tomu věřit, jak si to ověřím, zpráva × reklama, na čem poznáš kvalitu.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák posoudí důvěryhodnost informace podle autora, data a zdroje a ověří ji.
- **Vylepšení:**
  - Dvě fiktivní zprávy vedle sebe (kódem kreslené „stránky“), žák hledá autora, datum, zdroj.
  - Dvě kopie téže zprávy nejsou dva nezávislé zdroje — sledování původu.
- **Obrázky:** žádné (fiktivní stránky kreslí kód, ne napodobeniny skutečných médií).

#### Digitální stopa a bezpečnost · [inf6_digitalni_stopa.html](obsah/inf6_digitalni_stopa.html)
- **Zařazení:** Informatika › Bezpečnost a etika · 6.–7. r. · lekce A (hlavní lekce rodiny online bezpečí)
- **Popis:** Co to prozradí, sdílet/nesdílet, jak se zachovám, pojmy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák odhadne, co o sobě prozradí příspěvkem, a ví, jak se zachovat při kyberšikaně.
- **Vylepšení:**
  - Fiktivní příspěvek školáka s fotografií: postupně odkrývat, co lze zjistit (škola na mikině, adresa na cedulce, čas).
  - Volba adresáta sdílení (rodina / třída / veřejně) mění riziko.
- **Obrázky:**
  - `IMG-inf-06` 🔴 **A** · „fotka z telefonu“: školák na ulici před domem, na mikině logo fiktivní školy, v pozadí čitelné číslo domu a název ulice (fiktivní), jízdní řád zastávky — hotspoty prozrazujících detailů

#### Autorská práva a licence · [inf8_licence.html](obsah/inf8_licence.html)
- **Zařazení:** Informatika › Bezpečnost a etika · 8.–9. r. · lekce A
- **Popis:** Smím to použít, Creative Commons, citace a zdroje, pojmy.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák rozhodne, zda smí dílo použít, a správně ho uvede podle licence.
- **Vylepšení:**
  - Sestavení atribuce ke konkrétnímu obrázku (například z webu Metodusu — obrázky stylu C mají licenci v `.zdroj.txt`).
  - Licence CC jako skládačka ikon (BY, SA, NC, ND).
  - 🔗 Propojit s `citation_generator`.
- **Obrázky:** využít vlastní fotografie stylu C z webu jako cvičné příklady.

#### AI přednáška · [AI_prednaska.html](obsah/AI_prednaska.html)
- **Zařazení:** Informatika › Bezpečnost a etika · 9. r. · prezentace F (záměrně tmavá)
- **Popis:** Slidy pro laiky: co je AI, historie, typy, strojové a hluboké učení, použití, nástroje, agenti, prompting.
- **Funkčnost:** přehled slidů, celá obrazovka, předchozí/další.
- **Cíl výuky:** Žák a učitel pochopí, co AI je, co umí a kde chybuje.
- **Vylepšení:**
  - 🔗 Převést do `prezentace.html` (stejný přehrávač slidů jako zbytek webu) a propojit s `inf9_ai_etika` jako výklad → procvičování.
  - Datum revize u nástrojů; aktivity místo konce „AI vás nahradí“: najdi chybu v odpovědi, ověř tvrzení.
- **Obrázky:**
  - `IMG-inf-07` ⚪ **A** · nahradit dnešní `Photo*.png` a `Cortana.png` jednotnými ilustracemi v A/B stylu (stejný počet slidů); stávající obrázky zkontrolovat z hlediska licence

#### Umělá inteligence a etika · [inf9_ai_etika.html](obsah/inf9_ai_etika.html)
- **Zařazení:** Informatika › Bezpečnost a etika · 9. r. · lekce A
- **Popis:** Jak AI funguje, kde chybuje, etická dilemata, AI ve škole.
- **Funkčnost:** 4 režimy.
- **Cíl výuky:** Žák vysvětlí, jak AI vzniká z dat, rozpozná typické chyby a zodpovědně ji použije ve škole.
- **Vylepšení:**
  - Statická ukázka přesvědčivé, ale chybné odpovědi a postup ověření.
  - Dilemata jako diskusní karty se zdůvodněním, bez jediné správné odpovědi (bez skóre).
  - Mini-model „naučím počítač třídit“ (obrázky jablek a hrušek, špatná data → špatný výsledek).
- **Obrázky:**
  - `IMG-inf-08` ⚪ **B** · 20 karet jablek a 20 karet hrušek různých odrůd, barev a úhlů + 4 „zavádějící“ (zelené jablko podobné hrušce) — data pro mini-model třídění

### 7.13 Další výuka (10 stránek)

Nástroje bez vazby na předmět. 🔗 Mají stejnou hlavičku (proužek „Nástroj“ v neutrální barvě) a stejná tlačítka. Kartičky, knihovna sad a deník tvoří jeden systém opakování — měly by sdílet data a vzhled.

#### Trenažér psaní · [typing_trainer.html](obsah/typing_trainer.html)
- **Zařazení:** Další výuka › Učení a opakování · bez ročníku · nástroj F
- **Popis:** Psaní všemi deseti: lekce po řadách, slova, diakritika, věty, čísla, minutovka; klávesnice na obrazovce, WPM a přesnost.
- **Funkčnost:** 9 režimů, nový/stejný text, zobrazení klávesnice.
- **Cíl výuky:** Žák píše všemi deseti na české klávesnici s přesností nad 95 %.
- **Vylepšení:**
  - Přehled problémových kláves (teplotní mapa klávesnice) a cílená série na ně.
  - Přesnost na prvním místě, rychlost až potom; výuka bez časového limitu.
  - Texty z jiných lekcí Metodusu (věty z češtiny, zeměpisné názvy).
- **Obrázky:**
  - `IMG-00-03` ⚪ **B** · dvě ruce na klávesnici ve výchozí poloze (prsty na ASDF a JKL) shora — ukázka správného držení

#### Kartičky (flashcards) · [flashcards.html](obsah/flashcards.html)
- **Zařazení:** Další výuka › Učení a opakování · nástroj F
- **Popis:** Učení a opakování kartiček metodou SM-2, správa sad, export/import, nastavení animací.
- **Funkčnost:** otáčení, hodnocení 4 stupni, sady, nastavení.
- **Cíl výuky:** Žák si efektivně opakuje slovíčka a pojmy v rozložených intervalech.
- **Vylepšení:**
  - Jednodušší hodnocení „Neumím / S pomocí / Umím“ v popředí.
  - Kartičky s obrázkem (karty B z webu) a zvukem.
  - 🔗 Opakování zapisovat do deníku; knihovna sad jako záložka uvnitř.
- **Obrázky:** využít karty `IMG-aj-02`, `IMG-prv-10`, `IMG-pr-05`.

#### Studijní deník a odznaky · [edu_progress.html](obsah/edu_progress.html)
- **Zařazení:** Další výuka › Učení a opakování · nástroj F
- **Popis:** Deník dnů v řadě, posledních 28 dní, záznamy podle témat, průběh v pilotních lekcích (etapa 08), odznaky, ruční zápis.
- **Funkčnost:** přehledy, ruční zápis, vymazání.
- **Cíl výuky:** Žák vidí, co procvičoval, co mu jde a co zopakovat.
- **Vylepšení:**
  - 🔗 Zapisovat všechny rodiny stránek (oddíl 2.4), ne jen piloty.
  - Doporučení „Zopakuj si“ s přímým odkazem do režimu, kde byly chyby.
  - Mapa dovedností po předmětech (ne jedno procento).
- **Obrázky:**
  - `IMG-00-04` ⚪ **B** · 12 odznaků v jednotném stylu (medailonky: první den, týden v řadě, 100 úloh, každý předmět…) — nahradit emoji

#### Knihovna sad kartiček · [knihovna_sad.html](obsah/knihovna_sad.html)
- **Zařazení:** Další výuka › Učení a opakování · nástroj F
- **Popis:** Hotové sady k přidání do kartiček nebo ke stažení.
- **Funkčnost:** seznam sad, přidání, stažení.
- **Cíl výuky:** Žák najde hotovou sadu k tématu, které se učí.
- **Vylepšení:**
  - U sady ročník, počet karet, ukázka a odkaz na lekci; náhled před importem.
  - 🔗 Sady generovat z dat lekcí (slovíčka, pojmy, vzorce), ne udržovat zvlášť.
- **Obrázky:** žádné.

#### Hudební nauka · [music_theory.html](obsah/music_theory.html)
- **Zařazení:** Další výuka › Hudba · nástroj F
- **Popis:** Stupnice a akordy s přehráním, kvintový kruh.
- **Funkčnost:** základní tón, typ stupnice/akordu, přehrát.
- **Cíl výuky:** Žák postaví durovou a mollovou stupnici a kvintakord a přiřadí předznamenání.
- **Vylepšení:**
  - Klaviatura, notová osnova a zvuk propojené: klepnutí na klávesu zvýrazní notu a naopak.
  - Kvintový kruh jako otočné kolo se změnou předznamenání na osnově.
  - Procvičování pod `uloha.js` (poznej akord sluchem).
- **Obrázky:** žádné (klaviatura a noty kódem).

#### Notová osnova – čtení not · [notes_reading.html](obsah/notes_reading.html)
- **Zařazení:** Další výuka › Hudba · nástroj F
- **Popis:** Rychlé rozpoznávání not v houslovém klíči (c1–c2, c1–g2).
- **Funkčnost:** 2 rozsahy, počitadlo.
- **Cíl výuky:** Žák přečte noty v houslovém klíči a najde je na klaviatuře.
- **Vylepšení:**
  - Záchytné noty (g1, c2) a postupné ubírání nápovědy.
  - Klaviatura a zvuk vybrané noty; krátké písničky k přečtení (Skákal pes).
  - 🔗 Sloučit s hudební naukou do jedné „Hudby“ se sdílenou klaviaturou.
- **Obrázky:** žádné.

#### Kabinet učitele · [ucitel.html](obsah/ucitel.html)
- **Zařazení:** Další výuka › Pro učitele · nástroj E
- **Popis:** Příprava na hodinu, nástroje do hodiny (časovač, losování, kostka, mince, …), okno pro třídu, zálohování.
- **Funkčnost:** dvě úrovně záložek, časovače, generátory, okno pro třídu.
- **Cíl výuky:** Učitel má na jednom místě přípravu i nástroje pro průběh hodiny.
- **Vylepšení:**
  - Uložitelný scénář hodiny (model → diskuse → úlohy → závěrečná otázka) napojený na šablonu `priprava_hodiny`.
  - Seznam „hotové přípravy“ podle rodin témat.
- **Obrázky:** žádné.

#### Tvorba slidů a prezentace · [prezentace.html](obsah/prezentace.html)
- **Zařazení:** Další výuka › Pro učitele · nástroj E
- **Popis:** Tvorba slidů, promítání, okno pro učitele s poznámkami, sestavení z textu, šablona hodiny, tisk podkladů; lze vložit celou aplikaci Metodusu.
- **Funkčnost:** sady, úpravy, náhled, promítání, tisk, formát 16:9/4:3.
- **Cíl výuky:** Učitel připraví výklad s vloženými interaktivními modely.
- **Vylepšení:**
  - Vložení odkazu na konkrétní stav simulace (například optika s nastavenou čočkou).
  - Šablona slidů „Odhadni – ověř – vysvětli“.
  - 🔗 Hostit i `AI_prednaska`.
- **Obrázky:** žádné.

#### Generátor citací · [citation_generator.html](obsah/citation_generator.html)
- **Zařazení:** Další výuka › Pro učitele · nástroj F
- **Popis:** Formulář zdroje (kniha, článek, web, kvalifikační práce), seznam v ISO 690 nebo APA 7, kopírování.
- **Funkčnost:** typy zdrojů, 2 styly, seznam.
- **Cíl výuky:** Žák správně ocituje knihu a webovou stránku.
- **Vylepšení:**
  - Průběžný náhled s označením chybějících údajů.
  - Obrázek titulní strany a tiráže knihy s hotspoty „odkud údaj opsat“.
  - 🔗 Propojit s `inf8_licence`.
- **Obrázky:**
  - `IMG-00-05` ⚪ **B** · titulní strana a tiráž fiktivní knihy (autor, název, nakladatel, rok, ISBN, vydání) bez skutečných značek — hotspoty pro výuku citování; text kreslí web

#### Generátor pracovních listů · [pracovni_listy.html](obsah/pracovni_listy.html)
- **Zařazení:** Další výuka › Pro učitele · nástroj E
- **Popis:** Výběr ročníku, předmětu a témat, obtížnost, varianty A–D, vzhled, hlavička, řešení, kód listu.
- **Funkčnost:** 5 kroků, živý náhled, tisk.
- **Cíl výuky:** Učitel vytiskne list k tématu hodiny ve více variantách s řešením.
- **Vylepšení:**
  - Otevření z lekce s předvyplněným tématem a obtížností (zápatí lekce, oddíl 2.5).
  - Vysvětlené řešení vedle klíče; úlohy s obrázkem (karty B) pro 1. stupeň.
- **Obrázky:** využívat karty B z webu.


---

## Příloha A · Seznam obrázků k výrobě

Vygenerováno z karet (celkem **168 položek**; mnohé jsou sady více obrázků). Podle stylu: **98 k vytvoření** generátorem nebo ilustrátorem (styl A 46, styl B 52) a **70 k vyhledání** skutečných fotografií a dokladů s licencí (styl C 46, styl E 24). Podle priority: 🔴 21, 🟠 85, ⚪ 62.

### Doporučená první dávka

Tyto podklady využije nejvíc stránek najednou a nejvíc přispějí k jednotě webu:

1. `IMG-prv-07`, `IMG-prv-03`, `IMG-prv-20` **naše vesnice** (4 roční období, cesta do školy, plán obce) — jedno místo pro celou prvouku; vyrábět společně, aby seděla geografie (stejný rybník, škola, kostel).
2. `IMG-aj-02` **sada karet slovíček** (asi 120 karet) — využijí ji angličtina, němčina, francouzština, první čtení i kartičky.
3. `IMG-prv-10` a `IMG-pr-05` **zvířata** (karty B pro 1. stupeň, fotografie C pro 2. stupeň).
4. `IMG-prv-17` **fotografie hornin a minerálů** a `IMG-pr-01` **fotografie hub** — tady obrázek chybí nejvíc a generovaný být nesmí.

Při výrobě sady v jednom stylu zadávat všechny karty v jedné dávce se stejným úvodem zadání (oddíl 4.3). Rozdíly ve světle a technice mezi dávkami jsou nejčastější příčinou „slepence“ i u obrázků.


### Vysoká priorita 🔴

| ID | Styl | Co vyrobit nebo sehnat | Stránka |
|---|---|---|---|
| `IMG-cj-01` | B | sada 40 karet jednoduchých předmětů a zvířat pro první čtení (máma, les, pes, auto, ucho, chleba, dům, míč, kolo, ryba…) — jednoznačný motiv bez textu; sdílet s `slabiky` a `cj2_abeceda` | [cj1_pismena](obsah/cj1_pismena.html) |
| `IMG-aj-02` | B | sada asi 120 karet slovíček ve 6 tématech (zvířata, jídlo a pití, dům a nábytek, škola, oblečení, rodina a lidé) — jednoznačný motiv, stejné světlo a okraj; **sdílet s `de_slovicka`, `fr_slovicka`, `cj1_pismena`** | [aj_slovicka](obsah/aj_slovicka.html) |
| `IMG-aj-06` | A | rušná scéna v parku s 10 osobami, z nichž každá dělá jednu jasnou činnost (běží, čte, jí zmrzlinu, venčí psa, hraje na kytaru, spí na lavičce, jede na kole, fotí, krmí kachny, maluje) — hotspoty pro popis „právě teď“ | [aj5_pritomny_prubehovy](obsah/aj5_pritomny_prubehovy.html) |
| `IMG-prv-01` | B | karty členů rozšířené fiktivní rodiny (babička, dědeček, máma, táta, teta, strýc, bratranec, mladší sourozenec) v jednotném stylu — rodokmen | [prv1_rodina](obsah/prv1_rodina.html) |
| `IMG-prv-03` | A | pohled shora na cestu do školy v naší vesnici (dům, chodník, přechod se semaforem, přechod bez semaforu, zastávka, zaparkovaná auta, škola) — hotspoty rozhodovacích míst | [prv1_cesta_skola](obsah/prv1_cesta_skola.html) |
| `IMG-prv-07` | A | naše vesnice ze stejného úhlu ve 4 ročních obdobích (jaro, léto, podzim, zima), se stejným stromem, rybníkem, polem a zahradou — **klíčová sada pro celou prvouku** | [prv1_rocni_obdobi](obsah/prv1_rocni_obdobi.html) |
| `IMG-prv-10` | B | 30 karet zvířat: 15 domácích (kráva, prase, koza, ovce, kůň, slepice, husa, kachna, králík, pes, kočka, morče, osel, krůta, včela) a 15 volně žijících (liška, srna, zajíc, ježek, veverka, divočák, jezevec, sova, datel, čáp, žába, ropucha, užovka, vydra, bobr) | [prv2_zvirata](obsah/prv2_zvirata.html) |
| `IMG-prv-13` | A | koloběh vody v krajině (moře/rybník, slunce, stoupající pára, mraky, déšť nad horami, řeka, podzemní voda) — podklad animace; šipky kreslí web | [prv3_voda_vzduch](obsah/prv3_voda_vzduch.html) |
| `IMG-prv-15` | A | les v řezu s patry (kořenové, mechové, bylinné, keřové, stromové) a 12 typickými organismy — hotspoty | [prv4_ekosystemy](obsah/prv4_ekosystemy.html) |
| `IMG-prv-16` | A | louka a pole s 10 organismy (sdílený styl s `ekologie-krajina-ilustrace`) — hotspoty | [prv4_ekosystemy](obsah/prv4_ekosystemy.html) |
| `IMG-prv-17` | C | fotografie 16 vzorků (žula, pískovec, vápenec, čedič, břidlice, mramor, uhlí, křemen, živec, slída, kalcit, sůl kamenná, sádrovec, pyrit, grafit, magnetit) na neutrálním pozadí se stejným světlem; **sdílet s `pr9_mineraly`** | [prv4_horniny](obsah/prv4_horniny.html) |
| `IMG-prv-20` | A | plán naší vesnice/městečka shora (obecní úřad, pošta, škola, lékař, obchod, knihovna, hasičská zbrojnice, kostel, nádraží, park) — hotspoty; stejné místo jako `IMG-prv-03` a `IMG-prv-07` | [prv3_obec](obsah/prv3_obec.html) |
| `IMG-prv-23` | E | přesné předlohy zbývajících symbolů: státní vlajka, vlajka prezidenta republiky, státní pečeť (SVG z Wikimedia Commons) + nahrávka hymny s volnou licencí | [prv5_statni_symboly](obsah/prv5_statni_symboly.html) |
| `IMG-ch-06` | B | 30 karet odpadu (PET láhev, kelímek od jogurtu, noviny, krabice od mléka, sklenice, plechovka, slupky, baterie, žárovka, textil, polystyren, obal od chipsů…) + karty 6 kontejnerů v barvách — třídění | [ch9_zivotni_prostredi](obsah/ch9_zivotni_prostredi.html) |
| `IMG-pr-01` | C | fotografie 14 druhů hub, u každého 2–3 pohledy (hřib smrkový, hřib kovář, klouzek, bedla vysoká, liška obecná, václavka, pečárka, muchomůrka červená, muchomůrka zelená, muchomůrka tygrovaná, hřib satan, čirůvka tygrovaná, pavučinec plyšový, ucháč obecný) — **nikdy generované** | [pr6_houby](obsah/pr6_houby.html) |
| `IMG-pr-07` | B | 4 karty stavby těla ve stejném měřítku a pohledu shora (včela, křižák, rak, stonožka) — hotspoty částí | [pr6_clenovci](obsah/pr6_clenovci.html) |
| `IMG-pr-05` | C | fotografie 40 zástupců pro poznávačky přírodopisu 6.–7. r. (bezobratlí, ryby, obojživelníci, plazi, ptáci, savci ČR); **společná sada** pro `pr6_bezobratli`, tuto stránku, `pr7_ptaci_savci`, `potravni_retezec` | [pr7_obratlovci_studenokrevni](obsah/pr7_obratlovci_studenokrevni.html) |
| `IMG-pr-13` | B | 8 karet hlav ptáků se zobáky ve stejném pohledu z profilu (datel, kachna, káně, pěnkava, čáp, kos, vlaštovka, sýkora) a 6 karet nohou (kachní plovací, dravčí pařát, datlí šplhavá, pštrosí běhavá, pěvčí, brodivá) | [pr7_ptaci_savci](obsah/pr7_ptaci_savci.html) |
| `IMG-pr-17` | B | 8 karet postupu (kontrola bezpečí, oslovení a zatřesení, záklon hlavy a kontrola dechu, volání 155, stlačování hrudníku — poloha rukou, zotavovací poloha, zástava krvácení tlakem, chlazení popáleniny) — věcné, bez krve; nechat zkontrolovat zdravotníkem | [pr8_prvni_pomoc](obsah/pr8_prvni_pomoc.html) |
| `IMG-inf-04` | A | pracovní stůl s počítačem (monitor, klávesnice, myš, reproduktory, mikrofon, webkamera, tiskárna, skener, flash disk, sluchátka) — hotspoty zařízení | [inf4_hardware](obsah/inf4_hardware.html) |
| `IMG-inf-06` | A | „fotka z telefonu“: školák na ulici před domem, na mikině logo fiktivní školy, v pozadí čitelné číslo domu a název ulice (fiktivní), jízdní řád zastávky — hotspoty prozrazujících detailů | [inf6_digitalni_stopa](obsah/inf6_digitalni_stopa.html) |

### Střední priorita 🟠

| ID | Styl | Co vyrobit nebo sehnat | Stránka |
|---|---|---|---|
| `IMG-aj-01` | B | 8 karet „poloha úst a jazyka“ pro hlásky th (neznělé a znělé), w, æ, ə, ü, ö, francouzské nosovky — boční řez hlavou, zjednodušeně, bez textu | [vyslovnost](obsah/vyslovnost.html) |
| `IMG-cj-03` | B | dvojice karet slov, která znějí stejně: být/bít, mýt/mít, výr/vír, vít (věnec)/výt (vlk), případně další s jednoznačně kreslitelným významem — rozlišení významu obrázkem | [doplnovacky](obsah/doplnovacky.html) |
| `IMG-cj-04` | B | ilustrace k vyjmenovaným slovům, 8 řad × 6–10 karet (například B: být, bydlet, obyvatel, byt, příbytek, nábytek, dobytek, kobyla, býk, Bydžov…) — pomůcka k zapamatování; u slov bez obrazu (bystrý, zbytek) vynechat | [vyjmenovana_slova](obsah/vyjmenovana_slova.html) |
| `IMG-cj-05` | A | 4 scénky dětí (u stolu, na hřišti, ve třídě, v obchodě), každá s prázdným místem pro bublinu — situace ke čtyřem druhům vět | [cj2_druhy_vet](obsah/cj2_druhy_vet.html) |
| `IMG-cj-06` | B | karty osob: dítě ukazuje na sebe, dítě ukazuje na druhého, skupinka dětí, dvojice, ukazování „ty/vy“ — vizualizace mluvnických osob | [cj3_slovesa](obsah/cj3_slovesa.html) |
| `IMG-cj-07` | B | 8 trojic karet pro mnohoznačná slova a homonyma (koruna, kohoutek, oko, list, pero, zámek, jazyk, kolej) — význam podle obrázku | [cj6_slovni_zasoba](obsah/cj6_slovni_zasoba.html) |
| `IMG-cj-08` | E | sken rukopisu Hospodine, pomiluj ny, strana Bible kralické, titulní list Jungmannova slovníku — ukázky vývoje písma a pravopisu | [cj9_vyvoj_jazyka](obsah/cj9_vyvoj_jazyka.html) |
| `IMG-cj-09` | A | 10 jednoduchých scén k větám pro první čtení (Máma má mísu. Ema mele maso. Pes leží u domu…) — obrázek ke kontrole porozumění | [slabiky](obsah/slabiky.html) |
| `IMG-cj-11` | E | antické zobrazení 8–10 řeckých bohů a hrdinů (vázy, sochy; Wikimedia Commons) — skutečné atributy bohů, ne vymyšlené | [cj6_baje](obsah/cj6_baje.html) |
| `IMG-cj-14` | E | 8 reprodukcí volných děl výtvarného umění ke směrům (romantismus, realismus, impresionismus, symbolismus, kubismus, surrealismus…) — vizuální znak směru | [literarni_smery](obsah/literarni_smery.html) |
| `IMG-m-08` | C | fotografie 8 referenčních předmětů s přibližnou velikostí a hmotností (kancelářská sponka, jablko, litrová láhev, dveře, balení mouky 1 kg, lžička, kostka cukru, fotbalové hřiště z výšky) — odhad jednotek | [prevody_jednotek](obsah/prevody_jednotek.html) |
| `IMG-m-09` | C | 12 fotografií předmětů tvaru těles (kostka cukru, krabice mléka, plechovka, míč, kornout, pyramida, stan, toblerone, válcová pastelka…) — poznávání těles v okolí | [geo_tvary](obsah/geo_tvary.html) |
| `IMG-aj-03` | A | 4 scénky setkání dvou dětí (ráno před školou, odpoledne v parku, večer u domu, loučení před spaním) — kontext pozdravů | [aj3_pozdravy](obsah/aj3_pozdravy.html) |
| `IMG-aj-04` | A | 8 scén běžného dne jednoho školáka (vstává, snídá, jede do školy, hraje fotbal, dělá úkoly, dívá se na TV, čte, spí) — obrázkový denní režim; použít i v `aj5_pritomny_prubehovy` | [aj4_pritomny_prosty](obsah/aj4_pritomny_prosty.html) |
| `IMG-aj-05` | B | pokoj s krabicí, stolem, židlí a postelí + samostatná karta kočky (průhledné pozadí) — kočka se přetahuje na různá místa | [aj4_predlozky](obsah/aj4_predlozky.html) |
| `IMG-aj-07` | B | 8 cedulí bez textu (zákaz koupání, zákaz psů, zákaz telefonu, povinná přilba, zákaz jízdy na kole, ticho v knihovně, povinnost mýt ruce, zákaz krmení zvířat) — piktogramy v jednotném stylu | [aj5_modalni](obsah/aj5_modalni.html) |
| `IMG-aj-08` | A | 6 obrázků příběhu „Výlet k moři“ (balení, vlak, pláž, déšť, kavárna, návrat) — vyprávění v minulém čase | [aj6_minuly_cas](obsah/aj6_minuly_cas.html) |
| `IMG-aj-09` | B | 5 trojic ke srovnání (tři psi různé velikosti, tři auta, tři domy, tři hory, tři dorty) — stejný styl, na kartě jeden objekt | [aj6_stupnovani](obsah/aj6_stupnovani.html) |
| `IMG-aj-11` | B | 12 karet nádob a porcí (láhev, bochník, kus, sklenice, balíček, plechovka, miska, šálek, kostka, plátek, pytel, krabice) — míry nepočitatelných věcí | [aj7_pocitatelnost](obsah/aj7_pocitatelnost.html) |
| `IMG-prv-02` | A | řez rodinným domem (kuchyň, obývák, koupelna, dětský pokoj, ložnice, předsíň) bez lidí — hotspoty místností | [prv1_rodina](obsah/prv1_rodina.html) |
| `IMG-prv-04` | B | 8 karet dopravních značek a situací (přechod, semafor červená/zelená, dítě za autem, reflexní prvky, cyklista s přilbou) — piktogramy bez textu | [prv1_cesta_skola](obsah/prv1_cesta_skola.html) |
| `IMG-prv-05` | B | karty záchranných složek (sanitka, hasiči, policie) a 6 situací (odřené koleno, krvácení z nosu, popálení, bodnutí vosou, pád z kola, cizí člověk v bezvědomí) — bez krve a drastických detailů | [prv2_zdravi](obsah/prv2_zdravi.html) |
| `IMG-prv-06` | B | 30 karet potravin (sdílet s jídlem v `IMG-aj-02`, doplnit celozrnné pečivo, luštěniny, ořechy, sladkosti, slazené nápoje) — skládání talíře | [prv5_zdravy_styl](obsah/prv5_zdravy_styl.html) |
| `IMG-prv-08` | B | celá postava dítěte zepředu v neutrálním postoji — hotspoty částí těla | [prv1_smysly](obsah/prv1_smysly.html) |
| `IMG-prv-11` | B | 12 karet mláďat k domácím zvířatům (tele, sele, kůzle, jehně, hříbě, kuře…) — dvojice dospělec–mládě | [prv2_zvirata](obsah/prv2_zvirata.html) |
| `IMG-prv-12` | C | 16 fotografií přírodnin (kámen, krystal soli, semeno fazole, klíčící fazole, suchý list, zelený list, houba, mech, voda, oblak, šnek, mravenec, peří, kost, písek, jablko) | [prv3_ziva_neziva](obsah/prv3_ziva_neziva.html) |
| `IMG-prv-14` | A | řez půdou (tráva a kořeny, humus, podorniční vrstva, hornina, žížala, krtek) — hotspoty vrstev | [prv3_voda_vzduch](obsah/prv3_voda_vzduch.html) |
| `IMG-prv-19` | A | krajina s elektrárnami (vodní, větrná, solární pole, uhelná, jaderná, bioplynová stanice) propojená vedením k vesnici — hotspoty; sdílet s `f9_stridavy_proud` | [prv5_energie](obsah/prv5_energie.html) |
| `IMG-prv-21` | A | 2 rekonstrukce každodenního života (slovanské hradiště 9. století, Praha za Karla IV.) označené jako rekonstrukce — srovnání | [prv4_nejstarsi_dejiny](obsah/prv4_nejstarsi_dejiny.html) |
| `IMG-prv-24` | C | fotografie budov Poslanecké sněmovny, Senátu, Úřadu vlády, Pražského hradu, Ústavního soudu | [prv5_statni_symboly](obsah/prv5_statni_symboly.html) |
| `IMG-prv-25` | E | 8 dobových fotografií s volnou licencí (28. říjen 1918, Masaryk, mobilizace 1938, osvobození 1945, únor 1948, srpen 1968, listopad 1989 na Václavském náměstí, první svobodné volby) — sdílet s dějepisem 9. r. | [prv5_dejiny_20](obsah/prv5_dejiny_20.html) |
| `IMG-f-01` | B | 8 karet krychlí stejné velikosti z různých materiálů (dřevo, korek, led, hliník, železo, olovo, polystyren, sklo) — vzhled materiálu pro laboratoř | [f6_hustota](obsah/f6_hustota.html) |
| `IMG-f-02` | C | 10 fotografií měřidel (pravítko, svinovací metr, posuvné měřidlo, kuchyňská váha, digitální váha, odměrný válec, teploměr lihový a digitální, stopky, siloměr) — poznávání měřidel | [f6_mereni](obsah/f6_mereni.html) |
| `IMG-f-04` | C | 12 fotografií jednoduchých strojů v praxi (houpačka, nůžky, kleště, otvírák, kolečko, louskáček, pinzeta, stavební jeřáb s kladkostrojem, studna s rumpálem, převody jízdního kola, hodinový strojek, klika) — spojení modelu se světem | [paka](obsah/paka.html) |
| `IMG-f-10` | B | karty součástek realisticky (plochá baterie, žárovka v objímce, spínač, rezistor, ampérmetr, voltmetr, pojistka, cívka, kompas) — propojení se schématickými značkami | [elektrina](obsah/elektrina.html) |
| `IMG-f-12` | C | 6 fotografií optických jevů (lžíce „zlomená“ ve sklenici vody, duha, hranol s barevným spektrem, obraz v lžíci, lupa, odraz v klidném jezeře) | [optika](obsah/optika.html) |
| `IMG-f-13` | C | fotografie 7 přístrojů (lupa, diaprojektor, Keplerův refraktor, divadelní kukátko, Cassegrainův teleskop, triedr, školní mikroskop) | [optika_soustava](obsah/optika_soustava.html) |
| `IMG-ch-01` | A | školní laboratoř se 6–8 nebezpečnými situacemi (jídlo na stole, chybějící brýle, rozpuštěné vlasy u kahanu, láhev bez víčka, pipetování ústy, rozlitá kapalina) — hotspoty „najdi chybu“ | [ch8_bezpecnost](obsah/ch8_bezpecnost.html) |
| `IMG-ch-02` | C | fotografie 6 skutečných domácích výrobků s piktogramy (čistič odpadů, odstraňovač rzi, lak, plynová kartuše, hnojivo, líh) — piktogram v praxi; značky výrobců rozmazat | [ch8_bezpecnost](obsah/ch8_bezpecnost.html) |
| `IMG-ch-03` | C | fotografie vzorků asi 40 běžných prvků (Wikimedia Commons „Periodic table of elements“ fotografie s licencí CC BY) — detail prvku | [periodic_table](obsah/periodic_table.html) |
| `IMG-ch-04` | A | řez úpravnou pitné vody (odběr z nádrže, česle, čiření, usazovací nádrž, pískový filtr, dezinfekce, vodojem) — hotspoty kroků | [ch8_voda_vzduch](obsah/ch8_voda_vzduch.html) |
| `IMG-ch-09` | C | řada 8 zkumavek s výluhem červeného zelí v roztocích od pH 1 po 13, fotografie pH papírku se stupnicí — skutečné barvy indikátorů | [ch9_ph](obsah/ch9_ph.html) |
| `IMG-pr-02` | A | řez houbou (klobouk, rourky/lupeny, prsten, třeň, pochva, podhoubí v půdě) v botanickém stylu rostliny — hotspoty | [pr6_houby](obsah/pr6_houby.html) |
| `IMG-pr-04` | B | 6 karet stavby těla v botanickém stylu (nezmar, ploštěnka, škrkavka, hlemýžď v řezu, žížala s články, škeble) — srovnávací tabule s hotspoty | [pr6_bezobratli](obsah/pr6_bezobratli.html) |
| `IMG-pr-06` | C | mikrofotografie pokožky cibule, buněk ústní sliznice, listu mechu (chloroplasty), prvoka trepky — protějšek modelu | [bunka](obsah/bunka.html) |
| `IMG-pr-08` | B | proměna dokonalá (babočka: vajíčko, housenka, kukla, motýl) a nedokonalá (kobylka: vajíčko, nymfa, dospělec) — 7 karet | [pr6_clenovci](obsah/pr6_clenovci.html) |
| `IMG-pr-09` | B | 5 schematických karet v jednotném stylu (bakterie s bičíkem, virus s obalem, trepka, měňavka, kvasinka) — ne mikrofotografie, ale čitelný model | [pr6_mikroorganismy](obsah/pr6_mikroorganismy.html) |
| `IMG-pr-10` | C | fotografie 12 zástupců skupin (mech ploník, kapraď samec, přeslička, plavuň, smrk, borovice, tis, pryskyřník, hrách, pampeliška, pšenice, tulipán) — systém rostlin | [pr7_rostliny](obsah/pr7_rostliny.html) |
| `IMG-pr-11` | B | 3 karty stavby těla (kapr, skokan hnědý, ještěrka obecná) ze stejného úhlu — hotspoty | [pr7_obratlovci_studenokrevni](obsah/pr7_obratlovci_studenokrevni.html) |
| `IMG-pr-12` | B | vývoj žáby v 5 krocích (vajíčka, pulec, pulec s nohama, žabka, dospělá žába) | [pr7_obratlovci_studenokrevni](obsah/pr7_obratlovci_studenokrevni.html) |
| `IMG-pr-14` | B | 6 karet chrupu savců (šelma, hlodavec, přežvýkavec, hmyzožravec, všežravec, zajíc) — lebky z boku | [pr7_ptaci_savci](obsah/pr7_ptaci_savci.html) |
| `IMG-pr-15` | B | 8 karet etap života (novorozenec, batole, předškolák, školák, dospívající, dospělý, starší dospělý, senior) jako jedna rodina — řada etap | [pr8_rozmnozovani](obsah/pr8_rozmnozovani.html) |
| `IMG-pr-16` | A | schématické řezy mužskou a ženskou rozmnožovací soustavou ve stylu atlasu anatomie, bez textu — hotspoty; zadání stejné techniky jako `organy-atlas` | [pr8_rozmnozovani](obsah/pr8_rozmnozovani.html) |
| `IMG-pr-18` | A | 3 řezy deskovými rozhraními (středooceánský hřbet, subdukce s vulkanickým obloukem, transformní zlom) ve stejném stylu a měřítku — podklad animací | [pr9_geologicke_deje](obsah/pr9_geologicke_deje.html) |
| `IMG-pr-20` | C | fotografie Mohsovy stupnice (10 minerálů) a vrypů na porcelánové destičce (hematit, pyrit, malachit) | [pr9_mineraly](obsah/pr9_mineraly.html) |
| `IMG-pr-21` | C | fotografie 8 zkamenělin (trilobit, amonit, belemnit, přeslička z karbonu, zub žraloka, otisk kapradiny, jantar s hmyzem, archeopteryx — odlitek) | [pr9_vyvoj_zeme](obsah/pr9_vyvoj_zeme.html) |
| `IMG-z-01` | C | fotografie 8 meteorologických jevů (kupovitá oblaka, bouřkový oblak, mlha, jinovatka, kroupy, duha, halo, inverze v údolí) | [z6_atmosfera](obsah/z6_atmosfera.html) |
| `IMG-z-03` | A | řeka od pramene po ústí v jedné panoramatické scéně (pramen v horách, peřeje, údolí, meandry, delta, moře) — hotspoty pojmů | [z6_hydrosfera](obsah/z6_hydrosfera.html) |
| `IMG-z-04` | C | 4 výřezy map stejného území v různých měřítkách a typech (OpenStreetMap, turistická mapa s licencí, ortofoto) — srovnání druhů map | [z6_mapa_souradnice](obsah/z6_mapa_souradnice.html) |
| `IMG-z-05` | C | fotografie 8 tvarů povrchu (údolí V, ledovcové údolí U, kaňon, sopka, vrásy ve skále, písečné duny, meandry, útesy) — poznávání tvarů | [z6_litosfera](obsah/z6_litosfera.html) |
| `IMG-z-07` | A | panoramatický řez Afrikou sever–jih (pobřeží, poušť, polopoušť, savana, tropický deštný les) — hotspoty pásů | [z7_afrika](obsah/z7_afrika.html) |
| `IMG-z-09` | A | řez Jižní Amerikou západ–východ (pobřežní poušť Atacama, Andy, Amazonský prales, pobřeží Atlantiku) — hotspoty | [z7_amerika](obsah/z7_amerika.html) |
| `IMG-z-11` | A | dvojice scén stejné indické vesnice v období sucha a monzunových dešťů — dopad monzunu | [z7_asie](obsah/z7_asie.html) |
| `IMG-z-18` | C | 3 dvojice fotografií „tehdy a dnes“ se stejným záběrem (ústup alpského ledovce, Aralské jezero ze satelitu, odlesňování v Amazonii ze satelitu) — NASA/ESA, volná díla | [z9_globalni_problemy](obsah/z9_globalni_problemy.html) |
| `IMG-d-01` | E | fotografie Parthenónu, tří řádů sloupů (dórský, iónský, korintský), černofigurové a červenofigurové vázy, olympijského stadionu v Olympii | [d6_recko](obsah/d6_recko.html) |
| `IMG-d-03` | E | fotografie Kolosea, Pont du Gard, římské silnice, Pompejí, římské mince, nápisu na oblouku | [d6_rim](obsah/d6_rim.html) |
| `IMG-d-05` | E | fotografie stély Chammurapiho zákoníku, klínopisné destičky, Rosettské desky, pyramid v Gíze, zikkuratu v Uru, papyru s hieroglyfy | [d6_stary_orient](obsah/d6_stary_orient.html) |
| `IMG-d-06` | E | fotografie 8 pramenů různých typů (pravěký nástroj, římská mince, středověká listina s pečetí, kronika, dobová fotografie, noviny z roku 1918, plakát, pohlednice) — třídění pramenů | [d6_prameny](obsah/d6_prameny.html) |
| `IMG-d-07` | A | rekonstrukce dvou sídlišť: lovci a sběrači (starší doba kamenná) a první zemědělci (mladší doba kamenná, dlouhé domy) — označit | [d6_pravek](obsah/d6_pravek.html) |
| `IMG-d-08` | E | fotografie nálezů (pěstní klín, Věstonická venuše, keramika s lineární výzdobou, bronzový meč, keltská mince) | [d6_pravek](obsah/d6_pravek.html) |
| `IMG-d-10` | E | fotografie velkomoravských nálezů (gombíky, náušnice, základy kostela v Mikulčicích), hlaholice | [d7_rany_stredovek](obsah/d7_rany_stredovek.html) |
| `IMG-d-12` | E | Jenský kodex (Hus na hranici, husité), Betlémská kaple, vozová hradba z dobové iluminace | [d7_husitstvi](obsah/d7_husitstvi.html) |
| `IMG-d-13` | E | fotografie Karlova mostu, Karlštejna, katedrály sv. Víta, Karolina, votivního obrazu Jana Očka (portrét Karla IV.) | [d7_lucemburkove](obsah/d7_lucemburkove.html) |
| `IMG-d-14` | E | Zlatá bula sicilská, svatováclavská přilba, Kosmova kronika (iluminace), rotunda sv. Kateřiny ve Znojmě | [d7_premyslovci](obsah/d7_premyslovci.html) |
| `IMG-d-15` | E | reprodukce (Leonardo — Mona Lisa, Vitruviánský muž; Michelangelo — David; Botticelli — Zrození Venuše), renesanční zámek Litomyšl, dobová mapa světa (Waldseemüller) | [d8_objevy_renesance](obsah/d8_objevy_renesance.html) |
| `IMG-d-16` | E | dobové obrazy a fotografie (Wattův parní stroj, tovární haly, první lokomotiva, Národní divadlo, portréty Jungmanna a Palackého) | [d8_prumyslova_revoluce](obsah/d8_prumyslova_revoluce.html) |
| `IMG-d-17` | E | portréty Marie Terezie a Josefa II., Deklarace práv člověka a občana (dobový tisk), dobytí Bastily (dobový obraz) | [d8_osvicenstvi](obsah/d8_osvicenstvi.html) |
| `IMG-d-18` | E | Lutherovy teze (dobový tisk), defenestrace 1618 (dobová rytina), Staroměstská exekuce (dobový leták), portrét Komenského | [d8_reformace](obsah/d8_reformace.html) |
| `IMG-d-20` | E | dobové fotografie (zákopy, legionáři, fronta v Itálii, fronty na chléb v zázemí), válečná pohlednice | [d9_prvni_valka](obsah/d9_prvni_valka.html) |
| `IMG-d-21` | E | dobové fotografie (28. říjen 1918 v Praze, T. G. Masaryk, Baťovy závody, mobilizace 1938), plakát | [d9_csr](obsah/d9_csr.html) |
| `IMG-d-22` | E | pečlivě vybrané dobové fotografie (Praha 15. 3. 1939, parašutisté operace Anthropoid, Lidice před a po, Terezín) a dětské kresby z Terezína (s licencí Židovského muzea) — **žádné generované obrazy** | [d9_druha_valka](obsah/d9_druha_valka.html) |
| `IMG-d-23` | E | dobové fotografie (únor 1948, srpen 1968, Berlínská zeď, Václavské náměstí v listopadu 1989), prohlášení Charty 77 — sdílet s `IMG-prv-25` | [d9_studena_valka](obsah/d9_studena_valka.html) |
| `IMG-inf-01` | B | postavička robota (4 natočení: nahoru, dolů, vlevo, vpravo), cíl (vlajka), překážky (kámen, strom, voda), sbíraný předmět (klíč, jablko) — sada dlaždic pro 🧩 robot, společná pro 4 lekce | [inf4_sekvence](obsah/inf4_sekvence.html) |
| `IMG-inf-02` | B | karty prvků sítě v jednotném stylu (notebook, telefon, Wi-Fi router, přepínač, serverovna, optický kabel, vysílač mobilní sítě, datové centrum) — uzly animace | [inf7_site](obsah/inf7_site.html) |
| `IMG-inf-05` | B | rozložená počítačová skříň (základní deska, procesor, paměť RAM, disk, zdroj, grafická karta) — hotspoty součástí | [inf4_hardware](obsah/inf4_hardware.html) |

### Doplňky ⚪

| ID | Styl | Co vyrobit nebo sehnat | Stránka |
|---|---|---|---|
| `IMG-00-02` | B | sada 11 ilustrací předmětů (kniha a pero, geometrické těleso a pravítko, glóbus, baňka, list s buňkou, lupa nad mapou, hrad, notebook, anglický a německý slovník, domek se stromem, atom) ve stejném stylu — dlaždice předmětů na přehledu a v osnově | [prehled](obsah/prehled.html) |
| `IMG-cj-02` | B | dva domečky: tvrdý (kamenný, hranatý) a měkký (dřevěný s polštáři) — pozadí pomůcky | [cj2_tvrde_mekke](obsah/cj2_tvrde_mekke.html) |
| `IMG-cj-10` | A | jedna ilustrace ke každému textu 1. stupně (odhadem 10–15) — motivace a kontext, bez prozrazení odpovědí | [cteni_s_porozumenim](obsah/cteni_s_porozumenim.html) |
| `IMG-cj-12` | A | 4 malé vinety žánrů (pohádkový zámek, skutečný hrad s pověstí, Olymp, liška s havranem) — záhlaví rámečků žánrů | [cj6_baje](obsah/cj6_baje.html) |
| `IMG-cj-13` | E | portréty 10–12 autorů (Čapek, Seifert, Hrabal, Škvorecký, Kundera, Havel…) z volných zdrojů, obálky samizdatových edic (Edice Petlice) — karty autorů | [cj9_literatura_20](obsah/cj9_literatura_20.html) |
| `IMG-cj-15` | A | jedna scéna (například cyklista na venkovské silnici) jako společné téma pro popis, vypravování a charakteristiku | [cj8_sloh](obsah/cj8_sloh.html) |
| `IMG-m-01` | B | 6 karet předmětů k rozdělování (jablko, bonbon, pastelka, míček, kartička, krabička) — v jednotném stylu místo emoji | [m3_deleni_zbytkem](obsah/m3_deleni_zbytkem.html) |
| `IMG-m-02` | B | 4 karty skutečných celků k dělení (pizza shora, tabulka čokolády, pás látky, skupina 12 dětí) — přenos zlomku do situace; dělicí čáry kreslí web | [m4_zlomky_uvod](obsah/m4_zlomky_uvod.html) |
| `IMG-m-03` | C | 4 fotografie římských číslic ve skutečnosti (ciferník věžních hodin, letopočet na průčelí, náhrobek, číslování kapitol) — čtení v kontextu | [roman_numerals](obsah/roman_numerals.html) |
| `IMG-m-04` | A | 6 scén ke slovním úlohám (obchod, výlet vlakem, zahrada, školní jídelna, sbírka, cyklovýlet) — kontext úlohy; čísla doplňuje web | [m5_slovni_ulohy](obsah/m5_slovni_ulohy.html) |
| `IMG-m-05` | B | 3 karty kontextů (teploměr venku v zimě, výtah se štítky pater −2 až 5 bez čísel, potápěč pod hladinou) — pozadí osy | [m7_cela_cisla](obsah/m7_cela_cisla.html) |
| `IMG-m-06` | B | 4 karty situací (cenovka se slevou bez čísel, výsledkový graf voleb bez popisků, etiketa potraviny, spořitelní kasička) — kontext úloh; čísla vkládá web | [procenta](obsah/procenta.html) |
| `IMG-m-07` | B | 6 karet denních činností (vstávání, snídaně, škola, oběd, kroužek, spaní) — denní režim k nastavení času | [clock_learning](obsah/clock_learning.html) |
| `IMG-m-10` | C | 8 fotografií souměrných a téměř souměrných objektů (motýl, list, průčelí zámku, obličej, sněhová vločka, dopravní značka, logo, most) — hledání os ve skutečnosti | [m4_soumernost](obsah/m4_soumernost.html) |
| `IMG-m-11` | A | 4 scény k úlohám (žebřík opřený o dům, drak na provázku, zkratka přes trávník, stožár s kotvicím lanem) — kontext; rozměry kreslí web | [m8_pythagoras](obsah/m8_pythagoras.html) |
| `IMG-m-12` | A | scéna „měření stínem“: strom a tyč na louce ve stejném slunci, dlouhé stíny — model pro úlohu; úsečky a čísla kreslí web | [m9_podobnost](obsah/m9_podobnost.html) |
| `IMG-aj-10` | A | 4 situace s viditelným důkazem (tmavé mraky, sklenice na kraji stolu, prázdná nádrž, dívka s lístky na koncert) — kontext going to | [aj7_budouci](obsah/aj7_budouci.html) |
| `IMG-prv-09` | B | 10 karet vjemů (zvonek, citron, růže, oheň, zmrzlina, tráva, kočka, duha, bubínek, polštář) — čím to poznám | [prv1_smysly](obsah/prv1_smysly.html) |
| `IMG-prv-18` | C | 8 fotografií využití (dlažba ze žuly, pískovcová socha, vápenka, uhelný lom, sklo z písku, sádra, tužka, solnička) | [prv4_horniny](obsah/prv4_horniny.html) |
| `IMG-prv-22` | E | 6 doložených vyobrazení (Karel IV. z Karlštejna, Svatováclavská koruna, Vyšehradský kodex, velkomoravský šperk…) — skutečné doklady | [prv4_nejstarsi_dejiny](obsah/prv4_nejstarsi_dejiny.html) |
| `IMG-f-03` | C | 12 fotografií předmětů k třídění látka × těleso (sklenice, sklo, lžíce, ocel, svíčka, vosk, cihla, jíl…) — dvojice těleso–látka | [f6_vlastnosti_latek](obsah/f6_vlastnosti_latek.html) |
| `IMG-f-05` | C | fotografie stojanové vrtačky a dílenského hydraulického lisu, hydraulického zvedáku auta — skutečné stroje | [vrtacka_lis](obsah/vrtacka_lis.html) |
| `IMG-f-06` | B | karty situací tlaku (sněžnice ve sněhu, jehla, housenkový pás, potápěč, přehrada s tlustou hrází dole) — kontext | [f7_tlak](obsah/f7_tlak.html) |
| `IMG-f-07` | C | fotografie proudového motoru v řezu (muzejní exponát) a dopravního letadla při startu | [proudove_motory](obsah/proudove_motory.html) |
| `IMG-f-08` | C | 4 fotografie proudění ve skutečnosti (kouřový tunel, sněhové závěje za plotem, vlajka ve větru, cyklista ve skrčené poloze) | [vitr_tunel](obsah/vitr_tunel.html) |
| `IMG-f-09` | B | karty situací Newtonových zákonů (bruslař na ledě, raketa, dva bruslaři se odstrkují, autobus brzdí a cestující se nakloní) — kontext zákonů | [f7_sila](obsah/f7_sila.html) |
| `IMG-f-11` | C | fotografie přílivu a odlivu na stejném místě (dvojice) — skutečný rozdíl hladin | [vodni_hladina](obsah/vodni_hladina.html) |
| `IMG-f-14` | C | fotografie JE Temelín a Dukovany (chladicí věže), palivového souboru (muzejní model) | [f9_jaderna](obsah/f9_jaderna.html) |
| `IMG-f-15` | B | 8 karet zdrojů zvuku pro decibelovou stupnici (list, šepot, rozhovor, třída, sekačka, motorka, koncert, letadlo) | [f9_zvuk](obsah/f9_zvuk.html) |
| `IMG-f-16` | C | fotografie rozvodny, stožárů vysokého napětí, transformátoru na sloupu, domovní pojistkové skříně | [f9_stridavy_proud](obsah/f9_stridavy_proud.html) |
| `IMG-f-17` | A | jemné obrysové kresby 12 souhvězdí (Velký vůz/Velká medvědice, Kasiopeja, Orion, Labuť, Lyra, Orel, Blíženci, Býk, Lev, Štír, Pegas, Malý vůz) na průhledném pozadí — volitelná vrstva nad mapou | [star_map](obsah/star_map.html) |
| `IMG-f-18` | C | fotografie 8 fází Měsíce ze stejného místa (volná licence) a fotografie meteoru — obrázková řada fází | [sky_events](obsah/sky_events.html) |
| `IMG-f-19` | C | fotografie ISS (NASA, volné dílo) a snímek Země z paluby — skutečný pohled | [iss](obsah/iss.html) |
| `IMG-ch-05` | C | fotografie skutečných aparatur (filtrace, destilace, odpařování, dělicí nálevka, chromatografie na papíře) jako protějšek animací | [ch8_smesi](obsah/ch8_smesi.html) |
| `IMG-ch-07` | C | fotografie koroze (rezavý hřebík, měděná střecha s patinou), pozinkovaného plechu, citronové baterie | [ch9_redoxni](obsah/ch9_redoxni.html) |
| `IMG-ch-08` | A | řez frakční destilační kolonou s patry — podklad hotspotů (popisky frakcí kreslí web) | [ch9_uhlovodiky](obsah/ch9_uhlovodiky.html) |
| `IMG-ch-10` | B | 8 karet běžných výrobků s deriváty (láhev octa, dezinfekce, odlakovač, aspirin, parfém, nemrznoucí směs, PET láhev, mýdlo) bez značek | [ch9_derivaty](obsah/ch9_derivaty.html) |
| `IMG-pr-03` | C | fotografie 4 typů lišejníků (terčovník, provazovka, dutohlávka, mapovník) | [pr6_houby](obsah/pr6_houby.html) |
| `IMG-pr-19` | C | fotografie 6 geologických jevů v ČR (Pravčická brána, propast Macocha, Říp, Komorní hůrka, Adršpašské skály, meandry Lužnice) — vnitřní a vnější děje v krajině | [pr9_geologicke_deje](obsah/pr9_geologicke_deje.html) |
| `IMG-pr-22` | A | 4 rekonstrukce krajin (prvohorní moře, karbonský les, druhohorní krajina s dinosaury, čtvrtohorní tundra s mamuty) — označit jako rekonstrukce | [pr9_vyvoj_zeme](obsah/pr9_vyvoj_zeme.html) |
| `IMG-pr-23` | B | karty znaků pro křížení (žlutý/zelený hrách, hladký/svraštělý hrách, černé/hnědé morče, červený/bílý květ hrachu) — fenotypy | [punnett](obsah/punnett.html) |
| `IMG-z-02` | A | svislý řez atmosférou (troposféra s mraky a letadlem, stratosféra s ozonem a balonem, mezosféra s meteory, termosféra s polární září a ISS) — hotspoty vrstev | [z6_atmosfera](obsah/z6_atmosfera.html) |
| `IMG-z-06` | A | řez Zemí (kůra, plášť, vnější a vnitřní jádro) s výsekem — hotspoty vrstev | [z6_litosfera](obsah/z6_litosfera.html) |
| `IMG-z-08` | C | 4 fotografie míst (Káhira s Nilem, Sahara, savana v Tanzanii, Kapské Město) | [z7_afrika](obsah/z7_afrika.html) |
| `IMG-z-10` | C | 4 fotografie míst (Grand Canyon, New York, Machu Picchu, Amazonie) | [z7_amerika](obsah/z7_amerika.html) |
| `IMG-z-12` | C | 4 fotografie míst (Himálaj, rýžové terasy, Tokio, poušť Gobi) | [z7_asie](obsah/z7_asie.html) |
| `IMG-z-13` | C | fotografie (Uluru, Velký bariérový útes, korálový atol, Antarktida s tučňáky, klokan, ptakopysk) | [z7_australie_oceanie](obsah/z7_australie_oceanie.html) |
| `IMG-z-14` | C | 6 fotografií krajin ČR (Krkonoše, Šumava, Polabí, Českomoravská vrchovina, Beskydy, Pálava) | [z8_cr_prirodni](obsah/z8_cr_prirodni.html) |
| `IMG-z-15` | C | 6 fotografií typických krajin regionů (fjord, Středomoří, Alpy, nížina Nizozemska, ruská tajga, britské pobřeží) | [z8_evropa_regiony](obsah/z8_evropa_regiony.html) |
| `IMG-z-16` | B | 6 karet fází výrobku (důl, továrna, kontejnerová loď, sklad, obchod, skládka/recyklace) — zastávky na mapě | [z9_hospodarstvi_svet](obsah/z9_hospodarstvi_svet.html) |
| `IMG-z-17` | C | 4 fotografie sídel (vesnice v Sahelu, slum a mrakodrapy v Bombaji, předměstí USA, historické centrum evropského města) | [z9_obyvatelstvo](obsah/z9_obyvatelstvo.html) |
| `IMG-d-02` | A | rekonstrukce athénské agory se shromážděním (označit „rekonstrukce“) | [d6_recko](obsah/d6_recko.html) |
| `IMG-d-04` | A | rekonstrukce římského fóra (označit) | [d6_rim](obsah/d6_rim.html) |
| `IMG-d-09` | A | řez archeologickou sondou s vrstvami a nálezy — hotspoty | [d6_pravek](obsah/d6_pravek.html) |
| `IMG-d-11` | A | rekonstrukce hradiště (Mikulčice) — sdílet s `IMG-prv-21` | [d7_rany_stredovek](obsah/d7_rany_stredovek.html) |
| `IMG-d-19` | C | fotografie budov Evropského parlamentu (Štrasburk), Evropské komise (Brusel), Soudního dvora (Lucemburk) | [eu_instituce](obsah/eu_instituce.html) |
| `IMG-inf-03` | A | jedna fotografie podobného stylu (krajina) jako vzor pro ztrátovou kompresi — lze použít `ekologie-krajina-ilustrace` | [inf7_sifrovani](obsah/inf7_sifrovani.html) |
| `IMG-inf-07` | A | nahradit dnešní `Photo*.png` a `Cortana.png` jednotnými ilustracemi v A/B stylu (stejný počet slidů); stávající obrázky zkontrolovat z hlediska licence | [AI_prednaska](obsah/AI_prednaska.html) |
| `IMG-inf-08` | B | 20 karet jablek a 20 karet hrušek různých odrůd, barev a úhlů + 4 „zavádějící“ (zelené jablko podobné hrušce) — data pro mini-model třídění | [inf9_ai_etika](obsah/inf9_ai_etika.html) |
| `IMG-00-03` | B | dvě ruce na klávesnici ve výchozí poloze (prsty na ASDF a JKL) shora — ukázka správného držení | [typing_trainer](obsah/typing_trainer.html) |
| `IMG-00-04` | B | 12 odznaků v jednotném stylu (medailonky: první den, týden v řadě, 100 úloh, každý předmět…) — nahradit emoji | [edu_progress](obsah/edu_progress.html) |
| `IMG-00-05` | B | titulní strana a tiráž fiktivní knihy (autor, název, nakladatel, rok, ISBN, vydání) bez skutečných značek — hotspoty pro výuku citování; text kreslí web | [citation_generator](obsah/citation_generator.html) |


---

## Jak dokument udržovat

- Po dokončení změny na stránce upravit její kartu (Popis, Funkčnost) a do [etap](ETAPY_VYLEPSENI.md) zapsat, co se skutečně udělalo. Karta popisuje stav a cíl, etapy historii.
- Nový obrázek: uložit podle oddílu 4.2, v kartě u jeho ID doplnit „✅ hotovo“ a název souboru.
- Nová stránka: nejdřív zařadit do rodiny (oddíl 5) a teprve pak psát; když rodina existuje, přidat satelit místo nové samostatné lekce.
- Přílohu A lze kdykoli vygenerovat znovu z karet: každá položka má tvar ``- `IMG-xx-NN` priorita **styl** · popis — účel``.

