import { NextResponse } from 'next/server'
import { z } from 'zod'
import { membershipSchema } from '../../../../lib/validation'
import { supabase, supabaseServer } from '../../../../lib/supabase'

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const payload = membershipSchema.parse(json)
    // transaction fields may be present but are not part of membershipSchema
    const jsonAny: any = json
    const txId = jsonAny.transaction_id || null
    const txUrl = jsonAny.transaction_screenshot_url || null
    const paymentType = jsonAny.payment_type || null

    const wedding_date = `${payload.wedding_date.year}-${payload.wedding_date.month}-${payload.wedding_date.day}`
    const dob = `${payload.dob.year}-${payload.dob.month}-${payload.dob.day}`
    const spouse_dob = payload.spouse_dob?.day ? `${payload.spouse_dob.year}-${payload.spouse_dob.month}-${payload.spouse_dob.day}` : null

    // Prefer service role on the server (bypasses RLS). Fallback to anon if not configured.
    const client = supabaseServer ?? supabase

    // Insert parent membership
    const { data: parent, error: parentErr } = await client
      .from('memberships_2026_27')
      .insert([
        {
          full_name: payload.full_name,
          address: payload.residential_address,
          whatsapp: payload.whatsapp_number,
          spouse_name: payload.spouse_full_name || null,
          spouse_whatsapp: payload.spouse_whatsapp || null,
          wedding_date,
          dob,
          spouse_dob,
          transaction_id: txId,
          transaction_screenshot_url: txUrl,
          membership_type: payload.membership_type,
          payment_type: paymentType,
        },
      ])
      .select('id')
      .single()

    if (parentErr) throw parentErr
    const membership_id = parent?.id
    if (!membership_id) throw new Error('Missing parent id')

    // Prepare child rows (only up to number_of_children)
    const childRows = (payload.children || [])
      .slice(0, payload.number_of_children || 0)
      .map((c, i) => ({
        membership_id,
        child_index: i,
        name: c.name,
        gender: c.gender || null,
        school: c.school || null,
        other_school: c.other_school || null,
        dob: `${c.dob.year}-${c.dob.month}-${c.dob.day}`,
      }))

    if (childRows.length > 0) {
      const { error: childErr } = await client.from('membership_children_2026_27').insert(childRows)
      if (childErr) throw childErr
    }

    return NextResponse.json({ ok: true, id: membership_id })
  } catch (e: any) {
    const message = e?.message || 'Invalid request'
    // Help diagnose common RLS issue
    const hint = message.includes('row-level security')
      ? 'Server missing SUPABASE_SERVICE_ROLE_KEY or table RLS policy denies inserts.'
      : undefined
    return NextResponse.json({ ok: false, error: message, hint }, { status: 400 })
  }
}
