import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Check, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface UpgradeDialogProps {
  children: React.ReactNode
}

export const UpgradeDialog = ({ children }: UpgradeDialogProps) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleUpgrade = async () => {
    if (!user) return

    setLoading(true)
    try {
      // For demo purposes, we'll just update the user to premium
      // In a real app, you'd integrate with Stripe/payment processor
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month from now

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'premium',
          subscription_expires_at: expiresAt.toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Welcome to Premium! 🎉",
        description: "You now have access to all premium features. Enjoy!",
      })

      setOpen(false)
      
      // Refresh the page to update the auth state
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    "Save and track unlimited meetings",
    "Calendar integration with Google Calendar",
    "Advanced meeting analytics",
    "Meeting history and reports",
    "Priority customer support",
    "Export meeting data"
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Upgrade to Premium
            <Sparkles className="w-4 h-4 text-accent" />
          </DialogTitle>
          <DialogDescription>
            Unlock all features and get the most out of Could Be An Email
          </DialogDescription>
        </DialogHeader>

        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">$9.99/month</CardTitle>
            <CardDescription>Everything you need to track meeting costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleUpgrade} 
                disabled={loading}
                className="w-full gradient-bg"
                size="lg"
              >
                {loading ? "Processing..." : "Start Premium Trial"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Free 30-day trial • Cancel anytime
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}