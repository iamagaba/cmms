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
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.email || 'User'
                }
              </h2>
              <p className="text-gray-600">{profile?.role || 'Field Technician'}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">3</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">98%</p>
              <p className="text-xs text-gray-500">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-semibold hover:bg-red-100 active:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
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