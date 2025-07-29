"use client"

import { useDroppable } from "@dnd-kit/core"
import { ReactNode, useState, useEffect } from "react"

interface DroppableColumnProps {
  id: string
  children: ReactNode
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
  })
  
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [showDropIndicator, setShowDropIndicator] = useState(false)
  
  useEffect(() => {
    if (isOver) {
      setIsHighlighted(true)
      setShowDropIndicator(true)
      // Add haptic feedback for mobile
      if ('vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
        navigator.vibrate(15) // Gentler vibration
      }
    } else {
      setShowDropIndicator(false)
      const timer = setTimeout(() => setIsHighlighted(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOver])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-300 ease-out rounded-lg relative min-h-full ${
        isOver 
          ? isMobile
            ? 'bg-blue-50 border-2 border-blue-400 border-dashed shadow-lg scale-[1.02]'
            : 'bg-blue-50/50 border-2 border-blue-300 border-dashed shadow-md scale-[1.01]'
          : active 
          ? isMobile
            ? 'border border-dashed border-blue-300/50 bg-blue-50/30'
            : 'border border-dashed border-blue-200/40 bg-blue-50/20'
          : ''
      }`}
      style={{
        // Performance optimizations
        transform: isOver ? (isMobile ? 'translateZ(0) scale(1.02)' : 'translateZ(0) scale(1.01)') : 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform, background-color, border-color',
      }}
    >
      {/* Enhanced drop indicator */}
      {isOver && (
        <div className={`absolute pointer-events-none border-dashed rounded-lg animate-pulse ${
          isMobile 
            ? 'inset-2 border-2 border-blue-400/60 bg-blue-100/20'
            : 'inset-1 border border-blue-300/50 bg-blue-50/30'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-blue-50/10 rounded-lg"></div>
          {isMobile && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 font-semibold text-sm bg-white/95 px-4 py-2 rounded-full shadow-lg border border-blue-200/50 animate-bounce">
              📥 Drop Here
            </div>
          )}
          {!isMobile && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-blue-500 text-xs font-medium bg-white/90 px-2 py-1 rounded shadow-sm">
              Drop zone
            </div>
          )}
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}