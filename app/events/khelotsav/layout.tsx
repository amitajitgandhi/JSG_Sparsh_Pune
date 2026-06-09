import type { Metadata } from 'next'
import { EVENT_NAME } from '../khelotsav-2026/constants'
import SystemTheme from './SystemTheme'

export const metadata: Metadata = {
  title: `${EVENT_NAME} | JSG Portal`,
  description:
    'Indoor sports festival — browse teams, live leaderboard, event results, and registration for SPARSH KHELOTSAV 2026.',
}

const themeInitScript = `(function(){try{var d=document.documentElement,m=window.matchMedia('(prefers-color-scheme: dark)');d.classList.toggle('dark',m.matches);}catch(e){}})();`

export default function KhelotsavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <SystemTheme />
      {children}
    </>
  )
}
