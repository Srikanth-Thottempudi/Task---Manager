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

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-250 ease-out rounded-lg relative min-h-full ${
        isOver 
          ? 'bg-primary/10 border-2 border-primary/50 border-dashed' 
          : active 
          ? 'border border-dashed border-muted-foreground/30 bg-muted/10'
          : ''
      }`}
      style={{
        // Make the drop zone extend beyond the visible area for easier targeting
        padding: '8px',
        margin: '-8px',
      }}
    >
      {/* Simple drop indicator */}
      {isOver && (
        <div className="absolute inset-2 pointer-events-none border border-primary/40 border-dashed rounded-md bg-primary/5">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-md"></div>
        </div>
      )}
      
      <div className="relative z-10" style={{ margin: '8px' }}>
        {children}
      </div>
    </div>
  )
}