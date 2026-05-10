import { z } from 'zod'

const indianMobileRegex = /^[6-9]\d{9}$/

export const sparshCricketRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  mobile_number: z.string().trim().regex(indianMobileRegex, 'Enter a valid Indian mobile number'),
  age: z
    .number({ invalid_type_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(8, 'Age should be at least 8')
    .max(70, 'Age should be less than or equal to 70'),
  category: z.enum(['Member', 'Kid'], { required_error: 'Please select a category' }),
  skillset: z.enum(['Batsman', 'Bowler', 'Allrounder'], { required_error: 'Please select a skillset' }),
  fullarm_bowling: z.enum(['Yes', 'No'], { required_error: 'Please select an option' }),
  cricheroes_link: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => v ?? '')
    .refine(
      (value) => {
        if (!value) return true
        try {
          const url = new URL(value)
          return url.protocol === 'http:' || url.protocol === 'https:'
        } catch {
          return false
        }
      },
      { message: 'Enter a valid URL' }
    ),
  cricketing_skill: z.enum(['Beginner', 'Intermediate', 'Advance', 'Pro'], {
    required_error: 'Please select cricketing skill'
  }),
  fees: z.literal('₹700'),
  transaction_reference_number: z
    .string()
    .trim()
    .min(6, 'Transaction reference number is required')
    .max(40, 'Transaction reference number is too long')
})

export type SparshCricketRegistrationInput = z.infer<typeof sparshCricketRegistrationSchema>
