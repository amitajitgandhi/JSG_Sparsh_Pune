'use client'

import { useEffect } from 'react'
import { CheckCircle2, Sparkles, X } from 'lucide-react'
import ModalPortal from '@/app/components/ModalPortal'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <div
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-green-300/40 blur-2xl" />
            <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-blue-300/40 blur-2xl" />
          </div>

          <div className="relative text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Registration Successful 🎉</h3>
            <p className="mt-3 text-sm text-gray-600">
              Thank you for registering for the SPARSH Box Cricket Mini Tournament – Season 03.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Squads will be announced after the player auction — further details will be shared in our WhatsApp group.
            </p>

            <div className="mt-5 flex justify-center gap-2 text-amber-500">
              <Sparkles size={18} />
              <Sparkles size={18} />
              <Sparkles size={18} />
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-green-700 hover:to-emerald-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
