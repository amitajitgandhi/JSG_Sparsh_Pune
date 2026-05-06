import dynamic from 'next/dynamic'

// Lazy-load the heavy client form
const MembershipForm = dynamic(() => import('../../components/MembershipForm'), { ssr: false })

// Lazy-load closure modal
const MembershipClosureModal = dynamic(() => import('../../components/MembershipClosureModal'), { ssr: false })

export const metadata = {
  title: 'JSG SPARSH 2026–2027 Membership Registration',
  description: 'Register for JSG Pune Sparsh Membership 2026–2027',
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-yellow-50/40">
      <MembershipClosureModal />
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600">
            2026–2027 
          </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">Membership Registration</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <MembershipForm />
        </div>
      </div>
    </div>
  )
}
