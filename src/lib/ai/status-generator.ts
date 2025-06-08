import { StatusUpdate, ProjectProgress, Milestone, RiskFactor } from './types';

export class StatusGenerator {
  private mockMode: boolean;

  constructor(mockMode: boolean = true) {
    this.mockMode = mockMode;
  }

  async generateProjectStatus(
    projectId: string,
    context?: {
      tasks?: any[];
      milestones?: any[];
      budget?: any;
      team?: any[];
      clientPreferences?: any;
    }
  ): Promise<StatusUpdate> {
    if (this.mockMode) {
      return this.generateMockProjectStatus(projectId, context);
    }
    
    // Real AI status generation would go here
    throw new Error('Real status generation not implemented yet');
  }

  async generateExecutiveSummary(
    projectIds: string[],
    timeframe: 'weekly' | 'monthly' | 'quarterly'
  ): Promise<{
    overallHealth: number;
    keyMetrics: Record<string, number>;
    majorMilestones: Milestone[];
    criticalIssues: RiskFactor[];
    executiveSummary: string;
  }> {
    if (this.mockMode) {
      return this.generateMockExecutiveSummary(projectIds, timeframe);
    }
    
    throw new Error('Real executive summary generation not implemented yet');
  }

  private generateMockProjectStatus(
    projectId: string,
    context?: any
  ): StatusUpdate {
    const projectTemplates = [
      {
        projectName: 'Nike Brand Identity Refresh',
        summary: 'Brand identity project progressing well with strong client collaboration. Design concepts have been approved and we\'re moving into application phase.',
        progress: {
          completionPercentage: 75,
          tasksCompleted: 18,
          totalTasks: 24,
          timeline: {
            original: new Date('2024-02-15'),
            current: new Date('2024-02-15'),
            variance: 0
          },
          budget: {
            allocated: 45000,
            spent: 33750,
            remaining: 11250
          }
        },
        milestones: [
          {
            id: 'milestone-1',
            name: 'Brand Strategy & Positioning',
            dueDate: new Date('2024-01-15'),
            status: 'completed' as const,
            progress: 100,
            dependencies: []
          },
          {
            id: 'milestone-2',
            name: 'Logo & Visual Identity',
            dueDate: new Date('2024-02-01'),
            status: 'completed' as const,
            progress: 100,
            dependencies: ['milestone-1']
          },
          {
            id: 'milestone-3',
            name: 'Brand Guidelines',
            dueDate: new Date('2024-02-10'),
            status: 'in-progress' as const,
            progress: 85,
            dependencies: ['milestone-2']
          },
          {
            id: 'milestone-4',
            name: 'Application Design',
            dueDate: new Date('2024-02-20'),
            status: 'upcoming' as const,
            progress: 30,
            dependencies: ['milestone-3']
          }
        ],
        risks: [],
        nextSteps: [
          'Complete brand guidelines documentation by Feb 12th',
          'Begin business card and letterhead design',
          'Schedule client review for application designs',
          'Prepare final presentation materials'
        ],
        clientMessage: `The Nike brand identity refresh is progressing excellently. We've successfully completed the strategic foundation and core visual identity work, with your team providing valuable feedback throughout. The logo concepts have been finalized and approved, and we're now 75% complete overall.

Currently, we're putting the finishing touches on your comprehensive brand guidelines and beginning the application phase for business materials. Everything remains on schedule for delivery by February 20th.

**Key Achievements This Week:**
• Brand guidelines 85% complete with detailed usage specifications
• Logo variations and lockups finalized for all use cases  
• Color palette and typography system documented
• Initial business card concepts in development

**What's Next:**
We'll be sharing the near-final brand guidelines for your review by February 12th, followed by the complete suite of business applications. No action required from your team at this time - we'll reach out when ready for your input.

The project continues to track perfectly with our original timeline and budget. Your team's prompt feedback and clear vision have been instrumental in keeping us on schedule.`
      },
      {
        projectName: 'TechStart Platform Development',
        summary: 'Web platform development ahead of schedule with successful completion of core features. User testing phase beginning ahead of original timeline.',
        progress: {
          completionPercentage: 80,
          tasksCompleted: 32,
          totalTasks: 40,
          timeline: {
            original: new Date('2024-03-01'),
            current: new Date('2024-02-25'),
            variance: -4 // 4 days ahead
          },
          budget: {
            allocated: 65000,
            spent: 45500,
            remaining: 19500
          }
        },
        milestones: [
          {
            id: 'milestone-1',
            name: 'Backend Architecture',
            dueDate: new Date('2024-01-10'),
            status: 'completed' as const,
            progress: 100,
            dependencies: []
          },
          {
            id: 'milestone-2',
            name: 'User Authentication System',
            dueDate: new Date('2024-01-20'),
            status: 'completed' as const,
            progress: 100,
            dependencies: ['milestone-1']
          },
          {
            id: 'milestone-3',
            name: 'Core Platform Features',
            dueDate: new Date('2024-02-05'),
            status: 'completed' as const,
            progress: 100,
            dependencies: ['milestone-2']
          },
          {
            id: 'milestone-4',
            name: 'User Interface Polish',
            dueDate: new Date('2024-02-15'),
            status: 'in-progress' as const,
            progress: 90,
            dependencies: ['milestone-3']
          },
          {
            id: 'milestone-5',
            name: 'Testing & Launch Prep',
            dueDate: new Date('2024-02-25'),
            status: 'upcoming' as const,
            progress: 45,
            dependencies: ['milestone-4']
          }
        ],
        risks: [
          {
            type: 'dependency' as const,
            severity: 'low' as const,
            description: 'Third-party API integration testing delayed by vendor',
            affectedTasks: ['payment-integration', 'analytics-setup'],
            recommendation: 'Proceeding with backup integration plan, minimal impact expected'
          }
        ],
        nextSteps: [
          'Complete final UI polish and responsive testing',
          'Begin comprehensive user acceptance testing',
          'Set up production deployment pipeline',
          'Prepare launch documentation and training materials'
        ],
        clientMessage: `Excellent news on the TechStart platform development - we're running 4 days ahead of schedule and tracking well within budget!

**Project Status: 80% Complete**

The core platform functionality is now fully implemented and working beautifully. This week we completed the user dashboard, notification system, and admin controls. Everything is performing better than expected in our testing environment.

**This Week's Achievements:**
• User interface polish 90% complete with responsive design fully tested
• Payment integration successfully implemented and tested
• Performance optimization completed - page load times reduced by 40%
• Security audit passed with no critical issues

**Ahead of Schedule:**
We're pleased to report the project is running 4 days ahead of your original timeline. This puts us on track for a February 25th completion instead of March 1st.

**Next Phase:**
Starting Monday, we'll begin the user acceptance testing phase with your team. We'll provide detailed testing scenarios and gather your feedback on the complete platform experience.

**Budget Status:** We're at 70% of allocated budget with 80% completion - excellent efficiency that leaves room for any final enhancements you might request.

No immediate action needed from your team. We'll send testing access and guidelines by Friday.`
      }
    ];

    const template = projectTemplates[Math.floor(Math.random() * projectTemplates.length)];
    
    return {
      projectId,
      projectName: template.projectName,
      summary: template.summary,
      progress: template.progress,
      milestones: template.milestones,
      risks: template.risks,
      nextSteps: template.nextSteps,
      clientMessage: template.clientMessage,
      lastUpdated: new Date()
    };
  }

  private generateMockExecutiveSummary(
    projectIds: string[],
    timeframe: 'weekly' | 'monthly' | 'quarterly'
  ): {
    overallHealth: number;
    keyMetrics: Record<string, number>;
    majorMilestones: Milestone[];
    criticalIssues: RiskFactor[];
    executiveSummary: string;
  } {
    const summaries = {
      weekly: {
        overallHealth: 85,
        keyMetrics: {
          'Projects On Track': 7,
          'Projects At Risk': 2,
          'Average Progress': 73,
          'Budget Utilization': 68,
          'Client Satisfaction': 92
        },
        majorMilestones: [
          {
            id: 'week-milestone-1',
            name: 'Nike Brand Guidelines Completion',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: 'in-progress' as const,
            progress: 85,
            dependencies: []
          },
          {
            id: 'week-milestone-2',
            name: 'TechStart Platform Beta Launch',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'upcoming' as const,
            progress: 45,
            dependencies: []
          }
        ],
        criticalIssues: [
          {
            type: 'resource' as const,
            severity: 'medium' as const,
            description: 'Design team at capacity - may impact new project timelines',
            affectedTasks: ['new-client-onboarding'],
            recommendation: 'Consider bringing in freelance designer or adjusting project schedules'
          }
        ],
        executiveSummary: `**Weekly Portfolio Summary**

Strong week overall with 7 of 9 active projects tracking on or ahead of schedule. Team productivity remains high with client satisfaction at 92%.

**Key Highlights:**
• Nike rebrand entering final phase, client extremely pleased with progress
• TechStart platform development ahead of schedule by 4 days
• Successfully onboarded 2 new team members, reducing resource constraints
• Client retention rate at 100% for Q1

**Areas of Focus:**
• Design team approaching capacity limits - resource planning needed for Q2 pipeline
• Two smaller projects experiencing minor delays, mitigation plans in place
• Opportunity to accelerate delivery on 3 projects currently ahead of schedule

**Financial Health:** Portfolio tracking at 102% of revenue targets for the quarter, with strong pipeline for Q2 already developing.`
             },
       monthly: {
         overallHealth: 88,
         keyMetrics: {
           'Monthly Revenue': 285000,
           'Projects Delivered': 4,
           'New Projects Started': 6,
           'Team Utilization': 89,
           'Profit Margin': 31
         },
         majorMilestones: [
           {
             id: 'month-milestone-1',
             name: 'Q1 Client Reviews Complete',
             dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
             status: 'in-progress' as const,
             progress: 60,
             dependencies: []
           }
         ],
         criticalIssues: [],
         executiveSummary: `**Monthly Performance Review**

Outstanding month with record revenue of $285K and successful delivery of 4 major projects. Client satisfaction scores reached 94%, our highest on record.

**Major Achievements:**
• Exceeded monthly revenue target by 15%
• Delivered Nike rebrand project to exceptional client praise
• Successfully launched TechStart platform with zero critical issues
• Expanded team by 3 members to support growing pipeline

**Pipeline & Growth:**
• Q2 pipeline now valued at $450K with high confidence closure rates
• 3 enterprise prospects in final negotiation stages
• Team capacity optimized to handle 40% growth trajectory

**Operational Excellence:** All delivered projects came in on time and within budget, reinforcing our reputation for reliable execution.`
       },
       quarterly: {
         overallHealth: 92,
         keyMetrics: {
           'Quarterly Revenue': 850000,
           'Projects Delivered': 12,
           'Client Retention': 96,
           'Team Growth': 25,
           'Profit Margin': 34
         },
         majorMilestones: [
           {
             id: 'quarter-milestone-1',
             name: 'Q2 Strategic Planning Complete',
             dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
             status: 'upcoming' as const,
             progress: 20,
             dependencies: []
           }
         ],
         criticalIssues: [],
         executiveSummary: `**Quarterly Business Review**

Exceptional quarter with 850K revenue (112% of target) and successful delivery of 12 major projects. Client retention at 96% demonstrates strong satisfaction and partnership value.

**Strategic Achievements:**
• Exceeded quarterly revenue target by 12%
• Expanded team by 25% while maintaining high performance standards
• Achieved 96% client retention rate - industry leading performance
• Successfully launched 3 new service offerings

**Growth & Operations:**
• Q2 pipeline valued at $1.2M with strong enterprise prospects
• Team productivity increased 18% through process improvements
• Profit margins improved to 34% through operational excellence
• Zero critical project failures or client escalations

**Looking Forward:** Positioned for continued growth with expanded capabilities, strong client relationships, and robust pipeline entering Q2.`
       }
     };

    return summaries[timeframe] || summaries.weekly;
  }
} 