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
    <Card className="relative p-0 bg-white shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-3 font-bold text-lg tracking-wide text-center">
        MeetingMeeter Timer
      </div>
      
      <div className="p-8 bg-white">
        <div className="text-center space-y-8">
          {/* Display Panel */}
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-lg">
            <div className="space-y-6">
              {/* Timer Display */}
              <div className="space-y-2">
                <div className="text-blue-600 text-sm font-bold tracking-wider uppercase">
                  Elapsed Time
                </div>
                <div className={`text-6xl font-mono font-bold tracking-wider text-slate-900 ${isRunning ? 'animate-pulse-glow' : ''}`}
                     style={{ fontFamily: 'Courier New, monospace' }}>
                  {formatTime(seconds)}
                </div>
              </div>

              {/* Cost Display */}
              <div className="border-t border-slate-200 pt-6">
                <div className="text-blue-600 text-sm font-bold tracking-wider uppercase">
                  Current Cost
                </div>
                <div className={`text-5xl font-mono font-bold tracking-wider ${totalCost > 0 ? getCostColor() + ' animate-count-up' : 'text-slate-500'}`}
                     style={{ fontFamily: 'Courier New, monospace' }}>
                  {formatCurrency(totalCost)}
                </div>
                {totalHourlyRate > 0 && (
                  <div className="text-slate-600 text-sm font-bold mt-2">
                    Rate: {formatCurrency(totalHourlyRate)}/hour • {attendees.length} attendees
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 pt-4">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-green-600 text-white hover:bg-green-700 border-0 font-bold px-8 tracking-wide"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                size="lg"
                className="bg-amber-500 text-white hover:bg-amber-600 border-0 font-bold px-8 tracking-wide"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-bold px-8 tracking-wide"
            >
              <Square className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};