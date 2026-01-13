'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Baby, Calendar, Download, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MembershipRow {
  id: number
  full_name: string
  dob: string // YYYY-MM-DD
  membership_type: 'OLD_MEMBER' | 'NEW_MEMBER'
  created_at?: string | null
  spouse_name?: string | null
  spouse_whatsapp?: string | null
  spouse_dob?: string | null
}

interface ChildRow {
  membership_id: number
  child_index: number
  name?: string | null
  dob?: string | null // YYYY-MM-DD
  gender?: string | null
  school?: string | null
}

function calcAge(dob: string | null | undefined): number | null {
  if (!dob) return null
  const parts = dob.split('-')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  const birth = new Date(y, (m || 1) - 1, d || 1)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const mDiff = today.getMonth() - birth.getMonth()
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function MembershipDashboard() {
  const [members, setMembers] = useState<MembershipRow[]>([])
  const [children, setChildren] = useState<ChildRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortKey, setSortKey] = useState<'name' | 'type' | 'age' | 'kids' | 'submitted_at'>('submitted_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: mData, error: mErr } = await supabase
      .from('memberships_2026_27')
      .select('id, full_name, dob, membership_type, created_at, spouse_name, spouse_whatsapp, spouse_dob')
      .order('created_at', { ascending: false })
    const { data: cData, error: cErr } = await supabase
      .from('membership_children_2026_27')
      .select('membership_id, child_index, name, dob, gender, school')
    setMembers((mData as any) || [])
    setChildren((cData as any) || [])
    setLoading(false)
  }

  const refresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const childCountByMembership = useMemo(() => {
    const map = new Map<number, number>()
    for (const c of children) {
      map.set(c.membership_id, (map.get(c.membership_id) || 0) + 1)
    }
    return map
  }, [children])

  const totals = useMemo(() => {
    const total = members.length
    const oldMembers = members.filter(m => m.membership_type === 'OLD_MEMBER')
    const newMembers = members.filter(m => m.membership_type === 'NEW_MEMBER')
    const kidsTotal = members.reduce((sum, m) => sum + (childCountByMembership.get(m.id) || 0), 0)
    const old = oldMembers.length
    const New = newMembers.length
    const oldPct = total ? Math.round((old / total) * 100) : 0
    const newPct = total ? 100 - oldPct : 0
    return { total, old, New, kidsTotal, oldPct, newPct }
  }, [members, childCountByMembership])

  function groupAges(rows: MembershipRow[]) {
    const buckets = { '<=25': 0, '26-35': 0, '36-45': 0, '>45': 0 }
    for (const r of rows) {
      const age = calcAge(r.dob)
      if (age == null) continue
      if (age <= 25) buckets['<=25']++
      else if (age <= 35) buckets['26-35']++
      else if (age <= 45) buckets['36-45']++
      else buckets['>45']++
    }
    return buckets
  }

  function groupKids(rows: MembershipRow[]) {
    const buckets = { '0': 0, '1': 0, '2': 0, '3+': 0 }
    for (const r of rows) {
      const count = childCountByMembership.get(r.id) || 0
      if (count === 0) buckets['0']++
      else if (count === 1) buckets['1']++
      else if (count === 2) buckets['2']++
      else buckets['3+']++
    }
    return buckets
  }

  const oldRows = useMemo(() => members.filter(m => m.membership_type === 'OLD_MEMBER'), [members])
  const newRows = useMemo(() => members.filter(m => m.membership_type === 'NEW_MEMBER'), [members])

  const oldAge = useMemo(() => groupAges(oldRows), [oldRows])
  const newAge = useMemo(() => groupAges(newRows), [newRows])
  const oldKids = useMemo(() => groupKids(oldRows), [oldRows, childCountByMembership])
  const newKids = useMemo(() => groupKids(newRows), [newRows, childCountByMembership])

  // Table rows with derived fields
  const tableRows = useMemo(() => members.map(m => ({
    id: m.id,
    name: m.full_name,
    type: m.membership_type === 'OLD_MEMBER' ? 'Old' : 'New',
    submitted_at: m.created_at ? new Date(m.created_at) : null,
    submitted_at_str: m.created_at ? new Date(m.created_at).toLocaleString() : '',
    age: calcAge(m.dob) ?? null,
    kids: childCountByMembership.get(m.id) || 0,
  })), [members, childCountByMembership])

  const sortedRows = useMemo(() => {
    const arr = [...tableRows]
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name) * dir
        case 'type': return a.type.localeCompare(b.type) * dir
        case 'age': return ((a.age ?? -999) - (b.age ?? -999)) * dir
        case 'kids': return (a.kids - b.kids) * dir
        case 'submitted_at': {
          const av = a.submitted_at ? a.submitted_at.getTime() : -1
          const bv = b.submitted_at ? b.submitted_at.getTime() : -1
          return (av - bv) * dir
        }
        default: return 0
      }
    })
    return arr
  }, [tableRows, sortKey, sortDir])

  const toggleSort = (key: 'name'|'type'|'age'|'kids'|'submitted_at') => {
    setSortKey(prev => key)
    setSortDir(prev => (sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'))
  }

  const SortHeader = ({label, k}: {label: string; k: 'name'|'type'|'age'|'kids'|'submitted_at'}) => (
    <button onClick={() => toggleSort(k)} className={`px-6 py-3 text-left text-xs font-semibold tracking-wider flex items-center gap-1 ${sortKey===k? 'text-blue-700':'text-gray-500'}`}>
      <span>{label}</span>
      <span className='text-[10px]'>{sortKey===k ? (sortDir==='asc'?'▲':'▼') : ''}</span>
    </button>
  )

  const exportCsv = () => {
    const rows = members.map(flattenMembership)
    const header = Object.keys(rows[0] || {})
    const csv = [header, ...rows.map(r => header.map(k => String((r as any)[k] ?? '').replace(/"/g,'\"')))]
      .map(r=>r.map(f=>`"${f}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memberships-2026-27-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600 mx-auto mb-4'/>
        <p className='text-gray-600'>Loading Membership registrations...</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Membership Registration Dashboard</h1>
            <p className='text-gray-600'>Overview of membership submissions (2026–27)</p>
          </div>
          <div className='flex gap-2'>
            <button onClick={refresh} disabled={refreshing} className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50'>
              <RefreshCw size={16} className={`mr-2 ${refreshing? 'animate-spin':''}`}/>{refreshing? 'Refreshing...':'Refresh'}
            </button>
            <button onClick={exportCsv} disabled={members.length===0} className='bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50'>
              <Download size={16} className='mr-2'/>Export CSV
            </button>
          </div>
        </div>

        {members.length === 0 ? (
          <div className='text-center py-16'>
            <Users className='mx-auto h-12 w-12 text-gray-400 mb-4'/>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No membership data</h3>
            <p className='text-gray-500'>Ensure Supabase table `memberships_2026_27` has rows and RLS allows select.</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
              <div className='bg-white p-4 rounded-lg shadow border-l-4 border-blue-500'>
                <p className='text-sm text-gray-600'>Total Registrations</p>
                <p className='text-2xl font-bold text-blue-700'>{totals.total}</p>
              </div>
              <div className='bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500'>
                <p className='text-sm text-gray-600'>Old Members</p>
                <p className='text-2xl font-bold text-emerald-700'>{totals.old}</p>
              </div>
              <div className='bg-white p-4 rounded-lg shadow border-l-4 border-amber-500'>
                <p className='text-sm text-gray-600'>New Members</p>
                <p className='text-2xl font-bold text-amber-700'>{totals.New}</p>
              </div>
              <div className='bg-white p-4 rounded-lg shadow border-l-4 border-purple-500'>
                <p className='text-sm text-gray-600 flex items-center gap-1'><Baby size={14}/>Total Kids</p>
                <p className='text-2xl font-bold text-purple-700'>{totals.kidsTotal}</p>
              </div>
            </div>

            {/* Old/New breakdown with percentages and donut */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
              <div className='bg-white p-6 rounded-lg shadow border border-gray-100'>
                <div className='text-sm text-gray-600 mb-1'>Old Members</div>
                <div className='flex items-end gap-2'>
                  <div className='text-2xl font-bold text-emerald-700'>{totals.old}</div>
                  <div className='text-sm text-gray-500 mb-1'>({totals.oldPct}%)</div>
                </div>
              </div>
              <div className='bg-white p-6 rounded-lg shadow border border-gray-100'>
                <div className='text-sm text-gray-600 mb-1'>New Members</div>
                <div className='flex items-end gap-2'>
                  <div className='text-2xl font-bold text-amber-700'>{totals.New}</div>
                  <div className='text-sm text-gray-500 mb-1'>({totals.newPct}%)</div>
                </div>
              </div>
              <div className='bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-center'>
                {totals.total === 0 ? (
                  <div className='text-gray-500 text-sm'>No data</div>
                ) : (
                  (() => {
                    const size = 140, stroke = 16, r = (size - stroke) / 2, c = 2 * Math.PI * r
                    const oldLen = (totals.old / totals.total) * c
                    const newLen = c - oldLen
                    return (
                      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle cx={size/2} cy={size/2} r={r} fill='none' stroke='#e5e7eb' strokeWidth={stroke} />
                        <circle cx={size/2} cy={size/2} r={r} fill='none' stroke='#f59e0b' strokeWidth={stroke} strokeDasharray={`${newLen} ${c}`} strokeDashoffset={0} transform={`rotate(-90 ${size/2} ${size/2})`} />
                        <circle cx={size/2} cy={size/2} r={r} fill='none' stroke='#10b981' strokeWidth={stroke} strokeDasharray={`${oldLen} ${c}`} strokeDashoffset={newLen} transform={`rotate(-90 ${size/2} ${size/2})`} />
                        <text x='50%' y='50%' dominantBaseline='middle' textAnchor='middle' className='fill-gray-700' style={{fontSize: 14}}>{totals.oldPct}% Old</text>
                      </svg>
                    )
                  })()
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-white p-6 rounded-lg shadow'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>Old Members – Age wise</h2>
                <ul className='space-y-2 text-sm text-gray-700'>
                  <li className='flex justify-between'><span>≤25</span><span>{oldAge['<=25']}</span></li>
                  <li className='flex justify-between'><span>26–35</span><span>{oldAge['26-35']}</span></li>
                  <li className='flex justify-between'><span>36–45</span><span>{oldAge['36-45']}</span></li>
                  <li className='flex justify-between'><span>&gt;45</span><span>{oldAge['>45']}</span></li>
                </ul>
                <h3 className='text-lg font-semibold text-gray-900 mt-6 mb-2'>Old Members – Kids wise</h3>
                <ul className='space-y-2 text-sm text-gray-700'>
                  <li className='flex justify-between'><span>0 kids</span><span>{oldKids['0']}</span></li>
                  <li className='flex justify-between'><span>1 kid</span><span>{oldKids['1']}</span></li>
                  <li className='flex justify-between'><span>2 kids</span><span>{oldKids['2']}</span></li>
                  <li className='flex justify-between'><span>3+ kids</span><span>{oldKids['3+']}</span></li>
                </ul>
              </div>

              <div className='bg-white p-6 rounded-lg shadow'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>New Members – Age wise</h2>
                <ul className='space-y-2 text-sm text-gray-700'>
                  <li className='flex justify-between'><span>≤25</span><span>{newAge['<=25']}</span></li>
                  <li className='flex justify-between'><span>26–35</span><span>{newAge['26-35']}</span></li>
                  <li className='flex justify-between'><span>36–45</span><span>{newAge['36-45']}</span></li>
                  <li className='flex justify-between'><span>&gt;45</span><span>{newAge['>45']}</span></li>
                </ul>
                <h3 className='text-lg font-semibold text-gray-900 mt-6 mb-2'>New Members – Kids wise</h3>
                <ul className='space-y-2 text-sm text-gray-700'>
                  <li className='flex justify-between'><span>0 kids</span><span>{newKids['0']}</span></li>
                  <li className='flex justify-between'><span>1 kid</span><span>{newKids['1']}</span></li>
                  <li className='flex justify-between'><span>2 kids</span><span>{newKids['2']}</span></li>
                  <li className='flex justify-between'><span>3+ kids</span><span>{newKids['3+']}</span></li>
                </ul>
              </div>
            </div>

            {/* Data table moved to end with sorting and improved UI */}
            <div className='bg-white rounded-lg shadow overflow-hidden mt-8'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50 sticky top-0 z-10'>
                    <tr>
                      <th><SortHeader label='Name' k='name' /></th>
                      <th><SortHeader label='Type' k='type' /></th>
                      <th><SortHeader label='Age' k='age' /></th>
                      <th><SortHeader label='Kids' k='kids' /></th>
                      <th><SortHeader label='Submitted At' k='submitted_at' /></th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {sortedRows.map(r => (
                      <tr key={r.id} className='hover:bg-gray-50 odd:bg-gray-50/40'>
                        <td className='px-6 py-3 text-sm font-medium text-gray-900'>{r.name}</td>
                        <td className='px-6 py-3 text-sm'><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${r.type==='Old'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{r.type}</span></td>
                        <td className='px-6 py-3 text-sm text-gray-700'>{r.age ?? ''}</td>
                        <td className='px-6 py-3 text-sm text-gray-700'>{r.kids}</td>
                        <td className='px-6 py-3 text-sm text-gray-700 whitespace-nowrap'>{r.submitted_at_str}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        <div className='mt-8 text-xs text-gray-500 flex items-center gap-1'><Calendar size={12}/> Updated {new Date().toLocaleString()}</div>
      </div>
    </div>
  )
}