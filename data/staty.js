/* ============================================================
   data/staty.js – společná data rodiny témat „Světadíly a státy".
   Jeden seznam států pro kvíz vlajek i kvíz hlavních měst, aby se
   stránky neshodovaly jen náhodou (dřív měla každá vlastní seznam
   a různé názvy: „Washington" × „Washington, D.C." ap.).
   Hlavní města v české podobě podle běžných českých atlasů.
   ============================================================ */
const METODUS_STATY = [
 {
  "stat": "Egypt",
  "mesto": "Káhira",
  "svetadil": "Afrika",
  "vlajka": "🇪🇬"
 },
 {
  "stat": "Etiopie",
  "mesto": "Addis Abeba",
  "svetadil": "Afrika",
  "vlajka": "🇪🇹"
 },
 {
  "stat": "Ghana",
  "mesto": "Akkra",
  "svetadil": "Afrika",
  "vlajka": "🇬🇭"
 },
 {
  "stat": "Jihoafrická republika",
  "mesto": "Pretoria",
  "svetadil": "Afrika",
  "vlajka": "🇿🇦"
 },
 {
  "stat": "Keňa",
  "mesto": "Nairobi",
  "svetadil": "Afrika",
  "vlajka": "🇰🇪"
 },
 {
  "stat": "Maroko",
  "mesto": "Rabat",
  "svetadil": "Afrika",
  "vlajka": "🇲🇦"
 },
 {
  "stat": "Nigérie",
  "mesto": "Abuja",
  "svetadil": "Afrika",
  "vlajka": "🇳🇬"
 },
 {
  "stat": "Tunisko",
  "mesto": "Tunis",
  "svetadil": "Afrika",
  "vlajka": "🇹🇳"
 },
 {
  "stat": "Argentina",
  "mesto": "Buenos Aires",
  "svetadil": "Amerika",
  "vlajka": "🇦🇷"
 },
 {
  "stat": "Brazílie",
  "mesto": "Brasília",
  "svetadil": "Amerika",
  "vlajka": "🇧🇷"
 },
 {
  "stat": "Chile",
  "mesto": "Santiago",
  "svetadil": "Amerika",
  "vlajka": "🇨🇱"
 },
 {
  "stat": "Kanada",
  "mesto": "Ottawa",
  "svetadil": "Amerika",
  "vlajka": "🇨🇦"
 },
 {
  "stat": "Kolumbie",
  "mesto": "Bogotá",
  "svetadil": "Amerika",
  "vlajka": "🇨🇴"
 },
 {
  "stat": "Kuba",
  "mesto": "Havana",
  "svetadil": "Amerika",
  "vlajka": "🇨🇺"
 },
 {
  "stat": "Mexiko",
  "mesto": "Ciudad de México",
  "svetadil": "Amerika",
  "vlajka": "🇲🇽"
 },
 {
  "stat": "Peru",
  "mesto": "Lima",
  "svetadil": "Amerika",
  "vlajka": "🇵🇪"
 },
 {
  "stat": "USA",
  "mesto": "Washington",
  "svetadil": "Amerika",
  "vlajka": "🇺🇸"
 },
 {
  "stat": "Venezuela",
  "mesto": "Caracas",
  "svetadil": "Amerika",
  "vlajka": "🇻🇪"
 },
 {
  "stat": "Indie",
  "mesto": "Nové Dillí",
  "svetadil": "Asie",
  "vlajka": "🇮🇳"
 },
 {
  "stat": "Indonésie",
  "mesto": "Jakarta",
  "svetadil": "Asie",
  "vlajka": "🇮🇩"
 },
 {
  "stat": "Izrael",
  "mesto": "Jeruzalém",
  "svetadil": "Asie",
  "vlajka": "🇮🇱"
 },
 {
  "stat": "Japonsko",
  "mesto": "Tokio",
  "svetadil": "Asie",
  "vlajka": "🇯🇵"
 },
 {
  "stat": "Jižní Korea",
  "mesto": "Soul",
  "svetadil": "Asie",
  "vlajka": "🇰🇷"
 },
 {
  "stat": "Mongolsko",
  "mesto": "Ulánbátar",
  "svetadil": "Asie",
  "vlajka": "🇲🇳"
 },
 {
  "stat": "Pákistán",
  "mesto": "Islámábád",
  "svetadil": "Asie",
  "vlajka": "🇵🇰"
 },
 {
  "stat": "Saúdská Arábie",
  "mesto": "Rijád",
  "svetadil": "Asie",
  "vlajka": "🇸🇦"
 },
 {
  "stat": "Thajsko",
  "mesto": "Bangkok",
  "svetadil": "Asie",
  "vlajka": "🇹🇭"
 },
 {
  "stat": "Turecko",
  "mesto": "Ankara",
  "svetadil": "Asie",
  "vlajka": "🇹🇷"
 },
 {
  "stat": "Vietnam",
  "mesto": "Hanoj",
  "svetadil": "Asie",
  "vlajka": "🇻🇳"
 },
 {
  "stat": "Čína",
  "mesto": "Peking",
  "svetadil": "Asie",
  "vlajka": "🇨🇳"
 },
 {
  "stat": "Belgie",
  "mesto": "Brusel",
  "svetadil": "Evropa",
  "vlajka": "🇧🇪"
 },
 {
  "stat": "Bulharsko",
  "mesto": "Sofie",
  "svetadil": "Evropa",
  "vlajka": "🇧🇬"
 },
 {
  "stat": "Chorvatsko",
  "mesto": "Záhřeb",
  "svetadil": "Evropa",
  "vlajka": "🇭🇷"
 },
 {
  "stat": "Dánsko",
  "mesto": "Kodaň",
  "svetadil": "Evropa",
  "vlajka": "🇩🇰"
 },
 {
  "stat": "Estonsko",
  "mesto": "Tallinn",
  "svetadil": "Evropa",
  "vlajka": "🇪🇪"
 },
 {
  "stat": "Finsko",
  "mesto": "Helsinky",
  "svetadil": "Evropa",
  "vlajka": "🇫🇮"
 },
 {
  "stat": "Francie",
  "mesto": "Paříž",
  "svetadil": "Evropa",
  "vlajka": "🇫🇷"
 },
 {
  "stat": "Irsko",
  "mesto": "Dublin",
  "svetadil": "Evropa",
  "vlajka": "🇮🇪"
 },
 {
  "stat": "Island",
  "mesto": "Reykjavík",
  "svetadil": "Evropa",
  "vlajka": "🇮🇸"
 },
 {
  "stat": "Itálie",
  "mesto": "Řím",
  "svetadil": "Evropa",
  "vlajka": "🇮🇹"
 },
 {
  "stat": "Litva",
  "mesto": "Vilnius",
  "svetadil": "Evropa",
  "vlajka": "🇱🇹"
 },
 {
  "stat": "Lotyšsko",
  "mesto": "Riga",
  "svetadil": "Evropa",
  "vlajka": "🇱🇻"
 },
 {
  "stat": "Maďarsko",
  "mesto": "Budapešť",
  "svetadil": "Evropa",
  "vlajka": "🇭🇺"
 },
 {
  "stat": "Nizozemsko",
  "mesto": "Amsterdam",
  "svetadil": "Evropa",
  "vlajka": "🇳🇱"
 },
 {
  "stat": "Norsko",
  "mesto": "Oslo",
  "svetadil": "Evropa",
  "vlajka": "🇳🇴"
 },
 {
  "stat": "Německo",
  "mesto": "Berlín",
  "svetadil": "Evropa",
  "vlajka": "🇩🇪"
 },
 {
  "stat": "Polsko",
  "mesto": "Varšava",
  "svetadil": "Evropa",
  "vlajka": "🇵🇱"
 },
 {
  "stat": "Portugalsko",
  "mesto": "Lisabon",
  "svetadil": "Evropa",
  "vlajka": "🇵🇹"
 },
 {
  "stat": "Rakousko",
  "mesto": "Vídeň",
  "svetadil": "Evropa",
  "vlajka": "🇦🇹"
 },
 {
  "stat": "Rumunsko",
  "mesto": "Bukurešť",
  "svetadil": "Evropa",
  "vlajka": "🇷🇴"
 },
 {
  "stat": "Rusko",
  "mesto": "Moskva",
  "svetadil": "Evropa",
  "vlajka": "🇷🇺"
 },
 {
  "stat": "Slovensko",
  "mesto": "Bratislava",
  "svetadil": "Evropa",
  "vlajka": "🇸🇰"
 },
 {
  "stat": "Slovinsko",
  "mesto": "Lublaň",
  "svetadil": "Evropa",
  "vlajka": "🇸🇮"
 },
 {
  "stat": "Srbsko",
  "mesto": "Bělehrad",
  "svetadil": "Evropa",
  "vlajka": "🇷🇸"
 },
 {
  "stat": "Ukrajina",
  "mesto": "Kyjev",
  "svetadil": "Evropa",
  "vlajka": "🇺🇦"
 },
 {
  "stat": "Velká Británie",
  "mesto": "Londýn",
  "svetadil": "Evropa",
  "vlajka": "🇬🇧"
 },
 {
  "stat": "Česko",
  "mesto": "Praha",
  "svetadil": "Evropa",
  "vlajka": "🇨🇿"
 },
 {
  "stat": "Řecko",
  "mesto": "Atény",
  "svetadil": "Evropa",
  "vlajka": "🇬🇷"
 },
 {
  "stat": "Španělsko",
  "mesto": "Madrid",
  "svetadil": "Evropa",
  "vlajka": "🇪🇸"
 },
 {
  "stat": "Švédsko",
  "mesto": "Stockholm",
  "svetadil": "Evropa",
  "vlajka": "🇸🇪"
 },
 {
  "stat": "Švýcarsko",
  "mesto": "Bern",
  "svetadil": "Evropa",
  "vlajka": "🇨🇭"
 },
 {
  "stat": "Austrálie",
  "mesto": "Canberra",
  "svetadil": "Oceánie",
  "vlajka": "🇦🇺"
 },
 {
  "stat": "Fidži",
  "mesto": "Suva",
  "svetadil": "Oceánie",
  "vlajka": "🇫🇯"
 },
 {
  "stat": "Nový Zéland",
  "mesto": "Wellington",
  "svetadil": "Oceánie",
  "vlajka": "🇳🇿"
 },
 {
  "stat": "Papua Nová Guinea",
  "mesto": "Port Moresby",
  "svetadil": "Oceánie",
  "vlajka": "🇵🇬"
 }
];
