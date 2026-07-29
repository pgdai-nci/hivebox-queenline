const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'Server configuration error: API key not set' }, 500);
  }

  try {
    const { contents, system_instruction } = await request.json();

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return jsonResponse({ error: 'Missing or invalid contents array' }, 400);
    }

    const body = {
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    };

    if (system_instruction) {
      body.system_instruction = system_instruction;
    }

    const GEMINI_MODEL = 'gemini-2.0-flash';
    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent';
    const url = GEMINI_URL + '?key=' + encodeURIComponent(apiKey);

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return jsonResponse({
        error: data.error?.message || 'Gemini API error: HTTP ' + geminiRes.status,
      }, geminiRes.status);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!reply) {
      return jsonResponse({ error: 'Empty response from Gemini' }, 502);
    }

    return jsonResponse({ reply });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
