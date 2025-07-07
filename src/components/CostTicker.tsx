import { useEffect, useState } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
import { useIsMobile } from '@/hooks/use-mobile'

interface CostTickerProps {
  cost: number
  isRunning?: boolean
  className?: string
}

export const CostTicker = ({ cost, isRunning = false, className = "" }: CostTickerProps) => {
  const { formatCurrency } = useCurrency()
  const [displayCost, setDisplayCost] = useState(cost)
  const [isAnimating, setIsAnimating] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (cost !== displayCost) {
      setIsAnimating(true)
      // Smooth transition to new cost
      const duration = 200
      const steps = 10
      const stepValue = (cost - displayCost) / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        if (currentStep >= steps) {
          setDisplayCost(cost)
          setIsAnimating(false)
          clearInterval(interval)
        } else {
          setDisplayCost(prev => prev + stepValue)
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [cost, displayCost])

  const getCostColor = () => {
    if (cost === 0) return 'text-muted-foreground'
    if (cost < 50) return 'text-emerald-600'
    if (cost < 150) return 'text-yellow-600'
    if (cost < 300) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <span 
      className={`${isMobile ? 'text-3xl' : 'text-6xl'} font-mono font-bold tracking-wider transition-all duration-200 ${getCostColor()} ${
        isAnimating ? 'scale-105' : ''
      } ${isRunning ? 'animate-pulse-glow' : ''}`}
      style={{ fontFamily: 'Courier New, monospace' }}
    >
      {formatCurrency(displayCost)}
    </span>
  )
}