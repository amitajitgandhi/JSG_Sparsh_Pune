export type RegistrationCategory = 'Member' | 'Kid'
export type PlayerSkillset = 'Batsman' | 'Bowler' | 'Allrounder'
export type CricketingSkill = 'Beginner' | 'Intermediate' | 'Advance' | 'Pro'
export type PaymentMethod = 'cash' | 'online'
export type CashPaidTo =
  | 'Amit Gandhi'
  | 'Mukesh Jain (M. A. Hardware)'
export type OnlinePaidTo =
  | 'Amit Gandhi'
  | 'Rashmi Gugale'

export interface BoxCricketRegistrationFormValues {
  name: string
  mobile_number: string
  age: number | ''
  category: RegistrationCategory | ''
  skillset: PlayerSkillset | ''
  cricketing_skill: CricketingSkill | ''
  cricheroes_link: string
  payment_method: PaymentMethod | ''
  cash_paid_to: CashPaidTo | ''
  online_paid_to: OnlinePaidTo | ''
  transaction_reference_number: string
}

export interface BoxCricketRegistrationPayload {
  name: string
  mobile_number: string
  age: number
  category: RegistrationCategory
  skillset: PlayerSkillset
  cricketing_skill: CricketingSkill
  cricheroes_link: string | null
  photo_url: string
  fee_amount: number
  payment_method: PaymentMethod
  cash_paid_to: CashPaidTo | null
  online_paid_to: OnlinePaidTo | null
  transaction_reference_number: string | null
  payment_screenshot_url: string | null
}

export interface FormErrors {
  [key: string]: string
}
