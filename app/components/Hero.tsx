'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Users, Heart } from 'lucide-react'

export default function Hero() {
  const [showUpcoming, setShowUpcoming] = useState(false)

  return (
    <>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-12 sm:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex flex-col items-center mb-8 sm:mb-12 animate-fade-in">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-6 sm:mb-8">
                <img
                  src="/images/JSG_SPARSH.jpeg"
                  alt="JSG SPARSH Pune Logo"
                  className="w-full h-full object-contain rounded-2xl shadow-lg"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-4 tracking-tight text-white leading-tight">
                JSG PUNE SPARSH
              </h1>
            </div>
            <div className="mb-6 sm:mb-8 animate-slide-up">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 text-yellow-200 font-medium leading-tight">
                Jain Social Group - Unity in Community
              </p>
              <div className="w-16 sm:w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
            </div>
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-4xl mx-auto text-blue-100 leading-relaxed animate-slide-up px-2">
              Connecting hearts, preserving traditions, and building a stronger Jain community in Pune through
              social activities, cultural events, and community service. Walking together towards collective growth
              and spiritual enlightenment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 animate-slide-up px-2">
              <Link
                href="/events"
                className="group bg-white text-blue-700 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-yellow-50 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Calendar size={18} className="sm:w-6 sm:h-6" />
                <span>Past Events</span>
                <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/membership/2026-27"
                className="group bg-yellow-500 hover:bg-yellow-600 text-blue-800 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Users size={18} className="sm:w-6 sm:h-6" />
                <span>Membership Registration</span>
              </Link>
              <Link
                href="/events/valentine-2026"
                className="group bg-white text-blue-700 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-yellow-50 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <Calendar size={18} className="sm:w-6 sm:h-6" />
                <span>Upcoming Event</span>
                <ArrowRight size={16} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto animate-slide-up px-2">
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-yellow-400/20 rounded-full">
                    <Users className="text-yellow-300" size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-white">300+</div>
                <div className="text-yellow-200 font-medium text-sm sm:text-base">Community Members</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-yellow-400/20 rounded-full">
                    <Calendar className="text-yellow-300" size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-white">15+</div>
                <div className="text-yellow-200 font-medium text-sm sm:text-base">Events Organized</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-yellow-400/20 rounded-full">
                    <Heart className="text-yellow-300" size={20} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-white">2024</div>
                <div className="text-yellow-200 font-medium text-sm sm:text-base">Year Established</div>
              </div>
            </div>
            <div className="mt-12 sm:mt-16 animate-slide-up px-2">
              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-white/20">
                <p className="text-yellow-300 text-base sm:text-lg font-medium mb-2">Our Guiding Principle</p>
                <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold italic leading-tight">
                  "Walk together, talk together, and act with one mind"
                </p>
                <div className="w-12 sm:w-16 h-1 bg-yellow-400 mx-auto mt-3 sm:mt-4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-10 h-10 sm:w-16 sm:h-16 bg-white/5 rounded-full animate-bounce"></div>
      </section>

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
                  href="/events/valentine-2026"
                  onClick={() => setShowUpcoming(false)}
                  className="group rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 font-semibold text-rose-700 flex items-center justify-between hover:bg-rose-100 transition"
                >
                  <span>Valentine Soirée 2026</span>
                  <span className="text-[11px] font-bold uppercase tracking-wide group-hover:translate-x-1 transition">
                    View &rarr;
                  </span>
                </Link>
                <Link
                  href="/events/goa"
                  onClick={() => setShowUpcoming(false)}
                  className="group rounded-xl border border-pink-300 bg-pink-50 px-4 py-3 font-semibold text-pink-700 flex items-center justify-between hover:bg-pink-100 transition"
                >
                  <span>Goa Escape</span>
                  <span className="text-[11px] font-bold uppercase tracking-wide group-hover:translate-x-1 transition">
                    Explore &rarr;
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