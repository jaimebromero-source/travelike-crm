// netlify/functions/claude-proxy.js
// Proxy para la API de Claude — evita el bloqueo CORS del navegador
// La VITE_CLAUDE_KEY vive en las variables de entorno de Netlify (sin prefijo VITE_ aquí)

exports.handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const CLAUDE_KEY = process.env.CLAUDE_KEY || process.env.VITE_CLAUDE_KEY;

  if (!CLAUDE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "CLAUDE_KEY not configured in environment variables" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
