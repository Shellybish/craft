import { PriorityAnalysis, PriorityItem, RiskFactor, WorkloadSummary } from './types';

export class PriorityAnalyzer {
  private mockMode: boolean;

  constructor(mockMode: boolean = true) {
    this.mockMode = mockMode;
  }

  async analyzeDailyPriorities(
    userId: string,
    context?: {
      tasks?: any[];
      projects?: any[];
      calendar?: any[];
      teamWorkload?: any[];
    }
  ): Promise<PriorityAnalysis> {
    if (this.mockMode) {
      return this.generateMockPriorityAnalysis(userId, context);
    }
    
    // Real AI analysis would go here
    throw new Error('Real priority analysis not implemented yet');
  }

  async analyzeProjectHealth(
    projectId: string,
    context?: {
      tasks?: any[];
      milestones?: any[];
      budget?: any;
      team?: any[];
    }
  ): Promise<{
    healthScore: number;
    risks: RiskFactor[];
    recommendations: string[];
    insights: string[];
  }> {
    if (this.mockMode) {
      return this.generateMockProjectHealth(projectId, context);
    }
    
    throw new Error('Real project health analysis not implemented yet');
  }

  private generateMockPriorityAnalysis(
    userId: string,
    context?: any
  ): PriorityAnalysis {
    const currentHour = new Date().getHours();
    const isEarlyMorning = currentHour < 10;
    
    // Generate varied priorities based on time of day
    const topPriorities: PriorityItem[] = [];
    
    if (isEarlyMorning) {
      topPriorities.push(
        {
          taskId: 'task-1',
          title: 'Client presentation preparation',
          urgencyScore: 95,
          impactScore: 90,
          combinedScore: 92.5,
          reasoning: 'High-stakes client meeting scheduled for today. Significant revenue opportunity.',
          projectName: 'Nike Rebranding',
          clientName: 'Nike Inc.',
          dueDate: new Date(new Date().setHours(14, 0, 0, 0))
        },
        {
          taskId: 'task-2', 
          title: 'Review critical bug fixes',
          urgencyScore: 85,
          impactScore: 80,
          combinedScore: 82.5,
          reasoning: 'Production bugs affecting user experience. Quick resolution needed.',
          projectName: 'TechStart Platform',
          clientName: 'TechStart Inc.',
          dueDate: new Date(new Date().setHours(11, 0, 0, 0))
        }
      );
    } else {
      topPriorities.push(
        {
          taskId: 'task-4',
          title: 'Complete quarterly budget review',
          urgencyScore: 80,
          impactScore: 95,
          combinedScore: 87.5,
          reasoning: 'Finance deadline approaching. Critical for business planning.',
          projectName: 'Business Operations',
          dueDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
        }
      );
    }

    const insights = [
      'Morning focus time - tackle your highest cognitive load tasks first',
      `You have ${topPriorities.length} high-impact items that benefit from fresh energy`
    ];

    const recommendations = [
      `Start with "${topPriorities[0].title}" - highest combined impact/urgency score`,
      'Block morning calendar for deep work on complex tasks'
    ];

    const riskFactors: RiskFactor[] = [
      {
        type: 'deadline',
        severity: 'medium',
        description: 'Multiple critical deadlines competing for attention',
        affectedTasks: ['task-1', 'task-2'],
        recommendation: 'Consider delegating or rescheduling lower-impact tasks'
      }
    ];

    const workloadSummary: WorkloadSummary = {
      totalTasks: 23,
      completedTasks: 18,
      overdueTasks: 2,
      upcomingDeadlines: 5,
      estimatedHoursRemaining: 32
    };

    return {
      topPriorities,
      insights,
      recommendations,
      riskFactors,
      workloadSummary
    };
  }

  private generateMockProjectHealth(
    projectId: string,
    context?: any
  ): {
    healthScore: number;
    risks: RiskFactor[];
    recommendations: string[];
    insights: string[];
  } {
    return {
      healthScore: 85,
      risks: [
        {
          type: 'deadline',
          severity: 'low',
          description: 'Minor delay in design review phase',
          affectedTasks: ['design-review', 'client-feedback'],
          recommendation: 'Schedule additional design review session to catch up'
        }
      ],
      recommendations: [
        'Project is performing well overall',
        'Consider reallocating resources from Phase 1 to accelerate Phase 2'
      ],
      insights: [
        'Team velocity has increased 15% since last sprint',
        'Client engagement is above average'
      ]
    };
  }
} 