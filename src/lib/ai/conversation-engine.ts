import { ConversationContext, ConversationMessage, AIModelConfig } from './types';

export class ConversationEngine {
  private config: AIModelConfig;
  private mockMode: boolean;

  constructor(config: AIModelConfig, mockMode: boolean = true) {
    this.config = config;
    this.mockMode = mockMode;
  }

  async generateResponse(
    context: ConversationContext,
    userMessage: string
  ): Promise<string> {
    if (this.mockMode) {
      return this.generateMockResponse(userMessage, context);
    }
    
    // Real AI integration would go here
    throw new Error('Real AI integration not implemented yet');
  }

  private generateMockResponse(
    userMessage: string,
    context: ConversationContext
  ): string {
    const message = userMessage.toLowerCase();
    
    // Task creation responses
    if (this.isTaskCreationRequest(message)) {
      return this.generateTaskCreationResponse(userMessage);
    }
    
    // Priority briefing requests
    if (this.isPriorityBriefingRequest(message)) {
      return this.generatePriorityBriefingResponse();
    }
    
    // Status update requests
    if (this.isStatusUpdateRequest(message)) {
      return this.generateStatusUpdateResponse(message);
    }
    
    // Project setup requests
    if (this.isProjectSetupRequest(message)) {
      return this.generateProjectSetupResponse(message);
    }
    
    // General conversation
    return this.generateGeneralResponse(userMessage);
  }

  private isTaskCreationRequest(message: string): boolean {
    const taskKeywords = [
      'task', 'todo', 'need to', 'should', 'must', 'create',
      'add', 'remind', 'schedule', 'assign', 'deadline'
    ];
    return taskKeywords.some(keyword => message.includes(keyword));
  }

  private isPriorityBriefingRequest(message: string): boolean {
    const briefingKeywords = [
      'priority', 'priorities', 'briefing', 'important', 'urgent',
      'today', 'focus', 'daily', 'morning'
    ];
    return briefingKeywords.some(keyword => message.includes(keyword));
  }

  private isStatusUpdateRequest(message: string): boolean {
    const statusKeywords = [
      'status', 'update', 'progress', 'report', 'client',
      'project update', 'how is', 'where are we'
    ];
    return statusKeywords.some(keyword => message.includes(keyword));
  }

  private isProjectSetupRequest(message: string): boolean {
    const setupKeywords = [
      'new project', 'setup', 'create project', 'start project',
      'project planning', 'initiate', 'begin project'
    ];
    return setupKeywords.some(keyword => message.includes(keyword));
  }

  private generateTaskCreationResponse(userMessage: string): string {
    const responses = [
      `I've identified several actionable tasks from your message. Let me break these down:

**Extracted Tasks:**
• **Design homepage mockups** - High priority, estimated 4 hours
• **Review client feedback** - Medium priority, due tomorrow
• **Schedule team meeting** - Low priority, this week

Would you like me to create these tasks and assign them to team members? I can also set up dependencies and deadlines based on your project timeline.`,

      `Great! I can help you turn that into actionable tasks. Based on what you've said, here's what I'm seeing:

**Main Task:** Complete Nike brand identity project
**Sub-tasks I can create:**
1. Finalize logo concepts (2 hours, due Friday)
2. Prepare presentation deck (3 hours, needs logo completion)
3. Schedule client review meeting (30 mins, this week)

Should I go ahead and create these with automatic assignments based on your team's availability?`,

      `I understand you need to organize these action items. Here's how I can help:

**Identified Tasks:**
• **Update website content** - Assigned to content team, due next week
• **Test mobile responsiveness** - QA priority, 2-day estimate  
• **Client call preparation** - Your task, tomorrow morning

I can create these with smart notifications and connect them to your existing project workflows. Ready to proceed?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generatePriorityBriefingResponse(): string {
    const briefings = [
      `**Good morning! Here's your priority briefing for today:**

🔥 **Top 3 Priorities:**
1. **Nike Logo Review** - Client presentation at 2 PM (High impact, deadline today)
2. **Website Launch Prep** - Final testing needed before tomorrow's go-live
3. **Team Performance Reviews** - HR deadline is Friday, 3 reviews pending

⚠️ **Risk Alerts:**
• Acme Corp project is 15% behind schedule - consider resource reallocation
• Designer Sarah has conflicting deadlines on Thursday

✅ **Quick Wins Available:**
• 2 small tasks can be completed in under 30 minutes each
• Invoice approvals are waiting (5 minutes total)

**Recommendation:** Block 2-4 PM for Nike presentation prep, delegate quick wins to available team members.`,

      `**Daily Focus Briefing - Looking good today!**

🎯 **Your Mission-Critical Items:**
1. **Startup X Pitch Deck** - Final review needed, presenting tomorrow
2. **Q4 Budget Planning** - Finance team waiting on your input
3. **New Client Onboarding** - Welcome call scheduled for 3 PM

📊 **Project Health Check:**
• 7 projects on track, 2 need attention
• Team utilization at optimal 85%
• No overdue critical tasks

🚀 **Opportunities:**
• Early delivery possible on Brand Y project
• New lead from yesterday's networking event needs follow-up

**Today's Focus:** Prioritize the pitch deck review this morning when you're freshest.`
    ];
    
    return briefings[Math.floor(Math.random() * briefings.length)];
  }

  private generateStatusUpdateResponse(message: string): string {
    const updates = [
      `**Nike Rebranding Project Status Update**

📈 **Overall Progress: 75% Complete**

**What's Done:**
✅ Brand strategy and positioning (100%)
✅ Logo design concepts (100%)  
✅ Color palette and typography (100%)
✅ Brand guidelines document (80%)

**Current Sprint:**
🔄 Business card and letterhead designs (60% complete)
🔄 Website mockup integration (40% complete)
⏳ Social media template creation (starting Monday)

**Timeline:** On track for delivery by Friday, Dec 15th

**Next Steps:**
1. Client review session tomorrow at 2 PM
2. Incorporate feedback by Wednesday
3. Final presentation Friday morning

**Risks/Notes:** None currently - client has been very responsive and collaborative.

Ready to share this with the client, or would you like me to adjust the detail level?`,

      `**TechStart Web Development - Week 3 Update**

🎯 **Progress Summary:** Ahead of schedule by 2 days

**Completed This Week:**
• User authentication system (100%)
• Database schema and migrations (100%)
• Homepage and landing pages (95%)
• Admin dashboard framework (80%)

**In Progress:**
• Payment integration (Stripe) - 60% complete
• Email notification system - 40% complete
• Mobile responsive adjustments - 30% complete

**Coming Up:**
• User testing phase begins Monday
• Performance optimization sprint
• Final security audit

**Budget Status:** $12,000 of $18,000 used (67% - well within projections)

**Team Mood:** 😊 High energy, great collaboration

This update is ready to send to the client. Would you like me to format it for email or Slack?`
    ];
    
    return updates[Math.floor(Math.random() * updates.length)];
  }

  private generateProjectSetupResponse(message: string): string {
    const setups = [
      `**Great! Let's set up your new project. I'll guide you through this step by step.**

Based on your description, this sounds like a **brand identity project**. Here's what I'm thinking:

**Project Structure I'm Proposing:**
📋 **Phase 1: Discovery & Strategy** (Week 1-2)
- Client interviews and brand audit
- Competitive analysis
- Brand positioning workshop

🎨 **Phase 2: Visual Identity** (Week 3-5)  
- Logo concepts and refinement
- Color palette and typography
- Brand guidelines creation

📦 **Phase 3: Application & Delivery** (Week 6-7)
- Business materials design
- Digital asset creation
- Final presentation and handoff

**Team Assignment:**
• **Brand Strategist:** Sarah (Lead) - 60% allocation
• **Designer:** Mike - 80% allocation  
• **Project Manager:** You - 20% allocation

**Timeline:** 7 weeks total, launching next Monday

Does this structure work for you? I can adjust phases, timeline, or team assignments based on your needs.`,

      `**Perfect timing for a new project setup! Let me walk you through this.**

I'm detecting this is a **website redesign project**. Here's my recommended approach:

**Project Phases:**
🔍 **Phase 1: Audit & Planning** (2 weeks)
- Current site analysis
- User research and personas
- Technical requirements gathering

🖌️ **Phase 2: Design & Prototyping** (3 weeks)
- Wireframes and user flows
- Visual design system
- Interactive prototypes

⚙️ **Phase 3: Development & Launch** (4 weeks)
- Frontend/backend development
- Content migration and optimization
- Testing and go-live

**Budget Estimate:** $25,000-35,000 (based on similar projects)
**Team Required:** Designer, Developer, Content Strategist, QA

**Key Milestones:**
- Week 2: Strategy presentation
- Week 5: Design approval  
- Week 9: Soft launch

Ready to move forward with this structure, or would you like to modify anything?`
    ];
    
    return setups[Math.floor(Math.random() * setups.length)];
  }

  private generateGeneralResponse(userMessage: string): string {
    const responses = [
      "I'm here to help you manage your projects and tasks! I can assist with creating tasks from your messages, generating priority briefings, providing status updates, or setting up new projects. What would you like to work on?",
      
      "Thanks for that context! I can help you turn conversations and ideas into actionable tasks, analyze your daily priorities, create client status reports, or guide you through project setup. How can I assist you today?",
      
      "I understand you're working on several initiatives. I specialize in helping creative agencies manage their workflow through natural conversation. Whether you need task management, priority analysis, status reporting, or project planning - I'm ready to help!",
      
      "Great question! As your AI project assistant, I can help streamline your agency operations. I can parse emails and messages into tasks, provide morning priority briefings, generate client status updates, and walk you through setting up new projects conversationally. What's most pressing right now?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async addMessage(
    context: ConversationContext,
    message: ConversationMessage
  ): Promise<ConversationContext> {
    return {
      ...context,
      messages: [...context.messages, message]
    };
  }

  async getConversationHistory(
    conversationId: string
  ): Promise<ConversationMessage[]> {
    // In real implementation, this would fetch from database
    // For mock, return empty array or sample messages
    return [];
  }
} 