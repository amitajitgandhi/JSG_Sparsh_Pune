import { Phone, User, Crown, Users, Trophy, Smartphone, Heart, Zap, Award } from 'lucide-react'
import Image from 'next/image'

export default function Committee() {
  const mentor = {
    name: 'Yuvraj Shah',
    position: 'Group Mentor',
    description: 'Guiding JSG Pune Sparsh with wisdom and experience, providing strategic direction and mentorship to achieve community excellence.',
    phone: '+91 9850958258',
    icon: Award,
    category: 'mentor'
  }

  const coreGroup = [
    {
      name: 'Dhiraj Shah',
      position: 'Founder President',
      description: 'Visionary founder and leader driving JSG Pune Sparsh towards unity and community excellence.',
      phone: '+91 8975797500',
      icon: Crown,
      category: 'core'
    },
    {
      name: 'Arun Rathod',
      position: 'Vice President',
      description: 'Supporting the founder\'s vision, coordinating key initiatives and Leading community engagement',
      phone: '+91 9820369920',
      icon: User,
      category: 'core'
    },
    {
      name: 'Amit Gandhi',
      position: 'Secretary',
      description: 'Managing administrative affairs, member communications, and maintaining records of all programs.',
      phone: '+91 7276319578',
      icon: User,
      category: 'core'
      },
      {
          name: 'Vinod Jain',
          position: 'Joint-Secretary',
          description: 'Assisting the Secretary in managing administrative affairs and member communications.',
          phone: '+91 9028847311',
          icon: User,
          category: 'core'
      },
    {
        name: 'Jitendra Jain',
      position: 'Treasurer',
      description: 'Overseeing financial management and ensuring transparent fund allocation for community programs.',
        phone: '+91 9822519391',
      icon: User,
      category: 'core'
    }
  ]

  const pros = [
    {
      name: 'Mukesh Jain',
      position: 'PRO Sports',
      description: 'Organizing sports activities, adventure trips like Aqua Magic, and promoting physical wellness within the community.',
      phone: '+91 9420277778',
      icon: Trophy,
      category: 'pro'
    },
    {
      name: 'Darshan Shah',
      position: 'PRO Digital',
      description: 'Managing digital presence, social media, website maintenance, and online community engagement platforms.',
      phone: '+91 8793108002',
      icon: Smartphone,
      category: 'pro'
    },
    {
      name: 'Timmeer Sanghavi',
      position: 'PRO Social',
      description: 'Leading Dan Patra initiatives, social service programs, and coordinating charitable activities for community welfare.',
      phone: '+91 9422313106',
      icon: Heart,
      category: 'pro'
    }
  ]

  const groupLeaders = [
    {
      name: 'Satish Jain',
      position: 'Group Leader',
      description: 'Organizing fun-filled activities and maintaining high energy in all programs.',
      phone: '+91 9881874309',
      icon: Zap,
      category: 'leader',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Khush Oswal',
      position: 'Group Leader',
      description: 'Known for creating excitement and memorable experiences in community events.',
      phone: '+91 9028661666',
      icon: Zap,
      category: 'leader',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Our Committee 2026-2027
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto px-2 leading-relaxed">
            Meet the dedicated team of JSG Pune Sparsh who work tirelessly to serve our community.
            Our organizational structure includes the Core Group, specialized PROs (Public Relations Officers), 
            and dynamic Group Leaders managing our four vibrant member groups.
          </p>
        </div>

        {/* Mentor Section - GOLD THEME */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Mentor
          </h2>
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden card-hover max-w-sm w-full">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 text-white text-center">
                <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white/20 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/images/Committee/${mentor.name}.jpeg`}
                    alt={mentor.name}
                    width={144}
                    height={144}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 leading-tight">{mentor.name}</h3>
                <p className="text-amber-100 font-medium text-sm sm:text-base">{mentor.position}</p>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed min-h-[4rem]">
                  {mentor.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Phone size={12} className="mr-2 flex-shrink-0" />
                    <a href={`tel:${mentor.phone}`} className="hover:text-amber-600 text-xs">
                      {mentor.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Group - BLUE THEME */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Core Group
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {coreGroup.map((member, index) => {
              const IconComponent = member.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white text-center">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white/20 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/images/Committee/${member.name}.jpeg`}
                        alt={member.name}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 leading-tight">{member.name}</h3>
                    <p className="text-blue-100 font-medium text-sm sm:text-base">{member.position}</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed min-h-[4rem]">
                      {member.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Phone size={12} className="mr-2 flex-shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:text-blue-600 text-xs">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PROs (Public Relations Officers) - SOLID YELLOW THEME */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            PROs (Public Relations Officers)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {pros.map((member, index) => {
              const IconComponent = member.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
                  <div className="bg-yellow-500 p-4 sm:p-6 text-white text-center">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white/20 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/images/Committee/${member.name}.jpeg`}
                        alt={member.name}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 leading-tight">{member.name}</h3>
                    <p className="text-yellow-100 font-medium text-sm sm:text-base">{member.position}</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed min-h-[4rem]">
                      {member.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Phone size={12} className="mr-2 flex-shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:text-yellow-600 text-xs">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Group Leaders */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Group Leaders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {groupLeaders.map((member, index) => {
              const IconComponent = member.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover">
                  <div className={`bg-gradient-to-r ${member.color} p-4 sm:p-6 text-white text-center`}>
                    <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white/20 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/images/Committee/${member.name}.jpeg`}
                        alt={member.name}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 leading-tight">{member.name}</h3>
                    <p className="text-white/90 font-medium mb-1 text-sm sm:text-base">{member.position}</p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed min-h-[4rem]">
                      {member.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Phone size={12} className="mr-2 flex-shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:text-primary-600 text-xs">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Group Information Text */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              JSG Pune Sparsh is organized into four vibrant groups, each with its unique identity and energy.
              These groups foster closer bonds among members and create exciting opportunities for participation 
              in various activities and events.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}