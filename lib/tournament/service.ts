// ─────────────────────────────────────────────────────────────────────────────
// lib/tournament/service.ts
// All Supabase queries for the Tournament module.
// Follows existing pattern: import { supabase } from '@/lib/supabase'
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase'
import type {
  Tournament, Team, Sport,
  EventCategory, ScoringRule, Result,
} from './types'

// ── Tournaments ──────────────────────────────────────────────────────────────

export async function getTournaments() {
  const { data, error } = await supabase
    .from('sports_tournaments')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: (data ?? []) as Tournament[], error }
}

export async function getTournamentBySlug(slug: string) {
  const { data, error } = await supabase
    .from('sports_tournaments')
    .select('*')
    .eq('slug', slug)
    .single()
  return { data: data as Tournament | null, error }
}

export async function upsertTournament(t: Partial<Tournament>) {
  const { data, error } = await supabase
    .from('sports_tournaments')
    .upsert(t)
    .select()
    .single()
  return { data: data as Tournament | null, error }
}

export async function deleteTournament(id: string) {
  return supabase.from('sports_tournaments').delete().eq('id', id)
}

// ── Teams ────────────────────────────────────────────────────────────────────

export async function getTeamsByTournament(tournament_id: string) {
  const { data, error } = await supabase
    .from('sports_teams')
    .select('*')
    .eq('tournament_id', tournament_id)
    .order('display_order', { ascending: true })
  return { data: (data ?? []) as Team[], error }
}

export async function upsertTeam(t: Partial<Team>) {
  const { data, error } = await supabase
    .from('sports_teams')
    .upsert(t)
    .select()
    .single()
  return { data: data as Team | null, error }
}

export async function deleteTeam(id: string) {
  return supabase.from('sports_teams').delete().eq('id', id)
}

// ── Sports ───────────────────────────────────────────────────────────────────

export async function getSports() {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .order('display_order', { ascending: true })
  return { data: (data ?? []) as Sport[], error }
}

export async function upsertSport(s: Partial<Sport>) {
  const { data, error } = await supabase
    .from('sports')
    .upsert(s)
    .select()
    .single()
  return { data: data as Sport | null, error }
}

export async function deleteSport(id: string) {
  return supabase.from('sports').delete().eq('id', id)
}

// ── Event Categories ─────────────────────────────────────────────────────────

export async function getCategoriesByTournament(tournament_id: string) {
  const { data, error } = await supabase
    .from('sports_event_categories')
    .select('*, sport:sports(*)')
    .eq('tournament_id', tournament_id)
    .order('display_order', { ascending: true })
  return { data: (data ?? []) as EventCategory[], error }
}

export async function upsertCategory(c: Partial<EventCategory>) {
  // strip joined field before upsert
  const { sport: _sport, ...payload } = c as EventCategory & { sport?: Sport }
  const { data, error } = await supabase
    .from('sports_event_categories')
    .upsert(payload)
    .select()
    .single()
  return { data: data as EventCategory | null, error }
}

export async function deleteCategory(id: string) {
  return supabase.from('sports_event_categories').delete().eq('id', id)
}

export async function markCategoryCompleted(id: string, is_completed: boolean) {
  const { data, error } = await supabase
    .from('sports_event_categories')
    .update({ is_completed })
    .eq('id', id)
    .select()
    .single()
  return { data: data as EventCategory | null, error }
}

// ── Scoring Rules ────────────────────────────────────────────────────────────

export async function getScoringRules(event_category_id: string) {
  const { data, error } = await supabase
    .from('sports_scoring_rules')
    .select('*')
    .eq('event_category_id', event_category_id)
    .order('rank', { ascending: true })
  return { data: (data ?? []) as ScoringRule[], error }
}

export async function replaceScoringRules(event_category_id: string, rules: Array<{ rank: number; points: number }>) {
  // Delete existing then insert fresh
  const { error: delErr } = await supabase
    .from('sports_scoring_rules')
    .delete()
    .eq('event_category_id', event_category_id)
  if (delErr) return { error: delErr }

  if (rules.length === 0) return { error: null }

  const rows = rules.map(r => ({ event_category_id, rank: r.rank, points: r.points }))
  const { error } = await supabase.from('sports_scoring_rules').insert(rows)
  return { error }
}

// ── Results ──────────────────────────────────────────────────────────────────

export async function getResultsByTournament(tournament_id: string) {
  // Step 1: get category IDs
  const { data: cats, error: catErr } = await supabase
    .from('sports_event_categories')
    .select('id')
    .eq('tournament_id', tournament_id)

  if (catErr) return { data: [], error: catErr }

  const catIds = (cats ?? []).map((c: { id: string }) => c.id)
  if (catIds.length === 0) return { data: [], error: null }

  // Step 2: fetch results
  const { data, error } = await supabase
    .from('sports_results')
    .select('*, team:sports_teams(*), event_category:sports_event_categories(*, sport:sports(*))')
    .in('event_category_id', catIds)
    .order('rank', { ascending: true })

  return { data: (data ?? []) as Result[], error }
}

export async function getResultsByCategory(event_category_id: string) {
  const { data, error } = await supabase
    .from('sports_results')
    .select('*, team:sports_teams(*)')
    .eq('event_category_id', event_category_id)
    .order('rank', { ascending: true })
  return { data: (data ?? []) as Result[], error }
}

export async function upsertResult(r: Partial<Result>) {
  const { team: _t, event_category: _ec, ...payload } = r as Result & { team?: Team; event_category?: EventCategory }
  const { data, error } = await supabase
    .from('sports_results')
    .upsert({ ...payload, updated_at: new Date().toISOString() })
    .select()
    .single()
  return { data: data as Result | null, error }
}

export async function deleteResult(id: string) {
  return supabase.from('sports_results').delete().eq('id', id)
}

export async function deleteResultsByCategory(event_category_id: string) {
  return supabase.from('sports_results').delete().eq('event_category_id', event_category_id)
}

// ── Leaderboard data fetcher ──────────────────────────────────────────────────
// Returns all raw data needed to run calculateLeaderboard()

export async function getLeaderboardData(tournament_id: string) {
  // Step 1 — fetch categories for this tournament to get their IDs
  const { data: categoriesRaw, error: catErr } = await supabase
    .from('sports_event_categories')
    .select('*, sport:sports(*)')
    .eq('tournament_id', tournament_id)

  if (catErr) return { teams: [], results: [], categories: [], sports: [], error: catErr }

  const categoryIds = (categoriesRaw ?? []).map((c: { id: string }) => c.id)

  // Step 2 — parallel fetch the rest
  const [teamsRes, resultsRes, sportsRes] = await Promise.all([
    supabase
      .from('sports_teams')
      .select('*')
      .eq('tournament_id', tournament_id)
      .eq('is_active', true)
      .order('display_order'),

    categoryIds.length > 0
      ? supabase.from('sports_results').select('*').in('event_category_id', categoryIds)
      : Promise.resolve({ data: [], error: null }),

    supabase.from('sports').select('*').eq('is_active', true),
  ])

  return {
    teams:      (teamsRes.data   ?? []) as Team[],
    results:    (resultsRes.data ?? []) as Result[],
    categories: (categoriesRaw   ?? []) as EventCategory[],
    sports:     (sportsRes.data  ?? []) as Sport[],
    error: teamsRes.error || resultsRes.error || sportsRes.error || null,
  }
}
