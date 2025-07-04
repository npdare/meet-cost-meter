import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Users, Calendar, Loader2, Download } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

interface CalendarAttendee {
  email: string;
  name: string;
  selectedRole?: string;
  selectedRegion?: string;
  estimatedSalary?: number;
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
  const [calendarAttendees, setCalendarAttendees] = useState<CalendarAttendee[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportFlow, setShowImportFlow] = useState(false);
  const [loadingSalary, setLoadingSalary] = useState<string>('');
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();

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

  const fetchRecentCalendarAttendees = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to import calendar attendees",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      // Get recent calendar events with attendees
      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_meeting', true)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('start_time', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Extract unique attendees
      const attendeeMap = new Map<string, CalendarAttendee>();
      
      events?.forEach(event => {
        if (event.attendees && Array.isArray(event.attendees)) {
          event.attendees.forEach((attendee: any) => {
            if (attendee.email && !attendeeMap.has(attendee.email)) {
              attendeeMap.set(attendee.email, {
                email: attendee.email,
                name: attendee.name || attendee.email.split('@')[0],
              });
            }
          });
        }
      });

      const uniqueAttendees = Array.from(attendeeMap.values());
      setCalendarAttendees(uniqueAttendees);
      setShowImportFlow(true);

      toast({
        title: "Calendar attendees found",
        description: `Found ${uniqueAttendees.length} unique attendees from recent meetings`,
      });

    } catch (error) {
      console.error('Error fetching calendar attendees:', error);
      toast({
        title: "Error importing attendees",
        description: "Failed to fetch calendar attendees. Make sure you have connected your calendar.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getSalaryEstimate = async (role: string, region: string, attendeeEmail: string) => {
    setLoadingSalary(attendeeEmail);
    try {
      const { data, error } = await supabase.functions.invoke('salary-lookup', {
        body: { role, region }
      });

      if (error) throw error;

      return data.hourly_rate;
    } catch (error) {
      console.error('Error fetching salary estimate:', error);
      toast({
        title: "Salary lookup failed",
        description: "Using default rate. You can adjust manually.",
        variant: "destructive",
      });
      return salaryData[role]?.[region] || 75; // Fallback to static data
    } finally {
      setLoadingSalary('');
    }
  };

  const updateCalendarAttendeeRole = async (email: string, role: string) => {
    const attendee = calendarAttendees.find(a => a.email === email);
    if (!attendee || !attendee.selectedRegion) return;

    const salary = await getSalaryEstimate(role, attendee.selectedRegion, email);
    
    setCalendarAttendees(prev => prev.map(a => 
      a.email === email 
        ? { ...a, selectedRole: role, estimatedSalary: salary }
        : a
    ));
  };

  const updateCalendarAttendeeRegion = async (email: string, region: string) => {
    const attendee = calendarAttendees.find(a => a.email === email);
    if (!attendee) return;

    setCalendarAttendees(prev => prev.map(a => 
      a.email === email 
        ? { ...a, selectedRegion: region }
        : a
    ));

    // If role is already selected, get new salary estimate
    if (attendee.selectedRole) {
      const salary = await getSalaryEstimate(attendee.selectedRole, region, email);
      setCalendarAttendees(prev => prev.map(a => 
        a.email === email 
          ? { ...a, estimatedSalary: salary }
          : a
      ));
    }
  };

  const importSelectedAttendees = () => {
    const attendeesToImport = calendarAttendees
      .filter(a => a.selectedRole && a.selectedRegion && a.estimatedSalary)
      .map(a => ({
        id: Date.now().toString() + Math.random(),
        role: a.selectedRole!,
        region: a.selectedRegion!,
        hourlySalary: a.estimatedSalary!,
      }));

    if (attendeesToImport.length === 0) {
      toast({
        title: "No attendees selected",
        description: "Please select role and region for attendees to import",
        variant: "destructive",
      });
      return;
    }

    onAttendeesChange([...attendees, ...attendeesToImport]);
    setShowImportFlow(false);
    setCalendarAttendees([]);

    toast({
      title: "Attendees imported!",
      description: `Added ${attendeesToImport.length} attendees with AI-estimated salaries`,
    });
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

        {/* Calendar Import Button */}
        <div className="flex justify-center pb-4 border-b border-slate-200">
          <Button 
            onClick={fetchRecentCalendarAttendees}
            disabled={isImporting || !user}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            {isImporting ? 'Loading...' : 'Import from Calendar'}
          </Button>
        </div>

        {/* Calendar Import Flow */}
        {showImportFlow && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Calendar Attendees Found</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowImportFlow(false)}
                  className="text-slate-600"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-sm text-slate-600">Select roles and regions for attendees. AI will estimate salaries automatically.</p>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {calendarAttendees.map(attendee => (
                  <div key={attendee.email} className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                      <div className="md:col-span-1">
                        <div className="font-medium text-slate-900">{attendee.name}</div>
                        <div className="text-xs text-slate-500 truncate">{attendee.email}</div>
                      </div>
                      
                      <Select 
                        value={attendee.selectedRole || ''} 
                        onValueChange={(role) => updateCalendarAttendeeRole(attendee.email, role)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={attendee.selectedRegion || ''} 
                        onValueChange={(region) => updateCalendarAttendeeRegion(attendee.email, region)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        {loadingSalary === attendee.email ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-slate-500">Loading...</span>
                          </div>
                        ) : attendee.estimatedSalary ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {formatCurrency(attendee.estimatedSalary)}/hr
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">Select role & region</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportFlow(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={importSelectedAttendees}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  disabled={calendarAttendees.every(a => !a.selectedRole || !a.selectedRegion)}
                >
                  <Download className="w-4 h-4" />
                  Import Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Manual Add Attendee Form */}
        {!showImportFlow && (
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Add Manually</h4>
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
          </div>
        )}

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