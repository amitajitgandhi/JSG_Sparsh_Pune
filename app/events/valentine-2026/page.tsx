'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Calendar, Clock, MapPin, Music, Users, CheckCircle } from 'lucide-react'

export default function Valentine2026() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [confirmAttend, setConfirmAttend] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([])
  const [registrationFor, setRegistrationFor] = useState<'Individual' | 'Couple'>('Couple')
  const [kids5to9Count, setKids5to9Count] = useState<number>(0)
  const [kids9plusCount, setKids9plusCount] = useState<number>(0)
  const [transactionId, setTransactionId] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [showQR, setShowQR] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const validMobile = /^\d{10}$/

  const KID_5_9_RATE = 500
  const KID_9_PLUS_RATE = 800
  const REFUNDABLE_DEPOSIT_PER_REGISTRATION = 500

  const totalAmount = useMemo(() => {
    const kids5to9Total = kids5to9Count * KID_5_9_RATE
    const kids9plusTotal = kids9plusCount * KID_9_PLUS_RATE
    const deposit = REFUNDABLE_DEPOSIT_PER_REGISTRATION
    return kids5to9Total + kids9plusTotal + deposit
  }, [kids5to9Count, kids9plusCount])

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null
    const fd = new FormData()
    fd.append('file', screenshotFile)
    const res = await fetch('/api/events/valentine-2026/upload-screenshot', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok || !data?.success || !data?.url) return null
    return data.url as string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!validMobile.test(mobile)) { setError('Mobile number must be 10 digits'); return }
    if (!confirmAttend) { setError('Please confirm your attendance commitment'); return }
    if (!transactionId.trim()) { setError('Please enter transaction/reference ID'); return }
    setSubmitting(true)
    try {
      if (!screenshotFile) { setError('Please upload the transaction screenshot'); return }
      const screenshotUrl = await uploadScreenshot()
      if (!screenshotUrl) { setError('Failed to upload screenshot. Please try again.'); return }
      const res = await fetch('/api/events/valentine-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          confirmAttend,
          registrationFor,
          kids5to9: kids5to9Count,
          kids9plus: kids9plusCount,
          transactionId,
          totalAmount,
          screenshotUrl,
        })
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Submission failed')
      setSuccess(true)
      setName('')
      setMobile('')
      setConfirmAttend(false)
      setRegistrationFor('Couple')
      setKids5to9Count(0)
      setKids9plusCount(0)
      setTransactionId('')
      setScreenshotFile(null)
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
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
            <p className="mt-2 text-sm sm:text-base text-rose-700 dark:text-rose-200">An elegant evening of music, games, dinner and togetherness</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white shadow border border-rose-200 p-4 flex items-center gap-3 dark:bg-rose-900/30 dark:border-rose-800 dark:shadow-none">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"><Calendar size={20} /></div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">Date</div>
                <div className="text-sm font-semibold dark:text-rose-100">15 Feb 2026</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white shadow border border-rose-200 p-4 flex items-center gap-3 dark:bg-rose-900/30 dark:border-rose-800 dark:shadow-none">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"><Clock size={20} /></div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">Time</div>
                <div className="text-sm font-semibold dark:text-rose-100">6:00 PM</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white shadow border border-rose-200 p-4 flex items-center gap-3 dark:bg-rose-900/30 dark:border-rose-800 dark:shadow-none">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"><MapPin size={20} /></div>
              <div>
                <div className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300">Venue</div>
                <div className="text-sm font-semibold dark:text-rose-100">Yash Raj Garden</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-pink-200 p-5 mb-8 dark:bg-rose-900/30 dark:border-rose-800 dark:shadow-none">
            <h2 className="text-sm font-bold uppercase text-rose-700 mb-3 dark:text-rose-300">Event Highlights</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-rose-800 dark:text-rose-100">
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:bg-rose-950/50 dark:border-rose-800"><Music size={16} /> Live Music</div>
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:bg-rose-950/50 dark:border-rose-800"><Users size={16} /> Couple Love Games</div>
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:bg-rose-950/50 dark:border-rose-800"><CheckCircle size={16} /> Gala Dinner</div>
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:bg-rose-950/50 dark:border-rose-800"><Heart size={16} /> Ind-Pak T20 Match Screening</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 rounded-2xl shadow p-6 dark:from-rose-950 dark:to-rose-900/20 dark:border-rose-800 dark:shadow-none">
            <h3 className="text-sm font-bold uppercase text-rose-700 mb-4 dark:text-rose-300">Registration</h3>
            {success ? (
              <div className="space-y-3">
                <p className="text-green-700 font-semibold text-sm dark:text-green-300">Thank you! Your registration is recorded.</p>
                <p className="text-xs text-rose-700 dark:text-rose-300">We look forward to celebrating together.</p>
                <div className="flex gap-2">
                  <Link href="/" className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2">Go Home</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded p-2 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700">{error}</div>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-rose-800 mb-1 dark:text-rose-200">Name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-100 dark:placeholder-rose-400 dark:focus:ring-rose-500" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-rose-800 mb-1 dark:text-rose-200">Mobile Number *</label>
                    <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0,10))} required inputMode="numeric" pattern="\d{10}" maxLength={10} className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-100 dark:placeholder-rose-400 dark:focus:ring-rose-500" placeholder="10-digit" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-medium text-rose-800 dark:text-rose-200">Registration for</span>
                  <div className="flex flex-wrap gap-6 text-rose-900 dark:text-rose-100">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="registrationFor" value="Couple" checked={registrationFor === 'Couple'} onChange={() => setRegistrationFor('Couple')} className="h-4 w-4 text-rose-600" />
                      <span className="text-sm">Couple</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="registrationFor" value="Individual" checked={registrationFor === 'Individual'} onChange={() => setRegistrationFor('Individual')} className="h-4 w-4 text-rose-600" />
                      <span className="text-sm">Individual</span>
                    </label>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-rose-800 dark:text-rose-200">Kids (5–9 yrs)</label>
                    <select value={kids5to9Count} onChange={(e) => setKids5to9Count(parseInt(e.target.value, 10))} className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-100 dark:focus:ring-rose-500">
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">₹{KID_5_9_RATE} per head</span>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-rose-800 dark:text-rose-200">Kids (9+ yrs)</label>
                    <select value={kids9plusCount} onChange={(e) => setKids9plusCount(parseInt(e.target.value, 10))} className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-100 dark:focus:ring-rose-500">
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">₹{KID_9_PLUS_RATE} per head</span>
                  </div>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-rose-800 dark:text-rose-200">Total Amount to be paid</label>
                  <input readOnly value={`₹${totalAmount}`} className="w-full rounded-lg border border-rose-300 bg-rose-50 text-rose-900 px-3 py-2 text-sm dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-100" />
                  <span className="text-[11px] text-rose-700 dark:text-rose-300">Includes refundable deposit of ₹{REFUNDABLE_DEPOSIT_PER_REGISTRATION} per registration. Kids 0–5 yrs: Free</span>
                  <button type="button" onClick={() => setShowQR(true)} className="mt-2 inline-flex text-xs text-rose-700 hover:text-rose-800 underline dark:text-rose-200 dark:hover:text-white">View QR Code for Payment</button>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-rose-800 dark:text-rose-200">Transaction Screenshot upload</label>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/*" onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-50 w-full sm:w-auto dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700">Choose File</button>
                  <span className="text-[11px] text-rose-700 dark:text-rose-300">Max file size: 10MB. Allowed formats: JPEG, JPG, PNG.</span>
                  {screenshotFile && (<span className="text-[11px] text-rose-700 dark:text-rose-300 break-all">Selected: {screenshotFile.name}</span>)}
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-rose-800 dark:text-rose-200">Transaction ID</label>
                  <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required className="w-full rounded-lg border border-rose-300 bg-white text-rose-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-100 dark:focus:ring-rose-500" placeholder="Enter payment transaction/reference ID" />
                </div>
                <div className="flex items-start gap-2">
                  <input id="confirmAttend" type="checkbox" checked={confirmAttend} onChange={(e) => setConfirmAttend(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-400 dark:border-rose-700 dark:bg-rose-900 dark:text-rose-400 dark:focus:ring-rose-500" />
                  <label htmlFor="confirmAttend" className="text-xs text-rose-800 dark:text-rose-200">I confirm my attendance and understand that cancellations are discouraged.</label>
                </div>
                <button type="submit" disabled={submitting} className="w-full sm:w-auto rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold px-5 py-2 shadow">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <button onClick={() => setShowQR(false)} className="absolute top-2 right-2 rounded-full bg-gray-100 hover:bg-gray-200 px-2 py-1 text-sm">✕</button>
            <div className="text-center mb-3 font-semibold text-gray-700">Scan to Pay</div>
            <div className="relative w-full aspect-square">
              <Image src="/images/SPARSH_QR_Code.jpeg" alt="Sparsh QR Code" fill className="object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

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
