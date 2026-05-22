import { z } from 'zod'

const indianMobileRegex = /^[6-9]\d{9}$/

export const khelotsavRegistrationSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    mobile: z.string().trim().regex(indianMobileRegex, 'Enter a valid 10-digit Indian mobile number'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['Male', 'Female'], { required_error: 'Please select gender' }),
    category: z.enum(['Member', 'Kid'], { required_error: 'Please select category' }),
    selected_sports: z.array(z.string()).min(1, 'Select at least 1 sport').max(4, 'You can select maximum 4 sports'),
    sport_ratings: z.record(z.number().int().min(1).max(5)),
    transaction_id: z.string().trim().min(6, 'Transaction ID is required').max(40, 'Transaction ID is too long'),
    age: z.number().int().min(1, 'Invalid age')
  })
  .superRefine((value, ctx) => {
    if (value.category === 'Kid' && value.age < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date_of_birth'],
        message: 'Kids below 10 years can attend and enjoy the event, but registration is not required.'
      })
    }

    for (const sport of value.selected_sports) {
      if (!value.sport_ratings[sport]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sport_ratings'],
          message: `Please provide rating for ${sport}`
        })
      }
    }
  })

export type KhelotsavRegistrationInput = z.infer<typeof khelotsavRegistrationSchema>
