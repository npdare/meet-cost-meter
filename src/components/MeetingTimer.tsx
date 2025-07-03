import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Play, Pause, Square, DollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface MeetingTimerProps {
  attendees: Array<{ role: string; region: string; hourlySalary: number }>;
  onCostUpdate: (cost: number) => void;
}

export const MeetingTimer = ({ attendees, onCostUpdate }: MeetingTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const { formatCurrency } = useCurrency();

  const totalHourlyRate = attendees.reduce((sum, attendee) => sum + attendee.hourlySalary, 0);
  const costPerSecond = totalHourlyRate / 3600;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const currentCost = seconds * costPerSecond;
    setTotalCost(currentCost);
    onCostUpdate(currentCost);
  }, [seconds, costPerSecond, onCostUpdate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setTotalCost(0);
  };

  return (
    <Card className="p-8 bg-gradient-primary text-white shadow-large">
      <div className="text-center space-y-6">
        {/* Timer Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Meeting Duration</span>
          </div>
          <div className={`text-6xl font-bold font-mono ${isRunning ? 'animate-pulse-glow' : ''}`}>
            {formatTime(seconds)}
          </div>
        </div>

        {/* Cost Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-white/80">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Total Cost</span>
          </div>
          <div className={`text-4xl font-bold ${totalCost > 0 ? 'animate-count-up' : ''}`}>
            {formatCurrency(totalCost)}
          </div>
          {totalHourlyRate > 0 && (
            <div className="text-white/70 text-sm">
              Rate: {formatCurrency(totalHourlyRate)}/hour
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 pt-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-white/20 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Meeting
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="lg"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-white/20 text-white"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            size="lg"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 border-white/20 text-white"
          >
            <Square className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};