"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()
  
  // Redirect to trade page by default
  useEffect(() => {
    router.push("/trade")
  }, [router])
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
