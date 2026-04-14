// netlify/functions/send-notification.js

const ONESIGNAL_APP_ID   = "a53d37c2-d328-48e0-84e4-1a3a71db77ad";
// USA LA LEGACY API KEY (la que aparece en Settings → Keys & IDs → Legacy API Key)
const ONESIGNAL_REST_KEY = "PEGA_AQUI_LA_LEGACY_API_KEY";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: "Invalid JSON" }; }

  const { title, message, filters } = body;
  if (!title || !message) {
    return { statusCode: 400, body: "title y message son obligatorios" };
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    headings: { es: title, en: title },
    contents: { es: message, en: message },
    ...(filters && filters.length > 0
      ? { filters }
      : { included_segments: ["All"] })
  };

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_KEY}`
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
