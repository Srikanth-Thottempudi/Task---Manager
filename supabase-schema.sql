-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies that allow everyone to read and write
-- In production, you'd want more restrictive policies
CREATE POLICY "Enable all operations for all users" ON categories
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for all users" ON tasks
  FOR ALL USING (true);

-- Insert default categories
INSERT INTO categories (name, color, description) VALUES
  ('Work', '#3B82F6', 'Work-related tasks and projects'),
  ('Personal', '#10B981', 'Personal tasks and activities');

-- Insert some sample data with categories
INSERT INTO tasks (title, description, status, priority, assignee, due_date, category_id) VALUES
  ('Setup database', 'Configure Supabase database for the task management system', 'in-progress', 'high', 'Developer', '2025-01-25', (SELECT id FROM categories WHERE name = 'Work')),
  ('Design UI components', 'Create reusable UI components using shadcn/ui', 'done', 'medium', 'Designer', '2025-01-20', (SELECT id FROM categories WHERE name = 'Work')),
  ('Implement authentication', 'Add user login and registration functionality', 'todo', 'high', 'Developer', '2025-01-30', (SELECT id FROM categories WHERE name = 'Work')),
  ('Code review meeting', 'Weekly team code review and planning session', 'todo', 'medium', 'Team Lead', '2025-01-22', (SELECT id FROM categories WHERE name = 'Work')),
  ('Deploy to production', 'Deploy the latest changes to production environment', 'todo', 'high', 'DevOps', '2025-01-28', (SELECT id FROM categories WHERE name = 'Work')),
  ('Update documentation', 'Update API documentation and user guides', 'in-progress', 'low', 'Technical Writer', '2025-01-26', (SELECT id FROM categories WHERE name = 'Work')),
  ('Grocery shopping', 'Buy groceries for the week', 'todo', 'medium', 'Self', '2025-01-21', (SELECT id FROM categories WHERE name = 'Personal')),
  ('Doctor appointment', 'Annual health checkup appointment', 'todo', 'high', 'Self', '2025-01-23', (SELECT id FROM categories WHERE name = 'Personal')),
  ('Exercise routine', 'Complete 30-minute workout session', 'done', 'medium', 'Self', '2025-01-20', (SELECT id FROM categories WHERE name = 'Personal')),
  ('Call family', 'Weekly family video call', 'in-progress', 'low', 'Self', '2025-01-22', (SELECT id FROM categories WHERE name = 'Personal')),
  ('Plan vacation', 'Research and plan summer vacation destinations', 'todo', 'low', 'Self', '2025-02-01', (SELECT id FROM categories WHERE name = 'Personal'));