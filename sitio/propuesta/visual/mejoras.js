/* Mejoras propuestas: un cambio por línea. El sitio aplica solo los códigos de esta lista.
   Para descartar un cambio, borra su línea (o ponle // delante) y guarda. Con la lista vacía el sitio queda exactamente como hoy.
   Dónde vive cada código: plataforma/PROPUESTA.md. Este archivo se carga en <head>, después de las hojas de estilo y antes de cualquier otro script. */
const MEJORAS_ACTIVAS=[
 'general-1',   // Cabeceras de página sin numeración técnica
 'general-2',   // Pie de página ordenado
 'general-3',   // Avisos, foco y página actual del menú
 'inicio-1',    // Portada con credenciales y guía para elegir sesión
 'inicio-2',    // Cómo reservar en 3 pasos
 'inicio-3',    // Sesiones y precios antes, con «Ver horarios» por servicio
 'inicio-4',    // Sobre mí: rol visible y LinkedIn en la paleta
 'inicio-5',    // «Qué pasa en una sesión»
 'inicio-6',    // Barra móvil «Ver horarios»
 'reserva-1',   // Progreso de la reserva con pasos
 'reserva-2',   // Textos claros en el interruptor del resumen
 'reserva-3',   // Elegir día y hora: días legibles y hora de Chile
 'reserva-4',   // Resumen de la reserva con condiciones en lista
 'cuenta-1',    // Próxima sesión destacada
 'cuenta-2',    // Búsqueda compacta
 'cuenta-3',    // Tarjeta de sesión con una acción principal
 'cuenta-4',    // «Tu cuenta» con menos peso
 'cuenta-5',    // Pestañas, vacíos con salida y lista de operaciones
 'operacion-1', // Estado de la operación en grande y con nombres claros
 'operacion-2', // Operación a dos columnas con pasos del pago
 'admin-1',     // Administración: pestañas Hoy / Agenda
 'admin-2',     // Administración: tablero de Hoy
 'admin-3',     // Agenda: sesiones del período en filas
 'admin-4',     // Agenda: la semana en una mirada
];

/* Desde aquí no hace falta editar. window.ACADEMIA_MEJORAS_VISTA (una lista) solo la usan revisiones locales y pruebas; producción no la define. */
function academiaMejora(id){return academiaMejora.activas.includes(id);}
academiaMejora.activas=(()=>{const vista=typeof window==='object'&&window?window.ACADEMIA_MEJORAS_VISTA:undefined;return Object.freeze([...new Set((Array.isArray(vista)?vista:MEJORAS_ACTIVAS).filter(id=>typeof id==='string'&&/^[a-z]+-\d+$/.test(id)))]);})();
if(typeof window==='object'&&window)window.academiaMejora=academiaMejora;
if(typeof document==='object'&&document&&document.documentElement){
 document.documentElement.dataset.mejoras=academiaMejora.activas.join(' ');
 // Cada hoja de la propuesta es <link rel="stylesheet" data-mejora="codigo"> en index.html: la de un código apagado no se aplica.
 for(const link of document.querySelectorAll('link[rel~="stylesheet"][data-mejora]'))link.disabled=!academiaMejora(link.dataset.mejora);
 // general-2 · Pie: index.html conserva el pie actual; con el código activo se antepone la marca y su línea reemplaza «Sesiones online · Antofagasta, Chile».
 const pie=()=>{const footer=document.querySelector('footer.site-footer');if(!footer||!academiaMejora('general-2')||footer.querySelector(':scope>.footer-brand'))return;
  for(const span of footer.querySelectorAll(':scope>span'))if(span.textContent==='Sesiones online · Antofagasta, Chile')span.remove();
  footer.insertAdjacentHTML('afterbegin','<p class="footer-brand"><span class="footer-wordmark">Academia Law</span><span>Preparación de examen de grado · Sesiones online desde Antofagasta, Chile</span></p>');};
 if(document.readyState==='loading')document.addEventListener('readystatechange',pie,{once:true});else pie();
}
