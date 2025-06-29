// pages/_app.tsx
import type { AppProps } from "next/app"
import { useEffect, useState } from "react"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"
import { MockUserContext, useMockUser } from "@/lib/mock-user"

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const mockUser = useMockUser();

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
    <MockUserContext.Provider value={mockUser}>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </MockUserContext.Provider>
  )
}

export default MyApp