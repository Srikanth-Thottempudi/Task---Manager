import { createClient } from '@supabase/supabase-js'

// These get the values from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-actual-anon-key-from-supabase'

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Define the structure of our tasks table
export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  due_date: string
  created_at: string
  updated_at: string
}

// Local storage fallback functions
const localStorageService = {
  async getAllTasks() {
    const tasks = localStorage.getItem('tasks')
    return tasks ? JSON.parse(tasks) : []
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const tasks = await this.getAllTasks()
    const newTask = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    tasks.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    return newTask
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const tasks = await this.getAllTasks()
    const taskIndex = tasks.findIndex((t: Task) => t.id === id)
    if (taskIndex >= 0) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updated_at: new Date().toISOString() }
      localStorage.setItem('tasks', JSON.stringify(tasks))
      return tasks[taskIndex]
    }
    return null
  },

  async deleteTask(id: string) {
    const tasks = await this.getAllTasks()
    const filteredTasks = tasks.filter((t: Task) => t.id !== id)
    localStorage.setItem('tasks', JSON.stringify(filteredTasks))
    return true
  }
}

// Database functions
export const taskService = {
  // Get all tasks
  async getAllTasks() {
    if (!supabase) return localStorageService.getAllTasks()
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return localStorageService.getAllTasks()
    }
    
    return data || []
  },

  // Create a new task
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) return localStorageService.createTask(task)
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      console.error('Error creating task:', error)
      return localStorageService.createTask(task)
    }
    
    return data?.[0]
  },

  // Update a task
  async updateTask(id: string, updates: Partial<Task>) {
    if (!supabase) return localStorageService.updateTask(id, updates)
    
    console.log('Updating task:', { id, updates }) // Debug log
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating task:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint
      })
      console.error('Update parameters:', { id, updates })
      return localStorageService.updateTask(id, updates)
    }
    
    console.log('Task updated successfully:', data?.[0]) // Debug log
    return data?.[0]
  },

  // Delete a task
  async deleteTask(id: string) {
    if (!supabase) return localStorageService.deleteTask(id)
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting task:', error)
      return localStorageService.deleteTask(id)
    }
    
    return true
  }
}