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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-base border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">MeetingMeeter</h1>
                  <p className="text-slate-600 font-medium">Real-time meeting cost tracking</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Professional Tool</div>
                <div className="text-xl font-bold text-blue-600 tracking-tight">Enterprise Ready</div>
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

            {/* Insights Card */}
            <Card className="p-8 bg-white shadow-lg border border-slate-200">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight text-slate-900">Meeting Insights</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-slate-700">• Average meeting costs $338/hour with 6 attendees</p>
                  <p className="font-medium text-slate-700">• 67% of employees report excessive meetings</p>
                  <p className="font-medium text-slate-700">• Cost awareness improves efficiency by 25%</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    Track meeting costs to drive better decision making
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
              Professional meeting cost calculator for modern teams
            </p>
            <p className="text-sm mt-2 font-medium">
              Simple, effective tools for better meeting management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
