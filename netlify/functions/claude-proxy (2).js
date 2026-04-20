// netlify/functions/claude-proxy.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const CLAUDE_KEY = process.env.CLAUDE_KEY || process.env.VITE_CLAUDE_KEY;
  if (!CLAUDE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "CLAUDE_KEY no configurada en Netlify" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON invalido" }) };
  }

  try {
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

    // Log completo para ver el error real en Netlify Functions log
    if (!response.ok) {
      console.error("[claude-proxy] Error de Anthropic:", JSON.stringify(data));
    }

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("[claude-proxy] Fetch error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
