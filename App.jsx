import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════
     TRAVELIKE CRM · Netlify Edition
     Storage : localStorage  (sin límite de usuarios compartido)
     IA Docs : requiere API Key de Anthropic (se guarda local)
     Logo    : busca <!-- LOGO SVG --> para cambiar por tu imagen
     PIN     : 1234  ← cámbialo en ADMIN_PIN
  ═══════════════════════════════════════════════════════════ */

  /* ── Constantes ─────────────────────────────────────────── */
  const ADMIN_PIN   = "1234";
  const SK_T        = 'tv7-trips';
  const SK_C        = 'tv7-clients';
  const SK_CRM      = 'tv7-crm';
  const SK_SES      = 'tv7-session';
  const SK_KEY      = 'tv7-apikey';
  const BANK_IBAN   = 'ES48 0128 0690 9001 0008 6284';
  const BANK_TITULAR= 'TraveLike';
  const WA_NUM      = '34600000000'; // ← pon el número real sin espacios

  const uid    = () => Math.random().toString(36).slice(2,10);
  const genCode= () => Math.random().toString(36).slice(2,8).toUpperCase();
  const MES    = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  const MES_F  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
                  'Septiembre','Octubre','Noviembre','Diciembre'];
  const NOW    = new Date();
  const CUR    = `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}`;

  const fmt       = d => { if(!d) return ''; const [y,m]=d.split('-'); return `${MES[+m-1]} ${y}`; };
  const isPast    = d => d < CUR;
  const parseISO  = s => { if(!s) return null; try{ const d=new Date(s); return isNaN(d.getTime())?null:d; }catch{ return null; } };
  const daysDiff  = s => { const d=parseISO(s); if(!d) return null; return (d-NOW)/864e5; };
  const isUrgent  = s => { const n=daysDiff(s); return n!==null&&n>=0&&n<=7; };
  const isOverdue = s => { const n=daysDiff(s); return n!==null&&n<0; };
  const emptyT    = () => ({ vuelos:[], docs:[],
    pagosConfig:[{label:'Reserva',fecha:'',fechaISO:'',importe:''},{label:'2º Pago',fecha:'',fechaISO:'',importe:''},{label:'Pago final',fecha:'',fechaISO:'',importe:''}],
    info:[], webUrl:'' });
  const emptyCRM   = () => ({ notes:'' });
  const emptyAcomp = () => ({ id:uid(),nombre:'',passportPhoto:null,passportConsent:false,photoConsent:false,pagosEstado:[],personalDocs:[] });
  const fileToB64  = file => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=e=>res(e.target.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file); });
  const genConcepto= (pL,tN,cN) => { const t=tN.replace(/[&]/g,'').replace(/\s+/g,' ').trim().split(' ').slice(0,2).join(' ').toUpperCase(); return `${pL.toUpperCase()} ${t} - ${cN.toUpperCase()}`; };

  /* ── Design tokens ──────────────────────────────────────── */
  const A = { bg:'#07070f',card:'#0f1824',card2:'#172030',border:'#1e3a5f',
              text:'#f0f4ff',muted:'#556677',cyan:'#00f0ff',gold:'#ffc847',
              green:'#34C759',red:'#e8002a',orange:'#FF9500',purple:'#BF5FFF' };
  const ANTON  = "'Anton',sans-serif";
  const BARLOW = "'Barlow Condensed',sans-serif";
  const ais    = { width:'100%',background:A.bg,border:`1px solid ${A.border}`,borderRadius:8,
                   color:A.text,fontSize:15,padding:'11px 13px',outline:'none',fontFamily:BARLOW,boxSizing:'border-box' };
  const ab     = (bg,fg='#fff') => ({ background:bg,border:'none',color:fg,borderRadius:8,
                                       padding:'11px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:BARLOW });

  /* ── DB — localStorage ──────────────────────────────────── */
  const db = {
    async get(k) {
      try { const v=localStorage.getItem(k); return v ? JSON.parse(v) : null; }
      catch { return null; }
    },
    async set(k,v) {
      try { localStorage.setItem(k, JSON.stringify(v)); }
      catch { console.warn('localStorage lleno:', k); }
    }
  };

  /* ── Datos estáticos ────────────────────────────────────── */
  const ST = [
    {key:'interesado', label:'Interesado', emoji:'🤔',color:'#FF9500'},
    {key:'confirmado', label:'Confirmado', emoji:'✅',color:'#34C759'},
    {key:'pagado',     label:'Pagado',     emoji:'💰',color:'#00f0ff'},
    {key:'cancelado',  label:'Cancelado',  emoji:'🚫',color:'#e8002a'},
  ];
  const ROOMS = {
    doble:     {label:'🛏🛏 Doble',          short:'Doble',      cap:2,color:A.cyan},
    individual:{label:'🛏 Individual',        short:'Individual', cap:1,color:A.orange},
    triple:    {label:'🛏🛏🛏 Triple',        short:'Triple',     cap:3,color:A.gold},
    cuadruple: {label:'🛏×4 Cuádruple',       short:'Cuádruple',  cap:4,color:A.purple},
    busca:     {label:'🔍 Busca compañero/a', short:'Busca',      cap:2,color:'#FF6B6B'},
  };
  const CRM_TABS = [
    {key:'people',icon:'👥',label:'Viajeros'},
    {key:'pagos', icon:'💳',label:'Pagos'},
    {key:'ai',    icon:'🤖',label:'IA Docs'},
    {key:'notes', icon:'📝',label:'Notas'},
    {key:'edit',  icon:'✏️',label:'Editar'},
  ];

  /* ── OneSignal ──────────────────────────────────────────── */
  const OS_APP_ID = 'a53d37c2-d328-48e0-84e4-1a3a71db77ad';
  const OS_KEY    = 'jxvhjotofu75udz7qhtq72w3o';
  const SK_NOTIF  = 'tv7-notif-asked';

  const osSend = async ({title, body, tripId=null, scheduleISO=null}) => {
    const payload = {
      app_id: OS_APP_ID,
      headings: {es:title, en:title},
      contents: {es:body,  en:body},
    };
    if(tripId) payload.filters = [{field:'tag',key:'tripId',relation:'=',value:tripId}];
    else       payload.included_segments = ['All'];
    if(scheduleISO) payload.send_after = scheduleISO;
    try {
      const r = await fetch('https://onesignal.com/api/v1/notifications',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Basic '+OS_KEY},
        body:JSON.stringify(payload),
      });
      return await r.json();
    } catch(e){ return {errors:[e.message]}; }
  };

  const osTag = (tripId) => {
    try {
      if(window.OneSignalDeferred){
        window.OneSignalDeferred.push(async (OS)=>{ await OS.User.addTag('tripId',tripId||'none'); });
      }
    } catch(e){}
  };

  const osAsk = () => {
    try {
      if(window.OneSignalDeferred){
        window.OneSignalDeferred.push(async (OS)=>{ await OS.Notifications.requestPermission(); });
      }
    } catch(e){}
  };

  const DT = [
    { id:'t_nyc',flag:'🗽',name:'Nueva York & Washington',date:'2026-12',price:2100,
      fechas:'1 — 8 Diciembre 2026',webUrl:'',
      vuelos:[{id:'v1',nombre:'IDA — Madrid › Nueva York (IB6251)',archivo:'IB6251_MAD_JFK.pdf'},
              {id:'v2',nombre:'VUELTA — Nueva York › Madrid (IB6252)',archivo:'IB6252_JFK_MAD.pdf'}],
      docs:[{id:'d1',nombre:'Seguro médico de viaje',archivo:'Poliza_seguro.pdf'},
            {id:'d2',nombre:'Información ESTA',archivo:'ESTA_Info.pdf'}],
      pagosConfig:[{label:'Reserva',fecha:'15 Ago 2026',fechaISO:'2026-08-15',importe:'600 €'},
                   {label:'Segundo pago',fecha:'15 Oct 2026',fechaISO:'2026-10-15',importe:'800 €'},
                   {label:'Pago final',fecha:'1 Nov 2026',fechaISO:'2026-11-01',importe:'700 €'}],
      info:[{icono:'🔌',titulo:'Enchufes',texto:'Tipo A/B. Voltaje 120V. Necesitas adaptador.'},
            {icono:'💵',titulo:'Moneda',texto:'Dólar ($). Tarjeta funciona bien, lleva algo de efectivo.'},
            {icono:'🌡️',titulo:'Temperatura',texto:'Diciembre: -2°C a 8°C. Lleva abrigo, guantes y bufanda.'},
            {icono:'📱',titulo:'Teléfono',texto:'Activa el roaming o compra una eSIM antes de salir.'}],
    },
    { id:'t_japon',flag:'⛩️',name:'Japón',date:'2026-11',price:2970,
      fechas:'15 Nov — 2 Dic 2026',webUrl:'',...emptyT() },
  ];
  const DC = [
    { id:'cl1',nombre:'Carmen García',email:'carmen@email.com',tripId:'t_nyc',code:'CARMEN',
      status:'confirmado',room:'doble',note:'',pagosEstado:['pagado','pagado','pendiente'],
      personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,
      roommateId:null,acompanantes:[{id:'ac1',nombre:'Pedro García',passportPhoto:null,
      passportConsent:false,photoConsent:false,pagosEstado:['pagado','pagado','pendiente'],personalDocs:[]}] },
    { id:'cl2',nombre:'Antonio Rodríguez',email:'antonio@email.com',tripId:'t_nyc',code:'ANTROD',
      status:'pagado',room:'individual',note:'',pagosEstado:['pagado','pagado','pagado'],
      personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:true,firstLogin:true,
      roommateId:null,acompanantes:[] },
    { id:'cl3',nombre:'María López',email:'maria@email.com',tripId:'t_nyc',code:'MARLOP',
      status:'confirmado',room:'busca',note:'Busca compañera',pagosEstado:['pagado','pendiente','pendiente'],
      personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,
      roommateId:null,acompanantes:[] },
  ];

  /* ═══════════════════════════════════════════════════════════
     <!-- LOGO SVG -->
     Para usar tu logo real, reemplaza este componente por:
       <img src="logo-travelike.png" style={{height:size}} alt="Travelike"/>
     o un <img> con URL absoluta de tu CDN.
  ═══════════════════════════════════════════════════════════ */
  function TravelikeLogo({ size=48, glow=true }) {
    const planeSize = Math.round(size * 0.68);
    return (
      <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
        {/* Avión de papel */}
        <svg width={planeSize} height={planeSize} viewBox="0 0 36 36" fill="none">
          <polygon points="2,18 34,4 26,18 34,32" fill="none" stroke="#00f0ff" strokeWidth="2.4" strokeLinejoin="round"/>
          <polyline points="26,18 14,22 16,30 20,24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          <line x1="14" y1="22" x2="26" y2="18" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </svg>
        {/* Wordmark */}
        <span style={{
          fontFamily: ANTON,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: 2,
          textShadow: glow ? `0 0 32px rgba(0,240,255,0.35)` : 'none',
        }}>
          <span style={{ color:'#ffffff' }}>TRAVE</span>
          <span style={{ color:'#00f0ff' }}>LIKE</span>
        </span>
      </div>
    );
  }

  /* ── Helpers de UI ──────────────────────────────────────── */
  function AModal({title,onClose,children}){
    return(
      <div style={{position:'fixed',inset:0,background:'#000000CC',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:50}}
           onClick={onClose}>
        <div onClick={e=>e.stopPropagation()}
             style={{background:A.card2,borderRadius:'20px 20px 0 0',padding:'20px 16px 40px',
                     width:'100%',maxWidth:480,boxSizing:'border-box',maxHeight:'90vh',overflowY:'auto',fontFamily:BARLOW}}>
          <div style={{width:40,height:4,background:A.border,borderRadius:2,margin:'0 auto 16px'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontFamily:ANTON,fontSize:18,color:A.text,letterSpacing:1,textTransform:'uppercase'}}>{title}</span>
            <button onClick={onClose} style={{background:'transparent',border:'none',color:A.muted,fontSize:24,cursor:'pointer',lineHeight:1}}>×</button>
          </div>
          {children}
        </div>
      </div>
    );
  }
  function ARow({children}){ return <div style={{display:'flex',gap:10,marginTop:14}}>{children}</div>; }
  function AEmpty({text}){ return <div style={{textAlign:'center',color:A.muted,padding:'32px 0',fontSize:14,fontFamily:BARLOW}}>{text}</div>; }
  function Lightbox({src,onClose}){
    return <div onClick={onClose} style={{position:'fixed',inset:0,background:'#000000EE',display:'flex',
            alignItems:'center',justifyContent:'center',zIndex:100,padding:20}}>
      <img src={src} style={{maxWidth:'100%',maxHeight:'90vh',borderRadius:12,objectFit:'contain'}} alt=""/>
    </div>;
  }
  function CEmpty({text}){
    return(
      <div style={{textAlign:'center',padding:'40px 24px',color:A.muted,background:A.card,
                   borderRadius:16,border:`1px solid ${A.border}`,marginBottom:16}}>
        <div style={{fontSize:44,marginBottom:12}}>📭</div>
        <div style={{fontFamily:BARLOW,fontSize:17,lineHeight:1.6}}>{text}</div>
      </div>
    );
  }
  function CFileCard({emoji,nombre,archivo}){
    return(
      <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:18,padding:'20px 22px',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
          <div style={{width:58,height:58,borderRadius:14,background:A.cyan+'15',display:'flex',alignItems:'center',
                       justifyContent:'center',fontSize:28,flexShrink:0}}>{emoji}</div>
          <div>
            <div style={{fontFamily:ANTON,fontSize:18,color:'#fff',letterSpacing:1,lineHeight:1.2,
                         textTransform:'uppercase',marginBottom:4}}>{nombre}</div>
            <div style={{fontFamily:BARLOW,fontSize:14,color:A.muted}}>{archivo}</div>
          </div>
        </div>
        <button style={{width:'100%',padding:'15px',border:'none',borderRadius:10,fontFamily:ANTON,
                        fontSize:15,letterSpacing:3,cursor:'pointer',textTransform:'uppercase',
                        background:`linear-gradient(90deg,${A.red},#c00020)`,color:'#fff',
                        boxShadow:'0 0 18px rgba(232,0,42,0.25)'}}>⬇ DESCARGAR ARCHIVO</button>
      </div>
    );
  }
  function CopyBtn({text,label='📋 Copiar'}){
    const [ok,setOk]=useState(false);
    return(
      <button onClick={()=>{navigator.clipboard.writeText(text).then(()=>{setOk(true);setTimeout(()=>setOk(false),2500);}).catch(()=>{});}}
              style={{flexShrink:0,background:ok?A.green+'22':A.cyan+'22',border:`1px solid ${ok?A.green:A.cyan}44`,
                      color:ok?A.green:A.cyan,borderRadius:6,padding:'5px 11px',fontSize:11,fontWeight:700,
                      cursor:'pointer',fontFamily:BARLOW,whiteSpace:'nowrap'}}>{ok?'✓ Copiado':label}</button>
    );
  }
  function RoomMenu({current,onSelect,onClose}){
    return(
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'flex-end',
                   justifyContent:'center',zIndex:80}} onClick={onClose}>
        <div onClick={e=>e.stopPropagation()}
             style={{background:A.card2,borderRadius:'20px 20px 0 0',padding:'16px 16px 36px',
                     width:'100%',maxWidth:480,fontFamily:BARLOW}}>
          <div style={{width:40,height:4,background:A.border,borderRadius:2,margin:'0 auto 16px'}}/>
          <div style={{fontFamily:ANTON,fontSize:14,color:A.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:12,textAlign:'center'}}>Tipo de habitación</div>
          {Object.entries(ROOMS).map(([k,r])=>(
            <button key={k} onClick={()=>{onSelect(k);onClose();}}
                    style={{display:'flex',alignItems:'center',gap:12,width:'100%',
                            background:current===k?r.color+'18':A.bg,border:`2px solid ${current===k?r.color:A.border}`,
                            borderRadius:14,padding:'13px 16px',marginBottom:7,cursor:'pointer',fontFamily:BARLOW}}>
              <span style={{fontSize:16,color:current===k?r.color:'#fff',flex:1,textAlign:'left',fontWeight:700,letterSpacing:0.5}}>{r.label}</span>
              {current===k&&<span style={{color:r.color,fontSize:18,fontWeight:900}}>✓</span>}
            </button>
          ))}
          <button onClick={onClose} style={{...ab(A.card,A.muted),width:'100%',border:`1px solid ${A.border}`,borderRadius:12,marginTop:4}}>Cancelar</button>
        </div>
      </div>
    );
  }
  function SwipeableTabs({tabs,activeTab,onTabChange,children}){
    const sx=useRef(null),sy=useRef(null),sw=useRef(false);
    const oTS=e=>{sx.current=e.touches[0].clientX;sy.current=e.touches[0].clientY;sw.current=false;};
    const oTM=e=>{if(!sx.current)return;const dx=Math.abs(e.touches[0].clientX-sx.current),dy=Math.abs(e.touches[0].clientY-sy.current);if(dx>dy&&dx>10)sw.current=true;};
    const oTE=e=>{if(!sx.current||!sw.current)return;const dx=e.changedTouches[0].clientX-sx.current,keys=tabs.map(t=>t.key),cur=keys.indexOf(activeTab);if(Math.abs(dx)>50){if(dx<0&&cur<keys.length-1)onTabChange(keys[cur+1]);if(dx>0&&cur>0)onTabChange(keys[cur-1]);}sx.current=null;sw.current=false;};
    return <div onTouchStart={oTS} onTouchMove={oTM} onTouchEnd={oTE} style={{flex:1}}>{children}</div>;
  }
  function AcompModal({clientId,clients,updClient,trip,onClose}){
    const cl=clients.find(c=>c.id===clientId);
    const [nombre,setNombre]=useState('');
    const refs=useRef({});
    const acomps=cl?.acompanantes||[];
    const add=()=>{if(!nombre.trim())return;const pe=(trip?.pagosConfig||[]).map(()=>'pendiente');updClient(clientId,c=>({...c,acompanantes:[...(c.acompanantes||[]),{...emptyAcomp(),nombre:nombre.trim(),pagosEstado:pe}]}));setNombre('');};
    const del=id=>updClient(clientId,c=>({...c,acompanantes:(c.acompanantes||[]).filter(a=>a.id!==id)}));
    const uploadPhoto=(acId,file)=>{const r=new FileReader();r.onload=e=>updClient(clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===acId?{...a,passportPhoto:e.target.result}:a)}));r.readAsDataURL(file);};
    return(
      <AModal title="👥 Acompañantes" onClose={onClose}>
        <div style={{fontSize:13,color:A.muted,fontFamily:BARLOW,marginBottom:14,lineHeight:1.55}}>Personas que viajan en la misma reserva que <strong style={{color:A.text}}>{cl?.nombre}</strong>.</div>
        {acomps.length===0&&<div style={{textAlign:'center',padding:'16px 0',color:A.muted,fontSize:13,fontFamily:BARLOW}}>Sin acompañantes todavía</div>}
        {acomps.map(ac=>(
          <div key={ac.id} onClick={()=>refs.current[ac.id]?.click()}
               style={{background:A.bg,borderRadius:12,padding:'10px 12px',marginBottom:8,
                       border:`1px solid ${ac.passportPhoto?A.green+'44':A.border}`,display:'flex',gap:10,alignItems:'center',cursor:'pointer'}}>
            <div style={{width:44,height:44,borderRadius:10,overflow:'hidden',border:`2px solid ${ac.passportPhoto?A.green:A.border}`,flexShrink:0,background:A.card,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {ac.passportPhoto?<img src={ac.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<span style={{fontSize:18,color:A.muted}}>📷</span>}
            </div>
            <input ref={el=>{if(el)refs.current[ac.id]=el;}} type="file" accept="image/*" capture="environment"
                   style={{display:'none'}} onClick={e=>e.stopPropagation()}
                   onChange={e=>{if(e.target.files[0])uploadPhoto(ac.id,e.target.files[0]);}}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:BARLOW,fontSize:15,fontWeight:700,color:A.text}}>{ac.nombre}</div>
              <div style={{fontSize:10,color:ac.passportPhoto?A.green:A.muted,fontFamily:BARLOW}}>{ac.passportPhoto?'✓ Pasaporte subido':'Toca para subir pasaporte'}</div>
            </div>
            <button onClick={e=>{e.stopPropagation();del(ac.id);}} style={{background:'transparent',border:'none',color:A.muted,fontSize:20,cursor:'pointer',lineHeight:1}}>×</button>
          </div>
        ))}
        <div style={{display:'flex',gap:8,marginTop:10}}>
          <input value={nombre} onChange={e=>setNombre(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Nombre del acompañante" style={{...ais,flex:1}}/>
          <button onClick={add} style={{...ab(A.cyan),color:A.bg,padding:'11px 18px',flexShrink:0,borderRadius:8}}>+</button>
        </div>
      </AModal>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     APP ROOT
  ═══════════════════════════════════════════════════════════ */
  function App(){
    const [screen,setScreen]=useState('splash');
    const [trips,setTrips]=useState([]);
    const [clients,setClients]=useState([]);
    const [crm,setCrm]=useState({});
    const [nav,setNav]=useState({});
    const [adminOk,setAdminOk]=useState(false);
    const [showNotifPrompt,setShowNotifPrompt]=useState(false);

    useEffect(()=>{
      (async()=>{
        let t=await db.get(SK_T), c=await db.get(SK_C), cr=await db.get(SK_CRM);
        if(!t){t=DT;await db.set(SK_T,t);}
        if(!c){c=DC;await db.set(SK_C,c);}
        if(!cr){cr={};await db.set(SK_CRM,cr);}
        t=t.map(tr=>({webUrl:'',...tr,pagosConfig:(tr.pagosConfig||[]).map(p=>({fechaISO:'',...p}))}));
        c=c.map(cl=>({personalDocs:[],roommateId:null,acompanantes:[],tripId:null,...cl,
          acompanantes:(cl.acompanantes||[]).map(a=>({pagosEstado:[],personalDocs:[],...a}))}));
        setTrips(t);setClients(c);setCrm(cr);
        const h=window.location.hash.slice(1);
        if(h){const cl=c.find(x=>x.code===h);if(cl){await db.set(SK_SES,{code:cl.code});setNav({cid:cl.id});setScreen(cl.firstLogin?'passport':'client');return;}}
        const ses=await db.get(SK_SES);
        if(ses?.code){const cl=c.find(x=>x.code===ses.code);if(cl){setNav({cid:cl.id});setScreen(cl.firstLogin?'passport':'client');return;}}
        setScreen('home');
      })();
    },[]);

    const sT=async v=>{setTrips(v);await db.set(SK_T,v);};
    const sC=async v=>{setClients(v);await db.set(SK_C,v);};
    const sCrm=async v=>{setCrm(v);await db.set(SK_CRM,v);};
    const go=(s,x={})=>{setNav(n=>({...n,...x}));setScreen(s);};
    const goClient=async cl=>{
      await db.set(SK_SES,{code:cl.code});
      if(cl.tripId) osTag(cl.tripId);
      if(!localStorage.getItem('tv7-notif-asked')&&!cl.firstLogin) setShowNotifPrompt(true);
      go(cl.firstLogin?'passport':'client',{cid:cl.id});
    };
    const logout=async()=>{await db.set(SK_SES,null);go('home');};

    if(screen==='splash') return <Splash/>;
    if(screen==='home')   return <Home go={go} goClient={goClient} clients={clients}/>;
    if(screen==='pin')    return <Pin go={go} onOk={()=>{setAdminOk(true);go('ahome');}} alreadyOk={adminOk}/>;
    if(screen==='ahome')  return <AHome go={go} trips={trips} clients={clients} sT={sT} sC={sC}/>;
    if(screen==='atrip')  return <ATrip go={go} tid={nav.tid} trips={trips} clients={clients} crm={crm} sT={sT} sC={sC} sCrm={sCrm}/>;
    if(screen==='passport') return <Passport go={go} cid={nav.cid} clients={clients} trips={trips} sC={sC} setScreen={setScreen} setNav={setNav}/>;
    if(showNotifPrompt) return(
      <>
        {screen==='client'&&(()=>{const cl=clients.find(c=>c.id===nav.cid);return cl?<Client go={go} cid={nav.cid} clients={clients} trips={trips} logout={logout} sC={sC}/>:null;})()}
        <NotifPrompt onDone={()=>setShowNotifPrompt(false)} cl={clients.find(c=>c.id===nav.cid)}/>
      </>
    );
    if(screen==='client'){
      const cl=clients.find(c=>c.id===nav.cid);
      if(cl&&!cl.tripId) return <NoTrips cl={cl} logout={logout}/>;
      return <Client go={go} cid={nav.cid} clients={clients} trips={trips} logout={logout} sC={sC}/>;
    }
    return <Home go={go} goClient={goClient} clients={clients}/>;
  }

  /* ── Splash ─────────────────────────────────────────────── */
  function Splash(){
    return(
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',
                   background:A.bg,flexDirection:'column',gap:20}}>
        <TravelikeLogo size={46} glow={true}/>
        <div style={{color:A.muted,fontSize:11,fontFamily:BARLOW,letterSpacing:6,textTransform:'uppercase'}}>Cargando…</div>
      </div>
    );
  }

  /* ── Home (login de viajeros) ───────────────────────────── */
  function Home({go,goClient,clients}){
    const [code,setCode]=useState('');
    const [err,setErr]=useState(false);
    const [taps,setTaps]=useState(0);
    const timer=useRef();
    const tap=()=>{const n=taps+1;setTaps(n);clearTimeout(timer.current);timer.current=setTimeout(()=>setTaps(0),2000);if(n>=5){setTaps(0);go('pin');}};
    const enter=()=>{const c=code.trim().toUpperCase();const cl=clients.find(x=>x.code===c);if(cl)goClient(cl);else{setErr(true);setTimeout(()=>setErr(false),2000);}};
    return(
      <div style={{background:A.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',display:'flex',flexDirection:'column',fontFamily:BARLOW,color:A.text}}>
        {/* Header */}
        <div onClick={tap} style={{background:'linear-gradient(135deg,#070718 0%,#0f1f3d 50%,#07070f 100%)',
                                   padding:'60px 32px 52px',textAlign:'center',position:'relative',
                                   overflow:'hidden',borderBottom:`1px solid ${A.border}`,cursor:'default',userSelect:'none'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(0,240,255,0.09) 0%,transparent 70%)',pointerEvents:'none'}}/>
          {/* ← LOGO — reemplaza TravelikeLogo por <img src="tu-logo.png" style={{height:52}} alt="Travelike"/> */}
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
            <TravelikeLogo size={52} glow={true}/>
          </div>
          <div style={{fontFamily:BARLOW,fontSize:11,letterSpacing:7,color:A.muted,textTransform:'uppercase'}}>Portal Personal de Viajeros</div>
        </div>
        {/* Form */}
        <div style={{flex:1,padding:'40px 28px'}}>
          <div style={{fontFamily:ANTON,fontSize:28,letterSpacing:1,color:'#fff',marginBottom:8,textTransform:'uppercase'}}>Tu código</div>
          <div style={{fontSize:16,color:A.muted,marginBottom:28,lineHeight:1.6}}>Tu agencia te habrá enviado un código personal de acceso.</div>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&enter()}
                 placeholder="Ej: AB12CD" maxLength={8} autoCapitalize="characters"
                 style={{width:'100%',padding:'22px 20px',fontSize:32,textAlign:'center',
                         border:`2px solid ${err?A.red:A.border}`,borderRadius:12,fontFamily:ANTON,
                         letterSpacing:8,background:A.card,color:'#fff',outline:'none',
                         boxSizing:'border-box',marginBottom:err?10:20}}/>
          {err&&<div style={{color:A.red,fontSize:16,fontWeight:700,marginBottom:14,textAlign:'center',fontFamily:BARLOW}}>❌ Código incorrecto</div>}
          <button onClick={enter}
                  style={{width:'100%',padding:'18px',border:'none',borderRadius:10,fontFamily:ANTON,
                          fontSize:16,cursor:'pointer',letterSpacing:3,
                          background:`linear-gradient(90deg,${A.red},#c00020)`,color:'#fff',
                          textTransform:'uppercase',boxShadow:'0 0 24px rgba(232,0,42,0.3)'}}>ACCEDER AL VIAJE →</button>
        </div>
      </div>
    );
  }

  /* ── Pin (acceso admin) ─────────────────────────────────── */
  function Pin({go,onOk,alreadyOk}){
    useEffect(()=>{if(alreadyOk)go('ahome');},[]);
    const [pin,setPin]=useState('');const [err,setErr]=useState(false);
    const try_=()=>{if(pin===ADMIN_PIN)onOk();else{setErr(true);setPin('');setTimeout(()=>setErr(false),2000);}};
    return(
      <div style={{background:A.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',display:'flex',
                   flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,fontFamily:BARLOW}}>
        <div style={{marginBottom:28}}><TravelikeLogo size={38}/></div>
        <div style={{fontFamily:ANTON,fontSize:42,letterSpacing:2,color:'#fff',textTransform:'uppercase',marginBottom:6}}>ADMIN</div>
        <div style={{fontSize:14,color:A.muted,marginBottom:36,letterSpacing:3,textTransform:'uppercase'}}>Panel de administración</div>
        <input type="password" value={pin} onChange={e=>{setPin(e.target.value);setErr(false);}} onKeyDown={e=>e.key==='Enter'&&try_()}
               placeholder="••••" maxLength={8}
               style={{width:'100%',padding:'22px',fontSize:32,textAlign:'center',
                       border:`2px solid ${err?A.red:A.border}`,borderRadius:12,fontFamily:ANTON,
                       letterSpacing:8,background:A.card,color:'#fff',marginBottom:12,outline:'none',boxSizing:'border-box'}}/>
        {err&&<div style={{color:A.red,fontSize:14,marginBottom:14,fontWeight:700}}>❌ PIN incorrecto</div>}
        <button onClick={try_} style={{width:'100%',padding:'16px',border:'none',borderRadius:10,fontFamily:ANTON,fontSize:16,letterSpacing:3,cursor:'pointer',background:A.cyan,color:A.bg,textTransform:'uppercase'}}>ENTRAR</button>
        <button onClick={()=>go('home')} style={{marginTop:20,background:'none',border:'none',color:A.muted,fontSize:14,cursor:'pointer',fontFamily:BARLOW,letterSpacing:2}}>← Volver</button>
      </div>
    );
  }

  /* ── Admin Home ─────────────────────────────────────────── */
  function AHome({go,trips,clients,sT,sC}){
    const [mainTab,setMainTab]=useState('viajes');
    const [view,setView]=useState('up');const [modal,setModal]=useState(false);
    const [form,setForm]=useState({name:'',flag:'✈️',month:String(NOW.getMonth()+1),year:String(NOW.getFullYear()),price:'',fechas:'',webUrl:''});
    const up   = trips.filter(t=>!isPast(t.date)).sort((a,b)=>a.date.localeCompare(b.date));
    const hist = trips.filter(t=> isPast(t.date)).sort((a,b)=>b.date.localeCompare(a.date));
    const addTrip=()=>{
      if(!form.name.trim()||form.year.length!==4)return;
      const date=`${form.year}-${String(form.month).padStart(2,'0')}`;
      sT([...trips,{id:`t${uid()}`,name:form.name.trim(),flag:form.flag||'✈️',date,price:form.price?+form.price:null,fechas:form.fechas||fmt(date),webUrl:form.webUrl||'',...emptyT()}].sort((a,b)=>a.date.localeCompare(b.date)));
      setModal(false);setForm({name:'',flag:'✈️',month:String(NOW.getMonth()+1),year:String(NOW.getFullYear()),price:'',fechas:'',webUrl:''});
    };
    const delTrip=id=>{if(!window.confirm('¿Eliminar viaje y sus clientes?'))return;sT(trips.filter(t=>t.id!==id));sC(clients.filter(c=>c.tripId!==id));};
    const totalAcomp=clients.reduce((a,c)=>a+(c.acompanantes||[]).length,0);
    const sinViaje  =clients.filter(c=>!c.tripId).length;

    const TCard=({t})=>{
      const cnt=clients.filter(c=>c.tripId===t.id).length;
      const ok =clients.filter(c=>c.tripId===t.id&&(c.status==='confirmado'||c.status==='pagado')).length;
      return(
        <div style={{position:'relative',background:A.card,borderRadius:12,padding:14,
                     border:`1px solid ${A.border}33`,cursor:'pointer',height:160,display:'flex',flexDirection:'column'}}
             onClick={()=>go('atrip',{tid:t.id})}>
          <button onClick={e=>{e.stopPropagation();delTrip(t.id);}}
                  style={{position:'absolute',top:6,left:6,zIndex:5,background:A.card2,border:`1px solid ${A.border}`,
                          color:A.muted,width:20,height:20,borderRadius:5,fontSize:12,cursor:'pointer',
                          display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
          <div style={{fontSize:28,marginBottom:6,paddingLeft:18,marginTop:2}}>{t.flag}</div>
          <div style={{fontFamily:ANTON,fontSize:14,color:A.text,lineHeight:1.1,marginBottom:4,
                       overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{t.name}</div>
          <div style={{fontSize:9,color:A.cyan,fontWeight:700,letterSpacing:2,marginBottom:3,fontFamily:BARLOW}}>{fmt(t.date)}</div>
          {t.price&&<div style={{fontSize:11,color:A.gold,fontWeight:700,fontFamily:BARLOW,marginBottom:'auto'}}>{t.price.toLocaleString('es')}€</div>}
          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:6}}>
            {cnt>0&&<span style={{fontSize:8,color:A.orange,background:A.orange+'22',padding:'2px 5px',borderRadius:5,fontFamily:BARLOW}}>👥{cnt}</span>}
            {ok >0&&<span style={{fontSize:8,color:A.green, background:A.green+'22', padding:'2px 5px',borderRadius:5,fontFamily:BARLOW}}>✅{ok}</span>}
          </div>
        </div>
      );
    };

    return(
      <div style={{background:A.bg,minHeight:'100vh',color:A.text,paddingBottom:20,fontFamily:BARLOW}}>
        {/* Header */}
        <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${A.border}`,background:A.card}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <TravelikeLogo size={28}/>
            <div style={{fontSize:10,color:A.muted,fontFamily:BARLOW,letterSpacing:2}}>ADMIN</div>
          </div>
          <div style={{fontFamily:ANTON,fontSize:28,letterSpacing:1,color:'#fff',marginBottom:10,textTransform:'uppercase'}}>
            {mainTab==='viajes'?'Mis Viajes':mainTab==='clientes'?'Clientes':'Notificaciones'}
          </div>
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
            {[{l:'Próximos',v:up.length,c:A.cyan},{l:'Histórico',v:hist.length,c:A.muted},
              {l:'Viajeros',v:clients.length,c:A.orange},{l:'Acomp.',v:totalAcomp,c:A.purple},{l:'Sin viaje',v:sinViaje,c:A.gold}].map(({l,v,c})=>(
              <div key={l} style={{flexShrink:0,background:A.card2,borderRadius:10,padding:'8px 14px',border:`1px solid ${A.border}`}}>
                <div style={{fontSize:9,color:A.muted,marginBottom:2,letterSpacing:2,textTransform:'uppercase'}}>{l}</div>
                <div style={{fontFamily:ANTON,fontSize:20,color:c}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Tab bar */}
        <div style={{display:'flex',borderBottom:`1px solid ${A.border}`,background:A.card2}}>
          {[{k:'viajes',l:'✈️ Viajes'},{k:'clientes',l:'👤 Clientes'},{k:'notifs',l:'🔔 Notifs'}].map(({k,l})=>(
            <button key={k} onClick={()=>setMainTab(k)}
                    style={{flex:1,background:'transparent',border:'none',
                            borderBottom:`2px solid ${mainTab===k?A.cyan:'transparent'}`,
                            color:mainTab===k?A.cyan:A.muted,padding:'13px 4px',fontSize:12,fontWeight:700,
                            cursor:'pointer',fontFamily:BARLOW,letterSpacing:1,textTransform:'uppercase'}}>{l}</button>
          ))}
        </div>

        {mainTab==='viajes'&&(
          <div>
            <div style={{display:'flex',borderBottom:`1px solid ${A.border}`,background:A.card2}}>
              {[{k:'up',l:`Próximos (${up.length})`},{k:'hist',l:`Histórico (${hist.length})`}].map(({k,l})=>(
                <button key={k} onClick={()=>setView(k)}
                        style={{flex:1,background:'transparent',border:'none',
                                borderBottom:`2px solid ${view===k?A.cyan+'88':'transparent'}`,
                                color:view===k?A.text:A.muted,padding:'10px 4px',fontSize:9,fontWeight:700,
                                cursor:'pointer',fontFamily:BARLOW,letterSpacing:1,textTransform:'uppercase'}}>{l}</button>
              ))}
            </div>
            <div style={{padding:'12px 16px'}}>
              <button onClick={()=>setModal(true)}
                      style={{...ab(A.cyan+'22',A.cyan),width:'100%',border:`1.5px dashed ${A.cyan}`,borderRadius:10,marginBottom:14,fontFamily:BARLOW}}>+ Añadir viaje</button>
              {view==='up' &&(up.length  ===0?<AEmpty text="No hay viajes próximos"/>  :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{up.map(t=><TCard key={t.id} t={t}/>)}</div>)}
              {view==='hist'&&(hist.length===0?<AEmpty text="Sin histórico todavía"/>  :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{hist.map(t=><TCard key={t.id} t={t}/>)}</div>)}
            </div>
          </div>
        )}
        {mainTab==='clientes'&&<ClientesTab clients={clients} trips={trips} sC={sC}/>}
        {mainTab==='notifs'&&<NotificacionesTab trips={trips} clients={clients}/>}

        {modal&&(
          <AModal title="✈️ Nuevo viaje" onClose={()=>setModal(false)}>
            <div style={{display:'grid',gridTemplateColumns:'58px 1fr',gap:10,marginBottom:10}}>
              <input value={form.flag} onChange={e=>setForm({...form,flag:e.target.value})} style={{...ais,textAlign:'center',fontSize:24,padding:'8px'}}/>
              <input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nombre del viaje" style={ais}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 88px',gap:10,marginBottom:10}}>
              <select value={form.month} onChange={e=>setForm({...form,month:e.target.value})} style={ais}>{MES_F.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
              <input value={form.year} onChange={e=>setForm({...form,year:e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="2026" inputMode="numeric" style={ais}/>
            </div>
            <input value={form.price} onChange={e=>setForm({...form,price:e.target.value.replace(/\D/g,'')})} placeholder="Precio €" inputMode="numeric" style={{...ais,marginBottom:10}}/>
            <input value={form.fechas} onChange={e=>setForm({...form,fechas:e.target.value})} placeholder="Fechas para viajeros" style={{...ais,marginBottom:10}}/>
            <input value={form.webUrl} onChange={e=>setForm({...form,webUrl:e.target.value})} placeholder="🌐 URL web del viaje" style={{...ais,marginBottom:14}}/>
            <ARow>
              <button onClick={()=>setModal(false)} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button>
              <button onClick={addTrip} style={{...ab(A.cyan),flex:2,color:A.bg}}>Añadir</button>
            </ARow>
          </AModal>
        )}
      </div>
    );
  }

  /* ── Clientes Tab ───────────────────────────────────────── */
  function ClientesTab({clients,trips,sC}){
    const [modal,setModal]=useState(false);
    const [form,setForm]=useState({nombre:'',email:''});
    const [copied,setCopied]=useState(null);
    const [filter,setFilter]=useState('all');
    const getLink=c=>`${window.location.href.split('#')[0]}#${c.code}`;
    const openWA=c=>{
      const link=getLink(c);const trip=c.tripId?trips.find(t=>t.id===c.tripId):null;
      const msg=trip?`Hola ${c.nombre.split(' ')[0]} 👋\n\nAquí tienes tu acceso al portal de tu viaje *${trip.name}*:\n${link}\n\nPodrás consultar vuelos, documentos y el estado de tus pagos. ✈️`
                    :`Hola ${c.nombre.split(' ')[0]} 👋\n\nAquí tienes tu acceso al portal de viajeros de Travelike:\n${link}\n\nPronto te asignaremos tu próximo viaje. ✈️`;
      window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`,'_blank');
    };
    const addClient=()=>{
      if(!form.nombre.trim())return;
      const nc={id:`cl${uid()}`,nombre:form.nombre.trim(),email:form.email||'',tripId:null,code:genCode(),
                status:'interesado',room:'doble',note:'',pagosEstado:[],personalDocs:[],passportPhoto:null,
                passportConsent:false,photoConsent:false,firstLogin:true,roommateId:null,acompanantes:[]};
      sC([...clients,nc]);setForm({nombre:'',email:''});setModal(false);
    };
    const unassigned=clients.filter(c=>!c.tripId);
    const displayed=filter==='all'?clients:filter==='notrip'?unassigned:clients.filter(c=>c.tripId===filter);

    return(
      <div style={{padding:'12px 16px'}}>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:10}}>
          {[{k:'all',l:'Todos'},{k:'notrip',l:'Sin viaje'},...trips.map(t=>({k:t.id,l:`${t.flag} ${t.name.split(' ')[0]}`}))].map(({k,l})=>(
            <button key={k} onClick={()=>setFilter(k)}
                    style={{...ab(filter===k?A.cyan:A.card2,filter===k?A.bg:A.muted),flexShrink:0,fontSize:10,
                            padding:'6px 12px',borderRadius:20,border:`1px solid ${filter===k?A.cyan:A.border}`,fontFamily:BARLOW}}>{l}</button>
          ))}
        </div>
        <button onClick={()=>setModal(true)} style={{...ab(A.cyan+'22',A.cyan),width:'100%',border:`1.5px dashed ${A.cyan}`,borderRadius:10,marginBottom:12,fontFamily:BARLOW}}>+ Registrar cliente</button>
        {displayed.length===0&&<AEmpty text="Sin clientes en este filtro"/>}
        {displayed.map(c=>{
          const trip=c.tripId?trips.find(t=>t.id===c.tripId):null;
          const st=ST.find(s=>s.key===c.status)||ST[0];
          const acCount=(c.acompanantes||[]).length;
          return(
            <div key={c.id} style={{background:A.card,borderRadius:14,padding:'12px 14px',marginBottom:10,border:`1px solid ${A.border}44`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:10,overflow:'hidden',background:A.cyan+'22',flexShrink:0,
                             border:`2px solid ${c.passportPhoto?A.green:A.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {c.passportPhoto?<img src={c.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                    :<span style={{fontFamily:ANTON,fontSize:17,color:A.cyan}}>{c.nombre[0]?.toUpperCase()}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:ANTON,fontSize:15,color:A.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.nombre}</div>
                  <div style={{fontSize:10,color:trip?A.cyan:A.orange,fontFamily:BARLOW}}>{trip?`${trip.flag} ${trip.name}`:'📭 Sin viaje asignado'}</div>
                  {acCount>0&&<div style={{fontSize:9,color:A.purple,fontFamily:BARLOW}}>👥 +{acCount} acompañante{acCount>1?'s':''}</div>}
                </div>
                <button onClick={()=>sC(clients.filter(x=>x.id!==c.id))} style={{background:'transparent',border:'none',color:A.muted,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button>
              </div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
                <span style={{fontSize:9,color:A.muted,background:A.card2,padding:'4px 8px',borderRadius:6,border:`1px solid ${A.border}`,fontFamily:BARLOW}}>🔑 {c.code}</span>
                <span style={{fontSize:9,padding:'4px 8px',borderRadius:6,fontFamily:BARLOW,
                              background:c.passportPhoto?A.green+'22':'#334455',color:c.passportPhoto?A.green:A.muted,
                              border:`1px solid ${c.passportPhoto?A.green+'44':A.border}`}}>🛂 {c.passportPhoto?'✓ Pasaporte':'Sin pasaporte'}</span>
                <span style={{fontSize:9,padding:'4px 8px',borderRadius:6,fontFamily:BARLOW,
                              background:st.color+'22',color:st.color,border:`1px solid ${st.color}44`}}>{st.emoji} {st.label}</span>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>{navigator.clipboard.writeText(getLink(c)).then(()=>{setCopied(c.id);setTimeout(()=>setCopied(null),2500);});}}
                        style={{...ab(copied===c.id?A.green+'22':A.cyan+'22',copied===c.id?A.green:A.cyan),flex:1,fontSize:11,padding:'7px 8px',borderRadius:8,border:`1px solid ${copied===c.id?A.green:A.cyan}44`,fontFamily:BARLOW}}>
                  {copied===c.id?'✓ Copiado':'🔗 Copiar link'}</button>
                <button onClick={()=>openWA(c)}
                        style={{...ab(A.green+'22',A.green),flex:1,fontSize:11,padding:'7px 8px',borderRadius:8,border:`1px solid ${A.green}44`,fontFamily:BARLOW}}>💬 WhatsApp</button>
              </div>
            </div>
          );
        })}
        {modal&&(
          <AModal title="👤 Nuevo cliente" onClose={()=>setModal(false)}>
            <div style={{fontSize:13,color:A.muted,fontFamily:BARLOW,marginBottom:14,lineHeight:1.55}}>El cliente recibirá un enlace para registrarse. Podrás asignarle un viaje después.</div>
            <input autoFocus value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre completo" style={{...ais,marginBottom:10}}/>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email (opcional)" type="email" style={{...ais,marginBottom:14}}/>
            <ARow>
              <button onClick={()=>setModal(false)} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button>
              <button onClick={addClient} style={{...ab(A.cyan),flex:2,color:A.bg}}>Registrar</button>
            </ARow>
          </AModal>
        )}
      </div>
    );
  }

  /* ── Admin Trip Detail ──────────────────────────────────── */
  function ATrip({go,tid,trips,clients,crm,sT,sC,sCrm}){
    const trip=trips.find(t=>t.id===tid);
    const [tab,setTab]=useState('people');
    const [notes,setNotes]=useState('');
    const [viewPhoto,setViewPhoto]=useState(null);
    const passRef=useRef();const chPassRef=useRef();
    const [upIdx,setUpIdx]=useState(null);const [passModal,setPassModal]=useState(null);
    useEffect(()=>{if(trip)setNotes((crm[tid]||emptyCRM()).notes||'');},[tid]);
    if(!trip)return<div style={{padding:40,background:A.bg,color:A.muted,minHeight:'100vh',fontFamily:BARLOW}}>Viaje no encontrado</div>;

    const tc=clients.filter(c=>c.tripId===tid);
    const cd=crm[tid]||emptyCRM();
    const mut=async fn=>{const next={...crm,[tid]:fn(cd)};sCrm(next);};
    const updTrip  =async fn=>sT(trips.map(t=>t.id===tid?fn(t):t));
    const updClient=async(id,fn)=>sC(clients.map(c=>c.id===id?fn(c):c));
    const addPass=(file,cid)=>{const r=new FileReader();r.onload=e=>updClient(cid,c=>({...c,passportPhoto:e.target.result}));r.readAsDataURL(file);};
    const hasUrgentPending=c=>(trip.pagosConfig||[]).some((p,i)=>{ const st=(c.pagosEstado||[])[i]; return st!=='pagado'&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)); });

    /* ── People Tab ─────────────── */
    const PeopleTab=()=>{
      const confirmed=tc.filter(c=>c.status==='confirmado'||c.status==='pagado');
      const [listModal,setListModal]=useState(false);const [copied2,setCopied2]=useState(false);
      const [roomMenu,setRoomMenu]=useState(null);const [acmpModal,setAcmpModal]=useState(null);
      const [modal,setModal]=useState(null);const [rmModal,setRmModal]=useState(null);
      const [form,setForm]=useState({nombre:'',email:''});
      const unassigned=clients.filter(c=>!c.tripId);
      const roomCounts={};Object.keys(ROOMS).forEach(k=>{roomCounts[k]=confirmed.filter(c=>(c.room||'doble')===k).length;});
      const totalHabs=Math.ceil(roomCounts.doble/2)+roomCounts.individual+Math.ceil(roomCounts.triple/3)+Math.ceil(roomCounts.cuadruple/4)+Math.ceil(roomCounts.busca/2)+(roomCounts.busca%2);
      const buildList=()=>{
        const ok=confirmed;if(!ok.length)return'Sin confirmados aún';
        const RL={doble:'🛏🛏 Doble',individual:'🛏 Individual',triple:'🛏🛏🛏 Triple',cuadruple:'🛏×4 Cuádruple',busca:'🔍 Busca comp.'};
        return[`${trip.flag} ${trip.name.toUpperCase()}`,`📅 ${fmt(trip.date)}${trip.price?' · '+trip.price.toLocaleString('es')+'€':''}`,
               `✅ CONFIRMADOS — ${ok.length} persona${ok.length!==1?'s':''}`, '─'.repeat(30),
               ...ok.map((c,i)=>`${i+1}. ${c.nombre}  ${RL[c.room||'doble']||''}${(c.acompanantes||[]).length>0?' +'+((c.acompanantes||[]).length)+' acomp.':''}`),
               '',`🛏 Total habitaciones: ${totalHabs}`,`\nTravelike · ${new Date().toLocaleDateString('es')}`].join('\n');
      };
      const setRoommate=async(aId,bId)=>{sC(clients.map(c=>{if(c.id===aId)return{...c,roommateId:bId};if(bId&&c.id===bId)return{...c,roommateId:aId};if(!bId&&c.roommateId===aId)return{...c,roommateId:null};return c;}));};
      return(
        <div style={{padding:'0 16px'}}>
          {confirmed.length>0&&(
            <div style={{background:A.card2,borderRadius:14,padding:'12px 14px',marginBottom:12,border:`1px solid ${A.border}`}}>
              <div style={{fontFamily:BARLOW,fontSize:9,color:A.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>Resumen habitaciones</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {Object.entries(ROOMS).map(([k,r])=>roomCounts[k]>0&&(
                  <div key={k} style={{background:r.color+'15',border:`1px solid ${r.color}33`,borderRadius:10,padding:'8px 12px',textAlign:'center',minWidth:70}}>
                    <div style={{fontFamily:ANTON,fontSize:22,color:r.color,lineHeight:1}}>{k==='doble'?Math.ceil(roomCounts[k]/2):k==='triple'?Math.ceil(roomCounts[k]/3):k==='cuadruple'?Math.ceil(roomCounts[k]/4):roomCounts[k]}</div>
                    <div style={{fontSize:8,color:r.color,letterSpacing:1,textTransform:'uppercase',fontFamily:BARLOW,marginTop:2}}>{r.short}</div>
                  </div>
                ))}
                <div style={{background:A.green+'15',border:`1px solid ${A.green}33`,borderRadius:10,padding:'8px 12px',textAlign:'center',minWidth:70}}>
                  <div style={{fontFamily:ANTON,fontSize:22,color:A.green,lineHeight:1}}>{totalHabs}</div>
                  <div style={{fontSize:8,color:A.green,letterSpacing:1,textTransform:'uppercase',fontFamily:BARLOW,marginTop:2}}>Total</div>
                </div>
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
            {ST.map(s=>{const n=tc.filter(c=>c.status===s.key).length;return(
              <div key={s.key} style={{flexShrink:0,background:A.card,borderRadius:10,padding:'8px 12px',border:`1px solid ${s.color}44`,minWidth:60,textAlign:'center'}}>
                <div style={{fontSize:14}}>{s.emoji}</div>
                <div style={{fontFamily:ANTON,fontSize:18,color:s.color}}>{n}</div>
                <div style={{fontSize:8,color:A.muted,fontFamily:BARLOW,letterSpacing:1}}>{s.label}</div>
              </div>
            );})}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button onClick={()=>setModal('new')} style={{...ab(A.cyan+'22',A.cyan),flex:2,border:`1.5px dashed ${A.cyan}`,borderRadius:10,padding:'10px',fontFamily:BARLOW}}>+ Nuevo viajero</button>
            {unassigned.length>0&&<button onClick={()=>setModal('existing')} style={{...ab(A.purple+'22',A.purple),flex:2,border:`1.5px solid ${A.purple}44`,borderRadius:10,padding:'10px',fontSize:12,fontFamily:BARLOW}}>👤 Existente</button>}
            {confirmed.length>0&&<button onClick={()=>setListModal(true)} style={{...ab(A.green+'22',A.green),flex:1,border:`1.5px solid ${A.green}44`,borderRadius:10,padding:'10px',fontSize:12,fontFamily:BARLOW}}>📋</button>}
          </div>
          {tc.length===0?<AEmpty text="Sin viajeros aún"/>:tc.map(c=>{
            const st=ST.find(s=>s.key===c.status)||ST[0];
            const rm=ROOMS[c.room||'doble']||ROOMS.doble;
            const urgent=hasUrgentPending(c);
            const acCount=(c.acompanantes||[]).length;
            const roommate=c.roommateId?clients.find(x=>x.id===c.roommateId):null;
            return(
              <div key={c.id} style={{background:A.card,borderRadius:14,padding:'12px 14px',marginBottom:10,
                                      border:`2px solid ${urgent?A.orange+'66':A.border+'44'}`,
                                      boxShadow:urgent?`0 0 12px ${A.orange}22`:'none'}}>
                {urgent&&<div style={{background:A.orange+'22',border:`1px solid ${A.orange}44`,borderRadius:8,padding:'6px 10px',marginBottom:10,fontSize:11,color:A.orange,fontFamily:BARLOW,fontWeight:700}}>⚠️ Pago próximo o vencido sin confirmar</div>}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                  <div style={{position:'relative',flexShrink:0}}>
                    <div onClick={()=>c.passportPhoto?setPassModal({src:c.passportPhoto,cid:c.id,name:c.nombre}):(setUpIdx(c.id),passRef.current.value='',passRef.current.click())}
                         style={{width:44,height:44,borderRadius:10,overflow:'hidden',cursor:'pointer',
                                 border:c.passportPhoto?`2px solid ${A.cyan}99`:`2px solid ${A.border}`,background:A.cyan+'22'}}>
                      {c.passportPhoto?<img src={c.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                        :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ANTON,fontSize:18,color:A.cyan}}>{c.nombre[0]?.toUpperCase()}</div>}
                    </div>
                    <div style={{position:'absolute',bottom:-3,right:-3,background:c.passportPhoto?A.green:A.card2,border:`1px solid ${A.border}`,borderRadius:5,fontSize:8,padding:'1px 3px',color:c.passportPhoto?'#fff':A.muted,fontFamily:BARLOW}}>{c.passportPhoto?'✓':'📷'}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:ANTON,fontSize:16,color:A.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.nombre}</div>
                    <div style={{fontSize:10,color:st.color,fontFamily:BARLOW}}>{st.emoji} {st.label}</div>
                    <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
                      <span style={{fontSize:8,padding:'2px 6px',borderRadius:5,fontWeight:700,fontFamily:BARLOW,background:c.passportConsent?A.green+'22':'#334455',color:c.passportConsent?A.green:A.muted,border:`1px solid ${c.passportConsent?A.green+'44':A.border}`}}>🛂 {c.passportConsent?'✓':'—'}</span>
                      <span style={{fontSize:8,padding:'2px 6px',borderRadius:5,fontWeight:700,fontFamily:BARLOW,background:c.photoConsent?A.purple+'22':'#334455',color:c.photoConsent?A.purple:A.muted,border:`1px solid ${c.photoConsent?A.purple+'44':A.border}`}}>📸 {c.photoConsent?'✓':'—'}</span>
                      {acCount>0&&<span style={{fontSize:8,padding:'2px 6px',borderRadius:5,fontWeight:700,fontFamily:BARLOW,background:A.cyan+'22',color:A.cyan,border:`1px solid ${A.cyan}44`}}>👥 {(c.acompanantes||[]).filter(a=>a.passportPhoto).length}/{acCount}</span>}
                    </div>
                  </div>
                  <button onClick={()=>sC(clients.filter(x=>x.id!==c.id))} style={{background:'transparent',border:'none',color:A.muted,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button>
                </div>
                <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap'}}>
                  <button onClick={()=>setRoomMenu(c.id)} style={{background:rm.color+'22',border:`1.5px solid ${rm.color}55`,color:rm.color,borderRadius:9,padding:'5px 11px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:BARLOW}}>
                    {rm.label} <span style={{fontSize:9,opacity:0.7}}>▼</span>
                  </button>
                  <select value={c.status} onChange={e=>updClient(c.id,x=>({...x,status:e.target.value}))}
                          style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,padding:'5px 8px',fontSize:10,cursor:'pointer',fontFamily:BARLOW}}>
                    {ST.map(s=><option key={s.key} value={s.key}>{s.emoji} {s.label}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',gap:6,marginBottom:6,flexWrap:'wrap'}}>
                  <button onClick={()=>go('client',{cid:c.id})} style={{...ab(A.purple+'22',A.purple),flex:1,border:`1px solid ${A.purple}44`,borderRadius:8,padding:'6px',fontSize:11,fontFamily:BARLOW}}>👁 Ver portal →</button>
                  <button onClick={()=>setRmModal(c.id)} style={{...ab(roommate?A.cyan+'15':A.card2,roommate?A.cyan:A.muted),flex:1,border:`1px solid ${roommate?A.cyan+'33':A.border}`,borderRadius:8,padding:'6px',fontSize:10,fontFamily:BARLOW}}>🛏 {roommate?roommate.nombre.split(' ')[0]:'Compañero/a'}</button>
                  <button onClick={()=>setAcmpModal(c.id)} style={{...ab(acCount>0?A.cyan+'15':A.card2,acCount>0?A.cyan:A.muted),border:`1px solid ${acCount>0?A.cyan+'44':A.border}`,borderRadius:8,padding:'6px',fontSize:10,fontFamily:BARLOW}}>👥 {acCount>0?`+${acCount}`:'Acomp.'}</button>
                </div>
                <input value={c.note||''} onChange={e=>updClient(c.id,x=>({...x,note:e.target.value}))} placeholder="📝 Anotación…" style={{...ais,padding:'7px 10px',fontSize:12,color:A.muted,background:A.bg,borderColor:A.border+'66'}}/>
              </div>
            );
          })}
          <input ref={passRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>{if(e.target.files[0]&&upIdx)addPass(e.target.files[0],upIdx);setUpIdx(null);}}/>
          {passModal&&(
            <AModal title={`🛂 ${passModal.name}`} onClose={()=>setPassModal(null)}>
              <div style={{borderRadius:12,overflow:'hidden',marginBottom:14}}><img src={passModal.src} style={{width:'100%',maxHeight:280,objectFit:'cover',display:'block'}} alt=""/></div>
              <input ref={chPassRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>{if(e.target.files[0]){addPass(e.target.files[0],passModal.cid);setPassModal(null);}}}/>
              <ARow>
                <button onClick={()=>setViewPhoto(passModal.src)} style={{...ab(A.card2,A.text),flex:1,border:`1px solid ${A.border}`}}>🔍 Ver</button>
                <button onClick={()=>{chPassRef.current.value='';chPassRef.current.click();}} style={{...ab(A.cyan+'22',A.cyan),flex:1,border:`1px solid ${A.cyan}44`}}>📷 Cambiar</button>
                <button onClick={()=>{updClient(passModal.cid,c=>({...c,passportPhoto:null}));setPassModal(null);}} style={{...ab(A.red+'22',A.red),flex:1,border:`1px solid ${A.red}44`}}>🗑️</button>
              </ARow>
            </AModal>
          )}
          {listModal&&(
            <AModal title="📋 Lista confirmados" onClose={()=>{setListModal(false);setCopied2(false);}}>
              <pre style={{background:A.bg,borderRadius:10,padding:12,fontSize:12,lineHeight:1.9,color:A.text,overflowX:'auto',whiteSpace:'pre-wrap',marginBottom:12,border:`1px solid ${A.border}`,fontFamily:'monospace'}}>{buildList()}</pre>
              <button onClick={()=>{navigator.clipboard.writeText(buildList()).then(()=>{setCopied2(true);setTimeout(()=>setCopied2(false),2500);});}}
                      style={{...ab(copied2?A.green:A.cyan),width:'100%',color:A.bg,borderRadius:10,fontFamily:BARLOW}}>{copied2?'✅ ¡Copiado!':'📋 Copiar'}</button>
            </AModal>
          )}
          {rmModal&&(
            <AModal title="🛏 Compañero/a de habitación" onClose={()=>setRmModal(null)}>
              {tc.filter(x=>x.id!==rmModal).map(c=>{const sel=clients.find(x=>x.id===rmModal)?.roommateId===c.id;const rm=ROOMS[c.room||'doble']||ROOMS.doble;return(
                <button key={c.id} onClick={()=>{setRoommate(rmModal,c.id);setRmModal(null);}}
                        style={{...ab(sel?A.cyan+'22':A.card2,sel?A.cyan:A.text),width:'100%',marginBottom:8,textAlign:'left',border:`1.5px solid ${sel?A.cyan:A.border}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:8,background:A.cyan+'22',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ANTON,fontSize:15,color:A.cyan,flexShrink:0}}>{c.nombre[0]}</div>
                  <div><div style={{fontFamily:BARLOW,fontSize:14,fontWeight:700}}>{c.nombre}</div><div style={{fontSize:11,color:rm.color,fontFamily:BARLOW}}>{rm.label}</div></div>
                  {sel&&<span style={{marginLeft:'auto',color:A.cyan,fontSize:18}}>✓</span>}
                </button>
              );})}
              {clients.find(x=>x.id===rmModal)?.roommateId&&<button onClick={()=>{setRoommate(rmModal,null);setRmModal(null);}} style={{...ab(A.red+'15',A.red),width:'100%',border:`1px solid ${A.red}33`,borderRadius:10,marginTop:4,fontFamily:BARLOW}}>🗑️ Quitar compañero/a</button>}
            </AModal>
          )}
          {roomMenu&&<RoomMenu current={clients.find(c=>c.id===roomMenu)?.room||'doble'} onSelect={r=>updClient(roomMenu,c=>({...c,room:r}))} onClose={()=>setRoomMenu(null)}/>}
          {acmpModal&&<AcompModal clientId={acmpModal} clients={clients} updClient={updClient} trip={trip} onClose={()=>setAcmpModal(null)}/>}
          {modal==='new'&&(
            <AModal title="➕ Nuevo viajero" onClose={()=>setModal(null)}>
              <input autoFocus value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre completo" style={{...ais,marginBottom:10}}/>
              <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email (opcional)" type="email" style={{...ais,marginBottom:14}}/>
              <ARow>
                <button onClick={()=>setModal(null)} style={{...ab(A.card2,A.muted),flex:1,border:`1px solid ${A.border}`}}>Cancelar</button>
                <button onClick={()=>{if(!form.nombre?.trim())return;sC([...clients,{id:`cl${uid()}`,nombre:form.nombre.trim(),email:form.email||'',tripId:tid,code:genCode(),status:'interesado',room:'doble',note:'',pagosEstado:(trip.pagosConfig||[]).map(()=>'pendiente'),personalDocs:[],passportPhoto:null,passportConsent:false,photoConsent:false,firstLogin:true,roommateId:null,acompanantes:[]}]);setModal(null);}} style={{...ab(A.cyan),flex:2,color:A.bg}}>Añadir</button>
              </ARow>
            </AModal>
          )}
          {modal==='existing'&&(
            <AModal title="👤 Asignar viajero existente" onClose={()=>setModal(null)}>
              <div style={{fontSize:13,color:A.muted,fontFamily:BARLOW,marginBottom:14}}>Clientes registrados sin viaje:</div>
              {unassigned.length===0&&<AEmpty text="Todos los clientes ya tienen viaje"/>}
              {unassigned.map(c=>(
                <button key={c.id} onClick={()=>{sC(clients.map(x=>x.id===c.id?{...x,tripId:tid,pagosEstado:(trip.pagosConfig||[]).map(()=>'pendiente')}:x));setModal(null);}}
                        style={{...ab(A.card2,A.text),width:'100%',marginBottom:8,textAlign:'left',border:`1.5px solid ${A.border}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:8,background:A.cyan+'22',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ANTON,fontSize:15,color:A.cyan}}>
                    {c.passportPhoto?<img src={c.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:c.nombre[0]}
                  </div>
                  <div style={{flex:1}}><div style={{fontFamily:BARLOW,fontSize:14,fontWeight:700,color:A.text}}>{c.nombre}</div><div style={{fontSize:10,color:c.passportPhoto?A.green:A.muted,fontFamily:BARLOW}}>{c.passportPhoto?'✓ Pasaporte':'Sin pasaporte'}</div></div>
                  <span style={{color:A.cyan,fontSize:16}}>+</span>
                </button>
              ))}
            </AModal>
          )}
          {viewPhoto&&<Lightbox src={viewPhoto} onClose={()=>setViewPhoto(null)}/>}
        </div>
      );
    };

    /* ── Pagos Tab ─────────────── */
    const PagosTab=()=>{
      const pc=trip.pagosConfig||[];
      const allPeople=[...tc,...tc.flatMap(c=>(c.acompanantes||[]).map(a=>({...a,_parentNombre:c.nombre})))];
      const updAcompPago=(clientId,acId,pIdx)=>{
        updClient(clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>{
          if(a.id!==acId)return a;
          const base=a.pagosEstado?.length===pc.length?a.pagosEstado:pc.map(()=>'pendiente');
          const arr=[...base];arr[pIdx]=arr[pIdx]==='pagado'?'pendiente':'pagado';return{...a,pagosEstado:arr};
        })}));
      };
      return(
        <div style={{padding:'0 16px'}}>
          <div style={{display:'flex',gap:8,marginBottom:14,overflowX:'auto',paddingBottom:2}}>
            {pc.map((p,i)=>{
              const paid=allPeople.filter(c=>(c.pagosEstado||[])[i]==='pagado').length;
              const pct=allPeople.length>0?Math.round(paid/allPeople.length*100):0;
              const urg=isUrgent(p.fechaISO);const ovd=isOverdue(p.fechaISO);
              return(
                <div key={i} style={{flexShrink:0,background:A.card,borderRadius:12,padding:'10px 14px',border:`1px solid ${ovd?A.red+'44':urg?A.orange+'44':A.cyan+'22'}`,minWidth:100}}>
                  <div style={{fontSize:9,color:ovd?A.red:urg?A.orange:A.muted,letterSpacing:2,textTransform:'uppercase',fontFamily:BARLOW,marginBottom:4}}>{p.label}{(urg||ovd)&&<span style={{marginLeft:4}}>{ovd?'⚠️':'🔔'}</span>}</div>
                  <div style={{fontFamily:ANTON,fontSize:24,color:paid===allPeople.length&&allPeople.length>0?A.green:A.cyan,lineHeight:1}}>{paid}<span style={{fontSize:12,color:A.muted}}>/{allPeople.length}</span></div>
                  {p.importe&&<div style={{fontSize:10,color:A.gold,fontFamily:BARLOW,marginTop:2}}>{p.importe}</div>}
                  <div style={{height:3,background:A.border,borderRadius:2,marginTop:6}}><div style={{height:'100%',width:`${pct}%`,background:paid===allPeople.length&&allPeople.length>0?A.green:ovd?A.red:urg?A.orange:A.cyan,borderRadius:2}}/></div>
                </div>
              );
            })}
          </div>
          {tc.length===0?<AEmpty text="Sin viajeros aún"/>:(
            <div style={{background:A.card,borderRadius:14,overflow:'hidden',border:`1px solid ${A.border}`}}>
              <div style={{display:'grid',gridTemplateColumns:`1fr ${pc.map(()=>'1fr').join(' ')}`,borderBottom:`1px solid ${A.border}`,background:A.card2}}>
                <div style={{padding:'10px 14px',fontSize:9,color:A.muted,fontFamily:BARLOW,letterSpacing:2,textTransform:'uppercase'}}>Viajero</div>
                {pc.map((p,i)=><div key={i} style={{padding:'10px 8px',fontSize:9,color:A.cyan,fontFamily:BARLOW,letterSpacing:1,textTransform:'uppercase',textAlign:'center',borderLeft:`1px solid ${A.border}`}}>{p.label}</div>)}
              </div>
              {tc.map((c)=>{
                const pe=c.pagosEstado||pc.map(()=>'pendiente');
                const allPaid=pe.every(s=>s==='pagado');
                const urgent=hasUrgentPending(c);
                const acomps=(c.acompanantes||[]);
                return(
                  <React.Fragment key={c.id}>
                    <div style={{display:'grid',gridTemplateColumns:`1fr ${pc.map(()=>'1fr').join(' ')}`,borderBottom:`1px solid ${A.border}44`,background:allPaid?A.green+'08':urgent?A.orange+'06':'transparent'}}>
                      <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:28,height:28,borderRadius:6,background:A.cyan+'22',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ANTON,fontSize:13,color:A.cyan}}>
                          {c.passportPhoto?<img src={c.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:c.nombre[0]?.toUpperCase()}
                        </div>
                        <div><div style={{fontFamily:ANTON,fontSize:13,color:A.text,lineHeight:1}}>{c.nombre.split(' ')[0]}</div>{urgent&&<div style={{fontSize:8,color:A.orange,fontFamily:BARLOW}}>⚠️</div>}</div>
                      </div>
                      {pc.map((p,i)=>{const done=pe[i]==='pagado';const urg2=!done&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO));return(
                        <div key={i} style={{borderLeft:`1px solid ${A.border}44`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <button onClick={()=>updClient(c.id,x=>{const arr=[...(x.pagosEstado||pc.map(()=>'pendiente'))];arr[i]=arr[i]==='pagado'?'pendiente':'pagado';return{...x,pagosEstado:arr};})}
                                  style={{width:'100%',height:'100%',minHeight:50,background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
                            <div style={{fontFamily:ANTON,fontSize:18,color:done?A.green:urg2?A.orange:A.muted,lineHeight:1}}>{done?'✓':urg2?'!':'–'}</div>
                            <div style={{fontSize:8,color:done?A.green:urg2?A.orange:A.muted,fontFamily:BARLOW}}>{done?'Pagado':urg2?'Urgente':'Pend.'}</div>
                          </button>
                        </div>
                      );})}
                    </div>
                    {acomps.map(ac=>{
                      const ape=ac.pagosEstado?.length===pc.length?ac.pagosEstado:pc.map(()=>'pendiente');
                      return(
                        <div key={ac.id} style={{display:'grid',gridTemplateColumns:`1fr ${pc.map(()=>'1fr').join(' ')}`,borderBottom:`1px solid ${A.border}22`,background:A.bg+'88'}}>
                          <div style={{padding:'8px 14px 8px 22px',display:'flex',alignItems:'center',gap:6}}>
                            <div style={{width:20,height:20,borderRadius:4,background:A.purple+'22',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ANTON,fontSize:10,color:A.purple}}>
                              {ac.passportPhoto?<img src={ac.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:ac.nombre[0]?.toUpperCase()}
                            </div>
                            <div style={{fontFamily:BARLOW,fontSize:11,color:A.purple}}>{ac.nombre.split(' ')[0]} <span style={{fontSize:9,opacity:0.6}}>acomp.</span></div>
                          </div>
                          {pc.map((p,i)=>{const done=ape[i]==='pagado';const urg2=!done&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO));return(
                            <div key={i} style={{borderLeft:`1px solid ${A.border}22`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <button onClick={()=>updAcompPago(c.id,ac.id,i)}
                                      style={{width:'100%',height:'100%',minHeight:38,background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1}}>
                                <div style={{fontFamily:ANTON,fontSize:14,color:done?A.green:urg2?A.orange:A.muted+'88',lineHeight:1}}>{done?'✓':urg2?'!':'–'}</div>
                                <div style={{fontSize:7,color:done?A.green:urg2?A.orange:A.muted,fontFamily:BARLOW}}>{done?'✓':'Pend.'}</div>
                              </button>
                            </div>
                          );})}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    /* ── AI Docs Tab ─────────────
       En modo standalone (Netlify) la IA funciona con tu propia
       API Key de Anthropic. Se guarda solo en este navegador.
    ─────────────────────────────── */
    const AIDocsTab=()=>{
      const [apiKey,setApiKey]=useState(()=>{try{return localStorage.getItem(SK_KEY)||'';}catch{return '';}});
      const [queue,setQueue]=useState([]);
      const [processing,setProcessing]=useState(false);
      const fileRef=useRef();
      const saveKey=k=>{setApiKey(k);try{localStorage.setItem(SK_KEY,k);}catch{}};

      const allDocTypes=[...new Set(tc.flatMap(c=>(c.personalDocs||[]).map(d=>d.tipo||'doc')))];
      const docCols=['passport',...(allDocTypes.length>0?allDocTypes:['vuelo','doc'])];
      const colMeta={passport:{label:'📷 Pasaporte',color:A.cyan},vuelo:{label:'✈️ Vuelo',color:A.orange},doc:{label:'📋 Documento',color:A.gold},visado:{label:'🪪 Visado',color:A.purple},seguro:{label:'🏥 Seguro',color:A.green}};
      const getStatus=(c,col)=>{if(col==='passport')return c.passportPhoto?'ok':'miss';return(c.personalDocs||[]).some(d=>(d.tipo||'doc')===col)?'ok':'miss';};
      const allTargets=tc.flatMap(c=>[{id:c.id,nombre:c.nombre,type:'client',clientId:c.id,photo:c.passportPhoto},...(c.acompanantes||[]).map(a=>({id:a.id,nombre:a.nombre,type:'acomp',clientId:c.id,photo:a.passportPhoto}))]);
      const allClientNames=allTargets.map(t=>t.nombre);

      const addFiles=e=>{const files=Array.from(e.target.files||[]);setQueue(q=>[...q,...files.map(f=>({id:uid(),file:f,name:f.name,status:'pending',result:null}))]);e.target.value='';};
      const processAll=async()=>{
        if(!apiKey){alert('Introduce tu API Key de Anthropic primero.');return;}
        const pending=queue.filter(q=>q.status==='pending');if(!pending.length)return;
        setProcessing(true);
        for(const item of pending){
          setQueue(q=>q.map(x=>x.id===item.id?{...x,status:'processing'}:x));
          try{
            const b64=await fileToB64(item.file);const mediaType=item.file.type||'application/pdf';
            const resp=await fetch("https://api.anthropic.com/v1/messages",{
              method:"POST",
              headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
              body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:[{type:mediaType.startsWith('image')?'image':'document',source:{type:'base64',media_type:mediaType,data:b64}},{type:'text',text:`Analiza este documento de viaje. El grupo incluye: ${allClientNames.join(', ')}.\nExtrae: 1.Nombre pasajero 2.Tipo: vuelo/visado/seguro/doc 3.Descripción breve 4.Referencia 5.Cliente del grupo (nombre EXACTO o "ninguno")\nResponde SOLO JSON: {"pasajero":"","tipo":"vuelo","descripcion":"","referencia":"","cliente":""}`}]}]})
            });
            const data=await resp.json();const raw=data.content?.find(b=>b.type==='text')?.text||'{}';
            const parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());
            const matchedTarget=allTargets.find(t=>t.nombre===parsed.cliente)||allTargets.find(t=>t.nombre.toLowerCase().includes((parsed.cliente||'').toLowerCase()))||null;
            setQueue(q=>q.map(x=>x.id===item.id?{...x,status:'done',result:{...parsed,matchedTarget}}:x));
          }catch(err){setQueue(q=>q.map(x=>x.id===item.id?{...x,status:'error',result:{error:'Error procesando'}}:x));}
        }
        setProcessing(false);
      };
      const assignDoc=(item,target,tipo)=>{
        const doc={id:uid(),tipo,nombre:item.result.descripcion||item.name,archivo:item.result.referencia||item.name};
        if(target.type==='acomp'){updClient(target.clientId,c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===target.id?{...a,personalDocs:[...(a.personalDocs||[]),doc]}:a)}));}
        else{updClient(target.id,c=>({...c,personalDocs:[...(c.personalDocs||[]),doc]}));}
        setQueue(q=>q.map(x=>x.id===item.id?{...x,status:'assigned'}:x));
      };

      return(
        <div style={{padding:'0 16px'}}>
          {/* Coverage matrix */}
          {tc.length>0&&(
            <div style={{background:A.card,borderRadius:14,overflow:'hidden',border:`1px solid ${A.border}`,marginBottom:14}}>
              <div style={{background:A.card2,padding:'10px 14px',borderBottom:`1px solid ${A.border}`}}>
                <div style={{fontFamily:BARLOW,fontSize:10,color:A.muted,letterSpacing:3,textTransform:'uppercase'}}>Cobertura documental</div>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontFamily:BARLOW}}>
                  <thead><tr style={{background:A.bg}}>
                    <th style={{padding:'8px 12px',textAlign:'left',fontSize:11,color:A.muted,fontWeight:600,borderBottom:`1px solid ${A.border}`}}>Viajero</th>
                    {docCols.map(col=><th key={col} style={{padding:'8px 8px',textAlign:'center',fontSize:10,color:(colMeta[col]||{color:A.cyan}).color,fontWeight:700,borderBottom:`1px solid ${A.border}`,borderLeft:`1px solid ${A.border}`}}>{(colMeta[col]||{label:col}).label}</th>)}
                  </tr></thead>
                  <tbody>
                    {tc.map((c,ri)=>(
                      <React.Fragment key={c.id}>
                        <tr style={{background:ri%2===0?'transparent':A.bg+'88'}}>
                          <td style={{padding:'9px 12px',fontSize:12,color:A.text,fontWeight:600,borderBottom:`1px solid ${A.border}22`}}>{c.nombre.split(' ')[0]}</td>
                          {docCols.map(col=>{const s=getStatus(c,col);return<td key={col} style={{padding:'9px 8px',textAlign:'center',borderLeft:`1px solid ${A.border}22`,borderBottom:`1px solid ${A.border}22`}}><span style={{fontFamily:ANTON,fontSize:16,color:s==='ok'?A.green:A.muted+'66'}}>{s==='ok'?'✓':'—'}</span></td>;})}
                        </tr>
                        {(c.acompanantes||[]).map(ac=><tr key={ac.id} style={{background:A.purple+'06'}}>
                          <td style={{padding:'6px 12px 6px 20px',fontSize:11,color:A.purple,fontWeight:600,borderBottom:`1px solid ${A.border}22`}}>↳ {ac.nombre.split(' ')[0]}</td>
                          {docCols.map(col=>{const s=col==='passport'?(ac.passportPhoto?'ok':'miss'):((ac.personalDocs||[]).some(d=>(d.tipo||'doc')===col)?'ok':'miss');return<td key={col} style={{padding:'6px 8px',textAlign:'center',borderLeft:`1px solid ${A.border}22`,borderBottom:`1px solid ${A.border}22`}}><span style={{fontFamily:ANTON,fontSize:14,color:s==='ok'?A.green:A.muted+'44'}}>{s==='ok'?'✓':'—'}</span></td>;})}
                        </tr>)}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* API Key */}
          <div style={{background:A.card,borderRadius:14,padding:'14px',marginBottom:12,border:`1px solid ${A.purple}33`}}>
            <div style={{fontFamily:ANTON,fontSize:16,color:A.text,marginBottom:4,letterSpacing:1}}>🤖 IA Docs</div>
            <div style={{fontSize:12,color:A.muted,lineHeight:1.5,fontFamily:BARLOW,marginBottom:10}}>Introduce tu API Key de Anthropic para analizar documentos con IA. Se guarda solo en este navegador.</div>
            <input type="password" value={apiKey} onChange={e=>saveKey(e.target.value)} placeholder="sk-ant-api03-…"
                   style={{...ais,marginBottom:6,fontFamily:'monospace',fontSize:12,letterSpacing:0.5}}/>
            <div style={{fontSize:10,color:apiKey?A.green:A.orange,fontFamily:BARLOW}}>
              {apiKey?'✓ API Key configurada — la IA está disponible':'⚠️ Sin API Key — la función de análisis no estará disponible'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple style={{display:'none'}} onChange={addFiles}/>
          <button onClick={()=>fileRef.current.click()} style={{...ab(A.purple+'22',A.purple),width:'100%',border:`1.5px dashed ${A.purple}`,borderRadius:10,marginBottom:8,fontFamily:BARLOW}}>📎 Seleccionar PDFs / imágenes</button>
          {queue.filter(q=>q.status==='pending').length>0&&!processing&&(
            <button onClick={processAll} style={{...ab(apiKey?A.cyan:A.muted),width:'100%',borderRadius:10,marginBottom:12,color:A.bg,fontFamily:BARLOW,opacity:apiKey?1:0.5}}>🤖 Analizar con IA</button>
          )}
          {processing&&<div style={{textAlign:'center',padding:'10px',color:A.purple,fontSize:13,marginBottom:12,fontFamily:BARLOW}}>⏳ Procesando…</div>}
          {queue.length===0&&<AEmpty text="Sube PDFs de billetes, visados o seguros"/>}
          {queue.map(item=>(
            <div key={item.id} style={{background:A.card,borderRadius:12,padding:'12px',marginBottom:8,border:`1px solid ${item.status==='done'?A.cyan+'44':item.status==='assigned'?A.green+'44':item.status==='error'?A.red+'44':A.border+'44'}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:item.result?10:0}}>
                <span style={{fontSize:18}}>{item.status==='pending'?'📄':item.status==='processing'?'⏳':item.status==='done'?'✨':item.status==='assigned'?'✅':'❌'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:A.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontFamily:BARLOW}}>{item.name}</div>
                  <div style={{fontSize:10,color:A.muted,fontFamily:BARLOW}}>{item.status==='pending'?'Pendiente':item.status==='processing'?'Analizando…':item.status==='done'?'Listo — asigna a un viajero':item.status==='assigned'?'Asignado ✓':'Error'}</div>
                </div>
                {(item.status==='pending'||item.status==='done'||item.status==='error')&&<button onClick={()=>setQueue(q=>q.filter(x=>x.id!==item.id))} style={{background:'transparent',border:'none',color:A.muted,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button>}
              </div>
              {item.status==='done'&&item.result&&!item.result.error&&(
                <div>
                  <div style={{background:A.bg,borderRadius:8,padding:'8px 10px',marginBottom:8,border:`1px solid ${A.border}`}}>
                    {item.result.descripcion&&<div style={{fontSize:12,color:A.text,fontWeight:600,fontFamily:BARLOW}}>{item.result.descripcion}</div>}
                    {item.result.pasajero&&<div style={{fontSize:10,color:A.muted,fontFamily:BARLOW}}>👤 {item.result.pasajero}</div>}
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {allTargets.map(target=>{const sug=item.result.matchedTarget?.id===target.id;return(
                      <button key={target.id} onClick={()=>assignDoc(item,target,item.result.tipo||'doc')}
                              style={{padding:'6px 12px',borderRadius:8,cursor:'pointer',fontFamily:BARLOW,border:`2px solid ${sug?A.cyan:target.type==='acomp'?A.purple:A.border}`,background:sug?A.cyan+'22':target.type==='acomp'?A.purple+'11':A.bg,color:sug?A.cyan:target.type==='acomp'?A.purple:A.text,fontSize:11,fontWeight:sug?800:500}}>
                        {sug&&'⭐ '}{target.nombre.split(' ')[0]}{target.type==='acomp'&&<span style={{fontSize:9,opacity:0.7}}> acomp.</span>}
                      </button>
                    );})}
                  </div>
                </div>
              )}
              {item.status==='assigned'&&<div style={{fontSize:12,color:A.green,fontWeight:700,fontFamily:BARLOW}}>✅ Asignado correctamente</div>}
            </div>
          ))}
        </div>
      );
    };

    /* ── Edit Tab ─────────────── */
    const EditTab=()=>{
      const [sec,setSec]=useState('general');
      const [lf,setLf]=useState({name:trip.name,flag:trip.flag,fechas:trip.fechas||'',price:trip.price||'',webUrl:trip.webUrl||''});
      const [efm,setEfm]=useState({nombre:'',archivo:''});const [dfm,setDfm]=useState({nombre:'',archivo:''});const [ifm,setIfm]=useState({icono:'💡',titulo:'',texto:'',url:''});
      const secs=[{k:'general',l:'📋 General'},{k:'vuelos',l:'✈️ Vuelos'},{k:'docs',l:'📁 Docs'},{k:'pagos',l:'💳 Pagos'},{k:'info',l:'ℹ️ Info'}];
      return(
        <div style={{padding:'0 16px'}}>
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:8,marginBottom:12}}>
            {secs.map(({k,l})=><button key={k} onClick={()=>setSec(k)} style={{...ab(sec===k?A.cyan:A.card2,sec===k?A.bg:A.muted),flexShrink:0,fontSize:11,padding:'7px 12px',borderRadius:20,border:`1px solid ${sec===k?A.cyan:A.border}`,fontFamily:BARLOW}}>{l}</button>)}
          </div>
          {sec==='general'&&<div>
            <div style={{display:'grid',gridTemplateColumns:'58px 1fr',gap:10,marginBottom:10}}><input value={lf.flag} onChange={e=>setLf({...lf,flag:e.target.value})} style={{...ais,textAlign:'center',fontSize:24,padding:'8px'}}/><input value={lf.name} onChange={e=>setLf({...lf,name:e.target.value})} placeholder="Nombre del viaje" style={ais}/></div>
            <input value={lf.fechas} onChange={e=>setLf({...lf,fechas:e.target.value})} placeholder="Fechas para viajeros" style={{...ais,marginBottom:10}}/>
            <input value={lf.price} onChange={e=>setLf({...lf,price:e.target.value.replace(/\D/g,'')})} placeholder="Precio €" inputMode="numeric" style={{...ais,marginBottom:10}}/>
            <input value={lf.webUrl} onChange={e=>setLf({...lf,webUrl:e.target.value})} placeholder="🌐 URL web del viaje" style={{...ais,marginBottom:14}}/>
            <button onClick={()=>updTrip(t=>({...t,...lf,price:lf.price?+lf.price:null}))} style={{...ab(A.green),width:'100%',borderRadius:10,fontFamily:BARLOW}}>💾 Guardar</button>
          </div>}
          {sec==='vuelos'&&<div>
            {(trip.vuelos||[]).map((v,i)=><div key={i} style={{background:A.card,borderRadius:10,padding:'10px 14px',marginBottom:8,border:`1px solid ${A.border}44`,display:'flex',alignItems:'center',gap:10}}><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:A.text,fontFamily:BARLOW}}>{v.nombre}</div><div style={{fontSize:10,color:A.muted,fontFamily:BARLOW}}>{v.archivo}</div></div><button onClick={()=>updTrip(t=>({...t,vuelos:t.vuelos.filter((_,j)=>j!==i)}))} style={{background:'transparent',border:'none',color:A.muted,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button></div>)}
            <div style={{background:A.card2,borderRadius:10,padding:'12px',border:`1px solid ${A.border}`,marginTop:8}}>
              <input value={efm.nombre} onChange={e=>setEfm({...efm,nombre:e.target.value})} placeholder="Nombre del vuelo" style={{...ais,marginBottom:8}}/>
              <input value={efm.archivo} onChange={e=>setEfm({...efm,archivo:e.target.value})} placeholder="Referencia" style={{...ais,marginBottom:10}}/>
              <button onClick={()=>{if(!efm.nombre.trim())return;updTrip(t=>({...t,vuelos:[...(t.vuelos||[]),{id:uid(),...efm}]}));setEfm({nombre:'',archivo:''}); }} style={{...ab(A.cyan),width:'100%',borderRadius:8,fontFamily:BARLOW}}>+ Añadir</button>
            </div>
          </div>}
          {sec==='docs'&&<div>
            {(trip.docs||[]).map((d,i)=><div key={i} style={{background:A.card,borderRadius:10,padding:'10px 14px',marginBottom:8,border:`1px solid ${A.border}44`,display:'flex',alignItems:'center',gap:10}}><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:A.text,fontFamily:BARLOW}}>{d.nombre}</div><div style={{fontSize:10,color:A.muted,fontFamily:BARLOW}}>{d.archivo}</div></div><button onClick={()=>updTrip(t=>({...t,docs:t.docs.filter((_,j)=>j!==i)}))} style={{background:'transparent',border:'none',color:A.muted,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button></div>)}
            <div style={{background:A.card2,borderRadius:10,padding:'12px',border:`1px solid ${A.border}`,marginTop:8}}>
              <input value={dfm.nombre} onChange={e=>setDfm({...dfm,nombre:e.target.value})} placeholder="Nombre del documento" style={{...ais,marginBottom:8}}/>
              <input value={dfm.archivo} onChange={e=>setDfm({...dfm,archivo:e.target.value})} placeholder="Referencia" style={{...ais,marginBottom:10}}/>
              <button onClick={()=>{if(!dfm.nombre.trim())return;updTrip(t=>({...t,docs:[...(t.docs||[]),{id:uid(),...dfm}]}));setDfm({nombre:'',archivo:''}); }} style={{...ab(A.cyan),width:'100%',borderRadius:8,fontFamily:BARLOW}}>+ Añadir</button>
            </div>
          </div>}
          {sec==='pagos'&&<div>
            {(trip.pagosConfig||[]).map((p,i)=>(
              <div key={i} style={{background:A.card,borderRadius:10,padding:'12px',marginBottom:10,border:`1px solid ${A.border}`}}>
                <div style={{fontSize:10,color:A.cyan,fontWeight:700,marginBottom:8,fontFamily:BARLOW,letterSpacing:2,textTransform:'uppercase'}}>Pago {i+1}</div>
                <input value={p.label} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,label:e.target.value}:x)}))} placeholder="Concepto" style={{...ais,marginBottom:8}}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <input value={p.fecha} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,fecha:e.target.value}:x)}))} placeholder="Texto fecha" style={ais}/>
                  <input value={p.importe} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,importe:e.target.value}:x)}))} placeholder="Importe" style={ais}/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:11,color:A.orange,fontFamily:BARLOW,flexShrink:0}}>📅</span>
                  <input type="date" value={p.fechaISO||''} onChange={e=>updTrip(t=>({...t,pagosConfig:t.pagosConfig.map((x,j)=>j===i?{...x,fechaISO:e.target.value}:x)}))} style={{...ais,fontSize:12,colorScheme:'dark'}}/>
                </div>
                {(isUrgent(p.fechaISO)||isOverdue(p.fechaISO))&&<div style={{fontSize:10,color:A.orange,fontFamily:BARLOW,marginTop:6}}>⚠️ {isOverdue(p.fechaISO)?'Vencido':'Próximo en 7 días'}</div>}
              </div>
            ))}
            <button onClick={()=>updTrip(t=>({...t,pagosConfig:[...(t.pagosConfig||[]),{label:'Nuevo pago',fecha:'',fechaISO:'',importe:''}]}))} style={{...ab(A.orange+'22',A.orange),width:'100%',border:`1.5px dashed ${A.orange}`,borderRadius:10,fontFamily:BARLOW}}>+ Añadir hito</button>
          </div>}
          {sec==='info'&&<div>
            {(trip.info||[]).map((it,i)=><div key={i} style={{background:A.card,borderRadius:10,padding:'10px 14px',marginBottom:8,border:`1px solid ${A.border}44`,display:'flex',gap:10,alignItems:'flex-start'}}><span style={{fontSize:22}}>{it.icono}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:A.text,fontFamily:BARLOW}}>{it.titulo}</div><div style={{fontSize:11,color:A.muted,marginTop:2,fontFamily:BARLOW}}>{it.texto}</div></div><button onClick={()=>updTrip(t=>({...t,info:t.info.filter((_,j)=>j!==i)}))} style={{background:'transparent',border:'none',color:A.muted,fontSize:18,cursor:'pointer',lineHeight:1}}>×</button></div>)}
            <div style={{background:A.card2,borderRadius:10,padding:'12px',border:`1px solid ${A.border}`,marginTop:8}}>
              <div style={{display:'grid',gridTemplateColumns:'58px 1fr',gap:8,marginBottom:8}}><input value={ifm.icono} onChange={e=>setIfm({...ifm,icono:e.target.value})} style={{...ais,textAlign:'center',fontSize:22,padding:'8px'}}/><input value={ifm.titulo} onChange={e=>setIfm({...ifm,titulo:e.target.value})} placeholder="Título" style={ais}/></div>
              <textarea value={ifm.texto} onChange={e=>setIfm({...ifm,texto:e.target.value})} placeholder="Texto…" style={{...ais,minHeight:70,resize:'vertical',marginBottom:8,lineHeight:1.5}}/>
              <input value={ifm.url||''} onChange={e=>setIfm({...ifm,url:e.target.value})} placeholder="🔗 Enlace (opcional)" style={{...ais,marginBottom:10}}/>
              <button onClick={()=>{if(!ifm.titulo.trim())return;updTrip(t=>({...t,info:[...(t.info||[]),{...ifm}]}));setIfm({icono:'💡',titulo:'',texto:'',url:''}); }} style={{...ab(A.cyan),width:'100%',borderRadius:8,fontFamily:BARLOW}}>+ Añadir</button>
            </div>
          </div>}
        </div>
      );
    };

    return(
      <div style={{background:A.bg,minHeight:'100vh',color:A.text,paddingBottom:76,fontFamily:BARLOW}}>
        <div style={{background:A.card,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${A.border}`,position:'sticky',top:0,zIndex:10}}>
          <span style={{fontSize:26,flexShrink:0}}>{trip.flag}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:ANTON,fontSize:16,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',letterSpacing:1,textTransform:'uppercase'}}>{trip.name}</div>
            <div style={{fontSize:10,color:A.cyan,letterSpacing:2,fontFamily:BARLOW}}>{fmt(trip.date)}{trip.price?` · ${trip.price.toLocaleString('es')}€`:''}</div>
          </div>
          <button onClick={()=>go('ahome')} style={{background:A.card2,border:`1px solid ${A.border}`,color:A.text,borderRadius:8,width:36,height:36,cursor:'pointer',fontSize:16,flexShrink:0}}>←</button>
        </div>
        <SwipeableTabs tabs={CRM_TABS} activeTab={tab} onTabChange={setTab}>
          <div style={{textAlign:'center',padding:'4px 0 8px',fontSize:9,color:A.border,letterSpacing:1,fontFamily:BARLOW}}>← desliza →</div>
          <div style={{minHeight:'calc(100vh - 160px)'}}>
            {tab==='people'&&<PeopleTab/>}
            {tab==='pagos' &&<PagosTab/>}
            {tab==='ai'    &&<AIDocsTab/>}
            {tab==='notes' &&<div style={{padding:'0 16px'}}><textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={()=>mut(d=>({...d,notes}))} placeholder="✏️ Escribe tus anotaciones…" style={{...ais,minHeight:280,resize:'vertical',lineHeight:1.7}}/><div style={{fontSize:10,color:A.muted,marginTop:6,textAlign:'right',fontFamily:BARLOW}}>💾 Se guarda al salir del campo</div></div>}
            {tab==='edit'  &&<EditTab/>}
          </div>
        </SwipeableTabs>
        <div style={{position:'fixed',bottom:0,left:0,right:0,background:A.card,borderTop:`1px solid ${A.border}`,display:'flex',zIndex:10}}>
          {CRM_TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
                    style={{flex:1,background:'transparent',border:'none',color:tab===t.key?A.cyan:A.muted,padding:'10px 2px 8px',cursor:'pointer',borderTop:`2px solid ${tab===t.key?A.cyan:'transparent'}`,fontFamily:BARLOW,minWidth:46}}>
              <div style={{fontSize:18}}>{t.icon}</div>
              <div style={{fontSize:8,fontWeight:700,marginTop:1,letterSpacing:1}}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Passport ───────────────────────────────────────────── */
  function Passport({go,cid,clients,trips,sC,setScreen,setNav}){
    const cl=clients.find(c=>c.id===cid);
    const trip=cl?.tripId?trips.find(t=>t.id===cl.tripId):null;
    const [photo,setPhoto]=useState(null);const [c1,setC1]=useState(false);const [c2,setC2]=useState(false);
    const ref=useRef();
    if(!cl)return<div style={{padding:40,fontFamily:BARLOW,color:A.muted}}>Error</div>;
    const onFile=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPhoto(ev.target.result);r.readAsDataURL(f);};
    const submit=async()=>{
      if(!photo||!c1)return;
      await sC(clients.map(x=>x.id===cid?{...x,passportPhoto:photo,passportConsent:c1,photoConsent:c2,firstLogin:false}:x));
      setNav(n=>({...n,cid}));setScreen('client');
    };
    return(
      <div style={{fontFamily:BARLOW,background:A.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',color:A.text}}>
        <div style={{background:'linear-gradient(135deg,#07070f 0%,#0f1f3d 60%,#07070f 100%)',padding:'40px 24px 32px',position:'relative',overflow:'hidden',borderBottom:`1px solid ${A.border}`}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(0,240,255,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div style={{fontFamily:ANTON,fontSize:11,letterSpacing:6,color:A.cyan,textTransform:'uppercase',marginBottom:8}}>Bienvenido/a</div>
          <div style={{fontFamily:ANTON,fontSize:36,color:'#fff',lineHeight:0.9,marginBottom:12}}>{cl.nombre.split(' ')[0].toUpperCase()}</div>
          {trip?(
            <div style={{display:'flex',alignItems:'center',gap:14,marginTop:12}}>
              <span style={{fontSize:40}}>{trip.flag}</span>
              <div><div style={{fontFamily:ANTON,fontSize:20,color:'#fff',letterSpacing:1}}>{trip.name.toUpperCase()}</div><div style={{fontSize:14,color:A.muted,fontFamily:BARLOW,marginTop:2}}>{trip.fechas}</div></div>
            </div>
          ):<div style={{fontSize:15,color:A.muted,fontFamily:BARLOW,marginTop:8}}>Regístrate para acceder a tu portal de viajero.</div>}
        </div>
        <div style={{padding:'24px 20px'}}>
          <div style={{background:A.card,borderRadius:14,padding:20,border:`1px solid ${A.border}`,marginBottom:16}}>
            <div style={{fontFamily:ANTON,fontSize:22,color:'#fff',marginBottom:8,letterSpacing:1}}>📸 FOTO DEL PASAPORTE</div>
            <div style={{fontSize:15,color:A.muted,lineHeight:1.6,fontFamily:BARLOW,marginBottom:16}}>Necesitamos una foto de tu pasaporte para gestionar visados, seguros y reservas.</div>
            <div onClick={()=>ref.current.click()} style={{background:photo?'transparent':A.card2,border:`2px dashed ${photo?A.cyan:A.border}`,borderRadius:12,height:160,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',marginBottom:16,position:'relative'}}>
              {photo?<img src={photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:
                <div style={{textAlign:'center',color:A.muted}}><div style={{fontSize:40,marginBottom:8}}>📷</div><div style={{fontFamily:ANTON,fontSize:16,color:A.cyan,letterSpacing:1}}>TOCA PARA FOTOGRAFIAR</div><div style={{fontSize:12,marginTop:4,fontFamily:BARLOW}}>o elegir de la galería</div></div>}
              {photo&&<div style={{position:'absolute',bottom:8,right:8,background:'rgba(0,0,0,0.7)',color:'white',borderRadius:6,padding:'4px 10px',fontSize:11,fontFamily:BARLOW}}>Toca para cambiar</div>}
            </div>
            <input ref={ref} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={onFile}/>
            <div style={{background:A.card2,borderRadius:10,padding:'14px',marginBottom:16,border:`1px solid ${A.border}`}}>
              <div style={{fontFamily:BARLOW,fontSize:12,fontWeight:700,color:A.cyan,marginBottom:8,letterSpacing:2,textTransform:'uppercase'}}>RGPD</div>
              <div style={{fontSize:12,color:A.muted,lineHeight:1.75,fontFamily:BARLOW}}>Tus datos e imagen del documento serán tratados por <strong style={{color:A.text}}>Travelike</strong> exclusivamente para gestionar los trámites del viaje, conforme al <strong style={{color:A.text}}>RGPD (UE 2016/679)</strong>.</div>
            </div>
            <label style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:16,cursor:'pointer',padding:'12px',background:c1?A.green+'15':'rgba(26,26,0,0.5)',borderRadius:12,border:`2px solid ${c1?A.green:A.border}`}}>
              <input type="checkbox" checked={c1} onChange={e=>setC1(e.target.checked)} style={{marginTop:4,width:20,height:20,flexShrink:0,accentColor:A.green}}/>
              <span style={{fontSize:13,color:A.text,lineHeight:1.55,fontFamily:BARLOW}}><strong>* Obligatorio.</strong> Acepto que Travelike use mi foto de pasaporte para los trámites del viaje.</span>
            </label>
            <div style={{background:'linear-gradient(135deg,rgba(191,95,255,0.12) 0%,rgba(0,240,255,0.05) 100%)',border:`2px solid ${c2?A.purple:A.purple+'55'}`,borderRadius:18,padding:'16px',marginBottom:20}}>
              <div style={{textAlign:'center',marginBottom:8}}><span style={{fontSize:28}}>📸</span><span style={{fontSize:18,marginLeft:4}}>✨</span></div>
              <div style={{fontFamily:ANTON,fontSize:18,color:'#fff',textAlign:'center',marginBottom:8,letterSpacing:1,textTransform:'uppercase',lineHeight:1.1}}>¡Las fotos son la magia del viaje!</div>
              <div style={{fontFamily:BARLOW,fontSize:13,color:A.muted,lineHeight:1.6,textAlign:'center',marginBottom:14}}>Compartir momentos especiales nos ayuda a que otras personas descubran estos viajes. <strong style={{color:A.text}}>Sin ninguna presión</strong>, solo si tú quieres 😊</div>
              <label style={{display:'flex',gap:14,alignItems:'center',cursor:'pointer',padding:'12px',background:c2?A.purple+'20':A.card2,borderRadius:14,border:`2px solid ${c2?A.purple:A.border+'66'}`}}>
                <input type="checkbox" checked={c2} onChange={e=>setC2(e.target.checked)} style={{width:22,height:22,flexShrink:0,accentColor:A.purple}}/>
                <div><div style={{fontFamily:BARLOW,fontSize:14,fontWeight:700,color:c2?'#fff':A.muted,marginBottom:2}}>{c2?'💜 ¡Gracias! Nos hace mucha ilusión':'Autorizar el uso de mis fotos en redes'}</div><div style={{fontFamily:BARLOW,fontSize:11,color:A.muted}}>Opcional</div></div>
              </label>
            </div>
            <button onClick={submit} disabled={!photo||!c1}
                    style={{width:'100%',padding:'18px',border:'none',borderRadius:10,fontFamily:ANTON,fontSize:16,letterSpacing:3,cursor:photo&&c1?'pointer':'default',textTransform:'uppercase',
                            background:photo&&c1?`linear-gradient(90deg,${A.red},#c00020)`:'#1a1a1a',
                            color:photo&&c1?'#fff':A.muted,boxShadow:photo&&c1?'0 0 24px rgba(232,0,42,0.3)':'none'}}>
              {!photo?'📷 Sube la foto del pasaporte':!c1?'✅ Acepta el consentimiento':'ACCEDER AL PORTAL →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── No Trips ───────────────────────────────────────────── */
  function NoTrips({cl,logout}){
    return(
      <div style={{background:A.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',fontFamily:BARLOW,color:A.text}}>
        <div style={{background:'linear-gradient(135deg,#07070f 0%,#0f1f3d 50%,#07070f 100%)',padding:'52px 28px 40px',textAlign:'center',borderBottom:`1px solid ${A.border}`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(0,240,255,0.07) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div style={{display:'flex',justifyContent:'center',marginBottom:20}}><TravelikeLogo size={40}/></div>
        </div>
        <div style={{padding:'40px 28px',textAlign:'center'}}>
          <div style={{fontSize:72,marginBottom:16}}>✈️</div>
          <div style={{fontFamily:ANTON,fontSize:30,color:'#fff',letterSpacing:1,marginBottom:8,lineHeight:1.1}}>¡HOLA,<br/>{cl.nombre.split(' ')[0].toUpperCase()}!</div>
          {cl.passportPhoto&&(
            <div style={{background:A.green+'22',border:`2px solid ${A.green}44`,borderRadius:14,padding:'12px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:12,justifyContent:'center'}}>
              <span style={{fontSize:22}}>✅</span><span style={{fontFamily:BARLOW,fontSize:14,color:A.green,fontWeight:700}}>Pasaporte registrado correctamente</span>
            </div>
          )}
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,padding:'32px 24px',marginBottom:28}}>
            <div style={{fontSize:52,marginBottom:12}}>🗓</div>
            <div style={{fontFamily:ANTON,fontSize:22,color:'#fff',letterSpacing:1,marginBottom:12,lineHeight:1.1,textTransform:'uppercase'}}>Todavía no tienes<br/>ningún viaje asignado</div>
            <div style={{fontFamily:BARLOW,fontSize:15,color:A.muted,lineHeight:1.7}}>Tu agencia te notificará en cuanto te asigne a un viaje. ¡Pronto tendrás todo listo para despegar! 🚀</div>
          </div>
          <button onClick={logout} style={{background:'none',border:`1px solid ${A.border}`,color:A.muted,borderRadius:10,padding:'13px 28px',fontFamily:BARLOW,fontSize:14,cursor:'pointer',letterSpacing:2}}>Cerrar sesión</button>
        </div>
      </div>
    );
  }

  /* ── Client Portal ──────────────────────────────────────── */
  function Client({go,cid,clients,trips,logout,sC}){
    const cl=clients.find(c=>c.id===cid);
    const trip=cl?trips.find(t=>t.id===cl.tripId):null;
    const [section,setSection]=useState(null);
    if(!cl||!trip)return(
      <div style={{fontFamily:BARLOW,display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:16,color:A.muted,background:A.bg}}>
        <div style={{fontSize:48}}>😕</div>
        <div style={{fontFamily:ANTON,fontSize:28,letterSpacing:2,color:'#fff',textTransform:'uppercase'}}>No encontrado</div>
        <button onClick={()=>go('home')} style={{...ab(A.red,'#fff'),padding:'14px 28px',fontFamily:ANTON,letterSpacing:3,fontSize:14,textTransform:'uppercase',borderRadius:8}}>← VOLVER</button>
      </div>
    );
    const allVuelos=[...(trip.vuelos||[]),...(cl.personalDocs||[]).filter(d=>d.tipo==='vuelo')];
    const allDocs  =[...(trip.docs  ||[]),...(cl.personalDocs||[]).filter(d=>d.tipo!=='vuelo')];
    const acomps   =cl.acompanantes||[];
    const updCL    =async fn=>sC(clients.map(c=>c.id===cid?fn(c):c));
    const countdown=()=>{const d=parseISO(trip.date+'-01');if(!d)return null;const days=Math.ceil((d-NOW)/864e5);return days>0?days:null;};
    const days=countdown();

    const Header=({mini=false})=>(
      <div style={{background:'linear-gradient(135deg,#07070f 0%,#0f1f3d 55%,#07070f 100%)',padding:mini?'16px 20px':'48px 28px 36px',color:'white',position:'relative',overflow:'hidden',borderBottom:`1px solid ${A.border}`}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 0%,rgba(0,240,255,0.07) 0%,transparent 60%)',pointerEvents:'none'}}/>
        {mini&&<button onClick={()=>setSection(null)} style={{position:'absolute',top:12,left:14,width:44,height:44,borderRadius:12,background:'rgba(0,240,255,0.1)',border:`1.5px solid ${A.cyan}44`,color:A.cyan,fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,lineHeight:1}}>←</button>}
        <button onClick={logout} style={{position:'absolute',top:12,right:14,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:A.muted,borderRadius:8,padding:'6px 12px',fontSize:10,cursor:'pointer',fontFamily:BARLOW,fontWeight:700,letterSpacing:2,textTransform:'uppercase'}}>SALIR</button>
        <div style={{paddingLeft:mini?54:0,paddingRight:60}}>
          {!mini&&<div style={{fontFamily:BARLOW,fontSize:11,letterSpacing:6,color:A.muted,textTransform:'uppercase',marginBottom:6}}>Hola, {cl.nombre.split(' ')[0]} 👋</div>}
          <div style={{display:'flex',alignItems:'center',gap:12,marginTop:mini?0:4}}>
            <span style={{fontSize:mini?30:46}}>{trip.flag}</span>
            <div>
              <div style={{fontFamily:ANTON,fontSize:mini?18:28,color:'#fff',lineHeight:1,letterSpacing:1,textTransform:'uppercase'}}>{trip.name}</div>
              {!mini&&<div style={{fontFamily:BARLOW,fontSize:15,color:A.muted,marginTop:4}}>{trip.fechas}</div>}
              {!mini&&days&&<div style={{fontFamily:BARLOW,fontSize:13,color:A.cyan,marginTop:4,fontWeight:700}}>🗓 Quedan <strong style={{fontFamily:ANTON,fontSize:18}}>{days}</strong> días</div>}
            </div>
          </div>
        </div>
      </div>
    );

    const GrupoSection=()=>{
      const fileRefs=useRef({});
      const uploadPhoto=(acId,file)=>{const r=new FileReader();r.onload=e=>updCL(c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===acId?{...a,passportPhoto:e.target.result}:a)}));r.readAsDataURL(file);};
      const toggle=(acId,field)=>updCL(c=>({...c,acompanantes:(c.acompanantes||[]).map(a=>a.id===acId?{...a,[field]:!a[field]}:a)}));
      return(
        <div style={{padding:'28px 24px'}}>
          <div style={{fontFamily:BARLOW,fontSize:18,color:A.muted,lineHeight:1.6,marginBottom:24}}>Gestiona los datos de las personas que viajan contigo en la misma reserva.</div>
          {acomps.length===0?(
            <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:18,padding:'32px 24px',textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:12}}>👥</div>
              <div style={{fontFamily:BARLOW,fontSize:16,color:A.muted,lineHeight:1.65}}>Tu agencia indicará aquí a los acompañantes de tu reserva.</div>
            </div>
          ):acomps.map(ac=>(
            <div key={ac.id} onClick={()=>fileRefs.current[ac.id]?.click()}
                 style={{background:A.card,border:`2px solid ${ac.passportPhoto&&ac.passportConsent?A.green+'44':A.border}`,borderRadius:18,padding:'20px',marginBottom:16,cursor:'pointer'}}>
              <input ref={el=>{if(el)fileRefs.current[ac.id]=el;}} type="file" accept="image/*" capture="environment"
                     style={{display:'none'}} onClick={e=>e.stopPropagation()}
                     onChange={e=>{if(e.target.files[0])uploadPhoto(ac.id,e.target.files[0]);}}/>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                <div style={{width:64,height:64,borderRadius:14,overflow:'hidden',border:`3px solid ${ac.passportPhoto?A.green:A.border}`,background:A.card2,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {ac.passportPhoto?<img src={ac.passportPhoto} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:
                    <div style={{textAlign:'center'}}><div style={{fontSize:28}}>📷</div><div style={{fontSize:10,color:A.muted,fontFamily:BARLOW}}>Subir foto</div></div>}
                </div>
                <div>
                  <div style={{fontFamily:ANTON,fontSize:22,color:'#fff',letterSpacing:1,textTransform:'uppercase'}}>{ac.nombre}</div>
                  <div style={{fontFamily:BARLOW,fontSize:13,color:ac.passportPhoto?A.green:A.muted,marginTop:4}}>{ac.passportPhoto?'✅ Pasaporte subido':'📷 Toca para subir pasaporte'}</div>
                </div>
              </div>
              {ac.passportPhoto&&(
                <div onClick={e=>e.stopPropagation()}>
                  <label style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:12,cursor:'pointer',padding:'12px',background:ac.passportConsent?A.green+'15':'rgba(26,26,0,0.5)',borderRadius:12,border:`2px solid ${ac.passportConsent?A.green:A.border}`}}>
                    <input type="checkbox" checked={ac.passportConsent} onChange={()=>toggle(ac.id,'passportConsent')} style={{marginTop:4,width:20,height:20,flexShrink:0,accentColor:A.green}}/>
                    <span style={{fontSize:13,color:A.text,lineHeight:1.55,fontFamily:BARLOW}}><strong>* Obligatorio.</strong> Acepto que Travelike use el pasaporte de {ac.nombre.split(' ')[0]} para los trámites del viaje (RGPD).</span>
                  </label>
                  <label style={{display:'flex',gap:12,alignItems:'center',cursor:'pointer',padding:'10px 12px',background:ac.photoConsent?A.purple+'15':A.card2,borderRadius:12,border:`1.5px solid ${ac.photoConsent?A.purple:A.border}`}}>
                    <input type="checkbox" checked={ac.photoConsent} onChange={()=>toggle(ac.id,'photoConsent')} style={{width:20,height:20,flexShrink:0,accentColor:A.purple}}/>
                    <span style={{fontSize:13,color:ac.photoConsent?'#fff':A.muted,fontFamily:BARLOW}}>{ac.photoConsent?`💜 ¡Gracias!`:`Autorizar fotos de ${ac.nombre.split(' ')[0]} en redes`} <span style={{fontSize:11,opacity:0.7}}>(opcional)</span></span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    };

    const PagosContent=()=>{
      const pc=trip.pagosConfig||[];const pe=cl.pagosEstado||pc.map(()=>'pendiente');
      const totalN=pc.reduce((a,p)=>a+parseInt((p.importe||'0').replace(/[^0-9]/g,'')),0);
      const pagadoN=pc.reduce((a,p,i)=>a+(pe[i]==='pagado'?parseInt((p.importe||'0').replace(/[^0-9]/g,'')):0),0);
      const pct=totalN>0?Math.round(pagadoN/totalN*100):0;
      const hasUrgentClient=pc.some((p,i)=>pe[i]!=='pagado'&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)));
      return(
        <div>
          {hasUrgentClient&&<div style={{background:A.orange+'22',border:`2px solid ${A.orange}44`,borderRadius:14,padding:'14px 18px',marginBottom:20,fontFamily:BARLOW}}>
            <div style={{fontFamily:ANTON,fontSize:18,color:A.orange,letterSpacing:1,marginBottom:4}}>⚠️ PAGO PRÓXIMO</div>
            <div style={{fontSize:14,color:A.muted,lineHeight:1.5}}>Tienes un pago con fecha límite próxima o vencida.</div>
          </div>}
          {totalN>0&&<div style={{background:'linear-gradient(135deg,#07070f 0%,#0f1f3d 100%)',borderRadius:20,padding:24,marginBottom:24,border:`1px solid ${A.cyan}22`}}>
            <div style={{fontFamily:BARLOW,fontSize:13,color:A.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:6}}>Total del viaje</div>
            <div style={{fontFamily:ANTON,fontSize:52,color:'#fff',lineHeight:1,letterSpacing:1,marginBottom:16}}>{totalN.toLocaleString()} <span style={{fontSize:28,color:A.muted}}>€</span></div>
            <div style={{background:'rgba(255,255,255,0.1)',borderRadius:30,height:10}}><div style={{width:`${pct}%`,background:A.cyan,height:'100%',borderRadius:30,boxShadow:`0 0 12px ${A.cyan}66`}}/></div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:10,fontFamily:BARLOW}}>
              <span style={{color:A.cyan,fontWeight:700,fontSize:16}}>✓ {pagadoN.toLocaleString()} €</span>
              <span style={{color:A.muted,fontSize:16}}>Pendiente: {(totalN-pagadoN).toLocaleString()} €</span>
            </div>
          </div>}
          {pc.map((pago,i)=>{
            const done=pe[i]==='pagado';const urg=!done&&(isUrgent(pago.fechaISO)||isOverdue(pago.fechaISO));const ovd=isOverdue(pago.fechaISO);const concepto=genConcepto(pago.label,trip.name,cl.nombre);
            return(
              <div key={i} style={{display:'flex',gap:16,marginBottom:20,alignItems:'stretch'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:52,flexShrink:0}}>
                  <div style={{width:52,height:52,borderRadius:'50%',background:done?A.green+'22':urg?A.orange+'22':A.card,border:`3px solid ${done?A.green:urg?A.orange:A.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:ANTON,fontSize:done?22:18,color:done?A.green:urg?A.orange:A.muted}}>{done?'✓':i+1}</div>
                  {i<pc.length-1&&<div style={{flex:1,width:3,background:done?A.green:A.border,borderRadius:3,marginTop:8}}/>}
                </div>
                <div style={{flex:1,background:A.card,border:`2px solid ${done?A.green+'44':urg?A.orange+'44':A.border}`,borderRadius:16,padding:'18px 20px',boxShadow:urg&&!done?`0 0 16px ${A.orange}22`:'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:done?0:12}}>
                    <div>
                      <div style={{fontFamily:BARLOW,fontSize:11,color:urg?A.orange:A.cyan,fontWeight:700,letterSpacing:3,textTransform:'uppercase',marginBottom:4}}>PAGO {i+1}</div>
                      <div style={{fontFamily:ANTON,fontSize:22,color:'#fff',letterSpacing:1,marginBottom:4,textTransform:'uppercase'}}>{pago.label}</div>
                      {pago.fecha&&<div style={{fontFamily:BARLOW,fontSize:14,color:A.muted}}>📅 {pago.fecha}</div>}
                    </div>
                    <div style={{textAlign:'right'}}>
                      {pago.importe&&<div style={{fontFamily:ANTON,fontSize:24,color:'#fff',letterSpacing:1}}>{pago.importe}</div>}
                      <div style={{marginTop:8,padding:'6px 12px',borderRadius:20,fontFamily:BARLOW,fontSize:13,fontWeight:700,background:done?A.green+'22':urg?A.orange+'22':A.orange+'15',color:done?A.green:urg?A.orange:A.orange,border:`1px solid ${done?A.green+'44':urg?A.orange+'44':A.orange+'33'}`}}>
                        {done?'✓ PAGADO':ovd?'⚠️ VENCIDO':urg?'🔔 PRÓXIMO':'⏳ PENDIENTE'}
                      </div>
                    </div>
                  </div>
                  {!done&&(
                    <div style={{background:A.card2,borderRadius:12,padding:'12px 14px',border:`1px solid ${urg?A.orange+'33':A.border}`,marginTop:8}}>
                      <div style={{fontFamily:BARLOW,fontSize:11,color:urg?A.orange:A.cyan,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>💳 Datos para transferencia</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                        <span style={{fontSize:13,color:A.muted,fontFamily:BARLOW}}>Titular</span>
                        <span style={{fontSize:13,color:A.text,fontWeight:700,fontFamily:BARLOW}}>{BANK_TITULAR}</span>
                      </div>
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:11,color:A.muted,fontFamily:BARLOW,marginBottom:4}}>IBAN</div>
                        <div style={{display:'flex',alignItems:'center',gap:8,background:A.bg,borderRadius:10,padding:'8px 12px',border:`1px solid ${A.border}`}}>
                          <span style={{flex:1,fontSize:12,color:A.text,fontWeight:700,fontFamily:BARLOW,letterSpacing:0.5}}>{BANK_IBAN}</span>
                          <CopyBtn text={BANK_IBAN}/>
                        </div>
                      </div>
                      <div style={{borderTop:`1px solid ${A.border}`,paddingTop:10}}>
                        <div style={{fontSize:11,color:A.muted,fontFamily:BARLOW,marginBottom:6}}>Concepto (cópialo tal cual 👇)</div>
                        <div style={{display:'flex',alignItems:'center',gap:8,background:A.bg,borderRadius:10,padding:'10px 12px',border:`1px solid ${A.cyan}33`}}>
                          <span style={{flex:1,fontSize:11,color:A.cyan,fontWeight:800,fontFamily:BARLOW,wordBreak:'break-all'}}>{concepto}</span>
                          <CopyBtn text={concepto}/>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    if(!section){
      const gridItems=[
        {id:'vuelos',emoji:'✈️',label:'VUELOS',      desc:'Billetes y embarque', color:A.cyan,   count:allVuelos.length},
        {id:'docs',  emoji:'📋',label:'DOCUMENTOS',  desc:'Visados y seguros',   color:A.gold,   count:allDocs.length},
        {id:'pagos', emoji:'💳',label:'PAGOS',       desc:'Estado de tus pagos', color:A.green,  count:null},
        {id:'info',  emoji:'ℹ️', label:'INFORMACIÓN', desc:'Consejos del destino',color:A.purple, count:(trip.info||[]).length},
      ];
      const hasUrgentAny=(trip.pagosConfig||[]).some((p,i)=>(cl.pagosEstado||[])[i]!=='pagado'&&(isUrgent(p.fechaISO)||isOverdue(p.fechaISO)));
      return(
        <div style={{background:A.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',paddingBottom:30,fontFamily:BARLOW,color:A.text}}>
          <Header/>
          <div style={{padding:'28px 20px 0'}}>
            <div style={{fontFamily:BARLOW,fontSize:13,color:A.muted,marginBottom:18,textAlign:'center',letterSpacing:3,textTransform:'uppercase'}}>¿Qué quieres consultar?</div>
            {hasUrgentAny&&<div style={{background:A.orange+'22',border:`1.5px solid ${A.orange}44`,borderRadius:14,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}><span style={{fontSize:24}}>⚠️</span><div><div style={{fontFamily:BARLOW,fontSize:14,color:A.orange,fontWeight:700}}>Pago próximo o vencido</div><div style={{fontSize:12,color:A.muted,fontFamily:BARLOW}}>Revisa el estado de tus pagos</div></div></div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              {gridItems.map(item=>(
                <button key={item.id} onClick={()=>setSection(item.id)}
                        style={{background:A.card,border:`1.5px solid ${A.border}`,borderRadius:18,padding:'26px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:8,cursor:'pointer',textAlign:'center',position:'relative'}}>
                  <span style={{fontSize:44}}>{item.emoji}</span>
                  <span style={{fontFamily:ANTON,fontSize:17,color:item.color,letterSpacing:2,lineHeight:1}}>{item.label}</span>
                  <span style={{fontFamily:BARLOW,fontSize:12,color:A.muted}}>{item.desc}</span>
                  {item.id==='pagos'&&hasUrgentAny&&<div style={{position:'absolute',top:8,right:10,width:10,height:10,borderRadius:'50%',background:A.orange,boxShadow:`0 0 6px ${A.orange}`}}/>}
                  {item.count>0&&<div style={{position:'absolute',top:8,right:10,background:item.color,color:A.bg,borderRadius:20,fontFamily:ANTON,fontSize:11,minWidth:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px'}}>{item.count}</div>}
                </button>
              ))}
            </div>
            {acomps.length>0&&(
              <button onClick={()=>setSection('grupo')}
                      style={{width:'100%',background:'linear-gradient(135deg,#0a0a1a 0%,#1a0f30 100%)',border:`1.5px solid ${A.purple}44`,borderRadius:18,padding:'20px 24px',display:'flex',alignItems:'center',gap:18,cursor:'pointer',textAlign:'left',marginBottom:12}}>
                <span style={{fontSize:44}}>👥</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:ANTON,fontSize:22,color:'#fff',letterSpacing:2,textTransform:'uppercase',lineHeight:1,marginBottom:4}}>MI GRUPO</div>
                  <div style={{fontFamily:BARLOW,fontSize:14,color:A.muted}}>{acomps.filter(a=>a.passportPhoto&&a.passportConsent).length}/{acomps.length} acompañantes con datos completos</div>
                  <div style={{fontFamily:BARLOW,fontSize:11,color:A.purple,marginTop:4,fontWeight:700}}>{acomps.some(a=>!a.passportPhoto||!a.passportConsent)?'⚠️ Faltan datos':'✅ Todo completo'}</div>
                </div>
                <div style={{fontFamily:ANTON,fontSize:32,color:A.purple+'55'}}>›</div>
              </button>
            )}
            {trip.webUrl?(
              <button onClick={()=>window.open(trip.webUrl,'_blank')}
                      style={{width:'100%',background:'linear-gradient(135deg,#0a0a1a 0%,#0f1f3d 100%)',border:`1.5px solid ${A.cyan}44`,borderRadius:18,padding:'20px 24px',display:'flex',alignItems:'center',gap:18,cursor:'pointer',textAlign:'left'}}>
                <span style={{fontSize:44}}>🌐</span>
                <div style={{flex:1}}><div style={{fontFamily:ANTON,fontSize:22,color:'#fff',letterSpacing:2,textTransform:'uppercase',lineHeight:1}}>WEB DEL VIAJE</div><div style={{fontFamily:BARLOW,fontSize:14,color:A.muted,marginTop:4}}>Toda la información en nuestra web</div></div>
                <div style={{fontFamily:ANTON,fontSize:32,color:A.cyan+'55'}}>›</div>
              </button>
            ):(
              <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:18,padding:'18px 20px',display:'flex',alignItems:'center',gap:14,opacity:0.4}}>
                <span style={{fontSize:32}}>🌐</span><div style={{fontFamily:BARLOW,fontSize:14,color:A.muted}}>Web del viaje — próximamente</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    const STABS=[{id:'vuelos',emoji:'✈️',label:'Vuelos'},{id:'docs',emoji:'📋',label:'Documentos'},{id:'pagos',emoji:'💳',label:'Pagos'},{id:'info',emoji:'ℹ️',label:'Información'},{id:'grupo',emoji:'👥',label:'Mi Grupo'}];
    const curTab=STABS.find(t=>t.id===section);
    return(
      <div style={{background:A.bg,minHeight:'100vh',maxWidth:480,margin:'0 auto',paddingBottom:100,fontFamily:BARLOW,color:A.text}}>
        <Header mini/>
        <div style={{background:A.card,borderBottom:`1px solid ${A.border}`,padding:'16px 24px',display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:28}}>{curTab?.emoji}</span>
          <div style={{fontFamily:ANTON,fontSize:24,color:'#fff',letterSpacing:2,textTransform:'uppercase'}}>{curTab?.label}</div>
        </div>
        <div style={{padding:'24px 24px'}}>
          {section==='vuelos'&&(allVuelos.length===0?<CEmpty text="Tu agencia subirá aquí tus billetes próximamente."/>:allVuelos.map((f,i)=><CFileCard key={i} emoji="✈️" nombre={f.nombre} archivo={f.archivo}/>))}
          {section==='docs'  &&(allDocs.length  ===0?<CEmpty text="Tu agencia añadirá aquí los documentos del viaje."/>:allDocs.map((f,i)=><CFileCard key={i} emoji="📋" nombre={f.nombre} archivo={f.archivo}/>))}
          {section==='pagos' &&<PagosContent/>}
          {section==='info'  &&((trip.info||[]).length===0?<CEmpty text="Tu agencia añadirá aquí los consejos del viaje."/>:(trip.info||[]).map((it,i)=>(
            <div key={i} style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:18,padding:'20px 22px',marginBottom:14,display:'flex',gap:16,alignItems:'flex-start'}}>
              <div style={{width:56,height:56,borderRadius:14,background:A.cyan+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{it.icono}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:ANTON,fontSize:20,color:'#fff',marginBottom:6,letterSpacing:1,textTransform:'uppercase'}}>{it.titulo}</div>
                <div style={{fontFamily:BARLOW,fontSize:16,color:A.muted,lineHeight:1.65,marginBottom:it.url?10:0}}>{it.texto}</div>
                {it.url&&<button onClick={()=>window.open(it.url,'_blank')} style={{display:'inline-flex',alignItems:'center',gap:6,background:A.cyan+'15',border:`1px solid ${A.cyan}44`,borderRadius:10,padding:'7px 14px',color:A.cyan,fontFamily:BARLOW,fontSize:13,fontWeight:700,cursor:'pointer'}}>🔗 Ver enlace →</button>}
              </div>
            </div>
          )))}
          {section==='grupo'&&<GrupoSection/>}
        </div>
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',width:'calc(100% - 40px)',maxWidth:440}}>
          <button onClick={()=>setSection(null)}
                  style={{width:'100%',padding:'18px',border:`2px solid ${A.border}`,borderRadius:16,fontFamily:ANTON,fontSize:16,letterSpacing:4,cursor:'pointer',background:A.card,color:'#fff',textTransform:'uppercase',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
            <span style={{fontSize:20}}>←</span> VOLVER AL MENÚ
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */

  /* ── NotificacionesTab ──────────────────────────────────── */
  function NotificacionesTab({trips,clients}){
    const [sub,setSub]=useState('manual');
    const [form,setForm]=useState({title:'',body:'',tripId:'all',scheduleDate:'',scheduleTime:''});
    const [status,setStatus]=useState(null); // null | 'sending' | 'ok' | 'error'
    const [errMsg,setErrMsg]=useState('');

    const upTrips=trips.filter(t=>!isPast(t.date));

    const handleSend=async()=>{
      if(!form.title.trim()||!form.body.trim()){setStatus('error');setErrMsg('Escribe título y mensaje.');return;}
      setStatus('sending');
      let schedISO=null;
      if(form.scheduleDate){
        const dt=new Date(form.scheduleDate+(form.scheduleTime?'T'+form.scheduleTime:' T12:00'));
        schedISO=dt.toISOString();
      }
      const r=await osSend({
        title:form.title.trim(),
        body:form.body.trim(),
        tripId:form.tripId==='all'?null:form.tripId,
        scheduleISO:schedISO,
      });
      if(r.errors&&r.errors.length>0){setStatus('error');setErrMsg(r.errors[0]);}
      else{setStatus('ok');setForm({title:'',body:'',tripId:'all',scheduleDate:'',scheduleTime:''});}
    };

    const TEMPLATES=[
      {emoji:'💳',label:'Recordatorio de pago',
       title:'💳 Recordatorio de pago',body:'Tienes un pago pendiente en tu reserva. Revisa las fechas en la app.'},
      {emoji:'✈️',label:'Vuelos disponibles',
       title:'✈️ ¡Tus vuelos ya están disponibles!',body:'Ya puedes consultar tus billetes en la app de Travelike.'},
      {emoji:'📋',label:'Documentación lista',
       title:'📋 Documentación lista',body:'Hemos subido los documentos de tu viaje. Consúltalos en la app.'},
      {emoji:'🆕',label:'Nuevo viaje disponible',
       title:'🆕 ¡Nuevo viaje disponible!',body:'Tenemos un nuevo viaje que te puede interesar. ¡Entra a ver los detalles!'},
      {emoji:'💰',label:'Precio especial',
       title:'💰 Precio especial disponible',body:'Hemos lanzado un precio especial en uno de nuestros viajes. ¡Date prisa!'},
      {emoji:'🛂',label:'Revisa tu pasaporte',
       title:'🛂 Revisa la caducidad de tu pasaporte',body:'Comprueba que tu pasaporte está vigente para la fecha del viaje. Renuévalo con al menos 6 meses de antelación.'},
    ];

    return(
      <div style={{padding:'16px',fontFamily:BARLOW}}>
        {/* Sub tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[{k:'manual',l:'✏️ Manual'},{k:'plantillas',l:'⚡ Plantillas'}].map(({k,l})=>(
            <button key={k} onClick={()=>setSub(k)}
                    style={{flex:1,padding:'10px',borderRadius:10,border:`1.5px solid ${sub===k?A.cyan:A.border}`,
                            background:sub===k?A.cyan+'18':A.card2,color:sub===k?A.cyan:A.muted,
                            fontFamily:BARLOW,fontSize:12,fontWeight:700,cursor:'pointer'}}>{l}</button>
          ))}
        </div>

        {sub==='manual'&&(
          <div>
            <div style={{fontSize:10,color:A.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Destinatarios</div>
            <select value={form.tripId} onChange={e=>setForm({...form,tripId:e.target.value})} style={{...ais,marginBottom:12}}>
              <option value="all">📢 Todos los viajeros</option>
              {upTrips.map(t=>(
                <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
              ))}
            </select>

            <div style={{fontSize:10,color:A.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Título</div>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                   placeholder="Ej: ✈️ ¡Tus vuelos están disponibles!" style={{...ais,marginBottom:12}}/>

            <div style={{fontSize:10,color:A.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Mensaje</div>
            <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})}
                      placeholder="Escribe el mensaje que recibirán los viajeros…"
                      style={{...ais,minHeight:100,resize:'vertical',lineHeight:1.6,marginBottom:12}}/>

            <div style={{fontSize:10,color:A.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Programar envío (opcional)</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              <input type="date" value={form.scheduleDate} onChange={e=>setForm({...form,scheduleDate:e.target.value})} style={ais}/>
              <input type="time" value={form.scheduleTime} onChange={e=>setForm({...form,scheduleTime:e.target.value})} style={ais}/>
            </div>

            {status==='error'&&(
              <div style={{background:A.red+'22',border:`1px solid ${A.red}44`,borderRadius:10,padding:'10px 14px',
                           marginBottom:12,fontSize:13,color:A.red,fontFamily:BARLOW}}>❌ {errMsg}</div>
            )}
            {status==='ok'&&(
              <div style={{background:A.green+'22',border:`1px solid ${A.green}44`,borderRadius:10,padding:'10px 14px',
                           marginBottom:12,fontSize:13,color:A.green,fontFamily:BARLOW}}>
                ✅ {form.scheduleDate?'Notificación programada correctamente':'Notificación enviada correctamente'}
              </div>
            )}

            <button onClick={handleSend} disabled={status==='sending'}
                    style={{...ab(status==='sending'?A.card2:A.cyan,status==='sending'?A.muted:'#07070f'),
                            width:'100%',fontSize:15,letterSpacing:1,fontWeight:800,
                            opacity:status==='sending'?0.6:1}}>
              {status==='sending'?'Enviando…':form.scheduleDate?'📅 Programar envío':'🔔 Enviar ahora'}
            </button>

            <div style={{fontSize:10,color:A.muted,marginTop:10,textAlign:'center',fontFamily:BARLOW,lineHeight:1.6}}>
              Solo recibirán la notificación los viajeros que hayan aceptado los permisos en su móvil.
            </div>
          </div>
        )}

        {sub==='plantillas'&&(
          <div>
            <div style={{fontSize:10,color:A.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Destinatarios</div>
            <select value={form.tripId} onChange={e=>setForm({...form,tripId:e.target.value})} style={{...ais,marginBottom:14}}>
              <option value="all">📢 Todos los viajeros</option>
              {upTrips.map(t=>(<option key={t.id} value={t.id}>{t.flag} {t.name}</option>))}
            </select>

            {TEMPLATES.map((tpl,i)=>(
              <div key={i} style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:14,
                                   padding:'14px 16px',marginBottom:10,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:28,flexShrink:0}}>{tpl.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:BARLOW,fontSize:14,color:A.text,fontWeight:700,marginBottom:2}}>{tpl.label}</div>
                  <div style={{fontSize:11,color:A.muted,fontFamily:BARLOW,lineHeight:1.4,overflow:'hidden',
                               display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{tpl.body}</div>
                </div>
                <button onClick={async()=>{
                  setStatus('sending');
                  const r=await osSend({title:tpl.title,body:tpl.body,tripId:form.tripId==='all'?null:form.tripId});
                  setStatus(r.errors&&r.errors.length>0?'error':'ok');
                  if(r.errors&&r.errors.length>0)setErrMsg(r.errors[0]);
                }}
                        style={{...ab(A.cyan+'22',A.cyan),flexShrink:0,fontSize:11,padding:'8px 12px',
                                border:`1px solid ${A.cyan}44`,borderRadius:8,fontFamily:BARLOW}}>
                  Enviar
                </button>
              </div>
            ))}

            {status==='error'&&<div style={{background:A.red+'22',border:`1px solid ${A.red}44`,borderRadius:10,padding:'10px 14px',marginTop:8,fontSize:13,color:A.red,fontFamily:BARLOW}}>❌ {errMsg}</div>}
            {status==='ok'&&<div style={{background:A.green+'22',border:`1px solid ${A.green}44`,borderRadius:10,padding:'10px 14px',marginTop:8,fontSize:13,color:A.green,fontFamily:BARLOW}}>✅ Notificación enviada correctamente</div>}
          </div>
        )}
      </div>
    );
  }

  /* ── NotifPrompt — pide permiso al viajero ──────────────── */
  function NotifPrompt({onDone,cl}){
    const ask=()=>{osAsk();localStorage.setItem('tv7-notif-asked','1');onDone();};
    const skip=()=>{localStorage.setItem('tv7-notif-asked','1');onDone();};
    return(
      <div style={{position:'fixed',inset:0,background:'#000000CC',display:'flex',alignItems:'flex-end',
                   justifyContent:'center',zIndex:999}}>
        <div style={{background:A.card2,borderRadius:'20px 20px 0 0',padding:'28px 20px 44px',
                     width:'100%',maxWidth:480,boxSizing:'border-box',fontFamily:BARLOW}}>
          <div style={{width:40,height:4,background:A.border,borderRadius:2,margin:'0 auto 20px'}}/>
          <div style={{fontSize:48,textAlign:'center',marginBottom:12}}>🔔</div>
          <div style={{fontFamily:ANTON,fontSize:24,color:'#fff',letterSpacing:1,textAlign:'center',
                       marginBottom:8,textTransform:'uppercase'}}>Activa las notificaciones</div>
          <div style={{fontSize:15,color:A.muted,lineHeight:1.65,textAlign:'center',marginBottom:24}}>
            Recibe avisos cuando haya novedades en tu viaje: fechas de pago, vuelos disponibles, recordatorios importantes…
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <button onClick={ask}
                    style={{width:'100%',padding:'16px',background:A.cyan,border:'none',borderRadius:14,
                            fontFamily:ANTON,fontSize:17,letterSpacing:2,color:'#07070f',cursor:'pointer',
                            textTransform:'uppercase'}}>
              ✅ Activar notificaciones
            </button>
            <button onClick={skip}
                    style={{width:'100%',padding:'14px',background:'transparent',border:`1px solid ${A.border}`,
                            borderRadius:14,fontFamily:BARLOW,fontSize:14,color:A.muted,cursor:'pointer'}}>
              Ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

export default App;
