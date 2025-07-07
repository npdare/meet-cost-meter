import { calculateCost, validateAttendee, validateAttendeeEmail } from '../../utils/costCalculations'
import { Attendee } from '../../types'

describe('costCalculations', () => {
  const mockAttendees: Attendee[] = [
    { id: '1', name: 'John Doe', role: 'Developer', hourlyRate: 100 },
    { id: '2', name: 'Jane Smith', role: 'Manager', hourlyRate: 150 },
  ]

  describe('calculateCost', () => {
    it('should calculate cost correctly for positive duration', () => {
      const cost = calculateCost(mockAttendees, 3600) // 1 hour
      expect(cost).toBe(250) // 100 + 150 = 250
    })

    it('should return 0 for zero duration', () => {
      const cost = calculateCost(mockAttendees, 0)
      expect(cost).toBe(0)
    })

    it('should return 0 for negative duration', () => {
      const cost = calculateCost(mockAttendees, -100)
      expect(cost).toBe(0)
    })

    it('should return 0 for non-finite duration', () => {
      const cost = calculateCost(mockAttendees, NaN)
      expect(cost).toBe(0)
    })

    it('should return 0 when all attendees have zero hourly rate', () => {
      const zeroRateAttendees: Attendee[] = [
        { id: '1', name: 'John Doe', role: 'Intern', hourlyRate: 0 },
      ]
      const cost = calculateCost(zeroRateAttendees, 3600)
      expect(cost).toBe(0)
    })

    it('should round cost to two decimal places', () => {
      const attendees: Attendee[] = [
        { id: '1', name: 'John Doe', role: 'Developer', hourlyRate: 33.33 },
      ]
      const cost = calculateCost(attendees, 60) // 1 minute
      expect(cost).toBe(0.56) // 33.33/60 = 0.5555... rounded to 0.56
    })

    it('should handle bill by minute option', () => {
      const cost = calculateCost(mockAttendees, 30, { billByMinute: true }) // 30 seconds
      const expectedCost = calculateCost(mockAttendees, 60) // Should bill for full minute
      expect(cost).toBe(expectedCost)
    })

    it('should not round up when bill by minute is false', () => {
      const cost30sec = calculateCost(mockAttendees, 30, { billByMinute: false })
      const cost60sec = calculateCost(mockAttendees, 60, { billByMinute: false })
      expect(cost30sec).toBeLessThan(cost60sec)
    })

    it('should handle zero seconds with bill by minute', () => {
      const cost = calculateCost(mockAttendees, 0, { billByMinute: true })
      expect(cost).toBe(0)
    })

    it('should calculate cost for fractional hours correctly', () => {
      const cost = calculateCost(mockAttendees, 1800) // 30 minutes = 0.5 hours
      expect(cost).toBe(125) // (100 + 150) * 0.5 = 125
    })
  })

  describe('validateAttendee', () => {
    it('should return valid attendee unchanged', () => {
      const attendee: Attendee = { id: '1', name: 'John', role: 'Dev', hourlyRate: 100 }
      const result = validateAttendee(attendee)
      expect(result).toEqual(attendee)
    })

    it('should throw error for negative hourly rate', () => {
      const attendee: Attendee = { id: '1', name: 'John', role: 'Dev', hourlyRate: -50 }
      expect(() => validateAttendee(attendee)).toThrow('Invalid hourly rate for John: cannot be negative')
    })

    it('should handle zero hourly rate without throwing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const attendee: Attendee = { id: '1', name: 'John', role: 'Dev', hourlyRate: 0 }
      const result = validateAttendee(attendee)
      expect(result.hourlyRate).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('Warning: John has zero hourly rate')
      consoleSpy.mockRestore()
    })

    it('should sanitize invalid hourly rate to zero', () => {
      const attendee: Attendee = { id: '1', name: 'John', role: 'Dev', hourlyRate: NaN }
      const result = validateAttendee(attendee)
      expect(result.hourlyRate).toBe(0)
    })
  })

  describe('validateAttendeeEmail', () => {
    const existingAttendees: Attendee[] = [
      { id: '1', name: 'John', role: 'Dev', hourlyRate: 100, email: 'john@example.com' },
      { id: '2', name: 'Jane', role: 'Manager', hourlyRate: 150, email: 'jane@example.com' },
    ]

    it('should allow unique email', () => {
      expect(() => validateAttendeeEmail(existingAttendees, 'new@example.com')).not.toThrow()
    })

    it('should throw error for duplicate email', () => {
      expect(() => validateAttendeeEmail(existingAttendees, 'john@example.com'))
        .toThrow('An attendee with this email already exists')
    })

    it('should handle case insensitive comparison', () => {
      expect(() => validateAttendeeEmail(existingAttendees, 'JOHN@EXAMPLE.COM'))
        .toThrow('An attendee with this email already exists')
    })

    it('should handle email with extra whitespace', () => {
      expect(() => validateAttendeeEmail(existingAttendees, '  john@example.com  '))
        .toThrow('An attendee with this email already exists')
    })

    it('should ignore attendees without email', () => {
      const attendeesWithoutEmail: Attendee[] = [
        { id: '1', name: 'John', role: 'Dev', hourlyRate: 100 },
      ]
      expect(() => validateAttendeeEmail(attendeesWithoutEmail, 'test@example.com')).not.toThrow()
    })
  })
})