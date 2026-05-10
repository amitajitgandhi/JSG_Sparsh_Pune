'use client'

import React, { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Phone, Upload, UserPlus, Wallet } from 'lucide-react'
import { supabase, uploadRegistrationTransactionScreenshot } from '@/lib/supabase'
import { faqItems, inclusions, tournamentDetails } from './constants'
import { FormErrors, SparshCricketRegistrationFormValues, SparshCricketRegistrationPayload } from './types'
import { sparshCricketRegistrationSchema } from './schema'
import { detectTransactionReferenceFromImage } from './utils'
import SuccessModal from './components/SuccessModal'

const initialFormValues: SparshCricketRegistrationFormValues = {
  name: '',
  mobile_number: '',
  age: '',
  category: '',
  skillset: '',
  fullarm_bowling: '',
  cricheroes_link: '',
  cricketing_skill: '',
  fees: '₹700',
  transaction_reference_number: ''
}

type ToastState = { open: boolean; type: 'success' | 'error' | 'info'; msg: string }

export default function SparshCricketChampionshipSeason02Page() {
  const formRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [formValues, setFormValues] = useState<SparshCricketRegistrationFormValues>(initialFormValues)
  const [errors, setErrors] = useState<FormErrors>({})
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

  const registrationCountText = useMemo(() => 'Registrations opening shortly', [])

  const showToast = (type: ToastState['type'], msg: string) => {
    setToast({ open: true, type, msg })
    window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 3000)
  }

  const updateField = <K extends keyof SparshCricketRegistrationFormValues>(field: K, value: SparshCricketRegistrationFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleMobileInput = (value: string) => updateField('mobile_number', value.replace(/\D/g, '').slice(0, 10))
  const handleAgeInput = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 2)
    updateField('age', v ? Number(v) : '')
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
      const uploadId = `sparsh-cricket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
    const parsed = sparshCricketRegistrationSchema.safeParse({
      ...formValues,
      age: formValues.age === '' ? NaN : Number(formValues.age)
    })

    const nextErrors: FormErrors = {}
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (typeof key === 'string') nextErrors[key] = issue.message
      })
    }

    if (!paymentScreenshotFile || !paymentScreenshotUrl) nextErrors.payment_screenshot_url = 'Transaction screenshot upload is required'
    if (!formValues.transaction_reference_number.trim()) nextErrors.transaction_reference_number = 'Transaction reference number is required'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const resetForm = () => {
    setFormValues(initialFormValues)
    setErrors({})
    setPaymentScreenshotFile(null)
    setPaymentScreenshotUrl('')
    setPreviewUrl('')
    setOcrSuccess(false)
    setDetectingReference(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) {
      showToast('error', 'Please fix validation errors and try again.')
      return
    }

    setSubmitting(true)
    try {
      const payload: SparshCricketRegistrationPayload = {
        name: formValues.name.trim(),
        mobile_number: formValues.mobile_number.trim(),
        age: Number(formValues.age),
        category: formValues.category as 'Member' | 'Kid',
        skillset: formValues.skillset as 'Batsman' | 'Bowler' | 'Allrounder',
        fullarm_bowling: formValues.fullarm_bowling as 'Yes' | 'No',
        cricheroes_link: formValues.cricheroes_link.trim() ? formValues.cricheroes_link.trim() : null,
        cricketing_skill: formValues.cricketing_skill as 'Beginner' | 'Intermediate' | 'Advance' | 'Pro',
        fees: formValues.fees,
        payment_screenshot_url: paymentScreenshotUrl,
        transaction_reference_number: formValues.transaction_reference_number.trim(),
        created_at: new Date().toISOString()
      }

      const { error } = await supabase.from('sparsh_cricket_registrations').insert([payload])
      if (error) throw new Error(error.message || 'Failed to submit registration')

      showToast('success', 'Registration submitted successfully.')
      resetForm()
      setSuccessModalOpen(true)
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to submit registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 pb-28 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-emerald-100/30 dark:bg-emerald-900/10" />
        <div className="absolute inset-y-0 left-[8%] w-[2px] bg-white/40 dark:bg-white/10" />
        <div className="absolute inset-y-0 right-[8%] w-[2px] bg-white/40 dark:bg-white/10" />
        <div className="absolute left-[-28px] top-[22%] h-24 w-24 rounded-full border-2 border-red-300/70 bg-red-100/60 dark:border-red-500/40 dark:bg-red-500/10" />
        <div className="absolute left-[-12px] top-[25%] h-24 w-24 rounded-full border border-red-400/70 dark:border-red-400/40" />
        <div className="absolute right-[-34px] top-[62%] h-28 w-28 rounded-full border-2 border-red-300/70 bg-red-100/50 dark:border-red-500/40 dark:bg-red-500/10" />
        <div className="absolute right-[-16px] top-[66%] h-28 w-28 rounded-full border border-red-400/70 dark:border-red-400/40" />
      </div>

      <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6">
        <div className="relative mx-auto w-full max-w-4xl rounded-3xl border border-white/60 bg-white/85 p-5 shadow-large backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/85 sm:p-8">
          <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300">2 Days • Full Pitch Tournament • Fun & Bonding</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white">Sparsh Cricket Championship – Season 02</h1>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-5 py-3 text-sm font-semibold text-white">Register Now</button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        {tournamentDetails.map((detail) => {
          const Icon = detail.icon
          return (
            <div key={detail.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300"><Icon size={16} /><span className="text-xs font-semibold uppercase tracking-wide">{detail.label}</span></div>
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{detail.value}</p>
            </div>
          )
        })}
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">What’s Included</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {inclusions.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <Icon size={18} className="text-emerald-600 dark:text-emerald-300" />
                <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section ref={formRef} className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-large dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><UserPlus size={20} /><h2 className="text-lg font-bold">Tournament Registration</h2></div>
          <form onSubmit={handleSubmit} className="space-y-4 pb-20 sm:pb-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input value={formValues.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full Name *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              <input type="tel" value={formValues.mobile_number} onChange={(e) => handleMobileInput(e.target.value)} placeholder="Mobile Number *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              <input type="number" value={formValues.age} onChange={(e) => handleAgeInput(e.target.value)} placeholder="Age *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              <select value={formValues.skillset} onChange={(e) => updateField('skillset', e.target.value as any)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"><option value="">Skillset *</option><option>Batsman</option><option>Bowler</option><option>Allrounder</option></select>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Category *</p>
                <div className="mt-2 flex gap-3">
                  {['Member', 'Kid'].map((item) => (
                    <label key={item} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                      <input type="radio" name="category" checked={formValues.category === item} onChange={() => updateField('category', item as any)} />
                      {item}
                    </label>
                  ))}
                </div>
                {errors.category ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category}</p> : null}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Full Arm Bowling *</p>
                <div className="mt-2 flex gap-3">
                  {['Yes', 'No'].map((item) => (
                    <label key={item} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                      <input type="radio" name="fullarm_bowling" checked={formValues.fullarm_bowling === item} onChange={() => updateField('fullarm_bowling', item as any)} />
                      {item}
                    </label>
                  ))}
                </div>
                {errors.fullarm_bowling ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullarm_bowling}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">CricHeroes Profile Link (optional)</label>
                <input type="url" value={formValues.cricheroes_link} onChange={(e) => updateField('cricheroes_link', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                {errors.cricheroes_link ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cricheroes_link}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Cricketing Skills *</label>
                <select value={formValues.cricketing_skill} onChange={(e) => updateField('cricketing_skill', e.target.value as any)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  <option value="">Select level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advance">Advance</option>
                  <option value="Pro">Pro</option>
                </select>
                {errors.cricketing_skill ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.cricketing_skill}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Fees</label>
              <input readOnly value={formValues.fees} className="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300"><Wallet size={16} /> Payment</div>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">Please complete the payment of ₹700 and upload the payment screenshot below.</p>
              <div className="mt-3 rounded-xl bg-white p-3 dark:bg-gray-900"><Image src="/images/SPARSH_QR_Code.jpeg" alt="Payment QR" width={380} height={380} className="mx-auto h-auto w-full max-w-[260px] rounded-lg" priority /></div>
              <div className="mt-4">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" capture="environment" onChange={(e) => handleScreenshotChange(e.target.files?.[0] ?? null)} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"><Upload size={16} /> {paymentScreenshotFile ? 'Change screenshot' : 'Upload screenshot'}</button>
                {uploadingScreenshot ? <p className="mt-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"><Loader2 size={14} className="animate-spin" /> Uploading screenshot...</p> : null}
                {previewUrl ? <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900"><Image src={previewUrl} alt="Uploaded screenshot preview" width={320} height={320} className="h-auto w-full rounded-lg object-cover" unoptimized /></div> : null}
                {errors.payment_screenshot_url ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.payment_screenshot_url}</p> : null}
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Reference Number *</label>
                <input value={formValues.transaction_reference_number} onChange={(e) => updateField('transaction_reference_number', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                {detectingReference ? <p className="mt-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"><Loader2 size={14} className="animate-spin" /> Detecting transaction reference...</p> : null}
                {ocrSuccess ? <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={14} /> Transaction reference detected successfully</p> : null}
                {errors.transaction_reference_number ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transaction_reference_number}</p> : null}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Submitting...' : 'Complete Registration'}</button>
          </form>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Organizer Contact</h3>
          <a href="tel:+917276319578" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300"><Phone size={15} /> +91 72763 19578</a>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">FAQ</h2>
        <div className="space-y-2">
          {faqItems.map((item, index) => {
            const expanded = expandedFaqIndex === index
            return (
              <div key={item.question} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setExpandedFaqIndex(expanded ? null : index)}>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.question}</span>
                  <ChevronDown size={16} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
                {expanded ? <p className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">{item.answer}</p> : null}
              </div>
            )
          })}
        </div>
      </section>

      {toast.open ? (
        <div className="fixed inset-x-4 top-4 z-[120] sm:inset-x-auto sm:right-4 sm:w-[360px]">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 shadow-large dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <div className="flex items-start gap-2"><AlertCircle size={16} className="mt-0.5" /><p>{toast.msg}</p></div>
          </div>
        </div>
      ) : null}

      <SuccessModal isOpen={successModalOpen} onClose={() => setSuccessModalOpen(false)} />
    </div>
  )
}
