(()=>{const v=new URLSearchParams(location.search).get('mejoras');if(v===null)return;window.ACADEMIA_MEJORAS_VISTA=v==='ninguna'?[]:v.split(',').map(s=>s.trim()).filter(Boolean);})();
