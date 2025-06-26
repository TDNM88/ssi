// pages/_app.tsx
import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Set mounted to true on component mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until the component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <SessionProvider session={session}>
      <SessionHandler>
        <Component {...pageProps} />
        <Toaster />
      </SessionHandler>
    </SessionProvider>
  )
}

// Session handler component to manage authentication state
function SessionHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip if we're still loading or on a public route
    if (status === "loading" || publicRoutes.includes(router.pathname)) {
      setIsLoading(false)
      return
    }

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`)
      return
    }

    // If authenticated but trying to access login/register, redirect to home
    if (status === "authenticated" && (router.pathname === "/login" || router.pathname === "/register")) {
      router.push("/")
      return
    }

    setIsLoading(false)
  }, [status, router])

  // Show loading state while checking auth
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return <>{children}</>
}

export default MyApp