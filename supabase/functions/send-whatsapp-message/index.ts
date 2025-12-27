
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { phone, message } = await req.json()

        const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
        const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

        if (!whatsappToken || !phoneNumberId) {
            throw new Error('Missing WhatsApp configuration')
        }

        const response = await fetch(
            `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${whatsappToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone,
                    type: 'text',
                    text: { body: message },
                }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            console.error('WhatsApp API Error:', data);
            throw new Error(JSON.stringify(data));
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
