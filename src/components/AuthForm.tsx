"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useTheme } from "@/contexts/ThemeContext"

interface AuthFormProps {
  onAuthSuccess: () => void
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme, toggleTheme } = useTheme()

  // Handle form submission for login/signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      if (isLogin) {
        // Login existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          onAuthSuccess()
        }
      } else {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          alert('Check your email for the confirmation link!')
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-6 right-6 w-12 h-12 rounded-full shadow-lg border-2 backdrop-blur-sm bg-background/80 hover:bg-background/90 transition-all duration-300 hover:scale-110 z-10"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </Button>
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-background/80 shadow-2xl border-2 border-border/50 animate-in slide-in-from-bottom-8 duration-700">
        <CardHeader className="text-center space-y-2 pb-8">
          {/* Logo/Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">📋</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Join Us Today'}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Sign in to access your tasks' : 'Create your account to get started'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-12 bg-background/50 border-2 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/60"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  📧
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-12 h-12 bg-background/50 border-2 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/60"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  🔒
                </div>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{isLogin ? '🚀 Sign In' : '✨ Create Account'}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-4 h-12 border-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 transform hover:scale-[1.02]"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🌐</span>
                <span className="font-medium">{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
              </div>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin 
                ? "Don't have an account? " 
                : "Already have an account? "
              }
              <span className="text-primary font-semibold hover:underline">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}