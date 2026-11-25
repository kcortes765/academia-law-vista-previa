/* Roles compartidos para todas las vistas. Sólo cambia color, no estado ni composición. */
(()=>{
 const query=new URLSearchParams(location.search),fallback={a:'calida',b:'estructurada'}[query.get('variant')]||'cobre';
 let current=lawPalettes[query.get('paleta')]?query.get('paleta'):fallback;
 const semantics={info:'#152F51',infoBg:'#E9EFF5',success:'#285D49',successBg:'#EDF4F0',warning:'#70401A',warningBg:'#FFF2E4',error:'#B12932',errorLight:'#FFD4CC',disabled:'#4B5260',disabledBg:'#E6E9EC',onDark:'#FFFFFF',black:'#000000',brand:'#0A66C2',brandHover:'#08569F'};
 function set(id){if(!lawPalettes[id])return;current=id;const p=lawPalettes[id];document.body.dataset.palette=id;
  for(const [key,value] of Object.entries({...p,...semantics}))if(key!=='name'&&key!=='status'&&key!=='source')document.body.style.setProperty('--p-'+key,value);
  document.body.style.setProperty('--p-controlBorder','color-mix(in srgb, var(--p-primary) 65%, var(--p-onDark))');document.body.style.setProperty('--p-lightText','color-mix(in srgb, var(--p-onDark) 78%, var(--p-primary))');
  document.body.style.setProperty('--p-halo','color-mix(in srgb, var(--p-primary) 45%, var(--p-onDark))');
  document.body.style.setProperty('--p-haloCore','color-mix(in srgb, var(--p-halo) 35%, transparent)');document.body.style.setProperty('--p-haloEdge','color-mix(in srgb, var(--p-halo) 18%, transparent)');document.body.style.setProperty('--p-haloTrail','color-mix(in srgb, var(--p-accent) 8%, transparent)');document.body.style.setProperty('--p-overlay','color-mix(in srgb, var(--p-night) 64%, transparent)');
  for(const [key,entry] of Object.entries(lawColorAliases)){const r=entry.recipe;let color='var(--p-'+r.role+')';if(r.white!==null)color=`color-mix(in srgb, ${color} ${100-r.white}%, var(--p-onDark))`;if(r.alpha!==1)color=`color-mix(in srgb, ${color} ${r.alpha*100}%, transparent)`;document.body.style.setProperty('--c-'+key,color);}
  const u=new URL(location.href);u.searchParams.set('paleta',id);history.replaceState(null,'',u);document.dispatchEvent(new CustomEvent('law-palette',{detail:{id}}));
 }
 function colors(){const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d'),probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden';document.body.append(probe);const read=css=>{probe.style.color=css;const computed=getComputedStyle(probe).color;ctx.clearRect(0,0,1,1);ctx.fillStyle=computed;ctx.fillRect(0,0,1,1);const rgba=Array.from(ctx.getImageData(0,0,1,1).data);return {css:computed,hex:'#'+rgba.slice(0,rgba[3]===255?3:4).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase()}};const roles=Object.fromEntries(lawPaletteRoles.map(([key])=>[key,read('var(--p-'+key+')')]));const aliases=Object.fromEntries(Object.keys(lawColorAliases).map(key=>[key,read('var(--c-'+key+')')]));probe.remove();return {palette:current,roles,aliases};}
 window.lawTheme={get current(){return current},set,colors};set(current);
})();
