import { getSupabaseClient } from '/supabase-client.js?v=20260715';

const ADMIN_EMAIL = 'abdulrahmanalmushajari@gmail.com';
const app = document.querySelector('#studio-app');
let supabase = null;
let projects = [];
let formDirty = false;
let mediaPreviewUrl = '';
let galleryPreviewUrls = {};
let livePreviewMode = 'desktop';

const FEATURE_ICONS = [
  { value: 'route', label: 'مسار' },
  { value: 'globe', label: 'عالم' },
  { value: 'layers', label: 'طبقات' },
  { value: 'code', label: 'كود' },
  { value: 'database', label: 'قاعدة بيانات' },
  { value: 'cloud', label: 'سحابة' },
  { value: 'map-pin', label: 'موقع' },
  { value: 'search', label: 'بحث' },
  { value: 'article', label: 'مقال' },
  { value: 'chart', label: 'رسم بياني' }
];

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDate = (value) => value ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(value)) : 'غير منشور';
const statusLabel = (status) => ({ draft: 'مسودة', published: 'منشور', private: 'خاص', development: 'قيد التطوير', archived: 'مؤرشف' }[status] || status);
const isSafeUrl = (value) => { if (!value) return true; try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } };
const isAdmin = (user) => user?.email?.toLowerCase() === ADMIN_EMAIL;
const currentPath = () => window.location.pathname.replace(/\/$/, '');
const setRoute = (route) => { window.location.assign(route); };
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

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
  const closeMenu = () => { document.body.classList.remove('studio-menu-open'); document.querySelector('[data-studio-menu]')?.setAttribute('aria-expanded', 'false'); document.querySelector('[data-studio-menu]')?.setAttribute('aria-label', 'فتح القائمة'); };
  document.querySelector('[data-studio-menu]')?.addEventListener('click', (event) => { const open = document.body.classList.toggle('studio-menu-open'); event.currentTarget.setAttribute('aria-expanded', String(open)); event.currentTarget.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة'); });
  document.querySelectorAll('.studio-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  document.onkeydown = (event) => { if (event.key === 'Escape') closeMenu(); };
}

async function signOut() { await supabase.auth.signOut(); setRoute('/studio/login/'); }

function loginPage(configured) {
  app.innerHTML = `<main class="studio-login"><span class="studio-login__brand">بنية ستوديو</span><h1>دخول المالك</h1><p>${configured ? 'سجّل الدخول بحساب المالك المعتمد لإدارة المشاريع والوسائط.' : 'يحتاج الاستديو إلى إعداد اتصال آمن قبل استخدامه.'}</p>${configured ? `<form class="studio-card studio-form" data-login-form><div class="studio-field"><label for="studio-email">البريد الإلكتروني</label><input class="studio-input studio-input--ltr" id="studio-email" type="email" value="${ADMIN_EMAIL}" autocomplete="email" required></div><div class="studio-field"><label for="studio-password">كلمة المرور</label><input class="studio-input studio-input--ltr" id="studio-password" type="password" autocomplete="current-password" required></div><button class="studio-button" type="submit">تسجيل الدخول</button><div class="studio-notice" data-studio-notice role="status" aria-live="polite"></div></form>` : ''}</main>`;
  document.querySelector('[data-login-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#studio-email').value.trim().toLowerCase();
    const password = document.querySelector('#studio-password').value;
    if (email !== ADMIN_EMAIL) return notice('هذا الحقان غير معتمد للوصول إلى الاستديو.', 'error');
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
  supabase.storage.from('project-media').createSignedUrl(path, 3600).then(({ data }) => { if (data?.signedUrl && target.isConnected) target.src = data.signedUrl; });
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

const blankProject = () => ({
  title_en: '', title_ar: '', slug: '', category_en: '', category_ar: '',
  short_description_en: '', short_description_ar: '', long_description_en: '', long_description_ar: '',
  tech_stack: [], project_url: '', github_url: '', additional_url: '',
  cover_image_url: '', cover_image_path: '', gallery_images: [], gallery_captions: {},
  media_type: 'cover', media_fit: 'cover', media_scale: 1, media_position_x: 'center', media_position_y: 'center', angled_edge: true,
  features: [], main_features: [],
  project_type: '', project_role: '', project_year: '', project_duration: '', project_platform: '', project_status_label: '',
  challenge_ar: '', challenge_en: '', solution_ar: '', solution_en: '',
  development_notes_ar: '', development_notes_en: '', limitations_ar: '', limitations_en: '', next_steps_ar: '', next_steps_en: '',
  status: 'draft', visible: true, featured: false, sort_order: projects.length + 1
});

function field(name, label, value, options = {}) {
  const type = options.type || 'text';
  const required = options.required ? '<span aria-hidden="true">*</span>' : '';
  const wide = options.wide ? ' studio-field--wide' : '';
  const ltr = /_en$|slug|url|tech_stack|additional_url/.test(name);
  const direction = ltr ? ' dir="ltr"' : ' dir="rtl"';
  const className = ltr ? ' studio-input--ltr' : '';
  const input = type === 'textarea' ? `<textarea class="studio-textarea${className}" id="${name}" name="${name}"${direction} ${options.required ? 'required' : ''} ${options.rows ? `rows="${options.rows}"` : ''}>${esc(value || '')}</textarea>` : `<input class="studio-input${className}" id="${name}" name="${name}" type="${type}" value="${esc(value || '')}"${direction} ${options.required ? 'required' : ''}>`;
  return `<div class="studio-field${wide}"><label for="${name}">${esc(label)} ${required}</label>${input}${options.help ? `<p class="studio-help">${esc(options.help)}</p>` : ''}</div>`;
}

function selectField(name, label, value, options) {
  const optionsHtml = options.map((opt) => `<option value="${opt.value}" ${String(value) === String(opt.value) ? 'selected' : ''}>${esc(opt.label)}</option>`).join('');
  return `<div class="studio-field"><label for="${name}">${esc(label)}</label><select class="studio-select" id="${name}" name="${name}">${optionsHtml}</select></div>`;
}

function formSection(title, content, hint = '') {
  return `<section class="studio-form-section"><h2 class="studio-form-section__heading">${esc(title)}</h2>${hint ? `<p class="studio-form-section__hint">${esc(hint)}</p>` : ''}${content}</section>`;
}

function mediaSettings(project = {}) {
  const type = ['cover', 'logo', 'screenshot', 'poster'].includes(project.media_type) ? project.media_type : 'cover';
  return {
    type,
    fit: type === 'logo' ? 'contain' : (project.media_fit === 'cover' ? 'cover' : (type === 'cover' ? 'cover' : 'contain')),
    scale: clamp(project.media_scale, 0.40, 1.15) || (type === 'logo' ? 0.68 : 1),
    x: ['left', 'center', 'right'].includes(project.media_position_x) ? project.media_position_x : 'center',
    y: ['top', 'center', 'bottom'].includes(project.media_position_y) ? project.media_position_y : 'center',
    angled: project.angled_edge !== false
  };
}

function mediaControls(project) {
  const media = mediaSettings(project);
  return `<div class="studio-form-grid studio-media-controls"><div class="studio-field"><label for="media_type">نوع الصورة</label><select class="studio-select" id="media_type" name="media_type" data-media-control><option value="cover" ${media.type === 'cover' ? 'selected' : ''}>صورة غلاف</option><option value="screenshot" ${media.type === 'screenshot' ? 'selected' : ''}>لقطة واجهة</option><option value="logo" ${media.type === 'logo' ? 'selected' : ''}>شعار</option><option value="poster" ${media.type === 'poster' ? 'selected' : ''}>ملصق أو تصميم</option></select></div><div class="studio-field"><label for="media_fit">طريقة الاحتواء</label><select class="studio-select" id="media_fit" name="media_fit" data-media-control><option value="cover" ${media.fit === 'cover' ? 'selected' : ''}>ملء المساحة</option><option value="contain" ${media.fit === 'contain' ? 'selected' : ''}>إظهار الصورة كاملة</option></select></div><div class="studio-field"><label for="media_position_x">موضع الصورة</label><select class="studio-select" id="media_position_x" name="media_position_x" data-media-control><option value="left" ${media.x === 'left' ? 'selected' : ''}>يسار</option><option value="center" ${media.x === 'center' ? 'selected' : ''}>وسط</option><option value="right" ${media.x === 'right' ? 'selected' : ''}>يمين</option></select></div><div class="studio-field"><label for="media_position_y">الموضع الرأسي</label><select class="studio-select" id="media_position_y" name="media_position_y" data-media-control><option value="top" ${media.y === 'top' ? 'selected' : ''}>أعلى</option><option value="center" ${media.y === 'center' ? 'selected' : ''}>منتصف</option><option value="bottom" ${media.y === 'bottom' ? 'selected' : ''}>أسفل</option></select></div><div class="studio-field"><label for="media_scale">درجة التكبير <output data-media-scale-output>${media.scale.toFixed(2)}</output></label><input class="studio-range" id="media_scale" name="media_scale" data-media-control type="range" min="0.40" max="1.15" step="0.01" value="${media.scale}"></div><div class="studio-field studio-field--wide"><label class="studio-switch"><input name="angled_edge" type="checkbox" data-media-control ${media.angled ? 'checked' : ''}> تفعيل الحافة المائلة في صفحة المشروع</label></div></div>`;
}

function coverDropzone(project) {
  const preview = project.cover_image_url
    ? `<img class="studio-dropzone__preview" src="${esc(project.cover_image_url)}" alt="صورة الغلاف الحالية">`
    : '<div class="studio-dropzone__empty">لا توجد صورة غلاف بعد</div>';
  return `<div class="studio-dropzone" data-cover-dropzone><div class="studio-dropzone__inner" data-cover-target>${preview}<div class="studio-dropzone__overlay" data-cover-overlay><span>اسحب الصورة هنا أو اخترها من جهازك</span></div></div><input class="studio-dropzone__input" id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml" data-cover-input hidden><div class="studio-dropzone__actions"><button type="button" class="studio-button studio-button--quiet" data-cover-pick>اختيار صورة</button>${project.cover_image_url ? '<button type="button" class="studio-button studio-button--quiet" data-cover-replace>استبدال الصورة</button><button type="button" class="studio-button studio-button--danger" data-cover-remove>حذف الصورة</button>' : ''}</div><p class="studio-help" data-cover-status>SVG أو JPEG أو PNG أو GIF أو WebP أو AVIF — مقاس موصى به 1920×1080، أدنى حد 1600×900، نسبة 16:9.</p><div class="studio-dropzone__progress" data-cover-progress hidden><div class="studio-dropzone__bar"></div></div></div>`;
}

function featureManager(project) {
  const features = Array.isArray(project.features) ? project.features : [];
  return `<div class="studio-features" data-features>${features.map((item, index) => featureItem(item, index)).join('')}</div><button type="button" class="studio-button studio-button--quiet studio-features__add" data-feature-add ${features.length >= 4 ? 'hidden' : ''}>إضافة ميزة</button><p class="studio-help">حتى ٤ مميزات تظهر في شريط صفحة المشروع. إذا لم تُضف مميزات لن يظهر الشريط.</p>`;
}

function featureItem(item = {}, index = 0) {
  const value = item || {};
  return `<article class="studio-feature-item" data-feature="${index}"><div class="studio-form-grid">${field(`feature_title_ar_${index}`, 'العنوان بالعربية', value.title_ar, { required: true })}${field(`feature_title_en_${index}`, 'العنوان بالإنجليزية', value.title_en, { required: true })}${field(`feature_desc_ar_${index}`, 'الوصف بالعربية', value.description_ar, { wide: true })}${field(`feature_desc_en_${index}`, 'الوصف بالإنجليزية', value.description_en, { wide: true })}${selectField(`feature_icon_${index}`, 'الأيقونة', value.icon || 'layers', FEATURE_ICONS)}</div><div class="studio-feature-item__actions"><button type="button" class="studio-icon-button" data-feature-up="${index}" aria-label="نقل للأعلى">أعلى</button><button type="button" class="studio-icon-button" data-feature-down="${index}" aria-label="نقل للأسفل">أسفل</button><button type="button" class="studio-icon-button studio-icon-button--danger" data-feature-remove="${index}" aria-label="حذف الميزة">حذف</button></div></article>`;
}

function galleryManager(project) {
  const items = Array.isArray(project.gallery_images) ? project.gallery_images : [];
  const captions = project.gallery_captions && typeof project.gallery_captions === 'object' ? project.gallery_captions : {};
  return `<div class="studio-gallery" data-gallery>${items.map((path, index) => galleryItem(path, captions[path], index)).join('')}</div><div class="studio-gallery__add"><input class="studio-dropzone__input" id="gallery" name="gallery" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml" multiple data-gallery-input hidden><button type="button" class="studio-button studio-button--quiet" data-gallery-pick>إضافة صور</button></div><p class="studio-help">ارفع صورًا إضافية. يمكنك إعادة الترتيب وإضافة وصف لكل صورة.</p>`;
}

function galleryItem(path, caption, index) {
  const url = path && /^https?:/.test(path) ? path : (path ? `/media/${encodeURIComponent(path).replace(/%2F/g, '/')}` : '');
  return `<article class="studio-gallery-item" data-gallery-item="${index}" data-path="${esc(path)}"><div class="studio-gallery-item__media">${url ? `<img src="${esc(url)}" alt="صورة المعرض">` : '<span>صورة</span>'}</div><input class="studio-input studio-input--ltr" type="text" data-gallery-caption="${esc(path)}" value="${esc(caption || '')}" placeholder="وصف الصورة" aria-label="وصف الصورة"><div class="studio-gallery-item__actions"><button type="button" class="studio-icon-button" data-gallery-up="${index}" aria-label="نقل للأعلى">أعلى</button><button type="button" class="studio-icon-button" data-gallery-down="${index}" aria-label="نقل للأسفل">أسفل</button><button type="button" class="studio-icon-button studio-icon-button--danger" data-gallery-remove="${index}" aria-label="حذف الصورة">حذف</button></div></article>`;
}

function livePreviewPane(project) {
  return `<section class="studio-form-section studio-preview-section"><h2 class="studio-form-section__heading">معاينة صفحة المشروع</h2><p class="studio-form-section__hint">معاينة حية تتحدث مباشرة عند تغيير الصورة والعنوان والتصنيف والوصف وإعدادات العرض والمميزات.</p><div class="studio-preview-meta"><button type="button" class="studio-button studio-button--quiet" data-preview-mode="desktop" aria-pressed="true">معاينة سطح المكتب</button><button type="button" class="studio-button studio-button--quiet" data-preview-mode="mobile" aria-pressed="false">معاينة الجوال</button></div><div class="studio-live-preview" data-live-preview data-live-mode="desktop"><div class="studio-live-preview__frame" data-live-frame></div></div></section>`;
}

function projectForm(project) {
  const basic = `<div class="studio-form-grid">${field('title_ar', 'اسم المشروع بالعربية', project.title_ar, { required: true })}${field('title_en', 'اسم المشروع بالإنجليزية', project.title_en, { required: true })}${field('category_ar', 'التصنيف بالعربية', project.category_ar, { required: true })}${field('category_en', 'التصنيف بالإنجليزية', project.category_en, { required: true })}${field('slug', 'الرابط المختصر', project.slug, { required: true, help: 'حروف إنجليزية صغيرة وأرقام وشرطات فقط.' })}${field('sort_order', 'ترتيب الظهور', project.sort_order, { type: 'number' })}</div>`;
  const media = `<div class="studio-media-section">${coverDropzone(project)}<div class="studio-media-controls" data-media-controls-wrap>${mediaControls(project)}</div></div>`;
  const features = featureManager(project);
  const descriptions = `<div class="studio-form-grid">${field('short_description_ar', 'الوصف المختصر بالعربية', project.short_description_ar, { type: 'textarea', required: true, wide: true })}${field('short_description_en', 'الوصف المختصر بالإنجليزية', project.short_description_en, { type: 'textarea', required: true, wide: true })}${field('long_description_ar', 'نبذة عن المشروع بالعربية', project.long_description_ar, { type: 'textarea', wide: true, rows: 5 })}${field('long_description_en', 'نبذة عن المشروع بالإنجليزية', project.long_description_en, { type: 'textarea', wide: true, rows: 5 })}${field('challenge_ar', 'المشكلة بالعربية', project.challenge_ar, { type: 'textarea', wide: true, rows: 3 })}${field('challenge_en', 'المشكلة بالإنجليزية', project.challenge_en, { type: 'textarea', wide: true, rows: 3 })}${field('solution_ar', 'الحل بالعربية', project.solution_ar, { type: 'textarea', wide: true, rows: 3 })}${field('solution_en', 'الحل بالإنجليزية', project.solution_en, { type: 'textarea', wide: true, rows: 3 })}${field('main_features', 'المميزات الرئيسية', (project.main_features || []).join('\n'), { type: 'textarea', wide: true, rows: 4, help: 'كل ميزة في سطر مستقل.' })}${field('development_notes_ar', 'ملاحظات التطوير بالعربية', project.development_notes_ar, { type: 'textarea', wide: true, rows: 3 })}${field('development_notes_en', 'ملاحظات التطوير بالإنجليزية', project.development_notes_en, { type: 'textarea', wide: true, rows: 3 })}${field('limitations_ar', 'القيود الحالية بالعربية', project.limitations_ar, { type: 'textarea', wide: true, rows: 3 })}${field('limitations_en', 'القيود الحالية بالإنجليزية', project.limitations_en, { type: 'textarea', wide: true, rows: 3 })}${field('next_steps_ar', 'الخطوات القادمة بالعربية', project.next_steps_ar, { type: 'textarea', wide: true, rows: 3 })}${field('next_steps_en', 'الخطوات القادمة بالإنجليزية', project.next_steps_en, { type: 'textarea', wide: true, rows: 3 })}</div>`;
  const info = `<div class="studio-form-grid">${field('project_type', 'نوع المشروع', project.project_type)}${field('project_role', 'دوري في المشروع', project.project_role)}${field('project_year', 'السنة', project.project_year)}${field('project_duration', 'مدة التنفيذ', project.project_duration)}${field('project_platform', 'المنصة', project.project_platform)}${field('project_status_label', 'حالة المشروع', project.project_status_label)}</div>`;
  const links = `<div class="studio-form-grid">${field('tech_stack', 'التقنيات المستخدمة', (project.tech_stack || []).join(', '), { wide: true, help: 'افصل بين التقنيات بفاصلة.' })}${field('project_url', 'رابط المشروع', project.project_url, { type: 'url' })}${field('github_url', 'رابط GitHub', project.github_url, { type: 'url' })}${field('additional_url', 'رابط إضافي', project.additional_url, { type: 'url' })}</div>`;
  const publishing = `<div class="studio-form-grid"><div class="studio-field"><label for="status">حالة المشروع</label><select class="studio-select" id="status" name="status">${['draft', 'published', 'private', 'development', 'archived'].map((status) => `<option value="${status}" ${project.status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></div><div class="studio-field"><label>إظهار المشروع</label><div class="studio-switch-group"><label class="studio-switch"><input name="visible" type="checkbox" ${project.visible ? 'checked' : ''}> ظاهر في الموقع العام</label><label class="studio-switch"><input name="featured" type="checkbox" ${project.featured ? 'checked' : ''}> تمييز المشروع</label></div></div></div>`;
  const actions = `<div class="studio-form-actions"><a class="studio-button studio-button--quiet" href="/studio/projects/" data-cancel>إلغاء</a><button class="studio-button studio-button--quiet" type="submit" data-intent="draft">حفظ كمسودة</button><button class="studio-button studio-button--quiet" type="button" data-intent="preview" data-preview-button>معاينة</button><button class="studio-button" type="submit" data-intent="publish">نشر المشروع</button></div>`;
  return `<form class="studio-form" data-project-form novalidate>${formSection('المعلومات الأساسية', basic)}${formSection('الصورة الرئيسية', media, 'هذه الصورة ستظهر في أعلى صفحة المشروع وفي معاينة معرض الأعمال.')}${formSection('شريط المميزات', features, '٠ إلى ٤ مميزات تظهر كشريط عائم أسفل البطل.')}${formSection('وصف المشروع', descriptions)}${formSection('معلومات المشروع', info)}${formSection('التقنيات والروابط', links)}${formSection('معرض الصور', galleryManager(project))}${formSection('إعدادات العرض', mediaControls(project) + '<p class="studio-help">تتحكم هذه الإعدادات في طريقة ظهور الصورة في صفحة المشروع، وتبقى السلايدر كما هي.</p>', 'تُحفظ هذه الإعدادات مع المشروع.')}${formSection('إعدادات النشر', publishing)}${livePreviewPane(project)}${formSection('إجراءات الحفظ', actions)}</form>`;
}

async function renderProjectEditor(id) {
  const project = id ? projects.find((item) => item.id === id) : blankProject();
  if (!project) { shell('المشروع غير موجود', 'هذا المشروع غير متاح.', '<a class="studio-button" href="/studio/projects/">العودة إلى المشاريع</a>', 'projects'); return; }
  if (new URLSearchParams(location.search).get('preview') === '1') return renderPrivatePreview(project);
  shell(id ? 'تعديل المشروع' : 'إضافة مشروع', id ? 'حدّث المحتوى والوسائط وإعدادات النشر.' : 'أنشئ مشروعًا جديدًا لمعرض الأعمال.', projectForm(project), id ? 'projects' : 'new');
  const form = document.querySelector('[data-project-form]');
  bindCoverDropzone(form, project);
  bindFeatureManager(form, project);
  bindGalleryManager(form, project);
  form.addEventListener('input', () => { formDirty = true; updateLivePreview(form, project); });
  form.addEventListener('change', () => { formDirty = true; updateLivePreview(form, project); });
  form.querySelectorAll('[data-media-control]').forEach((control) => {
    control.addEventListener('input', () => updateLivePreview(form, project));
    control.addEventListener('change', () => updateLivePreview(form, project));
  });
  form.media_type.addEventListener('change', () => {
    if (form.media_type.value === 'logo') { form.media_fit.value = 'contain'; form.media_scale.value = '.68'; }
    updateLivePreview(form, project);
  });
  form.querySelectorAll('[data-intent]').forEach((button) => button.addEventListener('click', () => { form.dataset.intent = button.dataset.intent; }));
  form.querySelector('[data-preview-button]')?.addEventListener('click', (event) => { event.preventDefault(); updateLivePreview(form, project); form.dataset.intent = 'preview'; form.requestSubmit(); });
  form.querySelector('[data-cancel]')?.addEventListener('click', (event) => { if (formDirty && !confirm('توجد تغييرات غير محفوظة. هل تريد المغادرة؟')) { event.preventDefault(); } });
  form.addEventListener('submit', (event) => { event.preventDefault(); const intent = form.dataset.intent || 'draft'; if (intent === 'preview') { renderPrivatePreview(readFormProject(form, project)); return; } saveProject(project, form, intent); });
  updateLivePreview(form, project);
}

function bindCoverDropzone(form, project) {
  const zone = form.querySelector('[data-cover-dropzone]');
  if (!zone) return;
  const input = zone.querySelector('[data-cover-input]');
  const target = zone.querySelector('[data-cover-target]');
  const overlay = zone.querySelector('[data-cover-overlay]');
  const pick = zone.querySelector('[data-cover-pick]');
  const replace = zone.querySelector('[data-cover-replace]');
  const remove = zone.querySelector('[data-cover-remove]');
  const status = zone.querySelector('[data-cover-status]');
  const progress = zone.querySelector('[data-cover-progress]');
  const openPicker = () => input.click();
  pick?.addEventListener('click', openPicker);
  replace?.addEventListener('click', openPicker);
  remove?.addEventListener('click', () => { project.cover_image_url = ''; project.cover_image_path = ''; input.value = ''; mediaPreviewUrl && URL.revokeObjectURL(mediaPreviewUrl); mediaPreviewUrl = ''; renderCoverPreview(target, '', project); formDirty = true; updateLivePreview(form, project); });
  ['dragenter', 'dragover'].forEach((event) => target.addEventListener(event, (e) => { e.preventDefault(); target.classList.add('is-dragging'); }));
  ['dragleave', 'drop'].forEach((event) => target.addEventListener(event, (e) => { e.preventDefault(); target.classList.remove('is-dragging'); }));
  target.addEventListener('drop', (e) => { const file = e.dataTransfer.files?.[0]; if (file) setCoverFile(file, project, form); });
  input.addEventListener('change', () => { const file = input.files?.[0]; if (file) setCoverFile(file, project, form); });
  function setCoverFile(file, project, form) {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'].includes(file.type)) { status.textContent = 'تعذر رفع الصورة: استخدم SVG أو JPEG أو PNG أو GIF أو WebP أو AVIF.'; status.dataset.error = '1'; return; }
    if (file.size > 10 * 1024 * 1024) { status.textContent = 'تعذر رفع الصورة: الحجم يجب ألا يتجاوز ١٠ ميغابايت.'; status.dataset.error = '1'; return; }
    status.dataset.error = '0'; status.textContent = `الصورة جاهزة: ${file.name}. سيتم رفعها عند الحفظ.`;
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    mediaPreviewUrl = URL.createObjectURL(file);
    renderCoverPreview(target, mediaPreviewUrl, project);
    formDirty = true; updateLivePreview(form, project);
  }
}

function renderCoverPreview(target, url, project) {
  const html = url ? `<img class="studio-dropzone__preview" src="${esc(url)}" alt="صورة الغلاف">` : (project.cover_image_url ? `<img class="studio-dropzone__preview" src="${esc(project.cover_image_url)}" alt="صورة الغلاف الحالية">` : '<div class="studio-dropzone__empty">لا توجد صورة غلاف بعد</div>');
  target.innerHTML = `${html}<div class="studio-dropzone__overlay"><span>اسحب الصورة هنا أو اخترها من جهازك</span></div>`;
}

function bindFeatureManager(form, project) {
  const container = form.querySelector('[data-features]');
  const addBtn = form.querySelector('[data-feature-add]');
  if (!container || !addBtn) return;
  const refresh = () => { addBtn.hidden = container.children.length >= 4; };
  addBtn.addEventListener('click', () => {
    if (container.children.length >= 4) return;
    project.features = collectFeatures(form, project);
    project.features.push({ title_ar: '', title_en: '', description_ar: '', description_en: '', icon: 'layers' });
    container.innerHTML = project.features.map((item, index) => featureItem(item, index)).join('');
    formDirty = true; refresh(); updateLivePreview(form, project);
  });
  container.addEventListener('click', (event) => {
    const up = event.target.closest('[data-feature-up]'); const down = event.target.closest('[data-feature-down]'); const remove = event.target.closest('[data-feature-remove]');
    project.features = collectFeatures(form, project);
    if (remove) { const idx = Number(remove.dataset.featureRemove); project.features.splice(idx, 1); }
    else if (up) { const idx = Number(up.dataset.featureUp); if (idx > 0) [project.features[idx - 1], project.features[idx]] = [project.features[idx], project.features[idx - 1]]; }
    else if (down) { const idx = Number(down.dataset.featureDown); if (idx < project.features.length - 1) [project.features[idx + 1], project.features[idx]] = [project.features[idx], project.features[idx + 1]]; }
    else return;
    container.innerHTML = project.features.map((item, index) => featureItem(item, index)).join('');
    formDirty = true; refresh(); updateLivePreview(form, project);
  });
  container.addEventListener('input', () => updateLivePreview(form, project));
  refresh();
}

function collectFeatures(form, project) {
  const items = [];
  form.querySelectorAll('[data-feature]').forEach((node) => {
    const index = Number(node.dataset.feature);
    const titleAr = form.querySelector(`#feature_title_ar_${index}`)?.value || '';
    const titleEn = form.querySelector(`#feature_title_en_${index}`)?.value || '';
    if (!titleAr && !titleEn) return;
    items.push({
      title_ar: titleAr, title_en: titleEn,
      description_ar: form.querySelector(`#feature_desc_ar_${index}`)?.value || '',
      description_en: form.querySelector(`#feature_desc_en_${index}`)?.value || '',
      icon: form.querySelector(`#feature_icon_${index}`)?.value || 'layers'
    });
  });
  return items.slice(0, 4);
}

function bindGalleryManager(form, project) {
  const container = form.querySelector('[data-gallery]');
  const input = form.querySelector('[data-gallery-input]');
  const pick = form.querySelector('[data-gallery-pick]');
  if (!container) return;
  pick?.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const files = [...(input.files || [])];
    input.value = '';
    for (const file of files) {
      try {
        const path = file.name ? `projects/${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}` : `projects/${crypto.randomUUID()}.png`;
        const { error } = await supabase.storage.from('project-media').upload(path, file, { upsert: false, contentType: file.type });
        if (error) { notice(`تعذر رفع ${file.name}: ${error.message}`, 'error'); continue; }
        project.gallery_images = [...(project.gallery_images || []), path];
        formDirty = true;
      } catch (error) { notice(error.message || 'تعذر رفع الصورة.', 'error'); }
    }
    container.innerHTML = (project.gallery_images || []).map((path, index) => galleryItem(path, (project.gallery_captions || {})[path], index)).join('');
    rebindGalleryActions(form, project);
    updateLivePreview(form, project);
  });
  rebindGalleryActions(form, project);
}

function rebindGalleryActions(form, project) {
  const container = form.querySelector('[data-gallery]');
  if (!container) return;
  container.querySelectorAll('[data-gallery-caption]').forEach((input) => input.addEventListener('input', () => { project.gallery_captions = { ...(project.gallery_captions || {}), [input.dataset.galleryCaption]: input.value }; formDirty = true; }));
  container.querySelectorAll('[data-gallery-up]').forEach((btn) => btn.addEventListener('click', () => moveGallery(form, project, Number(btn.dataset.galleryUp), -1)));
  container.querySelectorAll('[data-gallery-down]').forEach((btn) => btn.addEventListener('click', () => moveGallery(form, project, Number(btn.dataset.galleryDown), 1)));
  container.querySelectorAll('[data-gallery-remove]').forEach((btn) => btn.addEventListener('click', () => {
    const index = Number(btn.dataset.galleryRemove);
    const path = project.gallery_images[index];
    project.gallery_images = project.gallery_images.filter((_, i) => i !== index);
    if (path && project.gallery_captions) { const captions = { ...project.gallery_captions }; delete captions[path]; project.gallery_captions = captions; }
    container.innerHTML = project.gallery_images.map((p, i) => galleryItem(p, (project.gallery_captions || {})[p], i)).join('');
    rebindGalleryActions(form, project); formDirty = true; updateLivePreview(form, project);
  }));
}

function moveGallery(form, project, index, dir) {
  const target = index + dir;
  if (index < 0 || target < 0 || target >= project.gallery_images.length) return;
  const items = [...project.gallery_images];
  [items[index], items[target]] = [items[target], items[index]];
  project.gallery_images = items;
  const container = form.querySelector('[data-gallery]');
  container.innerHTML = project.gallery_images.map((p, i) => galleryItem(p, (project.gallery_captions || {})[p], i)).join('');
  rebindGalleryActions(form, project); formDirty = true; updateLivePreview(form, project);
}

function renderPrivatePreview(project) {
  const cover = project.cover_image_url ? `<img src="${esc(project.cover_image_url)}" alt="${esc(project.title_ar || project.title_en || project.slug)}">` : '<div class="studio-preview__placeholder">لم تُحدد صورة غلاف</div>';
  shell('معاينة خاصة', 'تظهر هذه المعاينة داخل الاستديو فقط ولم يتم نشرها.', `<section class="studio-card studio-preview"><p class="studio-help">${esc(project.category_ar || project.category_en || '')}</p><h2>${esc(project.title_ar || project.title_en || project.slug)}</h2><p>${esc(project.short_description_ar || project.short_description_en || '')}</p><div class="studio-preview__laptop">${cover}</div></section><div class="studio-actions" style="margin-top:20px"><a class="studio-button" href="/studio/projects/${project.id || ''}">العودة إلى المحرر</a></div>`, 'projects');
}

function previewMediaMarkup(src, settings, title, context) {
  const alignment = { left: 'start', center: 'center', right: 'end', top: 'start', bottom: 'end' };
  const style = `--studio-media-scale:${settings.scale};--studio-media-x:${alignment[settings.x]};--studio-media-y:${alignment[settings.y]};`;
  const media = src ? `<img class="studio-project-media studio-project-media--${settings.type} studio-project-media--${settings.fit}" src="${esc(src)}" alt="معاينة ${esc(title)}">` : `<div class="studio-project-media__fallback"><strong>${esc(title)}</strong><span>لم تتم إضافة صورة للمشروع</span></div>`;
  return `<div class="studio-project-media-surface studio-project-media-surface--${context}" style="${style}">${media}</div>`;
}

function livePreviewHTML(form, project) {
  const live = readFormProject(form, project, true);
  const settings = mediaSettings(live);
  const coverSrc = mediaPreviewUrl || project.cover_image_url || (project.gallery_images?.[0] ? (project.gallery_images[0].startsWith('http') ? project.gallery_images[0] : `/media/${project.gallery_images[0]}`) : '');
  const angled = form.angled_edge?.checked !== false;
  const title = live.title_ar || live.title_en || 'مشروع بلا عنوان';
  const category = live.category_ar || live.category_en || '';
  const summary = live.short_description_ar || live.short_description_en || '';
  const features = (live.features || []).filter((f) => f.title_en || f.title_ar).slice(0, 4);
  const infoRows = [
    live.project_type && { label: 'Project type', value: esc(live.project_type) },
    live.project_role && { label: 'My role', value: esc(live.project_role) },
    live.project_year && { label: 'Year', value: esc(live.project_year) },
    (live.tech_stack?.length) && { label: 'Technologies', value: `<div class="lp-info-tags">${live.tech_stack.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`, raw: true }
  ].filter(Boolean);
  const visual = `<div class="lp-visual${angled ? ' is-angled' : ''}"><div class="lp-visual-frame">${previewMediaMarkup(coverSrc, settings, title, 'detail')}</div><div class="lp-blend"></div></div>`;
  const actions = live.project_url ? `<div class="lp-actions"><span class="lp-btn">Open live project ↗</span></div>` : '';
  const strip = features.length ? `<div class="lp-strip">${features.map((f) => `<div class="lp-strip-item"><span>${esc(f.title_en || f.title_ar)}</span><small>${esc(f.description_en || f.description_ar || '')}</small></div>`).join('')}</div>` : '';
  const info = infoRows.length ? `<aside class="lp-info">${infoRows.map((r) => `<div><p>${esc(r.label)}</p>${r.raw ? r.value : `<strong>${r.value}</strong>`}</div>`).join('')}</aside>` : '';
  return `<div class="lp-page ${livePreviewMode === 'mobile' ? 'is-mobile' : ''}"><div class="lp-hero"><div class="lp-hero-left"><span class="lp-category">${esc(category)}</span><strong class="lp-title">${esc(title)}</strong><p class="lp-summary">${esc(summary)}</p>${actions}</div><div class="lp-hero-right">${visual}</div></div>${strip ? `<div class="lp-strip-wrap">${strip}</div>` : ''}<div class="lp-overview"><div class="lp-overview-main"><span class="lp-eyebrow">OVERVIEW</span><strong>About the project</strong><p>${esc(live.long_description_ar || live.long_description_en || summary)}</p></div>${info}</div></div></div>`;
}

function updateLivePreview(form, project) {
  const pane = form.querySelector('[data-live-preview]');
  if (!pane) return;
  const frame = pane.querySelector('[data-live-frame]');
  frame.innerHTML = livePreviewHTML(form, project);
  pane.dataset.liveMode = livePreviewMode;
  form.querySelector('[data-preview-mode="desktop"]')?.setAttribute('aria-pressed', String(livePreviewMode === 'desktop'));
  form.querySelector('[data-preview-mode="mobile"]')?.setAttribute('aria-pressed', String(livePreviewMode === 'mobile'));
}

function readFormProject(form, existing, partial = false) {
  const settings = mediaSettings({
    media_type: form.media_type?.value, media_fit: form.media_fit?.value, media_scale: form.media_scale?.value,
    media_position_x: form.media_position_x?.value, media_position_y: form.media_position_y?.value, angled_edge: form.angled_edge?.checked
  });
  const data = {
    title_en: (form.title_en?.value || '').trim(),
    title_ar: (form.title_ar?.value || '').trim(),
    category_en: (form.category_en?.value || '').trim(),
    category_ar: (form.category_ar?.value || '').trim(),
    short_description_en: (form.short_description_en?.value || '').trim(),
    short_description_ar: (form.short_description_ar?.value || '').trim(),
    long_description_en: (form.long_description_en?.value || '').trim(),
    long_description_ar: (form.long_description_ar?.value || '').trim(),
    challenge_ar: form.challenge_ar?.value || '', challenge_en: form.challenge_en?.value || '',
    solution_ar: form.solution_ar?.value || '', solution_en: form.solution_en?.value || '',
    development_notes_ar: form.development_notes_ar?.value || '', development_notes_en: form.development_notes_en?.value || '',
    limitations_ar: form.limitations_ar?.value || '', limitations_en: form.limitations_en?.value || '',
    next_steps_ar: form.next_steps_ar?.value || '', next_steps_en: form.next_steps_en?.value || '',
    tech_stack: (form.tech_stack?.value || '').split(/[,،\n]/).map((t) => t.trim()).filter(Boolean),
    main_features: (form.main_features?.value || '').split('\n').map((t) => t.trim()).filter(Boolean),
    project_url: (form.project_url?.value || '').trim() || null,
    github_url: (form.github_url?.value || '').trim() || null,
    additional_url: (form.additional_url?.value || '').trim() || null,
    media_type: settings.type, media_fit: settings.fit, media_scale: settings.scale,
    media_position_x: settings.x, media_position_y: settings.y, angled_edge: settings.angled,
    project_type: form.project_type?.value || '', project_role: form.project_role?.value || '',
    project_year: form.project_year?.value || '', project_duration: form.project_duration?.value || '',
    project_platform: form.project_platform?.value || '', project_status_label: form.project_status_label?.value || '',
    features: collectFeatures(form, existing),
    gallery_images: existing.gallery_images || [], gallery_captions: existing.gallery_captions || {},
    cover_image_url: existing.cover_image_url || null, cover_image_path: existing.cover_image_path || null,
    status: form.status?.value || 'draft', visible: form.visible?.checked ?? true, featured: form.featured?.checked ?? false
  };
  if (partial) return data;
  data.slug = (form.slug?.value || '').trim().toLowerCase();
  data.sort_order = Number(form.sort_order?.value || 0);
  return data;
}

function readProject(form, existing) {
  const data = readFormProject(form, existing);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new Error('استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات مفردة في المعرّف.');
  if (!isSafeUrl(data.project_url) || !isSafeUrl(data.github_url) || !isSafeUrl(data.additional_url)) throw new Error('يجب أن تستخدم روابط المشروع وGitHub والرابط الإضافي بروتوكول http أو https.');
  return data;
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

async function saveProject(existing, form, intent) {
  try {
    const payload = readProject(form, existing);
    if (intent === 'draft') payload.status = 'draft';
    if (intent === 'publish') payload.status = 'published';
    const cover = form.cover?.files?.[0];
    if (cover) { payload.cover_image_path = await uploadFile(cover); payload.cover_image_url = null; }
    const request = existing.id ? supabase.from('projects').update(payload).eq('id', existing.id).select().single() : supabase.from('projects').insert(payload).select().single();
    const { data, error } = await request;
    if (error) throw error;
    formDirty = false;
    notice(intent === 'publish' ? 'تم نشر المشروع.' : 'تم حفظ المشروع.', 'success');
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

document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-preview-mode]');
  if (!btn) return;
  livePreviewMode = btn.dataset.previewMode;
  const form = document.querySelector('[data-project-form]');
  if (form) updateLivePreview(form, projects.find((p) => p.id === form.dataset.id) || blankProject());
});

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