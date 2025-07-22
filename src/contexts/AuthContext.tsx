"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Define what our auth context will provide
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth provider component
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    // Skip demo mode setup if we're currently signing out
    if (signingOut) {
      return
    }
    
    // Check if user explicitly signed out
    const hasSignedOut = typeof window !== 'undefined' && localStorage.getItem('user-signed-out') === 'true'
    
    // If Supabase is not configured and user hasn't signed out, simulate a logged-in user
    if (!supabase && !hasSignedOut) {
      const mockUser = {
        id: 'demo-user',
        email: 'demo@example.com',
        created_at: new Date().toISOString()
      } as User
      
      setUser(mockUser)
      setSession({ user: mockUser } as Session)
      setLoading(false)
      return
    }
    
    // If user signed out, ensure they stay signed out
    if (hasSignedOut) {
      setUser(null)
      setSession(null)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    if (!supabase) {
      return () => {}
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session)
        
        // Don't update state if we're currently signing out
        if (signingOut && event === 'SIGNED_OUT') {
          console.log('Sign out confirmed, staying signed out')
          return
        }
        
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [signingOut])

  // Sign out function
  const signOut = async () => {
    // Prevent multiple sign out calls
    if (signingOut) {
      console.log('Sign out already in progress')
      return
    }
    
    try {
      setSigningOut(true)
      console.log('Sign out attempted, supabase:', !!supabase)
      
      // Mark user as explicitly signed out
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-signed-out', 'true')
      }
      
      // Clear all auth-related storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-' + window.location.hostname + '-auth-token')
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }
      
      // Clear user state immediately
      setUser(null)
      setSession(null)
      setLoading(false)
      
      if (supabase) {
        // Sign out from Supabase
        await supabase.auth.signOut()
      }
      
      // Force reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Force reload even if there's an error
      if (typeof window !== 'undefined') {
        // Mark as signed out and clear state
        localStorage.setItem('user-signed-out', 'true')
        setUser(null)
        setSession(null)
        window.location.reload()
      }
    }
  }

  const value = {
    user,
    session,
    loading: loading || signingOut,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}