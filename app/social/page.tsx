'use client'

import { useState } from 'react'
import { Heart, BookOpen, Leaf, Users, Droplets, ArrowRight, Target, Calendar, MapPin } from 'lucide-react'
import DonationModal from './components/DonationModal'
import VolunteerModal from './components/VolunteerModal'

export default function Social() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false)

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const danPatraInitiatives = [
    {
      id: 1,
      title: 'SPARSH Education Daan',
      subtitle: 'JSG EDUCON',
      icon: BookOpen,
      description: 'Supporting education for underprivileged children in our community and beyond. Providing scholarships, books, and educational resources to help students achieve their dreams.',
      category: 'Education',
      impact: '50+ students supported',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800'
    },
    {
      id: 2,
      title: 'SPARSH Go-Mata Daan',
      subtitle: 'JSG GO GRASS',
      icon: Leaf,
      description: 'Cow protection and care initiatives. Supporting gaushalas, providing fodder, and promoting sustainable cow welfare programs for the protection of these sacred animals.',
      category: 'Animal Welfare',
      impact: '200+ cows benefited',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800'
    },
    {
      id: 3,
      title: 'SPARSH Sadharmik Seva Daan',
      subtitle: 'Helping Jain Needy Families',
      icon: Users,
      description: 'Direct financial and material support to Jain families in need. Emergency assistance, medical support, and livelihood programs to strengthen our community bonds.',
      category: 'Community Support',
      impact: '30+ families assisted',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    },
    {
      id: 4,
      title: 'SPARSH Vaiyavacha',
      subtitle: 'Community Service',
      icon: Heart,
      description: 'Various community service activities including temple maintenance, cultural preservation, and religious program support to maintain our spiritual heritage.',
      category: 'Religious Service',
      impact: 'Multiple temples supported',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800'
    },
    {
      id: 5,
      title: 'SPARSH Social Activity Daan',
      subtitle: 'Community Programs',
      icon: Target,
      description: 'Funding and supporting various social activities, community events, and programs that benefit society at large and promote social welfare in the community.',
      category: 'Social Service',
      impact: '15+ programs funded',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-800'
    },
    {
      id: 6,
      title: 'SPARSH Rakta Daan',
      subtitle: 'Blood Donation Drive',
      icon: Droplets,
      description: 'Regular blood donation camps in collaboration with hospitals. Organizing 4-day drives and emergency blood support to save lives in critical situations.',
      category: 'Health Service',
      impact: '100+ units donated',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800'
    }
  ]

  const socialPrograms = [
    {
      id: 1,
      title: 'Mahavir Jayanti Food Donation Drive',
      subtitle: 'ANUKUMPADAAN',
      date: '2025-04-10',
      location: 'Across Pune City',
      description: 'Collaborative effort with Sayahata Group to distribute 1,000 food packets to underprivileged communities on Mahavir Jayanti.',
      participants: '50+ volunteers including children',
      impact: '1,000 food packets distributed',
      category: 'Food Donation'
    },
    {
      id: 2,
      title: 'Blood Donation Camp',
      subtitle: 'Gift That Saves Lives',
      date: '2025-04-10 to 2025-04-13',
      location: 'Bharati Hospital & Adhar Blood Bank',
      description: '4-day blood donation drive on Mahavir Jayanti, collaborating with leading blood banks in Pune.',
      participants: '75+ donors',
      impact: 'Life-saving blood units collected',
      category: 'Health Service'
    },
    {
      id: 3,
      title: 'Mango Donation Drive',
      subtitle: 'Ek Aam Khaas Logo Ke Naam',
      date: '2025-04-15',
      location: "St. John's Home & Society of Saint Mary",
      description: 'Sweet gesture of donating mangoes to elderly homes and orphanages, bringing smiles to special members of society.',
      participants: '30+ members',
      impact: '5+ dozen mangoes distributed',
      category: 'Elder Care'
    },
    {
      id: 4,
      title: 'Recycle & Reuse Drive',
      subtitle: 'Sustainability Initiative',
      date: '2025-08-15 to 2025-08-16',
      location: 'Mahasrshi Nagar Jain Temple',
      description: 'Two-day Recycle & Reuse Drive centers set up on August 15 & 16 collecting one full truckload of reusable materials. Items forwarded to Jain Social Group Pune Parivar—showcasing strong community commitment to sustainability & resource management.',
      participants: 'Community contributors',
      impact: '1+ full truckload collected',
      category: 'Sustainability'
    },
    {
      id: 5,
      title: 'Breakfast for Special Students',
      subtitle: 'Adhar Mukh Badhir Vidhyalaya',
      date: '2025-08-16',
      location: 'Adhar Mukh Badhir Vidhyalaya, Bibwewadi',
      description: 'Federation Week initiative serving breakfast to ~70 speech & hearing impaired students; a touching experience fostering empathy & inclusion.',
      participants: '70 special students',
      impact: 'Nutritious breakfast served',
      category: 'Special Needs Support'
    },
    {
      id: 6,
      title: 'Free Health Checkup & Blood Donation Camp',
      subtitle: '60th JSGIF Federation Week',
      date: '2025-08-17',
      location: 'BMW, Pune',
      description: 'Comprehensive screenings: Eye (Dr. Dhiraj Surana), Dental (Dr. Ashika Rathod), Women’s Health (Dr. Sumati Sancheti), Nutrition & BMI (Dr. Nitin Dhumane), Diabetes & Thyroid (Dr. Piyush Lodha), Orthopedic (Dr. Siddharth Shah), Homoeopathy (Dr. Gaurav Gandhi), Physiotherapy (Dr. Sejal Pattani & Dr. Divya Mehta), Blood Cancer (Mrs. Sonali Dhas), Blood Donation (Adhar Blood Bank), Body Massager (Mr. Ajay Hedgire).',
      participants: 'Doctors + donors + beneficiaries',
      impact: 'Multi-specialty screening & blood units collected',
      category: 'Health Service'
    }
  ]

  const categories = ['all', 'Education', 'Animal Welfare', 'Community Support', 'Religious Service', 'Social Service', 'Health Service']
  const filteredInitiatives = danPatraInitiatives.filter(i => selectedCategory === 'all' || i.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Social Initiatives</h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-6">JSG PUNE SPARSH DAAN PATRA platform encourages members to contribute to various charitable initiatives, giving them multiple choices for CHARITY (DAAN). Our social programs reflect the core values of Ahimsa, Seva, and Karuna - non-violence, service, and compassion.</p>
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-primary-800 font-semibold text-lg">Every small contribution creates a big impact when done with pure intention</p>
          </div>
        </div>

        {/* Social Programs moved to top & renamed */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Social Programs 2025 - 2026</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {socialPrograms.map(program => (
              <div key={program.id} className="bg-white rounded-xl shadow-lg p-6 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{program.title}</h3>
                    <p className="text-primary-600 font-medium">{program.subtitle}</p>
                  </div>
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">{program.category}</span>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{program.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm"><Calendar size={16} className="mr-2" /><span>{program.date}</span></div>
                  <div className="flex items-center text-gray-500 text-sm"><MapPin size={16} className="mr-2" /><span>{program.location}</span></div>
                  <div className="flex items-center text-gray-500 text-sm"><Users size={16} className="mr-2" /><span>{program.participants}</span></div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg"><p className="text-green-800 font-semibold text-sm">✅ {program.impact}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Daan Patra Initiatives moved below social programs */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Daan Patra Initiatives</h2>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              {categories.map(category => (
                <option key={category} value={category}>{category === 'all' ? 'All Categories' : category}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInitiatives.map(initiative => {
              const IconComponent = initiative.icon
              return (
                <div key={initiative.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
                  <div className={`bg-gradient-to-r ${initiative.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent size={32} />
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{initiative.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{initiative.title}</h3>
                    <p className="text-white/90 text-sm font-medium">{initiative.subtitle}</p>
                  </div>
                  <div className="p-6">
                    <div className="h-16 mb-4"><p className="text-gray-600 leading-relaxed text-sm">{truncateDescription(initiative.description, 120)}</p></div>
                    <div className={`${initiative.bgColor} p-3 rounded-lg mb-4`}><p className={`${initiative.textColor} font-semibold text-sm`}>Impact: {initiative.impact}</p></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Join Our Mission of Compassion</h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">Be part of JSG SPARSH's social initiatives and make a meaningful difference in society. Every contribution, no matter how small, helps us serve those in need and uphold the values of our Jain heritage.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setIsDonationModalOpen(true)} className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">Make a Contribution</button>
            <button onClick={() => setIsVolunteerModalOpen(true)} className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">Volunteer with Us</button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 text-center shadow-md"><div className="text-2xl font-bold text-primary-600">6</div><div className="text-sm text-gray-600">Daan Patra Categories</div></div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md"><div className="text-2xl font-bold text-green-600">1000+</div><div className="text-sm text-gray-600">People Helped</div></div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md"><div className="text-2xl font-bold text-blue-600">275+</div><div className="text-sm text-gray-600">Active Contributors</div></div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md"><div className="text-2xl font-bold text-purple-600">15+</div><div className="text-sm text-gray-600">Programs Completed</div></div>
        </div>
      </div>

      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
      <VolunteerModal isOpen={isVolunteerModalOpen} onClose={() => setIsVolunteerModalOpen(false)} />
    </div>
  )
}