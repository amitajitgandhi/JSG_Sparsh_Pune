export type Gender = 'Male' | 'Female'
export type Category = 'Member' | 'Kid'

export interface KhelotsavRegistrationFormValues {
  name: string
  mobile: string
  date_of_birth: string
  gender: Gender | ''
  category: Category | ''
  selected_sports: string[]
  sport_ratings: Record<string, number>
  transaction_id: string
}

export interface KhelotsavRegistrationPayload {
  event_name: string
  name: string
  mobile: string
  date_of_birth: string
  age: number
  gender: Gender
  category: Category
  selected_sports: string[]
  sport_ratings: Record<string, number>
  fee_amount: number
  is_refundable: boolean
  transaction_id: string
  payment_screenshot_url: string
  created_at: string
}

export interface FormErrors {
  [key: string]: string
}
