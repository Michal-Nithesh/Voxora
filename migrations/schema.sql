create extension if not exists pgcrypto;

create table if not exists public.transcriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default 'Untitled transcription',
  original_text text not null,
  translated_text text,
  language text not null default 'en',
  provider text not null default 'unknown',
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  target_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transcriptions_user_created_idx on public.transcriptions (user_id, created_at desc);
create index if not exists transcriptions_user_language_idx on public.transcriptions (user_id, language);

alter table public.transcriptions enable row level security;

drop policy if exists "Users can read their own transcriptions" on public.transcriptions;
create policy "Users can read their own transcriptions" on public.transcriptions for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own transcriptions" on public.transcriptions;
create policy "Users can create their own transcriptions" on public.transcriptions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own transcriptions" on public.transcriptions;
create policy "Users can update their own transcriptions" on public.transcriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own transcriptions" on public.transcriptions;
create policy "Users can delete their own transcriptions" on public.transcriptions for delete using (auth.uid() = user_id);

create or replace function public.set_transcriptions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transcriptions_updated_at on public.transcriptions;
create trigger transcriptions_updated_at before update on public.transcriptions for each row execute function public.set_transcriptions_updated_at();