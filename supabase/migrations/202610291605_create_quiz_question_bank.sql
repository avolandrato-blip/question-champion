create extension if not exists pgcrypto;

create table if not exists public.quiz_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.quiz_categories(id) on delete restrict,
  prompt text not null,
  difficulty text not null default 'standard' check (difficulty in ('easy','standard','hard')),
  active boolean not null default true,
  cooldown_hours integer not null default 24 check (cooldown_hours > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  option_order smallint not null check (option_order between 1 and 4),
  is_correct boolean not null default false,
  unique (question_id, option_order)
);

create table if not exists public.quiz_question_usage (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  room_code text,
  stage smallint not null check (stage between 1 and 3),
  asked_at timestamptz not null default now(),
  available_again_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists quiz_questions_category_active_idx on public.quiz_questions(category_id, active);
create index if not exists quiz_question_usage_available_idx on public.quiz_question_usage(question_id, available_again_at desc);

alter table public.quiz_categories enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_question_options enable row level security;
alter table public.quiz_question_usage enable row level security;

create or replace function public.can_use_quiz_question(p_question_id uuid, p_cooldown_hours integer default 24)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.quiz_question_usage u
    where u.question_id = p_question_id
      and u.available_again_at > now()
  );
$$;

revoke all on function public.can_use_quiz_question(uuid, integer) from public;
