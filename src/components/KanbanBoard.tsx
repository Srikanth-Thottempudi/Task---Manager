"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./TaskCard"
import { DraggableTaskCard } from "./DraggableTaskCard"
import { DroppableColumn } from "./DroppableColumn"

// Define what our task structure looks like
interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: Task['status']) => void
}

export function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  // Configure drag sensitivity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    })
  )

  // Define our columns
  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
    { id: 'done', title: 'Done', status: 'done' as const },
  ]

  // Get tasks for a specific column
  const getTasksForColumn = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  // Handle when dragging starts
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  // Handle when dragging ends
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const taskId = active.id as string
    let newStatus = over.id as string
    
    // Map column IDs to proper status values
    const statusMapping: { [key: string]: Task['status'] } = {
      'todo': 'todo',
      'in-progress': 'in-progress', 
      'done': 'done'
    }
    
    // Get the actual status value
    const mappedStatus = statusMapping[newStatus] || newStatus as Task['status']
    
    // Only update if status actually changed
    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== mappedStatus) {
      onTaskMove(taskId, mappedStatus)
    }
    
    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {column.title}
                  <span className="text-sm font-normal text-gray-500">
                    {getTasksForColumn(column.status).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DroppableColumn id={column.status}>
                  <SortableContext
                    items={getTasksForColumn(column.status).map(task => task.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div 
                      className="min-h-[200px] space-y-3"
                      data-status={column.status}
                      style={{ minHeight: '400px' }}
                    >
                      {getTasksForColumn(column.status).map(task => (
                        <DraggableTaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Drag overlay - shows the task being dragged */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}