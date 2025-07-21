import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CategoryBadge } from "@/components/CategoryBadge"
import { Trash2 } from "lucide-react"
import { Task } from "@/lib/supabase"

// This defines what props our TaskCard component accepts
interface TaskCardProps {
  task: Task
  onDelete?: (taskId: string) => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
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
    <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer touch-manipulation">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 flex-1">
            {task.title}
          </CardTitle>
          <Badge className={`${getPriorityColor(task.priority)} text-xs sm:text-sm shrink-0`}>
            {task.priority}
          </Badge>
        </div>
        {task.category && (
          <div className="mt-2">
            <CategoryBadge category={task.category} size="sm" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-2 sm:space-y-3">
        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3">
          {task.description}
        </p>
        
        <div className="flex justify-between items-center gap-2">
          <Badge className={`${getStatusColor(task.status)} text-xs sm:text-sm`}>
            {task.status.replace('-', ' ')}
          </Badge>
          
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            <Avatar className="h-6 w-6 sm:h-7 sm:w-7 shrink-0">
              <AvatarFallback className="text-xs sm:text-sm">
                {task.assignee.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs sm:text-sm text-muted-foreground truncate">
              {task.assignee}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
              className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}