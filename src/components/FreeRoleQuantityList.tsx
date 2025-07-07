import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
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
  const { user, isPremium, profile } = useAuth()
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()

  const handleRoleBlur = useCallback(async (entryId: string, role: string) => {
    if (!role.trim()) return

    // Set loading state
    onEntriesChange(
      entries.map(entry =>
        entry.id === entryId ? { ...entry, isLoading: true } : entry
      )
    )

    try {
      const rate = await fetchRateForRole(role.trim(), profile?.subscription_status || 'North America')
      
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
  }, [entries, onEntriesChange, profile])

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
      const rate = await fetchRateForRole(newRole.trim(), 'North America')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Meeting Attendees</h3>
      </div>

      {/* Add New Entry Form */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-shrink-0">
            <Input
              type="number"
              min="1"
              value={newCount}
              onChange={(e) => setNewCount(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="1"
              className="h-11 w-20 text-center font-medium"
            />
          </div>
          <div className="flex-1">
            <Input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g. Senior Engineer"
              className="h-11 font-medium"
              onKeyPress={(e) => e.key === 'Enter' && addNewEntry()}
            />
          </div>
          <Button 
            onClick={addNewEntry}
            disabled={!newRole.trim()}
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Current Entries */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Current Attendees ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})</h4>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
              Total: {formatCurrency(totalRate)}/hour
            </div>
          </div>
          
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="space-y-3">
                  {/* Main Row */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Input
                        type="number"
                        min="1"
                        value={entry.count}
                        onChange={(e) => updateEntry(entry.id, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="h-10 w-16 text-center font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={entry.role}
                        onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                        onBlur={(e) => handleRoleBlur(entry.id, e.target.value)}
                        className="h-10 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      {entry.isLoading ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm font-mono font-medium">
                          {formatCurrency(entry.rate)}/hr × {entry.count}
                        </div>
                      )}
                      <div className="flex items-center gap-1 ml-2">
                        {isPremium && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              toast({
                                title: "Coming soon",
                                description: "Add saved members feature is coming soon",
                              })
                            }}
                            className="h-8 px-2 gap-1 text-xs hover:bg-accent"
                          >
                            <Plus className="w-3 h-3" />
                            Add Saved Members
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeEntry(entry.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-card/20 backdrop-blur-sm border border-border/30 rounded-lg">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-lg">No attendees added yet</p>
          <p className="text-sm mt-2 opacity-70">Add attendees to start calculating meeting costs</p>
        </div>
      )}
    </div>
  )
}