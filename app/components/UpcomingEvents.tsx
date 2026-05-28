'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'

export default function UpcomingEvents() {
  const [upcomingTarget, setUpcomingTarget] = useState('/events/khelotsav-2026')

  useEffect(() => {
    const loadUpcomingTarget = async () => {
      try {
        const res = await fetch('/api/admin/upcoming-event-target', { cache: 'no-store' })
        const data = await res.json()
        if (data?.target) setUpcomingTarget(data.target)
      } catch {
        setUpcomingTarget('/events/khelotsav-2026')
      }
    }

    loadUpcomingTarget()
  }, [])

  const events = [
    {
      id: 1,
      title: 'Mahavir Jayanti Celebration',
      date: '2024-04-21',
      time: '6:00 PM - 9:00 PM',
      venue: 'JSG Community Hall, Pune',
      description: 'Join us for the grand celebration of Mahavir Jayanti with puja, cultural programs, and community dinner.',
      category: 'Religious',
      featured: true
    },
    {
      id: 2,
      title: 'Youth Cultural Night',
      date: '2024-04-28',
      time: '7:00 PM - 10:00 PM',
      venue: 'Modern College Auditorium',
      description: 'An evening of music, dance, and entertainment organized by JSG youth members.',
      category: 'Cultural',
      featured: false
    },
    {
      id: 3,
      title: 'Community Picnic',
      date: '2024-05-05',
      time: '8:00 AM - 6:00 PM',
      venue: 'Sinhagad Fort, Pune',
      description: 'Annual family picnic with games, activities, and delicious Jain food.',
      category: 'Social',
      featured: false
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our exciting upcoming events and activities that bring our community together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden card-hover ${
                event.featured ? 'lg:col-span-2 lg:row-span-1' : ''
              }`}
            >
              <div className={`bg-gradient-to-r ${
                event.category === 'Religious' ? 'from-orange-400 to-red-500' :
                event.category === 'Cultural' ? 'from-purple-400 to-pink-500' :
                'from-green-400 to-blue-500'
              } p-6 text-white`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-sm opacity-90">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                </div>
                <h3 className={`font-bold mb-2 ${event.featured ? 'text-2xl' : 'text-xl'}`}>
                  {event.title}
                </h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar size={16} className="mr-2" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock size={16} className="mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={upcomingTarget}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold"
          >
            <span>View All Events</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}