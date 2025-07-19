import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  bill_id: string;
  force?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { bill_id, force = false }: RequestBody = await req.json()

    if (!bill_id || typeof bill_id !== 'string') {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Valid bill_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate bill exists
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('bill_id, bill_number, last_action_date')
      .eq('bill_id', bill_id)
      .single()

    if (billError || !bill) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Bill not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for existing analysis if not forced
    if (!force) {
      const { data: latestAnalysis } = await supabase
        .from('simple_bill_analysis')
        .select('id, created_at')
        .eq('bill_id', bill_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestAnalysis) {
        // Check if analysis is current (not stale)
        const analysisDate = new Date(latestAnalysis.created_at).toISOString().split('T')[0]
        const lastActionDate = bill.last_action_date ? new Date(bill.last_action_date).toISOString().split('T')[0] : null
        
        const isStale = lastActionDate && analysisDate < lastActionDate
        
        if (!isStale) {
          return new Response(
            JSON.stringify({ 
              status: 'current', 
              analysis_id: latestAnalysis.id 
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }
    }

    // Enqueue job by calling n8n webhook
    const n8nWebhookUrl = Deno.env.get('N8N_BILL_ANALYSIS_WEBHOOK_URL')
    
    if (!n8nWebhookUrl) {
      console.error('N8N_BILL_ANALYSIS_WEBHOOK_URL not configured')
      return new Response(
        JSON.stringify({ status: 'error', message: 'Analysis service not available' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bill_id: bill.bill_id,
        bill_number: bill.bill_number,
        timestamp: new Date().toISOString()
      })
    })

    if (!webhookResponse.ok) {
      console.error('Failed to enqueue n8n job:', await webhookResponse.text())
      return new Response(
        JSON.stringify({ status: 'error', message: 'Failed to start analysis' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ status: 'queued' }),
      { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in start_bill_analysis:', error)
    return new Response(
      JSON.stringify({ status: 'error', message: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})