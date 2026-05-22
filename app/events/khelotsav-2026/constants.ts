import { Activity, Flame, Medal, PartyPopper, Users } from 'lucide-react'

export const EVENT_NAME = 'SPARSH KHELOTSAV 2026'
export const EVENT_FEE = 500

export const eventHighlights = [
  { icon: Flame, label: 'Sports', emoji: '🔥' },
  { icon: Activity, label: 'Energy', emoji: '💪' },
  { icon: Medal, label: 'Competition', emoji: '🏅' },
  { icon: Users, label: 'Team Spirit', emoji: '🤝' },
  { icon: PartyPopper, label: 'Unlimited Fun', emoji: '🎊' },
  { icon: Users, label: 'Bonding', emoji: '🤝' }
]

export const sports = [
  { name: 'Carrom' },
  { name: 'Chess' },
  { name: 'Table Tennis' },
  { name: 'Badminton' },
  { name: 'Pickle Ball' },
  { name: 'Kho Kho' },
  { name: 'Lemon & Spoon Race' },
  { name: 'Sack Race' },
  { name: 'Tug of War' },
  { name: 'Volleyball', gender: 'Male' as const, subtitle: 'For Males' },
  { name: 'Dodge Ball', gender: 'Female' as const, subtitle: 'For Females' },
  { name: 'Three-Legged Race' }
]

export const sectionSteps = ['Event Details', 'Personal Details', 'Select Sports', 'Rate Your Selected Sports', 'Payment', 'Note']
