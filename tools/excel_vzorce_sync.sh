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
cp "$ZDROJ"/excel_vzorce/*.js "$ZDROJ"/excel_vzorce/*.css obsah/excel_vzorce/
cp "$ZDROJ"/lib/xlsx/xlsx.full.min.js "$ZDROJ"/lib/xlsx/LICENSE.txt obsah/lib/xlsx/
sed 's#<script src="../podpis.js" defer></script>#<script src="../podpis.js" defer></script>\n<script src="../kostra.js" defer></script>#' "$ZDROJ/excel_vzorce.html" > obsah/excel_vzorce.html
sed -i "s/const KLIC = 'webapp_excel_vzorce';/const KLIC = 'metodus_excel_vzorce';/" obsah/excel_vzorce/ui.js
grep -q "kostra.js" obsah/excel_vzorce.html || { echo "Kostra se nepřidala" >&2; exit 1; }
grep -q "metodus_excel_vzorce" obsah/excel_vzorce/ui.js || { echo "Klíč úložiště se nezměnil" >&2; exit 1; }
echo "Převzato: obsah/excel_vzorce.html + obsah/excel_vzorce/ ($(ls obsah/excel_vzorce | wc -l) souborů) + obsah/lib/xlsx. Nezapomeňte zvednout verzi v sw.js."
