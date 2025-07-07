import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, X, ChevronDown, Loader2, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import { fetchRateForRole } from '@/integrations/gpt'
import { supabase } from '@/integrations/supabase/client'

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
  const [expandedAdvanced, setExpandedAdvanced] = useState<Record<string, boolean>>({})
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

  const saveFavoriteAttendee = async (entry: RoleQuantityEntry) => {
    if (!user || !isPremium) {
      toast({
        title: "Pro feature required",
        description: "Saving favorite attendees requires a Pro subscription",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('favorite_attendees')
        .insert({
          user_id: user.id,
          name: entry.name || entry.role,
          role: entry.role,
          rate: entry.rate,
          email: entry.email
        })

      if (error) throw error

      toast({
        title: "Favorite saved!",
        description: `${entry.name || entry.role} has been saved to your favorites`,
      })
    } catch (error) {
      console.error('Error saving favorite:', error)
      toast({
        title: "Error saving favorite",
        description: "Failed to save attendee to favorites",
        variant: "destructive",
      })
    }
  }

  const toggleAdvanced = (id: string) => {
    setExpandedAdvanced(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const totalRate = entries.reduce((sum, entry) => sum + (entry.count * entry.rate), 0)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Meeting Attendees
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Entry Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="number"
            min="1"
            value={newCount}
            onChange={(e) => setNewCount(Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="Count"
            className="h-10"
          />
          <Input
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="e.g. Senior Engineer"
            className="h-10 md:col-span-2"
            onKeyPress={(e) => e.key === 'Enter' && addNewEntry()}
          />
          <Button 
            onClick={addNewEntry}
            disabled={!newRole.trim()}
            className="gap-2 gradient-bg hover:opacity-90 h-10"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Current Entries */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Current Attendees ({entries.length} entries)</h4>
              <Badge variant="secondary" className="font-semibold">
                Total: {formatCurrency(totalRate)}/hour
              </Badge>
            </div>
            
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={entry.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Main Row */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                        <Input
                          type="number"
                          min="1"
                          value={entry.count}
                          onChange={(e) => updateEntry(entry.id, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="h-8"
                        />
                        <Input
                          value={entry.role}
                          onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                          onBlur={(e) => handleRoleBlur(entry.id, e.target.value)}
                          className="h-8 md:col-span-2"
                        />
                        <div className="flex items-center gap-2">
                          {entry.isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="text-sm text-muted-foreground">Loading...</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="font-mono">
                              {formatCurrency(entry.rate)}/hr × {entry.count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isPremium && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAdvanced(entry.id)}
                              className="h-8 gap-1 text-xs"
                            >
                              Advanced
                              <ChevronDown className={`w-3 h-3 transition-transform ${expandedAdvanced[entry.id] ? 'rotate-180' : ''}`} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEntry(entry.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Advanced Panel (Pro Only) */}
                      {isPremium && (
                        <Collapsible open={expandedAdvanced[entry.id]}>
                          <CollapsibleContent className="space-y-3">
                            <div className="border-t border-border pt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                                  <Input
                                    value={entry.name || ''}
                                    onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                                    placeholder="John Doe"
                                    className="h-8 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                                  <Input
                                    type="email"
                                    value={entry.email || ''}
                                    onChange={(e) => updateEntry(entry.id, { email: e.target.value })}
                                    placeholder="john@company.com"
                                    className="h-8 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Role</label>
                                  <Input
                                    value={entry.role}
                                    onChange={(e) => updateEntry(entry.id, { role: e.target.value })}
                                    className="h-8 mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Rate ($/hr)</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={entry.rate}
                                    onChange={(e) => updateEntry(entry.id, { rate: parseFloat(e.target.value) || 0 })}
                                    className="h-8 mt-1"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveFavoriteAttendee(entry)}
                                  className="gap-2 text-xs"
                                >
                                  <Star className="w-3 h-3" />
                                  Save as Favorite
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No attendees added yet</p>
            <p className="text-sm mt-1">Add attendees to start calculating meeting costs</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}