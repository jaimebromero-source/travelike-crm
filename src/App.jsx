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
    const { data, error } = await supabase.rpc("tl_verify_and_login", { input_pin: pin
    if (error) return { status: "error", msg: error.message };
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) { return { status: "error", msg: e.message }; }
};
const verifySessionToken = async (token, type = "admin") => {
  if (!token || typeof token !== "string" || token === "true") return false;
  try {
    const { data } = await supabase.rpc("tl_verify_session", { input_token: token, tok
    return !!data;
  } catch { return false; }
};
const logoutSessionToken = async (token) => {
  if (!token || token === "true") return;
  try { await supabase.rpc("tl_logout_session", { input_token: token }); } catch {}
};
// GEMINI eliminado — se usa Claude API
// La key va en .env como VITE_CLAUDE_KEY
const callClaude = async (b64, mime, prompt) => {
  const isImg = mime?.startsWith("image/");
  const isPDF = mime === "application/pdf";
  const contentParts = [];
  if (b64 && (isImg || isPDF)) {
    // Anthropic solo acepta: image/jpeg, image/png, image/gif, image/webp
    // Normalizamos cualquier otro tipo de imagen a image/jpeg para evitar error 400
 , pin_t
en_type
￼    const SUPPORTED_IMG = ["image/jpeg","image/png","image/gif","image/webp"];
    const safeMime = isImg
      ? (SUPPORTED_IMG.includes(mime) ? mime : "image/jpeg")
      : mime; // PDFs se dejan tal cual
    contentParts.push({ type: isImg ? "image" : "document", source: { type: "base64",
}
contentParts.push({ type: "text", text: prompt });
// Proxy de Netlify — la API de Anthropic bloquea llamadas directas desde el nave const resp = await fetch("/.netlify/functions/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600, messag
;)}  
  const data = await resp.json();
  if (data.error) {
    console.error("[callClaude] Error de Anthropic:", JSON.stringify(data.error));
    throw new Error(data.error.message || JSON.stringify(data.error));
}  
  return data.content?.[0]?.text || "";
;}
const ONESIGNAL_APP_ID = "3737bebb-bec5-4427-b663-881160aef464";
const BANK_IBAN = "ES48 0128 0690 9001 0008 6284";
const BANK_TITULAR = "TraveLike";
const WA_NUM = "34600000000";
const CURRENCIES = [
{ code:"EUR",symbol:"€",name:"Euro" },{ code:"USD",symbol:"$",name:"Dólar US" },{ co { code:"JPY",symbol:"¥",name:"Yen japonés" },{ code:"CHF",symbol:"Fr",name:"Franco s { code:"NOK",symbol:"kr",name:"Corona noruega" },{ code:"DKK",symbol:"kr",name:"Coro { code:"CZK",symbol:"Kč",name:"Corona checa" },{ code:"HUF",symbol:"Ft",name:"Forint { code:"BGN",symbol:"лв",name:"Lev búlgaro" },{ code:"HRK",symbol:"kn",name:"Kuna cr { code:"ISK",symbol:"kr",name:"Corona islandesa" },{ code:"MXN",symbol:"$",name:"Pes { code:"BRL",symbol:"R$",name:"Real brasileño" },{ code:"COP",symbol:"$",name:"Peso { code:"PEN",symbol:"S/",name:"Sol peruano" },{ code:"UYU",symbol:"$U",name:"Peso ur { code:"PYG",symbol:"₲",name:"Guaraní paraguayo" },{ code:"GTQ",symbol:"Q",name:"Que { code:"DOP",symbol:"RD$",name:"Peso dominicano" },{ code:"AUD",symbol:"A$",name:"Dó { code:"NZD",symbol:"NZ$",name:"Dólar neozelandés" },{ code:"TRY",symbol:"₺",name:"L { code:"SAR",symbol:"ر.س",name:"Riyal saudí" },{ code:"QAR",symbol:"ر.ق",name:"Riyal { code:"BHD",symbol:".د.ب",name:"Dinar bareiní" },{ code:"OMR",symbol:"ر.ع",name:"Ri { code:"ILS",symbol:"₪",name:"Séquel israelí" },{ code:"ZAR",symbol:"R",name:"Rand s { code:"EGP",symbol:"£",name:"Libra egipcia" },{ code:"TND",symbol:"د.ت",name:"Dinar { code:"NGN",symbol:"₦",name:"Naira nigeriana" },{ code:"GHS",symbol:"₵",name:"Cedi { code:"TZS",symbol:"Tsh",name:"Chelín tanzano" },{ code:"INR",symbol:"₹",name:"Rupi { code:"BDT",symbol:"৳",name:"Taka bangladesí" },{ code:"LKR",symbol:"Rs",name:"Rupi { code:"CNY",symbol:"¥",name:"Yuan chino" },{ code:"KRW",symbol:"₩",name:"Won corean { code:"HKD",symbol:"HK$",name:"Dólar hongkonés" },{ code:"SGD",symbol:"S$",name:"Dó
￼media_t
gador
es: [{
de:"GBP
uizo" }
na dane
o húnga
oata" }
o mexic
colombi
uguayo"
tzal gu
lar aus
ira tur
 catarí
yal oma
udafric
 tuneci
ghanés"
a india
a de Sr
o" },{
lar sin
(
￼{ code:"THB",symbol:"฿",name:"Baht tailandés" },{ code:"VND",symbol:"₫",name:"Dong v { code:"PHP",symbol:"₱",name:"Peso filipino" },{ code:"MMK",symbol:"K",name:"Kyat bi { code:"LAK",symbol:"₭",name:"Kip laosiano" },{ code:"BND",symbol:"B$",name:"Dólar d { code:"KZT",symbol:"₸",name:"Tenge kazajo" },{ code:"UZS",symbol:"so'm",name:"Som u { code:"AMD",symbol:"֏",name:"Dram armenio" },{ code:"AZN",symbol:"₼",name:"Manat az { code:"RUB",symbol:"₽",name:"Rublo ruso" },{ code:"BYN",symbol:"Br",name:"Rublo bie { code:"MKD",symbol:"ден",name:"Denar macedonio" },{ code:"ALL",symbol:"L",name:"Lek { code:"IQD",symbol:"ع.د",name:"Dinar iraquí" },{ code:"IRR",symbol:"ریال",name:"Rial i { code:"MUR",symbol:"Rs",name:"Rupia mauriciana" },{ code:"XOF",symbol:"CFA",name:"F { code:"CDF",symbol:"FC",name:"Franco congoleño" },{ code:"MZN",symbol:"MT",name:"Me { code:"BWP",symbol:"P",name:"Pula botsuanesa" },{ code:"NAD",symbol:"N$",name:"Dóla { code:"DZD",symbol:"دج",name:"Dinar argelino" },{ code:"LYD",symbol:"ل.د",name:"Din { code:"SOS",symbol:"Sh",name:"Chelín somalí" },{ code:"RWF",symbol:"Fr",name:"Franc { code:"HTG",symbol:"G",name:"Gourde haitiano" },{ code:"JMD",symbol:"J$",name:"Dóla { code:"BBD",symbol:"Bds$",name:"Dólar de Barbados" },{ code:"FJD",symbol:"FJ$",name { code:"WST",symbol:"T",name:"Tālā samoano" },
;]
const getCurrencySymbol = code => CURRENCIES.find(c=>c.code===code)?.symbol||code;
const A = {
  bg:"#07070f", card:"#0f1824", card2:"#172030", border:"#1e3a5f",
  text:"#e6e6e6", muted:"#8a9bb3", cyan:"#00F0FF", orange:"#FF9500",
  green:"#34C759", red:"#FF3B30", gold:"#FFD700", purple:"#BF5AF2", lightblue:"#4FC3F7
;}
const ANTON = "'Anton', sans-serif";
const BF = "'Barlow Condensed', sans-serif";
const ais = { width:"100%",background:A.bg,border:`1px solid ${A.border}`,borderRadius
const ab = (bg,fg) => ({ background:bg,border:"none",color:fg||"#fff",borderRadius:12,
const MES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MES_F = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Sept
const NOW = new Date();
const CUR = `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;
const ROOMS = {
  doble_jun: { label:"
  doble_sep: { label:"
  individual:{ label:"
  triple:    { label:"
  cuadruple: { label:"
  busca:     { label:"
;}
Doble cama junta", short:"Doble Junta", cap:2, color:A.cyan }
Doble camas sep.", short:"Doble Sep.", cap:2, color:A.lightbl
Individual", short:"Individual", cap:1, color:A.orange },
Triple", short:"Triple", cap:3, color:A.gold },
Cuádruple", short:"Cuádruple", cap:4, color:A.purple },
Busca compañero/a", short:"Busca", cap:2, color:"#FF6B6B" }
￼￼￼￼￼￼const FORMAS_PAGO = [
{k:"transferencia",icon:" ",label:"Transferencia"}, {k:"tarjeta",icon:" ",label:"Tarjeta"}, {k:"vip",icon:" ",label:"DescuentoVIP"}
￼￼￼ietnam
rmano"
e Bruné
zbeko"
erbaiy
lorruso
 albané
raní" }
ranco C
tical m
r namib
ar libi
o ruand
r jamai
:"Dólar
"
:10,pad
padding
iembre"
,
ue },
i
a
 ];
const GASTO_TIPOS = [
{k:"vuelo",icon:" ",label:"Vuelo"},{k:"hotel",icon:" ",label:"Hotel"}, {k:"traslado",icon:" ",label:"Traslado"},{k:"guia",icon:" ",label:"Guía"}, {k:"seguro",icon:" ",label:"Seguro"},{k:"restaurante",icon:" ",label:"Resta {k:"actividad",icon:" ",label:"Actividad"},{k:"propina",icon:" ",label:"Pro {k:"otros",icon:" ",label:"Otros"}
];
const ST = [
{key:"interesado",label:"Interesado",emoji:" ",color:"#FF9500"}, {key:"confirmado",label:"Confirmado",emoji:" ",color:"#34C759"}, {key:"pagado",label:"Pagado",emoji:" ",color:"#00F0FF"}, {key:"cancelado",label:"Cancelado",emoji:" ",color:"#e8002a"}
];
const ST_SELECT = ST.filter(s=>s.key!=="pagado");
const CRM_TABS = [
{key:"people",icon:" ",label:"Viajeros"}, {key:"pagos",icon:" ",label:"Pagos"}, {key:"finanzas",icon:" ",label:"Finanzas"}, {key:"ai",icon:" ",label:"IADocs"}, {key:"notes",icon:" ",label:"Notas"}, {key:"edit",icon:" ",label:"Editar"}
];
const EDIT_SECS = [
{k:"general",icon:" ",label:"General"},{k:"vuelos",icon:" ",label:"Vuelos" {k:"docs",icon:" ",label:"Docs"},{k:"pagos",icon:" ",label:"Pagos"}, {k:"info",icon:" ",label:"Info"},{k:"hotels",icon:" ",label:"Hoteles"}, {k:"maleta",icon:" ",label:"Maleta"},{k:"emerg",icon:" ",label:"SOS"}, {k:"survey",icon:" ",label:"Encuesta"}
];
constSURVEY_EMOJIS=[" "," "," "," "," "];
const SURVEY_LABELS = ["Muy malo","Malo","Regular","Bueno","Excelente"]; const SURVEY_HLS = [
                                     { k:"cultura", l:"
  { k:"aloj", l:"
  { k:"activ", l:"
  { k:"org", l:"
];
const DEFAULT_SURVEY_CATS = [
{key:"viaje",label:"Experienciaglobal",icon:" ",tipo:"rating"}, {key:"guia",label:"Guía/Organización",icon:" ",tipo:"rating"}, {key:"hotel",label:"Alojamientos",icon:" ",tipo:"rating"}
Cultura" },{ k:"gastro", l:" Gastronomía" }, Alojamiento" },{ k:"grupo", l:" El grupo" },
Actividades" },{ k:"paisajes", l:" Paisajes" }, Organización" },{ k:"precio", l:" Precio/calidad" }
         urante pina"
},
" }
 ];
const DEFAULT_IMPRESCINDIBLES = [
  "Pasaporte / DNI vigente","Billete de avión (impreso o digital)","Seguro de viaje",
  "Tarjeta bancaria / efectivo","Cargador del móvil","Medicación habitual","Tarjeta eS
];
const DEFAULT_MALETA_CATS = [
{id:"ropa",icon:" ",label:"Ropa",items:["Camisetas(x5)","Pantalónlargo(x2)", {id:"calzado",icon:" ",label:"Calzado",items:["Zapatillascómodas","Sandalias/C {id:"aseo",icon:" ",label:"Aseo",items:["Cepillodedientes+pasta","Champúy {id:"tech",icon:" ",label:"Tecnología",items:["Adaptadordeenchufe","Cámarade {id:"docs",icon:" ",label:"Documentos",items:["Fotocopiasdedocumentos","Certi {id:"varios",icon:" ",label:"Varios",items:["Gafasdesol","Paraguaspequeño","
];
const DEFAULT_TEMPLATES = [
{id:"pago",emoji:" ",title:"Recordatoriodepago",body:"Tienesunpagopendient {id:"vuelos",emoji:" ",title:"Tusvuelosestándisponibles",body:"Yapuedesdes {id:"docs",emoji:" ",title:"Documentaciónlista",body:"Tudocumentacióndeviaj {id:"nuevo",emoji:" ",title:"Nuevoviajedisponible",body:"Tenemosalgoespecia {id:"pasaporte",emoji:" ",title:"Revisatupasaporte",body:"Recuerdacomprobar
];
const uid = () => Math.random().toString(36).slice(2,10);
const genCode = () => Math.random().toString(36).slice(2,8).toUpperCase();
const fmt = d => { if(!d) return ""; const [y,m]=d.split("-"); return `${MES[+m-1]} ${
const isPast = d => d < CUR;
const parseISO = s => { if(!s) return null; try { const d=new Date(s); return isNaN(d.
// Convierte YYYY-MM-DD → DD-MM-YYYY (para mostrar en el input)
const isoToDisplay = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{4})-(\d
// Convierte DD-MM-YYYY → YYYY-MM-DD (para guardar en BD/estado)
const displayToISO = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{2})-(\d
const daysDiff = s => { const d=parseISO(s); return d?Math.ceil((d-NOW)/864e5):null; }
const isUrgent = s => { const n=daysDiff(s); return n!==null&&n>=0&&n<7; };
const isOverdue = s => { const n=daysDiff(s); return n!==null&&n<0; };
const daysUntilExpiry = s => { if(!s) return null; const d=parseISO(s); return d?Math.
const passportWarn = s => { const d=daysUntilExpiry(s); return d!=null&&d<=180; };
const matchSearch = (s,q) => !q||!q.trim()||s.toLowerCase().includes(q.toLowerCase().t
const fileToB64 = file => new Promise((res,rej) => { const r=new FileReader(); r.onloa
const emptyHotel = () => ({ id:uid(), nombre:"", direccion:"", fechasEstancia:"" });
const emptyEmergencias = () => ({ policia:"", ambulancia:"", bomberos:"", tourleader:"
const emptyT = () => ({
  vuelos:[], docs:[],
  pagosConfig:[
           { label:"Reserva", fecha:"", fechaISO:"", importe:"" },
IM / Ro
"Panta
hancla
gel (t
 fotos
ficado
Botell
e para
cargar
e ya e
l prep
que tu
y}`; };
getTime
{2})-(\
{2})-(\ ;
ceil((d
rim());
d=()=>r
" });
l s a " s a
s a
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
  } catch(e) { console.error("[OneSignal proxy] Fetch error:", e); return { success: f
};
if (typeof document!=="undefined" && !document.getElementById("tl-f")) {
  const l=document.createElement("link"); l.id="tl-f"; l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css?family=Anton&family=Barlow+Condensed:400,70
  document.head.appendChild(l);
}
const mem = {};
alse, e
0&displ
 const stripBinary = (k, v) => {
  if (k !== SK_C && k !== SK_T) return v;
  if (!Array.isArray(v)) return v;
  return v.map(item => {
    const stripped = { ...item };
    if (stripped.passportPhotos) stripped.passportPhotos = [];
    if (stripped.facturas) stripped.facturas = (stripped.facturas || []).map(f => ({ .
    return stripped;
}); };
const mergeBinary = (k, supaVal, localVal) => {
  if ((k !== SK_C && k !== SK_T) || !Array.isArray(supaVal) || !Array.isArray(localVal
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
    try { const r = localStorage.getItem(k); if (r) localVal = JSON.parse(r); } catch
    try {
      const { data, error } = await supabase.from("travelike_store").select("value").e
      if (!error && data?.value) {
        const supaVal = data.value;
        if (localVal) return mergeBinary(k, supaVal, localVal);
        return supaVal;
      }
    } catch {}
    if (localVal) return localVal;
    return mem[k] ?? null;
..f, da
)) retu
{} q("key"
   },
  async set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    mem[k] = v;
    try {
      const stripped = stripBinary(k, v);
      await supabase.from("travelike_store").upsert({ key: k, value: stripped, updated
    } catch {}
} };
let _jsPDFInstance = null;
const loadJsPDF = () => new Promise(resolve => {
  if (_jsPDFInstance) return resolve(_jsPDFInstance);
  if (window.jspdf?.jsPDF) { _jsPDFInstance = window.jspdf.jsPDF; return resolve(_jsPD
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
  } else { doc.setFontSize(14); doc.setTextColor(100); doc.text("Factura: " + fa.nombr
  const num = facturaImporteNum(fa.nombre);
  const pdfName = (num ? num : fa.nombre.replace(/\.[^.]+$/, "")) + ".pdf";
  doc.save(pdfName);
};
const DT = [{
id:"t_nyc",name:"NuevaYork&Washington",date:"2026-12",flag:" ",price:2190,c webUrl:"", fechas:"1 - 8 Diciembre 2026",
vuelos:[{ id:"v1", nombre:"IDA - Madrid > Nueva York (IB6251)", archivo:"IB6251_Bill docs:[{ id:"d1", nombre:"Seguro médico de viaje", archivo:"Poliza_seguro.pdf" }], pagosConfig:[
    { label:"Reserva", fecha:"15 Ago 2026", fechaISO:"2026-08-15", importe:"500€" },
    { label:"Resto", fecha:"1 Nov 2026", fechaISO:"2026-11-01", importe:"1690€" }
  ],
 _at: ne
FInstan
e, 10,
urrenc
ete.pdf
y
  info:[{icono:" ",titulo:"Enchufes",texto:"TipoA/B.Voltaje120V.Necesitasadap hotels:[{ id:"h1", nombre:"The New Yorker Hotel", direccion:"481 8th Ave, Nueva York emergencias:{ policia:"911", ambulancia:"911", bomberos:"911", tourleader:"+34 60000 surveyEnabled:false, surveyConfig:{ categories:[...DEFAULT_SURVEY_CATS], surveyRespo maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES], maletaCats:DEFAULT_MALETA_CATS.map(c=>({...c,items:[...c.items]})),
  gastos:[], facturas:[], facturasVenta:[]
}];
const DC = [
  { id:"c11", nombre:"Carmen García", email:"carmen@email.com", tripId:"t_nyc", code:"
  { id:"c12", nombre:"Antonio Rodríguez", email:"antonio@email.com", tripId:"t_nyc", c
];
function AModal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000CC",display:"flex",align
      <div style={{ background:A.card2,borderRadius:"20px 20px 0 0",padding:"20px",wid
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center
          <span style={{ fontFamily:ANTON,fontSize:18,color:A.text,letterSpacing:1,tex
          <button onClick={onClose} style={{ background:"transparent",border:"none",co
</div>
        {children}
      </div>
</div> );
}
function ARow({ children }) { return <div style={{ display:"flex",gap:10,marginTop:10
function AEmpty({ text }) { return <div style={{ textAlign:"center",color:A.muted,font
function CopyBtn({ text, label, style }) {
  const [ok,setOk]=React.useState(false);
  const hasLabel = !!label;
  return (
    <button onClick={e=>{ e.stopPropagation(); navigator.clipboard.writeText(text||"")
      style={hasLabel
        ? { flexShrink:0,background:ok?A.green+"22":A.cyan+"22",border:`1px solid ${ok
: { background:ok?"#22c55e22":"transparent",border:"1px solid "+(ok?"#22c55e": {hasLabel ? (ok?"¡Copiado!":label) : (ok?"✓":"⎘")}
</button> );
}
function PassportImageViewer({ src }) {
  const [zoom, setZoom] = React.useState(1);
  const [rot, setRot]   = React.useState(0);
  const [pan, setPan]   = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
tador.
, NY 10
0000" }
nses:[]
CRM123"
ode:"AN
Items:"
th:"100
",margi
tTransf
lor:A.m
}}>{chi
Size:14
.then((
?A.gree
"#fffff
"
 const dragStart = React.useRef(null);
const lastPan   = React.useRef({ x: 0, y: 0 });
const isZ = zoom > 1;
const zoomIn  = e => { e.stopPropagation(); setZoom(z => Math.min(5, +(z + 0.5).toFi
const zoomOut = e => { e.stopPropagation(); const n = Math.max(1, +(zoom - 0.5).toFi
const rotate  = e => { e.stopPropagation(); setRot(r => (r + 90) % 360); };
const reset   = e => { e.stopPropagation(); setZoom(1); setRot(0); setPan({ x: 0, y:
// Drag solo sobre la imagen — NO llama preventDefault para no robar foco a inputs
const onImgDown = e => {
  if (!isZ) return;
  // No llamamos e.preventDefault() — así los inputs siguen recibiendo foco
  setDragging(true);
  dragStart.current = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.cur
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
  <div style={{ background: "#000", display: "flex", flexDirection: "column", height
    {/* Barra de controles — stopPropagation para que clicks aquí no activen drag */
    <div onPointerDown={e => e.stopPropagation()} style={{ display: "flex", gap: 8,
      <button onClick={zoomOut} disabled={zoom <= 1} style={{ background: "rgba(255,
      <button onClick={zoomIn}  disabled={zoom >= 5} style={{ background: "rgba(255,
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "mono
      <button onClick={rotate} style={{ background: "rgba(255,255,255,0.1)", border:
      {(zoom > 1 || rot > 0) && <button onClick={reset} style={{ background: "rgba(2
    </div>
    {/* Área de imagen — ocupa todo el espacio disponible */}
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "c
      <img
        src={src}
        draggable={false}
        onPointerDown={onImgDown}
        onPointerMove={onImgMove}
        onPointerUp={onImgUp}
xed(2))
xed(2))
0 });
rent.y
: "100%
}
padding
255,255
255,255
space",
 "none"
55,200,
enter",
           onPointerLeave={onImgUp}
          onWheel={onImgWheel}
          style={{
            maxWidth: isZ ? "none" : "100%",
            maxHeight: isZ ? "none" : "100%",
            objectFit: "contain",
            borderRadius: isZ ? 0 : 8,
            boxShadow: "0 0 40px rgba(0,200,255,0.15)",
            transform: `rotate(${rot}deg) scale(${zoom}) translate(${pan.x / zoom}px,$
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.15s ease",
            cursor: isZ ? (dragging ? "grabbing" : "grab") : "default",
            touchAction: isZ ? "none" : "auto",
}}
          alt="Pasaporte"
        />
        {isZ && <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, text
      </div>
</div> );
}
// Modal de pasaporte extraído como componente propio para que sus inputs
// tengan estado local y NO se remonten al re-renderizar el padre
function PassportModal({ modal, onClose, onSave, onChangePhoto, onDelete }) {
  const [docNum, setDocNum] = React.useState(modal.docNum || "");
  const [expiry, setExpiry] = React.useState(modal.expiry || "");
  const [birthDate, setBirthDate] = React.useState(modal.birthDate || "");
  const handleDateInput = (setter) => (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    let fmt = digits;
    if (digits.length > 2) fmt = digits.slice(0, 2) + "-" + digits.slice(2);
    if (digits.length > 4) fmt = digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" +
    setter(fmt);
  };
  const handleExpiry = handleDateInput(setExpiry);
  return (
    // Layout fijo: el contenedor NO scrollea — la imagen arriba, campos abajo, todo v
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-betw
        <div style={{ fontFamily: ANTON, fontSize: 18, color: "#fff", letterSpacing: 1
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href={modal.src} download="pasaporte.jpg" target="_blank" rel="noreferrer
            style={{ background: A.gold + "22", border: `1px solid ${A.gold}44`, borde
{pan.y
Align:
digits
isible
9, back
een", p
 }}>{mo
" rRadius
     <button onClick={onClose}
      style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${A.borde
  </div>
</div>
{/* Visor zoom/rotación — ocupa el espacio disponible entre la barra y los campo
<div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
  <PassportImageViewer src={modal.src} />
</div>
{/* Campos editables — siempre visibles abajo, sin que el teclado los empuje */}
<div style={{ background: "#0a0a12", borderTop: `2px solid ${A.cyan}33`, padding
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin
    <div>
      <div style={{ fontFamily: BF, fontSize: 9, color: A.cyan, letterSpacing: 2
      <input
        value={docNum}
        onChange={e => setDocNum(e.target.value.toUpperCase())}
        onFocus={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        placeholder="ABC123456"
        autoComplete="off"
        style={{ ...ais, fontFamily: ANTON, fontSize: 18, letterSpacing: 2, text
/> </div>
    <div>
      <div style={{ fontFamily: BF, fontSize: 9, color: A.orange, letterSpacing:
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
        style={{ ...ais, fontFamily: ANTON, fontSize: 16, textAlign: "center", c
/> </div>
  </div>
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontFamily: BF, fontSize: 9, color: A.gold, letterSpacing: 2.5
    <input
      value={birthDate}
      onChange={handleDateInput(setBirthDate)}
      onFocus={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      placeholder="DD-MM-AAAA"
r}`, bo
s */}
: "14px
Bottom:
.5, tex
Align:
2.5, t
olor: A
, textT
     inputMode="numeric"
    type="text"
    autoComplete="off"
    maxLength={10}
    style={{ ...ais, fontFamily: ANTON, fontSize: 16, textAlign: "center", col
/> </div>
<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
  <button onClick={() => onSave(docNum, expiry, birthDate)}
    style={{ background: `linear-gradient(90deg,${A.cyan},#00a8cc)`, border: "
       Guardar
  </button>
  <button onClick={onChangePhoto} style={{ background: A.purple + "22", border
           <button onClick={onDelete}
        </div>
      </div>
    </div>
); }
style={{ background: A.red + "22",
border
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
  dragStart.current = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.cur
};
const handlePointerMove = e => {
  if (!dragging) return;
  const nx = e.clientX - dragStart.current.x;
  const ny = e.clientY - dragStart.current.y;
  lastPan.current = { x: nx, y: ny };
  setPan({ x: nx, y: ny });
or: A.g
none",
: `1px : `1px
rent.y
 };
const handlePointerUp = () => setDragging(false);
const zoomIn = e => { e.stopPropagation(); setZoom(z => Math.min(5, z + 0.5)); };
const zoomOut = e => { e.stopPropagation(); const next = Math.max(1, zoom - 0.5); se
const rotate = e => { e.stopPropagation(); setRot(r => (r + 90) % 360); };
const reset = e => { e.stopPropagation(); setZoom(1); setRot(0); setPan({ x: 0, y: 0
return ( <div
    onClick={!isZoomed ? onClose : undefined}
    onWheel={handleWheel}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onPointerLeave={handlePointerUp}
    style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:10000,dis
    {/* Controls bar */}
    <div onClick={e=>e.stopPropagation()} style={{ display:"flex",alignItems:"center
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={zoomOut} disabled={zoom<=1} style={{ background:"rgba(255,2
        <button onClick={zoomIn} disabled={zoom>=5} style={{ background:"rgba(255,25
        <div style={{ display:"flex",alignItems:"center",color:"rgba(255,255,255,0.5
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={rotate} style={{ background:"rgba(255,255,255,0.12)",border
        {(zoom>1||rot>0) && <button onClick={reset} style={{ background:"rgba(255,20
        <button onClick={e=>{e.stopPropagation();onClose();}} style={{ background:"r
      </div>
    </div>
    {/* Image area */}
    <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
      <img
        src={src}
        draggable={false}
        style={{
          maxWidth: isZoomed ? "none" : "100%",
          maxHeight: isZoomed ? "none" : "calc(100vh - 60px)",
          objectFit:"contain",
          transform:`rotate(${rot}deg) scale(${zoom}) translate(${pan.x/zoom}px,${pa
          transformOrigin:"center center",
          transition: dragging ? "none" : "transform 0.15s ease",
          cursor: isZoomed ? (dragging ? "grabbing" : "grab") : "default",
          borderRadius: 4,
}}
        alt="Pasaporte"
      />
tZoom(n
 }); la
play:"f
",justi
55,255,
5,255,0
)",font
:"none"
0,71,0.
gba(255
overflo
n.y/zoo
 </div>
      {isZoomed && <div style={{ textAlign:"center",padding:"6px 0 10px",fontSize:11,c
    </div>
); }
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position:"relative",marginBottom:12 }}>
      <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeho
      {value && <button onClick={()=>onChange("")} style={{ position:"absolute",right:
</div> );
}
function AmountPad({ value, onChange }) {
  const keys = ["1","2","3","4","5","6","7","8","9",".","0","<"];
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
      {keys.map((k,i)=>(
        <button key={i} onClick={()=>{ if(k==="<") onChange(value.slice(0,-1)); else o
          style={{ background:A.card,border:`1px solid ${A.border}`,color:A.text,borde
))} </div>
); }
function NumPad({ title, subtitle, onSuccess, onCancel, correctPin, onVerifyAsync, pin
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
olor:"r
",fontS
lder||"
8,top:"
nChange
rRadius
Length
         if (result === true || result?.status === "ok") { onSuccess(result?.token); }
        else if (result?.status === "locked") { setLockMsg(`Bloqueado ${result.minutes
        else { setErr(true); if (result?.remaining !== undefined) setLockMsg(`${result
      } else if (correctPin) {
        if (next === correctPin) onSuccess();
        else { setErr(true); setTimeout(() => { setVal(""); setErr(false); }, 800); }
} }
};
  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","<"]];
  return (
    <div style={{ position:"fixed",inset:0,background:"#000000EE",display:"flex",align
      <div style={{ background:A.card2,borderRadius:"20px 20px 0 0",padding:"24px",wid
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1,text
          {subtitle && <div style={{ fontSize:13,color:A.muted,fontFamily:BF,marginTop
          <div style={{ display:"flex",gap:12,justifyContent:"center",marginTop:20 }}>
            {Array.from({length:len}).map((_,i)=>(
              <div key={i} style={{ width:14,height:14,borderRadius:"50%",background:l
))} </div>
          {loading && <div style={{ color:A.muted,fontSize:13,marginTop:8,fontFamily:B
          {err && !loading && <div style={{ color:A.red,fontSize:13,marginTop:8,fontWe
          {lockMsg && !err && <div style={{ color:A.orange,fontSize:13,marginTop:8,fon
        </div>
        {KEYS.map((row,ri)=>(
          <div key={ri} style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",ga
            {row.map((k,ki)=>(
              <button key={ki} onClick={()=>{ if(k==="<") setVal(v=>v.slice(0,-1)); el
                disabled={loading || !!lockMsg}
                style={{ background:k===""?"transparent":A.card,border:k===""?"none":`
))} </div>
))}
        <button onClick={onCancel} style={{ width:"100%",background:"transparent",bord
      </div>
</div> );
}
function RatingRow({ label, icon, value, onChange }) {
  return (
    <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBottom:
      <div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginBottom:10,letterSpac
      <div style={{ display:"flex",gap:4 }}>
{SURVEY_EMOJIS.map((em,i)=>(
 || 30}
.remain
Items:"
th:"100
Transfo
:4 }}>{
oading?
F }}>Ve
ight:70
tWeight
p:10,ma
se if(k
1px sol
er:"non
10,bord
ing:2,t
           <button key={i} onClick={()=>onChange(i+1)}
            style={{ flex:1,background:value===i+1?A.gold+"22":A.card,border:`1px soli
            <span style={{ fontSize:22 }}>{em}</span>
            <span style={{ fontFamily:BF,fontSize:7,color:value===i+1?A.gold:A.muted,t
          </button>
        ))}
      </div>
    </div>
); }
function RoomMenu({ current, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex"
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:2
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTr
        {Object.entries(ROOMS).map(([k,r])=>(
          <button key={k} onClick={()=>{ onSelect(k); onClose(); }}
style={{ display:"flex",alignItems:"center",justifyContent:"space-between" <span style={{ fontFamily:BF,fontSize:15,color:current===k?r.color:"#fff", {current===k && <span style={{ color:r.color,fontSize:18 }}>✓</span>}
          </button>
        ))}
        <button onClick={onClose} style={{ ...ab(A.card,A.muted),width:"100%",marginTo
      </div>
</div> );
}
function FormaPagoMenu({ current, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:2
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTr
        {FORMAS_PAGO.map(f=>(
          <button key={f.k} onClick={()=>{ onSelect(f.k); onClose(); }}
style={{ display:"flex",alignItems:"center",gap:14,width:"100%",background <span style={{ fontSize:24 }}>{f.icon}</span>
<span style={{ fontFamily:BF,fontSize:16,color:current===f.k?A.cyan:"#fff" {current===f.k && <span style={{ color:A.cyan,fontSize:18 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
); }
d ${val
extTran
,alignI
0,width
ansform
,width:
fontWei
p:10,bo
",align
0,width
ansform
:curren
,fontWe
 function GastoTipoMenu({ current, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:2
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTr
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
          {GASTO_TIPOS.map(t=>(
            <button key={t.k} onClick={()=>{ onSelect(t.k); onClose(); }}
              style={{ background:current===t.k?A.orange+"22":A.card,border:`1px solid
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontFamily:BF,fontSize:11,color:current===t.k?A.orange:A.
            </button>
          ))}
        </div>
      </div>
</div> );
}
function CurrencyMenu({ current, onSelect, onClose }) {
  const [q,setQ]=useState("");
  const list = q.trim() ? CURRENCIES.filter(c=>c.code.toLowerCase().includes(q.toLower
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex
      <div onClick={e=>e.stopPropagation()} style={{ background:A.card2,borderRadius:"
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTr
        <SearchBar value={q} onChange={setQ} placeholder="Buscar divisa..." />
        <div style={{ overflowY:"auto",flex:1 }}>
          {list.map(c=>(
            <button key={c.code} onClick={()=>{ onSelect(c.code); onClose(); }}
              style={{ display:"flex",alignItems:"center",gap:12,width:"100%",backgrou
              <span style={{ fontFamily:ANTON,fontSize:16,color:current===c.code?A.gol
              <div style={{ flex:1,textAlign:"left" }}>
                <div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:current==
                <div style={{ fontSize:11,color:A.muted,fontFamily:BF }}>{c.name}</div
              </div>
{current===c.code && <span style={{ color:A.gold }}>✓</span>} </button>
))} </div>
      </div>
    </div>
); }
function FilteredListModal({ title, clients, onClose }) {
  const [search,setSearch]=useState("");
",align
0,width
ansform
 ${curr
muted,t
Case())
",align
20px 20
ansform
nd:curr
d:A.cya
=c.code >
   const displayed = search.trim() ? clients.filter(c=>matchSearch(c.nombre,search)||ma
  return (
    <AModal title={title} onClose={onClose}>
      {clients.length>5 && <SearchBar value={search} onChange={setSearch} placeholder=
      {displayed.length===0 && <AEmpty text={search?"Sin resultados":"Sin viajeros"} /
      {displayed.map(c=>(
        <div key={c.id} style={{ background:A.bg,borderRadius:12,padding:"10px 14px",m
          <div style={{ width:36,height:36,borderRadius:8,background:A.cyan+"22",displ
            {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:A.text }}>{c.
            {c._sub && <div style={{ fontSize:11,color:A.orange,fontFamily:BF,marginTo
          </div>
</div> ))}
</AModal> );
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
    if(client&&pc[pidx]){ const imp=(client.pagosImporteCustom||[])[pidx]||pc[pidx].im
  },[cid,pidx]);
  const handleSave=()=>{
    if(!monto||!cid) return;
    sC(clients.map(c=>{ if(c.id!==cid) return c; const ae=[...(c.pagosEstado||pc.map((
    onClose();
  };
  const currentFP=FORMAS_PAGO.find(f=>f.k===metodo)||FORMAS_PAGO[0];
  return (
    <AModal title="Registrar Pago" onClose={onClose}>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTran
        <select value={cid} onChange={e=>setCid(e.target.value)} style={ais}>{tc.map(c
      </div>
tchSear
"Buscar >}
arginBo
ay:"fle
100%",o
nombre}
p:2 }}>
porte||
)=>"pen
sform:"
=><opti
       <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:1
        <div>
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTr
          <select value={pidx} onChange={e=>setPidx(Number(e.target.value))} style={ai
        </div>
        <div>
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTr
          <button onClick={()=>setMetodoMenu(true)} style={{ ...ais,display:"flex",jus
            <span>{currentFP.icon} {currentFP.label}</span><span style={{ color:A.mute
          </button>
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTran
        <div style={{ background:A.card,border:`1px solid ${A.border}`,borderRadius:10
      </div>
      <AmountPad value={monto} onChange={setMonto} />
      <button onClick={handleSave} disabled={!monto} style={{ ...ab(A.cyan,A.bg),width
      {metodoMenu && <FormaPagoMenu current={metodo} onSelect={setMetodo} onClose={()=
</AModal> );
}
function ExpenseStats({ gastos }) {
  if (!gastos?.length) return null;
  const byTipo = {};
  gastos.forEach(g=>{ const key=g.tipo||"otros"; if(!byTipo[key]) byTipo[key]=0; byTip
  const total = Object.values(byTipo).reduce((a,b)=>a+b,0);
  if (!total) return null;
  const sorted = Object.entries(byTipo).sort((a,b)=>b[1]-a[1]);
  const colors = [A.orange,A.cyan,A.gold,A.green,A.purple,A.lightblue,A.red,"#FF6B6B",
  return (
    <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBottom:
      <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,textTran
      {sorted.map(([tipo,amount],i)=>{
        const ti=GASTO_TIPOS.find(t=>t.k===tipo)||GASTO_TIPOS[GASTO_TIPOS.length-1];
        const pct = total>0?(amount/total*100):0;
        const col = colors[i%colors.length];
        return (
          <div key={tipo} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"ce
              <span style={{ fontFamily:BF,fontSize:13,color:A.muted }}>{ti.icon} {ti.
              <div style={{ textAlign:"right" }}>
                <span style={{ fontFamily:ANTON,fontSize:13,color:col }}>{amount.toLoc
                <span style={{ fontFamily:BF,fontSize:11,color:A.muted,marginLeft:6 }}
              </div>
</div>
6 }}>
ansform
s}>{pc.
ansform
tifyCon
d }}>›<
sform:"
,paddin
:"100%"
>setMet
o[key]+
"#00CED
14,bord
sform:"
nter",m
label}<
aleStri
>({pct.
 <div style={{ height:8,background:A.border,borderRadius:4 }}>
  <div style={{ height:"100%",width:`${pct}%`,background:col,borderRadius:
            </div>
          </div>
); })}
</div> );
}
export default function App() {
  const [screen,setScreen]=useState("splash");
  const [trips,setTrips]=useState([]);
  const [clients,setClients]=useState([]);
  const [crm,setCrm]=useState({});
  const [cfg,setCfg]=useState({ quickTripId:null,quickBtnLabel:"
  const [nav,setNav]=useState({});
  const [adminOk,setAdminOk]=useState(false);
  const [adminToken,setAdminToken]=useState(null);
  useEffect(()=>{
    (async()=>{
Ver gastos",quickBt
 let t=await db.get(SK_T); let c=await db.get(SK_C);
let cr=await db.get(SK_CRM); let cf=await db.get(SK_CFG);
const savedToken=await db.get(SK_ADMIN);
if(!t){ t=DT; await db.set(SK_T,t); }
if(!c){ c=DC; await db.set(SK_C,c); }
if(!cr){ cr={}; await db.set(SK_CRM,cr); }
if(!cf){ cf={ quickTripId:null,quickBtnLabel:" Ver gastos",quickBtnColor:A.ora const tt=t.map(tr=>({ hotels:[],emergencias:emptyEmergencias(),surveyEnabled:fal const cc=c.map(cl=>({ personalDocs:[],roommateId:null,acompanantes:[],tripId:nul setTrips(tt); setClients(cc); setCrm(cr); setCfg(cf);
let admValid = false;
if (savedToken && savedToken !== "true" && savedToken !== true) {
      admValid = await verifySessionToken(savedToken, "admin");
      if (!admValid) await db.set(SK_ADMIN, null);
    }
if (admValid) { setAdminOk(true); setAdminToken(savedToken); }
const h=window.location.hash.slice(1);
if(h){ const cl=cc.find(x=>x.code===h); if(cl){ await db.set(SK_SES,{code:cl.cod // FIX: sesión cliente tiene prioridad sobre token admin (evita que admin vea const ses=await db.get(SK_SES);
if(ses?.code){ const cl=cc.find(x=>x.code===ses.code); if(cl){ setNav({cid:cl.id if (admValid) return setScreen("ahome");
setScreen("home");
})(); },[]);
  4,trans
nColor
nge };
se,surv
l,passp
e}); se panel
}); ret
:
   const sT=async v=>{ setTrips(v); await db.set(SK_T,v); };
  const sC=async v=>{ setClients(v); await db.set(SK_C,v); };
  const sCrm=async v=>{ setCrm(v); await db.set(SK_CRM,v); };
  const sCfg=async v=>{ setCfg(v); await db.set(SK_CFG,v); };
  const go=(s,x)=>{ setNav(n=>({...n,...(x||{})})); setScreen(s); };
  const goClient=async cl=>{ await db.set(SK_SES,{code:cl.code}); go(cl.firstLogin?"pa
  const logout=async()=>{ await db.set(SK_SES,null); go("home"); };
  const logoutAdmin=async()=>{ await logoutSessionToken(adminToken); await db.set(SK_A
  const loginAdmin=async(token)=>{ setAdminOk(true); setAdminToken(token); await db.se
  if(screen==="splash") return <Splash />;
  if(screen==="home") return <Home go={go} goClient={goClient} clients={clients} />;
  if(screen==="pin") return <PinScreen go={go} onOk={loginAdmin} alreadyOk={adminOk} /
  if(screen==="ahome") return <AHome go={go} trips={trips} clients={clients} sT={sT} s
  if(screen==="atrip") return <ATrip go={go} tid={nav.tid} initTab={nav.initTab} trips
  if(screen==="passport") return <Passport go={go} cid={nav.cid} clients={clients} set
  if(screen==="notifprompt") return <NotifPrompt go={go} cid={nav.cid} clients={client
  if(screen==="client") return <Client go={go} cid={nav.cid} clients={clients} trips={
  return <Home go={go} goClient={goClient} clients={clients} />;
}
function Splash() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"1
      <div style={{ fontFamily:ANTON,fontSize:48,color:A.cyan,letterSpacing:4 }}>TRAVE
      <div style={{ color:A.muted,fontSize:12,fontFamily:BF,letterSpacing:6,textTransf
</div> );
}
function Home({ go, goClient, clients }) {
  const [code,setCode]=useState(""); const [err,setErr]=useState(false);
  const [taps,setTaps]=useState(0); const timer=useRef();
  const [savedClient,setSavedClient]=useState(null);
  const tap=()=>{ const n=taps+1; setTaps(n); clearTimeout(timer.current); if(n>=5) go
  const enter=()=>{ const c=code.trim().toUpperCase(); const cl=clients.find(x=>x.code
  useEffect(()=>{
    try { const ses=localStorage.getItem("tv9-session"); if(ses){ const p=JSON.parse(s
  },[clients]);
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",displ
      <div onClick={tap} style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3
        <div style={{ fontFamily:ANTON,fontSize:52,color:"#fff",letterSpacing:3,lineHe
        <div style={{ fontFamily:BF,fontSize:11,letterSpacing:7,color:A.muted,textTran
</div>
ssport"
DMIN,nu
t(SK_AD
>;
C={sC}
={trips
Clients
s} sC={
trips}
00vh",b
LIKE</d
orm:"up
("pin")
===c);
es); if
ay:"fle
d 60%,#
ight:1
sform:"
       <div style={{ flex:1,padding:"40px 28px" }}>
        {savedClient && (
          <div style={{ background:A.cyan+"15",border:`1px solid ${A.cyan}33`,borderRa
            <div style={{ width:44,height:44,borderRadius:10,background:A.cyan+"22",di
              {savedClient.passportPhoto?<img src={savedClient.passportPhoto} style={{
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,te
              <div style={{ fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:0.
            </div>
            <button onClick={()=>goClient(savedClient)} style={{ background:`linear-gr
          </div>
        )}
        <div style={{ fontFamily:ANTON,fontSize:28,letterSpacing:1,color:"#fff",margin
        <div style={{ fontSize:16,color:A.muted,marginBottom:28,lineHeight:1.6,fontFam
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyD
          style={{ width:"100%",padding:"22px 20px",fontSize:32,textAlign:"center",bac
        {err && <div style={{ color:A.red,fontSize:16,fontWeight:700,marginBottom:16,t
        <button onClick={enter} style={{ width:"100%",padding:"18px",border:"none",bor
      </div>
    </div>
); }
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
    else if (result.status === "locked") { setStatus("locked"); setMsg(`Demasiados int
    else if (result.status === "invalid") { setStatus("error"); const r = result.remai
    else { setStatus("error"); setMsg("Error de conexión. Comprueba tu red."); setTime
};
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",paddi
<divstyle={{fontSize:48,marginBottom:16}}> </div>
<div style={{ fontFamily:ANTON,fontSize:36,letterSpacing:2,color:"#fff",marginBo <div style={{ fontSize:13,color:A.muted,marginBottom:40,letterSpacing:2 }}>ACCES {status==="locked" ? (
 dius:16
splay:"
 width:
xtTrans
5,overf
adient(
Bottom:
ily:BF
own={e=
kground
extAlig
derRadi
entos.
ning; s
out(()
ng:"60p
ttom:8
O RESTR
 <div style={{ background:A.red+"18",border:`1px solid ${A.red}44`,borderRadius <divstyle={{fontSize:40,marginBottom:12}}> </div>
<div style={{ fontFamily:ANTON,fontSize:20,color:A.red,marginBottom:8 }}>ACC <div style={{ fontSize:14,color:A.muted,lineHeight:1.7 }}>{msg}</div>
</div> ):(
        <>
          <input type="password" value={pin} onChange={e=>{ setPin(e.target.value); if
            style={{ width:"100%",padding:"22px",fontSize:32,textAlign:"center",backgr
          {status==="error" && <div style={{ color:A.red,fontSize:13,marginBottom:16,f
          {status==="idle" && <div style={{ fontSize:12,color:A.muted,marginBottom:16
          {status==="loading" && <div style={{ fontSize:13,color:A.muted,marginBottom:
          <button onClick={tryPin} disabled={status==="loading"||!pin.trim()} style={{
            {status==="loading"?"Verificando...":"ENTRAR"}
          </button>
</> )}
      <button onClick={()=>go("home")} style={{ background:"none",border:"none",color:
    </div>
); }
function AHome({ go, trips, clients, sT, sC, cfg, sCfg, logoutAdmin }) {
  const [subScreen,setSubScreen]=useState(null);
  const [cfgModal,setCfgModal]=useState(false);
  const [addTripModal,setAddTripModal]=useState(false);
  const [passModal,setPassModal]=useState(false);
  const [tripName,setTripName]=useState(""); const [tripFlag,setTripFlag]=useState("
  const [tripMonth,setTripMonth]=useState(String(NOW.getMonth()+1)); const [tripYear,s
  const [tripPrice,setTripPrice]=useState(""); const [tripFechas,setTripFechas]=useSta
  const [tripWebUrl,setTripWebUrl]=useState(""); const [tripCurrency,setTripCurrency]=
  const [currMenu,setCurrMenu]=useState(false);
  const up=trips.filter(t=>!isPast(t.date)).sort((a,b)=>a.date.localeCompare(b.date));
  const hist=trips.filter(t=>isPast(t.date)).sort((a,b)=>b.date.localeCompare(a.date))
  const passWarn=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpiryDi
  const quickTrip=cfg.quickTripId?trips.find(t=>t.id===cfg.quickTripId):null;
  const totalViajeros=clients.length;
  const totalConfirmados=clients.filter(c=>c.status==="confirmado"||c.status==="pagado
const addTrip=()=>{
if(!tripName.trim()||tripYear.length!==4) return;
const date=`${tripYear}-${String(tripMonth).padStart(2,"0")}`; sT([...trips,{id:`t${uid()}`,name:tripName.trim(),flag:tripFlag||" ",date,price: setAddTripModal(false);setTripName("");setTripFlag(" ");setTripMonth(String(NO
  };
  const delTrip=id=>{ if(!window.confirm("¿Eliminar viaje? Los clientes se conservarán
   :16,pad
ESO BLO
(status
ound:A.
ontWeig
}}>5 in
16 }}>V
width:
A.muted
");
etTripY
te("");
useStat
; smissed
").leng
tripPr
W.getM
en tu
 i o
 const passWarnList=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpi // NUEVO: pasaportes que caducan en menos de 1 año (365 días)
const passExpireYear=clients.filter(c=>{ const d=daysUntilExpiry(c.passportExpiry);
if(subScreen==="clients") return (
  <div style={{ background:A.bg,minHeight:"100vh" }}>
    <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"c
      <button onClick={()=>setSubScreen(null)} style={{ background:A.card2,border:`1
      <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1,textTr
</div>
    <ClientesTab clients={clients} trips={trips} sC={sC} />
  </div>
);
if(subScreen==="notifs") return (
  <div style={{ background:A.bg,minHeight:"100vh" }}>
    <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"c
      <button onClick={()=>setSubScreen(null)} style={{ background:A.card2,border:`1
      <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1,textTr
</div>
    <NotifAdmin trips={trips} clients={clients} />
  </div>
);
return (
  <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color
    <div style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-s
        <div>
          <div style={{ fontFamily:ANTON,fontSize:28,letterSpacing:2,color:"#fff",te
          <div style={{ fontSize:10,color:A.cyan,letterSpacing:4,textTransform:"uppe
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {passWarn>0 && <button onClick={()=>setPassModal(true)} style={{ backgroun
          <button onClick={logoutAdmin} style={{ background:A.card2,border:`1px soli
        </div>
      </div>
      <div style={{ display:"flex",gap:8,marginTop:8 }}>
        {[{l:"Próximos",v:up.length,c:A.cyan},{l:"Histórico",v:hist.length,c:A.muted
          <div key={item.l} style={{ flex:1,background:A.card2,borderRadius:10,paddi
            <div style={{ fontFamily:ANTON,fontSize:18,color:item.c,lineHeight:1 }}>
            <div style={{ fontSize:8,color:A.muted,letterSpacing:1,textTransform:"up
</div> ))}
      </div>
    </div>
    <div style={{ padding:"10px 16px 0" }}>
 ryDismi
return
enter",
px soli
ansform
enter",
px soli
ansform
:A.text
100%)",
tart",m
xtTrans
rcase",
d:A.red
d ${A.b
},{l:"V
ng:"7px
{item.v
percase
   {quickTrip?(
    <button onClick={()=>go("atrip",{tid:quickTrip.id,initTab:"finanzas"})} styl
      <span style={{ fontSize:24 }}>{quickTrip.flag}</span>
      <div style={{ flex:1,textAlign:"left" }}>
        <div style={{ fontFamily:ANTON,fontSize:14,color:cfg.quickBtnColor,lette
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,marginTop:1 }}>{qu
      </div>
      <div onClick={e=>{ e.stopPropagation(); setCfgModal(true); }} style={{ col
    </button>
  ):(
    <button onClick={()=>setCfgModal(true)} style={{ width:"100%",background:A.c
<spanstyle={{fontSize:18}}> </span>Añadirbotóndeaccesorápido </button>
)} </div>
<div style={{ padding:"12px 16px" }}>
{/* WIDGET: Pasaportes que caducan en menos de 1 año */} {passExpireYear.length>0&&(
    <div style={{ background:A.card,borderRadius:16,border:`2px solid ${A.red}66
      <div style={{ padding:"12px 14px 10px",background:`linear-gradient(90deg,$
<spanstyle={{fontSize:24}}> </span> <div style={{ flex:1 }}>
          <div style={{ fontFamily:ANTON,fontSize:14,color:A.red,letterSpacing:1
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,marginTop:1 }}>{
        </div>
      </div>
      {passExpireYear.map(c=>(
        <div key={c.id} style={{ display:"flex",alignItems:"center",gap:12,paddi
          <div style={{ width:32,height:32,borderRadius:8,background:A.card2,dis
            {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",he
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:"#fff",
            <div style={{ fontFamily:BF,fontSize:11,color:A.muted }}>Caduca: {c.
          </div>
<div style={{ fontFamily:ANTON,fontSize:14,letterSpacing:0.5,flexShrin {c._days<0?" VENCIDO":c._days===0?" HOY":c._days<=90?` ${c._da
          </div>
        </div>
))} </div>
)}
{[{icon:" ",label:"Clientes",desc:`${totalViajeros}registrados`,color:A.gre
{icon:" ",label:"Notificaciones",desc:"OneSignalpush",color:A.purple,acti ].map(item=>(
    <button key={item.label} onClick={item.action} style={{ width:"100%",backgro
      <div style={{ position:"absolute",top:-20,right:-20,width:80,height:80,bor
        e={{ wi
rSpacin
ickTrip
or:A.mu
ard2,bo
`,overf
{A.red}
,textTr
passExp
ng:"9px
play:"f
ight:"1
whiteSp
_dateSt
k:0,col
 ys}d`:
en,act
on:()=
und:A.c
derRadi
`
i >
       <div style={{ width:48,height:48,borderRadius:14,background:item.color+"22
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:ANTON,fontSize:18,color:item.color,letterSpacin
        <div style={{ fontFamily:BF,fontSize:12,color:A.muted }}>{item.desc}</di
      </div>
      <div style={{ color:item.color,fontSize:20 }}>›</div>
    </button>
  ))}
  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center
    <div style={{ fontFamily:ANTON,fontSize:14,color:A.text,letterSpacing:1,text
    <button onClick={()=>setAddTripModal(true)} style={{ ...ab(A.cyan+"22",A.cya
  </div>
  {up.length===0 && <div style={{ padding:"14px",color:A.muted,fontSize:13,fontF
  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom
    {up.map(t=>{ const tc=clients.filter(c=>c.tripId===t.id); const conf=tc.filt
      <div key={t.id} onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style=
        <button onClick={e=>{ e.stopPropagation(); delTrip(t.id); }} style={{ po
        <span style={{ fontSize:40,marginTop:4 }}>{t.flag}</span>
        <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,lineHeight:1.1 }
        <div style={{ fontSize:11,color:A.cyan,fontFamily:BF }}>{fmt(t.date)}</d
        <div style={{ fontSize:10,color:A.muted,fontFamily:BF,background:A.card2
</div> ); })}
  </div>
  {hist.length>0 && (
    <div style={{ padding:"12px 0" }}>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,text
      {hist.map(t=>(
        <div key={t.id} style={{ display:"flex",alignItems:"center",gap:10,paddi
          <span onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{ fon
          <div onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{ flex
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,marginRight:4 }}
          <button onClick={e=>{ e.stopPropagation(); delTrip(t.id); }} style={{
</div> ))}
</div> )}
</div>
{addTripModal && (
  <AModal title="Nuevo viaje" onClose={()=>setAddTripModal(false)}>
    <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:10,marginBot
      <input value={tripFlag} onChange={e=>setTripFlag(e.target.value)} style={{
      <input value={tripName} onChange={e=>setTripName(e.target.value)} placehol
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 88px",gap:10,marginBot
      <select value={tripMonth} onChange={e=>setTripMonth(e.target.value)} style
      <input value={tripYear} onChange={e=>setTripYear(e.target.value.replace(/\
",displ
g:1,tex v>
",paddi
Transfo
n),padd
amily:B
:20 }}>
er(c=>c
{{ back
sition:
}>{t.na
iv>
,paddin
Transfo
ng:"7px
tSize:1
:1,font
>{fmt(t
backgro
tom:10
 ...ais
der="No
tom:10
={ais}>
D/g,"")
           </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginBo
            <input value={tripPrice} onChange={e=>setTripPrice(e.target.value.replace(
            <button onClick={()=>setCurrMenu(true)} style={{ ...ais,cursor:"pointer",t
          </div>
          <input value={tripFechas} onChange={e=>setTripFechas(e.target.value)} placeh
          <input value={tripWebUrl} onChange={e=>setTripWebUrl(e.target.value)} placeh
          <ARow>
            <button onClick={()=>setAddTripModal(false)} style={{ ...ab(A.card2,A.mute
            <button onClick={addTrip} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Añadir</bu
          </ARow>
          {currMenu && <CurrencyMenu current={tripCurrency} onSelect={setTripCurrency}
        </AModal>
      )}
      {cfgModal && <QuickCfgModal cfg={cfg} trips={trips} sCfg={sCfg} onClose={()=>set
      {passModal && <FilteredListModal title="Alertas de pasaporte" clients={passWarnL
</div> );
}
function QuickCfgModal({ cfg, trips, sCfg, onClose }) {
const [label,setLabel]=useState(cfg.quickBtnLabel||" Ver gastos");
const [color,setColor]=useState(cfg.quickBtnColor||A.orange);
const [tripId,setTripId]=useState(cfg.quickTripId||"");
const save=()=>{ sCfg({ quickTripId:tripId||null,quickBtnLabel:label,quickBtnColor:c const COLORS=[A.orange,A.cyan,A.gold,A.green,A.red,A.purple,"#FF6B6B","#00CED1"]; return (
    <AModal title="Botón rápido" onClose={onClose}>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransf
      <input value={label} onChange={e=>setLabel(e.target.value)} style={{ ...ais,marg
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransf
      <select value={tripId} onChange={e=>setTripId(e.target.value)} style={{ ...ais,m
        <option value="">Sin asignar</option>
        {trips.map(t=><option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
      </select>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransf
      <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
        {COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{ width:36,hei
      </div>
      <ARow>
        <button onClick={onClose} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px s
        <button onClick={save} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Guardar</button>
      </ARow>
    </AModal>
); }
 ttom:10
/[^\d.]
extAlig
older="
older="
d),flex
tton>
onClos
CfgModa
ist} on
olor })
orm:"up
inBotto
orm:"up
arginBo
orm:"up
ght:36,
olid ${
 function ClientesTab({ clients, trips, sC }) {
  const [modal,setModal]=useState(false);
  const [personas,setPersonas]=useState([{nombre:"",email:""}]);
  const [copied,setCopied]=useState(null);
  const [filter,setFilter]=useState("all"); const [search,setSearch]=useState("");
  const [expandedDoc,setExpandedDoc]=useState(null);
  const getLink=c=>`${window.location.href.split("#")[0]}#${c.code}`;
  const openWA=c=>{ const link=getLink(c); const trip=c.tripId?trips.find(t=>t.id===c.
  const updC=(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
  const addClients=()=>{
    const valid=personas.filter(p=>p.nombre.trim());
    if(!valid.length) return;
    const groupId=valid.length>1?`g${uid()}`:null;
    const nuevos=valid.map(p=>({ id:`cl${uid()}`,nombre:p.nombre.trim(),email:p.email|
    sC([...clients,...nuevos]);
    setPersonas([{nombre:"",email:""}]); setModal(false);
  };
  const base=filter==="all"?clients:filter==="notrip"?clients.filter(c=>!c.tripId):cli
  const displayed=search.trim()?base.filter(c=>matchSearch(c.nombre,search)||matchSear
  const getFL=k=>{ if(k==="all") return `Todos (${clients.length})`; if(k==="notrip")
  return (
    <div style={{ padding:"12px 16px" }}>
      <div style={{ display:"flex",borderBottom:`1px solid ${A.border}`,background:A.c
        {[{k:"all"},{k:"notrip"},...trips.map(t=>({k:t.id}))].map(item=>(
          <button key={item.k} onClick={()=>setFilter(item.k)} style={{ flexShrink:0,b
))} </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o
      <button onClick={()=>setModal(true)} style={{ ...ab(A.cyan+"22",A.cyan),width:"1
      {displayed.length===0 && <AEmpty text={search?"Sin resultados":"Sin clientes"} /
      {displayed.map(c=>{
        const trip=c.tripId?trips.find(t=>t.id===c.tripId):null;
        const st=ST.find(s=>s.key===c.status)||ST[0];
        const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_PAG
        return (
          <div key={c.id} style={{ background:A.card,borderRadius:14,padding:"12px 14p
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}
              <div style={{ width:42,height:42,borderRadius:10,overflow:"hidden",backg
                {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",heig
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:ANTON,fontSize:15,color:A.text,whiteSpace:"no
                <div style={{ fontSize:10,color:trip?A.cyan:A.orange,fontFamily:BF }}>
              </div>
              <button onClick={()=>sC(clients.filter(x=>x.id!==c.id))} style={{ backgr
            </div>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
tripId)
|"",tri
ents.fi
ch(c.co
return
ard2,ov
ackgrou
código.
00%",bo
>}
O[0];
x",marg
>
round:A
ht:"100
wrap",o
{trip?`
ound:"t
   <span style={{ fontSize:9,color:A.muted,background:A.card2,padding:"4px
  <span style={{ fontSize:9,padding:"4px 8px",borderRadius:6,background:st
  <span style={{ fontSize:9,padding:"4px 8px",borderRadius:6,background:A.
</div>
<div style={{ display:"flex",gap:6 }}>
  <button onClick={()=>{ navigator.clipboard.writeText(getLink(c)).then(()
  <button onClick={()=>openWA(c)} style={{ ...ab(A.green+"22",A.green),fle
  <button onClick={()=>setExpandedDoc(expandedDoc===c.id?null:c.id)} style
</div>
{expandedDoc===c.id && (
  <div style={{ marginTop:10,background:A.bg,borderRadius:12,border:`1px s
    <div style={{ fontFamily:BF,fontSize:9,color:A.cyan,letterSpacing:2,te
    <div style={{ marginBottom:8 }}>
      <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2
      <input
        key={c.id+"_cdoc"}
        defaultValue={c.docNumero||""}
        onBlur={e=>updC(c.id,x=>({...x,docNumero:e.target.value.toUpperCas
        placeholder="ABC123456"
        style={{ ...ais,fontFamily:ANTON,fontSize:20,letterSpacing:3,textA
/> </div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margi
      <div>
        <div style={{ fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:
        <input
          key={c.id+"_cbday"}
          type="text" inputMode="numeric" placeholder="DD-MM-AAAA" maxLeng
          defaultValue={isoToDisplay(c.birthDate||"")}
          onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""); l
          onBlur={e=>updC(c.id,x=>({...x,birthDate:displayToISO(e.target.v
          style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,
/> </div>
      <div>
        <div style={{ fontFamily:BF,fontSize:9,color:passportWarn(c.passpo
        <input
          key={c.id+"_cexp"}
          type="text" inputMode="numeric" placeholder="DD-MM-AAAA" maxLeng
          defaultValue={isoToDisplay(c.passportExpiry||"")}
          onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""); l
          onBlur={e=>updC(c.id,x=>({...x,passportExpiry:displayToISO(e.tar
          style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,
/> </div>
    </div>
    {c.docNumero&&<div style={{ background:A.green+"10",border:`1px solid
8px",bo
.color+
cyan+"1
=>{ set
x:1,fon
={{ ...
olid ${
xtTrans
,textTr
e(),doc
lign:"c
nBottom
2,textT
th={10}
et fmt=
alue)})
color:A
rtExpir
th={10}
et fmt=
get.val
color:p
${A.gre
 </div> )}
</div> );
      })}
      {modal && (
        <AModal title="Nuevo cliente" onClose={()=>{ setModal(false); setPersonas([{no
          <div style={{ fontSize:13,color:A.muted,fontFamily:BF,marginBottom:14 }}>Pue
          {personas.map((p,i)=>(
            <div key={i} style={{ background:A.bg,borderRadius:12,padding:"12px",margi
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"
                <div style={{ fontFamily:BF,fontSize:10,color:i===0?A.cyan:A.purple,le
                {i>0&&<button onClick={()=>setPersonas(ps=>ps.filter((_,j)=>j!==i))} s
              </div>
              <input value={p.nombre} onChange={e=>setPersonas(ps=>ps.map((x,j)=>j===i
              <input value={p.email} onChange={e=>setPersonas(ps=>ps.map((x,j)=>j===i?
</div> ))}
          <button onClick={()=>setPersonas(ps=>[...ps,{nombre:"",email:""}])} style={{
          <ARow>
            <button onClick={()=>{ setModal(false); setPersonas([{nombre:"",email:""}]
            <button onClick={addClients} style={{ ...ab(A.cyan,A.bg),flex:2 }}>{person
          </ARow>
</AModal> )}
</div> );
}
function NotifAdmin({ trips, clients }) {
  const [mode,setMode]=useState("manual");
  const [templates,setTemplates]=useState(DEFAULT_TEMPLATES);
  const [editingId,setEditingId]=useState(null);
  const [notifTitle,setNotifTitle]=useState(""); const [notifBody,setNotifBody]=useSta
  const [notifTarget,setNotifTarget]=useState("all"); const [notifTripId,setNotifTripI
  const [sent,setSent]=useState(null); const [sending,setSending]=useState(false);
  const notifCount=clients.filter(c=>c.notifEnabled).length;
  const send=async(title,body,target,tripId)=>{
    setSending(true);
    let errorMsg = "";
    try {
      const filters = target === "trip" && tripId ? [{ field:"tag",key:"tripId",relati
      const result = await sendOneSignal(title, body, filters);
      const count = target==="all" ? clients.filter(c=>c.notifEnabled).length : client
      const ok = result.id && !result.errors;
      if (!ok) errorMsg = result.errors ? JSON.stringify(result.errors) : (result.erro
mbre:""
des reg
nBottom
center"
tterSpa
tyle={{
?{...x,
{...x,e
...ab(
); }} s
as.filt
te("");
d]=useS
on:"=",
s.filte
r || "S
     setSent({ title, count, ok, errorMsg, simulated: result.simulated });
  } catch(e) { setSent({ title, count:0, ok:false, errorMsg:e.message }); }
  setSending(false);
  setTimeout(()=>setSent(null),8000);
};
const handleSend=()=>{ if(!notifTitle.trim()||!notifBody.trim()) return; send(notifT
const updTemplate=(id,changes)=>setTemplates(ts=>ts.map(t=>t.id===id?{...t,...change
return (
  <div style={{ padding:"12px 16px" }}>
    {sent && (
      <div style={{ background:(sent.ok?A.green:A.red)+"22",border:`2px solid ${sent
        <div style={{ fontFamily:ANTON,fontSize:18,color:sent.ok?A.green:A.red,margi
        <div style={{ fontSize:13,color:A.muted }}>«{sent.title}»{sent.ok?` — ${sent
        {!sent.ok && sent.errorMsg && <div style={{ fontSize:11,color:A.red,marginTo
</div> )}
<div style={{ background:A.card2,borderRadius:12,padding:"12px 14px",marginBotto <divstyle={{fontSize:28}}> </div>
<div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:16,color:"#fff
    </div>
    <div style={{ display:"flex",background:A.card2,borderRadius:10,padding:4,margin
      {[{k:"manual",l:"Manual"},{k:"templates",l:"Plantillas"}].map(item=>(
        <button key={item.k} onClick={()=>setMode(item.k)} style={{ flex:1,backgroun
))} </div>
    {mode==="manual" && (
      <div>
        <input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeh
        <textarea value={notifBody} onChange={e=>setNotifBody(e.target.value)} place
        <div style={{ background:A.card2,borderRadius:10,padding:"12px",marginBottom
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,text
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {[{k:"all",l:"Todos"},...trips.map(t=>({k:t.id,l:`${t.flag} ${t.name.spl
          </div>
</div>
        <button onClick={handleSend} disabled={sending||!notifTitle.trim()||!notifBo
      </div>
    )}
    {mode==="templates" && (
      <div>
        {templates.map(t=>(
          <div key={t.id} style={{ background:A.card,borderRadius:12,padding:"14px",
            <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom
              <span style={{ fontSize:24,flexShrink:0 }}>{t.emoji}</span>
              <div style={{ flex:1 }}>
 {editingId===t.id?(
itle,no
s}:t));
.ok?A.g
nBottom
.count}
p:6,bac
m:14,bo
" }}>On
Bottom:
d:mode=
older="
holder=
:10,bor
Transfo
it(" ")
dy.trim
marginB
:10 }}>
                     <div><input value={t.title} onChange={e=>updTemplate(t.id,{title:e
                  ):(
                    <div><div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:
                  )}
</div>
                <button onClick={()=>setEditingId(editingId===t.id?null:t.id)} style={
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <select defaultValue="all" id={`sel-${t.id}`} style={{ ...ais,flex:1,f
                  <option value="all">Todos</option>
                  {trips.map(tr=><option key={tr.id} value={tr.id}>{tr.flag} {tr.name.
                </select>
                <button onClick={()=>{ const sel=document.getElementById(`sel-${t.id}`
                  style={{ ...ab(`linear-gradient(90deg,${A.red},#c00020)`,"#fff"),pad
              </div>
</div> ))}
</div> )}
</div> );
}
function ATrip({ go, tid, initTab, trips, clients, crm, sT, sC, sCrm }) {
  const trip=trips.find(t=>t.id===tid);
  const [tab,setTab]=useState(initTab||"menu");
  const [editSec,setEditSec]=useState(null);
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
  if(!trip) return <div style={{ padding:40,background:A.bg,color:A.muted,minHeight:"1
  const tc=clients.filter(c=>c.tripId===tid);
  const updTrip=async fn=>sT(trips.map(t=>t.id===tid?fn(t):t));
.target
A.text
{ backg
ontSize
split("
); cons
ding:"6
00vh",f
 const updClient=async(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
const addPass=(file,cid)=>{ const r=new FileReader(); r.onload=e=>updClient(cid,c=>(
const hasUrgent=c=>(trip.pagosConfig||[]).some((p,i)=>{ const st=(c.pagosEstado||[])
const setRoommate=async(aId,bId)=>{ sC(clients.map(c=>{ if(c.id===aId) return {...c,
// ─── PEOPLE TAB ───
const PeopleTab=()=>{
  const confirmed=tc.filter(c=>c.status==="confirmado"||c.status==="pagado");
  const interesados=tc.filter(c=>c.status==="interesado");
  const [listModal,setListModal]=useState(false); const [listView,setListView]=useSt
  const [copied2,setCopied2]=useState(false);
  const [addModal,setAddModal]=useState(null);
  const [newNombre,setNewNombre]=useState(""); const [newEmail,setNewEmail]=useState
  const [newPersonas,setNewPersonas]=useState([{nombre:"",email:""}]);
  const [exSearch,setExSearch]=useState("");
  const [exSelected,setExSelected]=useState([]);
  const allOtherClients=clients.filter(c=>c.tripId!==tid);
  const filteredEx=exSearch.trim()?allOtherClients.filter(c=>matchSearch(c.nombre,ex
  const roomCounts={};
  Object.keys(ROOMS).forEach(k=>{ roomCounts[k]=confirmed.filter(c=>(c.room||"doble_
  const buildList=()=>{
    if(!confirmed.length) return "Sin confirmados";
    const lines=[`${trip.flag} ${trip.name.toUpperCase()}`,`${fmt(trip.date)}`,`${co
    const byRoom={}; Object.keys(ROOMS).forEach(k=>{ byRoom[k]=[]; });
    confirmed.forEach(c=>{ const r=c.room||"doble_jun"; if(byRoom[r]) byRoom[r].push
    let hab=1;
    ["doble_jun","doble_sep"].forEach(rk=>{
      if(!byRoom[rk]?.length) return;
      const roomInfo=ROOMS[rk];
      lines.push(`${roomInfo.short.toUpperCase()} (${Math.ceil(byRoom[rk].length/2)}
      const seen=new Set();
      byRoom[rk].forEach(c=>{ if(seen.has(c.id)) return; seen.add(c.id); const partn
    });
    if(byRoom.individual?.length>0){ lines.push(`INDIVIDUAL (${byRoom.individual.len
    if(byRoom.triple?.length>0){ lines.push(`TRIPLE (${Math.ceil(byRoom.triple.lengt
    if(byRoom.cuadruple?.length>0){ lines.push(`CUÁDRUPLE (${Math.ceil(byRoom.cuadru
    if(byRoom.busca?.length>0){ lines.push(`BUSCA COMPAÑERO/A`); byRoom.busca.forEac
    return lines.join("\n");
  };
  const buildListI=()=>{ if(!interesados.length) return "Sin interesados"; return [`
  const buildFlightList=()=>{
if(!confirmed.length) return "Sin confirmados";
const lines=[` FLIGHT LIST — ${trip.name.toUpperCase()}`,`${fmt(trip.date)}`," const seen=new Set();
confirmed.forEach((c,i)=>{
 if(seen.has(c.id)) return; seen.add(c.id);
{...c,p
[i]; re
roommat
ate("co
("");
Search)
jun")==
nfirmed
(c); })
hab.)`
er=c.ro
gth})`)
h/3)} h
ple.len
h(c=>li
${trip.
","Nom
b
     const bday=c.birthDate?new Date(c.birthDate+"T12:00:00").toLocaleDateString("e
    const exp=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDate
    lines.push(`${lines.length-4}. ${c.nombre} | ${c.docNumero||"—"} | ${bday} | $
    // Compañeros de grupo que también están en este viaje
    if(c.groupId){
      confirmed.filter(x=>x.groupId===c.groupId&&x.id!==c.id).forEach(gm=>{
        if(seen.has(gm.id)) return; seen.add(gm.id);
        const gbday=gm.birthDate?new Date(gm.birthDate+"T12:00:00").toLocaleDateSt
        const gexp=gm.passportExpiry?new Date(gm.passportExpiry+"T12:00:00").toLoc
        lines.push(`   + ${gm.nombre} | ${gm.docNumero||"—"} | ${gbday} | ${gexp}`
}); }
    // Acompañantes legacy
    (c.acompanantes||[]).forEach(a=>{
      const abday=a.birthDate?new Date(a.birthDate+"T12:00:00").toLocaleDateString
      const aexp=a.passportExpiry?new Date(a.passportExpiry+"T12:00:00").toLocaleD
      lines.push(`   + ${a.nombre} | ${a.docNumero||"—"} | ${abday} | ${aexp}`);
}); });
  return lines.join("\n");
};
const currentList=listView==="confirmados"?buildList():listView==="interesados"?bu
return (
  <div style={{ padding:"0 16px" }}>
    <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:
    {confirmed.length>0 && (
      <div style={{ background:A.card2,borderRadius:14,padding:"12px 14px",marginB
        <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textT
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {Object.entries(ROOMS).map(([k,r])=>roomCounts[k]>0&&(
            <div key={k} style={{ background:r.color+"15",border:`1px solid ${r.co
              <div style={{ fontFamily:ANTON,fontSize:22,color:r.color,lineHeight:
                {(k==="doble_jun"||k==="doble_sep")?Math.ceil(roomCounts[k]/2):k==
</div>
              <div style={{ fontSize:8,color:r.color,letterSpacing:1,textTransform
            </div>
))} </div>
</div> )}
    <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBott
      {ST.map(s=>{ const n=tc.filter(c=>c.status===s.key).length; return (<div key
    </div>
    <div style={{ display:"flex",gap:8,marginBottom:12 }}>
      <button onClick={()=>setAddModal("new")} style={{ ...ab(A.cyan+"22",A.cyan),
      <button onClick={()=>setAddModal("existing")} style={{ ...ab(A.purple+"22",A
s-ES",{
String(
{exp}`)
ring("e
aleDate
);
("es-ES
ateStri
ildList
"none",
ottom:1
ransfor
lor}33`
1 }}>
="tripl
:"upper
om:10 }
={s.key
flex:2,
.purple
   {(confirmed.length>0||interesados.length>0) && <button onClick={()=>setListM
</div>
{tc.length===0?<AEmpty text="Sin viajeros aún" />:tc.map(c=>{
  const st=ST.find(s=>s.key===c.status)||ST[0];
  const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;
  const urgent=hasUrgent(c);
  const acCount=(c.acompanantes||[]).length;
  const roommate=c.roommateId?clients.find(x=>x.id===c.roommateId):null;
  const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_P
  return (
    <div key={c.id} style={{ background:A.card,borderRadius:14,padding:"12px 1
      {urgent && <div style={{ background:A.orange+"22",border:`1px solid ${A.
      {c.groupId && (()=>{
        const gMembers=tc.filter(x=>x.groupId===c.groupId&&x.id!==c.id);
        return gMembers.length>0?(<div style={{ background:A.purple+"15",borde
      })()}
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }
        <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto,c
          style={{ width:44,height:44,borderRadius:10,overflow:"hidden",cursor
          {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",he
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:ANTON,fontSize:16,color:A.text,whiteSpace:"
          <div style={{ fontSize:10,color:st.color,fontFamily:BF }}>{st.emoji}
        </div>
        <button onClick={()=>{ if(window.confirm(`¿Sacar a ${c.nombre} de este
      </div>
      <div style={{ display:"flex",gap:6,marginBottom:6,flexWrap:"wrap" }}>
        <button onClick={()=>setRoomMenu(c.id)} style={{ background:rm.color+"
        <select value={c.status} onChange={e=>updClient(c.id,x=>({...x,status:
          {ST_SELECT.map(s=><option key={s.key} value={s.key}>{s.emoji} {s.lab
        </select>
        <button onClick={()=>setFpMenu(c.id)} style={{ background:A.cyan+"15",
      </div>
      <div style={{ display:"flex",gap:6,marginBottom:6 }}>
        <button onClick={()=>go("client",{cid:c.id})} style={{ ...ab(A.purple+
        <button onClick={()=>setRmModal(c.id)} style={{ ...ab(roommate?A.cyan+
      </div>
      <input value={c.note||""} onChange={e=>updClient(c.id,x=>({...x,note:e.t
      {/* Link + WA por viajero */}
      <div style={{ display:"flex",gap:6,marginTop:6 }}>
        {(()=>{ const link=`${window.location.href.split("#")[0]}#${c.code}`;
      </div>
      {/* Firma de condiciones */}
      {c.consentDate && (
<div style={{ marginTop:6,background:A.green+"10",border:`1px solid ${ <spanstyle={{fontSize:12}}> </span>
 odal(tr
AGO[0];
4px",ma
orange}
r:`1px
}>
id:c.id
:"point
ight:"1
nowrap"
 {st.la
viaje?
22",bor
e.targe
el}</op
border:
"22",A.
"15":A.
arget.v
const [
A.green
     <div style={{ flex:1 }}>
      <span style={{ fontFamily:BF,fontSize:10,color:A.green,fontWeight:
      <span style={{ fontFamily:BF,fontSize:9,color:A.muted,marginLeft:8
    </div>
    <div style={{ display:"flex",gap:4 }}>
      {c.consentRGPD && <span style={{ fontSize:8,padding:"2px 5px",back
      {c.consentPasaporte && <span style={{ fontSize:8,padding:"2px 5px"
      {c.consentFoto && <span style={{ fontSize:8,padding:"2px 5px",back
    </div>
  </div>
)}
{!c.consentDate && !c.firstLogin && (
<div style={{ marginTop:6,background:A.orange+"10",border:`1px solid $ <span style={{ fontFamily:BF,fontSize:9,color:A.orange }}> Pendien
</div> )}
{/* ── PANEL DE VERIFICACIÓN ADMIN: foto + no doc + caducidad ── */}
<div style={{ marginTop:10,background:c.docVerified?A.green+"0e":A.bg,bo
  {/* Cabecera */}
  <div style={{ padding:"8px 12px",background:c.docVerified?A.green+"18"
<spanstyle={{fontSize:14}}> </span>
<span style={{ fontFamily:BF,fontSize:10,letterSpacing:2,textTransfo {c.docVerified
      ? <span style={{ fontFamily:BF,fontSize:9,color:A.green,fontWeight
      : c.docNumero
        ? <span style={{ fontFamily:BF,fontSize:9,color:A.orange,fontWei
        : <span style={{ fontFamily:BF,fontSize:9,color:A.muted }}>Sin d
    }
  </div>
  {/* Foto + datos lado a lado */}
  <div style={{ display:"flex",gap:12,padding:"12px" }}>
    {/* Foto del pasaporte */}
    <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto
      style={{ width:72,height:90,borderRadius:10,overflow:"hidden",curs
      {c.passportPhoto
        ? <img src={c.passportPhoto} style={{ width:"100%",height:"100%"
        : <div style={{ textAlign:"center" }}><div style={{ fontSize:24
      }
    </div>
    {/* Número, caducidad y nacimiento */}
    <div style={{ flex:1,minWidth:0 }}>
      <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing
      <input
        key={c.id+"_doc"}
        defaultValue={c.docNumero||""}
        onBlur={e=>updClient(c.id,x=>({...x,docNumero:e.target.value.toU
        placeholder="—"
  700 }}>
 }}>{ne
ground:
,backgr
ground:
{A.oran te de
rderRad
:A.card
rm:"upp
:700 }}
ght:700
atos</s
,cid:c.
or:"poi
,object }}> <
:2,text
pperCas
 f
/
               style={{ ...ais,fontFamily:ANTON,fontSize:26,letterSpacing:4,tex
            />
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }
              <div>
                <div style={{ fontFamily:BF,fontSize:9,color:A.gold,letterSpac
                <input
                  key={c.id+"_bday"}
                  type="text"
                  inputMode="numeric"
                  placeholder="DD-MM-AAAA"
                  defaultValue={isoToDisplay(c.birthDate||"")}
                  onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""
                  onBlur={e=>updClient(c.id,x=>({...x,birthDate:displayToISO(e
                  maxLength={10}
                  style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize
                />
</div> <div>
                <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpa
                <input
                  key={c.id+"_exp"}
                  type="text"
                  inputMode="numeric"
                  placeholder="DD-MM-AAAA"
                  defaultValue={isoToDisplay(c.passportExpiry||"")}
                  onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""
                  onBlur={e=>updClient(c.id,x=>({...x,passportExpiry:displayTo
                  maxLength={10}
                  style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize
                />
              </div>
            </div>
          </div>
        </div>
        {/* Checkbox de verificación */}
        <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"poin
          <input type="checkbox" checked={!!c.docVerified} onChange={e=>updCli
          <span style={{ fontFamily:BF,fontSize:12,color:c.docVerified?A.green
        </label>
      </div>
    </div>
); })}
<input ref={passRef} type="file" accept="image/*" capture="environment" style=
{passModal && (
  <PassportModal
    modal={passModal}
tAlign:
}>
ing:2,t
); let
.target
:13,col
cing:2,
); let
ISO(e.t
:13,col
ter",pa
ent(c.i
:A.mute
{{ disp
     onClose={() => setPassModal(null)}
    onSave={(docNum, expiry, birthDate) => {
      updClient(passModal.cid, c => ({ ...c, docNumero: docNum, passportExpiry
      setPassModal(null);
    }}
    onChangePhoto={() => { chPassRef.current.value = ""; chPassRef.current.cli
    onDelete={() => { updClient(passModal.cid, c => ({ ...c, passportPhoto: nu
  />
)}
{listModal && (
  <div style={{ position:"fixed",inset:0,zIndex:2000,background:A.bg,display:"
    {/* HEADER */}
    <div style={{ position:"sticky",top:0,zIndex:10,background:A.bg,borderBott
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14
        <button onClick={()=>setListModal(false)} style={{ background:"transpa
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacin
          <div style={{ fontFamily:BF,fontSize:11,color:A.muted }}>{fmt(trip.d
        </div>
        <button onClick={()=>{ navigator.clipboard.writeText(currentList).then
      </div>
<div style={{ display:"flex",gap:6,paddingBottom:0 }}> {[["confirmados"," ","Rooming",A.green,confirmed.length],["vuelo","
          <button key={key} onClick={()=>{ setListView(key); setCopied2(false)
            {ic} {lbl}{cnt!=null?` (${cnt})`:""}</button>
))} </div>
</div>
    {/* ROOMING LIST */}
    {listView==="confirmados" && (
      <div style={{ padding:"20px 20px 120px" }}>
        <div style={{ fontFamily:BF,fontSize:12,color:A.muted,letterSpacing:2,
        {(()=>{
          const byRoom={};
          Object.keys(ROOMS).forEach(k=>{ byRoom[k]=[]; });
          confirmed.forEach(c=>{ const r=c.room||"doble_jun"; if(byRoom[r]) by
          let hab=1;
          const rows=[];
          ["doble_jun","doble_sep"].forEach(rk=>{
            if(!byRoom[rk]?.length) return;
            const roomInfo=ROOMS[rk];
            rows.push(
              <div key={rk+"_hdr"} style={{ display:"flex",alignItems:"center"
                <div style={{ width:4,height:22,background:roomInfo.color,bord
                <div style={{ fontFamily:ANTON,fontSize:15,color:roomInfo.colo
                <div style={{ fontFamily:BF,fontSize:12,color:A.muted }}>{Math
 : displ
ck(); }
ll, doc
flex",f
om:`1px
}}>
rent",b
g:1 }}>
ate)}</
(()=>{
","Fli ; }} st
textTra
Room[r]
,gap:10
erRadiu
r,lette
.ceil(b
 g
 </div> );
  const seen=new Set();
  byRoom[rk].forEach(c=>{
    if(seen.has(c.id)) return; seen.add(c.id);
    const partner=c.roommateId?byRoom[rk].find(x=>x.id===c.roommateI
    if(partner&&!seen.has(partner.id)) seen.add(partner.id);
    const habNum=hab++;
    rows.push(
      <div key={c.id} style={{ background:A.card,borderRadius:16,mar
        <div style={{ background:`linear-gradient(90deg,${roomInfo.c
          <span style={{ fontFamily:ANTON,fontSize:13,color:roomInfo
        </div>
        <div style={{ padding:"14px 18px",display:"flex",flexDirecti
          {[c,...(partner?[partner]:[])].map((p,pi)=>(
            <div key={p.id} style={{ display:"flex",alignItems:"cent
              <div style={{ width:46,height:46,borderRadius:12,overf
                {p.passportPhoto?<img src={p.passportPhoto} style={{
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:ANTON,fontSize:20,color:A.t
                {pi===1&&<div style={{ fontFamily:BF,fontSize:11,col
              </div>
              <CopyBtn text={p.nombre} />
            </div>
))} </div>
</div> );
}); });
["individual","triple","cuadruple","busca"].forEach(rk=>{
  if(!byRoom[rk]?.length) return;
  const roomInfo=ROOMS[rk];
  rows.push(
    <div key={rk+"_hdr"} style={{ display:"flex",alignItems:"center"
      <div style={{ width:4,height:22,background:roomInfo.color,bord
      <div style={{ fontFamily:ANTON,fontSize:15,color:roomInfo.colo
      <div style={{ fontFamily:BF,fontSize:12,color:A.muted }}>{byRo
</div> );
  if(rk==="triple"||rk==="cuadruple"){
    const cap=rk==="triple"?3:4;
    const groups=[]; let g=[];
    byRoom[rk].forEach(c=>{ g.push(c); if(g.length===cap){groups.pus
    if(g.length) groups.push(g);
groups.forEach((grp,gi)=>{
d):null
ginBott
olor}18
.color,
on:"col
er",gap
low:"hi
width:"
ext,lin
or:A.mu
,gap:10
erRadiu
r,lette
om[rk].
h([...g
             rows.push(
              <div key={rk+gi} style={{ background:A.card,borderRadius:16,
                <div style={{ background:`linear-gradient(90deg,${roomInfo
                  <span style={{ fontFamily:ANTON,fontSize:13,color:roomIn
                </div>
                <div style={{ padding:"14px 18px",display:"flex",flexDirec
                  {grp.map(p=>(
                    <div key={p.id} style={{ display:"flex",alignItems:"ce
                      <div style={{ width:46,height:46,borderRadius:12,ove
                        {p.passportPhoto?<img src={p.passportPhoto} style=
                      </div>
                      <div style={{ fontFamily:ANTON,fontSize:20,color:A.t
                      <CopyBtn text={p.nombre} />
</div> ))}
                </div>
              </div>
); });
        } else {
          byRoom[rk].forEach(c=>{
            rows.push(
              <div key={c.id} style={{ background:A.card,borderRadius:16,m
                <div style={{ width:46,height:46,borderRadius:12,overflow:
                  {c.passportPhoto?<img src={c.passportPhoto} style={{widt
                </div>
                <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,fl
                <CopyBtn text={c.nombre} />
                <span style={{ fontFamily:BF,fontSize:11,color:roomInfo.co
</div> );
}); }
});
      return rows;
    })()}
</div> )}
{/* FLIGHT LIST */}
{listView==="vuelo" && (
  <div style={{ padding:"20px 20px 120px" }}>
    {(()=>{
      const seen=new Set();
      const rows=[];
      let num=1;
      confirmed.forEach((c)=>{
marginB
.color}
fo.colo
tion:"c
nter",g
rflow:"
{{width
ext,fle
arginBo
"hidden
h:"100%
ex:1 }}
lor,bac
 });
if(seen.has(c.id)) return; seen.add(c.id);
// Grupo: este viajero + sus compañeros de grupo en el mismo viaje
const groupPax=[c,...(c.groupId?confirmed.filter(x=>x.groupId===c.
  .concat((c.acompanantes||[]).map(a=>({...a,isLegacyAcomp:true,is
groupPax.forEach(x=>{ if(x.id&&x.id!==c.id) seen.add(x.id); });
groupPax.forEach((p,pi)=>{
  const pbday=p.birthDate?new Date(p.birthDate+"T12:00:00").toLoca
  const pexp=p.passportExpiry?new Date(p.passportExpiry+"T12:00:00
  const pexpWarn=passportWarn(p.passportExpiry);
  const isGroup=pi>0&&!p.isLegacyAcomp;
  rows.push(
    <div key={p.id||c.id+"-"+pi} style={{ background:A.card,border
      <div style={{ padding:"12px 18px",borderBottom:`1px solid ${
        <div style={{ fontFamily:ANTON,fontSize:28,color:A.cyan,li
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:ANTON,fontSize:22,color:A.text,
          {pi>0&&<div style={{ fontFamily:BF,fontSize:11,color:A.p
        </div>
        <CopyBtn text={p.nombre} />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1f
        <div style={{ background:A.card,padding:"14px 12px" }}>
          <div style={{ display:"flex",alignItems:"center",justify
            <div style={{ fontFamily:BF,fontSize:9,color:A.gold,le
            <CopyBtn text={pbday} />
</div>
          <div style={{ fontFamily:ANTON,fontSize:18,color:A.gold,
        </div>
        <div style={{ background:A.card,padding:"14px 12px" }}>
          <div style={{ display:"flex",alignItems:"center",justify
            <div style={{ fontFamily:BF,fontSize:9,color:pexpWarn?
            <CopyBtn text={pexp} />
          </div>
          <div style={{ fontFamily:ANTON,fontSize:18,color:pexpWar
        </div>
        <div style={{ background:A.card,padding:"14px 12px" }}>
          <div style={{ display:"flex",alignItems:"center",justify
            <div style={{ fontFamily:BF,fontSize:9,color:p.docNume
            {p.docNumero&&<CopyBtn text={p.docNumero} />}
          </div>
          <div style={{ fontFamily:ANTON,fontSize:18,color:p.docNu
        </div>
      </div>
    </div>
); });
groupId
Main:fa
leDateS
").toLo
Radius:
A.borde
neHeigh
lineHei
urple,m
r",gap:
Content
tterSpa
lineHei
Content
A.orang
n?A.ora
Content
ro?A.cy
mero?A.
           return (<><div style={{ fontFamily:BF,fontSize:12,color:A.muted,lett
        })()}
</div> )}
    {/* INTERESADOS */}
    {listView==="interesados" && (
      <div style={{ padding:"20px 20px 120px" }}>
        <div style={{ fontFamily:BF,fontSize:12,color:A.muted,letterSpacing:2,
        {interesados.map((c,i)=>{
          const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;
          return (
            <div key={c.id} style={{ background:A.card,borderRadius:16,marginB
              <div style={{ fontFamily:ANTON,fontSize:24,color:A.orange,width:
              <div style={{ width:46,height:46,borderRadius:12,overflow:"hidde
                {c.passportPhoto?<img src={c.passportPhoto} style={{width:"100
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,lineHe
                <div style={{ fontFamily:BF,fontSize:12,color:rm.color,marginT
              </div>
            </div>
); })}
</div> )}
    {/* FOOTER STICKY */}
    <div style={{ position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px"
      <button onClick={()=>{ navigator.clipboard.writeText(currentList).then((
    </div>
</div> )}
{rmModal && <AModal title="Compañero/a de hab." onClose={()=>setRmModal(null)}
{roomMenu && <RoomMenu current={clients.find(c=>c.id===roomMenu)?.room||"doble
{fpMenu && <FormaPagoMenu current={clients.find(c=>c.id===fpMenu)?.formaPago||
{acmpModal && <AcompModal clientId={acmpModal} clients={clients} updClient={up
{addModal==="new" && <AModal title="Nuevo viajero" onClose={()=>{ setAddModal(
  <div style={{ fontSize:13,color:A.muted,fontFamily:BF,marginBottom:14 }}>Aña
  {newPersonas.map((p,i)=>(
    <div key={i} style={{ background:A.bg,borderRadius:12,padding:"12px",margi
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"
        <div style={{ fontFamily:BF,fontSize:10,color:i===0?A.cyan:A.purple,le
          {i===0?"Persona principal":`Persona ${i+1}`}
        </div>
        {i>0&&<button onClick={()=>setNewPersonas(ps=>ps.filter((_,j)=>j!==i))
      </div>
erSpaci
textTra
ottom:1
36,text
n",flex
%",heig
ight:1.
op:3 }}
,backgr
)=>{ se
>{tc.fi
_jun"}
"transf
dClient
null);
de una
nBottom
center"
tterSpa
} style
             <input value={p.nombre} onChange={e=>setNewPersonas(ps=>ps.map((x,j)=>j=
            <input value={p.email} onChange={e=>setNewPersonas(ps=>ps.map((x,j)=>j==
          </div>
        ))}
        <button onClick={()=>setNewPersonas(ps=>[...ps,{nombre:"",email:""}])} style
        <ARow>
          <button onClick={()=>{ setAddModal(null); setNewPersonas([{nombre:"",email
          <button onClick={()=>{
            const valid=newPersonas.filter(p=>p.nombre.trim());
            if(!valid.length) return;
            const groupId=valid.length>1?`g${uid()}`:null;
            const nuevos=valid.map(p=>({ id:`cl${uid()}`,nombre:p.nombre.trim(),emai
            sC([...clients,...nuevos]);
            setAddModal(null); setNewPersonas([{nombre:"",email:""}]);
          }} style={{ ...ab(A.cyan,A.bg),flex:2 }}>{newPersonas.filter(p=>p.nombre.t
        </ARow>
      </AModal>}
      {addModal==="existing" && <AModal title="Añadir viajeros existentes" onClose={
        <div style={{ fontSize:12,color:A.muted,fontFamily:BF,marginBottom:10 }}>Sel
        <SearchBar value={exSearch} onChange={setExSearch} placeholder="Buscar por n
        {filteredEx.length===0?<AEmpty text={allOtherClients.length===0?"No hay otro
          <div style={{ width:36,height:36,borderRadius:8,background:sel?A.cyan+"33"
          <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:14,fontWeight
          <span style={{ color:sel?A.cyan:A.muted,fontSize:20,fontWeight:700 }}>{sel
        </button>); })}
        {exSelected.length>0&&<div style={{ position:"sticky",bottom:0,background:A.
          <button onClick={()=>{
            const groupId=exSelected.length>1?`g${uid()}`:null;
            sC(clients.map(x=>exSelected.includes(x.id)?{...x,tripId:tid,pagosEstado
            setAddModal(null); setExSearch(""); setExSelected([]);
}} style={{ ...ab(`linear-gradient(90deg,${A.cyan},#0099bb)`,A.bg),width:" ✓ Añadir {exSelected.length} seleccionado{exSelected.length!==1?"s":""}
          </button>
        </div>}
      </AModal>}
      {viewPhoto && <Lightbox src={viewPhoto} onClose={()=>setViewPhoto(null)} />}
      {stFilterModal && <FilteredListModal title={`${ST.find(s=>s.key===stFilterModa
</div> );
};
// ─── PAGOS TAB ───
const PagosTab=()=>{
  const pc=trip.pagosConfig||[];
  const allPeople=[...tc,...tc.flatMap(c=>(c.acompanantes||[]).map(a=>({...a,_pN:c.n
  const [editImpModal,setEditImpModal]=useState(null);
  const [newImp,setNewImp]=useState("");
==i?{..
=i?{...
={{ ...
:""}]);
l:p.ema
rim()).
()=>{ s ecciona ombre o s clien :A.cyan :700,co ?"✓":"+
card2,b
:(trip.
100%",b
{exSele
l)?.emo
ombre})
 const [editFP,setEditFP]=useState("transferencia");
const [editPcModal,setEditPcModal]=useState(null);
const [pcLabel,setPcLabel]=useState("");
const [pcImporte,setPcImporte]=useState("");
const saveImp=()=>{ if(!editImpModal) return; updClient(editImpModal.cid,c=>{ cons
const savePc=()=>{ if(editPcModal===null) return; updTrip(t=>({...t,pagosConfig:t.
return (
  <div style={{ padding:"0 16px" }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center
      <button onClick={()=>setTab("menu")} style={{ background:"transparent",borde
      <div style={{ display:"flex",gap:6 }}>
        <button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig||[])
        {(trip.pagosConfig||[]).length>1&&<button onClick={()=>updTrip(t=>({...t,p
        <button onClick={()=>setRegistroPagoModal(true)} style={{ ...ab(A.green+"2
      </div>
    </div>
    <div style={{ display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBot
      {pc.map((p,i)=>{ const paid=allPeople.filter(c=>(c.pagosEstado||[])[i]==="pa
        <button onClick={()=>{ setPcLabel(p.label); setPcImporte(p.importe||""); s
        <div style={{ fontSize:9,color:ovd?A.red:urg?A.orange:A.muted,letterSpacin
    </div>
    {tc.length===0?<AEmpty text="Sin viajeros" />:(
      <div style={{ background:A.card,borderRadius:14,overflow:"hidden",border:`1p
        <div style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"1fr").
          <div style={{ padding:"10px 14px",fontSize:9,color:A.muted,fontFamily:BF
          {pc.map((p,i)=><div key={i} style={{ padding:"10px 8px",fontSize:9,color
        </div>
        {tc.map(c=>{
          const pe=c.pagosEstado||pc.map(()=>"pendiente");
          const allPaid=pe.every(s=>s==="pagado");
          const urgent=hasUrgent(c);
          const acomps=c.acompanantes||[];
          return (
            <React.Fragment key={c.id}>
              <div style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"
                <div style={{ padding:"10px 14px",display:"flex",alignItems:"cente
                  <div style={{ width:26,height:26,borderRadius:6,background:A.cya
                  <div style={{ fontFamily:ANTON,fontSize:12,color:A.text,lineHeig
                </div>
                {pc.map((p,i)=>{
                  const done=pe[i]==="pagado"; const urg2=!done&&(isUrgent(p.fecha
                  const customImp=(c.pagosImporteCustom||[])[i];
                  const cellFP=FORMAS_PAGO.find(f=>f.k===((c.pagosFormaPago||[])[i
                  return (
                    <div key={i} style={{ borderLeft:`1px solid ${A.border}44`,dis
                      <button onClick={()=>updClient(c.id,x=>{ const arr=[...(x.pa
                        style={{ width:"100%",flex:1,background:"transparent",bord
t ai=[.
pagosCo
",margi
r:"none
,{label
agosCon
2",A.gr
tom:2 }
gado").
etEditP
g:2,tex
x solid
join("
,letter
:A.cyan
1fr").j
r",gap:
n+"22",
ht:1 }}
ISO)||i
]||c.fo
play:"f
gosEsta
er:"non
                     <div style={{ fontFamily:ANTON,fontSize:16,color:done?A.gr
                    {customImp&&<div style={{ fontSize:7,color:A.gold,fontFami
                    <div style={{ fontSize:9 }}>{cellFP.icon}</div>
                  </button>
                  <button onClick={()=>{ const curFP=(c.pagosFormaPago||[])[i]
                    style={{ fontSize:9,color:A.muted,background:"transparent"
                </div>
); })}
          </div>
          {acomps.map(ac=>{ const ape=ac.pagosEstado?.length===pc.length?ac.pa
            <div key={ac.id} style={{ display:"grid",gridTemplateColumns:`1fr
              <div style={{ padding:"7px 14px 7px 22px",display:"flex",alignIt
                <div style={{ width:18,height:18,borderRadius:4,background:A.p
                <div style={{ fontFamily:BF,fontSize:10,color:A.purple }}>{ac.
</div>
              {pc.map((p,i)=>{ const done=ape[i]==="pagado"; const urg2=!done&
            </div>
          ); })}
        </React.Fragment>
); })}
</div> )}
{editImpModal && (
  <AModal title="Editar pago" onClose={()=>setEditImpModal(null)}>
    <div style={{ fontFamily:BF,fontSize:13,color:A.muted,marginBottom:12 }}>
      <strong style={{ color:A.text }}>{clients.find(c=>c.id===editImpModal.ci
    </div>
    <div style={{ background:A.card,border:`1px solid ${A.border}`,borderRadiu
    <AmountPad value={newImp} onChange={setNewImp} />
    <div style={{ marginTop:14,marginBottom:4,fontFamily:BF,fontSize:10,color:
    <div style={{ display:"flex",gap:8,marginBottom:16 }}>
      {FORMAS_PAGO.map(f=>(
        <button key={f.k} onClick={()=>setEditFP(f.k)} style={{ flex:1,padding
      ))}
    </div>
    <ARow>
      <button onClick={()=>setEditImpModal(null)} style={{ ...ab(A.card2,A.mut
      <button onClick={saveImp} style={{ ...ab(A.gold,A.bg),flex:2 }}>Guardar<
    </ARow>
</AModal> )}
{editPcModal!==null && (
  <AModal title="Editar hito de pago" onClose={()=>setEditPcModal(null)}>
    <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,text
    <input value={pcLabel} onChange={e=>setPcLabel(e.target.value)} placeholde
een:urg
ly:BF }
||c.for
,border
gosEsta
${pc.ma
ems:"ce
urple+"
nombre.
&(isUrg
d)?.nom
s:10,pa
A.muted
:"10px
ed),fle
/button
Transfo
r="Ej:
           <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,text
          <input value={pcImporte} onChange={e=>setPcImporte(e.target.value)} placeh
          <ARow>
            <button onClick={()=>{ if((trip.pagosConfig||[]).length>1) updTrip(t=>({
            <button onClick={()=>setEditPcModal(null)} style={{ ...ab(A.card2,A.mute
            <button onClick={savePc} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Guardar</
          </ARow>
        </AModal>
)} </div>
); };
// ─── FINANZAS TAB (con ZIP export y callClaude) ───
const FinanzasTab=()=>{
  const [unlocked,setUnlocked]=useState(false); const [showPin,setShowPin]=useState(
  const gastos=trip.gastos||[]; const facturas=trip.facturas||[];
  const pc=trip.pagosConfig||[];
  const [showGastoForm,setShowGastoForm]=useState(false);
  const [tipoMenu,setTipoMenu]=useState(false);
  const [gTipo,setGTipo]=useState("vuelo"); const [gDesc,setGDesc]=useState("");
  const [gImporte,setGImporte]=useState(""); const [gCurrency,setGCurrency]=useState
  const [gFecha,setGFecha]=useState(new Date().toISOString().split("T")[0]);
  const [gNota,setGNota]=useState(""); const [gImporteEUR,setGImporteEUR]=useState("
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
    const t=setTimeout(async()=>{ const eur=await convertToEUR(+gImporte,gCurrency);
    return ()=>clearTimeout(t);
  },[gImporte,gCurrency]);
  const totalGastos=gastos.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
  const totalIngresos=tc.reduce((sum,c)=>{ const pe=c.pagosEstado||pc.map(()=>"pendi
  const beneficio=totalIngresos-totalGastos;
const addGasto=()=>{
Transfo
older="
...t,pa
d),flex
button>
false);
(trip.c ");
setGIm
ente");
   if(!gImporte||+gImporte<=0) return;
  const importeEUR=gCurrency==="EUR"?+gImporte:+(gImporteEUR||gImporte);
  updTrip(t=>({...t,gastos:[...(t.gastos||[]),{ id:uid(),tipo:gTipo,descripcion:gD
  setGTipo("vuelo"); setGDesc(""); setGImporte(""); setGImporteEUR(""); setGFecha(
  setShowGastoForm(false);
};
const delGasto=id=>updTrip(t=>({...t,gastos:(t.gastos||[]).filter(g=>g.id!==id)}))
const addFacturaTrip=async e=>{ const files=Array.from(e.target.files); if(!files.
const addFacturaGasto=async(e,gastoId)=>{ const f=e.target.files[0]; if(!f) return
const delFactura=id=>updTrip(t=>({...t,facturas:(t.facturas||[]).filter(fa=>fa.id!
const tipoInfo=k=>GASTO_TIPOS.find(t=>t.k===k)||GASTO_TIPOS[0];
const gastosByTipo={};
gastos.forEach(g=>{ if(!gastosByTipo[g.tipo]) gastosByTipo[g.tipo]=[]; gastosByTip
const downloadAllFacturas=()=>{
  const all=facturas.filter(f=>!f.gastoId);
  all.forEach((fa,idx)=>{ setTimeout(()=>{ const a=document.createElement("a"); a.
};
const downloadZip=async()=>{
  const allF=facturas.filter(f=>!f.gastoId&&f.data);
  if(!allF.length){ alert("Sin facturas para exportar"); return; }
  setDownloadingZip(true);
  try {
    if(!window.JSZip){
      await new Promise(resolve=>{ const s=document.createElement("script"); s.src
    }
    const zip=new window.JSZip();
    const folder=zip.folder(`${trip.name}_facturas`);
    allF.forEach(fa=>{ try { const byteStr=atob(fa.data); const arr=new Uint8Array
    const blob=await zip.generateAsync({ type:"blob" });
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`${trip.name.repla
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.rev
  } catch(e){ alert("Error al crear el ZIP"); }
  setDownloadingZip(false);
};
 //
const downloadGastosZip=async()=>{
ZIP EXPORT para gastos individuales (con subcarpetas por tipo)
const gastosConFacturas=gastos.filter(g=>{
  const gf=(facturas||[]).filter(f=>f.gastoId===g.id&&f.data);
  return gf.length>0;
});
if(!gastosConFacturas.length){ alert("Sin facturas de gastos para exportar"); re
setDownloadingZip(true);
try {
esc,imp
new Dat
;
length)
; const
==id)})
o[g.tip
href=`d
="https
(byteSt
ce(/\s/
okeObje
turn; }
     if(!window.JSZip){
      await new Promise(resolve=>{ const s=document.createElement("script"); s.src
    }
    const zip=new window.JSZip();
    const root=zip.folder(`${trip.name}_gastos`);
    gastosConFacturas.forEach(g=>{
      const ti=tipoInfo(g.tipo||"otros");
      const folderName=`${ti.label}_${g.descripcion||g.tipo||"gasto"}`.replace(/[/
      const sub=root.folder(folderName);
      const gf=(facturas||[]).filter(f=>f.gastoId===g.id&&f.data);
      gf.forEach(fa=>{ try { const byteStr=atob(fa.data); const arr=new Uint8Array
    });
    const blob=await zip.generateAsync({ type:"blob" });
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`${trip.name.repla
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.rev
  } catch(e){ alert("Error al crear el ZIP de gastos"); }
  setDownloadingZip(false);
};
 //
const scanAndRename=async(fa)=>{
SCAN AND RENAME con callClaude
  if(!fa.data) return;
  setScanningFA(fa.id); setScanResult(null);
  try {
    const prompt=`Analiza esta factura o ticket. Extrae: proveedor, fecha, importe
    const raw=await callClaude(fa.data, fa.tipo||"image/jpeg", prompt);
    const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
    const importe=parsed.importe||"factura";
const ext=fa.tipo?.includes("pdf")?"pdf":fa.tipo?.includes("png")?"png":"jpg"; const newNombre=`${importe.replace(/[^0-9.,€$£¥]/g,"").trim()||importe}_${pars updTrip(t=>({...t,facturas:t.facturas.map(f=>f.id===fa.id?{...f,nombre:newNomb setScanResult({ id:fa.id, text:` Proveedor: ${parsed.proveedor||"—"}\n Fec
  } catch(e){ setScanResult({ id:fa.id, text:"Error al procesar la factura." }); }
  setScanningFA(null);
};
const sym=getCurrencySymbol(gCurrency);
return (
  <div style={{ padding:"0 16px" }}>
    <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBot
      {[{l:"Ingresos",v:totalIngresos,c:A.green},{l:"Gastos",v:totalGastos,c:A.red
        <div key={item.l} style={{ background:item.c+"15",borderRadius:14,padding:
          <div style={{ fontFamily:BF,fontSize:8,color:item.c,letterSpacing:2,text
          {unlocked?<div style={{ fontFamily:ANTON,fontSize:18,color:item.c,lineHe
  ="https
\\?%*:|
(byteSt
ce(/\s/
okeObje
total
ed.prov
re}:f)}
ha: ${
"none",
tom:14
},{l:"B
"12px 8
Transfo
ight:1
p
 </div> ))}
</div>
{!unlocked&&<button onClick={()=>setShowPin(true)} style={{ width:"100%",paddi
{unlocked&&gastos.length>0&&(
<button onClick={()=>setShowStats(v=>!v)} style={{ width:"100%",padding:"10p {showStats?"▲ Ocultar estadísticas":" Ver estadísticas de gastos"}
</button> )}
{showStats&&unlocked&&<ExpenseStats gastos={gastos} />}
<div style={{ marginBottom:14 }}>
  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"cent
    <div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,te
    <div style={{ display:"flex",gap:6 }}>
      {gastos.some(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.data)) && (
        <button onClick={downloadGastosZip} disabled={downloadingZip} style={{
)}
      <button onClick={()=>setShowGastoForm(v=>!v)} style={{ ...ab(showGastoFo
    </div>
  </div>
  {showGastoForm&&(
    <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBott
      <button onClick={()=>setTipoMenu(true)} style={{ width:"100%",background
        <span style={{ fontSize:22 }}>{tipoInfo(gTipo).icon}</span>
        <span style={{ fontFamily:ANTON,fontSize:15,color:A.orange,letterSpaci
        <span style={{ color:A.muted,fontSize:12,fontFamily:BF }}>Cambiar</spa
      </button>
      <input value={gDesc} onChange={e=>setGDesc(e.target.value)} placeholder=
      <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:8,margin
        <input value={gImporte} onChange={e=>setGImporte(e.target.value.replac
        <button onClick={()=>setCurrMenu(true)} style={{ ...ais,cursor:"pointe
      </div>
      {gCurrency!=="EUR"&&gImporte&&(
        <div style={{ background:A.bg,borderRadius:8,padding:"8px 12px",margin
          {converting?"Convirtiendo...":gImporteEUR?`≈ ${gImporteEUR} €`:""}
        </div>
      )}
      <input type="date" value={gFecha} onChange={e=>setGFecha(e.target.value)
      <input value={gNota} onChange={e=>setGNota(e.target.value)} placeholder=
      <button onClick={addGasto} disabled={!gImporte||+gImporte<=0} style={{ w
</div> )}
  {gastos.length===0?<AEmpty text="Sin gastos registrados" />:Object.entries(g
    const ti=tipoInfo(tipo); const subtotal=items.reduce((s,g)=>s+(+g.importeE
    return (
      <div key={tipo} style={{ marginBottom:10 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems
 ng:"12p
x",back
er",mar
xtTrans
 ...ab(
rm?A.ca
om:12,b
:A.bg,b
ng:1,fl n>
"Descri
Bottom:
e(/[^\d
r",text
Bottom:
} style
"Nota (
idth:"1
astosBy
UR||+g.
:"cente
           <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:
          <div style={{ fontFamily:ANTON,fontSize:13,color:A.red }}>{subtotal.
        </div>
        {items.map(g=>{
          const gFacturas=facturas.filter(f=>f.gastoId===g.id);
          const isExpanded=expandedGasto===g.id;
          return (
            <div key={g.id} style={{ background:A.card,borderRadius:10,marginB
              <div style={{ padding:"10px 12px",display:"flex",gap:10,alignIte
                <span style={{ fontSize:18,flexShrink:0 }}>{ti.icon}</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:ANTON,fontSize:15,color:A.orange,li
                  <div style={{ fontFamily:BF,fontSize:12,color:A.text,fontWei
                  <div style={{ fontSize:11,color:A.muted,fontFamily:BF }}>
                    {g.fecha&&new Date(g.fecha+"T12:00:00").toLocaleDateString
                    {g.currency&&g.currency!=="EUR"&&<span style={{ color:A.go
                    {g.nota&&` · ${g.nota}`}
                    {gFacturas.length>0&&<span style={{ color:A.green }}> ·
                  </div>
                </div>
                <button onClick={()=>setExpandedGasto(isExpanded?null:g.id)} s
                <button onClick={()=>delGasto(g.id)} style={{ background:"tran
              </div>
              {isExpanded&&(
                <div style={{ borderTop:`1px solid ${A.border}33`,padding:"10p
                  <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letter
                  {gFacturas.map(fa=>(
                    <div key={fa.id} style={{ display:"flex",alignItems:"cente
                      <span style={{ fontSize:16 }}>{fa.tipo?.includes("image"
                      <div style={{ flex:1,fontSize:12,fontFamily:BF,color:A.t
                      <a href={`data:${fa.tipo};base64,${fa.data}`} download={
                      <button onClick={()=>delFactura(fa.id)} style={{ backgro
</div> ))}
                  <input ref={gastoFacturaRef} type="file" accept="application
                  <button onClick={()=>{ gastoFacturaRef.current.value=""; gas
                </div>
)} </div>
); })}
</div> );
})} </div>
<div style={{ marginBottom:14 }}>
  <FacturacionSection trip={trip} updTrip={updTrip} tc={tc} />
2,textT
toLocal
ottom:6
ms:"cen
neHeigh
ght:700
("es-ES
ld }}>
{gFac
tyle={{
sparent
x 12px"
Spacing
r",gap: )?" " ext,whi fa.nomb und:"tr
/pdf,im
toFactu
  t
:
       </div>
      {tipoMenu&&<GastoTipoMenu current={gTipo} onSelect={t=>setGTipo(t)} onClose={(
      {currMenu&&<CurrencyMenu current={gCurrency} onSelect={c=>setGCurrency(c)} onC
      {showPin&&<NumPad title="PIN Finanzas" subtitle="Introduce el código de acceso
</div> );
};
// ─── FACTURACIÓN ───
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
    detalleReserva: trip.name ? `PROGRAMA TRAVELIKE ${trip.name.toUpperCase()} EN RÉ
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
)=>setT
lose={(
" pinLe
GIMEN D
 const delFacturaVenta = id => updTrip(t => ({ ...t, facturasVenta: (t.facturasVent
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
    // — Número de factura + fecha —
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const fNum = `FACTURA ${fa.numFactura}  ·  FECHA: ${new Date(fa.fechaFactura +
    doc.text(fNum, W - mg, y + 8, { align: "right" });
y += 24;
    // — Línea divisoria —
    doc.setDrawColor(220, 220, 220);
    doc.line(mg, y, W - mg, y);
    y += 8;
// — Datos Agencia + Detalle reserva (dos columnas) —
a || []
"T12:0
 const col1 = mg; const col2 = 110; const colW = 80;
doc.setFont("helvetica", "bold"); doc.setFontSize(8);
doc.setTextColor(232, 0, 42); // red Travelike
doc.text("DATOS AGENCIA", col1, y);
doc.text("DETALLE DE LA RESERVA", col2, y);
y += 5;
doc.setTextColor(60, 60, 60); doc.setFont("helvetica", "normal"); doc.setFontS
const agLines = ["Agencia: TRAVELIKE SL", "CIF: B02628766", "Dirección: Ana Ka
agLines.forEach(l => { doc.text(l, col1, y); y += 5; });
const resLines = doc.splitTextToSize(fa.detalleReserva || "", colW);
let ry = y - (agLines.length * 5);
resLines.forEach(l => { doc.text(l, col2, ry); ry += 5; });
y = Math.max(y, ry) + 4;
// — Fechas salida / regreso —
doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(60, 60,
const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("es-ES")
doc.text(`Fecha Salida: ${fmtDate(fa.fechaSalida)}`, col2, y);
doc.text(`Fecha Regreso: ${fmtDate(fa.fechaRegreso)}`, col2 + 50, y);
y += 10;
doc.setDrawColor(220, 220, 220); doc.line(mg, y, W - mg, y); y += 8;
// — Datos clientes —
doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(232, 0,
doc.text("DATOS CLIENTES", col1, y); y += 5;
doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(60,
const selClients = tc.filter(c => fa.clientesSeleccionados.includes(c.id));
selClients.forEach((c, i) => {
  const docStr = c.docNumero ? `  ·  ${c.docNumero}` : "";
  doc.text(`${i + 1}. ${c.nombre}${docStr}`, col1, y);
  y += 5;
  if (y > H - 40) { doc.addPage(); y = mg; }
});
y += 6;
doc.setDrawColor(220, 220, 220); doc.line(mg, y, W - mg, y); y += 8;
// — Total + régimen —
doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(60, 60
doc.text("DETALLES DE PAGO", col1, y);
doc.setTextColor(232, 0, 42); doc.setFontSize(13);
doc.text(`TOTAL FACTURA: ${fa.totalFactura}€`, W - mg, y, { align: "right" });
y += 14;
ize(9);
renina
60);
: "—";
42); 60, 60
, 60);
     // — Pie —
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120,
    doc.text("Travelike, S.L. con CIF B02628766", W / 2, H - 18, { align: "center"
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(60, 60,
    doc.text("*Régimen especial de las agencias de viajes*", W / 2, H - 12, { alig
    doc.save(`Factura_${fa.numFactura.replace(/[/\\]/g, "-")}.pdf`);
  } catch (e) { alert("Error al generar PDF: " + e.message); }
  setGenerating(null);
};
const editingFa = editId ? facturasVenta.find(f => f.id === editId) : null;
if (view === "new" || (view === "edit" && editingFa)) {
  const f = view === "edit" ? editingFa : form;
  const setF = view === "edit"
    ? upd => updTrip(t => ({ ...t, facturasVenta: t.facturasVenta.map(x => x.id ==
    : setForm;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems:
        <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacin
{view === "edit" ? " Editar Factura" : " Nueva Factura de Venta"} </div>
        <button onClick={() => { setView("list"); setEditId(null); }} style={{ bac
      </div>
      {/* No Factura + Fecha */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacin
          <input value={f.numFactura || ""} onChange={e => setF(x => ({ ...x, numF
            placeholder="09/25" style={{ ...ais, fontFamily: ANTON, fontSize: 18,
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacin
          <input type="date" value={f.fechaFactura || ""} onChange={e => setF(x =>
            style={{ ...ais, colorScheme: "dark" }} />
        </div>
</div>
      {/* Detalle reserva */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing:
        <textarea value={f.detalleReserva || ""} onChange={e => setF(x => ({ ...x,
  120, 12 });
60); n: "cen
= editI
"center
g: 1, t
kground
g: 2, t
actura:
letterS
g: 2, t ({ ...
2, tex detall
     rows={5} style={{ ...ais, resize: "vertical", lineHeight: 1.7 }} />
</div>
{/* Fechas salida / regreso */}
<div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
  <div style={{ flex: 1 }}>
    <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacin
    <input type="date" value={f.fechaSalida || ""} onChange={e => setF(x =>
      style={{ ...ais, colorScheme: "dark" }} />
  </div>
  <div style={{ flex: 1 }}>
    <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacin
    <input type="date" value={f.fechaRegreso || ""} onChange={e => setF(x =>
      style={{ ...ais, colorScheme: "dark" }} />
  </div>
</div>
{/* Selección de viajeros */}
<div style={{ marginBottom: 10 }}>
  <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing:
    Viajeros ({(f.clientesSeleccionados || []).length} seleccionados)
  </div>
  {tc.length === 0 ? (
    <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, padding: "10
  ) : tc.map(c => {
    const sel = (f.clientesSeleccionados || []).includes(c.id);
    const toggleFn = () => {
      const curr = f.clientesSeleccionados || [];
      const next = curr.includes(c.id) ? curr.filter(x => x !== c.id) : [...
      setF(x => ({ ...x, clientesSeleccionados: next }));
}; return (
      <div key={c.id} onClick={toggleFn} style={{ background: sel ? A.cyan +
        <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px s
          {sel && <span style={{ color: A.bg, fontSize: 14, fontWeight: 700
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color
          {c.docNumero ? (
            <div style={{ fontFamily: ANTON, fontSize: 16, color: sel ? A.cy
              {c.docNumero}
              {c.docVerified && <span style={{ fontFamily: BF, fontSize: 9,
</div> ):(
            <div style={{ fontFamily: BF, fontSize: 10, color: A.orange }}>
          )}
</div>
g: 2, t ({ ...x
g: 2, t ({ ...
2, tex
px", te
curr, c
"18" : olid ${ }}>✓</s
: A.tex
an : A.
color:
Sin
 n
 </div> );
        })}
        {tc.length > 0 && (
          <button onClick={() => {
            const allIds = tc.map(c => c.id);
            const curr = f.clientesSeleccionados || [];
            const allSel = allIds.every(id => curr.includes(id));
            setF(x => ({ ...x, clientesSeleccionados: allSel ? [] : allIds }));
          }} style={{ width: "100%", marginTop: 4, padding: "9px", background: A.c
            {(f.clientesSeleccionados || []).length === tc.length ? "Deseleccionar
</button> )}
</div>
      {/* Total */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: BF, fontSize: 10, color: A.muted, letterSpacing:
        <input type="number" value={f.totalFactura || ""} onChange={e => setF(x =>
          placeholder="60518" style={{ ...ais, fontFamily: ANTON, fontSize: 26, le
</div>
      {/* Botón guardar */}
      <button onClick={view === "edit" ? () => { setView("list"); setEditId(null);
        disabled={!f.numFactura || !f.fechaFactura}
        style={{ width: "100%", padding: "16px", border: "none", borderRadius: 12,
        {view === "edit" ? "GUARDAR CAMBIOS" : "CREAR FACTURA"}
      </button>
    </div>
); }
// — LISTA de facturas —
return (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "c
      <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSpacing:
      <button onClick={() => { setForm(emptyForm()); setView("new"); }} style={{ .
    </div>
    {facturasVenta.length === 0 ? (
      <AEmpty text="Sin facturas de venta" />
    ) : facturasVenta.map(fa => {
      const selCount = (fa.clientesSeleccionados || []).length;
      const fmtDate = d => d ? new Date(d + "T12:00:00").toLocaleDateString("es-ES
      return (
        <div key={fa.id} style={{ background: A.card, borderRadius: 12, marginBott
          <div style={{ padding: "12px 14px" }}>
ard2, b
 todos"
2, tex
 ({ ...
tterSpa
} : sa fontFa
enter",
 1, tex
..ab(A.
", { da om: 10,
 <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marg
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontFamily: ANTON, fontSize: 17, color: A.red, lette
    <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, margin
      {fmtDate(fa.fechaFactura)}
      {fa.fechaSalida && ` · Salida: ${fmtDate(fa.fechaSalida)}`}
      {fa.fechaRegreso && ` · Regreso: ${fmtDate(fa.fechaRegreso)}`}
</div>
    <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, margin
  </div>
  <div style={{ fontFamily: ANTON, fontSize: 20, color: A.red, whiteSp
</div>
{/* Lista de viajeros con número de documento */}
{selCount > 0 && (
  <div style={{ background: A.bg, borderRadius: 8, padding: "8px 10px"
    {tc.filter(c => (fa.clientesSeleccionados || []).includes(c.id)).m
      <div key={c.id} style={{ display: "flex", alignItems: "center",
        <span style={{ fontFamily: BF, fontSize: 11, color: A.muted, w
        <span style={{ fontFamily: BF, fontSize: 12, color: A.text, fl
        <span style={{ fontFamily: ANTON, fontSize: 14, color: c.docVe
           {c.docNumero || "
        </span>
</div> ))}
</div> )}
SIN DOC"}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setEditId(fa.id); setView("edit"); }} style
                <button onClick={() => downloadFacturaPDF(fa)} disabled={generating
{generating === fa.id ? " Generando..." : " Descargar PDF"} </button>
<button onClick={() => delFacturaVenta(fa.id)} style={{ background:
              </div>
              <div style={{ textAlign: "center", marginTop: 8, fontFamily: BF, fontS
                *Régimen especial de las agencias de viajes*
              </div>
            </div>
          </div>
); })}
</div> );
}
// ─── AI DOCS TAB (callClaude - nueva versión) ───
const AIDocsTab=()=>{
  const [queue,setQueue]=useState([]);
inBotto
rSpacin
Top: 2
Top: 2 ace: "n
, margi
ap((c,
gap: 8,
idth: 1
ex: 1 }
rified
={{ ...
=== fa.
"transp
ize: 9,
 const [processing,setProcessing]=useState(false);
const [docsMode,setDocsMode]=useState("ia"); // "ia" | "manual"
// manual upload state
const [manFile,setManFile]=useState(null);
const [manTipo,setManTipo]=useState("vuelo_ida");
const [manTarget,setManTarget]=useState(null);
const [manDesc,setManDesc]=useState("");
const [manAssigning,setManAssigning]=useState(false);
const fileRef=useRef();
const manFileRef=useRef();
const allTargets=tc.flatMap(c=>[
  { id:c.id,nombre:c.nombre,type:"client",clientId:c.id },
  ...(c.acompanantes||[]).map(a=>({ id:a.id,nombre:a.nombre,type:"acomp",clientId:
]);
const DOC_TIPOS=[
{ k:"vuelo_ida", icon:" ", label:"Billete IDA" },
{ k:"vuelo_vuelta",icon:" ", label:"Billete VUELTA" },
   { k:"seguro",
{ k:"voucher",
{ k:"visado",
{ k:"hotel",
{ k:"otro",
icon:" ", label:"Seguro de viaje" }, icon:" ", label:"Voucher hotel" }, icon:" ", label:"Visado" },
icon:" ", label:"Reserva hotel" }, icon:" ", label:"Otro documento" },
    ];
const addFiles=e=>{ const files=Array.from(e.target.files||[]); setQueue(q=>[...q,
const processAll=async()=>{
  const pending=queue.filter(q=>q.status==="pending"); if(!pending.length) return;
  const encoded=await Promise.all(pending.map(async item=>{ const b64=await fileTo
  for(const item of encoded){
    setQueue(q=>q.map(x=>x.id===item.id?{...x,b64:item.b64,status:"processing"}:x)
    try{
      const prompt=`Analiza este documento de viaje.\nViajeros del grupo: ${allTar
      const raw=await callClaude(item.b64, item.mime||"application/pdf", prompt);
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      const nombreBuscado=(parsed.pasajero||"").toLowerCase().trim();
      const matchedTarget=allTargets.find(t=>t.nombre.toLowerCase()===nombreBuscad
      setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"done",result:{...parsed,ma
    }catch(e){ setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"error"}:x)); }
}
  setProcessing(false);
};
const assignDoc=(item,target,tipo)=>{
  const etiqueta=item.result?.etiqueta||tipo.replace("vuelo_","").toUpperCase();
  const ext=item.mime?.includes("pdf")?"pdf":item.mime?.includes("png")?"png":"jpg
  const nombre=`${target.nombre.split(" ")[0]}_${etiqueta}.${ext}`;
  const doc={ id:uid(),tipo:tipo.startsWith("vuelo")?"vuelo":tipo,nombre,archivo:i
  if(target.type==="acomp"){ updClient(target.clientId,c=>({...c,acompanantes:(c.a
  else{ updClient(target.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc]})
c.id })
...file
 setPro
B64(ite
); gets.ma
o)||all
tchedTa
";
tem.res
compana
); }
   setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"assigned"}:x));
};
const assignManual=async()=>{
  if(!manFile||!manTarget) return;
  setManAssigning(true);
  const b64=await fileToB64(manFile);
  const tipoInfo=DOC_TIPOS.find(d=>d.k===manTipo)||DOC_TIPOS[0];
  const ext=manFile.type?.includes("pdf")?"pdf":manFile.type?.includes("png")?"png
  const nombre=`${manTarget.nombre.split(" ")[0]}_${tipoInfo.label.replace(/ /g,"_
  const doc={ id:uid(),tipo:manTipo.startsWith("vuelo")?"vuelo":manTipo,nombre,arc
  if(manTarget.type==="acomp"){ updClient(manTarget.clientId,c=>({...c,acompanante
  else{ updClient(manTarget.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc
  setManFile(null); setManDesc(""); setManTarget(null); setManAssigning(false);
};
const autoAssignAll=()=>{ queue.filter(x=>x.status==="done"&&x.result?.matchedTarg
const doneWithMatch=queue.filter(q=>q.status==="done"&&q.result?.matchedTarget).le
return (
  <div style={{ padding:"0 16px" }}>
    <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:
    {/* MODE SWITCHER */}
    <div style={{ display:"flex",background:A.bg,borderRadius:12,padding:4,marginB
      <button onClick={()=>setDocsMode("ia")} style={{ flex:1,background:docsMode=
      <button onClick={()=>setDocsMode("manual")} style={{ flex:1,background:docsM
    </div>
    {/* ── IA MODE ── */}
    {docsMode==="ia"&&(<>
      <div style={{ background:A.purple+"15",border:`1px solid ${A.purple}33`,bord
           Powered by <strong>Claude AI</strong> — analiza y asigna documentos aut
      </div>
      <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple s
      <div style={{ display:"flex",gap:8,marginBottom:10 }}>
        <button onClick={()=>fileRef.current.click()} style={{ flex:2,background:A
        {queue.filter(q=>q.status==="pending").length>0&&!processing&&(
          <button onClick={processAll} style={{ flex:1,background:A.cyan,border:"n
        )}
      </div>
      {doneWithMatch>0&&(
        <button onClick={autoAssignAll} style={{ width:"100%",padding:"12px",backg
             Asignar automáticamente todos ({doneWithMatch})
</button> )}
      {processing&&<div style={{ textAlign:"center",padding:"10px",color:A.cyan,fo
      {queue.length===0&&<AEmpty text="Sube billetes de ida y vuelta, seguros, vou
      {queue.map(item=>(
  ":"jpg"
")}.${e
hivo:ma
s:(c.ac
]})); }
et).for
ngth;
"none",
ottom:1
=="ia"?
ode==="
erRadiu
omátic
tyle={{
.purple
one",bo
round:`
ntSize:
chers u
a
 <div key={item.id} style={{ background:A.card,borderRadius:12,padding:"12p <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:item <spanstyle={{fontSize:18}}>{item.status==="pending"?" ":item.statu
    <div style={{ flex:1,minWidth:0 }}>
      <div style={{ fontSize:12,fontWeight:700,color:A.text,fontFamily:BF,
      {item.result&&<div style={{ fontSize:10,color:A.cyan,fontFamily:BF }
</div>
    {["pending","done","error"].includes(item.status)&&<button onClick={()
  </div>
  {item.status==="done"&&item.result&&(
    <div>
      {item.result.descripcion&&<div style={{ background:A.bg,borderRadius
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:
      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
        {allTargets.map(target=>{ const suggested=item.result.matchedTarge
          <button key={target.id} onClick={()=>assignDoc(item,target,item.
            style={{ padding:"8px 12px",borderRadius:8,cursor:"pointer",fo
            {suggested&&"
        </button>
); })} </div>
</div> )}
"}{target.nombre.split(" ")[0]}{target.type===
      {item.status==="assigned"&&<div style={{ fontSize:12,color:A.green,fontW
    </div>
))} </>)}
{/* ── MANUAL MODE ── */}
{docsMode==="manual"&&(<>
  <div style={{ background:A.cyan+"12",border:`1px solid ${A.cyan}33`,borderRa
       Sube documentos manualmente y asígnalos a cada viajero
</div>
  {/* TIPO selector */}
  <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTr
  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBotto
    {DOC_TIPOS.map(d=>(
      <button key={d.k} onClick={()=>setManTipo(d.k)} style={{ background:manT
        <span style={{ fontSize:20 }}>{d.icon}</span>
        <span style={{ fontFamily:BF,fontSize:12,fontWeight:700,color:manTipo=
      </button>
))} </div>
  {/* FILE picker */}
  <input ref={manFileRef} type="file" accept="application/pdf,image/*" style={
 x",marg
.result
s==="p
whiteSp
}>{item
=>setQu
:8,padd
2,textT
t?.id==
result.
ntFamil
"acomp
eight:7
dius:10
ansform
m:14 }}
ipo===d
==d.k?A
{ displ
r
"
 <button onClick={()=>manFileRef.current.click()} style={{ width:"100%",backg {manFile?` ${manFile.name}`:" Seleccionar archivo (PDF o imagen)"}
</button>
{/* DESCRIPCION */}
<input value={manDesc} onChange={e=>setManDesc(e.target.value)} placeholder=
{/* PASAJERO selector */}
<div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTr
<div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:16 }}
  {allTargets.map(target=>{
    const sel=manTarget?.id===target.id;
    return (
      <button key={target.id} onClick={()=>setManTarget(sel?null:target)} st
        <div style={{ width:38,height:38,borderRadius:9,overflow:"hidden",fl
          {(()=>{ const cl=target.type==="client"?tc.find(c=>c.id===target.i
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:sel?A
          {target.type==="acomp"&&<div style={{ fontFamily:BF,fontSize:10,co
        </div>
{sel&&<span style={{ color:A.cyan,fontSize:20 }}>✓</span>} </button>
); })}
</div>
<button onClick={assignManual} disabled={!manFile||!manTarget||manAssigning} {manAssigning?" ASIGNANDO...":" ASIGNAR DOCUMENTO"}
</button>
{/* Docs ya asignados en este viaje */}
{tc.some(c=>(c.personalDocs||[]).length>0||(c.acompanantes||[]).some(a=>(a.p
  <div>
    <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,te
    {tc.flatMap(c=>[
      ...(c.personalDocs||[]).map(d=>({...d,_nombre:c.nombre,_cid:c.id,_isAc
      ...(c.acompanantes||[]).flatMap(a=>(a.personalDocs||[]).map(d=>({...d,
    ]).map(d=>{
      const tipoInfo=DOC_TIPOS.find(t=>d.tipo&&(t.k===d.tipo||t.k.startsWith
      return (
        <div key={d.id} style={{ background:A.card,borderRadius:10,padding:"
          <span style={{ fontSize:20 }}>{tipoInfo.icon}</span>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.t
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted }}>{d._nom
          </div>
    round:m
"Descri
ansform >
yle={{
exShrin
d):tc.f
.cyan:A
lor:A.p
style=
ersonal
xtTrans
omp:fal
_nombre
(d.tipo
10px 14
ext,whi
bre}{d.
                   <button onClick={()=>{
                    if(d._isAcomp){ updClient(d._cid,c=>({...c,acompanantes:(c.acomp
                    else{ updClient(d._cid,c=>({...c,personalDocs:(c.personalDocs||[
                  }} style={{ background:"transparent",border:"none",color:A.muted,f
                </div>
); })}
</div> )}
</>)} </div>
); };
// ─── EDIT TAB ───
const EditTab=()=>{
const sec=editSec; const setSec=setEditSec;
const [lName,setLName]=useState(trip.name); const [lFlag,setLFlag]=useState(trip.f const [lFechas,setLFechas]=useState(trip.fechas||""); const [lPrice,setLPrice]=use const [lWebUrl,setLWebUrl]=useState(trip.webUrl||""); const [lCurrency,setLCurrenc const [currMenu2,setCurrMenu2]=useState(false);
const [efNombre,setEfNombre]=useState(""); const [efArchivo,setEfArchivo]=useState const [dfNombre,setDfNombre]=useState(""); const [dfArchivo,setDfArchivo]=useState const[ifIcono,setIfIcono]=useState(" ");const[ifTitulo,setIfTitulo]=useState(" const [newImpresc,setNewImpresc]=useState(""); const [newCatItems,setNewCatItems]= const[newCatIcon,setNewCatIcon]=useState(" ");const[newCatLabel,setNewCatLabel const mImpresc=trip.maletaImprescindibles||DEFAULT_IMPRESCINDIBLES;
const mCats=trip.maletaCats||DEFAULT_MALETA_CATS;
const hotels=trip.hotels||[];
const emerg=trip.emergencias||emptyEmergencias();
const sc=trip.surveyConfig||{ categories:[...DEFAULT_SURVEY_CATS],surveyResponses:
  if(sec===null){
    return (
      <div style={{ padding:"12px 16px" }}>
        <button onClick={()=>{ setTab("menu"); setEditSec(null); }} style={{ backgro
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
          {EDIT_SECS.map(s=>{
            let badge=null;
            if(s.k==="vuelos") badge=(trip.vuelos||[]).length;
            if(s.k==="docs") badge=(trip.docs||[]).length;
            if(s.k==="info") badge=(trip.info||[]).length;
            if(s.k==="hotels") badge=(trip.hotels||[]).length;
            if(s.k==="maleta") badge=mImpresc.length+mCats.reduce((s2,c)=>s2+c.items
            if(s.k==="survey"&&trip.surveyEnabled) badge=(sc.surveyResponses||[]).le
            return (
  <button key={s.k} onClick={()=>setSec(s.k)} style={{ background:A.card
anantes
]).filt
ontSize
lag);
State(t
y]=useS
(""); ("");
"); co
useStat
]=useS
[] };
und:"tr
.length
ngth;
,border
n t
               {badge>0&&<div style={{ position:"absolute",top:6,right:6,background
              <span style={{ fontSize:26 }}>{s.icon}</span>
              <span style={{ fontFamily:BF,fontSize:10,fontWeight:700,color:A.mute
</button> );
})} </div>
</div> );
}
const secInfo=EDIT_SECS.find(s=>s.k===sec);
return (
  <div style={{ padding:"0 16px" }}>
    <button onClick={()=>setSec(null)} style={{ display:"flex",alignItems:"center"
    <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1,margin
    {sec==="general"&&<div>
      <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:10,marginBot
        <input value={lFlag} onChange={e=>setLFlag(e.target.value)} style={{ ...ai
        <input value={lName} onChange={e=>setLName(e.target.value)} placeholder="N
      </div>
      <input value={lFechas} onChange={e=>setLFechas(e.target.value)} placeholder=
      <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:10,marginBot
        <input value={lPrice} onChange={e=>setLPrice(e.target.value.replace(/[^\d.
        <button onClick={()=>setCurrMenu2(true)} style={{ ...ais,cursor:"pointer",
      </div>
      <input value={lWebUrl} onChange={e=>setLWebUrl(e.target.value)} placeholder=
      <button onClick={()=>updTrip(t=>({...t,name:lName,flag:lFlag,fechas:lFechas,
      {currMenu2&&<CurrencyMenu current={lCurrency} onSelect={setLCurrency} onClos
</div>}
    {sec==="vuelos"&&<div>
      {(trip.vuelos||[]).map((v,i)=><div key={i} style={{ background:A.card,border
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
        <input value={efNombre} onChange={e=>setEfNombre(e.target.value)} placehol
        <input value={efArchivo} onChange={e=>setEfArchivo(e.target.value)} placeh
        <button onClick={()=>{ if(!efNombre.trim()) return; updTrip(t=>({...t,vuel
      </div>
    </div>}
    {sec==="docs"&&<div>
      {(trip.docs||[]).map((d,i)=><div key={i} style={{ background:A.card,borderRa
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
        <input value={dfNombre} onChange={e=>setDfNombre(e.target.value)} placehol
        <input value={dfArchivo} onChange={e=>setDfArchivo(e.target.value)} placeh
        <button onClick={()=>{ if(!dfNombre.trim()) return; updTrip(t=>({...t,docs
:s.k===
d,lette
,gap:8,
Bottom:
tom:10
s,textA
ombre d
"Fechas
tom:10
]/g,"")
textAli
"URL we
price:l
e={()=>
Radius:
solid $
der="No
older="
os:[...
dius:10
solid $
der="No
older="
:[...(t
   </div>
</div>}
{sec==="pagos"&&<div>
  {(trip.pagosConfig||[]).map((p,i)=>(
    <div key={i} style={{ background:A.card,borderRadius:10,padding:"12px",mar
      <div style={{ fontSize:10,color:A.cyan,fontWeight:700,marginBottom:8,fon
      <input value={p.label} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pago
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginB
        <input value={p.fecha} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pa
        <input value={p.importe} onChange={e=>updTrip(t=>({...t,pagosConfig:t.
      </div>
      <input type="date" value={p.fechaISO||""} onChange={e=>updTrip(t=>({...t
    </div>
))} <ARow>
    <button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig||[])
    {(trip.pagosConfig||[]).length>1&&<button onClick={()=>updTrip(t=>({...t,p
  </ARow>
</div>}
{sec==="info"&&<div>
  {(trip.info||[]).map((it,i)=><div key={i} style={{ background:A.card,borderR
  <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
    <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:8,marginBo
    <textarea value={ifTexto} onChange={e=>setIfTexto(e.target.value)} placeho
    <input value={ifUrl} onChange={e=>setIfUrl(e.target.value)} placeholder="E
    <button onClick={()=>{ if(!ifTitulo.trim()) return; updTrip(t=>({...t,info
  </div>
</div>}
{/* FIX: Hotels usan defaultValue+onBlur para evitar el bug de cursor */} {sec==="hotels"&&<div>
  {hotels.map((h,i)=>(
    <div key={h.id} style={{ background:A.card,borderRadius:12,padding:"12px 1
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"
        <div style={{ fontFamily:ANTON,fontSize:15,color:A.gold }}>Hotel {i+1}
        <button onClick={()=>updTrip(t=>({...t,hotels:t.hotels.filter(x=>x.id!
      </div>
      <input key={h.id+"_nombre"} defaultValue={h.nombre} onBlur={e=>updTrip(t
      <input key={h.id+"_fechas"} defaultValue={h.fechasEstancia||""} onBlur={
      <input key={h.id+"_dir"} defaultValue={h.direccion} onBlur={e=>updTrip(t
</div> ))}
  <button onClick={()=>updTrip(t=>({...t,hotels:[...(t.hotels||[]),emptyHotel(
</div>}
 ginBott
tFamily
sConfig
ottom:8
gosConf
pagosCo
,pagosC
,{label
agosCon
adius:1
solid $
ttom:8
lder="T
nlace (
:[...(t
4px",ma
center"
</div>
==h.id)
=>({...
e=>updT
=>({...
)]}))}
 {sec==="maleta"&&<div>
  <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBottom
    <div style={{ fontFamily:ANTON,fontSize:15,color:A.cyan,letterSpacing:1,ma
    {mImpresc.map((item,i)=>(
<div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:" <spanstyle={{fontSize:14}}> </span>
<input value={item} onChange={e=>updTrip(t=>({...t,maletaImprescindibl <button onClick={()=>updTrip(t=>({...t,maletaImprescindibles:t.maletaI
</div> ))}
    <div style={{ display:"flex",gap:8,marginTop:8 }}>
      <input value={newImpresc} onChange={e=>setNewImpresc(e.target.value)} on
      <button onClick={()=>{ if(!newImpresc.trim()) return; updTrip(t=>({...t,
    </div>
  </div>
  {mCats.map((cat,ci)=>(
    <div key={cat.id} style={{ background:A.card,borderRadius:14,padding:"14px
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }
        <span style={{ fontSize:22 }}>{cat.icon}</span>
        <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:
      </div>
      {cat.items.map((item,ii)=>(
        <div key={ii} style={{ display:"flex",alignItems:"center",gap:8,paddin
          <input value={item} onChange={e=>updTrip(t=>({...t,maletaCats:t.male
          <button onClick={()=>updTrip(t=>({...t,maletaCats:t.maletaCats.map((
</div> ))}
      <div style={{ display:"flex",gap:6,marginTop:6 }}>
        <input value={newCatItems[cat.id]||""} onChange={e=>setNewCatItems(x=>
        <button onClick={()=>{ const v=(newCatItems[cat.id]||"").trim(); if(!v
      </div>
    </div>
))} </div>}
{/* FIX: SOS usa defaultValue+onBlur */} {sec==="emerg"&&<div>
  {[{k:"policia",l:"Policía"},{k:"ambulancia",l:"Ambulancia"},{k:"bomberos",l:
    <div key={item.k}>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,te
      <input key={item.k} defaultValue={emerg[item.k]||""} onBlur={e=>updTrip(
    </div>
))} </div>}
{sec==="survey"&&<div>
  <div style={{ background:A.card2,borderRadius:14,padding:"16px",marginBottom
  :14,bor
rginBot
7px 8px
es:t.ma
mpresci
KeyDown
maletaI
",margi }>
1,flex:
g:"5px
taCats.
c2,c2i)
({...x,
) retur
"Bomber
xtTrans
t=>({..
:14,bor
   <label style={{ display:"flex",gap:12,alignItems:"center",cursor:"pointer"
    <input type="checkbox" checked={trip.surveyEnabled||false} onChange={e=>
    <div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:trip.survey
  </label>
</div>
<div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,marg
{(sc.categories||[]).map((cat,i)=>(
  <div key={cat.key} style={{ background:A.card,borderRadius:10,padding:"10p
    <input value={cat.icon} onChange={e=>updTrip(t=>({...t,surveyConfig:{...
    <input value={cat.label} onChange={e=>updTrip(t=>({...t,surveyConfig:{..
    <span style={{ fontSize:9,color:A.muted,fontFamily:BF,flexShrink:0 }}>{c
    <button onClick={()=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,c
</div> ))}
<div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
  <div style={{ fontFamily:BF,fontSize:10,color:A.gold,letterSpacing:2,textT
  <div style={{ display:"grid",gridTemplateColumns:"48px 1fr 80px",gap:8,mar
    <input value={newCatIcon} onChange={e=>setNewCatIcon(e.target.value)} st
    <input value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)}
    <input value={newCatKey} onChange={e=>setNewCatKey(e.target.value.replac
</div>
{/* Selector de tipo: rating o texto */}
<select value={newCatTipo} onChange={e=>setNewCatTipo(e.target.value)} sty
<option value="rating"> Valoración 1-5</option>
<option value="texto"> Pregunta abierta</option>
</select>
<button onClick={()=>{ if(!newCatLabel.trim()||!newCatKey.trim()) return;
</div>
{(sc.surveyResponses||[]).length>0&&<div>
  <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:3,text
  {(sc.surveyResponses||[]).map((r,i)=>(
    <div key={i} style={{ background:A.card,borderRadius:12,padding:"14px",m
      <div style={{ display:"flex",justifyContent:"space-between",marginBott
        <div style={{ fontFamily:BF,fontSize:13,color:A.muted }}>Anónima #{i
        <div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{r.date}</d
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
        {(sc.categories||[]).filter(cat=>cat.tipo!=="texto").map(cat=>r.rati
          <div key={cat.key} style={{ background:A.card2,borderRadius:8,padd
            <div style={{ fontSize:9,color:A.muted,fontFamily:BF,marginBotto
            <div style={{ fontSize:20 }}>{SURVEY_EMOJIS[(r.ratings[cat.key]|
            <div style={{ fontFamily:ANTON,fontSize:13,color:A.gold }}>{r.ra
          </div>
        ):null)}
      </div>
      {r.textAnswers&&Object.entries(r.textAnswers).filter(([,v])=>v).map(([
   const cat=(sc.categories||[]).find(c=>c.key===k);
,paddin
updTrip
Enabled
inBotto
x 12px"
t.surve
.t.surv
at.tipo
ategori
solid $
ransfor
ginBott
yle={{
placeho
e(/\s/g
le={{ .
const k
Transfo
arginBo
om:10 }
+1}</di
iv>
ngs?.[c
ing:"6p
m:2 }}>
|1)-1]}
tings[c
k,v])=>
                 return cat?(<div key={k} style={{ background:A.bg,borderRadius:8,pad
              })}
              {r.mejor&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10
              {r.mejora&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 1
            </div>
))} </div>}
      </div>}
    </div>
); };
// ─── ATRIP RETURN ───
return (
  <div style={{ background:A.bg,minHeight:"100vh",color:A.text,paddingBottom:24,font
    <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"c
      <span style={{ fontSize:26,flexShrink:0 }}>{trip.flag}</span>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontFamily:ANTON,fontSize:16,whiteSpace:"nowrap",overflow:"hid
        <div style={{ fontSize:10,color:A.cyan,letterSpacing:2,fontFamily:BF }}>{fmt
      </div>
      <button onClick={()=>go("ahome")} style={{ background:A.card2,border:`1px soli
    </div>
    <div style={{ minHeight:"calc(100vh - 160px)" }}>
      {tab==="menu" && (
        <div style={{ padding:"16px" }}>
          {CRM_TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ width:"100%",ba
              <div style={{ width:48,height:48,borderRadius:14,background:A.cyan+"22
              <div style={{ flex:1,fontFamily:ANTON,fontSize:18,color:A.text,letterS
              <div style={{ color:A.muted,fontSize:24 }}>›</div>
            </button>
          ))}
</div> )}
      {tab==="people" && <PeopleTab />}
      {tab==="pagos" && <PagosTab />}
      {tab==="finanzas" && <FinanzasTab />}
      {tab==="ai" && <AIDocsTab />}
      {tab==="notes" && <div style={{ padding:"0 16px" }}>
        <button onClick={()=>setTab("menu")} style={{ background:"transparent",borde
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={()=>s
        <div style={{ fontSize:10,color:A.muted,marginTop:6,textAlign:"right",fontFa
</div>}
      {tab==="edit" && <EditTab />}
    </div>
    {registroPagoModal && <RegistroPagoModal trips={trips} clients={clients} tid={ti
ding:"8
px",mar
0px",fo
Family:
enter",
den",te
(trip.d
d ${A.b
ckgroun
",displ
pacing:
r:"none
Crm({..
mily:BF
d} sC={
 </div> );
}
// ============================================================
// CLIENT SIDE COMPONENTS
// ============================================================
function AcompModal({ clientId, clients, updClient, trip, onClose }) {
  const cl = clients.find(c => c.id === clientId);
  const [nombre, setNombre] = useState("");
  const refs = useRef({});
  const acomps = cl?.acompanantes || [];
  const add = () => { if (!nombre.trim()) return; const pagosEstado = (trip?.pagosConf
  const del = id => updClient(clientId, c => ({ ...c, acompanantes: (c.acompanantes ||
  const uploadPhoto = (acId, file) => { const r = new FileReader(); r.onload = e => up
  return (
    <AModal title="Acompañantes" onClose={onClose}>
      <div style={{ fontSize: 13, color: A.muted, fontFamily: BF, marginBottom: 14 }}>
      {acomps.length === 0 && <div style={{ textAlign: "center", padding: "16px 0", co
      {acomps.map(ac => (
        <div key={ac.id} onClick={() => refs.current[ac.id]?.click()} style={{ backgro
          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", b
            {ac.passportPhoto ? <img src={ac.passportPhoto} style={{ width: "100%", he
          </div>
          <input ref={el => { if (el) refs.current[ac.id] = el; }} type="file" accept=
          <div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 15, fontWei
          <button onClick={e => { e.stopPropagation(); del(ac.id); }} style={{ backgro
</div> ))}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={nombre} onChange={e => setNombre(e.target.value)} onKeyDown={e =
        <button onClick={add} style={{ ...ab(A.cyan, A.bg), padding: "11px 18px", flex
      </div>
    </AModal>
); }
function PrivacidadModal({ onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:10001,
      <div style={{ background:A.card2,borderRadius:"20px 20px 0 0",padding:"24px",wid
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center
          <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1 }}>P
          <button onClick={onClose} style={{ background:"transparent",border:"none",co
</div> {[
ig || [
 []).fi
dClient
Persona
lor: A.
und: A.
order:
ight: "
"image/
ght: 70
und: "t
> e.key
Shrink:
display
th:"100
",margi
OLÍTICA
lor:A.m
           ["Responsable del tratamiento","TRAVELIKE SL, CIF B02628766, Calle Ana Karen
          ["¿Qué datos recogemos?","Nombre, email, foto de pasaporte, fecha de caducid
          ["¿Para qué los usamos?","Gestionar tu reserva y el viaje contratado, tramit
          ["Fotografías de pasaporte","Conservamos tu foto de pasaporte mientras tenga
          ["¿Con quién los compartimos?","Con aerolíneas, hoteles y seguros necesarios
          ["Tus derechos","Tienes derecho a acceder, rectificar, suprimir, oponerte y
          ["Fotos en redes sociales","Solo publicaremos fotos tuyas en nuestras redes
        ].map(([titulo, texto]) => (
          <div key={titulo} style={{ marginBottom:16, background:A.bg, borderRadius:12
            <div style={{ fontFamily:BF,fontSize:12,fontWeight:700,color:A.cyan,letter
            <div style={{ fontFamily:BF,fontSize:13,color:A.muted,lineHeight:1.7 }}>{t
          </div>
))}
        <button onClick={onClose} style={{ width:"100%",padding:"16px",border:"none",b
      </div>
</div> );
}
function Passport({ go, cid, clients, setClients, trips, sC, logout }) {
  const cl = clients.find(c => c.id === cid);
  const [photos, setPhotos] = useState(cl?.passportPhotos || (cl?.passportPhoto ? [cl.
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
ina 6,
ad del
ar docu
s una r
 para t
limitar
si has
, paddi
Spacing
exto}</
orderRa
passpor
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
    ? { ...x, passportPhoto: photos[0] || null, passportPhotos: photos, rgpdConsent:
:x );
  setClients(updated);
  go("notifprompt", { cid });
  db.set(SK_C, updated);
};
return (
  <div style={{ fontFamily: BF, background: A.bg, minHeight: "100vh", maxWidth: 560,
<div style={{ background: "linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#07070f <divstyle={{fontSize:48,marginBottom:12}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 32, color: "#fff", lineHeight: 1, m <div style={{ fontFamily: ANTON, fontSize: 22, color: A.cyan, letterSpacing: 2 <div style={{ fontSize: 14, color: A.muted, fontFamily: BF, marginTop: 10 }}>T
    </div>
    <div style={{ padding: "24px 20px" }}>
      <div style={{ background: A.card, borderRadius: 14, padding: 20, border: `1px
        <div style={{ fontFamily: ANTON, fontSize: 18, color: "#fff", marginBottom:
        <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, marginBottom: 14
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14
            {photos.map((p, i) => (
              <div key={i} style={{ position: "relative", width: 90, height: 90, bor
                <img src={p} onClick={() => setLightbox(p)} style={{ width: "100%",
                <button onClick={() => removePhoto(i)} style={{ position: "absolute"
</div> ))}
            <div onClick={() => ref.current.click()} style={{ width: 90, height: 90,
              <span style={{ fontSize: 24, color: A.muted }}>+</span>
 true,
 margin
 100%)"
arginBo
 }}>{cl
u avent
solid $
4, lett
 }}>Pue
}}>
derRadi
height:
, top:
border
                 <span style={{ fontFamily: BF, fontSize: 9, color: A.muted, textTransf
              </div>
</div> )}
          {photos.length === 0 && (
            <div onClick={() => ref.current.click()} style={{ background: A.card2, bor
<divstyle={{fontSize:36,marginBottom:8}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 15, color: A.cyan, letterSpac <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, marginTop: 4
</div> )}
          <input ref={ref} type="file" accept="image/*" multiple style={{ display: "no
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBo
            <input type="checkbox" checked={c0} onChange={e => setC0(e.target.checked)
            <div>
              <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: c0 ?
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, lineHeight:
            </div>
          </label>
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBo
            <input type="checkbox" checked={c1} onChange={e => setC1(e.target.checked)
            <div>
              <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: c1 ?
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, lineHeight:
            </div>
          </label>
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBo
            <input type="checkbox" checked={c2} onChange={e => setC2(e.target.checked)
            <div>
              <div style={{ fontFamily: BF, fontSize: 14, fontWeight: 700, color: c2 ?
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, lineHeight:
            </div>
          </label>
          <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, marginBottom: 16
          <button onClick={submit} disabled={!canSubmit} style={{ width: "100%", paddi
          {logout && <div style={{ textAlign: "center", marginTop: 16 }}><button onCli
        </div>
      </div>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {showPriv && <PrivacidadModal onClose={() => setShowPriv(false)} />}
    </div>
); }
function NotifPrompt({ go, cid, clients, sC, logout }) {
  const [loading, setLoading] = useState(false);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
 orm: "u
der: `2
ing: 1 }}>Cám
ne" }}
ttom: 1
} style
 A.cyan
1.6 }}>
ttom: 1
} style
 A.gree
1.6 }}>
ttom: 2
} style
 A.purp
1.6 }}>
, textA
ng: "18
ck={log
 const isPWA = window.navigator.standalone === true || window.matchMedia("(display-mo
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
} }
    } catch (e) { console.warn("[OneSignal] Error:", e); }
  }
  await sC(clients.map(x => x.id === cid ? { ...x, notifEnabled: true } : x));
  setLoading(false);
  go("client", { cid });
};
const skip = () => go("client", { cid });
if (isIOS && !isPWA) {
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <div style={{ background: "linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#0707
<divstyle={{fontSize:72,marginBottom:16}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 30, color: "#fff", letterSpacing: <div style={{ fontSize: 15, color: A.muted, lineHeight: 1.7 }}>Para recibir
      </div>
      <div style={{ flex: 1, padding: "24px 20px" }}>
{[
{num:"1",icon:" ",title:"TocaelbotónCompartir",desc:"Elicono {num:"2",icon:" ",title:"\"Añadirapantalladeinicio\"",desc:"D {num:"3",icon:" ",title:"Pulsa\"Añadir\"",desc:"Confirmaenlae {num:"4",icon:" ",title:"Ábreladesdetuinicio",desc:"CierraSaf
        ].map(step => (
          <div key={step.num} style={{ display: "flex", gap: 16, marginBottom: 20, a
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: A.
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
              <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letterSp
              <div style={{ fontFamily: BF, fontSize: 13, color: A.muted, lineHeight
     </div>
de: sta
to", di
0f 100%
 1, mar
notific
del cu
espláz
squina
ari y
lignIte
cyan +
acing: : 1.5 }
a a
a
 </div> ))}
          <button onClick={skip} style={{ width: "100%", padding: "18px", border: `1.5
          {logout && <button onClick={logout} style={{ background: "none", border: "no
        </div>
</div> );
}
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto
<divstyle={{fontSize:80,marginBottom:24}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 32, color: "#fff", letterSpacing: 1, <div style={{ fontSize: 17, color: A.muted, lineHeight: 1.7, marginBottom: 36 }} <button onClick={enable} disabled={loading} style={{ width: "100%", padding: "18 <button onClick={skip} style={{ background: "none", border: "none", color: A.mut {logout && <button onClick={logout} style={{ background: "none", border: "none",
</div> );
}
function Client({ go, cid, clients, trips, logout, sC, sT }) {
  const cl = clients.find(c => c.id === cid);
  const trip = cl?.tripId ? trips.find(t => t.id === cl.tripId) : null;
  const [view, setView] = useState("home");
  const [maletaNewItem, setMaletaNewItem] = useState("");
  if (!cl) return <div style={{ padding: 40, fontFamily: BF, color: A.muted }}>Error</
  if (trip?.surveyEnabled) {
    if (cl.surveySubmitted) return <PostSurveyScreen cl={cl} trip={trip} logout={logou
    return <SurveyScreen cl={cl} trip={trip} clients={clients} sC={sC} trips={trips} s
  }
  if (!trip) return <NoTrips cl={cl} logout={logout} />;
  const pc = trip.pagosConfig || [];
  const pe = cl.pagosEstado || pc.map(() => "pendiente");
  const pagosPendientes = pe.filter(s => s !== "pagado").length;
  const vuelosCount = (trip.vuelos || []).length + (cl.personalDocs || []).filter(d =>
  const docsCount = (trip.docs || []).length + (cl.personalDocs || []).filter(d => d.t
  const infoCount = (trip.info || []).length + (trip.hotels || []).length;
  // Miembros del mismo grupo (incluye al propio viajero)
  const groupMembers = cl.groupId ? clients.filter(c => c.groupId === cl.groupId) : [c
  const SubHeader = ({ title, color }) => (
    <div style={{ background: A.card, padding: "14px 16px", display: "flex", alignItem
      <button onClick={() => setView("home")} style={{ background: A.card2, border: `1
      <div style={{ fontFamily: ANTON, fontSize: 20, color: color || A.text, letterSpa
 px soli
ne", co
", disp
marginB
>Activa
px", bo
ed, fon
color:
div>;
t} />; T={sT}
 d.tipo
ipo !==
l];
s: "cen
px soli
cing: 1
     <span style={{ fontSize: 28 }}>{trip.flag}</span>
  </div>
const BigBack = () => (
  <div style={{ padding: "24px 16px 40px" }}>
    <button onClick={() => setView("home")} style={{ width: "100%", padding: "18px",
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
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <div style={{ background: "linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#0707
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom:
          <span style={{ fontSize: 36 }}>{trip.flag}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: ANTON, fontSize: 20, color: "#fff", letterSpac
            <div style={{ fontSize: 12, color: A.cyan, fontFamily: BF, letterSpacing
          </div>
          {daysToTrip !== null && daysToTrip > 0 && <div style={{ background: A.gold
        </div>
        {pc.length > 0 && <div style={{ background: A.card2, borderRadius: 10, paddi
      </div>
      <div style={{ padding: "20px 16px", display: "grid", gridTemplateColumns: "1fr
        {[
{emoji:" ",label:"Vuelos",sublabel:"Billetesyembarque",color:A. {emoji:" ",label:"Documentos",sublabel:"Visadosyseguros",color: {emoji:" ",label:"Pagos",sublabel:pagosPendientes>0?`${pagosPen {emoji:" ",label:"Información",sublabel:"Hotelesyconsejos",color {emoji:" ",label:"Mimaleta",sublabel:"Listadeequipaje",color:A
        ].map(item => (
          <div key={item.v} onClick={() => setView(item.v)} style={{ background: A.c
            <div style={{ position: "absolute", top: -24, right: -24, width: 90, hei
            {item.badge != null && item.badge > 0 && <div style={{ position: "absolu
            <div style={{ fontSize: item.wide ? 40 : 44, lineHeight: 1, flexShrink:
            <div style={{ flex: item.wide ? 1 : undefined }}>
              <div style={{ fontFamily: ANTON, fontSize: item.wide ? 18 : 20, color:
              <div style={{ fontFamily: BF, fontSize: 12, color: A.muted }}>{item.su
            </div>
);
     border
to", fo
0f 100%
14 }}>
ing: 1, : 2, ma
+ "22" ng: "8p
1fr",
cyan,
A.gold
diente
: A.pu
.cyan,
ard, bo
ght: 90
te", to
0 }}>{i
 item.c
blabel}
b , s r
             {item.wide && <div style={{ color: item.color, fontSize: 20, flexShrink:
          </div>
        ))}
        {/* Grupo: pasaportes side-by-side si hay más de un miembro */}
        {groupMembers.length > 1 && (
          <div onClick={() => setView("pasaportes_grupo")} style={{ gridColumn: "1 /
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, hei
            <div style={{ fontFamily: BF, fontSize: 10, color: A.purple, letterSpaci
            <div style={{ display: "flex", gap: 10 }}>
              {groupMembers.map((m, i) => (
                <div key={m.id} style={{ flex: 1, background: A.bg, borderRadius: 14
                  <div style={{ width: 56, height: 70, borderRadius: 10, overflow: "
                    {m.passportPhoto ? <img src={m.passportPhoto} style={{ width: "1
                  </div>
                  <div style={{ fontFamily: ANTON, fontSize: 12, color: m.id === cid
                  <div style={{ fontFamily: BF, fontSize: 9, color: m.passportPhoto
</div> ))}
            </div>
          </div>
)}
        {trip.webUrl ? <a href={trip.webUrl} target="_blank" rel="noreferrer" style=
      </div>
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <button onClick={logout} style={{ background: "none", border: "none", color:
        <span style={{ color: A.border, margin: "0 10px" }}>·</span>
        <button onClick={() => { if (window.confirm("¿Quieres solicitar el borrado d
      </div>
    </div>
); }
if (view === "pasaportes_grupo") {
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <SubHeader title="Pasaportes" color={A.purple} />
      <div style={{ padding: "16px" }}>
        <div style={{ fontFamily: BF, fontSize: 12, color: A.muted, marginBottom: 16
          Aquí puedes ver el estado de los pasaportes de vuestro grupo. Cada persona
        </div>
        {groupMembers.map((m, i) => {
          const isMe = m.id === cid;
          const exp = m.passportExpiry ? new Date(m.passportExpiry + "T12:00:00").to
          const warn = passportWarn(m.passportExpiry);
          return (
            <div key={m.id} style={{ background: A.card, borderRadius: 20, padding:
              {isMe && <div style={{ position: "absolute", top: 10, right: 12, backg
0 }}>›
 -1", b
ght: 80
ng: 3,
, paddi
hidden"
00%", h
? A.cy ? A.gre
{{ grid
A.mute e tus d
to", co
, lineH debe s
LocaleD
"16px",
round:
               <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                {/* Foto pasaporte en grande */}
                <div style={{ width: 90, height: 120, borderRadius: 14, overflow: "h
{m.passportPhoto
? <img src={m.passportPhoto} style={{ width: "100%", height: "10 :<><divstyle={{fontSize:32,marginBottom:6}}> </div><div
} </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: ANTON, fontSize: 20, color: isMe ? A.cya
                  {m.passportPhoto
? <div style={{ background: A.green + "18", border: `1px solid $ <span style={{ color: A.green, fontSize: 14 }}>✓</span> <span style={{ fontFamily: BF, fontSize: 12, color: A.green,
                      </div>
                    : <div style={{ background: A.orange + "18", border: `1px solid
<spanstyle={{color:A.orange,fontSize:14}}> </span>
                        <span style={{ fontFamily: BF, fontSize: 12, color: A.orange
                      </div>
                  }
                  {m.docNumero && <div style={{ fontFamily: ANTON, fontSize: 16, col
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {m.birthDate && <div style={{ background: A.card2, borderRadius:
                    {exp && <div style={{ background: warn ? A.orange + "22" : A.car
                  </div>
                </div>
              </div>
</div> );
})}
        <BigBack />
      </div>
</div> );
}
if (view === "maleta") {
  const mImpresc = trip.maletaImprescindibles || DEFAULT_IMPRESCINDIBLES;
  const mCats = trip.maletaCats || DEFAULT_MALETA_CATS;
  const marcados = cl.maletaMarcados || [];
  const personal = cl.maletaPersonal || [];
  const toggle = key => {
    const nm = marcados.includes(key) ? marcados.filter(k => k !== key) : [...marcad
    sC(clients.map(x => x.id === cid ? { ...x, maletaMarcados: nm } : x));
};
// FIX: limpiar input ANTES de sC para evitar salto de scroll
   idden",
0%", ob
style=
n : A.t
{A.gree
 fontWe
${A.ora
, fontW
or: A.c
8, pad d2, bor
os, key
{
   const addPersonal = () => {
    if (!maletaNewItem.trim()) return;
    const texto = maletaNewItem.trim();
    setMaletaNewItem("");
    sC(clients.map(x => x.id === cid ? { ...x, maletaPersonal: [...(x.maletaPersonal
  };
  const delPersonal = id => sC(clients.map(x => x.id === cid ? { ...x, maletaPersona
  const totalItems = mImpresc.length + mCats.reduce((s, c) => s + c.items.length, 0)
  const checkedCount = marcados.length;
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
<SubHeader title="Mi maleta " color={A.cyan} /> <div style={{ padding: "14px 16px" }}>
        <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", m
          <div style={{ display: "flex", justifyContent: "space-between", marginBott
            <div style={{ fontFamily: ANTON, fontSize: 16, color: A.text }}>EMPACADO
            <div style={{ fontFamily: ANTON, fontSize: 16, color: checkedCount === t
          </div>
          <div style={{ height: 8, background: A.border, borderRadius: 4 }}><div sty
          {checkedCount === totalItems && totalItems > 0 && <div style={{ fontFamily
        </div>
        <div style={{ background: `linear-gradient(135deg,${A.red}18 0%,${A.orange}1
          <div style={{ fontFamily: ANTON, fontSize: 15, color: A.red, letterSpacing
          {mImpresc.map((item, i) => { const key = `imp_${i}`; const checked = marca
        </div>
        {mCats.map((cat, ci) => { const catChecked = cat.items.filter((_, ii) => mar
        <div style={{ background: A.card, borderRadius: 16, padding: "14px", marginB
          <div style={{ fontFamily: ANTON, fontSize: 15, color: A.purple, letterSpac
          {personal.length === 0 && <div style={{ fontFamily: BF, fontSize: 13, colo
          {personal.map(p => { const key = `per_${p.id}`; const checked = marcados.i
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input value={maletaNewItem} onChange={e => setMaletaNewItem(e.target.va
            <button onClick={addPersonal} style={{ ...ab(A.purple + "22", A.purple),
          </div>
        </div>
</div>
      <BigBack />
    </div>
); }
if (view === "vuelos") {
  const vuelos = trip.vuelos || [];
  const myDocs = (cl.personalDocs || []).filter(d => d.tipo === "vuelo");
  return (
  || [])
l: (x.m
 + pers
to", co
arginBo
om: 8 }
</div>
otalIte
le={{ h : BF, f
0 100%)
: 1, ma
dos.inc
cados.i
ottom:
ing: 1,
r: A.mu
ncludes
lue)} o
 paddin
     <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <SubHeader title="Mis vuelos" color={A.cyan} />
      <div style={{ padding: "16px" }}>
        {vuelos.length === 0 && myDocs.length === 0 && <AEmpty text="Tus billetes ap
        {[...vuelos, ...myDocs].map((v, i) => (
          <div key={i} style={{ background: A.card, border: `1px solid ${A.border}`,
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBott
              <div style={{ width: 50, height: 50, borderRadius: 12, background: A.c
              <div>
                <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letter
                <div style={{ fontFamily: BF, fontSize: 13, color: A.muted }}>{v.des
              </div>
            </div>
{/* Botón descarga real si tiene base64 */} {v.data ? (
              <a href={`data:${v.mimeType||"application/pdf"};base64,${v.data}`} dow
                style={{ display: "block", width: "100%", padding: "14px", border: "
                DESCARGAR
</a> ):(
              <div style={{ width: "100%", padding: "14px", borderRadius: 10, fontFa
                Pendiente de asignación
</div> )}
</div> ))}
        <BigBack />
      </div>
</div> );
}
if (view === "docs") {
  const docs = trip.docs || [];
  const myDocs = (cl.personalDocs || []).filter(d => d.tipo !== "vuelo");
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <SubHeader title="Documentos" color={A.gold} />
      <div style={{ padding: "16px" }}>
        {docs.length === 0 && myDocs.length === 0 && <AEmpty text="Tus documentos ap
        {[...docs, ...myDocs].map((d, i) => (
          <div key={i} style={{ background: A.card, border: `1px solid ${A.border}`,
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBott
              <div style={{ width: 50, height: 50, borderRadius: 12, background: A.g
              <div>
                <div style={{ fontFamily: ANTON, fontSize: 16, color: "#fff", letter
                <div style={{ fontFamily: BF, fontSize: 13, color: A.muted }}>{d.des
 to", co
arecerá
 border
om: 14
yan + "
Spacing
cripcio
nload={
none",
mily: A
to", co
arecerá
 border
om: 14
old + "
Spacing
cripcio
               </div>
            </div>
{/* Botón descarga real si tiene base64 */} {d.data ? (
              <a href={`data:${d.mimeType||"application/pdf"};base64,${d.data}`} dow
                style={{ display: "block", width: "100%", padding: "14px", border: "
                DESCARGAR
</a> ):(
              <div style={{ width: "100%", padding: "14px", borderRadius: 10, fontFa
                Pendiente de asignación
</div> )}
</div> ))}
        <BigBack />
      </div>
</div> );
}
if (view === "pagos") {
  const fp = FORMAS_PAGO.find(f => f.k === (cl.formaPago || "transferencia")) || FOR
  const pendiente = pe.findIndex(s => s !== "pagado");
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <SubHeader title="Mis pagos" color={A.green} />
      <div style={{ padding: "16px" }}>
        <div style={{ background: `linear-gradient(135deg,${A.cyan}18 0%,#172030 100
          <div style={{ fontFamily: BF, fontSize: 9, color: A.muted, letterSpacing:
          {fp.k === "transferencia" && (<div><div style={{ fontFamily: ANTON, fontSi
          {fp.k === "vip" && <div style={{ fontFamily: ANTON, fontSize: 18, color: A
          {pendiente >= 0 && pc[pendiente] && (
            <div style={{ marginTop: 14, background: A.bg, borderRadius: 12, padding
              <div style={{ fontFamily: BF, fontSize: 10, color: A.gold, letterSpaci
              <div style={{ display: "flex", alignItems: "center", justifyContent: "
                <div><div style={{ fontFamily: ANTON, fontSize: 20, color: A.gold }}
                <CopyBtn text={`${(cl.pagosImporteCustom || [])[pendiente] || pc[pen
              </div>
</div> )}
        </div>
        {pc.map((p, i) => {
          const done = pe[i] === "pagado"; const urg = !done && isUrgent(p.fechaISO)
          const imp = (cl.pagosImporteCustom || [])[i] || p.importe || "—";
          return (
 <div key={i} style={{ background: A.card, borderRadius: 16, padding: "16
nload={
none",
mily: A
MAS_PAG
to", co
%)`, bo
4, text
ze: 20,
.gold,
: "12px
ng: 2,
space-b
>{(cl.p
diente]
; const
px 18px
               <div style={{ width: 44, height: 44, borderRadius: "50%", background:
                <span style={{ fontFamily: ANTON, fontSize: 18, color: done ? A.gree
              </div>
              <div style={{ flex: 1 }}><div style={{ fontFamily: BF, fontSize: 15, f
              <div style={{ fontFamily: ANTON, fontSize: 18, color: done ? A.green :
</div> );
})}
        <BigBack />
      </div>
</div> );
}
if (view === "info") {
  const info = trip.info || [];
  const hotels = trip.hotels || [];
  const emerg = trip.emergencias || emptyEmergencias();
  const emergItems = [
    { k: "policia", l: "Policía", n: emerg.policia },
    { k: "ambulancia", l: "Ambulancia", n: emerg.ambulancia },
    { k: "bomberos", l: "Bomberos", n: emerg.bomberos },
    { k: "tourleader", l: "Tour Leader", n: emerg.tourleader }
  ].filter(e => e.n);
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 au
      <SubHeader title="Información" color={A.purple} />
      <div style={{ padding: "16px" }}>
        {hotels.map(h => (
          <div key={h.id} style={{ background: A.card, borderRadius: 20, padding: "2
            {h.fechasEstancia && <div style={{ display: "inline-flex", alignItems: "
            <div style={{ fontFamily: ANTON, fontSize: 24, color: "#fff", marginBott
            {h.direccion && <div style={{ background: A.bg, borderRadius: 12, paddin
</div> ))}
        {info.map((it, i) => (
          <div key={i} style={{ background: A.card, borderRadius: 16, padding: "14px
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{it.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: BF, fontSize: 15, fontWeight: 700, color:
                <div style={{ fontSize: 13, color: A.muted, lineHeight: 1.6, fontFam
                {it.url && <a href={it.url} target="_blank" rel="noreferrer" style={
              </div>
            </div>
</div> ))}
done ? n : ovd
ontWeig
 A.gold
to", co
0px", m
center"
om: 14,
g: "12p
16px",
A.text,
ily: BF
{ displ
           {emergItems.length > 0 && (
            <div style={{ background: A.red + "11", borderRadius: 16, padding: "14px 1
              <div style={{ fontFamily: BF, fontSize: 10, color: A.red, letterSpacing:
              {emergItems.map(e => (
                <a key={e.k} href={`tel:${e.n}`} style={{ display: "flex", alignItems:
                  <span style={{ fontFamily: BF, fontSize: 13, color: A.muted, flex: 1
                  <span style={{ fontFamily: ANTON, fontSize: 17, color: A.red }}>{e.n
</a> ))}
</div> )}
          {info.length === 0 && hotels.length === 0 && emergItems.length === 0 && <AEm
          <BigBack />
        </div>
</div> );
}
  return null;
}
 //
function SurveyScreen({ cl, trip, clients, sC, trips, sT, logout }) {
SurveyScreen con soporte para preguntas de texto libre
const sc = trip.surveyConfig || { categories: [...DEFAULT_SURVEY_CATS] };
const cats = sc.categories || DEFAULT_SURVEY_CATS;
const [ratings, setRatings] = useState({});
const [textAnswers, setTextAnswers] = useState({});
const [highlights, setHighlights] = useState([]);
const [mejor, setMejor] = useState("");
const [mejora, setMejora] = useState("");
// canSubmit solo requiere rellenar las categorías de tipo rating
const canSubmit = cats.filter(c => c.tipo !== "texto").every(c => ratings[c.key]);
const toggleHL = k => setHighlights(h => h.includes(k) ? h.filter(x => x !== k) : [.
const submit = async () => {
  if (!canSubmit) return;
  const response = { ratings, textAnswers, highlights, mejor, mejora, date: new Date
  const updatedTrips = trips.map(t =>
t.id === trip.id
? { ...t, surveyConfig: { ...t.surveyConfig, surveyResponses: [...(t.surveyCon :t
  );
  await Promise.all([
    sT(updatedTrips),
    sC(clients.map(x => x.id === cl.id ? { ...x, surveySubmitted: true } : x))
  ]);
6px", m 3, tex
"cente
 }}>{e.
}</span
pty tex
..h, k]
().toLo
fig?.su
 };
return (
  <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto
<div style={{ background: "linear-gradient(135deg,rgba(255,200,71,0.18) 0%,#0707 <divstyle={{fontSize:48,marginBottom:12}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 32, color: A.gold, letterSpacing: 1 <div style={{ fontSize: 16, color: A.muted, lineHeight: 1.6 }}>Tu opinión sobr <div style={{ marginTop: 14, background: A.green + "18", border: `1px solid ${
<spanstyle={{fontSize:18}}> </span>
        <div style={{ fontFamily: BF, fontSize: 13, color: A.green, fontWeight: 700
      </div>
    </div>
    <div style={{ padding: "20px" }}>
      {cats.map(cat =>
        cat.tipo === "texto" ? (
          <div key={cat.key} style={{ background: A.card2, borderRadius: 14, padding
            <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacin
            <textarea
              value={textAnswers[cat.key] || ""}
              onChange={e => setTextAnswers(r => ({ ...r, [cat.key]: e.target.value
              placeholder="Escribe tu respuesta..."
              style={{ ...ais, minHeight: 80, resize: "vertical", lineHeight: 1.5 }}
/> </div>
):(
<RatingRow key={cat.key} label={cat.label} icon={cat.icon} value={ratings[
) )}
      <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", mar
        <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SURVEY_HLS.map(item => { const sel = highlights.includes(item.k); return
        </div>
      </div>
      <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", mar
        <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2
        <textarea value={mejor} onChange={e => setMejor(e.target.value)} placeholder
      </div>
      <div style={{ background: A.card2, borderRadius: 14, padding: "14px 16px", mar
        <div style={{ fontFamily: BF, fontSize: 11, color: A.muted, letterSpacing: 2
        <textarea value={mejora} onChange={e => setMejora(e.target.value)} placehold
      </div>
      <button onClick={submit} disabled={!canSubmit} style={{ width: "100%", padding
        {canSubmit ? "ENVIAR VALORACIÓN" : "Valora todas las categorías"}
      </button>
      <div style={{ textAlign: "center", marginTop: 16 }}>
  ", colo
0f 100%
, margi
e <stro
A.green
}}>Esta
: "14px g: 2, t
}))}
cat.key
ginBott
, textT
(<butto
ginBott
, textT
="Cuént
ginBott
, textT
er="Tu
: "20px
           <button onClick={logout} style={{ background: "none", border: "none", color:
        </div>
      </div>
    </div>
); }
function PostSurveyScreen({ cl, trip, logout }) {
  return (
    <div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto
      <div style={{ background: "linear-gradient(135deg,#07070f 0%,#0f1f3d 50%,#1a0a00
<divstyle={{fontSize:64,marginBottom:16}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 42, color: "#fff", letterSpacing: 2 <div style={{ fontFamily: BF, fontSize: 17, color: A.muted, lineHeight: 1.7, m
      </div>
      <div style={{ flex: 1, padding: "36px 24px" }}>
<div style={{ background: "linear-gradient(135deg,rgba(255,200,71,0.12) 0%,rgb <divstyle={{fontSize:48,marginBottom:12}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 26, color: A.gold, letterSpacing: <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(`¡Hola! Soy ${cl
            style={{ display: "block", width: "100%", padding: "18px", border: "none",
            CONTACTAR
          </a>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={logout} style={{ background: "none", border: "none", color:
        </div>
      </div>
    </div>
); }
function NoTrips({ cl, logout }) {
  return (
<div style={{ background: A.bg, minHeight: "100vh", maxWidth: 560, margin: "0 auto <divstyle={{fontSize:72,marginBottom:20}}> </div>
<div style={{ fontFamily: ANTON, fontSize: 28, color: "#fff", letterSpacing: 1, <div style={{ fontSize: 17, color: A.muted, lineHeight: 1.7, marginBottom: 32 }} <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer"
        style={{ display: "block", width: "100%", padding: "16px", borderRadius: 12, f
        CONTACTAR AGENCIA
      </a>
      <button onClick={logout} style={{ background: "none", border: "none", color: A.m
    </div>
); }
   A.mute
", disp
 100%)"
, lineH
arginTo
a(0,240
 1, mar
.nombre
 border
A.mute
", disp
marginB
>Aún no
ontFami
uted, f
 
