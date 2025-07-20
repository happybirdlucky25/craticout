// Direct SQL execution to create campaign tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjnhunrbzunwkfjivynl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbmh1bnJienVud2tmaml2eW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjc2ODEsImV4cCI6MjA2Nzk0MzY4MX0.Y_HzCbIXcWgTkhe7w0ts5hQUmEM_9eaT4UXoltunx8U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCampaignTables() {
  try {
    console.log('🚀 Creating campaign tables...');
    
    // Create campaigns table
    console.log('Creating campaigns table...');
    const { error: campaignsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.campaigns (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT DEFAULT 'dev-user',
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (campaignsError) {
      console.error('❌ Failed to create campaigns table:', campaignsError);
      return;
    }
    
    // Create campaign_bills table
    console.log('Creating campaign_bills table...');
    const { error: billsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.campaign_bills (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
          bill_id TEXT NOT NULL,
          added_at TIMESTAMPTZ DEFAULT NOW(),
          notes TEXT,
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          UNIQUE(campaign_id, bill_id)
        );
      `
    });
    
    if (billsError) {
      console.error('❌ Failed to create campaign_bills table:', billsError);
      return;
    }
    
    // Create campaign_legislators table
    console.log('Creating campaign_legislators table...');
    const { error: legislatorsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.campaign_legislators (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
          people_id TEXT NOT NULL,
          role TEXT DEFAULT 'stakeholder' CHECK (role IN ('target', 'ally', 'opponent', 'stakeholder', 'sponsor')),
          added_at TIMESTAMPTZ DEFAULT NOW(),
          notes TEXT,
          UNIQUE(campaign_id, people_id)
        );
      `
    });
    
    if (legislatorsError) {
      console.error('❌ Failed to create campaign_legislators table:', legislatorsError);
      return;
    }
    
    console.log('✅ Campaign tables created successfully!');
    console.log('🎯 You can now test campaign creation at http://localhost:8093/campaigns');
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

createCampaignTables();