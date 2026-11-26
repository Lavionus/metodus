#!/bin/bash
# Převezme stránku „Vzorce v Excelu“ z hlavního webu (../site) do Metodu.
# Zdrojem pravdy je ../site/obsah/excel_vzorce* – úpravy dělat tam a pak spustit tenhle skript.
#   tools/excel_vzorce_sync.sh
# V kopii: kostra Metodu (kostra.js), vlastní klíč úložiště metodus_excel_vzorce, bez slovníků i18n.
set -euo pipefail
cd "$(dirname "$0")/.."
ZDROJ=../site/obsah
[ -f "$ZDROJ/excel_vzorce.html" ] || { echo "Nenalezen $ZDROJ/excel_vzorce.html" >&2; exit 1; }
mkdir -p obsah/excel_vzorce obsah/lib/xlsx
cp "$ZDROJ"/excel_vzorce/*.js "$ZDROJ"/excel_vzorce/*.css "$ZDROJ"/excel_vzorce/*.png obsah/excel_vzorce/
# instalace jako aplikace: manifest + service worker s úzkým rozsahem (cache se odliší cestou)
cp "$ZDROJ"/excel_vzorce.webmanifest "$ZDROJ"/excel_vzorce-sw.js obsah/
cp "$ZDROJ"/lib/xlsx/xlsx.full.min.js "$ZDROJ"/lib/xlsx/LICENSE.txt obsah/lib/xlsx/
cp "$ZDROJ"/lib/qrcode.min.js obsah/lib/   # QR kód zálohy pokroku (qrcodejs, MIT – licence v hlavičce souboru)
sed 's#<script src="../podpis.js" defer></script>#<script src="../podpis.js" defer></script>\n<script src="../kostra.js" defer></script>#' "$ZDROJ/excel_vzorce.html" > obsah/excel_vzorce.html
sed -i "s/const KLIC = 'webapp_excel_vzorce';/const KLIC = 'metodus_excel_vzorce';/" obsah/excel_vzorce/ui.js
# řádek kostry (drobečky, téma) nad horní lištou stránky – jako drobečky rozcestníku na webu
sed -i 's#<header class="lista" id="lista">#<header class="lista" id="lista" data-kostra-misto="pred">#' obsah/excel_vzorce.html
grep -q 'data-kostra-misto="pred"' obsah/excel_vzorce.html || { echo "Místo kostry se nenastavilo" >&2; exit 1; }
grep -q "kostra.js" obsah/excel_vzorce.html || { echo "Kostra se nepřidala" >&2; exit 1; }
grep -q "metodus_excel_vzorce" obsah/excel_vzorce/ui.js || { echo "Klíč úložiště se nezměnil" >&2; exit 1; }
echo "Převzato: obsah/excel_vzorce.html + manifest + SW + obsah/excel_vzorce/ ($(ls obsah/excel_vzorce | wc -l) souborů) + obsah/lib/xlsx. Nezapomeňte zvednout verzi v sw.js."
