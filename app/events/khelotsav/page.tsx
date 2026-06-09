import Link from 'next/link'
import Image from 'next/image'
import {
  CalendarDays,
  Clock3,
  MapPinnedIcon,
  Trophy,
  Medal,
  Users,
  Activity,
  ClipboardList,
  Lock,
  ArrowRight,
} from 'lucide-react'
import {
  REGISTRATION_CLOSED_STATUS,
  eventHighlights,
  sports,
} from '../khelotsav-2026/constants'
import HeroTitleCard from './HeroTitleCard'

const registrationClosed =
  String(REGISTRATION_CLOSED_STATUS || '').trim().toUpperCase() === 'YES'

const quickStats = [
  { value: '12+', label: 'Sports', gradient: 'from-sky-500 to-sky-600' },
  { value: '8', label: 'Teams', gradient: 'from-emerald-500 to-emerald-600' },
  { value: '250+', label: 'Players', gradient: 'from-orange-500 to-orange-600' },
]

const eventDetails = [
  {
    icon: CalendarDays,
    iconClass: 'text-sky-500 dark:text-cyan-400',
    borderClass: 'border-sky-200 dark:border-sky-800',
    label: 'Date',
    value: '21 June 2026',
  },
  {
    icon: Clock3,
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    label: 'Time',
    value: '8:00 AM – 6:00 PM',
  },
  {
    icon: MapPinnedIcon,
    iconClass: 'text-orange-500 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-800',
    label: 'Venue',
    value: 'Downtown Sports Complex',
  },
]

type CtaItem = {
  href: string
  label: string
  sub: string
  icon: React.ReactNode
  gradient: string
  glow: string
  disabled?: boolean
  badge?: string
}

const actionLinks: CtaItem[] = [
  {
    href: '/events/khelotsav-2026',
    label: registrationClosed ? 'Registration Closed' : 'Register Now',
    sub: registrationClosed
      ? 'Registrations are no longer accepted'
      : 'Fill in your details & secure your spot',
    icon: registrationClosed ? <Lock size={20} /> : <ClipboardList size={20} />,
    gradient: registrationClosed ? 'from-slate-400 to-slate-500' : 'from-orange-500 to-orange-600',
    glow: registrationClosed ? '' : 'hover:shadow-orange-200 dark:hover:shadow-orange-900/30',
  },
  {
    href: '/events/tournament/khelotsav-2026/teams',
    label: 'Team Players',
    sub: 'Browse participants team-wise',
    icon: <Users size={20} />,
    gradient: 'from-sky-500 to-blue-600',
    glow: 'hover:shadow-sky-200 dark:hover:shadow-sky-900/30',
  },
  {
    href: '/events/tournament/khelotsav-2026/leaderboard',
    label: 'Leaderboard',
    sub: 'Standings & medal tally',
    icon: <Trophy size={20} />,
    gradient: 'from-orange-500 to-orange-600',
    glow: 'hover:shadow-orange-200 dark:hover:shadow-orange-900/30',
  },
  {
    href: '/events/tournament/khelotsav-2026/results',
    label: 'Event Results',
    sub: 'Scores by sport & category',
    icon: <Medal size={20} />,
    gradient: 'from-emerald-500 to-emerald-600',
    glow: 'hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30',
  },
]

function CtaTile({ cta }: { cta: CtaItem }) {
  const inner = (
    <>
      {cta.badge ? (
        <span className="absolute top-2 right-2 rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          {cta.badge}
        </span>
      ) : null}
      <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-inner sm:h-11 sm:w-11">
        {cta.icon}
      </div>
      <p className="w-full text-center text-xs font-extrabold leading-tight sm:text-sm">{cta.label}</p>
      <p className="mt-1 w-full line-clamp-3 text-center text-[11px] leading-snug text-white/80 sm:text-xs">
        {cta.sub}
      </p>
      {!cta.disabled ? (
        <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors sm:mt-2.5 sm:h-7 sm:w-7">
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform sm:size-3.5" />
        </div>
      ) : null}
    </>
  )

  const className = `group relative flex min-h-[152px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${cta.gradient} p-3.5 text-white shadow-lg sm:min-h-0 sm:p-5 ${cta.glow} transition-all duration-300 ${
    cta.disabled
      ? 'cursor-not-allowed opacity-90'
      : 'hover:shadow-xl active:scale-[0.97] sm:hover:-translate-y-1'
  }`

  if (cta.disabled) {
    return <div className={className}>{inner}</div>
  }

  return (
    <Link href={cta.href} className={className}>
      {inner}
    </Link>
  )
}

export default function KhelotsavHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 pb-8 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 sm:pb-10">
      {/* Banner + Title Tile Container */}
      <section className="relative w-full shrink-0 overflow-hidden rounded-b-2xl">
        {/* Background blue tile container */}
        <div className="relative w-full bg-gradient-to-b from-sky-900/45 via-slate-900/55 to-slate-900/75 dark:from-slate-950/75 dark:via-slate-950/85 dark:to-slate-950">
          {/* Banner with image */}
          <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden sm:h-[240px] md:h-[280px]">
            <Image
              src="/images/khelotsav-indoor-sports.svg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />

            {/* Title tile - centered on banner */}
            <header className="relative z-10 w-full max-w-lg px-4 sm:max-w-2xl sm:px-6 lg:max-w-5xl">
              <HeroTitleCard />
            </header>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-lg px-4 sm:max-w-2xl sm:px-6 lg:max-w-5xl">
        {/* Event details — stacked on mobile */}
        <div className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:grid sm:grid-cols-3 sm:gap-3">
          {eventDetails.map((detail) => {
            const Icon = detail.icon
            return (
              <div
                key={detail.label}
                className={`flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-sm dark:bg-slate-900/90 ${detail.borderClass}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Icon size={18} className={detail.iconClass} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {detail.label}
                  </p>
                  <p className="text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
                    {detail.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-5 text-center text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:mt-6 sm:text-base">
          Gear up for an action-packed day of spirited indoor games, vibrant energy, healthy rivalry,
          stronger bonds, and nonstop celebration. Whether you&apos;re competing or cheering — Khelotsav
          is for everyone!
        </p>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 text-center text-white shadow-md sm:p-4`}
            >
              <div className="text-lg font-bold sm:text-2xl">{stat.value}</div>
              <div className="mt-0.5 text-[11px] font-medium leading-tight opacity-90 sm:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action tiles — 2×2 on mobile */}
        <section className="mt-7 sm:mt-8">
          <h2 className="mb-3 text-center text-base font-bold text-gray-800 dark:text-slate-100 sm:mb-4 sm:text-xl">
            Explore the Event
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {actionLinks.map((cta) => (
              <CtaTile key={cta.href} cta={cta} />
            ))}
          </div>
        </section>

        {/* Highlights — single column on mobile for readability */}
        <section className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900/90 sm:mt-6 sm:rounded-3xl sm:p-6">
          <h2 className="mb-3 text-center text-base font-bold text-gray-800 dark:text-slate-100 sm:mb-4 sm:text-xl">
            Why Khelotsav?
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {eventHighlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 dark:bg-slate-700">
                    <Icon size={16} className="text-sky-600 dark:text-cyan-300" />
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    {item.emoji} {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Note */}
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800 shadow-sm dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-200 sm:mt-6">
          <div className="flex gap-3">
            <Activity size={17} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400" />
            <p className="leading-relaxed">
              The final list of games may be modified depending on participation count, venue
              availability, and event committee decisions. Further instructions will be shared closer
              to the event date.
            </p>
          </div>
        </div>

        <p className="mt-7 text-center sm:mt-8">
          <Link
            href="/events"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-800 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
          >
            ← All Events
          </Link>
        </p>
      </div>
    </div>
  )
}
