-- Applied to the birthday invitation project as migration 20260805210519.
create table if not exists public.birthday_game_settings (
  id text primary key check (id = 'birthday_game'),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.birthday_game_settings enable row level security;

revoke all on table public.birthday_game_settings from anon, authenticated;
grant all on table public.birthday_game_settings to service_role;

insert into public.birthday_game_settings (id, enabled)
values ('birthday_game', false)
on conflict (id) do nothing;
