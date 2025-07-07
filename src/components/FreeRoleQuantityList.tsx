import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Plus, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { fetchRateForRole } from '@/integrations/gpt'

export interface RoleQuantityEntry {
  id: string
  count: number
  role: string
  rate: number
  isLoading?: boolean
  // Advanced fields (Pro only)
  name?: string
  email?: string
}

interface FreeRoleQuantityListProps {
  entries: RoleQuantityEntry[]
  onEntriesChange: (entries: RoleQuantityEntry[]) => void
}

export const FreeRoleQuantityList = ({ entries, onEntriesChange }: FreeRoleQuantityListProps) => {
  const [newCount, setNewCount] = useState(1)
  const [newRole, setNewRole] = useState('')
  const [industry, setIndustry] = useState('Technology')
  const { user, isPremium, profile } = useAuth()
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleRoleBlur = useCallback(async (entryId: string, role: string) => {
    if (!role.trim()) return

    // Set loading state
    onEntriesChange(
      entries.map(entry =>
        entry.id === entryId ? { ...entry, isLoading: true } : entry
      )
    )

    try {
      const rate = await fetchRateForRole(role.trim(), industry)
      
      onEntriesChange(
        entries.map(entry =>
          entry.id === entryId 
            ? { ...entry, rate, isLoading: false }
            : entry
        )
      )
    } catch (error) {
      console.error('Failed to fetch rate:', error)
      onEntriesChange(
        entries.map(entry =>
          entry.id === entryId ? { ...entry, isLoading: false } : entry
        )
      )
    }
  }, [entries, onEntriesChange, industry])

  const addNewEntry = async () => {
    if (!newRole.trim()) return

    const newEntry: RoleQuantityEntry = {
      id: Date.now().toString(),
      count: newCount,
      role: newRole.trim(),
      rate: 0,
      isLoading: true
    }

    const updatedEntries = [...entries, newEntry]
    onEntriesChange(updatedEntries)

    // Fetch rate for new entry
    try {
      const rate = await fetchRateForRole(newRole.trim(), industry)
      onEntriesChange(
        updatedEntries.map(entry =>
          entry.id === newEntry.id ? { ...entry, rate, isLoading: false } : entry
        )
      )
    } catch (error) {
      onEntriesChange(
        updatedEntries.map(entry =>
          entry.id === newEntry.id ? { ...entry, rate: 75, isLoading: false } : entry
        )
      )
    }

    // Reset form
    setNewCount(1)
    setNewRole('')
  }

  const removeEntry = (id: string) => {
    onEntriesChange(entries.filter(entry => entry.id !== id))
  }

  const updateEntry = (id: string, updates: Partial<RoleQuantityEntry>) => {
    onEntriesChange(
      entries.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    )
  }


  const totalRate = entries.reduce((sum, entry) => sum + (entry.count * entry.rate), 0)

  return (
    <div className={`h-full flex flex-col ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} flex-shrink-0`}>
        <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-primary/10 rounded-lg`}>
          <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
        </div>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-foreground`}>Meeting Attendees</h3>
      </div>

      {/* Industry Selection & Saved Members */}
      <div className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg ${isMobile ? 'p-2' : 'p-3'} flex-shrink-0`}>
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col sm:flex-row gap-3'} items-start`}>
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-1 block">
              Industry/Region
            </label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className={`${isMobile ? 'h-10' : 'h-9'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isPremium && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1 block">
                Quick Add
              </label>
              <Button
                onClick={() => {
                  toast({
                    title: "Coming soon",
                    description: "Add saved members feature is coming soon",
                  })
                }}
                className={`${isMobile ? 'h-10 px-4' : 'h-9 px-3'} gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium`}
              >
                <Plus className="w-4 h-4" />
                Add Saved
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add New Entry Form */}
      <div className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg ${isMobile ? 'p-2' : 'p-3'} flex-shrink-0`}>
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col sm:flex-row gap-2'}`}>
          <div className="flex-shrink-0">
            <Input
              type="number"
              min="1"
              value={newCount}
              onChange={(e) => setNewCount(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="1"
              className={`${isMobile ? 'h-10 w-full' : 'h-9 w-16'} text-center font-medium`}
            />
          </div>
          <div className="flex-1">
            <Input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Senior Engineer"
              className={`${isMobile ? 'h-10' : 'h-9'} font-medium`}
              onKeyPress={(e) => e.key === 'Enter' && addNewEntry()}
            />
          </div>
          <Button 
            onClick={addNewEntry}
            disabled={!newRole.trim()}
            className={`${isMobile ? 'h-10 px-4 w-full' : 'h-9 px-4'} bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2`}
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Scrollable Entries Area */}
      <div className="flex-1 min-h-0">
        {entries.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h4 className="font-semibold text-foreground">Current Attendees ({entries.length})</h4>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                Total: {formatCurrency(totalRate)}/hour
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
            <ScrollArea className={`h-full ${isMobile ? 'max-h-48' : 'max-h-64'}`}>
              <div className={`${isMobile ? 'space-y-1.5 pr-2' : 'space-y-2 pr-3'}`}>
                {entries.map((entry) => (
                    <div key={entry.id} className={`bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <Input
                            type="number"
                            min="1"
                            value={entry.count}
                            onChange={(e) => updateEntry(entry.id, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                            className={`${isMobile ? 'h-8 w-12' : 'h-8 w-14'} text-center font-medium text-xs`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={entry.role}
                            onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                            onBlur={(e) => handleRoleBlur(entry.id, e.target.value)}
                            className={`${isMobile ? 'h-8 text-xs' : 'h-8'} font-medium`}
                          />
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {entry.isLoading ? (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded-md">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="text-xs text-muted-foreground">...</span>
                            </div>
                          ) : (
                            <div className={`bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md text-xs font-mono font-medium whitespace-nowrap`}>
                              {formatCurrency(entry.rate)}/hr
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEntry(entry.id)}
                            className={`${isMobile ? 'h-8 w-8' : 'h-7 w-7'} p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No attendees added yet</p>
              <p className="text-sm mt-1 opacity-70">Add attendees to start calculating meeting costs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}