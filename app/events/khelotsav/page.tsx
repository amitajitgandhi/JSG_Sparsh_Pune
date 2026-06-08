'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  CalendarDays, Clock3, MapPinnedIcon, Trophy, Dumbbell, Medal,
  Sparkles, Target, Users, Zap, Flame, Activity, PartyPopper,
} from 'lucide-react'

const EVENT_NAME = 'SPARSH KHELOTSAV 2026'

const highlights = [
  { icon: Flame,        label: 'Sports',       emoji: '🔥' },
  { icon: Activity,     label: 'Energy',        emoji: '💪' },
  { icon: Medal,        label: 'Competition',   emoji: '🏅' },
  { icon: Users,        label: 'Team Spirit',   emoji: '🤝' },
  { icon: PartyPopper,  label: 'Unlimited Fun', emoji: '🎊' },
  { icon: Dumbbell,     label: 'Bonding',       emoji: '🤜' },
]

const sportsList = [
  'Carrom', 'Chess', 'Table Tennis', 'Badminton', 'Pickle Ball',
  'Kho Kho', 'Lemon & Spoon Race', 'Sack Race', 'Tug of War',
  'Volleyball', 'Dodge Ball', 'Three-Legged Race',
]

const ctaLinks = [
  {
    href:    '/events/khelotsav-2026',
    label:   'Register Now',
    sub:     'Fill in your details & secure your spot',
    emoji:   '📝',
    badge:   'Closed',
    gradient:'from-orange-500 to-orange-600',
    glow:    'hover:shadow-orange-200',
  },
  {
    href:    '/events/tournament/khelotsav-2026/teams',
    label:   'Team Players',
    sub:     'Browse participants team-wise',
    emoji:   '👥',
    badge:   'New',
    gradient:'from-violet-500 to-violet-600',
    glow:    'hover:shadow-violet-200',
  },
  {
    href:    '/events/tournament/khelotsav-2026/leaderboard',
    label:   'Leaderboard',
    sub:     'Real-time standings & medal tally',
    emoji:   '🏆',
    badge:   'Live',
    gradient:'from-emerald-500 to-emerald-600',
    glow:    'hover:shadow-emerald-200',
  },
  {
    href:    '/events/tournament/khelotsav-2026/results',
    label:   'Event Results',
    sub:     'Scores grouped by sport & category',
    emoji:   '📋',
    badge:   'Updated',
    gradient:'from-sky-500 to-sky-600',
    glow:    'hover:shadow-sky-200',
  },
]

export default function KhelotsavHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* ── Banner ── */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
            <Image
              src="/images/khelotsav-indoor-sports.svg"
              alt="SPARSH KHELOTSAV 2026"
              width={1200}
              height={480}
              className="w-full h-auto object-cover object-center group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* ── Title & info ── */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-600 mb-2">Indoor Sports Festival</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-orange-500 to-emerald-600 mb-3 px-2 leading-tight">
            {EVENT_NAME}
          </h1>
          <div className="mx-auto mb-5 h-1 w-24 rounded-full bg-gradient-to-r from-orange-400 via-sky-500 to-emerald-400" />
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 px-4 leading-relaxed">
            Gear up for an action-packed day of spirited indoor games, vibrant energy, healthy rivalry, stronger bonds, and nonstop celebration. Whether you&apos;re competing or cheering — Khelotsav is for everyone!
          </p>

          {/* Event info pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            <div className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm">
              <CalendarDays size={13} className="text-sky-500" /> 21 June 2026
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm">
              <Clock3 size={13} className="text-emerald-500" /> 8:00 AM – 6:00 PM
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm">
              <MapPinnedIcon size={13} className="text-orange-500" /> Downtown Sports Complex
            </div>
          </div>

          {/* ── 4 CTA tiles (2×2 on mobile, 4-col on lg) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto px-2">
            {ctaLinks.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={`group relative flex flex-col items-center rounded-2xl bg-gradient-to-br ${cta.gradient} text-white p-4 sm:p-5 shadow-lg hover:shadow-xl ${cta.glow} hover:-translate-y-1 active:scale-[0.97] transition-all duration-300`}
              >
                {/* Badge */}
                <span className="absolute top-2.5 right-2.5 rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
                  {cta.badge}
                </span>
                {/* Icon bubble */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner">
                  {cta.emoji}
                </div>
                {/* Label */}
                <p className="text-sm font-extrabold leading-tight text-center">{cta.label}</p>
                <p className="mt-1 text-[10px] sm:text-xs text-white/75 leading-snug text-center">{cta.sub}</p>
                {/* Arrow */}
                <div className="mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Highlights grid ── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg border border-white/60 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">Why Khelotsav?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Icon size={15} className="text-sky-500 shrink-0" />
                  <span className="text-gray-700 font-medium">{item.emoji} {item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Note ── */}
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-700 shadow-sm">
          <div className="flex gap-2">
            <span className="mt-0.5 shrink-0">ℹ️</span>
            <p>
              The final list of games may be modified depending on participation count, venue availability, and event committee decisions. Further instructions will be shared closer to the event date.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
