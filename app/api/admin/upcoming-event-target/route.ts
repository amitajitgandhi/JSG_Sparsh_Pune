import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const DEFAULT_TARGET = '/events/upcoming'
const SETTING_KEY = 'upcoming_event_target'

function noStoreJson(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  })
}

export async function GET() {
  try {
    if (!supabaseServer) {
      console.warn('Supabase server client not available')
      return noStoreJson({ target: DEFAULT_TARGET, source: 'fallback' })
    }

    const { data, error } = await supabaseServer
      .from('app_navigation_settings')
      .select('setting_value')
      .eq('setting_key', SETTING_KEY)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return noStoreJson({ target: DEFAULT_TARGET, source: 'error', error: error.message })
    }

    const target = data?.setting_value || DEFAULT_TARGET
    return noStoreJson({ target, source: 'database' })
  } catch (err) {
    console.error('GET error:', err)
    return noStoreJson({ target: DEFAULT_TARGET, source: 'fallback', error: 'Failed to fetch from database' })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServer) {
      console.warn('Supabase server client not available')
      return noStoreJson({ error: 'Server configuration error' }, 500)
    }

    const body = await req.json()
    const target = String(body?.target || '').trim()

    if (!target) {
      return noStoreJson({ error: 'Target cannot be empty' }, 400)
    }

    // Try to update first, then insert if not found
    const { data: existingData } = await supabaseServer
      .from('app_navigation_settings')
      .select('setting_key')
      .eq('setting_key', SETTING_KEY)
      .single()

    let result
    if (existingData) {
      result = await supabaseServer
        .from('app_navigation_settings')
        .update({ setting_value: target, updated_at: new Date().toISOString() })
        .eq('setting_key', SETTING_KEY)
        .select()
    } else {
      result = await supabaseServer
        .from('app_navigation_settings')
        .insert([{ setting_key: SETTING_KEY, setting_value: target }])
        .select()
    }

    if (result.error) {
      console.error('Save error:', result.error)
      return noStoreJson({ error: result.error.message }, 400)
    }

    return noStoreJson({ success: true, target, source: 'database' })
  } catch (err) {
    console.error('POST error:', err)
    return noStoreJson({ error: 'Unexpected error' }, 500)
  }
}
