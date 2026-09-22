/* ============================================================
   data/horniny.js – společná data rodiny témat „Horniny a stavba Země".
   Stejné vzorky používá Horniny a nerosty (4.–5. r.) i Minerály
   a horniny (9. r.): mladší žák je pozná podle vlastností, starší
   k nim přidá druh horniny, vznik a tvrdost podle Mohse.
   n název · e ikona · hornina (true) × nerost (false) · vlastnosti ·
   popis · vyuziti · druh a vznik (horniny) · tvrdost (nerosty, Mohs)
   ============================================================ */
const METODUS_HORNINY = [
  { n: 'žula', e: '🪨', hornina: true, druh: 'vyvřelá', vznik: 'pomalým tuhnutím magmatu hluboko pod povrchem', vlastnosti: ['tvrdá', 'zrnitá', 'světlá s tmavými zrnky'],
    popis: 'Tvrdá zrnitá hornina, ve které jsou vidět zrnka křemene, živce a slídy.',
    vyuziti: 'dlažební kostky a pomníky' },
  { n: 'pískovec', e: '🟫', hornina: true, druh: 'usazená', vznik: 'stmelením zrnek písku', vlastnosti: ['měkčí', 'zrnitý', 'nasákavý'],
    popis: 'Usazená hornina ze stmelených zrnek písku, snadno se opracovává. Tvoří skalní města.',
    vyuziti: 'sochy a stavební kámen' },
  { n: 'vápenec', e: '⬜', hornina: true, druh: 'usazená', vznik: 'z usazených vápnitých schránek a kalu v moři', vlastnosti: ['šumí s octem', 'světlý', 'usazený'],
    popis: 'Usazená hornina, ve které bývají zkameněliny. S kyselinou šumí a vznikají v ní jeskyně.',
    vyuziti: 'výroba vápna a cementu' },
  { n: 'čedič', e: '⬛', hornina: true, druh: 'vyvřelá', vznik: 'rychlým tuhnutím lávy na povrchu', vlastnosti: ['tmavý', 'velmi tvrdý', 'sopečný'],
    popis: 'Tmavá vyvřelá hornina ze ztuhlé lávy, někdy tvoří pravidelné sloupy.',
    vyuziti: 'štěrk na silnice' },
  { n: 'uhlí', e: '🖤', hornina: true, druh: 'usazená', vznik: 'z odumřelých rostlin zasypaných bez přístupu vzduchu', vlastnosti: ['černé', 'lehké', 'hořlavé'],
    popis: 'Vzniklo z pravěkých rostlin. Je hořlavé, těží se v dolech.',
    vyuziti: 'palivo v elektrárnách' },
  { n: 'křemen', e: '💎', hornina: false, tvrdost: '7', vlastnosti: ['velmi tvrdý', 'průhledný až mléčný', 'rýpe do skla'],
    popis: 'Tvrdý nerost, který rýpe do skla. Bývá průhledný nebo mléčně bílý.',
    vyuziti: 'výroba skla' },
  { n: 'sůl kamenná', e: '🧂', hornina: false, tvrdost: '2–2,5', vlastnosti: ['slaná', 'rozpustná ve vodě', 'krystalická'],
    popis: 'Nerost, který se rozpouští ve vodě a je slaný. Krystalky mají tvar krychle.',
    vyuziti: 'do jídla a na silnice v zimě' },
  { n: 'grafit (tuha)', e: '✏️', hornina: false, tvrdost: '1–2', vlastnosti: ['měkký', 'šedý', 'špiní ruce'],
    popis: 'Velmi měkký nerost, který zanechává stopu na papíře a maže se.',
    vyuziti: 'tuha do tužek' },
  { n: 'zlato', e: '🥇', hornina: false, tvrdost: '2,5–3', vlastnosti: ['těžké', 'lesklé', 'nerezaví'],
    popis: 'Vzácný kov, který nerezaví a dá se snadno tvarovat. Rýžuje se z řek.',
    vyuziti: 'šperky a elektronika' },
  { n: 'slída', e: '✨', hornina: false, tvrdost: '2–3', vlastnosti: ['loupe se na plátky', 'lesklá', 'pružná'],
    popis: 'Nerost, který se dá loupat na tenké lesklé plátky.',
    vyuziti: 'žáruvzdorné materiály' },
];
