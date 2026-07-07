create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Agent', 'VR', 'PC Game', 'Robot', 'Web')),
  title text not null,
  description text not null default '',
  image text not null default '',
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists slug text,
  add column if not exists year text,
  add column if not exists detail_images text[] not null default '{}';

update public.projects
set slug = lower(regexp_replace(coalesce(title, ''), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

create unique index if not exists projects_slug_uidx
  on public.projects (slug);

create index if not exists projects_category_sort_idx
  on public.projects (category, sort_order, title);

comment on column public.projects.slug is
  'Stable project identifier used by the frontend archive UI, e.g. guokebang or oriental-fantasy.';

comment on column public.projects.description is
  'Archive summary / long description shown in project detail.';

comment on column public.projects.image is
  'Archive cover image / category thumbnail storage object path or external URL.';

comment on column public.projects.detail_images is
  'Ordered list of archive detail image storage object paths or external URLs shown inside project detail.';
