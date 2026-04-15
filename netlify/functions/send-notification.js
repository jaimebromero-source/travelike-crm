// netlify/functions/send-notification.js
// ⚠️ La REST Key NUNCA va en el código — solo en variables de entorno de Netlify

const ONESIGNAL_APP_ID = "c12214ba-200f-478f-8f8e-899efc5ad4c0";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // La key viene SOLO del entorno — nunca hardcodeada
  const REST_KEY = process.env.ONESIGNAL_REST_KEY;
  if (!REST_KEY) {
    console.error("[OneSignal] ONESIGNAL_REST_KEY no está configurada en Netlify");
    return { statusCode: 500, body: JSON.stringify({ error: "REST key no configurada" }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: "Invalid JSON" }; }

  const { title, message, filters } = body;
  if (!title || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "title y message son obligatorios" }) };
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    target_channel: "push",
    headings: { es: title, en: title },
    contents: { es: message, en: message },
    ...(filters && filters.length > 0
      ? { filters }
      : { included_segments: ["Subscribed Users"] }) // ✅ CAMBIADO a "Subscribed Users"
  };

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ CAMBIADO: Usamos "Basic", que es el formato principal de la API
        "Authorization": `Basic ${REST_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    console.log("[OneSignal] Status:", response.status, "| Body:", rawText);

    let data;
    try { data = JSON.parse(rawText); } catch { data = { raw: rawText }; }

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error("[OneSignal] Error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
