'use client'

import { EVENT_NAME } from '../khelotsav-2026/constants'

export default function HeroTitleCard() {
  const [brand, year] = EVENT_NAME.includes('2026')
    ? [EVENT_NAME.replace(/\s*2026\s*$/, '').trim(), '2026']
    : [EVENT_NAME, null]

  return (
    <>
      <div className="htc-enter relative mx-auto w-full max-w-md sm:max-w-lg">
        {/* Animated rainbow border */}
        <div className="htc-border absolute -inset-[1.5px] rounded-[1.4rem] sm:rounded-[1.7rem]" aria-hidden="true" />

        {/* Dark card — stands out against the vivid hero gradient */}
        <div className="relative overflow-hidden rounded-[1.3rem] border border-white/10 bg-slate-950/85 px-6 py-5 text-center backdrop-blur-2xl sm:rounded-[1.6rem] sm:px-8 sm:py-7"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset' }}>

          {/* Ambient colour orbs */}
          <div className="htc-orb-1 pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl" aria-hidden="true" />
          <div className="htc-orb-2 pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-orange-500/20 blur-2xl" aria-hidden="true" />
          <div className="htc-orb-3 pointer-events-none absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-xl" aria-hidden="true" />

          {/* Shimmer sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
            <div className="htc-shimmer absolute inset-0" />
          </div>

          <div className="relative z-10">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-2">
              <span className="htc-dot h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300 sm:text-[11px] sm:tracking-[0.3em]">
                Indoor Sports Festival
              </p>
              <span className="htc-dot h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            </div>

            {/* Title */}
            <h1 className="mt-3 text-center">
              <span className="htc-title block text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.85rem] lg:text-[2.1rem]">
                {brand}
              </span>
              {year && (
                <span className="htc-badge mt-2 inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 via-orange-500 to-emerald-400 px-4 py-0.5 text-sm font-extrabold tracking-widest text-white sm:px-5 sm:text-base">
                  {year}
                </span>
              )}
            </h1>

            {/* Animated streak */}
            <div className="mx-auto mt-4 h-[3px] w-24 overflow-hidden rounded-full bg-white/10 sm:w-32">
              <div className="htc-streak h-full w-full rounded-full bg-gradient-to-r from-orange-400 via-sky-400 to-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .htc-enter {
          animation: htcFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .htc-border {
          background: linear-gradient(135deg, #38bdf8, #f97316, #22c55e, #38bdf8);
          background-size: 300% 300%;
          animation: htcBorderSpin 5s ease infinite;
          border-radius: inherit;
        }

        .htc-orb-1 { animation: htcOrb 7s ease-in-out infinite; }
        .htc-orb-2 { animation: htcOrb 8s ease-in-out infinite reverse; }
        .htc-orb-3 { animation: htcOrb 6s ease-in-out infinite 1s; }

        .htc-shimmer {
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.07) 50%, transparent 62%);
          animation: htcShimmer 4s ease-in-out infinite;
        }

        .htc-dot { animation: htcDot 2s ease-in-out infinite; }

        .htc-title {
          background: linear-gradient(120deg, #22d3ee 0%, #fb923c 40%, #34d399 75%, #22d3ee 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: htcTitleShine 5s linear infinite;
        }

        .htc-badge {
          animation: htcBadgeGlow 3s ease-in-out infinite;
        }

        .htc-streak {
          animation: htcStreakSlide 2.8s ease-in-out infinite;
        }

        @keyframes htcFadeUp {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes htcBorderSpin {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes htcOrb {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(6px, -5px); }
        }
        @keyframes htcShimmer {
          0%       { transform: translateX(-100%); }
          45%, 100% { transform: translateX(200%); }
        }
        @keyframes htcDot {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes htcTitleShine {
          to { background-position: 200% center; }
        }
        @keyframes htcBadgeGlow {
          0%, 100% { box-shadow: 0 4px 16px rgba(249,115,22,0.4); }
          50%       { box-shadow: 0 4px 22px rgba(14,165,233,0.5); }
        }
        @keyframes htcStreakSlide {
          0%, 100% { transform: translateX(-30%); }
          50%       { transform: translateX(30%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .htc-enter, .htc-border, .htc-orb-1, .htc-orb-2, .htc-orb-3,
          .htc-shimmer, .htc-dot, .htc-title, .htc-badge, .htc-streak {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}
