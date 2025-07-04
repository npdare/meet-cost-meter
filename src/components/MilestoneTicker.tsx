
import { useState, useEffect } from "react"
import { TrendingUp, Coffee, Car, Home, Plane, CheckCircle, Clock, Users } from "lucide-react"

interface Attendee {
  id: string
  name: string
  role: string
  hourlyRate: number
}

interface MilestoneTickerProps {
  totalCost: number
  resetTrigger: number
  attendees: Attendee[]
  onMilestoneAchieved?: (milestone: string) => void
}

interface Milestone {
  id: string
  cost: number
  icon: React.ReactNode
  message: string
  timestamp: Date
}

export const MilestoneTicker = ({ totalCost, resetTrigger, attendees, onMilestoneAchieved }: MilestoneTickerProps) => {
  const [achievedMilestones, setAchievedMilestones] = useState<Milestone[]>([])
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null)
  const [showMilestone, setShowMilestone] = useState(false)
  const [achievedCosts, setAchievedCosts] = useState<number[]>([])
  
  // Reset milestones when resetTrigger changes
  useEffect(() => {
    setAchievedMilestones([])
    setCurrentMilestone(null)
    setShowMilestone(false)
    setAchievedCosts([])
  }, [resetTrigger])
  
  // Generate smart milestones based on attendee roles
  const generateMilestones = () => {
    if (attendees.length === 0) return []
    
    const highestPaidAttendee = attendees.reduce((highest, current) => 
      current.hourlyRate > highest.hourlyRate ? current : highest
    )
    
    const lowestPaidAttendee = attendees.reduce((lowest, current) => 
      current.hourlyRate < lowest.hourlyRate ? current : lowest
    )
    
    const avgHourlyRate = attendees.reduce((sum, a) => sum + a.hourlyRate, 0) / attendees.length
    
    return [
      {
        cost: 15,
        icon: <Coffee className="w-4 h-4" />,
        message: "That's a fancy coffee! ☕"
      },
      {
        cost: Math.round(lowestPaidAttendee.hourlyRate * 0.25),
        icon: <Clock className="w-4 h-4" />,
        message: `15 minutes of ${lowestPaidAttendee.name}'s time (${lowestPaidAttendee.role}) ⏰`
      },
      {
        cost: Math.round(lowestPaidAttendee.hourlyRate * 0.5),
        icon: <Coffee className="w-4 h-4" />,
        message: `Half hour of ${lowestPaidAttendee.role} salary burned! 🔥`
      },
      {
        cost: Math.round(lowestPaidAttendee.hourlyRate),
        icon: <TrendingUp className="w-4 h-4" />,
        message: `${lowestPaidAttendee.name} (${lowestPaidAttendee.role}) worked an hour for this! 💸`
      },
      {
        cost: Math.round(avgHourlyRate),
        icon: <Users className="w-4 h-4" />,
        message: `Average team member's hourly salary reached! 📊`
      },
      {
        cost: Math.round(highestPaidAttendee.hourlyRate * 0.5),
        icon: <TrendingUp className="w-4 h-4" />,
        message: `30 minutes of ${highestPaidAttendee.name}'s ${highestPaidAttendee.role} time! 💰`
      },
      {
        cost: Math.round(highestPaidAttendee.hourlyRate),
        icon: <CheckCircle className="w-4 h-4" />,
        message: `${highestPaidAttendee.name} (${highestPaidAttendee.role}) just "worked" an hour! 😅`
      },
      {
        cost: Math.round(avgHourlyRate * 2),
        icon: <TrendingUp className="w-4 h-4" />,
        message: `2 hours of average team productivity lost! ⚠️`
      },
      {
        cost: Math.round(attendees.reduce((sum, a) => sum + a.hourlyRate, 0) * 2),
        icon: <Users className="w-4 h-4" />,
        message: `2 hours of EVERYONE'S time! Meeting efficiency: 📉`
      },
      {
        cost: Math.round(attendees.reduce((sum, a) => sum + a.hourlyRate, 0) * 4),
        icon: <Plane className="w-4 h-4" />,
        message: `Half a work day for the entire team! Time to wrap up? 🚨`
      },
      {
        cost: Math.round(attendees.reduce((sum, a) => sum + a.hourlyRate, 0) * 8),
        icon: <Home className="w-4 h-4" />,
        message: `Full work day salary for EVERYONE! Someone's getting fired... 😬`
      }
    ].sort((a, b) => a.cost - b.cost)
  }

  const milestoneTemplates = generateMilestones()

  useEffect(() => {
    console.log('useEffect triggered, totalCost:', totalCost, 'achievedCosts:', achievedCosts.length)
    
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
      setAchievedCosts(prev => [...prev, milestone.cost])
      
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
  }, [totalCost, achievedCosts.length]) // Only depend on length, not the full array

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
