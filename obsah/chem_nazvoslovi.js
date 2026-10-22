'use strict';
const suffixData = [
  ['I','-ný','Na2O','oxid sodný',2], ['II','-natý','CaO','oxid vápenatý',1],
  ['III','-itý','Al2O3','oxid hlinitý',2], ['IV','-ičitý','CO2','oxid uhličitý',1],
  ['V','-ičný / -ečný','N2O5','oxid dusičný',2], ['VI','-ový','SO3','oxid sírový',1],
  ['VII','-istý','Cl2O7','oxid chloristý',2], ['VIII','-ičelý','OsO4','oxid osmičelý',1]
];
suffixData.forEach((s,i) => {
  const b = document.createElement('button');
  b.innerHTML = `${s[0]}<small>${s[1]}</small>`;
  b.addEventListener('click', () => {
    [...$('suffixes').children].forEach(x => x.setAttribute('aria-pressed', x === b));
    const oxygens = s[4]*(i+1)/2;
    $('suffixExample').innerHTML = `<b>${s[1]} → +${s[0]}</b> · ${s[3]}: <b>${subHtml(s[2])}</b><br>Součet oxidačních čísel: ${s[4]} × (+${i+1}) + ${oxygens} × (−2) = 0. Kyslík má v těchto oxidech oxidační číslo −II.`;
  });
  $('suffixes').append(b);
});
$('suffixes').children[2].click();
// Omezená nabídka běžných sloučenin; žádné generování nestabilních kombinací.
const cations = [['Na',1,'sodný'],['K',1,'draselný'],['Ca',2,'vápenatý'],['Mg',2,'hořečnatý'],['Al',3,'hlinitý'],['Fe',2,'železnatý'],['Fe',3,'železitý']];
const anions = [['O',2,'oxid'],['Cl',1,'chlorid'],['OH',1,'hydroxid'],['SO4',2,'síran'],['NO3',1,'dusičnan']];
const gcd = (a,b) => b ? gcd(b,a%b) : a;
function fillSelect(id, data, positive) {
  data.forEach((x,i) => {
    const o = document.createElement('option'); o.value = i;
    o.textContent = `${x[0]} (${positive?'+':'−'}${x[1]}) · ${x[2]}`; $(id).append(o);
  });
}
fillSelect('cation', cations, true); fillSelect('anion', anions, false);
$('cation').value = '4';
function labValues() {
  return {c:cations[+$('cation').value], a:anions[+$('anion').value], p:+$('positiveCount').value, n:+$('negativeCount').value};
}
function part(symbol, count) { return (!/^[A-Z][a-z]?$/.test(symbol) && count > 1 ? '('+symbol+')' : symbol) + (count === 1 ? '' : count); }
function formula(c,a,p,n) { return part(c[0],p) + part(a[0],n); }
function renderLab() {
  const {c,a,p,n} = labValues();
  $('labFeedback').textContent = ''; $('labSteps').hidden = true;
  if (![p,n].every(x => Number.isInteger(x) && x >= 1 && x <= 6)) {
    $('labFormula').textContent = '…'; $('labBalance').textContent = ''; $('ionTiles').replaceChildren();
    $('labState').textContent = 'Zadej oba počty jako celá čísla od 1 do 6.'; return false;
  }
  $('labName').textContent = a[2]+' '+c[2];
  $('labFormula').innerHTML = subHtml(formula(c,a,p,n));
  $('ionTiles').innerHTML = Array.from({length:p},()=>`<span class="ion">${subHtml(c[0])}<sup>${c[1]===1?'':c[1]}+</sup></span>`).join('') + Array.from({length:n},()=>`<span class="ion negative">${subHtml(a[0])}<sup>${a[1]===1?'':a[1]}−</sup></span>`).join('');
  const total = p*c[1]-n*a[1];
  $('labBalance').textContent = `${p} × (+${c[1]}) + ${n} × (−${a[1]}) = ${total>0?'+':''}${total}`;
  $('labState').textContent = total ? 'Náboje se zatím nevyrovnají. Změň počty iontů.' : gcd(p,n)>1 ? 'Náboj je nula. Ještě zkrať poměr počtů iontů.' : '✓ Náboj je nula a poměr je nejmenší možný.';
  return true;
}
['cation','anion','positiveCount','negativeCount'].forEach(id => $(id).addEventListener('input', renderLab));
$('labCheck').addEventListener('click', () => {
  if (!renderLab()) return;
  const {c,a,p,n} = labValues();
  $('labFeedback').textContent = p*c[1]===n*a[1] && gcd(p,n)===1 ? '✓ Hotovo! Takto se zapisuje '+a[2]+' '+c[2]+'.' : 'Ještě uprav počty. '+$('labState').textContent;
});
$('labHint').addEventListener('click', () => {
  const {c,a} = labValues(), d = gcd(c[1],a[1]), p = a[1]/d, n = c[1]/d;
  $('labSteps').innerHTML = `<li>Kladný ion má náboj +${c[1]}, záporný −${a[1]}.</li><li>Nejmenší společný násobek velikostí nábojů je ${p*c[1]}. Potřebuješ ${p} kladných a ${n} záporných iontů.</li><li>Ověř: ${p} × (+${c[1]}) + ${n} × (−${a[1]}) = 0.</li><li>Výsledek: <b>${subHtml(formula(c,a,p,n))}</b>. ${!/^[A-Z][a-z]?$/.test(a[0]) && n>1 ? 'Víceatomový ion uzavři do závorky a jeho počet napiš za ni.' : 'Index 1 se nepíše.'}</li>`;
  $('labSteps').hidden = false;
});
$('labTask').addEventListener('click', () => {
  const old = +$('cation').value*anions.length + +$('anion').value;
  const next = (old+1+Math.floor(Math.random()*(cations.length*anions.length-1)))%(cations.length*anions.length);
  $('cation').value = Math.floor(next/anions.length); $('anion').value = next%anions.length;
  $('positiveCount').value = $('negativeCount').value = 1; renderLab();
});
function explanation(l) {
  const known = cations.flatMap(c => anions.map(a => {
    const d = gcd(c[1],a[1]), p = a[1]/d, n = c[1]/d;
    return {f:formula(c,a,p,n), text:`Poměr iontů je ${p} : ${n}; ${p} × (+${c[1]}) + ${n} × (−${a[1]}) = 0.`};
  })).find(x => x.f === l[0]);
  if (known) return known.text;
  if (l[0] === 'H2O2') return 'Pozor na výjimku: v peroxidech má kyslík oxidační číslo −I.';
  if (l[0] === 'P2O5') return 'P₂O₅ je empirický vzorec (nejjednodušší poměr atomů); molekulový vzorec je P₄O₁₀.';
  if (['HCl','HF','HBr','H2S'].includes(l[0])) return 'Název kyseliny zde označuje vodný roztok; samotný H₂S se nazývá sulfan.';
  if (l[2] === 'oxidy') return 'Kyslík má zde oxidační číslo −II. Součet oxidačních čísel všech atomů je nula; z něj odvodíš koncovku druhého prvku.';
  if (l[2] === 'kyseliny') return 'U těchto kyslíkatých kyselin počítej H jako +I a O jako −II. Součet oxidačních čísel je nula.';
  if (l[2] === 'soli') return 'Název soli určuje záporný ion a potom kladný ion. Jejich náboje se ve vzorci vyrovnají.';
  return 'Dolní index označuje počet atomů předcházejícího prvku; za závorkou násobí celou skupinu. Jednička se nepíše.';
}
renderLab();
