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
    transition: isDragging ? 'none' : 'all 200ms ease-out',
    opacity: isDragging ? 0.6 : 1,
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
      className="group relative cursor-grab active:cursor-grabbing touch-manipulation select-none hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-150 active:scale-99 hover:shadow-md"
    >
      {/* Mobile-optimized drag handle indicator */}
      <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 opacity-30 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className={`relative ${isDragging ? 'ring-2 ring-blue-400 ring-offset-2' : ''} transition-all duration-200`}>
        <TaskCard task={task} onDelete={onDelete} />
      </div>
    </div>
  )
}