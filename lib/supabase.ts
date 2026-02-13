import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')

try { new URL(supabaseUrl) } catch { throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format') }

// For corporate networks - temporary SSL bypass (REMOVE IN PRODUCTION)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Public client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client (server only)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseServer = (typeof window === 'undefined' && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { 
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (url, options = {}) => {
          console.log('Supabase fetch attempt:', url)
          return fetch(url, {
            ...options,
            // Add any additional headers if needed for corporate proxy
          })
        }
      }
    })
  : null

const getServerClient = () => (supabaseServer || supabase)

export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await getServerClient().from('registrations').select('id').limit(1)
    if (data !== null || (error && !error.message.includes('fetch failed'))) return true
    console.error('Connection test failed:', error)
    return false
  } catch (e) {
    console.error('Supabase connection test failed:', e)
    return false
  }
}

export const checkRegistrationsTable = async (): Promise<boolean> => {
  try {
    const { error } = await getServerClient().from('registrations').select('id').limit(0)
    return !error || !error.message?.includes('does not exist')
  } catch (e) {
    console.error('Error checking registrations table:', e)
    return false
  }
}

export interface GoaInterest {
  id?: string
  name: string
  mobile: string
  transport: string
  kids: 'Yes' | 'No'
  kids_count?: number | null
  kids_ages?: string | null
  extra_couple_count?: number | null
  notes?: string | null
  created_at?: string
}

export interface Registration {
  id?: string
  category: 'male' | 'female' | 'kids'
  full_name: string
  parent_name?: string
  mobile_number: string
  date_of_birth: string  // Changed from age: number to date_of_birth: string
  gender?: string // Added for Kids category - Boy/Girl
  skillset: string
  bowling_arm: string
  batting_style: string
  cricket_experience?: string
  cric_heroes_link?: string
  jersey_name: string
  jersey_number: number
  jersey_size: string
  photo_url?: string
  transaction_id?: string
  transaction_screenshot_url?: string
  payment_status: 'pending' | 'completed' | 'failed'
  registration_date?: string
  created_at?: string
  updated_at?: string
}

// New interface for donations
export interface Donation {
  id?: string
  name: string
  mobile_number: string
  amount: number
  transaction_id: string
  transaction_screenshot_url?: string
  created_at?: string
}

// New interface for enquiries (volunteers and join us)
export interface Enquiry {
  id?: string
  name: string
  address: string
  mobile_number: string
  type: 'volunteer' | 'general'
  enquiry_type: 'Volunteer' | 'JoinUs'
  created_at?: string
}

export const uploadPhoto = async (file: File, registrationId: string): Promise<string | null> => {
  try {
    // Temporarily use anon client to bypass service role issues
    const client = supabase // Force anon client for testing
    console.log('PHOTO UPLOAD START', { using_anon: true, name: file?.name, size: file?.size, type: file?.type })
    if (!file || file.size === 0) return null
    if (file.size > 10 * 1024 * 1024) return null

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext) return null
    const allowedExt = ['jpg', 'jpeg', 'png', 'heic']
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
    if (!allowedExt.includes(ext) && !allowedMime.includes(file.type.toLowerCase())) return null

    let fileName = `profile-${registrationId}-${Date.now()}.${ext}`
    console.log('Attempting profile photo upload with filename:', fileName)

    // Upload to registration-photos bucket (for profile pictures)
    const { data, error } = await client.storage.from('registration-photos').upload(fileName, file)
    console.log('Profile photo upload result:', { path: data?.path, err: error?.message })
    
    if (error) {
      console.error('Profile photo upload failed:', { msg: error.message, error })
      return null
    }

    if (!data) {
      console.error('No profile photo upload data returned')
      return null
    }

    const { data: pub } = client.storage.from('registration-photos').getPublicUrl(data.path)
    if (!pub?.publicUrl) return null
    console.log('PROFILE PHOTO UPLOAD OK', pub.publicUrl)
    return pub.publicUrl
  } catch (e) {
    console.error('uploadPhoto unexpected error:', e)
    return null
  }
}

// New function for uploading registration transaction screenshots - SIMPLIFIED VERSION
export const uploadRegistrationTransactionScreenshot = async (file: File, registrationId: string): Promise<string | null> => {
  try {
    // Use the same approach as uploadPhoto for consistency
    const client = supabase // Use anonymous client like profile photos
    console.log('REGISTRATION TRANSACTION UPLOAD START', { name: file?.name, size: file?.size, type: file?.type })
    if (!file || file.size === 0) return null
    if (file.size > 10 * 1024 * 1024) return null

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext) return null
    const allowedExt = ['jpg', 'jpeg', 'png']
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedExt.includes(ext) && !allowedMime.includes(file.type.toLowerCase())) return null

    let fileName = `transaction-${registrationId}-${Date.now()}.${ext}`
    // If you created a folder named 'fees' in the bucket, upload under that prefix
    const remotePath = `fees/${fileName}`
    console.log('Attempting registration transaction screenshot upload with remotePath:', remotePath)

    // Upload to membership-fees-ss bucket (used for membership fee screenshots)
    const { data, error } = await client.storage.from('membership-fees-ss').upload(remotePath, file, { cacheControl: '3600', upsert: false })
    console.log('Registration transaction upload result:', { path: data?.path, err: error?.message })
    
    if (error) {
      console.error('Registration transaction upload failed:', { msg: error.message, error })
      return null
    }

    if (!data) {
      console.error('No registration transaction upload data returned')
      return null
    }

    // Try to get a public URL. If bucket is private, fall back to signed URL using service role client.
    const { data: pub } = client.storage.from('membership-fees-ss').getPublicUrl(data.path)
    if (pub?.publicUrl) {
      console.log('REGISTRATION TRANSACTION UPLOAD OK (publicUrl)', pub.publicUrl)
      return pub.publicUrl
    }

    // Fallback: create signed URL (requires service role or server client)
    if (supabaseServer) {
      try {
        const { data: signed, error: sErr } = await supabaseServer.storage.from('membership-fees-ss').createSignedUrl(data.path, 60 * 60)
        if (sErr) {
          console.error('createSignedUrl error:', sErr)
        } else if (signed?.signedURL) {
          console.log('REGISTRATION TRANSACTION UPLOAD OK (signedURL)', signed.signedURL)
          return signed.signedURL
        }
      } catch (e) {
        console.error('createSignedUrl unexpected error:', e)
      }
    }

    console.warn('No public or signed URL available for uploaded file:', data.path)
    return null
  } catch (e) {
    console.error('uploadRegistrationTransactionScreenshot unexpected error:', e)
    return null
  }
}

// New function for uploading donation photos
export const uploadDonationPhoto = async (file: File): Promise<string | null> => {
  try {
    const client = supabase
    console.log('DONATION UPLOAD START', { name: file?.name, size: file?.size, type: file?.type })
    if (!file || file.size === 0) return null
    if (file.size > 10 * 1024 * 1024) return null

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext) return null
    const allowedExt = ['jpg', 'jpeg', 'png']
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedExt.includes(ext) && !allowedMime.includes(file.type.toLowerCase())) return null

    let fileName = `donation-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    console.log('Attempting donation photo upload with filename:', fileName)

    const { data, error } = await client.storage.from('donation-transaction-ss').upload(fileName, file)
    console.log('Donation upload result:', { path: data?.path, err: error?.message })
    
    if (error) {
      console.error('Donation upload failed:', { msg: error.message, error })
      return null
    }

    if (!data) {
      console.error('No donation upload data returned')
      return null
    }

    const { data: pub } = client.storage.from('donation-transaction-ss').getPublicUrl(data.path)
    if (!pub?.publicUrl) return null
    console.log('DONATION UPLOAD OK', pub.publicUrl)
    return pub.publicUrl
  } catch (e) {
    console.error('uploadDonationPhoto unexpected error:', e)
    return null
  }
}

export const createRegistration = async (dataIn: Omit<Registration, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Registration | null, error: any }> => {
  try {
    const client = getServerClient()
    const { data, error } = await client.from('registrations').insert([dataIn]).select().single()
    if (error) console.error('Insert error:', error)
    return { data, error }
  } catch (e) {
    console.error('createRegistration unexpected error:', e)
    return { data: null, error: e }
  }
}

// New function for creating donations
export const createDonation = async (dataIn: Omit<Donation, 'id' | 'created_at'>): Promise<{ data: Donation | null, error: any }> => {
  try {
    const client = getServerClient()
    const { data, error } = await client.from('donations').insert([dataIn]).select().single()
    if (error) console.error('Donation insert error:', error)
    return { data, error }
  } catch (e) {
    console.error('createDonation unexpected error:', e)
    return { data: null, error: e }
  }
}

// New function for creating enquiries
export const createEnquiry = async (dataIn: Omit<Enquiry, 'id' | 'created_at'>): Promise<{ data: Enquiry | null, error: any }> => {
  try {
    const client = getServerClient()
    const { data, error } = await client.from('enquiries').insert([dataIn]).select().single()
    if (error) console.error('Enquiry insert error:', error)
    return { data, error }
  } catch (e) {
    console.error('createEnquiry unexpected error:', e)
    return { data: null, error: e }
  }
}

export const getRegistrations = async (): Promise<{ data: Registration[] | null, error: any }> => {
  try {
    const { data, error } = await getServerClient().from('registrations').select('*').order('created_at', { ascending: false })
    return { data, error }
  } catch (e) {
    console.error('getRegistrations error:', e)
    return { data: null, error: e }
  }
}

// New function for getting donations
export const getDonations = async (): Promise<{ data: Donation[] | null, error: any }> => {
  try {
    const { data, error } = await getServerClient().from('donations').select('*').order('created_at', { ascending: false })
    return { data, error }
  } catch (e) {
    console.error('getDonations error:', e)
    return { data: null, error: e }
  }
}

// New function for getting enquiries
export const getEnquiries = async (): Promise<{ data: Enquiry[] | null, error: any }> => {
  try {
    const { data, error } = await getServerClient().from('enquiries').select('*').order('created_at', { ascending: false })
    return { data, error }
  } catch (e) {
    console.error('getEnquiries error:', e)
    return { data: null, error: e }
  }
}

// New function for getting Goa interest entries
export const getGoaInterest = async (): Promise<{ data: GoaInterest[] | null, error: any }> => {
  try {
    const { data, error } = await getServerClient().from('goa_interest').select('*').order('created_at', { ascending: false })
    return { data, error }
  } catch (e) {
    console.error('getGoaInterest error:', e)
    return { data: null, error: e }
  }
}

export const updatePaymentStatus = async (id: string, status: 'pending' | 'completed' | 'failed'): Promise<{ error: any }> => {
  try {
    const { error } = await getServerClient().from('registrations').update({ payment_status: status }).eq('id', id)
    return { error }
  } catch (e) {
    console.error('updatePaymentStatus error:', e)
    return { error: e }
  }
}