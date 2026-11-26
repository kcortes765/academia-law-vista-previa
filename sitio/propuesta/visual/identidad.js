/* Identidad y biografía aportadas directamente por el usuario, 08-10-2026. */
const identidadHomeBase=editorialHome;
editorialHome=function(){return identidadHomeBase().replace('Interrogaciones · Simulaciones · Clases online','José Tomás Espejo Valenzuela · Abogado').replace('<section class="editorial-method">',`<section class="about-jose" id="sobre-mi" aria-labelledby="about-title">
<div class="about-heading"><span class="about-rule" aria-hidden="true"></span><h2 id="about-title" tabindex="-1">Hola, soy<br><em>José Tomás.</em></h2>${(typeof academiaMejora==='function'&&academiaMejora('inicio-4'))?'<p class="about-role">Abogado · Profesor universitario<br>Mentor de preparación de examen de grado, UCN</p>':''}<a class="about-linkedin" href="https://www.linkedin.com/in/jos%C3%A9-tom%C3%A1s-espejo-valenzuela-a6730028a/" target="_blank" rel="noopener noreferrer" aria-label="Perfil de José Tomás Espejo Valenzuela, abogado, en LinkedIn (abre una nueva pestaña)"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5.37 24H.39V7.98h4.98V24zM2.88 5.8A2.9 2.9 0 1 1 2.9 0a2.9 2.9 0 0 1-.02 5.8zM24 24h-4.97v-7.79c0-1.86-.04-4.25-2.59-4.25-2.6 0-3 2.03-3 4.12V24H8.47V7.98h4.77v2.19h.07c.66-1.26 2.29-2.59 4.71-2.59 5.04 0 5.98 3.32 5.98 7.63V24z"/></svg></a></div>
<div class="about-copy"><h3>Rigor académico.<br>Acompañamiento cercano.</h3><p class="about-intro">Dos años preparando exámenes de grado.</p><dl class="about-credentials"><div><dt>Abogado, licenciado con distinción.</dt><dd>Universidad Católica del Norte</dd></div><div><dt class="about-exam">Examen de grado aprobado con nota 6,5.</dt><dd>Ranking N.º 1 · Generación 2025.</dd></div></dl><div class="about-background"><p>Mentor del Programa de Preparación de Examen de Grado UCN (versión <span class="about-years">2025–2026</span>).</p><p>Profesor universitario y estudiante de magíster en Derecho Penal y Procesal Penal, UCN.</p><p>Una metodología de estudio clara, directa y efectiva en Civil, Procesal, Constitucional y Penal, dedicada al acompañamiento académico riguroso de estudiantes.</p></div></div>
<figure class="about-quote"><blockquote><em>Iuris praecepta sunt haec: honeste vivere, alterum non laedere, suum cuique tribuere.</em></blockquote><figcaption>— <a href="https://droitromain.univ-grenoble-alpes.fr/Corpus/d-01.htm" target="_blank" rel="noopener noreferrer" aria-label="Ulpiano, fuente de la cita, abre una nueva pestaña">Ulpiano</a></figcaption></figure>
</section><section class="editorial-method">`).replace('Elige un horario. Define tu foco.<br>Vuelve a lo trabajado.','Elige un horario. Define tu foco.<br>Vuelve a lo trabajado.</p><p class="law-motto">Criterio jurídico.<br>Estudio claro.<br>Práctica rigurosa.').replace('José Tomás Espejo Valenzuela · Abogado</p>',(typeof academiaMejora==='function'&&academiaMejora('inicio-1'))?'José Tomás Espejo Valenzuela · Abogado</p><ul class="hero-credentials" aria-label="Trayectoria de José"><li>Examen de grado aprobado con nota 6,5</li><li>Ranking N.º 1 · Generación 2025</li><li>Mentor de preparación de examen de grado, UCN</li></ul>':'José Tomás Espejo Valenzuela · Abogado</p>');};

/* La biografía se integra después de presencia sin reconstruir cálculos ni controles. */
const identidadEnhanceBase=editorialEnhance;
let identidadObserver;
function identidadDrawLines(copy,offset=0){
 if(editorialReduced()||!copy)return;
 copy.querySelectorAll('.about-line').forEach((line,i)=>{
  line.getAnimations().forEach(a=>a.cancel());
  const a=line.animate([{transform:'scaleX(0)',opacity:1,offset:0},{transform:'scaleX(1)',opacity:1,offset:.8},{transform:'scaleX(1)',opacity:0,offset:1}],{duration:1100,delay:offset+i*120,easing:editorialCurve});a.id='about-line-'+i;
 });
}
function identidadEnter(copy){
 if(!copy||editorialReduced())return;
 [copy.querySelector('h3'),copy.querySelector('.about-intro'),copy.querySelector('.about-credentials'),copy.querySelector('.about-background')].forEach((n,i)=>{const a=n.animate([{opacity:.94,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:650,delay:i*130,easing:editorialCurve,fill:'backwards'});a.id='about-group-'+i;});
 identidadDrawLines(copy,300);
}
function identidadBlue(section){
 if(editorialReduced())return;const head=section.querySelector('.about-heading');
 const a=head.animate([{backgroundColor:'var(--c-0e2447, #0E2447)'},{backgroundColor:'var(--c-244877, #244877)',offset:.55},{backgroundColor:'var(--c-153361, #153361)'}],{duration:1250,easing:editorialCurve});a.id='about-blue-plane';
 const line=head.querySelector('.about-rule').animate([{transform:'scaleX(.15)'},{transform:'scaleX(1)'}],{duration:1100,easing:editorialCurve});line.id='about-rule-arrival';
}
editorialEnhance=function(current,fresh,before){
 identidadObserver?.disconnect();identidadEnhanceBase(current,fresh,before);if(current!=='home')return;
 const section=document.querySelector('.about-jose'),copy=section?.querySelector('.about-copy');if(!copy)return;
 const diagnostic=document.querySelector('.first-session');diagnostic?.addEventListener('focusin',e=>{if(editorialReduced())return;const r=diagnostic.getBoundingClientRect(),t=e.target.getBoundingClientRect();diagnostic.style.setProperty('--spot-x',Math.max(35,Math.min(r.width-35,t.left-r.left+t.width/2))+'px');diagnostic.style.setProperty('--spot-y',Math.max(35,Math.min(r.height-35,t.top-r.top+t.height/2))+'px');});
 const ledger=copy.querySelector('.about-credentials');ledger.insertAdjacentHTML('afterbegin','<span class="about-line about-line-top" aria-hidden="true"></span>');ledger.querySelectorAll(':scope>div').forEach(row=>row.insertAdjacentHTML('beforeend','<span class="about-line" aria-hidden="true"></span>'));
 copy.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&continuityFine.matches)identidadDrawLines(copy);});
 section.addEventListener('focusin',e=>{if(e.target.matches('a:focus-visible'))identidadDrawLines(copy);});
 identidadObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;if(e.target===section){identidadBlue(section);section.dataset.arrived='true';}else{identidadEnter(copy);copy.dataset.arrived='true';}identidadObserver.unobserve(e.target);}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});identidadObserver.observe(section);identidadObserver.observe(copy);
};
const identidadReplayBase=editorialReplay;
editorialReplay=function(){identidadReplayBase();const copy=document.querySelector('.about-copy');if(copy){const r=copy.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){identidadBlue(copy.closest('.about-jose'));identidadEnter(copy);}}};

document.addEventListener('click',e=>{const a=e.target.closest('[data-about]');if(!a)return;e.preventDefault();if(view!=='home')route('home');const heading=document.getElementById('about-title');document.getElementById('site-navigation').classList.remove('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');heading.focus({preventScroll:true});heading.closest('section').scrollIntoView({behavior:editorialReduced()?'instant':'smooth'});});
