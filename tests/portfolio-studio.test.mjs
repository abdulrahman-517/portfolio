import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../public/studio.js', import.meta.url), 'utf8');
const server = await readFile(new URL('../server/studio-server.mjs', import.meta.url), 'utf8');
const migration = await readFile(new URL('../server/migrations/001_portfolio_studio.sql', import.meta.url), 'utf8');
const mediaMigration = await readFile(new URL('../server/migrations/003_project_media_presentation.sql', import.meta.url), 'utf8');

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

test('project media uses one rendering model and Studio persists presentation controls', () => {
  assert.match(app, /function projectMedia\(project, context\)/);
  assert.match(app, /gallery_images\) \? project\.gallery_images\[0\]/);
  assert.match(app, /projectMedia\(project, 'slider'\)/);
  assert.match(app, /projectMedia\(project, context\)/);
  assert.doesNotMatch(app, /WORK_PLACEHOLDER|project-media-frame|laptop-screen__mark/);
  assert.match(studio, /media_type|media_fit|media_scale|media_position_x|media_position_y/);
  assert.match(studio, /معاينة السلايدر|معاينة صفحة المشروع/);
  assert.match(server, /mediaTypes|mediaFits|media_position_x/);
  assert.match(server, /image\/svg\+xml|image\/gif|safeSvg/);
  assert.match(studio, /image\/svg\+xml|image\/gif/);
  assert.match(mediaMigration, /media_type text not null default 'screenshot'/);
  assert.match(mediaMigration, /media_scale = 0\.68/);
});

test('local database migration provides project and owner tables', () => {
  assert.match(migration, /create table if not exists studio_users/);
  assert.match(migration, /create table if not exists projects/);
  assert.match(migration, /projects_public_order_idx/);
});
