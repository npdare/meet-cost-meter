import { RoleQuantityEntry } from '../../components/FreeRoleQuantityList'
import { calculateQuantityCost } from '../../utils/quantityCostCalculations'

describe('Quantity-based Cost Calculations', () => {
  const mockEntries: RoleQuantityEntry[] = [
    {
      id: '1',
      count: 2,
      role: 'Senior Engineer',
      rate: 85
    },
    {
      id: '2', 
      count: 1,
      role: 'Manager',
      rate: 100
    },
    {
      id: '3',
      count: 3,
      role: 'Developer',
      rate: 65
    }
  ]

  it('should calculate cost correctly for multiple quantity entries', () => {
    // Total rate: (2 * 85) + (1 * 100) + (3 * 65) = 170 + 100 + 195 = 465/hr
    // For 1 hour (3600 seconds): 465 * 1 = 465
    const cost = calculateQuantityCost(mockEntries, 3600)
    expect(cost).toBe(465)
  })

  it('should calculate cost correctly for partial hours', () => {
    // For 30 minutes (1800 seconds): 465 * 0.5 = 232.5
    const cost = calculateQuantityCost(mockEntries, 1800)
    expect(cost).toBe(232.5)
  })

  it('should handle single entry', () => {
    const singleEntry: RoleQuantityEntry[] = [
      { id: '1', count: 1, role: 'CEO', rate: 300 }
    ]
    
    // For 2 hours: 300 * 2 = 600
    const cost = calculateQuantityCost(singleEntry, 7200)
    expect(cost).toBe(600)
  })

  it('should return 0 for empty entries', () => {
    expect(calculateQuantityCost([], 3600)).toBe(0)
  })

  it('should return 0 for zero duration', () => {
    expect(calculateQuantityCost(mockEntries, 0)).toBe(0)
  })

  it('should return 0 for negative duration', () => {
    expect(calculateQuantityCost(mockEntries, -1000)).toBe(0)
  })

  it('should handle entries with zero rate', () => {
    const entriesWithZero: RoleQuantityEntry[] = [
      { id: '1', count: 2, role: 'Intern', rate: 0 },
      { id: '2', count: 1, role: 'Manager', rate: 100 }
    ]
    
    // Total rate: (2 * 0) + (1 * 100) = 100/hr
    const cost = calculateQuantityCost(entriesWithZero, 3600)
    expect(cost).toBe(100)
  })

  it('should handle fractional rates', () => {
    const entriesWithFractions: RoleQuantityEntry[] = [
      { id: '1', count: 1, role: 'Consultant', rate: 87.5 },
      { id: '2', count: 2, role: 'Freelancer', rate: 62.25 }
    ]
    
    // Total rate: 87.5 + (2 * 62.25) = 87.5 + 124.5 = 212/hr
    const cost = calculateQuantityCost(entriesWithFractions, 3600)
    expect(cost).toBe(212)
  })

  it('should round to 2 decimal places', () => {
    const entries: RoleQuantityEntry[] = [
      { id: '1', count: 3, role: 'Developer', rate: 33.33 }
    ]
    
    // Total rate: 3 * 33.33 = 99.99/hr
    // For 10 minutes (600 seconds): 99.99 * (600/3600) = 99.99 * 0.1667 = 16.665
    const cost = calculateQuantityCost(entries, 600)
    expect(cost).toBe(16.67) // Rounded to 2 decimal places
  })
})