(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'book',safe=n=>n.replace(/[^\w.\-]+/g,'_');
const b64=s=>btoa(unescape(encodeURIComponent(s))),b64buf=b=>{let s='';const u=new Uint8Array(b);for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),r2=v=>Math.round(v*100)/100,isAbs=u=>/^https?:/.test(u||'');
const C=window.CFG||{},G={o:C.owner||location.hostname.split('.')[0],r:C.repo||location.pathname.split('/')[1]||'',b:C.branch||'main',t:'',m:''};
const KINDS={circle:{n:'Hotspot',i:'◯',box:1,col:'#e5173f',h:'Drag a shape around the correct option (or just click to place one).'},blank:{n:'Blank',i:'👁',col:'#0a7a2f',h:'Click on the blank where the answer word should appear.'},note:{n:'Answer',i:'💬',col:'#ffb400',h:'Click just after the question. The full answer shows in a small bubble.'},audio:{n:'Audio',i:'🎧',col:'#e8c46a',h:'Click on the headphone icon in the book.'},video:{n:'Video',i:'▶',box:1,col:'#e8c46a',h:'Drag a rectangle over “Watch this!”.'},
 question:{n:'Question',i:'❓',col:'#e8710a',h:'Click where the question button should appear, then write the question on the right.'},
 popup:{n:'Image popup',i:'🖼',col:'#17a05a',h:'Click where the picture button should appear, then upload the image on the right.'},
 flash:{n:'Flashcards',i:'🗂',col:'#7a4cd8',h:'Click where the flashcards button should appear, then type the cards on the right.'},
 shape:{n:'Shape',i:'⬜',box:1,col:'#e5173f',h:'Drag to draw a rectangle, ellipse or arrow on the page.'},
 text:{n:'Text',i:'🅣',box:1,col:'#12263a',h:'Drag a box, then type the text on the right.'},
 link:{n:'Match line',i:'🔗',col:'#17a05a',h:'Drag a line from one item to the item it matches. Students will connect the same two dots.'},
 target:{n:'Tap target',i:'🎯',box:1,col:'#17a05a',h:'Drag a box around a correct item that students should find and tap.'}};
const GL={target:'🎯',note:'💬',audio:'🎧',video:'▶',question:'❓',popup:'🖼',flash:'🗂'},DEFBOX={circle:[16,4],video:[16,4],shape:[16,8],text:[26,6]};
function initKind(h){const k=h.k;if(k=='question'&&!h.q)h.q={type:'mcq',t:'',opts:['','','',''],ok:0,ex:''};if(k=='flash'&&!h.cards)h.cards=[];if(k=='shape'&&!h.sh)h.sh='rect';if(k=='text'&&h.a==null)h.a='Your text'}
let sb,L,onClose,root,dirty=false,saving=false,tm,hist=[],redoS=[],clip=null;
const S={b:0,u:0,p:0,set:new Set(),tool:'select',zoom:1,prev:false,tab:'gen',dev:'desk'};Object.defineProperty(S,'sel',{get(){return this.set.size==1?[...this.set][0]:-1},set(v){this.set=v<0?new Set():new Set([v])}});
const BK=()=>L.books[S.b],UN=()=>BK()&&BK().units[S.u],PG=()=>UN()&&UN().pages[S.p],HS=()=>PG()?PG().hs:[];

const CSS=`
#mg{position:fixed;inset:0;z-index:50;background:#eef3f8;color:#12263a;font:14px/1.4 system-ui,Segoe UI,Tahoma,sans-serif;display:flex;flex-direction:column}
#mg *{box-sizing:border-box}#mg button:not(.h){font:inherit;cursor:pointer}#lay{touch-action:none}
#mg header{height:60px;background:#fff;border-bottom:1px solid #dfe7ee;display:flex;align-items:center;gap:10px;padding:0 14px;flex:none}
.brand{display:flex;align-items:center;gap:10px}.brand .lg2{width:40px;height:40px;border-radius:50%;background:#6d3fd1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:19px}.brand b{display:block;font-size:17px;color:#14284d}.brand small{color:#6b7f8f;font-size:12px}
#mg .sp{flex:1}#mg header select{width:210px;padding:7px 10px;border:1px solid #cfdae4;border-radius:10px;font-weight:600}
.pill{padding:5px 12px;border-radius:99px;font-size:12.5px;background:#e8eef3;color:#4b6073;white-space:nowrap}.pill.saved{background:#dff5e6;color:#17803d}.pill.saving,.pill.dirty{background:#fff2cf;color:#9a6a00}.pill.error{background:#fde2e2;color:#b42323}
.gh{background:#fff;border:1px solid #cfdae4;color:#12263a;border-radius:10px;padding:7px 12px}.gh:hover{background:#eef4f8}.gh.dg,.pr.dg{color:#c63b3b}.gh.wide{width:100%;margin-top:6px}
.pr{background:#1565e8;border:0;color:#fff;border-radius:10px;padding:9px 16px;font-weight:700}.pr.dg{background:#d64545;color:#fff}
.body{flex:1;min-height:0;display:grid;grid-template-columns:292px 1fr 330px}
aside{background:#fff;overflow:auto;padding:12px}#mL{border-right:1px solid #dfe7ee}#mR{border-left:1px solid #dfe7ee;padding:0}
.sec{margin-bottom:16px}.sh{font-weight:700;color:#14284d;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
.sh button,.lk{background:#e8f0fe;border:0;color:#1565e8;border-radius:8px;padding:4px 10px;font-weight:600}.lk{width:100%;margin:4px 0;text-align:left}
.bcard{display:flex;gap:10px;background:#f4f8fc;border-radius:12px;padding:10px}.bcard .cov{width:72px;height:92px;border-radius:8px;background:#dbe7f3;display:flex;align-items:center;justify-content:center;font-size:30px;overflow:hidden;flex:none}.bcard img{width:100%;height:100%;object-fit:cover}.bcard b{display:block;color:#14284d}.bcard small{display:block;color:#6b7f8f}
.ut{display:flex;align-items:center;gap:6px;padding:8px;border-radius:10px;cursor:pointer;border:1px solid transparent}.ut:hover{background:#f1f6f9}.ut.on{background:#e6efff;border-color:#b9d0fb}.ut span{flex:1;min-width:0}.ut small{display:block;color:#7a8d9c}.ut.hid{opacity:.55}
.ic2{font-style:normal;opacity:.55;padding:0 3px;cursor:pointer}.ic2:hover{opacity:1}
.drop{display:block;border:2px dashed #b9cad8;border-radius:12px;text-align:center;padding:12px 8px;color:#4b6073;cursor:pointer;margin-bottom:10px}.drop small{display:block;color:#8a9bab}.drop.over{background:#e8f4f8;border-color:#1565e8}
.th{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.t{position:relative;border:2px solid transparent;border-radius:8px;overflow:hidden;cursor:pointer;background:#e9eff4}.t img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block}.t.on{border-color:#1565e8}
.t span{position:absolute;left:3px;bottom:3px;background:#000b;color:#fff;font-size:11px;padding:0 5px;border-radius:5px}.t b{position:absolute;right:3px;top:3px;background:#1565e8;color:#fff;font-size:10px;padding:0 5px;border-radius:99px}
#mC{display:flex;flex-direction:column;min-width:0}
#mT{background:#fff;border-bottom:1px solid #dfe7ee;padding:8px 12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.tool{display:flex;align-items:center;gap:6px;padding:8px 12px;border:0;color:#fff;border-radius:9px;font-weight:700}.tool i{font-style:normal}.tool.t-select{background:#1565e8}.tool.t-circle{background:#0b9dc0}.tool.t-blank{background:#ee8a00}.tool.t-note{background:#7a4cd8}.tool.t-audio{background:#17a05a}.tool.t-video{background:#d6336c}.tool.t-question{background:#e8710a}.tool.t-popup{background:#17a05a}.tool.t-flash{background:#7a4cd8}.tool.t-shape{background:#546e7a}.tool.t-text{background:#455a64}.tool.t-link{background:#00897b}.tool.t-target{background:#2e7d32}
.tool{opacity:.72}.tool.on{opacity:1;box-shadow:0 0 0 3px #1565e855}
#hint{padding:6px 14px;background:#fff8e1;border-bottom:1px solid #f0e2b0;color:#7a5b00;font-size:13px}
#cvw{flex:1;min-height:0;overflow:auto;display:flex;padding:12px}#stg{position:relative;margin:auto;flex:none;background:#fff;box-shadow:0 6px 28px #0003}
#stg>img{width:100%;height:100%;display:block;user-select:none;-webkit-user-drag:none;pointer-events:none}#lay{position:absolute;inset:0}#lay:not(.prev):not(.t-select){cursor:crosshair}
.e{position:absolute;border-radius:50%}.e .n{position:absolute;left:-2px;top:-2px;transform:translate(-30%,-65%);background:#1565e8;color:#fff;font-size:11px;font-weight:700;min-width:18px;text-align:center;border-radius:99px;padding:0 4px;pointer-events:none;z-index:3}
.ed-circle,.ed-video{border:3px dashed var(--c,#e5173f);background:#e5173f14;cursor:move}.ed-video{background:#e8a20022;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#b57b00}
.ed-blank,.ed-note,.ed-audio{transform:translate(-50%,-50%);cursor:move;background:#ffb400;box-shadow:0 1px 5px #0006;display:flex;align-items:center;justify-content:center;white-space:nowrap}
.ed-blank{border-radius:99px;padding:1px 9px;min-height:calc(var(--u)*2.4);font:700 calc(var(--u)*1.8)/1.2 system-ui;color:#5a3a00}.ed-blank em{font-style:normal}
.ed-note{width:calc(var(--u)*3.2);height:calc(var(--u)*3.2);font-size:calc(var(--u)*1.8)}.ed-audio{width:5.5%;aspect-ratio:1;background:#e8c46acc;border:3px solid var(--c,#c99a22);font-size:calc(var(--u)*2.4)}
.e.sel{outline:3px solid #1565e8;outline-offset:2px;z-index:4}.e.lk{cursor:pointer}
.lkb{position:absolute;right:-8px;top:-12px;font-size:11px;pointer-events:none;z-index:3}
.hd{position:absolute;width:12px;height:12px;background:#fff;border:2px solid #1565e8;border-radius:3px}.hd.nw{left:-8px;top:-8px;cursor:nwse-resize}.hd.ne{right:-8px;top:-8px;cursor:nesw-resize}.hd.sw{left:-8px;bottom:-8px;cursor:nesw-resize}.hd.se{right:-8px;bottom:-8px;cursor:nwse-resize}
.dr{position:absolute;border:2px dashed #1565e8;background:#1565e822;pointer-events:none}
.rh{background:#1f3a8a;color:#fff;padding:12px 14px;font-weight:700;font-size:16px}
.tabs{display:flex;border-bottom:1px solid #dfe7ee}.tabs button{flex:1;border:0;background:#fff;padding:10px 4px;color:#5b7083;font-weight:600;border-bottom:3px solid transparent}.tabs button.on{color:#1565e8;border-color:#1565e8}
.pbody{padding:12px}
.f{display:block;margin:8px 0;font-weight:600;color:#35506a}.f input,.f textarea,.f select,#mg select{display:block;width:100%;margin-top:4px;padding:8px 10px;border:1px solid #c5d3df;border-radius:9px;font:inherit;font-weight:400;color:#12263a;background:#fff}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.f input[type=color]{padding:2px;height:38px}.f input[type=range]{padding:0}
.row{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.mu{color:#6b7f8f;margin:6px 0}.tip{background:#eef4ff;border-radius:10px;padding:9px 11px;color:#35506a;font-size:12.5px;margin-top:12px}
.chk{display:flex;gap:8px;align-items:center;margin:8px 0;font-weight:600;color:#35506a}.chk input{width:auto;margin:0}.pad{display:flex;gap:6px;margin-top:6px}.pad button{flex:1}.pad button[disabled]{opacity:.4;cursor:not-allowed}
.li{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;cursor:pointer}.li:hover{background:#f1f6f9}.li b{background:#1565e8;color:#fff;border-radius:99px;min-width:20px;text-align:center;font-size:12px}.li small{color:#7a8d9c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:right}
.file{padding:8px 10px;background:#eef4f8;border-radius:9px;word-break:break-all}.file.none{color:#a05a00;background:#fff4de}.up{display:block;text-align:center;margin-top:8px;padding:9px;border:1.5px dashed #1565e8;color:#1565e8;border-radius:9px;cursor:pointer;font-weight:600}
.empty{margin:auto;color:#6b7f8f;text-align:center}.mcard{margin:auto;background:#fff;border-radius:16px;padding:28px;width:min(440px,92vw);box-shadow:0 10px 40px #0002;text-align:center}.mcard input{display:block;width:100%;margin:8px 0;padding:11px;border:1px solid #c5d3df;border-radius:10px;font:inherit}.mcard .logo{font-size:40px}.er{color:#c63b3b;min-height:20px}
h2{margin:6px 0 8px;font:700 21px system-ui;color:#12263a}pre{text-align:left;background:#0b3a5c;color:#e8f4f8;padding:10px;border-radius:8px;font-size:12px;white-space:pre-wrap;user-select:all;margin:8px 0}
.mdl{position:fixed;inset:0;background:#0008;z-index:60;display:flex;align-items:center;justify-content:center}.mbox{background:#fff;border-radius:14px;padding:20px;width:min(420px,92vw);max-height:88vh;overflow:auto}.mbox h3{margin:0 0 8px;color:#14284d}.mbox .row{justify-content:flex-end}
.hv{display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #e3eaf0}.hv span{flex:1;font-size:13px}.hv small{display:block;color:#7a8d9c}
.t .lt{position:absolute;left:3px;top:3px;background:#0b3a5ccc;color:#fff;font-size:10px;padding:0 5px;border-radius:5px;font-style:normal}.t.wb{border-color:#ee8a0066}.t.wb.on{border-color:#ee8a00}
.gh.on{background:#e6efff;border-color:#1565e8;color:#1565e8}.devf{margin:auto;flex:none;padding:16px 10px;background:#15202b;border-radius:34px;box-shadow:0 8px 30px #0006}.devf #stg{margin:0;box-shadow:none}
.mbox.wide{width:min(920px,96vw)}.rt{border-collapse:collapse;width:100%}.rt th,.rt td{border-bottom:1px solid #e3eaf0;padding:6px 8px;text-align:left}.rt th{color:#5b7083;font-size:12.5px}
.ed-question,.ed-popup,.ed-flash{transform:translate(-50%,-50%);width:calc(var(--u)*4.2);height:calc(var(--u)*4.2);cursor:move;color:#fff;display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*2.4);box-shadow:0 1px 5px #0006;background:var(--c,#e8710a)}.ed-popup{background:var(--c,#17a05a)}.ed-flash{background:var(--c,#7a4cd8)}
.ed-shape,.ed-text{border:1px dashed #1565e899;border-radius:0;cursor:move}
.ed-link{width:calc(var(--u)*3);height:calc(var(--u)*3);transform:translate(-50%,-50%);background:var(--c,#17a05a);border:3px solid #fff;box-shadow:0 1px 5px #0008;cursor:move;color:#fff;font:700 calc(var(--u)*1.4) system-ui;display:flex;align-items:center;justify-content:center}.ed-link.b{background:#0b9dc0}
.ed-target{border:3px dashed var(--c,#17a05a);background:#17a05a22;border-radius:8px;cursor:move;font-size:calc(var(--u)*2.4);display:flex;align-items:center;justify-content:center}
`;
const SC=CSS.replace(/(^|\})\s*([^{}]+)\{/g,(m,a,sel)=>a+sel.split(',').map(x=>{x=x.trim();return x.startsWith('#mg')?x:'#mg '+x}).join(',')+'{');
const style=document.createElement('style');style.textContent=SC;document.head.appendChild(style);

/* ---------- GitHub (structure + answers) ---------- */
const GH=()=>({Authorization:'Bearer '+G.t,Accept:'application/vnd.github+json'});
const GU=p=>`https://api.github.com/repos/${G.o}/${G.r}/contents/${p.split('/').map(encodeURIComponent).join('/')}`;
const errMsg=s=>s==401?'GitHub token is wrong or expired':s==403?'Token has no permission (needs Contents: Read and write)':s==404?'Repository not found (check owner / repo name / token access)':'GitHub error '+s;
async function ghMeta(p){const r=await fetch(GU(p)+'?ref='+G.b+'&t='+Date.now(),{headers:GH()});if(r.status==404)return null;if(!r.ok)throw new Error(errMsg(r.status));return r.json()}
async function ghPut(p,content,msg){const cur=await ghMeta(p);const r=await fetch(GU(p),{method:'PUT',headers:GH(),body:JSON.stringify({message:msg,content,branch:G.b,sha:cur&&cur.sha})});if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||errMsg(r.status))}}
async function ghRead(p,ref){const r=await fetch(GU(p)+'?ref='+(ref||G.b)+'&t='+Date.now(),{headers:{...GH(),Accept:'application/vnd.github.raw'}});if(!r.ok)throw new Error(errMsg(r.status));return r.text()}
function setSt(s,m){const e=$('#mst');if(!e)return;e.className='pill '+s;e.textContent=m||({saved:'✓ Saved',saving:'Saving…',dirty:'Unsaved changes…',error:'Error'})[s]}
const mark=()=>{dirty=true;setSt('dirty');clearTimeout(tm);tm=setTimeout(flush,1000)};
async function flush(){if(saving)return;saving=true;try{while(dirty){dirty=false;setSt('saving');await ghPut('data/library.json',b64(JSON.stringify(L,null,1)),'Update library')}setSt('saved','✓ Saved · live in ~1 min')}catch(e){dirty=true;setSt('error','⚠ '+e.message)}saving=false}
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

/* ---------- media storage: Backblaze B2 via Supabase Edge Function (or GitHub fallback) + WebP ---------- */
async function toWebp(f){if(!/^image\//.test(f.type)||f.type=='image/webp')return f;try{const bm=await createImageBitmap(f),sc=Math.min(1,1800/bm.width),c=document.createElement('canvas');c.width=Math.round(bm.width*sc);c.height=Math.round(bm.height*sc);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);const b=await new Promise(r=>c.toBlob(r,'image/webp',.86));return b&&b.type=='image/webp'?new File([b],f.name.replace(/\.\w+$/,'')+'.webp',{type:'image/webp'}):f}catch(e){return f}}
async function store(f,kind){const buf=await f.arrayBuffer(),h=[...new Uint8Array(await crypto.subtle.digest('SHA-1',buf))].slice(0,5).map(x=>x.toString(16).padStart(2,'0')).join(''),key=`${kind}/${h}-${safe(f.name)}`,pv=URL.createObjectURL(f);
 if(G.m=='b2'){if(f.size>60*1024*1024)throw new Error('This file is larger than 60 MB. Compress it, or use a YouTube link for videos.');
  const{data:{session}}=await sb.auth.getSession();const r=await fetch(`${C.supabaseUrl}/functions/v1/media/upload?key=${encodeURIComponent(key)}`,{method:'POST',headers:{Authorization:'Bearer '+session.access_token,apikey:C.supabaseKey,'Content-Type':f.type||'application/octet-stream'},body:f});
  if(!r.ok){let m='';try{m=(await r.json()).error||''}catch(e){}throw new Error('Media upload failed ('+r.status+'): '+m)}const j=await r.json();PREV[j.url]=pv;return j.url}
 const path='media/'+key;await ghPut(path,b64buf(buf),'Add '+key);PREV[path]=pv;return path}

/* ---------- dialogs ---------- */
function dlg(title,fields,ok,danger){return new Promise(res=>{const d=document.createElement('div');d.className='mdl';
 d.innerHTML=`<form class="mbox"><h3>${title}</h3>${fields.map(f=>f.ta?`<label class="f">${f.label}<textarea name="${f.name}" rows="9" placeholder="Intro: 93&#10;6.1: 94-95&#10;6.2: 96-97">${esc(f.value)}</textarea></label>`:f.sel?`<label class="f">${f.label}<select name="${f.name}">${f.sel.map(([v,t])=>`<option value="${v}" ${v==f.value?'selected':''}>${t}</option>`).join('')}</select></label>`:f.html?`<p class="mu">${f.html}</p>`:`<label class="f">${f.label}<input name="${f.name}" ${f.file?'type="file" accept="image/*"':`value="${esc(f.value)}" ${f.num?'type="number"':''}`} autocomplete="off"></label>`).join('')}<div class="row"><button type="button" class="gh" id="dx">Cancel</button><button class="pr ${danger?'dg':''}">${ok||'OK'}</button></div></form>`;
 (root||document.body).appendChild(d);const f=$('form',d),i=$('input:not([type=file])',d);i&&i.focus();const end=v=>{d.remove();res(v)};
 $('#dx',d).onclick=()=>end(null);f.onsubmit=e=>{e.preventDefault();const o={};new FormData(f).forEach((v,k)=>o[k]=v);end(o)}})}

/* ---------- boot / login ---------- */
const loadSB=()=>window.supabase?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='lib/supabase.js?v=3';s.onload=ok;s.onerror=()=>no(new Error('Could not load the login library (check internet)'));document.head.appendChild(s)});
const view=h=>{root.innerHTML=`<header><div class="brand"><span class="lg2">✏️</span><div><b>Interactive Book Editor</b></div></div><span class="sp"></span><button class="gh" id="cl0">✕ Close</button></header><div style="flex:1;display:flex;overflow:auto;padding:16px">${h}</div>`;$('#cl0').onclick=close};
const withT=(p,ms,label)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('No answer while '+label+' (waited '+ms/1000+'s). Check the Supabase URL/key in config.js and your internet.')),ms))]);
const step=m=>view(`<div class="empty"><div style="font-size:34px">⏳</div>${m}</div>`);
function fail(e){const m=(e&&e.message)||String(e);view(`<div class="mcard"><div class="logo">⚠️</div><h2>Couldn't connect</h2><p class="er">${esc(m)}</p><div class="row" style="justify-content:center"><button class="pr" id="rt">Try again</button><button class="gh" id="so">Sign out and retry</button></div></div>`);
 $('#rt').onclick=()=>start();$('#so').onclick=async()=>{try{await sb.auth.signOut()}catch(x){}Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k));start()}}
addEventListener('unhandledrejection',ev=>{if(root&&root.isConnected&&!$('#cvw')&&$('.empty'))fail(ev.reason)});
async function open(lib,cb){L=lib;onClose=cb;if(root&&root.isConnected)root.remove();root=document.createElement('div');root.id='mg';document.body.appendChild(root);start()}
async function start(){try{
  if(!C.supabaseUrl||!C.supabaseKey)return view(`<div class="mcard"><div class="logo">⚙️</div><h2>One-time setup needed</h2><p class="mu">Open <b>config.js</b> in your GitHub repository and paste your Supabase URL and key, then reload this page.</p></div>`);
  step('Loading login library…');await loadSB();
  if(!sb)sb=supabase.createClient(C.supabaseUrl,C.supabaseKey);
  step('Checking your login…');const{data:{session}}=await withT(sb.auth.getSession(),12000,'checking your login');
  session?await after():login()}catch(e){fail(e)}}
function login(msg=''){view(`<div class="mcard"><div class="logo">📚</div><h2>Teacher login</h2><p class="mu">Same email and password on any device.</p><form id="lf"><input name="e" type="email" placeholder="Email" required autocomplete="username"><input name="p" type="password" placeholder="Password" required autocomplete="current-password"><div class="er">${msg}</div><button class="pr" style="width:100%">Log in</button></form></div>`);
 $('#lf').onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target);let r;try{r=await withT(sb.auth.signInWithPassword({email:f.get('e'),password:f.get('p')}),15000,'logging in')}catch(er){return login(esc(er.message))}r.error?login(esc(r.error.message)):after()}}
const SQLFIX="grant usage on schema public to authenticated;\ngrant select, insert, update, delete on table public.settings to authenticated;";
async function after(){try{step('Reading your settings…');const r=await withT(sb.from('settings').select('key,value'),15000,'reading your settings');
 if(r.error){const pd=/permission denied/i.test(r.error.message);view(`<div class="mcard"><div class="logo">🛠️</div><h2>One more setup step</h2><p class="er">${esc(r.error.message)}</p>${pd?`<p class="mu">Open Supabase → SQL Editor → New query, paste this, press Run, then press Try again:</p><pre>${esc(SQLFIX)}</pre>`:'<p class="mu">Run <b>supabase-setup.sql</b> in the Supabase SQL Editor (with your email inside it).</p>'}<div class="row" style="justify-content:center"><button class="pr" id="rt2">Try again</button><button class="gh" id="so2">Sign out</button></div></div>`);
  $('#rt2').onclick=()=>start();$('#so2').onclick=async()=>{await sb.auth.signOut();start()};return}
 const m={};(r.data||[]).forEach(x=>m[x.key]=x.value);G.m=m.media_mode||'';
 if(!m.gh_token)return tokenView();G.t=m.gh_token;await loadLib()}catch(e){fail(e)}}
function tokenView(msg=''){view(`<div class="mcard"><div class="logo">🔑</div><h2>Connect GitHub</h2><p class="mu">Paste your GitHub token once. It is stored in your private login, so it works on every device.</p><form id="tf"><input name="o" placeholder="GitHub username" value="${esc(G.o)}"><input name="r" placeholder="Repository name" value="${esc(G.r)}"><input name="t" type="password" placeholder="github_pat_…" required><div class="er">${msg}</div><button class="pr" style="width:100%">Connect</button></form></div>`);
 $('#tf').onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target);G.o=f.get('o').trim();G.r=f.get('r').trim();G.t=f.get('t').trim();
  const x=await fetch(`https://api.github.com/repos/${G.o}/${G.r}`,{headers:GH()});if(!x.ok)return tokenView(esc(errMsg(x.status)));
  const u=await sb.from('settings').upsert({key:'gh_token',value:G.t});if(u.error)return tokenView(esc(u.error.message));await loadLib()}}
async function loadLib(){try{const t=await ghRead('data/library.json');{const j=JSON.parse(t);L.books=j.books;L.templates=j.templates||[]}}catch(e){if(/token|permission/i.test(e.message))return tokenView(esc(e.message));return view(`<div class="mcard"><h2>Could not load the library</h2><p class="er">${esc(e.message)}</p></div>`)}
 L.books.forEach(b=>b.units=b.units||[]);await signLib();S.b=S.u=S.p=0;S.sel=-1;try{editor()}catch(e){fail(e)}}
async function signLib(){const urls=[];L.books.forEach(b=>{b.cover&&urls.push(b.cover);b.units.forEach(u=>urls.push(...unitUrls(u)))});const list=[...new Set(urls.filter(isB2))];if(!list.length)return;
 try{const{data:{session}}=await sb.auth.getSession();await signUrls(list,{jwt:session.access_token})}catch(e){console.warn('Could not sign media links:',e.message)}}
async function close(){if(dirty)await flush();stopAu&&stopAu();root.remove();onClose&&onClose()}

/* ---------- editor shell ---------- */
function editor(){root.innerHTML=`<header><div class="brand"><span class="lg2">✏️</span><div><b>Interactive Book Editor</b><small>Create amazing interactive books with ease</small></div></div><span class="sp"></span><select id="bsel"></select><button class="pr" id="prevb">▶ Preview</button><span id="mst" class="pill saved">✓ Saved</span><button class="gh" id="cls">👥 Classes</button><button class="gh" id="chk" title="System check">🩺 Check</button><button class="gh" id="rep">📊 Reports</button><button class="gh" id="hist">🕘 History</button><button class="gh" id="setb">⚙</button><button class="gh" id="lo">Log out</button><button class="gh" id="back">← Back to book</button></header>
 <div class="body"><aside id="mL"></aside><main id="mC"><div id="mT"></div><div id="hint"></div><div id="cvw"></div></main><aside id="mR"></aside></div>`;
 $('#back').onclick=close;$('#lo').onclick=async()=>{await sb.auth.signOut();close()};$('#hist').onclick=histDlg;$('#rep').onclick=reportsDlg;$('#chk').onclick=checkDlg;$('#cls').onclick=classesDlg;$('#setb').onclick=settingsDlg;
 $('#prevb').onclick=()=>{S.prev=!S.prev;if(!S.prev)stopAu();tbar();canvas()};
 $('#bsel').onchange=async e=>{if(e.target.value=='__new')return addBook();S.b=+e.target.value;S.u=S.p=0;S.sel=-1;full()};
 $('#mL').onclick=treeClick;$('#mL').onchange=e=>{if(e.target.id=='pf'){uploadPages(e.target.files);e.target.value=''}};
 const mL=$('#mL');mL.ondragover=e=>{e.preventDefault();const d=$('#drop');d&&d.classList.add('over')};mL.ondragleave=()=>{const d=$('#drop');d&&d.classList.remove('over')};mL.ondrop=e=>{e.preventDefault();uploadPages(e.dataTransfer.files)};
 $('#mR').onclick=e=>{const li=e.target.closest('[data-s]');if(li){S.sel=+li.dataset.s;canvas();panel()}};
 removeEventListener('keydown',keys);addEventListener('keydown',keys);removeEventListener('resize',rsz);addEventListener('resize',rsz);full()}
function rsz(){root&&root.isConnected&&$('#cvw')&&canvas()}
const full=()=>{hdr();tree();tbar();canvas();panel()};
function hdr(){const s=$('#bsel');if(s){s.innerHTML=L.books.map((b,i)=>`<option value="${i}">${esc(b.title)}</option>`).join('')+'<option value="__new">＋ New book…</option>';s.value=L.books.length?S.b:'__new'}}
const sumry=x=>/audio|video|popup/.test(x.k)?(x.m||'no file').split('/').pop():x.k=='question'?((x.q&&x.q.t)||'(no text yet)').slice(0,26):x.k=='flash'?(x.cards||[]).length+' cards':x.k=='shape'?(x.sh||'rect'):x.k=='link'?'match line':x.k=='target'?'tap target':(x.a||'').replace(/<[^>]+>/g,' ').slice(0,26);
const bookBox=(t)=>dlg(t,[{label:'Book title',name:'t',value:''},{label:'Level (e.g. Beginner)',name:'l',value:''},{label:'Language',name:'g',value:'English'}],'Create');
async function addBook(){const v=await bookBox('New book');hdr();if(v&&v.t.trim()){L.books.push({id:slug(v.t)+'-'+Date.now().toString(36),title:v.t.trim(),level:v.l.trim(),lang:v.g.trim(),cover:'',units:[]});S.b=L.books.length-1;S.u=S.p=0;S.sel=-1;full();mark()}}

function tree(){const b=BK(),u=UN();$('#mL').innerHTML=(b?`<div class="bcard"><div class="cov">${b.cover?`<img src="${esc(surl(b.cover))}" alt="">`:'📘'}</div><div><b>${esc(b.title)}</b><small>${esc(b.level||'')}${b.lang?' · '+esc(b.lang):''}</small><small>${b.units.length} units · ${b.units.reduce((a,x)=>a+x.pages.length,0)} pages</small></div></div><button class="gh wide" id="bset">⚙ Book settings</button>${G.m=='b2'?'<button class="gh wide" id="mig">☁ Move this book’s files to Backblaze</button>':''}`:'<p class="mu">No books yet. Add your first book.</p>')
 +`<button class="lk" id="addB" style="margin-top:8px">＋ New book</button>`
 +(b?`<div class="sec" style="margin-top:14px"><div class="sh">Units <button id="addU">＋ Add unit</button></div>${b.units.map((y,ui)=>`<div class="ut ${ui==S.u?'on':''}${y.hidden?' hid':''}" data-u="${ui}"><span><b>Unit ${y.num}:</b> ${esc(y.title)}<small>${y.pages.length} pages${y.hidden?' · hidden from students':''}</small></span><i class="ic2" data-eye="${ui}" title="Show / hide for students">${y.hidden?'🚫':'👁'}</i><i class="ic2" data-ren="${ui}" title="Edit">✎</i><i class="ic2" data-del="${ui}" title="Delete">🗑</i></div>`).join('')||'<p class="mu">No units yet.</p>'}</div>`:'')
 +(u?`<div class="sec"><div class="sh">Page thumbnails</div><label class="drop" id="drop"><input type="file" id="pf" multiple accept="image/*" hidden>⬆ Drop page images here<br>or click to choose<small>Name files like p94.jpg · auto-optimized to WebP</small></label><div class="th">${u.pages.map((p,i)=>`<div class="t ${i==S.p?'on':''}${p.part=='wb'?' wb':''}" data-p="${i}"><img loading="lazy" src="${esc(surl(p.url))}" alt="">${p.lesson?`<i class="lt">${esc(p.lesson)}</i>`:''}<span>${p.part=='wb'?'WB ':''}${esc(p.label)}</span>${p.hs.length?`<b>${p.hs.length}</b>`:''}</div>`).join('')}</div></div>`:'')}
async function treeClick(e){const t=e.target;
 if(t.closest('#addB'))return addBook();
 if(t.closest('#bset')){const b=BK(),v=await dlg('Book settings',[{label:'Title',name:'t',value:b.title},{label:'Level',name:'l',value:b.level||''},{label:'Language',name:'g',value:b.lang||''},{label:'Cover image (optional)',name:'c',file:1}],'Save');
  if(v){b.title=v.t.trim()||b.title;b.level=v.l.trim();b.lang=v.g.trim();if(v.c&&v.c.size){try{setSt('saving','Uploading cover…');b.cover=await store(await toWebp(v.c),'covers')}catch(er){return setSt('error','⚠ '+er.message)}}hdr();full();mark()}return}
 if(t.closest('#mig'))return migrate();
 if(t.closest('#addU')){const v=await dlg('New unit',[{label:'Unit number',name:'n',value:'',num:1},{label:'Unit title',name:'t',value:''}],'Add');if(v&&+v.n&&v.t.trim()){const b=BK();b.units.push({num:+v.n,title:v.t.trim(),pages:[]});b.units.sort((x,y)=>x.num-y.num);S.u=b.units.findIndex(x=>x.num==+v.n);S.p=0;S.sel=-1;full();mark()}return}
 const ey=t.closest('[data-eye]'),rn=t.closest('[data-ren]'),dl=t.closest('[data-del]');
 if(ey){const u=BK().units[+ey.dataset.eye];u.hidden=!u.hidden||undefined;if(!u.hidden)delete u.hidden;tree();mark();return}
 if(rn){S.u=+rn.dataset.ren;const u=UN(),v=await dlg('Edit unit',[{label:'Number',name:'n',value:u.num,num:1},{label:'Title',name:'t',value:u.title}],'Save');if(v&&+v.n&&v.t.trim()){u.num=+v.n;u.title=v.t.trim();BK().units.sort((x,y)=>x.num-y.num);S.u=BK().units.indexOf(u);full();mark()}return}
 if(dl){S.u=+dl.dataset.del;const v=await dlg('Delete unit?',[{html:`Delete <b>Unit ${UN().num}</b> with all its pages and buttons? (You can bring it back from History.)`}],'Delete',1);if(v){BK().units.splice(S.u,1);S.u=0;S.p=0;S.sel=-1;full();mark()}return}
 const th=t.closest('[data-p]');if(th){S.p=+th.dataset.p;S.sel=-1;full();return}
 const ut=t.closest('[data-u]');if(ut){S.u=+ut.dataset.u;S.p=0;S.sel=-1;full()}}
const lk=l=>/^\d/.test(l||'')?String(l).split('.').map(n=>+n||0):[-1];
const cmpA=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]??-2)-(b[i]??-2);if(d)return d}return 0};
function sortPages(u){u.pages=u.pages.map((p,i)=>[p,i]).sort(([a,i],[b,j])=>cmpA(lk(a.lesson),lk(b.lesson))||((a.part=='wb')-(b.part=='wb'))||((parseInt(a.label)||0)-(parseInt(b.label)||0))||i-j).map(x=>x[0])}
function insertPage(u,pg){const idx=u.pages.map((p,i)=>[p,i]).filter(([p])=>pg.lesson&&p.lesson==pg.lesson);if(!idx.length){u.pages.push(pg);return}
 const same=idx.filter(([p])=>(p.part||'sb')==pg.part);if(same.length){u.pages.splice(same[same.length-1][1]+1,0,pg);return}
 pg.part=='wb'?u.pages.splice(idx[idx.length-1][1]+1,0,pg):u.pages.splice(idx[0][1],0,pg)}
const lessonsOf=u=>[...new Set((u?u.pages:[]).map(p=>p.lesson).filter(Boolean))];
async function lessonMapDlg(){const u=UN();if(!u)return;
 const v=await dlg('Set lessons for all pages',[{html:'One lesson per line, like <b>6.1: 94-95</b>. Start a line with <b>WB</b> for Workbook pages, for example <b>WB 6.1: 12-14</b>. Pages are matched by their page number.'},{label:'Lessons',name:'m',ta:1,value:''}],'Apply');if(!v)return;let n=0;
 v.m.split('\n').forEach(line=>{const m=line.match(/^\s*(WB\s+)?([^:]+):\s*(.+)$/i);if(!m)return;const wb=!!m[1],les=m[2].trim(),set=new Set();
  m[3].split(',').forEach(t=>{t=t.trim();const r=t.match(/^(\d+)\s*-\s*(\d+)$/);if(r)for(let i=+r[1];i<=+r[2];i++)set.add(i);else if(/^\d+$/.test(t))set.add(+t)});
  u.pages.forEach(p=>{if(set.has(parseInt(p.label))&&((p.part=='wb')==wb)){p.lesson=les;n++}})});
 full();mark();alert(n+' page'+(n==1?'':'s')+' updated')}
async function uploadPages(files){const u=UN();if(!u)return alert('Add a unit first');const num=f=>+f.name.replace(/\D/g,'')||0,fl=[...files].filter(f=>/^image\//.test(f.type)).sort((a,b)=>num(a)-num(b));if(!fl.length)return;
 const cur=PG()||{},v=await dlg('Add '+fl.length+' page'+(fl.length>1?'s':''),[{label:'Lesson (e.g. 6.1) — optional',name:'l',value:cur.lesson||''},{label:'Part',name:'p',sel:[['sb','Student Book'],['wb','Workbook']],value:cur.part||'sb'}],'Upload');if(!v)return;
 const lesson=v.l.trim(),part=v.p;let n=0;
 for(const f of fl){setSt('saving',`Uploading ${++n}/${fl.length}…`);const lab=f.name.replace(/\D/g,'')||f.name.replace(/\.\w+$/,'');
  try{const url=await store(await toWebp(f),'pages'),ex=u.pages.find(p=>p.label==lab&&(p.part||'sb')==part);if(ex)ex.url=url;else{const pg={label:lab,part,url,hs:[]};if(lesson)pg.lesson=lesson;insertPage(u,pg)}}catch(e){return setSt('error','⚠ '+e.message)}}
 full();mark()}
async function migrate(){const b=BK();let n=0,tot=0;const jobs=[];
 const add=(o,k,kind)=>{if(o[k]&&!isAbs(o[k]))jobs.push([o,k,kind])};add(b,'cover','covers');
 b.units.forEach(u=>u.pages.forEach(p=>{add(p,'url','pages');p.hs.forEach(h=>add(h,'m',h.k))}));tot=jobs.length;
 if(!tot)return alert('Everything in this book is already on Backblaze ✓');
 for(const[o,k,kind]of jobs){setSt('saving',`Moving ${++n}/${tot}…`);try{const r=await fetch(new URL(o[k],location.href).href);if(!r.ok)throw new Error('Could not read '+o[k]);const blob=await r.blob();o[k]=await store(new File([blob],o[k].split('/').pop(),{type:blob.type}),kind)}catch(e){setSt('error','⚠ '+e.message);full();mark();return}}
 full();mark();alert('Done ✓ '+tot+' files moved. You can now delete the old pages/audio folders from GitHub.')}

/* ---------- toolbar / canvas ---------- */
function tbar(){const T=[['select','↖','Select'],['circle','◯','Add Hotspot'],['blank','👁','Add Blank'],['note','💬','Add Answer'],['audio','🎧','Add Audio'],['video','▶','Add Video'],['question','❓','Add Question'],['popup','🖼','Add Image'],['flash','🗂','Add Cards'],['shape','⬜','Add Shape'],['text','🅣','Add Text'],['link','🔗','Add Match'],['target','🎯','Add Target']];
 $('#mT').innerHTML=T.map(([k,i,n])=>`<button class="tool t-${k} ${S.tool==k&&!S.prev?'on':''}" data-t="${k}"><i>${i}</i>${n}</button>`).join('')+`<span class="sp"></span><button class="gh" id="un" title="Ctrl+Z">↶</button><button class="gh" id="re" title="Ctrl+Y">↷</button><button class="gh" id="zo">−</button><small>${Math.round(S.zoom*100)}%</small><button class="gh" id="zi">+</button>${S.prev?`<button class="gh ${S.dev=='desk'?'on':''}" data-dev="desk">🖥 Desktop</button><button class="gh ${S.dev=='tab'?'on':''}" data-dev="tab">▭ Tablet</button><button class="gh ${S.dev=='phone'?'on':''}" data-dev="phone">📱 Phone</button>`:''}`;
 $$('[data-dev]',$('#mT')).forEach(b=>b.onclick=()=>{S.dev=b.dataset.dev;tbar();canvas()});
 $$('[data-t]',$('#mT')).forEach(b=>b.onclick=()=>{S.tool=b.dataset.t;S.prev=false;stopAu();tbar();canvas()});
 $('#un').onclick=undo;$('#re').onclick=redo;$('#zo').onclick=()=>{S.zoom=Math.max(.6,S.zoom-.2);tbar();canvas()};$('#zi').onclick=()=>{S.zoom=Math.min(2.6,S.zoom+.2);tbar();canvas()};
 const pv=$('#prevb');pv&&(pv.textContent=S.prev?'✎ Back to editing':'▶ Preview');
 $('#hint').textContent=S.prev?'Preview: click the buttons exactly like the students will see them.':S.tool=='select'?'Click a button to edit it, drag to move it, drag its corners to resize. Pick “Add …” above to create a new one.':KINDS[S.tool].h}
function canvas(){const w=$('#cvw'),p=PG();if(!p){w.innerHTML='<div class="empty"><div style="font-size:42px">📄</div>Choose or upload a page on the left.</div>';return}
 let H=Math.min(w.clientHeight-26,(w.clientWidth-26)/.8)*S.zoom;const dv=S.prev&&S.dev!='desk';if(dv)H=S.dev=='phone'?460:720;
 w.innerHTML=`${dv?'<div class="devf">':''}<div id="stg" style="height:${H}px;width:${H*.8}px;--u:${H/100}px"><img src="${esc(surl(p.url))}" alt="">${decoSVG(p.hs)}${linkSVGed(p.hs)}<div id="lay" class="t-${S.tool}${S.prev?' prev':''}"></div></div>${dv?'</div>':''}`;
 if(S.prev){renderPage($('#stg'),p);return}const lay=$('#lay');p.hs.forEach(h=>{if(h.k=='text')lay.appendChild(mk(h))});p.hs.forEach((h,i)=>{if(h.k=='link')linkNodes(h,i).forEach(n=>lay.appendChild(n));else lay.appendChild(node(h,i))});lay.onpointerdown=lpd}
const lineSvg=h=>`<line x1="${h.x*.8}" y1="${h.y}" x2="${h.x2*.8}" y2="${h.y2}" stroke="${h.c||'#17a05a'}" stroke-width=".8" stroke-dasharray="2 1.2" stroke-linecap="round"/>`;
const linkSVGed=hs=>`<svg class="deco" id="elk" viewBox="0 0 80 100">${hs.filter(h=>h.k=='link').map(lineSvg).join('')}</svg>`;
function linkNodes(h,i){return [['a',h.x,h.y,`<span class="n">${i+1}</span>A`],['b',h.x2,h.y2,'B']].map(([e,x,y,t])=>{const d=document.createElement('div');d.className=`e ed-link${e=='b'?' b':''}${S.set.has(i)?' sel':''}${h.locked?' lk':''}`;d.dataset.i=i;d.dataset.end=e;d.style.left=x+'%';d.style.top=y+'%';if(h.c)d.style.setProperty('--c',h.c);d.innerHTML=t+(h.locked&&e=='a'?'<b class="lkb">🔒</b>':'');return d})}
function node(h,i){const d=document.createElement('div'),bx=KINDS[h.k].box;d.className=`e ed-${h.k}${S.set.has(i)?' sel':''}${h.locked?' lk':''}`;d.dataset.i=i;d.style.left=h.x+'%';d.style.top=h.y+'%';if(bx){d.style.width=h.w+'%';d.style.height=h.h+'%'}if(h.c)d.style.setProperty('--c',h.c);
 d.innerHTML=`<span class="n">${i+1}</span>`+(h.locked?'<b class="lkb">🔒</b>':'')+(h.k=='blank'?`<em>${esc(h.a||'?')}</em>`:GL[h.k]||'')+(bx&&i==S.sel&&!h.locked?['nw','ne','sw','se'].map(c=>`<i class="hd ${c}" data-h="${c}"></i>`).join(''):'');return d}

/* ---------- history (undo/redo) ---------- */
const snap=()=>{const p=PG();if(p){hist.push({p,j:JSON.stringify(p.hs)});redoS=[];if(hist.length>60)hist.shift()}};
function restore(h,from,to){const e=from.pop();if(!e)return;to.push({p:e.p,j:JSON.stringify(e.p.hs)});e.p.hs=JSON.parse(e.j);S.sel=-1;canvas();panel();tree();mark()}
const undo=()=>restore(0,hist,redoS),redo=()=>restore(0,redoS,hist);

/* ---------- canvas interaction ---------- */
function lpd(e){const R=$('#stg').getBoundingClientRect(),pt=ev=>[(ev.clientX-R.left)/R.width*100,(ev.clientY-R.top)/R.height*100],[x0,y0]=pt(e);
 const nd=e.target.closest('.e'),hd=e.target.closest('.hd');
 if(S.tool=='select'){
  if(!nd){const dr=document.createElement('div');dr.className='dr';$('#lay').appendChild(dr);const cx0=e.clientX,cy0=e.clientY;
   const mv=ev=>{const[x,y]=pt(ev);dr.style.cssText=`left:${Math.min(x0,x)}%;top:${Math.min(y0,y)}%;width:${Math.abs(x-x0)}%;height:${Math.abs(y-y0)}%`};
   const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);dr.remove();const a=[Math.min(cx0,ev.clientX),Math.min(cy0,ev.clientY),Math.max(cx0,ev.clientX),Math.max(cy0,ev.clientY)];
    if(a[2]-a[0]<6&&a[3]-a[1]<6){if(!e.shiftKey){S.sel=-1;canvas();panel()}return}
    const set=e.shiftKey?new Set(S.set):new Set();$$('.e',$('#lay')).forEach(n=>{const r=n.getBoundingClientRect();if(r.right>=a[0]&&r.left<=a[2]&&r.bottom>=a[1]&&r.top<=a[3])set.add(+n.dataset.i)});S.set=set;canvas();panel()};
   addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
  const i=+nd.dataset.i;
  if(e.shiftKey||e.ctrlKey||e.metaKey){S.set.has(i)?S.set.delete(i):S.set.add(i);canvas();panel();return}
  if(!S.set.has(i)){S.sel=i;canvas();panel()}
  const ids=[...S.set].filter(j=>!HS()[j].locked);if(HS()[i].locked||!ids.length)return;
  const mode=hd?hd.dataset.h:(nd.dataset.end&&S.set.size==1?'end'+nd.dataset.end:'move'),orig=new Map(ids.map(j=>[j,{...HS()[j]}])),before=JSON.stringify(HS());let moved=false;
  const place=j=>{const g=HS()[j];if(g.k=='link'){$$(`.e[data-i="${j}"]`).forEach(n=>{const b=n.dataset.end=='b';n.style.left=(b?g.x2:g.x)+'%';n.style.top=(b?g.y2:g.y)+'%'});const el=$('#elk');if(el)el.innerHTML=HS().filter(h=>h.k=='link').map(lineSvg).join('');return}const n=$(`.e[data-i="${j}"]`);if(n){n.style.left=g.x+'%';n.style.top=g.y+'%';if(KINDS[g.k].box){n.style.width=g.w+'%';n.style.height=g.h+'%'}}};
  const mv=ev=>{const[x,y]=pt(ev),dx=x-x0,dy=y-y0;if(!moved){if(Math.abs(dx)+Math.abs(dy)<.3)return;moved=true;hist.push({p:PG(),j:before});redoS=[]}
   if(mode=='move')ids.forEach(j=>{const g=HS()[j],o=orig.get(j),bx=KINDS[g.k].box;if(g.k=='link'){g.x=r2(clamp(o.x+dx,0,100));g.y=r2(clamp(o.y+dy,0,100));g.x2=r2(clamp(o.x2+dx,0,100));g.y2=r2(clamp(o.y2+dy,0,100));place(j);return}g.x=r2(clamp(o.x+dx,0,bx?100-g.w:100));g.y=r2(clamp(o.y+dy,0,bx?100-g.h:100));place(j)});
   else if(mode=='enda'||mode=='endb'){const g=HS()[i],o=orig.get(i);if(mode=='enda'){g.x=r2(clamp(o.x+dx,0,100));g.y=r2(clamp(o.y+dy,0,100))}else{g.x2=r2(clamp(o.x2+dx,0,100));g.y2=r2(clamp(o.y2+dy,0,100))}place(i)}
   else{const h=HS()[i],o=orig.get(i);let X=o.x,Y=o.y,W=o.w,Hh=o.h;if(mode.includes('w')){X=o.x+dx;W=o.w-dx}if(mode.includes('e'))W=o.w+dx;if(mode.includes('n')){Y=o.y+dy;Hh=o.h-dy}if(mode.includes('s'))Hh=o.h+dy;
    if(W<2){W=2;X=mode.includes('w')?o.x+o.w-2:X}if(Hh<1.5){Hh=1.5;Y=mode.includes('n')?o.y+o.h-1.5:Y}h.x=r2(X);h.y=r2(Y);h.w=r2(W);h.h=r2(Hh);place(i)}};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(moved){mark();panel()}};addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
 const k=S.tool;
 if(k=='link'){const ns='http://www.w3.org/2000/svg',sv=document.createElementNS(ns,'svg'),ln=document.createElementNS(ns,'line');sv.setAttribute('class','deco');sv.setAttribute('viewBox','0 0 80 100');
  [['x1',x0*.8],['y1',y0],['x2',x0*.8],['y2',y0],['stroke','#e5173f'],['stroke-width','.8']].forEach(([a,v])=>ln.setAttribute(a,v));sv.appendChild(ln);$('#lay').appendChild(sv);
  const mv=ev=>{const[x,y]=pt(ev);ln.setAttribute('x2',x*.8);ln.setAttribute('y2',y)};
  const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);sv.remove();let[x,y]=pt(ev);if(!(Math.hypot((x-x0)*.8,y-y0)>=3)){x=Math.min(100,x0+18);y=y0}
   const h={k:'link',x:r2(x0),y:r2(y0),x2:r2(clamp(x,0,100)),y2:r2(clamp(y,0,100)),w:0,h:0,a:null,m:null};snap();PG().hs.push(h);S.sel=HS().length-1;S.tool='select';S.tab='gen';tbar();canvas();panel();tree();mark()};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
 const bx=KINDS[k].box,dr=document.createElement('div');dr.className='dr';$('#lay').appendChild(dr);
 const mv=ev=>{if(!bx)return;const[x,y]=pt(ev);dr.style.cssText=`left:${Math.min(x0,x)}%;top:${Math.min(y0,y)}%;width:${Math.abs(x-x0)}%;height:${Math.abs(y-y0)}%`};
 const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);dr.remove();const[x,y]=pt(ev);let h;
  if(bx){let w=Math.abs(x-x0),hh=Math.abs(y-y0),lx=Math.min(x0,x),ly=Math.min(y0,y);if(w<2||hh<1.5){[w,hh]=DEFBOX[k]||[16,4];lx=x0-w/2;ly=y0-hh/2}h={k,x:r2(clamp(lx,0,100-w)),y:r2(clamp(ly,0,100-hh)),w:r2(w),h:r2(hh),a:null,m:null}}
  else h={k,x:r2(x0),y:r2(y0),w:0,h:0,a:null,m:null};
  initKind(h);snap();PG().hs.push(h);S.sel=HS().length-1;S.tool='select';S.tab='gen';tbar();canvas();panel();tree();mark();const f=$('#ia');f&&f.focus()};
 addEventListener('pointermove',mv);addEventListener('pointerup',up)}
function keys(e){if(!root.isConnected||!$('#cvw'))return;if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const mod=e.ctrlKey||e.metaKey;
 if(mod&&e.key=='z'&&!e.shiftKey){e.preventDefault();return undo()}if(mod&&(e.key=='y'||(e.key=='z'&&e.shiftKey))){e.preventDefault();return redo()}
 if(e.key=='Escape'){S.tool='select';S.sel=-1;tbar();canvas();panel();return}
 if(mod&&e.key=='v'){e.preventDefault();return paste()}
 if(mod&&e.key=='a'&&!S.prev){e.preventDefault();S.set=new Set(HS().map((_,i)=>i));canvas();panel();return}
 const ids=[...S.set];if(!ids.length||S.prev)return;
 if(mod&&e.key=='c'){e.preventDefault();return copy()}
 if(e.key=='l'||e.key=='L'){setLock(ids,!ids.every(i=>HS()[i].locked));return}
 if(e.key=='Delete'||e.key=='Backspace'){e.preventDefault();return delSel()}
 const st=e.shiftKey?1:.2,d={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[e.key];if(d){e.preventDefault();nudge(d[0],d[1])}}
function setLock(ids,on){snap();ids.forEach(i=>on?HS()[i].locked=true:delete HS()[i].locked);canvas();panel();mark()}
function nudge(dx,dy){const ids=[...S.set].filter(i=>!HS()[i].locked);if(!ids.length)return;snap();ids.forEach(i=>{const g=HS()[i],bx=KINDS[g.k].box;if(g.k=='link'){g.x=r2(clamp(g.x+dx,0,100));g.y=r2(clamp(g.y+dy,0,100));g.x2=r2(clamp(g.x2+dx,0,100));g.y2=r2(clamp(g.y2+dy,0,100));return}g.x=r2(clamp(g.x+dx,0,bx?100-g.w:100));g.y=r2(clamp(g.y+dy,0,bx?100-g.h:100))});canvas();mark();panel()}
function delSel(){const ids=[...S.set].sort((a,b)=>b-a);if(!ids.length)return;snap();ids.forEach(i=>HS().splice(i,1));S.sel=-1;canvas();panel();tree();mark()}
function copy(){const c=[...S.set].sort((a,b)=>a-b).map(i=>JSON.parse(JSON.stringify(HS()[i])));if(c.length){clip=c;setSt('dirty','Copied '+c.length+' · open another page and paste')}}
function paste(){if(!clip||!clip.length||!PG())return alert('Copy a button first (select it, then Copy).');const cs=(Array.isArray(clip)?clip:[clip]).map(x=>JSON.parse(JSON.stringify(x)));snap();const off=cs.some(c=>HS().some(x=>x.x==c.x&&x.y==c.y))?2:0,start=HS().length;
 cs.forEach(c=>{delete c.locked;c.x=r2(Math.min(100,c.x+off));c.y=r2(Math.min(100,c.y+off));if(c.k=='link'){c.x2=r2(Math.min(100,c.x2+off));c.y2=r2(Math.min(100,c.y2+off))}PG().hs.push(c)});S.set=new Set(cs.map((_,i)=>start+i));canvas();panel();tree();mark()}
function dupSel(){const ids=[...S.set].sort((a,b)=>a-b);if(!ids.length)return;snap();const start=HS().length;ids.forEach(i=>{const c=JSON.parse(JSON.stringify(HS()[i]));delete c.locked;c.x=r2(Math.min(100,c.x+2));c.y=r2(Math.min(100,c.y+2));if(c.k=='link'){c.x2=r2(Math.min(100,c.x2+2));c.y2=r2(Math.min(100,c.y2+2))}PG().hs.push(c)});S.set=new Set(ids.map((_,i)=>start+i));canvas();panel();tree();mark()}
function align(how){const ids=[...S.set].filter(i=>!HS()[i].locked&&HS()[i].k!='link');if(ids.length<2)return;snap();const gs=ids.map(i=>HS()[i]),bx=g=>KINDS[g.k].box,L0=Math.min(...gs.map(g=>g.x)),R0=Math.max(...gs.map(g=>g.x+(bx(g)?g.w:0))),T0=Math.min(...gs.map(g=>g.y)),B0=Math.max(...gs.map(g=>g.y+(bx(g)?g.h:0))),cx=(L0+R0)/2,cy=(T0+B0)/2;
 gs.forEach(g=>{if(how=='l')g.x=L0;if(how=='r')g.x=bx(g)?R0-g.w:R0;if(how=='t')g.y=T0;if(how=='b')g.y=bx(g)?B0-g.h:B0;if(how=='h')g.x=bx(g)?cx-g.w/2:cx;if(how=='v')g.y=bx(g)?cy-g.h/2:cy;g.x=r2(clamp(g.x,0,100));g.y=r2(clamp(g.y,0,100))});canvas();mark();panel()}
function multiPanel(){const a=$('#mR'),n=S.set.size;
 a.innerHTML=`<div class="rh">${n} buttons selected</div><div class="pbody"><p class="mu">Drag any selected button to move them all together. Shift+click adds or removes one. Drag on an empty area to select several.</p>
 <div class="row"><button class="gh" id="mlk">🔒 Lock</button><button class="gh" id="mul">🔓 Unlock</button><button class="gh" id="mcp">⧉ Copy</button><button class="gh" id="mdp">⎘ Duplicate</button><button class="gh dg" id="mdl">🗑 Delete</button></div>
 <div class="f" style="margin-top:14px">Align</div><div class="row" style="margin-top:4px">${[['l','⇤ Left'],['r','⇥ Right'],['t','⤒ Top'],['b','⤓ Bottom'],['h','↔ Center'],['v','↕ Middle']].map(([k,t])=>`<button class="gh" data-al="${k}">${t}</button>`).join('')}</div>
 <div class="f" style="margin-top:14px">Move all</div><div class="pad">${[['◀','-1,0'],['▲','0,-1'],['▼','0,1'],['▶','1,0']].map(([t,v])=>`<button class="gh" data-n="${v}">${t}</button>`).join('')}</div>
 <div class="tip">Ctrl+A selects everything on the page. Ctrl+C / Ctrl+V copies the whole group to another page.</div></div>`;
 const ids=()=>[...S.set];$('#mlk').onclick=()=>setLock(ids(),true);$('#mul').onclick=()=>setLock(ids(),false);$('#mcp').onclick=copy;$('#mdp').onclick=dupSel;$('#mdl').onclick=delSel;
 $$('[data-al]',a).forEach(b=>b.onclick=()=>align(b.dataset.al));$$('.pad button',a).forEach(b=>b.onclick=()=>{const[dx,dy]=b.dataset.n.split(',').map(Number);nudge(dx*.3,dy*.3)})}
/* ---------- inspector ---------- */
const mediaList=k=>[...new Set(L.books.flatMap(b=>b.units.flatMap(u=>u.pages.flatMap(p=>p.hs.filter(h=>h.k==k&&h.m&&!/youtu/.test(h.m)).map(h=>h.m)))))];
function panel(){const a=$('#mR'),p=PG();if(!p){a.innerHTML='';return}if(S.set.size>1)return multiPanel();const h=HS()[S.sel];
 if(!h){a.innerHTML=`<div class="rh">Page ${esc(p.label)}</div><div class="pbody"><label class="f">Page label<input id="plab" value="${esc(p.label)}"></label>
  <div class="g2"><label class="f">Lesson<input id="plsn" list="lsl" value="${esc(p.lesson||'')}" placeholder="e.g. 6.1"><datalist id="lsl">${lessonsOf(UN()).map(l=>`<option value="${esc(l)}">`).join('')}</datalist></label><label class="f">Part<select id="ppt"><option value="sb" ${p.part!='wb'?'selected':''}>Student Book</option><option value="wb" ${p.part=='wb'?'selected':''}>Workbook</option></select></label></div><div class="row" style="margin-top:0"><button class="gh" id="plsm">📚 Set lessons…</button><button class="gh" id="psort" title="Order pages by lesson, Student Book first, then Workbook">⇅ Sort by lesson</button></div>
  <div class="row"><button class="gh" id="pmL">◀ Earlier</button><button class="gh" id="pmR">Later ▶</button><button class="gh" id="pdup">⎘ Duplicate page</button><button class="gh dg" id="pdel">Delete page</button></div>
  <div class="row"><button class="gh" id="lkall">🔒 Lock all</button><button class="gh" id="ulall">🔓 Unlock all</button><button class="gh" id="pst">📋 Paste button</button></div>
  <div class="row"><button class="gh" id="tsv">💾 Save as template</button><button class="gh" id="tap">📑 Templates…</button></div>
  <div class="sh" style="margin-top:16px">Buttons on this page (${p.hs.length})</div>${p.hs.map((x,i)=>`<div class="li" data-s="${i}"><b>${i+1}</b><span>${KINDS[x.k].i} ${KINDS[x.k].n}</span><small>${esc(sumry(x))}</small></div>`).join('')||'<p class="mu">Nothing yet. Pick an “Add …” tool above, then click or drag on the page.</p>'}
  <div class="tip"><b>Pro tip:</b> choose a tool, click on the page, then type the answer here. Use <b>Select</b> to move or fix any button, and <b>Lock</b> it when it is perfect.</div></div>`;
  $('#lkall').onclick=()=>{snap();p.hs.forEach(x=>x.locked=true);canvas();panel();mark()};$('#ulall').onclick=()=>{snap();p.hs.forEach(x=>delete x.locked);canvas();panel();mark()};$('#pst').onclick=paste;
  $('#tsv').onclick=saveTpl;$('#tap').onclick=tplDlg;$('#plsm').onclick=lessonMapDlg;$('#plsn').onchange=e=>{const v=e.target.value.trim();v?p.lesson=v:delete p.lesson;full();mark()};$('#ppt').onchange=e=>{p.part=e.target.value;full();mark()};$('#psort').onclick=()=>{const c=PG();sortPages(UN());S.p=UN().pages.indexOf(c);full();mark()};$('#plab').onchange=e=>{p.label=e.target.value.trim()||p.label;full();mark()};
  const mvp=d=>{const u=UN(),j=S.p+d;if(j<0||j>=u.pages.length)return;[u.pages[S.p],u.pages[j]]=[u.pages[j],u.pages[S.p]];S.p=j;full();mark()};$('#pmL').onclick=()=>mvp(-1);$('#pmR').onclick=()=>mvp(1);
  $('#pdup').onclick=()=>{const c=JSON.parse(JSON.stringify(p));c.label=p.label+'b';UN().pages.splice(S.p+1,0,c);S.p++;full();mark()};
  $('#pdel').onclick=async()=>{const v=await dlg('Delete page?',[{html:`Delete page <b>${esc(p.label)}</b> and its ${p.hs.length} buttons?`}],'Delete',1);if(v){UN().pages.splice(S.p,1);S.p=0;S.sel=-1;full();mark()}};return}
 const k=h.k,K=KINDS[k],T=S.tab;let body='';
 if(T=='gen'){body=`<label class="f">Button type<select id="ik">${Object.entries(KINDS).map(([v,x])=>`<option value="${v}" ${v==k?'selected':''}>${x.i} ${x.n}</option>`).join('')}</select></label>
  ${k=='circle'?'<p class="mu">A circle appears around this spot when you click it in class. No text needed.</p>':''}
  ${k=='blank'?`<label class="f">Word shown on the blank<input id="ia" value="${esc(h.a||'')}" placeholder="e.g. wears"></label>`:''}
  ${k=='note'?`<label class="f">Answer (shown in a bubble)<textarea id="ia" rows="5" placeholder="Type the full answer…">${esc(h.a||'')}</textarea></label><p class="mu">Tip: use &lt;br&gt; for a new line.</p>`:''}
  ${/audio|video|popup/.test(k)?media(h):''}${k=='popup'?`<label class="f">Caption (optional)<input id="ia" value="${esc(h.a||'')}"></label>`:''}${k=='link'?`<label class="f">Label (optional, shown in your reports)<input id="ia" value="${esc(h.a||'')}"></label><p class="mu">Dot A is the start of the line, dot B is the end. Drag either dot on the page.</p>`:''}${qui(h)}${fui(h)}${sui(h)}${k=='text'?`<label class="f">Text<textarea id="ia" rows="3">${esc(h.a||'')}</textarea></label>`:''}
  <div class="f">Position${K.box?' & size':''} (% of page)</div><div class="g2"><label class="f">X<input type="number" step="0.1" id="px" value="${h.x}"></label><label class="f">Y<input type="number" step="0.1" id="py" value="${h.y}"></label>${k=='link'?`<label class="f">End X<input type="number" step="0.1" id="px2" value="${h.x2}"></label><label class="f">End Y<input type="number" step="0.1" id="py2" value="${h.y2}"></label>`:''}${K.box?`<label class="f">Width<input type="number" step="0.1" id="pw" value="${h.w}"></label><label class="f">Height<input type="number" step="0.1" id="ph" value="${h.h}"></label>`:''}</div>
  <label class="chk"><input type="checkbox" id="ilk" ${h.locked?'checked':''}> 🔒 Lock position <small>(press L)</small></label>
  <div class="pad">${[['◀','-1,0'],['▲','0,-1'],['▼','0,1'],['▶','1,0']].map(([s,n])=>`<button class="gh" data-n="${n}" ${h.locked?'disabled':''}>${s}</button>`).join('')}</div>`}
 else if(T=='act'){body=k=='audio'?`<label class="chk"><input type="checkbox" id="iau" ${h.auto?'checked':''}> Play automatically when the page opens</label><label class="chk"><input type="checkbox" id="ihd" ${h.hide?'checked':''}> Hide the button (use with auto-play)</label><p class="mu">Students and you can always click the 🎧 to play again, pause or resume.</p>`
   :k=='video'?'<p class="mu">Clicking this area opens the video in a pop-up window.</p>':k=='link'?'<p class="mu">Students tap one dot, then the other. A correct pair draws a green line; a wrong pair flashes red. <b>Reveal All</b> shows every correct line.</p>':k=='target'?'<p class="mu">Students tap the correct items. A green ring appears when they find one, and a wrong tap on the page flashes a red ✗. A counter shows on the page.</p>':/question|popup/.test(k)?'<p class="mu">Clicking this button opens it in a large pop-up window, easy to read from the back of the class.</p>':k=='flash'?`<label class="chk"><input type="checkbox" id="itts" ${h.tts?'checked':''}> Read each word aloud automatically</label><label class="f">Voice<select id="ilg"><option value="en-GB" ${(h.lang||'en-GB')=='en-GB'?'selected':''}>English (UK)</option><option value="en-US" ${h.lang=='en-US'?'selected':''}>English (US)</option></select></label><p class="mu">Students can also press 🔊 on any card. The voice comes from the device, so no audio files are needed.</p>`:/shape|text/.test(k)?'<p class="mu">This is a decoration. It is always visible on the page.</p>':`<label class="chk"><input type="checkbox" id="ish" ${h.show?'checked':''}> Show it from the start (no click needed)</label><p class="mu">${k=='circle'?'Clicking the area draws the circle around the correct option.':k=='blank'?'Clicking the eye reveals the word on the blank.':'Clicking the eye opens the answer bubble.'} <b>Reveal All</b> shows every circle and blank at once.</p>`}
 else{body=`<label class="f">Color<input type="color" id="ic" value="${h.c||K.col}"></label>${k=='text'?'':K.box?`<label class="f">Border thickness<input type="range" id="ith" min="1" max="10" value="${h.th||5}"></label>`:''}${k=='shape'?`<label class="f">Fill opacity<input type="range" id="iop" min="0" max="100" value="${h.op||0}"></label>`:''}${k=='text'?`<label class="f">Font size<input type="range" id="ifs" min="8" max="60" value="${h.fs||20}"></label><label class="chk"><input type="checkbox" id="ibgc" ${h.bg?'checked':''}> Background</label><label class="f">Background color<input type="color" id="ibg" value="${h.bg||'#fff6c8'}"></label>`:''}
  <label class="f">Animation<select id="ian">${['','pulse','bounce','shake'].map(v=>`<option value="${v}" ${(h.an||'')==v?'selected':''}>${v||'None'}</option>`).join('')}</select></label><div class="row"><button class="gh" id="irs">Reset style</button></div>`}
 a.innerHTML=`<div class="rh">Button ${S.sel+1} · ${K.n}</div><div class="tabs">${[['gen','⚙ General'],['act','⚡ Action'],['sty','🎨 Style']].map(([v,n])=>`<button data-tab="${v}" class="${T==v?'on':''}">${n}</button>`).join('')}</div><div class="pbody">${body}
  <div class="row"><button class="gh" id="icp">⧉ Copy</button><button class="gh" id="idup">⎘ Duplicate</button><button class="gh" id="ifr">⬆ Front</button><button class="gh" id="ibk">⬇ Back</button><button class="gh dg" id="idel">🗑 Delete</button></div>
  <div class="tip">Drag on the page to move · arrows nudge · Delete removes · Ctrl+Z / Ctrl+Y undo & redo · Ctrl+C / Ctrl+V copy to another page</div></div>`;
 $$('[data-tab]',a).forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;panel()});
 const set=(fn)=>{snap();fn();canvas();mark()};
 $('#idel').onclick=delSel;$('#icp').onclick=copy;
 $('#idup').onclick=()=>{snap();const c={...h,x:r2(Math.min(100,h.x+2)),y:r2(Math.min(100,h.y+2))};if(c.k=='link'){c.x2=r2(Math.min(100,c.x2+2));c.y2=r2(Math.min(100,c.y2+2))}delete c.locked;PG().hs.push(c);S.sel=HS().length-1;canvas();panel();mark()};
 $('#ifr').onclick=()=>{snap();const hs=HS();hs.push(hs.splice(S.sel,1)[0]);S.sel=hs.length-1;canvas();panel();mark()};
 $('#ibk').onclick=()=>{snap();const hs=HS();hs.unshift(hs.splice(S.sel,1)[0]);S.sel=0;canvas();panel();mark()};
 const on=(id,ev,fn)=>{const e=$(id);e&&(e['on'+ev]=fn)};
 on('#ik','change',e=>{snap();const nk=e.target.value,ob=KINDS[h.k].box,nb=KINDS[nk].box;if(!ob&&nb){h.w=14;h.h=4;h.x=r2(clamp(h.x-7,0,86));h.y=r2(clamp(h.y-2,0,96))}else if(ob&&!nb){h.x=r2(h.x+h.w/2);h.y=r2(h.y+h.h/2);h.w=h.h=0}h.k=nk;initKind(h);if(!/audio|video|popup/.test(nk))h.m=null;canvas();panel();mark()});
 const ia=$('#ia');if(ia){ia.onfocus=snap;ia.oninput=()=>{h.a=ia.value;const em=$('.e.sel em');em&&(em.textContent=h.a||'?');if(h.k=='text')canvas();mark()}}
 [['#px','x',0,100],['#py','y',0,100],['#px2','x2',0,100],['#py2','y2',0,100],['#pw','w',2,100],['#ph','h',1.5,100]].forEach(([id,key,lo,hi])=>on(id,'change',e=>set(()=>{h[key]=r2(clamp(+e.target.value||0,lo,hi))})));
 on('#ilk','change',e=>{snap();e.target.checked?h.locked=true:delete h.locked;canvas();panel();mark()});
 $$('.pad button',a).forEach(b=>b.onclick=()=>{const[dx,dy]=b.dataset.n.split(',').map(Number);nudge(dx*.3,dy*.3)});
 on('#iau','change',e=>{snap();e.target.checked?h.auto=true:delete h.auto;mark()});on('#ihd','change',e=>{snap();e.target.checked?h.hide=true:delete h.hide;mark()});on('#ish','change',e=>{snap();e.target.checked?h.show=true:delete h.show;mark()});
 on('#ic','change',e=>set(()=>{h.c=e.target.value}));on('#ith','change',e=>set(()=>{h.th=+e.target.value}));on('#ian','change',e=>{snap();e.target.value?h.an=e.target.value:delete h.an;mark()});
 on('#irs','click',()=>set(()=>{delete h.c;delete h.th;delete h.an;panel()}));
 on('#imex','change',e=>{if(e.target.value){snap();h.m=e.target.value;panel();canvas();mark()}});
 on('#iyt','change',e=>{snap();h.m=e.target.value.trim()||null;panel();mark()});
 on('#itest','click',()=>{if(!h.m)return alert('No audio file yet');const x=new Audio(surl(h.m));x.play().catch(()=>alert('Audio not found yet (it can take 1–2 minutes after upload).'))});
 on('#qt','change',e=>{snap();const q=h.q;q.type=e.target.value;q.ok=q.type=='mcq'?0:q.type=='tf'?1:'';panel();mark()});
 on('#qq','focus',()=>snap());on('#qq','input',e=>{h.q.t=e.target.value;mark()});
 on('#qo','input',e=>{h.q.opts=e.target.value.split('\n');const s=$('#qk');if(s)s.innerHTML=h.q.opts.map((o,i)=>`<option value="${i}" ${h.q.ok==i?'selected':''}>${String.fromCharCode(65+i)}. ${esc(o.slice(0,30))}</option>`).join('');mark()});
 on('#qk','change',e=>{snap();h.q.ok=+e.target.value;mark()});on('#qf','input',e=>{h.q.ok=e.target.value;mark()});on('#qe','input',e=>{h.q.ex=e.target.value;mark()});
 on('#fcs','input',e=>{h.cards=e.target.value.split('\n').filter(l=>l.trim()).map(l=>{const i=l.indexOf('|');return i<0?{f:l.trim(),b:''}:{f:l.slice(0,i).trim(),b:l.slice(i+1).trim()}});mark()});
 on('#itts','change',e=>{snap();e.target.checked?h.tts=true:delete h.tts;mark()});on('#ilg','change',e=>{snap();h.lang=e.target.value;mark()});
 on('#ish2','change',e=>{snap();h.sh=e.target.value;canvas();panel();mark()});on('#idir','change',e=>{snap();h.dir=e.target.value;canvas();mark()});
 on('#iop','change',e=>set(()=>{h.op=+e.target.value}));on('#ifs','change',e=>set(()=>{h.fs=+e.target.value}));
 on('#ibgc','change',e=>set(()=>{e.target.checked?h.bg=$('#ibg').value:delete h.bg}));on('#ibg','change',e=>set(()=>{if($('#ibgc').checked)h.bg=e.target.value}));
 on('#imf','change',async e=>{const f=e.target.files[0];if(!f)return;setSt('saving','Uploading '+f.name+'…');try{const url=await store(k=='popup'?await toWebp(f):f,k);snap();h.m=url;panel();mark()}catch(er){setSt('error','⚠ '+er.message)}})}
function qui(h){if(h.k!='question')return '';const q=h.q,t=q.type;
 return `<label class="f">Question type<select id="qt"><option value="mcq" ${t=='mcq'?'selected':''}>Multiple choice</option><option value="tf" ${t=='tf'?'selected':''}>True / False</option><option value="fill" ${t=='fill'?'selected':''}>Fill in the answer</option></select></label>
 <label class="f">Question<textarea id="qq" rows="3">${esc(q.t)}</textarea></label>
 ${t=='mcq'?`<label class="f">Options (one per line)<textarea id="qo" rows="4">${esc((q.opts||[]).join('\n'))}</textarea></label><label class="f">Correct option<select id="qk">${(q.opts||[]).map((o,i)=>`<option value="${i}" ${q.ok==i?'selected':''}>${String.fromCharCode(65+i)}. ${esc(o.slice(0,30))}</option>`).join('')}</select></label>`:''}
 ${t=='tf'?`<label class="f">Correct answer<select id="qk"><option value="1" ${q.ok==1?'selected':''}>True</option><option value="0" ${q.ok==0?'selected':''}>False</option></select></label>`:''}
 ${t=='fill'?`<label class="f">Accepted answer(s), separated by |<input id="qf" value="${esc(q.ok||'')}" placeholder="e.g. wears|is wearing"></label>`:''}
 <label class="f">Explanation (shown after a correct answer)<textarea id="qe" rows="2">${esc(q.ex||'')}</textarea></label>`}
function fui(h){if(h.k!='flash')return '';return `<label class="f">Cards, one per line: <b>word | meaning</b><textarea id="fcs" rows="8" placeholder="ferry | a boat that carries people and cars">${esc((h.cards||[]).map(c=>c.f+' | '+c.b).join('\n'))}</textarea></label>`}
function sui(h){if(h.k!='shape')return '';return `<label class="f">Shape<select id="ish2">${[['rect','Rectangle'],['ellipse','Ellipse'],['arrow','Arrow']].map(([v,n])=>`<option value="${v}" ${(h.sh||'rect')==v?'selected':''}>${n}</option>`).join('')}</select></label>${h.sh=='arrow'?`<label class="f">Arrow points to<select id="idir">${[['se','↘ bottom-right'],['sw','↙ bottom-left'],['ne','↗ top-right'],['nw','↖ top-left']].map(([v,n])=>`<option value="${v}" ${(h.dir||'se')==v?'selected':''}>${n}</option>`).join('')}</select></label>`:''}`}
function media(h){const k=h.k,l=mediaList(k);return `<div class="f">File</div>${h.m?`<div class="file">${k=='audio'?'🎧':k=='popup'?'🖼':'🎬'} ${esc(h.m.split('/').pop())}</div>`:'<div class="file none">No file yet — upload one below</div>'}
 ${l.length?`<select id="imex"><option value="">Use a file already in the library…</option>${l.map(m=>`<option value="${esc(m)}">${esc(m.split('/').pop())}</option>`).join('')}</select>`:''}
 <label class="up">⬆ Upload ${k=='popup'?'image':k} file<input type="file" id="imf" hidden accept="${k=='popup'?'image':k}/*"></label>
 ${k=='video'?`<label class="f">…or paste a YouTube link<input id="iyt" value="${/youtu/.test(h.m||'')?esc(h.m):''}" placeholder="https://youtu.be/…"></label>`:k=='audio'?'<div class="row"><button class="gh" id="itest">▶ Test sound</button></div>':''}`}

/* ---------- version history & settings ---------- */
async function histDlg(){const d=document.createElement('div');d.className='mdl';d.innerHTML='<div class="mbox"><h3>🕘 Version history</h3><p class="mu">Loading…</p></div>';root.appendChild(d);
 d.onclick=e=>{if(e.target==d)d.remove()};const box=$('.mbox',d);
 try{if(dirty)await flush();const r=await fetch(`https://api.github.com/repos/${G.o}/${G.r}/commits?path=data/library.json&per_page=30&sha=${G.b}`,{headers:GH()});if(!r.ok)throw new Error(errMsg(r.status));const cs=await r.json();
  box.innerHTML=`<h3>🕘 Version history</h3><p class="mu">Every save is kept. Restoring creates a new version, nothing is lost.</p>${cs.map((c,i)=>`<div class="hv"><span>${esc(new Date(c.commit.author.date).toLocaleString())}<small>${esc(c.commit.message)}</small></span>${i?`<button class="gh" data-sha="${c.sha}">Restore</button>`:'<small>current</small>'}</div>`).join('')}<div class="row"><button class="gh" id="hx">Close</button></div>`;
  $('#hx',box).onclick=()=>d.remove();
  $$('[data-sha]',box).forEach(b=>b.onclick=async()=>{b.textContent='…';try{const t=await ghRead('data/library.json',b.dataset.sha);{const j=JSON.parse(t);L.books=j.books;L.templates=j.templates||[]};L.books.forEach(x=>x.units=x.units||[]);S.b=S.u=S.p=0;S.sel=-1;hist=[];redoS=[];d.remove();full();mark()}catch(e){alert(e.message)}})}
 catch(e){box.innerHTML=`<h3>🕘 Version history</h3><p class="er">${esc(e.message)}</p><div class="row"><button class="gh" id="hx">Close</button></div>`;$('#hx',box).onclick=()=>d.remove()}}
async function reportsDlg(){const d=document.createElement('div');d.className='mdl';d.innerHTML='<div class="mbox wide"><h3>📊 Student progress</h3><p class="mu">Loading…</p></div>';root.appendChild(d);d.onclick=e=>{if(e.target==d)d.remove()};const box=$('.mbox',d);
 const r=await sb.from('results').select('*').order('created_at',{ascending:false}).limit(5000);
 if(r.error){const miss=/permission denied|does not exist|schema cache/i.test(r.error.message);box.innerHTML=`<h3>📊 Student progress</h3><p class="er">${esc(r.error.message)}</p>${miss?'<p class="mu">Run the “results” part of <b>supabase-setup.sql</b> in Supabase → SQL Editor, then open Reports again.</p>':''}<div class="row"><button class="gh" id="rx">Close</button></div>`;$('#rx',box).onclick=()=>d.remove();return}
 const rows=r.data||[];let tab='stu',cls='',unit='';
 const csvEsc=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
 const render=()=>{const f=rows.filter(x=>(!cls||x.class==cls)&&(!unit||String(x.unit)==unit)),classes=[...new Set(rows.map(x=>x.class).filter(Boolean))],units=[...new Set(rows.map(x=>x.unit).filter(v=>v!=null))].sort((a,b)=>a-b);let table='';
  if(tab=='stu'){const m=new Map();f.forEach(x=>{const k=x.student+'|'+(x.class||''),o=m.get(k)||{s:x.student,c:x.class||'',n:0,ok:0,qs:new Set(),sv:new Set(),last:x.created_at};o.n++;if(x.correct){o.ok++;o.sv.add(x.qkey)}o.qs.add(x.qkey);if(x.created_at>o.last)o.last=x.created_at;m.set(k,o)});
   const list=[...m.values()].sort((a,b)=>b.last.localeCompare(a.last));
   table=`<table class="rt"><tr><th>Student</th><th>Class</th><th>Questions tried</th><th>Solved</th><th>Accuracy</th><th>Last active</th></tr>${list.map(o=>`<tr><td>${esc(o.s)}</td><td>${esc(o.c)}</td><td>${o.qs.size}</td><td>${o.sv.size}</td><td>${Math.round(o.ok/o.n*100)}% <small>(${o.ok}/${o.n})</small></td><td>${esc(new Date(o.last).toLocaleDateString())}</td></tr>`).join('')||'<tr><td colspan="6">No results yet. Students appear here after they type their name (👤) and answer questions.</td></tr>'}</table>`}
  else{const m=new Map();f.forEach(x=>{const k=x.book+'|'+x.unit+'|'+x.qkey,o=m.get(k)||{u:x.unit,p:x.page,t:x.qtext,n:0,ok:0,st:new Set()};o.n++;if(x.correct)o.ok++;o.st.add(x.student);m.set(k,o)});
   const list=[...m.values()].sort((a,b)=>a.ok/a.n-b.ok/b.n);
   table=`<table class="rt"><tr><th>Question</th><th>Unit · Page</th><th>Students</th><th>Attempts</th><th>Correct</th></tr>${list.map(o=>`<tr><td>${esc((o.t||'').slice(0,90))}</td><td>${esc(o.u)} · ${esc(o.p)}</td><td>${o.st.size}</td><td>${o.n}</td><td>${Math.round(o.ok/o.n*100)}%</td></tr>`).join('')||'<tr><td colspan="5">No results yet</td></tr>'}</table><p class="mu">Hardest questions first.</p>`}
  box.innerHTML=`<h3>📊 Student progress</h3><div class="row" style="justify-content:flex-start;margin-top:0"><button class="gh ${tab=='stu'?'on':''}" data-t="stu">Students</button><button class="gh ${tab=='q'?'on':''}" data-t="q">Questions</button><select id="rc" style="width:auto"><option value="">All classes</option>${classes.map(c=>`<option ${c==cls?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="ru" style="width:auto"><option value="">All units</option>${units.map(u=>`<option value="${u}" ${String(u)==unit?'selected':''}>Unit ${u}</option>`).join('')}</select><button class="gh" id="rcsv">⬇ Export CSV</button></div><div style="overflow:auto;max-height:55vh;margin-top:8px">${table}</div><div class="row"><button class="gh" id="rx">Close</button></div>`;
  $$('[data-t]',box).forEach(b=>b.onclick=()=>{tab=b.dataset.t;render()});$('#rc',box).onchange=e=>{cls=e.target.value;render()};$('#ru',box).onchange=e=>{unit=e.target.value;render()};$('#rx',box).onclick=()=>d.remove();
  $('#rcsv',box).onclick=()=>{const csv=['date,student,class,book,unit,page,question,correct,answer'].concat(f.map(x=>[x.created_at,x.student,x.class,x.book,x.unit,x.page,x.qtext,x.correct,x.answer].map(csvEsc).join(','))).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='student-results.csv';a.click()}};
 render()}
const probe=(u,kd)=>new Promise(res=>{let el;const done=ok=>{clearTimeout(t);res(ok)},t=setTimeout(()=>done(false),9000);
 if(kd=='image'){el=new Image();el.onload=()=>done(true);el.onerror=()=>done(false);el.src=u}
 else{el=document.createElement(kd=='video'?'video':'audio');el.preload='metadata';el.onloadedmetadata=()=>done(true);el.onerror=()=>done(false);el.src=u}});
async function checkDlg(){const d=document.createElement('div');d.className='mdl';d.innerHTML='<div class="mbox wide"><h3>🩺 System check</h3><div id="ck"></div></div>';root.appendChild(d);d.onclick=e=>{if(e.target==d)d.remove()};
 const ck=$('#ck',d),rows=[];let busy=true;
 const paint=()=>{ck.innerHTML=rows.map(([st,t,h])=>`<div class="hv"><span>${{ok:'✅',warn:'⚠️',bad:'❌'}[st]} ${t}${h&&st!='ok'?`<small>${h}</small>`:''}</span></div>`).join('')+(busy?'<p class="mu">⏳ Checking…</p>':'')+`<div class="row"><button class="gh" id="cbk">⬇ Download backup</button><button class="gh" id="cx">Close</button></div>`;
  $('#cx',d).onclick=()=>d.remove();$('#cbk',d).onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(L,null,1)],{type:'application/json'}));a.download='library-backup.json';a.click()}};
 const add=(st,t,h)=>{rows.push([st,t,h||'']);paint()};paint();
 try{const{data:{session}}=await sb.auth.getSession();session?add('ok','Logged in as '+esc(session.user&&session.user.email||'teacher')):add('bad','Not logged in','Log out and log in again.')}catch(e){add('bad','Login check failed',esc(e.message))}
 try{const r=await fetch(`https://api.github.com/repos/${G.o}/${G.r}`,{headers:GH()});
  if(!r.ok)add('bad','GitHub repository '+esc(G.o+'/'+G.r)+' not reachable',esc(errMsg(r.status)));
  else{const j=await r.json();add('ok','GitHub repository '+esc(G.o+'/'+G.r)+' found');add(j.permissions&&j.permissions.push===false?'bad':'ok',j.permissions&&j.permissions.push===false?'The token cannot save changes':'The token can save changes',j.permissions&&j.permissions.push===false?'Create a token with Contents: Read and write, then paste it in ⚙ Settings.':'');
   const m=await ghMeta('data/library.json').catch(()=>null);add(m?'ok':'bad',m?'data/library.json found':'data/library.json is missing','Upload the data folder to the repository.');
   const pg=await fetch(`https://api.github.com/repos/${G.o}/${G.r}/pages`,{headers:GH()});add(pg.ok?'ok':'warn',pg.ok?'GitHub Pages is on':'Could not confirm GitHub Pages',pg.ok?'':'If the site does not open: repository → Settings → Pages → Branch main → Save.')}}
 catch(e){add('bad','GitHub check failed',esc(e.message))}
 const FN=C.supabaseUrl+'/functions/v1/media';
 if(G.m=='b2'){try{const p=await fetch(FN),j=await p.json().catch(()=>({}));
   if(!p.ok||!j.ok)add('bad','The “media” function is not reachable ('+p.status+')','Deploy the Edge Function named media in Supabase (Edge Functions → Deploy a new function → Via Editor) and turn OFF “Verify JWT”.');
   else{add('ok','Supabase function “media” is deployed');
    const{data:{session}}=await sb.auth.getSession(),h=await fetch(FN+'/health',{headers:{Authorization:'Bearer '+session.access_token,apikey:C.supabaseKey}}),t=await h.json().catch(()=>({}));
    if(h.status==401)add('bad','The function rejected your login','Log out and in again. If it keeps happening, turn OFF “Verify JWT” for the function.');
    else if(h.status==403)add('bad','TEACHER_EMAIL does not match your login email','Edit the TEACHER_EMAIL secret in Supabase (Edge Functions → Secrets).');
    else if(t.missing)add('bad','Missing secrets: '+esc(t.missing.join(', ')),'Add them in Supabase → Edge Functions → Secrets.');
    else if(!t.upload)add('bad','Backblaze refused the test upload ('+esc(t.uploadStatus)+')',esc(String(t.detail||'').replace(/<[^>]+>/g,' ').slice(0,160))+' — check B2_KEY_ID, B2_APP_KEY, B2_BUCKET and that the key can write to that bucket.');
    else{add('ok','Backblaze upload works');add(t.signedOk?'ok':'bad',t.signedOk?'Private download links work':'Private download links failed','Check that the application key can read the bucket (Read and Write) and that B2_BUCKET / B2_ENDPOINT are right.');
     add(t.public?'warn':'ok',t.public?'The bucket is Public: anyone with a file link can open it':'The bucket is Private: files open only with a class code or your login',t.public?'To keep files private, set the bucket to Private in Backblaze (Bucket Settings → Files in Bucket are: Private).':'')}}}
  catch(e){add('bad','Could not reach the media function',esc(e.message))}}
 else add('warn','Backblaze storage is not turned on','Files are stored on GitHub for now. Deploy the media function, then choose Backblaze in ⚙ Settings.');
 try{const r=await sb.from('results').select('id').limit(1);
  if(r.error)add('bad','Student results table not ready',esc(r.error.message)+' — run the “results” SQL in Supabase.');
  else{const cl=await sb.from('classes').select('code,active');
   if(cl.error)add('bad','Class codes table not ready',esc(cl.error.message)+' — run the “classes” SQL in Supabase.');
   else{const act=(cl.data||[]).filter(c=>c.active);
    if(!act.length)add('warn','No active class code yet','Open 👥 Classes and create one. Students need it to save their progress.');
    else{const p=await fetch(C.supabaseUrl+'/rest/v1/results',{method:'POST',headers:{apikey:C.supabaseKey,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({student:'__healthcheck__',correct:true,qtext:'check',class_code:act[0].code})});
     add(p.ok?'ok':'bad',p.ok?'Students can save their results ('+act.length+' active class'+(act.length>1?'es':'')+')':'Students cannot save results ('+p.status+')',p.ok?'':'Run the “classes” SQL in Supabase (it updates the permission for students).');await sb.from('results').delete().eq('student','__healthcheck__');
     if(G.m=='b2'){const first=L.books.flatMap(b=>b.units).flatMap(u=>unitUrls(u))[0];
      if(first){const sr=await fetch(FN+'/sign',{method:'POST',headers:{'Content-Type':'application/json',apikey:C.supabaseKey},body:JSON.stringify({code:act[0].code,urls:[first]})}),sj=sr.ok?await sr.json():{},ok=sr.ok&&sj.urls&&Object.keys(sj.urls).length>0;
       add(ok?'ok':'bad',ok?'Students with a class code can open the files':'Students cannot open the files ('+sr.status+')','Check the “classes” SQL in Supabase and the function secrets.')}}}}}}
 catch(e){add('bad','Results check failed',esc(e.message))}
 try{const items=[];L.books.forEach(b=>{b.cover&&items.push([b.cover,b.title+' · cover','image']);b.units.forEach(u=>u.pages.forEach(p=>{items.push([p.url,'Unit '+u.num+' · page '+p.label,'image']);p.hs.forEach(h=>{if(h.m&&!/youtu/.test(h.m)&&/audio|video|popup/.test(h.k))items.push([h.m,'Unit '+u.num+' · page '+p.label+' · '+h.k,h.k=='popup'?'image':h.k])})}))});
  const miss=[],seen=new Set(),list=items.filter(([u])=>u&&!seen.has(u)&&seen.add(u));
  for(let i=0;i<list.length;i+=6)await Promise.all(list.slice(i,i+6).map(async([u,w,kd])=>{if(!(await probe(new URL(surl(u),location.href).href,kd)))miss.push([u,w])}));
  add(miss.length?'warn':'ok',`${list.length} files checked · ${miss.length?miss.length+' missing':'all found'}`,miss.length?'Missing: '+miss.slice(0,14).map(([u,w])=>esc(w+' → '+u.split('/').pop())).join(' · ')+(miss.length>14?' …':'')+'. Files you just uploaded to GitHub can take 1–2 minutes to appear.':'')}
 catch(e){add('warn','File check skipped',esc(e.message))}
 busy=false;paint()}
const BUILTIN=[
 {name:'Multiple-choice question',hs:[{k:'question',x:50,y:12,w:0,h:0,a:null,m:null,q:{type:'mcq',t:'Question?',opts:['Option A','Option B','Option C',''],ok:0,ex:''}}]},
 {name:'Flashcards button',hs:[{k:'flash',x:50,y:12,w:0,h:0,a:null,m:null,cards:[{f:'word',b:'meaning'}]}]},
 {name:'Matching activity (3 pairs)',hs:[30,48,66].map(y=>({k:'link',x:18,y,x2:80,y2:y,w:0,h:0,a:null,m:null}))},
 {name:'Tap-the-target activity (3)',hs:[15,40,65].map(x=>({k:'target',x,y:40,w:18,h:10,a:null,m:null}))}];
async function saveTpl(){const p=PG();if(!p||!p.hs.length)return alert('This page has no buttons to save yet.');const v=await dlg('Save this page as a template',[{label:'Template name',name:'n',value:''}],'Save');
 if(v&&v.n.trim()){(L.templates=L.templates||[]).push({name:v.n.trim(),hs:JSON.parse(JSON.stringify(p.hs))});mark();setSt('dirty','Template saved')}}
function tplDlg(){const d=document.createElement('div');d.className='mdl';root.appendChild(d);d.onclick=e=>{if(e.target==d)d.remove()};
 const row=(t,id,del)=>`<div class="hv"><span>${esc(t.name)}<small>${t.hs.length} button${t.hs.length==1?'':'s'}</small></span><button class="gh" data-a="${id}">Add</button><button class="gh" data-r="${id}">Replace</button>${del?`<button class="gh dg" data-d="${id}">🗑</button>`:''}</div>`;
 const get=id=>id[0]=='b'?BUILTIN[+id.slice(1)]:(L.templates||[])[+id.slice(1)];
 const apply=(id,rp)=>{const t=get(id);if(!t||!PG())return;snap();if(rp)PG().hs=[];const start=HS().length;t.hs.forEach(h=>PG().hs.push(JSON.parse(JSON.stringify(h))));S.set=new Set(t.hs.map((_,i)=>start+i));d.remove();canvas();panel();tree();mark()};
 const draw=()=>{const mine=L.templates||[];d.innerHTML=`<div class="mbox wide"><h3>📑 Page templates</h3><p class="mu">A template is a saved set of buttons. <b>Add</b> puts them on the current page. <b>Replace</b> clears the page's buttons first.</p>${BUILTIN.map((t,i)=>row(t,'b'+i,false)).join('')}${mine.length?'<div class="sh" style="margin-top:12px">Your templates</div>'+mine.map((t,i)=>row(t,'m'+i,true)).join(''):'<p class="mu">Your saved templates will appear here. Use “Save as template” on a finished page.</p>'}<div class="row"><button class="gh" id="tx">Close</button></div></div>`;
  $('#tx',d).onclick=()=>d.remove();$$('[data-a]',d).forEach(b=>b.onclick=()=>apply(b.dataset.a,false));$$('[data-r]',d).forEach(b=>b.onclick=()=>apply(b.dataset.r,true));
  $$('[data-d]',d).forEach(b=>b.onclick=()=>{L.templates.splice(+b.dataset.d.slice(1),1);mark();draw()})};draw()}
async function classesDlg(){const d=document.createElement('div');d.className='mdl';d.innerHTML='<div class="mbox wide"><h3>👥 Classes and codes</h3><p class="mu">Loading…</p></div>';root.appendChild(d);d.onclick=e=>{if(e.target==d)d.remove()};const box=$('.mbox',d);
 const AB='ABCDEFGHJKMNPQRSTUVWXYZ23456789',gen=()=>[...crypto.getRandomValues(new Uint8Array(6))].map(x=>AB[x%AB.length]).join('');
 const render=async()=>{const r=await sb.from('classes').select('*').order('created_at');
  if(r.error){box.innerHTML=`<h3>👥 Classes and codes</h3><p class="er">${esc(r.error.message)}</p><p class="mu">Run the “classes” SQL in Supabase → SQL Editor, then open this window again.</p><div class="row"><button class="gh" id="cx">Close</button></div>`;$('#cx',box).onclick=()=>d.remove();return}
  const rows=r.data||[];
  box.innerHTML=`<h3>👥 Classes and codes</h3><p class="mu">Each class gets a code. Students open the book, press <b>👤 Student</b>, and type their name and the class code. Their results then appear in <b>Reports</b> under the class name. Pause a class to stop saving its results.</p>${rows.map(c=>`<div class="hv"><span><b style="font-size:21px;letter-spacing:3px">${esc(c.code)}</b> · ${esc(c.name)}<small>${c.active?'Active':'Paused'}</small></span><button class="gh" data-cp="${esc(c.code)}">Copy</button><button class="gh" data-tg="${esc(c.code)}">${c.active?'Pause':'Resume'}</button><button class="gh dg" data-dl="${esc(c.code)}">🗑</button></div>`).join('')||'<p class="mu">No classes yet. Add your first class below.</p>'}<div class="row"><input id="cn" placeholder="New class name (e.g. 4A)" style="flex:1;padding:8px 10px;border:1px solid #c5d3df;border-radius:9px"><button class="pr" id="cadd">＋ Add class</button></div><div class="row"><button class="gh" id="cx">Close</button></div>`;
  $('#cx',box).onclick=()=>d.remove();
  $('#cadd',box).onclick=async()=>{const n=$('#cn',box).value.trim();if(!n)return;let e;for(let i=0;i<5;i++){e=(await sb.from('classes').insert({code:gen(),name:n})).error;if(!e||e.code!='23505')break}if(e)alert(e.message);render()};
  $$('[data-cp]',box).forEach(b=>b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(b.dataset.cp);b.textContent='Copied ✓'});
  $$('[data-tg]',box).forEach(b=>b.onclick=async()=>{const c=rows.find(x=>x.code==b.dataset.tg);await sb.from('classes').update({active:!c.active}).eq('code',c.code);render()});
  $$('[data-dl]',box).forEach(b=>b.onclick=async()=>{const v=await dlg('Delete class?',[{html:`Delete the class code <b>${esc(b.dataset.dl)}</b>? Students using it will stop saving results. Old results stay in Reports.`}],'Delete',1);if(v){await sb.from('classes').delete().eq('code',b.dataset.dl);render()}})};
 render()}
async function settingsDlg(){const v=await dlg('Settings',[{label:'Where to store big files (pages, audio, video)',name:'m',sel:[['','GitHub — simple, fine for a few books'],['b2','Backblaze B2 — recommended (needs the media function)']],value:G.m},{label:'New GitHub token (leave empty to keep the current one)',name:'t',value:''}],'Save');if(!v)return;
 const a=await sb.from('settings').upsert({key:'media_mode',value:v.m});if(a.error)return alert(a.error.message);G.m=v.m;
 if(v.t.trim()){const b=await sb.from('settings').upsert({key:'gh_token',value:v.t.trim()});if(b.error)return alert(b.error.message);G.t=v.t.trim()}
 tree();setSt('saved','✓ Settings saved')}
window.Manager={open};
})();
