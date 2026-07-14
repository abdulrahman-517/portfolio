create extension if not exists pgcrypto;

create table if not exists studio_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null default '', title_ar text not null default '',
  category_en text not null default '', category_ar text not null default '',
  short_description_en text not null default '', short_description_ar text not null default '',
  long_description_en text not null default '', long_description_ar text not null default '',
  tech_stack jsonb not null default '[]'::jsonb check (jsonb_typeof(tech_stack) = 'array'),
  project_url text, github_url text, cover_image_url text, cover_image_path text,
  gallery_images jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery_images) = 'array'),
  status text not null default 'draft' check (status in ('draft', 'published', 'private', 'development', 'archived')),
  featured boolean not null default false, visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz
);

create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); if new.status = 'published' and old.status is distinct from 'published' and new.published_at is null then new.published_at = now(); end if; return new; end; $$;
drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at before update on projects for each row execute function set_updated_at();
create index if not exists projects_public_order_idx on projects (status, visible, sort_order);
