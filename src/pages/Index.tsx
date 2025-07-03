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
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Meeting Cost Calculator</h1>
                <p className="text-text-secondary">Track the true cost of your meetings in real-time</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary">Enterprise Solution</div>
              <div className="text-lg font-semibold text-primary">Time is Money</div>
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
            <Card className="p-6 bg-gradient-to-br from-money-green to-profit-green text-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-semibold">Did you know?</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>• The average meeting costs $338/hour with 6 attendees</p>
                  <p>• 67% of employees feel they have too many meetings</p>
                  <p>• Effective meetings can save companies 20-25% in operational costs</p>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <p className="text-xs opacity-90">
                    Make every meeting count with real-time cost awareness
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-text-secondary">
          <div className="border-t pt-8">
            <p className="text-sm">
              Professional meeting cost calculator for enterprise teams
            </p>
            <p className="text-xs mt-2">
              Contact sales for advanced features, integrations, and enterprise pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
