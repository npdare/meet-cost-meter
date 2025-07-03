import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Users } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Attendee {
  id: string;
  role: string;
  region: string;
  hourlySalary: number;
}

interface AttendeeManagerProps {
  attendees: Attendee[];
  onAttendeesChange: (attendees: Attendee[]) => void;
}

// Salary data based on median salaries by role and region
const salaryData: Record<string, Record<string, number>> = {
  'CEO': {
    'North America': 250,
    'Europe': 200,
    'Asia Pacific': 180,
    'Latin America': 120,
  },
  'VP/Director': {
    'North America': 150,
    'Europe': 120,
    'Asia Pacific': 100,
    'Latin America': 80,
  },
  'Senior Manager': {
    'North America': 100,
    'Europe': 85,
    'Asia Pacific': 70,
    'Latin America': 50,
  },
  'Manager': {
    'North America': 75,
    'Europe': 65,
    'Asia Pacific': 55,
    'Latin America': 40,
  },
  'Senior Engineer': {
    'North America': 85,
    'Europe': 70,
    'Asia Pacific': 60,
    'Latin America': 45,
  },
  'Engineer': {
    'North America': 65,
    'Europe': 55,
    'Asia Pacific': 45,
    'Latin America': 35,
  },
  'Analyst': {
    'North America': 55,
    'Europe': 45,
    'Asia Pacific': 40,
    'Latin America': 30,
  },
  'Coordinator': {
    'North America': 35,
    'Europe': 30,
    'Asia Pacific': 25,
    'Latin America': 20,
  },
};

const roles = Object.keys(salaryData);
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];

export const AttendeeManager = ({ attendees, onAttendeesChange }: AttendeeManagerProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const { formatCurrency } = useCurrency();

  const addAttendee = () => {
    if (!selectedRole || !selectedRegion) return;

    const hourlySalary = salaryData[selectedRole][selectedRegion];
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      role: selectedRole,
      region: selectedRegion,
      hourlySalary,
    };

    onAttendeesChange([...attendees, newAttendee]);
    setSelectedRole('');
    setSelectedRegion('');
  };

  const removeAttendee = (id: string) => {
    onAttendeesChange(attendees.filter(attendee => attendee.id !== id));
  };


  return (
    <Card className="p-8 shadow-elevated border border-slate-200">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Meeting Attendees</h3>
        </div>

        {/* Add Attendee Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="h-12 border-slate-300 font-medium">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {roles.map(role => (
                <SelectItem key={role} value={role} className="font-medium">{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="h-12 border-slate-300 font-medium">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {regions.map(region => (
                <SelectItem key={region} value={region} className="font-medium">{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={addAttendee} 
            disabled={!selectedRole || !selectedRegion}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Add Attendee
          </Button>
        </div>

        {/* Current Attendees */}
        {attendees.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Current Attendees ({attendees.length})</h4>
              <div className="text-sm text-slate-600 font-semibold">
                Total: {formatCurrency(attendees.reduce((sum, a) => sum + a.hourlySalary, 0))}/hour
              </div>
            </div>
            <div className="space-y-3">
              {attendees.map(attendee => (
                <div 
                  key={attendee.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-600">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{attendee.role}</div>
                      <div className="text-sm text-slate-600 font-medium">{attendee.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold border-blue-200">
                      {formatCurrency(attendee.hourlySalary)}/hour
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttendee(attendee.id)}
                      className="text-slate-600 hover:text-red-600 border-slate-300 font-medium"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {attendees.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="font-semibold text-slate-600">No attendees added yet</p>
            <p className="text-sm mt-1">Add attendees to start calculating meeting costs</p>
          </div>
        )}
      </div>
    </Card>
  );
};