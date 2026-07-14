const request = async (path, options = {}) => {
  const response = await fetch(path, { credentials: 'same-origin', headers: { Accept: 'application/json', ...(options.headers || {}) }, ...options });
  const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
  if (!response.ok) return { data: null, error: { message: body?.error || 'Request failed.' } };
  return { data: body, error: null };
};

class ProjectRequest {
  constructor(method, payload) { this.method = method; this.payload = payload; this.id = null; }
  eq(_, id) { this.id = id; return this; }
  order() { return this; }
  select() { return this; }
  single() { return this.execute(true); }
  then(resolve, reject) { return this.execute(false).then(resolve, reject); }
  async execute(single) {
    let path = '/api/projects';
    if (this.id) path += `/${encodeURIComponent(this.id)}`;
    const options = this.method === 'GET' ? {} : { method: this.method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.payload) };
    const result = await request(path, options);
    if (result.error) return result;
    const data = single ? result.data.project : (result.data.projects || result.data.project || result.data);
    return { data, error: null };
  }
}

export async function getSupabaseClient() {
  return {
    auth: {
      getSession: async () => { const result = await request('/api/auth/session'); return { data: { session: result.data?.user ? { user: result.data.user } : null }, error: result.error }; },
      getUser: async () => { const result = await request('/api/auth/session'); return { data: { user: result.data?.user || null }, error: result.error }; },
      signInWithPassword: async ({ email, password }) => { const result = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); return { error: result.error }; },
      signOut: async () => { const result = await request('/api/auth/logout', { method: 'POST' }); return { error: result.error }; }
    },
    from: () => ({ select: () => new ProjectRequest('GET'), insert: (payload) => new ProjectRequest('POST', payload), update: (payload) => new ProjectRequest('PATCH', payload), delete: () => new ProjectRequest('DELETE') }),
    storage: { from: () => ({
      upload: async (path, file) => { const result = await request(`/api/media?path=${encodeURIComponent(path)}`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); return { data: result.data, error: result.error }; },
      createSignedUrl: async (path) => ({ data: { signedUrl: `/media/${path}` }, error: null })
    }) }
  };
}
