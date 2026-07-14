import { getSupabaseClient } from '/supabase-client.js?v=20260715';

const ADMIN_EMAIL = 'abdulrahmanalmushajari@gmail.com';
const app = document.querySelector('#studio-app');
let supabase = null;
let projects = [];
let formDirty = false;

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDate = (value) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : 'Not published';
const isSafeUrl = (value) => {
  if (!value) return true;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
};
const isAdmin = (user) => user?.email?.toLowerCase() === ADMIN_EMAIL;
const currentPath = () => window.location.pathname.replace(/\/$/, '');
const setRoute = (route) => { window.location.assign(route); };

function notice(message = '', tone = 'info') {
  const element = document.querySelector('[data-studio-notice]');
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
  element.classList.toggle('is-visible', Boolean(message));
}

function shell(title, subtitle, content, active = '') {
  app.innerHTML = `<div class="studio-shell"><aside class="studio-sidebar"><a class="studio-brand" href="/studio/">Portfolio Studio</a><nav class="studio-nav" aria-label="Studio navigation"><a href="/studio/" ${active === 'overview' ? 'aria-current="page"' : ''}>Overview</a><a href="/studio/projects/" ${active === 'projects' ? 'aria-current="page"' : ''}>Projects</a><a href="/studio/projects/new" ${active === 'new' ? 'aria-current="page"' : ''}>Add project</a><a href="/studio/projects/?view=media" ${active === 'media' ? 'aria-current="page"' : ''}>Media</a><span class="studio-nav__spacer"></span><a href="/" target="_blank" rel="noopener noreferrer">View portfolio</a><button type="button" class="studio-nav__signout" data-sign-out>Sign out</button></nav></aside><main class="studio-main"><header class="studio-topbar"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div></header><div class="studio-notice" data-studio-notice role="status" aria-live="polite"></div>${content}</main></div>`;
  document.querySelector('[data-sign-out]')?.addEventListener('click', signOut);
}

async function signOut() {
  await supabase.auth.signOut();
  setRoute('/studio/login/');
}

function loginPage(configured) {
  app.innerHTML = `<main class="studio-login"><span class="studio-login__brand">Portfolio Studio</span><h1>Owner access</h1><p>${configured ? 'Sign in with the approved owner account to manage projects and media.' : 'Studio needs Supabase configuration before it can be used.'}</p>${configured ? `<form class="studio-card studio-form" data-login-form><div class="studio-field"><label for="studio-email">Email</label><input class="studio-input" id="studio-email" type="email" value="${ADMIN_EMAIL}" autocomplete="email" required></div><div class="studio-field"><label for="studio-password">Password</label><input class="studio-input" id="studio-password" type="password" autocomplete="current-password" required></div><button class="studio-button" type="submit">Sign in</button><div class="studio-notice" data-studio-notice role="status" aria-live="polite"></div></form>` : ''}</main>`;
  document.querySelector('[data-login-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#studio-email').value.trim().toLowerCase();
    const password = document.querySelector('#studio-password').value;
    if (email !== ADMIN_EMAIL) return notice('This account is not approved for Portfolio Studio.', 'error');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return notice(error.message, 'error');
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdmin(user)) { await supabase.auth.signOut(); return notice('This account is not approved for Portfolio Studio.', 'error'); }
    setRoute('/studio/');
  });
}

async function loadProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  projects = data || [];
}

function stat(label, value) { return `<article class="studio-card studio-stat"><span>${esc(label)}</span><strong>${value}</strong></article>`; }

function renderOverview() {
  const published = projects.filter((project) => project.status === 'published').length;
  const drafts = projects.filter((project) => project.status === 'draft').length;
  const hidden = projects.filter((project) => !project.visible).length;
  const recent = [...projects].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6);
  shell('Overview', 'A concise view of your portfolio content.', `<section class="studio-stats">${stat('Total projects', projects.length)}${stat('Published', published)}${stat('Drafts', drafts)}${stat('Hidden', hidden)}</section><section class="studio-card studio-list"><div class="studio-list__heading">Recently updated</div><div class="studio-recent">${recent.length ? recent.map((project) => `<a href="/studio/projects/${project.id}"><strong>${esc(project.title_en || project.title_ar || project.slug)}</strong><span>${formatDate(project.updated_at)}</span></a>`).join('') : '<p class="studio-help">No projects yet.</p>'}</div></section><div class="studio-actions" style="margin-top:20px"><a class="studio-button" href="/studio/projects/new">Add project</a><a class="studio-button studio-button--quiet" href="/" target="_blank" rel="noopener noreferrer">View live portfolio</a></div>`, 'overview');
}

function signedImage(path, target) {
  if (!path || !target) return;
  supabase.storage.from('project-media').createSignedUrl(path, 3600).then(({ data }) => {
    if (data?.signedUrl && target.isConnected) target.src = data.signedUrl;
  });
}

function projectImage(project) {
  return project.cover_image_url ? `<img src="${esc(project.cover_image_url)}" alt="">` : `<span>${esc((project.title_en || project.title_ar || '?').slice(0, 2))}</span>`;
}

function projectRows(list) {
  return list.map((project) => `<tr draggable="true" data-project-row="${project.id}"><td><div class="studio-thumb">${projectImage(project)}</div></td><td><strong>${esc(project.title_en || project.title_ar || project.slug)}</strong><br><span class="studio-help">${esc(project.slug)}</span></td><td><span class="studio-badge studio-badge--${project.status}">${esc(project.status)}</span></td><td>${project.visible ? 'Visible' : 'Hidden'}</td><td>${project.featured ? 'Featured' : '-'}</td><td>${project.sort_order}</td><td>${formatDate(project.updated_at)}</td><td><div class="studio-row-actions"><a class="studio-icon-button" href="/studio/projects/${project.id}" aria-label="Edit ${esc(project.title_en || project.slug)}">Edit</a><button class="studio-icon-button" type="button" data-preview="${project.id}" aria-label="Preview ${esc(project.title_en || project.slug)}">View</button><button class="studio-icon-button" type="button" data-publish="${project.id}" aria-label="${project.status === 'published' ? 'Unpublish' : 'Publish'} ${esc(project.title_en || project.slug)}">${project.status === 'published' ? 'Hide' : 'Pub'}</button><button class="studio-icon-button" type="button" data-move="up:${project.id}" aria-label="Move up">Up</button><button class="studio-icon-button" type="button" data-move="down:${project.id}" aria-label="Move down">Down</button><button class="studio-icon-button studio-icon-button--danger" type="button" data-archive="${project.id}" aria-label="Archive ${esc(project.title_en || project.slug)}">Arc</button></div></td></tr>`).join('');
}

function renderProjects() {
  const mediaView = new URLSearchParams(location.search).get('view') === 'media';
  const content = mediaView ? renderMediaLibrary() : `<div class="studio-toolbar"><input class="studio-input studio-input--search" data-project-search type="search" placeholder="Search projects"><select class="studio-select" data-project-filter><option value="all">All projects</option><option value="published">Published</option><option value="draft">Drafts</option><option value="hidden">Hidden</option><option value="development">Development</option><option value="archived">Archived</option></select><a class="studio-button" href="/studio/projects/new">Add project</a></div><section class="studio-card studio-table-wrap"><table class="studio-table"><thead><tr><th>Cover</th><th>Project</th><th>Status</th><th>Visibility</th><th>Featured</th><th>Order</th><th>Updated</th><th>Actions</th></tr></thead><tbody data-project-rows>${projectRows(projects)}</tbody></table></section><dialog data-archive-dialog></dialog>`;
  shell(mediaView ? 'Media' : 'Projects', mediaView ? 'Images stored in the private project media bucket.' : 'Publish, hide, reorder, preview, and archive portfolio work.', content, mediaView ? 'media' : 'projects');
  if (mediaView) return;
  const search = document.querySelector('[data-project-search]');
  const filter = document.querySelector('[data-project-filter]');
  const refreshRows = () => {
    const term = search.value.trim().toLowerCase();
    const status = filter.value;
    const list = projects.filter((project) => {
      const name = `${project.title_en} ${project.title_ar} ${project.slug}`.toLowerCase();
      return (!term || name.includes(term)) && (status === 'all' || (status === 'hidden' ? !project.visible : project.status === status));
    });
    document.querySelector('[data-project-rows]').innerHTML = projectRows(list);
    bindProjectActions();
  };
  search.addEventListener('input', refreshRows);
  filter.addEventListener('change', refreshRows);
  bindProjectActions();
}

function renderMediaLibrary() {
  const cards = projects.filter((project) => project.cover_image_path || project.cover_image_url).map((project) => `<article class="studio-media-card">${project.cover_image_url ? `<img src="${esc(project.cover_image_url)}" alt="${esc(project.title_en || project.slug)}">` : `<span>${esc(project.title_en || project.slug)}</span>`}<a class="studio-icon-button" href="/studio/projects/${project.id}" aria-label="Edit ${esc(project.title_en || project.slug)}">Edit</a></article>`).join('');
  return `<section class="studio-media">${cards || '<p class="studio-help">Upload cover images from each project editor.</p>'}</section>`;
}

function bindProjectActions() {
  document.querySelectorAll('[data-preview]').forEach((button) => button.addEventListener('click', () => setRoute(`/studio/projects/${button.dataset.preview}?preview=1`)));
  document.querySelectorAll('[data-publish]').forEach((button) => button.addEventListener('click', () => togglePublished(button.dataset.publish)));
  document.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => { const [direction, id] = button.dataset.move.split(':'); moveProject(id, direction); }));
  document.querySelectorAll('[data-archive]').forEach((button) => button.addEventListener('click', () => confirmArchive(button.dataset.archive)));
  document.querySelectorAll('[data-project-row]').forEach((row) => {
    row.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', row.dataset.projectRow));
    row.addEventListener('dragover', (event) => event.preventDefault());
    row.addEventListener('drop', (event) => { event.preventDefault(); reorderProject(event.dataTransfer.getData('text/plain'), row.dataset.projectRow); });
  });
}

async function togglePublished(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;
  const status = project.status === 'published' ? 'draft' : 'published';
  const { error } = await supabase.from('projects').update({ status, published_at: status === 'published' ? new Date().toISOString() : project.published_at }).eq('id', id);
  if (error) return notice(error.message, 'error');
  await refreshRoute('Project status updated.');
}

async function persistOrdering(next) {
  const updates = next.map((project, index) => supabase.from('projects').update({ sort_order: index + 1 }).eq('id', project.id));
  const results = await Promise.all(updates);
  const failure = results.find((result) => result.error)?.error;
  if (failure) return notice(failure.message, 'error');
  await refreshRoute('Project order saved.');
}

function moveProject(id, direction) {
  const index = projects.findIndex((project) => project.id === id);
  const target = index + (direction === 'up' ? -1 : 1);
  if (index < 0 || target < 0 || target >= projects.length) return;
  const next = [...projects];
  [next[index], next[target]] = [next[target], next[index]];
  persistOrdering(next);
}

function reorderProject(sourceId, targetId) {
  if (!sourceId || sourceId === targetId) return;
  const next = [...projects];
  const source = next.findIndex((project) => project.id === sourceId);
  const target = next.findIndex((project) => project.id === targetId);
  if (source < 0 || target < 0) return;
  next.splice(target, 0, next.splice(source, 1)[0]);
  persistOrdering(next);
}

function confirmArchive(id) {
  const project = projects.find((item) => item.id === id);
  const dialog = document.querySelector('[data-archive-dialog]');
  dialog.innerHTML = `<form method="dialog" class="studio-dialog"><h2>Archive project?</h2><p><strong>${esc(project?.title_en || project?.title_ar || project?.slug || '')}</strong> will be removed from public publishing and retained safely in Portfolio Studio.</p><div class="studio-dialog__actions"><button class="studio-button studio-button--quiet" value="cancel">Cancel</button><button class="studio-button studio-button--danger" value="archive">Archive project</button></div></form>`;
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'archive') return;
    const { error } = await supabase.from('projects').update({ status: 'archived', visible: false }).eq('id', id);
    if (error) return notice(error.message, 'error');
    await refreshRoute('Project archived.');
  }, { once: true });
  dialog.showModal();
}

const blankProject = () => ({ title_en: '', title_ar: '', slug: '', category_en: '', category_ar: '', short_description_en: '', short_description_ar: '', long_description_en: '', long_description_ar: '', tech_stack: [], project_url: '', github_url: '', status: 'draft', visible: true, featured: false, sort_order: projects.length + 1, gallery_images: [] });

function field(name, label, value, options = {}) {
  const type = options.type || 'text';
  const required = options.required ? '<span aria-hidden="true">*</span>' : '';
  const wide = options.wide ? ' studio-field--wide' : '';
  const input = type === 'textarea' ? `<textarea class="studio-textarea" id="${name}" name="${name}" ${options.required ? 'required' : ''}>${esc(value || '')}</textarea>` : `<input class="studio-input" id="${name}" name="${name}" type="${type}" value="${esc(value || '')}" ${options.required ? 'required' : ''}>`;
  return `<div class="studio-field${wide}"><label for="${name}">${esc(label)} ${required}</label>${input}${options.help ? `<p class="studio-help">${esc(options.help)}</p>` : ''}</div>`;
}

function projectForm(project) {
  return `<form class="studio-card studio-form" data-project-form novalidate><div class="studio-form-grid">${field('title_en', 'English title', project.title_en, { required: true })}${field('title_ar', 'Arabic title', project.title_ar, { required: true })}${field('slug', 'Slug', project.slug, { required: true, help: 'Lowercase letters, numbers, and hyphens only.' })}${field('sort_order', 'Sort order', project.sort_order, { type: 'number', required: true })}${field('category_en', 'English category', project.category_en, { required: true })}${field('category_ar', 'Arabic category', project.category_ar, { required: true })}${field('short_description_en', 'English short description', project.short_description_en, { type: 'textarea', required: true, wide: true })}${field('short_description_ar', 'Arabic short description', project.short_description_ar, { type: 'textarea', required: true, wide: true })}${field('long_description_en', 'English detailed description', project.long_description_en, { type: 'textarea', wide: true })}${field('long_description_ar', 'Arabic detailed description', project.long_description_ar, { type: 'textarea', wide: true })}${field('tech_stack', 'Technology list', (project.tech_stack || []).join(', '), { wide: true, help: 'Separate technologies with commas.' })}${field('project_url', 'Live project URL', project.project_url, { type: 'url' })}${field('github_url', 'GitHub URL', project.github_url, { type: 'url' })}<div class="studio-field"><label for="status">Status</label><select class="studio-select" id="status" name="status">${['draft', 'published', 'private', 'development', 'archived'].map((status) => `<option value="${status}" ${project.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></div><div class="studio-field"><label>Publishing</label><label class="studio-switch"><input name="visible" type="checkbox" ${project.visible ? 'checked' : ''}> Visible publicly</label><label class="studio-switch"><input name="featured" type="checkbox" ${project.featured ? 'checked' : ''}> Featured</label></div><div class="studio-field studio-field--wide"><label for="cover">Cover image</label><input class="studio-input" id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif"><p class="studio-help">JPEG, PNG, WebP, or AVIF up to 10 MB.</p></div><div class="studio-field studio-field--wide"><label for="gallery">Gallery images</label><input class="studio-input" id="gallery" name="gallery" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple></div></div><section class="studio-media" data-current-media></section><section class="studio-card studio-preview" data-preview-surface><p class="studio-help">Private preview</p><h2>${esc(project.title_en || project.title_ar || 'Untitled project')}</h2><p>${esc(project.short_description_en || '')}</p><div class="studio-preview__laptop" data-preview-laptop><div class="studio-preview__placeholder">No cover image selected</div></div></section><div class="studio-form-actions"><button class="studio-button studio-button--quiet" type="button" data-preview-form>Preview</button><button class="studio-button studio-button--quiet" type="submit" data-intent="draft">Save draft</button><button class="studio-button" type="submit" data-intent="publish">Publish</button><a class="studio-button studio-button--quiet" href="/studio/projects/">Cancel</a></div></form>`;
}

async function renderProjectEditor(id) {
  const project = id ? projects.find((item) => item.id === id) : blankProject();
  if (!project) { shell('Project not found', 'This project is unavailable.', '<a class="studio-button" href="/studio/projects/">Back to projects</a>', 'projects'); return; }
  if (new URLSearchParams(location.search).get('preview') === '1') return renderPrivatePreview(project);
  shell(id ? 'Edit project' : 'Add project', id ? 'Update content, media, and publishing settings.' : 'Create a new portfolio project.', projectForm(project), id ? 'projects' : 'new');
  const form = document.querySelector('[data-project-form]');
  renderMedia(project, form);
  form.addEventListener('input', () => { formDirty = true; });
  form.addEventListener('change', () => { formDirty = true; });
  form.querySelectorAll('[data-intent]').forEach((button) => button.addEventListener('click', () => { form.dataset.intent = button.dataset.intent; }));
  form.querySelector('[data-preview-form]').addEventListener('click', () => updateFormPreview(form));
  form.addEventListener('submit', (event) => { event.preventDefault(); saveProject(project, form, form.dataset.intent || 'draft'); });
  updateFormPreview(form, project);
}

function renderPrivatePreview(project) {
  const cover = project.cover_image_url ? `<img src="${esc(project.cover_image_url)}" alt="${esc(project.title_en || project.slug)}">` : '<div class="studio-preview__placeholder">No cover image selected</div>';
  shell('Private preview', 'This project is rendered privately and has not been published.', `<section class="studio-card studio-preview"><p class="studio-help">${esc(project.category_en || '')}</p><h2>${esc(project.title_en || project.title_ar || project.slug)}</h2><p>${esc(project.short_description_en || project.short_description_ar || '')}</p><div class="studio-preview__laptop">${cover}</div></section><div class="studio-actions" style="margin-top:20px"><a class="studio-button" href="/studio/projects/${project.id}">Back to editor</a></div>`, 'projects');
}

function renderMedia(project, form) {
  const surface = form.querySelector('[data-current-media]');
  const cards = [];
  if (project.cover_image_url) cards.push(`<article class="studio-media-card"><img src="${esc(project.cover_image_url)}" alt="Cover image"><button type="button" data-remove-cover aria-label="Remove cover image">Remove</button></article>`);
  if (project.cover_image_path) cards.push(`<article class="studio-media-card" data-cover-path="${esc(project.cover_image_path)}">Cover image stored</article>`);
  (Array.isArray(project.gallery_images) ? project.gallery_images : []).forEach((path) => cards.push(`<article class="studio-media-card" data-gallery-path="${esc(path)}">Gallery image<button type="button" data-remove-gallery="${esc(path)}" aria-label="Remove gallery image">Remove</button></article>`));
  surface.innerHTML = cards.join('') || '<p class="studio-help">No media attached yet.</p>';
  surface.querySelector('[data-remove-cover]')?.addEventListener('click', () => { project.cover_image_url = null; project.cover_image_path = null; formDirty = true; renderMedia(project, form); });
  surface.querySelectorAll('[data-remove-gallery]').forEach((button) => button.addEventListener('click', () => { project.gallery_images = project.gallery_images.filter((path) => path !== button.dataset.removeGallery); formDirty = true; renderMedia(project, form); }));
}

function updateFormPreview(form, existing = {}) {
  const title = form.title_en.value || form.title_ar.value || 'Untitled project';
  const summary = form.short_description_en.value || form.short_description_ar.value;
  const surface = document.querySelector('[data-preview-surface]');
  surface.querySelector('h2').textContent = title;
  surface.querySelector('p:not(.studio-help)').textContent = summary;
  const file = form.cover.files?.[0];
  const laptop = surface.querySelector('[data-preview-laptop]');
  if (file) laptop.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview">`;
  else if (existing.cover_image_url) laptop.innerHTML = `<img src="${esc(existing.cover_image_url)}" alt="Preview">`;
}

async function uploadFile(file) {
  if (!file) return null;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) throw new Error('Use a JPEG, PNG, WebP, or AVIF image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.');
  const filename = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const path = `projects/${crypto.randomUUID()}-${filename}`;
  const { error } = await supabase.storage.from('project-media').upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

function readProject(form, existing) {
  const slug = form.slug.value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use lowercase letters, numbers, and single hyphens for the slug.');
  const projectUrl = form.project_url.value.trim();
  const githubUrl = form.github_url.value.trim();
  if (!isSafeUrl(projectUrl) || !isSafeUrl(githubUrl)) throw new Error('Project and GitHub URLs must use http or https.');
  return { slug, title_en: form.title_en.value.trim(), title_ar: form.title_ar.value.trim(), category_en: form.category_en.value.trim(), category_ar: form.category_ar.value.trim(), short_description_en: form.short_description_en.value.trim(), short_description_ar: form.short_description_ar.value.trim(), long_description_en: form.long_description_en.value.trim(), long_description_ar: form.long_description_ar.value.trim(), tech_stack: form.tech_stack.value.split(',').map((item) => item.trim()).filter(Boolean), project_url: projectUrl || null, github_url: githubUrl || null, status: form.status.value, visible: form.visible.checked, featured: form.featured.checked, sort_order: Number(form.sort_order.value), cover_image_url: existing.cover_image_url || null, cover_image_path: existing.cover_image_path || null, gallery_images: existing.gallery_images || [] };
}

async function saveProject(existing, form, intent) {
  try {
    const payload = readProject(form, existing);
    if (intent === 'draft') payload.status = 'draft';
    if (intent === 'publish') payload.status = 'published';
    const cover = form.cover.files?.[0];
    if (cover) { payload.cover_image_path = await uploadFile(cover); payload.cover_image_url = null; }
    const gallery = [...(form.gallery.files || [])];
    if (gallery.length) payload.gallery_images = [...payload.gallery_images, ...(await Promise.all(gallery.map(uploadFile)))];
    const request = existing.id ? supabase.from('projects').update(payload).eq('id', existing.id).select().single() : supabase.from('projects').insert(payload).select().single();
    const { data, error } = await request;
    if (error) throw error;
    formDirty = false;
    setRoute(`/studio/projects/${data.id}`);
  } catch (error) { notice(error.message || 'Unable to save this project.', 'error'); }
}

async function refreshRoute(message = '') {
  await loadProjects();
  route();
  if (message) notice(message, 'success');
}

function route() {
  const path = currentPath();
  if (path === '/studio' || path === '') return renderOverview();
  if (path === '/studio/projects') return renderProjects();
  if (path === '/studio/projects/new') return renderProjectEditor();
  const match = path.match(/^\/studio\/projects\/([\w-]+)$/);
  if (match) return renderProjectEditor(match[1]);
  renderOverview();
}

window.addEventListener('beforeunload', (event) => { if (formDirty) { event.preventDefault(); event.returnValue = ''; } });

async function boot() {
  supabase = await getSupabaseClient();
  if (currentPath() === '/studio/login') return loginPage(Boolean(supabase));
  if (!supabase) { setRoute('/studio/login/'); return; }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || !isAdmin(session.user)) { await supabase.auth.signOut(); setRoute('/studio/login/'); return; }
  try { await loadProjects(); route(); } catch (error) { shell('Studio unavailable', 'The secure data connection could not be opened.', `<p class="studio-notice is-visible" data-tone="error">${esc(error.message)}</p>`); }
}

boot();
