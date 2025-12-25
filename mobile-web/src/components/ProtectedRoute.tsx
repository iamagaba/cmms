'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('ProtectedRoute state:', { isLoading, hasSession: !!session })
    if (!isLoading && !session) {
      console.log('Redirecting to login from ProtectedRoute')
      router.push('/login')
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return <>{children}</>
}