'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import SharadbhaiTribute from './SharadbhaiTribute'

export default function AboutSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 mx-auto mb-3 sm:mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 sm:w-96 mx-auto mb-6 sm:mb-8"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        
        {/* Learn More About Us Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-4 sm:mb-6">
            Discover JSG Pune Sparsh
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Learn about our mission, values, and how we're building a unified Jain community in Pune 
            through brotherhood, cultural preservation, and community service.
          </p>
          
          <Link 
            href="/about" 
            className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg"
          >
            Learn More About Us
            <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* JSG Federation Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg border border-blue-200 mb-12 sm:mb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-4 sm:mb-6">
                <div className="w-1 sm:w-2 h-8 sm:h-12 bg-gradient-to-b from-blue-500 to-yellow-500 rounded-full mr-3 sm:mr-4"></div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 leading-tight">
                  Proud Member of JSG International Federation
                </h3>
              </div>
              
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                JSG SPARSH Pune operates under the umbrella of Jain Social Groups International Federation (JSGIF), 
                connecting us with Jain communities worldwide. This partnership strengthens our mission and provides 
                a broader platform for cultural exchange and community service.
              </p>
              
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Through this global federation, we share best practices, collaborate on larger initiatives, 
                and maintain the rich traditions of our Jain heritage while fostering international unity.
              </p>
              
              <div className="flex justify-center lg:justify-start">
                <a 
                  href="https://jsgif.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                >
                  Learn More About JSGIF
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="flex-shrink-0 order-first lg:order-last">
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto">
                  <img 
                    src="/images/JSG_Federation.jpeg" 
                    alt="JSG International Federation Logo" 
                    className="w-full h-full object-contain relative z-10 rounded-lg sm:rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shri Sharadbhai Shah Tribute Section */}
        <SharadbhaiTribute />

      </div>
    </section>
  )
}