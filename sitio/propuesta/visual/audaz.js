/* C 0.4: capa visual. No modifica cálculos, plazos ni estados del MVP. */
const audazBaseHome=editorialHome,audazBaseEnhance=editorialEnhance,audazBaseLocal=editorialLocalChange,audazBaseSnapshot=editorialSnapshot;
let audazSummaryOpen=false,audazSummaryWide=false,audazTrap=null,audazInert=[],audazNavOpen=false,audazDialogReturn=null;
const audazMobile=matchMedia('(max-width:959px)');
editorialSnapshot=function(){return {...audazBaseSnapshot(),repeat:document.getElementById('repeat-count')?.value};};
function audazFactor(){return document.getElementById('tempo-control').value==='expressive'?1.32:1;}
function audazMove(node,frames,{duration=500,delay=0,task=false,tag='plane'}={}){
  if(!node||editorialReduced()||!document.body.classList.contains('variant-c'))return null;
  const factor=task?1:audazFactor();
  const a=node.animate(frames,{duration:duration*factor,delay:delay*factor,easing:editorialCurve,fill:'backwards'});
  a.id='audaz-'+tag;return a;
}
editorialAnimate=function(node,{y=0,x=0,duration=240,delay=0,depth=false,trace=false}={}){
  return audazMove(node,[trace?{transform:'scaleX(.06)',opacity:.8}:{opacity:.72,transform:depth?'perspective(1200px) translate('+x+'px,'+y+'px) rotateY(-8deg) rotateX(5deg)':'translate('+x+'px,'+y+'px)'},{opacity:1,transform:'none'}],{duration,delay,task:duration<=300,tag:trace?'trace':'editorial'});
};
editorialHome=function(){
  return audazBaseHome()
    .replace('<span class="hero-line">El conocimiento</span><span class="hero-line">se afina <em>en voz alta.</em></span>','<span class="hero-line">Pensar con rigor.</span><span class="hero-line">Responder</span><span class="hero-line"><em>con claridad.</em></span>')
    .replace('Un espacio para practicar tus respuestas, ordenar lo que sabes y trabajar lo que todavía necesitas revisar.',((typeof academiaMejora==='function'&&academiaMejora('inicio'))?('Dale voz a lo que sabes. Sesiones online con José Tomás, abogado, para practicar tus respuestas y trabajar lo que todavía necesitas revisar.'):('Dale voz a lo que sabes. Practica tus respuestas y trabaja lo que todavía necesitas revisar.')))
    .replace('Una sesión.<br><em>Un foco concreto.</em>','De una fecha<br><em>a una práctica.</em>')
    .replace('La preparación toma forma<br>en cada encuentro.','Elige un horario. Define tu foco.<br>Vuelve a lo trabajado.')
    .replace('Sesiones y precios.','Cada sesión,<br><em>su propósito.</em>')
    .replace('<div class="editorial-axis"','<svg class="voice-field" viewBox="0 0 900 650" aria-hidden="true"><path d="M30 560V240C30 40 270 40 270 240V480C270 670 510 670 510 480V150C510 -30 750 -30 750 150V590"/><path d="M80 600V265C80 85 320 85 320 265V470C320 610 560 610 560 470V180C560 40 800 40 800 180V600"/><path class="voice-accent" d="M0 500H900"/><path d="M0 515H760"/></svg><div class="editorial-axis"');
};
editorialEntry=function(current){
  if(current==='home'){
    editorialAnimate(document.querySelector('.hero-copy>.eyebrow'),{x:-34,duration:720});
    document.querySelectorAll('.hero-line').forEach((node,i)=>audazMove(node,[{opacity:.65,transform:'translate(-100px,18px) scale(1.045)'},{opacity:1,transform:'none'}],{duration:1180,delay:110+i*160,tag:'headline'}));
    editorialAnimate(document.querySelector('.hero-copy>.lead'),{y:14,duration:950,delay:380});
    /* CTA disponible desde el inicio; no espera a la secuencia editorial. */
    editorialAnimate(document.querySelector('.hero-copy>.actions'),{y:12,duration:430});
    editorialAnimate(document.querySelector('.first-session'),{x:155,y:62,duration:1250,delay:310,depth:true});
    document.querySelectorAll('.voice-field path').forEach((path,i)=>{
      const length=path.getTotalLength();audazMove(path,[{strokeDasharray:length,strokeDashoffset:length},{strokeDasharray:length,strokeDashoffset:0}],{duration:1700,delay:180+i*120,tag:'voice-line'});
    });
    document.querySelectorAll('.editorial-axis span').forEach((line,i)=>editorialAnimate(line,{trace:true,duration:1300,delay:300+i*160}));
  }else{
    audazMove(document.querySelector('.page-head>div'),[{opacity:.75,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:800,tag:'task-header'});
    const plane=current==='calendar'?document.querySelector('.booking-grid>aside'):document.querySelector('.next-session');
    audazMove(plane,[{opacity:.8,transform:'translateX(85px)'},{opacity:1,transform:'none'}],{duration:780,delay:90,tag:'task-plane'});
  }
};
editorialLocalChange=function(current,before){
  /* No repetir la entrada general después de editar. */
  audazBaseLocal(current,before);
  if(current==='calendar'&&before){
    document.querySelectorAll('.session-selection').forEach(row=>{if(!before.rows.includes(row.querySelector('strong').textContent))audazMove(row,[{opacity:.75,transform:'translateX(34px)'},{opacity:1,transform:'none'}],{duration:260,task:true,tag:'selected-row'});});
  }
  if(current==='panel'&&before&&before.tab!==editorialSnapshot().tab)audazMove(document.querySelector('.panel-content'),[{opacity:.8,transform:'translateX(44px)'},{opacity:1,transform:'none'}],{duration:320,task:true,tag:'panel-tab'});
};
editorialEnhance=function(current,fresh,before){
  audazRelease();audazNavOpen=false;
  audazBaseEnhance(current,fresh,before);
  editorialObserver.disconnect();
  editorialObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){
    const section=entry.target;
    editorialAnimate(section.querySelector('.section-heading')||section.querySelector(':scope>div:not(.section-trace)'),{x:-55,y:18,duration:1050});
    section.querySelectorAll('.method-list li,.service-line').forEach((node,i)=>editorialAnimate(node,{x:60,y:32,duration:850,delay:i*120}));
    editorialAnimate(section.querySelector('.pack-band'),{x:75,y:45,duration:1050,depth:true});
    editorialObserver.unobserve(section);
  }}),{threshold:.09,rootMargin:'0px 0px -4% 0px'});
  document.querySelectorAll('.editorial-method,.editorial-services').forEach(section=>editorialObserver.observe(section));
  if(current==='calendar'){
    document.querySelector('.page-head h1').innerHTML='Dale espacio<br><em>a tu preparación.</em>';
    const grid=document.querySelector('.booking-grid'),aside=grid.querySelector(':scope>aside');
    if(!fresh&&before?.repeat&&document.getElementById('repeat-count'))document.getElementById('repeat-count').value=before.repeat;
    grid.classList.toggle('summary-wide',audazSummaryWide&&!audazMobile.matches);
    grid.insertAdjacentHTML('beforebegin','<div class="summary-controls"><button class="summary-switch" aria-controls="selection-summary" aria-expanded="'+(audazMobile.matches?audazSummaryOpen:audazSummaryWide)+'">'+((typeof academiaMejora==='function'&&academiaMejora('reserva'))?((audazMobile.matches?'Ver tu selección':'Ampliar tu selección')+' <span>'+selection.length+' '+(selection.length===1?'horario':'horarios')+' ↗</span></button></div>'):((audazMobile.matches?'Abrir tu selección':'Dar espacio al resumen')+' <span>'+selection.length+' fechas ↗</span></button></div>')));
    aside.id='selection-summary';aside.insertAdjacentHTML('afterbegin','<button class="summary-close">← Volver a los horarios</button>');
    grid.insertAdjacentHTML('beforeend','<button class="summary-backdrop" tabindex="-1" aria-label="Cerrar selección"></button>');
    document.querySelector('.summary-switch').addEventListener('click',audazToggleSummary);
    document.querySelector('.summary-close').addEventListener('click',()=>audazCloseSummary(true));
    document.querySelector('.summary-backdrop').addEventListener('click',()=>audazCloseSummary(true));
    if(audazSummaryOpen&&audazMobile.matches)audazApplySummary(false);
  }else audazSummaryOpen=false;
  if(current==='panel'){
    document.querySelector('.page-head h1').innerHTML='Tu práctica.<br><em>Tu espacio.</em>';
    document.querySelector('.panel-layout').insertAdjacentHTML('beforebegin','<div class="context-controls"><button class="context-switch">Tu contexto de alumno <span aria-hidden="true">↗</span></button></div>');
    document.querySelector('.context-switch').addEventListener('click',()=>window.AcademiaUI.openProfile());
  }
};
function audazRelease(){audazInert.forEach(n=>{if(n.isConnected)n.inert=false;});audazInert=[];audazTrap=null;document.body.style.overflow='';}
function audazIsolate(target,other){audazRelease();audazTrap=target;audazInert=other.filter(Boolean).filter(n=>!n.inert);audazInert.forEach(n=>n.inert=true);document.body.style.overflow='hidden';}
function audazApplySummary(animate=true){
  const aside=document.getElementById('selection-summary');if(!aside)return;
  aside.classList.add('summary-open');aside.setAttribute('role','dialog');aside.setAttribute('aria-modal','true');aside.setAttribute('aria-label','Tu selección de sesiones');
  document.querySelector('.summary-backdrop').classList.add('visible');document.querySelector('.summary-switch').setAttribute('aria-expanded','true');
  audazIsolate(aside,[document.querySelector('.site-header'),document.querySelector('.site-footer'),document.querySelector('.review-tools'),document.querySelector('.demo-line'),...document.querySelectorAll('main>:not(.booking-grid)'),document.querySelector('.booking-grid>section')]);
  if(animate)audazMove(aside,[{transform:'translateX(100%)'},{transform:'none'}],{duration:580,task:true,tag:'summary-open'});
}
function audazToggleSummary(){
  const grid=document.querySelector('.booking-grid');
  if(audazMobile.matches){audazSummaryOpen=true;audazApplySummary();document.querySelector('.summary-close').focus({preventScroll:true});return;}
  const before=grid.querySelector('aside').getBoundingClientRect(),beforeCols=getComputedStyle(grid).gridTemplateColumns;audazSummaryWide=!audazSummaryWide;grid.classList.toggle('summary-wide',audazSummaryWide);const after=grid.querySelector('aside').getBoundingClientRect(),afterCols=getComputedStyle(grid).gridTemplateColumns;
  document.querySelector('.summary-switch').setAttribute('aria-expanded',String(audazSummaryWide));document.querySelector('.summary-switch').firstChild.textContent=((typeof academiaMejora==='function'&&academiaMejora('reserva'))?(audazSummaryWide?'Reducir tu selección ':'Ampliar tu selección '):(audazSummaryWide?'Volver al equilibrio ':'Dar espacio al resumen '));
  audazMove(grid,[{gridTemplateColumns:beforeCols},{gridTemplateColumns:afterCols}],{duration:500,task:true,tag:'composition-layout'});
  audazMove(grid.querySelector('aside .summary-heading'),[{transform:'translateX(24px)'},{transform:'none'}],{duration:420,task:true,tag:'composition-title'});
}
function audazCloseSummary(animate){
  const aside=document.getElementById('selection-summary');if(!aside||!audazSummaryOpen)return;
  const finish=()=>{audazSummaryOpen=false;aside.classList.remove('summary-open');aside.removeAttribute('role');aside.removeAttribute('aria-modal');aside.removeAttribute('aria-label');document.querySelector('.summary-backdrop')?.classList.remove('visible');audazRelease();document.querySelector('.summary-switch')?.setAttribute('aria-expanded','false');document.querySelector('.summary-switch')?.focus({preventScroll:true});};
  const a=animate?audazMove(aside,[{transform:'none'},{transform:'translateX(100%)'}],{duration:300,task:true,tag:'summary-close'}):null;
  if(a)a.finished.then(finish,finish);else finish();
}
function audazCloseNav(){
  const nav=document.querySelector('.site-header nav');
  const finish=()=>{nav.classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');audazRelease();audazNavOpen=false;document.querySelector('.menu-toggle').focus({preventScroll:true});};
  const a=audazMove(nav,[{transform:'none'},{transform:'translateX(100%)'}],{duration:300,task:true,tag:'navigation-close'});if(a)a.finished.then(finish,finish);else finish();
}
document.addEventListener('keydown',e=>{
  if(!audazTrap)return;
  if(e.key==='Escape'&&audazNavOpen){e.preventDefault();e.stopImmediatePropagation();audazCloseNav();return;}
  if(e.key==='Escape'&&audazSummaryOpen){e.preventDefault();audazCloseSummary(true);return;}
  if(e.key==='Tab'){
    const elements=[...audazTrap.querySelectorAll('a[href],button:not(:disabled),input,select,[tabindex="0"]')].filter(n=>n.getClientRects().length);
    if(audazNavOpen)elements.unshift(document.querySelector('.menu-toggle'));
    const first=elements[0],last=elements.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
audazMobile.addEventListener('change',()=>{if(audazSummaryOpen)audazCloseSummary(false);audazRelease();document.querySelector('.site-header nav')?.classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');audazNavOpen=false;const trigger=document.querySelector('.summary-switch');if(trigger){trigger.firstChild.textContent=((typeof academiaMejora==='function'&&academiaMejora('reserva'))?(audazMobile.matches?'Ver tu selección ':'Ampliar tu selección '):(audazMobile.matches?'Abrir tu selección ':'Dar espacio al resumen '));trigger.setAttribute('aria-expanded',String(!audazMobile.matches&&audazSummaryWide));}});
document.addEventListener('DOMContentLoaded',()=>{
  const baseOpen=openDialog;
  openDialog=function(html){
    const focused=document.activeElement;audazDialogReturn=focused?.dataset.manage?{manage:focused.dataset.manage}:focused?.dataset.action?{action:focused.dataset.action}:focused?.dataset.tab?{tab:focused.dataset.tab}:focused?.classList.contains('context-switch')?{context:true}:null;
    baseOpen(html);
    if(!dialog.querySelector('.drawer-folio'))dialog.insertAdjacentHTML('afterbegin','<div class="drawer-folio"><span class="drawer-brand" aria-label="Academia Law">Academia Law</span></div>');
    audazFocusDialog();
    audazMove(dialog,[{transform:'translateX(100%)'},{transform:'none'}],{duration:620,task:true,tag:'detail-open'});
  };
  let content='';
  new MutationObserver(()=>{if(!dialog.open)return;const next=dialogBody.textContent;if(next===content)return;content=next;audazFocusDialog();audazMove(dialogBody,[{opacity:.8,transform:'translateX(42px)'},{opacity:1,transform:'none'}],{duration:280,task:true,tag:'detail-state'});}).observe(dialogBody,{childList:true,subtree:true});
  const closeVisual=()=>{const a=audazMove(dialog,[{transform:'none'},{transform:'translateX(100%)'}],{duration:300,task:true,tag:'detail-close'});if(a)a.finished.then(()=>dialog.close(),()=>dialog.close());else dialog.close();};
  dialog.querySelector('form[method=dialog]').addEventListener('submit',e=>{e.preventDefault();closeVisual();});
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeVisual();});
  dialog.addEventListener('close',()=>queueMicrotask(()=>{
    if(dialog.open)return;
    const key=audazDialogReturn;let target=key?.manage?main.querySelector('[data-manage="'+key.manage+'"]'):key?.action?main.querySelector('[data-action="'+key.action+'"]'):key?.tab?main.querySelector('[data-tab="'+key.tab+'"]'):key?.context?main.querySelector('.context-switch'):null;
    if(!target?.isConnected)target=main.querySelector('.panel-nav [aria-current=page]')||main;
    target.focus({preventScroll:true});
  }));
  document.querySelector('.menu-toggle').addEventListener('click',()=>queueMicrotask(()=>{
    const nav=document.querySelector('.site-header nav');audazNavOpen=nav.classList.contains('open');
    if(audazNavOpen){audazIsolate(nav,[main,document.querySelector('.site-footer'),document.querySelector('.review-tools'),document.querySelector('.demo-line')]);audazNavOpen=true;audazMove(nav,[{transform:'translateX(100%)'},{transform:'none'}],{duration:600,task:true,tag:'navigation'});nav.querySelector('a').focus();}
    else {audazRelease();audazNavOpen=false;}
  }));
  document.querySelector('.menu-toggle').addEventListener('click',e=>{if(audazNavOpen){e.stopImmediatePropagation();audazCloseNav();}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&audazNavOpen){audazRelease();audazNavOpen=false;}});
  /* El render conserva los elementos lógicos aunque reemplace su DOM. */
  const baseRender=render;
  render=function(){baseRender();if(audazSummaryOpen&&document.activeElement===document.body)document.querySelector('.summary-close')?.focus({preventScroll:true});};
});
function audazFocusDialog(){const title=dialogBody.querySelector('h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
editorialReplay=function(){editorialCancelMotion();editorialEntry(document.body.dataset.view);if(document.body.dataset.view==='home'){
  editorialObserver?.disconnect();
  editorialObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){editorialAnimate(entry.target.querySelector('.section-heading')||entry.target.querySelector(':scope>div:not(.section-trace)'),{x:-55,y:18,duration:1050});entry.target.querySelectorAll('.method-list li,.service-line').forEach((node,i)=>editorialAnimate(node,{x:60,y:32,duration:850,delay:i*120}));editorialAnimate(entry.target.querySelector('.pack-band'),{x:75,y:45,duration:1050,depth:true});editorialObserver.unobserve(entry.target);}}),{threshold:.09});
  document.querySelectorAll('.editorial-method,.editorial-services').forEach(n=>editorialObserver.observe(n));
}};
