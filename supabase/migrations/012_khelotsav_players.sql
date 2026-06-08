-- Khelotsav 2026 team players table
-- Populated via admin CSV upload

create table if not exists khelotsav_players (
  id          uuid primary key default gen_random_uuid(),
  tournament  text not null default 'khelotsav-2026',
  team_name   text not null,
  player_name text not null,
  mobile      text,
  age         integer,
  gender      text,
  jersey_size text,
  sport       text,
  photo_url   text,
  sr_no       integer,
  created_at  timestamptz default now()
);

alter table khelotsav_players enable row level security;

create policy "public read khelotsav_players"
  on khelotsav_players for select using (true);

create policy "service all khelotsav_players"
  on khelotsav_players for all using (true) with check (true);

create index if not exists khelotsav_players_tournament_idx on khelotsav_players (tournament);
create index if not exists khelotsav_players_team_idx       on khelotsav_players (team_name);
