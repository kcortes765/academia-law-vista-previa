function servicePriceOptions(type){const prices=type==='interrogacion'?[20000,25000]:[25000,30000];return prices.map((price,i)=>`<div class="price-option"><strong>${money(price)}</strong><span>· ${i?'Penal':'Estándar'}</span></div>`).join('');}
/* Composición visual independiente; las reglas y escenarios viven en prototipo.js. */
function editorialHome(){return `
<section class="editorial-hero">
  <div class="hero-copy"><p class="eyebrow">Preparación de examen de grado · Derecho</p>
  <h1><span class="hero-line">El conocimiento</span><span class="hero-line">se afina <em>en voz alta.</em></span></h1>
  <p class="lead">Un espacio para practicar tus respuestas, ordenar lo que sabes y trabajar lo que todavía necesitas revisar.</p>
  <div class="actions"><button class="button" data-action="calendar">Elige tu próxima sesión <span aria-hidden="true">↗</span></button><a href="#servicios">Explorar las sesiones <span aria-hidden="true">↓</span></a></div>
  <p class="hero-footnote">Interrogaciones · Simulaciones · Clases online</p></div>
  <aside class="first-session"><span class="folio">Tu punto de partida</span><div class="first-session-body"><p class="eyebrow">Primera reserva</p><h2>Empecemos<br>por tu preparación.</h2><p>Diagnóstico y planificación para conversar sobre tu situación y definir un foco de trabajo.</p><div class="diagnostic-price"><strong>${money(15000)}</strong><span>Diagnóstico<br>y planificación</span></div><p class="small-text">30 minutos académicos.</p><a href="?view=calendar" data-route="calendar">Ver fechas disponibles <span aria-hidden="true">↗</span></a></div></aside>
<div class="editorial-axis" aria-hidden="true"><span></span><span></span><span></span></div></section>
<div class="practice-strip"><span><b>Online</b> desde donde estés</span><span><b>Una o varias fechas</b> a tu elección</span><span><b>Tu espacio</b> para volver a lo trabajado</span></div>
<section class="editorial-method"><div><p class="eyebrow">Una práctica con intención</p><h2>Una sesión.<br><em>Un foco concreto.</em></h2><p class="lead">La preparación toma forma<br>en cada encuentro.</p></div><ol class="method-list"><li><span>01</span><div><h3>Organiza tus fechas</h3><p>Elige un horario o construye una rutina semanal. Puedes revisar cada sesión por separado.</p></div></li><li><span>02</span><div><h3>Practica en voz alta</h3><p>Trabaja una materia y precisa el tema que quieres abordar con el profesor.</p></div></li><li><span>03</span><div><h3>Vuelve a lo trabajado</h3><p>Consulta tus sesiones y la retroalimentación cuando el profesor la publique. Su publicación es opcional.</p></div></li></ol></section>
<section id="servicios" class="editorial-services"><div class="section-heading"><div><p class="eyebrow">Encuentra tu foco</p><h2>Sesiones y precios.</h2></div><p class="muted">Todas las sesiones son online.<br>Valores en pesos chilenos.</p></div><div class="service-ledger">
${[['01','Diagnóstico','Planificación transversal o una materia de foco opcional.','15.000','Estándar · 30 min'],['02','Interrogación','Civil, Procesal o Constitucional. También Penal.','20.000','Estándar · Penal $25.000 · 60 min'],['03','Simulación','Simulación completa o práctica de examen en una de las cuatro materias.','25.000','Completa o por materia · 60 min'],['04','Clase','Trabajo de un tema de Civil, Procesal, Constitucional o Penal.','25.000','Estándar · Penal $30.000 · 60 min']].map(([n,title,description,price,detail])=>`<article class="service-line"><span class="service-number">${n}</span><div><h3>${title}</h3><p>${description}</p></div><div class="service-price">${title==='Interrogación'||title==='Clase'?servicePriceOptions(title==='Interrogación'?'interrogacion':'clase'):`<strong>$${price}</strong>`}<p>${title==='Interrogación'||title==='Clase'?'60 min':detail}</p></div><button class="icon-button" data-action="calendar" aria-label="Consultar horarios para ${title}">↗</button></article>`).join('')}
</div><aside class="pack-band"><div><p class="eyebrow">Continuidad a tu ritmo</p><h3>Cuatro interrogaciones.<br>Cuatro créditos individuales.</h3></div><div><p>Pack estándar <strong>$80.000</strong> · Pack Penal <strong>$100.000</strong>.</p><p>Compra separada de la reserva. Los créditos nacen al confirmar el abono real y vencen 45 días después.</p><button class="text-button" data-action="pack">Conocer el pack y su vigencia <span aria-hidden="true">↗</span></button></div></aside></section>`;}

let editorialObserver;
function editorialEnhance(current,fresh,before){
  if(editorialObserver)editorialObserver.disconnect();
  document.querySelectorAll('.site-header [data-route]').forEach(a=>a.setAttribute('aria-current',a.dataset.route===current?'page':'false'));
  if(current==='calendar'){
    const heading=document.querySelector('.page-head h1');heading.innerHTML='Dale un lugar<br><em>a tu próxima práctica.</em>';
    document.querySelector('.summary-heading h2').textContent='Tu selección';
    const calendar=document.querySelector('.booking-grid>section');calendar.insertAdjacentHTML('afterbegin','<p class="eyebrow calendar-label">01 / Disponibilidad</p>');
    const start=new Date(week+'T12:00:00Z'),end=new Date(nextDate(week,6)+'T12:00:00Z');
    const month=new Intl.DateTimeFormat('es-CL',{month:'long',timeZone:'UTC'});
    document.querySelector('.calendar-top h2').textContent=start.getUTCDate()+(start.getUTCMonth()===end.getUTCMonth()?'–':' '+month.format(start)+' – ')+end.getUTCDate()+' '+month.format(end);
    document.querySelectorAll('.slot').forEach(button=>{if(button.getAttribute('aria-pressed')==='true')button.insertAdjacentHTML('beforeend','<span aria-hidden="true"> ✓</span>');});
    document.querySelector('.summary-heading').insertAdjacentHTML('beforebegin','<p class="eyebrow">02 / Fechas elegidas</p>');
  }
  if(current==='panel'){
    document.querySelector('.page-head h1').innerHTML='Tu preparación,<br><em>en orden.</em>';
    const operation=document.querySelector('.operation');
    if(operation){const status={pending:0,review:1,late:1,confirmed:2,expired:0,incident:1}[scenario];operation.dataset.status=scenario;operation.insertAdjacentHTML('afterbegin','<p class="eyebrow">Operación en curso · Una transferencia</p>');
      if(['pending','review','late','confirmed'].includes(scenario))operation.insertAdjacentHTML('beforeend','<ol class="payment-track" aria-label="Pasos de confirmación">'+['Transferir e informar','Revisión del abono','Reserva confirmada'].map((label,i)=>'<li class="'+(i===status?'active':i<status?'done':'')+'"><span aria-hidden="true">'+(i<status?'✓':i+1)+'</span>'+label+(i===status?'<strong>Estado actual</strong>':'')+'</li>').join('')+'</ol>');
    }
    const next=document.querySelector('.next-session');if(next){next.insertAdjacentHTML('afterbegin','<span class="session-mark" aria-hidden="true">↗</span>');const date=next.querySelector('h2');const active=sessions.find(s=>!s.cancelled);date.setAttribute('aria-label',fullDate(active.date)+' de 2026');date.innerHTML='<span class="session-day">'+Number(active.date.slice(-2))+'</span><span>'+new Intl.DateTimeFormat('es-CL',{weekday:'long',timeZone:'UTC'}).format(new Date(active.date+'T12:00:00Z'))+'<br>octubre 2026</span>';}
  }
  /* Entrada editorial y respuesta de tarea son dos escalas de la misma gramática. */
  main.classList.remove('view-enter');
  if(fresh)editorialEntry(current);else editorialLocalChange(current,before);
  editorialObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){
    const section=entry.target;
    editorialAnimate(section.querySelector('h2'),{y:18,duration:620});
    section.querySelectorAll('.method-list li,.service-line').forEach((node,i)=>editorialAnimate(node,{y:12,duration:520,delay:Math.min(i,3)*65}));
    editorialObserver.unobserve(section);
  }}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.editorial-method,.editorial-services').forEach(section=>editorialObserver.observe(section));
}

const editorialCurve='cubic-bezier(.16,.84,.44,1)';
const editorialMedia=matchMedia('(prefers-reduced-motion:reduce)');
function editorialReduced(){return editorialMedia.matches||document.body.classList.contains('reduce-motion')||document.getElementById('motion-control').checked;}
function editorialAnimate(node,{y=0,x=0,duration=240,delay=0,depth=false,trace=false}={}){
  if(!node||editorialReduced()||!document.body.classList.contains('variant-c'))return;
  const expressive=document.getElementById('tempo-control').value==='expressive';
  const factor=expressive?1.28:1,travel=expressive?1.3:1;
  /* Información visible desde el primer fotograma. Nada bloquea ni cambia el layout. */
  const start=trace?{transform:'scaleX(.12)',opacity:.8}:{opacity:.84,transform:depth?'perspective(1200px) translateY('+y*travel+'px) rotateX(3deg)':'translate('+x*travel+'px,'+y*travel+'px)'};
  node.animate([start,{opacity:1,transform:trace?'scaleX(1)':'none'}],{duration:duration*factor,delay:delay*factor,easing:editorialCurve,fill:'backwards'});
}
function editorialEntry(current){
  if(current==='home'){
    editorialAnimate(document.querySelector('.hero-copy>.eyebrow'),{y:8,duration:420});
    document.querySelectorAll('.hero-line').forEach((line,i)=>editorialAnimate(line,{y:22,duration:700,delay:60+i*85}));
    editorialAnimate(document.querySelector('.hero-copy>.lead'),{y:14,duration:580,delay:150});
    /* La acción no se retrasa: responde desde el primer instante. */
    editorialAnimate(document.querySelector('.hero-copy>.actions'),{y:6,duration:400});
    editorialAnimate(document.querySelector('.first-session'),{y:18,duration:760,delay:140,depth:true});
    document.querySelectorAll('.editorial-axis span').forEach((line,i)=>editorialAnimate(line,{trace:true,duration:850,delay:i*100}));
  }else{
    editorialAnimate(document.querySelector('.page-head h1'),{y:10,duration:400});
    editorialAnimate(document.querySelector('.page-head .eyebrow'),{x:6,duration:300});
  }
}
function editorialSnapshot(){
  const text=selector=>document.querySelector(selector)?.textContent;
  return {view:document.body.dataset.view,day:document.querySelector('.day.selected')?.dataset.day,week:text('.calendar-top h2'),total:text('.totals'),tab:document.querySelector('[data-tab][aria-current=page]')?.dataset.tab,status:document.querySelector('.operation')?.dataset.status,
    slots:Array.from(document.querySelectorAll('[data-time]')).map(e=>[e.dataset.time,e.getAttribute('aria-pressed')]),rows:Array.from(document.querySelectorAll('.session-selection strong')).map(e=>e.textContent)};
}
function editorialLocalChange(current,before){
  if(!before||before.view!==current)return;
  if(current==='calendar'){
    const after=editorialSnapshot();
    if(before.week!==after.week||before.day!==after.day){editorialAnimate(document.querySelector('.slots'),{y:6,duration:180});editorialAnimate(document.querySelector('.slot-heading'),{duration:180});}
    else document.querySelectorAll('[data-time]').forEach(node=>{if(before.slots.find(s=>s[0]===node.dataset.time)?.[1]!==node.getAttribute('aria-pressed'))editorialAnimate(node,{duration:180});});
    document.querySelectorAll('.session-selection').forEach(row=>{if(!before.rows.includes(row.querySelector('strong').textContent))editorialAnimate(row,{x:6,duration:220});});
    if(before.total!==after.total)editorialAnimate(document.querySelector('.totals'),{duration:180});
  }
  if(current==='panel'){
    const after=editorialSnapshot();
    if(before.tab!==after.tab)editorialAnimate(document.querySelector('.panel-content'),{y:6,duration:200});
    if(before.status!==after.status)editorialAnimate(document.querySelector('.operation-top'),{duration:180});
  }
}
function editorialCancelMotion(){document.getAnimations().forEach(a=>a.cancel());}
editorialMedia.addEventListener('change',()=>{if(editorialMedia.matches)editorialCancelMotion();});
function editorialReplay(){editorialCancelMotion();editorialEntry(document.body.dataset.view);}
