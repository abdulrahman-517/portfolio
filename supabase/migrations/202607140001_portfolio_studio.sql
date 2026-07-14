create extension if not exists pgcrypto;

do $$ begin
  create type public.project_status as enum ('draft', 'published', 'private', 'development', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null default '',
  title_ar text not null default '',
  category_en text not null default '',
  category_ar text not null default '',
  short_description_en text not null default '',
  short_description_ar text not null default '',
  long_description_en text not null default '',
  long_description_ar text not null default '',
  tech_stack jsonb not null default '[]'::jsonb check (jsonb_typeof(tech_stack) = 'array'),
  project_url text,
  github_url text,
  cover_image_url text,
  cover_image_path text,
  gallery_images jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery_images) = 'array'),
  status public.project_status not null default 'draft',
  featured boolean not null default false,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create or replace function public.set_projects_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'published' and old.status is distinct from 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_projects_updated_at();

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_published_idx on public.projects (status) where status = 'published';
create index if not exists projects_visible_idx on public.projects (visible);
create index if not exists projects_featured_idx on public.projects (featured);
create index if not exists projects_sort_order_idx on public.projects (sort_order asc);

alter table public.projects enable row level security;

drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public"
on public.projects for select to anon, authenticated
using (status = 'published' and visible = true);

drop policy if exists "portfolio owner manages projects" on public.projects;
create policy "portfolio owner manages projects"
on public.projects for all to authenticated
using ((auth.jwt() ->> 'email') = 'abdulrahmanalmushajari@gmail.com')
with check ((auth.jwt() ->> 'email') = 'abdulrahmanalmushajari@gmail.com');

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', false)
on conflict (id) do update set public = false;

drop policy if exists "portfolio owner manages project media" on storage.objects;
create policy "portfolio owner manages project media"
on storage.objects for all to authenticated
using (bucket_id = 'project-media' and (auth.jwt() ->> 'email') = 'abdulrahmanalmushajari@gmail.com')
with check (bucket_id = 'project-media' and (auth.jwt() ->> 'email') = 'abdulrahmanalmushajari@gmail.com');
