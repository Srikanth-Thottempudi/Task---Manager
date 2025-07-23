import { createClient } from '@supabase/supabase-js'

// These get the values from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-actual-anon-key-from-supabase'

// Debug logging for production
if (typeof window !== 'undefined') {
  console.log('Supabase config check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing'
  })
}

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Define the structure of our categories table
export interface Category {
  id: string
  name: string
  color: string
  description?: string
  user_id: string
  created_at: string
}

// Define the structure of our tasks table
export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  due_date: string
  category_id?: string
  category?: Category
  user_id: string
  created_at: string
  updated_at: string
}

// Local storage fallback functions
const localStorageService = {
  async getAllCategories() {
    const categories = localStorage.getItem('categories')
    return categories ? JSON.parse(categories) : [
      { id: '1', name: 'Work', color: '#3B82F6', description: 'Work-related tasks', created_at: new Date().toISOString() },
      { id: '2', name: 'Personal', color: '#10B981', description: 'Personal tasks', created_at: new Date().toISOString() }
    ]
  },

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
export const categoryService = {
  // Get all categories for the current user
  async getAllCategories() {
    if (!supabase) return localStorageService.getAllCategories()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      return localStorageService.getAllCategories()
    }
    
    return data || []
  }
}

export const taskService = {
  // Get all tasks with categories for the current user
  async getAllTasks() {
    if (!supabase) return localStorageService.getAllTasks()
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return localStorageService.getAllTasks()
    }
    
    return data || []
  },

  // Create a new task
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    if (!supabase) return localStorageService.createTask(task as any)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      console.error('Error creating task:', error)
      return localStorageService.createTask(task as any)
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