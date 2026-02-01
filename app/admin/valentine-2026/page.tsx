'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Download, Users } from 'lucide-react'

type Reg = { id: number; name: string; mobile: string; confirm_attend: boolean; created_at: string }

export default function AdminValentineDashboard() {
  const [rows, setRows] = useState<Reg[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/events/valentine-2026/list')
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to load')
      setRows(data.registrations || [])
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const exportCsv = () => {
    const header = ['id','name','mobile','confirm_attend','created_at']
    const csvRows = rows.map(r => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile,
      confirm_attend: r.confirm_attend ? 'Yes' : 'No',
      created_at: new Date(r.created_at).toLocaleString(),
    }))
    const csv = [header, ...csvRows.map(r => header.map(k => String((r as any)[k] ?? '').replace(/"/g,'"')))]
      .map(r=>r.map(f=>`"${f}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `valentine-2026-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto mb-4'/>
        <p className='text-gray-600'>Loading Valentine registrations...</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>Valentine 2026 Dashboard</h1>
            <p className='text-gray-600 text-sm'>Overview of Valentine soirée registrations</p>
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
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>#</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Name</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Mobile</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Confirmed</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Submitted At</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {rows.map((r, idx) => (
                    <tr key={r.id} className='hover:bg-gray-50 odd:bg-gray-50/40'>
                      <td className='px-4 py-2 text-sm text-gray-700'>{idx + 1}</td>
                      <td className='px-4 py-2 text-sm font-medium text-gray-900'>{r.name}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.mobile}</td>
                      <td className='px-4 py-2 text-sm'>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${r.confirm_attend?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{r.confirm_attend ? 'Yes' : 'No'}</span>
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
