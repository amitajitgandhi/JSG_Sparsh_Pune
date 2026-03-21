"use client"

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Download, Users, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Reg = {
  id: number
  name: string
  mobile: string
  registration_for: 'Couple' | 'Individual'
  kids_count: number
  guest_count: number
  transaction_id: string
  total_amount: number
  screenshot_url: string | null
  created_at: string
}

export default function AdminDoubleCrossDashboard() {
  const [rows, setRows] = useState<Reg[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Reg | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('double_cross_registrations')
      .select('id, name, mobile, registration_for, kids_count, guest_count, transaction_id, total_amount, screenshot_url, created_at')
      .order('id', { ascending: false })
    if (error) setError(error.message)
    setRows((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const stats = useMemo(() => {
    const total = rows.length
    const couples = rows.filter(r => r.registration_for === 'Couple').length
    const individuals = total - couples
    const kids = rows.reduce((s, r) => s + (r.kids_count || 0), 0)
    const guests = rows.reduce((s, r) => s + (r.guest_count || 0), 0)
    const amount = rows.reduce((s, r) => s + (r.total_amount || 0), 0)
    return { total, couples, individuals, kids, guests, amount }
  }, [rows])

  const handleSort = (field: keyof Reg) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortField) return rows
    const sorted = [...rows].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
    return sorted
  }, [rows, sortField, sortDirection])

  const exportCsv = () => {
    const header = ['id','name','mobile','registration_for','kids_count','guest_count','transaction_id','total_amount','screenshot_url','created_at']
    const csvRows = rows.map(r => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile,
      registration_for: r.registration_for,
      kids_count: r.kids_count,
      guest_count: r.guest_count,
      transaction_id: r.transaction_id,
      total_amount: r.total_amount,
      screenshot_url: r.screenshot_url || '',
      created_at: new Date(r.created_at).toLocaleString(),
    }))
    const csv = [header, ...csvRows.map(r => header.map(k => String((r as any)[k] ?? '').replace(/"/g,'"')))]
      .map(r=>r.map(f=>`"${f}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `double-cross-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto mb-4'/>
        <p className='text-gray-600'>Loading Double-Cross registrations...</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {error && (
          <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700'>
            {error}
          </div>
        )}
        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>Double-Cross Dashboard</h1>
            <p className='text-gray-600 text-sm'>Overview of Double-Cross registrations</p>
          </div>
          <div className='flex gap-2'>
            <button onClick={refresh} disabled={refreshing} className='bg-rose-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <RefreshCw size={14} className={`mr-2 ${refreshing? 'animate-spin':''}`}/>{refreshing? 'Refreshing...':'Refresh'}
            </button>
            <button onClick={exportCsv} disabled={rows.length===0} className='bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <Download size={14} className='mr-2'/>Export CSV
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
          <Card title='Total Registrations' value={stats.total} color='bg-gray-100 text-gray-800'/>
          <Card title='Couples' value={stats.couples} color='bg-rose-100 text-rose-800'/>
          <Card title='Individuals' value={stats.individuals} color='bg-indigo-100 text-indigo-800'/>
          <Card title='Total Revenue' value={`₹${stats.amount}`} color='bg-emerald-100 text-emerald-800'/>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
          <Card title='Kids (5-12 yrs)' value={stats.kids} color='bg-amber-100 text-amber-800'/>
          <Card title='Kids (12+ yrs)' value={stats.guests} color='bg-lime-100 text-lime-800'/>
        </div>

        {rows.length === 0 ? (
          <div className='text-center py-16'>
            <Users className='mx-auto h-12 w-12 text-gray-400 mb-4'/>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No registrations</h3>
            <p className='text-gray-500'>Once attendees submit the form, entries will appear here.</p>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('id')}>
                      # {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('mobile')}>
                      Mobile {sortField === 'mobile' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('registration_for')}>
                      For {sortField === 'registration_for' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('kids_count')}>
                      Kids (5-12) {sortField === 'kids_count' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('guest_count')}>
                      Kids (12+) {sortField === 'guest_count' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('transaction_id')}>
                      Txn ID {sortField === 'transaction_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('total_amount')}>
                      Total (₹) {sortField === 'total_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Screenshot</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100' onClick={() => handleSort('created_at')}>
                      Submitted At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {sortedRows.map((r, idx) => (
                    <tr key={r.id} className='hover:bg-gray-50 odd:bg-gray-50/40'>
                      <td className='px-4 py-2 text-sm text-gray-700'>{idx + 1}</td>
                      <td className='px-4 py-2 text-sm font-medium text-gray-900'>{r.name}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.mobile}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.registration_for}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.kids_count}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.guest_count}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 break-all'>{r.transaction_id}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.total_amount}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>
                        {r.screenshot_url ? (
                          <a href={r.screenshot_url} target='_blank' rel='noreferrer' className='inline-flex items-center text-blue-600 hover:underline'>
                            <LinkIcon size={14} className='mr-1'/> View
                          </a>
                        ) : (
                          <span className='text-gray-400'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-700 whitespace-nowrap'>{new Date(r.created_at).toLocaleString()}</td>
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
    <div className={`rounded-lg p-3 sm:p-4 ${color} text-center`}> 
      <div className='text-xs text-gray-600'>{title}</div>
      <div className='text-2xl font-semibold'>{value}</div>
    </div>
  )
}
