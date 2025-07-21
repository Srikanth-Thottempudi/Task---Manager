-- Task Manager Database Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee text NOT NULL,
  due_date date NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create Update Trigger for Tasks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Public access - adjust based on your auth requirements)
-- Categories policies
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON categories FOR DELETE USING (true);

-- Tasks policies
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON tasks FOR DELETE USING (true);

-- 6. Insert Default Categories
INSERT INTO categories (name, color, description) VALUES 
  ('Work', '#3B82F6', 'Work-related tasks'),
  ('Personal', '#10B981', 'Personal tasks and activities'),
  ('Urgent', '#EF4444', 'High priority urgent tasks'),
  ('Learning', '#8B5CF6', 'Educational and skill development')
ON CONFLICT (name) DO NOTHING;

-- 7. Insert Sample Tasks (Optional - remove if you don't want sample data)
INSERT INTO tasks (title, description, status, priority, assignee, due_date, category_id) 
SELECT 
  'Welcome to Task Manager',
  'This is a sample task to get you started. You can edit or delete this task.',
  'todo',
  'medium',
  'You',
  CURRENT_DATE + INTERVAL '7 days',
  c.id
FROM categories c 
WHERE c.name = 'Work'
LIMIT 1;

INSERT INTO tasks (title, description, status, priority, assignee, due_date, category_id) 
SELECT 
  'Set up your Supabase database',
  'Configure your database tables and policies for the task manager application.',
  'done',
  'high',
  'You',
  CURRENT_DATE,
  c.id
FROM categories c 
WHERE c.name = 'Work'
LIMIT 1;

-- 8. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- 9. Create Views for Common Queries (Optional)
CREATE OR REPLACE VIEW tasks_with_categories AS
SELECT 
  t.*,
  c.name as category_name,
  c.color as category_color
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id;

-- Verification: Check if everything was created successfully
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('categories', 'tasks');

-- Show sample data
SELECT 'Sample categories:' as info;
SELECT name, color FROM categories LIMIT 5;

SELECT 'Sample tasks:' as info;
SELECT title, status, priority FROM tasks LIMIT 5;