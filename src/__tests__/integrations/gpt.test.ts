import { fetchRateForRole, clearRateCache } from '../../integrations/gpt'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('GPT Integration', () => {
  beforeEach(() => {
    clearRateCache()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchRateForRole', () => {
    it('should fetch rate successfully and return number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rate: 85 })
      } as Response)

      const rate = await fetchRateForRole('Senior Engineer', 'North America')
      
      expect(rate).toBe(85)
      expect(mockFetch).toHaveBeenCalledWith('https://qubtwlzumrbeltbrcvgn.supabase.co/functions/v1/openai-rate-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'Senior Engineer',
          region: 'North America'
        }),
      })
    })

    it('should use cached rate when available', async () => {
      // First call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rate: 90 })
      } as Response)

      const rate1 = await fetchRateForRole('Manager', 'Europe')
      
      // Second call should use cache
      const rate2 = await fetchRateForRole('Manager', 'Europe')
      
      expect(rate1).toBe(90)
      expect(rate2).toBe(90)
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only called once due to caching
    })

    it('should return default rate on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const rate = await fetchRateForRole('Unknown Role', 'Mars')
      
      expect(rate).toBe(75) // DEFAULT_RATE
    })

    it('should return default rate on invalid response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rate: 'invalid' })
      } as Response)

      const rate = await fetchRateForRole('Test Role', 'Test Region')
      
      expect(rate).toBe(75) // DEFAULT_RATE
    })

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const rate = await fetchRateForRole('CEO', 'North America')
      
      expect(rate).toBe(75) // DEFAULT_RATE
    })

    it('should cache rates for 30 minutes', async () => {
      jest.useFakeTimers()
      
      // First call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rate: 100 })
      } as Response)

      await fetchRateForRole('Director', 'Asia Pacific')
      
      // Advance time by 25 minutes (should still use cache)
      jest.advanceTimersByTime(25 * 60 * 1000)
      
      await fetchRateForRole('Director', 'Asia Pacific')
      expect(mockFetch).toHaveBeenCalledTimes(1)
      
      // Advance time by another 10 minutes (should expire cache)
      jest.advanceTimersByTime(10 * 60 * 1000)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rate: 110 })
      } as Response)
      
      const rate = await fetchRateForRole('Director', 'Asia Pacific')
      expect(rate).toBe(110)
      expect(mockFetch).toHaveBeenCalledTimes(2)
      
      jest.useRealTimers()
    })
  })
})