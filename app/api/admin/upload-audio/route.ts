import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const BUCKET = 'portal-audio'

function noStore(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServer) {
      return noStore({ error: 'Supabase not available' }, 500)
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return noStore({ error: 'No file provided' }, 400)

    // Only allow audio files
    if (!file.type.startsWith('audio/')) {
      return noStore({ error: 'Only audio files are allowed' }, 400)
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return noStore({ error: 'File too large (max 5 MB)' }, 400)
    }

    const buffer    = Buffer.from(await file.arrayBuffer())
    const ext       = file.name.split('.').pop() ?? 'mp3'
    const filename  = `bell-${Date.now()}.${ext}`

    // Ensure bucket exists (create if missing)
    const { data: buckets } = await supabaseServer.storage.listBuckets()
    const exists = buckets?.some(b => b.name === BUCKET)
    if (!exists) {
      await supabaseServer.storage.createBucket(BUCKET, { public: true })
    }

    const { error: uploadErr } = await supabaseServer.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadErr) {
      return noStore({ error: uploadErr.message }, 500)
    }

    const { data: urlData } = supabaseServer.storage
      .from(BUCKET)
      .getPublicUrl(filename)

    return noStore({ success: true, url: urlData.publicUrl })
  } catch (e: any) {
    return noStore({ error: e?.message ?? 'Upload failed' }, 500)
  }
}
