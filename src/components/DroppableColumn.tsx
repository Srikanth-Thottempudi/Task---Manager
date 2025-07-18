"use client"

import { useDroppable } from "@dnd-kit/core"
import { ReactNode } from "react"

interface DroppableColumnProps {
  id: string
  children: ReactNode
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${
        isOver ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      {children}
    </div>
  )
}