import { NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const client = supabaseServer || supabase
    const { data, error } = await client
      .from('valentine_2026_admin_dashboard') // Updated table for admin dashboard
      .select('id, name, mobile, registration_for, kids_5_9, kids_9_plus, transaction_id, total_amount, confirm_attend, screenshot_url, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    if (!data || data.length === 0) return NextResponse.json({ success: false, error: 'No registrations found' }, { status: 404 }) // Error forwarding for empty results

    return NextResponse.json({ success: true, registrations: data || [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}