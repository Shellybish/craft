import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UserRole, Permission } from './types'
import { hasPermission } from './permissions'

export interface RouteConfig {
  path: string
  requiredRole?: UserRole
  requiredPermission?: Permission
  allowAnonymous?: boolean
}

// Define protected routes and their requirements
export const PROTECTED_ROUTES: RouteConfig[] = [
  // Admin routes
  {
    path: '/admin',
    requiredRole: UserRole.AGENCY_ADMIN,
    requiredPermission: Permission.MANAGE_AGENCY_SETTINGS
  },
  {
    path: '/admin/users',
    requiredPermission: Permission.MANAGE_USERS
  },
  
  // Project management routes
  {
    path: '/projects/new',
    requiredPermission: Permission.CREATE_PROJECTS
  },
  {
    path: '/projects/*/edit',
    requiredPermission: Permission.EDIT_PROJECTS
  },
  {
    path: '/projects/*/settings',
    requiredPermission: Permission.MANAGE_PROJECT_SETTINGS
  },
  
  // Task management routes
  {
    path: '/tasks/bulk',
    requiredPermission: Permission.ASSIGN_TASKS
  },
  
  // AI features
  {
    path: '/ai/briefing',
    requiredPermission: Permission.USE_AI_BRIEFING
  },
  {
    path: '/ai/status',
    requiredPermission: Permission.USE_AI_STATUS_GENERATION
  },
  
  // Reports
  {
    path: '/reports',
    requiredPermission: Permission.VIEW_REPORTS
  },
  {
    path: '/reports/export',
    requiredPermission: Permission.EXPORT_DATA
  },
  
  // General authenticated routes
  {
    path: '/dashboard',
    allowAnonymous: false
  },
  {
    path: '/profile',
    allowAnonymous: false
  }
]

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
]

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '.*')
      return new RegExp(`^${pattern}$`).test(pathname)
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

export function findRouteConfig(pathname: string): RouteConfig | null {
  return PROTECTED_ROUTES.find(route => {
    if (route.path.includes('*')) {
      const pattern = route.path.replace('*', '[^/]+')
      return new RegExp(`^${pattern}$`).test(pathname)
    }
    return pathname === route.path || pathname.startsWith(route.path + '/')
  }) || null
}

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    // Redirect to signin if not authenticated
    if (error || !user) {
      const signinUrl = new URL('/auth/signin', request.url)
      signinUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signinUrl)
    }

    // Get user profile for role and permission checking
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Redirect to profile setup if profile doesn't exist
      return NextResponse.redirect(new URL('/auth/setup-profile', request.url))
    }

    // Check route-specific requirements
    const routeConfig = findRouteConfig(pathname)
    
    if (routeConfig) {
      // Check role requirement
      if (routeConfig.requiredRole && profile.role !== routeConfig.requiredRole) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Check permission requirement
      if (routeConfig.requiredPermission && !hasPermission(profile.role, routeConfig.requiredPermission)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Add user context to headers for downstream usage
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-role', profile.role)
    requestHeaders.set('x-agency-id', profile.agency_id)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

// Utility function to get user context from middleware headers
export function getUserContextFromHeaders(headers: Headers) {
  return {
    userId: headers.get('x-user-id'),
    userRole: headers.get('x-user-role') as UserRole,
    agencyId: headers.get('x-agency-id')
  }
} 