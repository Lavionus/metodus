#!/usr/bin/env python3
"""Sestaví data/obrazky-zdroje.json: ke každé stránce seznam převzatých obrázků
(fotografie, reprodukce, doklady) s autorem, licencí a odkazem na zdroj.

kostra.js podle něj na konci stránky vypíše „Zdroje obrázků“ – licence CC BY
a CC BY-SA vyžadují uvedení autora, názvu licence a odkazu.
Spouštět po každé změně obrazových sad:  python3 tools/zdroje_obrazku.py
"""
import json, re, sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
OBSAH = KOREN / 'obsah'
IMG = OBSAH / 'img'
CIL = KOREN / 'data' / 'obrazky-zdroje.json'


def licence_url(lic):
    l = lic.lower().replace('-', ' ')
    m = re.search(r'cc by( sa)? (\d\.\d)', l)
    if m:
        return f"https://creativecommons.org/licenses/by{'-sa' if m.group(1) else ''}/{m.group(2)}/"
    if 'cc0' in l:
        return 'https://creativecommons.org/publicdomain/zero/1.0/'
    return ''


def cti_zdroj(cesta):
    pole = {}
    if cesta.exists():
        for r in cesta.read_text(encoding='utf-8').splitlines():
            k, _, v = r.partition(':')
            if v:
                pole.setdefault(k.strip().lower(), v.strip())
    return pole


def polozky():
    for manifest in ('kapitola-7-1.json', 'kapitola-7-2.json'):
        for z in json.loads((IMG / manifest).read_text(encoding='utf-8')):
            p = z.get('puvod') or {}
            if p.get('typ', 'generovano') == 'generovano' or not z.get('webp'):
                continue
            pole = cti_zdroj(IMG / p.get('zdroj', z['webp'].replace('.webp', '.zdroj.txt')))
            lic = p.get('licence') or pole.get('licence', '')
            lic_text = re.split(r' — | \(|\s+https?://', lic)[0].strip()
            url_lic = (pole.get('licence url') or (re.search(r'https?://\S+?(?=\)|$)', pole.get('licence', '')) or [''])[0]
                       or licence_url(lic_text))
            nazev = (pole.get('název') or pole.get('původní dílo') or pole.get('název knihy') or z.get('alt', '')).removesuffix('.jpg')
            yield {
                'w': z['webp'],
                'n': nazev,
                'a': p.get('autor') or pole.get('autor') or pole.get('autor fotografie') or 'neuveden',
                'l': lic_text,
                'lu': url_lic,
                'z': next((pole[k] for k in ('zdroj', 'zdrojová stránka', 'zdroj záznamu', 'zdroj stránky', 'zdroj svazku', 'přímý zdroj') if pole.get(k)), ''),
            }


def zdrojaky():
    """html stránky a k nim skripty, které načítají (obrázky bývají i v .js)."""
    stranky = {}
    for h in sorted(OBSAH.glob('*.html')):
        t = h.read_text(encoding='utf-8', errors='replace')
        for src in re.findall(r'<script[^>]+src="([^"]+\.js)"', t):
            s = (h.parent / src).resolve()
            if s.is_file() and OBSAH in s.parents:   # jen skripty stránek, ne společné jádro
                t += s.read_text(encoding='utf-8', errors='replace')
        stranky['obsah/' + h.name] = t
    return stranky


def main():
    vse = list(polozky())
    stranky = zdrojaky()
    mapa, nevyuzite = {}, []
    for i, p in enumerate(vse):
        jmeno = Path(p['w']).stem
        vzor = re.compile(re.escape(jmeno) + r'(?![\w-])')   # ne „liska“ v „liska-listy“
        nalez = [s for s, t in stranky.items() if vzor.search(t)]
        for s in nalez:
            mapa.setdefault(s, []).append(i)
        if not nalez:
            nevyuzite.append(p['w'])
    bez_zdroje = [p['w'] for p in vse if not p['z']]
    CIL.write_text(json.dumps({'zdroje': vse, 'stranky': mapa}, ensure_ascii=False, separators=(',', ':')) + '\n',
                   encoding='utf-8')
    print(f'{len(vse)} převzatých obrázků na {len(mapa)} stránkách → {CIL.relative_to(KOREN)}')
    for w in nevyuzite:
        print('  nezapojeno:', w)
    for w in bez_zdroje:
        print('  BEZ ODKAZU NA ZDROJ:', w)
    return 1 if bez_zdroje else 0


if __name__ == '__main__':
    sys.exit(main())
