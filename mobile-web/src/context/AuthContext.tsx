'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  avatar_url?: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      
      console.log('🔄 Session refreshed:', { user: session?.user?.email })
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user?.id) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error in refreshSession:', error)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.warn('Failed to load profile:', error)
        // Don't throw error, profile is optional
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.warn('Profile fetch error:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...')
        
        // Add timeout to prevent infinite hanging
        const timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ Auth initialization timeout, proceeding anyway')
            setInitialized(true)
            setIsLoading(false)
          }
        }, 5000) // 5 second timeout
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        clearTimeout(timeoutId)
        
        if (!mounted) return
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
        } else {
          console.log('✅ Initial session loaded:', { 
            hasSession: !!session, 
            user: session?.user?.email 
          })
        }
        
        setSession(session)
        setUser(session?.user || null)
        
        // Fetch profile if user exists (but don't block on it)
        if (session?.user?.id) {
          fetchProfile(session.user.id).catch(err => {
            console.warn('Profile fetch failed, continuing anyway:', err)
          })
        }
        
        setInitialized(true)
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error)
        if (mounted) {
          setInitialized(true)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return
      
      console.log('🔄 Auth state change:', { 
        event, 
        user: session?.user?.email,
        hasSession: !!session 
      })
      
      // Handle different auth events
      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in')
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed')
      }
      
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user?.id) {
        fetchProfile(session.user.id).catch(err => {
          console.warn('Profile fetch failed during auth change:', err)
        })
      } else {
        setProfile(null)
      }
      
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove the dependency on initialized

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Error signing out:', error)
        throw error
      }
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      throw error
    }
  }

  // Show loading screen until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}