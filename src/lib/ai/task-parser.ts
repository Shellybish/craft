import { TaskParseResult, ExtractedTask } from './types';

export class TaskParser {
  private mockMode: boolean;

  constructor(mockMode: boolean = true) {
    this.mockMode = mockMode;
  }

  async parseMessage(
    message: string,
    context?: {
      userId: string;
      projectId?: string;
      existingTasks?: any[];
    }
  ): Promise<TaskParseResult> {
    if (this.mockMode) {
      return this.generateMockParseResult(message, context);
    }
    
    // Real AI parsing would go here
    throw new Error('Real AI parsing not implemented yet');
  }

  async parseEmail(
    emailContent: string,
    emailMetadata: {
      from: string;
      subject: string;
      date: Date;
      isClient?: boolean;
    }
  ): Promise<TaskParseResult> {
    if (this.mockMode) {
      return this.generateMockEmailParseResult(emailContent, emailMetadata);
    }
    
    throw new Error('Real email parsing not implemented yet');
  }

  private generateMockParseResult(
    message: string,
    context?: any
  ): TaskParseResult {
    const lowerMessage = message.toLowerCase();
    
    // Analyze message for task indicators
    const tasks: ExtractedTask[] = [];
    let confidence = 0.8;
    const suggestions: string[] = [];

    // Mock task extraction based on common patterns
    if (lowerMessage.includes('need to') || lowerMessage.includes('should')) {
      tasks.push({
        title: this.extractTaskTitle(message),
        description: `Task extracted from: "${message.substring(0, 50)}..."`,
        priority: this.determinePriority(lowerMessage),
        tags: this.extractTags(lowerMessage),
        estimatedHours: this.estimateHours(lowerMessage),
        confidence: 0.85
      });
    }

    if (lowerMessage.includes('deadline') || lowerMessage.includes('due')) {
      const dueDate = this.extractDueDate(lowerMessage);
      if (tasks.length > 0) {
        tasks[0].dueDate = dueDate;
      } else {
        tasks.push({
          title: 'Deadline-based task',
          description: 'Task with identified deadline',
          priority: 'high' as const,
          dueDate: dueDate,
          tags: ['deadline'],
          confidence: 0.75
        });
      }
    }

    // Add more tasks for complex messages
    if (lowerMessage.length > 100) {
      tasks.push({
        title: 'Follow up on discussion',
        description: 'Additional context from longer message',
        priority: 'medium' as const,
        tags: ['follow-up'],
        estimatedHours: 1,
        confidence: 0.65
      });
    }

    // Generate suggestions
    if (tasks.length === 0) {
      suggestions.push("I didn't detect specific tasks. Try phrases like 'I need to...' or 'We should...'");
      confidence = 0.3;
    } else {
      suggestions.push(`Found ${tasks.length} potential task${tasks.length > 1 ? 's' : ''}`);
      if (tasks.some(t => !t.assigneeId)) {
        suggestions.push('Consider specifying who should handle these tasks');
      }
      if (tasks.some(t => !t.dueDate)) {
        suggestions.push('Add deadlines for better priority management');
      }
    }

    return {
      tasks,
      confidence,
      suggestions
    };
  }

  private generateMockEmailParseResult(
    emailContent: string,
    emailMetadata: any
  ): TaskParseResult {
    const isClientEmail = emailMetadata.isClient || emailMetadata.from.includes('client');
    const urgencyLevel = this.determineEmailUrgency(emailContent, emailMetadata.subject);
    
    const tasks: ExtractedTask[] = [];
    
    // Common client email patterns
    if (isClientEmail) {
      if (emailContent.toLowerCase().includes('review') || emailContent.toLowerCase().includes('feedback')) {
        tasks.push({
          title: `Review feedback from ${emailMetadata.from.split('@')[0]}`,
          description: `Client feedback received: ${emailMetadata.subject}`,
          priority: urgencyLevel,
          tags: ['client', 'review', 'feedback'],
          estimatedHours: 2,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
          confidence: 0.9
        });
      }
      
      if (emailContent.toLowerCase().includes('change') || emailContent.toLowerCase().includes('revisions')) {
        tasks.push({
          title: 'Implement client revisions',
          description: 'Client has requested changes to current deliverables',
          priority: 'high' as const,
          tags: ['client', 'revisions', 'changes'],
          estimatedHours: 4,
          confidence: 0.85
        });
      }
      
      if (emailContent.toLowerCase().includes('meeting') || emailContent.toLowerCase().includes('call')) {
        tasks.push({
          title: 'Schedule client meeting',
          description: `Meeting request from ${emailMetadata.from}`,
          priority: 'medium' as const,
          tags: ['client', 'meeting', 'scheduling'],
          estimatedHours: 0.5,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
          confidence: 0.8
        });
      }
    } else {
      // Internal team email patterns
      if (emailContent.toLowerCase().includes('status') || emailContent.toLowerCase().includes('update')) {
        tasks.push({
          title: 'Provide project status update',
          description: 'Team member requesting project status',
          priority: 'medium' as const,
          tags: ['internal', 'status', 'communication'],
          estimatedHours: 1,
          confidence: 0.75
        });
      }
    }

    return {
      tasks,
      confidence: tasks.length > 0 ? 0.8 : 0.3,
      suggestions: [
        `Parsed ${tasks.length} tasks from ${isClientEmail ? 'client' : 'team'} email`,
        tasks.length === 0 ? 'No clear action items detected' : 'Consider assigning team members',
        'Email context preserved for reference'
      ]
    };
  }

  private extractTaskTitle(message: string): string {
    // Simple extraction logic for demo
    const patterns = [
      /need to (.+?)(?:\.|$)/i,
      /should (.+?)(?:\.|$)/i,
      /must (.+?)(?:\.|$)/i,
      /have to (.+?)(?:\.|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
      }
    }
    
    // Fallback
    const words = message.split(' ').slice(0, 6);
    return words.join(' ').replace(/[.,!?]$/, '');
  }

  private determinePriority(message: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (message.includes('urgent') || message.includes('asap') || message.includes('critical')) {
      return 'urgent';
    }
    if (message.includes('important') || message.includes('priority') || message.includes('soon')) {
      return 'high';
    }
    if (message.includes('eventually') || message.includes('when you can') || message.includes('low priority')) {
      return 'low';
    }
    return 'medium';
  }

  private determineEmailUrgency(content: string, subject: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentKeywords = ['urgent', 'asap', 'critical', 'emergency', 'immediate'];
    const highKeywords = ['important', 'priority', 'soon', 'deadline'];
    
    const text = (content + ' ' + subject).toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'urgent';
    }
    if (highKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    // Client emails generally higher priority
    return 'medium';
  }

  private extractTags(message: string): string[] {
    const tags: string[] = [];
    
    if (message.includes('design') || message.includes('mockup')) tags.push('design');
    if (message.includes('development') || message.includes('code')) tags.push('development');
    if (message.includes('meeting') || message.includes('call')) tags.push('meeting');
    if (message.includes('client')) tags.push('client');
    if (message.includes('review') || message.includes('feedback')) tags.push('review');
    if (message.includes('test') || message.includes('qa')) tags.push('testing');
    if (message.includes('content') || message.includes('copy')) tags.push('content');
    
    return tags.length > 0 ? tags : ['general'];
  }

  private estimateHours(message: string): number | undefined {
    // Look for explicit time mentions
    const hourMatch = message.match(/(\d+)\s*hour/i);
    if (hourMatch) {
      return parseInt(hourMatch[1]);
    }
    
    const dayMatch = message.match(/(\d+)\s*day/i);
    if (dayMatch) {
      return parseInt(dayMatch[1]) * 8; // 8 hours per day
    }
    
    // Estimate based on task complexity indicators
    if (message.includes('quick') || message.includes('small')) return 1;
    if (message.includes('complex') || message.includes('major')) return 8;
    if (message.includes('review') || message.includes('check')) return 2;
    
    return undefined;
  }

  private extractDueDate(message: string): Date | undefined {
    const today = new Date();
    
    if (message.includes('today')) {
      return today;
    }
    if (message.includes('tomorrow')) {
      return new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }
    if (message.includes('this week')) {
      return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    if (message.includes('next week')) {
      return new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    
    // Look for specific date patterns (simplified)
    const dateMatch = message.match(/(\d{1,2})\/(\d{1,2})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1; // JS months are 0-indexed
      const day = parseInt(dateMatch[2]);
      return new Date(today.getFullYear(), month, day);
    }
    
    return undefined;
  }
} 