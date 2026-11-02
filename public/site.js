(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const closeMenu = () => { if (!menu || !mobileNav) return; menu.setAttribute('aria-expanded','false'); mobileNav.hidden=true; document.body.classList.remove('menu-open'); };
  menu?.addEventListener('click', () => { const open=menu.getAttribute('aria-expanded')==='true'; menu.setAttribute('aria-expanded',String(!open)); mobileNav.hidden=open; document.body.classList.toggle('menu-open',!open); });
  mobileNav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if(event.key==='Escape') {closeMenu();} });
  window.addEventListener('resize', () => { if(window.innerWidth>760) closeMenu(); });
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
    document.documentElement.classList.add('js-motion');
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }
  if ('IntersectionObserver' in window && !reduced.matches) {
    const timelineObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('timeline-active',entry.isIntersecting)),{threshold:.35});
    document.querySelectorAll('.timeline-item').forEach(item=>timelineObserver.observe(item));
    window.addEventListener('pagehide',()=>timelineObserver.disconnect(),{once:true});
  }
  const sections=[...document.querySelectorAll('main section[id]')];
  const navLinks=[...document.querySelectorAll('.desktop-nav a')];
  if ('IntersectionObserver' in window) {
    const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(link=>{const active=link.getAttribute('href')==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}});},{rootMargin:'-20% 0px -65% 0px'});
    sections.forEach(section=>navObserver.observe(section));
  }
  // Filtering is an enhancement: without JavaScript every case study remains visible.
  const toolbar=document.querySelector('.project-toolbar');
  const filterButtons=[...document.querySelectorAll('[data-filter]')];
  const projectItems=[...document.querySelectorAll('.project[data-kind]')];
  const filterCount=document.querySelector('.filter-count');
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    filterButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    let count=0;
    projectItems.forEach(item=>{const show=filter==='all'||item.dataset.kind===filter;item.hidden=!show;if(show)count++;});
    if(filterCount)filterCount.textContent=filter==='all'?`Showing all ${count} projects`:`Showing ${count} ${filter} projects`;
    window.dispatchEvent(new CustomEvent('portfolio:layoutchange'));
  }));
  if(toolbar)toolbar.hidden=false;

  const progress=document.querySelector('.reading-progress span');
  let scrollFrame=0;
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,window.scrollY/max)):0})`;scrollFrame=0;};
  const onScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress);};
  if(progress){window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);updateProgress();}

  // A small, eased pointer response complements the existing orbit graphic on desktop only.
  const hero=document.querySelector('.hero');
  const heroVisual=document.querySelector('.hero-visual');
  const canParallax=window.matchMedia('(min-width: 761px) and (pointer:fine)');
  let heroFrame=0,heroX=0,heroY=0;
  const renderHero=()=>{heroVisual.style.setProperty('--hero-x',heroX+'px');heroVisual.style.setProperty('--hero-y',heroY+'px');heroFrame=0;};
  const moveHero=event=>{if(!canParallax.matches||reduced.matches)return;const rect=hero.getBoundingClientRect();heroX=((event.clientX-rect.left)/rect.width-.5)*14;heroY=((event.clientY-rect.top)/rect.height-.5)*14;if(!heroFrame)heroFrame=requestAnimationFrame(renderHero);};
  const resetHero=()=>{heroX=heroY=0;if(!heroFrame)heroFrame=requestAnimationFrame(renderHero);};
  if(hero&&heroVisual){hero.addEventListener('pointermove',moveHero,{passive:true});hero.addEventListener('pointerleave',resetHero);}
  window.addEventListener('pagehide',()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);hero?.removeEventListener('pointermove',moveHero);hero?.removeEventListener('pointerleave',resetHero);if(scrollFrame)cancelAnimationFrame(scrollFrame);if(heroFrame)cancelAnimationFrame(heroFrame);},{once:true});
  const launcher=document.querySelector('.chat-launcher');
  const panel=document.querySelector('.chat-panel');
  if(launcher && panel){
    const close=panel.querySelector('.chat-close'),form=panel.querySelector('.chat-form'),input=panel.querySelector('input'),messages=panel.querySelector('.chat-messages'),status=panel.querySelector('.chat-status'),send=panel.querySelector('[type=submit]');
    let history=[],busy=false,checked=false;
    const append=(role,text)=>{const node=document.createElement('div');node.className='chat-message '+(role==='user'?'user-message':'assistant-message');const label=document.createElement('small');label.textContent=role==='user'?'YOU':'ASSISTANT';const body=document.createElement('p');body.textContent=text;node.append(label,body);messages.append(node);messages.scrollTop=messages.scrollHeight;return node;};
    const check=async()=>{try{const response=await fetch('/api/chat',{headers:{'Accept':'application/json'},cache:'no-store'});const data=response.ok?await response.json():null;status.textContent=data?.ready?'AI CONFIGURED':'AI SETUP NEEDED';}catch{status.textContent='AI SETUP NEEDED';}};
    const hide=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();};
    launcher.addEventListener('click',()=>{if(!panel.hidden){hide();return;}panel.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();if(!checked){checked=true;check();}});
    close.addEventListener('click',hide);
    panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();hide();}});
    const ask=async value=>{const question=value.trim();if(!question||busy)return;append('user',question);input.value='';busy=true;send.disabled=true;status.textContent='THINKING…';const pending=append('assistant','Thinking…');
      try{const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({message:question,history:history.slice(-4)})});let data;try{data=await response.json();}catch{throw new Error('The AI assistant is not connected yet. Please try again after setup.');}if(!response.ok||typeof data.answer!=='string')throw new Error(data.error||'The AI assistant is unavailable. Please try again later.');pending.querySelector('p').textContent=data.answer;history.push({role:'user',content:question},{role:'assistant',content:data.answer.slice(0,700)});history=history.slice(-4);status.textContent='AI CONNECTED';}
      catch(error){pending.querySelector('p').textContent=error.message||'The AI assistant is unavailable. Please try again later.';status.textContent='AI UNAVAILABLE';}
      finally{busy=false;send.disabled=false;messages.scrollTop=messages.scrollHeight;input.focus();}
    };
    form.addEventListener('submit',event=>{event.preventDefault();ask(input.value);});
    panel.querySelectorAll('.chat-suggestions button').forEach(button=>button.addEventListener('click',()=>ask(button.textContent)));
    launcher.hidden=false;
  }
  // Native details remain usable if JavaScript or dialog support is unavailable.
  const caseModal=document.querySelector('#case-modal');
  if(caseModal && typeof caseModal.showModal==='function'){
    let returnFocus=null;
    const title=caseModal.querySelector('#case-modal-title');
    const client=caseModal.querySelector('.modal-client');
    const intro=caseModal.querySelector('.modal-intro');
    const content=caseModal.querySelector('.modal-content');
    document.querySelectorAll('.project').forEach(project=>{
      const button=project.querySelector('.case-open'), details=project.querySelector('.case-details');
      if(!button||!details)return;
      button.addEventListener('click',()=>{
        returnFocus=button;
        title.textContent=project.querySelector('h3')?.textContent||'Case study';
        client.textContent=project.querySelector('.project-id span:last-child')?.textContent||'';
        intro.textContent=project.querySelector('.project-heading-main > p')?.textContent||'';
        content.replaceChildren(details.querySelector('.case-grid').cloneNode(true));
        caseModal.showModal();document.body.classList.add('dialog-open');
        window.dispatchEvent(new CustomEvent('portfolio:caseopen'));
        caseModal.querySelector('.modal-close').focus();
      });
      details.hidden=true;button.hidden=false;
    });
    caseModal.querySelector('.modal-close').addEventListener('click',()=>caseModal.close());
    caseModal.addEventListener('click',event=>{if(event.target===caseModal)caseModal.close();});
    caseModal.querySelector('.modal-contact').addEventListener('click',()=>{returnFocus=null;caseModal.close();});
    caseModal.addEventListener('close',()=>{document.body.classList.remove('dialog-open');returnFocus?.focus();});
  }
  const copy=document.querySelector('.copy-email');
  copy?.addEventListener('click',async()=>{const feedback=document.querySelector('.copy-feedback');try{await navigator.clipboard.writeText(copy.dataset.email);feedback.textContent='Email copied.';}catch{feedback.textContent='Could not copy. Select the email address above.';}});
  const year=document.querySelector('#year'); if(year)year.textContent=new Date().getFullYear();
  const cursor=document.querySelector('.cursor-follower');
  if(cursor && window.matchMedia('(pointer:fine)').matches && !reduced.matches){
    let x=0,y=0,cx=0,cy=0,raf=0,visible=false;
    const tick=()=>{cx+=(x-cx)*.16;cy+=(y-cy)*.16;cursor.style.left=cx+'px';cursor.style.top=cy+'px';if(Math.abs(x-cx)>.1||Math.abs(y-cy)>.1)raf=requestAnimationFrame(tick);else raf=0;};
    const move=event=>{x=event.clientX;y=event.clientY;if(!visible){cx=x;cy=y;visible=true;cursor.classList.add('visible');}if(!raf)raf=requestAnimationFrame(tick);};
    const over=event=>cursor.classList.toggle('active',!!event.target.closest('a,button,summary'));
    const leave=event=>{if(!event.relatedTarget)cursor.classList.remove('visible');};
    window.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerover',over);document.addEventListener('pointerout',leave);
    const magnetic=[...document.querySelectorAll('.magnetic')];
    const magnetMove=event=>{const el=event.currentTarget, box=el.getBoundingClientRect();el.style.transform=`translate(${(event.clientX-box.left-box.width/2)*.035}px, ${(event.clientY-box.top-box.height/2)*.08}px)`;};
    const magnetLeave=event=>{event.currentTarget.style.transform='';};
    magnetic.forEach(el=>{el.addEventListener('pointermove',magnetMove,{passive:true});el.addEventListener('pointerleave',magnetLeave);});
    window.addEventListener('pagehide',()=>{window.removeEventListener('pointermove',move);document.removeEventListener('pointerover',over);document.removeEventListener('pointerout',leave);magnetic.forEach(el=>{el.removeEventListener('pointermove',magnetMove);el.removeEventListener('pointerleave',magnetLeave);});if(raf)cancelAnimationFrame(raf);},{once:true});
  }
})();
