'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, CalendarDays, CheckCircle2, ChevronDown, UserPlus, Wallet } from 'lucide-react'
import RegistrationStatusModal from '@/app/components/RegistrationStatusModal'
import type { RegistrationStatus } from '@/app/api/events/registration-status/route'
import {
  AGE_TIERS,
  EVENT_DATES,
  EVENT_NAME,
  EVENT_NAME_AMPERSAND,
  EVENT_NAME_LINE1,
  EVENT_NAME_LINE2,
  EVENT_SLUG,
  EVENT_SPONSOR_LINE,
  HERO_BACKGROUND_IMAGE,
  TRAVEL_NOTE,
  TRAVEL_OPTIONS,
  faqItems,
  packageIncludes,
  travelIcons,
  tripHighlights
} from './constants'
import { HampiRegistrationFormValues, FormErrors } from './types'
import { hampiRegistrationSchema } from './schema'
import SuccessModal from './components/SuccessModal'

const initialFormValues: HampiRegistrationFormValues = {
  primary_name: '',
  mobile_number: '',
  adult_count: '',
  child_above8_count: '',
  child_5_to_8_count: '',
  child_below5_count: '',
  travel_mode: '',
  below5_needs_seat: false,
  notes: ''
}

type ToastState = { open: boolean; type: 'success' | 'error' | 'info'; msg: string }

export default function HampiHeritageAdoniTirth2026Page() {
  const [formValues, setFormValues] = useState<HampiRegistrationFormValues>(initialFormValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>({ open: false, type: 'info', msg: '' })
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0)
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>('open')
  const [petals, setPetals] = useState<
    { id: number; left: number; size: number; delay: number; duration: number; drift: number; hue: 'rose' | 'amber' }[]
  >([])

  // Falling flower-petal overlay - runs continuously for the whole time the visitor is on the
  // page (unlike the Double-Cross/Goa embers/sand, which auto-hide after a few seconds), to give
  // a gentle, ongoing spiritual/pilgrimage touch.
  useEffect(() => {
    const count = 22
    const list: typeof petals = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 8 + 10,
        delay: Math.random() * 12,
        duration: Math.random() * 6 + 10,
        drift: Math.random() * 60 - 30,
        hue: Math.random() < 0.5 ? 'rose' : 'amber'
      })
    }
    setPetals(list)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/events/registration-status?slug=${EVENT_SLUG}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.status) setRegistrationStatus(data.status)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const showToast = (type: ToastState['type'], msg: string) => {
    setToast({ open: true, type, msg })
    window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000)
  }

  const updateField = (field: keyof HampiRegistrationFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const estimatedAmount = useMemo(() => {
    return AGE_TIERS.reduce((sum, tier) => {
      const count = Number(formValues[tier.key]) || 0
      return sum + count * tier.rate
    }, 0)
  }, [formValues])

  const totalMembers = useMemo(() => {
    return AGE_TIERS.reduce((sum, tier) => sum + (Number(formValues[tier.key]) || 0), 0)
  }, [formValues])

  const validateForm = () => {
    const parsed = hampiRegistrationSchema.safeParse({
      ...formValues,
      adult_count: formValues.adult_count === '' ? 0 : Number(formValues.adult_count),
      child_above8_count: formValues.child_above8_count === '' ? 0 : Number(formValues.child_above8_count),
      child_5_to_8_count: formValues.child_5_to_8_count === '' ? 0 : Number(formValues.child_5_to_8_count),
      child_below5_count: formValues.child_below5_count === '' ? 0 : Number(formValues.child_below5_count),
      notes: formValues.notes || undefined
    })

    const nextErrors: FormErrors = {}
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (typeof key === 'string') nextErrors[key] = issue.message
      })
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (registrationStatus !== 'open') {
      showToast('error', 'Registration is not currently open.')
      return
    }
    if (!validateForm()) {
      showToast('error', 'Please fix validation errors and try again.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        primary_name: formValues.primary_name.trim(),
        mobile_number: formValues.mobile_number.trim(),
        adult_count: Number(formValues.adult_count) || 0,
        child_above8_count: Number(formValues.child_above8_count) || 0,
        child_5_to_8_count: Number(formValues.child_5_to_8_count) || 0,
        child_below5_count: Number(formValues.child_below5_count) || 0,
        travel_mode: formValues.travel_mode,
        below5_needs_seat: formValues.below5_needs_seat,
        notes: formValues.notes.trim() || null
      }

      const res = await fetch(`/api/events/${EVENT_SLUG}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result?.error || 'Failed to submit registration')
      }

      setFormValues(initialFormValues)
      setSuccessModalOpen(true)
      showToast('success', 'Registration submitted successfully.')
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to submit registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white pb-12">
      {/* Falling petals overlay - continuous for as long as the visitor stays on the page */}
      <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden">
        {petals.map((p) => (
          <span
            key={p.id}
            className={`petal ${p.hue === 'rose' ? 'petal-rose' : 'petal-amber'}`}
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ['--drift' as any]: `${p.drift}px`
            }}
          />
        ))}
      </div>

      {/* Hero Banner - Vittala Temple, Hampi background photo */}
      <div className="relative h-[260px] w-full overflow-hidden sm:h-[340px] md:h-[420px]">
        <Image src={HERO_BACKGROUND_IMAGE} alt="Vittala Temple, Hampi" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-white" />
      </div>

      <section className="relative -mt-16 px-4 pb-8 sm:-mt-24 sm:px-6">
        <div className="relative mx-auto w-full max-w-4xl rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 shadow-xl sm:p-8">
          <h1 className="mt-2 text-center leading-tight">
            <span className="shine-text block text-3xl font-black sm:text-4xl">{EVENT_NAME_LINE1}</span>
            <span className="shine-text block text-2xl font-black sm:text-3xl">{EVENT_NAME_AMPERSAND}</span>
            <span className="shine-text block text-3xl font-black sm:text-4xl">{EVENT_NAME_LINE2}</span>
          </h1>
          <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5">
            <CalendarDays size={16} className="text-amber-700" />
            <span className="text-sm font-bold text-amber-800">{EVENT_DATES}</span>
          </div>
          <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
            Explore the timeless heritage of Hampi and seek divine blessings at Shri Parshwamani Jain Adoni Tirth.
          </p>
        </div>
      </section>

      {/* Trip Highlights - symmetric card grid with a gold-ringed icon badge (distinct from the sections below) */}
      <section className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 p-5 shadow-sm sm:p-7">
          <span className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
          <h2 className="relative mb-5 text-center text-base font-black uppercase tracking-widest text-amber-800 sm:text-lg">
            Trip Highlights
          </h2>
          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
            {tripHighlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="group relative flex flex-col items-center rounded-2xl border border-amber-200/70 bg-white/80 pb-3 pt-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="absolute -top-5 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white shadow-md ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
                    <Icon size={19} />
                  </span>
                  <p className="mt-2 px-1 text-[11px] font-bold leading-tight text-amber-900 sm:text-xs">{item.label}</p>
                  <span className="mt-2 h-0.5 w-6 rounded-full bg-amber-300/70" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Package Includes - checklist card (distinct format: rows, not tiles) */}
      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-black uppercase tracking-widest text-stone-700 sm:text-lg">
            Package Includes
          </h2>
          <ul className="space-y-2.5">
            {packageIncludes.map((item) => {
              const Icon = item.icon
              return (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/60 px-4 py-3"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={18} />
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Icon size={16} className="text-stone-500" />
                    {item.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Tentative Participation Charges - big-number pricing cards (distinct format: price-first cards) */}
      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white via-amber-50/40 to-white p-4 shadow-sm sm:p-6">
          <h2 className="text-center text-base font-black uppercase tracking-widest text-amber-800 sm:text-lg">
            Tentative Participation Charges
          </h2>
          <p className="mt-1 text-center text-xs text-gray-500">Prices are tentative and will be confirmed shortly.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AGE_TIERS.map((tier, idx) => {
              const accent = (['border-t-amber-500', 'border-t-orange-500', 'border-t-yellow-500', 'border-t-stone-500'] as const)[idx % 4]
              return (
                <div
                  key={tier.label}
                  className={`flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md border-t-4 ${accent}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{tier.label}</p>
                  <p className="mt-2 text-xl font-extrabold text-gray-900">
                    {tier.rate > 0 ? `₹${tier.rate.toLocaleString()}` : 'Free'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-6 rounded-3xl border border-amber-200 bg-white p-4 shadow-md sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-gray-900">
            <UserPlus size={20} />
            <h2 className="text-lg font-bold">Registration</h2>
          </div>

          {registrationStatus !== 'open' ? (
            <div className="rounded-2xl border border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-700">
                {registrationStatus === 'not_open' ? 'Registration Not Open Yet' : 'Registration Closed'}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {registrationStatus === 'not_open'
                  ? 'Registration for this trip will open shortly.'
                  : 'Registration for this trip is currently closed.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    value={formValues.primary_name}
                    onChange={(e) => updateField('primary_name', e.target.value)}
                    placeholder="Primary Contact Name *"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  />
                  {errors.primary_name ? <p className="mt-1 text-xs text-red-500">{errors.primary_name}</p> : null}
                </div>
                <div>
                  <input
                    type="tel"
                    value={formValues.mobile_number}
                    onChange={(e) => updateField('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Mobile Number *"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  />
                  {errors.mobile_number ? <p className="mt-1 text-xs text-red-500">{errors.mobile_number}</p> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="text-sm font-semibold text-amber-900">How many are travelling in your family?</p>
                <p className="mt-1 text-xs text-amber-700">Enter 0 for any tier that doesn&rsquo;t apply.</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {AGE_TIERS.map((tier) => (
                    <div key={tier.key}>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        {tier.label} {tier.rate > 0 ? `(₹${tier.rate.toLocaleString()} each)` : '(Free)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formValues[tier.key]}
                        onChange={(e) => updateField(tier.key, e.target.value ? Number(e.target.value) : '')}
                        placeholder="0"
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                      />
                    </div>
                  ))}
                </div>
                {errors.adult_count ? <p className="mt-2 text-xs text-red-500">{errors.adult_count}</p> : null}

                <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-300 bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Wallet size={16} className="text-amber-700" /> Estimated Amount
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">₹{estimatedAmount.toLocaleString()}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Tentative, not final</p>
                  </div>
                </div>
                {totalMembers > 0 ? (
                  <p className="mt-2 text-xs text-gray-500">{totalMembers} traveller{totalMembers > 1 ? 's' : ''} total</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
                <p className="text-sm font-semibold text-orange-900">Travel Mode *</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TRAVEL_OPTIONS.map((opt) => {
                    const Icon = travelIcons[opt.value]
                    const selected = formValues.travel_mode === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField('travel_mode', opt.value)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          selected ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={16} />
                          {opt.value}
                        </span>
                        {opt.note ? (
                          <span className={`text-xs font-normal ${selected ? 'text-white/80' : 'text-gray-500'}`}>{opt.note}</span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
                {errors.travel_mode ? <p className="mt-2 text-xs text-red-500">{errors.travel_mode}</p> : null}
                <p className="mt-3 text-xs leading-relaxed text-orange-800">{TRAVEL_NOTE}</p>

                {Number(formValues.child_below5_count) > 0 ? (
                  <label className="mt-3 flex items-start gap-2 rounded-xl border border-orange-300 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={formValues.below5_needs_seat}
                      onChange={(e) => updateField('below5_needs_seat', e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-orange-600"
                    />
                    <span>Tick this if a below-5 child also needs a separate/dedicated seat or berth.</span>
                  </label>
                ) : null}
              </div>

              <div>
                <textarea
                  value={formValues.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Anything else we should know? (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <h2 className="mb-3 text-base font-black uppercase tracking-widest text-gray-800 sm:text-lg">FAQs</h2>
        <div className="space-y-2">
          {faqItems.map((item, idx) => {
            const isOpen = expandedFaqIndex === idx
            return (
              <div key={item.question} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{item.question}</span>
                  <ChevronDown size={16} className={`flex-shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen ? <p className="px-4 pb-3 text-sm leading-relaxed text-gray-600">{item.answer}</p> : null}
              </div>
            )
          })}
        </div>
      </section>

      {toast.open ? (
        <div className="fixed inset-x-4 top-4 z-[120] sm:inset-x-auto sm:right-4 sm:w-[360px]">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 shadow-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <p>{toast.msg}</p>
            </div>
          </div>
        </div>
      ) : null}

      <SuccessModal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} />

      {registrationStatus !== 'open' ? (
        <RegistrationStatusModal status={registrationStatus} eventName={EVENT_NAME} />
      ) : null}

      <style jsx>{`
        .shine-text {
          background-image: linear-gradient(
            110deg,
            #b45309 30%,
            #f59e0b 42%,
            #fff7cc 50%,
            #f59e0b 58%,
            #b45309 70%
          );
          background-size: 250% 100%;
          background-position: 200% 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shineSweep 4.5s ease-in-out infinite;
        }
        @keyframes shineSweep {
          0% { background-position: 200% 0; }
          60% { background-position: -60% 0; }
          100% { background-position: -60% 0; }
        }

        .petal {
          position: fixed;
          top: -20px;
          border-radius: 50% 0 50% 50%;
          animation-name: petalFall;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          box-shadow: 0 0 6px rgba(180, 83, 9, 0.25);
        }
        .petal-rose {
          background: linear-gradient(135deg, #fda4af, #fb7185);
        }
        .petal-amber {
          background: linear-gradient(135deg, #fcd34d, #fb923c);
        }
        @keyframes petalFall {
          0% { transform: translateY(-8vh) translateX(0) rotate(0deg); opacity: 0; }
          8% { opacity: 0.9; }
          50% { transform: translateY(52vh) translateX(var(--drift)) rotate(180deg); }
          92% { opacity: 0.85; }
          100% { transform: translateY(112vh) translateX(calc(var(--drift) * -1)) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
