'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function UpcomingEventsModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const openHandler = () => {
      // Always allow manual open even if previously dismissed
      setShow(true)
    }
    window.addEventListener('openUpcomingEvents', openHandler)
    return () => window.removeEventListener('openUpcomingEvents', openHandler)
  }, [])

  const close = () => { sessionStorage.setItem('upcomingEventsDismissed', 'true'); setShow(false) }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-blue-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 px-5 py-3 flex items-center justify-between text-white">
          <h3 className="text-base font-bold tracking-wide">Upcoming Events</h3>
          <button onClick={close} className="text-white/80 hover:text-white text-sm">✕</button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <p className="text-gray-700 font-medium">Choose an event to view details & register early.</p>
          <div className="grid gap-3">
            <Link href="/events/goa" onClick={close} className="group rounded-xl border border-pink-300 bg-pink-50 px-4 py-3 font-semibold text-pink-700 flex items-center justify-between hover:bg-pink-100 transition">
              <span>Goa Escape</span>
              <span className="text-[11px] font-bold uppercase tracking-wide group-hover:translate-x-1 transition">Explore →</span>
            </Link>
          </div>
          <button onClick={close} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 text-xs font-medium">Dismiss</button>
          <p className="text-[10px] text-gray-400">Close to dismiss. You can reopen from the hero section.</p>
        </div>
      </div>
    </div>
  )
}
