"use client"

import { useDroppable } from "@dnd-kit/core"
import { ReactNode, useState, useEffect } from "react"

interface DroppableColumnProps {
  id: string
  children: ReactNode
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })
  
  const [isHighlighted, setIsHighlighted] = useState(false)
  
  useEffect(() => {
    if (isOver) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOver])

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ease-in-out rounded-xl relative overflow-hidden min-h-full ${
        isOver 
          ? 'bg-gradient-to-br from-blue-50 via-blue-25 to-white border-2 border-blue-400 border-dashed shadow-lg shadow-blue-200/25' 
          : 'border-2 border-transparent hover:bg-gray-50/30'
      }`}
      style={{
        // Make the drop zone extend beyond the visible area for easier targeting
        padding: '8px',
        margin: '-8px',
      }}
    >
      {/* Simpler feedback when dragging over */}
      {isOver && (
        <div className="absolute inset-2 pointer-events-none border-2 border-blue-300 border-dashed rounded-lg bg-blue-50/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent"></div>
        </div>
      )}
      
      <div className="relative z-10" style={{ margin: '8px' }}>
        {children}
      </div>
    </div>
  )
}