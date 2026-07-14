import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../public/studio.js', import.meta.url), 'utf8');
const migration = await readFile(new URL('../supabase/migrations/202607140001_portfolio_studio.sql', import.meta.url), 'utf8');

test('slider uses a synchronized six-second timeline and dynamic project count', () => {
  assert.match(app, /const duration = 6000/);
  assert.match(app, /WORK_PROJECTS\.length/);
  assert.doesNotMatch(app, /WORK_PROJECTS\.slice/);
  assert.match(app, /visibilitychange/);
  assert.match(app, /pointerdown/);
});

test('Studio protects management with the approved account', () => {
  assert.match(studio, /abdulrahmanalmushajari@gmail\.com/);
  assert.match(studio, /auth\.getSession/);
  assert.match(studio, /auth\.signInWithPassword/);
});

test('database migration protects projects and private media with RLS', () => {
  assert.match(migration, /enable row level security/);
  assert.match(migration, /published projects are public/);
  assert.match(migration, /portfolio owner manages projects/);
  assert.match(migration, /project-media', 'project-media', false/);
});
