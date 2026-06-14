'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Home, Users, Calendar, Heart, Info, Trophy, Shield } from 'lucide-react'
import JoinUsModal from './JoinUsModal'
import AdminLoginModal from './AdminLoginModal'
import ModalPortal from './ModalPortal'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isJoinUsModalOpen, setIsJoinUsModalOpen] = useState(false)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Info },
    { href: '/committee', label: 'Committee', icon: Users },
    { href: '/events/khelotsav', label: 'Khelotsav', icon: Info },
    { href: '/events2027', label: 'Events', icon: Calendar },
    { href: '/social', label: 'Social', icon: Heart },
  ]

  const handleJoinUsClick = () => {
    setIsJoinUsModalOpen(true)
    setIsOpen(false) // Close mobile menu if open
  }

  const handleAdminClick = () => {
    setIsAdminModalOpen(true)
    setIsOpen(false) // Close mobile menu if open
  }

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50' 
          : 'bg-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-4">
                <div className="relative w-12 h-12">
                  <img
                    src="/images/JSG_SPARSH.jpeg"
                    alt="JSG SPARSH Pune Logo"
                    className="w-full h-full object-contain rounded-xl transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-blue-700 group-hover:text-blue-800 transition-colors">
                    JSG  Pune Sparsh
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center space-x-2 text-neutral-700 hover:text-blue-600 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-yellow-50"
                >
                  <item.icon size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
              
              {/* Admin Button - Fixed responsive design */}
              <button
                onClick={handleAdminClick}
                className="group flex items-center space-x-2 text-neutral-700 hover:text-red-600 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-red-50"
              >
                <Shield size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">Admin</span>
              </button>
              
              {/* CTA Button */}
              <div className="ml-4 pl-4 border-l border-neutral-300">
                <Link href="/membership/2026-27" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm">
                  Join Us
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-neutral-700 hover:text-blue-600 focus:outline-none p-2 rounded-xl hover:bg-yellow-50 transition-colors duration-200"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden">
              <div className="py-4 space-y-1 border-t border-neutral-200/50">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 text-neutral-700 hover:text-blue-600 hover:bg-yellow-50 px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {/* Mobile Admin Button - Fixed */}
                <button
                  onClick={handleAdminClick}
                  className="flex items-center space-x-3 text-neutral-700 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-left"
                >
                  <Shield size={20} />
                  <span>Admin</span>
                </button>
                
                {/* Mobile CTA */}
                <div className="pt-3 mt-3 border-t border-neutral-200/50">
                  <Link
                    href="/membership/2026-27"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 w-full"
                  >
                    Join JSG SPARSH
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Join Us Modal */}
      <ModalPortal>
        <JoinUsModal 
          isOpen={isJoinUsModalOpen} 
          onClose={() => setIsJoinUsModalOpen(false)} 
        />
      </ModalPortal>

      {/* Admin Login Modal */}
      <ModalPortal>
        <AdminLoginModal 
          isOpen={isAdminModalOpen} 
          onClose={() => setIsAdminModalOpen(false)} 
        />
      </ModalPortal>
    </>
  )
}