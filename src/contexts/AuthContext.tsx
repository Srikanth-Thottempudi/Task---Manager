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
    // Skip auth setup if we're currently signing out
    if (signingOut) {
      return
    }
    
    // Ensure Supabase is configured
    if (!supabase) {
      console.error('Supabase is not configured. Please check your environment variables.')
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
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
    
    if (!supabase) {
      console.error('Cannot sign out: Supabase not configured')
      return
    }
    
    try {
      setSigningOut(true)
      console.log('Sign out attempted')
      
      // Clear user state immediately
      setUser(null)
      setSession(null)
      setLoading(false)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Force reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Force reload even if there's an error
      if (typeof window !== 'undefined') {
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