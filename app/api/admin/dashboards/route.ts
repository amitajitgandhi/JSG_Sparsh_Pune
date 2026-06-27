import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { DASHBOARD_TABLES } from '@/app/admin/dashboards.config'

export const dynamic = 'force-dynamic'

const KEY_ARCHIVED = 'admin_archived_dashboards'

function noStore(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

async function getArchived(): Promise<string[]> {
  if (!supabaseServer) return []
  const { data } = await supabaseServer
    .from('app_navigation_settings')
    .select('setting_value')
    .eq('setting_key', KEY_ARCHIVED)
    .single()
  if (!data?.setting_value) return []
  try {
    const parsed = JSON.parse(data.setting_value)
    return Array.isArray(parsed) ? parsed.filter((s: unknown) => typeof s === 'string') : []
  } catch {
    return []
  }
}

async function setArchived(slugs: string[]) {
  if (!supabaseServer) throw new Error('Supabase not available')
  const value = JSON.stringify(slugs)
  const { data: existing } = await supabaseServer
    .from('app_navigation_settings')
    .select('setting_key')
    .eq('setting_key', KEY_ARCHIVED)
    .single()
  if (existing) {
    return supabaseServer
      .from('app_navigation_settings')
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq('setting_key', KEY_ARCHIVED)
  }
  return supabaseServer
    .from('app_navigation_settings')
    .insert([{ setting_key: KEY_ARCHIVED, setting_value: value }])
}

export async function GET() {
  try {
    const archived = await getArchived()
    return noStore({ archived })
  } catch {
    return noStore({ archived: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServer) throw new Error('Supabase not available')

    const body = await req.json()
    const slug = String(body?.slug || '').trim()
    const mode = body?.mode === 'tile_and_data' ? 'tile_and_data' : 'tile'

    if (!slug) return noStore({ error: 'slug is required' }, 400)
    // Only known dashboards can be archived (guards the table allow-list too).
    if (!(slug in DASHBOARD_TABLES)) {
      return noStore({ error: `Unknown dashboard slug: ${slug}` }, 400)
    }

    // 1. If deleting data: export first, then delete. Abort on export failure.
    let exported: Record<string, any[]> | undefined
    if (mode === 'tile_and_data') {
      const tables = DASHBOARD_TABLES[slug] // allow-listed from the registry only
      exported = {}
      for (const table of tables) {
        const { data, error } = await supabaseServer.from(table).select('*')
        if (error) {
          return noStore({ error: `Export failed for ${table}: ${error.message}. Nothing was deleted.` }, 500)
        }
        exported[table] = data ?? []
      }
      // Export succeeded — now delete.
      for (const table of tables) {
        // `neq id` is a no-op filter that matches all rows (Supabase requires a filter on delete).
        const { error } = await supabaseServer.from(table).delete().not('id', 'is', null)
        if (error) {
          return noStore({ error: `Delete failed for ${table}: ${error.message}`, export: exported }, 500)
        }
      }
    }

    // 2. Mark archived (idempotent).
    const archived = await getArchived()
    if (!archived.includes(slug)) {
      archived.push(slug)
      const { error } = (await setArchived(archived)) as any
      if (error) return noStore({ error: error.message ?? 'Failed to save archive state', export: exported }, 500)
    }

    return noStore({ success: true, archived, export: exported })
  } catch (e: any) {
    return noStore({ error: e?.message ?? 'Failed to archive' }, 500)
  }
}
