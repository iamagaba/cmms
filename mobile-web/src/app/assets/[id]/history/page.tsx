'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { 
  Wrench, User, Clock, CheckCircle2, 
  Package, FileText, Car, Phone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { WorkOrder, Vehicle } from '@/types/database'

interface RepairHistory extends WorkOrder {
  vehicles?: Vehicle | null
}

export default function AssetHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = useState<Vehicle | null>(null)
  const [repairHistory, setRepairHistory] = useState<RepairHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'recent'>('all')

  useEffect(() => {
    const fetchAssetAndHistory = async () => {
      if (!params.id) return

      setLoading(true)
      
      try {
        // Fetch asset details
        const { data: assetData, error: assetError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', params.id)
          .single()

        if (assetError) {
          console.error('Error fetching asset:', assetError)
        } else if (assetData) {
          setAsset(assetData as Vehicle)
        }

        // Fetch repair history (work orders for this vehicle)
        const { data: historyData, error: historyError } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (id, name, phone),
            technicians (id, name, phone),
            locations (id, name, address)
          `)
          .eq('vehicleId', params.id)
          .order('created_at', { ascending: false })

        if (historyError) {
          console.error('Error fetching repair history:', historyError)
        } else if (historyData) {
          setRepairHistory(historyData as RepairHistory[])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssetAndHistory()
  }, [params.id])

  const filteredHistory = repairHistory.filter(order => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    switch (filter) {
      case 'completed':
        return order.status === 'Completed'
      case 'recent':
        return order.created_at && new Date(order.created_at) >= thirtyDaysAgo
      default:
        return true
    }
  })

  const getStatusStyle = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Confirmation':
        return 'bg-purple-100 text-purple-800'
      case 'Ready':
        return 'bg-cyan-100 text-cyan-800'
      case 'On Hold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityStyle = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white'
      case 'Medium':
        return 'bg-blue-500 text-white'
      case 'Low':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
    if (diffHours < 24) {
      return `${diffHours} hours`
    } else {
      const diffDays = Math.round(diffHours / 24)
      return `${diffDays} days`
    }
  }

  const totalRepairs = repairHistory.length
  const completedRepairs = repairHistory.filter(r => r.status === 'Completed').length
  const avgRepairTime = repairHistory
    .filter(r => r.work_started_at && r.completedAt)
    .reduce((acc, r) => {
      const duration = calculateDuration(r.work_started_at, r.completedAt)
      if (duration && duration.includes('hours')) {
        return acc + parseInt(duration)
      }
      return acc
    }, 0) / repairHistory.filter(r => r.work_started_at && r.completedAt).length || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Repair History" showBack onBack={() => router.back()} />
        <main className="px-4 py-6 pb-20">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </main>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title={`${asset?.license_plate || 'Asset'} History`}
        showBack 
        onBack={() => router.back()} 
      />
      
      <main className="px-4 py-6 pb-20 space-y-6">
        {/* Asset Summary */}
        {asset && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{asset.license_plate}</h2>
                <p className="text-gray-600">{asset.year} {asset.make} {asset.model}</p>
              </div>
            </div>
            
            {/* Repair Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalRepairs}</p>
                <p className="text-xs text-gray-500">Total Repairs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedRepairs}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {avgRepairTime > 0 ? Math.round(avgRepairTime) : 0}h
                </p>
                <p className="text-xs text-gray-500">Avg Time</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All History', count: repairHistory.length },
            { key: 'completed', label: 'Completed', count: completedRepairs },
            { key: 'recent', label: 'Recent (30d)', count: repairHistory.filter(r => {
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return r.created_at && new Date(r.created_at) >= thirtyDaysAgo
            }).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                filter === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Repair History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No repair history</h3>
            <p className="text-gray-500">This asset has no recorded repairs yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((repair) => (
              <div
                key={repair.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                onClick={() => window.location.href = `/work-orders/${repair.id}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{repair.workOrderNumber}</p>
                      <p className="text-sm text-gray-500">{formatDate(repair.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {repair.priority && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityStyle(repair.priority)}`}>
                        {repair.priority}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(repair.status)}`}>
                      {repair.status}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3 mb-4">
                  {repair.service && (
                    <div>
                      <p className="text-sm text-gray-500">Service Type</p>
                      <p className="text-base font-medium text-gray-900">{repair.service}</p>
                    </div>
                  )}
                  {repair.initialDiagnosis && (
                    <div>
                      <p className="text-sm text-gray-500">Diagnosis</p>
                      <p className="text-base text-gray-900 line-clamp-2">{repair.initialDiagnosis}</p>
                    </div>
                  )}
                </div>

                {/* Technician */}
                {repair.technicians && (
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Technician: {repair.technicians.name}</span>
                    {repair.technicians.phone && (
                      <a 
                        href={`tel:${repair.technicians.phone}`}
                        className="ml-auto text-purple-600 hover:text-purple-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Parts Used */}
                {repair.partsUsed && repair.partsUsed.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Parts Used:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {repair.partsUsed.slice(0, 3).map((part, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                        >
                          {part.name} (x{part.quantity})
                        </span>
                      ))}
                      {repair.partsUsed.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                          +{repair.partsUsed.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {repair.work_started_at && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Started: {formatDate(repair.work_started_at)}</span>
                        </div>
                      )}
                      {repair.completedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span>Completed: {formatDate(repair.completedAt)}</span>
                        </div>
                      )}
                    </div>
                    {repair.work_started_at && repair.completedAt && (
                      <span className="font-medium text-gray-700">
                        Duration: {calculateDuration(repair.work_started_at, repair.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Maintenance Insights */}
        {repairHistory.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Insights</h3>
            </div>
            
            <div className="space-y-4">
              {/* Most Common Issues */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Most Common Services</p>
                <div className="space-y-2">
                  {Object.entries(
                    repairHistory
                      .filter(r => r.service)
                      .reduce((acc, r) => {
                        acc[r.service!] = (acc[r.service!] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([service, count]) => (
                      <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{service}</span>
                        <span className="text-sm font-medium text-purple-600">{count}x</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Recent Activity</p>
                <div className="text-sm text-gray-700">
                  {repairHistory.length > 0 && (
                    <p>Last service: {formatDate(repairHistory[0].created_at)}</p>
                  )}
                  <p>Total repairs this year: {repairHistory.filter(r => {
                    const thisYear = new Date().getFullYear()
                    return r.created_at && new Date(r.created_at).getFullYear() === thisYear
                  }).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  )
}