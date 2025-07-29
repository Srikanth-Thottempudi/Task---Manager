"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCard } from "./TaskCard"
import { Task } from "@/lib/supabase"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DraggableTaskCardProps {
  task: Task
  onDelete?: (taskId: string) => void
  onTaskMove?: (taskId: string, newStatus: Task['status']) => void
}

export function DraggableTaskCard({ task, onDelete, onTaskMove }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })
  
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: isMobile ? 'manipulation' : 'none',
    willChange: 'transform, opacity',
  }

  // Always enable drag functionality
  const dragProps = { ...attributes, ...listeners }
  
  // Override touch handlers to not interfere with dnd-kit on mobile
  const mobileProps = isMobile ? {
    style: { ...style, touchAction: 'manipulation' }
  } : {}
  
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...dragProps}
        {...mobileProps}
        className={`group relative select-none transition-all duration-200 ease-out ${
          isMobile 
            ? 'cursor-grab touch-manipulation active:scale-[0.98]'
            : 'cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1'
        } ${isDragging ? 'scale-[0.95] rotate-1' : ''}`}
      >
      {/* Enhanced desktop drag handle indicator */}
      {!isMobile && (
        <div className="absolute top-1/2 left-2 -translate-y-1/2 transition-all duration-300 z-10 opacity-0 group-hover:opacity-80 group-active:opacity-100">
          <div className="flex flex-col gap-0.5 p-1 rounded bg-white/80 shadow-sm">
            <div className="w-1 h-1 bg-gray-400 rounded-full transition-colors duration-200 group-hover:bg-blue-500"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full transition-colors duration-200 group-hover:bg-blue-500" style={{transitionDelay: '50ms'}}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full transition-colors duration-200 group-hover:bg-blue-500" style={{transitionDelay: '100ms'}}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full transition-colors duration-200 group-hover:bg-blue-500" style={{transitionDelay: '150ms'}}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full transition-colors duration-200 group-hover:bg-blue-500" style={{transitionDelay: '200ms'}}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full transition-colors duration-200 group-hover:bg-blue-500" style={{transitionDelay: '250ms'}}></div>
          </div>
        </div>
      )}
      
      {/* Enhanced mobile drag indicator */}
      {isMobile && (
        <div className="absolute top-2 right-2 text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full transition-all duration-200 z-10 opacity-70 shadow-sm border border-blue-200/50">
          ✋ Drag
        </div>
      )}
      
      {/* Task card content */}
      <div className={`relative ${
        !isMobile ? 'group-hover:shadow-lg group-hover:ring-1 group-hover:ring-primary/20' : ''
      }`}>
        <TaskCard task={task} onDelete={onDelete} />
      </div>
    </div>
    </>
  )
}