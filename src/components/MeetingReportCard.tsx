import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Share2, Download, Copy, Trophy, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MeetingReportCardProps {
  totalCost: number
  duration: number
  attendeeCount: number
  milestones: string[]
  attendees: Array<{name: string; role: string; hourlyRate: number}>
}

export const MeetingReportCard = ({ 
  totalCost, 
  duration, 
  attendeeCount, 
  milestones,
  attendees 
}: MeetingReportCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getGrade = (cost: number, duration: number) => {
    const costPerMinute = cost / Math.max(duration / 60, 1)
    if (costPerMinute < 5) return { grade: "A+", color: "text-green-600", desc: "Efficient Champion" }
    if (costPerMinute < 10) return { grade: "A", color: "text-green-500", desc: "Pretty Good" }
    if (costPerMinute < 20) return { grade: "B", color: "text-yellow-500", desc: "Could Be Better" }
    if (costPerMinute < 40) return { grade: "C", color: "text-orange-500", desc: "Getting Expensive" }
    if (costPerMinute < 80) return { grade: "D", color: "text-red-500", desc: "Money Burner" }
    return { grade: "F", color: "text-red-700", desc: "RIP Budget" }
  }

  const getFunnyComment = (cost: number, duration: number, attendeeCount: number) => {
    const costPerMinute = cost / Math.max(duration / 60, 1)
    
    if (costPerMinute > 100) {
      return "🚨 EMERGENCY: This meeting costs more per minute than most people make in an hour!"
    }
    if (costPerMinute > 50) {
      return "💸 At this rate, you could have hired a consultant instead of having this meeting."
    }
    if (costPerMinute > 20) {
      return "🤔 For this cost, everyone could have gotten premium coffee and worked alone."
    }
    if (duration > 3600) {
      return "⏰ Congrats! You've achieved the rare 'meeting that could have been an email' final form."
    }
    if (attendeeCount > 8) {
      return "👥 With this many people, you could have started a small village instead."
    }
    if (cost < 20) {
      return "✨ Actually not bad! This meeting was cheaper than most lunch orders."
    }
    
    return "📊 A perfectly average waste of corporate resources. Well done!"
  }

  const getProductivityScore = (cost: number, duration: number) => {
    const costPerMinute = cost / Math.max(duration / 60, 1)
    const score = Math.max(0, Math.min(100, 100 - (costPerMinute * 2)))
    return Math.round(score)
  }

  const generateReportCard = () => {
    const grade = getGrade(totalCost, duration)
    const comment = getFunnyComment(totalCost, duration, attendeeCount)
    const productivityScore = getProductivityScore(totalCost, duration)
    
    return {
      grade,
      comment,
      productivityScore,
      stats: {
        costPerMinute: (totalCost / Math.max(duration / 60, 1)).toFixed(2),
        costPerPerson: (totalCost / Math.max(attendeeCount, 1)).toFixed(2),
        milestoneCount: milestones.length
      }
    }
  }

  const shareReportCard = async () => {
    const report = generateReportCard()
    const shareText = `📊 MEETING REPORT CARD 📊

Grade: ${report.grade.grade} (${report.grade.desc})
💰 Total Cost: $${totalCost.toFixed(2)}
⏱️ Duration: ${formatDuration(duration)}
👥 Attendees: ${attendeeCount}
📈 Productivity Score: ${report.productivityScore}/100

${report.comment}

Track your meeting costs at MeetingMeter! 📈💸`

    try {
      await navigator.clipboard.writeText(shareText)
      toast({
        title: "Report card copied!",
        description: "Share your meeting efficiency (or lack thereof) 😄",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const downloadReportCard = () => {
    const report = generateReportCard()
    const canvas = document.createElement('canvas')
    
    // Dynamic canvas sizing based on content
    const baseHeight = 600
    const extraHeight = milestones.length > 0 ? 100 : 0
    canvas.width = 600
    canvas.height = baseHeight + extraHeight
    
    const ctx = canvas.getContext('2d')!
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 600, canvas.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 600, canvas.height)
    
    // Header
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('📊 MEETING REPORT CARD 📊', 300, 80)
    
    // Grade
    ctx.font = 'bold 72px Arial'
    ctx.fillText(report.grade.grade, 300, 180)
    
    ctx.font = '24px Arial'
    ctx.fillText(report.grade.desc, 300, 220)
    
    // Stats
    ctx.font = '20px Arial'
    ctx.textAlign = 'left'
    let yPos = 280
    
    ctx.fillText(`💰 Total Cost: $${totalCost.toFixed(2)}`, 50, yPos)
    yPos += 35
    ctx.fillText(`⏱️ Duration: ${formatDuration(duration)}`, 50, yPos)
    yPos += 35
    
    if (attendeeCount > 0) {
      ctx.fillText(`👥 Attendees: ${attendeeCount}`, 50, yPos)
      yPos += 35
    }
    
    ctx.fillText(`📈 Productivity Score: ${report.productivityScore}/100`, 50, yPos)
    yPos += 35
    
    if (milestones.length > 0) {
      ctx.fillText(`🏆 Milestones Hit: ${milestones.length}`, 50, yPos)
      yPos += 50
    } else {
      yPos += 20
    }
    
    // Comment (wrapped)
    ctx.font = '18px Arial'
    ctx.textAlign = 'center'
    const words = report.comment.split(' ')
    let line = ''
    let commentY = yPos + 30
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > 500 && n > 0) {
        ctx.fillText(line, 300, commentY)
        line = words[n] + ' '
        commentY += 25
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 300, commentY)
    
    // Footer
    ctx.font = '16px Arial'
    ctx.fillText('Generated by MeetingMeter', 300, canvas.height - 30)
    
    // Download
    const link = document.createElement('a')
    link.download = 'meeting-report-card.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        size="sm"
        disabled={duration === 0}
      >
        <FileText className="w-4 h-4" />
        Generate Report Card
      </Button>
    )
  }

  const report = generateReportCard()

  return (
    <Card className="mt-4 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <FileText className="w-5 h-5" />
            Meeting Report Card
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Grade Section */}
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className={`text-6xl font-bold ${report.grade.color} mb-2`}>
            {report.grade.grade}
          </div>
          <Badge variant="outline" className="text-sm">
            {report.grade.desc}
          </Badge>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600">${totalCost.toFixed(2)}</div>
            <div className="text-xs text-gray-600">Total Cost</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-600">{formatDuration(duration)}</div>
            <div className="text-xs text-gray-600">Duration</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-600">{attendeeCount}</div>
            <div className="text-xs text-gray-600">Attendees</div>
          </div>
          <div className="bg-white p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-600">{report.productivityScore}/100</div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
        </div>
        
        {/* Detailed Stats */}
        <div className="bg-white p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>💰 Cost per minute:</span>
            <span className="font-medium">${report.stats.costPerMinute}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>👤 Cost per person:</span>
            <span className="font-medium">${report.stats.costPerPerson}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🏆 Milestones achieved:</span>
            <span className="font-medium">{report.stats.milestoneCount}</span>
          </div>
        </div>
        
        {/* Funny Comment */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{report.comment}</p>
          </div>
        </div>
        
        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-sm">Milestones Achieved</span>
            </div>
            <div className="space-y-1">
              {milestones.slice(0, 3).map((milestone, index) => (
                <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {milestone}
                </div>
              ))}
              {milestones.length > 3 && (
                <div className="text-xs text-gray-500">+{milestones.length - 3} more...</div>
              )}
            </div>
          </div>
        )}
        
        {/* Share Actions */}
        <div className="flex gap-2">
          <Button
            onClick={shareReportCard}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Copy className="w-4 h-4" />
            Copy Report
          </Button>
          
          <Button
            onClick={downloadReportCard}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}