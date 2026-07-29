const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error: API key not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { contents, system_instruction } = await request.json();

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid contents array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = {
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    };

    if (system_instruction) {
      body.system_instruction = system_instruction;
    }

    const url = GEMINI_URL + '?key=' + encodeURIComponent(apiKey);

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({
        error: data.error?.message || 'Gemini API error: HTTP ' + geminiRes.status,
      }), {
        status: geminiRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!reply) {
      return new Response(JSON.stringify({ error: 'Empty response from Gemini' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
