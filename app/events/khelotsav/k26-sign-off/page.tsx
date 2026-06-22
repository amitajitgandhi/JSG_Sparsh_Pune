import Link from 'next/link'
import KhelotsavHero from '../KhelotsavHero'

const TEAMS = [
  { abbr: 'KS', name: 'Katariya Smashers',    owner: 'Mayur Karariya',  gradient: 'from-orange-500 to-amber-400' },
  { abbr: 'WW', name: 'Water World Warriors',  owner: 'Dilip Jain',      gradient: 'from-blue-500 to-cyan-400' },
  { abbr: 'LL', name: 'Lunkad Lions',          owner: 'Vipul Lunkad',    gradient: 'from-yellow-500 to-amber-400' },
  { abbr: 'SF', name: 'Saiyam Finpro',         owner: 'Piyush Rakhecha', gradient: 'from-violet-600 to-purple-500' },
  { abbr: 'AW', name: 'Arihant Warlocks',      owner: 'Sunil Patni',     gradient: 'from-red-500 to-rose-400' },
  { abbr: 'AR', name: 'Aarohi Enterprises',    owner: 'Rohan Shah',      gradient: 'from-pink-500 to-fuchsia-400' },
  { abbr: 'OS', name: 'Osian Super Kings',     owner: 'Dilip Jain',      gradient: 'from-emerald-500 to-teal-400' },
  { abbr: 'SW', name: 'Shanti Warriors',       owner: 'Nikhil Oswal',    gradient: 'from-indigo-600 to-sky-500' },
]

// Podium order: 2nd | 1st | 3rd (classic podium arrangement)
const PODIUM = [
  { rank: 2, name: 'Water World Warriors', owner: 'Dilip Jain',      points: 420, medal: '🥈', podiumClass: 'h-20 bg-gradient-to-b from-slate-300 to-gray-400', borderClass: 'border-slate-300', pointClass: 'text-slate-500' },
  { rank: 1, name: 'Katariya Smashers',    owner: 'Mayur Karariya',  points: 500, medal: '🥇', podiumClass: 'h-32 bg-gradient-to-b from-yellow-400 to-amber-500', borderClass: 'border-yellow-300', pointClass: 'text-amber-500' },
  { rank: 3, name: 'Lunkad Lions',         owner: 'Vipul Lunkad',    points: 385, medal: '🥉', podiumClass: 'h-14 bg-gradient-to-b from-orange-300 to-amber-400', borderClass: 'border-orange-300', pointClass: 'text-orange-500' },
]

const TOP3_SORTED = [
  { rank: 1, name: 'Katariya Smashers',    owner: 'Mayur Karariya',  points: 500, medal: '🥇', borderClass: 'border-yellow-300', pointClass: 'text-amber-500' },
  { rank: 2, name: 'Water World Warriors', owner: 'Dilip Jain',      points: 420, medal: '🥈', borderClass: 'border-slate-300',  pointClass: 'text-slate-500' },
  { rank: 3, name: 'Lunkad Lions',         owner: 'Vipul Lunkad',    points: 385, medal: '🥉', borderClass: 'border-orange-300', pointClass: 'text-orange-500' },
]

const SPORT_WINNERS = [
  { sport: 'Badminton',    icon: '🏸', winner: 'Lunkad Lions',        runnerUp: 'Katariya Smashers' },
  { sport: 'Table Tennis', icon: '🏓', winner: 'Katariya Smashers',   runnerUp: 'Aarohi Enterprises' },
  { sport: 'Carrom',       icon: '🎯', winner: 'Saiyam Finpro',       runnerUp: 'Katariya Smashers' },
  { sport: 'Chess',        icon: '♟️', winner: 'Water World Warriors', runnerUp: 'Aarohi Enterprises' },
  { sport: 'Tug of War',   icon: '💪', winner: 'Saiyam Finpro',       runnerUp: 'Water World Warriors' },
]

export default function K26SignOffPage() {
  return (
    <div className="kh-root min-h-screen overflow-x-hidden">

      <KhelotsavHero />

      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:max-w-4xl">

        {/* ── Thank you ──────────────────────────────────────────────────── */}
        <section className="mt-10 text-center">
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 sm:text-2xl">
            A Heartfelt Thank You 🙏
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            Khelotsav 2026 would not have been possible without the incredible support and generosity of our 8 team owners. Your sponsorship, enthusiasm, and team spirit transformed a vision into an unforgettable day of sportsmanship, camaraderie, and joy. On behalf of the entire JSG Sparsh Pune committee — <span className="font-bold text-gray-800 dark:text-gray-100">a big thank you from the bottom of our hearts!</span>
          </p>
        </section>

        {/* ── Team Sponsors ──────────────────────────────────────────────── */}
        <section className="mt-10">
          <h2 className="mb-5 text-center text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Our Team Sponsors
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEAMS.map(t => (
              <div
                key={t.abbr}
                className={`flex flex-col items-center rounded-2xl bg-gradient-to-br ${t.gradient} p-4 text-center text-white shadow-md`}
              >
                <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-sm font-black tracking-wide">
                  {t.abbr}
                </div>
                <p className="text-sm font-extrabold leading-tight">{t.name}</p>
                <p className="mt-1 text-[11px] text-white/80 font-medium">{t.owner}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Overall Champions ──────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="mb-1.5 text-center text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Overall Champions
          </h2>
          <p className="mb-10 text-center text-xs text-gray-400 dark:text-gray-500">
            Based on final leaderboard points across all sports
          </p>

          {/* Podium — desktop (2nd | 1st | 3rd) */}
          <div className="hidden sm:flex items-end justify-center gap-4">
            {PODIUM.map(t => (
              <div key={t.rank} className="flex flex-col items-center">
                <span className="mb-2 text-4xl">{t.medal}</span>
                <div className={`w-40 rounded-t-2xl ${t.podiumClass} flex items-start justify-center pt-3`}>
                  <span className="text-xs font-black text-white/80">#{t.rank}</span>
                </div>
                <div className={`w-40 rounded-b-2xl border-2 ${t.borderClass} bg-white dark:bg-gray-800 px-3 py-3.5 text-center shadow-md`}>
                  <p className="text-sm font-extrabold leading-tight text-gray-900 dark:text-white">{t.name}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{t.owner}</p>
                  <p className={`mt-2 text-2xl font-black ${t.pointClass}`}>{t.points}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5">points</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile — sorted 1st → 2nd → 3rd */}
          <div className="flex flex-col gap-3 sm:hidden">
            {TOP3_SORTED.map(t => (
              <div key={t.rank}
                className={`flex items-center gap-4 rounded-2xl border-2 ${t.borderClass} bg-white dark:bg-gray-800 px-4 py-4 shadow-md`}>
                <span className="text-3xl flex-shrink-0">{t.medal}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-900 dark:text-white truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.owner}</p>
                </div>
                <p className={`text-xl font-black flex-shrink-0 ${t.pointClass}`}>{t.points} pts</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sport Champions ────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="mb-1.5 text-center text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Sport Champions
          </h2>
          <p className="mb-8 text-center text-xs text-gray-400 dark:text-gray-500">
            Winners &amp; runners-up by sport
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SPORT_WINNERS.map(s => (
              <div key={s.sport}
                className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-bold text-white text-sm">{s.sport}</span>
                </div>
                <div className="space-y-3 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">🥇</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Winner</p>
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{s.winner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">🥈</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Runner-Up</p>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-tight">{s.runnerUp}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Closing note ───────────────────────────────────────────────── */}
        <div className="mt-14 rounded-2xl border border-violet-100 dark:border-violet-900 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 px-6 py-7 text-center">
          <p className="text-3xl mb-3">🎉</p>
          <p className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2">
            Until Next Time!
          </p>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Until the next Khelotsav — keep the spirit alive, stay active, and cherish every memory made on the court. Thank you to every player, volunteer, and supporter who made this day magical. See you next year! 🏅
          </p>
        </div>

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/events/khelotsav"
            className="text-sm font-semibold text-gray-400 dark:text-gray-500 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
            ← Back to Khelotsav
          </Link>
          <span className="text-gray-200 dark:text-gray-700">|</span>
          <Link href="/events/tournament/khelotsav-2026/leaderboard"
            className="text-sm font-semibold text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
            View Full Leaderboard →
          </Link>
        </div>

      </div>
    </div>
  )
}
