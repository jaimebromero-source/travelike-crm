import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nvdwuvrxwkyitltgdyic.supabase.co";
const SUPABASE_KEY = "sb_publishable_bh5E4QYVkG6R3fph7DyqcQ_IYMUBhZK";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SK_T = "tv9-trips";
const SK_C = "tv9-clients";
const SK_CRM = "tv9-crm";
const SK_SES = "tv9-session";
const SK_CFG = "tv9-cfg";
const SK_ADMIN = "tv9-admin-token";

const verifyPin = async (pin, type = "admin") => {
  try {
    const { data, error } = await supabase.rpc("tl_verify_and_login", { input_pin: pin, pin_type: type });
    if (error) return { status: "error", msg: error.message };
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) { return { status: "error", msg: e.message }; }
};

const verifySessionToken = async (token, type = "admin") => {
  if (!token || typeof token !== "string" || token === "true") return false;
  try {
    const { data } = await supabase.rpc("tl_verify_session", { input_token: token, token_type: type });
    return !!data;
  } catch { return false; }
};

const logoutSessionToken = async (token) => {
  if (!token || token === "true") return;
  try { await supabase.rpc("tl_logout_session", { input_token: token }); } catch {}
};

// ⚠️ GEMINI eliminado — se usa Claude API
// La key va en .env como VITE_CLAUDE_KEY
const callClaude = async (b64, mime, prompt) => {
  const isImg = mime?.startsWith("image/");
  const isPDF = mime === "application/pdf";
  const contentParts = [];
  if (b64 && (isImg || isPDF)) {
    // Anthropic solo acepta: image/jpeg, image/png, image/gif, image/webp
    // Normalizamos cualquier otro tipo de imagen a image/jpeg para evitar error 400
    const SUPPORTED_IMG = ["image/jpeg","image/png","image/gif","image/webp"];
    const safeMime = isImg
      ? (SUPPORTED_IMG.includes(mime) ? mime : "image/jpeg")
      : mime; // PDFs se dejan tal cual
    contentParts.push({ type: isImg ? "image" : "document", source: { type: "base64", media_type: safeMime, data: b64 } });
  }
  contentParts.push({ type: "text", text: prompt });
  // ✅ Proxy de Netlify — la API de Anthropic bloquea llamadas directas desde el navegador (CORS)
  const resp = await fetch("/.netlify/functions/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600, messages: [{ role: "user", content: contentParts }] })
  });
  const data = await resp.json();
  if (data.error) {
    console.error("[callClaude] Error de Anthropic:", JSON.stringify(data.error));
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  return data.content?.[0]?.text || "";
};

const ONESIGNAL_APP_ID = "3737bebb-bec5-4427-b663-881160aef464";
const BANK_IBAN = "ES48 0128 0690 9001 0008 6284";
const BANK_TITULAR = "TraveLike";
const WA_NUM = "34600000000";

const CURRENCIES = [
  { code:"EUR",symbol:"€",name:"Euro" },{ code:"USD",symbol:"$",name:"Dólar US" },{ code:"GBP",symbol:"£",name:"Libra esterlina" },
  { code:"JPY",symbol:"¥",name:"Yen japonés" },{ code:"CHF",symbol:"Fr",name:"Franco suizo" },{ code:"SEK",symbol:"kr",name:"Corona sueca" },
  { code:"NOK",symbol:"kr",name:"Corona noruega" },{ code:"DKK",symbol:"kr",name:"Corona danesa" },{ code:"PLN",symbol:"zł",name:"Esloti polaco" },
  { code:"CZK",symbol:"Kč",name:"Corona checa" },{ code:"HUF",symbol:"Ft",name:"Forinto húngaro" },{ code:"RON",symbol:"lei",name:"Leu rumano" },
  { code:"BGN",symbol:"лв",name:"Lev búlgaro" },{ code:"HRK",symbol:"kn",name:"Kuna croata" },{ code:"RSD",symbol:"din",name:"Dinar serbio" },
  { code:"ISK",symbol:"kr",name:"Corona islandesa" },{ code:"MXN",symbol:"$",name:"Peso mexicano" },{ code:"ARS",symbol:"$",name:"Peso argentino" },
  { code:"BRL",symbol:"R$",name:"Real brasileño" },{ code:"COP",symbol:"$",name:"Peso colombiano" },{ code:"CLP",symbol:"$",name:"Peso chileno" },
  { code:"PEN",symbol:"S/",name:"Sol peruano" },{ code:"UYU",symbol:"$U",name:"Peso uruguayo" },{ code:"BOB",symbol:"Bs",name:"Boliviano" },
  { code:"PYG",symbol:"₲",name:"Guaraní paraguayo" },{ code:"GTQ",symbol:"Q",name:"Quetzal guatemalteco" },{ code:"CRC",symbol:"₡",name:"Colón costarricense" },
  { code:"DOP",symbol:"RD$",name:"Peso dominicano" },{ code:"AUD",symbol:"A$",name:"Dólar australiano" },{ code:"CAD",symbol:"C$",name:"Dólar canadiense" },
  { code:"NZD",symbol:"NZ$",name:"Dólar neozelandés" },{ code:"TRY",symbol:"₺",name:"Lira turca" },{ code:"AED",symbol:"د.إ",name:"Dírham emiratí" },
  { code:"SAR",symbol:"ر.س",name:"Riyal saudí" },{ code:"QAR",symbol:"ر.ق",name:"Riyal catarí" },{ code:"KWD",symbol:"د.ك",name:"Dinar kuwaití" },
  { code:"BHD",symbol:".د.ب",name:"Dinar bareiní" },{ code:"OMR",symbol:"ر.ع",name:"Riyal omaní" },{ code:"JOD",symbol:"د.ا",name:"Dinar jordano" },
  { code:"ILS",symbol:"₪",name:"Séquel israelí" },{ code:"ZAR",symbol:"R",name:"Rand sudafricano" },{ code:"MAD",symbol:"MAD",name:"Dírham marroquí" },
  { code:"EGP",symbol:"£",name:"Libra egipcia" },{ code:"TND",symbol:"د.ت",name:"Dinar tunecino" },{ code:"KES",symbol:"Ksh",name:"Chelín keniano" },
  { code:"NGN",symbol:"₦",name:"Naira nigeriana" },{ code:"GHS",symbol:"₵",name:"Cedi ghanés" },{ code:"ETB",symbol:"Br",name:"Birr etíope" },
  { code:"TZS",symbol:"Tsh",name:"Chelín tanzano" },{ code:"INR",symbol:"₹",name:"Rupia india" },{ code:"PKR",symbol:"₨",name:"Rupia pakistaní" },
  { code:"BDT",symbol:"৳",name:"Taka bangladesí" },{ code:"LKR",symbol:"Rs",name:"Rupia de Sri Lanka" },{ code:"NPR",symbol:"₨",name:"Rupia nepalesa" },
  { code:"CNY",symbol:"¥",name:"Yuan chino" },{ code:"KRW",symbol:"₩",name:"Won coreano" },{ code:"TWD",symbol:"NT$",name:"Dólar taiwanés" },
  { code:"HKD",symbol:"HK$",name:"Dólar hongkonés" },{ code:"SGD",symbol:"S$",name:"Dólar singapurense" },{ code:"MYR",symbol:"RM",name:"Ringgit malayo" },
  { code:"THB",symbol:"฿",name:"Baht tailandés" },{ code:"VND",symbol:"₫",name:"Dong vietnamita" },{ code:"IDR",symbol:"Rp",name:"Rupia indonesia" },
  { code:"PHP",symbol:"₱",name:"Peso filipino" },{ code:"MMK",symbol:"K",name:"Kyat birmano" },{ code:"KHR",symbol:"៛",name:"Riel camboyano" },
  { code:"LAK",symbol:"₭",name:"Kip laosiano" },{ code:"BND",symbol:"B$",name:"Dólar de Brunéi" },{ code:"MNT",symbol:"₮",name:"Tugrik mongol" },
  { code:"KZT",symbol:"₸",name:"Tenge kazajo" },{ code:"UZS",symbol:"so'm",name:"Som uzbeko" },{ code:"GEL",symbol:"₾",name:"Lari georgiano" },
  { code:"AMD",symbol:"֏",name:"Dram armenio" },{ code:"AZN",symbol:"₼",name:"Manat azerbaiyano" },{ code:"UAH",symbol:"₴",name:"Grivna ucraniana" },
  { code:"RUB",symbol:"₽",name:"Rublo ruso" },{ code:"BYN",symbol:"Br",name:"Rublo bielorruso" },{ code:"MDL",symbol:"L",name:"Leu moldavo" },
  { code:"MKD",symbol:"ден",name:"Denar macedonio" },{ code:"ALL",symbol:"L",name:"Lek albanés" },{ code:"BAM",symbol:"KM",name:"Marco bosnio" },
  { code:"IQD",symbol:"ع.د",name:"Dinar iraquí" },{ code:"IRR",symbol:"﷼",name:"Rial iraní" },{ code:"AFN",symbol:"؋",name:"Afgani afgano" },
  { code:"MUR",symbol:"Rs",name:"Rupia mauriciana" },{ code:"XOF",symbol:"CFA",name:"Franco CFA BCEAO" },{ code:"XAF",symbol:"CFA",name:"Franco CFA BEAC" },
  { code:"CDF",symbol:"FC",name:"Franco congoleño" },{ code:"MZN",symbol:"MT",name:"Metical mozambiqueño" },{ code:"ZMW",symbol:"ZK",name:"Kwacha zambiano" },
  { code:"BWP",symbol:"P",name:"Pula botsuanesa" },{ code:"NAD",symbol:"N$",name:"Dólar namibio" },{ code:"MGA",symbol:"Ar",name:"Ariary malgache" },
  { code:"DZD",symbol:"دج",name:"Dinar argelino" },{ code:"LYD",symbol:"ل.د",name:"Dinar libio" },{ code:"SDG",symbol:"ج.س",name:"Libra sudanesa" },
  { code:"SOS",symbol:"Sh",name:"Chelín somalí" },{ code:"RWF",symbol:"Fr",name:"Franco ruandés" },{ code:"UGX",symbol:"Sh",name:"Chelín ugandés" },
  { code:"HTG",symbol:"G",name:"Gourde haitiano" },{ code:"JMD",symbol:"J$",name:"Dólar jamaicano" },{ code:"TTD",symbol:"TT$",name:"Dólar de Trinidad" },
  { code:"BBD",symbol:"Bds$",name:"Dólar de Barbados" },{ code:"FJD",symbol:"FJ$",name:"Dólar fiyiano" },{ code:"PGK",symbol:"K",name:"Kina de P. Guinea" },
  { code:"WST",symbol:"T",name:"Tālā samoano" },
];
const getCurrencySymbol = code => CURRENCIES.find(c=>c.code===code)?.symbol||code;

const A = {
  bg:"#07070f", card:"#0f1824", card2:"#172030", border:"#1e3a5f",
  text:"#e6e6e6", muted:"#8a9bb3", cyan:"#00F0FF", orange:"#FF9500",
  green:"#34C759", red:"#FF3B30", gold:"#FFD700", purple:"#BF5AF2", lightblue:"#4FC3F7"
};
const ANTON = "'Anton', sans-serif";
const BF = "'Barlow Condensed', sans-serif";
const ais = { width:"100%",background:A.bg,border:`1px solid ${A.border}`,borderRadius:10,padding:"12px 14px",color:A.text,fontFamily:BF,fontSize:16,outline:"none",boxSizing:"border-box" };
const ab = (bg,fg) => ({ background:bg,border:"none",color:fg||"#fff",borderRadius:12,padding:"14px",fontFamily:ANTON,fontSize:16,letterSpacing:1,cursor:"pointer",textTransform:"uppercase" });

const MES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MES_F = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const NOW = new Date();
const CUR = `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;

const ROOMS = {
  doble_jun: { label:"🛌 Doble cama junta", short:"Doble Junta", cap:2, color:A.cyan },
  doble_sep: { label:"🛏️ Doble camas sep.", short:"Doble Sep.", cap:2, color:A.lightblue },
  individual:{ label:"👤 Individual", short:"Individual", cap:1, color:A.orange },
  triple:    { label:"👨‍👩‍👦 Triple", short:"Triple", cap:3, color:A.gold },
  cuadruple: { label:"👨‍👩‍👧‍👦 Cuádruple", short:"Cuádruple", cap:4, color:A.purple },
  busca:     { label:"🔍 Busca compañero/a", short:"Busca", cap:2, color:"#FF6B6B" }
};

const FORMAS_PAGO = [
  { k:"transferencia", icon:"🏦", label:"Transferencia" },
  { k:"tarjeta", icon:"💳", label:"Tarjeta" },
  { k:"vip", icon:"⭐", label:"Descuento VIP" }
];

const GASTO_TIPOS = [
  { k:"vuelo", icon:"✈️", label:"Vuelo" },{ k:"hotel", icon:"🏨", label:"Hotel" },
  { k:"traslado", icon:"🚕", label:"Traslado" },{ k:"guia", icon:"🗺️", label:"Guía" },
  { k:"seguro", icon:"🛡️", label:"Seguro" },{ k:"restaurante", icon:"🍽️", label:"Restaurante" },
  { k:"actividad", icon:"🎟️", label:"Actividad" },{ k:"propina", icon:"💸", label:"Propina" },
  { k:"otros", icon:"📝", label:"Otros" }
];

const ST = [
  { key:"interesado", label:"Interesado", emoji:"👀", color:"#FF9500" },
  { key:"confirmado", label:"Confirmado", emoji:"✅", color:"#34C759" },
  { key:"pagado", label:"Pagado", emoji:"💰", color:"#00F0FF" },
  { key:"cancelado", label:"Cancelado", emoji:"❌", color:"#e8002a" }
];
const ST_SELECT = ST.filter(s=>s.key!=="pagado");

const CRM_TABS = [
  { key:"people", icon:"👥", label:"Viajeros" },
  { key:"pagos", icon:"💳", label:"Pagos" },
  { key:"finanzas", icon:"💰", label:"Finanzas" },
  { key:"ai", icon:"🤖", label:"IA Docs" },
  { key:"notes", icon:"📝", label:"Notas" },
  { key:"edit", icon:"⚙️", label:"Editar" }
];

const EDIT_SECS = [
  { k:"general", icon:"🌍", label:"General" },{ k:"vuelos", icon:"✈️", label:"Vuelos" },
  { k:"docs", icon:"📄", label:"Docs" },{ k:"pagos", icon:"💳", label:"Pagos" },
  { k:"info", icon:"ℹ️", label:"Info" },{ k:"hotels", icon:"🏨", label:"Hoteles" },
  { k:"maleta", icon:"🎒", label:"Maleta" },{ k:"emerg", icon:"🆘", label:"SOS" },
  { k:"survey", icon:"⭐", label:"Encuesta" }
];

const SURVEY_EMOJIS = ["😠","🙁","😐","🙂","🤩"];
const SURVEY_LABELS = ["Muy malo","Malo","Regular","Bueno","Excelente"];
const SURVEY_HLS = [
  { k:"cultura", l:"🏛️ Cultura" },{ k:"gastro", l:"🥘 Gastronomía" },
  { k:"aloj", l:"🏨 Alojamiento" },{ k:"grupo", l:"👥 El grupo" },
  { k:"activ", l:"🎟️ Actividades" },{ k:"paisajes", l:"🌄 Paisajes" },
  { k:"org", l:"📅 Organización" },{ k:"precio", l:"💰 Precio/calidad" }
];
const DEFAULT_SURVEY_CATS = [
  { key:"viaje", label:"Experiencia global", icon:"🌍", tipo:"rating" },
  { key:"guia", label:"Guía / Organización", icon:"🗺️", tipo:"rating" },
  { key:"hotel", label:"Alojamientos", icon:"🏨", tipo:"rating" }
];

const DEFAULT_IMPRESCINDIBLES = [
  "Pasaporte / DNI vigente","Billete de avión (impreso o digital)","Seguro de viaje",
  "Tarjeta bancaria / efectivo","Cargador del móvil","Medicación habitual","Tarjeta eSIM / Roaming"
];

const DEFAULT_MALETA_CATS = [
  { id:"ropa", icon:"👕", label:"Ropa", items:["Camisetas (x5)","Pantalón largo (x2)","Pantalón corto","Ropa interior (x7)","Calcetines (x7)","Chaqueta ligera","Bañador"] },
  { id:"calzado", icon:"👟", label:"Calzado", items:["Zapatillas cómodas","Sandalias/Chanclas","Zapatos de vestir (opcional)"] },
  { id:"aseo", icon:"🪥", label:"Aseo", items:["Cepillo de dientes + pasta","Champú y gel (tamaño viaje)","Desodorante","Protector solar","Bolsa de aseo transparente"] },
  { id:"tech", icon:"📱", label:"Tecnología", items:["Adaptador de enchufe","Cámara de fotos","Auriculares","Batería externa (Powerbank)"] },
  { id:"docs", icon:"📄", label:"Documentos", items:["Fotocopias de documentos","Certificados médicos"] },
  { id:"varios", icon:"🎒", label:"Varios", items:["Gafas de sol","Paraguas pequeño","Botella de agua reutilizable","Libro / Pasatiempos"] }
];

const DEFAULT_TEMPLATES = [
  { id:"pago", emoji:"💰", title:"Recordatorio de pago", body:"Tienes un pago pendiente para tu próximo viaje. Por favor, revisa tu portal." },
  { id:"vuelos", emoji:"✈️", title:"Tus vuelos están disponibles", body:"Ya puedes descargar tus billetes de avión desde tu portal de viajero." },
  { id:"docs", emoji:"📄", title:"Documentación lista", body:"Tu documentación de viaje ya está disponible. Descárgala antes del viaje." },
  { id:"nuevo", emoji:"🌍", title:"Nuevo viaje disponible", body:"Tenemos algo especial preparado. Entra para ver nuestro nuevo destino." },
  { id:"pasaporte", emoji:"🛂", title:"Revisa tu pasaporte", body:"Recuerda comprobar que tu pasaporte tiene al menos 6 meses de validez." }
];

const uid = () => Math.random().toString(36).slice(2,10);
const genCode = () => Math.random().toString(36).slice(2,8).toUpperCase();
const fmt = d => { if(!d) return ""; const [y,m]=d.split("-"); return `${MES[+m-1]} ${y}`; };
const isPast = d => d < CUR;
const parseISO = s => { if(!s) return null; try { const d=new Date(s); return isNaN(d.getTime())?null:d; } catch { return null; } };
// Convierte YYYY-MM-DD → DD-MM-YYYY (para mostrar en el input)
const isoToDisplay = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m?`${m[3]}-${m[2]}-${m[1]}`:s; };
// Convierte DD-MM-YYYY → YYYY-MM-DD (para guardar en BD/estado)
const displayToISO = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m?`${m[3]}-${m[2]}-${m[1]}`:s; };
const daysDiff = s => { const d=parseISO(s); return d?Math.ceil((d-NOW)/864e5):null; };
const isUrgent = s => { const n=daysDiff(s); return n!==null&&n>=0&&n<7; };
const isOverdue = s => { const n=daysDiff(s); return n!==null&&n<0; };
const daysUntilExpiry = s => { if(!s) return null; const d=parseISO(s); return d?Math.ceil((d-NOW)/864e5):null; };
const passportWarn = s => { const d=daysUntilExpiry(s); return d!=null&&d<=180; };
const matchSearch = (s,q) => !q||!q.trim()||s.toLowerCase().includes(q.toLowerCase().trim());
const fileToB64 = file => new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=e=>rej(e); r.readAsDataURL(file); });

const emptyHotel = () => ({ id:uid(), nombre:"", direccion:"", fechasEstancia:"" });
const emptyEmergencias = () => ({ policia:"", ambulancia:"", bomberos:"", embajada:"" });
const emptyT = () => ({
  vuelos:[], docs:[],
  pagosConfig:[
    { label:"Reserva", fecha:"", fechaISO:"", importe:"" },
    { label:"Pago Final", fecha:"", fechaISO:"", importe:"" }
  ],
  info:[], webUrl:"", hotels:[], emergencias:emptyEmergencias(),
  surveyEnabled:false,
  surveyConfig:{ categories:[...DEFAULT_SURVEY_CATS], surveyResponses:[] },
  maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES],
  maletaCats:DEFAULT_MALETA_CATS.map(c=>({...c,items:[...c.items]})),
  gastos:[], facturas:[], facturasVenta:[], currency:"EUR"
});

let rateCache = {};
const getRate = async (from="EUR", to="EUR") => {
  if (from===to) return 1;
  const key = `${from}_${to}`;
  if (rateCache[key]) return rateCache[key];
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const d = await r.json();
    const rate = d.rates?.[to] || 1;
    rateCache[key] = rate;
    return rate;
  } catch { return 1; }
};
const convertToEUR = async (amount, from) => {
  if (!amount || from==="EUR") return +amount || 0;
  const rate = await getRate(from, "EUR");
  return +(+amount * rate).toFixed(2);
};

const sendOneSignal = async (title, body, filters=[]) => {
  try {
    const r = await fetch("/.netlify/functions/send-notification", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message: body, filters })
    });
    const data = await r.json();
    if (!r.ok) console.error("[OneSignal proxy] Error:", data);
    return data;
  } catch(e) { console.error("[OneSignal proxy] Fetch error:", e); return { success: false, error: e.message }; }
};

if (typeof document!=="undefined" && !document.getElementById("tl-f")) {
  const l=document.createElement("link"); l.id="tl-f"; l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css?family=Anton&family=Barlow+Condensed:400,700&display=swap";
  document.head.appendChild(l);
}
const mem = {};

const stripBinary = (k, v) => {
  if (k !== SK_C && k !== SK_T) return v;
  if (!Array.isArray(v)) return v;
  return v.map(item => {
    const stripped = { ...item };
    if (stripped.passportPhotos) stripped.passportPhotos = [];
    if (stripped.facturas) stripped.facturas = (stripped.facturas || []).map(f => ({ ...f, data: f.data ? "__local__" : null }));
    return stripped;
  });
};

const mergeBinary = (k, supaVal, localVal) => {
  if ((k !== SK_C && k !== SK_T) || !Array.isArray(supaVal) || !Array.isArray(localVal)) return supaVal;
  return supaVal.map(item => {
    const local = localVal.find(l => l.id === item.id);
    if (!local) return item;
    const merged = { ...item };
    if (k === SK_C) {
      if (local.passportPhotos?.length) merged.passportPhotos = local.passportPhotos;
    }
    if (k === SK_T) {
      if (local.facturas?.length) {
        merged.facturas = item.facturas?.map(f => {
          const lf = local.facturas?.find(lf2 => lf2.id === f.id);
          return lf?.data && lf.data !== "__local__" ? { ...f, data: lf.data } : f;
        }) || local.facturas;
      }
    }
    return merged;
  });
};

const db = {
  async get(k) {
    let localVal = null;
    try { const r = localStorage.getItem(k); if (r) localVal = JSON.parse(r); } catch {}
    try {
      const { data, error } = await supabase.from("travelike_store").select("value").eq("key", k).maybeSingle();
      if (!error && data?.value) {
        const supaVal = data.value;
        if (localVal) return mergeBinary(k, supaVal, localVal);
        return supaVal;
      }
    } catch {}
    if (localVal) return localVal;
    return mem[k] ?? null;
  },
  async set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    mem[k] = v;
    try {
      const stripped = stripBinary(k, v);
      await supabase.from("travelike_store").upsert({ key: k, value: stripped, updated_at: new Date().toISOString() }, { onConflict: "key" });
    } catch {}
  }
};

let _jsPDFInstance = null;
const loadJsPDF = () => new Promise(resolve => {
  if (_jsPDFInstance) return resolve(_jsPDFInstance);
  if (window.jspdf?.jsPDF) { _jsPDFInstance = window.jspdf.jsPDF; return resolve(_jsPDFInstance); }
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  s.onload = () => { _jsPDFInstance = window.jspdf.jsPDF; resolve(_jsPDFInstance); };
  document.head.appendChild(s);
});

const facturaImporteNum = (nombre) => {
  const m = nombre?.match(/(\d[\d.,]*)/);
  return m ? m[1].replace(",", ".") : null;
};

const generarFacturaPDF = async (fa) => {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  if (fa.tipo?.includes("image")) {
    const imgType = fa.tipo.includes("png") ? "PNG" : "JPEG";
    doc.addImage(`data:${fa.tipo};base64,${fa.data}`, imgType, 5, 5, 200, 0);
  } else { doc.setFontSize(14); doc.setTextColor(100); doc.text("Factura: " + fa.nombre, 10, 20); }
  const num = facturaImporteNum(fa.nombre);
  const pdfName = (num ? num : fa.nombre.replace(/\.[^.]+$/, "")) + ".pdf";
  doc.save(pdfName);
};

const DT = [{
  id:"t_nyc", name:"Nueva York & Washington", date:"2026-12", flag:"🇺🇸", price:2190, currency:"EUR",
  webUrl:"", fechas:"1 - 8 Diciembre 2026",
  vuelos:[{ id:"v1", nombre:"IDA - Madrid > Nueva York (IB6251)", archivo:"IB6251_Billete.pdf" }],
  docs:[{ id:"d1", nombre:"Seguro médico de viaje", archivo:"Poliza_seguro.pdf" }],
  pagosConfig:[
    { label:"Reserva", fecha:"15 Ago 2026", fechaISO:"2026-08-15", importe:"500€" },
    { label:"Resto", fecha:"1 Nov 2026", fechaISO:"2026-11-01", importe:"1690€" }
  ],
  info:[{ icono:"🔌", titulo:"Enchufes", texto:"Tipo A/B. Voltaje 120V. Necesitas adaptador." }],
  hotels:[{ id:"h1", nombre:"The New Yorker Hotel", direccion:"481 8th Ave, Nueva York, NY 10001", fechasEstancia:"1 - 6 Dic" }],
  emergencias:{ policia:"911", ambulancia:"911", bomberos:"911", embajada:"+1 202 452 0100" },
  surveyEnabled:false, surveyConfig:{ categories:[...DEFAULT_SURVEY_CATS], surveyResponses:[] },
  maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES],
  maletaCats:DEFAULT_MALETA_CATS.map(c=>({...c,items:[...c.items]})),
  gastos:[], facturas:[], facturasVenta:[]
}];

const DC = [
  { id:"c11", nombre:"Carmen García", email:"carmen@email.com", tripId:"t_nyc", code:"CRM123", status:"confirmado", room:"doble_jun", note:"", pagosEstado:["pagado","pendiente"], pagosImporteCustom:[null,null], personalDocs:[], passportPhoto:null, passportConsent:false, photoConsent:false, firstLogin:true, passportExpiry:"2028-05-20", passportExpiryDismissed:false, notifEnabled:false, roommateId:"c12", surveySubmitted:false, acompanantes:[], maletaPersonal:[], maletaMarcados:[], formaPago:"transferencia", docNumero:"", docVerified:false },
  { id:"c12", nombre:"Antonio Rodríguez", email:"antonio@email.com", tripId:"t_nyc", code:"ANT456", status:"pagado", room:"doble_jun", note:"Alergia marisco", pagosEstado:["pagado","pagado"], pagosImporteCustom:[null,null], personalDocs:[], passportPhoto:null, passportConsent:false, photoConsent:false, firstLogin:true, passportExpiry:"2025-10-15", passportExpiryDismissed:false, notifEnabled:false, roommateId:"c11", surveySubmitted:false, acompanantes:[], maletaPersonal:[], maletaMarcados:[], formaPago:"tarjeta", docNumero:"", docVerified:false }
];

function AModal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000CC",display:"flex",alignItems:"flex-end",zIndex:9999 }}>
      <div style={{ background:A.card2,borderRadius:"20px 20px 0 0",padding:"20px",width:"100%",maxHeight:"90vh",overflowY:"auto",borderTop:`1px solid ${A.border}`,boxSizing:"border-box" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <span style={{ fontFamily:ANTON,fontSize:18,color:A.text,letterSpacing:1,textTransform:"uppercase" }}>{title}</span>
          <button onClick={onClose} style={{ background:"transparent",border:"none",color:A.muted,fontSize:24,cursor:"pointer",lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ARow({ children }) { return <div style={{ display:"flex",gap:10,marginTop:10 }}>{children}</div>; }
function AEmpty({ text }) { return <div style={{ textAlign:"center",color:A.muted,fontSize:14,fontFamily:BF,padding:"24px 0" }}>{text}</div>; }
function PassportImageViewer({ src }) {
  const [zoom, setZoom] = React.useState(1);
  const [rot, setRot]   = React.useState(0);
  const [pan, setPan]   = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef(null);
  const lastPan   = React.useRef({ x: 0, y: 0 });
  const isZ = zoom > 1;

  const zoomIn  = e => { e.stopPropagation(); setZoom(z => Math.min(5, +(z + 0.5).toFixed(2))); };
  const zoomOut = e => { e.stopPropagation(); const n = Math.max(1, +(zoom - 0.5).toFixed(2)); setZoom(n); if (n === 1) { setPan({ x: 0, y: 0 }); lastPan.current = { x: 0, y: 0 }; } };
  const rotate  = e => { e.stopPropagation(); setRot(r => (r + 90) % 360); };
  const reset   = e => { e.stopPropagation(); setZoom(1); setRot(0); setPan({ x: 0, y: 0 }); lastPan.current = { x: 0, y: 0 }; };

  // Drag solo sobre la imagen — NO llama preventDefault para no robar foco a inputs
  const onImgDown = e => {
    if (!isZ) return;
    // No llamamos e.preventDefault() — así los inputs siguen recibiendo foco
    setDragging(true);
    dragStart.current = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y };
  };
  const onImgMove = e => {
    if (!dragging) return;
    const nx = e.clientX - dragStart.current.x;
    const ny = e.clientY - dragStart.current.y;
    lastPan.current = { x: nx, y: ny };
    setPan({ x: nx, y: ny });
  };
  const onImgUp = () => setDragging(false);

  // Rueda: con zoom activo → deja fluir scroll al modal (no hace zoom)
  //        sin zoom → tampoco hace zoom con rueda (usar botones)
  const onImgWheel = e => { /* no hacer nada — scroll pasa al padre */ };

  return (
    <div style={{ background: "#000", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Barra de controles — stopPropagation para que clicks aquí no activen drag */}
      <div onPointerDown={e => e.stopPropagation()} style={{ display: "flex", gap: 8, padding: "8px 12px", alignItems: "center", background: "rgba(0,0,0,0.6)", flexShrink: 0 }}>
        <button onClick={zoomOut} disabled={zoom <= 1} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, width: 34, height: 34, color: zoom <= 1 ? "#444" : "#fff", fontSize: 18, cursor: zoom <= 1 ? "default" : "pointer" }}>−</button>
        <button onClick={zoomIn}  disabled={zoom >= 5} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, width: 34, height: 34, color: zoom >= 5 ? "#444" : "#fff", fontSize: 18, cursor: zoom >= 5 ? "default" : "pointer" }}>+</button>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace", minWidth: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button onClick={rotate} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, width: 34, height: 34, color: "#fff", fontSize: 16, cursor: "pointer" }}>↻</button>
        {(zoom > 1 || rot > 0) && <button onClick={reset} style={{ background: "rgba(255,200,71,0.15)", border: "1px solid rgba(255,200,71,0.3)", borderRadius: 7, padding: "0 10px", height: 34, color: "#ffc847", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>RESET</button>}
      </div>
      {/* Área de imagen — ocupa todo el espacio disponible */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", userSelect: "none", minHeight: 0, position: "relative" }}>
        <img
          src={src}
          draggable={false}
          onPointerDown={onImgDown}
          onPointerMove={onImgMove}
          onPointerUp={onImgUp}
          onPointerLeave={onImgUp}
          onWheel={onImgWheel}
          style={{
            maxWidth: isZ ? "none" : "100%",
            maxHeight: isZ ? "none" : "100%",
            objectFit: "contain",
            borderRadius: isZ ? 0 : 8,
            boxShadow: "0 0 40px rgba(0,200,255,0.15)",
            transform: `rotate(${rot}deg) scale(${zoom}) translate(${pan.x / zoom}px,${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.15s ease",
            cursor: isZ ? (dragging ? "grabbing" : "grab") : "default",
            touchAction: isZ ? "none" : "auto",
          }}
          alt="Pasaporte"
        />
        {isZ && <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", pointerEvents: "none" }}>Arrastra para mover</div>}
      </div>
    </div>
  );
}

// Modal de pasaporte extraído como componente propio para que sus inputs
// tengan estado local y NO se remonten al re-renderizar el padre
function PassportModal({ modal, onClose, onSave, onChangePhoto, onDelete }) {
  const [docNum, setDocNum] = React.useState(modal.docNum || "");
  const [expiry, setExpiry] = React.useState(modal.expiry || "");

  const handleExpiry = e => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let fmt = digits;
    if (digits.length > 2) fmt = digits.slice(0, 2) + "-" + digits.slice(2);
    if (digits.length > 4) fmt = digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4, 8);
    setExpiry(fmt);
  };

  return (
    // Layout fijo: el contenedor NO scrollea — la imagen arriba, campos abajo, todo visible sin scroll
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${A.border}22`, flexShrink: 0 }}>
        <div style={{ fontFamily: ANTON, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{modal.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href={modal.src} download="pasaporte.jpg" target="_blank" rel="noreferrer"
            style={{ background: A.gold + "22", border: `1px solid ${A.gold}44`, borderRadius: 8, padding: "6px 12px", color: A.gold, fontSize: 12, fontFamily: BF, fontWeight: 700, textDecoration: "none", cursor: "pointer" }}>📲 Guardar</a>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${A.border}`, borderRadius: 8, width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>✕</button>
        </div>
      </div>
      {/* Visor zoom/rotación — ocupa el espacio disponible entre la barra y los campos */}
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <PassportImageViewer src={modal.src} />
      </div>
      {/* Campos editables — siempre visibles abajo, sin que el teclado los empuje */}
      <div style={{ background: "#0a0a12", borderTop: `2px solid ${A.cyan}33`, padding: "14px 16px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: BF, fontSize: 9, color: A.cyan, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 5 }}>Nº Documento</div>
            <input
              value={docNum}
              onChange={e => setDocNum(e.target.value.toUpperCase())}
              onFocus={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              placeholder="ABC123456"
              autoComplete="off"
              style={{ ...ais, fontFamily: ANTON, fontSize: 18, letterSpacing: 2, textAlign: "center", color: A.cyan, background: "#000", border: `2px solid ${A.cyan}44`, borderRadius: 10, padding: "12px 8px" }}
            />
          </div>
          <div>
            <div style={{ fontFamily: BF, fontSize: 9, color: A.orange, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 5 }}>Caducidad</div>
            <input
              value={expiry}
              onChange={handleExpiry}
              onFocus={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              placeholder="DD-MM-AAAA"
              inputMode="numeric"
              type="text"
              autoComplete="off"
              maxLength={10}
              style={{ ...ais, fontFamily: ANTON, fontSize: 16, textAlign: "center", color: A.text, background: "#000", border: `2px solid ${A.border}55`, borderRadius: 10, padding: "12px 8px" }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
          <button onClick={() => onSave(docNum, expiry)}
            style={{ background: `linear-gradient(90deg,${A.cyan},#00a8cc)`, border: "none", borderRadius: 10, padding: "13px", color: A.bg, fontFamily: ANTON, fontSize: 14, letterSpacing: 1, cursor: "pointer", textTransform: "uppercase" }}>
            💾 Guardar
          </button>
          <button onClick={onChangePhoto} style={{ background: A.purple + "22", border: `1px solid ${A.purple}44`, borderRadius: 10, padding: "13px", color: A.purple, fontFamily: BF, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📷 Cambiar</button>
          <button onClick={onDelete}      style={{ background: A.red + "22",    border: `1px solid ${A.red}44`,    borderRadius: 10, padding: "13px", color: A.red,    fontFamily: BF, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑 Borrar</button>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ src, onClose }) {
  const [zoom, setZoom] = React.useState(1);
  const [rot, setRot] = React.useState(0);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef(null);
  const lastPan = React.useRef({ x: 0, y: 0 });
  const isZoomed = zoom > 1;

  const handleWheel = e => {
    e.stopPropagation();
    const next = Math.min(5, Math.max(1, zoom + (e.deltaY < 0 ? 0.25 : -0.25)));
    setZoom(next);
    if (next === 1) setPan({ x: 0, y: 0 });
  };
  const handlePointerDown = e => {
    if (!isZoomed) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y };
  };
  const handlePointerMove = e => {
    if (!dragging) return;
    const nx = e.clientX - dragStart.current.x;
    const ny = e.clientY - dragStart.current.y;
    lastPan.current = { x: nx, y: ny };
    setPan({ x: nx, y: ny });
  };
  const handlePointerUp = () => setDragging(false);

  const zoomIn = e => { e.stopPropagation(); setZoom(z => Math.min(5, z + 0.5)); };
  const zoomOut = e => { e.stopPropagation(); const next = Math.max(1, zoom - 0.5); setZoom(next); if (next === 1) { setPan({ x: 0, y: 0 }); lastPan.current = { x: 0, y: 0 }; } };
  const rotate = e => { e.stopPropagation(); setRot(r => (r + 90) % 360); };
  const reset = e => { e.stopPropagation(); setZoom(1); setRot(0); setPan({ x: 0, y: 0 }); lastPan.current = { x: 0, y: 0 }; };

  return (
    <div
      onClick={!isZoomed ? onClose : undefined}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:10000,display:"flex",flexDirection:"column",touchAction:"none",userSelect:"none" }}>
      {/* Controls bar */}
      <div onClick={e=>e.stopPropagation()} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(10px)",flexShrink:0 }}>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={zoomOut} disabled={zoom<=1} style={{ background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,color:zoom<=1?"#555":"#fff",fontSize:20,cursor:zoom<=1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
          <button onClick={zoomIn} disabled={zoom>=5} style={{ background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,color:zoom>=5?"#555":"#fff",fontSize:20,cursor:zoom>=5?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
          <div style={{ display:"flex",alignItems:"center",color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:"monospace",minWidth:36,justifyContent:"center" }}>{Math.round(zoom*100)}%</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={rotate} style={{ background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>↻</button>
          {(zoom>1||rot>0) && <button onClick={reset} style={{ background:"rgba(255,200,71,0.2)",border:"1px solid rgba(255,200,71,0.4)",borderRadius:8,padding:"0 12px",height:38,color:"#ffc847",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1 }}>RESET</button>}
          <button onClick={e=>{e.stopPropagation();onClose();}} style={{ background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:38,height:38,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
      </div>
      {/* Image area */}
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative" }}>
        <img
          src={src}
          draggable={false}
          style={{
            maxWidth: isZoomed ? "none" : "100%",
            maxHeight: isZoomed ? "none" : "calc(100vh - 60px)",
            objectFit:"contain",
            transform:`rotate(${rot}deg) scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,
            transformOrigin:"center center",
            transition: dragging ? "none" : "transform 0.15s ease",
            cursor: isZoomed ? (dragging ? "grabbing" : "grab") : "default",
            borderRadius: 4,
          }}
          alt="Pasaporte"
        />
      </div>
      {isZoomed && <div style={{ textAlign:"center",padding:"6px 0 10px",fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:"sans-serif",flexShrink:0 }}>Arrastra para mover · Pinza o rueda para zoom</div>}
    </div>
  );
}

function CopyBtn({ text, label }) {
  const [ok,setOk]=useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text).then(()=>{ setOk(true); setTimeout(()=>setOk(false),2000); }); }}
      style={{ flexShrink:0,background:ok?A.green+"22":A.cyan+"22",border:`1px solid ${ok?A.green:A.cyan}44`,color:ok?A.green:A.cyan,borderRadius:8,padding:"6px 10px",fontSize:10,fontFamily:BF,cursor:"pointer",fontWeight:700 }}>
      {ok?"¡Copiado!":label||"Copiar"}
    </button>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position:"relative",marginBottom:12 }}>
      <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14 }}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Buscar..."} style={{ ...ais,paddingLeft:34,paddingRight:34 }} />
      {value && <button onClick={()=>onChange("")} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer" }}>✕</button>}
    </div>
  );
}

function AmountPad({ value, onChange }) {
  const keys = ["1","2","3","4","5","6","7","8","9",".","0","<"];
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
      {keys.map((k,i)=>(
        <button key={i} onClick={()=>{ if(k==="<") onChange(value.slice(0,-1)); else onChange(value+k); }}
          style={{ background:A.card,border:`1px solid ${A.border}`,color:A.text,borderRadius:10,padding:16,fontSize:20,fontFamily:ANTON,cursor:"pointer" }}>{k}</button>
      ))}
    </div>
  );
}

function NumPad({ title, subtitle, onSuccess, onCancel, correctPin, onVerifyAsync, pinLength = 6 }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockMsg, setLockMsg] = useState("");
  const len = correctPin ? correctPin.length : pinLength;

  const press = async d => {
    if (loading || lockMsg) return;
    if (val.length >= len) return;
    const next = val + d;
    setVal(next);
    if (next.length === len) {
      if (onVerifyAsync) {
        setLoading(true);
        const result = await onVerifyAsync(next);
        setLoading(false);
        if (result === true || result?.status === "ok") { onSuccess(result?.token); }
        else if (result?.status === "locked") { setLockMsg(`Bloqueado ${result.minutes || 30} min`); setVal(""); }
        else { setErr(true); if (result?.remaining !== undefined) setLockMsg(`${result.remaining} intentos restantes`); setTimeout(() => { setVal(""); setErr(false); setLockMsg(""); }, 1800); }
      } else if (correctPin) {
        if (next === correctPin) onSuccess();
        else { setErr(true); setTimeout(() => { setVal(""); setErr(false); }, 800); }
      }
    }
  };

  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","<"]];
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000EE",display:"flex",alignItems:"flex-end",zIndex:10000 }}>
      <div style={{ background:A.card2,borderRadius:"20px 20px 0 0",padding:"24px",width:"100%",borderTop:`1px solid ${A.border}`,boxSizing:"border-box" }}>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1,textTransform:"uppercase" }}>{title}</div>
          {subtitle && <div style={{ fontSize:13,color:A.muted,fontFamily:BF,marginTop:4 }}>{subtitle}</div>}
          <div style={{ display:"flex",gap:12,justifyContent:"center",marginTop:20 }}>
            {Array.from({length:len}).map((_,i)=>(
              <div key={i} style={{ width:14,height:14,borderRadius:"50%",background:loading?"#555":i<val.length?A.cyan:A.card,border:`1px solid ${A.border}`,transition:"background 0.1s" }} />
            ))}
          </div>
          {loading && <div style={{ color:A.muted,fontSize:13,marginTop:8,fontFamily:BF }}>Verificando…</div>}
          {err && !loading && <div style={{ color:A.red,fontSize:13,marginTop:8,fontWeight:700,fontFamily:BF }}>PIN incorrecto</div>}
          {lockMsg && !err && <div style={{ color:A.orange,fontSize:13,marginTop:8,fontWeight:700,fontFamily:BF }}>🔒 {lockMsg}</div>}
        </div>
        {KEYS.map((row,ri)=>(
          <div key={ri} style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10 }}>
            {row.map((k,ki)=>(
              <button key={ki} onClick={()=>{ if(k==="<") setVal(v=>v.slice(0,-1)); else if(k) press(k); }}
                disabled={loading || !!lockMsg}
                style={{ background:k===""?"transparent":A.card,border:k===""?"none":`1px solid ${A.border}`,borderRadius:12,padding:"16px",color:A.text,fontFamily:ANTON,fontSize:24,cursor:k===""||loading||lockMsg?"default":"pointer",opacity:loading||lockMsg?0.5:1 }}>{k}</button>
            ))}
          </div>
        ))}
        <button onClick={onCancel} style={{ width:"100%",background:"transparent",border:"none",color:A.muted,padding:"14px",fontSize:14,fontFamily:BF,cursor:"pointer",marginTop:10 }}>Cancelar</button>
      </div>
    </div>
  );
}

function RatingRow({ label, icon, value, onChange }) {
  return (
    <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${A.border}` }}>
      <div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginBottom:10,letterSpacing:2,textTransform:"uppercase" }}>{icon} {label}</div>
      <div style={{ display:"flex",gap:4 }}>
        {SURVEY_EMOJIS.map((em,i)=>(
          <button key={i} onClick={()=>onChange(i+1)}
            style={{ flex:1,background:value===i+1?A.gold+"22":A.card,border:`1px solid ${value===i+1?A.gold:A.border}`,borderRadius:10,padding:"8px 0",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
            <span style={{ fontSize:22 }}>{em}</span>
            <span style={{ fontFamily:BF,fontSize:7,color:value===i+1?A.gold:A.muted,textTransform:"uppercase",letterSpacing:1 }}>{SURVEY_LABELS[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RoomMenu({ current, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:20,width:"100%",maxWidth:320,padding:20,border:`1px solid ${A.border}` }}>
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:14,textAlign:"center" }}>Tipo de habitación</div>
        {Object.entries(ROOMS).map(([k,r])=>(
          <button key={k} onClick={()=>{ onSelect(k); onClose(); }}
            style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:current===k?r.color+"15":"transparent",border:`1px solid ${current===k?r.color:"transparent"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer" }}>
            <span style={{ fontFamily:BF,fontSize:15,color:current===k?r.color:"#fff",fontWeight:700 }}>{r.label}</span>
            {current===k && <span style={{ color:r.color,fontSize:18 }}>✓</span>}
          </button>
        ))}
        <button onClick={onClose} style={{ ...ab(A.card,A.muted),width:"100%",marginTop:10,border:`1px solid ${A.border}` }}>Cancelar</button>
      </div>
    </div>
  );
}

function FormaPagoMenu({ current, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:20,width:"100%",maxWidth:320,padding:20,border:`1px solid ${A.border}` }}>
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:14,textAlign:"center" }}>Forma de pago</div>
        {FORMAS_PAGO.map(f=>(
          <button key={f.k} onClick={()=>{ onSelect(f.k); onClose(); }}
            style={{ display:"flex",alignItems:"center",gap:14,width:"100%",background:current===f.k?A.cyan+"15":A.card,border:`1px solid ${current===f.k?A.cyan:A.border}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer" }}>
            <span style={{ fontSize:24 }}>{f.icon}</span>
            <span style={{ fontFamily:BF,fontSize:16,color:current===f.k?A.cyan:"#fff",fontWeight:700,flex:1,textAlign:"left" }}>{f.label}</span>
            {current===f.k && <span style={{ color:A.cyan,fontSize:18 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function GastoTipoMenu({ current, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:20,width:"100%",maxWidth:340,padding:20,border:`1px solid ${A.border}` }}>
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:16,textAlign:"center" }}>Categoría del gasto</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
          {GASTO_TIPOS.map(t=>(
            <button key={t.k} onClick={()=>{ onSelect(t.k); onClose(); }}
              style={{ background:current===t.k?A.orange+"22":A.card,border:`1px solid ${current===t.k?A.orange:A.border}`,borderRadius:12,padding:"14px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontFamily:BF,fontSize:11,color:current===t.k?A.orange:A.muted,textTransform:"uppercase",letterSpacing:1 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CurrencyMenu({ current, onSelect, onClose }) {
  const [q,setQ]=useState("");
  const list = q.trim() ? CURRENCIES.filter(c=>c.code.toLowerCase().includes(q.toLowerCase())||c.name.toLowerCase().includes(q.toLowerCase())) : CURRENCIES;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",zIndex:10000 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:"20px 20px 0 0",width:"100%",padding:20,maxHeight:"70vh",display:"flex",flexDirection:"column",borderTop:`1px solid ${A.border}` }}>
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:12,textAlign:"center" }}>Divisa</div>
        <SearchBar value={q} onChange={setQ} placeholder="Buscar divisa..." />
        <div style={{ overflowY:"auto",flex:1 }}>
          {list.map(c=>(
            <button key={c.code} onClick={()=>{ onSelect(c.code); onClose(); }}
              style={{ display:"flex",alignItems:"center",gap:12,width:"100%",background:current===c.code?A.gold+"15":A.card,border:`1px solid ${current===c.code?A.gold:A.border}`,borderRadius:10,padding:"11px 14px",marginBottom:6,cursor:"pointer" }}>
              <span style={{ fontFamily:ANTON,fontSize:16,color:current===c.code?A.gold:A.cyan,width:36 }}>{c.symbol}</span>
              <div style={{ flex:1,textAlign:"left" }}>
                <div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:current===c.code?A.gold:"#fff" }}>{c.code}</div>
                <div style={{ fontSize:11,color:A.muted,fontFamily:BF }}>{c.name}</div>
              </div>
              {current===c.code && <span style={{ color:A.gold }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilteredListModal({ title, clients, onClose }) {
  const [search,setSearch]=useState("");
  const displayed = search.trim() ? clients.filter(c=>matchSearch(c.nombre,search)||matchSearch(c.code||"",search)) : clients;
  return (
    <AModal title={title} onClose={onClose}>
      {clients.length>5 && <SearchBar value={search} onChange={setSearch} placeholder="Buscar..." />}
      {displayed.length===0 && <AEmpty text={search?"Sin resultados":"Sin viajeros"} />}
      {displayed.map(c=>(
        <div key={c.id} style={{ background:A.bg,borderRadius:12,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:8,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:16,color:A.cyan,flexShrink:0,overflow:"hidden" }}>
            {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />:c.nombre[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:A.text }}>{c.nombre}</div>
            {c._sub && <div style={{ fontSize:11,color:A.orange,fontFamily:BF,marginTop:2 }}>{c._sub}</div>}
          </div>
        </div>
      ))}
    </AModal>
  );
}

function RegistroPagoModal({ trips, clients, tid, sC, onClose }) {
  const trip = trips.find(t=>t.id===tid);
  const tc = clients.filter(c=>c.tripId===tid);
  const pc = trip?.pagosConfig||[];
  const [cid,setCid]=useState(tc.length>0?tc[0].id:"");
  const [pidx,setPidx]=useState(0);
  const [metodo,setMetodo]=useState("transferencia");
  const [monto,setMonto]=useState("");
  const [metodoMenu,setMetodoMenu]=useState(false);

  useEffect(()=>{
    const client=tc.find(c=>c.id===cid);
    if(client&&pc[pidx]){ const imp=(client.pagosImporteCustom||[])[pidx]||pc[pidx].importe||""; setMonto(imp.toString().replace(/[^\d.]/g,"")); }
  },[cid,pidx]);

  const handleSave=()=>{
    if(!monto||!cid) return;
    sC(clients.map(c=>{ if(c.id!==cid) return c; const ae=[...(c.pagosEstado||pc.map(()=>"pendiente"))]; ae[pidx]="pagado"; const ai=[...(c.pagosImporteCustom||pc.map(()=>null))]; ai[pidx]=`${monto}€`; return {...c,pagosEstado:ae,pagosImporteCustom:ai,formaPago:metodo}; }));
    onClose();
  };
  const currentFP=FORMAS_PAGO.find(f=>f.k===metodo)||FORMAS_PAGO[0];
  return (
    <AModal title="Registrar Pago" onClose={onClose}>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Cliente</div>
        <select value={cid} onChange={e=>setCid(e.target.value)} style={ais}>{tc.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Concepto</div>
          <select value={pidx} onChange={e=>setPidx(Number(e.target.value))} style={ais}>{pc.map((p,i)=><option key={i} value={i}>{p.label}</option>)}</select>
        </div>
        <div>
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Forma de pago</div>
          <button onClick={()=>setMetodoMenu(true)} style={{ ...ais,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 12px" }}>
            <span>{currentFP.icon} {currentFP.label}</span><span style={{ color:A.muted }}>›</span>
          </button>
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Importe (€)</div>
        <div style={{ background:A.card,border:`1px solid ${A.border}`,borderRadius:10,padding:"16px",fontSize:28,fontFamily:ANTON,color:A.cyan,textAlign:"right" }}>{monto||"0"}</div>
      </div>
      <AmountPad value={monto} onChange={setMonto} />
      <button onClick={handleSave} disabled={!monto} style={{ ...ab(A.cyan,A.bg),width:"100%",marginTop:16 }}>Confirmar Pago</button>
      {metodoMenu && <FormaPagoMenu current={metodo} onSelect={setMetodo} onClose={()=>setMetodoMenu(false)} />}
    </AModal>
  );
}

function ExpenseStats({ gastos }) {
  if (!gastos?.length) return null;
  const byTipo = {};
  gastos.forEach(g=>{ const key=g.tipo||"otros"; if(!byTipo[key]) byTipo[key]=0; byTipo[key]+=(+g.importeEUR||+g.importe||0); });
  const total = Object.values(byTipo).reduce((a,b)=>a+b,0);
  if (!total) return null;
  const sorted = Object.entries(byTipo).sort((a,b)=>b[1]-a[1]);
  const colors = [A.orange,A.cyan,A.gold,A.green,A.purple,A.lightblue,A.red,"#FF6B6B","#00CED1"];
  return (
    <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBottom:14,border:`1px solid ${A.border}` }}>
      <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>DISTRIBUCIÓN DE GASTOS</div>
      {sorted.map(([tipo,amount],i)=>{
        const ti=GASTO_TIPOS.find(t=>t.k===tipo)||GASTO_TIPOS[GASTO_TIPOS.length-1];
        const pct = total>0?(amount/total*100):0;
        const col = colors[i%colors.length];
        return (
          <div key={tipo} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
              <span style={{ fontFamily:BF,fontSize:13,color:A.muted }}>{ti.icon} {ti.label}</span>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontFamily:ANTON,fontSize:13,color:col }}>{amount.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</span>
                <span style={{ fontFamily:BF,fontSize:11,color:A.muted,marginLeft:6 }}>({pct.toFixed(0)}%)</span>
              </div>
            </div>
            <div style={{ height:8,background:A.border,borderRadius:4 }}>
              <div style={{ height:"100%",width:`${pct}%`,background:col,borderRadius:4,transition:"width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [screen,setScreen]=useState("splash");
  const [trips,setTrips]=useState([]);
  const [clients,setClients]=useState([]);
  const [crm,setCrm]=useState({});
  const [cfg,setCfg]=useState({ quickTripId:null,quickBtnLabel:"💰 Ver gastos",quickBtnColor:A.orange });
  const [nav,setNav]=useState({});
  const [adminOk,setAdminOk]=useState(false);
  const [adminToken,setAdminToken]=useState(null);

  useEffect(()=>{
    (async()=>{
      let t=await db.get(SK_T); let c=await db.get(SK_C);
      let cr=await db.get(SK_CRM); let cf=await db.get(SK_CFG);
      const savedToken=await db.get(SK_ADMIN);
      if(!t){ t=DT; await db.set(SK_T,t); }
      if(!c){ c=DC; await db.set(SK_C,c); }
      if(!cr){ cr={}; await db.set(SK_CRM,cr); }
      if(!cf){ cf={ quickTripId:null,quickBtnLabel:"💰 Ver gastos",quickBtnColor:A.orange }; await db.set(SK_CFG,cf); }
      const tt=t.map(tr=>({ hotels:[],emergencias:emptyEmergencias(),surveyEnabled:false,surveyConfig:{categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[]},maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES],maletaCats:DEFAULT_MALETA_CATS.map(mc=>({...mc,items:[...mc.items]})),gastos:[],facturas:[],facturasVenta:[],currency:"EUR",...tr,pagosConfig:(tr.pagosConfig||[]).map(p=>({fechaISO:"",...p})) }));
      const cc=c.map(cl=>({ personalDocs:[],roommateId:null,acompanantes:[],tripId:null,passportExpiry:"",passportExpiryDismissed:false,notifEnabled:false,surveySubmitted:false,maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",pagosImporteCustom:[],docNumero:"",docVerified:false,...cl,acompanantes:(cl.acompanantes||[]).map(a=>({pagosEstado:[],personalDocs:[],...a})) }));
      setTrips(tt); setClients(cc); setCrm(cr); setCfg(cf);
      let admValid = false;
      if (savedToken && savedToken !== "true" && savedToken !== true) {
        admValid = await verifySessionToken(savedToken, "admin");
        if (!admValid) await db.set(SK_ADMIN, null);
      }
      if (admValid) { setAdminOk(true); setAdminToken(savedToken); }
      const h=window.location.hash.slice(1);
      if(h){ const cl=cc.find(x=>x.code===h); if(cl){ await db.set(SK_SES,{code:cl.code}); setNav({cid:cl.id}); return setScreen(cl.firstLogin?"passport":cl.notifEnabled?"client":"notifprompt"); } }
      // ✅ FIX: sesión cliente tiene prioridad sobre token admin (evita que admin vea panel al simular cliente)
      const ses=await db.get(SK_SES);
      if(ses?.code){ const cl=cc.find(x=>x.code===ses.code); if(cl){ setNav({cid:cl.id}); return setScreen(cl.firstLogin?"passport":cl.notifEnabled?"client":"notifprompt"); } }
      if (admValid) return setScreen("ahome");
      setScreen("home");
    })();
  },[]);

  const sT=async v=>{ setTrips(v); await db.set(SK_T,v); };
  const sC=async v=>{ setClients(v); await db.set(SK_C,v); };
  const sCrm=async v=>{ setCrm(v); await db.set(SK_CRM,v); };
  const sCfg=async v=>{ setCfg(v); await db.set(SK_CFG,v); };
  const go=(s,x)=>{ setNav(n=>({...n,...(x||{})})); setScreen(s); };
  const goClient=async cl=>{ await db.set(SK_SES,{code:cl.code}); go(cl.firstLogin?"passport":cl.notifEnabled?"client":"notifprompt",{cid:cl.id}); };
  const logout=async()=>{ await db.set(SK_SES,null); go("home"); };
  const logoutAdmin=async()=>{ await logoutSessionToken(adminToken); await db.set(SK_ADMIN,null); await db.set(SK_SES,null); setAdminOk(false); setAdminToken(null); go("home"); };
  const loginAdmin=async(token)=>{ setAdminOk(true); setAdminToken(token); await db.set(SK_ADMIN,token); go("ahome"); };

  if(screen==="splash") return <Splash />;
  if(screen==="home") return <Home go={go} goClient={goClient} clients={clients} />;
  if(screen==="pin") return <PinScreen go={go} onOk={loginAdmin} alreadyOk={adminOk} />;
  if(screen==="ahome") return <AHome go={go} trips={trips} clients={clients} sT={sT} sC={sC} cfg={cfg} sCfg={sCfg} logoutAdmin={logoutAdmin} />;
  if(screen==="atrip") return <ATrip go={go} tid={nav.tid} initTab={nav.initTab} trips={trips} clients={clients} crm={crm} sT={sT} sC={sC} sCrm={sCrm} />;
  if(screen==="passport") return <Passport go={go} cid={nav.cid} clients={clients} setClients={setClients} trips={trips} sC={sC} logout={logout} />;
  if(screen==="notifprompt") return <NotifPrompt go={go} cid={nav.cid} clients={clients} sC={sC} logout={logout} />;
  if(screen==="client") return <Client go={go} cid={nav.cid} clients={clients} trips={trips} logout={logout} sC={sC} sT={sT} />;
  return <Home go={go} goClient={goClient} clients={clients} />;
}

function Splash() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:A.bg,flexDirection:"column" }}>
      <div style={{ fontFamily:ANTON,fontSize:48,color:A.cyan,letterSpacing:4 }}>TRAVELIKE</div>
      <div style={{ color:A.muted,fontSize:12,fontFamily:BF,letterSpacing:6,textTransform:"uppercase",marginTop:10 }}>Cargando...</div>
    </div>
  );
}

function Home({ go, goClient, clients }) {
  const [code,setCode]=useState(""); const [err,setErr]=useState(false);
  const [taps,setTaps]=useState(0); const timer=useRef();
  const [savedClient,setSavedClient]=useState(null);
  const tap=()=>{ const n=taps+1; setTaps(n); clearTimeout(timer.current); if(n>=5) go("pin"); else timer.current=setTimeout(()=>setTaps(0),1000); };
  const enter=()=>{ const c=code.trim().toUpperCase(); const cl=clients.find(x=>x.code===c); if(cl) goClient(cl); else { setErr(true); setTimeout(()=>setErr(false),2000); } };
  useEffect(()=>{
    try { const ses=localStorage.getItem("tv9-session"); if(ses){ const p=JSON.parse(ses); if(p?.code){ const cl=clients.find(x=>x.code===p.code); if(cl) setSavedClient(cl); } } } catch {}
  },[clients]);

  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column" }}>
      <div onClick={tap} style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"60px 24px",textAlign:"center",borderBottom:`1px solid ${A.border}` }}>
        <div style={{ fontFamily:ANTON,fontSize:52,color:"#fff",letterSpacing:3,lineHeight:1 }}>TRAVELIKE</div>
        <div style={{ fontFamily:BF,fontSize:11,letterSpacing:7,color:A.muted,textTransform:"uppercase",marginTop:8 }}>Portal del Viajero</div>
      </div>
      <div style={{ flex:1,padding:"40px 28px" }}>
        {savedClient && (
          <div style={{ background:A.cyan+"15",border:`1px solid ${A.cyan}33`,borderRadius:16,padding:"16px 18px",marginBottom:24,display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:44,height:44,borderRadius:10,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:20,color:A.cyan,flexShrink:0 }}>
              {savedClient.passportPhoto?<img src={savedClient.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover",borderRadius:10 }} alt="" />:savedClient.nombre[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:2 }}>Sesión guardada</div>
              <div style={{ fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:0.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{savedClient.nombre}</div>
            </div>
            <button onClick={()=>goClient(savedClient)} style={{ background:`linear-gradient(90deg,${A.cyan},#0099bb)`,border:"none",color:A.bg,borderRadius:10,padding:"10px 16px",fontFamily:ANTON,fontSize:14,letterSpacing:1,cursor:"pointer",flexShrink:0,textTransform:"uppercase" }}>Entrar</button>
          </div>
        )}
        <div style={{ fontFamily:ANTON,fontSize:28,letterSpacing:1,color:"#fff",marginBottom:16 }}>TU VIAJE EMPIEZA AQUÍ</div>
        <div style={{ fontSize:16,color:A.muted,marginBottom:28,lineHeight:1.6,fontFamily:BF }}>Introduce tu código de acceso personal para acceder a tu portal.</div>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&enter()} placeholder="CÓDIGO"
          style={{ width:"100%",padding:"22px 20px",fontSize:32,textAlign:"center",background:A.card2,border:`2px solid ${err?A.red:A.border}`,color:err?A.red:A.cyan,borderRadius:16,fontFamily:ANTON,letterSpacing:4,outline:"none",marginBottom:16,textTransform:"uppercase",boxSizing:"border-box" }} />
        {err && <div style={{ color:A.red,fontSize:16,fontWeight:700,marginBottom:16,textAlign:"center",fontFamily:BF }}>Código incorrecto</div>}
        <button onClick={enter} style={{ width:"100%",padding:"18px",border:"none",borderRadius:14,fontFamily:ANTON,fontSize:18,letterSpacing:3,cursor:"pointer",background:`linear-gradient(90deg,${A.cyan},#0099bb)`,color:A.bg,textTransform:"uppercase",marginTop:10 }}>ENTRAR</button>
      </div>
    </div>
  );
}

function PinScreen({ go, onOk, alreadyOk }) {
  useEffect(() => { if (alreadyOk) go("ahome"); }, []);
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  const tryPin = async () => {
    if (!pin.trim() || status === "loading" || status === "locked") return;
    setStatus("loading");
    const result = await verifyPin(pin, "admin");
    setPin("");
    if (result.status === "ok") { onOk(result.token); }
    else if (result.status === "locked") { setStatus("locked"); setMsg(`Demasiados intentos. Bloqueado ${result.minutes || 30} minutos.`); }
    else if (result.status === "invalid") { setStatus("error"); const r = result.remaining; setMsg(r > 0 ? `PIN incorrecto — ${r} intento${r>1?"s":""} restante${r>1?"s":""}` : "PIN incorrecto — último intento agotado"); setTimeout(() => setStatus("idle"), 3000); }
    else { setStatus("error"); setMsg("Error de conexión. Comprueba tu red."); setTimeout(() => setStatus("idle"), 3000); }
  };

  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",padding:"60px 28px",textAlign:"center",fontFamily:BF }}>
      <div style={{ fontSize:48,marginBottom:16 }}>🔐</div>
      <div style={{ fontFamily:ANTON,fontSize:36,letterSpacing:2,color:"#fff",marginBottom:8 }}>ADMIN</div>
      <div style={{ fontSize:13,color:A.muted,marginBottom:40,letterSpacing:2 }}>ACCESO RESTRINGIDO</div>
      {status==="locked" ? (
        <div style={{ background:A.red+"18",border:`1px solid ${A.red}44`,borderRadius:16,padding:"28px 20px",marginBottom:24 }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🔒</div>
          <div style={{ fontFamily:ANTON,fontSize:20,color:A.red,marginBottom:8 }}>ACCESO BLOQUEADO</div>
          <div style={{ fontSize:14,color:A.muted,lineHeight:1.7 }}>{msg}</div>
        </div>
      ) : (
        <>
          <input type="password" value={pin} onChange={e=>{ setPin(e.target.value); if(status!=="idle") setStatus("idle"); }} onKeyDown={e=>e.key==="Enter"&&tryPin()} placeholder="PIN" autoComplete="current-password"
            style={{ width:"100%",padding:"22px",fontSize:32,textAlign:"center",background:A.card2,border:`2px solid ${status==="error"?A.red:A.border}`,color:A.text,borderRadius:16,fontFamily:ANTON,outline:"none",marginBottom:16,boxSizing:"border-box",letterSpacing:6 }} />
          {status==="error" && <div style={{ color:A.red,fontSize:13,marginBottom:16,fontWeight:700 }}>{msg}</div>}
          {status==="idle" && <div style={{ fontSize:12,color:A.muted,marginBottom:16 }}>5 intentos fallidos = bloqueo de 30 min</div>}
          {status==="loading" && <div style={{ fontSize:13,color:A.muted,marginBottom:16 }}>Verificando…</div>}
          <button onClick={tryPin} disabled={status==="loading"||!pin.trim()} style={{ width:"100%",padding:"18px",border:"none",borderRadius:14,fontFamily:ANTON,fontSize:16,letterSpacing:2,cursor:status==="loading"||!pin.trim()?"default":"pointer",background:status==="loading"?A.card2:A.cyan,color:status==="loading"?A.muted:A.bg,textTransform:"uppercase",marginBottom:16,opacity:!pin.trim()?0.5:1 }}>
            {status==="loading"?"Verificando…":"ENTRAR"}
          </button>
        </>
      )}
      <button onClick={()=>go("home")} style={{ background:"none",border:"none",color:A.muted,fontSize:14,cursor:"pointer",fontFamily:BF }}>Volver</button>
    </div>
  );
}

function AHome({ go, trips, clients, sT, sC, cfg, sCfg, logoutAdmin }) {
  const [subScreen,setSubScreen]=useState(null);
  const [cfgModal,setCfgModal]=useState(false);
  const [addTripModal,setAddTripModal]=useState(false);
  const [passModal,setPassModal]=useState(false);
  const [tripName,setTripName]=useState(""); const [tripFlag,setTripFlag]=useState("🌍");
  const [tripMonth,setTripMonth]=useState(String(NOW.getMonth()+1)); const [tripYear,setTripYear]=useState(String(NOW.getFullYear()));
  const [tripPrice,setTripPrice]=useState(""); const [tripFechas,setTripFechas]=useState("");
  const [tripWebUrl,setTripWebUrl]=useState(""); const [tripCurrency,setTripCurrency]=useState("EUR");
  const [currMenu,setCurrMenu]=useState(false);

  const up=trips.filter(t=>!isPast(t.date)).sort((a,b)=>a.date.localeCompare(b.date));
  const hist=trips.filter(t=>isPast(t.date)).sort((a,b)=>b.date.localeCompare(a.date));
  const passWarn=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpiryDismissed).length;
  const quickTrip=cfg.quickTripId?trips.find(t=>t.id===cfg.quickTripId):null;
  const totalViajeros=clients.length;
  const totalConfirmados=clients.filter(c=>c.status==="confirmado"||c.status==="pagado").length;

  const addTrip=()=>{
    if(!tripName.trim()||tripYear.length!==4) return;
    const date=`${tripYear}-${String(tripMonth).padStart(2,"0")}`;
    sT([...trips,{ id:`t${uid()}`,name:tripName.trim(),flag:tripFlag||"🌍",date,price:tripPrice?+tripPrice:null,currency:tripCurrency,fechas:tripFechas||fmt(date),webUrl:tripWebUrl||"",...emptyT() }].sort((a,b)=>a.date.localeCompare(b.date)));
    setAddTripModal(false); setTripName(""); setTripFlag("🌍"); setTripMonth(String(NOW.getMonth()+1)); setTripYear(String(NOW.getFullYear())); setTripPrice(""); setTripFechas(""); setTripWebUrl(""); setTripCurrency("EUR");
  };
  const delTrip=id=>{ if(!window.confirm("¿Eliminar viaje?")) return; sT(trips.filter(t=>t.id!==id)); sC(clients.filter(c=>c.tripId!==id)); };
  const passWarnList=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpiryDismissed).map(c=>{ const d=daysUntilExpiry(c.passportExpiry); const dateStr=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):""; return {...c,_sub:`${d!==null&&d>=0?`Caduca en ${d} días`:"VENCIDO"}${dateStr?` · ${dateStr}`:""}`}; });
  // ✅ NUEVO: pasaportes que caducan en menos de 1 año (365 días)
  const passExpireYear=clients.filter(c=>{ const d=daysUntilExpiry(c.passportExpiry); return d!==null&&d<=365; }).map(c=>{ const d=daysUntilExpiry(c.passportExpiry); const dateStr=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):""; return {...c,_days:d,_dateStr:dateStr}; }).sort((a,b)=>a._days-b._days);

  if(subScreen==="clients") return (
    <div style={{ background:A.bg,minHeight:"100vh" }}>
      <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10 }}>
        <button onClick={()=>setSubScreen(null)} style={{ background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0 }}>←</button>
        <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1 }}>Clientes</div>
      </div>
      <ClientesTab clients={clients} trips={trips} sC={sC} />
    </div>
  );

  if(subScreen==="notifs") return (
    <div style={{ background:A.bg,minHeight:"100vh" }}>
      <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10 }}>
        <button onClick={()=>setSubScreen(null)} style={{ background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0 }}>←</button>
        <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1 }}>Notificaciones</div>
      </div>
      <NotifAdmin trips={trips} clients={clients} />
    </div>
  );

  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF }}>
      <div style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"24px 16px 16px",borderBottom:`1px solid ${A.border}` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
          <div>
            <div style={{ fontFamily:ANTON,fontSize:28,letterSpacing:2,color:"#fff",textTransform:"uppercase",lineHeight:1 }}>TRAVELIKE</div>
            <div style={{ fontSize:10,color:A.cyan,letterSpacing:4,textTransform:"uppercase",marginTop:2 }}>Panel de control</div>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            {passWarn>0 && <button onClick={()=>setPassModal(true)} style={{ background:A.red+"22",border:`1px solid ${A.red}44`,borderRadius:10,padding:"6px 10px",color:A.red,fontFamily:BF,fontSize:11,fontWeight:700,cursor:"pointer" }}>🛂 {passWarn}</button>}
            <button onClick={logoutAdmin} style={{ background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:"6px 10px",color:A.muted,fontFamily:BF,fontSize:11,cursor:"pointer" }}>🔓 Salir</button>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,marginTop:8 }}>
          {[{l:"Próximos",v:up.length,c:A.cyan},{l:"Histórico",v:hist.length,c:A.muted},{l:"Viajeros",v:totalViajeros,c:A.orange},{l:"Confirm.",v:totalConfirmados,c:A.green}].map(item=>(
            <div key={item.l} style={{ flex:1,background:A.card2,borderRadius:10,padding:"7px 6px",border:`1px solid ${A.border}`,textAlign:"center" }}>
              <div style={{ fontFamily:ANTON,fontSize:18,color:item.c,lineHeight:1 }}>{item.v}</div>
              <div style={{ fontSize:8,color:A.muted,letterSpacing:1,textTransform:"uppercase",marginTop:2,fontFamily:BF }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"10px 16px 0" }}>
        {quickTrip?(
          <button onClick={()=>go("atrip",{tid:quickTrip.id,initTab:"finanzas"})} style={{ width:"100%",background:`${cfg.quickBtnColor}22`,border:`2px solid ${cfg.quickBtnColor}55`,borderRadius:14,padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxSizing:"border-box" }}>
            <span style={{ fontSize:24 }}>{quickTrip.flag}</span>
            <div style={{ flex:1,textAlign:"left" }}>
              <div style={{ fontFamily:ANTON,fontSize:14,color:cfg.quickBtnColor,letterSpacing:1,textTransform:"uppercase" }}>{cfg.quickBtnLabel}</div>
              <div style={{ fontFamily:BF,fontSize:10,color:A.muted,marginTop:1 }}>{quickTrip.name}</div>
            </div>
            <div onClick={e=>{ e.stopPropagation(); setCfgModal(true); }} style={{ color:A.muted,fontSize:16,cursor:"pointer",padding:"4px 6px" }}>⚙️</div>
          </button>
        ):(
          <button onClick={()=>setCfgModal(true)} style={{ width:"100%",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:14,padding:"10px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:A.muted,fontFamily:BF,fontSize:12,boxSizing:"border-box" }}>
            <span style={{ fontSize:18 }}>⚡</span>Añadir botón de acceso rápido
          </button>
        )}
      </div>
      <div style={{ padding:"12px 16px" }}>
        {/* ✅ WIDGET: Pasaportes que caducan en menos de 1 año */}
        {passExpireYear.length>0&&(
          <div style={{ background:A.card,borderRadius:16,border:`1.5px solid ${A.red}44`,overflow:"hidden",marginBottom:10 }}>
            <div style={{ padding:"10px 14px 8px",background:A.red+"18",display:"flex",alignItems:"center",gap:10 }}>
              <span style={{ fontSize:18 }}>🛂</span>
              <div style={{ fontFamily:ANTON,fontSize:13,color:A.red,letterSpacing:1,textTransform:"uppercase",flex:1 }}>Pasaportes — próxima caducidad</div>
              <div style={{ fontFamily:BF,fontSize:11,color:A.muted }}>{passExpireYear.length} viajero{passExpireYear.length!==1?"s":""}</div>
            </div>
            {passExpireYear.map(c=>(
              <div key={c.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"9px 14px",borderTop:`1px solid ${A.border}44` }}>
                <div style={{ width:32,height:32,borderRadius:8,background:A.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:ANTON,fontSize:13,color:A.cyan,overflow:"hidden" }}>
                  {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />:c.nombre[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.nombre}</div>
                  <div style={{ fontFamily:BF,fontSize:11,color:A.muted }}>{c._dateStr}</div>
                </div>
                <div style={{ fontFamily:ANTON,fontSize:13,letterSpacing:0.5,flexShrink:0,color:c._days<0?A.red:c._days<=60?A.red:c._days<=180?A.orange:A.gold }}>
                  {c._days<0?"VENCIDO":c._days===0?"HOY":`${c._days}d`}
                </div>
              </div>
            ))}
          </div>
        )}
        {[{ icon:"👥",label:"Clientes",desc:`${totalViajeros} registrados`,color:A.green,action:()=>setSubScreen("clients") },
          { icon:"🔔",label:"Notificaciones",desc:"OneSignal push",color:A.purple,action:()=>setSubScreen("notifs") }
        ].map(item=>(
          <button key={item.label} onClick={item.action} style={{ width:"100%",background:A.card,border:`1.5px solid ${item.color}22`,borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,marginBottom:10,boxSizing:"border-box",textAlign:"left",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:item.color+"10",pointerEvents:"none" }} />
            <div style={{ width:48,height:48,borderRadius:14,background:item.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{item.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:ANTON,fontSize:18,color:item.color,letterSpacing:1,textTransform:"uppercase",lineHeight:1,marginBottom:4 }}>{item.label}</div>
              <div style={{ fontFamily:BF,fontSize:12,color:A.muted }}>{item.desc}</div>
            </div>
            <div style={{ color:item.color,fontSize:20 }}>›</div>
          </button>
        ))}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 8px" }}>
          <div style={{ fontFamily:ANTON,fontSize:14,color:A.text,letterSpacing:1,textTransform:"uppercase" }}>Viajes Próximos</div>
          <button onClick={()=>setAddTripModal(true)} style={{ ...ab(A.cyan+"22",A.cyan),padding:"5px 12px",fontSize:11,borderRadius:8,border:`1px solid ${A.cyan}33`,fontFamily:BF }}>+ Nuevo</button>
        </div>
        {up.length===0 && <div style={{ padding:"14px",color:A.muted,fontSize:13,fontFamily:BF,textAlign:"center" }}>Sin viajes próximos</div>}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
          {up.map(t=>{ const tc=clients.filter(c=>c.tripId===t.id); const conf=tc.filter(c=>c.status==="confirmado"||c.status==="pagado").length; return (
            <div key={t.id} onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{ background:A.card,borderRadius:16,padding:"16px",border:`1px solid ${A.border}`,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:8,cursor:"pointer",position:"relative" }}>
              <button onClick={e=>{ e.stopPropagation(); delTrip(t.id); }} style={{ position:"absolute",top:8,right:8,background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer" }}>✕</button>
              <span style={{ fontSize:40,marginTop:4 }}>{t.flag}</span>
              <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,lineHeight:1.1 }}>{t.name}</div>
              <div style={{ fontSize:11,color:A.cyan,fontFamily:BF }}>{fmt(t.date)}</div>
              <div style={{ fontSize:10,color:A.muted,fontFamily:BF,background:A.card2,padding:"4px 8px",borderRadius:8 }}>{conf}/{tc.length} conf.</div>
            </div>
          ); })}
        </div>
        {hist.length>0 && (
          <div style={{ padding:"12px 0" }}>
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10 }}>Histórico</div>
            {hist.map(t=>(
              <div key={t.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 10px",background:A.card,borderRadius:10,marginBottom:8,border:`1px solid ${A.border}66` }}>
                <span onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{ fontSize:18,cursor:"pointer" }}>{t.flag}</span>
                <div onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{ flex:1,fontFamily:BF,fontSize:13,color:A.muted,cursor:"pointer" }}>{t.name}</div>
                <div style={{ fontFamily:BF,fontSize:10,color:A.muted,marginRight:4 }}>{fmt(t.date)}</div>
                <button onClick={e=>{ e.stopPropagation(); delTrip(t.id); }} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",padding:"2px 4px",flexShrink:0 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {addTripModal && (
        <AModal title="Nuevo viaje" onClose={()=>setAddTripModal(false)}>
          <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:10,marginBottom:10 }}>
            <input value={tripFlag} onChange={e=>setTripFlag(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:24,padding:"8px" }} />
            <input value={tripName} onChange={e=>setTripName(e.target.value)} placeholder="Nombre del viaje" style={ais} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 88px",gap:10,marginBottom:10 }}>
            <select value={tripMonth} onChange={e=>setTripMonth(e.target.value)} style={ais}>{MES_F.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
            <input value={tripYear} onChange={e=>setTripYear(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="2026" inputMode="numeric" style={ais} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginBottom:10 }}>
            <input value={tripPrice} onChange={e=>setTripPrice(e.target.value.replace(/[^\d.]/g,""))} placeholder="Precio" inputMode="numeric" style={ais} />
            <button onClick={()=>setCurrMenu(true)} style={{ ...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold }}>{tripCurrency} <span style={{ color:A.muted,fontSize:11 }}>▾</span></button>
          </div>
          <input value={tripFechas} onChange={e=>setTripFechas(e.target.value)} placeholder="Fechas para viajeros" style={{ ...ais,marginBottom:10 }} />
          <input value={tripWebUrl} onChange={e=>setTripWebUrl(e.target.value)} placeholder="URL web del viaje" style={{ ...ais,marginBottom:14 }} />
          <ARow>
            <button onClick={()=>setAddTripModal(false)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button>
            <button onClick={addTrip} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Añadir</button>
          </ARow>
          {currMenu && <CurrencyMenu current={tripCurrency} onSelect={setTripCurrency} onClose={()=>setCurrMenu(false)} />}
        </AModal>
      )}
      {cfgModal && <QuickCfgModal cfg={cfg} trips={trips} sCfg={sCfg} onClose={()=>setCfgModal(false)} />}
      {passModal && <FilteredListModal title="Alertas de pasaporte" clients={passWarnList} onClose={()=>setPassModal(false)} />}
    </div>
  );
}

function QuickCfgModal({ cfg, trips, sCfg, onClose }) {
  const [label,setLabel]=useState(cfg.quickBtnLabel||"💰 Ver gastos");
  const [color,setColor]=useState(cfg.quickBtnColor||A.orange);
  const [tripId,setTripId]=useState(cfg.quickTripId||"");
  const save=()=>{ sCfg({ quickTripId:tripId||null,quickBtnLabel:label,quickBtnColor:color }); onClose(); };
  const COLORS=[A.orange,A.cyan,A.gold,A.green,A.red,A.purple,"#FF6B6B","#00CED1"];
  return (
    <AModal title="Botón rápido" onClose={onClose}>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Texto del botón</div>
      <input value={label} onChange={e=>setLabel(e.target.value)} style={{ ...ais,marginBottom:14 }} />
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Viaje de destino</div>
      <select value={tripId} onChange={e=>setTripId(e.target.value)} style={{ ...ais,marginBottom:14 }}>
        <option value="">Sin asignar</option>
        {trips.map(t=><option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
      </select>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Color</div>
      <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
        {COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{ width:36,height:36,borderRadius:10,background:c,border:`3px solid ${color===c?"#fff":c}`,cursor:"pointer",flexShrink:0 }} />)}
      </div>
      <ARow>
        <button onClick={onClose} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button>
        <button onClick={save} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Guardar</button>
      </ARow>
    </AModal>
  );
}

function ClientesTab({ clients, trips, sC }) {
  const [modal,setModal]=useState(false);
  const [nombre,setNombre]=useState(""); const [email,setEmail]=useState("");
  const [copied,setCopied]=useState(null);
  const [filter,setFilter]=useState("all"); const [search,setSearch]=useState("");
  const getLink=c=>`${window.location.href.split("#")[0]}#${c.code}`;
  const openWA=c=>{ const link=getLink(c); const trip=c.tripId?trips.find(t=>t.id===c.tripId):null; const msg=trip?`Hola ${c.nombre.split(" ")[0]}!\n\nPortal del viaje ${trip.name}:\n${link}`:`Hola ${c.nombre.split(" ")[0]}!\n\nPortal Travelike:\n${link}`; window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,"_blank"); };
  const addClient=()=>{ if(!nombre.trim()) return; sC([...clients,{ id:`cl${uid()}`,nombre:nombre.trim(),email:email||"",tripId:null,code:genCode(),status:"interesado",room:"doble_jun",note:"",pagosEstado:[],pagosImporteCustom:[],personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,passportExpiry:"",passportExpiryDismissed:false,notifEnabled:false,roommateId:null,surveySubmitted:false,acompanantes:[],maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",docNumero:"",docVerified:false }]); setNombre(""); setEmail(""); setModal(false); };
  const base=filter==="all"?clients:filter==="notrip"?clients.filter(c=>!c.tripId):clients.filter(c=>c.tripId===filter);
  const displayed=search.trim()?base.filter(c=>matchSearch(c.nombre,search)||matchSearch(c.code,search)):base;
  const getFL=k=>{ if(k==="all") return `Todos (${clients.length})`; if(k==="notrip") return `Sin viaje (${clients.filter(c=>!c.tripId).length})`; const t=trips.find(x=>x.id===k); return t?`${t.flag} ${t.name.split(" ")[0]} (${clients.filter(c=>c.tripId===k).length})`:k; };
  return (
    <div style={{ padding:"12px 16px" }}>
      <div style={{ display:"flex",borderBottom:`1px solid ${A.border}`,background:A.card2,overflowX:"auto",marginBottom:10 }}>
        {[{k:"all"},{k:"notrip"},...trips.map(t=>({k:t.id}))].map(item=>(
          <button key={item.k} onClick={()=>setFilter(item.k)} style={{ flexShrink:0,background:"transparent",border:"none",borderBottom:`2px solid ${filter===item.k?A.cyan:"transparent"}`,color:filter===item.k?A.text:A.muted,padding:"9px 14px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:BF,letterSpacing:1,whiteSpace:"nowrap" }}>{getFL(item.k)}</button>
        ))}
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o código..." />
      <button onClick={()=>setModal(true)} style={{ ...ab(A.cyan+"22",A.cyan),width:"100%",border:`1.5px dashed ${A.cyan}`,borderRadius:10,marginBottom:12,fontFamily:BF }}>+ Registrar cliente</button>
      {displayed.length===0 && <AEmpty text={search?"Sin resultados":"Sin clientes"} />}
      {displayed.map(c=>{
        const trip=c.tripId?trips.find(t=>t.id===c.tripId):null;
        const st=ST.find(s=>s.key===c.status)||ST[0];
        const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_PAGO[0];
        return (
          <div key={c.id} style={{ background:A.card,borderRadius:14,padding:"12px 14px",marginBottom:10,border:`1px solid ${A.border}44` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
              <div style={{ width:42,height:42,borderRadius:10,overflow:"hidden",background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />:<span style={{ fontFamily:ANTON,fontSize:17,color:A.cyan }}>{c.nombre[0]?.toUpperCase()}</span>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:ANTON,fontSize:15,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.nombre}</div>
                <div style={{ fontSize:10,color:trip?A.cyan:A.orange,fontFamily:BF }}>{trip?`${trip.flag} ${trip.name}`:"Sin viaje asignado"}</div>
              </div>
              <button onClick={()=>sC(clients.filter(x=>x.id!==c.id))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
              <span style={{ fontSize:9,color:A.muted,background:A.card2,padding:"4px 8px",borderRadius:6,border:`1px solid ${A.border}`,fontFamily:BF }}>🏷️ {c.code}</span>
              <span style={{ fontSize:9,padding:"4px 8px",borderRadius:6,background:st.color+"22",color:st.color,border:`1px solid ${st.color}44`,fontFamily:BF }}>{st.emoji} {st.label}</span>
              <span style={{ fontSize:9,padding:"4px 8px",borderRadius:6,background:A.cyan+"15",color:A.cyan,border:`1px solid ${A.cyan}22`,fontFamily:BF }}>{fp.icon} {fp.label}</span>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={()=>{ navigator.clipboard.writeText(getLink(c)).then(()=>{ setCopied(c.id); setTimeout(()=>setCopied(null),2500); }); }} style={{ ...ab(copied===c.id?A.green+"22":A.cyan+"22",copied===c.id?A.green:A.cyan),flex:1,fontSize:11,padding:"7px 8px",borderRadius:8,border:`1px solid ${copied===c.id?A.green:A.cyan}44`,fontFamily:BF }}>{copied===c.id?"Copiado":"🔗 Link"}</button>
              <button onClick={()=>openWA(c)} style={{ ...ab(A.green+"22",A.green),flex:1,fontSize:11,padding:"7px 8px",borderRadius:8,border:`1px solid ${A.green}44`,fontFamily:BF }}>💬 WhatsApp</button>
            </div>
          </div>
        );
      })}
      {modal && (
        <AModal title="Nuevo cliente" onClose={()=>setModal(false)}>
          <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre completo" style={{ ...ais,marginBottom:10 }} />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (opcional)" type="email" style={{ ...ais,marginBottom:14 }} />
          <ARow>
            <button onClick={()=>setModal(false)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button>
            <button onClick={addClient} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Registrar</button>
          </ARow>
        </AModal>
      )}
    </div>
  );
}

function NotifAdmin({ trips, clients }) {
  const [mode,setMode]=useState("manual");
  const [templates,setTemplates]=useState(DEFAULT_TEMPLATES);
  const [editingId,setEditingId]=useState(null);
  const [notifTitle,setNotifTitle]=useState(""); const [notifBody,setNotifBody]=useState("");
  const [notifTarget,setNotifTarget]=useState("all"); const [notifTripId,setNotifTripId]=useState("");
  const [sent,setSent]=useState(null); const [sending,setSending]=useState(false);
  const notifCount=clients.filter(c=>c.notifEnabled).length;

  const send=async(title,body,target,tripId)=>{
    setSending(true);
    let errorMsg = "";
    try {
      const filters = target === "trip" && tripId ? [{ field:"tag",key:"tripId",relation:"=",value:tripId }] : [];
      const result = await sendOneSignal(title, body, filters);
      const count = target==="all" ? clients.filter(c=>c.notifEnabled).length : clients.filter(c=>c.tripId===tripId&&c.notifEnabled).length;
      const ok = result.id && !result.errors;
      if (!ok) errorMsg = result.errors ? JSON.stringify(result.errors) : (result.error || "Sin respuesta del servidor");
      setSent({ title, count, ok, errorMsg, simulated: result.simulated });
    } catch(e) { setSent({ title, count:0, ok:false, errorMsg:e.message }); }
    setSending(false);
    setTimeout(()=>setSent(null),8000);
  };
  const handleSend=()=>{ if(!notifTitle.trim()||!notifBody.trim()) return; send(notifTitle,notifBody,notifTarget,notifTripId); setNotifTitle(""); setNotifBody(""); };
  const updTemplate=(id,changes)=>setTemplates(ts=>ts.map(t=>t.id===id?{...t,...changes}:t));

  return (
    <div style={{ padding:"12px 16px" }}>
      {sent && (
        <div style={{ background:(sent.ok?A.green:A.red)+"22",border:`2px solid ${sent.ok?A.green:A.red}44`,borderRadius:14,padding:"14px 16px",marginBottom:14,fontFamily:BF }}>
          <div style={{ fontFamily:ANTON,fontSize:18,color:sent.ok?A.green:A.red,marginBottom:4 }}>{sent.ok?"✅ ENVIADO":"❌ ERROR"}</div>
          <div style={{ fontSize:13,color:A.muted }}>«{sent.title}»{sent.ok?` — ${sent.count} viajero${sent.count!==1?"s":""}`:""}</div>
          {!sent.ok && sent.errorMsg && <div style={{ fontSize:11,color:A.red,marginTop:6,background:A.bg,borderRadius:8,padding:"6px 10px",wordBreak:"break-all" }}>{sent.errorMsg}</div>}
        </div>
      )}
      <div style={{ background:A.card2,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid ${A.border}`,display:"flex",gap:10,alignItems:"center" }}>
        <div style={{ fontSize:28 }}>🔔</div>
        <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:16,color:"#fff" }}>OneSignal</div><div style={{ fontSize:11,color:A.muted,fontFamily:BF }}>{notifCount} viajeros con notificaciones · REST Key activa</div></div>
      </div>
      <div style={{ display:"flex",background:A.card2,borderRadius:10,padding:4,marginBottom:14,gap:4 }}>
        {[{k:"manual",l:"Manual"},{k:"templates",l:"Plantillas"}].map(item=>(
          <button key={item.k} onClick={()=>setMode(item.k)} style={{ flex:1,background:mode===item.k?A.cyan:A.card2,color:mode===item.k?A.bg:A.muted,border:"none",borderRadius:8,padding:"10px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer" }}>{item.l}</button>
        ))}
      </div>
      {mode==="manual" && (
        <div>
          <input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="Título" style={{ ...ais,marginBottom:10 }} />
          <textarea value={notifBody} onChange={e=>setNotifBody(e.target.value)} placeholder="Mensaje..." style={{ ...ais,minHeight:80,resize:"vertical",lineHeight:1.5,marginBottom:10 }} />
          <div style={{ background:A.card2,borderRadius:10,padding:"12px",marginBottom:10,border:`1px solid ${A.border}` }}>
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Destinatarios</div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {[{k:"all",l:"Todos"},...trips.map(t=>({k:t.id,l:`${t.flag} ${t.name.split(" ")[0]}`}))].map(item=>{ const active=(notifTarget==="all"&&item.k==="all")||notifTripId===item.k; return (<button key={item.k} onClick={()=>{ if(item.k==="all"){setNotifTarget("all");setNotifTripId("");}else{setNotifTarget("trip");setNotifTripId(item.k);}}} style={{ ...ab(active?A.cyan:A.card,active?A.bg:A.muted),fontSize:11,padding:"6px 12px",borderRadius:20,border:`1px solid ${active?A.cyan:A.border}` }}>{item.l}</button>); })}
            </div>
          </div>
          <button onClick={handleSend} disabled={sending||!notifTitle.trim()||!notifBody.trim()} style={{ width:"100%",padding:"14px",borderRadius:10,border:"none",fontFamily:ANTON,fontSize:16,letterSpacing:2,cursor:"pointer",background:`linear-gradient(90deg,${A.red},#c00020)`,color:"#fff",textTransform:"uppercase" }}>{sending?"Enviando...":"ENVIAR"}</button>
        </div>
      )}
      {mode==="templates" && (
        <div>
          {templates.map(t=>(
            <div key={t.id} style={{ background:A.card,borderRadius:12,padding:"14px",marginBottom:10,border:`1px solid ${editingId===t.id?A.cyan+"44":A.border+"44"}` }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                <span style={{ fontSize:24,flexShrink:0 }}>{t.emoji}</span>
                <div style={{ flex:1 }}>
                  {editingId===t.id?(
                    <div><input value={t.title} onChange={e=>updTemplate(t.id,{title:e.target.value})} style={{ ...ais,marginBottom:8,fontSize:14 }} /><textarea value={t.body} onChange={e=>updTemplate(t.id,{body:e.target.value})} style={{ ...ais,minHeight:70,resize:"vertical",lineHeight:1.5,fontSize:13 }} /></div>
                  ):(
                    <div><div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:A.text }}>{t.title}</div><div style={{ fontSize:12,color:A.muted,marginTop:3,lineHeight:1.5 }}>{t.body}</div></div>
                  )}
                </div>
                <button onClick={()=>setEditingId(editingId===t.id?null:t.id)} style={{ background:"transparent",border:"none",color:editingId===t.id?A.cyan:A.muted,fontSize:16,cursor:"pointer" }}>{editingId===t.id?"✓":"✏️"}</button>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <select defaultValue="all" id={`sel-${t.id}`} style={{ ...ais,flex:1,fontSize:11,padding:"6px 8px" }}>
                  <option value="all">Todos</option>
                  {trips.map(tr=><option key={tr.id} value={tr.id}>{tr.flag} {tr.name.split(" ")[0]}</option>)}
                </select>
                <button onClick={()=>{ const sel=document.getElementById(`sel-${t.id}`); const v=sel?sel.value:"all"; send(t.title,t.body,v==="all"?"all":"trip",v); }} disabled={sending}
                  style={{ ...ab(`linear-gradient(90deg,${A.red},#c00020)`,"#fff"),padding:"6px 18px",borderRadius:8,fontSize:12,fontFamily:BF,flexShrink:0 }}>{sending?"...":"Enviar"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ATrip({ go, tid, initTab, trips, clients, crm, sT, sC, sCrm }) {
  const trip=trips.find(t=>t.id===tid);
  const [tab,setTab]=useState(initTab||"menu");
  const [notes,setNotes]=useState("");
  const [viewPhoto,setViewPhoto]=useState(null);
  const passRef=useRef();
  const [upIdx,setUpIdx]=useState(null);
  const [passModal,setPassModal]=useState(null);
  
  const chPassRef=useRef();
  const [stFilterModal,setStFilterModal]=useState(null);
  const [rmModal,setRmModal]=useState(null);
  const [roomMenu,setRoomMenu]=useState(null);
  const [acmpModal,setAcmpModal]=useState(null);
  const [fpMenu,setFpMenu]=useState(null);
  const [registroPagoModal,setRegistroPagoModal]=useState(false);

  useEffect(()=>{ if(trip) setNotes((crm[tid]||{}).notes||""); },[tid]);

  if(!trip) return <div style={{ padding:40,background:A.bg,color:A.muted,minHeight:"100vh",fontFamily:BF }}>Viaje no encontrado</div>;

  const tc=clients.filter(c=>c.tripId===tid);
  const updTrip=async fn=>sT(trips.map(t=>t.id===tid?fn(t):t));
  const updClient=async(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
  const addPass=(file,cid)=>{ const r=new FileReader(); r.onload=e=>updClient(cid,c=>({...c,passportPhoto:e.target.result})); r.readAsDataURL(file); };
  const hasUrgent=c=>(trip.pagosConfig||[]).some((p,i)=>{ const st=(c.pagosEstado||[])[i]; return st!=="pagado"&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)); });
  const setRoommate=async(aId,bId)=>{ sC(clients.map(c=>{ if(c.id===aId) return {...c,roommateId:bId}; if(bId&&c.id===bId) return {...c,roommateId:aId}; if(!bId&&c.roommateId===aId) return {...c,roommateId:null}; return c; })); };

  // ─── PEOPLE TAB ───
  const PeopleTab=()=>{
    const confirmed=tc.filter(c=>c.status==="confirmado"||c.status==="pagado");
    const interesados=tc.filter(c=>c.status==="interesado");
    const [listModal,setListModal]=useState(false); const [listView,setListView]=useState("confirmados");
    const [copied2,setCopied2]=useState(false);
    const [addModal,setAddModal]=useState(null);
    const [newNombre,setNewNombre]=useState(""); const [newEmail,setNewEmail]=useState("");
    const [exSearch,setExSearch]=useState("");
    const allOtherClients=clients.filter(c=>c.tripId!==tid);
    const filteredEx=exSearch.trim()?allOtherClients.filter(c=>matchSearch(c.nombre,exSearch)||matchSearch(c.code,exSearch)):allOtherClients;
    const roomCounts={};
    Object.keys(ROOMS).forEach(k=>{ roomCounts[k]=confirmed.filter(c=>(c.room||"doble_jun")===k).length; });

    const buildList=()=>{
      if(!confirmed.length) return "Sin confirmados";
      const lines=[`${trip.flag} ${trip.name.toUpperCase()}`,`${fmt(trip.date)}`,`${confirmed.length} confirmados`,"---"];
      const byRoom={}; Object.keys(ROOMS).forEach(k=>{ byRoom[k]=[]; });
      confirmed.forEach(c=>{ const r=c.room||"doble_jun"; if(byRoom[r]) byRoom[r].push(c); });
      let hab=1;
      ["doble_jun","doble_sep"].forEach(rk=>{
        if(!byRoom[rk]?.length) return;
        const roomInfo=ROOMS[rk];
        lines.push(`${roomInfo.short.toUpperCase()} (${Math.ceil(byRoom[rk].length/2)} hab.)`);
        const seen=new Set();
        byRoom[rk].forEach(c=>{ if(seen.has(c.id)) return; seen.add(c.id); const partner=c.roommateId?byRoom[rk].find(x=>x.id===c.roommateId):null; if(partner&&!seen.has(partner.id)){ seen.add(partner.id); lines.push(` Hab ${hab++}: ${c.nombre} + ${partner.nombre}`); } else { lines.push(` Hab ${hab++}: ${c.nombre}`); } });
      });
      if(byRoom.individual?.length>0){ lines.push(`INDIVIDUAL (${byRoom.individual.length})`); byRoom.individual.forEach(c=>lines.push(`  · ${c.nombre}`)); }
      if(byRoom.triple?.length>0){ lines.push(`TRIPLE (${Math.ceil(byRoom.triple.length/3)} hab.)`); byRoom.triple.forEach(c=>lines.push(`  · ${c.nombre}`)); }
      if(byRoom.cuadruple?.length>0){ lines.push(`CUÁDRUPLE (${Math.ceil(byRoom.cuadruple.length/4)} hab.)`); byRoom.cuadruple.forEach(c=>lines.push(`  · ${c.nombre}`)); }
      if(byRoom.busca?.length>0){ lines.push(`BUSCA COMPAÑERO/A`); byRoom.busca.forEach(c=>lines.push(`  · ${c.nombre}`)); }
      return lines.join("\n");
    };
    const buildListI=()=>{ if(!interesados.length) return "Sin interesados"; return [`${trip.flag} ${trip.name}`,`${interesados.length} interesados`,"---",...interesados.map((c,i)=>`${i+1}. ${c.nombre} ${ROOMS[c.room||"doble_jun"]?.short||""}`)].join("\n"); };
    const currentList=listView==="confirmados"?buildList():buildListI();

    return (
      <div style={{ padding:"0 16px" }}>
        <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
        {confirmed.length>0 && (
          <div style={{ background:A.card2,borderRadius:14,padding:"12px 14px",marginBottom:12,border:`1px solid ${A.border}` }}>
            <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>Resumen habitaciones</div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {Object.entries(ROOMS).map(([k,r])=>roomCounts[k]>0&&(
                <div key={k} style={{ background:r.color+"15",border:`1px solid ${r.color}33`,borderRadius:10,padding:"8px 12px",textAlign:"center",minWidth:72 }}>
                  <div style={{ fontFamily:ANTON,fontSize:22,color:r.color,lineHeight:1 }}>
                    {(k==="doble_jun"||k==="doble_sep")?Math.ceil(roomCounts[k]/2):k==="triple"?Math.ceil(roomCounts[k]/3):k==="cuadruple"?Math.ceil(roomCounts[k]/4):roomCounts[k]}
                  </div>
                  <div style={{ fontSize:8,color:r.color,letterSpacing:1,textTransform:"uppercase",fontFamily:BF,marginTop:2 }}>{r.short}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:10 }}>
          {ST.map(s=>{ const n=tc.filter(c=>c.status===s.key).length; return (<div key={s.key} onClick={n>0?()=>setStFilterModal(s.key):undefined} style={{ flexShrink:0,background:A.card,borderRadius:10,padding:"8px 12px",border:`1px solid ${n>0?s.color+"44":A.border}`,minWidth:60,textAlign:"center",cursor:n>0?"pointer":"default",opacity:n===0?0.4:1 }}><div style={{ fontSize:14 }}>{s.emoji}</div><div style={{ fontFamily:ANTON,fontSize:18,color:s.color }}>{n}</div><div style={{ fontSize:8,color:A.muted,fontFamily:BF,letterSpacing:1 }}>{s.label}</div></div>); })}
        </div>
        <div style={{ display:"flex",gap:8,marginBottom:12 }}>
          <button onClick={()=>setAddModal("new")} style={{ ...ab(A.cyan+"22",A.cyan),flex:2,border:`1.5px dashed ${A.cyan}`,borderRadius:10,padding:"10px",fontFamily:BF }}>+ Nuevo viajero</button>
          <button onClick={()=>setAddModal("existing")} style={{ ...ab(A.purple+"22",A.purple),flex:2,border:`1.5px solid ${A.purple}44`,borderRadius:10,padding:"10px",fontSize:12,fontFamily:BF }}>Existente ({allOtherClients.length})</button>
          {(confirmed.length>0||interesados.length>0) && <button onClick={()=>setListModal(true)} style={{ ...ab(A.green+"22",A.green),flex:1,border:`1.5px solid ${A.green}44`,borderRadius:10,padding:"10px",fontSize:12,fontFamily:BF }}>📋</button>}
        </div>
        {tc.length===0?<AEmpty text="Sin viajeros aún" />:tc.map(c=>{
          const st=ST.find(s=>s.key===c.status)||ST[0];
          const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;
          const urgent=hasUrgent(c);
          const acCount=(c.acompanantes||[]).length;
          const roommate=c.roommateId?clients.find(x=>x.id===c.roommateId):null;
          const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_PAGO[0];
          return (
            <div key={c.id} style={{ background:A.card,borderRadius:14,padding:"12px 14px",marginBottom:10,border:`2px solid ${urgent?A.orange+"66":A.border+"44"}` }}>
              {urgent && <div style={{ background:A.orange+"22",border:`1px solid ${A.orange}44`,borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:11,color:A.orange,fontFamily:BF,fontWeight:700 }}>⚠️ Pago próximo o vencido</div>}
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto,cid:c.id,name:c.nombre,docNum:c.docNumero||"",expiry:isoToDisplay(c.passportExpiry||"")})):(setUpIdx(c.id),passRef.current.value="",passRef.current.click())}
                  style={{ width:44,height:44,borderRadius:10,overflow:"hidden",cursor:"pointer",border:c.passportPhoto?`2px solid ${A.cyan}99`:`2px solid ${A.border}`,background:A.cyan+"22",flexShrink:0 }}>
                  {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:18,color:A.cyan }}>{c.nombre[0]?.toUpperCase()}</div>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.nombre}</div>
                  <div style={{ fontSize:10,color:st.color,fontFamily:BF }}>{st.emoji} {st.label}</div>
                </div>
                <button onClick={()=>sC(clients.filter(x=>x.id!==c.id))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ display:"flex",gap:6,marginBottom:6,flexWrap:"wrap" }}>
                <button onClick={()=>setRoomMenu(c.id)} style={{ background:rm.color+"22",border:`1.5px solid ${rm.color}55`,color:rm.color,borderRadius:9,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:BF }}>{rm.label} ▾</button>
                <select value={c.status} onChange={e=>updClient(c.id,x=>({...x,status:e.target.value}))} style={{ background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,padding:"5px 8px",fontSize:11,cursor:"pointer",fontFamily:BF }}>
                  {ST_SELECT.map(s=><option key={s.key} value={s.key}>{s.emoji} {s.label}</option>)}
                </select>
                <button onClick={()=>setFpMenu(c.id)} style={{ background:A.cyan+"15",border:`1.5px solid ${A.cyan}33`,color:A.cyan,borderRadius:9,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:BF }}>{fp.icon} {fp.label} ▾</button>
              </div>
              <div style={{ display:"flex",gap:6,marginBottom:6 }}>
                <button onClick={()=>go("client",{cid:c.id})} style={{ ...ab(A.purple+"22",A.purple),flex:1,border:`1px solid ${A.purple}44`,borderRadius:8,padding:"6px",fontSize:11,fontFamily:BF }}>Ver portal</button>
                <button onClick={()=>setRmModal(c.id)} style={{ ...ab(roommate?A.cyan+"15":A.card2,roommate?A.cyan:A.muted),flex:1,border:`1px solid ${roommate?A.cyan+"33":A.border}`,borderRadius:8,padding:"6px",fontSize:10,fontFamily:BF }}>{roommate?roommate.nombre.split(" ")[0]:"Compañero/a"}</button>
                <button onClick={()=>setAcmpModal(c.id)} style={{ ...ab(acCount>0?A.cyan+"15":A.card2,acCount>0?A.cyan:A.muted),border:`1px solid ${acCount>0?A.cyan+"44":A.border}`,borderRadius:8,padding:"6px",fontSize:10,fontFamily:BF }}>{acCount>0?`+${acCount}`:"Acomp."}</button>
              </div>
              <input value={c.note||""} onChange={e=>updClient(c.id,x=>({...x,note:e.target.value}))} placeholder="Anotación..." style={{ ...ais,padding:"7px 10px",fontSize:15,color:A.muted,background:A.bg,borderColor:A.border+"66" }} />
              {/* Link + WA por viajero */}
              <div style={{ display:"flex",gap:6,marginTop:6 }}>
                {(()=>{ const link=`${window.location.href.split("#")[0]}#${c.code}`; const [cop,setCop]=useState(false); const trip2=trips.find(t=>t.id===c.tripId); const wa=()=>{ const msg=trip2?`Hola ${c.nombre.split(" ")[0]}!\n\nPortal ${trip2.name}:\n${link}`:`Hola ${c.nombre.split(" ")[0]}!\n\nPortal Travelike:\n${link}`; window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,"_blank"); }; return (<><button onClick={()=>{ navigator.clipboard.writeText(link).then(()=>{ setCop(true); setTimeout(()=>setCop(false),2000); }); }} style={{ ...ab(cop?A.green+"22":A.cyan+"15",cop?A.green:A.cyan),flex:1,border:`1px solid ${cop?A.green:A.cyan}44`,padding:"6px 8px",fontSize:11,borderRadius:8,fontFamily:BF }}>{cop?"¡Copiado!":"🔗 Link"}</button><button onClick={wa} style={{ ...ab(A.green+"15",A.green),flex:1,border:`1px solid ${A.green}44`,padding:"6px 8px",fontSize:11,borderRadius:8,fontFamily:BF }}>💬 WhatsApp</button></>); })()}
              </div>
              {/* Firma de condiciones */}
              {c.consentDate && (
                <div style={{ marginTop:6,background:A.green+"10",border:`1px solid ${A.green}33`,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ fontSize:12 }}>✅</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontFamily:BF,fontSize:10,color:A.green,fontWeight:700 }}>Condiciones firmadas</span>
                    <span style={{ fontFamily:BF,fontSize:9,color:A.muted,marginLeft:8 }}>{new Date(c.consentDate).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}</span>
                  </div>
                  <div style={{ display:"flex",gap:4 }}>
                    {c.consentRGPD && <span style={{ fontSize:8,padding:"2px 5px",background:A.cyan+"20",border:`1px solid ${A.cyan}33`,borderRadius:4,color:A.cyan,fontFamily:BF }}>RGPD</span>}
                    {c.consentPasaporte && <span style={{ fontSize:8,padding:"2px 5px",background:A.green+"20",border:`1px solid ${A.green}33`,borderRadius:4,color:A.green,fontFamily:BF }}>Pasaporte</span>}
                    {c.consentFoto && <span style={{ fontSize:8,padding:"2px 5px",background:A.purple+"20",border:`1px solid ${A.purple}33`,borderRadius:4,color:A.purple,fontFamily:BF }}>Foto</span>}
                  </div>
                </div>
              )}
              {!c.consentDate && !c.firstLogin && (
                <div style={{ marginTop:6,background:A.orange+"10",border:`1px solid ${A.orange}33`,borderRadius:8,padding:"5px 10px" }}>
                  <span style={{ fontFamily:BF,fontSize:9,color:A.orange }}>⏳ Pendiente de firmar condiciones</span>
                </div>
              )}
              {/* ── PANEL DE VERIFICACIÓN ADMIN: foto + nº doc + caducidad ── */}
              <div style={{ marginTop:10,background:c.docVerified?A.green+"0e":A.bg,borderRadius:12,border:`2px solid ${c.docVerified?A.green+"55":c.docNumero?A.cyan+"44":A.border+"33"}`,overflow:"hidden" }}>
                {/* Cabecera */}
                <div style={{ padding:"8px 12px",background:c.docVerified?A.green+"18":A.card2,display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${c.docVerified?A.green+"33":A.border+"33"}` }}>
                  <span style={{ fontSize:14 }}>🛂</span>
                  <span style={{ fontFamily:BF,fontSize:10,letterSpacing:2,textTransform:"uppercase",color:c.docVerified?A.green:A.muted,flex:1,fontWeight:700 }}>Verificación de documento</span>
                  {c.docVerified
                    ? <span style={{ fontFamily:BF,fontSize:9,color:A.green,fontWeight:700 }}>✓ VERIFICADO</span>
                    : c.docNumero
                      ? <span style={{ fontFamily:BF,fontSize:9,color:A.orange,fontWeight:700 }}>⚠️ PENDIENTE</span>
                      : <span style={{ fontFamily:BF,fontSize:9,color:A.muted }}>Sin datos</span>
                  }
                </div>
                {/* Foto + datos lado a lado */}
                <div style={{ display:"flex",gap:12,padding:"12px" }}>
                  {/* Foto del pasaporte */}
                  <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto,cid:c.id,name:c.nombre,docNum:c.docNumero||"",expiry:isoToDisplay(c.passportExpiry||"")})):(setUpIdx(c.id),passRef.current.value="",passRef.current.click())}
                    style={{ width:72,height:90,borderRadius:10,overflow:"hidden",cursor:"pointer",border:c.passportPhoto?`2px solid ${A.cyan}99`:`2px dashed ${A.border}`,background:A.card,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {c.passportPhoto
                      ? <img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />
                      : <div style={{ textAlign:"center" }}><div style={{ fontSize:24 }}>📷</div><div style={{ fontFamily:BF,fontSize:8,color:A.muted,marginTop:2 }}>Subir</div></div>
                    }
                  </div>
                  {/* Número y caducidad */}
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Nº Pasaporte / DNI</div>
                    <input
                      key={c.id+"_doc"}
                      defaultValue={c.docNumero||""}
                      onBlur={e=>updClient(c.id,x=>({...x,docNumero:e.target.value.toUpperCase(),docVerified:false}))}
                      placeholder="—"
                      style={{ ...ais,fontFamily:ANTON,fontSize:26,letterSpacing:4,textAlign:"center",color:A.cyan,padding:"8px 10px",marginBottom:8,background:A.card }}
                    />
                    <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Caducidad</div>
                    <input
                      key={c.id+"_exp"}
                      type="text"
                      inputMode="numeric"
                      placeholder="DD-MM-AAAA"
                      defaultValue={isoToDisplay(c.passportExpiry||"")}
                      onChange={e=>{
                        const raw=e.target.value.replace(/[^0-9]/g,"");
                        let fmt=raw;
                        if(raw.length>2) fmt=raw.slice(0,2)+"-"+raw.slice(2);
                        if(raw.length>4) fmt=raw.slice(0,2)+"-"+raw.slice(2,4)+"-"+raw.slice(4,8);
                        e.target.value=fmt;
                      }}
                      onBlur={e=>updClient(c.id,x=>({...x,passportExpiry:displayToISO(e.target.value),passportExpiryDismissed:false}))}
                      maxLength={10}
                      style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,color:passportWarn(c.passportExpiry)?A.orange:A.text,background:A.card,border:`1px solid ${passportWarn(c.passportExpiry)?A.orange+"44":A.border+"44"}` }}
                    />
                  </div>
                </div>
                {/* Checkbox de verificación */}
                <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",background:c.docVerified?A.green+"18":A.card2,borderTop:`1px solid ${c.docVerified?A.green+"33":A.border+"22"}` }}>
                  <input type="checkbox" checked={!!c.docVerified} onChange={e=>updClient(c.id,x=>({...x,docVerified:e.target.checked}))} style={{ width:20,height:20,accentColor:A.green,flexShrink:0 }} />
                  <span style={{ fontFamily:BF,fontSize:12,color:c.docVerified?A.green:A.muted,fontWeight:700,lineHeight:1.4 }}>He comprobado la foto del pasaporte y el nº de documento extraído por IA es correcto</span>
                </label>
              </div>
            </div>
          );
        })}
        <input ref={passRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]&&upIdx) addPass(e.target.files[0],upIdx); setUpIdx(null); }} />
        {passModal && (
          <PassportModal
            modal={passModal}
            onClose={() => setPassModal(null)}
            onSave={(docNum, expiry) => {
              updClient(passModal.cid, c => ({ ...c, docNumero: docNum, passportExpiry: displayToISO(expiry), passportExpiryDismissed: false, docVerified: false }));
              setPassModal(null);
            }}
            onChangePhoto={() => { chPassRef.current.value = ""; chPassRef.current.click(); }}
            onDelete={() => { updClient(passModal.cid, c => ({ ...c, passportPhoto: null, docNumero: "", passportExpiry: "", docVerified: false })); setPassModal(null); }}
          />
        )}
        {listModal && (<AModal title="Listas" onClose={()=>setListModal(false)}><div style={{ display:"flex",background:A.bg,borderRadius:10,padding:4,marginBottom:12,gap:4 }}><button onClick={()=>{ setListView("confirmados"); setCopied2(false); }} style={{ flex:1,background:listView==="confirmados"?A.green:A.card2,color:listView==="confirmados"?"#fff":A.muted,border:"none",borderRadius:8,padding:"9px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer" }}>Confirmados ({confirmed.length})</button><button onClick={()=>{ setListView("interesados"); setCopied2(false); }} style={{ flex:1,background:listView==="interesados"?A.orange:A.card2,color:listView==="interesados"?"#fff":A.muted,border:"none",borderRadius:8,padding:"9px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer" }}>Interesados ({interesados.length})</button></div><pre style={{ background:A.bg,borderRadius:10,padding:12,fontSize:12,lineHeight:1.9,color:A.text,overflowX:"auto",whiteSpace:"pre-wrap",marginBottom:12,border:`1px solid ${A.border}`,fontFamily:"monospace" }}>{currentList}</pre><button onClick={()=>{ navigator.clipboard.writeText(currentList).then(()=>{ setCopied2(true); setTimeout(()=>setCopied2(false),2500); }); }} style={{ ...ab(copied2?A.green:A.cyan,A.bg),width:"100%",borderRadius:10,fontFamily:BF }}>{copied2?"¡Copiado!":"Copiar"}</button></AModal>)}
        {rmModal && <AModal title="Compañero/a de hab." onClose={()=>setRmModal(null)}>{tc.filter(x=>x.id!==rmModal).map(c=>{ const sel=clients.find(x=>x.id===rmModal)?.roommateId===c.id; const rm2=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun; return (<button key={c.id} onClick={()=>{ setRoommate(rmModal,c.id); setRmModal(null); }} style={{ ...ab(sel?A.cyan+"22":A.card2,sel?A.cyan:A.text),width:"100%",marginBottom:8,textAlign:"left",border:`1.5px solid ${sel?A.cyan:A.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}><div style={{ width:36,height:36,borderRadius:8,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:15,color:A.cyan,flexShrink:0 }}>{c.nombre[0]}</div><div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700 }}>{c.nombre}</div><div style={{ fontSize:11,color:rm2.color,fontFamily:BF }}>{rm2.label}</div></div>{sel&&<span style={{ marginLeft:"auto",color:A.cyan,fontSize:18 }}>✓</span>}</button>); })}{clients.find(x=>x.id===rmModal)?.roommateId&&<button onClick={()=>{ setRoommate(rmModal,null); setRmModal(null); }} style={{ ...ab(A.red+"15",A.red),width:"100%",border:`1px solid ${A.red}33`,borderRadius:10,marginTop:4,fontFamily:BF }}>Quitar</button>}</AModal>}
        {roomMenu && <RoomMenu current={clients.find(c=>c.id===roomMenu)?.room||"doble_jun"} onSelect={r=>updClient(roomMenu,c=>({...c,room:r}))} onClose={()=>setRoomMenu(null)} />}
        {fpMenu && <FormaPagoMenu current={clients.find(c=>c.id===fpMenu)?.formaPago||"transferencia"} onSelect={fp=>updClient(fpMenu,c=>({...c,formaPago:fp}))} onClose={()=>setFpMenu(null)} />}
        {acmpModal && <AcompModal clientId={acmpModal} clients={clients} updClient={updClient} trip={trip} onClose={()=>setAcmpModal(null)} />}
        {addModal==="new" && <AModal title="Nuevo viajero" onClose={()=>setAddModal(null)}><input value={newNombre} onChange={e=>setNewNombre(e.target.value)} placeholder="Nombre completo" style={{ ...ais,marginBottom:10 }} /><input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email (opcional)" type="email" style={{ ...ais,marginBottom:14 }} /><ARow><button onClick={()=>setAddModal(null)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button><button onClick={()=>{ if(!newNombre.trim()) return; sC([...clients,{ id:`cl${uid()}`,nombre:newNombre.trim(),email:newEmail||"",tripId:tid,code:genCode(),status:"interesado",room:"doble_jun",note:"",pagosEstado:(trip.pagosConfig||[]).map(()=>"pendiente"),pagosImporteCustom:(trip.pagosConfig||[]).map(()=>null),personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,passportExpiry:"",passportExpiryDismissed:false,notifEnabled:false,roommateId:null,surveySubmitted:false,acompanantes:[],maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",docNumero:"",docVerified:false }]); setAddModal(null); setNewNombre(""); setNewEmail(""); }} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Añadir</button></ARow></AModal>}
        {addModal==="existing" && <AModal title="Añadir viajero existente" onClose={()=>{ setAddModal(null); setExSearch(""); }}><SearchBar value={exSearch} onChange={setExSearch} placeholder="Buscar por nombre o código..." />{filteredEx.length===0?<AEmpty text={allOtherClients.length===0?"No hay otros clientes":"Sin resultados"} />:filteredEx.map(c=>{ const cTrip=c.tripId?trips.find(t=>t.id===c.tripId):null; return (<button key={c.id} onClick={()=>{ sC(clients.map(x=>x.id===c.id?{...x,tripId:tid,pagosEstado:(trip.pagosConfig||[]).map(()=>"pendiente"),pagosImporteCustom:(trip.pagosConfig||[]).map(()=>null)}:x)); setAddModal(null); setExSearch(""); }} style={{ ...ab(A.card2,A.text),width:"100%",marginBottom:8,textAlign:"left",border:`1.5px solid ${A.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}><div style={{ width:36,height:36,borderRadius:8,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:15,color:A.cyan,flexShrink:0 }}>{c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover",borderRadius:6 }} alt="" />:c.nombre[0]}</div><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:A.text }}>{c.nombre}</div><div style={{ fontSize:10,color:cTrip?A.orange:A.muted,fontFamily:BF }}>{cTrip?`Actual: ${cTrip.flag} ${cTrip.name}`:"Sin viaje"} · {c.code}</div></div><span style={{ color:A.cyan,fontSize:16 }}>+</span></button>); })}</AModal>}
        {viewPhoto && <Lightbox src={viewPhoto} onClose={()=>setViewPhoto(null)} />}
        {stFilterModal && <FilteredListModal title={`${ST.find(s=>s.key===stFilterModal)?.emoji} ${ST.find(s=>s.key===stFilterModal)?.label}`} clients={tc.filter(c=>c.status===stFilterModal)} onClose={()=>setStFilterModal(null)} />}
      </div>
    );
  };

  // ─── PAGOS TAB ───
  const PagosTab=()=>{
    const pc=trip.pagosConfig||[];
    const allPeople=[...tc,...tc.flatMap(c=>(c.acompanantes||[]).map(a=>({...a,_pN:c.nombre})))];
    const [editImpModal,setEditImpModal]=useState(null);
    const [newImp,setNewImp]=useState("");
    const [editFP,setEditFP]=useState("transferencia");
    const [editPcModal,setEditPcModal]=useState(null);
    const [pcLabel,setPcLabel]=useState("");
    const [pcImporte,setPcImporte]=useState("");
    const saveImp=()=>{ if(!editImpModal) return; updClient(editImpModal.cid,c=>{ const ai=[...(c.pagosImporteCustom||pc.map(()=>null))]; ai[editImpModal.pidx]=newImp?`${newImp}€`:null; const afp=[...(c.pagosFormaPago||pc.map(()=>"transferencia"))]; afp[editImpModal.pidx]=editFP; return {...c,pagosImporteCustom:ai,pagosFormaPago:afp}; }); setEditImpModal(null); };
    const savePc=()=>{ if(editPcModal===null) return; updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===editPcModal?{...x,label:pcLabel,importe:pcImporte}:x)})); setEditPcModal(null); };
    return (
      <div style={{ padding:"0 16px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer" }}>← Volver al menú</button>
          <div style={{ display:"flex",gap:6 }}>
            <button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig||[]),{label:`Pago ${(t.pagosConfig||[]).length+1}`,fecha:"",fechaISO:"",importe:""}]}))} style={{ ...ab(A.orange+"22",A.orange),border:`1px solid ${A.orange}44`,padding:"8px 10px",fontSize:11,borderRadius:8,fontFamily:BF }}>+ Hito</button>
            {(trip.pagosConfig||[]).length>1&&<button onClick={()=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.slice(0,-1)}))} style={{ ...ab(A.red+"15",A.red),border:`1px solid ${A.red}33`,padding:"8px 10px",fontSize:11,borderRadius:8,fontFamily:BF }}>− Quitar</button>}
            <button onClick={()=>setRegistroPagoModal(true)} style={{ ...ab(A.green+"22",A.green),border:`1px solid ${A.green}55`,padding:"8px 12px",fontSize:12,borderRadius:8,fontFamily:BF }}>💳 Registrar</button>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:2 }}>
          {pc.map((p,i)=>{ const paid=allPeople.filter(c=>(c.pagosEstado||[])[i]==="pagado").length; const pct=allPeople.length>0?Math.round(paid/allPeople.length*100):0; const urg=isUrgent(p.fechaISO); const ovd=isOverdue(p.fechaISO); return (<div key={i} style={{ flexShrink:0,background:A.card,borderRadius:12,padding:"10px 14px",border:`1px solid ${ovd?A.red+"44":urg?A.orange+"44":A.cyan+"22"}`,minWidth:110,position:"relative" }}>
            <button onClick={()=>{ setPcLabel(p.label); setPcImporte(p.importe||""); setEditPcModal(i); }} style={{ position:"absolute",top:6,right:6,background:"transparent",border:"none",cursor:"pointer",fontSize:11,color:A.muted,lineHeight:1,padding:2 }}>✏️</button>
            <div style={{ fontSize:9,color:ovd?A.red:urg?A.orange:A.muted,letterSpacing:2,textTransform:"uppercase",fontFamily:BF,marginBottom:4,paddingRight:16 }}>{p.label}</div><div style={{ fontFamily:ANTON,fontSize:24,color:paid===allPeople.length&&allPeople.length>0?A.green:A.cyan,lineHeight:1 }}>{paid}<span style={{ fontSize:12,color:A.muted }}>/{allPeople.length}</span></div>{p.importe&&<div style={{ fontSize:10,color:A.gold,fontFamily:BF,marginTop:2 }}>{p.importe}</div>}<div style={{ height:3,background:A.border,borderRadius:2,marginTop:6 }}><div style={{ height:"100%",width:`${pct}%`,background:paid===allPeople.length&&allPeople.length>0?A.green:ovd?A.red:urg?A.orange:A.cyan,borderRadius:2 }} /></div></div>); })}
        </div>
        {tc.length===0?<AEmpty text="Sin viajeros" />:(
          <div style={{ background:A.card,borderRadius:14,overflow:"hidden",border:`1px solid ${A.border}` }}>
            <div style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid ${A.border}`,background:A.card2 }}>
              <div style={{ padding:"10px 14px",fontSize:9,color:A.muted,fontFamily:BF,letterSpacing:2 }}>Viajero</div>
              {pc.map((p,i)=><div key={i} style={{ padding:"10px 8px",fontSize:9,color:A.cyan,fontFamily:BF,letterSpacing:1,textAlign:"center",borderLeft:`1px solid ${A.border}` }}>{p.label}</div>)}
            </div>
            {tc.map(c=>{
              const pe=c.pagosEstado||pc.map(()=>"pendiente");
              const allPaid=pe.every(s=>s==="pagado");
              const urgent=hasUrgent(c);
              const acomps=c.acompanantes||[];
              return (
                <React.Fragment key={c.id}>
                  <div style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid ${A.border}44`,background:allPaid?A.green+"08":urgent?A.orange+"06":"transparent" }}>
                    <div style={{ padding:"10px 14px",display:"flex",alignItems:"center",gap:6 }}>
                      <div style={{ width:26,height:26,borderRadius:6,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:12,color:A.cyan,flexShrink:0 }}>{c.nombre[0]?.toUpperCase()}</div>
                      <div style={{ fontFamily:ANTON,fontSize:12,color:A.text,lineHeight:1 }}>{c.nombre.split(" ")[0]}</div>
                    </div>
                    {pc.map((p,i)=>{
                      const done=pe[i]==="pagado"; const urg2=!done&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO));
                      const customImp=(c.pagosImporteCustom||[])[i];
                      const cellFP=FORMAS_PAGO.find(f=>f.k===((c.pagosFormaPago||[])[i]||c.formaPago||"transferencia"))||FORMAS_PAGO[0];
                      return (
                        <div key={i} style={{ borderLeft:`1px solid ${A.border}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,position:"relative" }}>
                          <button onClick={()=>updClient(c.id,x=>{ const arr=[...(x.pagosEstado||pc.map(()=>"pendiente"))]; arr[i]=arr[i]==="pagado"?"pendiente":"pagado"; return {...x,pagosEstado:arr}; })}
                            style={{ width:"100%",flex:1,background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 2px",gap:1 }}>
                            <div style={{ fontFamily:ANTON,fontSize:16,color:done?A.green:urg2?A.orange:A.muted,lineHeight:1 }}>{done?"✓":urg2?"!":"-"}</div>
                            {customImp&&<div style={{ fontSize:7,color:A.gold,fontFamily:BF }}>{customImp}</div>}
                            <div style={{ fontSize:9 }}>{cellFP.icon}</div>
                          </button>
                          <button onClick={()=>{ const curFP=(c.pagosFormaPago||[])[i]||c.formaPago||"transferencia"; setNewImp((c.pagosImporteCustom||[])[i]?.replace(/[^\d.]/g,"")||pc[i].importe?.replace(/[^\d.]/g,"")||""); setEditFP(curFP); setEditImpModal({cid:c.id,pidx:i}); }}
                            style={{ fontSize:9,color:A.muted,background:"transparent",border:"none",cursor:"pointer",paddingBottom:4,fontFamily:BF }}>✏️</button>
                        </div>
                      );
                    })}
                  </div>
                  {acomps.map(ac=>{ const ape=ac.pagosEstado?.length===pc.length?ac.pagosEstado:pc.map(()=>"pendiente"); return (
                    <div key={ac.id} style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid ${A.border}22`,background:A.bg+"88" }}>
                      <div style={{ padding:"7px 14px 7px 22px",display:"flex",alignItems:"center",gap:6 }}>
                        <div style={{ width:18,height:18,borderRadius:4,background:A.purple+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:9,color:A.purple,flexShrink:0 }}>{ac.nombre[0]?.toUpperCase()}</div>
                        <div style={{ fontFamily:BF,fontSize:10,color:A.purple }}>{ac.nombre.split(" ")[0]}</div>
                      </div>
                      {pc.map((p,i)=>{ const done=ape[i]==="pagado"; const urg2=!done&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)); return (<div key={i} style={{ borderLeft:`1px solid ${A.border}22`,display:"flex",alignItems:"center",justifyContent:"center" }}><button onClick={()=>updClient(c.id,x=>({...x,acompanantes:(x.acompanantes||[]).map(a=>{ if(a.id!==ac.id) return a; const base=a.pagosEstado?.length===pc.length?a.pagosEstado:pc.map(()=>"pendiente"); const arr=[...base]; arr[i]=arr[i]==="pagado"?"pendiente":"pagado"; return {...a,pagosEstado:arr}; })}))} style={{ width:"100%",height:"100%",minHeight:36,background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ fontFamily:ANTON,fontSize:13,color:done?A.green:urg2?A.orange:A.muted+"88" }}>{done?"✓":urg2?"!":"-"}</div></button></div>); })}
                    </div>
                  ); })}
                </React.Fragment>
              );
            })}
          </div>
        )}
        {editImpModal && (
          <AModal title="Editar pago" onClose={()=>setEditImpModal(null)}>
            <div style={{ fontFamily:BF,fontSize:13,color:A.muted,marginBottom:12 }}>
              <strong style={{ color:A.text }}>{clients.find(c=>c.id===editImpModal.cid)?.nombre}</strong> — {pc[editImpModal.pidx]?.label}
            </div>
            <div style={{ background:A.card,border:`1px solid ${A.border}`,borderRadius:10,padding:"16px",fontSize:28,fontFamily:ANTON,color:A.cyan,textAlign:"right",marginBottom:12 }}>{newImp||"0"} €</div>
            <AmountPad value={newImp} onChange={setNewImp} />
            <div style={{ marginTop:14,marginBottom:4,fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase" }}>Forma de pago de este hito</div>
            <div style={{ display:"flex",gap:8,marginBottom:16 }}>
              {FORMAS_PAGO.map(f=>(
                <button key={f.k} onClick={()=>setEditFP(f.k)} style={{ flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",fontFamily:BF,fontSize:12,border:`2px solid ${editFP===f.k?A.cyan:A.border}`,background:editFP===f.k?A.cyan+"22":A.card2,color:editFP===f.k?A.cyan:A.muted,fontWeight:editFP===f.k?700:400 }}>{f.icon} {f.label}</button>
              ))}
            </div>
            <ARow>
              <button onClick={()=>setEditImpModal(null)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button>
              <button onClick={saveImp} style={{ ...ab(A.gold,A.bg),flex:2 }}>Guardar</button>
            </ARow>
          </AModal>
        )}
        {editPcModal!==null && (
          <AModal title="Editar hito de pago" onClose={()=>setEditPcModal(null)}>
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Nombre del hito</div>
            <input value={pcLabel} onChange={e=>setPcLabel(e.target.value)} placeholder="Ej: Reserva, Pago final..." style={{ ...ais,marginBottom:14 }} />
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Importe base</div>
            <input value={pcImporte} onChange={e=>setPcImporte(e.target.value)} placeholder="Ej: 500€" style={{ ...ais,marginBottom:16 }} />
            <ARow>
              <button onClick={()=>{ if((trip.pagosConfig||[]).length>1) updTrip(t=>({...t,pagosConfig:t.pagosConfig.filter((_,j)=>j!==editPcModal)})); setEditPcModal(null); }} style={{ ...ab(A.red+"15",A.red),flex:1,border:`1px solid ${A.red}33` }}>Borrar</button>
              <button onClick={()=>setEditPcModal(null)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button>
              <button onClick={savePc} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Guardar</button>
            </ARow>
          </AModal>
        )}
      </div>
    );
  };

  // ─── FINANZAS TAB (con ZIP export y callClaude) ───
  const FinanzasTab=()=>{
    const [unlocked,setUnlocked]=useState(false); const [showPin,setShowPin]=useState(false);
    const gastos=trip.gastos||[]; const facturas=trip.facturas||[];
    const pc=trip.pagosConfig||[];
    const [showGastoForm,setShowGastoForm]=useState(false);
    const [tipoMenu,setTipoMenu]=useState(false);
    const [gTipo,setGTipo]=useState("vuelo"); const [gDesc,setGDesc]=useState("");
    const [gImporte,setGImporte]=useState(""); const [gCurrency,setGCurrency]=useState(trip.currency||"EUR");
    const [gFecha,setGFecha]=useState(new Date().toISOString().split("T")[0]);
    const [gNota,setGNota]=useState(""); const [gImporteEUR,setGImporteEUR]=useState("");
    const [converting,setConverting]=useState(false);
    const [currMenu,setCurrMenu]=useState(false);
    const [showStats,setShowStats]=useState(false);
    const facturaRef=useRef();
    const [expandedGasto,setExpandedGasto]=useState(null);
    const gastoFacturaRef=useRef();
    const [scanningFA,setScanningFA]=useState(null);
    const [scanResult,setScanResult]=useState(null);
    const [downloadingZip,setDownloadingZip]=useState(false);

    useEffect(()=>{
      if(!gImporte||!+gImporte){ setGImporteEUR(""); return; }
      if(gCurrency==="EUR"){ setGImporteEUR(gImporte); return; }
      setConverting(true);
      const t=setTimeout(async()=>{ const eur=await convertToEUR(+gImporte,gCurrency); setGImporteEUR(String(eur)); setConverting(false); },600);
      return ()=>clearTimeout(t);
    },[gImporte,gCurrency]);

    const totalGastos=gastos.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
    const totalIngresos=tc.reduce((sum,c)=>{ const pe=c.pagosEstado||pc.map(()=>"pendiente"); return sum+pc.reduce((s2,p,i)=>{ const imp=(c.pagosImporteCustom||[])[i]!=null?(+(c.pagosImporteCustom||[])[i].replace(/[^\d.]/g,"")||0):(+p.importe?.replace(/[^\d.]/g,"")||0); return s2+(pe[i]==="pagado"?imp:0); },0); },0);
    const beneficio=totalIngresos-totalGastos;

    const addGasto=()=>{
      if(!gImporte||+gImporte<=0) return;
      const importeEUR=gCurrency==="EUR"?+gImporte:+(gImporteEUR||gImporte);
      updTrip(t=>({...t,gastos:[...(t.gastos||[]),{ id:uid(),tipo:gTipo,descripcion:gDesc,importe:+gImporte,currency:gCurrency,importeEUR,fecha:gFecha,nota:gNota,facturas:[] }]}));
      setGTipo("vuelo"); setGDesc(""); setGImporte(""); setGImporteEUR(""); setGFecha(new Date().toISOString().split("T")[0]); setGNota("");
      setShowGastoForm(false);
    };
    const delGasto=id=>updTrip(t=>({...t,gastos:(t.gastos||[]).filter(g=>g.id!==id)}));
    const addFacturaTrip=async e=>{ const files=Array.from(e.target.files); if(!files.length) return; const newFas=await Promise.all(files.map(async f=>{ const b64=await fileToB64(f); return { id:uid(),nombre:f.name,tipo:f.type,data:b64,fecha:new Date().toISOString().split("T")[0],gastoId:null }; })); updTrip(t=>({...t,facturas:[...(t.facturas||[]),...newFas]})); e.target.value=""; };
    const addFacturaGasto=async(e,gastoId)=>{ const f=e.target.files[0]; if(!f) return; const b64=await fileToB64(f); const gasto=gastos.find(g=>g.id===gastoId); const ext=f.type?.includes("pdf")?"pdf":f.type?.includes("png")?"png":"jpg"; const importe=gasto?.importeEUR||gasto?.importe; const tipoLabel=(tipoInfo(gasto?.tipo||"otros").label||"factura").toLowerCase().replace(/\s/g,"_"); const nombre=importe?`${importe}€_${tipoLabel}.${ext}`:f.name; updTrip(t=>({...t,facturas:[...(t.facturas||[]),{ id:uid(),nombre,tipo:f.type,data:b64,fecha:new Date().toISOString().split("T")[0],gastoId }]})); e.target.value=""; };
    const delFactura=id=>updTrip(t=>({...t,facturas:(t.facturas||[]).filter(fa=>fa.id!==id)}));
    const tipoInfo=k=>GASTO_TIPOS.find(t=>t.k===k)||GASTO_TIPOS[0];
    const gastosByTipo={};
    gastos.forEach(g=>{ if(!gastosByTipo[g.tipo]) gastosByTipo[g.tipo]=[]; gastosByTipo[g.tipo].push(g); });

    const downloadAllFacturas=()=>{
      const all=facturas.filter(f=>!f.gastoId);
      all.forEach((fa,idx)=>{ setTimeout(()=>{ const a=document.createElement("a"); a.href=`data:${fa.tipo};base64,${fa.data}`; a.download=fa.nombre; document.body.appendChild(a); a.click(); document.body.removeChild(a); },idx*200); });
    };

    const downloadZip=async()=>{
      const allF=facturas.filter(f=>!f.gastoId&&f.data);
      if(!allF.length){ alert("Sin facturas para exportar"); return; }
      setDownloadingZip(true);
      try {
        if(!window.JSZip){
          await new Promise(resolve=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload=resolve; document.head.appendChild(s); });
        }
        const zip=new window.JSZip();
        const folder=zip.folder(`${trip.name}_facturas`);
        allF.forEach(fa=>{ try { const byteStr=atob(fa.data); const arr=new Uint8Array(byteStr.length); for(let i=0;i<byteStr.length;i++) arr[i]=byteStr.charCodeAt(i); const ext=fa.tipo?.includes("pdf")?"pdf":fa.tipo?.includes("png")?"png":"jpg"; const nombre=fa.nombre.includes(".")?fa.nombre:`${fa.nombre}.${ext}`; folder.file(nombre,arr); } catch {} });
        const blob=await zip.generateAsync({ type:"blob" });
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download=`${trip.name.replace(/\s/g,"_")}_facturas.zip`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch(e){ alert("Error al crear el ZIP"); }
      setDownloadingZip(false);
    };

    // ✅ ZIP EXPORT para gastos individuales (con subcarpetas por tipo)
    const downloadGastosZip=async()=>{
      const gastosConFacturas=gastos.filter(g=>{
        const gf=(facturas||[]).filter(f=>f.gastoId===g.id&&f.data);
        return gf.length>0;
      });
      if(!gastosConFacturas.length){ alert("Sin facturas de gastos para exportar"); return; }
      setDownloadingZip(true);
      try {
        if(!window.JSZip){
          await new Promise(resolve=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload=resolve; document.head.appendChild(s); });
        }
        const zip=new window.JSZip();
        const root=zip.folder(`${trip.name}_gastos`);
        gastosConFacturas.forEach(g=>{
          const ti=tipoInfo(g.tipo||"otros");
          const folderName=`${ti.label}_${g.descripcion||g.tipo||"gasto"}`.replace(/[/\\?%*:|"<>]/g,"").substring(0,40);
          const sub=root.folder(folderName);
          const gf=(facturas||[]).filter(f=>f.gastoId===g.id&&f.data);
          gf.forEach(fa=>{ try { const byteStr=atob(fa.data); const arr=new Uint8Array(byteStr.length); for(let i=0;i<byteStr.length;i++) arr[i]=byteStr.charCodeAt(i); const ext=fa.tipo?.includes("pdf")?"pdf":fa.tipo?.includes("png")?"png":"jpg"; const nombre=fa.nombre.includes(".")?fa.nombre:`${fa.nombre}.${ext}`; sub.file(nombre,arr); } catch {} });
        });
        const blob=await zip.generateAsync({ type:"blob" });
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download=`${trip.name.replace(/\s/g,"_")}_gastos.zip`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch(e){ alert("Error al crear el ZIP de gastos"); }
      setDownloadingZip(false);
    };

    // ✅ SCAN AND RENAME con callClaude
    const scanAndRename=async(fa)=>{
      if(!fa.data) return;
      setScanningFA(fa.id); setScanResult(null);
      try {
        const prompt=`Analiza esta factura o ticket. Extrae: proveedor, fecha, importe total con símbolo de moneda, concepto. Responde SOLO JSON sin markdown: {"proveedor":"...","fecha":"...","importe":"...","moneda":"...","concepto":"..."}`;
        const raw=await callClaude(fa.data, fa.tipo||"image/jpeg", prompt);
        const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
        const importe=parsed.importe||"factura";
        const ext=fa.tipo?.includes("pdf")?"pdf":fa.tipo?.includes("png")?"png":"jpg";
        const newNombre=`${importe.replace(/[^0-9.,€$£¥]/g,"").trim()||importe}_${parsed.proveedor||"factura"}.${ext}`.replace(/\s+/g,"_");
        updTrip(t=>({...t,facturas:t.facturas.map(f=>f.id===fa.id?{...f,nombre:newNombre}:f)}));
        setScanResult({ id:fa.id, text:`✅ Proveedor: ${parsed.proveedor||"—"}\n📅 Fecha: ${parsed.fecha||"—"}\n💰 Importe: ${parsed.importe||"—"} ${parsed.moneda||""}\n📝 Concepto: ${parsed.concepto||"—"}\n\n📄 Renombrado:\n${newNombre}` });
      } catch(e){ setScanResult({ id:fa.id, text:"Error al procesar la factura." }); }
      setScanningFA(null);
    };

    const sym=getCurrencySymbol(gCurrency);

    return (
      <div style={{ padding:"0 16px" }}>
        <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
          {[{l:"Ingresos",v:totalIngresos,c:A.green},{l:"Gastos",v:totalGastos,c:A.red},{l:"Beneficio",v:beneficio,c:beneficio>=0?A.cyan:A.orange}].map(item=>(
            <div key={item.l} style={{ background:item.c+"15",borderRadius:14,padding:"12px 8px",border:`1px solid ${item.c}33`,textAlign:"center" }}>
              <div style={{ fontFamily:BF,fontSize:8,color:item.c,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>{item.l}</div>
              {unlocked?<div style={{ fontFamily:ANTON,fontSize:18,color:item.c,lineHeight:1 }}>{item.v>=0?"+":""}{item.v.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</div>:<div style={{ fontFamily:ANTON,fontSize:18,color:item.c,lineHeight:1 }}>***</div>}
            </div>
          ))}
        </div>
        {!unlocked&&<button onClick={()=>setShowPin(true)} style={{ width:"100%",padding:"12px",background:`linear-gradient(90deg,${A.orange},#cc7a00)`,border:"none",borderRadius:12,fontFamily:ANTON,fontSize:14,letterSpacing:2,color:"#fff",cursor:"pointer",textTransform:"uppercase",marginBottom:16 }}>VER IMPORTES</button>}
        {unlocked&&gastos.length>0&&(
          <button onClick={()=>setShowStats(v=>!v)} style={{ width:"100%",padding:"10px",background:showStats?A.purple+"22":A.card2,border:`1px solid ${showStats?A.purple+"44":A.border}`,borderRadius:12,fontFamily:BF,fontSize:13,color:showStats?A.purple:A.muted,cursor:"pointer",marginBottom:14 }}>
            {showStats?"▲ Ocultar estadísticas":"📊 Ver estadísticas de gastos"}
          </button>
        )}
        {showStats&&unlocked&&<ExpenseStats gastos={gastos} />}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
            <div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,textTransform:"uppercase" }}>Gastos</div>
            <div style={{ display:"flex",gap:6 }}>
              {gastos.some(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.data)) && (
                <button onClick={downloadGastosZip} disabled={downloadingZip} style={{ ...ab(A.purple+"22",A.purple),border:`1px solid ${A.purple}44`,padding:"7px 10px",fontSize:11,borderRadius:8,fontFamily:BF }}>{downloadingZip?"...":"📦 ZIP"}</button>
              )}
              <button onClick={()=>setShowGastoForm(v=>!v)} style={{ ...ab(showGastoForm?A.card2:A.orange+"22",showGastoForm?A.muted:A.orange),border:`1px solid ${showGastoForm?A.border:A.orange+"44"}`,padding:"7px 14px",fontSize:12,borderRadius:8,fontFamily:BF }}>{showGastoForm?"Cancelar":"+ Añadir"}</button>
            </div>
          </div>
          {showGastoForm&&(
            <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${A.orange}44` }}>
              <button onClick={()=>setTipoMenu(true)} style={{ width:"100%",background:A.bg,border:`2px solid ${A.orange}55`,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:10,boxSizing:"border-box" }}>
                <span style={{ fontSize:22 }}>{tipoInfo(gTipo).icon}</span>
                <span style={{ fontFamily:ANTON,fontSize:15,color:A.orange,letterSpacing:1,flex:1,textAlign:"left" }}>{tipoInfo(gTipo).label}</span>
                <span style={{ color:A.muted,fontSize:12,fontFamily:BF }}>Cambiar</span>
              </button>
              <input value={gDesc} onChange={e=>setGDesc(e.target.value)} placeholder="Descripción del gasto" style={{ ...ais,marginBottom:8 }} />
              <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:8,marginBottom:8 }}>
                <input value={gImporte} onChange={e=>setGImporte(e.target.value.replace(/[^\d.]/g,""))} placeholder={`Importe ${sym}`} inputMode="decimal" style={ais} />
                <button onClick={()=>setCurrMenu(true)} style={{ ...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold,padding:"8px" }}>{gCurrency} <span style={{ fontSize:10,color:A.muted }}>▾</span></button>
              </div>
              {gCurrency!=="EUR"&&gImporte&&(
                <div style={{ background:A.bg,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${A.cyan}33`,fontSize:12,color:A.cyan,fontFamily:BF }}>
                  {converting?"Convirtiendo...":gImporteEUR?`≈ ${gImporteEUR} €`:""}
                </div>
              )}
              <input type="date" value={gFecha} onChange={e=>setGFecha(e.target.value)} style={{ ...ais,colorScheme:"dark",marginBottom:8 }} />
              <input value={gNota} onChange={e=>setGNota(e.target.value)} placeholder="Nota (opcional)" style={{ ...ais,marginBottom:12 }} />
              <button onClick={addGasto} disabled={!gImporte||+gImporte<=0} style={{ width:"100%",padding:"13px",border:"none",borderRadius:10,fontFamily:ANTON,fontSize:15,letterSpacing:2,cursor:"pointer",background:gImporte&&+gImporte>0?A.orange:"#1a1a1a",color:"#fff",textTransform:"uppercase" }}>REGISTRAR GASTO</button>
            </div>
          )}
          {gastos.length===0?<AEmpty text="Sin gastos registrados" />:Object.entries(gastosByTipo).map(([tipo,items])=>{
            const ti=tipoInfo(tipo); const subtotal=items.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
            return (
              <div key={tipo} style={{ marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 2px",marginBottom:4 }}>
                  <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase" }}>{ti.icon} {ti.label}</div>
                  <div style={{ fontFamily:ANTON,fontSize:13,color:A.red }}>{subtotal.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</div>
                </div>
                {items.map(g=>{
                  const gFacturas=facturas.filter(f=>f.gastoId===g.id);
                  const isExpanded=expandedGasto===g.id;
                  return (
                    <div key={g.id} style={{ background:A.card,borderRadius:10,marginBottom:6,border:`1px solid ${A.border}33` }}>
                      <div style={{ padding:"10px 12px",display:"flex",gap:10,alignItems:"center" }}>
                        <span style={{ fontSize:18,flexShrink:0 }}>{ti.icon}</span>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontFamily:ANTON,fontSize:15,color:A.orange,lineHeight:1 }}>{(+g.importeEUR||+g.importe).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
                          <div style={{ fontFamily:BF,fontSize:12,color:A.text,fontWeight:700,marginTop:2 }}>{g.descripcion||ti.label}</div>
                          <div style={{ fontSize:11,color:A.muted,fontFamily:BF }}>
                            {g.fecha&&new Date(g.fecha+"T12:00:00").toLocaleDateString("es-ES")}
                            {g.currency&&g.currency!=="EUR"&&<span style={{ color:A.gold }}> · {(+g.importe).toLocaleString("es-ES")} {getCurrencySymbol(g.currency)}</span>}
                            {g.nota&&` · ${g.nota}`}
                            {gFacturas.length>0&&<span style={{ color:A.green }}> · 📄 {gFacturas.length}</span>}
                          </div>
                        </div>
                        <button onClick={()=>setExpandedGasto(isExpanded?null:g.id)} style={{ background:isExpanded?A.gold+"22":A.card2,border:`1px solid ${isExpanded?A.gold+"44":A.border}`,color:isExpanded?A.gold:A.muted,borderRadius:8,padding:"4px 8px",fontSize:14,cursor:"pointer" }}>📎</button>
                        <button onClick={()=>delGasto(g.id)} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1 }}>✕</button>
                      </div>
                      {isExpanded&&(
                        <div style={{ borderTop:`1px solid ${A.border}33`,padding:"10px 12px",background:A.bg }}>
                          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Facturas adjuntas</div>
                          {gFacturas.map(fa=>(
                            <div key={fa.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:A.card,borderRadius:8,marginBottom:6,border:`1px solid ${A.gold}33` }}>
                              <span style={{ fontSize:16 }}>{fa.tipo?.includes("image")?"🖼️":"📄"}</span>
                              <div style={{ flex:1,fontSize:12,fontFamily:BF,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{fa.nombre}</div>
                              <a href={`data:${fa.tipo};base64,${fa.data}`} download={fa.nombre} style={{ ...ab(A.gold+"22",A.gold),padding:"4px 8px",fontSize:10,borderRadius:6,border:`1px solid ${A.gold}33`,textDecoration:"none",fontFamily:BF }}>↓</a>
                              <button onClick={()=>delFactura(fa.id)} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",lineHeight:1 }}>✕</button>
                            </div>
                          ))}
                          <input ref={gastoFacturaRef} type="file" accept="application/pdf,image/*" style={{ display:"none" }} onChange={e=>addFacturaGasto(e,g.id)} />
                          <button onClick={()=>{ gastoFacturaRef.current.value=""; gastoFacturaRef.current.click(); }} style={{ width:"100%",padding:"8px",background:A.gold+"15",border:`1.5px dashed ${A.gold}`,borderRadius:8,color:A.gold,fontFamily:BF,fontSize:12,cursor:"pointer" }}>+ Adjuntar factura a este gasto</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ marginBottom:14 }}>
          <FacturacionSection trip={trip} updTrip={updTrip} tc={tc} />
        </div>
        {tipoMenu&&<GastoTipoMenu current={gTipo} onSelect={t=>setGTipo(t)} onClose={()=>setTipoMenu(false)} />}
        {currMenu&&<CurrencyMenu current={gCurrency} onSelect={c=>setGCurrency(c)} onClose={()=>setCurrMenu(false)} />}
        {showPin&&<NumPad title="PIN Finanzas" subtitle="Introduce el código de acceso" pinLength={6} onVerifyAsync={async pin=>{ const r=await verifyPin(pin,"finanzas"); return r; }} onSuccess={()=>{ setUnlocked(true); setShowPin(false); }} onCancel={()=>setShowPin(false)} />}
      </div>
    );
  };

  // ─── FACTURACIÓN ───
  function FacturacionSection({ trip, updTrip, tc }) {
    const facturasVenta = trip.facturasVenta || [];
    const [view, setView] = useState("list"); // "list" | "new" | "preview"
    const [editId, setEditId] = useState(null);

    // Nuevo formulario de factura
    const today = new Date().toISOString().split("T")[0];
    const lastNum = facturasVenta.length > 0
      ? facturasVenta[facturasVenta.length - 1].numFactura || ""
      : "";
    const nextNum = (() => {
      const m = lastNum.match(/(\d+)/g);
      if (!m) return "";
      const n = parseInt(m[m.length - 1]) + 1;
      return lastNum.replace(/\d+$/, String(n).padStart(m[m.length - 1].length, "0"));
    })();

    const emptyForm = () => ({
      numFactura: nextNum,
      fechaFactura: today,
      detalleReserva: trip.name ? `PROGRAMA TRAVELIKE ${trip.name.toUpperCase()} EN RÉGIMEN DE MEDIA PENSIÓN.\n-VUELOS INTERNACIONALES\n-TRANSFER PRIVADO\n-PÓLIZA DE SEGURO` : "",
      fechaSalida: "",
      fechaRegreso: "",
      clientesSeleccionados: [],
      totalFactura: "",
    });

    const [form, setForm] = useState(emptyForm);
    const [generating, setGenerating] = useState(false);

    const saveFactura = () => {
      if (!form.numFactura || !form.fechaFactura) return;
      const fa = { id: uid(), ...form, createdAt: new Date().toISOString() };
      updTrip(t => ({ ...t, facturasVenta: [...(t.facturasVenta || []), fa] }));
      setForm(emptyForm());
      setView("list");
    };

    const delFacturaVenta = id => updTrip(t => ({ ...t, facturasVenta: (t.facturasVenta || []).filter(f => f.id !== id) }));

    const toggleCliente = id => {
      setForm(f => ({
        ...f,
        clientesSeleccionados: f.clientesSeleccionados.includes(id)
          ? f.clientesSeleccionados.filter(x => x !== id)
          : [...f.clientesSeleccionados, id]
      }));
    };

    const downloadFacturaPDF = async (fa) => {
      setGenerating(fa.id);
      try {
        const JsPDF = await loadJsPDF();
        const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const W = 210; const H = 297;
        const mg = 18;
        let y = mg;

        // — Logo —
        const logoImg = new window.Image();
        logoImg.src = "/icon-73.png";
        await new Promise(res => { logoImg.onload = res; logoImg.onerror = res; });
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          doc.addImage(logoImg, "PNG", mg, y, 38, 14);
        } else {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.setTextColor(0, 0, 0);
          doc.text("travelike.", mg, y + 10);
        }

        // — Número de factura + fecha —
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const fNum = `FACTURA ${fa.numFactura}  ·  FECHA: ${new Date(fa.fechaFactura + "T12:00:00").toLocaleDateString("es-ES")}`;
        doc.text(fNum, W - mg, y + 8, { align: "right" });
        y += 24;

        // — Línea divisoria —
        doc.setDrawColor(220, 220, 220);
        doc.line(mg, y, W - mg, y);
        y += 8;

        // — Datos Agencia + Detalle reserva (dos columnas) —
        const col1 = mg; const col2 = 110; const colW = 80;
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.setTextColor(232, 0, 42); // red Travelike
        doc.text("DATOS AGENCIA", col1, y);
        doc.text("DETALLE DE LA RESERVA", col2, y);
        y += 5;
        doc.setTextColor(60, 60, 60); doc.setFont("helvetica", "normal"); doc.setFontSize(9);

        const agLines = ["Agencia: TRAVELIKE SL", "CIF: B02628766", "Dirección: Ana Karenina 6, Albacete", "C.P.: 02005  ·  Albacete, España"];
        agLines.forEach(l => { doc.text(l, col1, y); y += 5; });

        const resLines = doc.splitTextToSize(fa.detalleReserva || "", colW);
        let ry = y - (agLines.length * 5);
        resLines.forEach(l => { doc.text(l, col2, ry); ry += 5; });
        y = Math.max(y, ry) + 4;

        // — Fechas salida / regreso —
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
        const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("es-ES") : "—";
        doc.text(`Fecha Salida: ${fmtDate(fa.fechaSalida)}`, col2, y);
        doc.text(`Fecha Regreso: ${fmtDate(fa.fechaRegreso)}`, col2 + 50, y);
        y += 10;

        doc.setDrawColor(220, 220, 220); doc.line(mg, y, W - mg, y); y += 8;

        // — Datos clientes —
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(232, 0, 42);
        doc.text("DATOS CLIENTES", col1, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(60, 60, 60);

        const selClients = tc.filter(c => fa.clientesSeleccionados.includes(c.id));
        selClients.forEach((c, i) => {
          const docStr = c.docNumero ? `  ·  ${c.docNumero}` : "";
          doc.text(`${i + 1}. ${c.nombre}${docStr}`, col1, y);
          y += 5;
          if (y > H - 40) { doc.addPage(); y = mg; }
        });

        y += 6;
        doc.setDrawColor(220, 220, 220); doc.line(mg, y, W - mg, y); y += 8;

        // — Total + régimen —
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(60, 60, 60);
        doc.text("DETALLES DE PAGO", col1, y);
        doc.setTextColor(232, 0, 42); doc.setFontSize(13);
        doc.text(`TOTAL FACTURA: ${fa.totalFactura}€`, W - mg, y, { align: "right" });
        y += 14;

        // — Pie —
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
        doc.text("Travelike, S.L. con CIF B02628766", W / 2, H - 18, { align: "center" });
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
        doc.text("*Régimen especial de las agencias de viajes*", W / 2, H - 12, { align: "center" });

        doc.save(`Factura_${fa.numFactura.replace(/[/\\]/g, "-")}.pdf`);
      } catch (e) { alert("Error al generar PDF: " + e.message); }
      setGenerating(null);
    };

    const editingFa = editId ? facturasVenta.find(f => f.id === editId) : null;

    if (view === "new" || (view === "edit" && editingFa)) {
      const f = view === "edit" ? editingFa : form;
      const setF = view === "edit"
        ? upd => updTrip(t => ({ ...t, facturasVenta: t.facturasVenta.map(x => x.id === editId ? { ...x, ...(typeof upd === "function" ? upd(x) : upd) } : x) }))
        : setForm;

      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
              {view === "edit" ? "✏️ Editar Factura" : "📄 Nueva Factura de Venta"}
            </div>
            <button onClick={() => { setView("list"); setEditId(null); }} style={{ background: "transparent", border: "none", color: A.muted, fontSize: 13, cursor: "pointer", fontFamily: BF }}>✕ Cancelar</button>
          </div>

          {/* Nº Factura + Fecha */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Nº Factura</div>
              <input value={f.numFactura || ""} onChange={e => setF(x => ({ ...x, numFactura: e.target.value }))}
                placeholder="09/25" style={{ ...ais, fontFamily: ANTON, fontSize: 18, letterSpacing: 2 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Fecha</div>
              <input type="date" value={f.fechaFactura || ""} onChange={e => setF(x => ({ ...x, fechaFactura: e.target.value }))}
                style={{ ...ais, colorScheme: "dark" }} />
            </div>
          </div>

          {/* Detalle reserva */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Detalle de la Reserva</div>
            <textarea value={f.detalleReserva || ""} onChange={e => setF(x => ({ ...x, detalleReserva: e.target.value }))}
              rows={5} style={{ ...ais, resize: "vertical", lineHeight: 1.7 }} />
          </div>

          {/* Fechas salida / regreso */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Fecha Salida</div>
              <input type="date" value={f.fechaSalida || ""} onChange={e => setF(x => ({ ...x, fechaSalida: e.target.value }))}
                style={{ ...ais, colorScheme: "dark" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Fecha Regreso</div>
              <input type="date" value={f.fechaRegreso || ""} onChange={e => setF(x => ({ ...x, fechaRegreso: e.target.value }))}
                style={{ ...ais, colorScheme: "dark" }} />
            </div>
          </div>

          {/* Selección de viajeros */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              Viajeros ({(f.clientesSeleccionados || []).length} seleccionados)
            </div>
            {tc.length === 0 ? (
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, padding: "10px", textAlign: "center" }}>No hay viajeros en este viaje</div>
            ) : tc.map(c => {
              const sel = (f.clientesSeleccionados || []).includes(c.id);
              const toggleFn = () => {
                const curr = f.clientesSeleccionados || [];
                const next = curr.includes(c.id) ? curr.filter(x => x !== c.id) : [...curr, c.id];
                setF(x => ({ ...x, clientesSeleccionados: next }));
              };
              return (
                <div key={c.id} onClick={toggleFn} style={{ background: sel ? A.cyan + "18" : A.bg, borderRadius: 10, marginBottom: 6, border: `2px solid ${sel ? A.cyan : A.border + "66"}`, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${sel ? A.cyan : A.border}`, background: sel ? A.cyan : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {sel && <span style={{ color: A.bg, fontSize: 14, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: A.text }}>{c.nombre}</div>
                    {c.docNumero ? (
                      <div style={{ fontFamily: ANTON, fontSize: 16, color: sel ? A.cyan : A.muted, letterSpacing: 3, marginTop: 2 }}>
                        {c.docNumero}
                        {c.docVerified && <span style={{ fontFamily: BF, fontSize: 9, color: A.green, marginLeft: 8, letterSpacing: 1 }}>✓ VERIF.</span>}
                      </div>
                    ) : (
                      <div style={{ fontFamily: BF, fontSize: 10, color: A.orange }}>⚠️ Sin número de documento</div>
                    )}
                  </div>
                </div>
              );
            })}
            {tc.length > 0 && (
              <button onClick={() => {
                const allIds = tc.map(c => c.id);
                const curr = f.clientesSeleccionados || [];
                const allSel = allIds.every(id => curr.includes(id));
                setF(x => ({ ...x, clientesSeleccionados: allSel ? [] : allIds }));
              }} style={{ width: "100%", marginTop: 4, padding: "9px", background: A.card2, border: `1px dashed ${A.border}`, borderRadius: 8, color: A.muted, fontFamily: BF, fontSize: 12, cursor: "pointer" }}>
                {(f.clientesSeleccionados || []).length === tc.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            )}
          </div>

          {/* Total */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Total Factura (€)</div>
            <input type="number" value={f.totalFactura || ""} onChange={e => setF(x => ({ ...x, totalFactura: e.target.value }))}
              placeholder="60518" style={{ ...ais, fontFamily: ANTON, fontSize: 26, letterSpacing: 2, color: A.red }} />
          </div>

          {/* Botón guardar */}
          <button onClick={view === "edit" ? () => { setView("list"); setEditId(null); } : saveFactura}
            disabled={!f.numFactura || !f.fechaFactura}
            style={{ width: "100%", padding: "16px", border: "none", borderRadius: 12, fontFamily: ANTON, fontSize: 16, letterSpacing: 2, cursor: "pointer", background: (f.numFactura && f.fechaFactura) ? `linear-gradient(90deg,${A.red},#b30020)` : A.card2, color: (f.numFactura && f.fechaFactura) ? "#fff" : A.muted, textTransform: "uppercase", marginBottom: 8 }}>
            {view === "edit" ? "GUARDAR CAMBIOS" : "CREAR FACTURA"}
          </button>
        </div>
      );
    }

    // — LISTA de facturas —
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>Facturación</div>
          <button onClick={() => { setForm(emptyForm()); setView("new"); }} style={{ ...ab(A.red + "22", A.red), border: `1px solid ${A.red}44`, padding: "7px 14px", fontSize: 12, borderRadius: 8, fontFamily: BF }}>+ Nueva</button>
        </div>
        {facturasVenta.length === 0 ? (
          <AEmpty text="Sin facturas de venta" />
        ) : facturasVenta.map(fa => {
          const selCount = (fa.clientesSeleccionados || []).length;
          const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";
          return (
            <div key={fa.id} style={{ background: A.card, borderRadius: 12, marginBottom: 10, border: `1px solid ${A.red}33`, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: ANTON, fontSize: 17, color: A.red, letterSpacing: 1 }}>Factura {fa.numFactura}</div>
                    <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, marginTop: 2 }}>
                      {fmtDate(fa.fechaFactura)}
                      {fa.fechaSalida && ` · Salida: ${fmtDate(fa.fechaSalida)}`}
                      {fa.fechaRegreso && ` · Regreso: ${fmtDate(fa.fechaRegreso)}`}
                    </div>
                    <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, marginTop: 2 }}>👥 {selCount} viajero{selCount !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ fontFamily: ANTON, fontSize: 20, color: A.red, whiteSpace: "nowrap", flexShrink: 0 }}>{fa.totalFactura ? `${fa.totalFactura}€` : "—"}</div>
                </div>
                {/* Lista de viajeros con número de documento */}
                {selCount > 0 && (
                  <div style={{ background: A.bg, borderRadius: 8, padding: "8px 10px", marginBottom: 8, border: `1px solid ${A.border}33` }}>
                    {tc.filter(c => (fa.clientesSeleccionados || []).includes(c.id)).map((c, i) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: i < selCount - 1 ? `1px solid ${A.border}22` : "none" }}>
                        <span style={{ fontFamily: BF, fontSize: 11, color: A.muted, width: 18 }}>{i + 1}.</span>
                        <span style={{ fontFamily: BF, fontSize: 12, color: A.text, flex: 1 }}>{c.nombre}</span>
                        <span style={{ fontFamily: ANTON, fontSize: 14, color: c.docVerified ? A.cyan : A.orange, letterSpacing: 2 }}>
                          {c.docNumero || "⚠️ SIN DOC"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setEditId(fa.id); setView("edit"); }} style={{ ...ab(A.card2, A.muted), flex: 1, border: `1px solid ${A.border}`, padding: "8px", fontSize: 11, borderRadius: 8, fontFamily: BF }}>✏️ Editar</button>
                  <button onClick={() => downloadFacturaPDF(fa)} disabled={generating === fa.id} style={{ ...ab(A.red + "22", A.red), flex: 2, border: `1px solid ${A.red}44`, padding: "8px", fontSize: 11, borderRadius: 8, fontFamily: BF }}>
                    {generating === fa.id ? "⏳ Generando..." : "📥 Descargar PDF"}
                  </button>
                  <button onClick={() => delFacturaVenta(fa.id)} style={{ background: "transparent", border: "none", color: A.muted, fontSize: 16, cursor: "pointer", padding: "0 4px" }}>✕</button>
                </div>
                <div style={{ textAlign: "center", marginTop: 8, fontFamily: BF, fontSize: 9, color: A.muted + "88", letterSpacing: 1 }}>
                  *Régimen especial de las agencias de viajes*
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── AI DOCS TAB (callClaude - nueva versión) ───
  const AIDocsTab=()=>{
    const [queue,setQueue]=useState([]);
    const [processing,setProcessing]=useState(false);
    const fileRef=useRef();
    const allTargets=tc.flatMap(c=>[
      { id:c.id,nombre:c.nombre,type:"client",clientId:c.id },
      ...(c.acompanantes||[]).map(a=>({ id:a.id,nombre:a.nombre,type:"acomp",clientId:c.id }))
    ]);
    const addFiles=e=>{ const files=Array.from(e.target.files||[]); setQueue(q=>[...q,...files.map(f=>({ id:uid(),file:f,name:f.name,status:"pending",result:null,b64:null,mime:f.type }))]); e.target.value=""; };
    const processAll=async()=>{
      const pending=queue.filter(q=>q.status==="pending"); if(!pending.length) return; setProcessing(true);
      const encoded=await Promise.all(pending.map(async item=>{ const b64=await fileToB64(item.file); return {...item,b64}; }));
      for(const item of encoded){
        setQueue(q=>q.map(x=>x.id===item.id?{...x,b64:item.b64,status:"processing"}:x));
        try{
          const prompt=`Analiza este documento de viaje.\nViajeros del grupo: ${allTargets.map(t=>t.nombre).join(", ")}.\n\nExtrae:\n1. Nombre EXACTO del pasajero (debe coincidir con uno de la lista, o "desconocido")\n2. Tipo de documento: "vuelo_ida", "vuelo_vuelta", "seguro", "voucher", "visado", "hotel", "otro"\n3. Descripción breve (ej: "Madrid→Tokyo IB6251", "Seguro Mapfre", "Hotel Hilton")\n4. Referencia o número de reserva\n5. Etiqueta corta para nombre de archivo: "IDA", "VUELTA", "SEGURO", "VOUCHER" etc.\n\nResponde SOLO JSON sin markdown:\n{"pasajero":"","tipo":"vuelo_ida","descripcion":"","referencia":"","etiqueta":"IDA"}`;
          const raw=await callClaude(item.b64, item.mime||"application/pdf", prompt);
          const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
          const nombreBuscado=(parsed.pasajero||"").toLowerCase().trim();
          const matchedTarget=allTargets.find(t=>t.nombre.toLowerCase()===nombreBuscado)||allTargets.find(t=>{ const partes=nombreBuscado.split(/\s+/); return partes.some(p=>p.length>2&&t.nombre.toLowerCase().includes(p)); })||null;
          setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"done",result:{...parsed,matchedTarget}}:x));
        }catch(e){ setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"error"}:x)); }
      }
      setProcessing(false);
    };
    const assignDoc=(item,target,tipo)=>{
      const etiqueta=item.result?.etiqueta||tipo.replace("vuelo_","").toUpperCase();
      const ext=item.mime?.includes("pdf")?"pdf":item.mime?.includes("png")?"png":"jpg";
      const nombre=`${target.nombre.split(" ")[0]}_${etiqueta}.${ext}`;
      const doc={ id:uid(),tipo:tipo.startsWith("vuelo")?"vuelo":tipo,nombre,archivo:item.result?.referencia||item.name,descripcion:item.result?.descripcion,data:item.b64,mimeType:item.mime };
      if(target.type==="acomp"){ updClient(target.clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===target.id?{...a,personalDocs:[...(a.personalDocs||[]),doc]}:a)})); }
      else{ updClient(target.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc]})); }
      setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"assigned"}:x));
    };
    const autoAssignAll=()=>{ queue.filter(x=>x.status==="done"&&x.result?.matchedTarget).forEach(item=>{ assignDoc(item,item.result.matchedTarget,item.result.tipo||"doc"); }); };
    const doneWithMatch=queue.filter(q=>q.status==="done"&&q.result?.matchedTarget).length;

    return (
      <div style={{ padding:"0 16px" }}>
        <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
        <div style={{ background:A.cyan+"15",border:`1px solid ${A.cyan}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontFamily:BF,fontSize:12,color:A.cyan }}>
          🤖 Powered by <strong>Claude AI</strong> — analiza y asigna documentos automáticamente
        </div>
        <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple style={{ display:"none" }} onChange={addFiles} />
        <div style={{ display:"flex",gap:8,marginBottom:10 }}>
          <button onClick={()=>fileRef.current.click()} style={{ flex:2,background:A.purple+"22",border:`1.5px dashed ${A.purple}`,borderRadius:10,padding:"12px",color:A.purple,fontFamily:BF,fontSize:13,cursor:"pointer",fontWeight:700 }}>📁 Seleccionar PDFs / Fotos</button>
          {queue.filter(q=>q.status==="pending").length>0&&!processing&&(
            <button onClick={processAll} style={{ flex:1,background:A.cyan,border:"none",borderRadius:10,padding:"12px",color:A.bg,fontFamily:BF,fontSize:12,cursor:"pointer",fontWeight:700 }}>🔍 Analizar</button>
          )}
        </div>
        {doneWithMatch>0&&(
          <button onClick={autoAssignAll} style={{ width:"100%",padding:"12px",background:`linear-gradient(90deg,${A.green},#26a047)`,border:"none",borderRadius:10,color:"#fff",fontFamily:BF,fontSize:13,cursor:"pointer",marginBottom:12,fontWeight:700 }}>
            ⚡ Asignar automáticamente todos ({doneWithMatch})
          </button>
        )}
        {processing&&<div style={{ textAlign:"center",padding:"10px",color:A.cyan,fontSize:13,marginBottom:12,fontFamily:BF }}>⏳ Analizando con Claude AI...</div>}
        {queue.length===0&&<AEmpty text="Sube billetes de ida y vuelta, seguros, vouchers u otros documentos" />}
        {queue.map(item=>(
          <div key={item.id} style={{ background:A.card,borderRadius:12,padding:"12px",marginBottom:8,border:`1px solid ${item.status==="done"?A.cyan+"44":item.status==="assigned"?A.green+"44":item.status==="error"?A.red+"44":A.border+"44"}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:item.result?10:0 }}>
              <span style={{ fontSize:18 }}>{item.status==="pending"?"📄":item.status==="processing"?"⏳":item.status==="done"?"✨":item.status==="assigned"?"✅":"❌"}</span>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:A.text,fontFamily:BF,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{item.name}</div>
                {item.result&&<div style={{ fontSize:10,color:A.cyan,fontFamily:BF }}>{item.result.tipo?.replace(/_/g," ").toUpperCase()} · {item.result.etiqueta}</div>}
              </div>
              {["pending","done","error"].includes(item.status)&&<button onClick={()=>setQueue(q=>q.filter(x=>x.id!==item.id))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button>}
            </div>
            {item.status==="done"&&item.result&&(
              <div>
                {item.result.descripcion&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:8,fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}>📋 {item.result.descripcion}{item.result.referencia&&<span style={{ color:A.gold }}> · {item.result.referencia}</span>}</div>}
                <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Asignar a:</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {allTargets.map(target=>{ const suggested=item.result.matchedTarget?.id===target.id; return (
                    <button key={target.id} onClick={()=>assignDoc(item,target,item.result.tipo||"doc")}
                      style={{ padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:BF,border:`2px solid ${suggested?A.cyan:target.type==="acomp"?A.purple:A.border}`,background:suggested?A.cyan+"22":target.type==="acomp"?A.purple+"11":A.bg,color:suggested?A.cyan:target.type==="acomp"?A.purple:A.text,fontSize:11,fontWeight:suggested?800:500 }}>
                      {suggested&&"✨ "}{target.nombre.split(" ")[0]}{target.type==="acomp"&&<span style={{ fontSize:9,opacity:0.7 }}> acomp.</span>}
                    </button>
                  ); })}
                </div>
              </div>
            )}
            {item.status==="assigned"&&<div style={{ fontSize:12,color:A.green,fontWeight:700,fontFamily:BF }}>✓ Asignado — el viajero puede descargarlo desde su portal</div>}
          </div>
        ))}
      </div>
    );
  };

  // ─── EDIT TAB ───
  const EditTab=()=>{
    const [sec,setSec]=useState(null);
    const [lName,setLName]=useState(trip.name); const [lFlag,setLFlag]=useState(trip.flag);
    const [lFechas,setLFechas]=useState(trip.fechas||""); const [lPrice,setLPrice]=useState(trip.price||"");
    const [lWebUrl,setLWebUrl]=useState(trip.webUrl||""); const [lCurrency,setLCurrency]=useState(trip.currency||"EUR");
    const [currMenu2,setCurrMenu2]=useState(false);
    const [efNombre,setEfNombre]=useState(""); const [efArchivo,setEfArchivo]=useState("");
    const [dfNombre,setDfNombre]=useState(""); const [dfArchivo,setDfArchivo]=useState("");
    const [ifIcono,setIfIcono]=useState("💡"); const [ifTitulo,setIfTitulo]=useState(""); const [ifTexto,setIfTexto]=useState(""); const [ifUrl,setIfUrl]=useState("");
    const [newImpresc,setNewImpresc]=useState(""); const [newCatItems,setNewCatItems]=useState({});
    const [newCatIcon,setNewCatIcon]=useState("⭐"); const [newCatLabel,setNewCatLabel]=useState(""); const [newCatKey,setNewCatKey]=useState(""); const [newCatTipo,setNewCatTipo]=useState("rating");
    const mImpresc=trip.maletaImprescindibles||DEFAULT_IMPRESCINDIBLES;
    const mCats=trip.maletaCats||DEFAULT_MALETA_CATS;
    const hotels=trip.hotels||[];
    const emerg=trip.emergencias||emptyEmergencias();
    const sc=trip.surveyConfig||{ categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[] };

    if(sec===null){
      return (
        <div style={{ padding:"12px 16px" }}>
          <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:14,textAlign:"center" }}>¿Qué quieres editar?</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
            {EDIT_SECS.map(s=>{
              let badge=null;
              if(s.k==="vuelos") badge=(trip.vuelos||[]).length;
              if(s.k==="docs") badge=(trip.docs||[]).length;
              if(s.k==="info") badge=(trip.info||[]).length;
              if(s.k==="hotels") badge=(trip.hotels||[]).length;
              if(s.k==="maleta") badge=mImpresc.length+mCats.reduce((s2,c)=>s2+c.items.length,0);
              if(s.k==="survey"&&trip.surveyEnabled) badge=(sc.surveyResponses||[]).length;
              return (
                <button key={s.k} onClick={()=>setSec(s.k)} style={{ background:A.card,border:`1.5px solid ${s.k==="survey"&&trip.surveyEnabled?A.gold+"66":A.border}`,borderRadius:16,padding:"16px 6px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",position:"relative",minHeight:80 }}>
                  {badge>0&&<div style={{ position:"absolute",top:6,right:6,background:s.k==="survey"?A.gold:A.cyan,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:10,color:A.bg }}>{badge}</div>}
                  <span style={{ fontSize:26 }}>{s.icon}</span>
                  <span style={{ fontFamily:BF,fontSize:10,fontWeight:700,color:A.muted,letterSpacing:1 }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const secInfo=EDIT_SECS.find(s=>s.k===sec);
    return (
      <div style={{ padding:"0 16px" }}>
        <button onClick={()=>setSec(null)} style={{ display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",color:A.muted,fontSize:13,cursor:"pointer",fontFamily:BF,padding:"10px 0 14px" }}>← Volver</button>
        <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1,marginBottom:16,textTransform:"uppercase" }}>{secInfo?.icon} {secInfo?.label}</div>

        {sec==="general"&&<div>
          <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:10,marginBottom:10 }}>
            <input value={lFlag} onChange={e=>setLFlag(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:24,padding:"8px" }} />
            <input value={lName} onChange={e=>setLName(e.target.value)} placeholder="Nombre del viaje" style={ais} />
          </div>
          <input value={lFechas} onChange={e=>setLFechas(e.target.value)} placeholder="Fechas para viajeros" style={{ ...ais,marginBottom:10 }} />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:10,marginBottom:10 }}>
            <input value={lPrice} onChange={e=>setLPrice(e.target.value.replace(/[^\d.]/g,""))} placeholder="Precio" inputMode="numeric" style={ais} />
            <button onClick={()=>setCurrMenu2(true)} style={{ ...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold }}>{lCurrency} ▾</button>
          </div>
          <input value={lWebUrl} onChange={e=>setLWebUrl(e.target.value)} placeholder="URL web del viaje" style={{ ...ais,marginBottom:14 }} />
          <button onClick={()=>updTrip(t=>({...t,name:lName,flag:lFlag,fechas:lFechas,price:lPrice?+lPrice:null,webUrl:lWebUrl,currency:lCurrency}))} style={{ ...ab(A.green),width:"100%",borderRadius:10,fontFamily:BF }}>Guardar</button>
          {currMenu2&&<CurrencyMenu current={lCurrency} onSelect={setLCurrency} onClose={()=>setCurrMenu2(false)} />}
        </div>}

        {sec==="vuelos"&&<div>
          {(trip.vuelos||[]).map((v,i)=><div key={i} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}44`,display:"flex",alignItems:"center",gap:10 }}><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:A.text,fontFamily:BF }}>{v.nombre}</div><div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{v.archivo}</div></div><button onClick={()=>updTrip(t=>({...t,vuelos:t.vuelos.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>)}
          <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
            <input value={efNombre} onChange={e=>setEfNombre(e.target.value)} placeholder="Nombre del vuelo" style={{ ...ais,marginBottom:8 }} />
            <input value={efArchivo} onChange={e=>setEfArchivo(e.target.value)} placeholder="Referencia" style={{ ...ais,marginBottom:10 }} />
            <button onClick={()=>{ if(!efNombre.trim()) return; updTrip(t=>({...t,vuelos:[...(t.vuelos||[]),{id:uid(),nombre:efNombre,archivo:efArchivo}]})); setEfNombre(""); setEfArchivo(""); }} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:8,fontFamily:BF }}>+ Añadir</button>
          </div>
        </div>}

        {sec==="docs"&&<div>
          {(trip.docs||[]).map((d,i)=><div key={i} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}44`,display:"flex",alignItems:"center",gap:10 }}><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:A.text,fontFamily:BF }}>{d.nombre}</div><div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{d.archivo}</div></div><button onClick={()=>updTrip(t=>({...t,docs:t.docs.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>)}
          <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
            <input value={dfNombre} onChange={e=>setDfNombre(e.target.value)} placeholder="Nombre del documento" style={{ ...ais,marginBottom:8 }} />
            <input value={dfArchivo} onChange={e=>setDfArchivo(e.target.value)} placeholder="Referencia" style={{ ...ais,marginBottom:10 }} />
            <button onClick={()=>{ if(!dfNombre.trim()) return; updTrip(t=>({...t,docs:[...(t.docs||[]),{id:uid(),nombre:dfNombre,archivo:dfArchivo}]})); setDfNombre(""); setDfArchivo(""); }} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:8,fontFamily:BF }}>+ Añadir</button>
          </div>
        </div>}

        {sec==="pagos"&&<div>
          {(trip.pagosConfig||[]).map((p,i)=>(
            <div key={i} style={{ background:A.card,borderRadius:10,padding:"12px",marginBottom:10,border:`1px solid ${A.border}` }}>
              <div style={{ fontSize:10,color:A.cyan,fontWeight:700,marginBottom:8,fontFamily:BF,letterSpacing:2,textTransform:"uppercase" }}>Pago {i+1}</div>
              <input value={p.label} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,label:e.target.value}:x)}))} placeholder="Concepto" style={{ ...ais,marginBottom:8 }} />
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
                <input value={p.fecha} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,fecha:e.target.value}:x)}))} placeholder="Texto fecha" style={ais} />
                <input value={p.importe} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,importe:e.target.value}:x)}))} placeholder="Importe base" style={ais} />
              </div>
              <input type="date" value={p.fechaISO||""} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,fechaISO:e.target.value}:x)}))} style={{ ...ais,colorScheme:"dark" }} />
            </div>
          ))}
          <ARow>
            <button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig||[]),{label:"Nuevo pago",fecha:"",fechaISO:"",importe:""}]}))} style={{ ...ab(A.orange+"22",A.orange),flex:1,border:`1.5px dashed ${A.orange}`,borderRadius:10,fontFamily:BF }}>+ Añadir hito</button>
            {(trip.pagosConfig||[]).length>1&&<button onClick={()=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.slice(0,-1)}))} style={{ ...ab(A.red+"22",A.red),flex:1,border:`1px solid ${A.red}44`,borderRadius:10,fontFamily:BF }}>- Quitar último</button>}
          </ARow>
        </div>}

        {sec==="info"&&<div>
          {(trip.info||[]).map((it,i)=><div key={i} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}44`,display:"flex",gap:10,alignItems:"flex-start" }}><span style={{ fontSize:22 }}>{it.icono}</span><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:A.text,fontFamily:BF }}>{it.titulo}</div><div style={{ fontSize:11,color:A.muted,marginTop:2,fontFamily:BF }}>{it.texto}</div></div><button onClick={()=>updTrip(t=>({...t,info:t.info.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>)}
          <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
            <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:8,marginBottom:8 }}><input value={ifIcono} onChange={e=>setIfIcono(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:22,padding:"8px" }} /><input value={ifTitulo} onChange={e=>setIfTitulo(e.target.value)} placeholder="Título" style={ais} /></div>
            <textarea value={ifTexto} onChange={e=>setIfTexto(e.target.value)} placeholder="Texto..." style={{ ...ais,minHeight:70,resize:"vertical",marginBottom:8,lineHeight:1.5 }} />
            <input value={ifUrl} onChange={e=>setIfUrl(e.target.value)} placeholder="Enlace (opcional)" style={{ ...ais,marginBottom:10 }} />
            <button onClick={()=>{ if(!ifTitulo.trim()) return; updTrip(t=>({...t,info:[...(t.info||[]),{icono:ifIcono,titulo:ifTitulo,texto:ifTexto,url:ifUrl}]})); setIfIcono("💡"); setIfTitulo(""); setIfTexto(""); setIfUrl(""); }} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:8,fontFamily:BF }}>+ Añadir</button>
          </div>
        </div>}

        {/* ✅ FIX: Hotels usan defaultValue+onBlur para evitar el bug de cursor */}
        {sec==="hotels"&&<div>
          {hotels.map((h,i)=>(
            <div key={h.id} style={{ background:A.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1px solid ${A.gold}33` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <div style={{ fontFamily:ANTON,fontSize:15,color:A.gold }}>Hotel {i+1}</div>
                <button onClick={()=>updTrip(t=>({...t,hotels:t.hotels.filter(x=>x.id!==h.id)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",lineHeight:1 }}>✕</button>
              </div>
              <input key={h.id+"_nombre"} defaultValue={h.nombre} onBlur={e=>updTrip(t=>({...t,hotels:t.hotels.map(x=>x.id===h.id?{...x,nombre:e.target.value}:x)}))} placeholder="Nombre del hotel" style={{ ...ais,marginBottom:8 }} />
              <input key={h.id+"_fechas"} defaultValue={h.fechasEstancia||""} onBlur={e=>updTrip(t=>({...t,hotels:t.hotels.map(x=>x.id===h.id?{...x,fechasEstancia:e.target.value}:x)}))} placeholder="Fechas de estancia" style={{ ...ais,marginBottom:8 }} />
              <input key={h.id+"_dir"} defaultValue={h.direccion} onBlur={e=>updTrip(t=>({...t,hotels:t.hotels.map(x=>x.id===h.id?{...x,direccion:e.target.value}:x)}))} placeholder="Dirección" style={ais} />
            </div>
          ))}
          <button onClick={()=>updTrip(t=>({...t,hotels:[...(t.hotels||[]),emptyHotel()]}))} style={{ ...ab(A.gold+"22",A.gold),width:"100%",border:`1.5px dashed ${A.gold}`,borderRadius:10,fontFamily:BF }}>+ Añadir hotel</button>
        </div>}

        {sec==="maleta"&&<div>
          <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBottom:14,border:`1px solid ${A.cyan}33` }}>
            <div style={{ fontFamily:ANTON,fontSize:15,color:A.cyan,letterSpacing:1,marginBottom:10,textTransform:"uppercase" }}>Imprescindibles</div>
            {mImpresc.map((item,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:A.bg,borderRadius:8,marginBottom:6,border:`1px solid ${A.border}` }}>
                <span style={{ fontSize:14 }}>⭐</span>
                <input value={item} onChange={e=>updTrip(t=>({...t,maletaImprescindibles:t.maletaImprescindibles.map((x,j)=>j===i?e.target.value:x)}))} style={{ ...ais,flex:1,padding:"4px 8px",fontSize:14,borderColor:"transparent",background:"transparent",color:A.text }} />
                <button onClick={()=>updTrip(t=>({...t,maletaImprescindibles:t.maletaImprescindibles.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer" }}>✕</button>
              </div>
            ))}
            <div style={{ display:"flex",gap:8,marginTop:8 }}>
              <input value={newImpresc} onChange={e=>setNewImpresc(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&newImpresc.trim()){ updTrip(t=>({...t,maletaImprescindibles:[...(t.maletaImprescindibles||[]),newImpresc.trim()]})); setNewImpresc(""); } }} placeholder="Añadir imprescindible" style={{ ...ais,flex:1 }} />
              <button onClick={()=>{ if(!newImpresc.trim()) return; updTrip(t=>({...t,maletaImprescindibles:[...(t.maletaImprescindibles||[]),newImpresc.trim()]})); setNewImpresc(""); }} style={{ ...ab(A.cyan+"22",A.cyan),padding:"8px 14px",border:`1px solid ${A.cyan}44`,flexShrink:0,borderRadius:8,fontFamily:BF }}>+</button>
            </div>
          </div>
          {mCats.map((cat,ci)=>(
            <div key={cat.id} style={{ background:A.card,borderRadius:14,padding:"14px",marginBottom:10,border:`1px solid ${A.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{cat.icon}</span>
                <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,flex:1 }}>{cat.label}</div>
              </div>
              {cat.items.map((item,ii)=>(
                <div key={ii} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 6px",background:A.bg,borderRadius:6,marginBottom:4 }}>
                  <input value={item} onChange={e=>updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:c2.items.map((x,xi)=>xi===ii?e.target.value:x)}:c2)}))} style={{ ...ais,flex:1,padding:"3px 8px",fontSize:13,borderColor:"transparent",background:"transparent",color:A.text }} />
                  <button onClick={()=>updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:c2.items.filter((_,xi)=>xi!==ii)}:c2)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:14,cursor:"pointer" }}>✕</button>
                </div>
              ))}
              <div style={{ display:"flex",gap:6,marginTop:6 }}>
                <input value={newCatItems[cat.id]||""} onChange={e=>setNewCatItems(x=>({...x,[cat.id]:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter"&&(newCatItems[cat.id]||"").trim()){ updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:[...c2.items,(newCatItems[cat.id]||"").trim()]}:c2)})); setNewCatItems(x=>({...x,[cat.id]:""})); } }} placeholder={`Añadir a ${cat.label}`} style={{ ...ais,flex:1,fontSize:13 }} />
                <button onClick={()=>{ const v=(newCatItems[cat.id]||"").trim(); if(!v) return; updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:[...c2.items,v]}:c2)})); setNewCatItems(x=>({...x,[cat.id]:""})); }} style={{ ...ab(A.border,A.muted),padding:"6px 10px",fontSize:11,flexShrink:0,borderRadius:8,fontFamily:BF }}>+</button>
              </div>
            </div>
          ))}
        </div>}

        {/* ✅ FIX: SOS usa defaultValue+onBlur */}
        {sec==="emerg"&&<div>
          {[{k:"policia",l:"Policía"},{k:"ambulancia",l:"Ambulancia"},{k:"bomberos",l:"Bomberos"},{k:"embajada",l:"Embajada española"}].map(item=>(
            <div key={item.k}>
              <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>{item.l}</div>
              <input key={item.k} defaultValue={emerg[item.k]||""} onBlur={e=>updTrip(t=>({...t,emergencias:{...(t.emergencias||emptyEmergencias()),[item.k]:e.target.value}}))} style={{ ...ais,marginBottom:12 }} />
            </div>
          ))}
        </div>}

        {sec==="survey"&&<div>
          <div style={{ background:A.card2,borderRadius:14,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
            <label style={{ display:"flex",gap:12,alignItems:"center",cursor:"pointer",padding:"14px",background:trip.surveyEnabled?A.gold+"15":A.bg,borderRadius:12,border:`2px solid ${trip.surveyEnabled?A.gold:A.border}` }}>
              <input type="checkbox" checked={trip.surveyEnabled||false} onChange={e=>updTrip(t=>({...t,surveyEnabled:e.target.checked}))} style={{ width:22,height:22,accentColor:A.gold }} />
              <div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:trip.surveyEnabled?"#fff":A.muted }}>{trip.surveyEnabled?"Encuesta ACTIVA":"Activar encuesta post-viaje"}</div>
            </label>
          </div>
          <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,marginBottom:10,textTransform:"uppercase" }}>Categorías de valoración</div>
          {(sc.categories||[]).map((cat,i)=>(
            <div key={cat.key} style={{ background:A.card,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1px solid ${A.gold}33`,display:"flex",gap:10,alignItems:"center" }}>
              <input value={cat.icon} onChange={e=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:t.surveyConfig.categories.map((c2,j)=>j===i?{...c2,icon:e.target.value}:c2)}}))} style={{ ...ais,width:48,textAlign:"center",fontSize:22,padding:"4px",flexShrink:0 }} />
              <input value={cat.label} onChange={e=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:t.surveyConfig.categories.map((c2,j)=>j===i?{...c2,label:e.target.value}:c2)}}))} style={{ ...ais,flex:1,fontSize:14 }} />
              <span style={{ fontSize:9,color:A.muted,fontFamily:BF,flexShrink:0 }}>{cat.tipo==="texto"?"📝":"⭐"}</span>
              <button onClick={()=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:t.surveyConfig.categories.filter((_,j)=>j!==i)}}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button>
            </div>
          ))}
          <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.gold}33`,marginBottom:14 }}>
            <div style={{ fontFamily:BF,fontSize:10,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Nueva categoría</div>
            <div style={{ display:"grid",gridTemplateColumns:"48px 1fr 80px",gap:8,marginBottom:8 }}>
              <input value={newCatIcon} onChange={e=>setNewCatIcon(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:22,padding:"4px" }} />
              <input value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)} placeholder="Nombre" style={ais} />
              <input value={newCatKey} onChange={e=>setNewCatKey(e.target.value.replace(/\s/g,"_").toLowerCase())} placeholder="clave" style={ais} />
            </div>
            {/* ✅ Selector de tipo: rating o texto */}
            <select value={newCatTipo} onChange={e=>setNewCatTipo(e.target.value)} style={{ ...ais,marginBottom:10 }}>
              <option value="rating">⭐ Valoración 1-5</option>
              <option value="texto">📝 Pregunta abierta</option>
            </select>
            <button onClick={()=>{ if(!newCatLabel.trim()||!newCatKey.trim()) return; const key=newCatKey||newCatLabel.toLowerCase().replace(/\s/g,"_"); updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:[...(t.surveyConfig?.categories||[]),{key,label:newCatLabel,icon:newCatIcon,tipo:newCatTipo}]}})); setNewCatLabel(""); setNewCatKey(""); setNewCatIcon("⭐"); setNewCatTipo("rating"); }} style={{ ...ab(A.gold+"22",A.gold),width:"100%",border:`1px solid ${A.gold}44`,borderRadius:8,fontFamily:BF }}>+ Añadir categoría</button>
          </div>
          {(sc.surveyResponses||[]).length>0&&<div>
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>Respuestas ({(sc.surveyResponses||[]).length})</div>
            {(sc.surveyResponses||[]).map((r,i)=>(
              <div key={i} style={{ background:A.card,borderRadius:12,padding:"14px",marginBottom:10,border:`1px solid ${A.gold}33` }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                  <div style={{ fontFamily:BF,fontSize:13,color:A.muted }}>Anónima #{i+1}</div>
                  <div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{r.date}</div>
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
                  {(sc.categories||[]).filter(cat=>cat.tipo!=="texto").map(cat=>r.ratings?.[cat.key]?(
                    <div key={cat.key} style={{ background:A.card2,borderRadius:8,padding:"6px 10px",textAlign:"center",border:`1px solid ${A.border}` }}>
                      <div style={{ fontSize:9,color:A.muted,fontFamily:BF,marginBottom:2 }}>{cat.icon} {cat.label}</div>
                      <div style={{ fontSize:20 }}>{SURVEY_EMOJIS[(r.ratings[cat.key]||1)-1]}</div>
                      <div style={{ fontFamily:ANTON,fontSize:13,color:A.gold }}>{r.ratings[cat.key]}/5</div>
                    </div>
                  ):null)}
                </div>
                {r.textAnswers&&Object.entries(r.textAnswers).filter(([,v])=>v).map(([k,v])=>{
                  const cat=(sc.categories||[]).find(c=>c.key===k);
                  return cat?(<div key={k} style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:6,fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}><span style={{ color:A.muted }}>{cat.icon} {cat.label}: </span>{v}</div>):null;
                })}
                {r.mejor&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:6,fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}>👍 {r.mejor}</div>}
                {r.mejora&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}>💡 {r.mejora}</div>}
              </div>
            ))}
          </div>}
        </div>}
      </div>
    );
  };

  // ─── ATRIP RETURN ───
  return (
    <div style={{ background:A.bg,minHeight:"100vh",color:A.text,paddingBottom:24,fontFamily:BF }}>
      <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10 }}>
        <span style={{ fontSize:26,flexShrink:0 }}>{trip.flag}</span>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:ANTON,fontSize:16,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:1,textTransform:"uppercase" }}>{trip.name}</div>
          <div style={{ fontSize:10,color:A.cyan,letterSpacing:2,fontFamily:BF }}>{fmt(trip.date)}{trip.price?` · ${trip.price.toLocaleString("es")}${getCurrencySymbol(trip.currency||"EUR")}`:""} · {tc.length} viajeros</div>
        </div>
        <button onClick={()=>go("ahome")} style={{ background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0 }}>←</button>
      </div>
      <div style={{ minHeight:"calc(100vh - 160px)" }}>
        {tab==="menu" && (
          <div style={{ padding:"16px" }}>
            {CRM_TABS.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} style={{ width:"100%",background:A.card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:16,cursor:"pointer",textAlign:"left" }}>
                <div style={{ width:48,height:48,borderRadius:14,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:A.cyan,flexShrink:0 }}>{t.icon}</div>
                <div style={{ flex:1,fontFamily:ANTON,fontSize:18,color:A.text,letterSpacing:1,textTransform:"uppercase" }}>{t.label}</div>
                <div style={{ color:A.muted,fontSize:24 }}>›</div>
              </button>
            ))}
          </div>
        )}
        {tab==="people" && <PeopleTab />}
        {tab==="pagos" && <PagosTab />}
        {tab==="finanzas" && <FinanzasTab />}
        {tab==="ai" && <AIDocsTab />}
        {tab==="notes" && <div style={{ padding:"0 16px" }}>
          <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12,marginTop:12 }}>← Volver al menú</button>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={()=>sCrm({...crm,[tid]:{...(crm[tid]||{}),notes}})} placeholder="Escribe tus anotaciones..." style={{ ...ais,minHeight:280,resize:"vertical",lineHeight:1.7 }} />
          <div style={{ fontSize:10,color:A.muted,marginTop:6,textAlign:"right",fontFamily:BF }}>Se guarda al salir del campo</div>
        </div>}
        {tab==="edit" && <EditTab />}
      </div>
      {registroPagoModal && <RegistroPagoModal trips={trips} clients={clients} tid={tid} sC={sC} onClose={()=>setRegistroPagoModal(false)} />}
    </div>
  );
}

// ============================================================
// CLIENT SIDE COMPONENTS
// ============================================================

function AcompModal({ clientId, clients, updClient, trip, onClose }) {
  const cl = clients.find(c => c.id === clientId);
  const [nombre, setNombre] = useState("");
  const refs = useRef({});
  const acomps = cl?.acompanantes || [];
  const add = () => { if (!nombre.trim()) return; const pagosEstado = (trip?.pagosConfig || []).map(() => "pendiente"); updClient(clientId, c => ({ ...c, acompanantes: [...(c.acompanantes || []), { id: uid(), nombre: nombre.trim(), passportPhoto: null, passportConsent: false, photoConsent: false, pagosEstado, personalDocs: [] }] })); setNombre(""); };
  const del = id => updClient(clientId, c => ({ ...c, acompanantes: (c.acompanantes || []).filter(a => a.id !== id) }));
  const uploadPhoto = (acId, file) => { const r = new FileReader(); r.onload = e => updClient(clientId, c => ({ ...c, acompanantes: (c.acompanantes || []).map(a => a.id === acId ? { ...a, passportPhoto: e.target.result } : a) })); r.readAsDataURL(file); };
  return (
    <AModal title="Acompañantes" onClose={onClose}>
      <div style={{ fontSize: 13, color: A.muted, fontFamily: BF, marginBottom: 14 }}>Personas en la misma reserva que <strong style={{ color: A.text }}>{cl?.nombre}</strong>.</div>
      {acomps.length === 0 && <div style={{ textAlign: "center", padding: "16px 0", color: A.muted, fontSize: 13, fontFamily: BF }}>Sin acompañantes</div>}
      {acomps.map(ac => (
        <div key={ac.id} onClick={() => refs.current[ac.id]?.click()} style={{ background: A.bg, borderRadius: 12, padding: "10px 12px", marginBottom: 8, border: `1px solid ${ac.passportPhoto ? A.green + "44" : A.border}`, display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: `2px solid ${ac.passportPhoto ? A.green : A.border}`, flexShrink: 0, background: A.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {ac.passportPhoto ? <img src={ac.passportPhoto} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 18, color: A.muted }}>👤</span>}
          </div>
          <input ref={el => { if (el) refs.current[ac.id] = el; }} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onClick={e => e.stopPropagation()} onChange={e => { if (e.target.files[0]) uploadPhoto(ac.id, e.target.files[0]); }} />
          <div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 15, fontWeight: 700, color: A.text }}>{ac.nombre}</div><div style={{ fontSize: 10, color: ac.passportPhoto ? A.green : A.muted, fontFamily: BF }}>{ac.passportPhoto ? "Pasaporte subido" : "Toca para subir pasaporte"}</div></div>
          <button onClick={e => { e.stopPropagation(); del(ac.id); }} style={{ background: "transparent", border: "none", color: A.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={nombre} onChange={e => setNombre(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Nombre del acompañante" style={{ ...ais, flex: 1 }} />
        <button onClick={add} style={{ ...ab(A.cyan, A.bg), padding: "11px 18px", flexShrink: 0, borderRadius: 8 }}>+</button>
      </div>
    </AModal>
  );
}

function PrivacidadModal({ onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:10001,display:"flex",alignItems:"flex-end" }}>
      <div style={{ background:A.card2,borderRadius:"20px 20px 0 0",padding:"24px",width:"100%",maxHeight:"85vh",overflowY:"auto",borderTop:`1px solid ${A.border}`,boxSizing:"border-box" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1 }}>POLÍTICA DE PRIVACIDAD</div>
          <button onClick={onClose} style={{ background:"transparent",border:"none",color:A.muted,fontSize:24,cursor:"pointer" }}>✕</button>
        </div>
        {[
          ["Responsable del tratamiento","TRAVELIKE SL, CIF B02628766, Calle Ana Karenina 6, 02005 Albacete. Contacto: lauralietor@hotmail.com"],
          ["¿Qué datos recogemos?","Nombre, email, foto de pasaporte, fecha de caducidad del documento, estado de pagos y notas del viaje."],
          ["¿Para qué los usamos?","Gestionar tu reserva y el viaje contratado, tramitar documentación ante aerolíneas y hoteles, y comunicarnos contigo sobre pagos y novedades. La foto de pasaporte se usa exclusivamente para trámites del viaje."],
          ["Fotografías de pasaporte","Conservamos tu foto de pasaporte mientras tengas una relación activa con Travelike (viajes activos, reservas pendientes o historial reciente), y hasta 4 años después de tu último viaje con nosotros, por posibles reclamaciones o incidencias. En cualquier momento puedes pedir su borrado anticipado escribiéndonos a lauralietor@hotmail.com y lo eliminaremos en un plazo máximo de 30 días."],
          ["¿Con quién los compartimos?","Con aerolíneas, hoteles y seguros necesarios para tu viaje. Los datos se almacenan en Supabase (servidores en la Unión Europea). No se venden ni ceden con fines comerciales."],
          ["Tus derechos","Tienes derecho a acceder, rectificar, suprimir, oponerte y limitar el tratamiento de tus datos. Para ejercerlos, escribe a lauralietor@hotmail.com indicando 'Ejercicio de derechos RGPD'. También puedes reclamar ante la AEPD (www.aepd.es)."],
          ["Fotos en redes sociales","Solo publicaremos fotos tuyas en nuestras redes si has dado tu consentimiento expreso. Puedes retirarlo en cualquier momento escribiéndonos."],
        ].map(([titulo, texto]) => (
          <div key={titulo} style={{ marginBottom:16, background:A.bg, borderRadius:12, padding:"12px 14px", border:`1px solid ${A.border}` }}>
            <div style={{ fontFamily:BF,fontSize:12,fontWeight:700,color:A.cyan,letterSpacing:1,textTransform:"uppercase",marginBottom:6 }}>{titulo}</div>
            <div style={{ fontFamily:BF,fontSize:13,color:A.muted,lineHeight:1.7 }}>{texto}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ width:"100%",padding:"16px",border:"none",borderRadius:12,fontFamily:ANTON,fontSize:15,letterSpacing:2,cursor:"pointer",background:A.cyan,color:A.bg,textTransform:"uppercase",marginTop:8 }}>ENTENDIDO</button>
      </div>
    </div>
  );
}

function Passport({ go, cid, clients, setClients, trips, sC, logout }) {
  const cl = clients.find(c => c.id === cid);
  const [photos, setPhotos] = useState(cl?.passportPhotos || (cl?.passportPhoto ? [cl.passportPhoto] : []));
  const [c0, setC0] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [showPriv, setShowPriv] = useState(false);
  const ref = useRef();

  if (!cl) return null;

  const onFile = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          setPhotos(prev => [...prev, canvas.toDataURL("image/jpeg", 0.78)]);
        };
        img.onerror = () => setPhotos(prev => [...prev, ev.target.result]);
        img.src = ev.target.result;
      };
      r.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const removePhoto = idx => setPhotos(prev => prev.filter((_, i) => i !== idx));
  const canSubmit = c0 && c1;

  const submit = async () => {
    if (!canSubmit) return;
    const updated = clients.map(x => x.id === cid
      ? { ...x, passportPhoto: photos[0] || null, passportPhotos: photos, rgpdConsent: true, passportConsent: c1, photoConsent: c2, firstLogin: false, passportExpiryDismissed: false, consentDate: new Date().toISOString(), consentRGPD: c0, consentPasaporte: c1, consentFoto: c2 }
      : x
    );
    setClients(updated);
    go("notifprompt", { cid });
    db.set(SK_C, updated);
  };

  return (
    <div style={{ fontFamily: BF, background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text }}>
      <div style={{ background: "linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#07070f 100%)", padding: "40px 24px 32px", borderBottom: `1px solid ${A.border}`, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
        <div style={{ fontFamily: ANTON, fontSize: 32, color: "#fff", lineHeight: 1, marginBottom: 8, letterSpacing: 1 }}>BIENVENIDO/A</div>
        <div style={{ fontFamily: ANTON, fontSize: 22, color: A.cyan, letterSpacing: 2 }}>{cl.nombre.split(" ")[0].toUpperCase()}</div>
        <div style={{ fontSize: 14, color: A.muted, fontFamily: BF, marginTop: 10 }}>Tu aventura empieza aquí. Solo necesitamos un par de datos.</div>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ background: A.card, borderRadius: 14, padding: 20, border: `1px solid ${A.border}`, marginBottom: 16 }}>
          <div style={{ fontFamily: ANTON, fontSize: 18, color: "#fff", marginBottom: 4, letterSpacing: 1 }}>📷 FOTO DEL PASAPORTE</div>
          <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, marginBottom: 14 }}>Puedes subir varias fotos (anverso, reverso…)</div>
          {photos.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: "relative", width: 90, height: 90, borderRadius: 12, overflow: "hidden", border: `2px solid ${A.cyan}44`, flexShrink: 0 }}>
                  <img src={p} onClick={() => setLightbox(p)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} alt="" />
                  <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: 3, right: 3, width: 22, height: 22, borderRadius: "50%", background: A.red, border: "none", color: "#fff", fontSize: 12, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}
              <div onClick={() => ref.current.click()} style={{ width: 90, height: 90, borderRadius: 12, border: `2px dashed ${A.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, background: A.card2 }}>
                <span style={{ fontSize: 24, color: A.muted }}>+</span>
                <span style={{ fontFamily: BF, fontSize: 9, color: A.muted, textTransform: "uppercase", letterSpacing: 1 }}>Añadir</span>
              </div>
            </div>
          )}
          {photos.length === 0 && (
            <div onClick={() => ref.current.click()} style={{ background: A.card2, border: `2px dashed ${A.border}`, borderRadius: 12, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div style={{ fontFamily: ANTON, fontSize: 15, color: A.cyan, letterSpacing: 1 }}>TOCA PARA FOTOGRAFIAR</div>
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, marginTop: 4 }}>Cámara o galería</div>
            </div>
          )}
          <input ref={ref} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onFile} />
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, cursor: "pointer", padding: "14px", background: c0 ? A.cyan + "12" : A.card2, borderRadius: 14, border: `2px solid ${c0 ? A.cyan : A.border}` }}>
            <input type="checkbox" checked={c0} onChange={e => setC0(e.target.checked)} style={{ marginTop: 2, width: 22, height: 22, flexShrink: 0, accentColor: A.cyan }} />
            <div>
              <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: c0 ? A.cyan : A.text, marginBottom: 3 }}>📋 Tratamiento de datos personales <span style={{ color: A.red }}>*</span></div>
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, lineHeight: 1.6 }}>He leído y acepto el tratamiento de mis datos personales por Travelike SL para la gestión de mi viaje, conforme al RGPD. {" "}<span onClick={e => { e.preventDefault(); setShowPriv(true); }} style={{ color: A.cyan, textDecoration: "underline", cursor: "pointer" }}>Leer política de privacidad →</span></div>
            </div>
          </label>
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12, cursor: "pointer", padding: "14px", background: c1 ? A.green + "15" : A.card2, borderRadius: 14, border: `2px solid ${c1 ? A.green : A.border}` }}>
            <input type="checkbox" checked={c1} onChange={e => setC1(e.target.checked)} style={{ marginTop: 2, width: 22, height: 22, flexShrink: 0, accentColor: A.green }} />
            <div>
              <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: c1 ? A.green : A.text, marginBottom: 3 }}>🔒 Uso de foto de pasaporte <span style={{ color: A.red }}>*</span></div>
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, lineHeight: 1.6 }}>Autorizo a Travelike a utilizar mi foto de pasaporte exclusivamente para los trámites del viaje. Mis datos están seguros.</div>
            </div>
          </label>
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20, cursor: "pointer", padding: "14px", background: c2 ? A.purple + "15" : A.card2, borderRadius: 14, border: `2px solid ${c2 ? A.purple : A.border}` }}>
            <input type="checkbox" checked={c2} onChange={e => setC2(e.target.checked)} style={{ marginTop: 2, width: 22, height: 22, flexShrink: 0, accentColor: A.purple }} />
            <div>
              <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: c2 ? A.purple : A.text, marginBottom: 3 }}>📸 Fotos del viaje en redes <span style={{ color: A.muted, fontSize: 11, fontWeight: 400 }}>(opcional)</span></div>
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, lineHeight: 1.6 }}>Para nosotros es muy especial poder compartir los momentos del viaje contigo. Si quieres, usaremos tus fotos en nuestras redes — siempre con cariño y buen gusto. 🙌</div>
            </div>
          </label>
          <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, marginBottom: 16, textAlign: "center" }}><span style={{ color: A.red }}>*</span> Campos obligatorios. Puedes ejercer tus derechos RGPD escribiendo a <span style={{ color: A.cyan }}>lauralietor@hotmail.com</span></div>
          <button onClick={submit} disabled={!canSubmit} style={{ width: "100%", padding: "18px", border: "none", borderRadius: 14, fontFamily: ANTON, fontSize: 16, letterSpacing: 3, cursor: canSubmit ? "pointer" : "default", background: canSubmit ? `linear-gradient(90deg,${A.cyan},#0099bb)` : A.card2, color: canSubmit ? A.bg : A.muted, textTransform: "uppercase" }}>CONTINUAR →</button>
          {logout && <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={logout} style={{ background: "none", border: "none", color: A.muted, fontSize: 13, cursor: "pointer", fontFamily: BF }}>Cerrar sesión</button></div>}
        </div>
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {showPriv && <PrivacidadModal onClose={() => setShowPriv(false)} />}
    </div>
  );
}

function NotifPrompt({ go, cid, clients, sC, logout }) {
  const [loading, setLoading] = useState(false);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isPWA = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;

  const enable = async () => {
    setLoading(true);
    const cl = clients.find(c => c.id === cid);
    if (cl) {
      try {
        const OneSignal = window.OneSignal;
        if (OneSignal) {
          const granted = await OneSignal.Notifications.requestPermission();
          if (granted) {
            await OneSignal.login(cl.code);
            if (cl.tripId) await OneSignal.User.addTag("tripId", cl.tripId);
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      } catch (e) { console.warn("[OneSignal] Error:", e); }
    }
    await sC(clients.map(x => x.id === cid ? { ...x, notifEnabled: true } : x));
    setLoading(false);
    go("client", { cid });
  };

  const skip = () => go("client", { cid });

  if (isIOS && !isPWA) {
    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: BF, color: A.text }}>
        <div style={{ background: "linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#07070f 100%)", padding: "40px 24px 32px", textAlign: "center", borderBottom: `1px solid ${A.border}` }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>📲</div>
          <div style={{ fontFamily: ANTON, fontSize: 30, color: "#fff", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase", lineHeight: 1.1 }}>AÑADE LA APP<br /><span style={{ color: A.cyan }}>A TU INICIO</span></div>
          <div style={{ fontSize: 15, color: A.muted, lineHeight: 1.7 }}>Para recibir notificaciones en iPhone, primero instala la app en tu pantalla de inicio.</div>
        </div>
        <div style={{ flex: 1, padding: "24px 20px" }}>
          {[
            { num: "1", icon: "⬆️", title: "Toca el botón Compartir", desc: "El icono del cuadrado con flecha que hay en la barra inferior de Safari." },
            { num: "2", icon: "📌", title: "\"Añadir a pantalla de inicio\"", desc: "Desplázate hacia abajo en el menú y pulsa esa opción." },
            { num: "3", icon: "✅", title: "Pulsa \"Añadir\"", desc: "Confirma en la esquina superior derecha y la app quedará instalada." },
            { num: "4", icon: "🚀", title: "Ábrela desde tu inicio", desc: "Cierra Safari y abre la app desde tu pantalla de inicio para activar las notificaciones." }
          ].map(step => (
            <div key={step.num} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: A.cyan + "22", border: `2px solid ${A.cyan}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 18, color: A.cyan, flexShrink: 0 }}>{step.num}</div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacing: 0.5, marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontFamily: BF, fontSize: 13, color: A.muted, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
          <button onClick={skip} style={{ width: "100%", padding: "18px", border: `1.5px solid ${A.border}`, borderRadius: 12, fontFamily: ANTON, fontSize: 15, letterSpacing: 2, cursor: "pointer", background: A.card, color: A.muted, textTransform: "uppercase", marginBottom: 12 }}>Ahora no, entrar sin notificaciones</button>
          {logout && <button onClick={logout} style={{ background: "none", border: "none", color: A.muted + "88", fontSize: 12, cursor: "pointer", fontFamily: BF, width: "100%", padding: "10px" }}>Cerrar sesión</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", fontFamily: BF, color: A.text, textAlign: "center" }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🔔</div>
      <div style={{ fontFamily: ANTON, fontSize: 32, color: "#fff", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Notificaciones</div>
      <div style={{ fontSize: 17, color: A.muted, lineHeight: 1.7, marginBottom: 36 }}>Activa las notificaciones para recibir avisos sobre tus pagos, vuelos y documentación.</div>
      <button onClick={enable} disabled={loading} style={{ width: "100%", padding: "18px", border: "none", borderRadius: 12, fontFamily: ANTON, fontSize: 16, letterSpacing: 3, cursor: loading ? "default" : "pointer", background: loading ? A.card2 : `linear-gradient(90deg,${A.cyan},#0099bb)`, color: loading ? A.muted : A.bg, textTransform: "uppercase", marginBottom: 14 }}>{loading ? "ACTIVANDO..." : "ACTIVAR"}</button>
      <button onClick={skip} style={{ background: "none", border: "none", color: A.muted, fontSize: 15, cursor: "pointer", fontFamily: BF, padding: "12px" }}>Ahora no</button>
      {logout && <button onClick={logout} style={{ background: "none", border: "none", color: A.muted + "99", fontSize: 12, cursor: "pointer", fontFamily: BF, marginTop: 8 }}>Cerrar sesión</button>}
    </div>
  );
}

function Client({ go, cid, clients, trips, logout, sC, sT }) {
  const cl = clients.find(c => c.id === cid);
  const trip = cl?.tripId ? trips.find(t => t.id === cl.tripId) : null;
  const [view, setView] = useState("home");
  const [maletaNewItem, setMaletaNewItem] = useState("");

  if (!cl) return <div style={{ padding: 40, fontFamily: BF, color: A.muted }}>Error</div>;
  if (trip?.surveyEnabled) {
    if (cl.surveySubmitted) return <PostSurveyScreen cl={cl} trip={trip} logout={logout} />;
    return <SurveyScreen cl={cl} trip={trip} clients={clients} sC={sC} trips={trips} sT={sT} logout={logout} />;
  }
  if (!trip) return <NoTrips cl={cl} logout={logout} />;

  const pc = trip.pagosConfig || [];
  const pe = cl.pagosEstado || pc.map(() => "pendiente");
  const pagosPendientes = pe.filter(s => s !== "pagado").length;
  const vuelosCount = (trip.vuelos || []).length + (cl.personalDocs || []).filter(d => d.tipo === "vuelo").length;
  const docsCount = (trip.docs || []).length + (cl.personalDocs || []).filter(d => d.tipo !== "vuelo").length;
  const infoCount = (trip.info || []).length + (trip.hotels || []).length;

  const SubHeader = ({ title, color }) => (
    <div style={{ background: A.card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${A.border}`, position: "sticky", top: 0, zIndex: 10 }}>
      <button onClick={() => setView("home")} style={{ background: A.card2, border: `1px solid ${A.border}`, color: A.text, borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      <div style={{ fontFamily: ANTON, fontSize: 20, color: color || A.text, letterSpacing: 1, textTransform: "uppercase", flex: 1 }}>{title}</div>
      <span style={{ fontSize: 28 }}>{trip.flag}</span>
    </div>
  );

  const BigBack = () => (
    <div style={{ padding: "24px 16px 40px" }}>
      <button onClick={() => setView("home")} style={{ width: "100%", padding: "18px", border: `1.5px solid ${A.border}`, borderRadius: 16, fontFamily: ANTON, fontSize: 18, letterSpacing: 2, cursor: "pointer", background: A.card, color: A.muted, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>←</span> VOLVER
      </button>
    </div>
  );

  if (view === "home") {
    const tripDate = parseISO(trip.date + "-01");
    const daysToTrip = tripDate ? Math.ceil((tripDate - NOW) / 864e5) : null;
    const pagadosN = pe.filter(s => s === "pagado").length;
    const pagPct = pc.length > 0 ? Math.round(pagadosN / pc.length * 100) : 100;

    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", fontFamily: BF, color: A.text, paddingBottom: 32 }}>
        <div style={{ background: "linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)", padding: "28px 20px 24px", borderBottom: `1px solid ${A.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 36 }}>{trip.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: ANTON, fontSize: 20, color: "#fff", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.1 }}>{trip.name}</div>
              <div style={{ fontSize: 12, color: A.cyan, fontFamily: BF, letterSpacing: 2, marginTop: 2 }}>{trip.fechas}</div>
            </div>
            {daysToTrip !== null && daysToTrip > 0 && <div style={{ background: A.gold + "22", border: `1px solid ${A.gold}44`, borderRadius: 12, padding: "6px 12px", textAlign: "center", flexShrink: 0 }}><div style={{ fontFamily: ANTON, fontSize: 22, color: A.gold, lineHeight: 1 }}>{daysToTrip}</div><div style={{ fontFamily: BF, fontSize: 9, color: A.gold }}>DÍAS</div></div>}
          </div>
          {pc.length > 0 && <div style={{ background: A.card2, borderRadius: 10, padding: "8px 12px", border: `1px solid ${A.border}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><div style={{ fontFamily: BF, fontSize: 10, color: A.muted }}>PAGOS</div><div style={{ fontFamily: BF, fontSize: 10, color: pagPct === 100 ? A.green : A.gold }}>{pagadosN}/{pc.length} completados</div></div><div style={{ height: 5, background: A.border, borderRadius: 3 }}><div style={{ height: "100%", width: `${pagPct}%`, background: pagPct === 100 ? A.green : `linear-gradient(90deg,${A.gold},${A.orange})`, borderRadius: 3 }} /></div></div>}
        </div>
        <div style={{ padding: "20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { emoji: "✈️", label: "Vuelos", sublabel: "Billetes y embarque", color: A.cyan, badge: vuelosCount, v: "vuelos" },
            { emoji: "📄", label: "Documentos", sublabel: "Visados y seguros", color: A.gold, badge: docsCount, v: "docs" },
            { emoji: "💳", label: "Pagos", sublabel: pagosPendientes > 0 ? `${pagosPendientes} pendiente${pagosPendientes > 1 ? "s" : ""}` : "Todo pagado", color: pagosPendientes > 0 ? A.orange : A.green, badge: pagosPendientes > 0 ? pagosPendientes : null, v: "pagos" },
            { emoji: "ℹ️", label: "Información", sublabel: "Hoteles y consejos", color: A.purple, badge: infoCount, v: "info" },
            { emoji: "🎒", label: "Mi maleta", sublabel: "Lista de equipaje", color: A.cyan, badge: null, v: "maleta", wide: true }
          ].map(item => (
            <div key={item.v} onClick={() => setView(item.v)} style={{ background: A.card, borderRadius: 20, padding: "20px 16px", border: `1.5px solid ${item.color}33`, cursor: "pointer", display: "flex", flexDirection: item.wide ? "row" : "column", alignItems: item.wide ? "center" : "flex-start", gap: item.wide ? 14 : 10, position: "relative", overflow: "hidden", ...(item.wide ? { gridColumn: "1 / -1" } : {}) }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 90, height: 90, borderRadius: "50%", background: item.color + "10", pointerEvents: "none" }} />
              {item.badge != null && item.badge > 0 && <div style={{ position: "absolute", top: 12, right: 12, background: item.color, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 12, color: "#fff", zIndex: 2 }}>{item.badge}</div>}
              <div style={{ fontSize: item.wide ? 40 : 44, lineHeight: 1, flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: item.wide ? 1 : undefined }}>
                <div style={{ fontFamily: ANTON, fontSize: item.wide ? 18 : 20, color: item.color, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontFamily: BF, fontSize: 12, color: A.muted }}>{item.sublabel}</div>
              </div>
              {item.wide && <div style={{ color: item.color, fontSize: 20, flexShrink: 0 }}>›</div>}
            </div>
          ))}
          {trip.webUrl ? <a href={trip.webUrl} target="_blank" rel="noreferrer" style={{ gridColumn: "1 / -1", background: A.card, borderRadius: 18, padding: "14px 18px", border: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}><span style={{ fontSize: 28 }}>🌐</span><div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 13, color: A.muted }}>Web del viaje</div></div><div style={{ color: A.cyan, fontSize: 18 }}>›</div></a> : <div style={{ gridColumn: "1 / -1", background: A.card, borderRadius: 18, padding: "14px 18px", border: `1px solid ${A.border}44`, display: "flex", alignItems: "center", gap: 12, opacity: 0.5 }}><span style={{ fontSize: 28 }}>🌐</span><div style={{ fontFamily: BF, fontSize: 13, color: A.muted }}>Web del viaje — próximamente</div></div>}
        </div>
        <div style={{ textAlign: "center", paddingTop: 4 }}>
          <button onClick={logout} style={{ background: "none", border: "none", color: A.muted, fontSize: 13, cursor: "pointer", fontFamily: BF }}>Cerrar sesión</button>
          <span style={{ color: A.border, margin: "0 10px" }}>·</span>
          <button onClick={() => { if (window.confirm("¿Quieres solicitar el borrado de tus datos?\n\nEscribe a: lauralietor@hotmail.com")) { window.open(`mailto:lauralietor@hotmail.com?subject=Solicitud%20de%20borrado%20de%20datos%20RGPD&body=Hola,%0A%0ASoy%20${encodeURIComponent(cl.nombre)}%20y%20solicito%20el%20borrado%20de%20mis%20datos%20personales%20conforme%20al%20art%C3%ADculo%2017%20del%20RGPD.%0A%0AGracias.`, "_blank"); } }} style={{ background: "none", border: "none", color: A.muted, fontSize: 11, cursor: "pointer", fontFamily: BF, textDecoration: "underline" }}>🗑️ Borrar mis datos</button>
        </div>
      </div>
    );
  }

  if (view === "maleta") {
    const mImpresc = trip.maletaImprescindibles || DEFAULT_IMPRESCINDIBLES;
    const mCats = trip.maletaCats || DEFAULT_MALETA_CATS;
    const marcados = cl.maletaMarcados || [];
    const personal = cl.maletaPersonal || [];

    const toggle = key => {
      const nm = marcados.includes(key) ? marcados.filter(k => k !== key) : [...marcados, key];
      sC(clients.map(x => x.id === cid ? { ...x, maletaMarcados: nm } : x));
    };
    // ✅ FIX: limpiar input ANTES de sC para evitar salto de scroll
    const addPersonal = () => {
      if (!maletaNewItem.trim()) return;
      const texto = maletaNewItem.trim();
      setMaletaNewItem("");
      sC(clients.map(x => x.id === cid ? { ...x, maletaPersonal: [...(x.maletaPersonal || []), { id: uid(), texto }] } : x));
    };
    const delPersonal = id => sC(clients.map(x => x.id === cid ? { ...x, maletaPersonal: (x.maletaPersonal || []).filter(p => p.id !== id) } : x));

    const totalItems = mImpresc.length + mCats.reduce((s, c) => s + c.items.length, 0) + personal.length;
    const checkedCount = marcados.length;

    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text, paddingBottom: 40, fontFamily: BF }}>
        <SubHeader title="Mi maleta 🎒" color={A.cyan} />
        <div style={{ padding: "14px 16px" }}>
          <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: `1px solid ${A.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: ANTON, fontSize: 16, color: A.text }}>EMPACADO</div>
              <div style={{ fontFamily: ANTON, fontSize: 16, color: checkedCount === totalItems && totalItems > 0 ? A.green : A.cyan }}>{checkedCount}/{totalItems}</div>
            </div>
            <div style={{ height: 8, background: A.border, borderRadius: 4 }}><div style={{ height: "100%", width: `${totalItems > 0 ? Math.round(checkedCount / totalItems * 100) : 0}%`, background: checkedCount === totalItems && totalItems > 0 ? A.green : `linear-gradient(90deg,${A.cyan},${A.purple})`, borderRadius: 4 }} /></div>
            {checkedCount === totalItems && totalItems > 0 && <div style={{ fontFamily: BF, fontSize: 13, color: A.green, marginTop: 8, textAlign: "center", fontWeight: 700 }}>¡Todo listo para el viaje!</div>}
          </div>
          <div style={{ background: `linear-gradient(135deg,${A.red}18 0%,${A.orange}10 100%)`, borderRadius: 16, padding: "14px", marginBottom: 14, border: `2px solid ${A.red}33` }}>
            <div style={{ fontFamily: ANTON, fontSize: 15, color: A.red, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>IMPRESCINDIBLES</div>
            {mImpresc.map((item, i) => { const key = `imp_${i}`; const checked = marcados.includes(key); return (<div key={key} onClick={() => toggle(key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: checked ? A.green + "15" : A.bg, borderRadius: 10, marginBottom: 6, border: `1.5px solid ${checked ? A.green + "44" : A.border}`, cursor: "pointer" }}><div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked ? A.green : A.border}`, background: checked ? A.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}</div><span style={{ fontFamily: BF, fontSize: 14, color: checked ? A.muted : A.text, textDecoration: checked ? "line-through" : "none", flex: 1 }}>{item}</span></div>); })}
          </div>
          {mCats.map((cat, ci) => { const catChecked = cat.items.filter((_, ii) => marcados.includes(`cat_${ci}_${ii}`)).length; return (<div key={cat.id} style={{ background: A.card, borderRadius: 16, padding: "14px", marginBottom: 10, border: `1px solid ${A.border}` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>{cat.icon}</span><div style={{ fontFamily: ANTON, fontSize: 14, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>{cat.label}</div></div><div style={{ fontFamily: BF, fontSize: 11, color: catChecked === cat.items.length && cat.items.length > 0 ? A.green : A.muted }}>{catChecked}/{cat.items.length}</div></div>{cat.items.map((item, ii) => { const key = `cat_${ci}_${ii}`; const checked = marcados.includes(key); return (<div key={key} onClick={() => toggle(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: checked ? A.green + "10" : A.bg, borderRadius: 8, marginBottom: 4, border: `1px solid ${checked ? A.green + "33" : A.border + "44"}`, cursor: "pointer" }}><div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? A.green : A.border}`, background: checked ? A.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}</div><span style={{ fontFamily: BF, fontSize: 13, color: checked ? A.muted : A.text, textDecoration: checked ? "line-through" : "none", flex: 1 }}>{item}</span></div>); })}</div>); })}
          <div style={{ background: A.card, borderRadius: 16, padding: "14px", marginBottom: 14, border: `1px solid ${A.purple}33` }}>
            <div style={{ fontFamily: ANTON, fontSize: 15, color: A.purple, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>MIS AÑADIDOS</div>
            {personal.length === 0 && <div style={{ fontFamily: BF, fontSize: 13, color: A.muted, textAlign: "center", padding: "8px 0 12px" }}>Añade tus propios artículos</div>}
            {personal.map(p => { const key = `per_${p.id}`; const checked = marcados.includes(key); return (<div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: checked ? A.purple + "10" : A.bg, borderRadius: 8, marginBottom: 4, border: `1px solid ${checked ? A.purple + "33" : A.border + "44"}` }}><div onClick={() => toggle(key)} style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? A.purple : A.border}`, background: checked ? A.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}</div><span onClick={() => toggle(key)} style={{ fontFamily: BF, fontSize: 13, color: checked ? A.muted : A.text, textDecoration: checked ? "line-through" : "none", flex: 1, cursor: "pointer" }}>{p.texto}</span><button onClick={() => delPersonal(p.id)} style={{ background: "transparent", border: "none", color: A.muted, fontSize: 16, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>✕</button></div>); })}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={maletaNewItem} onChange={e => setMaletaNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addPersonal()} placeholder="Añadir artículo..." style={{ ...ais, flex: 1 }} />
              <button onClick={addPersonal} style={{ ...ab(A.purple + "22", A.purple), padding: "10px 14px", border: `1px solid ${A.purple}44`, flexShrink: 0, borderRadius: 8, fontFamily: BF }}>+</button>
            </div>
          </div>
        </div>
        <BigBack />
      </div>
    );
  }

  if (view === "vuelos") {
    const vuelos = trip.vuelos || [];
    const myDocs = (cl.personalDocs || []).filter(d => d.tipo === "vuelo");
    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text, paddingBottom: 32, fontFamily: BF }}>
        <SubHeader title="Mis vuelos" color={A.cyan} />
        <div style={{ padding: "16px" }}>
          {vuelos.length === 0 && myDocs.length === 0 && <AEmpty text="Tus billetes aparecerán aquí pronto" />}
          {[...vuelos, ...myDocs].map((v, i) => (
            <div key={i} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 18, padding: "20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: A.cyan + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>✈️</div>
                <div>
                  <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacing: 1, lineHeight: 1.2, marginBottom: 4 }}>{v.nombre}</div>
                  <div style={{ fontFamily: BF, fontSize: 13, color: A.muted }}>{v.descripcion || v.archivo}</div>
                </div>
              </div>
              {/* ✅ Botón descarga real si tiene base64 */}
              {v.data ? (
                <a href={`data:${v.mimeType||"application/pdf"};base64,${v.data}`} download={v.nombre}
                  style={{ display: "block", width: "100%", padding: "14px", border: "none", borderRadius: 10, fontFamily: ANTON, fontSize: 14, letterSpacing: 3, cursor: "pointer", background: `linear-gradient(90deg,${A.red},#c00020)`, color: "#fff", textTransform: "uppercase", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}>
                  DESCARGAR
                </a>
              ) : (
                <div style={{ width: "100%", padding: "14px", borderRadius: 10, fontFamily: ANTON, fontSize: 13, background: A.card2, color: A.muted, textAlign: "center" }}>
                  Pendiente de asignación
                </div>
              )}
            </div>
          ))}
          <BigBack />
        </div>
      </div>
    );
  }

  if (view === "docs") {
    const docs = trip.docs || [];
    const myDocs = (cl.personalDocs || []).filter(d => d.tipo !== "vuelo");
    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text, paddingBottom: 32, fontFamily: BF }}>
        <SubHeader title="Documentos" color={A.gold} />
        <div style={{ padding: "16px" }}>
          {docs.length === 0 && myDocs.length === 0 && <AEmpty text="Tus documentos aparecerán aquí pronto" />}
          {[...docs, ...myDocs].map((d, i) => (
            <div key={i} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 18, padding: "20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: A.gold + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>
                <div>
                  <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacing: 1, lineHeight: 1.2, marginBottom: 4 }}>{d.nombre}</div>
                  <div style={{ fontFamily: BF, fontSize: 13, color: A.muted }}>{d.descripcion || d.archivo}</div>
                </div>
              </div>
              {/* ✅ Botón descarga real si tiene base64 */}
              {d.data ? (
                <a href={`data:${d.mimeType||"application/pdf"};base64,${d.data}`} download={d.nombre}
                  style={{ display: "block", width: "100%", padding: "14px", border: "none", borderRadius: 10, fontFamily: ANTON, fontSize: 14, letterSpacing: 3, cursor: "pointer", background: `linear-gradient(90deg,${A.red},#c00020)`, color: "#fff", textTransform: "uppercase", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}>
                  DESCARGAR
                </a>
              ) : (
                <div style={{ width: "100%", padding: "14px", borderRadius: 10, fontFamily: ANTON, fontSize: 13, background: A.card2, color: A.muted, textAlign: "center" }}>
                  Pendiente de asignación
                </div>
              )}
            </div>
          ))}
          <BigBack />
        </div>
      </div>
    );
  }

  if (view === "pagos") {
    const fp = FORMAS_PAGO.find(f => f.k === (cl.formaPago || "transferencia")) || FORMAS_PAGO[0];
    const pendiente = pe.findIndex(s => s !== "pagado");
    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text, paddingBottom: 32, fontFamily: BF }}>
        <SubHeader title="Mis pagos" color={A.green} />
        <div style={{ padding: "16px" }}>
          <div style={{ background: `linear-gradient(135deg,${A.cyan}18 0%,#172030 100%)`, borderRadius: 20, padding: "20px", marginBottom: 14, border: `1px solid ${A.cyan}33` }}>
            <div style={{ fontFamily: BF, fontSize: 9, color: A.muted, letterSpacing: 4, textTransform: "uppercase", marginBottom: 10 }}>Forma de pago: {fp.icon} {fp.label}</div>
            {fp.k === "transferencia" && (<div><div style={{ fontFamily: ANTON, fontSize: 20, color: "#fff", letterSpacing: 2, marginBottom: 4 }}>{BANK_TITULAR}</div><div style={{ fontFamily: BF, fontSize: 14, color: A.muted, letterSpacing: 1, marginBottom: 12 }}>{BANK_IBAN}</div><CopyBtn text={BANK_IBAN} label="Copiar IBAN" /></div>)}
            {fp.k === "vip" && <div style={{ fontFamily: ANTON, fontSize: 18, color: A.gold, letterSpacing: 1 }}>Cliente VIP — Descuento aplicado</div>}
            {pendiente >= 0 && pc[pendiente] && (
              <div style={{ marginTop: 14, background: A.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${A.gold}44` }}>
                <div style={{ fontFamily: BF, fontSize: 10, color: A.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Próximo pago</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontFamily: ANTON, fontSize: 20, color: A.gold }}>{(cl.pagosImporteCustom || [])[pendiente] || pc[pendiente].importe || "—"}</div><div style={{ fontSize: 12, color: A.muted, fontFamily: BF }}>{pc[pendiente].label} · {pc[pendiente].fecha || "Fecha por confirmar"}</div></div>
                  <CopyBtn text={`${(cl.pagosImporteCustom || [])[pendiente] || pc[pendiente].importe || ""} - ${pc[pendiente].label} - ${trip.name}`} label="Concepto" />
                </div>
              </div>
            )}
          </div>
          {pc.map((p, i) => {
            const done = pe[i] === "pagado"; const urg = !done && isUrgent(p.fechaISO); const ovd = !done && isOverdue(p.fechaISO);
            const imp = (cl.pagosImporteCustom || [])[i] || p.importe || "—";
            return (
              <div key={i} style={{ background: A.card, borderRadius: 16, padding: "16px 18px", marginBottom: 10, border: `2px solid ${done ? A.green + "44" : ovd ? A.red + "44" : urg ? A.orange + "44" : A.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: done ? A.green + "22" : ovd ? A.red + "22" : urg ? A.orange + "22" : A.card2, border: `2px solid ${done ? A.green : ovd ? A.red : urg ? A.orange : A.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: ANTON, fontSize: 18, color: done ? A.green : ovd ? A.red : urg ? A.orange : A.muted }}>{done ? "✓" : i + 1}</span>
                </div>
                <div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 15, fontWeight: 700, color: done ? A.green : A.text }}>{p.label}</div><div style={{ fontSize: 12, color: A.muted, fontFamily: BF }}>{p.fecha || "Fecha por confirmar"}</div></div>
                <div style={{ fontFamily: ANTON, fontSize: 18, color: done ? A.green : A.gold }}>{imp}</div>
              </div>
            );
          })}
          <BigBack />
        </div>
      </div>
    );
  }

  if (view === "info") {
    const info = trip.info || [];
    const hotels = trip.hotels || [];
    const emerg = trip.emergencias || emptyEmergencias();
    const emergItems = [
      { k: "policia", l: "Policía", n: emerg.policia },
      { k: "ambulancia", l: "Ambulancia", n: emerg.ambulancia },
      { k: "bomberos", l: "Bomberos", n: emerg.bomberos },
      { k: "embajada", l: "Embajada", n: emerg.embajada }
    ].filter(e => e.n);
    return (
      <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text, paddingBottom: 32, fontFamily: BF }}>
        <SubHeader title="Información" color={A.purple} />
        <div style={{ padding: "16px" }}>
          {hotels.map(h => (
            <div key={h.id} style={{ background: A.card, borderRadius: 20, padding: "20px", marginBottom: 14, border: `2px solid ${A.gold}55` }}>
              {h.fechasEstancia && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: A.gold + "22", border: `1px solid ${A.gold}44`, borderRadius: 30, padding: "6px 14px", marginBottom: 14 }}><span style={{ fontSize: 14 }}>📅</span><span style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: A.gold }}>{h.fechasEstancia}</span></div>}
              <div style={{ fontFamily: ANTON, fontSize: 24, color: "#fff", marginBottom: 14, textTransform: "uppercase" }}>{h.nombre}</div>
              {h.direccion && <div style={{ background: A.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${A.border}`, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20, flexShrink: 0 }}>📍</span><div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 15, color: A.text, fontWeight: 700 }}>{h.direccion}</div></div><CopyBtn text={h.direccion} /></div>}
            </div>
          ))}
          {info.map((it, i) => (
            <div key={i} style={{ background: A.card, borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: `1px solid ${A.border}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{it.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BF, fontSize: 15, fontWeight: 700, color: A.text, marginBottom: 3 }}>{it.titulo}</div>
                  <div style={{ fontSize: 13, color: A.muted, lineHeight: 1.6, fontFamily: BF }}>{it.texto}</div>
                  {it.url && <a href={it.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: A.cyan, fontFamily: BF }}>Más info →</a>}
                </div>
              </div>
            </div>
          ))}
          {emergItems.length > 0 && (
            <div style={{ background: A.red + "11", borderRadius: 16, padding: "14px 16px", marginBottom: 10, border: `1px solid ${A.red}33` }}>
              <div style={{ fontFamily: BF, fontSize: 10, color: A.red, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>SOS Emergencias</div>
              {emergItems.map(e => (
                <a key={e.k} href={`tel:${e.n}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: A.bg, borderRadius: 10, marginBottom: 8, textDecoration: "none", border: `1px solid ${A.border}` }}>
                  <span style={{ fontFamily: BF, fontSize: 13, color: A.muted, flex: 1 }}>{e.l}</span>
                  <span style={{ fontFamily: ANTON, fontSize: 17, color: A.red }}>{e.n}</span>
                </a>
              ))}
            </div>
          )}
          {info.length === 0 && hotels.length === 0 && emergItems.length === 0 && <AEmpty text="La información del viaje aparecerá aquí próximamente" />}
          <BigBack />
        </div>
      </div>
    );
  }

  return null;
}

// ✅ SurveyScreen con soporte para preguntas de texto libre
function SurveyScreen({ cl, trip, clients, sC, trips, sT, logout }) {
  const sc = trip.surveyConfig || { categories: [...DEFAULT_SURVEY_CATS] };
  const cats = sc.categories || DEFAULT_SURVEY_CATS;
  const [ratings, setRatings] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [highlights, setHighlights] = useState([]);
  const [mejor, setMejor] = useState("");
  const [mejora, setMejora] = useState("");
  // canSubmit solo requiere rellenar las categorías de tipo rating
  const canSubmit = cats.filter(c => c.tipo !== "texto").every(c => ratings[c.key]);

  const toggleHL = k => setHighlights(h => h.includes(k) ? h.filter(x => x !== k) : [...h, k]);

  const submit = async () => {
    if (!canSubmit) return;
    const response = { ratings, textAnswers, highlights, mejor, mejora, date: new Date().toLocaleDateString("es-ES") };
    const updatedTrips = trips.map(t =>
      t.id === trip.id
        ? { ...t, surveyConfig: { ...t.surveyConfig, surveyResponses: [...(t.surveyConfig?.surveyResponses || []), response] } }
        : t
    );
    await Promise.all([
      sT(updatedTrips),
      sC(clients.map(x => x.id === cl.id ? { ...x, surveySubmitted: true } : x))
    ]);
  };

  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", color: A.text, paddingBottom: 40, fontFamily: BF }}>
      <div style={{ background: "linear-gradient(135deg,rgba(255,200,71,0.18) 0%,#07070f 100%)", padding: "36px 24px 28px", borderBottom: `1px solid ${A.gold}44` }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
        <div style={{ fontFamily: ANTON, fontSize: 32, color: A.gold, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Encuesta post-viaje</div>
        <div style={{ fontSize: 16, color: A.muted, lineHeight: 1.6 }}>Tu opinión sobre <strong style={{ color: "#fff" }}>{trip.name}</strong> nos ayuda a mejorar.</div>
        <div style={{ marginTop: 14, background: A.green + "18", border: `1px solid ${A.green}44`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div style={{ fontFamily: BF, fontSize: 13, color: A.green, fontWeight: 700 }}>Esta encuesta es completamente anónima.</div>
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        {cats.map(cat =>
          cat.tipo === "texto" ? (
            <div key={cat.key} style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${A.border}` }}>
              <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{cat.icon} {cat.label}</div>
              <textarea
                value={textAnswers[cat.key] || ""}
                onChange={e => setTextAnswers(r => ({ ...r, [cat.key]: e.target.value }))}
                placeholder="Escribe tu respuesta..."
                style={{ ...ais, minHeight: 80, resize: "vertical", lineHeight: 1.5 }}
              />
            </div>
          ) : (
            <RatingRow key={cat.key} label={cat.label} icon={cat.icon} value={ratings[cat.key] || 0} onChange={v => setRatings(r => ({ ...r, [cat.key]: v }))} />
          )
        )}
        <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${A.border}` }}>
          <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Lo mejor del viaje</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SURVEY_HLS.map(item => { const sel = highlights.includes(item.k); return (<button key={item.k} onClick={() => toggleHL(item.k)} style={{ padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontFamily: BF, fontSize: 13, border: `2px solid ${sel ? A.gold : A.border}`, background: sel ? A.gold + "22" : A.bg, color: sel ? A.gold : A.muted, fontWeight: sel ? 700 : 400 }}>{item.l}</button>); })}
          </div>
        </div>
        <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${A.border}` }}>
          <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>¿Qué fue lo mejor?</div>
          <textarea value={mejor} onChange={e => setMejor(e.target.value)} placeholder="Cuéntanos lo que más te gustó..." style={{ ...ais, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />
        </div>
        <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", marginBottom: 24, border: `1px solid ${A.border}` }}>
          <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>¿Qué mejorarías?</div>
          <textarea value={mejora} onChange={e => setMejora(e.target.value)} placeholder="Tu opinión nos ayuda a mejorar..." style={{ ...ais, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />
        </div>
        <button onClick={submit} disabled={!canSubmit} style={{ width: "100%", padding: "20px", border: "none", borderRadius: 14, fontFamily: ANTON, fontSize: 18, letterSpacing: 3, cursor: canSubmit ? "pointer" : "default", background: canSubmit ? `linear-gradient(90deg,${A.gold},#e6a800)` : A.card2, color: canSubmit ? A.bg : A.muted, textTransform: "uppercase" }}>
          {canSubmit ? "ENVIAR VALORACIÓN" : "Valora todas las categorías"}
        </button>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={logout} style={{ background: "none", border: "none", color: A.muted, fontSize: 13, cursor: "pointer", fontFamily: BF }}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

function PostSurveyScreen({ cl, trip, logout }) {
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", fontFamily: BF, color: A.text }}>
      <div style={{ background: "linear-gradient(135deg,#07070f 0%,#0f1f3d 50%,#1a0a00 100%)", padding: "56px 28px 48px", textAlign: "center", borderBottom: `1px solid ${A.border}` }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
        <div style={{ fontFamily: ANTON, fontSize: 42, color: "#fff", letterSpacing: 2, lineHeight: 0.9, marginBottom: 12 }}>¡HASTA LA<br /><span style={{ color: A.gold }}>PRÓXIMA!</span></div>
        <div style={{ fontFamily: BF, fontSize: 17, color: A.muted, lineHeight: 1.7, marginTop: 16 }}>Ha sido un placer viajar contigo, <strong style={{ color: "#fff" }}>{cl.nombre.split(" ")[0]}</strong>.</div>
      </div>
      <div style={{ flex: 1, padding: "36px 24px" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(255,200,71,0.12) 0%,rgba(0,240,255,0.06) 100%)", borderRadius: 24, padding: "28px 24px", border: `2px solid ${A.gold}44`, marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <div style={{ fontFamily: ANTON, fontSize: 26, color: A.gold, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase", lineHeight: 1.1 }}>¿Lista tu próxima aventura?</div>
          <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(`¡Hola! Soy ${cl.nombre} y me interesa el próximo viaje`)}`} target="_blank" rel="noreferrer"
            style={{ display: "block", width: "100%", padding: "18px", border: "none", borderRadius: 14, fontFamily: ANTON, fontSize: 17, letterSpacing: 3, cursor: "pointer", background: `linear-gradient(90deg,${A.green},#26a047)`, color: "#fff", textTransform: "uppercase", textDecoration: "none", boxSizing: "border-box", textAlign: "center" }}>
            CONTACTAR
          </a>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={logout} style={{ background: "none", border: "none", color: A.muted, fontSize: 14, cursor: "pointer", fontFamily: BF }}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

function NoTrips({ cl, logout }) {
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", fontFamily: BF, color: A.text, textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🧳</div>
      <div style={{ fontFamily: ANTON, fontSize: 28, color: "#fff", letterSpacing: 1, marginBottom: 12 }}>HOLA, {cl.nombre.split(" ")[0].toUpperCase()}</div>
      <div style={{ fontSize: 17, color: A.muted, lineHeight: 1.7, marginBottom: 32 }}>Aún no tienes ningún viaje asignado.</div>
      <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer"
        style={{ display: "block", width: "100%", padding: "16px", borderRadius: 12, fontFamily: ANTON, fontSize: 15, letterSpacing: 3, cursor: "pointer", background: A.green, color: "#fff", textTransform: "uppercase", textDecoration: "none", marginBottom: 14, textAlign: "center" }}>
        CONTACTAR AGENCIA
      </a>
      <button onClick={logout} style={{ background: "none", border: "none", color: A.muted, fontSize: 14, cursor: "pointer", fontFamily: BF }}>Cerrar sesión</button>
    </div>
  );
}
