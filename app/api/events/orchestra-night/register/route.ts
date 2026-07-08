import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body?.name || '').trim()
    const mobile = String(body?.mobile || '').trim()
    const membershipType = body?.membershipType === 'OTHER' ? 'OTHER' : body?.membershipType === 'JSG PUNE SPARSH' ? 'JSG PUNE SPARSH' : null
    const passes = Number.isFinite(body?.passes) ? Number(body.passes) : 0

    if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })
    if (!/^\d{10}$/.test(mobile)) return NextResponse.json({ success: false, error: 'Mobile must be 10 digits' }, { status: 400 })
    if (!membershipType) return NextResponse.json({ success: false, error: 'Membership type required' }, { status: 400 })
    if (!Number.isInteger(passes) || passes < 1 || passes > 7) {
      return NextResponse.json({ success: false, error: 'Number of passes must be between 1 and 7' }, { status: 400 })
    }

    const client = supabaseServer || supabase
    const { data, error } = await client
      .from('orchestra_night_registrations')
      .insert({
        name,
        mobile,
        membership_type: membershipType,
        passes,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
