import Hero from './components/Hero'
import AboutSection from './components/AboutSectionSimple'
import UpcomingEventsModal from './components/UpcomingEventsModal'

export default function Home() {
  return (
    <div className="scroll-smooth">
      <Hero />
      <AboutSection />
      <UpcomingEventsModal />
    </div>
  )
}