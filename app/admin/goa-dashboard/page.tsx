'use client'

import React, { useState, useEffect } from 'react'
import { Users, RefreshCw, Search, Download, CheckSquare, Square, Filter } from 'lucide-react'
import { getGoaInterest } from '@/lib/supabase'
import type { GoaInterest } from '@/lib/supabase'

interface ExportColumn { key: string; label: string; selected: boolean }

export default function GoaDashboard() {
  const [interests, setInterests] = useState<GoaInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'kids' | 'no-kids' | 'self' | 'bus' | 'train'>('all')
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>([
    { key: 'id', label: 'ID', selected: true },
    { key: 'name', label: 'Name', selected: true },
    { key: 'mobile', label: 'Mobile', selected: true },
    { key: 'transport', label: 'Transport', selected: true },
    { key: 'kids', label: 'Kids (Yes/No)', selected: true },
    { key: 'kids_count', label: 'Kids Count', selected: true },
    { key: 'kids_ages', label: 'Kids Ages', selected: true },
    { key: 'extra_couple_count', label: 'Extra Couple Count', selected: true },
    { key: 'notes', label: 'Notes', selected: false },
    { key: 'created_at', label: 'Submitted At', selected: true }
  ])

  useEffect(() => { loadInterests() }, [])

  const loadInterests = async () => {
    setLoading(true)
    const { data } = await getGoaInterest()
    if (data) setInterests(data)
    setLoading(false)
  }

  const refreshData = async () => { 
    setRefreshing(true)
    await loadInterests()
    setRefreshing(false)
  }

  const filtered = interests.filter(row => {
    const hasKids = row.kids === 'Yes';
    const transport = row.transport;
    const matchesFilter = filter === 'all' || 
      (filter === 'kids' && hasKids) || 
      (filter === 'no-kids' && !hasKids) || 
      (filter === 'self' && transport === 'Self') || 
      (filter === 'bus' && transport === 'Sparsh Bus') || 
      (filter === 'train' && transport === 'Sparsh Train');
    
    if (!matchesFilter) return false;
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return row.name.toLowerCase().includes(term) || 
      row.mobile.includes(searchTerm) || 
      row.transport.toLowerCase().includes(term) || 
      (row.notes && row.notes.toLowerCase().includes(term));
  })

  const stats = {
    total: interests.length,
    withKids: interests.filter(g => g.kids === 'Yes').length,
    totalKids: interests.reduce((sum, g) => sum + (g.kids === 'Yes' && g.kids_count ? g.kids_count : 0), 0),
    transportSelf: interests.filter(g => g.transport === 'Self').length,
    transportBus: interests.filter(g => g.transport === 'Sparsh Bus').length,
    transportTrain: interests.filter(g => g.transport === 'Sparsh Train').length
  }

  const toggleExportColumn = (index: number) => {
    setExportColumns(prev => prev.map((c,i)=> i===index? { ...c, selected: !c.selected }: c))
  }

  const exportCsv = () => {
    const cols = exportColumns.filter(c=>c.selected)
    if (cols.length === 0) return
    const header = cols.map(c=>c.label)
    const rows = filtered.map(row => cols.map(c => {
      switch(c.key){
        case 'id': return row.id || ''
        case 'name': return row.name || ''
        case 'mobile': return row.mobile || ''
        case 'transport': return row.transport || ''
        case 'kids': return row.kids || ''
        case 'kids_count': return row.kids === 'Yes' ? (row.kids_count ?? '') : ''
        case 'kids_ages': return row.kids === 'Yes' ? (row.kids_ages ?? '') : ''
        case 'extra_couple_count': return row.extra_couple_count ?? ''
        case 'notes': return row.notes || ''
        case 'created_at': return row.created_at ? new Date(row.created_at).toLocaleString() : ''
        default: return ''
      }
    }))
    const csv = [header, ...rows].map(r=>r.map(f=>`"${String(f).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `goa-interest-${cols.length}cols-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportOptions(false)
  }

  if (loading) return <div className='min-h-screen flex items-center justify-center'><div className='text-center'><div className='animate-spin rounded-full h-24 w-24 border-b-2 border-teal-600 mx-auto mb-4'/><p className='text-gray-600'>Loading Goa interests...</p></div></div>

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>GOA Registration Dashboard</h1>
            <p className='text-gray-600'>Interest submissions for Goa 2026 getaway</p>
          </div>
          <button onClick={refreshData} disabled={refreshing} className='bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center disabled:opacity-50'>
            <RefreshCw size={16} className={`mr-2 ${refreshing? 'animate-spin':''}`}/>{refreshing? 'Refreshing...':'Refresh'}
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8'>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-blue-500'><p className='text-sm text-gray-600'>Total Submissions</p><p className='text-2xl font-bold text-gray-900'>{stats.total}</p></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-green-500'><p className='text-sm text-gray-600'>Families Bringing Kids</p><p className='text-2xl font-bold text-green-600'>{stats.withKids}</p></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-teal-500'><p className='text-sm text-gray-600'>Total Kids</p><p className='text-2xl font-bold text-teal-600'>{stats.totalKids}</p></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-gray-500'><p className='text-sm text-gray-600'>Self Transport</p><p className='text-2xl font-bold text-gray-700'>{stats.transportSelf}</p></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500'><p className='text-sm text-gray-600'>Bus Interest</p><p className='text-2xl font-bold text-yellow-600'>{stats.transportBus}</p></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500'><p className='text-sm text-gray-600'>Train Interest</p><p className='text-2xl font-bold text-indigo-600'>{stats.transportTrain}</p></div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'><Search size={16} className='inline mr-1'/>Search</label>
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder='Name, mobile, transport, notes...' className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'/>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'><Filter size={16} className='inline mr-1'/>Category</label>
              <select value={filter} onChange={e=>setFilter(e.target.value as any)} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='all'>All</option>
                <option value='kids'>With Kids</option>
                <option value='no-kids'>No Kids</option>
                <option value='self'>Self Transport</option>
                <option value='bus'>Bus Interest</option>
                <option value='train'>Train Interest</option>
              </select>
            </div>
            <div className='flex items-end'>
              <button onClick={()=>setShowExportOptions(true)} className='w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center'><Download size={16} className='mr-2'/>Export CSV</button>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'><tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Mobile</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Kids</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Transport</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Extra Couples</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Notes</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
              </tr></thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filtered.map(row => (
                  <tr key={row.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>{row.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{row.mobile}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{row.kids === 'Yes' ? `${row.kids_count || 0} (${row.kids_ages || ''})` : 'No'}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{row.transport}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{row.extra_couple_count ?? 0}</td>
                    <td className='px-6 py-4 text-sm text-gray-500 max-w-xs truncate' title={row.notes || ''}>{row.notes || '-'}</td>
                    <td className='px-6 py-4 text-sm text-gray-500'>{row.created_at ? new Date(row.created_at).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <div className='text-center py-12'><Users className='mx-auto h-12 w-12 text-gray-400 mb-4'/><h3 className='text-lg font-medium text-gray-900 mb-2'>No interest submissions found</h3><p className='text-gray-500'>Adjust search or filters.</p></div>}
        </div>
        <div className='mt-6 text-center text-sm text-gray-500'>Showing {filtered.length} of {interests.length} interest submissions</div>
      </div>

      {showExportOptions && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>Select Columns to Export</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6'>
              {exportColumns.map((col,i)=> (
                <div key={col.key} onClick={()=>toggleExportColumn(i)} className='flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer'>
                  {col.selected? <CheckSquare size={16} className='text-green-600 mr-2'/>: <Square size={16} className='text-gray-400 mr-2'/>}
                  <span className={col.selected? 'text-gray-900':'text-gray-500'}>{col.label}</span>
                </div>
              ))}
            </div>
            <div className='flex justify-between items-center'>
              <p className='text-xs text-gray-600'>{exportColumns.filter(c=>c.selected).length} of {exportColumns.length} selected</p>
              <div className='flex gap-2'>
                <button onClick={()=>setShowExportOptions(false)} className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'>Cancel</button>
                <button onClick={exportCsv} disabled={exportColumns.filter(c=>c.selected).length===0} className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center'>
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
