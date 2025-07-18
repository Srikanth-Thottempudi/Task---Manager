"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// This defines what data we need to create a new task
interface TaskFormData {
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
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
    dueDate: ''
  })

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
      dueDate: ''
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Status Select */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Input */}
          <div>
            <Label htmlFor="assignee">Assignee *</Label>
            <Input
              id="assignee"
              type="text"
              placeholder="Who is responsible?"
              value={formData.assignee}
              onChange={(e) => updateFormData('assignee', e.target.value)}
              required
            />
          </div>

          {/* Due Date Input */}
          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
              required
            />
          </div>

          {/* Form Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create Task
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}