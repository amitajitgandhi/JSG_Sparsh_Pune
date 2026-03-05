'use client'

import Link from 'next/link'
import { Calendar, PartyPopper, Clock, MapPin } from 'lucide-react'

export default function UpcomingEvent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 bg-yellow-400 px-4 py-2 rounded-2xl border border-yellow-500 shadow text-blue-900">
              <PartyPopper size={20} />
              <span className="font-semibold text-sm sm:text-base">Special Event • Coming Soon</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Our Next Big Event Is On The Way!
            </h1>
            <p className="mt-3 text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
              We are crafting an energetic gathering with immersive experiences, music, games, and unforgettable memories.
              Dates, venue and registration details will be announced here shortly.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
            <div className="rounded-2xl bg-white border border-white/80 p-4 flex items-center gap-3 text-blue-800">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700"><Calendar size={20} /></div>
              <div>
                <div className="text-xs text-blue-600">Tentative Window</div>
                <div className="text-sm font-semibold text-blue-900">22 March 2026</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-white/80 p-4 flex items-center gap-3 text-blue-800">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700"><Clock size={20} /></div>
              <div>
                <div className="text-xs text-blue-600">Time</div>
                <div className="text-sm font-semibold text-blue-900">5pm to 11pm</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-white/80 p-4 flex items-center gap-3 text-blue-800">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700"><MapPin size={20} /></div>
              <div>
                <div className="text-xs text-blue-600">Venue</div>
                <div className="text-sm font-semibold text-blue-900">Revealing soon</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-yellow-200 text-sm font-bold uppercase mb-2">What to expect</h2>
            <ul className="list-disc list-inside text-blue-100 text-sm space-y-1">
              <li>Engaging theme with dress‑code fun</li>
              <li>Interactive couple activities and team challenges</li>
              <li>Music, dance, dinner and photo moments</li>
              <li>Limited seats — early registration recommended</li>
            </ul>
            <p className="mt-4 text-sm text-blue-100">
              Keep an eye on this page and our WhatsApp announcements for the registration link.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/events" className="rounded-lg bg-white text-blue-700 font-semibold px-5 py-2 shadow hover:shadow-md transition text-sm text-center">
                Browse Past Events
              </Link>
              <Link href="/" className="rounded-lg bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-semibold px-5 py-2 shadow hover:shadow-md transition text-sm text-center">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
