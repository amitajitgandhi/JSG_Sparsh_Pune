import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const KEY_ENABLED       = 'leaderboard_auto_refresh_enabled'
const KEY_INTERVAL      = 'leaderboard_auto_refresh_interval'
const KEY_AUDIO_ENABLED = 'leaderboard_audio_enabled'
const KEY_AUDIO_URL     = 'leaderboard_audio_url'

const DEFAULT_AUDIO_URL = '/files/BELL.mp3'

function noStore(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

async function getSetting(key: string): Promise<string | null> {
  if (!supabaseServer) return null
  const { data } = await supabaseServer
    .from('app_navigation_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .single()
  return data?.setting_value ?? null
}

async function upsertSetting(key: string, value: string) {
  if (!supabaseServer) throw new Error('Supabase not available')
  const { data: existing } = await supabaseServer
    .from('app_navigation_settings')
    .select('setting_key')
    .eq('setting_key', key)
    .single()
  if (existing) {
    return supabaseServer
      .from('app_navigation_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', key)
  }
  return supabaseServer
    .from('app_navigation_settings')
    .insert([{ setting_key: key, setting_value: value }])
}

export async function GET() {
  try {
    const [enabled, interval, audioEnabled, audioUrl] = await Promise.all([
      getSetting(KEY_ENABLED),
      getSetting(KEY_INTERVAL),
      getSetting(KEY_AUDIO_ENABLED),
      getSetting(KEY_AUDIO_URL),
    ])
    return noStore({
      enabled:      enabled === 'true',
      intervalMins: interval ? parseInt(interval, 10) : 5,
      audioEnabled: audioEnabled !== 'false',   // default ON
      audioUrl:     audioUrl || DEFAULT_AUDIO_URL,
    })
  } catch {
    return noStore({ enabled: false, intervalMins: 5, audioEnabled: true, audioUrl: DEFAULT_AUDIO_URL })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body          = await req.json()
    const enabled       = !!body.enabled
    const intervalMins  = Math.max(1, Math.min(60, parseInt(body.intervalMins ?? '5', 10)))
    const audioEnabled  = body.audioEnabled !== false
    const audioUrl      = String(body.audioUrl || DEFAULT_AUDIO_URL).trim()
    await Promise.all([
      upsertSetting(KEY_ENABLED,       String(enabled)),
      upsertSetting(KEY_INTERVAL,      String(intervalMins)),
      upsertSetting(KEY_AUDIO_ENABLED, String(audioEnabled)),
      upsertSetting(KEY_AUDIO_URL,     audioUrl),
    ])
    return noStore({ success: true, enabled, intervalMins, audioEnabled, audioUrl })
  } catch (e: any) {
    return noStore({ error: e?.message ?? 'Failed to save' }, 500)
  }
}
