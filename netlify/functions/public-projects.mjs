const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  body: JSON.stringify(body)
});

const safeExternalUrl = (value) => {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
};

const signPath = async (baseUrl, serviceKey, path) => {
  if (!path) return null;
  const objectPath = encodeURIComponent(path).replace(/%2F/g, '/');
  const response = await fetch(`${baseUrl}/storage/v1/object/sign/project-media/${objectPath}`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 3600 })
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.signedURL ? `${baseUrl}/storage/v1${data.signedURL}` : null;
};

export default async () => {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) return json(503, { error: 'Portfolio data is not configured.' });

  const fields = 'id,slug,title_en,title_ar,category_en,category_ar,short_description_en,short_description_ar,long_description_en,long_description_ar,tech_stack,project_url,github_url,cover_image_url,cover_image_path,gallery_images,featured,sort_order';
  const response = await fetch(`${baseUrl}/rest/v1/projects?select=${encodeURIComponent(fields)}&status=eq.published&visible=eq.true&order=sort_order.asc`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  if (!response.ok) return json(502, { error: 'Unable to load published projects.' });

  const projects = await response.json();
  const publicProjects = await Promise.all(projects.map(async (project) => ({
    ...project,
    project_url: safeExternalUrl(project.project_url),
    github_url: safeExternalUrl(project.github_url),
    cover_image_url: safeExternalUrl(project.cover_image_url) || await signPath(baseUrl, serviceKey, project.cover_image_path),
    gallery_images: await Promise.all((Array.isArray(project.gallery_images) ? project.gallery_images : []).map((path) => signPath(baseUrl, serviceKey, path)))
  })));

  return json(200, { projects: publicProjects }, { 'Cache-Control': 'public, max-age=60, s-maxage=60' });
};
