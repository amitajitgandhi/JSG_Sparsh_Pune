'use client'

import React, { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Upload, UserPlus, Wallet } from 'lucide-react'
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
  jersey_size: '',
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

  const updateField = (field: keyof SparshCricketRegistrationFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
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
        cricheroes_link: formValues.cricheroes_link.trim(),
        cricketing_skill: formValues.cricketing_skill as 'Beginner' | 'Intermediate' | 'Advance' | 'Pro',
        jersey_size: formValues.jersey_size as '3XL - 46' | 'XXL - 44' | 'XL - 42' | 'L - 40' | 'M - 38' | 'S - 36',
        fees: formValues.fees,
        payment_screenshot_url: paymentScreenshotUrl,
        transaction_reference_number: formValues.transaction_reference_number.trim(),
        created_at: new Date().toISOString()
      }

      const { error } = await supabase.from('sparsh_cricket_registrations').insert([payload])
      if (error) throw new Error(error.message || 'Failed to submit registration')

      setFormValues(initialFormValues)
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#111827] pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_42%),radial-gradient(circle_at_80%_15%,rgba(99,102,241,0.14),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(168,85,247,0.14),transparent_46%)]" />
        <div className="absolute inset-y-0 left-[8%] w-[2px] bg-cyan-300/10" />
        <div className="absolute inset-y-0 right-[8%] w-[2px] bg-indigo-300/10" />
        <div className="absolute left-3 top-12 text-2xl opacity-40 md:text-3xl dark:opacity-50">🏏</div>
        <div className="absolute right-4 top-24 text-2xl opacity-40 md:text-3xl dark:opacity-50">🏆</div>
        <div className="absolute bottom-24 left-4 text-xl opacity-30 md:text-2xl dark:opacity-40">🏏</div>
        <div className="absolute bottom-32 right-6 text-xl opacity-30 md:text-2xl dark:opacity-40">🥎</div>
      </div>

      <section className="relative px-4 pb-8 pt-8 sm:px-6">
        <div className="relative mx-auto w-full max-w-4xl rounded-3xl border border-white/20 bg-white/10 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.5)] backdrop-blur-md sm:p-8">
          <div className="pointer-events-none absolute -right-2 -top-3 text-xl opacity-70">🏏</div>
          <div className="pointer-events-none absolute -left-2 -bottom-3 text-xl opacity-70">🏆</div>
          <h1 className="mt-1 bg-gradient-to-r from-sky-300 via-blue-300 to-emerald-300 bg-clip-text text-3xl font-black leading-tight text-transparent">Sparsh Cricket Championship</h1>
          <h2 className="mt-1 text-lg font-semibold tracking-wide text-slate-200"> Season 02</h2>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        {tournamentDetails.map((detail) => {
          const Icon = detail.icon
          return (
            <div key={detail.label} className="rounded-2xl border border-blue-200/40 bg-gradient-to-br from-white to-blue-50 p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300"><Icon size={16} /><span className="text-xs font-semibold uppercase tracking-wide">{detail.label}</span></div>
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{detail.value}</p>
            </div>
          )
        })}
      </section>

      <section className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <h2 className="mb-3 text-lg font-bold text-white">What’s Included <span className="ml-1" aria-hidden>🏏 🏆</span></h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {inclusions.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                <Icon size={18} className="text-emerald-600 dark:text-emerald-300" />
                <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section ref={formRef} className="mx-auto mt-6 w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-6 rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-md sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-white"><UserPlus size={20} /><h2 className="text-lg font-bold">Registration <span aria-hidden>🏏</span></h2></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input value={formValues.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full Name *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name}</p> : null}
              </div>
              <div>
                <input type="tel" value={formValues.mobile_number} onChange={(e) => updateField('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Mobile Number *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                {errors.mobile_number ? <p className="mt-1 text-xs text-red-500">{errors.mobile_number}</p> : null}
              </div>
              <div>
                <input type="number" value={formValues.age} onChange={(e) => updateField('age', e.target.value ? Number(e.target.value) : '')} placeholder="Age *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                {errors.age ? <p className="mt-1 text-xs text-red-500">{errors.age}</p> : null}
              </div>
              <div>
                <select value={formValues.category} onChange={(e) => updateField('category', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  <option value="">Category *</option>
                  <option value="Member">Member</option>
                  <option value="Kid">Kid</option>
                </select>
                {errors.category ? <p className="mt-1 text-xs text-red-500">{errors.category}</p> : null}
              </div>
              <div>
                <select value={formValues.skillset} onChange={(e) => updateField('skillset', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"><option value="">Skillset *</option><option>Batsman</option><option>Bowler</option><option>Allrounder</option></select>
                {errors.skillset ? <p className="mt-1 text-xs text-red-500">{errors.skillset}</p> : null}
              </div>
              <div>
                <select value={formValues.fullarm_bowling} onChange={(e) => updateField('fullarm_bowling', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                  <option value="">Full Arm Bowling? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.fullarm_bowling ? <p className="mt-1 text-xs text-red-500">{errors.fullarm_bowling}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <select value={formValues.cricketing_skill} onChange={(e) => updateField('cricketing_skill', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
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
                  placeholder="CricHeroes Profile Link *"
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                {errors.cricheroes_link ? <p className="mt-1 text-xs text-red-500">{errors.cricheroes_link}</p> : null}
              </div>
              <div>
                <select value={formValues.jersey_size} onChange={(e) => updateField('jersey_size', e.target.value)} className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:col-span-2">
                  <option value="">Jersey Size *</option>
                  <option value="3XL - 46">3XL - 46</option>
                  <option value="XXL - 44">XXL - 44</option>
                  <option value="XL - 42">XL - 42</option>
                  <option value="L - 40">L - 40</option>
                  <option value="M - 38">M - 38</option>
                  <option value="S - 36">S - 36</option>
                </select>
                {errors.jersey_size ? <p className="-mt-2 text-xs text-red-500 sm:col-span-2">{errors.jersey_size}</p> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-inner dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300"><Wallet size={16} /> Payment <span aria-hidden>🥎</span></div>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">Please complete the payment of ₹700 and upload the payment screenshot below.</p>
              <div className="mt-3 rounded-xl bg-white p-3 dark:bg-gray-900"><Image src="/images/SPARSH_QR_Code.jpeg" alt="Payment QR" width={380} height={380} className="mx-auto h-auto w-full max-w-[260px] rounded-lg" priority /></div>
              <div className="mt-4">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={(e) => handleScreenshotChange(e.target.files?.[0] ?? null)} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"><Upload size={16} /> {paymentScreenshotFile ? 'Change screenshot' : 'Upload screenshot'}</button>
                {uploadingScreenshot ? <p className="mt-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"><Loader2 size={14} className="animate-spin" /> Uploading screenshot...</p> : null}
                {previewUrl ? <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900"><Image src={previewUrl} alt="Uploaded screenshot preview" width={320} height={320} className="h-auto w-full rounded-lg object-cover" unoptimized /></div> : null}
              </div>
              <div className="mt-4">
                <input value={formValues.transaction_reference_number} onChange={(e) => updateField('transaction_reference_number', e.target.value)} placeholder="Transaction Reference Number *" className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                {errors.transaction_reference_number ? <p className="mt-1 text-xs text-red-500">{errors.transaction_reference_number}</p> : null}
                {detectingReference ? <p className="mt-2 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"><Loader2 size={14} className="animate-spin" /> Detecting transaction reference...</p> : null}
                {ocrSuccess ? <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={14} /> Transaction reference detected successfully</p> : null}
              </div>
            </div>

            {errors.payment_screenshot_url ? <p className="text-xs text-red-500">{errors.payment_screenshot_url}</p> : null}

            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60">{submitting ? 'Submitting...' : 'Complete Registration'}</button>
          </form>
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
