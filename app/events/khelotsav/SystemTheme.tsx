'use client'

import { useEffect } from 'react'

/** Khelotsav pages are light-theme only — keep the `dark` class off regardless of OS scheme. */
export default function SystemTheme() {
  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('dark')

    // If anything (e.g. a global DarkModeSync) re-adds `dark`, strip it again.
    const observer = new MutationObserver(() => {
      if (html.classList.contains('dark')) html.classList.remove('dark')
    })
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return null
}
