let clientPromise;

export async function getSupabaseClient() {
  if (clientPromise) return clientPromise;
  clientPromise = (async () => {
    const response = await fetch('/.netlify/functions/public-config', { cache: 'no-store' });
    if (!response.ok) return null;
    const config = await response.json();
    if (!config.url || !config.anonKey) return null;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    return createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
  })();
  return clientPromise;
}
