import { ContextAnalyzer, ContextClues } from './context-analyzer';
import { ExtractedTask } from './types';

describe('ContextAnalyzer', () => {
  let analyzer: ContextAnalyzer;

  beforeEach(() => {
    analyzer = new ContextAnalyzer();
  });

  describe('Urgency Analysis', () => {
    it('should detect urgent priority indicators', () => {
      const message = "This is urgent! Need to fix the critical bug ASAP.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('urgent');
      expect(result.urgency.confidence).toBeGreaterThan(0.8);
      expect(result.urgency.indicators).toEqual(expect.arrayContaining(['urgent', 'critical', 'ASAP']));
    });

    it('should detect high priority indicators', () => {
      const message = "This is high priority and important for the client deadline tomorrow.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('high');
      expect(result.urgency.confidence).toBeGreaterThan(0.6);
      expect(result.urgency.indicators).toEqual(expect.arrayContaining(['high priority', 'important']));
    });

    it('should detect low priority indicators', () => {
      const message = "Eventually we should update this when you can get to it.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('low');
      expect(result.urgency.confidence).toBeGreaterThan(0.2);
      expect(result.urgency.indicators).toEqual(expect.arrayContaining(['Eventually', 'when you can']));
    });

    it('should default to medium priority when no indicators found', () => {
      const message = "Please review the document and make changes.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('medium');
      expect(result.urgency.confidence).toBe(0.5);
      expect(result.urgency.indicators).toHaveLength(0);
    });

    it('should handle multiple urgency indicators correctly', () => {
      const message = "This is urgent and important - critical deadline today!";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('urgent');
      expect(result.urgency.confidence).toBeGreaterThan(0.9);
      expect(result.urgency.indicators.length).toBeGreaterThan(2);
    });

    it('should detect "by tomorrow" patterns', () => {
      const message = "Update the website for the client by tomorrow";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('high');
      expect(result.urgency.confidence).toBeGreaterThan(0.6);
      expect(result.urgency.indicators).toEqual(expect.arrayContaining(['by tomorrow', 'for the client']));
    });

    it('should detect "for the client" patterns', () => {
      const message = "Create a new logo design for the client";
      const result = analyzer.analyzeContext(message);
      
      expect(result.urgency.level).toBe('high');
      expect(result.urgency.confidence).toBeGreaterThan(0.6);
      expect(result.urgency.indicators).toEqual(expect.arrayContaining(['for the client']));
    });
  });

  describe('Assignee Analysis', () => {
    const mockTeamMembers = [
      { id: 'john-id', name: 'John Smith', role: 'designer', skills: ['photoshop', 'figma'] },
      { id: 'sarah-id', name: 'Sarah Johnson', role: 'developer', skills: ['react', 'typescript'] },
      { id: 'mike-id', name: 'Mike Wilson', role: 'project manager', skills: ['planning', 'coordination'] }
    ];

    it('should detect @mentions', () => {
      const message = "Please @john handle this design task.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.assignees.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'mention',
            value: 'john',
            confidence: 1.0
          })
        ])
      );
    });

    it('should detect role-based assignments', () => {
      const message = "The designer should create mockups for this.";
      const result = analyzer.analyzeContext(message, { teamMembers: mockTeamMembers });
      
      expect(result.assignees.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'role',
            value: 'john-id',
            confidence: 0.8
          })
        ])
      );
    });

    it('should detect name-based assignments', () => {
      const message = "John Smith needs to review this design.";
      const result = analyzer.analyzeContext(message, { teamMembers: mockTeamMembers });
      
      expect(result.assignees.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'name',
            value: 'john-id',
            confidence: 0.95
          })
        ])
      );
    });

    it('should detect skill-based assignments', () => {
      const message = "We need someone with React experience to fix this.";
      const result = analyzer.analyzeContext(message, { teamMembers: mockTeamMembers });
      
      expect(result.assignees.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'role',
            value: 'sarah-id',
            context: 'Skill-based assignment: react'
          })
        ])
      );
    });

    it('should handle no clear assignee indicators', () => {
      const message = "This task needs to be completed.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.assignees.confidence).toBeLessThan(0.3);
      expect(result.assignees.reasoning).toContain('No clear assignee indicators found');
    });
  });

  describe('Deadline Analysis', () => {
    beforeEach(() => {
      // Mock Date.now() to ensure consistent test results
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:00:00Z')); // Monday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should detect "today" deadlines', () => {
      const message = "This needs to be done today by end of day.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.deadlines.type).toBe('relative');
      expect(result.deadlines.confidence).toBe(1.0);
      expect(result.deadlines.originalText).toBe('today');
    });

    it('should detect "tomorrow" deadlines', () => {
      const message = "Please finish this by tomorrow.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.deadlines.type).toBe('relative');
      expect(result.deadlines.extractedDate?.getDate()).toBe(16); // Next day
    });

    it('should detect "this week" deadlines', () => {
      const message = "We need this completed by end of week.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.deadlines.type).toBe('relative');
      expect(result.deadlines.extractedDate?.getDay()).toBe(5); // Friday
    });

    it('should detect explicit date formats', () => {
      const message = "The deadline is 1/20/2024.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.deadlines.type).toBe('explicit');
      expect(result.deadlines.extractedDate?.getMonth()).toBe(0); // January (0-indexed)
      expect(result.deadlines.extractedDate?.getDate()).toBe(20);
      expect(result.deadlines.extractedDate?.getFullYear()).toBe(2024);
    });

    it('should detect "in X days" patterns', () => {
      const message = "This should be ready in 3 days.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.deadlines.type).toBe('relative');
      expect(result.deadlines.extractedDate?.getDate()).toBe(18); // 3 days from Jan 15
    });

    it('should detect day name references', () => {
      const message = "Have this ready by Friday please.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.deadlines.type).toBe('relative');
      expect(result.deadlines.extractedDate?.getDay()).toBe(5); // Friday
    });

    it('should handle no deadline indicators', () => {
      const message = "Please review this document.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.deadlines.extractedDate).toBeUndefined();
      expect(result.deadlines.confidence).toBe(0.1);
      expect(result.deadlines.reasoning).toContain('No clear deadline indicators found');
    });
  });

  describe('Project Analysis', () => {
    const mockProjects = [
      { 
        id: 'nike-project', 
        name: 'Nike Rebrand', 
        client: 'Nike Inc', 
        keywords: ['swoosh', 'athletics', 'branding'] 
      },
      { 
        id: 'tesla-project', 
        name: 'Tesla Website', 
        client: 'Tesla Motors', 
        keywords: ['electric', 'automotive', 'web design'] 
      }
    ];

    it('should detect project name references', () => {
      const message = "Update the Nike Rebrand project timeline.";
      const result = analyzer.analyzeContext(message, { projects: mockProjects });
      
      expect(result.projects.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'name',
            value: 'nike-project',
            confidence: 0.95
          })
        ])
      );
    });

    it('should detect client name references', () => {
      const message = "Tesla Motors wants to see the latest designs.";
      const result = analyzer.analyzeContext(message, { projects: mockProjects });
      
      expect(result.projects.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'client',
            value: 'tesla-project',
            confidence: 0.9
          })
        ])
      );
    });

    it('should detect keyword references', () => {
      const message = "The web design needs some updates.";
      const result = analyzer.analyzeContext(message, { projects: mockProjects });
      
      expect(result.projects.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'keyword',
            value: 'tesla-project',
            context: 'Keyword match: web design'
          })
        ])
      );
    });

    it('should detect general project type patterns', () => {
      const message = "We need to start the brand identity project.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.projects.suggestions.length).toBeGreaterThan(0);
      expect(result.projects.suggestions[0].type).toBe('keyword');
    });

    it('should handle no project indicators', () => {
      const message = "Please send me the files.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.projects.confidence).toBe(0.3);
      expect(result.projects.reasoning).toContain('No clear project indicators found');
    });
  });

  describe('Dependency Analysis', () => {
    const mockExistingTasks = [
      { title: 'Create wireframes', id: 'task-1' },
      { title: 'Design mockups', id: 'task-2' },
      { title: 'Client review', id: 'task-3' }
    ];

    it('should detect prerequisite dependencies', () => {
      const message = "After the wireframes are done, we can start coding.";
      const result = analyzer.analyzeContext(message, { existingTasks: mockExistingTasks });
      
      expect(result.dependencies.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'prerequisite',
            confidence: 0.8
          })
        ])
      );
    });

    it('should detect blocking dependencies', () => {
      const message = "This task is blocking the client review.";
      const result = analyzer.analyzeContext(message, { existingTasks: mockExistingTasks });
      
      expect(result.dependencies.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'blocking',
            confidence: 0.9
          })
        ])
      );
    });

    it('should detect sequence dependencies', () => {
      const message = "First create wireframes, then design mockups.";
      const result = analyzer.analyzeContext(message, { existingTasks: mockExistingTasks });
      
      expect(result.dependencies.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'sequence'
          })
        ])
      );
    });

    it('should detect task references', () => {
      const message = "This depends on Create wireframes being completed.";
      const result = analyzer.analyzeContext(message, { existingTasks: mockExistingTasks });
      
      expect(result.dependencies.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'prerequisite',
            description: 'References existing task: Create wireframes'
          })
        ])
      );
    });

    it('should handle no dependency indicators', () => {
      const message = "This is a standalone task.";
      const result = analyzer.analyzeContext(message);
      
      expect(result.dependencies.confidence).toBe(0.2);
      expect(result.dependencies.reasoning).toContain('No clear dependency relationships detected');
    });
  });

  describe('Task Enhancement', () => {
    it('should enhance a task with high-confidence context clues', () => {
      const originalTask: ExtractedTask = {
        title: 'Review design',
        priority: 'medium',
        tags: ['design'],
        confidence: 0.8
      };

      const contextClues: ContextClues = {
        urgency: {
          level: 'urgent',
          confidence: 0.9,
          indicators: ['urgent', 'critical'],
          reasoning: 'High urgency detected'
        },
        assignees: {
          suggestions: [{ type: 'name', value: 'john-id', confidence: 0.95, context: 'Named assignment' }],
          confidence: 0.95,
          reasoning: 'Clear assignee found'
        },
        deadlines: {
          extractedDate: new Date('2024-01-20T17:00:00Z'),
          confidence: 0.8,
          type: 'explicit',
          originalText: '1/20/2024',
          reasoning: 'Explicit date found'
        },
        projects: {
          suggestions: [{ type: 'name', value: 'project-123', confidence: 0.9, context: 'Project match' }],
          confidence: 0.9,
          reasoning: 'Project identified'
        },
        dependencies: {
          suggestions: [{ type: 'prerequisite', description: 'Depends on other task', confidence: 0.7 }],
          confidence: 0.7,
          reasoning: 'Dependencies found'
        }
      };

      const enhanced = analyzer.enhanceTaskWithContext(originalTask, contextClues);

      expect(enhanced.priority).toBe('urgent');
      expect(enhanced.assigneeId).toBe('john-id');
      expect(enhanced.dueDate).toEqual(new Date('2024-01-20T17:00:00Z'));
      expect(enhanced.projectId).toBe('project-123');
      expect(enhanced.tags).toEqual(expect.arrayContaining(['design', 'urgent', 'deadline', 'dependency']));
      expect(enhanced.confidence).toBeGreaterThan(originalTask.confidence);
    });

    it('should not enhance task with low-confidence context clues', () => {
      const originalTask: ExtractedTask = {
        title: 'Review design',
        priority: 'medium',
        tags: ['design'],
        confidence: 0.8
      };

      const contextClues: ContextClues = {
        urgency: {
          level: 'high',
          confidence: 0.4, // Low confidence
          indicators: [],
          reasoning: 'Weak indicators'
        },
        assignees: {
          suggestions: [],
          confidence: 0.2,
          reasoning: 'No clear assignee'
        },
        deadlines: {
          confidence: 0.3,
          type: 'implied',
          originalText: '',
          reasoning: 'No clear deadline'
        },
        projects: {
          suggestions: [],
          confidence: 0.3,
          reasoning: 'No clear project'
        },
        dependencies: {
          suggestions: [],
          confidence: 0.2,
          reasoning: 'No dependencies'
        }
      };

      const enhanced = analyzer.enhanceTaskWithContext(originalTask, contextClues);

      // Should remain mostly unchanged due to low confidence
      expect(enhanced.priority).toBe('medium');
      expect(enhanced.assigneeId).toBeUndefined();
      expect(enhanced.dueDate).toBeUndefined();
      expect(enhanced.projectId).toBeUndefined();
      expect(enhanced.tags).toEqual(['design']); // Only original tags
    });
  });

  describe('Integration Tests', () => {
    it('should analyze complex message with multiple context clues', () => {
      const message = `@john urgent: The Nike project website mockups need to be ready by tomorrow. 
                      This is blocking the client review meeting on Friday. Make sure to use the 
                      latest brand guidelines and coordinate with the dev team.`;

      const context = {
        teamMembers: [
          { id: 'john-id', name: 'John Smith', role: 'designer', skills: ['figma', 'photoshop'] }
        ],
        projects: [
          { id: 'nike-id', name: 'Nike project', client: 'Nike Inc', keywords: ['brand', 'athletics'] }
        ],
        existingTasks: [
          { title: 'Client review meeting', id: 'task-1' }
        ]
      };

      const result = analyzer.analyzeContext(message, context);

      // Should detect multiple aspects
      expect(result.urgency.level).toBe('urgent');
      expect(result.assignees.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: 'john-id' })
        ])
      );
      expect(result.deadlines.extractedDate).toBeDefined();
      expect(result.projects.suggestions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: 'nike-id' })
        ])
      );
      expect(result.dependencies.suggestions.length).toBeGreaterThan(0);
    });
  });
}); 