(() => {
 const host=document.getElementById('podrobnyPrubeh');if(!host)return;
 const count=x=>Number.isFinite(x)&&x>=0?x:0;
 window.renderPrubeh=()=>{
  const totals=new Map();
  Object.values(Prubeh.read()).forEach(day=>{
   if(!day||typeof day!=='object')return;
   Object.entries(day).forEach(([file,row])=>{
    if(!row||typeof row!=='object')return;
    const sum=totals.get(file)||{zahajene:0,odpovedi:0,dokoncene:0,napoprve:0,sPodporou:0};
    Object.keys(sum).forEach(k=>sum[k]+=count(row[k]));totals.set(file,sum);
   });
  });
  host.replaceChildren();
  if(!totals.size){host.textContent='Zatím nejsou podrobné záznamy. Vznikají při odpovídání na výběrové otázky v pěti pilotních lekcích.';return;}
  for(const [file,s] of totals){
   const card=document.createElement('article');card.className='prubeh-radek';
   const title=document.createElement('h3');title.textContent=KATALOG.get(file)?.nazev||file;
   const text=document.createElement('p');text.textContent=`Zahájené otázky: ${s.zahajene} · Odeslané odpovědi (včetně oprav): ${s.odpovedi} · Dokončené: ${s.dokoncene} · Správně napoprvé: ${s.napoprve} · Dokončené po opravě: ${Math.max(0,s.dokoncene-s.napoprve)} · S označenou podporou: ${s.sPodporou}.`;
   card.append(title,text);host.append(card);
  }
 };
 window.addEventListener('DOMContentLoaded',window.renderPrubeh);
 window.addEventListener('storage',e=>{if(e.key===Prubeh.KEY)window.renderPrubeh();});
})();
