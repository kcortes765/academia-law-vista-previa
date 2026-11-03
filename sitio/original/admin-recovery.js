/* Recovery stores only a receipt identifier. Never persist a code or put it in a URL. */
window.academiaAdminRecovery=function(U,tools){
 const e=escapeHTML,key='academialaw.admin-recovery.v1';let open=false,pending=null,message='';
 function load(){if(pending)return;try{const value=JSON.parse(sessionStorage.getItem(key)||'null');if(value&&/^[a-f0-9-]{36}$/.test(value.requestId)&&value.userId===U.state.user?.id){pending=value;open=true;}}catch{}}
 function clear(){pending=null;try{sessionStorage.removeItem(key);}catch{}}
 function reset(){open=false;pending=null;message='';try{sessionStorage.removeItem(key);}catch{}}
 function render(){load();if(!open)return `<p>${tools.button('Perdí el teléfono: usar código de recuperación','data-recovery-open',true)}</p>`;return `<fieldset class="ops-workspace admin-recovery"><h3>Recuperar acceso con un código guardado</h3><p>Necesitas el acceso Google de José y un código de respaldo de Academia Law. Se usa una sola vez y habilita esta sesión durante un máximo de 15 minutos. Se revocan los permisos administrativos de otras sesiones. El autenticador actual se conserva.</p><p>Tras recuperar el acceso, coordina con José el reemplazo del teléfono y la renovación segura del factor. No compartas los códigos por correo o chat.</p>${pending?`<section class="notice"><p>Hay una recuperación cuyo resultado debes comprobar antes de gastar otro código.</p>${tools.button('Consultar recuperación pendiente','data-recovery-status',true)}</section>`:''}${message?`<p class="notice" role="status">${e(message)}</p>`:''}<form id="admin-recovery-form"><label>Código de recuperación<input id="admin-recovery-code" name="code" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" required maxlength="64"></label><button class="button">${pending?'Reintentar el mismo código':'Usar código y entrar'}</button></form><p>Si no tienes los códigos guardados o tampoco puedes entrar a Google, coordina una recuperación manual con José. Mantén las nuevas admisiones cerradas hasta recuperar un acceso comprobado.</p>${tools.button('Volver al autenticador','data-recovery-close',true)}</fieldset>`;}
 async function finish(result){
  if(!result.found){message='La recuperación aún no aparece registrada. Consulta otra vez o reintenta exactamente el mismo código; se conserva el identificador.';U.paint();return;}
  clear();
  if(!result.sameSession){message='La solicitud corresponde a otro inicio de sesión. Para esta sesión Google utiliza un código distinto que no hayas usado.';U.paint();return;}
  if(!result.accessReady){message='La recuperación fue registrada, pero el permiso ya no está vigente. Utiliza otro código para verificar esta sesión.';U.paint();return;}
  open=false;message='';await tools.enter();announce('Acceso recuperado para esta sesión. El código de respaldo ya fue utilizado.');
 }
 document.addEventListener('click',ev=>{const button=ev.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-recovery-open')){open=true;U.paint();document.getElementById('admin-recovery-code')?.focus();}
  else if(button.hasAttribute('data-recovery-close')){open=false;U.paint();}
  else if(button.hasAttribute('data-recovery-status'))void tools.safe(button,async()=>{load();if(!pending)return;await finish(await U.api('/api/admin/recovery/status?request='+encodeURIComponent(pending.requestId)));});
 });
 document.addEventListener('submit',ev=>{const form=ev.target;if(form.id!=='admin-recovery-form')return;ev.preventDefault();const values=new FormData(form),code=String(values.get('code')||'');form.elements.code.value='';
  void tools.safe(ev.submitter,async()=>{
   if(!pending){pending={requestId:crypto.randomUUID(),userId:U.state.user.id};try{sessionStorage.setItem(key,JSON.stringify(pending));}catch{}}
   try{await finish(await U.api('/api/admin/recovery',{code},{'Idempotency-Key':pending.requestId}));}
   catch(error){if(!error.uncertain&&error.code!=='idempotency_conflict')clear();message=error.uncertain?'No pudimos confirmar la respuesta. Consulta el resultado antes de usar otro código.':error.code==='idempotency_conflict'?'Esta solicitud ya fue registrada con otros datos. Consulta su resultado.':error.message;U.paint();throw error;}
  });
 });
 return {render,reset};
};
