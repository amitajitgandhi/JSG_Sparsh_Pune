'use client'

import { Clock3, Lock } from 'lucide-react'
import ModalPortal from '@/app/components/ModalPortal'

interface RegistrationStatusModalProps {
  status: 'not_open' | 'closed'
  eventName: string
}

// Shared, non-dismissable pop-up for the two "registration isn't open" states every event page
// can be in. Reused across events rather than duplicated per event folder - see the
// event-creator skill's "Registration-status gating" step for the full design.
const COPY: Record<'not_open' | 'closed', { icon: typeof Clock3; title: string; body: string; accent: string }> = {
  not_open: {
    icon: Clock3,
    title: 'Registration Will Be Opened Shortly',
    body: 'Registration for this event hasn’t started yet. Please check back soon!',
    accent: 'from-amber-500 to-orange-600'
  },
  closed: {
    icon: Lock,
    title: 'Registration Is Now Closed',
    body: 'Registrations for this event are now closed. Thank you for your interest!',
    accent: 'from-gray-500 to-gray-700'
  }
}

export default function RegistrationStatusModal({ status, eventName }: RegistrationStatusModalProps) {
  const { icon: Icon, title, body, accent } = COPY[status]

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
        <div className="relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-lg sm:p-8">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white`}>
            <Icon size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 sm:text-2xl">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{body}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">{eventName}</p>
        </div>
      </div>
    </ModalPortal>
  )
}
