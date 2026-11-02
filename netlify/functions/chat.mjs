import worker from '../../worker/index.mjs';

// Netlify injects gateway credentials at runtime. Read them for each request;
// never ship them to the browser or fall back to a separately billed API key.
export const config = { path: '/api/chat' };

export default async function handler(request) {
  const base = (process.env.NETLIFY_AI_GATEWAY_URL || '').replace(/\/+$/, '');
  const gatewayKey = process.env.NETLIFY_AI_GATEWAY_KEY || '';
  let configured = false;
  try { configured = new URL(base).protocol === 'https:' && gatewayKey.length > 0; } catch {}
  if (!configured) {
    return Response.json({ready:false,error:'Netlify AI Gateway is not available. Check that AI features are enabled for your Netlify team and redeploy the full project.'}, {status:503,headers:{'Cache-Control':'no-store'}});
  }
  const env = {
    ASSETS: {fetch: () => new Response('Not found', {status:404})},
    AI: {
      async run(_model, options) {
        const response = await fetch(`${base}/v1/chat/completions`, {
          method: 'POST',
          headers: {'Authorization': `Bearer ${gatewayKey}`, 'Content-Type': 'application/json'},
          body: JSON.stringify({model:'gpt-4o-mini',messages:options.messages,max_tokens:options.max_tokens,temperature:options.temperature}),
          signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error('AI Gateway unavailable');
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== 'string') throw new Error('AI Gateway returned no answer');
        return {response:text};
      }
    }
  };
  // Netlify also exposes the function by its default function path.
  const url = new URL(request.url);
  if (url.pathname !== '/api/chat') {
    url.pathname = '/api/chat';
    request = new Request(url, request);
  }
  return worker.fetch(request, env);
}
