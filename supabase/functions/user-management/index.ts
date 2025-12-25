import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Authenticate the user making the request
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. Parse request body for methods that need it
    let requestBody = null;
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      requestBody = await req.json();
    }

    // 3. Check user role for authorization
    const userRole = user.user_metadata?.role;
    const isPrivilegedUser = userRole === 'admin' || userRole === 'superadmin';

    // Special case: Allow developer to grant themselves superadmin role
    if (req.method === 'PUT') {
      if (user.email === 'bbyarugaba@bodawerk.co.ug' && user.id === requestBody.id && requestBody.role === 'superadmin') {
        // This is the developer granting themselves superadmin. Allow it to proceed.
      } else if (!isPrivilegedUser) {
        // For all other role updates, the user must be an admin or superadmin.
        return new Response(JSON.stringify({ error: 'Forbidden: Not authorized to update roles' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }
    } else if (!isPrivilegedUser) {
      // For all other methods (GET, POST, DELETE), user must be an admin or superadmin.
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 4. Handle the specific request method
    switch (req.method) {
      case 'GET': { // List all users
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;
        return new Response(JSON.stringify(users), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      case 'POST': { // Create a new user
        const { email, password, role, full_name } = requestBody;
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role, full_name },
        });
        if (error) throw error;
        return new Response(JSON.stringify(data.user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }
      case 'PUT': { // Update a user's role
        const { id, role } = requestBody;
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
          user_metadata: { role },
        });
        if (error) throw error;
        return new Response(JSON.stringify(data.user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      case 'DELETE': { // Delete a user
        const { id } = requestBody;
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) throw error;
        return new Response(null, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 204,
        });
      }
      default:
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        });
    }
  } catch (e) {
    const error = e as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
