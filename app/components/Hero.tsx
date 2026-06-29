'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, CalendarClock, MapPin, HeartHandshake, PartyPopper, Sparkles } from 'lucide-react'

export default function Hero() {
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [upcomingTarget, setUpcomingTarget] = useState('/events/khelotsav')

  useEffect(() => {
    const loadUpcomingTarget = async () => {
      try {
        const res = await fetch('/api/admin/upcoming-event-target', { cache: 'no-store' })
        const data = await res.json()
        if (data?.target) setUpcomingTarget(data.target)
      } catch {
        // keep whatever was last set (initial state or previously loaded value)
      }
    }

    loadUpcomingTarget()
  }, [])

  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-24 relative overflow-hidden">
        {/* Warm yellow glow so the hero isn't a flat wall of blue */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-400/25 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-amber-300/15 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
        {/* Soft fade into the page below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-b from-transparent to-white dark:to-gray-950"></div>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex flex-col items-center mb-6 sm:mb-8 animate-fade-in">
              {/* Eyebrow badge */}
              <div className="mb-7 sm:mb-10 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-yellow-200">
                <MapPin size={13} className="text-yellow-300" />
                Pune · Est. 2024
              </div>
              <h1 className="hero-title text-[2.75rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black mb-6 sm:mb-8 tracking-tight">
                <span className="text-white">JSG PUNE </span>
                <span className="hero-shimmer text-transparent bg-clip-text">SPARSH</span>
              </h1>
            </div>
            <div className="mb-6 sm:mb-8 animate-slide-up">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 text-yellow-200 font-medium leading-tight">
                Jain Social Group - Unity in Community
              </p>
              <div className="w-16 sm:w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
            </div>
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto text-blue-100 leading-relaxed animate-slide-up px-2">
              Connecting hearts and preserving traditions — bringing the Jain community of Pune together
              through vibrant social, cultural, and community events all year round.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center mb-12 sm:mb-16 animate-slide-up px-2" style={{ animationDelay: '0.15s' }}>
              <Link
                href={upcomingTarget}
                className="group relative bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-900 px-6 sm:px-9 lg:px-10 py-3.5 sm:py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <CalendarClock size={18} className="sm:w-5 sm:h-5" />
                <span>Upcoming Event</span>
                <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/events2027"
                className="group bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 sm:px-9 lg:px-10 py-3.5 sm:py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Calendar size={18} className="sm:w-5 sm:h-5" />
                <span>Browse Events</span>
                <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-8 max-w-3xl mx-auto animate-slide-up px-2" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: HeartHandshake, value: '350+', label: 'Community Members', chip: 'from-blue-500 to-indigo-600' },
                { icon: PartyPopper,    value: '20+',  label: 'Events Organized',  chip: 'from-yellow-400 to-amber-500' },
                { icon: Sparkles,       value: '2024', label: 'Year Established',   chip: 'from-blue-500 to-indigo-600' },
              ].map(({ icon: Icon, value, label, chip }) => (
                <div key={label} className="group text-center bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border-2 border-yellow-400 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-center mb-2 sm:mb-3">
                    <div className={`bg-gradient-to-br ${chip} rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Icon className="text-white w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.25} />
                    </div>
                  </div>
                  <div className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-0.5 sm:mb-2 text-blue-600">{value}</div>
                  <div className="text-gray-500 font-semibold text-[11px] leading-tight sm:text-base">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-12 sm:mt-16 animate-slide-up px-2" style={{ animationDelay: '0.45s' }}>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-9 max-w-2xl mx-auto border border-white/20 shadow-xl overflow-hidden">
                <span className="pointer-events-none absolute -top-2 left-4 text-7xl sm:text-8xl font-serif text-yellow-300/30 leading-none select-none">“</span>
                <p className="text-yellow-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 sm:mb-3">Our Guiding Principle</p>
                <p className="relative text-white text-lg sm:text-xl md:text-2xl font-semibold italic leading-snug">
                  Walk together, talk together, and act with one mind
                </p>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto mt-4 sm:mt-5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-yellow-300/15 rounded-full animate-bounce"></div>
        <div className="absolute bottom-24 sm:bottom-32 right-5 sm:right-10 w-10 h-10 sm:w-16 sm:h-16 bg-yellow-300/15 rounded-full animate-bounce"></div>
      </section>

      {/* Logo band — the mark sits on its native white background below the hero, so it never looks like a patch */}
      <div className="bg-white dark:bg-gray-950 pt-8 pb-4 sm:pt-12 sm:pb-6 border-t-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 flex justify-center animate-fade-in">
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm">
            <img
              src="/images/JSG_SPARSH.jpeg"
              alt="JSG SPARSH Pune Logo"
              className="h-28 sm:h-36 md:h-44 w-auto object-contain hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {showUpcoming && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 px-5 py-3 flex items-center justify-between text-white">
              <h3 className="text-base font-bold tracking-wide">Upcoming Events</h3>
              <button onClick={() => setShowUpcoming(false)} className="text-white/80 hover:text-white text-sm">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <p className="text-gray-700 font-medium">Choose an event to view details & register early.</p>
              <div className="grid gap-3">
                <Link
                  href="/events/2026-2027-installation"
                  onClick={() => setShowUpcoming(false)}
                  className="group rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 flex items-center justify-between hover:bg-emerald-100 transition"
                >
                  <span>Installation Ceremony 2026-27</span>
                  <span className="text-[11px] font-bold uppercase tracking-wide group-hover:translate-x-1 transition">
                    View &rarr;
                  </span>
                </Link>
                <Link
                  href="/events/valentine-2026"
                  onClick={() => setShowUpcoming(false)}
                  className="group rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 font-semibold text-rose-700 flex items-center justify-between hover:bg-rose-100 transition"
                >
                  <span>Valentine Soirée 2026</span>
                  <span className="text-[11px] font-bold uppercase tracking-wide group-hover:translate-x-1 transition">
                    View &rarr;
                  </span>
                </Link>
              </div>
              <button
                onClick={() => setShowUpcoming(false)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}