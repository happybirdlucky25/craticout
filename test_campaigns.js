// Test campaign creation using direct table operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjnhunrbzunwkfjivynl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbmh1bnJienVud2tmaml2eW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjc2ODEsImV4cCI6MjA2Nzk0MzY4MX0.Y_HzCbIXcWgTkhe7w0ts5hQUmEM_9eaT4UXoltunx8U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection by listing tables
    const { data, error } = await supabase
      .from('bills')
      .select('bill_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
    } else {
      console.log('✅ Supabase connection working!');
      console.log('📊 Found bills table with data');
      
      // Now test if campaigns table exists
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .limit(1);
        
      if (campaignError) {
        console.log('❌ Campaigns table does not exist:', campaignError.message);
        console.log('🔧 Need to create campaign tables manually in Supabase dashboard');
      } else {
        console.log('✅ Campaigns table exists!');
      }
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

testConnection();