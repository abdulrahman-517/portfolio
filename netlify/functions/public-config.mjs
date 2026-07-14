export default async () => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Studio is not configured.' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Cache-Control': 'public, max-age=300', 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ url, anonKey })
  };
};
