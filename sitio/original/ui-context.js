/* Contracts consumed by the approved visual layers. No demo data or authority. */
const visualURL=new URL(location.href);for(const key of ['scenario','persona','comparar','variant'])visualURL.searchParams.delete(key);visualURL.searchParams.set('paleta','cobre');visualURL.searchParams.set('type','source');history.replaceState(null,'',visualURL);
const main=document.getElementById('main'),dialog=document.getElementById('dialog'),dialogBody=document.getElementById('dialog-body');
let view='home',scenario='empty',day='',week='',selection=[],panelTab='sessions',sessions=[];
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=s=>new Intl.DateTimeFormat('es-CL',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
const fullDate=s=>new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
const nextDate=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
function announce(text){document.getElementById('live').textContent=text;}
function route(to){return window.AcademiaUI?.route(to);}
function render(){return window.AcademiaUI?.render();}
function openDialog(html){if(!dialog.open)operationDialogFocus=window.academiaAccessibility?.capture(main);dialogBody.innerHTML=html;const title=dialogBody.querySelector('h1,h2,h3');if(title){title.id='operation-dialog-title';dialog.setAttribute('aria-labelledby',title.id);dialog.removeAttribute('aria-label');}else{dialog.removeAttribute('aria-labelledby');dialog.setAttribute('aria-label','Gestión de Academia Law');}window.academiaAccessibility?.enhance(dialogBody);if(!dialog.open)dialog.showModal();}

let operationDialogFocus=null;function restoreOperationDialogFocus(){const focus=operationDialogFocus;operationDialogFocus=null;if(!dialog.open)window.academiaAccessibility?.restore(main,focus);}
