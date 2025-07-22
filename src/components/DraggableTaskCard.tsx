"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCard } from "./TaskCard"
import { Task } from "@/lib/supabase"

interface DraggableTaskCardProps {
  task: Task
  onDelete?: (taskId: string) => void
}

export function DraggableTaskCard({ task, onDelete }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'all 250ms ease-out',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'manipulation',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none' as const,
    userSelect: 'none' as const,
    minHeight: '44px',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative cursor-grab active:cursor-grabbing touch-manipulation select-none transition-all duration-300 ${
        typeof window !== 'undefined' && window.innerWidth < 768
          ? 'hover:scale-[1.01] active:scale-[0.99] hover:shadow-lg'
          : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-primary/10'
      }`}
    >
      {/* Mobile-optimized drag handle indicator */}
      <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
        typeof window !== 'undefined' && window.innerWidth < 768
          ? 'left-1 opacity-60 group-active:opacity-100'
          : 'left-2 opacity-40 group-hover:opacity-80 group-active:opacity-100'
      }`}>
        <div className="flex flex-col gap-1">
          <div className={`bg-muted-foreground/60 rounded-full animate-pulse ${
            typeof window !== 'undefined' && window.innerWidth < 768 ? 'w-2 h-2' : 'w-1.5 h-1.5'
          }`} style={{animationDelay: '0ms'}}></div>
          <div className={`bg-muted-foreground/60 rounded-full animate-pulse ${
            typeof window !== 'undefined' && window.innerWidth < 768 ? 'w-2 h-2' : 'w-1.5 h-1.5'
          }`} style={{animationDelay: '200ms'}}></div>
          <div className={`bg-muted-foreground/60 rounded-full animate-pulse ${
            typeof window !== 'undefined' && window.innerWidth < 768 ? 'w-2 h-2' : 'w-1.5 h-1.5'
          }`} style={{animationDelay: '400ms'}}></div>
          <div className={`bg-muted-foreground/60 rounded-full animate-pulse ${
            typeof window !== 'undefined' && window.innerWidth < 768 ? 'w-2 h-2' : 'w-1.5 h-1.5'
          }`} style={{animationDelay: '600ms'}}></div>
        </div>
      </div>
      
      {/* Enhanced hover glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/8 to-primary/0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
      
      {/* Dragging state effects */}
      <div className={`relative transition-all duration-300 ${
        isDragging 
          ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-xl shadow-primary/20' 
          : 'hover:ring-1 hover:ring-primary/20 hover:ring-offset-1'
      }`}>
        <TaskCard task={task} onDelete={onDelete} />
      </div>
    </div>
  )
}