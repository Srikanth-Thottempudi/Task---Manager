-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read and write tasks
-- In production, you'd want more restrictive policies
CREATE POLICY "Enable all operations for all users" ON tasks
  FOR ALL USING (true);

-- Insert some sample data
INSERT INTO tasks (title, description, status, priority, assignee, due_date) VALUES
  ('Setup database', 'Configure Supabase database for the task management system', 'in-progress', 'high', 'Developer', '2025-01-25'),
  ('Design UI components', 'Create reusable UI components using shadcn/ui', 'done', 'medium', 'Designer', '2025-01-20'),
  ('Implement authentication', 'Add user login and registration functionality', 'todo', 'high', 'Developer', '2025-01-30');