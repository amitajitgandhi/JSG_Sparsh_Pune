'use client'

import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Loader2, X } from 'lucide-react'

interface AdminAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthenticated: () => void
  title?: string
  message?: string
}

export default function AdminAuthModal({ 
  isOpen, 
  onClose, 
  onAuthenticated,
  title = "Admin Authentication Required",
  message = "Please enter admin credentials to proceed with editing squad details."
}: AdminAuthModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Admin credentials (in production, these should be environment variables)
  const ADMIN_USERNAME = 'admin'
  const ADMIN_PASSWORD = 'jsgpunesparsh'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Authentication successful
      resetForm()
      onAuthenticated()
    } else {
      setError('Invalid username or password')
    }

    setLoading(false)
  }

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setShowPassword(false)
    setError('')
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">Security verification</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter admin username"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Authenticate'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            <Shield className="inline w-3 h-3 mr-1" />
            Admin access required for editing squad information
          </p>
        </div>
      </div>
    </div>
  )
}