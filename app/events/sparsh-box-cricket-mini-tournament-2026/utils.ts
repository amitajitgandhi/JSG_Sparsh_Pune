import { createWorker } from 'tesseract.js'

// NOTE: duplicated from app/events/sparsh-cricket-championship-season-02/utils.ts rather than
// imported cross-folder, so this event folder stays self-contained. Worth promoting to a shared
// lib/ocr.ts helper if a third event needs the same logic.

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
