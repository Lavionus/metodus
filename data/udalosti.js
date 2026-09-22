/* ============================================================
   data/udalosti.js – společná data rodiny témat „Čas a práce historika".
   Jedna sada událostí pro české (pruh 'cr') i světové dějiny ('svet').
   Čtou ji Časová osa českých dějin i Časová osa světových dějin;
   kreslí ji Nazor.casovaOsa (nazor.js). Rok < 0 = před naším letopočtem.
   Opravu letopočtu nebo názvu stačí udělat tady – projeví se všude.
   ============================================================ */
const METODUS_UDALOSTI = [
 {
  "rok": -3100,
  "nazev": "Sjednocení Egypta",
  "popis": "Vznik jednotného egyptského státu pod vládou faraonů.",
  "pruh": "svet"
 },
 {
  "rok": -776,
  "nazev": "První olympijské hry",
  "popis": "Konaly se ve starověkém Řecku v Olympii.",
  "pruh": "svet"
 },
 {
  "rok": -509,
  "nazev": "Vznik Římské republiky",
  "popis": "Řím se stal republikou po svržení posledního krále.",
  "pruh": "svet"
 },
 {
  "rok": -336,
  "nazev": "Alexandr Veliký na trůně",
  "popis": "Začátek výbojů, které vytvořily obrovskou říši.",
  "pruh": "svet"
 },
 {
  "rok": 27,
  "nazev": "Vznik Římského impéria",
  "popis": "Octavianus Augustus se stal prvním římským císařem.",
  "pruh": "svet"
 },
 {
  "rok": 476,
  "nazev": "Zánik Západořímské říše",
  "popis": "Konec starověku a začátek raného středověku v Evropě.",
  "pruh": "svet"
 },
 {
  "rok": 800,
  "nazev": "Korunovace Karla Velikého",
  "popis": "Karel Veliký se stal císařem, vznik Franské říše.",
  "pruh": "svet"
 },
 {
  "rok": 863,
  "nazev": "Příchod Cyrila a Metoděje na Velkou Moravu",
  "obdobi": "Raný středověk",
  "pruh": "cr"
 },
 {
  "rok": 935,
  "nazev": "Zavraždění knížete Václava ve Staré Boleslavi",
  "obdobi": "Přemyslovci",
  "pruh": "cr"
 },
 {
  "rok": 973,
  "nazev": "Založení pražského biskupství",
  "obdobi": "Přemyslovci",
  "pruh": "cr"
 },
 {
  "rok": 1096,
  "nazev": "První křížová výprava",
  "popis": "Začátek série tažení do Svaté země.",
  "pruh": "svet"
 },
 {
  "rok": 1212,
  "nazev": "Zlatá bula sicilská – dědičný královský titul",
  "obdobi": "Přemyslovci",
  "pruh": "cr"
 },
 {
  "rok": 1215,
  "nazev": "Magna Carta",
  "popis": "Anglická listina omezující moc krále, základ ústavního práva.",
  "pruh": "svet"
 },
 {
  "rok": 1278,
  "nazev": "Bitva na Moravském poli – smrt Přemysla Otakara II.",
  "obdobi": "Přemyslovci",
  "pruh": "cr"
 },
 {
  "rok": 1306,
  "nazev": "Vymření Přemyslovců po meči (Václav III.)",
  "obdobi": "Přemyslovci",
  "pruh": "cr"
 },
 {
  "rok": 1347,
  "nazev": "Černá smrt v Evropě",
  "popis": "Epidemie moru zabila třetinu evropské populace.",
  "pruh": "svet"
 },
 {
  "rok": 1348,
  "nazev": "Založení Univerzity Karlovy a Nového Města pražského",
  "obdobi": "Lucemburkové",
  "pruh": "cr"
 },
 {
  "rok": 1355,
  "nazev": "Karel IV. korunován císařem Svaté říše římské",
  "obdobi": "Lucemburkové",
  "pruh": "cr"
 },
 {
  "rok": 1415,
  "nazev": "Upálení mistra Jana Husa v Kostnici",
  "obdobi": "Husitství",
  "pruh": "cr"
 },
 {
  "rok": 1420,
  "nazev": "Bitva na Vítkově – husitské války",
  "obdobi": "Husitství",
  "pruh": "cr"
 },
 {
  "rok": 1492,
  "nazev": "Kolumbus objevuje Ameriku",
  "popis": "Začátek evropské kolonizace amerického kontinentu.",
  "pruh": "svet"
 },
 {
  "rok": 1517,
  "nazev": "Lutherova reformace",
  "popis": "Martin Luther zahájil protestantskou reformaci církve.",
  "pruh": "svet"
 },
 {
  "rok": 1526,
  "nazev": "Nástup Habsburků na český trůn (Ferdinand I.)",
  "obdobi": "Habsburkové",
  "pruh": "cr"
 },
 {
  "rok": 1618,
  "nazev": "Druhá pražská defenestrace – začátek stavovského povstání",
  "obdobi": "Habsburkové",
  "pruh": "cr"
 },
 {
  "rok": 1620,
  "nazev": "Bitva na Bílé hoře – porážka českých stavů",
  "obdobi": "Habsburkové",
  "pruh": "cr"
 },
 {
  "rok": 1642,
  "nazev": "Anglická občanská válka",
  "popis": "Konflikt mezi royalisty a parlamentem.",
  "pruh": "svet"
 },
 {
  "rok": 1648,
  "nazev": "Vestfálský mír – konec třicetileté války",
  "obdobi": "Habsburkové",
  "pruh": "cr"
 },
 {
  "rok": 1740,
  "nazev": "Nástup Marie Terezie na trůn",
  "obdobi": "Osvícenství",
  "pruh": "cr"
 },
 {
  "rok": 1781,
  "nazev": "Zrušení nevolnictví a toleranční patent (Josef II.)",
  "obdobi": "Osvícenství",
  "pruh": "cr"
 },
 {
  "rok": 1789,
  "nazev": "Francouzská revoluce",
  "popis": "Pád monarchie, vznik moderních myšlenek svobody a rovnosti.",
  "pruh": "svet"
 },
 {
  "rok": 1848,
  "nazev": "Revoluční rok, zrušení roboty",
  "obdobi": "Národní obrození",
  "pruh": "cr"
 },
 {
  "rok": 1861,
  "nazev": "Americká občanská válka",
  "popis": "Konflikt mezi Severem a Jihem, skončil zrušením otroctví.",
  "pruh": "svet"
 },
 {
  "rok": 1914,
  "nazev": "První světová válka",
  "popis": "Globální konflikt trvající do roku 1918.",
  "pruh": "svet"
 },
 {
  "rok": 1918,
  "nazev": "Vznik samostatného Československa",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1929,
  "nazev": "Velká hospodářská krize",
  "popis": "Krach na burze v New Yorku vyvolal celosvětovou krizi.",
  "pruh": "svet"
 },
 {
  "rok": 1938,
  "nazev": "Mnichovská dohoda",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1939,
  "nazev": "Okupace a vznik Protektorátu Čechy a Morava",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1939,
  "nazev": "Druhá světová válka",
  "popis": "Nejrozsáhlejší válečný konflikt v dějinách, trvala do roku 1945.",
  "pruh": "svet"
 },
 {
  "rok": 1945,
  "nazev": "Konec 2. světové války, osvobození",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1948,
  "nazev": "Únorový komunistický převrat",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1968,
  "nazev": "Pražské jaro a okupace vojsky Varšavské smlouvy",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1969,
  "nazev": "Přistání na Měsíci",
  "popis": "Apollo 11 přistálo s posádkou na Měsíci.",
  "pruh": "svet"
 },
 {
  "rok": 1989,
  "nazev": "Sametová revoluce – pád komunistického režimu",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 1989,
  "nazev": "Pád Berlínské zdi",
  "popis": "Symbolický konec studené války a rozdělení Evropy.",
  "pruh": "svet"
 },
 {
  "rok": 1991,
  "nazev": "Rozpad Sovětského svazu",
  "popis": "Konec studené války, vznik nových samostatných států.",
  "pruh": "svet"
 },
 {
  "rok": 1993,
  "nazev": "Vznik samostatné České republiky",
  "obdobi": "20. století",
  "pruh": "cr"
 },
 {
  "rok": 2004,
  "nazev": "Vstup České republiky do Evropské unie",
  "obdobi": "21. století",
  "pruh": "cr"
 },
 {
  "rok": 2004,
  "nazev": "Rozšíření Evropské unie",
  "popis": "EU se rozšířila o deset zemí včetně ČR.",
  "pruh": "svet"
 }
];

const METODUS_PRUHY = [
  { id: 'cr', nazev: 'České země' },
  { id: 'svet', nazev: 'Svět' },
];
