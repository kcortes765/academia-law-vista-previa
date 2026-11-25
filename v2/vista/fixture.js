/* Fixture de solo lectura en el navegador: identidades y datos ficticios, sin correos ni proveedores. */
(()=>{
const P=new URLSearchParams(location.search);
const scenario=P.get('escenario')==='admin'?'admin':'student',externalFailure=false;
const zone='America/Santiago',now=Date.now(),blocks=[],openings=[],history=[];
// Fictitious, read-only student scenario for the local UI fixture. No D1, credentials, mail or providers.
// PRICES copies INITIAL_PRICES from src/domain/catalog.ts; scripts/ui-fixture.test.mjs fails if they drift.
const PRICES=Object.freeze({diagnostico:15000,interrogacion:20000,interrogacionPenal:25000,simulacion:25000,clase:25000,clasePenal:30000,packStandard:80000,packPenal:100000});
const LEGAL={version:'fixture',hash:'fixture-hash'};
const DAY=86400000,HOUR=3600000,MINUTE=60000;
// Same weekly pattern as the admin agenda fixture: Saturdays closed, Sundays only in the evening.
const weeklyTimes=dow=>dow===6?[]:dow===0?['17:30','19:00']:['09:00','10:30','12:00','14:30','16:00','17:30','19:00'];
function priceOf(type,matter){const penal=matter==='Penal';return type==='diagnostico'?PRICES.diagnostico:type==='simulacion'?PRICES.simulacion:type==='clase'?(penal?PRICES.clasePenal:PRICES.clase):type==='interrogacion'?(penal?PRICES.interrogacionPenal:PRICES.interrogacion):NaN;}
function categoryOf(type,matter){return type==='diagnostico'||type==='simulacion'?type:`${type}-${matter==='Penal'?'penal':'standard'}`;}

/**
 * Pure generator. Helpers come from the fixture server so both scenarios share the Chile time conversion.
 * @param {{now:number,instant:(d:string,t:string)=>number,date:(t:number)=>string,shift:(d:string,n:number)=>string}} tools
 */
function studentScenario({now,instant,date,shift}){
 const today=date(now),dow=d=>new Date(d+'T12:00:00Z').getUTCDay();
 // A session keeps its requested offset; when the weekday has no such time it moves to the next valid day.
 const at=(offset,time)=>{let d=shift(today,offset);for(let i=0;i<7&&!weeklyTimes(dow(d)).includes(time);i++)d=shift(d,1);return instant(d,time);};
 const user={id:'student-fixture',name:'Estudiante ficticia',email:'estudiante@example.invalid',canChangeEmail:true};
 const profile={user_id:user.id,name:'Estudiante ficticia',phone:'+56 9 0000 0000',university:'Universidad ficticia',whatsapp_opt_in:0,legal_version:LEGAL.version,legal_hash:LEGAL.hash};
 const session=(id,operation_id,start,type,matter,state,extra={})=>({id,operation_id,user_id:user.id,origin_id:'origin-'+id,start,end:start+HOUR,type,matter,topic:null,note:'',price:priceOf(type,matter),category:categoryOf(type,matter),credit_id:null,state,calendar_id:null,meet_url:null,feedback_level:null,feedback_comment:null,feedback_published_at:null,sync_revision:0,change_minutes:2880,origin_kind:'direct',origin_expires_at:null,replacement_until:null,changes:0,...extra});
 const sessions=[
  // Operación A: confirmada, tres sesiones futuras con Meet válido, ausente y host engañoso.
  session('fixture-a1','op-fixture-a',at(1,'09:00'),'interrogacion','Civil','confirmed',{meet_url:'https://meet.google.com/aaa-bbbb-ccc',topic:'obligaciones',note:'Nota ficticia: repasar obligaciones.'}),
  session('fixture-a2','op-fixture-a',at(3,'17:30'),'clase','Penal','confirmed'),
  session('fixture-a3','op-fixture-a',at(10,'19:00'),'interrogacion','Penal','confirmed',{meet_url:'https://meet.google.com.evil.invalid/ggg-hhhh-iii'}),
  // Operación B: incidencia en revisión con horario retenido.
  session('fixture-b1','op-fixture-b',at(6,'10:30'),'simulacion','Completa','held'),
  // Operación C: pendiente de transferencia con horario retenido.
  session('fixture-c1','op-fixture-c',at(8,'12:00'),'diagnostico',null,'held'),
  // Operación D: confirmada en el pasado; una completada con retroalimentación y otra cancelada.
  session('fixture-d1','op-fixture-d',at(-7,'10:30'),'interrogacion','Procesal','completed',{meet_url:'https://meet.google.com/jjj-kkkk-lll',feedback_level:'Intermedio (ficticio)',feedback_comment:'Retroalimentación ficticia: buena estructura; precisar plazos procesales.',feedback_published_at:now-6*DAY}),
  session('fixture-d2','op-fixture-d',at(-3,'12:00'),'interrogacion','Constitucional','cancelled'),
 ];
 const bank={bank:'Banco Ficticio',accountType:'Cuenta corriente ficticia',accountNumber:'0000000000',holder:'Titular ficticio',rut:'00.000.000-0',email:'pagos@example.invalid'};
 const total=id=>sessions.filter(s=>s.operation_id===id).reduce((n,s)=>n+s.price,0);
 const op=(id,state,extra)=>({id,user_id:user.id,kind:'reservation',state,created_at:now-DAY,deadline:null,notice_at:null,review_at:null,confirmed_at:null,amount:total(id),pack_category:null,bank_snapshot:null,name:profile.name,email:user.email,...extra});
 const operations=[
  op('op-fixture-a','confirmed',{created_at:now-5*DAY,notice_at:now-5*DAY+HOUR,review_at:now-5*DAY+13*HOUR,confirmed_at:now-4*DAY}),
  // Un alumno sólo puede tener una operación pending/review (índice one_open_operation); por eso B está en incidencia.
  op('op-fixture-b','incident',{created_at:now-2*DAY,deadline:now-2*DAY+120*MINUTE,notice_at:now-2*DAY+60*MINUTE,review_at:now-2*DAY+13*HOUR}),
  op('op-fixture-c','pending',{created_at:now-25*MINUTE,deadline:now+95*MINUTE,bank_snapshot:JSON.stringify(bank)}),
  op('op-fixture-d','confirmed',{created_at:now-12*DAY,notice_at:now-12*DAY+HOUR,review_at:now-12*DAY+13*HOUR,confirmed_at:now-11*DAY}),
 ].map(o=>({...o,first_session:Math.min(...sessions.filter(s=>s.operation_id===o.id).map(s=>s.start))}));
 const credits=[{id:'credit-fixture-d2',category:categoryOf('interrogacion','Constitucional'),state:'available',expires_at:now+40*DAY,operation_id:'op-fixture-d',origin_id:'origin-fixture-d2',changes:0,kind:'cancellation',replacement_until:null}];
 const occupied=new Set(sessions.filter(s=>['held','confirmed'].includes(s.state)).map(s=>s.start));
 function slots(start=now,end=now+45*DAY){const out=[];for(let i=0;i<=46;i++){const d=shift(today,i);for(const t of weeklyTimes(dow(d))){const v=instant(d,t);if(v>=Math.max(start,now+1440*MINUTE)&&v<end&&!occupied.has(v))out.push(v);}}return out;}
 const byTime=(kind,a,b)=>kind==='sessions'?b.start-a.start||(a.id<b.id?1:-1):kind==='operations'?b.created_at-a.created_at:a.expires_at-b.expires_at;
 const collections={operations,sessions,credits,funds:[]};
 function history(kind,{q='',state=''}={}){
  const fields={operations:['id','name','email'],sessions:['id','operation_id','type','matter','topic'],credits:['id','category','operation_id','origin_id'],funds:['id','category','origin_id']}[kind];
  if(!fields)return null;const needle=String(q).toLowerCase();
  const items=collections[kind].filter(x=>(!state||x.state===state)&&(!needle||fields.some(f=>String(x[f]??'').toLowerCase().includes(needle)))).sort((a,b)=>byTime(kind,a,b));
  return {items,nextCursor:null,...(kind==='sessions'?{allocations:[]}:{})};
 }
 function account(){return {operations:history('operations').items,sessions:history('sessions').items,credits:history('credits').items,funds:[],allocations:[],paging:{operations:null,sessions:null,credits:null,funds:null},futureActiveCount:sessions.filter(s=>['held','confirmed'].includes(s.state)&&s.start>now).length,bookingAccess:null,serverNow:Date.now()};}
 function operation(id){const o=operations.find(x=>x.id===id);if(!o)return null;const {name,email,first_session,...row}=o;return {operation:row,confirmationEmail:{state:'unknown'},sessions:sessions.filter(s=>s.operation_id===id).sort((a,b)=>a.start-b.start),serverNow:Date.now()};}
 return {user,profile,sessions,operations,credits,bank,slots,history,account,operation};
}

const date=t=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(t),hour=t=>new Intl.DateTimeFormat('es-CL',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(t);
const shift=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
function instant(d,time){const n=Date.parse(d+'T'+time+':00Z');for(let i=-840;i<=840;i+=30){const t=n+i*60000;if(date(t)===d&&hour(t)===time)return t;}throw Error('fixture_local_time');}
const teacher={id:'teacher-fixture',name:'José — identidad simulada',email:'teacher@example.invalid',canChangeEmail:false};
const sessions=[
 {id:'fixture-next',operation_id:'operation-next',start:instant(shift(date(now),1),'09:00'),state:'confirmed',operation_state:'confirmed',meet_url:'https://meet.google.com/aaa-bbbb-ccc',name:'Camila — estudiante ficticia'},
 {id:'fixture-future',operation_id:'operation-future',start:instant(shift(date(now),3),'17:30'),state:'confirmed',operation_state:'confirmed',meet_url:'https://meet.google.com/ddd-eeee-fff',name:'Alejandro — estudiante ficticio'},
 {id:'fixture-missing',operation_id:'operation-missing',start:instant(shift(date(now),4),'10:30'),state:'confirmed',operation_state:'confirmed',meet_url:null,name:'Valentina — estudiante ficticia'},
 {id:'fixture-later',operation_id:'operation-later',start:instant(shift(date(now),10),'19:00'),state:'confirmed',operation_state:'confirmed',meet_url:'https://meet.google.com/ggg-hhhh-iii',name:'Diego — estudiante ficticio'},
].map(s=>({...s,end:s.start+3600000,type:'interrogacion',matter:'Civil'}));
const commitments={sessions,credit:{id:'same-credit',changes:1,expiresAt:now+30*86400000},receipt:{id:'same-receipt',amount:20000,simulated:true}};
const student=studentScenario({now,instant,date,shift});
function agenda(d,view,external){return {date:d,view,externalAllowed:true,external:external?{state:externalFailure?'unavailable':'checked',checkedAt:externalFailure?null:Date.now()}:{state:'unverified',checkedAt:null},serverNow:Date.now(),days:Array.from({length:view==='week'?7:1},(_,i)=>{
 const day=shift(d,i),dow=new Date(day+'T12:00:00Z').getUTCDay(),times=dow===6?[]:dow===0?['17:30','19:00']:['09:00','10:30','12:00','14:30','16:00','17:30','19:00'];
 const candidates=new Set(times.map(t=>instant(day,t)));for(const s of sessions)if(date(s.start)===day)candidates.add(s.start);for(const o of openings)if(o.active&&o.date===day)candidates.add(o.start);
 return {date:day,holiday:false,lunch:dow>=1&&dow<=5?'13:00–14:30':null,dailyLimit:openings.find(o=>o.active&&o.date===day)?.daily_limit??(dow===6?0:dow===0?2:7),activeCount:sessions.filter(s=>date(s.start)===day).length,rows:[...candidates].sort((a,b)=>a-b).map((start,index)=>{
  const found=sessions.filter(s=>s.start===start),minute=Number(hour(start).slice(0,2))*60+Number(hour(start).slice(3)),reasons=[];
  if(blocks.some(b=>b.active&&day>=b.from_date&&(!b.through_date||day<=b.through_date)&&(b.weekdays&(1<<dow))&&b.start_minute<minute+60&&b.end_minute>minute))reasons.push('policy_block');
  if(external&&!externalFailure&&index===1)reasons.push('google_busy');
  return {start,end:start+3600000,state:found[0]?.operation_state||(reasons.length?'unavailable':external&&!externalFailure?'available':'unverified'),reasons,exceptional:openings.some(o=>o.active&&o.start===start),urgent:found[0]?.operation_state==='review',sessions:found};
 })};
 })};}
// Shared read-only endpoints. Prices follow INITIAL_PRICES so the home page never shows $NaN.
function common(url,json){
 if(url.pathname==='/__fixture/state')return json({fixture:true,readOnly:true,scenario,externalFailure,blocks,openings,history,commitments,realEmailsSent:0,realProviderCalls:0});
 if(url.pathname==='/api/catalog')return json({bookingPolicy:{futureLimit:8,retentionMinutes:120,advanceMinutes:1440,changeMinutes:2880},currency:'CLP',prices:PRICES,topics:{},configurationRevision:0,admissions:false,legalVersion:LEGAL.version,legalHash:LEGAL.hash,legalScope:'local-review'});
 if(url.pathname==='/api/access/challenge')return json({enabled:false,siteKey:null});
}
function admin(url,json){
 if(url.pathname==='/api/me/profile')return json({user:teacher,profile:{user_id:teacher.id,name:teacher.name,phone:'000',university:'Universidad ficticia',legal_version:'fixture'}});
 if(url.pathname==='/api/me/account')return json({operations:[],sessions:[],credits:[],funds:[],bookingAccess:null,serverNow:Date.now(),futureActiveCount:0});
 if(url.pathname==='/api/availability')return json({slots:[],available:false,reason:'admissions_unavailable'},503);
 if(url.pathname==='/api/admin/identity')return json({user:teacher,enrolled:true});
 if(url.pathname==='/api/admin/operations')return json([]);
 if(url.pathname==='/api/admin/today')return json({date:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago'}).format(Date.now()),timeZone:'America/Santiago',serverNow:Date.now(),nextSession:sessions[0],pages:Object.fromEntries(['sessions','operations','attention'].map(k=>[k,{items:[],nextCursor:null}])),counts:{sessions:0,operations:0,attention:0,overdueReviews:0,startedUnconfirmed:0,expiredPending:0,failedTasks:0},externalAvailabilityChecked:false});
 if(url.pathname==='/api/admin/calendar/agenda')return json(agenda(url.searchParams.get('date')||date(now),url.searchParams.get('view')||'day',url.searchParams.get('external')==='true'));
 if(url.pathname==='/api/admin/calendar/policy')return json({blocks,openings,history});
}
function studentRoutes(url,json){
 if(url.pathname.startsWith('/api/admin/'))return json({error:'admin_google_required'},401);
 if(url.pathname==='/api/me/profile')return json({user:student.user,profile:student.profile});
 if(url.pathname==='/api/me/account')return json(student.account());
 if(url.pathname==='/api/me/consents'||url.pathname==='/api/me/data-requests')return json({items:[],nextCursor:null});
 const kind=url.pathname.match(/^\/api\/me\/history\/([a-z]+)$/);
 if(kind){const page=student.history(kind[1],{q:url.searchParams.get('q')||'',state:url.searchParams.get('state')||''});return page?json(page):json({error:'invalid_history_query'},400);}
 const operation=url.pathname.match(/^\/api\/me\/operations\/([A-Za-z0-9-]+)$/);
 if(operation){const value=student.operation(operation[1]);return value?json(value):json({error:'operation_not_found'},404);}
 // admissions:false keeps «Crear reserva» disabled; the slots only let reviewers see the calendar.
 if(url.pathname==='/api/availability'||url.pathname==='/api/me/availability'){const start=Number(url.searchParams.get('start'))||now,end=Number(url.searchParams.get('end'))||now+45*86400000;return json({available:true,slots:student.slots(start,end),unverifiedDays:[]});}
}

const realFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
 const req=input instanceof Request?input:new Request(input,init);
 const url=new URL(req.url,location.href);
 const m=url.pathname.match(/\/(api|__fixture)\/.*$/);
 if(!m)return realFetch(input,init);
 let r=null;
 const json=(value,status=200)=>{r=new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});return true;};
 if((init?.method||req.method||'GET').toUpperCase()!=='GET'){json({error:'read_only_fixture'},405);return r;}
 const u=new URL(m[0]+url.search,'http://fixture.invalid');
 try{if(common(u,json)||(scenario==='student'?studentRoutes(u,json):admin(u,json)))return r;}catch{json({error:'fixture_failed'},500);return r;}
 json({error:'not_found'},404);return r;
};
})();
