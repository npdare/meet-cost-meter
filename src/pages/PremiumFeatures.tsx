import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppHeader } from "@/components/AppHeader"
import { PremiumGate } from "@/components/PremiumGate"
import { MeetingHistory } from "@/components/MeetingHistory"
import { CalendarIntegration } from "@/components/CalendarIntegration"
import { MeetingExport } from "@/components/PremiumFeatures/MeetingExport"
import { AdvancedAnalytics } from "@/components/PremiumFeatures/AdvancedAnalytics"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "react-router-dom"
import { useState } from "react"
import { 
  Crown, 
  ArrowLeft, 
  Calendar, 
  BarChart3, 
  FileDown, 
  History,
  Sparkles
} from "lucide-react"

const PremiumFeatures = () => {
  const { isPremium, profile, signOut } = useAuth()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
      />
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Link>
            </Button>
            <div className="h-4 border-l border-border" />
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Premium Features</h1>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? "Premium Active" : "Free Plan"}
              </Badge>
            </div>
          </div>
          
          {isPremium && profile?.subscription_expires_at && (
            <div className="text-sm text-muted-foreground">
              Expires: {new Date(profile.subscription_expires_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Premium Status Card */}
        {!isPremium && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-primary" />
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Upgrade to Premium</h2>
                  <p className="text-muted-foreground">
                    Unlock advanced analytics, data export, calendar integration, and meeting history
                  </p>
                </div>
                <Button className="gradient-bg">
                  <Link to="/auth">Get Premium Access</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <PremiumGate 
              feature="Advanced Analytics" 
              description="Get detailed insights into your meeting costs, patterns, and efficiency metrics"
              showPreview={true}
            >
              <AdvancedAnalytics />
            </PremiumGate>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PremiumGate 
              feature="Meeting History" 
              description="Track and review all your saved meetings with detailed cost breakdowns"
              showPreview={true}
            >
              <MeetingHistory />
            </PremiumGate>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <PremiumGate 
              feature="Data Export" 
              description="Export your meeting data in CSV, JSON, or PDF format for analysis"
              showPreview={true}
            >
              <MeetingExport />
            </PremiumGate>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <PremiumGate 
              feature="Calendar Integration" 
              description="Sync with Google Calendar to automatically track meeting costs"
              showPreview={true}
            >
              <CalendarIntegration />
            </PremiumGate>
          </TabsContent>
        </Tabs>

        {/* Feature Comparison */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Premium</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { name: "Meeting Timer", free: true, premium: true },
                    { name: "Cost Calculation", free: true, premium: true },
                    { name: "Role Management", free: true, premium: true },
                    { name: "Save Meetings", free: false, premium: true },
                    { name: "Meeting History", free: false, premium: true },
                    { name: "Calendar Integration", free: false, premium: true },
                    { name: "Advanced Analytics", free: false, premium: true },
                    { name: "Data Export", free: false, premium: true },
                    { name: "Priority Support", free: false, premium: true },
                  ].map((feature, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-2 font-medium">{feature.name}</td>
                      <td className="text-center py-2">
                        {feature.free ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-center py-2">
                        {feature.premium ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PremiumFeatures