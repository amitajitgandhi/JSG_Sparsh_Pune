import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ALLOWED_TARGETS = ['/events/upcoming', '/events/sparsh-cricket-championship-season-02', '/events/khelotsav-2026']
const DEFAULT_TARGET = '/events/upcoming'

let upcomingEventTarget: string = DEFAULT_TARGET

function noStoreJson(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
  })
}

export async function GET() {
  const target = ALLOWED_TARGETS.includes(upcomingEventTarget) ? upcomingEventTarget : DEFAULT_TARGET
  return noStoreJson({ target, source: 'memory' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const target = String(body?.target || '').trim()

    if (!ALLOWED_TARGETS.includes(target)) {
      return noStoreJson({ error: 'Invalid target' }, 400)
    }

    upcomingEventTarget = target

    return noStoreJson({ success: true, target: upcomingEventTarget, source: 'memory' })
  } catch {
    return noStoreJson({ error: 'Unexpected error' }, 500)
  }
}
