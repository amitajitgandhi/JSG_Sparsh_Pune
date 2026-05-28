'use client'

import { useEffect } from 'react'
import { CheckCircle2, Sparkles, Users, X } from 'lucide-react'
import ModalPortal from '@/app/components/ModalPortal'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onGoHome: () => void
  onGoCommittee: () => void
}

export default function SuccessModal({ isOpen, onClose, onGoHome, onGoCommittee }: SuccessModalProps) {
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
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-300/40 blur-2xl" />
            <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-sky-300/40 blur-2xl" />
          </div>

          <div className="relative text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Successful 🎉</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Your registration for SPARSH KHELOTSAV 2026 has been submitted successfully.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Further details and event instructions will be shared soon.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              For any queries, you can contact the committee using the button below.
            </p>

            <div className="mt-5 flex justify-center gap-2 text-amber-500">
              <Sparkles size={18} className="animate-pulse" />
              <Sparkles size={18} className="animate-pulse" />
              <Sparkles size={18} className="animate-pulse" />
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={onGoHome}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-teal-700"
              >
                OK
              </button>
              <button
                onClick={onGoCommittee}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200 dark:hover:bg-sky-500/20"
              >
                <Users size={16} /> Committee
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
