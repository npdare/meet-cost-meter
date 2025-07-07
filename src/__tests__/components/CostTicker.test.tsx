import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CostTicker } from '../../components/CostTicker'

// Mock the useCurrency hook
jest.mock('../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatCurrency: (amount: number) => `$${amount.toFixed(2)}`
  })
}))

describe('CostTicker', () => {
  it('should render cost correctly', () => {
    render(<CostTicker cost={123.45} />)
    expect(screen.getByText('$123.45')).toBeInTheDocument()
  })

  it('should show different colors for different cost ranges', () => {
    const { rerender } = render(<CostTicker cost={25} />)
    let costElement = screen.getByText('$25.00')
    expect(costElement).toHaveClass('text-emerald-600')

    rerender(<CostTicker cost={100} />)
    costElement = screen.getByText('$100.00')
    expect(costElement).toHaveClass('text-yellow-600')

    rerender(<CostTicker cost={200} />)
    costElement = screen.getByText('$200.00')
    expect(costElement).toHaveClass('text-orange-600')

    rerender(<CostTicker cost={400} />)
    costElement = screen.getByText('$400.00')
    expect(costElement).toHaveClass('text-red-600')
  })

  it('should show muted color for zero cost', () => {
    render(<CostTicker cost={0} />)
    const costElement = screen.getByText('$0.00')
    expect(costElement).toHaveClass('text-muted-foreground')
  })

  it('should add pulse animation when running', () => {
    render(<CostTicker cost={100} isRunning={true} />)
    const dollarIcon = screen.getByRole('generic').querySelector('svg')
    expect(dollarIcon).toHaveClass('animate-pulse')
  })

  it('should animate cost changes', async () => {
    const { rerender } = render(<CostTicker cost={100} />)
    
    rerender(<CostTicker cost={200} />)
    
    // The component should show scaling effect during animation
    await waitFor(() => {
      const costElement = screen.getByText(/\$/)
      expect(costElement).toHaveClass('transition-all')
    })
  })

  it('should apply custom className', () => {
    render(<CostTicker cost={100} className="custom-class" />)
    const container = screen.getByRole('generic')
    expect(container).toHaveClass('custom-class')
  })
})