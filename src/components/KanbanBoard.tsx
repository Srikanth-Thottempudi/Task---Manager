"use client"

import { useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
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
  getClientRect,
} from "@dnd-kit/core"
import type { Modifier } from "@dnd-kit/core"
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
  
  // Custom modifier to ensure drag overlay starts from exact position
  const customPositionModifier: Modifier = ({ transform, draggingNodeRect, activatorEvent }) => {
    if (!draggingNodeRect || !activatorEvent) {
      return transform
    }
    
    // Get the exact click position relative to the element
    const rect = draggingNodeRect
    const event = activatorEvent as PointerEvent | TouchEvent
    
    let offsetX = 0
    let offsetY = 0
    
    if ('clientX' in event) {
      // Mouse event
      offsetX = event.clientX - rect.left
      offsetY = event.clientY - rect.top
    } else if (event.touches && event.touches[0]) {
      // Touch event
      offsetX = event.touches[0].clientX - rect.left
      offsetY = event.touches[0].clientY - rect.top
    }
    
    return {
      ...transform,
      x: transform.x - (rect.width / 2 - offsetX),
      y: transform.y - (rect.height / 2 - offsetY),
    }
  }
  
  // Enhanced auto-scroll functionality with momentum and better mobile support
  const handleAutoScroll = useCallback((event: DragMoveEvent) => {
    // Find the page-level scroll container
    const pageScrollContainer = document.querySelector('.mobile-scroll-container')
    if (!pageScrollContainer) return
    
    const containerRect = pageScrollContainer.getBoundingClientRect()
    const isMobile = window.innerWidth < 768
    const scrollThreshold = isMobile ? 80 : 100
    const baseScrollSpeed = isMobile ? 8 : 10
    
    // Get current mouse/touch position from event delta
    const currentRect = event.active.rect.current.translated
    if (!currentRect) return
    
    const clientY = currentRect.top + currentRect.height / 2
    
    // Calculate dynamic scroll speed based on distance from edge
    const calculateScrollSpeed = (distance: number, threshold: number) => {
      const factor = Math.max(0, (threshold - distance) / threshold)
      return baseScrollSpeed * (0.5 + factor * 1.5) // Smoother acceleration
    }
    
    // Scroll up
    if (clientY < containerRect.top + scrollThreshold) {
      const distance = clientY - containerRect.top
      const speed = calculateScrollSpeed(distance, scrollThreshold)
      pageScrollContainer.scrollBy({ top: -speed, behavior: 'auto' })
    }
    // Scroll down
    else if (clientY > containerRect.bottom - scrollThreshold) {
      const distance = containerRect.bottom - clientY
      const speed = calculateScrollSpeed(distance, scrollThreshold)
      pageScrollContainer.scrollBy({ top: speed, behavior: 'auto' })
    }
  }, [])
  
  // Enhanced drag sensors for desktop and mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Very responsive
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // Quick response on mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Optimized collision detection for both mobile and desktop
  const collisionDetection = (args: any) => {
    // Start with pointer-based detection for precision
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    
    // Fall back to rectangle intersection for larger drop zones
    const rectCollisions = rectIntersection(args)
    if (rectCollisions.length > 0) {
      return rectCollisions
    }
    
    // Finally use closest center as last resort
    return closestCenter(args)
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
    console.log('Drag started:', event.active.id)
    const task = filteredTasks.find(t => t.id === event.active.id)
    console.log('Active task:', task)
    console.log('Drag start rect:', event.active.rect.current.translated)
    setActiveTask(task || null)
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
      navigator.vibrate(20)
    }
  }

  // Handle when dragging ends
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveTask(null)
    
    // Haptic feedback for successful drop
    if (over && 'vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
      navigator.vibrate([15, 25, 15]) // Reduced success pattern
    }
    
    if (!over) {
      // Haptic feedback for failed drop
      if ('vibrate' in navigator && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
        navigator.vibrate([25, 25, 25]) // Reduced error pattern
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
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: 'always',
        },
        dragOverlay: {
          measure: getClientRect,
        },
      }}
    >
      <div 
        ref={scrollContainerRef} 
        className="w-full max-h-[80vh] overflow-y-auto scroll-smooth mobile-scroll-container"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth',
          scrollSnapType: 'none',
        }}
      >
        {/* Mobile: Vertical Stack */}
        <div className="flex flex-col space-y-4 px-4 md:hidden pt-4 pb-8">
          {columns.map(column => (
            <div key={`mobile-${column.id}`} className="w-full kanban-column">
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        column.status === 'todo' ? 'bg-red-400' :
                        column.status === 'in-progress' ? 'bg-yellow-400' :
                        'bg-green-400'
                      }`} />
                      <span className="font-medium">{column.title}</span>
                    </div>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full min-w-[24px] text-center">
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
                        className="min-h-[200px] space-y-3 p-3 rounded-lg transition-all duration-200 ease-in-out relative w-full"
                        style={{
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          // Better mobile interaction
                          minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '180px' : '200px'
                        }}
                      >
                        {getTasksForColumn(column.status).map(task => (
                          <DraggableTaskCard key={task.id} task={task} onDelete={onTaskDelete} onTaskMove={onTaskMove} />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6 px-0">
          {columns.map(column => (
            <div key={column.id} className="flex flex-col min-h-[500px] w-full kanban-column">
              <Card className="flex-1">
                <CardHeader className="pb-3">
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
                      className="min-h-[200px] md:min-h-[400px] space-y-3 p-3 md:p-4 rounded-lg transition-all duration-200 ease-in-out relative w-full"
                      data-status={column.status}
                      style={{
                        backgroundImage: getTasksForColumn(column.status).length === 0 
                          ? 'radial-gradient(circle at center, rgba(0,0,0,0.03) 1px, transparent 1px)'
                          : 'none',
                        backgroundSize: '20px 20px',
                        WebkitOverflowScrolling: 'touch',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                      }}
                    >
                      {getTasksForColumn(column.status).map(task => (
                        <DraggableTaskCard key={task.id} task={task} onDelete={onTaskDelete} onTaskMove={onTaskMove} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </CardContent>
            </Card>
          </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced drag overlay with smooth animations */}
      <DragOverlay
        modifiers={[customPositionModifier]}
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        style={{
          cursor: 'grabbing',
        }}
      >
        {activeTask ? (
          <div 
            className="shadow-2xl bg-white rounded-xl overflow-hidden ring-2 ring-blue-400/40 ring-offset-2 ring-offset-white/50"
            style={{
              transform: 'rotate(1deg) scale(1.03)',
              transformOrigin: 'center',
              opacity: 0.96,
              backdropFilter: 'blur(1px)',
              transition: 'all 0.1s ease-out',
            }}
          >
            <div className="bg-gradient-to-br from-blue-50/50 to-transparent p-0.5">
              <TaskCard task={activeTask} />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}