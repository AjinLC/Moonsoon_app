// Supabase Edge Function: delete-account
// Permanently deletes the calling user's auth account. All user rows
// (profiles, tarot_draws, tasks, goals) cascade via their FK constraints.
// Deploy with `supabase functions deploy delete-account`.
// Uses the auto-injected SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const auth = req.headers.get('Authorization') ?? '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!jwt) {
    return new Response('Missing authorization', { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !userResult.user) {
    return new Response('Invalid token', { status: 401, headers: corsHeaders });
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userResult.user.id);
  if (deleteError) {
    return new Response(`Delete failed: ${deleteError.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
