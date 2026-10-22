/* ============================================================
   data/staty.js – společná data rodiny témat „Světadíly a státy".
   Jeden seznam států pro kvíz vlajek i kvíz hlavních měst, aby se
   stránky neshodovaly jen náhodou (dřív měla každá vlastní seznam
   a různé názvy: „Washington" × „Washington, D.C." ap.).
   Hlavní města v české podobě podle běžných českých atlasů.
   kod  – ISO 3166-1 alfa-2 malými (Kosovo „xk“), soubor obsah/img/vlajky/<kod>.svg
          (flag-icons 7.2.3, licence MIT, viz obsah/img/vlajky/LICENSE).
          Vlajky se zobrazují jako obrázky, ne emoji – na Windows se emoji
          vlajky ukážou jako písmena („CZ“) a prozradí odpověď.
   pozn – nepovinná poznámka (sporný status apod.), ukáže se v nápovědě.
   ============================================================ */
const METODUS_STATY = [
 {
  "stat": "Egypt",
  "mesto": "Káhira",
  "svetadil": "Afrika",
  "vlajka": "🇪🇬",
  "kod": "eg"
 },
 {
  "stat": "Etiopie",
  "mesto": "Addis Abeba",
  "svetadil": "Afrika",
  "vlajka": "🇪🇹",
  "kod": "et"
 },
 {
  "stat": "Ghana",
  "mesto": "Akkra",
  "svetadil": "Afrika",
  "vlajka": "🇬🇭",
  "kod": "gh"
 },
 {
  "stat": "Jihoafrická republika",
  "mesto": "Pretoria",
  "svetadil": "Afrika",
  "vlajka": "🇿🇦",
  "kod": "za"
 },
 {
  "stat": "Keňa",
  "mesto": "Nairobi",
  "svetadil": "Afrika",
  "vlajka": "🇰🇪",
  "kod": "ke"
 },
 {
  "stat": "Maroko",
  "mesto": "Rabat",
  "svetadil": "Afrika",
  "vlajka": "🇲🇦",
  "kod": "ma"
 },
 {
  "stat": "Nigérie",
  "mesto": "Abuja",
  "svetadil": "Afrika",
  "vlajka": "🇳🇬",
  "kod": "ng"
 },
 {
  "stat": "Tunisko",
  "mesto": "Tunis",
  "svetadil": "Afrika",
  "vlajka": "🇹🇳",
  "kod": "tn"
 },
 {
  "stat": "Argentina",
  "mesto": "Buenos Aires",
  "svetadil": "Amerika",
  "vlajka": "🇦🇷",
  "kod": "ar"
 },
 {
  "stat": "Brazílie",
  "mesto": "Brasília",
  "svetadil": "Amerika",
  "vlajka": "🇧🇷",
  "kod": "br"
 },
 {
  "stat": "Chile",
  "mesto": "Santiago",
  "svetadil": "Amerika",
  "vlajka": "🇨🇱",
  "kod": "cl"
 },
 {
  "stat": "Kanada",
  "mesto": "Ottawa",
  "svetadil": "Amerika",
  "vlajka": "🇨🇦",
  "kod": "ca"
 },
 {
  "stat": "Kolumbie",
  "mesto": "Bogotá",
  "svetadil": "Amerika",
  "vlajka": "🇨🇴",
  "kod": "co"
 },
 {
  "stat": "Kuba",
  "mesto": "Havana",
  "svetadil": "Amerika",
  "vlajka": "🇨🇺",
  "kod": "cu"
 },
 {
  "stat": "Mexiko",
  "mesto": "Ciudad de México",
  "svetadil": "Amerika",
  "vlajka": "🇲🇽",
  "kod": "mx"
 },
 {
  "stat": "Peru",
  "mesto": "Lima",
  "svetadil": "Amerika",
  "vlajka": "🇵🇪",
  "kod": "pe"
 },
 {
  "stat": "USA",
  "mesto": "Washington",
  "svetadil": "Amerika",
  "vlajka": "🇺🇸",
  "kod": "us"
 },
 {
  "stat": "Venezuela",
  "mesto": "Caracas",
  "svetadil": "Amerika",
  "vlajka": "🇻🇪",
  "kod": "ve"
 },
 {
  "stat": "Indie",
  "mesto": "Nové Dillí",
  "svetadil": "Asie",
  "vlajka": "🇮🇳",
  "kod": "in"
 },
 {
  "stat": "Indonésie",
  "mesto": "Jakarta",
  "svetadil": "Asie",
  "vlajka": "🇮🇩",
  "kod": "id"
 },
 {
  "stat": "Izrael",
  "mesto": "Jeruzalém",
  "svetadil": "Asie",
  "vlajka": "🇮🇱",
  "kod": "il",
  "pozn": "status Jeruzaléma jako hlavního města je mezinárodně sporný, většina států má velvyslanectví v Tel Avivu"
 },
 {
  "stat": "Japonsko",
  "mesto": "Tokio",
  "svetadil": "Asie",
  "vlajka": "🇯🇵",
  "kod": "jp"
 },
 {
  "stat": "Jižní Korea",
  "mesto": "Soul",
  "svetadil": "Asie",
  "vlajka": "🇰🇷",
  "kod": "kr"
 },
 {
  "stat": "Mongolsko",
  "mesto": "Ulánbátar",
  "svetadil": "Asie",
  "vlajka": "🇲🇳",
  "kod": "mn"
 },
 {
  "stat": "Pákistán",
  "mesto": "Islámábád",
  "svetadil": "Asie",
  "vlajka": "🇵🇰",
  "kod": "pk"
 },
 {
  "stat": "Saúdská Arábie",
  "mesto": "Rijád",
  "svetadil": "Asie",
  "vlajka": "🇸🇦",
  "kod": "sa"
 },
 {
  "stat": "Thajsko",
  "mesto": "Bangkok",
  "svetadil": "Asie",
  "vlajka": "🇹🇭",
  "kod": "th"
 },
 {
  "stat": "Turecko",
  "mesto": "Ankara",
  "svetadil": "Asie",
  "vlajka": "🇹🇷",
  "kod": "tr"
 },
 {
  "stat": "Vietnam",
  "mesto": "Hanoj",
  "svetadil": "Asie",
  "vlajka": "🇻🇳",
  "kod": "vn"
 },
 {
  "stat": "Čína",
  "mesto": "Peking",
  "svetadil": "Asie",
  "vlajka": "🇨🇳",
  "kod": "cn"
 },
 {
  "stat": "Belgie",
  "mesto": "Brusel",
  "svetadil": "Evropa",
  "vlajka": "🇧🇪",
  "kod": "be"
 },
 {
  "stat": "Bulharsko",
  "mesto": "Sofie",
  "svetadil": "Evropa",
  "vlajka": "🇧🇬",
  "kod": "bg"
 },
 {
  "stat": "Chorvatsko",
  "mesto": "Záhřeb",
  "svetadil": "Evropa",
  "vlajka": "🇭🇷",
  "kod": "hr"
 },
 {
  "stat": "Dánsko",
  "mesto": "Kodaň",
  "svetadil": "Evropa",
  "vlajka": "🇩🇰",
  "kod": "dk"
 },
 {
  "stat": "Estonsko",
  "mesto": "Tallinn",
  "svetadil": "Evropa",
  "vlajka": "🇪🇪",
  "kod": "ee"
 },
 {
  "stat": "Finsko",
  "mesto": "Helsinky",
  "svetadil": "Evropa",
  "vlajka": "🇫🇮",
  "kod": "fi"
 },
 {
  "stat": "Francie",
  "mesto": "Paříž",
  "svetadil": "Evropa",
  "vlajka": "🇫🇷",
  "kod": "fr"
 },
 {
  "stat": "Irsko",
  "mesto": "Dublin",
  "svetadil": "Evropa",
  "vlajka": "🇮🇪",
  "kod": "ie"
 },
 {
  "stat": "Island",
  "mesto": "Reykjavík",
  "svetadil": "Evropa",
  "vlajka": "🇮🇸",
  "kod": "is"
 },
 {
  "stat": "Itálie",
  "mesto": "Řím",
  "svetadil": "Evropa",
  "vlajka": "🇮🇹",
  "kod": "it"
 },
 {
  "stat": "Litva",
  "mesto": "Vilnius",
  "svetadil": "Evropa",
  "vlajka": "🇱🇹",
  "kod": "lt"
 },
 {
  "stat": "Lotyšsko",
  "mesto": "Riga",
  "svetadil": "Evropa",
  "vlajka": "🇱🇻",
  "kod": "lv"
 },
 {
  "stat": "Maďarsko",
  "mesto": "Budapešť",
  "svetadil": "Evropa",
  "vlajka": "🇭🇺",
  "kod": "hu"
 },
 {
  "stat": "Nizozemsko",
  "mesto": "Amsterdam",
  "svetadil": "Evropa",
  "vlajka": "🇳🇱",
  "kod": "nl"
 },
 {
  "stat": "Norsko",
  "mesto": "Oslo",
  "svetadil": "Evropa",
  "vlajka": "🇳🇴",
  "kod": "no"
 },
 {
  "stat": "Německo",
  "mesto": "Berlín",
  "svetadil": "Evropa",
  "vlajka": "🇩🇪",
  "kod": "de"
 },
 {
  "stat": "Polsko",
  "mesto": "Varšava",
  "svetadil": "Evropa",
  "vlajka": "🇵🇱",
  "kod": "pl"
 },
 {
  "stat": "Portugalsko",
  "mesto": "Lisabon",
  "svetadil": "Evropa",
  "vlajka": "🇵🇹",
  "kod": "pt"
 },
 {
  "stat": "Rakousko",
  "mesto": "Vídeň",
  "svetadil": "Evropa",
  "vlajka": "🇦🇹",
  "kod": "at"
 },
 {
  "stat": "Rumunsko",
  "mesto": "Bukurešť",
  "svetadil": "Evropa",
  "vlajka": "🇷🇴",
  "kod": "ro"
 },
 {
  "stat": "Rusko",
  "mesto": "Moskva",
  "svetadil": "Evropa",
  "vlajka": "🇷🇺",
  "kod": "ru"
 },
 {
  "stat": "Slovensko",
  "mesto": "Bratislava",
  "svetadil": "Evropa",
  "vlajka": "🇸🇰",
  "kod": "sk"
 },
 {
  "stat": "Slovinsko",
  "mesto": "Lublaň",
  "svetadil": "Evropa",
  "vlajka": "🇸🇮",
  "kod": "si"
 },
 {
  "stat": "Srbsko",
  "mesto": "Bělehrad",
  "svetadil": "Evropa",
  "vlajka": "🇷🇸",
  "kod": "rs"
 },
 {
  "stat": "Ukrajina",
  "mesto": "Kyjev",
  "svetadil": "Evropa",
  "vlajka": "🇺🇦",
  "kod": "ua"
 },
 {
  "stat": "Velká Británie",
  "mesto": "Londýn",
  "svetadil": "Evropa",
  "vlajka": "🇬🇧",
  "kod": "gb"
 },
 {
  "stat": "Česko",
  "mesto": "Praha",
  "svetadil": "Evropa",
  "vlajka": "🇨🇿",
  "kod": "cz"
 },
 {
  "stat": "Řecko",
  "mesto": "Atény",
  "svetadil": "Evropa",
  "vlajka": "🇬🇷",
  "kod": "gr"
 },
 {
  "stat": "Španělsko",
  "mesto": "Madrid",
  "svetadil": "Evropa",
  "vlajka": "🇪🇸",
  "kod": "es"
 },
 {
  "stat": "Švédsko",
  "mesto": "Stockholm",
  "svetadil": "Evropa",
  "vlajka": "🇸🇪",
  "kod": "se"
 },
 {
  "stat": "Švýcarsko",
  "mesto": "Bern",
  "svetadil": "Evropa",
  "vlajka": "🇨🇭",
  "kod": "ch"
 },
 {
  "stat": "Albánie",
  "mesto": "Tirana",
  "svetadil": "Evropa",
  "vlajka": "🇦🇱",
  "kod": "al"
 },
 {
  "stat": "Andorra",
  "mesto": "Andorra la Vella",
  "svetadil": "Evropa",
  "vlajka": "🇦🇩",
  "kod": "ad"
 },
 {
  "stat": "Bělorusko",
  "mesto": "Minsk",
  "svetadil": "Evropa",
  "vlajka": "🇧🇾",
  "kod": "by"
 },
 {
  "stat": "Bosna a Hercegovina",
  "mesto": "Sarajevo",
  "svetadil": "Evropa",
  "vlajka": "🇧🇦",
  "kod": "ba"
 },
 {
  "stat": "Černá Hora",
  "mesto": "Podgorica",
  "svetadil": "Evropa",
  "vlajka": "🇲🇪",
  "kod": "me"
 },
 {
  "stat": "Kosovo",
  "mesto": "Priština",
  "svetadil": "Evropa",
  "vlajka": "🇽🇰",
  "kod": "xk",
  "pozn": "nezávislost vyhlásilo v roce 2008; Česko ji uznává, některé státy (např. Srbsko) ne"
 },
 {
  "stat": "Lichtenštejnsko",
  "mesto": "Vaduz",
  "svetadil": "Evropa",
  "vlajka": "🇱🇮",
  "kod": "li"
 },
 {
  "stat": "Lucembursko",
  "mesto": "Lucemburk",
  "svetadil": "Evropa",
  "vlajka": "🇱🇺",
  "kod": "lu"
 },
 {
  "stat": "Malta",
  "mesto": "Valletta",
  "svetadil": "Evropa",
  "vlajka": "🇲🇹",
  "kod": "mt"
 },
 {
  "stat": "Moldavsko",
  "mesto": "Kišiněv",
  "svetadil": "Evropa",
  "vlajka": "🇲🇩",
  "kod": "md"
 },
 {
  "stat": "Monako",
  "mesto": "Monako",
  "svetadil": "Evropa",
  "vlajka": "🇲🇨",
  "kod": "mc"
 },
 {
  "stat": "San Marino",
  "mesto": "San Marino",
  "svetadil": "Evropa",
  "vlajka": "🇸🇲",
  "kod": "sm"
 },
 {
  "stat": "Severní Makedonie",
  "mesto": "Skopje",
  "svetadil": "Evropa",
  "vlajka": "🇲🇰",
  "kod": "mk"
 },
 {
  "stat": "Vatikán",
  "mesto": "Vatikán",
  "svetadil": "Evropa",
  "vlajka": "🇻🇦",
  "kod": "va"
 },
 {
  "stat": "Austrálie",
  "mesto": "Canberra",
  "svetadil": "Oceánie",
  "vlajka": "🇦🇺",
  "kod": "au"
 },
 {
  "stat": "Fidži",
  "mesto": "Suva",
  "svetadil": "Oceánie",
  "vlajka": "🇫🇯",
  "kod": "fj"
 },
 {
  "stat": "Nový Zéland",
  "mesto": "Wellington",
  "svetadil": "Oceánie",
  "vlajka": "🇳🇿",
  "kod": "nz"
 },
 {
  "stat": "Papua Nová Guinea",
  "mesto": "Port Moresby",
  "svetadil": "Oceánie",
  "vlajka": "🇵🇬",
  "kod": "pg"
 }
];
