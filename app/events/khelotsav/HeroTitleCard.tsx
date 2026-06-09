'use client'

import { Sparkles, Trophy } from 'lucide-react'
import { EVENT_NAME } from '../khelotsav-2026/constants'

export default function HeroTitleCard() {
  const [brand, year] = EVENT_NAME.includes('2026')
    ? [EVENT_NAME.replace(/\s*2026\s*$/, '').trim(), '2026']
    : [EVENT_NAME, null]

  return (
    <>
      <div className="hero-card-enter relative mx-auto w-full max-w-md sm:max-w-lg">
        {/* Animated gradient border */}
        <div className="hero-border-glow absolute -inset-[1px] rounded-[1.35rem] sm:rounded-[1.65rem]" aria-hidden="true" />

        <div className="relative overflow-hidden rounded-[1.3rem] border border-white/60 bg-white/75 p-5 text-center shadow-[0_8px_32px_rgba(14,165,233,0.12),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-slate-600/50 dark:bg-slate-900/75 dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] sm:rounded-[1.6rem] sm:p-7">
          {/* Ambient orbs */}
          <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-sky-400/25 blur-2xl hero-orb-1 dark:bg-cyan-500/20" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-orange-400/25 blur-2xl hero-orb-2 dark:bg-orange-500/15" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-xl hero-orb-3 dark:bg-emerald-500/15" aria-hidden="true" />

          {/* Shimmer sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
            <div className="hero-shimmer absolute inset-0 -translate-x-full" />
          </div>

          <div className="relative z-10">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-2">
              <span className="hero-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-600 dark:text-cyan-300 sm:text-[11px] sm:tracking-[0.28em]">
                Indoor Sports Festival
              </p>
              <span className="hero-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden="true" />
            </div>

            {/* Title */}
            <h1 className="mt-3 text-center">
              <span className="hero-title-shine block text-[1.4rem] font-black leading-tight tracking-tight sm:text-[1.75rem] lg:text-[2rem]">
                {brand}
              </span>
              {year ? (
                <span className="mt-2 inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 via-orange-500 to-emerald-500 px-3.5 py-0.5 text-sm font-extrabold tracking-widest text-white shadow-md hero-year-badge sm:px-4 sm:text-base">
                  {year}
                </span>
              ) : null}
            </h1>

            {/* Animated streak */}
            <div className="mx-auto mt-4 h-1 w-24 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80 sm:w-32">
              <div className="hero-streak h-full w-full rounded-full bg-gradient-to-r from-orange-400 via-sky-500 to-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-card-enter {
          animation: heroFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-border-glow {
          background: linear-gradient(
            135deg,
            #38bdf8,
            #f97316,
            #22c55e,
            #38bdf8
          );
          background-size: 300% 300%;
          animation: borderSpin 6s ease infinite;
          opacity: 0.85;
        }

        :global(.dark) .hero-border-glow {
          opacity: 0.65;
        }

        .hero-orb-1 {
          animation: orbDrift 7s ease-in-out infinite;
        }
        .hero-orb-2 {
          animation: orbDrift 8s ease-in-out infinite reverse;
        }
        .hero-orb-3 {
          animation: orbDrift 6s ease-in-out infinite 1s;
        }

        .hero-shimmer {
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 60%
          );
          animation: shimmerSweep 4.5s ease-in-out infinite;
        }

        :global(.dark) .hero-shimmer {
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 60%
          );
        }

        .hero-pulse-dot {
          animation: dotPulse 2s ease-in-out infinite;
        }

        .hero-sparkle {
          animation: sparklePop 2.4s ease-in-out infinite;
        }

        .hero-float {
          animation: gentleFloat 3s ease-in-out infinite;
        }
        .hero-float-delay {
          animation: gentleFloat 3s ease-in-out infinite 0.6s;
        }

        .hero-title-shine {
          background: linear-gradient(
            120deg,
            #0284c7 0%,
            #ea580c 35%,
            #059669 70%,
            #0284c7 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: titleShine 5s linear infinite;
        }

        :global(.dark) .hero-title-shine {
          background: linear-gradient(
            120deg,
            #22d3ee 0%,
            #fb923c 35%,
            #34d399 70%,
            #22d3ee 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .hero-year-badge {
          animation: badgeGlow 3s ease-in-out infinite;
        }

        .hero-streak {
          animation: streakSlide 2.8s ease-in-out infinite;
        }

        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes borderSpin {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes orbDrift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(6px, -4px);
          }
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-100%);
          }
          45%,
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes dotPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes sparklePop {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.06) rotate(6deg);
          }
        }

        @keyframes gentleFloat {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        @keyframes titleShine {
          to {
            background-position: 200% center;
          }
        }

        @keyframes badgeGlow {
          0%,
          100% {
            box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
          }
          50% {
            box-shadow: 0 4px 20px rgba(14, 165, 233, 0.45);
          }
        }

        @keyframes streakSlide {
          0%,
          100% {
            transform: translateX(-30%);
          }
          50% {
            transform: translateX(30%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-card-enter,
          .hero-border-glow,
          .hero-orb-1,
          .hero-orb-2,
          .hero-orb-3,
          .hero-shimmer,
          .hero-pulse-dot,
          .hero-sparkle,
          .hero-float,
          .hero-float-delay,
          .hero-title-shine,
          .hero-year-badge,
          .hero-streak {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}
