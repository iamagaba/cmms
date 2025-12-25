import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Navigation, 
  Clock, 
  MapPin, 
  ExternalLink,
  Route,
  Smartphone
} from 'lucide-react';
import { RouteOptimizationResult, RouteStats } from '../utils/routePlanning';
import { Coordinates, formatDistance } from '../utils/distance';

export interface RouteOptimizationPanelProps {
  optimizationResult: RouteOptimizationResult;
  routeStats: RouteStats | null;
  routeSummary: string;
  userLocation: Coordinates | null;
  onClose: () => void;
  onOpenInMaps: (provider?: 'google' | 'apple') => boolean;
}

export function RouteOptimizationPanel({
  optimizationResult,
  routeStats,
  routeSummary,
  userLocation,
  onClose,
  onOpenInMaps
}: RouteOptimizationPanelProps) {
  const handleOpenInMaps = (provider?: 'google' | 'apple') => {
    const success = onOpenInMaps(provider);
    if (!success) {
      alert('Failed to open map application. Please ensure you have a maps app installed.');
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="w-full bg-white rounded-t-2xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Optimized Route</h2>
              <p className="text-sm text-gray-500">
                {optimizationResult.optimizedOrder.length} work orders
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Route Stats */}
          {routeStats && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Route className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {formatDistance(routeStats.totalDistance)}
                  </p>
                  <p className="text-xs text-blue-700">Total Distance</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {formatDuration(routeStats.estimatedTravelTime)}
                  </p>
                  <p className="text-xs text-blue-700">Travel Time</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-blue-900">
                    {routeStats.totalStops}
                  </p>
                  <p className="text-xs text-blue-700">Stops</p>
                </div>
              </div>
            </div>
          )}

          {/* Route Summary */}
          {routeSummary && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <p className="text-sm text-green-800">{routeSummary}</p>
            </div>
          )}

          {/* Work Order List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Route Order</h3>
              <div className="space-y-3">
                {optimizationResult.optimizedOrder.map((workOrder, index) => (
                  <div key={workOrder.id} className="flex items-start space-x-3">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    
                    {/* Work Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {workOrder.customerName || 'Unknown Customer'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {workOrder.priority && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              workOrder.priority === 'High' ? 'bg-red-100 text-red-700' :
                              workOrder.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {workOrder.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1">
                        {workOrder.workOrderNumber}
                      </p>
                      
                      {workOrder.customerAddress && (
                        <div className="flex items-start space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {workOrder.customerAddress}
                          </p>
                        </div>
                      )}
                      
                      {/* Distance from previous stop */}
                      {index > 0 && optimizationResult.distances && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Navigation className="w-3 h-3 text-blue-500" />
                          <p className="text-xs text-blue-600">
                            {formatDistance(optimizationResult.distances[index - 1])} from previous
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOpenInMaps('google')}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">Google Maps</span>
              </button>
              
              <button
                onClick={() => handleOpenInMaps('apple')}
                className="flex items-center justify-center space-x-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span className="font-medium">Apple Maps</span>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Copy route summary to clipboard
                  if (navigator.clipboard && routeSummary) {
                    navigator.clipboard.writeText(routeSummary).then(() => {
                      alert('Route summary copied to clipboard');
                    }).catch(() => {
                      alert('Failed to copy route summary');
                    });
                  }
                }}
                className="flex-1 p-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Copy Summary
              </button>
              
              <button
                onClick={() => {
                  // Share route (if Web Share API is available)
                  if (navigator.share && routeSummary) {
                    navigator.share({
                      title: 'Optimized Route',
                      text: routeSummary
                    }).catch(() => {
                      // Fallback to clipboard
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(routeSummary);
                        alert('Route summary copied to clipboard');
                      }
                    });
                  } else if (navigator.clipboard && routeSummary) {
                    navigator.clipboard.writeText(routeSummary);
                    alert('Route summary copied to clipboard');
                  }
                }}
                className="flex-1 p-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Share Route
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center">
              Route optimization is based on distance and priority. Actual travel times may vary due to traffic conditions.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}