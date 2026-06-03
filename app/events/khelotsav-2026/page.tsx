'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
    CalendarDays,

  CheckCircle2,
  Clock3,
  CreditCard,
  Dumbbell,
  Info,
  Loader2,
  MapPinnedIcon,
  Medal,
  Shirt,
  Sparkles,
  Star,
  Target,
  Trophy,
  Upload,
  User,
  Users,
  Wallet,
  Zap
} from 'lucide-react'
import { supabase, uploadRegistrationTransactionScreenshot } from '@/lib/supabase'
import { detectTransactionReferenceFromImage } from '../sparsh-cricket-championship-season-02/utils'
import SuccessModal from './components/SuccessModal'
import { EVENT_NAME, eventHighlights, jerseySizes, sports } from './constants'
import { khelotsavRegistrationSchema } from './schema'
import { FormErrors, KhelotsavRegistrationFormValues, KhelotsavRegistrationPayload } from './types'

const initialValues: KhelotsavRegistrationFormValues = {
  name: '',
  mobile: '',
  date_of_birth: '',
  gender: '',
  category: '',
  jersey_size: '',
  selected_sports: [],
  sport_ratings: {},
  transaction_id: ''
}

type ToastState = { open: boolean; type: 'success' | 'error' | 'info'; message: string }

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

function computeFee(category: string, gender: string, age: number | null): number {
  if (category === 'Member') {
    if (gender === 'Female') return 0
    return 500
  }
  if (category === 'Kid') {
    if (age === null || age < 5) return 0
    if (age < 10) return 600
    return 900
  }
  return 0
}

export default function Khelotsav2026Page() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const [formValues, setFormValues] = React.useState<KhelotsavRegistrationFormValues>(initialValues)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [paymentScreenshotFile, setPaymentScreenshotFile] = React.useState<File | null>(null)
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = React.useState('')
  const [previewUrl, setPreviewUrl] = React.useState('')

  const [uploadingScreenshot, setUploadingScreenshot] = React.useState(false)
  const [detectingReference, setDetectingReference] = React.useState(false)
  const [ocrSuccess, setOcrSuccess] = React.useState(false)
  const [genderChangeNote, setGenderChangeNote] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [toast, setToast] = React.useState<ToastState>({ open: false, type: 'info', message: '' })
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [showClosedModal, setShowClosedModal] = React.useState(true)

  const selectedCount = formValues.selected_sports.length
  const age = formValues.date_of_birth ? calculateAge(formValues.date_of_birth) : null
  const isKidBelowTen = formValues.category === 'Kid' && typeof age === 'number' && age < 5
  const isFemaleMember = formValues.gender === 'Female' && formValues.category === 'Member'
  const computedFee = computeFee(formValues.category, formValues.gender, age)
  const paymentRequired = computedFee > 0

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ open: true, type, message })
    window.setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3500)
  }

  const updateField = <K extends keyof KhelotsavRegistrationFormValues>(field: K, value: KhelotsavRegistrationFormValues[K]) => {
    setFormValues((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'category' && value === 'Kid') {
        // Clear jersey size only if current age is below 10 (or not yet entered)
        const currentAge = prev.date_of_birth ? calculateAge(prev.date_of_birth) : null
        if (currentAge === null || currentAge < 10) {
          next.jersey_size = ''
        }
      }
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleGenderChange = (gender: 'Male' | 'Female') => {
    const invalidSelected = formValues.selected_sports.filter((sportName) => {
      const sportConfig = sports.find((sport) => sport.name === sportName)
      return Boolean(sportConfig?.gender && sportConfig.gender !== gender)
    })

    const nextSports = formValues.selected_sports.filter((sportName) => !invalidSelected.includes(sportName))
    const nextRatings = { ...formValues.sport_ratings }
    invalidSelected.forEach((sportName) => delete nextRatings[sportName])

    setFormValues((prev) => ({
      ...prev,
      gender,
      selected_sports: nextSports,
      sport_ratings: nextRatings
    }))

    setErrors((prev) => ({ ...prev, gender: '', selected_sports: '' }))

    if (invalidSelected.length > 0) {
      setGenderChangeNote(`${invalidSelected.join(', ')} removed as it is not available for ${gender} participants.`)
    } else {
      setGenderChangeNote('')
    }
  }

  const toggleSport = (sportName: string) => {
    const sportConfig = sports.find((sport) => sport.name === sportName)

    if (sportConfig?.gender && sportConfig.gender !== formValues.gender) {
      setErrors((prev) => ({ ...prev, selected_sports: `${sportName} is available only for ${sportConfig.gender} participants.` }))
      return
    }

    if (formValues.selected_sports.includes(sportName)) {
      const nextSports = formValues.selected_sports.filter((sport) => sport !== sportName)
      const nextRatings = { ...formValues.sport_ratings }
      delete nextRatings[sportName]
      setFormValues((prev) => ({ ...prev, selected_sports: nextSports, sport_ratings: nextRatings }))

      setErrors((prev) => ({ ...prev, selected_sports: '', sport_ratings: '' }))
      return
    }

    if (formValues.selected_sports.length >= 4) {
      setErrors((prev) => ({ ...prev, selected_sports: 'You can select maximum 4 sports.' }))
      return
    }

    setFormValues((prev) => ({
      ...prev,
      selected_sports: [...prev.selected_sports, sportName]
    }))
    setErrors((prev) => ({ ...prev, selected_sports: '' }))
  }

  const setSportRating = (sportName: string, rating: number) => {
    setFormValues((prev) => ({
      ...prev,
      sport_ratings: {
        ...prev.sport_ratings,
        [sportName]: rating
      }
    }))
    setErrors((prev) => ({ ...prev, sport_ratings: '' }))
  }

  const handleScreenshotChange = async (file: File | null) => {
    setErrors((prev) => ({ ...prev, payment_screenshot_url: '' }))
    setOcrSuccess(false)

    if (!file) {
      setPaymentScreenshotFile(null)
      setPaymentScreenshotUrl('')
      setPreviewUrl('')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, payment_screenshot_url: 'File size must be less than 10MB.' }))
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (allowedTypes.indexOf(file.type) === -1) {
      setErrors((prev) => ({ ...prev, payment_screenshot_url: 'Only JPG, JPEG, PNG are allowed.' }))
      return
    }

    setPaymentScreenshotFile(file)
    setPreviewUrl(URL.createObjectURL(file))

    setUploadingScreenshot(true)
    try {
      const uploadId = `khelotsav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const uploadedUrl = await uploadRegistrationTransactionScreenshot(file, uploadId)
      if (!uploadedUrl) {
        setErrors((prev) => ({ ...prev, payment_screenshot_url: 'Failed to upload screenshot. Please try again.' }))
        return
      }
      setPaymentScreenshotUrl(uploadedUrl)
    } finally {
      setUploadingScreenshot(false)
    }

    setDetectingReference(true)
    try {
      const detectedReference = await detectTransactionReferenceFromImage(file)
      if (detectedReference) {
        updateField('transaction_id', detectedReference)
        setOcrSuccess(true)
      }
    } finally {
      setDetectingReference(false)
    }
  }

  function getValidationSummary(nextErrors: FormErrors): string {
    const fieldLabels: Record<string, string> = {
      name: 'Name',
      mobile: 'Mobile Number',
      date_of_birth: 'Date of Birth',
      gender: 'Gender',
      category: 'Category',
      jersey_size: 'Jersey Size',
      selected_sports: 'Selected Sports',
      sport_ratings: 'Sport Ratings',
      payment_screenshot_url: 'Payment Screenshot',
      transaction_id: 'Transaction ID / UTR'
    }

    const keys = Object.keys(nextErrors)
    if (keys.length === 0) return 'Please fix validation errors and try again.'

    const labels = keys.map((key) => fieldLabels[key] || key)
    return `Please check: ${labels.join(', ')}.`
  }

  const validateForm = () => {
    const computedAge = formValues.date_of_birth ? calculateAge(formValues.date_of_birth) : NaN

    const parsed = khelotsavRegistrationSchema.safeParse({
      ...formValues,
      age: computedAge
    })

    const nextErrors: FormErrors = {}

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (typeof key === 'string') nextErrors[key] = issue.message
      })
    }

    if (paymentRequired) {
      if (!paymentScreenshotFile || !paymentScreenshotUrl) {
        nextErrors.payment_screenshot_url = 'Payment screenshot is required.'
      }

      if (!formValues.transaction_id.trim()) {
        nextErrors.transaction_id = 'Transaction ID is required.'
      }
    }

    if (formValues.selected_sports.length > 0) {
      const unratedSports = formValues.selected_sports.filter((sportName) => {
        const rating = formValues.sport_ratings[sportName]
        return !(typeof rating === 'number' && rating >= 1 && rating <= 5)
      })
      if (unratedSports.length > 0) {
        nextErrors.sport_ratings = 'Please provide rating for all selected sports.'
      }
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      console.group('[Khelotsav 2026] Validation failed')
      console.log('Form values:', formValues)
      console.log('Computed age:', computedAge)
      console.log('Computed fee:', computedFee)
      console.log('Payment required:', paymentRequired)
      console.log('Validation errors:', nextErrors)
      console.groupEnd()
    }

    return {
      isValid: Object.keys(nextErrors).length === 0,
      nextErrors
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccessMessage('')

    if (isKidBelowTen) {
      setErrors((prev) => ({
        ...prev,
        date_of_birth: 'Kids below 5 years can attend and enjoy the event, but registration is not required.'
      }))
      showToast('info', 'Registration is not required for kids below 5 years.')
      return
    }

    const validation = validateForm()
    if (!validation.isValid) {
      showToast('error', getValidationSummary(validation.nextErrors))
      return
    }

    setSubmitting(true)
    try {
      const participantAge = calculateAge(formValues.date_of_birth)
      const feeForPayload = computeFee(formValues.category, formValues.gender, participantAge)
      const payload: KhelotsavRegistrationPayload = {
        event_name: EVENT_NAME,
        name: formValues.name.trim(),
        mobile: formValues.mobile.trim(),
        date_of_birth: formValues.date_of_birth,
        age: participantAge,
        gender: formValues.gender as 'Male' | 'Female',
        category: formValues.category as 'Member' | 'Kid',
        jersey_size: (formValues.category === 'Member' || (formValues.category === 'Kid' && participantAge >= 10))
          ? formValues.jersey_size
          : '',
        selected_sports: formValues.selected_sports,
        sport_ratings: formValues.sport_ratings,
        fee_amount: feeForPayload,
        is_refundable: formValues.category === 'Member' && formValues.gender !== 'Female',
        transaction_id: paymentRequired ? formValues.transaction_id.trim() : '',
        payment_screenshot_url: paymentRequired ? paymentScreenshotUrl : '',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase.from('sparsh_khelotsav_registrations').insert([payload])
      if (error) throw new Error(error.message || 'Failed to submit registration')

      setFormValues(initialValues)
      setPaymentScreenshotFile(null)
      setPaymentScreenshotUrl('')
      setPreviewUrl('')
      setGenderChangeNote('')
      setSuccessMessage('Registration submitted successfully for SPARSH KHELOTSAV 2026. Further details will be shared soon.')
      setShowSuccessModal(true)
      showToast('success', 'Registration submitted successfully.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit registration. Please try again.'
      showToast('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-orange-50 to-emerald-100 pb-12 text-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <section className="relative isolate overflow-hidden hero-enter">
        <div className="relative h-[360px] w-full sm:h-[400px]">
          <Image src="/images/khelotsav-indoor-sports.svg" alt="Indoor sports arena" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-sky-100/45 to-orange-200/45 dark:from-slate-950/65 dark:via-slate-900/60 dark:to-slate-950/55" />
          <div className="pointer-events-none absolute inset-0">
            <div className="float-sport absolute left-[8%] top-[18%] hidden rounded-full bg-white/50 p-2 text-orange-500 shadow-lg backdrop-blur dark:bg-slate-800/40 dark:text-orange-300 md:block"><Trophy size={16} /></div>
            <div className="float-sport delay-1 absolute right-[10%] top-[20%] hidden rounded-full bg-white/50 p-2 text-blue-500 shadow-lg backdrop-blur dark:bg-slate-800/40 dark:text-sky-300 md:block"><Dumbbell size={16} /></div>
            <div className="float-sport delay-2 absolute left-[14%] bottom-[20%] hidden rounded-full bg-white/50 p-2 text-emerald-500 shadow-lg backdrop-blur dark:bg-slate-800/40 dark:text-emerald-300 md:block"><Target size={16} /></div>
            <div className="float-sport delay-3 absolute right-[14%] bottom-[18%] hidden rounded-full bg-white/50 p-2 text-amber-500 shadow-lg backdrop-blur dark:bg-slate-800/40 dark:text-amber-300 md:block"><Medal size={16} /></div>
            <div className="float-sport delay-4 absolute left-1/2 top-[14%] hidden -translate-x-1/2 rounded-full bg-white/50 p-2 text-violet-500 shadow-lg backdrop-blur dark:bg-slate-800/40 dark:text-violet-300 md:block"><Zap size={16} /></div>
          </div>

          <div className="absolute inset-x-4 top-8 mx-auto max-w-5xl sm:top-12 sm:inset-x-6">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 text-center shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/55 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-cyan-200">Indoor Sports Festival</p>
              <h1 className="hero-title title-shine mt-2 inline-flex items-center justify-center gap-2 bg-clip-text text-3xl font-black tracking-[0.02em] text-transparent sm:text-5xl">
                <Sparkles size={26} className="title-pop text-orange-500 dark:text-orange-300" />
                {EVENT_NAME}
              </h1>
              <div className="energy-streak mx-auto mt-2 h-1.5 w-48 rounded-full bg-gradient-to-r from-orange-400 via-sky-500 to-emerald-400 sm:w-56" />

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 sm:text-base">
                <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white/75 px-3 py-2 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100">
                  <CalendarDays size={16} className="text-sky-600 dark:text-cyan-300" />
                  <span>Date: 21 June 2026</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white/75 px-3 py-2 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100">
                  <Clock3 size={16} className="text-green-500 dark:text-amber-300" />
                  <span>Time: 8:00 AM onwards till 6:00 PM</span>
                              </div>
                              <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white/75 px-3 py-2 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-100">
                                  <MapPinnedIcon size={16} className="text-orange-500 dark:text-amber-300" />
                                  <span>Venue: Downtown Sports Complex</span>
                              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-6 w-full max-w-5xl space-y-5 px-4 sm:px-6">
        <div className="card-enter card-shell" style={{ animationDelay: '80ms' }}>
          <p className="text-sm text-slate-700 dark:text-slate-200 sm:text-base">
            Gear up for an action-packed day filled with spirited indoor games, vibrant energy, healthy rivalry, stronger bonds, and nonstop celebration.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {eventHighlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-xl border border-sky-100 bg-white/80 px-3 py-2 text-sm shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-sky-600 dark:text-cyan-300" />
                    <span className="text-slate-700 dark:text-slate-100">{item.emoji} {item.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="card-enter card-shell" style={{ animationDelay: '130ms' }}>
            <h2 className="section-title"><User size={18} className="text-sky-600 dark:text-cyan-300" /> 1. Personal Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><User size={14} /> Name *</label>
                <input value={formValues.name} onChange={(e) => updateField('name', e.target.value)} className="input-base" placeholder="Enter full name" />
                {errors.name ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.name}</p> : null}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><Users size={14} /> Mobile Number *</label>
                <input
                  inputMode="numeric"
                  value={formValues.mobile}
                  onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="input-base"
                  placeholder="10-digit mobile number"
                />
                {errors.mobile ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.mobile}</p> : null}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><CalendarDays size={14} /> Date of Birth *</label>
                <input type="date" value={formValues.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)} className="input-base" />
                {errors.date_of_birth ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.date_of_birth}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Male', 'Female'] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => handleGenderChange(gender)}
                      className={`choice-pill ${formValues.gender === gender ? 'choice-pill-active-sky' : 'choice-pill-idle'}`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
                {errors.gender ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.gender}</p> : null}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Member', 'Kid'] as const).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => updateField('category', category)}
                      className={`choice-pill ${formValues.category === category ? 'choice-pill-active-green' : 'choice-pill-idle'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {errors.category ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.category}</p> : null}
              </div>

              {(formValues.category === 'Member' || (formValues.category === 'Kid' && typeof age === 'number' && age >= 10)) ? (
                <div className="sm:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><Shirt size={14} /> Jersey Size *</label>
                  <select value={formValues.jersey_size} onChange={(e) => updateField('jersey_size', e.target.value)} className="input-base">
                    <option value="">Select jersey size</option>
                    {jerseySizes.map((size) => (
                      <option key={size.label} value={`${size.label} - ${size.value}`}>
                        {size.label} - {size.value}
                      </option>
                    ))}
                  </select>
                  {errors.jersey_size ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.jersey_size}</p> : null}
                </div>
              ) : null}
            </div>

            {isKidBelowTen ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100">
                Kids below 10 years can attend and enjoy the event, but registration is not required.
              </div>
            ) : null}
          </section>

          <section className="card-enter card-shell" style={{ animationDelay: '180ms' }}>
            <h2 className="section-title"><Trophy size={18} className="text-orange-500 dark:text-amber-300" /> 2. Select Sports</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Selected {selectedCount} of 4 sports</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sports.map((sport) => {
                const selected = formValues.selected_sports.includes(sport.name)
                const genderMismatch = Boolean(sport.gender && sport.gender !== formValues.gender)
                const disabled = Boolean(sport.gender && !formValues.gender) || genderMismatch

                return (
                  <button
                    key={sport.name}
                    type="button"
                    onClick={() => toggleSport(sport.name)}
                    disabled={disabled}
                    className={`sport-tile ${selected ? 'sport-tile-selected' : 'sport-tile-idle'} ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
                  >
                    <p className="font-semibold">{sport.name}</p>
                    {sport.subtitle ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{sport.subtitle}</p> : null}
                  </button>
                )
              })}
            </div>
            {errors.selected_sports ? <p className="error-text mt-2 text-xs text-red-600 dark:text-red-300">{errors.selected_sports}</p> : null}
            {genderChangeNote ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{genderChangeNote}</p> : null}
          </section>

          <section className="card-enter card-shell" style={{ animationDelay: '230ms' }}>
            <h2 className="section-title"><Star size={18} className="text-amber-500 dark:text-amber-300" /> 3. Rate Your Selected Sports</h2>
            {formValues.selected_sports.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Select sports to add ratings.</p>
            ) : (
              <div className="mt-3 space-y-4">
                {formValues.selected_sports.map((sportName) => (
                  <div key={sportName} className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/65">
                    <p className="mb-2 font-medium text-slate-700 dark:text-slate-100">{sportName}</p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          type="button"
                          onClick={() => setSportRating(sportName, rating)}
                          className={`rating-chip ${formValues.sport_ratings[sportName] === rating ? 'rating-chip-active' : 'rating-chip-idle'}`}
                        >
                          <Star size={14} className="mr-1" /> {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.sport_ratings ? <p className="error-text mt-2 text-xs text-red-600 dark:text-red-300">{errors.sport_ratings}</p> : null}
          </section>

          <section className="card-enter card-shell" style={{ animationDelay: '280ms' }}>
            <h2 className="section-title"><Wallet size={18} className="text-emerald-600 dark:text-emerald-300" /> 4. Fees</h2>
            <div className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100">
              <div className="flex items-center justify-between gap-2">
                <span>👨 Member (Male)</span>
                <span className="font-semibold">₹500 <span className="text-xs font-normal opacity-80">(Refundable)</span></span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>👩 Member (Female)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-300">Considered in Spouse Fees!</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>👶 Kid (Age 5 - 10)</span>
                <span className="font-semibold">₹600</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>🧒 Kid (Age 10 &amp; above)</span>
                <span className="font-semibold">₹900</span>
              </div>
            </div>
            {(formValues.category || formValues.date_of_birth) && computedFee >= 0 && formValues.gender ? (
              <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm dark:border-sky-500/30 dark:bg-sky-500/15">
                <span className="text-slate-600 dark:text-slate-300">Your fee: </span>
                {computedFee === 0
                  ? <span className="font-bold text-emerald-600 dark:text-emerald-300">No payment required.</span>
                  : <span className="font-bold text-sky-700 dark:text-sky-300">₹{computedFee}</span>}
                {formValues.category === 'Member' && formValues.gender !== 'Female' && (
                  <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">(refundable on participation)</span>
                )}
              </div>
            ) : null}
          </section>

          {paymentRequired ? (
            <section className="card-enter card-shell" style={{ animationDelay: '330ms' }}>
              <h2 className="section-title"><CreditCard size={18} className="text-sky-600 dark:text-cyan-300" /> 5. Payment</h2>
              <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-100">
                <div className="flex items-center gap-2"><Wallet size={16} /> Pay <strong className="mx-1">₹{computedFee}</strong> via UPI and upload payment screenshot.</div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/65">
                <Image src="/images/SPARSH_QR_Code.jpeg" alt="UPI Payment QR Code" width={360} height={360} className="mx-auto h-auto w-full max-w-[260px] rounded-lg" priority />
              </div>

              <div className="mt-4">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={(e) => handleScreenshotChange(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-[46px] items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md active:scale-[0.98] dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-cyan-300">
                  <Upload size={16} /> {paymentScreenshotFile ? 'Change screenshot' : 'Upload screenshot'}
                </button>
                {uploadingScreenshot ? <p className="mt-2 flex items-center gap-2 text-xs text-sky-700 dark:text-cyan-200"><Loader2 size={14} className="animate-spin" /> Uploading screenshot...</p> : null}
                {previewUrl ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/70">
                    <Image src={previewUrl} alt="Payment screenshot preview" width={320} height={320} className="h-auto w-full rounded-lg object-cover" unoptimized />
                  </div>
                ) : null}
                {errors.payment_screenshot_url ? <p className="error-text mt-2 text-xs text-red-600 dark:text-red-300">{errors.payment_screenshot_url}</p> : null}
              </div>

              <div className="mt-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><CreditCard size={14} /> Transaction ID / UTR *</label>
                <input value={formValues.transaction_id} onChange={(e) => updateField('transaction_id', e.target.value)} placeholder="Enter or edit transaction ID" className="input-base" />
                {detectingReference ? <p className="mt-2 flex items-center gap-2 text-xs text-sky-700 dark:text-cyan-200"><Loader2 size={14} className="animate-spin" /> Detecting transaction ID from screenshot...</p> : null}
                {ocrSuccess ? <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={14} /> Transaction ID detected successfully.</p> : null}
                {errors.transaction_id ? <p className="error-text mt-1 text-xs text-red-600 dark:text-red-300">{errors.transaction_id}</p> : null}
              </div>
            </section>
          ) : isFemaleMember ? (
            <section className="card-enter card-shell" style={{ animationDelay: '330ms' }}>
              <h2 className="section-title"><CreditCard size={18} className="text-emerald-600 dark:text-emerald-300" /> 5. Payment</h2>
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100">
                <div className="flex items-center gap-2"><CheckCircle2 size={16} /> No payment required.</div>
              </div>
            </section>
          ) : null}

          <section className="card-enter rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-4 shadow-sm dark:border-amber-500/30 dark:from-amber-500/10 dark:via-slate-900 dark:to-sky-500/10" style={{ animationDelay: '360ms' }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Participant Perks</p>
                <h3 className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">Jersey & Trophy for Every Participant</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Every registered participant will receive an event jersey and a trophy to celebrate their sporting spirit.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-2xl border border-amber-200 bg-white/85 p-3 text-amber-600 shadow-sm dark:border-amber-400/30 dark:bg-slate-800/70 dark:text-amber-300">
                  <Shirt size={22} />
                </div>
                <div className="rounded-2xl border border-sky-200 bg-white/85 p-3 text-sky-600 shadow-sm dark:border-sky-400/30 dark:bg-slate-800/70 dark:text-sky-300">
                  <Trophy size={22} />
                </div>
              </div>
            </div>
          </section>

          <section className="card-enter card-shell" style={{ animationDelay: '380ms' }}>
            <h2 className="section-title"><Info size={18} className="text-violet-600 dark:text-violet-300" /> 6. Note</h2>
            <div className="mt-3 space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-100">
              <p>
                Although the above games are listed, the final list of games may be added, removed, or modified depending on participation count, venue availability, time constraints, and event committee decisions.
              </p>
              <p>Further event instructions and final schedule will be shared closer to the event date.</p>
            </div>
          </section>

          {successMessage ? (
            <div className="card-enter rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100" style={{ animationDelay: '420ms' }}>
              <div className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5" /> <span>{successMessage}</span></div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || isKidBelowTen}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-sky-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </main>

      {toast.open ? (
        <div className="fixed inset-x-4 top-4 z-50 sm:inset-x-auto sm:right-4 sm:w-[360px]">
          <div className={`rounded-xl border p-3 text-sm shadow-lg transition-all duration-300 ${toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-100' : toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-100' : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-cyan-400/40 dark:bg-cyan-500/15 dark:text-cyan-100'}`}>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onGoHome={() => router.push('https://jsg-pune-sparsh.vercel.app/')}
        onGoCommittee={() => router.push('https://jsg-pune-sparsh.vercel.app/committee')}
      />

      {/* Registration Closed Modal */}
      {showClosedModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900'>
            <div className='mb-4 flex items-center justify-center'>
              <div className='rounded-full bg-red-100 dark:bg-red-900/30 p-3'>
                <AlertCircle size={28} className='text-red-600 dark:text-red-400' />
              </div>
            </div>
            <h2 className='text-center text-xl font-bold text-gray-900 dark:text-gray-100 mb-2'>Registration Closed</h2>
            <p className='text-center text-sm text-gray-600 dark:text-gray-300 mb-6'>
              Registrations for this event are now closed. Kindly contact the committee for more details.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowClosedModal(false)}
                className='flex-1 rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition'
              >
                Close
              </button>
              <button
                onClick={() => router.push('/committee')}
                className='flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition'
              >
                Contact Committee
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .hero-enter {
          animation: fadeUp 520ms ease-out both;
        }
        .card-enter {
          opacity: 0;
          animation: fadeUp 460ms ease-out forwards;
        }
        .card-shell {
          border-radius: 1rem;
          border: 1px solid rgba(226, 232, 240, 0.95);
          background: rgba(255, 255, 255, 0.92);
          padding: 1rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.07);
          transition: transform 220ms ease-out, box-shadow 220ms ease-out;
        }
        .card-shell:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
        }
        :global(.dark) .card-shell {
          border-color: rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.78);
          box-shadow: 0 10px 28px rgba(2, 6, 23, 0.45);
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: rgb(30 41 59);
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 22px;
          border-radius: 9999px;
          background: linear-gradient(180deg, #f97316, #0ea5e9, #22c55e);
        }
        :global(.dark) .section-title {
          color: rgb(241 245 249);
        }
        .input-base {
          height: 3rem;
          width: 100%;
          border-radius: 0.85rem;
          border: 1px solid rgb(203 213 225);
          background: rgba(255, 255, 255, 0.95);
          padding: 0 0.75rem;
          font-size: 1rem;
          color: rgb(30 41 59);
          transition: all 220ms ease-out;
        }
        .input-base:focus {
          outline: none;
          border-color: rgb(14 165 233);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
        }
        :global(.dark) .input-base {
          border-color: rgb(71 85 105);
          background: rgba(15, 23, 42, 0.82);
          color: rgb(241 245 249);
        }
        .choice-pill {
          height: 3rem;
          border-radius: 0.85rem;
          border-width: 1px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 220ms ease-out;
        }
        .choice-pill:active {
          transform: scale(0.98);
        }
        .choice-pill-idle {
          border-color: rgb(203 213 225);
          background: rgba(255, 255, 255, 0.95);
          color: rgb(51 65 85);
        }
        .choice-pill-idle:hover {
          border-color: rgb(125 211 252);
          transform: translateY(-1px);
        }
        :global(.dark) .choice-pill-idle {
          border-color: rgb(71 85 105);
          background: rgba(15, 23, 42, 0.8);
          color: rgb(226 232 240);
        }
        .choice-pill-active-sky {
          border-color: rgb(125 211 252);
          background: rgba(14, 165, 233, 0.18);
          color: rgb(3 105 161);
        }
        .choice-pill-active-green {
          border-color: rgb(134 239 172);
          background: rgba(34, 197, 94, 0.15);
          color: rgb(21 128 61);
        }
        :global(.dark) .choice-pill-active-sky {
          color: rgb(186 230 253);
        }
        :global(.dark) .choice-pill-active-green {
          color: rgb(187 247 208);
        }
        .sport-tile {
          border-radius: 0.85rem;
          border-width: 1px;
          padding: 0.75rem 1rem;
          text-align: left;
          transition: all 220ms ease-out;
        }
        .sport-tile:active {
          transform: scale(0.98);
        }
        .sport-tile-idle {
          border-color: rgb(203 213 225);
          background: rgba(255, 255, 255, 0.95);
          color: rgb(51 65 85);
        }
        .sport-tile-idle:hover {
          border-color: rgb(125 211 252);
          transform: translateY(-2px);
        }
        .sport-tile-selected {
          border-color: rgb(56 189 248);
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.22), rgba(14, 165, 233, 0.2));
          color: rgb(15 23 42);
          transform: scale(1.01);
        }
        :global(.dark) .sport-tile-idle {
          border-color: rgb(71 85 105);
          background: rgba(15, 23, 42, 0.8);
          color: rgb(226 232 240);
        }
        :global(.dark) .sport-tile-selected {
          color: rgb(226 232 240);
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(14, 165, 233, 0.22));
        }
        .rating-chip {
          display: inline-flex;
          min-height: 40px;
          min-width: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          border-width: 1px;
          padding: 0 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 200ms ease-out;
        }
        .rating-chip:active {
          transform: scale(0.96);
        }
        .rating-chip-idle {
          border-color: rgb(203 213 225);
          background: white;
          color: rgb(51 65 85);
        }
        .rating-chip-idle:hover {
          border-color: rgb(251 191 36);
          transform: translateY(-1px);
        }
        .rating-chip-active {
          border-color: rgb(251 191 36);
          background: rgba(251, 191, 36, 0.22);
          color: rgb(146 64 14);
          transform: scale(1.02);
        }
        :global(.dark) .rating-chip-idle {
          border-color: rgb(71 85 105);
          background: rgba(15, 23, 42, 0.8);
          color: rgb(226 232 240);
        }
        :global(.dark) .rating-chip-active {
          color: rgb(254 243 199);
          background: rgba(251, 191, 36, 0.28);
        }
        .error-text {
          animation: errorIn 240ms ease-out both;
        }
        .hero-title {
          position: relative;
          display: inline-flex;
          isolation: isolate;
          background-image: linear-gradient(
            90deg,
            #f97316,
            #facc15,
            #22c55e,
            #3b82f6,
            #a855f7,
            #f97316
          );
          background-size: 300% 300%;
          animation: titleRise 560ms ease-out both, titleShine 3.2s ease-in-out 620ms infinite;
        }
        .title-shine::after {
          content: '';
          position: absolute;
          inset: -8% -14%;
          background: linear-gradient(110deg, transparent 32%, rgba(255, 255, 255, 0.45) 50%, transparent 68%);
          transform: translateX(-130%);
          animation: glossSweep 2.8s ease-in-out 1s infinite;
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: screen;
          opacity: 0.55;
        }
        .title-shine::before {
          content: '✦';
          position: absolute;
          right: -0.55rem;
          top: -0.45rem;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.75);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
          animation: sparklePulse 2.4s ease-in-out 1.2s infinite;
          pointer-events: none;
          z-index: 2;
        }
        :global(.dark) .hero-title {
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.35));
        }
        :global(.dark) .title-shine::after {
          opacity: 0.45;
        }
        .title-pop {
          animation: popIn 420ms ease-out both;
        }
        .energy-streak {
          position: relative;
          overflow: hidden;
          animation: streakGlow 2.4s ease-in-out infinite;
        }
        .energy-streak::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
          transform: translateX(-130%);
          animation: streakSweep 2.1s ease-in-out infinite;
        }
        .hero-chip {
          border-radius: 9999px;
          border: 1px solid rgb(186, 230, 253 / 0.95);
          background: rgba(255, 255, 255, 0.82);
          padding: 0.34rem 0.68rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: rgb(30 41 59);
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(4px);
        }
        :global(.dark) .hero-chip {
          border-color: rgba(71, 85, 105, 0.85);
          background: rgba(15, 23, 42, 0.72);
          color: rgb(226 232 240);
          box-shadow: 0 6px 16px rgba(2, 6, 23, 0.35);
        }
        @media (min-width: 640px) {
          .hero-chip {
            font-size: 0.78rem;
            padding: 0.38rem 0.75rem;
          }
        }
        .float-sport {
          animation: floatY 3.6s ease-in-out infinite;
        }
        .delay-1 { animation-delay: 300ms; }
        .delay-2 { animation-delay: 600ms; }
        .delay-3 { animation-delay: 900ms; }
        .delay-4 { animation-delay: 1200ms; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes errorIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleShine {
          0% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.22));
          }
          50% {
            background-position: 100% 50%;
            filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.32));
          }
          100% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.22));
          }
        }
        @keyframes titleRise {
          0% { opacity: 0; transform: translateY(18px) scale(0.98); }
          80% { transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes glossSweep {
          0% { transform: translateX(-130%); opacity: 0; }
          18% { opacity: 0.55; }
          55% { opacity: 0.55; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes sparklePulse {
          0%, 100% { opacity: 0.25; transform: scale(0.92); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes streakGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(14, 165, 233, 0.15);
          }
          50% {
            box-shadow: 0 0 14px rgba(14, 165, 233, 0.4);
          }
        }
        @keyframes streakSweep {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(130%); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-title,
          .title-pop,
          .title-shine::after,
          .title-shine::before,
          .energy-streak,
          .energy-streak::after {
            animation: none !important;
          }
          .hero-title {
            filter: none;
            background-position: 50% 50%;
          }
        }
      `}</style>
    </div>
  )
}
