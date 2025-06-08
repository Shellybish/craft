// AI Service Types and Interfaces

export interface AIModelConfig {
  provider: 'claude' | 'gemini' | 'openai';
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  userId: string;
  projectId?: string;
  conversationId: string;
  messages: ConversationMessage[];
  context?: Record<string, any>;
}

export interface TaskParseResult {
  tasks: ExtractedTask[];
  confidence: number;
  suggestions: string[];
}

export interface ExtractedTask {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  projectId?: string;
  dueDate?: Date;
  tags: string[];
  estimatedHours?: number;
  dependencies?: string[];
  confidence: number;
}

export interface PriorityAnalysis {
  topPriorities: PriorityItem[];
  insights: string[];
  recommendations: string[];
  riskFactors: RiskFactor[];
  workloadSummary: WorkloadSummary;
}

export interface PriorityItem {
  taskId: string;
  title: string;
  urgencyScore: number;
  impactScore: number;
  combinedScore: number;
  reasoning: string;
  projectName?: string;
  clientName?: string;
  dueDate?: Date;
}

export interface RiskFactor {
  type: 'deadline' | 'resource' | 'dependency' | 'client';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedTasks: string[];
  recommendation: string;
}

export interface WorkloadSummary {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  estimatedHoursRemaining: number;
}

export interface StatusUpdate {
  projectId: string;
  projectName: string;
  summary: string;
  progress: ProjectProgress;
  milestones: Milestone[];
  risks: RiskFactor[];
  nextSteps: string[];
  clientMessage: string;
  lastUpdated: Date;
}

export interface ProjectProgress {
  completionPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
  timeline: {
    original: Date;
    current: Date;
    variance: number; // days
  };
  budget?: {
    allocated: number;
    spent: number;
    remaining: number;
  };
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  dependencies: string[];
}

export interface ProjectSetupResult {
  projectId: string;
  name: string;
  type: string;
  structure: ProjectStructure;
  timeline: ProjectTimeline;
  team: TeamAssignment[];
  budget?: BudgetBreakdown;
  milestones: Milestone[];
  recommendations: string[];
}

export interface ProjectStructure {
  phases: ProjectPhase[];
  deliverables: Deliverable[];
  dependencies: ProjectDependency[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  startDate: Date;
  endDate: Date;
  tasks: string[];
  dependencies: string[];
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  phaseId: string;
  dueDate: Date;
  assigneeId?: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
}

export interface ProjectDependency {
  id: string;
  dependentTaskId: string;
  prerequisiteTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish';
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  totalDuration: number; // days
  phases: ProjectPhase[];
  criticalPath: string[];
}

export interface TeamAssignment {
  userId: string;
  userName: string;
  role: string;
  allocation: number; // percentage
  skills: string[];
  availability: {
    start: Date;
    end: Date;
  };
}

export interface BudgetBreakdown {
  total: number;
  phases: Array<{
    phaseId: string;
    amount: number;
    breakdown: Record<string, number>;
  }>;
  contingency: number;
} 