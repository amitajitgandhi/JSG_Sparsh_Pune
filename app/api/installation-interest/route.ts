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
  return errors
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const errors = validate(body)
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 400 })
    }

    const record = {
      name: String(body.name).trim(),
      mobile: String(body.mobile).trim(),
      notes: body.notes ? String(body.notes).trim() : null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from('installation_2026_interest').insert([record]).select()

    if (error) {
      console.error('Installation interest insert error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Installation interest API error:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}
