'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, Trophy, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tournament, Result, EventCategory, Sport } from '@/lib/tournament/types'

const MEDAL_LABEL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function ResultsPage() {
  const { slug } = useParams<{ slug: string }>()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [results,    setResults]    = useState<Result[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [search,     setSearch]     = useState('')
  const [sportFilter, setSportFilter] = useState('')

  const load = async (tid: string) => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('sports_results')
      .select(`
        *,
        team:sports_teams(*),
        event_category:sports_event_categories(*, sport:sports(*))
      `)
      .order('rank', { ascending: true })

    if (err) { setError(err.message); setLoading(false); return }

    // Filter to this tournament
    const filtered = (data ?? []).filter(
      (r: Result) => (r.event_category as EventCategory & { tournament_id: string })?.tournament_id === tid
    )
    setResults(filtered as Result[])
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    supabase.from('sports_tournaments').select('*').eq('slug', slug).single()
      .then(({ data }) => {
        setTournament(data as Tournament)
        if (data) load(data.id)
      })
  }, [slug])

  // Realtime subscription
  useEffect(() => {
    if (!tournament?.id) return
    const channel = supabase
      .channel(`results-page:${tournament.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sports_results' }, () => load(tournament.id))
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [tournament?.id])

  // Group by sport → then by event category
  const grouped = useMemo(() => {
    const sportMap = new Map<string, { sport: Sport; categories: Map<string, { category: EventCategory; results: Result[] }> }>()

    for (const r of results) {
      const cat   = r.event_category as EventCategory & { sport: Sport }
      if (!cat) continue
      const sport = cat.sport
      if (!sport) continue

      if (!sportMap.has(sport.id)) sportMap.set(sport.id, { sport, categories: new Map() })
      const sportEntry = sportMap.get(sport.id)!

      if (!sportEntry.categories.has(cat.id)) sportEntry.categories.set(cat.id, { category: cat, results: [] })
      sportEntry.categories.get(cat.id)!.results.push(r)
    }

    return [...sportMap.values()].map(s => ({
      sport: s.sport,
      categories: [...s.categories.values()],
    }))
  }, [results])

  const sports = grouped.map(g => g.sport)

  const filteredGrouped = grouped
    .filter(g => !sportFilter || g.sport.id === sportFilter)
    .filter(g => !search || g.categories.some(c =>
      c.category.name.toLowerCase().includes(search.toLowerCase()) ||
      c.results.some(r => (r.team as { name: string })?.name?.toLowerCase().includes(search.toLowerCase()))
    ))

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4 sm:p-6 md:p-8'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='mb-6'>
          <Link href={`/events/khelotsav`} className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3'>
            <ArrowLeft size={14} /> Back to Khelotsav
          </Link>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600'>
                📋 Results
              </h1>
              {tournament && <p className='text-sm text-gray-500 mt-0.5'>{tournament.name}</p>}
            </div>
            <button onClick={() => tournament && load(tournament.id)} disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 self-start sm:self-auto'>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {error && <div className='mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700'>{error}</div>}

        {/* Filters */}
        {!loading && results.length > 0 && (
          <div className='flex flex-wrap gap-3 mb-5'>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search event or team…'
              className='w-full sm:w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500'
            />
            <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500'>
              <option value=''>All Sports</option>
              {sports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className='text-center py-20 bg-white rounded-2xl shadow'>
            <RefreshCw className='mx-auto h-10 w-10 animate-spin text-gray-400 mb-3' />
            <p className='text-gray-500'>Loading results…</p>
          </div>
        ) : filteredGrouped.length === 0 ? (
          <div className='text-center py-20 bg-white rounded-2xl shadow'>
            <Trophy className='mx-auto h-12 w-12 text-gray-300 mb-4' />
            <p className='text-gray-500'>No results yet. Check back soon.</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {filteredGrouped.map(({ sport, categories }) => (
              <div key={sport.id}>
                <h2 className='flex items-center gap-2 text-base font-bold text-gray-800 mb-3'>
                  <span className='text-xl'>{sport.icon}</span> {sport.name}
                </h2>
                <div className='space-y-3'>
                  {categories.map(({ category, results: catResults }) => (
                    <div key={category.id} className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden'>
                      <div className='flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100'>
                        <div>
                          <p className='font-semibold text-gray-800 text-sm'>{category.name}</p>
                          <p className='text-xs text-gray-500'>{category.event_type} · {category.gender_category} · {category.age_category}</p>
                        </div>
                        {category.is_completed && (
                          <span className='rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5'>Completed</span>
                        )}
                      </div>
                      <div className='divide-y divide-gray-50'>
                        {catResults.sort((a, b) => a.rank - b.rank).map(r => {
                          const team = r.team as { id: string; name: string; short_name: string; color: string; logo_url: string | null }
                          return (
                            <div key={r.id} className='flex items-center gap-3 px-4 py-3'>
                              <span className='text-lg w-7 text-center'>{MEDAL_LABEL[r.rank] ?? `#${r.rank}`}</span>
                              <div className='h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0'
                                style={{ backgroundColor: team?.color ?? '#10b981' }}>
                                {team?.logo_url
                                  ? <img src={team.logo_url} alt={team.name} className='h-8 w-8 rounded-full object-cover' />
                                  : team?.short_name?.slice(0, 2) ?? '?'
                                }
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-semibold text-gray-900'>{team?.name ?? '—'}</p>
                                {r.player_names && r.player_names.length > 0 && (
                                  <p className='text-xs text-gray-500 mt-0.5 truncate'>{r.player_names.join(' & ')}</p>
                                )}
                                {r.remarks && <p className='text-xs text-gray-400 italic mt-0.5'>{r.remarks}</p>}
                              </div>
                              <span className='text-sm font-bold text-emerald-600 shrink-0'>{r.points_awarded} pts</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
