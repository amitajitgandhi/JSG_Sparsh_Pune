'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RefreshCw, ArrowLeft, Users, Dumbbell, LayoutList, Trophy, Plus, Pencil, Trash2, Check, X, Save, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tournament, Team, Sport, EventCategory, ScoringRule, Result } from '@/lib/tournament/types'
import {
  getTeamsByTournament, upsertTeam, deleteTeam,
  getSports, upsertSport, deleteSport,
  getCategoriesByTournament, upsertCategory, deleteCategory, markCategoryCompleted,
  getScoringRules, replaceScoringRules,
  getResultsByCategory, upsertResult, deleteResultsByCategory,
} from '@/lib/tournament/service'

type Tab = 'teams' | 'sports' | 'events' | 'results'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'teams',   label: 'Teams',   icon: <Users size={15} /> },
  { key: 'sports',  label: 'Sports',  icon: <Dumbbell size={15} /> },
  { key: 'events',  label: 'Events',  icon: <LayoutList size={15} /> },
  { key: 'results', label: 'Results', icon: <Trophy size={15} /> },
]

const MEDAL_COLORS = ['', 'bg-yellow-100 text-yellow-700', 'bg-gray-100 text-gray-600', 'bg-orange-100 text-orange-700']
const MEDAL_LABELS = ['', '🥇 Gold', '🥈 Silver', '🥉 Bronze']

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

  // ── Results state ─────────────────────────────────────────────────────────
  const [selCatId,     setSelCatId]     = useState('')
  const [results,      setResults]      = useState<Result[]>([])
  const [resultSaving, setResultSaving] = useState(false)
  const [resultEntries, setResultEntries] = useState<Array<{ rank: number; team_id: string; points: number; remarks: string; player_names: string[] }>>([
    { rank: 1, team_id: '', points: 0, remarks: '', player_names: [] },
    { rank: 2, team_id: '', points: 0, remarks: '', player_names: [] },
    { rank: 3, team_id: '', points: 0, remarks: '', player_names: [] },
  ])
  const [resultError, setResultError] = useState('')
  const [resultMsg,   setResultMsg]   = useState('')
  // players per team for the current tournament, keyed by team_id
  const [playersByTeam, setPlayersByTeam] = useState<Record<string, string[]>>({})

  // ── Load tournament ───────────────────────────────────────────────────────
  const loadTournament = useCallback(async () => {
    const { data } = await supabase.from('sports_tournaments').select('*').eq('id', id).single()
    setTournament(data as Tournament)
  }, [id])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      loadTournament(),
      getTeamsByTournament(id).then(async r => {
        setTeams(r.data)
        // Load khelotsav players grouped by team for player name dropdown
        const { data: kp } = await supabase
          .from('khelotsav_players')
          .select('team_name, player_name')
          .eq('tournament', 'khelotsav-2026')
          .order('sr_no', { ascending: true })
        if (kp && r.data.length) {
          const map: Record<string, string[]> = {}
          for (const team of r.data) {
            const names = (kp as { team_name: string; player_name: string }[])
              .filter(p => p.team_name === team.name)
              .map(p => p.player_name)
            if (names.length) map[team.id] = names
          }
          setPlayersByTeam(map)
        }
      }),
      getSports().then(r => setSports(r.data)),
      getCategoriesByTournament(id).then(r => setCategories(r.data)),
    ])
    setLoading(false)
  }, [id, loadTournament])

  useEffect(() => { loadAll() }, [loadAll])

  // Returns true when the event type requires individual player name selection
  // (Singles or Doubles → 1-2 players per result row)
  const needsPlayerNames = (eventType: string) =>
    /singles|doubles/i.test(eventType)

  // ── Auto-load points from scoring rules ───────────────────────────────────
  const loadScoringForEntry = useCallback(async (catId: string) => {
    if (!catId) return
    const { data: rules } = await getScoringRules(catId)
    setResultEntries(prev => prev.map(e => {
      const rule = rules.find(r => r.rank === e.rank)
      return rule ? { ...e, points: rule.points } : e
    }))
    const existingResults = await getResultsByCategory(catId)
    setResults(existingResults.data)
    // Pre-fill player_names from existing saved results
    setResultEntries(prev => prev.map(e => {
      const existing = existingResults.data.find(r => r.rank === e.rank)
      return existing
        ? { ...e, team_id: existing.team_id, points: existing.points_awarded, remarks: existing.remarks ?? '', player_names: existing.player_names ?? [] }
        : e
    }))
  }, [])

  useEffect(() => { if (selCatId) loadScoringForEntry(selCatId) }, [selCatId, loadScoringForEntry])

  // ── Load rules for event expansion ───────────────────────────────────────
  const loadCatRules = useCallback(async (catId: string) => {
    const { data } = await getScoringRules(catId)
    setCatRules(data)
    setRulesInput(data.map(r => ({ rank: r.rank, points: r.points })))
  }, [])

  useEffect(() => { if (expandedCat) loadCatRules(expandedCat) }, [expandedCat, loadCatRules])

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
  // RESULT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const saveResults = async () => {
    setResultError(''); setResultMsg('')
    const filled = resultEntries.filter(e => e.team_id)
    if (filled.length === 0) { setResultError('Select at least one team.'); return }
    // Validate no duplicate teams
    const teamIds = filled.map(e => e.team_id)
    if (new Set(teamIds).size !== teamIds.length) { setResultError('Duplicate teams selected.'); return }

    setResultSaving(true)
    // Delete old then insert fresh
    await deleteResultsByCategory(selCatId)
    for (const e of filled) {
      const selCat = categories.find(c => c.id === selCatId)
      const pnames = selCat && needsPlayerNames(selCat.event_type) ? e.player_names : []
      await upsertResult({
        event_category_id: selCatId,
        team_id: e.team_id,
        rank: e.rank,
        points_awarded: e.points,
        remarks: e.remarks || null,
        player_names: pnames.length ? pnames : null,
      })
    }
    setResultSaving(false)
    setResultMsg('Results saved successfully.')
    loadScoringForEntry(selCatId)
    // Mark category completed
    await markCategoryCompleted(selCatId, true)
    getCategoriesByTournament(id).then(r => setCategories(r.data))
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
              <button onClick={() => setCatForm({ event_type: 'Individual', gender_category: 'Open', age_category: 'Open', display_order: categories.length })}
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
                      <p className='text-xs text-gray-500'>{cat.sport?.name} · {cat.event_type} · {cat.gender_category} · {cat.age_category}</p>
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

        {/* ══ RESULTS TAB ════════════════════════════════════════════════════ */}
        {tab === 'results' && (
          <div className='space-y-4'>
            <h2 className='font-bold text-gray-800'>Enter Results</h2>

            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Select Event Category</label>
              <select value={selCatId} onChange={e => { setSelCatId(e.target.value); setResultMsg(''); setResultError('') }} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm max-w-md'>
                <option value=''>— Choose event —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.sport?.icon} {c.name} {c.is_completed ? '✓' : ''}</option>
                ))}
              </select>
            </div>

            {selCatId && (
              <div className='bg-white rounded-2xl border border-gray-200 shadow p-5'>
                <h3 className='font-semibold text-gray-800 mb-4'>
                  {categories.find(c => c.id === selCatId)?.name}
                  <span className='ml-2 text-xs font-normal text-gray-400'>(points auto-loaded from scoring rules)</span>
                </h3>

                <div className='space-y-3'>
                  {resultEntries.map((entry, idx) => {
                    const selCat = categories.find(c => c.id === selCatId)
                    const showPlayers = selCat && needsPlayerNames(selCat.event_type)
                    const teamPlayers = entry.team_id ? (playersByTeam[entry.team_id] ?? []) : []

                    return (
                      <div key={idx} className='flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50'>
                        {/* Row 1: medal · team · points · remarks */}
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

                        {/* Row 2: player name selector (Individual / Doubles only) */}
                        {showPlayers && entry.team_id && (
                          <div className='pl-1'>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>
                              Player{selCat.event_type.toLowerCase().includes('doubles') ? 's (select 2)' : ' name'}
                              {teamPlayers.length === 0 && <span className='ml-1 font-normal text-orange-500'>(no players uploaded for this team)</span>}
                            </label>
                            {teamPlayers.length > 0 ? (
                              <div className='flex flex-wrap gap-1.5'>
                                {teamPlayers.map(name => {
                                  const selected = entry.player_names.includes(name)
                                  return (
                                    <button
                                      key={name}
                                      type='button'
                                      onClick={() => setResultEntries(prev => prev.map((en, i) => {
                                        if (i !== idx) return en
                                        const isDoubles = selCat.event_type.toLowerCase().includes('doubles')
                                        if (selected) return { ...en, player_names: en.player_names.filter(n => n !== name) }
                                        // Singles: allow only 1; Doubles: allow max 2
                                        if (!isDoubles && en.player_names.length >= 1) return { ...en, player_names: [name] }
                                        if (isDoubles  && en.player_names.length >= 2) return en
                                        return { ...en, player_names: [...en.player_names, name] }
                                      }))}
                                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                        selected
                                          ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                                          : 'border-gray-300 bg-white text-gray-600 hover:border-emerald-300'
                                      }`}
                                    >
                                      {name}
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <input
                                type='text'
                                placeholder='Enter player name manually'
                                value={entry.player_names.join(', ')}
                                onChange={e => setResultEntries(prev => prev.map((en, i) =>
                                  i === idx ? { ...en, player_names: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : en
                                ))}
                                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Add more ranks */}
                <button onClick={() => setResultEntries(prev => [...prev, { rank: prev.length + 1, team_id: '', points: 0, remarks: '', player_names: [] }])}
                  className='mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline'>
                  <Plus size={12} /> Add rank
                </button>

                {resultError && <p className='mt-3 text-xs text-red-600'>{resultError}</p>}
                {resultMsg   && <p className='mt-3 text-xs text-emerald-600 font-semibold'>{resultMsg}</p>}

                <div className='mt-4 flex gap-2'>
                  <button onClick={saveResults} disabled={resultSaving} className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                    {resultSaving ? 'Saving…' : <><Save size={13} />Save Results</>}
                  </button>
                </div>

                {/* Existing results */}
                {results.length > 0 && (
                  <div className='mt-5'>
                    <p className='text-xs font-semibold text-gray-600 mb-2'>Saved Results</p>
                    <div className='space-y-1'>
                      {results.map(r => (
                        <div key={r.id} className='flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm'>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${MEDAL_COLORS[r.rank] || 'bg-gray-100 text-gray-600'}`}>
                            {MEDAL_LABELS[r.rank] || `Rank ${r.rank}`}
                          </span>
                          <div className='flex-1 min-w-0'>
                            <span className='font-medium text-gray-800'>{(r as Result & { team?: Team }).team?.name ?? r.team_id}</span>
                            {r.player_names && r.player_names.length > 0 && (
                              <span className='ml-2 text-xs text-gray-500'>({r.player_names.join(', ')})</span>
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
    </div>
  )
}
