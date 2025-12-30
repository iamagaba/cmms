'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { 
  Car, Battery, Calendar, MapPin, User, Phone, 
  Wrench, AlertCircle, FileText, Settings
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Vehicle, Customer } from '@/types/database'

interface Asset extends Vehicle {
  customers?: Customer | null
}

export default function AssetDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAsset = async () => {
      if (!params.id) return

      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select(`
            *,
            customers (id, name, phone, customer_type)
          `)
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Error fetching asset:', error)
        } else if (data) {
          setAsset(data as Asset)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAsset()
  }, [params.id])

  const getStatusStyle = (status: string | null | undefined) => {
    switch (status) {
      case 'In Repair':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Decommissioned':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Normal':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getAssetTypeLabel = (asset: Asset) => {
    if (asset.is_emergency_bike) return 'Emergency Bike'
    if (asset.is_company_asset) return 'Company Asset'
    return 'Customer Vehicle'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Asset Details" showBack onBack={() => router.back()} />
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

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Asset Details" showBack onBack={() => router.back()} />
        <main className="px-4 py-6 pb-20">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Not Found</h3>
            <p className="text-gray-500 mb-4">The asset you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.back()}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title={asset.license_plate} 
        showBack 
        onBack={() => router.back()} 
      />
      
      <main className="px-4 py-6 pb-20 space-y-4">
        {/* Asset Status Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center">
                <Car className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{asset.license_plate}</h2>
                <p className="text-gray-600">{asset.year} {asset.make} {asset.model}</p>
              </div>
            </div>
          </div>
          <div className={`px-4 py-3 rounded-xl border-2 ${getStatusStyle(asset.status)} font-semibold text-center`}>
            {asset.status || 'Normal'}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Car className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="text-base font-medium text-gray-900">{getAssetTypeLabel(asset)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Make & Model</p>
              <p className="text-base font-medium text-gray-900">{asset.make} {asset.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year</p>
              <p className="text-base font-medium text-gray-900">{asset.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">License Plate</p>
              <p className="text-base font-medium text-gray-900">{asset.license_plate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">VIN</p>
              <p className="text-base font-mono text-sm text-gray-900">{asset.vin}</p>
            </div>
            {asset.motor_number && (
              <div>
                <p className="text-sm text-gray-500">Motor Number</p>
                <p className="text-base font-mono text-sm text-gray-900">{asset.motor_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Technical Specs</h2>
          </div>
          <div className="space-y-3">
            {asset.battery_capacity && (
              <div className="flex items-center space-x-3">
                <Battery className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Battery Capacity</p>
                  <p className="text-base font-medium text-gray-900">{asset.battery_capacity} kWh</p>
                </div>
              </div>
            )}
            {asset.mileage && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Current Mileage</p>
                  <p className="text-base font-medium text-gray-900">{asset.mileage.toLocaleString()} km</p>
                </div>
              </div>
            )}
            {asset.date_of_manufacture && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Manufacture</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(asset.date_of_manufacture)}</p>
                </div>
              </div>
            )}
            {asset.release_date && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Release Date</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(asset.release_date)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Information */}
        {asset.customers && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Owner Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="text-base font-medium text-gray-900">{asset.customers.name}</p>
              </div>
              {asset.customers.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a 
                    href={`tel:${asset.customers.phone}`}
                    className="text-base font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{asset.customers.phone}</span>
                  </a>
                </div>
              )}
              {asset.customers.customer_type && (
                <div>
                  <p className="text-sm text-gray-500">Customer Type</p>
                  <p className="text-base font-medium text-gray-900">{asset.customers.customer_type}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Asset Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Wrench className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Asset Status</h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Company Asset</p>
                <p className="text-lg font-semibold text-gray-900">
                  {asset.is_company_asset ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Emergency Bike</p>
                <p className="text-lg font-semibold text-gray-900">
                  {asset.is_emergency_bike ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Record Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Record Information</h2>
          </div>
          <div className="space-y-3">
            {asset.created_at && (
              <div>
                <p className="text-sm text-gray-500">Added to System</p>
                <p className="text-base text-gray-900">{formatDate(asset.created_at)}</p>
              </div>
            )}
            {asset.updated_at && (
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-base text-gray-900">{formatDate(asset.updated_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => window.location.href = `/assets/${asset.id}/history`}
              className="bg-blue-600 text-white p-4 rounded-xl transition-colors hover:bg-blue-700 active:scale-95 flex items-center justify-center space-x-2"
            >
              <Wrench className="w-5 h-5" />
              <span className="font-semibold">Repair History</span>
            </button>
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  )
}