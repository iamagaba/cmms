'use client'

import { useState } from 'react'
import { TimelineContainer } from '@/components/timeline'
import type { TimelineFilters } from '@/types/activity-timeline'

/**
 * Timeline Demo Page - Test the mobile TimelineFilters component
 */
export default function TimelineDemoPage() {
  const [filters, setFilters] = useState<TimelineFilters>({})

  const handleFilterChange = (newFilters: TimelineFilters) => {
    console.log('Filters changed:', newFilters)
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Timeline Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Current Filters</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>

        <TimelineContainer
          workOrderId="demo-work-order-123"
          filters={filters}
          onFilterChange={handleFilterChange}
          config={{
            enableRealTimeUpdates: false, // Disable for demo
            maxActivitiesPerPage: 10
          }}
        />
      </div>
    </div>
  )
}