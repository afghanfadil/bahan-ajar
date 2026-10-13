/* Minimal lesson navigation enhancement — no tracking or server persistence. */
(function(){'use strict';document.addEventListener('DOMContentLoaded',function(){
 const items=[...document.querySelectorAll('main section[id]')].filter(x=>x.id!=='awal');
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;document.querySelectorAll('.portal-nav a[href^="#"]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}},{rootMargin:'-18% 0px -60% 0px'});items.forEach(el=>observer.observe(el));}
});})();
