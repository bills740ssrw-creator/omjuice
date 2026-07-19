/* ============================================
   SHAKE LAB — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Nav behavior ---- */
  const nav = document.querySelector('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const hero = document.querySelector('.hero');

  function updateNav() {
    if (!nav) return;
    if (hero) {
      /* Hero page: nav is dark at top, solid when scrolled past hero */
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (window.scrollY > heroBottom - 100) {
        nav.classList.remove('dark');
        nav.classList.add('scrolled');
      } else {
        nav.classList.add('dark');
        nav.classList.remove('scrolled');
      }
    } else {
      /* Non-hero pages: nav is always solid */
      nav.classList.remove('dark');
      nav.classList.add('scrolled');
    }
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      nav.classList.toggle('menu-open');
      document.documentElement.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        if (a.parentElement?.classList.contains('nav-dropdown')) return;
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
        nav.classList.remove('menu-open');
        document.documentElement.style.overflow = '';
      });
    });
  }

  const navDropdown = document.querySelector('.nav-dropdown');
  if (navDropdown) {
    const dropdownLink = navDropdown.querySelector('a');
    const dropdownContent = navDropdown.querySelector('.nav-dropdown-content');
    dropdownLink?.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdownContent.classList.toggle('open');
      document.querySelectorAll('.nav-dropdown-content.open').forEach(el => {
        if (el !== dropdownContent) el.classList.remove('open');
      });
    });
    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target)) {
        dropdownContent.classList.remove('open');
      }
    });
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---- IntersectionObserver: fade-in animations ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const fadeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => fadeObs.observe(el));
  }

  const videoEls = {
    a: document.querySelector('.hero-video-a'),
    b: document.querySelector('.hero-video-b'),
    c: document.querySelector('.hero-video-c'),
    d: document.querySelector('.hero-video-d'),
  };

  if (videoEls.a) {
    const isMobile = window.innerWidth <= 767;
    const rotate = [videoEls.a, videoEls.c, videoEls.d].filter(Boolean);

    if (isMobile || rotate.length < 2) {
      videoEls.a.loop = true;
      videoEls.a.currentTime = 0;
      videoEls.a.play();
      [videoEls.b, videoEls.c, videoEls.d].forEach(el => { if (el && el !== videoEls.a) el.style.display = 'none'; });
    } else {
      let currentIdx = 0;
      rotate.forEach((el, i) => { if (i !== 0) el.style.opacity = '0'; });
      rotate[0].currentTime = 0;
      rotate[0].play();

      function attachLoop(idx) {
        const el = rotate[idx];
        el.addEventListener('timeupdate', function handler() {
          if (!el.duration) return;
          if (el.currentTime >= 9) {
            el.removeEventListener('timeupdate', handler);
            const nextIdx = (idx + 1) % rotate.length;
            currentIdx = nextIdx;
            const next = rotate[nextIdx];
            next.currentTime = nextIdx === 1 ? 2 : 0;
            next.play();
            next.style.opacity = '1';
            el.style.opacity = '0';
            setTimeout(() => { el.pause(); attachLoop(nextIdx); }, 1000);
          }
        });
      }

      attachLoop(0);

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && rotate[currentIdx].paused) rotate[currentIdx].play();
      });
    }
  }

  /* ---- Theme + GSAP animations ---- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

    /* ---- Featured shakes: card parallax ---- */
    gsap.utils.toArray('.shake-card').forEach((card, i) => {
      const img = card.querySelector('.shake-card-media');
      if (img) {
        gsap.to(img, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        });
      }
    });

    ScrollTrigger.refresh();
  }

  /* ---- Menu: filter tabs ---- */
  const tabs = document.querySelectorAll('.menu-tab');
  const items = document.querySelectorAll('.menu-item, .menu-section-heading');
  if (tabs.length && items.length) {
    let menuFilterTimeout;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (menuFilterTimeout) clearTimeout(menuFilterTimeout);
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.category;
        items.forEach(item => {
          item.classList.remove('menu-filtering');
          let show = false;
          if (cat === 'all') {
            show = true;
          } else if (cat === 'bestseller') {
            show = item.hasAttribute('data-bestseller');
          } else {
            show = item.dataset.category === cat;
          }
          if (show) {
            item.style.display = '';
            item.style.opacity = '1';
          } else {
            item.style.opacity = '0';
            item.classList.add('menu-filtering');
            menuFilterTimeout = setTimeout(() => {
              document.querySelectorAll('.menu-filtering').forEach(el => {
                el.style.display = 'none';
                el.classList.remove('menu-filtering');
              });
            }, 300);
          }
        });
      });
    });
  }

  /* ---- Contact form (WhatsApp) ---- */
  const waForm = document.querySelector('.contact-form-wa');
  if (waForm) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = waForm.querySelector('#wa-name').value.trim();
      const message = waForm.querySelector('#wa-message').value.trim();
      if (!name || !message) return;
      const text = encodeURIComponent(`Hi, I'm ${name}.\n\n${message}`);
      window.open(`https://wa.me/919958125525?text=${text}`, '_blank');
    });
  }

  /* ---- Refresh on resize ---- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 250);
  });
});
