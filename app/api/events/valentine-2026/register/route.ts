import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = (body?.name || '').trim()
    const mobile = String(body?.mobile || '').trim()
    const confirmAttend = !!body?.confirmAttend
    const registrationFor = body?.registrationFor === 'Individual' ? 'Individual' : 'Couple'
    const kids5to9 = Number.isFinite(body?.kids5to9) ? Number(body.kids5to9) : 0
    const kids9plus = Number.isFinite(body?.kids9plus) ? Number(body.kids9plus) : 0
    const transactionId = (body?.transactionId || '').trim()
    const totalAmount = Number.isFinite(body?.totalAmount) ? Number(body.totalAmount) : 0
    const screenshotUrl = typeof body?.screenshotUrl === 'string' ? body.screenshotUrl : null

    if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })
    if (!/^\d{10}$/.test(mobile)) return NextResponse.json({ success: false, error: 'Mobile must be 10 digits' }, { status: 400 })
    if (!confirmAttend) return NextResponse.json({ success: false, error: 'Attendance confirmation required' }, { status: 400 })
    if (!transactionId) return NextResponse.json({ success: false, error: 'Transaction ID required' }, { status: 400 })
    if (totalAmount < 0) return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })

    const client = supabaseServer || supabase
    const { data, error } = await client
      .from('valentine_2026_registrations')
      .insert({
        name,
        mobile,
        registration_for: registrationFor,
        kids_5_9: kids5to9,
        kids_9_plus: kids9plus,
        transaction_id: transactionId,
        total_amount: totalAmount,
        confirm_attend: confirmAttend,
        screenshot_url: screenshotUrl,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
