#!/usr/bin/env python3
"""Zapíše seznam hotových ikon (obsah/img/ikony/*.webp) do ikony.js mezi značky IKONY-ZACATEK/KONEC.
Spustit po každém řezání archů: python3 tools/ikony_seznam.py"""
import json
import re
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
ids = sorted(p.stem for p in (KOREN / 'obsah' / 'img' / 'ikony').glob('*.webp'))
js = KOREN / 'ikony.js'
text = js.read_text()
radky = []
radek = '   '
for i in ids:
    kus = ' ' + json.dumps(i) + ','
    if len(radek) + len(kus) > 118:
        radky.append(radek); radek = '   '
    radek += kus
radky.append(radek)
novy = '/* IKONY-ZACATEK (generuje tools/ikony_seznam.py) */\n  const IKONY = [\n' + '\n'.join(radky) + '\n  ];\n  /* IKONY-KONEC */'
text = re.sub(r'/\* IKONY-ZACATEK.*?IKONY-KONEC \*/', lambda m: novy, text, flags=re.S)
js.write_text(text)
print(f'ikony.js: {len(ids)} ikon')
