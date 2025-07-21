// Simple Supabase Connection Test
// Run this script to verify your Supabase configuration

const { createClient } = require('@supabase/supabase-js')

// Load environment variables (you can also run this in browser console)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aewpwexqhuenlkuldfjn.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld3B3ZXhxaHVlbmxrdWxkZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzExMjcsImV4cCI6MjA2ODQwNzEyN30.Pd9wC-WaKlXmtFOwIKlucDwrco4NIWCDW_hsrAEl3Yg'

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables')
    return
  }
  
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test 1: Get categories
    console.log('\n📋 Testing categories table...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    if (catError) {
      console.error('❌ Categories error:', catError.message)
    } else {
      console.log('✅ Categories fetched:', categories?.length || 0, 'records')
      if (categories?.length > 0) {
        console.log('   Sample:', categories[0].name)
      }
    }
    
    // Test 2: Get tasks
    console.log('\n📝 Testing tasks table...')
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5)
    
    if (taskError) {
      console.error('❌ Tasks error:', taskError.message)
    } else {
      console.log('✅ Tasks fetched:', tasks?.length || 0, 'records')
      if (tasks?.length > 0) {
        console.log('   Sample:', tasks[0].title)
      }
    }
    
    // Test 3: Create test task (will be cleaned up)
    console.log('\n➕ Testing task creation...')
    const testTask = {
      title: 'Connection Test Task',
      description: 'This task verifies the database connection',
      status: 'todo',
      priority: 'low',
      assignee: 'Test User',
      due_date: new Date().toISOString().split('T')[0]
    }
    
    const { data: newTask, error: createError } = await supabase
      .from('tasks')
      .insert([testTask])
      .select()
    
    if (createError) {
      console.error('❌ Create error:', createError.message)
    } else {
      console.log('✅ Task created successfully')
      
      // Clean up test task
      if (newTask && newTask[0]) {
        await supabase
          .from('tasks')
          .delete()
          .eq('id', newTask[0].id)
        console.log('🧹 Test task cleaned up')
      }
    }
    
    console.log('\n🎉 Connection test completed!')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

// Run the test
testConnection()

module.exports = { testConnection }