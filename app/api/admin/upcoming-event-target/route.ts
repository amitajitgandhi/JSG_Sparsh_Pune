import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const ALLOWED_TARGETS = ['/events/upcoming', '/events/sparsh-cricket-championship-season-02']
const SETTING_KEY = 'upcoming_event_target'

function getClient() {
  return supabaseServer || supabase
}

function isMissingSettingsTable(error: any) {
  const message = String(error?.message || '').toLowerCase()
  const code = String(error?.code || '')
  return code === 'PGRST205' || message.includes('app_navigation_settings') && message.includes('schema cache')
}

export async function GET() {
  try {
    const client = getClient()
    const { data, error } = await client
      .from('app_navigation_settings')
      .select('setting_value')
      .eq('setting_key', SETTING_KEY)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ target: '/events/upcoming' })
    }

    const target = data?.setting_value
    if (!target || !ALLOWED_TARGETS.includes(target)) {
      return NextResponse.json({ target: '/events/upcoming' })
    }

    return NextResponse.json({ target })
  } catch {
    return NextResponse.json({ target: '/events/upcoming' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const target = String(body?.target || '').trim()

    if (!ALLOWED_TARGETS.includes(target)) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 })
    }

    const client = getClient()
    const { error } = await client.from('app_navigation_settings').upsert(
      {
        setting_key: SETTING_KEY,
        setting_value: target,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'setting_key' }
    )

    if (error) {
      if (isMissingSettingsTable(error)) {
        return NextResponse.json(
          { error: 'Settings table is not created yet. Run migration 007_create_app_navigation_settings.sql and retry.' },
          { status: 503 }
        )
      }

      return NextResponse.json({ error: error.message || 'Failed to save target' }, { status: 500 })
    }

    return NextResponse.json({ success: true, target })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
