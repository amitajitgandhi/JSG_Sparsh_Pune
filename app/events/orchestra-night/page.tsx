'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Music,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  Mic2,
  Phone,
} from 'lucide-react'

export default function OrchestraNightPage() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [membershipType, setMembershipType] = useState<'JSG PUNE SPARSH' | 'OTHER'>('JSG PUNE SPARSH')
  const [passes, setPasses] = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validMobile = /^\d{10}$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!validMobile.test(mobile)) { setError('Mobile number must be 10 digits'); return }
    if (!passes || passes < 1 || passes > 7) { setError('Please select number of passes (1-7)'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/events/orchestra-night/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), mobile, membershipType, passes }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Submission failed')
      setSuccess(true)
      setName('')
      setMobile('')
      setMembershipType('JSG PUNE SPARSH')
      setPasses(1)
    } catch (e: any) {
      setError(e?.message || 'Unexpected error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-950 dark:to-black">
      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 sm:w-80 sm:h-80 bg-rose-300/25 dark:bg-rose-800/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 sm:w-80 sm:h-80 bg-violet-300/25 dark:bg-violet-800/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 via-fuchsia-600 to-violet-600 text-white px-4 py-2 rounded-2xl shadow-lg">
              <Music size={18} />
              <span className="font-bold text-xs sm:text-sm uppercase tracking-widest">JSG Pune Sparsh presents</span>
            </div>

            <h1 className="mt-5 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-700 via-fuchsia-700 to-violet-700 dark:from-rose-400 dark:via-fuchsia-400 dark:to-violet-400">
              <span className="block text-3xl sm:text-4xl md:text-5xl">Orchestra Night</span>
              <span className="block text-xl sm:text-2xl md:text-3xl mt-1">Healing Harmony 2026</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              An evening of Hope, Courage &amp; Music — where doctors and cancer survivors come together
              on one stage to celebrate life through soulful performances.
            </p>

            <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              In association with Umeed Cancer Support Forum, JSG Pune Main, Aastha Breast Care &amp; Kalangan
            </p>
          </div>

          {/* Date / Time / Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="rounded-2xl bg-white border border-rose-200 shadow-sm p-4 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700">
              <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center dark:bg-rose-950 dark:text-rose-300 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Date</div>
                <div className="text-sm font-bold text-rose-800 dark:text-rose-200">16 Jul 2026, Thu</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-rose-200 shadow-sm p-4 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700">
              <div className="h-11 w-11 rounded-xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center dark:bg-fuchsia-950 dark:text-fuchsia-300 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Time</div>
                <div className="text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">5:00 PM – 8:00 PM</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-rose-200 shadow-sm p-4 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700">
              <div className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center dark:bg-violet-950 dark:text-violet-300 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Venue</div>
                <div className="text-sm font-bold text-violet-800 dark:text-violet-200">Annabhau Sathe Auditorium, Pune</div>
              </div>
            </div>
          </div>

          {/* Why we gather */}
          <div className="rounded-2xl sm:rounded-3xl bg-white/90 border border-rose-100 shadow p-5 sm:p-7 mb-8 sm:mb-10 dark:bg-gray-900/80 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-violet-700 dark:from-rose-400 dark:to-violet-400 mb-4">
              An Evening To Remember
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-xl px-3 py-3 dark:bg-rose-950/40 dark:border-rose-900">
                <ShieldCheck size={20} className="text-rose-600 dark:text-rose-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-rose-800 dark:text-rose-200">Spread Awareness</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-fuchsia-50 border border-fuchsia-100 rounded-xl px-3 py-3 dark:bg-fuchsia-950/40 dark:border-fuchsia-900">
                <Users size={20} className="text-fuchsia-600 dark:text-fuchsia-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">Inspire Courage</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl px-3 py-3 dark:bg-violet-950/40 dark:border-violet-900">
                <Heart size={20} className="text-violet-600 dark:text-violet-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-violet-800 dark:text-violet-200">Celebrate Resilience</div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Join us to spread awareness, inspire courage, and celebrate the indomitable human spirit.
              Together, let&apos;s celebrate strength, healing, and the spirit of never giving up.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
              <Mic2 size={16} />
              <span>We look forward to your gracious presence.</span>
            </div>
          </div>

          {/* Registration */}
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-rose-50 border border-rose-200 shadow p-5 sm:p-7 dark:from-gray-900 dark:to-gray-900 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-violet-700 dark:from-rose-400 dark:to-violet-400 mb-1">
              Reserve Your Passes
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Entry is free — register below to help us plan seating for the evening.
            </p>

            {success ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Thank you! Your registration is confirmed.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You&apos;re welcome to bring along your family members too — we look forward to seeing you all there.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuccess(false)}
                    className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2"
                  >
                    Register Another
                  </button>
                  <Link href="/" className="rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1">
                    Member Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-rose-500"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    inputMode="numeric"
                    pattern="\d{10}"
                    maxLength={10}
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-rose-500"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1">
                    Membership Type *
                  </label>
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-800 dark:text-gray-100">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="membershipType"
                        value="JSG PUNE SPARSH"
                        checked={membershipType === 'JSG PUNE SPARSH'}
                        onChange={() => setMembershipType('JSG PUNE SPARSH')}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-400 dark:bg-gray-800 dark:border-gray-600"
                      />
                      <span className="text-sm">JSG Pune Sparsh</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="membershipType"
                        value="OTHER"
                        checked={membershipType === 'OTHER'}
                        onChange={() => setMembershipType('OTHER')}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-400 dark:bg-gray-800 dark:border-gray-600"
                      />
                      <span className="text-sm">Other</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1">
                    No. of Passes Required *
                  </label>
                  <select
                    value={passes}
                    onChange={(e) => setPasses(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-rose-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                    <Heart size={14} className="shrink-0 mt-0.5" />
                    <span>You can bring along your family members too — select the total passes needed for your group.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-violet-600 hover:brightness-110 disabled:opacity-60 text-white font-bold px-6 py-2.5 shadow min-h-[44px]"
                >
                  {submitting ? 'Submitting...' : 'Register Now'}
                </button>
              </form>
            )}
          </div>

          {/* Contact */}
          <div className="mt-8 sm:mt-10">
            <p className="text-center text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
              For Any Queries
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <a
                href="tel:+919422313106"
                className="group flex items-center gap-3 rounded-2xl bg-white border border-rose-200 shadow-sm p-4 hover:shadow-md hover:border-rose-300 transition dark:bg-gray-900 dark:border-gray-700 dark:hover:border-rose-700"
              >
                <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 dark:bg-rose-950 dark:text-rose-300">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">Timmeer Sanghavi</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Social PRO</div>
                  <div className="text-sm font-semibold text-rose-700 dark:text-rose-300 mt-0.5">9422313106</div>
                </div>
              </a>
              <a
                href="tel:+917276319578"
                className="group flex items-center gap-3 rounded-2xl bg-white border border-violet-200 shadow-sm p-4 hover:shadow-md hover:border-violet-300 transition dark:bg-gray-900 dark:border-gray-700 dark:hover:border-violet-700"
              >
                <div className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 dark:bg-violet-950 dark:text-violet-300">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">Amit Gandhi</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Secretary</div>
                  <div className="text-sm font-semibold text-violet-700 dark:text-violet-300 mt-0.5">7276319578</div>
                </div>
              </a>
            </div>
            <p className="mt-5 flex items-start justify-center gap-1.5 text-xs text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              <Sparkles size={13} className="shrink-0 mt-0.5 text-amber-500" />
              <span>Please share this invitation with your family and friends and help us spread the message of hope.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
