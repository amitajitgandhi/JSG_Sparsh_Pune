'use client'

import { useEffect } from 'react'

/**
 * As of 2026-07-14 this app is light-mode only (see CLAUDE.md), regardless of the
 * device/OS color-scheme setting. This component previously toggled the `dark` class on
 * <html> to follow `prefers-color-scheme: dark`, which activated every page's Tailwind
 * `dark:` variants automatically — including invisible input text caused by a matching
 * `@media (prefers-color-scheme: dark)` block in globals.css (now removed).
 *
 * Rather than stripping `dark:` classes from every existing page (deferred cleanup, see
 * CLAUDE.md), we simply never add the `dark` class here. Existing `dark:` styles stay in
 * the markup but never activate, so every page renders in light mode unconditionally.
 */
export default function DarkModeSync() {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  return null
}
