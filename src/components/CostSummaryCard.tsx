import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp } from "lucide-react"
import { CostTicker } from "@/components/CostTicker"
import { useIsMobile } from "@/hooks/use-mobile"
import { RoleQuantityEntry } from "@/components/FreeRoleQuantityList"

interface CostSummaryCardProps {
  totalCost: number
  isRunning: boolean
  roleEntries: RoleQuantityEntry[]
  time: number
  billByMinute: boolean
  achievedMilestones: string[]
}

export const CostSummaryCard = ({ 
  totalCost, 
  isRunning, 
  roleEntries, 
  time, 
  billByMinute, 
  achievedMilestones 
}: CostSummaryCardProps) => {
  const isMobile = useIsMobile()
  
  const totalAttendees = roleEntries.reduce((sum, entry) => sum + entry.count, 0)
  const totalHourlyRate = roleEntries.reduce((sum, entry) => sum + (entry.count * entry.rate), 0)

  return (
    <Card className={`${isMobile ? 'h-auto' : 'h-96'} bg-card/80 backdrop-blur-sm border shadow-sm`}>
      <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}`}>
        <div className="flex items-center justify-center gap-2 text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-xl font-semibold">Meeting Cost</span>
        </div>
        <div className="text-center">
          <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-mono font-bold tracking-wider text-foreground`}>
            <CostTicker cost={totalCost} isRunning={isRunning} />
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {totalAttendees} attendee{totalAttendees !== 1 ? "s" : ""} • $
            {totalHourlyRate.toFixed(2)}/hour
            {billByMinute && <span className="text-xs"> • Billed by minute</span>}
          </div>
        </div>
        
        {/* Cost Breakdown */}
        <div className={`grid grid-cols-3 ${isMobile ? 'gap-1' : 'gap-2'}`}>
          <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
            <div className="text-sm font-semibold text-foreground">${totalHourlyRate.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
          <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
            <div className="text-sm font-semibold text-foreground">${(totalCost / Math.max(time / 60, 1)).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">per minute</div>
          </div>
          <div className="bg-secondary/50 p-2 rounded-lg text-center backdrop-blur-sm">
            <div className="text-sm font-semibold text-foreground">{totalAttendees}</div>
            <div className="text-xs text-muted-foreground">attendees</div>
          </div>
        </div>
        
        {/* Milestones Section */}
        {achievedMilestones.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Cost Milestones</span>
            </div>
            <ScrollArea className="h-24">
              <div className="space-y-2 pb-2">
                {achievedMilestones.map((milestone, index) => (
                  <div key={index} className="p-2 bg-secondary/30 rounded text-sm text-foreground">
                    {milestone}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </Card>
  )
}