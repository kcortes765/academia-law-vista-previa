/* Mejoras propuestas, activables por módulo. Se carga en <head>, después de las hojas de estilo y antes de cualquier otro script.
   Para volver a la versión actual de una parte del sitio, borra su id de la lista y guarda el archivo.
   Con la lista vacía ([]) el sitio se ve y funciona exactamente como hoy. Qué cambia cada módulo: plataforma/MEJORAS.md.
   Módulos: 'inicio', 'acabado', 'reserva', 'cuenta', 'operacion', 'jose-hoy', 'jose-agenda'. */
const MEJORAS_ACTIVAS=['inicio','acabado','reserva','cuenta','operacion','jose-hoy','jose-agenda'];

/* Desde aquí no hace falta editar. window.ACADEMIA_MEJORAS_VISTA (una lista) sólo la usan revisiones locales; producción no la define. */
function academiaMejora(id){return academiaMejora.activas.includes(id);}
academiaMejora.modulos=Object.freeze(['inicio','acabado','reserva','cuenta','operacion','jose-hoy','jose-agenda']);
academiaMejora.activas=(()=>{const vista=typeof window==='object'&&window?window.ACADEMIA_MEJORAS_VISTA:undefined,lista=Array.isArray(vista)?vista:MEJORAS_ACTIVAS;return Object.freeze(academiaMejora.modulos.filter(id=>lista.includes(id)));})();
if(typeof window==='object'&&window)window.academiaMejora=academiaMejora;
if(typeof document==='object'&&document&&document.documentElement){
 document.documentElement.dataset.mejoras=academiaMejora.activas.join(' ');
 // Hojas de la propuesta: <link rel="stylesheet" data-mejora="id">. Las de un módulo apagado no se aplican.
 for(const link of document.querySelectorAll('link[rel~="stylesheet"][data-mejora]'))link.disabled=!academiaMejora(link.dataset.mejora);
 // Pie (acabado): index.html conserva el pie actual; con el módulo activo se antepone la marca y su línea reemplaza «Sesiones online · Antofagasta, Chile».
 const pie=()=>{const footer=document.querySelector('footer.site-footer');if(!footer||!academiaMejora('acabado')||footer.querySelector(':scope>.footer-brand'))return;
  for(const span of footer.querySelectorAll(':scope>span'))if(span.textContent==='Sesiones online · Antofagasta, Chile')span.remove();
  footer.insertAdjacentHTML('afterbegin','<p class="footer-brand"><span class="footer-wordmark">Academia Law</span><span>Preparación de examen de grado · Sesiones online desde Antofagasta, Chile</span></p>');};
 if(document.readyState==='loading')document.addEventListener('readystatechange',pie,{once:true});else pie();
}
