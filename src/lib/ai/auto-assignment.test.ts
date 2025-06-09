import { AutoAssignmentEngine, TeamMember, TaskRequirements, WorkloadData, AvailabilityWindow, AssignmentPreferences, PerformanceMetrics } from './auto-assignment';
import { UserRole } from '../auth/types';

describe('AutoAssignmentEngine', () => {
  let autoAssignmentEngine: AutoAssignmentEngine;
  let mockTeamMembers: TeamMember[];

  beforeEach(() => {
    autoAssignmentEngine = new AutoAssignmentEngine(true); // Mock mode for testing

    // Create flexible availability window that covers current date
    const availabilityWindow = {
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      hoursPerDay: 8,
      isFullyAvailable: true
    };

    // Create mock team members with varied profiles
    mockTeamMembers = [
      {
        id: 'designer-1',
        name: 'Sarah Johnson',
        email: 'sarah@agency.com',
        role: UserRole.TEAM_MEMBER,
        skills: ['figma', 'photoshop', 'ui-design', 'visual-design', 'branding'],
        currentWorkload: {
          activeTasks: 4,
          totalEstimatedHours: 32,
          weeklyCapacity: 40,
          utilizationPercentage: 80,
          overdueTasks: 0,
          urgentTasks: 1,
          averageTaskCompletion: 3.5
        },
        availability: [availabilityWindow],
        preferences: {
          preferredTaskTypes: ['design', 'creative', 'ui'],
          projectTypes: ['brand-identity', 'web-design'],
          workingHours: { start: '09:00', end: '17:00', timezone: 'EST' },
          maxConcurrentTasks: 6,
          preferredUrgencyLevels: ['medium', 'high']
        },
        performance: {
          taskCompletionRate: 0.95,
          averageTimeToComplete: 3.2,
          qualityScore: 9.2,
          clientSatisfactionScore: 9.0,
          onTimeDeliveryRate: 0.92,
          collaborationScore: 8.5
        }
      },
      {
        id: 'developer-1',
        name: 'Mike Chen',
        email: 'mike@agency.com',
        role: UserRole.TEAM_MEMBER,
        skills: ['react', 'typescript', 'nextjs', 'nodejs', 'postgresql'],
        currentWorkload: {
          activeTasks: 2,
          totalEstimatedHours: 25,
          weeklyCapacity: 40,
          utilizationPercentage: 62,
          overdueTasks: 0,
          urgentTasks: 0,
          averageTaskCompletion: 4.8
        },
        availability: [availabilityWindow],
        preferences: {
          preferredTaskTypes: ['development', 'technical', 'backend'],
          projectTypes: ['web-development', 'application'],
          workingHours: { start: '10:00', end: '18:00', timezone: 'EST' },
          maxConcurrentTasks: 4,
          preferredUrgencyLevels: ['low', 'medium']
        },
        performance: {
          taskCompletionRate: 0.88,
          averageTimeToComplete: 5.1,
          qualityScore: 8.8,
          clientSatisfactionScore: 8.5,
          onTimeDeliveryRate: 0.85,
          collaborationScore: 9.2
        }
      },
      {
        id: 'pm-1',
        name: 'Jessica Martinez',
        email: 'jessica@agency.com',
        role: UserRole.PROJECT_MANAGER,
        skills: ['project-management', 'communication', 'planning', 'stakeholder-management'],
        currentWorkload: {
          activeTasks: 8,
          totalEstimatedHours: 38,
          weeklyCapacity: 40,
          utilizationPercentage: 95,
          overdueTasks: 1,
          urgentTasks: 3,
          averageTaskCompletion: 2.8
        },
        availability: [availabilityWindow],
        preferences: {
          preferredTaskTypes: ['planning', 'coordination', 'management'],
          projectTypes: ['all'],
          workingHours: { start: '08:00', end: '17:00', timezone: 'EST' },
          maxConcurrentTasks: 10,
          preferredUrgencyLevels: ['high', 'urgent']
        },
        performance: {
          taskCompletionRate: 0.92,
          averageTimeToComplete: 2.5,
          qualityScore: 8.9,
          clientSatisfactionScore: 9.3,
          onTimeDeliveryRate: 0.89,
          collaborationScore: 9.8
        }
      },
      {
        id: 'overloaded-member',
        name: 'Alex Thompson',
        email: 'alex@agency.com',
        role: UserRole.TEAM_MEMBER,
        skills: ['content-writing', 'copywriting', 'marketing'],
        currentWorkload: {
          activeTasks: 12,
          totalEstimatedHours: 45,
          weeklyCapacity: 40,
          utilizationPercentage: 112,
          overdueTasks: 3,
          urgentTasks: 2,
          averageTaskCompletion: 6.2
        },
        availability: [availabilityWindow],
        preferences: {
          preferredTaskTypes: ['writing', 'content', 'marketing'],
          projectTypes: ['content-marketing'],
          workingHours: { start: '09:00', end: '17:00', timezone: 'EST' },
          maxConcurrentTasks: 8,
          preferredUrgencyLevels: ['low', 'medium']
        },
        performance: {
          taskCompletionRate: 0.75,
          averageTimeToComplete: 7.1,
          qualityScore: 7.5,
          clientSatisfactionScore: 7.8,
          onTimeDeliveryRate: 0.68,
          collaborationScore: 8.0
        }
      }
    ];
  });

  describe('getAssignmentRecommendations', () => {
    it('should return assignment recommendations for a design task', async () => {
      const designTask: TaskRequirements = {
        title: 'Create UI mockups for dashboard',
        description: 'Design intuitive dashboard interface with figma',
        skillsRequired: ['figma', 'ui-design'],
        priority: 'medium',
        estimatedHours: 8,
        complexity: 'medium',
        requiresCollaboration: false,
        clientFacing: true
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        designTask,
        mockTeamMembers
      );

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].memberName).toBe('Sarah Johnson'); // Designer should be top recommendation
      expect(recommendations[0].confidence).toBeGreaterThan(0.7);
      expect(recommendations[0].reasoning).toContain('Good skill match for task requirements');
    });

    it('should return assignment recommendations for a development task', async () => {
      const devTask: TaskRequirements = {
        title: 'Implement API endpoints',
        description: 'Build REST API with nodejs and typescript',
        skillsRequired: ['nodejs', 'typescript'],
        priority: 'high',
        estimatedHours: 16,
        complexity: 'complex',
        requiresCollaboration: true,
        clientFacing: false
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        devTask,
        mockTeamMembers
      );

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].memberName).toBe('Mike Chen'); // Developer should be top recommendation
      expect(recommendations[0].confidence).toBeGreaterThan(0.7);
    });

    it('should prioritize workload balance in recommendations', async () => {
      const task: TaskRequirements = {
        title: 'General task',
        description: 'Task that could be done by multiple people',
        skillsRequired: [],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        task,
        mockTeamMembers
      );

      // Mike (62% utilization) should rank higher than Jessica (95% utilization)
      const mikeRank = recommendations.findIndex(r => r.memberName === 'Mike Chen');
      const jessicaRank = recommendations.findIndex(r => r.memberName === 'Jessica Martinez');
      
      expect(mikeRank).toBeLessThan(jessicaRank);
    });

    it('should exclude overloaded team members from eligible candidates', async () => {
      const task: TaskRequirements = {
        title: 'Content writing task',
        description: 'Write marketing copy',
        skillsRequired: ['copywriting'],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: true
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        task,
        mockTeamMembers
      );

      // Alex Thompson (112% utilization) should not be included in recommendations
      const overloadedMember = recommendations.find(r => r.memberName === 'Alex Thompson');
      expect(overloadedMember).toBeUndefined();
    });

    it('should handle urgent tasks appropriately', async () => {
      const urgentTask: TaskRequirements = {
        title: 'Critical bug fix',
        description: 'Fix production issue immediately',
        skillsRequired: ['development'],
        priority: 'urgent',
        estimatedHours: 2,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day deadline
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        urgentTask,
        mockTeamMembers
      );

      expect(recommendations).toHaveLength(3);
      // Should consider performance and current urgent task load
      const topRecommendation = recommendations[0];
      expect(topRecommendation.workloadImpact.estimatedDeliveryDate).toBeDefined();
    });

    it('should provide meaningful reasoning and risk factors', async () => {
      const task: TaskRequirements = {
        title: 'Design project',
        description: 'Create visual designs',
        skillsRequired: ['design'],
        priority: 'medium',
        estimatedHours: 12,
        complexity: 'medium',
        requiresCollaboration: false,
        clientFacing: true
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        task,
        mockTeamMembers
      );

      const topRecommendation = recommendations[0];
      expect(topRecommendation.reasoning).toBeInstanceOf(Array);
      expect(topRecommendation.reasoning.length).toBeGreaterThan(0);
      expect(topRecommendation.riskFactors).toBeInstanceOf(Array);
      expect(topRecommendation.workloadImpact).toBeDefined();
      expect(topRecommendation.alternativeOptions).toBeInstanceOf(Array);
    });

    it('should throw error when no eligible members found', async () => {
      const impossibleTask: TaskRequirements = {
        title: 'Impossible task',
        description: 'Requires non-existent skills',
        skillsRequired: ['quantum-computing', 'time-travel'],
        roleRequired: UserRole.CLIENT, // Clients don't get assigned tasks
        priority: 'urgent',
        estimatedHours: 100,
        complexity: 'complex',
        requiresCollaboration: true,
        clientFacing: true
      };

      await expect(
        autoAssignmentEngine.getAssignmentRecommendations(impossibleTask, mockTeamMembers)
      ).rejects.toThrow('No eligible team members found for this task');
    });
  });

  describe('getTeamWorkloadSummary', () => {
    it('should provide accurate team workload summary', async () => {
      const summary = await autoAssignmentEngine.getTeamWorkloadSummary(mockTeamMembers);

      expect(summary.totalMembers).toBe(4);
      expect(summary.averageUtilization).toBeCloseTo((80 + 62 + 95 + 112) / 4, 1);
      expect(summary.overloadedMembers).toBe(1); // Alex Thompson at 112%
      expect(summary.urgentTasksCount).toBe(6); // Sum of all urgent tasks
      expect(summary.memberSummaries).toHaveLength(4);

      // Check member status categorization
      const sarahSummary = summary.memberSummaries.find(m => m.name === 'Sarah Johnson');
      const mikeSummary = summary.memberSummaries.find(m => m.name === 'Mike Chen');
      const jessicaSummary = summary.memberSummaries.find(m => m.name === 'Jessica Martinez');
      const alexSummary = summary.memberSummaries.find(m => m.name === 'Alex Thompson');

      expect(sarahSummary?.status).toBe('optimal'); // 80% utilization
      expect(mikeSummary?.status).toBe('available'); // 62% utilization
      expect(jessicaSummary?.status).toBe('busy'); // 95% utilization
      expect(alexSummary?.status).toBe('overloaded'); // 112% utilization
    });

    it('should calculate available capacity correctly', async () => {
      const summary = await autoAssignmentEngine.getTeamWorkloadSummary(mockTeamMembers);

      // Available capacity = sum of (100 - utilization) for each member, but only positive values
      const expectedCapacity = Math.max(0, 100 - 80) + Math.max(0, 100 - 62) + 
                              Math.max(0, 100 - 95) + Math.max(0, 100 - 112);
      expect(summary.availableCapacity).toBe(expectedCapacity); // 20 + 38 + 5 + 0 = 63
    });
  });

  describe('Skill Matching', () => {
    it('should score exact skill matches highly', () => {
      const engine = new AutoAssignmentEngine(false); // Test actual implementation
      const task: TaskRequirements = {
        title: 'Figma Design',
        skillsRequired: ['figma'],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false
      };

      const designer = mockTeamMembers.find(m => m.name === 'Sarah Johnson')!;
      const score = (engine as any).calculateSkillMatchScore(task, designer);
      
      expect(score).toBeGreaterThan(0.8);
    });

    it('should handle partial skill matches', () => {
      const engine = new AutoAssignmentEngine(false);
      const task: TaskRequirements = {
        title: 'Design Task',
        skillsRequired: ['figma', 'animation'], // Sarah has figma but not animation
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false
      };

      const designer = mockTeamMembers.find(m => m.name === 'Sarah Johnson')!;
      const score = (engine as any).calculateSkillMatchScore(task, designer);
      
      expect(score).toBe(0.5); // 1 out of 2 skills matched
    });

    it('should give neutral score when no skills required', () => {
      const engine = new AutoAssignmentEngine(false);
      const task: TaskRequirements = {
        title: 'General Task',
        skillsRequired: [],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false
      };

      const member = mockTeamMembers[0];
      const score = (engine as any).calculateSkillMatchScore(task, member);
      
      expect(score).toBe(0.8); // Neutral score
    });
  });

  describe('Workload Scoring', () => {
    it('should score optimal utilization (75-85%) highest', () => {
      const engine = new AutoAssignmentEngine(false);
      
      const optimalMember = { ...mockTeamMembers[0] };
      optimalMember.currentWorkload.utilizationPercentage = 80;
      
      const score = (engine as any).calculateWorkloadScore(optimalMember);
      expect(score).toBe(1.0);
    });

    it('should penalize overutilization heavily', () => {
      const engine = new AutoAssignmentEngine(false);
      
      const overloadedMember = { ...mockTeamMembers[0] };
      overloadedMember.currentWorkload.utilizationPercentage = 100;
      
      const score = (engine as any).calculateWorkloadScore(overloadedMember);
      expect(score).toBeLessThan(0.5);
    });

    it('should slightly penalize underutilization', () => {
      const engine = new AutoAssignmentEngine(false);
      
      const underutilizedMember = { ...mockTeamMembers[0] };
      underutilizedMember.currentWorkload.utilizationPercentage = 50;
      
      const score = (engine as any).calculateWorkloadScore(underutilizedMember);
      expect(score).toBeLessThan(1.0);
      expect(score).toBeGreaterThan(0.5);
    });
  });

  describe('Role Alignment', () => {
    it('should score project management tasks high for project managers', () => {
      const engine = new AutoAssignmentEngine(false);
      const task: TaskRequirements = {
        title: 'Project planning and coordination',
        description: 'Plan project timeline and coordinate with stakeholders',
        skillsRequired: [],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false
      };

      const pm = mockTeamMembers.find(m => m.role === UserRole.PROJECT_MANAGER)!;
      const score = (engine as any).calculateRoleAlignmentScore(task, pm);
      
      expect(score).toBeGreaterThan(0.5);
    });

    it('should score development tasks high for team members with dev skills', () => {
      const engine = new AutoAssignmentEngine(false);
      const task: TaskRequirements = {
        title: 'Implementation and development',
        description: 'Implement new features',
        skillsRequired: [],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false
      };

      const developer = mockTeamMembers.find(m => m.name === 'Mike Chen')!;
      const score = (engine as any).calculateRoleAlignmentScore(task, developer);
      
      expect(score).toBeGreaterThan(0.0);
    });
  });

  describe('Availability Scoring', () => {
    it('should score high when plenty of time available', () => {
      const engine = new AutoAssignmentEngine(false);
      const task: TaskRequirements = {
        title: 'Small task',
        skillsRequired: [],
        priority: 'medium',
        estimatedHours: 2, // Small task
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      const member = mockTeamMembers[0]; // 8 hours per day available
      const score = (engine as any).calculateAvailabilityScore(task, member);
      
      expect(score).toBe(1.0); // Plenty of time (40 hours available vs 2 needed)
    });

    it('should score low when no availability window covers task period', () => {
      const engine = new AutoAssignmentEngine(false);
      const task: TaskRequirements = {
        title: 'Future task',
        skillsRequired: [],
        priority: 'medium',
        estimatedHours: 4,
        complexity: 'simple',
        requiresCollaboration: false,
        clientFacing: false,
        deadline: new Date('2025-12-31') // Way in the future
      };

      const member = { ...mockTeamMembers[0] };
      member.availability = [{
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'), // Doesn't cover 2025
        hoursPerDay: 8,
        isFullyAvailable: true
      }];

      const score = (engine as any).calculateAvailabilityScore(task, member);
      expect(score).toBe(0.1); // No suitable availability window
    });
  });

  describe('Performance Scoring', () => {
    it('should weight different performance metrics correctly', () => {
      const engine = new AutoAssignmentEngine(false);
      
      const highPerformer = { ...mockTeamMembers[0] };
      highPerformer.performance = {
        taskCompletionRate: 1.0,
        averageTimeToComplete: 2.0,
        qualityScore: 10,
        clientSatisfactionScore: 10,
        onTimeDeliveryRate: 1.0,
        collaborationScore: 10
      };

      const score = (engine as any).calculatePerformanceScore(highPerformer);
      expect(score).toBeCloseTo(1.0, 2);
    });

    it('should score poor performers lower', () => {
      const engine = new AutoAssignmentEngine(false);
      
      const poorPerformer = { ...mockTeamMembers[0] };
      poorPerformer.performance = {
        taskCompletionRate: 0.5,
        averageTimeToComplete: 10.0,
        qualityScore: 5,
        clientSatisfactionScore: 5,
        onTimeDeliveryRate: 0.5,
        collaborationScore: 5
      };

      const score = (engine as any).calculatePerformanceScore(poorPerformer);
      expect(score).toBeCloseTo(0.5, 1);
    });
  });

  describe('Integration with existing context analyzer', () => {
    it('should work with context-analyzer assignee suggestions', async () => {
      // This test would verify integration with the existing ContextAnalyzer
      // for now, we'll just test that the auto-assignment can accept context
      const task: TaskRequirements = {
        title: 'Design task',
        skillsRequired: ['design'],
        priority: 'medium',
        estimatedHours: 8,
        complexity: 'medium',
        requiresCollaboration: false,
        clientFacing: true
      };

      const context = {
        projectId: 'test-project',
        requesterId: 'test-user',
        urgencyOverride: false
      };

      const recommendations = await autoAssignmentEngine.getAssignmentRecommendations(
        task,
        mockTeamMembers,
        context
      );

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0]).toHaveProperty('confidence');
      expect(recommendations[0]).toHaveProperty('workloadImpact');
    });
  });
}); 