import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  TestTube, 
  Crown, 
  Clock, 
  User, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Database,
  Calendar,
  Save,
  FileDown
} from "lucide-react"

export const PremiumTestingPanel = () => {
  const { user, isPremium, profile, isAdmin } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    feature: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }[]>([])

  // Don't show to non-admin users
  if (!isAdmin) {
    return null
  }

  const setSubscriptionStatus = async (status: 'free' | 'premium', days?: number) => {
    if (!user) return

    setLoading(true)
    try {
      const updates: any = { subscription_status: status }
      
      if (status === 'premium') {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + (days || 30))
        updates.subscription_expires_at = expiresAt.toISOString()
      } else {
        updates.subscription_expires_at = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: `Account set to ${status}`,
        description: status === 'premium' 
          ? `Premium access for ${days || 30} days` 
          : "Reverted to free account",
      })

      // Refresh the page to update auth state
      setTimeout(() => window.location.reload(), 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runPremiumFeatureTests = async () => {
    setLoading(true)
    const results: typeof testResults = []

    // Test 1: Premium status check
    try {
      results.push({
        feature: "Premium Status",
        status: isPremium ? 'pass' : 'fail',
        message: isPremium 
          ? `Premium active until ${profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'unknown'}`
          : "User is on free plan"
      })
    } catch (error) {
      results.push({
        feature: "Premium Status",
        status: 'fail',
        message: "Error checking premium status"
      })
    }

    // Test 2: Meeting save functionality
    try {
      if (isPremium) {
        const testMeeting = {
          title: "Test Meeting - " + new Date().toISOString(),
          duration_seconds: 300,
          total_cost: 25.00,
          attendee_count: 2,
          attendees: [
            { id: "test1", name: "Test User 1", role: "Developer", hourlyRate: 65 },
            { id: "test2", name: "Test User 2", role: "Manager", hourlyRate: 100 }
          ],
          milestones: ["$10 milestone", "$20 milestone"],
          user_id: user?.id
        }

        const { error } = await supabase
          .from('meetings')
          .insert(testMeeting)

        if (error) throw error

        results.push({
          feature: "Meeting Save",
          status: 'pass',
          message: "Test meeting saved successfully"
        })
      } else {
        results.push({
          feature: "Meeting Save",
          status: 'warning',
          message: "Feature blocked for free users (expected behavior)"
        })
      }
    } catch (error: any) {
      results.push({
        feature: "Meeting Save",
        status: 'fail',
        message: `Error: ${error.message}`
      })
    }

    // Test 3: Meeting history access
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('id, title, created_at')
        .limit(1)

      if (error && !isPremium) {
        results.push({
          feature: "Meeting History",
          status: 'warning',
          message: "Access denied for free users (expected)"
        })
      } else if (error) {
        throw error
      } else {
        results.push({
          feature: "Meeting History",
          status: isPremium ? 'pass' : 'warning',
          message: isPremium 
            ? `Found ${data?.length || 0} meetings in history`
            : "Should be blocked for free users"
        })
      }
    } catch (error: any) {
      results.push({
        feature: "Meeting History",
        status: 'fail',
        message: `Error: ${error.message}`
      })
    }

    // Test 4: Calendar integration check
    try {
      const { data, error } = await supabase
        .from('calendar_connections')
        .select('id, provider, is_active')
        .limit(1)

      if (error && !isPremium) {
        results.push({
          feature: "Calendar Integration",
          status: 'warning',
          message: "Access denied for free users (expected)"
        })
      } else if (error) {
        throw error
      } else {
        results.push({
          feature: "Calendar Integration",
          status: isPremium ? 'pass' : 'warning',
          message: isPremium 
            ? `Found ${data?.length || 0} calendar connections`
            : "Should be blocked for free users"
        })
      }
    } catch (error: any) {
      results.push({
        feature: "Calendar Integration",
        status: 'fail',
        message: `Error: ${error.message}`
      })
    }

    setTestResults(results)
    setLoading(false)

    toast({
      title: "Premium Feature Tests Complete",
      description: `${results.filter(r => r.status === 'pass').length}/${results.length} tests passed`,
    })
  }

  const cleanupTestData = async () => {
    setLoading(true)
    try {
      // Delete test meetings
      const { error } = await supabase
        .from('meetings')
        .delete()
        .like('title', 'Test Meeting - %')

      if (error) throw error

      toast({
        title: "Test data cleaned",
        description: "All test meetings have been removed",
      })
      
      setTestResults([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to clean test data: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-primary" />
          Premium Testing Panel
          <Badge variant="secondary">Admin Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current User</Label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{profile?.display_name || user?.email}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Premium Status</Label>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <Badge variant={isPremium ? "default" : "secondary"}>
                    {isPremium ? "Premium" : "Free"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subscription Expires</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {profile?.subscription_expires_at 
                      ? new Date(profile.subscription_expires_at).toLocaleDateString()
                      : "N/A"
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Admin Status</Label>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Admin" : "User"}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={runPremiumFeatureTests}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                Run Feature Tests
              </Button>
              
              {testResults.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={cleanupTestData}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clean Test Data
                </Button>
              )}
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <Label>Test Results</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.feature}</span>
                          <Badge 
                            variant={result.status === 'pass' ? 'default' : result.status === 'fail' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button 
                    onClick={() => setSubscriptionStatus('premium', 30)}
                    disabled={loading}
                    variant="default"
                    size="sm"
                  >
                    Set Premium (30 days)
                  </Button>
                  
                  <Button 
                    onClick={() => setSubscriptionStatus('premium', 7)}
                    disabled={loading}
                    variant="default"
                    size="sm"
                  >
                    Set Premium (7 days)
                  </Button>
                  
                  <Button 
                    onClick={() => setSubscriptionStatus('free')}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    Set Free
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="ghost"
                    size="sm"
                  >
                    Refresh State
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm text-muted-foreground">
                  Feature Access Matrix
                </Label>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 font-medium text-muted-foreground">
                    <span>Feature</span>
                    <span>Free</span>
                    <span>Premium</span>
                  </div>
                  
                  {[
                    { name: "Basic Timer", free: "✓", premium: "✓" },
                    { name: "Cost Calculation", free: "✓", premium: "✓" },
                    { name: "Meeting Save", free: "✗", premium: "✓" },
                    { name: "Meeting History", free: "✗", premium: "✓" },
                    { name: "Calendar Sync", free: "✗", premium: "✓" },
                    { name: "Data Export", free: "✗", premium: "✓" },
                    { name: "Advanced Analytics", free: "✗", premium: "✓" },
                  ].map((feature, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                      <span>{feature.name}</span>
                      <span className={feature.free === "✓" ? "text-green-600" : "text-red-600"}>
                        {feature.free}
                      </span>
                      <span className={feature.premium === "✓" ? "text-green-600" : "text-red-600"}>
                        {feature.premium}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}