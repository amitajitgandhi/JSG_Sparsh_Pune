'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Download, RefreshCw, Users } from 'lucide-react'
import { EVENT_SLUG } from '@/app/events/hampi-heritage-adoni-tirth-2026/constants'
import type { RegistrationStatus } from '@/app/api/events/registration-status/route'

type TravelMode = 'Own Transportation' | 'Bus' | 'AC Train' | 'Sleeper Train'

type Reg = {
  id: string
  primary_name: string
  mobile_number: string
  adult_count: number
  child_above8_count: number
  child_5_to_8_count: number
  child_below5_count: number
  travel_mode: TravelMode
  below5_needs_seat: boolean
  notes: string | null
  created_at: string
}

const TABLE = 'sparsh_hampi_heritage_adoni_tirth_2026_registrations'
const RATES = { adult_count: 12000, child_above8_count: 8000, child_5_to_8_count: 5500, child_below5_count: 0 }
const TRAVEL_MODES: TravelMode[] = ['Own Transportation', 'Bus', 'AC Train', 'Sleeper Train']

export default function HampiHeritageAdoniTirth2026Dashboard() {
  const [rows, setRows] = useState<Reg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Reg>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })

      if (err) {
        setError(`Failed to load registrations: ${err.message}`)
        setRows([])
      } else {
        setRows((data as Reg[]) || [])
      }
    } catch (e) {
      console.error('Hampi Heritage load error:', e)
      setError('An unexpected error occurred')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ── Registration Status ("Registration will be opened shortly" / "now closed" pop-ups) ──────
  const [regStatus, setRegStatus] = useState<RegistrationStatus>('open')
  const [regStatusLoading, setRegStatusLoading] = useState(true)
  const [regStatusSaving, setRegStatusSaving] = useState(false)
  const [regStatusMsg, setRegStatusMsg] = useState('')

  const loadRegStatus = async () => {
    setRegStatusLoading(true)
    try {
      const res = await fetch(`/api/events/registration-status?slug=${EVENT_SLUG}`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.status) setRegStatus(data.status)
    } catch {
      /* keep default */
    } finally {
      setRegStatusLoading(false)
    }
  }

  const saveRegStatus = async (status: RegistrationStatus) => {
    setRegStatusSaving(true)
    setRegStatusMsg('')
    try {
      const res = await fetch('/api/events/registration-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: EVENT_SLUG, status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save')
      setRegStatus(status)
      setRegStatusMsg('Saved successfully! ✓')
      setTimeout(() => setRegStatusMsg(''), 3000)
    } catch (e: any) {
      setRegStatusMsg(e?.message || 'Failed to save')
    } finally {
      setRegStatusSaving(false)
    }
  }

  useEffect(() => {
    loadRegStatus()
  }, [])

  const stats = useMemo(() => {
    const totalFamilies = rows.length
    const adults = rows.reduce((sum, r) => sum + (r.adult_count || 0), 0)
    const childAbove8 = rows.reduce((sum, r) => sum + (r.child_above8_count || 0), 0)
    const child5to8 = rows.reduce((sum, r) => sum + (r.child_5_to_8_count || 0), 0)
    const childBelow5 = rows.reduce((sum, r) => sum + (r.child_below5_count || 0), 0)
    const totalMembers = adults + childAbove8 + child5to8 + childBelow5
    const estimatedRevenue =
      adults * RATES.adult_count + childAbove8 * RATES.child_above8_count + child5to8 * RATES.child_5_to_8_count
    const travelByMode = TRAVEL_MODES.map((mode) => ({
      label: mode,
      count: rows.filter((r) => r.travel_mode === mode).length
    }))

    return { totalFamilies, adults, childAbove8, child5to8, childBelow5, totalMembers, estimatedRevenue, travelByMode }
  }, [rows])

  const handleSort = (field: keyof Reg) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      return
    }
    setSortField(field)
    setSortDirection('asc')
  }

  const sortedRows = useMemo(() => {
    const sorted = [...rows]

    sorted.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      let cmp = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }

      return sortDirection === 'asc' ? cmp : -cmp
    })

    return sorted
  }, [rows, sortDirection, sortField])

  const exportCsv = () => {
    const headers = [
      'ID',
      'Primary Contact',
      'Mobile',
      'Adults',
      'Child (Above 8)',
      'Child (5-8)',
      'Below 5',
      'Total Members',
      'Travel Mode',
      'Below 5 Needs Seat',
      'Notes',
      'Submitted At'
    ]

    const csvRows = [headers.join(',')]

    sortedRows.forEach((r) => {
      const total = (r.adult_count || 0) + (r.child_above8_count || 0) + (r.child_5_to_8_count || 0) + (r.child_below5_count || 0)
      const row = [
        r.id,
        `"${r.primary_name || ''}"`,
        `"${r.mobile_number || ''}"`,
        r.adult_count ?? 0,
        r.child_above8_count ?? 0,
        r.child_5_to_8_count ?? 0,
        r.child_below5_count ?? 0,
        total,
        `"${r.travel_mode || ''}"`,
        r.below5_needs_seat ? 'Yes' : 'No',
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        `"${new Date(r.created_at).toLocaleString()}"`
      ]

      csvRows.push(row.join(','))
    })

    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hampi-heritage-adoni-tirth-2026-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600">
              Hampi Heritage &amp; Adoni Tirth Expedition Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage family/group registrations for the trip</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {rows.length > 0 && (
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-gray-900">Registration Status</h2>
          <p className="mt-1 text-sm text-gray-600">
            Controls which pop-up (if any) visitors see on the public registration page.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                { value: 'not_open' as RegistrationStatus, label: 'Not Open Yet' },
                { value: 'open' as RegistrationStatus, label: 'Open' },
                { value: 'closed' as RegistrationStatus, label: 'Closed' }
              ]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => saveRegStatus(opt.value)}
                disabled={regStatusLoading || regStatusSaving}
                className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                  regStatus === opt.value
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {regStatusMsg ? (
            <div
              className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
                regStatusMsg.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {regStatusMsg}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card title="Families/Groups" value={stats.totalFamilies} color="bg-amber-100 text-amber-800" />
          <Card title="Total Travellers" value={stats.totalMembers} color="bg-orange-100 text-orange-800" />
          <Card title="Adults" value={stats.adults} color="bg-yellow-100 text-yellow-800" />
          <Card title="Kids (all tiers)" value={stats.childAbove8 + stats.child5to8 + stats.childBelow5} color="bg-stone-100 text-stone-800" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Card title="Child (Above 8)" value={stats.childAbove8} color="bg-amber-100 text-amber-800" />
          <Card title="Child (5-8)" value={stats.child5to8} color="bg-orange-100 text-orange-800" />
          <Card title="Below 5 (Free)" value={stats.childBelow5} color="bg-yellow-100 text-yellow-800" />
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
            Estimated Revenue (Tentative — ₹{stats.estimatedRevenue.toLocaleString()})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.travelByMode.map((t) => (
              <Card key={t.label} title={t.label} value={t.count} color="bg-stone-100 text-stone-800" />
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <RefreshCw className="mx-auto h-10 w-10 text-gray-400 animate-spin mb-3" />
            <p className="text-gray-600">Loading registrations...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
            <p className="text-gray-500">Once families submit the registration form, entries will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('primary_name')}>
                      Primary Contact {sortField === 'primary_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('mobile_number')}>
                      Mobile {sortField === 'mobile_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Adult</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Child &gt;8</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Child 5-8</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Below 5</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Travel Mode</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Below 5 Seat?</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Notes</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                      Submitted At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRows.map((r, idx) => {
                    const total = (r.adult_count || 0) + (r.child_above8_count || 0) + (r.child_5_to_8_count || 0) + (r.child_below5_count || 0)
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 odd:bg-gray-50/40">
                        <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{r.primary_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.mobile_number}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.adult_count}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.child_above8_count}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.child_5_to_8_count}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.child_below5_count}</td>
                        <td className="px-4 py-2 text-sm font-semibold text-gray-900">{total}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.travel_mode}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{r.below5_needs_seat ? 'Yes' : '—'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 break-all">{r.notes || <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ title, value, color }: { title: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-lg p-3 sm:p-4 ${color} text-center shadow-sm`}>
      <div className="text-xs font-medium">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
