// netlify/functions/send-notification.js
// Proxy seguro para OneSignal — la REST Key NUNCA va al cliente

exports.handler = async (event) => {
  // Solo POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let title, message, filters;
  try {
    ({ title, message, filters } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!title || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "title y message son requeridos" }) };
  }

  const ONESIGNAL_APP_ID  = process.env.ONESIGNAL_APP_ID  || "3737bebb-bec5-4427-b663-881160aef464";
  const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY;

  if (!ONESIGNAL_REST_KEY) {
    console.error("[send-notification] ONESIGNAL_REST_KEY no está configurada en Netlify");
    return { statusCode: 500, body: JSON.stringify({ error: "REST Key no configurada" }) };
  }

  // ─── TARGETING ────────────────────────────────────────────────
  // Si llegan filtros → usarlos (ej: filtrar por tripId)
  // Si NO llegan filtros → mandar a TODOS los suscritos
  //
  // ⚠️  ESTE ES EL FIX CLAVE:
  //     No uses include_player_ids con array vacío → da el error
  //     "All included players are not subscribed"
  //     Usa included_segments: ["All"] para envío masivo.
  // ──────────────────────────────────────────────────────────────
  const targeting = (Array.isArray(filters) && filters.length > 0)
    ? { filters }                          // envío filtrado por tag (ej: tripId)
    : { included_segments: ["All"] };      // envío a todos los suscritos

  const payload = {
    app_id:   ONESIGNAL_APP_ID,
    headings: { en: title, es: title },
    contents: { en: message, es: message },
    ...targeting,
  };

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("[send-notification] OneSignal response:", JSON.stringify(data));

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[send-notification] Fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
