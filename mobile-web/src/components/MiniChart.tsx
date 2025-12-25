'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DataPoint {
  value: number
  label?: string
}

interface MiniChartProps {
  data: DataPoint[]
  type?: 'line' | 'bar' | 'area'
  color?: string
  height?: number
  showTrend?: boolean
  className?: string
}

export function MiniChart({ 
  data, 
  type = 'line', 
  color = 'var(--brand-primary)', 
  height = 40,
  showTrend = true,
  className = '' 
}: MiniChartProps) {
  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  // Calculate trend
  const trend = data.length > 1 ? data[data.length - 1].value - data[0].value : 0
  const trendPercentage = data.length > 1 ? ((trend / data[0].value) * 100) : 0

  const getTrendIcon = () => {
    if (Math.abs(trendPercentage) < 1) return Minus
    return trendPercentage > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (Math.abs(trendPercentage) < 1) return 'text-gray-500'
    return trendPercentage > 0 ? 'text-green-500' : 'text-red-500'
  }

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = ((maxValue - point.value) / range) * 100
    return { x, y, value: point.value }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className={`relative ${className}`}>
      <svg 
        width="100%" 
        height={height} 
        viewBox="0 0 100 100" 
        className="overflow-visible"
      >
        {type === 'area' && (
          <motion.path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={color}
            fillOpacity={0.1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
        
        {type === 'line' && (
          <motion.path
            d={pathData}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}

        {type === 'bar' && (
          <g>
            {points.map((point, index) => (
              <motion.rect
                key={index}
                x={point.x - 2}
                y={point.y}
                width="4"
                height={100 - point.y}
                fill={color}
                initial={{ height: 0, y: 100 }}
                animate={{ height: 100 - point.y, y: point.y }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            ))}
          </g>
        )}

        {/* Data points for line chart */}
        {type === 'line' && (
          <g>
            {points.map((point, index) => (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="2"
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Trend Indicator */}
      {showTrend && data.length > 1 && (
        <div className={`absolute top-0 right-0 flex items-center space-x-1 text-xs ${getTrendColor()}`}>
          {(() => {
            const TrendIcon = getTrendIcon()
            return <TrendIcon className="w-3 h-3" />
          })()}
          <span className="font-medium">
            {Math.abs(trendPercentage).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default MiniChart