export type RegistrationCategory = 'Member' | 'Kid'
export type PlayerSkillset = 'Batsman' | 'Bowler' | 'Allrounder'
export type FullArmBowling = 'Yes' | 'No'
export type CricketingSkill = 'Beginner' | 'Intermediate' | 'Advance' | 'Pro'

export interface SparshCricketRegistrationFormValues {
  name: string
  mobile_number: string
  age: number | ''
  category: RegistrationCategory | ''
  skillset: PlayerSkillset | ''
  fullarm_bowling: FullArmBowling | ''
  cricheroes_link: string
  cricketing_skill: CricketingSkill | ''
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
  fees: string
  payment_screenshot_url: string
  transaction_reference_number: string
  created_at: string
}

export interface FormErrors {
  [key: string]: string
}
