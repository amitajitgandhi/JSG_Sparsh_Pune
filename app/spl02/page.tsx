'use client'

import { Calendar, MapPin, Clock, Users, Trophy, Star, Target, Award, Phone, Mail, Zap, Heart, Gift } from 'lucide-react'

export default function SPL02() {
    const tournamentInfo = {
        title: "SPARSH PREMIER LEAGUE",
        season: "Season 2",
        subtitle: "The Most Awaited Box Cricket Tournament",
        dates: "15 & 16 November 2025",
        venue: "Cricket Grounds, Pune",
        totalTeams: 20,
        registeredTeams: 8,
        prizePool: "₹1,00,000"
    }

    const teamCategories = [
        {
            category: "Men's Teams",
            count: 12,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            description: "Elite male cricket teams competing for the championship"
        },
        {
            category: "Women's Teams",
            count: 4,
            icon: Heart,
            color: "from-pink-500 to-pink-600",
            description: "Talented female cricketers showcasing their skills"
        },
        {
            category: "Kids Teams",
            count: 4,
            icon: Star,
            color: "from-green-500 to-green-600",
            description: "Young cricket enthusiasts building the future of the sport"
        }
    ]

    const sponsorshipBenefits = [
        {
            title: "High Visibility",
            description: "Branding across the venue, social media, and live coverage",
            icon: Target
        },
        {
            title: "Direct Engagement",
            description: "Reach an enthusiastic Jain community audience",
            icon: Users
        },
        {
            title: "Networking",
            description: "Connect with business leaders and influencers",
            icon: Star
        },
        {
            title: "Positive Association",
            description: "Energetic, family-friendly sporting event",
            icon: Heart
        },
        {
            title: "Entertainment Factor",
            description: "DJ & Dhol keep the energy high all evening",
            icon: Zap
        },
        {
            title: "Community Impact",
            description: "Support local talent and contribute to sports development",
            icon: Gift
        }
    ]

    const contactPersons = [
        {
            name: "Mukesh G Jain",
            role: "PRO - Sports",
            phone: "9420277778"
        },
        {
            name: "Vinod Jain",
            role: "Treasurer",
            phone: "9028847311"
        },
        { 
            name: "Dhiraj S Shah",
            role: "Founder President",
            phone: "8975797500"
        }
    ]

    const handleBrochureDownload = () => {
        const link = document.createElement('a')
        link.href = '/files/SPL02_Sponsorship.pdf'
        link.download = 'SPL02_Sponsorship_Brochure.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

                {/* Title Sponsor Section - Naturally Integrated */}
                <div className="text-center mb-8 sm:mb-12 animate-slide-up">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl sm:rounded-4xl p-6 sm:p-10 shadow-large border border-white/50 relative overflow-hidden group hover:shadow-glow-lg transition-all duration-500">
                        
                        <div className="relative z-10 space-y-2 sm:space-y-3">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 hover:text-blue-600 transition-colors duration-300 leading-tight">
                                JSG Pune Sparsh
                            </h1>
                            
                            <p className="text-lg sm:text-xl text-gray-600 font-medium leading-tight">
                                in proud association with
                            </p>
                            
                            {/* Naturally Integrated Title Sponsor Logo */}
                            <div className="flex justify-center py-6 relative">
                                {/* Floating Elements Around Logo */}
                                <div className="absolute inset-0 pointer-events-none">
                                </div>

                                <div className="group/logo relative">
                                    {/* Natural Integration Container - No frames or borders */}
                                    <div className="relative transform group-hover/logo:scale-105 transition-all duration-500">
                                        {/* Subtle Glow Behind Logo */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-transparent to-yellow-100/50 blur-2xl opacity-0 group-hover/logo:opacity-60 transition-all duration-700"></div>
                                        
                                        {/* Logo - Naturally integrated */}
                                        <img
                                            src="/images/TitleSponsor.png"
                                            alt="Title Sponsor"
                                            className="relative max-h-32 sm:max-h-40 md:max-h-52 lg:max-h-64 xl:max-h-72 w-auto object-contain transition-all duration-500 group-hover/logo:brightness-110 group-hover/logo:contrast-105"
                                            style={{ 
                                                filter: 'brightness(1.02) contrast(1.02) saturate(1.05)',
                                            }}
                                        />
                                        
                                        {/* Subtle highlight overlay for natural integration */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 opacity-0 group-hover/logo:opacity-30 transition-opacity duration-500 pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-lg sm:text-xl text-gray-600 font-medium leading-tight">
                                presents
                            </p>
                            
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                                Sparsh Premier League
                            </h2>
                            
                            <h3 className="text-xl sm:text-xl md:text-2xl font-bold text-yellow-600 hover:text-yellow-500 transition-colors duration-300 leading-tight">
                                Season 02
                            </h3>

                            {/* Date */}
                            <div className="text-xl sm:text-xl md:text-2xl font-bold text-blue-600 animate-pulse pt-4">
                                🥎 15 & 16 November 2025 🥎
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <a
                                    href="/register-now"
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 hover:scale-110 transition-all duration-300 shadow-lg text-base sm:text-lg group/button"
                                >
                                    <Trophy size={20} className="sm:w-6 sm:h-6 group-hover/button:animate-bounce" />
                                    <span>Register Now</span>
                                </a>
                                
                                {/* <a
                                    href="/spl02/players"
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold hover:from-green-700 hover:to-teal-700 hover:scale-110 transition-all duration-300 shadow-lg text-base sm:text-lg group/button"
                                >
                                    <Users size={20} className="sm:w-6 sm:h-6 group-hover/button:animate-bounce" />
                                    <span>View Players</span>
                                </a> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tournament Description - Enhanced animations with center-aligned feature cards */}
                <div className="mb-12 sm:mb-16">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl sm:rounded-4xl p-4 sm:p-8 shadow-large border border-white/50 mb-6 sm:mb-8 hover:shadow-glow transition-all duration-500 group">
                        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 sm:mb-6 group-hover:text-blue-600 transition-colors duration-300 text-center">
                            💥 Get ready for the ultimate cricket showdown!
                        </h2>
                        <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed text-center">
                            The most anticipated Box Cricket Tournament is just around the corner, bringing you:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-2xl hover:bg-blue-100 hover:scale-105 transition-all duration-300 group/card text-center">
                                <div className="text-xl sm:text-2xl mb-1 sm:mb-2 group-hover/card:animate-bounce">⚡</div>
                                <div className="font-bold text-blue-800 text-sm sm:text-base">Thrilling Matches</div>
                            </div>
                            <div className="bg-yellow-50 p-3 sm:p-4 rounded-2xl hover:bg-yellow-100 hover:scale-105 transition-all duration-300 group/card text-center">
                                <div className="text-xl sm:text-2xl mb-1 sm:mb-2 group-hover/card:animate-bounce">💪</div>
                                <div className="font-bold text-yellow-800 text-sm sm:text-base">Fierce Competition</div>
                            </div>
                            <div className="bg-green-50 p-3 sm:p-4 rounded-2xl hover:bg-green-100 hover:scale-105 transition-all duration-300 group/card text-center">
                                <div className="text-xl sm:text-2xl mb-1 sm:mb-2 group-hover/card:animate-bounce">🎉</div>
                                <div className="font-bold text-green-800 text-sm sm:text-base">Non-stop Excitement</div>
                            </div>
                        </div>
                        <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 text-center">
                            Whether you're a player or a fan, this is the event you've been waiting for!
                        </p>
                        <div className="text-sm sm:text-lg text-blue-800 font-bold animate-pulse text-center">
                            📣 Stay Tuned for updates on: 🏅 Sponsorship 📝 Registration 🗓️ Schedules 🎁 Prizes
                        </div>
                    </div>
                </div>

                {/* Team Categories - Enhanced with stagger animations */}
                <div className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center hover:text-blue-600 transition-colors duration-300">
                        Tournament Categories
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {teamCategories.map((team, index) => {
                            const IconComponent = team.icon
                            return (
                                <div 
                                    key={index} 
                                    className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-large hover:shadow-glow-lg transition-all duration-500 border border-white/50 group hover:scale-105 hover:-translate-y-2"
                                    style={{
                                        animationDelay: `${index * 200}ms`,
                                        animation: 'slideUp 0.8s ease-out forwards'
                                    }}
                                >
                                    <div className={`bg-gradient-to-r ${team.color} p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white text-center mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                                        <IconComponent size={32} className="sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 group-hover:animate-bounce" />
                                        <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{team.category}</h3>
                                        <div className="text-2xl sm:text-4xl font-bold group-hover:scale-110 transition-transform duration-300">{team.count}</div>
                                        <div className="text-xs sm:text-sm opacity-90">Teams</div>
                                    </div>
                                    <p className="text-gray-600 text-center leading-relaxed text-sm sm:text-base group-hover:text-gray-800 transition-colors duration-300">
                                        {team.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sponsorship Section - Enhanced animations */}
                <div className="mb-12 sm:mb-16">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl sm:rounded-4xl p-4 sm:p-8 md:p-12 shadow-large border border-white/50 hover:shadow-glow-lg transition-all duration-500 group">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-blue-800 mb-4 sm:mb-8 group-hover:text-blue-600 transition-colors duration-300">
                            Why Sponsor SPL-02?
                        </h2>
                        <p className="text-base sm:text-xl text-gray-700 text-center mb-8 sm:mb-12 leading-relaxed max-w-4xl mx-auto">
                            Partnering with SPL-02 places your brand at the heart of a dynamic sporting celebration
                            that unites the community and delivers measurable visibility.
                        </p>

                        {/* Enhanced Sponsorship Benefits */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                            {sponsorshipBenefits.map((benefit, index) => {
                                const IconComponent = benefit.icon
                                return (
                                    <div 
                                        key={index} 
                                        className="text-center p-4 sm:p-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl hover:bg-blue-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group/benefit border border-blue-100"
                                        style={{
                                            animationDelay: `${index * 150}ms`,
                                            animation: 'fadeIn 0.6s ease-in-out forwards'
                                        }}
                                    >
                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover/benefit:animate-bounce shadow-lg">
                                            <IconComponent size={18} className="sm:w-6 sm:h-6" />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2 sm:mb-3 group-hover/benefit:text-blue-600 transition-colors duration-300">{benefit.title}</h3>
                                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Enhanced Call to Action */}
                        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-blue-600 rounded-3xl sm:rounded-4xl p-6 sm:p-8 text-white text-center relative overflow-hidden group/cta hover:shadow-glow-lg transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 group-hover/cta:scale-105 transition-transform duration-300">Let's Create Season 2 Together!</h3>
                                <p className="text-base sm:text-xl mb-4 sm:mb-6 leading-relaxed">
                                    Be part of one of Pune's biggest community sporting events of 2025.
                                    Build your brand, celebrate cricket, and strengthen community ties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Contact Section */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl sm:rounded-4xl p-4 sm:p-8 md:p-12 shadow-large border border-white/50 text-center hover:shadow-glow-lg transition-all duration-500 group">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 group-hover:text-blue-600 transition-colors duration-300">
                        For Sponsorship Bookings and Inquiries
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {contactPersons.map((person, index) => (
                            <div 
                                key={index} 
                                className="bg-blue-50/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:bg-blue-100 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group/contact border border-blue-100"
                                style={{
                                    animationDelay: `${index * 200}ms`,
                                    animation: 'slideUp 0.8s ease-out forwards'
                                }}
                            >
                                <h4 className="text-lg sm:text-xl font-bold text-blue-800 mb-1 sm:mb-2 group-hover/contact:text-blue-600 transition-colors duration-300">{person.name}</h4>
                                <p className="text-blue-600 font-medium mb-2 sm:mb-3 text-sm sm:text-base">{person.role}</p>
                                <a
                                    href={`tel:${person.phone}`}
                                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 text-sm sm:text-base shadow-lg group/phone"
                                >
                                    <Phone size={14} className="sm:w-4 sm:h-4 group-hover/phone:animate-bounce" />
                                    <span>{person.phone}</span>
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="mt-6 sm:mt-8">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-large w-full sm:w-auto hover:scale-105 hover:shadow-glow group/sponsor">
                                <span className="group-hover/sponsor:animate-pulse">Become a Sponsor</span>
                            </button>
                            <button 
                                onClick={handleBrochureDownload}
                                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-large group/download"
                            >
                                <span className="group-hover/download:animate-pulse">Download Brochure</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}