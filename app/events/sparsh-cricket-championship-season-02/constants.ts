import { CalendarDays, Clock3, MapPin, Trophy, Drumstick, Shirt, Users2, CircleDot, Sparkles } from 'lucide-react'

export const tournamentDetails = [
  { label: 'Dates', value: '30-31 May (Sat-Sun)', icon: CalendarDays },
  { label: 'Venue', value: 'Tembekar Ground', icon: MapPin },
  { label: 'Tournament Type', value: 'Full Pitch', icon: Trophy },
  { label: 'Fees', value: '₹700', icon: Sparkles }
]

export const inclusions = [
  { label: 'Delicious Food', icon: Drumstick },
  { label: 'Jersey', icon: Shirt },
  { label: 'Trophy', icon: Trophy },
  { label: 'Fun & Bonding', icon: Users2 }
]

export const faqItems = [
  {
    question: 'Who can register for this tournament?',
    answer: 'Both Members and Kids can register. Please complete all required fields before submitting.'
  },
  {
    question: 'Is payment proof mandatory?',
    answer: 'Yes. Upload a clear screenshot of your payment to complete registration.'
  },
  {
    question: 'What if transaction reference detection is incorrect?',
    answer: 'You can manually edit the transaction reference number before submitting.'
  },
  {
    question: 'Will rules and schedule be shared later?',
    answer: 'Yes. Tournament scheduling and rules will be shared after registration.'
  }
]
