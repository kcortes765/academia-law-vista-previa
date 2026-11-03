/* Keep approved motion/composition; functional dates and states come from API. */
const approvedHomeEnhance=editorialEnhance;
editorialEnhance=function(current,fresh,before){
 if(current==='home')return approvedHomeEnhance(current,fresh,before);
 editorialObserver?.disconnect();
 editorialObserver=new IntersectionObserver(()=>{});
 document.querySelectorAll('.site-header [data-route]').forEach(a=>a.setAttribute('aria-current',a.dataset.route===current?'page':'false'));
 main.classList.remove('view-enter');
 if(fresh)editorialEntry(current);else editorialLocalChange(current,before);
};
