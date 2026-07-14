import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../public/studio.js', import.meta.url), 'utf8');
const migration = await readFile(new URL('../server/migrations/001_portfolio_studio.sql', import.meta.url), 'utf8');

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

test('local database migration provides project and owner tables', () => {
  assert.match(migration, /create table if not exists studio_users/);
  assert.match(migration, /create table if not exists projects/);
  assert.match(migration, /projects_public_order_idx/);
});
