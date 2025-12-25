'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { EmptyState } from '@/components/EmptyState'
import { EnhancedButton } from '@/components/EnhancedButton'
import { OptimizedLoader } from '@/components/OptimizedLoader'
import { 
  Car, Search, Battery, Calendar, 
  MapPin, User, Wrench, ChevronRight, Plus, Filter
} from 'lucide-react'
import { useHaptic } from '@/utils/haptic'
import { useBadges } from '@/context/BadgeContext'
import { supabase } from '@/lib/supabase'
import type { Vehicle, Customer } from '@/types/database'

interface Asset extends Vehicle {
  customers?: Customer | null
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'company' | 'customer' | 'emergency'>('all')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const { tap } = useHaptic()
  const { badges } = useBadges()

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select(`
            *,
            customers (id, name, phone, customer_type)
          `)
          .order('license_plate', { ascending: true })

        if (error) {
          console.error('Error fetching assets:', error)
        } else if (data) {
          setAssets(data as Asset[])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  const filteredAssets = assets.filter(asset => {
    const matchesFilter = filter === 'all' || 
      (filter === 'company' && asset.is_company_asset) ||
      (filter === 'customer' && !asset.is_company_asset) ||
      (filter === 'emergency' && asset.is_emergency_bike)
    
    const matchesSearch = searchQuery === '' || 
      asset.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.customers?.name && asset.customers.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const filterCounts = {
    all: assets.length,
    company: assets.filter(a => a.is_company_asset).length,
    customer: assets.filter(a => !a.is_company_asset).length,
    emergency: assets.filter(a => a.is_emergency_bike).length,
  }

  const getAssetTypeStyle = (asset: Asset) => {
    if (asset.is_emergency_bike) {
      return { backgroundColor: '#ff4d4f', color: 'white' }
    } else if (asset.is_company_asset) {
      return { backgroundColor: '#2f54eb', color: 'white' }
    } else {
      return { backgroundColor: '#52c41a', color: 'white' }
    }
  }

  const getAssetTypeLabel = (asset: Asset) => {
    if (asset.is_emergency_bike) return 'Emergency'
    if (asset.is_company_asset) return 'Company'
    return 'Customer'
  }

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Assets" />
      
      <main className="p-4 pb-24">
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All', count: filterCounts.all },
                { key: 'company', label: 'Company', count: filterCounts.company },
                { key: 'customer', label: 'Customer', count: filterCounts.customer },
                { key: 'emergency', label: 'Emergency', count: filterCounts.emergency },
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                    filter === tab.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.label} ({tab.count})
                </motion.button>
              ))}
            </div>
          </div>
        
        {/* Assets List */}
        <OptimizedLoader
          isLoading={loading}
          delay={100}
          minDisplayTime={200}
          fallback={
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          }
        >
          {filteredAssets.length === 0 ? (
          <EmptyState
            illustration="assets"
            title="No assets found"
            description={searchQuery 
              ? "No assets match your search criteria. Try adjusting your search terms or filters."
              : filter !== 'all'
                ? "No assets match the selected filter. Try selecting a different filter or add a new asset."
              : "No assets have been added yet. Start by adding your first asset to the system."
            }
            action={{
              label: searchQuery || filter !== 'all' ? 'Clear Filters' : 'Add Asset',
              onClick: () => {
                if (searchQuery || filter !== 'all') {
                  setSearchQuery('')
                  setFilter('all')
                } else {
                  window.location.href = '/assets/new'
                }
              },
              icon: searchQuery || filter !== 'all' ? <Filter className="w-4 h-4" /> : <Plus className="w-4 h-4" />
            }}
            secondaryAction={searchQuery || filter !== 'all' ? {
              label: 'Add Asset',
              onClick: () => window.location.href = '/assets/new',
              icon: <Plus className="w-4 h-4" />
            } : undefined}
          />
        ) : (
          <motion.div 
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAssets.map((asset) => {
              const isExpanded = expandedCards.has(asset.id)
              
              return (
                <motion.div
                  key={asset.id}
                  variants={itemVariants}
                  className="card-mobile hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Compact View - Critical Info Only */}
                  <motion.div 
                    className="p-4 cursor-pointer active:bg-gray-50"
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      tap()
                      setExpandedCards(prev => {
                        const newSet = new Set(prev)
                        if (newSet.has(asset.id)) {
                          newSet.delete(asset.id)
                        } else {
                          newSet.add(asset.id)
                        }
                        return newSet
                      })
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F8F5FC' }}>
                          <Car className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{asset.license_plate}</p>
                          <p className="text-sm text-gray-500 truncate">{asset.make} {asset.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={getAssetTypeStyle(asset)}
                        >
                          {getAssetTypeLabel(asset)}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Expanded Technical Details */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-4 space-y-3 border-t border-gray-100">
                      {/* Technical Specs Section */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700 mb-2">Technical Specs</p>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Wrench className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">VIN: {asset.vin}</span>
                        </div>
                        
                        {asset.year && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">Year: {asset.year}</span>
                          </div>
                        )}
                        
                        {asset.mileage && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">{asset.mileage.toLocaleString()} km</span>
                          </div>
                        )}
                        
                        {asset.battery_capacity && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Battery className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">{asset.battery_capacity} kWh battery</span>
                          </div>
                        )}
                      </div>

                      {/* Owner Info */}
                      {asset.customers && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Owner</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">{asset.customers.name}</span>
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      {(asset.date_of_manufacture || asset.created_at) && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {asset.date_of_manufacture && (
                            <span>Mfg: {new Date(asset.date_of_manufacture).getFullYear()}</span>
                          )}
                          {asset.created_at && (
                            <span>Added: {new Date(asset.created_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <EnhancedButton
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/assets/${asset.id}`
                        }}
                        fullWidth
                        size="md"
                      >
                        View Full Details & History
                      </EnhancedButton>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

          {/* Simplified Stats - Only show if relevant */}
          {!loading && assets.length > 0 && filterCounts.emergency > 0 && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🚨</span>
                </div>
                <div>
                  <p className="font-semibold text-red-900">{filterCounts.emergency} Emergency Bikes Available</p>
                  <p className="text-xs text-red-700">Ready for deployment</p>
                </div>
              </div>
            </motion.div>
          )}
        </main>
        
        {/* Quick Actions FAB */}
        <motion.div
          className="fixed bottom-20 right-4 z-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <EnhancedButton
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => window.location.href = '/assets/new'}
            className="rounded-full w-14 h-14 shadow-lg"
          >
          </EnhancedButton>
        </motion.div>
        
        <MobileNavigation activeTab="assets" badges={badges} />
      </div>
    )
}