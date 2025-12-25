'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { User, Settings, Bell, LogOut, Shield } from 'lucide-react'

export default function ProfilePage() {
  const { profile, signOut } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Show error message to user
    } finally {
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      icon: User,
      label: 'Personal Information',
      description: 'Update your profile details',
      onClick: () => alert('Personal Information'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notification preferences',
      onClick: () => alert('Notifications'),
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Password and security settings',
      onClick: () => alert('Security'),
    },
    {
      icon: Settings,
      label: 'App Settings',
      description: 'Customize app preferences',
      onClick: () => alert('App Settings'),
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Profile" />
      
      <main className="px-4 py-6 pb-20 space-y-6">
        {/* Profile Card - Enhanced Design */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.email || 'User'
                }
              </h2>
              <p className="text-primary-600 font-medium">{profile?.role || 'Field Technician'}</p>
              <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
            </div>
          </div>
          
          {/* Stats Grid - Improved Design */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-success-50 rounded-xl">
              <p className="text-2xl font-bold text-success-600">24</p>
              <p className="text-xs text-success-700 font-medium">Completed</p>
            </div>
            <div className="text-center p-3 bg-warning-50 rounded-xl">
              <p className="text-2xl font-bold text-warning-600">3</p>
              <p className="text-xs text-warning-700 font-medium">In Progress</p>
            </div>
            <div className="text-center p-3 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">98%</p>
              <p className="text-xs text-primary-700 font-medium">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Menu Items - Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="p-3 bg-primary-50 rounded-xl">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500 truncate">{item.description}</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        {/* Logout Button - Enhanced Design */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-error-50 text-error-600 p-4 rounded-2xl font-bold hover:bg-error-100 active:bg-error-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 border border-error-200"
        >
          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-error-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </main>

      <MobileNavigation activeTab="profile" />
      </div>
    </ProtectedRoute>
  )
}