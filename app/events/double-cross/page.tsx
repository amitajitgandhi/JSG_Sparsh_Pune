 'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { Calendar, MapPin, Users, CheckCircle, AlertTriangle } from 'lucide-react'

// Lazy native picker without bundling Capacitor plugins on web
const pickNativeImage = async (): Promise<File | null> => {
  try {
    const cap = (globalThis as any).Capacitor
    if (!cap || !cap.isNativePlatform) return null
    const Camera = cap.Plugins?.Camera
    if (!Camera || typeof Camera.getPhoto !== 'function') return null

    const photo = await Camera.getPhoto({
      source: 'PHOTOS',
      resultType: 'uri',
      quality: 80,
      allowEditing: false,
    })
    if (!photo?.path && !photo?.webPath) return null
    const uri = (photo.path || photo.webPath) as string
    const res = await fetch(uri)
    const blob = await res.blob()
    const ext = (blob.type?.split('/')?.[1]) || 'jpg'
    const file = new File([blob], `doublecross-${Date.now()}.${ext}`, { type: blob.type || 'image/jpeg' })
    return file
  } catch (e) {
    console.error('Native image pick failed:', e)
    return null
  }
}

export default function DoubleCross() {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number; type: 'ember' | 'smoke' }[]>([])
  const [hide, setHide] = useState(false)
  const [showInterest, setShowInterest] = useState(false)
  const [interestSubmitting, setInterestSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialForm = { name: '', mobile: '', role: 'Player', notes: '' }
  const [formData, setFormData] = useState(initialForm)
  const [showRegistrationClosed, setShowRegistrationClosed] = useState(false)

  // Show registration closed popup on page load
  useEffect(() => {
    setShowRegistrationClosed(true)
  }, [])

  // Registration fields (same as Hurda Party)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [registrationFor, setRegistrationFor] = useState<'Individual' | 'Couple'>('Couple')
  const [kidsCount, setKidsCount] = useState<number>(0)
  const [guestCount, setGuestCount] = useState<number>(0)
  const [transactionId, setTransactionId] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmInfo, setConfirmInfo] = useState<{name:string;mobile:string;registrationFor:string;kids:number;guests:number;total:number;txnId:string;img?:string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const KID_RATE = 1000
  const GUEST_RATE = 2000
  const REFUNDABLE_DEPOSIT_PER_REGISTRATION = 500

  const totalAmount = useMemo(() => {
    const kidsTotal = kidsCount * KID_RATE
    const guestTotal = guestCount * GUEST_RATE
    const deposit = REFUNDABLE_DEPOSIT_PER_REGISTRATION
    return kidsTotal + guestTotal + deposit
  }, [kidsCount, guestCount])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setScreenshotFile(f)
  }

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null
    const ext = screenshotFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `double-cross/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase
      .storage
      .from('double-cross-screenshots')
      .upload(filePath, screenshotFile, { contentType: screenshotFile.type || 'image/jpeg', cacheControl: '3600', upsert: false })

    if (error) {
      console.error('Double-Cross screenshot upload error:', error)
      return null
    }

    const { data: pub } = supabase.storage.from('double-cross-screenshots').getPublicUrl(data.path)
    return pub?.publicUrl || null
  }

  const onChooseFileClick = async () => {
    const file = await pickNativeImage()
    if (file) {
      setScreenshotFile(file)
    } else {
      try { fileInputRef.current?.click() } catch {}
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Show registration closed popup
    setShowRegistrationClosed(true)
    return
    if (!screenshotFile) {
      alert('Please upload the transaction screenshot.')
      return
    }
    if (!/^\d{10}$/.test(mobile)) {
      alert('Enter a valid 10-digit mobile number')
      return
    }
    setSubmitting(true)
    try {
      const screenshotUrl = await uploadScreenshot()
      if (!screenshotUrl) {
        alert('Failed to upload screenshot. Please try again.')
        return
      }

      const { error } = await supabase
        .from('double_cross_registrations')
        .insert([
          {
            name,
            mobile,
            registration_for: registrationFor,
            kids_count: kidsCount,
            guest_count: guestCount,
            transaction_id: transactionId,
            screenshot_url: screenshotUrl,
            total_amount: totalAmount,
          },
        ])

      if (error) {
        console.error('Double-Cross insert error:', error)
        setConfirmInfo(null)
        setShowConfirm(true)
        return
      }

      setConfirmInfo({
        name,
        mobile,
        registrationFor,
        kids: kidsCount,
        guests: guestCount,
        total: totalAmount,
        txnId: transactionId,
        img: screenshotUrl ?? undefined
      })
      setShowConfirm(true)

      setName('')
      setMobile('')
      setRegistrationFor('Couple')
      setKidsCount(0)
      setGuestCount(0)
      setTransactionId('')
      setScreenshotFile(null)
    } finally {
      setSubmitting(false)
    }
  }
  const fieldClasses = "rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 focus:border-rose-400 dark:focus:border-rose-500"

  useEffect(() => {
    const count = 36
    const list: typeof particles = []
    for (let i = 0; i < count; i++) {
      list.push({ id: i, left: Math.random() * 100, size: Math.random() * 6 + 4, delay: Math.random() * 1.5, duration: Math.random() * 3 + 4, type: Math.random() < 0.5 ? 'ember' : 'smoke' })
    }
    setParticles(list)
    const t = setTimeout(() => setHide(true), 8000)
    return () => clearTimeout(t)
  }, [])

  const closeModal = () => { setShowInterest(false); setSuccess(false); setError(null); setFormData(initialForm) }
  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const validMobile = /^\d{10}$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.name.trim() || !validMobile.test(formData.mobile)) return
    setInterestSubmitting(true)
    try {
      const res = await fetch('/api/doublecross-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save')
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setInterestSubmitting(false)
    }
  }

  const fieldClass = 'w-full max-w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white dark:bg-neutral-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
  const selectClass = fieldClass


  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-rose-900 to-black pb-12 relative overflow-hidden text-white">
      {/* Fire particles overlay (shows on load) */}
      {!hide && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {particles.map(p => (
            <span
              key={p.id}
              className={`particle ${p.type}`}
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                bottom: `${-10}px`
              }}
            />
          ))}
        </div>
      )}
      {/* Hero Banner */}
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[540px] overflow-hidden">
        <Image
          src="/images/double-cross.png"
          alt="Double-Cross Event"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 md:-mt-24 relative z-20 space-y-4 md:space-y-6">
        {/* Event Info */}
        <div className="relative rounded-2xl bg-gradient-to-br from-neutral-900 via-rose-900 to-black p-3 sm:p-10 md:p-14 border-4 border-yellow-400 animated-border">
          <div className="flex items-center justify-center w-full text-center">
            <span className="text-3xl sm:text-7xl md:text-8xl fire-emoji text-yellow-300">🔥</span>
            <h1 className="mx-2 sm:mx-4 leading-tight text-2xl sm:text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-rose-400 to-white title-glow whitespace-nowrap">DOUBLE CROSS</h1>
            <span className="text-3xl sm:text-7xl md:text-8xl fire-emoji text-yellow-300">🔥</span>
          </div>
        </div>

        {/* Date Tile */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-rose-700 to-rose-800 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-rose-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-3 sm:p-6 md:p-8 shadow'>
            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              {/* Date Box */}
              <div className='flex flex-col items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 border border-rose-200 sm:border-2 dark:border-rose-700 p-2 sm:p-4 md:p-5 text-center shadow-sm'>
                <span className='text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2'>🗓</span>
                <span className='text-[9px] sm:text-xs md:text-sm font-bold text-rose-700 dark:text-rose-300 uppercase tracking-tight sm:tracking-wider'>Date</span>
                <span className='text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 dark:text-rose-100 mt-0.5 sm:mt-1 leading-tight'>SUN, 22 MAR</span>
              </div>

              {/* Time Box */}
              <div className='flex flex-col items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-200 sm:border-2 dark:border-amber-700 p-2 sm:p-4 md:p-5 text-center shadow-sm'>
                <span className='text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2'>⏰</span>
                <span className='text-[9px] sm:text-xs md:text-sm font-bold text-amber-700 dark:text-amber-300 uppercase tracking-tight sm:tracking-wider'>Time</span>
                <span className='text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 dark:text-amber-100 mt-0.5 sm:mt-1 leading-tight'>5 PM - 11 PM</span>
              </div>

              {/* Location Box */}
              <div className='flex flex-col items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 sm:border-2 dark:border-emerald-700 p-2 sm:p-4 md:p-5 text-center shadow-sm'>
                <span className='text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2'>📍</span>
                <span className='text-[9px] sm:text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-tight sm:tracking-wider'>Location</span>
                              <span className='text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 dark:text-emerald-100 mt-0.5 sm:mt-1 leading-tight'>Aishwarya Lawns</span>
              </div>
            </div>
          </div>
        </section>

        {/* Entry Fees Tile (match width/style of Highlights) */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-rose-700 to-rose-800 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-rose-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow'>💰</div>
              <p className='text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-200'>Entry Fees</p>
            </div>
            <ul className='mt-3 space-y-2 text-gray-700 dark:text-rose-100'>
              <li className='flex items-center gap-3'>
                <span className='text-lg'>💸</span>
                <span className='font-semibold'>Entry Fees : ₹500 (Refundable)</span>
              </li>
              <li className='flex items-center gap-3'>
                <span className='text-lg'>👶</span>
                <span className='font-semibold'>Kids 5+ years : ₹1000</span>
              </li>
                          <li className='flex items-center gap-3'>
                <span className='text-lg'>🧒</span>
                <span className='font-semibold'>Guest : ₹2000 per person</span>
              </li> 
            </ul>
            <div className='mt-3 pt-2 border-t border-rose-200 dark:border-rose-700'>
              <p className='text-xs text-rose-600 dark:text-rose-300 font-medium'>⏰ Note: Refundable deposit of ₹500 is valid till 5:30 PM</p>
            </div>
          </div>
        </section>

        {/* The Night Highlights (rose accent like Registration) */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-rose-700 to-rose-800 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-rose-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <div className='relative flex items-center gap-3'>
              <div className='h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold shadow-md'>🕶️</div>
              <h3 className='text-base sm:text-lg md:text-xl font-extrabold text-neutral-900 dark:text-rose-200 tracking-wide'>The Night — Highlights</h3>
            </div>
            <ul className='mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-medium text-gray-700 dark:text-rose-200'>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-rose-800 px-3 py-3 shadow-sm flex items-center gap-2'>🔪 <span>Traitor-style Missions</span></li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-rose-800 px-3 py-3 shadow-sm flex items-center gap-2'>🔥 <span>Ultimate Challenges & Stunts</span></li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-rose-800 px-3 py-3 shadow-sm flex items-center gap-2'>🎧 <span>DJ Night & Afterparty</span></li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-rose-800 px-3 py-3 shadow-sm flex items-center gap-2'>🍽️ <span>Delicious Dinner</span></li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-rose-800 px-3 py-3 shadow-sm flex items-center gap-2'>🕵️‍♂️ <span>Secrets, Gossip & Alliances</span></li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-rose-800 px-3 py-3 shadow-sm flex items-center gap-2'>🏆 <span>Prizes, Dramatic Eliminations</span></li>
            </ul>
          </div>
        </section>

        {/* Registration Form (Hurda-style) */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-rose-700 to-rose-800 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-rose-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <h2 className='text-lg sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-rose-300'>Registration Form</h2>
            <form onSubmit={onSubmit} className='grid gap-4 sm:gap-5'>
              <div className='grid gap-1'>
                <label htmlFor='name' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Name</label>
                <input id='name' name='name' type='text' required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} placeholder='Full name' />
              </div>

              <div className='grid gap-1'>
                <label htmlFor='mobile' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Mobile Number</label>
                <input id='mobile' name='mobile' type='tel' inputMode='numeric' pattern='[0-9]{10}' maxLength={10} required value={mobile} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setMobile(v.slice(0, 10)) }} className={fieldClass} placeholder='10-digit mobile number' />
                <span className='text-xs text-gray-500 dark:text-gray-400'>Enter 10 digits only.</span>
              </div>

              <div className='grid gap-2'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>JSG Member Registration for</span>
                <div className='flex flex-wrap gap-6'>
                  <label className='inline-flex items-center gap-2 text-gray-800 dark:text-gray-200'>
                    <input type='radio' name='registrationFor' value='Couple' checked={registrationFor === 'Couple'} onChange={() => setRegistrationFor('Couple')} className='h-4 w-4 text-rose-600' />
                    <span>Couple</span>
                  </label>
                  <label className='inline-flex items-center gap-2 text-gray-800 dark:text-gray-200'>
                    <input type='radio' name='registrationFor' value='Individual' checked={registrationFor === 'Individual'} onChange={() => setRegistrationFor('Individual')} className='h-4 w-4 text-rose-600' />
                    <span>Individual</span>
                  </label>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 sm:gap-5'>
                <div className='grid gap-1'>
                  <label htmlFor='kids' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Kids (5 yrs & above)</label>
                  <select id='kids' name='kids' value={kidsCount} onChange={(e) => setKidsCount(parseInt(e.target.value, 10))} className={selectClass}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='guests' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Guest</label>
                  <select id='guests' name='guests' value={guestCount} onChange={(e) => setGuestCount(parseInt(e.target.value, 10))} className={selectClass}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='total' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Total Amount to be paid</label>
                <input id='total' name='total' type='text' readOnly value={`₹${totalAmount}`} className='w-full max-w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-gray-900 dark:text-gray-100' />
                <span className='text-xs text-gray-500 dark:text-gray-400'>Includes refundable deposit of ₹{REFUNDABLE_DEPOSIT_PER_REGISTRATION} per registration till 5:30PM</span>
                <button type='button' onClick={() => setShowQR(true)} className='mt-2 inline-flex text-sm text-rose-600 hover:text-rose-500 underline'>View QR Code for Payment</button>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='screenshot' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Transaction Screenshot upload</label>
                <input id='screenshot' name='screenshot' ref={fileInputRef} type='file' accept='image/jpeg,image/jpg,image/png,image/heic,image/heif,image/*' required onChange={onFileChange} className='hidden' />
                <button type='button' onClick={onChooseFileClick} className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 w-full sm:w-auto'>Choose File</button>
                <span className='text-xs text-gray-500 dark:text-gray-400'>Max file size: 10MB. Allowed formats: JPEG, JPG, PNG, HEIC, HEIF.</span>
                {screenshotFile && (<span className='text-xs text-gray-500 break-all'>Selected: {screenshotFile.name}</span>)}
              </div>

              <div className='grid gap-1'>
                <label htmlFor='txnId' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Transaction ID</label>
                <input id='txnId' name='txnId' type='text' required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className={fieldClass} placeholder='Enter payment transaction/reference ID' />
              </div>

              <button type='submit' disabled={submitting} className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-black px-5 py-2.5 font-semibold text-white shadow hover:shadow-md hover:brightness-110 disabled:opacity-60 w-full sm:w-auto'>{submitting ? 'Submitting...' : 'Submit'}</button>
            </form>
          </div>
        </section>
      </div>

      {showInterest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-yellow-200 dark:border-yellow-700 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-black px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Double‑Cross • Interest Form</h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
              {success ? (
                <div className="space-y-4">
                  <p className="font-semibold text-green-700 dark:text-green-400">Thank you! Your interest is recorded.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/committee" className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-2 font-semibold text-center shadow">Contact Committee</Link>
                    <button type="button" onClick={closeModal} className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white py-2 font-semibold shadow">Close</button>
                  </div>
                </div>
              ) : (
                <>
                  {error && <div className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded p-2">{error}</div>}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-gray-700 dark:text-gray-200">Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} required className={fieldClasses} placeholder="Full Name" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-gray-700 dark:text-gray-200">Mobile Number *</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} required pattern="\d{10}" className={fieldClasses} placeholder="10-digit" />
                      {!validMobile.test(formData.mobile) && formData.mobile !== '' && <span className="text-[10px] text-red-500 dark:text-red-400">Enter 10 digits</span>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-gray-700 dark:text-gray-200">Role</label>
                      <select name="role" value={formData.role} onChange={handleChange} className={fieldClasses}>
                        <option>Player</option>
                        <option>Volunteer</option>
                        <option>Guest</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-gray-700 dark:text-gray-200">Notes (optional)</label>
                      <input name="notes" value={formData.notes} onChange={handleChange} className={fieldClasses} placeholder="Any special info" />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">This is an interest form only – registration will be confirmed later. Ensure mobile number is correct for updates.</div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2 shadow">{submitting ? 'Submitting...' : 'Submit Interest'}</button>
                    <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium">Cancel</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {showQR && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4'>
          <div className='relative w-full max-w-md rounded-2xl bg-white p-4 shadow-xl'>
            <button onClick={() => setShowQR(false)} className='absolute top-2 right-2 rounded-full bg-gray-100 hover:bg-gray-200 px-2 py-1 text-sm'>✕</button>
            <div className='text-center mb-3 font-semibold text-gray-700'>Scan to Pay</div>
            <div className='relative w-full aspect-square'>
              <Image src='/images/SPARSH_QR_Code.jpeg' alt='Sparsh QR Code' fill className='object-contain rounded-lg' />
            </div>
          </div>
        </div>
      )}

      {showRegistrationClosed && (
        <div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'>
          <div className='relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden border-2 border-rose-600'>
            <div className='bg-gradient-to-r from-rose-600 via-rose-700 to-black px-5 py-4 text-white flex items-center justify-between'>
              <h3 className='text-lg font-bold tracking-wide flex items-center gap-2'>
                <AlertTriangle size={22} />
                Registration Closed
              </h3>
              <button onClick={() => setShowRegistrationClosed(false)} className='text-white/90 hover:text-white text-xl'>✕</button>
            </div>
            <div className='p-6 space-y-4'>
              <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4'>
                <p className='text-amber-900 dark:text-amber-200 font-semibold text-center mb-2'>Registration for Double-Cross event has been closed.</p>
                <p className='text-amber-800 dark:text-amber-300 text-sm text-center'>It&apos;s time to find your team!</p>
              </div>
              <div className='flex flex-col gap-3'>
                <a 
                  href='https://jsg-pune-sparsh.vercel.app/events/find-your-team'
                  className='px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition-colors text-center'
                >
                  Find Your Team →
                </a>
                <button onClick={() => setShowRegistrationClosed(false)} className='px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors'>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4'>
          <div className='relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden'>
            {confirmInfo ? (
              <>
                <div className='bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 px-5 py-3 text-white flex items-center justify-between'>
                  <h3 className='text-base font-bold tracking-wide flex items-center gap-2'>
                    <CheckCircle size={20} />
                    Registration Successful!
                  </h3>
                  <button onClick={() => setShowConfirm(false)} className='text-white/90 hover:text-white text-sm'>✕</button>
                </div>
                <div className='p-5 space-y-3 text-sm text-gray-700'>
                  <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-3'>
                    <p className='text-green-800 font-medium'>Your registration is successfull..!!</p>
                  </div>
                  <div className='grid sm:grid-cols-2 gap-3'>
                    <div><span className='font-semibold'>Name:</span> {confirmInfo.name}</div>
                    <div><span className='font-semibold'>Mobile:</span> {confirmInfo.mobile}</div>
                    <div><span className='font-semibold'>For:</span> {confirmInfo.registrationFor}</div>
                    <div><span className='font-semibold'>Kids (5-12):</span> {confirmInfo.kids}</div>
                    <div><span className='font-semibold'>Guest:</span> {confirmInfo.guests}</div>
                    <div><span className='font-semibold'>Transaction ID:</span> {confirmInfo.txnId}</div>
                    <div className='sm:col-span-2'><span className='font-semibold'>Total Amount:</span> ₹{confirmInfo.total}</div>
                  </div>
                  <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3'>
                    <p className='text-amber-800 text-xs font-medium'>⏰ Please note: Refundable deposit of ₹500 is valid till 5:30 PM</p>
                  </div>
                  <div className='pt-2 flex flex-col sm:flex-row gap-3'>
                    <button onClick={() => setShowConfirm(false)} className='flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2'>Close</button>
                    <a href='tel:+917276319578' className='flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold py-2 hover:bg-gray-50'>Need Help?</a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-5 py-3 text-white flex items-center justify-between'>
                  <h3 className='text-base font-bold tracking-wide flex items-center gap-2'>
                    ⚠️ Registration Failed
                  </h3>
                  <button onClick={() => setShowConfirm(false)} className='text-white/90 hover:text-white text-sm'>✕</button>
                </div>
                <div className='p-5 space-y-3 text-sm text-gray-700'>
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                    <p className='text-red-800 font-medium mb-2'>Failed to save registration.</p>
                    <p className='text-red-700 text-xs'>Please check your details and try again. If the problem persists, contact the committee.</p>
                  </div>
                  <div className='pt-2 flex flex-col sm:flex-row gap-3'>
                    <button onClick={() => setShowConfirm(false)} className='flex-1 inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2'>Try Again</button>
                    <a href='tel:+917276319578' className='flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold py-2 hover:bg-gray-50'>Contact Support</a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      

      <style jsx>{`
        @keyframes glow {
          0%,100% { text-shadow: 0 0 14px rgba(255,255,255,0.95), 0 0 28px rgba(16,185,129,0.55), 0 0 48px rgba(245,158,11,0.5); }
          50% { text-shadow: 0 0 6px rgba(255,255,255,0.75), 0 0 18px rgba(16,185,129,0.45), 0 0 32px rgba(245,158,11,0.4); }
        }
        .glow-text { animation: glow 4s ease-in-out infinite; }
        .glow-subtext { text-shadow: 0 0 6px rgba(255,255,255,0.8), 0 0 16px rgba(16,185,129,0.4), 0 0 24px rgba(245,158,11,0.35); }
        /* Particles */
        .particle { position: absolute; border-radius: 50%; opacity: 0.95; transform: translateY(0); }
        .particle.ember { background: radial-gradient(circle at 30% 30%, #fff4, #ff6a00); box-shadow: 0 0 8px rgba(255,110,0,0.9); animation-name: rise, flicker; animation-timing-function: linear; }
        .particle.smoke { background: radial-gradient(circle at 30% 30%, rgba(200,200,200,0.4), rgba(120,120,120,0.08)); opacity: 0.6; animation-name: riseSlow; }
        .fire-emoji { display: inline-block; animation: fireBounce 1.6s ease-in-out infinite, fireGlow 2s ease-in-out infinite; }
        .title-glow { animation: titlePulse 3s ease-in-out infinite; }
        .animated-border { animation: borderPulse 2s ease-in-out infinite; }
        @keyframes borderPulse { 
          0%, 100% { 
            border-color: rgba(251, 191, 36, 1); 
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.2); 
          } 
          50% { 
            border-color: rgba(245, 158, 11, 1); 
            box-shadow: 0 0 30px rgba(245, 158, 11, 1), 0 0 60px rgba(245, 158, 11, 0.7), inset 0 0 30px rgba(245, 158, 11, 0.3); 
          } 
        }
        @keyframes titlePulse { 0% { text-shadow: 0 0 8px rgba(255,200,80,0.6); } 50% { text-shadow: 0 0 28px rgba(255,120,40,0.9); } 100% { text-shadow: 0 0 8px rgba(255,200,80,0.6); } }
        @keyframes fireBounce { 0% { transform: translateY(0) scale(1) } 50% { transform: translateY(-6px) scale(1.05) } 100% { transform: translateY(0) scale(1) } }
        @keyframes fireGlow { 0% { filter: drop-shadow(0 0 0 rgba(255,200,0,0.0)) } 50% { filter: drop-shadow(0 0 12px rgba(255,140,0,0.9)) } 100% { filter: drop-shadow(0 0 0 rgba(255,200,0,0.0)) } }
        @keyframes rise { 0% { transform: translateY(0) scale(1); opacity: 1 } 100% { transform: translateY(-140vh) scale(0.6); opacity: 0 } }
        @keyframes riseSlow { 0% { transform: translateY(0) scale(1); opacity: 0.9 } 100% { transform: translateY(-120vh) scale(0.8); opacity: 0 } }
        @keyframes flicker { 0% { filter: blur(0px) } 50% { filter: blur(1px) brightness(1.25) } 100% { filter: blur(0px) } }
      `}</style>
    </div>
  )
}
