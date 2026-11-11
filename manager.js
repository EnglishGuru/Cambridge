(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'book',safe=n=>n.replace(/[^\w.\-]+/g,'_');
const b64=s=>btoa(unescape(encodeURIComponent(s))),fb=f=>new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f)});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),r2=v=>Math.round(v*100)/100;
const C=window.CFG||{},G={o:C.owner||location.hostname.split('.')[0],r:C.repo||location.pathname.split('/')[1]||'',b:C.branch||'main',t:''};
const KINDS={circle:{n:'Circle',i:'◯',box:1,h:'Drag a shape around the correct option (or just click to place one).'},blank:{n:'Eye on blank',i:'👁',h:'Click on the blank where the answer word should appear.'},note:{n:'Eye + answer',i:'💬',h:'Click just after the question. The full answer shows in a small bubble.'},audio:{n:'Audio',i:'🎧',h:'Click on the headphone icon in the book.'},video:{n:'Video',i:'▶',box:1,h:'Drag a rectangle over “Watch this!”.'}};
let sb,L,onClose,root,dirty=false,saving=false,tm,hist=[];
const S={b:0,u:0,p:0,sel:-1,tool:'select',zoom:1,prev:false};
const BK=()=>L.books[S.b],UN=()=>BK()&&BK().units[S.u],PG=()=>UN()&&UN().pages[S.p],HS=()=>PG()?PG().hs:[];

const CSS=`
#mg{position:fixed;inset:0;z-index:50;background:#f2f6f9;color:#12263a;font:14px/1.4 system-ui,Segoe UI,Tahoma,sans-serif;display:flex;flex-direction:column}
#mg *{box-sizing:border-box}#mg button:not(.h){font:inherit;cursor:pointer}#lay{touch-action:none}
#mg header{height:54px;background:#fff;border-bottom:1px solid #dfe7ee;display:flex;align-items:center;gap:10px;padding:0 14px;flex:none}
#mg header b{font-size:16px;color:#0b5f87}#mg .bc{color:#6b7f8f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mg .sp{flex:1}
.pill{padding:4px 12px;border-radius:99px;font-size:12.5px;background:#e8eef3;color:#4b6073}.pill.saved{background:#dff5e6;color:#17803d}.pill.saving,.pill.dirty{background:#fff2cf;color:#9a6a00}.pill.error{background:#fde2e2;color:#b42323}
#mg .gh{background:#fff;border:1px solid #cfdae4;color:#12263a;border-radius:9px;padding:7px 12px}#mg .gh:hover{background:#eef4f8}
#mg .pr{background:#0f8fb0;border:0;color:#fff;border-radius:9px;padding:9px 16px;font-weight:600}#mg .pr.dg,#mg .gh.dg{color:#c63b3b}#mg .pr.dg{background:#d64545;color:#fff}
#mg .body{flex:1;min-height:0;display:grid;grid-template-columns:272px 1fr 316px}
#mg aside{background:#fff;overflow:auto;padding:12px}#mL{border-right:1px solid #dfe7ee}#mR{border-left:1px solid #dfe7ee}
.sec{margin-bottom:18px}.sh{font-weight:700;color:#0b5f87;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
.sh button,.lk{background:#e8f4f8;border:0;color:#0b5f87;border-radius:8px;padding:4px 10px;font-weight:600}.lk{width:100%;margin:4px 0 8px;text-align:left}
.bt,.ut{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:9px;cursor:pointer}.ut{margin-left:14px;font-size:13px}.bt:hover,.ut:hover{background:#f1f6f9}.bt.on{font-weight:700}.ut.on{background:#e1f2f8;color:#0b5f87;font-weight:600}
.bt span,.ut span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ut small{color:#7a8d9c}
.ic2{font-style:normal;opacity:0;padding:0 3px;cursor:pointer}.bt:hover .ic2,.ut:hover .ic2{opacity:.7}.ic2:hover{opacity:1!important}
.drop{display:block;border:2px dashed #b9cad8;border-radius:12px;text-align:center;padding:14px 8px;color:#4b6073;cursor:pointer;margin-bottom:10px}.drop small{display:block;color:#8a9bab}.drop.over{background:#e8f4f8;border-color:#0f8fb0}
.th{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.t{position:relative;border:2px solid transparent;border-radius:8px;overflow:hidden;cursor:pointer;background:#e9eff4}.t img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block}.t.on{border-color:#0f8fb0}
.t span{position:absolute;left:3px;bottom:3px;background:#000b;color:#fff;font-size:11px;padding:0 5px;border-radius:5px}.t b{position:absolute;right:3px;top:3px;background:#0f8fb0;color:#fff;font-size:10px;padding:0 5px;border-radius:99px}
#mC{display:flex;flex-direction:column;min-width:0}
#mT{background:#fff;border-bottom:1px solid #dfe7ee;padding:8px 12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.tool{display:flex;flex-direction:column;align-items:center;min-width:74px;padding:5px 8px;border:1.5px solid #d5e0e9;background:#fff;border-radius:10px;line-height:1.15}.tool i{font-style:normal;font-size:18px}.tool small{font-size:11px;color:#5b7083}
.tool:hover{background:#f1f6f9}.tool.on{background:#0f8fb0;border-color:#0f8fb0;color:#fff}.tool.on small{color:#e3f5fa}
#hint{padding:6px 14px;background:#fff8e1;border-bottom:1px solid #f0e2b0;color:#7a5b00;font-size:13px}
#cvw{flex:1;min-height:0;overflow:auto;display:flex;padding:12px}#stg{position:relative;margin:auto;flex:none;background:#fff;box-shadow:0 6px 28px #0003}
#stg>img{width:100%;height:100%;display:block;user-select:none;-webkit-user-drag:none;pointer-events:none}#lay{position:absolute;inset:0}.t-select{cursor:default}#lay:not(.prev):not(.t-select){cursor:crosshair}
.e{position:absolute;border-radius:50%}.e .n{position:absolute;left:-2px;top:-2px;transform:translate(-30%,-65%);background:#0f8fb0;color:#fff;font-size:11px;font-weight:700;min-width:18px;text-align:center;border-radius:99px;padding:0 4px;pointer-events:none;z-index:3}
.ed-circle,.ed-video{border:3px dashed #e5173f;background:#e5173f14;cursor:move}.ed-video{border-color:#e8a200;background:#e8a20022;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#b57b00}
.ed-blank,.ed-note,.ed-audio{transform:translate(-50%,-50%);cursor:move;background:#ffb400;box-shadow:0 1px 5px #0006;display:flex;align-items:center;justify-content:center;white-space:nowrap}
.ed-blank{border-radius:99px;padding:1px 9px;min-height:calc(var(--u)*2.4);font:700 calc(var(--u)*1.8)/1.2 system-ui;color:#5a3a00}.ed-blank em{font-style:normal}
.ed-note{width:calc(var(--u)*3.2);height:calc(var(--u)*3.2);font-size:calc(var(--u)*1.8)}.ed-audio{width:5.5%;aspect-ratio:1;background:#e8c46acc;border:3px solid #c99a22;font-size:calc(var(--u)*2.4)}
.e.sel{outline:3px solid #1a73e8;outline-offset:2px;z-index:4}
.hd{position:absolute;width:12px;height:12px;background:#fff;border:2px solid #1a73e8;border-radius:3px}.hd.nw{left:-8px;top:-8px;cursor:nwse-resize}.hd.ne{right:-8px;top:-8px;cursor:nesw-resize}.hd.sw{left:-8px;bottom:-8px;cursor:nesw-resize}.hd.se{right:-8px;bottom:-8px;cursor:nwse-resize}
.dr{position:absolute;border:2px dashed #1a73e8;background:#1a73e822;pointer-events:none}
.f{display:block;margin:8px 0;font-weight:600;color:#35506a}.f input,.f textarea,.f select,#mg select{display:block;width:100%;margin-top:4px;padding:8px 10px;border:1px solid #c5d3df;border-radius:9px;font:inherit;font-weight:400;color:#12263a;background:#fff}
.row{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.mu{color:#6b7f8f;margin:6px 0}.tip{background:#eef7fb;border-radius:10px;padding:9px 11px;color:#35506a;font-size:12.5px}
.li{display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;cursor:pointer}.li:hover{background:#f1f6f9}.li b{background:#0f8fb0;color:#fff;border-radius:99px;min-width:20px;text-align:center;font-size:12px}.li small{color:#7a8d9c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:right}
.file{padding:8px 10px;background:#eef4f8;border-radius:9px}.file.none{color:#a05a00;background:#fff4de}.up{display:block;text-align:center;margin-top:8px;padding:9px;border:1.5px dashed #0f8fb0;color:#0b5f87;border-radius:9px;cursor:pointer;font-weight:600}
.empty{margin:auto;color:#6b7f8f;text-align:center}.card{margin:auto;background:#fff;border-radius:16px;padding:28px;width:min(420px,92vw);box-shadow:0 10px 40px #0002;text-align:center}.card input{display:block;width:100%;margin:8px 0;padding:11px;border:1px solid #c5d3df;border-radius:10px;font:inherit}.card .logo{font-size:40px}.er{color:#c63b3b;min-height:20px}.card ol{text-align:left;color:#35506a;padding-left:20px}
.mdl{position:fixed;inset:0;background:#0008;z-index:60;display:flex;align-items:center;justify-content:center}.mbox{background:#fff;border-radius:14px;padding:20px;width:min(380px,92vw)}.mbox h3{margin:0 0 8px;color:#0b5f87}.mbox .row{justify-content:flex-end}
`;
const style=document.createElement('style');style.textContent=CSS;document.head.appendChild(style);

/* ---------- GitHub storage ---------- */
const GH=()=>({Authorization:'Bearer '+G.t,Accept:'application/vnd.github+json'});
const GU=p=>`https://api.github.com/repos/${G.o}/${G.r}/contents/${p.split('/').map(encodeURIComponent).join('/')}`;
const errMsg=s=>s==401?'GitHub token is wrong or expired':s==403?'Token has no permission (needs Contents: Read and write)':s==404?'Repository not found (check owner / repo name / token access)':'GitHub error '+s;
async function ghMeta(p){const r=await fetch(GU(p)+'?ref='+G.b+'&t='+Date.now(),{headers:GH()});if(r.status==404)return null;if(!r.ok)throw new Error(errMsg(r.status));return r.json()}
async function ghPut(p,content,msg){const cur=await ghMeta(p);const r=await fetch(GU(p),{method:'PUT',headers:GH(),body:JSON.stringify({message:msg,content,branch:G.b,sha:cur&&cur.sha})});if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||errMsg(r.status))}}
async function ghRead(p){const r=await fetch(GU(p)+'?ref='+G.b+'&t='+Date.now(),{headers:{...GH(),Accept:'application/vnd.github.raw'}});if(!r.ok)throw new Error(errMsg(r.status));return r.text()}
function setSt(s,m){const e=$('#st');if(!e)return;e.className='pill '+s;e.textContent=m||({saved:'✓ Saved to GitHub',saving:'Saving…',dirty:'Unsaved changes…',error:'Error'})[s]}
const mark=()=>{dirty=true;setSt('dirty');clearTimeout(tm);tm=setTimeout(flush,1000)};
async function flush(){if(saving)return;saving=true;try{while(dirty){dirty=false;setSt('saving');await ghPut('data/library.json',b64(JSON.stringify(L,null,1)),'Update library')}setSt('saved')}catch(e){dirty=true;setSt('error','⚠ '+e.message)}saving=false}
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

/* ---------- dialogs ---------- */
function dlg(title,fields,ok,danger){return new Promise(res=>{const d=document.createElement('div');d.className='mdl';
 d.innerHTML=`<form class="mbox"><h3>${title}</h3>${fields.map(f=>f.html?`<p class="mu">${f.html}</p>`:`<label class="f">${f.label}<input name="${f.name}" value="${esc(f.value)}" ${f.num?'type="number"':''} autocomplete="off"></label>`).join('')}<div class="row"><button type="button" class="gh" id="dx">Cancel</button><button class="pr ${danger?'dg':''}">${ok||'OK'}</button></div></form>`;
 document.body.appendChild(d);const f=$('form',d),i=$('input',d);i&&i.focus();const end=v=>{d.remove();res(v)};
 $('#dx',d).onclick=()=>end(null);f.onsubmit=e=>{e.preventDefault();const o={};new FormData(f).forEach((v,k)=>o[k]=v);end(o)}})}

/* ---------- boot / login ---------- */
const loadSB=()=>window.supabase?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';s.onload=ok;s.onerror=()=>no(new Error('Could not load the login library (check internet)'));document.head.appendChild(s)});
const view=h=>{root.innerHTML=`<header><b>📚 Manager</b><span class="sp"></span><button class="gh" id="cl0">✕ Close</button></header><div style="flex:1;display:flex;overflow:auto;padding:16px">${h}</div>`;$('#cl0').onclick=close};
async function open(lib,cb){L=lib;onClose=cb;root=document.createElement('div');root.id='mg';document.body.appendChild(root);view('<div class="empty">Loading…</div>');
 try{if(!C.supabaseUrl||!C.supabaseKey)return view(`<div class="card"><div class="logo">⚙️</div><h2>One-time setup needed</h2><p class="mu">Open <b>config.js</b> in your GitHub repository and paste your Supabase URL and anon key, then reload this page.</p></div>`);
  await loadSB();sb=supabase.createClient(C.supabaseUrl,C.supabaseKey);const{data:{session}}=await sb.auth.getSession();session?after():login()}
 catch(e){view(`<div class="card"><h2>Something went wrong</h2><p class="er">${esc(e.message)}</p></div>`)}}
function login(msg=''){view(`<div class="card"><div class="logo">📚</div><h2>Teacher login</h2><p class="mu">Same email and password on any device.</p><form id="lf"><input name="e" type="email" placeholder="Email" required autocomplete="username"><input name="p" type="password" placeholder="Password" required autocomplete="current-password"><div class="er">${msg}</div><button class="pr" style="width:100%">Log in</button></form></div>`);
 $('#lf').onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target),r=await sb.auth.signInWithPassword({email:f.get('e'),password:f.get('p')});r.error?login(esc(r.error.message)):after()}}
async function after(){view('<div class="empty">Connecting…</div>');const r=await sb.from('settings').select('value').eq('key','gh_token').maybeSingle();
 if(r.error)return view(`<div class="card"><h2>Setup not finished</h2><p class="er">${esc(r.error.message)}</p><p class="mu">Run <b>supabase-setup.sql</b> in the Supabase SQL Editor.</p></div>`);
 if(!r.data)return tokenView();G.t=r.data.value;await loadLib()}
function tokenView(msg=''){view(`<div class="card"><div class="logo">🔑</div><h2>Connect GitHub</h2><p class="mu">Paste your GitHub token once. It is stored in your private login, so it works on every device.</p><form id="tf"><input name="o" placeholder="GitHub username" value="${esc(G.o)}"><input name="r" placeholder="Repository name" value="${esc(G.r)}"><input name="t" type="password" placeholder="github_pat_…" required><div class="er">${msg}</div><button class="pr" style="width:100%">Connect</button></form></div>`);
 $('#tf').onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target);G.o=f.get('o').trim();G.r=f.get('r').trim();G.t=f.get('t').trim();
  const x=await fetch(`https://api.github.com/repos/${G.o}/${G.r}`,{headers:GH()});if(!x.ok)return tokenView(esc(errMsg(x.status)));
  const u=await sb.from('settings').upsert({key:'gh_token',value:G.t});if(u.error)return tokenView(esc(u.error.message));await loadLib()}}
async function loadLib(){try{const t=await ghRead('data/library.json');L.books=JSON.parse(t).books}catch(e){if(/token|permission/i.test(e.message))return tokenView(esc(e.message));return view(`<div class="card"><h2>Could not load the library</h2><p class="er">${esc(e.message)}</p></div>`)}
 S.b=S.u=S.p=0;S.sel=-1;editor()}
async function close(){if(dirty)await flush();stopAu&&stopAu();root.remove();onClose&&onClose()}

/* ---------- editor ---------- */
function editor(){root.innerHTML=`<header><button class="gh" id="back">← Back to book</button><b>Manager</b><span class="bc" id="bc"></span><span class="sp"></span><span id="st" class="pill saved">✓ Saved to GitHub</span><button class="gh" id="tk" title="Change GitHub token">🔑</button><button class="gh" id="lo">Log out</button></header>
 <div class="body"><aside id="mL"></aside><main id="mC"><div id="mT"></div><div id="hint"></div><div id="cvw"></div></main><aside id="mR"></aside></div>`;
 $('#back').onclick=close;$('#tk').onclick=tokenView.bind(null,'');$('#lo').onclick=async()=>{await sb.auth.signOut();close()};
 $('#mL').onclick=treeClick;$('#mL').onchange=e=>{if(e.target.id=='pf'){uploadPages(e.target.files);e.target.value=''}};
 const mL=$('#mL');mL.ondragover=e=>{e.preventDefault();const d=$('#drop');d&&d.classList.add('over')};mL.ondragleave=()=>{const d=$('#drop');d&&d.classList.remove('over')};mL.ondrop=e=>{e.preventDefault();uploadPages(e.dataTransfer.files)};
 $('#mR').onclick=e=>{const li=e.target.closest('[data-s]');if(li){S.sel=+li.dataset.s;canvas();panel()}};
 removeEventListener('keydown',keys);addEventListener('keydown',keys);removeEventListener('resize',rsz);addEventListener('resize',rsz);full()}
function rsz(){root&&root.isConnected&&$('#cvw')&&canvas()}
const full=()=>{tree();tbar();canvas();panel();hdr()};
function hdr(){const e=$('#bc');if(e)e.textContent=`${BK()?BK().title:''}${UN()?' › Unit '+UN().num:''}${PG()?' › Page '+PG().label:''}`}
const sumry=x=>x.k=='audio'||x.k=='video'?(x.m||'no file').split('/').pop():(x.a||'').replace(/<[^>]+>/g,' ').slice(0,26);

function tree(){const b=BK(),u=UN();$('#mL').innerHTML=`<div class="sec"><div class="sh">Library <button id="addB">＋ Book</button></div>${L.books.map((x,bi)=>`<div class="bt ${bi==S.b?'on':''}" data-b="${bi}">📘<span>${esc(x.title)}</span><i class="ic2" data-ren="b${bi}">✎</i><i class="ic2" data-del="b${bi}">🗑</i></div>`+(bi==S.b?x.units.map((y,ui)=>`<div class="ut ${ui==S.u?'on':''}" data-u="${ui}"><span>Unit ${y.num} · ${esc(y.title)}</span><small>${y.pages.length}p</small><i class="ic2" data-ren="u${ui}">✎</i><i class="ic2" data-del="u${ui}">🗑</i></div>`).join('')+'<button class="lk" id="addU">＋ Add unit</button>':'')).join('')||'<p class="mu">No books yet. Add your first book.</p>'}</div>
 ${u?`<div class="sec"><div class="sh">Pages · Unit ${u.num}</div><label class="drop" id="drop"><input type="file" id="pf" multiple accept="image/*" hidden>⬆ Drop page images here<br>or click to choose<small>Name files like p94.jpg</small></label><div class="th">${u.pages.map((p,i)=>`<div class="t ${i==S.p?'on':''}" data-p="${i}"><img loading="lazy" src="${esc(src(p))}" alt=""><span>${esc(p.label)}</span>${p.hs.length?`<b>${p.hs.length}</b>`:''}</div>`).join('')}</div></div>`:''}`}
async function treeClick(e){const t=e.target,rn=t.closest('[data-ren]'),dl=t.closest('[data-del]');
 if(t.closest('#addB')){const v=await dlg('New book',[{label:'Book title',name:'t',value:''}],'Add');if(v&&v.t.trim()){L.books.push({title:v.t.trim(),units:[]});S.b=L.books.length-1;S.u=S.p=0;S.sel=-1;full();mark()}return}
 if(t.closest('#addU')){const v=await dlg('New unit',[{label:'Unit number',name:'n',value:'',num:1},{label:'Unit title',name:'t',value:''}],'Add');if(v&&+v.n&&v.t.trim()){const b=BK();b.units.push({num:+v.n,title:v.t.trim(),pages:[]});b.units.sort((x,y)=>x.num-y.num);S.u=b.units.findIndex(x=>x.num==+v.n);S.p=0;S.sel=-1;full();mark()}return}
 if(rn||dl){const s=(rn||dl).dataset.ren||(rn||dl).dataset.del,k=s[0],i=+s.slice(1);if(k=='b')S.b=i;else S.u=i;
  if(rn){if(k=='b'){const v=await dlg('Rename book',[{label:'Title',name:'t',value:BK().title}],'Save');if(v&&v.t.trim()){BK().title=v.t.trim();full();mark()}}
   else{const u=UN(),v=await dlg('Edit unit',[{label:'Number',name:'n',value:u.num,num:1},{label:'Title',name:'t',value:u.title}],'Save');if(v&&+v.n&&v.t.trim()){u.num=+v.n;u.title=v.t.trim();BK().units.sort((x,y)=>x.num-y.num);S.u=BK().units.indexOf(u);full();mark()}}}
  else{const name=k=='b'?BK().title:'Unit '+UN().num,v=await dlg('Delete?',[{html:`Delete <b>${esc(name)}</b> with all its pages and buttons? (Files stay in GitHub.)`}],'Delete',1);
   if(v){if(k=='b'){L.books.splice(S.b,1);S.b=0}else{BK().units.splice(S.u,1);S.u=0}S.p=0;S.sel=-1;full();mark()}}
  return}
 const th=t.closest('[data-p]');if(th){S.p=+th.dataset.p;S.sel=-1;full();return}
 const ut=t.closest('[data-u]');if(ut){S.u=+ut.dataset.u;S.p=0;S.sel=-1;full();return}
 const bt=t.closest('[data-b]');if(bt){S.b=+bt.dataset.b;S.u=S.p=0;S.sel=-1;full()}}
async function uploadPages(files){const u=UN();if(!u)return alert('Add a unit first');const fl=[...files].filter(f=>f.type.startsWith('image/'));let n=0;
 for(const f of fl){setSt('saving',`Uploading ${++n}/${fl.length}…`);const lab=f.name.replace(/\D/g,'')||f.name.replace(/\.\w+$/,''),path=`books/${slug(BK().title)}/u${u.num}/p${lab}.${f.name.split('.').pop().toLowerCase()}`,d=await fb(f);PREV[path]=d;
  try{await ghPut(path,d.split(',')[1],'Add page '+lab)}catch(e){return setSt('error','⚠ '+e.message)}
  const ex=u.pages.find(p=>p.label==lab);ex?ex.url=path:u.pages.push({label:lab,url:path,hs:[]})}
 u.pages.sort((a,b)=>(+a.label||999)-(+b.label||999));full();mark()}

function tbar(){const T=[['select','↖','Select'],...Object.entries(KINDS).map(([k,v])=>[k,v.i,v.n])];
 $('#mT').innerHTML=T.map(([k,i,n])=>`<button class="tool ${S.tool==k&&!S.prev?'on':''}" data-t="${k}"><i>${i}</i><small>${n}</small></button>`).join('')+`<span class="sp" style="flex:1"></span><button class="gh" id="un">↶ Undo</button><button class="gh" id="zo">−</button><small>${Math.round(S.zoom*100)}%</small><button class="gh" id="zi">+</button><button class="tool ${S.prev?'on':''}" id="pvb"><i>▶</i><small>Preview</small></button>`;
 $$('[data-t]',$('#mT')).forEach(b=>b.onclick=()=>{S.tool=b.dataset.t;S.prev=false;stopAu();tbar();canvas()});
 $('#un').onclick=undo;$('#zo').onclick=()=>{S.zoom=Math.max(.6,S.zoom-.2);tbar();canvas()};$('#zi').onclick=()=>{S.zoom=Math.min(2.6,S.zoom+.2);tbar();canvas()};
 $('#pvb').onclick=()=>{S.prev=!S.prev;if(!S.prev)stopAu();tbar();canvas()};
 $('#hint').textContent=S.prev?'Preview: click the buttons exactly like the students will see them.':S.tool=='select'?'Click a button to edit it, drag to move it, drag its corners to resize. Pick a tool above to add a new button.':KINDS[S.tool].h}
function canvas(){const w=$('#cvw'),p=PG();if(!p){w.innerHTML='<div class="empty"><div style="font-size:42px">📄</div>Choose or upload a page on the left.</div>';return}
 const H=Math.min(w.clientHeight-26,(w.clientWidth-26)/.8)*S.zoom;
 w.innerHTML=`<div id="stg" style="height:${H}px;width:${H*.8}px;--u:${H/100}px"><img src="${esc(src(p))}" alt=""><div id="lay" class="t-${S.tool}${S.prev?' prev':''}"></div></div>`;
 const lay=$('#lay');if(S.prev)return p.hs.forEach(h=>lay.appendChild(mk(h)));
 p.hs.forEach((h,i)=>lay.appendChild(node(h,i)));lay.onpointerdown=lpd;hdr()}
function node(h,i){const d=document.createElement('div'),bx=KINDS[h.k].box;d.className=`e ed-${h.k}${i==S.sel?' sel':''}`;d.dataset.i=i;d.style.left=h.x+'%';d.style.top=h.y+'%';if(bx){d.style.width=h.w+'%';d.style.height=h.h+'%'}
 d.innerHTML=`<span class="n">${i+1}</span>`+(h.k=='blank'?`<em>${esc(h.a||'?')}</em>`:h.k=='note'?'💬':h.k=='audio'?'🎧':h.k=='video'?'▶':'')+(bx&&i==S.sel?['nw','ne','sw','se'].map(c=>`<i class="hd ${c}" data-h="${c}"></i>`).join(''):'');return d}

/* ---------- history ---------- */
const snap=()=>{const p=PG();if(p){hist.push({p,j:JSON.stringify(p.hs)});if(hist.length>40)hist.shift()}};
function undo(){const h=hist.pop();if(!h)return;h.p.hs=JSON.parse(h.j);S.sel=-1;canvas();panel();tree();mark()}

/* ---------- canvas interaction ---------- */
function lpd(e){const R=$('#stg').getBoundingClientRect(),pt=ev=>[(ev.clientX-R.left)/R.width*100,(ev.clientY-R.top)/R.height*100],[x0,y0]=pt(e);
 const nd=e.target.closest('.e'),hd=e.target.closest('.hd');
 if(S.tool=='select'){if(!nd){S.sel=-1;canvas();panel();return}
  const i=+nd.dataset.i;if(S.sel!=i){S.sel=i;canvas();panel()}
  const h=HS()[i],o={...h},mode=hd?hd.dataset.h:'move',before=JSON.stringify(HS());let moved=false;
  const mv=ev=>{const[x,y]=pt(ev),dx=x-x0,dy=y-y0;if(!moved){if(Math.abs(dx)+Math.abs(dy)<.3)return;moved=true;hist.push({p:PG(),j:before})}
   if(mode=='move'){const bx=KINDS[h.k].box;h.x=r2(clamp(o.x+dx,0,bx?100-h.w:100));h.y=r2(clamp(o.y+dy,0,bx?100-h.h:100))}
   else{let X=o.x,Y=o.y,W=o.w,Hh=o.h;if(mode.includes('w')){X=o.x+dx;W=o.w-dx}if(mode.includes('e'))W=o.w+dx;if(mode.includes('n')){Y=o.y+dy;Hh=o.h-dy}if(mode.includes('s'))Hh=o.h+dy;
    if(W<2){W=2;X=mode.includes('w')?o.x+o.w-2:X}if(Hh<1.5){Hh=1.5;Y=mode.includes('n')?o.y+o.h-1.5:Y}h.x=r2(X);h.y=r2(Y);h.w=r2(W);h.h=r2(Hh)}
   const n=$(`.e[data-i="${i}"]`);if(n){n.style.left=h.x+'%';n.style.top=h.y+'%';if(KINDS[h.k].box){n.style.width=h.w+'%';n.style.height=h.h+'%'}}};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(moved)mark()};addEventListener('pointermove',mv);addEventListener('pointerup',up);return}
 const k=S.tool,bx=KINDS[k].box,dr=document.createElement('div');dr.className='dr';$('#lay').appendChild(dr);
 const mv=ev=>{if(!bx)return;const[x,y]=pt(ev);dr.style.cssText=`left:${Math.min(x0,x)}%;top:${Math.min(y0,y)}%;width:${Math.abs(x-x0)}%;height:${Math.abs(y-y0)}%`};
 const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);dr.remove();const[x,y]=pt(ev);let h;
  if(bx){let w=Math.abs(x-x0),hh=Math.abs(y-y0),lx=Math.min(x0,x),ly=Math.min(y0,y);if(w<2||hh<1.5){w=16;hh=4;lx=x0-w/2;ly=y0-hh/2}h={k,x:r2(clamp(lx,0,100-w)),y:r2(clamp(ly,0,100-hh)),w:r2(w),h:r2(hh),a:null,m:null}}
  else h={k,x:r2(x0),y:r2(y0),w:0,h:0,a:null,m:null};
  snap();PG().hs.push(h);S.sel=HS().length-1;S.tool='select';tbar();canvas();panel();tree();mark();const f=$('#ia');f&&f.focus()};
 addEventListener('pointermove',mv);addEventListener('pointerup',up)}

function keys(e){if(!root.isConnected||!$('#cvw'))return;const t=e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(t))return;
 if((e.ctrlKey||e.metaKey)&&e.key=='z'){e.preventDefault();return undo()}
 if(e.key=='Escape'){S.tool='select';S.sel=-1;tbar();canvas();panel();return}
 const h=HS()[S.sel];if(!h||S.prev)return;
 if(e.key=='Delete'||e.key=='Backspace'){e.preventDefault();return delSel()}
 const st=e.shiftKey?1:.2,d={ArrowLeft:[-st,0],ArrowRight:[st,0],ArrowUp:[0,-st],ArrowDown:[0,st]}[e.key];
 if(d){e.preventDefault();snap();h.x=r2(clamp(h.x+d[0],0,100));h.y=r2(clamp(h.y+d[1],0,100));canvas();mark()}}
function delSel(){snap();HS().splice(S.sel,1);S.sel=-1;canvas();panel();tree();mark()}

/* ---------- inspector ---------- */
const mediaList=k=>[...new Set(L.books.flatMap(b=>b.units.flatMap(u=>u.pages.flatMap(p=>p.hs.filter(h=>h.k==k&&h.m&&!/youtu/.test(h.m)).map(h=>h.m)))))];
function panel(){const a=$('#mR'),p=PG();if(!p){a.innerHTML='';return}const h=HS()[S.sel];
 if(!h){a.innerHTML=`<div class="sec"><div class="sh">Page ${esc(p.label)}</div><label class="f">Page label<input id="plab" value="${esc(p.label)}"></label><div class="row"><button class="gh" id="pmL">◀ Earlier</button><button class="gh" id="pmR">Later ▶</button><button class="gh dg" id="pdel">Delete page</button></div></div>
  <div class="sec"><div class="sh">Buttons on this page (${p.hs.length})</div>${p.hs.map((x,i)=>`<div class="li" data-s="${i}"><b>${i+1}</b><span>${KINDS[x.k].i} ${KINDS[x.k].n}</span><small>${esc(sumry(x))}</small></div>`).join('')||'<p class="mu">Nothing yet. Pick a tool above, then click or drag on the page.</p>'}</div>
  <div class="tip"><b>How it works:</b> choose a tool, then click (or drag) on the page. The new button is selected so you can type its answer here on the right. Use <b>Select</b> to move or fix any button.</div>`;
  $('#plab').onchange=e=>{p.label=e.target.value.trim()||p.label;full();mark()};
  const mvp=d=>{const u=UN(),j=S.p+d;if(j<0||j>=u.pages.length)return;[u.pages[S.p],u.pages[j]]=[u.pages[j],u.pages[S.p]];S.p=j;full();mark()};$('#pmL').onclick=()=>mvp(-1);$('#pmR').onclick=()=>mvp(1);
  $('#pdel').onclick=async()=>{const v=await dlg('Delete page?',[{html:`Delete page <b>${esc(p.label)}</b> and its ${p.hs.length} buttons?`}],'Delete',1);if(v){UN().pages.splice(S.p,1);S.p=0;S.sel=-1;full();mark()}};return}
 const k=h.k,K=KINDS[k];
 a.innerHTML=`<div class="sec"><div class="sh">Button ${S.sel+1} · ${K.n}</div><label class="f">Type<select id="ik">${Object.entries(KINDS).map(([v,x])=>`<option value="${v}" ${v==k?'selected':''}>${x.i} ${x.n}</option>`).join('')}</select></label>
  ${k=='circle'?'<p class="mu">A red circle appears around this spot when you click it in class. No text needed — drag the corners to fit the option.</p>':''}
  ${k=='blank'?`<label class="f">Word shown on the blank<input id="ia" value="${esc(h.a||'')}" placeholder="e.g. wears"></label>`:''}
  ${k=='note'?`<label class="f">Answer (shown in a bubble)<textarea id="ia" rows="6" placeholder="Type the full answer…">${esc(h.a||'')}</textarea></label><p class="mu">Tip: use &lt;br&gt; for a new line.</p>`:''}
  ${k=='audio'||k=='video'?media(h):''}
  <div class="row"><button class="gh" id="idup">⎘ Duplicate</button><button class="gh dg" id="idel">🗑 Delete</button></div></div><div class="tip">Drag on the page to move · arrow keys nudge · Delete removes · Ctrl+Z undoes</div>`;
 $('#ik').onchange=e=>{snap();const nk=e.target.value,ob=KINDS[h.k].box,nb=KINDS[nk].box;if(!ob&&nb){h.w=14;h.h=4;h.x=r2(clamp(h.x-7,0,86));h.y=r2(clamp(h.y-2,0,96))}else if(ob&&!nb){h.x=r2(h.x+h.w/2);h.y=r2(h.y+h.h/2);h.w=h.h=0}h.k=nk;if(nk!='audio'&&nk!='video')h.m=null;canvas();panel();mark()};
 const ia=$('#ia');if(ia){ia.onfocus=snap;ia.oninput=()=>{h.a=ia.value;const em=$('.e.sel em');em&&(em.textContent=h.a||'?');mark()}}
 $('#idel').onclick=delSel;$('#idup').onclick=()=>{snap();PG().hs.push({...h,x:r2(Math.min(100,h.x+2)),y:r2(Math.min(100,h.y+2))});S.sel=HS().length-1;canvas();panel();mark()};
 const ex=$('#imex');ex&&(ex.onchange=e=>{if(e.target.value){snap();h.m=e.target.value;panel();canvas();mark()}});
 const yt=$('#iyt');yt&&(yt.onchange=e=>{snap();h.m=e.target.value.trim()||null;panel();mark()});
 const tt=$('#itest');tt&&(tt.onclick=()=>{if(!h.m)return alert('No audio file yet');const x=new Audio(PREV[h.m]||h.m);x.play().catch(()=>alert('Audio file not found yet (it may take 1–2 minutes after upload).'))});
 const mf=$('#imf');mf&&(mf.onchange=async e=>{const f=e.target.files[0];if(!f)return;const path=(k=='audio'?'audio/':'video/')+safe(f.name);setSt('saving','Uploading '+f.name+'…');const d=await fb(f);PREV[path]=d;
  try{await ghPut(path,d.split(',')[1],'Add '+k+' '+f.name)}catch(er){return setSt('error','⚠ '+er.message)}snap();h.m=path;panel();mark()})}
function media(h){const k=h.k,l=mediaList(k);return `<div class="f">File</div>${h.m?`<div class="file">${k=='audio'?'🎧':'🎬'} ${esc(h.m.split('/').pop())}</div>`:'<div class="file none">No file yet — upload one below</div>'}
 ${l.length?`<select id="imex"><option value="">Use a file already in the library…</option>${l.map(m=>`<option value="${esc(m)}">${esc(m.split('/').pop())}</option>`).join('')}</select>`:''}
 <label class="up">⬆ Upload ${k} file<input type="file" id="imf" hidden accept="${k}/*"></label>
 ${k=='video'?`<label class="f">…or paste a YouTube link<input id="iyt" value="${/youtu/.test(h.m||'')?esc(h.m):''}" placeholder="https://youtu.be/…"></label>`:'<div class="row"><button class="gh" id="itest">▶ Test sound</button></div>'}`}
window.Manager={open};
})();
