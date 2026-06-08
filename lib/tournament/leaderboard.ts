// ─────────────────────────────────────────────────────────────────────────────
// lib/tournament/leaderboard.ts
// Pure leaderboard calculation — no DB writes, no side effects.
// Input: teams + results for a tournament.
// Output: sorted LeaderboardRow[].
// ─────────────────────────────────────────────────────────────────────────────

import type { Team, Result, EventCategory, Sport, LeaderboardRow, EventBreakdownItem } from './types'

interface CalcInput {
  teams: Team[]
  results: Result[]
  categories: EventCategory[]
  sports: Sport[]
}

export function calculateLeaderboard({ teams, results, categories, sports }: CalcInput): LeaderboardRow[] {
  // Build lookup maps
  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const sportMap    = new Map(sports.map(s => [s.id, s]))

  // Aggregate per team
  const rowMap = new Map<string, LeaderboardRow>()

  for (const team of teams) {
    if (!team.is_active) continue
    rowMap.set(team.id, {
      rank: 0,
      team,
      total_points: 0,
      gold_count: 0,
      silver_count: 0,
      bronze_count: 0,
      event_breakdown: [],
    })
  }

  for (const result of results) {
    const row = rowMap.get(result.team_id)
    if (!row) continue

    const cat   = categoryMap.get(result.event_category_id)
    const sport = cat ? sportMap.get(cat.sport_id) : undefined

    row.total_points += result.points_awarded

    if (result.rank === 1) row.gold_count++
    else if (result.rank === 2) row.silver_count++
    else if (result.rank === 3) row.bronze_count++

    const breakdown: EventBreakdownItem = {
      event_category_id: result.event_category_id,
      event_name:   cat?.name   ?? 'Unknown Event',
      sport_name:   sport?.name ?? 'Unknown Sport',
      rank:           result.rank,
      points_awarded: result.points_awarded,
    }
    row.event_breakdown.push(breakdown)
  }

  // Sort: total_points DESC → gold DESC → silver DESC → bronze DESC → name ASC
  const sorted = [...rowMap.values()].sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    if (b.gold_count   !== a.gold_count)   return b.gold_count   - a.gold_count
    if (b.silver_count !== a.silver_count) return b.silver_count - a.silver_count
    if (b.bronze_count !== a.bronze_count) return b.bronze_count - a.bronze_count
    return a.team.name.localeCompare(b.team.name)
  })

  // Assign ranks (handle ties — same points gets same rank)
  let currentRank = 1
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const tied =
        prev.total_points === curr.total_points &&
        prev.gold_count   === curr.gold_count   &&
        prev.silver_count === curr.silver_count &&
        prev.bronze_count === curr.bronze_count
      if (!tied) currentRank = i + 1
    }
    sorted[i].rank = currentRank
  }

  return sorted
}
