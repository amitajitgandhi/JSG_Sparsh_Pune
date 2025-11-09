'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'

export default function Goa2026() {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number; type: 'sand' | 'drop' }[]>([])
  const [hide, setHide] = useState(false)

  useEffect(() => {
    // Generate particles once on mount
    const count = 40
    const list: typeof particles = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: Math.random() * 100, // vw percentage
        size: Math.random() * 6 + 4, // px
        delay: Math.random() * 1.5, // s
        duration: Math.random() * 3 + 4, // s
        type: Math.random() < 0.5 ? 'sand' : 'drop'
      })
    }
    setParticles(list)
    // Hide animation layer after 8s
    const t = setTimeout(() => setHide(true), 8000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-12 relative overflow-hidden">
      {/* Falling particles overlay */}
      {!hide && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {particles.map(p => (
            <span
              key={p.id}
              className={`absolute animate-fall ${p.type === 'sand' ? 'bg-yellow-200/90 shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'bg-blue-200/80 shadow-[0_0_6px_rgba(59,130,246,0.5)]'} rounded-full`}
              style={{
                left: `${p.left}vw`,
                top: '-20px',
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative w-full h-[300px] md:h-[480px] lg:h-[520px] overflow-hidden">
        <Image 
          src="/images/goa.jpg" 
          alt="GOA 2026 Sun, Sand & Sparsh" 
          fill 
          priority
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/10" />
        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 px-4 w-full max-w-6xl text-center">
          <h1 className="glow-text text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
            Goa Calling!
          </h1>
          <p className="glow-subtext mt-3 md:mt-4 text-base sm:text-lg md:text-2xl font-semibold text-white tracking-wide drop-shadow">
            Sun, Sand & Sparsh
          </p>
        </div>
      </div>

      {/* Main Content Tiles */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 md:-mt-24 relative z-20 space-y-10 md:space-y-14">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Dates Tile */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-400 to-fuchsia-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.5),transparent_65%)] transition-opacity" />
            <div className="relative h-full w-full rounded-2xl bg-white backdrop-blur-sm p-5 flex items-start gap-4 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 opacity-60 group-hover:opacity-90 transition-opacity" />
              <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-300/30 blur-2xl group-hover:scale-125 transition-transform" />
              <div className="relative rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-600/30 group-hover:shadow-lg group-hover:scale-105 transition-transform">
                <Calendar size={26} className="drop-shadow" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Dates</p>
                <p className="text-lg md:text-xl font-semibold text-slate-800 leading-snug">25th–26th January 2026</p>
                <p className="text-xs font-medium text-blue-500 mt-0.5 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />(2 Nights)</p>
              </div>
            </div>
          </div>

          {/* Location Tile */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-pink-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.45),transparent_60%)] transition-opacity" />
            <div className="relative h-full w-full rounded-2xl bg-white backdrop-blur-sm p-5 flex items-start gap-4 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 opacity-60 group-hover:opacity-90 transition-opacity" />
              <span className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-200/50 to-orange-300/40 blur-2xl group-hover:scale-125 transition-transform" />
              <div className="relative rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 text-white shadow-md shadow-orange-500/30 group-hover:shadow-lg group-hover:scale-105 transition-transform">
                <MapPin size={26} className="drop-shadow" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Location</p>
                <p className="text-lg md:text-xl font-semibold text-slate-800 leading-snug">Goa • Premium 4-star Property</p>
                <p className="text-xs font-medium text-amber-500 mt-0.5 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />Private Beach Access</p>
              </div>
            </div>
          </div>

          {/* Capacity Tile */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-teal-300 via-cyan-400 to-sky-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 bg-[radial-gradient(circle_at_40%_70%,rgba(255,255,255,0.5),transparent_60%)] transition-opacity" />
            <div className="relative h-full w-full rounded-2xl bg-white backdrop-blur-sm p-5 flex items-start gap-4 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-600 opacity-60 group-hover:opacity-90 transition-opacity" />
              <span className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200/50 to-sky-300/40 blur-2xl group-hover:scale-125 transition-transform" />
              <div className="relative rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 p-2.5 text-white shadow-md shadow-cyan-600/30 group-hover:shadow-lg group-hover:scale-105 transition-transform">
                <Users size={26} className="drop-shadow" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">Capacity</p>
                <p className="text-lg md:text-xl font-semibold text-slate-800 leading-snug">Limited Spots</p>
                <p className="text-xs font-medium text-cyan-600 mt-0.5 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />Family friendly experience</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border border-blue-100 rounded-2xl p-6 md:p-7 shadow-lg">
              <h2 className="text-sm tracking-wide font-bold uppercase text-blue-700 mb-4">Trip Highlights</h2>
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-medium text-gray-700">
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">4-star Luxury Stay</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Private Beach Access</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">All Meals Included</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Fun Games & Party</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Couple & Family Bonding</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Relaxation & Joy</li>
              </ul>
              <p className="text-xs text-gray-600 font-medium mt-3">2 days of pure relaxation, joy & togetherness.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-lg border border-gray-200">
              <h2 className="text-sm tracking-wide font-bold uppercase text-blue-700 mb-3">Why Join This Getaway?</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                Reconnect, rejuvenate and celebrate togetherness at an exclusive beachside retreat curated for our JSG Pune Sparsh community. Crafted so families and couples can unwind, bond and create golden memories, this two-night escape blends leisure, curated dining, engaging activities and elegant ambience—away from the everyday rush.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white border border-yellow-200 rounded-2xl p-6 md:p-7 shadow-lg">
              <h3 className="text-sm tracking-wide font-bold uppercase text-yellow-700 mb-4">Package Details</h3>
              <div className="text-gray-700 text-sm leading-relaxed font-medium space-y-3">
                <p><strong className="text-3xl md:text-4xl text-yellow-600">₹20,000</strong> <span className="text-base">per couple</span></p>
                <p>Includes stay, meals, activities, and surprises!</p>
                <p className="text-xs md:text-sm text-gray-600 bg-yellow-50 border border-yellow-100 rounded-lg p-3 leading-relaxed">
                                  Travel is not part of the standard package. However, for members who may require travelassistance, we are considering organizing a group travel option at a minimal additional cost to ensure participation for all.
                </p>
              </div>
            </div>
            <div className="bg-blue-600 text-white rounded-2xl p-6 md:p-7 shadow-lg space-y-3">
              <p className="text-sm md:text-base font-semibold">Bookings open soon through the JSG App.</p>
              <p className="text-xs md:text-sm opacity-90">Don’t miss this exclusive getaway — limited spots available!</p>
              <Link href="/committee" className="inline-block bg-white/15 hover:bg-white/25 text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-lg border border-white/30 backdrop-blur-sm transition-all">Contact Team</Link>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-lg border border-gray-200">
              <h4 className="text-sm font-bold uppercase tracking-wide text-blue-700 mb-2">Stay Tuned</h4>
              <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">Registration link will be activated soon. Prepare to book early.</p>
              <p className="text-xs text-gray-500">We will announce booking window across all channels.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          0%,100% { text-shadow: 0 0 14px rgba(255,255,255,0.95), 0 0 28px rgba(59,130,246,0.55), 0 0 48px rgba(251,191,36,0.5); }
          50% { text-shadow: 0 0 6px rgba(255,255,255,0.75), 0 0 18px rgba(59,130,246,0.45), 0 0 32px rgba(251,191,36,0.4); }
        }
        .glow-text { animation: glow 4s ease-in-out infinite; }
        .glow-subtext { text-shadow: 0 0 6px rgba(255,255,255,0.8), 0 0 16px rgba(59,130,246,0.4), 0 0 24px rgba(251,191,36,0.35); }
        @keyframes fall {
          0% { transform: translateY(-20px) scale(1) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) scale(0.8) rotate(360deg); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; animation-iteration-count: 1; }
      `}</style>
    </div>
  )
}
