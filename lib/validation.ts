import { z } from 'zod'

export const dateParts = z.object({
  day: z.string().min(1, 'Day required'),
  month: z.string().min(1, 'Month required'),
  year: z.string().min(1, 'Year required'),
})

export const childSchema = z.object({
  name: z.string().min(1, 'Child name required'),
  gender: z.enum(['Male','Female'], { required_error: 'Gender required' }),
  school: z.string().min(1, 'School required'),
  other_school: z.string().optional(),
  dob: dateParts,
}).refine((val) => val.school !== 'Other' ? true : !!val.other_school?.trim(), { path: ['other_school'], message: 'Other school required' })

export const membershipSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  residential_address: z.string().min(1, 'Address is required'),
  wedding_date: dateParts,
  dob: dateParts,
  whatsapp_number: z.string().regex(/^\d{10}$/,'WhatsApp number must be 10 digits'),

  spouse_full_name: z.string().min(1, 'Spouse name is required'),
  spouse_dob: dateParts,
  spouse_whatsapp: z.string().regex(/^\d{10}$/,'WhatsApp number must be 10 digits'),

  number_of_children: z.number().min(0).max(3),
  children: z.array(childSchema).max(3),
  membership_type: z.enum(['OLD_MEMBER','NEW_MEMBER']),
  payment_type: z.enum(['CASH','ONLINE']).nullable().optional(),
  // Optional payment fields
  transaction_id: z.string().nullable().optional(),
  transaction_screenshot_url: z.string().nullable().optional(),
})

export type MembershipInput = z.infer<typeof membershipSchema>