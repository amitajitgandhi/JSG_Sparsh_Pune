import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TABLE = 'sparsh_box_cricket_mini_tournament_registrations'
const FEE_AMOUNT = 400

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Supabase env vars missing', { hasUrl: !!SUPABASE_URL, hasServiceRole: !!SERVICE_ROLE_KEY })
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const indianMobileRegex = /^[6-9]\d{9}$/
const cashPaidToOptions = ['Amit Gandhi', 'Mukesh Jain (M. A. Hardware)']

function validate(body: any) {
  const errors: string[] = []
  if (!body.name || !String(body.name).trim()) errors.push('Full name is required')
  if (!body.mobile_number || !indianMobileRegex.test(String(body.mobile_number))) errors.push('Valid Indian mobile number is required')
  const age = Number(body.age)
  if (!age || age < 16 || age > 70) errors.push('Age must be between 16 and 70 (members and kids 16+ only)')
  if (!['Member', 'Kid'].includes(body.category)) errors.push('Valid category is required')
  if (!['Batsman', 'Bowler', 'Allrounder'].includes(body.skillset)) errors.push('Valid skillset is required')
  if (!['Beginner', 'Intermediate', 'Advance', 'Pro'].includes(body.cricketing_skill)) errors.push('Valid cricketing skill is required')
  if (!body.photo_url) errors.push('Player photo is required')

  if (!['cash', 'online'].includes(body.payment_method)) {
    errors.push('Payment method is required')
  } else if (body.payment_method === 'cash') {
    if (!cashPaidToOptions.includes(body.cash_paid_to)) errors.push('Please select who the cash was paid to')
  } else if (body.payment_method === 'online') {
    if (!body.transaction_reference_number || String(body.transaction_reference_number).trim().length < 6) errors.push('Transaction reference number is required')
    if (!body.payment_screenshot_url) errors.push('Payment screenshot is required for online payment')
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

    const isCash = body.payment_method === 'cash'
    const trimmedName = String(body.name).trim()
    const trimmedMobile = String(body.mobile_number).trim()

    // Duplicate check: same name (case-insensitive) + same mobile number should only be allowed
    // once. `.ilike` with no wildcards is a case-insensitive exact match. A unique index on
    // (LOWER(TRIM(name)), mobile_number) backs this up at the DB level for race conditions - see
    // supabase/box_cricket_mini_tournament_fixes.sql.
    const { data: existingRows, error: dupError } = await supabase
      .from(TABLE)
      .select('id')
      .ilike('name', trimmedName)
      .eq('mobile_number', trimmedMobile)
      .limit(1)

    if (dupError) {
      console.error('Duplicate check error', dupError)
      return NextResponse.json({ error: dupError.message }, { status: 500 })
    }
    if (existingRows && existingRows.length > 0) {
      return NextResponse.json(
        { error: 'This name and mobile number is already registered for this tournament.' },
        { status: 409 }
      )
    }

    const insertPayload = {
      name: trimmedName,
      mobile_number: trimmedMobile,
      age: Number(body.age),
      category: body.category,
      skillset: body.skillset,
      cricketing_skill: body.cricketing_skill,
      cricheroes_link: body.cricheroes_link ? String(body.cricheroes_link).trim() : null,
      photo_url: body.photo_url,
      fee_amount: FEE_AMOUNT,
      payment_method: body.payment_method,
      cash_paid_to: isCash ? body.cash_paid_to : null,
      transaction_reference_number: isCash ? null : String(body.transaction_reference_number).trim(),
      payment_screenshot_url: isCash ? null : body.payment_screenshot_url
    }

    const { data, error } = await supabase.from(TABLE).insert(insertPayload).select()

    if (error) {
      const code = (error as any).code
      let message = error.message
      if (code === '23505') {
        message = 'This name and mobile number is already registered for this tournament.'
        return NextResponse.json({ error: message, code }, { status: 409 })
      }
      console.error('Supabase insert error', { message: error.message, details: error.details, hint: error.hint, code, payload: insertPayload })
      return NextResponse.json({ error: message, details: error.details, hint: error.hint, code }, { status: 500 })
    }

    return NextResponse.json({ success: true, row: data?.[0] })
  } catch (e: any) {
    console.error('API /events/sparsh-box-cricket-mini-tournament-2026/register exception', e)
    return NextResponse.json({ error: e.message || 'Server error', stack: e.stack }, { status: 500 })
  }
}
