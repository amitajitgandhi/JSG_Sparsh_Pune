import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const MEMBER_PRICING: Record<string, number> = {
  individual: 2500,
  couple: 5000,
}

function validate(body: any) {
  const errors: string[] = []
  const mobilePattern = /^\d{10}$/

  if (!body.fullName || !String(body.fullName).trim()) errors.push('Full name is required')
  if (!body.mobile || !mobilePattern.test(String(body.mobile))) errors.push('Valid 10-digit mobile number is required')
  if (!body.paxMode || !['individual', 'couple'].includes(body.paxMode)) errors.push('Select individual member or couple')
  if (typeof body.comingByOwnCar !== 'boolean') errors.push('Please select coming by own car: Yes/No')
  if (!body.riskTermsAccepted) errors.push('You must accept adventure risk terms')

  const kids5to8 = Number(body.kids5to8Count || 0)
  const kids8plus = Number(body.kids8plusCount || 0)
  const guestCount = Number(body.guestCount || 0)

  if (Number.isNaN(kids5to8) || kids5to8 < 0) errors.push('Kids 5-8 count must be 0 or more')
  if (Number.isNaN(kids8plus) || kids8plus < 0) errors.push('Kids 8+ count must be 0 or more')
  if (Number.isNaN(guestCount) || guestCount < 0) errors.push('Guest count must be 0 or more')

  if (body.raftingAddon) {
    const raftingCount = Number(body.raftingCount || 0)
    if (Number.isNaN(raftingCount) || raftingCount < 0) errors.push('Rafting count must be 0 or more')
    if (!body.raftingEligibilityConfirmed) errors.push('Rafting eligibility confirmation is required')
  }

  return errors
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validationErrors = validate(body)
    if (validationErrors.length) {
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 })
    }

    const paxMode = String(body.paxMode)
    const baseAmount = MEMBER_PRICING[paxMode] ?? 0
    const kids5to8 = Number(body.kids5to8Count || 0)
    const kids8plus = Number(body.kids8plusCount || 0)
    const guestCount = Number(body.guestCount || 0)
    const raftingCount = body.raftingAddon ? Number(body.raftingCount || 0) : 0

    const totalAdults = paxMode === 'couple' ? 2 : 1
    const kidsAmount = (kids5to8 * 1500) + (kids8plus * 4000)
    const guestAmount = guestCount * 5000
    const raftingAmount = raftingCount * 1200
    const amountTotal = baseAmount + kidsAmount + guestAmount + raftingAmount

    const payload = {
      full_name: String(body.fullName).trim(),
      employee_id: null,
      mobile: String(body.mobile).trim(),
      email: null,
      member_type: paxMode === 'couple' ? 'Couple' : 'Individual Member',
      adults: totalAdults,
      kids: kids5to8 + kids8plus,
      emergency_contact_name: null,
      emergency_contact_number: null,
      rafting_addon: Boolean(body.raftingAddon),
      rafting_eligible_count: null,
      rafting_eligibility_confirmed: Boolean(body.raftingEligibilityConfirmed),
      risk_terms_accepted: Boolean(body.riskTermsAccepted),
      amount_total: amountTotal,
      pax_mode: paxMode,
      kids_5_8_count: kids5to8,
      kids_8_plus_count: kids8plus,
      guest_count: guestCount,
      coming_by_own_car: Boolean(body.comingByOwnCar),
      rafting_count: body.raftingAddon ? raftingCount : null,
      payment_note: 'Fees to be paid in cash on or before Monday 15 June at Dr. Ashika Rathod, Jain Denticure, Kondhwa, Pune OR Mukesh Oswal, M.A. Hardware, Ravivar Peth, Pune.',
    }

    const { data, error } = await supabase
      .from('adventure_escape_interest')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
    }

    return NextResponse.json({ success: true, row: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
