'use client'

import React, { useState } from 'react'
import { X, User, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Hardcoded credentials
  const ADMIN_USERNAME = 'admin'
  const ADMIN_PASSWORD = 'jsgpunesparsh'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

      if (username.toLowerCase() === ADMIN_USERNAME && password.toLowerCase() === ADMIN_PASSWORD) {
      // Success - redirect to admin page
      onClose()
      router.push('/admin')
      // Reset form
      setUsername('')
      setPassword('')
    } else {
      setError('Invalid username or password')
    }
    
    setIsLoading(false)
  }

  const handleClose = () => {
    setUsername('')
    setPassword('')
    setError('')
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-glow-lg max-w-md w-full mx-4 transform transition-all duration-500 animate-slide-up border border-white/50 dark:border-gray-700/50">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Admin Portal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Secure administrator access
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Enhanced Username Field */}
            <div className="animate-fade-in">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors duration-300" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 hover:border-red-300 dark:hover:border-red-500 text-sm sm:text-base"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Enhanced Password Field */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors duration-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-14 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 hover:border-red-300 dark:hover:border-red-500 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 animate-slide-up">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 sm:py-4 px-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base group"
            >
              <span className="group-hover:animate-pulse">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 hover:from-red-700 hover:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 disabled:from-red-300 disabled:to-red-400 dark:disabled:from-red-800 dark:disabled:to-red-900 text-white font-semibold py-3 sm:py-4 px-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center text-sm sm:text-base group"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-3 w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span className="group-hover:animate-pulse">Sign In</span>
              )}
            </button>
          </div>
        </form>

        {/* Enhanced Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-b-3xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Restricted access • Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}