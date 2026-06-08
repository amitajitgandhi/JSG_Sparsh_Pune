-- Add player_names column to sports_results for individual/doubles events
alter table sports_results
  add column if not exists player_names text[] default '{}';
