'use client'

import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

export default function Events() {
  const [showModal, setShowModal] = useState(false)
  const [modalUrl, setModalUrl] = useState('')

  const events = [
    // Past Programs (for reference and inspiration)
    {
      id: 1,
      title: 'Rangbarse & AGM 2025',
      date: '2025-03-16',
      time: '9:00 AM - 6:00 PM',
      venue: 'Bharti Resort, Pune',
      description: 'A memorable Holi celebration with record-breaking participation of 275 members! Featured breakfast, adventure activities, vibrant Holi party with colors, foam, rain dance, and concluded with AGM presentation.',
      attendees: '250+ members',
      highlights: ['Adventure Activities', 'Rain Dance', 'DJ & Dancing', 'AGM Presentation'],
      galleryUrl: 'https://www.facebook.com/share/p/17YNJaTyoV/'
    },
    {
      id: 2,
      title: 'Installation - Desh Rangila',
      date: '2025-04-16',
      time: '5:00 PM - 11:00 PM',
      venue: 'Utsav Banquet, Pune',
      description: 'Vibrant celebration of India\'s cultural heritage with committee installation. Members dressed in traditional attire representing diverse Indian cultures, with dance performances and oath-taking ceremony.',
        attendees: '200+ members' ,
      highlights: ['Committee Installation', 'Cultural Performances', 'Traditional Attire', 'Award Ceremony'],
      galleryUrl: 'https://www.facebook.com/share/p/1JzCcPrGx5/'
    },
    {
      id: 3,
      title: 'Aqua Magic',
      date: '2025-06-01',
      time: '7:00 AM - 11:00 PM',
      venue: 'Aqua Imagica Water Park',
      description: 'Unforgettable splash of fun at Aqua Imagica! Started with Darshan at Kalash Mandir, followed by thrilling water rides, wave pools, lunch at the park, and dinner at Zalawadi.',
        attendees: '150+ members',
      highlights: ['Water Rides', 'Wave Pools', 'Temple Darshan', 'Full Day Fun'],
      galleryUrl: 'https://www.facebook.com/share/p/17W5ri8BCV/'
    },
    {
      id: 4,
      title: 'Dazzle-N-Dance',
      date: '2025-07-06',
      time: '4:00 PM - 11:30 PM',
      venue: 'Epitome, Pune',
      description: 'Glam & Glitter edition with Masti Mania, live band musical tambola by Abhishek Parekh, and high-energy Bachata-Bollywood fusion by actress Aiyli Giya. Dance floor alive till the end!',
      attendees: '200+ members',
      highlights: ['Live Band Tambola', 'Bachata', 'Celebrity Performance', 'DJ Night'],
      galleryUrl: 'https://www.facebook.com/share/p/17UaNPMcHd/'
    },
    // Newly added events
    {
      id: 5,
      title: 'Mini Cricket Tournament [BONUS]',
      date: '2025-08-15',
      time: '4:00 PM - 11:30 PM',
      venue: 'PSA, Pune',
      description: 'Independence Day celebration featuring a spirited Mini Cricket Tournament & Auction. Opening ceremony graced by Ex-Army Sunil Kale Sir. Every match showcased healthy competition, player passion, and unity—creating unforgettable memories and reinforcing teamwork.',
      attendees: '60+ players',
      highlights: ['Auction', 'Opening by Ex-Army Sunil Kale Sir', 'Team Spirit', 'Independence Day Energy'],
        galleryUrl: 'https://www.facebook.com/share/p/1FDbG2oLhR/'
    },
    {
      id: 6,
      title: 'ATMASPARSH Tirthyatra',
      date: '2025-09-07',
      time: '7:00 AM - 11:30 PM',
      venue: 'Abhay Prabhavana & Jayanand Dham, Lonavala',
      description: 'The divine journey began with a soulful visit to the Jain Spiritual Museum – Abhay Prabhavana, followed by darshan and bhakti at Jayanand Dham, Lonavala. The yatra culminated in a felicitation ceremony honoring over 80 Tapasvis who observed diverse tapasya during Paryushan',
      attendees: '80+ Tapasvis',
      highlights: ['Tapasvi Felicitation', 'Silver Coin Lucky Draw', 'Spiritual Upliftment', 'Community Bonding'],
        galleryUrl: 'https://www.facebook.com/media/set/?set=a.122212157300263798&type=3'
    },
    {
      id: 7,
        title: 'Rangeelo Garba [BONUS]',
      date: '2025-09-30',
      time: '7:00 PM - 11:30 PM',
      venue: 'Mahalakshmi Lawns, Karvenagar',
      description: 'A night of rhythm, joy & celebration managed by Lokmat Group. Energetic Garba & Dandiya, vibrant traditional attire, festive Navratri spirit, and pride as winners across men, women & kids were all from JSG Pune Sparsh!',
        attendees: '200+ members',
      highlights: ['Garba & Dandiya', 'Managed by Lokmat Group', 'Traditional Attire', 'Multiple Winners'],
        galleryUrl: 'https://www.facebook.com/share/p/1BuUt4Tz2q/'
      },
      {
          id: 8,
          title: 'SPL 2.0 Grand Auction',
          date: '2025-10-29',
          time: '5:00 PM - 11:30 PM',
          venue: 'Vilayati Pure Veg, Kondhwa',
          description: 'The official grand auction for Sparsh Premier League – Season 02 (SPL 2.0), organized in association with SG Promoters & Real Estate Consultant, featuring Men’s, Women’s, and Kids’ divisions with exciting team selections and big reveals.',
          attendees: '150+ participants',
          highlights: ['Cricket Auction', 'Revealing Ceremony', 'Sparsh App Launch', 'Delicious Dinner'],
          galleryUrl: 'https://www.facebook.com/media/set/?set=a.122218043144263798&type=3'
      },
      {
          id: 9,
          title: 'Sparsh Premier League #02',
          date: '2025-11-15',
          time: '8:00 AM - 11:30 PM',
          venue: 'PSA Ground, Kondhwa',
          description: '11 Mens Team, 4 Womens Team, 4 Kids Team, 150+ passionate players battling it out over 2 action-packed days filled with thrilling cricket, team spirit, and nonstop excitement.',
          attendees: '150+ participants',
          highlights: ['Nailbiting Matches', 'Trophies', 'Delicious Food', 'Entertainment'],
          galleryUrl: 'https://www.facebook.com/media/set/?set=a.122220334856263798&type=3'
      },
      {
          id: 10,
          title: 'Yavat24 Hurday Party',
          date: '2025-12-21',
          time: '2 Days',
          venue: 'Yavat24',
          description: 'A full-day celebration at Yavat24 bringing together 250+ participants for fun-filled activities, great food, lively entertainment, and memorable moments.',
          attendees: '250+ members',
          highlights: ['Hurda', 'Fun Games', 'Pool', 'Entertainment'],
          galleryUrl: 'To be updated soon..!!'
      },
      {
          id: 11,
          title: 'Goa Escape',
          date: '2026-01-24',
          time: '2 Nights',
          venue: 'South Goa',
          description: 'Stay at a 4-Star Beach Touch Resort on the pristine Betalbatim Beach, where golden sands meet crystal-blue waters. A perfect blend of fun, relaxation, and unforgettable memories awaits you in paradise!',
          attendees: '100+ members',
          highlights: ['Beach', 'Party', 'Bonding', 'Refreshment'],
          galleryUrl: 'To be updated soon..!!'
      }
  ]

  // Function to handle external gallery links - Always show modal
  const handleGalleryLink = (url: string) => {
    // Always show the modal instead of trying to navigate to Facebook
    setModalUrl(url);
    setShowModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modalUrl);
      setShowModal(false);
      // You could add a toast notification here instead
    } catch (error) {
      console.warn('Could not copy to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Page Header - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 mb-3 sm:mb-4 md:mb-6 px-2">
            Events 2025 - 2026
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-2">
            Discover our vibrant community events - from cultural celebrations and adventure trips 
            to memorable experiences that brought our JSG Pune Sparsh family together. Relive the moments 
            that made our community stronger and more united.
          </p>
        </div>

        {/* Events Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          {events.map((event, index) => {
            const isEvenIndex = index % 2 === 0
            const headerColor = isEvenIndex ? 'from-blue-500 to-blue-600' : 'from-yellow-500 to-yellow-600'

            return (
              <div key={event.id} className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Event Header - Mobile Optimized */}
                <div className={`bg-gradient-to-r ${headerColor} p-4 sm:p-6 md:p-8 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 ${isEvenIndex ? 'bg-yellow-300' : 'bg-blue-600'} rounded-full -top-12 -right-12 sm:-top-16 sm:-right-16 md:-top-24 md:-right-24`}></div>
                  </div>
                  <div className="relative z-10 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 leading-tight break-words">{event.id}. {event.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isEvenIndex ? 'text-yellow-200' : 'text-blue-200'}`}>
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
                    <h4 className={`font-bold ${isEvenIndex ? 'text-blue-800' : 'text-yellow-800'} mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wide`}>
                      Event Highlights
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {event.highlights.map((highlight, idx) => (
                        <span key={idx} className={`${isEvenIndex ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'} px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold border text-center leading-tight`}>
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Event Info - Compact Mobile Layout */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className={`flex items-start ${isEvenIndex ? 'text-blue-700' : 'text-yellow-700'}`}>
                      <Calendar size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-blue-600' : 'text-yellow-600'} flex-shrink-0`} />
                      <span className="font-medium text-xs sm:text-sm leading-tight">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={`flex items-start ${isEvenIndex ? 'text-blue-700' : 'text-yellow-700'}`}>
                      <Clock size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-blue-600' : 'text-yellow-600'} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm leading-tight break-words">{event.time}</span>
                    </div>
                    <div className={`flex items-start ${isEvenIndex ? 'text-blue-700' : 'text-yellow-700'}`}>
                      <MapPin size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-blue-600' : 'text-yellow-600'} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm leading-tight break-words">{event.venue}</span>
                    </div>
                    <div className={`flex items-start ${isEvenIndex ? 'text-blue-700' : 'text-yellow-700'}`}>
                      <Users size={14} className={`mr-2 sm:mr-3 mt-0.5 ${isEvenIndex ? 'text-blue-600' : 'text-yellow-600'} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm leading-tight">
                        <strong className="font-bold">{event.attendees}</strong> members attended
                      </span>
                    </div>
                  </div>

                  {/* Single Gallery Button - Full Width */}
                  <div className="pt-2">
                    <button onClick={() => handleGalleryLink(event.galleryUrl)} className={`w-full ${isEvenIndex ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105`}>
                      <span>View Event Gallery</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl border-2 border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-yellow-50 opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 px-2 leading-tight">
              Want to Propose an Event?
            </h3>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
              Have an exciting idea for a JSG Pune Sparsh event? Whether it's cultural, adventure,
              or community bonding - we'd love to hear your suggestions and make it happen together!
            </p>
            <div className="flex justify-center">
              <Link
                href="/committee"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl md:rounded-2xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-block"
              >
                Contact Event Team
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Events Quick Links */}
        <div className="mt-6 sm:mt-8 md:mt-10">
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border-2 border-gray-100">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600 mb-4 sm:mb-6">
              Recent Events
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              <Link href="/spl02" className="inline-flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 sm:py-4 px-4 shadow hover:shadow-md text-sm sm:text-base">
                SPL 02
              </Link>
              <Link href="/events/hurda-party" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 sm:py-4 px-4 shadow hover:shadow-md text-sm sm:text-base">
                Hurda Party
                          </Link>
                          <Link href="/events/goa-2026" className="inline-flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-4 shadow hover:shadow-md text-sm sm:text-base">
                              Goa 2026
                          </Link>
            </div>
          </div>
        </div>

        {/* Custom Modal - Enhanced for Mobile */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full relative overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
                <div className="absolute inset-0 opacity-10">
                  <div className="w-32 h-32 bg-yellow-300 rounded-full -top-16 -right-16"></div>
                </div>
                <div className="relative z-10 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Event Gallery</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Gallery URL:</p>
                  <p className="text-xs text-blue-600 break-all font-mono bg-white p-2 rounded border">
                    {modalUrl}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
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