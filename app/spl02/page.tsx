"use client"

import { useEffect, useState } from "react"
import { Users, Star, Target, Phone, Zap, Heart, Gift, Trophy } from 'lucide-react'
import Link from "next/link"

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
    { category: "Men's Teams", count: 12, icon: Users, color: "from-blue-500 to-blue-600", description: "Elite male cricket teams competing for the championship" },
    { category: "Women's Teams", count: 4, icon: Heart, color: "from-pink-500 to-pink-600", description: "Talented female cricketers showcasing their skills" },
    { category: "Kids Teams", count: 4, icon: Star, color: "from-green-500 to-green-600", description: "Young cricket enthusiasts building the future of the sport" }
  ]
  // Added structured sponsors array
  const sponsors = [
    { category: 'Title Sponsor', sponsor: 'Dinesh Bothra', firm: 'S G Promoters', gradient: 'from-yellow-400 via-orange-500 to-pink-600', accent: 'yellow' },
    { category: 'Jersey Sponsor', sponsor: 'Chimmy Bamrecha', firm: 'Paras Sales', gradient: 'from-orange-400 via-pink-500 to-rose-600', accent: 'orange' },
    { category: 'Trophy Sponsor', sponsor: 'Shalak & Yuvraj Shah', firm: 'Flamingo', gradient: 'from-pink-500 via-red-500 to-fuchsia-600', accent: 'pink' },
    { category: 'Sports Kit Sponsor', sponsor: 'Kalpesh Dhoka', firm: 'Vacations Store', gradient: 'from-red-500 via-amber-500 to-orange-600', accent: 'red' },
    { category: 'Cap Sponsor', sponsor: 'Sanjay Jain & Mukesh Oswal', firm: 'Smart Modiform Industries LLP', gradient: 'from-fuchsia-500 via-purple-600 to-indigo-600', accent: 'fuchsia' },
    { category: 'Toss Ka Boss Sponsor', sponsor: 'Sunil & Mamtesh Patni', firm: 'Arihant Hardware & Steel', gradient: 'from-purple-600 via-indigo-600 to-blue-600', accent: 'purple' },
    { category: 'Boundary Sponsor', sponsor: 'Dilip Jain', firm: 'Water World', gradient: 'from-indigo-600 via-blue-600 to-cyan-600', accent: 'indigo' }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-12 animate-fade-in">
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

        {/* Title Sponsor Section (buttons removed) */}
        <div className="text-center mb-8 sm:mb-12 animate-slide-up">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-large border border-white/50 relative overflow-hidden group transition-all duration-500">
            <div className="relative z-10 space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 leading-tight">JSG Pune Sparsh</h1>
              <p className="text-lg sm:text-sm text-gray-600 font-medium leading-tight">in proud association with</p>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-red-600 to-yellow-600 bg-clip-text text-transparent leading-tight">SG Promoters & Real Estate Consultant</h2>
              <p className="text-lg sm:text-sm text-gray-600 font-medium leading-tight">presents</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent leading-tight pb-2 animate-pulse">Sparsh Premier League</h2>
              <h3 className="text-xl md:text-2xl font-bold text-gray-500 leading-tight">Season 02</h3>
              <div className="text-xl md:text-2xl font-bold text-green-600">🥎 15 & 16 November 2025 🥎</div>
            </div>
          </div>
        </div>

        {/* NEW Gratitude & Sponsors + Winners Tile */}
        <div className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sponsors Tile */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-yellow-50 via-white to-orange-50 border border-yellow-200 shadow-xl group">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-pink-300/30 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-yellow-500/30"><Trophy className="w-7 h-7" /></div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">Season 2 Sponsors</h2>
                </div>
                <p className="text-sm md:text-base font-medium text-gray-700 leading-relaxed">Heartfelt gratitude to all our <span className="font-semibold text-yellow-700">Sponsors</span> & <span className="font-semibold text-pink-700">Team Owners</span> for your incredible support, contribution and trust. Your involvement added immense value and made SPL Season 2 a grand success.</p>
                {/* Sponsor Cards Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {sponsors.map((s, i) => (
                    <div key={i} className="relative group/sponsor rounded-2xl p-4 bg-white/90 backdrop-blur-sm border shadow-sm hover:shadow-md hover:-translate-y-1 transition" style={{ borderColor: 'var(--tw-color-'+s.accent+')' }}>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${s.gradient} opacity-0 group-hover/sponsor:opacity-10 transition-opacity`} />
                      <div className="relative space-y-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-${s.accent}-600`}>{s.category}</span>
                        <h3 className={`text-sm font-extrabold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>{s.sponsor}</h3>
                        <p className="text-xs font-medium text-gray-600"><span className="font-semibold text-gray-800">{s.firm}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Winners Tile unchanged */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-pink-50 via-white to-violet-50 border border-pink-200 shadow-xl group">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-violet-300/30 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30"><Trophy className="w-7 h-7" /></div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 bg-clip-text text-transparent">Season 2 Winners</h2>
                </div>
                <div className="space-y-6 text-sm md:text-[15px] font-medium text-gray-700">
                  <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-pink-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-pink-600 mb-1">Kids – Male Category</p>
                    <p><span className="font-semibold text-gray-900">Winners:</span> Unique Chargers</p>
                    <p><span className="font-semibold text-gray-900">Runner-up:</span> Rathod Royals</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-rose-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-rose-600 mb-1">Female Category</p>
                    <p><span className="font-semibold text-gray-900">Winners:</span> Silent Killers</p>
                    <p><span className="font-semibold text-gray-900">Runner-up:</span> Smash Sisters</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-purple-600 mb-1">Male Category</p>
                    <p><span className="font-semibold text-gray-900">Winners:</span> R K Dominators</p>
                    <p><span className="font-semibold text-gray-900">Runner-up:</span> Jainam Fighters</p>
                    <p><span className="font-semibold text-gray-900">2nd Runner-up:</span> S G Warriors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Description */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-large border border-white/50 mb-6 sm:mb-8 group">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4 sm:mb-6 text-center">💥 Get ready for the ultimate cricket showdown!</h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed text-center">The most anticipated Box Cricket Tournament is just around the corner, bringing you:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-2xl text-center"><div className="text-xl sm:text-2xl mb-1 sm:mb-2">⚡</div><div className="font-bold text-blue-800 text-sm sm:text-base">Thrilling Matches</div></div>
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-2xl text-center"><div className="text-xl sm:text-2xl mb-1 sm:mb-2">💪</div><div className="font-bold text-yellow-800 text-sm sm:text-base">Fierce Competition</div></div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-2xl text-center"><div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎉</div><div className="font-bold text-green-800 text-sm sm:text-base">Non-stop Excitement</div></div>
            </div>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 text-center">Whether you're a player or a fan, this is the event you've been waiting for!</p>
            <div className="text-sm sm:text-lg text-blue-800 font-bold animate-pulse text-center">📣 Stay Tuned for updates on: 🏅 Sponsorship 📝 Registration 🗓️ Schedules 🎁 Prizes</div>
          </div>
        </div>

        {/* Team Categories */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 sm:mb-8 text-center">Tournament Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {teamCategories.map((team, index) => {
              const IconComponent = team.icon
              return (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-large transition-all duration-500 border border-white/50 group hover:scale-105 hover:-translate-y-2">
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
        </div>

        {/* Sponsorship Section */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-8 md:p-12 shadow-large border border-white/50 transition-all duration-500 group">
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
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white text-center relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Let's Create Season 2 Together!</h3>
                <p className="text-base sm:text-xl mb-4 sm:mb-6 leading-relaxed">Be part of one of Pune's biggest community sporting events of 2025. Build your brand, celebrate cricket, and strengthen community ties.</p>
              </div>
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
  )
}