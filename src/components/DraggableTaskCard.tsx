"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCard } from "./TaskCard"
import { Task } from "@/lib/supabase"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createPortal } from "react-dom"

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
  const [showMovePopup, setShowMovePopup] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [longPressCompleted, setLongPressCompleted] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Long press handlers for mobile popup - ONLY triggers on 600ms+ hold
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !onTaskMove || isDragging || showMovePopup) return
    
    // Reset the completion flag
    setLongPressCompleted(false)
    
    // Don't prevent default to allow normal scrolling and tapping
    const touch = e.touches[0]
    setPopupPosition({ x: touch.clientX, y: touch.clientY })
    
    // Set timer for long press - will be cleared if user lifts finger or moves
    const timer = setTimeout(() => {
      // Mark that long press actually completed
      setLongPressCompleted(true)
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      setShowMovePopup(true)
      setLongPressTimer(null)
    }, 600) // 600ms - requires intentional long hold
    
    setLongPressTimer(timer)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear the timer if it's still running (meaning this was a tap, not a long press)
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
      setLongPressCompleted(false) // Ensure popup doesn't show for taps
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Clear timer on movement - prevents popup if user scrolls
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
      setLongPressCompleted(false) // Ensure popup doesn't show for scrolls
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    }
  }, [longPressTimer])

  const handleMoveToStatus = (newStatus: Task['status']) => {
    if (onTaskMove && task.status !== newStatus) {
      onTaskMove(task.id, newStatus)
      // Haptic feedback for successful move
      if ('vibrate' in navigator) {
        navigator.vibrate([15, 25, 15])
      }
    }
    setShowMovePopup(false)
    setLongPressCompleted(false) // Reset the flag
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : (isMobile ? 'pointer' : 'grab'),
    touchAction: isMobile ? 'manipulation' : 'none', // Allow proper touch interactions for dragging
    willChange: 'transform, opacity',
  }

  // On mobile, we'll use a wrapper to handle long-press separately from drag
  const dragProps = isMobile 
    ? { 
        ...attributes,
        // Don't add touch listeners directly to drag element on mobile
      }
    : { ...attributes, ...listeners }
  
  // Override touch handlers to not interfere with dnd-kit on mobile
  const mobileProps = isMobile ? {
    style: { ...style, touchAction: 'manipulation' }
  } : {}
  
  // Popup component for mobile task movement
  const MovePopup = () => {
    if (!showMovePopup || !isMobile || !longPressCompleted) return null

    const statusOptions = [
      { value: 'todo', label: 'To Do', color: 'bg-red-100 text-red-800' },
      { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
    ].filter(option => option.value !== task.status)

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div 
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 mx-4 max-w-sm w-full animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            animation: 'fadeInScale 0.2s ease-out'
          }}
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Move Task</h3>
            <p className="text-sm text-gray-600 truncate">{task.title}</p>
          </div>
          
          <div className="space-y-3 mb-4">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleMoveToStatus(option.value as Task['status'])}
                className={`w-full justify-start text-left py-3 px-4 rounded-xl border transition-all duration-200 ${option.color} hover:scale-[1.02] active:scale-[0.98]`}
                variant="ghost"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    option.value === 'todo' ? 'bg-red-400' :
                    option.value === 'in-progress' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`} />
                  <span className="font-medium">{option.label}</span>
                </div>
              </Button>
            ))}
          </div>
          
          <Button
            onClick={() => {
              setShowMovePopup(false)
              setLongPressCompleted(false) // Reset the flag
            }}
            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      </div>,
      document.body
    )
  }

  const MobileWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isMobile) return <>{children}</>
    
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          // Prevent any click handlers from triggering on mobile
          e.preventDefault()
          e.stopPropagation()
        }}
        className="relative"
      >
        {children}
      </div>
    )
  }

  return (
    <>
      <MobileWrapper>
        <div
          ref={setNodeRef}
          style={style}
          {...dragProps}
          {...(isMobile ? {} : listeners)} // Only add listeners on desktop
          {...mobileProps}
          tabIndex={isMobile ? -1 : undefined}
          className={`group relative select-none transition-all duration-200 ease-out ${
            isMobile 
              ? 'cursor-pointer touch-manipulation mobile-no-select mobile-no-hover-effects'
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
      
      
        {/* Task card content */}
        <div className={`relative ${
          !isMobile ? 'group-hover:shadow-lg group-hover:ring-1 group-hover:ring-primary/20' : 'mobile-no-hover-effects'
        }`}>
          <TaskCard task={task} onDelete={onDelete} />
        </div>
        </div>
      </MobileWrapper>
    
      {/* Mobile move popup */}
      <MovePopup />
    </>
  )
}