/* Pure iCalendar (.ics) builder for the student's own confirmed sessions.
   No network, storage, providers or personal data: no name, email, phone, note, topic, operation or origin ids.
   Times are exported in UTC (…Z), so daylight-saving changes in Chile cannot shift the event. */
window.academiaSessionCalendar=(()=>{
 // Same strict criterion as the Agenda (calendar-policy.js): https, exact host, no port or credentials, /xxx-yyyy-zzz.
 function meetURL(value){
  if(typeof value!=='string'||!value)return null;
  try{const u=new URL(value);if(u.protocol==='https:'&&u.hostname==='meet.google.com'&&!u.port&&!u.username&&!u.password&&/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(u.pathname))return u.origin+u.pathname;}catch{}
  return null;
 }
 // iCalendar DATE-TIME needs a four-digit year: 0001-01-01T00:00:00Z .. 9999-12-31T23:59:59.999Z (also inside the Date range).
 const MIN_TIME=-62135596800000,MAX_TIME=253402300799999;
 const inRange=t=>typeof t==='number'&&Number.isFinite(t)&&t>=MIN_TIME&&t<=MAX_TIME;
 // Confirmed, well-formed and not finished yet (a session in progress is still useful in a calendar).
 function eligible(x,now){return !!x&&x.state==='confirmed'&&Number.isSafeInteger(x.start)&&Number.isSafeInteger(x.end)&&inRange(x.start)&&inRange(x.end)&&x.end>x.start&&inRange(now)&&x.end>now;}
 // Only the copy the student is looking at: the operation view uses its own fresh list, the panel the account list. Never mixed.
 function sessionsFor(state,view){const list=view==='operation'?state?.operation?.sessions:view==='panel'?state?.account?.sessions:null;return Array.isArray(list)?list:[];}
 function find(state,view,id){return typeof id==='string'&&id?sessionsFor(state,view).find(v=>v&&v.id===id)||null:null;}
 // Lone surrogates become U+FFFD (no regex lookbehind, for older Safari).
 const wellFormed=v=>{let out='';for(const ch of String(v??'')){const c=ch.charCodeAt(0);out+=ch.length===1&&c>=0xD800&&c<=0xDFFF?'\uFFFD':ch;}return out;};
 // RFC 5545 TEXT: drop controls (keeping line breaks), escape \ ; , and turn every line break into a literal \n.
 function escapeText(value){return wellFormed(value).replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g,'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r\n|\r|\n/g,'\\n');}
 // Injective UID: [A-Za-z0-9-] is kept and any other code point becomes _<hex>_, so «sesión-1» and «sesin-1» never collide.
 function uidPart(id){let out='';for(const ch of wellFormed(id)){out+=/^[A-Za-z0-9-]$/.test(ch)?ch:'_'+ch.codePointAt(0).toString(16)+'_';}return out;}
 const octets=cp=>cp<0x80?1:cp<0x800?2:cp<0x10000?3:4;
 // At most 75 UTF-8 octets per physical line, counting the leading space of continuations; never splits a code point.
 function fold(line){const out=[];let current='',size=0;for(const ch of line){const n=octets(ch.codePointAt(0));if(size+n>75){out.push(current);current=' ';size=1;}current+=ch;size+=n;}out.push(current);return out.join('\r\n');}
 const stamp=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const chile=t=>{try{return new Intl.DateTimeFormat('es-CL',{timeZone:'America/Santiago',weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(t);}catch{return new Date(t).toISOString();}};
 function build(x,{now=Date.now(),typeName=t=>t,dateTime=chile}={}){
  if(!eligible(x,now))return null;
  const uid=uidPart(x.id);if(!uid)return null;
  const meet=meetURL(x.meet_url),type=String(typeName(x.type)||'Sesión'),title='Academia Law · '+type+(x.matter?' · '+x.matter:'');
  const description=[`Sesión de Academia Law: ${dateTime(x.start)} (hora de Chile).`,meet?'Google Meet: '+meet:'El enlace de Google Meet aparecerá en tu cuenta cuando esté disponible.','Si la sesión cambia o se cancela, este archivo no se actualiza solo; consulta tu cuenta.'].join('\n');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Academia Law//Sesiones//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
   'UID:academialaw-session-'+uid,'DTSTAMP:'+stamp(now),'DTSTART:'+stamp(x.start),'DTEND:'+stamp(x.end),
   'SUMMARY:'+escapeText(title),'DESCRIPTION:'+escapeText(description),'LOCATION:'+escapeText(meet||'Online'),...(meet?['URL:'+meet]:[]),'STATUS:CONFIRMED',
   'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escapeText('Tu sesión de Academia Law empieza en 30 minutos.'),'TRIGGER:-PT30M','END:VALARM',
   'END:VEVENT','END:VCALENDAR'];
  return lines.map(fold).join('\r\n')+'\r\n';
 }
 function filename(x,{civil,hour}={}){
  const day=typeof civil==='function'?civil(x.start):new Date(x.start).toISOString().slice(0,10),time=typeof hour==='function'?hour(x.start):new Date(x.start).toISOString().slice(11,16);
  const name=`academia-law-${day}-${String(time).replace(':','')}.ics`;
  return /^academia-law-\d{4}-\d{2}-\d{2}-\d{4}\.ics$/.test(name)?name:'academia-law-sesion.ics';
 }
 return {meetURL,eligible,escapeText,fold,build,filename,uidPart,sessionsFor,find};
})();
