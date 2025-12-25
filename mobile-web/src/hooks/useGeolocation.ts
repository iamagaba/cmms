'use client'

import { useState, useEffect } from 'react'

export interface Coordinates {
  lat: number
  lng: number
}

interface GeolocationState {
  location: Coordinates | null
  error: string | null
  loading: boolean
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown'
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    permissionStatus: 'unknown'
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false,
        permissionStatus: 'denied'
      }))
      return
    }

    // Check permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setState(prev => ({
          ...prev,
          permissionStatus: result.state as 'granted' | 'denied' | 'prompt'
        }))
      })
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState(prev => ({
        ...prev,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        error: null,
        loading: false,
        permissionStatus: 'granted'
      }))
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unable to retrieve location'
      let permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown'

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user'
          permissionStatus = 'denied'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        permissionStatus
      }))
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)
  }, [])

  return {
    location: state.location,
    locationError: state.error,
    locationLoading: state.loading,
    permissionStatus: state.permissionStatus
  }
}