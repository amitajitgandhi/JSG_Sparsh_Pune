'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Download, Upload, RefreshCw, Trash2, Users, CheckCircle2, AlertCircle, X } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface KhelotsavPlayer {
  id?: string
  tournament: string
  team_name: string
  player_name: string
  mobile?: string
  age?: number | string
  gender?: string
  jersey_size?: string
  category?: string
  photo_url?: string
  sr_no?: number | string
}

type UploadStatus = 'idle' | 'parsing' | 'uploading' | 'done' | 'error'

// ── CSV template columns (must match DB) ─────────────────────────────────────
const TEMPLATE_HEADERS = [
  'sr_no', 'team_name', 'player_name', 'mobile', 'age',
  'gender', 'jersey_size', 'category', 'photo_url',
]

const TEMPLATE_SAMPLE_ROWS = [
  ['1', 'Team Alpha', 'Rahul Jain', '9876543210', '28', 'Male', 'L - 40', 'Member', ''],
  ['2', 'Team Alpha', 'Priya Shah', '9123456789', '24', 'Female', 'S - 36', 'Member', ''],
  ['3', 'Team Beta',  'Amit Mehta', '9988776655', '13', 'Male', 'M - 38', 'Kid', ''],
]

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE_ROWS]
  const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'khelotsav_players_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Simple CSV parser ─────────────────────────────────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,))/g) ?? []
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (vals[i] ?? '').replace(/^"|"$/g, '').trim()
    })
    return row
  }).filter(r => r['player_name'] && r['team_name'])
}

function normalizeTeamKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function toDisplayTeamName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

// ── Admin component ───────────────────────────────────────────────────────────
export default function KhelotsavPlayersAdmin() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [rows,   setRows]   = useState<KhelotsavPlayer[]>([])
  const [total,  setTotal]  = useState(0)
  const [teams,  setTeams]  = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [status,  setStatus]  = useState<UploadStatus>('idle')
  const [preview, setPreview] = useState<KhelotsavPlayer[]>([])
  const [msg,     setMsg]     = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting,      setDeleting]      = useState(false)

  const TOURNAMENT = 'khelotsav-2026'

  // ── Load ─────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('khelotsav_players')
      .select('*')
      .eq('tournament', TOURNAMENT)
      .order('team_name')
      .order('sr_no', { ascending: true })
    const players = (data ?? []) as KhelotsavPlayer[]
    setRows(players)
    setTotal(players.length)
    setTeams([...new Set(players.map(p => p.team_name))])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Parse uploaded file ───────────────────────────────────────────────────
  const handleFile = (file: File) => {
    if (!file) return
    setStatus('parsing')
    setMsg('')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseCsv(e.target?.result as string)
        if (!parsed.length) { setStatus('error'); setMsg('No valid rows found. Check your CSV format.'); return }
        const teamMap = new Map<string, string>()
        const players: KhelotsavPlayer[] = parsed.map((r, i) => {
          const rawTeam = r['team_name'] || ''
          const key = normalizeTeamKey(rawTeam)
          const canonicalTeam = teamMap.get(key) ?? toDisplayTeamName(rawTeam)
          if (!teamMap.has(key)) teamMap.set(key, canonicalTeam)

          return {
            tournament:  TOURNAMENT,
            sr_no:       r['sr_no'] ? parseInt(r['sr_no']) : i + 1,
            team_name:   canonicalTeam,
            player_name: r['player_name'],
            mobile:      r['mobile']      || undefined,
            age:         r['age']         ? parseInt(r['age']) : undefined,
            gender:      r['gender']      || undefined,
            jersey_size: r['jersey_size'] || undefined,
            category:    r['category']    || undefined,
            photo_url:   r['photo_url']   || undefined,
          }
        })
        setPreview(players)
        setStatus('idle')
        setMsg(`${players.length} players parsed from CSV. Review below and click Upload.`)
      } catch {
        setStatus('error')
        setMsg('Failed to parse CSV. Please use the template format.')
      }
    }
    reader.readAsText(file)
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!preview.length) return
    setStatus('uploading')
    setMsg('')

    // Delete existing data for this tournament first
    await supabase.from('khelotsav_players').delete().eq('tournament', TOURNAMENT)

    // Insert in batches of 200
    const batchSize = 200
    for (let i = 0; i < preview.length; i += batchSize) {
      const batch = preview.slice(i, i + batchSize)
      const { error } = await supabase.from('khelotsav_players').insert(batch)
      if (error) { setStatus('error'); setMsg(`Upload failed: ${error.message}`); return }
    }

    setStatus('done')
    setMsg(`✅ ${preview.length} players uploaded successfully.`)
    setPreview([])
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  // ── Delete all ────────────────────────────────────────────────────────────
  const handleDeleteAll = async () => {
    setDeleting(true)
    await supabase.from('khelotsav_players').delete().eq('tournament', TOURNAMENT)
    setDeleteConfirm(false)
    setDeleting(false)
    setMsg('All player data cleared.')
    load()
  }

  // ── Export current DB data ────────────────────────────────────────────────
  const exportCsv = () => {
    if (!rows.length) return
    const headers = TEMPLATE_HEADERS
    const lines = [
      headers.join(','),
      ...rows.map(r => [
        r.sr_no ?? '', r.team_name, r.player_name, r.mobile ?? '',
        r.age ?? '', r.gender ?? '', r.jersey_size ?? '', r.category ?? '', r.photo_url ?? '',
      ].map(c => `"${c}"`).join(','))
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'khelotsav_players_export.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Khelotsav Players — Admin</h1>
              <p className="text-sm text-gray-500 mt-0.5">Upload team-wise player data for display on the public teams page.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              {rows.length > 0 && (
                <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 shadow-sm transition">
                  <Download size={14} /> Export Current
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-indigo-600">{total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Players</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-emerald-600">{teams.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Teams</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-amber-100 bg-white p-4 shadow-sm text-center">
              <p className="text-2xl font-extrabold text-amber-600">{total > 0 ? Math.round(total / Math.max(teams.length, 1)) : 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">Avg per Team</p>
            </div>
          </div>
        )}

        {/* Template Download */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-orange-800">Step 1 — Download Template</h2>
              <p className="text-sm text-orange-700 mt-0.5">
                Download the CSV template, fill in player data (one row per player), then upload below.
              </p>
              <p className="text-xs text-orange-600 mt-1.5 font-mono">
                Columns: {TEMPLATE_HEADERS.join(' · ')}
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 shadow transition shrink-0"
            >
              <Download size={15} /> Download Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-3">Step 2 — Upload Filled CSV</h2>
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-8 cursor-pointer hover:bg-sky-100 transition"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            <Upload size={28} className="text-sky-500 mb-2" />
            <p className="text-sm font-semibold text-sky-700">Click to select or drag & drop CSV file</p>
            <p className="text-xs text-sky-500 mt-1">Only .csv files accepted</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          {msg && (
            <div className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
              {status === 'error' ? <AlertCircle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
              {msg}
            </div>
          )}

          {preview.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">{preview.length} players ready to upload</p>
                <div className="flex gap-2">
                  <button onClick={() => { setPreview([]); setMsg(''); if (fileRef.current) fileRef.current.value = '' }}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition">
                    <X size={12} /> Clear
                  </button>
                  <button onClick={handleUpload} disabled={status === 'uploading'}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60 shadow transition">
                    {status === 'uploading' ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                    {status === 'uploading' ? 'Uploading…' : 'Upload Now'}
                  </button>
                </div>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>{['#', 'Team', 'Player', 'Mobile', 'Age', 'Gender', 'Category'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.slice(0, 10).map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-400">{p.sr_no}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-700">{p.team_name}</td>
                        <td className="px-3 py-1.5">{p.player_name}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.mobile}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.age}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.gender}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <p className="px-3 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                    …and {preview.length - 10} more rows
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Danger zone */}
        {rows.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-red-800">Danger Zone</h2>
                <p className="text-sm text-red-700 mt-0.5">Permanently delete all {total} player records for this tournament.</p>
              </div>
              {!deleteConfirm ? (
                <button onClick={() => setDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 shadow-sm transition">
                  <Trash2 size={14} /> Delete All
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setDeleteConfirm(false)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleDeleteAll} disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 transition">
                    {deleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Yes, Delete All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current teams summary */}
        {!loading && teams.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users size={16} /> Teams in DB</h2>
            <div className="flex flex-wrap gap-2">
              {teams.map(t => {
                const count = rows.filter(r => r.team_name === t).length
                return (
                  <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                    {t} <span className="rounded-full bg-sky-200 px-1.5 py-0.5 text-sky-700">{count}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
