import { createWorker } from 'tesseract.js'
import { supabase, supabaseServer } from '@/lib/supabase'

// NOTE: duplicated from app/events/sparsh-cricket-championship-season-02/utils.ts rather than
// imported cross-folder, so this event folder stays self-contained. Worth promoting to a shared
// lib/ocr.ts helper if a third event needs the same logic.

// This event uses `registration-transaction-ss` for the payment screenshot (not the shared
// `uploadRegistrationTransactionScreenshot` in lib/supabase.ts, which targets `membership-fees-ss`
// - a different bucket used by other events). Kept local to this event folder rather than
// changing the shared helper, which would affect Khelotsav/Membership/Cricket Championship too.
export async function uploadTransactionScreenshot(file: File, registrationId: string): Promise<string | null> {
  try {
    const client = supabase
    if (!file || file.size === 0) return null
    if (file.size > 10 * 1024 * 1024) return null

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext) return null
    const allowedExt = ['jpg', 'jpeg', 'png']
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedExt.includes(ext) && !allowedMime.includes(file.type.toLowerCase())) return null

    const fileName = `transaction-${registrationId}-${Date.now()}.${ext}`
    const { data, error } = await client.storage.from('registration-transaction-ss').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

    if (error) {
      console.error('Box Cricket transaction screenshot upload failed:', error)
      return null
    }
    if (!data) return null

    const { data: pub } = client.storage.from('registration-transaction-ss').getPublicUrl(data.path)
    if (pub?.publicUrl) return pub.publicUrl

    // Fallback if the bucket isn't public: signed URL via the service-role client.
    if (supabaseServer) {
      const { data: signed, error: signedErr } = await supabaseServer.storage
        .from('registration-transaction-ss')
        .createSignedUrl(data.path, 60 * 60)
      if (!signedErr && signed?.signedUrl) return signed.signedUrl
    }

    return null
  } catch (e) {
    console.error('uploadTransactionScreenshot unexpected error:', e)
    return null
  }
}

const utrPatterns = [
  /(?:UTR|URN|RRN)[\s.:#-]*([A-Za-z0-9]{10,30})/i,
  /(?:Transaction\s*(?:Reference|Ref|ID|No|Number)|Txn\s*(?:Reference|Ref|ID|No|Number))[\s.:#-]*([A-Za-z0-9]{8,30})/i,
  /(?:UPI\s*(?:Ref|Reference|Txn|Transaction)[\s.:#-]*)([A-Za-z0-9]{8,30})/i,
  /\b([0-9]{12,22})\b/
]

export function extractTransactionReferenceFromText(text: string): string | null {
  const normalized = text.replace(/\s+/g, ' ').trim()
  for (const pattern of utrPatterns) {
    const match = normalized.match(pattern)
    if (match?.[1]) {
      return match[1].trim()
    }
  }
  return null
}

export async function detectTransactionReferenceFromImage(file: File): Promise<string | null> {
  const worker = await createWorker('eng')
  const objectUrl = URL.createObjectURL(file)

  try {
    const {
      data: { text }
    } = await worker.recognize(objectUrl)

    return extractTransactionReferenceFromText(text)
  } finally {
    URL.revokeObjectURL(objectUrl)
    await worker.terminate()
  }
}
