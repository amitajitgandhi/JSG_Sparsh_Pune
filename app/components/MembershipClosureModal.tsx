'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function MembershipClosureModal() {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show modal after component mounts
    setShowModal(true)
  }, [])

  const handleClose = () => {
    router.push('/')
  }

  const handleContactCommittee = () => {
    router.push('/committee')
  }

  if (!showModal) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        {/* Modal Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl max-w-sm w-full border border-gray-200 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Registration Closed
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Registration for 2026-2027 are now closed. Kindly contact committee.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleContactCommittee}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Committee
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
