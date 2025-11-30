// Run database migration to make upload_drive_link optional
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://dswxwttfncjyraagcbci.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzd3h3dHRmbmNqeXJhYWdjYmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NjEyMzksImV4cCI6MjA3OTIzNzIzOX0.-kuqNooGOkmIcDEsVYGXBGlax98dlM3XkV8ccQQ-qIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running migration to make upload_drive_link optional...');
    
    const sql = readFileSync(join(process.cwd(), 'MIGRATION_MAKE_DRIVE_LINK_OPTIONAL.sql'), 'utf-8');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('upload_drive_link is now nullable in student_answer_sheets table');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();