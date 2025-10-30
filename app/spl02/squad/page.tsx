'use client'

import React, { useState, useEffect } from 'react'
import { Users, Phone, Trophy, ExternalLink, ChevronDown, ChevronUp, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Define the squad member interface
interface SquadMember {
  'Player Name': string
  'Mobile Number': number | string
  'Jersey Size'?: string
  'Jersey Number'?: number | string
  'Jersey Name'?: string
  'Cric Heroes Link'?: string
  'Team Name': string
  Age?: number // KIDS squad has age field
}

// Team colors for consistent theming
const teamColors = [
  'from-blue-500 to-blue-600',
  'from-red-500 to-red-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-yellow-500 to-yellow-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
  'from-gray-500 to-gray-600',
  'from-cyan-500 to-cyan-600',
]

// Hardcoded squad counts
const squadCounts = {
  MENS: 88,
  WOMENS: 36,
  KIDS: 28
}

export default function SPL02Squad() {
  const [mensSquad, setMensSquad] = useState<SquadMember[]>([])
  const [womensSquad, setWomensSquad] = useState<SquadMember[]>([])
  const [kidsSquad, setKidsSquad] = useState<SquadMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'MENS' | 'WOMENS' | 'KIDS'>('MENS')
  const [expandedTeams, setExpandedTeams] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    const fetchSquads = async () => {
      try {
        setLoading(true)
        // Fetch static local JSON files from SQUAD folder
        const [mensResponse, womensResponse, kidsResponse] = await Promise.all([
          fetch('/files/SQUAD/MENS.json'),
          fetch('/files/SQUAD/WOMENS.json'), 
          fetch('/files/SQUAD/KIDS.json')
        ])

        if (!mensResponse.ok || !womensResponse.ok || !kidsResponse.ok) {
          throw new Error('Failed to fetch squad data')
        }

        const [mensData, womensData, kidsData] = await Promise.all([
          mensResponse.json(),
          womensResponse.json(),
          kidsResponse.json()
        ])

        setMensSquad(mensData)
        setWomensSquad(womensData)
        setKidsSquad(kidsData)
        setExpandedTeams({})
      } catch (err) {
        setError('Failed to load squad data. Please try again later.')
        console.error('Error fetching squads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSquads()
  }, [])

  // Reset expanded teams when switching tabs
  useEffect(() => {
    setExpandedTeams({})
  }, [activeTab])

  // Group squad members by team
  const groupSquadByTeam = (squad: SquadMember[]) => {
    const grouped: {[key: string]: SquadMember[]} = {}
    squad.forEach(member => {
      const teamName = member['Team Name'] || 'Unassigned'
      if (!grouped[teamName]) {
        grouped[teamName] = []
      }
      grouped[teamName].push(member)
    })
    return grouped
  }

  // Toggle team expansion - collapse all others when expanding one
  const toggleTeam = (teamName: string) => {
    setExpandedTeams(prev => {
      const isCurrentlyExpanded = prev[teamName]
      if (isCurrentlyExpanded) {
        return {}
      } else {
        setTimeout(() => {
          const teamElement = document.getElementById(`team-${teamName.replace(/\s+/g, '-')}`)
          if (teamElement) {
            const headerOffset = 100
            const elementPosition = teamElement.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          }
        }, 100)
        return { [teamName]: true }
      }
    })
  }

  const getCurrentSquad = () => {
    switch (activeTab) {
      case 'MENS': return mensSquad
      case 'WOMENS': return womensSquad
      case 'KIDS': return kidsSquad
      default: return []
    }
  }

  // Get team color based on index
  const getTeamColor = (index: number) => {
    return teamColors[index % teamColors.length]
  }

  // Squad table component
  const SquadTable = ({ members }: { members: SquadMember[] }) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Player Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mobile Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Jersey Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Jersey Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Jersey Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                CricHeroes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {members.map((member, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {member['Player Name']}
                  </div>
                  {member.Age && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Age: {member.Age} years
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <a 
                    href={`tel:${member['Mobile Number']}`}
                    className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center space-x-1"
                  >
                    <Phone size={14} className="text-gray-500 dark:text-gray-400" />
                    <span>{member['Mobile Number']}</span>
                  </a>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {member['Jersey Name'] || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {member['Jersey Number'] || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {member['Jersey Size'] || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  {member['Cric Heroes Link'] ? (
                    <a
                      href={member['Cric Heroes Link']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded-md transition-colors text-xs"
                    >
                      <span>View Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading squad data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <Trophy size={48} className="mx-auto" />
          </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Squad</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Try Again</button>
        </div>
      </div>
    )
  }

  const currentSquad = getCurrentSquad()
  const groupedSquad = groupSquadByTeam(currentSquad)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 mb-3 sm:mb-4 px-2">SPL-02 Team Squads</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">Explore the complete team squads for Sparsh Premier League Season 2.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">11</div>
              <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">MENS Teams</div>
              <div className="text-sm sm:text-lg md:text-xl font-bold">88 Players</div>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">4</div>
              <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">WOMENS Teams</div>
              <div className="text-sm sm:text-lg md:text-xl font-bold">36 Players</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">4</div>
              <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">KIDS Teams</div>
              <div className="text-sm sm:text-lg md:text-xl font-bold">28 Players</div>
            </div>
          </div>
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <Link 
              href="/spl02" 
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-md text-sm sm:text-base font-medium flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to SPL-02</span>
            </Link>
          </div>
        </div>
        <div className="text-center mb-4 sm:mb-6 px-4">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium">Click on any tournament category below to check out team squads</p>
        </div>
        <div className="flex justify-center mb-6 sm:mb-8 px-2">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-xl border border-gray-200 w-full max-w-md sm:max-w-none">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {(['MENS', 'WOMENS', 'KIDS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 relative overflow-hidden flex-1 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">{tab}</span>
                  {activeTab === tab && <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
          {Object.entries(groupedSquad).map(([teamName, members], index) => {
            const isExpanded = expandedTeams[teamName]
            const teamColor = getTeamColor(index)
            const getTextColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'text-purple-700'
              if (gradientColor.includes('yellow')) return 'text-yellow-700'
              if (gradientColor.includes('red')) return 'text-red-700'
              if (gradientColor.includes('gray')) return 'text-gray-700'
              if (gradientColor.includes('green')) return 'text-green-700'
              if (gradientColor.includes('orange')) return 'text-orange-700'
              if (gradientColor.includes('pink')) return 'text-pink-700'
              if (gradientColor.includes('indigo')) return 'text-indigo-700'
              if (gradientColor.includes('teal')) return 'text-teal-700'
              if (gradientColor.includes('cyan')) return 'text-cyan-700'
              return 'text-blue-700'
            }
            const getBackgroundColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'bg-purple-50/80'
              if (gradientColor.includes('yellow')) return 'bg-yellow-50/80'
              if (gradientColor.includes('red')) return 'bg-red-50/80'
              if (gradientColor.includes('gray')) return 'bg-gray-50/80'
              if (gradientColor.includes('green')) return 'bg-green-50/80'
              if (gradientColor.includes('orange')) return 'bg-orange-50/80'
              if (gradientColor.includes('pink')) return 'bg-pink-50/80'
              if (gradientColor.includes('indigo')) return 'bg-indigo-50/80'
              if (gradientColor.includes('teal')) return 'bg-teal-50/80'
              if (gradientColor.includes('cyan')) return 'bg-cyan-50/80'
              return 'bg-blue-50/80'
            }
            const getHoverColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'hover:bg-purple-100/60'
              if (gradientColor.includes('yellow')) return 'hover:bg-yellow-100/60'
              if (gradientColor.includes('red')) return 'hover:bg-red-100/60'
              if (gradientColor.includes('gray')) return 'hover:bg-gray-100/60'
              if (gradientColor.includes('green')) return 'hover:bg-green-100/60'
              if (gradientColor.includes('orange')) return 'hover:bg-orange-100/60'
              if (gradientColor.includes('pink')) return 'hover:bg-pink-100/60'
              if (gradientColor.includes('indigo')) return 'hover:bg-indigo-100/60'
              if (gradientColor.includes('teal')) return 'hover:bg-teal-100/60'
              if (gradientColor.includes('cyan')) return 'hover:bg-cyan-100/60'
              return 'hover:bg-blue-100/60'
            }
            const getBorderColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'border-l-purple-500'
              if (gradientColor.includes('yellow')) return 'border-l-yellow-500'
              if (gradientColor.includes('red')) return 'border-l-red-500'
              if (gradientColor.includes('gray')) return 'border-l-gray-500'
              if (gradientColor.includes('green')) return 'border-l-green-500'
              if (gradientColor.includes('orange')) return 'border-l-orange-500'
              if (gradientColor.includes('pink')) return 'border-l-pink-500'
              if (gradientColor.includes('indigo')) return 'border-l-indigo-500'
              if (gradientColor.includes('teal')) return 'border-l-teal-500'
              if (gradientColor.includes('cyan')) return 'border-l-cyan-500'
              return 'border-l-blue-500'
            }
            
            const textColor = getTextColor(teamColor)
            const backgroundColor = getBackgroundColor(teamColor)
            const hoverColor = getHoverColor(teamColor)
            const borderColor = getBorderColor(teamColor)
            
            return (
              <div key={teamName} id={`team-${teamName.replace(/\s+/g, '-')}`} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <button
                  onClick={() => toggleTeam(teamName)}
                  className={`w-full ${backgroundColor} backdrop-blur-sm ${textColor} ${hoverColor} p-4 sm:p-5 md:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 active:scale-95 relative overflow-hidden group border-l-4 ${borderColor}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${teamColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${teamColor} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Users size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-left">
                      <h2 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight ${textColor}`}>{teamName}</h2>
                      <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>{members.length} players</p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 relative z-10 ${textColor} p-1 rounded-full group-hover:bg-white/20 transition-colors duration-300`}>
                    {isExpanded ? <ChevronUp size={20} className="sm:w-6 sm:h-6" /> : <ChevronDown size={20} className="sm:w-6 sm:h-6" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-3 sm:p-4 md:p-6">
                    <SquadTable members={members} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}