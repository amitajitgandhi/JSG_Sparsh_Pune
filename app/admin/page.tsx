'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AdminIndex() {
  const [showDevModal, setShowDevModal] = useState(false)

  const handleGoaDashboardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setShowDevModal(true)
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-xl w-full space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>JSG Pune Sparsh - Admin Portal</h1>
          <p className='text-gray-600 text-sm'>Select a dashboard to manage registrations and interests.</p>
        </div>
        <div className='grid gap-5'>
          <Link href='/admin/spl02-dashboard' className='group block rounded-2xl border border-blue-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-blue-700 group-hover:text-blue-800'>SPL 02 Registration Dashboard</h2>
                <p className='text-sm text-gray-600 mt-1'>View and export player registrations.</p>
              </div>
              <span className='text-blue-500 text-2xl'>&rarr;</span>
            </div>
          </Link>
          <Link href='/admin/goa-dashboard' onClick={handleGoaDashboardClick} className='group block rounded-2xl border border-teal-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-teal-700 group-hover:text-teal-800'>GOA Registration Dashboard</h2>
                <p className='text-sm text-gray-600 mt-1'>View goa getaway interest submissions.</p>
              </div>
              <span className='text-teal-500 text-2xl'>&rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Development in Progress Modal */}
      {showDevModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={() => setShowDevModal(false)}>
          <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className='text-center space-y-4'>
              <div className='mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center'>
                <svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
                </svg>
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>Development in Progress</h3>
                <p className='text-gray-600'>The GOA Registration Dashboard is currently under development. Please check back later.</p>
              </div>
              <button 
                onClick={() => setShowDevModal(false)}
                className='w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium'
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}