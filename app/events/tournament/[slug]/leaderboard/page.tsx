'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, Trophy, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRealtimeLeaderboard } from '@/lib/tournament/useRealtimeLeaderboard'
import { calculateLeaderboard } from '@/lib/tournament/leaderboard'
import type { Tournament } from '@/lib/tournament/types'

const MEDAL = ['🥇', '🥈', '🥉']

// ── Confetti particle ─────────────────────────────────────────────────────────
interface Particle {
  id: number
  x: number
  color: string
  size: number
  delay: number
  duration: number
  drift: number
}
const COLORS = ['#f59e0b','#10b981','#3b82f6','#f97316','#a855f7','#ec4899','#22d3ee','#84cc16']
let pid = 0
function makeParticles(count = 60): Particle[] {
  return Array.from({ length: count }, () => ({
    id:       pid++,
    x:        Math.random() * 100,
    color:    COLORS[Math.floor(Math.random() * COLORS.length)],
    size:     6 + Math.random() * 8,
    delay:    Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.2,
    drift:    (Math.random() - 0.5) * 120,
  }))
}

export default function LeaderboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const [tournament,   setTournament]   = useState<Tournament | null>(null)
  const [search,       setSearch]       = useState('')
  const [sportFilter,  setSportFilter]  = useState('')

  // ── Rank-change tracking ─────────────────────────────────────────────────
  const prevRanksRef  = useRef<Map<string, number>>(new Map())
  const prevPointsRef = useRef<Map<string, number>>(new Map())
  const [rankDeltas,  setRankDeltas]    = useState<Map<string, number>>(new Map())
  const deltaTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Confetti ─────────────────────────────────────────────────────────────
  const [particles,   setParticles]     = useState<Particle[]>([])
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstLoad   = useRef(true)

  const fireConfetti = useCallback(() => {
    setParticles(makeParticles(70))
    if (confettiTimer.current) clearTimeout(confettiTimer.current)
    confettiTimer.current = setTimeout(() => setParticles([]), 3500)
  }, [])

  useEffect(() => {
    supabase.from('sports_tournaments').select('*').eq('slug', slug).single()
      .then(({ data }) => setTournament(data as Tournament))
  }, [slug])

  const { rows, rawData, loading, error, refresh } = useRealtimeLeaderboard({
    tournament_id: tournament?.id ?? '',
    enabled: !!tournament?.id,
  })

  // Detect rank changes and score updates
  useEffect(() => {
    if (rows.length === 0) return

    // Skip animation on first data load
    if (isFirstLoad.current) {
      rows.forEach(row => {
        prevRanksRef.current.set(row.team.id, row.rank)
        prevPointsRef.current.set(row.team.id, row.total_points)
      })
      isFirstLoad.current = false
      return
    }

    // Check for any points change → fire confetti
    let anyScoreChanged = false
    rows.forEach(row => {
      const prevPts = prevPointsRef.current.get(row.team.id)
      if (prevPts !== undefined && prevPts !== row.total_points) anyScoreChanged = true
    })
    if (anyScoreChanged) fireConfetti()

    // Detect rank moves
    const deltas = new Map<string, number>()
    rows.forEach(row => {
      const prev = prevRanksRef.current.get(row.team.id)
      if (prev !== undefined && prev !== row.rank) {
        deltas.set(row.team.id, prev - row.rank) // positive = moved UP
      }
    })
    if (deltas.size > 0) {
      setRankDeltas(deltas)
      if (deltaTimer.current) clearTimeout(deltaTimer.current)
      deltaTimer.current = setTimeout(() => setRankDeltas(new Map()), 6000)
    }

    // Update refs
    rows.forEach(row => {
      prevRanksRef.current.set(row.team.id, row.rank)
      prevPointsRef.current.set(row.team.id, row.total_points)
    })
  }, [rows, fireConfetti])

  // Sport-filtered rows
  const displayRows = useMemo(() => {
    if (!sportFilter || !rawData) return rows
    const catIds = new Set(
      rawData.categories.filter(c => c.sport_id === sportFilter).map(c => c.id)
    )
    return calculateLeaderboard({
      teams:      rawData.teams,
      results:    rawData.results.filter(r => catIds.has(r.event_category_id)),
      categories: rawData.categories,
      sports:     rawData.sports,
    })
  }, [rows, sportFilter, rawData])

  const activeSports = useMemo(() => {
    if (!rawData) return []
    const ids = new Set(
      rawData.categories
        .filter(c => rawData.results.some(r => r.event_category_id === c.id))
        .map(c => c.sport_id)
    )
    return rawData.sports.filter(s => ids.has(s.id))
  }, [rawData])

  const filtered = search.trim()
    ? displayRows.filter(r => r.team.name.toLowerCase().includes(search.toLowerCase()))
    : displayRows

  const top3 = displayRows.slice(0, 3)

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 sm:p-6 md:p-8'>

      {/* ── Confetti layer ────────────────────────────────────────────────── */}
      {particles.length > 0 && (
        <div className='pointer-events-none fixed inset-0 z-50 overflow-hidden' aria-hidden='true'>
          {particles.map(p => (
            <div
              key={p.id}
              className='confetti-particle absolute top-0 rounded-sm'
              style={{
                left:            `${p.x}%`,
                width:           p.size,
                height:          p.size * 0.55,
                backgroundColor: p.color,
                animationDelay:  `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                '--drift':       `${p.drift}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='mb-6'>
          <Link href='/events/khelotsav' className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3'>
            <ArrowLeft size={14} /> Back
          </Link>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600'>
                🏆 Leaderboard
              </h1>
              {tournament && <p className='text-sm text-gray-500 mt-0.5'>{tournament.name}</p>}
            </div>
            <button onClick={refresh} disabled={loading}
              className='inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2.5 text-white hover:bg-emerald-700 disabled:opacity-50 shrink-0'>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {error && <div className='mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700'>{error}</div>}

        {/* Sport filter */}
        {!loading && activeSports.length > 0 && (
          <div className='mb-5'>
            <select value={sportFilter} onChange={e => setSportFilter(e.target.value)}
              className='rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'>
              <option value=''>🏆 Total Points</option>
              {activeSports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className='text-center py-20 bg-white rounded-2xl shadow'>
            <RefreshCw className='mx-auto h-10 w-10 animate-spin text-gray-400 mb-3' />
            <p className='text-gray-500'>Loading leaderboard…</p>
          </div>
        ) : displayRows.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-2xl shadow'>
            <Trophy className='mx-auto h-12 w-12 text-gray-300 mb-4' />
            <p className='text-gray-500'>No results yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {!sportFilter && top3.length === 3 && top3[0].rank === 1 && top3[1].rank === 2 && top3[2].rank === 3 && (
              <div className='mb-8 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-gray-50 p-8 shadow-lg border border-amber-100'>
                <h2 className='text-sm font-semibold text-gray-600 uppercase tracking-widest mb-8 text-center'>🏆 Champions 🏆</h2>
                <div className='flex items-end justify-center gap-4 sm:gap-8'>
                  {[top3[1], top3[0], top3[2]].map((row, podiumIdx) => {
                    if (!row) return <div key={podiumIdx} className='w-20 sm:w-28' />
                    const actualRank = row.rank
                    const heights = ['h-32 sm:h-28', 'h-40 sm:h-40', 'h-28 sm:h-24']
                    const widths  = ['w-20 sm:w-24', 'w-24 sm:w-28', 'w-20 sm:w-24']
                    const colors  = ['from-amber-300 via-yellow-300 to-amber-400','from-gray-300 via-gray-400 to-slate-400','from-amber-600 via-orange-600 to-amber-700']
                    const shadows = ['shadow-xl','shadow-2xl','shadow-xl']
                    return (
                      <div key={row.team.id} className='flex flex-col items-center gap-3 sm:gap-4'>
                        <div className='text-3xl sm:text-4xl drop-shadow-lg'>{MEDAL[actualRank - 1] ?? '🏅'}</div>
                        <div className={`${widths[podiumIdx]} ${heights[podiumIdx]} bg-gradient-to-t ${colors[actualRank - 1]} rounded-t-2xl sm:rounded-t-3xl flex flex-col items-center justify-start ${shadows[podiumIdx]} gap-1.5 px-2 sm:px-4 relative pt-3 sm:pt-4`}>
                          <div className='absolute -top-1 left-0 right-0 h-1 bg-white/50 rounded-full' />
                          <div className='h-10 sm:h-12 w-10 sm:w-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0'
                            style={{ backgroundColor: row.team.color }}>
                            {row.team.logo_url
                              ? <img src={row.team.logo_url} alt={row.team.name} className='h-10 sm:h-12 w-10 sm:w-12 rounded-full object-cover' />
                              : row.team.short_name.slice(0, 2).toUpperCase()}
                          </div>
                          <p className='text-white text-xs sm:text-sm font-bold text-center leading-tight line-clamp-2'>{row.team.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Search */}
            <div className='mb-4'>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder='Search team…'
                className='w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500' />
            </div>

            {/* Table */}
            <div className='bg-white rounded-2xl shadow overflow-hidden'>
              {sportFilter && (
                <div className='px-4 py-2.5 bg-emerald-50 border-b border-emerald-100'>
                  <p className='text-xs font-semibold text-emerald-700'>
                    {activeSports.find(s => s.id === sportFilter)?.icon}{' '}
                    {activeSports.find(s => s.id === sportFilter)?.name} — points only
                  </p>
                </div>
              )}
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      {['Rank', 'Team', 'Points'].map(h => (
                        <th key={h} className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {filtered.map(row => {
                      const delta = rankDeltas.get(row.team.id) ?? 0
                      return (
                        <tr key={row.team.id}
                          className={`transition-colors duration-500 ${row.rank === 1 ? 'bg-yellow-50/60' : ''} ${delta > 0 ? 'lb-row-up' : delta < 0 ? 'lb-row-down' : ''}`}>

                          {/* Rank + delta */}
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-1.5'>
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold
                                ${row.rank === 1 ? 'bg-yellow-400 text-white' :
                                  row.rank === 2 ? 'bg-gray-300 text-gray-700' :
                                  row.rank === 3 ? 'bg-orange-400 text-white' :
                                  'bg-gray-100 text-gray-600'}`}>
                                {row.rank}
                              </span>
                              {delta !== 0 && (
                                <span className={`lb-delta inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[11px] font-black leading-none ${delta > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                  {delta > 0 ? '▲' : '▼'}{Math.abs(delta)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Team */}
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-2'>
                              <div className='h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0'
                                style={{ backgroundColor: row.team.color }}>
                                {row.team.logo_url
                                  ? <img src={row.team.logo_url} alt={row.team.name} className='h-8 w-8 rounded-full object-cover' />
                                  : row.team.short_name.slice(0, 2)}
                              </div>
                              <div>
                                <p className='font-semibold text-gray-900 text-sm'>{row.team.name}</p>
                                {row.team.owner_name && <p className='text-xs text-gray-500 mt-0.5'>{row.team.owner_name}</p>}
                              </div>
                            </div>
                          </td>

                          {/* Points */}
                          <td className='px-4 py-3'>
                            <span className={`font-bold text-emerald-700 text-sm ${delta !== 0 ? 'lb-points-pop' : ''}`}>
                              {row.total_points}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        /* ── Row highlight flash ── */
        .lb-row-up   { animation: rowFlashUp   0.7s ease both; }
        .lb-row-down { animation: rowFlashDown 0.7s ease both; }
        @keyframes rowFlashUp {
          0%,100% { background-color: transparent; }
          40%     { background-color: #d1fae5; }
        }
        @keyframes rowFlashDown {
          0%,100% { background-color: transparent; }
          40%     { background-color: #fee2e2; }
        }

        /* ── Delta badge pop-in + fade-out ── */
        .lb-delta {
          animation: deltaIn 0.35s cubic-bezier(.22,1,.36,1) both,
                     deltaOut 0.4s ease 5.6s both;
        }
        @keyframes deltaIn  { from { opacity:0; transform:scale(0.5) translateY(-4px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes deltaOut { to   { opacity:0; transform:scale(0.8); } }

        /* ── Points pop when score changes ── */
        .lb-points-pop { animation: pointsPop 0.5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes pointsPop {
          0%  { transform: scale(1); }
          45% { transform: scale(1.45); color: #059669; }
          100%{ transform: scale(1); }
        }

        /* ── Confetti ── */
        .confetti-particle {
          animation: confettiFall var(--dur, 2s) ease-in var(--delay, 0s) both;
          transform-origin: center;
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) translateX(0)            rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift))  rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
