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

  useEffect(() => {
    // If Supabase is not configured, simulate a logged-in user
    if (!supabase) {
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
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [])

  // Sign out function
  const signOut = async () => {
    try {
      console.log('Sign out attempted, supabase:', !!supabase)
      
      if (supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Supabase sign out error:', error)
          // Fallback to manual clearing if Supabase fails
          setUser(null)
          setSession(null)
        }
      } else {
        // For demo mode, just clear the user
        console.log('Demo mode sign out')
        setUser(null)
        setSession(null)
      }
      
      // Force page reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: force clear user state and reload
      setUser(null)
      setSession(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}