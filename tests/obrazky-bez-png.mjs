// Originály ilustrací (obsah/img/**/*.png) jsou v .gitignore: leží na disku vedle
// WebP, ale na web nejdou. Stránka, která by na PNG odkázala, by tedy lokálně
// fungovala a na webu ukázala rozbitý obrázek. Tenhle test to hlídá staticky.
// Spuštění: node tests/obrazky-bez-png.mjs   (bez serveru a prohlížeče)
import assert from 'node:assert/strict';
import {execSync} from 'node:child_process';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join, normalize} from 'node:path';

const soubory = execSync('git ls-files -co --exclude-standard', {encoding: 'utf8'})
  .split('\n')
  .filter(f => /\.(html|js|mjs|css)$/.test(f) && !/^(docs|tests)\//.test(f) && !f.includes('bak-') && existsSync(f));

const chyby = [];
for (const f of soubory) {
  const text = readFileSync(f, 'utf8');
  // cesty do složky img/ (ze stránek v obsah/) i relativní cesty v galeriích obsah/img/*.html
  const vzor = f.startsWith('obsah/img/')
    ? /["'`(]((?:[\w-]+\/)[\w${}./-]+?\.png)(?=["'`)])/g
    : /["'`(]((?:\.\.\/|\.\/)?(?:obsah\/)?img\/[\w${}./-]+?\.png)(?=["'`)])/g;
  for (const [, ref] of text.matchAll(vzor)) {
    const cesta = normalize(join(dirname(f), ref));
    if (cesta.startsWith('obsah/img/') || ref.includes('img/')) chyby.push(`${f}: ${ref}`);
  }
}

// Každé WebP, na které galerie odkazují, musí být na webu.
const naWebu = new Set(execSync('git ls-files -co --exclude-standard', {encoding: 'utf8'}).split('\n'));
for (const g of ['obsah/img/kapitola-7-1.json', 'obsah/img/kapitola-7-2.json']) {
  if (!existsSync(g)) continue;
  for (const o of JSON.parse(readFileSync(g, 'utf8')))
    if (o.webp && !naWebu.has('obsah/img/' + o.webp)) chyby.push(`${g}: WebP není na webu: ${o.webp}`);
}

assert.deepEqual(chyby, [], 'Stránky odkazují na PNG originály, které na web nejdou:\n' + chyby.join('\n'));
console.log(JSON.stringify({souboru: soubory.length, odkazuNaPng: 0}));
