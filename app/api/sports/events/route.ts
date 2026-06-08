import { NextResponse } from 'next/server'
import { getSports } from '@/lib/tournament/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await getSports()
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
