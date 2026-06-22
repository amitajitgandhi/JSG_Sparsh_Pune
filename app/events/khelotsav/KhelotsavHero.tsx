'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { EVENT_NAME, sports } from '../khelotsav-2026/constants'

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

const tickerItems = [...sports, ...sports].map(s => ({
  name:  s.name,
  emoji: sportEmojis[s.name] ?? '🎮',
}))

export default function KhelotsavHero() {
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ball = ballRef.current
    if (!ball) return

    const SIZE = 26
    let x = 80
    let y = 140
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
    <>
      {/* ── Bouncing ball ─────────────────────────────────────────────────── */}
      <div ref={ballRef} className="kh-ball" aria-hidden="true" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[240px] w-full sm:h-[290px] md:h-[330px]">
          <Image
            src="/images/khelotsav-indoor-sports.svg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(67,56,202,0.82) 0%, rgba(37,99,235,0.72) 35%, rgba(234,88,12,0.60) 75%, rgba(5,150,105,0.55) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f8faff] dark:from-gray-950 to-transparent" />

          {/* Floating sport emojis */}
          <div className="kh-floats pointer-events-none absolute inset-0" aria-hidden="true">
            {['🏓','♟️','🏸','🎯','🏐','💪','🎾','🏃','🥄'].map((e, i) => (
              <span key={i} className="kh-float-emoji"
                style={{ left: `${7 + i * 10}%`, animationDelay: `${i * 0.6}s`, fontSize: `${18 + (i % 3) * 6}px` }}>
                {e}
              </span>
            ))}
          </div>

          {/* Title */}
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

      {/* ── Sports ticker ─────────────────────────────────────────────────── */}
      <div className="kh-ticker-wrap border-y border-slate-900/10 bg-slate-900 py-2.5">
        <div className="kh-ticker-track">
          {tickerItems.map((s, i) => (
            <span key={i} className="kh-ticker-item">{s.emoji} {s.name}</span>
          ))}
        </div>
      </div>

      {/* ── Shared kh-* styles ────────────────────────────────────────────── */}
      <style jsx global>{`
        .kh-ball {
          position: fixed; top: 0; left: 0;
          width: 26px; height: 26px;
          border-radius: 50%;
          pointer-events: none; z-index: 50; will-change: transform;
          background: radial-gradient(circle at 35% 32%, #86efac 0%, #22c55e 45%, #15803d 100%);
          box-shadow: 0 0 10px rgba(34,197,94,0.7), 0 0 22px rgba(34,197,94,0.4), inset 0 -3px 6px rgba(0,0,0,0.2);
        }
        .kh-root {
          background: linear-gradient(160deg, #f0f7ff 0%, #ffffff 40%, #fff8f0 80%, #f0fdf8 100%);
        }
        .dark .kh-root {
          background: linear-gradient(160deg, #0f172a 0%, #111827 40%, #0f172a 80%, #111827 100%);
        }
        .kh-hero-title {
          text-shadow: 0 2px 20px rgba(0,0,0,0.35);
          animation: khHeroIn 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }
        .kh-dot { animation: khDot 2s ease-in-out infinite; }
        .kh-year-badge { animation: khBadgeGlow 3s ease-in-out infinite; }
        .kh-streak { animation: khStreakSlide 2.8s ease-in-out infinite; }
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
        .kh-float-emoji {
          position: absolute; bottom: -10px;
          animation: khFloat 6s ease-in-out infinite;
          opacity: 0; user-select: none; pointer-events: none;
        }
        @keyframes khFloat {
          0%   { opacity: 0;    transform: translateY(0) rotate(0deg); }
          15%  { opacity: 0.6; }
          85%  { opacity: 0.25; }
          100% { opacity: 0;    transform: translateY(-220px) rotate(18deg); }
        }
        .kh-ticker-wrap { overflow: hidden; white-space: nowrap; }
        .kh-ticker-track { display: inline-flex; animation: khTicker 30s linear infinite; }
        .kh-ticker-item {
          display: inline-block; padding: 0 1.75rem;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.92);
        }
        .kh-ticker-item::after { content: '·'; margin-left: 1.75rem; color: rgba(255,255,255,0.5); }
        @keyframes khTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .kh-info-card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .kh-info-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.09); }
        .kh-stat-emoji { animation: khStatBounce 3s ease-in-out infinite; }
        @keyframes khStatBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        .kh-cta { transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease; }
        .kh-cta:hover { transform: translateY(-5px) scale(1.025); box-shadow: var(--cta-glow); }
        .kh-cta-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          opacity: 0.4; mix-blend-mode: overlay;
        }
        .kh-cta-sheen { background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%); }
        .kh-cta:hover .kh-cta-sheen { animation: khSheen 0.55s ease forwards; }
        .kh-cta-icon { transition: transform 0.25s ease; }
        .kh-cta:hover .kh-cta-icon { transform: scale(1.12); }
        .kh-cta-arrow { transition: transform 0.2s ease; }
        .kh-cta:hover .kh-cta-arrow { transform: translateX(3px); }
        @keyframes khSheen {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
        .kh-section-label {
          position: relative; display: inline-block; left: 50%; transform: translateX(-50%);
        }
        .kh-section-label::after {
          content: ''; display: block; margin: 6px auto 0;
          height: 3px; width: 36px; border-radius: 99px;
          background: linear-gradient(90deg, #0ea5e9, #f97316);
        }
        @media (prefers-reduced-motion: reduce) {
          .kh-float-emoji, .kh-ticker-track, .kh-stat-emoji,
          .kh-cta, .kh-cta-sheen { animation: none !important; }
        }
      `}</style>
    </>
  )
}
