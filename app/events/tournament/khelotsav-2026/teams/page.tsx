'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Phone, ChevronDown, ChevronUp, Loader2, Trophy, Download, Pencil, Plus, Check, X, Search } from 'lucide-react'
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

// ── Normalize team key ──────────────────────────────────────────────────────────

function normalizeTeamKey(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
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

// ── Player card (kept for potential reuse) ──────────────────────────────────

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
              {player.player_name.toUpperCase()}
            </h3>
          </div>
          {/* removed serial number display */}
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

  // ── Find My Team state ─────────────────────────────────────────────────────
  const [findQuery,   setFindQuery]   = useState('')
  const [findResults, setFindResults] = useState<Player[] | null>(null)

  const handleFind = () => {
    const q = findQuery.trim().toLowerCase()
    if (!q) { setFindResults(null); return }
    const matches = players.filter(p =>
      p.player_name.toLowerCase().includes(q) ||
      (p.mobile ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    )
    setFindResults(matches)
  }

  const clearFind = () => { setFindQuery(''); setFindResults(null) }

  // ── Admin / edit state ─────────────────────────────────────────────────────
  const [isAdminAuthed, setIsAdminAuthed] = useState(false)
  const [authTarget, setAuthTarget] = useState<
    { type: 'edit'; playerId: string } | { type: 'add'; teamName: string } | null
  >(null)
  const [authInput, setAuthInput]   = useState('')
  const [authError, setAuthError]   = useState(false)

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editJersey,      setEditJersey]      = useState('')

  const [addingToTeam, setAddingToTeam] = useState<string | null>(null)
  const [newName,      setNewName]      = useState('')
  const [newJersey,    setNewJersey]    = useState('')
  const [saving,       setSaving]       = useState(false)

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

  // ── Admin handlers ─────────────────────────────────────────────────────────

  const handleEditClick = (player: Player) => {
    if (isAdminAuthed) {
      setEditingPlayerId(player.id)
      setEditJersey(player.jersey_size ?? '')
      setAuthTarget(null)
    } else {
      setAuthTarget({ type: 'edit', playerId: player.id })
      setAuthInput('')
      setAuthError(false)
      setEditingPlayerId(null)
    }
  }

  const handleAddClick = (teamName: string) => {
    // Always expand the team
    setExpanded(prev => ({ ...prev, [teamName]: true }))
    if (isAdminAuthed) {
      setAddingToTeam(teamName)
      setNewName('')
      setNewJersey('')
      setAuthTarget(null)
    } else {
      setAuthTarget({ type: 'add', teamName })
      setAuthInput('')
      setAuthError(false)
      setAddingToTeam(null)
    }
  }

  const handleAuthSubmit = () => {
    if (authInput === 'admin123') {
      setIsAdminAuthed(true)
      setAuthError(false)
      if (authTarget?.type === 'edit') {
        const player = players.find(p => p.id === authTarget.playerId)
        if (player) {
          setEditingPlayerId(player.id)
          setEditJersey(player.jersey_size ?? '')
        }
      } else if (authTarget?.type === 'add') {
        setAddingToTeam(authTarget.teamName)
        setNewName('')
        setNewJersey('')
      }
      setAuthTarget(null)
      setAuthInput('')
    } else {
      setAuthError(true)
    }
  }

  const saveEditJersey = async (playerId: string) => {
    setSaving(true)
    const { error: err } = await supabase
      .from('khelotsav_players')
      .update({ jersey_size: editJersey.trim() || null })
      .eq('id', playerId)
    if (!err) {
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, jersey_size: editJersey.trim() || undefined } : p))
      setEditingPlayerId(null)
    }
    setSaving(false)
  }

  const saveNewPlayer = async (teamName: string) => {
    if (!newName.trim()) return
    setSaving(true)
    const teamKey = normalizeTeamKey(teamName)
    const teamPlayers = players.filter(p => normalizeTeamKey(p.team_name) === teamKey)
    const maxSr = teamPlayers.reduce((max, p) => Math.max(max, p.sr_no ?? 0), 0)
    const { data, error: err } = await supabase
      .from('khelotsav_players')
      .insert({
        team_name: teamName,
        player_name: newName.trim(),
        jersey_size: newJersey.trim() || null,
        tournament: TOURNAMENT,
        sr_no: maxSr + 1,
      })
      .select()
      .single()
    if (!err && data) {
      setPlayers(prev => [...prev, data as Player])
      setAddingToTeam(null)
      setNewName('')
      setNewJersey('')
    }
    setSaving(false)
  }

  // ── Inline password prompt component ──────────────────────────────────────

  const AuthPrompt = ({ onCancel }: { onCancel: () => void }) => (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="password"
        value={authInput}
        onChange={e => { setAuthInput(e.target.value); setAuthError(false) }}
        onKeyDown={e => { if (e.key === 'Enter') handleAuthSubmit(); if (e.key === 'Escape') onCancel() }}
        className={`border rounded px-2 py-1 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-sky-400 ${authError ? 'border-red-400' : 'border-gray-300'}`}
        placeholder="Password"
        autoFocus
      />
      <button
        onClick={handleAuthSubmit}
        className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition"
        title="Confirm"
      ><Check size={13} /></button>
      <button
        onClick={onCancel}
        className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
        title="Cancel"
      ><X size={13} /></button>
      {authError && <span className="text-red-500 text-xs">Wrong password</span>}
    </div>
  )

  // Group by team (case-insensitive)
  const groupedByKey: Record<string, { name: string; players: Player[] }> = {}
  players.forEach(p => {
    const key = normalizeTeamKey(p.team_name)
    if (!groupedByKey[key]) groupedByKey[key] = { name: p.team_name.trim().replace(/\s+/g, ' '), players: [] }
    groupedByKey[key].players.push(p)
  })

  const grouped: Record<string, Player[]> = {}
  Object.values(groupedByKey).forEach(g => {
    // Sort players by custom priority: Male Member, Male Kid, Female Member, Female Kid, then sr_no then name
    function normalizeGender(gen?: string) {
      if (!gen) return ''
      const g = gen.toLowerCase().trim()
      if (g === 'male' || g === 'm') return 'male'
      if (g === 'female' || g === 'f') return 'female'
      return g
    }
    function normalizeCategory(cat?: string) {
      if (!cat) return ''
      const c = cat.toLowerCase().trim()
      if (c.includes('kid') || c.includes('child')) return 'kid'
      if (c.includes('member')) return 'member'
      return c
    }
    function priorityFor(p: Player) {
      const g = normalizeGender(p.gender)
      const c = normalizeCategory(p.category)
      if (g === 'male' && c === 'member') return 0
      if (g === 'male' && c === 'kid') return 1
      if (g === 'female' && c === 'member') return 2
      if (g === 'female' && c === 'kid') return 3
      return 4
    }

    grouped[g.name] = g.players.sort((a, b) => {
      const pa = priorityFor(a)
      const pb = priorityFor(b)
      if (pa !== pb) return pa - pb
      const sa = a.sr_no ?? 0
      const sb = b.sr_no ?? 0
      if (sa !== sb) return sa - sb
      return a.player_name.localeCompare(b.player_name)
    })
  })

  const teamNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

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

        {/* Find My Team */}
        <div className="max-w-xl mx-auto mb-8 px-2">
          <div className="bg-white rounded-2xl shadow-md border border-sky-100 p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-sky-700 mb-3 flex items-center gap-2">
              <Search size={18} /> Find My Team
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={findQuery}
                onChange={e => { setFindQuery(e.target.value); if (!e.target.value.trim()) setFindResults(null) }}
                onKeyDown={e => { if (e.key === 'Enter') handleFind() }}
                placeholder="Enter your name or mobile number…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              />
              <button
                onClick={handleFind}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition shrink-0"
              >
                Search
              </button>
              {findResults !== null && (
                <button
                  onClick={clearFind}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition shrink-0"
                  title="Clear"
                ><X size={16} /></button>
              )}
            </div>

            {/* Results */}
            {findResults !== null && (
              <div className="mt-4">
                {findResults.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-3">No player found matching <span className="font-semibold">&ldquo;{findQuery}&rdquo;</span>. Try a different name or number.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">{findResults.length} result{findResults.length !== 1 ? 's' : ''} found</p>
                    {findResults.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{p.player_name.toUpperCase()}</div>
                          <div className="text-xs text-gray-500 mt-0.5 space-x-2">
                            {p.category && <span>{p.category}</span>}
                            {p.gender && <span>{(() => { const g = (p.gender || '').toLowerCase().trim(); if (g === 'male' || g === 'm') return 'Male'; if (g === 'female' || g === 'f') return 'Female'; return p.gender })()}</span>}
                            {p.jersey_size && <span>Jersey: {p.jersey_size}</span>}
                          </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <div className="text-sm font-bold text-sky-700">{p.team_name}</div>
                          {p.mobile && <div className="text-xs text-gray-400 mt-0.5">{p.mobile}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

            const isAddingAuth = authTarget?.type === 'add' && authTarget.teamName === team
            const isAddingForm = addingToTeam === team

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

                  {/* Export + Add buttons */}
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddClick(team)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white transition"
                      title={`Add player to ${team}`}
                    >
                      <Plus size={14} /> Add
                    </button>
                    <div className={`${textCls} p-1 rounded-full group-hover:bg-white/30 transition-colors`}>
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {/* Player table - responsive for mobile */}
                {isOpen && (
                  <div className="p-3 sm:p-4 md:p-6">
                    <div>
                      {/* Mobile list (visible on small screens) */}
                      <div className="sm:hidden space-y-3">
                        {teamPlayers.map(player => (
                          <div key={player.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-start justify-between border border-gray-100 dark:border-gray-700">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{player.player_name.toUpperCase()}</div>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {player.category ? <span className="inline-block mr-2">{player.category}</span> : null}
                                <span className="inline-block mr-2">
                                  {(() => {
                                    const g = (player.gender || '').toLowerCase().trim()
                                    if (g === 'male' || g === 'm') return 'M'
                                    if (g === 'female' || g === 'f') return 'F'
                                    return player.gender ?? '—'
                                  })()}
                                </span>
                                {/* Jersey inline edit (mobile) */}
                                {editingPlayerId === player.id ? (
                                  <span className="inline-flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editJersey}
                                      onChange={e => setEditJersey(e.target.value)}
                                      onKeyDown={e => { if (e.key === 'Enter') saveEditJersey(player.id); if (e.key === 'Escape') setEditingPlayerId(null) }}
                                      className="border border-sky-400 rounded px-1.5 py-0.5 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-sky-400"
                                      placeholder="Jersey"
                                      autoFocus
                                    />
                                    <button onClick={() => saveEditJersey(player.id)} disabled={saving} className="text-green-600 hover:text-green-700"><Check size={13} /></button>
                                    <button onClick={() => setEditingPlayerId(null)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                                  </span>
                                ) : (
                                  <span className="inline-block">{player.jersey_size ?? '—'}</span>
                                )}
                              </div>
                              {/* Inline auth prompt (mobile) */}
                              {authTarget?.type === 'edit' && authTarget.playerId === player.id && (
                                <div className="mt-1.5">
                                  <AuthPrompt onCancel={() => setAuthTarget(null)} />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end ml-3 shrink-0 gap-1.5">
                              {player.mobile ? (
                                <a href={`tel:${player.mobile}`} className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-300 text-sm">
                                  <Phone size={14} /> {player.mobile}
                                </a>
                              ) : (
                                <div className="text-xs text-gray-400">—</div>
                              )}
                              {/* Edit button (mobile) */}
                              {editingPlayerId !== player.id && !(authTarget?.type === 'edit' && authTarget.playerId === player.id) && (
                                <button
                                  onClick={() => handleEditClick(player)}
                                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-sky-600 transition"
                                  title="Edit jersey size"
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Mobile: add player auth prompt */}
                        {isAddingAuth && (
                          <div className="rounded-lg p-3 border border-yellow-200 bg-yellow-50 flex flex-col gap-2">
                            <p className="text-xs text-yellow-800 font-medium">Enter admin password to add a player:</p>
                            <AuthPrompt onCancel={() => setAuthTarget(null)} />
                          </div>
                        )}

                        {/* Mobile: add player form */}
                        {isAddingForm && (
                          <div className="rounded-lg p-3 border border-emerald-200 bg-emerald-50 space-y-2">
                            <p className="text-xs font-semibold text-emerald-800">New Player</p>
                            <input
                              type="text"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              placeholder="Player name *"
                              className="w-full border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={newJersey}
                              onChange={e => setNewJersey(e.target.value)}
                              placeholder="Jersey size"
                              className="w-full border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveNewPlayer(team)}
                                disabled={saving || !newName.trim()}
                                className="flex-1 bg-emerald-600 text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
                              >
                                {saving ? 'Saving…' : 'Add Player'}
                              </button>
                              <button
                                onClick={() => setAddingToTeam(null)}
                                className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Desktop/table view (visible on sm+ screens) */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead className="table-header-group">
                            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                              <th className="px-3 py-2">Player</th>
                              <th className="px-3 py-2">Gender</th>
                              <th className="px-3 py-2">Category</th>
                              <th className="px-3 py-2">Jersey</th>
                              <th className="px-3 py-2">Mobile</th>
                              <th className="px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {teamPlayers.map(player => (
                              <tr key={player.id} className="bg-white dark:bg-gray-800">
                                <td className="px-3 py-3 align-middle text-sm">
                                  <div className="font-semibold text-gray-900 dark:text-white">{player.player_name.toUpperCase()}</div>
                                </td>

                                <td className="px-3 py-3 align-middle text-sm text-gray-700 dark:text-gray-200">{(() => {
                                  const g = (player.gender || '').toLowerCase().trim()
                                  if (g === 'male' || g === 'm') return 'M'
                                  if (g === 'female' || g === 'f') return 'F'
                                  return player.gender ?? '—'
                                })()}</td>

                                <td className="px-3 py-3 align-middle text-sm text-gray-700 dark:text-gray-200">{player.category ?? '—'}</td>

                                {/* Jersey cell - editable */}
                                <td className="px-3 py-3 align-middle text-sm text-gray-700 dark:text-gray-200">
                                  {editingPlayerId === player.id ? (
                                    <input
                                      type="text"
                                      value={editJersey}
                                      onChange={e => setEditJersey(e.target.value)}
                                      onKeyDown={e => { if (e.key === 'Enter') saveEditJersey(player.id); if (e.key === 'Escape') setEditingPlayerId(null) }}
                                      className="border border-sky-400 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:ring-1 focus:ring-sky-400"
                                      placeholder="e.g. M"
                                      autoFocus
                                    />
                                  ) : (
                                    player.jersey_size ?? '—'
                                  )}
                                </td>

                                <td className="px-3 py-3 align-middle text-sm text-sky-600 dark:text-sky-300">{player.mobile ? (
                                  <a href={`tel:${player.mobile}`} className="inline-flex items-center gap-1">
                                    <Phone size={12} /> {player.mobile}
                                  </a>
                                ) : '—'}</td>

                                {/* Actions cell */}
                                <td className="px-3 py-3 align-middle text-sm">
                                  {editingPlayerId === player.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => saveEditJersey(player.id)}
                                        disabled={saving}
                                        className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
                                        title="Save"
                                      ><Check size={14} /></button>
                                      <button
                                        onClick={() => setEditingPlayerId(null)}
                                        className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                                        title="Cancel"
                                      ><X size={14} /></button>
                                    </div>
                                  ) : authTarget?.type === 'edit' && authTarget.playerId === player.id ? (
                                    <AuthPrompt onCancel={() => setAuthTarget(null)} />
                                  ) : (
                                    <button
                                      onClick={() => handleEditClick(player)}
                                      className="p-1 rounded text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition"
                                      title="Edit jersey size"
                                    ><Pencil size={14} /></button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Desktop: add player auth prompt */}
                        {isAddingAuth && (
                          <div className="mt-3 flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <span className="text-xs text-yellow-800 font-medium shrink-0">Admin password:</span>
                            <AuthPrompt onCancel={() => setAuthTarget(null)} />
                          </div>
                        )}

                        {/* Desktop: add player form */}
                        {isAddingForm && (
                          <div className="mt-3 flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="text-xs font-semibold text-emerald-800 shrink-0">New Player:</span>
                            <input
                              type="text"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) saveNewPlayer(team); if (e.key === 'Escape') setAddingToTeam(null) }}
                              placeholder="Player name *"
                              className="border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 flex-1 min-w-0"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={newJersey}
                              onChange={e => setNewJersey(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) saveNewPlayer(team); if (e.key === 'Escape') setAddingToTeam(null) }}
                              placeholder="Jersey size"
                              className="border border-emerald-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 w-28"
                            />
                            <button
                              onClick={() => saveNewPlayer(team)}
                              disabled={saving || !newName.trim()}
                              className="inline-flex items-center gap-1 bg-emerald-600 text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shrink-0"
                            >
                              <Check size={13} /> {saving ? 'Saving…' : 'Add'}
                            </button>
                            <button
                              onClick={() => setAddingToTeam(null)}
                              className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition shrink-0"
                            ><X size={14} /></button>
                          </div>
                        )}
                      </div>
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
