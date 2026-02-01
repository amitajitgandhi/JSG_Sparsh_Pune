'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Calendar, Clock, MapPin, Music, Users, CheckCircle } from 'lucide-react'

export default function Valentine2026() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [confirmAttend, setConfirmAttend] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([])

  const validMobile = /^\d{10}$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!validMobile.test(mobile)) { setError('Mobile number must be 10 digits'); return }
    if (!confirmAttend) { setError('Please confirm your attendance commitment'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/events/valentine-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, confirmAttend })
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Submission failed')
      setSuccess(true)
      setName('')
      setMobile('')
      setConfirmAttend(false)
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setSubmitting(false)
    }

  useEffect(() => {
    const count = 36
    const list: typeof particles = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 10 + 10,
        delay: Math.random() * 1.5,
        duration: Math.random() * 3 + 4,
      })
    }
    setParticles(list)
  }, [])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <section className="relative overflow-hidden py-10 sm:py-16">
        {/* Sprinkle hearts on load */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {particles.map(p => (
            <span
              key={p.id}
              className={`absolute animate-fall`}
              style={{
                left: `${p.left}vw`,
                top: '-24px',
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            >
              <Heart className="text-rose-300/80 drop-shadow" size={p.size} />
            </span>
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute animate-bounce-slow" style={{ left: `${(i*5)%100}%`, top: `${(i*7)%100}%` }}>
              <Heart className="text-rose-300 opacity-50" size={16 + (i % 10)} />
            </div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white px-5 py-2 rounded-2xl shadow-lg">
              <Heart size={20} className="animate-pulse" />
              <span className="font-bold text-sm sm:text-base">Valentine Soirée 2026</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-700 via-rose-700 to-red-700">Celebrate Love with JSG Pune Sparsh</h1>
            <p className="mt-2 text-sm sm:text-base text-rose-700">An elegant evening of music, games, dinner and togetherness</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white shadow border border-rose-200 p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700"><Calendar size={20} /></div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-700">Date</div>
                <div className="text-sm font-semibold">14 Feb 2026</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white shadow border border-rose-200 p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700"><Clock size={20} /></div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-700">Time</div>
                <div className="text-sm font-semibold">6:00 PM</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white shadow border border-rose-200 p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700"><MapPin size={20} /></div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-700">Venue</div>
                <div className="text-sm font-semibold">TBD</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-pink-200 p-5 mb-8">
            <h2 className="text-sm font-bold uppercase text-rose-700 mb-3">Event Highlights</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-rose-800">
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"><Music size={16} /> Live Music</div>
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"><Users size={16} /> Couple Love Games</div>
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"><CheckCircle size={16} /> Gala Dinner</div>
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"><Heart size={16} /> Bonding</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 rounded-2xl shadow p-6">
            <h3 className="text-sm font-bold uppercase text-rose-700 mb-4">Registration</h3>
            {success ? (
              <div className="space-y-3">
                <p className="text-green-700 font-semibold text-sm">Thank you! Your registration is recorded.</p>
                <p className="text-xs text-rose-700">We look forward to celebrating together. We will contact you for further details.</p>
                <div className="flex gap-2">
                  <Link href="/" className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2">Go Home</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded p-2">{error}</div>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-rose-800 mb-1">Name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-rose-800 mb-1">Mobile Number *</label>
                    <input value={mobile} onChange={(e) => setMobile(e.target.value)} required inputMode="numeric" pattern="\d{10}" maxLength={10} className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="10-digit" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input id="confirmAttend" type="checkbox" checked={confirmAttend} onChange={(e) => setConfirmAttend(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-400" />
                  <label htmlFor="confirmAttend" className="text-xs text-rose-800">I confirm my attendance and understand that cancellations are discouraged.</label>
                </div>
                <button type="submit" disabled={submitting} className="w-full sm:w-auto rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold px-5 py-2 shadow">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes fall {
          0% { transform: translateY(-24px) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) scale(0.9); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; animation-iteration-count: 1; }
      `}</style>
    </div>
  )
}
