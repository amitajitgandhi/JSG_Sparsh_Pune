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

interface UpdateSquadRequest {
  category: 'MENS' | 'WOMENS' | 'KIDS'
  originalMember: SquadMember
  updatedMember: SquadMember
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateSquadRequest = await request.json()
    const { category, originalMember, updatedMember } = body

    // Validate required fields
    if (!category || !originalMember || !updatedMember) {
      return NextResponse.json(
        { error: 'Missing required fields: category, originalMember, updatedMember' },
        { status: 400 }
      )
    }

    // Validate category
    if (!['MENS', 'WOMENS', 'KIDS'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be MENS, WOMENS, or KIDS' },
        { status: 400 }
      )
    }

    // Validate jersey details
    if (!updatedMember['Jersey Name']?.trim()) {
      return NextResponse.json(
        { error: 'Jersey Name is required' },
        { status: 400 }
      )
    }

    if (!updatedMember['Jersey Number']) {
      return NextResponse.json(
        { error: 'Jersey Number is required' },
        { status: 400 }
      )
    }

    if (!updatedMember['Jersey Size']) {
      return NextResponse.json(
        { error: 'Jersey Size is required' },
        { status: 400 }
      )
    }

    // Get the file path
    const filePath = path.join(process.cwd(), 'public', 'files', 'SQUAD', `${category}.json`)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Squad file for category ${category} not found` },
        { status: 404 }
      )
    }

    // Read current squad data
    const fileContent = fs.readFileSync(filePath, 'utf8')
    let squadData: SquadMember[]

    try {
      squadData = JSON.parse(fileContent)
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON format in squad file' },
        { status: 500 }
      )
    }

    // Find the member to update
    const memberIndex = squadData.findIndex(member => 
      member['Player Name'] === originalMember['Player Name'] &&
      member['Mobile Number'] === originalMember['Mobile Number'] &&
      member['Team Name'] === originalMember['Team Name']
    )

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Squad member not found' },
        { status: 404 }
      )
    }

    // Update the member while preserving non-editable fields
    const currentMember = squadData[memberIndex]
    squadData[memberIndex] = {
      ...currentMember, // Preserve all original data
      'Jersey Name': updatedMember['Jersey Name'].trim(),
      'Jersey Number': updatedMember['Jersey Number'],
      'Jersey Size': updatedMember['Jersey Size'],
      'Cric Heroes Link': updatedMember['Cric Heroes Link'] || currentMember['Cric Heroes Link'],
      'JERSEY COLOR': updatedMember['JERSEY COLOR'] || currentMember['JERSEY COLOR']
    }

    // Write updated data back to file
    const updatedContent = JSON.stringify(squadData, null, 2)
    fs.writeFileSync(filePath, updatedContent, 'utf8')

    // Log the update for audit purposes
    console.log(`Squad member updated: ${originalMember['Player Name']} in ${category} category`)
    console.log(`Updated fields:`, {
      'Jersey Name': `"${originalMember['Jersey Name']}" -> "${updatedMember['Jersey Name']}"`,
      'Jersey Number': `"${originalMember['Jersey Number']}" -> "${updatedMember['Jersey Number']}"`,
      'Jersey Size': `"${originalMember['Jersey Size']}" -> "${updatedMember['Jersey Size']}"`
    })

    return NextResponse.json({
      success: true,
      message: 'Squad member updated successfully',
      updatedMember: squadData[memberIndex]
    })

  } catch (error) {
    console.error('Error updating squad member:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating squad member' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to update squad members.' },
    { status: 405 }
  )
}