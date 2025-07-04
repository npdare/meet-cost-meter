import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, Twitter, Facebook, Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SocialShareProps {
  totalCost: number
  duration: number
  attendeeCount: number
  milestones: string[]
}

export const SocialShare = ({ totalCost, duration, attendeeCount, milestones }: SocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const shareText = `Just spent $${totalCost.toFixed(2)} in a ${formatDuration(duration)} meeting with ${attendeeCount} people! 💸 ${milestones.length > 0 ? `Hit ${milestones.length} cost milestones!` : ''} #MeetingMeter #ProductivityFail`

  const shareUrl = window.location.origin

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank')
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
      toast({
        title: "Copied to clipboard!",
        description: "Share text and link copied successfully",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const generateShareImage = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 400
    const ctx = canvas.getContext('2d')!
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 400)
    gradient.addColorStop(0, '#ff6b6b')
    gradient.addColorStop(1, '#ffd93d')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 400)
    
    // Text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Meeting Cost Alert! 💸', 400, 100)
    
    ctx.font = 'bold 72px Arial'
    ctx.fillText(`$${totalCost.toFixed(2)}`, 400, 200)
    
    ctx.font = '32px Arial'
    ctx.fillText(`${formatDuration(duration)} • ${attendeeCount} people`, 400, 250)
    
    ctx.font = '24px Arial'
    ctx.fillText('Track your meeting costs at MeetingMeter', 400, 350)
    
    // Download image
    const link = document.createElement('a')
    link.download = 'meeting-cost-share.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <Share2 className="w-4 h-4" />
        Share Results
      </Button>
    )
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Share Your Meeting Cost</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{shareText}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTwitterShare}
              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            
            <Button
              onClick={handleFacebookShare}
              className="gap-2 bg-blue-700 hover:bg-blue-800 text-white"
              size="sm"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <Copy className="w-4 h-4" />
              Copy Text
            </Button>
            
            <Button
              onClick={generateShareImage}
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              Download Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}