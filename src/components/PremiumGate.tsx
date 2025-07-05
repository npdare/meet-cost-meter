import { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { UpgradeDialog } from "./UpgradeDialog"

interface PremiumGateProps {
  children: ReactNode
  feature: string
  description?: string
  showPreview?: boolean
}

export const PremiumGate = ({ 
  children, 
  feature, 
  description = "This feature requires a premium subscription.",
  showPreview = false 
}: PremiumGateProps) => {
  const { user, isPremium } = useAuth()

  // If user is premium, show the feature
  if (isPremium) {
    return <>{children}</>
  }

  // If no user (guest) or not premium, show the gate
  return (
    <Card className="glass-card border-dashed border-2 border-primary/30">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-6 h-6 text-primary" />
          <CardTitle className="text-lg flex items-center gap-2">
            Premium Feature
            <Sparkles className="w-4 h-4 text-accent" />
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showPreview && (
          <div className="relative">
            <div className="blur-sm pointer-events-none opacity-50">
              {children}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}
        
        <div className="text-center space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-foreground">Unlock {feature}</h4>
            <p className="text-xs text-muted-foreground">
              {user ? "Upgrade to premium" : "Sign up for an account"} to access this feature and more!
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            {user ? (
              <UpgradeDialog>
                <Button className="gradient-bg" size="sm">
                  Upgrade to Premium
                </Button>
              </UpgradeDialog>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="gradient-bg" size="sm">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}