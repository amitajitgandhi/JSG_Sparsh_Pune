import { NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const client = supabaseServer ?? supabase
    const { data, error } = await client
      .from('orchestra_night_registrations')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      const hint = error.message?.includes('row-level security')
        ? 'Server missing SUPABASE_SERVICE_ROLE_KEY or table RLS policy denies selects.'
        : undefined
      return NextResponse.json({ success: false, error: error.message, hint }, { status: 500 })
    }

    return NextResponse.json({ success: true, registrations: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
