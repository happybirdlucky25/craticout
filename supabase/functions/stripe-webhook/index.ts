import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the webhook body
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    // Verify webhook signature (using Stripe's webhook secret)
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret')
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Parse the Stripe event
    const event = JSON.parse(body)
    
    console.log('Received Stripe webhook:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Get customer email from the session
        const customerEmail = session.customer_details?.email || session.customer_email
        
        if (!customerEmail) {
          console.error('No customer email found in session')
          return new Response('No customer email', { status: 400 })
        }

        // Update user subscription status in Supabase
        const { data: user, error: userError } = await supabaseClient.auth.admin.getUserByEmail(customerEmail)
        
        if (userError || !user) {
          console.error('User not found:', customerEmail, userError)
          return new Response('User not found', { status: 404 })
        }

        // Update user metadata to premium
        const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              subscription: 'premium',
              stripe_customer_id: session.customer,
              subscription_id: session.subscription,
              subscription_status: 'active',
              upgraded_at: new Date().toISOString()
            }
          }
        )

        if (updateError) {
          console.error('Failed to update user:', updateError)
          return new Response('Failed to update user', { status: 500 })
        }

        console.log('Successfully upgraded user to premium:', customerEmail)
        break

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const subscription = event.data.object
        const customerId = subscription.customer

        // Find user by stripe customer ID and downgrade
        const { data: users, error: findError } = await supabaseClient
          .from('auth.users')
          .select('id, user_metadata')
          .eq('user_metadata->>stripe_customer_id', customerId)

        if (findError || !users || users.length === 0) {
          console.error('User not found for customer:', customerId)
          return new Response('User not found', { status: 404 })
        }

        const userToDowngrade = users[0]
        
        const { error: downgradeError } = await supabaseClient.auth.admin.updateUserById(
          userToDowngrade.id,
          {
            user_metadata: {
              ...userToDowngrade.user_metadata,
              subscription: 'free',
              subscription_status: 'canceled',
              canceled_at: new Date().toISOString()
            }
          }
        )

        if (downgradeError) {
          console.error('Failed to downgrade user:', downgradeError)
          return new Response('Failed to downgrade user', { status: 500 })
        }

        console.log('Successfully downgraded user to free:', customerId)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response('Webhook processed successfully', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook processing failed', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})