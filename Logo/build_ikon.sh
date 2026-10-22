#!/bin/bash
# Vygeneruje celou sadu ikon Metodusu ze zdrojového ZNAK.
#
# Postup: předloha se ořízne na značku, převede na dvoubarevnou masku a
# potrace z ní udělá vektor. Z jedné vektorové cesty pak vzniká všechno
# ostatní – díky tomu jsou ikony ostré v každé velikosti a nemají pozadí
# ze skenu (bílý čtverec) ani kompresní artefakty JPEGu.
#
# Potřebuje: imagemagick, potrace, inkscape, python3 (Pillow není nutné).
# Spouští se ručně, jen když se změní podklad – výstupy jsou v gitu.
set -e
cd "$(dirname "$0")"
ZNAK=${1:-Logo_1254x1254.png}     # podklad; Logo.png je původní značka Nodusu
PRAC=$(mktemp -d)
trap 'rm -rf "$PRAC"' EXIT

# 1) ořez na značku (-trim si bbox najde sám, ať má předloha jakýkoli okraj)
#    + mírné rozostření, aby po prahování nezůstalo schodovité zoubkování
magick "$ZNAK" -fuzz 8% -trim +repage -colorspace gray -blur 0x1.2 \
       -threshold 70% "$PRAC/znak.pbm"
magick "$PRAC/znak.pbm" -format '%w %h' info: > "$PRAC/rozmer.txt"

# 2) vektorizace (jedna cesta, ~1,2 kB)
potrace "$PRAC/znak.pbm" -s -o "$PRAC/znak.svg" -a 1.3 -O 0.6 -t 20 --flat

# 3) z cesty vygenerovat logo.svg, favicon.svg/ico, icon-*.png, apple-touch-icon.png
python3 - "$PRAC" <<'PY'
import re, sys, pathlib
p = pathlib.Path(sys.argv[1])
d = re.search(r'<path d="(.*?)"/>', (p / 'znak.svg').read_text(), re.S).group(1)
(p / 'path.txt').write_text(' '.join(d.split()))
PY
python3 gen_ikon.py "$PRAC" ..

echo "Ikony přegenerovány do metodus/."
echo "Nezapomeň: inline značku v hlavičkách (viz vloz_znak.py) a verzi cache v metodus/sw.js."
