alter table projects
  add column if not exists features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  add column if not exists main_features jsonb not null default '[]'::jsonb check (jsonb_typeof(main_features) = 'array'),
  add column if not exists project_type text not null default '',
  add column if not exists project_role text not null default '',
  add column if not exists project_year text not null default '',
  add column if not exists project_duration text not null default '',
  add column if not exists project_platform text not null default '',
  add column if not exists project_status_label text not null default '',
  add column if not exists additional_url text,
  add column if not exists challenge_ar text not null default '',
  add column if not exists challenge_en text not null default '',
  add column if not exists solution_ar text not null default '',
  add column if not exists solution_en text not null default '',
  add column if not exists development_notes_ar text not null default '',
  add column if not exists development_notes_en text not null default '',
  add column if not exists limitations_ar text not null default '',
  add column if not exists limitations_en text not null default '',
  add column if not exists next_steps_ar text not null default '',
  add column if not exists next_steps_en text not null default '',
  add column if not exists angled_edge boolean not null default true,
  add column if not exists gallery_captions jsonb not null default '{}'::jsonb check (jsonb_typeof(gallery_captions) = 'object');

do $$
begin
  if exists (select 1 from information_schema.check_constraints where constraint_name = 'projects_media_type_check') then
    alter table projects drop constraint projects_media_type_check;
  end if;
end $$;

alter table projects
  add constraint projects_media_type_check check (media_type in ('cover','logo','screenshot','poster'));

create index if not exists projects_public_features_idx on projects (status, visible, sort_order);