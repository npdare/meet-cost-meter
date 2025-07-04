
import { useState, useEffect } from "react"
import { TrendingUp, Coffee, Car, Home, Plane, CheckCircle } from "lucide-react"

interface MilestoneTickerProps {
  totalCost: number
  resetTrigger: number // Add a reset trigger prop
  onMilestoneAchieved?: (milestone: string) => void
}

interface Milestone {
  id: string
  cost: number
  icon: React.ReactNode
  message: string
  timestamp: Date
}

export const MilestoneTicker = ({ totalCost, resetTrigger, onMilestoneAchieved }: MilestoneTickerProps) => {
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
      cost: 15,
      icon: <Coffee className="w-4 h-4" />,
      message: "Expensive latte alert! ☕"
    },
    {
      cost: 25,
      icon: <Coffee className="w-4 h-4" />,
      message: "That's 5 Starbucks coffees! ☕"
    },
    {
      cost: 50,
      icon: <TrendingUp className="w-4 h-4" />,
      message: "Congratulations! You've wasted $50! 🎉"
    },
    {
      cost: 100,
      icon: <Car className="w-4 h-4" />,
      message: "Could've bought groceries for a week! 🛒"
    },
    {
      cost: 150,
      icon: <Home className="w-4 h-4" />,
      message: "Netflix subscription for a YEAR! 📺"
    },
    {
      cost: 200,
      icon: <TrendingUp className="w-4 h-4" />,
      message: "Dinner for two at a fancy restaurant! 🍽️"
    },
    {
      cost: 300,
      icon: <Plane className="w-4 h-4" />,
      message: "Weekend getaway flights! ✈️"
    },
    {
      cost: 500,
      icon: <Home className="w-4 h-4" />,
      message: "Nice hotel for the weekend! 🏨"
    },
    {
      cost: 750,
      icon: <Car className="w-4 h-4" />,
      message: "Monthly car payment territory! 🚗"
    },
    {
      cost: 1000,
      icon: <TrendingUp className="w-4 h-4" />,
      message: "FOUR FIGURES?! Your boss needs to see this! 🤯"
    },
    {
      cost: 1500,
      icon: <Plane className="w-4 h-4" />,
      message: "Round trip to Europe! 🌍"
    },
    {
      cost: 2000,
      icon: <Home className="w-4 h-4" />,
      message: "Someone's getting fired... 😬"
    },
    {
      cost: 3000,
      icon: <Car className="w-4 h-4" />,
      message: "Used car down payment! 🚗"
    },
    {
      cost: 5000,
      icon: <Plane className="w-4 h-4" />,
      message: "Business class around the world! 🌎"
    },
    {
      cost: 10000,
      icon: <Home className="w-4 h-4" />,
      message: "LEGENDARY waste! Frame this screenshot! 🏆"
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
      
      // Notify parent component
      if (onMilestoneAchieved) {
        onMilestoneAchieved(milestone.message)
      }
      
      // Show the popup
      setCurrentMilestone(milestone)
      setShowMilestone(true)
      console.log('Milestone popup shown, setting timers')

      // Use a ref or separate effect for timers to avoid cleanup
      setTimeout(() => {
        console.log('Fading out milestone')
        setShowMilestone(false)
        setTimeout(() => {
          console.log('Clearing milestone')
          setCurrentMilestone(null)
        }, 500)
      }, 3000)
    }
  }, [totalCost, achievedMilestones.length]) // Only depend on length, not the full array

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

    </>
  )
}
