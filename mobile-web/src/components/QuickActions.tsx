'use client'

import { Plus, Map, Phone } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      id: 'new-order',
      label: 'New Order',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        // Navigate to work order creation
        window.location.href = '/work-orders/new'
      },
    },
    {
      id: 'map-view',
      label: 'Map View',
      icon: Map,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        // Navigate to map view
        window.location.href = '/map'
      },
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: Phone,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => {
        // Emergency contact
        window.location.href = 'tel:+1234567890'
      },
    },
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl`}
            >
              <div className="flex flex-col items-center space-y-3">
                <Icon className="w-8 h-8" />
                <span className="text-sm font-semibold">{action.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}