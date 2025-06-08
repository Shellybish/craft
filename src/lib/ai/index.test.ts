import { AIService, createAIService } from './index'

describe('AI Index Module', () => {
  describe('AIService', () => {
    let aiService: AIService

    beforeEach(() => {
      aiService = new AIService(undefined, true) // mock mode
    })

    it('should initialize with mock mode enabled by default', () => {
      expect(aiService.isMockMode()).toBe(true)
    })

    it('should create AI service with custom config', () => {
      const customService = createAIService({
        provider: 'claude',
        model: 'claude-3-sonnet',
        temperature: 0.5,
        maxTokens: 1000,
      }, true)
      
      expect(customService).toBeInstanceOf(AIService)
      expect(customService.isMockMode()).toBe(true)
    })
  })

  describe('AI Service Methods', () => {
    let aiService: AIService

    beforeEach(() => {
      aiService = createAIService(undefined, true)
    })

    it('should generate responses for conversations', async () => {
      const context = { conversationId: 'test-conv-1' }
      const userMessage = 'Hello, I need help with a task'
      
      const response = await aiService.generateResponse(context, userMessage)
      
      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should parse messages for task creation', async () => {
      const message = 'I need to create a logo for the Nike project by Friday'
      
      const parseResult = await aiService.parseMessage(message)
      
      expect(parseResult).toBeDefined()
      expect(parseResult.tasks).toBeDefined()
      expect(Array.isArray(parseResult.tasks)).toBe(true)
    })

    it('should analyze daily priorities', async () => {
      const userId = 'test-user-1'
      
      const priorities = await aiService.analyzeDailyPriorities(userId)
      
      expect(priorities).toBeDefined()
      expect(priorities.topPriorities).toBeDefined()
      expect(Array.isArray(priorities.topPriorities)).toBe(true)
      expect(priorities.insights).toBeDefined()
      expect(Array.isArray(priorities.insights)).toBe(true)
    })

    it('should generate project status updates', async () => {
      const projectId = 'test-project-1'
      
      const status = await aiService.generateProjectStatus(projectId)
      
      expect(status).toBeDefined()
      expect(status.summary).toBeDefined()
      expect(status.progress).toBeDefined()
    })

    it('should setup new projects', async () => {
      const projectDescription = 'Create a new brand identity for a tech startup'
      
      const setup = await aiService.setupProject(projectDescription)
      
      expect(setup).toBeDefined()
      expect(setup.projectId).toBeDefined()
      expect(setup.structure).toBeDefined()
    })

    it('should handle errors gracefully in mock mode', async () => {
      // In mock mode, the service returns mock responses even for invalid input
      // This tests that the service doesn't crash with invalid parameters
      const response = await aiService.generateResponse({}, '')
      
      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })
  })

  describe('Mock Mode Management', () => {
    it('should start in mock mode and allow switching', async () => {
      const service = createAIService(undefined, true)
      
      expect(service.isMockMode()).toBe(true)
      
      await service.switchToRealMode({
        provider: 'claude',
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 2000,
      })
      
      expect(service.isMockMode()).toBe(false)
    })
  })
}) 