import type { Metadata } from 'next'
import { EVENT_NAME } from '../khelotsav-2026/constants'
import SystemTheme from './SystemTheme'

export const metadata: Metadata = {
  title: `${EVENT_NAME} | JSG Portal`,
  description:
    'Indoor sports festival — browse teams, live leaderboard, event results, and registration for SPARSH KHELOTSAV 2026.',
}

// Khelotsav pages are light-theme only — strip any `dark` class before paint so
// the phone's OS dark mode never darkens these pages.
const themeInitScript = `(function(){try{document.documentElement.classList.remove('dark');}catch(e){}})();`

export default function KhelotsavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <SystemTheme />
      {children}
    </>
  )
}
