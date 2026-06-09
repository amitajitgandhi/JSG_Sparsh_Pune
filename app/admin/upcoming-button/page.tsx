'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const OPTIONS = [
  { label: 'events/upcoming', value: '/events/upcoming' }
]

export default function UpcomingButtonAdminPage() {
  const [target, setTarget] = useState('/events/upcoming')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const load = async () => {
    try {
      const res = await fetch('/api/admin/upcoming-event-target', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Failed to fetch setting')
      }
      const data = await res.json()
      if (data?.target) {
        setTarget(data.target)
        const isOptionValue = OPTIONS.some(opt => opt.value === data.target)
        setIsCustom(!isOptionValue)
      }
    } catch (err: any) {
      setMessage(err?.message || 'Failed to load current setting')
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
      if (!target || !target.trim()) {
        throw new Error('Target URL cannot be empty')
      }
      if (!target.startsWith('/')) {
        throw new Error('Target URL must start with /')
      }
      
      const res = await fetch('/api/admin/upcoming-event-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')

      await load()
      setMessage('Saved successfully! ✓')
      setTimeout(() => setMessage(''), 3000)
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
                  onChange={() => {
                    setTarget(option.value)
                    setIsCustom(false)
                  }}
                  disabled={loading || saving}
                />
                <span className="text-sm font-medium text-gray-800">{option.label}</span>
              </label>
            ))}

            {/* Custom URL input */}
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <input
                type="radio"
                name="upcoming-target"
                checked={isCustom}
                onChange={() => setIsCustom(true)}
                disabled={loading || saving}
              />
              <span className="text-sm font-medium text-gray-800">Custom URL</span>
            </label>
            {isCustom && (
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter custom URL (e.g., /events/my-event)"
                disabled={loading || saving}
                className="ml-7 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          <button
            onClick={save}
            disabled={loading || saving}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          {message ? (
            <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
              message.includes('✓') || message.includes('successfully')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          ) : null}
        </div>

        <Link href="/admin" className="inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
          ← Back to Admin
        </Link>
      </div>
    </div>
  )
}
