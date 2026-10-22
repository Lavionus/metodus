/* Podrobnější deník pouze pro úlohy s výběrem v pěti pilotních lekcích.
   Starý metodus_aktivita se nemigruje: počet skutečných odpovědí z něj nelze odvodit. */
(() => {
  const KEY='metodus_prubeh_v2';
  const fields=['zahajene','odpovedi','dokoncene','napoprve','sPodporou'];
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}};
  const date=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const add=delta=>{
    try {
      const data=read(), day=date(), file=location.pathname.split('/').pop();
      if(!data[day]||typeof data[day]!=='object')data[day]={};
      const row=data[day][file]||(data[day][file]={});
      fields.forEach(k=>row[k]=(Number.isFinite(row[k])?row[k]:0)+(delta[k]||0));
      Object.keys(data).sort().slice(0,-120).forEach(k=>delete data[k]);
      localStorage.setItem(KEY,JSON.stringify(data));
    } catch { /* výuka funguje i bez úložiště */ }
  };
  window.Prubeh={KEY,read};
  const piloty=['m4_zlomky_uvod.html','ch9_ph.html','aj9_neprima_rec.html','d6_prameny.html','inf6_tabulky.html'];
  if(typeof Uloha==='undefined'||!piloty.includes(location.pathname.split('/').pop()))return;
  const original=Uloha.vyber;
  Uloha.vyber=function(options){
    const out=original(options);
    const label=document.createElement('label');label.className='prubeh-podpora';
    const input=document.createElement('input');input.type='checkbox';
    label.append(input,' Při této otázce používám nápovědu, vzor nebo pomoc druhého.');
    out.prvek.before(label);
    let attempts=0,completed=false,helpRecorded=false;
    input.addEventListener('change',()=>{if(attempts&&!completed&&input.checked&&!helpRecorded){add({sPodporou:1});helpRecorded=true;}});
    out.prvek.addEventListener('click',e=>{
      const b=e.target.closest('button');
      if(!b||b.disabled||completed||out.stav.hotovo)return;
      const correct=b.dataset.klic===String(options.spravnyKlic);
      const delta={odpovedi:1,zahajene:attempts===0?1:0};
      if(input.checked&&!helpRecorded){delta.sPodporou=1;helpRecorded=true;}
      if(correct){delta.dokoncene=1;delta.napoprve=attempts===0?1:0;completed=true;input.disabled=true;}
      attempts++;add(delta);
    },true);
    return out;
  };
})();
