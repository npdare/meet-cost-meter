import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Timer, Settings, Clock, Sun, Moon } from "lucide-react"
import { FeedbackDialog } from "@/components/FeedbackDialog"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link } from "react-router-dom"

interface AppHeaderProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  onSignOut: () => void
}

export const AppHeader = ({ theme, onToggleTheme, onSignOut }: AppHeaderProps) => {
  const { user, isPremium, profile } = useAuth()
  const isMobile = useIsMobile()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Timer className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
            <span className={`font-mono font-light ${isMobile ? 'text-lg' : 'text-xl'} text-foreground tracking-wider`}>
              {isMobile ? 'could_be_an_email' : 'could_be_an_email'}
            </span>
          </div>
        </div>
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
          {user ? (
            <>
              {!isMobile && <span className="text-sm text-muted-foreground">Welcome, {profile?.display_name || user.email}</span>}
              {isPremium && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Premium</span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size={isMobile ? "default" : "sm"} className={`${isMobile ? 'gap-1 min-h-[44px] min-w-[44px]' : 'gap-2'}`}>
                    <Settings className="w-4 h-4" />
                    {isMobile && <span className="sr-only">Settings</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Theme & Settings
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onToggleTheme}
                    className="flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>Theme</span>
                    <div className="flex items-center gap-2">
                      {theme === "light" ? (
                        <>
                          <Sun className="w-4 h-4" />
                          <span className="text-xs text-muted-foreground">Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4" />
                          <span className="text-xs text-muted-foreground">Dark</span>
                        </>
                      )}
                    </div>
                  </DropdownMenuItem>
                  {isPremium && (
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="flex items-center gap-2 w-full">
                        <Clock className="w-4 h-4" />
                        <span>Meeting History</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onSignOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="outline" size={isMobile ? "default" : "sm"} className={isMobile ? 'min-h-[44px]' : ''}>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          <FeedbackDialog />
        </div>
      </div>
    </header>
  )
}