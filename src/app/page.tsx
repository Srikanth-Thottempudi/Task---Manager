"use client"

import { useState, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/lib/supabase";

export default function Home() {
  // Get authentication state
  const { user, loading, signOut } = useAuth();

  // useState hook to manage our tasks list
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Load tasks when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getAllTasks();
      console.log('Raw tasks from database:', fetchedTasks);
      
      // Convert database format to component format
      const formattedTasks = fetchedTasks.map(task => ({
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

  // State to toggle between views
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

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
  const handleTaskMove = async (taskId: string, newStatus: string) => {
    console.log('handleTaskMove called with:', { taskId, newStatus, type: typeof newStatus });
    
    try {
      // Find the task to see its current state
      const task = tasks.find(t => t.id === taskId);
      console.log('Found task:', task);
      
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // Validate the status value
      const validStatuses = ['todo', 'in-progress', 'done'];
      if (!validStatuses.includes(newStatus)) {
        console.error('Invalid status value:', newStatus);
        alert('Invalid status. Please try again.');
        return;
      }

      // Update in database
      console.log('Calling taskService.updateTask with:', { taskId, status: newStatus });
      const updatedTask = await taskService.updateTask(taskId, { status: newStatus as any });
      console.log('Database update result:', updatedTask);
      
      // Update local state only if database update succeeded
      if (updatedTask) {
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus as any }
              : task
          )
        );
        console.log('Local state updated successfully');
      } else {
        console.error('Database update failed - not updating local state');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Task Management System
              </h1>
              <p className="text-gray-600">
                Welcome back, {user.email}!
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                onClick={() => setViewMode('kanban')}
              >
                Kanban Board
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left side - Task Form */}
              <div className="lg:col-span-1">
                <TaskForm onSubmit={handleAddTask} />
              </div>
              
              {/* Right side - Tasks Display */}
              <div className="lg:col-span-3">
                <h2 className="text-xl font-semibold mb-4">
                  All Tasks ({tasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Task Form Row */}
              <div className="flex justify-center">
                <TaskForm onSubmit={handleAddTask} />
              </div>
              
              {/* Kanban Board */}
              <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
