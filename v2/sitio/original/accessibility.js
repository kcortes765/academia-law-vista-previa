/* Functional accessibility bridge. No data persistence or changes to business rules. */
window.academiaAccessibility=(()=>{
 const escape=v=>CSS.escape(String(v));
 function capture(root){
  const el=document.activeElement;if(!el||!root.contains(el))return null;
  const id=el.id,form=el.form?.id,name=el.name,attrs=[...el.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value]);
  let selector=id?'#'+escape(id):form&&name?`#${escape(form)} [name="${escape(name)}"]`:attrs.length?el.tagName.toLowerCase()+attrs.map(([k,v])=>`[${escape(k)}="${escape(v)}"]`).join(''):form&&el.tagName==='BUTTON'?`#${escape(form)} button`:null;
  const scope=el.closest?.('[data-focus-scope]')?.getAttribute('data-focus-scope');if(scope&&selector)selector=`[data-focus-scope="${escape(scope)}"] `+selector;
  return {selector,selection:['text','tel','email','search'].includes(el.type)?[el.selectionStart,el.selectionEnd]:null};
 }
 function focusHeading(root){const el=root.querySelector('h1,h2')||root;el.tabIndex=-1;el.focus({preventScroll:false});}
 function restore(root,snapshot){if(!snapshot)return;const el=snapshot.selector?root.querySelector(snapshot.selector):null;if(el&&!el.disabled){el.focus({preventScroll:true});if(snapshot.selection?.every(Number.isInteger))try{el.setSelectionRange(...snapshot.selection);}catch{}}else focusHeading(root);}
 function restoreIfLost(root,snapshot){if(!document.querySelector('dialog[open]')&&(!document.activeElement||document.activeElement===document.body||document.activeElement===root||!document.activeElement.isConnected))restore(root,snapshot);}
 function fieldName(control){const label=control.labels?.[0];if(!label)return control.getAttribute('aria-label')||control.name||'campo requerido';const copy=label.cloneNode(true);copy.querySelectorAll('input,select,textarea,.required-star').forEach(n=>n.remove());return copy.textContent.trim().replace(/[.\s]+$/,'');}
 function requirements(form){const pending=[...form.querySelectorAll('[required]')].filter(el=>!el.disabled&&!el.validity.valid).map(fieldName),text=pending.length?'Revisa los campos obligatorios: '+[...new Set(pending)].join(', ')+'.':'Campos obligatorios completos. Revisa el contenido antes de continuar.';
  return text;}
 function update(form){const summary=form.querySelector('[data-required-summary]');if(summary&&summary.textContent!==requirements(form))summary.textContent=requirements(form);}
 function enhance(root){
  root.querySelectorAll('form').forEach((form,index)=>{
   const required=[...form.querySelectorAll('[required]')];if(!required.length)return;
   for(const el of required){const label=el.labels?.[0];if(label&&!label.querySelector('.required-star')){const star=document.createElement('span');star.className='required-star';star.textContent=' *';star.setAttribute('aria-hidden','true');if(el.parentElement===label){const caption=document.createElement('span');caption.className='required-label-text';[...label.childNodes].filter(n=>n!==el).forEach(n=>caption.append(n));caption.append(star);if(['checkbox','radio'].includes(el.type))label.append(caption);else label.insertBefore(caption,el);}else label.append(star);}}
   if(!form.querySelector('[data-required-legend]')){const legend=document.createElement('p');legend.className='required-legend';legend.dataset.requiredLegend='';legend.textContent='Los campos marcados con * son obligatorios.';form.prepend(legend);}
   if(!form.querySelector('[data-required-summary]')){const summary=document.createElement('p');summary.className='form-requirements';summary.dataset.requiredSummary='';summary.id='requirements-'+(form.id||index);summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');summary.textContent=requirements(form);const button=form.querySelector('button[type=submit],button:not([type])');if(button)button.before(summary);else form.append(summary);}
   update(form);
  });
 }
 for(const modal of document.querySelectorAll('dialog'))modal.addEventListener('keydown',event=>{
  if(event.key!=='Tab'||!modal.open)return;
  const controls=[...modal.querySelectorAll('a[href],button,input:not([type="hidden"]),select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.matches(':disabled')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  const first=controls[0],last=controls.at(-1),active=document.activeElement;
  if(!first){event.preventDefault();modal.focus();return;}
  if(event.shiftKey&&(active===first||!controls.includes(active))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(active===last||!controls.includes(active))){event.preventDefault();first.focus();}
 });
 // Register after the accepted visual layer installs its animated drawer return.
 document.addEventListener('DOMContentLoaded',()=>document.getElementById('dialog')?.addEventListener('close',restoreOperationDialogFocus));
 for(const type of ['input','change'])document.addEventListener(type,event=>{if(event.target.form)update(event.target.form);});
 return {capture,restore,restoreIfLost,focusHeading,enhance};
})();
