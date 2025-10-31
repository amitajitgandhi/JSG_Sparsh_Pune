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

interface UpdateSquadRequest {
  category: 'MENS' | 'WOMENS' | 'KIDS'
  originalMember: SquadMember
  updatedMember: SquadMember
}

const getPrimaryFilePath = (category: string) => path.join(process.cwd(), 'public', 'files', 'SQUAD', `${category}.json`)
const getTempFilePath = (category: string) => path.join('/tmp', `${category}-squad.json`)

function readSquad(category: string): SquadMember[] {
  const tempPath = getTempFilePath(category)
  if (fs.existsSync(tempPath)) {
    try { return JSON.parse(fs.readFileSync(tempPath, 'utf8')) } catch (e) { console.warn('[update-squad] Failed parsing temp file, falling back to public:', e) }
  }
  const primary = getPrimaryFilePath(category)
  if (!fs.existsSync(primary)) throw new Error(`Squad file for category ${category} not found`)
  return JSON.parse(fs.readFileSync(primary, 'utf8'))
}

function writeSquad(category: string, data: SquadMember[]) {
  const primary = getPrimaryFilePath(category)
  try {
    fs.writeFileSync(primary, JSON.stringify(data, null, 2), 'utf8')
    return 'primary'
  } catch (e) {
    console.warn('[update-squad] Primary write failed, attempting temp fallback:', e)
    const tempPath = getTempFilePath(category)
    try {
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8')
      return 'temp'
    } catch (tmpErr) {
      console.error('[update-squad] Temp write failed:', tmpErr)
      throw new Error('Filesystem write failed (read-only environment)')
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    let body: UpdateSquadRequest
    try { body = JSON.parse(bodyText) } catch (e) {
      console.error('Invalid JSON body for update-squad:', bodyText)
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { category, originalMember, updatedMember } = body

    if (!category || !originalMember || !updatedMember) {
      return NextResponse.json({ error: 'Missing required fields: category, originalMember, updatedMember' }, { status: 400 })
    }
    if (!['MENS', 'WOMENS', 'KIDS'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be MENS, WOMENS, or KIDS' }, { status: 400 })
    }

    if (!updatedMember['Jersey Name']?.trim()) return NextResponse.json({ error: 'Jersey Name is required' }, { status: 400 })
    if (updatedMember['Jersey Number'] === undefined || updatedMember['Jersey Number'] === '') return NextResponse.json({ error: 'Jersey Number is required' }, { status: 400 })
    if (!updatedMember['Jersey Size']) return NextResponse.json({ error: 'Jersey Size is required' }, { status: 400 })

    let squadData: SquadMember[]
    try { squadData = readSquad(category) } catch (e: any) { return NextResponse.json({ error: e.message || 'Failed reading squad file' }, { status: 404 }) }

    const memberIndex = squadData.findIndex(member => 
      member['Player Name'] === originalMember['Player Name'] &&
      String(member['Mobile Number']) === String(originalMember['Mobile Number']) &&
      member['Team Name'] === originalMember['Team Name']
    )
    if (memberIndex === -1) {
      return NextResponse.json({ error: 'Squad member not found' }, { status: 404 })
    }

    const currentMember = squadData[memberIndex]
    const normalizedJerseyNumber = String(updatedMember['Jersey Number']).trim()
    squadData[memberIndex] = {
      ...currentMember,
      'Jersey Name': updatedMember['Jersey Name'].trim(),
      'Jersey Number': normalizedJerseyNumber,
      'Jersey Size': updatedMember['Jersey Size'],
      'Cric Heroes Link': updatedMember['Cric Heroes Link'] || currentMember['Cric Heroes Link'],
      'JERSEY COLOR': updatedMember['JERSEY COLOR'] || currentMember['JERSEY COLOR']
    }

    let target: string
    try { target = writeSquad(category, squadData) } catch (e: any) { return NextResponse.json({ error: e.message || 'Write failed' }, { status: 500 }) }

    console.log(`Squad member updated (${target} storage): ${originalMember['Player Name']} in ${category}`)

    return NextResponse.json({ success: true, message: 'Squad member updated successfully', updatedMember: squadData[memberIndex], storage: target })

  } catch (error) {
    console.error('Error updating squad member (unhandled):', error)
    return NextResponse.json({ error: 'Internal server error while updating squad member' }, { status: 500 })
  }
}

export async function GET() { return NextResponse.json({ error: 'Method not allowed. Use POST to update squad members.' }, { status: 405 }) }