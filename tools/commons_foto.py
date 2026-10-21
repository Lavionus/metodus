#!/usr/bin/env python3
"""Fotografie a historické doklady z Wikimedia Commons pro sady C a E.

  hledej "dotaz" [-n 12]          – kandidáti s licencí, autorem a rozměry
  info "File:Název.jpg"           – podrobnosti jednoho souboru
  stahni "File:…" CIL --id IMG-… --alt "…" [--typ fotografie] [--karta]
                                  – stáhne, převede (PNG 1600 px + WebP), zapíše
                                    .zdroj.txt a záznam do obsah/img/kapitola-7-2.json

CIL je cesta bez přípony vůči obsah/img, např. d/d6-recko-parthenon.
Povolené licence: volné dílo, CC0, CC BY, CC BY-SA (ne NC/ND, ne fair use).
"""
import argparse, datetime, fcntl, html, io, json, re, sys, tempfile, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

KOREN = Path(__file__).resolve().parent.parent
IMG = KOREN / 'obsah' / 'img'
MANIFEST = IMG / 'kapitola-7-2.json'
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'MetodusEdu/1.0 (educational website; image sourcing)'

LICENCE_URL = {
    'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
}


def api(**p):
    p.update(format='json')
    req = urllib.request.Request(API + '?' + urllib.parse.urlencode(p), headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def text(v):
    v = re.sub(r'<[^>]+>', '', v or '')
    v = re.sub(r'\s+', ' ', html.unescape(v)).strip()
    return re.sub(r'^(.+?)\1$', r'\1', v)   # Commons občas jméno zdvojí


def povolena(lic):
    l = lic.lower()
    if re.search(r'\bnc\b|\bnd\b|non-?commercial|no ?deriv|fair use|copyrighted', l):
        return False
    return bool(re.search(r'public domain|^pd|cc0|cc[ -]by', l))


def licence_url(meta, lic):
    url = text(meta.get('LicenseUrl', {}).get('value'))
    if url:
        return url
    m = re.match(r'cc[ -]by(-sa)?[ -](\d\.\d)', lic.lower())
    if m:
        return f"https://creativecommons.org/licenses/by{m.group(1) or ''}/{m.group(2)}/"
    return LICENCE_URL.get(lic, '')


def popis(stranka):
    ii = stranka['imageinfo'][0]
    m = ii.get('extmetadata', {})
    lic = text(m.get('LicenseShortName', {}).get('value'))
    return {
        'title': stranka['title'],
        'licence': lic,
        'licence_url': licence_url(m, lic),
        'autor': text(m.get('Artist', {}).get('value')) or text(m.get('Credit', {}).get('value')) or 'neuveden',
        'datum': text(m.get('DateTimeOriginal', {}).get('value')),
        'popis': text(m.get('ImageDescription', {}).get('value'))[:220],
        'w': ii.get('width'), 'h': ii.get('height'), 'mime': ii.get('mime'),
        'thumb': ii.get('thumburl') or ii.get('url'),
        'stranka': ii.get('descriptionurl'),
        'ok': povolena(lic),
    }


IIPROP = 'url|size|mime|extmetadata'


def hledej(dotaz, n):
    d = api(action='query', generator='search', gsrnamespace=6, gsrsearch=dotaz, gsrlimit=n,
            prop='imageinfo', iiprop=IIPROP, iiurlwidth=1600)
    stranky = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda s: s.get('index', 0))
    for s in stranky:
        if 'imageinfo' not in s:
            continue
        p = popis(s)
        znak = '✔' if p['ok'] else '✘'
        print(f"{znak} {p['title']}\n    {p['w']}×{p['h']} {p['mime']} | {p['licence']} | {p['autor'][:70]}\n    {p['popis'][:160]}")


def info(nazev):
    d = api(action='query', titles=nazev, prop='imageinfo', iiprop=IIPROP, iiurlwidth=1600)
    s = next(iter(d['query']['pages'].values()))
    if 'imageinfo' not in s:
        sys.exit(f'Soubor nenalezen: {nazev}')
    return popis(s)


def uloz_webp(im, cil, sirka, limit):
    if im.width > sirka:
        im = im.resize((sirka, round(im.height * sirka / im.width)), Image.LANCZOS)
    for q in (84, 80, 76, 72, 68, 64, 60, 55, 50, 45):
        b = io.BytesIO()
        im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= limit:
            break
    cil.write_bytes(b.getvalue())
    return im.size, b.tell()


def stahni(a):
    p = info(a.nazev)
    if not p['ok'] and not a.vynutit:
        sys.exit(f"Licence nevyhovuje: {p['licence']}")
    if p['mime'] not in ('image/jpeg', 'image/png', 'image/tiff', 'image/webp', 'image/svg+xml', 'image/gif'):
        sys.exit(f"Nepodporovaný typ: {p['mime']}")
    req = urllib.request.Request(p['thumb'], headers={'User-Agent': UA})
    with tempfile.TemporaryDirectory() as tmp:   # stažený soubor v prázdné složce
        surovy = Path(tmp) / 'stazeno'
        with urllib.request.urlopen(req, timeout=120) as r:
            surovy.write_bytes(r.read())
        im = Image.open(surovy)
        im.load()
    im = ImageOps.exif_transpose(im)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        pod = Image.new('RGB', im.size, (255, 255, 255))
        pod.paste(im, mask=im.split()[-1])
        im = pod
    else:
        im = im.convert('RGB')
    if a.orez:   # orez=l,t,r,b v poměrech 0–1
        l, t, r, b = map(float, a.orez.split(','))
        im = im.crop((round(l * im.width), round(t * im.height), round(r * im.width), round(b * im.height)))
    if im.width > 1600:
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
    cil = IMG / a.cil
    cil.parent.mkdir(parents=True, exist_ok=True)
    png = cil.with_suffix('.png')
    im.save(png, optimize=True)
    sirka, limit = (768, 60000) if a.karta else (1152, 200000)
    (w, h), velikost = uloz_webp(im, cil.with_suffix('.webp'), sirka, limit)
    dnes = datetime.date.today().isoformat()
    lic = p['licence'] + (f" ({p['licence_url']})" if p['licence_url'] else '')
    radky = [
        f'Soubor: {png.name} / {cil.name}.webp',
        f"Původní dílo: {p['title'].removeprefix('File:')}",
        f"Autor: {p['autor']}",
    ]
    if p['datum']:
        radky.append(f"Datum vzniku: {p['datum']}")
    radky += [
        f"Zdroj: {p['stranka']}",
        f'Licence: {lic}',
        f'Staženo: {dnes}',
        'Úpravy: automatické natočení, odstranění metadat, ' + ('ořez, ' if a.orez else '')
        + f'zmenšení na nejvýše 1600 px; výuková WebP kopie {w} px.',
    ]
    cil.with_suffix('.zdroj.txt').write_text('\n'.join(radky) + '\n', encoding='utf-8')
    zaznam = {
        'id': a.id, 'name': cil.name, 'alt': a.alt, 'bytes': velikost,
        'webp': f'{a.cil}.webp', 'png': f'{a.cil}.png',
        'puvod': {'typ': a.typ, 'autor': p['autor'], 'licence': p['licence'], 'datum': dnes,
                  'zdroj': f'{a.cil}.zdroj.txt'},
    }
    with open(MANIFEST.with_suffix('.zamek'), 'w') as zamek:   # souběžné stahování
        fcntl.flock(zamek, fcntl.LOCK_EX)
        data = json.loads(MANIFEST.read_text(encoding='utf-8'))
        data = [z for z in data if z.get('webp') != zaznam['webp']] + [zaznam]
        MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f"OK {a.cil}.webp {w}×{h} {velikost} B | {p['licence']} | {p['autor'][:60]}")


def nahled(nazvy, vystup):
    """Mřížka náhledů 4 × N (300 px) s čísly – výběr okem před stažením."""
    from PIL import ImageDraw
    d = api(action='query', titles='|'.join(nazvy), prop='imageinfo', iiprop=IIPROP, iiurlwidth=300)
    podle = {s['title']: s for s in d['query']['pages'].values() if 'imageinfo' in s}
    for n in d['query'].get('normalized', []):
        if n['to'] in podle:
            podle[n['from']] = podle[n['to']]
    dlazdice = []
    for i, n in enumerate(nazvy):
        s = podle.get(n)
        im = Image.new('RGB', (300, 300), (60, 60, 60))
        if s:
            try:
                req = urllib.request.Request(s['imageinfo'][0]['thumburl'], headers={'User-Agent': UA})
                with urllib.request.urlopen(req, timeout=60) as r:
                    m = Image.open(io.BytesIO(r.read())).convert('RGB')
                m.thumbnail((300, 300))
                im.paste(m, ((300 - m.width) // 2, (300 - m.height) // 2))
            except Exception as e:
                print('chyba', n, e)
        ImageDraw.Draw(im).rectangle((0, 0, 34, 26), fill=(0, 0, 0))
        ImageDraw.Draw(im).text((6, 6), str(i + 1), fill=(255, 255, 0))
        dlazdice.append(im)
    radku = (len(dlazdice) + 3) // 4
    list_ = Image.new('RGB', (4 * 304, radku * 304), (20, 20, 20))
    for i, im in enumerate(dlazdice):
        list_.paste(im, ((i % 4) * 304, (i // 4) * 304))
    list_.save(vystup)
    for i, n in enumerate(nazvy):
        print(i + 1, n)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='prikaz', required=True)
    h = sp.add_parser('hledej'); h.add_argument('dotaz'); h.add_argument('-n', type=int, default=12)
    i = sp.add_parser('info'); i.add_argument('nazev')
    n = sp.add_parser('nahled'); n.add_argument('vystup'); n.add_argument('nazvy', nargs='+')
    s = sp.add_parser('stahni')
    s.add_argument('nazev'); s.add_argument('cil')
    s.add_argument('--id', required=True); s.add_argument('--alt', required=True)
    s.add_argument('--typ', default='fotografie')
    s.add_argument('--karta', action='store_true', help='WebP 768 px do 60 kB místo 1152 px do 200 kB')
    s.add_argument('--orez', help='l,t,r,b v poměrech 0–1')
    s.add_argument('--vynutit', action='store_true', help='jen po ručním ověření licence')
    a = ap.parse_args()
    if a.prikaz == 'hledej':
        hledej(a.dotaz, a.n)
    elif a.prikaz == 'nahled':
        nahled(a.nazvy, a.vystup)
    elif a.prikaz == 'info':
        print(json.dumps(info(a.nazev), ensure_ascii=False, indent=1))
    else:
        stahni(a)


if __name__ == '__main__':
    main()
