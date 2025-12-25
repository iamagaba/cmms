'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function DirectLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionInfo(session)
        setSuccess(true)
      }
    }
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('🔐 Starting login process...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 Login response:', { 
        user: data?.user?.email, 
        session: !!data?.session,
        error: error?.message 
      })

      if (error) {
        setError(error.message)
        console.error('🔐 Login failed:', error)
      } else if (data?.session) {
        console.log('🔐 Login successful!')
        setSuccess(true)
        setSessionInfo(data.session)
        
        // Wait a bit then redirect
        setTimeout(() => {
          window.location.href = '/test-dashboard'
        }, 2000)
      } else {
        setError('Login failed - no session returned')
      }
    } catch (err) {
      console.error('🔐 Login exception:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSuccess(false)
    setSessionInfo(null)
  }

  if (success && sessionInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h1>
              <p className="text-gray-600">Welcome back, {sessionInfo.user?.email}</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Session Details:</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Email:</strong> {sessionInfo.user?.email}</p>
                <p><strong>User ID:</strong> {sessionInfo.user?.id}</p>
                <p><strong>Session ID:</strong> {sessionInfo.access_token?.substring(0, 20)}...</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/test-dashboard'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to Test Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Go to Main Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700"
              >
                Logout
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Redirecting to dashboard in 2 seconds...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Direct Login Test</h1>
          <p className="text-gray-600">Bypasses AuthContext for testing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              This bypasses the AuthContext to test direct Supabase auth
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}