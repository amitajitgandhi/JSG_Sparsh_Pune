'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Download, RefreshCw, Users, Trophy, Shirt } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type Reg = {
  id: string
  name: string
  mobile: string
  age: number
  gender: 'Male' | 'Female'
  category: 'Member' | 'Kid'
  jersey_size: string
  selected_sports: string[]
  sport_ratings: Record<string, number>
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPORTS = [
  'Carrom',
  'Chess',
  'Table Tennis',
  'Badminton',
  'Pickle Ball',
  'Kho Kho',
  'Lemon & Spoon Race',
  'Sack Race',
  'Tug of War',
  'Volleyball',
  'Dodge Ball',
  'Three-Legged Race',
]

const JERSEY_SIZE_ORDER = ['28', '30', '32', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

const AGE_GROUPS = [
  { label: '5–10', min: 5, max: 10 },
  { label: '10–25', min: 11, max: 25 },
  { label: '25–40', min: 26, max: 40 },
  { label: '40+', min: 41, max: 200 },
]

const CHART_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7',
]

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'
type SportPlayerField = 'name' | 'mobile' | 'age' | 'jersey_size' | 'rating' | 'gender'

function sortPlayers(
  players: Array<Reg & { rating: number }>,
  field: SportPlayerField,
  dir: SortDir
) {
  return [...players].sort((a, b) => {
    let cmp = 0
    if (field === 'age' || field === 'rating') {
      cmp = (a[field] ?? 0) - (b[field] ?? 0)
    } else {
      cmp = String(a[field] ?? '').localeCompare(String(b[field] ?? ''))
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

// ─── SortableHeader ───────────────────────────────────────────────────────────

function SortableHeader({
  label,
  field,
  active,
  dir,
  onClick,
}: {
  label: string
  field: SportPlayerField
  active: SportPlayerField
  dir: SortDir
  onClick: (f: SportPlayerField) => void
}) {
  return (
    <th
      onClick={() => onClick(field)}
      className='px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-neutral-700 whitespace-nowrap'
    >
      {label}{' '}
      <span className='ml-0.5 text-gray-400'>
        {active === field ? (dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, color, icon }: { title: string; value: string | number; color: string; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm text-center ${color}`}>
      {icon && <div className='flex justify-center mb-1'>{icon}</div>}
      <div className='text-xs font-medium opacity-80'>{title}</div>
      <div className='text-2xl font-bold mt-0.5'>{value}</div>
    </div>
  )
}

// ─── ChartCard ────────────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='bg-white dark:bg-neutral-800 rounded-xl shadow p-5'>
      <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4'>{title}</h3>
      {children}
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg px-3 py-2 shadow text-sm'>
        {label && <p className='font-semibold text-gray-800 dark:text-gray-100 mb-1'>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className='text-gray-600 dark:text-gray-300'>
            {p.name ? `${p.name}: ` : ''}<span className='font-bold'>{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Helper: extract jersey label from stored "XL - 42" format ───────────────
function getJerseyLabel(raw: string | null | undefined): string {
  if (!raw) return '—'
  return raw.includes(' - ') ? raw.split(' - ')[0].trim() : raw.trim()
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function K26StatsPage() {
  const [rows, setRows] = useState<Reg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | string>('overview')
  const [sortField, setSortField] = useState<SportPlayerField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('sparsh_khelotsav_registrations')
        .select('id,name,mobile,age,gender,category,jersey_size,selected_sports,sport_ratings,created_at')
        .order('created_at', { ascending: false })
      if (err) {
        setError(`Failed to load: ${err.message}`)
        setRows([])
      } else {
        setRows((data as Reg[]) || [])
      }
    } catch (e) {
      console.error(e)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Reset sort when tab changes
  useEffect(() => {
    setSortField('name')
    setSortDir('asc')
  }, [activeTab])

  // ── Overview stats ──────────────────────────────────────────────────────────

  const overviewStats = useMemo(() => {
    const total = rows.length
    const males = rows.filter(r => r.gender === 'Male').length
    const females = rows.filter(r => r.gender === 'Female').length
    const members = rows.filter(r => r.category === 'Member').length
    const kids = rows.filter(r => r.category === 'Kid').length

    const sportCounts = SPORTS.map(sport => ({
      sport,
      count: rows.filter(r => r.selected_sports?.includes(sport)).length,
    })).filter(d => d.count > 0)

    const mostSelected = sportCounts.length > 0
      ? sportCounts.reduce((a, b) => a.count >= b.count ? a : b)
      : null
    const leastSelected = sportCounts.length > 0
      ? sportCounts.reduce((a, b) => a.count <= b.count ? a : b)
      : null

    return { total, males, females, members, kids, mostSelected, leastSelected }
  }, [rows])

  // ── Chart data ──────────────────────────────────────────────────────────────

  // Sport participation by age group — horizontal stacked bar
  const sportAgeData = useMemo(() => {
    return SPORTS.map(sport => {
      const players = rows.filter(r => r.selected_sports?.includes(sport))
      const entry: Record<string, string | number> = { sport }
      AGE_GROUPS.forEach(g => {
        entry[g.label] = players.filter(r => r.age >= g.min && r.age <= g.max).length
      })
      return entry
    }).filter(d => AGE_GROUPS.some(g => (d[g.label] as number) > 0))
  }, [rows])

  const ageBarData = useMemo(() => {
    return AGE_GROUPS.map(g => ({
      label: g.label,
      count: rows.filter(r => r.age >= g.min && r.age <= g.max).length,
    })).filter(d => d.count > 0)
  }, [rows])

  const jerseyBarData = useMemo(() => {
    const counts: Record<string, number> = {}
    rows.forEach(r => {
      if (!r.jersey_size) return
      // Stored format is "XL - 42" — extract the label (first part)
      const label = r.jersey_size.includes(' - ') ? r.jersey_size.split(' - ')[0].trim() : r.jersey_size.trim()
      if (label) counts[label] = (counts[label] || 0) + 1
    })
    return JERSEY_SIZE_ORDER
      .filter(s => counts[s])
      .map(s => ({ label: s, count: counts[s] }))
  }, [rows])

  const sportRadarData = useMemo(() => {
    return SPORTS.map(sport => ({
      sport: sport.length > 12 ? sport.slice(0, 12) + '…' : sport,
      fullName: sport,
      count: rows.filter(r => r.selected_sports?.includes(sport)).length,
    }))
  }, [rows])

  const genderPieData = useMemo(() => [
    { name: 'Male', value: overviewStats.males },
    { name: 'Female', value: overviewStats.females },
  ].filter(d => d.value > 0), [overviewStats])

  const categoryPieData = useMemo(() => [
    { name: 'Member', value: overviewStats.members },
    { name: 'Kid', value: overviewStats.kids },
  ].filter(d => d.value > 0), [overviewStats])

  const genderPerSportData = useMemo(() => {
    return SPORTS.map(sport => {
      const players = rows.filter(r => r.selected_sports?.includes(sport))
      return {
        sport: sport.length > 10 ? sport.slice(0, 10) + '…' : sport,
        fullName: sport,
        Male: players.filter(r => r.gender === 'Male').length,
        Female: players.filter(r => r.gender === 'Female').length,
      }
    }).filter(d => d.Male > 0 || d.Female > 0)
  }, [rows])

  // ── Sport tab player list ───────────────────────────────────────────────────

  const sportPlayers = useMemo(() => {
    if (activeTab === 'overview') return []
    return rows
      .filter(r => r.selected_sports?.includes(activeTab))
      .map(r => ({
        ...r,
        rating: r.sport_ratings?.[activeTab] ?? 0,
      }))
  }, [rows, activeTab])

  const sortedSportPlayers = useMemo(
    () => sortPlayers(sportPlayers, sortField, sortDir),
    [sportPlayers, sortField, sortDir]
  )

  const handleSort = (field: SportPlayerField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // ── Export CSV for active sport tab ────────────────────────────────────────

  const downloadCsv = (fileName: string, csvRows: string[]) => {
    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = () => {
    if (activeTab === 'overview') return
    const headers = ['Sr. No.', 'Player Name', 'Mobile Number', 'Age', 'Jersey Size', 'Rating', 'Gender']
    const csvRows = [headers.join(',')]
    sortedSportPlayers.forEach((r, idx) => {
      const jerseyLabel = getJerseyLabel(r.jersey_size)
      csvRows.push([
        idx + 1,
        `"${r.name || ''}"`,
        `"${r.mobile || ''}"`,
        r.age ?? '',
        `"${jerseyLabel}"`,
        r.rating ?? '',
        `"${r.gender || ''}"`,
      ].join(','))
    })

    downloadCsv(`k26-${activeTab.toLowerCase().replace(/\s+/g, '-')}-players-${new Date().toISOString().split('T')[0]}.csv`, csvRows)
  }

  const exportOverviewCsv = () => {
    const csvRows: string[] = []

    // Summary cards
    csvRows.push('Overview Summary')
    csvRows.push('Metric,Value')
    csvRows.push(`"Total Registrations",${overviewStats.total}`)
    csvRows.push(`"Males",${overviewStats.males}`)
    csvRows.push(`"Females",${overviewStats.females}`)
    csvRows.push(`"Members",${overviewStats.members}`)
    csvRows.push(`"Kids",${overviewStats.kids}`)
    csvRows.push(`"Most Selected Sport","${overviewStats.mostSelected ? `${overviewStats.mostSelected.sport} (${overviewStats.mostSelected.count})` : '—'}"`)
    csvRows.push(`"Least Selected Sport","${overviewStats.leastSelected ? `${overviewStats.leastSelected.sport} (${overviewStats.leastSelected.count})` : '—'}"`)
    csvRows.push(`"Sports Available",${SPORTS.length}`)
    csvRows.push('')

    // Sport-wise participation by age group chart
    csvRows.push('Sport-wise Participation (by Age Group)')
    csvRows.push(['Sport', ...AGE_GROUPS.map(g => g.label)].join(','))
    sportAgeData.forEach((row) => {
      csvRows.push([
        `"${String(row.sport)}"`,
        ...AGE_GROUPS.map(g => String(row[g.label] ?? 0)),
      ].join(','))
    })
    csvRows.push('')

    // Age-wise registrations chart
    csvRows.push('Age-wise Registrations')
    csvRows.push('Age Group,Count')
    ageBarData.forEach((r) => {
      csvRows.push(`"${r.label}",${r.count}`)
    })
    csvRows.push('')

    // Jersey size distribution chart
    csvRows.push('Jersey Size Distribution')
    csvRows.push('Jersey Size,Count')
    jerseyBarData.forEach((r) => {
      csvRows.push(`"${r.label}",${r.count}`)
    })
    csvRows.push('')

    // Gender breakdown per sport chart
    csvRows.push('Gender Breakdown per Sport')
    csvRows.push('Sport,Male,Female')
    genderPerSportData.forEach((r) => {
      csvRows.push(`"${r.fullName}",${r.Male},${r.Female}`)
    })
    csvRows.push('')

    // Sport popularity radar chart
    csvRows.push('Sport Popularity Radar')
    csvRows.push('Sport,Count')
    sportRadarData.forEach((r) => {
      csvRows.push(`"${r.fullName}",${r.count}`)
    })
    csvRows.push('')

    // Gender split + Member vs Kid pies
    csvRows.push('Gender Split')
    csvRows.push('Category,Count')
    genderPieData.forEach((r) => {
      csvRows.push(`"${r.name}",${r.value}`)
    })
    csvRows.push('')

    csvRows.push('Member vs Kid Registrations')
    csvRows.push('Category,Count')
    categoryPieData.forEach((r) => {
      csvRows.push(`"${r.name}",${r.value}`)
    })

    downloadCsv(`k26-overview-graphs-${new Date().toISOString().split('T')[0]}.csv`, csvRows)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4 sm:p-6 md:p-8'>
      <div className='max-w-7xl mx-auto'>

        {/* ── Header ── */}
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600'>
              K26 Stats
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>SPARSH KHELOTSAV 2026 — Sport-wise analytics &amp; player lists</p>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={load}
              disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50'
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {(activeTab === 'overview' ? rows.length > 0 : sortedSportPlayers.length > 0) && (
              <button
                onClick={activeTab === 'overview' ? exportOverviewCsv : exportCsv}
                className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700'
              >
                <Download size={16} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className='mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4 text-red-800 dark:text-red-200'>
            {error}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className='mb-6 flex flex-wrap gap-2'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-neutral-700'
            }`}
          >
            📊 Overview
          </button>
          {SPORTS.map(sport => {
            const count = rows.filter(r => r.selected_sports?.includes(sport)).length
            return (
              <button
                key={sport}
                onClick={() => setActiveTab(sport)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeTab === sport
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-emerald-50 dark:hover:bg-neutral-700'
                }`}
              >
                {sport}
                {count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    activeTab === sport ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className='text-center py-20 bg-white dark:bg-neutral-800 rounded-xl shadow'>
            <RefreshCw className='mx-auto h-10 w-10 text-gray-400 animate-spin mb-3' />
            <p className='text-gray-500 dark:text-gray-400'>Loading stats…</p>
          </div>
        ) : activeTab === 'overview' ? (

          /* ══════════════════ OVERVIEW TAB ══════════════════ */
          <div className='space-y-6'>

            {/* Stat cards */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
              <StatCard title='Total Registrations' value={overviewStats.total} color='bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200' icon={<Users size={18} />} />
              <StatCard title='Males' value={overviewStats.males} color='bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200' />
              <StatCard title='Females' value={overviewStats.females} color='bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200' />
              <StatCard title='Members' value={overviewStats.members} color='bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200' />
              <StatCard title='Kids' value={overviewStats.kids} color='bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200' />
              <StatCard title='Most Selected Sport' value={overviewStats.mostSelected ? `${overviewStats.mostSelected.sport} (${overviewStats.mostSelected.count})` : '—'} color='bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' icon={<Trophy size={18} />} />
              <StatCard title='Least Selected Sport' value={overviewStats.leastSelected ? `${overviewStats.leastSelected.sport} (${overviewStats.leastSelected.count})` : '—'} color='bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200' icon={<Trophy size={18} />} />
              <StatCard title='Sports Available' value={SPORTS.length} color='bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200' icon={<Shirt size={18} />} />
            </div>

            {/* Row 1: Sport participation by age group (horizontal stacked bar) */}
            <ChartCard title='🏅 Sport-wise Participation (by Age Group)'>
              {sportAgeData.length === 0 ? (
                <p className='text-sm text-gray-400 text-center py-8'>No data yet</p>
              ) : (
                <ResponsiveContainer width='100%' height={420}>
                  <BarChart
                    layout='vertical'
                    data={sportAgeData}
                    margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis type='number' allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type='category' dataKey='sport' tick={{ fontSize: 11 }} width={105} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const total = payload.reduce((s, p) => s + ((p.value as number) || 0), 0)
                        return (
                          <div className='bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg px-3 py-2 shadow text-sm'>
                            <p className='font-semibold text-gray-800 dark:text-gray-100 mb-1'>{label} <span className='text-gray-400 font-normal'>({total} total)</span></p>
                            {payload.map((p, i) => (p.value as number) > 0 ? (
                              <p key={i} style={{ color: p.fill }} className='font-medium'>{p.name}: <span className='font-bold'>{p.value}</span></p>
                            ) : null)}
                          </div>
                        )
                      }}
                    />
                    <Legend verticalAlign='top' />
                    {AGE_GROUPS.map((g, i) => (
                      <Bar key={g.label} dataKey={g.label} stackId='a' fill={CHART_COLORS[i % CHART_COLORS.length]}
                        radius={i === AGE_GROUPS.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                      >
                        <LabelList
                          dataKey={g.label}
                          position='inside'
                          style={{ fill: '#fff', fontSize: 11, fontWeight: 600 }}
                          formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? String(v) : '')}
                        />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Row 2: Age bar + Jersey bar */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>

              <ChartCard title='🎂 Age-wise Registrations'>
                {ageBarData.length === 0 ? (
                  <p className='text-sm text-gray-400 text-center py-8'>No data yet</p>
                ) : (
                  <ResponsiveContainer width='100%' height={280}>
                    <BarChart data={ageBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis dataKey='label' tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey='count' name='Players' radius={[4, 4, 0, 0]}>
                        {ageBarData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title='👕 Jersey Size Distribution'>
                {jerseyBarData.length === 0 ? (
                  <p className='text-sm text-gray-400 text-center py-8'>No data yet</p>
                ) : (
                  <ResponsiveContainer width='100%' height={280}>
                    <BarChart data={jerseyBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                      <XAxis dataKey='label' tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey='count' name='Players' radius={[4, 4, 0, 0]}>
                        {jerseyBarData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[(i + 4) % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

            </div>

            {/* Row 3: Gender per sport stacked bar */}
            <ChartCard title='⚥ Gender Breakdown per Sport'>
              {genderPerSportData.length === 0 ? (
                <p className='text-sm text-gray-400 text-center py-8'>No data yet</p>
              ) : (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={genderPerSportData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis dataKey='sport' tick={{ fontSize: 11 }} angle={-30} textAnchor='end' interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        const entry = genderPerSportData.find(d => d.sport === label)
                        return (
                          <div className='bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg px-3 py-2 shadow text-sm'>
                            <p className='font-semibold text-gray-800 dark:text-gray-100 mb-1'>{entry?.fullName ?? label}</p>
                            {payload.map((p, i) => (
                              <p key={i} className='text-gray-600 dark:text-gray-300'>{p.name}: <span className='font-bold'>{p.value}</span></p>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Legend verticalAlign='top' />
                    <Bar dataKey='Male' stackId='a' fill='#3b82f6' radius={[0, 0, 0, 0]} />
                    <Bar dataKey='Female' stackId='a' fill='#ec4899' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Row 4: Sport popularity radar + Gender split + Member vs Kid (2 pies side by side) */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

              <ChartCard title='👥 Gender Split'>
                {genderPieData.length === 0 ? (
                  <p className='text-sm text-gray-400 text-center py-8'>No data yet</p>
                ) : (
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={genderPieData}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        label={({ name, value, percent }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      >
                        <Cell fill='#3b82f6' />
                        <Cell fill='#ec4899' />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title='🏷️ Member vs Kid Registrations'>
                {categoryPieData.length === 0 ? (
                  <p className='text-sm text-gray-400 text-center py-8'>No data yet</p>
                ) : (
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        label={({ name, value, percent }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      >
                        <Cell fill='#6366f1' />
                        <Cell fill='#f59e0b' />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

            </div>

          </div>

        ) : (

          /* ══════════════════ SPORT TAB ══════════════════ */
          <div>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100'>
                {activeTab}
                <span className='ml-2 text-sm font-normal text-gray-500 dark:text-gray-400'>
                  — {sortedSportPlayers.length} player{sortedSportPlayers.length !== 1 ? 's' : ''}
                </span>
              </h2>
            </div>

            {sortedSportPlayers.length === 0 ? (
              <div className='text-center py-20 bg-white dark:bg-neutral-800 rounded-xl shadow'>
                <Users className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4' />
                <p className='text-gray-500 dark:text-gray-400'>No players have selected <strong>{activeTab}</strong> yet.</p>
              </div>
            ) : (
              <div className='bg-white dark:bg-neutral-800 rounded-xl shadow overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                    <thead className='bg-gray-50 dark:bg-neutral-900'>
                      <tr>
                        <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-12'>Sr.</th>
                        <SortableHeader label='Player Name' field='name' active={sortField} dir={sortDir} onClick={handleSort} />
                        <SortableHeader label='Mobile Number' field='mobile' active={sortField} dir={sortDir} onClick={handleSort} />
                        <SortableHeader label='Age' field='age' active={sortField} dir={sortDir} onClick={handleSort} />
                        <SortableHeader label='Jersey Size' field='jersey_size' active={sortField} dir={sortDir} onClick={handleSort} />
                        <SortableHeader label='Rating' field='rating' active={sortField} dir={sortDir} onClick={handleSort} />
                        <SortableHeader label='Gender' field='gender' active={sortField} dir={sortDir} onClick={handleSort} />
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                      {sortedSportPlayers.map((r, idx) => {
                        const jerseyLabel = getJerseyLabel(r.jersey_size)
                        return (
                          <tr key={r.id} className='hover:bg-gray-50 dark:hover:bg-neutral-700 odd:bg-gray-50/40 dark:odd:bg-neutral-900/40'>
                            <td className='px-4 py-3 text-sm text-gray-500 dark:text-gray-400'>{idx + 1}</td>
                            <td className='px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100'>{r.name}</td>
                            <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>{r.mobile}</td>
                            <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>{r.age}</td>
                            <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>
                              <span className='inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300'>
                                {jerseyLabel}
                              </span>
                            </td>
                            <td className='px-4 py-3 text-sm text-gray-700 dark:text-gray-300'>
                              {r.rating > 0 ? (
                                <span className='inline-flex items-center gap-0.5'>
                                  {'★'.repeat(r.rating)}{'☆'.repeat(Math.max(0, 5 - r.rating))}
                                  <span className='ml-1 text-xs text-gray-400'>({r.rating})</span>
                                </span>
                              ) : '—'}
                            </td>
                            <td className='px-4 py-3 text-sm'>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                r.gender === 'Male'
                                  ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                                  : 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300'
                              }`}>
                                {r.gender}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
