// Main AI Service Factory
import { ConversationEngine } from './conversation-engine';
import { TaskParser } from './task-parser';
import { PriorityAnalyzer } from './priority-analyzer';
import { StatusGenerator } from './status-generator';
import { ProjectSetup } from './project-setup';
import { AIModelConfig } from './types';

export class AIService {
  private conversation: ConversationEngine;
  private taskParser: TaskParser;
  private priorityAnalyzer: PriorityAnalyzer;
  private statusGenerator: StatusGenerator;
  private projectSetup: ProjectSetup;
  private mockMode: boolean;

  constructor(config?: AIModelConfig, mockMode: boolean = true) {
    this.mockMode = mockMode;
    
    const defaultConfig: AIModelConfig = {
      provider: 'claude',
      model: 'claude-3-sonnet',
      temperature: 0.7,
      maxTokens: 2000
    };

    const aiConfig = config || defaultConfig;

    // Initialize all AI services in mock mode for development
    this.conversation = new ConversationEngine(aiConfig, mockMode);
    this.taskParser = new TaskParser(mockMode);
    this.priorityAnalyzer = new PriorityAnalyzer(mockMode);
    this.statusGenerator = new StatusGenerator(mockMode);
    this.projectSetup = new ProjectSetup(mockMode);
  }

  // Conversation methods
  async generateResponse(context: any, userMessage: string) {
    return this.conversation.generateResponse(context, userMessage);
  }

  async addMessage(context: any, message: any) {
    return this.conversation.addMessage(context, message);
  }

  async getConversationHistory(conversationId: string) {
    return this.conversation.getConversationHistory(conversationId);
  }

  // Task parsing methods
  async parseMessage(message: string, context?: any) {
    return this.taskParser.parseMessage(message, context);
  }

  async parseEmail(emailContent: string, emailMetadata: any) {
    return this.taskParser.parseEmail(emailContent, emailMetadata);
  }

  // Priority analysis methods
  async analyzeDailyPriorities(userId: string, context?: any) {
    return this.priorityAnalyzer.analyzeDailyPriorities(userId, context);
  }

  async analyzeProjectHealth(projectId: string, context?: any) {
    return this.priorityAnalyzer.analyzeProjectHealth(projectId, context);
  }

  // Status generation methods
  async generateProjectStatus(projectId: string, context?: any) {
    return this.statusGenerator.generateProjectStatus(projectId, context);
  }

  async generateExecutiveSummary(projectIds: string[], timeframe: 'weekly' | 'monthly' | 'quarterly') {
    return this.statusGenerator.generateExecutiveSummary(projectIds, timeframe);
  }

  // Project setup methods
  async setupProject(projectDescription: string, context?: any) {
    return this.projectSetup.setupProject(projectDescription, context);
  }

  // Utility methods
  isMockMode(): boolean {
    return this.mockMode;
  }

  async switchToRealMode(config: AIModelConfig) {
    this.mockMode = false;
    // Reinitialize services with real AI integration
    this.conversation = new ConversationEngine(config, false);
    this.taskParser = new TaskParser(false);
    this.priorityAnalyzer = new PriorityAnalyzer(false);
    this.statusGenerator = new StatusGenerator(false);
    this.projectSetup = new ProjectSetup(false);
  }
}

// Export individual services for direct use if needed
export {
  ConversationEngine,
  TaskParser,
  PriorityAnalyzer,
  StatusGenerator,
  ProjectSetup
};

// Export types
export * from './types';

// Create and export a default instance for easy use
export const aiService = new AIService(undefined, true); // Start in mock mode

// Helper function to create AI service with custom config
export function createAIService(config?: AIModelConfig, mockMode: boolean = true): AIService {
  return new AIService(config, mockMode);
} 