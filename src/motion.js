import { animate, hover, stagger } from 'motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Motion handles entrances and small interactive feedback. GSAP handles scroll choreography.
// All content remains available without this enhancement or with reduced motion.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let cleanup = () => {};

gsap.registerPlugin(ScrollTrigger);

function setup() {
  if (reduced.matches) return () => {};
  const root = document.documentElement;
  const heroLines = [...document.querySelectorAll('.hero h1 > span')];
  const heroBottom = document.querySelector('.hero-bottom');
  const animations = [];
  const hoverCleanups = [];
  root.classList.add('motion-enhanced');

  if (heroLines.length) {
    animations.push(animate(heroLines, { opacity: [0, 1], y: [32, 0] }, {
      duration: 0.85, delay: stagger(0.1), ease: [0.22, 1, 0.36, 1]
    }));
  }
  if (heroBottom) {
    animations.push(animate(heroBottom, { opacity: [0, 1], y: [16, 0] }, {
      duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1]
    }));
  }

  // Keep hover feedback separate from GSAP's scroll targets.
  if (finePointer.matches) {
    document.querySelectorAll('.case-open').forEach(button => {
      const icon = button.querySelector('.summary-icon');
      if (!icon) return;
      hoverCleanups.push(hover(button, () => {
        animate(icon, { scale: 1.12, rotate: 45 }, { duration: 0.25, ease: 'easeOut' });
        return () => animate(icon, { scale: 1, rotate: 0 }, { duration: 0.25, ease: 'easeOut' });
      }));
    });
  }

  const modalInner = document.querySelector('.modal-inner');
  const onCaseOpen = () => {
    if (modalInner) animations.push(animate(modalInner, { opacity: [0.55, 1], y: [12, 0] }, {
      duration: 0.3, ease: [0.22, 1, 0.36, 1]
    }));
  };
  window.addEventListener('portfolio:caseopen', onCaseOpen);

  const context = gsap.context(() => {
    document.querySelectorAll('.section-intro h2, .about-lead > h2, .experience-intro > h2, .credentials-title > h2').forEach(heading => {
      gsap.fromTo(heading, { y: 24, opacity: 0.5 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 88%', once: true }
      });
    });
    document.querySelectorAll('.project-heading-main h3').forEach(heading => {
      gsap.fromTo(heading, { y: 20, opacity: 0.5 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 90%', once: true }
      });
    });
    const flow = document.querySelector('.flow-grid');
    if (flow) {
      gsap.fromTo(flow.querySelectorAll('.flow-node'), { y: 12, opacity: 0.45 }, {
        y: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: 'power2.out',
        scrollTrigger: { trigger: flow, start: 'top 88%', once: true }
      });
    }
    const banner = document.querySelector('.personal-banner img');
    if (banner) {
      gsap.fromTo(banner, { opacity: 0.55, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: banner, start: 'top 90%', once: true }
      });
    }
    const timeline = document.querySelector('.timeline');
    const line = document.querySelector('.timeline-progress');
    if (timeline && line) {
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 75%', end: 'bottom 65%', scrub: 0.5 }
      });
    }
  });

  let refreshFrame = 0;
  const onLayoutChange = () => {
    if (refreshFrame) cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; ScrollTrigger.refresh(); });
  };
  window.addEventListener('portfolio:layoutchange', onLayoutChange);
  return () => {
    window.removeEventListener('portfolio:caseopen', onCaseOpen);
    window.removeEventListener('portfolio:layoutchange', onLayoutChange);
    if (refreshFrame) cancelAnimationFrame(refreshFrame);
    hoverCleanups.forEach(stop => stop());
    animations.forEach(animation => animation.cancel());
    context.revert();
    [...heroLines, heroBottom, modalInner].filter(Boolean).forEach(element => {
      element.style.removeProperty('transform');
      element.style.removeProperty('opacity');
    });
    root.classList.remove('motion-enhanced');
  };
}

cleanup = setup();
const onMotionPreferenceChange = () => { cleanup(); cleanup = setup(); };
reduced.addEventListener('change', onMotionPreferenceChange);
window.addEventListener('pagehide', () => {
  cleanup();
  reduced.removeEventListener('change', onMotionPreferenceChange);
}, { once: true });
