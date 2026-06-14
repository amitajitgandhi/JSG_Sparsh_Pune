'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Phone, ChevronDown, ChevronUp, Loader2, Trophy, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Player {
  id: string
  sr_no: number
  team_name: string
  player_name: string
  mobile?: string
  age?: number
  gender?: string
  jersey_size?: string
  category?: string
}

// ── Team colour palette (cycles through teams) ────────────────────────────────

const PALETTE = [
  'from-sky-500 to-sky-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-amber-500 to-amber-600',
  'from-teal-500 to-teal-600',
  'from-rose-500 to-rose-600',
  'from-indigo-500 to-indigo-600',
  'from-lime-500 to-lime-600',
]

const PALETTE_BG = [
  'bg-sky-50/80',     'bg-emerald-50/80', 'bg-violet-50/80',
  'bg-orange-50/80',  'bg-pink-50/80',    'bg-amber-50/80',
  'bg-teal-50/80',    'bg-rose-50/80',    'bg-indigo-50/80',  'bg-lime-50/80',
]

const PALETTE_TEXT = [
  'text-sky-700',     'text-emerald-700', 'text-violet-700',
  'text-orange-700',  'text-pink-700',    'text-amber-700',
  'text-teal-700',    'text-rose-700',    'text-indigo-700',  'text-lime-700',
]

const PALETTE_BORDER = [
  'border-l-sky-500',     'border-l-emerald-500', 'border-l-violet-500',
  'border-l-orange-500',  'border-l-pink-500',    'border-l-amber-500',
  'border-l-teal-500',    'border-l-rose-500',    'border-l-indigo-500',  'border-l-lime-500',
]

// ── Player card ───────────────────────────────────────────────────────────────

function PlayerCard({ player, gradient }: { player: Player; gradient: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl dark:shadow-gray-900/20 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95">
      {/* Header with avatar placeholder + sr no */}
      <div className={`relative p-3 bg-gradient-to-r ${gradient} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <h3 className="font-bold text-sm sm:text-base leading-tight line-clamp-1">
              {player.player_name}
            </h3>
          </div>
          <div className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">#{player.sr_no}</div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 space-y-2 bg-white dark:bg-gray-800">
        <div className="space-y-1 text-xs sm:text-sm">
          {player.age && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Age</span>
              <span className="font-semibold text-gray-800 dark:text-white">{player.age} yrs</span>
            </div>
          )}
          {player.gender && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Gender</span>
              <span className="font-semibold text-gray-800 dark:text-white">{player.gender}</span>
            </div>
          )}
          {player.category && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Category</span>
              <span className="font-semibold text-gray-800 dark:text-white text-right ml-1 line-clamp-1">{player.category}</span>
            </div>
          )}
          {player.jersey_size && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Jersey</span>
              <span className="font-semibold text-gray-800 dark:text-white">{player.jersey_size}</span>
            </div>
          )}
          {player.mobile && (
            <a
              href={`tel:${player.mobile}`}
              className="flex items-center justify-between hover:text-sky-600 dark:hover:text-sky-300 transition-colors group"
            >
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-300">Mobile</span>
              <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300">
                <Phone size={11} /> {player.mobile}
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KhelotsavTeamsPage() {
  const [players,  setPlayers]  = useState<Player[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const TOURNAMENT = 'khelotsav-2026'

  useEffect(() => {
    const load = async () => {
      const { data, error: err } = await supabase
        .from('khelotsav_players')
        .select('*')
        .eq('tournament', TOURNAMENT)
        .order('team_name')
        .order('sr_no', { ascending: true })
      if (err) { setError('Failed to load players. Please try again.'); setLoading(false); return }
      setPlayers((data ?? []) as Player[])
      setLoading(false)
    }
    load()
  }, [])

  // Reset expanded when data loads
  useEffect(() => { setExpanded({}) }, [players.length])

  // Group by team
  const grouped: Record<string, Player[]> = {}
  players.forEach(p => {
    if (!grouped[p.team_name]) grouped[p.team_name] = []
    grouped[p.team_name].push(p)
  })
  const teamNames = Object.keys(grouped).sort()

  const toggle = (team: string) => {
    setExpanded(prev => {
      const isOpen = prev[team]
      if (isOpen) return {}
      setTimeout(() => {
        const el = document.getElementById(`team-${team}`)
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' })
      }, 100)
      return { [team]: true }
    })
  }

  const exportTeamCsv = (team: string, teamPlayers: Player[]) => {
    const headers = ['sr_no', 'team_name', 'player_name', 'mobile', 'age', 'gender', 'category', 'jersey_size']
    const lines = [
      headers.join(','),
      ...teamPlayers.map((p) => [
        p.sr_no ?? '',
        p.team_name ?? '',
        p.player_name ?? '',
        p.mobile ?? '',
        p.age ?? '',
        p.gender ?? '',
        p.category ?? '',
        p.jersey_size ?? '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeTeam = team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    a.download = `khelotsav-2026-${safeTeam || 'team'}-players.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-sky-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading team data…</p>
      </div>
    </div>
  )

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
        <Trophy size={48} className="mx-auto text-red-400 mb-3" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Teams</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition">
          Try Again
        </button>
      </div>
    </div>
  )

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!players.length) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
        <Users size={52} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Teams Coming Soon</h2>
        <p className="text-gray-500 text-sm">Team data will be published here before the event. Check back soon!</p>
        <Link href="/events/khelotsav" className="mt-5 inline-block bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition">
          ← Back to Khelotsav
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-emerald-500 to-orange-500 mb-3 px-2">
            SPARSH KHELOTSAV 2026
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 px-4">
            Meet the participants competing team-wise at the indoor sports festival.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto px-2 mb-6">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold">{teamNames.length}</div>
              <div className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">Teams</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold">{players.length}</div>
              <div className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">Total Players</div>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold">
                {teamNames.length > 0 ? Math.round(players.length / teamNames.length) : 0}
              </div>
              <div className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">Avg per Team</div>
            </div>
          </div>

          {/* Back link */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/events/khelotsav" className="bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-lg hover:bg-sky-50 transition shadow-sm text-sm font-semibold">
              ← Back to Khelotsav
            </Link>
          </div>
        </div>

        {/* Hint */}
        <div className="text-center mb-5 px-4">
          <p className="text-sm sm:text-base text-gray-600 font-medium">👇 Click on a team to see its players 👇</p>
        </div>

        {/* Team accordions */}
        <div className="space-y-4 px-2 sm:px-0">
          {teamNames.map((team, idx) => {
            const colIdx  = idx % PALETTE.length
            const gradient  = PALETTE[colIdx]
            const bgCls     = PALETTE_BG[colIdx]
            const textCls   = PALETTE_TEXT[colIdx]
            const borderCls = PALETTE_BORDER[colIdx]
            const isOpen    = !!expanded[team]
            const teamPlayers = grouped[team]

            return (
              <div
                key={team}
                id={`team-${team}`}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Accordion header */}
                <button
                  onClick={() => toggle(team)}
                  className={`w-full ${bgCls} ${textCls} p-4 sm:p-5 flex items-center justify-between hover:brightness-95 transition-all duration-300 active:scale-[0.99] relative overflow-hidden group border-l-4 ${borderCls}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Trophy size={20} />
                    </div>
                    <div className="text-left">
                      <h2 className={`text-lg sm:text-xl font-bold leading-tight ${textCls}`}>{team}</h2>
                      <p className={`text-xs sm:text-sm opacity-70 mt-0.5`}>{teamPlayers.length} player{teamPlayers.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Export button */}
                  <div className="flex items-center gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        exportTeamCsv(team, teamPlayers)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white transition"
                      title={`Export ${team} players`}
                    >
                      <Download size={14} /> Export
                    </button>
                    <div className={`${textCls} p-1 rounded-full group-hover:bg-white/30 transition-colors`}>
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* Player grid */}
                {isOpen && (
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {teamPlayers.map(player => (
                        <PlayerCard key={player.id} player={player} gradient={gradient} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
