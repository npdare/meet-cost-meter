import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Trophy, Trash2 } from "lucide-react"

interface MeetingRecord {
  id: string
  date: Date
  duration: number
  totalCost: number
  attendeeCount: number
  milestones: string[]
  attendees: Array<{name: string; role: string; hourlyRate: number}>
}

interface MeetingHistoryProps {
  onSetSaveFunction?: (saveFn: (meeting: Omit<MeetingRecord, 'id' | 'date'>) => void) => void
}

export const MeetingHistory = ({ onSetSaveFunction }: MeetingHistoryProps) => {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('meetingHistory')
    if (saved) {
      const parsed = JSON.parse(saved).map((m: any) => ({
        ...m,
        date: new Date(m.date)
      }))
      setMeetings(parsed)
    }
  }, [])

  const saveMeetingsToStorage = (updatedMeetings: MeetingRecord[]) => {
    localStorage.setItem('meetingHistory', JSON.stringify(updatedMeetings))
    setMeetings(updatedMeetings)
  }

  const addMeeting = (meetingData: Omit<MeetingRecord, 'id' | 'date'>) => {
    const newMeeting: MeetingRecord = {
      ...meetingData,
      id: Date.now().toString(),
      date: new Date()
    }
    const updatedMeetings = [newMeeting, ...meetings].slice(0, 50) // Keep last 50 meetings
    saveMeetingsToStorage(updatedMeetings)
  }

  const deleteMeeting = (id: string) => {
    const updatedMeetings = meetings.filter(m => m.id !== id)
    saveMeetingsToStorage(updatedMeetings)
  }

  const clearAllMeetings = () => {
    localStorage.removeItem('meetingHistory')
    setMeetings([])
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getBadgeForCost = (cost: number) => {
    if (cost >= 1000) return { label: "💰 Big Spender", color: "bg-red-500" }
    if (cost >= 500) return { label: "💸 Expensive", color: "bg-orange-500" }
    if (cost >= 200) return { label: "💵 Pricey", color: "bg-yellow-500" }
    if (cost >= 100) return { label: "💴 Moderate", color: "bg-green-500" }
    return { label: "💲 Budget", color: "bg-blue-500" }
  }

  // Expose the addMeeting function to parent
  useEffect(() => {
    if (onSetSaveFunction) {
      onSetSaveFunction(addMeeting)
    }
  }, [onSetSaveFunction])

  const totalWasted = meetings.reduce((sum, m) => sum + m.totalCost, 0)
  const totalTime = meetings.reduce((sum, m) => sum + m.duration, 0)
  const mostExpensive = meetings.reduce((max, m) => m.totalCost > max.totalCost ? m : max, meetings[0])

  if (meetings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No meetings saved yet</p>
          <p className="text-xs">Start a meeting to track your costs!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Meeting History
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllMeetings}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">${totalWasted.toFixed(2)}</div>
            <div className="text-xs text-gray-600">Total Wasted</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatDuration(totalTime)}</div>
            <div className="text-xs text-gray-600">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{meetings.length}</div>
            <div className="text-xs text-gray-600">Meetings</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {meetings.slice(0, isExpanded ? undefined : 5).map((meeting) => {
            const badge = getBadgeForCost(meeting.totalCost)
            return (
              <div key={meeting.id} className="p-3 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {meeting.date.toLocaleDateString()}
                    </span>
                    <Badge className={`text-xs text-white ${badge.color}`}>
                      {badge.label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMeeting(meeting.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>💰 ${meeting.totalCost.toFixed(2)}</div>
                  <div>⏱️ {formatDuration(meeting.duration)}</div>
                  <div>👥 {meeting.attendeeCount} people</div>
                </div>
                
                {meeting.milestones.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {meeting.milestones.length} milestone{meeting.milestones.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {!isExpanded && meetings.length > 5 && (
          <div className="text-center mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(true)}
              className="text-gray-600"
            >
              +{meetings.length - 5} more meetings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Export function to be used by parent component
export const useMeetingHistory = () => {
  const [saveMeetingFn, setSaveMeetingFn] = useState<((meeting: Omit<MeetingRecord, 'id' | 'date'>) => void) | null>(null)
  
  const saveMeeting = (meetingData: {
    duration: number
    totalCost: number
    attendeeCount: number
    milestones: string[]
    attendees: Array<{name: string; role: string; hourlyRate: number}>
  }) => {
    if (saveMeetingFn) {
      saveMeetingFn(meetingData)
    }
  }
  
  return { saveMeeting, setSaveMeetingFn }
}