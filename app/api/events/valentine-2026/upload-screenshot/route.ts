import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `valentine/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const client = supabaseServer || supabase

    // Ensure Node compatibility: convert to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const buckets = ['valentine-screenshot', 'valentine-screenshots']
    let publicUrl: string | null = null
    let lastError: string | null = null
    for (const bucket of buckets) {
      const { error: uploadErr } = await client.storage
        .from(bucket)
        .upload(path, bytes, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        })
      if (uploadErr) {
        lastError = uploadErr.message
        continue
      }
      const { data: pub } = client.storage.from(bucket).getPublicUrl(path)
      publicUrl = pub?.publicUrl || null
      break
    }
    if (!publicUrl) return NextResponse.json({ success: false, error: lastError || 'Upload failed' }, { status: 500 })
    return NextResponse.json({ success: true, url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
