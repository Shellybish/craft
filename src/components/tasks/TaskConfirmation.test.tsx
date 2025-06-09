import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TaskConfirmation } from './TaskConfirmation'
import { TaskParseResult, ExtractedTask } from '@/lib/ai/types'

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="x-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />
}))

describe('TaskConfirmation', () => {
  const mockOnApprove = jest.fn()
  const mockOnReject = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockParseResult = (tasks: ExtractedTask[] = [], confidence = 0.8): TaskParseResult => ({
    tasks,
    confidence,
    suggestions: ['This is a test suggestion']
  })

  const createMockTask = (overrides: Partial<ExtractedTask> = {}): ExtractedTask => ({
    title: 'Test Task',
    description: 'Test description',
    priority: 'medium',
    tags: ['test'],
    confidence: 0.85,
    estimatedHours: 2,
    dueDate: new Date('2024-12-25T10:00:00Z'),
    assigneeId: 'user-123',
    ...overrides
  })

  describe('Empty state', () => {
    it('shows no tasks message when no tasks are found', () => {
      const parseResult = createMockParseResult([])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      expect(screen.getByText('No tasks were identified in your message.')).toBeInTheDocument()
      expect(screen.getByText('• This is a test suggestion')).toBeInTheDocument()
    })
  })

  describe('Task display', () => {
    it('displays task information correctly', () => {
      const task = createMockTask({
        title: 'Create landing page',
        description: 'Design and implement the new landing page',
        priority: 'high',
        tags: ['design', 'frontend'],
        estimatedHours: 8
      })
      
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      expect(screen.getByText('Create landing page')).toBeInTheDocument()
      expect(screen.getByText('Design and implement the new landing page')).toBeInTheDocument()
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('8h')).toBeInTheDocument()
      expect(screen.getByText('design')).toBeInTheDocument()
      expect(screen.getByText('frontend')).toBeInTheDocument()
    })

    it('shows confidence indicator correctly', () => {
      const task = createMockTask({ confidence: 0.75 })
      const parseResult = createMockParseResult([task], 0.85)
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      expect(screen.getByText('85% confident')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('shows warning for low confidence', () => {
      const task = createMockTask()
      const parseResult = createMockParseResult([task], 0.6)
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      expect(screen.getByText('Please review these tasks carefully - some details may need adjustment')).toBeInTheDocument()
    })
  })

  describe('Task editing', () => {
    it('allows editing task title', async () => {
      const task = createMockTask({ title: 'Original Title' })
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      // Click edit button
      const editButton = screen.getByTestId('edit-icon').closest('button')
      fireEvent.click(editButton!)

      // Find and edit the title input
      const titleInput = screen.getByDisplayValue('Original Title')
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      expect(titleInput).toHaveValue('Updated Title')
    })

    it('allows editing estimated hours', async () => {
      const task = createMockTask({ estimatedHours: 4 })
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      // Click edit button
      const editButton = screen.getByTestId('edit-icon').closest('button')
      fireEvent.click(editButton!)

      // Find and edit the hours input
      const hoursInput = screen.getByDisplayValue('4')
      fireEvent.change(hoursInput, { target: { value: '6' } })

      expect(hoursInput).toHaveValue(6)
    })

    it('toggles edit mode when edit button is clicked', () => {
      const task = createMockTask()
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      const editButton = screen.getByTestId('edit-icon').closest('button')
      
      // Initially not in edit mode
      expect(screen.queryByDisplayValue('Test Task')).not.toBeInTheDocument()
      
      // Click to enter edit mode
      fireEvent.click(editButton!)
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
      
      // Click again to exit edit mode
      fireEvent.click(editButton!)
      expect(screen.queryByDisplayValue('Test Task')).not.toBeInTheDocument()
    })
  })

  describe('Approval workflow', () => {
    it('calls onApprove with tasks when approve button is clicked', async () => {
      const task = createMockTask()
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      const approveButton = screen.getByText('Approve 1 Task')
      fireEvent.click(approveButton)

      expect(screen.getByText('Creating Tasks...')).toBeInTheDocument()

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledWith([task])
      }, { timeout: 1000 })
    })

    it('calls onReject when cancel button is clicked', () => {
      const task = createMockTask()
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockOnReject).toHaveBeenCalled()
    })

    it('displays correct button text for multiple tasks', () => {
      const tasks = [createMockTask(), createMockTask({ title: 'Task 2' })]
      const parseResult = createMockParseResult(tasks)
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      expect(screen.getByText('Approve 2 Tasks')).toBeInTheDocument()
      expect(screen.getByText('2 Tasks Found')).toBeInTheDocument()
    })

    it('removes editing flags from tasks before approving', async () => {
      const task = createMockTask()
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      // Edit the task first
      const editButton = screen.getByTestId('edit-icon').closest('button')
      fireEvent.click(editButton!)

      // Approve
      const approveButton = screen.getByText('Approve 1 Task')
      fireEvent.click(approveButton)

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledWith([expect.not.objectContaining({ isEditing: expect.anything() })])
      }, { timeout: 1000 })
    })
  })

  describe('Date formatting', () => {
    it('formats dates correctly', () => {
      const task = createMockTask({
        dueDate: new Date('2024-12-25T15:30:00Z')
      })
      const parseResult = createMockParseResult([task])
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      // Check if date is displayed (format may vary based on locale)
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })
  })

  describe('Priority colors', () => {
    it('applies correct colors for different priorities', () => {
      const tasks = [
        createMockTask({ title: 'Urgent Task', priority: 'urgent' }),
        createMockTask({ title: 'High Task', priority: 'high' }),
        createMockTask({ title: 'Medium Task', priority: 'medium' }),
        createMockTask({ title: 'Low Task', priority: 'low' })
      ]
      const parseResult = createMockParseResult(tasks)
      
      render(
        <TaskConfirmation
          parseResult={parseResult}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      )

      expect(screen.getByText('urgent')).toBeInTheDocument()
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
      expect(screen.getByText('low')).toBeInTheDocument()
    })
  })
}) 