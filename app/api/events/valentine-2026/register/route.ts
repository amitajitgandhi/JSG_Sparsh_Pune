import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body?.name || '').trim()
    const mobile = String(body?.mobile || '').trim()
    const confirmAttend = !!body?.confirmAttend

    if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })
    if (!/^\d{10}$/.test(mobile)) return NextResponse.json({ success: false, error: 'Mobile must be 10 digits' }, { status: 400 })
    if (!confirmAttend) return NextResponse.json({ success: false, error: 'Attendance confirmation required' }, { status: 400 })

    const client = supabaseServer || supabase
    const { data, error } = await client
      .from('valentine_registrations')
      .insert({ name, mobile, confirm_attend: confirmAttend })
      .select('id')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
