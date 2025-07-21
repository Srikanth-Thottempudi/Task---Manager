"use client"

import { useState, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { taskService, categoryService, Category } from "@/lib/supabase";
import { Moon, Sun, Filter } from "lucide-react";

export default function Home() {
  // Get authentication state
  const { user, loading, signOut } = useAuth();
  
  // Get theme state
  const { theme, toggleTheme } = useTheme();

  // useState hook to manage our tasks list
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Load tasks and categories when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadTasks();
      loadCategories();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getAllTasks();
      console.log('Raw tasks from database:', fetchedTasks);
      
      // Convert database format to component format
      const formattedTasks = fetchedTasks.map((task: any) => ({
        ...task,
        dueDate: task.due_date,
      }));
      console.log('Formatted tasks:', formattedTasks);
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Fallback to sample data if database fails
      setTasks([
        {
          id: "1",
          title: "Setup Supabase Database",
          description: "Follow the instructions to set up your Supabase project and database tables.",
          status: "todo" as const,
          priority: "high" as const,
          assignee: "You",
          dueDate: "2025-01-25"
        }
      ]);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // State to toggle between views
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  // Filter tasks based on selected category
  const filteredTasks = selectedCategoryFilter === 'all' 
    ? tasks 
    : selectedCategoryFilter === 'uncategorized'
    ? tasks.filter(task => !task.category_id)
    : tasks.filter(task => task.category_id === selectedCategoryFilter);


  // Function to add a new task to our list
  const handleAddTask = async (taskData: any) => {
    try {
      // Convert to database format
      const dbTask = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignee: taskData.assignee,
        due_date: taskData.dueDate,
        category_id: taskData.categoryId === 'none' ? null : taskData.categoryId,
      };
      
      const newTask = await taskService.createTask(dbTask);
      if (newTask) {
        // Add to local state with proper format
        setTasks(prev => [...prev, {
          ...newTask,
          dueDate: newTask.due_date,
        }]);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  // Function to move a task to a different status
  const handleTaskMove = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      // Find the task to see its current state
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }

      if (task.status === newStatus) {
        return; // No change needed
      }

      // Update in database
      const updatedTask = await taskService.updateTask(taskId, { status: newStatus });
      
      // Update local state only if database update succeeded
      if (updatedTask) {
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  // Function to handle task reordering within the same column
  const handleTaskReorder = (reorderedTasks: any[]) => {
    // The reorderedTasks should be the complete tasks array with proper reordering
    setTasks(reorderedTasks);
    
    // Note: In a production app, you'd want to persist the order to the database
    // This could be done by adding an 'order' or 'position' field to tasks
    // and updating it when reordering occurs
  };

  // Function to delete a task
  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const success = await taskService.deleteTask(taskId);
      
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        alert('Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="mobile-full-height ios-full-height dynamic-viewport bg-background p-4 sm:p-6 lg:p-8 transition-colors safe-area-padding ios-fix android-fix">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          {/* Mobile-first header layout */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                Task Manager
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground truncate">
                Welcome, {user.email?.split('@')[0]}!
              </p>
            </div>
            
            {/* Mobile-optimized action buttons */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
              {/* View toggle buttons */}
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="flex-1 sm:flex-none text-sm"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  onClick={() => setViewMode('kanban')}
                  className="flex-1 sm:flex-none text-sm"
                >
                  Kanban
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="p-2 w-10 h-10"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Sign out button - full width on mobile */}
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full sm:w-auto text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Mobile-optimized Category Filter */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 mobile-optimized">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </header>

        <main>
          {viewMode === 'grid' ? (
            <div className="flex flex-col space-y-6 lg:grid lg:grid-cols-4 lg:gap-8 lg:space-y-0">
              {/* Task Form - Full width on mobile, sidebar on desktop */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <TaskForm onSubmit={handleAddTask} />
              </div>
              
              {/* Tasks Display - Prioritized on mobile */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  {selectedCategoryFilter === 'all' ? 'All Tasks' : 
                   selectedCategoryFilter === 'uncategorized' ? 'Uncategorized Tasks' :
                   `${categories.find(c => c.id === selectedCategoryFilter)?.name || 'Category'} Tasks`} ({filteredTasks.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} onDelete={handleTaskDelete} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Task Form Row - Collapsible on mobile */}
              <div className="flex justify-center">
                <div className="w-full max-w-md mobile-optimized">
                  <TaskForm onSubmit={handleAddTask} />
                </div>
              </div>
              
              {/* Kanban Board - Mobile optimized */}
              <div className="-mx-4 sm:mx-0">
                <KanbanBoard 
                  key={`kanban-${selectedCategoryFilter}`} 
                  tasks={tasks} 
                  filteredTasks={filteredTasks}
                  onTaskMove={handleTaskMove} 
                  onTaskReorder={handleTaskReorder}
                  onTaskDelete={handleTaskDelete} 
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
