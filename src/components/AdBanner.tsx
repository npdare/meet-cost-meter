import { useEffect } from 'react'

interface AdBannerProps {
  adSlot: string
  adFormat?: string
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export const AdBanner = ({ adSlot, adFormat = "auto", className = "" }: AdBannerProps) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}