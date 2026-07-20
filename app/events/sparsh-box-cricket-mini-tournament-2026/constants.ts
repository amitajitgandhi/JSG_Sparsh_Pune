import { CalendarDays, Clock3, Trophy, Drumstick, Coffee, Droplets, Sparkles, Gavel } from 'lucide-react'

export const EVENT_NAME = 'Sparsh Box Cricket Mini Tournament'
// Slug used for the registrations table, the register API route, and the shared
// registration-status key (`registration_status_<slug>` in app_navigation_settings).
export const EVENT_SLUG = 'sparsh-box-cricket-mini-tournament-2026'
// Hero title is rendered as two lines with different emphasis: the event's core name (bigger)
// and "Mini Tournament" (kept at the smaller size it already read well at).
export const EVENT_NAME_LINE1 = 'Sparsh Box Cricket'
export const EVENT_NAME_LINE2 = 'Mini Tournament'
export const EVENT_SEASON = 'Season 03'
export const EVENT_SPONSOR_LINE = 'DIPAM – हवा हर कोने में.....'
// There's intentionally no hard slot cap enforced anywhere (form, API, or DB) - the number of
// players may be increased depending on response. The Format tile shows "40+ Players" as a
// marketing figure only.
export const TEAM_COUNT = 6
export const FEE_AMOUNT = 400

// Registration open/closed state now lives in the database (see the shared
// /api/events/registration-status route + the "Registration Status" card on this event's admin
// dashboard) instead of a hardcoded constant here - it can be flipped live with no redeploy.

// Vibrant per-tile color themes — each tile picks one of these instead of a single uniform
// blue/emerald wash, so the page reads as lively and dynamic rather than flat.
export type TileColor = 'orange' | 'purple' | 'pink' | 'teal' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'fuchsia' | 'yellow'

export const TILE_THEME: Record<TileColor, { bg: string; border: string; iconBg: string; iconText: string; labelText: string }> = {
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconText: 'text-orange-600', labelText: 'text-orange-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-100', iconText: 'text-purple-600', labelText: 'text-purple-700' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', iconBg: 'bg-pink-100', iconText: 'text-pink-600', labelText: 'text-pink-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', iconBg: 'bg-teal-100', iconText: 'text-teal-600', labelText: 'text-teal-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', labelText: 'text-indigo-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconText: 'text-amber-600', labelText: 'text-amber-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconText: 'text-rose-600', labelText: 'text-rose-700' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', labelText: 'text-cyan-700' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-600', labelText: 'text-fuchsia-700' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100', iconText: 'text-yellow-600', labelText: 'text-yellow-700' }
}

export const tournamentDetails: { label: string; value: string; icon: any; color: TileColor }[] = [
  { label: 'Date', value: '15th August', icon: CalendarDays, color: 'orange' },
  { label: 'Time', value: '2:00 PM onwards', icon: Clock3, color: 'purple' },
  { label: 'Format', value: `${TEAM_COUNT} Teams · 40+ Players`, icon: Trophy, color: 'pink' },
  { label: 'Fees', value: `₹${FEE_AMOUNT} per player`, icon: Sparkles, color: 'teal' }
]

export const inclusions: { label: string; icon: any; color: TileColor }[] = [
  { label: 'Min. 2 League Matches', icon: Trophy, color: 'indigo' },
  { label: 'High Tea', icon: Coffee, color: 'amber' },
  { label: 'Dinner', icon: Drumstick, color: 'rose' },
  { label: 'Hydration', icon: Droplets, color: 'cyan' },
  { label: 'Awards', icon: Trophy, color: 'yellow' },
  { label: 'Bonding', icon: Gavel, color: 'fuchsia' }
]

export const faqItems = [
  {
    question: 'Who can register for this tournament?',
    answer: 'Only SPARSH members and their kids (16 years and above) are eligible to register.'
  },
  {
    question: 'How are teams decided?',
    answer: 'Teams will be formed through a Player Auction after registrations close — you register as an individual player, not as part of a team.'
  },
  {
    question: 'Is payment proof mandatory?',
    answer: 'Yes for online payments — upload a clear screenshot of your payment. If you’re paying cash, just tell us who you paid.'
  },
  {
    question: 'What photo should I upload?',
    answer: 'Please use a recent and HD (clear, well-lit) photo of yourself — this will be used to identify players during the auction.'
  },
  {
    question: 'What if transaction reference detection is incorrect?',
    answer: 'You can manually edit the transaction reference number before submitting.'
  },
  {
    question: 'Can I cancel or get a refund after registering?',
    answer: 'No — registration is confirmed only after payment, and no cancellation or refund will be entertained once registered.'
  },
  {
    question: 'Are slots limited?',
    answer: 'Slots are on a first come, first served basis. If registration closes, you\'ll see a notice on this page — the exact number of slots may be adjusted depending on response.'
  }
]
