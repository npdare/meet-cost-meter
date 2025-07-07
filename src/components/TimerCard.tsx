import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, Square, Clock } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface TimerCardProps {
  time: number
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSave?: () => void
  canSave: boolean
  formatTime: (seconds: number) => string
}

export const TimerCard = ({ 
  time, 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  onSave, 
  canSave, 
  formatTime 
}: TimerCardProps) => {
  const isMobile = useIsMobile()

  return (
    <Card className={`${isMobile ? 'p-4' : 'p-6'} bg-card/95 backdrop-blur-sm border shadow-lg`}>
      <div className={`${isMobile ? 'space-y-3' : 'space-y-6'}`}>
        <div className="flex items-center justify-center gap-2 text-foreground">
          <Clock className="w-5 h-5" />
          <span className="text-xl font-semibold">Meeting Duration</span>
        </div>
        <div className="text-center">
          <div className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-mono font-bold tracking-wider text-foreground ${isRunning ? 'animate-pulse-glow' : ''}`}>
            {formatTime(time)}
          </div>
        </div>
        <div className={`flex justify-center ${isMobile ? 'flex-col gap-3' : 'gap-4'}`}>
          {!isRunning ? (
            <Button 
              onClick={onStart} 
              size="lg" 
              className={`gap-2 gradient-bg hover:opacity-90 transition-all duration-300 shadow-lg ${isMobile ? 'w-full min-h-[48px]' : 'w-40'}`}
            >
              <Play className="w-4 h-4" />
              Start Meeting
            </Button>
          ) : (
            <Button 
              onClick={onPause} 
              size="lg" 
              className={`gap-2 bg-warning text-warning-foreground hover:bg-warning/90 transition-all duration-300 ${isMobile ? 'w-full min-h-[48px]' : 'w-40'}`}
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          <div className={`${isMobile ? 'flex gap-3' : 'flex gap-4'}`}>
            <Button 
              onClick={onReset} 
              size="lg" 
              variant="outline" 
              className={`gap-2 border-2 hover:bg-accent/50 ${isMobile ? 'flex-1 min-h-[48px]' : 'w-24'}`}
            >
              <Square className="w-4 h-4" />
              {!isMobile && "Reset"}
            </Button>
            {time > 0 && canSave && onSave && (
              <Button 
                onClick={onSave} 
                size="lg" 
                variant="outline" 
                className={`gap-2 border-2 hover:bg-accent/50 ${isMobile ? 'flex-1 min-h-[48px]' : 'w-36'}`}
              >
                {isMobile ? "Save" : "Save Meeting"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}