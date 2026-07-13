const SITE = {
  name: 'Abdulrahman Al-Mushajari',
  email: 'abdulrahmanalmushajari@gmail.com',
  github: 'https://github.com/abdulrahman-517',
  portfolio: 'https://portofile001.netlify.app/'
};

const PROJECTS = [
  {
    slug: 'car-dealership',
    title: 'معرض سيارات',
    type: 'Car Dealership Platform',
    icon: 'car.svg',
    image: 'car-dealership.png',
    summary: 'An Arabic-first vehicle dealership experience for presenting inventory, discovery, and direct enquiries.',
    overview: 'A focused product concept for organizing vehicle inventory into a clear customer journey without losing the practical needs of dealership operations.',
    features: ['Vehicle inventory presentation', 'Search and filtering flows', 'Vehicle detail views', 'Direct enquiry pathways'],
    capabilities: ['Responsive catalogue patterns', 'Arabic RTL user experience', 'Structured inventory interfaces', 'Clear conversion paths'],
    stack: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
    approach: 'Designed around the decisions a buyer needs to make: compare inventory, understand the details, and make contact with confidence.',
    limitations: 'Public source and live access are not currently published.'
  },
  {
    slug: 'vitamin-c-blog',
    title: 'Vitamin C Blog',
    type: 'Editorial Content Platform',
    icon: 'article.svg',
    image: 'vitamin-c-blog.png',
    summary: 'A readable editorial experience shaped for structured content, discovery, and long-form browsing.',
    overview: 'A content product direction that prioritizes an intentional reading experience and a sensible structure for articles and categories.',
    features: ['Article-led publishing layout', 'Content discovery structure', 'Readable long-form presentation', 'Responsive content hierarchy'],
    capabilities: ['Editorial interface systems', 'Accessible reading patterns', 'Responsive layouts', 'Content-focused navigation'],
    stack: ['JavaScript', 'React', 'Next.js', 'Tailwind CSS'],
    approach: 'The design begins with clarity: make content easy to scan, easy to read, and easy to return to.',
    limitations: 'Public source and live access are not currently published.'
  },
  {
    slug: 'mowasalatna',
    title: 'مواصلاتنا',
    type: 'Route & Trip Status',
    icon: 'route.svg',
    image: 'mowasalatna.png',
    summary: 'A public transport-oriented experience for route discovery and trip-status information.',
    overview: 'A service-oriented digital product built to make transportation information more approachable through a direct, Arabic-first interface.',
    features: ['Route discovery', 'Trip-status information', 'Service-oriented navigation', 'Mobile-aware access'],
    capabilities: ['Arabic-first product UX', 'Responsive service design', 'Information hierarchy', 'Practical public-facing flows'],
    stack: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    live: 'https://mowasalatna.com/mowasalat',
    approach: 'The experience keeps essential service information close to the surface, with fewer steps between a traveller and the answer they need.',
    limitations: 'Implementation details are intentionally kept private.'
  },
  {
    slug: 'haraj-al-dhad',
    title: 'حراج الضاد',
    type: 'Local Marketplace',
    icon: 'shopping-bag.svg',
    image: 'haraj-al-dhad.png',
    summary: 'A local marketplace direction centred on browsing, listings, and Arabic community commerce.',
    overview: 'A marketplace product concept that balances discoverability for visitors with clear listing pathways for sellers.',
    features: ['Listing-oriented browsing', 'Category-led discovery', 'Arabic marketplace flows', 'Responsive product views'],
    capabilities: ['Marketplace UX', 'Search and browse patterns', 'RTL interface design', 'Product-focused information architecture'],
    stack: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    approach: 'The product framing starts with familiar marketplace behaviour and turns it into a calmer, more legible browsing experience.',
    limitations: 'Public source and live access are not currently published.'
  },
  {
    slug: 'q-search',
    title: 'Q Search',
    type: 'Search Tool',
    icon: 'search.svg',
    image: 'q-search.png',
    summary: 'An open search project with a public repository and live demonstration.',
    overview: 'A public search-oriented project available for inspection through its repository and demonstration.',
    features: ['Search workflow', 'Public repository', 'Live demonstration'],
    capabilities: ['Python services', 'FastAPI', 'Search-oriented product flows', 'Deployment'],
    stack: ['Python', 'FastAPI'],
    repo: 'https://github.com/abdulrahman-517/q-search',
    live: 'https://q-search-77si.onrender.com',
    approach: 'A compact project that keeps its public surface focused on the core search workflow.',
    limitations: 'The public demonstration represents the currently available scope.'
  }
];

const icon = (name, className = '') => `<img class="icon ${className}" src="/assets/icons/${name}" alt="" aria-hidden="true">`;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const projectBySlug = (slug) => PROJECTS.find((project) => project.slug === slug);

function projectVisual(project, variant = '') {
  return `<div class="project-visual ${variant}" data-project-image="${project.image}" aria-label="${escapeHtml(project.title)} project visual">
    <div class="project-placeholder">
      <img src="/assets/icons/${project.icon}" alt="" aria-hidden="true">
      <span>${escapeHtml(project.title)}</span>
    </div>
  </div>`;
}

function hydrateProjectImages() {
  document.querySelectorAll('[data-project-image]').forEach((container) => {
    const image = new Image();
    image.src = `/assets/projects/${container.dataset.projectImage}`;
    image.alt = container.getAttribute('aria-label') || '';
    image.onload = () => {
      container.replaceChildren(image);
      container.classList.add('has-project-image');
    };
  });
}

function header() {
  return `<header class="site-header" id="top">
    <div class="shell nav-shell">
      <a class="brand" href="/" aria-label="${SITE.name} home">
        <img class="brand-lockup" src="/assets/brand/am-lockup.svg" alt="Abdulrahman Al-Mushajari">
        <img class="brand-mark" src="/assets/brand/am-mark.svg" alt="">
      </a>
      <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-navigation">
        <img src="/assets/icons/menu.svg" alt="" aria-hidden="true">
      </button>
      <nav class="site-nav" id="site-navigation" aria-label="Primary navigation">
        <a href="/#projects">Projects</a>
        <a href="/#about">About</a>
        <a href="/#capabilities">Capabilities</a>
        <a href="/#contact">Contact</a>
        <a class="button button-small" href="/#contact">Get in touch ${icon('arrow-right.svg')}</a>
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="shell footer-inner">
      <a class="footer-brand" href="/" aria-label="${SITE.name} home"><img src="/assets/brand/am-lockup.svg" alt="Abdulrahman Al-Mushajari"></a>
      <p>Building practical digital products with care and clarity.</p>
      <div class="footer-links">
        <a href="${SITE.github}" aria-label="GitHub" target="_blank" rel="noreferrer">${icon('github.svg')}</a>
        <a href="mailto:${SITE.email}" aria-label="Email">${icon('mail.svg')}</a>
      </div>
    </div>
  </footer>`;
}

function projectCard(project) {
  return `<article class="project-card">
    ${projectVisual(project)}
    <div class="project-card-body">
      <div class="project-card-title">
        <span class="project-icon">${icon(project.icon)}</span>
        <div><p class="project-type">${escapeHtml(project.type)}</p><h3 ${/[؀-ۿ]/.test(project.title) ? 'dir="rtl"' : ''}>${escapeHtml(project.title)}</h3></div>
      </div>
      <p>${escapeHtml(project.summary)}</p>
      <a class="text-link" href="/projects/${project.slug}/">Explore project ${icon('arrow-right.svg')}</a>
    </div>
  </article>`;
}

function homePage() {
  const mainProjects = PROJECTS.slice(0, 4);
  return `${header()}<main>
    <section class="hero section" aria-labelledby="hero-title">
      <div class="hero-stars" aria-hidden="true"></div>
      <div class="shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Full-Stack Developer &amp; Digital Product Builder</p>
          <h1 id="hero-title">Abdulrahman<br><span>Al-Mushajari</span></h1>
          <p class="hero-intro">I build practical digital products, dashboards, and Arabic-first experiences that turn complex work into clear, useful interfaces.</p>
          <div class="hero-actions"><a class="button" href="#projects">View projects ${icon('arrow-right.svg')}</a><a class="button button-quiet" href="#contact">${icon('mail.svg')} Contact me</a></div>
          <div class="hero-social" aria-label="Contact links"><a href="${SITE.github}" target="_blank" rel="noreferrer">${icon('github.svg')} GitHub</a><a href="mailto:${SITE.email}">${icon('mail.svg')} Email</a><a href="${SITE.portfolio}">${icon('globe.svg')} Portfolio</a></div>
        </div>
        <picture class="hero-image" aria-hidden="true"><source media="(max-width: 700px)" srcset="/assets/backgrounds/hero-iceberg-mobile.png"><img src="/assets/backgrounds/hero-iceberg-desktop.png" alt=""></picture>
      </div>
    </section>
    <section class="info-strip" aria-label="Professional information"><div class="shell info-grid">
      <div class="info-item">${icon('map-pin.svg')}<div><span>Based in</span><strong>Yemen</strong></div></div>
      <div class="info-item">${icon('layers.svg')}<div><span>Availability</span><strong>Freelance</strong></div></div>
      <div class="info-item">${icon('mail.svg')}<div><span>Email</span><a href="mailto:${SITE.email}">${SITE.email}</a></div></div>
      <div class="info-item">${icon('globe.svg')}<div><span>Portfolio</span><a href="${SITE.portfolio}">portofile001.netlify.app</a></div></div>
    </div></section>
    <section class="section projects-section" id="projects" aria-labelledby="projects-title"><div class="shell">
      <div class="section-heading"><p class="eyebrow">Selected work</p><h2 id="projects-title">Featured projects</h2><p>Four product directions shaped around practical user journeys and clear systems.</p></div>
      <div class="project-grid">${mainProjects.map(projectCard).join('')}</div>
      <div class="additional-project"><span>${icon('search.svg')}</span><div><p class="eyebrow">Also public</p><h3>Q Search</h3><p>A public search project with a repository and live demonstration.</p></div><a class="text-link" href="/projects/q-search/">View project ${icon('arrow-right.svg')}</a></div>
    </div></section>
    <div class="iceberg-divider" aria-hidden="true"></div>
    <section class="section about-section" id="about" aria-labelledby="about-title"><div class="shell about-grid">
      <div class="about-image"><img src="/assets/backgrounds/about-iceberg-depth.png" alt="Iceberg depth illustration"></div>
      <div class="about-copy"><p class="eyebrow">About</p><h2 id="about-title">Product thinking, grounded in implementation.</h2><p>I work across the product surface: from the interface people use to the APIs, data, and deployment practices that make it reliable.</p><p>My focus is on clear systems, responsive interfaces, and Arabic-first experiences that stay useful when a product grows beyond its first release.</p><a class="text-link" href="#contact">Start a conversation ${icon('arrow-right.svg')}</a></div>
    </div></section>
    <section class="section approach-section" aria-labelledby="approach-title"><div class="shell"><div class="section-heading"><p class="eyebrow">Working method</p><h2 id="approach-title">Development approach</h2></div><ol class="approach-list">
      <li><span>01</span><h3>Discover</h3><p>Clarify the problem, audience, and constraints.</p></li><li><span>02</span><h3>Design</h3><p>Shape the information and interaction model.</p></li><li><span>03</span><h3>Develop</h3><p>Build the product with maintainable systems.</p></li><li><span>04</span><h3>Validate</h3><p>Refine details against real use and feedback.</p></li><li><span>05</span><h3>Deploy</h3><p>Release with practical operational foundations.</p></li>
    </ol></div></section>
    <section class="section capabilities-section" id="capabilities" aria-labelledby="capabilities-title"><div class="shell"><div class="section-heading"><p class="eyebrow">Technical capabilities</p><h2 id="capabilities-title">A practical full-stack toolkit</h2></div><div class="capability-grid">
      ${capability('code.svg', 'Frontend', 'Responsive interfaces, design systems, dashboards, accessibility, and Arabic RTL UX.', ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS'])}
      ${capability('database.svg', 'Backend', 'APIs, authentication, business logic, data validation, and third-party integrations.', ['Node.js', 'Python', 'FastAPI', 'Supabase', 'PostgreSQL'])}
      ${capability('layers.svg', 'Product systems', 'SaaS products, PWAs, marketplaces, and user flows that work as a complete system.', ['SaaS', 'PWAs', 'Marketplaces', 'Arabic RTL UX'])}
      ${capability('cloud.svg', 'Deployment & Ops', 'Practical delivery foundations for reliable applications and ongoing iteration.', ['Ubuntu', 'Nginx', 'PM2', 'Vercel', 'Render'])}
    </div></div></section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title"><div class="contact-background" aria-hidden="true"></div><div class="shell contact-content"><p class="eyebrow">Get in touch</p><h2 id="contact-title">Have a practical product to build?</h2><p>Tell me where you are now and what needs to become clearer, faster, or more useful.</p><div class="contact-actions"><a class="button" href="mailto:${SITE.email}">${icon('mail.svg')} Email Abdulrahman</a><a class="button button-quiet" href="${SITE.github}" target="_blank" rel="noreferrer">${icon('github.svg')} GitHub</a></div></div></section>
  </main>${footer()}`;
}

function capability(iconName, title, description, tags) {
  return `<article class="capability"><div class="capability-icon">${icon(iconName)}</div><h3>${title}</h3><p>${description}</p><div class="tag-list">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div></article>`;
}

function projectPage(project) {
  if (!project) return notFoundPage();
  const buttons = [project.live && `<a class="button" href="${project.live}" target="_blank" rel="noreferrer">Open live project ${icon('external-link.svg')}</a>`, project.repo && `<a class="button button-quiet" href="${project.repo}" target="_blank" rel="noreferrer">${icon('github.svg')} View repository</a>`].filter(Boolean).join('');
  return `${header()}<main class="project-page"><section class="project-hero section"><div class="shell"><a class="breadcrumb" href="/#projects">Portfolio <span>/</span> ${escapeHtml(project.title)}</a><div class="project-hero-grid"><div><p class="eyebrow">${escapeHtml(project.type)}</p><h1 ${/[\u0600-\u06ff]/.test(project.title) ? 'dir="rtl"' : ''}>${escapeHtml(project.title)}</h1><p class="project-summary">${escapeHtml(project.summary)}</p>${buttons ? `<div class="project-actions">${buttons}</div>` : ''}</div>${projectVisual(project, 'detail-visual')}</div></div></section>
    <section class="section project-details"><div class="shell details-grid"><div class="detail-main"><section><p class="eyebrow">Overview</p><h2>About the project</h2><p>${escapeHtml(project.overview)}</p></section><section><p class="eyebrow">Scope</p><h2>Implemented direction</h2><ul class="feature-list">${project.features.map((feature) => `<li>${icon('arrow-right.svg')}${escapeHtml(feature)}</li>`).join('')}</ul></section><section><p class="eyebrow">Technical thinking</p><h2>Capabilities</h2><ul class="feature-list">${project.capabilities.map((item) => `<li>${icon('arrow-right.svg')}${escapeHtml(item)}</li>`).join('')}</ul></section><section><p class="eyebrow">Process</p><h2>Development approach</h2><p>${escapeHtml(project.approach)}</p></section><section><p class="eyebrow">Availability</p><h2>Current limitations</h2><p>${escapeHtml(project.limitations)}</p></section></div><aside class="project-sidebar"><div><p>Project type</p><strong>${escapeHtml(project.type)}</strong></div><div><p>Verified technologies</p><div class="tag-list">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div></div></aside></div></section>
    <section class="project-cta"><div class="shell"><div><p class="eyebrow">Next project</p><h2>Looking for a practical build partner?</h2></div><a class="button" href="mailto:${SITE.email}">${icon('mail.svg')} Start a conversation</a></div></section>
  </main>${footer()}`;
}

function notFoundPage() { return `${header()}<main class="not-found section"><div class="shell"><p class="eyebrow">Not found</p><h1>This project page is not available.</h1><a class="button" href="/#projects">Back to projects ${icon('arrow-right.svg')}</a></div></main>${footer()}`; }

function setupNavigation() {
  const button = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!button || !nav) return;
  const setOpen = (isOpen) => {
    document.body.classList.toggle('nav-open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    button.querySelector('img').src = isOpen ? '/assets/icons/close.svg' : '/assets/icons/menu.svg';
  };
  button.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
}

function init() {
  const app = document.querySelector('#app');
  const page = document.body.dataset.page;
  app.innerHTML = page === 'project' ? projectPage(projectBySlug(document.body.dataset.project)) : homePage();
  setupNavigation();
  hydrateProjectImages();
}

init();
