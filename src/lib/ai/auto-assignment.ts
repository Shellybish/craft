import { UserRole } from '../auth/types';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  currentWorkload: WorkloadData;
  availability: AvailabilityWindow[];
  preferences: AssignmentPreferences;
  performance: PerformanceMetrics;
}

export interface WorkloadData {
  activeTasks: number;
  totalEstimatedHours: number;
  weeklyCapacity: number;
  utilizationPercentage: number;
  overdueTasks: number;
  urgentTasks: number;
  averageTaskCompletion: number; // days
}

export interface AvailabilityWindow {
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
  isFullyAvailable: boolean;
  blockedDates?: Date[];
}

export interface AssignmentPreferences {
  preferredTaskTypes: string[];
  projectTypes: string[];
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
  };
  maxConcurrentTasks: number;
  preferredUrgencyLevels: Array<'low' | 'medium' | 'high' | 'urgent'>;
}

export interface PerformanceMetrics {
  taskCompletionRate: number; // 0-1
  averageTimeToComplete: number; // days
  qualityScore: number; // 0-10
  clientSatisfactionScore: number; // 0-10
  onTimeDeliveryRate: number; // 0-1
  collaborationScore: number; // 0-10
}

export interface TaskRequirements {
  title: string;
  description?: string;
  skillsRequired: string[];
  roleRequired?: UserRole;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  deadline?: Date;
  projectId?: string;
  complexity: 'simple' | 'medium' | 'complex';
  requiresCollaboration: boolean;
  clientFacing: boolean;
}

export interface AssignmentRecommendation {
  memberId: string;
  memberName: string;
  confidence: number; // 0-1
  reasoning: string[];
  riskFactors: string[];
  alternativeOptions: Array<{
    memberId: string;
    memberName: string;
    confidence: number;
    reason: string;
  }>;
  workloadImpact: {
    newUtilization: number;
    taskLoadIncrease: number;
    estimatedDeliveryDate: Date;
  };
}

export class AutoAssignmentEngine {
  private mockMode: boolean;

  constructor(mockMode: boolean = true) {
    this.mockMode = mockMode;
  }

  /**
   * Main method to get assignment recommendations for a task
   */
  async getAssignmentRecommendations(
    task: TaskRequirements,
    teamMembers: TeamMember[],
    context?: {
      projectId?: string;
      requesterId?: string;
      urgencyOverride?: boolean;
    }
  ): Promise<AssignmentRecommendation[]> {
    if (this.mockMode) {
      return this.generateMockRecommendations(task, teamMembers);
    }

    // Filter eligible team members based on role and availability
    const eligibleMembers = this.filterEligibleMembers(task, teamMembers);
    
    if (eligibleMembers.length === 0) {
      throw new Error('No eligible team members found for this task');
    }

    // Score each eligible member
    const scoredMembers = eligibleMembers.map(member => ({
      member,
      score: this.calculateAssignmentScore(task, member, teamMembers),
    }));

    // Sort by score and create recommendations
    const sortedMembers = scoredMembers
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, 3); // Top 3 recommendations

    return sortedMembers.map((scored, index) => 
      this.createRecommendation(task, scored.member, scored.score, sortedMembers, index === 0)
    );
  }

  /**
   * Filter team members who are eligible for the task
   */
  private filterEligibleMembers(task: TaskRequirements, teamMembers: TeamMember[]): TeamMember[] {
    return teamMembers.filter(member => {
      // Role requirement check
      if (task.roleRequired && member.role !== task.roleRequired) {
        return false;
      }

      // Skills requirement check
      const hasRequiredSkills = task.skillsRequired.every(skill => 
        member.skills.some(memberSkill => 
          memberSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(memberSkill.toLowerCase())
        )
      );

      if (task.skillsRequired.length > 0 && !hasRequiredSkills) {
        return false;
      }

      // Availability check
      if (!this.isAvailableForTask(member, task)) {
        return false;
      }

      // Workload capacity check
      if (member.currentWorkload.utilizationPercentage > 95) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if a team member is available for the task
   */
  private isAvailableForTask(member: TeamMember, task: TaskRequirements): boolean {
    const now = new Date();
    const taskDeadline = task.deadline || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

    // Check if member has availability window that covers the task period
    return member.availability.some(window => {
      const windowStart = new Date(window.startDate);
      const windowEnd = new Date(window.endDate);
      
      return windowStart <= now && windowEnd >= taskDeadline && window.isFullyAvailable;
    });
  }

  /**
   * Calculate comprehensive assignment score for a team member
   */
  private calculateAssignmentScore(task: TaskRequirements, member: TeamMember, allMembers: TeamMember[]) {
    const scores = {
      skillMatch: this.calculateSkillMatchScore(task, member),
      workloadBalance: this.calculateWorkloadScore(member),
      roleAlignment: this.calculateRoleAlignmentScore(task, member),
      performance: this.calculatePerformanceScore(member),
      availability: this.calculateAvailabilityScore(task, member),
      preferences: this.calculatePreferenceScore(task, member),
      collaboration: this.calculateCollaborationScore(task, member, allMembers),
      urgencyFit: this.calculateUrgencyFitScore(task, member),
    };

    // Weighted total score
    const weights = {
      skillMatch: 0.25,
      workloadBalance: 0.20,
      roleAlignment: 0.15,
      performance: 0.15,
      availability: 0.10,
      preferences: 0.08,
      collaboration: 0.05,
      urgencyFit: 0.02,
    };

    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + score * weights[key as keyof typeof weights];
    }, 0);

    return { ...scores, totalScore };
  }

  /**
   * Calculate how well the member's skills match the task requirements
   */
  private calculateSkillMatchScore(task: TaskRequirements, member: TeamMember): number {
    if (task.skillsRequired.length === 0) return 0.8; // Neutral score if no specific skills required

    const matchedSkills = task.skillsRequired.filter(required =>
      member.skills.some(memberSkill =>
        memberSkill.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(memberSkill.toLowerCase())
      )
    );

    const baseScore = matchedSkills.length / task.skillsRequired.length;

    // Bonus for having additional relevant skills
    const bonusSkills = member.skills.filter(skill =>
      task.description?.toLowerCase().includes(skill.toLowerCase())
    ).length;

    return Math.min(baseScore + (bonusSkills * 0.1), 1.0);
  }

  /**
   * Calculate workload balance score (lower workload = higher score)
   */
  private calculateWorkloadScore(member: TeamMember): number {
    const utilization = member.currentWorkload.utilizationPercentage / 100;
    
    // Optimal utilization is around 75-85%
    if (utilization <= 0.75) {
      return 1.0 - (0.75 - utilization) * 0.5; // Slight penalty for being underutilized
    } else if (utilization <= 0.85) {
      return 1.0; // Optimal range
    } else {
      return Math.max(0.1, 1.0 - (utilization - 0.85) * 4); // Steeper penalty for overutilization
    }
  }

  /**
   * Calculate role alignment score
   */
  private calculateRoleAlignmentScore(task: TaskRequirements, member: TeamMember): number {
    const roleTaskMapping = {
      [UserRole.PROJECT_MANAGER]: ['planning', 'coordination', 'management', 'communication'],
      [UserRole.TEAM_MEMBER]: ['development', 'design', 'implementation', 'execution'],
      [UserRole.AGENCY_ADMIN]: ['strategy', 'oversight', 'planning'],
      [UserRole.CLIENT]: [], // Clients typically don't get assigned tasks
      [UserRole.SUPER_ADMIN]: ['technical', 'complex', 'urgent'], // Can handle any task
    };

    const roleKeywords = roleTaskMapping[member.role] || [];
    const taskText = `${task.title} ${task.description || ''}`.toLowerCase();
    
    const matches = roleKeywords.filter(keyword => 
      taskText.includes(keyword.toLowerCase())
    ).length;

    const baseScore = roleKeywords.length > 0 ? matches / roleKeywords.length : 0.5;
    
    // Boost score slightly if there are matches to ensure it goes above 0.5
    return matches > 0 ? Math.max(baseScore, 0.6) : baseScore;
  }

  /**
   * Calculate performance score based on historical metrics
   */
  private calculatePerformanceScore(member: TeamMember): number {
    const metrics = member.performance;
    
    // Weighted average of different performance indicators
    return (
      metrics.taskCompletionRate * 0.3 +
      metrics.onTimeDeliveryRate * 0.25 +
      (metrics.qualityScore / 10) * 0.2 +
      (metrics.clientSatisfactionScore / 10) * 0.15 +
      (metrics.collaborationScore / 10) * 0.1
    );
  }

  /**
   * Calculate availability score based on time constraints
   */
  private calculateAvailabilityScore(task: TaskRequirements, member: TeamMember): number {
    const now = new Date();
    const deadline = task.deadline || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find the best availability window for this task
    const relevantWindow = member.availability.find(window => {
      const windowStart = new Date(window.startDate);
      const windowEnd = new Date(window.endDate);
      return windowStart <= now && windowEnd >= deadline;
    });

    if (!relevantWindow) return 0.1;

    // Calculate days between now and deadline
    const daysUntilDeadline = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    
    // Score based on how much time is available vs required
    const availableHours = relevantWindow.hoursPerDay * daysUntilDeadline;
    const requiredHours = task.estimatedHours;
    
    if (availableHours >= requiredHours * 2) return 1.0; // Plenty of time
    if (availableHours >= requiredHours * 1.5) return 0.9; // Good amount of time
    if (availableHours >= requiredHours) return 0.7; // Just enough time
    return 0.3; // Tight schedule
  }

  /**
   * Calculate preference alignment score
   */
  private calculatePreferenceScore(task: TaskRequirements, member: TeamMember): number {
    const prefs = member.preferences;
    let score = 0.5; // Base score

    // Check task type preferences
    const taskTypeMatch = prefs.preferredTaskTypes.some(type =>
      task.title.toLowerCase().includes(type.toLowerCase()) ||
      task.description?.toLowerCase().includes(type.toLowerCase())
    );
    if (taskTypeMatch) score += 0.3;

    // Check urgency preference
    if (prefs.preferredUrgencyLevels.includes(task.priority)) {
      score += 0.2;
    }

    // Check if within max concurrent tasks
    if (member.currentWorkload.activeTasks < prefs.maxConcurrentTasks) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate collaboration score for tasks requiring teamwork
   */
  private calculateCollaborationScore(task: TaskRequirements, member: TeamMember, allMembers: TeamMember[]): number {
    if (!task.requiresCollaboration) return 0.8; // Neutral score for solo tasks

    return member.performance.collaborationScore / 10;
  }

  /**
   * Calculate urgency fit score
   */
  private calculateUrgencyFitScore(task: TaskRequirements, member: TeamMember): number {
    if (task.priority === 'urgent') {
      // For urgent tasks, prefer members with fewer overdue tasks and good performance
      const overdueRatio = member.currentWorkload.overdueTasks / Math.max(member.currentWorkload.activeTasks, 1);
      return Math.max(0.1, 1.0 - overdueRatio) * member.performance.onTimeDeliveryRate;
    }
    
    return 0.8; // Neutral score for non-urgent tasks
  }

  /**
   * Create final recommendation object
   */
  private createRecommendation(
    task: TaskRequirements,
    member: TeamMember,
    scores: any,
    allScored: any[],
    isPrimary: boolean
  ): AssignmentRecommendation {
    const reasoning: string[] = [];
    const riskFactors: string[] = [];

    // Build reasoning based on strongest scoring factors
    if (scores.skillMatch > 0.8) {
      reasoning.push(`Excellent skill match (${Math.round(scores.skillMatch * 100)}% alignment)`);
    }
    if (scores.workloadBalance > 0.8) {
      reasoning.push(`Good workload balance (${Math.round(member.currentWorkload.utilizationPercentage)}% utilization)`);
    }
    if (scores.performance > 0.8) {
      reasoning.push(`Strong performance history (${Math.round(member.performance.taskCompletionRate * 100)}% completion rate)`);
    }
    if (scores.roleAlignment > 0.7) {
      reasoning.push(`Role aligns well with task requirements`);
    }

    // Identify risk factors
    if (member.currentWorkload.utilizationPercentage > 85) {
      riskFactors.push(`High current workload (${Math.round(member.currentWorkload.utilizationPercentage)}% utilized)`);
    }
    if (member.currentWorkload.overdueTasks > 0) {
      riskFactors.push(`Has ${member.currentWorkload.overdueTasks} overdue task(s)`);
    }
    if (scores.availability < 0.5) {
      riskFactors.push('Limited availability for task timeline');
    }

    // Calculate workload impact
    const newUtilization = member.currentWorkload.utilizationPercentage + 
      (task.estimatedHours / member.currentWorkload.weeklyCapacity * 100);
    
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 
      Math.ceil(task.estimatedHours / (member.availability[0]?.hoursPerDay || 8)));

    // Create alternative options (exclude the current member)
    const alternatives = allScored
      .filter(scored => scored.member.id !== member.id)
      .slice(0, 2)
      .map(scored => ({
        memberId: scored.member.id,
        memberName: scored.member.name,
        confidence: scored.score.totalScore,
        reason: scored.score.skillMatch > 0.7 ? 'Good skill match' : 'Available capacity'
      }));

    return {
      memberId: member.id,
      memberName: member.name,
      confidence: scores.totalScore,
      reasoning,
      riskFactors,
      alternativeOptions: alternatives,
      workloadImpact: {
        newUtilization: Math.round(newUtilization),
        taskLoadIncrease: Math.round((task.estimatedHours / member.currentWorkload.weeklyCapacity) * 100),
        estimatedDeliveryDate
      }
    };
  }

  /**
   * Generate mock recommendations for testing/demo purposes
   */
  private generateMockRecommendations(task: TaskRequirements, teamMembers: TeamMember[]): AssignmentRecommendation[] {
    // Filter out overloaded members (>95% utilization) and check role requirements
    const eligibleMembers = teamMembers.filter(member => {
      // Workload check
      if (member.currentWorkload.utilizationPercentage > 95) {
        return false;
      }
      
      // Role requirement check
      if (task.roleRequired && member.role !== task.roleRequired) {
        return false;
      }
      
      return true;
    });

    if (eligibleMembers.length === 0) {
      throw new Error('No eligible team members found for this task');
    }

    // Score members based on skill match and workload
    const scoredMembers = eligibleMembers.map(member => {
      let score = 0.5; // Base score
      
      // Skills matching
      const hasMatchingSkills = task.skillsRequired.some(skill =>
        member.skills.some(memberSkill => 
          memberSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(memberSkill.toLowerCase())
        )
      );
      
      if (hasMatchingSkills) {
        score += 0.3;
      }
      
      // Workload consideration (lower utilization = higher score)
      const utilizationBonus = (100 - member.currentWorkload.utilizationPercentage) / 200; // 0 to 0.5
      score += utilizationBonus;
      
      return { member, score };
    });

    // Sort by score and take top 3
    const sortedMembers = scoredMembers
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return sortedMembers.map((scored, index) => ({
      memberId: scored.member.id,
      memberName: scored.member.name,
      confidence: Math.min(scored.score, 0.95), // Cap at 95%
      reasoning: [
        'Good skill match for task requirements',
        'Available capacity in current workload',
        'Strong performance history'
      ],
      riskFactors: scored.member.currentWorkload.utilizationPercentage > 85 ? ['Higher than optimal workload'] : [],
      alternativeOptions: sortedMembers
        .filter(s => s.member.id !== scored.member.id)
        .slice(0, 2)
        .map(alt => ({
          memberId: alt.member.id,
          memberName: alt.member.name,
          confidence: 0.7,
          reason: alt.score > 0.7 ? 'Good skill match' : 'Alternative option with good availability'
        })),
      workloadImpact: {
        newUtilization: scored.member.currentWorkload.utilizationPercentage + 15,
        taskLoadIncrease: 20,
        estimatedDeliveryDate: new Date(Date.now() + (3 + index) * 24 * 60 * 60 * 1000)
      }
    }));
  }

  /**
   * Get team workload summary for dashboard display
   */
  async getTeamWorkloadSummary(teamMembers: TeamMember[]): Promise<{
    totalMembers: number;
    averageUtilization: number;
    overloadedMembers: number;
    availableCapacity: number;
    urgentTasksCount: number;
    memberSummaries: Array<{
      id: string;
      name: string;
      utilization: number;
      activeTasks: number;
      status: 'available' | 'optimal' | 'busy' | 'overloaded';
    }>;
  }> {
    const memberSummaries = teamMembers.map(member => {
      let status: 'available' | 'optimal' | 'busy' | 'overloaded';
      const util = member.currentWorkload.utilizationPercentage;
      
      if (util < 65) status = 'available';
      else if (util < 85) status = 'optimal';
      else if (util <= 95) status = 'busy';
      else status = 'overloaded';

      return {
        id: member.id,
        name: member.name,
        utilization: util,
        activeTasks: member.currentWorkload.activeTasks,
        status
      };
    });

    return {
      totalMembers: teamMembers.length,
      averageUtilization: teamMembers.reduce((sum, m) => sum + m.currentWorkload.utilizationPercentage, 0) / teamMembers.length,
      overloadedMembers: teamMembers.filter(m => m.currentWorkload.utilizationPercentage > 95).length,
      availableCapacity: teamMembers.reduce((sum, m) => sum + Math.max(0, 100 - m.currentWorkload.utilizationPercentage), 0),
      urgentTasksCount: teamMembers.reduce((sum, m) => sum + m.currentWorkload.urgentTasks, 0),
      memberSummaries
    };
  }
} 