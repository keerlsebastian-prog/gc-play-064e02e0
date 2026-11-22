/* ---------- "Opernball 13": Vienna, May 1913. Letters full of money from the Russian border wait at the main post office for a man
   who calls himself Opernball 13. A trap, a taxi chase, a hotel, a dinner, and Room No. 1 at midnight. The design and its sources:
   docs/CASE_OPERNBALL13.md. Real: the letters, the trap, the taxi, the knife sheath, the Hotel Klomser, Redl's walk and his dinner with
   the state prosecutor, the commission at midnight, the Prague flat and Kisch. Invented: every word spoken, the clerk, the drivers, the
   waiter, the porter, the guests, the false alarm, the overheard dinner, the handwriting puzzle and two of the three endings.
   Every text is plain, short English (the German table translates it on the page). All of it inside one function, so none of its
   names reach the engine's ---------- */
(()=>{
const POST=[48.2112,16.3768],STAND=[48.2028,16.3768],CAFE=[48.2036,16.3730],KLOMSER=[48.2102,16.3660],BANK=[48.2097,16.3651],FREYUNG=[48.2115,16.3649],RIEDHOF=[48.2135,16.3522],WEST=[48.1966,16.3376];
const BELL=17*60+52,MID=24*60,LATE=24*60+30,MORNING=24*60+5*60+30;
/* what lives only while the game runs (paths, timers): rebuilt from the saved case after a reload */
let RT={cs:null};const rt=cs=>{if(RT.cs!==cs)RT={cs,t0:performance.now()};return RT};
/* ---------- the places of the case as buildings of their own on real lots (their models: render/places13.js): put up when the case
   begins, on open ground or in place of the old city's plain houses beside a street, never on the player's own buildings. Each faces
   its street; its door, not the corner of a block, is where the tasks there are done. The Hotel Klomser has a second door on the
   Bankgasse. The Westbahnhof is the station that already stands there. Where no lot can be found the old signboard stands in ---------- */
const PLACES=[{t:'r13post',at:POST,f:4,n:'Hauptpostamt',i:'📮',d:'The main post office on the Fleischmarkt. Letters wait at its counter hall for those who call for them.'},
 {t:'r13stand',at:STAND,f:2,n:'Cab stand, Kolowratring',i:'🚕',d:'Motor cabs and fiakers wait here on the Ring for a fare.'},
 {t:'r13cafe',at:CAFE,f:3,n:'Café Kaiserhof',i:'☕',d:'A coffee house on the ground floor of a Ring house.'},
 {t:'r13klomser',at:KLOMSER,f:3,n:'Hotel Klomser',i:'🏨',d:'The Palais Batthyány in the Herrengasse, a hotel since the 1870s. Its back door is on the Bankgasse.',back:BANK},
 {t:'r13central',at:FREYUNG,f:3,n:'Café Central',i:'☕',d:'The Palais Ferstel of 1860, with the Café Central and the passage to the Freyung.'},
 {t:'bahnhof',at:WEST,f:4,adopt:1,n:'Westbahnhof'},
 {t:'r13riedhof',at:RIEDHOF,f:4,out:1,n:'Riedhof',i:'🍺',d:'An inn in the Josefstadt with a beer garden under chestnut trees.'}];
for(const p of PLACES)if(!p.adopt)B[p.t]={n:p.n,i:p.i,foot:p.f,on:'land',cost:{},up:0,ds:1,d:p.d};
/* the place for a spot of the case, if it stands: one of its own, or the station nearest the real one (the Westbahnhof) */
function plOf(at){for(const p of PLACES)if(p.at===at||p.back===at){let o=null;if(p.adopt){const[gx,gy]=gt(...prj(L,p.at[0],p.at[1]));let bd=8;for(const q of S.list)if(q.t===p.t){const d=Math.hypot(q.x-gx,q.y-gy);if(d<bd){bd=d;o=q}}}
  else o=S.list.find(o=>o.t===p.t);if(o)return[o,p,p.back===at]}return null}
/* which way a place faces: the side with the most street, as its model is turned (instancing.js); and the street tile at a door */
function plFace(o,f,skip){let best=-1,bn=-1;for(let s=0;s<4;s++){if(s===skip)continue;let n=0;for(let k=0;k<f;k++){const[a,b]=plSide(o,f,s,k);if(inb(a,b)&&((S.b[b*W+a]&&S.b[b*W+a].t==='road')||S.tiles[b*W+a]===BRIDGE))n++}if(n>bn){bn=n;best=s}}return best}
function plSide(o,f,s,k){return s===0?[o.x+k,o.y+f]:s===1?[o.x+f,o.y+k]:s===2?[o.x+k,o.y-1]:[o.x-1,o.y+k]}
const PLRY=[0,Math.PI/2,Math.PI,-Math.PI/2];
/* the side of a door: the front, or for a back door the street side nearest its real place */
function plDoor(o,p,back){const f=p.f,fr=(i=>i<0?plFace(o,f):i)(p.adopt&&typeof stationSide==='function'?PLRY.indexOf(stationSide(o.x,o.y).ry):-1);if(!back)return fr;const[gx,gy]=gt(...prj(L,p.back[0],p.back[1]));let best=fr,bd=1e9;
 for(let s=0;s<4;s++){if(s===fr)continue;const[a,b]=plSide(o,f,s,f>>1);if(!inb(a,b)||!(S.b[b*W+a]&&S.b[b*W+a].t==='road'))continue;const d=Math.hypot(a-gx,b-gy);if(d<bd){bd=d;best=s}}return best}
function plTile(o,p,back){const s=plDoor(o,p,back),f=p.f;for(const k of[f>>1,(f-1)>>1,0,f-1]){const[a,b]=plSide(o,f,s,k);if(inb(a,b)&&S.b[b*W+a]&&S.b[b*W+a].t==='road')return b*W+a}return-1}
/* like the old city's houses they are not saved: a loaded game has the old city back, and they are put up again on the same lots */
let PLS=null;
function placesUp(){let n=0;for(const p of PLACES){if(p.adopt||S.list.some(o=>o.t===p.t))continue;const[cx,cy]=gt(...prj(L,p.at[0],p.at[1])),f=p.f;let best=null,bs=1e9;
  for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++){const x=Math.round(cx-(f-1)/2)+dx,y=Math.round(cy-(f-1)/2)+dy;let ok=true,hs=new Set();
   for(let b=0;b<f&&ok;b++)for(let a=0;a<f&&ok;a++){const X=x+a,Y=y+b;if(!inb(X,Y)){ok=false;break}const i=Y*W+X,t=S.tiles[i],q=S.b[i];if(t===WATER||t===BRIDGE||t===MOUNT){ok=false;break}if(q){if(q.t==='house'&&q.h)hs.add(q);else ok=false}}
   if(!ok)continue;const o={x,y};let rd=0;for(let s=0;s<4;s++)for(let k=0;k<f;k++){const[a,b]=plSide(o,f,s,k);if(inb(a,b)&&S.b[b*W+a]&&S.b[b*W+a].t==='road')rd++}if(!rd)continue;
   const sc=Math.hypot(dx,dy)*2+hs.size*3-Math.min(rd,f)*.5;if(sc<bs){bs=sc;best=[x,y,hs]}}
  if(!best)continue;for(const q of best[2]){for(const[fx,fy]of footTiles(q.t,q.x,q.y))S.b[fy*W+fx]=null;S.list.splice(S.list.indexOf(q),1)}
  const o=place(p.t,best[0],best[1],0,true);o.h=1;n++}
 if(n){GV++;recompute()}}
const tileOf=at=>{const q=plOf(at);if(q){const i=plTile(...q);if(i>=0)return i}return histRoad(at[0],at[1])};
const done=id=>{const cs=ST();return!!cs&&cs.tk[id]===1};

/* the people of the case page's Who's who; one entry for each person, whichever talk met them */
const KUBW=['📮','Miss Kubiček','the clerk at the post office counter.'],REDLW=['👤','Colonel Alfred Redl','once head of the army\'s spy-catchers.'];
storyCase('redl',{w:1,yr:[1913,1913],at:[1913,5],short:'Opernball 13',title:'🕵️ Money from the Russian border!',
 ask:'Majesty, two letters full of money wait at the Hauptpostamt (the main post office). They came from the Russian border. Nobody has come for them yet.',
 left:'🕵️ The letters at the post office wait for months. Nobody comes for them.',

 /* the cards of the board: [title, what it says] */
 cards:{cover:['Spy addresses','The letters held addresses in Geneva and Paris. They belong to Russian spies.'],
  sums:['14,000 kronen','6,000 kronen in one letter, 8,000 in the other. All new banknotes.'],
  slip:['The signed slip','The man who collects the letters signs a slip with the name "Opernball 13".'],
  drove:['The driver','The taxi driver took the man in grey to the Café Kaiserhof.'],
  incafe:['Into the café','You saw the man in grey go into the Café Kaiserhof.'],
  sheath:['The knife sheath','A small sheath for a pocket knife, of light grey cloth. It was on the seat of the taxi.'],
  otherdoor:['The other door','The man walked through the café and out of the other door, to the cab stand.'],
  klomser:['Hotel Klomser','The man in grey took a cab to the Hotel Klomser, in the Herrengasse.'],
  three:['Three guests','Three gentlemen came by cab: Herr Wolański, Herr Sedláček and a man from Prague in Room No. 1.'],
  claimed:['He took the sheath','The porter asked: "Did you lose this?" Colonel Redl said: "Yes, thank you."'],
  brussels:['Receipt: Brussels','A torn receipt for a registered letter to Brussels.'],
  warsaw:['Receipt: Warsaw','A torn receipt for a registered letter to Warsaw.'],
  lausanne:['Receipt: Lausanne','A torn receipt for a registered letter to Lausanne.'],
  zednicek:['A bill from Zednicek','A torn bill from Zednicek, a coachbuilder. It is for work on a motorcar.'],
  report:['His old report','A report in Colonel Redl\'s hand, from the files. The letters match the slip.'],
  ronge:['Too much money','Captain Ronge: "Nobody pays that much for old papers."'],
  forgive:['At the Riedhof','Redl said to Pollak: "I have done something no friend can forgive."'],
  lost:['Back to Prague','Redl asked Pollak to help him get back to Prague tonight. He said he was lost.'],
  gayer:['The police wait','Pollak telephoned the police. They say it can wait until tomorrow.'],
  daimler:['The motorcar','Sladek: a Daimler from 1911, 18,000 kronen, paid in new banknotes.'],
  conrad:['General Conrad','The army wants it to end tonight, quietly.']},
 /* two cards that belong together make a deduction, the proof that breaks a lie in Room No. 1 */
 ded:[{id:'D1',a:'sheath',b:'claimed',t:'The man in the taxi is Redl',x:'The sheath was in the taxi, and Redl took it at the hotel.'},
  {id:'D2',a:'slip',b:'report',t:'Redl wrote "Opernball 13"',x:'The handwriting on the slip is his.'},
  {id:'D3',a:'brussels',b:'cover',t:'For years, not once',x:'He sent letters to spy addresses again and again.'},
  {id:'D4',a:'daimler',b:'zednicek',t:'Too rich for a colonel',x:'A motorcar for 18,000 kronen, paid in new banknotes.'},
  {id:'D5',a:'sums',b:'ronge',t:'New secrets, not old papers',x:'14,000 kronen in one month is the price of real secrets.'}],

 begin(cs){placesUp();PLS=S;cs.f.t1=S.t;cs.clk=17*60+30;
  cardThen('<div class="big">👑</div>You are the Emperor','Vienna, Saturday 24 May 1913. You are Emperor Franz Joseph.<br><br>Today you go out in a plain grey coat. You trust your own eyes more than reports.',()=>
   cardThen('<div class="big">✉️</div>Money from Russia','Two letters wait at the main post office. They are full of Russian money: 14,000 kronen.<br><br>They are for a man who calls himself "Opernball 13". He may be a spy.',()=>
    cardThen('<div class="big">🚶</div>What to do now','Walk to the post office and talk to Captain Ronge.<br><br>Follow the red arrow. The line at the top always says what to do next.',()=>{walkOn(tileOf(POST));cs.f.face=1;storyUI()},'Start'),'Next'),'Next')},
 idle(cs){if(cs.ch===1&&cs.f.set)return'🔔 The trap is set. Wait for the bell.';return''},
 /* the goal line says it itself during the chase and the tail */
 goal(cs){const r=rt(cs);if(r.cab&&r.tx){const g=Math.round(r.gap||0);return`🚕 Follow the red taxi · ${g} m${r.lost>0?' · <span class="ck">too far!</span>':r.near>0?' · <span class="ck">too close!</span>':''}`}
  if(r.redl&&r.rp)return`👁️ Follow Colonel Redl · pick up the paper scraps`;if(cs.f.night)return'🌙 The officers wait outside the hotel. The night passes.';return null},
 /* the case page: who is who, one line each, and the story so far (story.js) */
 who:{ronge:['🎖️','Captain Ronge','head of the army\'s secret service. He set the trap.'],kubicek:KUBW,door:KUBW,
waterman:['🪣','The man at the cab stand','he sees where people go.'],porter:['🛎️','The porter','of the Hotel Klomser.'],
  claim:REDLW,redl:REDLW},
 sofar(cs){const l=['Two letters with Russian money wait at the post office for "Opernball 13".'];
  if(done('ronge'))l.push('Captain Ronge set a trap. Police wait behind the counter.');if(cs.f.set)l.push('The clerk will ring a bell when the man asks for the letters.');
  if(cs.ch>=2)l.push('At 5:52 pm a man in grey took the letters. He drove off in a red taxi.');
  if(cs.f.chase==='kept')l.push('You followed the taxi to the Café Kaiserhof.');if(cs.f.chase==='lost')l.push('You lost the taxi. It will come back to its stand.');
  if(storyHas('sheath'))l.push('On the taxi seat you found a grey knife sheath.');if(cs.f.klomser)l.push('The man in grey went on to the Hotel Klomser.');
  if(storyHas('claimed'))l.push('Colonel Redl took the sheath. He is the man.');if(storyHas('brussels')||storyHas('warsaw'))l.push('He threw away receipts for letters to Brussels and Warsaw.');
  if(cs.ch>=4)l.push('Now Redl must answer in Room No. 1.');return l},

 ch:{
 /* chapter 1: the trap, set in the normal city of May 1913 */
 1:{tasks:[{id:'ronge',t:'Talk to Captain Ronge.',pl:'the post office',at:POST,talk:'ronge',why:'He runs the army\'s secret service. He found the letters.'},
   {id:'kubicek',t:'Talk to the clerk.',pl:'the post office',at:POST,talk:'kubicek',when:()=>done('ronge'),why:'She hands out the letters. She must warn the police when the man comes.'},
   {id:'bell',t:'Wait for the bell.',pl:'the post office',at:POST,icon:'🔔',btn:'⏩ Wait for the bell',when:()=>done('kubicek'),act:cs=>bell2(cs),why:'The bell rings when someone asks for the letters.'}],
  after(cs,id){if(id==='kubicek'&&!cs.f.set){cs.f.set=1;toast('🔔 The trap is set. Now wait for the bell.')}}},
 /* chapter 2: Saturday evening, from the bell */
 2:{start(cs){cs.clk=Math.max(cs.clk||0,BELL);cs.f.t2=1;storyUI()},
  tasks:[{id:'door',t:'Talk to the clerk.',pl:'the post office door',at:POST,talk:'door',why:'She saw the man who took the letters.'},
   {id:'chase',t:'Follow the red taxi.',pl:'the street',at:POST,icon:'🚕',when:cs=>done('door')&&!cs.f.chase,hidden:1,why:'The man with the letters is in it.'},
   {id:'standwait',t:'Wait for the red taxi.',pl:'the cab stand, Kolowratring',at:STAND,icon:'🚕',btn:'⏩ Wait for the taxi',when:cs=>cs.f.chase==='lost'&&!cs.f.back,act:cs=>{storyClock(25);cs.f.back=1;toast('🚕 After 25 minutes the red taxi comes back to its stand.');storyDone('standwait')},why:'Taxis always come back to their stand.'},
   {id:'cabC',t:'Search the red taxi.',pl:'the Café Kaiserhof',at:CAFE,icon:'🔍',btn:'🔍 Search the taxi',talk:'cabseat',when:cs=>cs.f.chase==='kept',why:'The man sat in it. He may have left something.'},
   {id:'cab',t:'Search the red taxi.',pl:'the cab stand, Kolowratring',at:STAND,icon:'🔍',btn:'🔍 Search the taxi',talk:'cabseat',when:cs=>cs.f.back,why:'The man sat in it. He may have left something.'},
   {id:'water',t:'Talk to the man at the cab stand.',pl:'the cab stand, Kolowratring',at:STAND,talk:'waterman',when:()=>storyHas('sheath'),why:'He sees where everyone goes.'},
   {id:'porter',t:'Talk to the hotel porter.',pl:'the Hotel Klomser',at:KLOMSER,talk:'porter',keep:1,when:cs=>cs.f.klomser,why:'The man in grey went into his hotel.'},
   {id:'lobby',t:'Watch the lobby.',pl:'the Hotel Klomser',at:KLOMSER,icon:'👀',btn:'👀 Watch the lobby',talk:'claim',when:cs=>cs.f.left,why:'Who will take the sheath?'},
   {id:'tail',t:'Follow Colonel Redl.',pl:'the Herrengasse',at:KLOMSER,icon:'👁️',hidden:1,when:cs=>done('lobby'),why:'He is throwing papers away.'}]},
 /* chapter 3: before midnight, six things in any order */
 3:{start(cs){storyUI()},
  tasks:[{id:'hand',t:'Compare the handwriting.',pl:'Police room, Hauptpostamt',at:POST,icon:'✍️',btn:'✍️ Compare the handwriting',act:()=>handPuzzle()},
   {id:'riedhof',t:'Listen at the fence of the Riedhof beer garden.',pl:'Riedhof beer garden',at:RIEDHOF,icon:'👂',btn:'👂 Listen',by:23*60,act:cs=>toast(cs.clk<20*60?'👂 They have not come yet. Come back after 8 pm.':'👂 Stand still by the fence, in the dark.')},
   {id:'pollak',t:'Talk to Dr. Pollak.',pl:'Café Kaiserhof',at:CAFE,talk:'pollak',by:22*60+30,when:cs=>cs.clk>=21*60+15},
   {id:'sladek',t:'Talk to Redl\'s servant.',pl:'Bankgasse, back door',at:BANK,talk:'sladek',by:23*60+30},
   {id:'vorlicek',t:'Talk to Major Vorlíček.',pl:'Westbahnhof',at:WEST,talk:'vorlicek',by:23*60+20},
   {id:'conrad',t:'Answer the telephone.',pl:'Police room, Hauptpostamt',at:POST,icon:'☎️',btn:'☎️ Answer the telephone',talk:'conrad',when:()=>storyHas('D1')&&storyHas('D2')},
   {id:'telegram',t:'Send a telegram to Prague.',pl:'Hauptpostamt',at:POST,icon:'📨',btn:'📨 Send the telegram',by:MID,when:cs=>cs.f.hint,act:cs=>{
    evChoice('📨 A telegram to Prague','Stop the search of Redl\'s flat in Prague. Then nobody will know.',[['📨 Send it',()=>{cs.f.tele=1;storyClock(5);storyDone('telegram');toast('📨 The telegram is on its way to Prague.')}],['Not now',()=>{}]])}}]},
 /* chapter 4: Room No. 1 */
 4:{start(cs){storyUI();storyTip('clock','🕒 Time passes as you walk and talk. Be in Room No. 1 before midnight.')},
  tasks:[{id:'room',t:'Go to Room No. 1.',pl:'the Hotel Klomser',at:KLOMSER,icon:'🚪',btn:'🚪 Go into Room No. 1',by:MID,why:'The commission waits there. Redl must answer.',act:()=>talkOpen('redl',()=>{const cs=ST();if(cs&&!cs.f.end)askChoice()},'room')}]}},

 /* fixed times (minutes from midnight before Saturday) */
 timed:[{id:'mid',at:MID,fn(cs){if(cs.ch===3){evChoice('🕛 Midnight','Majesty, the commission is at the Hotel Klomser. They wait for you.',[['📍 Go there',()=>{storyChapter(4);walkOn(tileOf(KLOMSER))}],['Later',()=>storyChapter(4)]])}}},
  {id:'late',at:MID,fn(cs){if(cs.f.end||cs.ch!==4)return;cs.f.late=1;if(TK)talkEnd('x');cardThen('🕐 Too late','Majesty, it is midnight. The commission went into Room No. 1 without you. They did it General Conrad\'s way.',()=>ending('A'))}}],
 waits(cs){const w=[];if(cs.ch===1&&cs.f.set)w.push({l:'⏩ Wait for the bell',fn:bell2});return w},
 /* in chapter 1 the bells ring by themselves after a while of play in May (the calendar runs until the real bell) */
 tick(cs){if(PLS!==S){PLS=S;placesUp()}},
 /* three 👑 replies: Redl hears at dinner that the Emperor himself asks questions */
 word(cs){cs.f.burnt=1;storyLose('zednicek');toast('👑 Redl hears that the Emperor is asking questions. He burns some papers. Pollak will not talk to you now.')},
 wrong(cs){cs.f.bad=(cs.f.bad||0)+1},

 talks:{
 ronge:{who:'Captain Ronge, army secret service',seed:.3,kind:9,say:'Two letters full of money, Majesty. Nobody comes for them.',n:{
  a:{t:'They came from the Russian border. Inside were addresses of Russian spies in Geneva and Paris. They wait here for "Opernball 13".',card:'cover',o:[['strict','Who in Vienna sells to the Russians?','b'],['kind','Then we wait for him.','c']]},
  b:{t:'Someone who knows our secrets. We will find out today.',o:[[null,'Then we wait for him.','c']]},
  c:{t:'Two police officers wait behind the counter. Your Joseph Müller is one. Tell the clerk to ring the bell when he comes.',end:1}}},
 letters:{who:'The two letters',obj:1,n:{
  a:{note:1,t:cs=>cs.f.le&&cs.f.lm&&cs.f.ls?'You have seen everything.':'Two thick letters lie on the table. Look at each thing.',o:[[null,'🔍 The envelopes','e',cs=>!cs.f.le],[null,'🔍 The banknotes','m',cs=>!cs.f.lm],[null,'🔍 The pickup slip','s',cs=>!cs.f.ls]]},
  e:{note:1,t:'The postmark says Eydtkuhnen. It is a town on the Russian border.',fx:cs=>{cs.f.le=1},o:[[null,'Back','a']]},
  m:{note:1,t:'New banknotes, in number order. 6,000 kronen in one letter. 8,000 in the other.',card:'sums',fx:cs=>{cs.f.lm=1},o:[[null,'Back','a']]},
  s:{note:1,t:'The man who collects the letters must sign this slip. Then we have his handwriting.',card:'slip',fx:cs=>{cs.f.ls=1},o:[[null,'Back','a']]}}},
 kubicek:{who:'Miss Kubiček, the clerk',seed:.86,say:'A gentleman, Majesty? Most of my letters are for young ladies.',n:{
  a:{t:'When he asks for "Opernball 13", what shall I do?',o:[[null,'Press the bell to the police room.','b'],['kind','Count his change very slowly.','c'],['strict','Keep him here, whatever it takes.','d']]},
  b:{t:'Yes, Majesty. The bell rings in the room next door.',o:[['kind','And count his change very slowly.','c'],['strict','Keep him here, whatever it takes.','d'],[null,'That is all.','z']]},
  c:{t:'I will be very slow, Majesty.',fx:cs=>{cs.f.slow=1},end:1},
  d:{t:'I… I will try, Majesty.',fx:cs=>{cs.f.drop=1},end:1},
  z:{t:'Yes, Majesty.',end:1}}},
 muller:{who:'Joseph Müller, police detective',seed:.3,kind:9,say:'We wait, Majesty. Waiting is most of this work.',n:{
  a:{t:'The bell will ring in this room when he comes. Then we run to the counter.',end:1}}},
 young:{who:'A young man at the counter',seed:.5,say:'Opernball twelve, miss. Twelve! It is urgent.',n:{
  a:{note:1,t:'It is the wrong man. His letters are love letters from a married lady.',o:[['kind','Let him go. Good luck to him.','b'],['strict','Write down his name.','c']]},
  b:{who:'Joseph Müller',t:'Not every secret is a crime, Majesty.',end:1},
  c:{note:1,t:'He gives a name. It is surely not his real name. Nothing comes of it.',min:5,end:1}}},
 door:{who:'Miss Kubiček, the clerk',seed:.86,say:'He is gone! A man in grey took a taxi. That way!',n:{
  a:{t:cs=>cs.f.drop?'I dropped the letters. He saw it, and he ran out. He took a red taxi!':cs.f.slow?'I counted very slowly. But he took the letters and ran out. He took a red taxi!':'He took the letters and ran out. He took a red taxi!',end:'🚕 Follow the taxi'}}},
 hawranek:{who:'Leopold Hawranek, taxi driver',seed:.45,say:'I drive people, sir. I do not look at their faces.',n:{
  a:{t:'What do you want, sir?',o:[['kind','Here is a krone for your trouble.','b'],['strict','Police business. Where did he go?','c'],['king','Your Emperor asks you.','d']]},
  b:{t:'Thank you, sir. A man in grey. No uniform, but he stood like an officer. I took him to the Café Kaiserhof. He paid more than the meter.',card:'drove',end:1},
  c:{t:'Police? I told you. I do not look at faces.',min:10,o:[['kind','Here is a krone for your trouble.','b'],['king','Your Emperor asks you.','d']]},
  d:{t:'Your Majesty! I took him to the Café Kaiserhof. I swear it.',card:'drove',end:1}}},
 cabseat:{who:'The red taxi',obj:1,n:{a:{note:1,t:'On the back seat lies a small sheath for a pocket knife. It is made of light grey cloth.',card:'sheath',o:[[null,'Keep it.','b']]},
  b:{who:'Joseph Müller',t:'The driver says the man went to the cab stand on the Kolowratring, Majesty. Ask the man there.',end:1}}},
 waiter:{who:'The head waiter, Café Kaiserhof',seed:.2,say:'Nobody came in, sir. It is a normal Saturday.',no:'I see many people, sir. That proves nothing.',shut:'I am busy, sir. Good evening.',n:{
  a:{t:'Nobody came in, sir. I would remember.',lie:{proof:['drove','incafe'],next:'b'}},
  b:{t:'Yes. That gentleman. He did not sit down. He walked straight through and out of the other door. To the cab stand.',card:'otherdoor',end:1}}},
 waterman:{who:'The man at the cab stand',seed:.52,kind:2,say:'I look after the cab stand, sir. I hear where people go.',n:{
  a:{t:'Yes, sir?',o:[['kind','A coin for you. Where did the man in grey go?','b'],['strict','Tell me where the man in grey went.','c'],['king','Your Emperor asks you.','d']]},
  b:{t:'Thank you, sir. He took a cab to the Hotel Klomser. In the Herrengasse.',fx:cs=>{cs.f.klomser=1},end:1},
  c:{t:'Why should I tell you? … All right. He went to the Hotel Klomser. In the Herrengasse.',min:5,fx:cs=>{cs.f.klomser=1},end:1},
  d:{t:'Your Majesty! He went to the Hotel Klomser. In the Herrengasse.',fx:cs=>{cs.f.klomser=1},end:1}}},
 porter:{who:'The porter, Hotel Klomser',seed:.38,say:'The Hotel Klomser does not talk about its guests, sir.',no:'I do not know what that is, sir.',n:{
  a:{t:'How can I help you, sir?',o:[['kind','Who came by cab in the last hour?','b'],['strict','Police. I need the names of your guests.','c'],['king','Your Emperor asks you.','k']]},
  c:{t:'I cannot say, sir.',min:5,lie:{proof:'sheath',next:'b'},o:[['kind','Who came by cab in the last hour?','b'],['king','Your Emperor asks you.','k']]},
  b:{t:'Three gentlemen. Herr Wolański from Galicia. Herr Sedláček from Brünn, with his wine. And a gentleman from Prague, in Room No. 1.',fx:cs=>{cs.f.three=1},o:[[null,'🔪 Leave the sheath here. Watch who takes it.','leave',()=>storyHas('sheath')],[null,'🚪 Knock on all three doors.','knock'],[null,'👉 It is the man from Galicia.','gal']]},
  k:{t:'Your Majesty! Three gentlemen. Herr Wolański from Galicia. Herr Sedláček from Brünn. And a gentleman from Prague, in Room No. 1.',fx:cs=>{cs.f.three=1},o:[[null,'🔪 Leave the sheath here. Watch who takes it.','leave',()=>storyHas('sheath')],[null,'🚪 Knock on all three doors.','knock'],[null,'👉 It is the man from Galicia.','gal']]},
  knock:{note:1,t:'You knock on all three doors. Herr Wolański is angry. Herr Sedláček has drunk too much wine. From Room No. 1 a voice says: "I am resting."',min:20,word:1,o:[[null,'🔪 Leave the sheath here after all.','leave',()=>storyHas('sheath')]],end:'Leave'},
  gal:{note:1,t:'You accuse Herr Wolański in the lobby. He is very angry. The Galician members of parliament will complain.',min:10,word:2,fx:()=>{prestDown(5)},o:[[null,'🔪 Leave the sheath here after all.','leave',()=>storyHas('sheath')]],end:'Leave'},
  leave:{t:'Of course, sir. I will ask the gentlemen when they come down.',fx:cs=>{cs.f.left=1},done:1,end:1}}},
 claim:{who:'The lobby of the Hotel Klomser',obj:1,indoor:1,n:{
  a:{note:1,t:'You wait in a corner of the lobby. A gentleman in grey comes down the stairs.',min:10,o:[[null,'Watch.','b']]},
  b:{who:'The porter',t:'Excuse me, Colonel. Did you lose this?',o:[[null,'Watch.','c']]},
  c:{who:'The gentleman in grey',t:'Yes, thank you.',o:[[null,'Watch.','d']]},
  d:{note:1,t:'He puts the sheath in his pocket. Then he stops. He looks around the lobby.',o:[[null,'Watch.','e']]},
  e:{who:'Joseph Müller, very quietly',t:'Majesty, that is Colonel Redl. He led the army\'s spy-catchers. He taught us half of what we know.',card:'claimed',fx:()=>{if(window.speakLine)speakLine('Majesty, that is Colonel Redl. He led the army\'s spy-catchers.',.3)},end:'👁️ Follow him'}}},
 pollak:{who:'Dr. Viktor Pollak, the state prosecutor',seed:.25,say:'Majesty, I have known Alfred for twenty years. Tonight I do not know him.',n:{
  a:{t:cs=>cs.f.burnt?'Forgive me, Majesty. I cannot speak to you tonight.':'What do you want from me, Majesty?',o:[['kind','You did right to come to me.','b',cs=>!cs.f.burnt],['strict','You are a prosecutor. What is it?','c',cs=>!cs.f.burnt]],end:'Leave'},
  b:{t:'He asked me to help him get back to Prague tonight. He said he was lost.',card:'lost',end:1},
  c:{t:'I telephoned the police. They say it can wait until tomorrow.',card:'gayer',end:1}}},
 sladek:{who:'Josef Sladek, Redl\'s servant',seed:.45,kind:9,say:'The Colonel is a good master. I will hear nothing against him.',n:{
  a:{t:'What do you want, sir?',o:[['kind','You are loyal. Tell me about his motorcar.','b'],['strict','Answer me, soldier. Where is his money from?','c']]},
  b:{t:'A Daimler, from August 1911. It cost 18,000 kronen. It is at Zednicek\'s for new bodywork. He paid with new banknotes. All of it.',card:'daimler',end:1},
  c:{t:'I am a soldier of the Eleventh Regiment. I am not a spy on my master.',end:1}}},
 vorlicek:{who:'Major Vorlíček, a military judge',seed:.35,kind:9,say:'Majesty, my sister-in-law is ill. Our train leaves at 11:20.',n:{
  a:{t:'I must take her to Davos tonight. What do you wish, Majesty?',o:[['strict','I need a judge tonight. Please stay.','b'],['kind','Go with her. Your family comes first.','c']]},
  b:{t:'Then I stay. A porter will take her to the train.',fx:cs=>{cs.f.judge=1},end:1},
  c:{t:'Thank you, Majesty. God keep you.',fx:cs=>{cs.f.judge=0},end:1}}},
 conrad:{who:'General Conrad von Hötzendorf, on the telephone',phone:1,say:'Majesty, the honour of the army cannot stand in a courtroom.',n:{
  a:{t:'Please let it end tonight, quietly. Let the army deal with it.',o:[[null,'I will decide in Room No. 1.','b']]},
  b:{t:'As you wish, Majesty.',card:'conrad',end:1}}},
 redl:{who:'Colonel Alfred Redl',seed:.12,kind:0,indoor:1,say:'Gentlemen. I know why you have come.',dbl:cs=>!!cs.f.judge,no:'That proves nothing, Majesty.',shut:'I will say nothing more.',n:{
  a:{note:1,t:'Room No. 1. Captain Ronge and two generals are with you. Redl is in his shirtsleeves. He has been writing letters.',o:[[null,'Begin.','c1']]},
  c1:{t:'I was not in that taxi. I was here all evening.',lie:{proof:['D1','sheath','claimed'],next:'c1b'},o:[[null,'Go on.','c2']]},
  c1b:{t:'… Yes. It was my sheath. I was in the taxi.',fx:cs=>{cs.f.br=(cs.f.br||0)+1},o:[[null,'Go on.','c2']]},
  c2:{t:'It happened once, this spring. I had debts.',lie:{proof:['D3','brussels','warsaw'],next:'c2b'},o:[[null,'That is enough.','ch']]},
  c2b:{t:'Brussels, Warsaw… You were careful. I taught you that. Yes, for years.',fx:cs=>{cs.f.br=(cs.f.br||0)+1},o:[[null,'That is enough.','ch']]},
  c3:{t:'They were only old papers, Majesty. Nothing new.',lie:{proof:'D5',next:'c3b'},o:[[null,'Go on to the next point.','c4']]},
  c3b:{t:'… They paid well. They always paid well.',fx:cs=>{cs.f.br=(cs.f.br||0)+1},o:[[null,'Go on.','c4']]},
  c4:{t:'My money comes from my family.',lie:{proof:'D4',next:'c4b'},o:[[null,'Go on to the next point.','c5']]},
  c4b:{t:'The motorcar was vanity. Everything was.',fx:cs=>{cs.f.br=(cs.f.br||0)+1},o:[[null,'Go on.','c5']]},
  c5:{t:'Nobody helped me. Not in Prague, not here. I did it alone.',truth:'Nobody. I did it alone.',o:[[null,'That is enough.','ch']]},
  ch:{who:'General Höfer',t:'Majesty, General Conrad asks that the army deal with this tonight. Quietly. What do you decide?',
   o:[[null,'⚔️ Leave it to the army.',()=>choose('A')],[null,'⚖️ Arrest him. A court-martial.',()=>choose('B')]]}}},
 kisch:{who:'Egon Erwin Kisch, a reporter in Prague, on the telephone',phone:1,say:'Majesty, this is Kisch, of Prague. Is it true about Colonel Redl?',n:{
  a:{t:'Is it true, Majesty? Did Colonel Redl sell secrets to Russia?',o:[['strict','No comment.','n'],['kind','It is true.','t'],['king','It is a lie.','l']]},
  n:{t:'I understand, Majesty. Good night.',end:1},
  t:{t:'Thank you, Majesty. I will write it honestly.',fx:cs=>{S.prest+=3;cs.f.kisch='true'},end:1},
  l:{t:'A lie, Majesty? I see. Good night.',fx:cs=>{cs.f.kisch='lie';prestDown(cs.f.end==='A'?4:2)},end:1}}}},

 /* the street: the taxi chase, the tail through the Herrengasse, listening at the Riedhof, the night after ending A */
 /* where a task is done: the street tile at a place's door (story.js), and the point before the door on its forecourt, a step to one
    side for each person waiting there so no two stand in one spot (story3d.js) */
 tile:at=>tileOf(at),
 door(at,id,K){const q=plOf(at);if(!q)return null;const[o,p,back]=q,f=p.f,T=K.E(1)-K.E(0),ry=PLRY[plDoor(o,p,back)],d=p.out?f*T/2+1.6:f*T/2-2.6,sx=Math.sin(ry),sz=Math.cos(ry);
  let h=0;for(const c of id||'')h=(h*31+c.charCodeAt(0))%997;const off=id?((h%5)-2)*1.5:0;
  return[K.E(o.x+(f-1)/2)+sx*d+sz*off,K.E(o.y+(f-1)/2)+sz*d-sx*off]},
 street(cs,now,wk,K){const r=rt(cs);
  if(cs.f.night)return night(cs,now,wk,K,r);
  if(cs.ch===2&&done('door')&&!cs.f.chase)return chase(cs,now,wk,K,r);
  if(cs.ch===2&&done('lobby')&&!done('tail'))return tail(cs,now,wk,K,r);
  if(cs.ch===3&&!cs.tk.riedhof)return listen(cs,now,wk,K,r);
  return false},
 draw(cs,now,wk,K){const r=rt(cs);
  /* the signs of the places, by their doors */
  /* against the house front, beyond the walk, facing the street; not while a talk is on */
  if(!TK)for(const[k,txt,at]of SIGNS){if(plOf(at))continue;const i=tileOf(at);if(i<0)continue;const x=K.E(i%W),z=K.E(i/W|0);if(Math.hypot(x-wk.x,z-wk.z)>140)continue;const s=K.spot({id:'sg_'+k,at});if(!s)continue;let dx=s[0]-x,dz=s[1]-z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;K.sign(k,txt,s[0]+dx*1.8-dz*3,s[1]+dz*1.8+dx*3,Math.atan2(-dx,-dz))}
  {const q=plOf(WEST);if(q&&K.plaque){const[o,p]=q,f=p.f,T=K.E(1)-K.E(0),ry=PLRY[plDoor(o,p)],x=K.E(o.x+(f-1)/2),z=K.E(o.y+(f-1)/2),d=f*T/2-1.3;
   if(Math.hypot(x-wk.x,z-wk.z)<160)K.plaque('west','WESTBAHNHOF',x+Math.sin(ry)*d,6.8,z+Math.cos(ry)*d,ry,7.4)}}
  if(r.tx){const p=K.along(r.tx,r.td||0);K.car(p[0],p[1],p[2],.03,r.spin||0)}
  if(r.cab&&r.cab.auto)K.car(wk.x,wk.z,wk.byaw,.302,r.cspin||0);
  /* the red taxi waiting at the café door after a kept chase, until it is searched */
  if(cs.f.chase==='kept'&&!done('cabC')&&!r.tx){const s=K.spot({id:'cabC',at:CAFE});if(s)K.car(s[0]+2.4,s[1]+1.4,1.2,.03,0)}
  /* the red taxi back at its stand */
  if(cs.ch===2&&cs.f.back&&!done('cab')&&!r.tx){const s=K.spot({id:'taxistand',at:STAND});if(s)K.car(s[0]+2.2,s[1]+1.2,1.2,.03,0)}
  if(r.redl&&r.rp){const p=K.along(r.rp,r.rd);K.actor(p[0],p[1],p[2],.12,r.rgo?r.rd*1.6:0,0,null,false)}
  if(r.scr)K.scraps(r.scr.filter(s=>!s.got).map(s=>s.p),now);else K.scraps([],now);
  if(r.fence)K.actor(r.fence[0],r.fence[1],r.fence[2],.12,0,0,null,false,null,true)}});

/* for testing from the console: what lives only while the game runs */
STORIES.redl.rt=()=>RT;STORIES.redl.places=()=>PLACES;
const SIGNS=[['post','K.K. HAUPTPOSTAMT',POST],['cafe','CAFÉ KAISERHOF',CAFE],['klomser','HOTEL KLOMSER',KLOMSER],['stand','AUTOMOBIL-STANDPLATZ',STAND],['riedhof','RIEDHOF',RIEDHOF]];

/* the bells of chapter 1: a false alarm, then the real one */
function bell1(cs){if(cs.f.bell1)return;cs.f.bell1=1;sfx('chime');evChoice('🔔 The bell!','Majesty, the bell rings in the police room. Someone asks for the letters!',[['📍 Go there',()=>walkOn(tileOf(POST))],['Later',()=>{}]]);storyUI()}
function bell2(cs){if(cs.f.bell2)return;cs.f.bell2=1;sfx('chime');
 const wk=onFoot(),i=tileOf(POST);evChoice('🔔 The bell!','5:52 pm. A man has asked for the letters of "Opernball 13"! Run to the counter.',[['🏃 Run to the counter',()=>{storyChapter(2);if(!wk||!window.storyNear||!storyNear(i,60))walkOn(i);S.case.f.face=1}]])}

/* ---------- the chase: the red taxi drives its real way from the Fleischmarkt down the Rotenturmstraße, round to the Ring and along
   it to the Kolowratring and the Café Kaiserhof. The Emperor takes the wheel of a green motorcar at the post office door and follows:
   keep it in sight (lose it for a few seconds and it is gone), but not too close (the man looks back). The taxi slows at corners and
   in traffic and now and then pulls ahead; a light hand keeps the green car on the street. Or the player lets a driver follow it ---------- */
const WP_free=()=>true,TXV=6.6,FAR=70,CLOSE=8,LOSE=5,WAYS=[POST,[48.2097,16.3744],[48.2073,16.3786],[48.2049,16.3794],STAND,CAFE];
/* the way through its points, street by street, as one path */
function txRoute(K){const raw=[];for(let k=0;k+1<WAYS.length;k++){const p=K.route(tileOf(WAYS[k]),tileOf(WAYS[k+1]));if(!p)continue;for(const q of p.pts)raw.push(q)}
 /* no going out and back at a joint, and no zigzag where the street is straight: a point is left out where the way past it stays on the street */
 const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<.5,road=(x,z)=>K.isRoadT(Math.floor(K.TL(x)),Math.floor(K.TL(z)));let pts=[];
 for(const q of raw){if(pts.length&&same(q,pts[pts.length-1]))continue;if(pts.length>=2&&same(q,pts[pts.length-2])){pts.pop();continue}pts.push(q)}
 for(let k=1;k+1<pts.length;){const a=pts[k-1],b=pts[k+1];let ok=true;for(let u=.25;u<1;u+=.25)if(!road(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u)){ok=false;break}if(ok&&Math.hypot(b[0]-a[0],b[1]-a[1])<30)pts.splice(k,1);else k++}
 if(pts.length<2)return null;const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));return{pts,cum,L:cum[cum.length-1]}}
function chase(cs,now,wk,K,r){
 if(!r.tx){r.tx=txRoute(K);if(!r.tx){lostTaxi(cs,r);return false}r.td=16;r.cab=null;r.lost=0;r.near=0;r.end=0;r.ask=0}
 const dt=Math.min(.1,(now-(r.lt||now))/1000);r.lt=now;r.spin=(r.spin||0)+dt*8;
 /* first the choice, in the green car at the door; the taxi waits for it */
 if(!r.cab){if(!r.ask){r.ask=1;const p=K.along(r.tx,0);r.cd=0;r.lat=0;r.rel=0;
   /* the green car keeps to the taxi's street, so a phone is fair: the stick gives throttle and brake, and the wheel moves it across the
      street and turns its nose; too far to the side it scrapes the kerb and slows. Driving into the taxi's back bumps it */
   K.drive(true,p[0],p[1],p[2],.302,(R,dt,st)=>{const w=K.walker();if(!w||!r.tx)return;r.rel=Math.max(-.7,Math.min(.7,r.rel-st*dt*Math.min(1.5,Math.abs(R.sp)*.3)*Math.sign(R.sp||1)));
    r.rel*=1-Math.min(1,dt*.9);r.cd=Math.max(0,r.cd+R.sp*Math.cos(r.rel)*dt);r.lat+=R.sp*Math.sin(r.rel)*dt;if(Math.abs(r.lat)>2.6){r.lat=Math.sign(r.lat)*2.6;R.sp*=1-Math.min(1,dt*2);r.rel*=.5}
    if(r.cd>r.td-4.5){r.cd=r.td-4.5;if(R.sp>2){R.sp=1;toast('💥 Bump! You hit the taxi.')}}
    const q=K.along(r.tx,r.cd),cx=Math.cos(q[2]),sx=Math.sin(q[2]);w.x=q[0]+cx*r.lat;w.z=q[1]-sx*r.lat;w.byaw=q[2]+r.rel;
    if(WP_free())w.yaw+=Math.atan2(Math.sin(w.byaw-w.yaw),Math.cos(w.byaw-w.yaw))*Math.min(1,dt*2)});
   evChoice('🚕 Follow the red taxi','Follow the red taxi. Keep it in sight. Don\'t get too close.',[['🚗 Take the wheel',()=>startCab(cs,r,K,true)],['🎩 Let the driver follow it',()=>startCab(cs,r,K,false)]])}
  return true}
 if(!$('#ov').hidden)return true;
 /* the taxi: its pace, slower round corners and in traffic, now and then a spurt; it waits a little if he falls far behind */
 const tp=K.along(r.tx,r.td),tx=tp[0],tz=tp[1],h0=tp[2],ah=K.along(r.tx,r.td+9)[2],turn=Math.abs(Math.atan2(Math.sin(ah-h0),Math.cos(ah-h0)));
 const me=r.cab.auto?K.along(r.tx,r.cab.d):[wk.x,wk.z],gap=Math.hypot(tx-me[0],tz-me[1]);r.gap=gap;
 r.hold=Math.max(0,(r.hold||0)-dt);r.boost=Math.max(0,(r.boost||0)-dt);if(!r.hold&&!r.boost&&now>r.t0){if(Math.random()<dt*.05)r.hold=1.2+Math.random()*1.2;else if(Math.random()<dt*.05)r.boost=2.5}
 let v=now<r.t0||r.hold?0:TXV*(turn>.5?.5:1)*(r.boost?1.3:1)*(gap>50?.35:gap>35?.65:gap<12?1.2:1);if(r.td<r.tx.L)r.td=Math.min(r.tx.L,r.td+v*dt);
 if(r.cab.auto){/* the hired driver: a car length or so behind, held up by the same traffic */const cd=r.cab;const w=Math.min(8,Math.max(0,(r.td-cd.d-14)*.8+v));cd.d=Math.min(r.td-10,cd.d+w*dt);r.cspin=(r.cspin||0)+w*dt*1.6}
 /* the rules: too far for five seconds and it is gone; too close for three and the man looks back */
 r.lost=gap>FAR?r.lost+dt:0;r.near=gap<CLOSE&&!r.cab.auto?r.near+dt:0;
 if(r.near>3&&!r.seen){r.seen=1;storyWord(1);toast('👀 The man in the taxi looks back. He has seen you! Stay further back.')}
 K.mark(tx,tz,'🚕',r.lost>0?`Too far! ${Math.max(0,Math.ceil(LOSE-r.lost))}`:r.near>0?'Too close!':r.hold?'Held up in traffic…':`The red taxi · ${Math.round(gap)} m`);
 if(r.lost>LOSE){endCab(K,r);lostTaxi(cs,r);return true}
 /* at the café: the man gets out; close enough to see it and the chase is won */
 if(r.td>=r.tx.L-.5){r.end+=dt;if(gap<35){endCab(K,r);cs.f.chase='kept';storyClock(4);storyDone('chase');toast('🚕 The man in grey goes into the Café Kaiserhof. The red taxi waits at the door.');r.tx=null;return false}
  if(r.end>8){endCab(K,r);lostTaxi(cs,r);return true}}
 return true}
function startCab(cs,r,K,self){r.t0=performance.now()+2500;r.cab={d:0,auto:!self};
 if(self){toast(matchMedia('(pointer:coarse)').matches?'🚗 Push the circle up to drive, down to brake, left and right to steer':'🚗 W to drive, S to brake, A and D to steer · Shift for full speed');return}
 K.drive(false);K.hide(true);toast('🎩 "Follow that red taxi!"');
 K.carry((W_,dt)=>{const p=K.along(r.tx,Math.max(0,r.cab.d));W_.x=p[0];W_.z=p[1];W_.byaw=p[2];W_.yaw+=Math.atan2(Math.sin(p[2]-W_.yaw),Math.cos(p[2]-W_.yaw))*Math.min(1,dt*2)});
 K.cam((WC,WL)=>{if(!r.cab)return false;const p=K.along(r.tx,Math.max(0,r.cab.d)),fx=Math.sin(p[2]),fz=Math.cos(p[2]);WC.set(p[0]-fx*9,4.2,p[1]-fz*9);WL.set(p[0]+fx*12,1.2,p[1]+fz*12);return true})}
function endCab(K,r){K.drive(false);K.carry(null);K.cam(null);K.hide(false);r.cab=null}
function lostTaxi(cs,r){cs.f.chase='lost';r.tx=null;r.cab=null;storyDone('chase');toast('🚕 The red taxi is gone. It will come back to its stand on the Kolowratring.')}

/* ---------- the tail: Redl walks up the Herrengasse and through the passage to the Freyung, tearing up papers as he goes. Pick up
   the scraps by walking over them; lose him, and the ones still lying there blow away ---------- */
const SCRAPS=['brussels','warsaw'];
function tail(cs,now,wk,K,r){if(!r.rp){/* up the Herrengasse past the Freyung: a walk of a minute or so, wherever the places stand */
  const a=tileOf(KLOMSER);for(const q of[[48.2131,16.3632],[48.2126,16.3640],[48.2122,16.3626]]){const p=K.route(a,histRoad(q[0],q[1]));if(p&&p.L>=70&&p.L<=220){r.rp=p;break}if(p&&(!r.rp||p.L>r.rp.L))r.rp=p}if(!r.rp){storyDone('tail');toChapter4(cs);return false}
  storyTip('tail','👁️ Follow Redl, but not too close. Walk over the paper scraps he drops to pick them up.');r.rd=0;r.redl=1;r.rgo=0;r.scr=SCRAPS.filter(k=>!(k==='zednicek'&&cs.f.burnt)).map((k,i,a)=>{const p=K.along(r.rp,r.rp.L*(i+1)/(a.length+1));return{k,p:[p[0]+.8,p[1]+.6],got:false}})}
 const dt=Math.min(.1,(now-(r.lt||now))/1000);r.lt=now;const p=K.along(r.rp,r.rd),d=Math.hypot(p[0]-wk.x,p[1]-wk.z);
 if(!r.rgo&&d<16)r.rgo=1;if(r.rgo)r.rd=Math.min(r.rp.L,r.rd+(d<5?3.8:3)*dt);
 for(const s of r.scr)if(!s.got&&Math.hypot(s.p[0]-wk.x,s.p[1]-wk.z)<2.6){s.got=true;sfx('click');storyCard(s.k)}
 if(d>40){r.lost=(r.lost||0)+dt}else r.lost=0;
 const left=r.scr.filter(s=>!s.got).length;K.mark(p[0],p[1],'👁️',`Colonel Redl · ${Math.round(d)} m${left?` · ${left} scraps on the ground`:''}${d>30?' · keep up!':''}`);
 if(r.lost>4||r.rd>=r.rp.L){const gone=r.scr.filter(s=>!s.got).length;r.redl=0;r.scr=null;storyDone('tail');
  if(gone)toast(`🌬️ The wind takes ${gone===1?'the last scrap':gone+' scraps'}.`);toChapter4(cs)}
 return true}
function toChapter4(cs){cs.clk=Math.max(cs.clk,23*60);evOv('🕵️ Before midnight','Redl goes back into his hotel. The hours pass. Captain Ronge comes, out of breath.<br><br>"The commission meets in Room No. 1 at midnight, Majesty. Come."',true);storyChapter(4)}
function toChapter3(cs){storyClock(10);evOv('🕵️ Before midnight','Redl takes a cab to the Josefstadt. Captain Ronge runs up, out of breath.<br><br>"Now we need his handwriting, Majesty. And the commission meets at midnight."',true);storyChapter(3)}

/* ---------- the Riedhof: Redl dines with Pollak under the trees. Stand still by the fence in the dark to hear them ---------- */
function listen(cs,now,wk,K,r){if(cs.clk<20*60)return false;const s=K.spot({id:'riedhof',at:RIEDHOF});if(!s)return false;r.fence=[s[0]+3,s[1]+2.5,0];
 const d=Math.hypot(s[0]-wk.x,s[1]-wk.z);if(d>8){r.still=0;return false}
 const dt=Math.min(.1,(now-(r.ll||now))/1000);r.ll=now;if(wk.run){r.still=0;storyClock(10);toast('👀 Redl looks up. You step back into the dark.');wk.x-=Math.sin(wk.byaw)*3;wk.z-=Math.cos(wk.byaw)*3;return true}
 r.still=(wk.spd||0)<.2?(r.still||0)+dt:0;K.mark(r.fence[0],r.fence[1],'👂',r.still>0?`Stand still… ${Math.max(1,Math.ceil(5-r.still))}`:'Stand still by the fence');
 if(r.still>5){r.still=0;r.fence=null;talkOpen('riedhofT',()=>{storyDone('riedhof')},null);if(TK)TK.pos=[s[0]+3,s[1]+2.5]}return true}
STORIES.redl.talks.riedhofT={who:'At the Riedhof, through the fence',seed:.12,n:{
 a:{who:'Colonel Redl',t:'Viktor, I have done something no friend can forgive.',o:[[null,'Listen.','b']]},
 b:{who:'Dr. Pollak',t:'Then do not tell me, Alfred. I am the state prosecutor.',card:'forgive',end:1}}};

/* ---------- the handwriting: the slip and an old report side by side. Tap the three letters on the slip that match his hand ---------- */
function handPuzzle(sel){sel=sel||[];const cs=ST();const L_=[['O',1],['p',0],['b',1],['a',0],['l',1],['3',0]];
 const st=k=>k?'font-family:cursive;font-style:italic':'font-family:monospace;font-weight:700';
 ov(`<h2>✍️ Compare the handwriting</h2><p>His old report: <span style="${st(1)};font-size:30px">Opernball</span></p><p class="m">Tap the three letters on the slip that match his hand.</p>
 <div class="btns" style="flex-wrap:wrap">${L_.map((l,i)=>`<button data-h="${i}" style="${st(l[1])};font-size:30px;min-width:56px${sel.includes(i)?';outline:3px solid #b8322a':''}">${l[0]}</button>`).join('')}</div><div class="btns"><button id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=closeOv;document.querySelectorAll('#ovCard [data-h]').forEach(b=>b.onclick=()=>{const i=+b.dataset.h;sfx('click');const s=sel.includes(i)?sel.filter(x=>x!==i):sel.concat(i);
  if(s.length<3){handPuzzle(s);return}if(s.every(k=>L_[k][1])){closeOv();storyCard('report');storyClock(15);storyDone('hand');
   evOv('Captain Ronge','"It is his hand, Majesty. And 14,000 kronen in one month. Nobody pays that much for old papers."<br><br>"One more thing. On Sunday his flat in Prague will be searched. Only a telegram tonight could stop it."',true);storyCard('ronge');cs.f.hint=1;storyUI()}
  else{storyClock(5);toast('✍️ Those do not match. Look again.');handPuzzle([])}})}

/* ---------- the choice and the endings ---------- */
function choose(k){ending(k)}
function askChoice(){evChoice('⚖️ What do you decide?','General Höfer: "Majesty, General Conrad asks that the army deal with this tonight. Quietly."',[['⚔️ Leave it to the army.',()=>ending('A')],['⚖️ Arrest him. A court-martial.',()=>ending('B')]])}
/* a card, and what comes after it once it is closed */
function cardThen(t,x,next,btn){ov(`<h2>${t}</h2><p>${x}</p><div class="btns"><button class="pri" id="ovNx">${btn||'Continue'}</button></div>`);$('#ovNx').onclick=()=>{closeOv();if(next)next()}}
function ending(k){const cs=ST();if(!cs||cs.f.end)return;cs.f.end=k;cs.tk.room=1;if(TK)talkEnd('x');const br=cs.f.br||0;
 if(k==='A'){S.prest=Math.max(0,S.prest-6);S.unrest=(S.unrest||0)+10;cs.f.night=1;storyUI();walkOn(tileOf(KLOMSER));
  toast('🌙 The officers leave the room. They wait at the corner of Herrengasse and Bankgasse.');return}
 if(k==='B'){S.prest+=8+br;S.unrest=(S.unrest||0)+5;cardThen('⚖️ A court-martial','Redl leaves the Hotel Klomser between two officers, in a closed cab. All summer the trial is the talk of Europe. He names the men who carried his letters.<br><br>General Conrad is cold to you for a year. The heir, Franz Ferdinand, is pleased.',()=>monday(cs));return}
 if(cs.f.tele){S.prest+=4;(S.ach||(S.ach={})).redlTurned=1;cardThen('🕵️ Turned','Redl goes back to Prague and to his post. From now on he sends St. Petersburg what Captain Ronge writes for him. Nobody knows.<br><br>⭐ A secret success.',()=>medal(cs));return}
 S.prest=Math.max(0,S.prest-12);S.unrest=(S.unrest||0)+15;cardThen('🕵️ Turned, but…','Redl goes back to Prague and to his post. But nobody stopped the search of his flat in Prague.',()=>monday(cs))}
/* after ending A the camera stays in the street with the officers, and the clock runs on through the night */
function night(cs,now,wk,K,r){if(!r.nt){r.nt=now;K.carry(()=>{})}const dt=Math.min(.1,(now-(r.lnt||now))/1000);r.lnt=now;storyClock(dt*35);
 K.mark(wk.x+Math.sin(wk.byaw)*6,wk.z+Math.cos(wk.byaw)*6,'🌙',`The officers wait · ${clkT(cs.clk)}`);
 if(cs.clk>=MORNING){K.carry(null);cs.f.night=0;cardThen('Sunday, 25 May 1913','At 5:30 in the morning a police officer goes into Room No. 1.<br><br>Colonel Redl is dead.',()=>monday(cs))}return true}
/* Monday's papers, and the telephone */
function monday(cs){if(ST()!==cs)return;const k=cs.f.end;
 cardThen('📰 Monday, 26 May 1913',`On Sunday a locksmith in Prague, Herr Wagner, missed his football match. He had to open a colonel\'s flat. He told the secretary of his club, a young reporter: Egon Erwin Kisch.<br><br>On Monday the Prager Tagblatt has the story. ${k==='B'?'Every paper writes about the trial.':'Every paper writes about the cover-up.'}`,()=>medal(cs))}
/* the case closes: a medal and a headline */
function medal(cs){const d=cs.ded.length,br=cs.f.br||0,m=d>=2&&br>=2&&!cs.f.late?'🥇 Gold':br>=1||d>=1?'🥈 Silver':'🥉 Bronze',k=cs.f.end;
 const head={A:'"Colonel Redl found dead in his hotel"',B:'"Colonel Redl before a court-martial"',C:cs.f.tele?'No headline. Nobody ever knew.':'"The Emperor kept a traitor at his post"'}[k];
 if(ST()!==cs)return;storyEnd(m.includes('Bronze')?'weak':'win');(S.csm||(S.csm={})).redl=m;
 evOv(`🕵️ Case closed: ${m}`,`${head}<br><br>⭐ ${d} of 2 gold cards · 🔓 ${br} of 2 lies broken${cs.f.late?' · ⌛ too late':''}${k==='A'?'<br><br>No one ever learned all that he sold.':''}`,true)}
})();
