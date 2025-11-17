'use client'

import React, { useState, useEffect } from 'react'
import { Users, Download, Filter, Search, RefreshCw, CheckSquare, Square } from 'lucide-react'
import { getRegistrations } from '@/lib/supabase'
import type { Registration } from '@/lib/supabase'

interface ExportColumn { key: string; label: string; defaultSelected: boolean }

export default function Spl02Dashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'kids'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showExportOptions, setShowExportOptions] = useState(false)

  const [exportColumns, setExportColumns] = useState<ExportColumn[]>([
    { key: 'id', label: 'Registration ID', defaultSelected: true },
    { key: 'category', label: 'Category', defaultSelected: true },
    { key: 'full_name', label: 'Full Name', defaultSelected: true },
    { key: 'parent_name', label: 'Parent Name', defaultSelected: true },
    { key: 'gender', label: 'Gender (Kids)', defaultSelected: true },
    { key: 'mobile_number', label: 'Mobile Number', defaultSelected: true },
    { key: 'date_of_birth', label: 'Date of Birth', defaultSelected: true },
    { key: 'age', label: 'Age (Calculated)', defaultSelected: true },
    { key: 'skillset', label: 'Skillset', defaultSelected: true },
    { key: 'bowling_arm', label: 'Bowling Arm', defaultSelected: true },
    { key: 'cricket_experience', label: 'Cricket Experience', defaultSelected: false },
    { key: 'cric_heroes_link', label: 'Cric Heroes Link', defaultSelected: false },
    { key: 'jersey_name', label: 'Jersey Name', defaultSelected: true },
    { key: 'jersey_number', label: 'Jersey Number', defaultSelected: true },
    { key: 'jersey_size', label: 'Jersey Size', defaultSelected: true },
    { key: 'photo_url', label: 'Photo URL', defaultSelected: false },
    { key: 'transaction_id', label: 'Transaction ID', defaultSelected: true },
    { key: 'transaction_screenshot_url', label: 'Transaction Screenshot URL', defaultSelected: false },
    { key: 'registration_fee', label: 'Registration Fee', defaultSelected: true },
    { key: 'registration_date', label: 'Registration Date', defaultSelected: true },
    { key: 'created_at', label: 'Created At', defaultSelected: false }
  ])

  useEffect(() => { loadRegistrations() }, [])

  const loadRegistrations = async () => {
    setLoading(true)
    const { data, error } = await getRegistrations()
    if (!error && data) setRegistrations(data)
    setLoading(false)
  }

  const refreshData = async () => { setRefreshing(true); await loadRegistrations(); setRefreshing(false) }

  const filtered = registrations.filter(reg => {
    const matchesCategory = filter === 'all' || reg.category === filter
    const term = searchTerm.toLowerCase()
    const matchesSearch = !term || reg.full_name.toLowerCase().includes(term) || reg.mobile_number.includes(searchTerm) || reg.jersey_name.toLowerCase().includes(term) || (reg.transaction_id && reg.transaction_id.toLowerCase().includes(term)) || (reg.gender && reg.gender.toLowerCase().includes(term))
    return matchesCategory && matchesSearch
  })

  const stats = {
    total: registrations.length,
    male: registrations.filter(r => r.category === 'male').length,
    female: registrations.filter(r => r.category === 'female').length,
    kids: registrations.filter(r => r.category === 'kids').length,
    boys: registrations.filter(r => r.category === 'kids' && r.gender === 'Boy').length,
    girls: registrations.filter(r => r.category === 'kids' && r.gender === 'Girl').length
  }

  const toggleExportColumn = (index: number) => setExportColumns(prev => prev.map((col,i)=> i===index? { ...col, defaultSelected: !col.defaultSelected }: col))

  const calculateAge = (dateOfBirth: string) => { if (!dateOfBirth) return ''; const d=new Date(dateOfBirth); const t=new Date(); let a=t.getFullYear()-d.getFullYear(); const m=t.getMonth()-d.getMonth(); if(m<0||(m===0&&t.getDate()<d.getDate())) a--; return a }

  const exportToCsv = () => {
    const selected = exportColumns.filter(c=>c.defaultSelected)
    const headers = selected.map(c=>c.label)
    const rows = filtered.map(reg => selected.map(col => {
      switch(col.key){
        case 'id': return reg.id||''
        case 'category': return reg.category||''
        case 'full_name': return reg.full_name||''
        case 'parent_name': return reg.parent_name||''
        case 'gender': return reg.gender||''
        case 'mobile_number': return reg.mobile_number||''
        case 'date_of_birth': return reg.date_of_birth? new Date(reg.date_of_birth).toLocaleDateString():''
        case 'age': return reg.date_of_birth? calculateAge(reg.date_of_birth).toString():''
        case 'skillset': return reg.skillset||''
        case 'bowling_arm': return reg.bowling_arm||''
        case 'cricket_experience': return reg.cricket_experience||''
        case 'cric_heroes_link': return reg.cric_heroes_link||''
        case 'jersey_name': return reg.jersey_name||''
        case 'jersey_number': return reg.jersey_number||''
        case 'jersey_size': return reg.jersey_size||''
        case 'photo_url': return reg.photo_url||''
        case 'transaction_id': return reg.transaction_id||''
        case 'transaction_screenshot_url': return reg.transaction_screenshot_url||''
        case 'registration_fee': return reg.category==='kids'? '?600':'?800'
        case 'registration_date': return reg.registration_date? new Date(reg.registration_date).toLocaleDateString():''
        case 'created_at': return reg.created_at? new Date(reg.created_at).toLocaleString():''
        default: return ''
      }
    }))
    const csv = [headers,...rows].map(r=>r.map(f=>`"${f}"`).join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`spl02-registrations-${selected.length}cols-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url); setShowExportOptions(false)
  }

  const getCategoryColor = (category: string) => category==='male'? 'bg-blue-100 text-blue-800 border-blue-200': category==='female'? 'bg-pink-100 text-pink-800 border-pink-200': category==='kids'? 'bg-green-100 text-green-800 border-green-200': 'bg-gray-100 text-gray-800 border-gray-200'

  if (loading) return <div className='min-h-screen flex items-center justify-center'><div className='text-center'><div className='animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600 mx-auto mb-4'/><p className='text-gray-600'>Loading SPL 02 registrations...</p></div></div>

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>SPL 02 Registration Dashboard</h1>
            <p className='text-gray-600'>Manage tournament registrations</p>
          </div>
          <button onClick={refreshData} disabled={refreshing} className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50'>
            <RefreshCw size={16} className={`mr-2 ${refreshing? 'animate-spin':''}`}/>{refreshing? 'Refreshing...':'Refresh'}
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8'>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-blue-500'><div className='flex items-center'><Users className='text-blue-600 mr-2' size={20}/><div><p className='text-sm text-gray-600'>Total</p><p className='text-2xl font-bold text-gray-900'>{stats.total}</p></div></div></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-blue-500'><div className='flex items-center'><div className='w-3 h-3 bg-blue-600 rounded-full mr-2'/><div><p className='text-sm text-gray-600'>Male</p><p className='text-2xl font-bold text-blue-600'>{stats.male}</p></div></div></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-pink-500'><div className='flex items-center'><div className='w-3 h-3 bg-pink-600 rounded-full mr-2'/><div><p className='text-sm text-gray-600'>Female</p><p className='text-2xl font-bold text-pink-600'>{stats.female}</p></div></div></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-green-500'><div className='flex items-center'><div className='w-3 h-3 bg-green-600 rounded-full mr-2'/><div><p className='text-sm text-gray-600'>Kids (Total)</p><p className='text-2xl font-bold text-green-600'>{stats.kids}</p></div></div></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-cyan-500'><div className='flex items-center'><div className='w-3 h-3 bg-cyan-600 rounded-full mr-2'/><div><p className='text-sm text-gray-600'>Boys</p><p className='text-2xl font-bold text-cyan-600'>{stats.boys}</p></div></div></div>
          <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'><div className='flex items-center'><div className='w-3 h-3 bg-purple-600 rounded-full mr-2'/><div><p className='text-sm text-gray-600'>Girls</p><p className='text-2xl font-bold text-purple-600'>{stats.girls}</p></div></div></div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'><Search size={16} className='inline mr-1'/>Search</label>
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder='Name, mobile, jersey, gender, transaction...' className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'/>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'><Filter size={16} className='inline mr-1'/>Category</label>
              <select value={filter} onChange={e=>setFilter(e.target.value as any)} className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value='all'>All Categories</option><option value='male'>Male</option><option value='female'>Female</option><option value='kids'>Kids</option>
              </select>
            </div>
            <div className='flex items-end'>
              <button onClick={()=>setShowExportOptions(true)} className='w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center'><Download size={16} className='mr-2'/>Export CSV</button>
            </div>
          </div>
        </div>
        {showExportOptions && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>Select Columns to Export</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-6'>
                {exportColumns.map((column,index)=>(
                  <div key={column.key} onClick={()=>toggleExportColumn(index)} className='flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer'>
                    {column.defaultSelected? <CheckSquare size={16} className='text-green-600 mr-2'/>: <Square size={16} className='text-gray-400 mr-2'/>}
                    <span className={column.defaultSelected? 'text-gray-900':'text-gray-500'}>{column.label}</span>
                  </div>
                ))}
              </div>
              <div className='flex justify-between items-center'>
                <p className='text-sm text-gray-600'>{exportColumns.filter(c=>c.defaultSelected).length} of {exportColumns.length} columns selected</p>
                <div className='flex gap-2'>
                  <button onClick={()=>setShowExportOptions(false)} className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'>Cancel</button>
                  <button onClick={exportToCsv} disabled={exportColumns.filter(c=>c.defaultSelected).length===0} className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center'><Download size={16} className='mr-2'/>Export CSV</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'><tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Participant</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Category</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Contact</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Jersey</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Transaction ID</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
              </tr></thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filtered.map(reg => (
                  <tr key={reg.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{reg.full_name}</div>
                      {reg.parent_name && <div className='text-sm text-gray-500'>Parent: {reg.parent_name}</div>}
                      {reg.category==='kids' && reg.gender && <div className='text-sm text-blue-600 font-medium'>{reg.gender}</div>}
                      <div className='text-sm text-gray-500'>DOB: {reg.date_of_birth? new Date(reg.date_of_birth).toLocaleDateString():'N/A'}</div>
                      <div className='text-sm text-gray-500'>Age: {reg.date_of_birth? calculateAge(reg.date_of_birth):'N/A'}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(reg.category)}`}>{reg.category.charAt(0).toUpperCase()+reg.category.slice(1)}</span></td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'><div>{reg.mobile_number}</div><div className='text-gray-500'>{reg.skillset}</div></td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'><div className='font-medium'>{reg.jersey_name}</div><div className='text-gray-500'>#{reg.jersey_number} - {reg.jersey_size}</div></td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'><div className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>{reg.transaction_id || 'N/A'}</div></td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{reg.created_at? new Date(reg.created_at).toLocaleDateString():''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <div className='text-center py-12'><Users className='mx-auto h-12 w-12 text-gray-400 mb-4'/><h3 className='text-lg font-medium text-gray-900 mb-2'>No registrations found</h3><p className='text-gray-500'>Adjust search or filters.</p></div>}
        </div>
        <div className='mt-6 text-center text-sm text-gray-500'>Showing {filtered.length} of {registrations.length} registrations {stats.kids>0 && <span className='ml-4'>Kids: {stats.boys} Boys / {stats.girls} Girls</span>}</div>
      </div>
    </div>
  )
}
