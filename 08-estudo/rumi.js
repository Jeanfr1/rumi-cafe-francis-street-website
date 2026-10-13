(()=>{
  'use strict';
  const root=document.documentElement, hero=document.querySelector('.hero');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const replay=document.querySelector('#replay'),pause=document.querySelector('#motion-toggle');
  const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#primary-nav');
  let paused=false,frame=0;
  root.classList.add('js');
  function syncMotion(){root.classList.toggle('reduced',reduced.matches);if(reduced.matches){hero.classList.remove('play');root.style.setProperty('--photo-offset','0px')}else if(!paused){hero.classList.add('play')}replay.disabled=reduced.matches;pause.disabled=reduced.matches;}
  replay.addEventListener('click',()=>{if(reduced.matches)return;paused=false;root.classList.remove('paused');pause.textContent='Pause animation';pause.setAttribute('aria-pressed','false');hero.classList.remove('play');void hero.offsetWidth;hero.classList.add('play')});
  pause.addEventListener('click',()=>{paused=!paused;root.classList.toggle('paused',paused);pause.textContent=paused?'Resume animation':'Pause animation';pause.setAttribute('aria-pressed',String(paused));if(paused)root.style.setProperty('--photo-offset','0px')});
  function closeNav(){toggle.setAttribute('aria-expanded','false');toggle.firstChild.textContent='Open navigation ';nav.classList.remove('open')}
  toggle.addEventListener('click',()=>{const opened=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!opened));toggle.firstChild.textContent=opened?'Open navigation ':'Close navigation ';nav.classList.toggle('open',!opened)});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeNav();toggle.focus()}});
  const reveals=[...document.querySelectorAll('.reveal')];
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(el=>io.observe(el))}else reveals.forEach(el=>el.classList.add('visible'));
  function onScroll(){if(frame||reduced.matches||paused||innerWidth<=600)return;frame=requestAnimationFrame(()=>{const y=Math.min(24,Math.max(0,scrollY*.035));root.style.setProperty('--photo-offset',y+'px');frame=0})}
  addEventListener('scroll',onScroll,{passive:true});reduced.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0}});
  syncMotion();
})();
