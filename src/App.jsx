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

// La key va en .env como VITE_CLAUDE_KEY
const callClaude = async (b64, mime, prompt) => {
  const isImg = mime?.startsWith("image/");
  const isPDF = mime === "application/pdf";
  const contentParts = [];
  if (b64 && (isImg || isPDF)) {
    const SUPPORTED_IMG = ["image/jpeg","image/png","image/gif","image/webp"];
    const safeMime = isImg
      ? (SUPPORTED_IMG.includes(mime) ? mime : "image/jpeg")
      : mime; 
    contentParts.push({ type: isImg ? "image" : "document", source: { type: "base64", media_type: safeMime, data: b64 } });
  }
  contentParts.push({ type: "text", text: prompt });
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
const isoToDisplay = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m?`${m[3]}-${m[2]}-${m[1]}`:s; };
const displayToISO = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{2})-(\d{2})-(\d{4})$/); return m?`${m[3]}-${m[2]}-${m[1]}`:s; };
const daysDiff = s => { const d=parseISO(s); return d?Math.ceil((d-NOW)/864e5):null; };
const isUrgent = s => { const n=daysDiff(s); return n!==null&&n>=0&&n<7; };
const isOverdue = s => { const n=daysDiff(s); return n!==null&&n<0; };
const daysUntilExpiry = s => { if(!s) return null; const d=parseISO(s); return d?Math.ceil((d-NOW)/864e5):null; };
const passportWarn = s => { const d=daysUntilExpiry(s); return d!=null&&d<=180; };
const matchSearch = (s,q) => !q||!q.trim()||s.toLowerCase().includes(q.toLowerCase().trim());
const fileToB64 = file => new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=e=>rej(e); r.readAsDataURL(file); });

const emptyHotel = () => ({ id:uid(), nombre:"", direccion:"", fechasEstancia:"" });
const emptyEmergencias = () => ({ policia:"", ambulancia:"", bomberos:"", tourleader:"" });
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
  emergencias:{ policia:"911", ambulancia:"911", bomberos:"911", tourleader:"+34 600000000" },
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
function CopyBtn({ text, label, style }) {
  const [ok,setOk]=React.useState(false);
  const hasLabel = !!label;
  return (
    <button onClick={e=>{ e.stopPropagation(); navigator.clipboard.writeText(text||"").then(()=>{ setOk(true); setTimeout(()=>setOk(false), hasLabel?2000:1800); }); }}
      style={hasLabel
        ? { flexShrink:0,background:ok?A.green+"22":A.cyan+"22",border:`1px solid ${ok?A.green:A.cyan}44`,color:ok?A.green:A.cyan,borderRadius:8,padding:"6px 10px",fontSize:10,fontFamily:BF,cursor:"pointer",fontWeight:700,...(style||{}) }
        : { background:ok?"#22c55e22":"transparent",border:"1px solid "+(ok?"#22c55e":"#ffffff22"),borderRadius:6,padding:"3px 7px",cursor:"pointer",color:ok?"#22c55e":"#ffffff66",fontSize:11,fontFamily:"monospace",lineHeight:1,flexShrink:0,...(style||{}) }}>
      {hasLabel ? (ok?"¡Copiado!":label) : (ok?"✓":"⎘")}
    </button>
  );
}
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

  const onImgDown = e => {
    if (!isZ) return;
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
  const onImgWheel = e => { };

  return (
    <div style={{ background: "#000", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div onPointerDown={e => e.stopPropagation()} style={{ display: "flex", gap: 8, padding: "8px 12px", alignItems: "center", background: "rgba(0,0,0,0.6)", flexShrink: 0 }}>
        <button onClick={zoomOut} disabled={zoom <= 1} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, width: 34, height: 34, color: zoom <= 1 ? "#444" : "#fff", fontSize: 18, cursor: zoom <= 1 ? "default" : "pointer" }}>−</button>
        <button onClick={zoomIn}  disabled={zoom >= 5} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, width: 34, height: 34, color: zoom >= 5 ? "#444" : "#fff", fontSize: 18, cursor: zoom >= 5 ? "default" : "pointer" }}>+</button>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "monospace", minWidth: 34, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button onClick={rotate} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, width: 34, height: 34, color: "#fff", fontSize: 16, cursor: "pointer" }}>↻</button>
        {(zoom > 1 || rot > 0) && <button onClick={reset} style={{ background: "rgba(255,200,71,0.15)", border: "1px solid rgba(255,200,71,0.3)", borderRadius: 7, padding: "0 10px", height: 34, color: "#ffc847", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>RESET</button>}
      </div>
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

function PassportModal({ modal, onClose, onSave, onChangePhoto, onDelete }) {
  const [docNum, setDocNum] = React.useState(modal.docNum || "");
  const [expiry, setExpiry] = React.useState(modal.expiry || "");
  const [birthDate, setBirthDate] = React.useState(modal.birthDate || "");

  const handleDateInput = (setter) => (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let fmt = digits;
    if (digits.length > 2) fmt = digits.slice(0, 2) + "-" + digits.slice(2);
    if (digits.length > 4) fmt = digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4, 8);
    setter(fmt);
  };
  const handleExpiry = handleDateInput(setExpiry);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${A.border}22`, flexShrink: 0 }}>
        <div style={{ fontFamily: ANTON, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{modal.name}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href={modal.src} download="pasaporte.jpg" target="_blank" rel="noreferrer"
            style={{ background: A.gold + "22", border: `1px solid ${A.gold}44`, borderRadius: 8, padding: "6px 12px", color: A.gold, fontSize: 12, fontFamily: BF, fontWeight: 700, textDecoration: "none", cursor: "pointer" }}>📲 Guardar</a>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${A.border}`, borderRadius: 8, width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>✕</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <PassportImageViewer src={modal.src} />
      </div>
      <div style={{ background: "#0a0a12", borderTop: `2px solid ${A.cyan}33`, padding: "14px 16px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
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
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: BF, fontSize: 9, color: A.gold, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 5 }}>Fecha de nacimiento</div>
          <input
            value={birthDate}
            onChange={handleDateInput(setBirthDate)}
            onFocus={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            placeholder="DD-MM-AAAA"
            inputMode="numeric"
            type="text"
            autoComplete="off"
            maxLength={10}
            style={{ ...ais, fontFamily: ANTON, fontSize: 16, textAlign: "center", color: A.gold, background: "#000", border: `2px solid ${A.gold}44`, borderRadius: 10, padding: "12px 8px" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
          <button onClick={() => onSave(docNum, expiry, birthDate)}
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

/* ══════════════════════════════════════════════════════════════
   VOUCHER GENERATOR — Panel Admin
══════════════════════════════════════════════════════════════ */
function VoucherGenerator({ onBack, trips }) {
  const [tab,setTab]=useState("editor");
  const [titulo,setTitulo]=useState("VOUCHER TRAVELIKE");
  const [programa,setPrograma]=useState("");
  const [salida,setSalida]=useState("");
  const [regreso,setRegreso]=useState("");
  const [lineas,setLineas]=useState([{ id:uid(),desc:"",sub:"",precio:"" }]);
  const [pago1,setPago1]=useState("");
  const [pago1lbl,setPago1lbl]=useState("Primer pago — reserva de plaza");
  const [pago2,setPago2]=useState("");
  const [pago2fecha,setPago2fecha]=useState("");
  const [nota,setNota]=useState("");
  const [gen,setGen]=useState(false);
  const vRef=useRef();

  const addLinea=()=>setLineas(ls=>[...ls,{id:uid(),desc:"",sub:"",precio:""}]);
  const removeLinea=id=>setLineas(ls=>ls.filter(l=>l.id!==id));
  const updLinea=(id,f,v)=>setLineas(ls=>ls.map(l=>l.id===id?{...l,[f]:v}:l));
  const fmtD=raw=>{ if(!raw) return "—"; const [y,m,d]=raw.split("-"); return `${d}-${m}-${y}`; };
  const reset=()=>{ if(!window.confirm("¿Limpiar todos los campos?")) return; setTitulo("VOUCHER TRAVELIKE"); setPrograma(""); setSalida(""); setRegreso(""); setLineas([{id:uid(),desc:"",sub:"",precio:""}]); setPago1(""); setPago1lbl("Primer pago — reserva de plaza"); setPago2(""); setPago2fecha(""); setNota(""); };

  const ensureLibs=async()=>{
    if(!window.html2canvas) await new Promise(res=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload=res; document.head.appendChild(s); });
    return loadJsPDF();
  };

  const buildPDF=async()=>{
    const JsPDF=await ensureLibs();
    const el=vRef.current;
    const canvas=await window.html2canvas(el,{scale:2,useCORS:true,backgroundColor:"#ffffff"});
    const img=canvas.toDataURL("image/jpeg",0.92);
    const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
    const r=Math.min(pw/canvas.width,ph/canvas.height);
    pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);
    return pdf;
  };

  const downloadPDF=async()=>{ setGen(true); try { const pdf=await buildPDF(); pdf.save("voucher-travelike.pdf"); } catch(e){ alert("Error: "+e.message); } setGen(false); };
  const shareWA=async()=>{
    setGen(true);
    try {
      const pdf=await buildPDF();
      const blob=pdf.output("blob");
      const file=new File([blob],"voucher-travelike.pdf",{type:"application/pdf"});
      if(navigator.canShare?.({files:[file]})) { await navigator.share({title:"Voucher Travelike",files:[file]}); }
      else {
        const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="voucher-travelike.pdf"; a.click(); URL.revokeObjectURL(url);
        setTimeout(()=>window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent("¡Aquí tu voucher de viaje! 🌍✈️")}`, "_blank"),800);
      }
    } catch(e){ alert("Error: "+e.message); } setGen(false);
  };

  const ActBtns=()=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
      <button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),border:`1px solid ${A.gold}44`,fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳ Generando...":"⬇️ Descargar PDF"}</button>
      <button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),border:"1px solid #25D36644",fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳...":"💬 Enviar por WA"}</button>
    </div>
  );

  const PreviewCard=()=>(
    <div style={{border:`1px solid ${A.border}`,borderRadius:12,overflow:"hidden",background:"#fff"}}>
      <div style={{background:"#0D2137",padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"3px solid #1AB5B0"}}>
        <div>
          <div style={{fontFamily:ANTON,fontSize:20,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:3,marginTop:2}}>AGENCIA DE VIAJES</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:ANTON,fontSize:12,color:"#fff",letterSpacing:1}}>{titulo.toUpperCase()}</div>
        </div>
      </div>
      <div style={{padding:"14px 18px",background:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,paddingBottom:10,borderBottom:"1px solid #D8E4EE"}}>
          <div>
            <div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"uppercase"}}>PROGRAMA</div>
            <div style={{fontFamily:ANTON,fontSize:13,color:"#0D2137",marginTop:3}}>{(programa||"PROGRAMA TRAVELIKE").toUpperCase()}</div>
          </div>
          <div style={{textAlign:"right",background:"#F4F7FA",padding:"7px 10px",borderRadius:6,border:"1px solid #D8E4EE"}}>
            <div style={{fontSize:8,color:"#6B8399",letterSpacing:1}}>FECHAS</div>
            <div style={{fontSize:11,color:"#1A2B3C",fontWeight:600,marginTop:1}}>{fmtD(salida)} → {fmtD(regreso)}</div>
          </div>
        </div>
        <div style={{background:"#0D2137",borderRadius:6,padding:"8px 12px",marginBottom:12}}>
          <div style={{fontSize:7,color:"#1AB5B0",letterSpacing:2,marginBottom:4}}>DATOS BANCARIOS</div>
          <div style={{fontSize:10,color:"#fff",fontWeight:600}}>{BANK_IBAN}</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:1}}>Titular: {BANK_TITULAR}</div>
        </div>
        {lineas.filter(l=>l.desc||l.precio).length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:6,paddingBottom:5,borderBottom:"1px solid #D8E4EE"}}>DESGLOSE DEL PRECIO</div>
            {lineas.filter(l=>l.desc||l.precio).map(l=>(
              <div key={l.id} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:"1px solid #F4F7FA"}}>
                <span style={{color:"#1AB5B0",fontSize:11}}>—</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"#1A2B3C",fontWeight:500}}>{l.desc}</div>
                  {l.sub&&<div style={{fontSize:9,color:"#6B8399",marginTop:1}}>{l.sub}</div>}
                </div>
                <div style={{fontSize:11,color:"#0D2137",fontWeight:700,flexShrink:0}}>{l.precio}</div>
              </div>
            ))}
          </div>
        )}
        {(pago1||pago2)&&(
          <div style={{marginBottom:10}}>
            <div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:6,paddingBottom:5,borderBottom:"1px solid #D8E4EE"}}>PLAN DE PAGOS</div>
            {pago1&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{fontSize:11,color:"#1A2B3C",fontWeight:500}}>{pago1lbl}</div><div style={{fontSize:11,color:"#0D8E8A",fontWeight:700}}>{pago1}</div></div>}
            {pago2&&<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #F4F7FA"}}><div><div style={{fontSize:11,color:"#1A2B3C",fontWeight:500}}>Segundo pago</div>{pago2fecha&&<div style={{fontSize:9,color:"#E05C5C"}}>Antes del {fmtD(pago2fecha)}</div>}</div><div style={{fontSize:11,color:"#0D8E8A",fontWeight:700}}>{pago2}</div></div>}
            {nota&&<div style={{fontSize:10,color:"#6B8399",padding:"5px 0",fontStyle:"italic"}}>{nota}</div>}
          </div>
        )}
        <div style={{marginTop:10,padding:"12px 14px",background:"#F4F7FA",borderRadius:6,border:"1px solid #D8E4EE"}}>
          <div style={{fontSize:9,color:"#6B8399",lineHeight:1.6}}>Este documento confirma su reserva con TraveLike. Las plazas quedan reservadas una vez realizado el primer pago.</div>
        </div>
      </div>
      <div style={{background:"#0D2137",padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:ANTON,fontSize:13,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>www.travelike.es</div>
      </div>
    </div>
  );

  return (
    <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF}}>
      {/* Top bar */}
      <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button>
        <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Generador de Vouchers</div>
        <button onClick={reset} style={{background:"transparent",border:`1px solid ${A.border}`,color:A.muted,borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>Limpiar</button>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${A.border}`,background:A.card}}>
        {[["editor","✏️ Editor"],["preview","👁 Vista previa"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"11px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===k?A.gold:"transparent"}`,color:tab===k?A.gold:A.muted,fontFamily:BF,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {tab==="editor"?(
        <div style={{padding:"16px"}}>
          {/* Básicos */}
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Título del voucher</div>
            <input value={titulo} onChange={e=>setTitulo(e.target.value)} style={ais}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Programa</div>
            <input value={programa} onChange={e=>setPrograma(e.target.value)} placeholder="Ej: PROGRAMA TRAVELIKE CHINA MAYO 2026" style={ais}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Fecha salida</div><input type="date" value={salida} onChange={e=>setSalida(e.target.value)} style={ais}/></div>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Fecha regreso</div><input type="date" value={regreso} onChange={e=>setRegreso(e.target.value)} style={ais}/></div>
          </div>
          {/* Conceptos */}
          <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`}}>CONCEPTOS / PRECIOS</div>
          {lineas.map(l=>(
            <div key={l.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:11,marginBottom:8}}>
              <div style={{display:"flex",gap:8,marginBottom:7}}>
                <input value={l.desc} onChange={e=>updLinea(l.id,"desc",e.target.value)} placeholder="Descripción del concepto" style={{...ais,flex:1}}/>
                <input value={l.precio} onChange={e=>updLinea(l.id,"precio",e.target.value)} placeholder="Importe" style={{...ais,width:100,flex:"none"}}/>
                <button onClick={()=>removeLinea(l.id)} style={{background:"none",border:"none",color:A.red,fontSize:20,cursor:"pointer",padding:"0 3px",flexShrink:0}}>×</button>
              </div>
              <textarea value={l.sub} onChange={e=>updLinea(l.id,"sub",e.target.value)} placeholder="Detalle adicional (vuelos, rutas, equipaje… — opcional)" rows={2} style={{...ais,resize:"vertical",lineHeight:1.5,fontSize:13}}/>
            </div>
          ))}
          <button onClick={addLinea} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:16}}>+ Añadir concepto</button>
          {/* Pagos */}
          <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`}}>PLAN DE PAGOS</div>
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Etiqueta primer pago</div>
            <input value={pago1lbl} onChange={e=>setPago1lbl(e.target.value)} style={ais}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Importe 1er pago</div><input value={pago1} onChange={e=>setPago1(e.target.value)} placeholder="1.715 €" style={ais}/></div>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Importe 2º pago</div><input value={pago2} onChange={e=>setPago2(e.target.value)} placeholder="1.715 €" style={ais}/></div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Fecha límite 2º pago</div>
            <input type="date" value={pago2fecha} onChange={e=>setPago2fecha(e.target.value)} style={ais}/>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Nota adicional</div>
            <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Condiciones, notas extra..." rows={3} style={{...ais,resize:"vertical",lineHeight:1.5}}/>
          </div>
          <ActBtns/>
        </div>
      ):(
        <div style={{padding:16}}>
          <div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",textAlign:"center",marginBottom:12}}>VISTA PREVIA DEL VOUCHER</div>
          <PreviewCard/>
          <ActBtns/>
        </div>
      )}

      {/* Hidden A4 element for PDF capture */}
      <div style={{position:"fixed",left:-9999,top:0,width:794,pointerEvents:"none",zIndex:-1}}>
        <div ref={vRef} style={{width:794,minHeight:1000,background:"#fff",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{background:"#0D2137",padding:"32px 40px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"4px solid #1AB5B0"}}>
            <div><div style={{fontFamily:"Anton,sans-serif",fontSize:30,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginTop:4}}>AGENCIA DE VIAJES</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"Anton,sans-serif",fontSize:22,color:"#fff",letterSpacing:2}}>{titulo.toUpperCase()}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginTop:4}}>Documento de reserva</div></div>
          </div>
          <div style={{padding:"32px 40px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,paddingBottom:20,borderBottom:"1px solid #D8E4EE"}}>
              <div><div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Programa</div><div style={{fontFamily:"Anton,sans-serif",fontSize:22,color:"#0D2137",letterSpacing:1}}>{(programa||"PROGRAMA TRAVELIKE").toUpperCase()}</div></div>
              <div style={{textAlign:"right",background:"#F4F7FA",borderRadius:8,padding:"12px 16px",border:"1px solid #D8E4EE"}}><div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Fechas de viaje</div><div style={{fontSize:14,color:"#1A2B3C",fontWeight:600}}>{fmtD(salida)} → {fmtD(regreso)}</div></div>
            </div>
            <div style={{background:"#0D2137",borderRadius:8,padding:"16px 20px",marginBottom:24}}>
              <div style={{fontSize:9,color:"#1AB5B0",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Datos bancarios para transferencia</div>
              <div style={{display:"flex",gap:32}}><div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>IBAN</div><div style={{fontSize:13,color:"#fff",fontWeight:600}}>{BANK_IBAN}</div></div><div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Titular</div><div style={{fontSize:13,color:"#fff",fontWeight:600}}>{BANK_TITULAR}</div></div></div>
            </div>
            {lineas.filter(l=>l.desc||l.precio).length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:"1px solid #D8E4EE"}}>Desglose del precio</div>
                {lineas.filter(l=>l.desc||l.precio).map(l=>(
                  <div key={l.id} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F4F7FA"}}>
                    <div style={{color:"#1AB5B0",fontSize:16}}>—</div>
                    <div style={{flex:1}}><div style={{fontSize:14,color:"#1A2B3C",fontWeight:500}}>{l.desc}</div>{l.sub&&<div style={{fontSize:11,color:"#6B8399",marginTop:3,lineHeight:1.5,whiteSpace:"pre-line"}}>{l.sub}</div>}</div>
                    <div style={{fontFamily:"Anton,sans-serif",fontSize:14,color:"#0D2137",letterSpacing:0.5,flexShrink:0}}>{l.precio}</div>
                  </div>
                ))}
              </div>
            )}
            {(pago1||pago2)&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:"1px solid #D8E4EE"}}>Plan de pagos</div>
                {pago1&&<div style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{color:"#0D8E8A"}}>→</div><div style={{flex:1,fontSize:14,color:"#1A2B3C",fontWeight:500}}>{pago1lbl}</div><div style={{fontFamily:"Anton,sans-serif",fontSize:14,color:"#0D8E8A"}}>{pago1}</div></div>}
                {pago2&&<div style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{color:"#0D8E8A"}}>→</div><div style={{flex:1}}><div style={{fontSize:14,color:"#1A2B3C",fontWeight:500}}>Segundo pago</div>{pago2fecha&&<div style={{fontSize:11,color:"#E05C5C",marginTop:2}}>Antes del {fmtD(pago2fecha)}</div>}</div><div style={{fontFamily:"Anton,sans-serif",fontSize:14,color:"#0D8E8A"}}>{pago2}</div></div>}
                {nota&&<div style={{fontSize:12,color:"#6B8399",padding:"8px 0",fontStyle:"italic"}}>{nota}</div>}
              </div>
            )}
            <div style={{marginTop:32,padding:"20px 24px",background:"#F4F7FA",borderRadius:8,border:"1px solid #D8E4EE"}}><div style={{fontSize:11,color:"#6B8399",lineHeight:1.7}}>Este documento confirma su reserva con TraveLike. Para cualquier consulta contacte por WhatsApp o email. Las plazas quedan reservadas una vez realizado el primer pago.</div></div>
          </div>
          <div style={{background:"#0D2137",padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:40}}><div style={{fontFamily:"Anton,sans-serif",fontSize:20,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div><div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>www.travelike.es</div></div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRESUPUESTO GENERATOR — Panel Admin
══════════════════════════════════════════════════════════════ */
function PresupuestoGenerator({ onBack, trips }) {
  const [tab,setTab]=useState("general");
  // General
  const [destino,setDestino]=useState("");
  const [agente,setAgente]=useState("TraveLike");
  const [pax,setPax]=useState("1");
  const [moneda,setMoneda]=useState("EUR");
  const [accentColor,setAccentColor]=useState("#00f0ff");
  // Hero
  const [heroTitulo,setHeroTitulo]=useState("");
  const [heroSub,setHeroSub]=useState("");
  const [heroImg,setHeroImg]=useState("");
  // Vuelos
  const [vuelos,setVuelos]=useState([{id:uid(),ruta:"",aerolinea:"",fecha:"",clase:"Turista"}]);
  // Hotel
  const [hotelEnabled,setHotelEnabled]=useState(true);
  const [hotelNombre,setHotelNombre]=useState("");
  const [hotelLugar,setHotelLugar]=useState("");
  const [hotelStars,setHotelStars]=useState(4);
  const [hotelImg,setHotelImg]=useState("");
  // Actividades
  const [actEnabled,setActEnabled]=useState(false);
  const [actividades,setActividades]=useState([{id:uid(),em:"🎯",nombre:"",desc:""}]);
  // Incluye
  const [incluye,setIncluye]=useState([{id:uid(),em:"✅",txt:"Vuelos internacionales"},{id:uid(),em:"🏨",txt:"Alojamiento en hotel"},{id:uid(),em:"🗺️",txt:"Guía turístico"},{id:uid(),em:"🛡️",txt:"Seguro de viaje"}]);
  // Precios
  const [preciosEnabled,setPreciosEnabled]=useState(true);
  const [precios,setPrecios]=useState([{id:uid(),concepto:"Precio por persona",importe:""},{id:uid(),concepto:"Vuelos",importe:""}]);
  const [hasDesc,setHasDesc]=useState(false);
  const [descConc,setDescConc]=useState("Descuento especial");
  const [descImp,setDescImp]=useState("");
  // Notas
  const [notas,setNotas]=useState("Precio sujeto a disponibilidad. Válido 7 días desde la fecha de emisión.");
  // CTA
  const [ctaWa,setCtaWa]=useState(WA_NUM);
  const [gen,setGen]=useState(false);
  const preRef=useRef();
  const [monMenu,setMonMenu]=useState(false);

  const sym=getCurrencySymbol(moneda);
  const fmtM=(v)=>{ if(!v) return "—"; const n=parseFloat((v||"").replace(",",".")); return isNaN(n)?v:`${sym}${n.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}`; };
  const paxN=Math.max(1,parseInt(pax)||1);
  const sub=precios.reduce((a,p)=>a+(parseFloat((p.importe||"").replace(",","."))||0),0);
  const desc=hasDesc?(parseFloat((descImp||"").replace(",","."))||0):0;
  const total=(sub-desc)*paxN;

  const addVuelo=()=>setVuelos(v=>[...v,{id:uid(),ruta:"",aerolinea:"",fecha:"",clase:"Turista"}]);
  const removeVuelo=id=>setVuelos(v=>v.filter(x=>x.id!==id));
  const updVuelo=(id,f,v)=>setVuelos(vs=>vs.map(x=>x.id===id?{...x,[f]:v}:x));
  const addAct=()=>setActividades(a=>[...a,{id:uid(),em:"🎯",nombre:"",desc:""}]);
  const removeAct=id=>setActividades(a=>a.filter(x=>x.id!==id));
  const updAct=(id,f,v)=>setActividades(as=>as.map(x=>x.id===id?{...x,[f]:v}:x));
  const addInc=()=>setIncluye(i=>[...i,{id:uid(),em:"✅",txt:""}]);
  const removeInc=id=>setIncluye(i=>i.filter(x=>x.id!==id));
  const updInc=(id,f,v)=>setIncluye(is=>is.map(x=>x.id===id?{...x,[f]:v}:x));
  const addPrecio=()=>setPrecios(p=>[...p,{id:uid(),concepto:"",importe:""}]);
  const removePrecio=id=>setPrecios(p=>p.filter(x=>x.id!==id));
  const updPrecio=(id,f,v)=>setPrecios(ps=>ps.map(x=>x.id===id?{...x,[f]:v}:x));

  const PALETA=[{c:"#00f0ff",l:"Cyan"},{c:"#ffc847",l:"Gold"},{c:"#e8002a",l:"Rojo"},{c:"#34C759",l:"Verde"},{c:"#BF5AF2",l:"Morado"},{c:"#FF9500",l:"Naranja"},{c:"#1AB5B0",l:"Teal"},{c:"#4FC3F7",l:"Azul"}];

  const downloadPDF=async()=>{
    setGen(true);
    try {
      if(!window.html2canvas) await new Promise(res=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload=res; document.head.appendChild(s); });
      const JsPDF=await loadJsPDF();
      const el=preRef.current;
      const canvas=await window.html2canvas(el,{scale:3,useCORS:true,backgroundColor:"#07070f",allowTaint:true});
      const img=canvas.toDataURL("image/jpeg",0.92);
      const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
      const r=Math.min(pw/canvas.width,ph/canvas.height);
      const x=(pw-canvas.width*r)/2;
      pdf.addImage(img,"JPEG",x,0,canvas.width*r,canvas.height*r);
      pdf.save(`presupuesto-${destino||"travelike"}.pdf`);
    } catch(e){ alert("Error: "+e.message); }
    setGen(false);
  };

  const shareWA=async()=>{
    setGen(true);
    try {
      if(!window.html2canvas) await new Promise(res=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload=res; document.head.appendChild(s); });
      const JsPDF=await loadJsPDF();
      const el=preRef.current;
      const canvas=await window.html2canvas(el,{scale:3,useCORS:true,backgroundColor:"#07070f",allowTaint:true});
      const img=canvas.toDataURL("image/jpeg",0.92);
      const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
      const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
      const r=Math.min(pw/canvas.width,ph/canvas.height);
      pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);
      const blob=pdf.output("blob");
      const fn=`presupuesto-${destino||"travelike"}.pdf`;
      const file=new File([blob],fn,{type:"application/pdf"});
      if(navigator.canShare?.({files:[file]})) { await navigator.share({title:"Presupuesto Travelike",files:[file]}); }
      else {
        const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=fn; a.click(); URL.revokeObjectURL(url);
        setTimeout(()=>window.open(`https://wa.me/${ctaWa.replace(/\D/g,"")}?text=${encodeURIComponent(`Hola, te adjunto el presupuesto de viaje${destino?" a "+destino:""} 🌍`)}`, "_blank"), 800);
      }
    } catch(e){ alert("Error: "+e.message); }
    setGen(false);
  };

  const TABS_P=[["general","🌍 General"],["vuelos","✈️ Vuelos"],["hotel","🏨 Hotel"],["actividades","🎯 Actividades"],["incluye","✅ Incluye"],["precios","💰 Precios"],["diseno","🎨 Diseño"]];

  const secStyle={fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`};
  const lbl={fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5};

  // Live preview card
  const QuoteCard=({forPDF=false})=>{
    const cardStyle=forPDF?{width:390,background:"#07070f",borderRadius:20,overflow:"hidden",fontFamily:"'Barlow Condensed',sans-serif"}:{width:"100%",background:"#07070f",borderRadius:16,overflow:"hidden",fontFamily:BF,boxShadow:`0 0 40px ${accentColor}22`};
    return (
      <div style={cardStyle}>
        {/* Hero */}
        <div style={{position:"relative",minHeight:160,padding:"40px 16px 22px",display:"flex",flexDirection:"column",justifyContent:"flex-end",background:heroImg?undefined:"#07070f",backgroundImage:heroImg?`url(${heroImg})`:"linear-gradient(135deg,#07070f,#0f1824)",backgroundSize:"cover",backgroundPosition:"center"}}>
          {heroImg&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(7,7,15,0.85) 0%,rgba(7,7,15,0.2) 100%)"}}/>}
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:10,color:accentColor,letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontFamily:BF,fontWeight:700}}>{agente||"TRAVELIKE"}</div>
            <div style={{fontFamily:ANTON,fontSize:28,color:"#fff",lineHeight:1,marginBottom:6,textTransform:"uppercase"}}>{heroTitulo||destino||"DESTINO"}</div>
            {heroSub&&<div style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{heroSub}</div>}
            <div style={{display:"inline-block",marginTop:10,background:`${accentColor}22`,border:`1px solid ${accentColor}55`,borderRadius:6,padding:"3px 10px",fontSize:11,color:accentColor,fontFamily:BF,fontWeight:700}}>{paxN} pax · {moneda}</div>
          </div>
        </div>

        {/* Vuelos */}
        {vuelos.filter(v=>v.ruta||v.aerolinea).length>0&&(
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${accentColor}15`}}>
            <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>✈️ VUELOS</div>
            {vuelos.filter(v=>v.ruta||v.aerolinea).map(v=>(
              <div key={v.id} style={{background:`${accentColor}08`,border:`1px solid ${accentColor}20`,borderRadius:8,padding:"9px 11px",marginBottom:6}}>
                <div style={{fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:0.5}}>{v.ruta||"—"}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2}}>{[v.aerolinea,v.fecha,v.clase].filter(Boolean).join(" · ")}</div>
              </div>
            ))}
          </div>
        )}

        {/* Hotel */}
        {hotelEnabled&&hotelNombre&&(
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}>
            <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>🏨 ALOJAMIENTO</div>
            <div style={{background:"#0f1824",borderRadius:8,padding:"10px 12px",display:"flex",gap:10,alignItems:"flex-start"}}>
              {hotelImg&&<div style={{width:52,height:52,borderRadius:6,background:`url(${hotelImg}) center/cover`,flexShrink:0}}/>}
              <div style={{flex:1}}>
                <div style={{fontFamily:ANTON,fontSize:15,color:"#fff",letterSpacing:0.5}}>{hotelNombre}</div>
                <div style={{fontSize:10,color:accentColor,marginTop:2}}>{"★".repeat(hotelStars)+"☆".repeat(Math.max(0,5-hotelStars))}</div>
                {hotelLugar&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2}}>📍 {hotelLugar}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Actividades */}
        {actEnabled&&actividades.filter(a=>a.nombre).length>0&&(
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}>
            <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>🎯 ACTIVIDADES INCLUIDAS</div>
            {actividades.filter(a=>a.nombre).map(a=>(
              <div key={a.id} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                <span style={{fontSize:16}}>{a.em}</span>
                <div><div style={{fontSize:12,color:"#fff",fontFamily:BF,fontWeight:700}}>{a.nombre}</div>{a.desc&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{a.desc}</div>}</div>
              </div>
            ))}
          </div>
        )}

        {/* Incluye */}
        {incluye.filter(i=>i.txt).length>0&&(
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}>
            <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>✅ QUÉ INCLUYE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {incluye.filter(i=>i.txt).map(i=>(
                <div key={i.id} style={{background:`${accentColor}08`,border:`1px solid ${accentColor}18`,borderRadius:6,padding:"5px 8px",display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{fontSize:12}}>{i.em}</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.75)",lineHeight:1.3}}>{i.txt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Precios */}
        {preciosEnabled&&(
          <div style={{padding:"14px 16px",background:"#0a0d16",borderBottom:`1px solid ${accentColor}15`}}>
            <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontFamily:BF,fontWeight:700}}>📋 PRESUPUESTO · {paxN} pax</div>
            <div style={{fontFamily:ANTON,fontSize:30,color:accentColor,letterSpacing:1,marginBottom:4}}>{fmtM(total.toString())}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:10}}>Total {paxN} pasajero{paxN>1?"s":""} · IVA incluido</div>
            {precios.filter(p=>p.concepto||p.importe).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>{p.concepto}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:700}}>{fmtM(p.importe)}</span>
              </div>
            ))}
            {hasDesc&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
              <span style={{fontSize:11,color:"#4ade80"}}>{descConc}</span>
              <span style={{fontSize:11,color:"#4ade80",fontWeight:700}}>− {fmtM(descImp)}</span>
            </div>}
          </div>
        )}

        {/* Notas */}
        {notas&&(
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontFamily:BF,fontWeight:700}}>📄 CONDICIONES</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>{notas}</div>
          </div>
        )}

        {/* CTA */}
        <div style={{padding:"16px",background:`${accentColor}15`,borderTop:`1px solid ${accentColor}30`}}>
          <div style={{fontSize:13,color:"#fff",fontFamily:ANTON,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>¿TE INTERESA ESTE VIAJE?</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:10}}>Consulta disponibilidad y reserva tu plaza</div>
          <div style={{background:accentColor,color:"#07070f",borderRadius:8,padding:"10px",textAlign:"center",fontFamily:ANTON,fontSize:14,letterSpacing:2,textTransform:"uppercase"}}>CONTACTAR — {ctaWa||WA_NUM}</div>
        </div>
        <div style={{padding:"10px 16px",background:"#07070f",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid rgba(255,255,255,0.05)`}}>
          <div style={{fontFamily:ANTON,fontSize:14,color:accentColor,letterSpacing:2}}>TRAVELIKE</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:BF}}>www.travelike.es</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF,paddingBottom:80}}>
      {/* Top bar */}
      <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button>
        <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Constructor de Presupuestos</div>
        {preciosEnabled&&total>0&&<div style={{fontFamily:ANTON,fontSize:14,color:accentColor,letterSpacing:0.5}}>{sym}{total.toLocaleString("es-ES",{maximumFractionDigits:0})}</div>}
      </div>

      {/* Section tabs */}
      <div style={{overflowX:"auto",borderBottom:`1px solid ${A.border}`,background:A.card,display:"flex",scrollbarWidth:"none"}}>
        {TABS_P.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flexShrink:0,background:"transparent",border:"none",borderBottom:`2px solid ${tab===k?accentColor:"transparent"}`,color:tab===k?accentColor:A.muted,padding:"10px 14px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:BF,letterSpacing:1,whiteSpace:"nowrap",textTransform:"uppercase"}}>{l}</button>
        ))}
      </div>

      <div style={{padding:"14px 16px"}}>
        {/* GENERAL */}
        {tab==="general"&&(
          <div>
            <div style={secStyle}>DATOS GENERALES</div>
            <div style={{marginBottom:10}}><div style={lbl}>Destino</div><input value={destino} onChange={e=>setDestino(e.target.value)} placeholder="China, India, Vietnam..." style={ais}/></div>
            <div style={{marginBottom:10}}><div style={lbl}>Nombre del agente / agencia</div><input value={agente} onChange={e=>setAgente(e.target.value)} placeholder="TraveLike" style={ais}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginBottom:10}}>
              <div><div style={lbl}>Nº de pasajeros</div><input value={pax} onChange={e=>setPax(e.target.value.replace(/\D/g,""))} inputMode="numeric" style={ais}/></div>
              <div><div style={lbl}>Moneda</div><button onClick={()=>setMonMenu(true)} style={{...ais,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px"}}><span style={{fontFamily:ANTON,color:A.gold}}>{moneda}</span><span style={{color:A.muted}}>▾</span></button></div>
            </div>
            <div style={{marginBottom:10}}><div style={lbl}>Número WhatsApp (CTA)</div><input value={ctaWa} onChange={e=>setCtaWa(e.target.value)} placeholder="34600000000" style={ais}/></div>
            <div style={secStyle}>BANNER / HERO</div>
            <div style={{marginBottom:10}}><div style={lbl}>Título principal</div><input value={heroTitulo} onChange={e=>setHeroTitulo(e.target.value)} placeholder={destino||"VIAJE A CHINA"} style={ais}/></div>
            <div style={{marginBottom:10}}><div style={lbl}>Subtítulo</div><input value={heroSub} onChange={e=>setHeroSub(e.target.value)} placeholder="14 días · Mayo 2026 · Todo incluido" style={ais}/></div>
            <div style={{marginBottom:10}}><div style={lbl}>URL imagen de fondo</div><input value={heroImg} onChange={e=>setHeroImg(e.target.value)} placeholder="https://..." style={ais}/></div>
          </div>
        )}

        {/* VUELOS */}
        {tab==="vuelos"&&(
          <div>
            <div style={secStyle}>VUELOS</div>
            {vuelos.map((v,i)=>(
              <div key={v.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:11,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,fontWeight:700,textTransform:"uppercase"}}>VUELO {i+1}</div>
                  {vuelos.length>1&&<button onClick={()=>removeVuelo(v.id)} style={{background:"none",border:"none",color:A.red,fontSize:16,cursor:"pointer"}}>×</button>}
                </div>
                <div style={{marginBottom:7}}><div style={lbl}>Ruta</div><input value={v.ruta} onChange={e=>updVuelo(v.id,"ruta",e.target.value)} placeholder="Madrid → Pekín → Madrid" style={ais}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><div style={lbl}>Aerolínea</div><input value={v.aerolinea} onChange={e=>updVuelo(v.id,"aerolinea",e.target.value)} placeholder="Iberia" style={ais}/></div>
                  <div><div style={lbl}>Fecha</div><input value={v.fecha} onChange={e=>updVuelo(v.id,"fecha",e.target.value)} placeholder="20-05-2026" style={ais}/></div>
                </div>
                <div style={{marginTop:7}}><div style={lbl}>Clase</div>
                  <select value={v.clase} onChange={e=>updVuelo(v.id,"clase",e.target.value)} style={ais}>
                    {["Turista","Turista Premium","Business","Primera"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <button onClick={addVuelo} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Añadir vuelo</button>
          </div>
        )}

        {/* HOTEL */}
        {tab==="hotel"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={secStyle}>HOTEL / ALOJAMIENTO</div>
              <input type="checkbox" checked={hotelEnabled} onChange={e=>setHotelEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/>
            </div>
            {hotelEnabled&&(
              <>
                <div style={{marginBottom:10}}><div style={lbl}>Nombre del hotel</div><input value={hotelNombre} onChange={e=>setHotelNombre(e.target.value)} placeholder="Hotel Gran Via" style={ais}/></div>
                <div style={{marginBottom:10}}><div style={lbl}>Ubicación</div><input value={hotelLugar} onChange={e=>setHotelLugar(e.target.value)} placeholder="Pekín, China" style={ais}/></div>
                <div style={{marginBottom:10}}>
                  <div style={lbl}>Estrellas</div>
                  <div style={{display:"flex",gap:6,marginTop:4}}>
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>setHotelStars(n)} style={{fontSize:24,background:"none",border:"none",cursor:"pointer",opacity:n<=hotelStars?1:0.25,transition:"all .15s"}}>★</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:10}}><div style={lbl}>URL imagen hotel</div><input value={hotelImg} onChange={e=>setHotelImg(e.target.value)} placeholder="https://..." style={ais}/></div>
              </>
            )}
          </div>
        )}

        {/* ACTIVIDADES */}
        {tab==="actividades"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{...secStyle,flex:1}}>ACTIVIDADES</div>
              <input type="checkbox" checked={actEnabled} onChange={e=>setActEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/>
            </div>
            {actEnabled&&(
              <>
                {actividades.map((a,i)=>(
                  <div key={a.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:11,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,fontWeight:700,textTransform:"uppercase"}}>ACTIVIDAD {i+1}</div>
                      <button onClick={()=>removeAct(a.id)} style={{background:"none",border:"none",color:A.red,fontSize:16,cursor:"pointer"}}>×</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"50px 1fr",gap:8,marginBottom:7}}>
                      <div><div style={lbl}>Emoji</div><input value={a.em} onChange={e=>updAct(a.id,"em",e.target.value)} style={{...ais,textAlign:"center",fontSize:20}}/></div>
                      <div><div style={lbl}>Nombre</div><input value={a.nombre} onChange={e=>updAct(a.id,"nombre",e.target.value)} placeholder="Visita a la Gran Muralla" style={ais}/></div>
                    </div>
                    <div><div style={lbl}>Descripción</div><input value={a.desc} onChange={e=>updAct(a.id,"desc",e.target.value)} placeholder="Incluido en el precio" style={ais}/></div>
                  </div>
                ))}
                <button onClick={addAct} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Añadir actividad</button>
              </>
            )}
          </div>
        )}

        {/* INCLUYE */}
        {tab==="incluye"&&(
          <div>
            <div style={secStyle}>QUÉ INCLUYE</div>
            {incluye.map(it=>(
              <div key={it.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                <input value={it.em} onChange={e=>updInc(it.id,"em",e.target.value)} style={{...ais,width:50,textAlign:"center",fontSize:18,flex:"none",padding:"10px 4px"}}/>
                <input value={it.txt} onChange={e=>updInc(it.id,"txt",e.target.value)} placeholder="Elemento incluido" style={{...ais,flex:1}}/>
                <button onClick={()=>removeInc(it.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer",flexShrink:0}}>×</button>
              </div>
            ))}
            <button onClick={addInc} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:16}}>+ Añadir elemento</button>
            <div style={secStyle}>CONDICIONES / NOTAS</div>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={4} style={{...ais,resize:"vertical",lineHeight:1.5}}/>
          </div>
        )}

        {/* PRECIOS */}
        {tab==="precios"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{...secStyle,flex:1}}>DESGLOSE DE PRECIOS</div>
              <input type="checkbox" checked={preciosEnabled} onChange={e=>setPreciosEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/>
            </div>
            {preciosEnabled&&(
              <>
                {precios.map(p=>(
                  <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 28px",gap:8,marginBottom:8,alignItems:"center"}}>
                    <input value={p.concepto} onChange={e=>updPrecio(p.id,"concepto",e.target.value)} placeholder="Concepto" style={ais}/>
                    <input value={p.importe} onChange={e=>updPrecio(p.id,"importe",e.target.value)} placeholder="0" inputMode="decimal" style={ais}/>
                    <button onClick={()=>removePrecio(p.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer"}}>×</button>
                  </div>
                ))}
                <button onClick={addPrecio} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:12}}>+ Añadir concepto</button>
                <div style={{background:A.card2,borderRadius:10,padding:12,marginBottom:12,border:`1px solid ${A.border}`}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:hasDesc?12:0}}>
                    <input type="checkbox" checked={hasDesc} onChange={e=>setHasDesc(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/>
                    <span style={{fontFamily:BF,fontSize:12,color:A.muted,textTransform:"uppercase",letterSpacing:1}}>Aplicar descuento</span>
                  </label>
                  {hasDesc&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 120px",gap:8,marginTop:0}}>
                      <input value={descConc} onChange={e=>setDescConc(e.target.value)} placeholder="Concepto descuento" style={ais}/>
                      <input value={descImp} onChange={e=>setDescImp(e.target.value)} placeholder="Importe" inputMode="decimal" style={ais}/>
                    </div>
                  )}
                </div>
                <div style={{background:`${accentColor}12`,border:`1px solid ${accentColor}30`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>TOTAL ESTIMADO</div>
                  <div style={{fontFamily:ANTON,fontSize:28,color:accentColor,letterSpacing:1}}>{sym}{total.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style={{fontFamily:BF,fontSize:11,color:A.muted,marginTop:2}}>{paxN} pasajero{paxN>1?"s":""} · IVA incluido</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* DISEÑO */}
        {tab==="diseno"&&(
          <div>
            <div style={secStyle}>COLOR ACENTO</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
              {PALETA.map(({c,l})=>(
                <button key={c} onClick={()=>setAccentColor(c)} title={l}
                  style={{width:36,height:36,borderRadius:"50%",background:c,border:accentColor===c?"3px solid #fff":"3px solid transparent",cursor:"pointer",transition:"all .15s",transform:accentColor===c?"scale(1.2)":"scale(1)"}}/>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <div style={lbl}>Color personalizado</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} style={{width:44,height:44,borderRadius:8,border:`1px solid ${A.border}`,background:"transparent",cursor:"pointer",padding:2}}/>
                <input value={accentColor} onChange={e=>setAccentColor(e.target.value)} style={{...ais,fontFamily:"monospace",flex:1}}/>
              </div>
            </div>

            <div style={secStyle}>VISTA PREVIA</div>
            <QuoteCard/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              <button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),border:`1px solid ${A.gold}44`,fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳ Generando...":"⬇️ Descargar PDF"}</button>
              <button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),border:"1px solid #25D36644",fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳...":"💬 Enviar por WA"}</button>
            </div>
          </div>
        )}

        {/* Floating preview (not in diseño tab) */}
        {tab!=="diseno"&&(
          <div style={{marginTop:20}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>VISTA PREVIA EN TIEMPO REAL</div>
            <QuoteCard/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
              <button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),border:`1px solid ${A.gold}44`,fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳ Generando...":"⬇️ Descargar PDF"}</button>
              <button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),border:"1px solid #25D36644",fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳...":"💬 Enviar por WA"}</button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden element for PDF */}
      <div style={{position:"fixed",left:-9999,top:0,width:390,pointerEvents:"none",zIndex:-1}}>
        <div ref={preRef}><QuoteCard forPDF={true}/></div>
      </div>

      {monMenu&&<CurrencyMenu current={moneda} onSelect={c=>{setMoneda(c);setMonMenu(false);}} onClose={()=>setMonMenu(false)}/>}
    </div>
  );
}
