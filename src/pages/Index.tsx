import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Square, Plus, X, Users, DollarSign, Clock, Timer, TrendingUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { FreeRoleQuantityList, RoleQuantityEntry } from "@/components/FreeRoleQuantityList"
import { calculateQuantityCost } from "@/utils/quantityCostCalculations"
import { Attendee } from "@/types"
import { calculateCost, validateAttendeeEmail } from "@/utils/costCalculations"

const Index = () => {
  const [time, setTime] = useState(0) // time in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [roleEntries, setRoleEntries] = useState<RoleQuantityEntry[]>([])
  const [attendees] = useState<Attendee[]>([]) // Keep for legacy components
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

  // Calculate total cost using quantity-based calculation
  const totalCost = calculateQuantityCost(roleEntries, time)

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
    // Convert roleEntries to legacy attendees format for saving
    const legacyAttendees: Attendee[] = roleEntries.flatMap(entry => 
      Array.from({ length: entry.count }, (_, i) => ({
        id: `${entry.id}-${i}`,
        name: entry.name || `${entry.role} ${i + 1}`,
        role: entry.role,
        hourlyRate: entry.rate,
        email: entry.email
      }))
    )
    const result = await saveMeeting(meetingTitle, time, totalCost, legacyAttendees, achievedMilestones)
    
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

  // Legacy functions - no longer needed
  const addAttendee = () => {
    // This function is deprecated - use FreeRoleQuantityList instead
  }

  const removeAttendee = (id: string) => {
    // This function is deprecated - use FreeRoleQuantityList instead
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
                      <>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Premium</span>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/history">History</Link>
                        </Button>
                      </>
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
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3 animate-fade-in pt-6">
          <h1 className="text-4xl font-poppins font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight py-2">
            Could Be An Email
          </h1>
          <p className="text-muted-foreground text-lg">Track meeting costs and discover when your meeting could have been an email</p>
        </div>

        {/* Top Banner Ad */}
        <AdBanner adSlot="1234567890" adFormat="horizontal" className="text-center" />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
          {/* Left Column - Timer & Cost Summary */}
          <div className="space-y-6">
            {/* Timer Header */}
            <div className="">
              <Card className="p-6 bg-card/95 backdrop-blur-sm border shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-2 text-foreground">
                    <Clock className="w-5 h-5" />
                    <span className="text-xl font-semibold">Meeting Duration</span>
                  </div>
                  <div className="text-center">
                    <div className={`text-6xl font-mono font-bold tracking-wider text-foreground ${isRunning ? 'animate-pulse-glow' : ''}`}>
                      {formatTime(time)}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    {!isRunning ? (
                      <Button onClick={startTimer} size="lg" className="gap-2 gradient-bg hover:opacity-90 transition-all duration-300 shadow-lg w-40">
                        <Play className="w-4 h-4" />
                        Start Meeting
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} size="lg" className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90 transition-all duration-300 w-40">
                        <Pause className="w-4 h-4" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2 border-2 hover:bg-accent/50 w-24">
                      <Square className="w-4 h-4" />
                      Reset
                    </Button>
                    <div className="w-36">
                      {time > 0 && isPremium && (
                        <Button onClick={saveMeetingData} size="lg" variant="outline" className="gap-2 border-2 hover:bg-accent/50 w-full">
                          Save Meeting
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cost Summary Card */}
            <Card className="h-96 bg-card/80 backdrop-blur-sm border shadow-sm">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-xl font-semibold">Meeting Cost</span>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold tracking-wider text-foreground">
                    <CostTicker cost={totalCost} isRunning={isRunning} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {roleEntries.reduce((sum, entry) => sum + entry.count, 0)} attendee{roleEntries.reduce((sum, entry) => sum + entry.count, 0) !== 1 ? "s" : ""} • $
                    {roleEntries.reduce((sum, entry) => sum + (entry.count * entry.rate), 0).toFixed(2)}/hour
                    {billByMinute && <span className="text-xs"> • Billed by minute</span>}
                  </div>
                </div>
                
                {/* Cost Breakdown */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
                    <div className="text-sm font-semibold text-foreground">${roleEntries.reduce((sum, entry) => sum + (entry.count * entry.rate), 0).toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">per hour</div>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
                    <div className="text-sm font-semibold text-foreground">${(totalCost / Math.max(time / 60, 1)).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">per minute</div>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
                    <div className="text-sm font-semibold text-foreground">{roleEntries.reduce((sum, entry) => sum + entry.count, 0)}</div>
                    <div className="text-xs text-muted-foreground">attendees</div>
                  </div>
                </div>
                
                {/* Milestones Section */}
                {achievedMilestones.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">Cost Milestones</span>
                    </div>
                    <ScrollArea className="h-24">
                      <div className="space-y-2 pb-2">
                        {achievedMilestones.map((milestone, index) => (
                          <div key={index} className="p-2 bg-secondary/30 rounded text-sm text-foreground">
                            {milestone}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Attendees Management */}
          <div className="space-y-6 flex flex-col">
            <Card className="flex-1 bg-card/80 backdrop-blur-sm border shadow-sm">
              <div className="h-full p-6">
                <FreeRoleQuantityList 
                  entries={roleEntries} 
                  onEntriesChange={setRoleEntries} 
                />
              </div>
            </Card>
          </div>
        </div>

        
        {/* Mid-page Ad */}
        <AdBanner adSlot="0987654321" adFormat="rectangle" className="text-center" />
        
        <MilestoneTicker
          totalCost={totalCost} 
          resetTrigger={resetCounter}
          attendees={roleEntries.flatMap(entry => 
            Array.from({ length: entry.count }, (_, i) => ({
              id: `${entry.id}-${i}`,
              name: entry.name || `${entry.role} ${i + 1}`,
              role: entry.role,
              hourlyRate: entry.rate,
              email: entry.email
            }))
          )}
          onMilestoneAchieved={(milestone) => setAchievedMilestones(prev => [milestone, ...prev])}
        />
        
        {roleEntries.length > 0 && (
          <MeetingReportCard 
            totalCost={totalCost}
            duration={time}
            attendeeCount={roleEntries.reduce((sum, entry) => sum + entry.count, 0)}
            milestones={achievedMilestones}
            attendees={roleEntries.flatMap(entry => 
              Array.from({ length: entry.count }, (_, i) => ({
                id: `${entry.id}-${i}`,
                name: entry.name || `${entry.role} ${i + 1}`,
                role: entry.role,
                hourlyRate: entry.rate,
                email: entry.email
              }))
            )}
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
