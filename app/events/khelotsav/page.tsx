'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CalendarDays, Clock3, MapPinnedIcon,
  Trophy, Users, ClipboardList, Lock, ArrowRight, Medal, Users2, BookOpen, Star,
} from 'lucide-react'
import {
  REGISTRATION_CLOSED_STATUS,
  EVENT_NAME,
  sports,
} from '../khelotsav-2026/constants'

const registrationClosed =
  String(REGISTRATION_CLOSED_STATUS || '').trim().toUpperCase() === 'YES'

// ── Sport emojis ─────────────────────────────────────────────────────────────
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

// ── Ticker (doubled for seamless loop) ───────────────────────────────────────
const tickerItems = [...sports, ...sports].map(s => ({
  name: s.name,
  emoji: sportEmojis[s.name] ?? '🎮',
}))

export default function KhelotsavHubPage() {
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ball = ballRef.current
    if (!ball) return

    const SIZE = 26
    let x = 80
    let y = 140
    // Random-ish starting angle — not perfectly 45° so it doesn't loop predictably
    let vx = 1.8
    let vy = 2.2
    let raf: number

    const step = () => {
      x += vx
      y += vy

      const maxX = window.innerWidth  - SIZE
      const maxY = window.innerHeight - SIZE

      if (x <= 0)    { x = 0;    vx =  Math.abs(vx) }
      if (x >= maxX) { x = maxX; vx = -Math.abs(vx) }
      if (y <= 0)    { y = 0;    vy =  Math.abs(vy) }
      if (y >= maxY) { y = maxY; vy = -Math.abs(vy) }

      ball.style.transform = `translate(${x}px, ${y}px)`
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="kh-root min-h-screen overflow-x-hidden">

      {/* ── Bouncing ball ─────────────────────────────────────────────────── */}
      <div
        ref={ballRef}
        className="kh-ball"
        aria-hidden="true"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[240px] w-full sm:h-[290px] md:h-[330px]">
          {/* Sports image */}
          <Image
            src="/images/khelotsav-indoor-sports.svg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          {/* Vibrant gradient overlay — deep indigo → blue → orange tones, NOT black */}
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(67,56,202,0.82) 0%, rgba(37,99,235,0.72) 35%, rgba(234,88,12,0.60) 75%, rgba(5,150,105,0.55) 100%)',
            }}
          />
          {/* Bottom fade into page */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f8faff] to-transparent" />

          {/* Floating sport emojis */}
          <div className="kh-floats pointer-events-none absolute inset-0" aria-hidden="true">
            {['🏓','♟️','🏸','🎯','🏐','💪','🎾','🏃','🥄'].map((e, i) => (
              <span key={i} className="kh-float-emoji"
                style={{ left: `${7 + i * 10}%`, animationDelay: `${i * 0.6}s`, fontSize: `${18 + (i % 3) * 6}px` }}>
                {e}
              </span>
            ))}
          </div>

          {/* Title — directly on hero, no card wrapper */}
          <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
                <span className="kh-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle mr-1.5" />
                Indoor Sports Festival
                <span className="kh-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle ml-1.5" />
              </p>
              <h1 className="kh-hero-title text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                {EVENT_NAME.replace(/\s*2026\s*$/, '').trim()}
              </h1>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="kh-year-badge inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 via-orange-500 to-emerald-400 px-4 py-1 text-sm font-extrabold tracking-widest text-white shadow-lg">
                  2026
                </span>
              </div>
              <div className="mx-auto mt-4 h-[3px] w-20 overflow-hidden rounded-full bg-white/20">
                <div className="kh-streak h-full w-full rounded-full bg-gradient-to-r from-orange-400 via-sky-400 to-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sports ticker — keeps the "dark accent strip" feel ─────────────── */}
      <div className="kh-ticker-wrap border-y border-slate-900/10 bg-slate-900 py-2.5">
        <div className="kh-ticker-track">
          {tickerItems.map((s, i) => (
            <span key={i} className="kh-ticker-item">{s.emoji} {s.name}</span>
          ))}
        </div>
      </div>

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

      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style jsx global>{`
        /* ── Bouncing ball ── */
        .kh-ball {
          position: fixed;
          top: 0;
          left: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 50;
          will-change: transform;
          /* Glossy green ball */
          background: radial-gradient(circle at 35% 32%, #86efac 0%, #22c55e 45%, #15803d 100%);
          box-shadow:
            0 0 10px rgba(34, 197, 94, 0.7),
            0 0 22px rgba(34, 197, 94, 0.4),
            inset 0 -3px 6px rgba(0,0,0,0.2);
        }

        /* ── Page background: light, airy ── */
        .kh-root {
          background: linear-gradient(160deg, #f0f7ff 0%, #ffffff 40%, #fff8f0 80%, #f0fdf8 100%);
        }

        /* ── Hero title ── */
        .kh-hero-title {
          text-shadow: 0 2px 20px rgba(0,0,0,0.35);
          animation: khHeroIn 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }
        .kh-dot { animation: khDot 2s ease-in-out infinite; }
        .kh-year-badge {
          animation: khBadgeGlow 3s ease-in-out infinite;
        }
        .kh-streak {
          animation: khStreakSlide 2.8s ease-in-out infinite;
        }
        @keyframes khHeroIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes khDot {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes khBadgeGlow {
          0%, 100% { box-shadow: 0 4px 16px rgba(249,115,22,0.45); }
          50%       { box-shadow: 0 4px 22px rgba(14,165,233,0.55); }
        }
        @keyframes khStreakSlide {
          0%, 100% { transform: translateX(-30%); }
          50%       { transform: translateX(30%); }
        }

        /* ── Floating emojis ── */
        .kh-float-emoji {
          position: absolute;
          bottom: -10px;
          animation: khFloat 6s ease-in-out infinite;
          opacity: 0;
          user-select: none;
          pointer-events: none;
        }
        @keyframes khFloat {
          0%   { opacity: 0;    transform: translateY(0)     rotate(0deg); }
          15%  { opacity: 0.6; }
          85%  { opacity: 0.25; }
          100% { opacity: 0;    transform: translateY(-220px) rotate(18deg); }
        }

        /* ── Sports ticker ── */
        .kh-ticker-wrap { overflow: hidden; white-space: nowrap; }
        .kh-ticker-track {
          display: inline-flex;
          animation: khTicker 30s linear infinite;
        }
        .kh-ticker-item {
          display: inline-block;
          padding: 0 1.75rem;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
        }
        .kh-ticker-item::after {
          content: '·';
          margin-left: 1.75rem;
          color: rgba(255,255,255,0.5);
        }
        @keyframes khTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Info cards ── */
        .kh-info-card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .kh-info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.09);
        }

        /* ── Stat emoji bounce ── */
        .kh-stat-emoji { animation: khStatBounce 3s ease-in-out infinite; }
        @keyframes khStatBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }

        /* ── CTA cards ── */
        .kh-cta {
          transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease;
        }
        .kh-cta:hover {
          transform: translateY(-5px) scale(1.025);
          box-shadow: var(--cta-glow);
        }
        .kh-cta-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          opacity: 0.4;
          mix-blend-mode: overlay;
        }
        .kh-cta-sheen {
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%);
        }
        .kh-cta:hover .kh-cta-sheen {
          animation: khSheen 0.55s ease forwards;
        }
        .kh-cta-icon {
          transition: transform 0.25s ease;
        }
        .kh-cta:hover .kh-cta-icon {
          transform: scale(1.12);
        }
        .kh-cta-arrow {
          transition: transform 0.2s ease;
        }
        .kh-cta:hover .kh-cta-arrow {
          transform: translateX(3px);
        }
        @keyframes khSheen {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }

        /* ── Section label underline ── */
        .kh-section-label {
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);
        }
        .kh-section-label::after {
          content: '';
          display: block;
          margin: 6px auto 0;
          height: 3px;
          width: 36px;
          border-radius: 99px;
          background: linear-gradient(90deg, #0ea5e9, #f97316);
        }

        @media (prefers-reduced-motion: reduce) {
          .kh-float-emoji, .kh-ticker-track, .kh-stat-emoji,
          .kh-cta, .kh-cta-sheen { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
