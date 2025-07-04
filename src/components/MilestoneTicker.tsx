
import { useState, useEffect } from "react"
import { TrendingUp, Coffee, Car, Home, Plane, CheckCircle } from "lucide-react"

interface MilestoneTickerProps {
  totalCost: number
  resetTrigger: number // Add a reset trigger prop
}

interface Milestone {
  id: string
  cost: number
  icon: React.ReactNode
  message: string
  timestamp: Date
}

export const MilestoneTicker = ({ totalCost, resetTrigger }: MilestoneTickerProps) => {
  const [achievedMilestones, setAchievedMilestones] = useState<Milestone[]>([])
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null)
  const [showMilestone, setShowMilestone] = useState(false)
  
  // Reset milestones when resetTrigger changes
  useEffect(() => {
    setAchievedMilestones([])
    setCurrentMilestone(null)
    setShowMilestone(false)
  }, [resetTrigger])
  
  const milestoneTemplates = [
    {
      cost: 25,
      icon: <Coffee className="w-4 h-4" />,
      message: "Cost equals 5 coffee cups ☕"
    },
    {
      cost: 50,
      icon: <TrendingUp className="w-4 h-4" />,
      message: "Meeting cost hits $50! 📈"
    },
    {
      cost: 100,
      icon: <Car className="w-4 h-4" />,
      message: "Could buy a tank of gas! ⛽"
    },
    {
      cost: 200,
      icon: <TrendingUp className="w-4 h-4" />,
      message: "That's $200 in meeting time! 💸"
    },
    {
      cost: 300,
      icon: <Home className="w-4 h-4" />,
      message: "Weekend hotel stay cost reached! 🏨"
    },
    {
      cost: 500,
      icon: <Plane className="w-4 h-4" />,
      message: "Flight ticket cost achieved! ✈️"
    },
    {
      cost: 1000,
      icon: <TrendingUp className="w-4 h-4" />,
      message: "Holy guacamole - $1,000! 🤯"
    },
    {
      cost: 2000,
      icon: <Car className="w-4 h-4" />,
      message: "Could buy a used car! 🚗"
    },
    {
      cost: 3000,
      icon: <Home className="w-4 h-4" />,
      message: "Luxury vacation cost! 🏖️"
    },
    {
      cost: 5000,
      icon: <Plane className="w-4 h-4" />,
      message: "First-class flight around the world! 🌍"
    }
  ]

  useEffect(() => {
    console.log('useEffect triggered, totalCost:', totalCost, 'achievedMilestones:', achievedMilestones.length)
    
    const achievedCosts = achievedMilestones.map(m => m.cost)
    const newMilestone = milestoneTemplates.find(
      template => totalCost >= template.cost && !achievedCosts.includes(template.cost)
    )

    if (newMilestone) {
      console.log('New milestone found:', newMilestone)
      
      const milestone: Milestone = {
        id: Date.now().toString(),
        cost: newMilestone.cost,
        icon: newMilestone.icon,
        message: newMilestone.message,
        timestamp: new Date()
      }

      // Add to achieved list first
      setAchievedMilestones(prev => [milestone, ...prev])
      
      // Show the popup
      setCurrentMilestone(milestone)
      setShowMilestone(true)
      console.log('Milestone popup shown, setting timers')

      // Start fade out after 3 seconds
      const fadeTimer = setTimeout(() => {
        console.log('Fading out milestone')
        setShowMilestone(false)
      }, 3000)

      // Clear milestone after fade animation
      const clearTimer = setTimeout(() => {
        console.log('Clearing milestone')
        setCurrentMilestone(null)
      }, 3500) // 3000ms + 500ms for fade animation

      return () => {
        console.log('Cleaning up timers')
        clearTimeout(fadeTimer)
        clearTimeout(clearTimer)
      }
    }
  }, [totalCost])

  return (
    <>
      {/* Popup Notification */}
      {currentMilestone && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div
            className={`
              bg-black text-white px-8 py-4 rounded-xl shadow-2xl
              flex items-center gap-4 transition-all duration-500 ease-in-out
              min-w-80 max-w-md
              ${showMilestone ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
            `}
          >
            <div className="text-yellow-400 text-lg">
              {currentMilestone.icon}
            </div>
            <span className="font-medium text-base">
              {currentMilestone.message}
            </span>
          </div>
        </div>
      )}

      {/* Achievements List */}
      {achievedMilestones.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-sm text-gray-700">Cost Milestones Achieved</h3>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {achievedMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                <div className="text-green-600">
                  {milestone.icon}
                </div>
                <span className="flex-1">${milestone.cost} - {milestone.message}</span>
                <span className="text-gray-400">
                  {milestone.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
