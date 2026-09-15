# Interaktivní atlas lidského těla

Vstupní stránka: `../anatomie.html`. Statická aplikace bez sestavení nebo
externích knihoven; funguje i přes `file://`. Vzhled sdílí `common.css`,
`theme.js` a `podpis.js` s ostatními stránkami Metodus.

## Dokončené etapy a aktuální obrázky

Všechny nové přírodopisné ilustrace ukládejte do **`obsah/Prirodopis`**.
Složka `Anatomy` obsahuje kód, data a dokumentaci atlasu.

| Téma / pohled | Struktur | Obrázek v `../Prirodopis/` |
| --- | ---: | --- |
| Vnitřní orgány zepředu | 10 | `organy-atlas-predek-v4.png` |
| Vnitřní orgány zezadu | 13 | `organy-atlas-zada-v3.png` |
| 1. Kostra | 14 | `anatomie-kostra.png` |
| 2. Svaly zepředu | 11 | `anatomie-svaly.png` |
| 2. Svaly zezadu | 11 | `anatomie-svaly_zadni.png` |
| 3. Smyslové orgány | 5 | `anatomie-smysly.png` |
| 4. Detail srdce | 14 | `anatomie-srdce-detail.png` |
| 5. Nervová soustava | 11 | `anatomie-nervova.png` |

Prompt nervové soustavy je v `../Prirodopis/anatomie-nervova-prompt.md`.

Starší verzované PNG zůstávají zachované, ale stránka je nepoužívá.
Zadní ilustraci svalů `anatomie-svaly_zadni.png` dodal uživatel; atlas ji používá beze změny.
Ostatní aktuální ilustrace vznikly vestavěným nástrojem **image_gen**, nikoli CLI.
Prompty posledních čtyř etap jsou v `../Prirodopis/anatomie-moduly-prompty.md`.
Prompty rozšíření zadního pohledu a ileocekálního spojení jsou
v `../Prirodopis/anatomie-streva-zada-prompty.md`.

## Struktura aplikace

- `atlas-data.js`: dva pohledy na vnitřní orgány, výklad a geometrie.
- `atlas-modules.js`: registr témat, další ilustrace včetně obou pohledů na svaly, jejich struktury
  a posloupnost průchodu krve srdcem.
- `atlas.js`: společný renderer, přepínání, výklad, zvýraznění a kvíz.
- `atlas.css`: lokální rozložení, responzivní vzhled a tisk.

`ANATOMY_TOPICS` určuje tlačítka témat; `ANATOMY_MODULES` jednotlivé pohledy.
Každý pohled má `id`, `topic`, `title`, `image`, `viewName`, `view` (`front` / `back`), `viewBox`,
`caption` a pole `organs`. Orgán/struktura obsahuje stabilní `id`, jméno,
latinský název, soustavu, výklad, `paths`, `anchor` a `label`.
Volitelný `shortName` zkracuje pouze popisek mapy; plný název zůstává
v seznamu a přístupném názvu. `labelWidth` řeší delší popisky.

`mirroredPaths` doplňuje párové útvary zrcadlením kolem x = 512.
Volitelné `mirrorX` mění transformační posun (osa zrcadlení je `mirrorX / 2`);
zadní svaly používají 1016, tedy osu x = 508.
Zrcadlení je určeno pro téměř symetrické ilustrace kostry a svalů;
pro asymetrické vnitřní orgány se používají samostatně trasované obrysy.
Každá ilustrace má souřadnice 1024 × 1536. Detail srdce má širší SVG
viewBox (-245 0 1515 1536), aby se popisky vešly mimo hlavní ilustraci;
samotný obrázek ani souřadnice obrysů se tím nemění.

Přidání dalšího tématu: nový záznam do registru témat a modulů se automaticky
promítne do nabídky. Další pohled přidejte do `ANATOMY_MODULES` se stejným `topic`
a příslušnou hodnotou `view`. Přepínač zepředu/zezadu se zobrazí automaticky
pro témata s oběma pohledy; volitelný `intro` upřesňuje úvod konkrétního pohledu.
Při změně tématu se sestaví nová mapa a seznam; rozpracovaný kvíz začne
znovu pro právě zvolené struktury. Každá struktura se v kole objeví jednou.
Sdílená ID zachovávají průběh prohlížení mezi pohledy na stejný orgán.

## Didaktická rozhodnutí

- Měchýř je v předním pohledu, před konečníkem. Jeho aktivní plocha
  nepřekrývá dolní část obrysu tlustého střeva.
- Přední ilustrace ukazuje napojení kyčelníku do slepého střeva.
- Zadní ilustrace je soustava průhledů: páteř zakrývá část srdce,
  ledviny zakrývají hlubší orgány, konečník je odkrytý okénkem v křížové kosti.
- Svaly a některé kosti jsou sdružené do školních přehledových skupin.
- Zadní svalový pohled rozlišuje svalová bříška a Achillovu šlachu.
  Z hlubších svalů vybírá pouze části odkryté ilustrací. Deltový sval
  sdílí ID s předním pohledem, takže si zachová stav prohlédnutí.
- Nervová soustava je schematický průhled zezadu. Nervové skupiny mají
  společné aktivní oblasti; výklad odlišuje centrální a obvodovou soustavu,
  konec míchy a koňský ohon. Nezobrazuje všechny autonomní nervy.
- Smyslové detaily nemají společné měřítko. Text opravuje mýtus o oddělených
  chuťových zónách jazyka a vysvětluje rovnovážné ústrojí vnitřního ucha.
- Srdce používá modrou jako didaktickou barvu krve chudší na kyslík,
  nikoli její skutečnou barvu. Aortální chlopeň má samostatný zvětšený
  detail, protože ji hlavní řez celou neodkrývá.
- Průchod krve má 12 volitelných kroků. Mezi plicními tepnami a žílami
  probíhá výměna plynů v plicích, což vysvětluje text nad kroky.

Odborné podklady jsou odkazované v patičce stránky (NIH/NHLBI, NIDDK,
NIDCD, NEI, NCBI a OpenStax). Jde o zjednodušené výukové ilustrace.

## Kompaktní rozložení

Stránka má maximální šířku 1060 px a obrázek bez zvětšení 440 px.
Zvětšení ponechává posun obrázku pro drobné struktury; na mobilu se atlas
přizpůsobuje dostupné šířce.

## Ověření

Chromium: všech osm pohledů, 127 zásahových bodů včetně druhé strany
párových kostí a svalů; každý bod otevřel správný detail. Kvízy dokončeny
s výsledky 10/10, 13/13, 14/14, 11/11, 5/5, 14/14, 11/11 a 11/11. Opakovaný klik
nezvyšuje skóre. Ověřeno 12 kroků průchodu krve, skrývání průvodce během
kvízu, rozměry popisků a mobilní šířka 390 px bez vodorovného přetékání.
Kontrola syntaxe JS (`node --check`); žádné výjimky JavaScriptu v prohlížeči.
