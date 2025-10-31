import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SquadMember {
  'Player Name': string
  'Mobile Number': number | string
  'Jersey Size'?: string
  'Jersey Number'?: number | string
  'Jersey Name'?: string
  'Cric Heroes Link'?: string
  'Team Name': string
  'JERSEY COLOR'?: string
  Age?: number
}

const categories: Array<'MENS' | 'WOMENS' | 'KIDS'> = ['MENS','WOMENS','KIDS']
const getPrimaryFilePath = (category: string) => path.join(process.cwd(),'public','files','SQUAD',`${category}.json`)
const getTempFilePath = (category: string) => path.join('/tmp',`${category}-squad.json`)

function readSquad(category: string): SquadMember[] {
  // Prefer temp (updated) file if present
  const tmp = getTempFilePath(category)
  if (fs.existsSync(tmp)) {
    try { return JSON.parse(fs.readFileSync(tmp,'utf8')) } catch(e) { console.warn(`[get-squads] Failed parsing temp ${category}`, e) }
  }
  const primary = getPrimaryFilePath(category)
  if (!fs.existsSync(primary)) return []
  try { return JSON.parse(fs.readFileSync(primary,'utf8')) } catch(e) { console.error(`[get-squads] Failed parsing primary ${category}`, e); return [] }
}

export async function GET(_req: NextRequest) {
  try {
    const result: Record<string,SquadMember[]> = {}
    for (const c of categories) {
      result[c] = readSquad(c)
    }
    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    console.error('[get-squads] Unexpected error', e)
    return NextResponse.json({ error: 'Failed to load squads' }, { status: 500 })
  }
}
