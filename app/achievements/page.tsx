'use client'

import Link from 'next/link'
import { Trophy, Award, Users, Mic, Star } from 'lucide-react'

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 text-white px-5 py-2 rounded-2xl shadow">
              <Trophy size={20} />
              <span className="font-bold text-sm sm:text-base">Achievements</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-fuchsia-700 to-pink-700">JSG Pune Sparsh Highlights</h1>
            <p className="mt-2 text-sm sm:text-base text-indigo-800">Milestones and recognitions earned by our community</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-white border border-indigo-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-indigo-600" size={20} />
                <h2 className="text-base font-bold">Best Debut Group Award - 2024</h2>
              </div>
              <p className="text-sm text-gray-700">Our biggest achievement so far – honored as the Best Debut Group, reflecting our impact and unity since inception.</p>
            </div>

            <div className="rounded-2xl bg-white border border-indigo-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-indigo-600" size={20} />
                              <h2 className="text-base font-bold">Pune Parivar Cricket Tournament 2025-2026 </h2>
              </div>
              <p className="text-sm text-gray-700">Crowned champions in Male Category and Runner-Up in Kids Category through teamwork, discipline, and sportsmanship.</p>
            </div>

            <div className="rounded-2xl bg-white border border-indigo-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Star className="text-indigo-600" size={20} />
                <h2 className="text-base font-bold">State & Federation Representation</h2>
              </div>
              <p className="text-sm text-gray-700">Four Sparsh players proudly represented at State and Federation level tournaments 2025 - 2026.</p>
            </div>

            <div className="rounded-2xl bg-white border border-indigo-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Mic className="text-indigo-600" size={20} />
                <h2 className="text-base font-bold">Voice of JSG</h2>
              </div>
              <p className="text-sm text-gray-700">Runner-Up Team  + achieved a Top 3 solo performance accolade in the prestigious Voice of JSG competition.</p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex gap-3">
            <Link href="/" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2">Back to Home</Link>
            <Link href="/events" className="rounded-lg border border-indigo-200 bg-white text-indigo-700 text-sm font-semibold px-4 py-2 hover:bg-indigo-50">View Events</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
