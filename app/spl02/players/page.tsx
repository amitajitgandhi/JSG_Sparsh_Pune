'use client'

import { useState, useEffect } from 'react'
import { Users, Phone, Trophy, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Define the player interface
interface Player {
  'Full Name': string
  'Mobile Number': number | string
  'Jersey Size': string
  'Jersey Number': number | string
  'Jersey Name': string
  'Cric Heroes Link': string
  'Photo URL': string
  CATEGORY?: string
  'Sr. No.'?: number
  'Sr No'?: number
  Age?: number
  Skillset?: string
  'Bowling Arm'?: string
}

// Category colors for consistent theming
const categoryColors = {
  Icon: 'from-purple-500 to-purple-600',
  Gold: 'from-yellow-500 to-yellow-600', 
  Platinum: 'from-red-500 to-red-600',
  Silver: 'from-gray-700 to-gray-600',
  Wildcard: 'from-green-500 to-green-600',
  waiting: 'from-red-500 to-red-600',
  'Waiting Gold': 'from-orange-500 to-orange-600'
}

// Hardcoded player counts (excluding waiting category)
const playerCounts = {
  MENS: 88,
  WOMENS: 36,
  KIDS: 28
}

export default function SPL02Players() {
  const [mensPlayers, setMensPlayers] = useState<Player[]>([])
  const [womensPlayers, setWomensPlayers] = useState<Player[]>([])
  const [kidsPlayers, setKidsPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'MENS' | 'WOMENS' | 'KIDS'>('MENS')
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        
        // Fetch all three JSON files
        const [mensResponse, womensResponse, kidsResponse] = await Promise.all([
          fetch('/files/MENS.json'),
          fetch('/files/WOMENS.json'), 
          fetch('/files/KIDS.json')
        ])

        if (!mensResponse.ok || !womensResponse.ok || !kidsResponse.ok) {
          throw new Error('Failed to fetch player data')
        }

        const [mensData, womensData, kidsData] = await Promise.all([
          mensResponse.json(),
          womensResponse.json(),
          kidsResponse.json()
        ])

        setMensPlayers(mensData)
        setWomensPlayers(womensData)
        setKidsPlayers(kidsData)
        
        // Initialize all categories as collapsed by default
        setExpandedCategories({})
        
      } catch (err) {
        setError('Failed to load player data. Please try again later.')
        console.error('Error fetching players:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Reset expanded categories when switching tabs
  useEffect(() => {
    setExpandedCategories({})
  }, [activeTab])

  // Group players by category
  const groupPlayersByCategory = (players: Player[]) => {
    const grouped: {[key: string]: Player[]} = {}
    players.forEach(player => {
      const category = player.CATEGORY || 'Uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(player)
    })
    return grouped
  }

  // Toggle category expansion - collapse all others when expanding one
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const isCurrentlyExpanded = prev[category]
      if (isCurrentlyExpanded) {
        // If currently expanded, just collapse it
        return {}
      } else {
        // If not expanded, collapse all others and expand this one
        return { [category]: true }
      }
    })
  }

  // Get current players based on active tab
  const getCurrentPlayers = () => {
    switch (activeTab) {
      case 'MENS':
        return mensPlayers
      case 'WOMENS':
        return womensPlayers
      case 'KIDS':  
        return kidsPlayers
      default:
        return []
    }
  }

  // Player card component - Mobile Enhanced
  const PlayerCard = ({ player }: { player: Player }) => {
    const categoryColor = categoryColors[player.CATEGORY as keyof typeof categoryColors] || 'from-blue-500 to-blue-600'
    
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105 active:scale-95">
        {/* Player Photo */}
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {player['Photo URL'] ? (
            <img
              src={player['Photo URL']}
              alt={player['Full Name']}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling!.classList.remove('hidden')
              }}
            />
          ) : null}
          
          {/* Fallback placeholder */}
          <div className={`${player['Photo URL'] ? 'hidden' : ''} w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300`}>
            <Users size={32} className="sm:w-12 sm:h-12 text-gray-500" />
          </div>
          
          {/* Category Badge */}
          {player.CATEGORY && (
            <div className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 bg-gradient-to-r ${categoryColor} text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold`}>
              {player.CATEGORY}
            </div>
          )}
        </div>

        {/* Player Info - Mobile Optimized */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 mb-1 leading-tight line-clamp-2">
              {player['Full Name']}
            </h3>
          </div>

          {/* Details Grid - Mobile Responsive */}
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            {player.Age && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Age:</span>
                <span className="font-semibold">{player.Age} years</span>
              </div>
            )}
            
            {player.Skillset && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600 flex-shrink-0">Skillset:</span>
                <span className="font-semibold text-right ml-2 line-clamp-2">{player.Skillset}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mobile:</span>
              <a 
                href={`tel:${player['Mobile Number']}`}
                className="font-semibold hover:text-blue-600 transition-colors flex items-center space-x-1 active:scale-95"
              >
                <Phone size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm">{player['Mobile Number']}</span>
              </a>
            </div>
          </div>

          {/* CricHeroes Link - Mobile Optimized */}
          {player['Cric Heroes Link'] && (
            <a
              href={player['Cric Heroes Link']}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-xs sm:text-sm font-medium active:scale-95"
            >
              <span>CricHeroes</span>
              <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
            </a>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading player data...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Players</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const currentPlayers = getCurrentPlayers()
  const groupedPlayers = groupPlayersByCategory(currentPlayers)
  const totalPlayers = playerCounts[activeTab] // Use hardcoded count

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 mb-3 sm:mb-4 px-2">
            SPL-02 Player List
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
            Meet the talented players competing in Sparsh Premier League Season 2.
          </p>

          {/* Team and Player Statistics - Enhanced Mobile */}
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

        {/* Enhanced Tab Navigation - Mobile Optimized */}
        <div className="flex justify-center mb-6 sm:mb-8 px-2">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-xl border border-gray-200 w-full max-w-md sm:max-w-none">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {(['MENS', 'WOMENS', 'KIDS'] as const).map((tab) => {
                return (
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
                    {activeTab === tab && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Players by Category - Mobile Enhanced */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
          {Object.entries(groupedPlayers).map(([category, players]) => {
            const isExpanded = expandedCategories[category]
            const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'from-blue-500 to-blue-600'
            
            // Extract color classes for text based on gradient
            const getTextColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'text-purple-700'
              if (gradientColor.includes('yellow')) return 'text-yellow-700'
              if (gradientColor.includes('red')) return 'text-red-700'
              if (gradientColor.includes('gray')) return 'text-gray-700'
              if (gradientColor.includes('green')) return 'text-green-700'
              if (gradientColor.includes('orange')) return 'text-orange-700'
              return 'text-blue-700'
            }

            const getBackgroundColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'bg-purple-50/80'
              if (gradientColor.includes('yellow')) return 'bg-yellow-50/80'
              if (gradientColor.includes('red')) return 'bg-red-50/80'
              if (gradientColor.includes('gray')) return 'bg-gray-50/80'
              if (gradientColor.includes('green')) return 'bg-green-50/80'
              if (gradientColor.includes('orange')) return 'bg-orange-50/80'
              return 'bg-blue-50/80'
            }

            const getHoverColor = (gradientColor: string) => {
              if (gradientColor.includes('purple')) return 'hover:bg-purple-100/60'
              if (gradientColor.includes('yellow')) return 'hover:bg-yellow-100/60'
              if (gradientColor.includes('red')) return 'hover:bg-red-100/60'
              if (gradientColor.includes('gray')) return 'hover:bg-gray-100/60'
              if (gradientColor.includes('green')) return 'hover:bg-green-100/60'
              if (gradientColor.includes('orange')) return 'hover:bg-orange-100/60'
              return 'hover:bg-blue-100/60'
            }

            const textColor = getTextColor(categoryColor)
            const backgroundColor = getBackgroundColor(categoryColor)
            const hoverColor = getHoverColor(categoryColor)
            
            return (
              <div key={category} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Category Header - Improved Design */}
                <button
                  onClick={() => toggleCategory(category)}
                  className={`w-full ${backgroundColor} backdrop-blur-sm ${textColor} ${hoverColor} p-4 sm:p-5 md:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 active:scale-95 relative overflow-hidden group border-l-4 ${
                    categoryColor.includes('purple') ? 'border-l-purple-500' :
                    categoryColor.includes('yellow') ? 'border-l-yellow-500' :
                    categoryColor.includes('red') ? 'border-l-red-500' :
                    categoryColor.includes('gray') ? 'border-l-gray-500' :
                    categoryColor.includes('green') ? 'border-l-green-500' :
                    categoryColor.includes('orange') ? 'border-l-orange-500' :
                    'border-l-blue-500'
                  }`}
                >
                  {/* Enhanced gradient background overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${categoryColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  
                  <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColor} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Trophy size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-left">
                      <h2 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight ${textColor}`}>{category}</h2>
                      <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>{players.length} players</p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 relative z-10 ${textColor} p-1 rounded-full group-hover:bg-white/20 transition-colors duration-300`}>
                    {isExpanded ? <ChevronUp size={20} className="sm:w-6 sm:h-6" /> : <ChevronDown size={20} className="sm:w-6 sm:h-6" />}
                  </div>
                </button>

                {/* Players Grid - Mobile Responsive */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {players.map((player, index) => (
                        <PlayerCard key={`${category}-${index}`} player={player} />
                      ))}
                    </div>
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