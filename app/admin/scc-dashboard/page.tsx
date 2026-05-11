'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { RefreshCw, Download, Users, Link as LinkIcon } from 'lucide-react'

type Reg = {
  id: string
  name: string
  mobile_number: string
  age: number
  category: 'Member' | 'Kid'
  skillset: 'Batsman' | 'Bowler' | 'Allrounder'
  fullarm_bowling: 'Yes' | 'No'
  cricheroes_link: string | null
  cricketing_skill: 'Beginner' | 'Intermediate' | 'Advance' | 'Pro'
  jersey_size: '3XL - 46' | 'XXL - 44' | 'XL - 42' | 'L - 40' | 'M - 38' | 'S - 36'
  fees: string
  payment_screenshot_url: string | null
  transaction_reference_number: string
  created_at: string
}

export default function SccDashboard() {
  const [rows, setRows] = useState<Reg[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('sparsh_cricket_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      const msg = String(error.message || '')
      if (msg.includes("Could not find the table 'public.sparsh_cricket_registrations'")) {
        setError('SCC table is not created yet. Run migration 006_create_sparsh_cricket_registrations.sql in Supabase and retry.')
      } else {
        setError(error.message)
      }
      setRows([])
    } else {
      setRows((data as Reg[]) || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const stats = useMemo(() => {
    const total = rows.length
    const members = rows.filter(r => r.category === 'Member').length
    const kids = rows.filter(r => r.category === 'Kid').length
    const beginners = rows.filter(r => r.cricketing_skill === 'Beginner').length
    const intermediate = rows.filter(r => r.cricketing_skill === 'Intermediate').length
    const advancePro = rows.filter(r => r.cricketing_skill === 'Advance' || r.cricketing_skill === 'Pro').length
    const withCricheroes = rows.filter(r => !!r.cricheroes_link).length

    return { total, members, kids, beginners, intermediate, advancePro, withCricheroes }
  }, [rows])

  const exportCsv = () => {
    const header = [
      'id',
      'name',
      'mobile_number',
      'age',
      'category',
      'skillset',
      'fullarm_bowling',
      'cricheroes_link',
      'cricketing_skill',
      'jersey_size',
      'fees',
      'transaction_reference_number',
      'payment_screenshot_url',
      'created_at'
    ]

    const csvRows = rows.map(r => ({
      id: r.id,
      name: r.name,
      mobile_number: r.mobile_number,
      age: r.age,
      category: r.category,
      skillset: r.skillset,
      fullarm_bowling: r.fullarm_bowling,
      cricheroes_link: r.cricheroes_link || '',
      cricketing_skill: r.cricketing_skill,
      jersey_size: r.jersey_size,
      fees: r.fees,
      transaction_reference_number: r.transaction_reference_number,
      payment_screenshot_url: r.payment_screenshot_url || '',
      created_at: new Date(r.created_at).toLocaleString()
    }))

    const csv = [header, ...csvRows.map(r => header.map(k => String((r as any)[k] ?? '').replace(/"/g, '""')))]
      .map(r => r.map(f => `"${f}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scc-registrations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading SCC registrations...</p>
        </div>
      </div>
    )
  }

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
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>SCC Admin Dashboard</h1>
            <p className='text-gray-600 text-sm'>Sparsh Cricket Championship - Season 02 registrations</p>
          </div>
          <div className='flex gap-2'>
            <button onClick={refresh} disabled={refreshing} className='bg-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={exportCsv} disabled={rows.length === 0} className='bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 text-sm'>
              <Download size={14} className='mr-2' />
              Export CSV
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-6'>
          <Card title='Total' value={stats.total} color='bg-gray-100 text-gray-800' />
          <Card title='Members' value={stats.members} color='bg-emerald-100 text-emerald-800' />
          <Card title='Kids' value={stats.kids} color='bg-cyan-100 text-cyan-800' />
          <Card title='Beginner' value={stats.beginners} color='bg-amber-100 text-amber-800' />
          <Card title='Intermediate' value={stats.intermediate} color='bg-indigo-100 text-indigo-800' />
          <Card title='Advance + Pro' value={stats.advancePro} color='bg-purple-100 text-purple-800' />
          <Card title='CricHeroes Link' value={stats.withCricheroes} color='bg-pink-100 text-pink-800' />
        </div>

        {rows.length === 0 ? (
          <div className='text-center py-16'>
            <Users className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No registrations</h3>
            <p className='text-gray-500'>Once players submit the form, entries will appear here.</p>
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
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Age</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Category</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Skillset</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Level</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Jersey</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Full Arm Bowling</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Txn Ref</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Screenshot</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>CricHeroes Link</th>
                    <th className='px-4 py-2 text-left text-xs font-semibold text-gray-600'>Submitted At</th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {rows.map((r, idx) => (
                    <tr key={r.id} className='hover:bg-gray-50 odd:bg-gray-50/40'>
                      <td className='px-4 py-2 text-sm text-gray-700'>{idx + 1}</td>
                      <td className='px-4 py-2 text-sm font-medium text-gray-900'>{r.name}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.mobile_number}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.age}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.category}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.skillset}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.cricketing_skill}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.jersey_size}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>{r.fullarm_bowling}</td>
                      <td className='px-4 py-2 text-sm text-gray-700 break-all'>{r.transaction_reference_number}</td>
                      <td className='px-4 py-2 text-sm text-gray-700'>
                        {r.payment_screenshot_url ? (
                          <a href={r.payment_screenshot_url} target='_blank' rel='noreferrer' className='inline-flex items-center text-blue-600 hover:underline'>
                            <LinkIcon size={14} className='mr-1' /> View
                          </a>
                        ) : (
                          <span className='text-gray-400'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-2 text-sm text-gray-700'>
                        {r.cricheroes_link ? (
                          <div className='max-w-[220px]'>
                            <p className='truncate text-xs text-gray-500'>{r.cricheroes_link}</p>
                            <a href={r.cricheroes_link} target='_blank' rel='noreferrer' className='inline-flex items-center text-blue-600 hover:underline'>
                              <LinkIcon size={14} className='mr-1' /> Open
                            </a>
                          </div>
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
