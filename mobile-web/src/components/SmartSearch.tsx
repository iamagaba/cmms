'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, MapPin, User, Car, X } from 'lucide-react'

interface SearchSuggestion {
  id: string
  type: 'recent' | 'customer' | 'asset' | 'location' | 'workorder'
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
}

interface SmartSearchProps {
  placeholder?: string
  onSearch: (query: string) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  className?: string
}

export function SmartSearch({ 
  placeholder = "Search work orders, customers, assets...", 
  onSearch,
  onSuggestionSelect,
  className = '' 
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  // Mock suggestions - in real app, this would be an API call
  const generateSuggestions = (searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) {
      // Show recent searches when no query
      return recentSearches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent',
        title: search,
        icon: Clock
      }))
    }

    // Mock smart suggestions based on query
    const mockSuggestions: SearchSuggestion[] = [
      {
        id: '1',
        type: 'workorder',
        title: 'WO-2024-001',
        subtitle: 'Oil change - John Smith',
        icon: Search
      },
      {
        id: '2',
        type: 'customer',
        title: 'John Smith',
        subtitle: '555-0123 • 3 active orders',
        icon: User
      },
      {
        id: '3',
        type: 'asset',
        title: 'ABC-123',
        subtitle: '2022 Toyota Camry',
        icon: Car
      },
      {
        id: '4',
        type: 'location',
        title: 'Downtown Service Center',
        subtitle: '123 Main St • 2.3km away',
        icon: MapPin
      }
    ]

    return mockSuggestions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSuggestions(generateSuggestions(value))
    setShowSuggestions(true)
  }

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    // Perform search
    onSearch(searchQuery)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'recent') {
      setQuery(suggestion.title)
      handleSearch(suggestion.title)
    } else {
      onSuggestionSelect?.(suggestion)
      setQuery(suggestion.title)
      setShowSuggestions(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
    setSuggestions([])
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return Clock
      case 'customer': return User
      case 'asset': return Car
      case 'location': return MapPin
      default: return Search
    }
  }

  const getSuggestionIconColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return 'text-gray-400'
      case 'customer': return 'text-primary-600'
      case 'asset': return 'text-secondary-500'
      case 'location': return 'text-success-600'
      default: return 'text-gray-400'
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query)
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false)
              inputRef.current?.blur()
            }
          }}
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <div className="py-2">
                {/* Section Header */}
                {!query && recentSearches.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Recent Searches</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.map((suggestion, index) => {
                  const IconComponent = getSuggestionIcon(suggestion.type)
                  return (
                    <motion.button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`p-2 rounded-lg bg-gray-50 ${getSuggestionIconColor(suggestion.type)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{suggestion.title}</p>
                        {suggestion.subtitle && (
                          <p className="text-sm text-gray-500 truncate">{suggestion.subtitle}</p>
                        )}
                      </div>
                      {suggestion.type === 'recent' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const updated = recentSearches.filter(s => s !== suggestion.title)
                            setRecentSearches(updated)
                            localStorage.setItem('recentSearches', JSON.stringify(updated))
                            setSuggestions(generateSuggestions(query))
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            ) : query ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent searches</p>
                <p className="text-xs text-gray-400 mt-1">Start typing to search</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SmartSearch