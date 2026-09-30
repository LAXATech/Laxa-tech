(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motion = {paused: reduced.matches};
  window.LaxaMotion = motion;
  function setMotion(paused) {
    motion.paused = paused;
    document.documentElement.classList.toggle('motion-paused', paused);
    window.dispatchEvent(new Event('laxa-motion'));
  }
  setMotion(motion.paused);
  reduced.addEventListener('change', e => setMotion(e.matches));
  const revealElements = document.querySelectorAll('.section-heading, .service-grid, .expertise-heading, .expertise details, .possibility-copy, .workflow, .studio-heading, .studio-copy, .studio-principles article, .process-grid article, .contact-copy, #brief-form, .faq h2, .questions details');
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); } });
    }, {threshold: .08, rootMargin: '0px 0px -25px 0px'});
    revealElements.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--reveal-delay', (i % 3) * 65 + 'ms'); reveals.observe(el); });
  }
  const cards = document.querySelectorAll('.service, .workflow, .studio-principles article, .process-grid article');
  cards.forEach(card => {
    let frame;
    card.addEventListener('pointermove', e => {
      if (!finePointer.matches || motion.paused) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        card.style.setProperty('--glow-x', x*100+'%'); card.style.setProperty('--glow-y', y*100+'%');
        card.style.setProperty('--tilt-x', (0.5-y)*7+'deg'); card.style.setProperty('--tilt-y', (x-0.5)*7+'deg');
      });
    }, {passive:true});
    card.addEventListener('pointerleave', () => {cancelAnimationFrame(frame); card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
  });
  const progress=document.querySelector('.scroll-progress');
  let scrollRatio=0,scrollFrame;
  function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;scrollRatio=max>0?scrollY/max:0;progress.style.transform='scaleX('+scrollRatio+')';scrollFrame=null;}
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);},{passive:true});
  window.addEventListener('resize',updateScroll,{passive:true});updateScroll();
  const contact=document.querySelector('.contact');
  contact.addEventListener('pointermove',e=>{if(motion.paused||!finePointer.matches)return;const r=contact.getBoundingClientRect();contact.style.setProperty('--contact-x',(e.clientX-r.left)/r.width*100+'%');contact.style.setProperty('--contact-y',(e.clientY-r.top)/r.height*100+'%');},{passive:true});
  // A lightweight, perspective-projected point field continues the 3D atmosphere between sections.
  const canvas=document.getElementById('ambient-field'), ctx=canvas.getContext('2d');
  if(!ctx)return;
  let w=0,h=0,time=0,last=0,lastDraw=0,pointerX=0,pointerY=0,drawStatic=true;
  const points=Array.from({length:90},(_,i)=>{const t=i*.41;return {x:Math.cos(t)*(190+(i%7)*19),y:(i/89-.5)*850,z:Math.sin(t)*(190+(i%7)*19),size:i%9===0?2.1:1};});
  function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);drawStatic=true;}
  resize();window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('laxa-motion',()=>{drawStatic=true;});
  window.addEventListener('pointermove',e=>{if(finePointer.matches&&!motion.paused){pointerX=(e.clientX/w-.5)*.13;pointerY=(e.clientY/h-.5)*35;}},{passive:true});
  function render(now){
    requestAnimationFrame(render);
    const delta=Math.min((now-last)/1000,.05);last=now;
    if(document.hidden||now-lastDraw<40)return;
    if(motion.paused&&!drawStatic)return;
    lastDraw=now;drawStatic=false;if(!motion.paused)time+=delta;
    ctx.clearRect(0,0,w,h);
    const a=time*.09+scrollRatio*2+pointerX,c=Math.cos(a),s=Math.sin(a),scale=Math.min(w/1100,1.3);
    const projected=points.map(p=>{const x=p.x*c+p.z*s,z=p.z*c-p.x*s,d=720/(950+z);return {x:w*.72+x*d*scale,y:h*.5+(p.y+pointerY)*d,alpha:.15+d*.18,d,size:p.size};});
    projected.forEach((p,i)=>{
      if(i>0&&i%15!==0){const q=projected[i-1];ctx.strokeStyle='rgba(179,227,111,'+(p.alpha*.21)+')';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
      if(i%3===0&&i+15<projected.length){const q=projected[i+15];ctx.strokeStyle='rgba(179,227,111,.035)';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
      ctx.fillStyle='rgba(207,255,145,'+p.alpha+')';ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.d,0,Math.PI*2);ctx.fill();
    });
    const halo=ctx.createRadialGradient(w*.75,h*.5,0,w*.75,h*.5,w*.48);halo.addColorStop(0,'rgba(134,195,51,.055)');halo.addColorStop(1,'rgba(134,195,51,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
  }
  requestAnimationFrame(render);
})();
