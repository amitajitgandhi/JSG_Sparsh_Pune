'use client'

import { useEffect } from 'react'

/** Syncs Tailwind `dark:` variants with the OS color scheme (no app-wide toggle exists). */
export default function SystemTheme() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      document.documentElement.classList.toggle('dark', mq.matches)
    }

    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return null
}
