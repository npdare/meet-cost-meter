import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, Clock, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

interface Meeting {
  id: string
  title: string
  duration_seconds: number
  total_cost: number
  attendee_count: number
  attendees: any[]
  milestones: string[]
  created_at: string
}

interface Attendee {
  id: string
  name: string
  role: string
  hourlyRate: number
}

export const MeetingHistory = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchMeetings()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMeetings((data as any) || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch meeting history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMeetings(meetings.filter(m => m.id !== id))
      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Meeting History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading meetings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Meeting History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="font-medium text-foreground">No meetings yet</p>
              <p className="text-sm text-muted-foreground">
                Your saved meetings will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="border border-border rounded-lg p-4 hover:bg-accent/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{meeting.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(meeting.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMeeting(meeting.id)}
                    className="text-muted-foreground hover:text-destructive p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-foreground">
                      {formatTime(meeting.duration_seconds)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      ${meeting.total_cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {meeting.attendee_count} attendee{meeting.attendee_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {meeting.attendees && meeting.attendees.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Attendees:</p>
                    <div className="flex flex-wrap gap-1">
                      {(meeting.attendees as Attendee[]).map((attendee, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {attendee.name} - {attendee.role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.milestones && meeting.milestones.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Cost Milestones:</p>
                    <div className="flex flex-wrap gap-1">
                      {meeting.milestones.slice(0, 3).map((milestone, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {milestone}
                        </Badge>
                      ))}
                      {meeting.milestones.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{meeting.milestones.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const saveMeeting = async (
  title: string,
  duration: number,
  totalCost: number,
  attendees: Attendee[],
  milestones: string[]
) => {
  try {
    const { error } = await supabase
      .from('meetings')
      .insert({
        title,
        duration_seconds: duration,
        total_cost: totalCost,
        attendee_count: attendees.length,
        attendees: attendees as any,
        milestones: milestones as any,
        user_id: (await supabase.auth.getUser()).data.user?.id!,
      })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}