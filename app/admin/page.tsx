'use client'

import Link from 'next/link'

export default function AdminIndex() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-xl w-full space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>JSG Pune Sparsh - Admin Portal</h1>
          <p className='text-gray-600 text-sm'>Select a dashboard to manage registrations.</p>
        </div>
        <div className='grid gap-5'>
          <Link href='/admin/upcoming-button' className='group block rounded-2xl border border-blue-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-blue-700 group-hover:text-blue-800'>Upcoming Button Navigation</h2>
                <p className='text-sm text-gray-600 mt-1'>Choose where the home page Upcoming Event button should navigate.</p>
              </div>
              <span className='text-blue-500 text-2xl'>&rarr;</span>
            </div>
          </Link>

          <Link href='/admin/khelotsav-2026' className='group block rounded-2xl border border-emerald-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-emerald-700 group-hover:text-emerald-800'>Khelotsav 2026 Dashboard</h2>
                <p className='text-sm text-gray-600 mt-1'>View SPARSH KHELOTSAV 2026 registrations, selected sports, ratings, and payment status.</p>
              </div>
              <span className='text-emerald-500 text-2xl'>&rarr;</span>
            </div>
          </Link>

          <Link href='/admin/k26-stats' className='group block rounded-2xl border border-violet-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-violet-700 group-hover:text-violet-800'>K26 Stats</h2>
                <p className='text-sm text-gray-600 mt-1'>Sport-wise charts, age & jersey analytics, and per-sport player lists with export.</p>
              </div>
              <span className='text-violet-500 text-2xl'>&rarr;</span>
            </div>
          </Link>

          <Link href='/admin/tournament' className='group block rounded-2xl border border-orange-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-orange-700 group-hover:text-orange-800'>Tournament Management</h2>
                <p className='text-sm text-gray-600 mt-1'>Create tournaments, manage teams, configure events, enter results, and view live leaderboard.</p>
              </div>
              <span className='text-orange-500 text-2xl'>&rarr;</span>
            </div>
          </Link>

          <Link href='/admin/khelotsav-players' className='group block rounded-2xl border border-violet-200 bg-white p-6 shadow hover:shadow-md transition'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-violet-700 group-hover:text-violet-800'>Khelotsav Players</h2>
                <p className='text-sm text-gray-600 mt-1'>Upload team-wise player data via CSV for the public teams page.</p>
              </div>
              <span className='text-violet-500 text-2xl'>&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}