'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Download, RefreshCw, Users, Waves } from 'lucide-react'

type AdventureReg = {
  id: string
  full_name: string
  employee_id: string | null
  mobile: string
  email: string | null
  member_type: 'Individual Member' | 'Couple' | 'Kids (Age 5-8)' | 'Kids (Age 8+)' | 'Guest Individual' | string
  adults: number
  kids: number
  emergency_contact_name: string | null
  emergency_contact_number: string | null
  rafting_addon: boolean
  rafting_eligible_count: number | null
  rafting_eligibility_confirmed: boolean
  risk_terms_accepted: boolean
  amount_total: number
  pax_mode: 'individual' | 'couple' | null
  kids_5_8_count: number
  kids_8_plus_count: number
  guest_count: number
  coming_by_own_car: boolean | null
  rafting_count: number | null
  payment_note: string | null
  created_at: string
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm text-center ${color}`}>
      <div className='text-xs font-medium opacity-80'>{title}</div>
      <div className='text-2xl font-bold mt-0.5'>{value}</div>
    </div>
  )
}

export default function AdventureEscapeDashboardPage() {
  const [rows, setRows] = useState<AdventureReg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof AdventureReg>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('adventure_escape_interest')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) {
        setError(`Failed to load registrations: ${err.message}`)
        setRows([])
      } else {
        setRows((data as AdventureReg[]) || [])
      }
    } catch (e) {
      console.error('Adventure Escape load error:', e)
      setError('An unexpected error occurred')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = rows.length
    const memberCount = rows.reduce((sum, r) => sum + (r.adults || 0), 0)
    const kids5to8Count = rows.reduce((sum, r) => sum + (r.kids_5_8_count || 0), 0)
    const kids8plusCount = rows.reduce((sum, r) => sum + (r.kids_8_plus_count || 0), 0)
    const guestTotalCount = rows.reduce((sum, r) => sum + (r.guest_count || 0), 0)
    const raftingCount = rows.reduce((sum, r) => sum + (r.rafting_count || 0), 0)
    const ownCarYes = rows.filter(r => r.coming_by_own_car === true).length
    const ownCarNo = rows.filter(r => r.coming_by_own_car === false).length
    const totalRevenue = rows.reduce((sum, r) => sum + (r.amount_total || 0), 0)

    return {
      total,
      memberCount,
      kids5to8Count,
      kids8plusCount,
      guestTotalCount,
      raftingCount,
      ownCarYes,
      ownCarNo,
      totalRevenue,
    }
  }, [rows])

  const handleSort = (field: keyof AdventureReg) => {
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
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal)
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal
      else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') cmp = Number(aVal) - Number(bVal)
      else cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''))
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [rows, sortField, sortDirection])

  const exportCsv = () => {
    const headers = [
      'ID', 'Full Name', 'Employee ID', 'Mobile', 'Email', 'Member Type', 'Pax Mode',
      'Adults', 'Kids', 'Kids 5-8 Count', 'Kids 8+ Count', 'Guest Count', 'Coming By Own Car',
      'Emergency Contact Name', 'Emergency Contact Number', 'Rafting Add-on',
      'Rafting Count', 'Rafting Eligible Count', 'Rafting Eligibility Confirmed', 'Risk Terms Accepted',
      'Amount Total', 'Payment Note', 'Submitted At'
    ]

    const csvRows = [headers.join(',')]
    sortedRows.forEach((r) => {
      const row = [
        r.id,
        `"${r.full_name || ''}"`,
        `"${r.employee_id || ''}"`,
        `"${r.mobile || ''}"`,
        `"${r.email || ''}"`,
        `"${r.member_type || ''}"`,
        `"${r.pax_mode || ''}"`,
        r.adults ?? 0,
        r.kids ?? 0,
        r.kids_5_8_count ?? 0,
        r.kids_8_plus_count ?? 0,
        r.guest_count ?? 0,
        r.coming_by_own_car === null ? '' : (r.coming_by_own_car ? 'Yes' : 'No'),
        `"${r.emergency_contact_name || ''}"`,
        `"${r.emergency_contact_number || ''}"`,
        r.rafting_addon ? 'Yes' : 'No',
        r.rafting_count ?? '',
        r.rafting_eligible_count ?? '',
        r.rafting_eligibility_confirmed ? 'Yes' : 'No',
        r.risk_terms_accepted ? 'Yes' : 'No',
        r.amount_total ?? 0,
        `"${r.payment_note || ''}"`,
        `"${new Date(r.created_at).toLocaleString()}"`,
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adventure-escape-2026-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        {error && (
          <div className='mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800'>{error}</div>
        )}

        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-emerald-600 to-orange-500'>
              Adventure Escape Dashboard
            </h1>
            <p className='text-sm text-gray-600 mt-1'>Manage Adventure Escape 2026 registrations</p>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={load}
              disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50'
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {rows.length > 0 && (
              <button
                onClick={exportCsv}
                className='inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700'
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6'>
          <StatCard title='Total Registrations' value={stats.total} color='bg-emerald-100 text-emerald-800' />
          <StatCard title='Members Count' value={stats.memberCount} color='bg-blue-100 text-blue-800' />
          <StatCard title='Kids 5-8 Count' value={stats.kids5to8Count} color='bg-orange-100 text-orange-800' />
          <StatCard title='Kids 8+ Count' value={stats.kids8plusCount} color='bg-amber-100 text-amber-800' />
          <StatCard title='Guest Count' value={stats.guestTotalCount} color='bg-violet-100 text-violet-800' />
          <StatCard title='Rafting Count' value={stats.raftingCount} color='bg-sky-100 text-sky-800' />
          <StatCard title='Own Car (Yes)' value={stats.ownCarYes} color='bg-teal-100 text-teal-800' />
          <StatCard title='Own Car (No)' value={stats.ownCarNo} color='bg-rose-100 text-rose-800' />
          <StatCard title='Total Revenue (₹)' value={`₹${stats.totalRevenue.toLocaleString()}`} color='bg-green-100 text-green-800' />
        </div>

        {loading ? (
          <div className='text-center py-16 bg-white rounded-lg shadow'>
            <RefreshCw className='mx-auto h-10 w-10 text-gray-400 animate-spin mb-3' />
            <p className='text-gray-600'>Loading registrations...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-lg shadow'>
            <Users className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No registrations yet</h3>
            <p className='text-gray-500'>Once attendees submit the registration form, entries will appear here.</p>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>#</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('full_name')}>
                      Name {sortField === 'full_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Employee ID</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Mobile</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Member Type</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Pax Mode</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Adults/Kids</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Kids 5-8</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Kids 8+</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Guests</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Own Car</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('amount_total')}>
                      Amount (₹) {sortField === 'amount_total' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('created_at')}>
                      Submitted At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {sortedRows.map((r, idx) => (
                    <tr key={r.id} className='hover:bg-gray-50 odd:bg-gray-50/40'>
                      <td className='px-4 py-2 text-sm text-gray-700'>{idx + 1}</td>
                      <td className='px-4 py-2'>
                        <p className='text-sm font-semibold text-gray-900'>{r.full_name}</p>
                        <p className='text-xs text-gray-500'>{r.email}</p>
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.employee_id}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.mobile}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.member_type}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 capitalize'>{r.pax_mode || '-'}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.adults} / {r.kids}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.kids_5_8_count ?? 0}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.kids_8_plus_count ?? 0}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.guest_count ?? 0}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.coming_by_own_car === null ? '-' : (r.coming_by_own_car ? 'Yes' : 'No')}</td>
                      <td className='px-4 py-2'>
                        {r.rafting_addon ? (
                          <span className='inline-flex rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700'>
                            Yes ({r.rafting_count ?? 0})
                          </span>
                        ) : (
                          <span className='inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600'>No</span>
                        )}
                      </td>
                      <td className='px-4 py-2 text-sm font-semibold text-emerald-700'>₹{(r.amount_total || 0).toLocaleString()}</td>
                      <td className='px-4 py-2 text-xs text-gray-600'>{new Date(r.created_at).toLocaleString()}</td>
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
