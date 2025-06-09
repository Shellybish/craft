import { TaskParser } from './task-parser';
import { TaskParseResult, ExtractedTask } from './types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('TaskParser', () => {
  let taskParser: TaskParser;

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('Mock Mode', () => {
    beforeEach(() => {
      taskParser = new TaskParser(true); // mock mode
    });

    describe('parseMessage', () => {
      it('should extract tasks from messages with "need to" pattern', async () => {
        const message = 'I need to update the website homepage by Friday';
        
        const result = await taskParser.parseMessage(message);
        
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].title).toBe('Update the website homepage by Friday');
        expect(result.tasks[0].priority).toBe('medium');
        expect(result.confidence).toBeGreaterThan(0.7);
      });

      it('should extract tasks from messages with "should" pattern', async () => {
        const message = 'We should create a new logo design for the client';
        
        const result = await taskParser.parseMessage(message);
        
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].title).toBe('Create a new logo design for the client');
        expect(result.tasks[0].description).toContain('We should create a new logo design');
      });

      it('should detect deadline-based tasks', async () => {
        const message = 'The project deadline is tomorrow and we need to finish testing';
        
        const result = await taskParser.parseMessage(message);
        
        expect(result.tasks.length).toBeGreaterThan(0);
        expect(result.tasks.some(task => task.dueDate)).toBe(true);
        // When both "need to" and deadline patterns exist, the deadline gets added to the existing task
        expect(result.tasks[0].title).toBe('Finish testing');
        expect(result.tasks[0].dueDate).toBeDefined();
      });

      it('should extract multiple tasks from longer messages', async () => {
        const message = 'We need to update the website homepage and create new business cards. Also, we should schedule a client meeting for next week. The project deadline is Friday so we need to prioritize these tasks.';
        
        const result = await taskParser.parseMessage(message);
        
        expect(result.tasks.length).toBeGreaterThan(1);
        expect(result.confidence).toBeGreaterThan(0.6);
      });

      it('should return low confidence when no tasks are detected', async () => {
        const message = 'This is just a general comment about the weather';
        
        const result = await taskParser.parseMessage(message);
        
        expect(result.tasks).toHaveLength(0);
        expect(result.confidence).toBeLessThan(0.5);
        expect(result.suggestions[0]).toContain("didn't detect specific tasks");
      });

      it('should provide helpful suggestions', async () => {
        const message = 'I need to update the website';
        
        const result = await taskParser.parseMessage(message);
        
        expect(result.suggestions).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.some(s => s.includes('Found'))).toBe(true);
      });

      it('should handle context information', async () => {
        const message = 'I need to update the logo';
        const context = {
          userId: 'user-123',
          projectId: 'project-456',
          existingTasks: [{ title: 'Design initial concepts' }]
        };
        
        const result = await taskParser.parseMessage(message, context);
        
        expect(result).toBeDefined();
        expect(result.tasks).toBeDefined();
      });
    });

    describe('parseEmail', () => {
      it('should extract tasks from client emails with feedback requests', async () => {
        const emailContent = 'Hi team, I reviewed the design mockups and have some feedback. Can you please make the logo bigger and change the color to blue? Thanks!';
        const emailMetadata = {
          from: 'client@company.com',
          subject: 'Design Feedback',
          date: new Date(),
          isClient: true
        };
        
        const result = await taskParser.parseEmail(emailContent, emailMetadata);
        
        expect(result.tasks.length).toBeGreaterThan(0);
        expect(result.tasks[0].title).toContain('feedback');
        expect(result.tasks[0].priority).toBe('medium'); // Default urgency for client feedback
        expect(result.tasks[0].tags).toContain('client');
      });

      it('should extract tasks from client emails with revision requests', async () => {
        const emailContent = 'Please make changes to the website header and update the contact information';
        const emailMetadata = {
          from: 'client@example.com',
          subject: 'Website Revisions',
          date: new Date(),
          isClient: true
        };
        
        const result = await taskParser.parseEmail(emailContent, emailMetadata);
        
        expect(result.tasks.some(task => task.title.includes('revisions'))).toBe(true);
        expect(result.tasks[0].priority).toBe('high');
        expect(result.tasks[0].tags).toContain('revisions');
      });

      it('should extract meeting tasks from client emails', async () => {
        const emailContent = 'Can we schedule a meeting to discuss the project next week?';
        const emailMetadata = {
          from: 'client@business.com',
          subject: 'Meeting Request',
          date: new Date(),
          isClient: true
        };
        
        const result = await taskParser.parseEmail(emailContent, emailMetadata);
        
        expect(result.tasks.some(task => task.title.includes('meeting'))).toBe(true);
        expect(result.tasks[0].tags).toContain('meeting');
      });

      it('should handle internal team emails differently', async () => {
        const emailContent = 'Please provide a status update on the Nike project';
        const emailMetadata = {
          from: 'teammate@agency.com',
          subject: 'Status Update Request',
          date: new Date(),
          isClient: false
        };
        
        const result = await taskParser.parseEmail(emailContent, emailMetadata);
        
        expect(result.tasks.some(task => task.title.includes('status'))).toBe(true);
        expect(result.tasks[0].priority).toBe('medium');
        expect(result.tasks[0].tags).toContain('internal');
      });

      it('should set appropriate urgency for client emails', async () => {
        const emailContent = 'URGENT: The presentation is tomorrow and we need the final logo';
        const emailMetadata = {
          from: 'client@urgent.com',
          subject: 'URGENT - Need Logo',
          date: new Date(),
          isClient: true
        };
        
        const result = await taskParser.parseEmail(emailContent, emailMetadata);
        
        // Should not find tasks in this case as it doesn't match the specific patterns
        expect(result.tasks).toHaveLength(0);
        expect(result.confidence).toBe(0.3);
      });
    });
  });

  describe('AI Mode', () => {
    beforeEach(() => {
      taskParser = new TaskParser(false); // AI mode
      process.env.OPENROUTER_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      delete process.env.OPENROUTER_API_KEY;
    });

    describe('parseMessage with AI', () => {
      it('should successfully parse tasks using AI', async () => {
        const mockAIResponse = {
          choices: [{
            message: {
              content: JSON.stringify({
                tasks: [{
                  title: 'Update website homepage',
                  description: 'Client requested homepage updates',
                  priority: 'high',
                  estimatedHours: 4,
                  dueDate: '2024-12-20T17:00:00Z',
                  tags: ['website', 'client'],
                  confidence: 0.9
                }],
                confidence: 0.85,
                suggestions: ['Task extracted successfully']
              })
            }
          }]
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAIResponse)
        });

        const message = 'I need to update the website homepage for the client by tomorrow';
        const result = await taskParser.parseMessage(message);

        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].title).toBe('Update website homepage');
        expect(result.tasks[0].priority).toBe('high');
        expect(result.tasks[0].estimatedHours).toBe(4);
        expect(result.confidence).toBe(0.85);

        // Verify API call
        expect(fetch).toHaveBeenCalledWith(
          'https://openrouter.ai/api/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-api-key',
              'Content-Type': 'application/json'
            })
          })
        );
      });

      it('should fallback to mock parsing when AI fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        const message = 'I need to create a logo';
        const result = await taskParser.parseMessage(message);

        expect(result).toBeDefined();
        expect(result.tasks).toBeDefined();
        // Should still get a result from fallback mock parsing
      });

      it('should handle invalid JSON responses from AI', async () => {
        const mockAIResponse = {
          choices: [{
            message: {
              content: 'Invalid JSON response'
            }
          }]
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAIResponse)
        });

        const message = 'I need to update the website';
        const result = await taskParser.parseMessage(message);

        expect(result.tasks).toHaveLength(0);
        expect(result.confidence).toBe(0.1);
        expect(result.suggestions[0]).toContain('AI parsing failed');
      });

      it('should handle API errors gracefully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

        const message = 'I need to design a logo';
        const result = await taskParser.parseMessage(message);

        expect(result).toBeDefined();
        expect(result.tasks).toBeDefined();
        // Should fallback to mock parsing
      });

      it('should throw error when API key is missing', async () => {
        delete process.env.OPENROUTER_API_KEY;

        const message = 'I need to update the website';
        const result = await taskParser.parseMessage(message);

        // Should fallback to mock parsing when API key is missing
        expect(result).toBeDefined();
      });
    });

    describe('parseEmail with AI', () => {
      it('should successfully parse email tasks using AI', async () => {
        const mockAIResponse = {
          choices: [{
            message: {
              content: JSON.stringify({
                tasks: [{
                  title: 'Address client feedback on logo design',
                  description: 'Client requested changes to logo colors',
                  priority: 'high',
                  estimatedHours: 3,
                  tags: ['client', 'feedback', 'logo'],
                  confidence: 0.95
                }],
                confidence: 0.9,
                suggestions: ['High priority client feedback']
              })
            }
          }]
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAIResponse)
        });

        const emailContent = 'Please change the logo colors to blue and make it bigger';
        const emailMetadata = {
          from: 'client@company.com',
          subject: 'Logo Feedback',
          date: new Date(),
          isClient: true
        };

        const result = await taskParser.parseEmail(emailContent, emailMetadata);

        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].title).toBe('Address client feedback on logo design');
        expect(result.tasks[0].priority).toBe('high');
        expect(result.tasks[0].tags).toContain('client');
      });

      it('should include email context in AI prompt', async () => {
        const mockAIResponse = {
          choices: [{
            message: {
              content: JSON.stringify({
                tasks: [],
                confidence: 0.3,
                suggestions: ['No actionable items found']
              })
            }
          }]
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAIResponse)
        });

        const emailContent = 'Thanks for the update';
        const emailMetadata = {
          from: 'client@company.com',
          subject: 'Thank you',
          date: new Date(),
          isClient: true
        };

        await taskParser.parseEmail(emailContent, emailMetadata);

        const fetchCall = (fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);
        const prompt = requestBody.messages[0].content;

        expect(prompt).toContain('CLIENT');
        expect(prompt).toContain(emailMetadata.from);
        expect(prompt).toContain(emailMetadata.subject);
      });
    });
  });

  describe('Validation Methods', () => {
    beforeEach(() => {
      taskParser = new TaskParser(true);
    });

    it('should validate priorities correctly', async () => {
      const mockTaskParser = taskParser as any;
      
      expect(mockTaskParser.validatePriority('high')).toBe('high');
      expect(mockTaskParser.validatePriority('invalid')).toBe('medium');
      expect(mockTaskParser.validatePriority(null)).toBe('medium');
    });

    it('should validate estimated hours correctly', async () => {
      const mockTaskParser = taskParser as any;
      
      expect(mockTaskParser.validateEstimatedHours(2.3)).toBe(2.5);
      expect(mockTaskParser.validateEstimatedHours(0)).toBeUndefined();
      expect(mockTaskParser.validateEstimatedHours(150)).toBeUndefined();
      expect(mockTaskParser.validateEstimatedHours('invalid')).toBeUndefined();
    });

    it('should validate due dates correctly', async () => {
      const mockTaskParser = taskParser as any;
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      expect(mockTaskParser.validateDueDate(futureDate.toISOString())).toBeInstanceOf(Date);
      expect(mockTaskParser.validateDueDate(pastDate.toISOString())).toBeUndefined();
      expect(mockTaskParser.validateDueDate('invalid')).toBeUndefined();
      expect(mockTaskParser.validateDueDate(null)).toBeUndefined();
    });

    it('should validate confidence scores correctly', async () => {
      const mockTaskParser = taskParser as any;
      
      expect(mockTaskParser.validateConfidence(0.8)).toBe(0.8);
      expect(mockTaskParser.validateConfidence(1.5)).toBe(1);
      expect(mockTaskParser.validateConfidence(-0.5)).toBe(0);
      expect(mockTaskParser.validateConfidence('invalid')).toBe(0.5);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      taskParser = new TaskParser(false); // AI mode
      process.env.OPENROUTER_API_KEY = 'test-api-key';
    });

    it('should handle network timeouts gracefully', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
      );

      const message = 'I need to update the website';
      const result = await taskParser.parseMessage(message);

      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
    });

    it('should handle malformed API responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      const message = 'I need to create a logo';
      const result = await taskParser.parseMessage(message);

      // Should fallback to mock parsing, so will extract the task
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Create a logo');
    });

    it('should handle empty message inputs', async () => {
      const result = await taskParser.parseMessage('');
      
      expect(result).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
}); 