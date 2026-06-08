import { NextRequest, NextResponse } from 'next/server'
import { calculateLeaderboard } from '@/lib/tournament/leaderboard'
import { getLeaderboardData, getTournamentBySlug } from '@/lib/tournament/service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 })

  const { data: tournament, error: tErr } = await getTournamentBySlug(slug)
  if (tErr || !tournament) return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 })

  const { teams, results, categories, sports, error } = await getLeaderboardData(tournament.id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  const leaderboard = calculateLeaderboard({ teams, results, categories, sports })
  return NextResponse.json({ success: true, data: leaderboard })
}
