export default function SharadbhaiTribute() {
  return (
      <div className="bg-gradient-to-br rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200 mb-12 sm:mb-16">
      <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-8 lg:gap-12">
        {/* Left Column - Text Content */}
        <div className="flex-1 order-2 lg:order-1">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-1 sm:w-2 h-8 sm:h-12 bg-gradient-to-b from-orange-400 via-yellow-500 to-red-500 rounded-full mr-3 sm:mr-4"></div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 leading-tight">
              Shri Sharadbhai Shah – The Bheeshma Peetamaha
            </h3>
          </div>
          
          <div className="text-gray-700 space-y-4 sm:space-y-5 max-h-96 lg:max-h-none overflow-y-auto lg:overflow-visible pr-2 lg:pr-0">
            <p className="text-base sm:text-lg leading-relaxed">
              With great respect and admiration, we introduce JSGian <strong className="text-blue-800">Shri Sharadbhai Shah</strong>, a visionary leader, compassionate social worker, and one of the most revered figures in the history of JSG. 
              Fondly known as the <em className="text-orange-600">"Bheeshma Peetamaha of Maharashtra Region"</em>, Shri Sharadbhai dedicated his entire life to the service of society and to the growth of Jain Social Groups across India.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed">
              He was the Past President of JSG International Federation (2010–2012) and served as the Chairman of JSG Welfare Society (MBS). 
              Shri Sharadbhai was also the Founder President of JSG Pune Midtown, and under his guidance, the Maharashtra Region became one of the strongest pillars of JSG. 
              His leadership, vision, and personal outreach to every region during his tenure created a legacy of unity and progress that continues to inspire generations of JSGians.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed">
              His involvement extended beyond JSG to many organizations, including JITO, Jain Vadhu-Var Parichay Sanstha, and Jain Yuvak Mahasangh, EduCon where he made remarkable contributions.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed">
              A man of deep conviction and humility, he believed that <em className="text-orange-600">"no job is a small job"</em> and carried out every mission with dedication and accountability. 
              His life exemplifies the noble ideals described in the Bhagavad Gita — of selfless service, leadership through example, and unwavering faith in karma.
            </p>
            
            <p className="text-base sm:text-lg leading-relaxed font-medium text-blue-800">
              Shri Sharadbhai Shah remains a role model and guiding light for all those who seek to lead with purpose and serve with compassion.
            </p>
          </div>
        </div>
        
        {/* Right Column - Image */}
        <div className="flex-shrink-0 order-1 lg:order-2 w-full lg:w-auto flex justify-center">
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200">
            <div className="relative w-48 h-56 sm:w-56 sm:h-64 md:w-64 md:h-72 lg:w-72 lg:h-80 mx-auto">
              <img 
                src="/images/Sharad_Shah.png" 
                alt="Shri Sharadbhai Shah - The Bheeshma Peetamaha of Maharashtra Region" 
                className="w-full h-full object-cover object-center rounded-lg sm:rounded-xl shadow-md"
              />
            </div>
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-sm sm:text-base font-semibold text-blue-800">Shri Sharadbhai Shah</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}