'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, Trophy, Medal, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRealtimeLeaderboard } from '@/lib/tournament/useRealtimeLeaderboard'
import type { Tournament } from '@/lib/tournament/types'

const MEDAL = ['🥇', '🥈', '🥉']
const PODIUM_BG = [
  'from-yellow-400 to-amber-500',
  'from-gray-300 to-gray-400',
  'from-orange-400 to-amber-600',
]

export default function LeaderboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('sports_tournaments').select('*').eq('slug', slug).single()
      .then(({ data }) => setTournament(data as Tournament))
  }, [slug])

  const { rows, loading, error, refresh } = useRealtimeLeaderboard({
    tournament_id: tournament?.id ?? '',
    enabled: !!tournament?.id,
  })

  const filtered = search.trim()
    ? rows.filter(r => r.team.name.toLowerCase().includes(search.toLowerCase()))
    : rows

  const top3 = rows.slice(0, 3)

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 sm:p-6 md:p-8'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='mb-6'>
          <Link href={`/events/khelotsav`} className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3'>
            <ArrowLeft size={14} /> Back to Khelotsav
          </Link>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600'>
                🏆 K-26 Leaderboard
              </h1>
              {tournament && <p className='text-sm text-gray-500 mt-0.5'>{tournament.name}</p>}
            </div>
            <button onClick={refresh} disabled={loading} className='inline-flex items-center justify-center rounded-lg bg-emerald-600 p-2.5 text-white hover:bg-emerald-700 disabled:opacity-50 shrink-0'>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {error && <div className='mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700'>{error}</div>}

        {loading ? (
          <div className='text-center py-20 bg-white rounded-2xl shadow'>
            <RefreshCw className='mx-auto h-10 w-10 animate-spin text-gray-400 mb-3' />
            <p className='text-gray-500'>Loading leaderboard…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-2xl shadow'>
            <Trophy className='mx-auto h-12 w-12 text-gray-300 mb-4' />
            <p className='text-gray-500'>No results yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* ── Podium ─────────────────────────────────────────────────── */}
            {top3.length === 3 && top3[0].rank === 1 && top3[1].rank === 2 && top3[2].rank === 3 && (
              <div className='mb-8 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-gray-50 p-8 shadow-lg border border-amber-100'>
                                      <h2 className='text-sm font-semibold text-gray-600 uppercase tracking-widest mb-8 text-center'>🏆 Champions 🏆</h2>
                <div className='flex items-end justify-center gap-4 sm:gap-8'>
                  {/* Render: 2nd, 1st, 3rd */}
                  {[top3[1], top3[0], top3[2]].map((row, podiumIdx) => {
                    if (!row) return <div key={podiumIdx} className='w-20 sm:w-28' />
                    const actualRank = row.rank
                    const heights = ['h-32 sm:h-28', 'h-40 sm:h-40', 'h-28 sm:h-24']
                    const widths = ['w-20 sm:w-24', 'w-24 sm:w-28', 'w-20 sm:w-24']
                    const colors = [
                      'from-amber-300 via-yellow-300 to-amber-400',
                      'from-gray-300 via-gray-400 to-slate-400',
                      'from-amber-600 via-orange-600 to-amber-700',
                    ]
                    const shadows = ['shadow-xl', 'shadow-2xl', 'shadow-xl']
                    
                    return (
                      <div key={row.team.id} className='flex flex-col items-center gap-3 sm:gap-4'>
                        {/* Medal emoji */}
                        <div className='text-3xl sm:text-4xl drop-shadow-lg'>{MEDAL[actualRank - 1] ?? '🏅'}</div>
                        
                        {/* Podium */}
                        <div className={`${widths[podiumIdx]} ${heights[podiumIdx]} bg-gradient-to-t ${colors[actualRank - 1]} rounded-t-2xl sm:rounded-t-3xl flex flex-col items-center justify-start ${shadows[podiumIdx]} gap-1.5 px-2 sm:px-4 relative pt-3 sm:pt-4`}>
                          {/* Top decoration */}
                          <div className='absolute -top-1 left-0 right-0 h-1 bg-white/50 rounded-full'></div>
                          
                          {/* Initials circle */}
                          <div
                            className='h-10 sm:h-12 w-10 sm:w-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0'
                            style={{ 
                              backgroundColor: row.team.color
                            }}
                          >
                            {row.team.logo_url
                              ? <img src={row.team.logo_url} alt={row.team.name} className='h-10 sm:h-12 w-10 sm:w-12 rounded-full object-cover' />
                              : row.team.short_name.slice(0, 2).toUpperCase()
                            }
                          </div>
                          
                          {/* Team name */}
                          <p className='text-white text-xs sm:text-sm font-bold text-center leading-tight line-clamp-2'>{row.team.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Search ─────────────────────────────────────────────────── */}
            <div className='mb-4'>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Search team…'
                className='w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500'
              />
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <div className='bg-white rounded-2xl shadow overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      {['Rank', 'Team', 'Points', '🥇', '🥈', '🥉'].map(h => (
                        <th key={h} className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {filtered.map(row => (
                      <tr key={row.team.id} className={`hover:bg-gray-50 transition ${row.rank === 1 ? 'bg-yellow-50/60' : ''}`}>
                        <td className='px-4 py-3'>
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold
                            ${row.rank === 1 ? 'bg-yellow-400 text-white' :
                              row.rank === 2 ? 'bg-gray-300 text-gray-700' :
                              row.rank === 3 ? 'bg-orange-400 text-white' :
                              'bg-gray-100 text-gray-600'}`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-2'>
                            <div className='h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0'
                              style={{ backgroundColor: row.team.color }}>
                              {row.team.logo_url
                                ? <img src={row.team.logo_url} alt={row.team.name} className='h-8 w-8 rounded-full object-cover' />
                                : row.team.short_name.slice(0, 2)
                              }
                            </div>
                            <div>
                              <p className='font-semibold text-gray-900 text-sm truncate'>{row.team.name}</p>
                              {row.team.owner_name && <p className='text-xs text-gray-600 mt-0.5 truncate'>{row.team.owner_name}</p>}
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3 font-bold text-emerald-700 text-sm'>{row.total_points}</td>
                        <td className='px-4 py-3 text-sm font-semibold text-yellow-600'>{row.gold_count || '—'}</td>
                        <td className='px-4 py-3 text-sm font-semibold text-gray-500'>{row.silver_count || '—'}</td>
                        <td className='px-4 py-3 text-sm font-semibold text-orange-500'>{row.bronze_count || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
