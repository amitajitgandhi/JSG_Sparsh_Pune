'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const OPTIONS = [
  { label: 'events/upcoming', value: '/events/upcoming' },
  { label: 'events/sparsh-cricket-championship-season-02', value: '/events/sparsh-cricket-championship-season-02' }
]

export default function UpcomingButtonAdminPage() {
  const [target, setTarget] = useState('/events/upcoming')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/admin/upcoming-event-target', { cache: 'no-store' })
      const data = await res.json()
      if (data?.target) setTarget(data.target)
      if (data?.source === 'fallback') {
        setMessage(data?.error || 'Loaded fallback value. Please check database setting table.')
      }
    } catch {
      setMessage('Failed to load current setting')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/upcoming-event-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')

      await load()
      setMessage('Saved successfully')
    } catch (e: any) {
      setMessage(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Button Navigation</h1>
          <p className="mt-1 text-sm text-gray-600">Choose where the home page Upcoming Event button should navigate.</p>

          <div className="mt-5 space-y-3">
            {OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                <input
                  type="radio"
                  name="upcoming-target"
                  checked={target === option.value}
                  onChange={() => setTarget(option.value)}
                  disabled={loading || saving}
                />
                <span className="text-sm font-medium text-gray-800">{option.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={save}
            disabled={loading || saving}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          {message ? <p className="mt-3 text-sm text-gray-700">{message}</p> : null}
        </div>

        <Link href="/admin" className="inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
          ← Back to Admin
        </Link>
      </div>
    </div>
  )
}
