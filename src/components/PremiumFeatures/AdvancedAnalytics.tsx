import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  Target,
  Award
} from "lucide-react"

interface Meeting {
  id: string
  title: string
  duration_seconds: number
  total_cost: number
  attendee_count: number
  attendees: any[]
  created_at: string
}

interface Analytics {
  totalMeetings: number
  totalCost: number
  totalTime: number
  avgMeetingCost: number
  avgMeetingDuration: number
  avgAttendees: number
  costPerHour: number
  mostExpensiveRole: string
  topAttendeeRoles: { role: string; count: number; totalCost: number }[]
  monthlyTrends: { month: string; meetings: number; cost: number }[]
  costEfficiencyScore: number
}

export const AdvancedAnalytics = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchMeetingsAndAnalyze()
    }
  }, [user, timeRange])

  const fetchMeetingsAndAnalyze = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply time filter
      if (timeRange !== 'all') {
        const days = parseInt(timeRange.replace('d', ''))
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        query = query.gte('created_at', cutoffDate.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      const meetingsData = data as Meeting[] || []
      setMeetings(meetingsData)
      calculateAnalytics(meetingsData)
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (meetings: Meeting[]) => {
    if (meetings.length === 0) {
      setAnalytics(null)
      return
    }

    const totalMeetings = meetings.length
    const totalCost = meetings.reduce((sum, m) => sum + m.total_cost, 0)
    const totalTime = meetings.reduce((sum, m) => sum + m.duration_seconds, 0)
    const avgMeetingCost = totalCost / totalMeetings
    const avgMeetingDuration = totalTime / totalMeetings
    const avgAttendees = meetings.reduce((sum, m) => sum + m.attendee_count, 0) / totalMeetings
    const costPerHour = totalCost / (totalTime / 3600)

    // Role analysis
    const roleStats: { [key: string]: { count: number; totalCost: number } } = {}
    meetings.forEach(meeting => {
      if (meeting.attendees) {
        meeting.attendees.forEach((attendee: any) => {
          if (!roleStats[attendee.role]) {
            roleStats[attendee.role] = { count: 0, totalCost: 0 }
          }
          roleStats[attendee.role].count++
          roleStats[attendee.role].totalCost += meeting.total_cost / meeting.attendee_count
        })
      }
    })

    const topAttendeeRoles = Object.entries(roleStats)
      .map(([role, stats]) => ({ role, ...stats }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)

    const mostExpensiveRole = topAttendeeRoles[0]?.role || 'N/A'

    // Monthly trends
    const monthlyData: { [key: string]: { meetings: number; cost: number } } = {}
    meetings.forEach(meeting => {
      const month = new Date(meeting.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      if (!monthlyData[month]) {
        monthlyData[month] = { meetings: 0, cost: 0 }
      }
      monthlyData[month].meetings++
      monthlyData[month].cost += meeting.total_cost
    })

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6) // Last 6 months

    // Cost efficiency score (lower cost per hour and shorter meetings = better score)
    const baseCostPerHour = 100 // Baseline $100/hour
    const baseDuration = 3600 // 1 hour
    const costEfficiencyScore = Math.max(0, Math.min(100, 
      100 - ((costPerHour - baseCostPerHour) / baseCostPerHour * 50) - 
      ((avgMeetingDuration - baseDuration) / baseDuration * 25)
    ))

    setAnalytics({
      totalMeetings,
      totalCost,
      totalTime,
      avgMeetingCost,
      avgMeetingDuration,
      avgAttendees,
      costPerHour,
      mostExpensiveRole,
      topAttendeeRoles,
      monthlyTrends,
      costEfficiencyScore
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "default" as const }
    if (score >= 60) return { label: "Good", variant: "secondary" as const }
    if (score >= 40) return { label: "Fair", variant: "outline" as const }
    return { label: "Needs Improvement", variant: "destructive" as const }
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Analyzing meeting data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="font-medium text-foreground">No data yet</p>
              <p className="text-sm text-muted-foreground">
                Start tracking meetings to see analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const efficiencyBadge = getEfficiencyBadge(analytics.costEfficiencyScore)

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Advanced Analytics
          </CardTitle>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.totalMeetings}</p>
              <p className="text-sm text-muted-foreground">Total Meetings</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">${analytics.totalCost.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Total Cost</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{formatTime(analytics.totalTime)}</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.avgAttendees.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Avg Attendees</p>
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="border-t pt-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-medium">Meeting Efficiency Score</span>
              </div>
              <Badge variant={efficiencyBadge.variant}>
                {efficiencyBadge.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.costEfficiencyScore}%` }}
                />
              </div>
              <span className="text-sm font-medium">{analytics.costEfficiencyScore.toFixed(0)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on cost per hour and meeting duration
            </p>
          </div>

          {/* Top Roles */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-medium">Top Attendee Roles by Cost</span>
            </div>
            <div className="space-y-2">
              {analytics.topAttendeeRoles.slice(0, 3).map((role, index) => (
                <div key={role.role} className="flex items-center justify-between p-2 bg-accent/20 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{role.role}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${role.totalCost.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{role.count} appearances</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Insights */}
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Average meeting cost:</span>
                <span className="font-medium ml-2">${analytics.avgMeetingCost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost per hour:</span>
                <span className="font-medium ml-2">${analytics.costPerHour.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Average duration:</span>
                <span className="font-medium ml-2">{formatTime(analytics.avgMeetingDuration)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Most expensive role:</span>
                <span className="font-medium ml-2">{analytics.mostExpensiveRole}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}