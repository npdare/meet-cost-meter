import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  ExternalLink, 
  RefreshCw, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

interface CalendarConnection {
  id: string
  provider: string
  provider_email: string
  is_active: boolean
  created_at: string
}

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  attendees: any[]
  is_meeting: boolean
  estimated_cost: number | null
  meeting_url: string | null
}

export const CalendarIntegration = () => {
  const [connections, setConnections] = useState<CalendarConnection[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchConnections()
      fetchUpcomingEvents()
    }
  }, [user])

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnections(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch calendar connections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_meeting', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10)

      if (error) throw error
      setEvents((data as any) || [])
    } catch (error: any) {
      console.error('Error fetching events:', error)
    }
  }

  const connectGoogleCalendar = async () => {
    setConnecting(true)
    try {
      const redirectUri = `${window.location.origin}/`
      
      const { data, error } = await supabase.functions.invoke('calendar-oauth', {
        body: {
          provider: 'google',
          redirect_uri: redirectUri
        }
      })

      if (error) throw error

      if (data.authorization_url) {
        // Store the current page URL to return after auth
        localStorage.setItem('calendar_auth_return_url', window.location.href)
        
        // Use window.open with proper COOP handling
        const popup = window.open(
          data.authorization_url, 
          'google-auth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        if (!popup) {
          // Fallback to full redirect if popup is blocked
          window.location.href = data.authorization_url
          return
        }

        // Monitor the popup for completion
        const checkClosed = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkClosed)
              // Refresh to check for new connections
              setTimeout(() => {
                fetchConnections()
                fetchUpcomingEvents()
              }, 1000)
            }
          } catch (e) {
            // Handle COOP errors silently
            clearInterval(checkClosed)
          }
        }, 1000)

        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          if (popup && !popup.closed) {
            popup.close()
          }
        }, 300000)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Calendar",
        variant: "destructive",
      })
      console.error('Calendar connection error:', error)
    } finally {
      setConnecting(false)
    }
  }

  const connectMicrosoftCalendar = async () => {
    setConnecting(true)
    try {
      const redirectUri = `${window.location.origin}/`
      
      const { data, error } = await supabase.functions.invoke('calendar-oauth', {
        body: {
          provider: 'microsoft',
          redirect_uri: redirectUri
        }
      })

      if (error) throw error

      if (data.authorization_url) {
        // Store the current page URL to return after auth
        localStorage.setItem('calendar_auth_return_url', window.location.href)
        
        // Use window.open with proper COOP handling
        const popup = window.open(
          data.authorization_url, 
          'microsoft-auth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )
        
        if (!popup) {
          // Fallback to full redirect if popup is blocked
          window.location.href = data.authorization_url
          return
        }

        // Monitor the popup for completion
        const checkClosed = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(checkClosed)
              // Refresh to check for new connections
              setTimeout(() => {
                fetchConnections()
                fetchUpcomingEvents()
              }, 1000)
            }
          } catch (e) {
            // Handle COOP errors silently
            clearInterval(checkClosed)
          }
        }, 1000)

        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          if (popup && !popup.closed) {
            popup.close()
          }
        }, 300000)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to connect to Microsoft Calendar",
        variant: "destructive",
      })
      console.error('Microsoft calendar connection error:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handleOAuthCallback = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/`
      
      const { data, error } = await supabase.functions.invoke('calendar-oauth', {
        body: {
          provider: 'google',
          code,
          redirect_uri: redirectUri
        }
      })

      if (error) throw error

      if (data.success) {
        toast({
          title: "Calendar Connected!",
          description: `Successfully connected ${data.connection.email}`,
        })
        
        fetchConnections()
        syncCalendar()
        
        // Clear the return URL
        localStorage.removeItem('calendar_auth_return_url')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to complete calendar connection",
        variant: "destructive",
      })
      console.error('OAuth callback error:', error)
    }
  }

  const syncCalendar = async (connectionId?: string) => {
    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: {
          connection_id: connectionId,
          days_ahead: 30
        }
      })

      if (error) throw error

      const successfulSyncs = data.sync_results?.filter((r: any) => !r.error) || []
      const totalMeetings = successfulSyncs.reduce((sum: number, r: any) => sum + (r.meetings_found || 0), 0)

      toast({
        title: "Calendar Synced!",
        description: `Found ${totalMeetings} upcoming meetings`,
      })

      fetchUpcomingEvents()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sync calendar",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const disconnectCalendar = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_connections')
        .update({ is_active: false })
        .eq('id', connectionId)

      if (error) throw error

      toast({
        title: "Calendar Disconnected",
        description: "Calendar has been disconnected successfully",
      })

      fetchConnections()
      fetchUpcomingEvents()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to disconnect calendar",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (start: string, end: string) => {
    const durationMs = new Date(end).getTime() - new Date(start).getTime()
    const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10
    return durationHours
  }

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    
    if (code && state && user?.id === state) {
      handleOAuthCallback(code)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [user])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="text-center">Loading calendar connections...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Connections */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Calendar Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connections.filter(c => c.is_active).length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Connect your calendar to automatically detect meetings and track costs
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={connectGoogleCalendar} 
                  disabled={connecting}
                  className="gradient-bg w-full"
                >
                  {connecting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Connect Google Calendar
                </Button>
                <Button 
                  onClick={connectMicrosoftCalendar} 
                  disabled={connecting}
                  variant="outline"
                  className="w-full"
                >
                  {connecting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Connect Microsoft Outlook
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.filter(c => c.is_active).map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">{connection.provider_email}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected {formatDate(connection.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {connection.provider}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncCalendar(connection.id)}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => disconnectCalendar(connection.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={connectGoogleCalendar} 
                variant="outline" 
                size="sm"
                disabled={connecting}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Add Another Calendar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      {events.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-3 border border-border rounded-lg hover:bg-accent/20 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.start_time)} - {formatDate(event.end_time)}
                      </p>
                    </div>
                    {event.meeting_url && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {calculateDuration(event.start_time, event.end_time)}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.attendees?.length || 0} attendees
                    </div>
                    {event.estimated_cost && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${event.estimated_cost.toFixed(2)} est.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {connections.filter(c => c.is_active).length > 0 && events.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No upcoming meetings found. Try syncing your calendar or check back later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}