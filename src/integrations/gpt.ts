import { supabase } from '@/integrations/supabase/client'

interface RateCache {
  [key: string]: {
    rate: number
    timestamp: number
  }
}

const rateCache: RateCache = {}
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const DEFAULT_RATE = 75

/**
 * Fetch hourly rate for a role using GPT with caching
 */
export const fetchRateForRole = async (role: string, region: string = 'North America'): Promise<number> => {
  const cacheKey = `${role.toLowerCase()}_${region.toLowerCase()}`
  
  // Check cache first
  if (rateCache[cacheKey] && Date.now() - rateCache[cacheKey].timestamp < CACHE_DURATION) {
    return rateCache[cacheKey].rate
  }

  try {
    const { data, error } = await supabase.functions.invoke('openai-rate-lookup', {
      body: {
        role,
        region
      }
    })

    if (error) {
      throw new Error(`Supabase function error: ${error.message}`)
    }

    const rate = parseFloat(data.rate)
    
    if (isNaN(rate) || rate <= 0) {
      throw new Error('Invalid rate returned from API')
    }

    // Cache the result
    rateCache[cacheKey] = {
      rate,
      timestamp: Date.now()
    }

    return rate
  } catch (error) {
    console.warn(`Failed to fetch rate for ${role} in ${region}:`, error)
    
    // Return cached value if available, otherwise default
    if (rateCache[cacheKey]) {
      return rateCache[cacheKey].rate
    }
    
    return DEFAULT_RATE
  }
}

/**
 * Clear the rate cache (useful for testing)
 */
export const clearRateCache = () => {
  Object.keys(rateCache).forEach(key => delete rateCache[key])
}