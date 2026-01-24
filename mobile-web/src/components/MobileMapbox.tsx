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
      // Create custom marker element with motorbike icon for mobile
      const el = document.createElement('div')
      el.className = 'mobile-map-marker'
      el.style.width = '26px'
      el.style.height = '26px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = markerData.color || '#2563eb'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.position = 'relative'

      // Add wrench icon (maintenance)
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      `

      // Add priority indicator
      if (markerData.priority === 'High' || markerData.priority === 'Critical') {
        const priorityDot = document.createElement('div')
        priorityDot.style.position = 'absolute'
        priorityDot.style.top = '-1px'
        priorityDot.style.right = '-1px'
        priorityDot.style.width = '9px'
        priorityDot.style.height = '9px'
        priorityDot.style.borderRadius = '50%'
        priorityDot.style.backgroundColor = markerData.priority === 'Critical' ? '#dc2626' : '#f59e0b'
        priorityDot.style.border = '2px solid white'
        priorityDot.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)'
        el.appendChild(priorityDot)
        
        if (markerData.priority === 'Critical') {
          el.style.animation = 'pulse 2s infinite'
        }
      }

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