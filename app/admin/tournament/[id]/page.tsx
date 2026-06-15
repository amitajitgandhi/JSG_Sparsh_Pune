'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RefreshCw, ArrowLeft, Users, Dumbbell, LayoutList, Trophy, Plus, Pencil, Trash2, Check, X, Save, Star, BarChart2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tournament, Team, Sport, EventCategory, ScoringRule, Result } from '@/lib/tournament/types'
import {
  getTeamsByTournament, upsertTeam, deleteTeam,
  getSports, upsertSport, deleteSport,
  getCategoriesByTournament, upsertCategory, deleteCategory, markCategoryCompleted,
  getScoringRules, replaceScoringRules,
  getResultsByCategory, upsertResult, deleteResultsByCategory,
  getResultsByTournament,
} from '@/lib/tournament/service'

type Tab = 'teams' | 'sports' | 'events' | 'results' | 'tracking'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'teams',    label: 'Teams',    icon: <Users size={15} /> },
  { key: 'sports',   label: 'Sports',   icon: <Dumbbell size={15} /> },
  { key: 'events',   label: 'Events',   icon: <LayoutList size={15} /> },
  { key: 'results',  label: 'Results',  icon: <Trophy size={15} /> },
  { key: 'tracking', label: 'Tracking', icon: <BarChart2 size={15} /> },
]

const MEDAL_COLORS = ['', 'bg-yellow-100 text-yellow-700', 'bg-gray-100 text-gray-600', 'bg-orange-100 text-orange-700']
const MEDAL_LABELS = ['', '🥇 Gold', '🥈 Silver', '🥉 Bronze']

const ROUND_TYPE_OPTIONS = [
  { value: 'league',        label: 'League Stage' },
  { value: 'quarter_final', label: 'Quarter Final' },
  { value: 'semi_final',    label: 'Semi Final' },
  { value: 'final',         label: 'Final' },
]
const roundLabel = (v?: string | null) =>
  ROUND_TYPE_OPTIONS.find(o => o.value === v)?.label ?? (v ?? '—')

// ── Per-player-count helpers ──────────────────────────────────────────────────
const needsPlayerNames = (eventType: string) => /individual|doubles/i.test(eventType)
const isDoublesType   = (eventType: string) => /doubles/i.test(eventType)
const playerSlots     = (eventType: string) => isDoublesType(eventType) ? 2 : 1

// ── League match types ────────────────────────────────────────────────────────
type LeagueRow   = { team_id: string; player_names: string[]; points: number }
type LeagueMatch = { match_number: number; rows: LeagueRow[] }

const emptyLeagueMatch = (n: number): LeagueMatch => ({
  match_number: n,
  rows: [
    { team_id: '', player_names: [], points: 0 },
    { team_id: '', player_names: [], points: 0 },
  ],
})

export default function TournamentAdminPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [tab,        setTab]        = useState<Tab>('teams')
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading,    setLoading]    = useState(true)

  // ── Teams state ───────────────────────────────────────────────────────────
  const [teams,     setTeams]     = useState<Team[]>([])
  const [teamForm,  setTeamForm]  = useState<Partial<Team> | null>(null)
  const [teamSave,  setTeamSave]  = useState(false)
  const [teamError, setTeamError] = useState('')

  // ── Sports state ──────────────────────────────────────────────────────────
  const [sports,       setSports]       = useState<Sport[]>([])
  const [sportForm,    setSportForm]    = useState<Partial<Sport> | null>(null)
  const [sportSave,    setSportSave]    = useState(false)
  const [sportError,   setSportError]   = useState('')

  // ── Events state ──────────────────────────────────────────────────────────
  const [categories,   setCategories]   = useState<EventCategory[]>([])
  const [catForm,      setCatForm]      = useState<Partial<EventCategory> | null>(null)
  const [catSave,      setCatSave]      = useState(false)
  const [catError,     setCatError]     = useState('')
  const [expandedCat,  setExpandedCat]  = useState<string | null>(null)
  const [catRules,     setCatRules]     = useState<ScoringRule[]>([])
  const [rulesSaving,  setRulesSaving]  = useState(false)
  const [rulesInput,   setRulesInput]   = useState<Array<{ rank: number; points: number }>>([])

  // ── Results state — knockout ───────────────────────────────────────────────
  const [selCatId,      setSelCatId]      = useState('')
  const [results,       setResults]       = useState<Result[]>([])
  const [resultSaving,  setResultSaving]  = useState(false)
  const [resultEntries, setResultEntries] = useState<Array<{ rank: number; team_id: string; points: number; remarks: string; player_names: string[] }>>([
    { rank: 1, team_id: '', points: 0, remarks: '', player_names: [] },
    { rank: 2, team_id: '', points: 0, remarks: '', player_names: [] },
    { rank: 3, team_id: '', points: 0, remarks: '', player_names: [] },
  ])
  const [resultError, setResultError] = useState('')
  const [resultMsg,   setResultMsg]   = useState('')

  // ── Results state — league ────────────────────────────────────────────────
  // Entry area: matches being entered (starts empty; user clicks "Add Match")
  const [leagueMatches,   setLeagueMatches]   = useState<LeagueMatch[]>([])
  // Snapshot of the just-saved batch for post-save confirmation display
  const [lastSavedBatch,  setLastSavedBatch]  = useState<LeagueMatch[]>([])

  // players per team for the current tournament, keyed by team_id
  const [playersByTeam, setPlayersByTeam] = useState<Record<string, string[]>>({})

  // ── Tracking tab state ────────────────────────────────────────────────────
  const [trackResults,     setTrackResults]     = useState<Result[]>([])
  const [trackLoading,     setTrackLoading]     = useState(false)
  const [trackSportFilter, setTrackSportFilter] = useState('')

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)

    // Load tournament FIRST to get its actual slug (never hardcode)
    const { data: tData } = await supabase
      .from('sports_tournaments').select('*').eq('id', id).single()
    const tourney = tData as Tournament | null
    setTournament(tourney)
    const tourneySlug = tourney?.slug ?? ''

    await Promise.all([
      getTeamsByTournament(id).then(async r => {
        setTeams(r.data)
        if (!r.data.length || !tourneySlug) return
        // Load player names grouped by team for the player dropdowns
        const { data: kp } = await supabase
          .from('khelotsav_players')
          .select('team_name, player_name')
          .eq('tournament', tourneySlug)
          .order('sr_no', { ascending: true })
        if (kp) {
          // Strip trailing "(Owner Name)" from khelotsav_players.team_name before comparing
          const norm = (s: string) => s.toLowerCase().trim().replace(/\s*\(.*\)\s*$/, '').replace(/\s+/g, ' ')
          const kpTyped = kp as { team_name: string; player_name: string }[]
          const map: Record<string, string[]> = {}
          for (const team of r.data) {
            const teamNorm = norm(team.name)
            const names = kpTyped
              .filter(p => norm(p.team_name) === teamNorm)
              .map(p => p.player_name)
            // Always store the entry so we can distinguish "team exists but no players"
            map[team.id] = names
          }
          setPlayersByTeam(map)
        }
      }),
      getSports().then(r => setSports(r.data)),
      getCategoriesByTournament(id).then(r => setCategories(r.data)),
    ])
    setLoading(false)
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Determine if selected category is league ──────────────────────────────
  const selCat = categories.find(c => c.id === selCatId)
  // All round types (league, quarter_final, semi_final, final) use the
  // match-based entry UI; categories without a round_type use the rank-based UI
  const isLeagueMode = !!selCat?.round_type

  // ── Load existing results when category selected ──────────────────────────
  const loadScoringForEntry = useCallback(async (catId: string) => {
    if (!catId) return
    const cat = categories.find(c => c.id === catId)
    const existingRes = await getResultsByCategory(catId)
    setResults(existingRes.data)

    if (cat?.round_type) {
      // Any round type: results go to display-only state; entry area stays empty
      setLeagueMatches([])
    } else {
      // Knockout: load scoring rules + pre-fill
      const { data: rules } = await getScoringRules(catId)
      const defaultEntries = [
        { rank: 1, team_id: '', points: 0, remarks: '', player_names: [] },
        { rank: 2, team_id: '', points: 0, remarks: '', player_names: [] },
        { rank: 3, team_id: '', points: 0, remarks: '', player_names: [] },
      ]
      setResultEntries(defaultEntries.map(e => {
        const rule    = rules.find(r => r.rank === e.rank)
        const existing = existingRes.data.find(r => r.rank === e.rank)
        return {
          ...e,
          points:       existing?.points_awarded  ?? rule?.points ?? 0,
          team_id:      existing?.team_id         ?? '',
          remarks:      existing?.remarks         ?? '',
          player_names: existing?.player_names    ?? [],
        }
      }))
    }
  }, [categories])

  useEffect(() => {
    if (selCatId) loadScoringForEntry(selCatId)
  }, [selCatId, loadScoringForEntry])

  // ── Load rules for event expansion ───────────────────────────────────────
  const loadCatRules = useCallback(async (catId: string) => {
    const { data } = await getScoringRules(catId)
    setCatRules(data)
    setRulesInput(data.map(r => ({ rank: r.rank, points: r.points })))
  }, [])

  useEffect(() => { if (expandedCat) loadCatRules(expandedCat) }, [expandedCat, loadCatRules])

  // ── Tracking data ─────────────────────────────────────────────────────────
  const loadTrackResults = useCallback(async () => {
    setTrackLoading(true)
    const { data } = await getResultsByTournament(id)
    setTrackResults(data)
    setTrackLoading(false)
  }, [id])

  useEffect(() => {
    if (tab === 'tracking') loadTrackResults()
  }, [tab, loadTrackResults])

  // ─────────────────────────────────────────────────────────────────────────
  // TEAM HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const saveTeam = async () => {
    if (!teamForm?.name?.trim() || !teamForm?.short_name?.trim()) { setTeamError('Name and Short Name required.'); return }
    setTeamSave(true); setTeamError('')
    const { error } = await upsertTeam({ ...teamForm, tournament_id: id })
    setTeamSave(false)
    if (error) { setTeamError(error.message); return }
    setTeamForm(null)
    getTeamsByTournament(id).then(r => setTeams(r.data))
  }

  const removeTeam = async (tid: string) => {
    if (!confirm('Delete this team?')) return
    await deleteTeam(tid)
    getTeamsByTournament(id).then(r => setTeams(r.data))
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SPORT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const saveSport = async () => {
    if (!sportForm?.name?.trim()) { setSportError('Name required.'); return }
    setSportSave(true); setSportError('')
    const { error } = await upsertSport(sportForm)
    setSportSave(false)
    if (error) { setSportError(error.message); return }
    setSportForm(null)
    getSports().then(r => setSports(r.data))
  }

  const toggleSportActive = async (s: Sport) => {
    await supabase.from('sports').update({ is_active: !s.is_active }).eq('id', s.id)
    getSports().then(r => setSports(r.data))
  }

  const removeSport = async (sid: string) => {
    if (!confirm('Delete this sport?')) return
    await deleteSport(sid)
    getSports().then(r => setSports(r.data))
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const saveCategory = async () => {
    if (!catForm?.name?.trim() || !catForm?.sport_id) { setCatError('Name and Sport required.'); return }
    setCatSave(true); setCatError('')
    const { error } = await upsertCategory({ ...catForm, tournament_id: id })
    setCatSave(false)
    if (error) { setCatError(error.message); return }
    setCatForm(null)
    getCategoriesByTournament(id).then(r => setCategories(r.data))
  }

  const removeCategory = async (cid: string) => {
    if (!confirm('Delete this event category? All its results and scoring rules will also be deleted.')) return
    await deleteCategory(cid)
    getCategoriesByTournament(id).then(r => setCategories(r.data))
  }

  const toggleCompleted = async (cat: EventCategory) => {
    await markCategoryCompleted(cat.id, !cat.is_completed)
    getCategoriesByTournament(id).then(r => setCategories(r.data))
  }

  const saveRules = async () => {
    if (!expandedCat) return
    setRulesSaving(true)
    await replaceScoringRules(expandedCat, rulesInput.filter(r => r.points > 0))
    setRulesSaving(false)
    loadCatRules(expandedCat)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULT HANDLERS — KNOCKOUT
  // ─────────────────────────────────────────────────────────────────────────
  const saveResults = async () => {
    setResultError(''); setResultMsg('')
    const filled = resultEntries.filter(e => e.team_id)
    if (filled.length === 0) { setResultError('Select at least one team.'); return }
    const teamIds = filled.map(e => e.team_id)
    if (new Set(teamIds).size !== teamIds.length) { setResultError('Duplicate teams selected.'); return }

    setResultSaving(true)
    await deleteResultsByCategory(selCatId)
    for (const e of filled) {
      const pnames = selCat && needsPlayerNames(selCat.event_type) ? e.player_names.filter(Boolean) : []
      const { error: saveErr } = await upsertResult({
        event_category_id: selCatId,
        team_id:           e.team_id,
        rank:              e.rank,
        points_awarded:    e.points,
        remarks:           e.remarks || null,
        player_names:      pnames.length ? pnames : null,
        match_number:      null,
      })
      if (saveErr) { setResultError(`Save failed: ${saveErr.message}`); setResultSaving(false); return }
    }
    setResultSaving(false)
    setResultMsg('Results saved successfully.')
    loadScoringForEntry(selCatId)
    await markCategoryCompleted(selCatId, true)
    getCategoriesByTournament(id).then(r => setCategories(r.data))
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULT HANDLERS — LEAGUE
  // ─────────────────────────────────────────────────────────────────────────
  const saveLeagueResults = async () => {
    setResultError(''); setResultMsg('')
    const hasAny = leagueMatches.some(m => m.rows.some(r => r.team_id))
    if (!hasAny) { setResultError('Enter at least one team in a match.'); return }

    setResultSaving(true)

    // INSERT-only — Results tab only adds new matches; Tracking handles edits
    for (const match of leagueMatches) {
      for (const row of match.rows) {
        if (!row.team_id) continue
        const pnames = selCat && needsPlayerNames(selCat.event_type)
          ? row.player_names.filter(Boolean)
          : []
        const { error: rowErr } = await upsertResult({
          event_category_id: selCatId,
          team_id:           row.team_id,
          rank:              null,
          points_awarded:    row.points,
          remarks:           null,
          player_names:      pnames.length ? pnames : null,
          match_number:      match.match_number,
        })
        if (rowErr) { setResultError(`Save failed: ${rowErr.message}`); setResultSaving(false); return }
      }
    }

    setResultSaving(false)
    setResultMsg('Saved.')
    setLastSavedBatch([...leagueMatches])  // keep a snapshot for confirmation display
    setLeagueMatches([])                   // clear entry area
    // Reload results silently (for match-number sequencing only, not displayed)
    loadScoringForEntry(selCatId)
    await markCategoryCompleted(selCatId, true)
    getCategoriesByTournament(id).then(r => setCategories(r.data))
  }

  // ── League match helpers ──────────────────────────────────────────────────
  const updateLeagueRow = (matchIdx: number, rowIdx: number, patch: Partial<LeagueRow>) => {
    setLeagueMatches(prev => prev.map((m, mi) =>
      mi !== matchIdx ? m : {
        ...m,
        rows: m.rows.map((r, ri) => ri !== rowIdx ? r : { ...r, ...patch }),
      }
    ))
  }

  const addLeagueMatch = () => {
    // Next number accounts for saved (in DB via results state) + in-entry + last saved batch
    const savedNums  = results.map(r => r.match_number ?? 0)
    const entryNums  = leagueMatches.map(m => m.match_number)
    const batchNums  = lastSavedBatch.map(m => m.match_number)
    const nextNum    = Math.max(0, ...[...savedNums, ...entryNums, ...batchNums]) + 1
    setLastSavedBatch([])   // clear confirmation when starting a new entry
    setResultMsg('')
    setLeagueMatches(prev => [...prev, emptyLeagueMatch(nextNum)])
  }

  const removeLeagueMatch = (matchIdx: number) => {
    setLeagueMatches(prev => prev.filter((_, i) => i !== matchIdx))
  }

  // Move a saved match back into the entry area for editing
  const editSavedMatch = (matchNum: number) => {
    const matchRows = results.filter(r => (r.match_number ?? 0) === matchNum)
    const rows: LeagueRow[] = matchRows.map(r => ({
      team_id:      r.team_id,
      player_names: r.player_names ?? [],
      points:       r.points_awarded,
    }))
    while (rows.length < 2) rows.push({ team_id: '', player_names: [], points: 0 })
    setLeagueMatches(prev => [...prev, { match_number: matchNum, rows }])
    setResults(prev => prev.filter(r => (r.match_number ?? 0) !== matchNum))
  }

  // Navigate to Results tab with a specific category pre-selected
  const goToResultsTab = (catId: string) => {
    setTab('results')
    setSelCatId(catId)
    setResultMsg(''); setResultError('')
    setLeagueMatches([])
  }

  // ── Player dropdown helper ────────────────────────────────────────────────
  const PlayerDropdowns = ({
    teamId, playerNames, slots,
    onChange,
  }: {
    teamId: string
    playerNames: string[]
    slots: number
    onChange: (names: string[]) => void
  }) => {
    const options = teamId ? (playersByTeam[teamId] ?? []) : []
    const teamName = teams.find(t => t.id === teamId)?.name ?? ''
    if (!teamId) return null
    if (options.length === 0) {
      return (
        <p className='mt-1 text-xs text-orange-500'>
          No players found for &quot;{teamName}&quot; in khelotsav_players — check that the team name matches exactly.
        </p>
      )
    }
    return (
      <div className='flex gap-2 flex-wrap mt-1'>
        {Array.from({ length: slots }).map((_, si) => (
          <select
            key={si}
            value={playerNames[si] ?? ''}
            onChange={e => {
              const next = [...playerNames]
              next[si] = e.target.value
              onChange(next.filter(Boolean))
            }}
            className='rounded-lg border border-gray-300 px-2 py-1.5 text-xs min-w-[150px]'
          >
            <option value=''>— Player {slots > 1 ? si + 1 : ''} —</option>
            {options.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        ))}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
      <div className='max-w-5xl mx-auto'>

        {/* Header */}
        <div className='mb-5 flex items-center gap-3'>
          <button onClick={() => router.push('/admin/tournament')} className='rounded-lg border border-gray-300 p-2 hover:bg-gray-100'>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className='text-xl font-extrabold text-gray-900'>{tournament?.name ?? 'Loading…'}</h1>
            <p className='text-xs text-gray-500'>/{tournament?.slug}</p>
          </div>
          <button onClick={loadAll} disabled={loading} className='ml-auto rounded-lg border border-gray-300 p-2 hover:bg-gray-100'>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex gap-1 mb-5 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit'>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t.key ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══ TEAMS TAB ══════════════════════════════════════════════════════ */}
        {tab === 'teams' && (
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-bold text-gray-800'>Teams ({teams.length})</h2>
              <button onClick={() => setTeamForm({ color: '#10b981', display_order: teams.length })}
                className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700'>
                <Plus size={14} /> Add Team
              </button>
            </div>

            {teamForm !== null && (
              <div className='bg-white rounded-2xl border border-emerald-200 shadow p-5'>
                <h4 className='font-semibold text-gray-800 mb-3'>{teamForm.id ? 'Edit Team' : 'New Team'}</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Team Name *</label>
                    <input value={teamForm.name ?? ''} onChange={e => setTeamForm(f => ({ ...f!, name: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='Team Alpha' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Short Name *</label>
                    <input value={teamForm.short_name ?? ''} onChange={e => setTeamForm(f => ({ ...f!, short_name: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='TMA' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Team Owner Name</label>
                    <input value={teamForm.owner_name ?? ''} onChange={e => setTeamForm(f => ({ ...f!, owner_name: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='Owner Name' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Color</label>
                    <div className='flex items-center gap-2'>
                      <input type='color' value={teamForm.color ?? '#10b981'} onChange={e => setTeamForm(f => ({ ...f!, color: e.target.value }))} className='h-9 w-14 rounded border border-gray-300 cursor-pointer' />
                      <span className='text-xs text-gray-500'>{teamForm.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Logo URL</label>
                    <input value={teamForm.logo_url ?? ''} onChange={e => setTeamForm(f => ({ ...f!, logo_url: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='https://…' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Display Order</label>
                    <input type='number' value={teamForm.display_order ?? 0} onChange={e => setTeamForm(f => ({ ...f!, display_order: Number(e.target.value) }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' />
                  </div>
                </div>
                {teamError && <p className='mt-2 text-xs text-red-600'>{teamError}</p>}
                <div className='mt-4 flex gap-2 justify-end'>
                  <button onClick={() => { setTeamForm(null); setTeamError('') }} className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100'>Cancel</button>
                  <button onClick={saveTeam} disabled={teamSave} className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                    {teamSave ? 'Saving…' : <><Save size={13} className='inline mr-1' />Save</>}
                  </button>
                </div>
              </div>
            )}

            {teams.length === 0 ? (
              <div className='text-center py-12 bg-white rounded-2xl border border-gray-200'>
                <Users className='mx-auto h-10 w-10 text-gray-300 mb-3' />
                <p className='text-gray-500 text-sm'>No teams yet.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {teams.map(t => (
                  <div key={t.id} className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0' style={{ backgroundColor: t.color }}>
                      {t.logo_url ? <img src={t.logo_url} alt={t.name} className='h-10 w-10 rounded-full object-cover' /> : t.short_name.slice(0, 2)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-gray-900 truncate'>{t.name}</p>
                      <p className='text-xs text-gray-500'>{t.short_name} · Order: {t.display_order}</p>
                      {t.owner_name && <p className='text-xs text-gray-600 mt-0.5'>Owner: {t.owner_name}</p>}
                    </div>
                    <div className='flex gap-1.5'>
                      <button onClick={() => { setTeamForm(t); setTeamError('') }} className='rounded-lg border p-1.5 text-gray-500 hover:bg-gray-50'><Pencil size={13} /></button>
                      <button onClick={() => removeTeam(t.id)} className='rounded-lg border p-1.5 text-red-400 hover:bg-red-50'><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SPORTS TAB ═════════════════════════════════════════════════════ */}
        {tab === 'sports' && (
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-bold text-gray-800'>Sports ({sports.length})</h2>
              <button onClick={() => setSportForm({ is_active: true, display_order: sports.length })}
                className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700'>
                <Plus size={14} /> Add Sport
              </button>
            </div>

            {sportForm !== null && (
              <div className='bg-white rounded-2xl border border-emerald-200 shadow p-5'>
                <h4 className='font-semibold text-gray-800 mb-3'>{sportForm.id ? 'Edit Sport' : 'New Sport'}</h4>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Name *</label>
                    <input value={sportForm.name ?? ''} onChange={e => setSportForm(f => ({ ...f!, name: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='Badminton' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Icon (emoji)</label>
                    <input value={sportForm.icon ?? '🏅'} onChange={e => setSportForm(f => ({ ...f!, icon: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='🏸' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Display Order</label>
                    <input type='number' value={sportForm.display_order ?? 0} onChange={e => setSportForm(f => ({ ...f!, display_order: Number(e.target.value) }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' />
                  </div>
                </div>
                {sportError && <p className='mt-2 text-xs text-red-600'>{sportError}</p>}
                <div className='mt-4 flex gap-2 justify-end'>
                  <button onClick={() => { setSportForm(null); setSportError('') }} className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100'>Cancel</button>
                  <button onClick={saveSport} disabled={sportSave} className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                    {sportSave ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            <div className='bg-white rounded-2xl border border-gray-200 shadow overflow-hidden'>
              {sports.length === 0 ? (
                <div className='text-center py-12'><Dumbbell className='mx-auto h-10 w-10 text-gray-300 mb-3' /><p className='text-gray-500 text-sm'>No sports yet.</p></div>
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      {['Icon', 'Name', 'Order', 'Status', ''].map(h => (
                        <th key={h} className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {sports.map(s => (
                      <tr key={s.id} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-xl'>{s.icon}</td>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>{s.name}</td>
                        <td className='px-4 py-3 text-sm text-gray-500'>{s.display_order}</td>
                        <td className='px-4 py-3'>
                          <button onClick={() => toggleSportActive(s)} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex gap-1.5 justify-end'>
                            <button onClick={() => { setSportForm(s); setSportError('') }} className='rounded p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100'><Pencil size={13} /></button>
                            <button onClick={() => removeSport(s.id)} className='rounded p-1.5 text-red-400 hover:bg-red-50'><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ EVENTS TAB ═════════════════════════════════════════════════════ */}
        {tab === 'events' && (
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='font-bold text-gray-800'>Event Categories ({categories.length})</h2>
              <button onClick={() => setCatForm({ event_type: 'Individual', gender_category: 'Open', age_category: 'Open', round_type: null, display_order: categories.length })}
                className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700'>
                <Plus size={14} /> Add Event
              </button>
            </div>

            {catForm !== null && (
              <div className='bg-white rounded-2xl border border-emerald-200 shadow p-5'>
                <h4 className='font-semibold text-gray-800 mb-3'>{catForm.id ? 'Edit Event Category' : 'New Event Category'}</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Event Name *</label>
                    <input value={catForm.name ?? ''} onChange={e => setCatForm(f => ({ ...f!, name: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder="Badminton Men's Singles" />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Sport *</label>
                    <select value={catForm.sport_id ?? ''} onChange={e => setCatForm(f => ({ ...f!, sport_id: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'>
                      <option value=''>Select sport</option>
                      {sports.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Round</label>
                    <select
                      value={catForm.round_type ?? ''}
                      onChange={e => setCatForm(f => ({ ...f!, round_type: e.target.value || null }))}
                      className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                    >
                      <option value=''>— Select round —</option>
                      {ROUND_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Event Type</label>
                    <select value={catForm.event_type ?? 'Individual'} onChange={e => setCatForm(f => ({ ...f!, event_type: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'>
                      {['Individual', 'Doubles', 'Team', 'Mixed Doubles'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Gender Category</label>
                    <select value={catForm.gender_category ?? 'Open'} onChange={e => setCatForm(f => ({ ...f!, gender_category: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'>
                      {["Open", "Men's", "Women's", "Mixed"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Age Category</label>
                    <input value={catForm.age_category ?? 'Open'} onChange={e => setCatForm(f => ({ ...f!, age_category: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' placeholder='Open / U18 / Senior' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>Display Order</label>
                    <input type='number' value={catForm.display_order ?? 0} onChange={e => setCatForm(f => ({ ...f!, display_order: Number(e.target.value) }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' />
                  </div>
                </div>
                {catError && <p className='mt-2 text-xs text-red-600'>{catError}</p>}
                <div className='mt-4 flex gap-2 justify-end'>
                  <button onClick={() => { setCatForm(null); setCatError('') }} className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100'>Cancel</button>
                  <button onClick={saveCategory} disabled={catSave} className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                    {catSave ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            <div className='space-y-2'>
              {categories.length === 0 ? (
                <div className='text-center py-12 bg-white rounded-2xl border border-gray-200'><LayoutList className='mx-auto h-10 w-10 text-gray-300 mb-3' /><p className='text-gray-500 text-sm'>No event categories yet.</p></div>
              ) : categories.map(cat => (
                <div key={cat.id} className='bg-white rounded-xl border border-gray-200 shadow-sm'>
                  <div className='flex items-center gap-3 p-4'>
                    <span className='text-lg'>{cat.sport?.icon ?? '🏅'}</span>
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-gray-900 truncate'>{cat.name}</p>
                      <p className='text-xs text-gray-500 flex flex-wrap gap-x-1.5'>
                        <span>{cat.sport?.name}</span>
                        <span>·</span>
                        {cat.round_type && (
                          <>
                            <span className='font-medium text-indigo-600'>{roundLabel(cat.round_type)}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>{cat.event_type}</span>
                        <span>·</span>
                        <span>{cat.gender_category}</span>
                        <span>·</span>
                        <span>{cat.age_category}</span>
                      </p>
                    </div>
                    <button onClick={() => toggleCompleted(cat)} className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cat.is_completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {cat.is_completed ? '✓ Completed' : 'Pending'}
                    </button>
                    <div className='flex gap-1.5'>
                      <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)} title='Scoring Rules' className='rounded p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'><Star size={13} /></button>
                      <button onClick={() => { setCatForm(cat); setCatError('') }} className='rounded p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100'><Pencil size={13} /></button>
                      <button onClick={() => removeCategory(cat.id)} className='rounded p-1.5 text-red-400 hover:bg-red-50'><Trash2 size={13} /></button>
                    </div>
                  </div>

                  {/* Scoring rules inline editor */}
                  {expandedCat === cat.id && (
                    <div className='border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl'>
                      <p className='text-xs font-semibold text-gray-600 mb-3'>Scoring Rules</p>
                      <div className='space-y-2'>
                        {[1, 2, 3, 4, 5].map(rank => {
                          const existing = rulesInput.find(r => r.rank === rank)
                          const pts = existing?.points ?? ''
                          return (
                            <div key={rank} className='flex items-center gap-3'>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold min-w-[70px] text-center ${MEDAL_COLORS[rank] || 'bg-gray-100 text-gray-600'}`}>
                                {MEDAL_LABELS[rank] || `Rank ${rank}`}
                              </span>
                              <input
                                type='number'
                                value={pts}
                                min={0}
                                placeholder='pts'
                                onChange={e => {
                                  const val = Number(e.target.value)
                                  setRulesInput(prev => {
                                    const next = prev.filter(r => r.rank !== rank)
                                    if (e.target.value !== '') next.push({ rank, points: val })
                                    return next.sort((a, b) => a.rank - b.rank)
                                  })
                                }}
                                className='w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:border-emerald-500'
                              />
                              <span className='text-xs text-gray-400'>points</span>
                            </div>
                          )
                        })}
                      </div>
                      <button onClick={saveRules} disabled={rulesSaving} className='mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                        {rulesSaving ? 'Saving…' : <><Save size={12} />Save Rules</>}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TRACKING TAB ═══════════════════════════════════════════════════ */}
        {tab === 'tracking' && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between flex-wrap gap-3'>
              <h2 className='font-bold text-gray-800'>Results Tracker</h2>
              <div className='flex items-center gap-2'>
                <select
                  value={trackSportFilter}
                  onChange={e => setTrackSportFilter(e.target.value)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm'
                >
                  <option value=''>All Sports</option>
                  {sports.filter(s => s.is_active).map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
                <button onClick={loadTrackResults} disabled={trackLoading} className='rounded-lg border border-gray-300 p-2 hover:bg-gray-100'>
                  <RefreshCw size={14} className={trackLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {trackLoading ? (
              <div className='text-center py-16 text-gray-400 text-sm'><RefreshCw className='mx-auto h-8 w-8 animate-spin mb-2' />Loading…</div>
            ) : (() => {
              // Group by category
              const catMap = new Map<string, { cat: EventCategory & { sport?: Sport }; results: Result[] }>()
              for (const r of trackResults) {
                const cat = r.event_category as EventCategory & { sport?: Sport }
                if (!cat) continue
                if (trackSportFilter && cat.sport_id !== trackSportFilter) continue
                if (!catMap.has(cat.id)) catMap.set(cat.id, { cat, results: [] })
                catMap.get(cat.id)!.results.push(r)
              }
              const grouped = [...catMap.values()]
              if (grouped.length === 0) return (
                <div className='text-center py-16 bg-white rounded-2xl border border-gray-200'>
                  <BarChart2 className='mx-auto h-10 w-10 text-gray-300 mb-3' />
                  <p className='text-gray-500 text-sm'>No results recorded yet.</p>
                </div>
              )
              return (
                <div className='space-y-4'>
                  {grouped.map(({ cat, results: catResults }) => {
                    const matchNums = Array.from(new Set(catResults.map(r => r.match_number ?? 0))).sort((a, b) => a - b)
                    const isLeague = cat.round_type === 'league'
                    return (
                      <div key={cat.id} className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
                        <div className='flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100'>
                          <div>
                            <p className='font-semibold text-gray-800 text-sm'>{cat.sport?.icon} {cat.name}</p>
                            <p className='text-xs text-gray-500 mt-0.5'>
                              {cat.event_type} · {roundLabel(cat.round_type)}
                              {cat.is_completed && <span className='ml-2 text-emerald-600'>✓ Completed</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => goToResultsTab(cat.id)}
                            className='inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-emerald-700'
                            title='Edit in Results tab'
                          >
                            <Pencil size={11} /> Edit
                          </button>
                        </div>

                        {isLeague ? (
                          <div className='divide-y divide-gray-50'>
                            {matchNums.map(mn => {
                              const rows = catResults.filter(r => (r.match_number ?? 0) === mn)
                              return (
                                <div key={mn} className='px-4 py-3'>
                                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>Match {mn}</p>
                                  {rows.map(r => (
                                    <div key={r.id} className='flex items-center justify-between py-1 text-sm'>
                                      <div>
                                        <span className='font-medium text-gray-800'>
                                          {(r as Result & { team?: Team }).team?.name ?? r.team_id}
                                        </span>
                                        {r.player_names && r.player_names.length > 0 && (
                                          <span className='ml-2 text-xs text-gray-500'>({r.player_names.join(' & ')})</span>
                                        )}
                                      </div>
                                      <span className='font-semibold text-emerald-600 text-sm'>{r.points_awarded} pts</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className='divide-y divide-gray-50'>
                            {catResults.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map(r => (
                              <div key={r.id} className='flex items-center gap-3 px-4 py-3 text-sm'>
                                <span className='text-base w-7 text-center'>
                                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
                                </span>
                                <span className='font-medium text-gray-800 flex-1'>
                                  {(r as Result & { team?: Team }).team?.name ?? r.team_id}
                                  {r.player_names && r.player_names.length > 0 && (
                                    <span className='ml-2 text-xs text-gray-500'>({r.player_names.join(' & ')})</span>
                                  )}
                                </span>
                                <span className='font-semibold text-emerald-600'>{r.points_awarded} pts</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* ══ RESULTS TAB ════════════════════════════════════════════════════ */}
        {tab === 'results' && (
          <div className='space-y-4'>
            <h2 className='font-bold text-gray-800'>Enter Results</h2>

            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Select Event Category</label>
              <select
                value={selCatId}
                onChange={e => {
                  setSelCatId(e.target.value)
                  setResultMsg(''); setResultError('')
                  setLeagueMatches([])
                  setLastSavedBatch([])
                  setResultEntries([
                    { rank: 1, team_id: '', points: 0, remarks: '', player_names: [] },
                    { rank: 2, team_id: '', points: 0, remarks: '', player_names: [] },
                    { rank: 3, team_id: '', points: 0, remarks: '', player_names: [] },
                  ])
                }}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm max-w-md'
              >
                <option value=''>— Choose event —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.sport?.icon} {c.name}
                    {c.round_type ? ` · ${roundLabel(c.round_type)}` : ''}
                    {c.is_completed ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selCatId && selCat && (
              <div className='bg-white rounded-2xl border border-gray-200 shadow p-5'>
                <div className='flex flex-wrap items-center gap-2 mb-4'>
                  <h3 className='font-semibold text-gray-800'>{selCat.name}</h3>
                  {selCat.round_type && (
                    <span className='rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5'>
                      {roundLabel(selCat.round_type)}
                    </span>
                  )}
                  <span className='rounded-full bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5'>
                    {selCat.event_type}
                  </span>
                </div>

                {/* ── LEAGUE MODE ─────────────────────────────────────────── */}
                {isLeagueMode ? (
                  <div className='space-y-4'>

                    {/* ── Entry area: new / being-edited matches ──────────── */}
                    {leagueMatches.length > 0 && (
                      <div className='space-y-3'>
                        {leagueMatches.map((match, mi) => (
                          <div key={`entry-${match.match_number}`} className='rounded-xl border border-emerald-200 bg-emerald-50/40 p-4'>
                            <div className='flex items-center justify-between mb-3'>
                              <span className='text-xs font-semibold text-emerald-700 uppercase tracking-wide'>
                                Match {match.match_number}
                              </span>
                              <button
                                onClick={() => removeLeagueMatch(mi)}
                                className='rounded p-1 text-red-400 hover:bg-red-50'
                                title='Remove'
                              ><X size={13} /></button>
                            </div>

                            {match.rows.map((row, ri) => (
                              <div key={ri} className='mb-3 last:mb-0'>
                                {ri === 1 && (
                                  <div className='text-center my-1'>
                                    <span className='text-xs font-bold text-gray-400'>VS</span>
                                  </div>
                                )}
                                <div className='flex flex-wrap items-center gap-2'>
                                  <select
                                    value={row.team_id}
                                    onChange={e => updateLeagueRow(mi, ri, { team_id: e.target.value, player_names: [] })}
                                    className='flex-1 min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm'
                                  >
                                    <option value=''>— Select team —</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                  </select>
                                  <div className='flex items-center gap-1'>
                                    <input
                                      type='number'
                                      min={0}
                                      value={row.points}
                                      onChange={e => updateLeagueRow(mi, ri, { points: Number(e.target.value) })}
                                      className='w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm text-center'
                                    />
                                    <span className='text-xs text-gray-400'>pts</span>
                                  </div>
                                </div>
                                {needsPlayerNames(selCat.event_type) && row.team_id && (
                                  <PlayerDropdowns
                                    teamId={row.team_id}
                                    playerNames={row.player_names}
                                    slots={playerSlots(selCat.event_type)}
                                    onChange={names => updateLeagueRow(mi, ri, { player_names: names })}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ))}

                        {resultError && <p className='text-xs text-red-600'>{resultError}</p>}
                        {resultMsg   && <p className='text-xs text-emerald-600 font-semibold'>{resultMsg}</p>}

                        <div className='flex gap-2'>
                          <button
                            onClick={saveLeagueResults}
                            disabled={resultSaving}
                            className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'
                          >
                            {resultSaving ? 'Saving…' : <><Save size={13} />Save</>}
                          </button>
                          <button
                            onClick={addLeagueMatch}
                            className='inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50'
                          >
                            <Plus size={13} /> Add Match
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Add first match button (when entry area is empty) ── */}
                    {leagueMatches.length === 0 && (
                      <div>
                        {resultError && <p className='mb-2 text-xs text-red-600'>{resultError}</p>}
                        {resultMsg   && <p className='mb-2 text-xs text-emerald-600 font-semibold'>{resultMsg}</p>}
                        <button
                          onClick={addLeagueMatch}
                          className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700'
                        >
                          <Plus size={13} /> Add Match
                        </button>
                      </div>
                    )}

                    {/* ── Post-save confirmation (just the batch that was saved) ── */}
                    {lastSavedBatch.length > 0 && (
                      <div className='mt-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3'>
                        <p className='text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2'>Just saved ✓</p>
                        <div className='space-y-2'>
                          {lastSavedBatch.map(match => (
                            <div key={match.match_number}>
                              <p className='text-xs font-medium text-gray-500 mb-1'>Match {match.match_number}</p>
                              {match.rows.filter(r => r.team_id).map((row, ri) => {
                                const teamName = teams.find(t => t.id === row.team_id)?.name ?? row.team_id
                                return (
                                  <div key={ri} className='flex items-center justify-between text-sm py-0.5'>
                                    <span className='font-medium text-gray-800'>
                                      {teamName}
                                      {row.player_names.length > 0 && (
                                        <span className='ml-2 text-xs text-gray-500'>({row.player_names.join(' & ')})</span>
                                      )}
                                    </span>
                                    <span className='text-emerald-600 font-semibold shrink-0'>{row.points} pts</span>
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── KNOCKOUT MODE ──────────────────────────────────────── */
                  <div>
                    <p className='text-xs text-gray-400 mb-3'>Points auto-loaded from scoring rules</p>
                    <div className='space-y-3'>
                      {resultEntries.map((entry, idx) => {
                        const showPlayers = needsPlayerNames(selCat.event_type)
                        const slots       = playerSlots(selCat.event_type)

                        return (
                          <div key={idx} className='flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50'>
                            <div className='flex flex-wrap items-center gap-3'>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold min-w-[72px] text-center ${MEDAL_COLORS[entry.rank] || 'bg-gray-100 text-gray-600'}`}>
                                {MEDAL_LABELS[entry.rank] || `Rank ${entry.rank}`}
                              </span>
                              <select
                                value={entry.team_id}
                                onChange={e => setResultEntries(prev => prev.map((en, i) =>
                                  i === idx ? { ...en, team_id: e.target.value, player_names: [] } : en
                                ))}
                                className='flex-1 min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm'
                              >
                                <option value=''>— Select team —</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                              <div className='flex items-center gap-1'>
                                <input
                                  type='number'
                                  value={entry.points}
                                  min={0}
                                  onChange={e => setResultEntries(prev => prev.map((en, i) => i === idx ? { ...en, points: Number(e.target.value) } : en))}
                                  className='w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm text-center'
                                />
                                <span className='text-xs text-gray-400'>pts</span>
                              </div>
                              <input
                                type='text'
                                placeholder='Remarks (optional)'
                                value={entry.remarks}
                                onChange={e => setResultEntries(prev => prev.map((en, i) => i === idx ? { ...en, remarks: e.target.value } : en))}
                                className='flex-1 min-w-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm'
                              />
                            </div>

                            {/* Player dropdowns */}
                            {showPlayers && entry.team_id && (
                              <div className='pl-1'>
                                <label className='block text-xs font-semibold text-gray-500 mb-1'>
                                  {slots === 1 ? 'Player' : `Players (${slots})`}
                                  {entry.team_id && (playersByTeam[entry.team_id] ?? []).length === 0 && (
                                    <span className='ml-1 font-normal text-orange-500'>(no players uploaded)</span>
                                  )}
                                </label>
                                <PlayerDropdowns
                                  teamId={entry.team_id}
                                  playerNames={entry.player_names}
                                  slots={slots}
                                  onChange={names => setResultEntries(prev => prev.map((en, i) =>
                                    i === idx ? { ...en, player_names: names } : en
                                  ))}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setResultEntries(prev => [...prev, { rank: prev.length + 1, team_id: '', points: 0, remarks: '', player_names: [] }])}
                      className='mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline'
                    >
                      <Plus size={12} /> Add rank
                    </button>

                    {resultError && <p className='mt-3 text-xs text-red-600'>{resultError}</p>}
                    {resultMsg   && <p className='mt-3 text-xs text-emerald-600 font-semibold'>{resultMsg}</p>}

                    <div className='mt-4 flex gap-2'>
                      <button onClick={saveResults} disabled={resultSaving} className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                        {resultSaving ? 'Saving…' : <><Save size={13} />Save Results</>}
                      </button>
                    </div>

                    {/* Saved results */}
                    {results.length > 0 && (
                      <div className='mt-5'>
                        <p className='text-xs font-semibold text-gray-600 mb-2'>Saved Results</p>
                        <div className='space-y-1'>
                          {results.map(r => (
                            <div key={r.id} className='flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm'>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.rank != null ? (MEDAL_COLORS[r.rank] || 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'}`}>
                                {r.rank != null ? (MEDAL_LABELS[r.rank] || `Rank ${r.rank}`) : '—'}
                              </span>
                              <div className='flex-1 min-w-0'>
                                <span className='font-medium text-gray-800'>{(r as Result & { team?: Team }).team?.name ?? r.team_id}</span>
                                {r.player_names && r.player_names.length > 0 && (
                                  <span className='ml-2 text-xs text-gray-500'>({r.player_names.join(' & ')})</span>
                                )}
                                {r.remarks && <span className='ml-1 text-gray-400 text-xs italic'>{r.remarks}</span>}
                              </div>
                              <span className='text-gray-500 shrink-0'>{r.points_awarded} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
