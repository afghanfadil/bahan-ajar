/* Search & cancel quiz features. No network or login needed. */
(function () {
  'use strict';
  function qs(sel,root){return (root||document).querySelector(sel);}
  function qsa(sel,root){return Array.from((root||document).querySelectorAll(sel));}
  function bindSearch(fieldSel,cardSel,emptySel){
    const input=qs(fieldSel);if(!input)return;
    const cards=qsa(cardSel),empty=qs(emptySel);
    function update(){const q=input.value.trim().toLocaleLowerCase('id');let visible=0;
      for(const card of cards){const match=!(q && !(card.dataset.search||'').includes(q));card.hidden=!match;if(match)visible++;}
      if(empty)empty.hidden=visible!==0;
    }
    input.addEventListener('input',update);update();
  }
  function cancelShortQuiz(section){
    const reset=qs('#testReset,#resetQuiz',section)||qsa('button',section).find(b=>b.textContent.trim()==='Ulangi kuis');
    if(reset)reset.click();
    else if(typeof window.resetQuiz==='function')window.resetQuiz();
    qsa('input[type="radio"],input[type="checkbox"]',section).forEach(x=>{x.checked=false;});
    const result=qs('#quizResult',section);
    if(result){result.textContent='';result.classList.remove('visible');}
    const score=qs('#testScore',section);if(score)score.textContent='0 dari 0 dijawab';
    qsa('[data-quiz-content],[data-quiz-control]',section).forEach(el=>{el.hidden=true;});
    section.dataset.quizCancelled='true';
    const note=qs('[data-quiz-note]',section);if(note)note.hidden=false;
  }
  function resumeShortQuiz(section){
    qsa('[data-quiz-content],[data-quiz-control]',section).forEach(el=>{el.hidden=false;});
    section.dataset.quizCancelled='false';
    const note=qs('[data-quiz-note]',section);if(note)note.hidden=true;
  }
  document.addEventListener('DOMContentLoaded',function(){
    bindSearch('[data-course-search]','[data-course-card]','[data-course-empty]');
    bindSearch('[data-module-search]','[data-module-card]','[data-module-empty]');
    qsa('[data-quiz-cancel]').forEach(b=>b.addEventListener('click',()=>{
      const section=b.closest('#kuis');if(section)cancelShortQuiz(section);
    }));
    qsa('[data-quiz-resume]').forEach(b=>b.addEventListener('click',()=>{
      const section=b.closest('#kuis');if(section)resumeShortQuiz(section);
    }));
    qsa('[data-exam-cancel]').forEach(b=>b.addEventListener('click',()=>{
      if(typeof window.psCancelTimedQuiz==='function'){
        window.psCancelTimedQuiz();
        const intro=qs('#examIntro'); if(intro)intro.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }));
  });
})();
