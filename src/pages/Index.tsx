import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Square, Plus, X, Users, DollarSign, Clock } from "lucide-react"
import { MilestoneTicker } from "@/components/MilestoneTicker"
import { MeetingReportCard } from "@/components/MeetingReportCard"

interface Attendee {
  id: string
  name: string
  role: string
  hourlyRate: number
}

const Index = () => {
  const [time, setTime] = useState(0) // time in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [newAttendeeName, setNewAttendeeName] = useState("")
  const [newAttendeeRole, setNewAttendeeRole] = useState("")
  const [newAttendeeRate, setNewAttendeeRate] = useState("")
  const [resetCounter, setResetCounter] = useState(0) // Add reset counter for milestones
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([])

  // Role-based hourly rates
  const roleRates: Record<string, number> = {
    "CEO": 300,
    "CTO": 250,
    "VP": 200,
    "Director": 150,
    "Senior Manager": 120,
    "Manager": 100,
    "Senior Developer": 85,
    "Developer": 65,
    "Junior Developer": 45,
    "Designer": 70,
    "Product Manager": 90,
    "Data Analyst": 75,
    "Marketing": 60,
    "Sales": 55,
    "HR": 50,
    "Admin": 35,
    "Intern": 20,
    "Consultant": 125,
    "Contractor": 80
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    const totalHourlyRate = attendees.reduce((sum, attendee) => sum + attendee.hourlyRate, 0)
    const hoursElapsed = time / 3600
    return totalHourlyRate * hoursElapsed
  }

  // Timer controls
  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setIsRunning(false)
    setTime(0)
    setResetCounter(prev => prev + 1) // Trigger milestone reset
    setAchievedMilestones([])
  }

  // Handle role change and auto-populate rate
  const handleRoleChange = (role: string) => {
    setNewAttendeeRole(role)
    if (roleRates[role]) {
      setNewAttendeeRate(roleRates[role].toString())
    }
  }

  // Attendee management
  const addAttendee = () => {
    if (newAttendeeName.trim() && newAttendeeRole.trim() && newAttendeeRate.trim()) {
      const newAttendee: Attendee = {
        id: Date.now().toString(),
        name: newAttendeeName.trim(),
        role: newAttendeeRole.trim(),
        hourlyRate: Number.parseFloat(newAttendeeRate),
      }
      setAttendees([...attendees, newAttendee])
      setNewAttendeeName("")
      setNewAttendeeRole("")
      setNewAttendeeRate("")
    }
  }

  const removeAttendee = (id: string) => {
    setAttendees(attendees.filter((attendee) => attendee.id !== id))
  }

  const totalCost = calculateTotalCost()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Meter</h1>
          <p className="text-gray-600">Track meeting duration and calculate real-time costs</p>
        </div>

        {/* Timer Display */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Meeting Duration</span>
              </div>
              <div className="text-6xl font-mono font-bold text-gray-900 tracking-wider">{formatTime(time)}</div>
              <div className="flex justify-center gap-3">
                {!isRunning ? (
                  <Button onClick={startTimer} size="lg" className="gap-2 bg-black text-white hover:bg-gray-800">
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" className="gap-2 bg-black text-white hover:bg-gray-800">
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="lg" className="gap-2 bg-black text-white hover:bg-gray-800">
                  <Square className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cost Display */}
          <Card className="min-h-96 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Meeting Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center space-y-3 mb-4">
                <div className="text-4xl font-bold text-green-600">${totalCost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">
                  {attendees.length} attendee{attendees.length !== 1 ? "s" : ""} • $
                  {attendees.reduce((sum, a) => sum + a.hourlyRate, 0).toFixed(2)}/hour total
                </div>
              </div>
              
              {/* Cost Breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-sm font-medium text-gray-900">${(totalCost / Math.max(time / 60, 1)).toFixed(2)}</div>
                  <div className="text-xs text-gray-600">per minute</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-sm font-medium text-gray-900">${(totalCost / Math.max(time, 1)).toFixed(4)}</div>
                  <div className="text-xs text-gray-600">per second</div>
                </div>
              </div>
              
              {/* Milestones Achieved */}
              {achievedMilestones.length > 0 && (
                <div className="flex-1 min-h-0">
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Cost Milestones</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {achievedMilestones.slice(0, 5).map((milestone, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                          {milestone}
                        </div>
                      ))}
                      {achievedMilestones.length > 5 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{achievedMilestones.length - 5} more achievements
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees Management */}
          <Card className="min-h-96 flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {/* Add Attendee Form */}
              <div className="flex-shrink-0 space-y-3 mb-4">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <Label htmlFor="name" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter name"
                      value={newAttendeeName}
                      onChange={(e) => setNewAttendeeName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addAttendee()}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-xs">
                      Role
                    </Label>
                    <select
                      id="role"
                      value={newAttendeeRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full h-8 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select role</option>
                      {Object.keys(roleRates).map((role) => (
                        <option key={role} value={role}>
                          {role} (${roleRates[role]}/hr)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="rate" className="text-xs">
                      Rate ($)
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="Auto-filled"
                      value={newAttendeeRate}
                      onChange={(e) => setNewAttendeeRate(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addAttendee()}
                      className="h-8"
                    />
                  </div>
                </div>
                <Button onClick={addAttendee} className="w-full gap-2 bg-black text-white hover:bg-gray-800 h-8" size="sm">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Attendees List - Flexible height with proper scrolling */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-2">
                  {attendees.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium mb-1">No attendees yet</p>
                      <p className="text-xs">Add people to start tracking meeting costs</p>
                    </div>
                  ) : (
                    attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{attendee.name}</div>
                          <div className="text-gray-600 truncate">{attendee.role}</div>
                          <div className="text-gray-500">${attendee.hourlyRate}/hr</div>
                        </div>
                        <Button
                          onClick={() => removeAttendee(attendee.id)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        {attendees.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{attendees.length}</div>
                  <div className="text-sm text-gray-600">Attendees</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${attendees.reduce((sum, a) => sum + a.hourlyRate, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Cost per Hour</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(totalCost / Math.max(time / 60, 1)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Cost per Minute</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <MilestoneTicker 
          totalCost={totalCost} 
          resetTrigger={resetCounter}
          onMilestoneAchieved={(milestone) => setAchievedMilestones(prev => [milestone, ...prev])}
        />
        
        {time > 0 && (
          <MeetingReportCard 
            totalCost={totalCost}
            duration={time}
            attendeeCount={attendees.length}
            milestones={achievedMilestones}
            attendees={attendees}
          />
        )}
      </div>
    </div>
  )
}

export default Index
