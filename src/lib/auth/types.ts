export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  AGENCY_ADMIN = 'agency_admin',
  PROJECT_MANAGER = 'project_manager',
  TEAM_MEMBER = 'team_member',
  CLIENT = 'client'
}

export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Project management
  CREATE_PROJECTS = 'create_projects',
  EDIT_PROJECTS = 'edit_projects',
  DELETE_PROJECTS = 'delete_projects',
  VIEW_PROJECTS = 'view_projects',
  
  // Task management
  CREATE_TASKS = 'create_tasks',
  EDIT_TASKS = 'edit_tasks',
  DELETE_TASKS = 'delete_tasks',
  VIEW_TASKS = 'view_tasks',
  ASSIGN_TASKS = 'assign_tasks',
  
  // Client management
  MANAGE_CLIENTS = 'manage_clients',
  VIEW_CLIENT_DATA = 'view_client_data',
  
  // AI features
  USE_AI_BRIEFING = 'use_ai_briefing',
  USE_AI_STATUS_GENERATION = 'use_ai_status_generation',
  USE_AI_TASK_CREATION = 'use_ai_task_creation',
  
  // Settings
  MANAGE_AGENCY_SETTINGS = 'manage_agency_settings',
  MANAGE_PROJECT_SETTINGS = 'manage_project_settings',
  
  // Reports
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data'
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  agency_id: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile
  permissions: Permission[]
}

export interface Agency {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
  is_active: boolean
} 