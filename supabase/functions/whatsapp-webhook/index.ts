
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    // 1. Handle Webhook Verification (GET)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      // You should set this in your Edge Function secrets
      const verifyToken = Deno.env.get('WEBHOOK_VERIFY_TOKEN')

      if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
          console.log('WEBHOOK_VERIFIED')
          return new Response(challenge, {
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            status: 200,
          })
        } else {
          return new Response('Forbidden', { status: 403 })
        }
      }
      return new Response('Missing parameters', { status: 400 })
    }

    // 2. Handle Incoming Messages (POST)
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('Received webhook payload:', JSON.stringify(body, null, 2))

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Example payload structure check
      if (body.object === 'whatsapp_business_account') {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
          const message = body.entry[0].changes[0].value.messages[0]
          const contactPhone = message.from
          const messageContent = message.text ? message.text.body : '[Media/Other]'
          const waMessageId = message.id
          const messageType = message.type // 'text', 'image', etc.

          // Insert into chat_messages
          const { error } = await supabase.from('chat_messages').insert({
            contact_phone: contactPhone,
            direction: 'inbound',
            type: messageType,
            content: messageContent,
            wa_message_id: waMessageId,
            status: 'delivered'
          })

          if (error) {
            console.error('Error inserting message:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            })
          }

          // Mark as Read (Optional, but good practice)
          // await markAsRead(waMessageId);

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          })
        }
        
        // Handle Status Updates (sent, delivered, read)
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
             const statusUpdate = body.entry[0].changes[0].value.statuses[0];
             const waMessageId = statusUpdate.id;
             const newStatus = statusUpdate.status; // 'sent', 'delivered', 'read'

             const { error } = await supabase.from('chat_messages')
                .update({ status: newStatus })
                .eq('wa_message_id', waMessageId);

             if (error) console.error('Error updating status:', error);
             
             return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200 })
    }

    return new Response('Method not allowed', { status: 405 })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
