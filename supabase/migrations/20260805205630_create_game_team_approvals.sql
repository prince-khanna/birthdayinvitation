-- Applied to the birthday invitation project as migration 20260805205630.
create table if not exists public.game_team_approvals (
  team_slug text primary key,
  team_name text not null,
  riddle_intro text,
  riddle_clues jsonb not null check (jsonb_typeof(riddle_clues) = 'array'),
  riddle_question text not null,
  riddle_answer text not null,
  approved boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.game_team_approvals enable row level security;

revoke all on table public.game_team_approvals from anon, authenticated;
grant all on table public.game_team_approvals to service_role;

insert into public.game_team_approvals (
  team_slug,
  team_name,
  riddle_intro,
  riddle_clues,
  riddle_question,
  riddle_answer
)
values
  (
    'baby-olympics',
    'The Baby Olympics',
    null,
    '["I have a trunk, but no suitcase.", "I have branches, but no bank accounts.", "I have leaves, but I never take a holiday.", "Birds visit me without making appointments."]'::jsonb,
    'Who am I?',
    'tree'
  ),
  (
    'precious-balloon',
    'Don''t Let It Drop!',
    'Four friends describe the place you are looking for.',
    '["Bird: My home can be up there.", "Squirrel: I can climb it.", "Baby: I can sit underneath it.", "Apple: Sometimes I grow on it."]'::jsonb,
    'They are all talking about the same thing. What is it?',
    'tree'
  ),
  (
    'animal-madness',
    'Animal Madness',
    null,
    '["Your previous animal might have had a trunk.", "But I am looking for something else that can also have a trunk.", "It cannot walk.", "It drinks water but has no mouth.", "Sometimes you can eat what grows from it."]'::jsonb,
    'What am I?',
    'tree'
  ),
  (
    'copy-anvika',
    'Recreate Baby Anvika',
    null,
    '["I was here before today''s birthday party.", "I will probably still be here after everyone goes home.", "I do not eat birthday cake or need an invitation.", "I spend every day outside.", "If it is sunny, I might give your family some shade."]'::jsonb,
    'Where should you look?',
    'tree'
  ),
  (
    'terrible-karaoke',
    'Terrible Birthday Singers',
    'Someone has hidden four clues.',
    '["ROOTS", "TRUNK", "BRANCHES", "LEAVES"]'::jsonb,
    'Find one thing that owns all four. What is it?',
    'tree'
  ),
  (
    'baby-charades',
    'Baby Charades',
    'Finish these four words.',
    '["T _ U N K", "R _ O T S", "_ R A N C H", "L _ A V E S"]'::jsonb,
    'What one thing connects all four completed words?',
    'tree'
  ),
  (
    'dont-laugh',
    'Don''t Laugh',
    'Which one does not belong?',
    '["ROOT", "LEAF", "BRANCH", "DIAPER", "TRUNK"]'::jsonb,
    'Cross out the impostor. What one thing has all four remaining things?',
    'tree'
  ),
  (
    'baby-brain-test',
    'The Memory Challenge',
    null,
    '["I start very small.", "Then I grow.", "I drink water and love sunlight.", "Eventually I may become much taller than Anvika - and all of you.", "I have roots below and leaves above."]'::jsonb,
    'What will I become?',
    'tree'
  ),
  (
    'freeze-dance',
    'Freeze Dance',
    'Solve these three tiny riddles.',
    '["Who lives above me? Birds.", "Who runs up me? Squirrels.", "Who enjoys sitting below me on a sunny day? Families."]'::jsonb,
    'Birds above, squirrels climbing, families below. What are you all standing around?',
    'tree'
  ),
  (
    'anvika-says',
    'Anvika Says',
    null,
    '["I am not a person, but I have arms.", "I am not an elephant, but I have a trunk.", "I do not drink from a bottle, but I need water.", "I do not have hair, but my top can be green.", "I cannot move, but I continue to grow."]'::jsonb,
    'Who am I?',
    'tree'
  )
on conflict (team_slug) do update set
  team_name = excluded.team_name,
  riddle_intro = excluded.riddle_intro,
  riddle_clues = excluded.riddle_clues,
  riddle_question = excluded.riddle_question,
  riddle_answer = excluded.riddle_answer,
  updated_at = now();
