'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../../lib/supabase'

// Lazy import to avoid bundling Capacitor libs for web
const pickNativeImage = async (): Promise<File | null> => {
  try {
    const cap = (globalThis as any).Capacitor
    if (!cap || !cap.isNativePlatform) return null
    const { Camera } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      source: 'PHOTOS', // open gallery
      resultType: 'uri',
      quality: 80,
      allowEditing: false,
    })
    if (!photo?.path && !photo?.webPath) return null
    const uri = (photo.path || photo.webPath) as string
    const res = await fetch(uri)
    const blob = await res.blob()
    const ext = blob.type.split('/')[1] || 'jpg'
    const file = new File([blob], `hurda-${Date.now()}.${ext}`, { type: blob.type })
    return file
  } catch (e) {
    console.error('Native image pick failed:', e)
    return null
  }
}

export default function HurdaPartyPage() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [registrationFor, setRegistrationFor] = useState<'Individual' | 'Couple'>('Couple')
  const [kidsCount, setKidsCount] = useState<number>(0) // default 0
  const [guestCount, setGuestCount] = useState<number>(0) // default 0
  const [transactionId, setTransactionId] = useState('')
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmInfo, setConfirmInfo] = useState<{name:string;mobile:string;registrationFor:string;kids:number;guests:number;total:number;txnId:string;img?:string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const KID_RATE = 500
  const GUEST_RATE = 750
  const REFUNDABLE_DEPOSIT_PER_REGISTRATION = 500

  const totalAmount = useMemo(() => {
    const kidsTotal = kidsCount * KID_RATE
    const guestTotal = guestCount * GUEST_RATE
    const deposit = REFUNDABLE_DEPOSIT_PER_REGISTRATION // per registration
    return kidsTotal + guestTotal + deposit
  }, [kidsCount, guestCount])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setScreenshotFile(f)
  }

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null
    const ext = screenshotFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `hurda/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase
      .storage
      .from('hurda-screenshots')
      .upload(filePath, screenshotFile, { contentType: screenshotFile.type || 'image/jpeg', cacheControl: '3600', upsert: false })

    if (error) {
      console.error('Hurda screenshot upload error:', error)
      return null
    }

    const { data: pub } = supabase.storage.from('hurda-screenshots').getPublicUrl(data.path)
    return pub?.publicUrl || null
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
        .from('hurda_registrations')
        .insert([
          {
            name,
            mobile,
            registration_for: registrationFor,
            kids_count: kidsCount,
            guest_count: guestCount,
            transaction_id: transactionId,
            screenshot_url: screenshotUrl,
          },
        ])

      if (error) {
        console.error('Hurda insert error:', error)
        alert(error.message || 'Failed to save registration. Check policies and try again.')
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
        img: screenshotUrl
      })
      setShowConfirm(true)

      // Reset form after setting confirmation
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

  const fieldClass = 'w-full max-w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
  const selectClass = fieldClass

  const onChooseFileClick = async () => {
    // Try native picker in Capacitor; fall back to HTML input on web
    const file = await pickNativeImage()
    if (file) {
      setScreenshotFile(file)
    } else {
      // Fallback: trigger the input (works in browsers)
      try { fileInputRef.current?.click() } catch {}
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-12 relative overflow-hidden">
      {/* Hero Banner */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[440px] overflow-hidden">
        <Image
          src="/images/Hurda-Party2.png"
          alt="Hurda Party - One Day Picnic"
          fill
          priority
          className="object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/10" />
        <div className="absolute top-4 sm:top-6 md:top-10 right-2 sm:right-4 md:right-8 px-2 sm:px-4 text-right">
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-8 -mt-8 sm:-mt-12 md:-mt-20 relative z-20 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Event Info */}
        <div className="group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-emerald-300 via-green-300 to-amber-300 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_65%)] transition-opacity" />
          <section className="relative rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-sm p-4 sm:p-6 md:p-8 shadow">
            <div className="grid gap-2 sm:gap-3 text-sm md:text-base text-gray-800">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-amber-600">Hurda Party</div>
              <div>
                <span className='font-semibold'>🗓 Date:</span> SUNDAY, 21st DECEMBER 2025
              </div>
              <div>
                <span className='font-semibold'>📍 Venue:</span> Yavat 24 Agri Tourism, Pune-Solapur Road, Pune.{' '}
              </div>
            </div>
            <hr className="my-4 sm:my-6 border-amber-100" />
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 text-sm md:text-base">
              <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-emerald-300/60 to-green-400/50 shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow">💸</div>
                    <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Entry Fee</p>
                  </div>
                  <ul className='mt-3 space-y-2 text-gray-700'>
                    <li className='flex items-start gap-2'>
                      <span className='mt-0.5'>✅</span>
                      <div className='leading-snug'>
                        <div>Members: FREE.</div>
                        <div className='text-xs text-emerald-700'>₹500 - Refundable Deposit at Venue before 10am</div>
                      </div>
                    </li>
                    <li className='flex items-start gap-2'><span className='mt-0.5'>✅</span><span>Kids (5–12 yrs): ₹500 per head</span></li>
                    <li className='flex items-start gap-2'><span className='mt-0.5'>✅</span><span>Kids (12+ yrs): ₹750 per head</span></li>
                  </ul>
                </div>
              </div>
              <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-amber-300/60 to-yellow-400/50 shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow">🍽</div>
                    <p className="text-sm font-bold uppercase tracking-wider text-amber-700">What’s Included</p>
                  </div>
                  <ul className='mt-3 space-y-2 text-gray-700'>
                    <li className='flex items-start gap-2'><span className='mt-0.5'>✅</span><span>Breakfast, Lunch, Hurda & High Tea</span></li>
                    <li className='flex items-start gap-2'><span className='mt-0.5'>✅</span><span>Adventure Activities, Boating, Rain Dance</span></li>
                    <li className='flex items-start gap-2'><span className='mt-0.5'>✅</span><span>Swimming Pool, Team Games & More</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Highlights */}
        <section className='relative overflow-hidden rounded-2xl shadow-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 sm:p-6 md:p-8 space-y-4'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,150,100,0.08),transparent_70%)]' />
          <div className='relative flex items-center gap-3'>
            <div className='h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold shadow-md'>🔥</div>
            <h3 className='text-base sm:text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-700 to-amber-600 tracking-wide'>Event Highlights</h3>
          </div>
          <ul className='relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 text-sm font-medium text-gray-700'>
            <li className='bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm'>🧗‍♀️ Adventure Activities</li>
            <li className='bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm'>🚣‍♂️ Boating</li>
            <li className='bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm'>💦 Rain Dance</li>
            <li className='bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm'>🤽‍♂️ Swimming Pool</li>
            <li className='bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm'>🎲 Team Games</li>
            <li className='bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm'>🎁 Surprises & Takeaways</li>
          </ul>
        </section>

        {/* Registration Form */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-blue-300 via-indigo-300 to-fuchsia-300 shadow-lg hover:shadow-xl transition-shadow overflow-hidden'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-sm p-4 sm:p-6 md:p-8 shadow'>
            <h2 className='text-lg sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-fuchsia-700'>Registration Form</h2>
            <form onSubmit={onSubmit} className='grid gap-4 sm:gap-5'>
              <div className='grid gap-1'>
                <label htmlFor='name' className='text-sm font-medium text-gray-700'>Name</label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                  placeholder='Full name'
                />
              </div>

              <div className='grid gap-1'>
                <label htmlFor='mobile' className='text-sm font-medium text-gray-700'>Mobile Number</label>
                <input
                  id='mobile'
                  name='mobile'
                  type='tel'
                  inputMode='numeric'
                  pattern='[0-9]{10}'
                  maxLength={10}
                  required
                  value={mobile}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '')
                    setMobile(v.slice(0, 10))
                  }}
                  className={fieldClass}
                  placeholder='10-digit mobile number'
                />
                <span className='text-xs text-gray-500'>Enter 10 digits only.</span>
              </div>

              <div className='grid gap-2'>
                <span className='text-sm font-medium text-gray-700'>Registration for</span>
                <div className='flex flex-wrap gap-6'>
                  <label className='inline-flex items-center gap-2 text-gray-800'>
                    <input
                      type='radio'
                      name='registrationFor'
                      value='Couple'
                      checked={registrationFor === 'Couple'}
                      onChange={() => setRegistrationFor('Couple')}
                      className='h-4 w-4 text-blue-600'
                    />
                    <span>Couple</span>
                  </label>
                  <label className='inline-flex items-center gap-2 text-gray-800'>
                    <input
                      type='radio'
                      name='registrationFor'
                      value='Individual'
                      checked={registrationFor === 'Individual'}
                      onChange={() => setRegistrationFor('Individual')}
                      className='h-4 w-4 text-blue-600'
                    />
                    <span>Individual</span>
                  </label>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 sm:gap-5'>
                <div className='grid gap-1'>
                  <label htmlFor='kids' className='text-sm font-medium text-gray-700'>
                    Kids (5 yrs to 12yrs)
                  </label>
                  <select
                    id='kids'
                    name='kids'
                    value={kidsCount}
                    onChange={(e) => setKidsCount(parseInt(e.target.value, 10))}
                    className={selectClass}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='guests' className='text-sm font-medium text-gray-700'>
                    Kids (above 12yrs)
                  </label>
                  <select
                    id='guests'
                    name='guests'
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                    className={selectClass}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='total' className='text-sm font-medium text-gray-700'>Total Amount to be paid</label>
                <input
                  id='total'
                  name='total'
                  type='text'
                  readOnly
                  value={`₹${totalAmount}`}
                  className='w-full max-w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900'
                />
                <span className='text-xs text-gray-500'>
                  Includes refundable deposit of ₹{REFUNDABLE_DEPOSIT_PER_REGISTRATION} per registration.
                </span>
                <button type='button' onClick={() => setShowQR(true)} className='mt-2 inline-flex text-sm text-blue-600 hover:text-blue-700 underline'>
                  View QR Code for Payment
                </button>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='screenshot' className='text-sm font-medium text-gray-700'>Transaction Screenshot upload</label>
                <input
                  id='screenshot'
                  name='screenshot'
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/heic,image/heif,image/*'
                  required
                  onChange={onFileChange}
                  className='hidden'
                />
                <button type='button' onClick={onChooseFileClick} className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 w-full sm:w-auto'>
                  Choose File
                </button>
                <span className='text-xs text-gray-500'>Max file size: 10MB. Allowed formats: JPEG, JPG, PNG, HEIC, HEIF.</span>
                {screenshotFile && (
                  <span className='text-xs text-gray-500 break-all'>Selected: {screenshotFile.name}</span>
                )}
              </div>

              <div className='grid gap-1'>
                <label htmlFor='txnId' className='text-sm font-medium text-gray-700'>Transaction ID</label>
                <input
                  id='txnId'
                  name='txnId'
                  type='text'
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className={fieldClass}
                  placeholder='Enter payment transaction/reference ID'
                />
              </div>

              <button
                type='submit'
                disabled={submitting}
                className='inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 px-5 py-2.5 font-semibold text-white shadow hover:shadow-md hover:brightness-110 disabled:opacity-60 w-full sm:w-auto'
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </section>
      </div>

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

      {showConfirm && confirmInfo && (
        <div className='fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4'>
          <div className='relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden'>
            <div className='bg-gradient-to-r from-emerald-500 via-green-600 to-amber-500 px-5 py-3 text-white flex items-center justify-between'>
              <h3 className='text-base font-bold tracking-wide'>Registration Submitted</h3>
              <button onClick={() => setShowConfirm(false)} className='text-white/90 hover:text-white text-sm'>✕</button>
            </div>
            <div className='p-5 space-y-3 text-sm text-gray-700'>
              <div className='grid sm:grid-cols-2 gap-3'>
                <div><span className='font-semibold'>Name:</span> {confirmInfo.name}</div>
                <div><span className='font-semibold'>Mobile:</span> {confirmInfo.mobile}</div>
                <div><span className='font-semibold'>For:</span> {confirmInfo.registrationFor}</div>
                <div><span className='font-semibold'>Kids:</span> {confirmInfo.kids}</div>
                <div><span className='font-semibold'>Guests:</span> {confirmInfo.guests}</div>
                <div><span className='font-semibold'>Transaction ID:</span> {confirmInfo.txnId}</div>
                <div className='sm:col-span-2'><span className='font-semibold'>Total Amount:</span> ₹{confirmInfo.total}</div>
              </div>
              <div className='pt-2 flex flex-col sm:flex-row gap-3'>
                <button onClick={() => setShowConfirm(false)} className='flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2'>Close</button>
                <a href='tel:+917276319578' className='flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold py-2 hover:bg-gray-50'>Need Help?</a>
              </div>
            </div>
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
      `}</style>
    </div>
  )
}