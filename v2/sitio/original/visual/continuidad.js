/* 0.5: ambientación, puntero y desplazamiento se turnan; no alteran tareas. */
const continuityParams=new URLSearchParams(location.search),continuityBaseEnhance=editorialEnhance,continuityBaseReplay=editorialReplay;
let continuityType=['playfair','source','sans'].includes(continuityParams.get('type'))?continuityParams.get('type'):'source';
let continuityPaused=continuityParams.get('ambient')==='paused',continuityReady=false,continuityGeneration=0,continuityPointer=false,continuityScrolling=false,continuityVisible=true,continuityFrame=0,continuityScrollTimer=0,continuityObserver;
const continuityFine=matchMedia('(hover:hover) and (pointer:fine)');
document.body.dataset.type=continuityType;
document.body.classList.toggle('type-sample',continuityParams.get('sample')==='1');
document.getElementById('type-control').value=continuityType;
document.getElementById('ambient-control').checked=continuityPaused;
function continuityURL(){const url=new URL(location.href);url.searchParams.set('type',continuityType);if(continuityPaused)url.searchParams.set('ambient','paused');else url.searchParams.delete('ambient');history.replaceState(null,'',url);}
function continuitySetType(type){if(!['playfair','source','sans'].includes(type))return;continuityType=type;document.body.dataset.type=type;document.getElementById('type-control').value=type;continuityURL();document.dispatchEvent(new CustomEvent('continuity-type',{detail:{type}}));announce('Alternativa tipográfica '+({playfair:'A, Playfair',source:'B, Source Serif',sans:'C, sans con acento serif'}[type])+'. Tus fechas se conservan.');}
function continuitySetAmbient(paused){continuityPaused=paused;document.getElementById('ambient-control').checked=paused;continuityURL();continuityUpdate();document.dispatchEvent(new CustomEvent('continuity-ambient',{detail:{paused}}));}
function continuityResetPointer(){continuityPointer=false;const hero=document.querySelector('.editorial-hero');if(hero){['--pointer-x','--pointer-y','--title-x','--title-y'].forEach(key=>hero.style.setProperty(key,'0px'));}}
function continuityUpdate(){
 const reduced=editorialReduced(),canRun=!reduced&&!continuityPaused&&continuityReady&&continuityVisible&&!continuityPointer&&!continuityScrolling&&!document.hidden&&document.body.dataset.view==='home'&&!document.body.classList.contains('type-sample');
 document.body.dataset.ambient=canRun?'running':'paused';
 /* Repetir entrada cancela animaciones de página. Reponer sólo el ambiente
    si quedó cancelado; pausar/reanudar normalmente conserva su fase. */
 const atmosphere=document.querySelector('.voice-atmosphere');
 if(canRun&&atmosphere&&!atmosphere.getAnimations().some(a=>a.animationName==='ambient-drift')){atmosphere.style.animation='none';void atmosphere.offsetWidth;atmosphere.style.animation='';}
 document.body.dataset.motionMode=reduced?'reduced':continuityPointer?'pointer':continuityScrolling?'scroll':canRun?'ambient':'rest';
 const toggle=document.querySelector('.ambient-toggle');if(toggle){toggle.disabled=reduced;toggle.setAttribute('aria-pressed',String(continuityPaused||reduced));toggle.textContent=reduced?'Ambiente detenido · movimiento reducido':continuityPaused?'Reanudar ambiente':'Pausar ambiente';}
 if(reduced)continuityResetPointer();
}
function continuityAfterEntry(){
 const generation=++continuityGeneration;continuityReady=false;continuityUpdate();
 const entries=document.getAnimations().filter(a=>a.id.startsWith('audaz-')&&Number.isFinite(a.effect.getTiming().iterations));
 Promise.allSettled(entries.map(a=>a.finished)).then(()=>{if(generation!==continuityGeneration)return;continuityReady=true;continuityUpdate();});
}
function continuityScroll(){
 if(continuityFrame)return;
 continuityFrame=requestAnimationFrame(()=>{
  continuityFrame=0;const hero=document.querySelector('.editorial-hero');if(!hero||editorialReduced())return;
  const r=hero.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/r.height));
  hero.style.setProperty('--scroll-depth',Math.round(p*24)+'px');hero.style.setProperty('--scroll-angle',(p*2.2).toFixed(2)+'deg');
  document.querySelector('.practice-strip')?.style.setProperty('--journey-progress',p.toFixed(3));
  document.querySelectorAll('.editorial-method,.editorial-services').forEach(section=>{const rect=section.getBoundingClientRect();const fraction=Math.max(.12,Math.min(1,(innerHeight-rect.top)/(innerHeight*.85)));section.style.setProperty('--section-progress',fraction.toFixed(3));});
 });
}
editorialEnhance=function(current,fresh,before){
 continuityObserver?.disconnect();continuityResetPointer();continuityBaseEnhance(current,fresh,before);continuityURL();
 if(current==='home'){
  const hero=document.querySelector('.editorial-hero'),graphic=hero.querySelector('.voice-field');
  const wrapper=document.createElement('div');wrapper.className='voice-atmosphere';wrapper.setAttribute('aria-hidden','true');wrapper.innerHTML='<div class="ambient-halo"></div>';graphic.before(wrapper);wrapper.append(graphic);
  document.querySelector('.practice-strip').insertAdjacentHTML('afterbegin','<span class="journey-trace" aria-hidden="true"></span>');
  document.querySelectorAll('.editorial-method,.editorial-services').forEach(section=>section.insertAdjacentHTML('afterbegin','<div class="section-trace" aria-hidden="true"></div>'));
  /* Los trazos son decorativos y no cambian el primer grupo editorial. */
  hero.addEventListener('pointermove',e=>{
   if(!continuityFine.matches||e.pointerType==='touch'||editorialReduced()||!continuityReady||e.target.closest('button,a')){continuityResetPointer();continuityUpdate();return;}
   const r=hero.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
   continuityPointer=true;hero.style.setProperty('--pointer-x',(x*(typeof presenceFactor==='function'?64*presenceFactor():18)).toFixed(2)+'px');hero.style.setProperty('--pointer-y',(y*(typeof presenceFactor==='function'?36*presenceFactor():10)).toFixed(2)+'px');hero.style.setProperty('--title-x',(x*(typeof presenceFactor==='function'?12*presenceFactor():3)).toFixed(2)+'px');hero.style.setProperty('--title-y',(y*(typeof presenceFactor==='function'?7*presenceFactor():2)).toFixed(2)+'px');continuityUpdate();
  });
  hero.addEventListener('pointerleave',()=>{continuityResetPointer();continuityUpdate();});
  continuityVisible=true;
  continuityObserver=new IntersectionObserver(entries=>{continuityVisible=entries[0].isIntersecting;continuityUpdate();},{threshold:0});continuityObserver.observe(hero);
  document.querySelectorAll('.service-line').forEach(row=>{
   row.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')row.classList.add('is-touch-active');});
   ['pointerup','pointercancel','pointerleave'].forEach(event=>row.addEventListener(event,()=>row.classList.remove('is-touch-active')));
  });
  continuityAfterEntry();continuityScroll();
 }else{continuityReady=false;continuityUpdate();}
};
editorialReplay=function(){continuityBaseReplay();continuityAfterEntry();};
document.getElementById('type-control').addEventListener('change',e=>continuitySetType(e.target.value));
document.getElementById('ambient-control').addEventListener('change',e=>continuitySetAmbient(e.target.checked));
document.getElementById('motion-control').addEventListener('change',()=>{continuityResetPointer();continuityUpdate();continuityScroll();});
editorialMedia.addEventListener('change',()=>{continuityResetPointer();continuityUpdate();continuityScroll();});
continuityFine.addEventListener('change',()=>{continuityResetPointer();continuityUpdate();});
document.addEventListener('visibilitychange',continuityUpdate);
document.addEventListener('keydown',e=>{if(['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){continuityResetPointer();continuityUpdate();}});
window.addEventListener('scroll',()=>{continuityScrolling=true;continuityResetPointer();continuityUpdate();continuityScroll();clearTimeout(continuityScrollTimer);continuityScrollTimer=setTimeout(()=>{continuityScrolling=false;continuityUpdate();},180);},{passive:true});
window.addEventListener('resize',continuityScroll,{passive:true});
