'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, BedDouble, X } from 'lucide-react'

type Person = { name: string; room: string; category: string; mobile: string; rafting: number; booking: string }
type SortKey = 'name' | 'room' | 'category' | 'mobile' | 'rafting' | 'booking'
type SortDir = 'asc' | 'desc'

const ROOM_LEGEND: { code: string; name: string }[] = [
  { code: 'MH', name: 'Mud House' },
  { code: 'NX', name: 'Annex House' },
  { code: 'D', name: 'Dome House' },
  { code: 'TENT', name: 'Tent' },
  { code: 'S.Hall', name: 'Small Hall' },
  { code: 'SD', name: 'Semi Deluxe' },
]

const CATEGORY_STYLES: Record<string, string> = {
  Male: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  Female: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  Kid: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}

export default function RoomAllotmentPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  useEffect(() => {
    fetch(`/files/adventure-escape-rooms.json?v=${Date.now()}`)
      .then(r => r.json())
      .then((d: Person[]) => setPeople(d))
      .catch(() => setPeople([]))
      .finally(() => setLoading(false))
  }, [])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = people
    if (q) list = people.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.booking.toLowerCase().includes(q) ||
      p.room.toLowerCase().includes(q) ||
      p.mobile.includes(q)
    )
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) => {
      if (sortKey === 'rafting') return (a.rafting - b.rafting) * dir
      return String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true, sensitivity: 'base' }) * dir
    })
  }, [people, search, sortKey, sortDir])

  const runSearch = () => setSearch(query)

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <ArrowUpDown size={13} className='opacity-40' />
    return sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'room', label: 'Room' },
    { key: 'category', label: 'Type' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'rafting', label: 'Rafting' },
    { key: 'booking', label: 'Family Head' },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-orange-50 text-slate-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 dark:text-gray-100'>
      <div className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8'>

        <header className='mb-6'>
          <p className='inline-flex items-center gap-1.5 rounded-full bg-orange-500/95 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white'>
            <BedDouble size={13} /> Adventure Escape 2026
          </p>
          <h1 className='mt-3 text-3xl font-black sm:text-4xl'>Room Allotment</h1>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-gray-300'>
            Search by your name, mobile number, or room to find your allotment. You can also sort the table by tapping any column heading.
          </p>
        </header>

        {/* Search */}
        <div className='sticky top-0 z-10 -mx-4 mb-5 bg-gradient-to-br from-sky-50 to-emerald-50 px-4 py-3 dark:from-gray-950 dark:to-gray-950 sm:mx-0 sm:rounded-2xl sm:border sm:border-sky-200 sm:bg-white/80 sm:px-4 sm:shadow-sm sm:backdrop-blur dark:sm:border-gray-700 dark:sm:bg-gray-800'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search size={16} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500' />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
                placeholder='Search by name, mobile or room…'
                className='w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-gray-600 dark:bg-white dark:text-slate-800'
              />
              {query && (
                <button onClick={() => { setQuery(''); setSearch('') }} className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600' aria-label='Clear'>
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={runSearch}
              className='inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110'
            >
              <Search size={15} /> Search
            </button>
          </div>
          {search && (
            <p className='mt-2 text-xs text-slate-600 dark:text-gray-400'>
              Showing {rows.length} result{rows.length === 1 ? '' : 's'} for “{search}”.
            </p>
          )}
        </div>

        {/* Table */}
        <div className='overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <table className='w-full min-w-[760px] border-collapse text-sm'>
            <thead>
              <tr className='border-b border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900'>
                {headers.map(h => (
                  <th key={h.key} className='px-3 py-3 text-left'>
                    <button
                      onClick={() => toggleSort(h.key)}
                      className='inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-300'
                    >
                      {h.label} <SortIcon col={h.key} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className='px-3 py-10 text-center text-sm text-slate-500 dark:text-gray-400'>Loading room allotment…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className='px-3 py-10 text-center text-sm text-slate-500 dark:text-gray-400'>
                  {search ? 'No match found. Try a different spelling or partial name.' : 'No data available.'}
                </td></tr>
              ) : (
                rows.map((p, i) => (
                  <tr key={i} className='border-b border-slate-100 last:border-0 hover:bg-sky-50/60 dark:border-gray-700/60 dark:hover:bg-gray-700/40'>
                    <td className='px-3 py-3 font-semibold text-slate-800 dark:text-gray-100'>{p.name}</td>
                    <td className='px-3 py-3'>
                      <span className='inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>{p.room}</span>
                    </td>
                    <td className='px-3 py-3'>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${CATEGORY_STYLES[p.category] || 'bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-200'}`}>{p.category}</span>
                    </td>
                    <td className='px-3 py-3 text-slate-600 dark:text-gray-300'>
                      {p.mobile ? <a href={`tel:${p.mobile}`} className='hover:text-sky-600'>{p.mobile}</a> : '—'}
                    </td>
                    <td className='px-3 py-3'>
                      {p.rafting > 0
                        ? <span className='inline-flex rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300'>{p.rafting}</span>
                        : <span className='text-slate-400 dark:text-gray-500'>—</span>}
                    </td>
                    <td className='px-3 py-3 text-slate-600 dark:text-gray-300'>{p.booking}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Room legend */}
        <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <p className='mb-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400'>Room Legend</p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {ROOM_LEGEND.map(l => (
              <div key={l.code} className='flex items-center gap-2'>
                <span className='inline-flex min-w-[3rem] justify-center rounded-lg bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>{l.code}</span>
                <span className='text-sm text-slate-700 dark:text-gray-200'>{l.name}</span>
              </div>
            ))}
          </div>
        </div>

        {!loading && (
          <p className='mt-4 text-center text-xs text-slate-500 dark:text-gray-400'>
            {people.length} guests allotted · see room legend above for building codes.
          </p>
        )}
      </div>
    </div>
  )
}
