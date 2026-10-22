/* ============================================================
   ikony.js – vlastní ikony Metodusu (22. 10. 2026).

   Akvarelové ikony ve stylu ilustrací webu (Codex CLI, archy v obsah/img/ikony/archy,
   rozřezané tools/ikony_rez.py) leží v obsah/img/ikony/<id>.webp, 128 × 128, průhledné.
   Id = název souboru stránky bez .html (cj4_pady), předmět „predmet-<id>“ (predmet-cj),
   další: prehled, osnova, predstaveni, nastaveni, priprava_hodiny, projektor, nove_okno, oblibene.

   MetodusIkony.img('cj4_pady' | 'obsah/cj4_pady.html' | polozka, { velikost: 20 }) → <img> nebo null
   MetodusIkony.nazev(prvek, polozka|soubor, 'nazev s emoji', { velikost }) – vloží ikonu a text;
     úvodní emoji názvu nahradí ikonou, když ikona existuje, jinak nechá emoji.
   Seznam IKONY je generovaný (tools/ikony_seznam.py) – chybějící ikona = emoji.
   ============================================================ */
(function () {
  'use strict';
  /* IKONY-ZACATEK (generuje tools/ikony_seznam.py) */
  const IKONY = [
    "AI_prednaska", "aj3_abeceda", "aj3_pozdravy", "aj4_mnozne_cislo", "aj4_predlozky", "aj4_pritomny_prosty",
    "aj5_modalni", "aj5_pritomny_prubehovy", "aj6_minuly_cas", "aj6_stupnovani", "aj7_budouci", "aj7_pocitatelnost",
    "aj8_predpritomny", "aj8_trpny_rod", "aj9_neprima_rec", "aj9_podminkove", "aj_slovesa", "aj_slovicka", "anatomie",
    "bunka", "casova_osa", "casovani_sloves", "ch8_atom", "ch8_bezpecnost", "ch8_smesi", "ch8_voda_vzduch",
    "ch9_derivaty", "ch9_ph", "ch9_prirodni_latky", "ch9_redoxni", "ch9_uhlovodiky", "ch9_zivotni_prostredi",
    "chem_nazvoslovi", "citation_generator", "cj1_pismena", "cj2_abeceda", "cj2_druhy_vet", "cj2_tvrde_mekke",
    "cj3_e_je", "cj3_parove", "cj3_podstatna", "cj3_slovesa", "cj4_pady", "cj4_prima_rec", "cj4_stavba_slova",
    "cj4_velka_pismena", "cj5_pridavna", "cj5_skladebni_dvojice", "cj5_zajmena_cislovky", "cj6_baje",
    "cj6_slovni_zasoba", "cj7_basnicke_prostredky", "cj7_neohebne", "cj7_rozvijejici", "cj7_slovotvorba",
    "cj8_prejata", "cj8_sloh", "cj8_souveti", "cj9_literatura_20", "cj9_prijimacky", "cj9_vyvoj_jazyka",
    "clock_learning", "cteni_s_porozumenim", "d6_prameny", "d6_pravek", "d6_recko", "d6_rim", "d6_stary_orient",
    "d7_husitstvi", "d7_lucemburkove", "d7_premyslovci", "d7_rany_stredovek", "d7_stredoveka_evropa", "d8_19_stoleti",
    "d8_objevy_renesance", "d8_osvicenstvi", "d8_prumyslova_revoluce", "d8_reformace", "d9_csr", "d9_druha_valka",
    "d9_prvni_valka", "d9_studena_valka", "dcj7_cleny", "dcj7_vyslovnost", "dcj8_casovani", "dcj8_cislovky_cas",
    "dcj9_minuly", "de_slovicka", "desetinna_cisla", "diktat_gen", "doplnovacky", "eduMaps", "eduSort",
    "edu_progress", "elektrina", "eu_instituce", "f6_hustota", "f6_mereni", "f6_vlastnosti_latek", "f7_pohyb",
    "f7_sila", "f7_tlak", "f8_naboj", "f8_prace_energie", "f8_sireni_tepla", "f8_teplo", "f9_jaderna",
    "f9_polovodice", "f9_stridavy_proud", "f9_zvuk", "flags_quiz", "flashcards", "fr_slovicka", "fraction_calc",
    "geo_tvary", "geometricke_konstrukce", "geometrie_vzorce", "grafy_funkci", "gravitacni_hriste",
    "gravitacni_hriste2", "historicke_mapy_odkazy", "hv_intervaly", "hv_rytmus", "inf4_data", "inf4_hardware",
    "inf4_sekvence", "inf5_cykly", "inf5_zdroje", "inf6_digitalni_stopa", "inf6_promenne", "inf6_tabulky",
    "inf7_funkce", "inf7_sifrovani", "inf7_site", "inf8_databaze", "inf8_licence", "inf9_ai_etika",
    "inf9_model_simulace", "iss", "knihovna_sad", "kombinatorika", "literarni_smery", "m1_porovnavani",
    "m2_geo_zaklady", "m3_deleni_zbytkem", "m4_obvod_obsah", "m4_pisemne_deleni", "m4_pisemne_operace",
    "m4_soumernost", "m4_zlomky_uvod", "m5_prumer", "m5_site_teles", "m5_slovni_ulohy", "m6_delitelnost",
    "m6_krychle_kvadr", "m6_trojuhelnik", "m6_uhly", "m7_cela_cisla", "m7_ctyruhelniky", "m7_pomer", "m7_shodnost",
    "m7_stredova_soumernost", "m7_umernost", "m7_zlomky_operace", "m8_kruh", "m8_pythagoras", "m8_statistika",
    "m8_valec", "m8_vyrazy", "m9_financni", "m9_jehlan_kuzel", "m9_lomene_vyrazy", "m9_podobnost", "m9_prijimacky",
    "m9_soustavy", "mental_math", "mocniny_odmocniny", "morse_code", "multiplication", "music_theory", "nastaveni",
    "notes_reading", "nove_okno", "oblibene", "optika", "optika_dalekohled", "optika_lekce", "optika_soustava",
    "osnova", "paka", "paka_lekce", "periodic_table", "physics_playground", "physics_ref", "planet_globe", "pocitani",
    "pohyb_vesmirem", "potravni_retezec", "pr6_bezobratli", "pr6_clenovci", "pr6_houby", "pr6_mikroorganismy",
    "pr7_obratlovci_studenokrevni", "pr7_ptaci_savci", "pr7_rostliny", "pr8_prvni_pomoc", "pr8_rozmnozovani",
    "pr9_ekologie", "pr9_geologicke_deje", "pr9_mineraly", "pr9_vyvoj_zeme", "pracovni_listy", "predmet-aj",
    "predmet-ch", "predmet-cj", "predmet-d", "predmet-dcj", "predmet-f", "predmet-hv", "predmet-inf", "predmet-m",
    "predmet-nastroje", "predmet-pr", "predmet-prv", "predmet-vo", "predmet-z", "predstaveni", "prehled",
    "prevody_jednotek", "prezentace", "priprava_hodiny", "procenta", "projektor", "proudove_motory",
    "prv1_cesta_skola", "prv1_rocni_obdobi", "prv1_rodina", "prv1_smysly", "prv2_zdravi", "prv2_zvirata", "prv3_obec",
    "prv3_voda_vzduch", "prv3_ziva_neziva", "prv4_ekosystemy", "prv4_horniny", "prv4_mapy_smery",
    "prv4_nejstarsi_dejiny", "prv5_dejiny_20", "prv5_energie", "prv5_statni_symboly", "prv5_zdravy_styl", "punnett",
    "reading_log", "reky_pohori", "roman_numerals", "rovnice", "rybi_kost", "shoda_podmetu", "sky_events", "slabiky",
    "slepa_mapa", "slepa_mapa_evropa", "slovni_druhy", "solar_system", "star_map", "svetova_hlavni_mesta",
    "svetove_dejiny", "synonyma_antonyma", "trigonometrie", "typing_trainer", "ucitel", "vetny_rozbor", "vitr_lekce",
    "vitr_tunel", "vo6_obec_kraj_stat", "vo8_ustava_volby", "vodni_hladina", "vrtacka_lis", "vycislovani_rovnic",
    "vyjmenovana_slova", "z6_atmosfera", "z6_hydrosfera", "z6_litosfera", "z6_mapa_souradnice", "z6_planeta_zeme",
    "z7_afrika", "z7_amerika", "z7_asie", "z7_australie_oceanie", "z8_cr_hospodarstvi", "z8_cr_prirodni",
    "z8_evropa_regiony", "z9_globalni_problemy", "z9_hospodarstvi_svet", "z9_obyvatelstvo", "zavity_lekce",
  ];
  /* IKONY-KONEC */
  const MAM = new Set(IKONY);
  const KOREN = new URL('.', document.currentScript ? document.currentScript.src : location.href);

  function id(co) {
    if (!co) return '';
    if (typeof co === 'object') co = co.soubor || co.id || '';
    return String(co).replace(/^.*\//, '').replace(/\.html(\?.*)?$/, '');
  }
  const ma = co => MAM.has(id(co));
  function url(co) { return ma(co) ? new URL('obsah/img/ikony/' + id(co) + '.webp', KOREN).href : null; }

  function img(co, volby) {
    const u = url(co);
    if (!u) return null;
    const v = (volby && volby.velikost) || 20;
    const i = document.createElement('img');
    i.src = u; i.width = v; i.height = v;
    i.alt = (volby && volby.alt) || '';          // dekorativní – název stojí vedle
    i.className = 'm-ikona' + (volby && volby.trida ? ' ' + volby.trida : '');
    i.decoding = 'async';
    if (!volby || !volby.hned) i.loading = 'lazy';
    i.draggable = false;
    return i;
  }

  // "🔢 Počítání" → { emoji: '🔢', text: 'Počítání' }
  function rozdel(nazev) {
    const m = String(nazev || '').match(/^(\P{L}+?)\s+(.*)$/u);
    return m && !/\p{N}/u.test(m[1]) ? { emoji: m[1].trim(), text: m[2] } : { emoji: '', text: String(nazev || '') };
  }

  function nazev(el, co, text, volby) {
    const { emoji, text: zbytek } = rozdel(text);
    const i = img(co, volby);
    el.textContent = '';
    if (i) { el.append(i, ' ' + zbytek); }
    else el.textContent = emoji ? emoji + ' ' + zbytek : zbytek;
    return el;
  }

  // styl: ikona sedí na řádku s textem
  const s = document.createElement('style');
  s.textContent = 'img.m-ikona{display:inline-block;vertical-align:-0.28em;object-fit:contain;flex-shrink:0;}';
  (document.head || document.documentElement).appendChild(s);

  window.MetodusIkony = { IKONY, ma, url, img, nazev, rozdel, id };
})();
