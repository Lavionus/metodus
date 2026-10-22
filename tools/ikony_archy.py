#!/usr/bin/env python3
"""Vyrobí archy ikon Metodusu přes Codex CLI a rozřeže je (tools/ikony_rez.py).

  python3 tools/ikony_archy.py [od_archu] [do_archu]

Náměty: obsah/img/ikony/archy/namety.tsv (id<TAB>anglický popis), po 16 na arch 4 × 4,
zbytek na arch 3 × 3. Arch 01 (matematika) vznikl ručně jako pilot. Hotový arch (PNG)
se přeskočí, takže jde skript po výpadku nebo vyčerpaném limitu pustit znovu.
Codex se volá jen s výslovným souhlasem uživatele (čerpá jeho kvótu).
"""
import glob
import subprocess
import sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent
ARCHY = KOREN / 'obsah' / 'img' / 'ikony' / 'archy'

STYL = """Asset: icon sprite sheet for the Metodus Czech educational website. Match the painting style of vzor-styl.png and arch-01.png in this folder (watercolor and gouache with fine dark ink outlines, warm ivory paper #faf6ec, muted sage / jade / ochre / brick / slate-blue palette, soft daylight from upper left), SIMPLIFIED FOR SMALL ICONS exactly like arch-01.png: one bold, chunky object or tight group per icon, strong clear silhouette, slightly thicker ink outline, few details, flat even ivory background, readable when shrunk to 24 px.

Layout (very important): square 1:1 image, an exact {n} × {n} grid of {pocet} equal invisible cells, {n} rows and {n} columns, read left to right, top to bottom. Each icon is centered in its own cell and fills about 70 % of the cell, with clear empty ivory space between icons; nothing may cross into a neighbouring cell. No grid lines, no frames, no borders, no text, no words, no labels, no watermark. Single letters, digits or math symbols only where the description asks for them.

Icons in order:
{seznam}
"""
# doplnění posledního archu 3 × 3 (7 námětů + 2 náhradní)
NAVIC = [('m7_pomer', 'A folded paper map with a small scale bar ruler on it, all paper parts clearly outlined in ink.'),
         ('oblibene', 'A shiny gold five-pointed star.')]


def codex():
    kandidati = sorted(glob.glob(str(Path.home() / '.vscode-oss/extensions/openai.chatgpt-*/bin/linux-x86_64/codex')))
    if not kandidati:
        sys.exit('Codex CLI nenalezen')
    return kandidati[-1]


def main():
    od = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    do = int(sys.argv[2]) if len(sys.argv) > 2 else 99
    namety = [r.split('\t', 1) for r in (ARCHY / 'namety.tsv').read_text().splitlines() if r.strip()]
    archy = []
    while namety:
        if len(namety) >= 16:
            archy.append((4, namety[:16])); namety = namety[16:]
        else:
            archy.append((3, (namety + NAVIC)[:9])); namety = []
    bin_ = codex()
    for k, (n, rada) in enumerate(archy, start=2):
        if not od <= k <= do:
            continue
        jmeno = f'arch-{k:02d}'
        png = ARCHY / f'{jmeno}.png'
        ids = [i for i, _ in rada]
        if not png.exists():
            seznam = '\n'.join(f'{i + 1}. {popis.strip()}' for i, (_, popis) in enumerate(rada))
            zadani = f'Vygeneruj jeden obrázek a ulož ho jako {jmeno}.png do aktuální složky.\n\n' + STYL.format(n=n, pocet=n * n, seznam=seznam)
            (ARCHY / f'{jmeno}.prompt.txt').write_text(zadani + '\nId: ' + ' '.join(ids) + '\nGenerator: Codex CLI (vestavěný ImageGen)\n')
            print(f'{jmeno}: generuji ({len(rada)} ikon)…', flush=True)
            with open(ARCHY / f'{jmeno}.log', 'w') as log:
                r = subprocess.run([bin_, 'exec', '--skip-git-repo-check', '-s', 'workspace-write', zadani],
                                   cwd=ARCHY, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, timeout=900)
            text = (ARCHY / f'{jmeno}.log').read_text(errors='replace')
            if 'usage limit' in text.lower():
                print(f'{jmeno}: VYČERPANÝ LIMIT – ' + next((l for l in text.splitlines() if 'limit' in l.lower()), ''), flush=True)
                sys.exit(2)
            if r.returncode != 0 or not png.exists():
                print(f'{jmeno}: CHYBA (kód {r.returncode}), viz {jmeno}.log', flush=True)
                continue
        subprocess.run([sys.executable, str(KOREN / 'tools' / 'ikony_rez.py'), str(png), *ids, '--mrizka', str(n), '--nahled'], check=False)
    print('hotovo', flush=True)


if __name__ == '__main__':
    main()
