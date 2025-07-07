import { RoleQuantityEntry } from '../components/FreeRoleQuantityList'

/**
 * Calculate total cost from quantity-based entries
 */
export const calculateQuantityCost = (
  entries: RoleQuantityEntry[], 
  durationSeconds: number
): number => {
  if (durationSeconds <= 0 || !entries.length) return 0
  
  const totalHourlyRate = entries.reduce((sum, entry) => {
    return sum + (entry.count * entry.rate)
  }, 0)
  
  const hours = durationSeconds / 3600
  const cost = totalHourlyRate * hours
  
  return Math.round(cost * 100) / 100
}