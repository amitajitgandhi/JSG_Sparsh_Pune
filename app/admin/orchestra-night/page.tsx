"use client"

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Download, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Reg = {
  id: number
  name: string
  mobile: string
  passes: number
  created_at: string
}

export default function AdminOrchestraNightDashboard() {
  const [rows, setRows] = useState<Reg[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('orchestra_night_registrations')
      .select('id, name, mobile, passes, created_at')
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
    const registrations = rows.length
    const totalPasses = rows.reduce((s, r) => s + (r.passes || 0), 0)
    return { registrations, totalPasses }
  }, [rows])

  const exportCsv = () => {
    const header = ['id', 'name', 'mobile', 'passes', 'created_at']
    const csvRows = rows.map(r => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile,
      passes: r.passes,
      created_at: new Date(r.created_at).toLocaleString(),
    }))
    const csv = [header, ...csvRows.map(r => header.map(k => String((r as any)[k] ?? '').replace(/"/g, '""')))]
      .map(r => r.map(f => `"${f}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orchestra-night-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center dark:bg-gray-950'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto mb-4' />
        <p className='text-gray-600 dark:text-gray-300'>Loading Orchestra Night registrations...</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {error && (
          <div className='mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'>
            {error}
          </div>
        )}
        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1'>Orchestra Night Dashboard</h1>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Healing Harmony 2026 registrations</p>
          </div>
          <div className='flex gap-2'>
            <button onClick={refresh} disabled={refreshing} className='bg-rose-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={exportCsv} disabled={rows.length === 0} className='bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <Download size={14} className='mr-2' />Export CSV
            </button>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-2 gap-3 mb-6'>
          <Card title='Registrations' value={stats.registrations} color='bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' />
          <Card title='Total Passes' value={stats.totalPasses} color='bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' />
        </div>

        {rows.length === 0 ? (
          <div className='text-center py-16'>
            <Users className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>No registrations</h3>
            <p className='text-gray-500 dark:text-gray-400'>Once attendees submit the form, entries will appear here.</p>
          </div>
        ) : (
          <div className='bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-transparent dark:border-gray-700'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-800'>
                  <tr>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>#</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Name</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Mobile</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Passes</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300'>Submitted At</th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                  {rows.map((r, idx) => (
                    <tr key={r.id} className='hover:bg-gray-50 dark:hover:bg-gray-800 odd:bg-gray-50/40 dark:odd:bg-gray-800/30'>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{idx + 1}</td>
                      <td className='px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100'>{r.name}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.mobile}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>{r.passes}</td>
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
    <div className={`rounded-lg p-3 sm:p-4 ${color} text-center`}>
      <div className='text-xs'>{title}</div>
      <div className='text-2xl font-semibold'>{value}</div>
    </div>
  )
}
