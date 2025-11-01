'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalPortalProps {
  children: React.ReactNode
}

// Lightweight portal wrapper for modals to ensure proper rendering in mobile WebViews
export default function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)
  const [container] = useState(() => {
    if (typeof document !== 'undefined') {
      const el = document.createElement('div')
      el.setAttribute('data-modal-portal', 'true')
      return el
    }
    return null
  })

  useEffect(() => {
    if (!container) return
    document.body.appendChild(container)
    setMounted(true)
    return () => {
      try { document.body.removeChild(container) } catch {}
    }
  }, [container])

  if (!mounted || !container) return null
  return createPortal(children, container)
}
