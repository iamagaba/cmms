'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const SimpleAuthContext = createContext<AuthContextType | undefined>(undefined)

export const SimpleAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🚀 Simple auth initializing...')
    
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('✅ Got initial session:', { 
          hasSession: !!session, 
          user: session?.user?.email,
          error: error?.message 
        })
        
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('❌ Auth init error:', error)
      } finally {
        setIsLoading(false)
        console.log('✅ Auth initialization complete')
      }
    }

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('⚠️ Auth init timeout, setting loading to false')
      setIsLoading(false)
    }, 3000)

    initAuth().then(() => {
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth change:', { event, user: session?.user?.email })
      
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      console.log('✅ Signed out')
    } catch (error) {
      console.error('❌ Sign out error:', error)
      throw error
    }
  }

  return (
    <SimpleAuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}