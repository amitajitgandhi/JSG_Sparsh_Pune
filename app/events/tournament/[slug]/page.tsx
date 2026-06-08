'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Trophy, LayoutList, CalendarDays, RefreshCw, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRealtimeLeaderboard } from '@/lib/tournament/useRealtimeLeaderboard'
import type { Tournament, EventCategory } from '@/lib/tournament/types'

export default function TournamentOverviewPage() {
  const { slug } = useParams<{ slug: string }>()
  const [tournament,  setTournament]  = useState<Tournament | null>(null)
  const [categories,  setCategories]  = useState<EventCategory[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: t } = await supabase.from('sports_tournaments').select('*').eq('slug', slug).single()
      setTournament(t as Tournament)
      if (t) {
        const { data: cats } = await supabase
          .from('sports_event_categories')
          .select('*, sport:sports(*)')
          .eq('tournament_id', t.id)
          .order('display_order')
        setCategories((cats ?? []) as EventCategory[])
      }
      setLoading(false)
    }
    init()
  }, [slug])

  const { rows: leaderboard } = useRealtimeLeaderboard({
    tournament_id: tournament?.id ?? '',
    enabled: !!tournament?.id,
  })

  const completed = categories.filter(c => c.is_completed)
  const upcoming  = categories.filter(c => !c.is_completed)
  const top3      = leaderboard.slice(0, 3)

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 sm:p-6 md:p-8'>
      <div className='max-w-4xl mx-auto'>

        {loading ? (
          <div className='text-center py-20'><RefreshCw className='mx-auto h-10 w-10 animate-spin text-gray-400 mb-3' /></div>
        ) : !tournament ? (
          <div className='text-center py-20'><p className='text-gray-500'>Tournament not found.</p></div>
        ) : (
          <div className='space-y-6'>

            {/* Title */}
            <div className='text-center'>
              <h1 className='text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600'>
                🏆 {tournament.name}
              </h1>
              {tournament.description && <p className='text-gray-600 mt-2 text-sm max-w-xl mx-auto'>{tournament.description}</p>}
              {(tournament.start_date || tournament.end_date) && (
                <div className='flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500'>
                  <CalendarDays size={13} />
                  {tournament.start_date ?? '?'} → {tournament.end_date ?? '?'}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-wrap gap-3 justify-center'>
              <Link href={`/events/tournament/${slug}/leaderboard`}
                className='inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow transition'>
                <Trophy size={16} /> View Leaderboard
              </Link>
              <Link href={`/events/tournament/${slug}/results`}
                className='inline-flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow transition'>
                <LayoutList size={16} /> View Results
              </Link>
            </div>

            {/* Stats row */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {[
                { label: 'Total Events', value: categories.length, color: 'bg-indigo-100 text-indigo-800' },
                { label: 'Completed',    value: completed.length,  color: 'bg-emerald-100 text-emerald-800' },
                { label: 'Upcoming',     value: upcoming.length,   color: 'bg-amber-100 text-amber-800' },
                { label: 'Teams',        value: leaderboard.length, color: 'bg-sky-100 text-sky-800' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 text-center shadow-sm ${s.color}`}>
                  <div className='text-2xl font-bold'>{s.value}</div>
                  <div className='text-xs font-medium mt-0.5 opacity-80'>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Current Leader */}
            {top3.length > 0 && (
              <div className='bg-white rounded-2xl shadow border border-gray-100 p-5'>
                <h2 className='font-bold text-gray-800 mb-4'>🏅 Current Top 3</h2>
                <div className='space-y-3'>
                  {top3.map(row => (
                    <div key={row.team.id} className='flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3'>
                      <span className='text-lg font-bold text-gray-400 w-5'>#{row.rank}</span>
                      <div className='h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0'
                        style={{ backgroundColor: row.team.color }}>
                        {row.team.logo_url
                          ? <img src={row.team.logo_url} alt={row.team.name} className='h-9 w-9 rounded-full object-cover' />
                          : row.team.short_name.slice(0, 2)
                        }
                      </div>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900 text-sm'>{row.team.name}</p>
                        <p className='text-xs text-gray-500'>🥇{row.gold_count} 🥈{row.silver_count} 🥉{row.bronze_count}</p>
                      </div>
                      <span className='text-lg font-extrabold text-emerald-600'>{row.total_points} <span className='text-xs font-normal text-gray-400'>pts</span></span>
                    </div>
                  ))}
                </div>
                <div className='mt-4 text-center'>
                  <Link href={`/events/tournament/${slug}/leaderboard`} className='text-sm text-emerald-600 font-semibold hover:underline'>
                    View Full Leaderboard →
                  </Link>
                </div>
              </div>
            )}

            {/* Completed Events */}
            {completed.length > 0 && (
              <div className='bg-white rounded-2xl shadow border border-gray-100 p-5'>
                <h2 className='font-bold text-gray-800 mb-4'>✅ Completed Events</h2>
                <div className='flex flex-wrap gap-2'>
                  {completed.map(c => (
                    <span key={c.id} className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700'>
                      <CheckCircle2 size={11} /> {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {upcoming.length > 0 && (
              <div className='bg-white rounded-2xl shadow border border-gray-100 p-5'>
                <h2 className='font-bold text-gray-800 mb-4'>⏳ Upcoming Events</h2>
                <div className='flex flex-wrap gap-2'>
                  {upcoming.map(c => (
                    <span key={c.id} className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700'>
                      {c.sport?.icon ?? '🏅'} {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
