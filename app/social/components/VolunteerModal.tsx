'use client'

import React, { useState, useEffect } from 'react'
import { X, Users, CheckCircle } from 'lucide-react'
import ModalPortal from '../../components/ModalPortal'

interface VolunteerModalProps {
  isOpen: boolean
  onClose: () => void
}

const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.mobile_number.trim() || !/^\d{10}$/.test(formData.mobile_number)) {
      setError('Please enter a valid 10-digit mobile number')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      setSuccess(true)
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          address: '',
          mobile_number: ''
        })
        setSuccess(false)
        onClose()
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your volunteer application')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      mobile_number: ''
    })
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  if (success) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative overflow-hidden my-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 opacity-50"></div>
            <div className="relative z-10 text-center">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="text-white" size={32} />
              </div>
              <div className="text-4xl mb-2">🤝</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Thank You for Volunteering!
              </h2>
              <p className="text-green-600 text-sm mb-4">
                Your volunteer application has been received successfully. Our team will contact you soon with further details about upcoming opportunities.
              </p>
              <p className="text-gray-600 text-sm">
                This window will close automatically...
              </p>
            </div>
          </div>
        </div>
      </ModalPortal>
    )
  }

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <div 
          className="bg-white rounded-3xl max-w-md w-full mx-4 relative overflow-hidden my-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              disabled={loading}
            >
              <X size={24} />
            </button>
            <div className="flex items-center mb-2">
              <Users className="mr-3" size={28} />
              <h2 className="text-2xl font-bold">Volunteer with Us</h2>
            </div>
            <p className="text-white/90 text-sm">
              Join our mission of compassion and service
            </p>
          </div>

          <div className="p-6">
            {/* Volunteer Information */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                🌟 Why Volunteer with JSG Pune Sparsh?
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2">🤝</span>
                  <span>Make a direct impact on community welfare</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">📚</span>
                  <span>Support education and social initiatives</span>
                </div>
                <div className="flex items-start">
                  <span className="text-purple-500 mr-2">❤️</span>
                  <span>Connect with like-minded people</span>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2">🎯</span>
                  <span>Contribute to meaningful causes</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your complete address"
                  required
                  disabled={loading}
                />
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Volunteer Application'
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 bg-yellow-50 rounded-xl p-4">
              <div className="text-center">
                <h4 className="font-semibold text-yellow-800 mb-2">📞 Next Steps</h4>
                <p className="text-yellow-700 text-sm mb-2">
                  Committee will contact you within 2-3 business days to discuss available opportunities.
                </p>
                <p className="text-yellow-600 text-xs mb-2">
                  Thank you for your interest in serving the community!
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  By submitting, you agree to our{' '}
                  <a href="/privacy-policy" className="text-primary-600 hover:text-primary-700 underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

export default VolunteerModal