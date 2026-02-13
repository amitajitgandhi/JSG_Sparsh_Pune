-- Table schema for memberships_2026_27
create table if not exists public.memberships_2026_27 (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  address text not null,
  whatsapp text not null,
  spouse_name text,
  spouse_whatsapp text,
  wedding_date date not null,
  dob date not null,
  spouse_dob date,
  transaction_id text,
  transaction_screenshot_url text,
  payment_type text,
  membership_type text not null check (membership_type in ('OLD_MEMBER','NEW_MEMBER')),
  created_at timestamptz not null default now()
);

-- Child table (normalized)
create table if not exists public.membership_children_2026_27 (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships_2026_27(id) on delete cascade,
  child_index int not null check (child_index between 0 and 2),
  name text not null,
  gender text check (gender in ('Male','Female')),
  school text,
  other_school text,
  dob date not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_memberships_2026_27_created_at on public.memberships_2026_27 (created_at desc);
create index if not exists idx_membership_children_2026_27_membership_id on public.membership_children_2026_27 (membership_id);

-- RLS
alter table public.memberships_2026_27 enable row level security;
alter table public.membership_children_2026_27 enable row level security;

-- Example RLS policy (allow inserts to anonymous and authenticated users)
create policy if not exists "allow_insert_memberships_public" on public.memberships_2026_27
  for insert to anon, authenticated
  with check (true);

create policy if not exists "allow_insert_children_public" on public.membership_children_2026_27
  for insert to anon, authenticated
  with check (true);

-- Example read policy for admins role via JWT (adjust as per your auth)
create policy if not exists "allow_read_memberships_admin" on public.memberships_2026_27
  for select using (auth.role() = 'service_role');

create policy if not exists "allow_read_children_admin" on public.membership_children_2026_27
  for select using (auth.role() = 'service_role');
