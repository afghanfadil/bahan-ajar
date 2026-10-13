/* Independent theme switcher. Remembers choice locally; system preference is the initial fallback. */
(function(){'use strict';
const key='ruangbelajar:theme';const root=document.documentElement;
function preferred(){try{let saved=localStorage.getItem(key);if(saved==='dark'||saved==='light')return saved;}catch(e){}return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function apply(v,save){v=v==='dark'?'dark':'light';root.dataset.theme=v;root.style.colorScheme=v;if(save){try{localStorage.setItem(key,v)}catch(e){}}document.querySelectorAll('[data-theme-toggle]').forEach(b=>{const next=v==='dark'?'light':'dark';b.setAttribute('aria-label','Aktifkan mode '+(next==='dark'?'gelap':'terang'));b.setAttribute('aria-pressed',String(v==='dark'));b.querySelector('.theme-icon').textContent=v==='dark'?'☀':'☾';b.querySelector('.theme-text').textContent=v==='dark'?'Light':'Dark';});}
apply(preferred(),false);
document.addEventListener('DOMContentLoaded',()=>{apply(preferred(),false);document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>apply(root.dataset.theme==='dark'?'light':'dark',true)));});
})();