import { ProjectSetupResult, ProjectPhase, TeamAssignment, BudgetBreakdown, Milestone } from './types';

export class ProjectSetup {
  private mockMode: boolean;

  constructor(mockMode: boolean = true) {
    this.mockMode = mockMode;
  }

  async setupProject(
    projectDescription: string,
    context?: {
      clientInfo?: any;
      budget?: number;
      timeline?: string;
    }
  ): Promise<ProjectSetupResult> {
    if (this.mockMode) {
      return this.generateMockProjectSetup(projectDescription, context);
    }
    
    throw new Error('Real project setup not implemented yet');
  }

  async suggestProjectStructure(
    projectType: string,
    requirements: string[]
  ): Promise<{
    phases: ProjectPhase[];
    estimatedDuration: number;
    recommendedTeam: string[];
    budgetEstimate: { min: number; max: number };
  }> {
    if (this.mockMode) {
      return this.generateMockProjectStructure(projectType, requirements);
    }
    
    throw new Error('Real project structure suggestion not implemented yet');
  }

  private generateMockProjectSetup(
    projectDescription: string,
    context?: any
  ): ProjectSetupResult {
    // Simple mock project setup based on description
    const phases: ProjectPhase[] = [
      {
        id: 'phase-1',
        name: 'Discovery & Planning',
        description: 'Initial research and project planning',
        duration: 14,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        tasks: ['research', 'planning', 'requirements'],
        dependencies: []
      },
      {
        id: 'phase-2',
        name: 'Design & Development',
        description: 'Core design and development work',
        duration: 28,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        tasks: ['design', 'development', 'iteration'],
        dependencies: ['phase-1']
      },
      {
        id: 'phase-3',
        name: 'Review & Delivery',
        description: 'Final review and project delivery',
        duration: 7,
        startDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000),
        tasks: ['review', 'finalization', 'delivery'],
        dependencies: ['phase-2']
      }
    ];

    const team: TeamAssignment[] = [
      {
        userId: 'user-1',
        userName: 'Project Manager',
        role: 'Project Manager',
        allocation: 25,
        skills: ['project management', 'client communication'],
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        }
      },
      {
        userId: 'user-2',
        userName: 'Lead Designer',
        role: 'Designer',
        allocation: 80,
        skills: ['design', 'creative direction'],
        availability: {
          start: new Date(),
          end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    return {
      projectId: `project-${Date.now()}`,
      name: 'New Project Setup',
      type: 'General Project',
      structure: {
        phases,
        deliverables: [
          {
            id: 'deliverable-1',
            name: 'Project Plan',
            description: 'Detailed project plan and timeline',
            phaseId: 'phase-1',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: 'pending'
          }
        ],
        dependencies: []
      },
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000),
        totalDuration: 49,
        phases,
        criticalPath: ['research', 'design', 'review']
      },
      team,
      milestones: [
        {
          id: 'milestone-1',
          name: 'Project Kickoff',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          progress: 0,
          dependencies: []
        }
      ],
      recommendations: [
        'Start with clear requirements gathering',
        'Schedule regular client check-ins',
        'Plan for potential scope adjustments'
      ]
    };
  }

  private generateMockProjectStructure(
    projectType: string,
    requirements: string[]
  ): {
    phases: ProjectPhase[];
    estimatedDuration: number;
    recommendedTeam: string[];
    budgetEstimate: { min: number; max: number };
  } {
    const structures = {
      'brand-identity': {
        phases: [
          {
            id: 'discovery',
            name: 'Discovery & Research',
            description: 'Brand audit, competitive analysis, stakeholder interviews',
            duration: 14,
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            tasks: ['brand-audit', 'competitive-analysis', 'stakeholder-interviews'],
            dependencies: []
          },
          {
            id: 'strategy',
            name: 'Brand Strategy',
            description: 'Positioning, messaging, brand architecture',
            duration: 10,
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
            tasks: ['positioning', 'messaging', 'brand-architecture'],
            dependencies: ['discovery']
          },
          {
            id: 'design',
            name: 'Visual Identity',
            description: 'Logo, color palette, typography, visual elements',
            duration: 21,
            startDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            tasks: ['logo-design', 'color-palette', 'typography'],
            dependencies: ['strategy']
          }
        ],
        estimatedDuration: 45,
        recommendedTeam: ['Brand Strategist', 'Senior Designer', 'Project Manager'],
        budgetEstimate: { min: 35000, max: 55000 }
      },
      'web-development': {
        phases: [
          {
            id: 'planning',
            name: 'Planning & Architecture',
            description: 'Requirements, technical planning, system design',
            duration: 14,
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            tasks: ['requirements', 'architecture', 'database-design'],
            dependencies: []
          },
          {
            id: 'development',
            name: 'Development',
            description: 'Backend and frontend development',
            duration: 42,
            startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
            tasks: ['backend-dev', 'frontend-dev', 'integration'],
            dependencies: ['planning']
          },
          {
            id: 'testing',
            name: 'Testing & Launch',
            description: 'QA testing, deployment, launch support',
            duration: 14,
            startDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
            tasks: ['qa-testing', 'deployment', 'launch'],
            dependencies: ['development']
          }
        ],
        estimatedDuration: 70,
        recommendedTeam: ['Full-Stack Developer', 'UX/UI Designer', 'QA Engineer', 'Project Manager'],
        budgetEstimate: { min: 60000, max: 100000 }
      }
    };

    return structures[projectType as keyof typeof structures] || structures['brand-identity'];
  }
} 