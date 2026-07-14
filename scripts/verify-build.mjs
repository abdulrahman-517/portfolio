import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const required = [
  'public/index.html',
  'public/app.js',
  'public/studio.js',
  'public/studio/index.html',
  'public/studio/login/index.html',
  'public/studio/projects/index.html',
  'netlify/functions/public-config.mjs',
  'netlify/functions/public-projects.mjs',
  'supabase/migrations/202607140001_portfolio_studio.sql'
];

for (const file of required) await stat(resolve(root, file));

const publicFiles = await Promise.all(['public/app.js', 'public/studio.js', 'public/supabase-client.js'].map((file) => readFile(resolve(root, file), 'utf8')));
if (publicFiles.some((source) => source.includes('SUPABASE_SERVICE_ROLE_KEY'))) throw new Error('A server-only key reference was found in public source.');
if (publicFiles.some((source) => /javascript:void\(0\)|href=["']#["']/.test(source))) throw new Error('A placeholder public action was found.');

console.log('Production static checks passed.');
