import { useState, useCallback } from 'react';
import { MeetingTimer } from '@/components/MeetingTimer';
import { AttendeeManager } from '@/components/AttendeeManager';
import { CostSummary } from '@/components/CostSummary';
import { PurchaseTicker } from '@/components/PurchaseTicker';
import { Card } from '@/components/ui/card';
import { DollarSign, Clock } from 'lucide-react';

interface Attendee {
  id: string;
  role: string;
  region: string;
  hourlySalary: number;
}

const Index = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [currentCost, setCurrentCost] = useState(0);
  const [duration, setDuration] = useState(0);

  const totalHourlyRate = attendees.reduce((sum, attendee) => sum + attendee.hourlySalary, 0);

  const handleCostUpdate = useCallback((cost: number) => {
    setCurrentCost(cost);
    // Calculate duration based on cost and rate
    if (totalHourlyRate > 0) {
      setDuration(Math.floor((cost / totalHourlyRate) * 3600));
    }
  }, [totalHourlyRate]);

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Header */}
      <div className="bg-surface-2 shadow-elevated border-b border-surface-3">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-financial-600 border border-financial-500">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">CashClock</h1>
                  <p className="text-slate-300 font-medium">Real-time meeting cost tracker</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Financial Terminal</div>
                <div className="text-xl font-bold text-financial-400 tracking-tight">Live Market Data</div>
              </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Timer and Summary */}
          <div className="lg:col-span-2 space-y-8">
            <MeetingTimer 
              attendees={attendees} 
              onCostUpdate={handleCostUpdate}
            />
            
            <CostSummary
              totalCost={currentCost}
              attendeeCount={attendees.length}
              hourlyRate={totalHourlyRate}
              duration={duration}
            />

            <PurchaseTicker totalCost={currentCost} />
          </div>

          {/* Right Column - Attendee Management */}
          <div className="space-y-6">
            <AttendeeManager 
              attendees={attendees}
              onAttendeesChange={setAttendees}
            />

            {/* Market Insights Card */}
            <Card className="p-8 bg-surface-2 text-white shadow-elevated border border-surface-3">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-financial-600">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight text-financial-400">Market Insights</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-slate-300">• Average meeting ROI: <span className="text-loss-400">-$338/hour</span></p>
                  <p className="font-medium text-slate-300">• Meeting overhead: <span className="text-loss-400">67%</span> productivity loss</p>
                  <p className="font-medium text-slate-300">• Efficiency gains: <span className="text-gain-400">+25%</span> cost reduction</p>
                </div>
                <div className="pt-4 border-t border-surface-3">
                  <p className="text-xs text-slate-400 font-medium">
                    Real-time financial awareness drives meeting efficiency
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-slate-400">
          <div className="border-t border-surface-3 pt-12">
            <p className="font-semibold text-white">
              Enterprise financial analytics for meeting optimization
            </p>
            <p className="text-sm mt-2 font-medium">
              Contact sales for Bloomberg terminal integration and institutional pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
