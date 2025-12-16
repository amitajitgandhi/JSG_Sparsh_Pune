# Supabase Table: Hurda Party Registrations

This document contains SQL you can run in Supabase (SQL editor) to create a table for storing Hurda Party registration form submissions.

## Table Schema

```sql
-- Enable UUID generation (usually enabled in Supabase projects)
create extension if not exists pgcrypto;

create table if not exists public.hurda_registrations (
  id uuid primary key default gen_random_uuid(),

  -- Form fields
  name text not null check (char_length(name) <= 140),
  mobile text not null check (mobile ~ '^[0-9]{10}$'),
  registration_for text not null check (registration_for in ('Individual','Couple')),
  kids_count smallint not null default 0 check (kids_count between 0 and 4),
  guest_count smallint not null default 0 check (guest_count between 0 and 4),
  transaction_id text not null unique,
  screenshot_url text, -- store uploaded screenshot URL/path

  -- Pricing (kept explicit to allow changes later if needed)
  refundable_deposit integer not null default 250,
  kid_rate integer not null default 500,
  guest_rate integer not null default 750,

  -- Auto-computed total = kids*kid_rate + guests*guest_rate + refundable_deposit
  total_amount integer generated always as (
    (kids_count * kid_rate) + (guest_count * guest_rate) + refundable_deposit
  ) stored,

  -- Optional metadata
  meta jsonb,

  created_at timestamptz not null default now()
);
```

## Indexes

```sql
create index if not exists idx_hurda_registrations_mobile on public.hurda_registrations (mobile);
create index if not exists idx_hurda_registrations_created_at on public.hurda_registrations (created_at desc);
```

## Row Level Security (RLS)

Enable RLS and allow public/anonymous inserts (for client-side form submits). Do not grant select to anonymous users. Admins can read via `service_role` (bypasses RLS) or you can add explicit select policies for `authenticated` and manage roles.

```sql
alter table public.hurda_registrations enable row level security;

-- Allow inserts from anon and authenticated (no select/update/delete)
create policy if not exists "allow_insert_public" on public.hurda_registrations
  for insert
  to anon, authenticated
  with check (true);
```

If you later want authenticated users to read only their own records (e.g., if you store a `user_id`), you can add:

```sql
-- Example if you add a user_id uuid column with default auth.uid()
-- alter table public.hurda_registrations add column user_id uuid default auth.uid();
-- create policy "select_own" on public.hurda_registrations for select to authenticated using (user_id = auth.uid());
```

## Example Insert

```sql
insert into public.hurda_registrations (
  name, mobile, registration_for, kids_count, guest_count, transaction_id, screenshot_url
) values (
  'Sample User', '9876543210', 'Individual', 0, 1, 'TXN-ABC-12345', 'https://<your-domain>/storage/hurda-screenshots/abc123.jpg'
);
```

## Storage (optional, for transaction screenshots)

Recommended approach: upload screenshots via a server route using the Supabase `service_role` key (not from the client). Create a bucket and keep it private.

```sql
-- Create private bucket
select storage.create_bucket('hurda-screenshots', public => false);

-- If you really must allow direct anonymous uploads (not recommended),
-- add a very restrictive policy (still exposes object names/paths if guessed).
-- Prefer server-side uploads instead.

-- Example (less secure): allow anon insert to this bucket only
create policy if not exists "anon_upload_hurda_screenshots" on storage.objects
  for insert to anon
  with check (bucket_id = 'hurda-screenshots');
```

Notes:
- `total_amount` is computed server-side so the value is consistent and not tampered by client.
- Keep the `screenshot_url` as the path or a public URL you generate in your server after upload.
- If you change pricing later, update `kid_rate`, `guest_rate`, or `refundable_deposit` – new rows will compute with updated defaults unless explicitly provided.
