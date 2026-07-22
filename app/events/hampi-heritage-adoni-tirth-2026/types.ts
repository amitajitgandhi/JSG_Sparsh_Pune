export type TravelMode = 'Own Transportation' | 'Bus' | 'AC Train' | 'Sleeper Train'

export interface HampiRegistrationFormValues {
  primary_name: string
  mobile_number: string
  adult_count: number | ''
  child_above8_count: number | ''
  child_5_to_8_count: number | ''
  child_below5_count: number | ''
  travel_mode: TravelMode | ''
  // Only relevant when child_below5_count > 0 - a below-5 child rides free without a dedicated
  // seat/berth by default; tick this if the family wants a separate seat booked for them anyway.
  below5_needs_seat: boolean
  notes: string
}

export interface HampiRegistrationPayload {
  primary_name: string
  mobile_number: string
  adult_count: number
  child_above8_count: number
  child_5_to_8_count: number
  child_below5_count: number
  travel_mode: TravelMode
  below5_needs_seat: boolean
  notes: string | null
}

export interface FormErrors {
  [key: string]: string
}
