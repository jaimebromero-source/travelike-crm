// netlify/functions/send-notification.js

const ONESIGNAL_APP_ID   = "a53d37c2-d328-48e0-84e4-1a3a71db77ad";
const ONESIGNAL_REST_KEY = "os_v2_app_uu6tpqwtfbeobbhedi5hdw3xvuaf4zamaqquz6vp2jxvnzlqt2jhoilxmgl6rprkik6br2imckizx4av47awmej2qkl6p22zijhnnay";

// Keys nuevas (os_v2_) usan endpoint y auth distintos a las antiguas
const IS_V2_KEY = ONESIGNAL_REST_KEY.startsWith("os_v2_");
const API_URL   = IS_V2_KEY
  ? "https://api.onesignal.com/notifications"
  : "https://onesignal.com/api/v1/notifications";
const AUTH      = IS_V2_KEY
  ? `Key ${ONESIGNAL_REST_KEY}`
  : `Basic ${ONESIGNAL_REST_KEY}`;

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

  console.log("[OneSignal] URL:", API_URL, "| Auth:", AUTH.split(" ")[0]);
  console.log("[OneSignal] Payload:", JSON.stringify(payload));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": AUTH },
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
