import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VoteRequest {
  article_id: string;
  vote_type: 'up' | 'down';
}

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
    const body: VoteRequest = await req.json();
    
    if (!body.article_id || !body.vote_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: article_id, vote_type' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['up', 'down'].includes(body.vote_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'vote_type must be "up" or "down"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if article exists in RSS feed
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

    // Upsert vote (replace existing vote if it exists)
    const { error: voteError } = await supabase
      .from('article_votes')
      .upsert({
        article_id: body.article_id,
        user_id: user.id,
        vote_type: body.vote_type,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'article_id,user_id'
      });

    if (voteError) {
      console.error('Error upserting vote:', voteError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to record vote',
          details: voteError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get updated vote counts for the article
    const { data: voteCounts, error: countError } = await supabase
      .from('article_votes')
      .select('vote_type')
      .eq('article_id', body.article_id);

    if (countError) {
      console.error('Error fetching vote counts:', countError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch vote counts',
          details: countError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate vote counts
    const upVotes = voteCounts?.filter(v => v.vote_type === 'up').length || 0;
    const downVotes = voteCounts?.filter(v => v.vote_type === 'down').length || 0;

    // Log analytics event
    try {
      await supabase
        .from('internal_analytics')
        .insert({
          event_type: 'article_vote',
          article_id: body.article_id,
          user_id: user.id,
          metadata: {
            vote_type: body.vote_type,
            previous_counts: { up: upVotes, down: downVotes }
          }
        });
    } catch (analyticsError) {
      // Don't fail the request if analytics fails
      console.warn('Failed to log analytics:', analyticsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        vote_counts: {
          up: upVotes,
          down: downVotes
        },
        user_vote: body.vote_type
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in vote-article:', error);
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