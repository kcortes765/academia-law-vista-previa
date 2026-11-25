/* OAuth stays in the browser; recovery storage contains only a receipt UUID. */
window.academiaCalendarConnection=function(U,tools){
 const e=escapeHTML;let panel=null,pending=null,result=null,message='',receiptUnavailable=false,liveCheck=null,checkMessage='';
 const store=()=>`academialaw.calendar-authorization:${U.state.user?.id||'anonymous'}`;
 function reset(){panel=null;pending=null;result=null;message='';receiptUnavailable=false;liveCheck=null;checkMessage='';}
 function remember(id){try{sessionStorage.setItem(store(),id);if(sessionStorage.getItem(store())!==id)throw Error();}catch{throw Error('No pudimos conservar el identificador de conexión. Habilita el almacenamiento de esta pestaña antes de autorizar.');}}
 async function status(){if(pending)result=await U.api('/api/admin/calendar/connection?request='+encodeURIComponent(pending));}
 async function load(){
  panel=null;result=null;receiptUnavailable=false;message='';liveCheck=null;checkMessage='';
  try{panel=await U.api('/api/admin/calendar/connection');const id=sessionStorage.getItem(store());pending=/^[a-f0-9-]{36}$/.test(id||'')?id:null;await status();}
  catch{receiptUnavailable=true;message=panel?'La configuración está disponible, pero no pudimos consultar el intento anterior. Consulta su estado antes de autorizar otra vez.':'No pudimos consultar la conexión. Actualiza su estado antes de autorizar.';}
 }
 function render(){
  const name={active:'Autorización guardada',reauthorization_required:'Requiere reconexión',not_connected:'Sin autorización guardada'}[panel?.storedState]||'Estado no disponible';
  const reason={authorization_denied:'Google devolvió la solicitud sin autorización.',authorization_response_invalid:'El retorno de Google no contiene una autorización válida.',token_exchange_failed:'No se pudo completar el intercambio con Google. El código usado no se repetirá.',token_response_invalid:'Google devolvió una respuesta que no permite guardar la conexión.',offline_access_missing:'Google no concedió el acceso necesario para mantener la conexión. José debe revisar una nueva autorización.',permissions_missing:'Faltan permisos requeridos. En una nueva autorización, revisa los permisos de identidad, disponibilidad y gestión del calendario creado por la aplicación.',identity_check_failed:'No se pudo comprobar la identidad con Google.',owner_mismatch:'La cuenta autorizada no coincide con la cuenta de José configurada.',calendar_access_failed:'Google no permitió comprobar el calendario de sesiones configurado. Revisa su acceso antes de autorizar otra vez.',connection_changed:'La conexión cambió durante la autorización. Consulta su estado antes de continuar.',connection_storage_failed:'No se pudo guardar la conexión. Revisa el estado antes de repetir el proceso.'}[result?.failure]||'El intento anterior no registró la causa. Requiere revisión técnica antes de repetirlo.';
  const phase={pending:'Autorización pendiente en Google.',exchanging:'Resultado pendiente: consulta antes de iniciar otra autorización.',unknown:'La autorización venció sin un resultado confirmado. Puedes iniciar una nueva; no se reintentará el código anterior.',connected:'Conexión comprobada y guardada para el calendario existente.',failed:'No se guardó una nueva conexión. '+reason}[result?.phase]||'';
  const otherPending=result?.sessionChanged&&result.phase==='pending'&&!result.expired;
  const statusMessage=otherPending?'El intento anterior sigue pendiente en otro acceso. Consulta su resultado o espera a que venza antes de autorizar de nuevo.':message;
  const mayStart=panel?.configured&&!receiptUnavailable&&!otherPending&&(!result?.found||result.phase!=='exchanging');
  const checkStatus=liveCheck?`Google respondió a la consulta de disponibilidad y del calendario de sesiones. Comprobado: ${U.dateTime(liveCheck.checkedAt)}. No crea eventos ni habilita reservas.`:checkMessage;
  const checkControl=panel?.configured&&panel.storedState==='active'?'<button type="button" class="button secondary" data-calendar-connection-check>Comprobar con Google</button>':'';
  return `<section class="ops-workspace" aria-labelledby="calendar-connection-title"><h3 id="calendar-connection-title">Conexión con Google Calendar</h3><p>${e(name)}. El estado guardado no demuestra que Google siga aceptando la autorización.</p><p>José autoriza personalmente la consulta de disponibilidad y la gestión del calendario de sesiones ya configurado. Este proceso no crea calendarios ni eventos, no cambia su autenticador y no abre reservas.</p>${!panel?.configured?'<p class="notice">Falta preparar la configuración de conexión antes de continuar.</p>':''}${phase?`<p role="status">${e(phase)}${result?.expired?' La solicitud venció.':''}</p>`:''}${statusMessage?`<p class="notice" role="status">${e(statusMessage)}</p>`:''}${checkStatus?`<p class="notice" role="status">${e(checkStatus)}</p>`:''}<div class="button-row"><button type="button" class="button secondary" data-calendar-connection-status>Consultar estado</button>${checkControl}${mayStart?'<button type="button" class="button" data-calendar-connection-start>Autorizar Calendar con Google</button>':''}</div></section>`;
 }
 document.addEventListener('click',event=>{
  const el=event.target.closest('[data-calendar-connection-status],[data-calendar-connection-start],[data-calendar-connection-check]');if(!el)return;
  void tools.safe(el,async()=>{
   if(el.hasAttribute('data-calendar-connection-status')){await load();U.paint();return;}
   if(el.hasAttribute('data-calendar-connection-check')){
    liveCheck=null;checkMessage='';
    try{
     const response=await U.api('/api/admin/calendar/connection/check',{});
     if(response.freeBusyVerified!==true||response.existingCalendarReadVerified!==true||!Number.isSafeInteger(response.checkedAt)||response.checkedAt>Date.now()+30000||response.checkedAt<Date.now()-60000)throw Error('invalid_check_response');
     liveCheck=response;
    }catch(error){
     checkMessage=({calendar_reauthorization_required:'Google requiere volver a autorizar la conexión. Revisa su estado antes de iniciar otro consentimiento.',calendar_connection_check_rate_limit:'Se alcanzó el límite de comprobaciones. Espera cinco minutos antes de consultar de nuevo.',admin_mfa_required:'Verifica tu acceso administrativo antes de comprobar la conexión.'})[error.code]||'No pudimos comprobar la disponibilidad y el calendario con Google. No se ha confirmado el resultado; puedes consultarlo nuevamente.';
    }
    U.paint();return;
   }
   if(pending)await status();
   if(result?.sessionChanged&&result.phase==='pending'&&!result.expired)throw Error('El intento anterior sigue pendiente en otro acceso. Consulta su resultado o espera a que venza antes de autorizar de nuevo.');
   if(result?.phase==='exchanging')throw Error('Consulta primero el resultado de la conexión pendiente.');
   if(!pending||(result?.found&&(result.phase!=='pending'||result.expired))){pending=crypto.randomUUID();remember(pending);result=null;}
   const response=await U.api('/api/admin/calendar/authorization',{}, {'Idempotency-Key':pending});
   if(!response.url){await load();U.paint();return;}
   const url=new URL(response.url);if(url.protocol!=='https:'||url.hostname!=='accounts.google.com'||url.pathname!=='/o/oauth2/v2/auth')throw Error('No pudimos preparar la autorización de Google.');
   window.location.assign(url.href);
  });
 });
 return {load,reset,render};
};
