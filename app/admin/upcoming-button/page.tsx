'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UpcomingButtonRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/admin-config') }, [router])
  return null
}
