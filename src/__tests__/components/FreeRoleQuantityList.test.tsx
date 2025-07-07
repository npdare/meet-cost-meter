import { render } from '@testing-library/react'
import { screen, fireEvent, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { FreeRoleQuantityList, RoleQuantityEntry } from '../../components/FreeRoleQuantityList'

// Mock the hooks
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    isPremium: false,
    profile: null
  })
}))

jest.mock('../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatCurrency: (amount: number) => `$${amount.toFixed(2)}`
  })
}))

jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock the GPT integration
jest.mock('../../integrations/gpt', () => ({
  fetchRateForRole: jest.fn().mockResolvedValue(85)
}))

// Mock Supabase
jest.mock('../../integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null })
    })
  }
}))

describe('FreeRoleQuantityList', () => {
  const mockEntries: RoleQuantityEntry[] = [
    {
      id: '1',
      count: 2,
      role: 'Senior Engineer',
      rate: 85
    },
    {
      id: '2',
      count: 1,
      role: 'Manager',
      rate: 100
    }
  ]

  const mockOnEntriesChange = jest.fn()

  beforeEach(() => {
    mockOnEntriesChange.mockClear()
  })

  it('should render without entries', () => {
    render(<FreeRoleQuantityList entries={[]} onEntriesChange={mockOnEntriesChange} />)
    
    expect(screen.getByText('Meeting Attendees')).toBeInTheDocument()
    expect(screen.getByText('No attendees added yet')).toBeInTheDocument()
  })

  it('should render existing entries', () => {
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={mockOnEntriesChange} />)
    
    expect(screen.getByDisplayValue('Senior Engineer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Manager')).toBeInTheDocument()
    expect(screen.getByText('Current Attendees (2 entries)')).toBeInTheDocument()
  })

  it('should show total rate calculation', () => {
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={mockOnEntriesChange} />)
    
    // Total: (2 * 85) + (1 * 100) = 270
    expect(screen.getByText('Total: $270.00/hour')).toBeInTheDocument()
  })

  it('should add new entry when form is submitted', async () => {
    const user = userEvent.setup()
    render(<FreeRoleQuantityList entries={[]} onEntriesChange={mockOnEntriesChange} />)
    
    // Fill in the form
    await user.type(screen.getByPlaceholderText('Count'), '3')
    await user.type(screen.getByPlaceholderText('e.g. Senior Engineer'), 'Developer')
    
    // Click add button
    await user.click(screen.getByText('Add'))
    
    // Should call onEntriesChange
    expect(mockOnEntriesChange).toHaveBeenCalled()
  })

  it('should remove entry when X button is clicked', async () => {
    const user = userEvent.setup()
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={mockOnEntriesChange} />)
    
    // Find and click the first remove button
    const removeButtons = screen.getAllByRole('button')
    const removeButton = removeButtons.find(button => {
      const svg = button.querySelector('svg')
      return svg && svg.getAttribute('class')?.includes('w-3 h-3')
    })
    
    if (removeButton) {
      await user.click(removeButton)
      expect(mockOnEntriesChange).toHaveBeenCalled()
    }
  })

  it('should not show Advanced button for free users', () => {
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={mockOnEntriesChange} />)
    
    expect(screen.queryByText('Advanced')).not.toBeInTheDocument()
  })

  it('should update count when input changes', async () => {
    const user = userEvent.setup()
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={mockOnEntriesChange} />)
    
    const countInput = screen.getAllByDisplayValue('2')[0] // First entry has count 2
    await user.clear(countInput)
    await user.type(countInput, '5')
    
    expect(mockOnEntriesChange).toHaveBeenCalled()
  })
})

describe('FreeRoleQuantityList with Premium User', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock premium user
    jest.mocked(require('../../hooks/useAuth').useAuth).mockReturnValue({
      user: { id: '1', email: 'premium@example.com' },
      isPremium: true,
      profile: { subscription_status: 'premium' }
    })
  })

  it('should show Advanced button for premium users', () => {
    const mockEntries: RoleQuantityEntry[] = [{
      id: '1', count: 1, role: 'Manager', rate: 100
    }]
    
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={jest.fn()} />)
    
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('should expand Advanced panel when clicked', async () => {
    const user = userEvent.setup()
    const mockEntries: RoleQuantityEntry[] = [{
      id: '1', count: 1, role: 'Manager', rate: 100
    }]
    
    render(<FreeRoleQuantityList entries={mockEntries} onEntriesChange={jest.fn()} />)
    
    await user.click(screen.getByText('Advanced'))
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('john@company.com')).toBeInTheDocument()
      expect(screen.getByText('Save as Favorite')).toBeInTheDocument()
    })
  })
})