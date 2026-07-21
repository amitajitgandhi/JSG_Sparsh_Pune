import { z } from 'zod'

const indianMobileRegex = /^[6-9]\d{9}$/

export const boxCricketRegistrationSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    mobile_number: z.string().trim().regex(indianMobileRegex, 'Enter a valid Indian mobile number'),
    age: z
      .number({ invalid_type_error: 'Age is required' })
      .int('Age must be a whole number')
      .min(16, 'Only SPARSH members and their kids aged 16+ can register')
      .max(70, 'Age should be less than or equal to 70'),
    category: z.enum(['Member', 'Kid'], { required_error: 'Please select a category' }),
    skillset: z.enum(['Batsman', 'Bowler', 'Allrounder'], { required_error: 'Please select a skillset' }),
    cricketing_skill: z.enum(['Beginner', 'Intermediate', 'Advance', 'Pro'], {
      required_error: 'Please select cricketing skill'
    }),
    cricheroes_link: z
      .string()
      .trim()
      .optional()
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
    payment_method: z.enum(['cash', 'online'], { required_error: 'Please select a payment method' }),
    cash_paid_to: z
      .enum(['Amit Gandhi', 'Mukesh Jain (M. A. Hardware)'])
      .optional(),
    online_paid_to: z
      .enum(['Amit Gandhi', 'Rashmi Gugale'])
      .optional(),
    transaction_reference_number: z.string().trim().optional()
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === 'cash' && !data.cash_paid_to) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cash_paid_to'], message: 'Please select who you paid cash to' })
    }
    if (data.payment_method === 'online') {
      if (!data.online_paid_to) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['online_paid_to'], message: 'Please select who you paid online' })
      }
      if (!data.transaction_reference_number || data.transaction_reference_number.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['transaction_reference_number'],
          message: 'Transaction reference number is required'
        })
      }
    }
  })

export type BoxCricketRegistrationInput = z.infer<typeof boxCricketRegistrationSchema>
