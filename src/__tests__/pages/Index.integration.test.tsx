import { render } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Index from '../../pages/Index'

// Mock hooks and external dependencies
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    isPremium: true
  })
}))

jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

jest.mock('../../components/MilestoneTicker', () => ({
  MilestoneTicker: () => <div data-testid="milestone-ticker">Milestone Ticker</div>
}))

jest.mock('../../components/MeetingReportCard', () => ({
  MeetingReportCard: () => <div data-testid="meeting-report">Meeting Report</div>
}))

jest.mock('../../components/AdBanner', () => ({
  AdBanner: () => <div data-testid="ad-banner">Ad Banner</div>
}))

jest.mock('../../components/ThemeToggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>
}))

jest.mock('../../components/PremiumGate', () => ({
  PremiumGate: ({ children }: { children: React.ReactNode }) => <div data-testid="premium-gate">{children}</div>
}))

jest.mock('../../components/MeetingHistory', () => ({
  MeetingHistory: () => <div data-testid="meeting-history">Meeting History</div>,
  saveMeeting: jest.fn().mockResolvedValue({ success: true })
}))

jest.mock('../../components/CalendarIntegration', () => ({
  CalendarIntegration: () => <div data-testid="calendar-integration">Calendar Integration</div>
}))

jest.mock('../../components/FeedbackDialog', () => ({
  FeedbackDialog: () => <button data-testid="feedback-dialog">Feedback</button>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Index Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render all main components', () => {
    renderWithRouter(<Index />)
    
    expect(screen.getByText('Could Be An Email')).toBeInTheDocument()
    expect(screen.getByText('Start Meeting')).toBeInTheDocument()
    expect(screen.getByText('Meeting Cost')).toBeInTheDocument()
    expect(screen.getByText('Attendees')).toBeInTheDocument()
  })

  it('should handle complete meeting flow: add attendee → start → pause → reset', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderWithRouter(<Index />)

    // Add an attendee
    const nameInput = screen.getByPlaceholderText('Enter name')
    const roleSelect = screen.getByText('Select role')
    const rateInput = screen.getByPlaceholderText('Auto-filled')

    await user.type(nameInput, 'John Doe')
    await user.click(roleSelect)
    await user.click(screen.getByText(/Developer/))
    
    // The rate should be auto-filled, but let's make sure
    expect(rateInput).toHaveValue('65')

    await user.click(screen.getByText('Add Attendee'))

    // Verify attendee was added
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()

    // Start the timer
    const startButton = screen.getByText('Start Meeting')
    await user.click(startButton)

    // Timer should be running
    expect(screen.getByText('Pause')).toBeInTheDocument()

    // Advance time and check if cost updates
    jest.advanceTimersByTime(60000) // 1 minute

    await waitFor(() => {
      expect(screen.getByText('00:01:00')).toBeInTheDocument()
    })

    // Pause the timer
    await user.click(screen.getByText('Pause'))
    expect(screen.getByText('Start Meeting')).toBeInTheDocument()

    // Reset the timer
    await user.click(screen.getByText('Reset'))
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
  })

  it('should validate attendee email uniqueness', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Index />)

    // Add first attendee with email
    await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe')
    await user.click(screen.getByText('Select role'))
    await user.click(screen.getByText(/Developer/))
    await user.type(screen.getByPlaceholderText('attendee@example.com'), 'john@example.com')
    await user.click(screen.getByText('Add Attendee'))

    // Try to add second attendee with same email
    await user.type(screen.getByPlaceholderText('Enter name'), 'Jane Smith')
    await user.click(screen.getByText('Select role'))
    await user.click(screen.getByText(/Manager/))
    await user.type(screen.getByPlaceholderText('attendee@example.com'), 'john@example.com')
    
    // This should trigger validation error
    await user.click(screen.getByText('Add Attendee'))

    // The second attendee should not be added due to duplicate email
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('should handle bill by minute toggle', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderWithRouter(<Index />)

    // Add an attendee first
    await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe') 
    await user.click(screen.getByText('Select role'))
    await user.click(screen.getByText(/Developer/))
    await user.click(screen.getByText('Add Attendee'))

    // Toggle bill by minute
    const billByMinuteSwitch = screen.getByRole('switch', { name: /bill by minute/i })
    await user.click(billByMinuteSwitch)
    expect(billByMinuteSwitch).toBeChecked()

    // Start timer and run for 30 seconds
    await user.click(screen.getByText('Start Meeting'))
    jest.advanceTimersByTime(30000) // 30 seconds

    // With bill by minute, cost should be calculated as if full minute passed
    await waitFor(() => {
      // The cost should reflect billing for full minute even though only 30 seconds passed
      expect(screen.getByText(/Billed by minute/)).toBeInTheDocument()
    })
  })

  it('should remove attendees correctly', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Index />)

    // Add an attendee
    await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe')
    await user.click(screen.getByText('Select role'))
    await user.click(screen.getByText(/Developer/))
    await user.click(screen.getByText('Add Attendee'))

    expect(screen.getByText('John Doe')).toBeInTheDocument()

    // Find and click the remove button (X button)
    const removeButton = screen.getByRole('button', { name: '' }) // X button typically has no name
    await user.click(removeButton)

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('should show meeting report after timer runs', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderWithRouter(<Index />)

    // Add attendee and start timer
    await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe')
    await user.click(screen.getByText('Select role'))
    await user.click(screen.getByText(/Developer/))
    await user.click(screen.getByText('Add Attendee'))

    await user.click(screen.getByText('Start Meeting'))
    jest.advanceTimersByTime(60000) // 1 minute

    // Meeting report should appear after time > 0
    await waitFor(() => {
      expect(screen.getByTestId('meeting-report')).toBeInTheDocument()
    })
  })
})