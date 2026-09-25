// Poznámka: obsah/vyslovnost.html je dočasně mimo katalog – stránka stojí na
// poslechu a web zatím nemá kvalitní hlas. Až bude, stačí položku vrátit sem.
// Katalog výukových aplikací Metodus – jediný zdroj pravdy pro menu, hledání,
// úvodní přehled i stránku Osnova.
//
// Položka: { soubor, nazev, tagy, predmet, rocniky, stav }
//   predmet – id z KATALOG_PREDMETY (nástroje bez vazby na předmět ho nemají)
//   rocniky – ročníky ZŠ, kterých se téma týká (filtr v menu)
//   stav    – 'plan' u připravovaných stránek; hotové aplikace pole nemají
//
// Kostra témat vychází z RVP ZV; rozdělení do ročníků odpovídá obvyklé praxi
// českých ŠVP (RVP samo stanovuje výstupy po obdobích, ne po ročnících).

const KATALOG_PREDMETY = [
  { id: 'cj',  label: 'Český jazyk',            emoji: '📖', rocniky: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { id: 'm',   label: 'Matematika',             emoji: '🔢', rocniky: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { id: 'aj',  label: 'Anglický jazyk',         emoji: '🇬🇧', rocniky: [3, 4, 5, 6, 7, 8, 9] },
  { id: 'dcj', label: 'Další cizí jazyk',       emoji: '🗣️', rocniky: [7, 8, 9] },
  { id: 'prv', label: 'Prvouka a vlastivěda',   emoji: '🏡', rocniky: [1, 2, 3, 4, 5] },
  { id: 'inf', label: 'Informatika',            emoji: '💻', rocniky: [4, 5, 6, 7, 8, 9] },
  { id: 'f',   label: 'Fyzika',                 emoji: '⚛️', rocniky: [6, 7, 8, 9] },
  { id: 'ch',  label: 'Chemie',                 emoji: '⚗️', rocniky: [8, 9] },
  { id: 'pr',  label: 'Přírodopis',             emoji: '🧬', rocniky: [6, 7, 8, 9] },
  { id: 'z',   label: 'Zeměpis',                emoji: '🌍', rocniky: [6, 7, 8, 9] },
  { id: 'd',   label: 'Dějepis',                emoji: '📜', rocniky: [6, 7, 8, 9] },
];

const KATALOG_SKUPINY = [
  { id: 'cestina',     label: '📖 Čeština' },
  { id: 'matematika',  label: '🔢 Matematika' },
  { id: 'jazyky',      label: '🗣️ Cizí jazyky' },
  { id: 'prvouka',     label: '🏡 Prvouka & vlastivěda' },
  { id: 'priroda',     label: '🔬 Přírodní vědy' },
  { id: 'spolecnost',  label: '🌍 Zeměpis & dějepis' },
  { id: 'informatika', label: '💻 Informatika' },
  { id: 'dalsi',       label: '🎓 Další výuka' },
];

const KATALOG_SEKCE = [
  {
    "nazev": "✍️ Pravopis",
    "skupina": "cestina",
    "polozky": [
      {
        "soubor": "obsah/cj1_pismena.html",
        "nazev": "🔤 Písmena a hlásky",
        "tagy": [
          "1. ročník",
          "čtení",
          "hláska",
          "písmeno",
          "sluchová analýza"
        ],
        "predmet": "cj",
        "rocniky": [
          1
        ]
      },
      {
        "soubor": "obsah/cj2_tvrde_mekke.html",
        "nazev": "✍️ Tvrdé a měkké souhlásky",
        "tagy": [
          "2. ročník",
          "i/y",
          "tvrdé souhlásky",
          "měkké souhlásky",
          "pravopis"
        ],
        "predmet": "cj",
        "rocniky": [
          2
        ]
      },
      {
        "soubor": "obsah/cj2_abeceda.html",
        "nazev": "🔤 Abeceda a řazení slov",
        "tagy": [
          "2. ročník",
          "abeceda",
          "řazení",
          "slovník"
        ],
        "predmet": "cj",
        "rocniky": [
          2,
          3
        ]
      },
      {
        "soubor": "obsah/doplnovacky.html",
        "nazev": "✍️ Doplňovačky i/y",
        "tagy": [
          "1. stupeň",
          "3. ročník",
          "4. ročník",
          "5. ročník",
          "pravopis",
          "diktát",
          "vyjmenovaná slova",
          "obojetné souhlásky",
          "příbuzná slova"
        ],
        "predmet": "cj",
        "rocniky": [
          3,
          4,
          5
        ]
      },
      {
        "soubor": "obsah/diktat_gen.html",
        "nazev": "✍️ Generátor diktátů",
        "tagy": [
          "diktát",
          "pravopis",
          "poslech",
          "vyjmenovaná slova",
          "velká písmena",
          "doplňování písmen",
          "přepis věty"
        ],
        "predmet": "cj",
        "rocniky": [
          3,
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/cj3_parove.html",
        "nazev": "✍️ Párové souhlásky",
        "tagy": [
          "3. ročník",
          "spodoba",
          "párové souhlásky",
          "pravopis",
          "b/p",
          "d/t",
          "z/s",
          "spodoba znělosti"
        ],
        "predmet": "cj",
        "rocniky": [
          3
        ]
      },
      {
        "soubor": "obsah/vyjmenovana_slova.html",
        "nazev": "✍️ Vyjmenovaná slova",
        "tagy": [
          "1. stupeň",
          "3. ročník",
          "pravopis",
          "i/y",
          "řady vyjmenovaných slov",
          "přehled"
        ],
        "predmet": "cj",
        "rocniky": [
          3,
          4,
          5
        ]
      },
      {
        "soubor": "obsah/shoda_podmetu.html",
        "nazev": "✏️ Shoda podmětu s přísudkem",
        "tagy": [
          "2. stupeň",
          "6. ročník",
          "7. ročník",
          "pravopis",
          "koncovky",
          "příčestí",
          "podmět",
          "rod podmětu",
          "-li -ly -la"
        ],
        "predmet": "cj",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/cj8_prejata.html",
        "nazev": "🌍 Přejatá slova",
        "tagy": [
          "8. ročník",
          "přejatá slova",
          "pravopis",
          "skloňování cizích slov",
          "s/z"
        ],
        "predmet": "cj",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/cj9_prijimacky.html",
        "nazev": "🎯 Příprava na přijímací zkoušky – ČJ",
        "tagy": [
          "9. ročník",
          "přijímací zkoušky",
          "cermat",
          "test",
          "opakování"
        ],
        "predmet": "cj",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🧩 Tvarosloví & skladba",
    "skupina": "cestina",
    "polozky": [
      {
        "soubor": "obsah/cj2_druhy_vet.html",
        "nazev": "❓ Druhy vět",
        "tagy": [
          "2. ročník",
          "věta oznamovací",
          "tázací",
          "rozkazovací",
          "přací",
          "interpunkce"
        ],
        "predmet": "cj",
        "rocniky": [
          2,
          3
        ]
      },
      {
        "soubor": "obsah/slovni_druhy.html",
        "nazev": "✏️ Slovní druhy",
        "tagy": [
          "1. stupeň",
          "2. stupeň",
          "mluvnice",
          "ohebné",
          "neohebné",
          "slovní druhy"
        ],
        "predmet": "cj",
        "rocniky": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "soubor": "obsah/cj3_slovesa.html",
        "nazev": "🏃 Slovesa – osoba, číslo, čas",
        "tagy": [
          "3. ročník",
          "slovesa",
          "osoba",
          "číslo",
          "čas",
          "časování"
        ],
        "predmet": "cj",
        "rocniky": [
          3,
          4
        ]
      },
      {
        "soubor": "obsah/cj3_podstatna.html",
        "nazev": "📗 Podstatná jména – rod a číslo",
        "tagy": [
          "3. ročník",
          "podstatná jména",
          "rod",
          "číslo",
          "mluvnické kategorie"
        ],
        "predmet": "cj",
        "rocniky": [
          3,
          4
        ]
      },
      {
        "soubor": "obsah/cj4_pady.html",
        "nazev": "📗 Pády a vzory podstatných jmen",
        "tagy": [
          "4. ročník",
          "5. ročník",
          "pády",
          "vzory",
          "skloňování",
          "pravopis koncovek"
        ],
        "predmet": "cj",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/synonyma_antonyma.html",
        "nazev": "🔁 Synonyma a antonyma",
        "tagy": [
          "slovní zásoba",
          "synonyma",
          "antonyma",
          "opozita"
        ],
        "predmet": "cj",
        "rocniky": [
          4,
          5,
          6,
          7
        ]
      },
      {
        "soubor": "obsah/cj4_stavba_slova.html",
        "nazev": "🧩 Stavba slova",
        "tagy": [
          "4. ročník",
          "kořen",
          "předpona",
          "přípona",
          "slova příbuzná"
        ],
        "predmet": "cj",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/cj5_pridavna.html",
        "nazev": "🎨 Přídavná jména",
        "tagy": [
          "5. ročník",
          "přídavná jména",
          "tvrdá",
          "měkká",
          "přivlastňovací",
          "vzory"
        ],
        "predmet": "cj",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/cj5_skladebni_dvojice.html",
        "nazev": "🔗 Základní skladební dvojice",
        "tagy": [
          "5. ročník",
          "podmět",
          "přísudek",
          "skladební dvojice",
          "věta"
        ],
        "predmet": "cj",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/cj5_zajmena_cislovky.html",
        "nazev": "🔢 Zájmena a číslovky",
        "tagy": [
          "5. ročník",
          "zájmena",
          "číslovky",
          "druhy",
          "skloňování"
        ],
        "predmet": "cj",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/vetny_rozbor.html",
        "nazev": "✏️ Rozbor věty – větné členy",
        "tagy": [
          "mluvnice",
          "podmět",
          "přísudek",
          "předmět",
          "přívlastek",
          "2. stupeň",
          "rozbor věty",
          "větné členy"
        ],
        "predmet": "cj",
        "rocniky": [
          6,
          7,
          8
        ]
      },
      {
        "soubor": "obsah/cj6_slovni_zasoba.html",
        "nazev": "📚 Slovní zásoba a význam slov",
        "tagy": [
          "6. ročník",
          "slovní zásoba",
          "význam slov",
          "homonyma",
          "mnohoznačnost"
        ],
        "predmet": "cj",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/cj7_rozvijejici.html",
        "nazev": "🔗 Rozvíjející větné členy",
        "tagy": [
          "7. ročník",
          "předmět",
          "přívlastek",
          "příslovečné určení",
          "větné členy"
        ],
        "predmet": "cj",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/cj7_neohebne.html",
        "nazev": "🔤 Neohebné slovní druhy",
        "tagy": [
          "7. ročník",
          "příslovce",
          "předložky",
          "spojky",
          "částice",
          "citoslovce"
        ],
        "predmet": "cj",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/cj7_slovotvorba.html",
        "nazev": "🧩 Slovotvorba",
        "tagy": [
          "7. ročník",
          "odvozování",
          "skládání",
          "zkracování",
          "slovotvorný základ"
        ],
        "predmet": "cj",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/cj8_souveti.html",
        "nazev": "🔗 Souvětí souřadné a podřadné",
        "tagy": [
          "8. ročník",
          "souvětí",
          "věta hlavní",
          "věta vedlejší",
          "poměry",
          "čárka"
        ],
        "predmet": "cj",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/cj9_vyvoj_jazyka.html",
        "nazev": "🗿 Útvary a vývoj českého jazyka",
        "tagy": [
          "9. ročník",
          "spisovný jazyk",
          "nářečí",
          "obecná čeština",
          "slang",
          "vývoj jazyka"
        ],
        "predmet": "cj",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "📚 Čtení & literatura",
    "skupina": "cestina",
    "polozky": [
      {
        "soubor": "obsah/slabiky.html",
        "nazev": "📖 Slabiky a první čtení",
        "tagy": [
          "1. stupeň",
          "1. ročník",
          "2. ročník",
          "čtení",
          "slabikování"
        ],
        "predmet": "cj",
        "rocniky": [
          1,
          2
        ]
      },
      {
        "soubor": "obsah/cteni_s_porozumenim.html",
        "nazev": "📖 Čtení s porozuměním",
        "tagy": [
          "čtení",
          "porozumění",
          "text",
          "otázky",
          "1. stupeň",
          "2. stupeň",
          "sš"
        ],
        "predmet": "cj",
        "rocniky": [
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/reading_log.html",
        "nazev": "📚 Čtenářský deník",
        "tagy": [
          "knihy",
          "četba",
          "hodnocení",
          "literatura"
        ],
        "predmet": "cj",
        "rocniky": [
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/cj6_baje.html",
        "nazev": "🐉 Mýty, báje a pohádky",
        "tagy": [
          "6. ročník",
          "literatura",
          "mýtus",
          "báje",
          "pohádka",
          "literární druhy"
        ],
        "predmet": "cj",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/cj9_literatura_20.html",
        "nazev": "📘 Literatura 20. století",
        "tagy": [
          "9. ročník",
          "literatura",
          "20. století",
          "směry",
          "autoři"
        ],
        "predmet": "cj",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/literarni_smery.html",
        "nazev": "📚 Literární směry a autoři",
        "tagy": [
          "střední škola",
          "sš",
          "maturita",
          "literatura",
          "sloh"
        ],
        "predmet": "cj",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "✒️ Sloh a komunikace",
    "skupina": "cestina",
    "polozky": [
      {
        "soubor": "obsah/cj4_prima_rec.html",
        "nazev": "💬 Přímá řeč",
        "tagy": [
          "4. ročník",
          "přímá řeč",
          "uvozovky",
          "interpunkce",
          "uvozovací věta"
        ],
        "predmet": "cj",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/cj8_sloh.html",
        "nazev": "✒️ Slohové útvary – výklad a úvaha",
        "tagy": [
          "8. ročník",
          "sloh",
          "výklad",
          "úvaha",
          "osnova",
          "kompozice"
        ],
        "predmet": "cj",
        "rocniky": [
          8,
          9
        ]
      }
    ]
  },
  {
    "nazev": "🔢 Čísla & početní operace",
    "skupina": "matematika",
    "polozky": [
      {
        "soubor": "obsah/m1_porovnavani.html",
        "nazev": "⚖️ Porovnávání a řady čísel",
        "tagy": [
          "1. ročník",
          "porovnávání",
          "číselná osa",
          "více",
          "méně"
        ],
        "predmet": "m",
        "rocniky": [
          1,
          2
        ]
      },
      {
        "soubor": "obsah/pocitani.html",
        "nazev": "🔢 Počítání do 20 a 100",
        "tagy": [
          "1. stupeň",
          "1. ročník",
          "2. ročník",
          "3. ročník",
          "sčítání",
          "odčítání"
        ],
        "predmet": "m",
        "rocniky": [
          1,
          2,
          3
        ]
      },
      {
        "soubor": "obsah/multiplication.html",
        "nazev": "✖️ Procvičování násobilky",
        "tagy": [
          "1. stupeň",
          "3. ročník",
          "násobení"
        ],
        "predmet": "m",
        "rocniky": [
          2,
          3,
          4
        ]
      },
      {
        "soubor": "obsah/m3_deleni_zbytkem.html",
        "nazev": "➗ Dělení se zbytkem",
        "tagy": [
          "3. ročník",
          "dělení",
          "zbytek",
          "násobilka"
        ],
        "predmet": "m",
        "rocniky": [
          3,
          4
        ]
      },
      {
        "soubor": "obsah/m4_pisemne_operace.html",
        "nazev": "✏️ Písemné sčítání, odčítání a násobení",
        "tagy": [
          "4. ročník",
          "písemné algoritmy",
          "sčítání",
          "odčítání",
          "násobení pod sebou"
        ],
        "predmet": "m",
        "rocniky": [
          4
        ]
      },
      {
        "soubor": "obsah/m4_pisemne_deleni.html",
        "nazev": "➗ Písemné dělení",
        "tagy": [
          "4. ročník",
          "5. ročník",
          "písemné dělení",
          "dělitel",
          "zbytek"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/m4_zlomky_uvod.html",
        "nazev": "🍕 Zlomky – části celku",
        "tagy": [
          "4. ročník",
          "zlomky",
          "část celku",
          "polovina",
          "čtvrtina",
          "názorně"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/roman_numerals.html",
        "nazev": "🏛️ Římské číslice",
        "tagy": [
          "číslice",
          "převod"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5,
          6
        ]
      },
      {
        "soubor": "obsah/mental_math.html",
        "nazev": "🧠 Mentální matematika",
        "tagy": [
          "počítání zpaměti",
          "trénink"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/desetinna_cisla.html",
        "nazev": "🔢 Desetinná čísla",
        "tagy": [
          "desetinná čísla",
          "sčítání",
          "porovnávání",
          "zaokrouhlování",
          "2. stupeň"
        ],
        "predmet": "m",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/m5_slovni_ulohy.html",
        "nazev": "🧠 Slovní úlohy a úsudek",
        "tagy": [
          "5. ročník",
          "slovní úlohy",
          "úsudek",
          "strategie řešení"
        ],
        "predmet": "m",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/fraction_calc.html",
        "nazev": "➗ Kalkulačka zlomků",
        "tagy": [
          "2. stupeň",
          "zlomky"
        ],
        "predmet": "m",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/m6_delitelnost.html",
        "nazev": "🔍 Dělitelnost, prvočísla, NSD a NSN",
        "tagy": [
          "6. ročník",
          "dělitelnost",
          "prvočísla",
          "nsd",
          "nsn",
          "rozklad"
        ],
        "predmet": "m",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/m7_pomer.html",
        "nazev": "⚖️ Poměr a měřítko",
        "tagy": [
          "7. ročník",
          "poměr",
          "měřítko mapy",
          "dělení v poměru",
          "postupný poměr"
        ],
        "predmet": "m",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/m7_cela_cisla.html",
        "nazev": "➖ Celá čísla",
        "tagy": [
          "7. ročník",
          "celá čísla",
          "záporná čísla",
          "absolutní hodnota",
          "číselná osa"
        ],
        "predmet": "m",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/m7_zlomky_operace.html",
        "nazev": "🍕 Počítání se zlomky",
        "tagy": [
          "7. ročník",
          "zlomky",
          "krácení",
          "společný jmenovatel",
          "sčítání zlomků"
        ],
        "predmet": "m",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/procenta.html",
        "nazev": "💯 Procenta a trojčlenka",
        "tagy": [
          "2. stupeň",
          "7. ročník",
          "8. ročník",
          "9. ročník",
          "úměra"
        ],
        "predmet": "m",
        "rocniky": [
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/mocniny_odmocniny.html",
        "nazev": "√ Mocniny a odmocniny",
        "tagy": [
          "mocniny",
          "odmocniny",
          "2. stupeň"
        ],
        "predmet": "m",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/m9_prijimacky.html",
        "nazev": "🎯 Příprava na přijímací zkoušky – M",
        "tagy": [
          "9. ročník",
          "přijímací zkoušky",
          "cermat",
          "test",
          "opakování"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "📏 Měření & jednotky",
    "skupina": "matematika",
    "polozky": [
      {
        "soubor": "obsah/clock_learning.html",
        "nazev": "🕐 Učení hodin",
        "tagy": [
          "1. stupeň",
          "2. ročník",
          "čas",
          "hodiny"
        ],
        "predmet": "m",
        "rocniky": [
          1,
          2,
          3
        ]
      },
      {
        "soubor": "obsah/prevody_jednotek.html",
        "nazev": "📏 Převody jednotek",
        "tagy": [
          "1. stupeň",
          "2. stupeň",
          "délka",
          "hmotnost",
          "objem",
          "čas",
          "jednotky",
          "USA",
          "palce",
          "galony"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5,
          6,
          7
        ]
      }
    ]
  },
  {
    "nazev": "📐 Geometrie",
    "skupina": "matematika",
    "polozky": [
      {
        "soubor": "obsah/geo_tvary.html",
        "nazev": "🔺 Geometrické tvary a tělesa",
        "tagy": [
          "1. stupeň",
          "2. stupeň",
          "geometrie",
          "útvary"
        ],
        "predmet": "m",
        "rocniky": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "soubor": "obsah/m2_geo_zaklady.html",
        "nazev": "📏 Bod, přímka, úsečka",
        "tagy": [
          "2. ročník",
          "geometrie",
          "bod",
          "přímka",
          "úsečka",
          "měření"
        ],
        "predmet": "m",
        "rocniky": [
          2,
          3
        ]
      },
      {
        "soubor": "obsah/m4_obvod_obsah.html",
        "nazev": "🟦 Obvod a obsah čtverce a obdélníku",
        "tagy": [
          "4. ročník",
          "obvod",
          "obsah",
          "čtverec",
          "obdélník",
          "čtvercová síť"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/m4_soumernost.html",
        "nazev": "🪞 Osová souměrnost",
        "tagy": [
          "4. ročník",
          "souměrnost",
          "osa souměrnosti",
          "zrcadlení"
        ],
        "predmet": "m",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/m5_site_teles.html",
        "nazev": "📦 Sítě těles",
        "tagy": [
          "5. ročník",
          "síť tělesa",
          "krychle",
          "kvádr",
          "prostorová představivost"
        ],
        "predmet": "m",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/geometricke_konstrukce.html",
        "nazev": "📏 Geometrické konstrukce kružítkem",
        "tagy": [
          "geometrie",
          "kružítko",
          "pravítko",
          "konstrukce",
          "těžnice",
          "kolmice",
          "tečna",
          "osa úhlu",
          "dynamická geometrie",
          "2. stupeň"
        ],
        "predmet": "m",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/geometrie_vzorce.html",
        "nazev": "📐 Obvody, obsahy, objemy",
        "tagy": [
          "2. stupeň",
          "6. ročník",
          "7. ročník",
          "8. ročník",
          "9. ročník",
          "geometrie",
          "vzorce"
        ],
        "predmet": "m",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/m6_uhly.html",
        "nazev": "📐 Úhel a jeho velikost",
        "tagy": [
          "6. ročník",
          "úhel",
          "úhloměr",
          "stupně",
          "osa úhlu",
          "druhy úhlů"
        ],
        "predmet": "m",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/m6_krychle_kvadr.html",
        "nazev": "📦 Krychle a kvádr – povrch a objem",
        "tagy": [
          "6. ročník",
          "povrch",
          "objem",
          "krychle",
          "kvádr",
          "jednotky objemu"
        ],
        "predmet": "m",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/m6_trojuhelnik.html",
        "nazev": "🔺 Trojúhelník – druhy a konstrukce",
        "tagy": [
          "6. ročník",
          "trojúhelník",
          "konstrukce",
          "sss",
          "sus",
          "usu",
          "trojúhelníková nerovnost"
        ],
        "predmet": "m",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/m7_shodnost.html",
        "nazev": "📐 Shodnost trojúhelníků",
        "tagy": [
          "7. ročník",
          "shodnost",
          "věty o shodnosti",
          "konstrukce"
        ],
        "predmet": "m",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/m7_ctyruhelniky.html",
        "nazev": "🔷 Čtyřúhelníky a hranoly",
        "tagy": [
          "7. ročník",
          "čtyřúhelník",
          "rovnoběžník",
          "lichoběžník",
          "hranol"
        ],
        "predmet": "m",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/m8_kruh.html",
        "nazev": "⭕ Kruh a kružnice",
        "tagy": [
          "8. ročník",
          "kruh",
          "kružnice",
          "obvod",
          "obsah",
          "pí",
          "tětiva"
        ],
        "predmet": "m",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/m8_pythagoras.html",
        "nazev": "📐 Pythagorova věta",
        "tagy": [
          "8. ročník",
          "pythagorova věta",
          "pravoúhlý trojúhelník",
          "přepona",
          "odvěsna"
        ],
        "predmet": "m",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/m8_valec.html",
        "nazev": "🥫 Válec",
        "tagy": [
          "8. ročník",
          "válec",
          "povrch",
          "objem",
          "rotační těleso"
        ],
        "predmet": "m",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/trigonometrie.html",
        "nazev": "📐 Trigonometrie pravoúhlého trojúhelníku",
        "tagy": [
          "trigonometrie",
          "sinus",
          "kosinus",
          "tangens",
          "sš"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/m9_podobnost.html",
        "nazev": "🔍 Podobnost",
        "tagy": [
          "9. ročník",
          "podobnost",
          "poměr podobnosti",
          "stejnolehlost",
          "věty o podobnosti",
          "uu",
          "sss",
          "sus",
          "zvětšení",
          "zmenšení",
          "měřítko",
          "plán",
          "mapa",
          "model",
          "měření stínem",
          "výška stromu",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/m9_jehlan_kuzel.html",
        "nazev": "🔻 Jehlan, kužel a koule",
        "tagy": [
          "9. ročník",
          "jehlan",
          "kužel",
          "koule",
          "povrch",
          "objem",
          "síť tělesa",
          "plášť",
          "kruhová výseč",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🧮 Algebra & funkce",
    "skupina": "matematika",
    "polozky": [
      {
        "soubor": "obsah/rovnice.html",
        "nazev": "🧮 Lineární rovnice",
        "tagy": [
          "2. stupeň",
          "8. ročník",
          "9. ročník",
          "neznámá",
          "algebra",
          "váhy",
          "rovnováha",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/m8_vyrazy.html",
        "nazev": "🧮 Výrazy a jejich úpravy",
        "tagy": [
          "8. ročník",
          "výrazy",
          "mnohočleny",
          "roznásobení",
          "vytýkání",
          "vzorce",
          "plošný model",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/grafy_funkci.html",
        "nazev": "📈 Grafy funkcí",
        "tagy": [
          "2. stupeň",
          "9. ročník",
          "střední škola",
          "sš",
          "funkce",
          "graf",
          "parabola",
          "nulové body",
          "odečítání z grafu",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/m9_lomene_vyrazy.html",
        "nazev": "🧮 Lomené výrazy",
        "tagy": [
          "9. ročník",
          "lomené výrazy",
          "podmínky",
          "krácení",
          "zlomky s proměnnou",
          "zakázaná hodnota",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/m9_soustavy.html",
        "nazev": "🧮 Soustavy rovnic",
        "tagy": [
          "9. ročník",
          "soustavy rovnic",
          "dosazovací metoda",
          "sčítací metoda",
          "grafické řešení",
          "průsečík přímek",
          "rovnoběžky",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "📊 Data, statistika & finance",
    "skupina": "matematika",
    "polozky": [
      {
        "soubor": "obsah/m5_prumer.html",
        "nazev": "📈 Aritmetický průměr",
        "tagy": [
          "5. ročník",
          "průměr",
          "statistika",
          "data",
          "vyrovnání",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/m7_umernost.html",
        "nazev": "📉 Přímá a nepřímá úměrnost",
        "tagy": [
          "7. ročník",
          "úměrnost",
          "trojčlenka",
          "graf úměrnosti",
          "konstanta úměrnosti",
          "hyperbola",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/m8_statistika.html",
        "nazev": "📊 Statistika – průměr, medián, modus",
        "tagy": [
          "8. ročník",
          "statistika",
          "medián",
          "modus",
          "četnost",
          "diagram",
          "odlehlá hodnota",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/kombinatorika.html",
        "nazev": "🎲 Kombinatorika a pravděpodobnost",
        "tagy": [
          "kombinatorika",
          "pravděpodobnost",
          "variace",
          "kombinace",
          "permutace",
          "sš",
          "simulace",
          "relativní četnost",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/m9_financni.html",
        "nazev": "💰 Finanční matematika",
        "tagy": [
          "9. ročník",
          "úrok",
          "půjčka",
          "spoření",
          "rozpočet",
          "finanční gramotnost",
          "složené úročení",
          "splátka",
          "interaktivní"
        ],
        "predmet": "m",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🗣️ Slovní zásoba",
    "skupina": "jazyky",
    "polozky": [
      {
        "soubor": "obsah/aj_slovicka.html",
        "nazev": "🇬🇧 Angličtina – první slovíčka",
        "tagy": [
          "angličtina",
          "english",
          "1. stupeň",
          "slovíčka",
          "obrázky",
          "začátečník"
        ],
        "predmet": "aj",
        "rocniky": [
          3,
          4,
          5
        ]
      },
      {
        "soubor": "obsah/aj3_pozdravy.html",
        "nazev": "👋 Pozdravy a představení",
        "tagy": [
          "3. ročník",
          "angličtina",
          "pozdravy",
          "představení",
          "konverzace"
        ],
        "predmet": "aj",
        "rocniky": [
          3
        ]
      },
      {
        "soubor": "obsah/aj_slovesa.html",
        "nazev": "🇬🇧 Anglická nepravidelná slovesa",
        "tagy": [
          "angličtina",
          "english",
          "2. stupeň",
          "sš",
          "irregular verbs",
          "slovesa"
        ],
        "predmet": "aj",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/de_slovicka.html",
        "nazev": "🇩🇪 Němčina – slovíčka",
        "tagy": [
          "němčina",
          "deutsch",
          "slovíčka",
          "členy",
          "der die das"
        ],
        "predmet": "dcj",
        "rocniky": [
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/fr_slovicka.html",
        "nazev": "🇫🇷 Francouzština – slovíčka",
        "tagy": [
          "francouzština",
          "français",
          "slovíčka",
          "členy",
          "le la les"
        ],
        "predmet": "dcj",
        "rocniky": [
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/dcj8_cislovky_cas.html",
        "nazev": "🕐 Číslovky a určování času",
        "tagy": [
          "8. ročník",
          "němčina",
          "francouzština",
          "číslovky",
          "hodiny",
          "datum"
        ],
        "predmet": "dcj",
        "rocniky": [
          8
        ]
      }
    ]
  },
  {
    "nazev": "🔤 Gramatika & výslovnost",
    "skupina": "jazyky",
    "polozky": [
      {
        "soubor": "obsah/aj3_abeceda.html",
        "nazev": "🔤 Abeceda a hláskování",
        "tagy": [
          "3. ročník",
          "angličtina",
          "abeceda",
          "spelling",
          "hláskování"
        ],
        "predmet": "aj",
        "rocniky": [
          3,
          4
        ]
      },
      {
        "soubor": "obsah/aj4_pritomny_prosty.html",
        "nazev": "⏰ Přítomný čas prostý",
        "tagy": [
          "4. ročník",
          "angličtina",
          "present simple",
          "koncovka -s",
          "do/does"
        ],
        "predmet": "aj",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/aj4_predlozky.html",
        "nazev": "📍 Předložky místa a času",
        "tagy": [
          "4. ročník",
          "angličtina",
          "předložky",
          "in/on/at",
          "místo",
          "čas"
        ],
        "predmet": "aj",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/aj4_mnozne_cislo.html",
        "nazev": "🔢 Množné číslo a členy",
        "tagy": [
          "4. ročník",
          "angličtina",
          "plural",
          "a/an/the",
          "členy"
        ],
        "predmet": "aj",
        "rocniky": [
          4
        ]
      },
      {
        "soubor": "obsah/casovani_sloves.html",
        "nazev": "🔤 Trenažér časování sloves",
        "tagy": [
          "gramatika",
          "slovesa",
          "časování",
          "angličtina",
          "němčina",
          "francouzština"
        ],
        "predmet": "aj",
        "rocniky": [
          4,
          5,
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/aj5_pritomny_prubehovy.html",
        "nazev": "🏃 Přítomný čas průběhový",
        "tagy": [
          "5. ročník",
          "angličtina",
          "present continuous",
          "ing",
          "právě teď"
        ],
        "predmet": "aj",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/aj5_modalni.html",
        "nazev": "🔑 Can, must – modální slovesa",
        "tagy": [
          "5. ročník",
          "angličtina",
          "can",
          "must",
          "modální slovesa",
          "povolení"
        ],
        "predmet": "aj",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/aj6_minuly_cas.html",
        "nazev": "⏪ Minulý čas prostý",
        "tagy": [
          "6. ročník",
          "angličtina",
          "past simple",
          "did",
          "pravidelná slovesa"
        ],
        "predmet": "aj",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/aj6_stupnovani.html",
        "nazev": "📈 Stupňování přídavných jmen",
        "tagy": [
          "6. ročník",
          "angličtina",
          "comparative",
          "superlative",
          "stupňování"
        ],
        "predmet": "aj",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/aj7_budouci.html",
        "nazev": "⏩ Budoucí čas – will a going to",
        "tagy": [
          "7. ročník",
          "angličtina",
          "future",
          "will",
          "going to",
          "plány"
        ],
        "predmet": "aj",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/aj7_pocitatelnost.html",
        "nazev": "🍎 Počitatelná a nepočitatelná podstatná jména",
        "tagy": [
          "7. ročník",
          "angličtina",
          "countable",
          "uncountable",
          "some/any",
          "much/many"
        ],
        "predmet": "aj",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/dcj7_cleny.html",
        "nazev": "📗 Členy a rod podstatných jmen",
        "tagy": [
          "7. ročník",
          "němčina",
          "francouzština",
          "členy",
          "der die das",
          "le la les"
        ],
        "predmet": "dcj",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/dcj7_vyslovnost.html",
        "nazev": "🔊 Výslovnost a abeceda (NJ/FJ)",
        "tagy": [
          "7. ročník",
          "němčina",
          "francouzština",
          "výslovnost",
          "abeceda",
          "další cizí jazyk"
        ],
        "predmet": "dcj",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/dcj8_casovani.html",
        "nazev": "🏃 Časování pravidelných sloves",
        "tagy": [
          "8. ročník",
          "němčina",
          "francouzština",
          "časování",
          "slovesa"
        ],
        "predmet": "dcj",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/aj8_predpritomny.html",
        "nazev": "🔄 Předpřítomný čas",
        "tagy": [
          "8. ročník",
          "angličtina",
          "present perfect",
          "ever",
          "never",
          "already",
          "yet"
        ],
        "predmet": "aj",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/aj8_trpny_rod.html",
        "nazev": "🔧 Trpný rod",
        "tagy": [
          "8. ročník",
          "angličtina",
          "passive voice",
          "trpný rod"
        ],
        "predmet": "aj",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/dcj9_minuly.html",
        "nazev": "⏪ Minulý čas – úvod",
        "tagy": [
          "9. ročník",
          "němčina",
          "francouzština",
          "perfektum",
          "passé composé",
          "minulý čas"
        ],
        "predmet": "dcj",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/aj9_neprima_rec.html",
        "nazev": "💬 Nepřímá řeč",
        "tagy": [
          "9. ročník",
          "angličtina",
          "reported speech",
          "nepřímá řeč",
          "posun časů"
        ],
        "predmet": "aj",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/aj9_podminkove.html",
        "nazev": "🔀 Podmínkové věty",
        "tagy": [
          "9. ročník",
          "angličtina",
          "conditionals",
          "if",
          "podmínkové věty"
        ],
        "predmet": "aj",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🏡 Člověk a jeho svět",
    "skupina": "prvouka",
    "polozky": [
      {
        "soubor": "obsah/prv1_rodina.html",
        "nazev": "👨‍👩‍👧 Rodina a domov",
        "tagy": [
          "1. ročník",
          "prvouka",
          "rodina",
          "domov",
          "příbuzenské vztahy"
        ],
        "predmet": "prv",
        "rocniky": [
          1,
          2
        ]
      },
      {
        "soubor": "obsah/prv1_cesta_skola.html",
        "nazev": "🚸 Cesta do školy a bezpečnost",
        "tagy": [
          "1. ročník",
          "prvouka",
          "bezpečnost",
          "dopravní výchova",
          "chodec"
        ],
        "predmet": "prv",
        "rocniky": [
          1,
          2
        ]
      },
      {
        "soubor": "obsah/prv2_zdravi.html",
        "nazev": "🩹 Zdraví, nemoc a první pomoc",
        "tagy": [
          "2. ročník",
          "prvouka",
          "zdraví",
          "nemoc",
          "první pomoc",
          "tísňová volání"
        ],
        "predmet": "prv",
        "rocniky": [
          2,
          3
        ]
      },
      {
        "soubor": "obsah/prv5_zdravy_styl.html",
        "nazev": "🥗 Zdravý životní styl",
        "tagy": [
          "5. ročník",
          "přírodověda",
          "zdraví",
          "výživa",
          "pohyb",
          "režim dne"
        ],
        "predmet": "prv",
        "rocniky": [
          5
        ]
      }
    ]
  },
  {
    "nazev": "🌳 Příroda kolem nás",
    "skupina": "prvouka",
    "polozky": [
      {
        "soubor": "obsah/prv1_rocni_obdobi.html",
        "nazev": "🍂 Roční období a čas",
        "tagy": [
          "1. ročník",
          "prvouka",
          "roční období",
          "měsíce",
          "den",
          "týden"
        ],
        "predmet": "prv",
        "rocniky": [
          1,
          2
        ]
      },
      {
        "soubor": "obsah/prv1_smysly.html",
        "nazev": "👁️ Lidské tělo a smysly",
        "tagy": [
          "1. ročník",
          "prvouka",
          "smysly",
          "tělo",
          "zrak",
          "sluch"
        ],
        "predmet": "prv",
        "rocniky": [
          1,
          2
        ]
      },
      {
        "soubor": "obsah/prv2_zvirata.html",
        "nazev": "🐄 Domácí a volně žijící zvířata",
        "tagy": [
          "2. ročník",
          "prvouka",
          "zvířata",
          "domácí zvířata",
          "mláďata",
          "třídění"
        ],
        "predmet": "prv",
        "rocniky": [
          2,
          3
        ]
      },
      {
        "soubor": "obsah/prv3_ziva_neziva.html",
        "nazev": "🌱 Živá a neživá příroda",
        "tagy": [
          "3. ročník",
          "prvouka",
          "živá příroda",
          "neživá příroda",
          "třídění",
          "znaky života"
        ],
        "predmet": "prv",
        "rocniky": [
          3
        ]
      },
      {
        "soubor": "obsah/prv3_voda_vzduch.html",
        "nazev": "💧 Voda, vzduch a půda",
        "tagy": [
          "3. ročník",
          "prvouka",
          "voda",
          "vzduch",
          "půda",
          "koloběh vody"
        ],
        "predmet": "prv",
        "rocniky": [
          3,
          4
        ]
      },
      {
        "soubor": "obsah/prv4_ekosystemy.html",
        "nazev": "🌳 Ekosystémy – les, louka, voda",
        "tagy": [
          "4. ročník",
          "přírodověda",
          "ekosystém",
          "les",
          "louka",
          "rybník",
          "společenstva"
        ],
        "predmet": "prv",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/prv4_horniny.html",
        "nazev": "🪨 Horniny a nerosty",
        "tagy": [
          "4. ročník",
          "přírodověda",
          "horniny",
          "nerosty",
          "vlastnosti",
          "určování"
        ],
        "predmet": "prv",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/prv5_energie.html",
        "nazev": "⚡ Energie a její zdroje",
        "tagy": [
          "5. ročník",
          "přírodověda",
          "energie",
          "elektrárny",
          "obnovitelné zdroje",
          "úspory"
        ],
        "predmet": "prv",
        "rocniky": [
          5
        ]
      }
    ]
  },
  {
    "nazev": "🕰️ Naše vlast a dějiny",
    "skupina": "prvouka",
    "polozky": [
      {
        "soubor": "obsah/prv3_obec.html",
        "nazev": "🏘️ Naše obec a kraj",
        "tagy": [
          "3. ročník",
          "vlastivěda",
          "obec",
          "kraj",
          "orientace",
          "plán obce"
        ],
        "predmet": "prv",
        "rocniky": [
          3,
          4
        ]
      },
      {
        "soubor": "obsah/prv4_nejstarsi_dejiny.html",
        "nazev": "🏰 Nejstarší české dějiny",
        "tagy": [
          "4. ročník",
          "vlastivěda",
          "dějiny",
          "Sámo",
          "Velká Morava",
          "Přemyslovci"
        ],
        "predmet": "prv",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/prv4_mapy_smery.html",
        "nazev": "🧭 Mapa, plán a světové strany",
        "tagy": [
          "4. ročník",
          "vlastivěda",
          "mapa",
          "světové strany",
          "měřítko",
          "orientace"
        ],
        "predmet": "prv",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/prv5_statni_symboly.html",
        "nazev": "🇨🇿 Státní symboly a instituce",
        "tagy": [
          "5. ročník",
          "vlastivěda",
          "státní symboly",
          "prezident",
          "parlament",
          "demokracie"
        ],
        "predmet": "prv",
        "rocniky": [
          5
        ]
      },
      {
        "soubor": "obsah/prv5_dejiny_20.html",
        "nazev": "🕰️ 20. století v našich dějinách",
        "tagy": [
          "5. ročník",
          "vlastivěda",
          "20. století",
          "republika",
          "války",
          "1989"
        ],
        "predmet": "prv",
        "rocniky": [
          5
        ]
      }
    ]
  },
  {
    "nazev": "⚛️ Fyzika",
    "skupina": "priroda",
    "polozky": [
      {
        "soubor": "obsah/f6_hustota.html",
        "nazev": "⚖️ Hustota",
        "tagy": [
          "6. ročník",
          "fyzika",
          "hustota",
          "objem",
          "hmotnost",
          "plavání těles"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/physics_ref.html",
        "nazev": "⚛️ Fyzikální vzorce",
        "tagy": [
          "fyzika",
          "2. stupeň",
          "sš",
          "vzorce",
          "kalkulačka",
          "konstanty",
          "graf závislosti",
          "interaktivní"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/f6_mereni.html",
        "nazev": "📏 Měření fyzikálních veličin",
        "tagy": [
          "6. ročník",
          "fyzika",
          "měření",
          "délka",
          "objem",
          "hmotnost",
          "čas",
          "teplota"
        ],
        "predmet": "f",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/physics_playground.html",
        "nazev": "🔬 Fyzikální hřiště pro děti",
        "tagy": [
          "fyzika",
          "kyvadlo",
          "nakloněná rovina",
          "srážky",
          "simulace"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/f6_vlastnosti_latek.html",
        "nazev": "🧊 Vlastnosti látek a těles",
        "tagy": [
          "6. ročník",
          "fyzika",
          "látka",
          "těleso",
          "skupenství",
          "částice",
          "Archimédův zákon",
          "vztlak",
          "hustota",
          "plavání těles"
        ],
        "predmet": "f",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/paka.html",
        "nazev": "⚖️ Páka a jednoduché stroje",
        "tagy": [
          "fyzika",
          "páka",
          "moment síly",
          "rameno",
          "rovnováha",
          "kladka",
          "kladkostroj",
          "ozubená kola",
          "převod",
          "jednoduché stroje",
          "zlaté pravidlo mechaniky",
          "páčidlo",
          "odvalení kamene",
          "vytržení pařezu",
          "simulace",
          "2. stupeň",
          "sš"
        ],
        "predmet": "f",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/vrtacka_lis.html",
        "nazev": "🛠️ Vrtačka a lis: síly při práci",
        "tagy": [
          "fyzika",
          "technická výchova",
          "vrtačka",
          "řezná rychlost",
          "krouticí moment",
          "přítlačná síla",
          "hydraulický lis",
          "pascalův zákon",
          "tlak",
          "zlaté pravidlo mechaniky",
          "práce",
          "simulace",
          "2. stupeň"
        ],
        "predmet": "f",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/gravitacni_hriste2.html",
        "nazev": "🌀 Gravitační hřiště: Vzájemná přitažlivost",
        "tagy": [
          "gravitace",
          "fyzika",
          "n-těles",
          "hmotnost",
          "vesmír",
          "simulace",
          "srážky planet",
          "sluneční soustava",
          "kruhová dráha",
          "stabilita soustavy",
          "těžiště",
          "akce a reakce",
          "zachování hybnosti"
        ],
        "predmet": "f",
        "rocniky": [
          7,
          9
        ]
      },
      {
        "soubor": "obsah/f7_tlak.html",
        "nazev": "🎈 Tlak v kapalinách a plynech",
        "tagy": [
          "7. ročník",
          "fyzika",
          "tlak",
          "pascalův zákon",
          "archimédův zákon",
          "vztlak",
          "hydraulika"
        ],
        "predmet": "f",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/gravitacni_hriste.html",
        "nazev": "🎯 Kosmický prak: oběžné dráhy",
        "tagy": [
          "oběžná dráha",
          "fyzika",
          "kepler",
          "keplerovy zákony",
          "elipsa",
          "gravitace",
          "vesmír",
          "simulace",
          "kosmická rychlost",
          "družice"
        ],
        "predmet": "f",
        "rocniky": [
          7,
          9
        ]
      },
      {
        "soubor": "obsah/f7_pohyb.html",
        "nazev": "🏃 Pohyb tělesa – dráha a rychlost",
        "tagy": [
          "7. ročník",
          "fyzika",
          "pohyb",
          "rychlost",
          "dráha",
          "graf pohybu"
        ],
        "predmet": "f",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/proudove_motory.html",
        "nazev": "\ud83d\udeeb Proudov\u00e9 motory \u2013 kudy proud\u00ed vzduch",
        "tagy": [
          "fyzika",
          "proudov\u00fd motor",
          "turb\u00edna",
          "kompresor",
          "spalovac\u00ed komora",
          "tryska",
          "turbojet",
          "turbofan",
          "dvouproudov\u00fd motor",
          "turbovrtulov\u00fd motor",
          "turboh\u0159\u00eddelov\u00fd motor",
          "n\u00e1porov\u00fd motor",
          "ramjet",
          "scramjet",
          "raketov\u00fd motor",
          "plynov\u00e1 turb\u00edna",
          "tah",
          "tlak",
          "teplota",
          "Brayton\u016fv cyklus",
          "proud\u011bn\u00ed",
          "simulace",
          "2. stupe\u0148",
          "s\u0161"
        ],
        "predmet": "f",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/vitr_tunel.html",
        "nazev": "💨 Vítr a překážky – aerodynamický tunel",
        "tagy": [
          "fyzika",
          "vítr",
          "proudění",
          "aerodynamika",
          "víry",
          "turbulence",
          "odpor vzduchu",
          "vztlak",
          "křídlo",
          "kármánova vírová stezka",
          "simulace",
          "2. stupeň",
          "sš"
        ],
        "predmet": "f",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/f7_sila.html",
        "nazev": "💪 Síla, těžiště a Newtonovy zákony",
        "tagy": [
          "7. ročník",
          "fyzika",
          "síla",
          "newtonovy zákony",
          "těžiště",
          "skládání sil",
          "gravitace"
        ],
        "predmet": "f",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/elektrina.html",
        "nazev": "⚡ Elektřina – obvody a magnetismus",
        "tagy": [
          "fyzika",
          "elektřina",
          "ohmův zákon",
          "proud",
          "napětí",
          "odpor",
          "elektrický obvod",
          "sériové zapojení",
          "paralelní zapojení",
          "žárovka",
          "zkrat",
          "pojistka",
          "magnetické pole",
          "elektromagnet",
          "cívka",
          "pravidlo pravé ruky",
          "elektromagnetická indukce",
          "generátor",
          "spotřeba elektřiny",
          "kWh",
          "cena elektřiny",
          "elektrická práce",
          "simulace",
          "2. stupeň",
          "sš"
        ],
        "predmet": "f",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/f8_teplo.html",
        "nazev": "🌡️ Teplo a změny skupenství",
        "tagy": [
          "8. ročník",
          "fyzika",
          "teplo",
          "teplota",
          "skupenské teplo",
          "var",
          "tání",
          "kalorimetr"
        ],
        "predmet": "f",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/vodni_hladina.html",
        "nazev": "💧 Vodní hladina – vlny a slapy",
        "tagy": [
          "fyzika",
          "vlnění",
          "vlny",
          "voda",
          "rybník",
          "kruhy na vodě",
          "interference",
          "ohyb",
          "difrakce",
          "odraz",
          "štěrbina",
          "simulace",
          "příliv",
          "odliv",
          "slapy",
          "slapové jevy",
          "měsíc",
          "zeměpis",
          "2. stupeň",
          "sš"
        ],
        "predmet": "f",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/optika_lekce.html",
        "nazev": "💡 Světlo a optika – názorná lekce",
        "tagy": [
          "fyzika",
          "optika",
          "světlo",
          "výklad",
          "zdroj světla",
          "stín",
          "polostín",
          "zatmění",
          "odraz",
          "zákon odrazu",
          "zrcadlo",
          "lom",
          "index lomu",
          "snellův zákon",
          "úplný odraz",
          "mezní úhel",
          "optické vlákno",
          "hranol",
          "disperze",
          "spektrum",
          "duha",
          "čočka",
          "spojka",
          "rozptylka",
          "ohnisko",
          "optická mohutnost",
          "dioptrie",
          "zobrazovací rovnice",
          "obraz",
          "oko",
          "akomodace",
          "krátkozrakost",
          "dalekozrakost",
          "brýle",
          "lupa",
          "fotoaparát",
          "projektor",
          "simulace",
          "2. stupeň",
          "sš"
        ],
        "predmet": "f",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/optika.html",
        "nazev": "🔦 Optika – odraz, lom a čočky",
        "tagy": [
          "fyzika",
          "optika",
          "světlo",
          "odraz",
          "lom",
          "snellův zákon",
          "index lomu",
          "mezní úhel",
          "úplný odraz",
          "čočka",
          "spojka",
          "rozptylka",
          "zrcadlo",
          "ohnisko",
          "hranol",
          "spektrum",
          "disperze",
          "duha",
          "simulace",
          "2. stupeň",
          "sš",
          "dalekohled",
          "hvězdářský dalekohled",
          "zvětšení"
        ],
        "predmet": "f",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/optika_soustava.html",
        "nazev": "\ud83e\udde9 Stavba optick\u00e9 soustavy",
        "tagy": [
          "fyzika",
          "optika",
          "optick\u00e1 soustava",
          "\u010do\u010dka",
          "spojka",
          "rozptylka",
          "zrcadlo",
          "clona",
          "ohnisko",
          "obraz",
          "zv\u011bt\u0161en\u00ed",
          "dalekohled",
          "zrcadlov\u00fd dalekohled",
          "mikroskop",
          "lupa",
          "promita\u010dka",
          "simulace",
          "stavebnice",
          "2. stupe\u0148",
          "\u0161\u0161"
        ],
        "predmet": "f",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/f8_prace_energie.html",
        "nazev": "🔧 Práce, výkon a energie",
        "tagy": [
          "8. ročník",
          "fyzika",
          "práce",
          "výkon",
          "energie",
          "účinnost",
          "polohová energie"
        ],
        "predmet": "f",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/f9_jaderna.html",
        "nazev": "☢️ Jaderná energie",
        "tagy": [
          "9. ročník",
          "fyzika",
          "atom",
          "jádro",
          "radioaktivita",
          "štěpení",
          "jaderná elektrárna",
          "řetězová reakce",
          "regulační tyče",
          "kritický stav",
          "kritické množství",
          "součinitel násobení",
          "reflektor neutronů",
          "poločas rozpadu",
          "parogenerátor",
          "simulace",
          "interaktivní"
        ],
        "predmet": "f",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/f9_zvuk.html",
        "nazev": "🔊 Zvukové jevy",
        "tagy": [
          "9. ročník",
          "fyzika",
          "zvuk",
          "kmitání",
          "frekvence",
          "ozvěna",
          "hlasitost"
        ],
        "predmet": "f",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/f9_stridavy_proud.html",
        "nazev": "🔌 Střídavý proud a rozvod elektřiny",
        "tagy": [
          "9. ročník",
          "fyzika",
          "střídavý proud",
          "transformátor",
          "elektrárna",
          "rozvodná síť"
        ],
        "predmet": "f",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "⚗️ Chemie",
    "skupina": "priroda",
    "polozky": [
      {
        "soubor": "obsah/ch8_bezpecnost.html",
        "nazev": "☣️ Bezpečnost práce a výstražné značky",
        "tagy": [
          "8. ročník",
          "chemie",
          "bezpečnost",
          "ghs",
          "výstražné symboly",
          "laboratoř"
        ],
        "predmet": "ch",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/chem_nazvoslovi.html",
        "nazev": "⚗️ Chemické názvosloví",
        "tagy": [
          "chemie",
          "vzorce",
          "oxidy",
          "kyseliny",
          "soli",
          "2. stupeň",
          "sš"
        ],
        "predmet": "ch",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/ch8_atom.html",
        "nazev": "⚛️ Atom, molekula a chemická vazba",
        "tagy": [
          "8. ročník",
          "chemie",
          "atom",
          "elektron",
          "proton",
          "vazba",
          "ionty",
          "molekula",
          "izotop"
        ],
        "predmet": "ch",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/periodic_table.html",
        "nazev": "⚛️ Periodická tabulka",
        "tagy": [
          "chemie",
          "prvky",
          "mendělejev",
          "2. stupeň",
          "sš"
        ],
        "predmet": "ch",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/ch8_voda_vzduch.html",
        "nazev": "💨 Voda a vzduch",
        "tagy": [
          "8. ročník",
          "chemie",
          "voda",
          "vzduch",
          "složení",
          "znečištění",
          "pitná voda"
        ],
        "predmet": "ch",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/ch8_smesi.html",
        "nazev": "🧪 Směsi a jejich oddělování",
        "tagy": [
          "8. ročník",
          "chemie",
          "směs",
          "roztok",
          "filtrace",
          "destilace",
          "koncentrace"
        ],
        "predmet": "ch",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/vycislovani_rovnic.html",
        "nazev": "🧪 Vyčíslování chemických rovnic",
        "tagy": [
          "chemie",
          "2. stupeň",
          "8. ročník",
          "9. ročník",
          "sš",
          "koeficienty",
          "stechiometrie"
        ],
        "predmet": "ch",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/ch9_zivotni_prostredi.html",
        "nazev": "♻️ Chemie a životní prostředí",
        "tagy": [
          "9. ročník",
          "chemie",
          "plasty",
          "recyklace",
          "paliva",
          "skleníkový efekt",
          "odpady"
        ],
        "predmet": "ch",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/ch9_prirodni_latky.html",
        "nazev": "🍞 Přírodní látky",
        "tagy": [
          "9. ročník",
          "chemie",
          "sacharidy",
          "tuky",
          "bílkoviny",
          "vitamíny",
          "výživa"
        ],
        "predmet": "ch",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/ch9_redoxni.html",
        "nazev": "🔋 Redoxní reakce a elektrolýza",
        "tagy": [
          "9. ročník",
          "chemie",
          "oxidace",
          "redukce",
          "elektrolýza",
          "koroze",
          "galvanický článek"
        ],
        "predmet": "ch",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/ch9_uhlovodiky.html",
        "nazev": "🛢️ Uhlovodíky",
        "tagy": [
          "9. ročník",
          "chemie",
          "uhlovodíky",
          "alkany",
          "alkeny",
          "ropa",
          "paliva"
        ],
        "predmet": "ch",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/ch9_ph.html",
        "nazev": "🧫 Kyseliny, hydroxidy a pH",
        "tagy": [
          "9. ročník",
          "chemie",
          "ph",
          "kyselina",
          "hydroxid",
          "indikátor",
          "neutralizace"
        ],
        "predmet": "ch",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/ch9_derivaty.html",
        "nazev": "🧴 Deriváty uhlovodíků",
        "tagy": [
          "9. ročník",
          "chemie",
          "deriváty",
          "alkoholy",
          "kyseliny",
          "funkční skupina"
        ],
        "predmet": "ch",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🧬 Přírodopis",
    "skupina": "priroda",
    "polozky": [
      {
        "soubor": "obsah/potravni_retezec.html",
        "nazev": "🌾 Potravní řetězce",
        "tagy": [
          "biologie",
          "ekosystém",
          "producent",
          "konzument",
          "1. stupeň",
          "2. stupeň"
        ],
        "predmet": "pr",
        "rocniky": [
          6,
          9
        ]
      },
      {
        "soubor": "obsah/pr6_houby.html",
        "nazev": "🍄 Houby a lišejníky",
        "tagy": [
          "6. ročník",
          "přírodopis",
          "houby",
          "lišejníky",
          "symbióza",
          "určování hub"
        ],
        "predmet": "pr",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/pr6_bezobratli.html",
        "nazev": "🐌 Bezobratlí",
        "tagy": [
          "6. ročník",
          "přírodopis",
          "bezobratlí",
          "žahavci",
          "měkkýši",
          "kroužkovci"
        ],
        "predmet": "pr",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/bunka.html",
        "nazev": "🔬 Stavba buňky",
        "tagy": [
          "biologie",
          "buňka",
          "organely",
          "jádro",
          "mitochondrie",
          "2. stupeň"
        ],
        "predmet": "pr",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/pr6_clenovci.html",
        "nazev": "🕷️ Členovci",
        "tagy": [
          "6. ročník",
          "přírodopis",
          "členovci",
          "hmyz",
          "pavoukovci",
          "korýši",
          "proměna"
        ],
        "predmet": "pr",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/pr6_mikroorganismy.html",
        "nazev": "🦠 Bakterie, viry a jednobuněčné organismy",
        "tagy": [
          "6. ročník",
          "přírodopis",
          "bakterie",
          "viry",
          "prvoci",
          "mikroskop",
          "nemoci"
        ],
        "predmet": "pr",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/pr7_rostliny.html",
        "nazev": "🌿 Stavba a systém rostlin",
        "tagy": [
          "7. ročník",
          "přírodopis",
          "rostliny",
          "kořen",
          "stonek",
          "list",
          "květ",
          "fotosyntéza"
        ],
        "predmet": "pr",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/pr7_obratlovci_studenokrevni.html",
        "nazev": "🐟 Ryby, obojživelníci a plazi",
        "tagy": [
          "7. ročník",
          "přírodopis",
          "ryby",
          "obojživelníci",
          "plazi",
          "obratlovci"
        ],
        "predmet": "pr",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/pr7_ptaci_savci.html",
        "nazev": "🦅 Ptáci a savci",
        "tagy": [
          "7. ročník",
          "přírodopis",
          "ptáci",
          "savci",
          "přizpůsobení",
          "potrava"
        ],
        "predmet": "pr",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/pr8_rozmnozovani.html",
        "nazev": "👶 Rozmnožování a vývoj člověka",
        "tagy": [
          "8. ročník",
          "přírodopis",
          "rozmnožovací soustava",
          "vývoj",
          "dospívání",
          "těhotenství"
        ],
        "predmet": "pr",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/pr8_prvni_pomoc.html",
        "nazev": "🚑 Zdraví a první pomoc",
        "tagy": [
          "8. ročník",
          "přírodopis",
          "první pomoc",
          "zdraví",
          "úraz",
          "resuscitace"
        ],
        "predmet": "pr",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/anatomie.html",
        "nazev": "🫀 Biologie člověka",
        "tagy": [
          "biologie",
          "anatomie",
          "orgány",
          "soustavy",
          "2. stupeň"
        ],
        "predmet": "pr",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/pr9_ekologie.html",
        "nazev": "♻️ Ekologie a ochrana přírody",
        "tagy": [
          "9. ročník",
          "přírodopis",
          "ekologie",
          "ekosystém",
          "chráněná území",
          "biodiverzita"
        ],
        "predmet": "pr",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/pr9_geologicke_deje.html",
        "nazev": "🌋 Geologické děje",
        "tagy": [
          "9. ročník",
          "přírodopis",
          "sopky",
          "zemětřesení",
          "zvětrávání",
          "litosférické desky"
        ],
        "predmet": "pr",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/pr9_mineraly.html",
        "nazev": "💎 Minerály a horniny",
        "tagy": [
          "9. ročník",
          "přírodopis",
          "minerály",
          "horniny",
          "vyvřelé",
          "usazené",
          "přeměněné"
        ],
        "predmet": "pr",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/pr9_vyvoj_zeme.html",
        "nazev": "🦕 Vývoj Země a života",
        "tagy": [
          "9. ročník",
          "přírodopis",
          "geologické éry",
          "zkameněliny",
          "evoluce",
          "dinosauři"
        ],
        "predmet": "pr",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/punnett.html",
        "nazev": "🧬 Punnettův čtverec",
        "tagy": [
          "biologie",
          "genetika",
          "2. stupeň",
          "sš",
          "křížení",
          "dědičnost",
          "alely"
        ],
        "predmet": "pr",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🪐 Astronomie",
    "skupina": "priroda",
    "polozky": [
      {
        "soubor": "obsah/star_map.html",
        "nazev": "🌌 Hvězdná obloha",
        "tagy": [
          "hvězdy",
          "souhvězdí",
          "astronomie",
          "obloha",
          "roční období",
          "zimní obloha",
          "letní obloha"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          9
        ]
      },
      {
        "soubor": "obsah/pohyb_vesmirem.html",
        "nazev": "🌌 Pohyb vesmírem",
        "tagy": [
          "vesmír",
          "galaxie",
          "měsíc",
          "slunce",
          "oběh",
          "astronomie",
          "mléčná dráha"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          9
        ]
      },
      {
        "soubor": "obsah/planet_globe.html",
        "nazev": "🌐 Glóbusy planet",
        "tagy": [
          "planety",
          "vesmír",
          "astronomie",
          "mars",
          "měsíc",
          "3d",
          "glóbus"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          9
        ]
      },
      {
        "soubor": "obsah/sky_events.html",
        "nazev": "🌠 Astronomický kalendář úkazů",
        "tagy": [
          "meteorický roj",
          "zatmění",
          "úplněk",
          "slunovrat",
          "rovnodennost",
          "astronomie"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          9
        ]
      },
      {
        "soubor": "obsah/solar_system.html",
        "nazev": "🪐 Sluneční soustava",
        "tagy": [
          "planety",
          "vesmír",
          "astronomie"
        ],
        "predmet": "f",
        "rocniky": [
          6,
          9
        ]
      },
      {
        "soubor": "obsah/iss.html",
        "nazev": "🛰️ ISS živě",
        "tagy": [
          "vesmír",
          "stanice",
          "družice",
          "oběžná dráha",
          "astronomie",
          "živě"
        ],
        "predmet": "f",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🌍 Zeměpis",
    "skupina": "spolecnost",
    "polozky": [
      {
        "soubor": "obsah/z6_atmosfera.html",
        "nazev": "☁️ Atmosféra a počasí",
        "tagy": [
          "6. ročník",
          "zeměpis",
          "atmosféra",
          "počasí",
          "podnebné pásy",
          "tlak vzduchu"
        ],
        "predmet": "z",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/z6_hydrosfera.html",
        "nazev": "🌊 Hydrosféra",
        "tagy": [
          "6. ročník",
          "zeměpis",
          "hydrosféra",
          "oceány",
          "řeky",
          "ledovce",
          "koloběh vody"
        ],
        "predmet": "z",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/z6_planeta_zeme.html",
        "nazev": "🌎 Planeta Země – tvar a pohyby",
        "tagy": [
          "6. ročník",
          "zeměpis",
          "Země",
          "rotace",
          "oběh",
          "střídání dne a noci",
          "roční období"
        ],
        "predmet": "z",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/z6_mapa_souradnice.html",
        "nazev": "🗺️ Mapa, měřítko a souřadnice",
        "tagy": [
          "6. ročník",
          "zeměpis",
          "mapa",
          "měřítko",
          "zeměpisná šířka",
          "délka",
          "glóbus"
        ],
        "predmet": "z",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/eduMaps.html",
        "nazev": "🗺️ Mapy – lekce a průvodce",
        "tagy": [
          "zeměpis",
          "mapy",
          "výuka"
        ],
        "predmet": "z",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/z6_litosfera.html",
        "nazev": "🪨 Litosféra a povrch Země",
        "tagy": [
          "6. ročník",
          "zeměpis",
          "litosféra",
          "pohoří",
          "sopky",
          "desky",
          "nadmořská výška"
        ],
        "predmet": "z",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/z7_afrika.html",
        "nazev": "🌍 Afrika",
        "tagy": [
          "7. ročník",
          "zeměpis",
          "Afrika",
          "Sahara",
          "státy",
          "regiony"
        ],
        "predmet": "z",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/svetova_hlavni_mesta.html",
        "nazev": "🌍 Kvíz světových hlavních měst",
        "tagy": [
          "zeměpis",
          "hlavní města",
          "svět",
          "státy"
        ],
        "predmet": "z",
        "rocniky": [
          7,
          9
        ]
      },
      {
        "soubor": "obsah/z7_amerika.html",
        "nazev": "🌎 Amerika",
        "tagy": [
          "7. ročník",
          "zeměpis",
          "Amerika",
          "Kordillery",
          "Amazonie",
          "státy"
        ],
        "predmet": "z",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/z7_asie.html",
        "nazev": "🌏 Asie",
        "tagy": [
          "7. ročník",
          "zeměpis",
          "Asie",
          "Himálaj",
          "monzun",
          "státy"
        ],
        "predmet": "z",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/flags_quiz.html",
        "nazev": "🏳️ Kvíz vlajky a města",
        "tagy": [
          "vlajky",
          "státy",
          "hlavní města",
          "zeměpis"
        ],
        "predmet": "z",
        "rocniky": [
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/z7_australie_oceanie.html",
        "nazev": "🦘 Austrálie, Oceánie a polární oblasti",
        "tagy": [
          "7. ročník",
          "zeměpis",
          "Austrálie",
          "Oceánie",
          "Antarktida",
          "Arktida"
        ],
        "predmet": "z",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/z8_cr_prirodni.html",
        "nazev": "🇨🇿 ČR – povrch, podnebí a vodstvo",
        "tagy": [
          "8. ročník",
          "zeměpis",
          "Česko",
          "povrch",
          "podnebí",
          "vodstvo",
          "úmoří"
        ],
        "predmet": "z",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/z8_evropa_regiony.html",
        "nazev": "🇪🇺 Evropa – regiony",
        "tagy": [
          "8. ročník",
          "zeměpis",
          "Evropa",
          "regiony",
          "severní",
          "jižní",
          "západní",
          "východní"
        ],
        "predmet": "z",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/reky_pohori.html",
        "nazev": "🏔️ Řeky a pohoří ČR",
        "tagy": [
          "zeměpis",
          "česko",
          "řeky",
          "pohoří",
          "2. stupeň"
        ],
        "predmet": "z",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/z8_cr_hospodarstvi.html",
        "nazev": "🏭 ČR – obyvatelstvo a hospodářství",
        "tagy": [
          "8. ročník",
          "zeměpis",
          "Česko",
          "obyvatelstvo",
          "průmysl",
          "zemědělství",
          "doprava"
        ],
        "predmet": "z",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/slepa_mapa_evropa.html",
        "nazev": "🗺️ Slepá mapa Evropy",
        "tagy": [
          "státy",
          "evropa",
          "zeměpis",
          "2. stupeň",
          "sš"
        ],
        "predmet": "z",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/slepa_mapa.html",
        "nazev": "🗺️ Slepá mapa ČR",
        "tagy": [
          "kraje",
          "krajská města",
          "zeměpis",
          "česko",
          "2. stupeň"
        ],
        "predmet": "z",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/z9_hospodarstvi_svet.html",
        "nazev": "🌐 Světové hospodářství a globalizace",
        "tagy": [
          "9. ročník",
          "zeměpis",
          "hospodářství",
          "globalizace",
          "obchod",
          "sektory"
        ],
        "predmet": "z",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/z9_obyvatelstvo.html",
        "nazev": "👥 Obyvatelstvo a sídla světa",
        "tagy": [
          "9. ročník",
          "zeměpis",
          "obyvatelstvo",
          "migrace",
          "města",
          "hustota zalidnění"
        ],
        "predmet": "z",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/z9_globalni_problemy.html",
        "nazev": "🔥 Globální problémy a životní prostředí",
        "tagy": [
          "9. ročník",
          "zeměpis",
          "klima",
          "globální oteplování",
          "chudoba",
          "udržitelnost"
        ],
        "predmet": "z",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "📜 Dějepis & společnost",
    "skupina": "spolecnost",
    "polozky": [
      {
        "soubor": "obsah/d6_recko.html",
        "nazev": "🏛️ Starověké Řecko",
        "tagy": [
          "6. ročník",
          "dějepis",
          "Řecko",
          "Athény",
          "Sparta",
          "demokracie",
          "olympijské hry"
        ],
        "predmet": "d",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/d6_rim.html",
        "nazev": "🏟️ Starověký Řím",
        "tagy": [
          "6. ročník",
          "dějepis",
          "Řím",
          "republika",
          "císařství",
          "legie",
          "křesťanství"
        ],
        "predmet": "d",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/d6_stary_orient.html",
        "nazev": "🏺 Starověký Egypt a Mezopotámie",
        "tagy": [
          "6. ročník",
          "dějepis",
          "Egypt",
          "Mezopotámie",
          "písmo",
          "pyramidy",
          "starověk"
        ],
        "predmet": "d",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/historicke_mapy_odkazy.html",
        "nazev": "📜 Kde najít historické mapy",
        "tagy": [
          "dějepis",
          "mapy",
          "archiv"
        ],
        "predmet": "d",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/svetove_dejiny.html",
        "nazev": "📜 Časová osa světových dějin",
        "tagy": [
          "dějepis",
          "historie",
          "svět",
          "letopočty",
          "2. stupeň",
          "sš"
        ],
        "predmet": "d",
        "rocniky": [
          6,
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/d6_prameny.html",
        "nazev": "🔎 Čas, prameny a práce historika",
        "tagy": [
          "6. ročník",
          "dějepis",
          "historické prameny",
          "letopočet",
          "periodizace",
          "archeologie"
        ],
        "predmet": "d",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/d6_pravek.html",
        "nazev": "🦴 Pravěk",
        "tagy": [
          "6. ročník",
          "dějepis",
          "pravěk",
          "doba kamenná",
          "doba bronzová",
          "lovci",
          "zemědělství"
        ],
        "predmet": "d",
        "rocniky": [
          6
        ]
      },
      {
        "soubor": "obsah/d7_rany_stredovek.html",
        "nazev": "⚔️ Raný středověk a příchod Slovanů",
        "tagy": [
          "7. ročník",
          "dějepis",
          "středověk",
          "stěhování národů",
          "Sámo",
          "Velká Morava",
          "Slované"
        ],
        "predmet": "d",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/d7_husitstvi.html",
        "nazev": "⛪ Husitství",
        "tagy": [
          "7. ročník",
          "dějepis",
          "husité",
          "Jan Hus",
          "Žižka",
          "reformace",
          "kalich"
        ],
        "predmet": "d",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/d7_lucemburkove.html",
        "nazev": "🏰 Lucemburkové a Karel IV.",
        "tagy": [
          "7. ročník",
          "dějepis",
          "Lucemburkové",
          "Karel IV.",
          "gotika",
          "univerzita"
        ],
        "predmet": "d",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/d7_premyslovci.html",
        "nazev": "👑 Přemyslovci",
        "tagy": [
          "7. ročník",
          "dějepis",
          "Přemyslovci",
          "český stát",
          "panovníci",
          "kolonizace"
        ],
        "predmet": "d",
        "rocniky": [
          7
        ]
      },
      {
        "soubor": "obsah/casova_osa.html",
        "nazev": "📜 Časová osa českých dějin",
        "tagy": [
          "dějepis",
          "historie",
          "letopočty",
          "2. stupeň",
          "sš"
        ],
        "predmet": "d",
        "rocniky": [
          7,
          8,
          9
        ]
      },
      {
        "soubor": "obsah/d8_objevy_renesance.html",
        "nazev": "⛵ Zámořské objevy a renesance",
        "tagy": [
          "8. ročník",
          "dějepis",
          "objevy",
          "Kolumbus",
          "renesance",
          "humanismus"
        ],
        "predmet": "d",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/d8_prumyslova_revoluce.html",
        "nazev": "🏭 Průmyslová revoluce a národní obrození",
        "tagy": [
          "8. ročník",
          "dějepis",
          "průmyslová revoluce",
          "stroje",
          "národní obrození",
          "rok 1848"
        ],
        "predmet": "d",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/d8_osvicenstvi.html",
        "nazev": "💡 Osvícenství a revoluce",
        "tagy": [
          "8. ročník",
          "dějepis",
          "osvícenství",
          "Marie Terezie",
          "Josef II.",
          "francouzská revoluce",
          "Napoleon"
        ],
        "predmet": "d",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/d8_reformace.html",
        "nazev": "📜 Reformace a třicetiletá válka",
        "tagy": [
          "8. ročník",
          "dějepis",
          "reformace",
          "Luther",
          "třicetiletá válka",
          "Bílá hora"
        ],
        "predmet": "d",
        "rocniky": [
          8
        ]
      },
      {
        "soubor": "obsah/eu_instituce.html",
        "nazev": "🇪🇺 Instituce Evropské unie",
        "tagy": [
          "eu",
          "evropská unie",
          "instituce",
          "politika",
          "sš"
        ],
        "predmet": "d",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/d9_prvni_valka.html",
        "nazev": "🎖️ První světová válka",
        "tagy": [
          "9. ročník",
          "dějepis",
          "první světová válka",
          "fronty",
          "legie",
          "Versailles"
        ],
        "predmet": "d",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/d9_csr.html",
        "nazev": "🏛️ Vznik ČSR a meziválečné období",
        "tagy": [
          "9. ročník",
          "dějepis",
          "Československo",
          "Masaryk",
          "první republika",
          "Mnichov"
        ],
        "predmet": "d",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/d9_druha_valka.html",
        "nazev": "🕯️ Druhá světová válka a holokaust",
        "tagy": [
          "9. ročník",
          "dějepis",
          "druhá světová válka",
          "protektorát",
          "holokaust",
          "odboj"
        ],
        "predmet": "d",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/d9_studena_valka.html",
        "nazev": "🧊 Studená válka a rok 1989",
        "tagy": [
          "9. ročník",
          "dějepis",
          "studená válka",
          "komunismus",
          "1968",
          "1989",
          "sametová revoluce"
        ],
        "predmet": "d",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🧭 Algoritmy & programování",
    "skupina": "informatika",
    "polozky": [
      {
        "soubor": "obsah/inf4_sekvence.html",
        "nazev": "🧭 Programování – sekvence příkazů",
        "tagy": [
          "4. ročník",
          "informatika",
          "programování",
          "algoritmus",
          "sekvence",
          "robot"
        ],
        "predmet": "inf",
        "rocniky": [
          4
        ]
      },
      {
        "soubor": "obsah/inf5_cykly.html",
        "nazev": "🔁 Programování – cykly a větvení",
        "tagy": [
          "5. ročník",
          "informatika",
          "cyklus",
          "podmínka",
          "větvení",
          "blokové programování"
        ],
        "predmet": "inf",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/inf6_promenne.html",
        "nazev": "📦 Programování – proměnné a podmínky",
        "tagy": [
          "6. ročník",
          "informatika",
          "proměnná",
          "podmínka",
          "programování"
        ],
        "predmet": "inf",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/inf7_funkce.html",
        "nazev": "🧩 Programování – funkce a parametry",
        "tagy": [
          "7. ročník",
          "informatika",
          "funkce",
          "podprogram",
          "parametr",
          "programování"
        ],
        "predmet": "inf",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/eduSort.html",
        "nazev": "🔢 Algoritmy řazení",
        "tagy": [
          "informatika",
          "programování",
          "sorting"
        ],
        "predmet": "inf",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/inf9_model_simulace.html",
        "nazev": "🧪 Modely a simulace",
        "tagy": [
          "9. ročník",
          "informatika",
          "model",
          "simulace",
          "systém",
          "graf"
        ],
        "predmet": "inf",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🔣 Data, informace & sítě",
    "skupina": "informatika",
    "polozky": [
      {
        "soubor": "obsah/inf4_data.html",
        "nazev": "🔣 Data, informace a kódování",
        "tagy": [
          "4. ročník",
          "informatika",
          "data",
          "kódování",
          "binární kód",
          "piktogramy"
        ],
        "predmet": "inf",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/morse_code.html",
        "nazev": "📡 Morseova abeceda",
        "tagy": [
          "morseovka",
          "kód",
          "vysílání"
        ],
        "predmet": "inf",
        "rocniky": [
          5,
          6,
          7
        ]
      },
      {
        "soubor": "obsah/inf6_tabulky.html",
        "nazev": "📊 Tabulkový procesor – vzorce",
        "tagy": [
          "6. ročník",
          "informatika",
          "tabulka",
          "vzorce",
          "graf",
          "buňka"
        ],
        "predmet": "inf",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/inf7_site.html",
        "nazev": "🌐 Počítačové sítě a internet",
        "tagy": [
          "7. ročník",
          "informatika",
          "síť",
          "internet",
          "ip adresa",
          "server",
          "protokol"
        ],
        "predmet": "inf",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/inf7_sifrovani.html",
        "nazev": "🔐 Šifrování a kódování dat",
        "tagy": [
          "7. ročník",
          "informatika",
          "šifra",
          "caesarova šifra",
          "kódování",
          "komprese"
        ],
        "predmet": "inf",
        "rocniky": [
          7,
          8
        ]
      },
      {
        "soubor": "obsah/inf8_databaze.html",
        "nazev": "🗄️ Databáze a strukturovaná data",
        "tagy": [
          "8. ročník",
          "informatika",
          "databáze",
          "záznam",
          "filtrování",
          "třídění dat"
        ],
        "predmet": "inf",
        "rocniky": [
          8,
          9
        ]
      }
    ]
  },
  {
    "nazev": "🛡️ Bezpečnost & etika",
    "skupina": "informatika",
    "polozky": [
      {
        "soubor": "obsah/inf4_hardware.html",
        "nazev": "🖥️ Hardware a bezpečné chování",
        "tagy": [
          "4. ročník",
          "informatika",
          "hardware",
          "počítač",
          "bezpečnost",
          "heslo"
        ],
        "predmet": "inf",
        "rocniky": [
          4,
          5
        ]
      },
      {
        "soubor": "obsah/inf5_zdroje.html",
        "nazev": "🔍 Informace na internetu a ověřování",
        "tagy": [
          "5. ročník",
          "informatika",
          "vyhledávání",
          "ověřování zdrojů",
          "dezinformace"
        ],
        "predmet": "inf",
        "rocniky": [
          5,
          6
        ]
      },
      {
        "soubor": "obsah/inf6_digitalni_stopa.html",
        "nazev": "👣 Digitální stopa a bezpečnost",
        "tagy": [
          "6. ročník",
          "informatika",
          "digitální stopa",
          "soukromí",
          "sociální sítě",
          "kyberšikana"
        ],
        "predmet": "inf",
        "rocniky": [
          6,
          7
        ]
      },
      {
        "soubor": "obsah/inf8_licence.html",
        "nazev": "⚖️ Autorská práva a licence",
        "tagy": [
          "8. ročník",
          "informatika",
          "autorské právo",
          "licence",
          "creative commons",
          "citace"
        ],
        "predmet": "inf",
        "rocniky": [
          8,
          9
        ]
      },
      {
        "soubor": "obsah/AI_prednaska.html",
        "nazev": "🤖 AI přednáška",
        "tagy": [
          "umělá inteligence",
          "informatika",
          "prezentace",
          "chatgpt",
          "prompt"
        ],
        "predmet": "inf",
        "rocniky": [
          9
        ]
      },
      {
        "soubor": "obsah/inf9_ai_etika.html",
        "nazev": "🤖 Umělá inteligence a etika",
        "tagy": [
          "9. ročník",
          "informatika",
          "umělá inteligence",
          "etika",
          "chatbot",
          "dezinformace"
        ],
        "predmet": "inf",
        "rocniky": [
          9
        ]
      }
    ]
  },
  {
    "nazev": "🎴 Učení & opakování",
    "skupina": "dalsi",
    "polozky": [
      {
        "soubor": "obsah/typing_trainer.html",
        "nazev": "⌨️ Trenažér psaní",
        "tagy": [
          "psaní všemi deseti",
          "klávesnice"
        ]
      },
      {
        "soubor": "obsah/flashcards.html",
        "nazev": "🎴 Kartičky (flashcards)",
        "tagy": [
          "učení",
          "opakování",
          "sady"
        ]
      },
      {
        "soubor": "obsah/edu_progress.html",
        "nazev": "🏅 Studijní deník a odznaky",
        "tagy": [
          "pokrok",
          "gamifikace",
          "streak",
          "odznaky",
          "návyk"
        ]
      },
      {
        "soubor": "obsah/knihovna_sad.html",
        "nazev": "🗂️ Knihovna sad kartiček",
        "tagy": [
          "kartičky",
          "flashcards",
          "sady",
          "vyjmenovaná slova",
          "slovíčka",
          "letopočty",
          "ke stažení"
        ]
      }
    ]
  },
  {
    "nazev": "🎼 Hudba",
    "skupina": "dalsi",
    "polozky": [
      {
        "soubor": "obsah/music_theory.html",
        "nazev": "🎼 Hudební nauka",
        "tagy": [
          "hudba",
          "noty"
        ]
      },
      {
        "soubor": "obsah/notes_reading.html",
        "nazev": "🎼 Notová osnova – čtení not",
        "tagy": [
          "hudba",
          "noty",
          "houslový klíč",
          "solfeggio"
        ]
      }
    ]
  },
  {
    "nazev": "🖨️ Pro učitele",
    "skupina": "dalsi",
    "polozky": [
      {
        "soubor": "obsah/ucitel.html",
        "nazev": "🧑\u200d🏫 Kabinet učitele",
        "tagy": [
          "učitel",
          "hodina",
          "časovač",
          "stopky",
          "losování žáka",
          "náhodný žák",
          "skupiny",
          "rozdělení do skupin",
          "skóre týmů",
          "soutěž",
          "kostka",
          "hod kostkou",
          "k20",
          "mince",
          "panna nebo orel",
          "semafor hluku",
          "seznam třídy",
          "celá obrazovka",
          "okno pro třídu",
          "druhá obrazovka",
          "absence",
          "histogram",
          "pravděpodobnost",
          "jmenovky",
          "projektor"
        ]
      },
      {
        "soubor": "obsah/prezentace.html",
        "nazev": "🖥️ Tvorba slidů a prezentace",
        "tagy": [
          "prezentace",
          "slidy",
          "výklad",
          "projektor",
          "plátno",
          "interaktivní tabule",
          "promítání",
          "pero",
          "kreslení do slidu",
          "podklady k tisku",
          "handout",
          "poznámky učitele",
          "okno pro učitele",
          "aplikace ve slidu",
          "kvíz",
          "časovač ve slidu",
          "citát",
          "dva sloupce",
          "šablony hodin",
          "sestavení z textu",
          "zvýrazňovač",
          "klikátko",
          "pdf",
          "učitel"
        ]
      },
      {
        "soubor": "obsah/citation_generator.html",
        "nazev": "📚 Generátor citací",
        "tagy": [
          "citace",
          "bibliografie",
          "iso 690",
          "apa",
          "seminární práce",
          "zdroje"
        ]
      },
      {
        "soubor": "obsah/pracovni_listy.html",
        "nazev": "🖨️ Generátor pracovních listů",
        "tagy": [
          "tisk",
          "pdf",
          "pracovní list",
          "učitel",
          "škola",
          "násobilka",
          "sčítání",
          "zlomky",
          "rovnice",
          "pythagorova věta",
          "vyjmenovaná slova",
          "i/y",
          "bě pě vě mě",
          "shoda přísudku",
          "slovní druhy",
          "angličtina",
          "němčina",
          "slovíčka",
          "klíč řešení",
          "kód listu",
          "varianty A/B",
          "živý náhled",
          "obtížnost po tématech",
          "filtr podle ročníku",
          "filtr podle předmětu",
          "prvouka",
          "hodiny",
          "kalendář",
          "slabiky",
          "tvrdé a měkké souhlásky",
          "přírodopis",
          "lidské tělo",
          "fyzikální veličiny",
          "rychlost dráha čas",
          "dvojková soustava"
        ]
      }
    ]
  }
];

// Metadata vyuky: cil je konkretni dovednost, rozsah pilot neni potvrzeni pokryti RVP.
// Chybejici metadata znamenaji neposouzeno, nikoli chybejici vyuku.
const KATALOG_VYUKA = {
  "obsah/m4_zlomky_uvod.html": {
    "cil": "Přečtu a znázorním zlomek jako část celku.",
    "typy": [
      "vedeny-priklad",
      "model",
      "procvicovani"
    ],
    "predchozi": [
      "obsah/m3_deleni_zbytkem.html"
    ],
    "dalsi": [
      "obsah/m7_zlomky_operace.html",
      "obsah/procenta.html"
    ],
    "rozsah": "pilot",
    "vstupy": {
      "vyklad": "#plocha",
      "procvicovani": "?rezim=prectiZlomek#rezimy"
    }
  },
  "obsah/ch9_ph.html": {
    "cil": "Porovnám pH dvou roztoků a vysvětlím vyčíslenou neutralizaci.",
    "typy": [
      "vedeny-priklad",
      "model",
      "procvicovani"
    ],
    "predchozi": [
      "obsah/ch8_smesi.html"
    ],
    "dalsi": [
      "obsah/vycislovani_rovnic.html"
    ],
    "rozsah": "pilot",
    "vstupy": {
      "vyklad": "#vedena-aktivita",
      "procvicovani": "#procvicovani"
    }
  },
  "obsah/aj9_neprima_rec.html": {
    "cil": "Převyprávím sdělení podle mluvčího, adresáta, času a místa.",
    "typy": [
      "vedeny-priklad",
      "procvicovani"
    ],
    "predchozi": [
      "obsah/aj8_predpritomny.html"
    ],
    "dalsi": [
      "obsah/aj9_podminkove.html"
    ],
    "rozsah": "pilot",
    "vstupy": {
      "vyklad": "#vedena-aktivita",
      "procvicovani": "#procvicovani"
    }
  },
  "obsah/d6_prameny.html": {
    "cil": "Určím původ a účel pramene a doložím závěr jeho slovy.",
    "typy": [
      "vedeny-priklad",
      "badani",
      "procvicovani"
    ],
    "predchozi": [
      "obsah/casova_osa.html"
    ],
    "dalsi": [
      "obsah/d9_csr.html"
    ],
    "rozsah": "pilot",
    "vstupy": {
      "vyklad": "#vedena-aktivita",
      "procvicovani": "#procvicovani"
    }
  },
  "obsah/inf6_tabulky.html": {
    "cil": "Změním vstup buňky a vysvětlím přepočet vzorce.",
    "typy": [
      "vedeny-priklad",
      "model",
      "procvicovani"
    ],
    "predchozi": [
      "obsah/inf4_data.html"
    ],
    "dalsi": [
      "obsah/inf6_promenne.html"
    ],
    "rozsah": "pilot",
    "vstupy": {
      "vyklad": "#vedena-aktivita",
      "procvicovani": "#procvicovani"
    }
  }
};

// Cíl každé položky katalogu v první osobě („Po této lekci …“). Zobrazuje ho
// společná hlavička stránek (kostra.js). Popisuje to, co stránka umí dnes,
// ne plánovaný rozvoj z PODKLAD_STRANEK.md. U pilotů má přednost KATALOG_VYUKA.cil.
const KATALOG_CILE = {
  "obsah/cj1_pismena.html": "Rozložím krátké slovo na hlásky, složím ho zpátky a poznám první i poslední hlásku.",
  "obsah/cj2_tvrde_mekke.html": "Poznám tvrdou a měkkou souhlásku a podle ní doplním y, nebo i.",
  "obsah/cj2_abeceda.html": "Znám pořadí písmen v abecedě a seřadím slova podle abecedy.",
  "obsah/doplnovacky.html": "Doplním i/y po obojetné souhlásce ve vyjmenovaných a příbuzných slovech.",
  "obsah/diktat_gen.html": "Napíšu větu bez chyby v procvičovaném jevu a najdu místo chyby.",
  "obsah/cj3_parove.html": "Ověřím párovou souhlásku jiným tvarem slova a napíšu ji správně.",
  "obsah/vyjmenovana_slova.html": "Znám řady vyjmenovaných slov a doplním y ve slovech vyjmenovaných i příbuzných.",
  "obsah/shoda_podmetu.html": "Najdu podmět, určím jeho rod a podle něj doplním koncovku přísudku.",
  "obsah/cj8_prejata.html": "Napíšu a skloňuji běžná přejatá slova a vím, co znamenají a odkud pocházejí.",
  "obsah/cj9_prijimacky.html": "Vyzkouším si typové úlohy přijímací zkoušky z češtiny a zjistím, co dotrénovat.",
  "obsah/cj2_druhy_vet.html": "Poznám druh věty podle toho, co mluvčí chce, a napíšu správné znaménko na konec.",
  "obsah/slovni_druhy.html": "Určím slovní druh slova a poznám, zda je ohebný.",
  "obsah/cj3_slovesa.html": "Určím u slovesa osobu, číslo a čas a převedu ho do jiného času.",
  "obsah/cj3_podstatna.html": "Určím rod a číslo podstatného jména a převedu ho do množného čísla.",
  "obsah/cj4_pady.html": "Určím pád podstatného jména podle otázky a přiřadím slovo ke vzoru.",
  "obsah/synonyma_antonyma.html": "Najdu slovo stejného nebo opačného významu a poznám, jaký vztah mezi slovy je.",
  "obsah/cj4_stavba_slova.html": "Najdu kořen, předponu a příponu, poznám slova příbuzná a odliším předponu od předložky.",
  "obsah/cj5_pridavna.html": "Určím druh a vzor přídavného jména, doplním koncovku a přídavné jméno vystupňuji.",
  "obsah/cj5_skladebni_dvojice.html": "Najdu ve větě podmět a přísudek a poznám, zda k sobě patří.",
  "obsah/cj5_zajmena_cislovky.html": "Určím druh zájmena a číslovky a správně napíšu mě, nebo mně.",
  "obsah/vetny_rozbor.html": "Určím větné členy v jednoduché větě podle otázky, kterou se na ně ptám.",
  "obsah/cj6_slovni_zasoba.html": "Poznám vztahy mezi slovy a určím význam slova podle souvislosti.",
  "obsah/cj7_rozvijejici.html": "Určím předmět, přívlastek a příslovečné určení a najdu slovo, které rozvíjejí.",
  "obsah/cj7_neohebne.html": "Určím příslovce, předložku, spojku, částici a citoslovce ve větě.",
  "obsah/cj7_slovotvorba.html": "Poznám, zda slovo vzniklo odvozením, skládáním, nebo zkracováním, a určím jeho části.",
  "obsah/cj8_souveti.html": "Rozliším souvětí souřadné a podřadné, určím druh vedlejší věty a doplním čárky.",
  "obsah/cj9_vyvoj_jazyka.html": "Rozliším útvary češtiny, ukážu nářeční oblasti a vysvětlím, jak se jazyk měnil.",
  "obsah/slabiky.html": "Přečtu písmena, slabiky, slova a krátké věty.",
  "obsah/cteni_s_porozumenim.html": "Přečtu text a odpovím na otázky, jejichž odpověď v textu najdu, nebo ji z něj vyvodím.",
  "obsah/reading_log.html": "Vedu si záznam o přečtených knihách s hodnocením a poznámkami.",
  "obsah/cj6_baje.html": "Rozliším pohádku, pověst, báji a bajku a znám hlavní řecké bohy a hrdiny.",
  "obsah/cj9_literatura_20.html": "Přiřadím autora k dílu a zařadím ho do doby a literárního proudu 20. století.",
  "obsah/literarni_smery.html": "Přiřadím autora a dílo k literárnímu směru a směr k období.",
  "obsah/cj4_prima_rec.html": "Zapíšu přímou řeč se správnými uvozovkami a znaménky a odliším ji od nepřímé.",
  "obsah/cj8_sloh.html": "Poznám slohový útvar podle jeho znaků, stavby a jazykových prostředků.",
  "obsah/m1_porovnavani.html": "Porovnám čísla, doplním číselnou řadu a najdu číslo na číselné ose.",
  "obsah/pocitani.html": "Sčítám a odčítám do 20 a do 100.",
  "obsah/multiplication.html": "Násobím a dělím zpaměti v oboru malé násobilky.",
  "obsah/m3_deleni_zbytkem.html": "Vydělím se zbytkem a výsledek ověřím zkouškou.",
  "obsah/m4_pisemne_operace.html": "Písemně sčítám, odčítám a násobím a najdu chybu ve výpočtu.",
  "obsah/m4_pisemne_deleni.html": "Písemně dělím jednociferným i dvojciferným dělitelem a výsledek ověřím zkouškou.",
  "obsah/m4_zlomky_uvod.html": "Přečtu a znázorním zlomek jako část celku.",
  "obsah/roman_numerals.html": "Převedu číslo mezi arabským a římským zápisem.",
  "obsah/mental_math.html": "Pohotově počítám zpaměti a zjistím, které příklady mi dělají potíže.",
  "obsah/desetinna_cisla.html": "Sčítám, odčítám, porovnávám a zaokrouhluji desetinná čísla.",
  "obsah/m5_slovni_ulohy.html": "Rozhodnu, co ve slovní úloze spočítat nejdřív, odhadnu výsledek a úlohu vyřeším.",
  "obsah/fraction_calc.html": "Ověřím si výsledek početní operace se dvěma zlomky.",
  "obsah/m6_delitelnost.html": "Použiji znaky dělitelnosti, rozložím číslo na prvočinitele a spočítám NSD a NSN.",
  "obsah/m7_pomer.html": "Zkrátím poměr, rozdělím celek v poměru a počítám s měřítkem mapy.",
  "obsah/m7_cela_cisla.html": "Najdu celé číslo na ose, porovnám celá čísla a počítám s nimi.",
  "obsah/m7_zlomky_operace.html": "Krátím, rozšiřuji, sčítám, odčítám, násobím a dělím zlomky.",
  "obsah/procenta.html": "Vypočítám procentovou část, počet procent i základ a použiji trojčlenku.",
  "obsah/mocniny_odmocniny.html": "Znám druhé a třetí mocniny a druhé odmocniny běžných čísel.",
  "obsah/m9_prijimacky.html": "Vyzkouším si typové úlohy přijímací zkoušky z matematiky a zjistím, co dotrénovat.",
  "obsah/clock_learning.html": "Přečtu čas na ručičkových hodinách a nastavím zadaný čas.",
  "obsah/prevody_jednotek.html": "Převedu jednotky délky, hmotnosti, objemu a času.",
  "obsah/geo_tvary.html": "Poznám a pojmenuji základní rovinné útvary a tělesa.",
  "obsah/m2_geo_zaklady.html": "Rozliším bod, přímku, polopřímku a úsečku, změřím úsečku a narýsuji ji.",
  "obsah/m4_obvod_obsah.html": "Vypočítám obvod a obsah čtverce a obdélníku.",
  "obsah/m4_soumernost.html": "Poznám osově souměrný útvar, určím počet os a dokreslím útvar podle osy.",
  "obsah/m5_site_teles.html": "Poznám síť krychle a určím počet stěn, hran a vrcholů tělesa.",
  "obsah/geometricke_konstrukce.html": "Provedu geometrickou konstrukci kružítkem a pravítkem podle postupu.",
  "obsah/geometrie_vzorce.html": "Vyberu vzorec pro obvod, obsah nebo objem a dosadím do něj.",
  "obsah/m6_uhly.html": "Určím druh úhlu, změřím a nastavím jeho velikost a počítám s úhly.",
  "obsah/m6_krychle_kvadr.html": "Vypočítám povrch a objem krychle a kvádru.",
  "obsah/m6_trojuhelnik.html": "Určím druh trojúhelníku a rozhodnu, zda ho lze sestrojit.",
  "obsah/m7_shodnost.html": "Použiji věty sss, sus a usu k určení shodnosti trojúhelníků.",
  "obsah/m7_ctyruhelniky.html": "Poznám druhy čtyřúhelníků, spočítám jejich obvod a obsah a povrch a objem hranolu.",
  "obsah/m8_kruh.html": "Vypočítám obvod a obsah kruhu a pojmenuji části kruhu a kružnice.",
  "obsah/m8_pythagoras.html": "Použiji Pythagorovu větu k výpočtu strany pravoúhlého trojúhelníku.",
  "obsah/m8_valec.html": "Popíšu síť válce a vypočítám jeho povrch a objem.",
  "obsah/trigonometrie.html": "Vypočítám stranu pravoúhlého trojúhelníku pomocí sinu, kosinu a tangenty.",
  "obsah/m9_podobnost.html": "Určím poměr podobnosti a dopočítám délky podobných útvarů.",
  "obsah/m9_jehlan_kuzel.html": "Vypočítám objem a povrch jehlanu, kužele a koule.",
  "obsah/rovnice.html": "Vyřeším lineární rovnici ekvivalentními úpravami.",
  "obsah/m8_vyrazy.html": "Roznásobím závorku, vytknu před závorku a použiji vzorce pro druhou mocninu.",
  "obsah/grafy_funkci.html": "Popíšu, jak parametry mění graf funkce.",
  "obsah/m9_lomene_vyrazy.html": "Určím podmínky lomeného výrazu a upravím ho.",
  "obsah/m9_soustavy.html": "Vyřeším soustavu dvou lineárních rovnic a řešení ukážu v grafu.",
  "obsah/m5_prumer.html": "Vypočítám aritmetický průměr a doplním chybějící hodnotu.",
  "obsah/m7_umernost.html": "Rozliším přímou a nepřímou úměrnost a vyřeším úlohu trojčlenkou.",
  "obsah/m8_statistika.html": "Určím průměr, medián a modus a přečtu údaje z diagramu.",
  "obsah/kombinatorika.html": "Spočítám počet možností a pravděpodobnost jednoduchého jevu.",
  "obsah/m9_financni.html": "Spočítám úrok, porovnám půjčky a sestavím jednoduchý rozpočet.",
  "obsah/aj_slovicka.html": "Pojmenuji anglicky běžné věci a zvířata.",
  "obsah/aj3_pozdravy.html": "Pozdravím anglicky podle denní doby, odpovím a představím se.",
  "obsah/aj_slovesa.html": "Znám tři tvary nepravidelných anglických sloves.",
  "obsah/de_slovicka.html": "Znám základní německá slovíčka se členem.",
  "obsah/fr_slovicka.html": "Znám základní francouzská slovíčka se členem.",
  "obsah/dcj8_cislovky_cas.html": "Řeknu číslo a čas německy i francouzsky.",
  "obsah/aj3_abeceda.html": "Vyjmenuji anglickou abecedu a vyhláskuji slovo.",
  "obsah/aj4_pritomny_prosty.html": "Utvořím oznamovací větu, otázku a zápor v přítomném čase prostém.",
  "obsah/aj4_predlozky.html": "Popíšu polohu předmětu a čas anglickými předložkami.",
  "obsah/aj4_mnozne_cislo.html": "Utvořím anglické množné číslo a zvolím člen a, nebo an.",
  "obsah/casovani_sloves.html": "Vyčasuji sloveso v přítomném čase v angličtině, němčině a francouzštině.",
  "obsah/aj5_pritomny_prubehovy.html": "Popíšu, co se právě děje, a odliším průběhový čas od prostého.",
  "obsah/aj5_modalni.html": "Použiji can, can't, must a mustn't ve správném tvaru a významu.",
  "obsah/aj6_minuly_cas.html": "Utvořím minulý čas prostý včetně nepravidelných sloves, otázky a záporu.",
  "obsah/aj6_stupnovani.html": "Vystupňuji anglické přídavné jméno a porovnám jím dvě věci.",
  "obsah/aj7_budouci.html": "Zvolím will, nebo going to podle toho, zda jde o rozhodnutí, plán, nebo předpověď.",
  "obsah/aj7_pocitatelnost.html": "Rozliším počitatelná a nepočitatelná podstatná jména a vyjádřím množství.",
  "obsah/dcj7_cleny.html": "Přiřadím německému a francouzskému podstatnému jménu správný člen.",
  "obsah/dcj7_vyslovnost.html": "Přečtu typické skupiny hlásek v němčině a francouzštině a vyhláskuji slovo.",
  "obsah/dcj8_casovani.html": "Vyčasuji pravidelné sloveso v němčině a francouzštině.",
  "obsah/aj8_predpritomny.html": "Utvořím předpřítomný čas a odliším ho od minulého.",
  "obsah/aj8_trpny_rod.html": "Převedu větu do trpného rodu a vím, kdy ho použít.",
  "obsah/dcj9_minuly.html": "Utvořím německé perfektum a francouzské passé composé se správným pomocným slovesem.",
  "obsah/aj9_neprima_rec.html": "Převyprávím sdělení podle mluvčího, adresáta, času a místa.",
  "obsah/aj9_podminkove.html": "Rozliším nultý, první a druhý kondicionál a utvořím podmínkovou větu.",
  "obsah/prv1_rodina.html": "Pojmenuji členy rodiny a řeknu, co se dělá v které části domova.",
  "obsah/prv1_cesta_skola.html": "Poznám nebezpečná místa na cestě do školy a vím, kdy smím přejít.",
  "obsah/prv2_zdravi.html": "Vím, komu zavolat o pomoc a co udělat při drobném úrazu.",
  "obsah/prv5_zdravy_styl.html": "Rozliším zdravější a méně zdravé potraviny a sestavím rozumný režim dne.",
  "obsah/prv1_rocni_obdobi.html": "Vyjmenuji roční období, měsíce a dny v týdnu ve správném pořadí.",
  "obsah/prv1_smysly.html": "Pojmenuji části těla a přiřadím smysl ke správnému orgánu.",
  "obsah/prv2_zvirata.html": "Rozliším domácí a volně žijící zvířata a přiřadím mláďata a příbytky.",
  "obsah/prv3_ziva_neziva.html": "Rozliším živou a neživou přírodu podle znaků života.",
  "obsah/prv3_voda_vzduch.html": "Popíšu skupenství vody, koloběh vody a vlastnosti vzduchu a půdy.",
  "obsah/prv4_ekosystemy.html": "Přiřadím organismus k ekosystému a sestavím potravní řetězec.",
  "obsah/prv4_horniny.html": "Poznám běžné horniny a nerosty podle vlastností a vím, k čemu slouží.",
  "obsah/prv5_energie.html": "Rozliším obnovitelné a neobnovitelné zdroje energie a popíšu cestu elektřiny.",
  "obsah/prv3_obec.html": "Určím světové strany, orientuji se v plánu obce a znám kraje a jejich města.",
  "obsah/prv4_nejstarsi_dejiny.html": "Seřadím nejstarší české dějiny a poznám hlavní postavy a pověsti.",
  "obsah/prv4_mapy_smery.html": "Přečtu mapové značky, určím směr a použiji měřítko mapy.",
  "obsah/prv5_statni_symboly.html": "Poznám státní symboly, rozliším tři moci ve státě a znám státní svátky.",
  "obsah/prv5_dejiny_20.html": "Seřadím hlavní události našich dějin 20. století a přiřadím k nim osobnosti.",
  "obsah/f6_hustota.html": "Vypočítám hustotu, hmotnost a objem a předpovím, zda těleso plave.",
  "obsah/physics_ref.html": "Najdu fyzikální vzorec a sleduji, jak výsledek závisí na veličinách.",
  "obsah/f6_mereni.html": "Zvolím jednotku a měřidlo, převedu jednotky a odečtu hodnotu ze stupnice.",
  "obsah/physics_playground.html": "Pozoruji kyvadlo, nakloněnou rovinu a srážky a sleduji síly a energii.",
  "obsah/f6_vlastnosti_latek.html": "Rozliším látku a těleso, popíšu skupenství částicovým modelem a vysvětlím plavání těles.",
  "obsah/paka.html": "Najdu rovnováhu na páce a vysvětlím, co ušetří kladka a ozubený převod.",
  "obsah/vrtacka_lis.html": "Vysvětlím, jak hydraulický lis znásobí sílu a proč vrtání závisí na materiálu a otáčkách.",
  "obsah/gravitacni_hriste2.html": "Pozoruji, jak se tělesa navzájem přitahují a obíhají společné těžiště.",
  "obsah/f7_tlak.html": "Vypočítám tlak a vysvětlím hydrostatický tlak, Pascalův zákon a plavání těles.",
  "obsah/gravitacni_hriste.html": "Vypouštím tělesa kolem Slunce a pozoruji oběžné dráhy a Keplerovy zákony.",
  "obsah/f7_pohyb.html": "Vypočítám dráhu, rychlost a čas, převedu jednotky rychlosti a přečtu graf pohybu.",
  "obsah/proudove_motory.html": "Popíšu, jak proudí vzduch proudovým motorem a jak se mění jeho rychlost, teplota a tlak.",
  "obsah/vitr_tunel.html": "Pozoruji, jak tvar překážky mění proudění vzduchu, a hledám víry a závětří.",
  "obsah/f7_sila.html": "Složím síly, určím gravitační sílu a těžiště a použiji Newtonovy zákony.",
  "obsah/elektrina.html": "Použiji Ohmův zákon, porovnám sériové a paralelní zapojení a pozoruji magnetické pole.",
  "obsah/f8_teplo.html": "Vypočítám teplo, přečtu graf ohřevu a popíšu změny skupenství.",
  "obsah/vodni_hladina.html": "Pozoruji šíření a skládání vln na hladině a vznik přílivu a odlivu.",
  "obsah/optika_lekce.html": "Vysvětlím odraz, lom a rozklad světla, najdu obraz vytvořený čočkou a řeknu, jaké brýle pomohou krátkozrakému a dalekozrakému oku.",
  "obsah/optika.html": "Pozoruji odraz a lom světla a zobrazení čočkou a zrcadlem.",
  "obsah/optika_soustava.html": "Vysvětlím, jak optický přístroj vytvoří obraz, a sestavím vlastní soustavu.",
  "obsah/f8_prace_energie.html": "Vypočítám práci, výkon a energii a popíšu přeměny energie.",
  "obsah/f9_jaderna.html": "Vysvětlím štěpení jádra, řetězovou reakci, poločas rozpadu a princip jaderné elektrárny.",
  "obsah/f9_zvuk.html": "Přečtu zvukovou vlnu, spočítám vzdálenost z ozvěny a rozliším výšku a hlasitost tónu.",
  "obsah/f9_stridavy_proud.html": "Popíšu cestu elektřiny do zásuvky, funkci transformátoru a zásady bezpečnosti.",
  "obsah/star_map.html": "Najdu jasné hvězdy a souhvězdí na obloze pro zvolené místo a čas.",
  "obsah/pohyb_vesmirem.html": "Pozoruji, jak tvar dráhy tělesa závisí na tom, odkud pohyb sleduji.",
  "obsah/planet_globe.html": "Porovnám velikosti těles sluneční soustavy a prohlédnu si jejich povrch.",
  "obsah/sky_events.html": "Najdu data meteorických rojů, slunovratů, rovnodenností a fází Měsíce.",
  "obsah/solar_system.html": "Popíšu stavbu sluneční soustavy a vysvětlím fáze Měsíce a roční období.",
  "obsah/iss.html": "Sleduji polohu ISS v reálném čase a vím, kdy na ní je den a noc.",
  "obsah/ch8_bezpecnost.html": "Poznám výstražné symboly, znám pravidla laboratoře a první pomoc při úrazu.",
  "obsah/chem_nazvoslovi.html": "Odvodím vzorec z názvu a název ze vzorce podle oxidačních čísel.",
  "obsah/ch8_atom.html": "Určím počty protonů, neutronů a elektronů a vysvětlím vznik chemické vazby.",
  "obsah/periodic_table.html": "Vyhledám prvek v periodické tabulce a přečtu jeho údaje.",
  "obsah/ch8_voda_vzduch.html": "Popíšu složení vzduchu, úpravu pitné vody a příčiny znečištění.",
  "obsah/ch8_smesi.html": "Rozliším druhy směsí, zvolím způsob oddělení a vypočítám hmotnostní zlomek.",
  "obsah/vycislovani_rovnic.html": "Vyčíslím chemickou rovnici tak, aby počty atomů souhlasily.",
  "obsah/ch9_zivotni_prostredi.html": "Správně třídím odpad a popíšu vliv paliv a emisí na životní prostředí.",
  "obsah/ch9_prirodni_latky.html": "Přiřadím potraviny k živinám a porovnám jejich energii.",
  "obsah/ch9_redoxni.html": "Určím oxidační čísla, poznám oxidaci a redukci a popíšu elektrolýzu a článek.",
  "obsah/ch9_uhlovodiky.html": "Pojmenuji jednoduché uhlovodíky, rozliším typy vazeb a popíšu zpracování ropy.",
  "obsah/ch9_ph.html": "Porovnám pH dvou roztoků a vysvětlím vyčíslenou neutralizaci.",
  "obsah/ch9_derivaty.html": "Poznám funkční skupinu a přiřadím k ní třídu derivátů a jejich použití.",
  "obsah/potravni_retezec.html": "Sestavím potravní řetězec, určím producenta a konzumenty a předpovím, co způsobí zmizení jednoho článku.",
  "obsah/pr6_houby.html": "Popíšu stavbu houby, rozliším lišejníky a poznám známé jedlé a jedovaté houby podle znaků.",
  "obsah/pr6_bezobratli.html": "Zařadím bezobratlého živočicha do kmene podle stavby těla.",
  "obsah/bunka.html": "Pojmenuji části buňky, vím, co dělají, a porovnám rostlinnou a živočišnou buňku.",
  "obsah/pr6_clenovci.html": "Zařadím členovce do třídy podle počtu nohou a popíšu proměnu hmyzu.",
  "obsah/pr6_mikroorganismy.html": "Rozliším virus a bakterii a vím, jak se chránit před nákazou.",
  "obsah/pr7_rostliny.html": "Pojmenuji orgány rostliny a jejich funkce a vysvětlím fotosyntézu a dýchání.",
  "obsah/pr7_obratlovci_studenokrevni.html": "Porovnám stavbu těla a dýchání ryb, obojživelníků a plazů.",
  "obsah/pr7_ptaci_savci.html": "Vysvětlím, jak zobák, končetiny a chrup souvisejí s potravou a způsobem života.",
  "obsah/pr8_rozmnozovani.html": "Popíšu rozmnožovací soustavu, vývoj před narozením a etapy lidského života.",
  "obsah/pr8_prvni_pomoc.html": "Zavolám pomoc a vím, jak postupovat při úrazu a při resuscitaci.",
  "obsah/anatomie.html": "Najdu hlavní orgány lidského těla, pojmenuji je a popíšu, jak soustavy spolupracují.",
  "obsah/pr9_ekologie.html": "Vysvětlím vztahy v ekosystému, tok energie a oběh látek a posoudím dopad zásahu.",
  "obsah/pr9_geologicke_deje.html": "Popíšu pohyb litosférických desek, vznik sopek a zemětřesení a vnější geologické děje.",
  "obsah/pr9_mineraly.html": "Poznám minerál podle vlastností a zařadím horninu podle vzniku.",
  "obsah/pr9_vyvoj_zeme.html": "Seřadím geologická období a popíšu, jak se vyvíjel život na Zemi.",
  "obsah/punnett.html": "Sestavím Punnettův čtverec a určím poměr genotypů a fenotypů potomků.",
  "obsah/z6_atmosfera.html": "Rozliším počasí a podnebí, popíšu vrstvy atmosféry a podnebné pásy.",
  "obsah/z6_hydrosfera.html": "Popíšu složky hydrosféry a koloběh vody a znám oceány a velké řeky.",
  "obsah/z6_planeta_zeme.html": "Vysvětlím, proč se střídá den a noc a roční období.",
  "obsah/z6_mapa_souradnice.html": "Určím zeměpisné souřadnice, použiji měřítko a vyberu vhodnou mapu.",
  "obsah/eduMaps.html": "Vyberu mapovou lekci nebo aktivitu podle toho, co chci s mapou procvičit.",
  "obsah/z6_litosfera.html": "Popíšu stavbu Země a vysvětlím, jak vnitřní a vnější děje tvarují povrch.",
  "obsah/z7_afrika.html": "Ukážu státy a přírodní útvary Afriky a popíšu její přírodu a hospodářství.",
  "obsah/svetova_hlavni_mesta.html": "Znám hlavní města států světa.",
  "obsah/z7_amerika.html": "Ukážu státy a přírodní útvary Ameriky a popíšu její přírodu a hospodářství.",
  "obsah/z7_asie.html": "Ukážu státy a přírodní útvary Asie a popíšu její přírodu a hospodářství.",
  "obsah/flags_quiz.html": "Poznám vlajky států a jejich hlavní města.",
  "obsah/z7_australie_oceanie.html": "Ukážu města a přírodní útvary Austrálie a Oceánie a popíšu polární oblasti.",
  "obsah/z8_cr_prirodni.html": "Ukážu pohoří a řeky Česka, určím úmoří a popíšu podnebí.",
  "obsah/z8_evropa_regiony.html": "Ukážu státy Evropy, zařadím je do regionů a popíšu jejich hospodářství.",
  "obsah/reky_pohori.html": "Poznám hlavní řeky a pohoří Česka a vím, do kterého moře odvádějí vodu.",
  "obsah/z8_cr_hospodarstvi.html": "Ukážu krajská města a popíšu obyvatelstvo a hospodářství Česka.",
  "obsah/slepa_mapa_evropa.html": "Najdu na slepé mapě evropské státy.",
  "obsah/slepa_mapa.html": "Najdu na slepé mapě kraje a krajská města Česka.",
  "obsah/z9_hospodarstvi_svet.html": "Popíšu sektory hospodářství, světová hospodářská centra a obchodní cesty.",
  "obsah/z9_obyvatelstvo.html": "Popíšu rozmístění obyvatel, velkoměsta světa a příčiny migrace.",
  "obsah/z9_globalni_problemy.html": "Popíšu globální problémy, jejich příčiny a možná řešení.",
  "obsah/d6_recko.html": "Popíšu městské státy starověkého Řecka, athénskou demokracii a řeckou kulturu.",
  "obsah/d6_rim.html": "Popíšu vývoj Říma od království po císařství a jeho stavby a osobnosti.",
  "obsah/d6_stary_orient.html": "Vysvětlím, proč první státy vznikly u velkých řek, a znám jejich stavby a panovníky.",
  "obsah/historicke_mapy_odkazy.html": "Najdu historickou mapu ve sbírce a porovnám místo tehdy a dnes.",
  "obsah/svetove_dejiny.html": "Zařadím hlavní události světových dějin na časovou osu.",
  "obsah/d6_prameny.html": "Určím původ a účel pramene a doložím závěr jeho slovy.",
  "obsah/d6_pravek.html": "Popíšu období pravěku a vývoj člověka a vysvětlím význam zemědělství.",
  "obsah/d7_rany_stredovek.html": "Popíšu příchod Slovanů, Sámovu říši a Velkou Moravu a ukážu hradiště na mapě.",
  "obsah/d7_husitstvi.html": "Popíšu příčiny, průběh a osobnosti husitství a ukážu bitvy na mapě.",
  "obsah/d7_lucemburkove.html": "Popíšu vládu Lucemburků a stavby Karla IV. v Praze.",
  "obsah/d7_premyslovci.html": "Seřadím přemyslovské panovníky a přiřadím k nim důležité události.",
  "obsah/casova_osa.html": "Přiřadím klíčové události českých dějin k letopočtům.",
  "obsah/d8_objevy_renesance.html": "Popíšu zámořské objevy, jejich důsledky a znaky renesance.",
  "obsah/d8_prumyslova_revoluce.html": "Popíšu průmyslovou revoluci a národní obrození a jejich osobnosti.",
  "obsah/d8_osvicenstvi.html": "Popíšu osvícenské myšlenky, reformy Marie Terezie a Josefa II. a francouzskou revoluci.",
  "obsah/d8_reformace.html": "Popíšu reformaci a průběh a důsledky třicetileté války.",
  "obsah/eu_instituce.html": "Rozliším hlavní instituce Evropské unie, jejich úkoly a sídla.",
  "obsah/d9_prvni_valka.html": "Popíšu příčiny, průběh a důsledky první světové války.",
  "obsah/d9_csr.html": "Popíšu vznik Československa a život první republiky až po Mnichov.",
  "obsah/d9_druha_valka.html": "Popíšu průběh druhé světové války, život v protektorátu, odboj a holokaust.",
  "obsah/d9_studena_valka.html": "Popíšu rozdělení světa za studené války a Československo v letech 1948–1989.",
  "obsah/inf4_sekvence.html": "Sestavím posloupnost příkazů, která dovede robota k cíli, a najdu chybu v programu.",
  "obsah/inf5_cykly.html": "Zkrátím program cyklem, doplním podmínku a určím, kolikrát se příkaz provede.",
  "obsah/inf6_promenne.html": "Sleduji hodnotu proměnné v programu a předpovím, co program vypíše.",
  "obsah/inf7_funkce.html": "Poznám, co funkce udělá, a zvolím správné volání s parametry.",
  "obsah/eduSort.html": "Sleduji, jak pracují algoritmy řazení, a porovnám jejich rychlost.",
  "obsah/inf9_model_simulace.html": "Měním parametry modelu populace a porovnám model se skutečností.",
  "obsah/inf4_data.html": "Zakóduji obrázek čísly a zapíšu číslo ve dvojkové soustavě.",
  "obsah/morse_code.html": "Převedu text do Morseovy abecedy a zpět a poslechnu si ho.",
  "obsah/inf6_tabulky.html": "Změním vstup buňky a vysvětlím přepočet vzorce.",
  "obsah/inf7_site.html": "Popíšu cestu dat sítí a pojmenuji prvky sítě.",
  "obsah/inf7_sifrovani.html": "Zašifruji a rozluštím zprávu Caesarovou šifrou a rozliším šifrování, kódování a kompresi.",
  "obsah/inf8_databaze.html": "Filtruji a řadím záznamy a navrhnu tabulku databáze.",
  "obsah/inf4_hardware.html": "Pojmenuji části počítače, rozliším vstupní a výstupní zařízení a vytvořím bezpečné heslo.",
  "obsah/inf5_zdroje.html": "Posoudím, zda se dá informaci na internetu věřit, a vím, jak si ji ověřit.",
  "obsah/inf6_digitalni_stopa.html": "Odhadnu, co o sobě prozradím na internetu, a vím, jak se zachovat v nepříjemné situaci.",
  "obsah/inf8_licence.html": "Rozhodnu, zda smím dílo použít, a správně ho ocituji podle licence.",
  "obsah/AI_prednaska.html": "Vysvětlím, co je umělá inteligence, jak funguje a kde se používá.",
  "obsah/inf9_ai_etika.html": "Vysvětlím, jak AI funguje a kde chybuje, a používám ji zodpovědně.",
  "obsah/typing_trainer.html": "Píšu na klávesnici všemi deseti a sleduji svou rychlost a přesnost.",
  "obsah/flashcards.html": "Opakuji si pojmy na kartičkách v rozložených intervalech.",
  "obsah/edu_progress.html": "Vidím, co už mám procvičené a co si mám zopakovat.",
  "obsah/knihovna_sad.html": "Najdu hotovou sadu kartiček k tématu, které se učím.",
  "obsah/music_theory.html": "Sestavím stupnici a akord a poslechnu si je.",
  "obsah/notes_reading.html": "Přečtu noty v houslovém klíči.",
  "obsah/ucitel.html": "Mám na jednom místě přípravu hodiny i nástroje pro její průběh.",
  "obsah/prezentace.html": "Připravím a promítnu výklad se slidy a vloženými aplikacemi.",
  "obsah/citation_generator.html": "Správně ocituji knihu, článek i webovou stránku.",
  "obsah/pracovni_listy.html": "Připravím a vytisknu pracovní list k tématu ve více variantách s řešením."
};

// Rodiny témat: stránky na stejné téma kolem jedné hlavní lekce.
// `cesta` je doporučené pořadí (napříč ročníky); každá stránka patří nejvýš
// do jedné rodiny. Nástroje bez tématu (kartičky, kabinet…) v rodinách nejsou.
const KATALOG_RODINY = [
  {
    "id": "cteni",
    "nazev": "První čtení a psaní",
    "popis": "Od hlásek a písmen ke slabikám, abecedě a porozumění textu.",
    "hlavni": "obsah/cj1_pismena.html",
    "cesta": [
      "obsah/cj1_pismena.html",
      "obsah/slabiky.html",
      "obsah/cj2_abeceda.html",
      "obsah/cteni_s_porozumenim.html"
    ]
  },
  {
    "id": "pravopis-iy",
    "nazev": "Pravopis i/y",
    "popis": "Tvrdé a měkké souhlásky, vyjmenovaná slova, párové souhlásky a diktát nad stejnou sadou slov.",
    "hlavni": "obsah/vyjmenovana_slova.html",
    "cesta": [
      "obsah/cj2_tvrde_mekke.html",
      "obsah/vyjmenovana_slova.html",
      "obsah/doplnovacky.html",
      "obsah/cj3_parove.html",
      "obsah/diktat_gen.html"
    ]
  },
  {
    "id": "slovni-druhy",
    "nazev": "Slovní druhy a tvary slov",
    "popis": "Podstatná jména, slovesa, pády, přídavná jména, zájmena, číslovky a neohebná slova.",
    "hlavni": "obsah/slovni_druhy.html",
    "cesta": [
      "obsah/cj3_podstatna.html",
      "obsah/cj3_slovesa.html",
      "obsah/slovni_druhy.html",
      "obsah/cj4_pady.html",
      "obsah/cj5_pridavna.html",
      "obsah/cj5_zajmena_cislovky.html",
      "obsah/cj7_neohebne.html"
    ]
  },
  {
    "id": "veta",
    "nazev": "Věta a souvětí",
    "popis": "Druhy vět, skladební dvojice, shoda, rozvíjející členy, rozbor věty a souvětí.",
    "hlavni": "obsah/cj5_skladebni_dvojice.html",
    "cesta": [
      "obsah/cj2_druhy_vet.html",
      "obsah/cj4_prima_rec.html",
      "obsah/cj5_skladebni_dvojice.html",
      "obsah/shoda_podmetu.html",
      "obsah/cj7_rozvijejici.html",
      "obsah/vetny_rozbor.html",
      "obsah/cj8_souveti.html"
    ]
  },
  {
    "id": "slovo-vyznam",
    "nazev": "Slovo a jeho význam",
    "popis": "Stavba slova, tvoření slov, vztahy mezi slovy, přejatá slova a vývoj jazyka.",
    "hlavni": "obsah/cj6_slovni_zasoba.html",
    "cesta": [
      "obsah/synonyma_antonyma.html",
      "obsah/cj4_stavba_slova.html",
      "obsah/cj6_slovni_zasoba.html",
      "obsah/cj7_slovotvorba.html",
      "obsah/cj8_prejata.html",
      "obsah/cj9_vyvoj_jazyka.html"
    ]
  },
  {
    "id": "literatura",
    "nazev": "Literatura a sloh",
    "popis": "Čtenářský deník, literární žánry, slohové útvary, směry a literatura 20. století.",
    "hlavni": "obsah/literarni_smery.html",
    "cesta": [
      "obsah/reading_log.html",
      "obsah/cj6_baje.html",
      "obsah/cj8_sloh.html",
      "obsah/literarni_smery.html",
      "obsah/cj9_literatura_20.html"
    ]
  },
  {
    "id": "prijimacky",
    "nazev": "Přijímací zkoušky",
    "popis": "Typové úlohy jednotné přijímací zkoušky z češtiny a matematiky.",
    "hlavni": "obsah/cj9_prijimacky.html",
    "cesta": [
      "obsah/cj9_prijimacky.html",
      "obsah/m9_prijimacky.html"
    ]
  },
  {
    "id": "cisla",
    "nazev": "Čísla a počítání",
    "popis": "Od porovnávání a sčítání přes násobilku a písemné počítání k celým číslům a mocninám.",
    "hlavni": "obsah/m1_porovnavani.html",
    "cesta": [
      "obsah/m1_porovnavani.html",
      "obsah/pocitani.html",
      "obsah/multiplication.html",
      "obsah/m3_deleni_zbytkem.html",
      "obsah/m4_pisemne_operace.html",
      "obsah/m4_pisemne_deleni.html",
      "obsah/mental_math.html",
      "obsah/roman_numerals.html",
      "obsah/m5_slovni_ulohy.html",
      "obsah/m6_delitelnost.html",
      "obsah/m7_cela_cisla.html",
      "obsah/mocniny_odmocniny.html"
    ]
  },
  {
    "id": "zlomky",
    "nazev": "Zlomky, procenta a peníze",
    "popis": "Část celku jako zlomek, desetinné číslo, poměr a procento až po finanční matematiku.",
    "hlavni": "obsah/m4_zlomky_uvod.html",
    "cesta": [
      "obsah/m4_zlomky_uvod.html",
      "obsah/m7_zlomky_operace.html",
      "obsah/fraction_calc.html",
      "obsah/desetinna_cisla.html",
      "obsah/m7_pomer.html",
      "obsah/procenta.html",
      "obsah/m9_financni.html"
    ]
  },
  {
    "id": "algebra",
    "nazev": "Výrazy, rovnice a funkce",
    "popis": "Úpravy výrazů, lineární rovnice, úměrnost, grafy funkcí a soustavy rovnic.",
    "hlavni": "obsah/rovnice.html",
    "cesta": [
      "obsah/m8_vyrazy.html",
      "obsah/rovnice.html",
      "obsah/m7_umernost.html",
      "obsah/grafy_funkci.html",
      "obsah/m9_soustavy.html",
      "obsah/m9_lomene_vyrazy.html"
    ]
  },
  {
    "id": "geometrie",
    "nazev": "Geometrie v rovině",
    "popis": "Od bodu a úsečky přes úhly a trojúhelníky ke konstrukcím, podobnosti a trigonometrii.",
    "hlavni": "obsah/m6_trojuhelnik.html",
    "cesta": [
      "obsah/m2_geo_zaklady.html",
      "obsah/m4_obvod_obsah.html",
      "obsah/m4_soumernost.html",
      "obsah/m6_uhly.html",
      "obsah/m6_trojuhelnik.html",
      "obsah/geometricke_konstrukce.html",
      "obsah/m7_shodnost.html",
      "obsah/m7_ctyruhelniky.html",
      "obsah/m8_kruh.html",
      "obsah/m8_pythagoras.html",
      "obsah/m9_podobnost.html",
      "obsah/trigonometrie.html",
      "obsah/geometrie_vzorce.html"
    ]
  },
  {
    "id": "telesa",
    "nazev": "Tělesa",
    "popis": "Poznávání těles, sítě, povrch a objem od krychle po kouli.",
    "hlavni": "obsah/m6_krychle_kvadr.html",
    "cesta": [
      "obsah/geo_tvary.html",
      "obsah/m5_site_teles.html",
      "obsah/m6_krychle_kvadr.html",
      "obsah/m8_valec.html",
      "obsah/m9_jehlan_kuzel.html"
    ]
  },
  {
    "id": "data",
    "nazev": "Data a pravděpodobnost",
    "popis": "Průměr, statistické charakteristiky, diagramy a pravděpodobnost.",
    "hlavni": "obsah/m8_statistika.html",
    "cesta": [
      "obsah/m5_prumer.html",
      "obsah/m8_statistika.html",
      "obsah/kombinatorika.html"
    ]
  },
  {
    "id": "mereni",
    "nazev": "Měření a jednotky",
    "popis": "Čas, jednotky a jejich převody, měřidla a fyzikální vzorce.",
    "hlavni": "obsah/f6_mereni.html",
    "cesta": [
      "obsah/clock_learning.html",
      "obsah/prevody_jednotek.html",
      "obsah/f6_mereni.html",
      "obsah/physics_ref.html"
    ]
  },
  {
    "id": "aj-zaklady",
    "nazev": "Angličtina – základy",
    "popis": "Abeceda, pozdravy, slovíčka, množné číslo, předložky, modální slovesa a stupňování.",
    "hlavni": "obsah/aj_slovicka.html",
    "cesta": [
      "obsah/aj3_abeceda.html",
      "obsah/aj3_pozdravy.html",
      "obsah/aj_slovicka.html",
      "obsah/aj4_mnozne_cislo.html",
      "obsah/aj4_predlozky.html",
      "obsah/aj5_modalni.html",
      "obsah/aj6_stupnovani.html",
      "obsah/aj7_pocitatelnost.html"
    ]
  },
  {
    "id": "aj-casy",
    "nazev": "Anglické slovesné časy",
    "popis": "Přítomné, minulé a budoucí časy, předpřítomný čas, trpný rod, podmínky a nepřímá řeč.",
    "hlavni": "obsah/aj4_pritomny_prosty.html",
    "cesta": [
      "obsah/aj4_pritomny_prosty.html",
      "obsah/aj5_pritomny_prubehovy.html",
      "obsah/aj6_minuly_cas.html",
      "obsah/aj_slovesa.html",
      "obsah/aj7_budouci.html",
      "obsah/aj8_predpritomny.html",
      "obsah/aj8_trpny_rod.html",
      "obsah/aj9_podminkove.html",
      "obsah/aj9_neprima_rec.html",
      "obsah/casovani_sloves.html"
    ]
  },
  {
    "id": "dcj",
    "nazev": "Němčina a francouzština",
    "popis": "Výslovnost, členy a rod, slovíčka, časování, číslovky a minulý čas.",
    "hlavni": "obsah/dcj7_cleny.html",
    "cesta": [
      "obsah/dcj7_vyslovnost.html",
      "obsah/dcj7_cleny.html",
      "obsah/de_slovicka.html",
      "obsah/fr_slovicka.html",
      "obsah/dcj8_casovani.html",
      "obsah/dcj8_cislovky_cas.html",
      "obsah/dcj9_minuly.html"
    ]
  },
  {
    "id": "obec-stat",
    "nazev": "Domov, obec a stát",
    "popis": "Rodina a domov, cesta do školy, obec a kraj, státní symboly a Evropská unie.",
    "hlavni": "obsah/prv3_obec.html",
    "cesta": [
      "obsah/prv1_rodina.html",
      "obsah/prv1_cesta_skola.html",
      "obsah/prv3_obec.html",
      "obsah/prv5_statni_symboly.html",
      "obsah/eu_instituce.html"
    ]
  },
  {
    "id": "sfery",
    "nazev": "Voda, vzduch a počasí",
    "popis": "Voda, vzduch a půda, hydrosféra a atmosféra.",
    "hlavni": "obsah/z6_hydrosfera.html",
    "cesta": [
      "obsah/prv3_voda_vzduch.html",
      "obsah/z6_hydrosfera.html",
      "obsah/z6_atmosfera.html"
    ]
  },
  {
    "id": "organismy",
    "nazev": "Buňka a živé organismy",
    "popis": "Živá příroda, buňka, mikroorganismy, houby, rostliny a živočichové.",
    "hlavni": "obsah/bunka.html",
    "cesta": [
      "obsah/prv3_ziva_neziva.html",
      "obsah/prv2_zvirata.html",
      "obsah/bunka.html",
      "obsah/pr6_mikroorganismy.html",
      "obsah/pr6_houby.html",
      "obsah/pr6_bezobratli.html",
      "obsah/pr6_clenovci.html",
      "obsah/pr7_rostliny.html",
      "obsah/pr7_obratlovci_studenokrevni.html",
      "obsah/pr7_ptaci_savci.html"
    ]
  },
  {
    "id": "clovek",
    "nazev": "Lidské tělo a zdraví",
    "popis": "Smysly, zdraví a životní styl, stavba těla, rozmnožování, dědičnost a první pomoc.",
    "hlavni": "obsah/anatomie.html",
    "cesta": [
      "obsah/prv1_smysly.html",
      "obsah/prv2_zdravi.html",
      "obsah/prv5_zdravy_styl.html",
      "obsah/anatomie.html",
      "obsah/pr8_rozmnozovani.html",
      "obsah/punnett.html",
      "obsah/pr8_prvni_pomoc.html"
    ]
  },
  {
    "id": "ekosystemy",
    "nazev": "Ekosystémy",
    "popis": "Les, louka a voda, potravní řetězce a ekologie.",
    "hlavni": "obsah/pr9_ekologie.html",
    "cesta": [
      "obsah/prv4_ekosystemy.html",
      "obsah/potravni_retezec.html",
      "obsah/pr9_ekologie.html"
    ]
  },
  {
    "id": "zeme",
    "nazev": "Horniny a stavba Země",
    "popis": "Horniny a nerosty, litosféra, geologické děje a vývoj Země.",
    "hlavni": "obsah/pr9_mineraly.html",
    "cesta": [
      "obsah/prv4_horniny.html",
      "obsah/z6_litosfera.html",
      "obsah/pr9_mineraly.html",
      "obsah/pr9_geologicke_deje.html",
      "obsah/pr9_vyvoj_zeme.html"
    ]
  },
  {
    "id": "latky",
    "nazev": "Látky a teplo",
    "popis": "Vlastnosti látek, částicová stavba, hustota a teplo.",
    "hlavni": "obsah/f6_vlastnosti_latek.html",
    "cesta": [
      "obsah/f6_vlastnosti_latek.html",
      "obsah/f6_hustota.html",
      "obsah/f8_teplo.html"
    ]
  },
  {
    "id": "sila",
    "nazev": "Síla, pohyb a stroje",
    "popis": "Pohyb, síla, jednoduché stroje, tlak, práce a energie, proudění.",
    "hlavni": "obsah/f7_sila.html",
    "cesta": [
      "obsah/f7_pohyb.html",
      "obsah/f7_sila.html",
      "obsah/physics_playground.html",
      "obsah/paka.html",
      "obsah/vrtacka_lis.html",
      "obsah/f7_tlak.html",
      "obsah/f8_prace_energie.html",
      "obsah/vitr_tunel.html",
      "obsah/proudove_motory.html"
    ]
  },
  {
    "id": "vlneni",
    "nazev": "Světlo, zvuk a vlnění",
    "popis": "Vlny na hladině, zvuk, výklad optiky od stínu po oko, laboratoř odrazu a lomu a optické přístroje.",
    "hlavni": "obsah/optika_lekce.html",
    "cesta": [
      "obsah/vodni_hladina.html",
      "obsah/f9_zvuk.html",
      "obsah/optika_lekce.html",
      "obsah/optika.html",
      "obsah/optika_soustava.html"
    ]
  },
  {
    "id": "energie",
    "nazev": "Elektřina a energie",
    "popis": "Zdroje energie, elektrické obvody, magnetismus, rozvod elektřiny a jaderná energie.",
    "hlavni": "obsah/elektrina.html",
    "cesta": [
      "obsah/prv5_energie.html",
      "obsah/elektrina.html",
      "obsah/f9_stridavy_proud.html",
      "obsah/f9_jaderna.html"
    ]
  },
  {
    "id": "vesmir",
    "nazev": "Země a vesmír",
    "popis": "Roční období, pohyby Země, sluneční soustava, gravitace a hvězdná obloha.",
    "hlavni": "obsah/solar_system.html",
    "cesta": [
      "obsah/prv1_rocni_obdobi.html",
      "obsah/z6_planeta_zeme.html",
      "obsah/solar_system.html",
      "obsah/planet_globe.html",
      "obsah/gravitacni_hriste.html",
      "obsah/gravitacni_hriste2.html",
      "obsah/pohyb_vesmirem.html",
      "obsah/star_map.html",
      "obsah/sky_events.html",
      "obsah/iss.html"
    ]
  },
  {
    "id": "stavba-latek",
    "nazev": "Stavba látek a reakce",
    "popis": "Atom a vazba, periodická tabulka, názvosloví, rovnice, redoxní reakce a pH.",
    "hlavni": "obsah/ch8_atom.html",
    "cesta": [
      "obsah/ch8_atom.html",
      "obsah/periodic_table.html",
      "obsah/chem_nazvoslovi.html",
      "obsah/vycislovani_rovnic.html",
      "obsah/ch9_redoxni.html",
      "obsah/ch9_ph.html"
    ]
  },
  {
    "id": "chemie-kolem",
    "nazev": "Chemie kolem nás",
    "popis": "Bezpečnost, směsi, voda a vzduch, uhlovodíky, deriváty, přírodní látky a životní prostředí.",
    "hlavni": "obsah/ch8_smesi.html",
    "cesta": [
      "obsah/ch8_bezpecnost.html",
      "obsah/ch8_smesi.html",
      "obsah/ch8_voda_vzduch.html",
      "obsah/ch9_uhlovodiky.html",
      "obsah/ch9_derivaty.html",
      "obsah/ch9_prirodni_latky.html",
      "obsah/ch9_zivotni_prostredi.html"
    ]
  },
  {
    "id": "mapa",
    "nazev": "Mapa a orientace",
    "popis": "Mapové značky a směry, souřadnice a měřítko, mapové lekce a slepé mapy.",
    "hlavni": "obsah/z6_mapa_souradnice.html",
    "cesta": [
      "obsah/prv4_mapy_smery.html",
      "obsah/z6_mapa_souradnice.html",
      "obsah/eduMaps.html",
      "obsah/slepa_mapa.html",
      "obsah/slepa_mapa_evropa.html"
    ]
  },
  {
    "id": "svet",
    "nazev": "Světadíly a státy",
    "popis": "Afrika, Amerika, Asie, Austrálie a Evropa; vlajky a hlavní města.",
    "hlavni": "obsah/z8_evropa_regiony.html",
    "cesta": [
      "obsah/z7_afrika.html",
      "obsah/z7_amerika.html",
      "obsah/z7_asie.html",
      "obsah/z7_australie_oceanie.html",
      "obsah/z8_evropa_regiony.html",
      "obsah/flags_quiz.html",
      "obsah/svetova_hlavni_mesta.html"
    ]
  },
  {
    "id": "cesko",
    "nazev": "Česko",
    "popis": "Povrch, vodstvo a podnebí, řeky a pohoří, obyvatelstvo a hospodářství Česka.",
    "hlavni": "obsah/z8_cr_prirodni.html",
    "cesta": [
      "obsah/z8_cr_prirodni.html",
      "obsah/reky_pohori.html",
      "obsah/z8_cr_hospodarstvi.html"
    ]
  },
  {
    "id": "svet-lide",
    "nazev": "Lidé a hospodářství světa",
    "popis": "Obyvatelstvo a sídla, světové hospodářství a globální problémy.",
    "hlavni": "obsah/z9_obyvatelstvo.html",
    "cesta": [
      "obsah/z9_obyvatelstvo.html",
      "obsah/z9_hospodarstvi_svet.html",
      "obsah/z9_globalni_problemy.html"
    ]
  },
  {
    "id": "historik",
    "nazev": "Čas a práce historika",
    "popis": "Prameny, letopočty a časové osy českých i světových dějin, historické mapy.",
    "hlavni": "obsah/d6_prameny.html",
    "cesta": [
      "obsah/d6_prameny.html",
      "obsah/casova_osa.html",
      "obsah/svetove_dejiny.html",
      "obsah/historicke_mapy_odkazy.html"
    ]
  },
  {
    "id": "starovek",
    "nazev": "Pravěk a starověk",
    "popis": "Pravěk, první státy u velkých řek, Řecko a Řím.",
    "hlavni": "obsah/d6_pravek.html",
    "cesta": [
      "obsah/d6_pravek.html",
      "obsah/d6_stary_orient.html",
      "obsah/d6_recko.html",
      "obsah/d6_rim.html"
    ]
  },
  {
    "id": "stredovek",
    "nazev": "Středověk v českých zemích",
    "popis": "Od příchodu Slovanů přes Přemyslovce a Lucemburky po husitství.",
    "hlavni": "obsah/d7_premyslovci.html",
    "cesta": [
      "obsah/prv4_nejstarsi_dejiny.html",
      "obsah/d7_rany_stredovek.html",
      "obsah/d7_premyslovci.html",
      "obsah/d7_lucemburkove.html",
      "obsah/d7_husitstvi.html"
    ]
  },
  {
    "id": "novovek",
    "nazev": "Novověk",
    "popis": "Zámořské objevy a renesance, reformace, osvícenství a průmyslová revoluce.",
    "hlavni": "obsah/d8_objevy_renesance.html",
    "cesta": [
      "obsah/d8_objevy_renesance.html",
      "obsah/d8_reformace.html",
      "obsah/d8_osvicenstvi.html",
      "obsah/d8_prumyslova_revoluce.html"
    ]
  },
  {
    "id": "stoleti-20",
    "nazev": "Dvacáté století",
    "popis": "Od první světové války a vzniku Československa po rok 1989.",
    "hlavni": "obsah/d9_csr.html",
    "cesta": [
      "obsah/prv5_dejiny_20.html",
      "obsah/d9_prvni_valka.html",
      "obsah/d9_csr.html",
      "obsah/d9_druha_valka.html",
      "obsah/d9_studena_valka.html"
    ]
  },
  {
    "id": "programovani",
    "nazev": "Algoritmy a programování",
    "popis": "Sekvence, cykly, proměnné, funkce, algoritmy řazení a modely.",
    "hlavni": "obsah/inf4_sekvence.html",
    "cesta": [
      "obsah/inf4_sekvence.html",
      "obsah/inf5_cykly.html",
      "obsah/inf6_promenne.html",
      "obsah/inf7_funkce.html",
      "obsah/eduSort.html",
      "obsah/inf9_model_simulace.html"
    ]
  },
  {
    "id": "data-site",
    "nazev": "Data, kódování a sítě",
    "popis": "Kódování, Morseova abeceda, šifrování, tabulky, databáze a počítačové sítě.",
    "hlavni": "obsah/inf6_tabulky.html",
    "cesta": [
      "obsah/inf4_data.html",
      "obsah/morse_code.html",
      "obsah/inf7_sifrovani.html",
      "obsah/inf6_tabulky.html",
      "obsah/inf8_databaze.html",
      "obsah/inf7_site.html"
    ]
  },
  {
    "id": "bezpeci",
    "nazev": "Bezpečně v digitálním světě",
    "popis": "Hardware a hesla, ověřování informací, digitální stopa, licence a umělá inteligence.",
    "hlavni": "obsah/inf6_digitalni_stopa.html",
    "cesta": [
      "obsah/inf4_hardware.html",
      "obsah/inf5_zdroje.html",
      "obsah/inf6_digitalni_stopa.html",
      "obsah/inf8_licence.html",
      "obsah/inf9_ai_etika.html",
      "obsah/AI_prednaska.html"
    ]
  },
  {
    "id": "hudba",
    "nazev": "Hudba",
    "popis": "Čtení not a hudební nauka.",
    "hlavni": "obsah/notes_reading.html",
    "cesta": [
      "obsah/notes_reading.html",
      "obsah/music_theory.html"
    ]
  }
];

KATALOG_SEKCE.forEach(s => s.polozky.forEach(p => {
  if (KATALOG_VYUKA[p.soubor]) p.vyuka = KATALOG_VYUKA[p.soubor];
  p.cil = (p.vyuka && p.vyuka.cil) || KATALOG_CILE[p.soubor] || '';
  const rodina = KATALOG_RODINY.find(r => r.cesta.includes(p.soubor));
  if (rodina) p.rodina = rodina.id;
}));
