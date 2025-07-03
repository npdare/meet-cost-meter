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

  const getCostColor = () => {
    if (totalCost === 0) return 'text-slate-600';
    if (totalCost < 50) return 'text-cost-low';
    if (totalCost < 150) return 'text-cost-medium';
    if (totalCost < 300) return 'text-cost-high';
    return 'text-cost-critical';
  };

  return (
    <Card className="p-8 bg-blue-600 text-white shadow-elevated border-0">
      <div className="text-center space-y-8">
        {/* Timer Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-100">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wider uppercase">Duration</span>
          </div>
          <div className={`text-7xl font-bold font-mono tracking-tight ${isRunning ? 'animate-pulse-glow' : ''}`}>
            {formatTime(seconds)}
          </div>
        </div>

        {/* Cost Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-100">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wider uppercase">Live Cost</span>
          </div>
          <div className={`text-5xl font-bold tracking-tight ${getCostColor()} ${totalCost > 0 ? 'animate-count-up' : ''}`}>
            {formatCurrency(totalCost)}
          </div>
          {totalHourlyRate > 0 && (
            <div className="text-blue-200 text-sm font-medium">
              {formatCurrency(totalHourlyRate)}/hour • {attendees.length} attendees
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 pt-6">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold px-8"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Meeting
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            size="lg"
            variant="outline"
            className="border-blue-300 text-blue-100 hover:bg-blue-500 hover:border-blue-500 font-semibold px-8"
          >
            <Square className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};