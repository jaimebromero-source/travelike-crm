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
const callClaude = async (b64, mime, prompt) => {
  const isImg = mime?.startsWith("image/");
  const isPDF = mime === "application/pdf";
  const contentParts = [];
  if (b64 && (isImg || isPDF)) {
    const SUPPORTED_IMG = ["image/jpeg","image/png","image/gif","image/webp"];
    const safeMime = isImg ? (SUPPORTED_IMG.includes(mime) ? mime : "image/jpeg") : mi
    contentParts.push({ type: isImg ? "image" : "document", source: { type: "base64",
}
, pin_t
en_type
me; media_t
￼  contentParts.push({ type: "text", text: prompt });
  const resp = await fetch("/.netlify/functions/claude-proxy", {
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
{ code:"EUR",symbol:"€",name:"Euro" },{ code:"USD",symbol:"$",name:"Dólar US" },{ co { code:"JPY",symbol:"¥",name:"Yen japonés" },{ code:"CHF",symbol:"Fr",name:"Franco s { code:"NOK",symbol:"kr",name:"Corona noruega" },{ code:"DKK",symbol:"kr",name:"Coro { code:"CZK",symbol:"Kč",name:"Corona checa" },{ code:"HUF",symbol:"Ft",name:"Forint { code:"BGN",symbol:"лв",name:"Lev búlgaro" },{ code:"HRK",symbol:"kn",name:"Kuna cr { code:"ISK",symbol:"kr",name:"Corona islandesa" },{ code:"MXN",symbol:"$",name:"Pes { code:"BRL",symbol:"R$",name:"Real brasileño" },{ code:"COP",symbol:"$",name:"Peso { code:"PEN",symbol:"S/",name:"Sol peruano" },{ code:"UYU",symbol:"$U",name:"Peso ur { code:"PYG",symbol:"₲",name:"Guaraní paraguayo" },{ code:"GTQ",symbol:"Q",name:"Que { code:"DOP",symbol:"RD$",name:"Peso dominicano" },{ code:"AUD",symbol:"A$",name:"Dó { code:"NZD",symbol:"NZ$",name:"Dólar neozelandés" },{ code:"TRY",symbol:"₺",name:"L { code:"SAR",symbol:"ر.س",name:"Riyal saudí" },{ code:"QAR",symbol:"ر.ق",name:"Riyal { code:"BHD",symbol:".د.ب",name:"Dinar bareiní" },{ code:"OMR",symbol:"ر.ع",name:"Ri { code:"ILS",symbol:"₪",name:"Séquel israelí" },{ code:"ZAR",symbol:"R",name:"Rand s { code:"EGP",symbol:"£",name:"Libra egipcia" },{ code:"TND",symbol:"د.ت",name:"Dinar { code:"NGN",symbol:"₦",name:"Naira nigeriana" },{ code:"GHS",symbol:"₵",name:"Cedi { code:"TZS",symbol:"Tsh",name:"Chelín tanzano" },{ code:"INR",symbol:"₹",name:"Rupi { code:"BDT",symbol:"৳",name:"Taka bangladesí" },{ code:"LKR",symbol:"Rs",name:"Rupi { code:"CNY",symbol:"¥",name:"Yuan chino" },{ code:"KRW",symbol:"₩",name:"Won corean { code:"HKD",symbol:"HK$",name:"Dólar hongkonés" },{ code:"SGD",symbol:"S$",name:"Dó { code:"THB",symbol:"฿",name:"Baht tailandés" },{ code:"VND",symbol:"₫",name:"Dong v { code:"PHP",symbol:"₱",name:"Peso filipino" },{ code:"MMK",symbol:"K",name:"Kyat bi { code:"LAK",symbol:"₭",name:"Kip laosiano" },{ code:"BND",symbol:"B$",name:"Dólar d { code:"KZT",symbol:"₸",name:"Tenge kazajo" },{ code:"UZS",symbol:"so'm",name:"Som u { code:"AMD",symbol:"֏",name:"Dram armenio" },{ code:"AZN",symbol:"₼",name:"Manat az { code:"RUB",symbol:"₽",name:"Rublo ruso" },{ code:"BYN",symbol:"Br",name:"Rublo bie { code:"MKD",symbol:"ден",name:"Denar macedonio" },{ code:"ALL",symbol:"L",name:"Lek
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
ietnam
rmano"
e Bruné
zbeko"
erbaiy
lorruso
 albané
i
a
￼  { code:"IQD",symbol:"ع.د",name:"Dinar iraquí" },{ code:"IRR",symbol:"ریال",name:"Rial i
  { code:"MUR",symbol:"Rs",name:"Rupia mauriciana" },{ code:"XOF",symbol:"CFA",name:"F
  { code:"CDF",symbol:"FC",name:"Franco congoleño" },{ code:"MZN",symbol:"MT",name:"Me
  { code:"BWP",symbol:"P",name:"Pula botsuanesa" },{ code:"NAD",symbol:"N$",name:"Dóla
  { code:"DZD",symbol:"دج",name:"Dinar argelino" },{ code:"LYD",symbol:"ل.د",name:"Din
  { code:"SOS",symbol:"Sh",name:"Chelín somalí" },{ code:"RWF",symbol:"Fr",name:"Franc
  { code:"HTG",symbol:"G",name:"Gourde haitiano" },{ code:"JMD",symbol:"J$",name:"Dóla
  { code:"BBD",symbol:"Bds$",name:"Dólar de Barbados" },{ code:"FJD",symbol:"FJ$",name
  { code:"WST",symbol:"T",name:"Tālā samoano" },
;]
const getCurrencySymbol = code => CURRENCIES.find(c=>c.code===code)?.symbol||code;
const HOTEL_CARACTS_PRESETS = [
{ k:"ubicacion", icon:" ￼ ", label:"Excelente ubicación" },
{ k:"desayuno", icon:" ￼ ", label:"Desayuno incluido" }, {k:"recomendado",icon:" ￼ ",label:"Recomendadoporviajeros"},
{ k:"familiar",
{ k:"precio",
{ k:"adultos",
{ k:"spa",
{ k:"piscina",
{ k:"wifi",
{ k:"parking",
icon:" ￼ ", label:"Familiar" },
icon:" ￼ ", label:"Mejor precio garantizado" }, icon:" ￼ ", label:"Solo adultos" },
icon:" ￼ ", label:"Spa incluido" },
icon:" ￼ ", label:"Piscina" },
icon:" ￼ ", label:"WiFi gratuito" },
icon:" ￼ ", label:"Parking incluido" },
;]
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
Doble cama junta", short:"Doble Junta", cap:2, color:A.cyan }
Doble camas sep.", short:"Doble Sep.", cap:2, color:A.lightbl
Individual", short:"Individual", cap:1, color:A.orange },
Triple", short:"Triple", cap:3, color:A.gold },
Cuádruple", short:"Cuádruple", cap:4, color:A.purple },
Busca compañero/a", short:"Busca", cap:2, color:"#FF6B6B" }
￼￼￼￼￼￼raní" }
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
 };
const FORMAS_PAGO = [
{k:"transferencia",icon:" ",label:"Transferencia"}, {k:"tarjeta",icon:" ",label:"Tarjeta"}, {k:"vip",icon:" ",label:"DescuentoVIP"}
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
Cultura" },{ k:"gastro", l:" Gastronomía" }, Alojamiento" },{ k:"grupo", l:" El grupo" },
Actividades" },{ k:"paisajes", l:" Paisajes" },
    urante pina"
},
" }
   { k:"org", l:" Organización" },{ k:"precio", l:" Precio/calidad" } ];
const DEFAULT_SURVEY_CATS = [ {key:"viaje",label:"Experienciaglobal",icon:" ",tipo:"rating"}, {key:"guia",label:"Guía/Organización",icon:" ",tipo:"rating"}, {key:"hotel",label:"Alojamientos",icon:" ",tipo:"rating"}
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
const isoToDisplay = s => { if(!s||s.length<8) return s; const m=s.match(/^(\d{4})-(\d
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
{2})-(\
;
ceil((d
rim());
d=()=>r
" });
l s a " s a
s a
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
  } catch(e) { console.error("[OneSignal proxy] Fetch error:", e); return { success: f
};
if (typeof document!=="undefined" && !document.getElementById("tl-f")) {
  const l=document.createElement("link"); l.id="tl-f"; l.rel="stylesheet";
alse, e
   l.href="https://fonts.googleapis.com/css?family=Anton&family=Barlow+Condensed:400,70
  document.head.appendChild(l);
}
const mem = {};
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
0&displ
..f, da
)) retu
{} q("key"
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
vuelos:[{ id:"v1", nombre:"IDA - Madrid > Nueva York (IB6251)", archivo:"IB6251_Bill docs:[{ id:"d1", nombre:"Seguro médico de viaje", archivo:"Poliza_seguro.pdf" }],
 _at: ne
FInstan
e, 10,
urrenc
ete.pdf
y
   pagosConfig:[
    { label:"Reserva", fecha:"15 Ago 2026", fechaISO:"2026-08-15", importe:"500€" },
    { label:"Resto", fecha:"1 Nov 2026", fechaISO:"2026-11-01", importe:"1690€" }
],
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
 const [zoom, setZoom] = React.useState(1);
const [rot, setRot]   = React.useState(0);
const [pan, setPan]   = React.useState({ x: 0, y: 0 });
const [dragging, setDragging] = React.useState(false);
const dragStart = React.useRef(null);
const lastPan   = React.useRef({ x: 0, y: 0 });
const isZ = zoom > 1;
const zoomIn = e => { e.stopPropagation(); setZoom(z => Math.min(5, +(z + 0.5).toFi const zoomOut = e => { e.stopPropagation(); const n = Math.max(1, +(zoom - 0.5).toFi const rotate = e => { e.stopPropagation(); setRot(r => (r + 90) % 360); };
const reset = e=> { e.stopPropagation(); setZoom(1); setRot(0); setPan({ x: 0, y:
const onImgDown = e => {
  if (!isZ) return;
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
return (
  <div style={{ background: "#000", display: "flex", flexDirection: "column", height
    <div onPointerDown={e => e.stopPropagation()} style={{ display: "flex", gap: 8,
      <button onClick={zoomOut} disabled={zoom <= 1} style={{ background: "rgba(255,
      <button onClick={zoomIn}  disabled={zoom >= 5} style={{ background: "rgba(255,
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "mono
      <button onClick={rotate} style={{ background: "rgba(255,255,255,0.1)", border:
      {(zoom > 1 || rot > 0) && <button onClick={reset} style={{ background: "rgba(2
    </div>
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "c
      <img
        src={src}
        draggable={false}
        onPointerDown={onImgDown}
        onPointerMove={onImgMove}
        onPointerUp={onImgUp}
        onPointerLeave={onImgUp}
        style={{
          maxWidth: isZ ? "none" : "100%",
          maxHeight: isZ ? "none" : "100%",
xed(2))
xed(2))
0 });
rent.y
: "100%
padding
255,255
255,255
space",
 "none"
55,200,
enter",
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
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-betw
        <div style={{ fontFamily: ANTON, fontSize: 18, color: "#fff", letterSpacing: 1
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href={modal.src} download="pasaporte.jpg" target="_blank" rel="noreferrer
            style={{ background: A.gold + "22", border: `1px solid ${A.gold}44`, borde
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${A.borde
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <PassportImageViewer src={modal.src} />
      </div>
      <div style={{ background: "#0a0a12", borderTop: `2px solid ${A.cyan}33`, padding
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin
          <div>
{pan.y
Align:
digits
9, back
een", p
 }}>{mo
" rRadius
r}`, bo
: "14px
Bottom:
     <div style={{ fontFamily: BF, fontSize: 9, color: A.cyan, letterSpacing: 2
    <input value={docNum} onChange={e => setDocNum(e.target.value.toUpperCase(
      style={{ ...ais, fontFamily: ANTON, fontSize: 18, letterSpacing: 2, text
</div> <div>
    <div style={{ fontFamily: BF, fontSize: 9, color: A.orange, letterSpacing:
    <input value={expiry} onChange={handleDateInput(setExpiry)} onFocus={e =>
      style={{ ...ais, fontFamily: ANTON, fontSize: 16, textAlign: "center", c
  </div>
</div>
<div style={{ marginBottom: 10 }}>
  <div style={{ fontFamily: BF, fontSize: 9, color: A.gold, letterSpacing: 2.5
  <input value={birthDate} onChange={handleDateInput(setBirthDate)} onFocus={e
    style={{ ...ais, fontFamily: ANTON, fontSize: 16, textAlign: "center", col
</div>
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
.5, tex
))} onF
Align:
 2.5, t
e.stopP
olor: A
, textT
 => e.s
or: A.g
none",
: `1px : `1px
     dragStart.current = { x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.cur
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
  const zoomOut = e => { e.stopPropagation(); const next = Math.max(1, zoom - 0.5); se
  const rotate = e => { e.stopPropagation(); setRot(r => (r + 90) % 360); };
  const reset = e => { e.stopPropagation(); setZoom(1); setRot(0); setPan({ x: 0, y: 0
  return (
    <div onClick={!isZoomed ? onClose : undefined} onWheel={handleWheel} onPointerDown
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:10000,dis
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
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        <img src={src} draggable={false}
          style={{ maxWidth: isZoomed ? "none" : "100%", maxHeight: isZoomed ? "none"
            transform:`rotate(${rot}deg) scale(${zoom}) translate(${pan.x/zoom}px,${pa
            transition: dragging ? "none" : "transform 0.15s ease", cursor: isZoomed ?
          alt="Pasaporte" />
      </div>
      {isZoomed && <div style={{ textAlign:"center",padding:"6px 0 10px",fontSize:11,c
    </div>
); }
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position:"relative",marginBottom:12 }}>
      <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)
rent.y
tZoom(n
 }); la
={handl
play:"f
",justi
55,255,
5,255,0
)",font
:"none"
0,71,0.
gba(255
overflo
: "calc
n.y/zoo
 (dragg
olor:"r
",fontS
       <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeho
      {value && <button onClick={()=>onChange("")} style={{ position:"absolute",right:
    </div>
); }
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
lder||"
8,top:"
nChange
rRadius
Length
 || 30}
.remain
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
d ${val
extTran
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
",align
0,width
ansform
 ${curr
muted,t
 ))} </div>
      </div>
    </div>
); }
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
<divstyle={{fontSize:72,marginBottom:20}}> </div>
<div style={{ fontFamily:ANTON,fontSize:28,color:"#fff",letterSpacing:1,marginBo <div style={{ fontSize:17,color:A.muted,lineHeight:1.7,marginBottom:32 }}>Aún no <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer"
        style={{ display:"block",width:"100%",padding:"16px",borderRadius:12,fontFamil
        CONTACTAR AGENCIA
      </a>
      <button onClick={logout} style={{ background:"none",border:"none",color:A.muted,
    </div>
  );
}:11,color:A.muted,fontFamily:BF }}>{c.name}</div>
</div>
{current===c.code && <span style={{ color:A.gold }}>✓</span>} </button>
))} </div>
      </div>
    </div>
); }
function FilteredListModal({ title, clients, onClose }) {
  const [search,setSearch]=useState("");
  const displayed = search.trim() ? clients.filter(c=>matchSearch(c.nombre,search)||ma
  return (
 Case())
",align
20px 20
ansform
nd:curr
d:A.cya
=c.code
ttom:12
 tienes
y:ANTON
fontSiz
tchSear
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
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:1
        <div>
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
6 }}>
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
            <div style={{ height:8,background:A.border,borderRadius:4 }}>
<div style={{ height:"100%",width:`${pct}%`,background:col,borderRadius:
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
4,trans
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
    if(h){ const cl=cc.find(x=>x.code===h); if(cl){ await db.set(SK_SES,{code:cl.cod
    const ses=await db.get(SK_SES);
    if(ses?.code){ const cl=cc.find(x=>x.code===ses.code); if(cl){ setNav({cid:cl.id
    if (admValid) return setScreen("ahome");
    setScreen("home");
})(); },[]);
const sT=async v=>{ setTrips(v); await db.set(SK_T,v); };
const sC=async v=>{ setClients(v); await db.set(SK_C,v); };
 nColor
nge };
se,surv
l,passp
e}); se
}); ret
:
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
      <div style={{ flex:1,padding:"40px 28px" }}>
        {savedClient && (
          <div style={{ background:A.cyan+"15",border:`1px solid ${A.cyan}33`,borderRa
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
dius:16
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
<div style={{ background:A.red+"18",border:`1px solid ${A.red}44`,borderRadius <divstyle={{fontSize:40,marginBottom:12}}> </div>
<div style={{ fontFamily:ANTON,fontSize:20,color:A.red,marginBottom:8 }}>ACC
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
:16,pad
ESO BLO
           <div style={{ fontSize:14,color:A.muted,lineHeight:1.7 }}>{msg}</div>
        </div>
):( <>
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
/* ══════════════════════════════════════════════════════════════
   VOUCHER GENERATOR
══════════════════════════════════════════════════════════════ */
function VoucherGenerator({ onBack, trips }) {
  const [tab,setTab]=useState("editor");
  const [titulo,setTitulo]=useState("VOUCHER TRAVELIKE");
  const [logoFile,setLogoFile]=useState(null);
  const logoRef=useRef();
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
  const fmtD=raw=>{ if(!raw) return "—"; const [y,m,d]=raw.split("-"); return `${d}-${
  const reset=()=>{ if(!window.confirm("¿Limpiar todos los campos?")) return; setTitul
  const handleLogoUpload=async e=>{
    const f=e.target.files[0]; if(!f) return;
(status
ound:A.
ontWeig
}}>5 in
16 }}>V
width:
A.muted
m}-${y}
o("VOUC
   const b64=await fileToB64(f);
  setLogoFile(`data:${f.type};base64,${b64}`);
  e.target.value="";
};
const ensureLibs=async()=>{
  if(!window.html2canvas) await new Promise(res=>{ const s=document.createElement("s
  return loadJsPDF();
};
const buildPDF=async()=>{
  const JsPDF=await ensureLibs();
  const el=vRef.current;
  const canvas=await window.html2canvas(el,{scale:2,useCORS:true,backgroundColor:"#f
  const img=canvas.toDataURL("image/jpeg",0.92);
  const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
  const r=Math.min(pw/canvas.width,ph/canvas.height);
  pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);
  return pdf;
};
const downloadPDF=async()=>{ setGen(true); try { const pdf=await buildPDF(); pdf.sav
const shareWA=async()=>{
  setGen(true);
  try {
    const pdf=await buildPDF();
    const blob=pdf.output("blob");
    const file=new File([blob],"voucher-travelike.pdf",{type:"application/pdf"});
    if(navigator.canShare?.({files:[file]})) { await navigator.share({title:"Voucher
    else {
      const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.hr
      setTimeout(()=>window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(
    }
  } catch(e){ alert("Error: "+e.message); } setGen(false);
};
const ActBtns=()=>(
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
    <button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),b
    <button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),bo
  </div>
);
const LogoSection=({forPDF=false})=>{
  const h=forPDF?56:40;
  return logoFile
cript")
fffff"}
e("vouc
Travel
ef=url;
"¡Aquí
order:`
rder:"1
     ? <img src={logoFile} style={{height:h,maxWidth:forPDF?160:120,objectFit:"contai
    : <div style={{fontFamily:"Anton,sans-serif",fontSize:forPDF?30:20,color:"#1AB5B
};
const PreviewCard=()=>(
  <div style={{border:`1px solid ${A.border}`,borderRadius:12,overflow:"hidden",back
    <div style={{background:"#0D2137",padding:"18px 20px",display:"flex",justifyCont
      <LogoSection />
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:ANTON,fontSize:12,color:"#fff",letterSpacing:1}}>{ti
      </div>
    </div>
    <div style={{padding:"14px 18px",background:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-st
        <div>
          <div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"upp
          <div style={{fontFamily:ANTON,fontSize:13,color:"#0D2137",marginTop:3}}>{(
        </div>
        <div style={{textAlign:"right",background:"#F4F7FA",padding:"7px 10px",borde
          <div style={{fontSize:8,color:"#6B8399",letterSpacing:1}}>FECHAS</div>
          <div style={{fontSize:11,color:"#1A2B3C",fontWeight:600,marginTop:1}}>{fmt
        </div>
      </div>
      <div style={{background:"#0D2137",borderRadius:6,padding:"8px 12px",marginBott
        <div style={{fontSize:7,color:"#1AB5B0",letterSpacing:2,marginBottom:4}}>DAT
        <div style={{fontSize:10,color:"#fff",fontWeight:600}}>{BANK_IBAN}</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:1}}>Titular:
      </div>
      {lineas.filter(l=>l.desc||l.precio).length>0&&(
        <div style={{marginBottom:12}}>
          <div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"upp
          {lineas.filter(l=>l.desc||l.precio).map(l=>(
            <div key={l.id} style={{display:"flex",gap:8,padding:"5px 0",borderBotto
              <span style={{color:"#1AB5B0",fontSize:11}}>—</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#1A2B3C",fontWeight:500}}>{l.desc}</
                {l.sub&&<div style={{fontSize:9,color:"#6B8399",marginTop:1}}>{l.sub
              </div>
              <div style={{fontSize:11,color:"#0D2137",fontWeight:700,flexShrink:0}}
            </div>
))} </div>
      )}
      {(pago1||pago2)&&(
        <div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"upp
          {pago1&&<div style={{display:"flex",justifyContent:"space-between",padding
n"}} al
0",lett
ground:
ent:"sp
tulo.to
art",ma
ercase"
program
rRadius
D(salid
om:12}}
OS BANC
{BANK_
ercase"
m:"1px
div> }</div>
>{l.pre
ercase"
:"5px 0
           {pago2&&<div style={{display:"flex",justifyContent:"space-between",padding
          {nota&&<div style={{fontSize:10,color:"#6B8399",padding:"5px 0",fontStyle:
        </div>
      )}
      <div style={{marginTop:10,padding:"12px 14px",background:"#F4F7FA",borderRadiu
        <div style={{fontSize:9,color:"#6B8399",lineHeight:1.6}}>Este documento conf
      </div>
    </div>
    <div style={{background:"#0D2137",padding:"10px 18px",display:"flex",justifyCont
      <LogoSection />
      <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>www.travelike.es</div
    </div>
</div> );
return (
  <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:
    <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"ce
      <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.bord
      <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTra
      <button onClick={reset} style={{background:"transparent",border:`1px solid ${A
    </div>
    <div style={{display:"flex",borderBottom:`1px solid ${A.border}`,background:A.ca
{[["editor"," Editor"],["preview"," Vista previa"]].map(([k,l])=>( <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"11px",backgr
))} </div>
    {tab==="editor"?(
      <div style={{padding:"16px"}}>
        {/* LOGO */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
          <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {logoFile&&(
              <div style={{width:60,height:40,borderRadius:8,overflow:"hidden",borde
                <img src={logoFile} style={{maxWidth:"100%",maxHeight:"100%",objectF
              </div>
            )}
            <button onClick={()=>logoRef.current.click()} style={{flex:1,padding:"10
{logoFile?"✓ Logo subido — toca para cambiar":" Subir logo desde gal </button>
{logoFile&&<button onClick={()=>setLogoFile(null)} style={{background:"t
          </div>
        </div>
        <div style={{marginBottom:10}}>
   :"5px 0
"italic
s:6,bor
irma su
ent:"sp >
A.text,
nter",g
er}`,co
nsform:
.border
rd}}>
ound:"t
ansform
 onChan
r:`1px
it:"con
px 14px
ería"}
ranspar
       <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
      <input value={titulo} onChange={e=>setTitulo(e.target.value)} style={ais}/
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
      <input value={programa} onChange={e=>setPrograma(e.target.value)} placehol
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBotto
      <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,t
      <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,t
    </div>
    <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTrans
    {lineas.map(l=>(
      <div key={l.id} style={{background:A.card2,border:`1px solid ${A.border}`,
        <div style={{display:"flex",gap:8,marginBottom:7}}>
          <input value={l.desc} onChange={e=>updLinea(l.id,"desc",e.target.value
          <input value={l.precio} onChange={e=>updLinea(l.id,"precio",e.target.v
          <button onClick={()=>removeLinea(l.id)} style={{background:"none",bord
</div>
        <textarea value={l.sub} onChange={e=>updLinea(l.id,"sub",e.target.value)
      </div>
    ))}
    <button onClick={addLinea} style={{width:"100%",padding:"10px",border:`1.5px
    <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTrans
    <div style={{marginBottom:10}}>
      <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
      <input value={pago1lbl} onChange={e=>setPago1lbl(e.target.value)} style={a
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBotto
      <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,t
      <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,t
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
      <input type="date" value={pago2fecha} onChange={e=>setPago2fecha(e.target.
    </div>
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
      <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="
</div>
    <ActBtns/>
  </div>
):(
  <div style={{padding:16}}>
    <div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTra
    <PreviewCard/>
    <ActBtns/>
ansform >
ansform
der="Ej
m:14}}>
extTran
extTran
form:"u
borderR
)} plac
alue)}
er:"non
} place
 dashed
form:"u
ansform
is}/>
m:10}}>
extTran
extTran
ansform
value)}
ansform
Condici
nsform:
 </div> )}
{/* Hidden A4 element for PDF capture */}
<div style={{position:"fixed",left:-9999,top:0,width:794,pointerEvents:"none",zI
  <div ref={vRef} style={{width:794,minHeight:1000,background:"#fff",fontFamily:
    <div style={{background:"#0D2137",padding:"32px 40px",display:"flex",justify
      <div>
        {logoFile
          ? <img src={logoFile} style={{height:56,maxWidth:180,objectFit:"contai
          : <div style={{fontFamily:"Anton,sans-serif",fontSize:30,color:"#1AB5B
        }
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:3,m
      </div>
      <div style={{textAlign:"right"}}><div style={{fontFamily:"Anton,sans-serif
    </div>
    <div style={{padding:"32px 40px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"fle
        <div><div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransf
        <div style={{textAlign:"right",background:"#F4F7FA",borderRadius:8,paddi
      </div>
      <div style={{background:"#0D2137",borderRadius:8,padding:"16px 20px",margi
        <div style={{fontSize:9,color:"#1AB5B0",letterSpacing:2,textTransform:"u
        <div style={{display:"flex",gap:32}}><div><div style={{fontSize:10,color
      </div>
      {lineas.filter(l=>l.desc||l.precio).length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform
          {lineas.filter(l=>l.desc||l.precio).map(l=>(
            <div key={l.id} style={{display:"flex",gap:12,padding:"10px 0",borde
              <div style={{color:"#1AB5B0",fontSize:16}}>—</div>
              <div style={{flex:1}}><div style={{fontSize:14,color:"#1A2B3C",fon
              <div style={{fontFamily:"Anton,sans-serif",fontSize:14,color:"#0D2
</div> ))}
</div> )}
      {(pago1||pago2)&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform
          {pago1&&<div style={{display:"flex",gap:12,padding:"10px 0",borderBott
          {pago2&&<div style={{display:"flex",gap:12,padding:"10px 0",borderBott
          {nota&&<div style={{fontSize:12,color:"#6B8399",padding:"8px 0",fontSt
</div> )}
      <div style={{marginTop:32,padding:"20px 24px",background:"#F4F7FA",borderR
    </div>
ndex:-1
"'Barlo
Content
n"}} al
0",lett
arginTo
",fontS
x-start
orm:"up
ng:"12p
nBottom
ppercas
:"rgba(
:"upper
rBottom
tWeight
137",le
:"upper
om:"1px
om:"1px
yle:"it
adius:8
           <div style={{background:"#0D2137",padding:"16px 40px",display:"flex",justify
            {logoFile
              ? <img src={logoFile} style={{height:40,maxWidth:140,objectFit:"contain"
              : <div style={{fontFamily:"Anton,sans-serif",fontSize:20,color:"#1AB5B0"
            }
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>www.travelike.es
          </div>
        </div>
      </div>
</div> );
}
/* ══════════════════════════════════════════════════════════════
   PRESUPUESTO GENERATOR
══════════════════════════════════════════════════════════════ */
function PresupuestoGenerator({ onBack, trips }) {
  const [tab,setTab]=useState("general");
  const [destino,setDestino]=useState("");
  const [agente,setAgente]=useState("TraveLike");
  const [pax,setPax]=useState("1");
  const [moneda,setMoneda]=useState("EUR");
  const [accentColor,setAccentColor]=useState("#00f0ff");
  // Hero
  const [heroTitulo,setHeroTitulo]=useState("");
  const [heroSub,setHeroSub]=useState("");
  const [heroImgBase64,setHeroImgBase64]=useState("");
  const heroImgRef=useRef();
  // Fechas generales
  const [fechaSalida,setFechaSalida]=useState("");
  const [fechaRegreso,setFechaRegreso]=useState("");
  // Vuelos
  const [vuelosEnabled,setVuelosEnabled]=useState(true);
  const [vueloIda,setVueloIda]=useState({ruta:"",aerolinea:"",fecha:"",hora:"",equipaj
  const [vueloVuelta,setVueloVuelta]=useState({ruta:"",aerolinea:"",fecha:"",hora:"",e
  // Hotel
  const [hotelEnabled,setHotelEnabled]=useState(true);
  const [hotelNombre,setHotelNombre]=useState("");
  const [hotelLugar,setHotelLugar]=useState("");
  const [hotelStars,setHotelStars]=useState(4);
  const [hotelImgBase64,setHotelImgBase64]=useState("");
  const hotelImgRef=useRef();
  const [hotelCaracts,setHotelCaracts]=useState([]);
Content
}} alt=
,letter
</div>
e:""});
quipaje
 const [hotelCaractCustom,setHotelCaractCustom]=useState("");
// Actividades
const [actEnabled,setActEnabled]=useState(false); const[actividades,setActividades]=useState([{id:uid(),em:" ",nombre:"",desc:""}]);
// Incluye
const [incluye,setIncluye]=useState([
{id:uid(),em:" ",txt:"Vuelosinternacionales"}, {id:uid(),em:" ",txt:"Alojamientoenhotel"}, {id:uid(),em:" ",txt:"Guíaturístico"}, {id:uid(),em:" ",txt:"Segurodeviaje"}
]);
// Precios
const [preciosEnabled,setPreciosEnabled]=useState(true);
const [precios,setPrecios]=useState([
  {id:uid(),concepto:"Precio por persona",importe:""},
  {id:uid(),concepto:"Vuelos",importe:""}
]);
const [hasDesc,setHasDesc]=useState(false);
const [descConc,setDescConc]=useState("Descuento especial");
const [descImp,setDescImp]=useState("");
const [notas,setNotas]=useState("Precio sujeto a disponibilidad. Válido 7 días desde
const [ctaWa,setCtaWa]=useState(WA_NUM);
const [gen,setGen]=useState(false);
const preRef=useRef();
const [monMenu,setMonMenu]=useState(false);
const sym=getCurrencySymbol(moneda);
const fmtM=(v)=>{ if(!v) return "—"; const n=parseFloat((v||"").replace(",",".")); r
const paxN=Math.max(1,parseInt(pax)||1);
const sub=precios.reduce((a,p)=>a+(parseFloat((p.importe||"").replace(",","."))||0),
const desc=hasDesc?(parseFloat((descImp||"").replace(",","."))||0):0;
const total=(sub-desc)*paxN;
constaddAct=()=>setActividades(a=>[...a,{id:uid(),em:" ",nombre:"",desc:""}]); const removeAct=id=>setActividades(a=>a.filter(x=>x.id!==id));
const updAct=(id,f,v)=>setActividades(as=>as.map(x=>x.id===id?{...x,[f]:v}:x)); constaddInc=()=>setIncluye(i=>[...i,{id:uid(),em:" ",txt:""}]);
const removeInc=id=>setIncluye(i=>i.filter(x=>x.id!==id));
const updInc=(id,f,v)=>setIncluye(is=>is.map(x=>x.id===id?{...x,[f]:v}:x));
const addPrecio=()=>setPrecios(p=>[...p,{id:uid(),concepto:"",importe:""}]);
const removePrecio=id=>setPrecios(p=>p.filter(x=>x.id!==id));
const updPrecio=(id,f,v)=>setPrecios(ps=>ps.map(x=>x.id===id?{...x,[f]:v}:x));
       const toggleCaract=k=>{
la fec
eturn i 0);
   const preset=HOTEL_CARACTS_PRESETS.find(p=>p.k===k);
  setHotelCaracts(prev=>prev.some(c=>c.k===k)?prev.filter(c=>c.k!==k):[...prev,prese
};
const addCaractCustom=()=>{
if(!hotelCaractCustom.trim()) return; setHotelCaracts(prev=>[...prev,{k:`c_${uid()}`,icon:" ",label:hotelCaractCustom.t setHotelCaractCustom("");
};
const handleHeroImgUpload=async e=>{
  const f=e.target.files[0]; if(!f) return;
  const b64=await fileToB64(f);
  setHeroImgBase64(`data:${f.type};base64,${b64}`);
  e.target.value="";
};
const handleHotelImgUpload=async e=>{
  const f=e.target.files[0]; if(!f) return;
  const b64=await fileToB64(f);
  setHotelImgBase64(`data:${f.type};base64,${b64}`);
  e.target.value="";
};
const PALETA=[{c:"#00f0ff",l:"Cyan"},{c:"#ffc847",l:"Gold"},{c:"#e8002a",l:"Rojo"},{
const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit"
const downloadPDF=async()=>{
  setGen(true);
  try {
    if(!window.html2canvas) await new Promise(res=>{ const s=document.createElement(
    const JsPDF=await loadJsPDF();
    const el=preRef.current;
    const canvas=await window.html2canvas(el,{scale:3,useCORS:true,backgroundColor:"
    const img=canvas.toDataURL("image/jpeg",0.92);
    const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
    const r=Math.min(pw/canvas.width,ph/canvas.height);
    pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);
    pdf.save(`presupuesto-${destino||"travelike"}.pdf`);
  } catch(e){ alert("Error: "+e.message); }
  setGen(false);
};
const shareWA=async()=>{
  setGen(true);
  try {
    if(!window.html2canvas) await new Promise(res=>{ const s=document.createElement(
    const JsPDF=await loadJsPDF();
 t||{k,i
rim()}
c:"#34C
,month:
"script
#07070f
"script
]
     const el=preRef.current;
    const canvas=await window.html2canvas(el,{scale:3,useCORS:true,backgroundColor:"
    const img=canvas.toDataURL("image/jpeg",0.92);
    const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
    const r=Math.min(pw/canvas.width,ph/canvas.height);
    pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);
    const blob=pdf.output("blob");
    const fn=`presupuesto-${destino||"travelike"}.pdf`;
    const file=new File([blob],fn,{type:"application/pdf"});
    if(navigator.canShare?.({files:[file]})) { await navigator.share({title:"Presupu
    else {
      const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.hr
      setTimeout(()=>window.open(`https://wa.me/${ctaWa.replace(/\D/g,"")}?text=${en
    }
  } catch(e){ alert("Error: "+e.message); }
  setGen(false);
};
const TABS_P=[
["general"," General"],["vuelos"," Vuelos"],["hotel"," Hotel"], ["actividades"," Actividades"],["incluye"," Incluye"],["precios"," Precios"]
];
const secStyle={fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,textTrans
const lbl={fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"upp
const UploadImgBtn=({imgBase64,onUpload,onClear,inputRef,label})=>(
  <div style={{marginBottom:10}}>
    <div style={lbl}>{label}</div>
    <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onCh
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      {imgBase64&&(
        <div style={{width:60,height:44,borderRadius:8,overflow:"hidden",border:`1px
          <img src={imgBase64} style={{width:"100%",height:"100%",objectFit:"cover"}
        </div>
      )}
      <button onClick={()=>inputRef.current.click()} style={{flex:1,padding:"10px 14
{imgBase64?"✓ Imagen subida — toca para cambiar":" Subir imagen desde gale </button>
{imgBase64&&<button onClick={onClear} style={{background:"transparent",border:
    </div>
  </div>
);
const VueloBlock=({label,color,state,setState})=>(
  <div style={{background:A.card2,border:`2px solid ${color}33`,borderRadius:14,padd
       <div style={{fontFamily:ANTON,fontSize:13,color:color,letterSpacing:2,textTransf
#07070f
esto Tr
ef=url;
codeURI
,["dis
form:"u
ercase"
ange={o
solid } alt="
px",bac
ría"}
"none",
ing:14,
orm:"up
e
     <div style={{marginBottom:8}}><div style={lbl}>Ruta</div><input value={state.rut
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}
      <div><div style={lbl}>Aerolínea</div><input value={state.aerolinea} onChange={
      <div><div style={lbl}>Fecha</div><input type="date" value={state.fecha} onChan
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <div><div style={lbl}>Hora</div><input value={state.hora} onChange={e=>setStat
      <div><div style={lbl}>Equipaje incluido</div><input value={state.equipaje} onC
    </div>
</div> );
const QuoteCard=({forPDF=false})=>{
  const cardStyle=forPDF
    ?{width:390,background:"#07070f",borderRadius:20,overflow:"hidden",fontFamily:"'
    :{width:"100%",background:"#07070f",borderRadius:16,overflow:"hidden",fontFamily
  const vuelosDisplay=[];
  if(vuelosEnabled){
    if(vueloIda.ruta||vueloIda.aerolinea) vuelosDisplay.push({...vueloIda,_label:"ID
    if(vueloVuelta.ruta||vueloVuelta.aerolinea) vuelosDisplay.push({...vueloVuelta,_
  }
  return (
    <div style={cardStyle}>
      {/* Hero */}
      <div style={{position:"relative",minHeight:160,padding:"40px 16px 22px",displa
        background:heroImgBase64?undefined:"#07070f",
        backgroundImage:heroImgBase64?`url(${heroImgBase64})`:"linear-gradient(135de
        backgroundSize:"cover",backgroundPosition:"center"}}>
        {heroImgBase64&&<div style={{position:"absolute",inset:0,background:"linear-
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:10,color:accentColor,letterSpacing:3,textTransform:"
          <div style={{fontFamily:ANTON,fontSize:28,color:"#fff",lineHeight:1,margin
          {heroSub&&<div style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeig
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
            <div style={{display:"inline-block",background:`${accentColor}22`,border
            {fechaSalida&&fechaRegreso&&(
              <div style={{display:"inline-block",background:`${accentColor}15`,bord
                   {fmtDate(fechaSalida)} → {fmtDate(fechaRegreso)}
</div> )}
          </div>
        </div>
      </div>
      {/* Vuelos IDA/VUELTA */}
 a} onCh
>
e=>setS
ge={e=>
e(s=>({
hange={
Barlow
:BF,box
A "} label:"
y:"flex
g,#0707
gradien
upperca
Bottom:
ht:1.4}
:`1px s
er:`1px
 )
 {vuelosDisplay.length>0&&(
  <div style={{padding:"14px 16px",borderBottom:`1px solid ${accentColor}15`}}
    <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"u
    {vuelosDisplay.map((v,i)=>(
      <div key={i} style={{background:`${accentColor}08`,border:`1px solid ${a
        <div style={{fontSize:8,color:accentColor,fontFamily:BF,fontWeight:700
        <div style={{fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:0
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2}}>
{[v.aerolinea,v.fecha&&fmtDate(v.fecha),v.hora&&` ${v.hora}`,v.equ </div>
</div> ))}
</div> )}
{/* Hotel */}
{hotelEnabled&&hotelNombre&&(
  <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}
    <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"u
    <div style={{background:"#0f1824",borderRadius:8,padding:"10px 12px",displ
      {hotelImgBase64&&<div style={{width:52,height:52,borderRadius:6,backgrou
      <div style={{flex:1}}>
<div style={{fontFamily:ANTON,fontSize:15,color:"#fff",letterSpacing:0 <div style={{fontSize:10,color:accentColor,marginTop:2}}>{"★".repeat(h {hotelLugar&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)",ma
      </div>
    </div>
    {hotelCaracts.length>0&&(
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
        {hotelCaracts.map(c=>(
          <div key={c.k} style={{background:`${accentColor}10`,border:`1px sol
            <span style={{fontSize:12}}>{c.icon}</span>{c.label}
          </div>
))} </div>
)} </div>
)}
{/* Actividades */}
{actEnabled&&actividades.filter(a=>a.nombre).length>0&&(
  <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}
    <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"u
    {actividades.filter(a=>a.nombre).map(a=>(
      <div key={a.id} style={{display:"flex",gap:8,padding:"5px 0",borderBotto
        <span style={{fontSize:16}}>{a.em}</span>
        <div><div style={{fontSize:12,color:"#fff",fontFamily:BF,fontWeight:70
 > ppercas
ccentCo
,letter
.5}}>{v
ipaje&
>
ppercas
ay:"fle
nd:`url
.5}}>{h
otelSta
rginTop
id ${ac
> ppercas
m:`1px
0}}>{a.
&
 </div> ))}
</div> )}
{/* Incluye */}
{incluye.filter(i=>i.txt).length>0&&(
  <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}
    <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"u
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
      {incluye.filter(i=>i.txt).map(i=>(
        <div key={i.id} style={{background:`${accentColor}08`,border:`1px soli
          <span style={{fontSize:12}}>{i.em}</span>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.75)",lineHeight:
        </div>
))} </div>
</div> )}
{/* Precios */}
{preciosEnabled&&(
  <div style={{padding:"14px 16px",background:"#0a0d16",borderBottom:`1px soli
    <div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"u
    <div style={{fontFamily:ANTON,fontSize:30,color:accentColor,letterSpacing:
    <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:10}}>
    {precios.filter(p=>p.concepto||p.importe).map(p=>(
      <div key={p.id} style={{display:"flex",justifyContent:"space-between",pa
        <span style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>{p.concepto
        <span style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:70
</div> ))}
    {hasDesc&&<div style={{display:"flex",justifyContent:"space-between",paddi
      <span style={{fontSize:11,color:"#4ade80"}}>{descConc}</span>
      <span style={{fontSize:11,color:"#4ade80",fontWeight:700}}>− {fmtM(descI
    </div>}
  </div>
)}
{/* Notas */}
{notas&&(
  <div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}
    <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:2,tex
    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>{n
</div> )}
> ppercas
d ${acc
1.3}}>{
d ${acc
ppercas
1,margi
Total {
dding:"
}</span
0}}>{fm
ng:"4px
mp)}</s
>
tTransf
otas}</
       {/* CTA */}
      <div style={{padding:"16px",background:`${accentColor}15`,borderTop:`1px solid
        <div style={{fontSize:13,color:"#fff",fontFamily:ANTON,letterSpacing:1,textT
        <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:10}}>Con
        <div style={{background:accentColor,color:"#07070f",borderRadius:8,padding:"
      </div>
      <div style={{padding:"10px 16px",background:"#07070f",display:"flex",justifyCo
        <div style={{fontFamily:ANTON,fontSize:14,color:accentColor,letterSpacing:2}
        <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:BF}}>www.tr
      </div>
</div> );
};
const ActBtns2=()=>(
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
    <button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),b
    <button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),bo
  </div>
);
return (
  <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:
    <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"ce
      <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.bord
      <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTra
      {preciosEnabled&&total>0&&<div style={{fontFamily:ANTON,fontSize:14,color:acce
</div>
    <div style={{overflowX:"auto",borderBottom:`1px solid ${A.border}`,background:A.
      {TABS_P.map(([k,l])=>(
        <button key={k} onClick={()=>setTab(k)} style={{flexShrink:0,background:"tra
      ))}
</div>
    <div style={{padding:"14px 16px"}}>
      {/* TAB GENERAL */}
      {tab==="general"&&(
        <div>
          <div style={secStyle}>DATOS GENERALES</div>
          <div style={{marginBottom:10}}><div style={lbl}>Destino</div><input value=
          <div style={{marginBottom:10}}><div style={lbl}>Nombre del agente / agenci
          <div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginB
            <div><div style={lbl}>No de pasajeros</div><input value={pax} onChange={
            <div><div style={lbl}>Moneda</div><button onClick={()=>setMonMenu(true)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBot
 ${acce
ransfor
sulta d
10px",t
ntent:"
}>TRAVE
avelike
order:`
rder:"1
A.text,
nter",g
er}`,co
nsform:
ntColor
card,di
nsparen
{destin
a</div>
ottom:1
e=>setP
 style=
tom:10}
       <div><div style={lbl}>Fecha salida</div><input type="date" value={fechaS
      <div><div style={lbl}>Fecha regreso</div><input type="date" value={fecha
    </div>
    <div style={{marginBottom:10}}><div style={lbl}>Número WhatsApp (CTA)</div
    <div style={secStyle}>BANNER / HERO</div>
    <div style={{marginBottom:10}}><div style={lbl}>Título principal</div><inp
    <div style={{marginBottom:10}}><div style={lbl}>Subtítulo</div><input valu
    <UploadImgBtn imgBase64={heroImgBase64} onUpload={handleHeroImgUpload} onC
</div> )}
{/* TAB VUELOS */}
{tab==="vuelos"&&(
  <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      <div style={{...secStyle,flex:1,marginBottom:0}}>VUELOS</div>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"
        <input type="checkbox" checked={vuelosEnabled} onChange={e=>setVuelosE
        <span style={{fontFamily:BF,fontSize:11,color:vuelosEnabled?accentColo
  </label>
</div>
{vuelosEnabled?(
  <>
    <VueloBlock label="
    <VueloBlock label="
  </>
VUELO DE IDA" color={accentColor} state={vueloId
VUELO DE VUELTA" color={A.gold} state={vueloVuel
      ):(
      <div style={{background:A.card2,borderRadius:12,padding:"20px",textAlign
<divstyle={{fontSize:32,marginBottom:8}}> </div>
        <div style={{fontFamily:BF,fontSize:13,color:A.muted}}>Sección de vuel
      </div>
)} </div>
)}
{/* TAB HOTEL */}
{tab==="hotel"&&(
  <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <div style={{...secStyle,flex:1,marginBottom:0}}>HOTEL / ALOJAMIENTO</di
      <input type="checkbox" checked={hotelEnabled} onChange={e=>setHotelEnabl
    </div>
    {hotelEnabled&&(
      <>
        <div style={{marginBottom:10}}><div style={lbl}>Nombre del hotel</div>
        <div style={{marginBottom:10}}><div style={lbl}>Ubicación</div><input
        <div style={{marginBottom:12}}>
 alida}
Regreso
><input
ut valu
e={hero
lear={(
}}>
nabled(
r:A.mut
a} set ta} se
:"cente
os desa
v> ed(e.ta
<input
value={
S t
           <div style={lbl}>Estrellas</div>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setHotelStars(n)} style={{fontSize:
))} </div>
        </div>
        <UploadImgBtn imgBase64={hotelImgBase64} onUpload={handleHotelImgUploa
        {/* Características rápidas */}
        <div style={{marginBottom:12}}>
          <div style={lbl}>Características del hotel</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marg
            {HOTEL_CARACTS_PRESETS.map(c=>{
              const sel=hotelCaracts.some(x=>x.k===c.k);
              return (
                <button key={c.k} onClick={()=>toggleCaract(c.k)}
                  style={{background:sel?accentColor+"22":A.card,border:`2px s
                  <span style={{fontSize:18}}>{c.icon}</span>
                  <span style={{fontFamily:BF,fontSize:11,fontWeight:sel?700:4
                  {sel&&<span style={{color:accentColor,fontSize:14,flexShrink
</button> );
})} </div>
          <div style={{display:"flex",gap:8}}>
            <input value={hotelCaractCustom} onChange={e=>setHotelCaractCustom
            <button onClick={addCaractCustom} style={{...ab(accentColor+"22",a
          </div>
          {hotelCaracts.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
              {hotelCaracts.map(c=>(
                <div key={c.k} style={{display:"flex",alignItems:"center",gap:
                  <span style={{fontSize:13}}>{c.icon}</span>
                  <span style={{fontFamily:BF,fontSize:11,color:accentColor,fo
                  <button onClick={()=>setHotelCaracts(prev=>prev.filter(x=>x.
</div> ))}
</div> )}
</div> </>
)} </div>
)}
{/* TAB ACTIVIDADES */}
{tab==="actividades"&&(
24,back
d} onCl
inBotto
olid ${
00,colo
:0}}>✓<
(e.targ
ccentCo
6,backg
ntWeigh
k!==c.k
   <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <div style={{...secStyle,flex:1,marginBottom:0}}>ACTIVIDADES</div>
      <input type="checkbox" checked={actEnabled} onChange={e=>setActEnabled(e
    </div>
    {actEnabled&&(
      <>
        {actividades.map((a,i)=>(
          <div key={a.id} style={{background:A.card2,border:`1px solid ${A.bor
            <div style={{display:"flex",justifyContent:"space-between",marginB
              <div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSp
              <button onClick={()=>removeAct(a.id)} style={{background:"none",
            </div>
            <div style={{display:"grid",gridTemplateColumns:"50px 1fr",gap:8,m
              <div><div style={lbl}>Emoji</div><input value={a.em} onChange={e
              <div><div style={lbl}>Nombre</div><input value={a.nombre} onChan
            </div>
            <div><div style={lbl}>Descripción</div><input value={a.desc} onCha
          </div>
))}
        <button onClick={addAct} style={{width:"100%",padding:"10px",border:`1
      </>
)} </div>
)}
{/* TAB INCLUYE */}
{tab==="incluye"&&(
  <div>
    <div style={secStyle}>QUÉ INCLUYE</div>
    {incluye.map(it=>(
      <div key={it.id} style={{display:"flex",gap:8,alignItems:"center",margin
        <input value={it.em} onChange={e=>updInc(it.id,"em",e.target.value)} s
        <input value={it.txt} onChange={e=>updInc(it.id,"txt",e.target.value)}
        <button onClick={()=>removeInc(it.id)} style={{background:"none",borde
</div> ))}
    <button onClick={addInc} style={{width:"100%",padding:"10px",border:`1.5px
    <div style={secStyle}>CONDICIONES / NOTAS</div>
    <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={4} st
</div> )}
{/* TAB PRECIOS */}
{tab==="precios"&&(
  <div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
.target
der}`,b
ottom:8
acing:2
border:
arginBo
=>updAc
ge={e=>
nge={e=
.5px da
Bottom:
tyle={{
 placeh
r:"none
 dashed
yle={{.
       <div style={{...secStyle,flex:1,marginBottom:0}}>DESGLOSE DE PRECIOS</di
      <input type="checkbox" checked={preciosEnabled} onChange={e=>setPreciosE
    </div>
    {preciosEnabled&&(
      <>
        {precios.map(p=>(
          <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 120p
            <input value={p.concepto} onChange={e=>updPrecio(p.id,"concepto",e
            <input value={p.importe} onChange={e=>updPrecio(p.id,"importe",e.t
            <button onClick={()=>removePrecio(p.id)} style={{background:"none"
</div> ))}
        <button onClick={addPrecio} style={{width:"100%",padding:"10px",border
        <div style={{background:A.card2,borderRadius:10,padding:12,marginBotto
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"poin
            <input type="checkbox" checked={hasDesc} onChange={e=>setHasDesc(e
            <span style={{fontFamily:BF,fontSize:12,color:A.muted,textTransfor
          </label>
          {hasDesc&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 120px",gap:8}
              <input value={descConc} onChange={e=>setDescConc(e.target.value)
              <input value={descImp} onChange={e=>setDescImp(e.target.value)}
</div> )}
        </div>
        <div style={{background:`${accentColor}12`,border:`1px solid ${accentC
          <div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacin
          <div style={{fontFamily:ANTON,fontSize:28,color:accentColor,letterSp
          <div style={{fontFamily:BF,fontSize:11,color:A.muted,marginTop:2}}>{
</div> </>
)} </div>
)}
{/* TAB DISEÑO */}
{tab==="diseno"&&(
  <div>
    <div style={secStyle}>COLOR ACENTO</div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
      {PALETA.map(({c,l})=>(
        <button key={c} onClick={()=>setAccentColor(c)} title={l}
          style={{width:36,height:36,borderRadius:"50%",background:c,border:ac
      ))}
    </div>
    <div style={{marginBottom:16}}>
<div style={lbl}>Color personalizado</div>
v> nabled(
x 28px"
.target
arget.v
,border
:`1.5px
m:12,bo
ter",ma
.target
m:"uppe
}>
} place
placeho
olor}30
g:2,tex
acing:1
paxN} p
centCol
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="color" value={accentColor} onChange={e=>setAccentColor(e.
                <input value={accentColor} onChange={e=>setAccentColor(e.target.value)
              </div>
            </div>
            <div style={secStyle}>VISTA PREVIA</div>
            <QuoteCard/>
            <ActBtns2/>
</div> )}
        {/* Vista previa en tiempo real */}
        {tab!=="diseno"&&(
          <div style={{marginTop:20}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTr
            <QuoteCard/>
            <ActBtns2/>
</div> )}
</div>
      {/* Hidden element for PDF */}
      <div style={{position:"fixed",left:-9999,top:0,width:390,pointerEvents:"none",zI
        <div ref={preRef}><QuoteCard forPDF={true}/></div>
      </div>
      {monMenu&&<CurrencyMenu current={moneda} onSelect={c=>{setMoneda(c);setMonMenu(f
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
target.
} style
ansform
ndex:-1
alse);}
");
etTripY
te("");
useStat
; smissed
 const totalConfirmados=clients.filter(c=>c.status==="confirmado"||c.status==="pagado
const addTrip=()=>{
if(!tripName.trim()||tripYear.length!==4) return;
const date=`${tripYear}-${String(tripMonth).padStart(2,"0")}`; sT([...trips,{id:`t${uid()}`,name:tripName.trim(),flag:tripFlag||" ",date,price: setAddTripModal(false);setTripName("");setTripFlag(" ");setTripMonth(String(NO
};
const delTrip=id=>{ if(!window.confirm("¿Eliminar viaje? Los clientes se conservarán
const passWarnList=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpi
const passExpireYear=clients.filter(c=>{ const d=daysUntilExpiry(c.passportExpiry);
if(subScreen==="voucher") return <VoucherGenerator onBack={()=>setSubScreen(null)} t
if(subScreen==="presupuesto") return <PresupuestoGenerator onBack={()=>setSubScreen(
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
  ").leng
tripPr
W.getM
 en tu
ryDismi
return
rips={t
null)}
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
i o
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
  {passExpireYear.length>0&&(
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
     },{l:"V
ng:"7px
{item.v
percase
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
`
         </div>
      </div>
))} </div>
)}
{[{icon:" ",label:"Clientes",desc:`${totalViajeros}registrados`,color:A.gre
{icon:" ",label:"Notificaciones",desc:"OneSignalpush",color:A.purple,acti {icon:" ",label:"Vouchers",desc:"GeneradocumentosdereservaPDF",color:A {icon:" ",label:"Presupuestos",desc:"Cotizacionesvisualesparaclientes",
].map(item=>(
  <button key={item.label} onClick={item.action} style={{ width:"100%",backgro
    <div style={{ position:"absolute",top:-20,right:-20,width:80,height:80,bor
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
    en,act
on:()=
.gold,
color:
und:A.c
derRadi
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
i > a "
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
 tom:10
 ...ais
der="No
tom:10
={ais}>
D/g,"")
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
orm:"up
ght:36,
olid ${
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
        <input key={c.id+"_cdoc"} defaultValue={c.docNumero||""} onBlur={e=>
          style={{ ...ais,fontFamily:ANTON,fontSize:20,letterSpacing:3,textA
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margi
        <div>
          <div style={{ fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:
          <input key={c.id+"_cbday"} type="text" inputMode="numeric" placeho
            onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""); l
            onBlur={e=>updC(c.id,x=>({...x,birthDate:displayToISO(e.target.v
            style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,
</div> <div>
          <div style={{ fontFamily:BF,fontSize:9,color:passportWarn(c.passpo
          <input key={c.id+"_cexp"} type="text" inputMode="numeric" placehol
            onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""); l
            onBlur={e=>updC(c.id,x=>({...x,passportExpiry:displayToISO(e.tar
            style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,
        </div>
      </div>
      {c.docNumero&&<div style={{ background:A.green+"10",border:`1px solid
    </div>
x",marg
>
round:A
ht:"100
wrap",o
{trip?`
ound:"t
8px",bo
.color+
cyan+"1
=>{ set
x:1,fon
={{ ...
olid ${
xtTrans
,textTr
updC(c.
lign:"c
nBottom
2,textT
lder="D
et fmt=
alue)})
color:A
rtExpir
der="DD
et fmt=
get.val
color:p
${A.gre
 )} </div>
); })}
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
      setSent({ title, count, ok, errorMsg, simulated: result.simulated });
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
                  <div><input value={t.title} onChange={e=>updTemplate(t.id,{title:e
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
.target
                   ):(
                    <div><div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:
)} </div>
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
  const updClient=async(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
  const addPass=(file,cid)=>{ const r=new FileReader(); r.onload=e=>updClient(cid,c=>(
A.text
{ backg
ontSize
split("
); cons
ding:"6
00vh",f
{...c,p
 const hasUrgent=c=>(trip.pagosConfig||[]).some((p,i)=>{ const st=(c.pagosEstado||[])
const setRoommate=async(aId,bId)=>{ sC(clients.map(c=>{ if(c.id===aId) return {...c,
const PeopleTab=()=>{
  const confirmed=tc.filter(c=>c.status==="confirmado"||c.status==="pagado");
  const interesados=tc.filter(c=>c.status==="interesado");
  const [listModal,setListModal]=useState(false); const [listView,setListView]=useSt
  const [copied2,setCopied2]=useState(false);
  const [addModal,setAddModal]=useState(null);
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
confirmed.forEach((c)=>{
      if(seen.has(c.id)) return; seen.add(c.id);
      const bday=c.birthDate?new Date(c.birthDate+"T12:00:00").toLocaleDateString("e
      const exp=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDate
      lines.push(`${lines.length-4}. ${c.nombre} | ${c.docNumero||"—"} | ${bday} | $
      if(c.groupId){ confirmed.filter(x=>x.groupId===c.groupId&&x.id!==c.id).forEach
 [i]; re
roommat
ate("co
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
s-ES",{
String(
{exp}`)
(gm=>{
b
     (c.acompanantes||[]).forEach(a=>{ const abday=a.birthDate?new Date(a.birthDate
  });
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
      {(confirmed.length>0||interesados.length>0) && <button onClick={()=>setListM
    </div>
    {tc.length===0?<AEmpty text="Sin viajeros aún" />:tc.map(c=>{
      const st=ST.find(s=>s.key===c.status)||ST[0];
      const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;
      const urgent=hasUrgent(c);
      const roommate=c.roommateId?clients.find(x=>x.id===c.roommateId):null;
      const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_P
      return (
        <div key={c.id} style={{ background:A.card,borderRadius:14,padding:"12px 1
          {urgent && <div style={{ background:A.orange+"22",border:`1px solid ${A.
          {c.groupId && (()=>{ const gMembers=tc.filter(x=>x.groupId===c.groupId&&
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }
            <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto,c
              style={{ width:44,height:44,borderRadius:10,overflow:"hidden",cursor
              {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",he
</div>
+"T12:0
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
odal(tr
AGO[0];
4px",ma
orange}
x.id!==
}>
id:c.id
:"point
ight:"1
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
<div style={{ display:"flex",gap:6,marginTop:6 }}>
  {(()=>{ const link=`${window.location.href.split("#")[0]}#${c.code}`;
</div>
{c.consentDate && (
  <div style={{ marginTop:6,background:A.green+"10",border:`1px solid ${
<spanstyle={{fontSize:12}}> </span>
    <div style={{ flex:1 }}><span style={{ fontFamily:BF,fontSize:10,col
  </div>
)}
<div style={{ marginTop:10,background:c.docVerified?A.green+"0e":A.bg,bo
<div style={{ padding:"8px 12px",background:c.docVerified?A.green+"18" <spanstyle={{fontSize:14}}> </span>
<span style={{ fontFamily:BF,fontSize:10,letterSpacing:2,textTransfo {c.docVerified?<span style={{ fontFamily:BF,fontSize:9,color:A.green
  </div>
  <div style={{ display:"flex",gap:12,padding:"12px" }}>
    <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto
      style={{ width:72,height:90,borderRadius:10,overflow:"hidden",curs
      {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",
    </div>
    <div style={{ flex:1,minWidth:0 }}>
      <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing
      <input key={c.id+"_doc"} defaultValue={c.docNumero||""} onBlur={e=
        style={{ ...ais,fontFamily:ANTON,fontSize:26,letterSpacing:4,tex
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }
        <div>
          <div style={{ fontFamily:BF,fontSize:9,color:A.gold,letterSpac
          <input key={c.id+"_bday"} type="text" inputMode="numeric" plac
  onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""
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
or:A.gr
rderRad
:A.card
rm:"upp
,fontWe
,cid:c.
or:"poi
height:
:2,text
>updCli
tAlign:
}>
ing:2,t
eholder
); let
                   onBlur={e=>updClient(c.id,x=>({...x,birthDate:displayToISO(e
                  style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize
              </div>
              <div>
                <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpa
                <input key={c.id+"_exp"} type="text" inputMode="numeric" place
                  onChange={e=>{ const raw=e.target.value.replace(/[^0-9]/g,""
                  onBlur={e=>updClient(c.id,x=>({...x,passportExpiry:displayTo
                  style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize
              </div>
            </div>
          </div>
        </div>
        <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"poin
          <input type="checkbox" checked={!!c.docVerified} onChange={e=>updCli
          <span style={{ fontFamily:BF,fontSize:12,color:c.docVerified?A.green
        </label>
      </div>
</div> );
})}
<input ref={passRef} type="file" accept="image/*" capture="environment" style=
<input ref={chPassRef} type="file" accept="image/*" capture="environment" styl
{passModal && (
  <PassportModal modal={passModal} onClose={()=>setPassModal(null)}
    onSave={(docNum,expiry,birthDate)=>{ updClient(passModal.cid,c=>({...c,doc
    onChangePhoto={()=>{ chPassRef.current.value=""; chPassRef.current.click()
    onDelete={()=>{ updClient(passModal.cid,c=>({...c,passportPhoto:null,docNu
)}
{listModal && (
  <div style={{ position:"fixed",inset:0,zIndex:2000,background:A.bg,display:"
    <div style={{ position:"sticky",top:0,zIndex:10,background:A.bg,borderBott
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14
        <button onClick={()=>setListModal(false)} style={{ background:"transpa
        <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:20,col
        <button onClick={()=>{ navigator.clipboard.writeText(currentList).then
      </div>
      <div style={{ display:"flex",gap:6,paddingBottom:0 }}>
{[["confirmados"," ","Rooming",A.green,confirmed.length],["vuelo"," <button key={key} onClick={()=>{ setListView(key); setCopied2(false)
            {ic} {lbl}{cnt!=null?` (${cnt})`:""}</button>
        ))}
      </div>
    </div>
    <div style={{ padding:"20px 20px 120px",flex:1 }}>
      {listView==="confirmados"&&confirmed.map(c=>{ const rm=ROOMS[c.room||"do
      {listView==="vuelo"&&(()=>{
 .target
:13,col
cing:2,
holder=
); let
ISO(e.t
:13,col
ter",pa
ent(c.i
:A.mute
{{ disp
e={{ di
Numero:
; }}
mero:""
flex",f
om:`1px
}}>
rent",b
or:A.te
(()=>{
","Fli ; }} st
ble_jun
 g
         const seen=new Set(); const rows=[]; let num=1;
        confirmed.forEach(c=>{
          if(seen.has(c.id)) return; seen.add(c.id);
          const groupPax=[c,...(c.groupId?confirmed.filter(x=>x.groupId===c.gr
          groupPax.forEach(x=>{ if(x.id&&x.id!==c.id) seen.add(x.id); });
          groupPax.forEach((p,pi)=>{
            const pbday=p.birthDate?new Date(p.birthDate+"T12:00:00").toLocale
            const pexp=p.passportExpiry?new Date(p.passportExpiry+"T12:00:00")
            rows.push(<div key={p.id||c.id+pi} style={{ background:A.card,bord
              <div style={{ padding:"10px 16px",borderBottom:`1px solid ${A.bo
                <div style={{ fontFamily:ANTON,fontSize:24,color:A.cyan,width:
                <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSiz
                <CopyBtn text={p.nombre} />
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",g
                {[["Nacimiento",pbday,A.gold],[`Caducidad${passportWarn(p.pass
                  <div key={lbl2} style={{ background:A.card,padding:"12px 10p
                    <div style={{ display:"flex",alignItems:"center",justifyCo
                    <div style={{ fontFamily:ANTON,fontSize:16,color:col }}>{v
</div> ))}
              </div>
            </div>);
}); });
        return (<><div style={{ fontFamily:BF,fontSize:12,color:A.muted,letter
      })()}
      {listView==="interesados"&&interesados.map((c,i)=>{ const rm=ROOMS[c.roo
    </div>
    <div style={{ position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px"
      <button onClick={()=>{ navigator.clipboard.writeText(currentList).then((
    </div>
  </div>
)}
{rmModal && <AModal title="Compañero/a de hab." onClose={()=>setRmModal(null)}
{roomMenu && <RoomMenu current={clients.find(c=>c.id===roomMenu)?.room||"doble
{fpMenu && <FormaPagoMenu current={clients.find(c=>c.id===fpMenu)?.formaPago||
{addModal==="new" && <AModal title="Nuevo viajero" onClose={()=>{ setAddModal(
  {newPersonas.map((p,i)=>(
    <div key={i} style={{ background:A.bg,borderRadius:12,padding:"12px",margi
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"
        <div style={{ fontFamily:BF,fontSize:10,color:i===0?A.cyan:A.purple,le
        {i>0&&<button onClick={()=>setNewPersonas(ps=>ps.filter((_,j)=>j!==i))
      </div>
      <input value={p.nombre} onChange={e=>setNewPersonas(ps=>ps.map((x,j)=>j=
      <input value={p.email} onChange={e=>setNewPersonas(ps=>ps.map((x,j)=>j==
</div>
oupId&&
DateStr
.toLoca
erRadiu
rder}33
34,text
e:20,co
ap:1,ba
portExp
x" }}>
ntent:"
al}</di
Spacing
m||"dob
,backgr
)=>{ se
>{tc.fi
_jun"}
"transf
null);
nBottom
center"
tterSpa
} style
==i?{..
=i?{...
         ))}
        <button onClick={()=>setNewPersonas(ps=>[...ps,{nombre:"",email:""}])} style
        <ARow>
          <button onClick={()=>{ setAddModal(null); setNewPersonas([{nombre:"",email
          <button onClick={()=>{
            const valid=newPersonas.filter(p=>p.nombre.trim()); if(!valid.length) re
            const groupId=valid.length>1?`g${uid()}`:null;
            const nuevos=valid.map(p=>({ id:`cl${uid()}`,nombre:p.nombre.trim(),emai
            sC([...clients,...nuevos]); setAddModal(null); setNewPersonas([{nombre:"
          }} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Añadir</button>
        </ARow>
      </AModal>}
      {addModal==="existing" && <AModal title="Añadir existentes" onClose={()=>{ set
        <SearchBar value={exSearch} onChange={setExSearch} placeholder="Buscar..." /
        {filteredEx.map(c=>{ const sel=exSelected.includes(c.id); const cTrip=c.trip
        {exSelected.length>0&&<div style={{ position:"sticky",bottom:0,background:A.
</AModal>}
      {stFilterModal && <FilteredListModal title={`${ST.find(s=>s.key===stFilterModa
    </div>
); };
const PagosTab=()=>{
  const pc=trip.pagosConfig||[];
  const allPeople=[...tc,...tc.flatMap(c=>(c.acompanantes||[]).map(a=>({...a,_pN:c.n
  const [editImpModal,setEditImpModal]=useState(null);
  const [newImp,setNewImp]=useState("");
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
={{ ...
:""}]);
turn;
l:p.ema
",email
AddModa
>
Id?trip
card2,b
l)?.emo
ombre})
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
      return (
        <div key={c.id} style={{ display:"grid",gridTemplateColumns:`1fr ${pc.
          <div style={{ padding:"10px 14px",display:"flex",alignItems:"center"
            <div style={{ width:26,height:26,borderRadius:6,background:A.cyan+
            <div style={{ fontFamily:ANTON,fontSize:12,color:A.text,lineHeight
          </div>
          {pc.map((p,i)=>{
            const done=pe[i]==="pagado"; const urg2=!done&&(isUrgent(p.fechaIS
            const customImp=(c.pagosImporteCustom||[])[i];
            const cellFP=FORMAS_PAGO.find(f=>f.k===((c.pagosFormaPago||[])[i]|
            return (
              <div key={i} style={{ borderLeft:`1px solid ${A.border}44`,displ
                <button onClick={()=>updClient(c.id,x=>{ const arr=[...(x.pago
                  style={{ width:"100%",flex:1,background:"transparent",border
                  <div style={{ fontFamily:ANTON,fontSize:16,color:done?A.gree
                  {customImp&&<div style={{ fontSize:7,color:A.gold,fontFamily
                  <div style={{ fontSize:9 }}>{cellFP.icon}</div>
                </button>
                <button onClick={()=>{ const curFP=(c.pagosFormaPago||[])[i]||
                  style={{ fontSize:9,color:A.muted,background:"transparent",b
              </div>
); })}
</div> );
})} </div>
)}
{editImpModal && (
  <AModal title="Editar pago" onClose={()=>setEditImpModal(null)}>
    <div style={{ background:A.card,border:`1px solid ${A.border}`,borderRadiu
    <AmountPad value={newImp} onChange={setNewImp} />
    <div style={{ marginTop:14,marginBottom:4,fontFamily:BF,fontSize:10,color:
    <div style={{ display:"flex",gap:8,marginBottom:16 }}>
      {FORMAS_PAGO.map(f=>(
        <button key={f.k} onClick={()=>setEditFP(f.k)} style={{ flex:1,padding
x solid
join("
,letter
:A.cyan
map(()=
,gap:6
"22",di
:1 }}>{
O)||isO
|c.form
ay:"fle
sEstado
:"none"
n:urg2?
:BF }}>
c.forma
order:"
s:10,pa
A.muted
:"10px
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
          <input value={pcLabel} onChange={e=>setPcLabel(e.target.value)} style={{ .
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,text
          <input value={pcImporte} onChange={e=>setPcImporte(e.target.value)} style=
          <ARow>
            <button onClick={()=>{ if((trip.pagosConfig||[]).length>1) updTrip(t=>({
            <button onClick={()=>setEditPcModal(null)} style={{ ...ab(A.card2,A.mute
            <button onClick={savePc} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Guardar</
          </ARow>
        </AModal>
)} </div>
); };
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
  const [downloadingZip,setDownloadingZip]=useState(false);
  useEffect(()=>{
    if(!gImporte||!+gImporte){ setGImporteEUR(""); return; }
    if(gCurrency==="EUR"){ setGImporteEUR(gImporte); return; }
    setConverting(true);
ed),fle
/button
Transfo
..ais,m
Transfo
{{ ...a
...t,pa
d),flex
button>
false);
(trip.c ");
   const t=setTimeout(async()=>{ const eur=await convertToEUR(+gImporte,gCurrency);
  return ()=>clearTimeout(t);
},[gImporte,gCurrency]);
const totalGastos=gastos.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
const totalIngresos=tc.reduce((sum,c)=>{ const pe=c.pagosEstado||pc.map(()=>"pendi
const beneficio=totalIngresos-totalGastos;
const addGasto=()=>{
  if(!gImporte||+gImporte<=0) return;
  const importeEUR=gCurrency==="EUR"?+gImporte:+(gImporteEUR||gImporte);
  updTrip(t=>({...t,gastos:[...(t.gastos||[]),{ id:uid(),tipo:gTipo,descripcion:gD
  setGTipo("vuelo"); setGDesc(""); setGImporte(""); setGImporteEUR(""); setGFecha(
};
const delGasto=id=>updTrip(t=>({...t,gastos:(t.gastos||[]).filter(g=>g.id!==id)}))
const addFacturaGasto=async(e,gastoId)=>{ const f=e.target.files[0]; if(!f) return
const delFactura=id=>updTrip(t=>({...t,facturas:(t.facturas||[]).filter(fa=>fa.id!
const tipoInfo=k=>GASTO_TIPOS.find(t=>t.k===k)||GASTO_TIPOS[0];
const gastosByTipo={};
gastos.forEach(g=>{ if(!gastosByTipo[g.tipo]) gastosByTipo[g.tipo]=[]; gastosByTip
const sym=getCurrencySymbol(gCurrency);
const downloadGastosZip=async()=>{
  const gastosConF=gastos.filter(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.dat
  if(!gastosConF.length){ alert("Sin facturas de gastos para exportar"); return; }
  setDownloadingZip(true);
  try {
    if(!window.JSZip){ await new Promise(res=>{ const s=document.createElement("sc
    const zip=new window.JSZip(); const root=zip.folder(`${trip.name}_gastos`);
    gastosConF.forEach(g=>{ const ti=tipoInfo(g.tipo||"otros"); const sub=root.fol
    const blob=await zip.generateAsync({type:"blob"}); const url=URL.createObjectU
  } catch(e){ alert("Error al crear el ZIP"); }
  setDownloadingZip(false);
};
return (
  <div style={{ padding:"0 16px" }}>
    <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBot
      {[{l:"Ingresos",v:totalIngresos,c:A.green},{l:"Gastos",v:totalGastos,c:A.red
        <div key={item.l} style={{ background:item.c+"15",borderRadius:14,padding:
          <div style={{ fontFamily:BF,fontSize:8,color:item.c,letterSpacing:2,text
          {unlocked?<div style={{ fontFamily:ANTON,fontSize:18,color:item.c,lineHe
</div> ))}
    </div>
    {!unlocked&&<button onClick={()=>setShowPin(true)} style={{ width:"100%",paddi
setGIm
ente");
esc,imp
new Dat
;
; const
==id)})
o[g.tip
a));
ript");
der(`${
RL(blob
"none",
tom:14
},{l:"B
"12px 8
Transfo
ight:1
ng:"12p
 {unlocked&&gastos.length>0&&<button onClick={()=>setShowStats(v=>!v)} style={{
{showStats&&unlocked&&<ExpenseStats gastos={gastos} />}
<div style={{ marginBottom:14 }}>
  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"cent
    <div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,te
    <div style={{ display:"flex",gap:6 }}>
      {gastos.some(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.data))&&<butt
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
      {gCurrency!=="EUR"&&gImporte&&<div style={{ background:A.bg,borderRadius
      <input type="date" value={gFecha} onChange={e=>setGFecha(e.target.value)
      <input value={gNota} onChange={e=>setGNota(e.target.value)} placeholder=
      <button onClick={addGasto} disabled={!gImporte||+gImporte<=0} style={{ w
</div> )}
  {gastos.length===0?<AEmpty text="Sin gastos registrados" />:Object.entries(g
    const ti=tipoInfo(tipo); const subtotal=items.reduce((s,g)=>s+(+g.importeE
    return (
      <div key={tipo} style={{ marginBottom:10 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems
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
width:
er",mar
xtTrans
on onCl
rm?A.ca
om:12,b
:A.bg,b
ng:1,fl n>
"Descri
Bottom:
e(/[^\d
r",text
:8,padd
} style
"Nota (
idth:"1
astosBy
UR||+g.
:"cente
2,textT
toLocal
ottom:6
ms:"cen
neHeigh
ght:700
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
      </div>
      {tipoMenu&&<GastoTipoMenu current={gTipo} onSelect={t=>setGTipo(t)} onClose={(
      {currMenu&&<CurrencyMenu current={gCurrency} onSelect={c=>setGCurrency(c)} onC
      {showPin&&<NumPad title="PIN Finanzas" pinLength={6} onVerifyAsync={async pin=
</div> );
};
function FacturacionSection({ trip, updTrip, tc }) {
  const facturasVenta = trip.facturasVenta || [];
  const [view, setView] = useState("list");
  const [editId, setEditId] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const lastNum = facturasVenta.length > 0 ? facturasVenta[facturasVenta.length-1].n
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
)=>setT
lose={(
>{ cons
umFactu
  t
:
 const nextNum = (()=>{ const m=lastNum.match(/(\d+)/g); if(!m) return ""; const n=
const emptyForm=()=>({ numFactura:nextNum,fechaFactura:today,detalleReserva:trip.n
const [form, setForm] = useState(emptyForm);
const [generating, setGenerating] = useState(false);
const saveFactura=()=>{ if(!form.numFactura||!form.fechaFactura) return; const fa=
const delFacturaVenta=id=>updTrip(t=>({...t,facturasVenta:(t.facturasVenta||[]).fi
const downloadFacturaPDF=async(fa)=>{
  setGenerating(fa.id);
  try {
    const JsPDF=await loadJsPDF(); const doc=new JsPDF({orientation:"portrait",uni
    const W=210; const H=297; const mg=18; let y=mg;
    doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.setTextColor(0,0,0);
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(80,80,8
    doc.text(`FACTURA ${fa.numFactura}  ·  FECHA: ${new Date(fa.fechaFactura+"T12:
    y+=24; doc.setDrawColor(220,220,220); doc.line(mg,y,W-mg,y); y+=8;
    const col1=mg; const col2=110;
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(232,0,42
    doc.text("DATOS AGENCIA",col1,y); doc.text("DETALLE DE LA RESERVA",col2,y); y+
    doc.setTextColor(60,60,60); doc.setFont("helvetica","normal"); doc.setFontSize
    const agLines=["Agencia: TRAVELIKE SL","CIF: B02628766","Dirección: Ana Kareni
    agLines.forEach(l=>{ doc.text(l,col1,y); y+=5; });
    const resLines=doc.splitTextToSize(fa.detalleReserva||"",80); let ry=y-agLines
    resLines.forEach(l=>{ doc.text(l,col2,ry); ry+=5; }); y=Math.max(y,ry)+4;
    const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("es-ES"):"—";
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(60,60,60
    doc.text(`Fecha Salida: ${fmtDate(fa.fechaSalida)}`,col2,y); doc.text(`Fecha R
    doc.setDrawColor(220,220,220); doc.line(mg,y,W-mg,y); y+=8;
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(232,0,42
    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(60,6
    tc.filter(c=>fa.clientesSeleccionados.includes(c.id)).forEach((c,i)=>{ doc.tex
    y+=6; doc.setDrawColor(220,220,220); doc.line(mg,y,W-mg,y); y+=8;
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(60,60,6
    doc.setTextColor(232,0,42); doc.setFontSize(13); doc.text(`TOTAL FACTURA: ${fa
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(120,12
    doc.text("Travelike, S.L. con CIF B02628766",W/2,H-18,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(60,60,60
    doc.text("*Régimen especial de las agencias de viajes*",W/2,H-12,{align:"cente
    doc.save(`Factura_${fa.numFactura.replace(/[/\\]/g,"-")}.pdf`);
  } catch(e){ alert("Error al generar PDF: "+e.message); }
  setGenerating(null);
};
if (view==="new"||(view==="edit"&&editId)) {
  const editingFa=editId?facturasVenta.find(f=>f.id===editId):null;
  const f=view==="edit"?editingFa:form;
  const setF=view==="edit"?upd=>updTrip(t=>({...t,facturasVenta:t.facturasVenta.ma
  return (
parseIn
ame?`PR
{id:uid
lter(f=
t:"mm",
doc.te 0);
00:00")
);
=5;
(9);
na 6, A
.length
); egreso:
); doc.
0,60);
t(`${i+
0); doc
.totalF
0,120);
); r"});
p(x=>x.
     <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"cent
        <div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,te
        <button onClick={()=>{ setView("list"); setEditId(null); }} style={{ backg
      </div>
      <div style={{ display:"flex",gap:10,marginBottom:10 }}>
        <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.mu
        <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.mu
      </div>
      <div style={{ marginBottom:10 }}><div style={{ fontFamily:BF,fontSize:10,col
      <div style={{ display:"flex",gap:10,marginBottom:10 }}>
        <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.mu
        <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.mu
      </div>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,text
        {tc.map(c=>{ const sel=(f.clientesSeleccionados||[]).includes(c.id); const
      </div>
      <div style={{ marginBottom:16 }}><div style={{ fontFamily:BF,fontSize:10,col
      <button onClick={view==="edit"?()=>{ setView("list"); setEditId(null); }:sav
        style={{ width:"100%",padding:"16px",border:"none",borderRadius:12,fontFam
        {view==="edit"?"GUARDAR CAMBIOS":"CREAR FACTURA"}
      </button>
</div> );
}
return (
  <div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center
      <div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,text
      <button onClick={()=>{ setForm(emptyForm()); setView("new"); }} style={{ ...
    </div>
    {facturasVenta.length===0?<AEmpty text="Sin facturas de venta" />:facturasVent
      const selCount=(fa.clientesSeleccionados||[]).length;
      const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"
      return (
        <div key={fa.id} style={{ background:A.card,borderRadius:12,marginBottom:1
          <div style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBott
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:ANTON,fontSize:17,color:A.red,letterSpaci
                <div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginTop:2
                <div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginTop:2
</div>
              <div style={{ fontFamily:ANTON,fontSize:20,color:A.red,whiteSpace:"n
            </div>
            <div style={{ display:"flex",gap:6 }}>
er",mar
xtTrans
round:"
ted,let
ted,let
or:A.mu
ted,let
ted,let
Transfo
 toggle
or:A.mu
eFactur
ily:ANT
",margi
Transfo
ab(A.re
a.map(f
2-digit
0,borde
om:8 }}
ng:1 }}
}}>{fmt
}}>
owrap",
 {
                  <button onClick={()=>{ setEditId(fa.id); setView("edit"); }} style={
                <button onClick={()=>downloadFacturaPDF(fa)} disabled={generating===
                <button onClick={()=>delFacturaVenta(fa.id)} style={{ background:"tr
              </div>
            </div>
</div> );
})} </div>
); }
const AIDocsTab=()=>{
const [queue,setQueue]=useState([]);
const [processing,setProcessing]=useState(false);
const [docsMode,setDocsMode]=useState("ia");
const [manFile,setManFile]=useState(null);
const [manTipo,setManTipo]=useState("vuelo_ida");
const [manTarget,setManTarget]=useState(null);
const [manDesc,setManDesc]=useState("");
const [manAssigning,setManAssigning]=useState(false);
const fileRef=useRef();
const manFileRef=useRef();
const allTargets=tc.flatMap(c=>[{id:c.id,nombre:c.nombre,type:"client",clientId:c. constDOC_TIPOS=[{k:"vuelo_ida",icon:" ",label:"BilleteIDA"},{k:"vuelo_vuelta",i const addFiles=e=>{ const files=Array.from(e.target.files||[]); setQueue(q=>[...q, const processAll=async()=>{
    const pending=queue.filter(q=>q.status==="pending"); if(!pending.length) return;
    const encoded=await Promise.all(pending.map(async item=>{ const b64=await fileTo
    for(const item of encoded){
      setQueue(q=>q.map(x=>x.id===item.id?{...x,b64:item.b64,status:"processing"}:x)
      try{
        const prompt=`Analiza este documento de viaje.\nViajeros del grupo: ${allTar
        const raw=await callClaude(item.b64,item.mime||"application/pdf",prompt);
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
    const doc={id:uid(),tipo:tipo.startsWith("vuelo")?"vuelo":tipo,nombre,archivo:it
 { ...ab
fa.id}
anspare
id},...
con:"
...file
 setPro
B64(ite
); gets.ma
o)||all
tchedTa
"; em.resu
   if(target.type==="acomp"){ updClient(target.clientId,c=>({...c,acompanantes:(c.a
  else{ updClient(target.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc]})
  setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"assigned"}:x));
};
const assignManual=async()=>{
  if(!manFile||!manTarget) return; setManAssigning(true);
  const b64=await fileToB64(manFile);
  const tipoInfo=DOC_TIPOS.find(d=>d.k===manTipo)||DOC_TIPOS[0];
  const ext=manFile.type?.includes("pdf")?"pdf":manFile.type?.includes("png")?"png
  const nombre=`${manTarget.nombre.split(" ")[0]}_${tipoInfo.label.replace(/ /g,"_
  const doc={id:uid(),tipo:manTipo.startsWith("vuelo")?"vuelo":manTipo,nombre,arch
  if(manTarget.type==="acomp"){ updClient(manTarget.clientId,c=>({...c,acompanante
  else{ updClient(manTarget.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc
  setManFile(null); setManDesc(""); setManTarget(null); setManAssigning(false);
};
const autoAssignAll=()=>{ queue.filter(x=>x.status==="done"&&x.result?.matchedTarg
const doneWithMatch=queue.filter(q=>q.status==="done"&&q.result?.matchedTarget).le
return (
  <div style={{ padding:"0 16px" }}>
    <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:
    <div style={{ display:"flex",background:A.bg,borderRadius:12,padding:4,marginB
      <button onClick={()=>setDocsMode("ia")} style={{ flex:1,background:docsMode=
      <button onClick={()=>setDocsMode("manual")} style={{ flex:1,background:docsM
    </div>
    {docsMode==="ia"&&(<>
      <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple s
      <div style={{ display:"flex",gap:8,marginBottom:10 }}>
        <button onClick={()=>fileRef.current.click()} style={{ flex:2,background:A
        {queue.filter(q=>q.status==="pending").length>0&&!processing&&<button onCl
      </div>
      {doneWithMatch>0&&<button onClick={autoAssignAll} style={{ width:"100%",padd
      {processing&&<div style={{ textAlign:"center",padding:"10px",color:A.cyan,fo
      {queue.length===0&&<AEmpty text="Sube billetes, seguros, vouchers u otros do
      {queue.map(item=>(
<div key={item.id} style={{ background:A.card,borderRadius:12,padding:"12p <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:item <spanstyle={{fontSize:18}}>{item.status==="pending"?" ":item.statu <div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:12,fontWeigh {["pending","done","error"].includes(item.status)&&<button onClick={()
          </div>
          {item.status==="done"&&item.result&&(
            <div>
              {item.result.descripcion&&<div style={{ background:A.bg,borderRadius
              <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {allTargets.map(target=>{ const suggested=item.result.matchedTarge
              </div>
 compana ); }
":"jpg"
")}.${e
ivo:man
s:(c.ac
]})); }
et).for
ngth;
"none",
ottom:1
=="ia"?
ode==="
tyle={{
.purple
ick={pr
ing:"12
ntSize:
cumento
x",marg
.result
s==="p
t:700,c
=>setQu
:8,padd
2,textT
t?.id==
r
 </div> )}
      {item.status==="assigned"&&<div style={{ fontSize:12,color:A.green,fontW
    </div>
))} </>)}
{docsMode==="manual"&&(<>
  <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTr
  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBotto
    {DOC_TIPOS.map(d=>{ const sel=manTipo===d.k; return (<button key={d.k} onC
  </div>
  <input ref={manFileRef} type="file" accept="application/pdf,image/*" style={
  <button onClick={()=>manFileRef.current.click()} style={{ width:"100%",backg
  <input value={manDesc} onChange={e=>setManDesc(e.target.value)} placeholder=
  <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTr
  <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:16 }}
    {allTargets.map(target=>{ const sel=manTarget?.id===target.id; return (<bu
  </div>
  <button onClick={assignManual} disabled={!manFile||!manTarget||manAssigning}
    style={{ width:"100%",background:(!manFile||!manTarget)?A.card2:`linear-gr
            {manAssigning?"
        </button>
</>)} </div>
); };
ASIGNANDO...":"
ASIGNAR DOCUMENTO"}
const EditTab=()=>{
const sec=editSec; const setSec=setEditSec;
const [lName,setLName]=useState(trip.name); const [lFlag,setLFlag]=useState(trip.f const [lFechas,setLFechas]=useState(trip.fechas||""); const [lPrice,setLPrice]=use const [lWebUrl,setLWebUrl]=useState(trip.webUrl||""); const [lCurrency,setLCurrenc const [currMenu2,setCurrMenu2]=useState(false);
const [efNombre,setEfNombre]=useState(""); const [efArchivo,setEfArchivo]=useState const [dfNombre,setDfNombre]=useState(""); const [dfArchivo,setDfArchivo]=useState const[ifIcono,setIfIcono]=useState(" ");const[ifTitulo,setIfTitulo]=useState(" const [newImpresc,setNewImpresc]=useState(""); const [newCatItems,setNewCatItems]= const[newCatIcon,setNewCatIcon]=useState(" ");const[newCatLabel,setNewCatLabel const mImpresc=trip.maletaImprescindibles||DEFAULT_IMPRESCINDIBLES;
const mCats=trip.maletaCats||DEFAULT_MALETA_CATS;
const hotels=trip.hotels||[];
const emerg=trip.emergencias||emptyEmergencias();
const sc=trip.surveyConfig||{categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[
  if(sec===null){
    return (
  <div style={{ padding:"12px 16px" }}>
eight:7
ansform
m:14 }}
lick={(
{ displ
round:m
"Descri
ansform
>
tton ke
adient(
lag);
State(t
y]=useS
(""); ("");
"); co
useStat
]=useS
]};
n t
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
      <input value={lFechas} onChange={e=>setLFechas(e.target.value)} placeholder=
      <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:10,marginBot
      <input value={lWebUrl} onChange={e=>setLWebUrl(e.target.value)} placeholder=
      <button onClick={()=>updTrip(t=>({...t,name:lName,flag:lFlag,fechas:lFechas,
      {currMenu2&&<CurrencyMenu current={lCurrency} onSelect={setLCurrency} onClos
    </div>}
    {sec==="vuelos"&&<div>
      {(trip.vuelos||[]).map((v,i)=><div key={i} style={{ background:A.card,border
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
    </div>}
    {sec==="docs"&&<div>
      {(trip.docs||[]).map((d,i)=><div key={i} style={{ background:A.card,borderRa
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
    </div>}
    {sec==="pagos"&&<div>
      {(trip.pagosConfig||[]).map((p,i)=>(<div key={i} style={{ background:A.card,
      <ARow><button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig|
    </div>}
und:"tr
.length
ngth;
,border
:s.k===
d,lette
,gap:8,
Bottom:
tom:10
"Fechas
tom:10
"URL we
price:l
e={()=>
Radius:
solid $
dius:10
solid $
borderR
|[]),{l
 );
  {sec==="info"&&<div>
    {(trip.info||[]).map((it,i)=><div key={i} style={{ background:A.card,borderR
    <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
      <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:8,marginBo
      <textarea value={ifTexto} onChange={e=>setIfTexto(e.target.value)} placeho
      <input value={ifUrl} onChange={e=>setIfUrl(e.target.value)} placeholder="E
      <button onClick={()=>{ if(!ifTitulo.trim()) return; updTrip(t=>({...t,info
    </div>
  </div>}
  {sec==="hotels"&&<div>
    {hotels.map((h,i)=>(<div key={h.id} style={{ background:A.card,borderRadius:
    <button onClick={()=>updTrip(t=>({...t,hotels:[...(t.hotels||[]),emptyHotel(
  </div>}
  {sec==="maleta"&&<div>
    <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBottom
      <div style={{ fontFamily:ANTON,fontSize:15,color:A.cyan,letterSpacing:1,ma
      {mImpresc.map((item,i)=>(<div key={i} style={{ display:"flex",alignItems:"
      <div style={{ display:"flex",gap:8,marginTop:8 }}><input value={newImpresc
</div>
    {mCats.map((cat,ci)=>(<div key={cat.id} style={{ background:A.card,borderRad
  </div>}
  {sec==="emerg"&&<div>
    {[{k:"policia",l:"Policía"},{k:"ambulancia",l:"Ambulancia"},{k:"bomberos",l:
      <div key={item.k}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,le
    ))}
  </div>}
  {sec==="survey"&&<div>
    <div style={{ background:A.card2,borderRadius:14,padding:"16px",marginBottom
      <label style={{ display:"flex",gap:12,alignItems:"center",cursor:"pointer"
        <input type="checkbox" checked={trip.surveyEnabled||false} onChange={e=>
        <div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:trip.survey
      </label>
    </div>
    <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,marg
    {(sc.categories||[]).map((cat,i)=>(<div key={cat.key} style={{ background:A.
    <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px
      <div style={{ display:"grid",gridTemplateColumns:"48px 1fr 80px",gap:8,mar
      <select value={newCatTipo} onChange={e=>setNewCatTipo(e.target.value)} sty
      <button onClick={()=>{ if(!newCatLabel.trim()||!newCatKey.trim()) return;
    </div>
    {(sc.surveyResponses||[]).length>0&&<div>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:3,text
      {(sc.surveyResponses||[]).map((r,i)=>(<div key={i} style={{ background:A.c
    </div>}
  </div>}
</div>
adius:1
solid $
ttom:8
lder="T
nlace (
:[...(t
12,padd
)]}))}
:14,bor
rginBot
center"
} onCha
ius:14,
"Bomber
tterSpa
:14,bor
,paddin
updTrip
Enabled
inBotto
card,bo
solid $
ginBott
le={{ .
updTrip
Transfo
ard,bor
 };
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
    </div>
); }
function AcompModal({ clientId, clients, updClient, trip, onClose }) {
  const cl = clients.find(c => c.id === clientId);
  const [nombre, setNombre] = useState("");
  const refs = useRef({});
  const acomps = cl?.acompanantes || [];
  const add = () => { if (!nombre.trim()) return; const pagosEstado = (trip?.pagosConf
  const del = id => updClient(clientId, c => ({ ...c, acompanantes: (c.acompanantes ||
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
ig || [ []).fi
   const uploadPhoto = (acId, file) => { const r = new FileReader(); r.onload = e => up
  return (
    <AModal title="Acompañantes" onClose={onClose}>
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
</div>
dClient
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
 ); }
function Passport({ go, cid, clients, setClients, trips, sC, logout }) {
  const cl = clients.find(c => c.id === cid);
  const groupMembers = cl?.groupId ? clients.filter(c => c.groupId === cl.groupId) : (
  const isGroup = groupMembers.length > 1;
  const [memberPhotos, setMemberPhotos] = useState(() => { const init = {}; groupMembe
  const [c0, setC0] = useState(false); const [c1, setC1] = useState(false); const [c2,
  const [lightbox, setLightbox] = useState(null); const [showPriv, setShowPriv] = useS
  const fileRefs = useRef({});
  if (!cl) return null;
  const processAndAddPhoto = (memberId, file) => {
    const r = new FileReader(); r.onload = ev => { const img = new Image(); img.onload
  };
  const removePhotoFor = (memberId, idx) => setMemberPhotos(prev => ({ ...prev, [membe
  const canSubmit = c0 && c1;
  const submit = async () => {
    if (!canSubmit) return;
    const updated = clients.map(x => { const isMember=groupMembers.find(m=>m.id===x.id
    setClients(updated); go("notifprompt",{cid}); db.set(SK_C,updated);
  };
  const ConsentBlock=()=>(<>
    <label style={{ display:"flex",gap:12,alignItems:"flex-start",marginBottom:12,curs
      <input type="checkbox" checked={c0} onChange={e=>setC0(e.target.checked)} style=
      <div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:c0?A.cyan:A.te
    </label>
    <label style={{ display:"flex",gap:12,alignItems:"flex-start",marginBottom:12,curs
      <input type="checkbox" checked={c1} onChange={e=>setC1(e.target.checked)} style=
      <div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:c1?A.green:A.t
    </label>
    <label style={{ display:"flex",gap:12,alignItems:"flex-start",marginBottom:20,curs
      <input type="checkbox" checked={c2} onChange={e=>setC2(e.target.checked)} style=
      <div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:c2?A.purple:A.
</label>
    <div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginBottom:16,textAlign:"c
  </>);
  return (
    <div style={{ fontFamily:BF,background:A.bg,minHeight:"100vh",maxWidth:560,margin:
<div style={{ background:"linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#07070f <divstyle={{fontSize:48,marginBottom:12}}>{isGroup?" ":" "}</div>
<div style={{ fontFamily:ANTON,fontSize:32,color:"#fff",lineHeight:1,marginBot <div style={{ fontFamily:ANTON,fontSize:isGroup?18:22,color:A.cyan,letterSpaci <div style={{ fontSize:14,color:A.muted,fontFamily:BF,marginTop:12,lineHeight:
      </div>
      <div style={{ padding:"24px 20px" }}>
  {isGroup?(
cl ? [c
rs.forE
 setC2]
tate(fa
= () = rId]: (
); if(!
or:"poi
{{ marg
xt,marg
or:"poi
{{ marg
ext,mar
or:"poi
{{ marg
text,ma
enter"
"0 auto
100%)",
tom:8,l
ng:2,li
1.6 }}>
   <div style={{ marginBottom:16 }}>
    {groupMembers.map((member)=>{
      const photos=memberPhotos[member.id]||[];
      const isMe=member.id===cid;
      const hasPhotos=photos.length>0;
      return (
        <div key={member.id} style={{ background:A.card,borderRadius:20,paddin
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom
            <div style={{ width:48,height:48,borderRadius:12,background:isMe?A
            <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:18
            <div style={{ fontFamily:BF,fontSize:11,fontWeight:700,color:hasPh
          </div>
          {hasPhotos?(
            <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:1
              {photos.map((p,pi)=>(<div key={pi} style={{ position:"relative",
              <div onClick={()=>{fileRefs.current[member.id].value="";fileRefs
</div> ):(
<div onClick={()=>{fileRefs.current[member.id].value="";fileRefs.c <divstyle={{fontSize:32}}> </div>
<div style={{ fontFamily:ANTON,fontSize:14,color:isMe?A.cyan:A.p
</div> )}
          <input ref={el=>{if(el) fileRefs.current[member.id]=el;}} type="file
        </div>
); })}
</div> ):(
  <div style={{ background:A.card,borderRadius:14,padding:20,border:`1px solid
    <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",marginBottom:4,let
    {(memberPhotos[cl.id]||[]).length>0?(
      <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:14 }}>
        {(memberPhotos[cl.id]||[]).map((p,i)=>(<div key={i} style={{ position:
        <div onClick={()=>{fileRefs.current[cl.id].value="";fileRefs.current[c
</div> ):(
<div onClick={()=>{fileRefs.current[cl.id].value="";fileRefs.current[cl. <divstyle={{fontSize:36,marginBottom:8}}> </div>
<div style={{ fontFamily:ANTON,fontSize:15,color:A.cyan,letterSpacing:
</div> )}
    <input ref={el=>{if(el) fileRefs.current[cl.id]=el;}} type="file" accept="
  </div>
)}
<div style={{ background:A.card,borderRadius:14,padding:"20px 20px 4px",border
<button onClick={submit} disabled={!canSubmit} style={{ width:"100%",padding:"
  g:"18px
:16 }}>
.cyan+"
,color:
otos?A.
0 }}>
width:8
.curren
urrent[
urple,l
" accep
 ${A.bo
terSpac
"relati
l.id].c
id].cli
1 }}>TO
image/*
:`1px s
18px",b
         {logout&&<div style={{ textAlign:"center",marginTop:16 }}><button onClick={log
      </div>
      {lightbox&&<Lightbox src={lightbox} onClose={()=>setLightbox(null)} />}
      {showPriv&&<PrivacidadModal onClose={()=>setShowPriv(false)} />}
    </div>
); }
function NotifPrompt({ go, cid, clients, sC, logout }) {
  const [loading, setLoading] = useState(false);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isPWA = window.navigator.standalone === true || window.matchMedia("(display-mo
  const enable = async () => {
    setLoading(true);
    const cl = clients.find(c => c.id === cid);
    if (cl) { try { const OneSignal=window.OneSignal; if(OneSignal){ const granted=awa
    await sC(clients.map(x => x.id === cid ? { ...x, notifEnabled: true } : x));
    setLoading(false); go("client",{cid});
  };
  const skip = () => go("client",{cid});
  if (isIOS && !isPWA) {
    return (
      <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",dis
<div style={{ background:"linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#07070 <divstyle={{fontSize:72,marginBottom:16}}> </div>
<div style={{ fontFamily:ANTON,fontSize:30,color:"#fff",letterSpacing:1,marg <div style={{ fontSize:15,color:A.muted,lineHeight:1.7 }}>Para recibir notif
        </div>
        <div style={{ flex:1,padding:"24px 20px" }}>
{[{num:"1",icon:" ",title:"TocaelbotónCompartir",desc:"Eliconodelcuad <div key={step.num} style={{ display:"flex",gap:16,marginBottom:20,alignIt <div style={{ width:40,height:40,borderRadius:"50%",background:A.cyan+"2 <div style={{ flex:1,paddingTop:4 }}><div style={{ fontSize:20,marginBot
</div> ))}
          <button onClick={skip} style={{ width:"100%",padding:"18px",border:`1.5px so
          {logout&&<button onClick={logout} style={{ background:"none",border:"none",c
        </div>
</div> );
}
return (
<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",displ <divstyle={{fontSize:80,marginBottom:24}}> </div>
<div style={{ fontFamily:ANTON,fontSize:32,color:"#fff",letterSpacing:1,marginBo <div style={{ fontSize:17,color:A.muted,lineHeight:1.7,marginBottom:36 }}>Activa <button onClick={enable} disabled={loading} style={{ width:"100%",padding:"18px"
   out} st
de: sta
it OneS
play:"f
f 100%)
inBotto
icacion
rado c
ems:"fl
2",bord
tom:4 }
lid ${A
olor:A.
ay:"fle
ttom:12
 las no
,border
o
       <button onClick={skip} style={{ background:"none",border:"none",color:A.muted,fo
      {logout&&<button onClick={logout} style={{ background:"none",border:"none",color
    </div>
); }
function Client({ go, cid, clients, trips, logout, sC, sT }) {
  const cl = clients.find(c => c.id === cid);
  const trip = cl?.tripId ? trips.find(t => t.id === cl.tripId) : null;
  const [view, setView] = useState("home");
  const [maletaNewItem, setMaletaNewItem] = useState("");
  if (!cl) return <div style={{ padding:40,fontFamily:BF,color:A.muted }}>Error</div>;
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
  const groupMembers = cl.groupId ? clients.filter(c => c.groupId === cl.groupId) : [c
  const SubHeader = ({ title, color }) => (
    <div style={{ background:A.card,padding:"14px 16px",display:"flex",alignItems:"cen
      <button onClick={()=>setView("home")} style={{ background:A.card2,border:`1px so
      <div style={{ fontFamily:ANTON,fontSize:20,color:color||A.text,letterSpacing:1,t
      <span style={{ fontSize:28 }}>{trip.flag}</span>
</div> );
  const BigBack = () => (<div style={{ padding:"24px 16px 40px" }}><button onClick={()
  if (view === "home") {
    const tripDate = parseISO(trip.date + "-01");
    const daysToTrip = tripDate ? Math.ceil((tripDate - NOW) / 864e5) : null;
    const pagadosN = pe.filter(s => s === "pagado").length;
    const pagPct = pc.length > 0 ? Math.round(pagadosN / pc.length * 100) : 100;
    return (
      <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",fon
        <div style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14 }}>
            <span style={{ fontSize:36 }}>{trip.flag}</span>
            <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:20,color:"
            {daysToTrip!==null&&daysToTrip>0&&<div style={{ background:A.gold+"22",bor
          </div>
          {pc.length>0&&<div style={{ background:A.card2,borderRadius:10,padding:"8px
ntSize:
:A.mute
t} />; T={sT}
 d.tipo
ipo !==
l];
ter",ga
lid ${A
extTran
=>setVi
tFamily
f 100%)
#fff",l
der:`1p
12px",b
       </div>
      <div style={{ padding:"20px 16px",display:"grid",gridTemplateColumns:"1fr 1fr"
{[{emoji:" ",label:"Vuelos",sublabel:"Billetesyembarque",color:A.cyan,bad <div key={item.v} onClick={()=>setView(item.v)} style={{ background:A.card <div style={{ position:"absolute",top:-24,right:-24,width:90,height:90,b {item.badge!=null&&item.badge>0&&<div style={{ position:"absolute",top:1 <div style={{ fontSize:item.wide?40:44,lineHeight:1,flexShrink:0 }}>{ite <div style={{ flex:item.wide?1:undefined }}><div style={{ fontFamily:ANT {item.wide&&<div style={{ color:item.color,fontSize:20,flexShrink:0 }}>›
</div> ))}
        {groupMembers.length>1&&<div onClick={()=>setView("pasaportes_grupo")} style
          <div style={{ fontFamily:BF,fontSize:10,color:A.purple,letterSpacing:3,tex
          <div style={{ display:"flex",gap:10 }}>
            {groupMembers.map(m=>(<div key={m.id} style={{ flex:1,background:A.bg,bo
              <div style={{ width:56,height:70,borderRadius:10,overflow:"hidden",mar
                {m.passportPhoto?<img src={m.passportPhoto} style={{ width:"100%",he
              </div>
              <div style={{ fontFamily:ANTON,fontSize:12,color:m.id===cid?A.cyan:A.t
              <div style={{ fontFamily:BF,fontSize:9,color:m.passportPhoto?A.green:A
            </div>))}
          </div>
</div>}
        {trip.webUrl?<a href={trip.webUrl} target="_blank" rel="noreferrer" style={{
      </div>
      <div style={{ textAlign:"center",paddingTop:4 }}>
        <button onClick={logout} style={{ background:"none",border:"none",color:A.mu
      </div>
    </div>
); }
if (view === "pasaportes_grupo") {
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",col
      <SubHeader title="Pasaportes" color={A.purple} />
      <div style={{ padding:"16px" }}>
        {groupMembers.map(m=>{ const isMe=m.id===cid; const exp=m.passportExpiry?new
          {isMe&&<div style={{ position:"absolute",top:10,right:12,background:A.cyan
          <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
            <div style={{ width:90,height:120,borderRadius:14,overflow:"hidden",flex
              {m.passportPhoto?<img src={m.passportPhoto} style={{ width:"100%",heig
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:ANTON,fontSize:20,color:isMe?A.cyan:A.text,le
              {m.passportPhoto?<div style={{ background:A.green+"18",border:`1px sol
              {m.docNumero&&<div style={{ fontFamily:ANTON,fontSize:16,color:A.cyan,
 ,gap:12
ge:vue
,border
orderRa
2,right
m.emoji
ON,font
</div>}
={{ gri
tTransf
rderRad
gin:"0
ight:"1
ext,lin
.orange
gridCo
ted,fon
or:A.te
 Date(m
+"22",b
Shrink:
ht:"100
tterSpa
id ${A.
letterS
l
               <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {m.birthDate&&<div style={{ background:A.card2,borderRadius:8,paddin
                {exp&&<div style={{ background:warn?A.orange+"22":A.card2,borderRadi
              </div>
            </div>
          </div>
        </div>); })}
        <BigBack />
      </div>
    </div>
); }
if (view === "maleta") {
  const mImpresc = trip.maletaImprescindibles || DEFAULT_IMPRESCINDIBLES;
  const mCats = trip.maletaCats || DEFAULT_MALETA_CATS;
  const marcados = cl.maletaMarcados || [];
  const personal = cl.maletaPersonal || [];
  const toggle = key => { const nm=marcados.includes(key)?marcados.filter(k=>k!==key
  const addPersonal = () => { if(!maletaNewItem.trim()) return; const texto=maletaNe
  const delPersonal = id => sC(clients.map(x=>x.id===cid?{...x,maletaPersonal:(x.mal
  const totalItems = mImpresc.length+mCats.reduce((s,c)=>s+c.items.length,0)+persona
  const checkedCount = marcados.length;
  return (
<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",col <SubHeader title="Mi maleta " color={A.cyan} />
<div style={{ padding:"14px 16px" }}>
        <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginB
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8
          <div style={{ height:8,background:A.border,borderRadius:4 }}><div style={{
        </div>
        <div style={{ background:`linear-gradient(135deg,${A.red}18 0%,${A.orange}10
          <div style={{ fontFamily:ANTON,fontSize:15,color:A.red,letterSpacing:1,mar
          {mImpresc.map((item,i)=>{ const key=`imp_${i}`; const checked=marcados.inc
        </div>
        {mCats.map((cat,ci)=>{ const catChecked=cat.items.filter((_,ii)=>marcados.in
        <div style={{ background:A.card,borderRadius:16,padding:"14px",marginBottom:
          <div style={{ fontFamily:ANTON,fontSize:15,color:A.purple,letterSpacing:1,
          {personal.length===0&&<div style={{ fontFamily:BF,fontSize:13,color:A.mute
          {personal.map(p=>{ const key=`per_${p.id}`; const checked=marcados.include
          <div style={{ display:"flex",gap:8,marginTop:10 }}>
            <input value={maletaNewItem} onChange={e=>setMaletaNewItem(e.target.valu
            <button onClick={addPersonal} style={{ ...ab(A.purple+"22",A.purple),pad
          </div>
        </div>
      </div>
      <BigBack />
 g:"4px
us:8,pa
):[...m
wItem.t
etaPers
l.lengt
or:A.te
ottom:1
 }}><di
 height
 100%)`
ginBott
ludes(k
cludes(
14,bord
marginB
d,textA
s(key);
e)} onK
ding:"1
 </div> );
}
if (view === "vuelos") {
  const vuelos = trip.vuelos || [];
  const myDocs = (cl.personalDocs || []).filter(d => d.tipo === "vuelo");
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",col
      <SubHeader title="Mis vuelos" color={A.cyan} />
      <div style={{ padding:"16px" }}>
        {vuelos.length===0&&myDocs.length===0&&<AEmpty text="Tus billetes aparecerán
        {[...vuelos,...myDocs].map((v,i)=>(
          <div key={i} style={{ background:A.card,border:`1px solid ${A.border}`,bor
            <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14
              <div style={{ width:50,height:50,borderRadius:12,background:A.cyan+"15
              <div><div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpa
            </div>
            {v.data?(<a href={`data:${v.mimeType||"application/pdf"};base64,${v.data
          </div>
))}
        <BigBack />
      </div>
</div> );
}
if (view === "docs") {
  const docs = trip.docs || [];
  const myDocs = (cl.personalDocs || []).filter(d => d.tipo !== "vuelo");
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",col
      <SubHeader title="Documentos" color={A.gold} />
      <div style={{ padding:"16px" }}>
        {docs.length===0&&myDocs.length===0&&<AEmpty text="Tus documentos aparecerán
        {[...docs,...myDocs].map((d,i)=>(
          <div key={i} style={{ background:A.card,border:`1px solid ${A.border}`,bor
            <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14
              <div style={{ width:50,height:50,borderRadius:12,background:A.gold+"15
              <div><div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpa
            </div>
            {d.data?(<a href={`data:${d.mimeType||"application/pdf"};base64,${d.data
          </div>
))}
        <BigBack />
      </div>
</div>
or:A.te
aquí p
derRadi
}}>
",displ
cing:1,
}`} dow
or:A.te
aquí p
derRadi
}}>
",displ
cing:1,
}`} dow
 ); }
  if (view === "pagos") {
    const fp = FORMAS_PAGO.find(f => f.k === (cl.formaPago || "transferencia")) || FOR
    const pendiente = pe.findIndex(s => s !== "pagado");
    return (
      <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",col
        <SubHeader title="Mis pagos" color={A.green} />
        <div style={{ padding:"16px" }}>
          <div style={{ background:`linear-gradient(135deg,${A.cyan}18 0%,#172030 100%
            <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:4,textT
            {fp.k==="transferencia"&&(<div><div style={{ fontFamily:ANTON,fontSize:20,
            {fp.k==="vip"&&<div style={{ fontFamily:ANTON,fontSize:18,color:A.gold,let
            {pendiente>=0&&pc[pendiente]&&(<div style={{ marginTop:14,background:A.bg,
          </div>
          {pc.map((p,i)=>{ const done=pe[i]==="pagado"; const urg=!done&&isUrgent(p.fe
          <BigBack />
        </div>
      </div>
); }
  if (view === "info") {
    const info = trip.info || [];
    const hotels = trip.hotels || [];
    const emerg = trip.emergencias || emptyEmergencias();
    const emergItems = [{k:"policia",l:"Policía",n:emerg.policia},{k:"ambulancia",l:"A
    return (
      <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",col
        <SubHeader title="Información" color={A.purple} />
        <div style={{ padding:"16px" }}>
          {hotels.map(h=>(<div key={h.id} style={{ background:A.card,borderRadius:20,p
            {h.fechasEstancia&&<div style={{ display:"inline-flex",alignItems:"center"
            <div style={{ fontFamily:ANTON,fontSize:24,color:"#fff",marginBottom:14,te
            {h.direccion&&<div style={{ background:A.bg,borderRadius:12,padding:"12px
          </div>))}
          {info.map((it,i)=>(<div key={i} style={{ background:A.card,borderRadius:16,p
          {emergItems.length>0&&(<div style={{ background:A.red+"11",borderRadius:16,p
          {info.length===0&&hotels.length===0&&emergItems.length===0&&<AEmpty text="La
          <BigBack />
        </div>
      </div>
); }
  return null;
}
MAS_PAG
or:A.te
)`,bord
ransfor
color:"
terSpac
borderR
chaISO)
mbulanc
or:A.te
adding:
,gap:6,
xtTrans
14px",b
adding:
adding:
 inform
 function SurveyScreen({ cl, trip, clients, sC, trips, sT, logout }) {
  const sc = trip.surveyConfig || { categories: [...DEFAULT_SURVEY_CATS] };
  const cats = sc.categories || DEFAULT_SURVEY_CATS;
  const [ratings, setRatings] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [highlights, setHighlights] = useState([]);
  const [mejor, setMejor] = useState("");
  const [mejora, setMejora] = useState("");
  const canSubmit = cats.filter(c => c.tipo !== "texto").every(c => ratings[c.key]);
  const toggleHL = k => setHighlights(h => h.includes(k) ? h.filter(x => x !== k) : [.
  const submit = async () => {
    if (!canSubmit) return;
    const response = { ratings, textAnswers, highlights, mejor, mejora, date: new Date
    const updatedTrips = trips.map(t => t.id===trip.id ? {...t,surveyConfig:{...t.surv
    await Promise.all([sT(updatedTrips), sC(clients.map(x => x.id === cl.id ? { ...x,
}; return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color
      <div style={{ background:"linear-gradient(135deg,rgba(255,200,71,0.18) 0%,#07070
<divstyle={{fontSize:48,marginBottom:12}}> </div>
<div style={{ fontFamily:ANTON,fontSize:32,color:A.gold,letterSpacing:1,margin <div style={{ fontSize:16,color:A.muted,lineHeight:1.6 }}>Tu opinión sobre <st <div style={{ marginTop:14,background:A.green+"18",border:`1px solid ${A.green
<spanstyle={{fontSize:18}}> </span>
          <div style={{ fontFamily:BF,fontSize:13,color:A.green,fontWeight:700 }}>Esta
        </div>
      </div>
      <div style={{ padding:"20px" }}>
        {cats.map(cat=>cat.tipo==="texto"?(
          <div key={cat.key} style={{ background:A.card2,borderRadius:14,padding:"14px
            <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,text
            <textarea value={textAnswers[cat.key]||""} onChange={e=>setTextAnswers(r=>
          </div>
        ):(
          <RatingRow key={cat.key} label={cat.label} icon={cat.icon} value={ratings[ca
        ))}
        <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBot
          <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTr
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {SURVEY_HLS.map(item=>{ const sel=highlights.includes(item.k); return (<bu
          </div>
        </div>
        <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBot
          <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTr
          <textarea value={mejor} onChange={e=>setMejor(e.target.value)} placeholder="
        </div>
  ..h, k]
().toLo
eyConfi
surveyS
:A.text
f 100%)
Bottom:
rong st
}44`,bo
encues
 16px",
Transfo
({...r,
t.key]|
tom:10,
ansform
tton ke
tom:10,
ansform
Cuéntan
         <div style={{ background:A.card2,borderRadius:14,padding:"14px 16px",marginBot
          <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTr
          <textarea value={mejora} onChange={e=>setMejora(e.target.value)} placeholder
        </div>
        <button onClick={submit} disabled={!canSubmit} style={{ width:"100%",padding:"
        <div style={{ textAlign:"center",marginTop:16 }}><button onClick={logout} styl
      </div>
    </div>
); }
function PostSurveyScreen({ cl, trip, logout }) {
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",displ
      <div style={{ background:"linear-gradient(135deg,#07070f 0%,#0f1f3d 50%,#1a0a00
<divstyle={{fontSize:64,marginBottom:16}}> </div>
<div style={{ fontFamily:ANTON,fontSize:42,color:"#fff",letterSpacing:2,lineHe <div style={{ fontFamily:BF,fontSize:17,color:A.muted,lineHeight:1.7,marginTop
      </div>
      <div style={{ flex:1,padding:"36px 24px" }}>
<div style={{ background:"linear-gradient(135deg,rgba(255,200,71,0.12) 0%,rgba <divstyle={{fontSize:48,marginBottom:12}}> </div>
<div style={{ fontFamily:ANTON,fontSize:26,color:A.gold,letterSpacing:1,marg <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(`¡Hola! Soy ${cl
            style={{ display:"block",width:"100%",padding:"18px",border:"none",borderR
            CONTACTAR
          </a>
</div>
        <div style={{ textAlign:"center" }}><button onClick={logout} style={{ backgrou
      </div>
</div> );
}
function NoTrips({ cl, logout }) {
  return (
    <div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",displ
      <div style={{ fontSize
  tom:24,
ansform
="Tu op
20px",b
e={{ ba
ay:"fle
100%)",
ight:0.
:16 }}>
(0,240,
inBotto
.nombre
adius:1
nd:"non
ay:"fle
