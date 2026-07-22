import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TABLE = 'sparsh_hampi_heritage_adoni_tirth_2026_registrations'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Supabase env vars missing', { hasUrl: !!SUPABASE_URL, hasServiceRole: !!SERVICE_ROLE_KEY })
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const indianMobileRegex = /^[6-9]\d{9}$/
const travelModeOptions = ['Own Transportation', 'Bus', 'AC Train', 'Sleeper Train']

function validate(body: any) {
  const errors: string[] = []
  if (!body.primary_name || !String(body.primary_name).trim()) errors.push('Primary contact name is required')
  if (!body.mobile_number || !indianMobileRegex.test(String(body.mobile_number))) errors.push('Valid Indian mobile number is required')

  const adultCount = Number(body.adult_count) || 0
  const childAbove8Count = Number(body.child_above8_count) || 0
  const child5to8Count = Number(body.child_5_to_8_count) || 0
  const childBelow5Count = Number(body.child_below5_count) || 0

  ;[adultCount, childAbove8Count, child5to8Count, childBelow5Count].forEach((n) => {
    if (n < 0 || !Number.isInteger(n)) errors.push('Member counts must be whole numbers, 0 or more')
  })

  if (adultCount < 1) errors.push('At least one adult is required per family/group registration')
  if (adultCount + childAbove8Count + child5to8Count + childBelow5Count < 1) {
    errors.push('Add at least one family member')
  }

  if (!travelModeOptions.includes(body.travel_mode)) errors.push('Please select a valid travel mode')

  return errors
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validationErrors = validate(body)
    if (validationErrors.length) {
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 })
    }

    const trimmedName = String(body.primary_name).trim()
    const trimmedMobile = String(body.mobile_number).trim()

    // Duplicate check: same contact name (case-insensitive) + same mobile number should only be
    // allowed once. Backed by a unique index on (LOWER(TRIM(primary_name)), mobile_number) as a
    // race-condition backstop.
    const { data: existingRows, error: dupError } = await supabase
      .from(TABLE)
      .select('id')
      .ilike('primary_name', trimmedName)
      .eq('mobile_number', trimmedMobile)
      .limit(1)

    if (dupError) {
      console.error('Duplicate check error', dupError)
      return NextResponse.json({ error: dupError.message }, { status: 500 })
    }
    if (existingRows && existingRows.length > 0) {
      return NextResponse.json(
        { error: 'This name and mobile number is already registered for this trip.' },
        { status: 409 }
      )
    }

    const insertPayload = {
      primary_name: trimmedName,
      mobile_number: trimmedMobile,
      adult_count: Number(body.adult_count) || 0,
      child_above8_count: Number(body.child_above8_count) || 0,
      child_5_to_8_count: Number(body.child_5_to_8_count) || 0,
      child_below5_count: Number(body.child_below5_count) || 0,
      travel_mode: body.travel_mode,
      below5_needs_seat: Boolean(body.below5_needs_seat),
      notes: body.notes ? String(body.notes).trim() : null
    }

    const { data, error } = await supabase.from(TABLE).insert(insertPayload).select()

    if (error) {
      const code = (error as any).code
      let message = error.message
      if (code === '23505') {
        message = 'This name and mobile number is already registered for this trip.'
        return NextResponse.json({ error: message, code }, { status: 409 })
      }
      console.error('Supabase insert error', { message: error.message, details: error.details, hint: error.hint, code, payload: insertPayload })
      return NextResponse.json({ error: message, details: error.details, hint: error.hint, code }, { status: 500 })
    }

    return NextResponse.json({ success: true, row: data?.[0] })
  } catch (e: any) {
    console.error('API /events/hampi-heritage-adoni-tirth-2026/register exception', e)
    return NextResponse.json({ error: e.message || 'Server error', stack: e.stack }, { status: 500 })
  }
}
