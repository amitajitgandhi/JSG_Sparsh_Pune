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
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    {/* Men's Division */}
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start space-x-3 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-bold text-blue-800 dark:text-blue-700 mb-2">Men's Division - 11 Teams</h4>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-600">
                                    <li>• <strong>League Stage:</strong> 4 league matches per team</li>
                                    <li>• <strong>Super 8 Round:</strong> Top 8 teams qualify for knockout phase</li>
                                    <li>• <strong>Super 8 Top Bracket:</strong> Rank 1 vs Rank 4, Rank 2 vs Rank 3 → Winners advance to Semi-Finals</li>
                                    <li>• <strong>Super 8 Bottom Bracket:</strong> Rank 5 vs Rank 8, Rank 6 vs Rank 7</li>
                                    <li>• <strong>Elimination Match:</strong> Winners of bottom bracket play against losers of top bracket to decide remaining 2 semi-finalists</li>
                                    <li>• <strong>Final Rounds:</strong> Semi-Finals → Final</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Women's Division */}
                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                        <div className="flex items-start space-x-3 mb-3">
                            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-bold text-pink-800 dark:text-pink-700 mb-2">Women's Division - 4 Teams</h4>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-600">
                                    <li>• <strong>League Stage:</strong> 2 league matches per team</li>
                                    <li>• <strong>Qualifier:</strong> Rank 1 vs Rank 2 → Winner becomes Finalist 1</li>
                                    <li>• <strong>Eliminator:</strong> Loser of Qualifier vs Rank 3 → Winner becomes Finalist 2</li>
                                    <li>• <strong>Final:</strong> Finalist 1 vs Finalist 2</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Kids Division */}
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-start space-x-3 mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-700 mb-2">Kids Division - 4 Teams</h4>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-600">
                                    <li>• <strong>League Stage:</strong> 2 league matches per team</li>
                                    <li>• <strong>Qualifier:</strong> Rank 1 vs Rank 2 → Winner becomes Finalist 1</li>
                                    <li>• <strong>Eliminator:</strong> Loser of Qualifier vs Rank 3 → Winner becomes Finalist 2</li>
                                    <li>• <strong>Final:</strong> Finalist 1 vs Finalist 2</li>
                                </ul>
                            </div>
                        </div>
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
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">1. Match Overs</p>
                        <p className="text-gray-700 dark:text-gray-600">Each match will consist of <strong>8 overs per side</strong> (<em>Women's matches: 9 overs per side</em>). Each player must bowl one over.</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">2. Powerplay Over</p>
                        <p className="mb-2 text-gray-700 dark:text-gray-600">Fixed at the 3rd over of each innings.</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Only one fielder is allowed on the boundary; all others must be ahead of the center line.</li>
                            <li>• The <strong>Magic Ball</strong> rule does not apply during the powerplay.</li>
                        </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">3. Magic Ball Rule ⭐</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• The first ball of every over is a <strong>Magic Ball</strong>.</li>
                            <li>• Runs scored on the Magic Ball count <strong>double</strong>.</li>
                            <li>• Wickets lost on the Magic Ball result in a <strong>deduction of 5 runs</strong>.</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">4. Bowler Repeat Rule for Short Players</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• The repeat bowler must belong to the same category as the short player.</li>
                            <li>• For wild category short players, the repeat bowler must be from the last category.</li>
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
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">5. Opening Pair Rule</p>
                        <p className="text-gray-700 dark:text-gray-600">A new opening pair must start the innings in every league match. If an opener is repeated, he/she will be declared <strong>out</strong>, and any runs scored will be <strong>deducted</strong> from the team total. This rule does not apply in knockout matches.</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">6. Byes and Leg Byes</p>
                        <p className="text-gray-700 dark:text-gray-600">All byes and leg byes, including when no shot is offered, are allowed.</p>
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
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">7. Normal Overs</p>
                        <p className="text-gray-700 dark:text-gray-600">Maximum two fielders are allowed on the boundary; all others must remain ahead of the center line.</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">8. Powerplay Over</p>
                        <p className="mb-2 text-gray-700 dark:text-gray-600">Only one fielder is allowed on the boundary; all others must be ahead of the center line.</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Only the front net counts as the boundary.</li>
                            <li>• Catches taken after the ball bounces off a side net are <strong>not out</strong>.</li>
                            <li>• Catches off the ceiling net are <strong>out</strong>.</li>
                        </ul>
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
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">9. Speed Limit Rule</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• 1st speed ball: Dead ball.</li>
                            <li>• 2nd speed ball: No-ball.</li>
                            <li>• Applicable only if the batsman appeals and the umpire agrees.</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">10. Bowling Action Rule</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• Over-arm bowling is not allowed.</li>
                            <li>• 1st over-arm ball: Dead ball.</li>
                            <li>• 2nd over-arm ball: No-ball.</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">11. Bowling Box Rule</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• A box will be marked at the bowling crease.</li>
                            <li>• Touching the side or back line = No-ball.</li>
                            <li>• Crossing the front line = No-ball.</li>
                        </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">12. Side & Keeper Confirmation</p>
                        <ul className="space-y-1 ml-4 text-gray-700 dark:text-gray-600">
                            <li>• The bowler must confirm the bowling side (over/around) and any keeper position change before delivery.</li>
                            <li>• Failure to do so will result in a No-ball.</li>
                            <li>• Every no-ball is followed by a Free Hit.</li>
                            <li>• For stumping or run-out, line touch is considered not out.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'equipment',
            title: 'Equipment & Dress Code',
            icon: Users,
            color: 'from-gray-600 to-gray-700',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">13. Compulsory Gear</p>
                        <p className="text-gray-700 dark:text-gray-600">Team jersey and shoes are mandatory.</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">14. Lower Wear</p>
                        <p className="text-gray-700 dark:text-gray-600">Only track pants are permitted; shorts are not allowed.</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">15. Bat Restriction</p>
                        <p className="text-gray-700 dark:text-gray-600">Fiber bats are not allowed.</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">16. Runner Rule</p>
                        <p className="text-gray-700 dark:text-gray-600">Only one player may act as a runner for the entire match, regardless of injury or other reasons.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'scoring',
            title: 'Scoring & Tie-Breakers',
            icon: Trophy,
            color: 'from-yellow-500 to-yellow-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">17. Scorer Requirement</p>
                        <p className="text-gray-700 dark:text-gray-600">One member from the batting team must sit with the scorer during the innings.</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">18. Score Discrepancies</p>
                        <p className="text-gray-700 dark:text-gray-600">Any scoring disputes must be raised immediately during the innings; post-match complaints will not be accepted.</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">19. Tie-Breaker Rules</p>
                        <div className="space-y-3 text-gray-700 dark:text-gray-600">
                            <div>
                                <p className="font-medium mb-1">League Matches:</p>
                                <ol className="list-decimal list-inside ml-4 space-y-1">
                                    <li>Team with the most sixes.</li>
                                    <li>If still tied, team with the most fours.</li>
                                    <li>If still tied, team with fewer wickets lost.</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Knockout Matches:</p>
                                <p className="ml-4">Decided by a Super Over.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'general',
            title: 'General Rules',
            icon: AlertCircle,
            color: 'from-indigo-500 to-indigo-600',
            content: (
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">20. Umpire's Authority</p>
                        <p className="text-gray-700 dark:text-gray-600">The <strong>Umpire's decision</strong> will be <strong>final and binding</strong> in all circumstances.</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="font-semibold mb-2 text-gray-800 dark:text-gray-700">21. Tournament Committee Rights</p>
                        <p className="text-gray-700 dark:text-gray-600">The <strong>Tournament Committee</strong> reserves the right to revise, amend, or interpret any rule or decision as necessary for the betterment of the tournament.</p>
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