'use client'

import { useState } from 'react'
import { BookOpen, Trophy, Users, Shield, ChevronDown, ChevronUp, Star, Target, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SPL02TournamentRules() {
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

    // Rules sections data
    const rulesSections = [
        {
            id: 'overview',
            title: 'Tournament Overview',
            icon: Trophy,
            color: 'from-blue-500 to-blue-600',
            content: (
                <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    {/* Men's Division */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">Men’s Division – 11 Teams</h4>
                        <ul className="space-y-2">
                            <li>• <strong>League Stage:</strong> 4 matches per team</li>
                            <li>• <strong>Super 8 Qualification:</strong> Top 8 teams advance</li>
                            <li className="mt-2 font-semibold">Super 8 Structure:</li>
                            <li className="ml-4">Top Bracket: TB1 (Rank 1 vs Rank 4) & TB2 (Rank 2 vs Rank 3) → Winners become SF1 & SF2</li>
                            <li className="ml-4">Bottom Bracket: BB1 (Rank 5 vs Rank 8) & BB2 (Rank 6 vs Rank 7)</li>
                            <li className="ml-4">Elimination: TB1 Loser vs BB2 Winner → SF3</li>
                            <li className="ml-4">Elimination: TB2 Loser vs BB1 Winner → SF4</li>
                            <li className="mt-2">• <strong>Semi Finals:</strong> SF1 vs SF4 and SF2 vs SF3</li>
                            <li>• <strong>Final:</strong> Winners of Semi Finals</li>
                        </ul>
                    </div>
                    {/* Women's Division */}
                    <div className="bg-pink-50 dark:bg-pink-950/30 p-4 rounded-lg border-l-4 border-pink-500">
                        <h4 className="font-bold text-pink-800 dark:text-pink-400 mb-2">Women’s Division – 4 Teams</h4>
                        <ul className="space-y-2">
                            <li>• <strong>League Stage:</strong> 3 matches per team</li>
                            <li>• <strong>Semi Final:</strong> Rank 2 vs Rank 3 (Winner becomes F2)</li>
                            <li>• <strong>Final:</strong> Rank 1 (F1) vs F2</li>
                        </ul>
                    </div>
                    {/* Kids Division */}
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-bold text-green-800 dark:text-green-400 mb-2">Kids Division – 4 Teams</h4>
                        <p className="mb-2">Same structure as Women’s Division.</p>
                        <ul className="space-y-2">
                            <li>• League: 3 matches per team</li>
                            <li>• Semi Final: Rank 2 vs Rank 3</li>
                            <li>• Final: Rank 1 vs Semi Final Winner</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'format',
            title: 'Match Format',
            icon: Clock,
            color: 'from-purple-500 to-purple-600',
            content: (
                <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Match Overs</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Men’s: 8 overs per side</li>
                            <li>• Women’s: 9 overs per side</li>
                            <li>• Kids: 7 overs per side</li>
                        </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Powerplay Over</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Fixed at the 3rd over of each innings</li>
                            <li>• Only one boundary fielder allowed; others ahead of center line</li>
                            <li>• Magic Ball rule does not apply during powerplay</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Magic Ball Rule ⭐</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• First ball of every over is a Magic Ball</li>
                            <li>• All runs (including extras) count double</li>
                            <li>• Wicket on Magic Ball (including run-out on 2nd run or wide) deducts 5 runs</li>
                            <li>• Example: Wide + run-out on legal ball after = 2 − 5 = -3</li>
                            <li>• Strike rotation based on normal runs (not doubled)</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Run Scoring</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• <strong>Front Net Boundary:</strong> Only front net counts as boundary</li>
                            <li>• <strong>Side Net:</strong> Catches off side nets are NOT OUT</li>
                            <li>• <strong>Ceiling Net:</strong> Catches off ceiling are OUT</li>
                            <li>• <strong>Ball Leaving Turf/Dugout:</strong> Declared 1 run; strike changes</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'batting',
            title: 'Batting Restrictions',
            icon: Target,
            color: 'from-green-500 to-green-600',
            content: (
                <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-semibold mb-2">Opening Pair Rule</h4>
                        <p>A new opening pair must start every league match. If a repeated opener is notified during innings: player is out & runs scored by them deducted. Not applicable in knockouts.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Byes & Leg Byes</h4>
                        <p>All byes and leg byes allowed even when no shot is offered.</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Runner Rules</h4>
                        <p>Only one runner allowed per innings; the batsman taking runner must bat last in order.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Retired Hurt</h4>
                        <p>Generally not allowed. Forced retirement against rules counts as Retired Out; ball counts as one legal delivery.</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Hit Wicket</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Dislodging stumps with bat/body/clothing before ball is dead = out</li>
                            <li>• Boundary/six + wicket broken before ball dead = hit wicket (out)</li>
                            <li>• If on Magic Ball: additional -5 runs</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'fielding',
            title: 'Fielding Restrictions',
            icon: Shield,
            color: 'from-orange-500 to-orange-600',
            content: (
                <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Normal Overs</h4>
                        <p>Max 2 boundary fielders; others ahead of center line.</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Powerplay Over (3rd)</h4>
                        <p>Max 1 boundary fielder; others ahead of center line.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'bowling',
            title: 'Bowling & Action Rules',
            icon: Star,
            color: 'from-red-500 to-red-600',
            content: (
                <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">One Over Per Player</h4>
                        <p>Every player bowls exactly 1 over (no repeat overs) except in short-player scenarios as defined.</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Speed & Hand Rotation Rule</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• 1st instance speed/hand rotation: If dot or wicket → Dead ball + Warning; if runs → Warning only</li>
                            <li>• Further instances in same innings → No-ball</li>
                        </ul>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Dead Ball Rule (Kids & Women)</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Two consecutive dead balls → counts as one valid ball + 2 runs</li>
                            <li>• Applies: First 6 overs (Women) & First 5 overs (Kids)</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Bowling Box Rule</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Touch side/back border = No-ball</li>
                            <li>• Fully cross front line = No-ball</li>
                        </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Side & Keeper Confirmation (Men)</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Bowler must confirm bowling side before over / change</li>
                            <li>• Keeper position changes must be confirmed</li>
                            <li>• Failure = No-ball</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">No-Ball Consequences</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Every no-ball followed by Free Hit</li>
                            <li>• On Free Hit: only Run Out dismissals apply</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'misc',
            title: 'Equipment, Scoring & Conduct',
            icon: Users,
            color: 'from-gray-600 to-gray-700',
            content: (
                <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Equipment & Dress Code</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Mandatory: Team jersey, shoes, full-length track pants</li>
                            <li>• Shorts not allowed</li>
                            <li>• Fiber bats not allowed</li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Scoring & Tiebreakers</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• One batting team member must sit with scorer</li>
                            <li>• Disputes must be raised immediately – post-match complaints invalid</li>
                            <li className="mt-2 font-medium">Tiebreakers (League):</li>
                            <li className="ml-4">1. Most sixes</li>
                            <li className="ml-4">2. If tied → Most fours</li>
                            <li className="ml-4">3. If tied → Fewer wickets lost</li>
                            <li className="mt-2">Knockouts: Super Over</li>
                        </ul>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Player Availability (Team Short)</h4>
                        <ul className="space-y-1 ml-2">
                            <li>• Team plays short if player absent</li>
                            <li>• Last man batting allowed with dead runner</li>
                            <li>• Repeat bowler from same category of missing player</li>
                            <li>• Wild category short → repeat from last category</li>
                            <li>• No substitute fielders</li>
                            <li>• Late-arriving players after start cannot join</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border-l-4 border-red-500">
                        <h4 className="font-semibold mb-2">Umpire’s Authority</h4>
                        <p>Umpire’s decision is final. Arguments: Warning → Match Ban.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="font-semibold mb-2">Committee Rights</h4>
                        <p>Tournament Committee may revise / amend / interpret rules for fair conduct.</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">ICC Standard Rules</h4>
                        <p>All ICC rules apply where not specifically overridden here.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Spirit of the Game</h4>
                        <p>All players must uphold respect for officials and the spirit of cricket at all times.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'general',
            title: 'Important Note',
            icon: AlertCircle,
            color: 'from-indigo-500 to-indigo-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border-l-4 border-indigo-500">
                        <p className="font-semibold mb-2">Read & Acknowledge</p>
                        <p>All teams are expected to read and understand these rules. Ignorance of rules will not be accepted as an excuse in any dispute.</p>
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
                        SPL-02 Tournament Rules
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
                        Official rules and regulations for Sparsh Premier League Season 2. Please read carefully before participating.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">8</div>
                            <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">Overs Per Side</div>
                            <div className="text-sm sm:text-base opacity-80">(9 for Women)</div>
                        </div>
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">⭐</div>
                            <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">Magic Ball</div>
                            <div className="text-sm sm:text-base opacity-80">Double Runs</div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">3rd</div>
                            <div className="text-xs sm:text-sm md:text-base opacity-90 font-medium">Powerplay Over</div>
                            <div className="text-sm sm:text-base opacity-80">Fixed Position</div>
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
                        👇 Click on any rule section below to expand and read the details 👇
                    </p>
                </div>

                {/* Rules Sections */}
                <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
                    {rulesSections.map((section) => {
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
                <div className="mt-8 sm:mt-12 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                    <BookOpen className="w-8 h-8 mx-auto mb-3" />
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Important Note</h3>
                    <p className="text-sm sm:text-base opacity-90 max-w-2xl mx-auto">
                        All participants are expected to read and understand these rules thoroughly.
                        The Tournament Committee reserves the right to make final decisions on any disputes or clarifications.
                    </p>
                </div>
            </div>
        </div>
    )
}