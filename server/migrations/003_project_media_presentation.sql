alter table projects
  add column if not exists media_type text not null default 'screenshot' check (media_type in ('logo','screenshot','poster')),
  add column if not exists media_fit text not null default 'contain' check (media_fit in ('contain','cover')),
  add column if not exists media_scale numeric not null default 1 check (media_scale >= 0.40 and media_scale <= 1.15),
  add column if not exists media_position_x text not null default 'center' check (media_position_x in ('left','center','right')),
  add column if not exists media_position_y text not null default 'center' check (media_position_y in ('top','center','bottom'));

update projects
set media_type = 'logo',
    media_fit = 'contain',
    media_scale = 0.68,
    media_position_x = 'center',
    media_position_y = 'center'
where slug = 'car-dealership' or upper(title_en) = 'LOCK CAR';
