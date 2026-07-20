import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Shared, per-event registration status - reused across every event page/dashboard rather than
// creating a bespoke route per event. Backed by the same `app_navigation_settings` key/value
// table the "Upcoming Event" button target already uses, keyed as `registration_status_<slug>`.
export type RegistrationStatus = 'not_open' | 'open' | 'closed'
const VALID_STATUSES: RegistrationStatus[] = ['not_open', 'open', 'closed']
const DEFAULT_STATUS: RegistrationStatus = 'open'

function keyFor(slug: string) {
  return `registration_status_${slug}`
}

function noStoreJson(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  })
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return noStoreJson({ error: 'slug is required' }, 400)

  try {
    if (!supabaseServer) {
      console.warn('Supabase server client not available')
      return noStoreJson({ status: DEFAULT_STATUS, source: 'fallback' })
    }

    const { data, error } = await supabaseServer
      .from('app_navigation_settings')
      .select('setting_value')
      .eq('setting_key', keyFor(slug))
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return noStoreJson({ status: DEFAULT_STATUS, source: 'error', error: error.message })
    }

    const status = (data?.setting_value as RegistrationStatus) || DEFAULT_STATUS
    return noStoreJson({ status, source: 'database' })
  } catch (err) {
    console.error('GET error:', err)
    return noStoreJson({ status: DEFAULT_STATUS, source: 'fallback', error: 'Failed to fetch from database' })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServer) {
      console.warn('Supabase server client not available')
      return noStoreJson({ error: 'Server configuration error' }, 500)
    }

    const body = await req.json()
    const slug = String(body?.slug || '').trim()
    const status = String(body?.status || '').trim() as RegistrationStatus

    if (!slug) return noStoreJson({ error: 'slug is required' }, 400)
    if (!VALID_STATUSES.includes(status)) {
      return noStoreJson({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, 400)
    }

    const key = keyFor(slug)

    // Update-then-insert-fallback, mirroring app/api/admin/upcoming-event-target/route.ts.
    const { data: existingData } = await supabaseServer
      .from('app_navigation_settings')
      .select('setting_key')
      .eq('setting_key', key)
      .single()

    let result
    if (existingData) {
      result = await supabaseServer
        .from('app_navigation_settings')
        .update({ setting_value: status, updated_at: new Date().toISOString() })
        .eq('setting_key', key)
        .select()
    } else {
      result = await supabaseServer
        .from('app_navigation_settings')
        .insert([{ setting_key: key, setting_value: status }])
        .select()
    }

    if (result.error) {
      console.error('Save error:', result.error)
      return noStoreJson({ error: result.error.message }, 400)
    }

    return noStoreJson({ success: true, status, source: 'database' })
  } catch (err) {
    console.error('POST error:', err)
    return noStoreJson({ error: 'Unexpected error' }, 500)
  }
}
