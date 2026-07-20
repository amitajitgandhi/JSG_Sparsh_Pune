'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Upload, UserPlus, UserCircle2, Wallet } from 'lucide-react'
import { uploadPhoto, uploadRegistrationTransactionScreenshot } from '@/lib/supabase'
import {
  EVENT_NAME_LINE1,
  EVENT_NAME_LINE2,
  EVENT_SEASON,
  EVENT_SPONSOR_LINE,
  FEE_AMOUNT,
  REGISTRATION_CLOSED_STATUS,
  SLOT_CAP,
  TILE_THEME,
  faqItems,
  inclusions,
  tournamentDetails
} from './constants'
import { BoxCricketRegistrationFormValues, FormErrors } from './types'
import { boxCricketRegistrationSchema } from './schema'
import { detectTransactionReferenceFromImage } from './utils'
import SuccessModal from './components/SuccessModal'

const initialFormValues: BoxCricketRegistrationFormValues = {
  name: '',
  mobile_number: '',
  age: '',
  category: '',
  skillset: '',
  cricketing_skill: '',
  cricheroes_link: '',
  payment_method: '',
  cash_paid_to: '',
  transaction_reference_number: ''
}

type ToastState = { open: boolean; type: 'success' | 'error' | 'info'; msg: string }

export default function SparshBoxCricketMiniTournament2026Page() {
  const formRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const [formValues, setFormValues] = useState<BoxCricketRegistrationFormValues>(initialFormValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null)
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [detectingReference, setDetectingReference] = useState(false)
  const [ocrSuccess, setOcrSuccess] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>({ open: false, type: 'info', msg: '' })
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0)

  const registrationClosed = REGISTRATION_CLOSED_STATUS === 'YES'

  const showToast = (type: ToastState['type'], msg: string) => {
    setToast({ open: true, type, msg })
    window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000)
  }

  const updateField = (field: keyof BoxCricketRegistrationFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handlePhotoChange = async (file: File | null) => {
    setErrors((prev) => ({ ...prev, photo_url: '' }))

    if (!file) {
      setPhotoFile(null)
      setPhotoUrl('')
      setPhotoPreviewUrl('')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo_url: 'File size must be less than 10MB' }))
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
    if (allowedTypes.indexOf(file.type) === -1) {
      setErrors((prev) => ({ ...prev, photo_url: 'Only JPG, JPEG, PNG, HEIC are allowed' }))
      return
    }

    setPhotoFile(file)
    setPhotoPreviewUrl(URL.createObjectURL(file))

    setUploadingPhoto(true)
    try {
      const uploadId = `box-cricket-mini-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const uploadedUrl = await uploadPhoto(file, uploadId)
      if (!uploadedUrl) {
        setErrors((prev) => ({ ...prev, photo_url: 'Failed to upload photo. Please try again.' }))
        return
      }
      setPhotoUrl(uploadedUrl)
    } finally {
      setUploadingPhoto(false)
    }
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
      setErrors((prev) => ({ ...prev, payment_screenshot_url: 'File size must be less than 10MB' }))
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (allowedTypes.indexOf(file.type) === -1) {
      setErrors((prev) => ({ ...prev, payment_screenshot_url: 'Only JPG, JPEG, PNG are allowed' }))
      return
    }

    setPaymentScreenshotFile(file)
    setPreviewUrl(URL.createObjectURL(file))

    setUploadingScreenshot(true)
    try {
      const uploadId = `box-cricket-mini-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
      const detected = await detectTransactionReferenceFromImage(file)
      if (detected) {
        updateField('transaction_reference_number', detected)
        setOcrSuccess(true)
      }
    } finally {
      setDetectingReference(false)
    }
  }

  const validateForm = () => {
    const parsed = boxCricketRegistrationSchema.safeParse({
      ...formValues,
      age: formValues.age === '' ? NaN : Number(formValues.age),
      cash_paid_to: formValues.cash_paid_to || undefined,
      cricheroes_link: formValues.cricheroes_link || undefined
    })

    const nextErrors: FormErrors = {}
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (typeof key === 'string') nextErrors[key] = issue.message
      })
    }

    if (!photoFile || !photoUrl) {
      nextErrors.photo_url = 'Player photo upload is required'
    }

    if (formValues.payment_method === 'online' && (!paymentScreenshotFile || !paymentScreenshotUrl)) {
      nextErrors.payment_screenshot_url = 'Transaction screenshot upload is required for online payment'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (registrationClosed) {
      showToast('error', 'Registration is closed.')
      return
    }
    if (!validateForm()) {
      showToast('error', 'Please fix validation errors and try again.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: formValues.name.trim(),
        mobile_number: formValues.mobile_number.trim(),
        age: Number(formValues.age),
        category: formValues.category,
        skillset: formValues.skillset,
        cricketing_skill: formValues.cricketing_skill,
        cricheroes_link: formValues.cricheroes_link.trim() || null,
        photo_url: photoUrl,
        payment_method: formValues.payment_method,
        cash_paid_to: formValues.payment_method === 'cash' ? formValues.cash_paid_to : null,
        transaction_reference_number: formValues.payment_method === 'online' ? formValues.transaction_reference_number.trim() : null,
        payment_screenshot_url: formValues.payment_method === 'online' ? paymentScreenshotUrl : null
      }

      const res = await fetch('/api/events/sparsh-box-cricket-mini-tournament-2026/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result?.error || 'Failed to submit registration')
      }

      setFormValues(initialFormValues)
      setPhotoFile(null)
      setPhotoUrl('')
      setPhotoPreviewUrl('')
      setPaymentScreenshotFile(null)
      setPaymentScreenshotUrl('')
      setPreviewUrl('')
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
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <span className="fly-across absolute bottom-0 left-[18%] text-3xl md:text-4xl" aria-hidden>🏏</span>
        <span className="fly-across absolute bottom-0 left-[68%] text-2xl md:text-3xl" style={{ animationDelay: '0.35s' }} aria-hidden>⚾</span>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-4 top-24 text-2xl opacity-20 md:text-3xl">🏆</div>
        <div className="absolute bottom-24 left-4 text-xl opacity-15 md:text-2xl">🥎</div>
      </div>

      <section className="relative px-4 pb-8 pt-8 sm:px-6">
        <div className="relative mx-auto w-full max-w-4xl rounded-3xl border border-gray-200 bg-white p-5 shadow-md sm:p-8">
          <div className="sponsor-glow mx-auto w-fit rounded-2xl bg-white p-2">
            <Image
              src="/images/DIPAM.png"
              alt={EVENT_SPONSOR_LINE}
              width={1200}
              height={349}
              className="mx-auto h-auto w-full max-w-[160px]"
              priority
            />
          </div>
          <p className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-gray-500">presents</p>
          <h1 className="mt-2 text-center leading-tight">
            <span className="block bg-gradient-to-r from-blue-700 via-sky-600 to-emerald-600 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
              {EVENT_NAME_LINE1}
            </span>
            <span className="block bg-gradient-to-r from-blue-700 via-sky-600 to-emerald-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
              {EVENT_NAME_LINE2}
            </span>
          </h1>
          <h2 className="mt-1 text-center text-lg font-semibold tracking-wide text-gray-700">{EVENT_SEASON}</h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
            Get ready for an action-packed afternoon of cricket, fun, and team spirit!
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:px-6">
        {tournamentDetails.map((detail) => {
          const Icon = detail.icon
          const theme = TILE_THEME[detail.color]
          return (
            <div key={detail.label} className={`flex flex-col items-center rounded-2xl border text-center ${theme.border} ${theme.bg} p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${theme.iconBg} ${theme.iconText}`}>
                  <Icon size={15} />
                </span>
                <span className={`text-xs font-bold uppercase tracking-wide ${theme.labelText}`}>{detail.label}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-900">{detail.value}</p>
            </div>
          )
        })}
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 shadow-lg sm:p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.08),transparent_70%)]" />
          <div className="relative mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 text-lg text-white shadow-md sm:h-12 sm:w-12">🏏</div>
            <h2 className="bg-gradient-to-r from-blue-700 via-sky-700 to-emerald-700 bg-clip-text text-base font-extrabold tracking-wide text-transparent sm:text-lg md:text-xl">
              What&rsquo;s Included
            </h2>
          </div>
          <ul className="relative grid grid-cols-1 gap-2 text-sm font-medium text-gray-700 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
            {inclusions.map((item) => {
              const Icon = item.icon
              const theme = TILE_THEME[item.color]
              return (
                <li key={item.label} className="flex items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-2 shadow-sm">
                  <Icon size={16} className={theme.iconText} />
                  <span>{item.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section ref={formRef} className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-gray-900">
            <UserPlus size={20} />
            <h2 className="text-lg font-bold">
              Registration <span aria-hidden>🏏</span>
            </h2>
          </div>

          {registrationClosed ? (
            <div className="rounded-2xl border border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-700">Registration Closed</p>
              <p className="mt-2 text-sm text-gray-600">Registration for this tournament is currently closed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    value={formValues.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Full Name *"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  />
                  {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
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
                <div>
                  <input
                    type="number"
                    value={formValues.age}
                    onChange={(e) => updateField('age', e.target.value ? Number(e.target.value) : '')}
                    placeholder="Age (16+) *"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  />
                  {errors.age ? <p className="mt-1 text-xs text-red-500">{errors.age}</p> : null}
                </div>
                <div>
                  <select
                    value={formValues.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  >
                    <option value="">Category *</option>
                    <option value="Member">Member</option>
                    <option value="Kid">Kid (16+)</option>
                  </select>
                  {errors.category ? <p className="mt-1 text-xs text-red-500">{errors.category}</p> : null}
                </div>
                <div>
                  <select
                    value={formValues.skillset}
                    onChange={(e) => updateField('skillset', e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  >
                    <option value="">Skillset *</option>
                    <option>Batsman</option>
                    <option>Bowler</option>
                    <option>Allrounder</option>
                  </select>
                  {errors.skillset ? <p className="mt-1 text-xs text-red-500">{errors.skillset}</p> : null}
                </div>
                <div>
                  <select
                    value={formValues.cricketing_skill}
                    onChange={(e) => updateField('cricketing_skill', e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  >
                    <option value="">Cricketing Skill *</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advance">Advance</option>
                    <option value="Pro">Pro</option>
                  </select>
                  {errors.cricketing_skill ? <p className="mt-1 text-xs text-red-500">{errors.cricketing_skill}</p> : null}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="url"
                    value={formValues.cricheroes_link}
                    onChange={(e) => updateField('cricheroes_link', e.target.value)}
                    placeholder="CricHeroes Profile Link (optional)"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                  />
                  {errors.cricheroes_link ? <p className="mt-1 text-xs text-red-500">{errors.cricheroes_link}</p> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <UserCircle2 size={16} /> Player Photo
                </div>
                <p className="mt-1 text-xs text-gray-600">Please use a recent and HD (clear, well-lit) photo — it will be used to identify you during the auction.</p>
                <div className="mt-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/heic"
                    onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    <Upload size={16} /> {photoFile ? 'Change photo' : 'Upload photo *'}
                  </button>
                  {uploadingPhoto ? (
                    <p className="mt-2 flex items-center gap-2 text-xs text-blue-700">
                      <Loader2 size={14} className="animate-spin" /> Uploading photo...
                    </p>
                  ) : null}
                  {photoPreviewUrl ? (
                    <div className="mt-3 h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-white">
                      <Image src={photoPreviewUrl} alt="Player photo preview" width={96} height={96} className="h-full w-full object-cover" unoptimized />
                    </div>
                  ) : null}
                  {errors.photo_url ? <p className="mt-1 text-xs text-red-500">{errors.photo_url}</p> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                  <Wallet size={16} /> Payment <span aria-hidden>🥎</span>
                </div>
                <p className="mt-2 text-xs text-blue-700">Entry fee: ₹{FEE_AMOUNT} per player.</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('payment_method', 'cash')}
                    className={`h-11 rounded-xl border text-sm font-semibold transition ${
                      formValues.payment_method === 'cash'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('payment_method', 'online')}
                    className={`h-11 rounded-xl border text-sm font-semibold transition ${
                      formValues.payment_method === 'online'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    Online
                  </button>
                </div>
                {errors.payment_method ? <p className="mt-1 text-xs text-red-500">{errors.payment_method}</p> : null}

                {formValues.payment_method === 'cash' ? (
                  <div className="mt-4">
                    <select
                      value={formValues.cash_paid_to}
                      onChange={(e) => updateField('cash_paid_to', e.target.value)}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                    >
                      <option value="">Paid To *</option>
                      <option value="Amit Gandhi">Amit Gandhi</option>
                      <option value="Mukesh Jain (MA Hardware)">Mukesh Jain (MA Hardware)</option>
                      <option value="Satish Jain (Jaliwala)">Satish Jain (Jaliwala)</option>
                      <option value="Jitendra Jain (Unique Ladder)">Jitendra Jain (Unique Ladder)</option>
                    </select>
                    {errors.cash_paid_to ? <p className="mt-1 text-xs text-red-500">{errors.cash_paid_to}</p> : null}
                  </div>
                ) : null}

                {formValues.payment_method === 'online' ? (
                  <>
                    <div className="mt-4 rounded-xl bg-white p-3">
                      <Image
                        src="/images/AG_QR_Code.jpg"
                        alt="Payment QR"
                        width={380}
                        height={380}
                        className="mx-auto h-auto w-full max-w-[260px] rounded-lg"
                        priority
                      />
                    </div>
                    <div className="mt-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e) => handleScreenshotChange(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                      >
                        <Upload size={16} /> {paymentScreenshotFile ? 'Change screenshot' : 'Upload screenshot'}
                      </button>
                      {uploadingScreenshot ? (
                        <p className="mt-2 flex items-center gap-2 text-xs text-blue-700">
                          <Loader2 size={14} className="animate-spin" /> Uploading screenshot...
                        </p>
                      ) : null}
                      {previewUrl ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2">
                          <Image src={previewUrl} alt="Uploaded screenshot preview" width={320} height={320} className="h-auto w-full rounded-lg object-cover" unoptimized />
                        </div>
                      ) : null}
                      {errors.payment_screenshot_url ? <p className="mt-1 text-xs text-red-500">{errors.payment_screenshot_url}</p> : null}
                    </div>
                    <div className="mt-4">
                      <input
                        value={formValues.transaction_reference_number}
                        onChange={(e) => updateField('transaction_reference_number', e.target.value)}
                        placeholder="Transaction Reference Number *"
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900"
                      />
                      {errors.transaction_reference_number ? <p className="mt-1 text-xs text-red-500">{errors.transaction_reference_number}</p> : null}
                      {detectingReference ? (
                        <p className="mt-2 flex items-center gap-2 text-xs text-blue-700">
                          <Loader2 size={14} className="animate-spin" /> Detecting transaction reference...
                        </p>
                      ) : null}
                      {ocrSuccess ? (
                        <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                          <CheckCircle2 size={14} /> Transaction reference detected successfully
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Complete Registration'}
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
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 shadow-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <p>{toast.msg}</p>
            </div>
          </div>
        </div>
      ) : null}

      <SuccessModal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} />
    </div>
  )
}
