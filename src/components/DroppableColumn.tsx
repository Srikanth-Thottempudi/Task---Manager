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
        navigator.vibrate(25)
      }
    } else {
      setShowDropIndicator(false)
      const timer = setTimeout(() => setIsHighlighted(false), 150)
      return () => clearTimeout(timer)
    }
  }, [isOver])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-250 ease-out rounded-lg relative min-h-full ${
        isOver 
          ? isMobile
            ? 'bg-primary/20 border-4 border-primary/70 border-dashed shadow-lg'
            : 'bg-primary/10 border-2 border-primary/50 border-dashed'
          : active 
          ? isMobile
            ? 'border-2 border-dashed border-primary/40 bg-primary/5'
            : 'border border-dashed border-muted-foreground/30 bg-muted/10'
          : ''
      }`}
      style={{
        // Larger drop zone on mobile for easier targeting
        padding: isMobile ? '16px' : '8px',
        margin: isMobile ? '-16px' : '-8px',
        // Performance optimizations
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Enhanced mobile drop indicator */}
      {isOver && (
        <div className={`absolute pointer-events-none border-dashed rounded-md ${
          isMobile 
            ? 'inset-4 border-2 border-primary/60 bg-primary/15'
            : 'inset-2 border border-primary/40 bg-primary/5'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-md"></div>
          {isMobile && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary/70 font-bold text-sm">
              Drop Here
            </div>
          )}
        </div>
      )}
      
      <div className="relative z-10" style={{ margin: isMobile ? '16px' : '8px' }}>
        {children}
      </div>
    </div>
  )
}