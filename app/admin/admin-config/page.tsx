'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const UPCOMING_OPTIONS = [
  { label: '/events/upcoming', value: '/events/upcoming' },
]

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

  useEffect(() => {
    loadUpcoming()
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

        <Link href="/admin" className="inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
          ← Back to Admin
        </Link>
      </div>
    </div>
  )
}
