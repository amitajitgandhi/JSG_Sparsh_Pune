'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, Users, Trophy, Star, Target, Award, Phone, Mail, Zap, Heart, Gift, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Improved Title Sponsor Video component with asset existence + codec differentiation
function TitleSponsorVideo() {
  const [assetStatus, setAssetStatus] = useState<'unknown' | 'ok' | 'missing'>('unknown')
  const [playbackError, setPlaybackError] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // HEAD request to confirm asset deployed on Vercel
    const check = async () => {
      try {
        const res = await fetch('/videos/Video1.mp4', { method: 'HEAD' })
        setAssetStatus(res.ok ? 'ok' : 'missing')
      } catch {
        setAssetStatus('missing')
      } finally {
        setChecked(true)
      }
    }
    check()
  }, [])

  if (!checked) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black/40 text-white text-xs animate-pulse">
        Checking video...
      </div>
    )
  }

  if (assetStatus === 'missing') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
        <p className="text-sm font-semibold text-red-600">Video file not deployed</p>
            <p className="text-xs text-red-700">Ensure <code className="font-mono">public/videos/Video1.mp4</code> is committed and pushed. After redeploy open <code className="font-mono">/videos/V
                ideo1.mp4</code> directly.</p>
      </div>
    )
  }

  if (playbackError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center space-y-2">
        <p className="text-sm font-semibold text-yellow-700">Playback failed</p>
        <p className="text-xs text-yellow-700">File exists but browser could not decode. Re-encode with H.264 + AAC faststart or add WEBM fallback.</p>
        <div className="flex justify-center gap-3 text-xs">
          <a href="/videos/Video1.mp4" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Open MP4</a>
        </div>
      </div>
    )
  }

  return (
    <video
      className="w-full h-full object-cover"
      controls
      playsInline
      preload="metadata"
      poster="/images/SPL02_Banner.jpeg"
      onError={() => setPlaybackError(true)}
    >
      <source src="/videos/Video1.mp4" type="video/mp4" />
      Your browser does not support HTML5 video. <a href="/videos/Video1.mp4" className="text-blue-600 underline">Download</a>.
    </video>
  )
}

export default function SPL02() {
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false)

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

  const handleRegistrationClick = (e: React.MouseEvent) => {
      e.preventDefault()
      setShowRegistrationPopup(true)
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12 animate-fade-in">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

              {/* SPL02 Banner Image - Added at the top */}
              <div className="mb-6 sm:mb-8 md:mb-12">
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
                      <img 
                          src="/images/SPL02_Banner.jpeg" 
                          alt="SPL02 - Sparsh Premier League Season 2 Banner" 
                          className="w-full h-auto object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  {/* Title Sponsor Video below banner with fallback */}
                  <div className="mt-4 sm:mt-6 md:mt-8">
                      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-black aspect-video">
                          <TitleSponsorVideo />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>
                      <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">Title Sponsor Video</p>
                      </div>
              </div>

              {/* Registration Closed Popup */}
              {showRegistrationPopup && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-gray-200 animate-scale-in relative">
                          {/* Close Button */}
                          <button
                              onClick={() => setShowRegistrationPopup(false)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                              <X size={24} />
                          </button>

                          {/* Icon */}
                          <div className="text-center mb-6">
                              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <AlertCircle className="w-8 h-8 text-red-600" />
                              </div>
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                  Registration Closed
                              </h3>
                              <p className="text-gray-600 mb-6 leading-relaxed">
                                  Registration for SPL-02 are now closed.
                              </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-3">
                              <Link
                                  href="/committee"
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center block shadow-lg hover:shadow-xl"
                                  onClick={() => setShowRegistrationPopup(false)}
                              >
                                  Contact Committee
                              </Link>
                              <button
                                  onClick={() => setShowRegistrationPopup(false)}
                                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                              >
                                  Close
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* Title Sponsor Section - Naturally Integrated */}
              <div className="text-center mb-8 sm:mb-12 animate-slide-up">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl sm:rounded-4xl p-6 sm:p-10 shadow-large border border-white/50 relative overflow-hidden group hover:shadow-glow-lg transition-all duration-500">
                      
                      <div className="relative z-10 space-y-2 sm:space-y-3">
                          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 hover:text-blue-600 transition-colors duration-300 leading-tight">
                              JSG Pune Sparsh
                          </h1>

                          <p className="text-lg sm:text-sm text-gray-600 font-medium leading-tight">
                              in proud association with
                          </p>

                          <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                              SG Promoters & Real Estate Consultant
                          </h2>

                          <p className="text-lg sm:text-sm text-gray-600 font-medium leading-tight">
                              presents
                          </p>
                          
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent leading-tight pb-2 animate-pulse">
                              Sparsh Premier League
                          </h2>
                          
                          <h3 className="text-xl sm:text-xl md:text-2xl font-bold text-gray-500 hover:text-gray-500 transition-colors duration-300 leading-tight">
                              Season 02
                          </h3>

                          {/* Date */}
                          <div className="text-xl sm:text-xl md:text-2xl font-bold text-green-600">
                              🥎 15 & 16 November 2025 🥎
                          </div>

                          {/* FINAL SQUAD Button - Big and Prominent */}
                          <div className="pt-6 pb-4">
                              <Link
                                  href="/spl02/squad"
                                  className="group relative inline-block"
                              >
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl sm:rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <button className="relative bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-2xl sm:rounded-3xl font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 shadow-2xl hover:scale-105 hover:shadow-glow-lg flex items-center space-x-3 sm:space-x-4 animate-pulse">
                                      <Users size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 group-hover:animate-bounce" />
                                      <span className="relative z-10 whitespace-nowrap">FINAL SQUAD</span>
                                      <Trophy size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 group-hover:animate-bounce" />
                                  </button>
                              </Link>
                          </div>

                          {/* Action Buttons - Enhanced Tab Navigation Style with Unique Colors */}
                          <div className="pt-2 flex justify-center">
                              <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-xl border border-gray-200 w-full max-w-4xl">
                                  <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-2">
                                      <button
                                          onClick={handleRegistrationClick}
                                          className="group relative inline-flex items-center justify-center space-x-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 overflow-hidden flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:shadow-md whitespace-nowrap"
                                      >
                                          <Trophy size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                          <span className="relative z-10">Register Now</span>
                                      </button>
                                      
                                      <Link
                                          href="/spl02/players"
                                          className="group relative inline-flex items-center justify-center space-x-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 overflow-hidden flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-md whitespace-nowrap"
                                      >
                                          <Users size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                          <span className="relative z-10">View Players</span>
                                      </Link>

                                      <Link
                                          href="/spl02/tournament-rules"
                                          className="group relative inline-flex items-center justify-center space-x-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 overflow-hidden flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 hover:shadow-md whitespace-nowrap"
                                      >
                                          <Award size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                          <span className="relative z-10">Match Rules</span>
                                      </Link>

                                      <Link
                                          href="/spl02/auction-rules"
                                          className="group relative inline-flex items-center justify-center space-x-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 overflow-hidden flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 hover:shadow-md whitespace-nowrap"
                                      >
                                          <Target size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                          <span className="relative z-10">Auction Rules</span>
                                      </Link>
                                  </div>
                              </div>
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
                                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-large hover:shadow-glow-lg transition-all duration-500 border border-white/50 group hover:scale-105 hover:-translate-y-2"
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
      </div>
  )
}