"use client"

import { useEffect, useState } from "react"
import { Users, Star, Target, Phone, Zap, Heart, Gift, Trophy } from 'lucide-react'

// Title Sponsor Video component (unchanged)
function TitleSponsorVideo() {
  const [assetStatus, setAssetStatus] = useState<"unknown" | "ok" | "missing">("unknown")
  const [playbackError, setPlaybackError] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const check = async () => {
      try { const res = await fetch("/videos/Video1.mp4", { method: "HEAD" }); setAssetStatus(res.ok ? "ok" : "missing") } catch { setAssetStatus("missing") } finally { setChecked(true) }
    }
    check()
  }, [])

  if (!checked) return <div className="flex items-center justify-center w-full h-full bg-black/40 text-white text-xs animate-pulse">Checking video...</div>
  if (assetStatus === "missing") return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
      <p className="text-sm font-semibold text-red-600">Video file not deployed</p>
      <p className="text-xs text-red-700">Ensure <code className="font-mono">public/videos/Video1.mp4</code> is committed and pushed.</p>
    </div>
  )
  if (playbackError) return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center space-y-2">
      <p className="text-sm font-semibold text-yellow-700">Playback failed</p>
      <p className="text-xs text-yellow-700">Re-encode with H.264 + AAC or add WEBM fallback.</p>
      <div className="flex justify-center gap-3 text-xs"><a href="/videos/Video1.mp4" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Open MP4</a></div>
    </div>
  )
  return (
    <video className="w-full h-full object-cover" controls playsInline preload="metadata" poster="/images/TitleSponsor.png" onError={() => setPlaybackError(true)}>
      <source src="/videos/Video1.mp4" type="video/mp4" />
      Your browser does not support HTML5 video. <a href="/videos/Video1.mp4" className="text-blue-600 underline">Download</a>.
    </video>
  )
}

export default function SPL02() {
  const teamCategories = [
    { category: "Men's Teams", count: 11, icon: Users, color: "from-blue-500 to-blue-600", description: "Elite male cricket teams competing for the championship" },
    { category: "Women's Teams", count: 4, icon: Heart, color: "from-pink-500 to-pink-600", description: "Talented female cricketers showcasing their skills" },
    { category: "Kids Teams", count: 4, icon: Star, color: "from-green-500 to-green-600", description: "Young cricket enthusiasts building the future of the sport" }
  ]
  
  const titleSponsor = { category: 'Title Sponsor', sponsor: 'Dinesh Bothra', firm: 'S G Promoters & Real Estate Consultant', emoji: '👑' }
  const otherSponsors = [
    { category: 'Jersey Sponsor', sponsor: 'Chimmy Bamrecha', firm: 'Paras Sales', emoji: '👕' },
    { category: 'Trophy Sponsor', sponsor: 'Shalak & Yuvraj Shah', firm: 'Flamingo Tours & Travels', emoji: '🏆' },
    { category: 'Sports Kit Sponsor', sponsor: 'Kalpesh Dhoka', firm: 'Vacations Store', emoji: '🎒' },
    { category: 'Cap Sponsor', sponsor: 'Sanjay Jain & Mukesh Oswal', firm: 'Smart Modiform Industries LLP', emoji: '🧢' },
    { category: 'Toss Ka Boss Sponsor', sponsor: 'Sunil & Mamtesh Patni', firm: 'Arihant Hardware & Steel', emoji: '🪙' },
    { category: 'Boundary Sponsor', sponsor: 'Dilip Jain', firm: 'Water World', emoji: '🎯' }
  ]

  const winners = [
    { category: 'Kids – Male', emoji: '🧒', winner: 'Unique Chargers', runnerUp: 'Rathod Royals' },
    { category: 'Female', emoji: '👩', winner: 'Silent Killers', runnerUp: 'Smash Sisters' },
    { category: 'Male', emoji: '👨', winner: 'R K Dominators', runnerUp: 'Jainam Fighters', secondRunnerUp: 'S G Warriors' }
  ]

  const sponsorshipBenefits = [
    { title: "High Visibility", description: "Branding across the venue, social media, and live coverage", icon: Target },
    { title: "Direct Engagement", description: "Reach an enthusiastic Jain community audience", icon: Users },
    { title: "Networking", description: "Connect with business leaders and influencers", icon: Star },
    { title: "Positive Association", description: "Energetic, family-friendly sporting event", icon: Heart },
    { title: "Entertainment Factor", description: "DJ & Dhol keep the energy high all evening", icon: Zap },
    { title: "Community Impact", description: "Support local talent and contribute to sports development", icon: Gift }
  ]
  const contactPersons = [
    { name: "Mukesh G Jain", role: "PRO - Sports", phone: "9420277778" },
    { name: "Vinod Jain", role: "Treasurer", phone: "9028847311" },
    { name: "Dhiraj S Shah", role: "Founder President", phone: "8975797500" }
  ]
  const handleBrochureDownload = () => { const link = document.createElement("a"); link.href = "/files/SPL02_Sponsorship.pdf"; link.download = "SPL02_Sponsorship_Brochure.pdf"; document.body.appendChild(link); link.click(); document.body.removeChild(link) }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Banner & Title Sponsor Video */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <img src="/images/SPL02_Banner.jpeg" alt="SPL02 - Sparsh Premier League Season 2 Banner" className="w-full h-auto object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="mt-4 sm:mt-6 md:mt-8">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-black aspect-video">
                <TitleSponsorVideo />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">Proud Associate SG Promoters & Real Estate Consultant Video</p>
            </div>
          </div>

          {/* Title Sponsor Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-large border border-white/50 relative overflow-hidden">
              <div className="relative z-10 space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 leading-tight">JSG Pune Sparsh</h1>
                <p className="text-lg sm:text-sm text-gray-600 font-medium leading-tight">in proud association with</p>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-600 to-yellow-600 bg-clip-text text-transparent leading-tight">SG Promoters & Real Estate Consultant</h2>
                <p className="text-lg sm:text-sm text-gray-600 font-medium leading-tight">presents</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent leading-tight pb-2">Sparsh Premier League</h2>
                <h3 className="text-xl md:text-2xl font-bold text-gray-500 leading-tight">Season 02</h3>
                <div className="text-xl md:text-2xl font-bold text-green-600">🥎 15 & 16 November 2025 🥎</div>
              </div>
            </div>
          </div>

          {/* Season 2 Sponsors Tile */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 rounded-3xl p-6 sm:p-10 shadow-xl border border-orange-100">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-orange-700 mb-2">Season 2 Sponsors</h2>
                <p className="text-base md:text-lg text-gray-600">Thank you for making SPL Season 2 a grand success!</p>
              </div>
              
              <p className="text-base md:text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-4xl mx-auto">
                Heartfelt gratitude to all our <span className="font-bold text-orange-600">Sponsors</span> & <span className="font-bold text-yellow-600">Team Owners</span> for your incredible support, contribution and trust.
              </p>
              
              {/* Title Sponsor - Full Width */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-100 via-orange-50 to-yellow-100 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-yellow-300">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-6xl animate-revolve">{titleSponsor.emoji}</div>
                    <div className="text-center">
                      <p className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-2">{titleSponsor.category}</p>
                      <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{titleSponsor.sponsor}</h3>
                      <p className="text-lg font-semibold text-gray-700 mt-2">{titleSponsor.firm}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Sponsors - 2 rows × 3 columns */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherSponsors.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-4xl">{s.emoji}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">{s.category}</p>
                        <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{s.sponsor}</h3>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">{s.firm}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Season 2 Winners Tile */}
          <div className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-100">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-2">Season 2 Winners</h2>
                <p className="text-base md:text-lg text-gray-600">Congratulations to all our champions!</p>
              </div>
              
              {/* Winners - 1 row × 3 columns */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {winners.map((w, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-5xl">{w.emoji}</div>
                      <h3 className="text-xl font-extrabold text-blue-700">{w.category} Category</h3>
                    </div>
                    <div className="space-y-3 text-base">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <span className="text-3xl">🥇</span>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase">Winners</p>
                          <p className="font-semibold text-gray-900">{w.winner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-3xl">🥈</span>
                        <div>
                          <p className="text-xs font-bold text-gray-600 uppercase">Runner-up</p>
                          <p className="font-semibold text-gray-800">{w.runnerUp}</p>
                        </div>
                      </div>
                      {w.secondRunnerUp && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <span className="text-3xl">🥉</span>
                          <div>
                            <p className="text-xs font-bold text-gray-600 uppercase">2nd Runner-up</p>
                            <p className="font-semibold text-gray-800">{w.secondRunnerUp}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
           </div>

         {/* Team Categories 
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center">Tournament Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {teamCategories.map((team, index) => {
                const IconComponent = team.icon
                return (
                  <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-large transition-all duration-500 border border-white/50 hover:scale-105 hover:-translate-y-2">
                    <div className={`bg-gradient-to-r ${team.color} p-4 sm:p-6 rounded-2xl text-white text-center mb-4 sm:mb-6 shadow-lg`}>
                      <IconComponent size={32} className="mx-auto mb-2 sm:mb-4" />
                      <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{team.category}</h3>
                      <div className="text-2xl sm:text-4xl font-bold">{team.count}</div>
                      <div className="text-xs sm:text-sm opacity-90">Teams</div>
                    </div>
                    <p className="text-gray-600 text-center leading-relaxed text-sm sm:text-base">{team.description}</p>
                  </div>
                )
              })}
            </div>
          </div> */}

          {/* Stay Tuned for Full Pitch Tournament Announcement */}
          <div className="mb-12 sm:mb-16">
            <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-100 overflow-hidden relative">
              {/* Decorative background elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-200/30 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-4 animate-bounce">📣</div>
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
                  Stay Tuned!
                </h2>
                <div className="max-w-3xl mx-auto space-y-4">
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                    SPARSH Full Pitch Tournament
                  </p>
                  <p className="text-xl md:text-2xl font-extrabold text-purple-700">
                    Season 02
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <span className="text-4xl">🏏</span>
                    <p className="text-lg md:text-xl text-gray-600 font-medium">
                      Coming Soon - More Details to Follow!
                    </p>
                    <span className="text-4xl">🏏</span>
                  </div>
                  <div className="mt-8 inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg">
                    <p className="text-base md:text-lg font-bold">
                      Get ready for another cricket showdown..!!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Sponsorship Section */}
          <div className="mb-12 sm:mb-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-8 md:p-12 shadow-large border border-white/50">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-blue-800 mb-4 sm:mb-8">Why Sponsor SPL-02?</h2>
              <p className="text-base sm:text-xl text-gray-700 text-center mb-8 sm:mb-12 leading-relaxed max-w-4xl mx-auto">Partnering with SPL-02 places your brand at the heart of a dynamic sporting celebration that unites the community and delivers measurable visibility.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                {sponsorshipBenefits.map((benefit, index) => {
                  const IconComponent = benefit.icon
                  return (
                    <div key={index} className="text-center p-4 sm:p-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl hover:bg-blue-100 hover:scale-105 transition-all duration-300 border border-blue-100">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
                        <IconComponent size={18} className="sm:w-6 sm:h-6" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2 sm:mb-3">{benefit.title}</h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                    </div>
                  )
                })}
              </div>
              <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Let's Create Season 2 Together!</h3>
                <p className="text-base sm:text-xl mb-4 sm:mb-6 leading-relaxed">Be part of one of Pune's biggest community sporting events of 2025. Build your brand, celebrate cricket, and strengthen community ties.</p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-8 md:p-12 shadow-large border border-white/50 text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-6 sm:mb-8">For Sponsorship Bookings and Inquiries</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {contactPersons.map((person, index) => (
                <div key={index} className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 hover:bg-blue-100 hover:scale-105 transition-all duration-300 border border-blue-100">
                  <h4 className="text-lg sm:text-xl font-bold text-blue-800 mb-1 sm:mb-2">{person.name}</h4>
                  <p className="text-blue-600 font-medium mb-2 sm:mb-3 text-sm sm:text-base">{person.role}</p>
                  <a href={`tel:${person.phone}`} className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base shadow-lg">
                    <Phone size={14} className="sm:w-4 sm:h-4" />
                    <span>{person.phone}</span>
                  </a>
                </div>
              ))}
              <div className="mt-6 sm:mt-8 col-span-full flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-large w-full sm:w-auto">Become a Sponsor</button>
                <button onClick={handleBrochureDownload} className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto">Download Brochure</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes revolve {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        .animate-revolve {
          animation: revolve 3s linear infinite;
          transform-style: preserve-3d;
        }
      `}</style>
    </>
  )
}