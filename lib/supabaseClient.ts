import { createClient } from '@supabase/supabase-js'

// Use env variables (define in .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
