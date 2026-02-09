import { NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Prefer service role, fallback to anon (requires SELECT RLS policy)
    const client = supabaseServer || supabase
    const { data, error } = await client
        .from('valentine_2026_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      const hint = error.message?.includes('row-level security')
        ? 'RLS is blocking SELECT. Ensure SUPABASE_SERVICE_ROLE_KEY is set or add a SELECT policy on `public.valentine_2026_registrations` for anon/authenticated.'
        : undefined
      return NextResponse.json({ success: false, error: error.message, hint }, { status: 500 })
    }
    console.log('valentine_2026_registrations rows:', Array.isArray(data) ? data.length : 0)
    return NextResponse.json({ success: true, registrations: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}