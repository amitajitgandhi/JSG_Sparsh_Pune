'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const UPCOMING_OPTIONS = [
  { label: '/events/upcoming', value: '/events/upcoming' },
]

const INTERVAL_OPTIONS = [1, 2, 5, 10, 15, 30]

function SaveBanner({ msg }: { msg: string }) {
  if (!msg) return null
  const ok = msg.includes('✓') || msg.includes('successfully')
  return (
    <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
      {msg}
    </div>
  )
}

export default function AdminConfigPage() {
  // ── Upcoming Button ──────────────────────────────────────────────────────
  const [target,    setTarget]    = useState('/events/khelotsav')
  const [isCustom,  setIsCustom]  = useState(true)
  const [upLoading, setUpLoading] = useState(true)
  const [upSaving,  setUpSaving]  = useState(false)
  const [upMsg,     setUpMsg]     = useState('')

  const loadUpcoming = async () => {
    try {
      const res  = await fetch('/api/admin/upcoming-event-target', { cache: 'no-store' })
      const data = await res.json()
      if (data?.target) {
        setTarget(data.target)
        setIsCustom(!UPCOMING_OPTIONS.some(o => o.value === data.target))
      }
    } catch { /* keep defaults */ }
    finally { setUpLoading(false) }
  }

  const saveUpcoming = async () => {
    setUpSaving(true); setUpMsg('')
    try {
      if (!target?.trim()) throw new Error('URL cannot be empty')
      if (!target.startsWith('/')) throw new Error('URL must start with /')
      const res  = await fetch('/api/admin/upcoming-event-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      await loadUpcoming()
      setUpMsg('Saved successfully! ✓')
      setTimeout(() => setUpMsg(''), 3000)
    } catch (e: any) {
      setUpMsg(e?.message || 'Failed to save')
    } finally { setUpSaving(false) }
  }

  // ── Leaderboard Auto-refresh ─────────────────────────────────────────────
  const [arEnabled,   setArEnabled]   = useState(false)
  const [arInterval,  setArInterval]  = useState(5)
  const [arLoading,   setArLoading]   = useState(true)
  const [arSaving,    setArSaving]    = useState(false)
  const [arMsg,       setArMsg]       = useState('')

  const loadAutoRefresh = async () => {
    try {
      const res  = await fetch('/api/admin/leaderboard-config', { cache: 'no-store' })
      const data = await res.json()
      setArEnabled(!!data.enabled)
      setArInterval(data.intervalMins ?? 5)
    } catch { /* keep defaults */ }
    finally { setArLoading(false) }
  }

  const saveAutoRefresh = async () => {
    setArSaving(true); setArMsg('')
    try {
      const res  = await fetch('/api/admin/leaderboard-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: arEnabled, intervalMins: arInterval }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      setArMsg('Saved successfully! ✓')
      setTimeout(() => setArMsg(''), 3000)
    } catch (e: any) {
      setArMsg(e?.message || 'Failed to save')
    } finally { setArSaving(false) }
  }

  useEffect(() => {
    loadUpcoming()
    loadAutoRefresh()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Config</h1>
          <p className="mt-1 text-sm text-gray-500">Only for Administrators</p>
        </div>

        {/* ── Upcoming Button Navigation ─────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Button Navigation</h2>
          <p className="mt-1 text-sm text-gray-600">Choose where the home page Upcoming Event button should navigate.</p>

          <div className="mt-5 space-y-3">
            {UPCOMING_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer">
                <input
                  type="radio"
                  name="upcoming-target"
                  checked={target === opt.value && !isCustom}
                  onChange={() => { setTarget(opt.value); setIsCustom(false) }}
                  disabled={upLoading || upSaving}
                />
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer">
              <input
                type="radio"
                name="upcoming-target"
                checked={isCustom}
                onChange={() => setIsCustom(true)}
                disabled={upLoading || upSaving}
              />
              <span className="text-sm font-medium text-gray-800">Custom URL</span>
            </label>
            {isCustom && (
              <input
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="/events/my-event"
                disabled={upLoading || upSaving}
                className="ml-7 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          <button
            onClick={saveUpcoming}
            disabled={upLoading || upSaving}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {upSaving ? 'Saving…' : 'Save'}
          </button>
          <SaveBanner msg={upMsg} />
        </div>

        {/* ── Leaderboard Auto-refresh ───────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Leaderboard Auto-refresh</h2>
          <p className="mt-1 text-sm text-gray-600">
            When enabled, the leaderboard page automatically polls for new scores in the background.
          </p>

          <div className="mt-5 space-y-4">
            {/* Toggle */}
            <label className="flex items-center justify-between rounded-xl border border-gray-200 p-4 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-800">Auto-refresh</p>
                <p className="text-xs text-gray-500 mt-0.5">{arEnabled ? 'Enabled — leaderboard will refresh automatically' : 'Disabled — manual refresh only'}</p>
              </div>
              <button
                onClick={() => setArEnabled(v => !v)}
                disabled={arLoading || arSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${arEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${arEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>

            {/* Interval */}
            <div className={`rounded-xl border border-gray-200 p-4 ${!arEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <p className="text-sm font-semibold text-gray-800 mb-3">Refresh interval</p>
              <div className="flex flex-wrap gap-2">
                {INTERVAL_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => setArInterval(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${arInterval === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">Currently set to refresh every <strong>{arInterval} minute{arInterval !== 1 ? 's' : ''}</strong>.</p>
            </div>
          </div>

          <button
            onClick={saveAutoRefresh}
            disabled={arLoading || arSaving}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {arSaving ? 'Saving…' : 'Save'}
          </button>
          <SaveBanner msg={arMsg} />
        </div>

        <Link href="/admin" className="inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
          ← Back to Admin
        </Link>
      </div>
    </div>
  )
}
