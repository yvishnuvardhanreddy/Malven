// Preloader — quick intro, then fade out as soon as page is ready
(function preloader() {
  const pre = document.getElementById('preloader');
  if (!pre) { document.body.classList.remove('loading'); return; }
  const minShow = 600;
  const start = performance.now();

  function finish() {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minShow - elapsed);
    setTimeout(() => {
      pre.classList.add('hide');
      document.body.classList.remove('loading');
      setTimeout(() => pre.remove(), 500);
    }, wait);
  }
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });

  // Hard fallback
  setTimeout(finish, 2500);
})();

// Navbar scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Reveal on scroll
(function revealInit() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));
})();

// Animated stat counters
(function statCounters() {
  const stats = document.querySelectorAll('.stat-number[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  stats.forEach((s) => counterObserver.observe(s));
})();

// Mobile nav
(function mobileNav() {
  const burger = document.getElementById('navBurger');
  const links = document.querySelector('.nav-links');
  if (!burger || !links) return;
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
    })
  );
})();

// Contact form — FormSubmit submission with client-side validation
(function formSubmit() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  function val(id) {
    const el = form.querySelector('#' + id);
    return el ? el.value.trim() : '';
  }

  form.addEventListener('submit', (e) => {
    if (!val('fName') || !val('email')) {
      e.preventDefault();
      showToast('Please fill the required fields.', true);
      return;
    }
    const btn = form.querySelector('.form-submit');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
  });

  function showToast(message, isError) {
    let toast = document.querySelector('.form-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'form-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = isError ? '#c25a5a' : '';
    toast.style.color = isError ? '#fff' : '';
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3800);
  }
})();

// Parallax hero title
(function heroParallax() {
  const content = document.querySelector('.hero-content');
  const bg = document.querySelector('.hero-bg');
  if (!content || !bg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    content.style.transform = `translateY(${y * 0.15}px)`;
    content.style.opacity = String(Math.max(1 - y / 600, 0));
  }, { passive: true });
})();


// Testimonials carousel — prev/next buttons + scroll-snap + active dot indicator
(function testimonialsCarousel() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;
  const prevNext = document.querySelectorAll('[data-tnav]');
  const dotsWrap = document.getElementById('testimonialDots');
  const cards = Array.from(track.children);
  if (!cards.length) return;

  function cardStep() {
    const first = cards[0];
    const second = cards[1];
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }

  // Dots — one per card
  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    b.addEventListener('click', () => {
      track.scrollTo({ left: i * cardStep(), behavior: 'smooth' });
    });
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function activeIndex() {
    return Math.round(track.scrollLeft / cardStep());
  }
  function updateDots() {
    const i = activeIndex();
    dots.forEach((d, di) => d.classList.toggle('active', di === i));
    prevNext[0].disabled = track.scrollLeft <= 2;
    prevNext[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
  track.addEventListener('scroll', updateDots, { passive: true });
  window.addEventListener('resize', updateDots);
  updateDots();

  prevNext.forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.tnav, 10);
      track.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
    });
  });
})();

// Project lightbox modal — data-driven, keyboard + touch navigable
(function projectModal() {
  const projects = {
    'atrium-house': {
      eyebrow: 'Residential · 2024',
      title: 'The Skyline Villa',
      location: 'Hyderabad, Telangana',
      desc: 'A contemporary residence where crisp white volumes, a mirror-finish pool and deep overhangs frame the view in every direction. Inside, open-plan living with walnut accents and quiet furniture lets the architecture breathe. A showcase of modern luxury — architectural clarity with calm, liveable interiors.',
      specs: [
        { label: 'Typology', val: 'Private Residence' },
        { label: 'Built-up Area', val: '9,400 sq ft' },
        { label: 'Plot', val: '14,200 sq ft' },
        { label: 'Duration', val: '22 months' },
        { label: 'Bedrooms', val: '5 Suites' },
        { label: 'Status', val: 'Completed 2024' }
      ],
      folder: '',
      images: [
        { file: 'atrium-exterior.jpg',     caption: 'Exterior & Pool'       },
        { file: 'atrium-02-living.jpg',    caption: 'Family Lounge'         },
        { file: 'atrium-08-staircase.jpg', caption: 'Open-Plan Living'      },
        { file: 'atrium-04-kitchen.jpg',   caption: 'Modern Kitchen'        },
        { file: 'atrium-03-dining.jpg',    caption: 'Reading Nook'          },
        { file: 'atrium-05-bedroom.jpg',   caption: 'Primary Bedroom'       },
        { file: 'atrium-modern-lounge.jpg',caption: 'Evening Lounge'        },
        { file: 'harmony-05-bath.jpg',     caption: 'Primary Ensuite'       }
      ]
    },
    'harmony-suite': {
      eyebrow: 'Interior · 2024',
      title: 'Harmony Suite',
      location: 'Bangalore, Karnataka',
      desc: 'An interiors project of bedrooms and intimate spaces, layered in warm neutrals and soft textures. Tufted headboards, brushed brass accents, a pop of ochre, linen and wood. The brief was "quiet luxury" — a sanctuary of curated corners, each one tuned for rest, reading, or ritual.',
      specs: [
        { label: 'Typology', val: 'Interior Fit-out' },
        { label: 'Area', val: '2,100 sq ft' },
        { label: 'Duration', val: '4 months' },
        { label: 'Rooms', val: 'Primary · Guest · Lounge' },
        { label: 'Materials', val: 'Oak, Brass, Linen' },
        { label: 'Status', val: 'Completed 2024' }
      ],
      folder: '',
      images: [
        { file: 'harmony-exterior.jpg',       caption: 'Facade at Dusk'      },
        { file: 'harmony-classic-living.jpg', caption: 'Formal Living'       },
        { file: 'harmony-01-bedroom.jpg',     caption: 'Primary Bedroom'     },
        { file: 'harmony-02-angle.jpg',       caption: 'Master Suite'        },
        { file: 'harmony-03-sitting.jpg',     caption: 'Reading Corner'      },
        { file: 'harmony-04-closet.jpg',      caption: 'Walk-in Wardrobe'    },
        { file: 'harmony-06-reading.jpg',     caption: 'Breakfast Corner'    },
        { file: 'harmony-07-night.jpg',       caption: 'Evening Ambience'    }
      ]
    },
    'terracotta-threshold': {
      eyebrow: 'Architecture · 2023',
      title: 'Palace Residence',
      location: 'Hyderabad, Telangana',
      desc: 'A private residence conceived with palatial restraint — a rhythmic white facade wrapped in deep shadow, a mirror-still pool at dusk, and interiors that lean into dark, aesthetic moods. Jewel-toned lounges, chandelier-lit suites, and gallery corridors where every light level has been deliberately tuned.',
      specs: [
        { label: 'Typology', val: 'Private Residence' },
        { label: 'Built-up Area', val: '7,400 sq ft' },
        { label: 'Plot', val: '12,000 sq ft' },
        { label: 'Duration', val: '20 months' },
        { label: 'Bedrooms', val: '5 Suites' },
        { label: 'Status', val: 'Completed 2023' }
      ],
      folder: '',
      images: [
        { file: 'palace-exterior.jpg',        caption: 'Pool Facade at Dusk' },
        { file: 'palace-suite.jpg',           caption: 'Master Suite'         },
        { file: 'palace-lounge.jpg',          caption: 'Dark Lounge'          },
        { file: 'terracotta-08-interior.jpg', caption: 'Jewel Room'           },
        { file: 'palace-den.jpg',             caption: 'Private Den'          },
        { file: 'terracotta-04-corridor.jpg', caption: 'Gallery Corridor'     },
        { file: 'terracotta-06-terrace.jpg',  caption: 'Private Terrace'      },
        { file: 'harmony-08-detail.jpg',      caption: 'Material Detail'      }
      ]
    }
  };

  const modal = document.getElementById('pmodal');
  if (!modal) return;
  const hero = document.getElementById('pmodalHero');
  const counter = document.getElementById('pmodalCounter');
  const eyebrow = document.getElementById('pmodalEyebrow');
  const title = document.getElementById('pmodalTitle');
  const location = document.getElementById('pmodalLocation');
  const desc = document.getElementById('pmodalDesc');
  const specs = document.getElementById('pmodalSpecs');
  const thumbs = document.getElementById('pmodalThumbs');

  let current = null;
  let index = 0;
  let lastFocus = null;

  function open(projectKey, triggerEl) {
    const project = projects[projectKey];
    if (!project) return;
    current = project;
    index = 0;
    lastFocus = triggerEl || document.activeElement;

    eyebrow.textContent = project.eyebrow;
    title.textContent = project.title;
    location.textContent = project.location;
    desc.textContent = project.desc;

    specs.innerHTML = project.specs.map(s => (
      `<li><span class="spec-label">${s.label}</span><span class="spec-val">${s.val}</span></li>`
    )).join('');

    thumbs.innerHTML = project.images.map((img, i) => (
      `<button class="pmodal-thumb" type="button" data-i="${i}" aria-label="${img.caption}">
         <img src="${project.folder}${img.file}" alt="${img.caption}" loading="lazy">
       </button>`
    )).join('');

    setIndex(0, /*skipTransition*/ true);

    document.body.classList.add('modal-open');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('visible'));

    // Preload all images for snappy nav
    project.images.forEach(img => {
      const i = new Image();
      i.src = project.folder + img.file;
    });

    setTimeout(() => modal.querySelector('.pmodal-close').focus(), 450);
  }

  function close() {
    modal.classList.remove('visible');
    setTimeout(() => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 400);
  }

  function setIndex(i, skipTransition) {
    if (!current) return;
    const total = current.images.length;
    index = (i + total) % total;
    const img = current.images[index];
    if (skipTransition) hero.classList.remove('loaded');
    else hero.classList.remove('loaded');

    // Wait a frame then swap src so the transition triggers
    requestAnimationFrame(() => {
      hero.src = current.folder + img.file;
      hero.alt = img.caption;
      hero.onload = () => hero.classList.add('loaded');
    });

    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

    thumbs.querySelectorAll('.pmodal-thumb').forEach((t, ti) => {
      t.classList.toggle('active', ti === index);
    });
    const activeThumb = thumbs.querySelector('.pmodal-thumb.active');
    if (activeThumb) activeThumb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  // Card click handlers
  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click', () => {
      open(card.dataset.project, card);
    });
  });

  // Close handlers
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target.closest('[data-close]')) {
      close();
    }
  });

  // Nav button handlers (event delegation for buttons & thumbs)
  modal.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      setIndex(index + parseInt(navBtn.dataset.nav, 10));
      return;
    }
    const thumb = e.target.closest('.pmodal-thumb');
    if (thumb) {
      setIndex(parseInt(thumb.dataset.i, 10));
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') setIndex(index + 1);
    else if (e.key === 'ArrowLeft') setIndex(index - 1);
  });

  // Touch swipe on stage
  const stage = modal.querySelector('.pmodal-stage');
  let touchStartX = 0;
  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) setIndex(index + (dx < 0 ? 1 : -1));
  });
})();

// Services detail modal
(function servicesModal() {
  const services = {
    'architectural-design': {
      num: '01',
      eyebrow: 'Service 01',
      title: 'Architectural Design',
      image: 'atrium-01-exterior.jpg',
      desc: 'From the first sketch to the final elevation, we shape buildings that respond to site, climate and the people who will live in them. Residential villas, corporate campuses, mixed-use developments — each project begins with deep context research and ends with architecture that feels inevitable.',
      process: ['Site analysis & contextual study', 'Conceptual massing & schematic design', 'Design development & material palette', 'Construction documentation', 'Site supervision & handover'],
      deliver: ['Concept narrative & moodboards', 'Stamped architectural drawings', 'Material & finish schedules', '3D renders + fly-through', 'Regulatory liaison'],
      timeline: '6–18 months',
      price: '₹250/sqft',
      ideal: 'Ground-up projects'
    },
    'interior-design': {
      num: '02',
      eyebrow: 'Service 02',
      title: 'Interior Design',
      image: 'terracotta-02-entry.jpg',
      desc: 'Interiors that balance the tactile and the timeless. We compose rooms around light, proportion and materiality — oak, brass, linen, stone — never trend-driven, always specific to the people who will inhabit them.',
      process: ['Lifestyle brief & mood direction', 'Concept + layout options', 'FF&E selection & procurement', 'Site execution & joinery supervision', 'Styling & photography handover'],
      deliver: ['Curated mood narrative', 'Detailed interior drawings', 'Furniture, lighting & art schedule', 'Material & fabric library', 'Final styling session'],
      timeline: '3–8 months',
      price: '₹1,800/sqft',
      ideal: 'Homes & boutique offices'
    },
    'space-planning': {
      num: '03',
      eyebrow: 'Service 03',
      title: 'Space Planning',
      image: 'terracotta-03-courtyard.jpg',
      desc: 'Before the first finish is chosen, the plan has to breathe. We work at the level of circulation, adjacencies and daylight — rewriting layouts so every metre earns its place. Ideal for new homes, workspaces and layout rethinks.',
      process: ['Functional brief & activity mapping', 'Zoning & bubble diagrams', 'Options study with trade-offs', 'Refined plan with dimensions', 'Presentation & approval'],
      deliver: ['Comparative plan options', 'Annotated floor plans', 'Circulation studies', 'Daylight & ventilation notes', 'Recommendation report'],
      timeline: '3–6 weeks',
      price: '₹45,000 onwards',
      ideal: 'Early-stage projects'
    },
    'renovation-fitout': {
      num: '04',
      eyebrow: 'Service 04',
      title: 'Renovation & Fit-Out',
      image: 'terracotta-07-stone.jpg',
      desc: 'Working with an existing shell is an act of editing. We strip what doesn\u2019t serve, honour what does, and insert contemporary moments that elevate the whole — whether it is a 1970s apartment or a heritage bungalow.',
      process: ['Existing condition survey', 'Intervention study & feasibility', 'Design proposal + cost plan', 'Demolition & execution management', 'Snagging & handover'],
      deliver: ['Heritage-sensitive strategy', 'Before/after documentation', 'Vendor coordination', 'Weekly progress reports', 'Warranty schedule'],
      timeline: '4–10 months',
      price: '₹1,400/sqft',
      ideal: 'Existing homes & offices'
    },
    '3d-visualization': {
      num: '05',
      eyebrow: 'Service 05',
      title: '3D Visualization',
      image: 'atrium-07-outdoor.jpg',
      desc: 'See your space before it exists. Our 3D team produces cinematic, photo-real renders and walkthroughs — not generic corporate visuals, but mood-accurate images that capture the feeling of standing inside a room that isn\u2019t built yet.',
      process: ['Reference gathering & brief', 'Base modelling & camera angles', 'Material & lighting studies', 'Final render passes', 'Post-production & delivery'],
      deliver: ['4K still renders (interior + exterior)', 'Material close-ups', '45-second walkthrough video', 'Revisions (two rounds)', 'Print-ready assets'],
      timeline: '2–4 weeks',
      price: '₹15,000/view',
      ideal: 'Pre-build or marketing'
    },
    'project-management': {
      num: '06',
      eyebrow: 'Service 06',
      title: 'Project Management',
      image: 'terracotta-05-garden.jpg',
      desc: 'Design is only half the work. The other half is running the site — coordinating vendors, staging materials, flagging slips before they turn into delays. We manage every handoff with transparency, so your project lands on time, on budget, and without drama.',
      process: ['Scope & schedule lock-in', 'Vendor empanelment & quotes', 'Procurement & logistics', 'Weekly site reviews', 'Closing & handover'],
      deliver: ['Master schedule (Gantt)', 'Transparent cost ledger', 'Vendor contracts', 'Weekly progress dashboard', 'Final snag-free handover'],
      timeline: 'Project-long',
      price: '8–12% of project cost',
      ideal: 'End-to-end delivery'
    }
  };

  const smodal = document.getElementById('smodal');
  if (!smodal) return;
  const num = document.getElementById('smodalNum');
  const img = document.getElementById('smodalImage');
  const eyebrow = document.getElementById('smodalEyebrow');
  const title = document.getElementById('smodalTitle');
  const desc = document.getElementById('smodalDesc');
  const process = document.getElementById('smodalProcess');
  const deliver = document.getElementById('smodalDeliver');
  const timeline = document.getElementById('smodalTimeline');
  const price = document.getElementById('smodalPrice');
  const ideal = document.getElementById('smodalIdeal');

  let lastFocus = null;

  function open(key, trigger) {
    const s = services[key];
    if (!s) return;
    lastFocus = trigger || document.activeElement;
    num.textContent = s.num;
    img.src = s.image;
    img.alt = s.title;
    eyebrow.textContent = s.eyebrow;
    title.textContent = s.title;
    desc.textContent = s.desc;
    process.innerHTML = s.process.map(p => `<li>${p}</li>`).join('');
    deliver.innerHTML = s.deliver.map(d => `<li>${d}</li>`).join('');
    timeline.textContent = s.timeline;
    price.textContent = s.price;
    ideal.textContent = s.ideal;

    document.body.classList.add('modal-open');
    smodal.classList.add('open');
    smodal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => smodal.classList.add('visible'));
    setTimeout(() => smodal.querySelector('.smodal-close').focus(), 450);
  }

  function close() {
    smodal.classList.remove('visible');
    setTimeout(() => {
      smodal.classList.remove('open');
      smodal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 400);
  }

  document.querySelectorAll('[data-service]').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.service, card));
  });
  smodal.addEventListener('click', (e) => {
    if (e.target.matches('[data-sclose]') || e.target.closest('[data-sclose]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && smodal.classList.contains('open')) close();
  });
})();

// Gallery lightbox — simple zoom with nav
(function galleryLightbox() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  if (!items.length) return;

  const data = items.map(el => ({
    src: el.querySelector('img').src,
    tag: el.querySelector('.cap-tag').textContent,
    title: el.querySelector('.cap-title').textContent,
    alt: el.querySelector('img').alt
  }));

  const gmodal = document.getElementById('gmodal');
  if (!gmodal) return;
  const gImg = document.getElementById('gmodalImage');
  const gTag = document.getElementById('gmodalTag');
  const gTitle = document.getElementById('gmodalTitle');
  const gCount = document.getElementById('gmodalCounter');

  let gIndex = 0;
  let lastFocus = null;

  function show(i) {
    gIndex = (i + data.length) % data.length;
    const d = data[gIndex];
    gImg.classList.remove('loaded');
    requestAnimationFrame(() => {
      gImg.src = d.src;
      gImg.alt = d.alt;
      gImg.onload = () => gImg.classList.add('loaded');
    });
    gTag.textContent = d.tag;
    gTitle.textContent = d.title;
    gCount.textContent = `${String(gIndex + 1).padStart(2, '0')} / ${String(data.length).padStart(2, '0')}`;
  }

  function open(i, trigger) {
    lastFocus = trigger || document.activeElement;
    show(i);
    document.body.classList.add('modal-open');
    gmodal.classList.add('open');
    gmodal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => gmodal.classList.add('visible'));
    setTimeout(() => gmodal.querySelector('.gmodal-close').focus(), 450);
  }

  function close() {
    gmodal.classList.remove('visible');
    setTimeout(() => {
      gmodal.classList.remove('open');
      gmodal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 400);
  }

  items.forEach((el, i) => {
    el.addEventListener('click', () => open(i, el));
  });

  gmodal.addEventListener('click', (e) => {
    if (e.target.matches('[data-gclose]') || e.target.closest('[data-gclose]')) {
      close();
      return;
    }
    const nav = e.target.closest('[data-gnav]');
    if (nav) show(gIndex + parseInt(nav.dataset.gnav, 10));
  });

  document.addEventListener('keydown', (e) => {
    if (!gmodal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(gIndex + 1);
    else if (e.key === 'ArrowLeft') show(gIndex - 1);
  });

  // Touch swipe
  let tx = 0;
  gmodal.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  gmodal.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(gIndex + (dx < 0 ? 1 : -1));
  });
})();

// Panorama side-sliding carousel — arrows, dots, keyboard, touch swipe
(function panoramaSlider() {
  const slider = document.querySelector('.pano-slider');
  if (!slider) return;
  const track = slider.querySelector('.pano-track');
  const slides = track.querySelectorAll('.pano-slide');
  const prev = slider.querySelector('[data-pano-nav="-1"]');
  const next = slider.querySelector('[data-pano-nav="1"]');
  const dots = slider.querySelectorAll('[data-pano-go]');
  if (!slides.length) return;

  let index = 0;

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
  }

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));
  dots.forEach((d) => {
    d.addEventListener('click', () => go(parseInt(d.dataset.panoGo, 10)));
  });

  // Keyboard arrows when slider is in view
  document.addEventListener('keydown', (e) => {
    const rect = slider.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
    if (!inView) return;
    if (e.key === 'ArrowLeft')  go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  // Touch swipe
  let startX = 0, delta = 0, swiping = false;
  track.addEventListener('pointerdown', (e) => {
    swiping = true; startX = e.clientX; delta = 0;
    track.style.transition = 'none';
  });
  track.addEventListener('pointermove', (e) => {
    if (!swiping) return;
    delta = e.clientX - startX;
    track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`;
  });
  function endSwipe() {
    if (!swiping) return;
    swiping = false;
    track.style.transition = '';
    if (Math.abs(delta) > 60) go(index + (delta < 0 ? 1 : -1));
    else go(index);
  }
  track.addEventListener('pointerup', endSwipe);
  track.addEventListener('pointercancel', endSwipe);
  track.addEventListener('pointerleave', endSwipe);
})();
