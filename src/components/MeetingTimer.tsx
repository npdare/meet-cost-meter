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
    <Card className="relative p-0 bg-slate-900 text-white shadow-elevated border-4 border-taxi-400 overflow-hidden">
      {/* Taxi Meter Header Strip */}
      <div className="bg-taxi-400 text-slate-900 px-6 py-3 font-bold text-lg tracking-wide text-center">
        🚕 CASHCLOCK METER • IN SERVICE
      </div>
      
      <div className="p-8 bg-slate-900">
        <div className="text-center space-y-8">
          {/* Digital LCD Display */}
          <div className="bg-slate-800 border-4 border-slate-700 p-8 rounded-lg">
            <div className="space-y-6">
              {/* Timer Display */}
              <div className="space-y-2">
                <div className="text-taxi-400 text-sm font-bold tracking-wider uppercase">
                  ELAPSED TIME
                </div>
                <div className={`text-6xl font-mono font-bold tracking-wider text-lcd-400 ${isRunning ? 'animate-pulse-glow' : ''}`}
                     style={{ fontFamily: 'Courier New, monospace', textShadow: '0 0 10px currentColor' }}>
                  {formatTime(seconds)}
                </div>
              </div>

              {/* Cost Display */}
              <div className="border-t-2 border-slate-700 pt-6">
                <div className="text-taxi-400 text-sm font-bold tracking-wider uppercase">
                  FARE
                </div>
                <div className={`text-5xl font-mono font-bold tracking-wider text-lcd-400 ${totalCost > 0 ? 'animate-count-up' : ''}`}
                     style={{ fontFamily: 'Courier New, monospace', textShadow: '0 0 10px currentColor' }}>
                  {formatCurrency(totalCost)}
                </div>
                {totalHourlyRate > 0 && (
                  <div className="text-taxi-300 text-sm font-bold mt-2">
                    RATE: {formatCurrency(totalHourlyRate)}/HR • {attendees.length} PASSENGERS
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
                className="bg-taxi-400 text-slate-900 hover:bg-taxi-300 border-0 font-bold px-8 tracking-wide"
              >
                <Play className="w-4 h-4 mr-2" />
                START METER
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                size="lg"
                className="bg-slate-700 text-taxi-400 hover:bg-slate-600 border-2 border-taxi-400 font-bold px-8 tracking-wide"
              >
                <Pause className="w-4 h-4 mr-2" />
                PAUSE
              </Button>
            )}
            <Button
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 font-bold px-8 tracking-wide"
            >
              <Square className="w-4 h-4 mr-2" />
              RESET
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};