// components/ProtectedRoute.tsx
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"

interface UserSession {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  loadingComponent?: React.ReactNode
  unauthorizedComponent?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
  loadingComponent = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
  unauthorizedComponent = null,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (status === 'unauthenticated') {
          await router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`)
          return
        }

        if (status === 'authenticated') {
          const userRole = (session?.user as UserSession)?.role
          
          if (adminOnly && userRole !== 'admin') {
            setIsAuthorized(false)
            return
          }
          
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        // Force sign out on error to prevent infinite loops
        await signOut({ redirect: false })
        router.push('/login')
      }
    }


    checkAuth()
  }, [status, session, adminOnly, router])

  if (status === 'loading' || isAuthorized === null) {
    return <>{loadingComponent}</>
  }

  if (status === 'authenticated' && isAuthorized) {
    return <>{children}</>
  }

  // Render unauthorized component or null if not authorized
  return <>{unauthorizedComponent}</>
}

// Add display name for better debugging
ProtectedRoute.displayName = 'ProtectedRoute'