export interface Attendee {
  id: string
  name: string
  role: string
  hourlyRate: number
  email?: string
}

export interface Meeting {
  id: string
  title: string
  duration_seconds: number
  total_cost: number
  attendee_count: number
  attendees: Attendee[]
  milestones: string[]
  created_at: string
}