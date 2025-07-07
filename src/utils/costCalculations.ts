import { Attendee } from "../types"

export interface CostCalculationOptions {
  billByMinute?: boolean
}

/**
 * Validates an attendee and returns sanitized data
 */
export const validateAttendee = (attendee: Attendee): Attendee => {
  const hourlyRate = Number(attendee.hourlyRate) || 0
  
  if (hourlyRate < 0) {
    throw new Error(`Invalid hourly rate for ${attendee.name}: cannot be negative`)
  }
  
  if (hourlyRate === 0) {
    console.warn(`Warning: ${attendee.name} has zero hourly rate`)
  }
  
  return {
    ...attendee,
    hourlyRate: Math.max(0, hourlyRate) // Ensure non-negative
  }
}

/**
 * Validates attendee email uniqueness
 */
export const validateAttendeeEmail = (attendees: Attendee[], newEmail: string): void => {
  const existingEmails = attendees
    .map(a => a.email?.toLowerCase().trim())
    .filter(Boolean)
  
  if (existingEmails.includes(newEmail.toLowerCase().trim())) {
    throw new Error('An attendee with this email already exists')
  }
}

/**
 * Calculates meeting cost with validation and options
 */
export const calculateCost = (
  attendees: Attendee[], 
  seconds: number, 
  options: CostCalculationOptions = {}
): number => {
  // Validate duration
  if (seconds < 0 || !Number.isFinite(seconds)) {
    return 0
  }
  
  // Validate and sanitize attendees
  const validAttendees = attendees.map(validateAttendee)
  const totalHourlyRate = validAttendees.reduce((sum, attendee) => sum + attendee.hourlyRate, 0)
  
  if (totalHourlyRate === 0) {
    return 0
  }
  
  // Calculate billable time
  let billableSeconds = seconds
  if (options.billByMinute && seconds > 0) {
    // Round up to next full minute
    billableSeconds = Math.ceil(seconds / 60) * 60
  }
  
  const hoursElapsed = billableSeconds / 3600
  const cost = totalHourlyRate * hoursElapsed
  
  // Round to two decimal places
  return Math.round(cost * 100) / 100
}