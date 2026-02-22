'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  X, Calendar, Filter, Search, Users, RotateCcw, 
  Check, ChevronDown, ChevronUp 
} from 'lucide-react'
import { 
  getActivityTypeConfig, 
  getAllActivityTypes, 
  getActivityTypesByCategory 
} from '@/utils/activity-type-config'
import type { 
  TimelineFiltersProps, 
  TimelineFilters, 
  ActivityType 
} from '@/types/activity-timeline'

/**
 * TimelineFilters - Mobile-optimized filter drawer component
 * Features:
 * - Slide-up drawer interface for mobile
 * - Touch-optimized controls with proper tap target sizes (min 44px)
 * - Clear visual feedback for applied filters
 * - Industrial color system (steel blue, safety orange)
 * - Collapsible sections for better space utilization
 */
export function TimelineFilters({
  filters,
  onFiltersChange,
  availableTechnicians = [],
  className = '',
  isOpen,
  onClose
}: TimelineFiltersProps) {
  // Local state for filter editing
  const [localFilters, setLocalFilters] = useState<TimelineFilters>(filters)
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')
  const [expandedSections, setExpandedSections] = useState({
    activityTypes: true,
    dateRange: false,
    technicians: false,
    search: false
  })

  // Sync with external filters when they change
  useEffect(() => {
    setLocalFilters(filters)
    setSearchQuery(filters.searchQuery || '')
  }, [filters])

  // Activity type categories for organized display
  const activityCategories = useMemo(() => getActivityTypesByCategory(), [])

  /**
   * Handle activity type selection
   */
  const handleActivityTypeToggle = useCallback((type: ActivityType) => {
    const currentTypes = localFilters.activityTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    setLocalFilters(prev => ({
      ...prev,
      activityTypes: newTypes.length > 0 ? newTypes : undefined
    }))
  }, [localFilters.activityTypes])

  /**
   * Handle date range changes
   */
  const handleDateRangeChange = useCallback((range: 'today' | 'week' | 'month' | 'custom' | null) => {
    if (!range) {
      setLocalFilters(prev => ({ ...prev, dateRange: undefined }))
      return
    }

    const now = new Date()
    let start: Date
    const end: Date = new Date(now)

    switch (range) {
      case 'today':
        start = new Date(now)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        break
      case 'month':
        start = new Date(now)
        start.setDate(now.getDate() - 30)
        start.setHours(0, 0, 0, 0)
        break
      default:
        return // Custom date picker would be implemented here
    }

    setLocalFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }))
  }, [])

  /**
   * Handle technician selection
   */
  const handleTechnicianToggle = useCallback((technicianId: string) => {
    const currentTechnicians = localFilters.technicianIds || []
    const newTechnicians = currentTechnicians.includes(technicianId)
      ? currentTechnicians.filter(id => id !== technicianId)
      : [...currentTechnicians, technicianId]
    
    setLocalFilters(prev => ({
      ...prev,
      technicianIds: newTechnicians.length > 0 ? newTechnicians : undefined
    }))
  }, [localFilters.technicianIds])

  /**
   * Handle search query changes
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    setLocalFilters(prev => ({
      ...prev,
      searchQuery: query.trim() || undefined
    }))
  }, [])

  /**
   * Apply filters and close drawer
   */
  const handleApplyFilters = useCallback(() => {
    onFiltersChange(localFilters)
    onClose()
  }, [localFilters, onFiltersChange, onClose])

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    const clearedFilters: TimelineFilters = {}
    setLocalFilters(clearedFilters)
    setSearchQuery('')
    onFiltersChange(clearedFilters)
  }, [onFiltersChange])

  /**
   * Toggle section expansion
   */
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  /**
   * Count active filters for display
   */
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (localFilters.activityTypes?.length) count++
    if (localFilters.dateRange) count++
    if (localFilters.technicianIds?.length) count++
    if (localFilters.searchQuery) count++
    return count
  }, [localFilters])

  /**
   * Check if current date range matches preset
   */
  const getCurrentDateRangePreset = useCallback(() => {
    if (!localFilters.dateRange) return null
    
    const { start, end } = localFilters.dateRange
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    
    // Check if it's today
    if (start.getTime() === today.getTime() && 
        end.getDate() === now.getDate() && 
        end.getMonth() === now.getMonth() && 
        end.getFullYear() === now.getFullYear()) {
      return 'today'
    }
    
    // Check if it's last 7 days
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)
    
    if (Math.abs(start.getTime() - weekAgo.getTime()) < 24 * 60 * 60 * 1000) {
      return 'week'
    }
    
    // Check if it's last 30 days
    const monthAgo = new Date(now)
    monthAgo.setDate(now.getDate() - 30)
    monthAgo.setHours(0, 0, 0, 0)
    
    if (Math.abs(start.getTime() - monthAgo.getTime()) < 24 * 60 * 60 * 1000) {
      return 'month'
    }
    
    return 'custom'
  }, [localFilters.dateRange])

  /**
   * Render activity type checkbox
   */
  const renderActivityTypeCheckbox = (type: ActivityType) => {
    const config = getActivityTypeConfig(type)
    const isSelected = localFilters.activityTypes?.includes(type) || false
    
    return (
      <label
        key={type}
        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 
                   hover:bg-gray-50 active:bg-gray-100 transition-colors
                   min-h-[52px] touch-manipulation cursor-pointer"
      >
        <div className="relative">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleActivityTypeToggle(type)}
            className="sr-only"
          />
          <div className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            transition-all duration-200
            ${isSelected 
              ? 'bg-primary-600 border-primary-600' 
              : 'bg-white border-gray-300 hover:border-primary-400'
            }
          `}>
            {isSelected && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {config.description}
          </p>
        </div>
      </label>
    )
  }

  /**
   * Render section header with expand/collapse
   */
  const renderSectionHeader = (
    title: string, 
    section: keyof typeof expandedSections,
    count?: number
  ) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-3 
                 hover:bg-gray-50 active:bg-gray-100 transition-colors
                 min-h-[52px] touch-manipulation"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50
        max-h-[85vh] flex flex-col
        transform transition-transform duration-300 ease-out
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Filter Timeline
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg
                       transition-colors min-h-[44px] min-w-[44px]
                       touch-manipulation flex items-center justify-center"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Section */}
          <div className="border-b border-gray-200">
            {renderSectionHeader('Search', 'search', localFilters.searchQuery ? 1 : 0)}
            {expandedSections.search && (
              <div className="p-4 pt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                               text-base min-h-[48px] touch-manipulation"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Activity Types Section */}
          <div className="border-b border-gray-200">
            {renderSectionHeader('Activity Types', 'activityTypes', localFilters.activityTypes?.length)}
            {expandedSections.activityTypes && (
              <div className="p-4 pt-0">
                {/* Lifecycle Activities */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Lifecycle</h4>
                  <div className="space-y-2">
                    {activityCategories.lifecycle.map(renderActivityTypeCheckbox)}
                  </div>
                </div>

                {/* Updates */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Updates</h4>
                  <div className="space-y-2">
                    {activityCategories.updates.map(renderActivityTypeCheckbox)}
                  </div>
                </div>

                {/* Communication */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Communication</h4>
                  <div className="space-y-2">
                    {activityCategories.communication.map(renderActivityTypeCheckbox)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Section */}
          <div className="border-b border-gray-200">
            {renderSectionHeader('Date Range', 'dateRange', localFilters.dateRange ? 1 : 0)}
            {expandedSections.dateRange && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'Last 7 days' },
                    { key: 'month', label: 'Last 30 days' },
                    { key: 'custom', label: 'Custom' }
                  ].map(({ key, label }) => {
                    const isSelected = getCurrentDateRangePreset() === key
                    return (
                      <button
                        key={key}
                        onClick={() => handleDateRangeChange(key as any)}
                        disabled={key === 'custom'} // TODO: Implement custom date picker
                        className={`
                          p-3 rounded-lg border text-sm font-medium transition-colors
                          min-h-[48px] touch-manipulation
                          ${isSelected
                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                          }
                          ${key === 'custom' ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {label}
                        {key === 'custom' && (
                          <span className="block text-xs text-gray-500 mt-1">Coming soon</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                
                {localFilters.dateRange && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {localFilters.dateRange.start.toLocaleDateString()} - {localFilters.dateRange.end.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Technicians Section */}
          {availableTechnicians.length > 0 && (
            <div className="border-b border-gray-200">
              {renderSectionHeader('Technicians', 'technicians', localFilters.technicianIds?.length)}
              {expandedSections.technicians && (
                <div className="p-4 pt-0">
                  <div className="space-y-2">
                    {availableTechnicians.map(technician => {
                      const isSelected = localFilters.technicianIds?.includes(technician.id) || false
                      return (
                        <label
                          key={technician.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 
                                     hover:bg-gray-50 active:bg-gray-100 transition-colors
                                     min-h-[52px] touch-manipulation cursor-pointer"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTechnicianToggle(technician.id)}
                              className="sr-only"
                            />
                            <div className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center
                              transition-all duration-200
                              ${isSelected 
                                ? 'bg-primary-600 border-primary-600' 
                                : 'bg-white border-gray-300 hover:border-primary-400'
                              }
                            `}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {technician.name}
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <button
            onClick={handleClearFilters}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 
                       rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200
                       transition-colors min-h-[48px] touch-manipulation
                       flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium
                       hover:bg-primary-700 active:bg-primary-800 transition-colors
                       min-h-[48px] touch-manipulation
                       flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}