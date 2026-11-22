/* ---------- languages: English, or German for Vienna ----------
   The player picks English or Deutsch in the More menu (kept as ns3d-lang). German is Vienna's: while Vienna is played in German,
   every text the page shows is looked up in the German table (i18n-de.js, window.I18N_DE) as it is written into the page, and the
   passers-by speak German (voices-de, the same file names as voices: a hash of the line). New York stays English.
   The game's own code goes on writing English: the page's textContent and innerHTML are translated on the way in, and a text read
   back gives the English that was written, so the code that compares its own labels still sees them.
   The table: exact English text (as written in the code, leading emoji and trailing stops aside) to German; a key with ${} is a
   pattern whose parts ({1}, {2}… in the German) are translated in turn. Building names and descriptions go by building key. */
(function(){
const LS='ns3d-lang',DE=window.I18N_DE||{};
let lang='en';try{if(localStorage.getItem(LS)==='de')lang='de'}catch(e){}
let city='nyc1865';try{city=typeof lastCity==='function'?lastCity():city}catch(e){}
let ON=false,FORCE=false;
const isOn=()=>ON||FORCE;

/* ---------- the table ---------- */
const EX=new Map(),LC=new Map(),PAT=[],PIDX=new Map(),POPEN=[],CACHE=new Map(),MISS=new Set();
/* a text's frame: emoji, marks and stops before and after its words stay as they are, the words between are looked up */
const PRE=/^[^\p{L}\p{N}$<{]*/u,POST=/[\s.,;:!?…·"'“”‘’»«]*$/u;
function split3(s){const p=PRE.exec(s)[0];let c=s.slice(p.length);const x=POST.exec(c)[0];c=c.slice(0,c.length-x.length);return[p,c,x]}
const core=s=>split3(String(s).replace(/\s+/g,' ').trim())[1];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function addPat(en,de){const parts=en.split('${}');if(parts.length<2)return;const lit=parts.join('').replace(/[^\p{L}]/gu,'');if(lit.length<3&&!(lit.length===2&&(/^\p{L}{2} $/u.test(parts[0])||parts.some(x=>x.replace(/\s/g,'').length>=3))))return;
 const re=new RegExp('^'+parts.map(esc).join('(.*?)')+'$','s'),p={re,de,n:parts.length-1,lead:parts[0].slice(0,3).toLowerCase(),w:parts.join('').length};PAT.push(p);
 if(p.lead.length===3){let l=PIDX.get(p.lead);if(!l)PIDX.set(p.lead,l=[]);l.push(p)}else POPEN.push(p)}
function load(t){for(const en in t){const de=t[en];if(typeof de!=='string'||!de)continue;const ce=core(en),cd=core(de)||de;if(!ce)continue;
 if(ce.includes('${}'))addPat(ce,cd);else{EX.set(ce,cd);if(ce.length<48)LC.set(ce.toLowerCase(),cd)}}}
load(DE.t||{});
/* the most particular pattern first: "Not enough ${}: ${} needed" before "Not enough ${}" */
for(const l of[...PIDX.values(),POPEN])l.sort((a,b)=>b.w-a.w);
/* the German names written small in a sentence ("Place the brauerei") come back with their capital */
for(const k in DE.names||{}){const n=DE.names[k][0];if(n)LC.set(n.toLowerCase(),n)}
/* a pattern: the parts it caught translated too (a building's name, a street, a good), then put into the German. A part that is
   still English prose afterwards means the pattern caught more than its own words (a sentence that follows it), and is passed over */
const PROSE=/(?<!\p{L})[a-z]{3,}(?!\p{L})/u;
function pat(c,depth){const l=PIDX.get(c.slice(0,3).toLowerCase()),tryL=a=>{if(!a)return null;
  next:for(const p of a){const m=p.re.exec(c);if(!m)continue;const g=[];for(let i=1;i<m.length;i++){const v=part(m[i],depth);if(v===m[i]&&PROSE.test(v.replace(/<[^>]*>/g,''))&&!DEW.test(v))continue next;g[i]=v}
   return p.de.replace(/\{(\d)\}/g,(_,i)=>g[+i]??'')}return null};
 return tryL(l)??tryL(POPEN)}
/* a part caught by a pattern: as it stands, with its first letter turned (a sentence's start, a name in the middle), or its article
   dropped; German nouns keep their capital */
function part(g,depth){if(depth>2||!/\p{L}/u.test(g))return g;const[p,c,x]=split3(g);if(!c)return g;const f=c[0],flip=(f===f.toLowerCase()?f.toUpperCase():f.toLowerCase())+c.slice(1);
 let v=EX.get(c)??LC.get(c.toLowerCase())??(/^(a|an|the) /i.test(c)?LC.get(c.replace(/^(a|an|the) /i,'').toLowerCase()):null)??pat(c,depth+1);
 if(v==null){v=EX.get(flip)??pat(flip,depth+1);if(v!=null&&f!==f.toLowerCase())v=v[0].toUpperCase()+v.slice(1)}return v==null?g:p+v+x}
function look(c,depth){const v=EX.get(c)??pat(c,depth||0);if(v!=null)return v;
 /* a name in bold before a petition's words: the bold kept */
 const m=/^<(b|i|em|strong)>([^<]+)<\/\1>$/.exec(c);if(m){const w=look(m[2],depth);if(w!=null)return`<${m[1]}>${w}</${m[1]}>`}return null}
/* German already (a name the game writes, a text translated before), or no English words at all (a name, a sum) */
const DEW=/[äöüßÄÖÜ„“]|\b(und|der|die|das|nicht|mit|von|ist|sind|Euer|Eure|Ihr)\b/;
const known=s=>DEW.test(s)||!/\b[a-z]{3,}\b/.test(s.replace(/\b(fl|K)\b/g,''));
/* a text the table has not got whole (a date before a description, two texts in one line, a list of needs): cut into parts, its
   sentences or the items of a list, and those into the longest runs the table knows; only when every part with English words is in one */
function seg(ts,inner){const out=[];
 for(let i=0;i<ts.length;){let hit=null;
  for(let j=ts.length-1;j>=i&&!hit;j-=2){const s=ts.slice(i,j+1).join(''),[p,c,x]=split3(s);if(!c){hit=[s,j];break}
   const v=look(c);if(v!=null)hit=[p+v+x,j];else if(j===i){const w=inner&&inner(c);if(w!=null)hit=[p+w+x,j];else if(known(s))hit=[s,j]}}
  if(!hit)return null;out.push(hit[0]);if(hit[1]+1<ts.length)out.push(ts[hit[1]+1]);i=hit[1]+2}return out.join('')}
function sentences(c){const ts=c.split(/((?<=[.!?:])\s+)(?=\S)/);return ts.length<3||ts.length>25?null:seg(ts,pieces)}
function pieces(c){const ts=c.split(/( · |, )/);return ts.length<3||ts.length>25?null:seg(ts,null)}
function tr(s){if(typeof s!=='string'||!isOn()||!s)return s;let r=CACHE.get(s);if(r!==undefined)return r;r=tr1(s);if(CACHE.size>6000)CACHE.clear();CACHE.set(s,r);return r}
function tr1(s){if(!/\p{L}{2}/u.test(s))return s;const a=s.search(/\S/),t=s.trim(),wl=s.slice(0,a),wr=s.slice(a+t.length),n=t.replace(/\s+/g,' ');
 const[p,c,x]=split3(n);if(!c)return s;let v=EX.get(c);if(v!=null)return wl+p+v+x+wr;
 v=sentences(c);if(v!=null)return wl+p+v+x+wr;
 v=pat(c,0);if(v!=null)return wl+p+v+x+wr;if(p||x){v=pat(n,0);if(v!=null)return wl+v+wr}
 v=pieces(c);if(v!=null)return wl+p+v+x+wr;
 {const m=/^(.*?\p{L}.*?)( \(.*\)?)$/u.exec(c+x);if(m){const h=look(m[1]);if(h!=null)return wl+p+h+(/\p{L}{2}/u.test(m[2])?' ('+tr(m[2].slice(2,m[2].endsWith(')')?-1:undefined))+')':m[2])+wr}}
 const lc=c.length<48&&LC.get(c.toLowerCase());if(lc)return wl+p+lc+x+wr;
 if(MISS.size<3000&&c.length>2&&/[a-z]{2}/.test(c)&&!DEW.test(c))MISS.add(c);return s}
/* numbers and months the German way: 1,500 → 1.500, 2.5 → 2,5, Mar 1866 → Mär 1866 */
const MON={Jan:'Jan.',Feb:'Feb.',Mar:'März',Apr:'Apr.',May:'Mai',Jun:'Juni',Jul:'Juli',Aug:'Aug.',Sep:'Sept.',Oct:'Okt.',Nov:'Nov.',Dec:'Dez.'};
/* a sum the game writes in dollars in Vienna too (a fare, a few old lines) is given in the city's own money */
const cur=n=>{const v=+n.replace(/,/g,'');try{return typeof money==='function'?money(v,1):v+' fl.'}catch(e){return v+' fl.'}};
function post(s){if(!/\d/.test(s))return s;if(s.includes('$'))s=s.replace(/\$\s?(\d[\d,]*)/g,(m,n)=>cur(n)).replace(/(\d[\d,]*)\s?\$/g,(m,n)=>cur(n));return s.replace(/\b(\d+)(?:\.(\d+))?([kM])(?![\w])/g,(m,a,b,u)=>a+(b?','+b:'')+(u==='M'?' Mio.':' Tsd.')).replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+\.\d+\b/g,n=>n.replace(/[.,]/g,c=>c===','?'.':',')).replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})\b/g,(m,a,y)=>MON[a]+' '+y)
 .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b/g,(m,a,y)=>MONL[a]+' '+y)
 /* "by" before a date is a deadline ("bis"), never a place ("bei") */
 .replace(/\bbei (?=(Jan\.|Feb\.|März|Apr\.|Mai|Juni|Juli|Aug\.|Sept\.|Okt\.|Nov\.|Dez\.|Jänner|Februar|April|August|September|Oktober|November|Dezember) \d{4})/g,'bis ')}
const MONL={January:'Jänner',February:'Februar',March:'März',April:'April',May:'Mai',June:'Juni',July:'Juli',August:'August',September:'September',October:'Oktober',November:'November',December:'Dezember'};
const trText=s=>post(tr(s));
/* an HTML string: each run of text (with its bold and italics) between the other tags is one text */
const INL=/^<\/?(b|i|em|strong|small|br|u|sup|sub)\b[^>]*>$/i,RAW=/^<(style|script|textarea)\b/i;
function trHTML(h){if(typeof h!=='string'||!/[A-Za-z]{2}/.test(h))return h;const tk=h.split(/(<[^>]*>)/);let out='',run=[],raw=null;
 const flush=()=>{if(!run.length)return;out+=trRun(run);run=[]};
 for(let i=0;i<tk.length;i++){const x=tk[i];if(raw){out+=x;if(i%2&&new RegExp('^</'+raw,'i').test(x))raw=null;continue}
  if(i%2===0){if(x)run.push(x);continue}if(INL.test(x)){run.push(x);continue}flush();const m=RAW.exec(x);if(m)raw=m[1];out+=trTag(x)}
 flush();return out}
/* a run the table has not got whole: line by line between its line breaks, then text by text */
function trRun(run){const s=run.join('');if(!/\p{L}{2}/u.test(s))return postH(s);const v=tr(s);if(run.length<2)return postH(v);if(v!==s&&!ENG(v))return postH(v);
 let w;if(run.some(x=>/^<br\b/i.test(x))){let o='',sg=[];for(const x of run){if(/^<br\b/i.test(x)){o+=trRun(sg)+x;sg=[]}else sg.push(x)}w=o+trRun(sg)}
 else w=run.map(x=>x[0]==='<'?x:post(tr(x))).join('');return ENG(w)<=ENG(v)||v===s?w:postH(v)}
/* how English a text still is: its little English words */
const ENG=s=>(s.replace(/<[^>]*>/g,' ').match(/\b(the|and|your|you|of|with|is|are|to|for|an|on|in)\b/g)||[]).length;
/* numbers the German way in the text of a run, never inside its tags (a width in a style) */
const postH=s=>s.includes('<')?s.split(/(<[^>]*>)/).map((x,i)=>i%2?x:post(x)).join(''):post(s);
const trTag=x=>/placeholder="/.test(x)?x.replace(/placeholder="([^"]*)"/,(m,v)=>`placeholder="${tr(v)}"`):x;

/* ---------- the page's edge ---------- */
/* in New York the crown that marks standing (👑) is the Mayor's top hat (🎩): changed as any text is written, as the German is */
const HAT=v=>city==='nyc1865'&&typeof v==='string'&&v.includes('👑')?v.replace(/👑/g,'🎩'):v;
const own=(p,k)=>{for(;p;p=Object.getPrototypeOf(p)){const d=Object.getOwnPropertyDescriptor(p,k);if(d)return[p,d]}return null};
const PAGE=typeof document!=='undefined'&&typeof Node!=='undefined',NT=PAGE?own(Node.prototype,'textContent'):null,IH=PAGE?own(Element.prototype,'innerHTML'):null,IAH=PAGE?Element.prototype.insertAdjacentHTML:null;
const SKIP='#devSheet,#devBtn,[translate="no"]',SKT=/^(STYLE|SCRIPT|TEXTAREA|CANVAS)$/;
const skip=el=>SKT.test(el.tagName)||!!(el.closest&&el.closest(SKIP));
/* what was written in English, for reading back: element → [English, German] */
const SH=new WeakMap(),SHL=new Set(),EH=new Map();let REV=null;
function shadow(el,en,de){SH.set(el,[en,de]);SHL.add(el);if(SHL.size>600)for(const e of SHL){if(!e.isConnected){SHL.delete(e);SH.delete(e)}if(SHL.size<400)break}}
function rev(t){if(!REV){REV=new Map();for(const[en,de]of EX)if(de.length<40&&!REV.has(de))REV.set(de,en)}const[p,c,x]=split3(t.trim());const e=REV.get(c);return e==null?null:p+e+x}
if(NT&&IH){
 Object.defineProperty(NT[0],'textContent',{configurable:true,enumerable:NT[1].enumerable,
  get(){const v=NT[1].get.call(this);if(SHL.size){const s=SH.get(this);if(s&&s[1]===v)return s[0]}if(ON&&this.tagName==='BUTTON'&&v){const e=rev(v);if(e!=null)return e}return v},
  set(v){v=HAT(v);if(ON&&this.nodeType===1&&v!=null&&v!==''&&!skip(this)){const en=String(v),de=trText(en);if(de!==en){NT[1].set.call(this,de);shadow(this,en,de);return}}
   if(SHL.size)SH.delete(this);NT[1].set.call(this,v)}});
 Object.defineProperty(IH[0],'innerHTML',{configurable:true,enumerable:IH[1].enumerable,get(){return IH[1].get.call(this)},
  set(v){v=HAT(v);if(SHL.size)SH.delete(this);if(EH.size)EH.delete(this);if(ON&&v&&!skip(this)){const en=String(v),de=trHTML(en);IH[1].set.call(this,de);
   /* a small piece of markup with nothing to press in it (a tab's label) can be put back in English as it was */
   if(de!==en&&de.length<400&&!/<(button|input|select|textarea|a)\b|\bid=|data-/i.test(de)){EH.set(this,[en,IH[1].get.call(this)]);if(EH.size>300)for(const e of EH.keys()){if(!e.isConnected)EH.delete(e);if(EH.size<200)break}}return}
   IH[1].set.call(this,v)}});
 Element.prototype.insertAdjacentHTML=function(w,h){h=HAT(h);return IAH.call(this,w,ON&&!skip(this)?trHTML(String(h)):h)}
 /* the captions written onto a photograph (a canvas), measured and drawn in the same language */
 if(typeof CanvasRenderingContext2D!=='undefined'){const C=CanvasRenderingContext2D.prototype,FT=C.fillText,MT=C.measureText;
  C.fillText=function(t,...a){t=HAT(t);return FT.call(this,ON&&typeof t==='string'?trText(t):t,...a)};C.measureText=function(t){return MT.call(this,ON&&typeof t==='string'?trText(t):t)}}}

/* the page as it stands: its fixed texts (tabs, menus, the loading screen) translated in place, and put back for English */
const STAT=new Map();
function walkText(on){const root=PAGE&&document.body;if(!root)return;const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 for(let n=tw.nextNode();n;n=tw.nextNode()){const p=n.parentElement;if(!p||SKT.test(p.tagName)||p.closest('svg,'+SKIP))continue;
  if(on){const d=n.data;if(!/\p{L}{2}/u.test(d))continue;const g=STAT.get(n);if(g&&g[1]===d)continue;const de=trText(d);if(de!==d)STAT.set(n,[d,de])
   ;if(de!==d)n.data=de}
  else{const g=STAT.get(n);if(g&&n.data===g[1])n.data=g[0]}}
 for(const el of document.querySelectorAll('[placeholder]')){if(on){const v=el.getAttribute('placeholder'),de=tr(v);if(de!==v){el.dataset.phEn=v;el.setAttribute('placeholder',de)}}else if(el.dataset.phEn){el.setAttribute('placeholder',el.dataset.phEn);delete el.dataset.phEn}}
 if(!on){for(const[el,[en,de]]of EH)if(el.isConnected&&IH[1].get.call(el)===de)IH[1].set.call(el,en);EH.clear();STAT.clear();for(const el of SHL){const s=SH.get(el);if(s&&el.isConnected&&NT[1].get.call(el)===s[1])NT[1].set.call(el,s[0])}SHL.clear()}}

/* the buildings' names and descriptions, and the classes' names, by key */
let BEN=null;
function names(on){try{if(on){if(BEN)names(false);const N=DE.names||{};BEN={b:{},lv:LV.map(l=>l&&l.n)};for(const k in N)if(B[k]){BEN.b[k]=[B[k].n,B[k].d];if(N[k][0])B[k].n=N[k][0];if(N[k][1])B[k].d=N[k][1]}
   (DE.lv||[]).forEach((n,k)=>{if(n&&LV[k])LV[k].n=n})}
  else if(BEN){for(const k in BEN.b){B[k].n=BEN.b[k][0];B[k].d=BEN.b[k][1]}BEN.lv.forEach((n,k)=>{if(n&&LV[k])LV[k].n=n});BEN=null}}catch(e){}}
/* the bars and panels drawn again in the new language */
function refresh(){try{if(typeof BARSIG!=='undefined')BARSIG='';if(typeof GOALSIG!=='undefined')GOALSIG='';if(typeof STSIG!=='undefined')STSIG='';
 if(S){buildBar();updateUI();if(typeof sel!=='undefined'&&sel&&!$('#info').hidden)openInfo(sel)}if(typeof TUTI!=='undefined'&&TUTI>=0)tutShow()}catch(e){}langBtn()}
function apply(){const on=lang==='de'&&city==='wien1857';if(on===ON)return;if(on){ON=true;CACHE.clear();names(true);walkText(true)}else{walkText(false);names(false);ON=false;CACHE.clear()}
 if(PAGE)document.documentElement.lang=ON?'de':'en';refresh()}
function setCity(k){if(k&&k!==city){city=k;apply()}}
function setLang(l){lang=l==='de'?'de':'en';try{localStorage.setItem(LS,lang)}catch(e){}apply()}

/* ---------- hooks into the game: they hand over and change nothing else ---------- */
/* a city set up (a new game, a save restored): German comes with Vienna */
if(typeof setupLevel==='function'){const s0=setupLevel;setupLevel=function(){const wasOn=ON;if(wasOn)names(false);const r=s0.apply(this,arguments);const k=Object.keys(LEVELS).find(k=>LEVELS[k]===L)||city;
 if(k!==city){city=k;ON=wasOn;apply()}else if(wasOn)names(true);return r}}
/* the long cards: translated whole before the first sentence is folded out from the rest */
if(typeof fold==='function'){const f0=fold;fold=function(x){return f0(isOn()&&typeof x==='string'?tr(x):x)}}
/* the start card speaks the language of the city it shows, and offers the choice */
if(typeof showStart==='function'){const s0=showStart;showStart=async function(id){setCity(id||lastCity());const r=await s0.apply(this,arguments);startRow();return r}}
function startRow(){const c=PAGE&&document.getElementById('ovCard');if(!c||c.querySelector('.langRow'))return;const d=document.createElement('div');d.className='btns langRow';d.style.cssText='margin:14px 0 0;justify-content:flex-end;gap:6px';
 for(const[l,t]of[['en','English'],['de','Deutsch']]){const b=document.createElement('button');NT[1].set.call(b,t);b.className=lang===l?'pri':'';b.style.cssText='padding:4px 10px;font-size:13px';
  b.onclick=()=>{if(lang===l)return;setLang(l);const k=city;showStart(k)};d.appendChild(b)}
 /* German is Vienna's: on New York's card a word says so */
 if(lang==='de'&&city!=='wien1857'){const n=document.createElement('small');n.className='m';n.style.cssText='align-self:center;margin-right:auto';NT[1].set.call(n,'Deutsch gilt für Wien');d.insertBefore(n,d.firstChild)}c.appendChild(d)}
/* the loading screen names the city it is building */
if(window.loadShow){const l0=window.loadShow;window.loadShow=k=>{if(k)setCity(k);return l0(k)}}

/* the language button in More */
let LB=null;
function langBtn(){if(!PAGE)return;if(!LB){const m=document.getElementById('shMore');if(!m)return;LB=document.createElement('button');LB.id='langBtn';const h=document.getElementById('dnBtn');m.insertBefore(LB,h?h.nextSibling:null);
  LB.onclick=()=>{setLang(lang==='de'?'en':'de');if(lang==='de'&&city!=='wien1857'&&typeof toast==='function')toast('🌐 Deutsch is for Vienna. New York stays in English')}}
 NT[1].set.call(LB,lang==='de'?'🌐 Sprache: Deutsch':'🌐 Language: English')}

/* ---------- voices ---------- */
/* the line said aloud, in German when Vienna is German; the folder its recording lies in */
function say(t){return isOn()?post(tr(t)):t}
const vdir=()=>ON?'voices-de':'voices';
let DV=null,dvT=-1e9;
function deVoices(){const now=performance.now();if(DV&&now-dvT<10000)return DV;dvT=now;let all=[];try{all=speechSynthesis.getVoices().filter(v=>/^de/i.test(v.lang))}catch(e){}if(!all.length)return DV=null;
 const F=/anna|helena|petra|katja|marlene|vicki|sandy|shelley|grandma|female/i;all.sort((a,b)=>(/enhanced|premium|neural/i.test(b.name)?1:0)-(/enhanced|premium|neural/i.test(a.name)?1:0));
 return DV={f:all.filter(v=>F.test(v.name)),m:all.filter(v=>!F.test(v.name)),any:all}}
/* a line never recorded, in the phone's own German voice */
function tts(t,seed){if(!ON)return false;try{if(typeof muted!=='undefined'&&muted)return true;const S_=window.speechSynthesis;if(!S_)return true;if(S_.speaking||S_.pending)S_.cancel();
 const u=new SpeechSynthesisUtterance(t),vs=deVoices(),fem=seed>=.55;u.lang='de-AT';if(vs){const l=(fem?vs.f:vs.m).length?(fem?vs.f:vs.m):vs.any;u.voice=l[Math.floor(seed*977)%Math.min(l.length,2)];u.lang=u.voice.lang}
 u.pitch=fem?1.05:.85;u.rate=.95;u.volume=.9;S_.speak(u)}catch(e){}return true}

window.I18N={tr,trText,trHTML,say,vdir,tts,
 get lang(){return lang},get on(){return ON},setLang,
 /* for the tools and for testing: translate as German Vienna whatever is showing; what the table lacks */
 force(v){FORCE=!!v;CACHE.clear()},misses:()=>[...MISS]};
/* the game has already looked for a save by now: German for the city it opened, and the start card drawn again with the choice */
if(PAGE&&document.body){apply();langBtn();if(document.querySelector('#ovCard [data-city]'))showStart(city)}
})();
