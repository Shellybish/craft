import { ExtractedTask } from './types';

export interface ContextClues {
  urgency: UrgencyAnalysis;
  assignees: AssigneeAnalysis;
  deadlines: DeadlineAnalysis;
  projects: ProjectAnalysis;
  dependencies: DependencyAnalysis;
}

export interface UrgencyAnalysis {
  level: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  indicators: string[];
  reasoning: string;
}

export interface AssigneeAnalysis {
  suggestions: AssigneeSuggestion[];
  confidence: number;
  reasoning: string;
}

export interface AssigneeSuggestion {
  type: 'name' | 'role' | 'mention' | 'team';
  value: string;
  confidence: number;
  context: string;
}

export interface DeadlineAnalysis {
  extractedDate?: Date;
  confidence: number;
  type: 'explicit' | 'relative' | 'implied' | 'business_rule';
  originalText: string;
  reasoning: string;
}

export interface ProjectAnalysis {
  suggestions: ProjectSuggestion[];
  confidence: number;
  reasoning: string;
}

export interface ProjectSuggestion {
  type: 'name' | 'client' | 'keyword' | 'context';
  value: string;
  confidence: number;
  context: string;
}

export interface DependencyAnalysis {
  suggestions: DependencySuggestion[];
  confidence: number;
  reasoning: string;
}

export interface DependencySuggestion {
  type: 'blocking' | 'prerequisite' | 'sequence';
  description: string;
  confidence: number;
}

export class ContextAnalyzer {
  private urgencyPatterns!: { pattern: RegExp; level: 'low' | 'medium' | 'high' | 'urgent'; weight: number }[];
  private assigneePatterns!: { pattern: RegExp; type: 'name' | 'role' | 'mention' | 'team'; weight: number }[];
  private deadlinePatterns!: { pattern: RegExp; type: 'explicit' | 'relative' | 'implied'; weight: number }[];
  private projectPatterns!: { pattern: RegExp; type: 'name' | 'client' | 'keyword'; weight: number }[];

  constructor() {
    this.initializePatterns();
  }

  analyzeContext(
    message: string,
    context?: {
      userId?: string;
      projectId?: string;
      existingTasks?: any[];
      teamMembers?: Array<{ id: string; name: string; role: string; skills: string[] }>;
      projects?: Array<{ id: string; name: string; client: string; keywords: string[] }>;
    }
  ): ContextClues {
    const normalizedMessage = this.normalizeMessage(message);
    
    return {
      urgency: this.analyzeUrgency(normalizedMessage),
      assignees: this.analyzeAssignees(normalizedMessage, context?.teamMembers),
      deadlines: this.analyzeDeadlines(normalizedMessage),
      projects: this.analyzeProjects(normalizedMessage, context?.projects),
      dependencies: this.analyzeDependencies(normalizedMessage, context?.existingTasks)
    };
  }

  private initializePatterns(): void {
    // Urgency patterns with weights
    this.urgencyPatterns = [
      // Urgent level
      { pattern: /\b(urgent|emergency|critical|asap|immediately|right now|drop everything)\b/i, level: 'urgent', weight: 1.0 },
      { pattern: /\b(due today|needed today|must be done today|end of day)\b/i, level: 'urgent', weight: 0.9 },
      { pattern: /\b(crisis|blocker|blocking|show stopper)\b/i, level: 'urgent', weight: 0.8 },
      
      // High priority
      { pattern: /\b(high priority|important|priority|soon|quickly|fast track)\b/i, level: 'high', weight: 0.8 },
      { pattern: /\b(due (tomorrow|this week)|needed (tomorrow|this week)|by (tomorrow|this week))\b/i, level: 'high', weight: 0.7 },
      { pattern: /\b(client (wants|needs|requesting)|for the client|deadline approaching)\b/i, level: 'high', weight: 0.7 },
      { pattern: /\b(time sensitive|time critical|rush job)\b/i, level: 'high', weight: 0.6 },
      
      // Medium priority  
      { pattern: /\b(should|ought to|need to|when possible|next week)\b/i, level: 'medium', weight: 0.5 },
      { pattern: /\b(scheduled|planned|routine|regular)\b/i, level: 'medium', weight: 0.4 },
      
      // Low priority
      { pattern: /\b(eventually|someday|when you can|low priority|nice to have)\b/i, level: 'low', weight: 0.3 },
      { pattern: /\b(backlog|future|later|down the road)\b/i, level: 'low', weight: 0.2 }
    ];

    // Assignee patterns
    this.assigneePatterns = [
      // Direct mentions
      { pattern: /@(\w+)/g, type: 'mention', weight: 1.0 },
      { pattern: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, type: 'name', weight: 0.8 },
      
      // Role-based assignments
      { pattern: /\b(designer|design team|creative team)\b/gi, type: 'role', weight: 0.9 },
      { pattern: /\b(developer|dev team|engineering|tech team)\b/gi, type: 'role', weight: 0.9 },
      { pattern: /\b(project manager|pm|account manager|am)\b/gi, type: 'role', weight: 0.9 },
      { pattern: /\b(copywriter|content team|writer)\b/gi, type: 'role', weight: 0.9 },
      { pattern: /\b(qa|quality assurance|tester|testing team)\b/gi, type: 'role', weight: 0.9 },
      { pattern: /\b(marketing team|social media team|seo team)\b/gi, type: 'role', weight: 0.8 },
      
      // Team assignments
      { pattern: /\b(team|everyone|all hands|group)\b/gi, type: 'team', weight: 0.6 },
      { pattern: /\b(assign to|give to|have (\w+) do|(\w+) should handle)\b/gi, type: 'name', weight: 0.7 }
    ];

    // Deadline patterns
    this.deadlinePatterns = [
      // Explicit dates
      { pattern: /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g, type: 'explicit', weight: 1.0 },
      { pattern: /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/g, type: 'explicit', weight: 1.0 },
      { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i, type: 'explicit', weight: 0.9 },
      { pattern: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i, type: 'explicit', weight: 0.9 },
      
      // Relative dates
      { pattern: /\b(today|tonight|end of day|eod)\b/i, type: 'relative', weight: 1.0 },
      { pattern: /\b(tomorrow|next day)\b/i, type: 'relative', weight: 1.0 },
      { pattern: /\b(this week|end of week|eow|by friday)\b/i, type: 'relative', weight: 0.9 },
      { pattern: /\b(next week|following week)\b/i, type: 'relative', weight: 0.9 },
      { pattern: /\b(this month|end of month|eom)\b/i, type: 'relative', weight: 0.8 },
      { pattern: /\b(in (\d+) (days?|weeks?|months?))\b/i, type: 'relative', weight: 0.8 },
      { pattern: /\b(\d+) (days?|weeks?|months?) from now\b/i, type: 'relative', weight: 0.8 },
      
      // Day references
      { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, type: 'relative', weight: 0.7 },
      { pattern: /\b(mon|tue|wed|thu|fri|sat|sun)\b/i, type: 'relative', weight: 0.7 },
      
      // Implied deadlines
      { pattern: /\b(before (the )?(meeting|call|presentation|launch|deadline))\b/i, type: 'implied', weight: 0.6 },
      { pattern: /\b(after (the )?(review|approval|feedback))\b/i, type: 'implied', weight: 0.5 }
    ];

    // Project patterns
    this.projectPatterns = [
      // Direct project names (commonly capitalized)
      { pattern: /\b([A-Z][A-Za-z]*\s+(project|campaign|website|app|brand|identity))\b/g, type: 'name', weight: 0.9 },
      { pattern: /\b(project\s+[A-Z][A-Za-z]*)\b/gi, type: 'name', weight: 0.9 },
      
      // Client names
      { pattern: /\b([A-Z][A-Za-z]*\s+(inc|llc|corp|ltd|company|co)\b)/gi, type: 'client', weight: 0.8 },
      { pattern: /\b(client\s+[A-Z][A-Za-z]*)\b/gi, type: 'client', weight: 0.8 },
      { pattern: /\bfor\s+([A-Z][A-Za-z]+)\b/g, type: 'client', weight: 0.6 },
      
      // Project type keywords
      { pattern: /\b(website|web development|web design|mobile app|brand identity|logo design|marketing campaign|social media|seo|content strategy)\b/gi, type: 'keyword', weight: 0.7 }
    ];
  }

  private normalizeMessage(message: string): string {
    return message.trim().replace(/\s+/g, ' ');
  }

  private analyzeUrgency(message: string): UrgencyAnalysis {
    const matches: Array<{ level: 'low' | 'medium' | 'high' | 'urgent'; weight: number; indicator: string }> = [];
    
    for (const pattern of this.urgencyPatterns) {
      // Use a global version of the pattern to find all matches
      const globalPattern = new RegExp(pattern.pattern.source, pattern.pattern.flags + 'g');
      const allMatches = Array.from(message.matchAll(globalPattern));
      
      for (const match of allMatches) {
        matches.push({
          level: pattern.level,
          weight: pattern.weight,
          indicator: match[0]
        });
      }
    }

    if (matches.length === 0) {
      return {
        level: 'medium',
        confidence: 0.5,
        indicators: [],
        reasoning: 'No explicit urgency indicators found, defaulting to medium priority'
      };
    }

    // Calculate weighted urgency
    const urgencyScores = { low: 0, medium: 0, high: 0, urgent: 0 };
    const totalWeight = matches.reduce((sum, match) => sum + match.weight, 0);
    
    matches.forEach(match => {
      urgencyScores[match.level] += match.weight;
    });

    // Normalize scores
    Object.keys(urgencyScores).forEach(key => {
      urgencyScores[key as keyof typeof urgencyScores] /= totalWeight;
    });

    // Find highest scoring level
    const highestLevel = (Object.keys(urgencyScores) as Array<keyof typeof urgencyScores>)
      .reduce((a, b) => urgencyScores[a] > urgencyScores[b] ? a : b);

    const confidence = Math.min(urgencyScores[highestLevel] + (matches.length * 0.1), 1.0);
    const indicators = matches.map(m => m.indicator);

    return {
      level: highestLevel,
      confidence,
      indicators,
      reasoning: `Detected ${matches.length} urgency indicator(s): ${indicators.join(', ')}`
    };
  }

  private analyzeAssignees(
    message: string, 
    teamMembers?: Array<{ id: string; name: string; role: string; skills: string[] }>
  ): AssigneeAnalysis {
    const suggestions: AssigneeSuggestion[] = [];
    
    for (const pattern of this.assigneePatterns) {
      const matches = Array.from(message.matchAll(pattern.pattern));
      
      for (const match of matches) {
        const value = match[1] || match[0];
        
        suggestions.push({
          type: pattern.type,
          value: value.toLowerCase(),
          confidence: pattern.weight,
          context: match[0]
        });
      }
    }

    // Match against known team members
    if (teamMembers) {
      teamMembers.forEach(member => {
        const namePattern = new RegExp(`\\b${member.name.replace(/\s+/g, '\\s+')}\\b`, 'i');
        const rolePattern = new RegExp(`\\b${member.role}\\b`, 'i');
        
        // Check for @mention matching (both full name and first name)
        const firstName = member.name.split(' ')[0].toLowerCase();
        const mentionPattern = new RegExp(`@${firstName}\\b`, 'i');
        
        if (mentionPattern.test(message)) {
          suggestions.push({
            type: 'mention',
            value: member.id,
            confidence: 1.0,
            context: `@mention match: ${member.name}`
          });
        }
        
        if (namePattern.test(message)) {
          suggestions.push({
            type: 'name',
            value: member.id,
            confidence: 0.95,
            context: `Named assignment: ${member.name}`
          });
        }
        
        if (rolePattern.test(message)) {
          suggestions.push({
            type: 'role',
            value: member.id,
            confidence: 0.8,
            context: `Role-based assignment: ${member.role}`
          });
        }

        // Skill-based matching
        member.skills.forEach(skill => {
          const skillPattern = new RegExp(`\\b${skill}\\b`, 'i');
          if (skillPattern.test(message)) {
            suggestions.push({
              type: 'role',
              value: member.id,
              confidence: 0.7,
              context: `Skill-based assignment: ${skill}`
            });
          }
        });
      });
    }

    const confidence = suggestions.length > 0 ? 
      Math.min(Math.max(...suggestions.map(s => s.confidence)) + (suggestions.length * 0.05), 1.0) : 0.2;

    return {
      suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
      confidence,
      reasoning: suggestions.length > 0 ? 
        `Found ${suggestions.length} potential assignee reference(s)` :
        'No clear assignee indicators found'
    };
  }

  private analyzeDeadlines(message: string): DeadlineAnalysis {
    const now = new Date();
    
    for (const pattern of this.deadlinePatterns) {
      const match = message.match(pattern.pattern);
      if (match) {
        const extractedDate = this.parseDeadlineText(match[0], now);
        
        if (extractedDate) {
          return {
            extractedDate,
            confidence: pattern.weight,
            type: pattern.type,
            originalText: match[0],
            reasoning: `Extracted ${pattern.type} deadline from: "${match[0]}"`
          };
        }
      }
    }

    return {
      confidence: 0.1,
      type: 'implied',
      originalText: '',
      reasoning: 'No clear deadline indicators found'
    };
  }

  private parseDeadlineText(text: string, baseDate: Date): Date | undefined {
    const normalizedText = text.toLowerCase().trim();
    
    // Handle relative dates
    if (normalizedText.includes('today') || normalizedText.includes('eod')) {
      return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 17, 0); // 5 PM today
    }
    
    if (normalizedText.includes('tomorrow')) {
      const tomorrow = new Date(baseDate);
      tomorrow.setDate(baseDate.getDate() + 1);
      return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0);
    }
    
    if (normalizedText.includes('this week') || normalizedText.includes('end of week') || normalizedText.includes('eow') || normalizedText.includes('friday')) {
      const friday = new Date(baseDate);
      const daysUntilFriday = (5 - baseDate.getDay() + 7) % 7;
      friday.setDate(baseDate.getDate() + daysUntilFriday);
      return new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 17, 0);
    }
    
    if (normalizedText.includes('next week')) {
      const nextWeek = new Date(baseDate);
      nextWeek.setDate(baseDate.getDate() + 7);
      return new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 17, 0);
    }
    
    // Handle "in X days/weeks" patterns
    const inDaysMatch = normalizedText.match(/in (\d+) days?/);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1]);
      const futureDate = new Date(baseDate);
      futureDate.setDate(baseDate.getDate() + days);
      return futureDate;
    }
    
    const inWeeksMatch = normalizedText.match(/in (\d+) weeks?/);
    if (inWeeksMatch) {
      const weeks = parseInt(inWeeksMatch[1]);
      const futureDate = new Date(baseDate);
      futureDate.setDate(baseDate.getDate() + (weeks * 7));
      return futureDate;
    }
    
    // Handle explicit date formats
    const dateMatch = normalizedText.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1; // JS months are 0-indexed
      const day = parseInt(dateMatch[2]);
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : baseDate.getFullYear();
      
      // Handle 2-digit years
      const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;
      
      return new Date(fullYear, month, day, 17, 0);
    }
    
    // Handle day names
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = dayNames.findIndex(day => normalizedText.includes(day));
    
    if (dayIndex !== -1) {
      const targetDate = new Date(baseDate);
      const currentDay = baseDate.getDay();
      const daysUntilTarget = (dayIndex - currentDay + 7) % 7;
      
      if (daysUntilTarget === 0) {
        // If it's the same day, assume next week
        targetDate.setDate(baseDate.getDate() + 7);
      } else {
        targetDate.setDate(baseDate.getDate() + daysUntilTarget);
      }
      
      return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 17, 0);
    }
    
    return undefined;
  }

  private analyzeProjects(
    message: string,
    projects?: Array<{ id: string; name: string; client: string; keywords: string[] }>
  ): ProjectAnalysis {
    const suggestions: ProjectSuggestion[] = [];
    
    // Pattern-based extraction
    for (const pattern of this.projectPatterns) {
      const matches = Array.from(message.matchAll(pattern.pattern));
      
      for (const match of matches) {
        const value = match[1] || match[0];
        
        suggestions.push({
          type: pattern.type,
          value: value.trim(),
          confidence: pattern.weight,
          context: match[0]
        });
      }
    }

    // Match against known projects
    if (projects) {
      projects.forEach(project => {
        const namePattern = new RegExp(`\\b${project.name.replace(/\s+/g, '\\s+')}\\b`, 'i');
        const clientPattern = new RegExp(`\\b${project.client.replace(/\s+/g, '\\s+')}\\b`, 'i');
        
        if (namePattern.test(message)) {
          suggestions.push({
            type: 'name',
            value: project.id,
            confidence: 0.95,
            context: `Project name match: ${project.name}`
          });
        }
        
        if (clientPattern.test(message)) {
          suggestions.push({
            type: 'client',
            value: project.id,
            confidence: 0.9,
            context: `Client name match: ${project.client}`
          });
        }

        // Keyword matching
        project.keywords.forEach(keyword => {
          const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
          if (keywordPattern.test(message)) {
            suggestions.push({
              type: 'keyword',
              value: project.id,
              confidence: 0.7,
              context: `Keyword match: ${keyword}`
            });
          }
        });
      });
    }

    const confidence = suggestions.length > 0 ? 
      Math.min(Math.max(...suggestions.map(s => s.confidence)) + (suggestions.length * 0.05), 1.0) : 0.3;

    return {
      suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
      confidence,
      reasoning: suggestions.length > 0 ? 
        `Found ${suggestions.length} potential project reference(s)` :
        'No clear project indicators found'
    };
  }

  private analyzeDependencies(message: string, existingTasks?: any[]): DependencyAnalysis {
    const suggestions: DependencySuggestion[] = [];
    
    // Look for dependency keywords
    const dependencyPatterns = [
      { pattern: /\b(after|once|when|following|depends on|requires|needs)\b/i, type: 'prerequisite' as const, confidence: 0.8 },
      { pattern: /\b(before|prior to|ahead of|in advance of)\b/i, type: 'blocking' as const, confidence: 0.8 },
      { pattern: /\b(then|next|subsequently|followed by)\b/i, type: 'sequence' as const, confidence: 0.7 },
      { pattern: /\b(blocks|blocking|prevents|stops)\b/i, type: 'blocking' as const, confidence: 0.9 },
      { pattern: /\b(waiting for|pending|on hold until)\b/i, type: 'prerequisite' as const, confidence: 0.8 }
    ];

    for (const pattern of dependencyPatterns) {
      if (pattern.pattern.test(message)) {
        suggestions.push({
          type: pattern.type,
          description: `Detected ${pattern.type} dependency indicator in message`,
          confidence: pattern.confidence
        });
      }
    }

    // Look for task references
    if (existingTasks && existingTasks.length > 0) {
      existingTasks.forEach(task => {
        if (task.title) {
          const taskPattern = new RegExp(`\\b${task.title.replace(/\s+/g, '\\s+')}\\b`, 'i');
          if (taskPattern.test(message)) {
            suggestions.push({
              type: 'prerequisite',
              description: `References existing task: ${task.title}`,
              confidence: 0.8
            });
          }
        }
      });
    }

    const confidence = suggestions.length > 0 ? 
      Math.min(Math.max(...suggestions.map(s => s.confidence)), 1.0) : 0.2;

    return {
      suggestions,
      confidence,
      reasoning: suggestions.length > 0 ? 
        `Found ${suggestions.length} potential dependency indicator(s)` :
        'No clear dependency relationships detected'
    };
  }

  /**
   * Enhances an extracted task with context clues
   */
  enhanceTaskWithContext(task: ExtractedTask, contextClues: ContextClues): ExtractedTask {
    const enhanced: ExtractedTask = { ...task };

    // Apply urgency analysis
    if (contextClues.urgency.confidence > 0.6) {
      enhanced.priority = contextClues.urgency.level;
    }

    // Apply assignee suggestions
    if (contextClues.assignees.confidence > 0.7 && contextClues.assignees.suggestions.length > 0) {
      const topAssignee = contextClues.assignees.suggestions[0];
      enhanced.assigneeId = topAssignee.value;
    }

    // Apply deadline analysis
    if (contextClues.deadlines.confidence > 0.6 && contextClues.deadlines.extractedDate) {
      enhanced.dueDate = contextClues.deadlines.extractedDate;
    }

    // Apply project association
    if (contextClues.projects.confidence > 0.7 && contextClues.projects.suggestions.length > 0) {
      const topProject = contextClues.projects.suggestions[0];
      enhanced.projectId = topProject.value;
    }

    // Enhance tags with context
    const contextTags: string[] = [];
    if (contextClues.urgency.level === 'urgent') contextTags.push('urgent');
    if (contextClues.deadlines.confidence > 0.5) contextTags.push('deadline');
    if (contextClues.dependencies.confidence > 0.6) contextTags.push('dependency');
    
    enhanced.tags = [...new Set([...enhanced.tags, ...contextTags])];

    // Update confidence based on context richness
    const contextFactors = [
      contextClues.urgency.confidence,
      contextClues.assignees.confidence,
      contextClues.deadlines.confidence,
      contextClues.projects.confidence
    ];
    
    const avgContextConfidence = contextFactors.reduce((sum, conf) => sum + conf, 0) / contextFactors.length;
    enhanced.confidence = Math.min(enhanced.confidence + (avgContextConfidence * 0.2), 1.0);

    return enhanced;
  }
} 