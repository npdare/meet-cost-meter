import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react';

interface CostSummaryProps {
  totalCost: number;
  attendeeCount: number;
  hourlyRate: number;
  duration: number; // in seconds
}

export const CostSummary = ({ totalCost, attendeeCount, hourlyRate, duration }: CostSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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

  const stats = [
    {
      label: 'Current Cost',
      value: formatCurrency(totalCost),
      icon: DollarSign,
      gradient: 'bg-gradient-success',
    },
    {
      label: 'Attendees',
      value: attendeeCount.toString(),
      icon: Users,
      gradient: 'bg-gradient-primary',
    },
    {
      label: 'Rate/Hour',
      value: formatCurrency(hourlyRate),
      icon: TrendingUp,
      gradient: 'bg-gradient-primary',
    },
    {
      label: 'Duration',
      value: formatTime(duration),
      icon: Clock,
      gradient: 'bg-gradient-primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.gradient}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Projections */}
      {attendeeCount > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Projections</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-neutral-gray rounded-lg">
              <div className="text-2xl font-bold text-money-green">
                {formatCurrency(costPerMinute * 15)}
              </div>
              <div className="text-sm text-muted-foreground">15 minutes</div>
            </div>
            <div className="text-center p-4 bg-neutral-gray rounded-lg">
              <div className="text-2xl font-bold text-money-green">
                {formatCurrency(costPerMinute * 30)}
              </div>
              <div className="text-sm text-muted-foreground">30 minutes</div>
            </div>
            <div className="text-center p-4 bg-neutral-gray rounded-lg">
              <div className="text-2xl font-bold text-money-green">
                {formatCurrency(projectedHourCost)}
              </div>
              <div className="text-sm text-muted-foreground">1 hour</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};