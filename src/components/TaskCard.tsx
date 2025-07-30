import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/CategoryBadge"
import { Trash2 } from "lucide-react"
import { Task } from "@/lib/supabase"
import { useState, useEffect } from "react"

// This defines what props our TaskCard component accepts
interface TaskCardProps {
  task: Task
  onDelete?: (taskId: string) => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Function to determine badge color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Function to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Card 
      className={`w-full transition-shadow cursor-pointer touch-manipulation ${
        !isMobile ? 'hover:shadow-lg' : 'mobile-no-hover-effects'
      }`}
      tabIndex={isMobile ? -1 : undefined}
      style={isMobile ? {
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        outline: 'none'
      } : undefined}
    >
      <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xs sm:text-base font-semibold line-clamp-2 flex-1 leading-tight">
            {task.title}
          </CardTitle>
          <Badge className={`${getPriorityColor(task.priority)} text-xs shrink-0 px-1 py-0.5`}>
            {task.priority}
          </Badge>
        </div>
        {task.category && (
          <div className="mt-1 sm:mt-2">
            <CategoryBadge category={task.category} size="sm" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-1.5 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        <p className="text-xs sm:text-base text-muted-foreground line-clamp-1 sm:line-clamp-3 leading-tight">
          {task.description}
        </p>
        
        <div className="flex justify-between items-center gap-2">
          <Badge className={`${getStatusColor(task.status)} text-xs px-1 py-0.5`}>
            {task.status.replace('-', ' ')}
          </Badge>
          
          <div className="flex items-center space-x-1 min-w-0">
            <Avatar className="h-5 w-5 sm:h-7 sm:w-7 shrink-0">
              <AvatarFallback className="text-xs sm:text-sm">
                {task.assignee.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[80px] sm:max-w-none">
              {task.assignee}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground truncate">
            Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors touch-manipulation"
              style={{ minHeight: '32px', minWidth: '32px' }}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}