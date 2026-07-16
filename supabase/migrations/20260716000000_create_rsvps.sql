create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(guest_name) between 1 and 120),
  photo_path text not null,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

revoke all on table public.rsvps from anon, authenticated;
grant all on table public.rsvps to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rsvp-selfies',
  'rsvp-selfies',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
