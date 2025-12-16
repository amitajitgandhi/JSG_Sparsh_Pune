'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Download, CheckSquare, Square, Users, Image as ImageIcon, IndianRupee } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface HurdaRegistration {
  id: string
  name: string
  mobile: string
  registration_for: 'Individual' | 'Couple'
  kids_count: number
  guest_count: number
  transaction_id: string
  screenshot_url?: string | null
  refundable_deposit?: number | null
  kid_rate?: number | null
  guest_rate?: number | null
  total_amount?: number | null
  created_at?: string | null
}

interface ExportColumn { key: string; label: string; selected: boolean }

export default function HurdaDashboard() {
  const [rows, setRows] = useState<HurdaRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>([
    { key: 'name', label: 'Name', selected: true },
    { key: 'mobile', label: 'Mobile', selected: true },
    { key: 'registration_for', label: 'For', selected: true },
    { key: 'kids_count', label: 'Kids', selected: true },
    { key: 'guest_count', label: 'Guests', selected: true },
    { key: 'total_amount', label: 'Total Amount', selected: true },
    { key: 'transaction_id', label: 'Transaction ID', selected: true },
    { key: 'screenshot_url', label: 'Screenshot URL', selected: false },
    { key: 'created_at', label: 'Submitted At', selected: true },
  ])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hurda_registrations')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setRows(data as any)
    setLoading(false)
  }

  const refresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    if (!search) return rows
    const term = search.toLowerCase()
    return rows.filter(r =>
      r.name?.toLowerCase().includes(term) ||
      r.mobile?.includes(search) ||
      r.transaction_id?.toLowerCase().includes(term) ||
      r.registration_for?.toLowerCase().includes(term)
    )
  }, [rows, search])

  const stats = useMemo(() => {
    const total = rows.length
    const kids = rows.reduce((s, r) => s + (r.kids_count || 0), 0)
    const guests = rows.reduce((s, r) => s + (r.guest_count || 0), 0)
    const sum = rows.reduce((s, r) => s + (r.total_amount || 0), 0)
    return { total, kids, guests, sum }
  }, [rows])

  const toggleExportColumn = (index: number) => {
    setExportColumns(prev => prev.map((c,i)=> i===index? { ...c, selected: !c.selected }: c))
  }

  const exportCsv = () => {
    const cols = exportColumns.filter(c=>c.selected)
    if (cols.length === 0) return
    const header = cols.map(c=>c.label)
    const rowsCsv = filtered.map(r => cols.map(c => {
      switch(c.key){
        case 'name': return r.name || ''
        case 'mobile': return r.mobile || ''
        case 'registration_for': return r.registration_for || ''
        case 'kids_count': return r.kids_count ?? ''
        case 'guest_count': return r.guest_count ?? ''
        case 'total_amount': return r.total_amount ?? ''
        case 'transaction_id': return r.transaction_id || ''
        case 'screenshot_url': return r.screenshot_url || ''
        case 'created_at': return r.created_at ? new Date(r.created_at).toLocaleString() : ''
        default: return ''
      }
    }))
    const csv = [header, ...rowsCsv]
      .map(r=>r.map(f=>`"${String(f).replace(/"/g,'""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hurda-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportOptions(false)
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-24 w-24 border-b-2 border-emerald-600 mx-auto mb-4'/>
        <p className='text-gray-600'>Loading Hurda-Party registrations...</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Hurda-Party Registration Dashboard</h1>
            <p className='text-gray-600'>Submissions for Hurda-Party event</p>
          </div>
          <button onClick={refresh} disabled={refreshing} className='bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50'>
            <RefreshCw size={16} className={`mr-2 ${refreshing? 'animate-spin':''}`}/>{refreshing? 'Refreshing...':'Refresh'}
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500'>
            <p className='text-sm text-gray-600'>Total Registrations</p>
            <p className='text-2xl font-bold text-emerald-700'>{stats.total}</p>
          </div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-blue-500'>
            <p className='text-sm text-gray-600'>Total Kids</p>
            <p className='text-2xl font-bold text-blue-700'>{stats.kids}</p>
          </div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'>
            <p className='text-sm text-gray-600'>Total Guests</p>
            <p className='text-2xl font-bold text-purple-700'>{stats.guests}</p>
          </div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-amber-500'>
            <p className='text-sm text-gray-600 flex items-center gap-1'><IndianRupee size={14}/>Total Amount</p>
            <p className='text-2xl font-bold text-amber-700'>{stats.sum}</p>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'><Search size={16} className='inline mr-1'/>Search</label>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Name, mobile, transaction id...' className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500'/>
            </div>
            <div className='flex items-end'>
              <button onClick={()=>setShowExportOptions(true)} className='w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center'><Download size={16} className='mr-2'/>Export CSV</button>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'><tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Mobile</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>For</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Kids</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Guests</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Total</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Txn ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Screenshot</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
              </tr></thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filtered.map(r => (
                  <tr key={r.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>{r.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{r.mobile}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{r.registration_for}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{r.kids_count}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{r.guest_count}</td>
                    <td className='px-6 py-4 text-sm text-gray-900'>₹{r.total_amount ?? ((r.kids_count*500)+(r.guest_count*750)+250)}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{r.transaction_id}</td>
                    <td className='px-6 py-4 text-sm text-blue-600'>
                      {r.screenshot_url ? <a href={r.screenshot_url} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-1 hover:underline'><ImageIcon size={14}/>View</a> : '-'}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <div className='text-center py-12'><Users className='mx-auto h-12 w-12 text-gray-400 mb-4'/><h3 className='text-lg font-medium text-gray-900 mb-2'>No registrations found</h3><p className='text-gray-500'>Adjust search.</p></div>}
        </div>
        <div className='mt-6 text-center text-sm text-gray-500'>Showing {filtered.length} of {rows.length} registrations</div>
      </div>

      {showExportOptions && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>Select Columns to Export</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6'>
              {exportColumns.map((col,i)=> (
                <div key={col.key} onClick={()=>toggleExportColumn(i)} className='flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer'>
                  {col.selected? <CheckSquare size={16} className='text-emerald-600 mr-2'/>: <Square size={16} className='text-gray-400 mr-2'/>}
                  <span className={col.selected? 'text-gray-900':'text-gray-500'}>{col.label}</span>
                </div>
              ))}
            </div>
            <div className='flex justify-between items-center'>
              <p className='text-xs text-gray-600'>{exportColumns.filter(c=>c.selected).length} of {exportColumns.length} selected</p>
              <div className='flex gap-2'>
                <button onClick={()=>setShowExportOptions(false)} className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'>Cancel</button>
                <button onClick={exportCsv} disabled={exportColumns.filter(c=>c.selected).length===0} className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center'>
                  <Download size={16} className='mr-2'/>Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
