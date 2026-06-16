'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

interface Player {
  name: string
  mobile: string
  gender: string
  category: string
  selectedSports: string[]
  sportRatings: Record<string, number>
  teamName: string
  teamMain: string
  teamOwner: string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Player[] {
  const lines = text.split('\n').filter(l => l.trim())
  const players: Player[] = []
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i])
    if (fields.length < 7) continue
    const [name, mobile, gender, category, , sportRatingsRaw, teamName] = fields
    let sportRatings: Record<string, number> = {}
    try { sportRatings = JSON.parse(sportRatingsRaw) } catch {}
    const bracketIdx = teamName.indexOf('(')
    const teamMain = bracketIdx > -1 ? teamName.slice(0, bracketIdx).trim() : teamName.trim()
    const teamOwner = bracketIdx > -1 ? teamName.slice(bracketIdx + 1).replace(/\)\s*$/, '').trim() : ''
    players.push({
      name: name.trim(),
      mobile: mobile.trim(),
      gender: gender.trim(),
      category: category.trim(),
      selectedSports: Object.keys(sportRatings),
      sportRatings,
      teamName: teamName.trim(),
      teamMain,
      teamOwner,
    })
  }
  return players
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function exportCSV(players: Player[], teamFilter: string, sportFilter: string) {
  const allSports = Array.from(new Set(players.flatMap(p => Object.keys(p.sportRatings)))).sort()
  const headers = ['Name', 'Mobile', 'Gender', 'Category', 'Team', 'Owner', ...allSports]
  const rows = players.map(p => [
    p.name, p.mobile, p.gender, p.category, p.teamMain, p.teamOwner,
    ...allSports.map(s => p.sportRatings[s] ?? ''),
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const suffix = teamFilter !== 'All' ? `-${players[0]?.teamMain ?? 'team'}` : ''
  const sportSuffix = sportFilter !== 'All' ? `-${sportFilter}` : ''
  a.href = url
  a.download = `khelotsav-2026-players${suffix}${sportSuffix}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ratingColor(r: number) {
  if (r <= 1) return '#E24B4A'
  if (r === 2) return '#EF9F27'
  if (r === 3) return '#BA7517'
  if (r === 4) return '#378ADD'
  return '#639922'
}

const ALL = 'All'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teamFilter, setTeamFilter] = useState(ALL)
  const [sportFilter, setSportFilter] = useState(ALL)

  useEffect(() => {
    fetch('/files/k26.csv')
      .then(r => { if (!r.ok) throw new Error('CSV not found'); return r.text() })
      .then(text => { setPlayers(parseCSV(text)); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const teams = useMemo(() => [ALL, ...Array.from(new Set(players.map(p => p.teamName)))], [players])
  const sports = useMemo(() => {
    const s = new Set<string>()
    players.forEach(p => Object.keys(p.sportRatings).forEach(sp => s.add(sp)))
    return [ALL, ...Array.from(s).sort()]
  }, [players])

  const filtered = useMemo(() => {
    return players.filter(p => {
      const teamOk = teamFilter === ALL || p.teamName === teamFilter
      const sportOk = sportFilter === ALL || p.sportRatings[sportFilter] !== undefined
      return teamOk && sportOk
    })
  }, [players, teamFilter, sportFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, Player[]>()
    filtered.forEach(p => {
      if (!map.has(p.teamName)) map.set(p.teamName, [])
      map.get(p.teamName)!.push(p)
    })
    return map
  }, [filtered])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading players…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  )

  const totalFiltered = filtered.length
  const teamCount = teams.length - 1
  const avgPerTeam = teamCount > 0 ? Math.round(players.length / teamCount) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-emerald-500 to-orange-500 mb-3 px-2">
            SPARSH KHELOTSAV 2026
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6 px-4">
            Meet the participants competing team-wise at the indoor sports festival.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto px-2 mb-6">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold">{teamCount}</div>
              <div className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">Teams</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold">{players.length}</div>
              <div className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">Total Players</div>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold">{avgPerTeam}</div>
              <div className="text-xs sm:text-sm opacity-90 font-medium mt-0.5">Avg per Team</div>
            </div>
          </div>

          {/* Back link */}
        <div className="flex flex-wrap justify-center gap-3">
  <Link
    href="/events/khelotsav"
    className="bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-lg hover:bg-sky-50 transition shadow-sm text-sm font-semibold"
  >
    ← Back
  </Link>

  <button
    onClick={() => exportCSV(filtered, teamFilter, sportFilter)}
    disabled={filtered.length === 0}
    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 transition shadow-sm"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    Export
  </button>
</div>
        </div>

        {/* Sticky filter + export bar */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md px-3 py-3 mb-6 sticky top-4 z-10">
          <div className="flex items-center gap-2">
            <select
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
              className="flex-1 text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:border-sky-500"
            >
              <option value={ALL}>All teams</option>
              {teams.filter(t => t !== ALL).map(t => (
                <option key={t} value={t}>
                  {players.find(p => p.teamName === t)?.teamMain ?? t}
                </option>
              ))}
            </select>
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="flex-1 text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:border-emerald-500"
            >
              <option value={ALL}>All sports</option>
              {sports.filter(s => s !== ALL).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {(teamFilter !== ALL || sportFilter !== ALL) && (
            <p className="text-[11px] text-gray-400 mt-1.5 px-0.5">
              Showing {totalFiltered} player{totalFiltered !== 1 ? 's' : ''}
              {teamFilter !== ALL && ` · ${players.find(p => p.teamName === teamFilter)?.teamMain}`}
              {sportFilter !== ALL && ` · ${sportFilter}`}
            </p>
          )}
        </div>


        {/* Content */}
        <div className="space-y-6">
        {grouped.size === 0 && (
          <p className="text-center text-sm text-gray-400 py-12">No players match the selected filters.</p>
        )}

        {Array.from(grouped.entries()).map(([teamName, teamPlayers]) => {
          const first = teamPlayers[0]
          const females = teamPlayers.filter(p => p.gender === 'Female').length
          const males = teamPlayers.length - females

          return (
            <div key={teamName}>
              {/* Team header */}
              <div className="flex items-center gap-3 mb-3 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-700 text-base">🏆</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{first.teamMain}</p>
                  {first.teamOwner && (
                    <p className="text-[11px] text-gray-500">{first.teamOwner}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {teamPlayers.length} players &middot; {females}F &middot; {males}M
                  </p>
                </div>
              </div>

              {/* Player cards */}
              <div className="space-y-3">
                {teamPlayers.map((player, idx) => {
                  const isFemale = player.gender === 'Female'
                  // Sort sports by rating descending for display
                  const sortedSports = Object.entries(player.sportRatings).sort((a, b) => b[1] - a[1])

                  return (
                    <div
                      key={`${player.name}-${idx}`}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      {/* Player top row */}
                      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: isFemale ? '#FBEAF0' : '#E6F1FB',
                            color: isFemale ? '#993556' : '#185FA5',
                          }}
                        >
                          {initials(player.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 leading-tight">{player.name}</span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                background: isFemale ? '#FBEAF0' : '#E6F1FB',
                                color: isFemale ? '#993556' : '#185FA5',
                              }}
                            >
                              {player.gender === 'Female' ? 'F' : 'M'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {player.mobile} &middot; {player.category}
                          </p>
                        </div>
                      </div>

                      {/* Sport ratings */}
                      <div className="px-4 pb-3 space-y-1.5">
                        {sortedSports.map(([sport, rating]) => (
                          <div key={sport} className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-500 w-28 flex-shrink-0 truncate">{sport}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div
                                  key={n}
                                  className="w-4 h-3 rounded-sm"
                                  style={{
                                    background: n <= rating ? ratingColor(rating) : '#F1EFE8',
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-gray-400">{rating}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        </div>

      </div>
    </div>
  )
}
