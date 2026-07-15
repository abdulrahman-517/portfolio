import { getSupabaseClient } from '/supabase-client.js?v=20260715';

const ADMIN_EMAIL = 'abdulrahmanalmushajari@gmail.com';
const app = document.querySelector('#studio-app');
let supabase = null;
let projects = [];
let formDirty = false;
let mediaPreviewUrl = '';

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDate = (value) => value ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(value)) : 'غير منشور';
const statusLabel = (status) => ({ draft: 'مسودة', published: 'منشور', private: 'خاص', development: 'قيد التطوير', archived: 'مؤرشف' }[status] || status);
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
  app.innerHTML = `<div class="studio-shell"><button class="studio-menu-toggle" type="button" data-studio-menu aria-label="فتح القائمة" aria-controls="studio-sidebar" aria-expanded="false">القائمة</button><main class="studio-main"><div class="studio-main-inner"><header class="studio-topbar"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div></header><div class="studio-notice" data-studio-notice role="status" aria-live="polite"></div>${content}</div></main><aside class="studio-sidebar" id="studio-sidebar"><a class="studio-brand" href="/studio/">بنية ستوديو</a><nav class="studio-nav" aria-label="تنقل الاستديو"><a href="/studio/" ${active === 'overview' ? 'aria-current="page"' : ''}>نظرة عامة</a><a href="/studio/projects/" ${active === 'projects' ? 'aria-current="page"' : ''}>المشاريع</a><a href="/studio/projects/new" ${active === 'new' ? 'aria-current="page"' : ''}>إضافة مشروع</a><a href="/studio/media/" ${active === 'media' ? 'aria-current="page"' : ''}>مكتبة الوسائط</a><a href="/" target="_blank" rel="noopener noreferrer">معاينة الموقع</a><a href="/studio/settings/" ${active === 'settings' ? 'aria-current="page"' : ''}>الإعدادات</a><span class="studio-nav__spacer"></span><button type="button" class="studio-nav__signout" data-sign-out>تسجيل الخروج</button></nav></aside></div>`;
  document.querySelector('[data-sign-out]')?.addEventListener('click', signOut);
  const closeMenu = () => {
    document.body.classList.remove('studio-menu-open');
    document.querySelector('[data-studio-menu]')?.setAttribute('aria-expanded', 'false');
    document.querySelector('[data-studio-menu]')?.setAttribute('aria-label', 'فتح القائمة');
  };
  document.querySelector('[data-studio-menu]')?.addEventListener('click', (event) => {
    const open = document.body.classList.toggle('studio-menu-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });
  document.querySelectorAll('.studio-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  document.onkeydown = (event) => { if (event.key === 'Escape') closeMenu(); };
}

async function signOut() {
  await supabase.auth.signOut();
  setRoute('/studio/login/');
}

function loginPage(configured) {
  app.innerHTML = `<main class="studio-login"><span class="studio-login__brand">بنية ستوديو</span><h1>دخول المالك</h1><p>${configured ? 'سجّل الدخول بحساب المالك المعتمد لإدارة المشاريع والوسائط.' : 'يحتاج الاستديو إلى إعداد اتصال آمن قبل استخدامه.'}</p>${configured ? `<form class="studio-card studio-form" data-login-form><div class="studio-field"><label for="studio-email">البريد الإلكتروني</label><input class="studio-input studio-input--ltr" id="studio-email" type="email" value="${ADMIN_EMAIL}" autocomplete="email" required></div><div class="studio-field"><label for="studio-password">كلمة المرور</label><input class="studio-input studio-input--ltr" id="studio-password" type="password" autocomplete="current-password" required></div><button class="studio-button" type="submit">تسجيل الدخول</button><div class="studio-notice" data-studio-notice role="status" aria-live="polite"></div></form>` : ''}</main>`;
  document.querySelector('[data-login-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#studio-email').value.trim().toLowerCase();
    const password = document.querySelector('#studio-password').value;
    if (email !== ADMIN_EMAIL) return notice('هذا الحساب غير معتمد للوصول إلى الاستديو.', 'error');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return notice(error.message, 'error');
    const { data: { user } } = await supabase.auth.getUser();
    if (!isAdmin(user)) { await supabase.auth.signOut(); return notice('هذا الحساب غير معتمد للوصول إلى الاستديو.', 'error'); }
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
  shell('مرحبًا، عبدالرحمن', 'إدارة محتوى معرض الأعمال.', `<section class="studio-stats">${stat('إجمالي المشاريع', projects.length)}${stat('المشاريع المنشورة', published)}${stat('المسودات', drafts)}${stat('المشاريع المخفية', hidden)}</section><section class="studio-card studio-list"><div class="studio-list__heading">آخر التعديلات</div><div class="studio-recent">${recent.length ? recent.map((project) => `<a href="/studio/projects/${project.id}"><strong>${esc(project.title_ar || project.title_en || project.slug)}</strong><span>${formatDate(project.updated_at)}</span></a>`).join('') : '<p class="studio-help">لا توجد مشاريع حتى الآن.</p>'}</div></section><div class="studio-actions" style="margin-top:20px"><a class="studio-button" href="/studio/projects/new">إضافة مشروع جديد</a><a class="studio-button studio-button--quiet" href="/" target="_blank" rel="noopener noreferrer">فتح الموقع</a></div>`, 'overview');
}

function signedImage(path, target) {
  if (!path || !target) return;
  supabase.storage.from('project-media').createSignedUrl(path, 3600).then(({ data }) => {
    if (data?.signedUrl && target.isConnected) target.src = data.signedUrl;
  });
}

function projectImage(project) {
  const image = project.cover_image_url || project.gallery_images?.[0];
  return image ? `<img src="${esc(image)}" alt="">` : `<span>${esc((project.title_en || project.title_ar || '?').slice(0, 2))}</span>`;
}

function projectRows(list) {
  return list.map((project) => `<tr draggable="true" data-project-row="${project.id}"><td><div class="studio-thumb">${projectImage(project)}</div></td><td><strong>${esc(project.title_ar || project.title_en || project.slug)}</strong><br><span class="studio-help studio-ltr">${esc(project.slug)}</span></td><td><span class="studio-badge studio-badge--${project.status}">${esc(statusLabel(project.status))}</span></td><td>${project.visible ? 'ظاهر' : 'مخفي'}</td><td>${project.featured ? 'مميز' : 'غير مميز'}</td><td>${project.sort_order}</td><td>${formatDate(project.updated_at)}</td><td><div class="studio-row-actions"><a class="studio-icon-button" href="/studio/projects/${project.id}" aria-label="تعديل ${esc(project.title_ar || project.title_en || project.slug)}">تعديل</a><button class="studio-icon-button" type="button" data-preview="${project.id}" aria-label="معاينة ${esc(project.title_ar || project.title_en || project.slug)}">معاينة</button><button class="studio-icon-button" type="button" data-publish="${project.id}" aria-label="${project.status === 'published' ? 'إلغاء نشر' : 'نشر'} ${esc(project.title_ar || project.title_en || project.slug)}">${project.status === 'published' ? 'إلغاء النشر' : 'نشر'}</button><button class="studio-icon-button" type="button" data-move="up:${project.id}" aria-label="نقل للأعلى">أعلى</button><button class="studio-icon-button" type="button" data-move="down:${project.id}" aria-label="نقل للأسفل">أسفل</button><button class="studio-icon-button studio-icon-button--danger" type="button" data-archive="${project.id}" aria-label="أرشفة ${esc(project.title_ar || project.title_en || project.slug)}">أرشفة</button><button class="studio-icon-button studio-icon-button--danger" type="button" data-delete="${project.id}" aria-label="حذف ${esc(project.title_ar || project.title_en || project.slug)}">حذف</button></div></td></tr>`).join('');
}

function renderProjects() {
  const mediaView = new URLSearchParams(location.search).get('view') === 'media';
  const content = mediaView ? renderMediaLibrary() : `<div class="studio-toolbar"><input class="studio-input studio-input--search" data-project-search type="search" placeholder="ابحث باسم المشروع..."><select class="studio-select" data-project-filter><option value="all">الكل</option><option value="published">المنشورة</option><option value="draft">المسودات</option><option value="hidden">المخفية</option><option value="development">قيد التطوير</option><option value="archived">المؤرشفة</option></select><a class="studio-button" href="/studio/projects/new">إضافة مشروع</a></div><section class="studio-card studio-table-wrap"><table class="studio-table"><thead><tr><th>الصورة</th><th>اسم المشروع</th><th>الحالة</th><th>الظهور</th><th>مشروع مميز</th><th>الترتيب</th><th>آخر تحديث</th><th>الإجراءات</th></tr></thead><tbody data-project-rows>${projectRows(projects)}</tbody></table></section><dialog data-archive-dialog></dialog>`;
  shell(mediaView ? 'مكتبة الوسائط' : 'المشاريع', mediaView ? 'الصور المحفوظة ضمن وسائط المشاريع.' : 'انشر وأخفِ ورتّب وعاين وأرشف أعمال المعرض.', content, mediaView ? 'media' : 'projects');
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
  const cards = projects.filter((project) => project.cover_image_path || project.cover_image_url || project.gallery_images?.length).map((project) => { const image = project.cover_image_url || project.gallery_images?.[0]; return `<article class="studio-media-card">${image ? `<img src="${esc(image)}" alt="${esc(project.title_ar || project.title_en || project.slug)}">` : `<span>${esc(project.title_ar || project.title_en || project.slug)}</span>`}<a class="studio-icon-button" href="/studio/projects/${project.id}" aria-label="تعديل ${esc(project.title_ar || project.title_en || project.slug)}">تعديل</a></article>`; }).join('');
  return `<section class="studio-media">${cards || '<p class="studio-help">ارفع صور الغلاف من محرر كل مشروع.</p>'}</section>`;
}

function renderMediaPage() {
  shell('مكتبة الوسائط', 'استعرض صور المشاريع المحفوظة وافتح المشروع لتحديثها أو استبدالها.', renderMediaLibrary(), 'media');
}

function renderSettings() {
  shell('الإعدادات', 'إعدادات الوصول وإدارة الاستديو.', `<section class="studio-form-section"><h2 class="studio-form-section__heading">حساب المالك</h2><p class="studio-form-section__hint">هذا الاستديو محمي بحساب المالك المعتمد. استخدم القائمة الجانبية لإدارة المشاريع والوسائط.</p><div class="studio-actions"><a class="studio-button" href="/studio/projects/new">إضافة مشروع</a><a class="studio-button studio-button--quiet" href="/" target="_blank" rel="noopener noreferrer">معاينة الموقع</a></div></section>`, 'settings');
}

function bindProjectActions() {
  document.querySelectorAll('[data-preview]').forEach((button) => button.addEventListener('click', () => setRoute(`/studio/projects/${button.dataset.preview}?preview=1`)));
  document.querySelectorAll('[data-publish]').forEach((button) => button.addEventListener('click', () => togglePublished(button.dataset.publish)));
  document.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => { const [direction, id] = button.dataset.move.split(':'); moveProject(id, direction); }));
  document.querySelectorAll('[data-archive]').forEach((button) => button.addEventListener('click', () => confirmArchive(button.dataset.archive)));
  document.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => confirmDelete(button.dataset.delete)));
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
  await refreshRoute('تم تحديث حالة المشروع.');
}

async function persistOrdering(next) {
  const updates = next.map((project, index) => supabase.from('projects').update({ sort_order: index + 1 }).eq('id', project.id));
  const results = await Promise.all(updates);
  const failure = results.find((result) => result.error)?.error;
  if (failure) return notice(failure.message, 'error');
  await refreshRoute('تم حفظ ترتيب المشاريع.');
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
  dialog.innerHTML = `<form method="dialog" class="studio-dialog"><h2>أرشفة المشروع؟</h2><p>سيُزال <strong>${esc(project?.title_ar || project?.title_en || project?.slug || '')}</strong> من النشر العام مع الاحتفاظ به بأمان داخل الاستديو.</p><div class="studio-dialog__actions"><button class="studio-button studio-button--quiet" value="cancel">إلغاء</button><button class="studio-button studio-button--danger" value="archive">أرشفة المشروع</button></div></form>`;
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'archive') return;
    const { error } = await supabase.from('projects').update({ status: 'archived', visible: false }).eq('id', id);
    if (error) return notice(error.message, 'error');
    await refreshRoute('تمت أرشفة المشروع.');
  }, { once: true });
  dialog.showModal();
}

function confirmDelete(id) {
  const project = projects.find((item) => item.id === id);
  const dialog = document.querySelector('[data-archive-dialog]');
  dialog.innerHTML = `<form method="dialog" class="studio-dialog"><h2>حذف المشروع نهائيًا؟</h2><p>سيُحذف <strong>${esc(project?.title_ar || project?.title_en || project?.slug || '')}</strong> مع الوسائط المرتبطة به، ولا يمكن استعادته.</p><div class="studio-dialog__actions"><button class="studio-button studio-button--quiet" value="cancel">إلغاء</button><button class="studio-button studio-button--danger" value="delete">حذف المشروع</button></div></form>`;
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue !== 'delete') return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return notice(error.message, 'error');
    await refreshRoute('تم حذف المشروع نهائيًا.');
  }, { once: true });
  dialog.showModal();
}

const blankProject = () => ({ title_en: '', title_ar: '', slug: '', category_en: '', category_ar: '', short_description_en: '', short_description_ar: '', long_description_en: '', long_description_ar: '', tech_stack: [], project_url: '', github_url: '', status: 'draft', visible: true, featured: false, sort_order: projects.length + 1, gallery_images: [], media_type: 'screenshot', media_fit: 'contain', media_scale: 1, media_position_x: 'center', media_position_y: 'center' });

function field(name, label, value, options = {}) {
  const type = options.type || 'text';
  const required = options.required ? '<span aria-hidden="true">*</span>' : '';
  const wide = options.wide ? ' studio-field--wide' : '';
  const ltr = /_en$|slug|url|tech_stack/.test(name);
  const direction = ltr ? ' dir="ltr"' : ' dir="rtl"';
  const className = ltr ? ' studio-input--ltr' : '';
  const input = type === 'textarea' ? `<textarea class="studio-textarea${className}" id="${name}" name="${name}"${direction} ${options.required ? 'required' : ''}>${esc(value || '')}</textarea>` : `<input class="studio-input${className}" id="${name}" name="${name}" type="${type}" value="${esc(value || '')}"${direction} ${options.required ? 'required' : ''}>`;
  return `<div class="studio-field${wide}"><label for="${name}">${esc(label)} ${required}</label>${input}${options.help ? `<p class="studio-help">${esc(options.help)}</p>` : ''}</div>`;
}

function formSection(title, content, hint = '') {
  return `<section class="studio-form-section"><h2 class="studio-form-section__heading">${esc(title)}</h2>${hint ? `<p class="studio-form-section__hint">${esc(hint)}</p>` : ''}${content}</section>`;
}

function mediaSettings(project = {}) {
  const type = ['logo', 'screenshot', 'poster'].includes(project.media_type) ? project.media_type : 'screenshot';
  return {
    type,
    fit: type === 'logo' ? 'contain' : (project.media_fit === 'cover' ? 'cover' : 'contain'),
    scale: Math.min(1.15, Math.max(.4, Number(project.media_scale) || (type === 'logo' ? .68 : 1))),
    x: ['left', 'center', 'right'].includes(project.media_position_x) ? project.media_position_x : 'center',
    y: ['top', 'center', 'bottom'].includes(project.media_position_y) ? project.media_position_y : 'center'
  };
}

function mediaControls(project) {
  const media = mediaSettings(project);
  return `<div class="studio-form-grid studio-media-controls"><div class="studio-field"><label for="media_type">نوع الصورة</label><select class="studio-select" id="media_type" name="media_type" data-media-control><option value="logo" ${media.type === 'logo' ? 'selected' : ''}>شعار</option><option value="screenshot" ${media.type === 'screenshot' ? 'selected' : ''}>لقطة واجهة</option><option value="poster" ${media.type === 'poster' ? 'selected' : ''}>ملصق أو عمل بصري</option></select></div><div class="studio-field"><label for="media_fit">طريقة الاحتواء</label><select class="studio-select" id="media_fit" name="media_fit" data-media-control><option value="contain" ${media.fit === 'contain' ? 'selected' : ''}>إظهار الصورة كاملة</option><option value="cover" ${media.fit === 'cover' ? 'selected' : ''}>ملء الإطار</option></select></div><div class="studio-field"><label for="media_scale">حجم الصورة <output data-media-scale-output>${media.scale.toFixed(2)}</output></label><input class="studio-range" id="media_scale" name="media_scale" data-media-control type="range" min="0.40" max="1.15" step="0.01" value="${media.scale}"></div><div class="studio-field"><label for="media_position_x">الموضع الأفقي</label><select class="studio-select" id="media_position_x" name="media_position_x" data-media-control><option value="left" ${media.x === 'left' ? 'selected' : ''}>يسار</option><option value="center" ${media.x === 'center' ? 'selected' : ''}>وسط</option><option value="right" ${media.x === 'right' ? 'selected' : ''}>يمين</option></select></div><div class="studio-field"><label for="media_position_y">الموضع الرأسي</label><select class="studio-select" id="media_position_y" name="media_position_y" data-media-control><option value="top" ${media.y === 'top' ? 'selected' : ''}>أعلى</option><option value="center" ${media.y === 'center' ? 'selected' : ''}>منتصف</option><option value="bottom" ${media.y === 'bottom' ? 'selected' : ''}>أسفل</option></select></div></div>`;
}

function projectForm(project) {
  const basic = `<div class="studio-form-grid">${field('title_ar', 'العنوان العربي', project.title_ar, { required: true })}${field('title_en', 'العنوان الإنجليزي', project.title_en, { required: true })}${field('category_ar', 'التصنيف العربي', project.category_ar, { required: true })}${field('category_en', 'التصنيف الإنجليزي', project.category_en, { required: true })}${field('slug', 'المعرّف بالرابط', project.slug, { required: true, help: 'حروف إنجليزية صغيرة وأرقام وشرطات فقط.' })}${field('sort_order', 'ترتيب الظهور', project.sort_order, { type: 'number', required: true })}</div>`;
  const descriptions = `<div class="studio-form-grid">${field('short_description_ar', 'الوصف العربي المختصر', project.short_description_ar, { type: 'textarea', required: true, wide: true })}${field('short_description_en', 'الوصف الإنجليزي المختصر', project.short_description_en, { type: 'textarea', required: true, wide: true })}${field('long_description_ar', 'الوصف العربي التفصيلي', project.long_description_ar, { type: 'textarea', wide: true })}${field('long_description_en', 'الوصف الإنجليزي التفصيلي', project.long_description_en, { type: 'textarea', wide: true })}</div>`;
  const links = `<div class="studio-form-grid">${field('tech_stack', 'التقنيات المستخدمة', (project.tech_stack || []).join(', '), { wide: true, help: 'افصل بين التقنيات بفاصلة.' })}${field('project_url', 'رابط المشروع الحي', project.project_url, { type: 'url' })}${field('github_url', 'رابط GitHub', project.github_url, { type: 'url' })}</div>`;
  const media = `<div class="studio-form-grid"><div class="studio-field studio-field--wide"><label for="cover">الصورة الرئيسية</label><input class="studio-input studio-input--ltr studio-file-input" id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml"><p class="studio-help">SVG أو JPEG أو PNG أو GIF أو WebP أو AVIF حتى 10 ميغابايت.</p></div><div class="studio-field studio-field--wide"><label for="gallery">معرض الصور</label><input class="studio-input studio-input--ltr studio-file-input" id="gallery" name="gallery" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml" multiple></div></div><section class="studio-media" data-current-media></section>`;
  const publishing = `<div class="studio-form-grid"><div class="studio-field"><label for="status">الحالة</label><select class="studio-select" id="status" name="status">${['draft', 'published', 'private', 'development', 'archived'].map((status) => `<option value="${status}" ${project.status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></div><div class="studio-field"><label>إعدادات النشر</label><div class="studio-switch-group"><label class="studio-switch"><input name="visible" type="checkbox" ${project.visible ? 'checked' : ''}> ظاهر في الموقع العام</label><label class="studio-switch"><input name="featured" type="checkbox" ${project.featured ? 'checked' : ''}> مشروع مميز</label></div></div></div>`;
  const presentationPreview = `<section class="studio-media-preview" data-media-preview><article><h3>معاينة السلايدر</h3><div class="studio-preview__laptop" data-media-preview-slider></div></article><article><h3>معاينة صفحة المشروع</h3><div class="studio-preview__detail" data-media-preview-detail></div></article></section>`;
  const actions = `<div class="studio-form-actions"><a class="studio-button studio-button--quiet" href="/studio/projects/">إلغاء</a><button class="studio-button studio-button--quiet" type="submit" data-intent="draft">حفظ كمسودة</button><button class="studio-button" type="submit" data-intent="publish">نشر المشروع</button></div>`;
  return `<form class="studio-form" data-project-form novalidate>${formSection('المعلومات الأساسية', basic)}${formSection('أوصاف المشروع', descriptions)}${formSection('التقنيات والروابط', links)}${formSection('الصور والوسائط', media, 'ارفع صورة الغلاف وصورًا إضافية للمشروع.')}${formSection('طريقة عرض الصورة', `${mediaControls(project)}${presentationPreview}`, 'تُحدّث المعاينة مباشرة قبل حفظ المشروع.')}${formSection('إعدادات الظهور والنشر', publishing)}${formSection('الإجراءات', actions)}</form>`;
}

async function renderProjectEditor(id) {
  const project = id ? projects.find((item) => item.id === id) : blankProject();
  if (!project) { shell('المشروع غير موجود', 'هذا المشروع غير متاح.', '<a class="studio-button" href="/studio/projects/">العودة إلى المشاريع</a>', 'projects'); return; }
  if (new URLSearchParams(location.search).get('preview') === '1') return renderPrivatePreview(project);
  shell(id ? 'تعديل المشروع' : 'إضافة مشروع', id ? 'حدّث المحتوى والوسائط وإعدادات النشر.' : 'أنشئ مشروعًا جديدًا لمعرض الأعمال.', projectForm(project), id ? 'projects' : 'new');
  const form = document.querySelector('[data-project-form]');
  renderMedia(project, form);
  form.addEventListener('input', () => { formDirty = true; });
  form.addEventListener('change', () => { formDirty = true; });
  form.querySelectorAll('[data-intent]').forEach((button) => button.addEventListener('click', () => { form.dataset.intent = button.dataset.intent; }));
  form.querySelectorAll('[data-media-control]').forEach((control) => {
    control.addEventListener('input', () => updateFormPreview(form, project));
    control.addEventListener('change', () => updateFormPreview(form, project));
  });
  form.media_type.addEventListener('change', () => {
    if (form.media_type.value === 'logo') { form.media_fit.value = 'contain'; form.media_scale.value = '.68'; }
    updateFormPreview(form, project);
  });
  form.cover.addEventListener('change', () => updateFormPreview(form, project));
  form.addEventListener('submit', (event) => { event.preventDefault(); saveProject(project, form, form.dataset.intent || 'draft'); });
  updateFormPreview(form, project);
}

function renderPrivatePreview(project) {
  const cover = project.cover_image_url ? `<img src="${esc(project.cover_image_url)}" alt="${esc(project.title_ar || project.title_en || project.slug)}">` : '<div class="studio-preview__placeholder">لم تُحدد صورة غلاف</div>';
  shell('معاينة خاصة', 'تظهر هذه المعاينة داخل الاستديو فقط ولم يتم نشرها.', `<section class="studio-card studio-preview"><p class="studio-help">${esc(project.category_ar || project.category_en || '')}</p><h2>${esc(project.title_ar || project.title_en || project.slug)}</h2><p>${esc(project.short_description_ar || project.short_description_en || '')}</p><div class="studio-preview__laptop">${cover}</div></section><div class="studio-actions" style="margin-top:20px"><a class="studio-button" href="/studio/projects/${project.id}">العودة إلى المحرر</a></div>`, 'projects');
}

function renderMedia(project, form) {
  const surface = form.querySelector('[data-current-media]');
  const cards = [];
  if (project.cover_image_url) cards.push(`<article class="studio-media-card"><img src="${esc(project.cover_image_url)}" alt="صورة الغلاف"><button type="button" data-remove-cover aria-label="إزالة صورة الغلاف">إزالة</button></article>`);
  if (project.cover_image_path) cards.push(`<article class="studio-media-card" data-cover-path="${esc(project.cover_image_path)}">تم حفظ صورة الغلاف</article>`);
  (Array.isArray(project.gallery_images) ? project.gallery_images : []).forEach((path) => cards.push(`<article class="studio-media-card" data-gallery-path="${esc(path)}">صورة المعرض<button type="button" data-remove-gallery="${esc(path)}" aria-label="إزالة صورة المعرض">إزالة</button></article>`));
  surface.innerHTML = cards.join('') || '<p class="studio-help">لا توجد وسائط مرفقة بعد.</p>';
  surface.querySelector('[data-remove-cover]')?.addEventListener('click', () => { project.cover_image_url = null; project.cover_image_path = null; formDirty = true; renderMedia(project, form); });
  surface.querySelectorAll('[data-remove-gallery]').forEach((button) => button.addEventListener('click', () => { project.gallery_images = project.gallery_images.filter((path) => path !== button.dataset.removeGallery); formDirty = true; renderMedia(project, form); }));
}

function previewMediaMarkup(src, settings, title, context) {
  const alignment = { left: 'start', center: 'center', right: 'end', top: 'start', bottom: 'end' };
  const style = `--studio-media-scale:${settings.scale};--studio-media-x:${alignment[settings.x]};--studio-media-y:${alignment[settings.y]};`;
  const media = src ? `<img class="studio-project-media studio-project-media--${settings.type} studio-project-media--${settings.fit}" src="${esc(src)}" alt="معاينة ${esc(title)}">` : `<div class="studio-project-media__fallback"><strong>${esc(title)}</strong><span>لم تتم إضافة صورة للمشروع</span></div>`;
  return `<div class="studio-project-media-surface studio-project-media-surface--${context}" style="${style}">${media}</div>`;
}

function updateFormPreview(form, existing = {}) {
  const title = form.title_ar.value || form.title_en.value || 'مشروع بلا عنوان';
  const file = form.cover.files?.[0];
  if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
  mediaPreviewUrl = file ? URL.createObjectURL(file) : '';
  const src = mediaPreviewUrl || existing.cover_image_url || existing.gallery_images?.[0] || '';
  const settings = mediaSettings({ media_type: form.media_type.value, media_fit: form.media_fit.value, media_scale: form.media_scale.value, media_position_x: form.media_position_x.value, media_position_y: form.media_position_y.value });
  form.querySelector('[data-media-scale-output]').textContent = settings.scale.toFixed(2);
  form.media_fit.value = settings.fit;
  form.querySelector('[data-media-preview-slider]').innerHTML = previewMediaMarkup(src, settings, title, 'slider');
  form.querySelector('[data-media-preview-detail]').innerHTML = previewMediaMarkup(src, settings, title, 'detail');
}

async function uploadFile(file) {
  if (!file) return null;
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'].includes(file.type)) throw new Error('استخدم ملف SVG أو JPEG أو PNG أو GIF أو WebP أو AVIF.');
  if (file.size > 10 * 1024 * 1024) throw new Error('يجب ألا يتجاوز حجم الصورة 10 ميغابايت.');
  const filename = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const path = `projects/${crypto.randomUUID()}-${filename}`;
  const { error } = await supabase.storage.from('project-media').upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

function readProject(form, existing) {
  const slug = form.slug.value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات مفردة في المعرّف.');
  const projectUrl = form.project_url.value.trim();
  const githubUrl = form.github_url.value.trim();
  if (!isSafeUrl(projectUrl) || !isSafeUrl(githubUrl)) throw new Error('يجب أن تستخدم روابط المشروع وGitHub بروتوكول http أو https.');
  const settings = mediaSettings({ media_type: form.media_type.value, media_fit: form.media_fit.value, media_scale: form.media_scale.value, media_position_x: form.media_position_x.value, media_position_y: form.media_position_y.value });
  return { slug, title_en: form.title_en.value.trim(), title_ar: form.title_ar.value.trim(), category_en: form.category_en.value.trim(), category_ar: form.category_ar.value.trim(), short_description_en: form.short_description_en.value.trim(), short_description_ar: form.short_description_ar.value.trim(), long_description_en: form.long_description_en.value.trim(), long_description_ar: form.long_description_en.value.trim(), tech_stack: form.tech_stack.value.split(',').map((item) => item.trim()).filter(Boolean), project_url: projectUrl || null, github_url: githubUrl || null, status: form.status.value, visible: form.visible.checked, featured: form.featured.checked, sort_order: Number(form.sort_order.value), cover_image_url: existing.cover_image_url || null, cover_image_path: existing.cover_image_path || null, gallery_images: existing.gallery_images || [], media_type: settings.type, media_fit: settings.fit, media_scale: settings.scale, media_position_x: settings.x, media_position_y: settings.y };
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
  } catch (error) { notice(error.message || 'تعذر حفظ المشروع.', 'error'); }
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
  if (path === '/studio/media') return renderMediaPage();
  if (path === '/studio/settings') return renderSettings();
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
  try { await loadProjects(); route(); } catch (error) { shell('الاستديو غير متاح', 'تعذر فتح اتصال البيانات الآمن.', `<p class="studio-notice is-visible" data-tone="error">${esc(error.message)}</p>`); }
}

boot();
