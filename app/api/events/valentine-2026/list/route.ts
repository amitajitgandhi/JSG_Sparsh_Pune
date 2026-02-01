import { NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const client = supabaseServer || supabase
    const { data, error } = await client
      .from('valentine_registrations')
      .select('id, name, mobile, confirm_attend, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, registrations: data || [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}