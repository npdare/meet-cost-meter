import { useState, useEffect } from "react"
import { TrendingUp, Coffee, Car, Home, Plane } from "lucide-react"

interface MilestoneTickerProps {
  totalCost: number
}

interface Milestone {
  cost: number
  icon: React.ReactNode
  message: string
  achieved: boolean
}

export const MilestoneTicker = ({ totalCost }: MilestoneTickerProps) => {
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null)
  const [showMilestone, setShowMilestone] = useState(false)
  
  const milestones: Milestone[] = [
    {
      cost: 25,
      icon: <Coffee className="w-5 h-5" />,
      message: "Cost equals 5 coffee cups ☕",
      achieved: false
    },
    {
      cost: 50,
      icon: <TrendingUp className="w-5 h-5" />,
      message: "Meeting cost hits $50! 📈",
      achieved: false
    },
    {
      cost: 100,
      icon: <Car className="w-5 h-5" />,
      message: "Could buy a tank of gas! ⛽",
      achieved: false
    },
    {
      cost: 200,
      icon: <TrendingUp className="w-5 h-5" />,
      message: "That's $200 in meeting time! 💸",
      achieved: false
    },
    {
      cost: 300,
      icon: <Home className="w-5 h-5" />,
      message: "Weekend hotel stay cost reached! 🏨",
      achieved: false
    },
    {
      cost: 500,
      icon: <Plane className="w-5 h-5" />,
      message: "Flight ticket cost achieved! ✈️",
      achieved: false
    }
  ]

  useEffect(() => {
    const achievedMilestone = milestones.find(
      milestone => totalCost >= milestone.cost && !milestone.achieved
    )

    if (achievedMilestone) {
      achievedMilestone.achieved = true
      setCurrentMilestone(achievedMilestone)
      setShowMilestone(true)

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        setShowMilestone(false)
        setTimeout(() => setCurrentMilestone(null), 300)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [totalCost])

  if (!currentMilestone) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`
          bg-black text-white px-6 py-3 rounded-lg shadow-lg
          flex items-center gap-3 transition-all duration-500
          ${showMilestone ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        `}
      >
        <div className="text-yellow-400">
          {currentMilestone.icon}
        </div>
        <span className="font-medium text-sm">
          {currentMilestone.message}
        </span>
      </div>
    </div>
  )
}