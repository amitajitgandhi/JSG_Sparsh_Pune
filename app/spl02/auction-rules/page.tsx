'use client'

import { useState } from 'react'
import { BookOpen, Trophy, Users, Shield, ChevronDown, ChevronUp, Star, Target, Clock, AlertCircle, DollarSign, Gavel, Zap } from 'lucide-react'
import Link from 'next/link'

export default function SPL02AuctionRules() {
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

    // Toggle section expansion - collapse all others when expanding one
    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const isCurrentlyExpanded = prev[section]
            if (isCurrentlyExpanded) {
                // If currently expanded, just collapse it
                return {}
            } else {
                // If not expanded, collapse all others and expand this one
                // Use setTimeout to ensure the section expands first, then scroll
                setTimeout(() => {
                    const sectionElement = document.getElementById(`section-${section}`)
                    if (sectionElement) {
                        // Scroll to the section header with some offset
                        const headerOffset = 100 // Adjust this value as needed
                        const elementPosition = sectionElement.getBoundingClientRect().top
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        })
                    }
                }, 100) // Small delay to ensure DOM updates

                return { [section]: true }
            }
        })
    }

    // Auction rules sections data
    const auctionSections = [
        {
            id: 'general',
            title: 'General Auction Rules',
            icon: Gavel,
            color: 'from-blue-500 to-blue-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">1. Virtual Balance</p>
                        <p className="text-gray-700 dark:text-gray-600">Each team starts with a balance of <strong>₹1 Crore</strong>.</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">2. Player Acquisition</p>
                        <p className="text-gray-700 dark:text-gray-600">Teams must purchase <strong>8 players</strong> (<em>except 9 players for Women's category</em>), respecting minimum and maximum limits per category.</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">3. Bidding Process</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Bids start at the player's base price.</li>
                            <li>• Maximum bidding time per player: <strong>2 minutes</strong>.</li>
                            <li>• Only team owners or their representatives can place or raise bids.</li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">4. Balance Management</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• If a team bids more than their available balance, a warning is issued.</li>
                            <li>• Exceeding the balance incurs a <strong>₹1 Lakh penalty</strong>, and the bid is invalid.</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">5. Player Management</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Once purchased, players cannot be swapped or changed.</li>
                            <li>• Bids must be placed using a <strong>baton/bat</strong>; verbal bidding is not allowed.</li>
                            <li>• Bids cannot be canceled once placed.</li>
                        </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">6. Communication Restrictions</p>
                        <p className="text-gray-700 dark:text-gray-600">Use of any communication devices during the auction is <strong>prohibited</strong>.</p>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">7. Owner Category</p>
                        <p className="text-gray-700 dark:text-gray-600">Owners or their blood relatives (if participating) may retain <strong>one player only</strong>.</p>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">8. Bid Increment Rules</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Bids must be in multiples of <strong>₹1 Lakh</strong>.</li>
                            <li>• Each bid must increase by at least <strong>₹1 Lakh</strong>.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'unsold',
            title: 'Unsold Players & Special Situations',
            icon: Target,
            color: 'from-orange-500 to-orange-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">Unsold Players Process</p>
                        <ul className="space-y-2 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Unsold players will be <strong>re-auctioned</strong> at their base price.</li>
                            <li>• If multiple players remain unsold post re-auction, they will be <strong>randomly distributed</strong> using a spin wheel at their respective category base price.</li>
                            <li>• If only one team is left to purchase the last player, the player will be assigned at the <strong>category base price</strong>.</li>
                        </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">All-In Bids</p>
                        <p className="text-gray-700 dark:text-gray-600">If two or more teams go <strong>ALL-IN</strong> for the same player, allocation will be randomly determined using a <strong>spin wheel</strong>.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'mens',
            title: 'Men\'s Division - 11 Teams',
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">Booster System ⚡</p>
                        <p className="mb-2 text-gray-700 dark:text-gray-600">Teams may buy Boosters to gain extra points:</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• <strong>1 Booster = ₹10 Lakh points</strong> for ₹1,000 Rupees.</li>
                            <li>• Maximum <strong>5 Boosters</strong> per team.</li>
                            <li>• Boosters can only be applied before a new player is displayed or after the current player is sold.</li>
                            <li>• They <strong>cannot be used during an ongoing auction</strong>.</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-800 dark:text-blue-700 mb-3">Player Categories:</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-purple-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Icon Players:</strong></span>
                                <span>Base: ₹15 Lacs | Total: 22 Players (2 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Platinum Players:</strong></span>
                                <span>Base: ₹8 Lacs | Total: 44 Players (4 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-yellow-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Gold Players:</strong></span>
                                <span>Base: ₹5 Lacs | Total: 22 Players (2 per team)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'womens',
            title: 'Women\'s Division - 4 Teams',
            icon: Trophy,
            color: 'from-pink-500 to-pink-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-pink-50 p-4 rounded-lg">
                        <h4 className="font-bold text-pink-800 dark:text-pink-700 mb-3">Player Categories:</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-purple-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Icon Players:</strong></span>
                                <span>Base: ₹15 Lacs | Total: 4 Players (1 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Platinum Players:</strong></span>
                                <span>Base: ₹8 Lacs | Total: 8 Players (2 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-yellow-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Gold Players:</strong></span>
                                <span>Base: ₹5 Lacs | Total: 16 Players (4 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Wildcard Players:</strong></span>
                                <span>Base: ₹3 Lacs | Total: 8 Players (2 per team)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'kids',
            title: 'Kids Division - 4 Teams',
            icon: Star,
            color: 'from-green-500 to-green-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-bold text-green-800 dark:text-green-700 mb-3">Player Categories:</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-purple-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Icon Players:</strong></span>
                                <span>Base: ₹15 Lacs | Total: 8 Players (2 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Platinum Players:</strong></span>
                                <span>Base: ₹8 Lacs | Total: 8 Players (2 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-yellow-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Gold Players:</strong></span>
                                <span>Base: ₹5 Lacs | Total: 8 Players (2 per team)</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-100 rounded text-gray-700 dark:text-gray-600">
                                <span><strong>Wildcard Players:</strong></span>
                                <span>Base: ₹3 Lacs | Total: 4 Players (1 per team)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'additional',
            title: 'Additional Notes',
            icon: AlertCircle,
            color: 'from-indigo-500 to-indigo-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">Player Replacements</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Players on the waiting list may replace any team player who backs out.</li>
                            <li>• Replacements will be arranged by the committee.</li>
                            <li>• The committee's decision regarding player replacements is <strong>final</strong>.</li>
                            <li>• Teams are expected to comply with committee decisions.</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">Final Authority</p>
                        <p className="text-gray-700 dark:text-gray-600">All rights are reserved by the <strong>JSG PUNE SPARSH Committee</strong>.</p>
                    </div>
                </div>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">

                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 md:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 mb-3 sm:mb-4 px-2">
                        SPL-02 Auction Rules
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
                        Official auction rules and regulations for Sparsh Premier League Season 2. Please read carefully before participating in the auction.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">19</div>
                            <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">TEAMS</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">156</div>
                            <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">PLAYERS</div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">1 Cr</div>
                            <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">BALANCE</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                        <Link
                            href="/spl02"
                            className="bg-white text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-md text-sm sm:text-base font-medium border border-gray-200"
                        >
                            ← Back to SPL-02
                        </Link>
                    </div>
                </div>

                {/* Instruction text for users */}
                <div className="text-center mb-4 sm:mb-6 px-4">
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
                        👇 Click on any auction section below to expand and read the details 👇
                    </p>
                </div>

                {/* Auction Rules Sections */}
                <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
                    {auctionSections.map((section) => {
                        const isExpanded = expandedSections[section.id]
                        const IconComponent = section.icon

                        // Extract color classes for text based on gradient
                        const getTextColor = (gradientColor: string) => {
                            if (gradientColor.includes('purple')) return 'text-purple-700 dark:text-purple-600'
                            if (gradientColor.includes('yellow')) return 'text-yellow-700 dark:text-yellow-600'
                            if (gradientColor.includes('red')) return 'text-red-700 dark:text-red-600'
                            if (gradientColor.includes('gray')) return 'text-gray-700 dark:text-gray-600'
                            if (gradientColor.includes('green')) return 'text-green-700 dark:text-green-600'
                            if (gradientColor.includes('orange')) return 'text-orange-700 dark:text-orange-600'
                            if (gradientColor.includes('indigo')) return 'text-indigo-700 dark:text-indigo-600'
                            if (gradientColor.includes('pink')) return 'text-pink-700 dark:text-pink-600'
                            return 'text-blue-700 dark:text-blue-600'
                        }

                        const getBackgroundColor = (gradientColor: string) => {
                            if (gradientColor.includes('purple')) return 'bg-purple-50/80'
                            if (gradientColor.includes('yellow')) return 'bg-yellow-50/80'
                            if (gradientColor.includes('red')) return 'bg-red-50/80'
                            if (gradientColor.includes('gray')) return 'bg-gray-50/80'
                            if (gradientColor.includes('green')) return 'bg-green-50/80'
                            if (gradientColor.includes('orange')) return 'bg-orange-50/80'
                            if (gradientColor.includes('indigo')) return 'bg-indigo-50/80'
                            if (gradientColor.includes('pink')) return 'bg-pink-50/80'
                            return 'bg-blue-50/80'
                        }

                        const getHoverColor = (gradientColor: string) => {
                            if (gradientColor.includes('purple')) return 'hover:bg-purple-100/60'
                            if (gradientColor.includes('yellow')) return 'hover:bg-yellow-100/60'
                            if (gradientColor.includes('red')) return 'hover:bg-red-100/60'
                            if (gradientColor.includes('gray')) return 'hover:bg-gray-100/60'
                            if (gradientColor.includes('green')) return 'hover:bg-green-100/60'
                            if (gradientColor.includes('orange')) return 'hover:bg-orange-100/60'
                            if (gradientColor.includes('indigo')) return 'hover:bg-indigo-100/60'
                            if (gradientColor.includes('pink')) return 'hover:bg-pink-100/60'
                            return 'hover:bg-blue-100/60'
                        }

                        const textColor = getTextColor(section.color)
                        const backgroundColor = getBackgroundColor(section.color)
                        const hoverColor = getHoverColor(section.color)

                        return (
                            <div key={section.id} id={`section-${section.id}`} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`w-full ${backgroundColor} backdrop-blur-sm ${textColor} ${hoverColor} p-4 sm:p-5 md:p-6 flex items-center justify-between hover:shadow-md transition-all duration-300 active:scale-95 relative overflow-hidden group border-l-4 ${section.color.includes('purple') ? 'border-l-purple-500' :
                                            section.color.includes('yellow') ? 'border-l-yellow-500' :
                                                section.color.includes('red') ? 'border-l-red-500' :
                                                    section.color.includes('gray') ? 'border-l-gray-500' :
                                                        section.color.includes('green') ? 'border-l-green-500' :
                                                            section.color.includes('orange') ? 'border-l-orange-500' :
                                                                section.color.includes('indigo') ? 'border-l-indigo-500' :
                                                                    section.color.includes('pink') ? 'border-l-pink-500' :
                                                                        'border-l-blue-500'
                                        }`}
                                >
                                    {/* Enhanced gradient background overlay on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

                                    <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent size={20} className="sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight ${textColor}`}>{section.title}</h2>
                                        </div>
                                    </div>
                                    <div className={`flex-shrink-0 relative z-10 ${textColor} p-1 rounded-full group-hover:bg-white/20 transition-colors duration-300`}>
                                        {isExpanded ? <ChevronUp size={20} className="sm:w-6 sm:h-6" /> : <ChevronDown size={20} className="sm:w-6 sm:h-6" />}
                                    </div>
                                </button>

                                {/* Section Content */}
                                {isExpanded && (
                                    <div className="p-4 sm:p-6 md:p-8 bg-white">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Footer Note */}
                <div className="mt-8 sm:mt-12 text-center bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                    <Gavel className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Auction Day Reminder</h3>
                    <p className="text-sm sm:text-base opacity-90 max-w-2xl mx-auto">
                        All team owners and representatives are expected to understand these auction rules thoroughly.
                        The JSG PUNE SPARSH Committee reserves all rights and has final authority on all auction matters.
                    </p>
                </div>
            </div>
        </div>
    )
}