/* Presencia 0.6: no cambia estado funcional ni reconstruye vistas al ajustar intensidad. */
const presenceBaseEnhance=editorialEnhance,presenceBaseLocal=editorialLocalChange,presenceBaseEntry=editorialEntry;
let presenceLevel=new URLSearchParams(location.search).get('presence')==='notoria'?'notoria':'intensa',presenceObserver;
function presenceFactor(){return presenceLevel==='intensa'?1.5:1;}
function presenceSet(value){presenceLevel=value==='notoria'?'notoria':'intensa';document.body.dataset.presence=presenceLevel;document.getElementById('presence-control').value=presenceLevel;const u=new URL(location.href);u.searchParams.set('presence',presenceLevel);history.replaceState(null,'',u);}
presenceSet(presenceLevel);
document.getElementById('presence-control').addEventListener('change',e=>presenceSet(e.target.value));
function presenceAnimate(n,frames,duration=440){if(!n||editorialReduced())return;const a=n.animate(frames,{duration,easing:editorialCurve});a.id='presence-local';return a;}
function presenceFlare(n){if(!n||editorialReduced())return;const f=document.createElement('span');f.className='interaction-flare';f.setAttribute('aria-hidden','true');n.append(f);const a=presenceAnimate(f,[{opacity:.85,transform:'scale(.72)'},{opacity:0,transform:'scale(1.05)'}],480);a?.finished.catch(()=>{}).finally(()=>f.remove());}
function presenceBind(current){
 document.querySelectorAll('.first-session,.booking-grid>.surface,.operation,.next-session,.credit-panel,.upcoming,.pack-band').forEach(n=>{
  n.classList.add('reactive-plane');n.addEventListener('pointermove',e=>{if(!continuityFine.matches||e.pointerType==='touch'||editorialReduced())return;const r=n.getBoundingClientRect();n.style.setProperty('--spot-x',(e.clientX-r.left)+'px');n.style.setProperty('--spot-y',(e.clientY-r.top)+'px');n.classList.add('pointer-active');});n.addEventListener('pointerleave',()=>n.classList.remove('pointer-active'));
 });
 const head=document.querySelector('.page-head');if(head){head.insertAdjacentHTML('beforeend','<span class="task-orbit" aria-hidden="true"></span>');head.addEventListener('pointermove',e=>{if(!continuityFine.matches||editorialReduced())return;const r=head.getBoundingClientRect();head.style.setProperty('--task-x',((e.clientX-r.left)/r.width*2-1)*32+'px');head.style.setProperty('--task-y',((e.clientY-r.top)/r.height*2-1)*20+'px');});head.addEventListener('pointerleave',()=>{head.style.setProperty('--task-x','0px');head.style.setProperty('--task-y','0px');});}
 const hero=document.querySelector('.editorial-hero');if(hero){hero.addEventListener('pointermove',e=>hero.style.setProperty('--title-rule',continuityPointer?'1':'.18'));hero.addEventListener('pointerleave',()=>hero.style.setProperty('--title-rule','.18'));}
 document.querySelectorAll('.slot,.day,.panel-nav [data-tab]').forEach(n=>n.addEventListener('pointerdown',()=>presenceFlare(n)));
 presenceObserver?.disconnect();presenceObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const n=e.target;presenceAnimate(n,[{opacity:.86,transform:'translateY(22px)'},{opacity:1,transform:'none'}],600);presenceObserver.unobserve(n);}),{threshold:.08});
 if(current==='panel')document.querySelectorAll('.credit-panel,.upcoming').forEach(n=>presenceObserver.observe(n));
}
editorialEnhance=function(current,fresh,before){presenceObserver?.disconnect();presenceBaseEnhance(current,fresh,before);presenceSet(presenceLevel);presenceBind(current);};
editorialEntry=function(current){presenceBaseEntry(current);if(current!=='home')presenceAnimate(document.querySelector('.task-orbit'),[{opacity:.2,transform:'translateX(100px) rotate(-25deg)'},{opacity:1,transform:'none'}],1000);};
editorialLocalChange=function(current,before){presenceBaseLocal(current,before);if(!before||before.view!==current)return;
 if(current==='calendar'){const after=editorialSnapshot();if(before.day!==after.day||before.week!==after.week)presenceAnimate(document.querySelector('.slots'),[{transform:'translateX(28px)',opacity:.85},{transform:'none',opacity:1}],300);else document.querySelectorAll('.slot').forEach(n=>{if(before.slots.find(s=>s[0]===n.dataset.time)?.[1]!==n.getAttribute('aria-pressed'))presenceFlare(n);});if(before.total!==after.total)presenceAnimate(document.querySelector('.grand'),[{backgroundColor:'var(--c-ecc6ae, #ECC6AE)'},{backgroundColor:'transparent'}],550);}
 if(current==='panel'&&before.tab!==editorialSnapshot().tab)presenceAnimate(document.querySelector('.panel-content'),[{opacity:.8,transform:'translateX(60px)'},{opacity:1,transform:'none'}],440);
};
document.addEventListener('keydown',e=>{if(e.key==='Tab'){document.querySelectorAll('.pointer-active').forEach(n=>n.classList.remove('pointer-active'));document.querySelector('.editorial-hero')?.style.setProperty('--title-rule','.18');}if(['Enter',' '].includes(e.key)&&document.activeElement.matches('.slot,.day,.panel-nav [data-tab]'))presenceFlare(document.activeElement);});
