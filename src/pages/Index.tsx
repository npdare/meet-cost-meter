import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Square, Plus, X, Users, DollarSign, Clock } from "lucide-react"
import { MilestoneTicker } from "@/components/MilestoneTicker"

interface Attendee {
  id: string
  name: string
  hourlyRate: number
}

const Index = () => {
  const [time, setTime] = useState(0) // time in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [newAttendeeName, setNewAttendeeName] = useState("")
  const [newAttendeeRate, setNewAttendeeRate] = useState("")

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
  }

  // Attendee management
  const addAttendee = () => {
    if (newAttendeeName.trim() && newAttendeeRate.trim()) {
      const newAttendee: Attendee = {
        id: Date.now().toString(),
        name: newAttendeeName.trim(),
        hourlyRate: Number.parseFloat(newAttendeeRate),
      }
      setAttendees([...attendees, newAttendee])
      setNewAttendeeName("")
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Meeting Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-green-600">${totalCost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">
                  {attendees.length} attendee{attendees.length !== 1 ? "s" : ""} • $
                  {attendees.reduce((sum, a) => sum + a.hourlyRate, 0).toFixed(2)}/hour total
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Attendee Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate" className="text-xs">
                      Hourly Rate ($)
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="0.00"
                      value={newAttendeeRate}
                      onChange={(e) => setNewAttendeeRate(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addAttendee()}
                    />
                  </div>
                </div>
                <Button onClick={addAttendee} className="w-full gap-2 bg-black text-white hover:bg-gray-800" size="sm">
                  <Plus className="w-4 h-4" />
                  Add Attendee
                </Button>
              </div>

              {/* Attendees List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attendees.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No attendees added yet</p>
                  </div>
                ) : (
                  attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{attendee.name}</div>
                        <div className="text-xs text-gray-600">${attendee.hourlyRate.toFixed(2)}/hour</div>
                      </div>
                      <Button
                        onClick={() => removeAttendee(attendee.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
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
      </div>
      
      <MilestoneTicker totalCost={totalCost} />
    </div>
  )
}

export default Index
