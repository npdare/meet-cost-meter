import { useState, useCallback } from 'react';
import { MeetingTimer } from '@/components/MeetingTimer';
import { AttendeeManager } from '@/components/AttendeeManager';
import { CostSummary } from '@/components/CostSummary';
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-elevated border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meeting Cost Calculator</h1>
                <p className="text-slate-600 font-medium">Track the true cost of your meetings in real-time</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Enterprise Solution</div>
              <div className="text-xl font-bold text-blue-600 tracking-tight">Time is Money</div>
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
          </div>

          {/* Right Column - Attendee Management */}
          <div className="space-y-6">
            <AttendeeManager 
              attendees={attendees}
              onAttendeesChange={setAttendees}
            />

            {/* Quick Info Card */}
            <Card className="p-8 bg-slate-900 text-white shadow-elevated border-0">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight">Did you know?</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-medium">• The average meeting costs $338/hour with 6 attendees</p>
                  <p className="font-medium">• 67% of employees feel they have too many meetings</p>
                  <p className="font-medium">• Effective meetings can save companies 20-25% in operational costs</p>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-300 font-medium">
                    Make every meeting count with real-time cost awareness
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-slate-600">
          <div className="border-t border-slate-200 pt-12">
            <p className="font-semibold text-slate-900">
              Professional meeting cost calculator for enterprise teams
            </p>
            <p className="text-sm mt-2 font-medium">
              Contact sales for advanced features, integrations, and enterprise pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
