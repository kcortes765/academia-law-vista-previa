/* Ephemeral challenge only: no tokens in drafts, storage, URLs or diagnostics. */
window.academiaAccessChallenge=function(api){
 let config=null,loading=null,active=false;
 const problem=()=>new Error('No pudimos completar la verificación de acceso. Intenta nuevamente; no se repetirá el envío automáticamente.');
 async function configure(){try{config=await api('/api/access/challenge');}catch{config={enabled:false};}}
 function html(){return `<div class="access-trap" aria-hidden="true"><label>Deja este campo vacío<input name="website" type="text" tabindex="-1" autocomplete="off" maxlength="200"></label></div><div id="access-challenge"></div><p class="access-challenge-note">${config?.enabled?'Al pedir el acceso se comprobará esta solicitud con Cloudflare Turnstile.':'El acceso por correo aún no está disponible en este entorno.'}</p>`;}
 function load(){if(window.turnstile)return Promise.resolve();if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');const fail=()=>{clearTimeout(timeout);script.remove();loading=null;reject(problem());};const timeout=setTimeout(fail,10000);script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{if(!window.turnstile)return fail();clearTimeout(timeout);resolve();};script.onerror=fail;document.head.appendChild(script);});return loading;}
 async function send(path,body,trap){
  if(active||trap!=='')throw problem();if(!config?.enabled)throw new Error('El acceso por correo aún no está disponible en este entorno.');
  active=true;let widget,timer;
  try{await load();const target=document.getElementById('access-challenge');if(!target)throw problem();
  const action=path.endsWith('magic-link')?'access_link':'access_code';
   const token=await new Promise((resolve,reject)=>{
    timer=setTimeout(()=>reject(problem()),60000);
    widget=window.turnstile.render(target,{sitekey:config.siteKey,action,execution:'execute',appearance:'interaction-only',size:'flexible','response-field':false,retry:'never',callback:resolve,'error-callback':()=>{reject(problem());return true;},'expired-callback':()=>reject(problem()),'timeout-callback':()=>reject(problem())});
    window.turnstile.execute(widget);
   });
   clearTimeout(timer);if(!target.isConnected)throw problem();
   return await api(path,body,{'X-Academia-Challenge':token,'X-Academia-Website':trap});
  }finally{active=false;clearTimeout(timer);if(widget!==undefined)window.turnstile.remove(widget);}
 }
 return {configure,html,send};
};
