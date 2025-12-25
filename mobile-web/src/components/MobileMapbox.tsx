'use client'

import { useRef, useEffect, useState } from 'react'
import type mapboxgl from 'mapbox-gl'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJ1Y2VieWFydWdhYmEiLCJhIjoiY21mZWRiNjhwMDV4NTJrczRpOW05czBkbiJ9.abnfEV8P531a4Rlgx73MWQ'

interface MobileMapboxProps {
  center: [number, number] // [lng, lat]
  zoom?: number
  markers?: { 
    lng: number
    lat: number
    color?: string
    popupText?: string
    workOrderId?: string
    status?: string
    priority?: string
  }[]
  height?: string
  onMarkerClick?: (workOrderId: string) => void
}

export const MobileMapbox = ({ 
  center, 
  zoom = 12, 
  markers = [], 
  height = '300px',
  onMarkerClick
}: MobileMapboxProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const createdMarkersRef = useRef<mapboxgl.Marker[]>([])
  const mapboxRef = useRef<typeof mapboxgl | null>(null)

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error("Mapbox API Key is not configured")
      setLoading(false)
      return
    }
    if (map.current || !mapContainer.current) return

    setLoading(true)
    setMapInitialized(false)

    // Dynamically import mapbox-gl only when needed
    let cancelled = false
    ;(async () => {
      try {
        const mod = await import('mapbox-gl')
        const mapboxgl = (mod as typeof import('mapbox-gl')).default ?? mod
        if (cancelled) return
        
        mapboxRef.current = mapboxgl
        mapboxRef.current.accessToken = MAPBOX_TOKEN
        
        map.current = new mapboxRef.current.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: zoom,
          attributionControl: false, // Hide attribution for mobile
        })

        map.current.on('load', () => {
          if (!cancelled) {
            setMapInitialized(true)
            setLoading(false)
          }
        })

        map.current.on('error', (e: mapboxgl.ErrorEvent) => {
          console.error('Mapbox GL JS Error:', e.error)
          if (!cancelled) {
            setMapInitialized(false)
            setLoading(false)
          }
        })

        // Add mobile-specific controls
        map.current.addControl(
          new mapboxRef.current.NavigationControl({
            showCompass: false,
            showZoom: true,
          }),
          'bottom-right'
        )

        // Add geolocation control
        map.current.addControl(
          new mapboxRef.current.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
          }),
          'bottom-right'
        )

      } catch (err: unknown) {
        console.error('Failed to load mapbox-gl dynamically:', err)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center, zoom])

  // Effect for adding/updating markers
  useEffect(() => {
    if (!mapInitialized || !map.current || !mapboxRef.current) return

    // Clear existing markers
    createdMarkersRef.current.forEach(m => m.remove())
    createdMarkersRef.current = []

    // Add new markers
    markers.forEach(markerData => {
      // Create custom marker element for better mobile experience
      const el = document.createElement('div')
      el.className = 'mobile-map-marker'
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = markerData.color || '#2563eb'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.fontSize = '10px'
      el.style.fontWeight = 'bold'
      el.style.color = 'white'

      // Add priority indicator
      if (markerData.priority === 'High') {
        el.style.border = '3px solid #ef4444'
        el.style.animation = 'pulse 2s infinite'
      }

      // Add status indicator
      const statusDot = document.createElement('div')
      statusDot.style.width = '8px'
      statusDot.style.height = '8px'
      statusDot.style.borderRadius = '50%'
      statusDot.style.backgroundColor = 'white'
      el.appendChild(statusDot)

      if (!mapboxRef.current) return

      const marker = new mapboxRef.current.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(map.current!)

      // Add click handler for mobile
      if (markerData.workOrderId && onMarkerClick) {
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onMarkerClick(markerData.workOrderId!)
        })
      }

      // Add popup for mobile
      if (markerData.popupText) {
        const popupContent = document.createElement('div')
        popupContent.style.color = '#000'
        popupContent.style.fontSize = '14px'
        popupContent.style.lineHeight = '1.4'
        popupContent.style.maxWidth = '250px'
        popupContent.innerHTML = markerData.popupText
        
        const popup = new mapboxRef.current.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '280px'
        }).setDOMContent(popupContent)
        
        marker.setPopup(popup)
      }

      createdMarkersRef.current.push(marker)
    })

    // Adjust map bounds to fit all markers
    if (markers.length > 0) {
      const bounds = new mapboxRef.current.LngLatBounds()
      markers.forEach(m => bounds.extend([m.lng, m.lat]))
      
      // Add padding for mobile
      map.current.fitBounds(bounds, { 
        padding: { top: 50, bottom: 50, left: 20, right: 20 },
        duration: 1000,
        maxZoom: 15
      })
    }

  }, [markers, mapInitialized, onMarkerClick])

  if (!MAPBOX_TOKEN) {
    return (
      <div 
        style={{ height }}
        className="flex items-center justify-center bg-gray-100 rounded-xl"
      >
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">⚠️</div>
          <p className="text-red-600 text-sm">Mapbox API Key not configured</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height }} className="rounded-xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Add CSS for marker animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}