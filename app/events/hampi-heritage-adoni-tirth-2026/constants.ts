import { Landmark, Mountain, Bus, UtensilsCrossed, Users, Home, TrainFront, Car } from 'lucide-react'

export const EVENT_NAME = 'Hampi Heritage & Adoni Tirth Expedition'
export const EVENT_SLUG = 'hampi-heritage-adoni-tirth-2026'
// Hero title split into three lines: "Hampi Heritage" / "&" / "Adoni Tirth Expedition".
export const EVENT_NAME_LINE1 = 'Hampi Heritage'
export const EVENT_NAME_AMPERSAND = '&'
export const EVENT_NAME_LINE2 = 'Adoni Tirth Expedition'
export const EVENT_DATES = '1st - 4th October 2026'
export const EVENT_SPONSOR_LINE = 'JSG Pune Sparsh'

// Registration is a family/group unit (contact + headcount per age tier), not per individual.
// Payment is NOT collected on this form - it's cash, collected in person at a collection centre
// after registration, communicated separately. Prices are tentative; the form only shows an
// estimate. There's intentionally no slot-cap validation anywhere (see event-creator skill).
export const AGE_TIERS = [
  { key: 'adult_count' as const, label: 'Adult', rate: 12000 },
  { key: 'child_above8_count' as const, label: 'Child (Above 8 yrs)', rate: 8000 },
  { key: 'child_5_to_8_count' as const, label: 'Child (5-8 yrs)', rate: 5500 },
  { key: 'child_below5_count' as const, label: 'Below 5 yrs', rate: 0 }
]

export const TRAVEL_OPTIONS: { value: 'Own Transportation' | 'Bus' | 'AC Train' | 'Sleeper Train'; note: string | null }[] = [
  { value: 'Own Transportation', note: null },
  { value: 'Bus', note: 'Approx. ₹1,600' },
  { value: 'AC Train', note: 'Approx. ₹2,300' },
  { value: 'Sleeper Train', note: 'Approx. ₹1,000' }
]

// Shown directly under the travel-mode picker on the registration form.
export const TRAVEL_NOTE =
  'All members above 5 years will be considered for transport and a dedicated seat/berth.'

// Vittala Temple / Hampi heritage photo used as the page hero background.
export const HERO_BACKGROUND_IMAGE = '/images/Hampi.jpg'

// Warm heritage amber/gold/bronze palette (per the sponsor's poster), not the vibrant
// multi-color sporty theme used for Box Cricket.
export type TileColor = 'amber' | 'orange' | 'yellow' | 'stone'

export const TILE_THEME: Record<TileColor, { bg: string; border: string; iconBg: string; iconText: string; labelText: string }> = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconText: 'text-amber-700', labelText: 'text-amber-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconText: 'text-orange-700', labelText: 'text-orange-800' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100', iconText: 'text-yellow-700', labelText: 'text-yellow-800' },
  stone: { bg: 'bg-stone-50', border: 'border-stone-200', iconBg: 'bg-stone-100', iconText: 'text-stone-700', labelText: 'text-stone-800' }
}

export const packageIncludes: { label: string; icon: any; color: TileColor }[] = [
  { label: 'Stay at a 3-Star Property', icon: Home, color: 'amber' },
  { label: 'Food (2nd-4th Oct)', icon: UtensilsCrossed, color: 'orange' },
  { label: 'Sightseeing at Hampi', icon: Landmark, color: 'yellow' },
  { label: 'Local Transportation', icon: Bus, color: 'stone' }
]

// Matches the "Trip Highlights" medallions on the sponsor's poster.
export const tripHighlights: { label: string; icon: any; color: TileColor }[] = [
  { label: 'Divine Jain Tirths', icon: Landmark, color: 'amber' },
  { label: 'Scenic Atmosphere', icon: Mountain, color: 'orange' },
  { label: 'Comfortable Travel', icon: TrainFront, color: 'yellow' },
  { label: 'Pure Jain Meals', icon: UtensilsCrossed, color: 'stone' }
]

export const travelIcons: Record<'Own Transportation' | 'Bus' | 'AC Train' | 'Sleeper Train', any> = {
  'Own Transportation': Car,
  Bus,
  'AC Train': TrainFront,
  'Sleeper Train': TrainFront
}

export const faqItems = [
  {
    question: 'Who can register for this trip?',
    answer: 'SPARSH members and their families are welcome to register for this expedition.'
  },
  {
    question: 'Is the price shown final?',
    answer: 'No - the charges are tentative and will be confirmed shortly. This registration only shows an estimated amount based on the tentative rates.'
  },
  {
    question: 'How and when do I pay?',
    answer: 'Payment will be collected in cash at a designated collection centre after registration - you don’t need to pay anything right now. Details on where and when will be shared separately.'
  },
  {
    question: 'I need to change my registration after submitting - what do I do?',
    answer: 'Please reach out to the organizing committee directly with your updated details.'
  }
]
