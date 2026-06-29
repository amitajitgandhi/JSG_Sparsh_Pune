'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DASHBOARDS, type DashboardColor } from './dashboards.config'

// Tailwind needs literal class names — map colour → the classes we use.
const COLOR: Record<DashboardColor, { border: string; text: string; textHover: string; arrow: string }> = {
  blue:    { border: 'border-blue-200',    text: 'text-blue-700',    textHover: 'group-hover:text-blue-800',    arrow: 'text-blue-500' },
  emerald: { border: 'border-emerald-200', text: 'text-emerald-700', textHover: 'group-hover:text-emerald-800', arrow: 'text-emerald-500' },
  violet:  { border: 'border-violet-200',  text: 'text-violet-700',  textHover: 'group-hover:text-violet-800',  arrow: 'text-violet-500' },
  orange:  { border: 'border-orange-200',  text: 'text-orange-700',  textHover: 'group-hover:text-orange-800',  arrow: 'text-orange-500' },
  sky:     { border: 'border-sky-200',     text: 'text-sky-700',     textHover: 'group-hover:text-sky-800',     arrow: 'text-sky-500' },
  rose:    { border: 'border-rose-200',    text: 'text-rose-700',    textHover: 'group-hover:text-rose-800',    arrow: 'text-rose-500' },
  amber:   { border: 'border-amber-200',   text: 'text-amber-700',   textHover: 'group-hover:text-amber-800',   arrow: 'text-amber-500' },
  teal:    { border: 'border-teal-200',    text: 'text-teal-700',    textHover: 'group-hover:text-teal-800',    arrow: 'text-teal-500' },
}

interface ArchiveTarget { slug: string; label: string; tables: string[] }

function downloadBackup(slug: string, exported: Record<string, any[]>) {
  try {
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch { /* download is best-effort */ }
}

export default function AdminIndex() {
  const [archived, setArchived] = useState<string[]>([])
  const [target, setTarget]     = useState<ArchiveTarget | null>(null) // tile being archived
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy]         = useState(false)
  const [err, setErr]           = useState('')

  const loadArchived = async () => {
    try {
      const res  = await fetch('/api/admin/dashboards', { cache: 'no-store' })
      const data = await res.json()
      setArchived(Array.isArray(data?.archived) ? data.archived : [])
    } catch { /* show everything if the call fails */ }
  }

  useEffect(() => { loadArchived() }, [])

  const closeModal = () => { setTarget(null); setConfirmText(''); setErr(''); setBusy(false) }

  const archive = async (slug: string, mode: 'tile' | 'tile_and_data') => {
    setBusy(true); setErr('')
    try {
      const res  = await fetch('/api/admin/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to archive')
      if (mode === 'tile_and_data' && data?.export) downloadBackup(slug, data.export)
      setArchived(Array.isArray(data?.archived) ? data.archived : [...archived, slug])
      closeModal()
    } catch (e: any) {
      setErr(e?.message || 'Failed to archive')
      setBusy(false)
    }
  }

  const visible = DASHBOARDS.filter(d => !archived.includes(d.slug))

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10'>
      <div className='max-w-xl w-full space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>JSG Pune Sparsh - Admin Portal</h1>
          <p className='text-gray-600 text-sm'>Select a dashboard to manage registrations.</p>
        </div>

        <div className='grid gap-5'>
          {visible.map(d => {
            const c = COLOR[d.color]
            return (
              <div key={d.slug} className={`group relative rounded-2xl border ${c.border} bg-white p-6 shadow hover:shadow-md transition`}>
                <Link href={d.href} className='block'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='pr-2'>
                      <h2 className={`text-xl font-semibold ${c.text} ${c.textHover}`}>{d.label}</h2>
                      <p className='text-sm text-gray-600 mt-1'>{d.description}</p>
                    </div>
                    <span className={`${c.arrow} text-2xl`}>&rarr;</span>
                  </div>
                </Link>
                {d.archivable && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTarget({ slug: d.slug, label: d.label, tables: d.tables }) }}
                    className='absolute top-3 right-3 rounded-md border border-gray-200 bg-white/90 px-2 py-1 text-[11px] font-semibold text-gray-500 hover:text-red-600 hover:border-red-300 transition'
                  >
                    Archive
                  </button>
                )}
              </div>
            )
          })}
          {visible.length === 0 && (
            <div className='text-center text-sm text-gray-400 py-10'>No active dashboards.</div>
          )}
        </div>
      </div>

      {/* Archive modal */}
      {target && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4' onClick={closeModal}>
          <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl' onClick={(e) => e.stopPropagation()}>
            <div className='border-b border-gray-100 p-5'>
              <h3 className='text-lg font-bold text-gray-900'>Archive “{target.label}”</h3>
              <p className='mt-1 text-sm text-gray-600'>This removes the tile from the admin portal. Choose how far the cleanup should go.</p>
            </div>

            <div className='space-y-4 p-5'>
              {/* Option 1: tile only */}
              <button
                disabled={busy}
                onClick={() => archive(target.slug, 'tile')}
                className='w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-left transition hover:border-gray-400 disabled:opacity-50'
              >
                <p className='font-semibold text-gray-900'>Remove tile only</p>
                <p className='text-xs text-gray-500 mt-0.5'>Hides the tile. All Supabase data is kept intact.</p>
              </button>

              {/* Option 2: tile + data (destructive, type-to-confirm) */}
              <div className='rounded-xl border-2 border-red-200 px-4 py-3'>
                <p className='font-semibold text-red-700'>Remove tile + delete event data</p>
                {target.tables.length > 0 ? (
                  <>
                    <p className='text-xs text-gray-600 mt-1'>
                      A JSON backup downloads first, then these table(s) are wiped:
                    </p>
                    <p className='text-xs font-mono text-red-700 mt-1'>{target.tables.join(', ')}</p>
                    <p className='text-xs text-gray-600 mt-3'>Type <strong>{target.label}</strong> to confirm:</p>
                    <input
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value)}
                      className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none'
                      placeholder={target.label}
                    />
                    <button
                      disabled={busy || confirmText.trim() !== target.label}
                      onClick={() => archive(target.slug, 'tile_and_data')}
                      className='mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40'
                    >
                      {busy ? 'Working…' : 'Export & delete data'}
                    </button>
                  </>
                ) : (
                  <p className='text-xs text-gray-500 mt-1'>This dashboard owns no data tables — use “Remove tile only”.</p>
                )}
              </div>

              {err && <p className='rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700'>{err}</p>}

              <button onClick={closeModal} disabled={busy} className='w-full rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
