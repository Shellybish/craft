'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { AuthUser, UserRole, Permission } from './types'
import { getClientUser, requirePermission } from './auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    try {
      const authUser = await getClientUser()
      setUser(authUser)
    } catch (error) {
      console.error('Error loading user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setLoading(true)
    await loadUser()
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const hasPermissionCheck = (permission: Permission): boolean => {
    return requirePermission(user, permission)
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.profile.role === role
  }

  useEffect(() => {
    // Load initial user
    loadUser()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signOut: handleSignOut,
    hasPermission: hasPermissionCheck,
    hasRole,
    refresh
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth(permission?: Permission) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return { user: null, loading: true, authorized: false }
  }

  if (!user) {
    return { user: null, loading: false, authorized: false }
  }

  const authorized = permission ? requirePermission(user, permission) : true

  return { user, loading: false, authorized }
}

export function usePermission(permission: Permission) {
  const { user, hasPermission } = useAuth()
  return {
    hasPermission: hasPermission(permission),
    user
  }
}

export function useRole(role: UserRole) {
  const { user, hasRole } = useAuth()
  return {
    hasRole: hasRole(role),
    user
  }
} 