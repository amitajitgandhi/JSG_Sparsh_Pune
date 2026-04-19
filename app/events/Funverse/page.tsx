'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { Calendar, MapPin, Users, Sparkles, Trophy, Music, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { createWorker } from 'tesseract.js'

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
    const file = new File([blob], `installation-${Date.now()}.${ext}`, { type: blob.type || 'image/jpeg' })
    return file
  } catch (e) {
    console.error('Native image pick failed:', e)
    return null
  }
}

export default function Installation2026() {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number; color: string }[]>([])
  const [hide, setHide] = useState(false)

  // Registration fields
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [registrationFor, setRegistrationFor] = useState<'Individual' | 'Couple'>('Couple')
  const [kidsCount, setKidsCount] = useState<number>(0)
  const [kids10PlusCount, setKids10PlusCount] = useState<number>(0)
  const [guestCount, setGuestCount] = useState<number>(0)
  const [transportSeats, setTransportSeats] = useState<number>(0)
  const [transactionId, setTransactionId] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmInfo, setConfirmInfo] = useState<{name:string;mobile:string;registrationFor:string;kids:number;kids10Plus:number;guests:number;transport:number;total:number;txnId:string;img?:string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')

  const KID_RATE = 1100
  const KID_10PLUS_RATE = 1200
  const GUEST_RATE = 1500
  const TRANSPORT_RATE = 400
  const REFUNDABLE_DEPOSIT_PER_REGISTRATION = 500

  const totalAmount = useMemo(() => {
    const kidsTotal = kidsCount * KID_RATE
    const kids10PlusTotal = kids10PlusCount * KID_10PLUS_RATE
    const guestTotal = guestCount * GUEST_RATE
    const needsDeposit = transportSeats === 0 && kidsCount === 0 && kids10PlusCount === 0
    const base = kidsTotal + kids10PlusTotal + guestTotal
    if (needsDeposit) {
      return base + REFUNDABLE_DEPOSIT_PER_REGISTRATION
    }
    return base + transportSeats * TRANSPORT_RATE
  }, [kidsCount, kids10PlusCount, guestCount, transportSeats])

  const extractTransactionId = async (file: File) => {
    setOcrProcessing(true)
    setOcrStatus('processing')
    try {
      const worker = await createWorker('eng')
      const imageUrl = URL.createObjectURL(file)
      const { data: { text } } = await worker.recognize(imageUrl)
      URL.revokeObjectURL(imageUrl)
      await worker.terminate()

      // Common UPI transaction ID patterns
      const patterns = [
        /(?:UPI\s*(?:Ref|Transaction|Txn)(?:\s*(?:No|ID|Number))?[\s.:]*)[:\s]?([A-Za-z0-9]{10,25})/i,
        /(?:UTR|URN)[\s.:]*([A-Za-z0-9]{10,25})/i,
        /(?:Transaction\s*(?:ID|No|Number|Ref))[\s.:]*([A-Za-z0-9]{10,25})/i,
        /(?:Txn\s*(?:ID|No|Number|Ref))[\s.:]*([A-Za-z0-9]{10,25})/i,
        /(?:Ref(?:erence)?\s*(?:No|ID|Number)?)[\s.:]*([A-Za-z0-9]{10,25})/i,
        /(?:Google\s*transaction\s*ID)[\s.:]*([A-Za-z0-9]{10,25})/i,
        /\b(T[0-9]{10,20})\b/,
        /\b([0-9]{12,16})\b/,
      ]

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match?.[1]) {
          setTransactionId(match[1].trim())
          setOcrStatus('success')
          setOcrProcessing(false)
          return
        }
      }

      setOcrStatus('failed')
    } catch (err) {
      console.error('OCR extraction failed:', err)
      setOcrStatus('failed')
    } finally {
      setOcrProcessing(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setScreenshotFile(f)
    if (f) extractTransactionId(f)
  }

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null
    const ext = screenshotFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `installation-2026/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase
      .storage
      .from('installation-screenshots')
      .upload(filePath, screenshotFile, { contentType: screenshotFile.type || 'image/jpeg', cacheControl: '3600', upsert: false })

    if (error) {
      console.error('Installation screenshot upload error:', error)
      return null
    }

    const { data: pub } = supabase.storage.from('installation-screenshots').getPublicUrl(data.path)
    return pub?.publicUrl || null
  }

  const onChooseFileClick = async () => {
    const file = await pickNativeImage()
    if (file) {
      setScreenshotFile(file)
      extractTransactionId(file)
    } else {
      try { fileInputRef.current?.click() } catch {}
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
        .from('installation_2026_registrations')
        .insert([
          {
            name,
            mobile,
            registration_for: registrationFor,
            kids_count: kidsCount,
            kids_10plus_count: kids10PlusCount,
            guest_count: guestCount,
            transport_seats: transportSeats,
            transaction_id: transactionId,
            screenshot_url: screenshotUrl,
            total_amount: totalAmount,
          },
        ])

      if (error) {
        console.error('Installation insert error:', error)
        setConfirmInfo(null)
        setShowConfirm(true)
        return
      }

      setConfirmInfo({
        name,
        mobile,
        registrationFor,
        kids: kidsCount,
        kids10Plus: kids10PlusCount,
        guests: guestCount,
        transport: transportSeats,
        total: totalAmount,
        txnId: transactionId,
        img: screenshotUrl ?? undefined
      })
      setShowConfirm(true)

      setName('')
      setMobile('')
      setRegistrationFor('Couple')
      setKidsCount(0)
      setKids10PlusCount(0)
      setGuestCount(0)
      setTransportSeats(0)
      setTransactionId('')
      setScreenshotFile(null)
      setOcrStatus('idle')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = 'w-full max-w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white dark:bg-neutral-900 dark:text-gray-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200'
  const selectClass = fieldClass

  useEffect(() => {
    const count = 40
    const list: typeof particles = []
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
    for (let i = 0; i < count; i++) {
      list.push({ 
        id: i, 
        left: Math.random() * 100, 
        size: Math.random() * 8 + 4, 
        delay: Math.random() * 2, 
        duration: Math.random() * 4 + 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setParticles(list)
    const t = setTimeout(() => setHide(true), 10000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 pb-12 relative overflow-hidden">
      {/* Colorful confetti particles overlay */}
      {!hide && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {particles.map(p => (
            <span
              key={p.id}
              className="particle confetti"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                backgroundColor: p.color,
                bottom: `-10px`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-sky-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800">
        <Image
          src="/images/2026-2027-installation.png"
          alt="Installation Ceremony 2026-2027"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-4 md:mt-6 relative z-20 space-y-4 md:space-y-6">
        {/* Event Info */}
        <div className="relative rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-sky-50 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 p-3 sm:p-10 md:p-14 border-4 border-emerald-400 dark:border-emerald-600 shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center w-full text-center">
            <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-1 sm:mb-2">Event No. 1</span>
            <div className="flex items-center justify-center w-full min-w-0">
              <span className="text-xl sm:text-5xl md:text-7xl text-emerald-500 dark:text-emerald-400 flex-shrink-0">✨</span>
              <h1 className="mx-1 sm:mx-3 leading-tight text-[clamp(1rem,5vw,6rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 whitespace-nowrap animate-gradient">
                FUNVERSE
              </h1>
              <span className="text-xl sm:text-5xl md:text-7xl text-blue-500 dark:text-blue-400 flex-shrink-0">🎉</span>
            </div>
          </div>
        </div>

        {/* Date Tile */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-emerald-500'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-3 sm:p-6 md:p-8 shadow'>
            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              {/* Date Box */}
              <div className='flex flex-col items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 sm:border-2 dark:border-emerald-700 p-2 sm:p-4 md:p-5 text-center shadow-sm'>
                <span className='text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2'>📅</span>
                <span className='text-[9px] sm:text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-tight sm:tracking-wider'>Date</span>
                <span className='text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 dark:text-emerald-100 mt-0.5 sm:mt-1 leading-tight'>SUN, 26 APR</span>
              </div>

              {/* Time Box */}
              <div className='flex flex-col items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 sm:border-2 dark:border-blue-700 p-2 sm:p-4 md:p-5 text-center shadow-sm'>
                <span className='text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2'>⏰</span>
                <span className='text-[9px] sm:text-xs md:text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-tight sm:tracking-wider'>Time</span>
                <span className='text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 dark:text-blue-100 mt-0.5 sm:mt-1 leading-tight'>02:30 PM Onwards</span>
              </div>

              {/* Location Box */}
              <div className='flex flex-col items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 sm:border-2 dark:border-purple-700 p-2 sm:p-4 md:p-5 text-center shadow-sm'>
                <span className='text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2'>📍</span>
                <span className='text-[9px] sm:text-xs md:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-tight sm:tracking-wider'>Location</span>
                <span className='text-[10px] sm:text-sm md:text-base font-semibold text-gray-800 dark:text-purple-100 mt-0.5 sm:mt-1 leading-tight'>SNEH RESORT</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Night Highlights */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-emerald-500'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <div className='relative flex items-center gap-3'>
              <div className='h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md'>
                <Trophy size={24} />
              </div>
              <h3 className='text-base sm:text-lg md:text-xl font-extrabold text-neutral-900 dark:text-emerald-200 tracking-wide'>A Fresh Beginning — Highlights</h3>
            </div>
            <ul className='mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-medium text-gray-700 dark:text-emerald-200'>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-emerald-800 px-3 py-3 shadow-sm flex items-center gap-2'>
                <Trophy className='text-emerald-500' size={18} />
                <span>Committee Installation</span>
              </li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-purple-800 px-3 py-3 shadow-sm flex items-center gap-2'>
                <Sparkles className='text-purple-500' size={18} />
                <span>Good Vibes</span>
              </li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-emerald-800 px-3 py-3 shadow-sm flex items-center gap-2'>
                <Users className='text-emerald-500' size={18} />
                <span>Community Bonding</span>
              </li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-blue-800 px-3 py-3 shadow-sm flex items-center gap-2'>
                <Music className='text-blue-500' size={18} />
                <span>Live Entertainment</span>
              </li>
              <li className='rounded-lg bg-white/90 dark:bg-neutral-800 border border-gray-200 dark:border-purple-800 px-3 py-3 shadow-sm flex items-center gap-2'>
                <span className='text-lg'>🍽️</span>
                <span>Delicious Dinner</span>
              </li>
            </ul>
          </div>
        </section>

        {/* About the Event */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-emerald-500'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <h3 className='text-base sm:text-lg md:text-xl font-extrabold text-neutral-900 dark:text-emerald-200 mb-4'>About the Event</h3>
            <div className='prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3'>
              <p>
                The Installation Ceremony marks the beginning of a new chapter for JSG Pune Sparsh. 
                This grand event brings together our community to witness the installation of the new committee 
                members who will lead us through the year 2026-2027.
              </p>
              <p>
                Expect a day filled with fun, celebration, and entertainment.
              </p>
            </div>
          </div>
        </section>

        {/* Entry Fees Tile */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-emerald-500'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow'>💰</div>
              <p className='text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-200'>Event Charges</p>
            </div>
            <ul className='mt-3 space-y-3 text-gray-700 dark:text-emerald-100'>
                          <li className='flex items-start gap-3'>
                              <span className='text-lg mt-0.5'>🚌</span>
                              <div>
                                  <span className='font-semibold'>Transport (Optional) : ₹400 per seat</span>
                                  <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>To & fro, including Lunch at Jain Mandir, Pachane</p>
                              </div>
                          </li>
                          <li className='flex items-start gap-3'>
                <span className='text-lg mt-0.5'>💸</span>
                <div>
                  <span className='font-semibold'>Members : ₹500 (Refundable deposit)</span>
                  <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Only when NOT opting Transport or Kids</p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-lg mt-0.5'>👶</span>
                <div className='space-y-1'>
                  <div>
                                      <span className='font-semibold'>Kids upto 5 years : Free</span>
                                      <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>-</p>
                  </div>
                  <div>
                    <span className='font-semibold'>Kids 5-10 years : ₹1,100</span>
                    <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Excl. transport</p>
                  </div>
                  <div>
                    <span className='font-semibold'>Kids 10+ years : ₹1,200</span>
                    <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Excl. transport</p>
                  </div>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-lg mt-0.5'>🧒</span>
                <div>
                  <span className='font-semibold'>Guest : ₹1,500 per person</span>
                  <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Excl. transport</p>
                </div>
              </li>
              
            </ul>
            <div className='mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-700 space-y-1'>
              <p className='text-xs text-emerald-600 dark:text-emerald-300 font-medium'>⏰ Refundable deposit of ₹500 is valid till 8:00 PM</p>
              <p className='text-xs text-emerald-600 dark:text-emerald-300 font-medium'>🪑 Kids 5+ years require a separate transport seat</p>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-emerald-500'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-6 md:p-8 shadow'>
            <h2 className='text-lg sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600'>Registration Form</h2>
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
                    <input type='radio' name='registrationFor' value='Couple' checked={registrationFor === 'Couple'} onChange={() => setRegistrationFor('Couple')} className='h-4 w-4 text-emerald-600' />
                    <span>Couple</span>
                  </label>
                  <label className='inline-flex items-center gap-2 text-gray-800 dark:text-gray-200'>
                    <input type='radio' name='registrationFor' value='Individual' checked={registrationFor === 'Individual'} onChange={() => setRegistrationFor('Individual')} className='h-4 w-4 text-emerald-600' />
                    <span>Individual</span>
                  </label>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 sm:gap-5'>
                <div className='grid gap-1'>
                  <label htmlFor='kids' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Kids (5 - 10 yrs) — ₹1,100</label>
                  <select id='kids' name='kids' value={kidsCount} onChange={(e) => setKidsCount(parseInt(e.target.value, 10))} className={selectClass}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='kids10Plus' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Kids (10 yrs & above) — ₹1,200</label>
                  <select id='kids10Plus' name='kids10Plus' value={kids10PlusCount} onChange={(e) => setKids10PlusCount(parseInt(e.target.value, 10))} className={selectClass}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='guests' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Guest — ₹1,500</label>
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
                <label htmlFor='transport' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Transport (No. of Seats)</label>
                <select id='transport' name='transport' value={transportSeats} onChange={(e) => setTransportSeats(parseInt(e.target.value, 10))} className={selectClass}>
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                  <option value={9}>9</option>
                </select>
                <span className='text-xs text-gray-500 dark:text-gray-400'>₹400 per seat (to & fro). Kids 5+ yrs need a separate seat.</span>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='total' className='text-sm font-medium text-gray-700 dark:text-gray-200'>Total Amount to be paid</label>
                <input id='total' name='total' type='text' readOnly value={`₹${totalAmount}`} className='w-full max-w-full rounded-lg border border-gray-300 bg-gray-200 dark:bg-neutral-700 px-3 py-2 text-gray-700 dark:text-gray-300 cursor-not-allowed' />
                <button type='button' onClick={() => setShowQR(true)} className='mt-2 inline-flex text-sm text-emerald-600 hover:text-emerald-500 underline'>View QR Code for Payment</button>
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
                <div className='relative'>
                  <input id='txnId' name='txnId' type='text' required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} readOnly={ocrStatus !== 'failed'} className={`${fieldClass} ${ocrStatus !== 'failed' ? '!bg-gray-200 dark:!bg-neutral-700 !text-gray-700 dark:!text-gray-300 cursor-not-allowed' : ''}`} placeholder={ocrStatus === 'idle' ? 'Upload screenshot to auto-extract' : ocrStatus === 'processing' ? 'Extracting...' : 'Enter payment transaction/reference ID'} />
                  {ocrProcessing && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                      <Loader2 size={16} className='animate-spin text-emerald-500' />
                    </div>
                  )}
                </div>
                {ocrStatus === 'idle' && (
                  <span className='text-xs text-gray-400 dark:text-gray-500'>Upload a screenshot that has the Transaction ID visible in it.</span>
                )}
                {ocrStatus === 'processing' && (
                  <span className='text-xs text-blue-500 dark:text-blue-400'>🔍 Extracting Transaction ID from screenshot...</span>
                )}
                {ocrStatus === 'success' && (
                  <span className='text-xs text-emerald-600 dark:text-emerald-400'>✅ Transaction ID extracted from screenshot.</span>
                )}
                {ocrStatus === 'failed' && (
                  <span className='text-xs text-amber-600 dark:text-amber-400'>⚠️ Could not extract Transaction ID. Please enter manually.</span>
                )}
              </div>

              <button type='submit' disabled={submitting} className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 px-5 py-2.5 font-semibold text-white shadow hover:shadow-md hover:brightness-110 disabled:opacity-60 w-full sm:w-auto'>{submitting ? 'Submitting...' : 'Submit'}</button>
            </form>
          </div>
        </section>
      </div>

      {showQR && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4'>
          <div className='relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-800 p-4 shadow-xl'>
            <button onClick={() => setShowQR(false)} className='absolute top-2 right-2 rounded-full bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 px-2 py-1 text-sm text-gray-700 dark:text-gray-200'>✕</button>
            <div className='text-center mb-3 font-semibold text-gray-700 dark:text-gray-200'>Scan to Pay</div>
            <div className='relative w-full aspect-square'>
              <Image src='/images/SPARSH_QR_Code.jpeg' alt='Sparsh QR Code' fill className='object-contain rounded-lg' />
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4'>
          <div className='relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl overflow-hidden'>
            {confirmInfo ? (
              <>
                <div className='bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 px-5 py-3 text-white flex items-center justify-between'>
                  <h3 className='text-base font-bold tracking-wide flex items-center gap-2'>
                    <CheckCircle size={20} />
                    Registration Successful!
                  </h3>
                  <button onClick={() => setShowConfirm(false)} className='text-white/90 hover:text-white text-sm'>✕</button>
                </div>
                <div className='p-5 space-y-3 text-sm text-gray-700 dark:text-gray-300'>
                  <div className='bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-3'>
                    <p className='text-green-800 dark:text-green-200 font-medium'>Your registration is successful!</p>
                  </div>
                  <div className='grid sm:grid-cols-2 gap-3'>
                    <div><span className='font-semibold'>Name:</span> {confirmInfo.name}</div>
                    <div><span className='font-semibold'>Mobile:</span> {confirmInfo.mobile}</div>
                    <div><span className='font-semibold'>For:</span> {confirmInfo.registrationFor}</div>
                    <div><span className='font-semibold'>Kids (5-10 yrs):</span> {confirmInfo.kids}</div>
                    <div><span className='font-semibold'>Kids (10+ yrs):</span> {confirmInfo.kids10Plus}</div>
                    <div><span className='font-semibold'>Guest:</span> {confirmInfo.guests}</div>
                    <div><span className='font-semibold'>Transport Seats:</span> {confirmInfo.transport}</div>
                    <div><span className='font-semibold'>Transaction ID:</span> {confirmInfo.txnId}</div>
                    <div className='sm:col-span-2'><span className='font-semibold'>Total Amount:</span> ₹{confirmInfo.total}</div>
                  </div>
                  {confirmInfo.transport === 0 && confirmInfo.kids === 0 && confirmInfo.kids10Plus === 0 && (
                  <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mt-3'>
                    <p className='text-amber-800 dark:text-amber-200 text-xs font-medium'>⏰ Please note: Refundable deposit of ₹500 is valid till 8:00 PM</p>
                  </div>
                  )}
                  <div className='pt-2 flex flex-col sm:flex-row gap-3'>
                    <button onClick={() => setShowConfirm(false)} className='flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2'>Close</button>
                    <a href='tel:+917276319578' className='flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 font-semibold py-2 hover:bg-gray-50 dark:hover:bg-neutral-600'>Need Help?</a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-5 py-3 text-white flex items-center justify-between'>
                  <h3 className='text-base font-bold tracking-wide flex items-center gap-2'>
                    <AlertTriangle size={20} />
                    Registration Failed
                  </h3>
                  <button onClick={() => setShowConfirm(false)} className='text-white/90 hover:text-white text-sm'>✕</button>
                </div>
                <div className='p-5 space-y-3 text-sm text-gray-700 dark:text-gray-300'>
                  <div className='bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4'>
                    <p className='text-red-800 dark:text-red-200 font-medium mb-2'>Failed to save registration.</p>
                    <p className='text-red-700 dark:text-red-300 text-xs'>Please check your details and try again. If the problem persists, contact the committee.</p>
                  </div>
                  <div className='pt-2 flex flex-col sm:flex-row gap-3'>
                    <button onClick={() => setShowConfirm(false)} className='flex-1 inline-flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2'>Try Again</button>
                    <a href='tel:+917276319578' className='flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 font-semibold py-2 hover:bg-gray-50 dark:hover:bg-neutral-600'>Contact Support</a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes animate-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: animate-gradient 5s ease infinite;
        }
        
        .particle { 
          position: absolute; 
          border-radius: 50%; 
          opacity: 0.8; 
          transform: translateY(0) rotate(0deg);
        }
        
        .particle.confetti { 
          animation: confettiFall linear, confettiRotate linear;
          animation-fill-mode: forwards;
        }
        
        @keyframes confettiFall { 
          0% { transform: translateY(0) rotate(0deg); opacity: 1; } 
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; } 
        }
        
        @keyframes confettiRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
      `}</style>
    </div>
  )
}
