// lib/auth.ts
import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "./db"
import { users, loginAttempts } from "./schema"
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
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

// Rate limiting configuration
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(config.rateLimitPerMinute, '1 m'),
  analytics: true,
  prefix: 'auth-ratelimit',
})

// Cache for login attempts
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
        
        // Check rate limit
        const { success } = await ratelimit.limit(ip)
        if (!success) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        // Check login attempts in cache
        const cacheKey = `login-attempts:${credentials.email.toLowerCase()}`
        const cachedAttempts = loginAttemptsCache.get(cacheKey)
        
        if (cachedAttempts && 
            cachedAttempts.count >= MAX_LOGIN_ATTEMPTS && 
            (Date.now() - cachedAttempts.lastAttempt.getTime()) < LOCKOUT_DURATION) {
          throw new Error('Account locked. Too many failed login attempts. Please try again later.')
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
            // Update login attempts in cache
            const attempts = (cachedAttempts?.count || 0) + 1
            loginAttemptsCache.set(cacheKey, {
              count: attempts,
              lastAttempt: new Date()
            })

            // Log failed attempt to database
            await db.insert(loginAttempts).values({
              userId: user.id,
              ipAddress: ip,
              userAgent: req.headers?.['user-agent'] || 'unknown',
              success: false,
              createdAt: new Date()
            })

            throw new Error('Invalid email or password')
          }

          // Reset login attempts on successful login
          loginAttemptsCache.delete(cacheKey)

          // Log successful login
          await db.insert(loginAttempts).values({
            userId: user.id,
            ipAddress: ip,
            userAgent: req.headers?.['user-agent'] || 'unknown',
            success: true,
            createdAt: new Date()
          })

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

export default NextAuth(authOptions)