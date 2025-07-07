import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Square, Plus, X, Users, DollarSign, Clock, Timer, TrendingUp } from "lucide-react"
import { MilestoneTicker } from "@/components/MilestoneTicker"
import { MeetingReportCard } from "@/components/MeetingReportCard"
import { AdBanner } from "@/components/AdBanner"
import { ThemeToggle } from "@/components/ThemeToggle"
import { PremiumGate } from "@/components/PremiumGate"
import { MeetingHistory, saveMeeting } from "@/components/MeetingHistory"
import { CalendarIntegration } from "@/components/CalendarIntegration"
import { FeedbackDialog } from "@/components/FeedbackDialog"
import { CostTicker } from "@/components/CostTicker"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Attendee } from "@/types"
import { calculateCost, validateAttendeeEmail } from "@/utils/costCalculations"

const Index = () => {
  const [time, setTime] = useState(0) // time in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [newAttendeeName, setNewAttendeeName] = useState("")
  const [newAttendeeRole, setNewAttendeeRole] = useState("")
  const [newAttendeeRate, setNewAttendeeRate] = useState("")
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("")
  const [billByMinute, setBillByMinute] = useState(false)
  const [resetCounter, setResetCounter] = useState(0) // Add reset counter for milestones
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([])
  const { user, isPremium } = useAuth()
  const { toast } = useToast()

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

  // Calculate total cost using hardened calculation
  const totalCost = calculateCost(attendees, time, { billByMinute })

  // Timer controls
  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setIsRunning(false)
    setTime(0)
    setResetCounter(prev => prev + 1) // Trigger milestone reset
    setAchievedMilestones([])
  }

  const saveMeetingData = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save meeting data",
        variant: "destructive",
      })
      return
    }

    const meetingTitle = `Meeting ${new Date().toLocaleDateString()}`
    const result = await saveMeeting(meetingTitle, time, totalCost, attendees, achievedMilestones)
    
    if (result.success) {
      toast({
        title: "Meeting saved!",
        description: "Your meeting data has been saved successfully",
      })
    } else {
      toast({
        title: "Error saving meeting",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // Handle role change and auto-populate rate
  const handleRoleChange = (role: string) => {
    setNewAttendeeRole(role)
    if (roleRates[role]) {
      setNewAttendeeRate(roleRates[role].toString())
    }
  }

  // Attendee management with validation
  const addAttendee = () => {
    if (newAttendeeName.trim() && newAttendeeRole.trim() && newAttendeeRate.trim()) {
      try {
        // Validate email uniqueness if provided
        if (newAttendeeEmail.trim()) {
          validateAttendeeEmail(attendees, newAttendeeEmail.trim())
        }

        const newAttendee: Attendee = {
          id: Date.now().toString(),
          name: newAttendeeName.trim(),
          role: newAttendeeRole.trim(),
          hourlyRate: Number.parseFloat(newAttendeeRate),
          email: newAttendeeEmail.trim() || undefined,
        }
        
        setAttendees([...attendees, newAttendee])
        setNewAttendeeName("")
        setNewAttendeeRole("")
        setNewAttendeeRate("")
        setNewAttendeeEmail("")
        
        toast({
          title: "Attendee added",
          description: `${newAttendee.name} has been added to the meeting`,
        })
      } catch (error: any) {
        toast({
          title: "Error adding attendee",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const removeAttendee = (id: string) => {
    setAttendees(attendees.filter((attendee) => attendee.id !== id))
  }

  

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Timer className="w-6 h-6 text-primary" />
              <span className="font-poppins font-bold text-xl text-foreground">Could Be An Email</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
                {isPremium && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Premium</span>
                )}
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            <FeedbackDialog />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div className="text-center space-y-3 animate-fade-in pt-6">
          <h1 className="text-4xl font-poppins font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight py-2">
            Could Be An Email
          </h1>
          <p className="text-muted-foreground text-lg">Track meeting costs and discover when your meeting could have been an email</p>
        </div>

        {/* Top Banner Ad */}
        <AdBanner adSlot="1234567890" adFormat="horizontal" className="text-center" />

        {/* Timer Display */}
        <Card className="meeting-card bg-card/80 backdrop-blur-sm border">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Meeting Duration</span>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-mono font-bold tracking-wider text-foreground ${isRunning ? 'animate-pulse-glow' : ''}`}>
                  {formatTime(time)}
                </div>
              </div>
              <div className="flex justify-center gap-4">
                {!isRunning ? (
                  <Button onClick={startTimer} size="lg" className="gap-2 gradient-bg hover:opacity-90 transition-all duration-300 shadow-lg">
                    <Play className="w-4 h-4" />
                    Start Meeting
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90 transition-all duration-300">
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2 border-2 hover:bg-accent/50">
                  <Square className="w-4 h-4" />
                  Reset
                </Button>
                {time > 0 && isPremium && (
                  <Button onClick={saveMeetingData} size="lg" variant="outline" className="gap-2 border-2 hover:bg-accent/50">
                    Save Meeting
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cost Display */}
          <Card className="h-[400px] flex flex-col meeting-card glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                Meeting Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="text-center space-y-3 mb-4">
                <CostTicker cost={totalCost} isRunning={isRunning} />
                <div className="text-sm text-muted-foreground">
                  {attendees.length} attendee{attendees.length !== 1 ? "s" : ""} • $
                  {attendees.reduce((sum, a) => sum + a.hourlyRate, 0).toFixed(2)}/hour
                  {billByMinute && <span className="text-xs"> • Billed by minute</span>}
                </div>
              </div>
              
              {/* Enhanced Cost Breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-xs font-medium text-foreground">${attendees.reduce((sum, a) => sum + a.hourlyRate, 0).toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
                <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-xs font-medium text-foreground">${(totalCost / Math.max(time / 60, 1)).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">per minute</div>
                </div>
                <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-xs font-medium text-foreground">{attendees.length}</div>
                  <div className="text-xs text-muted-foreground">attendees</div>
                </div>
              </div>
              
              {/* Milestones Achieved - SCROLLABLE */}
              {achievedMilestones.length > 0 && (
                <div className="flex-1 overflow-hidden">
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-foreground">Cost Milestones</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto">
                      {achievedMilestones.map((milestone, index) => (
                        <div key={index} className="p-2 border-b border-border last:border-b-0">
                          <div className="text-sm text-foreground">{milestone}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees Management */}
          <Card className="h-[400px] flex flex-col meeting-card glass-card">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-primary" />
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
                    <Select value={newAttendeeRole} onValueChange={handleRoleChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(roleRates).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role} (${roleRates[role]}/hr)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                   <div>
                     <Label htmlFor="email" className="text-xs">
                       Email (optional)
                     </Label>
                     <Input
                       id="email"
                       type="email"
                       placeholder="attendee@example.com"
                       value={newAttendeeEmail}
                       onChange={(e) => setNewAttendeeEmail(e.target.value)}
                       onKeyPress={(e) => e.key === "Enter" && addAttendee()}
                       className="h-8"
                     />
                   </div>
                 </div>
                 
                 {/* Bill by Minute Toggle */}
                 <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                   <div>
                     <Label htmlFor="billByMinute" className="text-xs font-medium">
                       Bill by Minute
                     </Label>
                     <p className="text-xs text-muted-foreground">Round up to next full minute</p>
                   </div>
                   <Switch
                     id="billByMinute"
                     checked={billByMinute}
                     onCheckedChange={setBillByMinute}
                   />
                 </div>
                 
                 <Button onClick={addAttendee} className="w-full gap-2 gradient-bg hover:opacity-90 h-8" size="sm">
                   <Plus className="w-4 h-4" />
                   Add Attendee
                 </Button>
              </div>

              {/* Attendees List - Flexible height with proper scrolling */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  {attendees.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <div className="text-center">
                        <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium mb-1">No attendees yet</p>
                        <p className="text-xs">Add people to start tracking meeting costs</p>
                      </div>
                    </div>
                  ) : (
                    attendees.map((attendee) => (
                      <div key={attendee.id} className="p-2 border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate text-foreground">{attendee.name}</div>
                            <div className="text-muted-foreground text-xs truncate">{attendee.role}</div>
                            <div className="text-primary text-xs font-medium">${attendee.hourlyRate}/hr</div>
                          </div>
                          <Button
                            onClick={() => removeAttendee(attendee.id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
        {/* Mid-page Ad */}
        <AdBanner adSlot="0987654321" adFormat="rectangle" className="text-center" />
        
        <MilestoneTicker
          totalCost={totalCost} 
          resetTrigger={resetCounter}
          attendees={attendees}
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

        {/* Premium Features */}
        <PremiumGate feature="Premium Features" description="Unlock advanced analytics, calendar integration, and meeting history tracking">
          <div className="space-y-6">
            <CalendarIntegration />
            <MeetingHistory />
          </div>
        </PremiumGate>
      </div>
    </div>
  )
}

export default Index
