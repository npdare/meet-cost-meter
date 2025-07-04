import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Bug, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const FeedbackDialog = () => {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a category and enter your feedback",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call - replace with actual implementation
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      })
      
      setOpen(false)
      setCategory("")
      setMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve "Could Be An Email" by reporting bugs or suggesting new features.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Bug Report
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Feature Request
                  </div>
                </SelectItem>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    General Feedback
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your bug report, feature request, or feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}