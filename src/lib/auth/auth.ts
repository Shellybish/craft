import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import { UserRole, Permission, AuthUser, UserProfile } from './types'
import { getUserPermissions, hasPermission } from './permissions'
import { redirect } from 'next/navigation'

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Get the current authenticated user from the server
 */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new AuthError('User profile not found', 'PROFILE_NOT_FOUND')
    }

    const permissions = getUserPermissions(profile.role)

    return {
      id: user.id,
      email: user.email!,
      profile,
      permissions
    }
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}

/**
 * Get the current authenticated user from the client
 */
export async function getClientUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new AuthError('User profile not found', 'PROFILE_NOT_FOUND')
    }

    const permissions = getUserPermissions(profile.role)

    return {
      id: user.id,
      email: user.email!,
      profile,
      permissions
    }
  } catch (error) {
    console.error('Error getting client user:', error)
    return null
  }
}

/**
 * Sign up a new user with role assignment
 */
export async function signUp(
  email: string, 
  password: string, 
  fullName: string,
  role: UserRole = UserRole.TEAM_MEMBER,
  agencyId: string
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          agency_id: agencyId
        }
      }
    })

    if (error) {
      throw new AuthError(error.message, error.name)
    }

    return data
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new AuthError(error.message, error.name)
    }

    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new AuthError(error.message, error.name)
    }
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Check if user has required permission
 */
export function requirePermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) {
    return false
  }
  
  return hasPermission(user.profile.role, permission)
}

/**
 * Middleware to protect routes with permission requirements
 */
export async function requireAuth(permission?: Permission): Promise<AuthUser> {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  if (permission && !requirePermission(user, permission)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Create or update user profile after authentication
 */
export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string,
  role: UserRole,
  agencyId: string
): Promise<UserProfile> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const profileData = {
      id: userId,
      email,
      full_name: fullName,
      role,
      agency_id: agencyId,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single()

    if (error) {
      throw new AuthError('Failed to create user profile', 'PROFILE_CREATE_ERROR')
    }

    return data
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  currentUser: AuthUser,
  targetUserId: string,
  newRole: UserRole
): Promise<void> {
  if (!requirePermission(currentUser, Permission.MANAGE_USERS)) {
    throw new AuthError('Insufficient permissions to update user role', 'INSUFFICIENT_PERMISSIONS')
  }

  try {
    const supabase = await createServerSupabaseClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)
      .eq('agency_id', currentUser.profile.agency_id) // Ensure same agency

    if (error) {
      throw new AuthError('Failed to update user role', 'ROLE_UPDATE_ERROR')
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
} 