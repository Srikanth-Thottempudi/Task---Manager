"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { categoryService, Category } from "@/lib/supabase"

// This defines what data we need to create a new task
interface TaskFormData {
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  categoryId: string
}

// This defines what props our TaskForm component accepts
interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void
  onCancel?: () => void
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  // React useState hook - stores form data and allows us to update it
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    categoryId: 'none'
  })

  // State for categories
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryService.getAllCategories()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Prevents page refresh
    
    // Basic validation - check if required fields are filled
    if (!formData.title || !formData.assignee || !formData.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    // Call the onSubmit function passed from parent with form data
    onSubmit(formData)
    
    // Reset form after submission
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      categoryId: 'none'
    })
  }

  // Function to update form data when user types
  const updateFormData = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({
      ...prev, // Keep all existing data
      [field]: value // Update only the changed field
    }))
  }

  return (
    <Card className="w-full max-w-md mobile-optimized">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title Input */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              required
              className="mobile-optimized touch-target mt-1"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Description Textarea */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={3}
              className="mobile-optimized touch-target mt-1 resize-none"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Status Select */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
              <SelectTrigger className="mobile-optimized touch-target" style={{ fontSize: '16px' }}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Select */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
              <SelectTrigger className="mobile-optimized touch-target" style={{ fontSize: '16px' }}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Select */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.categoryId} onValueChange={(value) => updateFormData('categoryId', value)}>
              <SelectTrigger className="mobile-optimized touch-target" style={{ fontSize: '16px' }}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? (
                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Input */}
          <div>
            <Label htmlFor="assignee" className="text-sm font-medium">Assignee *</Label>
            <Input
              id="assignee"
              type="text"
              placeholder="Who is responsible?"
              value={formData.assignee}
              onChange={(e) => updateFormData('assignee', e.target.value)}
              required
              className="mobile-optimized touch-target mt-1"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Due Date Input */}
          <div>
            <Label htmlFor="dueDate" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Due Date *
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
              required
              className="mobile-optimized touch-target mt-1 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Form Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1 touch-target"
              style={{ minHeight: '44px' }}
            >
              Create Task
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="touch-target"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}