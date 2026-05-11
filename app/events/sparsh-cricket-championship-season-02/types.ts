export type RegistrationCategory = 'Member' | 'Kid'
export type PlayerSkillset = 'Batsman' | 'Bowler' | 'Allrounder'
export type FullArmBowling = 'Yes' | 'No'
export type CricketingSkill = 'Beginner' | 'Intermediate' | 'Advance' | 'Pro'
export type JerseySize = '3XL - 46' | 'XXL - 44' | 'XL - 42' | 'L - 40' | 'M - 38' | 'S - 36'

export interface SparshCricketRegistrationFormValues {
  name: string
  mobile_number: string
  age: number | ''
  category: RegistrationCategory | ''
  skillset: PlayerSkillset | ''
  fullarm_bowling: FullArmBowling | ''
  cricheroes_link: string
  cricketing_skill: CricketingSkill | ''
  jersey_size: JerseySize | ''
  fees: '₹700'
  transaction_reference_number: string
}

export interface SparshCricketRegistrationPayload {
  name: string
  mobile_number: string
  age: number
  category: RegistrationCategory
  skillset: PlayerSkillset
  fullarm_bowling: FullArmBowling
  cricheroes_link: string | null
  cricketing_skill: CricketingSkill
  jersey_size: JerseySize
  fees: string
  payment_screenshot_url: string
  transaction_reference_number: string
  created_at: string
}

export interface FormErrors {
  [key: string]: string
}
