import { Activity, Flame, Medal, PartyPopper, Users } from 'lucide-react'

export const EVENT_NAME = 'SPARSH KHELOTSAV 2026'
export const EVENT_FEE = 500

// Set to "YES" to block registrations and show closed modal.
// Any other value will keep registrations open.
export const REGISTRATION_CLOSED_STATUS = 'YES'

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

export const jerseySizes = [
  { label: '5XL', value: '50' },
  { label: '4XL', value: '48' },
  { label: '3XL', value: '46' },
  { label: '2XL', value: '44' },
  { label: 'XL', value: '42' },
  { label: 'L', value: '40' },
  { label: 'M', value: '38' },
  { label: 'S', value: '36' },
  { label: 'XS', value: '34' },
  { label: '32', value: '32' },
  { label: '30', value: '30' },
  { label: '28', value: '28' }
]
