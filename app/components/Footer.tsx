'use client'

import Link from 'next/link'
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const [currentYear, setCurrentYear] = useState(2024)
  const [showModal, setShowModal] = useState(false)
  const [modalUrl, setModalUrl] = useState('')
  const [modalTitle, setModalTitle] = useState('')

  useEffect(() => {
    setMounted(true)
    setCurrentYear(new Date().getFullYear())
  }, [])

  // Function to handle social media links - Always show modal
  const handleSocialLink = (url: string, title: string) => {
    setModalUrl(url)
    setModalTitle(title)
    setShowModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modalUrl)
      setShowModal(false)
    } catch (error) {
      console.warn('Could not copy to clipboard:', error)
    }
  }

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/committee', label: 'Committee' },
    { href: '/events', label: 'Events' },
    { href: '/social', label: 'Social Initiatives' },
  ]

  const socialLinks = [
    { 
      href: 'https://www.facebook.com/profile.php?id=61557913960543', 
      icon: Facebook, 
      label: 'Facebook',
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    { 
      href: 'https://www.instagram.com/jsgpunesparsh/', 
      icon: Instagram, 
      label: 'Instagram',
      bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600',
      textColor: 'text-white'
    },
    { 
      href: 'https://www.youtube.com/@JSGPUNESPARSH', 
      icon: Youtube, 
      label: 'YouTube',
      bgColor: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-white'
    },
  ]

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return (
      <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-blue-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-blue-700 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <>
      <footer className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Brand Section */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-16 h-16">
                  <img
                    src="/images/JSG_SPARSH.jpeg"
                    alt="JSG SPARSH Pune Logo"
                    className="w-full h-full object-contain rounded-2xl shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-2xl bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                    JSG Pune Sparsh
                  </span>
                </div>
              </div>
              
              <p className="text-blue-100 mb-8 max-w-lg leading-relaxed">
                Connecting the Jain community in Pune through social activities, cultural events, 
                Dan Patra initiatives, and community service. Building bonds, preserving traditions, 
                and serving society with unity in diversity.
              </p>

              {/* Social Links - Now with Modal Popup */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleSocialLink(social.href, social.label)}
                      className={`group p-3 ${social.bgColor} rounded-xl transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl cursor-pointer`}
                      aria-label={social.label}
                      type="button"
                    >
                      <IconComponent size={20} className={`${social.textColor} transition-colors`} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Links - Section Centered, Links Left-Aligned */}
            <div className="text-left lg:text-center lg:flex lg:flex-col lg:items-center">
              <h3 className="font-bold text-xl mb-6 text-yellow-300">Quick Links</h3>
              <div className="lg:inline-block">
                <ul className="space-y-4 text-left">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href} 
                        className="text-blue-100 hover:text-yellow-300 transition-colors duration-200 flex items-center space-x-2 group text-base"
                      >
                        <span className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-xl mb-6 text-yellow-300">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="text-yellow-400 mt-1" size={18} />
                  <div>
                    <p className="text-blue-100 font-medium text-sm">Email</p>
                    <a 
                      href="mailto:jsgsparsh@gmail.com"
                      className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
                    >
                      jsgsparsh@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="text-yellow-400 mt-1" size={18} />
                  <div>
                    <p className="text-blue-100 font-medium text-sm">Phone</p>
                    <a 
                      href="tel:+918975797500"
                      className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
                    >
                      +91 89757 97500
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="text-yellow-400 mt-1" size={18} />
                  <div>
                    <p className="text-blue-100 font-medium text-sm">Location</p>
                    <p className="text-blue-200 text-sm">Pune, Maharashtra, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-blue-700 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <p className="text-blue-200 text-sm">
                  Copyright {currentYear} JAIN SOCIAL GROUP PUNE SPARSH. All rights reserved.
                </p>
                <p className="text-blue-500 text-sm">
                  App developer: AMIT GANDHI
                </p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-blue-200">
                <Link href="/privacy-policy" className="hover:text-yellow-300 transition-colors">Privacy Policy</Link>
                <span className="text-blue-400">•</span>
                <Link href="/terms-and-conditions" className="hover:text-yellow-300 transition-colors">Terms of Service</Link>
                <span className="text-blue-400">•</span>
                <Link href="#" className="hover:text-yellow-300 transition-colors">Sitemap</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Social Media Modal - Same style as Events page */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full relative overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
              <div className="absolute inset-0 opacity-10">
                <div className="w-32 h-32 bg-yellow-300 rounded-full -top-16 -right-16"></div>
              </div>
              <div className="relative z-10 flex justify-between items-center">
                <h3 className="text-xl font-bold">{modalTitle}</h3>
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
                <p className="text-sm text-gray-600 mb-2 font-medium">{modalTitle} URL:</p>
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
    </>
  )
}