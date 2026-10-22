#!/usr/bin/env python3
"""Rozřeže arch ikon z Codexu (mřížka N × N) na jednotlivé ikony Metodusu.

  python3 tools/ikony_rez.py obsah/img/ikony/archy/arch-01.png id1 id2 … id16 [--mrizka 4] [--nahled]

Každá buňka: najde se kresba (záplava papíru od okrajů, úlomky sousedních ikon u okraje buňky
se zahodí), ořízne se, položí na slonovinovou dlaždici se zaoblenými rohy a uloží jako
obsah/img/ikony/<id>.webp (128 × 128). Id „-“ buňku přeskočí.
S --nahled vznikne archy/<arch>-nahled.png – ikony na světlém i tmavém podkladu ke kontrole.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

KOREN = Path(__file__).resolve().parent.parent
CIL = KOREN / 'obsah' / 'img' / 'ikony'
VELIKOST = 128
OKRAJ = 0.08        # volné místo kolem kresby na dlaždici (podíl strany)
ZAOBLENI = 0.2      # poloměr rohů dlaždice (podíl strany)
PRAH = 52           # tolerance barvy papíru a jeho stínu při záplavě
ZNACKA = (255, 0, 255)
PAPIR = (250, 246, 236)   # jednotná barva dlaždic napříč archy (#faf6ec)


def casti(maska: Image.Image) -> Image.Image:
    """Ponechá hlavní kresbu buňky: souvislé části, které se nedotýkají okraje buňky (přesahy
    ze sousedních ikon se ho dotýkají vždy), a největší část, i kdyby k okraji sahala.
    Drobné smítko (pod 2 % největší části) zahodí."""
    m = maska.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # bez šumu papíru
    w, h = m.size
    znacky = []   # (štítek, plocha, dotýká se okraje)
    stitek = 1
    px = m.load()
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if px[x, y] == 255 and stitek < 250:
                ImageDraw.floodfill(m, (x, y), stitek)
                znacky.append(stitek); stitek += 1
    hist = m.histogram()
    okraj = set()
    for x in range(w):
        okraj.add(px[x, 0]); okraj.add(px[x, h - 1])
    for y in range(h):
        okraj.add(px[0, y]); okraj.add(px[w - 1, y])
    if not znacky:
        return maska
    nejvetsi = max(znacky, key=lambda z: hist[z])
    nech = {z for z in znacky if hist[z] >= 0.02 * hist[nejvetsi] and (z not in okraj or z == nejvetsi)}
    return m.point(lambda v: 255 if v in nech else 0)


def ikona(bunka: Image.Image) -> Image.Image:
    rgb = bunka.convert('RGB')
    # rámeček v barvě papíru z rohu buňky, aby záplava obešla celý okraj
    papir = rgb.getpixel((3, 3))
    w, h = rgb.size
    plocha = Image.new('RGB', (w + 8, h + 8), papir)
    plocha.paste(rgb, (4, 4))
    ImageDraw.floodfill(plocha, (0, 0), ZNACKA, thresh=PRAH)
    plocha = plocha.crop((4, 4, w + 4, h + 4))
    # maska: pozadí 0, kresba 255
    rozdil = ImageChops.difference(plocha, Image.new('RGB', plocha.size, ZNACKA)).convert('L')
    maska = casti(rozdil.point(lambda v: 255 if v > 8 else 0))
    maska = maska.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    box = maska.point(lambda v: 255 if v > 40 else 0).getbbox()
    if not box:
        raise ValueError('prázdná buňka')
    # ikona leží na vlastní slonovinové dlaždici se zaoblenými rohy (jako ilustrace předmětů):
    # světlé plochy kresby tak nikdy nesplynou s pozadím stránky v žádném motivu
    vyrez = rgb.crop(box)
    m = maska.crop(box)
    strana = int(max(vyrez.size) * (1 + 2 * OKRAJ))
    ctverec = Image.new('RGB', (strana, strana), PAPIR)
    ctverec.paste(vyrez, ((strana - vyrez.width) // 2, (strana - vyrez.height) // 2), m)
    rohy = Image.new('L', (strana * 4, strana * 4), 0)
    ImageDraw.Draw(rohy).rounded_rectangle((0, 0, strana * 4 - 1, strana * 4 - 1), radius=int(strana * 4 * ZAOBLENI), fill=255)
    ctverec = ctverec.convert('RGBA')
    ctverec.putalpha(rohy.resize((strana, strana), Image.LANCZOS))
    return ctverec.resize((VELIKOST, VELIKOST), Image.LANCZOS)


def main():
    argv = sys.argv[1:]
    n = 4
    if '--mrizka' in argv:
        i = argv.index('--mrizka'); n = int(argv[i + 1]); del argv[i:i + 2]
    nahled = '--nahled' in argv
    argv = [a for a in argv if a != '--nahled']
    arch, ids = Path(argv[0]), argv[1:]
    if len(ids) != n * n:
        sys.exit(f'čekám {n * n} id, dostal jsem {len(ids)}')
    obr = Image.open(arch)
    W, H = obr.size
    CIL.mkdir(parents=True, exist_ok=True)
    hotove = []
    for k, id_ in enumerate(ids):
        if id_ == '-':
            continue
        r, s = divmod(k, n)
        bunka = obr.crop((round(s * W / n), round(r * H / n), round((s + 1) * W / n), round((r + 1) * H / n)))
        ik = ikona(bunka)
        ik.save(CIL / f'{id_}.webp', 'WEBP', quality=88, method=6)
        hotove.append((id_, ik))
    print(f'{arch.name}: {len(hotove)} ikon → {CIL.relative_to(KOREN)}')
    if nahled and hotove:
        sl = 6; m = 24
        radky = (len(hotove) + sl - 1) // sl
        nah = Image.new('RGB', (sl * 2 * (VELIKOST + m) + m, radky * (VELIKOST + m) + m), (250, 246, 236))
        tma = Image.new('RGB', ((VELIKOST + m) * sl, nah.height), (36, 36, 36))
        nah.paste(tma, (sl * (VELIKOST + m) + m, 0))
        for k, (_, ik) in enumerate(hotove):
            r, s = divmod(k, sl)
            for posun in (0, sl * (VELIKOST + m)):
                nah.paste(ik, (m + posun + s * (VELIKOST + m), m + r * (VELIKOST + m)), ik)
        nah.save(arch.with_name(arch.stem + '-nahled.png'))


if __name__ == '__main__':
    main()
