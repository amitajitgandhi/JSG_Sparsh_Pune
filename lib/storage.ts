import { supabase } from './supabase'

export async function uploadPublicFile(bucket: string, file: File, prefix = ''): Promise<string | null> {
  try {
    if (!file || file.size === 0) return null
    if (file.size > 10 * 1024 * 1024) return null
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const name = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from(bucket).upload(name, file)
    if (error || !data) return null
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return pub?.publicUrl || null
  } catch {
    return null
  }
}
