// Run campaign system migration directly via Supabase client
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://sjnhunrbzunwkfjivynl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbmh1bnJienVud2tmaml2eW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjc2ODEsImV4cCI6MjA2Nzk0MzY4MX0.Y_HzCbIXcWgTkhe7w0ts5hQUmEM_9eaT4UXoltunx8U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Running campaign system migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250120000002_create_campaign_system.sql', 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
    } else {
      console.log('✅ Campaign system migration completed successfully!');
      console.log('📋 Created tables:');
      console.log('   - campaigns');
      console.log('   - campaign_bills');
      console.log('   - campaign_legislators');
      console.log('   - campaign_documents');
      console.log('   - campaign_notes');
      console.log('📁 Created storage bucket: campaign-documents');
    }
    
  } catch (err) {
    console.error('💥 Error running migration:', err);
  }
}

runMigration();