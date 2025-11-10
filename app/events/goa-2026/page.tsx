'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, CheckCircle, Sparkles, Gift } from 'lucide-react'

export default function Goa2026() {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number; type: 'sand' | 'drop' }[]>([])
  const [hide, setHide] = useState(false)
  const [showInterest, setShowInterest] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const initialForm = { name: '', mobile: '', kids: 'No', kidsCount: '', kidsAges: '', transport: 'Self', extraCoupleCount: '' }
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    // Generate particles once on mount
    const count = 40
    const list: typeof particles = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: Math.random() * 100, // vw percentage
        size: Math.random() * 6 + 4, // px
        delay: Math.random() * 1.5, // s
        duration: Math.random() * 3 + 4, // s
        type: Math.random() < 0.5 ? 'sand' : 'drop'
      })
    }
    setParticles(list)
    // Hide animation layer after 8s
    const t = setTimeout(() => setHide(true), 8000)
    return () => clearTimeout(t)
  }, [])

  const closeModal = () => { setShowInterest(false); setSuccess(false); setFormData(initialForm) }
  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const validMobile = /^\d{10}$/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !validMobile.test(formData.mobile)) return
    if (formData.kids === 'Yes' && (!formData.kidsCount || !formData.kidsAges.trim())) return
    setSubmitting(true)
    setTimeout(() => { setSubmitting(false); setSuccess(true); }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-12 relative overflow-hidden">
      {/* Falling particles overlay */}
      {!hide && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {particles.map(p => (
            <span
              key={p.id}
              className={`absolute animate-fall ${p.type === 'sand' ? 'bg-yellow-200/90 shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'bg-blue-200/80 shadow-[0_0_6px_rgba(59,130,246,0.5)]'} rounded-full`}
              style={{
                left: `${p.left}vw`,
                top: '-20px',
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative w-full h-[300px] md:h-[480px] lg:h-[520px] overflow-hidden">
        <Image 
          src="/images/GOA.jpg" 
          alt="GOA 2026 Sun, Sand & Sparsh" 
          fill 
          priority
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/10" />
        <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 px-4 w-full max-w-6xl text-center">
          <h1 className="glow-text text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
            Goa Calling!
          </h1>
          <p className="glow-subtext mt-3 md:mt-4 text-base sm:text-lg md:text-2xl font-semibold text-white tracking-wide drop-shadow">
             South Goa Escape
          </p>
        </div>
      </div>

      {/* Main Content Tiles */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 md:-mt-24 relative z-20 space-y-10 md:space-y-14">
        {/* Experience Intro Section */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 md:p-8 space-y-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 tracking-tight">Experience Luxury Like Never Before</h2>
          <div className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">
            <p>Stay at a <strong className="text-blue-700">4-Star Beach Touch Resort</strong> on the pristine <strong className="text-teal-600">Betalbatim Beach</strong>, where golden sands meet crystal-blue waters.</p>
            <p className="mt-2">A perfect blend of fun, relaxation, and unforgettable memories awaits you in paradise!</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Dates Tile */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-400 to-fuchsia-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.5),transparent_65%)] transition-opacity" />
            <div className="relative h-full w-full rounded-2xl bg-white backdrop-blur-sm p-5 flex items-start gap-4 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 opacity-60 group-hover:opacity-90 transition-opacity" />
              <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-300/30 blur-2xl group-hover:scale-125 transition-transform" />
              <div className="relative rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-600/30 group-hover:shadow-lg group-hover:scale-105 transition-transform">
                <Calendar size={26} className="drop-shadow" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Travel Dates</p>
                <p className="text-lg md:text-xl font-semibold text-slate-800 leading-snug">24th–26th January 2026</p>
                <p className="text-[11px] font-medium text-blue-500 mt-0.5">Check-in: 24 Jan • Check-out: 26 Jan</p>
                <p className="text-xs font-medium text-blue-500 mt-0.5 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />2 Nights</p>
              </div>
            </div>
          </div>

          {/* Location Tile */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.45),transparent_60%)] transition-opacity" />
            <div className="relative h-full w-full rounded-2xl bg-white backdrop-blur-sm p-5 flex items-start gap-4 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 opacity-60 group-hover:opacity-90 transition-opacity" />
              <span className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-gradient-to-tr from-red-300/50 to-pink-300/40 blur-2xl group-hover:scale-125 transition-transform" />
              <div className="relative rounded-xl bg-gradient-to-br from-red-600 to-rose-500 p-2.5 text-white shadow-md shadow-red-600/30 group-hover:shadow-lg group-hover:scale-105 transition-transform">
                <MapPin size={26} className="drop-shadow" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-600">Location</p>
                <p className="text-lg md:text-xl font-semibold text-slate-800 leading-snug">Betalbatim Beach</p>
                <p className="text-xs font-medium text-red-600 mt-0.5 flex items-center gap-1">South Goa</p>
                <p className="text-xs font-medium text-red-600 mt-0.5 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />4-Star Beach Touch Resort</p>
              </div>
            </div>
          </div>

          {/* Capacity / Registration Tile */}
          <div className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-teal-300 via-cyan-400 to-sky-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 bg-[radial-gradient(circle_at_40%_70%,rgba(255,255,255,0.5),transparent_60%)] transition-opacity" />
            <div className="relative h-full w-full rounded-2xl bg-white backdrop-blur-sm p-5 flex items-start gap-4 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-600 opacity-60 group-hover:opacity-90 transition-opacity" />
              <span className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200/50 to-sky-300/40 blur-2xl group-hover:scale-125 transition-transform" />
              <div className="relative rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 p-2.5 text-white shadow-md shadow-cyan-600/30 group-hover:shadow-lg group-hover:scale-105 transition-transform">
                <Users size={26} className="drop-shadow" />
              </div>
              <div className="relative flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">Registration</p>
                <p className="text-sm md:text-base font-semibold text-slate-800 leading-snug">Opens 15 Nov 2025</p>
                <p className="text-xs font-medium text-cyan-600 mt-0.5">Nominal booking charge: ₹5000 per couple</p>
              </div>
            </div>
          </div>
        </div>

        {/* Package Details (moved above Goa-to-Goa) */}
        <div className="group relative rounded-3xl p-[2px] bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_65%)] transition-opacity" />
          <div className="relative rounded-3xl bg-white/90 backdrop-blur-sm px-6 md:px-10 py-7 md:py-9 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-yellow-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-14 -left-14 w-56 h-56 bg-pink-300/30 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/40 ring-2 ring-white/40">
                  <span className="text-2xl font-bold">₹</span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800">Package Details</h3>
                  <p className="text-xs md:text-sm font-medium text-yellow-700 flex items-center gap-1">Limited Seats • Premium Beach Retreat</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[13px] uppercase font-bold tracking-wide text-slate-500">Couple Price</p>
                <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-500 text-transparent bg-clip-text drop-shadow">₹20,000</p>
                <p className="text-[11px] md:text-xs text-slate-500">(2 Nights • All Inclusive)</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />4-Star Beach Touch Resort Stay</li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />All Meals (Veg Jain Friendly Options)</li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />Curated Fun & Bonding Activities</li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />Evening Entertainment & Social</li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />Surprise Elements & Gifts </li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />Kids Friendly Atmosphere</li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />Beach Access & Leisure Time</li>
                <li className="flex items-start gap-2"><CheckCircle size={18} className="mt-0.5 text-green-500" />Community Connection Moments</li>
              </ul>
            </div>
            <div className="mt-7 grid sm:grid-cols-1 gap-4 text-[11px] md:text-xs text-slate-600">
              <p className="flex items-start gap-2"><span className="inline-block mt-1 w-2 h-2 rounded-full bg-orange-500" />Booking Opens: <strong className="text-slate-800">15 Nov 2025</strong> (₹5000 couple booking charge)</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowInterest(true)} className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-600 text-white font-semibold py-3 text-sm shadow-md hover:shadow-lg hover:brightness-110 transition">Pre-Register Interest</button>
              <Link href="tel:+918975797500" className="flex-1 inline-flex items-center justify-center rounded-xl border border-pink-300 bg-white/50 text-pink-600 font-semibold py-3 text-sm shadow-sm hover:bg-pink-50 transition">Clarify a Query</Link>
            </div>
          </div>
        </div>

        {/* Goa-to-Goa Package (Kids Pricing) Improved UI */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 md:p-8 space-y-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,150,150,0.08),transparent_70%)]" />
          <div className="relative flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-md">👨‍👩‍👧</div>
            <h3 className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-600 tracking-wide">Kids Charges</h3>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-5">
            <div className="group rounded-xl bg-white/90 backdrop-blur-sm border border-teal-100 p-5 flex flex-col justify-between text-center shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide">Up to 7 Years</p>
                <p className="text-2xl font-extrabold text-teal-700 mt-1">FREE</p>
              </div>
              <p className="mt-3 text-[11px] text-teal-600 font-medium">Shared room & meals</p>
            </div>
            <div className="group rounded-xl bg-white/90 backdrop-blur-sm border border-teal-100 p-5 flex flex-col justify-between text-center shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide">7 – 12 Years</p>
                <p className="text-xl font-extrabold text-teal-700 mt-1">₹1000 <span className="text-sm font-bold text-teal-500">/ day</span></p>
              </div>
              <p className="mt-3 text-[11px] text-teal-600 font-medium">Meals + stay (same room)</p>
            </div>
            <div className="group rounded-xl bg-white/90 backdrop-blur-sm border border-teal-100 p-5 flex flex-col justify-between text-center shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide">12+ Years</p>
                <p className="text-xl font-extrabold text-teal-700 mt-1">₹2500 <span className="text-sm font-bold text-teal-500">/ day</span></p>
              </div>
              <p className="mt-3 text-[11px] text-teal-600 font-medium">Meals + stay (same room)</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 relative z-10 text-[11px] md:text-xs text-teal-700">
            <p className="flex items-start gap-2"><span className="inline-block w-2 h-2 rounded-full bg-teal-500 mt-1" />Child pricing applies only when sharing room with parents.</p>
            <p className="flex items-start gap-2"><span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mt-1" />Valid for registered family members in Sparsh.</p>
          </div>
        </div>

        {/* Travel Options */}
        <div className="bg-white rounded-2xl p-6 md:p-7 border border-cyan-100 shadow-md space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-700">Optional Group Travel (Sparsh Transport)</h3>
          <p className="text-sm text-gray-700 leading-relaxed">If you wish to travel with Sparsh’s group arrangement, please register your interest and choose your preferred mode. We will explore the most comfortable option and confirm soon.</p>
          <ul className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <li className="flex-1 bg-cyan-50 border border-cyan-100 rounded-xl p-4 text-center text-sm font-semibold text-cyan-700">Train – 3-Tier / Sleeper</li>
            <li className="flex-1 bg-cyan-50 border border-cyan-100 rounded-xl p-4 text-center text-sm font-semibold text-cyan-700">Bus</li>
          </ul>
          <p className="text-[11px] text-cyan-600">Travel cost additional • Final option shared post interest survey.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border border-blue-100 rounded-2xl p-6 md:p-7 shadow-lg">
              <h2 className="text-sm tracking-wide font-bold uppercase text-blue-700 mb-4">Trip Highlights</h2>
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-medium text-gray-700">
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">4-star Luxury Stay</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Private Beach Access</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">All Meals Included</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Fun Games & Party</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Couple & Family Bonding</li>
                <li className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">Relaxation & Joy</li>
              </ul>
              <p className="text-xs text-gray-600 font-medium mt-3">2 days of pure relaxation, joy & togetherness.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-lg border border-gray-200">
              <h2 className="text-sm tracking-wide font-bold uppercase text-blue-700 mb-3">Why Join This Getaway?</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                Reconnect, rejuvenate and celebrate togetherness at an exclusive beachside retreat curated for our JSG Pune Sparsh community. Crafted so families and couples can unwind, bond and create golden memories, this two-night escape blends leisure, curated dining, engaging activities and elegant ambience—away from the everyday rush.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 md:p-7 shadow-lg border border-gray-200">
              <h4 className="text-sm font-bold uppercase tracking-wide text-blue-700 mb-2">Stay Tuned</h4>
              <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">Registration link will be activated soon. Prepare to book early.</p>
              <p className="text-xs text-gray-500">We will announce booking window across all channels.</p>
            </div>
          </div>
        </div>
      </div>

      {showInterest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Goa 2026 • Interest Form</h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white text-sm">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
              {success ? (
                <div className="space-y-4">
                  <p className="font-semibold text-green-700">Thank you! Your interest has been noted.</p>
                  <p className="text-gray-600 text-xs">We will reach out when bookings open. Save the dates!</p>
                  <button type="button" onClick={closeModal} className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white py-2 font-semibold">Close</button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} required className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Full Name" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Mobile Number *</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} required pattern="\d{10}" className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="10-digit" />
                      {!validMobile.test(formData.mobile) && formData.mobile !== '' && <span className="text-[10px] text-red-500">Enter 10 digits</span>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Transport *</label>
                      <select name="transport" value={formData.transport} onChange={handleChange} className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <option>Self</option>
                        <option>Sparsh Bus</option>
                        <option>Sparsh Train</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Bringing Kids? *</label>
                      <select name="kids" value={formData.kids} onChange={handleChange} className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </div>
                  </div>
                  {formData.kids === 'Yes' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-medium">Kids Count *</label>
                        <input name="kidsCount" value={formData.kidsCount} onChange={handleChange} required={formData.kids==='Yes'} type="number" min="1" className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-medium">Kids Ages (comma separated) *</label>
                        <input name="kidsAges" value={formData.kidsAges} onChange={handleChange} required={formData.kids==='Yes'} className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. 5,8" />
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Extra Guest Couple Count</label>
                      <input name="extraCoupleCount" value={formData.extraCoupleCount} onChange={handleChange} type="number" min="0" className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="0" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium">Notes (optional)</label>
                      <input name="notes" onChange={handleChange} className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Any special info" />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-relaxed">This is an interest form only – booking will be confirmed later. Ensure mobile number is correct for updates.</div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-semibold py-2 shadow">{submitting ? 'Submitting...' : 'Submit Interest'}</button>
                    <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes glow {
          0%,100% { text-shadow: 0 0 14px rgba(255,255,255,0.95), 0 0 28px rgba(59,130,246,0.55), 0 0 48px rgba(251,191,36,0.5); }
          50% { text-shadow: 0 0 6px rgba(255,255,255,0.75), 0 0 18px rgba(59,130,246,0.45), 0 0 32px rgba(251,191,36,0.4); }
        }
        .glow-text { animation: glow 4s ease-in-out infinite; }
        .glow-subtext { text-shadow: 0 0 6px rgba(255,255,255,0.8), 0 0 16px rgba(59,130,246,0.4), 0 0 24px rgba(251,191,36,0.35); }
        @keyframes fall {
          0% { transform: translateY(-20px) scale(1) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) scale(0.8) rotate(360deg); opacity: 0; }
        }
        .animate-fall { animation-name: fall; animation-timing-function: linear; animation-iteration-count: 1; }
      `}</style>
    </div>
  )
}
