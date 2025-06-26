// hooks/useAuth.ts
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useCallback } from "react"

/**
 * Represents the user session data
 */
export interface UserSession {
  id: string
  name?: string | null
  email?: string | null
  role: string
  [key: string]: any
}

/**
 * Hook to handle authentication state and user data
 * @param required - If true, redirects to login when user is not authenticated
 * @returns Object containing user data and authentication state
 */
export function useAuth(required = false) {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  
  const user = session?.user as UserSession | undefined
  const loading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const isAdmin = user?.role === "admin"

  /**
   * Check if the current user has a specific role
   * @param role - The role to check
   * @returns boolean indicating if the user has the role
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!isAuthenticated || !user) return false
    return user.role === role
  }, [isAuthenticated, user])

  /**
   * Check if the current user has any of the specified roles
   * @param roles - Array of roles to check
   * @returns boolean indicating if the user has any of the roles
   */
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!isAuthenticated || !user) return false
    return roles.includes(user.role)
  }, [isAuthenticated, user])

  /**
   * Sign out the current user
   * @param options - Options for sign out
   */
  const signOutUser = useCallback(async (options: { 
    redirect?: boolean; 
    callbackUrl?: string 
  } = { redirect: true, callbackUrl: '/login' }) => {
    const { redirect = true, callbackUrl = '/login' } = options
    
    await signOut({
      redirect: false,
      callbackUrl
    })
    
    if (redirect) {
      router.push(callbackUrl)
    }
  }, [router])

  // Redirect if authentication is required but user is not authenticated
  useEffect(() => {
    if (required && status === 'unauthenticated' && !loading) {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`)
    }
  }, [required, status, loading, router])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    isAdmin,
    hasRole,
    hasAnyRole,
    signOut: signOutUser,
    updateSession: update,
    status
  }), [
    user, 
    loading, 
    isAuthenticated, 
    isAdmin, 
    hasRole, 
    hasAnyRole, 
    signOutUser, 
    update, 
    status
  ])

  return value
}

// Re-export types for convenience
export type { User } from 'next-auth'

/**
 * Hook to get the current user
 * @returns Object containing the user and loading state
 */
export function useUser() {
  const { data: session, status } = useSession()
  return {
    user: session?.user as UserSession | undefined,
    isLoading: status === 'loading'
  }
}