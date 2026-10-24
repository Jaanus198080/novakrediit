exports.handler = async function(event) {
  const TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const action = body.action;

    // Envoyer un message
    if (action === 'send') {
      const text = body.text;
      if (!text) return { statusCode: 400, headers, body: JSON.stringify({ ok: false }) };

      const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'Markdown' })
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // Recevoir les réponses (polling)
    if (action === 'poll') {
      const offset = body.offset || 0;
      const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=1`);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
