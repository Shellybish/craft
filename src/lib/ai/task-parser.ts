import { TaskParseResult, ExtractedTask } from './types';
import { ContextAnalyzer } from './context-analyzer';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class TaskParser {
  private mockMode: boolean;
  private contextAnalyzer: ContextAnalyzer;

  constructor(mockMode: boolean = true) {
    this.mockMode = mockMode;
    this.contextAnalyzer = new ContextAnalyzer();
  }

  async parseMessage(
    message: string,
    context?: {
      userId: string;
      projectId?: string;
      existingTasks?: any[];
      teamMembers?: Array<{ id: string; name: string; role: string; skills: string[] }>;
      projects?: Array<{ id: string; name: string; client: string; keywords: string[] }>;
    }
  ): Promise<TaskParseResult> {
    if (this.mockMode) {
      return this.generateEnhancedMockParseResult(message, context);
    }
    
    return this.parseWithAI(message, context);
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
    
    return this.parseEmailWithAI(emailContent, emailMetadata);
  }

  private async parseWithAI(
    message: string,
    context?: {
      userId: string;
      projectId?: string;
      existingTasks?: any[];
      teamMembers?: Array<{ id: string; name: string; role: string; skills: string[] }>;
      projects?: Array<{ id: string; name: string; client: string; keywords: string[] }>;
    }
  ): Promise<TaskParseResult> {
    const prompt = this.buildTaskParsingPrompt(message, context);
    
    try {
      const response = await this.callOpenRouter(prompt);
      const basicResult = this.parseAIResponse(response);
      
      // Enhance AI results with context analysis
      const contextClues = this.contextAnalyzer.analyzeContext(message, context);
      const enhancedTasks = basicResult.tasks.map(task => 
        this.contextAnalyzer.enhanceTaskWithContext(task, contextClues)
      );
      
      return {
        ...basicResult,
        tasks: enhancedTasks,
        suggestions: [
          ...basicResult.suggestions,
          `Context enhancement applied with ${contextClues.urgency.confidence.toFixed(2)} urgency confidence`
        ]
      };
    } catch (error) {
      console.error('AI parsing failed, falling back to enhanced extraction:', error);
      return this.generateEnhancedMockParseResult(message, context);
    }
  }

  private async parseEmailWithAI(
    emailContent: string,
    emailMetadata: {
      from: string;
      subject: string;
      date: Date;
      isClient?: boolean;
    }
  ): Promise<TaskParseResult> {
    const prompt = this.buildEmailParsingPrompt(emailContent, emailMetadata);
    
    try {
      const response = await this.callOpenRouter(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI email parsing failed, falling back to mock:', error);
      return this.generateMockEmailParseResult(emailContent, emailMetadata);
    }
  }

  private buildTaskParsingPrompt(
    message: string,
    context?: {
      userId: string;
      projectId?: string;
      existingTasks?: any[];
      teamMembers?: Array<{ id: string; name: string; role: string; skills: string[] }>;
      projects?: Array<{ id: string; name: string; client: string; keywords: string[] }>;
    }
  ): string {
    return `You are an expert task extraction AI for a creative agency project management system. Extract actionable tasks from the following message with sophisticated context analysis.

Message to analyze:
"${message}"

${context?.projectId ? `Project context: ${context.projectId}` : ''}
${context?.existingTasks?.length ? `Existing tasks context: ${context.existingTasks.slice(0, 3).map(t => t.title).join(', ')}` : ''}
${context?.teamMembers?.length ? `Team members: ${context.teamMembers.map(m => `${m.name} (${m.role})`).slice(0, 5).join(', ')}` : ''}
${context?.projects?.length ? `Active projects: ${context.projects.map(p => `${p.name} (${p.client})`).slice(0, 3).join(', ')}` : ''}

Advanced Context Analysis Instructions:
1. URGENCY DETECTION: Look for urgency indicators like 'urgent', 'ASAP', 'critical', 'emergency', 'deadline today', 'blocking', etc.
2. ASSIGNEE IDENTIFICATION: Detect @mentions, names (John Smith), roles (designer, developer), and skill references
3. DEADLINE EXTRACTION: Parse relative dates (today, tomorrow, this week, Friday) and explicit dates (1/20/2024)
4. PROJECT ASSOCIATION: Match project names, client names, and project-type keywords
5. DEPENDENCY ANALYSIS: Look for sequential language (after, before, depends on, blocks, waiting for)

Instructions:
1. Identify ALL actionable items that require someone to do something
2. Extract clear, specific task titles (not vague)
3. Determine priority based on sophisticated urgency analysis
4. Estimate hours based on task complexity and agency standards (0.5-40 hours)
5. Extract deadlines using advanced date parsing
6. Identify tags based on content analysis and domain knowledge
7. Detect assignees from context clues and team information
8. Identify project associations through multiple indicators

Respond with ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Brief context from the original message",
      "priority": "low|medium|high|urgent",
      "assigneeId": "team-member-id-if-detected",
      "projectId": "project-id-if-detected", 
      "estimatedHours": 2.5,
      "dueDate": "2024-12-20T17:00:00Z",
      "tags": ["tag1", "tag2"],
      "dependencies": ["task-id-if-referenced"],
      "confidence": 0.85
    }
  ],
  "confidence": 0.8,
  "suggestions": [
    "Brief suggestion about the extraction"
  ]
}

Context Analysis Rules:
- Use team member IDs when names/roles are mentioned
- Use project IDs when project/client names are detected  
- Apply agency-specific urgency levels (client work = higher priority)
- Consider creative workflow dependencies (design → development → review)
- Tag with relevant skills/disciplines (design, development, content, review, client)
- Extract time-based urgency from business context
- If no clear tasks found, return empty tasks array with low confidence`;
  }

  private buildEmailParsingPrompt(
    emailContent: string,
    emailMetadata: {
      from: string;
      subject: string;
      date: Date;
      isClient?: boolean;
    }
  ): string {
    const isClient = emailMetadata.isClient || emailMetadata.from.toLowerCase().includes('client');
    
    return `You are an expert email task extraction AI for a creative agency. Extract actionable tasks from this email.

Email Details:
From: ${emailMetadata.from}
Subject: ${emailMetadata.subject}
Date: ${emailMetadata.date.toISOString()}
Type: ${isClient ? 'Client Email' : 'Internal Email'}

Email Content:
"${emailContent}"

Context:
- This is a ${isClient ? 'CLIENT' : 'TEAM'} email
- Client emails typically require responses, reviews, or deliverable updates
- Internal emails often involve coordination, status updates, or planning

Instructions:
1. Extract all actionable items that require agency team action
2. For client emails, identify: feedback to address, requests to fulfill, meetings to schedule
3. For internal emails, identify: tasks to complete, updates to provide, coordination needed
4. Set appropriate priority based on client importance and deadlines
5. Consider standard agency workflow timeframes

Respond with ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Context from email with sender info",
      "priority": "low|medium|high|urgent",
      "estimatedHours": 2.0,
      "dueDate": "2024-12-20T17:00:00Z",
      "tags": ["email", "client", "feedback"],
      "confidence": 0.9
    }
  ],
  "confidence": 0.85,
  "suggestions": [
    "Actionable suggestion for handling this email"
  ]
}

Priority Guidelines:
- Client requests/feedback: high priority
- Urgent deadlines or ASAP requests: urgent priority  
- Internal coordination: medium priority
- FYI or informational emails: low priority (if any tasks)`;
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://craft.dev',
        'X-Title': 'Craft MVP Task Parser',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4', // Using Claude for complex reasoning
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent, structured output
        max_tokens: 2000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from OpenRouter');
    }

    return data.choices[0].message.content;
  }

  private parseAIResponse(aiResponse: string): TaskParseResult {
    try {
      // Clean up the response - remove any markdown formatting
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validate the response structure
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid AI response structure');
      }

      // Process and validate each task
      const tasks: ExtractedTask[] = parsed.tasks.map((task: any) => ({
        title: task.title || 'Unnamed task',
        description: task.description || '',
        priority: this.validatePriority(task.priority),
        estimatedHours: this.validateEstimatedHours(task.estimatedHours),
        dueDate: this.validateDueDate(task.dueDate),
        tags: Array.isArray(task.tags) ? task.tags : [],
        confidence: this.validateConfidence(task.confidence)
      }));

      return {
        tasks,
        confidence: this.validateConfidence(parsed.confidence),
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      
      // Return a fallback result indicating parsing failure
      return {
        tasks: [],
        confidence: 0.1,
        suggestions: ['AI parsing failed - please try rephrasing your request more clearly']
      };
    }
  }

  private validatePriority(priority: any): 'low' | 'medium' | 'high' | 'urgent' {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    return validPriorities.includes(priority) ? priority : 'medium';
  }

  private validateEstimatedHours(hours: any): number | undefined {
    const num = parseFloat(hours);
    if (isNaN(num) || num <= 0 || num > 100) {
      return undefined;
    }
    return Math.round(num * 2) / 2; // Round to nearest 0.5
  }

  private validateDueDate(dateStr: any): Date | undefined {
    if (!dateStr) return undefined;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      
      // Ensure date is not in the past (with some tolerance for today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) return undefined;
      
      return date;
    } catch {
      return undefined;
    }
  }

  private validateConfidence(confidence: any): number {
    const num = parseFloat(confidence);
    if (isNaN(num)) return 0.5;
    return Math.max(0, Math.min(1, num)); // Clamp between 0 and 1
  }

  private generateEnhancedMockParseResult(
    message: string,
    context?: any
  ): TaskParseResult {
    // Use context analyzer to get sophisticated context clues
    const contextClues = this.contextAnalyzer.analyzeContext(message, context);
    
    const basicResult = this.generateMockParseResult(message, context);
    
    // Enhance tasks with context clues
    const enhancedTasks = basicResult.tasks.map(task => 
      this.contextAnalyzer.enhanceTaskWithContext(task, contextClues)
    );
    
    return {
      ...basicResult,
      tasks: enhancedTasks,
      suggestions: [
        ...basicResult.suggestions,
        `Context analysis: ${contextClues.urgency.reasoning}`,
        `Assignee analysis: ${contextClues.assignees.reasoning}`,
        `Deadline analysis: ${contextClues.deadlines.reasoning}`,
        `Project analysis: ${contextClues.projects.reasoning}`
      ]
    };
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