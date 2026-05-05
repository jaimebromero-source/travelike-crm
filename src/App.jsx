import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nvdwuvrxwkyitltgdyic.supabase.co";
const SUPABASE_KEY = "sb_publishable_bh5E4QYVkG6R3fph7DyqcQ_IYMUBhZK";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SK_T="tv9-trips",SK_C="tv9-clients",SK_CRM="tv9-crm",SK_SES="tv9-session",SK_CFG="tv9-cfg",SK_ADMIN="tv9-admin-token",SK_RP="tv9-reservas",SK_GG="tv9-gastos-gen";

const verifyPin=async(pin,type="admin")=>{try{const{data,error}=await supabase.rpc("tl_verify_and_login",{input_pin:pin,pin_type:type});if(error)return{status:"error",msg:error.message};return typeof data==="string"?JSON.parse(data):data;}catch(e){return{status:"error",msg:e.message};}};
const verifySessionToken=async(token,type="admin")=>{if(!token||typeof token!=="string"||token==="true")return false;try{const{data}=await supabase.rpc("tl_verify_session",{input_token:token,token_type:type});return!!data;}catch{return false;}};
const logoutSessionToken=async(token)=>{if(!token||token==="true")return;try{await supabase.rpc("tl_logout_session",{input_token:token});}catch{}};
const callClaude=async(b64,mime,prompt)=>{const isImg=mime?.startsWith("image/");const isPDF=mime==="application/pdf";const contentParts=[];if(b64&&(isImg||isPDF)){const SUPPORTED_IMG=["image/jpeg","image/png","image/gif","image/webp"];const safeMime=isImg?(SUPPORTED_IMG.includes(mime)?mime:"image/jpeg"):mime;contentParts.push({type:isImg?"image":"document",source:{type:"base64",media_type:safeMime,data:b64}});}contentParts.push({type:"text",text:prompt});const resp=await fetch("/.netlify/functions/claude-proxy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:600,messages:[{role:"user",content:contentParts}]})});const data=await resp.json();if(data.error)throw new Error(data.error.message||JSON.stringify(data.error));return data.content?.[0]?.text||"";};

const BANK_IBAN="ES48 0128 0690 9001 0008 6284",BANK_TITULAR="TraveLike",WA_NUM="34600000000";

const CURRENCIES=[
  {code:"EUR",symbol:"€",name:"Euro"},{code:"USD",symbol:"$",name:"Dólar US"},{code:"GBP",symbol:"£",name:"Libra esterlina"},
  {code:"JPY",symbol:"¥",name:"Yen japonés"},{code:"BRL",symbol:"R$",name:"Real brasileño"},{code:"MXN",symbol:"$",name:"Peso mexicano"},
  {code:"ARS",symbol:"$",name:"Peso argentino"},{code:"AUD",symbol:"A$",name:"Dólar australiano"},{code:"CAD",symbol:"C$",name:"Dólar canadiense"},
  {code:"CHF",symbol:"Fr",name:"Franco suizo"},{code:"CNY",symbol:"¥",name:"Yuan chino"},{code:"INR",symbol:"₹",name:"Rupia india"},
  {code:"KRW",symbol:"₩",name:"Won coreano"},{code:"SGD",symbol:"S$",name:"Dólar singapurense"},{code:"THB",symbol:"฿",name:"Baht tailandés"},
  {code:"VND",symbol:"₫",name:"Dong vietnamita"},{code:"IDR",symbol:"Rp",name:"Rupia indonesia"},{code:"MYR",symbol:"RM",name:"Ringgit malayo"},
  {code:"PHP",symbol:"₱",name:"Peso filipino"},{code:"TWD",symbol:"NT$",name:"Dólar taiwanés"},{code:"HKD",symbol:"HK$",name:"Dólar hongkonés"},
  {code:"AED",symbol:"د.إ",name:"Dírham emiratí"},{code:"SAR",symbol:"ر.س",name:"Riyal saudí"},{code:"ILS",symbol:"₪",name:"Séquel israelí"},
  {code:"ZAR",symbol:"R",name:"Rand sudafricano"},{code:"MAD",symbol:"MAD",name:"Dírham marroquí"},{code:"EGP",symbol:"£",name:"Libra egipcia"},
  {code:"TRY",symbol:"₺",name:"Lira turca"},{code:"RUB",symbol:"₽",name:"Rublo ruso"},{code:"UAH",symbol:"₴",name:"Grivna ucraniana"},
  {code:"GEL",symbol:"₾",name:"Lari georgiano"},{code:"AMD",symbol:"֏",name:"Dram armenio"},{code:"KZT",symbol:"₸",name:"Tenge kazajo"},
  {code:"UZS",symbol:"so'm",name:"Som uzbeko"},{code:"CLP",symbol:"$",name:"Peso chileno"},{code:"COP",symbol:"$",name:"Peso colombiano"},
  {code:"PEN",symbol:"S/",name:"Sol peruano"},{code:"UYU",symbol:"$U",name:"Peso uruguayo"},{code:"SEK",symbol:"kr",name:"Corona sueca"},
  {code:"NOK",symbol:"kr",name:"Corona noruega"},{code:"PLN",symbol:"zł",name:"Esloti polaco"},{code:"CZK",symbol:"Kč",name:"Corona checa"},
  {code:"HUF",symbol:"Ft",name:"Forinto húngaro"},{code:"RON",symbol:"lei",name:"Leu rumano"},{code:"MNT",symbol:"₮",name:"Tugrik mongol"},
];
const getCurrencySymbol=code=>CURRENCIES.find(c=>c.code===code)?.symbol||code;

const A={bg:"#07070f",card:"#0f1824",card2:"#172030",border:"#1e3a5f",text:"#e6e6e6",muted:"#8a9bb3",cyan:"#00F0FF",orange:"#FF9500",green:"#34C759",red:"#FF3B30",gold:"#FFD700",purple:"#BF5AF2",lightblue:"#4FC3F7"};
const ANTON="'Anton', sans-serif",BF="'Barlow Condensed', sans-serif";
const ais={width:"100%",background:A.bg,border:`1px solid ${A.border}`,borderRadius:10,padding:"12px 14px",color:A.text,fontFamily:BF,fontSize:16,outline:"none",boxSizing:"border-box"};
const ab=(bg,fg)=>({background:bg,border:"none",color:fg||"#fff",borderRadius:12,padding:"14px",fontFamily:ANTON,fontSize:16,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"});

const MES=["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MES_F=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const NOW=new Date(),CUR=`${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;

const ROOMS={doble_jun:{label:"🛌 Doble cama junta",short:"Doble Junta",cap:2,color:A.cyan},doble_sep:{label:"🛏️ Doble camas sep.",short:"Doble Sep.",cap:2,color:A.lightblue},individual:{label:"👤 Individual",short:"Individual",cap:1,color:A.orange},triple:{label:"👨‍👩‍👦 Triple",short:"Triple",cap:3,color:A.gold},cuadruple:{label:"👨‍👩‍👧‍👦 Cuádruple",short:"Cuádruple",cap:4,color:A.purple},busca:{label:"🔍 Busca compañero/a",short:"Busca",cap:2,color:"#FF6B6B"}};
const FORMAS_PAGO=[{k:"transferencia",icon:"🏦",label:"Transferencia"},{k:"tarjeta",icon:"💳",label:"Tarjeta"},{k:"vip",icon:"⭐",label:"Descuento VIP"}];
const GASTO_TIPOS=[{k:"vuelo",icon:"✈️",label:"Vuelo"},{k:"hotel",icon:"🏨",label:"Hotel"},{k:"traslado",icon:"🚕",label:"Traslado"},{k:"guia",icon:"🗺️",label:"Guía"},{k:"seguro",icon:"🛡️",label:"Seguro"},{k:"restaurante",icon:"🍽️",label:"Restaurante"},{k:"actividad",icon:"🎟️",label:"Actividad"},{k:"propina",icon:"💸",label:"Propina"},{k:"otros",icon:"📝",label:"Otros"}];
const ST=[{key:"interesado",label:"Interesado",emoji:"👀",color:"#FF9500"},{key:"confirmado",label:"Confirmado",emoji:"✅",color:"#34C759"},{key:"pagado",label:"Pagado",emoji:"💰",color:"#00F0FF"},{key:"cancelado",label:"Cancelado",emoji:"❌",color:"#e8002a"}];
const ST_SELECT=ST.filter(s=>s.key!=="pagado");
const CRM_TABS=[{key:"people",icon:"👥",label:"Viajeros"},{key:"pagos",icon:"💳",label:"Pagos"},{key:"finanzas",icon:"💰",label:"Finanzas"},{key:"ai",icon:"🤖",label:"IA Docs"},{key:"notes",icon:"📝",label:"Notas"},{key:"edit",icon:"⚙️",label:"Editar"}];
const EDIT_SECS=[{k:"general",icon:"🌍",label:"General"},{k:"vuelos",icon:"✈️",label:"Vuelos"},{k:"docs",icon:"📄",label:"Docs"},{k:"pagos",icon:"💳",label:"Pagos"},{k:"info",icon:"ℹ️",label:"Info"},{k:"hotels",icon:"🏨",label:"Hoteles"},{k:"maleta",icon:"🎒",label:"Maleta"},{k:"emerg",icon:"🆘",label:"SOS"},{k:"survey",icon:"⭐",label:"Encuesta"}];
const SURVEY_EMOJIS=["😠","🙁","😐","🙂","🤩"],SURVEY_LABELS=["Muy malo","Malo","Regular","Bueno","Excelente"];
const SURVEY_HLS=[{k:"cultura",l:"🏛️ Cultura"},{k:"gastro",l:"🥘 Gastronomía"},{k:"aloj",l:"🏨 Alojamiento"},{k:"grupo",l:"👥 El grupo"},{k:"activ",l:"🎟️ Actividades"},{k:"paisajes",l:"🌄 Paisajes"},{k:"org",l:"📅 Organización"},{k:"precio",l:"💰 Precio/calidad"}];
const DEFAULT_SURVEY_CATS=[{key:"viaje",label:"Experiencia global",icon:"🌍",tipo:"rating"},{key:"guia",label:"Guía / Organización",icon:"🗺️",tipo:"rating"},{key:"hotel",label:"Alojamientos",icon:"🏨",tipo:"rating"}];
const DEFAULT_IMPRESCINDIBLES=["Pasaporte / DNI vigente","Billete de avión (impreso o digital)","Seguro de viaje","Tarjeta bancaria / efectivo","Cargador del móvil","Medicación habitual","Tarjeta eSIM / Roaming"];
const DEFAULT_MALETA_CATS=[{id:"ropa",icon:"👕",label:"Ropa",items:["Camisetas (x5)","Pantalón largo (x2)","Pantalón corto","Ropa interior (x7)","Calcetines (x7)","Chaqueta ligera","Bañador"]},{id:"calzado",icon:"👟",label:"Calzado",items:["Zapatillas cómodas","Sandalias/Chanclas","Zapatos de vestir (opcional)"]},{id:"aseo",icon:"🪥",label:"Aseo",items:["Cepillo de dientes + pasta","Champú y gel (tamaño viaje)","Desodorante","Protector solar","Bolsa de aseo transparente"]},{id:"tech",icon:"📱",label:"Tecnología",items:["Adaptador de enchufe","Cámara de fotos","Auriculares","Batería externa (Powerbank)"]},{id:"docs",icon:"📄",label:"Documentos",items:["Fotocopias de documentos","Certificados médicos"]},{id:"varios",icon:"🎒",label:"Varios",items:["Gafas de sol","Paraguas pequeño","Botella de agua reutilizable","Libro / Pasatiempos"]}];
const DEFAULT_TEMPLATES=[{id:"pago",emoji:"💰",title:"Recordatorio de pago",body:"Tienes un pago pendiente para tu próximo viaje. Por favor, revisa tu portal."},{id:"vuelos",emoji:"✈️",title:"Tus vuelos están disponibles",body:"Ya puedes descargar tus billetes de avión desde tu portal de viajero."},{id:"docs",emoji:"📄",title:"Documentación lista",body:"Tu documentación de viaje ya está disponible. Descárgala antes del viaje."},{id:"nuevo",emoji:"🌍",title:"Nuevo viaje disponible",body:"Tenemos algo especial preparado. Entra para ver nuestro nuevo destino."},{id:"pasaporte",emoji:"🛂",title:"Revisa tu pasaporte",body:"Recuerda comprobar que tu pasaporte tiene al menos 6 meses de validez."}];

const uid=()=>Math.random().toString(36).slice(2,10);
const genCode=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const fmt=d=>{if(!d)return"";const[y,m]=d.split("-");return`${MES[+m-1]} ${y}`;};
const isPast=d=>d<CUR;
const parseISO=s=>{if(!s)return null;try{const d=new Date(s);return isNaN(d.getTime())?null:d;}catch{return null;}};
const isoToDisplay=s=>{if(!s||s.length<8)return s;const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:s;};
const displayToISO=s=>{if(!s||s.length<8)return s;const m=s.match(/^(\d{2})-(\d{2})-(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:s;};
const daysDiff=s=>{const d=parseISO(s);return d?Math.ceil((d-NOW)/864e5):null;};
const isUrgent=s=>{const n=daysDiff(s);return n!==null&&n>=0&&n<7;};
const isOverdue=s=>{const n=daysDiff(s);return n!==null&&n<0;};
const daysUntilExpiry=s=>{if(!s)return null;const d=parseISO(s);return d?Math.ceil((d-NOW)/864e5):null;};
const passportWarn=s=>{const d=daysUntilExpiry(s);return d!=null&&d<=180;};
const matchSearch=(s,q)=>!q||!q.trim()||s.toLowerCase().includes(q.toLowerCase().trim());
const fileToB64=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=e=>rej(e);r.readAsDataURL(file);});
const fileToDataURL=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=e=>rej(e);r.readAsDataURL(file);});

const emptyHotel=()=>({id:uid(),nombre:"",direccion:"",fechasEstancia:""});
const emptyEmergencias=()=>({policia:"",ambulancia:"",bomberos:"",tourleader:""});
const emptyT=()=>({vuelos:[],docs:[],pagosConfig:[{label:"Reserva",fecha:"",fechaISO:"",importe:""},{label:"Pago Final",fecha:"",fechaISO:"",importe:""}],info:[],webUrl:"",hotels:[],emergencias:emptyEmergencias(),surveyEnabled:false,surveyConfig:{categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[]},maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES],maletaCats:DEFAULT_MALETA_CATS.map(c=>({...c,items:[...c.items]})),gastos:[],facturas:[],facturasVenta:[],currency:"EUR"});

let rateCache={};
const getRate=async(from="EUR",to="EUR")=>{if(from===to)return 1;const key=`${from}_${to}`;if(rateCache[key])return rateCache[key];try{const r=await fetch(`https://open.er-api.com/v6/latest/${from}`);const d=await r.json();const rate=d.rates?.[to]||1;rateCache[key]=rate;return rate;}catch{return 1;}};
const convertToEUR=async(amount,from)=>{if(!amount||from==="EUR")return+amount||0;const rate=await getRate(from,"EUR");return+(+amount*rate).toFixed(2);};
const sendOneSignal=async(title,body,filters=[])=>{try{const r=await fetch("/.netlify/functions/send-notification",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,message:body,filters})});const data=await r.json();if(!r.ok)console.error("[OneSignal]",data);return data;}catch(e){return{success:false,error:e.message};}};

if(typeof document!=="undefined"&&!document.getElementById("tl-f")){const l=document.createElement("link");l.id="tl-f";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css?family=Anton&family=Barlow+Condensed:400,700&display=swap";document.head.appendChild(l);}
const mem={};

const stripBinary=(k,v)=>{if(k!==SK_C&&k!==SK_T)return v;if(!Array.isArray(v))return v;return v.map(item=>{const stripped={...item};if(stripped.passportPhotos)stripped.passportPhotos=[];if(stripped.facturas)stripped.facturas=(stripped.facturas||[]).map(f=>({...f,data:f.data?"__local__":null}));return stripped;});};
const mergeBinary=(k,supaVal,localVal)=>{if((k!==SK_C&&k!==SK_T)||!Array.isArray(supaVal)||!Array.isArray(localVal))return supaVal;return supaVal.map(item=>{const local=localVal.find(l=>l.id===item.id);if(!local)return item;const merged={...item};if(k===SK_C){if(local.passportPhotos?.length)merged.passportPhotos=local.passportPhotos;}if(k===SK_T){if(local.facturas?.length){merged.facturas=item.facturas?.map(f=>{const lf=local.facturas?.find(lf2=>lf2.id===f.id);return lf?.data&&lf.data!=="__local__"?{...f,data:lf.data}:f;})||local.facturas;}}return merged;});};
const db={async get(k){let localVal=null;try{const r=localStorage.getItem(k);if(r)localVal=JSON.parse(r);}catch{}try{const{data,error}=await supabase.from("travelike_store").select("value").eq("key",k).maybeSingle();if(!error&&data?.value){const supaVal=data.value;if(localVal)return mergeBinary(k,supaVal,localVal);return supaVal;}}catch{}if(localVal)return localVal;return mem[k]??null;},async set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}mem[k]=v;try{const stripped=stripBinary(k,v);await supabase.from("travelike_store").upsert({key:k,value:stripped,updated_at:new Date().toISOString()},{onConflict:"key"});}catch{}}};

let _jsPDFInstance=null;
const loadJsPDF=()=>new Promise(resolve=>{if(_jsPDFInstance)return resolve(_jsPDFInstance);if(window.jspdf?.jsPDF){_jsPDFInstance=window.jspdf.jsPDF;return resolve(_jsPDFInstance);}const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";s.onload=()=>{_jsPDFInstance=window.jspdf.jsPDF;resolve(_jsPDFInstance);};document.head.appendChild(s);});
const facturaImporteNum=nombre=>{const m=nombre?.match(/(\d[\d.,]*)/);return m?m[1].replace(",","."):null;};

const DT=[{id:"t_nyc",name:"Nueva York & Washington",date:"2026-12",flag:"🇺🇸",price:2190,currency:"EUR",webUrl:"",fechas:"1 - 8 Diciembre 2026",vuelos:[{id:"v1",nombre:"IDA - Madrid > Nueva York (IB6251)",archivo:"IB6251_Billete.pdf"}],docs:[{id:"d1",nombre:"Seguro médico de viaje",archivo:"Poliza_seguro.pdf"}],pagosConfig:[{label:"Reserva",fecha:"15 Ago 2026",fechaISO:"2026-08-15",importe:"500€"},{label:"Resto",fecha:"1 Nov 2026",fechaISO:"2026-11-01",importe:"1690€"}],info:[{icono:"🔌",titulo:"Enchufes",texto:"Tipo A/B. Voltaje 120V. Necesitas adaptador."}],hotels:[{id:"h1",nombre:"The New Yorker Hotel",direccion:"481 8th Ave, Nueva York, NY 10001",fechasEstancia:"1 - 6 Dic"}],emergencias:{policia:"911",ambulancia:"911",bomberos:"911",tourleader:"+34 600000000"},surveyEnabled:false,surveyConfig:{categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[]},maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES],maletaCats:DEFAULT_MALETA_CATS.map(c=>({...c,items:[...c.items]})),gastos:[],facturas:[],facturasVenta:[]}];
const DC=[{id:"c11",nombre:"Carmen García",email:"carmen@email.com",tripId:"t_nyc",code:"CRM123",status:"confirmado",room:"doble_jun",note:"",pagosEstado:["pagado","pendiente"],pagosImporteCustom:[null,null],personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,passportExpiry:"2028-05-20",passportExpiryDismissed:false,notifEnabled:false,roommateId:"c12",surveySubmitted:false,acompanantes:[],maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",docNumero:"",docVerified:false},{id:"c12",nombre:"Antonio Rodríguez",email:"antonio@email.com",tripId:"t_nyc",code:"ANT456",status:"pagado",room:"doble_jun",note:"Alergia marisco",pagosEstado:["pagado","pagado"],pagosImporteCustom:[null,null],personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,passportExpiry:"2025-10-15",passportExpiryDismissed:false,notifEnabled:false,roommateId:"c11",surveySubmitted:false,acompanantes:[],maletaPersonal:[],maletaMarcados:[],formaPago:"tarjeta",docNumero:"",docVerified:false}];
// ══════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════

function AModal({title,onClose,children}){return(<div style={{position:"fixed",inset:0,background:"#000000CC",display:"flex",alignItems:"flex-end",zIndex:9999}}><div style={{background:A.card2,borderRadius:"20px 20px 0 0",padding:"20px",width:"100%",maxHeight:"90vh",overflowY:"auto",borderTop:`1px solid ${A.border}`,boxSizing:"border-box"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontFamily:ANTON,fontSize:18,color:A.text,letterSpacing:1,textTransform:"uppercase"}}>{title}</span><button onClick={onClose} style={{background:"transparent",border:"none",color:A.muted,fontSize:24,cursor:"pointer",lineHeight:1}}>✕</button></div>{children}</div></div>);}
function ARow({children}){return<div style={{display:"flex",gap:10,marginTop:10}}>{children}</div>;}
function AEmpty({text}){return<div style={{textAlign:"center",color:A.muted,fontSize:14,fontFamily:BF,padding:"24px 0"}}>{text}</div>;}
function CopyBtn({text,label,style}){const[ok,setOk]=React.useState(false);const hasLabel=!!label;return(<button onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(text||"").then(()=>{setOk(true);setTimeout(()=>setOk(false),hasLabel?2000:1800);});}} style={hasLabel?{flexShrink:0,background:ok?A.green+"22":A.cyan+"22",border:`1px solid ${ok?A.green:A.cyan}44`,color:ok?A.green:A.cyan,borderRadius:8,padding:"6px 10px",fontSize:10,fontFamily:BF,cursor:"pointer",fontWeight:700,...(style||{})}:{background:ok?"#22c55e22":"transparent",border:"1px solid "+(ok?"#22c55e":"#ffffff22"),borderRadius:6,padding:"3px 7px",cursor:"pointer",color:ok?"#22c55e":"#ffffff66",fontSize:11,fontFamily:"monospace",lineHeight:1,flexShrink:0,...(style||{})}}>{hasLabel?(ok?"¡Copiado!":label):(ok?"✓":"⎘")}</button>);}

// Image upload from device
function ImgUploadBtn({value,onChange,label,accept="image/jpeg,image/png,image/webp,image/jpg",height=100}){
  const ref=useRef();
  const handleFile=async e=>{const f=e.target.files[0];if(!f)return;const url=await fileToDataURL(f);onChange(url);e.target.value="";};
  return(<div><input ref={ref} type="file" accept={accept} style={{display:"none"}} onChange={handleFile}/>{value?(<div style={{position:"relative",borderRadius:10,overflow:"hidden",border:`2px solid ${A.cyan}44`}}><img src={value} alt="" style={{width:"100%",height,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",top:6,right:6,display:"flex",gap:6}}><button onClick={()=>ref.current.click()} style={{background:"rgba(0,0,0,0.7)",border:"none",borderRadius:7,padding:"5px 10px",color:"#fff",fontFamily:BF,fontSize:11,cursor:"pointer",fontWeight:700}}>✏️ Cambiar</button><button onClick={()=>onChange(null)} style={{background:"rgba(220,30,30,0.8)",border:"none",borderRadius:7,padding:"5px 10px",color:"#fff",fontFamily:BF,fontSize:11,cursor:"pointer",fontWeight:700}}>✕</button></div></div>):(<button onClick={()=>ref.current.click()} style={{width:"100%",padding:"14px",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:10,color:A.muted,fontFamily:BF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{fontSize:18}}>📷</span>{label||"Cargar imagen"}</button>)}</div>);
}

function SearchBar({value,onChange,placeholder}){return(<div style={{position:"relative",marginBottom:12}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Buscar..."} style={{...ais,paddingLeft:34,paddingRight:34}}/>{value&&<button onClick={()=>onChange("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer"}}>✕</button>}</div>);}
function AmountPad({value,onChange}){const keys=["1","2","3","4","5","6","7","8","9",".","0","<"];return(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{keys.map((k,i)=>(<button key={i} onClick={()=>{if(k==="<")onChange(value.slice(0,-1));else onChange(value+k);}} style={{background:A.card,border:`1px solid ${A.border}`,color:A.text,borderRadius:10,padding:16,fontSize:20,fontFamily:ANTON,cursor:"pointer"}}>{k}</button>))}</div>);}

function NumPad({title,subtitle,onSuccess,onCancel,onVerifyAsync,pinLength=6}){
  const[val,setVal]=useState("");const[err,setErr]=useState(false);const[loading,setLoading]=useState(false);const[lockMsg,setLockMsg]=useState("");const len=pinLength;
  const press=async d=>{if(loading||lockMsg)return;if(val.length>=len)return;const next=val+d;setVal(next);if(next.length===len){if(onVerifyAsync){setLoading(true);const result=await onVerifyAsync(next);setLoading(false);if(result===true||result?.status==="ok"){onSuccess(result?.token);}else if(result?.status==="locked"){setLockMsg(`Bloqueado ${result.minutes||30} min`);setVal("");}else{setErr(true);if(result?.remaining!==undefined)setLockMsg(`${result.remaining} intentos restantes`);setTimeout(()=>{setVal("");setErr(false);setLockMsg("");},1800);}}}};
  const KEYS=[["1","2","3"],["4","5","6"],["7","8","9"],["","0","<"]];
  return(<div style={{position:"fixed",inset:0,background:"#000000EE",display:"flex",alignItems:"flex-end",zIndex:10000}}><div style={{background:A.card2,borderRadius:"20px 20px 0 0",padding:"24px",width:"100%",borderTop:`1px solid ${A.border}`,boxSizing:"border-box"}}><div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1,textTransform:"uppercase"}}>{title}</div>{subtitle&&<div style={{fontSize:13,color:A.muted,fontFamily:BF,marginTop:4}}>{subtitle}</div>}<div style={{display:"flex",gap:12,justifyContent:"center",marginTop:20}}>{Array.from({length:len}).map((_,i)=>(<div key={i} style={{width:14,height:14,borderRadius:"50%",background:loading?"#555":i<val.length?A.cyan:A.card,border:`1px solid ${A.border}`,transition:"background 0.1s"}}/>))}</div>{loading&&<div style={{color:A.muted,fontSize:13,marginTop:8,fontFamily:BF}}>Verificando…</div>}{err&&!loading&&<div style={{color:A.red,fontSize:13,marginTop:8,fontWeight:700,fontFamily:BF}}>PIN incorrecto</div>}{lockMsg&&!err&&<div style={{color:A.orange,fontSize:13,marginTop:8,fontWeight:700,fontFamily:BF}}>🔒 {lockMsg}</div>}</div>{KEYS.map((row,ri)=>(<div key={ri} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>{row.map((k,ki)=>(<button key={ki} onClick={()=>{if(k==="<")setVal(v=>v.slice(0,-1));else if(k)press(k);}} disabled={loading||!!lockMsg} style={{background:k===""?"transparent":A.card,border:k===""?"none":`1px solid ${A.border}`,borderRadius:12,padding:"16px",color:A.text,fontFamily:ANTON,fontSize:24,cursor:k===""||loading||lockMsg?"default":"pointer",opacity:loading||lockMsg?0.5:1}}>{k}</button>))}</div>))}<button onClick={onCancel} style={{width:"100%",background:"transparent",border:"none",color:A.muted,padding:"14px",fontSize:14,fontFamily:BF,cursor:"pointer",marginTop:10}}>Cancelar</button></div></div>);
}

function RatingRow({label,icon,value,onChange}){return(<div style={{background:A.card2,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${A.border}`}}><div style={{fontFamily:BF,fontSize:11,color:A.muted,marginBottom:10,letterSpacing:2,textTransform:"uppercase"}}>{icon} {label}</div><div style={{display:"flex",gap:4}}>{SURVEY_EMOJIS.map((em,i)=>(<button key={i} onClick={()=>onChange(i+1)} style={{flex:1,background:value===i+1?A.gold+"22":A.card,border:`1px solid ${value===i+1?A.gold:A.border}`,borderRadius:10,padding:"8px 0",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:22}}>{em}</span><span style={{fontFamily:BF,fontSize:7,color:value===i+1?A.gold:A.muted,textTransform:"uppercase",letterSpacing:1}}>{SURVEY_LABELS[i]}</span></button>))}</div></div>);}

function RoomMenu({current,onSelect,onClose}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:20}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:A.card2,borderRadius:20,width:"100%",maxWidth:320,padding:20,border:`1px solid ${A.border}`}}><div style={{fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>Tipo de habitación</div>{Object.entries(ROOMS).map(([k,r])=>(<button key={k} onClick={()=>{onSelect(k);onClose();}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:current===k?r.color+"15":"transparent",border:`1px solid ${current===k?r.color:"transparent"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}><span style={{fontFamily:BF,fontSize:15,color:current===k?r.color:"#fff",fontWeight:700}}>{r.label}</span>{current===k&&<span style={{color:r.color,fontSize:18}}>✓</span>}</button>))}<button onClick={onClose} style={{...ab(A.card2,A.muted),width:"100%",marginTop:10,border:`1px solid ${A.border}`}}>Cancelar</button></div></div>);}

function FormaPagoMenu({current,onSelect,onClose}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:20}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:A.card2,borderRadius:20,width:"100%",maxWidth:320,padding:20,border:`1px solid ${A.border}`}}><div style={{fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:14,textAlign:"center"}}>Forma de pago</div>{FORMAS_PAGO.map(f=>(<button key={f.k} onClick={()=>{onSelect(f.k);onClose();}} style={{display:"flex",alignItems:"center",gap:14,width:"100%",background:current===f.k?A.cyan+"15":A.card,border:`1px solid ${current===f.k?A.cyan:A.border}`,borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}><span style={{fontSize:24}}>{f.icon}</span><span style={{fontFamily:BF,fontSize:16,color:current===f.k?A.cyan:"#fff",fontWeight:700,flex:1,textAlign:"left"}}>{f.label}</span>{current===f.k&&<span style={{color:A.cyan,fontSize:18}}>✓</span>}</button>))}</div></div>);}

function GastoTipoMenu({current,onSelect,onClose}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:20}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:A.card2,borderRadius:20,width:"100%",maxWidth:340,padding:20,border:`1px solid ${A.border}`}}><div style={{fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:16,textAlign:"center"}}>Categoría del gasto</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{GASTO_TIPOS.map(t=>(<button key={t.k} onClick={()=>{onSelect(t.k);onClose();}} style={{background:current===t.k?A.orange+"22":A.card,border:`1px solid ${current===t.k?A.orange:A.border}`,borderRadius:12,padding:"14px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><span style={{fontSize:22}}>{t.icon}</span><span style={{fontFamily:BF,fontSize:11,color:current===t.k?A.orange:A.muted,textTransform:"uppercase",letterSpacing:1}}>{t.label}</span></button>))}</div></div></div>);}

function CurrencyMenu({current,onSelect,onClose}){const[q,setQ]=useState("");const list=q.trim()?CURRENCIES.filter(c=>c.code.toLowerCase().includes(q.toLowerCase())||c.name.toLowerCase().includes(q.toLowerCase())):CURRENCIES;return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",zIndex:10000}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:A.card2,borderRadius:"20px 20px 0 0",width:"100%",padding:20,maxHeight:"70vh",display:"flex",flexDirection:"column",borderTop:`1px solid ${A.border}`}}><div style={{fontFamily:ANTON,fontSize:16,color:A.text,letterSpacing:1,textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>Divisa</div><SearchBar value={q} onChange={setQ} placeholder="Buscar divisa..."/><div style={{overflowY:"auto",flex:1}}>{list.map(c=>(<button key={c.code} onClick={()=>{onSelect(c.code);onClose();}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:current===c.code?A.gold+"15":A.card,border:`1px solid ${current===c.code?A.gold:A.border}`,borderRadius:10,padding:"11px 14px",marginBottom:6,cursor:"pointer"}}><span style={{fontFamily:ANTON,fontSize:16,color:current===c.code?A.gold:A.cyan,width:36}}>{c.symbol}</span><div style={{flex:1,textAlign:"left"}}><div style={{fontFamily:BF,fontSize:14,fontWeight:700,color:current===c.code?A.gold:"#fff"}}>{c.code}</div><div style={{fontSize:11,color:A.muted,fontFamily:BF}}>{c.name}</div></div>{current===c.code&&<span style={{color:A.gold}}>✓</span>}</button>))}</div></div></div>);}

function FilteredListModal({title,clients,onClose}){const[search,setSearch]=useState("");const displayed=search.trim()?clients.filter(c=>matchSearch(c.nombre,search)||matchSearch(c.code||"",search)):clients;return(<AModal title={title} onClose={onClose}>{clients.length>5&&<SearchBar value={search} onChange={setSearch} placeholder="Buscar..."/>}{displayed.length===0&&<AEmpty text={search?"Sin resultados":"Sin viajeros"}/>}{displayed.map(c=>(<div key={c.id} style={{background:A.bg,borderRadius:12,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:8,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:16,color:A.cyan,flexShrink:0,overflow:"hidden"}}>{c.passportPhoto?<img src={c.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:c.nombre[0]?.toUpperCase()}</div><div style={{flex:1}}><div style={{fontFamily:BF,fontSize:15,fontWeight:700,color:A.text}}>{c.nombre}</div>{c._sub&&<div style={{fontSize:11,color:A.orange,fontFamily:BF,marginTop:2}}>{c._sub}</div>}</div></div>))}</AModal>);}

function PassportImageViewer({src}){const[zoom,setZoom]=React.useState(1);const[rot,setRot]=React.useState(0);const[pan,setPan]=React.useState({x:0,y:0});const[dragging,setDragging]=React.useState(false);const dragStart=React.useRef(null);const lastPan=React.useRef({x:0,y:0});const isZ=zoom>1;const zoomIn=e=>{e.stopPropagation();setZoom(z=>Math.min(5,+(z+0.5).toFixed(2)));};const zoomOut=e=>{e.stopPropagation();const n=Math.max(1,+(zoom-0.5).toFixed(2));setZoom(n);if(n===1){setPan({x:0,y:0});lastPan.current={x:0,y:0};}};const rotate=e=>{e.stopPropagation();setRot(r=>(r+90)%360);};const reset=e=>{e.stopPropagation();setZoom(1);setRot(0);setPan({x:0,y:0});lastPan.current={x:0,y:0};};const onImgDown=e=>{if(!isZ)return;setDragging(true);dragStart.current={x:e.clientX-lastPan.current.x,y:e.clientY-lastPan.current.y};};const onImgMove=e=>{if(!dragging)return;const nx=e.clientX-dragStart.current.x;const ny=e.clientY-dragStart.current.y;lastPan.current={x:nx,y:ny};setPan({x:nx,y:ny});};const onImgUp=()=>setDragging(false);return(<div style={{background:"#000",display:"flex",flexDirection:"column",height:"100%",minHeight:0}}><div onPointerDown={e=>e.stopPropagation()} style={{display:"flex",gap:8,padding:"8px 12px",alignItems:"center",background:"rgba(0,0,0,0.6)",flexShrink:0}}><button onClick={zoomOut} disabled={zoom<=1} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:7,width:34,height:34,color:zoom<=1?"#444":"#fff",fontSize:18,cursor:zoom<=1?"default":"pointer"}}>−</button><button onClick={zoomIn} disabled={zoom>=5} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:7,width:34,height:34,color:zoom>=5?"#444":"#fff",fontSize:18,cursor:zoom>=5?"default":"pointer"}}>+</button><span style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontFamily:"monospace",minWidth:34,textAlign:"center"}}>{Math.round(zoom*100)}%</span><button onClick={rotate} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:7,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer"}}>↻</button>{(zoom>1||rot>0)&&<button onClick={reset} style={{background:"rgba(255,200,71,0.15)",border:"1px solid rgba(255,200,71,0.3)",borderRadius:7,padding:"0 10px",height:34,color:"#ffc847",fontSize:10,fontWeight:700,cursor:"pointer",letterSpacing:1}}>RESET</button>}</div><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",userSelect:"none",minHeight:0,position:"relative"}}><img src={src} draggable={false} onPointerDown={onImgDown} onPointerMove={onImgMove} onPointerUp={onImgUp} onPointerLeave={onImgUp} style={{maxWidth:isZ?"none":"100%",maxHeight:isZ?"none":"100%",objectFit:"contain",borderRadius:isZ?0:8,transform:`rotate(${rot}deg) scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,transformOrigin:"center center",transition:dragging?"none":"transform 0.15s ease",cursor:isZ?(dragging?"grabbing":"grab"):"default",touchAction:isZ?"none":"auto"}} alt="Pasaporte"/>{isZ&&<div style={{position:"absolute",bottom:6,left:0,right:0,textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"sans-serif",pointerEvents:"none"}}>Arrastra para mover</div>}</div></div>);}

function PassportModal({modal,onClose,onSave,onChangePhoto,onDelete}){const[docNum,setDocNum]=React.useState(modal.docNum||"");const[expiry,setExpiry]=React.useState(modal.expiry||"");const[birthDate,setBirthDate]=React.useState(modal.birthDate||"");const handleDateInput=setter=>e=>{const digits=e.target.value.replace(/\D/g,"").slice(0,8);let fmt=digits;if(digits.length>2)fmt=digits.slice(0,2)+"-"+digits.slice(2);if(digits.length>4)fmt=digits.slice(0,2)+"-"+digits.slice(2,4)+"-"+digits.slice(4,8);setter(fmt);};return(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,background:"#000",display:"flex",flexDirection:"column",overflow:"hidden"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${A.border}22`,flexShrink:0}}><div style={{fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1}}>{modal.name}</div><div style={{display:"flex",gap:8,alignItems:"center"}}><a href={modal.src} download="pasaporte.jpg" target="_blank" rel="noreferrer" style={{background:A.gold+"22",border:`1px solid ${A.gold}44`,borderRadius:8,padding:"6px 12px",color:A.gold,fontSize:12,fontFamily:BF,fontWeight:700,textDecoration:"none"}}>📲 Guardar</a><button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:`1px solid ${A.border}`,borderRadius:8,width:36,height:36,color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div></div><div style={{flex:1,overflow:"hidden",minHeight:0}}><PassportImageViewer src={modal.src}/></div><div style={{background:"#0a0a12",borderTop:`2px solid ${A.cyan}33`,padding:"14px 16px",flexShrink:0}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div><div style={{fontFamily:BF,fontSize:9,color:A.cyan,letterSpacing:2.5,textTransform:"uppercase",marginBottom:5}}>Nº Documento</div><input value={docNum} onChange={e=>setDocNum(e.target.value.toUpperCase())} placeholder="ABC123456" autoComplete="off" style={{...ais,fontFamily:ANTON,fontSize:18,letterSpacing:2,textAlign:"center",color:A.cyan,background:"#000",border:`2px solid ${A.cyan}44`,borderRadius:10,padding:"12px 8px"}}/></div><div><div style={{fontFamily:BF,fontSize:9,color:A.orange,letterSpacing:2.5,textTransform:"uppercase",marginBottom:5}}>Caducidad</div><input value={expiry} onChange={handleDateInput(setExpiry)} placeholder="DD-MM-AAAA" inputMode="numeric" type="text" autoComplete="off" maxLength={10} style={{...ais,fontFamily:ANTON,fontSize:16,textAlign:"center",color:A.text,background:"#000",border:`2px solid ${A.border}55`,borderRadius:10,padding:"12px 8px"}}/></div></div><div style={{marginBottom:10}}><div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2.5,textTransform:"uppercase",marginBottom:5}}>Fecha de nacimiento</div><input value={birthDate} onChange={handleDateInput(setBirthDate)} placeholder="DD-MM-AAAA" inputMode="numeric" type="text" autoComplete="off" maxLength={10} style={{...ais,fontFamily:ANTON,fontSize:16,textAlign:"center",color:A.gold,background:"#000",border:`2px solid ${A.gold}44`,borderRadius:10,padding:"12px 8px"}}/></div><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8}}><button onClick={()=>onSave(docNum,expiry,birthDate)} style={{background:`linear-gradient(90deg,${A.cyan},#00a8cc)`,border:"none",borderRadius:10,padding:"13px",color:A.bg,fontFamily:ANTON,fontSize:14,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>💾 Guardar</button><button onClick={onChangePhoto} style={{background:A.purple+"22",border:`1px solid ${A.purple}44`,borderRadius:10,padding:"13px",color:A.purple,fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer"}}>📷 Cambiar</button><button onClick={onDelete} style={{background:A.red+"22",border:`1px solid ${A.red}44`,borderRadius:10,padding:"13px",color:A.red,fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer"}}>🗑 Borrar</button></div></div></div>);}

function Lightbox({src,onClose}){const[zoom,setZoom]=React.useState(1);const[rot,setRot]=React.useState(0);const[pan,setPan]=React.useState({x:0,y:0});const[dragging,setDragging]=React.useState(false);const dragStart=React.useRef(null);const lastPan=React.useRef({x:0,y:0});const isZoomed=zoom>1;const handleWheel=e=>{e.stopPropagation();const next=Math.min(5,Math.max(1,zoom+(e.deltaY<0?0.25:-0.25)));setZoom(next);if(next===1)setPan({x:0,y:0});};const handlePointerDown=e=>{if(!isZoomed)return;e.preventDefault();setDragging(true);dragStart.current={x:e.clientX-lastPan.current.x,y:e.clientY-lastPan.current.y};};const handlePointerMove=e=>{if(!dragging)return;const nx=e.clientX-dragStart.current.x;const ny=e.clientY-dragStart.current.y;lastPan.current={x:nx,y:ny};setPan({x:nx,y:ny});};const handlePointerUp=()=>setDragging(false);const zoomIn=e=>{e.stopPropagation();setZoom(z=>Math.min(5,z+0.5));};const zoomOut=e=>{e.stopPropagation();const next=Math.max(1,zoom-0.5);setZoom(next);if(next===1){setPan({x:0,y:0});lastPan.current={x:0,y:0};}};const rotate=e=>{e.stopPropagation();setRot(r=>(r+90)%360);};const reset=e=>{e.stopPropagation();setZoom(1);setRot(0);setPan({x:0,y:0});lastPan.current={x:0,y:0};};return(<div onClick={!isZoomed?onClose:undefined} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:10000,display:"flex",flexDirection:"column",touchAction:"none",userSelect:"none"}}><div onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(10px)",flexShrink:0}}><div style={{display:"flex",gap:8}}><button onClick={zoomOut} disabled={zoom<=1} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,color:zoom<=1?"#555":"#fff",fontSize:20,cursor:zoom<=1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><button onClick={zoomIn} disabled={zoom>=5} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,color:zoom>=5?"#555":"#fff",fontSize:20,cursor:zoom>=5?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button><div style={{display:"flex",alignItems:"center",color:"rgba(255,255,255,0.5)",fontSize:12,fontFamily:"monospace",minWidth:36,justifyContent:"center"}}>{Math.round(zoom*100)}%</div></div><div style={{display:"flex",gap:8}}><button onClick={rotate} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,width:38,height:38,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↻</button>{(zoom>1||rot>0)&&<button onClick={reset} style={{background:"rgba(255,200,71,0.2)",border:"1px solid rgba(255,200,71,0.4)",borderRadius:8,padding:"0 12px",height:38,color:"#ffc847",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:1}}>RESET</button>}<button onClick={e=>{e.stopPropagation();onClose();}} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:38,height:38,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div></div><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}><img src={src} draggable={false} style={{maxWidth:isZoomed?"none":"100%",maxHeight:isZoomed?"none":"calc(100vh - 60px)",objectFit:"contain",transform:`rotate(${rot}deg) scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,transformOrigin:"center center",transition:dragging?"none":"transform 0.15s ease",cursor:isZoomed?(dragging?"grabbing":"grab"):"default",borderRadius:4}} alt="Pasaporte"/></div></div>);}

function ExpenseStats({gastos}){if(!gastos?.length)return null;const byTipo={};gastos.forEach(g=>{const key=g.tipo||"otros";if(!byTipo[key])byTipo[key]=0;byTipo[key]+=(+g.importeEUR||+g.importe||0);});const total=Object.values(byTipo).reduce((a,b)=>a+b,0);if(!total)return null;const sorted=Object.entries(byTipo).sort((a,b)=>b[1]-a[1]);const colors=[A.orange,A.cyan,A.gold,A.green,A.purple,A.lightblue,A.red,"#FF6B6B","#00CED1"];return(<div style={{background:A.card2,borderRadius:14,padding:"14px 16px",marginBottom:14,border:`1px solid ${A.border}`}}><div style={{fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>DISTRIBUCIÓN DE GASTOS</div>{sorted.map(([tipo,amount],i)=>{const ti=GASTO_TIPOS.find(t=>t.k===tipo)||GASTO_TIPOS[GASTO_TIPOS.length-1];const pct=total>0?(amount/total*100):0;const col=colors[i%colors.length];return(<div key={tipo} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontFamily:BF,fontSize:13,color:A.muted}}>{ti.icon} {ti.label}</span><div style={{textAlign:"right"}}><span style={{fontFamily:ANTON,fontSize:13,color:col}}>{amount.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</span><span style={{fontFamily:BF,fontSize:11,color:A.muted,marginLeft:6}}>({pct.toFixed(0)}%)</span></div></div><div style={{height:8,background:A.border,borderRadius:4}}><div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:4,transition:"width 0.5s ease"}}/></div></div>);})}</div>);}

function RegistroPagoModal({trips,clients,tid,sC,onClose}){const trip=trips.find(t=>t.id===tid);const tc=clients.filter(c=>c.tripId===tid);const pc=trip?.pagosConfig||[];const[cid,setCid]=useState(tc.length>0?tc[0].id:"");const[pidx,setPidx]=useState(0);const[metodo,setMetodo]=useState("transferencia");const[monto,setMonto]=useState("");const[metodoMenu,setMetodoMenu]=useState(false);useEffect(()=>{const client=tc.find(c=>c.id===cid);if(client&&pc[pidx]){const imp=(client.pagosImporteCustom||[])[pidx]||pc[pidx].importe||"";setMonto(imp.toString().replace(/[^\d.]/g,""));}},[cid,pidx]);const handleSave=()=>{if(!monto||!cid)return;sC(clients.map(c=>{if(c.id!==cid)return c;const ae=[...(c.pagosEstado||pc.map(()=>"pendiente"))];ae[pidx]="pagado";const ai=[...(c.pagosImporteCustom||pc.map(()=>null))];ai[pidx]=`${monto}€`;return{...c,pagosEstado:ae,pagosImporteCustom:ai,formaPago:metodo};}));onClose();};const currentFP=FORMAS_PAGO.find(f=>f.k===metodo)||FORMAS_PAGO[0];return(<AModal title="Registrar Pago" onClose={onClose}><div style={{marginBottom:12}}><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Cliente</div><select value={cid} onChange={e=>setCid(e.target.value)} style={ais}>{tc.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}><div><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Concepto</div><select value={pidx} onChange={e=>setPidx(Number(e.target.value))} style={ais}>{pc.map((p,i)=><option key={i} value={i}>{p.label}</option>)}</select></div><div><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Forma de pago</div><button onClick={()=>setMetodoMenu(true)} style={{...ais,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 12px"}}><span>{currentFP.icon} {currentFP.label}</span><span style={{color:A.muted}}>›</span></button></div></div><div style={{marginBottom:16}}><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Importe (€)</div><div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:10,padding:"16px",fontSize:28,fontFamily:ANTON,color:A.cyan,textAlign:"right"}}>{monto||"0"}</div></div><AmountPad value={monto} onChange={setMonto}/><button onClick={handleSave} disabled={!monto} style={{...ab(A.cyan,A.bg),width:"100%",marginTop:16}}>Confirmar Pago</button>{metodoMenu&&<FormaPagoMenu current={metodo} onSelect={setMetodo} onClose={()=>setMetodoMenu(false)}/>}</AModal>);}
// ══════════════════════════════════════════════════════════
// CARTA DE PAGO GENERATOR
// ══════════════════════════════════════════════════════════
function CartaDePagoGenerator({onBack}){
  const[tab,setTab]=useState("general");
  const[titulo,setTitulo]=useState("CARTA DE PAGO");
  const[programa,setPrograma]=useState("");
  const[salida,setSalida]=useState("");
  const[regreso,setRegreso]=useState("");
  const[logo,setLogo]=useState(null);
  const[textColor,setTextColor]=useState("#1A2B3C");
  const logoRef=useRef();
  const[lineas,setLineas]=useState([{id:uid(),desc:"",sub:"",precio:""}]);
  const[pagos,setPagos]=useState([{id:uid(),label:"Reserva — reserva de plaza",importe:"",fecha:""},{id:uid(),label:"Pago Final",importe:"",fecha:""}]);
  const[vuelos,setVuelos]=useState([{id:uid(),origen:"",destino:"",fecha:"",horaSalida:"",horaLlegada:"",equipaje:""}]);
  const[vuelosEnabled,setVuelosEnabled]=useState(true);
  const[incluyeItems,setIncluyeItems]=useState([{id:uid(),em:"✈️",txt:"Vuelos internacionales"},{id:uid(),em:"🏨",txt:"Alojamiento en hotel"},{id:uid(),em:"🗺️",txt:"Guía turístico"},{id:uid(),em:"🛡️",txt:"Seguro de viaje"}]);
  const[noIncluyeItems,setNoIncluyeItems]=useState([{id:uid(),em:"🍽️",txt:"Comidas y cenas salvo indicación"},{id:uid(),em:"💳",txt:"Gastos personales"}]);
  const[incluyeEnabled,setIncluyeEnabled]=useState(true);
  const[nota,setNota]=useState("");
  const[gen,setGen]=useState(false);
  const vRef=useRef();

  const addLinea=()=>setLineas(ls=>[...ls,{id:uid(),desc:"",sub:"",precio:""}]);
  const removeLinea=id=>setLineas(ls=>ls.filter(l=>l.id!==id));
  const updLinea=(id,f,v)=>setLineas(ls=>ls.map(l=>l.id===id?{...l,[f]:v}:l));
  const addPago=()=>setPagos(p=>[...p,{id:uid(),label:"",importe:"",fecha:""}]);
  const removePago=id=>setPagos(p=>p.filter(x=>x.id!==id));
  const updPago=(id,f,v)=>setPagos(ps=>ps.map(x=>x.id===id?{...x,[f]:v}:x));
  const addVuelo=()=>setVuelos(v=>[...v,{id:uid(),origen:"",destino:"",fecha:"",horaSalida:"",horaLlegada:"",equipaje:""}]);
  const removeVuelo=id=>setVuelos(v=>v.filter(x=>x.id!==id));
  const updVuelo=(id,f,v)=>setVuelos(vs=>vs.map(x=>x.id===id?{...x,[f]:v}:x));
  const addInc=()=>setIncluyeItems(i=>[...i,{id:uid(),em:"✅",txt:""}]);
  const removeInc=id=>setIncluyeItems(i=>i.filter(x=>x.id!==id));
  const updInc=(id,f,v)=>setIncluyeItems(is=>is.map(x=>x.id===id?{...x,[f]:v}:x));
  const addNoInc=()=>setNoIncluyeItems(i=>[...i,{id:uid(),em:"❌",txt:""}]);
  const removeNoInc=id=>setNoIncluyeItems(i=>i.filter(x=>x.id!==id));
  const updNoInc=(id,f,v)=>setNoIncluyeItems(is=>is.map(x=>x.id===id?{...x,[f]:v}:x));

  const fmtD=raw=>{if(!raw)return"—";const[y,m,d]=raw.split("-");return`${d}-${m}-${y}`;};

  const reset=()=>{if(!window.confirm("¿Limpiar todos los campos?"))return;setTitulo("CARTA DE PAGO");setPrograma("");setSalida("");setRegreso("");setLogo(null);setTextColor("#1A2B3C");setLineas([{id:uid(),desc:"",sub:"",precio:""}]);setPagos([{id:uid(),label:"Reserva — reserva de plaza",importe:"",fecha:""},{id:uid(),label:"Pago Final",importe:"",fecha:""}]);setVuelos([{id:uid(),origen:"",destino:"",fecha:"",horaSalida:"",horaLlegada:"",equipaje:""}]);setVuelosEnabled(true);setIncluyeItems([{id:uid(),em:"✈️",txt:"Vuelos internacionales"},{id:uid(),em:"🏨",txt:"Alojamiento en hotel"},{id:uid(),em:"🗺️",txt:"Guía turístico"},{id:uid(),em:"🛡️",txt:"Seguro de viaje"}]);setNoIncluyeItems([{id:uid(),em:"🍽️",txt:"Comidas y cenas salvo indicación"},{id:uid(),em:"💳",txt:"Gastos personales"}]);setIncluyeEnabled(true);setNota("");};

  const ensureLibs=async()=>{if(!window.html2canvas)await new Promise(res=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";s.onload=res;document.head.appendChild(s);});return loadJsPDF();};
  const buildPDF=async()=>{const JsPDF=await ensureLibs();const el=vRef.current;const canvas=await window.html2canvas(el,{scale:2,useCORS:true,backgroundColor:"#ffffff"});const img=canvas.toDataURL("image/jpeg",0.92);const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();const r=Math.min(pw/canvas.width,ph/canvas.height);pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);return pdf;};
  const downloadPDF=async()=>{setGen(true);try{const pdf=await buildPDF();pdf.save("carta-de-pago-travelike.pdf");}catch(e){alert("Error: "+e.message);}setGen(false);};
  const shareWA=async()=>{setGen(true);try{const pdf=await buildPDF();const blob=pdf.output("blob");const file=new File([blob],"carta-de-pago-travelike.pdf",{type:"application/pdf"});if(navigator.canShare?.({files:[file]})){await navigator.share({title:"Carta de Pago Travelike",files:[file]});}else{const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="carta-de-pago-travelike.pdf";a.click();URL.revokeObjectURL(url);setTimeout(()=>window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent("¡Aquí tu carta de pago! 🌍✈️")}`,"_blank"),800);}}catch(e){alert("Error: "+e.message);}setGen(false);};

  const TABS=[["general","🌍 General"],["vuelos","✈️ Vuelos"],["conceptos","💶 Conceptos"],["pagos","💳 Pagos"],["incluye","✅ Incluye"],["preview","👁 Vista previa"]];
  const lbl={fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5};
  const ActBtns=()=>(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}><button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),border:`1px solid ${A.gold}44`,fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳ Generando...":"⬇️ Descargar PDF"}</button><button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),border:"1px solid #25D36644",fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳...":"💬 Enviar por WA"}</button></div>);

  const PreviewCard=()=>(
    <div style={{border:`1px solid ${A.border}`,borderRadius:12,overflow:"hidden",background:"#fff"}}>
      <div style={{background:"#0D2137",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"3px solid #1AB5B0"}}>
        {logo?<img src={logo} alt="Logo" style={{height:36,maxWidth:110,objectFit:"contain"}}/>:<div><div style={{fontFamily:ANTON,fontSize:18,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div><div style={{fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:3,marginTop:1}}>AGENCIA DE VIAJES</div></div>}
        <div style={{textAlign:"right"}}><div style={{fontFamily:ANTON,fontSize:11,color:"#fff",letterSpacing:1}}>{titulo.toUpperCase()}</div>{salida&&<div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:2}}>{fmtD(salida)}{regreso?` → ${fmtD(regreso)}`:""}</div>}</div>
      </div>
      <div style={{padding:"12px 18px"}}>
        {programa&&<div style={{fontFamily:ANTON,fontSize:12,color:textColor,marginBottom:10,textTransform:"uppercase"}}>{programa}</div>}
        <div style={{background:"#0D2137",borderRadius:6,padding:"8px 12px",marginBottom:10}}><div style={{fontSize:7,color:"#1AB5B0",letterSpacing:2,marginBottom:3}}>DATOS BANCARIOS</div><div style={{fontSize:10,color:"#fff",fontWeight:600}}>{BANK_IBAN}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:1}}>Titular: {BANK_TITULAR}</div></div>
        {vuelosEnabled&&vuelos.filter(v=>v.origen||v.destino).length>0&&(<div style={{marginBottom:10}}><div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #D8E4EE"}}>✈️ VUELOS</div>{vuelos.filter(v=>v.origen||v.destino).map(v=>(<div key={v.id} style={{padding:"5px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{fontSize:11,color:textColor,fontWeight:600}}>{v.origen}{v.origen&&v.destino?" → ":""}{v.destino}</div><div style={{fontSize:9,color:"#6B8399",marginTop:1}}>{[v.fecha&&`📅 ${v.fecha}`,v.horaSalida&&`🛫 ${v.horaSalida}`,v.horaLlegada&&`🛬 ${v.horaLlegada}`].filter(Boolean).join("  ")}</div>{v.equipaje&&<div style={{fontSize:9,color:"#6B8399",marginTop:1}}>🧳 {v.equipaje}</div>}</div>))}</div>)}
        {incluyeEnabled&&(incluyeItems.filter(i=>i.txt).length>0||noIncluyeItems.filter(i=>i.txt).length>0)&&(<div style={{marginBottom:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{incluyeItems.filter(i=>i.txt).length>0&&<div><div style={{fontSize:8,color:"#22c55e",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>✅ INCLUYE</div>{incluyeItems.filter(i=>i.txt).map(i=><div key={i.id} style={{fontSize:9,color:textColor,padding:"1px 0",display:"flex",gap:3}}><span>{i.em}</span><span>{i.txt}</span></div>)}</div>}{noIncluyeItems.filter(i=>i.txt).length>0&&<div><div style={{fontSize:8,color:"#E05C5C",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>❌ NO INCLUYE</div>{noIncluyeItems.filter(i=>i.txt).map(i=><div key={i.id} style={{fontSize:9,color:textColor,padding:"1px 0",display:"flex",gap:3}}><span>{i.em}</span><span>{i.txt}</span></div>)}</div>}</div>)}
        {lineas.filter(l=>l.desc||l.precio).length>0&&(<div style={{marginBottom:10}}><div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #D8E4EE"}}>DESGLOSE DEL PRECIO</div>{lineas.filter(l=>l.desc||l.precio).map(l=>(<div key={l.id} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:"1px solid #F4F7FA"}}><span style={{color:"#1AB5B0",fontSize:10}}>—</span><div style={{flex:1}}><div style={{fontSize:11,color:textColor}}>{l.desc}</div>{l.sub&&<div style={{fontSize:9,color:"#6B8399"}}>{l.sub}</div>}</div><div style={{fontSize:11,color:textColor,fontWeight:700,flexShrink:0}}>{l.precio}</div></div>))}</div>)}
        {pagos.filter(p=>p.importe||p.label).length>0&&(<div style={{marginBottom:10}}><div style={{fontSize:8,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #D8E4EE"}}>PLAN DE PAGOS</div>{pagos.filter(p=>p.importe||p.label).map((p,i)=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #F4F7FA"}}><div><div style={{fontSize:11,color:textColor,fontWeight:500}}>{p.label||`Pago ${i+1}`}</div>{p.fecha&&<div style={{fontSize:9,color:"#E05C5C"}}>Antes del {fmtD(p.fecha)}</div>}</div><div style={{fontSize:11,color:"#0D8E8A",fontWeight:700}}>{p.importe}</div></div>))}</div>)}
        {nota&&<div style={{fontSize:10,color:"#6B8399",fontStyle:"italic",padding:"6px 0"}}>{nota}</div>}
        <div style={{marginTop:8,padding:"10px 12px",background:"#F4F7FA",borderRadius:6,border:"1px solid #D8E4EE"}}><div style={{fontSize:9,color:"#6B8399",lineHeight:1.6}}>Este documento confirma su reserva con TraveLike. Las plazas quedan reservadas una vez realizado el primer pago.</div></div>
      </div>
      <div style={{background:"#0D2137",padding:"8px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>{logo?<img src={logo} alt="" style={{height:22,maxWidth:80,objectFit:"contain"}}/>:<div style={{fontFamily:ANTON,fontSize:12,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div>}<div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>www.travelike.es</div></div>
    </div>
  );

  return(
    <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF,paddingBottom:80}}>
      <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button>
        <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Carta de Pago</div>
        <button onClick={reset} style={{background:"transparent",border:`1px solid ${A.border}`,color:A.muted,borderRadius:8,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>Limpiar</button>
      </div>
      <div style={{overflowX:"auto",borderBottom:`1px solid ${A.border}`,background:A.card,display:"flex",scrollbarWidth:"none"}}>
        {TABS.map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{flexShrink:0,background:"transparent",border:"none",borderBottom:`2px solid ${tab===k?A.gold:"transparent"}`,color:tab===k?A.gold:A.muted,padding:"10px 14px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:BF,letterSpacing:1,whiteSpace:"nowrap",textTransform:"uppercase"}}>{l}</button>))}
      </div>
      <div style={{padding:"14px 16px"}}>
        {tab==="general"&&(<div>
          <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`}}>DATOS GENERALES</div>
          <div style={{marginBottom:10}}><div style={lbl}>Título del documento</div><input value={titulo} onChange={e=>setTitulo(e.target.value)} style={ais}/></div>
          <div style={{marginBottom:10}}><div style={lbl}>Programa / Destino</div><input value={programa} onChange={e=>setPrograma(e.target.value)} placeholder="Ej: PROGRAMA TRAVELIKE JAPÓN MAYO 2026" style={ais}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div><div style={lbl}>Fecha salida</div><input type="date" value={salida} onChange={e=>setSalida(e.target.value)} style={ais}/></div>
            <div><div style={lbl}>Fecha regreso</div><input type="date" value={regreso} onChange={e=>setRegreso(e.target.value)} style={ais}/></div>
          </div>
          <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`}}>LOGOTIPO</div>
          <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg,image/gif" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(f){setLogo(await fileToDataURL(f));}e.target.value="";}}/>
          {logo?(<div style={{background:A.card2,borderRadius:10,padding:10,border:`2px solid ${A.cyan}44`,marginBottom:14}}><img src={logo} alt="Logo" style={{maxHeight:60,maxWidth:"100%",objectFit:"contain",display:"block",margin:"0 auto"}}/><div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>logoRef.current.click()} style={{...ab(A.cyan+"22",A.cyan),flex:1,border:`1px solid ${A.cyan}44`,padding:"8px",fontSize:12,borderRadius:8,fontFamily:BF}}>📷 Cambiar</button><button onClick={()=>setLogo(null)} style={{...ab(A.red+"22",A.red),flex:1,border:`1px solid ${A.red}44`,padding:"8px",fontSize:12,borderRadius:8,fontFamily:BF}}>🗑 Quitar</button></div></div>):(<button onClick={()=>logoRef.current.click()} style={{width:"100%",padding:"14px",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:10,color:A.muted,fontFamily:BF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}><span style={{fontSize:20}}>🏷️</span>Cargar logo (PNG, JPG, WebP...)</button>)}
          <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`}}>COLOR DE LETRA</div>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#1A2B3C","#ffffff","#e8002a","#000000","#0D2137","#1AB5B0","#9B1C1C"].map(c=>(<button key={c} onClick={()=>setTextColor(c)} style={{width:32,height:32,borderRadius:8,background:c,border:textColor===c?"3px solid "+A.cyan:"2px solid #333",cursor:"pointer",flexShrink:0}}/>))}</div>
            <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} style={{width:36,height:36,borderRadius:8,border:`1px solid ${A.border}`,background:"transparent",cursor:"pointer",padding:2}}/>
            <span style={{fontFamily:"monospace",fontSize:12,color:A.muted}}>{textColor}</span>
          </div>
        </div>)}
        {tab==="vuelos"&&(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",flex:1}}>VUELOS</div>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="checkbox" checked={vuelosEnabled} onChange={e=>setVuelosEnabled(e.target.checked)} style={{width:"auto",accentColor:A.gold}}/><span style={{fontFamily:BF,fontSize:10,color:A.muted}}>Mostrar</span></label>
          </div>
          {!vuelosEnabled&&<div style={{padding:"16px",color:A.muted,fontSize:13,fontFamily:BF,textAlign:"center"}}>Sección de vuelos oculta en el documento</div>}
          {vuelosEnabled&&(<>
            {vuelos.map((v,i)=>(<div key={v.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:12,padding:12,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:A.cyan,letterSpacing:2,fontWeight:700,textTransform:"uppercase"}}>VUELO {i+1}</div>{vuelos.length>1&&<button onClick={()=>removeVuelo(v.id)} style={{background:"none",border:"none",color:A.red,fontSize:16,cursor:"pointer"}}>× Quitar</button>}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div><div style={lbl}>🛫 Ciudad origen</div><input value={v.origen} onChange={e=>updVuelo(v.id,"origen",e.target.value)} placeholder="Madrid (MAD)" style={ais}/></div>
                <div><div style={lbl}>🛬 Ciudad destino</div><input value={v.destino} onChange={e=>updVuelo(v.id,"destino",e.target.value)} placeholder="Tokio (NRT)" style={ais}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                <div><div style={lbl}>📅 Fecha</div><input value={v.fecha} onChange={e=>updVuelo(v.id,"fecha",e.target.value)} placeholder="20-05-2026" style={ais}/></div>
                <div><div style={lbl}>🛫 H.Salida</div><input value={v.horaSalida} onChange={e=>updVuelo(v.id,"horaSalida",e.target.value)} placeholder="09:30" style={ais}/></div>
                <div><div style={lbl}>🛬 H.Llegada</div><input value={v.horaLlegada} onChange={e=>updVuelo(v.id,"horaLlegada",e.target.value)} placeholder="06:05+1" style={ais}/></div>
              </div>
              <div><div style={lbl}>🧳 Equipaje incluido</div><input value={v.equipaje} onChange={e=>updVuelo(v.id,"equipaje",e.target.value)} placeholder="1 cabina 10kg + 1 facturada 23kg" style={ais}/></div>
            </div>))}
            <button onClick={addVuelo} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Añadir vuelo</button>
          </>)}
        </div>)}
        {tab==="conceptos"&&(<div>
          <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`}}>CONCEPTOS / PRECIOS</div>
          {lineas.map(l=>(<div key={l.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:11,marginBottom:8}}><div style={{display:"flex",gap:8,marginBottom:7}}><input value={l.desc} onChange={e=>updLinea(l.id,"desc",e.target.value)} placeholder="Descripción del concepto" style={{...ais,flex:1}}/><input value={l.precio} onChange={e=>updLinea(l.id,"precio",e.target.value)} placeholder="Importe" style={{...ais,width:100,flex:"none"}}/><button onClick={()=>removeLinea(l.id)} style={{background:"none",border:"none",color:A.red,fontSize:20,cursor:"pointer",padding:"0 3px",flexShrink:0}}>×</button></div><textarea value={l.sub} onChange={e=>updLinea(l.id,"sub",e.target.value)} placeholder="Detalle adicional (opcional)" rows={2} style={{...ais,resize:"vertical",lineHeight:1.5,fontSize:13}}/></div>))}
          <button onClick={addLinea} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:16}}>+ Añadir concepto</button>
          <div style={{marginBottom:10}}><div style={lbl}>Nota adicional</div><textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Condiciones, notas extra..." rows={3} style={{...ais,resize:"vertical",lineHeight:1.5}}/></div>
        </div>)}
        {tab==="pagos"&&(<div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontFamily:ANTON,fontSize:14,color:A.text,letterSpacing:1,textTransform:"uppercase"}}>Plan de Pagos</div>
            <button onClick={addPago} style={{...ab(A.orange+"22",A.orange),border:`1px solid ${A.orange}44`,padding:"7px 14px",fontSize:11,borderRadius:8,fontFamily:BF}}>+ Añadir pago</button>
          </div>
          <div style={{fontFamily:BF,fontSize:12,color:A.muted,marginBottom:14}}>Añade los hitos necesarios: pago único, dos pagos, o los que necesites.</div>
          {pagos.map((p,i)=>(<div key={p.id} style={{background:A.card2,border:`1px solid ${A.gold}33`,borderRadius:12,padding:12,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,fontWeight:700,textTransform:"uppercase"}}>PAGO {i+1}</div>{pagos.length>1&&<button onClick={()=>removePago(p.id)} style={{background:"none",border:"none",color:A.red,fontSize:14,cursor:"pointer",fontFamily:BF}}>× Eliminar</button>}</div>
            <input value={p.label} onChange={e=>updPago(p.id,"label",e.target.value)} placeholder="Etiqueta (ej: Reserva de plaza)" style={{...ais,marginBottom:8}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><div style={lbl}>Importe</div><input value={p.importe} onChange={e=>updPago(p.id,"importe",e.target.value)} placeholder="500 €" style={ais}/></div><div><div style={lbl}>Fecha límite</div><input type="date" value={p.fecha||""} onChange={e=>updPago(p.id,"fecha",e.target.value)} style={{...ais,colorScheme:"dark"}}/></div></div>
          </div>))}
          {pagos.length===1&&<div style={{background:A.cyan+"10",border:`1px solid ${A.cyan}22`,borderRadius:10,padding:"10px 14px",fontFamily:BF,fontSize:12,color:A.cyan}}>✓ Pago único — perfecto para reservas con precio cerrado</div>}
        </div>)}
        {tab==="incluye"&&(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",flex:1}}>INCLUYE / NO INCLUYE</div>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="checkbox" checked={incluyeEnabled} onChange={e=>setIncluyeEnabled(e.target.checked)} style={{width:"auto",accentColor:A.gold}}/><span style={{fontFamily:BF,fontSize:10,color:A.muted}}>Mostrar</span></label>
          </div>
          {incluyeEnabled&&(<>
            <div style={{fontFamily:BF,fontSize:10,color:A.green,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>✅ INCLUYE</div>
            {incluyeItems.map(it=>(<div key={it.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input value={it.em} onChange={e=>updInc(it.id,"em",e.target.value)} style={{...ais,width:50,textAlign:"center",fontSize:18,flex:"none",padding:"8px 4px"}}/><input value={it.txt} onChange={e=>updInc(it.id,"txt",e.target.value)} placeholder="Qué incluye..." style={{...ais,flex:1}}/><button onClick={()=>removeInc(it.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer",flexShrink:0}}>×</button></div>))}
            <button onClick={addInc} style={{width:"100%",padding:"9px",border:`1.5px dashed ${A.green}`,borderRadius:10,background:"none",color:A.green,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:16}}>+ Añadir</button>
            <div style={{fontFamily:BF,fontSize:10,color:A.red,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>❌ NO INCLUYE</div>
            {noIncluyeItems.map(it=>(<div key={it.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input value={it.em} onChange={e=>updNoInc(it.id,"em",e.target.value)} style={{...ais,width:50,textAlign:"center",fontSize:18,flex:"none",padding:"8px 4px"}}/><input value={it.txt} onChange={e=>updNoInc(it.id,"txt",e.target.value)} placeholder="Qué NO incluye..." style={{...ais,flex:1}}/><button onClick={()=>removeNoInc(it.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer",flexShrink:0}}>×</button></div>))}
            <button onClick={addNoInc} style={{width:"100%",padding:"9px",border:`1.5px dashed ${A.red}`,borderRadius:10,background:"none",color:A.red,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Añadir</button>
          </>)}
        </div>)}
        {tab==="preview"&&(<div><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",textAlign:"center",marginBottom:12}}>VISTA PREVIA</div><PreviewCard/><ActBtns/></div>)}
        {tab!=="preview"&&(<div style={{marginTop:20}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",textAlign:"center",marginBottom:10}}>VISTA PREVIA EN TIEMPO REAL</div><PreviewCard/><ActBtns/></div>)}
      </div>
      {/* Hidden A4 for PDF */}
      <div style={{position:"fixed",left:-9999,top:0,width:794,pointerEvents:"none",zIndex:-1}}>
        <div ref={vRef} style={{width:794,minHeight:1000,background:"#fff",fontFamily:"'Barlow Condensed',sans-serif"}}>
          <div style={{background:"#0D2137",padding:"28px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"4px solid #1AB5B0"}}>
            {logo?<img src={logo} alt="Logo" style={{height:48,maxWidth:160,objectFit:"contain"}}/>:<div><div style={{fontFamily:"Anton,sans-serif",fontSize:28,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginTop:3}}>AGENCIA DE VIAJES</div></div>}
            <div style={{textAlign:"right"}}><div style={{fontFamily:"Anton,sans-serif",fontSize:20,color:"#fff",letterSpacing:2}}>{titulo.toUpperCase()}</div>{salida&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:4}}>{fmtD(salida)}{regreso?` → ${fmtD(regreso)}`:""}</div>}<div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2}}>Documento de reserva</div></div>
          </div>
          <div style={{padding:"32px 40px"}}>
            {programa&&<div style={{fontFamily:"Anton,sans-serif",fontSize:20,color:textColor,letterSpacing:1,marginBottom:20,textTransform:"uppercase",paddingBottom:14,borderBottom:"1px solid #D8E4EE"}}>{programa}</div>}
            <div style={{background:"#0D2137",borderRadius:8,padding:"16px 20px",marginBottom:24}}><div style={{fontSize:9,color:"#1AB5B0",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Datos bancarios para transferencia</div><div style={{display:"flex",gap:32}}><div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>IBAN</div><div style={{fontSize:13,color:"#fff",fontWeight:600}}>{BANK_IBAN}</div></div><div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Titular</div><div style={{fontSize:13,color:"#fff",fontWeight:600}}>{BANK_TITULAR}</div></div></div></div>
            {vuelosEnabled&&vuelos.filter(v=>v.origen||v.destino).length>0&&(<div style={{marginBottom:22}}><div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:"1px solid #D8E4EE"}}>✈️ Vuelos</div>{vuelos.filter(v=>v.origen||v.destino).map(v=>(<div key={v.id} style={{padding:"10px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{fontSize:14,color:textColor,fontWeight:700}}>{v.origen}{v.origen&&v.destino?" → ":""}{v.destino}</div><div style={{fontSize:11,color:"#6B8399",marginTop:3}}>{[v.fecha&&`📅 ${v.fecha}`,v.horaSalida&&`🛫 Salida: ${v.horaSalida}`,v.horaLlegada&&`🛬 Llegada: ${v.horaLlegada}`].filter(Boolean).join("  ·  ")}</div>{v.equipaje&&<div style={{fontSize:11,color:"#6B8399",marginTop:2}}>🧳 {v.equipaje}</div>}</div>))}</div>)}
            {incluyeEnabled&&(incluyeItems.filter(i=>i.txt).length>0||noIncluyeItems.filter(i=>i.txt).length>0)&&(<div style={{marginBottom:22,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>{incluyeItems.filter(i=>i.txt).length>0&&<div><div style={{fontSize:10,color:"#22c55e",letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:"1px solid #D8E4EE"}}>✅ Incluye</div>{incluyeItems.filter(i=>i.txt).map(i=><div key={i.id} style={{fontSize:12,color:textColor,padding:"3px 0",display:"flex",gap:6}}><span>{i.em}</span><span>{i.txt}</span></div>)}</div>}{noIncluyeItems.filter(i=>i.txt).length>0&&<div><div style={{fontSize:10,color:"#E05C5C",letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:"1px solid #D8E4EE"}}>❌ No incluye</div>{noIncluyeItems.filter(i=>i.txt).map(i=><div key={i.id} style={{fontSize:12,color:textColor,padding:"3px 0",display:"flex",gap:6}}><span>{i.em}</span><span>{i.txt}</span></div>)}</div>}</div>)}
            {lineas.filter(l=>l.desc||l.precio).length>0&&(<div style={{marginBottom:22}}><div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:"1px solid #D8E4EE"}}>Desglose del precio</div>{lineas.filter(l=>l.desc||l.precio).map(l=>(<div key={l.id} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{color:"#1AB5B0",fontSize:16}}>—</div><div style={{flex:1}}><div style={{fontSize:14,color:textColor,fontWeight:500}}>{l.desc}</div>{l.sub&&<div style={{fontSize:11,color:"#6B8399",marginTop:3,lineHeight:1.5,whiteSpace:"pre-line"}}>{l.sub}</div>}</div><div style={{fontFamily:"Anton,sans-serif",fontSize:14,color:textColor,letterSpacing:0.5,flexShrink:0}}>{l.precio}</div></div>))}</div>)}
            {pagos.filter(p=>p.importe||p.label).length>0&&(<div style={{marginBottom:22}}><div style={{fontSize:10,color:"#6B8399",letterSpacing:2,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:"1px solid #D8E4EE"}}>Plan de pagos</div>{pagos.filter(p=>p.importe||p.label).map((p,i)=>(<div key={p.id} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F4F7FA"}}><div style={{color:"#0D8E8A"}}>→</div><div style={{flex:1}}><div style={{fontSize:14,color:textColor,fontWeight:500}}>{p.label||`Pago ${i+1}`}</div>{p.fecha&&<div style={{fontSize:11,color:"#E05C5C",marginTop:2}}>Antes del {fmtD(p.fecha)}</div>}</div><div style={{fontFamily:"Anton,sans-serif",fontSize:14,color:"#0D8E8A"}}>{p.importe}</div></div>))}</div>)}
            {nota&&<div style={{fontSize:12,color:"#6B8399",fontStyle:"italic",marginBottom:16}}>{nota}</div>}
            <div style={{marginTop:24,padding:"20px 24px",background:"#F4F7FA",borderRadius:8,border:"1px solid #D8E4EE"}}><div style={{fontSize:11,color:"#6B8399",lineHeight:1.7}}>Este documento confirma su reserva con TraveLike. Para cualquier consulta contacte por WhatsApp o email. Las plazas quedan reservadas una vez realizado el primer pago.</div></div>
          </div>
          <div style={{background:"#0D2137",padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:40}}>{logo?<img src={logo} alt="Logo" style={{height:28,maxWidth:120,objectFit:"contain"}}/>:<div style={{fontFamily:"Anton,sans-serif",fontSize:18,color:"#1AB5B0",letterSpacing:2}}>TRAVELIKE</div>}<div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>www.travelike.es</div></div>
        </div>
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════
// PRESUPUESTO GENERATOR
// ══════════════════════════════════════════════════════════
function PresupuestoGenerator({onBack}){
  const[tab,setTab]=useState("general");
  const[destino,setDestino]=useState("");const[agente,setAgente]=useState("TraveLike");const[pax,setPax]=useState("1");
  const[moneda,setMoneda]=useState("EUR");const[accentColor,setAccentColor]=useState("#00f0ff");
  const[textColor,setTextColor]=useState("#ffffff");
  const[logo,setLogo]=useState(null);const[heroImg,setHeroImg]=useState(null);
  const[heroTitulo,setHeroTitulo]=useState("");const[heroSub,setHeroSub]=useState("");
  const[vuelos,setVuelos]=useState([{id:uid(),origen:"",destino:"",fecha:"",horaSalida:"",horaLlegada:"",equipaje:"",clase:"Turista"}]);
  const[hotelEnabled,setHotelEnabled]=useState(true);const[hotelNombre,setHotelNombre]=useState("");const[hotelLugar,setHotelLugar]=useState("");const[hotelStars,setHotelStars]=useState(4);const[hotelImg,setHotelImg]=useState(null);
  const[actEnabled,setActEnabled]=useState(false);const[actividades,setActividades]=useState([{id:uid(),em:"🎯",nombre:"",desc:""}]);
  const[incluye,setIncluye]=useState([{id:uid(),em:"✅",txt:"Vuelos internacionales"},{id:uid(),em:"🏨",txt:"Alojamiento en hotel"},{id:uid(),em:"🗺️",txt:"Guía turístico"},{id:uid(),em:"🛡️",txt:"Seguro de viaje"}]);
  const[noIncluye,setNoIncluye]=useState([{id:uid(),em:"🍽️",txt:"Comidas y cenas"},{id:uid(),em:"💳",txt:"Gastos personales"}]);
  const[noIncluyeEnabled,setNoIncluyeEnabled]=useState(false);
  const[preciosEnabled,setPreciosEnabled]=useState(true);const[precios,setPrecios]=useState([{id:uid(),concepto:"Precio por persona",importe:""},{id:uid(),concepto:"Vuelos",importe:""}]);
  const[hasDesc,setHasDesc]=useState(false);const[descConc,setDescConc]=useState("Descuento especial");const[descImp,setDescImp]=useState("");
  const[notas,setNotas]=useState("Precio sujeto a disponibilidad. Válido 7 días desde la fecha de emisión.");
  const[ctaWa,setCtaWa]=useState(WA_NUM);const[gen,setGen]=useState(false);const[monMenu,setMonMenu]=useState(false);
  const preRef=useRef();const logoRef=useRef();const heroImgRef=useRef();const hotelImgRef=useRef();

  const sym=getCurrencySymbol(moneda);
  const fmtM=v=>{if(!v)return"—";const n=parseFloat((v||"").replace(",","."));return isNaN(n)?v:`${sym}${n.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}`};
  const paxN=Math.max(1,parseInt(pax)||1);
  const sub=precios.reduce((a,p)=>a+(parseFloat((p.importe||"").replace(",","."))||0),0);
  const desc=hasDesc?(parseFloat((descImp||"").replace(",","."))||0):0;
  const total=(sub-desc)*paxN;

  const addVuelo=()=>setVuelos(v=>[...v,{id:uid(),origen:"",destino:"",fecha:"",horaSalida:"",horaLlegada:"",equipaje:"",clase:"Turista"}]);
  const removeVuelo=id=>setVuelos(v=>v.filter(x=>x.id!==id));const updVuelo=(id,f,v)=>setVuelos(vs=>vs.map(x=>x.id===id?{...x,[f]:v}:x));
  const addAct=()=>setActividades(a=>[...a,{id:uid(),em:"🎯",nombre:"",desc:""}]);const removeAct=id=>setActividades(a=>a.filter(x=>x.id!==id));const updAct=(id,f,v)=>setActividades(as=>as.map(x=>x.id===id?{...x,[f]:v}:x));
  const addInc=()=>setIncluye(i=>[...i,{id:uid(),em:"✅",txt:""}]);const removeInc=id=>setIncluye(i=>i.filter(x=>x.id!==id));const updInc=(id,f,v)=>setIncluye(is=>is.map(x=>x.id===id?{...x,[f]:v}:x));
  const addNoInc=()=>setNoIncluye(i=>[...i,{id:uid(),em:"❌",txt:""}]);const removeNoInc=id=>setNoIncluye(i=>i.filter(x=>x.id!==id));const updNoInc=(id,f,v)=>setNoIncluye(is=>is.map(x=>x.id===id?{...x,[f]:v}:x));
  const addPrecio=()=>setPrecios(p=>[...p,{id:uid(),concepto:"",importe:""}]);const removePrecio=id=>setPrecios(p=>p.filter(x=>x.id!==id));const updPrecio=(id,f,v)=>setPrecios(ps=>ps.map(x=>x.id===id?{...x,[f]:v}:x));

  const downloadPDF=async()=>{setGen(true);try{if(!window.html2canvas)await new Promise(res=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";s.onload=res;document.head.appendChild(s);});const JsPDF=await loadJsPDF();const el=preRef.current;const canvas=await window.html2canvas(el,{scale:3,useCORS:true,backgroundColor:"#07070f",allowTaint:true});const img=canvas.toDataURL("image/jpeg",0.92);const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();const r=Math.min(pw/canvas.width,ph/canvas.height);pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);pdf.save(`presupuesto-${destino||"travelike"}.pdf`);}catch(e){alert("Error: "+e.message);}setGen(false);};
  const shareWA=async()=>{setGen(true);try{if(!window.html2canvas)await new Promise(res=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";s.onload=res;document.head.appendChild(s);});const JsPDF=await loadJsPDF();const el=preRef.current;const canvas=await window.html2canvas(el,{scale:3,useCORS:true,backgroundColor:"#07070f",allowTaint:true});const img=canvas.toDataURL("image/jpeg",0.92);const pdf=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();const r=Math.min(pw/canvas.width,ph/canvas.height);pdf.addImage(img,"JPEG",(pw-canvas.width*r)/2,0,canvas.width*r,canvas.height*r);const blob=pdf.output("blob");const fn=`presupuesto-${destino||"travelike"}.pdf`;const file=new File([blob],fn,{type:"application/pdf"});if(navigator.canShare?.({files:[file]})){await navigator.share({title:"Presupuesto Travelike",files:[file]});}else{const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=fn;a.click();URL.revokeObjectURL(url);setTimeout(()=>window.open(`https://wa.me/${ctaWa.replace(/\D/g,"")}?text=${encodeURIComponent(`Hola, te adjunto el presupuesto${destino?" de viaje a "+destino:""} 🌍`)}`,"_blank"),800);}}catch(e){alert("Error: "+e.message);}setGen(false);};

  const TABS_P=[["general","🌍 General"],["vuelos","✈️ Vuelos"],["hotel","🏨 Hotel"],["actividades","🎯 Actividades"],["incluye","✅ Incluye"],["precios","💰 Precios"],["diseno","🎨 Diseño"]];
  const secStyle={fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${A.border}`};
  const lbl={fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5};
  const PALETA=[{c:"#00f0ff",l:"Cyan"},{c:"#ffc847",l:"Gold"},{c:"#e8002a",l:"Rojo"},{c:"#34C759",l:"Verde"},{c:"#BF5AF2",l:"Morado"},{c:"#FF9500",l:"Naranja"},{c:"#1AB5B0",l:"Teal"},{c:"#4FC3F7",l:"Azul"}];
  const TEXT_COLORS=[{c:"#ffffff",l:"Blanco"},{c:"#f0ede8",l:"Crema"},{c:"#e6e6e6",l:"Gris claro"},{c:"#FFD700",l:"Dorado"},{c:accentColor,l:"Acento"},{c:"#00F0FF",l:"Cyan"},{c:"#e8002a",l:"Rojo"}];

  const QuoteCard=({forPDF=false})=>{
    const cardStyle=forPDF?{width:390,background:"#07070f",borderRadius:20,overflow:"hidden",fontFamily:"'Barlow Condensed',sans-serif"}:{width:"100%",background:"#07070f",borderRadius:16,overflow:"hidden",fontFamily:BF,boxShadow:`0 0 40px ${accentColor}22`};
    return(
      <div style={cardStyle}>
        <div style={{position:"relative",minHeight:160,padding:"40px 16px 22px",display:"flex",flexDirection:"column",justifyContent:"flex-end",background:heroImg?undefined:"#07070f",backgroundImage:heroImg?`url(${heroImg})`:`linear-gradient(135deg,#07070f,#0f1824)`,backgroundSize:"cover",backgroundPosition:"center"}}>
          {heroImg&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(7,7,15,0.85) 0%,rgba(7,7,15,0.2) 100%)"}}/>}
          <div style={{position:"relative",zIndex:1}}>
            {logo?<img src={logo} alt="Logo" style={{height:26,maxWidth:110,objectFit:"contain",marginBottom:8,display:"block"}}/>:<div style={{fontSize:10,color:accentColor,letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontFamily:BF,fontWeight:700}}>{agente||"TRAVELIKE"}</div>}
            <div style={{fontFamily:ANTON,fontSize:28,color:textColor,lineHeight:1,marginBottom:6,textTransform:"uppercase"}}>{heroTitulo||destino||"DESTINO"}</div>
            {heroSub&&<div style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{heroSub}</div>}
            <div style={{display:"inline-block",marginTop:10,background:`${accentColor}22`,border:`1px solid ${accentColor}55`,borderRadius:6,padding:"3px 10px",fontSize:11,color:accentColor,fontFamily:BF,fontWeight:700}}>{paxN} pax · {moneda}</div>
          </div>
        </div>
        {vuelos.filter(v=>v.origen||v.destino).length>0&&(<div style={{padding:"14px 16px",borderBottom:`1px solid ${accentColor}15`}}><div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>✈️ VUELOS</div>{vuelos.filter(v=>v.origen||v.destino).map(v=>(<div key={v.id} style={{background:`${accentColor}08`,border:`1px solid ${accentColor}20`,borderRadius:8,padding:"9px 11px",marginBottom:6}}><div style={{fontFamily:ANTON,fontSize:14,color:textColor,letterSpacing:0.5}}>{v.origen}{v.origen&&v.destino?" → ":""}{v.destino}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2}}>{[v.fecha,v.horaSalida&&`🛫 ${v.horaSalida}`,v.horaLlegada&&`🛬 ${v.horaLlegada}`,v.clase].filter(Boolean).join(" · ")}</div>{v.equipaje&&<div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:2}}>🧳 {v.equipaje}</div>}</div>))}</div>)}
        {hotelEnabled&&hotelNombre&&(<div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}><div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>🏨 ALOJAMIENTO</div><div style={{background:"#0f1824",borderRadius:8,padding:"10px 12px",display:"flex",gap:10,alignItems:"flex-start"}}>{hotelImg&&<div style={{width:52,height:52,borderRadius:6,background:`url(${hotelImg}) center/cover`,flexShrink:0}}/>}<div style={{flex:1}}><div style={{fontFamily:ANTON,fontSize:15,color:textColor,letterSpacing:0.5}}>{hotelNombre}</div><div style={{fontSize:10,color:accentColor,marginTop:2}}>{"★".repeat(hotelStars)+"☆".repeat(Math.max(0,5-hotelStars))}</div>{hotelLugar&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2}}>📍 {hotelLugar}</div>}</div></div></div>)}
        {actEnabled&&actividades.filter(a=>a.nombre).length>0&&(<div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}><div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>🎯 ACTIVIDADES</div>{actividades.filter(a=>a.nombre).map(a=>(<div key={a.id} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`}}><span style={{fontSize:16}}>{a.em}</span><div><div style={{fontSize:12,color:textColor,fontFamily:BF,fontWeight:700}}>{a.nombre}</div>{a.desc&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{a.desc}</div>}</div></div>))}</div>)}
        {(incluye.filter(i=>i.txt).length>0||(noIncluyeEnabled&&noIncluye.filter(i=>i.txt).length>0))&&(<div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`,display:"grid",gridTemplateColumns:noIncluyeEnabled&&noIncluye.filter(i=>i.txt).length>0?"1fr 1fr":"1fr",gap:12}}>{incluye.filter(i=>i.txt).length>0&&<div><div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>✅ QUÉ INCLUYE</div><div style={{display:"flex",flexDirection:"column",gap:4}}>{incluye.filter(i=>i.txt).map(i=>(<div key={i.id} style={{background:`${accentColor}08`,border:`1px solid ${accentColor}18`,borderRadius:6,padding:"4px 8px",display:"flex",gap:5,alignItems:"center"}}><span style={{fontSize:11}}>{i.em}</span><span style={{fontSize:10,color:"rgba(255,255,255,0.75)",lineHeight:1.3}}>{i.txt}</span></div>))}</div></div>}{noIncluyeEnabled&&noIncluye.filter(i=>i.txt).length>0&&<div><div style={{fontSize:8,color:"#ff6b6b",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:BF,fontWeight:700}}>❌ NO INCLUYE</div><div style={{display:"flex",flexDirection:"column",gap:4}}>{noIncluye.filter(i=>i.txt).map(i=>(<div key={i.id} style={{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.18)",borderRadius:6,padding:"4px 8px",display:"flex",gap:5,alignItems:"center"}}><span style={{fontSize:11}}>{i.em}</span><span style={{fontSize:10,color:"rgba(255,255,255,0.75)",lineHeight:1.3}}>{i.txt}</span></div>))}</div></div>}</div>)}
        {preciosEnabled&&(<div style={{padding:"14px 16px",background:"#0a0d16",borderBottom:`1px solid ${accentColor}15`}}><div style={{fontSize:8,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontFamily:BF,fontWeight:700}}>📋 PRESUPUESTO · {paxN} pax</div><div style={{fontFamily:ANTON,fontSize:30,color:accentColor,letterSpacing:1,marginBottom:4}}>{fmtM(total.toString())}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:10}}>Total {paxN} pasajero{paxN>1?"s":""} · IVA incluido</div>{precios.filter(p=>p.concepto||p.importe).map(p=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`}}><span style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>{p.concepto}</span><span style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:700}}>{fmtM(p.importe)}</span></div>))}{hasDesc&&<div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:11,color:"#4ade80"}}>{descConc}</span><span style={{fontSize:11,color:"#4ade80",fontWeight:700}}>− {fmtM(descImp)}</span></div>}</div>)}
        {notas&&(<div style={{padding:"12px 16px",borderBottom:`1px solid ${accentColor}15`}}><div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontFamily:BF,fontWeight:700}}>📄 CONDICIONES</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>{notas}</div></div>)}
        <div style={{padding:"16px",background:`${accentColor}15`,borderTop:`1px solid ${accentColor}30`}}><div style={{fontSize:13,color:textColor,fontFamily:ANTON,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>¿TE INTERESA ESTE VIAJE?</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:10}}>Consulta disponibilidad y reserva tu plaza</div><div style={{background:accentColor,color:"#07070f",borderRadius:8,padding:"10px",textAlign:"center",fontFamily:ANTON,fontSize:14,letterSpacing:2,textTransform:"uppercase"}}>CONTACTAR — {ctaWa||WA_NUM}</div></div>
        <div style={{padding:"10px 16px",background:"#07070f",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid rgba(255,255,255,0.05)`}}>{logo?<img src={logo} alt="Logo" style={{height:22,maxWidth:90,objectFit:"contain"}}/>:<div style={{fontFamily:ANTON,fontSize:14,color:accentColor,letterSpacing:2}}>TRAVELIKE</div>}<div style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:BF}}>www.travelike.es</div></div>
      </div>
    );
  };

  return(
    <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF,paddingBottom:80}}>
      <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg,image/gif" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(f)setLogo(await fileToDataURL(f));e.target.value="";}}/>
      <input ref={heroImgRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(f)setHeroImg(await fileToDataURL(f));e.target.value="";}}/>
      <input ref={hotelImgRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(f)setHotelImg(await fileToDataURL(f));e.target.value="";}}/>
      <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button>
        <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Constructor de Presupuestos</div>
        {preciosEnabled&&total>0&&<div style={{fontFamily:ANTON,fontSize:14,color:accentColor,letterSpacing:0.5}}>{sym}{total.toLocaleString("es-ES",{maximumFractionDigits:0})}</div>}
      </div>
      <div style={{overflowX:"auto",borderBottom:`1px solid ${A.border}`,background:A.card,display:"flex",scrollbarWidth:"none"}}>
        {TABS_P.map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{flexShrink:0,background:"transparent",border:"none",borderBottom:`2px solid ${tab===k?accentColor:"transparent"}`,color:tab===k?accentColor:A.muted,padding:"10px 14px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:BF,letterSpacing:1,whiteSpace:"nowrap",textTransform:"uppercase"}}>{l}</button>))}
      </div>
      <div style={{padding:"14px 16px"}}>
        {tab==="general"&&(<div>
          <div style={secStyle}>DATOS GENERALES</div>
          <div style={{marginBottom:10}}><div style={lbl}>Destino</div><input value={destino} onChange={e=>setDestino(e.target.value)} placeholder="China, India, Vietnam..." style={ais}/></div>
          <div style={{marginBottom:10}}><div style={lbl}>Nombre del agente / agencia</div><input value={agente} onChange={e=>setAgente(e.target.value)} placeholder="TraveLike" style={ais}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginBottom:10}}><div><div style={lbl}>Nº de pasajeros</div><input value={pax} onChange={e=>setPax(e.target.value.replace(/\D/g,""))} inputMode="numeric" style={ais}/></div><div><div style={lbl}>Moneda</div><button onClick={()=>setMonMenu(true)} style={{...ais,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px"}}><span style={{fontFamily:ANTON,color:A.gold}}>{moneda}</span><span style={{color:A.muted}}>▾</span></button></div></div>
          <div style={{marginBottom:14}}><div style={lbl}>Número WhatsApp (CTA)</div><input value={ctaWa} onChange={e=>setCtaWa(e.target.value)} placeholder="34600000000" style={ais}/></div>
          <div style={secStyle}>LOGOTIPO</div>
          {logo?(<div style={{background:A.card2,borderRadius:10,padding:10,border:`2px solid ${accentColor}44`,marginBottom:14}}><img src={logo} alt="Logo" style={{maxHeight:60,maxWidth:"100%",objectFit:"contain",display:"block",margin:"0 auto"}}/><div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>logoRef.current.click()} style={{...ab(accentColor+"22",accentColor),flex:1,border:`1px solid ${accentColor}44`,padding:"8px",fontSize:12,borderRadius:8,fontFamily:BF}}>📷 Cambiar</button><button onClick={()=>setLogo(null)} style={{...ab(A.red+"22",A.red),flex:1,border:`1px solid ${A.red}44`,padding:"8px",fontSize:12,borderRadius:8,fontFamily:BF}}>🗑 Quitar</button></div></div>):(<button onClick={()=>logoRef.current.click()} style={{width:"100%",padding:"14px",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:10,color:A.muted,fontFamily:BF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}><span style={{fontSize:20}}>🏷️</span>Cargar logo (PNG, JPG, WebP...)</button>)}
          <div style={secStyle}>BANNER / HERO</div>
          <div style={{marginBottom:10}}><div style={lbl}>Título principal</div><input value={heroTitulo} onChange={e=>setHeroTitulo(e.target.value)} placeholder={destino||"VIAJE A CHINA"} style={ais}/></div>
          <div style={{marginBottom:14}}><div style={lbl}>Subtítulo</div><input value={heroSub} onChange={e=>setHeroSub(e.target.value)} placeholder="14 días · Mayo 2026 · Todo incluido" style={ais}/></div>
          <div style={{marginBottom:14}}>
            <div style={lbl}>Imagen de fondo</div>
            {heroImg?(<div style={{borderRadius:10,overflow:"hidden",border:`2px solid ${accentColor}44`,position:"relative"}}><img src={heroImg} alt="" style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",top:6,right:6,display:"flex",gap:6}}><button onClick={()=>heroImgRef.current.click()} style={{background:"rgba(0,0,0,0.7)",border:"none",borderRadius:6,padding:"4px 9px",color:"#fff",fontFamily:BF,fontSize:11,cursor:"pointer"}}>✏️</button><button onClick={()=>setHeroImg(null)} style={{background:"rgba(255,0,0,0.7)",border:"none",borderRadius:6,padding:"4px 9px",color:"#fff",fontFamily:BF,fontSize:11,cursor:"pointer"}}>✕</button></div></div>):(<button onClick={()=>heroImgRef.current.click()} style={{width:"100%",padding:"14px",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:10,color:A.muted,fontFamily:BF,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{fontSize:18}}>🌅</span>Cargar imagen de fondo (JPG, PNG, WebP)</button>)}
          </div>
        </div>)}
        {tab==="vuelos"&&(<div>
          <div style={secStyle}>VUELOS</div>
          {vuelos.map((v,i)=>(<div key={v.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:12,padding:12,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,fontWeight:700,textTransform:"uppercase"}}>VUELO {i+1}</div>{vuelos.length>1&&<button onClick={()=>removeVuelo(v.id)} style={{background:"none",border:"none",color:A.red,fontSize:16,cursor:"pointer"}}>× Quitar</button>}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}><div><div style={lbl}>🛫 Ciudad origen</div><input value={v.origen} onChange={e=>updVuelo(v.id,"origen",e.target.value)} placeholder="Madrid (MAD)" style={ais}/></div><div><div style={lbl}>🛬 Ciudad destino</div><input value={v.destino} onChange={e=>updVuelo(v.id,"destino",e.target.value)} placeholder="Tokio (NRT)" style={ais}/></div></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}><div><div style={lbl}>📅 Fecha</div><input value={v.fecha} onChange={e=>updVuelo(v.id,"fecha",e.target.value)} placeholder="20-05-2026" style={ais}/></div><div><div style={lbl}>🛫 H.Salida</div><input value={v.horaSalida} onChange={e=>updVuelo(v.id,"horaSalida",e.target.value)} placeholder="09:30" style={ais}/></div><div><div style={lbl}>🛬 H.Llegada</div><input value={v.horaLlegada} onChange={e=>updVuelo(v.id,"horaLlegada",e.target.value)} placeholder="06:05+1" style={ais}/></div></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><div style={lbl}>🧳 Equipaje incluido</div><input value={v.equipaje} onChange={e=>updVuelo(v.id,"equipaje",e.target.value)} placeholder="1 cabina 10kg + 23kg" style={ais}/></div><div><div style={lbl}>💺 Clase</div><select value={v.clase} onChange={e=>updVuelo(v.id,"clase",e.target.value)} style={ais}>{["Turista","Turista Premium","Business","Primera"].map(c=><option key={c} value={c}>{c}</option>)}</select></div></div>
          </div>))}
          <button onClick={addVuelo} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Añadir vuelo</button>
        </div>)}
        {tab==="hotel"&&(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{...secStyle,flex:1,marginBottom:0}}>HOTEL / ALOJAMIENTO</div><input type="checkbox" checked={hotelEnabled} onChange={e=>setHotelEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/></div>
          {hotelEnabled&&(<><div style={{marginBottom:10}}><div style={lbl}>Nombre del hotel</div><input value={hotelNombre} onChange={e=>setHotelNombre(e.target.value)} placeholder="Hotel Gran Via" style={ais}/></div><div style={{marginBottom:10}}><div style={lbl}>Ubicación</div><input value={hotelLugar} onChange={e=>setHotelLugar(e.target.value)} placeholder="Pekín, China" style={ais}/></div><div style={{marginBottom:10}}><div style={lbl}>Estrellas</div><div style={{display:"flex",gap:6,marginTop:4}}>{[1,2,3,4,5].map(n=>(<button key={n} onClick={()=>setHotelStars(n)} style={{fontSize:24,background:"none",border:"none",cursor:"pointer",opacity:n<=hotelStars?1:0.25}}>★</button>))}</div></div>
          <div style={{marginBottom:14}}>
            <div style={lbl}>Imagen del hotel</div>
            {hotelImg?(<div style={{borderRadius:10,overflow:"hidden",border:`2px solid ${accentColor}44`,position:"relative"}}><img src={hotelImg} alt="" style={{width:"100%",height:100,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",top:5,right:5,display:"flex",gap:5}}><button onClick={()=>hotelImgRef.current.click()} style={{background:"rgba(0,0,0,0.7)",border:"none",borderRadius:5,padding:"3px 8px",color:"#fff",fontFamily:BF,fontSize:10,cursor:"pointer"}}>✏️</button><button onClick={()=>setHotelImg(null)} style={{background:"rgba(255,0,0,0.7)",border:"none",borderRadius:5,padding:"3px 8px",color:"#fff",fontFamily:BF,fontSize:10,cursor:"pointer"}}>✕</button></div></div>):(<button onClick={()=>hotelImgRef.current.click()} style={{width:"100%",padding:"12px",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:10,color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{fontSize:16}}>🏨</span>Cargar foto del hotel (JPG, PNG...)</button>)}
          </div></>)}
        </div>)}
        {tab==="actividades"&&(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{...secStyle,flex:1,marginBottom:0}}>ACTIVIDADES</div><input type="checkbox" checked={actEnabled} onChange={e=>setActEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/></div>
          {actEnabled&&(<>{actividades.map((a,i)=>(<div key={a.id} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:11,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,fontWeight:700,textTransform:"uppercase"}}>ACTIVIDAD {i+1}</div><button onClick={()=>removeAct(a.id)} style={{background:"none",border:"none",color:A.red,fontSize:16,cursor:"pointer"}}>×</button></div><div style={{display:"grid",gridTemplateColumns:"50px 1fr",gap:8,marginBottom:7}}><div><div style={lbl}>Emoji</div><input value={a.em} onChange={e=>updAct(a.id,"em",e.target.value)} style={{...ais,textAlign:"center",fontSize:20}}/></div><div><div style={lbl}>Nombre</div><input value={a.nombre} onChange={e=>updAct(a.id,"nombre",e.target.value)} placeholder="Visita a la Gran Muralla" style={ais}/></div></div><div><div style={lbl}>Descripción</div><input value={a.desc} onChange={e=>updAct(a.id,"desc",e.target.value)} placeholder="Incluido en el precio" style={ais}/></div></div>))}<button onClick={addAct} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Añadir actividad</button></>)}
        </div>)}
        {tab==="incluye"&&(<div>
          <div style={{fontFamily:BF,fontSize:10,color:A.green,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>✅ QUÉ INCLUYE</div>
          {incluye.map(it=>(<div key={it.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input value={it.em} onChange={e=>updInc(it.id,"em",e.target.value)} style={{...ais,width:50,textAlign:"center",fontSize:18,flex:"none",padding:"10px 4px"}}/><input value={it.txt} onChange={e=>updInc(it.id,"txt",e.target.value)} placeholder="Elemento incluido" style={{...ais,flex:1}}/><button onClick={()=>removeInc(it.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer",flexShrink:0}}>×</button></div>))}
          <button onClick={addInc} style={{width:"100%",padding:"9px",border:`1.5px dashed ${A.green}`,borderRadius:10,background:"none",color:A.green,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:16}}>+ Añadir a "Incluye"</button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{fontFamily:BF,fontSize:10,color:A.red,letterSpacing:2,textTransform:"uppercase",fontWeight:700,flex:1}}>❌ QUÉ NO INCLUYE</div><label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="checkbox" checked={noIncluyeEnabled} onChange={e=>setNoIncluyeEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/><span style={{fontFamily:BF,fontSize:10,color:A.muted}}>Mostrar</span></label></div>
          {noIncluyeEnabled&&(<>{noIncluye.map(it=>(<div key={it.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input value={it.em} onChange={e=>updNoInc(it.id,"em",e.target.value)} style={{...ais,width:50,textAlign:"center",fontSize:18,flex:"none",padding:"10px 4px"}}/><input value={it.txt} onChange={e=>updNoInc(it.id,"txt",e.target.value)} placeholder="Elemento NO incluido" style={{...ais,flex:1}}/><button onClick={()=>removeNoInc(it.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer",flexShrink:0}}>×</button></div>))}<button onClick={addNoInc} style={{width:"100%",padding:"9px",border:`1.5px dashed ${A.red}`,borderRadius:10,background:"none",color:A.red,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:16}}>+ Añadir a "No incluye"</button></>)}
          <div style={{...secStyle,marginTop:16}}>CONDICIONES / NOTAS</div>
          <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={4} style={{...ais,resize:"vertical",lineHeight:1.5}}/>
        </div>)}
        {tab==="precios"&&(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{...secStyle,flex:1,marginBottom:0}}>DESGLOSE DE PRECIOS</div><input type="checkbox" checked={preciosEnabled} onChange={e=>setPreciosEnabled(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/></div>
          {preciosEnabled&&(<>{precios.map(p=>(<div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 120px 28px",gap:8,marginBottom:8,alignItems:"center"}}><input value={p.concepto} onChange={e=>updPrecio(p.id,"concepto",e.target.value)} placeholder="Concepto" style={ais}/><input value={p.importe} onChange={e=>updPrecio(p.id,"importe",e.target.value)} placeholder="0" inputMode="decimal" style={ais}/><button onClick={()=>removePrecio(p.id)} style={{background:"none",border:"none",color:A.red,fontSize:18,cursor:"pointer"}}>×</button></div>))}<button onClick={addPrecio} style={{width:"100%",padding:"10px",border:`1.5px dashed ${A.border}`,borderRadius:10,background:"none",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",marginBottom:12}}>+ Añadir concepto</button><div style={{background:A.card2,borderRadius:10,padding:12,marginBottom:12,border:`1px solid ${A.border}`}}><label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:hasDesc?12:0}}><input type="checkbox" checked={hasDesc} onChange={e=>setHasDesc(e.target.checked)} style={{width:"auto",accentColor:accentColor}}/><span style={{fontFamily:BF,fontSize:12,color:A.muted,textTransform:"uppercase",letterSpacing:1}}>Aplicar descuento</span></label>{hasDesc&&<div style={{display:"grid",gridTemplateColumns:"1fr 120px",gap:8}}><input value={descConc} onChange={e=>setDescConc(e.target.value)} placeholder="Concepto descuento" style={ais}/><input value={descImp} onChange={e=>setDescImp(e.target.value)} placeholder="Importe" inputMode="decimal" style={ais}/></div>}</div><div style={{background:`${accentColor}12`,border:`1px solid ${accentColor}30`,borderRadius:10,padding:"12px 14px"}}><div style={{fontFamily:BF,fontSize:9,color:accentColor,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>TOTAL ESTIMADO</div><div style={{fontFamily:ANTON,fontSize:28,color:accentColor,letterSpacing:1}}>{sym}{total.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div style={{fontFamily:BF,fontSize:11,color:A.muted,marginTop:2}}>{paxN} pasajero{paxN>1?"s":""} · IVA incluido</div></div></>)}
        </div>)}
        {tab==="diseno"&&(<div>
          <div style={secStyle}>COLOR ACENTO</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>{PALETA.map(({c,l})=>(<button key={c} onClick={()=>setAccentColor(c)} title={l} style={{width:36,height:36,borderRadius:"50%",background:c,border:accentColor===c?"3px solid #fff":"3px solid transparent",cursor:"pointer",transform:accentColor===c?"scale(1.2)":"scale(1)"}}/>))}</div>
          <div style={{marginBottom:16}}><div style={lbl}>Color personalizado</div><div style={{display:"flex",gap:8,alignItems:"center"}}><input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} style={{width:44,height:44,borderRadius:8,border:`1px solid ${A.border}`,background:"transparent",cursor:"pointer",padding:2}}/><input value={accentColor} onChange={e=>setAccentColor(e.target.value)} style={{...ais,fontFamily:"monospace",flex:1}}/></div></div>
          <div style={secStyle}>COLOR DE LETRA</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>{TEXT_COLORS.map(({c,l})=>(<button key={c} onClick={()=>setTextColor(c)} title={l} style={{width:34,height:34,borderRadius:8,background:c,border:textColor===c?`3px solid ${accentColor}`:"2px solid #333",cursor:"pointer"}}/>))}</div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}><input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} style={{width:38,height:38,borderRadius:8,border:`1px solid ${A.border}`,background:"transparent",cursor:"pointer",padding:2}}/><span style={{fontFamily:"monospace",fontSize:12,color:A.muted}}>{textColor}</span></div>
          <div style={secStyle}>VISTA PREVIA</div>
          <QuoteCard/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}><button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),border:`1px solid ${A.gold}44`,fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳ Generando...":"⬇️ Descargar PDF"}</button><button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),border:"1px solid #25D36644",fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳...":"💬 Enviar por WA"}</button></div>
        </div>)}
        {tab!=="diseno"&&(<div style={{marginTop:20}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",textAlign:"center",marginBottom:10}}>VISTA PREVIA EN TIEMPO REAL</div><QuoteCard/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}><button onClick={downloadPDF} disabled={gen} style={{...ab(A.gold+"22",A.gold),border:`1px solid ${A.gold}44`,fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳ Generando...":"⬇️ Descargar PDF"}</button><button onClick={shareWA} disabled={gen} style={{...ab("#25D36622","#25D366"),border:"1px solid #25D36644",fontFamily:BF,fontSize:13,fontWeight:700}}>{gen?"⏳...":"💬 Enviar por WA"}</button></div></div>)}
      </div>
      <div style={{position:"fixed",left:-9999,top:0,width:390,pointerEvents:"none",zIndex:-1}}><div ref={preRef}><QuoteCard forPDF={true}/></div></div>
      {monMenu&&<CurrencyMenu current={moneda} onSelect={c=>{setMoneda(c);setMonMenu(false);}} onClose={()=>setMonMenu(false)}/>}
    </div>
  );
}
// ══════════════════════════════════════════════════════════
// RESERVAS PENDIENTES
// ══════════════════════════════════════════════════════════
const TIPO_RESERVA=[{k:"viaje",icon:"🌍",label:"Viaje completo"},{k:"hotel",icon:"🏨",label:"Hotel"},{k:"vuelos",icon:"✈️",label:"Vuelos"},{k:"actividades",icon:"🎟️",label:"Actividades"},{k:"traslado",icon:"🚕",label:"Traslado"},{k:"crucero",icon:"🚢",label:"Crucero"}];
const ESTADO_RESERVA=[{k:"nuevo",label:"Nuevo",color:"#FF9500"},{k:"en_proceso",label:"En proceso",color:"#00F0FF"},{k:"pendiente_pago",label:"Pend. pago",color:"#FFD700"},{k:"confirmado",label:"Confirmado",color:"#34C759"},{k:"cancelado",label:"Cancelado",color:"#FF3B30"}];

function ReservasPendientes({onBack,reservas,setReservas}){
  const[addModal,setAddModal]=useState(false);
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[newR,setNewR]=useState({nombre:"",destino:"",fecha:"",tipos:[],nota:"",presupuesto:"",estado:"nuevo"});
  const[expandedId,setExpandedId]=useState(null);

  const addReserva=()=>{if(!newR.nombre.trim()||!newR.destino.trim())return;const r={id:uid(),createdAt:new Date().toISOString(),...newR};setReservas([r,...reservas]);setNewR({nombre:"",destino:"",fecha:"",tipos:[],nota:"",presupuesto:"",estado:"nuevo"});setAddModal(false);};
  const updReserva=(id,fn)=>setReservas(reservas.map(r=>r.id===id?fn(r):r));
  const delReserva=id=>{if(!window.confirm("¿Eliminar esta reserva pendiente?"))return;setReservas(reservas.filter(r=>r.id!==id));};
  const toggleTipo=(tipo)=>setNewR(n=>({...n,tipos:n.tipos.includes(tipo)?n.tipos.filter(t=>t!==tipo):[...n.tipos,tipo]}));

  const filtered=reservas.filter(r=>{const matchF=filter==="all"||r.estado===filter;const matchS=!search.trim()||r.nombre.toLowerCase().includes(search.toLowerCase())||r.destino.toLowerCase().includes(search.toLowerCase());return matchF&&matchS;});

  const byEstado={};ESTADO_RESERVA.forEach(e=>{byEstado[e.k]=reservas.filter(r=>r.estado===e.k).length;});

  return(
    <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF}}>
      <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button>
        <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Reservas Pendientes</div>
        <div style={{background:A.orange+"22",border:`1px solid ${A.orange}44`,borderRadius:10,padding:"5px 10px",fontFamily:ANTON,fontSize:14,color:A.orange}}>{reservas.filter(r=>r.estado!=="confirmado"&&r.estado!=="cancelado").length}</div>
      </div>
      {/* Resumen rápido */}
      <div style={{display:"flex",gap:6,padding:"10px 16px",overflowX:"auto",borderBottom:`1px solid ${A.border}`}}>
        {ESTADO_RESERVA.map(e=>(<button key={e.k} onClick={()=>setFilter(filter===e.k?"all":e.k)} style={{flexShrink:0,background:filter===e.k?e.color+"22":A.card,border:`1px solid ${filter===e.k?e.color+"44":A.border}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:e.color}}/><span style={{fontFamily:BF,fontSize:11,color:filter===e.k?e.color:A.muted,fontWeight:700}}>{e.label}</span><span style={{fontFamily:ANTON,fontSize:13,color:filter===e.k?e.color:A.muted}}>{byEstado[e.k]||0}</span></button>))}
      </div>
      <div style={{padding:"12px 16px"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o destino..."/>
        <button onClick={()=>setAddModal(true)} style={{...ab(A.orange+"22",A.orange),width:"100%",border:`1.5px dashed ${A.orange}`,borderRadius:10,marginBottom:12,fontFamily:BF,fontSize:14}}>+ Nueva reserva pendiente</button>
        {filtered.length===0&&<AEmpty text="Sin reservas pendientes"/>}
        {filtered.map(r=>{
          const est=ESTADO_RESERVA.find(e=>e.k===r.estado)||ESTADO_RESERVA[0];
          const isExpanded=expandedId===r.id;
          return(
            <div key={r.id} style={{background:A.card,borderRadius:14,marginBottom:10,border:`2px solid ${est.color}44`,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:ANTON,fontSize:16,color:A.text,marginBottom:3}}>{r.nombre}</div>
                  <div style={{fontFamily:BF,fontSize:13,color:A.cyan,marginBottom:4}}>📍 {r.destino}{r.fecha&&` · ${r.fecha}`}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:r.tipos.length?6:0}}>
                    {r.tipos.map(t=>{const ti=TIPO_RESERVA.find(x=>x.k===t);return ti?(<span key={t} style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:A.purple+"22",color:A.purple,border:`1px solid ${A.purple}33`,fontFamily:BF}}>{ti.icon} {ti.label}</span>):null;})}
                  </div>
                  {r.presupuesto&&<div style={{fontFamily:ANTON,fontSize:15,color:A.gold}}>💶 {r.presupuesto} €</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  <div style={{background:est.color+"22",border:`1px solid ${est.color}44`,borderRadius:20,padding:"4px 10px",fontFamily:BF,fontSize:11,color:est.color,fontWeight:700}}>{est.label}</div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setExpandedId(isExpanded?null:r.id)} style={{background:isExpanded?A.cyan+"22":A.card2,border:`1px solid ${isExpanded?A.cyan+"44":A.border}`,borderRadius:8,padding:"5px 8px",color:isExpanded?A.cyan:A.muted,fontFamily:BF,fontSize:11,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>delReserva(r.id)} style={{background:A.red+"15",border:`1px solid ${A.red}33`,borderRadius:8,padding:"5px 8px",color:A.red,fontFamily:BF,fontSize:11,cursor:"pointer"}}>✕</button>
                  </div>
                </div>
              </div>
              {isExpanded&&(
                <div style={{borderTop:`1px solid ${A.border}`,padding:"12px 14px",background:A.card2}}>
                  <div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>ESTADO</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                    {ESTADO_RESERVA.map(e=>(<button key={e.k} onClick={()=>updReserva(r.id,x=>({...x,estado:e.k}))} style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontFamily:BF,fontSize:11,border:`2px solid ${r.estado===e.k?e.color:A.border}`,background:r.estado===e.k?e.color+"22":"transparent",color:r.estado===e.k?e.color:A.muted,fontWeight:700}}>{e.label}</button>))}
                  </div>
                  <div style={{marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Tipo de reserva</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TIPO_RESERVA.map(t=>(<button key={t.k} onClick={()=>updReserva(r.id,x=>({...x,tipos:x.tipos.includes(t.k)?x.tipos.filter(tt=>tt!==t.k):[...x.tipos,t.k]}))} style={{padding:"6px 10px",borderRadius:8,cursor:"pointer",fontFamily:BF,fontSize:11,border:`1.5px solid ${r.tipos.includes(t.k)?A.purple:A.border}`,background:r.tipos.includes(t.k)?A.purple+"22":"transparent",color:r.tipos.includes(t.k)?A.purple:A.muted}}>{t.icon} {t.label}</button>))}</div></div>
                  <div style={{marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Presupuesto (€)</div><input defaultValue={r.presupuesto||""} onBlur={e=>updReserva(r.id,x=>({...x,presupuesto:e.target.value}))} placeholder="Importe estimado" style={{...ais,fontFamily:ANTON,fontSize:18,color:A.gold}}/></div>
                  <div style={{marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Nota interna</div><textarea defaultValue={r.nota||""} onBlur={e=>updReserva(r.id,x=>({...x,nota:e.target.value}))} placeholder="Detalles, peticiones especiales..." rows={3} style={{...ais,resize:"vertical",lineHeight:1.5}}/></div>
                  <div style={{fontFamily:BF,fontSize:10,color:A.muted,marginTop:4}}>Entrada: {new Date(r.createdAt).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {addModal&&(
        <AModal title="Nueva Reserva Pendiente" onClose={()=>setAddModal(false)}>
          <div style={{marginBottom:10}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Nombre del cliente *</div><input value={newR.nombre} onChange={e=>setNewR(n=>({...n,nombre:e.target.value}))} placeholder="Nombre completo" style={ais}/></div>
          <div style={{marginBottom:10}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Destino / Programa *</div><input value={newR.destino} onChange={e=>setNewR(n=>({...n,destino:e.target.value}))} placeholder="Ej: Japón 2026, Ruta de los Emiratos..." style={ais}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Fecha aprox.</div><input value={newR.fecha} onChange={e=>setNewR(n=>({...n,fecha:e.target.value}))} placeholder="Ej: Junio 2026" style={ais}/></div>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Presupuesto (€)</div><input value={newR.presupuesto} onChange={e=>setNewR(n=>({...n,presupuesto:e.target.value}))} placeholder="Opcional" style={{...ais,fontFamily:ANTON,color:A.gold}}/></div>
          </div>
          <div style={{marginBottom:12}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>¿Qué solicitan?</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{TIPO_RESERVA.map(t=>(<button key={t.k} onClick={()=>toggleTipo(t.k)} style={{padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:BF,fontSize:12,border:`2px solid ${newR.tipos.includes(t.k)?A.purple:A.border}`,background:newR.tipos.includes(t.k)?A.purple+"22":"transparent",color:newR.tipos.includes(t.k)?A.purple:A.text,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{t.icon}</span><span style={{fontWeight:700}}>{t.label}</span></button>))}</div></div>
          <div style={{marginBottom:14}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Nota inicial</div><textarea value={newR.nota} onChange={e=>setNewR(n=>({...n,nota:e.target.value}))} placeholder="Peticiones especiales, fechas, presupuesto..." rows={3} style={{...ais,resize:"vertical",lineHeight:1.5}}/></div>
          <ARow><button onClick={()=>setAddModal(false)} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button><button onClick={addReserva} disabled={!newR.nombre.trim()||!newR.destino.trim()} style={{...ab(A.orange,A.bg),flex:2,opacity:(!newR.nombre.trim()||!newR.destino.trim())?0.5:1}}>Registrar</button></ARow>
        </AModal>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GASTOS GENERALES (empresa)
// ══════════════════════════════════════════════════════════
function GastosGenerales({onBack,gastosGen,setGastosGen}){
  const gastos=gastosGen.gastos||[];
  const facturas=gastosGen.facturas||[];
  const[showForm,setShowForm]=useState(false);
  const[tipoMenu,setTipoMenu]=useState(false);
  const[gTipo,setGTipo]=useState("otros");const[gDesc,setGDesc]=useState("");const[gImporte,setGImporte]=useState("");
  const[gCurrency,setGCurrency]=useState("EUR");const[gFecha,setGFecha]=useState(new Date().toISOString().split("T")[0]);
  const[gNota,setGNota]=useState("");const[gImporteEUR,setGImporteEUR]=useState("");const[converting,setConverting]=useState(false);
  const[currMenu,setCurrMenu]=useState(false);const[showStats,setShowStats]=useState(false);
  const[expandedGasto,setExpandedGasto]=useState(null);const[downloadingZip,setDownloadingZip]=useState(false);
  const gastoFacturaRef=useRef();const facturaRef=useRef();

  const upd=fn=>setGastosGen(prev=>({...prev,...fn(prev)}));

  useEffect(()=>{if(!gImporte||!+gImporte){setGImporteEUR("");return;}if(gCurrency==="EUR"){setGImporteEUR(gImporte);return;}setConverting(true);const t=setTimeout(async()=>{const eur=await convertToEUR(+gImporte,gCurrency);setGImporteEUR(String(eur));setConverting(false);},600);return()=>clearTimeout(t);},[gImporte,gCurrency]);

  const totalGastos=gastos.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
  const tipoInfo=k=>GASTO_TIPOS.find(t=>t.k===k)||GASTO_TIPOS[0];
  const sym=getCurrencySymbol(gCurrency);

  const addGasto=()=>{if(!gImporte||+gImporte<=0)return;const importeEUR=gCurrency==="EUR"?+gImporte:+(gImporteEUR||gImporte);upd(p=>({gastos:[...(p.gastos||[]),{id:uid(),tipo:gTipo,descripcion:gDesc,importe:+gImporte,currency:gCurrency,importeEUR,fecha:gFecha,nota:gNota,facturas:[]}]}));setGTipo("otros");setGDesc("");setGImporte("");setGImporteEUR("");setGFecha(new Date().toISOString().split("T")[0]);setGNota("");setShowForm(false);};
  const delGasto=id=>upd(p=>({gastos:(p.gastos||[]).filter(g=>g.id!==id)}));
  const addFacturaGasto=async(e,gastoId)=>{const f=e.target.files[0];if(!f)return;const b64=await fileToB64(f);const gasto=gastos.find(g=>g.id===gastoId);const ext=f.type?.includes("pdf")?"pdf":f.type?.includes("png")?"png":"jpg";const importe=gasto?.importeEUR||gasto?.importe;const tipoLabel=(tipoInfo(gasto?.tipo||"otros").label||"factura").toLowerCase().replace(/\s/g,"_");const nombre=importe?`${importe}€_${tipoLabel}.${ext}`:f.name;upd(p=>({facturas:[...(p.facturas||[]),{id:uid(),nombre,tipo:f.type,data:b64,fecha:new Date().toISOString().split("T")[0],gastoId}]}));e.target.value="";};
  const delFactura=id=>upd(p=>({facturas:(p.facturas||[]).filter(fa=>fa.id!==id)}));

  const downloadZipGastos=async()=>{const gastosConFact=gastos.filter(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.data));if(!gastosConFact.length){alert("Sin facturas para exportar");return;}setDownloadingZip(true);try{if(!window.JSZip){await new Promise(resolve=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";s.onload=resolve;document.head.appendChild(s);});}const zip=new window.JSZip();const root=zip.folder("Gastos_Generales_Travelike");gastosConFact.forEach(g=>{const ti=tipoInfo(g.tipo||"otros");const folderName=`${ti.label}_${g.descripcion||g.tipo||"gasto"}`.replace(/[/\\?%*:|"<>]/g,"").substring(0,40);const sub=root.folder(folderName);(facturas||[]).filter(f=>f.gastoId===g.id&&f.data).forEach(fa=>{try{const byteStr=atob(fa.data);const arr=new Uint8Array(byteStr.length);for(let i=0;i<byteStr.length;i++)arr[i]=byteStr.charCodeAt(i);const ext=fa.tipo?.includes("pdf")?"pdf":fa.tipo?.includes("png")?"png":"jpg";const nombre=fa.nombre.includes(".")?fa.nombre:`${fa.nombre}.${ext}`;sub.file(nombre,arr);}catch{}});});const blob=await zip.generateAsync({type:"blob"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`Gastos_Generales_Travelike_${new Date().toISOString().split("T")[0]}.zip`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);}catch(e){alert("Error al crear el ZIP");}setDownloadingZip(false);};

  const gastosByTipo={};gastos.forEach(g=>{if(!gastosByTipo[g.tipo])gastosByTipo[g.tipo]=[];gastosByTipo[g.tipo].push(g);});

  return(
    <div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF,paddingBottom:40}}>
      <div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button>
        <div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Gastos Generales</div>
        {totalGastos>0&&<div style={{fontFamily:ANTON,fontSize:14,color:A.red}}>{totalGastos.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</div>}
      </div>
      <div style={{padding:"12px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <div style={{background:A.red+"15",borderRadius:14,padding:"12px 8px",border:`1px solid ${A.red}33`,textAlign:"center"}}><div style={{fontFamily:BF,fontSize:8,color:A.red,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Total Gastos</div><div style={{fontFamily:ANTON,fontSize:20,color:A.red,lineHeight:1}}>{totalGastos.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</div></div>
          <div style={{background:A.purple+"15",borderRadius:14,padding:"12px 8px",border:`1px solid ${A.purple}33`,textAlign:"center"}}><div style={{fontFamily:BF,fontSize:8,color:A.purple,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Facturas</div><div style={{fontFamily:ANTON,fontSize:20,color:A.purple,lineHeight:1}}>{facturas.filter(f=>f.gastoId).length}</div></div>
        </div>
        {gastos.length>0&&<button onClick={()=>setShowStats(v=>!v)} style={{width:"100%",padding:"10px",background:showStats?A.purple+"22":A.card2,border:`1px solid ${showStats?A.purple+"44":A.border}`,borderRadius:12,fontFamily:BF,fontSize:13,color:showStats?A.purple:A.muted,cursor:"pointer",marginBottom:14}}>{showStats?"▲ Ocultar estadísticas":"📊 Ver estadísticas de gastos"}</button>}
        {showStats&&<ExpenseStats gastos={gastos}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,textTransform:"uppercase"}}>Registro de Gastos</div>
          <div style={{display:"flex",gap:6}}>
            {gastos.some(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.data))&&<button onClick={downloadZipGastos} disabled={downloadingZip} style={{...ab(A.purple+"22",A.purple),border:`1px solid ${A.purple}44`,padding:"7px 10px",fontSize:11,borderRadius:8,fontFamily:BF}}>{downloadingZip?"...":"📦 ZIP"}</button>}
            <button onClick={()=>setShowForm(v=>!v)} style={{...ab(showForm?A.card2:A.orange+"22",showForm?A.muted:A.orange),border:`1px solid ${showForm?A.border:A.orange+"44"}`,padding:"7px 14px",fontSize:12,borderRadius:8,fontFamily:BF}}>{showForm?"Cancelar":"+ Añadir"}</button>
          </div>
        </div>
        {showForm&&(
          <div style={{background:A.card2,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${A.orange}44`}}>
            <button onClick={()=>setTipoMenu(true)} style={{width:"100%",background:A.bg,border:`2px solid ${A.orange}55`,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:10,boxSizing:"border-box"}}><span style={{fontSize:22}}>{tipoInfo(gTipo).icon}</span><span style={{fontFamily:ANTON,fontSize:15,color:A.orange,letterSpacing:1,flex:1,textAlign:"left"}}>{tipoInfo(gTipo).label}</span><span style={{color:A.muted,fontSize:12,fontFamily:BF}}>Cambiar</span></button>
            <input value={gDesc} onChange={e=>setGDesc(e.target.value)} placeholder="Descripción del gasto" style={{...ais,marginBottom:8}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 90px",gap:8,marginBottom:8}}><input value={gImporte} onChange={e=>setGImporte(e.target.value.replace(/[^\d.]/g,""))} placeholder={`Importe ${sym}`} inputMode="decimal" style={ais}/><button onClick={()=>setCurrMenu(true)} style={{...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold,padding:"8px"}}>{gCurrency} <span style={{fontSize:10,color:A.muted}}>▾</span></button></div>
            {gCurrency!=="EUR"&&gImporte&&<div style={{background:A.bg,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${A.cyan}33`,fontSize:12,color:A.cyan,fontFamily:BF}}>{converting?"Convirtiendo...":gImporteEUR?`≈ ${gImporteEUR} €`:""}</div>}
            <input type="date" value={gFecha} onChange={e=>setGFecha(e.target.value)} style={{...ais,colorScheme:"dark",marginBottom:8}}/>
            <input value={gNota} onChange={e=>setGNota(e.target.value)} placeholder="Nota (opcional)" style={{...ais,marginBottom:12}}/>
            <button onClick={addGasto} disabled={!gImporte||+gImporte<=0} style={{width:"100%",padding:"13px",border:"none",borderRadius:10,fontFamily:ANTON,fontSize:15,letterSpacing:2,cursor:"pointer",background:gImporte&&+gImporte>0?A.orange:"#1a1a1a",color:"#fff",textTransform:"uppercase"}}>REGISTRAR GASTO</button>
          </div>
        )}
        {gastos.length===0?<AEmpty text="Sin gastos generales registrados"/>:Object.entries(gastosByTipo).map(([tipo,items])=>{
          const ti=tipoInfo(tipo);const subtotal=items.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
          return(<div key={tipo} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 2px",marginBottom:4}}><div style={{fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase"}}>{ti.icon} {ti.label}</div><div style={{fontFamily:ANTON,fontSize:13,color:A.red}}>{subtotal.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</div></div>
            {items.map(g=>{
              const gFacts=facturas.filter(f=>f.gastoId===g.id);const isExpanded=expandedGasto===g.id;
              return(<div key={g.id} style={{background:A.card,borderRadius:10,marginBottom:6,border:`1px solid ${A.border}33`}}>
                <div style={{padding:"10px 12px",display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{ti.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:ANTON,fontSize:15,color:A.orange,lineHeight:1}}>{(+g.importeEUR||+g.importe).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
                    <div style={{fontFamily:BF,fontSize:12,color:A.text,fontWeight:700,marginTop:2}}>{g.descripcion||ti.label}</div>
                    <div style={{fontSize:11,color:A.muted,fontFamily:BF}}>{g.fecha&&new Date(g.fecha+"T12:00:00").toLocaleDateString("es-ES")}{g.currency&&g.currency!=="EUR"&&<span style={{color:A.gold}}> · {(+g.importe).toLocaleString("es-ES")} {getCurrencySymbol(g.currency)}</span>}{gFacts.length>0&&<span style={{color:A.green}}> · 📄 {gFacts.length}</span>}</div>
                  </div>
                  <button onClick={()=>setExpandedGasto(isExpanded?null:g.id)} style={{background:isExpanded?A.gold+"22":A.card2,border:`1px solid ${isExpanded?A.gold+"44":A.border}`,color:isExpanded?A.gold:A.muted,borderRadius:8,padding:"4px 8px",fontSize:14,cursor:"pointer"}}>📎</button>
                  <button onClick={()=>delGasto(g.id)} style={{background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1}}>✕</button>
                </div>
                {isExpanded&&(
                  <div style={{borderTop:`1px solid ${A.border}33`,padding:"10px 12px",background:A.bg}}>
                    <div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Facturas adjuntas</div>
                    {gFacts.map(fa=>(<div key={fa.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:A.card,borderRadius:8,marginBottom:6,border:`1px solid ${A.gold}33`}}><span style={{fontSize:16}}>{fa.tipo?.includes("image")?"🖼️":"📄"}</span><div style={{flex:1,fontSize:12,fontFamily:BF,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{fa.nombre}</div><a href={`data:${fa.tipo};base64,${fa.data}`} download={fa.nombre} style={{...ab(A.gold+"22",A.gold),padding:"4px 8px",fontSize:10,borderRadius:6,border:`1px solid ${A.gold}33`,textDecoration:"none",fontFamily:BF}}>↓</a><button onClick={()=>delFactura(fa.id)} style={{background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",lineHeight:1}}>✕</button></div>))}
                    <input ref={gastoFacturaRef} type="file" accept="application/pdf,image/*" style={{display:"none"}} onChange={e=>addFacturaGasto(e,g.id)}/>
                    <button onClick={()=>{gastoFacturaRef.current.value="";gastoFacturaRef.current.click();}} style={{width:"100%",padding:"8px",background:A.gold+"15",border:`1.5px dashed ${A.gold}`,borderRadius:8,color:A.gold,fontFamily:BF,fontSize:12,cursor:"pointer"}}>+ Adjuntar factura a este gasto</button>
                  </div>
                )}
              </div>);
            })}
          </div>);
        })}
      </div>
      {tipoMenu&&<GastoTipoMenu current={gTipo} onSelect={t=>setGTipo(t)} onClose={()=>setTipoMenu(false)}/>}
      {currMenu&&<CurrencyMenu current={gCurrency} onSelect={c=>setGCurrency(c)} onClose={()=>setCurrMenu(false)}/>}
    </div>
  );
}
 0%,${PDARK} 45%)`,zIndex:5}}/><div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${ac},${PGOLD},${ac})`,zIndex:10}}/><div style={{position:"absolute",inset:0,zIndex:9,display:"flex",flexDirection:"column",padding:"28px 22px 36px",justifyContent:"space-between"}}><div style={{textAlign:"center"}}><div style={{display:"inline-block",padding:"4px 14px",borderRadius:20,background:`${ac}33`,border:`1px solid ${ac}66`,marginBottom:14}}><span style={{fontFamily:"Outfit",fontSize:9,letterSpacing:3,color:ac,textTransform:"uppercase",fontWeight:700}}>✦ {prog.cta.tagline}</span></div><h2 style={{fontFamily:"Anton",fontSize:30,color:tc,letterSpacing:1,lineHeight:1.1,marginBottom:8,textTransform:"uppercase"}}>{prog.cta.headline}</h2><div style={{fontFamily:"Outfit",fontSize:10,color:"#666",letterSpacing:2}}>{prog.cover.title.toUpperCase()}</div></div><div style={{textAlign:"center",padding:"18px 0",borderTop:`1px solid rgba(255,255,255,0.07)`,borderBottom:`1px solid rgba(255,255,255,0.07)`}}>{prog.cover.priceFrom&&<div style={{fontFamily:"Outfit",fontSize:10,letterSpacing:4,color:"#666",textTransform:"uppercase",marginBottom:4}}>DESDE</div>}<div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:4}}><span style={{fontFamily:"Outfit",fontSize:22,color:PGOLD,fontWeight:300,marginTop:10}}>€</span><span style={{fontFamily:"Anton",fontSize:60,color:PGOLD,lineHeight:1,letterSpacing:-1}}>{prog.cover.price}</span></div><div style={{fontFamily:"Outfit",fontSize:11,color:"#888",letterSpacing:1,marginTop:4}}>{prog.cover.priceNote}</div><div style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:12,padding:"8px 18px",borderRadius:22,background:"rgba(12,9,9,0.95)",border:"1px solid rgba(255,255,255,0.1)"}}><span style={{fontSize:14}}>🔒</span><span style={{fontFamily:"Outfit",fontSize:12,color:tc}}>Reserva con solo <strong style={{color:PGOLD}}>{prog.cta.deposit}</strong> {prog.cta.depositLabel}</span></div></div><div style={{display:"flex",flexDirection:"column",gap:7}}>{prog.cta.perks.map(p=>(<div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}><span style={{color:PGREEN,fontSize:13,flexShrink:0}}>✓</span><span style={{fontFamily:"Outfit",fontSize:12,color:tc,lineHeight:1.4}}>{p.text}</span></div>))}</div><div style={{textAlign:"center",padding:"9px 16px",background:`${ac}18`,borderRadius:12,border:`1px solid ${ac}40`}}><span style={{fontFamily:"Outfit",fontSize:11,color:ac}}>⏳ {prog.cta.deadline}</span></div><div style={{textAlign:"center"}}><div style={{display:"inline-block",padding:"16px 36px",borderRadius:30,background:`linear-gradient(135deg,${PGOLD},#b8891e)`}}><div style={{fontFamily:"Anton",fontSize:16,letterSpacing:3,color:PDARK}}>{prog.cta.ctaText}</div></div><div style={{marginTop:14,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><div style={{fontFamily:"Outfit",fontSize:10,color:"#666",letterSpacing:1}}>{prog.cta.contactLabel.toUpperCase()}</div><div style={{fontFamily:"Anton",fontSize:15,color:tc,letterSpacing:1}}>{prog.cta.contact}</div></div></div><div style={{textAlign:"center"}}><div style={{fontFamily:"Outfit",fontSize:9,letterSpacing:3,color:PGOLD,opacity:0.45}}>WWW.TRAVELIKE.COM</div></div></div><PageNum num={totalPages}/></div>);}

function ConstructorProgramas({onBack}){
  const[mode,setMode]=useState("editor");const[prog,setProg]=useState(PDEFAULT);const[open,setOpen]=useState("cover");
  const[generating,setGenerating]=useState(false);const[genStep,setGenStep]=useState("");const[page,setPage]=useState(0);
  const scrollRef=useRef(null);
  const setCover=(k,v)=>setProg(p=>({...p,cover:{...p.cover,[k]:v}}));
  const setCta=(k,v)=>setProg(p=>({...p,cta:{...p.cta,[k]:v}}));
  const setGlobalBg=(k,v)=>setProg(p=>({...p,globalBg:{...(p.globalBg||pmakeGlobalBg()),[k]:v}}));
  const setDay=(i,k,v)=>setProg(p=>({...p,days:p.days.map((d,di)=>di===i?{...d,[k]:v}:d)}));
  const setBlock=(di,bi,upd)=>setProg(p=>({...p,days:p.days.map((d,i)=>i!==di?d:{...d,blocks:d.blocks.map((b,j)=>j!==bi?b:{...b,...upd})})}));
  const addDay=()=>setProg(p=>{const num=p.days.length+1;return{...p,days:[...p.days,{id:puid(),num,title:`Día ${num}`,headerColor:"#9B1C1C",bg:pmakeBg("color","",1,PDARK,"#1a0a2e"),blocks:[{id:puid(),type:"text-badge",text:"Descripción del día...",badge:"📍",badgeRight:true}]}]};});
  const removeDay=i=>setProg(p=>({...p,days:p.days.filter((_,di)=>di!==i).map((d,di)=>({...d,num:di+1}))}));
  const moveDay=(i,dir)=>setProg(p=>{const days=[...p.days],to=i+dir;if(to<0||to>=days.length)return p;[days[i],days[to]]=[days[to],days[i]];return{...p,days:days.map((d,di)=>({...d,num:di+1}))};});
  const addBlock=(di,type)=>setProg(p=>({...p,days:p.days.map((d,i)=>i!==di?d:{...d,blocks:[...d.blocks,type==="text-badge"?{id:puid(),type:"text-badge",text:"Texto...",badge:"📍",badgeRight:true}:{id:puid(),type:"photo-text",photoUrl:"",text:"Descripción...",photoLeft:true}]})}));
  const removeBlock=(di,bi)=>setProg(p=>({...p,days:p.days.map((d,i)=>i!==di?d:{...d,blocks:d.blocks.filter((_,j)=>j!==bi)})}));
  const addItem=k=>setProg(p=>({...p,[k]:[...p[k],{id:puid(),text:""}]}));
  const editItem=(k,id,text)=>setProg(p=>({...p,[k]:p[k].map(x=>x.id===id?{...x,text}:x)}));
  const removeItem=(k,id)=>setProg(p=>({...p,[k]:p[k].filter(x=>x.id!==id)}));
  const setMapStops=stops=>setProg(p=>({...p,mapStops:stops}));
  const setMapEnabled=v=>setProg(p=>({...p,mapEnabled:v}));
  const addCtaPerk=()=>setProg(p=>({...p,cta:{...p.cta,perks:[...p.cta.perks,{id:puid(),text:""}]}}));
  const editCtaPerk=(id,text)=>setProg(p=>({...p,cta:{...p.cta,perks:p.cta.perks.map(x=>x.id===id?{...x,text}:x)}}));
  const removeCtaPerk=id=>setProg(p=>({...p,cta:{...p.cta,perks:p.cta.perks.filter(x=>x.id!==id)}}));
  useEffect(()=>{const el=scrollRef.current;if(!el||mode!=="preview")return;const fn=()=>setPage(Math.round(el.scrollTop/el.clientHeight));el.addEventListener("scroll",fn,{passive:true});return()=>el.removeEventListener("scroll",fn);},[mode]);
  const mapOffset=prog.mapEnabled?1:0;const totalPages=3+prog.days.length+mapOffset;
  const goTo=i=>scrollRef.current?.scrollTo({top:i*scrollRef.current.clientHeight,behavior:"smooth"});
  const gb=prog.globalBg||pmakeGlobalBg();
  const generatePDF=async()=>{setGenerating(true);try{setGenStep("Cargando herramientas...");await pLoadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");await pLoadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");await new Promise(r=>setTimeout(r,400));const{jsPDF}=window.jspdf;const PW=390,PH=844;const pdf=new jsPDF({orientation:"portrait",unit:"px",format:[PW,PH]});for(let i=0;i<totalPages;i++){setGenStep(`Página ${i+1} de ${totalPages}...`);const wrap=document.createElement("div");wrap.style.cssText=`position:fixed;left:-9999px;top:0;width:${PW}px;height:${PH}px;overflow:hidden;background:#06060f;font-family:Outfit,sans-serif;`;document.body.appendChild(wrap);const{createRoot}=await import("react-dom/client");const root=createRoot(wrap);root.render(<div style={{width:PW,height:PH,position:"relative",overflow:"hidden",fontFamily:"Outfit,sans-serif"}}><style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}`}</style><PTLPage prog={prog} pageIndex={i} totalPages={totalPages}/></div>);const isMap=prog.mapEnabled&&i===1;await new Promise(r=>setTimeout(r,isMap?3500:1400));const imgs=[...wrap.querySelectorAll("img")];if(imgs.length){await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r;setTimeout(r,4000);})));}await new Promise(r=>setTimeout(r,300));const canvas=await window.html2canvas(wrap,{width:PW,height:PH,scale:2,useCORS:true,allowTaint:true,logging:false,imageTimeout:12000,x:0,y:0,scrollX:0,scrollY:0,windowWidth:PW,windowHeight:PH});if(i>0)pdf.addPage();pdf.addImage(canvas.toDataURL("image/jpeg",0.93),"JPEG",0,0,PW,PH);root.unmount();document.body.removeChild(wrap);}setGenStep("Descargando...");const blob=pdf.output("blob");const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`Travelike_${prog.cover.title.replace(/\s+/g,"_")}.pdf`;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(url),2000);}catch(e){console.error(e);alert("Error: "+e.message);}setGenerating(false);setGenStep("");};

  return(
    <div style={{position:"relative",width:"100%",height:"100vh",background:PDARK,fontFamily:"Outfit,sans-serif",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}.ptls{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory}.ptlpw{height:100%;scroll-snap-align:start;position:relative;overflow:hidden}input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.1)}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${PGOLD};cursor:pointer}textarea{resize:vertical}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pbar{from{width:0}to{width:100%}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(212,168,67,0.25);border-radius:2px}`}</style>
      <div style={{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",background:"rgba(6,6,15,0.97)",borderBottom:"1px solid rgba(212,168,67,0.13)",zIndex:300}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:8,padding:"5px 10px",color:PGOLD,fontFamily:"Anton",fontSize:10,letterSpacing:1.5,cursor:"pointer"}}>← VOLVER</button>
          <div style={{width:3,height:20,borderRadius:2,background:`linear-gradient(to bottom,${PGOLD},#9B1C1C)`}}/>
          <span style={{fontFamily:"Anton",fontSize:13,letterSpacing:2.5,color:PGOLD}}>TRAVELIKE</span>
          <span style={{fontFamily:"Outfit",fontSize:10,letterSpacing:1.5,color:"#555",textTransform:"uppercase"}}>· Constructor de Programas</span>
        </div>
        <button onClick={()=>setMode(m=>m==="editor"?"preview":"editor")} style={{padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"Anton",fontSize:11,letterSpacing:1.5,background:mode==="preview"?PGOLD:"rgba(212,168,67,0.12)",color:mode==="preview"?PDARK:PGOLD}}>{mode==="editor"?"👁 VISTA PREVIA":"✏️ EDITAR"}</button>
      </div>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        {mode==="editor"&&(
          <div style={{height:"100%",overflowY:"auto",padding:"13px 13px 100px"}}>
            <PSectionCard title="PORTADA" open={open==="cover"} onToggle={()=>setOpen(o=>o==="cover"?null:"cover")} accent={prog.cover.accentColor}>
              <PField label="Título del programa" value={prog.cover.title} onChange={v=>setCover("title",v)} placeholder="CHINA 2026"/>
              <PField label="Subtítulo / Agencia" value={prog.cover.overtitle} onChange={v=>setCover("overtitle",v)}/>
              <PField label="Nombre del cliente" value={prog.cover.clientName} onChange={v=>setCover("clientName",v)}/>
              <div style={{padding:13,background:"rgba(212,168,67,0.05)",borderRadius:11,marginBottom:11,border:"1px solid rgba(212,168,67,0.18)"}}>
                <div style={{fontFamily:"Outfit",fontSize:10,color:PGOLD,letterSpacing:1.5,textTransform:"uppercase",marginBottom:11}}>💶 Precio</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}><div style={{flex:1}}><PField label="Precio (número)" value={prog.cover.price} onChange={v=>setCover("price",v)} placeholder="3.290"/></div><div style={{flexShrink:0,width:110}}><PLabel>Mostrar "DESDE"</PLabel><PToggle options={[["yes","Sí"],["no","No"]]} value={prog.cover.priceFrom?"yes":"no"} onChange={v=>setCover("priceFrom",v==="yes")}/></div></div>
                <PField label="Nota del precio" value={prog.cover.priceNote} onChange={v=>setCover("priceNote",v)}/>
              </div>
              <PLabel>Estadísticas</PLabel>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:11}}>
                {prog.cover.stats.map((s,i)=>(<div key={s.id} style={{display:"flex",gap:6}}><input value={s.value} onChange={e=>{const st=[...prog.cover.stats];st[i]={...s,value:e.target.value};setCover("stats",st);}} placeholder="15" style={{...pinp,width:70,textAlign:"center"}}/><input value={s.label} onChange={e=>{const st=[...prog.cover.stats];st[i]={...s,label:e.target.value};setCover("stats",st);}} placeholder="DÍAS" style={{...pinp,flex:1}}/>{prog.cover.stats.length>1&&<button onClick={()=>setCover("stats",prog.cover.stats.filter((_,si)=>si!==i))} style={{width:32,flexShrink:0,borderRadius:8,border:"none",background:"rgba(231,76,60,0.12)",color:PRED,cursor:"pointer",fontSize:12}}>✕</button>}</div>))}
                {prog.cover.stats.length<4&&<button onClick={()=>setCover("stats",[...prog.cover.stats,{id:puid(),value:"",label:""}])} style={{...paddBtn,width:"100%"}}>+ Añadir estadística</button>}
              </div>
              <PColorPicker label="Color de acento" value={prog.cover.accentColor} onChange={v=>setCover("accentColor",v)}/>
              <PBgEditor bg={prog.cover.bg} onChange={bg=>setCover("bg",bg)} label="Fondo de portada"/>
            </PSectionCard>
            <PSectionCard title="🎨 DISEÑO GLOBAL" open={open==="global"} onToggle={()=>setOpen(o=>o==="global"?null:"global")} accent="#a855f7">
              <PColorPicker label="Color de letra (todas las páginas)" value={prog.textColor||"#f0ede8"} onChange={v=>setProg(p=>({...p,textColor:v}))}/>
              <div style={{padding:13,background:"rgba(168,85,247,0.05)",borderRadius:11,marginBottom:11,border:"1px solid rgba(168,85,247,0.2)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13}}>
                  <div><div style={{fontFamily:"Outfit",fontSize:12,color:"#f0ede8",fontWeight:600}}>Foto de fondo global</div><div style={{fontFamily:"Outfit",fontSize:10,color:"#666",marginTop:2}}>Se superpone en todas las páginas</div></div>
                  <div onClick={()=>setGlobalBg("enabled",!gb.enabled)} style={{width:42,height:24,borderRadius:12,background:gb.enabled?"rgba(168,85,247,0.35)":"rgba(255,255,255,0.07)",border:`1.5px solid ${gb.enabled?"#a855f7":"rgba(255,255,255,0.12)"}`,position:"relative",cursor:"pointer",flexShrink:0}}><div style={{position:"absolute",top:3,left:gb.enabled?20:3,width:16,height:16,borderRadius:"50%",background:gb.enabled?"#a855f7":"#555",transition:"all .2s"}}/></div>
                </div>
                {gb.enabled&&(<><PPhotoSourcePicker url={gb.url} onChange={u=>setGlobalBg("url",u)}/><PSlider label="Opacidad" value={gb.opacity} onChange={o=>setGlobalBg("opacity",o)}/><PColorPicker label="Color base detrás" value={gb.baseColor} onChange={c=>setGlobalBg("baseColor",c)}/></>)}
              </div>
            </PSectionCard>
            <PSectionCard title="🗺 MAPA DE RUTA" open={open==="map"} onToggle={()=>setOpen(o=>o==="map"?null:"map")} accent={PBLUE}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:13,padding:"10px 13px",background:"rgba(56,189,248,0.07)",borderRadius:10,border:"1px solid rgba(56,189,248,0.18)"}}>
                <div><div style={{fontFamily:"Outfit",fontSize:12,color:"#f0ede8",fontWeight:600}}>Página de mapa</div><div style={{fontFamily:"Outfit",fontSize:10,color:"#666",marginTop:2}}>Zoom al país · coloreado con tu acento</div></div>
                <div onClick={()=>setMapEnabled(!prog.mapEnabled)} style={{width:42,height:24,borderRadius:12,background:prog.mapEnabled?"rgba(56,189,248,0.35)":"rgba(255,255,255,0.07)",border:`1.5px solid ${prog.mapEnabled?PBLUE:"rgba(255,255,255,0.12)"}`,position:"relative",cursor:"pointer",flexShrink:0}}><div style={{position:"absolute",top:3,left:prog.mapEnabled?20:3,width:16,height:16,borderRadius:"50%",background:prog.mapEnabled?PBLUE:"#555",transition:"all .2s"}}/></div>
              </div>
              {prog.mapEnabled&&<PMapStopEditor stops={prog.mapStops} onChange={setMapStops}/>}
            </PSectionCard>
            {prog.days.map((day,di)=>(
              <PSectionCard key={day.id} title={`DÍA ${day.num} · ${day.title.toUpperCase().substring(0,28)}${day.title.length>28?"…":""}`} open={open===day.id} onToggle={()=>setOpen(o=>o===day.id?null:day.id)} accent={day.headerColor}
                actions={<div style={{display:"flex",gap:4}}>{di>0&&<PActBtn onClick={()=>moveDay(di,-1)}>↑</PActBtn>}{di<prog.days.length-1&&<PActBtn onClick={()=>moveDay(di,1)}>↓</PActBtn>}<PActBtn onClick={()=>removeDay(di)} danger>✕</PActBtn></div>}>
                <PField label="Título del día" value={day.title} onChange={v=>setDay(di,"title",v)}/>
                <PColorPicker label="Color del encabezado" value={day.headerColor} onChange={v=>setDay(di,"headerColor",v)}/>
                <PBgEditor bg={day.bg} onChange={bg=>setDay(di,"bg",bg)} label="Fondo del día"/>
                <PLabel>Bloques de contenido</PLabel>
                {day.blocks.map((b,bi)=>(<PBlockCard key={b.id} block={b} onChange={upd=>setBlock(di,bi,upd)} onRemove={()=>removeBlock(di,bi)}/>))}
                <div style={{display:"flex",gap:6,marginTop:4}}><button onClick={()=>addBlock(di,"text-badge")} style={paddBtn}>+ Texto + Emoji</button><button onClick={()=>addBlock(di,"photo-text")} style={paddBtn}>+ Foto + Texto</button></div>
              </PSectionCard>
            ))}
            <button onClick={addDay} style={{width:"100%",padding:"11px",marginBottom:9,borderRadius:12,border:`1px dashed rgba(212,168,67,0.3)`,background:"rgba(212,168,67,0.04)",color:PGOLD,fontFamily:"Anton",fontSize:11,letterSpacing:2.5,cursor:"pointer"}}>+ AÑADIR DÍA</button>
            <PSectionCard title="INCLUYE / NO INCLUYE" open={open==="incl"} onToggle={()=>setOpen(o=>o==="incl"?null:"incl")} accent={PGREEN}>
              <div style={{fontFamily:"Outfit",fontSize:10,color:PGREEN,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>✓ Incluye</div>
              {prog.includes.map(it=><PListItemRow key={it.id} value={it.text} onChange={t=>editItem("includes",it.id,t)} onRemove={()=>removeItem("includes",it.id)}/>)}
              <button onClick={()=>addItem("includes")} style={{...paddBtn,width:"100%",marginBottom:18}}>+ Añadir elemento</button>
              <div style={{fontFamily:"Outfit",fontSize:10,color:PRED,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>✗ No incluye</div>
              {prog.excludes.map(it=><PListItemRow key={it.id} value={it.text} onChange={t=>editItem("excludes",it.id,t)} onRemove={()=>removeItem("excludes",it.id)}/>)}
              <button onClick={()=>addItem("excludes")} style={{...paddBtn,width:"100%"}}>+ Añadir elemento</button>
            </PSectionCard>
            <PSectionCard title="🎯 PÁGINA CTA" open={open==="cta"} onToggle={()=>setOpen(o=>o==="cta"?null:"cta")} accent={PGOLD}>
              <PField label="Tagline urgencia" value={prog.cta.tagline} onChange={v=>setCta("tagline",v)} placeholder="PLAZAS LIMITADAS"/>
              <PField label="Titular principal" value={prog.cta.headline} onChange={v=>setCta("headline",v)}/>
              <div style={{display:"flex",gap:8}}><div style={{flex:1}}><PField label="Importe señal" value={prog.cta.deposit} onChange={v=>setCta("deposit",v)}/></div><div style={{flex:2}}><PField label="Texto señal" value={prog.cta.depositLabel} onChange={v=>setCta("depositLabel",v)}/></div></div>
              <PField label="Texto de deadline" value={prog.cta.deadline} onChange={v=>setCta("deadline",v)}/>
              <PLabel>Ventajas adicionales</PLabel>
              {prog.cta.perks.map(p=><PListItemRow key={p.id} value={p.text} onChange={t=>editCtaPerk(p.id,t)} onRemove={()=>removeCtaPerk(p.id)}/>)}
              <button onClick={addCtaPerk} style={{...paddBtn,width:"100%",marginBottom:11}}>+ Añadir ventaja</button>
              <div style={{display:"flex",gap:8}}><div style={{flex:1}}><PField label="Contacto" value={prog.cta.contact} onChange={v=>setCta("contact",v)}/></div><div style={{flex:1}}><PField label="Texto canal" value={prog.cta.contactLabel} onChange={v=>setCta("contactLabel",v)}/></div></div>
              <PField label="Texto botón CTA" value={prog.cta.ctaText} onChange={v=>setCta("ctaText",v)}/>
            </PSectionCard>
          </div>
        )}
        {mode==="preview"&&(<>
          {generating&&(<div style={{position:"absolute",inset:0,background:"rgba(6,6,15,0.97)",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18}}><div style={{width:46,height:46,border:"3px solid rgba(212,168,67,0.15)",borderTop:`3px solid ${PGOLD}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/><div style={{textAlign:"center"}}><div style={{fontFamily:"Anton",fontSize:17,color:"#fff",letterSpacing:2,marginBottom:6}}>GENERANDO PDF</div><div style={{fontFamily:"Outfit",fontSize:12,color:"#777"}}>{genStep}</div></div><div style={{width:180,height:3,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:PGOLD,animation:"pbar 40s linear forwards"}}/></div></div>)}
          <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",zIndex:200,display:"flex",flexDirection:"column",gap:6}}>{Array.from({length:totalPages}).map((_,i)=>(<div key={i} onClick={()=>goTo(i)} style={{width:5,height:i===page?20:5,borderRadius:3,background:i===page?PGOLD:"rgba(212,168,67,0.25)",cursor:"pointer",transition:"all .3s ease"}}/>))}</div>
          <div style={{position:"absolute",left:0,right:0,bottom:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 15px 14px",background:"linear-gradient(to top,rgba(6,6,15,0.9) 0%,transparent 100%)",pointerEvents:"none"}}>
            <div style={{background:"rgba(0,0,0,0.6)",borderRadius:20,padding:"5px 12px",fontFamily:"Outfit",fontSize:11,color:"#f0ede8",border:"1px solid rgba(255,255,255,0.07)",pointerEvents:"auto"}}>🗺 {page+1} / {totalPages}</div>
            <button onClick={generatePDF} disabled={generating} style={{background:generating?"rgba(212,168,67,0.25)":PGOLD,border:"none",borderRadius:22,padding:"8px 20px",fontFamily:"Anton",fontSize:11,letterSpacing:2,color:generating?"#888":PDARK,cursor:generating?"not-allowed":"pointer",pointerEvents:"auto"}}>{generating?"⏳":"↓"} PDF</button>
          </div>
          <div ref={scrollRef} className="ptls">{Array.from({length:totalPages}).map((_,i)=>(<div key={i} className="ptlpw"><PTLPage prog={prog} pageIndex={i} totalPages={totalPages}/></div>))}</div>
        </>)}
      </div>
    </div>
  );
}
// ══════════════════════════════════════════════════════════
// MAIN APP + AHOME
// ══════════════════════════════════════════════════════════
export default function App(){
  const[screen,setScreen]=useState("splash");
  const[trips,setTrips]=useState([]);const[clients,setClients]=useState([]);
  const[crm,setCrm]=useState({});const[cfg,setCfg]=useState({quickTripId:null,quickBtnLabel:"💰 Ver gastos",quickBtnColor:A.orange});
  const[nav,setNav]=useState({});const[adminOk,setAdminOk]=useState(false);const[adminToken,setAdminToken]=useState(null);
  const[reservas,setReservas]=useState([]);const[gastosGen,setGastosGen]=useState({gastos:[],facturas:[]});

  useEffect(()=>{(async()=>{
    let t=await db.get(SK_T);let c=await db.get(SK_C);let cr=await db.get(SK_CRM);let cf=await db.get(SK_CFG);
    const savedToken=await db.get(SK_ADMIN);
    const savedReservas=await db.get(SK_RP);const savedGG=await db.get(SK_GG);
    if(!t){t=DT;await db.set(SK_T,t);}if(!c){c=DC;await db.set(SK_C,c);}
    if(!cr){cr={};await db.set(SK_CRM,cr);}if(!cf){cf={quickTripId:null,quickBtnLabel:"💰 Ver gastos",quickBtnColor:A.orange};await db.set(SK_CFG,cf);}
    const tt=t.map(tr=>({hotels:[],emergencias:emptyEmergencias(),surveyEnabled:false,surveyConfig:{categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[]},maletaImprescindibles:[...DEFAULT_IMPRESCINDIBLES],maletaCats:DEFAULT_MALETA_CATS.map(mc=>({...mc,items:[...mc.items]})),gastos:[],facturas:[],facturasVenta:[],currency:"EUR",...tr,pagosConfig:(tr.pagosConfig||[]).map(p=>({fechaISO:"",...p})),emergencias:(()=>{const e={...emptyEmergencias(),...(tr.emergencias||{})};if(tr.emergencias?.embajada&&!tr.emergencias?.tourleader)e.tourleader=tr.emergencias.embajada;return e;})()}));
    const cc=c.map(cl=>({personalDocs:[],roommateId:null,acompanantes:[],tripId:null,passportExpiry:"",passportExpiryDismissed:false,notifEnabled:false,surveySubmitted:false,maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",pagosImporteCustom:[],docNumero:"",docVerified:false,groupId:null,...cl,acompanantes:(cl.acompanantes||[]).map(a=>({pagosEstado:[],personalDocs:[],...a}))}));
    setTrips(tt);setClients(cc);setCrm(cr);setCfg(cf);
    if(savedReservas)setReservas(savedReservas);
    if(savedGG)setGastosGen(savedGG);
    let admValid=false;
    if(savedToken&&savedToken!=="true"&&savedToken!==true){admValid=await verifySessionToken(savedToken,"admin");if(!admValid)await db.set(SK_ADMIN,null);}
    if(admValid){setAdminOk(true);setAdminToken(savedToken);}
    const h=window.location.hash.slice(1);
    if(h){const cl=cc.find(x=>x.code===h);if(cl){await db.set(SK_SES,{code:cl.code});setNav({cid:cl.id});return setScreen(cl.firstLogin?"passport":cl.notifEnabled?"client":"notifprompt");}}
    const ses=await db.get(SK_SES);
    if(ses?.code){const cl=cc.find(x=>x.code===ses.code);if(cl){setNav({cid:cl.id});return setScreen(cl.firstLogin?"passport":cl.notifEnabled?"client":"notifprompt");}}
    if(admValid)return setScreen("ahome");
    setScreen("home");
  })();},[]);

  const sT=async v=>{setTrips(v);await db.set(SK_T,v);};
  const sC=async v=>{setClients(v);await db.set(SK_C,v);};
  const sCrm=async v=>{setCrm(v);await db.set(SK_CRM,v);};
  const sCfg=async v=>{setCfg(v);await db.set(SK_CFG,v);};
  const sReservas=async v=>{setReservas(v);await db.set(SK_RP,v);};
  const sGastosGen=async v=>{setGastosGen(v);await db.set(SK_GG,v);};
  const go=(s,x)=>{setNav(n=>({...n,...(x||{})}));setScreen(s);};
  const goClient=async cl=>{await db.set(SK_SES,{code:cl.code});go(cl.firstLogin?"passport":cl.notifEnabled?"client":"notifprompt",{cid:cl.id});};
  const logout=async()=>{await db.set(SK_SES,null);go("home");};
  const logoutAdmin=async()=>{await logoutSessionToken(adminToken);await db.set(SK_ADMIN,null);await db.set(SK_SES,null);setAdminOk(false);setAdminToken(null);go("home");};
  const loginAdmin=async token=>{setAdminOk(true);setAdminToken(token);await db.set(SK_ADMIN,token);go("ahome");};

  if(screen==="splash")return<Splash/>;
  if(screen==="home")return<Home go={go} goClient={goClient} clients={clients}/>;
  if(screen==="pin")return<PinScreen go={go} onOk={loginAdmin} alreadyOk={adminOk}/>;
  if(screen==="ahome")return<AHome go={go} trips={trips} clients={clients} sT={sT} sC={sC} cfg={cfg} sCfg={sCfg} logoutAdmin={logoutAdmin} reservas={reservas} sReservas={sReservas} gastosGen={gastosGen} sGastosGen={sGastosGen}/>;
  if(screen==="atrip")return<ATrip go={go} tid={nav.tid} initTab={nav.initTab} trips={trips} clients={clients} crm={crm} sT={sT} sC={sC} sCrm={sCrm}/>;
  if(screen==="passport")return<Passport go={go} cid={nav.cid} clients={clients} setClients={setClients} trips={trips} sC={sC} logout={logout}/>;
  if(screen==="notifprompt")return<NotifPrompt go={go} cid={nav.cid} clients={clients} sC={sC} logout={logout}/>;
  if(screen==="client")return<Client go={go} cid={nav.cid} clients={clients} trips={trips} logout={logout} sC={sC} sT={sT}/>;
  return<Home go={go} goClient={goClient} clients={clients}/>;
}

function Splash(){return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:A.bg,flexDirection:"column"}}><div style={{fontFamily:ANTON,fontSize:48,color:A.cyan,letterSpacing:4}}>TRAVELIKE</div><div style={{color:A.muted,fontSize:12,fontFamily:BF,letterSpacing:6,textTransform:"uppercase",marginTop:10}}>Cargando...</div></div>);}

function Home({go,goClient,clients}){
  const[code,setCode]=useState("");const[err,setErr]=useState(false);const[taps,setTaps]=useState(0);const timer=useRef();const[savedClient,setSavedClient]=useState(null);
  const tap=()=>{const n=taps+1;setTaps(n);clearTimeout(timer.current);if(n>=5)go("pin");else timer.current=setTimeout(()=>setTaps(0),1000);};
  const enter=()=>{const c=code.trim().toUpperCase();const cl=clients.find(x=>x.code===c);if(cl)goClient(cl);else{setErr(true);setTimeout(()=>setErr(false),2000);}};
  useEffect(()=>{try{const ses=localStorage.getItem("tv9-session");if(ses){const p=JSON.parse(ses);if(p?.code){const cl=clients.find(x=>x.code===p.code);if(cl)setSavedClient(cl);}}}catch{}},[clients]);
  return(<div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column"}}>
    <div onClick={tap} style={{background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"60px 24px",textAlign:"center",borderBottom:`1px solid ${A.border}`}}>
      <div style={{fontFamily:ANTON,fontSize:52,color:"#fff",letterSpacing:3,lineHeight:1}}>TRAVELIKE</div>
      <div style={{fontFamily:BF,fontSize:11,letterSpacing:7,color:A.muted,textTransform:"uppercase",marginTop:8}}>Portal del Viajero</div>
    </div>
    <div style={{flex:1,padding:"40px 28px"}}>
      {savedClient&&(<div style={{background:A.cyan+"15",border:`1px solid ${A.cyan}33`,borderRadius:16,padding:"16px 18px",marginBottom:24,display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:44,height:44,borderRadius:10,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:20,color:A.cyan,flexShrink:0}}>{savedClient.passportPhoto?<img src={savedClient.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}} alt=""/>:savedClient.nombre[0]?.toUpperCase()}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Sesión guardada</div><div style={{fontFamily:ANTON,fontSize:17,color:"#fff",letterSpacing:0.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{savedClient.nombre}</div></div>
        <button onClick={()=>goClient(savedClient)} style={{background:`linear-gradient(90deg,${A.cyan},#0099bb)`,border:"none",color:A.bg,borderRadius:10,padding:"10px 16px",fontFamily:ANTON,fontSize:14,letterSpacing:1,cursor:"pointer",flexShrink:0,textTransform:"uppercase"}}>Entrar</button>
      </div>)}
      <div style={{fontFamily:ANTON,fontSize:28,letterSpacing:1,color:"#fff",marginBottom:16}}>TU VIAJE EMPIEZA AQUÍ</div>
      <div style={{fontSize:16,color:A.muted,marginBottom:28,lineHeight:1.6,fontFamily:BF}}>Introduce tu código de acceso personal para acceder a tu portal.</div>
      <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&enter()} placeholder="CÓDIGO" style={{width:"100%",padding:"22px 20px",fontSize:32,textAlign:"center",background:A.card2,border:`2px solid ${err?A.red:A.border}`,color:err?A.red:A.cyan,borderRadius:16,fontFamily:ANTON,letterSpacing:4,outline:"none",marginBottom:16,textTransform:"uppercase",boxSizing:"border-box"}}/>
      {err&&<div style={{color:A.red,fontSize:16,fontWeight:700,marginBottom:16,textAlign:"center",fontFamily:BF}}>Código incorrecto</div>}
      <button onClick={enter} style={{width:"100%",padding:"18px",border:"none",borderRadius:14,fontFamily:ANTON,fontSize:18,letterSpacing:3,cursor:"pointer",background:`linear-gradient(90deg,${A.cyan},#0099bb)`,color:A.bg,textTransform:"uppercase",marginTop:10}}>ENTRAR</button>
    </div>
  </div>);}

function PinScreen({go,onOk,alreadyOk}){
  useEffect(()=>{if(alreadyOk)go("ahome");},[]);
  const[pin,setPin]=useState("");const[status,setStatus]=useState("idle");const[msg,setMsg]=useState("");
  const tryPin=async()=>{if(!pin.trim()||status==="loading"||status==="locked")return;setStatus("loading");const result=await verifyPin(pin,"admin");setPin("");if(result.status==="ok"){onOk(result.token);}else if(result.status==="locked"){setStatus("locked");setMsg(`Demasiados intentos. Bloqueado ${result.minutes||30} minutos.`);}else if(result.status==="invalid"){setStatus("error");const r=result.remaining;setMsg(r>0?`PIN incorrecto — ${r} intento${r>1?"s":""} restante${r>1?"s":""}`:"PIN incorrecto — último intento agotado");setTimeout(()=>setStatus("idle"),3000);}else{setStatus("error");setMsg("Error de conexión. Comprueba tu red.");setTimeout(()=>setStatus("idle"),3000);}};
  return(<div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",padding:"60px 28px",textAlign:"center",fontFamily:BF}}>
    <div style={{fontSize:48,marginBottom:16}}>🔐</div>
    <div style={{fontFamily:ANTON,fontSize:36,letterSpacing:2,color:"#fff",marginBottom:8}}>ADMIN</div>
    <div style={{fontSize:13,color:A.muted,marginBottom:40,letterSpacing:2}}>ACCESO RESTRINGIDO</div>
    {status==="locked"?(<div style={{background:A.red+"18",border:`1px solid ${A.red}44`,borderRadius:16,padding:"28px 20px",marginBottom:24}}><div style={{fontSize:40,marginBottom:12}}>🔒</div><div style={{fontFamily:ANTON,fontSize:20,color:A.red,marginBottom:8}}>ACCESO BLOQUEADO</div><div style={{fontSize:14,color:A.muted,lineHeight:1.7}}>{msg}</div></div>):(<>
      <input type="password" value={pin} onChange={e=>{setPin(e.target.value);if(status!=="idle")setStatus("idle");}} onKeyDown={e=>e.key==="Enter"&&tryPin()} placeholder="PIN" autoComplete="current-password" style={{width:"100%",padding:"22px",fontSize:32,textAlign:"center",background:A.card2,border:`2px solid ${status==="error"?A.red:A.border}`,color:A.text,borderRadius:16,fontFamily:ANTON,outline:"none",marginBottom:16,boxSizing:"border-box",letterSpacing:6}}/>
      {status==="error"&&<div style={{color:A.red,fontSize:13,marginBottom:16,fontWeight:700}}>{msg}</div>}
      {status==="idle"&&<div style={{fontSize:12,color:A.muted,marginBottom:16}}>5 intentos fallidos = bloqueo de 30 min</div>}
      {status==="loading"&&<div style={{fontSize:13,color:A.muted,marginBottom:16}}>Verificando…</div>}
      <button onClick={tryPin} disabled={status==="loading"||!pin.trim()} style={{width:"100%",padding:"18px",border:"none",borderRadius:14,fontFamily:ANTON,fontSize:16,letterSpacing:2,cursor:status==="loading"||!pin.trim()?"default":"pointer",background:status==="loading"?A.card2:A.cyan,color:status==="loading"?A.muted:A.bg,textTransform:"uppercase",marginBottom:16,opacity:!pin.trim()?0.5:1}}>{status==="loading"?"Verificando…":"ENTRAR"}</button>
    </>)}
    <button onClick={()=>go("home")} style={{background:"none",border:"none",color:A.muted,fontSize:14,cursor:"pointer",fontFamily:BF}}>Volver</button>
  </div>);}

function AHome({go,trips,clients,sT,sC,cfg,sCfg,logoutAdmin,reservas,sReservas,gastosGen,sGastosGen}){
  const[subScreen,setSubScreen]=useState(null);const[cfgModal,setCfgModal]=useState(false);const[addTripModal,setAddTripModal]=useState(false);const[passModal,setPassModal]=useState(false);
  const[tripName,setTripName]=useState("");const[tripFlag,setTripFlag]=useState("🌍");const[tripMonth,setTripMonth]=useState(String(NOW.getMonth()+1));const[tripYear,setTripYear]=useState(String(NOW.getFullYear()));
  const[tripPrice,setTripPrice]=useState("");const[tripFechas,setTripFechas]=useState("");const[tripWebUrl,setTripWebUrl]=useState("");const[tripCurrency,setTripCurrency]=useState("EUR");const[currMenu,setCurrMenu]=useState(false);

  const up=trips.filter(t=>!isPast(t.date)).sort((a,b)=>a.date.localeCompare(b.date));
  const hist=trips.filter(t=>isPast(t.date)).sort((a,b)=>b.date.localeCompare(a.date));
  const passWarn=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpiryDismissed).length;
  const quickTrip=cfg.quickTripId?trips.find(t=>t.id===cfg.quickTripId):null;
  const totalViajeros=clients.length;const totalConfirmados=clients.filter(c=>c.status==="confirmado"||c.status==="pagado").length;
  const reservasPendientesCount=reservas.filter(r=>r.estado!=="confirmado"&&r.estado!=="cancelado").length;

  const addTrip=()=>{if(!tripName.trim()||tripYear.length!==4)return;const date=`${tripYear}-${String(tripMonth).padStart(2,"0")}`;sT([...trips,{id:`t${uid()}`,name:tripName.trim(),flag:tripFlag||"🌍",date,price:tripPrice?+tripPrice:null,currency:tripCurrency,fechas:tripFechas||fmt(date),webUrl:tripWebUrl||"",...emptyT()}].sort((a,b)=>a.date.localeCompare(b.date)));setAddTripModal(false);setTripName("");setTripFlag("🌍");setTripMonth(String(NOW.getMonth()+1));setTripYear(String(NOW.getFullYear()));setTripPrice("");setTripFechas("");setTripWebUrl("");setTripCurrency("EUR");};
  const delTrip=id=>{if(!window.confirm("¿Eliminar viaje? Los clientes se conservarán en tu registro global sin viaje asignado."))return;sT(trips.filter(t=>t.id!==id));sC(clients.map(c=>c.tripId===id?{...c,tripId:null,roommateId:null}:c));};
  const passWarnList=clients.filter(c=>passportWarn(c.passportExpiry)&&!c.passportExpiryDismissed).map(c=>{const d=daysUntilExpiry(c.passportExpiry);const dateStr=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):"";return{...c,_sub:`${d!==null&&d>=0?`Caduca en ${d} días`:"VENCIDO"}${dateStr?` · ${dateStr}`:""}`};});
  const passExpireYear=clients.filter(c=>{const d=daysUntilExpiry(c.passportExpiry);return d!==null&&d<=365;}).map(c=>{const d=daysUntilExpiry(c.passportExpiry);const dateStr=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):"";return{...c,_days:d,_dateStr:dateStr};}).sort((a,b)=>a._days-b._days);

  if(subScreen==="voucher")return<CartaDePagoGenerator onBack={()=>setSubScreen(null)}/>;
  if(subScreen==="presupuesto")return<PresupuestoGenerator onBack={()=>setSubScreen(null)}/>;
  if(subScreen==="programa")return<ConstructorProgramas onBack={()=>setSubScreen(null)}/>;
  if(subScreen==="reservas")return<ReservasPendientes onBack={()=>setSubScreen(null)} reservas={reservas} setReservas={sReservas}/>;
  if(subScreen==="gastos_gen")return<GastosGenerales onBack={()=>setSubScreen(null)} gastosGen={gastosGen} setGastosGen={sGastosGen}/>;
  if(subScreen==="clients")return(<div style={{background:A.bg,minHeight:"100vh"}}><div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}><button onClick={()=>setSubScreen(null)} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button><div style={{fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Clientes</div></div><ClientesTab clients={clients} trips={trips} sC={sC}/></div>);
  if(subScreen==="notifs")return(<div style={{background:A.bg,minHeight:"100vh"}}><div style={{background:A.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${A.border}`,position:"sticky",top:0,zIndex:10}}><button onClick={()=>setSubScreen(null)} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:16,flexShrink:0}}>←</button><div style={{fontFamily:ANTON,fontSize:18,color:"#fff",letterSpacing:1,textTransform:"uppercase",flex:1}}>Notificaciones</div></div><NotifAdmin trips={trips} clients={clients}/></div>);

  return(<div style={{background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF}}>
    <div style={{background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"24px 16px 16px",borderBottom:`1px solid ${A.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div><div style={{fontFamily:ANTON,fontSize:28,letterSpacing:2,color:"#fff",textTransform:"uppercase",lineHeight:1}}>TRAVELIKE</div><div style={{fontSize:10,color:A.cyan,letterSpacing:4,textTransform:"uppercase",marginTop:2}}>Panel de control</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {passWarn>0&&<button onClick={()=>setPassModal(true)} style={{background:A.red+"22",border:`1px solid ${A.red}44`,borderRadius:10,padding:"6px 10px",color:A.red,fontFamily:BF,fontSize:11,fontWeight:700,cursor:"pointer"}}>🛂 {passWarn}</button>}
          <button onClick={logoutAdmin} style={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,padding:"6px 10px",color:A.muted,fontFamily:BF,fontSize:11,cursor:"pointer"}}>🔓 Salir</button>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {[{l:"Próximos",v:up.length,c:A.cyan},{l:"Histórico",v:hist.length,c:A.muted},{l:"Viajeros",v:totalViajeros,c:A.orange},{l:"Confirm.",v:totalConfirmados,c:A.green}].map(item=>(<div key={item.l} style={{flex:1,background:A.card2,borderRadius:10,padding:"7px 6px",border:`1px solid ${A.border}`,textAlign:"center"}}><div style={{fontFamily:ANTON,fontSize:18,color:item.c,lineHeight:1}}>{item.v}</div><div style={{fontSize:8,color:A.muted,letterSpacing:1,textTransform:"uppercase",marginTop:2,fontFamily:BF}}>{item.l}</div></div>))}
      </div>
    </div>
    <div style={{padding:"10px 16px 0"}}>
      {quickTrip?(<button onClick={()=>go("atrip",{tid:quickTrip.id,initTab:"finanzas"})} style={{width:"100%",background:`${cfg.quickBtnColor}22`,border:`2px solid ${cfg.quickBtnColor}55`,borderRadius:14,padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxSizing:"border-box"}}><span style={{fontSize:24}}>{quickTrip.flag}</span><div style={{flex:1,textAlign:"left"}}><div style={{fontFamily:ANTON,fontSize:14,color:cfg.quickBtnColor,letterSpacing:1,textTransform:"uppercase"}}>{cfg.quickBtnLabel}</div><div style={{fontFamily:BF,fontSize:10,color:A.muted,marginTop:1}}>{quickTrip.name}</div></div><div onClick={e=>{e.stopPropagation();setCfgModal(true);}} style={{color:A.muted,fontSize:16,cursor:"pointer",padding:"4px 6px"}}>⚙️</div></button>):(<button onClick={()=>setCfgModal(true)} style={{width:"100%",background:A.card2,border:`1.5px dashed ${A.border}`,borderRadius:14,padding:"10px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,color:A.muted,fontFamily:BF,fontSize:12,boxSizing:"border-box"}}><span style={{fontSize:18}}>⚡</span>Añadir botón de acceso rápido</button>)}
    </div>
    <div style={{padding:"12px 16px"}}>
      {passExpireYear.length>0&&(<div style={{background:A.card,borderRadius:16,border:`2px solid ${A.red}66`,overflow:"hidden",marginBottom:10}}><div style={{padding:"12px 14px 10px",background:`linear-gradient(90deg,${A.red}28,${A.orange}18)`,display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${A.red}33`}}><span style={{fontSize:24}}>🚨</span><div style={{flex:1}}><div style={{fontFamily:ANTON,fontSize:14,color:A.red,letterSpacing:1,textTransform:"uppercase"}}>¡Pasaportes próximos a caducar!</div><div style={{fontFamily:BF,fontSize:10,color:A.muted,marginTop:1}}>{passExpireYear.length} viajero{passExpireYear.length!==1?"s":""} con pasaporte caducando en menos de 1 año</div></div></div>{passExpireYear.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 14px",borderTop:`1px solid ${A.border}44`}}><div style={{width:32,height:32,borderRadius:8,background:A.card2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:ANTON,fontSize:13,color:A.cyan,overflow:"hidden"}}>{c.passportPhoto?<img src={c.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:c.nombre[0]?.toUpperCase()}</div><div style={{flex:1,minWidth:0}}><div style={{fontFamily:BF,fontSize:14,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.nombre}</div><div style={{fontFamily:BF,fontSize:11,color:A.muted}}>Caduca: {c._dateStr}</div></div><div style={{fontFamily:ANTON,fontSize:14,letterSpacing:0.5,flexShrink:0,color:c._days<0?A.red:c._days<=60?A.red:c._days<=180?A.orange:A.gold}}>{c._days<0?"💀 VENCIDO":c._days===0?"💀 HOY":c._days<=90?`😱 ${c._days}d`:`⚠️ ${c._days}d`}</div></div>))}</div>)}

      {/* Herramientas de admin */}
      {[
        {icon:"👥",label:"Clientes",desc:`${totalViajeros} registrados`,color:A.green,action:()=>setSubScreen("clients")},
        {icon:"📋",label:"Reservas Pendientes",desc:`${reservasPendientesCount} pendiente${reservasPendientesCount!==1?"s":""}`,color:A.orange,action:()=>setSubScreen("reservas"),badge:reservasPendientesCount},
        {icon:"💰",label:"Gastos Generales",desc:"Gastos de empresa con facturas y ZIP",color:A.red,action:()=>setSubScreen("gastos_gen")},
        {icon:"🔔",label:"Notificaciones",desc:"OneSignal push",color:A.purple,action:()=>setSubScreen("notifs")},
        {icon:"📄",label:"Cartas de Pago",desc:"Genera cartas de pago PDF",color:A.gold,action:()=>setSubScreen("voucher")},
        {icon:"💼",label:"Presupuestos",desc:"Cotizaciones visuales para clientes",color:"#1AB5B0",action:()=>setSubScreen("presupuesto")},
        {icon:"📖",label:"Constructor de Programas",desc:"Crea folletos de viaje completos PDF",color:"#a855f7",action:()=>setSubScreen("programa")},
      ].map(item=>(<button key={item.label} onClick={item.action} style={{width:"100%",background:A.card,border:`1.5px solid ${item.color}22`,borderRadius:16,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,marginBottom:10,boxSizing:"border-box",textAlign:"left",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:item.color+"10",pointerEvents:"none"}}/>
        <div style={{width:48,height:48,borderRadius:14,background:item.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,position:"relative"}}>{item.icon}{item.badge>0&&<div style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:item.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:10,color:"#fff"}}>{item.badge}</div>}</div>
        <div style={{flex:1}}><div style={{fontFamily:ANTON,fontSize:18,color:item.color,letterSpacing:1,textTransform:"uppercase",lineHeight:1,marginBottom:4}}>{item.label}</div><div style={{fontFamily:BF,fontSize:12,color:A.muted}}>{item.desc}</div></div>
        <div style={{color:item.color,fontSize:20}}>›</div>
      </button>))}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 8px"}}>
        <div style={{fontFamily:ANTON,fontSize:14,color:A.text,letterSpacing:1,textTransform:"uppercase"}}>Viajes Próximos</div>
        <button onClick={()=>setAddTripModal(true)} style={{...ab(A.cyan+"22",A.cyan),padding:"5px 12px",fontSize:11,borderRadius:8,border:`1px solid ${A.cyan}33`,fontFamily:BF}}>+ Nuevo</button>
      </div>
      {up.length===0&&<div style={{padding:"14px",color:A.muted,fontSize:13,fontFamily:BF,textAlign:"center"}}>Sin viajes próximos</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {up.map(t=>{const tc=clients.filter(c=>c.tripId===t.id);const conf=tc.filter(c=>c.status==="confirmado"||c.status==="pagado").length;return(<div key={t.id} onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{background:A.card,borderRadius:16,padding:"16px",border:`1px solid ${A.border}`,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:8,cursor:"pointer",position:"relative"}}><button onClick={e=>{e.stopPropagation();delTrip(t.id);}} style={{position:"absolute",top:8,right:8,background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer"}}>✕</button><span style={{fontSize:40,marginTop:4}}>{t.flag}</span><div style={{fontFamily:ANTON,fontSize:16,color:A.text,lineHeight:1.1}}>{t.name}</div><div style={{fontSize:11,color:A.cyan,fontFamily:BF}}>{fmt(t.date)}</div><div style={{fontSize:10,color:A.muted,fontFamily:BF,background:A.card2,padding:"4px 8px",borderRadius:8}}>{conf}/{tc.length} conf.</div></div>);})}
      </div>
      {hist.length>0&&(<div style={{padding:"12px 0"}}><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Histórico</div>{hist.map(t=>(<div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",background:A.card,borderRadius:10,marginBottom:8,border:`1px solid ${A.border}66`}}><span onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{fontSize:18,cursor:"pointer"}}>{t.flag}</span><div onClick={()=>go("atrip",{tid:t.id,initTab:"menu"})} style={{flex:1,fontFamily:BF,fontSize:13,color:A.muted,cursor:"pointer"}}>{t.name}</div><div style={{fontFamily:BF,fontSize:10,color:A.muted,marginRight:4}}>{fmt(t.date)}</div><button onClick={e=>{e.stopPropagation();delTrip(t.id);}} style={{background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",padding:"2px 4px",flexShrink:0}}>✕</button></div>))}</div>)}
    </div>
    {addTripModal&&(<AModal title="Nuevo viaje" onClose={()=>setAddTripModal(false)}><div style={{display:"grid",gridTemplateColumns:"58px 1fr",gap:10,marginBottom:10}}><input value={tripFlag} onChange={e=>setTripFlag(e.target.value)} style={{...ais,textAlign:"center",fontSize:24,padding:"8px"}}/><input value={tripName} onChange={e=>setTripName(e.target.value)} placeholder="Nombre del viaje" style={ais}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 88px",gap:10,marginBottom:10}}><select value={tripMonth} onChange={e=>setTripMonth(e.target.value)} style={ais}>{MES_F.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select><input value={tripYear} onChange={e=>setTripYear(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="2026" inputMode="numeric" style={ais}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginBottom:10}}><input value={tripPrice} onChange={e=>setTripPrice(e.target.value.replace(/[^\d.]/g,""))} placeholder="Precio" inputMode="numeric" style={ais}/><button onClick={()=>setCurrMenu(true)} style={{...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold}}>{tripCurrency} <span style={{color:A.muted,fontSize:11}}>▾</span></button></div><input value={tripFechas} onChange={e=>setTripFechas(e.target.value)} placeholder="Fechas para viajeros" style={{...ais,marginBottom:10}}/><input value={tripWebUrl} onChange={e=>setTripWebUrl(e.target.value)} placeholder="URL web del viaje" style={{...ais,marginBottom:14}}/><ARow><button onClick={()=>setAddTripModal(false)} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button><button onClick={addTrip} style={{...ab(A.cyan,A.bg),flex:2}}>Añadir</button></ARow>{currMenu&&<CurrencyMenu current={tripCurrency} onSelect={setTripCurrency} onClose={()=>setCurrMenu(false)}/>}</AModal>)}
    {cfgModal&&<QuickCfgModal cfg={cfg} trips={trips} sCfg={sCfg} onClose={()=>setCfgModal(false)}/>}
    {passModal&&<FilteredListModal title="Alertas de pasaporte" clients={passWarnList} onClose={()=>setPassModal(false)}/>}
  </div>);}

function QuickCfgModal({cfg,trips,sCfg,onClose}){const[label,setLabel]=useState(cfg.quickBtnLabel||"💰 Ver gastos");const[color,setColor]=useState(cfg.quickBtnColor||A.orange);const[tripId,setTripId]=useState(cfg.quickTripId||"");const save=()=>{sCfg({quickTripId:tripId||null,quickBtnLabel:label,quickBtnColor:color});onClose();};const COLORS=[A.orange,A.cyan,A.gold,A.green,A.red,A.purple,"#FF6B6B","#00CED1"];return(<AModal title="Botón rápido" onClose={onClose}><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Texto del botón</div><input value={label} onChange={e=>setLabel(e.target.value)} style={{...ais,marginBottom:14}}/><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Viaje de destino</div><select value={tripId} onChange={e=>setTripId(e.target.value)} style={{...ais,marginBottom:14}}><option value="">Sin asignar</option>{trips.map(t=><option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}</select><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Color</div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>{COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:36,height:36,borderRadius:10,background:c,border:`3px solid ${color===c?"#fff":c}`,cursor:"pointer",flexShrink:0}}/>)}</div><ARow><button onClick={onClose} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button><button onClick={save} style={{...ab(A.cyan,A.bg),flex:2}}>Guardar</button></ARow></AModal>);}
// ══════════════════════════════════════════════════════════
// CLIENTES TAB, NOTIF ADMIN (unchanged from original)
// ══════════════════════════════════════════════════════════
function ClientesTab({clients,trips,sC}){
  const[modal,setModal]=useState(false);const[personas,setPersonas]=useState([{nombre:"",email:""}]);
  const[copied,setCopied]=useState(null);const[filter,setFilter]=useState("all");const[search,setSearch]=useState("");const[expandedDoc,setExpandedDoc]=useState(null);
  const getLink=c=>`${window.location.href.split("#")[0]}#${c.code}`;
  const openWA=c=>{const link=getLink(c);const trip=c.tripId?trips.find(t=>t.id===c.tripId):null;const msg=trip?`Hola ${c.nombre.split(" ")[0]}!\n\nPortal del viaje ${trip.name}:\n${link}`:`Hola ${c.nombre.split(" ")[0]}!\n\nPortal Travelike:\n${link}`;window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,"_blank");};
  const updC=(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
  const addClients=()=>{const valid=personas.filter(p=>p.nombre.trim());if(!valid.length)return;const groupId=valid.length>1?`g${uid()}`:null;const nuevos=valid.map(p=>({id:`cl${uid()}`,nombre:p.nombre.trim(),email:p.email||"",tripId:null,code:genCode(),status:"interesado",room:"doble_jun",note:"",pagosEstado:[],pagosImporteCustom:[],personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,passportExpiry:"",passportExpiryDismissed:false,notifEnabled:false,roommateId:null,surveySubmitted:false,acompanantes:[],maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",docNumero:"",birthDate:"",docVerified:false,groupId}));sC([...clients,...nuevos]);setPersonas([{nombre:"",email:""}]);setModal(false);};
  const base=filter==="all"?clients:filter==="notrip"?clients.filter(c=>!c.tripId):clients.filter(c=>c.tripId===filter);
  const displayed=search.trim()?base.filter(c=>matchSearch(c.nombre,search)||matchSearch(c.code,search)):base;
  const getFL=k=>{if(k==="all")return`Todos (${clients.length})`;if(k==="notrip")return`Sin viaje (${clients.filter(c=>!c.tripId).length})`;const t=trips.find(x=>x.id===k);return t?`${t.flag} ${t.name.split(" ")[0]} (${clients.filter(c=>c.tripId===k).length})`:k;};
  return(<div style={{padding:"12px 16px"}}>
    <div style={{display:"flex",borderBottom:`1px solid ${A.border}`,background:A.card2,overflowX:"auto",marginBottom:10}}>
      {[{k:"all"},{k:"notrip"},...trips.map(t=>({k:t.id}))].map(item=>(<button key={item.k} onClick={()=>setFilter(item.k)} style={{flexShrink:0,background:"transparent",border:"none",borderBottom:`2px solid ${filter===item.k?A.cyan:"transparent"}`,color:filter===item.k?A.text:A.muted,padding:"9px 14px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:BF,letterSpacing:1,whiteSpace:"nowrap"}}>{getFL(item.k)}</button>))}
    </div>
    <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o código..."/>
    <button onClick={()=>setModal(true)} style={{...ab(A.cyan+"22",A.cyan),width:"100%",border:`1.5px dashed ${A.cyan}`,borderRadius:10,marginBottom:12,fontFamily:BF}}>+ Registrar cliente</button>
    {displayed.length===0&&<AEmpty text={search?"Sin resultados":"Sin clientes"}/>}
    {displayed.map(c=>{
      const trip=c.tripId?trips.find(t=>t.id===c.tripId):null;const st=ST.find(s=>s.key===c.status)||ST[0];const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_PAGO[0];
      return(<div key={c.id} style={{background:A.card,borderRadius:14,padding:"12px 14px",marginBottom:10,border:`1px solid ${A.border}44`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:42,height:42,borderRadius:10,overflow:"hidden",background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.passportPhoto?<img src={c.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span style={{fontFamily:ANTON,fontSize:17,color:A.cyan}}>{c.nombre[0]?.toUpperCase()}</span>}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontFamily:ANTON,fontSize:15,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.nombre}</div><div style={{fontSize:10,color:trip?A.cyan:A.orange,fontFamily:BF}}>{trip?`${trip.flag} ${trip.name}`:"Sin viaje asignado"}</div></div>
          <button onClick={()=>sC(clients.filter(x=>x.id!==c.id))} style={{background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:9,color:A.muted,background:A.card2,padding:"4px 8px",borderRadius:6,border:`1px solid ${A.border}`,fontFamily:BF}}>🏷️ {c.code}</span>
          <span style={{fontSize:9,padding:"4px 8px",borderRadius:6,background:st.color+"22",color:st.color,border:`1px solid ${st.color}44`,fontFamily:BF}}>{st.emoji} {st.label}</span>
          <span style={{fontSize:9,padding:"4px 8px",borderRadius:6,background:A.cyan+"15",color:A.cyan,border:`1px solid ${A.cyan}22`,fontFamily:BF}}>{fp.icon} {fp.label}</span>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          {(()=>{const link=getLink(c);const[cop,setCop]=useState(false);const wa=()=>{const t2=trips.find(t=>t.id===c.tripId);const msg=t2?`Hola ${c.nombre.split(" ")[0]}!\n\nPortal ${t2.name}:\n${link}`:`Hola ${c.nombre.split(" ")[0]}!\n\nPortal Travelike:\n${link}`;window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,"_blank");};return(<><button onClick={()=>{navigator.clipboard.writeText(link).then(()=>{setCop(true);setTimeout(()=>setCop(false),2000);});}} style={{...ab(cop?A.green+"22":A.cyan+"15",cop?A.green:A.cyan),flex:1,fontSize:11,padding:"7px 8px",borderRadius:8,border:`1px solid ${cop?A.green:A.cyan}44`,fontFamily:BF}}>{cop?"¡Copiado!":"🔗 Link"}</button><button onClick={wa} style={{...ab(A.green+"15",A.green),flex:1,fontSize:11,padding:"7px 8px",borderRadius:8,border:`1px solid ${A.green}44`,fontFamily:BF}}>💬 WhatsApp</button><button onClick={()=>setExpandedDoc(expandedDoc===c.id?null:c.id)} style={{...ab(expandedDoc===c.id?A.cyan+"22":A.card2,expandedDoc===c.id?A.cyan:A.muted),flex:1,fontSize:11,padding:"7px 8px",borderRadius:8,border:`1px solid ${expandedDoc===c.id?A.cyan+"44":A.border}`,fontFamily:BF}}>🛂 Doc</button></>)})()}
        </div>
        {expandedDoc===c.id&&(<div style={{marginTop:10,background:A.bg,borderRadius:12,border:`1px solid ${A.cyan}33`,padding:"12px"}}>
          <div style={{fontFamily:BF,fontSize:9,color:A.cyan,letterSpacing:2,textTransform:"uppercase",marginBottom:10,fontWeight:700}}>📋 Datos de documento</div>
          <div style={{marginBottom:8}}><div style={{fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Nº Pasaporte / DNI</div><input key={c.id+"_cdoc"} defaultValue={c.docNumero||""} onBlur={e=>updC(c.id,x=>({...x,docNumero:e.target.value.toUpperCase(),docVerified:false}))} placeholder="ABC123456" style={{...ais,fontFamily:ANTON,fontSize:20,letterSpacing:3,textAlign:"center",color:A.cyan,background:A.card}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={{fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>F. Nacimiento</div><input key={c.id+"_cbday"} type="text" inputMode="numeric" placeholder="DD-MM-AAAA" maxLength={10} defaultValue={isoToDisplay(c.birthDate||"")} onChange={e=>{const raw=e.target.value.replace(/[^0-9]/g,"");let fmt=raw;if(raw.length>2)fmt=raw.slice(0,2)+"-"+raw.slice(2);if(raw.length>4)fmt=raw.slice(0,2)+"-"+raw.slice(2,4)+"-"+raw.slice(4,8);e.target.value=fmt;}} onBlur={e=>updC(c.id,x=>({...x,birthDate:displayToISO(e.target.value)}))} style={{...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,color:A.gold,background:A.card,border:`1px solid ${A.gold}44`}}/></div>
            <div><div style={{fontFamily:BF,fontSize:9,color:passportWarn(c.passportExpiry)?A.orange:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Caducidad</div><input key={c.id+"_cexp"} type="text" inputMode="numeric" placeholder="DD-MM-AAAA" maxLength={10} defaultValue={isoToDisplay(c.passportExpiry||"")} onChange={e=>{const raw=e.target.value.replace(/[^0-9]/g,"");let fmt=raw;if(raw.length>2)fmt=raw.slice(0,2)+"-"+raw.slice(2);if(raw.length>4)fmt=raw.slice(0,2)+"-"+raw.slice(2,4)+"-"+raw.slice(4,8);e.target.value=fmt;}} onBlur={e=>updC(c.id,x=>({...x,passportExpiry:displayToISO(e.target.value),passportExpiryDismissed:false}))} style={{...ais,textAlign:"center",fontFamily:ANTON,fontSize:14,color:passportWarn(c.passportExpiry)?A.orange:A.text,background:A.card,border:`1px solid ${passportWarn(c.passportExpiry)?A.orange+"44":A.border+"44"}`}}/></div>
          </div>
        </div>)}
      </div>);
    })}
    {modal&&(<AModal title="Nuevo cliente" onClose={()=>{setModal(false);setPersonas([{nombre:"",email:""}]);}}><div style={{fontSize:13,color:A.muted,fontFamily:BF,marginBottom:14}}>Puedes registrar una persona o un grupo que viajará junto.</div>{personas.map((p,i)=>(<div key={i} style={{background:A.bg,borderRadius:12,padding:"12px",marginBottom:8,border:`1px solid ${i===0?A.cyan+"44":A.purple+"44"}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:BF,fontSize:10,color:i===0?A.cyan:A.purple,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>{i===0?"Principal":`Persona ${i+1}`}</div>{i>0&&<button onClick={()=>setPersonas(ps=>ps.filter((_,j)=>j!==i))} style={{background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",lineHeight:1}}>✕</button>}</div><input value={p.nombre} onChange={e=>setPersonas(ps=>ps.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} placeholder="Nombre completo" style={{...ais,marginBottom:8}}/><input value={p.email} onChange={e=>setPersonas(ps=>ps.map((x,j)=>j===i?{...x,email:e.target.value}:x))} placeholder="Email (opcional)" type="email" style={ais}/></div>))}<button onClick={()=>setPersonas(ps=>[...ps,{nombre:"",email:""}])} style={{...ab(A.purple+"22",A.purple),width:"100%",border:`1.5px dashed ${A.purple}`,borderRadius:10,marginBottom:14,fontFamily:BF}}>+ Añadir otra persona al grupo</button><ARow><button onClick={()=>{setModal(false);setPersonas([{nombre:"",email:""}]);}} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button><button onClick={addClients} style={{...ab(A.cyan,A.bg),flex:2}}>{personas.filter(p=>p.nombre.trim()).length>1?`Registrar grupo (${personas.filter(p=>p.nombre.trim()).length})`:"Registrar"}</button></ARow></AModal>)}
  </div>);}

function NotifAdmin({trips,clients}){
  const[mode,setMode]=useState("manual");const[templates,setTemplates]=useState(DEFAULT_TEMPLATES);
  const[notifTitle,setNotifTitle]=useState("");const[notifBody,setNotifBody]=useState("");const[notifTarget,setNotifTarget]=useState("all");const[notifTripId,setNotifTripId]=useState("");
  const[sent,setSent]=useState(null);const[sending,setSending]=useState(false);const notifCount=clients.filter(c=>c.notifEnabled).length;
  const send=async(title,body,target,tripId)=>{setSending(true);let errorMsg="";try{const filters=target==="trip"&&tripId?[{field:"tag",key:"tripId",relation:"=",value:tripId}]:[];const result=await sendOneSignal(title,body,filters);const count=target==="all"?clients.filter(c=>c.notifEnabled).length:clients.filter(c=>c.tripId===tripId&&c.notifEnabled).length;const ok=result.id&&!result.errors;if(!ok)errorMsg=result.errors?JSON.stringify(result.errors):(result.error||"Sin respuesta del servidor");setSent({title,count,ok,errorMsg});}catch(e){setSent({title,count:0,ok:false,errorMsg:e.message});}setSending(false);setTimeout(()=>setSent(null),8000);};
  const handleSend=()=>{if(!notifTitle.trim()||!notifBody.trim())return;send(notifTitle,notifBody,notifTarget,notifTripId);setNotifTitle("");setNotifBody("");};
  return(<div style={{padding:"12px 16px"}}>
    {sent&&(<div style={{background:(sent.ok?A.green:A.red)+"22",border:`2px solid ${sent.ok?A.green:A.red}44`,borderRadius:14,padding:"14px 16px",marginBottom:14,fontFamily:BF}}><div style={{fontFamily:ANTON,fontSize:18,color:sent.ok?A.green:A.red,marginBottom:4}}>{sent.ok?"✅ ENVIADO":"❌ ERROR"}</div><div style={{fontSize:13,color:A.muted}}>«{sent.title}»{sent.ok?` — ${sent.count} viajeros`:""}</div>{!sent.ok&&sent.errorMsg&&<div style={{fontSize:11,color:A.red,marginTop:6}}>{sent.errorMsg}</div>}</div>)}
    <div style={{background:A.card2,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid ${A.border}`,display:"flex",gap:10,alignItems:"center"}}><div style={{fontSize:28}}>🔔</div><div style={{flex:1}}><div style={{fontFamily:ANTON,fontSize:16,color:"#fff"}}>OneSignal</div><div style={{fontSize:11,color:A.muted,fontFamily:BF}}>{notifCount} viajeros con notificaciones activas</div></div></div>
    <div style={{display:"flex",background:A.card2,borderRadius:10,padding:4,marginBottom:14,gap:4}}>{[{k:"manual",l:"Manual"},{k:"templates",l:"Plantillas"}].map(item=>(<button key={item.k} onClick={()=>setMode(item.k)} style={{flex:1,background:mode===item.k?A.cyan:A.card2,color:mode===item.k?A.bg:A.muted,border:"none",borderRadius:8,padding:"10px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer"}}>{item.l}</button>))}</div>
    {mode==="manual"&&(<div><input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="Título" style={{...ais,marginBottom:10}}/><textarea value={notifBody} onChange={e=>setNotifBody(e.target.value)} placeholder="Mensaje..." style={{...ais,minHeight:80,resize:"vertical",lineHeight:1.5,marginBottom:10}}/><div style={{background:A.card2,borderRadius:10,padding:"12px",marginBottom:10,border:`1px solid ${A.border}`}}><div style={{fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Destinatarios</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{k:"all",l:"Todos"},...trips.map(t=>({k:t.id,l:`${t.flag} ${t.name.split(" ")[0]}`}))].map(item=>{const active=(notifTarget==="all"&&item.k==="all")||notifTripId===item.k;return(<button key={item.k} onClick={()=>{if(item.k==="all"){setNotifTarget("all");setNotifTripId("");}else{setNotifTarget("trip");setNotifTripId(item.k);}}} style={{...ab(active?A.cyan:A.card,active?A.bg:A.muted),fontSize:11,padding:"6px 12px",borderRadius:20,border:`1px solid ${active?A.cyan:A.border}`}}>{item.l}</button>);})}</div></div><button onClick={handleSend} disabled={sending||!notifTitle.trim()||!notifBody.trim()} style={{width:"100%",padding:"14px",borderRadius:10,border:"none",fontFamily:ANTON,fontSize:16,letterSpacing:2,cursor:"pointer",background:`linear-gradient(90deg,${A.red},#c00020)`,color:"#fff",textTransform:"uppercase"}}>{sending?"Enviando...":"ENVIAR"}</button></div>)}
    {mode==="templates"&&(<div>{templates.map(t=>(<div key={t.id} style={{background:A.card,borderRadius:12,padding:"14px",marginBottom:10,border:`1px solid ${A.border}44`}}><div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}><span style={{fontSize:24,flexShrink:0}}>{t.emoji}</span><div style={{flex:1}}><div style={{fontFamily:BF,fontSize:15,fontWeight:700,color:A.text}}>{t.title}</div><div style={{fontSize:12,color:A.muted,marginTop:3,lineHeight:1.5}}>{t.body}</div></div></div><div style={{display:"flex",gap:8}}><select defaultValue="all" id={`sel-${t.id}`} style={{...ais,flex:1,fontSize:11,padding:"6px 8px"}}><option value="all">Todos</option>{trips.map(tr=><option key={tr.id} value={tr.id}>{tr.flag} {tr.name.split(" ")[0]}</option>)}</select><button onClick={()=>{const sel=document.getElementById(`sel-${t.id}`);const v=sel?sel.value:"all";send(t.title,t.body,v==="all"?"all":"trip",v);}} disabled={sending} style={{...ab(`linear-gradient(90deg,${A.red},#c00020)`,"#fff"),padding:"6px 18px",borderRadius:8,fontSize:12,fontFamily:BF,flexShrink:0}}>{sending?"...":"Enviar"}</button></div></div>))}</div>)}
  </div>);}


// ══════════════════════════════════════════════════════════
// ATRIP INNER TABS (extracted as standalone for clarity)
// ══════════════════════════════════════════════════════════
function PeopleTab({trip,tc,clients,trips,sC,updTrip,updClient,passRef,upIdx,setUpIdx,passModal,setPassModal,chPassRef,addPass,hasUrgent,stFilterModal,setStFilterModal,rmModal,setRmModal,roomMenu,setRoomMenu,acmpModal,setAcmpModal,fpMenu,setFpMenu,setRoommate,setTab,viewPhoto,setViewPhoto}){
  const[listModal,setListModal]=useState(false);const[listView,setListView]=useState("confirmados");const[copied2,setCopied2]=useState(false);
  const[addModal,setAddModal]=useState(null);const[newPersonas,setNewPersonas]=useState([{nombre:"",email:""}]);
  const[exSearch,setExSearch]=useState("");const[exSelected,setExSelected]=useState([]);
  const confirmed=tc.filter(c=>c.status==="confirmado"||c.status==="pagado");
  const interesados=tc.filter(c=>c.status==="interesado");
  const allOtherClients=clients.filter(c=>c.tripId!==trip.id);
  const filteredEx=exSearch.trim()?allOtherClients.filter(c=>matchSearch(c.nombre,exSearch)||matchSearch(c.code,exSearch)):allOtherClients;
  const roomCounts={};Object.keys(ROOMS).forEach(k=>{roomCounts[k]=confirmed.filter(c=>(c.room||"doble_jun")===k).length;});
  const buildFlightList=()=>{if(!confirmed.length)return"Sin confirmados";const lines=[`✈️ FLIGHT LIST — ${trip.name.toUpperCase()}`,`${fmt(trip.date)}`,"","Nombre | Pasaporte | F.Nacimiento | Caducidad","---"];const seen=new Set();confirmed.forEach((c,i)=>{if(seen.has(c.id))return;seen.add(c.id);const bday=c.birthDate?new Date(c.birthDate+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";const exp=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";lines.push(`${lines.length-4}. ${c.nombre} | ${c.docNumero||"—"} | ${bday} | ${exp}`);(c.acompanantes||[]).forEach(a=>{const abday=a.birthDate?new Date(a.birthDate+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";const aexp=a.passportExpiry?new Date(a.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";lines.push(`   + ${a.nombre} | ${a.docNumero||"—"} | ${abday} | ${aexp}`);});});return lines.join("\n");};
  const buildList=()=>{if(!confirmed.length)return"Sin confirmados";const lines=[`${trip.flag} ${trip.name.toUpperCase()}`,`${fmt(trip.date)}`,`${confirmed.length} confirmados`,"---"];const byRoom={};Object.keys(ROOMS).forEach(k=>{byRoom[k]=[];});confirmed.forEach(c=>{const r=c.room||"doble_jun";if(byRoom[r])byRoom[r].push(c);});let hab=1;["doble_jun","doble_sep"].forEach(rk=>{if(!byRoom[rk]?.length)return;const roomInfo=ROOMS[rk];lines.push(`${roomInfo.short.toUpperCase()}`);const seen=new Set();byRoom[rk].forEach(c=>{if(seen.has(c.id))return;seen.add(c.id);const partner=c.roommateId?byRoom[rk].find(x=>x.id===c.roommateId):null;if(partner&&!seen.has(partner.id)){seen.add(partner.id);lines.push(` Hab ${hab++}: ${c.nombre} + ${partner.nombre}`);}else{lines.push(` Hab ${hab++}: ${c.nombre}`);}});});if(byRoom.individual?.length>0){lines.push(`INDIVIDUAL`);byRoom.individual.forEach(c=>lines.push(`  · ${c.nombre}`));}if(byRoom.triple?.length>0){lines.push(`TRIPLE`);byRoom.triple.forEach(c=>lines.push(`  · ${c.nombre}`));}return lines.join("\n");};
  const buildListI=()=>{if(!interesados.length)return"Sin interesados";return[`${trip.flag} ${trip.name}`,`${interesados.length} interesados`,"---",...interesados.map((c,i)=>`${i+1}. ${c.nombre} ${ROOMS[c.room||"doble_jun"]?.short||""}`)].join("\n");};
  const currentList=listView==="confirmados"?buildList():listView==="interesados"?buildListI():buildFlightList();

  return(
    <div style={{ padding:"0 16px" }}>
      <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
      {confirmed.length>0&&(<div style={{ background:A.card2,borderRadius:14,padding:"12px 14px",marginBottom:12,border:`1px solid ${A.border}` }}><div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>Resumen habitaciones</div><div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>{Object.entries(ROOMS).map(([k,r])=>roomCounts[k]>0&&(<div key={k} style={{ background:r.color+"15",border:`1px solid ${r.color}33`,borderRadius:10,padding:"8px 12px",textAlign:"center",minWidth:72 }}><div style={{ fontFamily:ANTON,fontSize:22,color:r.color,lineHeight:1 }}>{(k==="doble_jun"||k==="doble_sep")?Math.ceil(roomCounts[k]/2):k==="triple"?Math.ceil(roomCounts[k]/3):k==="cuadruple"?Math.ceil(roomCounts[k]/4):roomCounts[k]}</div><div style={{ fontSize:8,color:r.color,letterSpacing:1,textTransform:"uppercase",fontFamily:BF,marginTop:2 }}>{r.short}</div></div>))}</div></div>)}
      <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:10 }}>{ST.map(s=>{const n=tc.filter(c=>c.status===s.key).length;return(<div key={s.key} onClick={n>0?()=>setStFilterModal(s.key):undefined} style={{ flexShrink:0,background:A.card,borderRadius:10,padding:"8px 12px",border:`1px solid ${n>0?s.color+"44":A.border}`,minWidth:60,textAlign:"center",cursor:n>0?"pointer":"default",opacity:n===0?0.4:1 }}><div style={{ fontSize:14 }}>{s.emoji}</div><div style={{ fontFamily:ANTON,fontSize:18,color:s.color }}>{n}</div><div style={{ fontSize:8,color:A.muted,fontFamily:BF,letterSpacing:1 }}>{s.label}</div></div>);})}</div>
      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        <button onClick={()=>setAddModal("new")} style={{ ...ab(A.cyan+"22",A.cyan),flex:2,border:`1.5px dashed ${A.cyan}`,borderRadius:10,padding:"10px",fontFamily:BF }}>+ Nuevo viajero</button>
        <button onClick={()=>setAddModal("existing")} style={{ ...ab(A.purple+"22",A.purple),flex:2,border:`1.5px solid ${A.purple}44`,borderRadius:10,padding:"10px",fontSize:12,fontFamily:BF }}>Existente ({allOtherClients.length})</button>
        {(confirmed.length>0||interesados.length>0)&&<button onClick={()=>setListModal(true)} style={{ ...ab(A.green+"22",A.green),flex:1,border:`1.5px solid ${A.green}44`,borderRadius:10,padding:"10px",fontSize:12,fontFamily:BF }}>📋</button>}
      </div>
      {tc.length===0?<AEmpty text="Sin viajeros aún"/>:tc.map(c=>{
        const st=ST.find(s=>s.key===c.status)||ST[0];const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;const urgent=hasUrgent(c);
        const roommate=c.roommateId?clients.find(x=>x.id===c.roommateId):null;const fp=FORMAS_PAGO.find(f=>f.k===(c.formaPago||"transferencia"))||FORMAS_PAGO[0];
        return(
          <div key={c.id} style={{ background:A.card,borderRadius:14,padding:"12px 14px",marginBottom:10,border:`2px solid ${urgent?A.orange+"66":c.groupId?A.purple+"44":A.border+"44"}` }}>
            {urgent&&<div style={{ background:A.orange+"22",border:`1px solid ${A.orange}44`,borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:11,color:A.orange,fontFamily:BF,fontWeight:700 }}>⚠️ Pago próximo o vencido</div>}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
              <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto,cid:c.id,name:c.nombre,docNum:c.docNumero||"",expiry:isoToDisplay(c.passportExpiry||""),birthDate:isoToDisplay(c.birthDate||"")})):(setUpIdx(c.id),passRef.current.value="",passRef.current.click())}
                style={{ width:44,height:44,borderRadius:10,overflow:"hidden",cursor:"pointer",border:c.passportPhoto?`2px solid ${A.cyan}99`:`2px solid ${A.border}`,background:A.cyan+"22",flexShrink:0 }}>
                {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:18,color:A.cyan }}>{c.nombre[0]?.toUpperCase()}</div>}
              </div>
              <div style={{ flex:1,minWidth:0 }}><div style={{ fontFamily:ANTON,fontSize:16,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{c.nombre}</div><div style={{ fontSize:10,color:st.color,fontFamily:BF }}>{st.emoji} {st.label}</div></div>
              <button onClick={()=>{ if(window.confirm(`¿Sacar a ${c.nombre} de este viaje?`)) sC(clients.map(x=>x.id===c.id?{...x,tripId:null,roommateId:null}:x)); }} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }} title="Sacar del viaje">✕</button>
            </div>
            <div style={{ display:"flex",gap:6,marginBottom:6,flexWrap:"wrap" }}>
              <button onClick={()=>setRoomMenu(c.id)} style={{ background:rm.color+"22",border:`1.5px solid ${rm.color}55`,color:rm.color,borderRadius:9,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:BF }}>{rm.label} ▾</button>
              <select value={c.status} onChange={e=>updClient(c.id,x=>({...x,status:e.target.value}))} style={{ background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,padding:"5px 8px",fontSize:11,cursor:"pointer",fontFamily:BF }}>{ST_SELECT.map(s=><option key={s.key} value={s.key}>{s.emoji} {s.label}</option>)}</select>
              <button onClick={()=>setFpMenu(c.id)} style={{ background:A.cyan+"15",border:`1.5px solid ${A.cyan}33`,color:A.cyan,borderRadius:9,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:BF }}>{fp.icon} {fp.label} ▾</button>
            </div>
            <div style={{ display:"flex",gap:6,marginBottom:6 }}>
              <button onClick={()=>go("client",{cid:c.id})} style={{ ...ab(A.purple+"22",A.purple),flex:1,border:`1px solid ${A.purple}44`,borderRadius:8,padding:"6px",fontSize:11,fontFamily:BF }}>Ver portal</button>
              <button onClick={()=>setRmModal(c.id)} style={{ ...ab(roommate?A.cyan+"15":A.card2,roommate?A.cyan:A.muted),flex:1,border:`1px solid ${roommate?A.cyan+"33":A.border}`,borderRadius:8,padding:"6px",fontSize:10,fontFamily:BF }}>{roommate?roommate.nombre.split(" ")[0]:"Compañero/a"}</button>
            </div>
            <input value={c.note||""} onChange={e=>updClient(c.id,x=>({...x,note:e.target.value}))} placeholder="Anotación..." style={{ ...ais,padding:"7px 10px",fontSize:15,color:A.muted,background:A.bg,borderColor:A.border+"66" }}/>
            <div style={{ display:"flex",gap:6,marginTop:6 }}>
              {(()=>{const link=`${window.location.href.split("#")[0]}#${c.code}`;const[cop,setCop]=useState(false);const trip2=trips.find(t=>t.id===c.tripId);const wa=()=>{const msg=trip2?`Hola ${c.nombre.split(" ")[0]}!\n\nPortal ${trip2.name}:\n${link}`:`Hola ${c.nombre.split(" ")[0]}!\n\nPortal Travelike:\n${link}`;window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,"_blank");};return(<><button onClick={()=>{navigator.clipboard.writeText(link).then(()=>{setCop(true);setTimeout(()=>setCop(false),2000);});}} style={{ ...ab(cop?A.green+"22":A.cyan+"15",cop?A.green:A.cyan),flex:1,border:`1px solid ${cop?A.green:A.cyan}44`,padding:"6px 8px",fontSize:11,borderRadius:8,fontFamily:BF }}>{cop?"¡Copiado!":"🔗 Link"}</button><button onClick={wa} style={{ ...ab(A.green+"15",A.green),flex:1,border:`1px solid ${A.green}44`,padding:"6px 8px",fontSize:11,borderRadius:8,fontFamily:BF }}>💬 WhatsApp</button></>);})()}
            </div>
            {c.consentDate&&(<div style={{ marginTop:6,background:A.green+"10",border:`1px solid ${A.green}33`,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:6 }}><span style={{ fontSize:12 }}>✅</span><div style={{ flex:1 }}><span style={{ fontFamily:BF,fontSize:10,color:A.green,fontWeight:700 }}>Condiciones firmadas</span><span style={{ fontFamily:BF,fontSize:9,color:A.muted,marginLeft:8 }}>{new Date(c.consentDate).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}</span></div>{c.consentRGPD&&<span style={{ fontSize:8,padding:"2px 5px",background:A.cyan+"20",border:`1px solid ${A.cyan}33`,borderRadius:4,color:A.cyan,fontFamily:BF }}>RGPD</span>}{c.consentPasaporte&&<span style={{ fontSize:8,padding:"2px 5px",background:A.green+"20",border:`1px solid ${A.green}33`,borderRadius:4,color:A.green,fontFamily:BF }}>Pasaporte</span>}</div>)}
            <div style={{ marginTop:10,background:c.docVerified?A.green+"0e":A.bg,borderRadius:12,border:`2px solid ${c.docVerified?A.green+"55":c.docNumero?A.cyan+"44":A.border+"33"}`,overflow:"hidden" }}>
              <div style={{ padding:"8px 12px",background:c.docVerified?A.green+"18":A.card2,display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${c.docVerified?A.green+"33":A.border+"33"}` }}>
                <span style={{ fontSize:14 }}>🛂</span><span style={{ fontFamily:BF,fontSize:10,letterSpacing:2,textTransform:"uppercase",color:c.docVerified?A.green:A.muted,flex:1,fontWeight:700 }}>Verificación de documento</span>
                {c.docVerified?<span style={{ fontFamily:BF,fontSize:9,color:A.green,fontWeight:700 }}>✓ VERIFICADO</span>:c.docNumero?<span style={{ fontFamily:BF,fontSize:9,color:A.orange,fontWeight:700 }}>⚠️ PENDIENTE</span>:<span style={{ fontFamily:BF,fontSize:9,color:A.muted }}>Sin datos</span>}
              </div>
              <div style={{ display:"flex",gap:12,padding:"12px" }}>
                <div onClick={()=>c.passportPhoto?(setPassModal({src:c.passportPhoto,cid:c.id,name:c.nombre,docNum:c.docNumero||"",expiry:isoToDisplay(c.passportExpiry||""),birthDate:isoToDisplay(c.birthDate||"")})):(setUpIdx(c.id),passRef.current.value="",passRef.current.click())}
                  style={{ width:72,height:90,borderRadius:10,overflow:"hidden",cursor:"pointer",border:c.passportPhoto?`2px solid ${A.cyan}99`:`2px dashed ${A.border}`,background:A.card,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  {c.passportPhoto?<img src={c.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>:<div style={{ textAlign:"center" }}><div style={{ fontSize:24 }}>📷</div><div style={{ fontFamily:BF,fontSize:8,color:A.muted,marginTop:2 }}>Subir</div></div>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Nº Pasaporte / DNI</div>
                  <input key={c.id+"_doc"} defaultValue={c.docNumero||""} onBlur={e=>updClient(c.id,x=>({...x,docNumero:e.target.value.toUpperCase(),docVerified:false}))} placeholder="—" style={{ ...ais,fontFamily:ANTON,fontSize:26,letterSpacing:4,textAlign:"center",color:A.cyan,padding:"8px 10px",marginBottom:8,background:A.card }}/>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                    <div><div style={{ fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>F. Nacimiento</div><input key={c.id+"_bday"} type="text" inputMode="numeric" placeholder="DD-MM-AAAA" defaultValue={isoToDisplay(c.birthDate||"")} onChange={e=>{const raw=e.target.value.replace(/[^0-9]/g,"");let fmt=raw;if(raw.length>2)fmt=raw.slice(0,2)+"-"+raw.slice(2);if(raw.length>4)fmt=raw.slice(0,2)+"-"+raw.slice(2,4)+"-"+raw.slice(4,8);e.target.value=fmt;}} onBlur={e=>updClient(c.id,x=>({...x,birthDate:displayToISO(e.target.value)}))} maxLength={10} style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:13,color:A.gold,background:A.card,border:`1px solid ${A.gold}44`}}/></div>
                    <div><div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Caducidad</div><input key={c.id+"_exp"} type="text" inputMode="numeric" placeholder="DD-MM-AAAA" defaultValue={isoToDisplay(c.passportExpiry||"")} onChange={e=>{const raw=e.target.value.replace(/[^0-9]/g,"");let fmt=raw;if(raw.length>2)fmt=raw.slice(0,2)+"-"+raw.slice(2);if(raw.length>4)fmt=raw.slice(0,2)+"-"+raw.slice(2,4)+"-"+raw.slice(4,8);e.target.value=fmt;}} onBlur={e=>updClient(c.id,x=>({...x,passportExpiry:displayToISO(e.target.value),passportExpiryDismissed:false}))} maxLength={10} style={{ ...ais,textAlign:"center",fontFamily:ANTON,fontSize:13,color:passportWarn(c.passportExpiry)?A.orange:A.text,background:A.card,border:`1px solid ${passportWarn(c.passportExpiry)?A.orange+"44":A.border+"44"}`}}/></div>
                  </div>
                </div>
              </div>
              <label style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 12px",background:c.docVerified?A.green+"18":A.card2,borderTop:`1px solid ${c.docVerified?A.green+"33":A.border+"22"}` }}>
                <input type="checkbox" checked={!!c.docVerified} onChange={e=>updClient(c.id,x=>({...x,docVerified:e.target.checked}))} style={{ width:20,height:20,accentColor:A.green,flexShrink:0 }}/>
                <span style={{ fontFamily:BF,fontSize:12,color:c.docVerified?A.green:A.muted,fontWeight:700,lineHeight:1.4 }}>He comprobado la foto del pasaporte y el nº de documento es correcto</span>
              </label>
            </div>
          </div>
        );
      })}
      <input ref={passRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0]&&upIdx) addPass(e.target.files[0],upIdx); setUpIdx(null); }}/>
      {passModal&&(<PassportModal modal={passModal} onClose={()=>setPassModal(null)} onSave={(docNum,expiry,birthDate)=>{updClient(passModal.cid,c=>({...c,docNumero:docNum,passportExpiry:displayToISO(expiry),birthDate:displayToISO(birthDate),passportExpiryDismissed:false,docVerified:false}));setPassModal(null);}} onChangePhoto={()=>{chPassRef.current.value="";chPassRef.current.click();}} onDelete={()=>{updClient(passModal.cid,c=>({...c,passportPhoto:null,docNumero:"",passportExpiry:"",docVerified:false}));setPassModal(null);}}/>)}
      {rmModal&&<AModal title="Compañero/a de hab." onClose={()=>setRmModal(null)}>{tc.filter(x=>x.id!==rmModal).map(c=>{const sel=clients.find(x=>x.id===rmModal)?.roommateId===c.id;const rm2=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;return(<button key={c.id} onClick={()=>{setRoommate(rmModal,c.id);setRmModal(null);}} style={{ ...ab(sel?A.cyan+"22":A.card2,sel?A.cyan:A.text),width:"100%",marginBottom:8,textAlign:"left",border:`1.5px solid ${sel?A.cyan:A.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}><div style={{ width:36,height:36,borderRadius:8,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:15,color:A.cyan,flexShrink:0 }}>{c.nombre[0]}</div><div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700 }}>{c.nombre}</div><div style={{ fontSize:11,color:rm2.color,fontFamily:BF }}>{rm2.label}</div></div>{sel&&<span style={{ marginLeft:"auto",color:A.cyan,fontSize:18 }}>✓</span>}</button>);}}{clients.find(x=>x.id===rmModal)?.roommateId&&<button onClick={()=>{setRoommate(rmModal,null);setRmModal(null);}} style={{ ...ab(A.red+"15",A.red),width:"100%",border:`1px solid ${A.red}33`,borderRadius:10,marginTop:4,fontFamily:BF }}>Quitar</button>}</AModal>}
      {roomMenu&&<RoomMenu current={clients.find(c=>c.id===roomMenu)?.room||"doble_jun"} onSelect={r=>updClient(roomMenu,c=>({...c,room:r}))} onClose={()=>setRoomMenu(null)}/>}
      {fpMenu&&<FormaPagoMenu current={clients.find(c=>c.id===fpMenu)?.formaPago||"transferencia"} onSelect={fp=>updClient(fpMenu,c=>({...c,formaPago:fp}))} onClose={()=>setFpMenu(null)}/>}
      {acmpModal&&<AcompModal clientId={acmpModal} clients={clients} updClient={updClient} trip={trip} onClose={()=>setAcmpModal(null)}/>}
      {listModal&&(<div style={{ position:"fixed",inset:0,zIndex:2000,background:A.bg,display:"flex",flexDirection:"column",overflowY:"auto" }}>
        <div style={{ position:"sticky",top:0,zIndex:10,background:A.bg,borderBottom:`1px solid ${A.border}`,padding:"14px 20px 0" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
            <button onClick={()=>setListModal(false)} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:22,cursor:"pointer",lineHeight:1,padding:0 }}>←</button>
            <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1 }}>{trip.flag} {trip.name.toUpperCase()}</div><div style={{ fontFamily:BF,fontSize:11,color:A.muted }}>{fmt(trip.date)}</div></div>
            <button onClick={()=>{navigator.clipboard.writeText(currentList).then(()=>{setCopied2(true);setTimeout(()=>setCopied2(false),2500);});}} style={{ ...ab(copied2?A.green:A.card2,copied2?A.bg:A.cyan),border:`1.5px solid ${copied2?A.green:A.cyan}44`,borderRadius:10,padding:"8px 16px",fontFamily:BF,fontSize:12,fontWeight:700 }}>{copied2?"✓ Copiado":"Copiar"}</button>
          </div>
          <div style={{ display:"flex",gap:6,paddingBottom:0 }}>
            {[["confirmados","🛏","Rooming",A.green,confirmed.length],["vuelo","✈️","Flight List",A.cyan,null],["interesados","👀","Interesados",A.orange,interesados.length]].map(([key,ic,lbl,col,cnt])=>(<button key={key} onClick={()=>{setListView(key);setCopied2(false);}} style={{ flex:1,background:"transparent",border:"none",borderBottom:`3px solid ${listView===key?col:"transparent"}`,color:listView===key?col:A.muted,padding:"8px 4px 10px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer"}}>{ic} {lbl}{cnt!=null?` (${cnt})`:""}</button>))}
          </div>
        </div>
        <div style={{ padding:"20px 20px 120px" }}>
          {listView==="vuelo"&&(<div>
            <div style={{ fontFamily:BF,fontSize:12,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:18 }}>{confirmed.length} pasajeros totales</div>
            {confirmed.map((c,num)=>{
              const pbday=c.birthDate?new Date(c.birthDate+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";
              const pexp=c.passportExpiry?new Date(c.passportExpiry+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";
              const pexpWarn=passportWarn(c.passportExpiry);
              return(<div key={c.id} style={{ background:A.card,borderRadius:16,marginBottom:10,border:`1.5px solid ${A.border}`,overflow:"hidden" }}>
                <div style={{ padding:"12px 18px",borderBottom:`1px solid ${A.border}33`,display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ fontFamily:ANTON,fontSize:28,color:A.cyan,lineHeight:1,width:36,textAlign:"center" }}>{num+1}</div>
                  <div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:22,color:A.text,lineHeight:1.1 }}>{c.nombre}</div></div>
                  <CopyBtn text={c.nombre}/>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:A.border+"33" }}>
                  <div style={{ background:A.card,padding:"14px 12px" }}><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}><div style={{ fontFamily:BF,fontSize:9,color:A.gold,letterSpacing:2,textTransform:"uppercase" }}>Nacimiento</div><CopyBtn text={pbday}/></div><div style={{ fontFamily:ANTON,fontSize:18,color:A.gold,lineHeight:1.2 }}>{pbday}</div></div>
                  <div style={{ background:A.card,padding:"14px 12px" }}><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}><div style={{ fontFamily:BF,fontSize:9,color:pexpWarn?A.orange:A.muted,letterSpacing:2,textTransform:"uppercase" }}>Caducidad</div><CopyBtn text={pexp}/></div><div style={{ fontFamily:ANTON,fontSize:18,color:pexpWarn?A.orange:A.text,lineHeight:1.2 }}>{pexp}{pexpWarn?" ⚠️":""}</div></div>
                  <div style={{ background:A.card,padding:"14px 12px" }}><div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}><div style={{ fontFamily:BF,fontSize:9,color:c.docNumero?A.cyan:A.red,letterSpacing:2,textTransform:"uppercase" }}>Pasaporte</div>{c.docNumero&&<CopyBtn text={c.docNumero}/>}</div><div style={{ fontFamily:ANTON,fontSize:18,color:c.docNumero?A.cyan:A.red,lineHeight:1.2,wordBreak:"break-all" }}>{c.docNumero||"—"}</div></div>
                </div>
              </div>);
            })}
          </div>)}
          {listView==="interesados"&&(<div>
            <div style={{ fontFamily:BF,fontSize:12,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:18 }}>{interesados.length} interesados</div>
            {interesados.map((c,i)=>{const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;return(<div key={c.id} style={{ background:A.card,borderRadius:16,marginBottom:10,border:`1.5px solid ${A.orange}33`,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}><div style={{ fontFamily:ANTON,fontSize:24,color:A.orange,width:36,textAlign:"center",lineHeight:1 }}>{i+1}</div><div style={{ width:46,height:46,borderRadius:12,overflow:"hidden",flexShrink:0,background:A.orange+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:20,color:A.orange }}>{c.passportPhoto?<img src={c.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:c.nombre[0]}</div><div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:20,color:A.text,lineHeight:1.1 }}>{c.nombre}</div><div style={{ fontFamily:BF,fontSize:12,color:rm.color,marginTop:3 }}>{rm.label}</div></div></div>);})}
          </div>)}
          {listView==="confirmados"&&(<div>
            <div style={{ fontFamily:BF,fontSize:12,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:18 }}>{confirmed.length} confirmados</div>
            {confirmed.map((c,i)=>{const rm=ROOMS[c.room||"doble_jun"]||ROOMS.doble_jun;return(<div key={c.id} style={{ background:A.card,borderRadius:16,marginBottom:10,border:`1.5px solid ${rm.color}33`,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}><div style={{ fontFamily:ANTON,fontSize:24,color:rm.color,width:36,textAlign:"center",lineHeight:1 }}>{i+1}</div><div style={{ width:46,height:46,borderRadius:12,overflow:"hidden",flexShrink:0,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:20,color:A.cyan }}>{c.passportPhoto?<img src={c.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:c.nombre[0]}</div><div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:20,color:A.text,lineHeight:1.1 }}>{c.nombre}</div><div style={{ fontFamily:BF,fontSize:12,color:rm.color,marginTop:3 }}>{rm.label}</div></div><CopyBtn text={c.nombre}/></div>);})}
          </div>)}
        </div>
        <div style={{ position:"fixed",bottom:0,left:0,right:0,padding:"12px 20px",background:A.bg,borderTop:`1px solid ${A.border}`,zIndex:10 }}>
          <button onClick={()=>{navigator.clipboard.writeText(currentList).then(()=>{setCopied2(true);setTimeout(()=>setCopied2(false),2500);});}} style={{ ...ab(copied2?A.green:A.cyan,copied2?A.bg:"#000"),width:"100%",borderRadius:14,padding:"15px",fontFamily:ANTON,fontSize:16,letterSpacing:1,border:"none" }}>{copied2?"✓ ¡TEXTO COPIADO!":"📋 COPIAR LISTA DE TEXTO"}</button>
        </div>
      </div>)}
      {stFilterModal&&<FilteredListModal title={`${ST.find(s=>s.key===stFilterModal)?.emoji} ${ST.find(s=>s.key===stFilterModal)?.label}`} clients={tc.filter(c=>c.status===stFilterModal)} onClose={()=>setStFilterModal(null)}/>}
      {addModal==="new"&&(<AModal title="Nuevo viajero" onClose={()=>{setAddModal(null);setNewPersonas([{nombre:"",email:""}]);}}>
        <div style={{ fontSize:13,color:A.muted,fontFamily:BF,marginBottom:14 }}>Añade una o varias personas.</div>
        {newPersonas.map((p,i)=>(<div key={i} style={{ background:A.bg,borderRadius:12,padding:"12px",marginBottom:8,border:`1px solid ${i===0?A.cyan+"44":A.purple+"44"}` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}><div style={{ fontFamily:BF,fontSize:10,color:i===0?A.cyan:A.purple,letterSpacing:2,textTransform:"uppercase",fontWeight:700 }}>{i===0?"Persona principal":`Persona ${i+1}`}</div>{i>0&&<button onClick={()=>setNewPersonas(ps=>ps.filter((_,j)=>j!==i))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",lineHeight:1 }}>✕</button>}</div><input value={p.nombre} onChange={e=>setNewPersonas(ps=>ps.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} placeholder="Nombre completo" style={{ ...ais,marginBottom:8 }}/><input value={p.email} onChange={e=>setNewPersonas(ps=>ps.map((x,j)=>j===i?{...x,email:e.target.value}:x))} placeholder="Email (opcional)" type="email" style={ais}/></div>))}
        <button onClick={()=>setNewPersonas(ps=>[...ps,{nombre:"",email:""}])} style={{ ...ab(A.purple+"22",A.purple),width:"100%",border:`1.5px dashed ${A.purple}`,borderRadius:10,marginBottom:14,fontFamily:BF }}>+ Añadir otra persona</button>
        <ARow>
          <button onClick={()=>{setAddModal(null);setNewPersonas([{nombre:"",email:""}]);}} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button>
          <button onClick={()=>{const valid=newPersonas.filter(p=>p.nombre.trim());if(!valid.length)return;const groupId=valid.length>1?`g${uid()}`:null;const nuevos=valid.map(p=>({id:`cl${uid()}`,nombre:p.nombre.trim(),email:p.email||"",tripId:trip.id,code:genCode(),status:"interesado",room:"doble_jun",note:"",pagosEstado:(trip.pagosConfig||[]).map(()=>"pendiente"),pagosImporteCustom:(trip.pagosConfig||[]).map(()=>null),personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,passportExpiry:"",passportExpiryDismissed:false,notifEnabled:false,roommateId:null,surveySubmitted:false,acompanantes:[],maletaPersonal:[],maletaMarcados:[],formaPago:"transferencia",docNumero:"",docVerified:false,groupId}));sC([...clients,...nuevos]);setAddModal(null);setNewPersonas([{nombre:"",email:""}]);}} style={{ ...ab(A.cyan,A.bg),flex:2 }}>{newPersonas.filter(p=>p.nombre.trim()).length>1?`Añadir grupo (${newPersonas.filter(p=>p.nombre.trim()).length})`:"Añadir"}</button>
        </ARow>
      </AModal>)}
      {addModal==="existing"&&(<AModal title="Añadir viajeros existentes" onClose={()=>{setAddModal(null);setExSearch("");setExSelected([]);}}>
        <SearchBar value={exSearch} onChange={setExSearch} placeholder="Buscar..."/>
        {filteredEx.length===0?<AEmpty text="Sin clientes disponibles"/>:filteredEx.map(c=>{const sel=exSelected.includes(c.id);const cTrip=c.tripId?trips.find(t=>t.id===c.tripId):null;return(<button key={c.id} onClick={()=>setExSelected(prev=>sel?prev.filter(x=>x!==c.id):[...prev,c.id])} style={{ ...ab(sel?A.cyan+"22":A.card2,A.text),width:"100%",marginBottom:8,textAlign:"left",border:`2px solid ${sel?A.cyan:A.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}><div style={{ width:36,height:36,borderRadius:8,background:sel?A.cyan+"33":A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:15,color:A.cyan,flexShrink:0,overflow:"hidden" }}>{c.passportPhoto?<img src={c.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:6}} alt=""/>:c.nombre[0]}</div><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:sel?A.cyan:A.text }}>{c.nombre}</div><div style={{ fontSize:10,color:cTrip?A.orange:A.muted,fontFamily:BF }}>{cTrip?`${cTrip.flag} ${cTrip.name}`:"Sin viaje"} · {c.code}</div></div><span style={{ color:sel?A.cyan:A.muted,fontSize:20,fontWeight:700 }}>{sel?"✓":"+"}</span></button>);})}
        {exSelected.length>0&&<div style={{ position:"sticky",bottom:0,background:A.card2,borderRadius:12,padding:"12px",marginTop:8,border:`1px solid ${A.cyan}44` }}><button onClick={()=>{sC(clients.map(x=>exSelected.includes(x.id)?{...x,tripId:trip.id,pagosEstado:(trip.pagosConfig||[]).map(()=>"pendiente"),pagosImporteCustom:(trip.pagosConfig||[]).map(()=>null)}:x));setAddModal(null);setExSearch("");setExSelected([]);}} style={{ ...ab(`linear-gradient(90deg,${A.cyan},#0099bb)`,A.bg),width:"100%",borderRadius:10,fontFamily:BF,fontSize:14 }}>✓ Añadir {exSelected.length} viajero{exSelected.length!==1?"s":""} al viaje</button></div>}
      </AModal>)}
    </div>
  );
}

function PagosTab({trip,tc,clients,updTrip,updClient,setRegistroPagoModal,setTab}){
  const pc=trip.pagosConfig||[];const allPeople=[...tc,...tc.flatMap(c=>(c.acompanantes||[]).map(a=>({...a,_pN:c.nombre})))];
  const[editImpModal,setEditImpModal]=useState(null);const[newImp,setNewImp]=useState("");const[editFP,setEditFP]=useState("transferencia");
  const[editPcModal,setEditPcModal]=useState(null);const[pcLabel,setPcLabel]=useState("");const[pcImporte,setPcImporte]=useState("");
  const hasUrgent=c=>(trip.pagosConfig||[]).some((p,i)=>{const st=(c.pagosEstado||[])[i];return st!=="pagado"&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO));});
  const saveImp=()=>{if(!editImpModal)return;updClient(editImpModal.cid,c=>{const ai=[...(c.pagosImporteCustom||pc.map(()=>null))];ai[editImpModal.pidx]=newImp?`${newImp}€`:null;const afp=[...(c.pagosFormaPago||pc.map(()=>"transferencia"))];afp[editImpModal.pidx]=editFP;return{...c,pagosImporteCustom:ai,pagosFormaPago:afp};});setEditImpModal(null);};
  const savePc=()=>{if(editPcModal===null)return;updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===editPcModal?{...x,label:pcLabel,importe:pcImporte}:x)}));setEditPcModal(null);};
  return(
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
        {pc.map((p,i)=>{const paid=allPeople.filter(c=>(c.pagosEstado||[])[i]==="pagado").length;const pct=allPeople.length>0?Math.round(paid/allPeople.length*100):0;const urg=isUrgent(p.fechaISO);const ovd=isOverdue(p.fechaISO);return(<div key={i} style={{ flexShrink:0,background:A.card,borderRadius:12,padding:"10px 14px",border:`1px solid ${ovd?A.red+"44":urg?A.orange+"44":A.cyan+"22"}`,minWidth:110,position:"relative" }}>
          <button onClick={()=>{setPcLabel(p.label);setPcImporte(p.importe||"");setEditPcModal(i);}} style={{ position:"absolute",top:6,right:6,background:"transparent",border:"none",cursor:"pointer",fontSize:11,color:A.muted,lineHeight:1,padding:2 }}>✏️</button>
          <div style={{ fontSize:9,color:ovd?A.red:urg?A.orange:A.muted,letterSpacing:2,textTransform:"uppercase",fontFamily:BF,marginBottom:4,paddingRight:16 }}>{p.label}</div>
          <div style={{ fontFamily:ANTON,fontSize:24,color:paid===allPeople.length&&allPeople.length>0?A.green:A.cyan,lineHeight:1 }}>{paid}<span style={{ fontSize:12,color:A.muted }}>/{allPeople.length}</span></div>
          {p.importe&&<div style={{ fontSize:10,color:A.gold,fontFamily:BF,marginTop:2 }}>{p.importe}</div>}
          <div style={{ height:3,background:A.border,borderRadius:2,marginTop:6 }}><div style={{ height:"100%",width:`${pct}%`,background:paid===allPeople.length&&allPeople.length>0?A.green:ovd?A.red:urg?A.orange:A.cyan,borderRadius:2 }}/></div>
        </div>);})}
      </div>
      {tc.length===0?<AEmpty text="Sin viajeros"/>:(
        <div style={{ background:A.card,borderRadius:14,overflow:"hidden",border:`1px solid ${A.border}` }}>
          <div style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid ${A.border}`,background:A.card2 }}>
            <div style={{ padding:"10px 14px",fontSize:9,color:A.muted,fontFamily:BF,letterSpacing:2 }}>Viajero</div>
            {pc.map((p,i)=><div key={i} style={{ padding:"10px 8px",fontSize:9,color:A.cyan,fontFamily:BF,letterSpacing:1,textAlign:"center",borderLeft:`1px solid ${A.border}` }}>{p.label}</div>)}
          </div>
          {tc.map(c=>{const pe=c.pagosEstado||pc.map(()=>"pendiente");const allPaid=pe.every(s=>s==="pagado");const urgent=hasUrgent(c);return(
            <div key={c.id} style={{ display:"grid",gridTemplateColumns:`1fr ${pc.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid ${A.border}44`,background:allPaid?A.green+"08":urgent?A.orange+"06":"transparent" }}>
              <div style={{ padding:"10px 14px",display:"flex",alignItems:"center",gap:6 }}><div style={{ width:26,height:26,borderRadius:6,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:12,color:A.cyan,flexShrink:0 }}>{c.nombre[0]?.toUpperCase()}</div><div style={{ fontFamily:ANTON,fontSize:12,color:A.text,lineHeight:1 }}>{c.nombre.split(" ")[0]}</div></div>
              {pc.map((p,i)=>{const done=pe[i]==="pagado";const urg2=!done&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO));const customImp=(c.pagosImporteCustom||[])[i];const cellFP=FORMAS_PAGO.find(f=>f.k===((c.pagosFormaPago||[])[i]||c.formaPago||"transferencia"))||FORMAS_PAGO[0];return(
                <div key={i} style={{ borderLeft:`1px solid ${A.border}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,position:"relative" }}>
                  <button onClick={()=>updClient(c.id,x=>{const arr=[...(x.pagosEstado||pc.map(()=>"pendiente"))];arr[i]=arr[i]==="pagado"?"pendiente":"pagado";return{...x,pagosEstado:arr};})} style={{ width:"100%",flex:1,background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 2px",gap:1 }}>
                    <div style={{ fontFamily:ANTON,fontSize:16,color:done?A.green:urg2?A.orange:A.muted,lineHeight:1 }}>{done?"✓":urg2?"!":"-"}</div>
                    {customImp&&<div style={{ fontSize:7,color:A.gold,fontFamily:BF }}>{customImp}</div>}
                    <div style={{ fontSize:9 }}>{cellFP.icon}</div>
                  </button>
                  <button onClick={()=>{const curFP=(c.pagosFormaPago||[])[i]||c.formaPago||"transferencia";setNewImp((c.pagosImporteCustom||[])[i]?.replace(/[^\d.]/g,"")||pc[i].importe?.replace(/[^\d.]/g,"")||"");setEditFP(curFP);setEditImpModal({cid:c.id,pidx:i});}} style={{ fontSize:9,color:A.muted,background:"transparent",border:"none",cursor:"pointer",paddingBottom:4,fontFamily:BF }}>✏️</button>
                </div>
              );})}
            </div>
          );})}
        </div>
      )}
      {editImpModal&&(<AModal title="Editar pago" onClose={()=>setEditImpModal(null)}>
        <div style={{ fontFamily:BF,fontSize:13,color:A.muted,marginBottom:12 }}><strong style={{ color:A.text }}>{clients.find(c=>c.id===editImpModal.cid)?.nombre}</strong> — {pc[editImpModal.pidx]?.label}</div>
        <div style={{ background:A.card,border:`1px solid ${A.border}`,borderRadius:10,padding:"16px",fontSize:28,fontFamily:ANTON,color:A.cyan,textAlign:"right",marginBottom:12 }}>{newImp||"0"} €</div>
        <AmountPad value={newImp} onChange={setNewImp}/>
        <div style={{ marginTop:14,marginBottom:4,fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase" }}>Forma de pago</div>
        <div style={{ display:"flex",gap:8,marginBottom:16 }}>{FORMAS_PAGO.map(f=>(<button key={f.k} onClick={()=>setEditFP(f.k)} style={{ flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",fontFamily:BF,fontSize:12,border:`2px solid ${editFP===f.k?A.cyan:A.border}`,background:editFP===f.k?A.cyan+"22":A.card2,color:editFP===f.k?A.cyan:A.muted,fontWeight:editFP===f.k?700:400 }}>{f.icon} {f.label}</button>))}</div>
        <ARow><button onClick={()=>setEditImpModal(null)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button><button onClick={saveImp} style={{ ...ab(A.gold,A.bg),flex:2 }}>Guardar</button></ARow>
      </AModal>)}
      {editPcModal!==null&&(<AModal title="Editar hito de pago" onClose={()=>setEditPcModal(null)}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Nombre del hito</div>
        <input value={pcLabel} onChange={e=>setPcLabel(e.target.value)} placeholder="Ej: Reserva, Pago final..." style={{ ...ais,marginBottom:14 }}/>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Importe base</div>
        <input value={pcImporte} onChange={e=>setPcImporte(e.target.value)} placeholder="Ej: 500€" style={{ ...ais,marginBottom:16 }}/>
        <ARow><button onClick={()=>{if((trip.pagosConfig||[]).length>1)updTrip(t=>({...t,pagosConfig:t.pagosConfig.filter((_,j)=>j!==editPcModal)}));setEditPcModal(null);}} style={{ ...ab(A.red+"15",A.red),flex:1,border:`1px solid ${A.red}33` }}>Borrar</button><button onClick={()=>setEditPcModal(null)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}` }}>Cancelar</button><button onClick={savePc} style={{ ...ab(A.cyan,A.bg),flex:2 }}>Guardar</button></ARow>
      </AModal>)}
    </div>
  );
}


function FinanzasTab({trip,tc,clients,trips,updTrip,setTab}){
  const[unlocked,setUnlocked]=useState(false);const[showPin,setShowPin]=useState(false);
  const gastos=trip.gastos||[];const facturas=trip.facturas||[];const pc=trip.pagosConfig||[];
  const[showGastoForm,setShowGastoForm]=useState(false);const[tipoMenu,setTipoMenu]=useState(false);
  const[gTipo,setGTipo]=useState("vuelo");const[gDesc,setGDesc]=useState("");const[gImporte,setGImporte]=useState("");
  const[gCurrency,setGCurrency]=useState(trip.currency||"EUR");const[gFecha,setGFecha]=useState(new Date().toISOString().split("T")[0]);
  const[gNota,setGNota]=useState("");const[gImporteEUR,setGImporteEUR]=useState("");const[converting,setConverting]=useState(false);
  const[currMenu,setCurrMenu]=useState(false);const[showStats,setShowStats]=useState(false);
  const facturaRef=useRef();const[expandedGasto,setExpandedGasto]=useState(null);
  const gastoFacturaRef=useRef();const[downloadingZip,setDownloadingZip]=useState(false);

  useEffect(()=>{if(!gImporte||!+gImporte){setGImporteEUR("");return;}if(gCurrency==="EUR"){setGImporteEUR(gImporte);return;}setConverting(true);const t=setTimeout(async()=>{const eur=await convertToEUR(+gImporte,gCurrency);setGImporteEUR(String(eur));setConverting(false);},600);return()=>clearTimeout(t);},[gImporte,gCurrency]);

  const totalGastos=gastos.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
  const totalIngresos=tc.reduce((sum,c)=>{const pe=c.pagosEstado||pc.map(()=>"pendiente");return sum+pc.reduce((s2,p,i)=>{const imp=(c.pagosImporteCustom||[])[i]!=null?(+(c.pagosImporteCustom||[])[i].replace(/[^\d.]/g,"")||0):(+p.importe?.replace(/[^\d.]/g,"")||0);return s2+(pe[i]==="pagado"?imp:0);},0);},0);
  const beneficio=totalIngresos-totalGastos;
  const tipoInfo=k=>GASTO_TIPOS.find(t=>t.k===k)||GASTO_TIPOS[0];
  const sym=getCurrencySymbol(gCurrency);

  const addGasto=()=>{if(!gImporte||+gImporte<=0)return;const importeEUR=gCurrency==="EUR"?+gImporte:+(gImporteEUR||gImporte);updTrip(t=>({...t,gastos:[...(t.gastos||[]),{id:uid(),tipo:gTipo,descripcion:gDesc,importe:+gImporte,currency:gCurrency,importeEUR,fecha:gFecha,nota:gNota,facturas:[]}]}));setGTipo("vuelo");setGDesc("");setGImporte("");setGImporteEUR("");setGFecha(new Date().toISOString().split("T")[0]);setGNota("");setShowGastoForm(false);};
  const delGasto=id=>updTrip(t=>({...t,gastos:(t.gastos||[]).filter(g=>g.id!==id)}));
  const addFacturaGasto=async(e,gastoId)=>{const f=e.target.files[0];if(!f)return;const b64=await fileToB64(f);const gasto=gastos.find(g=>g.id===gastoId);const ext=f.type?.includes("pdf")?"pdf":f.type?.includes("png")?"png":"jpg";const importe=gasto?.importeEUR||gasto?.importe;const tipoLabel=(tipoInfo(gasto?.tipo||"otros").label||"factura").toLowerCase().replace(/\s/g,"_");const nombre=importe?`${importe}€_${tipoLabel}.${ext}`:f.name;updTrip(t=>({...t,facturas:[...(t.facturas||[]),{id:uid(),nombre,tipo:f.type,data:b64,fecha:new Date().toISOString().split("T")[0],gastoId}]}));e.target.value="";};
  const delFactura=id=>updTrip(t=>({...t,facturas:(t.facturas||[]).filter(fa=>fa.id!==id)}));

  const downloadGastosZip=async()=>{const gastosConFacturas=gastos.filter(g=>{const gf=(facturas||[]).filter(f=>f.gastoId===g.id&&f.data);return gf.length>0;});if(!gastosConFacturas.length){alert("Sin facturas de gastos para exportar");return;}setDownloadingZip(true);try{if(!window.JSZip){await new Promise(resolve=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";s.onload=resolve;document.head.appendChild(s);});}const zip=new window.JSZip();const root=zip.folder(`${trip.name}_gastos`);gastosConFacturas.forEach(g=>{const ti=tipoInfo(g.tipo||"otros");const folderName=`${ti.label}_${g.descripcion||g.tipo||"gasto"}`.replace(/[/\\?%*:|"<>]/g,"").substring(0,40);const sub=root.folder(folderName);const gf=(facturas||[]).filter(f=>f.gastoId===g.id&&f.data);gf.forEach(fa=>{try{const byteStr=atob(fa.data);const arr=new Uint8Array(byteStr.length);for(let i=0;i<byteStr.length;i++)arr[i]=byteStr.charCodeAt(i);const ext=fa.tipo?.includes("pdf")?"pdf":fa.tipo?.includes("png")?"png":"jpg";const nombre=fa.nombre.includes(".")?fa.nombre:`${fa.nombre}.${ext}`;sub.file(nombre,arr);}catch{}});});const blob=await zip.generateAsync({type:"blob"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`${trip.name.replace(/\s/g,"_")}_gastos.zip`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);}catch(e){alert("Error al crear el ZIP");}setDownloadingZip(false);};

  const gastosByTipo={};gastos.forEach(g=>{if(!gastosByTipo[g.tipo])gastosByTipo[g.tipo]=[];gastosByTipo[g.tipo].push(g);});

  return(
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
      {unlocked&&gastos.length>0&&<button onClick={()=>setShowStats(v=>!v)} style={{ width:"100%",padding:"10px",background:showStats?A.purple+"22":A.card2,border:`1px solid ${showStats?A.purple+"44":A.border}`,borderRadius:12,fontFamily:BF,fontSize:13,color:showStats?A.purple:A.muted,cursor:"pointer",marginBottom:14 }}>{showStats?"▲ Ocultar estadísticas":"📊 Ver estadísticas de gastos"}</button>}
      {showStats&&unlocked&&<ExpenseStats gastos={gastos}/>}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
          <div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,textTransform:"uppercase" }}>Gastos</div>
          <div style={{ display:"flex",gap:6 }}>
            {gastos.some(g=>(facturas||[]).some(f=>f.gastoId===g.id&&f.data))&&<button onClick={downloadGastosZip} disabled={downloadingZip} style={{ ...ab(A.purple+"22",A.purple),border:`1px solid ${A.purple}44`,padding:"7px 10px",fontSize:11,borderRadius:8,fontFamily:BF }}>{downloadingZip?"...":"📦 ZIP"}</button>}
            <button onClick={()=>setShowGastoForm(v=>!v)} style={{ ...ab(showGastoForm?A.card2:A.orange+"22",showGastoForm?A.muted:A.orange),border:`1px solid ${showGastoForm?A.border:A.orange+"44"}`,padding:"7px 14px",fontSize:12,borderRadius:8,fontFamily:BF }}>{showGastoForm?"Cancelar":"+ Añadir"}</button>
          </div>
        </div>
        {showGastoForm&&(
          <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${A.orange}44` }}>
            <button onClick={()=>setTipoMenu(true)} style={{ width:"100%",background:A.bg,border:`2px solid ${A.orange}55`,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:10,boxSizing:"border-box" }}><span style={{ fontSize:22 }}>{tipoInfo(gTipo).icon}</span><span style={{ fontFamily:ANTON,fontSize:15,color:A.orange,letterSpacing:1,flex:1,textAlign:"left" }}>{tipoInfo(gTipo).label}</span><span style={{ color:A.muted,fontSize:12,fontFamily:BF }}>Cambiar</span></button>
            <input value={gDesc} onChange={e=>setGDesc(e.target.value)} placeholder="Descripción del gasto" style={{ ...ais,marginBottom:8 }}/>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:8,marginBottom:8 }}>
              <input value={gImporte} onChange={e=>setGImporte(e.target.value.replace(/[^\d.]/g,""))} placeholder={`Importe ${sym}`} inputMode="decimal" style={ais}/>
              <button onClick={()=>setCurrMenu(true)} style={{ ...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold,padding:"8px" }}>{gCurrency} <span style={{ fontSize:10,color:A.muted }}>▾</span></button>
            </div>
            {gCurrency!=="EUR"&&gImporte&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 12px",marginBottom:8,border:`1px solid ${A.cyan}33`,fontSize:12,color:A.cyan,fontFamily:BF }}>{converting?"Convirtiendo...":gImporteEUR?`≈ ${gImporteEUR} €`:""}</div>}
            <input type="date" value={gFecha} onChange={e=>setGFecha(e.target.value)} style={{ ...ais,colorScheme:"dark",marginBottom:8 }}/>
            <input value={gNota} onChange={e=>setGNota(e.target.value)} placeholder="Nota (opcional)" style={{ ...ais,marginBottom:12 }}/>
            <button onClick={addGasto} disabled={!gImporte||+gImporte<=0} style={{ width:"100%",padding:"13px",border:"none",borderRadius:10,fontFamily:ANTON,fontSize:15,letterSpacing:2,cursor:"pointer",background:gImporte&&+gImporte>0?A.orange:"#1a1a1a",color:"#fff",textTransform:"uppercase" }}>REGISTRAR GASTO</button>
          </div>
        )}
        {gastos.length===0?<AEmpty text="Sin gastos registrados"/>:Object.entries(gastosByTipo).map(([tipo,items])=>{
          const ti=tipoInfo(tipo);const subtotal=items.reduce((s,g)=>s+(+g.importeEUR||+g.importe||0),0);
          return(<div key={tipo} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 2px",marginBottom:4 }}><div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase" }}>{ti.icon} {ti.label}</div><div style={{ fontFamily:ANTON,fontSize:13,color:A.red }}>{subtotal.toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})}€</div></div>
            {items.map(g=>{const gFacturas=facturas.filter(f=>f.gastoId===g.id);const isExpanded=expandedGasto===g.id;return(
              <div key={g.id} style={{ background:A.card,borderRadius:10,marginBottom:6,border:`1px solid ${A.border}33` }}>
                <div style={{ padding:"10px 12px",display:"flex",gap:10,alignItems:"center" }}>
                  <span style={{ fontSize:18,flexShrink:0 }}>{ti.icon}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:ANTON,fontSize:15,color:A.orange,lineHeight:1 }}>{(+g.importeEUR||+g.importe).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})} €</div>
                    <div style={{ fontFamily:BF,fontSize:12,color:A.text,fontWeight:700,marginTop:2 }}>{g.descripcion||ti.label}</div>
                    <div style={{ fontSize:11,color:A.muted,fontFamily:BF }}>{g.fecha&&new Date(g.fecha+"T12:00:00").toLocaleDateString("es-ES")}{g.currency&&g.currency!=="EUR"&&<span style={{ color:A.gold }}> · {(+g.importe).toLocaleString("es-ES")} {getCurrencySymbol(g.currency)}</span>}{gFacturas.length>0&&<span style={{ color:A.green }}> · 📄 {gFacturas.length}</span>}</div>
                  </div>
                  <button onClick={()=>setExpandedGasto(isExpanded?null:g.id)} style={{ background:isExpanded?A.gold+"22":A.card2,border:`1px solid ${isExpanded?A.gold+"44":A.border}`,color:isExpanded?A.gold:A.muted,borderRadius:8,padding:"4px 8px",fontSize:14,cursor:"pointer" }}>📎</button>
                  <button onClick={()=>delGasto(g.id)} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",padding:"0 2px",lineHeight:1 }}>✕</button>
                </div>
                {isExpanded&&(
                  <div style={{ borderTop:`1px solid ${A.border}33`,padding:"10px 12px",background:A.bg }}>
                    <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Facturas adjuntas</div>
                    {gFacturas.map(fa=>(<div key={fa.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:A.card,borderRadius:8,marginBottom:6,border:`1px solid ${A.gold}33` }}><span style={{ fontSize:16 }}>{fa.tipo?.includes("image")?"🖼️":"📄"}</span><div style={{ flex:1,fontSize:12,fontFamily:BF,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{fa.nombre}</div><a href={`data:${fa.tipo};base64,${fa.data}`} download={fa.nombre} style={{ ...ab(A.gold+"22",A.gold),padding:"4px 8px",fontSize:10,borderRadius:6,border:`1px solid ${A.gold}33`,textDecoration:"none",fontFamily:BF }}>↓</a><button onClick={()=>delFactura(fa.id)} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",lineHeight:1 }}>✕</button></div>))}
                    <input ref={gastoFacturaRef} type="file" accept="application/pdf,image/*" style={{ display:"none" }} onChange={e=>addFacturaGasto(e,g.id)}/>
                    <button onClick={()=>{gastoFacturaRef.current.value="";gastoFacturaRef.current.click();}} style={{ width:"100%",padding:"8px",background:A.gold+"15",border:`1.5px dashed ${A.gold}`,borderRadius:8,color:A.gold,fontFamily:BF,fontSize:12,cursor:"pointer" }}>+ Adjuntar factura</button>
                  </div>
                )}
              </div>
            );})}
          </div>);
        })}
      </div>
      <div style={{ marginBottom:14 }}><FacturacionSection trip={trip} updTrip={updTrip} tc={tc}/></div>
      {tipoMenu&&<GastoTipoMenu current={gTipo} onSelect={t=>setGTipo(t)} onClose={()=>setTipoMenu(false)}/>}
      {currMenu&&<CurrencyMenu current={gCurrency} onSelect={c=>setGCurrency(c)} onClose={()=>setCurrMenu(false)}/>}
      {showPin&&<NumPad title="PIN Finanzas" subtitle="Introduce el código de acceso" pinLength={6} onVerifyAsync={async pin=>{const r=await verifyPin(pin,"finanzas");return r;}} onSuccess={()=>{setUnlocked(true);setShowPin(false);}} onCancel={()=>setShowPin(false)}/>}
    </div>
  );
}

function FacturacionSection({trip,updTrip,tc}){
  const facturasVenta=trip.facturasVenta||[];const[view,setView]=useState("list");const[editId,setEditId]=useState(null);
  const today=new Date().toISOString().split("T")[0];
  const lastNum=facturasVenta.length>0?facturasVenta[facturasVenta.length-1].numFactura||"":"";
  const nextNum=(()=>{const m=lastNum.match(/(\d+)/g);if(!m)return"";const n=parseInt(m[m.length-1])+1;return lastNum.replace(/\d+$/,String(n).padStart(m[m.length-1].length,"0"));})();
  const emptyForm=()=>({numFactura:nextNum,fechaFactura:today,detalleReserva:trip.name?`PROGRAMA TRAVELIKE ${trip.name.toUpperCase()} EN RÉGIMEN DE MEDIA PENSIÓN.\n-VUELOS INTERNACIONALES\n-TRANSFER PRIVADO\n-PÓLIZA DE SEGURO`:"",fechaSalida:"",fechaRegreso:"",clientesSeleccionados:[],totalFactura:""});
  const[form,setForm]=useState(emptyForm);const[generating,setGenerating]=useState(null);
  const saveFactura=()=>{if(!form.numFactura||!form.fechaFactura)return;const fa={id:uid(),...form,createdAt:new Date().toISOString()};updTrip(t=>({...t,facturasVenta:[...(t.facturasVenta||[]),fa]}));setForm(emptyForm());setView("list");};
  const delFacturaVenta=id=>updTrip(t=>({...t,facturasVenta:(t.facturasVenta||[]).filter(f=>f.id!==id)}));

  const downloadFacturaPDF=async(fa)=>{setGenerating(fa.id);try{const JsPDF=await loadJsPDF();const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});const W=210,H=297,mg=18;let y=mg;doc.setFont("helvetica","bold");doc.setFontSize(18);doc.setTextColor(0,0,0);doc.text("travelike.",mg,y+10);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(80,80,80);const fNum=`FACTURA ${fa.numFactura}  ·  FECHA: ${new Date(fa.fechaFactura+"T12:00:00").toLocaleDateString("es-ES")}`;doc.text(fNum,W-mg,y+8,{align:"right"});y+=24;doc.setDrawColor(220,220,220);doc.line(mg,y,W-mg,y);y+=8;const col1=mg,col2=110,colW=80;doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(232,0,42);doc.text("DATOS AGENCIA",col1,y);doc.text("DETALLE DE LA RESERVA",col2,y);y+=5;doc.setTextColor(60,60,60);doc.setFont("helvetica","normal");doc.setFontSize(9);const agLines=["Agencia: TRAVELIKE SL","CIF: B02628766","Dirección: Ana Karenina 6, Albacete","C.P.: 02005  ·  Albacete, España"];agLines.forEach(l=>{doc.text(l,col1,y);y+=5;});const resLines=doc.splitTextToSize(fa.detalleReserva||"",colW);let ry=y-(agLines.length*5);resLines.forEach(l=>{doc.text(l,col2,ry);ry+=5;});y=Math.max(y,ry)+4;doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(60,60,60);const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("es-ES"):"—";doc.text(`Fecha Salida: ${fmtDate(fa.fechaSalida)}`,col2,y);doc.text(`Fecha Regreso: ${fmtDate(fa.fechaRegreso)}`,col2+50,y);y+=10;doc.setDrawColor(220,220,220);doc.line(mg,y,W-mg,y);y+=8;doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(232,0,42);doc.text("DATOS CLIENTES",col1,y);y+=5;doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(60,60,60);const selClients=tc.filter(c=>(fa.clientesSeleccionados||[]).includes(c.id));selClients.forEach((c,i)=>{const docStr=c.docNumero?`  ·  ${c.docNumero}`:"";doc.text(`${i+1}. ${c.nombre}${docStr}`,col1,y);y+=5;if(y>H-40){doc.addPage();y=mg;}});y+=6;doc.setDrawColor(220,220,220);doc.line(mg,y,W-mg,y);y+=8;doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(60,60,60);doc.text("DETALLES DE PAGO",col1,y);doc.setTextColor(232,0,42);doc.setFontSize(13);doc.text(`TOTAL FACTURA: ${fa.totalFactura}€`,W-mg,y,{align:"right"});y+=14;doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(120,120,120);doc.text("Travelike, S.L. con CIF B02628766",W/2,H-18,{align:"center"});doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(60,60,60);doc.text("*Régimen especial de las agencias de viajes*",W/2,H-12,{align:"center"});doc.save(`Factura_${fa.numFactura.replace(/[/\\]/g,"-")}.pdf`);}catch(e){alert("Error al generar PDF: "+e.message);}setGenerating(null);};

  const editingFa=editId?facturasVenta.find(f=>f.id===editId):null;
  if(view==="new"||(view==="edit"&&editingFa)){
    const f=view==="edit"?editingFa:form;
    const setF=view==="edit"?upd=>updTrip(t=>({...t,facturasVenta:t.facturasVenta.map(x=>x.id===editId?{...x,...(typeof upd==="function"?upd(x):upd)}:x)})):setForm;
    return(<div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}><div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,textTransform:"uppercase" }}>{view==="edit"?"✏️ Editar Factura":"📄 Nueva Factura de Venta"}</div><button onClick={()=>{setView("list");setEditId(null);}} style={{ background:"transparent",border:"none",color:A.muted,fontSize:13,cursor:"pointer",fontFamily:BF }}>✕ Cancelar</button></div>
      <div style={{ display:"flex",gap:10,marginBottom:10 }}><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Nº Factura</div><input value={f.numFactura||""} onChange={e=>setF(x=>({...x,numFactura:e.target.value}))} placeholder="09/25" style={{ ...ais,fontFamily:ANTON,fontSize:18,letterSpacing:2 }}/></div><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Fecha</div><input type="date" value={f.fechaFactura||""} onChange={e=>setF(x=>({...x,fechaFactura:e.target.value}))} style={{ ...ais,colorScheme:"dark" }}/></div></div>
      <div style={{ marginBottom:10 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Detalle de la Reserva</div><textarea value={f.detalleReserva||""} onChange={e=>setF(x=>({...x,detalleReserva:e.target.value}))} rows={5} style={{ ...ais,resize:"vertical",lineHeight:1.7 }}/></div>
      <div style={{ display:"flex",gap:10,marginBottom:10 }}><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Fecha Salida</div><input type="date" value={f.fechaSalida||""} onChange={e=>setF(x=>({...x,fechaSalida:e.target.value}))} style={{ ...ais,colorScheme:"dark" }}/></div><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Fecha Regreso</div><input type="date" value={f.fechaRegreso||""} onChange={e=>setF(x=>({...x,fechaRegreso:e.target.value}))} style={{ ...ais,colorScheme:"dark" }}/></div></div>
      <div style={{ marginBottom:10 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Viajeros ({(f.clientesSeleccionados||[]).length} seleccionados)</div>{tc.length===0?<div style={{ fontFamily:BF,fontSize:12,color:A.muted,padding:"10px",textAlign:"center" }}>No hay viajeros en este viaje</div>:tc.map(c=>{const sel=(f.clientesSeleccionados||[]).includes(c.id);const toggleFn=()=>{const curr=f.clientesSeleccionados||[];const next=curr.includes(c.id)?curr.filter(x=>x!==c.id):[...curr,c.id];setF(x=>({...x,clientesSeleccionados:next}));};return(<div key={c.id} onClick={toggleFn} style={{ background:sel?A.cyan+"18":A.bg,borderRadius:10,marginBottom:6,border:`2px solid ${sel?A.cyan:A.border+"66"}`,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }}><div style={{ width:22,height:22,borderRadius:6,border:`2px solid ${sel?A.cyan:A.border}`,background:sel?A.cyan:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{sel&&<span style={{ color:A.bg,fontSize:14,fontWeight:700 }}>✓</span>}</div><div style={{ flex:1,minWidth:0 }}><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:A.text }}>{c.nombre}</div>{c.docNumero?<div style={{ fontFamily:ANTON,fontSize:16,color:sel?A.cyan:A.muted,letterSpacing:3,marginTop:2 }}>{c.docNumero}</div>:<div style={{ fontFamily:BF,fontSize:10,color:A.orange }}>⚠️ Sin número de documento</div>}</div></div>);})}{tc.length>0&&<button onClick={()=>{const allIds=tc.map(c=>c.id);const curr=f.clientesSeleccionados||[];const allSel=allIds.every(id=>curr.includes(id));setF(x=>({...x,clientesSeleccionados:allSel?[]:allIds}));}} style={{ width:"100%",marginTop:4,padding:"9px",background:A.card2,border:`1px dashed ${A.border}`,borderRadius:8,color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer" }}>{(f.clientesSeleccionados||[]).length===tc.length?"Deseleccionar todos":"Seleccionar todos"}</button>}</div>
      <div style={{ marginBottom:16 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>Total Factura (€)</div><input type="number" value={f.totalFactura||""} onChange={e=>setF(x=>({...x,totalFactura:e.target.value}))} placeholder="60518" style={{ ...ais,fontFamily:ANTON,fontSize:26,letterSpacing:2,color:A.red }}/></div>
      <button onClick={view==="edit"?()=>{setView("list");setEditId(null);}:saveFactura} disabled={!f.numFactura||!f.fechaFactura} style={{ width:"100%",padding:"16px",border:"none",borderRadius:12,fontFamily:ANTON,fontSize:16,letterSpacing:2,cursor:"pointer",background:(f.numFactura&&f.fechaFactura)?`linear-gradient(90deg,${A.red},#b30020)`:A.card2,color:(f.numFactura&&f.fechaFactura)?"#fff":A.muted,textTransform:"uppercase",marginBottom:8 }}>{view==="edit"?"GUARDAR CAMBIOS":"CREAR FACTURA"}</button>
    </div>);
  }

  return(<div>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}><div style={{ fontFamily:ANTON,fontSize:16,color:"#fff",letterSpacing:1,textTransform:"uppercase" }}>Facturación</div><button onClick={()=>{setForm(emptyForm());setView("new");}} style={{ ...ab(A.red+"22",A.red),border:`1px solid ${A.red}44`,padding:"7px 14px",fontSize:12,borderRadius:8,fontFamily:BF }}>+ Nueva</button></div>
    {facturasVenta.length===0?<AEmpty text="Sin facturas de venta"/>:facturasVenta.map(fa=>{const selCount=(fa.clientesSeleccionados||[]).length;const fmtDate=d=>d?new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"}):"—";return(<div key={fa.id} style={{ background:A.card,borderRadius:12,marginBottom:10,border:`1px solid ${A.red}33`,overflow:"hidden" }}><div style={{ padding:"12px 14px" }}><div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:8 }}><div style={{ flex:1,minWidth:0 }}><div style={{ fontFamily:ANTON,fontSize:17,color:A.red,letterSpacing:1 }}>Factura {fa.numFactura}</div><div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginTop:2 }}>{fmtDate(fa.fechaFactura)}{fa.fechaSalida&&` · Salida: ${fmtDate(fa.fechaSalida)}`}</div><div style={{ fontFamily:BF,fontSize:11,color:A.muted,marginTop:2 }}>👥 {selCount} viajero{selCount!==1?"s":""}</div></div><div style={{ fontFamily:ANTON,fontSize:20,color:A.red,whiteSpace:"nowrap",flexShrink:0 }}>{fa.totalFactura?`${fa.totalFactura}€`:"—"}</div></div>{selCount>0&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:8,border:`1px solid ${A.border}33` }}>{tc.filter(c=>(fa.clientesSeleccionados||[]).includes(c.id)).map((c,i)=>(<div key={c.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:i<selCount-1?`1px solid ${A.border}22`:"none" }}><span style={{ fontFamily:BF,fontSize:11,color:A.muted,width:18 }}>{i+1}.</span><span style={{ fontFamily:BF,fontSize:12,color:A.text,flex:1 }}>{c.nombre}</span><span style={{ fontFamily:ANTON,fontSize:14,color:c.docVerified?A.cyan:A.orange,letterSpacing:2 }}>{c.docNumero||"⚠️ SIN DOC"}</span></div>))}</div>}<div style={{ display:"flex",gap:6 }}><button onClick={()=>{setEditId(fa.id);setView("edit");}} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`,padding:"8px",fontSize:11,borderRadius:8,fontFamily:BF }}>✏️ Editar</button><button onClick={()=>downloadFacturaPDF(fa)} disabled={generating===fa.id} style={{ ...ab(A.red+"22",A.red),flex:2,border:`1px solid ${A.red}44`,padding:"8px",fontSize:11,borderRadius:8,fontFamily:BF }}>{generating===fa.id?"⏳ Generando...":"📥 Descargar PDF"}</button><button onClick={()=>delFacturaVenta(fa.id)} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",padding:"0 4px" }}>✕</button></div><div style={{ textAlign:"center",marginTop:8,fontFamily:BF,fontSize:9,color:A.muted+"88",letterSpacing:1 }}>*Régimen especial de las agencias de viajes*</div></div></div>);})}
  </div>);
}

function AIDocsTab({trip,tc,clients,updTrip,updClient,setTab}){
  const[queue,setQueue]=useState([]);const[processing,setProcessing]=useState(false);
  const[docsMode,setDocsMode]=useState("ia");const[manFile,setManFile]=useState(null);const[manTipo,setManTipo]=useState("vuelo_ida");
  const[manTarget,setManTarget]=useState(null);const[manDesc,setManDesc]=useState("");const[manAssigning,setManAssigning]=useState(false);
  const fileRef=useRef();const manFileRef=useRef();
  const allTargets=tc.flatMap(c=>[{id:c.id,nombre:c.nombre,type:"client",clientId:c.id},...(c.acompanantes||[]).map(a=>({id:a.id,nombre:a.nombre,type:"acomp",clientId:c.id}))]);
  const DOC_TIPOS=[{k:"vuelo_ida",icon:"✈️",label:"Billete IDA"},{k:"vuelo_vuelta",icon:"🔄",label:"Billete VUELTA"},{k:"seguro",icon:"🛡️",label:"Seguro de viaje"},{k:"voucher",icon:"🏨",label:"Voucher hotel"},{k:"visado",icon:"🛂",label:"Visado"},{k:"hotel",icon:"🏩",label:"Reserva hotel"},{k:"otro",icon:"📄",label:"Otro documento"}];
  const addFiles=e=>{const files=Array.from(e.target.files||[]);setQueue(q=>[...q,...files.map(f=>({id:uid(),file:f,name:f.name,status:"pending",result:null,b64:null,mime:f.type}))]);e.target.value="";};
  const processAll=async()=>{const pending=queue.filter(q=>q.status==="pending");if(!pending.length)return;setProcessing(true);const encoded=await Promise.all(pending.map(async item=>{const b64=await fileToB64(item.file);return{...item,b64};}));for(const item of encoded){setQueue(q=>q.map(x=>x.id===item.id?{...x,b64:item.b64,status:"processing"}:x));try{const prompt=`Analiza este documento de viaje.\nViajeros del grupo: ${allTargets.map(t=>t.nombre).join(", ")}.\n\nExtrae:\n1. Nombre EXACTO del pasajero\n2. Tipo de documento: "vuelo_ida", "vuelo_vuelta", "seguro", "voucher", "visado", "hotel", "otro"\n3. Descripción breve\n4. Referencia o número de reserva\n5. Etiqueta corta: "IDA", "VUELTA", "SEGURO", "VOUCHER" etc.\n\nResponde SOLO JSON sin markdown:\n{"pasajero":"","tipo":"vuelo_ida","descripcion":"","referencia":"","etiqueta":"IDA"}`;const raw=await callClaude(item.b64,item.mime||"application/pdf",prompt);const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());const nombreBuscado=(parsed.pasajero||"").toLowerCase().trim();const matchedTarget=allTargets.find(t=>t.nombre.toLowerCase()===nombreBuscado)||allTargets.find(t=>{const partes=nombreBuscado.split(/\s+/);return partes.some(p=>p.length>2&&t.nombre.toLowerCase().includes(p));})||null;setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"done",result:{...parsed,matchedTarget}}:x));}catch(e){setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"error"}:x));}}setProcessing(false);};
  const assignDoc=(item,target,tipo)=>{const etiqueta=item.result?.etiqueta||tipo.replace("vuelo_","").toUpperCase();const ext=item.mime?.includes("pdf")?"pdf":item.mime?.includes("png")?"png":"jpg";const nombre=`${target.nombre.split(" ")[0]}_${etiqueta}.${ext}`;const doc={id:uid(),tipo:tipo.startsWith("vuelo")?"vuelo":tipo,nombre,archivo:item.result?.referencia||item.name,descripcion:item.result?.descripcion,data:item.b64,mimeType:item.mime};if(target.type==="acomp"){updClient(target.clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===target.id?{...a,personalDocs:[...(a.personalDocs||[]),doc]}:a)}));}else{updClient(target.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc]}));}setQueue(q=>q.map(x=>x.id===item.id?{...x,status:"assigned"}:x));};
  const assignManual=async()=>{if(!manFile||!manTarget)return;setManAssigning(true);const b64=await fileToB64(manFile);const tipoInfoItem=DOC_TIPOS.find(d=>d.k===manTipo)||DOC_TIPOS[0];const ext=manFile.type?.includes("pdf")?"pdf":manFile.type?.includes("png")?"png":"jpg";const nombre=`${manTarget.nombre.split(" ")[0]}_${tipoInfoItem.label.replace(/ /g,"_")}.${ext}`;const doc={id:uid(),tipo:manTipo.startsWith("vuelo")?"vuelo":manTipo,nombre,archivo:manDesc||manFile.name,descripcion:manDesc||tipoInfoItem.label,data:b64,mimeType:manFile.type};if(manTarget.type==="acomp"){updClient(manTarget.clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===manTarget.id?{...a,personalDocs:[...(a.personalDocs||[]),doc]}:a)}));}else{updClient(manTarget.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc]}));}setManFile(null);setManDesc("");setManTarget(null);setManAssigning(false);};
  const doneWithMatch=queue.filter(q=>q.status==="done"&&q.result?.matchedTarget).length;
  return(
    <div style={{ padding:"0 16px" }}>
      <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
      <div style={{ display:"flex",background:A.bg,borderRadius:12,padding:4,marginBottom:14,gap:4,border:`1px solid ${A.border}` }}>
        <button onClick={()=>setDocsMode("ia")} style={{ flex:1,background:docsMode==="ia"?A.purple:"transparent",color:docsMode==="ia"?"#fff":A.muted,border:"none",borderRadius:9,padding:"10px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer" }}>🤖 IA Automático</button>
        <button onClick={()=>setDocsMode("manual")} style={{ flex:1,background:docsMode==="manual"?A.cyan:"transparent",color:docsMode==="manual"?"#000":A.muted,border:"none",borderRadius:9,padding:"10px",fontFamily:BF,fontSize:12,fontWeight:700,cursor:"pointer" }}>📤 Subida Manual</button>
      </div>
      {docsMode==="ia"&&(<>
        <div style={{ background:A.purple+"15",border:`1px solid ${A.purple}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontFamily:BF,fontSize:12,color:A.purple }}>🤖 Powered by <strong>Claude AI</strong> — analiza y asigna documentos automáticamente</div>
        <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple style={{ display:"none" }} onChange={addFiles}/>
        <div style={{ display:"flex",gap:8,marginBottom:10 }}>
          <button onClick={()=>fileRef.current.click()} style={{ flex:2,background:A.purple+"22",border:`1.5px dashed ${A.purple}`,borderRadius:10,padding:"12px",color:A.purple,fontFamily:BF,fontSize:13,cursor:"pointer",fontWeight:700 }}>📁 Seleccionar PDFs / Fotos</button>
          {queue.filter(q=>q.status==="pending").length>0&&!processing&&<button onClick={processAll} style={{ flex:1,background:A.cyan,border:"none",borderRadius:10,padding:"12px",color:A.bg,fontFamily:BF,fontSize:12,cursor:"pointer",fontWeight:700 }}>🔍 Analizar</button>}
        </div>
        {doneWithMatch>0&&<button onClick={()=>queue.filter(x=>x.status==="done"&&x.result?.matchedTarget).forEach(item=>assignDoc(item,item.result.matchedTarget,item.result.tipo||"doc"))} style={{ width:"100%",padding:"12px",background:`linear-gradient(90deg,${A.green},#26a047)`,border:"none",borderRadius:10,color:"#fff",fontFamily:BF,fontSize:13,cursor:"pointer",marginBottom:12,fontWeight:700 }}>⚡ Asignar automáticamente todos ({doneWithMatch})</button>}
        {processing&&<div style={{ textAlign:"center",padding:"10px",color:A.cyan,fontSize:13,marginBottom:12,fontFamily:BF }}>⏳ Analizando con Claude AI...</div>}
        {queue.length===0&&<AEmpty text="Sube billetes, seguros, vouchers u otros documentos"/>}
        {queue.map(item=>(<div key={item.id} style={{ background:A.card,borderRadius:12,padding:"12px",marginBottom:8,border:`1px solid ${item.status==="done"?A.cyan+"44":item.status==="assigned"?A.green+"44":item.status==="error"?A.red+"44":A.border+"44"}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:item.result?10:0 }}>
            <span style={{ fontSize:18 }}>{item.status==="pending"?"📄":item.status==="processing"?"⏳":item.status==="done"?"✨":item.status==="assigned"?"✅":"❌"}</span>
            <div style={{ flex:1,minWidth:0 }}><div style={{ fontSize:12,fontWeight:700,color:A.text,fontFamily:BF,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{item.name}</div>{item.result&&<div style={{ fontSize:10,color:A.cyan,fontFamily:BF }}>{item.result.tipo?.replace(/_/g," ").toUpperCase()} · {item.result.etiqueta}</div>}</div>
            {["pending","done","error"].includes(item.status)&&<button onClick={()=>setQueue(q=>q.filter(x=>x.id!==item.id))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button>}
          </div>
          {item.status==="done"&&item.result&&(<div>
            {item.result.descripcion&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:8,fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}>📋 {item.result.descripcion}{item.result.referencia&&<span style={{ color:A.gold }}> · {item.result.referencia}</span>}</div>}
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Asignar a:</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {allTargets.map(target=>{const suggested=item.result.matchedTarget?.id===target.id;return(<button key={target.id} onClick={()=>assignDoc(item,target,item.result.tipo||"doc")} style={{ padding:"8px 12px",borderRadius:8,cursor:"pointer",fontFamily:BF,border:`2px solid ${suggested?A.cyan:target.type==="acomp"?A.purple:A.border}`,background:suggested?A.cyan+"22":target.type==="acomp"?A.purple+"11":A.bg,color:suggested?A.cyan:target.type==="acomp"?A.purple:A.text,fontSize:11,fontWeight:suggested?800:500 }}>{suggested&&"✨ "}{target.nombre.split(" ")[0]}{target.type==="acomp"&&<span style={{ fontSize:9,opacity:0.7 }}> acomp.</span>}</button>);})}
            </div>
          </div>)}
          {item.status==="assigned"&&<div style={{ fontSize:12,color:A.green,fontWeight:700,fontFamily:BF }}>✓ Asignado — el viajero puede descargarlo desde su portal</div>}
        </div>))}
      </>)}
      {docsMode==="manual"&&(<>
        <div style={{ background:A.cyan+"12",border:`1px solid ${A.cyan}33`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontFamily:BF,fontSize:12,color:A.cyan }}>📤 Sube documentos manualmente y asígnalos a cada viajero</div>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Tipo de documento</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>{DOC_TIPOS.map(d=>(<button key={d.k} onClick={()=>setManTipo(d.k)} style={{ background:manTipo===d.k?A.cyan+"22":A.card,border:`2px solid ${manTipo===d.k?A.cyan:A.border}`,borderRadius:10,padding:"10px 8px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",textAlign:"left" }}><span style={{ fontSize:20 }}>{d.icon}</span><span style={{ fontFamily:BF,fontSize:12,fontWeight:700,color:manTipo===d.k?A.cyan:A.text }}>{d.label}</span></button>))}</div>
        <input ref={manFileRef} type="file" accept="application/pdf,image/*" style={{ display:"none" }} onChange={e=>{setManFile(e.target.files[0]||null);e.target.value="";}}/>
        <button onClick={()=>manFileRef.current.click()} style={{ width:"100%",background:manFile?A.green+"18":A.card2,border:`1.5px dashed ${manFile?A.green:A.border}`,borderRadius:10,padding:"14px",color:manFile?A.green:A.muted,fontFamily:BF,fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:12,textAlign:"center" }}>{manFile?`📎 ${manFile.name}`:"📁 Seleccionar archivo (PDF o imagen)"}</button>
        <input value={manDesc} onChange={e=>setManDesc(e.target.value)} placeholder="Descripción opcional (ej: MAD→NYC IB6010)" style={{ ...ais,marginBottom:14 }}/>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Asignar a:</div>
        <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:16 }}>{allTargets.map(target=>{const sel=manTarget?.id===target.id;return(<button key={target.id} onClick={()=>setManTarget(sel?null:target)} style={{ background:sel?A.cyan+"22":A.card,border:`2px solid ${sel?A.cyan:target.type==="acomp"?A.purple+"55":A.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left" }}><div style={{ width:38,height:38,borderRadius:9,overflow:"hidden",flexShrink:0,background:sel?A.cyan+"33":A.card2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:17,color:sel?A.cyan:A.muted }}>{(()=>{const cl=target.type==="client"?tc.find(c=>c.id===target.id):tc.flatMap(c=>c.acompanantes||[]).find(a=>a.id===target.id);return cl?.passportPhoto?<img src={cl.passportPhoto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:target.nombre[0];})()}</div><div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:sel?A.cyan:A.text }}>{target.nombre}</div>{target.type==="acomp"&&<div style={{ fontFamily:BF,fontSize:10,color:A.purple }}>+ acompañante</div>}</div>{sel&&<span style={{ color:A.cyan,fontSize:20 }}>✓</span>}</button>);})}
        </div>
        <button onClick={assignManual} disabled={!manFile||!manTarget||manAssigning} style={{ width:"100%",background:(!manFile||!manTarget)?A.card2:`linear-gradient(90deg,${A.cyan},${A.green})`,border:"none",borderRadius:12,padding:"16px",color:(!manFile||!manTarget)?A.muted:"#000",fontFamily:ANTON,fontSize:16,letterSpacing:1,cursor:(!manFile||!manTarget)?"not-allowed":"pointer",marginBottom:20 }}>{manAssigning?"⏳ ASIGNANDO...":"📤 ASIGNAR DOCUMENTO"}</button>
        {tc.some(c=>(c.personalDocs||[]).length>0||(c.acompanantes||[]).some(a=>(a.personalDocs||[]).length>0))&&(<div>
          <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10 }}>Documentos asignados en este viaje</div>
          {tc.flatMap(c=>[...(c.personalDocs||[]).map(d=>({...d,_nombre:c.nombre,_cid:c.id,_isAcomp:false})),...(c.acompanantes||[]).flatMap(a=>(a.personalDocs||[]).map(d=>({...d,_nombre:a.nombre,_cid:c.id,_aid:a.id,_isAcomp:true})))]).map(d=>{const tipoInfoItem=DOC_TIPOS.find(t=>d.tipo&&(t.k===d.tipo||t.k.startsWith(d.tipo)))||DOC_TIPOS[DOC_TIPOS.length-1];return(<div key={d.id} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.cyan}22`,display:"flex",alignItems:"center",gap:10 }}><span style={{ fontSize:20 }}>{tipoInfoItem.icon}</span><div style={{ flex:1,minWidth:0 }}><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{d.nombre||d.archivo}</div><div style={{ fontFamily:BF,fontSize:10,color:A.muted }}>{d._nombre}{d._isAcomp&&" (acomp.)"} · {tipoInfoItem.label}</div></div><button onClick={()=>{if(d._isAcomp){updClient(d._cid,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===d._aid?{...a,personalDocs:(a.personalDocs||[]).filter(x=>x.id!==d.id)}:a)}));}else{updClient(d._cid,c=>({...c,personalDocs:(c.personalDocs||[]).filter(x=>x.id!==d.id)}));}}} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer",flexShrink:0 }}>✕</button></div>);})}
        </div>)}
      </>)}
    </div>
  );
}

function EditTab({trip,trips,clients,updTrip,updClient,sC,setTab,editSec,setEditSec}){
  const[lName,setLName]=useState(trip.name);const[lFlag,setLFlag]=useState(trip.flag);const[lFechas,setLFechas]=useState(trip.fechas||"");const[lPrice,setLPrice]=useState(trip.price||"");const[lWebUrl,setLWebUrl]=useState(trip.webUrl||"");const[lCurrency,setLCurrency]=useState(trip.currency||"EUR");const[currMenu2,setCurrMenu2]=useState(false);
  const[efNombre,setEfNombre]=useState("");const[efArchivo,setEfArchivo]=useState("");const[dfNombre,setDfNombre]=useState("");const[dfArchivo,setDfArchivo]=useState("");
  const[ifIcono,setIfIcono]=useState("💡");const[ifTitulo,setIfTitulo]=useState("");const[ifTexto,setIfTexto]=useState("");const[ifUrl,setIfUrl]=useState("");
  const[newImpresc,setNewImpresc]=useState("");const[newCatItems,setNewCatItems]=useState({});const[newCatIcon,setNewCatIcon]=useState("⭐");const[newCatLabel,setNewCatLabel]=useState("");const[newCatKey,setNewCatKey]=useState("");const[newCatTipo,setNewCatTipo]=useState("rating");
  const mImpresc=trip.maletaImprescindibles||DEFAULT_IMPRESCINDIBLES;const mCats=trip.maletaCats||DEFAULT_MALETA_CATS;
  const hotels=trip.hotels||[];const emerg=trip.emergencias||emptyEmergencias();
  const sc=trip.surveyConfig||{categories:[...DEFAULT_SURVEY_CATS],surveyResponses:[]};
  const sec=editSec;const setSec=setEditSec;

  if(sec===null){return(<div style={{ padding:"12px 16px" }}>
    <button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12 }}>← Volver al menú</button>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
      {EDIT_SECS.map(s=>{let badge=null;if(s.k==="vuelos")badge=(trip.vuelos||[]).length;if(s.k==="docs")badge=(trip.docs||[]).length;if(s.k==="info")badge=(trip.info||[]).length;if(s.k==="hotels")badge=(trip.hotels||[]).length;if(s.k==="survey"&&trip.surveyEnabled)badge=(sc.surveyResponses||[]).length;return(<button key={s.k} onClick={()=>setSec(s.k)} style={{ background:A.card,border:`1.5px solid ${s.k==="survey"&&trip.surveyEnabled?A.gold+"66":A.border}`,borderRadius:16,padding:"16px 6px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",position:"relative",minHeight:80 }}>{badge>0&&<div style={{ position:"absolute",top:6,right:6,background:s.k==="survey"?A.gold:A.cyan,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:10,color:A.bg }}>{badge}</div>}<span style={{ fontSize:26 }}>{s.icon}</span><span style={{ fontFamily:BF,fontSize:10,fontWeight:700,color:A.muted,letterSpacing:1 }}>{s.label}</span></button>);})}
    </div>
  </div>);}

  const secInfo=EDIT_SECS.find(s=>s.k===sec);
  return(<div style={{ padding:"0 16px" }}>
    <button onClick={()=>setSec(null)} style={{ display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",color:A.muted,fontSize:13,cursor:"pointer",fontFamily:BF,padding:"10px 0 14px" }}>← Volver</button>
    <div style={{ fontFamily:ANTON,fontSize:20,color:A.text,letterSpacing:1,marginBottom:16,textTransform:"uppercase" }}>{secInfo?.icon} {secInfo?.label}</div>
    {sec==="general"&&<div>
      <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:10,marginBottom:10 }}><input value={lFlag} onChange={e=>setLFlag(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:24,padding:"8px" }}/><input value={lName} onChange={e=>setLName(e.target.value)} placeholder="Nombre del viaje" style={ais}/></div>
      <input value={lFechas} onChange={e=>setLFechas(e.target.value)} placeholder="Fechas para viajeros" style={{ ...ais,marginBottom:10 }}/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 90px",gap:10,marginBottom:10 }}><input value={lPrice} onChange={e=>setLPrice(e.target.value.replace(/[^\d.]/g,""))} placeholder="Precio" inputMode="numeric" style={ais}/><button onClick={()=>setCurrMenu2(true)} style={{ ...ais,cursor:"pointer",textAlign:"center",fontFamily:ANTON,color:A.gold }}>{lCurrency} ▾</button></div>
      <input value={lWebUrl} onChange={e=>setLWebUrl(e.target.value)} placeholder="URL web del viaje" style={{ ...ais,marginBottom:14 }}/>
      <button onClick={()=>updTrip(t=>({...t,name:lName,flag:lFlag,fechas:lFechas,price:lPrice?+lPrice:null,webUrl:lWebUrl,currency:lCurrency}))} style={{ ...ab(A.green),width:"100%",borderRadius:10,fontFamily:BF }}>Guardar</button>
      {currMenu2&&<CurrencyMenu current={lCurrency} onSelect={setLCurrency} onClose={()=>setCurrMenu2(false)}/>}
    </div>}
    {sec==="vuelos"&&<div>
      {(trip.vuelos||[]).map((v,i)=><div key={i} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}44`,display:"flex",alignItems:"center",gap:10 }}><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:A.text,fontFamily:BF }}>{v.nombre}</div><div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{v.archivo}</div></div><button onClick={()=>updTrip(t=>({...t,vuelos:t.vuelos.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>)}
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
        <input value={efNombre} onChange={e=>setEfNombre(e.target.value)} placeholder="Nombre del vuelo" style={{ ...ais,marginBottom:8 }}/>
        <input value={efArchivo} onChange={e=>setEfArchivo(e.target.value)} placeholder="Referencia" style={{ ...ais,marginBottom:10 }}/>
        <button onClick={()=>{if(!efNombre.trim())return;updTrip(t=>({...t,vuelos:[...(t.vuelos||[]),{id:uid(),nombre:efNombre,archivo:efArchivo}]}));setEfNombre("");setEfArchivo("");}} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:8,fontFamily:BF }}>+ Añadir</button>
      </div>
    </div>}
    {sec==="docs"&&<div>
      {(trip.docs||[]).map((d,i)=><div key={i} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}44`,display:"flex",alignItems:"center",gap:10 }}><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:A.text,fontFamily:BF }}>{d.nombre}</div><div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{d.archivo}</div></div><button onClick={()=>updTrip(t=>({...t,docs:t.docs.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>)}
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
        <input value={dfNombre} onChange={e=>setDfNombre(e.target.value)} placeholder="Nombre del documento" style={{ ...ais,marginBottom:8 }}/>
        <input value={dfArchivo} onChange={e=>setDfArchivo(e.target.value)} placeholder="Referencia" style={{ ...ais,marginBottom:10 }}/>
        <button onClick={()=>{if(!dfNombre.trim())return;updTrip(t=>({...t,docs:[...(t.docs||[]),{id:uid(),nombre:dfNombre,archivo:dfArchivo}]}));setDfNombre("");setDfArchivo("");}} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:8,fontFamily:BF }}>+ Añadir</button>
      </div>
    </div>}
    {sec==="pagos"&&<div>
      {(trip.pagosConfig||[]).map((p,i)=>(<div key={i} style={{ background:A.card,borderRadius:10,padding:"12px",marginBottom:10,border:`1px solid ${A.border}` }}>
        <div style={{ fontSize:10,color:A.cyan,fontWeight:700,marginBottom:8,fontFamily:BF,letterSpacing:2,textTransform:"uppercase" }}>Pago {i+1}</div>
        <input value={p.label} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,label:e.target.value}:x)}))} placeholder="Concepto" style={{ ...ais,marginBottom:8 }}/>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}><input value={p.fecha} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,fecha:e.target.value}:x)}))} placeholder="Texto fecha" style={ais}/><input value={p.importe} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,importe:e.target.value}:x)}))} placeholder="Importe base" style={ais}/></div>
        <input type="date" value={p.fechaISO||""} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,fechaISO:e.target.value}:x)}))} style={{ ...ais,colorScheme:"dark" }}/>
      </div>))}
      <ARow>
        <button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig||[]),{label:"Nuevo pago",fecha:"",fechaISO:"",importe:""}]}))} style={{ ...ab(A.orange+"22",A.orange),flex:1,border:`1.5px dashed ${A.orange}`,borderRadius:10,fontFamily:BF }}>+ Añadir hito</button>
        {(trip.pagosConfig||[]).length>1&&<button onClick={()=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.slice(0,-1)}))} style={{ ...ab(A.red+"22",A.red),flex:1,border:`1px solid ${A.red}44`,borderRadius:10,fontFamily:BF }}>- Quitar último</button>}
      </ARow>
    </div>}
    {sec==="info"&&<div>
      {(trip.info||[]).map((it,i)=><div key={i} style={{ background:A.card,borderRadius:10,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}44`,display:"flex",gap:10,alignItems:"flex-start" }}><span style={{ fontSize:22 }}>{it.icono}</span><div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:A.text,fontFamily:BF }}>{it.titulo}</div><div style={{ fontSize:11,color:A.muted,marginTop:2,fontFamily:BF }}>{it.texto}</div></div><button onClick={()=>updTrip(t=>({...t,info:t.info.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>)}
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
        <div style={{ display:"grid",gridTemplateColumns:"58px 1fr",gap:8,marginBottom:8 }}><input value={ifIcono} onChange={e=>setIfIcono(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:22,padding:"8px" }}/><input value={ifTitulo} onChange={e=>setIfTitulo(e.target.value)} placeholder="Título" style={ais}/></div>
        <textarea value={ifTexto} onChange={e=>setIfTexto(e.target.value)} placeholder="Texto..." style={{ ...ais,minHeight:70,resize:"vertical",marginBottom:8,lineHeight:1.5 }}/>
        <input value={ifUrl} onChange={e=>setIfUrl(e.target.value)} placeholder="Enlace (opcional)" style={{ ...ais,marginBottom:10 }}/>
        <button onClick={()=>{if(!ifTitulo.trim())return;updTrip(t=>({...t,info:[...(t.info||[]),{icono:ifIcono,titulo:ifTitulo,texto:ifTexto,url:ifUrl}]}));setIfIcono("💡");setIfTitulo("");setIfTexto("");setIfUrl("");}} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:8,fontFamily:BF }}>+ Añadir</button>
      </div>
    </div>}
    {sec==="hotels"&&<div>
      {hotels.map((h,i)=>(<div key={h.id} style={{ background:A.card,borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1px solid ${A.gold}33` }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}><div style={{ fontFamily:ANTON,fontSize:15,color:A.gold }}>Hotel {i+1}</div><button onClick={()=>updTrip(t=>({...t,hotels:t.hotels.filter(x=>x.id!==h.id)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",lineHeight:1 }}>✕</button></div>
        <input key={h.id+"_n"} defaultValue={h.nombre} onBlur={e=>updTrip(t=>({...t,hotels:t.hotels.map(x=>x.id===h.id?{...x,nombre:e.target.value}:x)}))} placeholder="Nombre del hotel" style={{ ...ais,marginBottom:8 }}/>
        <input key={h.id+"_f"} defaultValue={h.fechasEstancia||""} onBlur={e=>updTrip(t=>({...t,hotels:t.hotels.map(x=>x.id===h.id?{...x,fechasEstancia:e.target.value}:x)}))} placeholder="Fechas de estancia" style={{ ...ais,marginBottom:8 }}/>
        <input key={h.id+"_d"} defaultValue={h.direccion} onBlur={e=>updTrip(t=>({...t,hotels:t.hotels.map(x=>x.id===h.id?{...x,direccion:e.target.value}:x)}))} placeholder="Dirección" style={ais}/>
      </div>))}
      <button onClick={()=>updTrip(t=>({...t,hotels:[...(t.hotels||[]),emptyHotel()]}))} style={{ ...ab(A.gold+"22",A.gold),width:"100%",border:`1.5px dashed ${A.gold}`,borderRadius:10,fontFamily:BF }}>+ Añadir hotel</button>
    </div>}
    {sec==="maleta"&&<div>
      <div style={{ background:A.card2,borderRadius:14,padding:"14px",marginBottom:14,border:`1px solid ${A.cyan}33` }}>
        <div style={{ fontFamily:ANTON,fontSize:15,color:A.cyan,letterSpacing:1,marginBottom:10,textTransform:"uppercase" }}>Imprescindibles</div>
        {mImpresc.map((item,i)=>(<div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:A.bg,borderRadius:8,marginBottom:6,border:`1px solid ${A.border}` }}><span style={{ fontSize:14 }}>⭐</span><input value={item} onChange={e=>updTrip(t=>({...t,maletaImprescindibles:t.maletaImprescindibles.map((x,j)=>j===i?e.target.value:x)}))} style={{ ...ais,flex:1,padding:"4px 8px",fontSize:14,borderColor:"transparent",background:"transparent",color:A.text }}/><button onClick={()=>updTrip(t=>({...t,maletaImprescindibles:t.maletaImprescindibles.filter((_,j)=>j!==i)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:16,cursor:"pointer" }}>✕</button></div>))}
        <div style={{ display:"flex",gap:8,marginTop:8 }}><input value={newImpresc} onChange={e=>setNewImpresc(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newImpresc.trim()){updTrip(t=>({...t,maletaImprescindibles:[...(t.maletaImprescindibles||[]),newImpresc.trim()]}));setNewImpresc("");}}} placeholder="Añadir imprescindible" style={{ ...ais,flex:1 }}/><button onClick={()=>{if(!newImpresc.trim())return;updTrip(t=>({...t,maletaImprescindibles:[...(t.maletaImprescindibles||[]),newImpresc.trim()]}));setNewImpresc("");}} style={{ ...ab(A.cyan+"22",A.cyan),padding:"8px 14px",border:`1px solid ${A.cyan}44`,flexShrink:0,borderRadius:8,fontFamily:BF }}>+</button></div>
      </div>
      {mCats.map((cat,ci)=>(<div key={cat.id} style={{ background:A.card,borderRadius:14,padding:"14px",marginBottom:10,border:`1px solid ${A.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><span style={{ fontSize:22 }}>{cat.icon}</span><div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,flex:1 }}>{cat.label}</div></div>
        {cat.items.map((item,ii)=>(<div key={ii} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 6px",background:A.bg,borderRadius:6,marginBottom:4 }}><input value={item} onChange={e=>updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:c2.items.map((x,xi)=>xi===ii?e.target.value:x)}:c2)}))} style={{ ...ais,flex:1,padding:"3px 8px",fontSize:13,borderColor:"transparent",background:"transparent",color:A.text }}/><button onClick={()=>updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:c2.items.filter((_,xi)=>xi!==ii)}:c2)}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:14,cursor:"pointer" }}>✕</button></div>))}
        <div style={{ display:"flex",gap:6,marginTop:6 }}><input value={newCatItems[cat.id]||""} onChange={e=>setNewCatItems(x=>({...x,[cat.id]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&(newCatItems[cat.id]||"").trim()){updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:[...c2.items,(newCatItems[cat.id]||"").trim()]}:c2)}));setNewCatItems(x=>({...x,[cat.id]:""}));}}} placeholder={`Añadir a ${cat.label}`} style={{ ...ais,flex:1,fontSize:13 }}/><button onClick={()=>{const v=(newCatItems[cat.id]||"").trim();if(!v)return;updTrip(t=>({...t,maletaCats:t.maletaCats.map((c2,c2i)=>c2i===ci?{...c2,items:[...c2.items,v]}:c2)}));setNewCatItems(x=>({...x,[cat.id]:""}));}} style={{ ...ab(A.border,A.muted),padding:"6px 10px",fontSize:11,flexShrink:0,borderRadius:8,fontFamily:BF }}>+</button></div>
      </div>))}
    </div>}
    {sec==="emerg"&&<div>
      {[{k:"policia",l:"Policía"},{k:"ambulancia",l:"Ambulancia"},{k:"bomberos",l:"Bomberos"},{k:"tourleader",l:"Tour Leader"}].map(item=>(<div key={item.k}><div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>{item.l}</div><input key={item.k} defaultValue={emerg[item.k]||""} onBlur={e=>updTrip(t=>({...t,emergencias:{...(t.emergencias||emptyEmergencias()),[item.k]:e.target.value}}))} style={{ ...ais,marginBottom:12 }}/></div>))}
    </div>}
    {sec==="survey"&&<div>
      <div style={{ background:A.card2,borderRadius:14,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
        <label style={{ display:"flex",gap:12,alignItems:"center",cursor:"pointer",padding:"14px",background:trip.surveyEnabled?A.gold+"15":A.bg,borderRadius:12,border:`2px solid ${trip.surveyEnabled?A.gold:A.border}` }}>
          <input type="checkbox" checked={trip.surveyEnabled||false} onChange={e=>updTrip(t=>({...t,surveyEnabled:e.target.checked}))} style={{ width:22,height:22,accentColor:A.gold }}/>
          <div style={{ fontFamily:BF,fontSize:15,fontWeight:700,color:trip.surveyEnabled?"#fff":A.muted }}>{trip.surveyEnabled?"Encuesta ACTIVA":"Activar encuesta post-viaje"}</div>
        </label>
      </div>
      <div style={{ fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:1,marginBottom:10,textTransform:"uppercase" }}>Categorías de valoración</div>
      {(sc.categories||[]).map((cat,i)=>(<div key={cat.key} style={{ background:A.card,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1px solid ${A.gold}33`,display:"flex",gap:10,alignItems:"center" }}>
        <input value={cat.icon} onChange={e=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:t.surveyConfig.categories.map((c2,j)=>j===i?{...c2,icon:e.target.value}:c2)}}))} style={{ ...ais,width:48,textAlign:"center",fontSize:22,padding:"4px",flexShrink:0 }}/>
        <input value={cat.label} onChange={e=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:t.surveyConfig.categories.map((c2,j)=>j===i?{...c2,label:e.target.value}:c2)}}))} style={{ ...ais,flex:1,fontSize:14 }}/>
        <button onClick={()=>updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:t.surveyConfig.categories.filter((_,j)=>j!==i)}}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button>
      </div>))}
      <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.gold}33`,marginBottom:14 }}>
        <div style={{ fontFamily:BF,fontSize:10,color:A.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Nueva categoría</div>
        <div style={{ display:"grid",gridTemplateColumns:"48px 1fr 80px",gap:8,marginBottom:8 }}>
          <input value={newCatIcon} onChange={e=>setNewCatIcon(e.target.value)} style={{ ...ais,textAlign:"center",fontSize:22,padding:"4px" }}/>
          <input value={newCatLabel} onChange={e=>setNewCatLabel(e.target.value)} placeholder="Nombre" style={ais}/>
          <input value={newCatKey} onChange={e=>setNewCatKey(e.target.value.replace(/\s/g,"_").toLowerCase())} placeholder="clave" style={ais}/>
        </div>
        <select value={newCatTipo} onChange={e=>setNewCatTipo(e.target.value)} style={{ ...ais,marginBottom:10 }}><option value="rating">⭐ Valoración 1-5</option><option value="texto">📝 Pregunta abierta</option></select>
        <button onClick={()=>{if(!newCatLabel.trim()||!newCatKey.trim())return;const key=newCatKey||newCatLabel.toLowerCase().replace(/\s/g,"_");updTrip(t=>({...t,surveyConfig:{...t.surveyConfig,categories:[...(t.surveyConfig?.categories||[]),{key,label:newCatLabel,icon:newCatIcon,tipo:newCatTipo}]}}));setNewCatLabel("");setNewCatKey("");setNewCatIcon("⭐");setNewCatTipo("rating");}} style={{ ...ab(A.gold+"22",A.gold),width:"100%",border:`1px solid ${A.gold}44`,borderRadius:8,fontFamily:BF }}>+ Añadir categoría</button>
      </div>
      {(sc.surveyResponses||[]).length>0&&<div>
        <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>Respuestas ({(sc.surveyResponses||[]).length})</div>
        {(sc.surveyResponses||[]).map((r,i)=>(<div key={i} style={{ background:A.card,borderRadius:12,padding:"14px",marginBottom:10,border:`1px solid ${A.gold}33` }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><div style={{ fontFamily:BF,fontSize:13,color:A.muted }}>Anónima #{i+1}</div><div style={{ fontSize:10,color:A.muted,fontFamily:BF }}>{r.date}</div></div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>{(sc.categories||[]).filter(cat=>cat.tipo!=="texto").map(cat=>r.ratings?.[cat.key]?(<div key={cat.key} style={{ background:A.card2,borderRadius:8,padding:"6px 10px",textAlign:"center",border:`1px solid ${A.border}` }}><div style={{ fontSize:9,color:A.muted,fontFamily:BF,marginBottom:2 }}>{cat.icon} {cat.label}</div><div style={{ fontSize:20 }}>{SURVEY_EMOJIS[(r.ratings[cat.key]||1)-1]}</div><div style={{ fontFamily:ANTON,fontSize:13,color:A.gold }}>{r.ratings[cat.key]}/5</div></div>):null)}</div>
          {r.textAnswers&&Object.entries(r.textAnswers).filter(([,v])=>v).map(([k,v])=>{const cat=(sc.categories||[]).find(c=>c.key===k);return cat?<div key={k} style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:6,fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}><span style={{ color:A.muted }}>{cat.icon} {cat.label}: </span>{v}</div>:null;})}
          {r.mejor&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",marginBottom:6,fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}>👍 {r.mejor}</div>}
          {r.mejora&&<div style={{ background:A.bg,borderRadius:8,padding:"8px 10px",fontSize:12,color:A.text,fontFamily:BF,border:`1px solid ${A.border}` }}>💡 {r.mejora}</div>}
        </div>))}
      </div>}
    </div>}
  </div>);
}

// ── ATRIP WRAPPER (uses all above tabs) ──────────────────
function ATrip({ go, tid, initTab, trips, clients, crm, sT, sC, sCrm }) {
  const trip=trips.find(t=>t.id===tid);
  const [tab,setTab]=useState(initTab||"menu");
  const [editSec,setEditSec]=useState(null);
  const [notes,setNotes]=useState("");
  const passRef=useRef();const[upIdx,setUpIdx]=useState(null);const[passModal,setPassModal]=useState(null);
  const chPassRef=useRef();const[stFilterModal,setStFilterModal]=useState(null);const[rmModal,setRmModal]=useState(null);
  const[roomMenu,setRoomMenu]=useState(null);const[acmpModal,setAcmpModal]=useState(null);const[fpMenu,setFpMenu]=useState(null);
  const[registroPagoModal,setRegistroPagoModal]=useState(false);const[viewPhoto,setViewPhoto]=useState(null);

  useEffect(()=>{ if(trip) setNotes((crm[tid]||{}).notes||""); },[tid]);
  if(!trip) return <div style={{ padding:40,background:A.bg,color:A.muted,minHeight:"100vh",fontFamily:BF }}>Viaje no encontrado</div>;

  const tc=clients.filter(c=>c.tripId===tid);
  const updTrip=async fn=>sT(trips.map(t=>t.id===tid?fn(t):t));
  const updClient=async(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
  const addPass=(file,cid)=>{ const r=new FileReader(); r.onload=e=>updClient(cid,c=>({...c,passportPhoto:e.target.result})); r.readAsDataURL(file); };
  const hasUrgent=c=>(trip.pagosConfig||[]).some((p,i)=>{ const st=(c.pagosEstado||[])[i]; return st!=="pagado"&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)); });
  const setRoommate=async(aId,bId)=>{ sC(clients.map(c=>{ if(c.id===aId) return {...c,roommateId:bId}; if(bId&&c.id===bId) return {...c,roommateId:aId}; if(!bId&&c.roommateId===aId) return {...c,roommateId:null}; return c; })); };

  return(
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
        {tab==="menu"&&(<div style={{ padding:"16px" }}>{CRM_TABS.map(t=>(<button key={t.key} onClick={()=>setTab(t.key)} style={{ width:"100%",background:A.card,borderRadius:16,padding:"16px",marginBottom:12,border:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:16,cursor:"pointer",textAlign:"left" }}><div style={{ width:48,height:48,borderRadius:14,background:A.cyan+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:A.cyan,flexShrink:0 }}>{t.icon}</div><div style={{ flex:1,fontFamily:ANTON,fontSize:18,color:A.text,letterSpacing:1,textTransform:"uppercase" }}>{t.label}</div><div style={{ color:A.muted,fontSize:24 }}>›</div></button>))}</div>)}
        {tab==="people"&&<PeopleTab trip={trip} tc={tc} clients={clients} trips={trips} sC={sC} updTrip={updTrip} updClient={updClient} passRef={passRef} upIdx={upIdx} setUpIdx={setUpIdx} passModal={passModal} setPassModal={setPassModal} chPassRef={chPassRef} addPass={addPass} hasUrgent={hasUrgent} stFilterModal={stFilterModal} setStFilterModal={setStFilterModal} rmModal={rmModal} setRmModal={setRmModal} roomMenu={roomMenu} setRoomMenu={setRoomMenu} acmpModal={acmpModal} setAcmpModal={setAcmpModal} fpMenu={fpMenu} setFpMenu={setFpMenu} setRoommate={setRoommate} setTab={setTab} viewPhoto={viewPhoto} setViewPhoto={setViewPhoto} go={go}/>}
        {tab==="pagos"&&<PagosTab trip={trip} tc={tc} clients={clients} updTrip={updTrip} updClient={updClient} setRegistroPagoModal={setRegistroPagoModal} setTab={setTab}/>}
        {tab==="finanzas"&&<FinanzasTab trip={trip} tc={tc} clients={clients} trips={trips} updTrip={updTrip} setTab={setTab}/>}
        {tab==="ai"&&<AIDocsTab trip={trip} tc={tc} clients={clients} updTrip={updTrip} updClient={updClient} setTab={setTab}/>}
        {tab==="notes"&&<div style={{ padding:"0 16px" }}><button onClick={()=>setTab("menu")} style={{ background:"transparent",border:"none",color:A.cyan,fontSize:14,fontFamily:BF,cursor:"pointer",marginBottom:12,marginTop:12 }}>← Volver al menú</button><textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={()=>sCrm({...crm,[tid]:{...(crm[tid]||{}),notes}})} placeholder="Escribe tus anotaciones..." style={{ ...ais,minHeight:280,resize:"vertical",lineHeight:1.7 }}/><div style={{ fontSize:10,color:A.muted,marginTop:6,textAlign:"right",fontFamily:BF }}>Se guarda al salir del campo</div></div>}
        {tab==="edit"&&<EditTab trip={trip} trips={trips} clients={clients} updTrip={updTrip} updClient={updClient} sC={sC} setTab={setTab} editSec={editSec} setEditSec={setEditSec}/>}
      </div>
      {registroPagoModal&&<RegistroPagoModal trips={trips} clients={clients} tid={tid} sC={sC} onClose={()=>setRegistroPagoModal(false)}/>}
    </div>
  );
}


// ══════════════════════════════════════════════════════════
// ACOMP MODAL
// ══════════════════════════════════════════════════════════
function AcompModal({clientId,clients,updClient,trip,onClose}){
  const client=clients.find(c=>c.id===clientId);
  if(!client)return null;
  const acomp=client.acompanantes||[];
  const pc=trip?.pagosConfig||[];
  const[nombre,setNombre]=useState("");const[room,setRoom]=useState("doble_jun");
  const add=()=>{if(!nombre.trim())return;const a={id:uid(),nombre:nombre.trim(),room,pagosEstado:pc.map(()=>"pendiente"),personalDocs:[]};updClient(clientId,c=>({...c,acompanantes:[...(c.acompanantes||[]),a]}));setNombre("");};
  const upd=(id,fn)=>updClient(clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===id?fn(a):a)}));
  const del=id=>updClient(clientId,c=>({...c,acompanantes:(c.acompanantes||[]).filter(a=>a.id!==id)}));
  return(<AModal title={`Acompañantes de ${client.nombre.split(" ")[0]}`} onClose={onClose}>
    {acomp.length===0&&<AEmpty text="Sin acompañantes"/>}
    {acomp.map(a=>{const rm=ROOMS[a.room||"doble_jun"]||ROOMS.doble_jun;return(<div key={a.id} style={{ background:A.bg,borderRadius:12,padding:"10px 14px",marginBottom:8,border:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:10 }}><div style={{ flex:1 }}><div style={{ fontFamily:ANTON,fontSize:15,color:A.text }}>{a.nombre}</div><div style={{ fontSize:11,color:rm.color,fontFamily:BF }}>{rm.label}</div></div><button onClick={()=>del(a.id)} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer" }}>✕</button></div>);})}
    <div style={{ background:A.card2,borderRadius:10,padding:"12px",border:`1px solid ${A.border}`,marginTop:8 }}>
      <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre del acompañante" style={{ ...ais,marginBottom:10 }}/>
      <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6 }}>Tipo de habitación</div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:12 }}>{Object.entries(ROOMS).map(([k,r])=>(<button key={k} onClick={()=>setRoom(k)} style={{ padding:"6px 10px",borderRadius:8,cursor:"pointer",fontFamily:BF,fontSize:11,border:`2px solid ${room===k?r.color:A.border}`,background:room===k?r.color+"22":"transparent",color:room===k?r.color:A.muted }}>{r.short}</button>))}</div>
      <button onClick={add} disabled={!nombre.trim()} style={{ ...ab(A.purple,A.bg),width:"100%",borderRadius:8,fontFamily:BF,opacity:nombre.trim()?1:0.5 }}>+ Añadir acompañante</button>
    </div>
  </AModal>);
}

// ══════════════════════════════════════════════════════════
// PRIVACIDAD MODAL
// ══════════════════════════════════════════════════════════
function PrivacidadModal({onClose}){
  return(<div style={{ position:"fixed",inset:0,background:"#000",zIndex:10000,overflowY:"auto",padding:"20px 16px" }}>
    <div style={{ maxWidth:560,margin:"0 auto" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div style={{ fontFamily:ANTON,fontSize:20,color:A.cyan,letterSpacing:1 }}>AVISO LEGAL Y PRIVACIDAD</div>
        <button onClick={onClose} style={{ background:"transparent",border:"none",color:A.muted,fontSize:24,cursor:"pointer" }}>✕</button>
      </div>
      {[{t:"Responsable del tratamiento",c:"TRAVELIKE SL — CIF B02628766\nDirección: Ana Karenina 6, 02005 Albacete, España"},{t:"Finalidad",c:"Gestión de reservas, comunicación de servicios contratados e información relacionada con el viaje."},{t:"Legitimación",c:"Ejecución del contrato de servicios turísticos y consentimiento del interesado."},{t:"Destinatarios",c:"No se ceden datos a terceros salvo proveedores turísticos necesarios para la prestación del servicio (aerolíneas, hoteles, aseguradoras)."},{t:"Derechos",c:"Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad y oposición enviando un email a contacto@travelike.es."},{t:"Conservación",c:"Los datos se conservarán durante la relación contractual y el plazo legalmente exigible (5 años)."},{t:"Cookies",c:"Esta aplicación no usa cookies de seguimiento. Solo se almacenan datos funcionales necesarios para la sesión."}].map(item=>(<div key={item.t} style={{ background:A.card,borderRadius:12,padding:"14px",marginBottom:10,border:`1px solid ${A.border}` }}><div style={{ fontFamily:ANTON,fontSize:14,color:A.text,letterSpacing:0.5,marginBottom:6 }}>{item.t}</div><div style={{ fontFamily:BF,fontSize:13,color:A.muted,lineHeight:1.6,whiteSpace:"pre-line" }}>{item.c}</div></div>))}
      <button onClick={onClose} style={{ ...ab(A.cyan,A.bg),width:"100%",borderRadius:12,marginTop:10,fontFamily:BF }}>Cerrar</button>
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════
// PASSPORT (onboarding)
// ══════════════════════════════════════════════════════════
function Passport({go,cid,clients,setClients,trips,sC,logout}){
  const client=clients.find(c=>c.id===cid);
  const[step,setStep]=useState(0);const[photo,setPhoto]=useState(null);const[consentRGPD,setConsentRGPD]=useState(false);const[consentPhoto,setConsentPhoto]=useState(false);const[privModal,setPrivModal]=useState(false);
  const fileRef=useRef();
  if(!client)return null;
  const trip=client.tripId?trips.find(t=>t.id===client.tripId):null;
  const handleFile=async e=>{const f=e.target.files[0];if(!f)return;const url=await fileToDataURL(f);setPhoto(url);};
  const finish=async()=>{await sC(clients.map(c=>c.id===cid?{...c,passportPhoto:photo||c.passportPhoto,passportConsent:true,photoConsent:consentPhoto,consentRGPD,consentDate:new Date().toISOString(),firstLogin:false}:c));go(client.notifEnabled?"client":"notifprompt",{cid});};
  const skip=async()=>{await sC(clients.map(c=>c.id===cid?{...c,firstLogin:false}:c));go(client.notifEnabled?"client":"notifprompt",{cid});};
  return(<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",color:A.text,fontFamily:BF }}>
    <div style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"40px 24px 30px",textAlign:"center",borderBottom:`1px solid ${A.border}` }}>
      <div style={{ fontFamily:ANTON,fontSize:36,color:"#fff",letterSpacing:2,lineHeight:1 }}>¡BIENVENIDO/A!</div>
      <div style={{ fontFamily:BF,fontSize:16,color:A.cyan,marginTop:8,letterSpacing:1 }}>{client.nombre.split(" ")[0]}</div>
      {trip&&<div style={{ fontSize:13,color:A.muted,marginTop:4 }}>{trip.flag} {trip.name}</div>}
    </div>
    <div style={{ padding:"28px 22px" }}>
      {step===0&&(<div>
        <div style={{ fontFamily:ANTON,fontSize:24,color:"#fff",marginBottom:8 }}>ANTES DE EMPEZAR</div>
        <div style={{ fontSize:15,color:A.muted,lineHeight:1.7,marginBottom:24 }}>Vamos a pedirte unos datos para preparar tu viaje al 100%: foto de pasaporte y algunos consentimientos. Es rápido y sencillo.</div>
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:28 }}>{[{icon:"🛂",title:"Foto de pasaporte",desc:"Para preparar los documentos de viaje"},{ icon:"📋",title:"Consentimientos RGPD",desc:"Tratamiento de tus datos personales"},{icon:"📱",title:"Notificaciones push",desc:"Te avisamos de novedades de tu viaje (opcional)"}].map(item=>(<div key={item.title} style={{ background:A.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${A.border}`,display:"flex",gap:12,alignItems:"center" }}><span style={{ fontSize:24 }}>{item.icon}</span><div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:"#fff" }}>{item.title}</div><div style={{ fontSize:12,color:A.muted }}>{item.desc}</div></div></div>))}</div>
        <button onClick={()=>setStep(1)} style={{ ...ab(`linear-gradient(90deg,${A.cyan},#0099bb)`,A.bg),width:"100%",borderRadius:14,padding:"18px",fontFamily:ANTON,fontSize:18,letterSpacing:2,border:"none",textTransform:"uppercase" }}>Empezar</button>
        <button onClick={skip} style={{ width:"100%",background:"transparent",border:"none",color:A.muted,padding:"14px",fontSize:13,cursor:"pointer",marginTop:6 }}>Saltar por ahora</button>
      </div>)}
      {step===1&&(<div>
        <div style={{ fontFamily:ANTON,fontSize:24,color:"#fff",marginBottom:8 }}>FOTO DE PASAPORTE</div>
        <div style={{ fontSize:14,color:A.muted,lineHeight:1.6,marginBottom:20 }}>Sube una foto clara de la página de datos de tu pasaporte o DNI.</div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleFile}/>
        {photo?(<div style={{ borderRadius:14,overflow:"hidden",border:`2px solid ${A.cyan}`,marginBottom:20,position:"relative" }}><img src={photo} alt="Pasaporte" style={{ width:"100%",maxHeight:220,objectFit:"cover",display:"block" }}/><button onClick={()=>{setPhoto(null);fileRef.current.click();}} style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.7)",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontFamily:BF,fontSize:12,cursor:"pointer" }}>Cambiar</button></div>):(<button onClick={()=>fileRef.current.click()} style={{ width:"100%",height:160,background:A.card2,border:`2px dashed ${A.border}`,borderRadius:14,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,marginBottom:20 }}><span style={{ fontSize:40 }}>📷</span><span style={{ fontFamily:BF,fontSize:13,color:A.muted }}>Toca para subir foto</span></button>)}
        <ARow><button onClick={()=>setStep(0)} style={{ ...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`,borderRadius:10,fontFamily:BF }}>Atrás</button><button onClick={()=>setStep(2)} style={{ ...ab(`linear-gradient(90deg,${A.cyan},#0099bb)`,A.bg),flex:2,borderRadius:10,fontFamily:ANTON,fontSize:14,letterSpacing:1,border:"none" }}>{photo?"Continuar →":"Saltar →"}</button></ARow>
      </div>)}
      {step===2&&(<div>
        <div style={{ fontFamily:ANTON,fontSize:24,color:"#fff",marginBottom:8 }}>CONSENTIMIENTOS</div>
        <div style={{ fontSize:14,color:A.muted,lineHeight:1.6,marginBottom:20 }}>Por favor lee y acepta los consentimientos necesarios para gestionar tu reserva.</div>
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:24 }}>
          <label style={{ display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",background:consentRGPD?A.cyan+"15":A.card,borderRadius:14,padding:"16px",border:`2px solid ${consentRGPD?A.cyan:A.border}` }}><input type="checkbox" checked={consentRGPD} onChange={e=>setConsentRGPD(e.target.checked)} style={{ width:22,height:22,marginTop:2,accentColor:A.cyan,flexShrink:0 }}/><div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:"#fff",marginBottom:4 }}>Política de privacidad *</div><div style={{ fontSize:12,color:A.muted,lineHeight:1.6 }}>Acepto el tratamiento de mis datos para la gestión del viaje según la LOPD/RGPD. <button onClick={e=>{e.preventDefault();setPrivModal(true);}} style={{ color:A.cyan,background:"none",border:"none",fontSize:12,cursor:"pointer",padding:0,fontFamily:"inherit",textDecoration:"underline" }}>Leer más</button></div></div></label>
          <label style={{ display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",background:consentPhoto?A.purple+"15":A.card,borderRadius:14,padding:"16px",border:`2px solid ${consentPhoto?A.purple:A.border}` }}><input type="checkbox" checked={consentPhoto} onChange={e=>setConsentPhoto(e.target.checked)} style={{ width:22,height:22,marginTop:2,accentColor:A.purple,flexShrink:0 }}/><div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:"#fff",marginBottom:4 }}>Uso de imágenes (opcional)</div><div style={{ fontSize:12,color:A.muted,lineHeight:1.6 }}>Autorizo a Travelike a usar fotos del viaje en sus redes sociales y web, sin carácter comercial directo.</div></div></label>
        </div>
        <button onClick={finish} disabled={!consentRGPD} style={{ ...ab(consentRGPD?`linear-gradient(90deg,${A.green},#26a047)`:A.card2,consentRGPD?"#fff":A.muted),width:"100%",borderRadius:14,padding:"18px",fontFamily:ANTON,fontSize:18,letterSpacing:2,border:"none",marginBottom:8,textTransform:"uppercase",cursor:consentRGPD?"pointer":"not-allowed" }}>ACCEDER A MI PORTAL</button>
        <button onClick={()=>setStep(1)} style={{ width:"100%",background:"transparent",border:"none",color:A.muted,padding:"10px",fontSize:13,cursor:"pointer" }}>← Atrás</button>
      </div>)}
    </div>
    {privModal&&<PrivacidadModal onClose={()=>setPrivModal(false)}/>}
  </div>);
}

// ══════════════════════════════════════════════════════════
// NOTIF PROMPT
// ══════════════════════════════════════════════════════════
function NotifPrompt({go,cid,clients,sC,logout}){
  const client=clients.find(c=>c.id===cid);const[loading,setLoading]=useState(false);
  if(!client)return null;
  const enable=async()=>{setLoading(true);try{if(typeof window.OneSignal!=="undefined"){await window.OneSignal.init({appId:"3737bebb-bec5-4427-b663-881160aef464",allowLocalhostAsSecureOrigin:true});await window.OneSignal.setExternalUserId(client.id);await window.OneSignal.sendTag("tripId",client.tripId||"none");await window.OneSignal.sendTag("clientId",client.id);}await sC(clients.map(c=>c.id===cid?{...c,notifEnabled:true}:c));}catch(e){console.error(e);}setLoading(false);go("client",{cid});};
  const skip=async()=>{await sC(clients.map(c=>c.id===cid?{...c,notifEnabled:false}:c));go("client",{cid});};
  return(<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",fontFamily:BF }}>
    <div style={{ fontSize:64,marginBottom:20 }}>🔔</div>
    <div style={{ fontFamily:ANTON,fontSize:32,color:"#fff",letterSpacing:2,lineHeight:1,marginBottom:12 }}>NOTIFICACIONES</div>
    <div style={{ fontSize:15,color:A.muted,lineHeight:1.7,marginBottom:32,maxWidth:320 }}>Activa las notificaciones para recibir actualizaciones importantes sobre tu viaje: recordatorios de pago, documentos disponibles y novedades.</div>
    <button onClick={enable} disabled={loading} style={{ ...ab(`linear-gradient(90deg,${A.cyan},#0099bb)`,A.bg),width:"100%",borderRadius:14,padding:"18px",fontFamily:ANTON,fontSize:18,letterSpacing:2,border:"none",marginBottom:12,textTransform:"uppercase",cursor:"pointer" }}>{loading?"Activando...":"SÍ, ACTIVAR"}</button>
    <button onClick={skip} style={{ width:"100%",background:"transparent",border:`1px solid ${A.border}`,color:A.muted,borderRadius:14,padding:"16px",fontFamily:ANTON,fontSize:14,letterSpacing:1,cursor:"pointer" }}>Ahora no</button>
  </div>);
}

// ══════════════════════════════════════════════════════════
// CLIENT PORTAL
// ══════════════════════════════════════════════════════════
function Client({go,cid,clients,trips,logout,sC,sT}){
  const client=clients.find(c=>c.id===cid);
  const[section,setSection]=useState("home");const[lightbox,setLightbox]=useState(null);const[passModal2,setPassModal2]=useState(null);const[acmpView,setAcmpView]=useState(null);
  if(!client)return<NoTrips cl={client} logout={logout}/>;
  const trip=client.tripId?trips.find(t=>t.id===client.tripId):null;
  if(!trip)return<NoTrips cl={client} logout={logout}/>;
  const updClient=fn=>sC(clients.map(c=>c.id===cid?fn(c):c));
  const pc=trip.pagosConfig||[];const pe=client.pagosEstado||pc.map(()=>"pendiente");const maletaMarcados=client.maletaMarcados||[];
  const allPaid=pe.every(s=>s==="pagado");const anyUrgent=pc.some((p,i)=>pe[i]!=="pagado"&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)));
  const passWarnClient=passportWarn(client.passportExpiry)&&!client.passportExpiryDismissed;
  const sc=trip.surveyConfig||{categories:[...DEFAULT_SURVEY_CATS]};
  const clientDocs=(client.personalDocs||[]);
  const acompanantes=client.acompanantes||[];
  const allTargets=[{...client,_isMain:true},...acompanantes.map(a=>({...a,_isAcomp:true,_parentId:client.id}))];
  const currentTarget=acmpView?allTargets.find(t=>t.id===acmpView)||client:client;

  if(section==="survey"){return<SurveyScreen cl={client} trip={trip} clients={clients} sC={sC} trips={trips} sT={sT} logout={logout}/>;}
  if(section==="post-survey"){const lastResp=(sc.surveyResponses||[]).find(r=>r.clientId===cid);return<PostSurveyScreen cl={client} trip={trip} logout={logout}/>;}

  const sections=[
    {k:"home",icon:"🏠",label:"Inicio"},
    {k:"pagos",icon:"💳",label:"Pagos"},
    {k:"vuelos",icon:"✈️",label:"Vuelos"},
    {k:"docs",icon:"📄",label:"Docs"},
    {k:"info",icon:"ℹ️",label:"Info"},
    {k:"maleta",icon:"🎒",label:"Maleta"},
  ];

  return(<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",paddingBottom:70,fontFamily:BF }}>
    <div style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"20px 16px",borderBottom:`1px solid ${A.border}` }}>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:44,height:44,borderRadius:10,overflow:"hidden",background:A.cyan+"22",flexShrink:0,cursor:"pointer" }} onClick={()=>client.passportPhoto&&setLightbox(client.passportPhoto)}>
          {client.passportPhoto?<img src={client.passportPhoto} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:20,color:A.cyan }}>{client.nombre[0]}</div>}
        </div>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontFamily:ANTON,fontSize:18,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{client.nombre}</div>
          <div style={{ fontSize:11,color:A.cyan,fontFamily:BF }}>{trip.flag} {trip.name}</div>
        </div>
        <button onClick={logout} style={{ background:"transparent",border:`1px solid ${A.border}`,borderRadius:8,padding:"5px 10px",color:A.muted,fontSize:11,cursor:"pointer",fontFamily:BF }}>Salir</button>
      </div>
    </div>
    <div style={{ padding:"12px 16px" }}>
      {passWarnClient&&(<div style={{ background:A.orange+"20",border:`2px solid ${A.orange}55`,borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ fontSize:24 }}>⚠️</span>
        <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.orange }}>Tu pasaporte caduca pronto</div><div style={{ fontSize:11,color:A.muted,marginTop:2 }}>Verifica que sigue siendo válido para el viaje (mínimo 6 meses de vigencia)</div></div>
        <button onClick={()=>updClient(c=>({...c,passportExpiryDismissed:true}))} style={{ background:"transparent",border:"none",color:A.muted,fontSize:18,cursor:"pointer",flexShrink:0 }}>✕</button>
      </div>)}
      {trip.surveyEnabled&&!client.surveySubmitted&&(<div style={{ background:A.gold+"20",border:`2px solid ${A.gold}55`,borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:12 }}>
        <span style={{ fontSize:24 }}>⭐</span>
        <div style={{ flex:1 }}><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.gold }}>¡Cuéntanos qué tal el viaje!</div><div style={{ fontSize:11,color:A.muted,marginTop:2 }}>Rellena la encuesta de valoración</div></div>
        <button onClick={()=>setSection("survey")} style={{ background:`linear-gradient(90deg,${A.gold},#cc9900)`,border:"none",borderRadius:8,padding:"8px 14px",color:A.bg,fontFamily:ANTON,fontSize:12,letterSpacing:1,cursor:"pointer",flexShrink:0 }}>Valorar</button>
      </div>)}
      {section==="home"&&(<div>
        <div style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>Tu reserva</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[{l:"Fechas",v:trip.fechas||fmt(trip.date)},{l:"Habitación",v:ROOMS[client.room||"doble_jun"]?.label||"—"},{l:"Estado",v:(ST.find(s=>s.key===client.status)||ST[0]).emoji+" "+(ST.find(s=>s.key===client.status)||ST[0]).label},{l:"Tipo de pago",v:(FORMAS_PAGO.find(f=>f.k===(client.formaPago||"transferencia"))||FORMAS_PAGO[0]).label}].map(item=>(<div key={item.l} style={{ background:A.bg,borderRadius:10,padding:"10px",border:`1px solid ${A.border}` }}><div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>{item.l}</div><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.text }}>{item.v}</div></div>))}
          </div>
        </div>
        <div style={{ background:allPaid?A.green+"15":anyUrgent?A.orange+"15":A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`2px solid ${allPaid?A.green+"44":anyUrgent?A.orange+"44":A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>Estado de pagos</div>
          {pc.map((p,i)=>{const done=pe[i]==="pagado";const urg=!done&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO));const ovd=!done&&isOverdue(p.fechaISO);const imp=(client.pagosImporteCustom||[])[i]||p.importe;return(<div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<pc.length-1?`1px solid ${A.border}33`:"none" }}><div><div style={{ fontFamily:BF,fontSize:14,fontWeight:700,color:done?A.green:urg?A.orange:A.text }}>{done?"✓ ":urg?"⚠️ ":""}{p.label}</div>{p.fechaISO&&!done&&<div style={{ fontSize:11,color:ovd?A.red:urg?A.orange:A.muted }}>Antes del {isoToDisplay(p.fechaISO)}</div>}{done&&<div style={{ fontSize:10,color:A.green }}>Pagado</div>}</div><div style={{ textAlign:"right" }}><div style={{ fontFamily:ANTON,fontSize:16,color:done?A.green:urg?A.orange:A.cyan }}>{imp||"—"}</div></div></div>);})}
          {!allPaid&&(<div style={{ marginTop:14 }}>
            <div style={{ fontFamily:BF,fontSize:10,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>Datos para transferencia</div>
            <div style={{ background:A.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${A.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}><div style={{ fontFamily:BF,fontSize:10,color:A.muted }}>IBAN</div><CopyBtn text={BANK_IBAN} label="Copiar IBAN"/></div>
              <div style={{ fontFamily:ANTON,fontSize:14,color:A.cyan,letterSpacing:1,marginBottom:6 }}>{BANK_IBAN}</div>
              <div style={{ fontFamily:BF,fontSize:12,color:A.muted }}>Titular: <strong style={{ color:A.text }}>{BANK_TITULAR}</strong></div>
            </div>
          </div>)}
        </div>
        {(trip.vuelos||[]).length>0&&(<div style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>✈️ Tus vuelos</div>
          {(trip.vuelos||[]).map((v,i)=>(<div key={i} style={{ padding:"8px 0",borderBottom:i<(trip.vuelos||[]).length-1?`1px solid ${A.border}22`:"none" }}><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.text }}>{v.nombre}</div>{v.archivo&&<div style={{ fontSize:11,color:A.muted }}>{v.archivo}</div>}</div>))}
        </div>)}
        {clientDocs.length>0&&(<div style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>📄 Mis documentos</div>
          {clientDocs.map(doc=>(<div key={doc.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${A.border}22` }}><span style={{ fontSize:18 }}>{doc.tipo==="vuelo"?"✈️":doc.tipo==="seguro"?"🛡️":doc.tipo==="hotel"?"🏨":doc.tipo==="visado"?"🛂":"📄"}</span><div style={{ flex:1,minWidth:0 }}><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{doc.nombre||doc.archivo}</div>{doc.descripcion&&<div style={{ fontSize:11,color:A.muted }}>{doc.descripcion}</div>}</div>{doc.data&&<a href={`data:${doc.mimeType||"application/pdf"};base64,${doc.data}`} download={doc.nombre||"documento"} style={{ background:A.cyan+"22",border:`1px solid ${A.cyan}44`,borderRadius:8,padding:"6px 10px",color:A.cyan,fontSize:11,fontFamily:BF,fontWeight:700,textDecoration:"none",flexShrink:0 }}>↓</a>}</div>))}
        </div>)}
        {(trip.hotels||[]).length>0&&(<div style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>🏨 Alojamientos</div>
          {(trip.hotels||[]).map((h,i)=>(<div key={h.id||i} style={{ padding:"8px 0",borderBottom:i<(trip.hotels||[]).length-1?`1px solid ${A.border}22`:"none" }}><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.text }}>{h.nombre}</div>{h.fechasEstancia&&<div style={{ fontSize:11,color:A.cyan }}>{h.fechasEstancia}</div>}{h.direccion&&<div style={{ fontSize:11,color:A.muted }}>{h.direccion}</div>}</div>))}
        </div>)}
        {(trip.info||[]).length>0&&(<div style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>ℹ️ Información del viaje</div>
          {(trip.info||[]).map((it,i)=>(<div key={i} style={{ display:"flex",gap:10,padding:"8px 0",borderBottom:i<(trip.info||[]).length-1?`1px solid ${A.border}22`:"none" }}><span style={{ fontSize:20 }}>{it.icono}</span><div><div style={{ fontFamily:BF,fontSize:13,fontWeight:700,color:A.text }}>{it.titulo}</div><div style={{ fontSize:12,color:A.muted,lineHeight:1.6,marginTop:2 }}>{it.texto}</div>{it.url&&<a href={it.url} target="_blank" rel="noreferrer" style={{ fontSize:11,color:A.cyan,display:"block",marginTop:3,wordBreak:"break-all" }}>🔗 {it.url}</a>}</div></div>))}
        </div>)}
        {(trip.emergencias?.tourleader||trip.emergencias?.policia)&&(<div style={{ background:A.red+"15",borderRadius:16,padding:"16px",marginBottom:14,border:`2px solid ${A.red}44` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.red,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>🆘 Contactos de emergencia</div>
          {[{l:"Tour Leader",v:trip.emergencias.tourleader},{l:"Policía",v:trip.emergencias.policia},{l:"Ambulancia",v:trip.emergencias.ambulancia},{l:"Bomberos",v:trip.emergencias.bomberos}].filter(x=>x.v).map(item=>(<div key={item.l} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${A.red}22` }}><div style={{ fontFamily:BF,fontSize:13,color:A.muted }}>{item.l}</div><a href={`tel:${item.v}`} style={{ fontFamily:ANTON,fontSize:16,color:A.red,letterSpacing:0.5,textDecoration:"none" }}>{item.v}</a></div>))}
        </div>)}
      </div>)}
      {section==="maleta"&&(<div>
        <div style={{ fontFamily:ANTON,fontSize:20,color:"#fff",letterSpacing:1,marginBottom:16,textTransform:"uppercase" }}>🎒 Lista de equipaje</div>
        <div style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${A.cyan}33` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.cyan,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>⭐ Imprescindibles</div>
          {(trip.maletaImprescindibles||DEFAULT_IMPRESCINDIBLES).map((item,i)=>{const checked=maletaMarcados.includes(`imp_${i}`);return(<label key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<(trip.maletaImprescindibles||DEFAULT_IMPRESCINDIBLES).length-1?`1px solid ${A.border}22`:"none",cursor:"pointer" }}><div style={{ width:22,height:22,borderRadius:6,border:`2px solid ${checked?A.cyan:A.border}`,background:checked?A.cyan:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>updClient(c=>({...c,maletaMarcados:checked?maletaMarcados.filter(x=>x!==`imp_${i}`):[...maletaMarcados,`imp_${i}`]}))}>{checked&&<span style={{ color:A.bg,fontSize:14,fontWeight:700 }}>✓</span>}</div><span style={{ fontFamily:BF,fontSize:14,color:checked?A.muted:A.text,textDecoration:checked?"line-through":"none" }}>{item}</span></label>);})}
        </div>
        {(trip.maletaCats||DEFAULT_MALETA_CATS).map(cat=>(<div key={cat.id} style={{ background:A.card,borderRadius:16,padding:"16px",marginBottom:10,border:`1px solid ${A.border}` }}>
          <div style={{ fontFamily:BF,fontSize:9,color:A.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10 }}>{cat.icon} {cat.label}</div>
          {cat.items.map((item,ii)=>{const key=`${cat.id}_${ii}`;const checked=maletaMarcados.includes(key);return(<label key={ii} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:ii<cat.items.length-1?`1px solid ${A.border}22`:"none",cursor:"pointer" }}><div style={{ width:20,height:20,borderRadius:5,border:`2px solid ${checked?A.cyan:A.border}`,background:checked?A.cyan:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={()=>updClient(c=>({...c,maletaMarcados:checked?maletaMarcados.filter(x=>x!==key):[...maletaMarcados,key]}))}>{checked&&<span style={{ color:A.bg,fontSize:12,fontWeight:700 }}>✓</span>}</div><span style={{ fontFamily:BF,fontSize:13,color:checked?A.muted:A.text,textDecoration:checked?"line-through":"none" }}>{item}</span></label>);})}
        </div>))}
        <button onClick={()=>updClient(c=>({...c,maletaMarcados:[]}))} style={{ width:"100%",background:"transparent",border:`1px solid ${A.border}`,borderRadius:10,padding:"10px",color:A.muted,fontFamily:BF,fontSize:12,cursor:"pointer",marginTop:8 }}>🔄 Reiniciar lista</button>
      </div>)}
    </div>
    <div style={{ position:"fixed",bottom:0,left:0,right:0,maxWidth:560,margin:"0 auto",background:A.card2,borderTop:`1px solid ${A.border}`,display:"flex",zIndex:100,backdropFilter:"blur(10px)" }}>
      {sections.map(s=>(<button key={s.k} onClick={()=>setSection(s.k)} style={{ flex:1,background:"transparent",border:"none",borderTop:`3px solid ${section===s.k?A.cyan:"transparent"}`,padding:"8px 4px 10px",color:section===s.k?A.cyan:A.muted,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}><span style={{ fontSize:section===s.k?22:18,transition:"font-size 0.1s" }}>{s.icon}</span><span style={{ fontFamily:BF,fontSize:9,fontWeight:700,letterSpacing:1 }}>{s.label}</span></button>))}
    </div>
    {lightbox&&<Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>}
  </div>);
}

// ══════════════════════════════════════════════════════════
// SURVEY SCREEN
// ══════════════════════════════════════════════════════════
function SurveyScreen({cl,trip,clients,sC,trips,sT,logout}){
  const sc=trip.surveyConfig||{categories:[...DEFAULT_SURVEY_CATS]};
  const[ratings,setRatings]=useState({});const[textAnswers,setTextAnswers]=useState({});const[mejor,setMejor]=useState("");const[mejora,setMejora]=useState("");const[sending,setSending]=useState(false);
  const submit=async()=>{setSending(true);const response={clientId:cl.id,date:new Date().toLocaleDateString("es-ES"),ratings,textAnswers,mejor,mejora};await sT(trips.map(t=>t.id===trip.id?{...t,surveyConfig:{...t.surveyConfig,surveyResponses:[...(t.surveyConfig?.surveyResponses||[]),response]}}:t));await sC(clients.map(c=>c.id===cl.id?{...c,surveySubmitted:true}:c));setSending(false);};
  return(<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",paddingBottom:40,fontFamily:BF }}>
    <div style={{ background:"linear-gradient(135deg,#070718 0%,#0f1f3d 60%,#07070f 100%)",padding:"24px 20px",borderBottom:`1px solid ${A.border}` }}>
      <div style={{ fontFamily:ANTON,fontSize:28,color:"#fff",letterSpacing:1,textTransform:"uppercase",lineHeight:1,marginBottom:4 }}>¿QUÉ TAL EL VIAJE?</div>
      <div style={{ fontSize:13,color:A.muted }}>{trip.flag} {trip.name}</div>
    </div>
    <div style={{ padding:"20px 16px" }}>
      {(sc.categories||[]).map(cat=>{if(cat.tipo==="texto")return(<div key={cat.key} style={{ marginBottom:16 }}><div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>{cat.icon} {cat.label}</div><textarea value={textAnswers[cat.key]||""} onChange={e=>setTextAnswers(x=>({...x,[cat.key]:e.target.value}))} placeholder="Escribe tu respuesta..." rows={3} style={{ ...ais,resize:"vertical",lineHeight:1.6 }}/></div>);return(<RatingRow key={cat.key} label={cat.label} icon={cat.icon} value={ratings[cat.key]||0} onChange={v=>setRatings(x=>({...x,[cat.key]:v}))}/>);})}
      <div style={{ background:A.card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${A.border}` }}><div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>👍 Lo mejor del viaje</div><textarea value={mejor} onChange={e=>setMejor(e.target.value)} placeholder="¿Qué fue lo mejor?" rows={2} style={{ ...ais,resize:"vertical",lineHeight:1.5 }}/></div>
      <div style={{ background:A.card,borderRadius:14,padding:"14px 16px",marginBottom:24,border:`1px solid ${A.border}` }}><div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8 }}>💡 ¿Qué mejorarías?</div><textarea value={mejora} onChange={e=>setMejora(e.target.value)} placeholder="Sugerencias de mejora..." rows={2} style={{ ...ais,resize:"vertical",lineHeight:1.5 }}/></div>
      <button onClick={submit} disabled={sending} style={{ ...ab(`linear-gradient(90deg,${A.gold},#cc9900)`,A.bg),width:"100%",padding:"18px",borderRadius:14,fontFamily:ANTON,fontSize:18,letterSpacing:2,border:"none",textTransform:"uppercase",cursor:"pointer",marginBottom:8 }}>{sending?"Enviando...":"ENVIAR VALORACIÓN ⭐"}</button>
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════
// POST SURVEY
// ══════════════════════════════════════════════════════════
function PostSurveyScreen({cl,trip,logout}){
  return(<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",fontFamily:BF }}>
    <div style={{ fontSize:64,marginBottom:20 }}>🎉</div>
    <div style={{ fontFamily:ANTON,fontSize:32,color:A.gold,letterSpacing:2,lineHeight:1,marginBottom:12 }}>¡GRACIAS!</div>
    <div style={{ fontSize:16,color:A.muted,lineHeight:1.7,marginBottom:32,maxWidth:320 }}>Tu valoración nos ayuda a mejorar cada viaje. ¡Hasta la próxima aventura!</div>
    <button onClick={logout} style={{ background:"transparent",border:`1px solid ${A.border}`,borderRadius:14,padding:"14px 40px",color:A.muted,fontFamily:BF,fontSize:14,cursor:"pointer" }}>Salir</button>
  </div>);
}

// ══════════════════════════════════════════════════════════
// NO TRIPS
// ══════════════════════════════════════════════════════════
function NoTrips({cl,logout}){
  return(<div style={{ background:A.bg,minHeight:"100vh",maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",fontFamily:BF }}>
    <div style={{ fontSize:64,marginBottom:20 }}>🌍</div>
    <div style={{ fontFamily:ANTON,fontSize:28,color:"#fff",letterSpacing:2,lineHeight:1,marginBottom:8 }}>¡HOLA{cl?.nombre?", "+cl.nombre.split(" ")[0]:""}!</div>
    <div style={{ fontSize:15,color:A.muted,lineHeight:1.7,marginBottom:32,maxWidth:300 }}>Tu perfil está registrado pero aún no tienes un viaje asignado. ¡Pronto tendrás acceso a todos los detalles de tu aventura!</div>
    <div style={{ background:A.card,borderRadius:16,padding:"20px",marginBottom:32,border:`1px solid ${A.border}`,width:"100%" }}>
      <div style={{ fontFamily:BF,fontSize:11,color:A.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:12 }}>¿Dudas? Contáctanos</div>
      <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noreferrer" style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:A.green+"22",border:`1px solid ${A.green}44`,borderRadius:12,padding:"14px",color:A.green,fontFamily:ANTON,fontSize:14,letterSpacing:1,textDecoration:"none",textTransform:"uppercase" }}>💬 WhatsApp Travelike</a>
    </div>
    <button onClick={logout} style={{ background:"transparent",border:`1px solid ${A.border}`,borderRadius:12,padding:"12px 32px",color:A.muted,fontFamily:BF,fontSize:13,cursor:"pointer" }}>Cerrar sesión</button>
  </div>);
}
