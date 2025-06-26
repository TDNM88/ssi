// lib/auth.ts
import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "./db"
import { users, loginAttempts } from "./schema"
import { loginRateLimit } from './rate-limit'
import { config } from '../config'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role: string
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

// Cache for login attempts (in-memory fallback)
const loginAttemptsCache = new Map<string, { count: number; lastAttempt: Date }>()
const MAX_LOGIN_ATTEMPTS = config.loginAttemptsBeforeLockout
const LOCKOUT_DURATION = config.lockoutDurationMinutes * 60 * 1000 // Convert minutes to milliseconds

// Session user type
type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role: string
}

// Export authOptions as a named export
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const ip = (req.headers?.['x-forwarded-for'] as string)?.split(',')[0] || '127.0.0.1'
        const emailKey = credentials.email.toLowerCase()
        
        // Check login attempts rate limit using Redis
        const { success: rateLimitSuccess, reset } = await loginRateLimit.limit(ip)
        if (!rateLimitSuccess) {
          const retryAfter = Math.ceil((reset - Date.now()) / 1000)
          throw new Error(`Too many login attempts. Please try again in ${retryAfter} seconds.`)
        }

        // Check login attempts in cache (fallback)
        const cacheKey = `login-attempts:${emailKey}`
        const cachedAttempts = loginAttemptsCache.get(cacheKey)
        
        if (cachedAttempts && 
            cachedAttempts.count >= MAX_LOGIN_ATTEMPTS && 
            (Date.now() - cachedAttempts.lastAttempt.getTime()) < LOCKOUT_DURATION) {
          const timeLeft = Math.ceil((LOCKOUT_DURATION - (Date.now() - cachedAttempts.lastAttempt.getTime())) / 60000)
          throw new Error(`Account temporarily locked. Too many failed login attempts. Please try again in ${timeLeft} minutes.`)
        }

        try {
          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toLowerCase()))
            .limit(1)

          if (!user) {
            // User not found, but don't leak that info
            throw new Error('Invalid email or password')
          }

          // Verify password
          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            // Update login attempts in cache and database
            const attempts = (cachedAttempts?.count || 0) + 1
            const now = new Date()
            
            // Update in-memory cache
            loginAttemptsCache.set(cacheKey, {
              count: attempts,
              lastAttempt: now
            })

            // Log failed attempt to database
            try {
              await db.insert(loginAttempts).values({
                userId: user.id,
                ipAddress: ip,
                userAgent: req.headers?.['user-agent'] || 'unknown',
                success: false,
                createdAt: now
              })
            } catch (dbError) {
              console.error('Failed to log failed login attempt:', dbError)
            }

            const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts
            const errorMessage = remainingAttempts > 0 
              ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
              : 'Account locked. Too many failed login attempts.'
            
            throw new Error(errorMessage)
          }

          // Reset login attempts on successful login
          loginAttemptsCache.delete(cacheKey)

          // Log successful login
          const now = new Date()
          try {
            await db.insert(loginAttempts).values({
              userId: user.id,
              ipAddress: ip,
              userAgent: req.headers?.['user-agent'] || 'unknown',
              success: true,
              createdAt: now
            })
          } catch (dbError) {
            console.error('Failed to log successful login attempt:', dbError)
            // Don't fail the login if logging fails
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user'
          }
        } catch (error) {
          console.error('Login error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as SessionUser).role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn() {
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/login')) {
        return `${baseUrl}/dashboard`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email)
    },
    async signOut() {
      // Handle cleanup on sign out
    }
  },
  logger: {
    error(code, metadata) {
      console.error('Auth error:', { code, ...metadata })
    },
    warn(code) {
      console.warn('Auth warning:', code)
    },
    debug(code: string, metadata: unknown) {
      if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
        console.debug('Auth debug:', { code, ...metadata as Record<string, unknown> })
      } else {
        console.debug('Auth debug:', { code, metadata })
      }
    }
  }
}

// Export the NextAuth instance as default
export default NextAuth(authOptions)