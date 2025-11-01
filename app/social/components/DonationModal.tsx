'use client'

import React, { useState, useEffect } from 'react'
import { X, Upload, Heart, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import ModalPortal from '../../components/ModalPortal'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    amount: '',
    transaction_id: '',
    transaction_screenshot: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, JPEG, PNG)')
        return
      }

      setFormData(prev => ({ ...prev, transaction_screenshot: file }))
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError('')
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.mobile_number.trim() || !/^\d{10}$/.test(formData.mobile_number)) {
      setError('Please enter a valid 10-digit mobile number')
      return false
    }
    if (!formData.amount.trim()) {
      setError('Amount is required')
      return false
    }
    const amountValue = parseFloat(formData.amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount')
      return false
    }
    if (amountValue > 999999.99) {
      setError('Amount cannot exceed ₹9,99,999.99')
      return false
    }
    if (!formData.transaction_id.trim()) {
      setError('Transaction ID is required')
      return false
    }
    if (!formData.transaction_screenshot) {
      setError('Transaction screenshot is required')
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
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('mobile_number', formData.mobile_number)
      submitData.append('amount', formData.amount)
      submitData.append('transaction_id', formData.transaction_id)
      if (formData.transaction_screenshot) {
        submitData.append('transaction_screenshot', formData.transaction_screenshot)
      }

      const response = await fetch('/api/donation', {
        method: 'POST',
        body: submitData
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
          mobile_number: '',
          amount: '',
          transaction_id: '',
          transaction_screenshot: null
        })
        setPreviewUrl('')
        setSuccess(false)
        onClose()
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your donation details')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFormData({
      name: '',
      mobile_number: '',
      amount: '',
      transaction_id: '',
      transaction_screenshot: null
    })
    setPreviewUrl('')
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
              <div className="text-4xl mb-2">🙏</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Thank You for Your Contribution!
              </h2>
              <p className="text-green-600 text-sm mb-4">
                Your donation details have been received successfully. We appreciate your support to JSG Pune Sparsh initiatives.
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
              <Heart className="mr-3" size={28} />
              <h2 className="text-2xl font-bold">Make a Contribution</h2>
            </div>
            <p className="text-white/90 text-sm">
              Support JSG Pune Sparsh Dan Patra initiatives
            </p>
          </div>

          <div className="p-6">
            {/* QR Code Section */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Scan QR Code to Pay
              </h3>
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-primary-100 mx-auto max-w-xs">
                <Image
                  src="/images/SPARSH_QR_Code.jpeg"
                  alt="SPARSH Payment QR Code"
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg"
                  priority
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Scan the QR code with your banking app to make the payment
              </p>
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

              {/* Amount Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Donation Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    min="1"
                    max="999999.99"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the amount you are donating (minimum ₹1)
                </p>
              </div>

              {/* Transaction ID Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter transaction ID from payment"
                  required
                  disabled={loading}
                />
              </div>

              {/* Transaction Screenshot Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Screenshot *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="transaction-screenshot"
                    disabled={loading}
                  />
                  <label
                    htmlFor="transaction-screenshot"
                    className="cursor-pointer block"
                  >
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img
                          src={previewUrl}
                          alt="Transaction screenshot preview"
                          className="mx-auto max-h-32 rounded-lg"
                        />
                        <p className="text-sm text-green-600">Screenshot uploaded successfully</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto text-gray-400" size={32} />
                        <p className="text-sm text-gray-600">
                          Click to upload transaction screenshot
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, JPEG, PNG • Max 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
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
                  'Submit Donation Details'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Your contribution helps us serve the community better
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
    </ModalPortal>
  )
}

export default DonationModal