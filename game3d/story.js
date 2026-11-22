/* ---------- story cases: a case told in chapters, with its own clock (game3d/case-redl.js is the first, Vienna's "Opernball 13").
   It runs beside the older cases in the same slot (S.case, with story set; CASES[k].story marks it), and uses the same casebook,
   the same "one thing at a time" gate and the same walk. What is its own:
   - talks: a close-up of the Emperor and the person (story3d.js moves the camera), one voiced opening line, then a strip at the
     bottom with their words and two or three replies, each with a tone (🤝 kind, ⚖️ strict, 👑 as the Emperor). Some answers are
     lies, and a 📓 Show button lets the player pick the card that proves it; a wrong card costs trust, and two end the talk;
   - the clock: from the moment the case starts running, minutes pass with walking, cab rides and talks, fixed times come and go,
     and ⏩ Wait skips ahead. The sky follows it (story3d.js), and the city's calendar stands still meanwhile;
   - chapters with several tasks open at once, each at a place and some with a time limit, all marked on the walk map;
   - the board: every clue is a card, and two cards that belong together make a gold deduction card.
   Everything a player reads is written into the page as English and translated there by i18n.js like every other text ---------- */
const STORIES={};
/* the story case under way, or null */
const ST=()=>S&&S.case&&S.case.story&&STORIES[S.case.k]?S.case:null;
const SD=()=>{const cs=ST();return cs?STORIES[cs.k]:null};
/* a story case is put in the casebook like any other; its one "step" says what to do now */
function storyCase(k,d){STORIES[k]=d;CASES[k]=Object.assign({w:d.w,story:1,yr:d.yr,at:d.at,short:d.short,title:d.title,ask:d.ask,left:d.left,prest:0,sus:[],
 steps:[{get go(){const t=storyNext();return t?t.t.replace(/\.$/,''):'follow the case'}}]})}
/* the casebook and the chance of the year start cases through caseStart: a story case asks first, then begins */
{const cs0=caseStart;caseStart=function(k,now){const c=CASES[k];if(c&&c.story)return storyOffer(k,now);return cs0(k,now)}}
function storyOffer(k,now){const c=CASES[k],D=STORIES[k];if(!S||!c||!caseHere(c)||S.case)return false;(S.csd||(S.csd={}))[k]=1;
 const go=()=>storyBegin(k),no=()=>{prestDown(1);(S.csr||(S.csr={}))[k]='left';toast(c.left)};
 if(now){go();return true}
 if(onFoot())msgPush(c.title,go,{foot:1,urg:true,go:'🕵️ Take the case',later:'Leave it to the police',no});
 else evChoice(c.title,`${c.ask}<br><br>Will you take the case?`,[['🕵️ Take the case',go],['👮 Leave it to the police',no]]);return true}
function storyBegin(k){const D=STORIES[k];TK=null;S.case={k,story:1,coat:1,n:0,ti:[],ch:1,clk:null,tk:{},cards:[],ded:[],f:{},word:0,wait:0};sfx('click');if(D.begin)D.begin(S.case);storyUI()}
/* the city's calendar stands still while the case's own clock runs: the evening is minutes, not months */
{const s0=sim;sim=function(dt){const cs=ST();if(cs&&cs.clk!=null)return;return s0(dt)}}

/* ---------- the clock: minutes from midnight before Saturday 24 May 1913 ---------- */
const STDAY=['Sat 24 May','Sun 25 May','Mon 26 May','Tue 27 May'];
function clkT(m){m=Math.round(m);const mm=((m%1440)+1440)%1440,h=Math.floor(mm/60),mi=mm%60;return`${h%12||12}:${String(mi).padStart(2,'0')} ${h<12?'am':'pm'}`}
function clkStr(m){return`${STDAY[Math.floor(m/1440)]||''} · ${clkT(m)}`}
/* time passes: the fixed times it reaches happen, and the time limits it passes close their tasks */
function storyClock(min){const cs=ST();if(!cs||cs.clk==null||!(min>0))return;cs.clk+=min;storyTimed()}
function storyTimed(){const cs=ST(),D=SD();if(!cs||cs.clk==null)return;
 for(const e of D.timed||[]){if(cs.f['t_'+e.id]||cs.clk<e.at||(e.ch&&e.ch!==cs.ch))continue;cs.f['t_'+e.id]=1;e.fn(cs);if(ST()!==cs)return}
 for(const t of storyTasks(true)){if(t.by==null||cs.clk<t.by||cs.tk[t.id])continue;cs.tk[t.id]=-1;toast(`⌛ Too late: ${t.t.replace(/\.$/,'').toLowerCase()}`);if(t.lost)t.lost(cs)}}
/* how dark the sky is by the clock: the sun sets at 7:37 pm (Central European Time; no summer time in Austria until 1916) and rises at
   about 4:10 am. The light goes for some forty minutes after sunset and comes back before sunrise */
function storyNF(){const cs=ST();if(!cs||cs.clk==null)return null;const m=((cs.clk%1440)+1440)%1440,k=v=>Math.max(0,Math.min(1,v));
 return m<720?k((250-m)/45)*.92:k((m-1150)/70)*.92}
/* ⏩ Wait: the next fixed time worth waiting for, as the chapter offers them */
function storyWaits(){const cs=ST(),D=SD();if(!cs||!D.waits)return[];return D.waits(cs).filter(w=>cs.clk==null||w.at==null||w.at>cs.clk)}
function storyWait(w){const cs=ST();if(!cs)return;sfx('click');if(w.at!=null&&cs.clk!=null)storyClock(w.at-cs.clk);if(w.fn)w.fn(cs);storyUI()}

/* ---------- chapters and tasks: every task of the chapter that is open now, nearest time limit first ---------- */
function storyTasks(all){const cs=ST(),D=SD();if(!cs)return[];const ch=D.ch[cs.ch];if(!ch)return[];
 return ch.tasks.filter(t=>(all||!cs.tk[t.id])&&(!t.when||t.when(cs))).sort((a,b)=>(a.by??1e9)-(b.by??1e9))}
function storyNext(){return storyTasks()[0]||null}
function storyDone(id){const cs=ST();if(!cs)return;cs.tk[id]=1;const D=SD(),ch=D.ch[cs.ch];if(ch&&ch.after)ch.after(cs,id);storyUI()}
/* on to the next chapter */
function storyChapter(n){const cs=ST();if(!cs)return;cs.ch=n;const ch=SD().ch[n];if(ch&&ch.start)ch.start(cs);storyUI()}
/* the place of a task: the street tile nearest its address, worked out once and kept with the case */
function storyTile(t){const cs=ST();if(!cs||!t.at)return-1;const tt=cs.tt||(cs.tt={});const D=SD();if(D&&D.tile)return D.tile(t.at);if(tt[t.id]===undefined)tt[t.id]=histRoad(t.at[0],t.at[1]);return tt[t.id]}
/* the task's own action: a talk, a search, or whatever the chapter does there */
function storyAct(id){const cs=ST(),t=storyTasks().find(t=>t.id===id);if(!cs||!t||TK)return;sfx('click');if(t.act)t.act(cs,t);else if(t.talk)talkOpen(t.talk,(cs,end)=>{if(!t.keep||end==='done')storyDone(t.id)},t.id)}

/* ---------- cards, deductions and "people know it is the Emperor" ---------- */
function storyCard(id){const cs=ST(),D=SD();if(!cs||!D.cards[id]||cs.cards.includes(id))return;cs.cards.push(id);toast(`📓 ${D.cards[id][0]}`);
 if(cs.cards.length>=2)storyTip('board','📓 You have clues. Open the Board and tap two cards that belong together.')}
const storyHas=id=>{const cs=ST();return!!cs&&(cs.cards.includes(id)||cs.ded.includes(id))};
function storyLose(id){const cs=ST();if(!cs)return;const i=cs.cards.indexOf(id);if(i>=0)cs.cards.splice(i,1)}
/* a 👑 reply: strangers see that the old gentleman in grey is the Emperor. At three the news reaches the case itself (D.word) */
function storyWord(n){const cs=ST();if(!cs)return;const was=cs.word;cs.word+=n||1;toast(`👑 People know it is the Emperor (${Math.min(3,cs.word)} of 3)`);if(was<3&&cs.word>=3&&SD().word)SD().word(cs)}

/* ---------- the talk ---------- */
let TK=null;const TONE={kind:'🤝 Kind',strict:'⚖️ Strict',king:'👑 As the Emperor'};
/* where the talk happens and with whom (story3d.js frames it): the task's place, or none for a talk on the telephone */
window.storyTalk=()=>TK&&!TK.T.phone?TK:null;
function talkOpen(id,done,task){const D=SD(),T=D&&D.talks[id];if(!T)return;TK={id,T,task,node:null,wrong:0,done,last:''};{const cs=ST();if(cs&&D.who&&D.who[id]&&!(cs.met||(cs.met=[])).includes(id))cs.met.push(id)}
 const el=talkEl();el.hidden=false;document.body.classList.add('talking');document.body.classList.toggle('indoor',!!T.indoor);if(T.say&&typeof window.speakLine==='function')window.speakLine(T.say,T.seed??.4);
 talkNode(T.start||'a')}
function talkNode(k){const cs=ST(),n=TK&&TK.T.n[k];if(!TK)return;if(!n){talkEnd(k);return}TK.node=k;
 if(n.min)storyClock(n.min);if(n.card)storyCard(n.card);if(n.cards)n.cards.forEach(storyCard);if(n.word)storyWord(n.word);if(n.fx)n.fx(cs);if(!ST()||!TK)return;
 const el=talkEl(),txt=typeof n.t==='function'?n.t(cs):n.t;TK.last=txt;
 const opts=(n.o||[]).filter(o=>!o[3]||o[3](cs)),btn=(lab,data)=>`<button ${data}>${lab}</button>`;
 el.querySelector('.tw').textContent=n.who||TK.T.who;el.querySelector('.tt').textContent=n.note?txt:`“${txt}”`;el.querySelector('.tt').classList.toggle('note',!!n.note);
 const tip=opts.some(o=>o[0])&&tipNew('tones')?'Your reply has a tone: 🤝 Kind, ⚖️ Strict or 👑 As the Emperor. 👑 opens doors, but people learn who you are.':(n.lie||n.truth)&&tipNew('proof')?'Is it true? If you have a card that shows it is a lie, tap 📓 Show proof and pick that card.':'';
 el.querySelector('.th').textContent=tip;el.querySelector('.th').hidden=!tip;
 el.querySelector('.to').innerHTML=opts.map((o,i)=>btn(`${o[0]?`<small>${TONE[o[0]]}</small>`:''}${o[1]}`,`data-o="${i}"`)).join('')+(n.lie||n.truth?btn('📓 Show proof','data-show="1" class="show"'):'')+(n.end||!opts.length?btn(n.end&&n.end!==1?n.end:'Leave','data-end="1" class="pri"'):'');
 el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.o];sfx('click');if(o[0]==='king')storyWord(1);if(!TK)return;typeof o[2]==='function'?o[2](cs):talkNode(o[2])});
 const sh=el.querySelector('[data-show]');if(sh)sh.onclick=()=>talkShow(n);const en=el.querySelector('[data-end]');if(en)en.onclick=()=>talkEnd(n.done?'done':k)}
/* show a card against what was just said: the right one breaks it; pressing the truth gets the same answer and costs time; a wrong
   card costs trust, and the second ends the talk (a talk marked dbl counts each wrong card twice) */
function talkShow(n){const cs=ST(),D=SD(),el=talkEl(),ids=cs.ded.concat(cs.cards);
 el.querySelector('.to').innerHTML=(ids.length?ids.map((id,i)=>`<button data-c="${i}" class="${cs.ded.includes(id)?'gold':''}">${cs.ded.includes(id)?'⭐ ':'📓 '}${storyName(id)}</button>`).join(''):'<span class="m">Your notebook is empty.</span>')+'<button data-back="1">Back</button>';
 el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const id=ids[+b.dataset.c];sfx('click');
  if(n.lie&&[].concat(n.lie.proof).includes(id)){talkNode(n.lie.next);return}
  if(n.truth){storyClock(5);talkSay(n.truth);return}
  TK.wrong+=TK.T.dbl&&!(TK.T.dbl(cs))?2:1;storyClock(5);if(D.wrong)D.wrong(cs,TK.id);
  if(TK.wrong>=2){talkSay(TK.T.shut||'I have nothing more to say to you.',true);return}talkSay(TK.T.no||'That proves nothing.')});
 el.querySelector('[data-back]').onclick=()=>talkNode(TK.node)}
/* a short answer before the replies come back (or the talk ends, shut) */
function talkSay(t,shut){const el=talkEl();el.querySelector('.tt').textContent=`“${t}”`;el.querySelector('.to').innerHTML=`<button class="pri" data-ok="1">${shut?'Leave':'Go on'}</button>`;
 el.querySelector('[data-ok]').onclick=()=>shut?talkEnd('shut'):talkNode(TK.node)}
function talkEnd(how){const t=TK;TK=null;const el=talkEl();el.hidden=true;document.body.classList.remove('talking','indoor');if(t&&t.done)t.done(ST(),how);storyUI()}
/* the cards by name, deductions too */
function storyName(id){const D=SD();if(!D)return id;if(D.cards[id])return D.cards[id][0];const d=D.ded.find(d=>d.id===id);return d?d.t:id}

/* ---------- the board: cards pinned, and two that belong together make a deduction ---------- */
let BSEL=null;
function storyBoard(){const cs=ST(),D=SD();if(!cs)return;const card=id=>{const c=D.cards[id],sel=BSEL===id;return`<button class="bc${sel?' sel':''}" data-b="${id}"><b>📓 ${c[0]}</b><span>${c[1]}</span></button>`};
 const gold=cs.ded.map(id=>{const d=D.ded.find(d=>d.id===id);return`<div class="bc gold"><b>⭐ ${d.t}</b><span>${d.x}</span></div>`}).join('');
 ov(`<h2>📓 The board</h2><p class="m">Tap two cards that belong together. If they do, you get a gold card.</p><div class="board">${gold}${cs.cards.map(card).join('')||'<p class="m">No cards yet.</p>'}</div><div class="btns"><button id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=()=>{BSEL=null;closeOv()};document.querySelectorAll('#ovCard [data-b]').forEach(b=>b.onclick=()=>boardPick(b.dataset.b))}
function boardPick(id){const cs=ST(),D=SD();sfx('click');if(!BSEL||BSEL===id){BSEL=BSEL===id?null:id;storyBoard();return}
 const a=BSEL;BSEL=null;const d=D.ded.find(d=>(d.a===a&&d.b===id)||(d.a===id&&d.b===a));
 if(d&&!cs.ded.includes(d.id)){cs.ded.push(d.id);sfx('chime');toast(`⭐ ${d.t}`)}else if(!d)toast('These two cards do not belong together');storyBoard()}

/* ---------- the strip, the banner and the task list ---------- */
let STEL=null,TKEL=null;
function storyCSS(){if($('#storyCSS'))return;const s=document.createElement('style');s.id='storyCSS';s.textContent=`
#story{position:absolute;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:31;display:flex;flex-wrap:wrap;gap:5px;align-items:center;justify-content:center;background:rgba(18,16,14,.88);color:#efe6d2;border:1px solid rgba(216,180,94,.55);border-radius:12px;padding:6px 8px;font:600 13px system-ui,sans-serif;max-width:calc(100% - 24px);box-sizing:border-box}
body.walking #story{top:calc(62px + env(safe-area-inset-top,0px))}#story[hidden],#talk[hidden]{display:none}
#story .st{flex:1 1 100%;text-align:center;padding:0 2px}#story .ck{color:#d6b36a}#story button{background:rgba(216,180,94,.2);color:#efe6d2;border:1px solid rgba(216,180,94,.5);border-radius:9px;padding:5px 9px;font:600 13px system-ui,sans-serif}
#talk{position:absolute;left:0;right:0;bottom:0;z-index:40;background:linear-gradient(transparent,rgba(10,9,8,.94) 18%);color:#efe6d2;padding:34px 14px calc(14px + env(safe-area-inset-bottom,0px));font-family:Georgia,'Times New Roman',serif}
#talk .tw{font:700 13px system-ui,sans-serif;color:#d6b36a;margin-bottom:4px}#talk .tt{font-size:17px;line-height:1.35;margin-bottom:10px}#talk .tt.note{font-style:italic;color:#c9bfa8}
#ovCard h2 .big{font-size:56px;line-height:1.15;margin:2px 0 6px}
#talk .th{font:600 13px system-ui,sans-serif;color:#1d1a16;background:#e8cf86;border-radius:9px;padding:7px 10px;margin-bottom:9px}#talk .th[hidden]{display:none}
#storyTip{position:absolute;left:50%;transform:translateX(-50%);top:calc(112px + env(safe-area-inset-top,0px));z-index:31;max-width:min(340px,calc(100% - 32px));box-sizing:border-box;background:#e8cf86;color:#1d1a16;border-radius:11px;padding:9px 12px;font:600 14px system-ui,sans-serif;box-shadow:0 3px 12px rgba(0,0,0,.4)}#storyTip[hidden]{display:none}body.talking #storyTip{display:none}
#story .st{cursor:pointer}#storySo p{margin:4px 0}#storySo .who{display:flex;gap:6px;padding:4px 0;border-bottom:1px solid rgba(128,128,128,.2)}
#talk .to{display:flex;flex-direction:column;gap:7px}#talk button{text-align:left;background:rgba(216,180,94,.16);color:#efe6d2;border:1px solid rgba(216,180,94,.5);border-radius:11px;padding:9px 12px;font:600 15px system-ui,sans-serif}
#talk button small{display:block;font-size:11px;color:#d6b36a;font-weight:700}#talk button.pri{background:rgba(216,180,94,.4)}#talk button.show{border-style:dashed}#talk button.gold{border-color:#e7c25a}
body.talking.indoor::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:39;background:radial-gradient(ellipse at 50% 42%,rgba(40,28,14,.15) 28%,rgba(6,5,4,.88) 78%)}
body.talking #toast,body.talking #wk,body.talking #job,body.talking #jobMk,body.talking #say,body.talking #story,body.talking #msgN,body.talking #scn{display:none!important}
.board{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:8px 0}.board .bc{display:flex;flex-direction:column;gap:3px;text-align:left;background:#efe6cf;color:#2a221a;border:1px solid #b9a77a;border-radius:6px;padding:8px;font:13px Georgia,serif;box-shadow:1px 2px 0 rgba(0,0,0,.25)}
.board .bc b{font:700 13px system-ui,sans-serif;color:#2a221a!important}.board .bc span{font-size:12px}.board .bc.sel{outline:3px solid #b8322a}.board .bc.gold{background:#f3d67a;border-color:#a8822a}
#storyTasks .tk{display:flex;gap:8px;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(128,128,128,.25);padding:6px 0}#storyTasks .tk.done{opacity:.55}`;document.head.appendChild(s)}
function talkEl(){if(TKEL)return TKEL;storyCSS();TKEL=document.createElement('div');TKEL.id='talk';TKEL.hidden=true;TKEL.innerHTML='<div class="tw"></div><div class="tt"></div><div class="th" hidden></div><div class="to"></div>';(document.getElementById('stage')||document.body).appendChild(TKEL);return TKEL}
function storyEl(){if(STEL)return STEL;storyCSS();STEL=document.createElement('div');STEL.id='story';STEL.hidden=true;
 STEL.innerHTML='<div class="st"></div><button data-sb="tasks">📋 The case</button><button data-sb="board">📓 Board</button><button data-sb="wait">⏩ Wait</button><button data-sb="cab">🚕 Take a cab</button>';(document.getElementById('stage')||document.body).appendChild(STEL);
 STEL.onclick=e=>{if(e.target.closest('.st')){storyWhy();return}const b=e.target.closest("[data-sb]");if(!b||!ST())return;sfx('click');const k=b.dataset.sb;if(k==='board')storyBoard();else if(k==='tasks')storyList();else if(k==='cab'){const t=storyNext();if(t)storyGo(t)}else storyWaitMenu()};return STEL}
let STBSIG='';
/* the goal line: what to do, with whom and where, and how far it is (story3d.js measures); the case may say it itself (the chase) */
function storyGoal(cs){const D=SD(),g=D.goal&&D.goal(cs);if(g)return g;const t=storyNext();if(!t)return D.idle?D.idle(cs):'';
 const d=typeof window.storyDist==='function'&&t.at?window.storyDist(t):null;
 return`${t.t.replace(/\.$/,'')}${t.pl?` · ${t.pl}`:''}${d!=null&&d>4?` · ${d<1000?Math.round(d/5)*5+' m':(d/1000).toFixed(1)+' km'}`:''}${t.by!=null?` <span class="ck">(by ${clkT(t.by)})</span>`:''}`}
function storyUI(){const cs=ST(),el=storyEl();if(!cs){if(!el.hidden)el.hidden=true;STBSIG='';tipHide();return}const w=storyWaits();
 /* far from the next place (and not in the middle of a chase), a cab takes him there */
 const t=storyNext(),far=!!t&&!t.hidden&&t.at&&typeof window.storyDist==='function'&&(window.storyDist(t)||0)>150&&!(SD().goal&&SD().goal(cs));
 const txt=`${cs.clk!=null?`<span class="ck">🕒 ${clkT(cs.clk)}</span> · `:'🕵️ '}<b>${storyGoal(cs)}</b>`,sig=txt+w.length+far;
 if(sig!==STBSIG){STBSIG=sig;el.querySelector('.st').innerHTML=txt;el.querySelector('[data-sb="wait"]').hidden=!w.length;el.querySelector('[data-sb="cab"]').hidden=!far}el.hidden=!!TK||!$('#ov').hidden;
 if(TIPEL&&!TIPEL.hidden&&(TK||!$('#ov').hidden))tipHide();if(TIPQ&&!TK&&$('#ov').hidden){tipShow(TIPQ);TIPQ=null}}
/* tapping the goal line says why */
function storyWhy(){const cs=ST(),D=SD();if(!cs)return;const t=storyNext(),y=(D.why&&D.why(cs,t))||(t&&t.why)||'Follow the case.';tipShow(`💡 ${y}`)}
/* first-time help: each idea once for a player, short, when it first comes up; the bubble goes by itself or at a tap */
let TIPEL=null,TIPT=0;const TIPS=(()=>{try{return new Set(JSON.parse(localStorage.getItem('gcTips')||'[]'))}catch(e){return new Set()}})();
function tipNew(k){if(TIPS.has(k))return false;TIPS.add(k);try{localStorage.setItem('gcTips',JSON.stringify([...TIPS]))}catch(e){}return true}
/* a tip that comes while a card or a talk is open waits until it closes */
let TIPQ=null;function storyTip(k,t){if(!tipNew(k))return;if(TK||!$('#ov').hidden)TIPQ=t;else tipShow(t)}
function tipShow(t){storyCSS();if(!TIPEL){TIPEL=document.createElement('div');TIPEL.id='storyTip';TIPEL.hidden=true;TIPEL.onclick=tipHide;(document.getElementById('stage')||document.body).appendChild(TIPEL)}
 TIPEL.textContent=t;TIPEL.hidden=false;clearTimeout(TIPT);TIPT=setTimeout(tipHide,Math.max(6000,t.length*90))}
function tipHide(){if(TIPEL)TIPEL.hidden=true}
function storyList(){const cs=ST(),D=SD();if(!cs)return;const ts=storyTasks(true);
 const so=D.sofar?D.sofar(cs):[],who=[...new Set((cs.met||[]).filter(k=>D.who&&D.who[k]).map(k=>D.who[k]))];
 ov(`<h2>📋 ${CASES[cs.k].short}</h2>${cs.clk!=null?`<p class="m">🕒 ${clkStr(cs.clk)}</p>`:''}<div id="storySo">${so.length?`<h3>📖 The story so far</h3>${so.slice(-6).map(l=>`<p>${l}</p>`).join('')}`:''}</div><h3>📋 To do</h3><div id="storyTasks">${ts.map(t=>`<div class="tk${cs.tk[t.id]?' done':''}"><span>${cs.tk[t.id]===1?'✅':cs.tk[t.id]===-1?'⌛':'▫️'} ${t.t}${t.by!=null&&!cs.tk[t.id]?` <span class="m">by ${clkT(t.by)}</span>`:''}</span>${!cs.tk[t.id]&&t.at?`<button data-go="${t.id}">📍 Go there</button>`:''}</div>`).join('')||'<p class="m">Nothing to do just now.</p>'}</div>${who.length?`<div id="storySo"><h3>👥 Who's who</h3>${who.map(w=>`<div class="who"><span>${w[0]}</span><span><b>${w[1]}</b> · ${w[2]}</span></div>`).join('')}</div>`:''}
 <div class="btns"><button id="ovOk">Close</button><button id="stLeave" class="plain">Give up the case</button></div>`);
 $('#ovOk').onclick=closeOv;document.querySelectorAll('#ovCard [data-go]').forEach(b=>b.onclick=()=>{const t=ts.find(t=>t.id===b.dataset.go);closeOv();storyGo(t)});
 $('#stLeave').onclick=()=>{closeOv();storyEnd('left')}}
/* to a task's place: in a cab when the clock runs (the minutes the ride takes), on foot otherwise */
function storyGo(t){const i=storyTile(t);if(i<0)return;const cs=ST();if(cs&&cs.clk!=null&&typeof storyRideMin==='function'){const m=storyRideMin(i);if(m>0){storyClock(m);toast(`🚕 A cab takes you there: ${Math.round(m)} minutes`)}}walkOn(i)}
function storyWaitMenu(){const w=storyWaits();if(!w.length)return;ov(`<h2>⏩ Wait</h2><div class="btns" style="flex-direction:column;align-items:stretch">${w.map((x,i)=>`<button data-w="${i}">${x.l}</button>`).join('')}<button id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=closeOv;document.querySelectorAll('#ovCard [data-w]').forEach(b=>b.onclick=()=>{closeOv();storyWait(w[+b.dataset.w])})}
/* the case ends: its result in the casebook, and the city's calendar runs again */
function storyEnd(res){const cs=ST();if(!cs)return;(S.csr||(S.csr={}))[cs.k]=res;if(TK)talkEnd('x');S.case=null;storyUI();if(res==='left')toast(CASES[cs.k].left)}
/* the minutes a cab takes from where he is to a tile (story3d.js knows where he is) */
let storyRideMin=null;
/* a story case's frame tick, walking or not (story3d.js calls it): the clock's own events and the banner */
function storyFrame(){const cs=ST();if(!cs)return;const D=SD();if(D.tick)D.tick(cs);if(ST())storyUI()}

/* ---------- Stories (the start card): a story case played on its own, in a built city of its year, without growing the city that far
   first. A story game has its own save (ns3d-story-<key>), so the player's own city is never touched; "Continue" picks it up again.
   In a normal game the same case comes up in the casebook when its year comes ---------- */
const STORYLIST=[{k:'redl',city:'wien1857',y:1913,m:5.5,i:'🕵️',t:'Opernball 13',x:'Vienna, May 1913. A spy case. About 10 minutes.'}];
{const s0=STORE.set.bind(STORE);STORE.set=function(k,v,...a){if(S&&S.story&&/^ns3d-(save|dev)-/.test(k))k='ns3d-story-'+S.story;return s0(k,v,...a)}}
{const ss0=showStart;showStart=async function(id){await ss0(id);id=id||lastCity();if(!STORYLIST.some(s=>s.city===id))return;const b=$('#ovHelp');if(!b||$('#ovStories'))return;
 b.insertAdjacentHTML('afterend','<button id="ovStories">📖 Stories</button>');$('#ovStories').onclick=()=>showStories(id)}}
async function showStories(id){const rows=[];for(const s of STORYLIST.filter(s=>s.city===id)){const r=await STORE.get('ns3d-story-'+s.k);rows.push([s,!!(r&&r.value)])}
 ov(`<h2>📖 Stories</h2><p class="m">A case from history, in a city of its year. Your own city is not changed.</p>${rows.map(([s,sv],i)=>`<div class="law"><div><b>${s.i} ${s.t}</b><br><span class="m">${s.x}</span></div><div class="btns" style="margin:0">${sv?`<button data-sc="${i}">▶ Continue</button>`:''}<button class="pri" data-sp="${i}">${sv?'Start again':'▶ Play'}</button></div></div>`).join('')}
 <div class="btns"><button id="ovOk">Back</button></div>`);$('#ovOk').onclick=()=>showStart(id);
 document.querySelectorAll('#ovCard [data-sp]').forEach(b=>b.onclick=()=>storyPlay(rows[+b.dataset.sp][0]));
 document.querySelectorAll('#ovCard [data-sc]').forEach(b=>b.onclick=async()=>{const s=rows[+b.dataset.sc][0],r=await STORE.get('ns3d-story-'+s.k);let d=null;try{d=JSON.parse(r.value)}catch(e){}
  if(d&&restore(d)){S.story=s.k;closeOv();storyUI();toast(`📖 ${s.t}`);
   /* back on foot where the case goes on, facing it */
   const cs=ST(),t=storyNext();if(cs&&t&&t.at&&!onFoot()){const i=storyTile(t);if(i>=0){walkOn(i);cs.f.face=1}}}else storyPlay(s)})}
function storyPlay(s){document.querySelectorAll('#ovCard button').forEach(x=>x.disabled=true);ldShow(s.city);
 setTimeout(()=>{const i0=LEVELS[s.city].intro;LEVELS[s.city].intro=()=>{};try{devCity(s.y,s.city)}finally{setTimeout(()=>{LEVELS[s.city].intro=i0},1500)}
  UNLOCKALL=false;{const t=$('#toast');if(t)t.classList.remove('show')}if(typeof setMode==='function')setMode(null);S.story=s.k;S.tutSeen=1;S.t=yT(s.y,Math.floor(s.m),s.m%1);closeOv();ldEnd();(S.csd||(S.csd={}));caseStart(s.k,true);save()},60)}
