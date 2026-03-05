'use client'

import { useCallback, useEffect, useMemo, useState, useLayoutEffect } from 'react'
import { z } from 'zod'
import { Check, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import { membershipSchema, type MembershipInput, childSchema } from '../../lib/validation'
import { uploadRegistrationTransactionScreenshot } from '../../lib/supabase'

// Presentational inputs (stable identity)
type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }
function TextInput({ label, name, error, className, required, ...rest }: TextInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
        {label}{required ? <span className="text-red-600"> *</span> : null}
      </label>
      <input id={name} name={name} required={required} {...rest} className={`w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`} />
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  )
}

  // Format toast message: make URLs clickable while preserving line breaks
  const formatToastMsg = (msg: string) => {
    const urlRegex = /(https?:\/\/\S+)/g
    const parts = msg.split(urlRegex)
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a key={`link-${idx}`} href={part} className="text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        )
      }
      return <span key={`text-${idx}`}>{part}</span>
    })
  }

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; error?: string }
function SelectInput({ label, name, error, className, required, children, ...rest }: SelectInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
        {label}{required ? <span className="text-red-600"> *</span> : null}
      </label>
      <select id={name} name={name} required={required} {...rest} className={`w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}>
        {children}
      </select>
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  )
}

// Local storage key
const DRAFT_KEY = 'membership_2026_27_draft'

const initialValues: MembershipInput = {
  full_name: '',
  residential_address: '',
  wedding_date: { day: '', month: '', year: '' },
  dob: { day: '', month: '', year: '' },
  whatsapp_number: '',
  spouse_full_name: '',
  spouse_dob: { day: '', month: '', year: '' },
  spouse_whatsapp: '',
  number_of_children: 0,
  children: [],
  membership_type: 'OLD_MEMBER',
}

const steps = [
  'Intro',
  'Member Details',
  'Spouse Details',
  'Children Count',
  'Child #1',
  'Child #2',
  'Child #3',
  'Membership Type',
  'Review',
  'Payments',
  'Submit',
] as const

function makeRange(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1)
}

const days = makeRange(31).map(String)
const months = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
]
const years = Array.from({ length: 90 }, (_, i) => String(new Date().getFullYear() - i))

export default function MembershipForm() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<MembershipInput>(initialValues)
  const [paymentTxId, setPaymentTxId] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [paymentType, setPaymentType] = useState<'CASH' | 'ONLINE' | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string; toastLink?: { href: string; label?: string } } | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [copyUrlModal, setCopyUrlModal] = useState<{ open: boolean; url: string | null }>({ open: false, url: null })

  // Cutoff date for early bird pricing (15 Feb 2026 end of day)
  const cutoffDate = useMemo(() => new Date(2026, 1, 15, 23, 59, 59), [])
  const afterCutoff = useMemo(() => new Date() > cutoffDate, [cutoffDate])
  const oldMemberPrice = afterCutoff ? 16000 : 15000
  const newMemberPrice = 16000
  const displayAmount = values.membership_type === 'OLD_MEMBER' ? oldMemberPrice : newMemberPrice

  const markTouched = useCallback((name: string) => {
    setTouched((t) => (t[name] ? t : { ...t, [name]: true }))
  }, [])
  const getError = useCallback((name: string) => (touched[name] ? errors[name] : undefined), [touched, errors])

  // Close modal helpers
  const closeToast = useCallback(() => setToast(null), [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeToast() }
    if (toast) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toast, closeToast])

  // Load draft ASAP to avoid overwriting fields after typing starts
  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setValues((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  // Autosave
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)) } catch {}
    }, 400)
    return () => clearTimeout(id)
  }, [values])

  const setField = useCallback<<K extends keyof MembershipInput>(key: K, val: MembershipInput[K]) => void>((key, val) => {
    setValues((v) => ({ ...v, [key]: val }))
  }, [])

  const stepIsValid = useMemo(() => {
    try {
      switch (step) {
        case 0:
          return true
        case 1: {
          const toCheck = {
            full_name: values.full_name,
            residential_address: values.residential_address,
            dob: values.dob,
            wedding_date: values.wedding_date,
            whatsapp_number: values.whatsapp_number,
          }
          membershipSchema.pick({ full_name: true, residential_address: true, dob: true, wedding_date: true, whatsapp_number: true }).parse(toCheck)
          return true
        }
        case 2: {
          const toCheck = {
            spouse_full_name: values.spouse_full_name,
            spouse_whatsapp: values.spouse_whatsapp,
            spouse_dob: values.spouse_dob,
          }
          membershipSchema.pick({ spouse_full_name: true, spouse_whatsapp: true, spouse_dob: true }).parse(toCheck)
          return true
        }
        case 3: {
          z.object({ number_of_children: z.number().min(0).max(3) }).parse({ number_of_children: values.number_of_children })
          return true
        }
        case 4:
        case 5:
        case 6: {
          const index = step - 4
          if (index < values.number_of_children) {
            childSchema.parse(values.children[index])
          }
          return true
        }
        case 7: {
          z.object({ membership_type: z.enum(['OLD_MEMBER','NEW_MEMBER']) }).parse({ membership_type: values.membership_type })
          return true
        }
        case 8:
          return true
        case 9: {
          // Payments step: require payment selection for all members; if ONLINE require tx id + screenshot
          if (!paymentType) return false
          if (paymentType === 'ONLINE') {
            if (!paymentTxId || !paymentTxId.trim()) return false
            if (!paymentScreenshot) return false
          }
          return true
        }
        case 10: {
          membershipSchema.parse(values)
          return true
        }
        default:
          return false
      }
    } catch (e: any) {
      return false
    }
  }, [step, values, paymentTxId, paymentScreenshot])

  const next = useCallback(() => {
    if (!stepIsValid) return
    // From Review (step 8) decide destination based on membership type
    if (step === 8) {
      // Always show Payments page next (step 9) regardless of membership type
      setStep(9)
      return
    }
    if (step < steps.length - 1) setStep((s) => s + 1)
  }, [step, stepIsValid, values.membership_type])
  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  useEffect(() => {
    setValues((v) => {
      const count = v.number_of_children
      const arr = [...v.children]
      while (arr.length < count) arr.push({ name: '', gender: 'Male', school: 'Not Applicable ( Kid is small)', other_school: '', dob: { day: '', month: '', year: '' } })
      while (arr.length > count) arr.pop()
      return { ...v, children: arr }
    })
  }, [values.number_of_children])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setToast(null)
      // Include payment fields when present
      const payload = membershipSchema.parse(values)
      const payloadWithPayment: Partial<MembershipInput> & { transaction_id?: string | null; transaction_screenshot_url?: string | null; payment_type?: string | null } = {
        ...payload,
        transaction_id: paymentTxId || null,
        transaction_screenshot_url: null, // will be set after upload if any
        payment_type: paymentType || null,
      }

      // If there's a screenshot file, upload it first and set URL
      if (paymentScreenshot) {
        const uploadedUrl = await uploadRegistrationTransactionScreenshot(paymentScreenshot, 'membership')
        if (uploadedUrl) payloadWithPayment.transaction_screenshot_url = uploadedUrl
      }

      const res = await fetch('/api/memberships/2026-27', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWithPayment),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Submission failed')

      localStorage.removeItem(DRAFT_KEY)
      const successMsg = `🎉 Welcome to JSG SPARSH!

Dear Member,

Thank you for registering with JSG SPARSH – The Most Energetic & Enthusiastic Young Couple Group (Up to 45 Years).

We are delighted to have you express your interest in becoming a part of our vibrant and dynamic community. Your registration has been successfully received.

✨ Important Note for New Members:
At present, we are not accepting any payments.
Kindly note that existing members will be given priority

Should a slot be confirmed for you, our Committee Team will personally reach out with further details, including payment instructions.

With warm regards,
Team JSG SPARSH`;
      setToast({ type: 'success', msg: successMsg })
      setStep(0)
      setValues(initialValues)
    } catch (e: any) {
      setToast({ type: 'error', msg: e?.message || 'Submission failed' })
    } finally {
      setLoading(false)
    }
  }

  const Progress = () => {
    const pct = ((step + 1) / steps.length) * 100
    return (
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-blue-700">Step {step + 1} of {steps.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{steps[step]}</div>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-yellow-500 rounded-full transition-all" style={{ width: pct + '%' }} />
        </div>
      </div>
    )
  }

  const FieldError = ({ name }: { name: string }) => {
    const msg = touched[name] ? errors[name] : undefined
    if (!msg) return null
    return <p className="text-xs text-red-600 mt-1">{msg}</p>
  }

  useEffect(() => {
    const collectErrors = () => {
      const newErr: Record<string, string> = {}
      try {
        switch (step) {
          case 1:
            membershipSchema.pick({ full_name: true, residential_address: true, dob: true, wedding_date: true, whatsapp_number: true }).parse(values)
            break
          case 2: {
            const toCheck = {
              spouse_full_name: values.spouse_full_name,
              spouse_whatsapp: values.spouse_whatsapp,
              spouse_dob: values.spouse_dob,
            }
            membershipSchema.pick({ spouse_full_name: true, spouse_whatsapp: true, spouse_dob: true }).parse(toCheck)
            break
          }
          case 3:
            z.object({ number_of_children: z.number().min(0).max(3) }).parse({ number_of_children: values.number_of_children })
            break
          case 4:
          case 5:
          case 6: {
            const i = step - 4
            if (i < values.number_of_children) childSchema.parse(values.children[i])
            break
          }
          case 7:
            z.object({ membership_type: z.enum(['OLD_MEMBER','NEW_MEMBER']) }).parse({ membership_type: values.membership_type })
            break
          case 9:
            if (values.membership_type === 'OLD_MEMBER') {
              if (!paymentType) newErr['paymentType'] = 'Select payment method'
              if (paymentType === 'ONLINE') {
                if (!paymentTxId || !paymentTxId.trim()) newErr['paymentTxId'] = 'Transaction ID required'
                if (!paymentScreenshot) newErr['paymentScreenshot'] = 'Transaction screenshot required'
              }
            }
            break
        }
      } catch (e: any) {
        if (e?.issues) {
          for (const issue of e.issues) {
            const path = issue.path.join('.')
            newErr[path] = issue.message
          }
        }
      }
      setErrors(newErr)
    }
    collectErrors()
  }, [step, values])

  const renderIntro = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-neutral-900 dark:to-neutral-900 p-4 border border-gray-100 dark:border-neutral-700">
        <h2 className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400">Registration Form</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Join a vibrant community and experience premium events, sports, and networking through the year.</p>
      </div>
      {/* Benefits - colorful emoji tiles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Highlights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-800 p-4">
            <div className="text-xl">🎉</div>
            <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">Power Pack Events</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">8+ events: outstation & religious tours, night outs, adventure, stage shows, theme parties, festivals, and more.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-800 p-4">
            <div className="text-xl">🏏</div>
            <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">Grand Cricket League</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Box and full-pitch seasons with thrilling matches.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-neutral-800 dark:to-neutral-800 p-4">
            <div className="text-xl">👥</div>
            <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">Inter‑Group Activities</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Zone, region, federation events: cricket, antakshari, and more.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800 p-4">
            <div className="text-xl">😄</div>
            <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">Loads of Fun</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Music, dance, adventure, team‑building, and unforgettable memories.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-neutral-800 dark:to-neutral-800 p-4">
            <div className="text-xl">💑</div>
            <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">Young Couple Group</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Exclusive community for couples aged ≤45 years.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-neutral-800 dark:to-neutral-800 p-4">
            <div className="text-xl">🤝</div>
            <div className="mt-1 font-semibold text-gray-800 dark:text-gray-100">Community Networking</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Build lasting connections with like‑minded members.</p>
          </div>
        </div>
      </div>
      {/* Fees - compact pricing cards */}
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Membership Fee (2026–2027)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {!afterCutoff ? (
            <>
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-neutral-800 p-4">
                <div className="text-xs inline-flex items-center rounded-full bg-green-600 text-white px-2 py-0.5">Early bird till 15 Feb 2026</div>
                <div className="mt-2 font-semibold text-gray-800 dark:text-gray-100">Old Members</div>
                <div className="text-lg font-extrabold text-green-700 dark:text-green-400 mt-1">₹15,000</div>
              </div>

              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-neutral-800 p-4">
                <div className="text-xs inline-flex items-center rounded-full bg-blue-600 text-white px-2 py-0.5">After 15 Feb</div>
                <div className="mt-2 font-semibold text-gray-800 dark:text-gray-100">Old Members</div>
                <div className="text-lg font-extrabold text-blue-700 dark:text-blue-400 mt-1">₹16,000</div>
              </div>

              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-neutral-800 p-4">
                <div className="text-xs inline-flex items-center rounded-full bg-amber-500 text-white px-2 py-0.5">Standard</div>
                <div className="mt-2 font-semibold text-gray-800 dark:text-gray-100">New Members</div>
                <div className="text-lg font-extrabold text-amber-700 dark:text-amber-400 mt-1">₹{newMemberPrice.toLocaleString('en-IN')}</div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-neutral-800 p-4 sm:col-span-1">
                <div className="text-xs inline-flex items-center rounded-full bg-blue-600 text-white px-2 py-0.5">Current</div>
                <div className="mt-2 font-semibold text-gray-800 dark:text-gray-100">Old Members</div>
                <div className="text-lg font-extrabold text-blue-700 dark:text-blue-400 mt-1">₹{oldMemberPrice.toLocaleString('en-IN')}</div>
              </div>

              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-neutral-800 p-4">
                <div className="text-xs inline-flex items-center rounded-full bg-amber-500 text-white px-2 py-0.5">Standard</div>
                <div className="mt-2 font-semibold text-gray-800 dark:text-gray-100">New Members</div>
                <div className="text-lg font-extrabold text-amber-700 dark:text-amber-400 mt-1">₹{newMemberPrice.toLocaleString('en-IN')}</div>
              </div>
            </>
          )}
        </div>
        {afterCutoff && (
          <p className="text-sm text-red-600 mt-3">Note: Early bird offer for existing members is over.</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Disclaimer: Membership is subject to approval by the managing committee. Fees once paid are non‑refundable. By submitting this form, you consent to be contacted for membership‑related communication.</p>
      </div>
    </div>
  )

  const renderMemberDetails = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <TextInput name="full_name" autoComplete="name" label="Full Name" value={values.full_name} onChange={(e) => { markTouched('full_name'); setField('full_name', e.currentTarget.value) }} placeholder="Enter your full name" required error={getError('full_name')} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="residential_address">Residential Address<span className="text-red-600"> *</span></label>
        <textarea id="residential_address" name="residential_address" autoComplete="street-address" value={values.residential_address} onChange={(e) => { markTouched('residential_address'); setField('residential_address', e.currentTarget.value) }} placeholder="Full address" className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24" required />
        <FieldError name="residential_address" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SelectInput name="dob.day" label="DOB Day" value={values.dob.day} onChange={(e) => { markTouched('dob.day'); setField('dob', { ...values.dob, day: e.currentTarget.value }) }} error={getError('dob.day')} required>
          <option value="">Day</option>
          {days.map((d) => <option key={d} value={String(d).padStart(2,'0')}>{d}</option>)}
        </SelectInput>
        <SelectInput name="dob.month" label="DOB Month" value={values.dob.month} onChange={(e) => { markTouched('dob.month'); setField('dob', { ...values.dob, month: e.currentTarget.value }) }} error={getError('dob.month')} required>
          <option value="">Month</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </SelectInput>
        <SelectInput name="dob.year" label="DOB Year" value={values.dob.year} onChange={(e) => { markTouched('dob.year'); setField('dob', { ...values.dob, year: e.currentTarget.value }) }} error={getError('dob.year')} required>
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectInput>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SelectInput name="wedding_date.day" label="Wedding Day" value={values.wedding_date.day} onChange={(e) => { markTouched('wedding_date.day'); setField('wedding_date', { ...values.wedding_date, day: e.currentTarget.value }) }} error={getError('wedding_date.day')} required>
          <option value="">Day</option>
          {days.map((d) => <option key={d} value={String(d).padStart(2,'0')}>{d}</option>)}
        </SelectInput>
        <SelectInput name="wedding_date.month" label="Wedding Month" value={values.wedding_date.month} onChange={(e) => { markTouched('wedding_date.month'); setField('wedding_date', { ...values.wedding_date, month: e.currentTarget.value }) }} error={getError('wedding_date.month')} required>
          <option value="">Month</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </SelectInput>
        <SelectInput name="wedding_date.year" label="Wedding Year" value={values.wedding_date.year} onChange={(e) => { markTouched('wedding_date.year'); setField('wedding_date', { ...values.wedding_date, year: e.currentTarget.value }) }} error={getError('wedding_date.year')} required>
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectInput>
      </div>
      <TextInput name="whatsapp_number" autoComplete="tel" label="WhatsApp Number" value={values.whatsapp_number} onChange={(e) => { markTouched('whatsapp_number'); setField('whatsapp_number', e.currentTarget.value) }} placeholder="e.g. 9876543210" inputMode="numeric" pattern="\d{10}" maxLength={10} error={getError('whatsapp_number')} required />
    </div>
  )

  const renderSpouse = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <TextInput name="spouse_full_name" autoComplete="off" label="Spouse Full Name" value={values.spouse_full_name} onChange={(e) => { markTouched('spouse_full_name'); setField('spouse_full_name', e.currentTarget.value) }} placeholder="Enter spouse full name" error={getError('spouse_full_name')} required />
      <div className="grid grid-cols-3 gap-2">
        <SelectInput name="spouse_dob.day" label="Spouse DOB Day" value={values.spouse_dob.day} onChange={(e) => { markTouched('spouse_dob.day'); setField('spouse_dob', { ...values.spouse_dob, day: e.currentTarget.value }) }} error={getError('spouse_dob.day')} required>
          <option value="">Day</option>
          {days.map((d) => <option key={d} value={String(d).padStart(2,'0')}>{d}</option>)}
        </SelectInput>
        <SelectInput name="spouse_dob.month" label="Spouse DOB Month" value={values.spouse_dob.month} onChange={(e) => { markTouched('spouse_dob.month'); setField('spouse_dob', { ...values.spouse_dob, month: e.currentTarget.value }) }} error={getError('spouse_dob.month')} required>
          <option value="">Month</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </SelectInput>
        <SelectInput name="spouse_dob.year" label="Spouse DOB Year" value={values.spouse_dob.year} onChange={(e) => { markTouched('spouse_dob.year'); setField('spouse_dob', { ...values.spouse_dob, year: e.currentTarget.value }) }} error={getError('spouse_dob.year')} required>
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectInput>
      </div>
      <TextInput name="spouse_whatsapp" autoComplete="tel" label="Spouse WhatsApp" value={values.spouse_whatsapp} onChange={(e) => { markTouched('spouse_whatsapp'); setField('spouse_whatsapp', e.currentTarget.value) }} placeholder="e.g. 9876543210" inputMode="numeric" pattern="\d{10}" maxLength={10} error={getError('spouse_whatsapp')} required />
    </div>
  )

  const renderChildrenCount = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="number_of_children">Number of Children<span className="text-red-600"> *</span></label>
      <select id="number_of_children" name="number_of_children" className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={String(values.number_of_children)} onChange={(e) => setField('number_of_children', Number(e.currentTarget.value))} required>
        {[0,1,2,3].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">You can add up to 3 children.</p>
    </div>
  )

  const renderChild = (idx: number) => {
    if (idx >= values.number_of_children) {
      return (
        <div className="p-4 sm:p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">No child in this step. You can go next.</p>
        </div>
      )
    }
    const child = values.children[idx]
    const otherSelected = child?.school === 'Other'
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_name`}>Child #{idx+1} Name<span className="text-red-600"> *</span></label>
          <input id={`child_${idx}_name`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.name || ''} onChange={(e) => {
            const arr = [...values.children]
            arr[idx] = { ...arr[idx], name: e.currentTarget.value }
            setField('children', arr)
          }} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_gender`}>Gender<span className="text-red-600"> *</span></label>
          <select id={`child_${idx}_gender`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.gender || ''} onChange={(e) => {
            const arr = [...values.children]
            arr[idx] = { ...arr[idx], gender: e.currentTarget.value as 'Male' | 'Female' }
            setField('children', arr)
          }} required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_school`}>School<span className="text-red-600"> *</span></label>
          <select id={`child_${idx}_school`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.school || ''} onChange={(e) => {
            const arr = [...values.children]
            arr[idx] = { ...arr[idx], school: e.currentTarget.value }
            setField('children', arr)
          }} required>
            <option value="Not Applicable ( Kid is small)">Not Applicable ( Kid is small)</option>
            <option value="Aaryans School">Aaryans School</option>
            <option value="Abhinava Vidyalaya">Abhinava Vidyalaya</option>
            <option value="Army Public School.">Army Public School.</option>
            <option value="Bhojwani High School">Bhojwani High School</option>
            <option value="Bishops School">Bishops School</option>
            <option value="City International School">City International School</option>
            <option value="Caelum High School">Caelum High School</option>
            <option value="Crescent High School And Junior College">Crescent High School And Junior College</option>
            <option value="Delhi Public School">Delhi Public School</option>
            <option value="Dastur School">Dastur School</option>
            <option value="EuroKids">EuroKids</option>
            <option value="Helenas">Helenas</option>
            <option value="Hume Mc Henry">Hume Mc Henry</option>
            <option value="Hutching High School">Hutching High School</option>
            <option value="Indus International (IIS) School Pune">Indus International (IIS) School Pune</option>
            <option value="Mahaveer English Medium School">Mahaveer English Medium School</option>
            <option value="Mercedes-Benz International School Pune">Mercedes-Benz International School Pune</option>
            <option value="Modern English Medium School">Modern English Medium School</option>
            <option value="ORCHIDS The International School">ORCHIDS The International School</option>
            <option value="Podar International School">Podar International School</option>
            <option value="Pushpa International School">Pushpa International School</option>
            <option value="PGKM">PGKM</option>
            <option value="Sahyadri School, Pune (KFI)">Sahyadri School, Pune (KFI)</option>
            <option value="Sinhgad Spring Dale Public School">Sinhgad Spring Dale Public School</option>
            <option value="St. Marys School">St. Marys School</option>
            <option value="Rosary School">Rosary School</option>
            <option value="St Miras School">St Miras School</option>
            <option value="St. Vincents High School">St. Vincents High School</option>
            <option value="Symbiosis International School Pune">Symbiosis International School Pune</option>
            <option value="S.M. Choksey High School">S.M. Choksey High School</option>
            <option value="Sunderji Nursery School">Sunderji Nursery School</option>
            <option value="Vibgyor">Vibgyor</option>
            <option value="VIIT School">VIIT School</option>
            <option value="Other">Other</option>
          </select>
          {otherSelected && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_other_school`}>Other School<span className="text-red-600"> *</span></label>
              <input id={`child_${idx}_other_school`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.other_school || ''} onChange={(e) => {
                const arr = [...values.children]
                arr[idx] = { ...arr[idx], other_school: e.currentTarget.value }
                setField('children', arr)
              }} required />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_dob_day`}>DOB Day<span className="text-red-600"> *</span></label>
            <select id={`child_${idx}_dob_day`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.dob?.day || ''} onChange={(e) => {
              const arr = [...values.children]
              const c = arr[idx] || { dob: { day: '', month: '', year: '' } }
              arr[idx] = { ...c, dob: { ...c.dob, day: e.currentTarget.value } }
              setField('children', arr)
            }} required>
              <option value="">Day</option>
              {days.map((d) => <option key={d} value={String(d).padStart(2,'0')}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_dob_month`}>DOB Month<span className="text-red-600"> *</span></label>
            <select id={`child_${idx}_dob_month`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.dob?.month || ''} onChange={(e) => {
              const arr = [...values.children]
              const c = arr[idx] || { dob: { day: '', month: '', year: '' } }
              arr[idx] = { ...c, dob: { ...c.dob, month: e.currentTarget.value } }
              setField('children', arr)
            }} required>
              <option value="">Month</option>
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={`child_${idx}_dob_year`}>DOB Year<span className="text-red-600"> *</span></label>
            <select id={`child_${idx}_dob_year`} className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={child?.dob?.year || ''} onChange={(e) => {
              const arr = [...values.children]
              const c = arr[idx] || { dob: { day: '', month: '', year: '' } }
              arr[idx] = { ...c, dob: { ...c.dob, year: e.currentTarget.value } }
              setField('children', arr)
            }} required>
              <option value="">Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>
    )
  }

  const renderMembershipType = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['OLD_MEMBER','NEW_MEMBER'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setField('membership_type', type)}
            className={`rounded-xl p-6 text-center transition shadow-sm border dark:border-neutral-700 flex items-center justify-center flex-col space-y-1
              ${values.membership_type === type
                ? type === 'OLD_MEMBER'
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white ring-2 ring-green-200 border-green-600'
                  : 'bg-gradient-to-r from-amber-400 to-amber-600 text-white ring-2 ring-amber-200 border-amber-600'
                : 'bg-white hover:shadow-md dark:bg-neutral-900 hover:scale-[1.01]'}
            `}
          >
            <div className="text-lg font-semibold">{type === 'OLD_MEMBER' ? 'Old Member' : 'New Member'}</div>
          </button>
        ))}

        <div className="hidden sm:block" />
      </div>
    </div>
  )

  const renderReview = () => (
    <div className="p-4 sm:p-6 space-y-4 text-sm">
      <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-4">
        <div className="font-semibold text-gray-700 dark:text-gray-100 mb-2">Primary</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div><span className="text-gray-500 dark:text-gray-300">Name:</span> <span className="text-gray-700 dark:text-gray-100">{values.full_name || '-'}</span> </div>
          <div><span className="text-gray-500 dark:text-gray-300">WhatsApp:</span> <span className="text-gray-700 dark:text-gray-100">{values.whatsapp_number || '-'}</span> </div>
          <div className="sm:col-span-2"><span className="text-gray-500 dark:text-gray-300">Address:</span> <span className="text-gray-700 dark:text-gray-100">{values.residential_address || '-'}</span> </div>
          <div><span className="text-gray-500 dark:text-gray-300">DOB:</span> <span className="text-gray-700 dark:text-gray-100">{values.dob.day || '-'}{values.dob.day && values.dob.month ? '/' : ''}{values.dob.month || '-'}{values.dob.month && values.dob.year ? '/' : ''}{values.dob.year || '-'}</span></div>
          <div><span className="text-gray-500 dark:text-gray-300">Wedding:</span> <span className="text-gray-700 dark:text-gray-100">{values.wedding_date.day || '-'}{values.wedding_date.day && values.wedding_date.month ? '/' : ''}{values.wedding_date.month || '-'}{values.wedding_date.month && values.wedding_date.year ? '/' : ''}{values.wedding_date.year || '-'}</span></div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-4">
        <div className="font-semibold text-gray-700 dark:text-gray-100 mb-2">Spouse</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div><span className="text-gray-500 dark:text-gray-300">Name:</span> <span className="text-gray-700 dark:text-gray-100">{values.spouse_full_name || '-'}</span> </div>
          <div><span className="text-gray-500 dark:text-gray-300">WhatsApp:</span> <span className="text-gray-700 dark:text-gray-100">{values.spouse_whatsapp || '-'}</span> </div>
          <div><span className="text-gray-500 dark:text-gray-300">DOB:</span> <span className="text-gray-700 dark:text-gray-100">{values.spouse_dob.day || '-'}/{values.spouse_dob.month || '-'}/{values.spouse_dob.year || '-'}</span></div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-4">
        <div className="font-semibold text-gray-700 dark:text-gray-100 mb-2">Children</div>
        {values.number_of_children === 0 && <div className="text-gray-500 dark:text-gray-300">No children</div>}
        {values.children.slice(0, values.number_of_children).map((c, i) => (
          <div key={i} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-3 mb-2 bg-white dark:bg-neutral-800">
            <div className="font-medium text-gray-800 dark:text-gray-100">Child #{i+1}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-gray-700 dark:text-gray-100">
              <div><span className="text-gray-500 dark:text-gray-300">Name:</span> <span className="text-gray-700 dark:text-gray-100">{c.name || '-'}</span> </div>
              <div><span className="text-gray-500 dark:text-gray-300">Gender:</span> <span className="text-gray-700 dark:text-gray-100">{c.gender || '-'}</span> </div>
              <div><span className="text-gray-500 dark:text-gray-300">School:</span> <span className="text-gray-700 dark:text-gray-100">{c.school === 'Other' ? (c.other_school || 'Other') : (c.school || '-')}</span> </div>
              <div><span className="text-gray-500 dark:text-gray-300">DOB:</span> <span className="text-gray-700 dark:text-gray-100">{c.dob?.day || '-'}/{c.dob?.month || '-'}/{c.dob?.year || '-'}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-4">
        <div className="font-semibold text-gray-700 dark:text-gray-100 mb-2">Membership</div>
        <div className="text-gray-800 dark:text-gray-100">{values.membership_type === 'OLD_MEMBER' ? 'Old Member' : 'New Member'}</div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-300">Kindly review all entered data carefully before proceeding. Incorrect or incomplete information may delay processing.</div>
    </div>
  )


  const renderPayments = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="space-y-3">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm text-gray-600">Amount</div>
          <div className="text-2xl font-extrabold text-gray-900">₹{displayAmount.toLocaleString('en-IN')}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-600">*</span></label>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setPaymentType('CASH'); setPaymentTxId(''); setPaymentScreenshot(null); setStep(10) }} className={`flex-1 px-4 py-3 rounded-lg border text-center transition ${paymentType==='CASH' ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="font-semibold">Cash</div>
              <div className="text-xs text-gray-500">Pay at Jain Denticure</div>
            </button>
            <button type="button" onClick={() => setPaymentType('ONLINE')} className={`flex-1 px-4 py-3 rounded-lg border text-center transition ${paymentType==='ONLINE' ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="font-semibold">Online</div>
              <div className="text-xs text-gray-500">Pay via QR / UPI and upload screenshot</div>
            </button>
          </div>
        </div>

        {paymentType === 'ONLINE' && (
          <div className="space-y-3">
            <div>
              <img src="/images/SPARSH_QR_Code.jpeg" alt="SPARSH QR" className="w-48 h-auto rounded-lg border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID <span className="text-red-600">*</span></label>
              <input value={paymentTxId} onChange={(e) => setPaymentTxId(e.currentTarget.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              {errors['paymentTxId'] ? <p className="text-xs text-red-600 mt-1">{errors['paymentTxId']}</p> : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Transaction Screenshot <span className="text-red-600">*</span></label>
              <input type="file" accept="image/*" onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} className="w-full text-sm" />
              {errors['paymentScreenshot'] ? <p className="text-xs text-red-600 mt-1">{errors['paymentScreenshot']}</p> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderSubmit = () => (
    <div className="p-4 sm:p-6">
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 text-sm">
        <p className="text-gray-700 dark:text-gray-300">Click submit to complete registration. You will receive a confirmation message if successful.</p>
        {/* Payment instructions for Cash (Old members) */}
        {values.membership_type === 'OLD_MEMBER' && paymentType === 'CASH' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="font-semibold text-gray-800 dark:text-gray-100">Cash Payment Instructions</div>
            <div className="text-sm text-gray-700 dark:text-gray-200 mt-2">
              Please pay the membership fee in person at the collection desk:
              <div className="mt-2 font-medium">Jain Denticure, Behind Shantinagar, Kondhwa</div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">Kindly complete the payment at the earliest.</div>
            </div>
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">By submitting, you agree to committee approval and non-refundable policy. Data will be used only for membership communication.</div>
      </div>
    </div>
  )

  const renderBody = () => {
    switch (step) {
      case 0: return renderIntro()
      case 1: return renderMemberDetails()
      case 2: return renderSpouse()
      case 3: return renderChildrenCount()
      case 4: return renderChild(0)
      case 5: return renderChild(1)
      case 6: return renderChild(2)
      case 7: return renderMembershipType()
      case 8: return renderReview()
      case 9: return renderPayments()
      case 10: return renderSubmit()
      default: return null
    }
  }

  return (
    <div className="relative">
      <Progress />
      {renderBody()}

      <div className="h-20" />
      <div className="fixed bottom-0 left-0 right-0 md:static bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 border-t dark:border-neutral-800 md:border-t-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 text-gray-700 dark:text-gray-100">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="ml-auto" />
          {step < steps.length - 1 ? (
            <button onClick={next} disabled={!stepIsValid || loading} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold shadow disabled:opacity-60">
              <span className="text-sm">Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!stepIsValid || loading} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-semibold shadow disabled:opacity-60">
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Submitting...</span></>) : (<><Check className="h-4 w-4" /><span>Submit</span></>)}
            </button>
          )}
        </div>
      </div>

      {/* Modal for toast messages */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeToast} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-large overflow-hidden">
            <div className={`px-4 py-3 ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white flex items-center gap-2`}>
              {toast.type === 'success' ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <div className="font-semibold">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Notice'}</div>
            </div>
            <div className="p-4 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
              <p>{formatToastMsg(toast.msg)}</p>
            </div>
            <div className="p-3 flex justify-end gap-2">
              {toast.toastLink && (
                <a href={toast.toastLink.href} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700" target="_self" rel="noopener">{toast.toastLink.label || 'Open link'}</a>
              )}
              <button onClick={closeToast} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">Close</button>
            </div>
          </div>
        </div>
      )}

      {copyUrlModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCopyUrlModal({ open: false, url: null })} />
          <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-large overflow-hidden">
            <div className="px-4 py-3 bg-blue-600 text-white font-semibold">Copy Link</div>
            <div className="p-4 space-y-3">
              <div className="text-xs text-gray-700 dark:text-gray-200 break-all border rounded p-2 bg-gray-50 dark:bg-neutral-800">
                {copyUrlModal.url}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={async () => {
                    try {
                      if (copyUrlModal.url) await navigator.clipboard.writeText(copyUrlModal.url)
                      setCopyUrlModal({ open: false, url: null })
                    } catch {}
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
                <button onClick={() => setCopyUrlModal({ open: false, url: null })} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
