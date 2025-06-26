"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

// Define the User interface with all required properties
export interface User {
  username: string
  email: string
  fullName: string
  phone: string
  balance: number
  minimumBet: number
  minimumDeposit?: number
  minimumWithdraw?: number
  uid?: string
  createdAt?: string
  isVerified?: boolean
  isActive?: boolean
  isLockWithdraw?: boolean
  bank?: {
    holderName?: string
    bankName?: string
    bankNumber?: string
  }
  identify?: {
    fullName?: string
  }
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
})

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode
}

// Create the AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check for existing session on initial load
    const checkAuthStatus = () => {
      try {
        // Check localStorage for existing user session
        if (typeof window !== "undefined") {
          const savedUser = localStorage.getItem("london-ssi-user")
          if (savedUser) {
            setUser(JSON.parse(savedUser))
          }
        }
      } catch (err) {
        console.error("Error loading user from localStorage:", err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock response for development - replace with real API call
      if (credentials.username && credentials.password) {
        const mockUser: User = {
          username: credentials.username,
          email: `${credentials.username}@example.com`,
          fullName: "Người dùng mẫu",
          phone: "0123456789",
          balance: 10000000,
          minimumBet: 10000,
          minimumDeposit: 50000,
          minimumWithdraw: 100000,
          uid: "user123",
          createdAt: new Date().toISOString(),
          isVerified: false,
          isLockWithdraw: false,
          bank: {
            holderName: "",
            bankName: "",
            bankNumber: "",
          },
          identify: {
            fullName: "",
          },
        }
        setUser(mockUser)
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("london-ssi-user", JSON.stringify(mockUser))
        }
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Login failed")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("london-ssi-user")
    }
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  return context
}

// For backward compatibility
export function useUser() {
  const { user } = useAuth()
  return { user }
}
