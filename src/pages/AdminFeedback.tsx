import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Bug, Lightbulb, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Feedback {
  id: string
  user_email: string
  category: 'bug' | 'feature' | 'general'
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export default function AdminFeedback() {
  const { isAdmin, loading } = useAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isAdmin) {
      loadFeedback()
    }
  }, [isAdmin])

  const loadFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setFeedback(data as Feedback[] || [])
    } catch (error) {
      console.error('Error loading feedback:', error)
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFeedbackStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      setFeedback(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: newStatus as any } : item
        )
      )
      
      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully",
      })
    } catch (error) {
      console.error('Error updating feedback status:', error)
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug className="w-4 h-4" />
      case 'feature': return <Lightbulb className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default'
      case 'in_progress': return 'secondary'
      case 'resolved': return 'default'
      case 'closed': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-3 h-3" />
      case 'in_progress': return <AlertCircle className="w-3 h-3" />
      case 'resolved': return <CheckCircle className="w-3 h-3" />
      case 'closed': return <CheckCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Feedback</h1>
        <p className="text-muted-foreground">Manage user feedback and bug reports</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading feedback...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback submitted yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            feedback.map((item) => (
              <Card key={item.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <CardTitle className="text-lg capitalize">{item.category}</CardTitle>
                      </div>
                      <Badge variant={getStatusColor(item.status)} className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateFeedbackStatus(item.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-foreground whitespace-pre-wrap">{item.message}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>From: {item.user_email}</span>
                      <span>Submitted: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}