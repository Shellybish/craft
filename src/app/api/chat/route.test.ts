import { NextRequest } from 'next/server'
import { POST, GET } from './route'

// Mock the AI components
jest.mock('@/lib/ai/conversation-engine')
jest.mock('@/lib/ai/task-parser')

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should return AI response for valid message', async () => {
      const requestData = {
        message: 'Create a task to finish the website design',
        conversationId: 'test-conv-1'
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('conversationId')
      expect(data).toHaveProperty('context')
      expect(typeof data.message).toBe('string')
    })

    it('should return 400 for missing message', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Message is required')
    })

    it('should handle task extraction in AI response', async () => {
      const requestData = {
        message: 'I need to create a logo design task for Nike project due Friday',
        conversationId: 'test-conv-2'
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('extractedTasks')
      // extractedTasks might be null if parsing fails, which is acceptable
    })

    it('should create new conversation context when none provided', async () => {
      const requestData = {
        message: 'Hello, I need help with my project'
      }

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('conversationId')
      expect(data.conversationId).toMatch(/^conv_\d+$/)
      expect(data.context).toHaveProperty('userId')
      expect(data.context).toHaveProperty('messages')
    })

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('GET', () => {
    it('should return health check information', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('services')
      expect(data.services).toHaveProperty('conversationEngine')
      expect(data.services).toHaveProperty('taskParser')
      expect(data.status).toBe('Chat API is running')
    })
  })
}) 