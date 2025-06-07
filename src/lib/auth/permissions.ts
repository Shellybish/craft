import { UserRole, Permission } from './types'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_TASKS,
    Permission.EDIT_TASKS,
    Permission.DELETE_TASKS,
    Permission.VIEW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.MANAGE_CLIENTS,
    Permission.VIEW_CLIENT_DATA,
    Permission.USE_AI_BRIEFING,
    Permission.USE_AI_STATUS_GENERATION,
    Permission.USE_AI_TASK_CREATION,
    Permission.MANAGE_AGENCY_SETTINGS,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  [UserRole.AGENCY_ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_TASKS,
    Permission.EDIT_TASKS,
    Permission.DELETE_TASKS,
    Permission.VIEW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.MANAGE_CLIENTS,
    Permission.VIEW_CLIENT_DATA,
    Permission.USE_AI_BRIEFING,
    Permission.USE_AI_STATUS_GENERATION,
    Permission.USE_AI_TASK_CREATION,
    Permission.MANAGE_AGENCY_SETTINGS,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  [UserRole.PROJECT_MANAGER]: [
    Permission.VIEW_USERS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_TASKS,
    Permission.EDIT_TASKS,
    Permission.DELETE_TASKS,
    Permission.VIEW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_CLIENT_DATA,
    Permission.USE_AI_BRIEFING,
    Permission.USE_AI_STATUS_GENERATION,
    Permission.USE_AI_TASK_CREATION,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA
  ],
  
  [UserRole.TEAM_MEMBER]: [
    Permission.VIEW_USERS,
    Permission.VIEW_PROJECTS,
    Permission.CREATE_TASKS,
    Permission.EDIT_TASKS,
    Permission.VIEW_TASKS,
    Permission.USE_AI_BRIEFING,
    Permission.USE_AI_TASK_CREATION,
    Permission.VIEW_REPORTS
  ],
  
  [UserRole.CLIENT]: [
    Permission.VIEW_PROJECTS,
    Permission.VIEW_TASKS,
    Permission.VIEW_REPORTS
  ]
}

export function getUserPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = getUserPermissions(userRole)
  return permissions.includes(permission)
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  const userPermissions = getUserPermissions(userRole)
  return permissions.some(permission => userPermissions.includes(permission))
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  const userPermissions = getUserPermissions(userRole)
  return permissions.every(permission => userPermissions.includes(permission))
} 