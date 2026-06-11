'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Waves, Music2, Goal, Hammer, Cable, Footprints, Users, Utensils, Bed, Calendar, MapPin, Clock3, Car } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: Waves, label: 'River Rafting' },
  { icon: Waves, label: 'Kayaking' },
  { icon: Music2, label: 'DJ Night / Live Band' },
  { icon: Goal, label: 'Water Volleyball' },
  { icon: Hammer, label: 'Raft Building' },
  { icon: Cable, label: 'Zipline' },
  { icon: Footprints, label: 'Waterfall Trekking' },
  { icon: Users, label: 'Fun Bonding Activities' },
  { icon: Utensils, label: 'Delicious Food' },
  { icon: Bed, label: 'Comfortable Stay' },
]

const PRICING = {
  individual: 2500,
  couple: 5000,
  kids5to8: 1500,
  kids8plus: 4000,
  guest: 5000,
  rafting: 1200,
}

type Sprinkle = { id: number; left: number; size: number; delay: number; duration: number }

export default function AdventureEscape2026Page() {
  const [sprinkles, setSprinkles] = useState<Sprinkle[]>([])
  const [hideSprinkles, setHideSprinkles] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    paxMode: 'individual' as 'individual' | 'couple',
    kids5to8Enabled: false,
    kids5to8Count: '0',
    kids8plusEnabled: false,
    kids8plusCount: '0',
    guestEnabled: false,
    guestCount: '0',
    comingByOwnCar: true,
    raftingAddon: false,
    raftingCount: '0',
    raftingEligibilityConfirmed: false,
    riskTermsAccepted: false,
  })

  useEffect(() => {
    const count = 38
    const list: Sprinkle[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 5 + 3,
        delay: Math.random() * 1.6,
        duration: Math.random() * 2.8 + 3.5,
      })
    }
    setSprinkles(list)
    const t = setTimeout(() => setHideSprinkles(true), 6500)
    return () => clearTimeout(t)
  }, [])

  const kids5to8 = form.kids5to8Enabled ? Number(form.kids5to8Count || 0) : 0
  const kids8plus = form.kids8plusEnabled ? Number(form.kids8plusCount || 0) : 0
  const guestCount = form.guestEnabled ? Number(form.guestCount || 0) : 0
  const raftingCount = form.raftingAddon ? Number(form.raftingCount || 0) : 0
  const base = form.paxMode === 'couple' ? PRICING.couple : PRICING.individual

  const totalAmount = useMemo(
    () => base + kids5to8 * PRICING.kids5to8 + kids8plus * PRICING.kids8plus + guestCount * PRICING.guest + raftingCount * PRICING.rafting,
    [base, kids5to8, kids8plus, guestCount, raftingCount]
  )

  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    const checked = target.checked
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validate = () => {
    if (!form.fullName.trim()) return 'Full Name is required.'
    if (!/^\d{10}$/.test(form.mobile)) return 'Enter a valid 10-digit mobile number.'
    if (form.kids5to8Enabled && Number(form.kids5to8Count || 0) <= 0) return 'Enter Kids (5-8) count.'
    if (form.kids8plusEnabled && Number(form.kids8plusCount || 0) <= 0) return 'Enter Kids (8+) count.'
    if (form.guestEnabled && Number(form.guestCount || 0) <= 0) return 'Enter Guest count.'
    if (form.raftingAddon) {
      if (Number(form.raftingCount || 0) <= 0) return 'Enter river rafting participant count.'
      if (!form.raftingEligibilityConfirmed) return 'Please confirm rafting eligibility.'
    }
    if (!form.riskTermsAccepted) return 'Please accept adventure risk terms.'
    return null
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/adventure-escape-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          mobile: form.mobile,
          paxMode: form.paxMode,
          kids5to8Count: form.kids5to8Enabled ? Number(form.kids5to8Count || 0) : 0,
          kids8plusCount: form.kids8plusEnabled ? Number(form.kids8plusCount || 0) : 0,
          guestCount: form.guestEnabled ? Number(form.guestCount || 0) : 0,
          comingByOwnCar: form.comingByOwnCar,
          raftingAddon: form.raftingAddon,
          raftingCount: form.raftingAddon ? Number(form.raftingCount || 0) : 0,
          raftingEligibilityConfirmed: form.raftingEligibilityConfirmed,
          riskTermsAccepted: form.riskTermsAccepted,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data?.details?.[0] || data?.error || 'Failed to submit')

      setSuccess(true)
      setForm({
        fullName: '', mobile: '', paxMode: 'individual',
        kids5to8Enabled: false, kids5to8Count: '0',
        kids8plusEnabled: false, kids8plusCount: '0',
        guestEnabled: false, guestCount: '0',
        comingByOwnCar: true,
        raftingAddon: false, raftingCount: '0', raftingEligibilityConfirmed: false,
        riskTermsAccepted: false,
      })
    } catch (err: any) {
      setError(err?.message || 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-emerald-50 to-orange-50 text-slate-800'>
      {!hideSprinkles && (
        <div className='pointer-events-none absolute inset-0 z-20'>
          {sprinkles.map(s => (
            <span
              key={s.id}
              className='absolute animate-sprinkle rounded-full bg-sky-200/90 shadow-[0_0_6px_rgba(14,165,233,0.5)]'
              style={{ left: `${s.left}vw`, top: '-18px', width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
            />
          ))}
        </div>
      )}

      <section className='relative h-[74vh] min-h-[540px] w-full overflow-hidden'>
        <Image src='/images/KOLAD.jpg' alt='Adventure Escape 2026' fill priority className='object-cover object-center scale-105' />
        <div className='absolute inset-0 bg-gradient-to-b from-slate-900/60 via-emerald-900/45 to-sky-900/70' />
        <div className='absolute inset-0 flex items-center'>
          <div className='mx-auto w-full max-w-6xl px-4 sm:px-6'>
            <div className='max-w-3xl rounded-[1.8rem] border border-white/35 bg-white/12 p-6 shadow-2xl backdrop-blur-xl sm:p-8'>
              <p className='mb-2 inline-flex rounded-full bg-orange-500/95 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white'>Weekend Trip</p>
              <h1 className='text-3xl font-black leading-tight text-white drop-shadow sm:text-5xl'>🏕️ Adventure Escape 2026</h1>
              <div className='mt-5 grid gap-2 text-sm text-white sm:grid-cols-3'>
                <p className='inline-flex items-center gap-1.5'><Calendar size={15} /> 4th - 5th July 2026</p>
                <p className='inline-flex items-center gap-1.5'><Clock3 size={15} /> 1 Night, 2 Days</p>
                <p className='inline-flex items-center gap-1.5'><MapPin size={15} /> Kolad, Maharashtra</p>
              </div>
              <a href='#register' className='mt-6 inline-flex rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110'>Register Now</a>
            </div>
          </div>
        </div>
      </section>

      <main className='mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6'>
        <section className='rounded-2xl border border-sky-200 bg-white/80 p-4 shadow-sm backdrop-blur'>
          <p className='text-sm font-semibold text-slate-700'>💵 Fees to be paid in cash on or before <span className='text-red-600'>Monday 15 June</span> at either:</p>
          <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700'>
            <li><strong>Dr. Ashika Rathod</strong>, Jain Denticure, Kondhwa, Pune (Only on 15th June 7pm - 10pm)</li>
            <li><strong>Mukesh Jain</strong>, M.A. Hardware, Guruwar Peth, Pune</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-5 text-2xl font-extrabold text-slate-900'>What Awaits You?</h2>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className='rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md'>
                <Icon className='mb-2 text-sky-600' size={20} />
                <p className='text-sm font-semibold text-slate-700'>{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='grid gap-4 md:grid-cols-2'>
          <div className='rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-3 text-xl font-bold text-emerald-700'>Stay</h3>
            <ul className='space-y-2 text-sm text-slate-700'>
              <li>• 1 Night Stay</li>
              <li>• 6 Person Sharing Accommodation</li>
              <li>• Separate arrangement for:</li>
              <li className='pl-4'>- Male</li>
              <li className='pl-4'>- Female</li>
              <li className='pl-4'>- Kids</li>
            </ul>
          </div>
          <div className='rounded-2xl border border-orange-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-3 text-xl font-bold text-orange-600'>Food Included</h3>
            <ul className='space-y-2 text-sm text-slate-700'>
              <li>• 3 Full Meals</li>
              <li>• 1 Breakfast</li>
              <li>• 2 High Tea Sessions</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className='mb-5 text-2xl font-extrabold text-slate-900'>Pricing</h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <p className='text-sm font-semibold'>Individual Member</p>
              <p className='mt-2 text-2xl font-black'>₹2,499</p>
              <p className='mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700'>First 50 couples: ₹2,499 · Then ₹2,999</p>
            </div>
            <div className='relative rounded-2xl border border-orange-400 bg-orange-50 p-4 shadow-sm'>
              <span className='absolute -top-2 right-3 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white'>Most Popular</span>
              <p className='text-sm font-semibold'>Couple</p>
              <p className='mt-2 text-2xl font-black'>₹5,000</p>
            </div>
            <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-sm font-semibold'>Kids (Age 5-8)</p><p className='mt-2 text-2xl font-black'>₹1,500</p></div>
            <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-sm font-semibold'>Kids (Age 8+)</p><p className='mt-2 text-2xl font-black'>₹4,000</p></div>
            <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'><p className='text-sm font-semibold'>Guest Individual</p><p className='mt-2 text-2xl font-black'>₹5,000</p></div>
          </div>
        </section>

        <section className='rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 to-emerald-50 p-6'>
          <h2 className='text-xl font-extrabold text-slate-900'>Optional Add-on • River Rafting Adventure</h2>
          <p className='mt-2 text-sm text-slate-700'>₹1,200 per person • Includes 13 KM river rafting with 12 rapids, plus to and fro transport from resort.</p>
          <p className='mt-1 text-xs text-slate-600'>Eligibility: Minimum Age 14 Years • Minimum Weight 40 KG</p>
        </section>

        <section className='grid gap-4 md:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6'>
            <h3 className='mb-3 text-lg font-bold text-slate-900'>Day 1</h3>
            <ul className='space-y-1.5 text-sm text-slate-700'>
              <li>• Arrival & Welcome at 11:00 AM</li>
              <li>• River Rafting</li>
              <li>• Kayaking</li>
              <li>• Water Volleyball</li>
              <li>• DJ Night / Live Band</li>
              <li>• Dinner & Stay</li>
            </ul>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-6'>
            <h3 className='mb-3 text-lg font-bold text-slate-900'>Day 2</h3>
            <ul className='space-y-1.5 text-sm text-slate-700'>
              <li>• Breakfast</li>
              <li>• Waterfall Trekking</li>
              <li>• Zipline</li>
              <li>• Raft Building</li>
                          <li>• Team Bonding Activities</li>
              <li>• Lunch</li>
              <li>• Departure</li>
            </ul>
          </div>
        </section>

        <section id='register' className='rounded-3xl border border-sky-200 bg-white p-6 shadow-sm sm:p-8'>
          <h2 className='text-2xl font-extrabold text-slate-900'>Register for Adventure Escape</h2>
          <p className='mt-1 text-sm text-slate-600'>Package is from Kolad to Kolad. Transportation has to be managed by self.</p>

          <form onSubmit={submit} className='mt-5 space-y-4'>

            <div className='grid gap-4 md:grid-cols-2'>
              <input name='fullName' value={form.fullName} onChange={onChange} placeholder='Full Name' className='rounded-xl border border-slate-300 px-3 py-2 text-sm' required />
              <input name='mobile' value={form.mobile} onChange={onChange} placeholder='Mobile Number' className='rounded-xl border border-slate-300 px-3 py-2 text-sm' required />
            </div>

            <div className='rounded-xl border border-slate-200 p-4'>
              <p className='text-sm font-semibold text-slate-800'>Pax Count</p>
              <div className='mt-3 flex flex-wrap gap-4'>
                <label className='inline-flex items-center gap-2 text-sm'><input type='radio' name='paxMode' value='individual' checked={form.paxMode === 'individual'} onChange={onChange} /> Individual Member</label>
                <label className='inline-flex items-center gap-2 text-sm'><input type='radio' name='paxMode' value='couple' checked={form.paxMode === 'couple'} onChange={onChange} /> Couple</label>
              </div>

              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                <div className='rounded-lg border border-slate-200 p-3'>
                  <label className='inline-flex items-center gap-2 text-sm font-medium'>
                    <input type='checkbox' checked={form.kids5to8Enabled} onChange={(e) => setForm(prev => ({ ...prev, kids5to8Enabled: e.target.checked, kids5to8Count: e.target.checked ? (prev.kids5to8Count === '0' ? '1' : prev.kids5to8Count) : '0' }))} /> Kids 5-8
                  </label>
                  <input type='number' min='0' name='kids5to8Count' value={form.kids5to8Count} onChange={onChange} disabled={!form.kids5to8Enabled} className='mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400' placeholder='Count' />
                </div>
                <div className='rounded-lg border border-slate-200 p-3'>
                  <label className='inline-flex items-center gap-2 text-sm font-medium'>
                    <input type='checkbox' checked={form.kids8plusEnabled} onChange={(e) => setForm(prev => ({ ...prev, kids8plusEnabled: e.target.checked, kids8plusCount: e.target.checked ? (prev.kids8plusCount === '0' ? '1' : prev.kids8plusCount) : '0' }))} /> Kids 8+
                  </label>
                  <input type='number' min='0' name='kids8plusCount' value={form.kids8plusCount} onChange={onChange} disabled={!form.kids8plusEnabled} className='mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400' placeholder='Count' />
                </div>
                <div className='rounded-lg border border-slate-200 p-3'>
                  <label className='inline-flex items-center gap-2 text-sm font-medium'>
                    <input type='checkbox' checked={form.guestEnabled} onChange={(e) => setForm(prev => ({ ...prev, guestEnabled: e.target.checked, guestCount: e.target.checked ? (prev.guestCount === '0' ? '1' : prev.guestCount) : '0' }))} /> Guest
                  </label>
                  <input type='number' min='0' name='guestCount' value={form.guestCount} onChange={onChange} disabled={!form.guestEnabled} className='mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400' placeholder='Count' />
                </div>
              </div>
            </div>

            <div className='rounded-xl border border-slate-200 p-4'>
              <p className='text-sm font-semibold text-slate-800 inline-flex items-center gap-2'><Car size={15} /> Coming by own car?</p>
              <div className='mt-2 flex gap-4'>
                <label className='inline-flex items-center gap-2 text-sm'><input type='radio' checked={form.comingByOwnCar === true} onChange={() => setForm(prev => ({ ...prev, comingByOwnCar: true }))} /> Yes</label>
                <label className='inline-flex items-center gap-2 text-sm'><input type='radio' checked={form.comingByOwnCar === false} onChange={() => setForm(prev => ({ ...prev, comingByOwnCar: false }))} /> No</label>
              </div>
              <p className='mt-1 text-xs text-slate-600'>Note: Package is from Kolad to Kolad. Transportation has to be managed by self.</p>
            </div>

            <div className='rounded-xl border border-sky-200 bg-sky-50 p-4'>
              <label className='inline-flex items-start gap-2 text-sm font-medium text-slate-700'><input type='checkbox' name='raftingAddon' checked={form.raftingAddon} onChange={onChange} className='mt-0.5' /> Add River Rafting (+ ₹1,200 per person)</label>
              <p className='mt-1 text-xs text-slate-600'>Includes 13 KM rafting with 12 rapids, plus to and fro transport from resort.</p>
              <p className='text-xs text-slate-600'>Eligibility: 14+ age and 40+ KG weight.</p>
              {form.raftingAddon && (
                <>
                  <input type='number' min='1' name='raftingCount' value={form.raftingCount} onChange={onChange} placeholder='Rafting participant count' className='mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm' />
                  <label className='mt-3 inline-flex items-start gap-2 text-xs text-slate-700'><input type='checkbox' name='raftingEligibilityConfirmed' checked={form.raftingEligibilityConfirmed} onChange={onChange} className='mt-0.5' /> I confirm participants meet rafting eligibility.</label>
                </>
              )}
            </div>

            <label className='inline-flex items-start gap-2 text-sm text-slate-700'><input type='checkbox' name='riskTermsAccepted' checked={form.riskTermsAccepted} onChange={onChange} className='mt-0.5' /> I understand that adventure activities involve inherent risks and I participate at my own responsibility.</label>

            <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'>
              <p className='font-semibold'>Estimated Total: ₹{totalAmount.toLocaleString('en-IN')}</p>
              <p className='mt-1 text-xs'>
                Base ({form.paxMode === 'couple' ? 'Couple' : 'Individual'}): ₹{base.toLocaleString('en-IN')}
                {kids5to8 > 0 ? ` + Kids 5-8 (${kids5to8}): ₹${(kids5to8 * PRICING.kids5to8).toLocaleString('en-IN')}` : ''}
                {kids8plus > 0 ? ` + Kids 8+ (${kids8plus}): ₹${(kids8plus * PRICING.kids8plus).toLocaleString('en-IN')}` : ''}
                {guestCount > 0 ? ` + Guests (${guestCount}): ₹${(guestCount * PRICING.guest).toLocaleString('en-IN')}` : ''}
                {raftingCount > 0 ? ` + Rafting (${raftingCount}): ₹${(raftingCount * PRICING.rafting).toLocaleString('en-IN')}` : ''}
              </p>
            </div>

            <div className='rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900'>
              <p className='font-semibold'>💵 Fees to be paid in cash on or before <span className='text-red-600'>Monday 15 June</span> at either:</p>
              <ul className='mt-2 list-disc space-y-1 pl-4'>
                              <li><strong>Dr. Ashika Rathod</strong>, Jain Denticure, Kondhwa, Pune (Only on 15th June 7pm - 10pm)</li>
                <li><strong>Mukesh Jain</strong>, M.A. Hardware, Guruwar Peth, Pune</li>
              </ul>
              <p className='mt-2 font-medium text-orange-800'>Registration will be confirmed once your payment is received.</p>
            </div>

            <button type='submit' disabled={submitting} className='w-full rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-md disabled:opacity-60'>
              {submitting ? 'Submitting...' : 'Register for Adventure Escape'}
            </button>

            {error && <div className='rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>}
          </form>
        </section>
      </main>

      {success && (
        <div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl sm:p-6'>
            <h3 className='text-xl font-extrabold text-emerald-700'>Thanks for registering! ✅</h3>
            <p className='mt-3 text-sm font-semibold text-slate-700'>💵 Fees to be paid in cash on or before <span className='text-red-600'>Monday 15 June</span> at either:</p>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700'>
                          <li><strong>Dr. Ashika Rathod</strong>, Jain Denticure, Kondhwa, Pune (Only on 15th June 7pm - 10pm)</li>
              <li><strong>Mukesh Jain</strong>, M.A. Hardware, Guruwar Peth, Pune</li>
            </ul>
            <p className='mt-2 text-sm font-medium text-emerald-700'>Registration will be confirmed once your payment is received.</p>
            <button onClick={() => setSuccess(false)} className='mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white'>Close</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sprinkle {
          0% { transform: translateY(-20px) scale(0.8); opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { transform: translateY(110vh) scale(1); opacity: 0; }
        }
        .animate-sprinkle {
          animation-name: sprinkle;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }
      `}</style>
    </div>
  )
}
