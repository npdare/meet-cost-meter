import { useIsMobile } from "@/hooks/use-mobile"

export const HeroSection = () => {
  const isMobile = useIsMobile()

  return (
    <div className={`text-center ${isMobile ? 'space-y-2 animate-fade-in pt-2' : 'space-y-3 animate-fade-in pt-4 sm:pt-6'}`}>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-mono font-light text-foreground leading-tight py-2 tracking-wider border-b-2 border-primary hover:border-accent transition-colors duration-300`}>
        could_be_an_email
      </h1>
      <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>See your meeting in minutes—and dollars.</p>
    </div>
  )
}