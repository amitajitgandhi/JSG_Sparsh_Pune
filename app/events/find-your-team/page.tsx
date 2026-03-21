'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Search, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function FindYourTeam() {
  const [particles, setParticles] = useState<{ id: number; left: number; size: number; delay: number; duration: number; type: 'ember' | 'smoke' }[]>([])
  const [hide, setHide] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<{ found: boolean; teamName?: string; memberName?: string; teamColor?: string; message: string } | null>(null)
  const [csvData, setCsvData] = useState<{ phone: string; team: string; memberName: string; teamColor: string }[]>([])
  const [loadingCsv, setLoadingCsv] = useState(true)

  // Load CSV data on mount
  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const response = await fetch('/files/double-cross.csv')
        const text = await response.text()
        
        // Parse CSV - column 2: phone, column 3: team, column 4: member_name, column 5: team_color
        const lines = text.split('\n').filter(line => line.trim())
        const data = lines.slice(1).map(line => { // Skip header
          const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''))
          return {
            phone: columns[1] || '',      // Column 2 (index 1)
            team: columns[2] || '',       // Column 3 (index 2)
            memberName: columns[3] || '', // Column 4 (index 3)
            teamColor: columns[4] || ''   // Column 5 (index 4)
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
          memberName: match.memberName,
          teamColor: match.teamColor,
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
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl">🔍</span>
              <h1 className="leading-tight text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-rose-400 to-white title-glow">
                FIND YOUR TEAM
              </h1>
              <span className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl">👥</span>
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
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
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
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-black text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3"
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
              <div className={`mt-8 rounded-2xl p-4 sm:p-6 border-2 overflow-hidden max-w-full ${
                result.found
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-500'
              } animate-fadeIn`}>
                <div className="flex items-start gap-2 sm:gap-4 max-w-full overflow-hidden">
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
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words ${
                      result.found ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {result.found ? '🎉 Team Found!' : '😔 Not Found'}
                    </h3>
                    <p className={`text-sm sm:text-base md:text-lg break-words overflow-wrap-anywhere ${
                      result.found ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.message}
                    </p>
                    {result.found && result.teamName && (
                      <div className="mt-4 space-y-3">
                        {/* Team Name Card */}
                        <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-white/80 dark:bg-neutral-800/80 border-2 border-green-300 dark:border-green-600 overflow-hidden">
                          <div className="flex items-start gap-2 sm:gap-3 max-w-full">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your Team</p>
                              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600 break-words overflow-wrap-anywhere leading-tight">
                                {result.teamName}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Team Color Card */}
                        {result.teamColor && (
                          <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-600 overflow-hidden">
                            <div className="flex items-start gap-2 sm:gap-3 max-w-full">
                              <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full flex-shrink-0 mt-0.5 sm:mt-1 shadow-lg border-2 border-white dark:border-gray-700" style={{ backgroundColor: result.teamColor }}>
                              </div>
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Team Color</p>
                                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 break-words overflow-wrap-anywhere capitalize leading-tight">
                                  {result.teamColor}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Member Name Card */}
                        {result.memberName && (
                          <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 overflow-hidden">
                            <div className="flex items-start gap-2 sm:gap-3 max-w-full">
                              <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base flex-shrink-0 mt-0.5 sm:mt-1">
                                👤
                              </div>
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Member Name</p>
                                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 break-words overflow-wrap-anywhere leading-tight">
                                  {result.memberName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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

        {/* Contact Card */}
        <section className='group relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-black/40 via-green-700 to-green-800 shadow-lg overflow-hidden border border-green-800'>
          <div className='absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_65%)] transition-opacity' />
          <div className='relative rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 p-6 shadow'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl'>
                💬
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-800 dark:text-gray-100'>Need Help?</h3>
                <p className='text-sm text-gray-600 dark:text-gray-300'>Contact us on WhatsApp for any queries</p>
              </div>
            </div>
            <a 
              href='https://wa.me/917276319578'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center gap-2 sm:gap-3 w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:brightness-110 transition-all transform hover:scale-[1.02] active:scale-[0.98]'
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
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
