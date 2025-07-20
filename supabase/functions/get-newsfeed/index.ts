import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  canonical_link: string;
  domain: string;
  publication: string;
  author: string;
  pub_date: string;
  image_url?: string;
}

interface WeightedArticle extends RSSArticle {
  weight: number;
  up_votes: number;
  down_votes: number;
  user_vote?: string | null;
}

interface NewsfeedParams {
  limit?: number;
  offset?: number;
  maxPerDomain?: number;
}

// Calculate recency weight based on publication date
function calculateWeight(pubDate: string): number {
  const now = new Date();
  const articleDate = new Date(pubDate);
  const ageInHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
  
  if (ageInHours <= 24) return 4;      // Last 24 hours: 4x weight
  if (ageInHours <= 72) return 2;      // 1-3 days: 2x weight  
  if (ageInHours <= 168) return 1;     // 4-7 days: 1x weight
  return 0; // Exclude articles older than 7 days
}

// Ensure domain diversity by limiting articles per domain
function diversifyByDomain(articles: WeightedArticle[], maxPerDomain: number): WeightedArticle[] {
  const domainCounts: Record<string, number> = {};
  return articles.filter(article => {
    const count = domainCounts[article.domain] || 0;
    if (count < maxPerDomain) {
      domainCounts[article.domain] = count + 1;
      return true;
    }
    return false;
  });
}

// Weighted random shuffle
function weightedShuffle(articles: WeightedArticle[]): WeightedArticle[] {
  return articles
    .map(article => ({
      ...article,
      sortKey: Math.random() * article.weight
    }))
    .sort((a, b) => (b as any).sortKey - (a as any).sortKey)
    .map(({ sortKey, ...article }) => article);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const params: NewsfeedParams = {
      limit: parseInt(url.searchParams.get('limit') || '20'),
      offset: parseInt(url.searchParams.get('offset') || '0'),
      maxPerDomain: parseInt(url.searchParams.get('maxPerDomain') || '2')
    };

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If user is authenticated, get their ID
    if (authHeader) {
      try {
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
        console.log('Auth error (proceeding as anonymous):', error);
      }
    }

    // Get RSS articles from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: articles, error: articlesError } = await supabase
      .from('rss_feed')
      .select(`
        id,
        title,
        description,
        link,
        canonical_link,
        domain,
        publication,
        author,
        pub_date,
        image_url
      `)
      .gte('pub_date', sevenDaysAgo.toISOString())
      .order('pub_date', { ascending: false });

    if (articlesError) {
      throw new Error(`Failed to fetch articles: ${articlesError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ articles: [], total_count: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get vote counts for all articles
    const articleIds = articles.map(a => a.id);
    const { data: voteCounts, error: voteError } = await supabase
      .from('article_votes')
      .select('article_id, vote_type')
      .in('article_id', articleIds);

    if (voteError) {
      console.error('Error fetching vote counts:', voteError);
    }

    // Get user's votes if authenticated
    let userVotes: Record<string, string> = {};
    if (userId) {
      const { data: userVoteData, error: userVoteError } = await supabase
        .from('article_votes')
        .select('article_id, vote_type')
        .eq('user_id', userId)
        .in('article_id', articleIds);

      if (!userVoteError && userVoteData) {
        userVotes = userVoteData.reduce((acc, vote) => ({
          ...acc,
          [vote.article_id]: vote.vote_type
        }), {});
      }
    }

    // Calculate vote counts per article
    const voteCountsMap: Record<string, { up: number, down: number }> = {};
    if (voteCounts) {
      for (const vote of voteCounts) {
        if (!voteCountsMap[vote.article_id]) {
          voteCountsMap[vote.article_id] = { up: 0, down: 0 };
        }
        if (vote.vote_type === 'up') {
          voteCountsMap[vote.article_id].up++;
        } else if (vote.vote_type === 'down') {
          voteCountsMap[vote.article_id].down++;
        }
      }
    }

    // Add weights and vote counts to articles
    const weightedArticles: WeightedArticle[] = articles
      .map(article => ({
        ...article,
        weight: calculateWeight(article.pub_date),
        up_votes: voteCountsMap[article.id]?.up || 0,
        down_votes: voteCountsMap[article.id]?.down || 0,
        user_vote: userVotes[article.id] || null
      }))
      .filter(article => article.weight > 0); // Remove articles older than 7 days

    // Apply domain diversity
    const diversifiedArticles = diversifyByDomain(weightedArticles, params.maxPerDomain!);

    // Apply weighted randomization
    const shuffledArticles = weightedShuffle(diversifiedArticles);

    // Apply pagination
    const paginatedArticles = shuffledArticles.slice(
      params.offset!, 
      params.offset! + params.limit!
    );

    // Format response
    const responseArticles = paginatedArticles.map(({ weight, ...article }) => ({
      ...article,
      vote_counts: {
        up: article.up_votes,
        down: article.down_votes
      }
    }));

    // Log analytics event if user is authenticated
    if (userId) {
      await supabase
        .from('internal_analytics')
        .insert({
          event_type: 'newsfeed_load',
          user_id: userId,
          metadata: {
            articles_count: responseArticles.length,
            limit: params.limit,
            offset: params.offset
          }
        });
    }

    return new Response(
      JSON.stringify({
        articles: responseArticles,
        total_count: shuffledArticles.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-newsfeed:', error);
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