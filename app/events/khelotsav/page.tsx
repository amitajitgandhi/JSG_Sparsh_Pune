'use client'

import Link from 'next/link'
import {
  CalendarDays, Clock3, MapPinnedIcon,
  Trophy, Users, ClipboardList, Lock, ArrowRight, Medal, Users2, BookOpen, Star,
} from 'lucide-react'
import {
  REGISTRATION_CLOSED_STATUS,
  sports,
} from '../khelotsav-2026/constants'
import KhelotsavHero from './KhelotsavHero'

const registrationClosed =
  String(REGISTRATION_CLOSED_STATUS || '').trim().toUpperCase() === 'YES'

// ── Sport emojis (kept for the sports grid below) ────────────────────────────
const sportEmojis: Record<string, string> = {
  'Carrom':             '🎯',
  'Chess':              '♟️',
  'Table Tennis':       '🏓',
  'Badminton':          '🏸',
  'Pickle Ball':        '🎾',
  'Kho Kho':            '🏃',
  'Lemon & Spoon Race': '🥄',
  'Sack Race':          '👟',
  'Tug of War':         '💪',
  'Volleyball':         '🏐',
  'Dodge Ball':         '🔴',
  'Three-Legged Race':  '🦵',
}

// ── CTA cards ────────────────────────────────────────────────────────────────
const actionLinks = [
  {
    href: registrationClosed ? '#' : '/events/khelotsav-2026',
    label: registrationClosed ? 'Registration Closed' : 'Register Now',
    sub: registrationClosed ? 'No longer accepting entries' : 'Secure your spot today',
    icon: registrationClosed ? <Lock size={22} /> : <ClipboardList size={22} />,
    accent: registrationClosed ? 'from-slate-400 to-gray-500' : 'from-orange-500 to-amber-400',
    disabled: registrationClosed,
  },
  {
    href: '/events/tournament/khelotsav-2026/teams',
    label: 'Teams',
    sub: 'Browse all teams',
    icon: <Users size={22} />,
    accent: 'from-sky-500 to-blue-600',
  },
  {
    href: '/events/tournament/khelotsav-2026/players',
    label: 'Players',
    sub: 'Browse all participants',
    icon: <Users2 size={22} />,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/events/tournament/khelotsav-2026/leaderboard',
    label: 'Leaderboard',
    sub: 'Live standings & medal tally',
    icon: <Trophy size={22} />,
    accent: 'from-violet-500 to-purple-600',
  },
  {
    href: '/events/tournament/khelotsav-2026/results',
    label: 'Event Results',
    sub: 'Scores by sport & category',
    icon: <Medal size={22} />,
    accent: 'from-rose-500 to-pink-600',
  },
  {
    href: '/events/khelotsav/rules-regulations',
    label: 'Rules & Regs',
    sub: 'Game rules for all sports',
    icon: <BookOpen size={22} />,
    accent: 'from-gray-700 to-red-300',
  },
  {
    href: '/events/khelotsav/k26-sign-off',
    label: 'K26 Sign-Off',
    sub: 'Champions & thank you',
    icon: <Star size={22} />,
    accent: 'from-yellow-500 to-amber-400',
  },
]

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: '12+', label: 'Sports',  emoji: '🏅', color: '#0ea5e9' },
  { value: '8',   label: 'Teams',   emoji: '🛡️', color: '#f97316' },
  { value: '250+', label: 'Players', emoji: '⚡', color: '#10b981' },
]

export default function KhelotsavHubPage() {
  return (
    <div className="kh-root min-h-screen overflow-x-hidden">

      <KhelotsavHero />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-lg px-4 pb-14 sm:max-w-2xl sm:px-6 lg:max-w-5xl">

        {/* ── Event info bar ──────────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: CalendarDays, label: 'Date',  value: '21 June 2026',       color: '#0ea5e9', bg: '#e0f2fe' },
            { icon: Clock3,       label: 'Time',  value: '8:00 AM – 6:00 PM', color: '#f97316', bg: '#fff7ed' },
            { icon: MapPinnedIcon,label: 'Venue', value: 'Downtown Sports Complex', color: '#10b981', bg: '#ecfdf5' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="kh-info-card flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tagline ─────────────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-sm leading-relaxed text-slate-500 sm:text-base">
          An action-packed day of spirited indoor games, vibrant energy, healthy rivalry, and stronger bonds.{' '}
          <span className="font-semibold text-slate-700">Whether you&apos;re competing or cheering — Khelotsav is for everyone.</span>
        </p>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map(s => (
            <div key={s.label} className="kh-stat-card rounded-2xl bg-white px-3 py-5 text-center shadow-sm"
              style={{ border: `2px solid ${s.color}` }}>
              <div className="kh-stat-emoji text-2xl sm:text-3xl">{s.emoji}</div>
              <div className="mt-2 text-2xl font-black sm:text-3xl" style={{ color: s.color }}>{s.value}</div>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── CTA cards ───────────────────────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="kh-section-label mb-5 text-center text-base font-black uppercase tracking-widest text-slate-800 sm:text-lg">
            Explore the Event
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {actionLinks.map(cta => (
              cta.disabled ? (
                <div key={cta.label} className="cursor-not-allowed opacity-60">
                  <div className={`kh-cta group relative flex min-h-[140px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white sm:p-5 ${cta.accent}`}>
                    <div className="kh-cta-grain absolute inset-0" />
                    <div className="relative z-10 flex flex-col items-center gap-2.5 text-center">
                      <div className="kh-cta-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                        {cta.icon}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold leading-tight">{cta.label}</p>
                        <p className="mt-0.5 text-[11px] text-white/70">{cta.sub}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={cta.label} href={cta.href}>
                  <div className={`kh-cta group relative flex min-h-[140px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white sm:p-5 ${cta.accent}`}>
                    <div className="kh-cta-grain absolute inset-0" />
                    <div className="kh-cta-sheen pointer-events-none absolute inset-0" />
                    <div className="relative z-10 flex flex-col items-center gap-2.5 text-center">
                      <div className="kh-cta-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                        {cta.icon}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold leading-tight">{cta.label}</p>
                        <p className="mt-0.5 text-[11px] text-white/75">{cta.sub}</p>
                      </div>
                      <div className="kh-cta-arrow flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        </section>

        {/* ── Sports grid ─────────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="kh-section-label mb-5 text-center text-base font-black uppercase tracking-widest text-slate-800 sm:text-lg">
            Sports on the Court
          </h2>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
            {sports.map(s => (
              <div key={s.name}
                className="kh-sport-chip group flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <span className="text-2xl transition-transform duration-300 group-hover:scale-125">
                  {sportEmojis[s.name] ?? '🎮'}
                </span>
                <p className="text-[11px] font-semibold leading-tight text-slate-600">{s.name}</p>
                {(s as { subtitle?: string }).subtitle && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                    {(s as { subtitle?: string }).subtitle}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Khelotsav ───────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="kh-section-label mb-5 text-center text-base font-black uppercase tracking-widest text-slate-800 sm:text-lg">
            Why Khelotsav?
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {[
              { emoji: '🔥', label: 'High Energy Sports',   bg: '#fff7ed' },
              { emoji: '💪', label: 'Healthy Competition',  bg: '#f0fdf4' },
              { emoji: '🏅', label: 'Medals & Glory',       bg: '#fefce8' },
              { emoji: '🤝', label: 'Team Spirit',          bg: '#eff6ff' },
              { emoji: '🎊', label: 'Unlimited Fun',        bg: '#fdf4ff' },
              { emoji: '❤️', label: 'Stronger Bonds',       bg: '#fff1f2' },
            ].map(item => (
              <div key={item.label}
                className="kh-why-card flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ background: item.bg }}>{item.emoji}</span>
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Note ────────────────────────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-700">
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <p className="leading-relaxed">
              The final list of games may be modified depending on participation count, venue availability,
              and event committee decisions. Further instructions will be shared closer to the event date.
            </p>
          </div>
        </div>

        {/* ── Back ────────────────────────────────────────────────────────── */}
        <p className="mt-8 text-center">
          <Link href="/events"
            className="text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600">
            ← All Events
          </Link>
        </p>
      </div>

    </div>
  )
}
