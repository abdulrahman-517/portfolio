const SITE = {
  name: 'Abdulrahman Al-Mushajari',
  email: 'abdulrahmanalmushajari@gmail.com',
  github: 'https://github.com/abdulrahman-517',
  portfolio: 'https://portofile001.netlify.app/'
};

const FALLBACK_PROJECTS = [
  { slug: 'car-dealership', title: '\u0645\u0639\u0631\u0636 \u0633\u064a\u0627\u0631\u0627\u062a', type: 'Car Dealership Platform', icon: 'car.svg', image: 'car-dealership.png', summary: 'An Arabic-first vehicle dealership experience for presenting inventory, discovery, and direct enquiries.', stack: ['React', 'Next.js', 'Tailwind CSS'], overview: 'A focused product concept for organizing vehicle inventory into a clear customer journey without losing the practical needs of dealership operations.', features: ['Vehicle inventory presentation', 'Search and filtering flows', 'Vehicle detail views', 'Direct enquiry pathways'], capabilities: ['Responsive catalogue patterns', 'Arabic RTL user experience', 'Structured inventory interfaces'], approach: 'Designed around the decisions a buyer needs to make: compare inventory, understand the details, and make contact with confidence.', limitations: 'Public source and live access are not currently published.' },
  { slug: 'vitamin-c-blog', title: 'Vitamin C Blog', type: 'Editorial Content Platform', icon: 'article.svg', image: 'vitamin-c-blog.png', summary: 'A readable editorial experience shaped for structured content, discovery, and long-form browsing.', stack: ['React', 'Next.js', 'Tailwind CSS'], overview: 'A content product direction that prioritizes an intentional reading experience and a sensible structure for articles and categories.', features: ['Article-led publishing layout', 'Content discovery structure', 'Readable long-form presentation'], capabilities: ['Editorial interface systems', 'Accessible reading patterns', 'Responsive layouts'], approach: 'The design begins with clarity: make content easy to scan, easy to read, and easy to return to.', limitations: 'Public source and live access are not currently published.' },
  { slug: 'mowasalatna', title: '\u0645\u0648\u0627\u0635\u0644\u0627\u062a\u0646\u0627', type: 'Route & Trip Status', icon: 'route.svg', image: 'mowasalatna.png', summary: 'A public transport-oriented experience for route discovery and trip-status information.', stack: ['React', 'Node.js', 'PostgreSQL'], overview: 'A service-oriented digital product built to make transportation information more approachable through a direct, Arabic-first interface.', features: ['Route discovery', 'Trip-status information', 'Service-oriented navigation'], capabilities: ['Arabic-first product UX', 'Responsive service design', 'Information hierarchy'], live: 'https://mowasalatna.com/mowasalat', approach: 'The experience keeps essential service information close to the surface, with fewer steps between a traveller and the answer they need.', limitations: 'Implementation details are intentionally kept private.' },
  { slug: 'haraj-al-dhad', title: '\u062d\u0631\u0627\u062c \u0627\u0644\u0636\u0627\u062f', type: 'Local Marketplace', icon: 'shopping-bag.svg', image: 'haraj-al-dhad.png', summary: 'A local marketplace direction centred on browsing, listings, and Arabic community commerce.', stack: ['TypeScript', 'React', 'PostgreSQL'], overview: 'A marketplace product concept that balances discoverability for visitors with clear listing pathways for sellers.', features: ['Listing-oriented browsing', 'Category-led discovery', 'Arabic marketplace flows'], capabilities: ['Marketplace UX', 'Search and browse patterns', 'RTL interface design'], approach: 'The product framing starts with familiar marketplace behaviour and turns it into a calmer, more legible browsing experience.', limitations: 'Public source and live access are not currently published.' },
  { slug: 'q-search', title: 'Q Search', type: 'Search Tool', icon: 'search.svg', image: 'q-search.png', summary: 'An open search project with a public repository available for inspection.', stack: ['Python', 'FastAPI'], overview: 'A public search-oriented project available for inspection through its repository.', features: ['Search workflow', 'Public repository'], capabilities: ['Python services', 'FastAPI', 'Deployment'], repo: 'https://github.com/abdulrahman-517/q-search', approach: 'A compact project that keeps its public surface focused on the core search workflow.', limitations: 'The live demonstration is not currently presented publicly.', visible: false }
];

let PROJECTS = [...FALLBACK_PROJECTS];
let WORK_PROJECTS = FALLBACK_PROJECTS.filter((project) => project.visible !== false);

const icon = (name, className = '') => `<img class="icon ${className}" src="/assets/icons/${name}" alt="" aria-hidden="true">`;
const workArrow = (direction) => `<svg class="work-control__icon" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="${direction === 'previous' ? '15 5L8 12L15 19' : '9 5L16 12L9 19'}" stroke="#F8FDFF" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const esc = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const bySlug = (slug) => PROJECTS.find((project) => project.slug === slug);
const isArabic = (text) => /[\u0600-\u06ff]/.test(text);
const safeUrl = (value) => {
  if (typeof value !== 'string' || !value) return '';
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};
const projectIcon = (project) => {
  const category = `${project.type || ''} ${project.slug || ''}`.toLowerCase();
  if (category.includes('car')) return 'car.svg';
  if (category.includes('route') || category.includes('transport')) return 'route.svg';
  if (category.includes('market')) return 'shopping-bag.svg';
  if (category.includes('search')) return 'search.svg';
  return 'article.svg';
};
const mapManagedProject = (project) => {
  const stack = Array.isArray(project.tech_stack) ? project.tech_stack.filter((tag) => typeof tag === 'string') : [];
  const featuresList = Array.isArray(project.features) ? project.features : [];
  const mainFeatures = Array.isArray(project.main_features) ? project.main_features.filter((item) => typeof item === 'string') : [];
  const gallery = Array.isArray(project.gallery_images) ? project.gallery_images.map(safeUrl).filter(Boolean) : [];
  return {
    slug: project.slug,
    title: project.title_en || project.title_ar || project.slug,
    titleAr: project.title_ar || '',
    category: project.category_en || project.category_ar || '',
    categoryAr: project.category_ar || '',
    icon: projectIcon({ type: project.category_en || project.category_ar, slug: project.slug }),
    summary: project.short_description_en || project.short_description_ar || '',
    overview: project.long_description_en || project.long_description_ar || project.short_description_en || '',
    stack,
    live: safeUrl(project.project_url),
    repo: safeUrl(project.github_url),
    additional: safeUrl(project.additional_url),
    coverImage: safeUrl(project.cover_image_url) || safeUrl(Array.isArray(project.gallery_images) ? project.gallery_images[0] : '') || (gallery.length ? gallery[0] : ''),
    mediaType: ['cover', 'logo', 'screenshot', 'poster'].includes(project.media_type) ? project.media_type : 'cover',
    mediaFit: ['contain', 'cover'].includes(project.media_fit) ? project.media_fit : 'cover',
    mediaScale: Math.min(1.15, Math.max(.4, Number(project.media_scale) || 1)),
    mediaPositionX: ['left', 'center', 'right'].includes(project.media_position_x) ? project.media_position_x : 'center',
    mediaPositionY: ['top', 'center', 'bottom'].includes(project.media_position_y) ? project.media_position_y : 'center',
    angledEdge: project.angled_edge !== false,
    features: featuresList,
    mainFeatures,
    projectType: project.project_type || project.category_en || project.category_ar || '',
    projectRole: project.project_role || '',
    projectYear: project.project_year || '',
    projectDuration: project.project_duration || '',
    projectPlatform: project.project_platform || '',
    projectStatusLabel: project.project_status_label || '',
    gallery,
    galleryCaptions: project.gallery_captions && typeof project.gallery_captions === 'object' ? project.gallery_captions : {},
    challenge: project.challenge_en || project.challenge_ar || '',
    solution: project.solution_en || project.solution_ar || '',
    developmentNotes: project.development_notes_en || project.development_notes_ar || '',
    limitations: project.limitations_en || project.limitations_ar || '',
    nextSteps: project.next_steps_en || project.next_steps_ar || '',
    capabilities: [],
    approach: project.long_description_en || project.long_description_ar || ''
  };
};

async function loadManagedProjects() {
  try {
    const response = await fetch('https://studio.bonyatech.com/api/public/projects', { headers: { Accept: 'application/json' } });
    if (!response.ok) return false;
    const payload = await response.json();
    if (!Array.isArray(payload.projects)) return false;
    PROJECTS = payload.projects.map(mapManagedProject);
    WORK_PROJECTS = [...PROJECTS];
    return true;
  } catch { return false; }
}

const mediaAlignment = (value, axis) => ({ left: 'start', right: 'end', top: 'start', bottom: 'end', center: 'center' }[value] || (axis === 'x' ? 'center' : 'center'));

function projectMedia(project, context) {
  const src = safeUrl(project.coverImage);
  const type = ['cover', 'logo', 'screenshot', 'poster'].includes(project.mediaType) ? project.mediaType : 'cover';
  const detailFit = type === 'logo' ? 'contain' : (type === 'cover' ? 'cover' : (project.mediaFit === 'cover' ? 'cover' : 'contain'));
  const fit = context === 'slider' ? (type === 'logo' ? 'contain' : 'contain') : detailFit;
  const scale = Math.min(1.15, Math.max(.4, Number(project.mediaScale) || (type === 'logo' ? .68 : 1)));
  const x = mediaAlignment(project.mediaPositionX, 'x');
  const y = mediaAlignment(project.mediaPositionY, 'y');
  const style = `--project-media-scale:${scale};--project-media-x:${x};--project-media-y:${y};`;
  const media = src
    ? `<img class="project-media project-media--${type} project-media--${fit}" src="${esc(src)}" alt="${esc(project.title)} project cover" loading="${context === 'detail' ? 'eager' : 'lazy'}">`
    : `<div class="project-media-fallback"><strong ${isArabic(project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</strong><span dir="rtl">لم تتم إضافة صورة للمشروع</span></div>`;
  return `<div class="project-media-surface project-media-surface--${context}" style="${style}">${media}</div>`;
}

function visual(project, detail = false) {
  const context = detail ? 'detail' : 'card';
  return `<div class="project-visual${detail ? ' detail-visual' : ''}" aria-label="${esc(project.title)} project visual">${projectMedia(project, context)}</div>`;
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

function workSlideContent(project, index) {
  const liveAction = project.live ? `<a class="button button-quiet" href="${project.live}" target="_blank" rel="noopener noreferrer">Open live ${icon('external-link.svg')}</a>` : '';
  return `<p class="eyebrow">Selected Work</p><div class="work-showcase__meta"><span>${String(index + 1).padStart(2, '0')}</span><span aria-hidden="true">/</span><span>${String(WORK_PROJECTS.length).padStart(2, '0')}</span></div><p class="work-showcase__type">${esc(project.type)}</p><h3 id="active-work-title" ${isArabic(project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</h3><p class="work-showcase__summary">${esc(project.summary)}</p><div class="tag-list work-showcase__tags">${project.stack.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div><div class="work-showcase__actions"><a class="button" href="/projects/${project.slug}/">View project ${icon('arrow-right.svg')}</a>${liveAction}</div>`;
}

function workLaptop(project) {
  return `<div class="laptop work-showcase__laptop" aria-label="${esc(project.title)} project preview"><div class="laptop__lid"><div class="laptop-screen">${projectMedia(project, 'slider')}</div><span class="laptop__camera" aria-hidden="true"></span></div><div class="laptop__base" aria-hidden="true"></div></div>`;
}

function workShowcase() {
  const project = WORK_PROJECTS[0];
  if (!project) return '';
  const count = WORK_PROJECTS.length;
  return `<section class="work-showcase" id="projects" aria-labelledby="projects-title" tabindex="0" data-work-showcase data-work-index="0"><div class="work-showcase__scene" aria-hidden="true"><div class="work-showcase__backdrop"></div><div class="work-showcase__parallax"></div><div class="work-showcase__haze"></div><div class="work-showcase__particles"></div><div class="work-showcase__vignette"></div><div class="work-showcase__transition"></div></div><div class="shell work-showcase__shell"><div class="work-showcase__layout"><div class="work-showcase__panel"><div class="work-showcase__panel-frost" aria-hidden="true"></div><h2 class="sr-only" id="projects-title">Selected Work</h2><div class="work-showcase__content" data-work-content aria-live="polite">${workSlideContent(project, 0)}</div></div>${workLaptop(project)}</div><div class="work-showcase__bottom"><div class="work-progress" role="tablist" aria-label="Selected work navigation"><div class="work-progress__rail" aria-hidden="true"></div><div class="work-progress__active" aria-hidden="true"><div class="work-progress__elapsed"></div></div>${WORK_PROJECTS.map((item, index) => `<button type="button" class="work-progress__stop" style="left:${count <= 1 ? 0 : (index / (count - 1)) * 100}%" data-work-index="${index}" role="tab" aria-label="Show ${esc(item.title)}" aria-current="${index === 0 ? 'true' : 'false'}" aria-selected="${index === 0 ? 'true' : 'false'}" tabindex="${index === 0 ? '0' : '-1'}"><span class="work-progress__marker-core" aria-hidden="true"></span></button>`).join('')}<output class="work-progress__counter" data-work-counter aria-live="off">01 / ${String(count).padStart(2, '0')}</output></div><div class="work-showcase__controls"><button class="work-control" type="button" data-work-prev aria-label="Previous project" data-no-drag>${workArrow('previous')}</button><button class="work-control work-control--next" type="button" data-work-next aria-label="Next project" data-no-drag>${workArrow('next')}</button></div></div><p class="sr-only" data-work-announcement aria-live="polite">Showing ${esc(project.title)}, project 1 of ${count}.</p></div></section>`;
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
    <section class="section capabilities-section" id="capabilities" aria-labelledby="capabilities-title"><div class="shell"><div class="section-heading"><p class="eyebrow">Technical capabilities</p><h2 id="capabilities-title">Technologies I work with</h2></div><div class="capability-grid">${capability('code.svg', 'Frontend', 'Responsive interfaces, design systems, dashboards, accessibility, and Arabic RTL UX.', ['JavaScript', 'TypeScript', 'React', 'Next.js'])}${capability('cloud.svg', 'Backend', 'APIs, authentication, business logic, validation, and integrations.', ['Node.js', 'Python', 'FastAPI'])}${capability('database.svg', 'Database & Auth', 'Self-hosted PostgreSQL and secure server-side authentication.', ['PostgreSQL', 'Node.js', 'Nginx'])}${capability('layers.svg', 'DevOps & Tools', 'Reliable deployment and ongoing application operations.', ['Ubuntu', 'Nginx', 'PM2', 'Vercel', 'Render'])}</div></div></section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title"><div class="shell contact-content"><p class="eyebrow">Get in touch</p><h2 id="contact-title">Have a practical product to build?</h2><p>Tell me where you are now and what needs to become clearer, faster, or more useful.</p><div class="contact-actions"><a class="button" href="mailto:${SITE.email}">${icon('mail.svg')} Send an Email</a><a class="button button-quiet" href="${SITE.github}" target="_blank" rel="noopener noreferrer">${icon('github.svg')} GitHub</a></div></div></section>
  </main>${footer()}`;
}

function normalizeFeature(item, index) {
  const allowed = ['route','globe','layers','code','database','cloud','map-pin','search','article','chart'];
  if (typeof item === 'string') return { title: item, titleAr: '', description: '', icon: 'layers' };
  if (!item || typeof item !== 'object') return null;
  const title = item.title_en || item.title_ar || '';
  if (!title) return null;
  return {
    title: item.title_en || item.title_ar || '',
    titleAr: item.title_ar || '',
    description: item.description_en || item.description_ar || '',
    descriptionAr: item.description_ar || '',
    icon: allowed.includes(item.icon) ? item.icon : 'layers',
    order: Number.isInteger(Number(item.order)) ? Number(item.order) : index
  };
}

function featureStrip(features) {
  const items = features.map(normalizeFeature).filter(Boolean).sort((a, b) => a.order - b.order).slice(0, 4);
  if (!items.length) return '';
  return `<section class="pd-strip-section" aria-label="Project highlights"><div class="shell pd-shell"><div class="pd-strip">${items.map((item) => `<div class="pd-strip__item"><span class="pd-strip__icon" aria-hidden="true">${icon(item.icon + '.svg')}</span><div><strong ${isArabic(item.titleAr || item.title) ? 'dir="rtl"' : ''}>${esc(item.title)}</strong><span>${esc(item.description)}</span></div></div>`).join('')}</div></div></section>`;
}

function infoCard(project) {
  const rows = [
    project.projectType && { label: 'Project type', value: esc(project.projectType) },
    project.projectRole && { label: 'My role', value: esc(project.projectRole) },
    project.stack.length && { label: 'Technologies', value: `<div class="pd-info-tags">${project.stack.map((tag) => `<span>${esc(tag)}</span>`).join('')}</div>`, raw: true },
    project.projectYear && { label: 'Year', value: esc(project.projectYear) },
    project.projectDuration && { label: 'Duration', value: esc(project.projectDuration) },
    project.projectPlatform && { label: 'Platform', value: esc(project.projectPlatform) },
    project.projectStatusLabel && { label: 'Status', value: esc(project.projectStatusLabel) }
  ].filter(Boolean);
  if (!rows.length) return '';
  return `<aside class="pd-info-card"><div class="pd-info-card__inner">${rows.map((row) => `<div class="pd-info-row"><p>${esc(row.label)}</p>${row.raw ? row.value : `<strong>${row.value}</strong>`}</div>`).join('')}</div></aside>`;
}

function optionalSection(eyebrow, heading, body) {
  if (!body) return '';
  return `<section class="pd-block"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(heading)}</h2><p>${esc(body)}</p></section>`;
}

function projectHeroVisual(project) {
  const angled = project.angledEdge !== false;
  const surface = projectMedia(project, 'detail');
  return `<div class="pd-hero-visual${angled ? ' is-angled' : ''}" aria-label="${esc(project.title)} project visual">${surface}<div class="pd-hero-blend" aria-hidden="true"></div></div>`;
}

function projectPage(project) {
  if (!project) return `${header()}<main class="not-found section"><div class="shell"><p class="eyebrow">Not found</p><h1>This project page is not available.</h1></div></main>${footer()}`;
  const live = project.live ? `<a class="button pd-live" href="${project.live}" target="_blank" rel="noopener noreferrer">Open live project ${icon('external-link.svg')}</a>` : '';
  const repo = project.repo ? `<a class="button button-quiet pd-repo" href="${project.repo}" target="_blank" rel="noopener noreferrer">${icon('github.svg')} View repository</a>` : '';
  const additional = project.additional ? `<a class="button button-quiet pd-extra" href="${project.additional}" target="_blank" rel="noopener noreferrer">${icon('globe.svg')} Additional link</a>` : '';
  const actions = (live || repo || additional) ? `<div class="pd-hero-actions">${live}${additional}${repo}</div>` : '';
  const features = Array.isArray(project.features) ? project.features : [];
  const mainFeatures = Array.isArray(project.mainFeatures) ? project.mainFeatures.filter(Boolean) : [];
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const captions = project.galleryCaptions && typeof project.galleryCaptions === 'object' ? project.galleryCaptions : {};
  const blocks = [
    optionalSection('Challenge', 'The challenge', project.challenge),
    optionalSection('Solution', 'The solution', project.solution),
    mainFeatures.length ? `<section class="pd-block"><p class="eyebrow">Main features</p><h2>What it does</h2><ul class="pd-feature-list">${mainFeatures.map((item) => `<li>${icon('arrow-right.svg')}${esc(item)}</li>`).join('')}</ul></section>` : '',
    gallery.length ? `<section class="pd-block pd-gallery"><p class="eyebrow">Gallery</p><h2>Project gallery</h2><div class="pd-gallery-grid">${gallery.map((src, index) => `<figure><img src="${esc(src)}" alt="${esc(project.title)} gallery image ${index + 1}" loading="lazy">${captions[src] ? `<figcaption>${esc(captions[src])}</figcaption>` : ''}</figure>`).join('')}</div></section>` : '',
    optionalSection('Process', 'Development notes', project.developmentNotes),
    optionalSection('Availability', 'Known limitations', project.limitations),
    optionalSection('Next', 'Next steps', project.nextSteps)
  ].filter(Boolean).join('');
  return `${header()}<main class="project-page pd-page">
    <section class="pd-hero"><div class="shell pd-shell"><a class="breadcrumb" href="/#projects">Portfolio <span>/</span> ${esc(project.title)}</a><div class="pd-hero-grid"><div class="pd-hero-left"><p class="eyebrow pd-category">${esc(project.type)}</p><h1 class="pd-title" ${isArabic(project.titleAr || project.title) ? 'dir="rtl"' : ''}>${esc(project.title)}</h1><p class="pd-summary">${esc(project.summary)}</p>${actions}</div><div class="pd-hero-right">${projectHeroVisual(project)}</div></div></div></section>
    ${featureStrip(features)}
    <section class="pd-overview"><div class="shell pd-shell"><div class="pd-overview-grid"><div class="pd-overview-main"><p class="eyebrow">Overview</p><h2 class="pd-overview-title">About the project</h2><p class="pd-about">${esc(project.overview)}</p></div>${infoCard(project)}</div></div></section>
    <section class="pd-sections"><div class="shell pd-shell">${blocks}</div></section>
    <section class="project-cta"><div class="shell"><div><p class="eyebrow">Next project</p><h2>Looking for a practical build partner?</h2></div><a class="button" href="mailto:${SITE.email}">${icon('mail.svg')} Start a conversation</a></div></section>
  </main>${footer()}`;
}

function setupNavigation() {
  const button = document.querySelector('.nav-toggle'); const nav = document.querySelector('.site-nav'); if (!button || !nav) return;
  const setOpen = (open) => { document.body.classList.toggle('nav-open', open); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); button.innerHTML = icon(open ? 'close.svg' : 'menu.svg'); };
  button.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open'))); nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false))); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
}

function setupWorkShowcase() {
  window.__workShowcaseCleanup?.();
  const showcase = document.querySelector('[data-work-showcase]');
  if (!showcase || !WORK_PROJECTS.length) return;

  const content = showcase.querySelector('[data-work-content]');
  const announcement = showcase.querySelector('[data-work-announcement]');
  const stops = [...showcase.querySelectorAll('[data-work-index]')];
  const activeSegment = showcase.querySelector('.work-progress__active');
  const elapsed = showcase.querySelector('.work-progress__elapsed');
  const counter = showcase.querySelector('[data-work-counter]');
  const hoverCapable = window.matchMedia('(hover: hover)');
  const duration = 6000;
  let index = 0;
  let transitionTimer;
  let animationFrame;
  let lastTimestamp = 0;
  let progress = 0;
  let dragging = false;
  let dragIntent = false;
  let hoverPaused = false;
  let pointerStart;

  const normalize = (value) => (value + WORK_PROJECTS.length) % WORK_PROJECTS.length;
  const canAutoplay = () => !document.hidden && !dragging && !hoverPaused;

  function setProgress(value) {
    progress = Math.max(0, Math.min(1, value));
    elapsed.style.transform = `scaleX(${progress})`;
  }

  function stopAnimation() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
    lastTimestamp = 0;
  }

  function tick(timestamp) {
    if (!canAutoplay()) return stopAnimation();
    if (!lastTimestamp) lastTimestamp = timestamp;
    progress += (timestamp - lastTimestamp) / duration;
    lastTimestamp = timestamp;
    if (progress >= 1) {
      index = normalize(index + 1);
      render(index);
      progress = 0;
      lastTimestamp = timestamp;
    }
    setProgress(progress);
    animationFrame = window.requestAnimationFrame(tick);
  }

  function syncAutoplay(reset = false) {
    stopAnimation();
    if (reset) setProgress(0);
    if (canAutoplay()) animationFrame = window.requestAnimationFrame(tick);
  }

  function render(nextIndex) {
    const project = WORK_PROJECTS[nextIndex];
    showcase.dataset.workIndex = String(nextIndex);
    content.innerHTML = workSlideContent(project, nextIndex);
    showcase.querySelector('.laptop-screen').innerHTML = projectMedia(project, 'slider');
    announcement.textContent = `Showing ${project.title}, project ${nextIndex + 1} of ${WORK_PROJECTS.length}.`;
    activeSegment.style.width = '100%';
    activeSegment.style.transform = 'none';
    counter.value = `${String(nextIndex + 1).padStart(2, '0')} / ${String(WORK_PROJECTS.length).padStart(2, '0')}`;
    counter.textContent = counter.value;
    stops.forEach((stop, stopIndex) => {
      const active = stopIndex === nextIndex;
      stop.setAttribute('aria-selected', String(active));
      stop.setAttribute('aria-current', String(active));
      stop.setAttribute('tabindex', active ? '0' : '-1');
    });
  }

  function goTo(nextIndex) {
    const target = normalize(nextIndex);
    if (transitionTimer) window.clearTimeout(transitionTimer);
    index = target;
    showcase.classList.add('is-transitioning');
    render(index);
    transitionTimer = window.setTimeout(() => showcase.classList.remove('is-transitioning'), 760);
    syncAutoplay(true);
  }

  const onPrevious = (event) => { event.stopPropagation(); goTo(index - 1); };
  const onNext = (event) => { event.stopPropagation(); goTo(index + 1); };
  const onStop = (event) => goTo(Number(event.currentTarget.dataset.workIndex));
  const onKeydown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
  };
  const onPointerDown = (event) => {
    if (!event.isPrimary || event.button > 0) return;
    if (event.target.closest('button, a, input, textarea, select, [role="button"], [data-no-drag]')) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    dragging = false;
    dragIntent = false;
  };
  const onPointerMove = (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (!dragIntent && Math.abs(deltaX) >= 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      dragIntent = true;
      dragging = true;
      showcase.setPointerCapture?.(event.pointerId);
      syncAutoplay();
    }
    if (dragIntent && event.cancelable) event.preventDefault();
  };
  const finishDrag = (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    const wasHorizontal = Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY);
    if (showcase.hasPointerCapture?.(pointerStart.id)) showcase.releasePointerCapture(pointerStart.id);
    pointerStart = undefined;
    dragging = false;
    dragIntent = false;
    if (wasHorizontal) goTo(index + (deltaX < 0 ? 1 : -1));
    else syncAutoplay();
  };
  const onPointerCancel = () => { pointerStart = undefined; dragging = false; dragIntent = false; syncAutoplay(); };
  const onEnter = () => { if (hoverCapable.matches) { hoverPaused = true; syncAutoplay(); } };
  const onLeave = () => { if (hoverCapable.matches) { hoverPaused = false; syncAutoplay(); } };
  const onVisibility = () => syncAutoplay();

  const previousControl = showcase.querySelector('[data-work-prev]');
  const nextControl = showcase.querySelector('[data-work-next]');
  previousControl.addEventListener('click', onPrevious);
  nextControl.addEventListener('click', onNext);
  stops.forEach((stop) => stop.addEventListener('click', onStop));
  showcase.addEventListener('keydown', onKeydown);
  showcase.addEventListener('pointerdown', onPointerDown);
  showcase.addEventListener('pointermove', onPointerMove);
  showcase.addEventListener('pointerup', finishDrag);
  showcase.addEventListener('pointercancel', onPointerCancel);
  showcase.addEventListener('lostpointercapture', onPointerCancel);
  showcase.addEventListener('pointerenter', onEnter);
  showcase.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  window.__workShowcaseCleanup = () => {
    stopAnimation();
    window.clearTimeout(transitionTimer);
    previousControl.removeEventListener('click', onPrevious);
    nextControl.removeEventListener('click', onNext);
    stops.forEach((stop) => stop.removeEventListener('click', onStop));
    showcase.removeEventListener('keydown', onKeydown);
    showcase.removeEventListener('pointerdown', onPointerDown);
    showcase.removeEventListener('pointermove', onPointerMove);
    showcase.removeEventListener('pointerup', finishDrag);
    showcase.removeEventListener('pointercancel', onPointerCancel);
    showcase.removeEventListener('lostpointercapture', onPointerCancel);
    showcase.removeEventListener('pointerenter', onEnter);
    showcase.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
  };

  render(index);
  syncAutoplay(true);
}

const app = document.querySelector('#app');
function renderCurrentPage() {
  app.innerHTML = document.body.dataset.page === 'project' ? projectPage(bySlug(document.body.dataset.project)) : homePage();
  setupNavigation();
  hydrateProjectImages();
  setupWorkShowcase();
}

renderCurrentPage();
loadManagedProjects().then((loaded) => { if (loaded) renderCurrentPage(); });
