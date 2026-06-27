'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, RefreshCw, Pencil, Trophy, CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Tournament } from '@/lib/tournament/types'
import LeaderboardConfig from './LeaderboardConfig'

export default function TournamentListPage() {
  const [rows,      setRows]      = useState<Tournament[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form,      setForm]      = useState({ name: '', slug: '', description: '', start_date: '', end_date: '' })
  const [formError, setFormError] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error: err } = await supabase.from('sports_tournaments').select('*').order('created_at', { ascending: false })
    setRows((data ?? []) as Tournament[])
    setError(err?.message ?? null)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { setFormError('Name and Slug are required.'); return }
    setSaving(true)
    setFormError('')
    const { error: err } = await supabase.from('sports_tournaments').insert({
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || null,
      start_date: form.start_date || null,
      end_date:   form.end_date   || null,
    })
    setSaving(false)
    if (err) { setFormError(err.message); return }
    setForm({ name: '', slug: '', description: '', start_date: '', end_date: '' })
    setShowForm(false)
    load()
  }

  const toggleActive = async (t: Tournament) => {
    await supabase.from('sports_tournaments').update({ is_active: !t.is_active }).eq('id', t.id)
    load()
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-extrabold text-gray-900'>🏆 Tournament Management</h1>
            <p className='text-sm text-gray-500 mt-1'>Create and manage sports tournaments.</p>
          </div>
          <div className='flex gap-2'>
            <button onClick={load} disabled={loading} className='inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50'>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowForm(true)} className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700'>
              <Plus size={15} /> New Tournament
            </button>
          </div>
        </div>

        {error && <div className='mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700'>{error}</div>}

        {/* Leaderboard auto-refresh + audio config (relocated from admin-config) */}
        <details className='mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm'>
          <summary className='cursor-pointer select-none px-6 py-4 text-sm font-bold text-gray-800'>
            ⚙️ Leaderboard Settings (auto-refresh &amp; audio)
          </summary>
          <div className='px-2 pb-2 sm:px-4 sm:pb-4'>
            <LeaderboardConfig />
          </div>
        </details>

        {/* Create form */}
        {showForm && (
          <div className='mb-6 bg-white rounded-2xl border border-emerald-200 shadow p-5'>
            <h3 className='font-bold text-gray-800 mb-4'>New Tournament</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500' placeholder='Khelotsav 2026' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Slug * (URL-friendly)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500' placeholder='khelotsav-2026' />
              </div>
              <div className='sm:col-span-2'>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Start Date</label>
                <input type='date' value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>End Date</label>
                <input type='date' value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500' />
              </div>
            </div>
            {formError && <p className='mt-2 text-xs text-red-600'>{formError}</p>}
            <div className='mt-4 flex gap-2 justify-end'>
              <button onClick={() => { setShowForm(false); setFormError('') }} className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100'>Cancel</button>
              <button onClick={handleSave} disabled={saving} className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60'>
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className='text-center py-16 bg-white rounded-2xl shadow'>
            <RefreshCw className='mx-auto h-8 w-8 animate-spin text-gray-400 mb-3' />
            <p className='text-gray-500 text-sm'>Loading…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-2xl shadow'>
            <Trophy className='mx-auto h-12 w-12 text-gray-300 mb-4' />
            <p className='text-gray-500'>No tournaments yet. Create one above.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {rows.map(t => (
              <div key={t.id} className='bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-bold text-gray-900'>{t.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-0.5'>/{t.slug}</p>
                  {(t.start_date || t.end_date) && (
                    <div className='flex items-center gap-1 mt-1 text-xs text-gray-500'>
                      <CalendarDays size={12} />
                      {t.start_date ?? '?'} → {t.end_date ?? '?'}
                    </div>
                  )}
                </div>
                <div className='flex gap-2 flex-wrap'>
                  <button onClick={() => toggleActive(t)} className='inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50'>
                    {t.is_active ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                    {t.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link href={`/admin/tournament/${t.id}`} className='inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700'>
                    <Pencil size={13} /> Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
