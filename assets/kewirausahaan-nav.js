// Highlight current topic without interfering with the calculators and quizzes.
(()=>{'use strict';
 const links=[...document.querySelectorAll('.portal-nav a[href^="#"]')];
 if(!links.length)return;
 const targets=[...new Set(links.map(a=>a.getAttribute('href').slice(1)))].map(id=>document.getElementById(id)).filter(Boolean);
 const activate=id=>links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));
 function update(){let best=targets[0],top=115;
  for(const t of targets){if(t.getBoundingClientRect().top<=top)best=t;}
  if(best)activate(best.id);
 }
 links.forEach(a=>a.addEventListener('click',()=>activate(a.getAttribute('href').slice(1))));
 window.addEventListener('scroll',update,{passive:true});
 update();
})();
