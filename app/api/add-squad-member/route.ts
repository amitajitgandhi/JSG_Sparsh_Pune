import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

export async function POST(request: NextRequest) {
  try {
    const body: AddSquadMemberRequest = await request.json()
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

    const filePath = path.join(process.cwd(), 'public', 'files', 'SQUAD', `${category}.json`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Squad file for category ${category} not found` }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    let squadData: SquadMember[]
    try {
      squadData = JSON.parse(fileContent)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON format in squad file' }, { status: 500 })
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

    fs.writeFileSync(filePath, JSON.stringify(squadData, null, 2), 'utf8')

    console.log(`Added new member to ${category}: ${memberToAdd['Player Name']} (${memberToAdd['Team Name']})`)

    return NextResponse.json({ success: true, newMember: memberToAdd })
  } catch (error) {
    console.error('Error adding squad member:', error)
    return NextResponse.json({ error: 'Internal server error while adding squad member' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST to add squad members.' }, { status: 405 })
}
