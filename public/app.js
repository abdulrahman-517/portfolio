const SITE = {
  name: 'Abdulrahman Al-Mushajari',
  email: 'abdulrahmanalmushajari@gmail.com',
  github: 'https://github.com/abdulrahman-517',
  portfolio: 'https://portofile001.netlify.app/'
};

const PROJECTS = [
  { slug: 'car-dealership', title: '\u0645\u0639\u0631\u0636 \u0633\u064a\u0627\u0631\u0627\u062a', type: 'Car Dealership Platform', icon: 'car.svg', image: 'car-dealership.png', summary: 'An Arabic-first vehicle dealership experience for presenting inventory, discovery, and direct enquiries.', stack: ['React', 'Next.js', 'Tailwind CSS'], overview: 'A focused product concept for organizing vehicle inventory into a clear customer journey without losing the practical needs of dealership operations.', features: ['Vehicle inventory presentation', 'Search and filtering flows', 'Vehicle detail views', 'Direct enquiry pathways'], capabilities: ['Responsive catalogue patterns', 'Arabic RTL user experience', 'Structured inventory interfaces'], approach: 'Designed around the decisions a buyer needs to make: compare inventory, understand the details, and make contact with confidence.', limitations: 'Public source and live access are not currently published.' },
  { slug: 'vitamin-c-blog', title: 'Vitamin C Blog', type: 'Editorial Content Platform', icon: 'article.svg', image: 'vitamin-c-blog.png', summary: 'A readable editorial experience shaped for structured content, discovery, and long-form browsing.', stack: ['React', 'Next.js', 'Tailwind CSS'], overview: 'A content product direction that prioritizes an intentional reading experience and a sensible structure for articles and categories.', features: ['Article-led publishing layout', 'Content discovery structure', 'Readable long-form presentation'], capabilities: ['Editorial interface systems', 'Accessible reading patterns', 'Responsive layouts'], approach: 'The design begins with clarity: make content easy to scan, easy to read, and easy to return to.', limitations: 'Public source and live access are not currently published.' },
  { slug: 'mowasalatna', title: '\u0645\u0648\u0627\u0635\u0644\u0627\u062a\u0646\u0627', type: 'Route & Trip Status', icon: 'route.svg', image: 'mowasalatna.png', summary: 'A public transport-oriented experience for route discovery and trip-status information.', stack: ['React', 'Node.js', 'PostgreSQL'], overview: 'A service-oriented digital product built to make transportation information more approachable through a direct, Arabic-first interface.', features: ['Route discovery', 'Trip-status information', 'Service-oriented navigation'], capabilities: ['Arabic-first product UX', 'Responsive service design', 'Information hierarchy'], live: 'https://mowasalatna.com/mowasalat', approach: 'The experience keeps essential service information close to the surface, with fewer steps between a traveller and the answer they need.', limitations: 'Implementation details are intentionally kept private.' },
  { slug: 'haraj-al-dhad', title: '\u062d\u0631\u0627\u062c \u0627\u0644\u0636\u0627\u062f', type: 'Local Marketplace', icon: 'shopping-bag.svg', image: 'haraj-al-dhad.png', summary: 'A local marketplace direction centred on browsing, listings, and Arabic community commerce.', stack: ['TypeScript', 'React', 'PostgreSQL'], overview: 'A marketplace product concept that balances discoverability for visitors with clear listing pathways for sellers.', features: ['Listing-oriented browsing', 'Category-led discovery', 'Arabic marketplace flows'], capabilities: ['Marketplace UX', 'Search and browse patterns', 'RTL interface design'], approach: 'The product framing starts with familiar marketplace behaviour and turns it into a calmer, more legible browsing experience.', limitations: 'Public source and live access are not currently published.' },
  { slug: 'q-search', title: 'Q Search', type: 'Search Tool', icon: 'search.svg', image: 'q-search.png', summary: 'An open search project with a public repository available for inspection.', stack: ['Python', 'FastAPI'], overview: 'A public search-oriented project available for inspection through its repository.', features: ['Search workflow', 'Public repository'], capabilities: ['Python services', 'FastAPI', 'Deployment'], repo: 'https://github.com/abdulrahman-517/q-search', approach: 'A compact project that keeps its public surface focused on the core search workflow.', limitations: 'The live demonstration is not currently presented publicly.' }
];

const icon = (name, className = '') => `<img class="icon ${className}" src="/assets/icons/${name}" alt="" aria-hidden="true">`;
const esc = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const bySlug = (slug) => PROJECTS.find((project) => project.slug === slug);
const isArabic = (text) => /[\u0600-\u06ff]/.test(text);

function visual(project, detail = false) {
  return `<div class="project-visual${detail ? ' detail-visual' : ''}" aria-label="${esc(project.title)} project visual"><div class="project-placeholder">${icon(project.icon)}<span ${isArabic(project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</span></div></div>`;
}

function hydrateProjectImages() {
  document.querySelectorAll('[data-project-image]').forEach((container) => {
    const image = new Image();
    image.src = `/assets/projects/${container.dataset.projectImage}`;
    image.alt = container.getAttribute('aria-label') || '';
    image.onload = () => { container.replaceChildren(image); container.classList.add('has-project-image'); };
  });
}

function header() {
  return `<header class="site-header" id="top"><div class="shell nav-shell"><a class="brand" href="/" aria-label="${SITE.name} home"><img class="brand-lockup" src="/assets/brand/am-lockup.svg" alt="Abdulrahman Al-Mushajari"><img class="brand-mark" src="/assets/brand/am-mark.svg" alt=""></a><button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-navigation">${icon('menu.svg')}</button><nav class="site-nav" id="site-navigation" aria-label="Primary navigation"><a href="/#projects">Projects</a><a href="/#about">About</a><a href="/#capabilities">Skills</a><a href="/#approach">Approach</a><a href="/#contact">Contact</a><a class="button button-small" href="/#contact">Get in touch ${icon('arrow-right.svg')}</a></nav></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="shell footer-inner"><a class="footer-brand" href="/"><img src="/assets/brand/am-lockup.svg" alt="Abdulrahman Al-Mushajari"></a><p>Building practical digital products with care and clarity.</p><div class="footer-links"><a href="${SITE.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icon('github.svg')}</a><a href="mailto:${SITE.email}" aria-label="Email">${icon('mail.svg')}</a></div></div></footer>`;
}

function card(project) {
  return `<article class="project-card">${visual(project)}<div class="project-card-body"><p class="project-type">${esc(project.type)}</p><h3 ${isArabic(project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</h3><p class="project-summary-small">${esc(project.summary)}</p><div class="tag-list">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div><a class="text-link" href="/projects/${project.slug}/">View project ${icon('arrow-right.svg')}</a></div></article>`;
}

const WORK_PROJECTS = PROJECTS.slice(0, 4);
const WORK_PLACEHOLDER = '/assets/work-slider/placeholders/01-project-placeholder-arctic-4k.png';

function workSlideContent(project, index) {
  const liveAction = project.live ? `<a class="button button-quiet" href="${project.live}" target="_blank" rel="noopener noreferrer">Open live ${icon('external-link.svg')}</a>` : '';
  return `<p class="eyebrow">Selected Work</p><div class="work-showcase__meta"><span>${String(index + 1).padStart(2, '0')}</span><span aria-hidden="true">/</span><span>04</span></div><p class="work-showcase__type">${esc(project.type)}</p><h3 id="active-work-title" ${isArabic(project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</h3><p class="work-showcase__summary">${esc(project.summary)}</p><div class="tag-list work-showcase__tags">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div><div class="work-showcase__actions"><a class="button" href="/projects/${project.slug}/">View project ${icon('arrow-right.svg')}</a>${liveAction}</div>`;
}

function workLaptop(project) {
  return `<div class="laptop work-showcase__laptop" aria-label="${esc(project.title)} project preview"><div class="laptop__lid"><div class="laptop-screen"><img data-work-preview src="${WORK_PLACEHOLDER}" alt="${esc(project.title)} project preview"><span class="laptop-screen__mark" aria-hidden="true">${icon(project.icon)}</span></div><span class="laptop__camera" aria-hidden="true"></span></div><div class="laptop__base" aria-hidden="true"></div></div>`;
}

function workShowcase() {
  const project = WORK_PROJECTS[0];
  return `<section class="work-showcase" id="projects" aria-labelledby="projects-title" tabindex="0" data-work-showcase data-work-index="0"><div class="work-showcase__scene" aria-hidden="true"><div class="work-showcase__backdrop"></div><div class="work-showcase__parallax"></div><div class="work-showcase__haze"></div><div class="work-showcase__particles"></div><div class="work-showcase__vignette"></div><div class="work-showcase__transition"></div></div><div class="shell work-showcase__shell"><div class="work-showcase__layout"><div class="work-showcase__panel"><div class="work-showcase__panel-frost" aria-hidden="true"></div><h2 class="sr-only" id="projects-title">Selected Work</h2><div class="work-showcase__content" data-work-content aria-live="polite">${workSlideContent(project, 0)}</div></div>${workLaptop(project)}</div><div class="work-showcase__bottom"><div class="work-progress" role="tablist" aria-label="Selected work navigation"><div class="work-progress__rail" aria-hidden="true"></div><div class="work-progress__active" aria-hidden="true"><div class="work-progress__elapsed"></div><span class="work-progress__dot"></span></div>${WORK_PROJECTS.map((item, index) => `<button type="button" class="work-progress__stop" data-work-index="${index}" role="tab" aria-label="Show ${esc(item.title)}" aria-selected="${index === 0 ? 'true' : 'false'}" tabindex="${index === 0 ? '0' : '-1'}"></button>`).join('')}</div><div class="work-showcase__controls"><button class="work-control" type="button" data-work-prev aria-label="Previous project">${icon('arrow-right.svg')}</button><button class="work-control work-control--next" type="button" data-work-next aria-label="Next project">${icon('arrow-right.svg')}</button></div></div><p class="sr-only" data-work-announcement aria-live="polite">Showing ${esc(project.title)}, project 1 of 4.</p></div></section>`;
}

function capability(iconName, title, description, tags) {
  return `<article class="capability"><div class="capability-icon">${icon(iconName)}</div><h3>${title}</h3><p>${description}</p><div class="tag-list">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div></article>`;
}

function homePage() {
  return `${header()}<main>
    <section class="hero" aria-labelledby="hero-title"><div class="shell hero-content"><div class="hero-copy"><p class="eyebrow">Full-Stack Developer &amp; Digital Product Builder</p><h1 id="hero-title">Abdulrahman<br><span>Al-Mushajari</span></h1><p class="hero-intro">I build practical digital products, dashboards, and SaaS platforms with Arabic-first experiences that solve real problems.</p><div class="hero-actions"><a class="button" href="#projects">View Projects ${icon('arrow-right.svg')}</a><a class="button button-quiet" href="#contact">${icon('mail.svg')} Contact Me</a></div></div><div class="info-strip" aria-label="Professional information"><div class="info-grid"><div class="info-item">${icon('map-pin.svg')}<div><span>Based in</span><strong>Yemen</strong></div></div><div class="info-item">${icon('layers.svg')}<div><span>Available for</span><strong>Freelance Projects</strong></div></div><div class="info-item">${icon('mail.svg')}<div><span>Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></div></div><div class="info-item">${icon('globe.svg')}<div><span>Portfolio</span><a href="${SITE.portfolio}">portofile001.netlify.app</a></div></div></div></div></div></section>
    ${workShowcase()}
    <div class="section-glow-line" aria-hidden="true"></div>
    <section class="section about-section" id="about" aria-labelledby="about-title"><div class="shell about-grid"><div class="about-copy"><p class="eyebrow">About me</p><h2 id="about-title">Building Solutions That Matter</h2><p>I turn complex problems into simple, usable digital products. From idea to deployment, I focus on performance, scalability, and great user experiences.</p><p>I work with modern technologies to build products that help businesses and communities grow.</p><a class="text-link" href="#contact">More about me ${icon('arrow-right.svg')}</a></div><div class="about-image" aria-hidden="true"></div></div></section>
    <section class="section approach-section" id="approach" aria-labelledby="approach-title"><div class="shell"><div class="section-heading"><p class="eyebrow">Development approach</p><h2 id="approach-title">How I build products</h2></div><ol class="approach-list"><li><span>01</span><div><h3>Discover</h3><p>Understand the problem and the people behind it.</p></div></li><li><span>02</span><div><h3>Design</h3><p>Plan the experience and structure.</p></div></li><li><span>03</span><div><h3>Develop</h3><p>Build clean, maintainable systems.</p></div></li><li><span>04</span><div><h3>Validate</h3><p>Test and refine the important details.</p></div></li><li><span>05</span><div><h3>Deploy</h3><p>Release, monitor, and improve.</p></div></li></ol></div></section>
    <section class="section capabilities-section" id="capabilities" aria-labelledby="capabilities-title"><div class="shell"><div class="section-heading"><p class="eyebrow">Technical capabilities</p><h2 id="capabilities-title">Technologies I work with</h2></div><div class="capability-grid">${capability('code.svg', 'Frontend', 'Responsive interfaces, design systems, dashboards, accessibility, and Arabic RTL UX.', ['JavaScript', 'TypeScript', 'React', 'Next.js'])}${capability('cloud.svg', 'Backend', 'APIs, authentication, business logic, validation, and integrations.', ['Node.js', 'Python', 'FastAPI'])}${capability('database.svg', 'Database & Auth', 'Data storage and managed authentication for product foundations.', ['Supabase', 'PostgreSQL'])}${capability('layers.svg', 'DevOps & Tools', 'Reliable deployment and ongoing application operations.', ['Ubuntu', 'Nginx', 'PM2', 'Vercel', 'Render'])}</div></div></section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title"><div class="shell contact-content"><p class="eyebrow">Get in touch</p><h2 id="contact-title">Have a practical product to build?</h2><p>Tell me where you are now and what needs to become clearer, faster, or more useful.</p><div class="contact-actions"><a class="button" href="mailto:${SITE.email}">${icon('mail.svg')} Send an Email</a><a class="button button-quiet" href="${SITE.github}" target="_blank" rel="noopener noreferrer">${icon('github.svg')} GitHub</a></div></div></section>
  </main>${footer()}`;
}

function projectPage(project) {
  if (!project) return `${header()}<main class="not-found section"><div class="shell"><p class="eyebrow">Not found</p><h1>This project page is not available.</h1></div></main>${footer()}`;
  const actions = [project.live && `<a class="button" href="${project.live}" target="_blank" rel="noopener noreferrer">Open live project ${icon('external-link.svg')}</a>`, project.repo && `<a class="button button-quiet" href="${project.repo}" target="_blank" rel="noopener noreferrer">${icon('github.svg')} View repository</a>`].filter(Boolean).join('');
  return `${header()}<main class="project-page"><section class="project-hero"><div class="shell"><a class="breadcrumb" href="/#projects">Portfolio <span>/</span> ${esc(project.title)}</a><div class="project-hero-grid"><div><p class="eyebrow">${esc(project.type)}</p><h1 ${isArabic(project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</h1><p class="project-summary">${esc(project.summary)}</p>${actions ? `<div class="project-actions">${actions}</div>` : ''}</div>${visual(project, true)}</div></div></section><section class="section project-details"><div class="shell details-grid"><div class="detail-main"><section><p class="eyebrow">Overview</p><h2>About the project</h2><p>${esc(project.overview)}</p></section><section><p class="eyebrow">Scope</p><h2>Implemented direction</h2><ul class="feature-list">${project.features.map((item) => `<li>${icon('arrow-right.svg')}${esc(item)}</li>`).join('')}</ul></section><section><p class="eyebrow">Technical thinking</p><h2>Capabilities</h2><ul class="feature-list">${project.capabilities.map((item) => `<li>${icon('arrow-right.svg')}${esc(item)}</li>`).join('')}</ul></section><section><p class="eyebrow">Process</p><h2>Development approach</h2><p>${esc(project.approach)}</p></section><section><p class="eyebrow">Availability</p><h2>Current limitations</h2><p>${esc(project.limitations)}</p></section></div><aside class="project-sidebar"><div><p>Project type</p><strong>${esc(project.type)}</strong></div><div><p>Verified technologies</p><div class="tag-list">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div></div></aside></div></section><section class="project-cta"><div class="shell"><div><p class="eyebrow">Next project</p><h2>Looking for a practical build partner?</h2></div><a class="button" href="mailto:${SITE.email}">${icon('mail.svg')} Start a conversation</a></div></section></main>${footer()}`;
}

function setupNavigation() {
  const button = document.querySelector('.nav-toggle'); const nav = document.querySelector('.site-nav'); if (!button || !nav) return;
  const setOpen = (open) => { document.body.classList.toggle('nav-open', open); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); button.innerHTML = icon(open ? 'close.svg' : 'menu.svg'); };
  button.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open'))); nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false))); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
}

function setupWorkShowcase() {
  const showcase = document.querySelector('[data-work-showcase]');
  if (!showcase) return;

  const content = showcase.querySelector('[data-work-content]');
  const announcement = showcase.querySelector('[data-work-announcement]');
  const stops = [...showcase.querySelectorAll('[data-work-index]')];
  const hoverCapable = window.matchMedia('(hover: hover)');
  let index = 0;
  let timer;
  let transitionTimer;
  let dragging = false;
  let hoverPaused = false;
  let pointerStart;

  const normalize = (value) => (value + WORK_PROJECTS.length) % WORK_PROJECTS.length;
  const canAutoplay = () => !document.hidden && !dragging && !hoverPaused;

  function resetProgress(playing) {
    showcase.classList.remove('is-playing');
    if (playing) {
      void showcase.offsetWidth;
      showcase.classList.add('is-playing');
    }
  }

  function restartAutoplay() {
    window.clearTimeout(timer);
    const shouldPlay = canAutoplay();
    resetProgress(shouldPlay);
    if (shouldPlay) timer = window.setTimeout(() => goTo(index + 1, false), 6000);
  }

  function render(nextIndex) {
    const project = WORK_PROJECTS[nextIndex];
    showcase.dataset.workIndex = String(nextIndex);
    showcase.style.setProperty('--work-index', String(nextIndex));
    content.innerHTML = workSlideContent(project, nextIndex);
    const preview = showcase.querySelector('[data-work-preview]');
    preview.src = WORK_PLACEHOLDER;
    preview.alt = `${project.title} project preview`;
    showcase.querySelector('.laptop-screen__mark').innerHTML = icon(project.icon);
    announcement.textContent = `Showing ${project.title}, project ${nextIndex + 1} of ${WORK_PROJECTS.length}.`;
    stops.forEach((stop, stopIndex) => {
      const active = stopIndex === nextIndex;
      stop.setAttribute('aria-selected', String(active));
      stop.setAttribute('tabindex', active ? '0' : '-1');
    });
  }

  function goTo(nextIndex, manual = true) {
    const target = normalize(nextIndex);
    if (transitionTimer) window.clearTimeout(transitionTimer);
    window.clearTimeout(timer);
    index = target;
    showcase.classList.remove('is-playing');
    showcase.classList.add('is-transitioning');
    render(index);
    transitionTimer = window.setTimeout(() => showcase.classList.remove('is-transitioning'), 760);
    restartAutoplay();
  }

  showcase.querySelector('[data-work-prev]').addEventListener('click', () => goTo(index - 1));
  showcase.querySelector('[data-work-next]').addEventListener('click', () => goTo(index + 1));
  stops.forEach((stop) => stop.addEventListener('click', () => goTo(Number(stop.dataset.workIndex))));

  showcase.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
  });

  showcase.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button > 0) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    dragging = true;
    showcase.setPointerCapture?.(event.pointerId);
    restartAutoplay();
  });
  showcase.addEventListener('pointermove', (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY) && event.cancelable) event.preventDefault();
  });
  const finishDrag = (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    const wasHorizontal = Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY);
    pointerStart = undefined;
    dragging = false;
    if (wasHorizontal) goTo(index + (deltaX < 0 ? 1 : -1));
    else restartAutoplay();
  };
  showcase.addEventListener('pointerup', finishDrag);
  showcase.addEventListener('pointercancel', () => { pointerStart = undefined; dragging = false; restartAutoplay(); });

  showcase.addEventListener('pointerenter', () => { if (hoverCapable.matches) { hoverPaused = true; restartAutoplay(); } });
  showcase.addEventListener('pointerleave', () => { if (hoverCapable.matches) { hoverPaused = false; restartAutoplay(); } });
  document.addEventListener('visibilitychange', () => restartAutoplay());

  render(index);
  restartAutoplay();
}

const app = document.querySelector('#app');
app.innerHTML = document.body.dataset.page === 'project' ? projectPage(bySlug(document.body.dataset.project)) : homePage();
setupNavigation();
hydrateProjectImages();
setupWorkShowcase();
