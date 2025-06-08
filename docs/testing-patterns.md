# Testing Patterns & Standards

This document outlines the testing patterns, standards, and best practices for the Craft MVP project.

## Test Structure & Organization

### File Naming Conventions
- Test files should be co-located with the code they test
- Use `.test.ts` or `.test.tsx` for unit tests
- Use `.spec.ts` or `.spec.tsx` for integration tests
- Place test utilities in `__tests__/utils/` directories

### Directory Structure
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx
      __tests__/
        Button.integration.spec.tsx
  lib/
    utils/
      formatDate.ts
      formatDate.test.ts
  __tests__/
    utils/
      testHelpers.ts
      mockData.ts
```

## Testing Categories

### 1. Unit Tests
Test individual functions, classes, or components in isolation.

**What to Test:**
- Component rendering with different props
- Function logic and edge cases
- State management
- Event handlers
- Utility functions

**Example:**
```typescript
// src/lib/utils/formatDate.test.ts
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid Date')
  })
})
```

### 2. Component Tests
Test React components using React Testing Library.

**Best Practices:**
- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test user interactions
- Verify accessibility

**Example:**
```typescript
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 3. Integration Tests
Test multiple components or modules working together.

**Example:**
```typescript
// src/components/TaskList/TaskList.integration.spec.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskList } from './TaskList'
import { mockTasks } from '../__tests__/utils/mockData'

describe('TaskList Integration', () => {
  it('should display tasks and allow task completion', async () => {
    render(<TaskList tasks={mockTasks} />)
    
    // Verify tasks are displayed
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    
    // Complete a task
    const checkbox = screen.getByRole('checkbox', { name: /task 1/i })
    fireEvent.click(checkbox)
    
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
  })
})
```

### 4. API Tests
Test API endpoints and external service integrations.

**Example:**
```typescript
// src/app/api/chat/route.test.ts
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('/api/chat', () => {
  it('should return AI response', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message')
  })
})
```

## Testing Utilities & Helpers

### Custom Render Function
Create a custom render function for components that need providers:

```typescript
// src/__tests__/utils/testHelpers.tsx
import { render } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Data
Centralize mock data for consistent testing:

```typescript
// src/__tests__/utils/mockData.ts
export const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
}

export const mockTasks = [
  {
    id: 'task-1',
    title: 'Task 1',
    status: 'pending',
    assigneeId: 'user-1',
  },
  {
    id: 'task-2',
    title: 'Task 2',
    status: 'completed',
    assigneeId: 'user-1',
  },
]

export const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  tasks: mockTasks,
  owner: mockUser,
}
```

## Mocking Strategies

### 1. External APIs
Mock external API calls using Jest mocks:

```typescript
// Mock Supabase client
jest.mock('@/lib/database/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
      insert: jest.fn().mockResolvedValue({ data: mockTasks[0], error: null }),
      update: jest.fn().mockResolvedValue({ data: mockTasks[0], error: null }),
      delete: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}))
```

### 2. AI Services
Mock AI service responses:

```typescript
// Mock conversation engine
jest.mock('@/lib/ai/conversation-engine', () => ({
  ConversationEngine: jest.fn().mockImplementation(() => ({
    processMessage: jest.fn().mockResolvedValue({
      response: 'Mock AI response',
      intent: 'task_creation',
      entities: [],
    }),
  })),
}))
```

### 3. Next.js Features
Use the built-in mocks from `jest.setup.js` for Next.js router and navigation.

## Test Coverage Standards

### Coverage Targets
- **Utilities/Logic**: 95% coverage
- **Components**: 85% coverage
- **API Routes**: 90% coverage
- **Integration Tests**: 70% coverage

### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Performance Testing

### Component Performance
Test component render performance for critical components:

```typescript
import { render } from '@testing-library/react'
import { performance } from 'perf_hooks'

describe('TaskList Performance', () => {
  it('should render large task lists efficiently', () => {
    const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i}`,
      status: 'pending',
    }))

    const start = performance.now()
    render(<TaskList tasks={largeTasks} />)
    const end = performance.now()

    // Should render within 100ms
    expect(end - start).toBeLessThan(100)
  })
})
```

## Accessibility Testing

Ensure components meet accessibility standards:

```typescript
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

## Continuous Integration

Tests run automatically in GitHub Actions:
- On every push to main/development branches
- On pull requests
- Coverage reports are generated and stored

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render"
```

## Best Practices Summary

1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation**
3. **Use descriptive test names** that explain what is being tested
4. **Keep tests simple and focused** (one assertion per test when possible)
5. **Mock external dependencies** to isolate units being tested
6. **Use semantic queries** in React Testing Library
7. **Test edge cases and error conditions**
8. **Maintain test code quality** (no copy-paste, use helpers)
9. **Keep tests fast** (under 1 second per test file)
10. **Update tests when code changes** (treat tests as first-class code) 