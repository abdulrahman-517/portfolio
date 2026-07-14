import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.env.PORT || 3100);
const publicDir = resolve(process.env.PUBLIC_DIR || join(process.cwd(), 'public'));
const mimeTypes = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(body));
}

async function serveFile(response, filename) {
  try {
    const file = await stat(filename);
    if (!file.isFile()) return false;
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(filename).toLowerCase()] || 'application/octet-stream', 'Cache-Control': extname(filename) === '.html' ? 'no-cache' : 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' });
    createReadStream(filename).pipe(response);
    return true;
  } catch { return false; }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed.' });
  if (url.pathname === '/.netlify/functions/public-config') {
    const urlValue = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    return urlValue && anonKey ? sendJson(response, 200, { url: urlValue, anonKey }) : sendJson(response, 503, { error: 'Studio is not configured.' });
  }

  const pathname = decodeURIComponent(url.pathname);
  const candidate = normalize(join(publicDir, pathname === '/' ? 'studio/index.html' : pathname));
  if (!candidate.startsWith(publicDir)) return sendJson(response, 403, { error: 'Forbidden.' });
  if (existsSync(candidate) && await serveFile(response, candidate)) return;
  if (pathname.startsWith('/studio')) return serveFile(response, join(publicDir, 'studio', 'index.html'));
  return serveFile(response, join(publicDir, 'studio', 'index.html')) || sendJson(response, 404, { error: 'Not found.' });
});

server.listen(port, '127.0.0.1', () => console.log(`Portfolio Studio listening on ${port}`));
