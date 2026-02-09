-- Enable RLS and add SELECT policies for Valentine 2026 registrations

begin;

-- Ensure table exists before applying policies
do $$ begin
  if not exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'valentine_2026_registrations'
  ) then
    raise notice 'Table public.valentine_2026_registrations does not exist. Skipping policy creation.';
  else
    -- Enable RLS (idempotent)
    execute 'alter table public.valentine_2026_registrations enable row level security';

    -- Drop existing conflicting policies if they exist (idempotent guards)
    if exists (
      select 1 from pg_policies 
      where schemaname = 'public' and tablename = 'valentine_2026_registrations' and policyname = 'Allow select for anon'
    ) then
      execute 'drop policy "Allow select for anon" on public.valentine_2026_registrations';
    end if;

    if exists (
      select 1 from pg_policies 
      where schemaname = 'public' and tablename = 'valentine_2026_registrations' and policyname = 'Allow select for authenticated'
    ) then
      execute 'drop policy "Allow select for authenticated" on public.valentine_2026_registrations';
    end if;

    -- Allow read for anon (REST with anon key) - adjust if you prefer authenticated only
    execute 'create policy "Allow select for anon" on public.valentine_2026_registrations for select to anon using (true)';

    -- Allow read for authenticated users (JWT from GoTrue)
    execute 'create policy "Allow select for authenticated" on public.valentine_2026_registrations for select to authenticated using (true)';
  end if;
end $$;

commit;