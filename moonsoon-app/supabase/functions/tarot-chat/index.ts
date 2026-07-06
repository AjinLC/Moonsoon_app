// Supabase Edge Function: tarot-chat
// Streams Groq llama-3.3-70b-versatile responses through SSE.
// Deploy with `supabase functions deploy tarot-chat`.
// Required env vars (set in Supabase dashboard → Functions → Secrets):
//   GROQ_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (for JWT verification)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DrawnCardLite {
  id: string;
  name: string;
  reversed: boolean;
  keywords: string[];
}

interface AstroContext {
  sunSign?: string;
  aspect?: string;
  mantra?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const POSITIONS = ['past', 'present', 'future'];

function buildSystemPrompt(drawnCards: DrawnCardLite[], astro: AstroContext, lang: string): string {
  const cardsLine = drawnCards
    .map((c, i) => {
      const pos = POSITIONS[i] ?? `card ${i + 1}`;
      const orient = c.reversed ? 'reversed' : 'upright';
      return `${c.name} (${orient}) — ${pos} — keywords: ${c.keywords.join(', ')}`;
    })
    .join('\n');

  const langName = lang === 'fr' ? 'French' : 'English';

  return [
    'You are a knowledgeable and empathetic tarot reader.',
    "Today's reading:",
    cardsLine,
    `Astrological context: ${astro.aspect ?? 'no notable transit'}. User's sun sign: ${astro.sunSign ?? 'unknown'}.`,
    astro.mantra ? `Linked mantra: "${astro.mantra}"` : '',
    `Respond in ${langName}.`,
    'Be direct and concrete, 80–120 words per response.',
    'Do not repeat the card names in every response. Adapt to the question asked.',
  ]
    .filter(Boolean)
    .join('\n');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // 1. Auth check
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

  // 2. Body
  let body: {
    messages?: ChatMessage[];
    drawnCards?: DrawnCardLite[];
    astroContext?: AstroContext;
    lang?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const drawnCards = Array.isArray(body.drawnCards) ? body.drawnCards : [];
  const astro = body.astroContext ?? {};
  const lang = body.lang === 'fr' ? 'fr' : 'en';

  // 3. System prompt
  const systemPrompt = buildSystemPrompt(drawnCards, astro, lang);

  // 4. Groq API with streaming, with one-shot fallback to gemma2-9b-it on quota errors
  const groqKey = Deno.env.get('GROQ_API_KEY') ?? '';
  const callGroq = (model: string) =>
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 400,
        stream: true,
        temperature: 0.75,
      }),
    });

  let groqRes = await callGroq('llama-3.3-70b-versatile');
  if (!groqRes.ok && (groqRes.status === 429 || groqRes.status >= 500)) {
    groqRes = await callGroq('gemma2-9b-it');
  }
  if (!groqRes.ok || !groqRes.body) {
    const errText = await groqRes.text().catch(() => '');
    return new Response(`Upstream error: ${errText.slice(0, 500)}`, {
      status: 502,
      headers: corsHeaders,
    });
  }

  return new Response(groqRes.body, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
});
