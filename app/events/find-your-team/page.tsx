'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Search, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function FindYourTeam() {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number; type: 'ember' | 'smoke' }[]>([])
  const [hide, setHide] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<{ found: boolean; teamName?: string; message: string } | null>(null)
  const [csvData, setCsvData] = useState<{ phone: string; team: string }[]>([])
  const [loadingCsv, setLoadingCsv] = useState(true)

  // Load CSV data on mount
  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const response = await fetch('/files/double-cross.csv')
        const text = await response.text()
        
        // Parse CSV - column 2: phone, column 3: team, column 4: member_name
        const lines = text.split('\n').filter(line => line.trim())
        const data = lines.slice(1).map(line => { // Skip header
          const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''))
          return {
            phone: columns[1] || '',      // Column 2 (index 1)
            team: columns[2] || '',       // Column 3 (index 2)
            memberName: columns[3] || ''  // Column 4 (index 3)
          }
        }).filter(item => item.phone && item.team)
        
        setCsvData(data)
        setLoadingCsv(false)
      } catch (error) {
        console.error('Failed to load team data:', error)
        setLoadingCsv(false)
      }
    }
    
    loadCsvData()
  }, [])

  // Fire particles
  useEffect(() => {
    const count = 36
    const list: typeof particles = []
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 6 + 4,
        delay: Math.random() * 1.5,
        duration: Math.random() * 3 + 4,
        type: Math.random() < 0.5 ? 'ember' : 'smoke'
      })
    }
    setParticles(list)
    const t = setTimeout(() => setHide(true), 8000)
    return () => clearTimeout(t)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim()) {
      setResult({ found: false, message: 'Please enter a phone number' })
      return
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedInput = phoneNumber.replace(/\D/g, '')
    
    setSearching(true)
    setResult(null)

    // Simulate search delay for UX
    setTimeout(() => {
      const match = csvData.find(item => {
        const normalizedPhone = item.phone.replace(/\D/g, '')
        return normalizedPhone.includes(normalizedInput) || normalizedInput.includes(normalizedPhone)
      })

      if (match) {
        setResult({
          found: true,
          teamName: match.team,
          message: `You're in Team ${match.team}!`
        })
      } else {
        setResult({
          found: false,
          message: 'Phone number not found. Please check and try again.'
        })
      }
      setSearching(false)
    }, 600)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhoneNumber(value)
  }

  const resetSearch = () => {
    setPhoneNumber('')
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-rose-900 to-black pb-12 relative overflow-hidden text-white">
      {/* Fire particles overlay */}
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
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] overflow-hidden">
        <Image
          src="/images/double-cross.png"
          alt="Find Your Team"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-12 md:-mt-16 relative z-20 space-y-6">
        {/* Title Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-neutral-900 via-rose-900 to-black p-6 sm:p-10 border-4 border-yellow-400 animated-border">
          <div className="flex items-center justify-center w-full text-center flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-6xl md:text-7xl">🔍</span>
              <h1 className="leading-tight text-2xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-rose-400 to-white title-glow">
                FIND YOUR TEAM
              </h1>
              <span className="text-3xl sm:text-6xl md:text-7xl">👥</span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
              Enter your phone number to discover which Double-Cross team you're in!
            </p>
          </div>
        </div>

        {/* Search Card */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-rose-700 to-rose-800 shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-rose-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-8 md:p-10 shadow'>
            {loadingCsv ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-12 w-12 mx-auto text-rose-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading team data...</p>
              </div>
            ) : (
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                    <Search className="h-5 w-5 text-rose-600" />
                    Enter Your Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-5 py-4 text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                      disabled={searching}
                    />
                    {phoneNumber && (
                      <button
                        type="button"
                        onClick={resetSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your 10-digit mobile number registered for the event
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={searching || !phoneNumber || phoneNumber.length !== 10}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-black text-white font-bold text-lg shadow-lg hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {searching ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Find My Team
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Result Display */}
            {result && (
              <div className={`mt-8 rounded-2xl p-6 border-2 ${
                result.found
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-500'
              } animate-fadeIn`}>
                <div className="flex items-start gap-4">
                  {result.found ? (
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-red-500 flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      result.found ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.found ? '🎉 Team Found!' : '😔 Not Found'}
                    </h3>
                    <p className={`text-lg ${
                      result.found ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.message}
                    </p>
                    {result.found && result.teamName && (
                      <div className="mt-4 p-4 rounded-xl bg-white/80 dark:bg-neutral-800/80 border-2 border-green-300 dark:border-green-600">
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Your Team</p>
                            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600">
                              {result.teamName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={resetSearch}
                  className="mt-4 w-full py-2 px-4 rounded-lg bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Search Again
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Info Card */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-rose-700 to-rose-800 shadow-lg overflow-hidden border border-rose-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-white/95 dark:bg-neutral-900/95 p-6 shadow'>
            <h3 className='text-lg font-bold text-gray-800 dark:text-gray-100 mb-3'>ℹ️ Important Information</h3>
            <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
              <li className='flex items-start gap-2'>
                <span className='text-rose-600 font-bold'>•</span>
                <span>Make sure you're using the same phone number you registered with</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-rose-600 font-bold'>•</span>
                <span>Enter your 10-digit mobile number without country code or spaces</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-rose-600 font-bold'>•</span>
                <span>If you can't find your team, please contact the event organizers</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <style jsx>{`
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: float-up linear infinite;
        }
        .particle.ember {
          background: radial-gradient(circle, rgba(255, 100, 50, 0.9), rgba(255, 50, 0, 0.3));
          box-shadow: 0 0 10px rgba(255, 100, 50, 0.8);
        }
        .particle.smoke {
          background: radial-gradient(circle, rgba(200, 200, 200, 0.4), transparent);
        }
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.9;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) scale(0.3);
            opacity: 0;
          }
        }
        .animated-border {
          position: relative;
        }
        .animated-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-rotate 3s linear infinite;
        }
        @keyframes border-rotate {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .title-glow {
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
