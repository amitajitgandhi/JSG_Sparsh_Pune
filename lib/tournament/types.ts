// ─────────────────────────────────────────────────────────────────────────────
// lib/tournament/types.ts
// All TypeScript types for the Tournament Management module.
// ─────────────────────────────────────────────────────────────────────────────

export interface Tournament {
  id: string
  name: string
  slug: string
  description: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export interface Team {
  id: string
  tournament_id: string
  name: string
  short_name: string
  color: string
  logo_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Sport {
  id: string
  name: string
  icon: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface EventCategory {
  id: string
  tournament_id: string
  sport_id: string
  name: string
  event_type: string
  gender_category: string
  age_category: string
  display_order: number
  is_completed: boolean
  created_at: string
  // joined
  sport?: Sport
}

export interface ScoringRule {
  id: string
  event_category_id: string
  rank: number
  points: number
  created_at: string
}

export interface Result {
  id: string
  event_category_id: string
  team_id: string
  rank: number
  points_awarded: number
  remarks: string | null
  player_names: string[] | null   // for Individual / Doubles events
  created_at: string
  updated_at: string
  // joined
  team?: Team
  event_category?: EventCategory
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardRow {
  rank: number
  team: Team
  total_points: number
  gold_count: number    // rank 1
  silver_count: number  // rank 2
  bronze_count: number  // rank 3
  event_breakdown: EventBreakdownItem[]
}

export interface EventBreakdownItem {
  event_category_id: string
  event_name: string
  sport_name: string
  rank: number
  points_awarded: number
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ResultsGrouped {
  sport: Sport
  categories: Array<{
    category: EventCategory
    results: Result[]
  }>
}
