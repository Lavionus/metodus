# Obrázky kapitoly 7.1

Vytvořeno 22. 9. 2026 vestavěným nástrojem `image_gen` podle `PODKLAD_STRANEK.md`, oddílů 4 a 7.1. [Galerie](kapitola-7-1.html), [strojový seznam s alt texty](kapitola-7-1.json).

- `00/prehled-*.webp`: 11 motivů sady IMG-00-02 pro přehled a osnovu.
- `aj/vyslovnost-*.webp`: 8 artikulačních karet sady IMG-aj-01.
- WebP: 768 × 768 px, každý soubor nejvýše 60 000 B. Vedle jsou původní PNG ve vyšším rozlišení a přesná zadání `.prompt.txt`, u oprav včetně dodatečného zadání.
- Karty jsou bez vloženého textu; popisky patří do HTML. Slonovinový podklad `#faf6ec` zachovat v obou motivech. Originál baňky má průhledné pozadí; webová verze je složená na slonovinovém pozadí.

## Použití výslovnosti

Jde o zjednodušené ilustrační řezy. Th /θ/ a /ð/ mají podobnou polohu úst; znělost doplňte nahrávkou a vysvětlením vibrací hlasivek. Karty ü a ö představují dlouhé /yː/ a /øː/, nikoliv všechny varianty těchto písmen. Jedna karta nosovky představuje /ɑ̃/; pro ostatní francouzské nosové samohlásky se poloha jazyka a rtů liší. Ilustrace atomu je symbolem předmětu, nikoli modelem skutečných drah elektronů.

Fonetická klasifikace pro zadání ověřena podle [International Phonetic Association – interaktivní tabulka IPA](https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_TI/IPA_charts_TI.html). Tabulka nebyla kopírována do obrázků. Hotové ilustrace prošly vizuální kontrolou; nejde o odbornou fonetickou revizi.

## Zapojení do webu

- `prehled.html`: všech 11 motivů v dlaždicích odpovídajících skupin, zachované filtrování.
- `osnova.html`: obrázky u názvů předmětů a v detailu vybraného ročníku; zeměpisný detail používá lupu nad mapou.
- `vyslovnost.html`: všech osm karet s přepínáním, výkladem a otázkami; poslechová hra je nadále vypnutá.
- `aj3_abeceda.html`: rozbalovací obrazový průvodce pěti anglickými hláskami.
- `dcj7_vyslovnost.html`: rozbalovací průvodce ü, ö a nosovým /ɑ̃/.

Všech 19 ilustrací je generovaných, žádná není stažená z internetu. Původ každé položky je zaznamenán v JSON seznamu. Pro další obrázky platí požadavek: generované, nebo stažené s doloženou licencí umožňující volné šíření a se splněnými podmínkami této licence.
