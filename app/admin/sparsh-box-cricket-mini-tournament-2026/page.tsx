'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Download, LinkIcon, RefreshCw, Users } from 'lucide-react'
import { EVENT_SLUG } from '@/app/events/sparsh-box-cricket-mini-tournament-2026/constants'
import type { RegistrationStatus } from '@/app/api/events/registration-status/route'

type Reg = {
  id: string
  name: string
  mobile_number: string
  age: number
  category: 'Member' | 'Kid'
  skillset: 'Batsman' | 'Bowler' | 'Allrounder'
  cricketing_skill: 'Beginner' | 'Intermediate' | 'Advance' | 'Pro'
  cricheroes_link: string | null
  photo_url: string | null
  fee_amount: number
  payment_method: 'cash' | 'online'
  cash_paid_to: string | null
  transaction_reference_number: string | null
  payment_screenshot_url: string | null
  created_at: string
}

const TABLE = 'sparsh_box_cricket_mini_tournament_registrations'
const CASH_RECIPIENTS = [
  { key: 'Amit Gandhi', label: 'Amit' },
  { key: 'Mukesh Jain (MA Hardware)', label: 'Mukesh' },
  { key: 'Satish Jain (Jaliwala)', label: 'Satish' },
  { key: 'Jitendra Jain (Unique Ladder)', label: 'Jitendra' }
]

export default function SparshBoxCricketMiniTournament2026Dashboard() {
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
      console.error('Box Cricket Mini Tournament load error:', e)
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
    const total = rows.length
    const members = rows.filter((r) => r.category === 'Member').length
    const kids = rows.filter((r) => r.category === 'Kid').length
    const cash = rows.filter((r) => r.payment_method === 'cash').length
    const online = rows.filter((r) => r.payment_method === 'online').length
    const totalRevenue = rows.reduce((sum, r) => sum + (r.fee_amount || 0), 0)
    const cashByRecipient = CASH_RECIPIENTS.map((recipient) => ({
      label: recipient.label,
      count: rows.filter((r) => r.payment_method === 'cash' && r.cash_paid_to === recipient.key).length
    }))

    return { total, members, kids, cash, online, totalRevenue, cashByRecipient }
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
      'Name',
      'Mobile',
      'Age',
      'Category',
      'Skillset',
      'Cricketing Skill',
      'CricHeroes Link',
      'Photo URL',
      'Fee Amount',
      'Payment Method',
      'Cash Paid To',
      'Transaction Reference',
      'Payment Screenshot URL',
      'Submitted At'
    ]

    const csvRows = [headers.join(',')]

    sortedRows.forEach((r) => {
      const row = [
        r.id,
        `"${r.name || ''}"`,
        `"${r.mobile_number || ''}"`,
        r.age ?? '',
        `"${r.category || ''}"`,
        `"${r.skillset || ''}"`,
        `"${r.cricketing_skill || ''}"`,
        `"${r.cricheroes_link || ''}"`,
        `"${r.photo_url || ''}"`,
        r.fee_amount ?? '',
        `"${r.payment_method || ''}"`,
        `"${r.cash_paid_to || ''}"`,
        `"${r.transaction_reference_number || ''}"`,
        `"${r.payment_screenshot_url || ''}"`,
        `"${new Date(r.created_at).toLocaleString()}"`
      ]

      csvRows.push(row.join(','))
    })

    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sparsh-box-cricket-mini-tournament-2026-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600">
              SPARSH Box Cricket Mini Tournament Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage Season 03 registrations and player details</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
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
            Controls which pop-up (if any) players see on the public registration page.
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
                    ? 'border-blue-600 bg-blue-600 text-white'
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Card title="Total Registrations" value={stats.total} color="bg-blue-100 text-blue-800" />
          <Card title="Members" value={stats.members} color="bg-violet-100 text-violet-800" />
          <Card title="Kids" value={stats.kids} color="bg-purple-100 text-purple-800" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Card title="Cash Payments" value={stats.cash} color="bg-amber-100 text-amber-800" />
          <Card title="Online Payments" value={stats.online} color="bg-teal-100 text-teal-800" />
          <Card title="Total Revenue (₹)" value={`₹${stats.totalRevenue.toLocaleString()}`} color="bg-green-100 text-green-800" />
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Cash Paid To</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.cashByRecipient.map((r) => (
              <Card key={r.label} title={r.label} value={r.count} color="bg-orange-100 text-orange-800" />
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
            <p className="text-gray-500">Once players submit the registration form, entries will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('mobile_number')}>
                      Mobile {sortField === 'mobile_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Age</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Skillset</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Cricketing Skill</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">CricHeroes</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Photo</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Fee (₹)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Payment</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Cash Paid To / Txn Ref</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Screenshot</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>
                      Submitted At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRows.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-gray-50 odd:bg-gray-50/40">
                      <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{r.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.mobile_number}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.age}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.category}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.skillset}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.cricketing_skill}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {r.cricheroes_link ? (
                          <a href={r.cricheroes_link} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                            <LinkIcon size={14} className="mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {r.photo_url ? (
                          <a href={r.photo_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                            <LinkIcon size={14} className="mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.fee_amount}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.payment_method === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                          {r.payment_method === 'cash' ? 'Cash' : 'Online'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 break-all">
                        {r.payment_method === 'cash' ? r.cash_paid_to : r.transaction_reference_number}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {r.payment_screenshot_url ? (
                          <a href={r.payment_screenshot_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                            <LinkIcon size={14} className="mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
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
