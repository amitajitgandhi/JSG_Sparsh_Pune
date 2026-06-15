'use client'
// ─────────────────────────────────────────────────────────────────────────────
// lib/tournament/useRealtimeLeaderboard.ts
// Subscribes to sports_results changes and recalculates leaderboard.
// Returns rawData so the page can recalculate for per-sport filters.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateLeaderboard } from './leaderboard'
import { getLeaderboardData } from './service'
import type { Team, Sport, EventCategory, Result, LeaderboardRow } from './types'

interface Options {
  tournament_id: string
  enabled?: boolean
}

export interface LeaderboardRawData {
  teams:      Team[]
  results:    Result[]
  categories: EventCategory[]
  sports:     Sport[]
}

export function useRealtimeLeaderboard({ tournament_id, enabled = true }: Options) {
  const [rows,    setRows]    = useState<LeaderboardRow[]>([])
  const [rawData, setRawData] = useState<LeaderboardRawData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const channelRef            = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const refresh = async () => {
    const { teams, results, categories, sports, error: fetchErr } = await getLeaderboardData(tournament_id)
    if (fetchErr) {
      setError(fetchErr.message)
      return
    }
    setRawData({ teams, results, categories, sports })
    setRows(calculateLeaderboard({ teams, results, categories, sports }))
    setError(null)
  }

  useEffect(() => {
    if (!enabled || !tournament_id) return

    setLoading(true)
    refresh()
      .catch(err => setError(err?.message ?? 'Failed to load leaderboard'))
      .finally(() => setLoading(false))

    const channel = supabase
      .channel(`leaderboard:${tournament_id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sports_results' },
        () => { refresh() }
      )
      .subscribe()

    channelRef.current = channel

    return () => { channel.unsubscribe() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament_id, enabled])

  return { rows, rawData, loading, error, refresh }
}
