'use client'

import { useEffect } from 'react'

/**
 * Reads the OS/browser color-scheme preference and keeps the
 * `dark` class on <html> in sync — required because Tailwind is
 * configured with darkMode: 'class'.
 */
export default function DarkModeSync() {
  useEffect(() => {
    const root = document.documentElement
    const mq   = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = (dark: boolean) => {
      if (dark) root.classList.add('dark')
      else      root.classList.remove('dark')
    }

    apply(mq.matches)

    const handler = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return null
}
