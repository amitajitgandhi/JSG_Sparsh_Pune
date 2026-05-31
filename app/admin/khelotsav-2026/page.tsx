'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Download, LinkIcon, RefreshCw, Users } from 'lucide-react'

type Reg = {
  id: string
  event_name: string
  name: string
  mobile: string
  date_of_birth: string
  age: number
  gender: 'Male' | 'Female'
  category: 'Member' | 'Kid'
  jersey_size: string
  selected_sports: string[]
  sport_ratings: Record<string, number>
  fee_amount: number
  is_refundable: boolean
  transaction_id: string
  payment_screenshot_url: string | null
  created_at: string
}

export default function Khelotsav2026Dashboard() {
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
        .from('sparsh_khelotsav_registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) {
        setError(`Failed to load registrations: ${err.message}`)
        setRows([])
      } else {
        setRows((data as Reg[]) || [])
      }
    } catch (e) {
      console.error('Khelotsav load error:', e)
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
    const members = rows.filter((r) => r.category === 'Member').length
    const kids = rows.filter((r) => r.category === 'Kid').length
    const males = rows.filter((r) => r.gender === 'Male').length
    const females = rows.filter((r) => r.gender === 'Female').length
    const totalRevenue = rows.reduce((sum, r) => sum + (r.fee_amount || 0), 0)
    const refundableCount = rows.filter((r) => r.is_refundable).length
    const avgSports = total > 0 ? (rows.reduce((sum, r) => sum + (r.selected_sports?.length || 0), 0) / total).toFixed(1) : '0.0'

    return { total, members, kids, males, females, totalRevenue, refundableCount, avgSports }
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
      'Event Name',
      'Name',
      'Mobile',
      'Date of Birth',
      'Age',
      'Gender',
      'Category',
      'Jersey Size',
      'Selected Sports',
      'Sport Ratings',
      'Fee Amount',
      'Refundable',
      'Transaction ID',
      'Payment Screenshot URL',
      'Submitted At'
    ]

    const csvRows = [headers.join(',')]

    sortedRows.forEach((r) => {
      const selectedSports = Array.isArray(r.selected_sports) ? r.selected_sports.join(' | ') : ''
      const sportRatings = r.sport_ratings ? JSON.stringify(r.sport_ratings).replace(/"/g, '""') : ''

      const row = [
        r.id,
        `"${r.event_name || ''}"`,
        `"${r.name || ''}"`,
        `"${r.mobile || ''}"`,
        `"${r.date_of_birth || ''}"`,
        r.age ?? '',
        `"${r.gender || ''}"`,
        `"${r.category || ''}"`,
        `"${r.jersey_size || ''}"`,
        `"${selectedSports}"`,
        `"${sportRatings}"`,
        r.fee_amount ?? '',
        r.is_refundable ? 'Yes' : 'No',
        `"${r.transaction_id || ''}"`,
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
    a.download = `khelotsav-2026-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4 sm:p-6 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        {error && (
          <div className='mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4 text-red-800 dark:text-red-200'>
            {error}
          </div>
        )}

        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600'>
              SPARSH KHELOTSAV 2026 Dashboard
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Manage event registrations and participants</p>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={load}
              disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 dark:hover:bg-emerald-800 disabled:opacity-50'
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            {rows.length > 0 && (
              <button
                onClick={exportCsv}
                className='inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:hover:bg-blue-800'
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
          <Card title='Total Registrations' value={stats.total} color='bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200' />
          <Card title='Members' value={stats.members} color='bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200' />
          <Card title='Kids' value={stats.kids} color='bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200' />
          <Card title='Total Revenue (₹)' value={`₹${stats.totalRevenue.toLocaleString()}`} color='bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' />
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6'>
          <Card title='Males' value={stats.males} color='bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200' />
          <Card title='Females' value={stats.females} color='bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200' />
          <Card title='Refundable' value={stats.refundableCount} color='bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' />
          <Card title='Avg Sports/User' value={stats.avgSports} color='bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200' />
        </div>

        {loading ? (
          <div className='text-center py-16 bg-white dark:bg-neutral-800 rounded-lg shadow'>
            <RefreshCw className='mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 animate-spin mb-3' />
            <p className='text-gray-600 dark:text-gray-400'>Loading registrations...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className='text-center py-16 bg-white dark:bg-neutral-800 rounded-lg shadow'>
            <Users className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>No registrations yet</h3>
            <p className='text-gray-500 dark:text-gray-400'>Once attendees submit the registration form, entries will appear here.</p>
          </div>
        ) : (
          <div className='bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-neutral-900'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>#</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800' onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800' onClick={() => handleSort('mobile')}>
                      Mobile {sortField === 'mobile' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Gender</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Category</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Age</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Jersey Size</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Sports</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Ratings</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Fee (₹)</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Refundable</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Txn ID</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Screenshot</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800' onClick={() => handleSort('created_at')}>
                      Submitted At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {sortedRows.map((r, idx) => (
                    <tr key={r.id} className='hover:bg-gray-50 dark:hover:bg-neutral-700 odd:bg-gray-50/40 dark:odd:bg-neutral-900/40'>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{idx + 1}</td>
                      <td className='px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100'>{r.name}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.mobile}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.gender}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.category}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.age}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.jersey_size || '—'}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{Array.isArray(r.selected_sports) ? r.selected_sports.join(', ') : '—'}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300 break-words'>{r.sport_ratings ? JSON.stringify(r.sport_ratings) : '—'}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.fee_amount}</td>
                      <td className='px-4 py-2 text-sm'>
                        {r.is_refundable ? (
                          <span className='inline-flex items-center rounded-full bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-200'>Yes</span>
                        ) : (
                          <span className='inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 text-xs font-semibold text-orange-800 dark:text-orange-200'>No</span>
                        )}
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300 break-all'>{r.transaction_id}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>
                        {r.payment_screenshot_url ? (
                          <a href={r.payment_screenshot_url} target='_blank' rel='noreferrer' className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline'>
                            <LinkIcon size={14} className='mr-1' /> View
                          </a>
                        ) : (
                          <span className='text-gray-400 dark:text-gray-600'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap'>{new Date(r.created_at).toLocaleString()}</td>
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
      <div className='text-xs font-medium'>{title}</div>
      <div className='text-2xl font-semibold'>{value}</div>
    </div>
  )
}
