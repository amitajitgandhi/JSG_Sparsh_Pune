'use client'

import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

export default function Events2027() {
  const [showModal, setShowModal] = useState(false)
  const [modalUrl, setModalUrl] = useState('')

  const events = [
    {
      id: 1,
      title: 'Funverse',
      date: '2026-04-26',
      time: '11:00 AM Onwards',
      venue: 'Sneh Resort, Pune',
      description: 'The Installation Ceremony marks the beginning of a new chapter for JSG Pune Sparsh. This grand event brings together our community to witness the installation of the new committee members who will lead us through the year 2026-2027. Expect an evening filled with fun, celebration, and entertainment.',
      attendees: '200+',
      highlights: ['Committee Installation', 'Fun Activities', 'Adventure', 'Community Bonding'],
          galleryUrl: 'https://www.facebook.com/media/set/?set=a.122238040520263798&type=3',
      pageUrl: '/events/Funverse'
    },
    {
      id: 2,
      title: 'Sparsh Cricket Championship',
      date: '2026-06-07',
      time: '2:00 PM – 11:00 PM',
      venue: 'Tembekar Ground',
      description: 'A full pitch cricket tournament held at Tembekar Ground. An action-packed Sunday of competitive cricket bringing together our community for a day of sport, spirit, and camaraderie.',
      attendees: '5 Teams · 55 Players',
      highlights: ['Full Pitch', '5 Teams', '55 Players', 'Tembekar Ground'],
      galleryUrl: 'https://www.facebook.com/media/set/?set=a.122242184882263798&type=3',
    },
    {
      id: 3,
      title: 'Khelotsav',
      date: '2026-06-21',
      time: '8:00 AM – 6:00 PM',
      venue: 'Downtown Sports Complex',
      description: 'JSG Pune Sparsh Khelotsav — a multi-sport extravaganza featuring 12+ sports across multiple categories. A celebration of healthy competition, team spirit, medals, and unlimited fun for the whole community.',
      attendees: '8 Teams · 250+ Players',
      highlights: ['12+ Sports', '8 Teams', '250+ Players', 'Medals & Glory'],
      galleryUrl: 'https://www.facebook.com/media/set/?set=a.122243997542263798&type=3',
      pageUrl: '/events/khelotsav',
    },
    {
      id: 4,
      title: 'Adventure Escape 2026',
      date: '2026-07-04',
      time: '1 Night, 2 Days',
      venue: 'Kolad, Maharashtra',
      description: 'A thrilling getaway to Kolad packed with river rafting, kayaking, ziplining, waterfall trekking, raft building, and water volleyball — capped off with a DJ night, great food, and a comfortable stay. The perfect adventure-filled escape for the whole JSG Pune Sparsh family.',
      attendees: '200+',
      highlights: ['River Rafting', 'Zipline', 'Waterfall Trek', 'DJ Night'],
      galleryUrl: 'To be updated soon!',
      pageUrl: '/events/adventure-escape-2026',
    },
    {
      id: '[BONUS]',
      title: 'Orchestra Night · Healing Harmony 2026',
      date: '2026-07-16',
      time: '5:00 PM – 8:00 PM',
      venue: 'Annabhau Sathe Auditorium, Pune',
      description: 'JSG Pune Sparsh, in association with Umeed Cancer Support Forum, JSG Pune Main, Aastha Breast Care and Kalangan, invites you to a heart-touching musical evening where doctors and cancer survivors come together to celebrate life, resilience, and the power of hope through music.',
      attendees: 'Free Entry · All Welcome',
      highlights: ['Live Orchestra', 'Doctors & Survivors', 'Hope & Courage', 'Free Entry'],
      galleryUrl: 'To be updated soon!',
      detailsUrl: '/events/orchestra-night',
    }
  ]

  // Function to handle external gallery links - Always show modal
  const handleGalleryLink = (url: string) => {
    setModalUrl(url);
    setShowModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modalUrl);
      setShowModal(false);
    } catch (error) {
      console.warn('Could not copy to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Link to Past Events */}
        <div className="mb-6 flex justify-end">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-gray-200 font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowRight size={16} className="rotate-180" />
            <span>2025-2026 Events</span>
          </Link>
        </div>

        {/* Page Header - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 mb-3 sm:mb-4 md:mb-6 px-2">
            Events 2026 - 2027
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-2">
            Welcome to a new year of exciting events and memorable experiences! 
            Discover upcoming celebrations that will bring our JSG Pune Sparsh family together for 
            another year of joy, bonding, and unforgettable moments.
          </p>
        </div>

        {/* Events Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          {events.map((event, index) => {
            const isEvenIndex = index % 2 === 0
            const headerColor = isEvenIndex ? 'from-emerald-500 to-blue-500' : 'from-blue-500 to-purple-500'
            const idText = String(event.id).replace(/\.$/, '')
            const isBonusId = idText.toUpperCase().includes('BONUS')

            return (
              <div key={event.id} className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Event Header - Mobile Optimized */}
                <div className={`bg-gradient-to-r ${headerColor} p-4 sm:p-6 md:p-8 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 ${isEvenIndex ? 'bg-purple-300' : 'bg-emerald-600'} rounded-full -top-12 -right-12 sm:-top-16 sm:-right-16 md:-top-24 md:-right-24`}></div>
                  </div>
                  <div className="relative z-10 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      {isBonusId ? (
                        <div className="leading-tight">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 break-words">
                            {'pageUrl' in event && event.pageUrl ? (
                              <Link href={event.pageUrl} className="hover:underline underline-offset-4 decoration-2 transition-all">{event.title}</Link>
                            ) : event.title}
                          </h3>
                          <div className="text-xs sm:text-sm font-semibold opacity-90 mt-0.5">{idText}</div>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-3">
                          <span className="text-lg sm:text-xl md:text-2xl font-semibold">{idText}.</span>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold break-words m-0">
                            {'pageUrl' in event && event.pageUrl ? (
                              <Link href={event.pageUrl} className="hover:underline underline-offset-4 decoration-2 transition-all">{event.title}</Link>
                            ) : event.title}
                          </h3>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isEvenIndex ? 'text-purple-200' : 'text-emerald-200'}`}>
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-xs sm:text-sm opacity-90 font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details - Responsive Heights */}
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  {/* Full Description - No Truncation */}
                  <div>
                    <p className="text-gray-700 leading-relaxed font-medium text-xs sm:text-sm md:text-base">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Highlights - Original Grid Style */}
                  <div>
                    <h4 className={`font-bold ${isEvenIndex ? 'text-emerald-800' : 'text-purple-800'} mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wide`}>
                      Event Highlights
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {event.highlights.map((highlight, idx) => (
                        <span key={idx} className={`${isEvenIndex ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'} px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold border text-center leading-tight`}>
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Event Info - Compact Mobile Layout */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className={`flex items-start ${isEvenIndex ? 'text-emerald-700' : 'text-purple-700'}`}>
                      <Calendar size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-emerald-600' : 'text-purple-600'} flex-shrink-0`} />
                      <span className="font-medium text-xs sm:text-sm leading-tight">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={`flex items-start ${isEvenIndex ? 'text-emerald-700' : 'text-purple-700'}`}>
                      <Clock size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-emerald-600' : 'text-purple-600'} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm leading-tight break-words">{event.time}</span>
                    </div>
                    <div className={`flex items-start ${isEvenIndex ? 'text-emerald-700' : 'text-purple-700'}`}>
                      <MapPin size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-emerald-600' : 'text-purple-600'} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm leading-tight break-words">{event.venue}</span>
                    </div>
                    <div className={`flex items-start ${isEvenIndex ? 'text-emerald-700' : 'text-purple-700'}`}>
                      <Users size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-emerald-600' : 'text-purple-600'} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm leading-tight">
                        <strong className="font-bold">{event.attendees}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Single Action Button - Full Width */}
                  <div className="pt-2">
                    {'detailsUrl' in event && event.detailsUrl ? (
                      <Link href={event.detailsUrl} className={`w-full ${isEvenIndex ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-500 hover:bg-purple-600'} text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105`}>
                        <span>View Details</span>
                        <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <button onClick={() => { if ('galleryUrl' in event && event.galleryUrl) handleGalleryLink(event.galleryUrl) }} className={`w-full ${isEvenIndex ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-500 hover:bg-purple-600'} text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105`}>
                        <span>View Event Gallery</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl border-2 border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-purple-50 opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 px-2 leading-tight">
              Want to Propose an Event?
            </h3>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
              Have an exciting idea for a JSG Pune Sparsh event? Whether it's cultural, adventure,
              or community bonding - we'd love to hear your suggestions and make it happen together!
            </p>
            <div className="flex justify-center">
              <Link
                href="/committee"
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:brightness-110 text-white px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-block"
              >
                Contact Event Team
              </Link>
            </div>
          </div>
        </div>

        {/* Custom Modal - Enhanced for Mobile */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full relative overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="w-32 h-32 bg-purple-300 rounded-full -top-16 -right-16"></div>
                </div>
                <div className="relative z-10 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Event Gallery</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Gallery URL:</p>
                  <p className="text-xs text-emerald-600 break-all font-mono bg-white p-2 rounded border">
                    {modalUrl}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:brightness-110 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
