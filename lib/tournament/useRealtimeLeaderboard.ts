'use client'
// ─────────────────────────────────────────────────────────────────────────────
// lib/tournament/useRealtimeLeaderboard.ts
// Subscribes to sports_results changes and recalculates leaderboard.
// Uses Supabase Realtime — no polling.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateLeaderboard } from './leaderboard'
import { getLeaderboardData } from './service'
import type { LeaderboardRow } from './types'

interface Options {
  tournament_id: string
  enabled?: boolean
}

export function useRealtimeLeaderboard({ tournament_id, enabled = true }: Options) {
  const [rows, setRows]       = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const channelRef            = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const refresh = async () => {
    const { teams, results, categories, sports, error: fetchErr } = await getLeaderboardData(tournament_id)
    if (fetchErr) {
      setError(fetchErr.message)
      return
    }
    setRows(calculateLeaderboard({ teams, results, categories, sports }))
    setError(null)
  }

  useEffect(() => {
    if (!enabled || !tournament_id) return

    setLoading(true)
    refresh().finally(() => setLoading(false))

    // Subscribe to realtime changes on sports_results
    const channel = supabase
      .channel(`leaderboard:${tournament_id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sports_results' },
        () => { refresh() }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament_id, enabled])

  return { rows, loading, error, refresh }
}
