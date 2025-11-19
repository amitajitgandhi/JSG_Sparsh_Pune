'use client'

import Link from 'next/link'

export default function AdminIndex() {
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
          <Link href='/admin/goa-dashboard' className='group block rounded-2xl border border-teal-200 bg-white p-6 shadow hover:shadow-md transition'>
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
    </div>
  )
}