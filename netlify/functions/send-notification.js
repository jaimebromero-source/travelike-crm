// netlify/functions/send-notification.js

// ✅ VOLVEMOS AL APP ID QUE SÍ TE FUNCIONÓ PARA LOS VIAJES
const ONESIGNAL_APP_ID = "3737bebb-bec5-4427-b663-881160aef464";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

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
      : { included_segments: ["Subscribed Users"] }) // ✅ El segmento correcto para "Todos"
  };

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ Volvemos a "key" en minúscula, que es como lo tenías cuando funcionaban los viajes
        "Authorization": `key ${REST_KEY}`
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
