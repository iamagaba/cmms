'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSimpleAuth } from '@/context/SimpleAuthContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function SimpleAuthTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { session, user, isLoading, signOut } = useSimpleAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message)
      } else {
        console.log('✅ Login successful!')
        // Auth context will automatically update
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading simple auth...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg p-6 mb-4">
            <h1 className="text-2xl font-bold mb-4">✅ Logged In!</h1>
            
            <div className="space-y-2 mb-6">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Session:</strong> Active</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/test-dashboard'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Go to Test Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Go to Main Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
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
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Simple Auth Test</h1>
          <p className="text-gray-600">Minimal authentication context</p>
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
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
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:opacity-50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
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
              Simple auth context without complex initialization
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}