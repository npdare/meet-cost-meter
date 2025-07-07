import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Trash2, 
  Download,
  Search,
  ArrowLeft,
  Filter
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Link, useNavigate } from "react-router-dom"
import { Meeting } from "@/types"

const History = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)
  const { user, isPremium } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchMeetings()
    } else {
      navigate('/auth')
    }
  }, [user, navigate])

  useEffect(() => {
    // Filter meetings based on search term
    const filtered = meetings.filter(meeting =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.attendees.some(attendee => 
        attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    
    // Limit to 30 recent entries unless showAll is true
    const limited = showAll ? filtered : filtered.slice(0, 30)
    setFilteredMeetings(limited)
  }, [meetings, searchTerm, showAll])

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(showAll ? 1000 : 100) // Reasonable upper limit

      if (error) throw error
      setMeetings((data as any[])?.map(meeting => ({
        ...meeting,
        attendees: (meeting.attendees as any[]) || [],
        milestones: (meeting.milestones as string[]) || []
      })) as Meeting[] || [])
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

  const exportToCSV = () => {
    const csvHeaders = [
      'Date',
      'Title', 
      'Duration (HH:MM:SS)',
      'Total Cost',
      'Attendee Count',
      'Attendees',
      'Milestones'
    ]

    const csvData = filteredMeetings.map(meeting => [
      new Date(meeting.created_at).toLocaleDateString(),
      meeting.title,
      formatTime(meeting.duration_seconds),
      `$${meeting.total_cost.toFixed(2)}`,
      meeting.attendee_count,
      meeting.attendees.map(a => `${a.name} (${a.role})`).join('; '),
      meeting.milestones.slice(0, 3).join('; ')
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meeting-history-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Meeting history has been exported to CSV",
    })
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

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Premium Feature</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Meeting history is available for premium users only.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Timer
                </Link>
              </Button>
              <Button className="flex-1">
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading meeting history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Timer
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meeting History</h1>
              <p className="text-muted-foreground">
                {filteredMeetings.length} of {meetings.length} meetings
                {!showAll && meetings.length > 30 && " (showing recent 30)"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {meetings.length > 30 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAll ? "Show Recent" : "Show All"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={filteredMeetings.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings or attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Meeting History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Meeting History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMeetings.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <p className="font-medium text-foreground">
                    {searchTerm ? "No matching meetings found" : "No meetings yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try a different search term" : "Your saved meetings will appear here"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Milestones</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="text-sm">
                          {formatDate(meeting.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {meeting.title}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatTime(meeting.duration_seconds)}
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          ${meeting.total_cost.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{meeting.attendee_count}</span>
                            {meeting.attendees.length > 0 && (
                              <div className="flex flex-wrap gap-1 ml-2">
                                {meeting.attendees.slice(0, 2).map((attendee, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {attendee.name}
                                  </Badge>
                                ))}
                                {meeting.attendees.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{meeting.attendees.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {meeting.milestones.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {meeting.milestones.slice(0, 2).map((milestone, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {milestone}
                                </Badge>
                              ))}
                              {meeting.milestones.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{meeting.milestones.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMeeting(meeting.id)}
                            className="text-muted-foreground hover:text-destructive p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default History