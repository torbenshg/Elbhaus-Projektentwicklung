// Gemeinsame Navigation und Anfrage für alle Seiten.
(function () {
  const menu = document.querySelector('header .menu');
  const navigation = document.getElementById('primary-nav');
  if (menu && navigation) {
    const setMenuOpen = (open) => {
      navigation.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    };
    menu.addEventListener('click', () => setMenuOpen(menu.getAttribute('aria-expanded') !== 'true'));
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menu.focus();
      }
    });
  }

  document.querySelectorAll('form[data-contact-form]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const status = form.querySelector('.form-status');
      const button = form.querySelector('button[type="submit"]');
      const originalLabel = button ? button.textContent : '';
      if (button) {
        button.disabled = true;
        button.textContent = 'Anfrage wird gesendet …';
      }
      if (status) {
        status.classList.remove('is-success', 'is-error');
        status.textContent = 'Ihre Anfrage wird übermittelt …';
      }
      form.setAttribute('aria-busy', 'true');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok !== true) {
          throw new Error(result.message || 'Die Anfrage konnte nicht gesendet werden.');
        }
        form.reset();
        if (status) {
          status.classList.add('is-success');
          status.textContent = 'Vielen Dank. Ihre Anfrage wurde gesendet. Wir melden uns persönlich bei Ihnen.';
        }
      } catch (error) {
        if (status) {
          status.classList.add('is-error');
          status.innerHTML = 'Die Anfrage konnte gerade nicht übermittelt werden. Bitte schreiben Sie direkt an <a href="mailto:info@elbhaus-projekt.de">info@elbhaus-projekt.de</a>.';
        }
      } finally {
        form.removeAttribute('aria-busy');
        if (button) {
          button.disabled = false;
          button.textContent = originalLabel;
        }
      }
    });
  });

  const valueSection = document.querySelector('.value-development');
  if (valueSection) {
    const amounts = Array.from(valueSection.querySelectorAll('[data-count-euro]'));
    const formatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
    const values = amounts.map(element => {
      const original = element.textContent.trim();
      return {
        element,
        target: Number(original.replace(/\D/g, '')),
        prefix: original.startsWith('+') ? '+' : '',
      };
    });
    const render = (item, value) => {
      item.element.textContent = `${item.prefix}${formatter.format(Math.round(value))} €`;
    };
    values.forEach(item => render(item, 0));

    let hasRun = false;
    const runCounters = () => {
      if (hasRun) return;
      hasRun = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        values.forEach(item => render(item, item.target));
        return;
      }
      const duration = 2400;
      const start = performance.now();
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        values.forEach(item => render(item, item.target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounters();
            observer.disconnect();
          }
        });
      }, { threshold: 0.22 });
      observer.observe(valueSection);
    } else {
      runCounters();
    }
  }

  const touchGraphics = document.querySelectorAll('.typical-situations .situation, .value-case, .infill-case');
  touchGraphics.forEach(graphic => {
    let releaseTimer;
    const activate = event => {
      if (event.pointerType !== 'touch') return;
      window.clearTimeout(releaseTimer);
      touchGraphics.forEach(item => {
        if (item !== graphic) item.classList.remove('is-touch-active');
      });
      graphic.classList.add('is-touch-active');
    };
    const release = event => {
      if (event.pointerType !== 'touch') return;
      releaseTimer = window.setTimeout(() => graphic.classList.remove('is-touch-active'), 700);
    };
    graphic.addEventListener('pointerdown', activate, { passive: true });
    graphic.addEventListener('pointerup', release, { passive: true });
    graphic.addEventListener('pointercancel', release, { passive: true });
  });

})();


// Kompakte Sticky-Navigation nach dem ersten Scrollbereich
(function () {
  const header = document.querySelector('header');
  if (!header) return;
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 28);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();


// Kurzer Marken-Auftakt: zuerst nur das Elbhaus-Logo, danach Navigation und Seiteninhalt.
// Die Verzögerung ist bewusst sehr kurz, damit die Seite nicht langsam wirkt.
(function(){
  const body=document.body;
  if(!body || !body.classList.contains('page-intro')) return;
  window.setTimeout(function(){
    body.classList.add('intro-reveal');
  }, 180);
})();


// Startseite: Skizze baut sich erst auf, wenn sie beim Scrollen sichtbar wird.
(function(){
  const sketches=document.querySelectorAll('[data-sketch-build]');
  if(!sketches.length) return;

  if(!('IntersectionObserver' in window)){
    sketches.forEach(el=>el.classList.add('is-drawing'));
    return;
  }

  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-drawing');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:.28});

  sketches.forEach(el=>observer.observe(el));
})();


// Freigestellte Aufstockungsskizze: erst beim Sichtbarwerden Linie für Linie aufbauen.
(function(){
 const el=document.querySelector('[data-line-sketch]');
 if(!el) return;
 const draw=()=>{
   if(el.classList.contains('is-drawing')) return;
   el.classList.add('is-drawing');
   window.setTimeout(()=>el.classList.add('is-complete'),3250);
 };
 if(!('IntersectionObserver' in window)){draw();return;}
 const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
     if(entry.isIntersecting){draw();io.disconnect();}
   });
 },{threshold:.25});
 io.observe(el);
})();

// Echte SVG-Pfadanimation: startet einmal, sobald die Skizze ins Sichtfeld kommt.
(function(){
 const el=document.querySelector('[data-svg-sketch]');
 if(!el)return;
 const start=()=>el.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){start();io.disconnect()}}),{threshold:.28});
 io.observe(el);
})();

// Originalgetreuer Linienaufbau der freigegebenen Aufstockungsskizze.
(function(){
 const box=document.querySelector('[data-approved-sketch]');
 if(!box)return;
 box.querySelectorAll('.approved-lines path').forEach((p,i)=>p.style.setProperty('--path-index',i));
 const start=()=>box.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){start();io.disconnect()}}),{threshold:.24});
 io.observe(box);
})();

// Zeichnet die aus der freigegebenen Originalskizze erkannten Linien erst beim Scrollen.
(function(){
 const el=document.querySelector('[data-exact-sketch]');
 if(!el)return;
 const start=()=>el.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){start();io.disconnect();}});
 },{threshold:.24});
 io.observe(el);
})();

// Die nachgezeichnete Originalgeometrie entsteht erst beim Erreichen des Bereichs.
(function(){
 const el=document.querySelector('[data-traced-sketch]');
 if(!el)return;
 const start=()=>el.classList.add('is-drawing');
 if(!('IntersectionObserver' in window)){start();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){start();io.disconnect()}}),{threshold:.22});
 io.observe(el);
})();


// Freigestellte Aufstockungsskizze beim Herunterscrollen langsam einblenden.
(function(){
  const el=document.querySelector('[data-sketch-fade]');
  if(!el)return;
  const show=()=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){show();return;}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){show();io.disconnect();}
    });
  },{threshold:.25});
  io.observe(el);
})();


// Machbarkeitsstudien-Skizze analog zur Aufstockungsskizze langsam einblenden.
(function(){
  const el=document.querySelector('[data-study-sketch-fade]');
  if(!el)return;
  const show=()=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){show();return}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){show();io.disconnect()}});
  },{threshold:.25});
  io.observe(el);
})();

(function(){
 const el=document.querySelector('[data-infill-sketch-fade]'); if(!el)return;
 const show=()=>el.classList.add('is-visible');
 if(!('IntersectionObserver' in window)){show();return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){show();io.disconnect()}}),{threshold:.25});
 io.observe(el);
})();

/* Leistungsumfang: Scroll-Reveal */
(function(){
  const lists=document.querySelectorAll('.scope-scroll-reveal');
  if(!lists.length)return;
  if(!('IntersectionObserver' in window)){
    lists.forEach(el=>el.classList.add('is-visible'));
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  lists.forEach(el=>io.observe(el));
})();

/* Prozessschritte 01–04 beim Erreichen des Bereichs zügig nacheinander einblenden. */
(function(){
  const groups=document.querySelectorAll('.process-steps');
  if(!groups.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    groups.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.28,rootMargin:'0px 0px -8% 0px'});
  groups.forEach(el=>io.observe(el));
})();

/* Die drei Leistungssymbole und die drei Entwicklungsgrafiken gruppenweise gleichzeitig einblenden. */
(function(){
  const groups=document.querySelectorAll('.service-areas .cards, .typical-situations .situations-grid');
  if(!groups.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    groups.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.2,rootMargin:'0px 0px -8% 0px'});
  groups.forEach(el=>io.observe(el));
})();

/* Zweispaltige Startseitenbereiche und ausschließlich das Kontaktformular seitlich einfliegen lassen. */
(function(){
  const sections=document.querySelectorAll('.scroll-split-reveal, .contact-form-reveal');
  if(!sections.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    sections.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.16,rootMargin:'0px 0px -8% 0px'});
  sections.forEach(el=>io.observe(el));
})();

/* Einzelne Textblöcke auf den Unterseiten erst beim eigenen Eintritt in den Viewport einfliegen lassen. */
(function(){
  const blocks=document.querySelectorAll('.scroll-fly-left, .scroll-fly-right');
  if(!blocks.length)return;
  const show=el=>el.classList.add('is-visible');
  if(!('IntersectionObserver' in window)){
    blocks.forEach(show);
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  },{threshold:.13,rootMargin:'0px 0px -7% 0px'});
  blocks.forEach(el=>io.observe(el));
})();
