// components/ProtectedRoute.tsx
import { useMockUser } from "@/lib/mock-user"
import { ReactNode, useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
  loadingComponent?: ReactNode
  unauthorizedComponent?: ReactNode
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
  const user = useMockUser()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (adminOnly && user.role !== 'admin') {
      setIsAuthorized(false)
    } else {
      setIsAuthorized(true)
    }
  }, [user.role, adminOnly])

  if (isAuthorized === null) {
    return <>{loadingComponent}</>
  }

  if (isAuthorized) {
    return <>{children}</>
  }

  // Render unauthorized component or null if not authorized
  return <>{unauthorizedComponent}</>
}

// Add display name for better debugging
ProtectedRoute.displayName = 'ProtectedRoute'