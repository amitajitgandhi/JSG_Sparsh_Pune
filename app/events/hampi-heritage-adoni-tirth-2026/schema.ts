import { z } from 'zod'

const indianMobileRegex = /^[6-9]\d{9}$/
const countField = z
  .number({ invalid_type_error: 'Enter a number (0 if none)' })
  .int('Must be a whole number')
  .min(0, 'Cannot be negative')

export const hampiRegistrationSchema = z
  .object({
    primary_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    mobile_number: z.string().trim().regex(indianMobileRegex, 'Enter a valid Indian mobile number'),
    adult_count: countField,
    child_above8_count: countField,
    child_5_to_8_count: countField,
    child_below5_count: countField,
    travel_mode: z.enum(['Own Transportation', 'Bus', 'AC Train', 'Sleeper Train'], {
      required_error: 'Please select a travel mode'
    }),
    below5_needs_seat: z.boolean().optional().default(false),
    notes: z.string().trim().optional()
  })
  .superRefine((data, ctx) => {
    const total = data.adult_count + data.child_above8_count + data.child_5_to_8_count + data.child_below5_count
    if (total < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['adult_count'], message: 'Add at least one family member' })
    }
    if (data.adult_count < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['adult_count'],
        message: 'At least one adult is required per family/group registration'
      })
    }
  })

export type HampiRegistrationInput = z.infer<typeof hampiRegistrationSchema>
