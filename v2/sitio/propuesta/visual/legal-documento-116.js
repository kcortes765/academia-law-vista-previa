(()=>{document.querySelectorAll('main>section').forEach(n=>{if(lawLegal[n.id])n.innerHTML=lawLegalHTML(n.id).replace('id=\"legal-title\"','');});})();
