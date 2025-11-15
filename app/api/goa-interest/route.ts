import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Supabase env vars missing', { hasUrl: !!SUPABASE_URL, hasServiceRole: !!SERVICE_ROLE_KEY })
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function validate(body: any) {
  const mobilePattern = /^\d{10}$/
  const errors: string[] = []
  if (!body.name || !String(body.name).trim()) errors.push('Name required')
  if (!body.mobile || !mobilePattern.test(String(body.mobile))) errors.push('Valid 10-digit mobile required')
  if (body.kids === 'Yes') {
    if (!body.kidsCount) errors.push('Kids count required when kids = Yes')
    if (!body.kidsAges || !String(body.kidsAges).trim()) errors.push('Kids ages required when kids = Yes')
  }
  return errors
}

export async function GET(req: NextRequest) {
  try {
    const debug = req.nextUrl.searchParams.get('debug')
    if (debug) {
      // Raw fetch test (bypasses supabase-js) to diagnose network/DNS issues
      const pingUrl = `${SUPABASE_URL}/rest/v1/goa_interest?select=id&limit=1`
      let rawStatus: number | null = null
      let rawText: string | null = null
      try {
        const rawRes = await fetch(pingUrl, {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`
          }
        })
        rawStatus = rawRes.status
        rawText = await rawRes.text()
      } catch (e: any) {
        rawText = `RAW_FETCH_ERROR: ${e.message}`
      }
      return NextResponse.json({
        env: { SUPABASE_URL, hasServiceRole: !!SERVICE_ROLE_KEY },
        rawFetch: { url: pingUrl, status: rawStatus, body: rawText?.slice(0, 500) }
      })
    }
    const { data, error } = await supabase.from('goa_interest').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, details: error.details, hint: error.hint })
    }
    return NextResponse.json({ ok: true, latest: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, stack: e.stack })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, mobile, kids = 'No', kidsCount, kidsAges, transport = 'Self', extraCoupleCount, notes } = body || {}

    const validationErrors = validate(body)
    if (validationErrors.length) {
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 })
    }

    const insertPayload = {
      name: String(name).trim(),
      mobile: String(mobile).trim(),
      transport: transport,
      kids: kids,
      kids_count: kids === 'Yes' ? (kidsCount ? Number(kidsCount) : null) : null,
      kids_ages: kids === 'Yes' ? (kidsAges || null) : null,
      extra_couple_count: extraCoupleCount ? Number(extraCoupleCount) : null,
      notes: notes || null
    }

    const { data, error } = await supabase.from('goa_interest').insert(insertPayload).select()

    if (error) {
      const code = (error as any).code
      let message = error.message
      if (code === '23505') {
        message = 'Mobile Number provided is already registered'
        return NextResponse.json({ error: message, code }, { status: 409 })
      }
      console.error('Supabase insert error', { message: error.message, details: error.details, hint: error.hint, code, payload: insertPayload })
      return NextResponse.json({ error: message, details: error.details, hint: error.hint, code }, { status: 500 })
    }

    return NextResponse.json({ success: true, row: data?.[0] })
  } catch (e: any) {
    console.error('API /goa-interest exception', e)
    return NextResponse.json({ error: e.message || 'Server error', stack: e.stack }, { status: 500 })
  }
}
