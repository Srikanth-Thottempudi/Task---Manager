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
  
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [longPressActive, setLongPressActive] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !onTaskMove) return
    
    // Prevent scrolling when long pressing
    e.preventDefault()
    
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true)
      setShowContextMenu(true)
      if ('vibrate' in navigator) {
        navigator.vibrate(20)
      }
    }, 500)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if user starts scrolling
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setLongPressActive(false)
  }
  
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setLongPressActive(false)
  }
  
  const handleContextMenuMove = (newStatus: Task['status']) => {
    if (onTaskMove) {
      onTaskMove(task.id, newStatus)
      if ('vibrate' in navigator) {
        navigator.vibrate(15)
      }
    }
    setShowContextMenu(false)
  }
  
  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'bg-red-100 text-red-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' }
  ] as const

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'all 250ms ease-out',
    opacity: isDragging ? 0.4 : showContextMenu ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: isMobile ? 'pan-y' : 'manipulation',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none' as const,
    userSelect: 'none' as const,
    minHeight: isMobile ? '60px' : '44px',
  }

  const mobileProps = isMobile ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  } : {}
  
  const dragProps = isMobile ? {} : { ...attributes, ...listeners }
  
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...dragProps}
        {...mobileProps}
        className={`group relative select-none transition-all duration-300 ${
          isMobile 
            ? 'cursor-pointer active:scale-[0.98] hover:shadow-md'
            : 'cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-primary/10'
        } ${longPressActive ? 'scale-[0.98] shadow-lg' : ''}`}
      >
      {/* Desktop drag handle indicator */}
      {!isMobile && (
        <div className="absolute top-1/2 left-2 -translate-y-1/2 transition-all duration-300 z-10 opacity-40 group-hover:opacity-80 group-active:opacity-100">
          <div className="flex flex-col gap-1">
            <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse" style={{animationDelay: '600ms'}}></div>
          </div>
        </div>
      )}
      
      {/* Mobile long press indicator */}
      {isMobile && (
        <div className={`absolute top-2 right-2 text-xs px-2 py-1 bg-muted/80 rounded-full transition-opacity duration-200 z-10 ${
          longPressActive ? 'opacity-100' : 'opacity-0'
        }`}>
          Hold to move
        </div>
      )}
      
      {/* Enhanced hover glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/8 to-primary/0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
      
      {/* Dragging state effects */}
      <div className={`relative transition-all duration-300 ${
        isDragging 
          ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-xl shadow-primary/20' 
          : isMobile ? '' : 'hover:ring-1 hover:ring-primary/20 hover:ring-offset-1'
      }`}>
        <TaskCard task={task} onDelete={onDelete} />
      </div>
    </div>
    
    {/* Mobile Context Menu Overlay */}
    {showContextMenu && isMobile && (
      <div 
        className="fixed inset-0 bg-black/40 z-[9999] flex items-end justify-center p-0"
        onClick={() => setShowContextMenu(false)}
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div 
          className="w-full bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[70vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-gray-900">Move Task</h3>
              <p className="text-sm text-gray-600 mt-1 truncate px-4">{task.title}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className={`w-full justify-start text-left h-14 text-base ${
                  task.status === option.value 
                    ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
                disabled={task.status === option.value}
                onClick={() => handleContextMenuMove(option.value)}
              >
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  option.value === 'todo' ? 'bg-red-400' :
                  option.value === 'in-progress' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`} />
                <span className="flex-1">{option.label}</span>
                {task.status === option.value && <span className="text-xs text-gray-500">(Current)</span>}
              </Button>
            ))}
          </div>
          <div className="p-4 pt-2 border-t border-gray-100">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base" 
              onClick={() => setShowContextMenu(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}