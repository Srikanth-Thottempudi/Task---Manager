"use client"

import { useState, useRef, useCallback } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  closestCorners,
  rectIntersection,
  getFirstCollision,
  pointerWithin,
  DragMoveEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./TaskCard"
import { DraggableTaskCard } from "./DraggableTaskCard"
import { DroppableColumn } from "./DroppableColumn"

import { Task } from "@/lib/supabase"

interface KanbanBoardProps {
  tasks: Task[] // Full tasks array for reordering logic
  filteredTasks: Task[] // Filtered tasks for display
  onTaskMove: (taskId: string, newStatus: Task['status']) => void
  onTaskReorder: (tasks: Task[]) => void
  onTaskDelete: (taskId: string) => void
}

export function KanbanBoard({ tasks, filteredTasks, onTaskMove, onTaskReorder, onTaskDelete }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll functionality
  const handleAutoScroll = useCallback((event: DragMoveEvent) => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    const scrollThreshold = 100
    const scrollSpeed = 10
    
    // Get current mouse/touch position from event delta
    const currentRect = event.active.rect.current.translated
    if (!currentRect) return
    
    const clientY = currentRect.top + currentRect.height / 2
    
    // Scroll up
    if (clientY < containerRect.top + scrollThreshold) {
      container.scrollTop -= scrollSpeed
    }
    // Scroll down
    else if (clientY > containerRect.bottom - scrollThreshold) {
      container.scrollTop += scrollSpeed
    }
  }, [])
  
  // Mobile-optimized drag sensitivity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags on mobile
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Longer delay for mobile to prevent conflicts with scrolling
        tolerance: 10, // More forgiving for finger touch
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // More forgiving collision detection
  const collisionDetection = (args: any) => {
    // Use rectangle intersection first for more forgiving targeting
    const rectCollisions = rectIntersection(args)
    
    if (rectCollisions.length > 0) {
      return rectCollisions
    }
    
    // Then try pointer within
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    
    // Finally, fall back to closest corners (more forgiving than closest center)
    return closestCorners(args)
  }

  // Define our columns
  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
    { id: 'done', title: 'Done', status: 'done' as const },
  ]

  // Get tasks for a specific column (from filtered tasks for display)
  const getTasksForColumn = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status)
  }

  // Handle drag over for better visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    // This helps with visual feedback during drag
  }

  // Handle when dragging starts
  const handleDragStart = (event: DragStartEvent) => {
    const task = filteredTasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
      navigator.vibrate(50) // Short vibration on drag start
    }
  }

  // Handle when dragging ends
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveTask(null)
    
    // Haptic feedback for successful drop
    if (over && 'vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
      navigator.vibrate([30, 50, 30]) // Success pattern
    }
    
    if (!over) {
      // Haptic feedback for failed drop
      if ('vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
        navigator.vibrate([100, 50, 100]) // Error pattern
      }
      return
    }
    
    const activeId = active.id as string
    const overId = over.id as string
    const activeTask = filteredTasks.find(t => t.id === activeId)
    
    if (!activeTask) return
    
    // Check if we're dropping on a column (status change)
    const validStatuses: Task['status'][] = ['todo', 'in-progress', 'done']
    if (validStatuses.includes(overId as Task['status'])) {
      const newStatus = overId as Task['status']
      if (activeTask.status !== newStatus) {
        onTaskMove(activeId, newStatus)
      }
      return
    }
    
    // Handle reordering within the same column
    const overTask = filteredTasks.find(t => t.id === overId)
    if (overTask && activeTask.status === overTask.status) {
      const columnTasks = getTasksForColumn(activeTask.status)
      const activeIndex = columnTasks.findIndex(t => t.id === activeId)
      const overIndex = columnTasks.findIndex(t => t.id === overId)
      
      if (activeIndex !== overIndex) {
        const reorderedColumnTasks = arrayMove(columnTasks, activeIndex, overIndex)
        
        // Rebuild the full tasks array with the new order for this column
        // We need to update the full tasks array, not just the filtered one
        const newTasks = tasks.map(task => {
          // Find if this task is in the reordered column tasks
          const reorderedTask = reorderedColumnTasks.find(rt => rt.id === task.id)
          return reorderedTask || task
        })
        
        onTaskReorder(newTasks)
      }
    }
  }

  return (
    <DndContext
      key={`dnd-${filteredTasks.map(t => t.id).join('-')}`}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragMove={handleAutoScroll}
      onDragEnd={handleDragEnd}
    >
      <div ref={scrollContainerRef} className="flex flex-col space-y-6 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 md:gap-6 sm:space-y-0 max-h-screen overflow-y-auto scroll-smooth px-4 sm:px-0">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col min-h-[400px] sm:min-h-[500px]">
            <Card className="flex-1">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      column.status === 'todo' ? 'bg-red-400' :
                      column.status === 'in-progress' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`} />
                    <span className="font-medium">{column.title}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full min-w-[24px] text-center">
                    {getTasksForColumn(column.status).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DroppableColumn id={column.status}>
                  <SortableContext
                    items={getTasksForColumn(column.status).map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div 
                      className="min-h-[300px] sm:min-h-[400px] space-y-3 p-3 sm:p-4 rounded-lg transition-all duration-200 ease-in-out relative w-full touch-manipulation"
                      data-status={column.status}
                      style={{
                        backgroundImage: getTasksForColumn(column.status).length === 0 
                          ? 'radial-gradient(circle at center, rgba(0,0,0,0.03) 1px, transparent 1px)'
                          : 'none',
                        backgroundSize: '20px 20px',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {getTasksForColumn(column.status).map(task => (
                        <DraggableTaskCard key={task.id} task={task} onDelete={onTaskDelete} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Enhanced drag overlay with better visual feedback */}
      <DragOverlay 
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
        style={{
          transformOrigin: '0 0',
        }}
      >
        {activeTask ? (
          <div className="transform rotate-2 scale-105 opacity-95 shadow-2xl ring-4 ring-blue-500/30 ring-offset-2 transition-all duration-200 animate-pulse">
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-xl p-1">
              <TaskCard task={activeTask} />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}