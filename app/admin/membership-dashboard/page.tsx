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
  transaction_id?: string | null
  transaction_screenshot_url?: string | null
  payment_type?: string | null
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

// Top-level DonutChart to ensure it is in scope where used
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; size?: number; stroke?: number }> = ({ data, size = 160, stroke = 18 }) => {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className='flex flex-col items-center gap-3'>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill='none' stroke='#e5e7eb' strokeWidth={stroke} />
        {total > 0 && data.map((d, i) => {
          const len = (d.value / total) * c
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill='none' stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${c}`} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} />
          )
          offset -= len
          return el
        })}
        {total > 0 && (
          <text x='50%' y='50%' dominantBaseline='middle' textAnchor='middle' className='fill-gray-700' style={{ fontSize: 14 }}>{total}</text>
        )}
      </svg>
      <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700'>
        {data.map((d, i) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={i} className='flex items-center gap-2'>
              <span className='inline-block w-3 h-3 rounded' style={{ backgroundColor: d.color }} />
              <span className='whitespace-nowrap'>{d.label}: {d.value} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
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
      .select('id, full_name, dob, membership_type, created_at, spouse_name, spouse_whatsapp, spouse_dob, transaction_id, transaction_screenshot_url, payment_type')
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

  // Flatten a membership row with spouse and up to 3 kids for CSV export
  const flattenMembership = (m: MembershipRow) => {
    const kids = children
      .filter(c => c.membership_id === m.id)
      .sort((a,b)=> (a.child_index ?? 0) - (b.child_index ?? 0))
      .slice(0,3)
    const [c1, c2, c3] = kids
    return {
      id: m.id,
      full_name: m.full_name,
      transaction_id: m.transaction_id ?? '',
      transaction_screenshot_url: m.transaction_screenshot_url ?? '',
      payment_type: m.payment_type ?? '',
      membership_type: m.membership_type,
      dob: m.dob,
      age: calcAge(m.dob) ?? '',
      spouse_name: m.spouse_name ?? '',
      spouse_whatsapp: m.spouse_whatsapp ?? '',
      spouse_dob: m.spouse_dob ?? '',
      spouse_age: calcAge(m.spouse_dob) ?? '',
      child1_name: c1?.name ?? '',
      child1_age: (calcAge(c1?.dob) ?? ''),
      child1_gender: c1?.gender ?? '',
      child1_school: c1?.school ?? '',
      child2_name: c2?.name ?? '',
      child2_age: (calcAge(c2?.dob) ?? ''),
      child2_gender: c2?.gender ?? '',
      child2_school: c2?.school ?? '',
      child3_name: c3?.name ?? '',
      child3_age: (calcAge(c3?.dob) ?? ''),
      child3_gender: c3?.gender ?? '',
      child3_school: c3?.school ?? '',
      kids_count: kids.length,
      created_at: m.created_at ? new Date(m.created_at).toLocaleString() : ''
    }
  }

  // Table rows with derived fields
  const tableRows = useMemo(() => members.map(m => ({
    id: m.id,
    name: m.full_name,
    transaction_id: (m as any).transaction_id || '',
    transaction_screenshot_url: (m as any).transaction_screenshot_url || '',
    payment_type: (m as any).payment_type || '',
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
            <button onClick={refresh} disabled={refreshing} className='bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <RefreshCw size={14} className={`mr-2 ${refreshing? 'animate-spin':''}`}/>{refreshing? 'Refreshing...':'Refresh'}
            </button>
            <button onClick={exportCsv} disabled={members.length===0} className='bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <Download size={14} className='mr-2'/>Export CSV
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

            {/* Old/New age-wise and kids-wise as donut charts */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              <div className='bg-white p-6 rounded-lg shadow'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>Old Members – Age wise</h2>
                <DonutChart data={[
                  { label: '≤25', value: oldAge['<=25'], color: '#60a5fa' },
                  { label: '26–35', value: oldAge['26-35'], color: '#34d399' },
                  { label: '36–45', value: oldAge['36-45'], color: '#f59e0b' },
                  { label: '>45', value: oldAge['>45'], color: '#a78bfa' },
                ]} />
                <h3 className='text-lg font-semibold text-gray-900 mt-6 mb-4'>Old Members – Kids wise</h3>
                <DonutChart data={[
                  { label: '0 kids', value: oldKids['0'], color: '#e5e7eb' },
                  { label: '1 kid', value: oldKids['1'], color: '#60a5fa' },
                  { label: '2 kids', value: oldKids['2'], color: '#34d399' },
                  { label: '3+ kids', value: oldKids['3+'], color: '#f59e0b' },
                ]} />
              </div>
              <div className='bg-white p-6 rounded-lg shadow'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>New Members – Age wise</h2>
                <DonutChart data={[
                  { label: '≤25', value: newAge['<=25'], color: '#60a5fa' },
                  { label: '26–35', value: newAge['26-35'], color: '#34d399' },
                  { label: '36–45', value: newAge['36-45'], color: '#f59e0b' },
                  { label: '>45', value: newAge['>45'], color: '#a78bfa' },
                ]} />
                <h3 className='text-lg font-semibold text-gray-900 mt-6 mb-4'>New Members – Kids wise</h3>
                <DonutChart data={[
                  { label: '0 kids', value: newKids['0'], color: '#e5e7eb' },
                  { label: '1 kid', value: newKids['1'], color: '#60a5fa' },
                  { label: '2 kids', value: newKids['2'], color: '#34d399' },
                  { label: '3+ kids', value: newKids['3+'], color: '#f59e0b' },
                ]} />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Placeholder kept if you want additional breakdowns later */}
              <div className='hidden' />
              <div className='hidden' />
            </div>

            {/* Data table moved to end with sorting and improved UI */}
            <div className='bg-white rounded-lg shadow overflow-hidden mt-8'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50 sticky top-0 z-10'>
                    <tr>
                      <th><SortHeader label='Name' k='name' /></th>
                      <th><SortHeader label='Type' k='type' /></th>
                      <th className='px-6 py-3 text-left text-xs font-semibold tracking-wider'>Payment</th>
                      <th className='px-6 py-3 text-left text-xs font-semibold tracking-wider'>Transaction ID</th>
                      <th className='px-6 py-3 text-left text-xs font-semibold tracking-wider'>Transaction Screenshot</th>
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
                        <td className='px-6 py-3 text-sm text-gray-700'>{r.payment_type || ''}</td>
                        <td className='px-6 py-3 text-sm text-gray-700 break-words max-w-[200px]'>{r.transaction_id || ''}</td>
                        <td className='px-6 py-3 text-sm text-gray-700'>
                          {r.transaction_screenshot_url ? (
                            <a href={r.transaction_screenshot_url} target='_blank' rel='noreferrer' className='text-sm text-blue-600 underline'>
                              View
                            </a>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </td>
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