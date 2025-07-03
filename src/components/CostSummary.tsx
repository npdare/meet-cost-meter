import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface CostSummaryProps {
  totalCost: number;
  attendeeCount: number;
  hourlyRate: number;
  duration: number; // in seconds
}

export const CostSummary = ({ totalCost, attendeeCount, hourlyRate, duration }: CostSummaryProps) => {
  const { formatCurrency } = useCurrency();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const projectedHourCost = hourlyRate;
  const costPerMinute = hourlyRate / 60;

  const getCostStatus = () => {
    if (totalCost === 0) return 'low';
    if (totalCost < 50) return 'low';
    if (totalCost < 150) return 'medium';
    if (totalCost < 300) return 'high';
    return 'critical';
  };

  const stats = [
    {
      label: 'Current Cost',
      value: formatCurrency(totalCost),
      icon: DollarSign,
      color: getCostStatus() === 'low' ? 'bg-slate-600' : 
             getCostStatus() === 'medium' ? 'bg-cost-medium' :
             getCostStatus() === 'high' ? 'bg-cost-high' : 'bg-cost-critical',
    },
    {
      label: 'Attendees',
      value: attendeeCount.toString(),
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      label: 'Rate/Hour',
      value: formatCurrency(hourlyRate),
      icon: TrendingUp,
      color: 'bg-slate-600',
    },
    {
      label: 'Duration',
      value: formatTime(duration),
      icon: Clock,
      color: 'bg-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 shadow-sharp border border-slate-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Projections */}
      {attendeeCount > 0 && (
        <Card className="p-8 shadow-elevated border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Cost Projections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-slate-50 border border-slate-200">
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(costPerMinute * 15)}
              </div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">15 minutes</div>
            </div>
            <div className="text-center p-6 bg-slate-50 border border-slate-200">
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(costPerMinute * 30)}
              </div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">30 minutes</div>
            </div>
            <div className="text-center p-6 bg-slate-50 border border-slate-200">
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(projectedHourCost)}
              </div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-2">1 hour</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};