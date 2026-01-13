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
    return { total, old: oldMembers.length, New: newMembers.length, kidsTotal }
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

  const flattenMembership = (m: MembershipRow) => {
    const childrenFor = children
      .filter(c => c.membership_id === m.id)
      .sort((a,b)=> (a.child_index ?? 0) - (b.child_index ?? 0))
      .slice(0,3)
    const [c1, c2, c3] = childrenFor
    return {
      id: m.id,
      full_name: m.full_name,
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
      kids_count: childrenFor.length,
      created_at: m.created_at ? new Date(m.created_at).toLocaleString() : ''
    }
  }

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

            <div className='bg-white rounded-lg shadow overflow-hidden mb-8'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Type</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Submitted At</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Age</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Kids</th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {members.map(m => (
                      <tr key={m.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{m.full_name}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{m.membership_type === 'OLD_MEMBER' ? 'Old' : 'New'}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{calcAge(m.dob) ?? ''}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{childCountByMembership.get(m.id) || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          </>
        )}
        <div className='mt-8 text-xs text-gray-500 flex items-center gap-1'><Calendar size={12}/> Updated {new Date().toLocaleString()}</div>
      </div>
    </div>
  )
}