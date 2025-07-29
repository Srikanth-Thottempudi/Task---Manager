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
  
  // Quick initial check to reduce loading time
  useEffect(() => {
    // Check for cached session data to speed up loading
    const checkCachedSession = () => {
      try {
        const cachedSession = localStorage.getItem('supabase.auth.token')
        if (!cachedSession || cachedSession === 'null') {
          // No cached session, proceed to auth form quickly
          console.log('No cached session found, proceeding to auth form')
          setLoading(false)
          setUser(null)
          setSession(null)
          return true
        }
      } catch (error) {
        console.log('Cache check failed:', error)
      }
      return false
    }
    
    // If no cache, show auth form immediately
    if (checkCachedSession()) {
      return
    }
    
    // Set a maximum loading time regardless of network issues
    const maxLoadingTimer = setTimeout(() => {
      if (loading) {
        console.log('Max loading time reached, proceeding without auth')
        setLoading(false)
        setUser(null)
        setSession(null)
      }
    }, 3000) // 3 second max loading time
    
    return () => clearTimeout(maxLoadingTimer)
  }, [])

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

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent hanging on auth
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        
        const sessionPromise = supabase!.auth.getSession();
        
        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Auth session error:', error)
        // Continue without auth if it fails
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
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
      await supabase!.auth.signOut()
      
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