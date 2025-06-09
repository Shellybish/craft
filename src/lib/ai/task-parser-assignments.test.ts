import { TaskParser } from './task-parser';
import { TeamMember, WorkloadData, AvailabilityWindow, AssignmentPreferences, PerformanceMetrics } from './auto-assignment';
import { UserRole } from '../auth/types';

describe('TaskParser with Auto-Assignment Integration', () => {
  let taskParser: TaskParser;
  let mockTeamMembers: TeamMember[];

  beforeEach(() => {
    taskParser = new TaskParser(true); // Mock mode

    // Create flexible availability window that covers current date
    const availabilityWindow: AvailabilityWindow = {
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      hoursPerDay: 8,
      isFullyAvailable: true
    };

    // Create mock team members
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
      }
    ];
  });

  describe('parseMessageWithAssignments', () => {
    it('should parse message and provide assignment recommendations', async () => {
      const message = "We need to create UI mockups for the new dashboard using Figma.";
      const context = {
        userId: 'requester-1',
        projectId: 'project-1',
        teamMembers: mockTeamMembers
      };

      const result = await taskParser.parseMessageWithAssignments(message, context);

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toContain('UI mockups');
      expect(result.assignmentRecommendations).toHaveLength(1);
      
      const assignmentRec = result.assignmentRecommendations[0];
      expect(assignmentRec.recommendations).toHaveLength(2); // Should have 2 eligible members
      expect(assignmentRec.recommendations[0].memberName).toBe('Sarah Johnson'); // Designer should be first
      expect(assignmentRec.recommendations[0].confidence).toBeGreaterThan(0.7);
    });

    it('should assign development tasks to developers', async () => {
      const message = "We need to build a REST API with Node.js and TypeScript for user authentication.";
      const context = {
        userId: 'requester-1',
        projectId: 'project-1',
        teamMembers: mockTeamMembers
      };

      const result = await taskParser.parseMessageWithAssignments(message, context);

      expect(result.tasks).toHaveLength(1);
      expect(result.assignmentRecommendations).toHaveLength(1);
      
      const assignmentRec = result.assignmentRecommendations[0];
      expect(assignmentRec.recommendations[0].memberName).toBe('Mike Chen'); // Developer should be first
      expect(assignmentRec.recommendations[0].confidence).toBeGreaterThan(0.7);
    });

    it('should handle multiple tasks with different skill requirements', async () => {
      const message = "For this project, we need to design the user interface in Figma and then implement the frontend with React. Also need to write API documentation.";
      const context = {
        userId: 'requester-1',
        projectId: 'project-1',
        teamMembers: mockTeamMembers
      };

      const result = await taskParser.parseMessageWithAssignments(message, context);

      expect(result.tasks.length).toBeGreaterThan(0);
      expect(result.assignmentRecommendations.length).toBeGreaterThan(0);
      
      // Each task should have assignment recommendations
      result.assignmentRecommendations.forEach(assignment => {
        expect(assignment.recommendations.length).toBeGreaterThan(0);
        expect(assignment.recommendations[0].confidence).toBeGreaterThan(0);
      });
    });

    it('should work without team members', async () => {
      const message = "We need to create a website.";
      const context = {
        userId: 'requester-1',
        projectId: 'project-1'
        // No teamMembers provided
      };

      const result = await taskParser.parseMessageWithAssignments(message, context);

      expect(result.tasks).toHaveLength(1);
      expect(result.assignmentRecommendations).toHaveLength(0); // No recommendations without team members
    });

    it('should handle complex task requirements', async () => {
      const message = "Create high-fidelity UI mockups using Figma for the client dashboard, including responsive design for mobile and tablet.";
      const context = {
        userId: 'requester-1',
        projectId: 'project-1',
        teamMembers: mockTeamMembers
      };

      const result = await taskParser.parseMessageWithAssignments(message, context);

      expect(result.tasks).toHaveLength(1);
      expect(result.assignmentRecommendations).toHaveLength(1);
      
      const task = result.tasks[0];
      const assignmentRec = result.assignmentRecommendations[0];
      
      // Should extract relevant complexity and requirements
      expect(task.estimatedHours).toBeGreaterThan(0);
      expect(assignmentRec.recommendations[0].workloadImpact).toBeDefined();
      expect(assignmentRec.recommendations[0].reasoning).toBeInstanceOf(Array);
    });

    it('should handle assignment failures gracefully', async () => {
      const message = "We need to create a design.";
      const context = {
        userId: 'requester-1',
        projectId: 'project-1',
        teamMembers: [] // Empty team members array
      };

      const result = await taskParser.parseMessageWithAssignments(message, context);

      expect(result.tasks).toHaveLength(1);
      expect(result.assignmentRecommendations).toHaveLength(1);
      expect(result.assignmentRecommendations[0].recommendations).toHaveLength(0);
      expect(result.assignmentRecommendations[0].error).toBeDefined();
    });

    it('should extract skills correctly from task content', () => {
      const taskParser = new TaskParser(true);
      
      // Test the private method by casting to any
      const extractSkills = (taskParser as any).extractSkillsFromTask.bind(taskParser);
      
      const designTask = {
        title: 'Create UI mockups with Figma',
        description: 'Design dashboard interface',
        tags: ['design'],
        priority: 'medium' as const,
        confidence: 0.8
      };
      
      const skills = extractSkills(designTask);
      expect(skills).toContain('design');
      expect(skills).toContain('figma');
    });

    it('should determine task complexity correctly', () => {
      const taskParser = new TaskParser(true);
      
      // Test the private method by casting to any
      const determineComplexity = (taskParser as any).determineTaskComplexity.bind(taskParser);
      
      const simpleTask = {
        title: 'Quick review of design',
        description: 'Simple check',
        estimatedHours: 1,
        tags: [],
        priority: 'low' as const,
        confidence: 0.8
      };
      
      const complexTask = {
        title: 'Complete system architecture',
        description: 'Complex integration project',
        estimatedHours: 40,
        tags: [],
        priority: 'high' as const,
        confidence: 0.8
      };
      
      expect(determineComplexity(simpleTask)).toBe('simple');
      expect(determineComplexity(complexTask)).toBe('complex');
    });

    it('should identify client-facing tasks correctly', () => {
      const taskParser = new TaskParser(true);
      
      // Test the private method by casting to any
      const isClientFacing = (taskParser as any).isClientFacing.bind(taskParser);
      
      const clientTask = {
        title: 'Present design to client',
        description: 'Client presentation meeting',
        tags: ['client', 'presentation'],
        priority: 'high' as const,
        confidence: 0.8
      };
      
      const internalTask = {
        title: 'Refactor database queries',
        description: 'Internal optimization',
        tags: ['development'],
        priority: 'medium' as const,
        confidence: 0.8
      };
      
      expect(isClientFacing(clientTask)).toBe(true);
      expect(isClientFacing(internalTask)).toBe(false);
    });
  });
}); 