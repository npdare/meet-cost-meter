import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { MilestoneTicker } from "@/components/MilestoneTicker"
import { MeetingReportCard } from "@/components/MeetingReportCard"
import { AdBanner } from "@/components/AdBanner"
import { PremiumGate } from "@/components/PremiumGate"
import { MeetingHistory, saveMeeting } from "@/components/MeetingHistory"
import { CalendarIntegration } from "@/components/CalendarIntegration"
import { PremiumTestingPanel } from "@/components/PremiumTestingPanel"
import { AppHeader } from "@/components/AppHeader"
import { HeroSection } from "@/components/HeroSection"
import { TimerCard } from "@/components/TimerCard"
import { CostSummaryCard } from "@/components/CostSummaryCard"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { FreeRoleQuantityList, RoleQuantityEntry } from "@/components/FreeRoleQuantityList"
import { calculateQuantityCost } from "@/utils/quantityCostCalculations"
import { Attendee } from "@/types"

const Index = () => {
  const [time, setTime] = useState(0) // time in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [roleEntries, setRoleEntries] = useState<RoleQuantityEntry[]>([])
  const [billByMinute, setBillByMinute] = useState(false)
  const [resetCounter, setResetCounter] = useState(0) // Add reset counter for milestones
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([])
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const { user, isPremium, profile, signOut } = useAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  // Theme effect
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const initialTheme = savedTheme || systemTheme
    
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const handleSignOut = async () => {
    // Reset theme to light on sign out
    setTheme("light")
    localStorage.setItem("theme", "light")
    document.documentElement.classList.remove("dark")
    
    // Sign out the user
    await signOut()
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

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

  

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <AppHeader 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onSignOut={handleSignOut} 
      />
      
      <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <HeroSection />

        {/* Top Banner Ad */}
        {!isMobile && <AdBanner adSlot="1234567890" adFormat="horizontal" className="text-center" />}

        {/* Main Grid Layout */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-[2fr_3fr] gap-8'}`}>
          {/* Left Column - Timer & Cost Summary */}
          <div className={`${isMobile ? 'space-y-2' : 'space-y-6'}`}>
            <TimerCard
              time={time}
              isRunning={isRunning}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onSave={saveMeetingData}
              canSave={true}
              formatTime={formatTime}
            />

            <CostSummaryCard
              totalCost={totalCost}
              isRunning={isRunning}
              roleEntries={roleEntries}
              time={time}
              billByMinute={billByMinute}
              achievedMilestones={achievedMilestones}
            />
          </div>

          {/* Right Column - Attendees Management */}
          <div className={`${isMobile ? 'space-y-2' : 'space-y-6'} flex flex-col`}>
            <Card className="flex-1 bg-card/80 backdrop-blur-sm border shadow-sm">
              <div className={`h-full ${isMobile ? 'p-4' : 'p-6'}`}>
                <FreeRoleQuantityList 
                  entries={roleEntries} 
                  onEntriesChange={setRoleEntries} 
                />
              </div>
            </Card>
          </div>
        </div>

        
        {/* Mid-page Ad */}
        {!isMobile && <AdBanner adSlot="0987654321" adFormat="rectangle" className="text-center" />}
        
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

        {/* Premium Testing Panel - Admin Only */}
        <PremiumTestingPanel />
      </div>
    </div>
  )
}

export default Index
