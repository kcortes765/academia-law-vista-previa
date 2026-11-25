/* Read-only history. Cursor belongs to a user/filter; no history data in storage. */
window.academiaHistoryTools={
 names:{operations:'Operaciones',sessions:'Sesiones',credits:'Créditos',funds:'Saldo en pesos',students:'Alumnos'},
 states:{operations:['pending','review','confirmed','expired','withdrawn','incident','rejected'],sessions:['held','confirmed','cancelled','completed','absent','released'],credits:['available','reserved','used','expired'],funds:[],students:[]},
 labels:{pending:'Pendiente',review:'En revisión',confirmed:'Confirmada',expired:'Vencida',withdrawn:'Retirada',incident:'Incidencia',rejected:'Rechazada',held:'Retenida',cancelled:'Cancelada',completed:'Completada',absent:'Inasistencia',released:'Liberada',available:'Disponible',reserved:'Apartado',used:'Utilizado'},
 merge:(a,b,key='id')=>[...new Map([...(a||[]),...(b||[])].map(x=>[key==='allocation'?x.session_id+':'+x.fund_id:x[key],x])).values()],
 formActual(kind,q='',state='',admin=false){const e=escapeHTML;return `<form id="${admin?'directory':'history'}-search" data-kind="${kind}"><label>Buscar en ${this.names[kind].toLowerCase()}<input name="q" maxlength="100" value="${e(q)}" placeholder="${kind==='students'?'Nombre, correo o identificador':kind==='operations'?'Identificador'+(admin?', nombre o correo':''):'Identificador o categoría'}"></label>${this.states[kind].length?`<label>Estado<select name="state"><option value="">Todos los estados</option>${this.states[kind].map(v=>`<option value="${v}" ${state===v?'selected':''}>${this.labels[v]}</option>`).join('')}</select></label>`:''}<button class="button secondary">Buscar</button><p>La búsqueda recorre todos los registros, no sólo los ya cargados. Los caracteres % y _ se buscan literalmente. Actualiza la búsqueda si los registros cambian mientras consultas.</p></form>`;},
 formMejora(kind,q='',state='',admin=false){const e=escapeHTML,help={sessions:'Busca por materia, tipo de sesión o tema.',operations:'Busca por identificador de la operación'+(admin?', nombre o correo.':'.'),credits:'Busca por identificador o categoría.',funds:'Busca por identificador o categoría.',students:'Busca por nombre, correo o identificador.'}[kind]||'';return `<form id="${admin?'directory':'history'}-search" data-kind="${kind}"><label>Buscar en ${this.names[kind].toLowerCase()}<input name="q" maxlength="100" value="${e(q)}" placeholder="${kind==='students'?'Nombre, correo o identificador':kind==='operations'?'Identificador'+(admin?', nombre o correo':''):'Identificador o categoría'}"></label>${this.states[kind].length?`<label>Estado<select name="state"><option value="">Todos los estados</option>${this.states[kind].map(v=>`<option value="${v}" ${state===v?'selected':''}>${this.labels[v]}</option>`).join('')}</select></label>`:''}<button class="button secondary">Buscar</button><p class="history-help">${help}</p></form>`;},
 // cuenta-2 (visual/mejoras.js): búsqueda compacta con ayuda breve por tipo de registro.
 form(kind,q,state,admin){return (typeof academiaMejora==='function'&&academiaMejora('cuenta-2'))?this.formMejora(kind,q,state,admin):this.formActual(kind,q,state,admin);},
 query(q,state,cursor){const v=new URLSearchParams({q:q||'',state:state||''});if(cursor)v.set('cursor',cursor);return '?'+v;}
};
window.academiaStudentHistory=function(U){
 const H=window.academiaHistoryTools,s=U.state,sequence={};let epoch=0;
 function reset(){epoch++;s.historyPanels={};}
 function page(kind){return s.historyPanels?.[kind];}
 function rows(kind){return page(kind)?.items??s.account?.[kind]??[];}
 // True while the visible page comes from a search or a state filter, so empty results are not shown as an empty account.
 function filtered(kind){const p=page(kind);return !!(p&&(p.q||p.state));}
 function cursor(kind){return page(kind)?page(kind).nextCursor:s.account?.paging?.[kind];}
 function controls(kind){const p=page(kind);return H.form(kind,p?.q,p?.state)+`${(typeof academiaMejora==='function'&&academiaMejora('cuenta-2'))?`<p class="history-count">Mostrando ${rows(kind).length}${cursor(kind)?'; hay más para cargar.':'.'}</p>`:`<p>${rows(kind).length} ${rows(kind).length===1?'registro cargado':'registros cargados'}${cursor(kind)?'; hay más resultados.':'; fin de los resultados disponibles.'}</p>`}${cursor(kind)?`<button class="button secondary" type="button" data-history-more="${kind}">Cargar más ${H.names[kind].toLowerCase()}</button>`:''}`;}
 async function load(kind,more=false,coverage=false,q='',state=''){
  const owner=s.user?.id,started=epoch,version=sequence[kind]=(sequence[kind]||0)+1;
  const old=coverage?null:page(kind),next=coverage?s.account?.paging?.[kind]:cursor(kind);if(more&&!next)return;
  if(more&&!coverage){q=old?.q||'';state=old?.state||'';}
  const r=await U.api('/api/me/history/'+kind+H.query(q,state,more?next:null));
  if(owner!==s.user?.id||started!==epoch||version!==sequence[kind])return;
  s.account[kind]=H.merge(s.account[kind],r.items);s.account.allocations=H.merge(s.account.allocations,r.allocations,'allocation');
  if(!q&&!state)s.account.paging[kind]=r.nextCursor;
  if(!coverage){s.historyPanels??={};s.historyPanels[kind]={...r,q,state,items:more?H.merge(rows(kind),r.items):r.items};}
  U.paint();
 }
 function coverage(){return ['credits','funds'].filter(k=>s.account?.paging?.[k]).map(k=>`<p class="notice">Hay más ${H.names[k].toLowerCase()} guardados. Cárgalos para revisar toda tu cobertura. <button type="button" class="button secondary" data-coverage-more="${k}">Cargar más ${H.names[k].toLowerCase()}</button></p>`).join('');}
 document.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const kind=b.dataset.historyMore||b.dataset.coverageMore;if(kind)void U.busy(b,()=>load(kind,true,!!b.dataset.coverageMore));});
 document.addEventListener('submit',ev=>{if(ev.target.id!=='history-search')return;ev.preventDefault();const form=ev.target,data=new FormData(form);void U.busy(ev.submitter,()=>load(form.dataset.kind,false,false,String(data.get('q')||''),String(data.get('state')||'')));});
 return {rows,controls,coverage,reset,filtered};
};
window.academiaDirectory=function(U,tools){
 const H=window.academiaHistoryTools,e=escapeHTML;let kind='operations',page=null,student=null,q='',state='',busy=false;
 function reset(){page=null;student=null;q='';state='';kind='operations';}
 const base=()=>student?'/api/admin/students/'+encodeURIComponent(student.profile.user_id)+'/history/':'/api/admin/history/';
 async function load(more=false){const r=await U.api(base()+kind+H.query(q,state,more?page?.nextCursor:null));if(more){r.items=H.merge(page.items,r.items);r.allocations=H.merge(page.allocations,r.allocations,'allocation');}page=r;}
 async function open(id){const result=await U.api('/api/admin/students/'+encodeURIComponent(id));student=result;kind='sessions';q='';state='';page={items:result.account.sessions,nextCursor:result.account.paging.sessions,allocations:result.account.allocations};}
 function credit(c){return `<p>${e(U.categoryLabel(c.category))} · ${e(H.labels[c.state]||c.state||'')} · origen ${e(c.origin_id)}</p><p>${c.kind==='teacher_replacement'?'Elegir reposición hasta '+e(U.dateTime(c.replacement_until)):'Vence '+e(U.dateTime(c.expires_at))} · cambio del origen ${c.changes?'utilizado':'disponible'}</p>`;}
 function row(x){
  if(kind==='students')return `<p>${e(x.name)} · ${e(x.email)}</p><button type="button" class="button secondary" data-directory-student="${e(x.user_id)}">Abrir ficha</button>`;
  if(kind==='operations')return `<p>${e(U.dateTime(x.created_at))} · ${e(H.labels[x.state]||x.state)} · ${money(x.amount)}</p><p>${e(x.name||'')} ${e(x.email||'')} · ${e(x.id)}</p><button type="button" class="button secondary" data-ops-operation="${e(x.id)}">Revisar operación</button>${!student?`<button type="button" class="button secondary" data-directory-student="${e(x.user_id)}">Ver alumno</button>`:''}`;
  if(kind==='credits')return credit(x);
  if(kind==='funds')return `<p>${money(x.available)} disponible · ${money(x.reserved)} apartado · original ${money(x.original)}</p><p>Origen ${e(x.origin_id)} · ${e(x.category||'Excedente acordado')} · vence ${e(U.dateTime(x.expires_at))} · cambio ${x.changes?'utilizado':'disponible'}</p>`;
  return `<p>${e(U.dateTime(x.start))} · ${e(U.typeName(x.type))} ${e(x.matter||'')} · ${e(H.labels[x.state]||x.state)}</p><p>${e(x.topic||'Tema no especificado')} · origen ${e(x.origin_id)} · cambio ${x.changes?'utilizado':'disponible'}</p><p>${x.replacement_until?'Plazo de reposición '+e(U.dateTime(x.replacement_until)):x.origin_expires_at?'Vencimiento del origen '+e(U.dateTime(x.origin_expires_at)):'Pago directo sin crédito emitido'}</p>${x.feedback_published_at?`<p>Nivel observado: ${e(x.feedback_level)}</p><p class="student-note">${e(x.feedback_comment)}</p>`:''}${(page.allocations||[]).filter(a=>a.session_id===x.id).map(a=>`<p>Aporte de saldo ${money(a.amount)} · fondo ${e(a.fund_id)} · vence ${e(U.dateTime(a.expires_at))}</p>`).join('')}<button type="button" class="button secondary" data-ops-operation="${e(x.operation_id)}">Revisar operación y seguimiento</button>`;
 }
 function render(){return `<section class="operation-content"><h2>${student?'Ficha del alumno':H.names[kind]}</h2>${student?`<p>${e(student.profile.name)} · ${e(student.profile.email)}</p><p>${e(student.profile.phone)} · ${e(student.profile.university)}</p><p>${student.account.futureActiveCount} sesiones futuras activas.</p><div class="ui-actions">${['sessions','operations','credits','funds'].map(k=>`<button class="button secondary" type="button" data-directory-kind="${k}">${H.names[k]}</button>`).join('')}<button class="button secondary" type="button" data-directory-controls="${e(student.profile.user_id)}">Controles e incidencias de reserva</button></div>`:''}${H.form(kind,q,state,true)}${(typeof academiaMejora==='function'&&academiaMejora('cuenta-2'))?`<p class="history-count">Mostrando ${page?.items.length||0}${page?.nextCursor?'; hay más para cargar.':'.'}</p>`:`<p>${page?.items.length||0} ${page?.items.length===1?'registro cargado':'registros cargados'}${page?.nextCursor?'; hay más resultados.':'; fin de los resultados disponibles.'}</p>`}${page?.items.map(x=>`<article class="session-detail">${row(x)}</article>`).join('')||'<p>No hay resultados para esta búsqueda.</p>'}${page?.nextCursor?'<button class="button secondary" type="button" data-directory-more>Cargar más resultados</button>':''}</section>`;}
 async function safe(button,work){if(busy)return;busy=true;try{await tools.safe(button,async()=>{await work();tools.activate();U.paint();});}finally{busy=false;}}
 document.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.directoryOpen)void safe(b,async()=>{reset();kind=d.directoryOpen;await load();});
  else if(d.directoryStudent)void safe(b,()=>open(d.directoryStudent));
  else if(d.directoryKind)void safe(b,async()=>{kind=d.directoryKind;q='';state='';await load();});
  else if(b.hasAttribute('data-directory-more'))void safe(b,()=>load(true));
 });
 document.addEventListener('submit',ev=>{if(ev.target.id!=='directory-search')return;ev.preventDefault();const data=new FormData(ev.target);void safe(ev.submitter,async()=>{q=String(data.get('q')||'');state=String(data.get('state')||'');page=null;U.paint();await load();});});
 return {reset,render,refresh:()=>load()};
};
