import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { FileDown, FileText, Table, BarChart3 } from "lucide-react"

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

export const MeetingExport = () => {
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const { user } = useAuth()
  const { toast } = useToast()

  const exportMeetings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data: meetings, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedMeetings = meetings?.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        date: new Date(meeting.created_at).toLocaleDateString(),
        duration: formatTime(meeting.duration_seconds),
        cost: `$${meeting.total_cost.toFixed(2)}`,
        attendees: meeting.attendee_count,
        attendee_list: Array.isArray(meeting.attendees) ? meeting.attendees.map((a: any) => `${a.name} (${a.role})`).join(', ') : '',
        milestones: Array.isArray(meeting.milestones) ? meeting.milestones.join(', ') : ''
      })) || []

      if (format === 'csv') {
        downloadCSV(processedMeetings)
      } else if (format === 'json') {
        downloadJSON(processedMeetings)
      } else if (format === 'pdf') {
        generatePDFReport(processedMeetings)
      }

      toast({
        title: "Export successful",
        description: `Downloaded ${processedMeetings.length} meetings as ${format.toUpperCase()}`,
      })
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const downloadCSV = (meetings: any[]) => {
    if (meetings.length === 0) {
      toast({
        title: "No data to export",
        description: "You don't have any meetings to export yet.",
        variant: "destructive",
      })
      return
    }

    const headers = ['Title', 'Date', 'Duration', 'Cost', 'Attendees', 'Attendee List', 'Milestones']
    const csvContent = [
      headers.join(','),
      ...meetings.map(meeting => [
        `"${meeting.title}"`,
        `"${meeting.date}"`,
        `"${meeting.duration}"`,
        `"${meeting.cost}"`,
        meeting.attendees,
        `"${meeting.attendee_list}"`,
        `"${meeting.milestones}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meeting-history-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadJSON = (meetings: any[]) => {
    const jsonContent = JSON.stringify(meetings, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meeting-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const generatePDFReport = (meetings: any[]) => {
    // Simple HTML-based PDF report
    const totalCost = meetings.reduce((sum, m) => sum + parseFloat(m.cost.replace('$', '')), 0)
    const totalMeetings = meetings.length
    const totalDuration = meetings.reduce((sum, m) => {
      const [hours, minutes, seconds] = m.duration.split(':').map(Number)
      return sum + (hours * 3600 + minutes * 60 + seconds)
    }, 0)

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Meeting History Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .meeting { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .meeting:last-child { border-bottom: none; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Meeting History Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Meetings:</strong> ${totalMeetings}</p>
            <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
            <p><strong>Total Time:</strong> ${formatTime(totalDuration)}</p>
            <p><strong>Average Cost per Meeting:</strong> $${(totalCost / totalMeetings || 0).toFixed(2)}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Meeting Title</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Attendees</th>
              </tr>
            </thead>
            <tbody>
              ${meetings.map(meeting => `
                <tr>
                  <td>${meeting.title}</td>
                  <td>${meeting.date}</td>
                  <td>${meeting.duration}</td>
                  <td>${meeting.cost}</td>
                  <td>${meeting.attendees}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([reportHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meeting-report-${new Date().toISOString().split('T')[0]}.html`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="w-5 h-5 text-primary" />
          Export Meeting Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={format} onValueChange={(value: any) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  CSV (Spreadsheet)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  JSON (Data)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  HTML Report
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={exportMeetings}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Exporting..." : `Export as ${format.toUpperCase()}`}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>CSV:</strong> Spreadsheet format for Excel/Google Sheets</p>
          <p><strong>JSON:</strong> Raw data format for developers</p>
          <p><strong>HTML Report:</strong> Formatted report with summary statistics</p>
        </div>
      </CardContent>
    </Card>
  )
}