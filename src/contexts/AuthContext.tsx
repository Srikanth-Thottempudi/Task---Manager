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
    if (supabase) {
      await supabase.auth.signOut()
    } else {
      // For demo mode, just clear the user
      setUser(null)
      setSession(null)
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