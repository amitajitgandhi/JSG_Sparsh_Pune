import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getTournamentBySlug } from '@/lib/tournament/service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 })

  const { data: tournament, error: tErr } = await getTournamentBySlug(slug)
  if (tErr || !tournament) return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 })

  // Step 1: get category IDs for this tournament
  const { data: cats, error: cErr } = await supabase
    .from('sports_event_categories')
    .select('id')
    .eq('tournament_id', tournament.id)

  if (cErr) return NextResponse.json({ success: false, error: cErr.message }, { status: 500 })

  const catIds = (cats ?? []).map((c: { id: string }) => c.id)

  if (catIds.length === 0) return NextResponse.json({ success: true, data: [] })

  // Step 2: fetch results for those categories
  const { data, error } = await supabase
    .from('sports_results')
    .select(`
      *,
      team:sports_teams(*),
      event_category:sports_event_categories(
        *,
        sport:sports(*)
      )
    `)
    .in('event_category_id', catIds)
    .order('rank', { ascending: true })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, data: data ?? [] })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_category_id, team_id, rank, points_awarded, remarks } = body

    if (!event_category_id || !team_id || !rank) {
      return NextResponse.json({ success: false, error: 'event_category_id, team_id, rank are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('sports_results')
      .upsert({
        event_category_id,
        team_id,
        rank: Number(rank),
        points_awarded: Number(points_awarded ?? 0),
        remarks: remarks ?? null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unexpected error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
