import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  event_type: string;
  article_id?: string;
  metadata?: Record<string, any>;
}

const VALID_EVENT_TYPES = [
  'article_view',
  'article_click', 
  'newsfeed_load',
  'article_share',
  'article_bookmark'
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse request body
    const body: AnalyticsRequest = await req.json();
    
    if (!body.event_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: event_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!VALID_EVENT_TYPES.includes(body.event_type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user from auth header (optional for analytics)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        
        const userClient = createClient(supabaseUrl, anonKey, {
          global: {
            headers: {
              Authorization: authHeader
            }
          }
        });
        
        const { data: { user } } = await userClient.auth.getUser();
        userId = user?.id || null;
      } catch (error) {
        // Continue without user ID if auth fails
        console.log('Auth error in analytics (proceeding anonymously):', error);
      }
    }

    // Initialize Supabase service client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate article exists if article_id is provided
    if (body.article_id) {
      const { data: article, error: articleError } = await supabase
        .from('rss_feed')
        .select('id')
        .eq('id', body.article_id)
        .single();

      if (articleError || !article) {
        return new Response(
          JSON.stringify({ error: 'Article not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Prepare analytics record
    const analyticsRecord = {
      event_type: body.event_type,
      article_id: body.article_id || null,
      user_id: userId,
      metadata: {
        ...body.metadata,
        timestamp: new Date().toISOString(),
        user_agent: req.headers.get('User-Agent') || null,
        referer: req.headers.get('Referer') || null
      }
    };

    // Insert analytics record
    const { error: insertError } = await supabase
      .from('internal_analytics')
      .insert(analyticsRecord);

    if (insertError) {
      console.error('Error inserting analytics:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to record analytics event',
          details: insertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_type: body.event_type,
        recorded_at: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in track-analytics:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});