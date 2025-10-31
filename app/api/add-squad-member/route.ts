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

interface AddSquadMemberRequest {
  category: 'MENS' | 'WOMENS' | 'KIDS'
  newMember: SquadMember
}

const getPrimaryFilePath = (category: string) => path.join(process.cwd(), 'public', 'files', 'SQUAD', `${category}.json`)
const getTempFilePath = (category: string) => path.join('/tmp', `${category}-squad.json`)

function readSquad(category: string): SquadMember[] {
  const tempPath = getTempFilePath(category)
  if (fs.existsSync(tempPath)) {
    try {
      return JSON.parse(fs.readFileSync(tempPath, 'utf8'))
    } catch (e) {
      console.warn('[add-squad-member] Failed parsing temp file, falling back to public:', e)
    }
  }
  const primary = getPrimaryFilePath(category)
  if (!fs.existsSync(primary)) {
    throw new Error(`Squad file for category ${category} not found`)
  }
  return JSON.parse(fs.readFileSync(primary, 'utf8'))
}

function writeSquad(category: string, data: SquadMember[]) {
  const primary = getPrimaryFilePath(category)
  try {
    fs.writeFileSync(primary, JSON.stringify(data, null, 2), 'utf8')
    return 'primary'
  } catch (e) {
    console.warn('[add-squad-member] Primary write failed, attempting temp fallback:', e)
    const tempPath = getTempFilePath(category)
    try {
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8')
      return 'temp'
    } catch (tmpErr) {
      console.error('[add-squad-member] Temp write failed:', tmpErr)
      throw new Error('Filesystem write failed (read-only environment)')
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()
    let body: AddSquadMemberRequest
    try {
      body = JSON.parse(raw)
    } catch (e) {
      console.error('[add-squad-member] Invalid JSON body:', raw)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { category, newMember } = body

    if (!category || !newMember) {
      return NextResponse.json({ error: 'Missing required fields: category, newMember' }, { status: 400 })
    }

    if (!['MENS', 'WOMENS', 'KIDS'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be MENS, WOMENS, or KIDS' }, { status: 400 })
    }

    // Basic validation
    if (!newMember['Player Name']?.trim()) {
      return NextResponse.json({ error: 'Player Name is required' }, { status: 400 })
    }
    if (!newMember['Mobile Number']) {
      return NextResponse.json({ error: 'Mobile Number is required' }, { status: 400 })
    }
    if (category === 'KIDS' && (newMember.Age === undefined || isNaN(Number(newMember.Age)))) {
      return NextResponse.json({ error: 'Valid Age is required for KIDS category' }, { status: 400 })
    }

    let squadData: SquadMember[]
    try {
      squadData = readSquad(category)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Failed reading squad file' }, { status: 404 })
    }

    // Check for duplicate (same player name + mobile + team)
    const duplicate = squadData.find(m =>
      m['Player Name'].toLowerCase() === newMember['Player Name'].trim().toLowerCase() &&
      String(m['Mobile Number']).trim() === String(newMember['Mobile Number']).trim() &&
      m['Team Name'].toLowerCase() === newMember['Team Name'].trim().toLowerCase()
    )
    if (duplicate) {
      return NextResponse.json({ error: 'Player already exists in this team with same mobile number.' }, { status: 409 })
    }

    // Normalize data
    const memberToAdd: SquadMember = {
      'Player Name': newMember['Player Name'].trim(),
      'Mobile Number': String(newMember['Mobile Number']).trim(),
      'Team Name': newMember['Team Name'].trim(),
      'Jersey Name': newMember['Jersey Name']?.trim() || undefined,
      'Jersey Number': newMember['Jersey Number']?.toString().trim() || undefined,
      'Jersey Size': newMember['Jersey Size']?.trim() || undefined,
      'Cric Heroes Link': newMember['Cric Heroes Link']?.trim() || undefined,
      Age: category === 'KIDS' ? Number(newMember.Age) : undefined
    }

    squadData.push(memberToAdd)

    let target: string
    try {
      target = writeSquad(category, squadData)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Write failed' }, { status: 500 })
    }

    console.log(`Added new member to ${category} (${target} storage): ${memberToAdd['Player Name']} (${memberToAdd['Team Name']})`)

    return NextResponse.json({ success: true, newMember: memberToAdd, storage: target })
  } catch (error) {
    console.error('Error adding squad member (unhandled):', error)
    return NextResponse.json({ error: 'Internal server error while adding squad member' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST to add squad members.' }, { status: 405 })
}
