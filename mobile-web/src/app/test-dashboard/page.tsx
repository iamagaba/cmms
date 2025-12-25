'use client'

import { useAuth } from '@/context/AuthContext'

export default function TestDashboardPage() {
  const { session, user, profile, isLoading } = useAuth()

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Dashboard</h1>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Session:</strong> {session ? 'Exists' : 'None'}</p>
          <p><strong>User Email:</strong> {user?.email || 'None'}</p>
          <p><strong>Profile:</strong> {profile?.first_name || 'None'}</p>
        </div>

        {session ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-green-800 font-semibold">✅ Successfully Authenticated!</h3>
            <p className="text-green-700">Welcome, {user?.email}</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-red-800 font-semibold">❌ Not Authenticated</h3>
            <p className="text-red-700">Please log in</p>
          </div>
        )}

        <div className="space-y-2">
          <a 
            href="/login" 
            className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </a>
          <a 
            href="/" 
            className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Go to Main Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}