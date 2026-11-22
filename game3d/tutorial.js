/* ---------- the guided tutorial (docs/TUTORIAL_PLAN.md): an advisor with a face says one short line at a time, a goal card counts
   the step and, once it is met, says so and moves on by itself (no rewards), a gold ring marks the button to tap and a gold arrow the place on the
   map, and the buildings still to come wait in the build menu as grey sketches. Vienna has Count Crenneville, the Emperor's
   adjutant-general, and the Empress for her one line; New York has Horace Greeley of the Tribune.
   While a tutorial runs nothing else opens: events, letters, scenes, goals and tips wait (letGo, questTick) until the hand-over.
   Its place is S.tg ({i: the step, b: counts at the step's start, ok: the step is done, about to move on}); S.tgDone once over.
   "Play the tutorial again" in More starts a practice city in its own save slot (TGPRACTICE, read by saveKey).
   Every text is written into the page in English, where i18n.js translates it ---------- */
var TGPRACTICE=false;
/* an arrow tapped once: the tutorial knows the player has found how to move a plot */
{const cm0=confMove;confMove=function(...a){if(typeof S!=='undefined'&&S&&S.tg)S.tgMv=1;return cm0.apply(this,a)}}
(function(){
const $q=s=>document.querySelector(s);
/* ---------- the faces, drawn in the style of the game's portraits (round, a brass rim, the coat, the face) ---------- */
const FACES={},SKIN='#ecd0b4';
function face(k){if(FACES[k])return FACES[k];const c=document.createElement('canvas');c.width=240;c.height=280;const g=c.getContext('2d');g.scale(2,2);
 /* a dark ground behind the head, lighter round the face (sage for the Empress, slate for the men): pale skin, white hair and a white
    tunic stand out from it */
 {const el=k!=='cren'&&k!=='greeley',bg=g.createRadialGradient(60,58,6,60,70,72);bg.addColorStop(0,el?'#8fa093':'#5d7075');bg.addColorStop(1,el?'#46564e':'#232f34');g.fillStyle=bg}
 g.beginPath();g.ellipse(60,70,56,66,0,0,7);g.fill();g.strokeStyle='#b8933a';g.lineWidth=3;g.stroke();g.save();g.beginPath();g.ellipse(60,70,54,64,0,0,7);g.clip();
 const coat=(col)=>{g.fillStyle=col;g.beginPath();g.moveTo(8,140);g.quadraticCurveTo(12,100,40,94);g.lineTo(80,94);g.quadraticCurveTo(108,100,112,140);g.fill()};
 const head=(w,h)=>{g.fillStyle=SKIN;g.fillRect(52,80,16,16);g.beginPath();g.ellipse(60,60,w,h,0,0,7);g.fill();g.beginPath();g.ellipse(60-w-.5,62,3,5,0,0,7);g.ellipse(60+w+.5,62,3,5,0,0,7);g.fill()};
 const eyes=(brow)=>{g.fillStyle='#2a1d14';g.beginPath();g.arc(52,60,1.8,0,7);g.arc(68,60,1.8,0,7);g.fill();g.strokeStyle=brow;g.lineWidth=2;g.beginPath();g.moveTo(47,55);g.lineTo(56,54);g.moveTo(64,54);g.lineTo(73,55);g.stroke();
  g.strokeStyle='#b8957a';g.lineWidth=1.5;g.beginPath();g.moveTo(60,60);g.lineTo(58,68);g.lineTo(61,69);g.stroke()};
 if(k==='cren'){/* Count Crenneville: a general's white tunic with the scarlet collar and gold, grey hair, grey side-whiskers joined to the moustache */
  coat('#efece4');g.fillStyle='#b3262b';g.fillRect(44,91,32,9);g.fillStyle='#d9a92a';for(const x of[47,70])for(let i=0;i<3;i++){g.beginPath();g.moveTo(x,93+i*2.5);g.lineTo(x+3,94+i*2.5);g.lineTo(x,95+i*2.5);g.fill()}
  g.fillStyle='#d9a92a';for(let i=0;i<4;i++){g.beginPath();g.arc(60,106+i*9,2,0,7);g.fill()}g.fillStyle='#b3262b';g.beginPath();g.arc(38,114,4,0,7);g.fill();g.fillStyle='#e8e2d6';g.beginPath();g.arc(48,116,3.4,0,7);g.fill();
  head(19,24);g.fillStyle='#a8a296';g.beginPath();g.ellipse(60,42,21,12,0,Math.PI,0);g.fill();g.beginPath();g.moveTo(40,44);g.quadraticCurveTo(54,35,79,41);g.lineTo(80,47);g.fill();
  eyes('#8f897e');g.fillStyle='#d6d0c4';
  for(const s of[-1,1]){g.beginPath();g.moveTo(60+s*19,52);g.quadraticCurveTo(60+s*24,82,60+s*10,84);g.quadraticCurveTo(60+s*7,76,60+s*4,73);g.quadraticCurveTo(60+s*14,70,60+s*16,56);g.fill()}
  g.beginPath();g.ellipse(60,72,10,3.6,0,0,7);g.fill()}
 else if(k==='greeley'){/* Horace Greeley: the pale coat, a white neckcloth, round spectacles, a bald crown with a white fringe, and the fringe of beard under the chin */
  coat('#e6dfcf');g.fillStyle='#f6f3ec';g.beginPath();g.moveTo(48,92);g.lineTo(72,92);g.lineTo(66,104);g.lineTo(54,104);g.fill();g.strokeStyle='#cfc6b2';g.lineWidth=1;g.beginPath();g.moveTo(40,96);g.lineTo(54,124);g.moveTo(80,96);g.lineTo(66,124);g.stroke();
  head(20,25);g.fillStyle='#f0ece4';g.beginPath();g.ellipse(41,52,5,9,.2,0,7);g.ellipse(79,52,5,9,-.2,0,7);g.fill();
  eyes('#d8d2c6');g.strokeStyle='#a0605a';g.lineWidth=1.5;g.beginPath();g.moveTo(55,75);g.quadraticCurveTo(60,77,65,75);g.stroke();
  g.fillStyle='#f3efe8';g.beginPath();g.moveTo(40,64);g.quadraticCurveTo(42,98,60,100);g.quadraticCurveTo(78,98,80,64);g.quadraticCurveTo(76,86,60,88);g.quadraticCurveTo(44,86,40,64);g.fill();
  g.strokeStyle='#3a332c';g.lineWidth=1.2;g.beginPath();g.arc(52,60,5.2,0,7);g.moveTo(73.2,60);g.arc(68,60,5.2,0,7);g.moveTo(57.2,60);g.lineTo(62.8,60);g.stroke()}
 else{/* Empress Elisabeth as Winterhalter painted her in 1865: bare shoulders over a white gown of tulle, a long neck, the chestnut hair
    parted in the middle and wound into a crown of braids set with diamond stars, pearl drops at the ears */
  const hair='#4a2c1c',hl=shade(hair,1.45);
  g.fillStyle=hair;g.beginPath();g.ellipse(60,52,23,22,0,0,7);g.fill();g.beginPath();g.moveTo(40,58);g.quadraticCurveTo(30,84,36,104);g.lineTo(46,100);g.quadraticCurveTo(42,80,46,62);g.fill();
  g.fillStyle=SKIN;g.beginPath();g.moveTo(12,140);g.quadraticCurveTo(16,106,46,99);g.lineTo(74,99);g.quadraticCurveTo(104,106,108,140);g.fill();
  g.fillStyle='#dcbb9c';g.fillRect(54,74,12,10);g.fillStyle=SKIN;g.fillRect(54,82,12,19);
  g.fillStyle='#f4f0e8';g.beginPath();g.moveTo(8,140);g.lineTo(15,117);g.quadraticCurveTo(60,134,105,117);g.lineTo(112,140);g.fill();
  g.strokeStyle='#fffdf6';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(16,118);g.quadraticCurveTo(60,135,104,118);g.stroke();
  g.strokeStyle='#d8d2c4';g.lineWidth=1;g.beginPath();g.moveTo(18,123);g.quadraticCurveTo(60,139,102,123);g.stroke();
  g.fillStyle=SKIN;g.beginPath();g.ellipse(60,59,15.5,20,0,0,7);g.fill();
  g.fillStyle='rgba(214,120,110,.28)';g.beginPath();g.arc(50,67,4.5,0,7);g.arc(70,67,4.5,0,7);g.fill();
  g.fillStyle=hair;for(const d of[-1,1]){g.beginPath();g.moveTo(60,39);g.quadraticCurveTo(60+d*13,40,60+d*16,62);g.quadraticCurveTo(60+d*21,50,60+d*17,38);g.quadraticCurveTo(60+d*8,31,60,36);g.fill()}
  g.beginPath();g.ellipse(60,33,20,8.5,0,0,7);g.fill();g.strokeStyle=hl;g.lineWidth=1.3;for(let i=0;i<6;i++){g.beginPath();g.arc(42.5+i*7,32,3.6,.15,Math.PI-.15);g.stroke()}
  g.beginPath();g.moveTo(60,36.5);g.lineTo(60,40);g.stroke();
  g.strokeStyle='#3a2216';g.lineWidth=1.2;g.beginPath();g.moveTo(48,54.5);g.quadraticCurveTo(52.5,52.5,57,54.5);g.moveTo(63,54.5);g.quadraticCurveTo(67.5,52.5,72,54.5);g.stroke();
  for(const x of[52.5,67.5]){g.fillStyle='#fbf7ef';g.beginPath();g.ellipse(x,60,3.3,2.1,0,0,7);g.fill();g.fillStyle='#4a3020';g.beginPath();g.arc(x,60,1.9,0,7);g.fill();
   g.strokeStyle='#2a1810';g.lineWidth=1.1;g.beginPath();g.moveTo(x-3.5,59.6);g.quadraticCurveTo(x,56.8,x+3.5,59.6);g.stroke()}
  g.strokeStyle='#c9a084';g.lineWidth=1.2;g.beginPath();g.moveTo(60.5,61);g.quadraticCurveTo(58.6,67,59.2,68.6);g.lineTo(61.6,69);g.stroke();
  g.fillStyle='#b8544e';g.beginPath();g.moveTo(55.5,74);g.quadraticCurveTo(58,72.4,60,73.4);g.quadraticCurveTo(62,72.4,64.5,74);g.quadraticCurveTo(60,77.6,55.5,74);g.fill();
  g.fillStyle='#fdfaf0';for(const x of[44.6,75.4]){g.beginPath();g.ellipse(x,70,1.5,2.3,0,0,7);g.fill()}
  g.fillStyle='#fffbe8';for(const[x,y,q]of[[45,34,1],[60,28,1.15],[75,34,1],[52.5,39.5,.8],[67.5,39.5,.8]]){g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=(i%2?1.2:3.1)*q;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.fill()}}
 g.restore();return FACES[k]=c.toDataURL()}
const WHO={cren:['Count Crenneville','Adjutant-general'],greeley:['Horace Greeley','New York Tribune'],sisi:['Empress Sissi','Your wife']};

/* ---------- the steps. A step: who speaks, the line, the goal (what it counts, how many), the buildings it opens (tag:
   the word on the sketches it opens) and the place its arrow points at. Built against today's buildings; the new start
   (docs/ECONOMY_START.md) changes counts and places ---------- */
const own=k=>S.list.filter(o=>o.t===k&&!o.h&&!o.r).length,roads=()=>S.list.filter(o=>o.t==='road'&&!o.h).length;
const grown=()=>S.list.find(o=>o.t==='house'&&!o.h&&!o.bld&&o.lvl>=2);
const raised=()=>S.list.some(o=>o.t==='house'&&!o.h&&(o.tier||0)>=1);
/* who lives in the house to build higher (the open card's, or the one that rose): the class by its name, Craftsmen, Bürger */
const raiseCls=()=>{const h=sel&&sel.t==='house'&&!sel.h?sel:grown();return h&&LV[h.lvl]?LV[h.lvl].n:'people'};
/* the engine asks whether building higher is open yet: from the tutorial's step for it on (the button and the ⬆ arrows wait till then) */
window.tgRaiseOk=()=>{const st=ST(),ri=st.findIndex(s=>s.raise);return ri<0||!S.tg||S.tg.i>=ri};
/* the card of a home is drawn again every second: while the step asks for it, the button is drawn with its gold ring already on, so the
   ring stays steady instead of blinking off at each redraw */
/* the home the lessons on moving up and building higher are about, until it is built higher: labels.js shows the green ⬆ over it */
window.tgRaiseHouse=()=>{if(!tgOn())return null;const s=ST()[S.tg.i];return s&&(s.grow||s.raise)&&!raised()?grown()||null:null};
window.tgRaiseOn=()=>{if(!tgOn()||GAP||STALE)return false;const s=ST()[S.tg.i];return!!(s&&s.raise&&!raised())};
const B1=(k,n,line,tag,who,o)=>Object.assign({who,line,ks:[k],n:[n],open:[k],tag},o||{});
const BN=(ks,line,tag,who)=>({who,line,ks,n:ks.map(()=>1),open:ks,tag});
function stepsFor(){const ny=NYC(),A=ny?'greeley':'cren',M=ny?'Mr. Mayor':'Majesty';return[
 /* looking round is two lessons, one after the other: one finger moves the map, then two fingers zoom it */
 {who:A,line:coarse?'Drag the map with one finger to look around.':'Drag the map to look around.',goal:'Move the map',move:1},
 {who:A,line:coarse?'Now pinch with two fingers to zoom in and out.':'Now scroll to zoom in and out.',goal:'Zoom the map',zoom:1},
 B1('house',2,ny?'Newcomers from Castle Garden need homes, Mr. Mayor.':'The Ring is open, but its plots are still empty. Workers have come to build on them. They need homes, Majesty.','homes',A,{offRoad:1}),
 {who:A,line:ny?'Every house needs a road to City Hall.':'Every house needs a road to the Hofburg.',goal:'Lay a road: tap a start, then an end',road:1,open:['road']},
 /* what the people need, told by the red sign over a house: a tap on it opens the house's card, which says it needs a market and has
    the button to build one; the market first, then the garden that feeds it */
 Object.assign(BN(['market','garden'],()=>own('market')-(S.tg.b.market||0)>=1?'Now the market needs food to sell. Build a vegetable garden.':mode==='market'||pend||!S.list.some(o=>o.t==='house'&&!o.h&&!o.bld&&o.nd)?'Your people need a market first, then food for it.':'Your people need something. Tap the red sign over a house to see what.','food',A),
  {need:'market',lineOn:()=>{const b=$q('#info:not([hidden]) #stlGo');return`This is what they need. Tap “${b?b.textContent.trim():'Build'}” on the card.`},
   /* no card at all until the red sign shows over a home (the homes still going up), so the first word is to tap it, not the answer */
   quiet:()=>!(mode==='market'||pend)&&own('market')-(S.tg.b.market||0)<1&&!S.list.some(o=>o.t==='house'&&!o.h&&!o.bld&&o.nd)}),
 /* bread is Vienna's: New York's homes want only beer, so its grain farm comes with the brewery */
 /* two grain farms at once: with one the mill stood waiting for grain right after the lesson, and the second feeds the brewery later */
 /* backwards from what the people want: the bakery first, then what it lacks (flour: the mill), then what that lacks (grain: the
    farm), so each new building answers the sign over the last one; the list in that order (back), the goods' chain under it */
 ...(breadOn()||!ny?[Object.assign(BN(['bakery','mill','grainf'],()=>{const b=k=>own(k)-(S.tg.b[k]||0)>=1;return!b('bakery')?'They want bread, not only turnips. Bread comes from a bakery: build one.':
   !b('mill')?'The bakery needs flour to bake. The sign over it shows that: tap it.':!b('grainf')?`The ${nm_(B.mill.n)} needs grain to grind. Build two grain farms, so it never waits. Tap the sign over it.`:own('grainf')-(S.tg.b.grainf||0)<2?`Good. Now the second grain farm, so the ${nm_(B.mill.n)} never waits for grain.`:'The farms grow grain, the mill grinds it, the bakery bakes bread.'},'bread',A),{back:1,n:[1,1,2],lineOn:()=>{const b=$q('#info:not([hidden]) #stlGo');return b?`This is what it needs. Tap “${b.textContent.trim()}” on the card.`:fnl(ST()[S.tg.i].line)}})]:[]),
 B1('brick',4,'The builders have stopped. No bricks! A city of stone needs many: build four brickworks.','bricks',A,{goal:'Build 4 brickworks'}),
 /* Vienna's timber comes two ways: rafts down the river to the wharf, and the timber yard felling in the Wienerwald and the Prater woods */
 ny?B1('sawmill',1,'Most buildings need timber.','timber',A):BN(['sawmill','woodcutter'],'Most buildings need timber. Rafts bring it down the river, and woodcutters fell it in the forest.','timber',A),
 /* the stores at the top: first opened to show every good and how much there is, then one good tapped, which tells what makes it,
    with a button to build it; the step waits until that card is closed */
 {who:A,line:'Your stores are at the top. Tap “Stores” to see all your goods.',goal:'Open the stores',tap:'stores'},
 {who:A,line:'Here are all your goods and how much you have. Tap one to see how it is produced.',lineOn:()=>lackLine(),goal:'Tap a good',tap:'good',hold:'#lack'},
 /* beer needs grain as bread does: one grain farm feeds one mill or one brewery, so where there is bread the second farm stands already */
 Object.assign(ny&&!breadOn()?BN(['grainf','brewery'],`Look, ${M}: a family wants to move up. They miss beer.`,'beer',A):B1('brewery',1,`A family wants to move up, ${M}. They miss beer. Beer needs grain too: your second grain farm feeds the brewery.`,'beer',A),{wait:()=>S.list.some(o=>o.t==='house'&&!o.h&&!o.bld&&o.pop>=maxPop(o)),waitLine:'Tap ‘1×’ at the top, next to the date, to make time go faster.',waitFast:'Good. Time now goes faster. You can change it at any time.'}),
 {who:A,line:()=>{const h=grown(),a=h&&LV[h.lvl-1],b=h&&LV[h.lvl];return(ny?'There, Mr. Mayor. Your first brownstone.':'There, Majesty. The first Zinshaus.')+(a&&b?` Its ${a.n} are now ${b.n}.`:'')+' Tap the green ⬆ over it.'},goal:'Tap the ⬆ over the house',grow:1,wait:()=>!!grown(),waitLine:ny?'Beer and a market: the houses will soon rise. Tap ‘1×’ at the top, next to the date, to make time go faster.':'Bread, beer and a market, Majesty: the houses will soon rise. Tap ‘1×’ at the top, next to the date, to make time go faster.'},
 /* then the lesson of building higher, on that house: tap it, then the next level on its card. Before this step the button waits */
 {who:A,line:()=>`Build it higher, ${M}, and more ${raiseCls()} can move in. Tap the house, then ‘🏗️’ to upgrade.`,lineOn:()=>`Build it higher, ${M}, and more ${raiseCls()} can move in. Tap ‘🏗️’ to upgrade.`,goal:'Build it higher',raise:1},
 /* the treasury, before the homes that fill it: every home pays rent tax, so more people bring more money */
 {who:A,line:ny?'This is the city treasury, Mr. Mayor. Every home pays rent tax, so more people bring more money. Tap it to see.':'This is your treasury, Majesty. Every home pays rent tax, so more people bring more money. Tap it to see.',goal:'Open the treasury',tap:'money'},
 B1('house',6,ny?'Your food and beer are enough for about 8 homes. Build 6 more, and more rent comes in.':'Your food, bread and beer are enough for about 8 homes. Build 6 more, and more rent comes in.','homes',A),
 /* Vienna's homes have their church already: the Stephansdom is the inner city's parish church, so only New York builds one here */
 ...(ny?[B1('chapel',1,'They want a church for Sunday.','a church',A)]:[]),
 ny?B1('heuriger',1,'And a beer garden, Mr. Mayor. This is New York.','a beer garden',A):B1('kaffeehaus',1,'Your people want a coffee house, Majesty. This is Vienna.','a coffee house',A),
 ny?B1('stadtpark',1,'The city needs its park, Mr. Mayor.','the park',A,{lm:1}):B1('stadtpark',1,'Franz, the city needs a park.','the park','sisi',{lm:1}),
 /* Vienna: the Emperor lives in the Hofburg and his desk is there; the camera shows the Hofburg, lit, and the hand the 🖋️ at the top */
 ...(ny?[]:[{who:A,line:'You live here in the Hofburg, Majesty, and your desk is inside. Tap 🖋️ at the top to sit at it.',goal:'Open your desk',tap:'desk',hof:1}]),
 {who:A,line:`Look what you have built, ${M}! Tap 🚶 at the bottom to walk through your city.`,end:1}]}
let STEPS=null;const ST=()=>(STEPS||(STEPS=stepsFor()));
const tgOn=()=>!!(S&&S.tg&&!S.tgDone&&L&&L.y1857);
window.tgOn=tgOn;window.tgFace=face;
/* developer mode: the place the tutorial would suggest for a building, to check it from the console */
if(typeof DEV!=='undefined'&&DEV){window.tgSpot=k=>{SPK='';return spotFor(k)};window.tgDev={ST,grown,inRing,wg:i=>wgStart(i),get HAND(){return HAND},get AIM(){return AIM},get FOL(){return FOL},target:()=>target(),loop0:()=>loop0(),get GAP(){return GAP},get STALE(){return STALE}}}
/* names stay as written in Vienna (German nouns keep their capital), small in New York */
const nm=n=>NYC()?n.toLowerCase():n;
/* a building's name inside a sentence: small, except Vienna's German nouns (Kaffeehaus, Heuriger), which keep their capital */
const nm_=n=>/haus|heurig|garten/i.test(n)?n:n.toLowerCase();
/* a step's line may be worked out when shown (the house's own people by name) */
const fnl=x=>typeof x==='function'?x():x;
const goalTxt=s=>s.road&&CONF==='road'?'Tap ✓ to build the road':s.goal||(s.ks.length>1?s.ks.map(k=>B[k].n).join(', '):s.ks[0]==='house'?`Build ${s.n[0]} ${s.n[0]===1?'home':'homes'}`:B[s.ks[0]].n);
/* a step whose buildings make one chain (grain farm → brewery): in the order the goods go, or null */
function chainKs(s){if(!s.ks||s.ks.length<2)return null;let k=s.ks.find(k=>!s.ks.some(j=>B[j].out&&B[j].out===B[k].in));const o=[];
 while(k&&!o.includes(k)){o.push(k);const out=B[k].out;k=out?s.ks.find(j=>B[j].in===out):null}return o.length===s.ks.length?o:null}
/* its goal line: the works by name, each ticked once built; under it the goods with their icons, grain → beer (the only icons) */
function chainGoal(s,o){const ck=o.map(k=>{const i=s.ks.indexOf(k),d=own(k)-(S.tg.b[k]||0)>=s.n[i];return`<span class="tgCk${d?' ok':''}">${B[k].n}${d?' ✓':''}</span>`}).join(', ');
 const gs=[B[o[0]].out,...o.slice(1).map(k=>B[k].out)].filter(Boolean).map(g=>`${ICON[g]||''} ${g==='wood'?'timber':g}`).join(' → ');return[ck,`<span class="tgGoods">${gs}</span>`]}
/* a step of several buildings: one line each, in the order the goods go where they make a chain, a tick when it stands */
function listGoal(s,co){return`<span class="tgL">${(co||s.ks).map(k=>{const i=s.ks.indexOf(k),d=own(k)-(S.tg.b[k]||0)>=s.n[i];return`<span class="tgCk${d?' ok':''}">${B[k].n}${s.n[i]>1?` ×${s.n[i]}`:''}</span>`}).join('')}</span>`}
/* the good's card in the stores lesson, shown slowly: the hand on its build button (one way), on Buy (the other), each with Next, and
   last on ✕; the card stays open while it is told (the game would close it after a few seconds) */
/* the good's card told in one line, its ways named but not pressed (the works that makes it may stand already), then the ✕; and
   once it is closed, the stores closed again */
const stOpen=()=>typeof STOPEN!=='undefined'&&STOPEN;
function lackLine(){if($q('#lack')&&$q('#lack').hidden)return stOpen()?'Now tap “Stores” to close them again.':'';
 return'This shows how much you have, and the ways to get more: build what makes it, or buy it from the merchants. <span class="tgLate">Tap ✕ to close it.</span>'}
/* progress: [done, of] */
/* the player's own hands on the map: a drag of a finger, a pinch or the wheel (the game's own camera flights do not count) */
const HAND={drag:0,zoom:0},PTR=new Map();let GMAX=0,GMV=false;
/* a drag counts once a gesture made with one finger all the way through has moved the map; a pinch (two fingers at any moment) counts
   only as a zoom, so the two lessons are told apart */
document.addEventListener('pointerdown',e=>{if(e.target&&e.target.tagName==='CANVAS'){if(!PTR.size){GMAX=0;GMV=false}PTR.set(e.pointerId,[e.clientX,e.clientY]);GMAX=Math.max(GMAX,PTR.size)}},true);
document.addEventListener('pointermove',e=>{const p=PTR.get(e.pointerId);if(!p)return;if(PTR.size>1)HAND.zoom=1;else if(Math.hypot(e.clientX-p[0],e.clientY-p[1])>30)GMV=true},true);
for(const ev of['pointerup','pointercancel'])document.addEventListener(ev,e=>{if(!PTR.delete(e.pointerId))return;if(!PTR.size&&GMAX===1&&GMV)HAND.drag=1},true);
document.addEventListener('wheel',e=>{if(e.target&&e.target.tagName==='CANVAS')HAND.zoom=1},{capture:true,passive:true});
/* a step that asks for a tap at the top (a good, the money, the desk): done once that was tapped in this step */
const TAPSEL={stores:'#stores [data-st]',good:'#stores [data-g]',money:'#res [data-money]',desk:'#res [data-desk]'};let TAPD=-1,GTAP=false;
document.addEventListener('click',e=>{if(!S||!tgOn()||!e.target||!e.target.closest)return;if(e.target.closest(TAPSEL.good)){GTAP=true;setTimeout(()=>GTAP=false,0)}
 
 const s=ST()[S.tg.i];if(s&&s.tap&&e.target.closest(TAPSEL[s.tap]))TAPD=S.tg.i},true);
function prog(s){const b=S.tg.b||{};if(s.move)return[HAND.drag,1];if(s.zoom)return[HAND.zoom,1];if(s.tap)return[TAPD===S.tg.i&&!(s.hold&&!$q(s.hold).hidden)&&!(s.tap==='good'&&stOpen())?1:0,1];
 /* a road: one laid in this step, or every plot already on one (the ready road may be built before its step) */
 if(s.road)return[roads()>(b.road||0)||roads()>0&&!S.list.some(o=>o.t==='house'&&!o.h&&!o.c)?1:0,1];if(s.grow)return[sel&&sel.t==='house'&&!sel.h&&sel.lvl>=2?1:0,1];if(s.raise)return[raised()?1:0,1];if(s.end)return[1,1];
 let a=0,n=0;s.ks.forEach((k,i)=>{a+=Math.min(s.n[i],Math.max(0,own(k)-(b[k]||0)));n+=s.n[i]});return[a,n]}
/* no step waits on a material: while a step lasts, the timber, bricks and stone its buildings (or the storey it asks for) need are
   kept in the store, as the court's builders would send them. Never the good the step itself teaches to make (no timber for the
   timber yards), and no bricks until their lesson: those run out by themselves, and that want is the lesson */
function supply(s){const bi=ST().findIndex(q=>q.tag==='bricks'),need={},mk=new Set((s.ks||[]).map(k=>B[k]&&B[k].out).filter(Boolean));if(bi>=0&&S.tg.i<=bi)mk.add('bricks');
 if(s.ks)s.ks.forEach((k,i)=>{const c=B[k]&&B[k].cost||{};for(const g in c)if(g!=='gold')need[g]=(need[g]||0)+c[g]*(s.n[i]||1)});
 if(s.raise){const c=TIERS()[1].cost||{};for(const g in c)if(g!=='gold')need[g]=(need[g]||0)+c[g]}
 for(const g in need)if(!mk.has(g)&&(S.stock[g]||0)<need[g])S.stock[g]=need[g]}
function base(){const s=ST()[S.tg.i],b={};if(!s)return;if(s.move)HAND.drag=0;if(s.zoom)HAND.zoom=0;if(s.need)(S.bdtip||(S.bdtip={})).nd=1;if(s.raise)(S.bdtip||(S.bdtip={})).up=1;if(s.road)b.road=roads();if(s.ks)for(const k of s.ks)b[k]=own(k);S.tg.b=b;S.tg.ok=0}
/* the buildings open so far; the rest are sketches with the word of the step that opens them */
function opened(){const o=new Set(['road','bridge']);const st=ST();for(let i=0;i<=S.tg.i&&i<st.length;i++)for(const k of st[i].open||[])o.add(k);return o}
function lockWord(k){for(const s of ST())if((s.open||[]).includes(k))return`Unlocks with ${s.tag}`;return'Opens after the tutorial'}
{const lo0=lockOf;lockOf=function(k){if(tgOn()&&!opened().has(k)&&!(B[k]&&B[k].tool&&k!=='elight'))return lockWord(k);return lo0(k)}}
/* ---------- nothing else opens while the tutorial runs ---------- */
/* the game's shortage card ("Not enough bricks…") says what the tutorial's own card says about the step's building: while it runs, only
   the tutorial's card speaks */
{const l0=lackShow;lackShow=function(){if(tgOn()&&!GTAP)return true;return l0.apply(this,arguments)}}
/* and the game's own little notes (placing, roads, a storey built, the speed, tips) stay away too; only a note on why something could
   not be done still shows */
{const t0=toast,KEEP=/^(⚠️|Not enough|No free spot|Can't|Cannot|You can't)/;toast=function(m){if(tgOn()&&!(typeof m==='string'&&KEEP.test(m)))return;return t0.apply(this,arguments)}}
/* and for five minutes of play after it (S.calm, seconds, counted while the page is seen), nothing new comes either: no letter, event,
   audience or case (the Empress's ultimatum waits too), so the player can find their way; what was held back comes after */
const calmOn=()=>!!(S&&S.calm>0);
{const lg0=letGo;letGo=function(u){if(tgOn()||calmOn()||window.wgHush&&window.wgHush())return false;return lg0(u)}}
{const q0=questTick;questTick=function(st){if(tgOn())return;return q0(st)}}
{const t0=tutStart;tutStart=function(){if(L&&L.y1857){tgStart();return}return t0()}}

/* the advisor's hand seen from the back, index finger out (its colours from the page's style by data-who); the pointer and the gesture hints */
const HANDSVG=`<svg viewBox="0 0 80 120" aria-hidden="true"><defs>
<linearGradient id="tgHG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--hs)"/><stop offset=".22" style="stop-color:var(--hd)"/><stop offset=".7" style="stop-color:var(--hd)"/><stop offset="1" style="stop-color:var(--hs)"/></linearGradient>
<linearGradient id="tgSG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--sl)"/><stop offset=".7" style="stop-color:var(--sl)"/><stop offset="1" style="stop-color:var(--sls)"/></linearGradient></defs>
<g stroke="#3a2a10" stroke-width="2" stroke-linejoin="round" fill="url(#tgHG)">
 <path d="M15 48C14 58 14 64 16 68C18 72 24 72 25.5 67L26 48Z"/>
 <path d="M25 48C24.5 60 24.5 68 26.5 72C28.5 76 35 76 36.5 71L37 48Z"/>
 <path d="M36 48C35.5 60 35.5 69 37.5 73.5C39.5 77.5 46 77 47 72L47.5 48Z"/>
 <path d="M45.5 50C45 70 45.6 92 46.8 109C47.4 118.5 56.6 118.5 57.2 109C58.4 92 59 70 58.5 50Z"/>
 <path d="M17 20H63C65 30 67 39 67 47C67 54 64 58 59 59H22C17 59 14 55 14 49C14 38 15 29 17 20Z"/>
 <path d="M61 33C69 39 72 52 70 64C69 73 66 81 62 84C58 87 54.5 84 55.5 79.5C57 71 57.5 60 56.5 49Z"/>
 <path d="M10 0H70V26H10Z" fill="url(#tgSG)"/><path d="M10 14H70V27H10Z" fill="var(--cf)"/></g>
<path d="M10 14.5H70M10 26.5H70" stroke="var(--pp)" stroke-width="1.6"/>
<circle cx="58" cy="20.5" r="2.5" fill="var(--pp)" stroke="#3a2a10" stroke-width="1"/><circle cx="50" cy="20.5" r="2.5" fill="var(--pp)" stroke="#3a2a10" stroke-width="1"/>
<g fill="none" stroke="var(--cr)" stroke-width="1.5" stroke-linecap="round">
 <path d="M27 31v16M37 31v17M47 31v16" stroke-dasharray="2.4 2.2"/>
 <path d="M17.5 64q3.5 2 7 0M27.5 67q4 2 8 0M38.5 68q4 2 8 0M48.5 79q4.2 2 8.4 0M48.8 95q4 2 8 0M58 70q3 1 6-1"/>
 <path d="M18 56q4-2.5 8 0M28 56q4-2.5 8 0M39 56q4-2.5 8 0"/></g>
<path d="M49 104.5q3.4-1.6 6.8 0V112q-3.4 2.6-6.8 0Z" fill="var(--nl)" stroke="var(--cr)" stroke-width="1.1"/>
<path d="M57.5 80.5q2.5-2.5 5-.5l-.6 4.2q-2.4 1.4-4.4-.6Z" fill="var(--nl)" stroke="var(--cr)" stroke-width="1"/>
<path d="M48.5 60V102M21 26q-3 10-4 22" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45" fill="none"/></svg>`;
/* the hand never pops: told to hide, it stays a short moment where it is, so that when the next thing to tap comes at once it glides
   there (move), turning as it goes (the transition in index.html); if nothing comes it fades away, never left pointing at a button
   that is gone. Shown again after that, it fades in at its new place (jump, snap: no glide and no turn from the old one). Its hidden is the tutorial's wish
   (wanted), the element's own the truth. off() takes it away at once: for a button that has just gone from under it */
const HIDEP=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'hidden'),LINGER=350;
function softHand(el){let want=HIDEP.get.call(el),t=0,tj=0;
 Object.defineProperty(el,'hidden',{configurable:true,get:()=>want,set:v=>{v=!!v;if(v===want)return;want=v;clearTimeout(t);
  if(!v){const off=HIDEP.get.call(el);if(off||el.classList.contains('gone')){el.classList.add('jump');el.snap=1;clearTimeout(tj);tj=setTimeout(()=>el.classList.remove('jump'),90)}
   if(off){el.classList.add('gone');HIDEP.set.call(el,false);void el.offsetWidth}el.classList.remove('gone');return}
  t=setTimeout(()=>{if(!want)return;el.classList.add('gone');t=setTimeout(()=>{if(want)HIDEP.set.call(el,true)},320)},LINGER)}});
 el.off=()=>{want=true;clearTimeout(t);el.classList.add('gone');HIDEP.set.call(el,true)}}
/* ---------- the card, the ring and the arrow ---------- */
let CARD=null,ARROW=null,RING=null,ON=false,LASTSIG='';
function els(){if(CARD)return;CARD=document.createElement('div');CARD.id='tg';CARD.hidden=true;document.getElementById('stage').appendChild(CARD);
 /* the first lessons show the gestures on the map itself with the advisor's hand: it touches the map, slides across and lifts, an
    arrow drawing itself behind it; then two hands, their fingers spreading apart, an arrow out from each */
 GEST=document.createElement('div');GEST.id='tgHand';GEST.hidden=true;GEST.innerHTML=`<svg class="gtr" viewBox="0 0 220 140" aria-hidden="true"><g class="d"><path class="ln" d="M40 74H174"/><path class="hd_" d="M162 62l14 12-14 12"/></g><g class="p"><path class="ln" d="M100 74H46"/><path class="hd_" d="M58 62 44 74l14 12"/><path class="ln" d="M120 74H174"/><path class="hd_" d="M162 62l14 12-14 12"/></g></svg><i class="rp"></i><i class="rp r2"></i><div class="hn h1">${HANDSVG}</div><div class="hn h2">${HANDSVG}</div>`;document.body.appendChild(GEST);
 ARROW=document.createElement('div');ARROW.id='tgArrow';ARROW.hidden=true;softHand(ARROW);
 /* the pointer is the advisor's own hand seen from the back, all five fingers: the middle, ring and little fingers folded side by side
    under the knuckles, the thumb wrapped along the index finger, and the index finger out, tapering to its nail, with its creases. The
    back is shaded at both edges and, on a glove, stitched. Crenneville's white glove from the red, gold-buttoned cuff of his white
    general's coat, Greeley's bare hand from a black sleeve and a shirt cuff, the Empress's glove from her dark sleeve (colours in the
    page's style, by data-who). It taps the place or the button, and a ring spreads where the finger touches */
 ARROW.innerHTML=`<s></s><em><b></b>${HANDSVG}</em><span></span>`;
 document.getElementById('stage').appendChild(ARROW);
 /* off the screen the arrow sits at the edge pointing the way; a tap on it brings the place into view */
 ARROW.addEventListener('click',()=>{if(ARROW.classList.contains('edge')&&ARROW.dataset.go){const[x,y]=ARROW.dataset.go.split(',').map(Number);jumpTo(x,y)}else if(ARROW.dataset.row&&SIDEL&&SIDEL.isConnected)SIDEL.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})})}
/* the first plot of the tutorial: the arrows that move it are shown and explained, until the player has tried one */
function moveHint(){return!!(S.tg&&S.tg.i<=1&&!S.tgMv&&CONF==='build'&&pend&&!S.tg.ok&&!$q('#conf').hidden)}
/* the building the step still wants and the first good its cost lacks, said plainly with where more comes from */
function short(s){if(!s||S.tg.ok)return'';let cost=null;if(s.raise){if(raised())return'';cost=TIERS()[1].cost}
 else{if(!s.ks)return'';const k=s.ks.find((k,i)=>own(k)-(S.tg.b[k]||0)<s.n[i]);if(!k||!B[k]||!B[k].cost)return'';cost=B[k].cost}
 for(const g in cost){if(g==='gold')continue;const need=cost[g]-(S.stock[g]||0);if(need<=0)continue;const nm=g==='wood'?'timber':g,pk=typeof prodOf==='function'?prodOf(g):null;
  if(pk&&B[pk]&&own(pk))return`We need more ${nm}. Your ${B[pk].n.toLowerCase()} is making them.${spdKnown()?'':' Tap ‘1×’ at the top, next to the date, to make time go faster.'}`;
  if(pk&&B[pk])return`We need more ${nm}. Build a ${B[pk].n.toLowerCase()} first.`;return`We need more ${nm}.`}return''}
/* a building left off the streets (lonely, in the engine): the step's own first, else any home the player built without a road. The step
   waits until it has its road, the ready road offered at once. Not while the first homes and the road step teach just that */
const lrName=o=>o.t==='house'?(NYC()?'house':'Zinshaus'):nm_(B[o.t].n);
const lonelyOf=s=>{if(!s||typeof lonely!=='function'||s.move||s.zoom||s.road||s.offRoad)return null;const off=o=>!o.h&&!o.r&&lonely(o);
 return s.ks&&S.list.find(o=>s.ks.includes(o.t)&&off(o))||S.list.find(o=>o.t==='house'&&off(o))||null};
/* a step that waits without a card (quiet) shows it after half a minute anyway, so the tutorial never seems to stop */
let QT=null;function quietOn(s){const now=performance.now();if(!QT||QT.i!==S.tg.i)QT={i:S.tg.i,t:now};return s.quiet()&&now-QT.t<30000}
/* the goal row of the card: what to do and how far it is, the works of a chain or a list each ticked once built */
function goalHTML(s,lr,p){const co=lr?null:chainKs(s),cg=co?chainGoal(s,co):null;
 /* a step whose works make goods but no chain (timber, bricks, food): what they make, with its icon, under the goal */
 const mk=!lr&&!co&&s.ks?[...new Set(s.ks.map(k=>B[k].out).filter(Boolean))]:[],mg=mk.length?`<span class="tgGoods">Makes ${mk.map(g=>`${ICON[g]||''} ${g==='wood'?'timber':g}`).join(', ')}</span>`:'';const lst=!lr&&s.ks&&s.ks.length>1;
 return`<div class="tgGoal"><span>${S.tg.ok?'✅':'🎯'} ${lr?`Road to the ${lrName(lr)} <b>0/1</b>`:`${lst?s.goal||'Build these':cg?cg[0]:goalTxt(s)} <b>${Math.min(p[0],p[1])}/${p[1]}</b>`}</span>${lst?listGoal(s,s.back?null:co):''}${cg?cg[1]:mg}</div>`}
/* something the step counts was just built: its goal row counts up at once, in place, with a short gold pop (the rest of the card
   stays as it is for a moment, HOLDMS, and the hand waits) */
function cheer(s,lr,p){const g=CARD.querySelector('.tgGoal');if(!g)return;const d=document.createElement('div');d.innerHTML=goalHTML(s,lr,p);const n=d.firstChild;if(!n)return;n.classList.add('tgUp');g.replaceWith(n)}
/* a step done: gold stars fly up, once (not for a step that is only a tap on the stores, a good, the money). From what the player just did on the map, if that did it and is in view (the engine's DEED:
   the building, the home that moved up; never a road); else from the top of the advisor's card, over its edge, never over its words */
let STARS=null;
function stars(){if(!S||!S.tg||!CARD)return;if(DEED&&performance.now()-DEEDT<2500&&window.buildFx&&window.buildFx(DEED))return;if(CARD.hidden)return;
 if(!STARS){STARS=document.createElement('div');STARS.id='tgStars';STARS.innerHTML='<b></b>'.repeat(12);document.body.appendChild(STARS)}
 const r=CARD.getBoundingClientRect();STARS.style.left=r.left+r.width/2+'px';STARS.style.top=r.top+2+'px';STARS.className='sb';void STARS.offsetWidth;STARS.className='sb go'}
/* a step done: a word of praise on the card, and what the new buildings bring, before the next step comes */
const WELL=['Well done','Very good','Excellent','Splendid'];
function praise(s){if(!s||s.tap||s.grow||s.raise||s.end)return'';if(s.move)return'Good. That is how you move the map.';if(s.zoom)return'Good. Now you can look at everything.';
 if(s.who==='sisi')return'Thank you, Franz. It will be lovely.';
 const t=s.road?'Now the homes have their road.':{homes:s.offRoad?'Your builders are at work.':'More homes bring more rent.',food:'Your people will have food.',bread:'Your people will have bread.',bricks:'The bricks are on the way.',timber:'The timber is on the way.',beer:'The beer is on the way.','the park':'The city has its park.'}[s.tag]||'Your people will be glad.';
 return`${WELL[S.tg.i%WELL.length]}, ${NYC()?'Mr. Mayor':'Majesty'}. ${t}`}
function show(){els();STALE=0;const s=ST()[S.tg.i];if(!s){CARD.hidden=true;return}
 /* between two steps: the old card fades out (OUTMS), the screen stays clear a moment, then the next card comes in */
 if(GAP){const now=performance.now();if(now<GAP){if(now>=GAP0+OUTMS&&!CARD.hidden){CARD.hidden=true;CARD.classList.remove('tgOut')}return}GAP=0;CARD.classList.remove('tgOut');LASTSIG='';POP=1}if(s.quiet&&!S.tg.ok&&quietOn(s)){CARD.hidden=true;return}const lr=S.tg.ok?null:lonelyOf(s),p=prog(s),done=p[0]>=p[1]&&!lr,[nm,role]=WHO[s.who]||WHO.cren;
 /* what was just built counts up on the card at once (cheer), and the card itself stays still a moment (HOLDMS), never seeming to load again. A tap on the
    home that moved up and building it higher show at once: the home's own card answers them, and the next thing to tap is on it */
 {const ps=S.tg.i+'|'+p[0]+'|'+(done?1:0),now=performance.now();if(ps!==PSIG){const same=PSIG.split('|')[0]===String(S.tg.i);if(same&&!HOLD&&!s.grow&&!s.raise&&!done){HOLD=now+HOLDMS;if(!CARD.hidden&&CARD.dataset.by==='city'&&p[0]>+PSIG.split('|')[1])cheer(s,lr,p)}
  if(same&&now<HOLD&&!CARD.hidden){STALE=1;return}PSIG=ps;HOLD=0}}
 if(done&&!S.tg.ok){S.tg.ok=1;OKT=performance.now();sfx('chime');if(!s.tap)setTimeout(stars,0)}
 /* a step done stays on the card, ticked, for a moment (doneMs) and then the next one comes in by itself, with the same flash.
    The tap on the home that moved up goes straight on to building it higher; building higher waits until its card is closed */
 if(S.tg.ok&&!s.end&&(s.grow||performance.now()>=OKT+doneMs(s)&&!closeX())){next();return}
 const cardOn=!!(s.raise&&sel&&sel.t==='house'&&$q('#info:not([hidden]) #tierBtn'))||!!(s.hold&&!$q(s.hold).hidden)||!!(s.tap==='good'&&TAPD===S.tg.i&&stOpen())||!!(s.need&&sel&&sel.t==='house'&&$q('#info:not([hidden]) #stlGo')&&own(s.need)-(S.tg.b[s.need]||0)<1)||!!(s.back&&sel&&$q('#info:not([hidden]) #stlGo'));
 const mv=moveHint(),cx=!!closeX(),sh=lr?'':short(s),lw=lr?`The ${lrName(lr)} needs a road, ${NYC()?'Mr. Mayor':'Majesty'}. ${CONF==='road'&&!$q('#conf').hidden?'Tap ✓ to build the road shown.':'Lay a road from it to a street.'}`:'';const sig=[CARD.dataset.by,S.tg.i,p[0],S.tg.ok,nm,CONF,waiting(s),!!lackWait(s),mv,sh,lw,cx,cardOn,typeof spd!=='undefined'&&spd>1,s.hold?(stOpen()?1:0)+($q(s.hold).hidden?'':'k'):'',!!$q('#spdMenu'),s.need?(mode||'')+(pend?1:0)+S.list.some(o=>o.t==='house'&&!o.h&&!o.bld&&o.nd):''].join('|');if(sig===LASTSIG&&!CARD.hidden)return;LASTSIG=sig;CARD.hidden=false;
 const wt=waiting(s),first=S.tg.i===0,goal=s.end||wt||s.tap==='good'&&TAPD===S.tg.i?'':goalHTML(s,lr,p);
 /* the last card: walk through the city just built; in a practice city the other way is back to the player's own city, else later */
 const btn=s.end?`<button class="tgSkip" id="tgLater">${TGPRACTICE?'Back to your own city':'Later'}</button>`:'';
 let txt=mv?'Move the plot with the arrows. Tap ✓ Build when it looks right.':cx?'Well done. <span class="tgLate">Now tap ✕ to close the card.</span>':s.raise&&S.tg.ok?`Well done, ${NYC()?'Mr. Mayor':'Majesty'}.`:S.tg.ok&&praise(s)?praise(s):lw?lw:wt?(lackWait(s)?'A house still lacks something, so it cannot move up. Tap the sign over it to see what.':spdKnown()?s.waitFast||s.waitLine.replace(SPDTXT,''):s.waitLine):sh?sh:fnl(cardOn&&s.lineOn?s.lineOn:s.line);
 /* the time button's menu open: choose 4× in it */
 if($q('#spdMenu')&&SPDTXT.test(txt))txt=txt.replace(SPDTXT,' Choose 4× to make time go faster.').trim();
 CARD.dataset.by='city';if(ARROW)ARROW.dataset.who=s.who||'cren';if(GEST)GEST.dataset.who=s.who||'cren';CARD.innerHTML=`<img class="tgFace" src="${face(s.who==='sisi'?'sisi':s.who)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${txt}</p>${goal}<div class="tgB">${btn}${first&&!S.tg.ok?'<button class="tgSkip" id="tgSkip">Skip tutorial</button>':''}</div></div>`;
 CARD.classList.toggle('tgDone',!!S.tg.ok&&!s.end);
 /* drawn again with words that were already read: the last sentence stays in view */
 if(!reading())CARD.querySelectorAll('.tgLate').forEach(e=>e.classList.add('on'));
 if(POP){POP=0;CARD.classList.remove('tgPop');void CARD.offsetWidth;CARD.classList.add('tgPop')}
 const g=$q('#tgGo');if(g)g.onclick=next;const k=$q('#tgSkip');if(k)k.onclick=()=>end(true);const lt=$q('#tgLater');if(lt)lt.onclick=()=>end(false)}
/* the next step (the last one's button ends the tutorial and goes walking) */
function next(){const s=ST()[S.tg.i];if(s.end){if(TGPRACTICE)PRWALK=1;end(false,true);setTimeout(walkBusy,300);return}
 S.tg.i++;
 /* the road lesson is passed over when every home already stands on a road, one the player laid before it came or the old streets */
 {const r=ST()[S.tg.i];if(r&&r.road&&S.list.some(o=>o.t==='house'&&!o.h)&&!S.list.some(o=>o.t==='house'&&!o.h&&!o.r&&!o.c))S.tg.i++}
 LASTSIG='';base();BARSIG='';if($q('#bar').classList.contains('open'))buildBar();
 /* a card left open is drawn again, so a button the new step opens (building higher) is ready on it */
 if(sel&&$q('#info:not([hidden])')&&typeof renderInfo==='function')renderInfo();
 if(CARD&&!CARD.hidden){GAP0=performance.now();GAP=GAP0+gapMs(s);CARD.classList.remove('tgPop');CARD.classList.add('tgOut')}POP=1;show()}
/* where the step points: a button (the ring) or a place (the arrow); the card goes where they are not */
function target(){const s=ST()[S.tg.i];if(!s)return null;
 /* a home just built higher in its step, its card still open: the arrow shows how to close it, and the card says so */
 {const ix=closeX();if(ix)return{el:ix}}
 /* the last word: the arrow points at the card's own button. A step just done, about to move on: a ✓ still waiting (the ready road) comes first */
 if(s.end){const g=$q('#tWalk');return g&&g.offsetParent?{el:g}:null}
 if(S.tg.ok)return CONF&&!$q('#conf').hidden?{el:$q('#confOk')}:null;
 if(s.move||s.zoom)return{place:null};
 /* a tap at the top: the good running lowest (or the first), the money or the desk; for the desk the camera shows the Hofburg once, lit */
 if(s.tap){let h=null;if(s.hof){h=S.list.find(o=>o.t==='hofburg');if(h&&FOUND!==S.tg.i+'hof'){FOUND=S.tg.i+'hof';const f=B.hofburg.foot||1;jumpTo(h.x+f/2,h.y+f/2)}}
  /* the good's card open: its ✕ closes it, and then the step is done */
  if(s.hold&&!$q(s.hold).hidden){if(typeof lackT!=='undefined')clearTimeout(lackT);return{el:$q('#lackX')}}
  if(s.tap==='good'&&TAPD===S.tg.i&&stOpen())return{el:$q('#stores [data-st]')};
  /* the good to tap: the first in the stores, so the hand stays put while the numbers change */
  const el=s.tap==='good'?$q('#stores [data-g]'):$q(TAPSEL[s.tap]);return el?{el,o:h}:null}
 if(waiting(s)){const sg=lackWait(s);if(sg)return{el:sg,noRing:1};return spdKnown()?null:{el:spdEl()}}
 /* the step's building waits for bricks or timber the city is making: while the card tells to tap ▶, the time button is ringed */
 {const sh=short(s);if(sh&&SPDTXT.test(sh)&&!lonelyOf(s)&&!spdKnown())return{el:spdEl()}}
 /* a chain built backwards (bread): the next works answers the sign over the last one. The hand on that sign (on the building until
    the sign shows), then on its card's button that builds the next */
 if(s.back&&s.ks&&!mode&&!pend){const k=s.ks.find((k,i)=>own(k)-(S.tg.b[k]||0)<s.n[i]),pk=k&&own(k)-(S.tg.b[k]||0)<1&&s.ks[s.ks.indexOf(k)-1],pv=pk&&S.list.find(o=>o.t===pk&&!o.bld&&!o.h);
  if(pv){const b=$q('#info:not([hidden]) #stlGo');if(b&&sel===pv)return{el:b,o:pv};
   const sg=[...document.querySelectorAll('#tags .bd')].find(e=>e._o===pv&&e.style.display!=='none'&&!e.classList.contains('up'));if(sg)return{el:sg,noRing:1,o:pv};
   const f=B[pk].foot||1;if(FOUND!==S.tg.i+'back'+pk){FOUND=S.tg.i+'back'+pk;jumpTo(pv.x+f/2,pv.y+f/2)}return{place:[pv.x+f/2,pv.y+f/2],k:pk,o:pv}}}
 /* the home that moved up: the camera flies there once, so the player sees the new Zinshaus without looking for it */
 /* the hand on the green ⬆ over the house that moved up (labels.js), so it is seen and tapped, never covered by the hand */
 if(s.grow){const h=grown();if(h&&FOUND!==S.tg.i+'grow'){FOUND=S.tg.i+'grow';jumpTo(h.x+1,h.y+1)}if(!h)return{el:null};
  const up=[...document.querySelectorAll('.bd.up')].find(e=>e._o===h&&e.style.display!=='none');return up?{el:up,o:h}:{place:[h.x+1,h.y+1],k:'house',o:h}}
 /* building higher: the button on the open card (while bricks or timber are short, the time button), or else the house that moved up, lit, to tap first */
 if(s.raise){const tb=$q('#info:not([hidden]) #tierBtn');if(tb)return tb.disabled?(spdKnown()?null:{el:spdEl()}):{el:tb};const h=sel&&sel.t==='house'&&!sel.h&&$q('#info:not([hidden])')?sel:grown();return h?{place:[h.x+1,h.y+1],k:'house',o:h}:null}
 /* the need step: the red sign over a house (the camera goes to the homes once if none is on the screen), then the button on its card */
 if(s.need&&own(s.need)-(S.tg.b[s.need]||0)<1&&mode!==s.need&&!pend){const b=$q('#info:not([hidden]) #stlGo');if(b&&sel&&sel.t==='house')return{el:b};
  const sg=needSign();if(sg)return{el:sg,noRing:1};
  const h=S.list.find(o=>o.t==='house'&&!o.h&&!o.bld&&o.nd);if(h&&FOUND!==S.tg.i+'need'){FOUND=S.tg.i+'need';jumpTo(h.x+1,h.y+1)}}
 const lr=lonelyOf(s);if(lr){const f=B[lr.t].foot||1,c=[lr.x+f/2,lr.y+f/2];
  /* the game's ready road is waiting: ✓ builds it. Otherwise it is offered once, and after that the road tool leads to the building */
  if(CONF==='road'&&!$q('#conf').hidden)return{el:$q('#confOk')};if(mode==='road')return{place:c,k:lr.t,o:lr};
  const key=S.tg.i+'rd'+lr.x+','+lr.y;if(FOUND!==key&&typeof roadOffer==='function'){FOUND=key;roadOffer(lr,null);return{el:$q('#confOk')}}}
 const k=lr||s.road?'road':s.ks.find((k,i)=>own(k)-(S.tg.b[k]||0)<s.n[i]);if(!k)return CONF&&!$q('#conf').hidden?{el:$q('#confOk')}:null;
 if(CONF&&!$q('#conf').hidden&&!(s.offRoad&&mode==='house'&&FOUND!==S.tg.i+'off'&&own('house')-(S.tg.b.house||0)===1))return{el:$q('#confOk')};
 if(mode===k){
  /* the second plot goes just off the street, so the road step that follows has its reason (and the ready road appears at once) */
  if(s.offRoad&&k==='house'&&own(k)-(S.tg.b[k]||0)===1&&FOUND!==S.tg.i+'off'){FOUND=S.tg.i+'off';const a=offRoad();if(a){pend=a[0]+','+a[1];hover={x:a[0]+1,y:a[1]+1};jumpTo(a[0]+1,a[1]+1);confShow('build');return{el:$q('#confOk')}}}
  const sp=pend?pend.split(',').map(Number):null;if(sp)return{el:$q('#confOk')};
  const p=spotFor(k);
  /* once per step, building and each one built (the six homes one after another): the camera goes to the next place and the footprint is
     put there, so ✓ Build is all that is left */
  if(p&&FOUND!==S.tg.i+k+'#'+own(k)){FOUND=S.tg.i+k+'#'+own(k);FLY=performance.now()+1500;if(B[k]&&B[k].lm)jumpTo(p[0],p[1]);else if(k!=='road'){if(!putAt(k,p))findSpot({x:p[0],y:p[1]})}else jumpTo(p[0],p[1]);if(pend&&!/^[rl]/.test(pend))return{el:$q('#confOk')}}return{place:p,k}}
/* the red sign over a house that is well on the screen (clear of the bars and the card's edge), for the need step */
function needSign(){const W0=innerWidth,H0=innerHeight;return[...document.querySelectorAll('#tags .bd')].find(e=>{if(!e._o||e._o.t!=='house'||e.style.display==='none'||!e.offsetParent)return false;const r=e.getBoundingClientRect();return r.left>10&&r.right<W0-10&&r.top>100&&r.bottom<H0-90})||null}
/* a service the game itself would place where most people lack it (the coffee house), and the homes: the plot goes exactly on the
   tutorial's spot (inside the Ring; the first homes right beside the Stephansdom), not wherever the game's own search would nudge it */
function putAt(k,p){if(!INNER.has(k)&&k!=='house'&&!(typeof COVK!=='undefined'&&COVK[k]))return false;const f=B[k].foot||1,ax=Math.round(p[0]-f/2),ay=Math.round(p[1]-f/2),h=(f-1)>>1;
 if(!spots(k).anc.includes(ay*W+ax))return false;pend=ax+','+ay;hover={x:ax+h,y:ay+h};jumpTo(ax+h,ay+h);confShow('build');return true}
 const bar=$q('#bar');if(!bar.classList.contains('open'))return{el:$q('#buildBtn')};
 const cat=CATS.find(c=>c[3]&&c[3].includes(k));if(cat&&CAT!==cat[0])return{el:$q(`#cats [data-c="${cat[0]}"]`)};
 if(!cat&&B[k]&&B[k].lm&&CAT!=='monuments')return{el:$q('#cats [data-c="monuments"]')||$q('#cats .cat:last-child')};
 /* the landmark's own group (Parks for the Stadtpark) is chosen for the player, so only the card is left to tap */
 if(!cat&&B[k]&&B[k].lm){const g=lmGroups().find(g=>g[3].includes(k));if(g&&LMSUB!==g[0]){LMSUB=g[0];BARSIG='';buildBar()}}
 return{el:$q(`#builds .bb[data-k="${k}"]`)}}
let FLY=0,SPK='',SPV=null,FOUND='',SLID='',SIDEL=null,PSIG='',HOLD=0,POP=0,OKT=0;
/* the step of building higher, once done, with the card still open: closing it with ✕ is the one thing left, and the next step waits for it */
function closeX(){const s=ST()[S.tg.i];return s&&s.raise&&raised()?$q('#info:not([hidden]) #infoX'):null}
/* how long the card waits after a build before it shows the change, and how long a done step stays before the next comes in */
const HOLDMS=1500,OUTMS=300;let GAP=0,GAP0=0,STALE=0;
/* how long a step done stays on the card, praised, and how long the screen stays clear after it: longer after something was built
   than after a tap at the top; the tap on the home that moved up goes on at once */
const doneMs=s=>s.tap?1400:s.move||s.zoom?1900:2400,gapMs=s=>s.grow?700:s.tap?800:1100;
/* a waiting card (the families moving in, the house about to rise) stays at least WAITMS once shown, even if the wait ends sooner, so it can be read */
const WAITMS=6000;let WAITI=-1,WAITT=0;
/* the time button, or once it is open, the 4× in its menu */
const spdEl=()=>$q('#spdMenu [data-v="4"]')||$q('#res [data-sp]');
/* the time button's sentence on a card (taken off once a faster speed has been chosen) */
const SPDTXT=/\s*Tap ‘1×’[^.]*\./;
/* the time button is learnt once it has been tapped (or the game already runs faster): until then its sentence comes on the cards */
const spdKnown=()=>typeof spd!=='undefined'&&spd>1;
/* waiting for the homes to move up while one of them lacks something it cannot get by waiting (beer, bread, a market): the sign over
   it, well on the screen */
function lackWait(s){if(!s||!s.grow||!spdKnown()||!S.list.some(o=>o.t==='house'&&!o.h&&!o.bld&&o.nd))return null;
 return[...document.querySelectorAll('#tags .bd')].find(e=>{if(!e._o||e._o.t!=='house'||e.style.display==='none'||!e.offsetParent||e.classList.contains('up'))return false;const r=e.getBoundingClientRect();return r.left>10&&r.right<innerWidth-10&&r.top>100&&r.bottom<innerHeight-90})||null}
/* a waiting card that tells to tap the time button waits for that tap too, not only for what it waits on, so the lesson is done, not skipped */
function waiting(s){if(!s||!s.wait||S.tg.ok)return false;const now=performance.now();if(!s.wait()){if(WAITI!==S.tg.i){WAITI=S.tg.i;WAITT=now}return true}
 if(!spdKnown()&&SPDTXT.test(fnl(s.waitLine)||'')){if(WAITI!==S.tg.i){WAITI=S.tg.i;WAITT=now}return true}return WAITI===S.tg.i&&now<WAITT+WAITMS}
/* the land a road can reach from the streets joined to the store: a place for a work is chosen there first, so its ready road can follow */
let RK='',RV=null;
function reach(){const key=S.list.length+'|'+GV;if(key===RK)return RV;RK=key;const r=new Uint8Array(W*H),q=[];for(let i=0;i<W*H;i++)if(dist[i]>=0){r[i]=1;q.push(i)}
 for(let h=0;h<q.length;h++){const k=q[h],x=k%W,y=k/W|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const n=ny*W+nx;if(!r[n]&&roadPas(n)){r[n]=1;q.push(n)}}}return RV=q.length?r:null}
function perimIn(r,x,y,f){for(let k=-1;k<=f;k++)for(const[a,b]of[[x+k,y-1],[x+k,y+f],[x-1,y+k],[x+f,y+k]])if(inb(a,b)&&r[b*W+a])return true;return false}
function offRoad(){const f=B.house.foot||1,h=S.list.filter(o=>o.t==='house'&&!o.h).pop();if(!h)return null;let best=null,bd=1e9;
 for(const a of spots('house').anc){const x=a%W,y=a/W|0,d=Math.hypot(x-h.x,y-h.y);if(d>14||d>=bd||byRoad(x,y,f))continue;
  let near=false;for(let r=2;r<=4&&!near;r++)near=byRoad(x-r,y-r,f+2*r);if(near){bd=d;best=[x,y]}}return best}
/* the land inside the Ring: everything the map's edge cannot reach without crossing the Ring (worked out once per Ring) */
let INR=null,INRS=null;
function inRing(){if(INRS===RINGSET)return INR;INRS=RINGSET;INR=null;if(!RINGSET||!RINGSET.size)return null;const out=new Uint8Array(W*H),q=[];
 const add=i=>{if(!out[i]&&!RINGSET.has(i)){out[i]=1;q.push(i)}};for(let x=0;x<W;x++){add(x);add((H-1)*W+x)}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1)}
 for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=i/W|0;if(x>0)add(i-1);if(x<W-1)add(i+1);if(y>0)add(i-W);if(y<H-1)add(i+W)}
 INR=new Uint8Array(W*H);for(let i=0;i<W*H;i++)INR[i]=!out[i]&&!RINGSET.has(i)?1:0;return INR}
/* the fields, the bakery and the brewery belong on the open land outside the Ring; the homes, their market, church and coffee house beside the cathedral, on a street,
   and the coffee house inside the Ring (INNER) */
const FIELDS=new Set(['garden','farm','grainf','sheep','bakery','brewery']),ONST=new Set(['chapel','kaffeehaus','market','house']),INNER=new Set(['kaffeehaus']);
/* the fields, the vegetable garden with them, keep well away from the Ring, out past the suburbs' first streets (FARGAP tiles at least) */
const FAR=new Set(['garden','grainf','farm','sheep']),FARGAP=14;
/* how far each tile lies from the Ring, in tiles (worked out once per Ring) */
let RD=null,RDS=null;
function ringDist(){if(RDS===RINGSET)return RD;RDS=RINGSET;RD=null;if(!RINGSET||!RINGSET.size)return null;const d=new Int16Array(W*H).fill(-1),q=[];for(const i of RINGSET){d[i]=0;q.push(i)}
 for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=i/W|0;for(const n of[x>0?i-1:-1,x<W-1?i+1:-1,y>0?i-W:-1,y<H-1?i+W:-1])if(n>=0&&d[n]<0){d[n]=d[i]+1;q.push(n)}}return RD=d}
/* a lot with a street along one of its sides */
function onStreet(x,y,f){for(let k=0;k<f;k++)for(const[a,b]of[[x+k,y-1],[x+k,y+f],[x-1,y+k],[x+f,y+k]]){if(!inb(a,b))continue;const o=S.b[b*W+a];if(o&&o.t==='road')return true}return false}
function spotFor(k){const key=k+'|'+S.list.length;if(key===SPK)return SPV;SPK=key;SPV=null;
 if(k==='road'){const h=S.list.filter(o=>o.t==='house'&&!o.h).pop();SPV=h?[h.x+1,h.y+1]:null;return SPV}
 if(B[k]&&B[k].lm&&typeof lmReal==='function'){SPV=lmReal(k);return SPV}
 try{const sp=spots(k),f=B[k].foot||1,c=(['house','market','chapel','kaffeehaus'].includes(k)&&S.list.find(o=>o.t==='stephan'))||S.list.find(o=>o.t==='hofburg')||S.list.find(o=>o.t==='stephan'),R=reach(),IR=FIELDS.has(k)||INNER.has(k)?inRing():null,RDm=FAR.has(k)?ringDist():null;
  const inside=(x,y)=>{if(!IR)return false;for(let b=0;b<f;b++)for(let a=0;a<f;a++)if(IR[(y+b)*W+x+a])return true;return false};
  const allIn=(x,y)=>{if(!IR)return true;for(let b=0;b<f;b++)for(let a=0;a<f;a++)if(!IR[(y+b)*W+x+a])return false;return true};
  if(sp.anc.length&&c){let best=-1,bd=1e9;for(const a of sp.anc){const x=a%W,y=a/W|0,d=Math.hypot(x-c.x,y-c.y)+(R&&!perimIn(R,x,y,f)?400:0)+(FIELDS.has(k)&&inside(x,y)||INNER.has(k)&&!allIn(x,y)?1000:0)+(RDm&&RDm[(y+(f>>1))*W+x+(f>>1)]<FARGAP?(FARGAP-RDm[(y+(f>>1))*W+x+(f>>1)])*40:0)+(ONST.has(k)&&!onStreet(x,y,f)?60:0);if(d<bd){bd=d;best=a}}SPV=[best%W+f/2,(best/W|0)+f/2]}}catch(e){}return SPV}
const V3={x:0,y:0,z:0};
function projRaw(x,y){const g=window.__G3;if(!g||!g.camera||!g.E)return null;const cm=g.camera,v=cm.position.clone();v.set(g.E(x),2,g.E(y)).project(cm);const r=$q('#g3').getBoundingClientRect(),b=v.z>1?-1:1;
 return[r.left+(b*v.x+1)/2*r.width,r.top+(1-b*v.y)/2*r.height,v.z>1,r]}
/* the part of the map the player can see, clear of the advisor's card at the top and the bar below; and whether a point lies in it */
function viewBox(R){const m=28,top=CARD&&!CARD.hidden&&CARD.classList.contains('top')?Math.max(R.top+m,CARD.getBoundingClientRect().bottom+44):R.top+m+40;let bot=R.bottom-m-20;
 for(const q of['#conf','#info']){const e=$q(q);if(e&&!e.hidden&&e.offsetParent){const r=e.getBoundingClientRect();if(r.height)bot=Math.min(bot,r.top-70)}}
 if(CARD&&!CARD.hidden&&CARD.classList.contains('bot'))bot=Math.min(bot,CARD.getBoundingClientRect().top-70);return[R.left+m,top,R.right-m,Math.max(top+60,bot)]}
function inView(p){const[px,py,behind,R]=p,[L0,top,R0,B0]=viewBox(R);return!behind&&px>=L0&&px<=R0&&py>=top&&py<=B0}
function proj(x,y){const g=window.__G3;if(!g||!g.camera||!g.E)return null;const cm=g.camera,v=cm.position.clone();v.set(g.E(x),2,g.E(y)).project(cm);if(v.z>1)return null;const r=$q('#g3').getBoundingClientRect();return[r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]}
/* ten times a second on a timer (animation frames stop while the page is not on screen, a timer does not) */
/* a practice city walked after its last card: once the walk is over, back to the player's own city */
let PRWALK=0;
/* the gesture hint, '' (none), 'drag' or 'pinch': set by the loop where the card's message is up, put away everywhere else */
let GEST=null,GK='';function gest(k){if(!GEST||GEST.className===k&&GEST.hidden===!k)return;GEST.className=k;GEST.hidden=!k}
/* the spotlight: the rest of the screen dims a little, and the button to tap or the building in focus stays bright in a soft-edged
   hole (DH: left, top, width, height, corner radius), set by the loop with the arrow and put away everywhere else; taps pass through */
/* the spotlight's hole is on the thing to tap at once, never sliding there from the last one (index.html); between two, the dimming
   stays a blink (DGRACE) rather than going and coming back, and then goes, so no bright patch is left where a button was */
/* a hole whose button is gone (its bar or card has closed, as ✓ Build does once tapped) shuts in that same frame (shut, from follow
   and from here), and the hand goes with it: no lighter patch and no hand are left where the button was. The even dimming then
   waits one look of the loop for a next button (DSHUT) and clears fast. The next hole opens at its own place. DHE is the button
   this look's hole is for (none for a place or a sign on the map), DEL the one the hole on screen is for */
const DGRACE=220,DSHUT=90;let DIM=null,DK='',DH=null,DHE=null,DOFF=0,DEL=null;const gone=el=>!(el.isConnected&&el.getClientRects().length);
function shut(){if(!DIM||DK==='shut'||!DIM.classList.contains('on'))return;const st=DIM.style,x=(parseFloat(st.left)||0)+(parseFloat(st.width)||0)/2,y=(parseFloat(st.top)||0)+(parseFloat(st.height)||0)/2;
 st.transition='opacity .2s';st.left=x+'px';st.top=y+'px';st.width=st.height='0px';DK='shut'}
function dim(h){if(!DIM){DIM=document.createElement('div');DIM.id='tgDim';document.body.appendChild(DIM)}
 const on=DIM.classList.contains('on');if(h)DEL=DHE;else if(on){if(DEL&&gone(DEL))shut();const now=performance.now();if(!DOFF)DOFF=now;if(now-DOFF<(DK==='shut'?DSHUT:DGRACE))return}DOFF=0;
 const k=h?h.map(Math.round).join(','):'';if(k===DK)return;DK=k;
 if(h){const st=DIM.style;st.transition='';st.left=h[0]+'px';st.top=h[1]+'px';st.width=h[2]+'px';st.height=h[3]+'px';st.borderRadius=h[4]+'px'}
 DIM.classList.toggle('on',!!h)}
/* a panel open under the advisor's card (the treasury, a law, the goods): the card stays at the top and the panel moves down below it,
   so neither covers the other (body.tgOv and --tgH, the card's lower edge) */
function ovRoom(){const ov=$q('#ov'),on=!!(CARD&&!CARD.hidden&&ov&&!ov.hidden),b=document.body;if(b.classList.contains('tgOv')!==on)b.classList.toggle('tgOv',on);
 if(on){const h=Math.round(CARD.getBoundingClientRect().bottom+8)+'px';if(b.style.getPropertyValue('--tgH')!==h)b.style.setProperty('--tgH',h)}}
function loop(){if(S&&S.calm>0&&!tgOn()&&!document.hidden)S.calm=Math.max(0,S.calm-.1);GK='';DH=null;DHE=null;const pe=FOL&&!FOL.o&&FOL.el;FOL=null;try{loop0()}catch(e){console.warn('tutorial',e)}if(pe&&ARROW&&ARROW.hidden&&!onMap(pe)&&gone(pe))ARROW.off();ovRoom();if(WG&&onFoot()){const ws=wgSteps()[WG.i];if(ws&&ws.look&&!HAND.drag)GK='drag'}gest(GK);dim(DH);move(performance.now())}
/* each frame: the hole and the hand kept on the button they point at while it moves (a sliding row of build cards, a panel opening) */
/* a sign on the map bobs up and down (its style) and gets its place anew every frame: where it rests, from the layout, so the hand
   and the hole on it stay still */
const SR={left:0,top:0,right:0,bottom:0,width:0,height:0};let TAGR=null,TAGT=0;
const onMap=el=>!!(el&&el.parentNode&&el.parentNode.id==='tags');
function rectOf(el){if(!onMap(el))return el.getBoundingClientRect();const w=el.offsetWidth,h=el.offsetHeight;if(!w)return el.getBoundingClientRect();
 const now=performance.now();if(!TAGR||now-TAGT>400){TAGR=el.parentNode.getBoundingClientRect();TAGT=now}
 SR.width=w;SR.height=h;SR.left=TAGR.left+(parseFloat(el.style.left)||0)-w/2;SR.top=TAGR.top+(parseFloat(el.style.top)||0)-h;SR.right=SR.left+w;SR.bottom=SR.top+h;return SR}
/* the hand's place. Where it is wanted (HW: the point, the thing it points at, the side it comes from) is noted by the loop and, for
   a thing that moves, by follow each frame; move() then puts the hand there, once a frame and once at the end of each look. To a new
   thing, or to another side of the same one, it glides (GLIDE ms, quick away and landing softly, to where the thing is at that
   moment, so it arrives on time and exactly even while the map moves; another side chosen on the way bends the glide, it does not
   begin again); on the same thing it is simply there, never trailing behind it and never trembling.
   A place that only the loop gives, ten times a second (the way to a plot off the screen, a person on the walk), is followed softly
   (SOFT) from the first moment, also on the way to it, so the hand does not move in steps. hkey: what a button is known by, the same after its card is drawn again */
const GLIDE=400,SOFT=90,ease=u=>1-(1-u)*(1-u)*(1-u),HW={x:0,y:0,k:null,d:'',soft:false},HP={x:0,y:0,fx:0,fy:0,t0:0,tl:0,k:null,d:'',lx:NaN,ly:NaN};
const hkey=el=>onMap(el)&&el._o||el.id||el;
function handTo(x,y,k,d,soft){HW.x=x;HW.y=y;HW.k=k;HW.d=d||'';HW.soft=!!soft}
let EM=null;function turn(t){const em=EM||(EM=ARROW.querySelector('em'));if(em.style.transform!==t)em.style.transform=t}
function move(now){const w=HW,p=HP;if(!ARROW||w.k===null||HIDEP.get.call(ARROW))return;
 if(ARROW.snap||p.k===null){ARROW.snap=0;p.x=w.x;p.y=w.y;p.t0=0}else if(w.soft)p.t0=0;else if(w.k!==p.k||w.d!==p.d){const e=p.t0&&w.k===p.k?ease((p.tl-p.t0)/GLIDE):1;
  if(e<.6){p.fx=(p.x-w.x*e)/(1-e);p.fy=(p.y-w.y*e)/(1-e)}else{p.fx=p.x;p.fy=p.y;p.t0=now}}
 p.k=w.k;p.d=w.d;
 if(p.t0){const u=(now-p.t0)/GLIDE;if(u>=1)p.t0=0;else{const e=ease(u);p.x=p.fx+(w.x-p.fx)*e;p.y=p.fy+(w.y-p.fy)*e}}
 if(!p.t0){if(w.soft&&Math.abs(w.x-p.x)+Math.abs(w.y-p.y)>.3){const a=1-Math.exp(-Math.min(200,now-p.tl)/SOFT);p.x+=(w.x-p.x)*a;p.y+=(w.y-p.y)*a}else{p.x=w.x;p.y=w.y}}
 p.tl=now;if(p.x!==p.lx){p.lx=p.x;ARROW.style.left=p.x.toFixed(1)+'px'}if(p.y!==p.ly){p.ly=p.y;ARROW.style.top=p.y.toFixed(1)+'px'}}
/* a point of the map on the screen, into o, with nothing made anew: for follow, each frame */
let PV=null,G3R=null,G3T=0;const PA=[0,0],PB=[0,0];
function projTo(x,y,o){const g=window.__G3;if(!g||!g.camera||!g.E)return false;const cm=g.camera;if(!PV)PV=cm.position.clone();PV.set(g.E(x),2,g.E(y)).project(cm);if(PV.z>1)return false;
 const now=performance.now();if(!G3R||now-G3T>400){G3R=$q('#g3').getBoundingClientRect();G3T=now}o[0]=G3R.left+(PV.x+1)/2*G3R.width;o[1]=G3R.top+(1-PV.y)/2*G3R.height;return true}
/* a sign or a place on the map moves when the map is drawn, which comes after this in a frame and not in every frame: the hand and
   the hole are set on it by tgSigns, called once the signs have their places (labels.js), so they are never a frame behind it */
let FOL=null,SIGT=0;const signOf=(el,d)=>{const c=el.className.replace(' tgRing','');return{el,o:onMap(el)&&el._o||null,cn:c,cr:c+' tgRing',d,dim:true}};
function follow(){requestAnimationFrame(follow);if(!ARROW)return;const f=FOL,now=performance.now();if(f&&!ARROW.hidden&&!((f.pl||f.o)&&now-SIGT<300))track(f);move(now)}
window.tgSigns=()=>{SIGT=performance.now();const f=FOL;if(!f||!ARROW||!(f.pl||f.o))return;if(!ARROW.hidden)track(f);move(SIGT)};
function track(f){
 /* a place on the map (a plot to tap, a house lit): the hand on it and the round hole about it, as the map moves */
 if(f.pl){if(!projTo(f.pl[0],f.pl[1],PA))return;handTo(PA[0],PA[1],f.k,'');
  if(f.dim&&DIM&&DK!=='shut'&&DIM.classList.contains('on')){const r=projTo(f.pl[0]+f.f/2,f.pl[1]+f.f/2,PB)?Math.max(46,Math.hypot(PB[0]-PA[0],PB[1]-PA[1])+28):58,st=DIM.style;st.left=(PA[0]-r)+'px';st.top=(PA[1]-r)+'px';st.width=st.height=2*r+'px';st.borderRadius=r+'px'}return}
 /* the signs are handed out anew every frame: the one over the same building is found again (with the ring's class on it or not:
    the next frame takes that off again) */
 if(f.o){const c=f.el.className;if(f.el._o!==f.o||c!==f.cn&&c!==f.cr||f.el.style.display==='none'){let n=null;const p=f.el.parentNode;
   for(let e=p&&p.firstElementChild;e;e=e.nextElementSibling)if(e._o===f.o&&(e.className===f.cn||e.className===f.cr)&&e.style.display!=='none'){n=e;break}if(!n)return;f.el=n}}
 /* the button has gone from under the hand (its bar or card closed): the hand and the hole go with it, in the same frame */
 if(!f.el.isConnected)return;const r=rectOf(f.el);if(!r.width){if(!f.o&&!onMap(f.el)){if(f.dim)shut();ARROW.off()}return}
 /* a sign the advisor explains: the hand over it and a round hole about it */
 if(f.tip){const x=r.left+r.width/2,y=r.top+r.height/2;handTo(x,r.top-2,'tip','');if(DIM&&DK!=='shut'&&DIM.classList.contains('on')){const st=DIM.style;st.left=(x-30)+'px';st.top=(y-30)+'px'}return}
 handOn(r,f.d||(f.up?'up':'dn'),f.o||hkey(f.el));
 if(f.dim&&DIM&&DK!=='shut'&&DIM.classList.contains('on')){const st=DIM.style;st.left=(r.left-6)+'px';st.top=(r.top-6)+'px';st.width=(r.width+12)+'px';st.height=(r.height+12)+'px'}}
requestAnimationFrame(follow);
/* which way the hand comes: from below for a button near the top, and for one in a panel, on the desk or in a menu when there is room
   under it, so it never covers the words above the button; from above elsewhere (the bar at the bottom, the map) */
function fromBelow(el,r){return r.top<innerHeight*.3||!!(el&&el.closest&&el.closest('#info,#ovCard,#lack,#trade,#stObj,#spdMenu,#tg')&&r.bottom+96<innerHeight)}
/* and never over words to read: of above, below, right and left (the usual way first, then the way it already came), the first whose
   hand covers none of the card's line, a panel's text or the walk map's caption, and stays on the screen. A big target (the walk's map)
   gets the hand inside it, low and right of its middle, clear of the red arrow there. AIMD: the hand's box round the fingertip, its turn */
const AIMD={dn:[-34,-86,18,0,''],up:[-18,0,34,86,'rotate(180deg)'],lt:[0,-34,86,18,'rotate(90deg)'],rt:[-86,-18,0,34,'rotate(-90deg)']};
const READQ='#tg p,#tg small,#tg .tgL,#ovCard h2,#ovCard h3,#ovCard p,#ovCard li,#ovCard td,#ovCard .m,#ovCard b,#ovCard summary,#ovCard .why span,#ovCard .law span,#ovCard .finTabs button,#lackTxt,#wkBig small,#info h3,#info p,#info .m,#conf p';
/* a heading is one short line in a box as wide as its panel: only its words count, so the hand may come over the empty part of its row */
const wordBox=e=>{if(!/^H[23]$/.test(e.tagName))return e.getBoundingClientRect();const g=document.createRange();g.selectNodeContents(e);return g.getBoundingClientRect()};
const bigT=r=>r.width>160&&r.height>160;
const TP=[0,0];
function aimTip(d,r){if(bigT(r)){TP[0]=r.left+r.width*.74;TP[1]=r.top+r.height*.76}else if(d==='dn'||d==='up'){TP[0]=r.left+r.width/2;TP[1]=d==='dn'?r.top+4:r.bottom-2}else{TP[0]=d==='lt'?r.right-4:r.left+4;TP[1]=r.top+r.height/2}return TP}
let AIM=null;
/* chosen once for a button and kept while it stays where it is, so the hand never flips from side to side as things change near it
   (nor when its card is drawn again with new numbers: the button is known by its name, hkey) */
function aimDir(el,r,pref){if(bigT(r))return'dn';const key=hkey(el);if(AIM&&AIM.el===key&&Math.abs(r.left-AIM.x)<40&&Math.abs(r.top-AIM.y)<40)return AIM.d;const R=[];
 /* a panel's words that are scrolled out of it, or lie under its row of buttons, are not on the screen and do not count */
 const oc=$q('#ovCard'),ob=oc&&oc.querySelector('.btns'),cr=oc&&oc.getBoundingClientRect(),cb=ob?ob.getBoundingClientRect().top:cr?cr.bottom:0;
 document.querySelectorAll(READQ).forEach(e=>{if(e.contains(el)||el.contains(e))return;let q=wordBox(e);
  if(oc&&oc.contains(e)&&!(ob&&ob.contains(e))){const t=Math.max(q.top,cr.top),m=Math.min(q.bottom,cb);if(m<=t)return;q={left:q.left,right:q.right,top:t,bottom:m,width:q.width,height:m-t}}
  if(q.width&&q.height)R.push(q)});
 const ord=[pref,...['dn','up','lt','rt'].filter(d=>d!==pref)];let best=pref,bs=1e9;
 for(const d of ord){const[x,y]=aimTip(d,r),b=AIMD[d],x0=x+b[0]-8,y0=y+b[1]-12,x1=x+b[2]+8,y1=y+b[3]+8;let sc=x0<0||y0<0||x1>innerWidth||y1>innerHeight?5e4:0;
  for(const q of R)sc+=Math.max(0,Math.min(x1,q.right)-Math.max(x0,q.left))*Math.max(0,Math.min(y1,q.bottom)-Math.max(y0,q.top));if(sc<bs){bs=sc;best=d}if(!sc)break}
 AIM={el:key,d:best,x:r.left,y:r.top};return best}
function handOn(r,d,k,soft){aimTip(d,r);handTo(TP[0],TP[1],k,d,soft);turn(AIMD[d][4])}
/* the hand on a button: the side chosen (after the card is placed, so its words count) and kept while it moves */
/* a button in a panel's row of buttons (Close, Build...) is pointed at from the side, along the row, where nothing is written */
function handAt(el,r,up){const row=!!(el.closest&&el.closest('#ovCard .btns'))&&r.right+100<innerWidth,d=aimDir(el,r,row?'lt':up?'up':'dn');handOn(r,d,hkey(el));return d}
/* the advisor's card with a line of its own, the hand and the gold ring on one button, the rest dimmed (by: what the card is showing) */
function sayCard(txt,by){const s=ST()[S.tg.i],who=(s&&s.who)||(NYC()?'greeley':'cren'),[nm,role]=WHO[who]||WHO.cren;
 if(CARD.dataset.by!==by||CARD.hidden){CARD.dataset.by=by;ARROW.dataset.who=who;CARD.classList.remove('tgOut','tgPop');CARD.innerHTML=`<img class="tgFace" src="${face(who)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${txt}</p></div>`;CARD.hidden=false;void CARD.offsetWidth;CARD.classList.add('tgPop');LASTSIG=''}}
/* a panel is read before the way on is shown: for LOOKMS only the card's line, nothing pointed at and nothing dimmed; then its last
   sentence (in its place from the start, unseen, so the card does not move) shows, and the hand and the ring come */
const LOOKMS=2400,LOOK={k:'',t:0};
const readThen=(el,txt,late,by,ms)=>readParts(el,[[txt,ms||LOOKMS]],late,by);
/* a longer look is told in parts ([words, time, the part of the panel they are about]): each further sentence shows after the one
   before it has had its time, and the part it is about glows softly meanwhile */
function readParts(el,parts,late,by){const now=performance.now();if(LOOK.k!==by||CARD.dataset.by!==by||CARD.hidden){LOOK.k=by;LOOK.t=now}
 const all=parts.map((p,j)=>j?`<span class="tgLate">${p[0]}</span>`:p[0]).join(' ')+` <span class="tgLate">${late}</span>`;let t=now-LOOK.t,i=0;while(i<parts.length&&t>=parts[i][1])t-=parts[i++][1];
 if(i<parts.length){sayCard(all,by);ring(null);ARROW.hidden=true;CARD.querySelectorAll('.tgLate').forEach((e,j)=>{if(j<i)e.classList.add('on')});soft(parts[i][2]?$q(parts[i][2]):null);
  const r=el.getBoundingClientRect();place(r.left+r.width/2,r.top+r.height/2,el);return}
 soft(null);pointAt(el,all,by);CARD.querySelectorAll('.tgLate').forEach(e=>e.classList.add('on'))}
/* the soft glow on a thing that is being explained, not pressed (one at a time) */
function soft(el){document.querySelectorAll('.tgRing2').forEach(e=>{if(e!==el)e.classList.remove('tgRing2')});if(el&&!el.classList.contains('tgRing2')){el.classList.add('tgRing2');bring(el)}}
/* a thing inside a panel that scrolls is brought into view once, when it is shown: below the panel's edge or under its foot with the
   Close button it would be explained or pointed at unseen. What fits on the panel's first screen is shown with the panel at its top, so
   the heading is whole; anything further down moves the panel only as far as needed. Only the panel itself is moved, never the page */
let BRG=null;
function bring(el){if(BRG===el)return;BRG=el;const p=el.closest&&el.closest('#ovCard');if(!p||p.scrollHeight<=p.clientHeight+2)return;
 const a=el.getBoundingClientRect(),b=p.getBoundingClientRect(),f=p.querySelector(':scope>.btns'),bot=f?Math.min(b.bottom,f.getBoundingClientRect().top):b.bottom;
 let y=p.scrollTop;if(a.bottom+y<=bot-8)y=0;else if(a.top<b.top+8)y-=b.top+8-a.top;else if(a.bottom>bot-8)y+=Math.min(a.bottom-bot+8,a.top-b.top-8);
 if(Math.abs(y-p.scrollTop)>1)p.scrollTo({top:y,behavior:'smooth'})}
/* the words on the step's card, when new, are read before anything points: how long depends on how much there is to read */
let RDW='',RDT=0;
function reading(){const p=CARD.querySelector('p'),w=p?p.textContent:'',now=performance.now();if(w!==RDW){RDW=w;RDT=now}return now-RDT<Math.min(LOOKMS,350+12*w.length)}
function pointAt(el,txt,by){sayCard(txt,by);bring(el);
 ring(el);const r=el.getBoundingClientRect();ARROW.classList.remove('place','edge');delete ARROW.dataset.row;delete ARROW.dataset.go;ARROW.hidden=false;
 DH=[r.left-6,r.top-6,r.width+12,r.height+12,14];DHE=el;place(r.left+r.width/2,r.top+r.height/2,el);FOL={el,d:handAt(el,r,fromBelow(el,r)),dim:true}}
/* ---------- the desk, shown slowly: first a moment to look at it with nothing on the screen, then each thing on it in turn, the
   hand on it and the rest dimmed, a line of what it is and Next; last, the way out. Leaving the study at any time ends the tour ---------- */
const DESKT=[['letters','📨 Letters and laws: what the people ask of you, each one a goal, and the laws you can make.'],['plan','🏛️ Monuments: the great buildings of the Ring, and when the real ones were built.'],
 ['ledger','📒 The treasury: your money, what comes in and what goes out.'],['trades','🏭 Goods: how each good is made, and which works lack what they need.'],['research','📕 Research: new inventions for your city.'],
['cases','🗂️ Case files: crimes and secrets. You can go out and solve them yourself.'],['paper','📰 The newspaper: what happened in your city.'],
 ['today','📋 Urgent: what most needs you now. Tap it to see the list.'],['#stOut',null]];
const DESKLOOK=1200;let DT=null;
/* where the tour has got is kept in the save (S.tg.dk.i: -1 before the first look), so leaving the desk and coming back goes on from
   there; opening the thing the hand is on counts as seeing it: once its panel is closed, the tour moves to the next */
function deskTour(){const now=performance.now();if(!DT)DT={i:-1,t:now,sig:''};const g=S.tg.dk||(S.tg.dk={i:-1});DT.i=g.i;
 /* a panel opened from the desk: the hand on what it is for (Enact on a law that can be made now), else on its Close */
 if(!$q('#ov').hidden){DT.sig='';if(g.i>=0)g.op=g.i;const k=DESKT[g.i]&&DESKT[g.i][0],cl=$q('#ovCard #ovOk')||$q('#ovCard button.x');
  /* what to do there: Enact a law, research an item that has turned gold; else what the panel shows and the way back */
  const h2=($q('#ovCard h2')||{}).textContent||'',pk=/Research/.test(h2)?'research':/Case/.test(h2)?'cases':/Finances/.test(h2)?'ledger':/goods/.test(h2)?'trades':/Monuments/.test(h2)?'plan':/paper/.test(h2)?'paper':/Urgent/.test(h2)?'today':/Hofburg|City Hall/.test(h2)?(k==='laws'?'laws':'letters'):k;
  /* research shown once by doing it: if no item can be paid yet, the next research is made free (the panel drawn again), so
     it turns gold and is researched here; afterwards the way back */
  if(pk==='research'&&S.rs)g.rg=1;
  if(pk==='research'&&!g.rg&&!S.rs&&!$q('#ovCard [data-t].pri:not([disabled])')){const yr=Y0+S.t/YEAR,t=TECH.filter(q=>yr>=q[3]&&!RES()[q[0]]).sort((a,b)=>a[4]-b[4])[0];if(t){S.rfree=Math.max(S.rfree||0,1);showResearch();return}}
  /* the ledger shown through its tabs: the overview, then In & out, then Taxes, each tapped in turn, then the way back */
  if(pk==='ledger'&&typeof FINTAB!=='undefined'){if(!g.fo){g.fo=1;if(FINTAB!=='o'){showFinances('o');return}}
   if(FINTAB==='i')g.fi=1;if(FINTAB==='t'&&g.fi)g.ft=1;const tb=q=>$q(`#ovCard .finTabs [data-ftab="${q}"]`);
   if(!g.fi&&tb('i')){if(FINTAB==='o')readParts(tb('i'),[['The overview. At the top: your treasury, and the trend: what you gain or lose each minute.',4500,'#ovCard .finTiles'],['Below: the ways to get more money.',3000,'#ovCard .finWays']],'Now tap “In & out”.','fin-i');
    else pointAt(tb('i'),'First tap “In & out”.','fin-i2');return}
   if(!g.ft&&tb('t')){if(FINTAB==='i')readParts(tb('t'),[['In & out. Your income, like rent, and your expenses, like upkeep.',4000,'#ovCard .finIO'],['The trend is what is left. Keep it above zero.',3500,'#ovCard .finSum']],'Now tap “Taxes”.','fin-t');
    else pointAt(tb('t'),'Now tap “Taxes”.','fin-t2');return}}
  /* a law ready to enact, wherever the Hofburg's panel shows it (the letters too): Enact first, once, then the way back */
  if(pk==='laws'||pk==='letters'){const nl=typeof LAW==='function'?Object.values(LAW()).filter(Boolean).length:0;if(g.l0==null)g.l0=nl;if(nl>g.l0)g.en=1}
  const en=(pk==='laws'||pk==='letters')&&!g.en&&$q('#ovCard .law:not(.on) button.pri[data-l]:not([disabled])'),rs=pk==='research'&&!g.rg&&$q('#ovCard [data-t].pri:not([disabled])');
  if(en){readThen(en,'A law you can make now. It costs money once.','Tap Enact to make it law.','enact');return}
  if(rs){readThen(rs,'Research makes your city better: each discovery helps your people or your works, and it stays.','Tap this one to start it.','res');return}
  const say={letters:'Requests from your people, each with a reward, and your laws.',plan:'The great buildings, and the years the real ones were built.',
   ledger:'Taxes: higher taxes bring more money, but make people less happy.',trades:'Each good, its works, and what to build next.',
   research:g.rg?'The research has begun. The bar shows how far it has got: about two minutes.':'Each discovery costs money once.',laws:'Laws you can make, and the ones that come later.',
   cases:'Your cases: crimes and secrets to solve.',paper:'What happened in your city.',today:'What needs you now.'}[pk]||'Take your time to look.';
  if(cl){readThen(cl,say,pk==='today'?'Tap a line to go there, or close it.':'Close it to go back to your desk.','ovx'+pk);return}
  CARD.hidden=true;ARROW.hidden=true;ring(null);return}
 LOOK.k='';
 if(g.op!=null){if(g.op===g.i&&g.i<DESKT.length-1)g.i++;g.op=null;DT.i=g.i;DT.sig=''}
 if(g.i<0){CARD.hidden=true;ARROW.hidden=true;ring(null);if(now-DT.t<DESKLOOK)return;g.i=DT.i=0}
 const it=DESKT[Math.min(DT.i,DESKT.length-1)],last=DT.i>=DESKT.length-1,el=$q(it[0].startsWith('#')?it[0]:`#stObj [data-o="${it[0]}"]`),who=NYC()?'greeley':'cren',[nm,role]=WHO[who];
 const txt=last?`That is your desk, ${NYC()?'Mr. Mayor':'Majesty'}. Tap “Leave the study” to go back to your city.`:it[1];
 if(DT.sig!==String(DT.i)||CARD.hidden){DT.sig=String(DT.i);CARD.dataset.by='desk';ARROW.dataset.who=who;CARD.classList.remove('tgOut','tgPop');
  CARD.innerHTML=`<img class="tgFace" src="${face(who)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${txt}</p>${last?'':`<div class="tgB"><button class="pri" id="tgDeskNx">Next</button><span class="tgCt">${DT.i+1} of ${DESKT.length-1}</span></div>`}</div>`;
  CARD.hidden=false;void CARD.offsetWidth;CARD.classList.add('tgPop');const nx=$q('#tgDeskNx');if(nx)nx.onclick=e=>{e.stopPropagation();g.i++;sfx('click')}}
 ring(el);if(!el){ARROW.hidden=true;return}const r=el.getBoundingClientRect();
 ARROW.classList.remove('place','edge');delete ARROW.dataset.row;delete ARROW.dataset.go;ARROW.hidden=false;
 DH=[r.left-6,r.top-6,r.width+12,r.height+12,14];DHE=el;place(r.left+r.width/2,r.top+r.height/2);FOL={el,d:handAt(el,r,fromBelow(el,r)),dim:true}}
/* ---------- the badges over buildings, told once each: the first time a kind shows (in the tutorial or after it), the advisor's card says
   what it means, the screen dims round the badge, his hand points at it and the building glows. Got it, or a tap on the badge (which
   opens the building's card), closes it, and the step that was on the card comes back. Never while something is being placed or a card
   is open; the kinds told are kept in the save (S.bdtip) ---------- */
let TIP=null;
window.tgTip=function(k,txt,o){if(!S||calmOn())return false;const seen=S.bdtip||(S.bdtip={});if(seen[k])return true;if(TIP)return false;const b=document.body.classList;
 /* never in the middle of a step that still has buildings to place: told once that step's list is done (the sign is asked again) */
 if(tgOn()&&S.tg&&!S.tg.ok){const s=ST()[S.tg.i];if(s&&s.ks&&s.ks.some((q,i)=>own(q)-(S.tg.b[q]||0)<s.n[i]))return false}
 if(!$q('#ov').hidden||onFoot()||b.contains('placing')||b.contains('instudy')||$q('#info:not([hidden])')||!$q('#conf').hidden||mode)return false;
 seen[k]=1;TIP={k,txt,o,ic:String(txt).split(' over ')[0],lost:0};LASTSIG='';return true};
/* the sign being told stays on the screen while the card is up (labels.js), even if its want is met meanwhile */
window.tgTipHold=()=>TIP;
function tipEnd(){TIP=null;LASTSIG='';if(CARD){CARD.hidden=true;delete CARD.dataset.by}if(ARROW)ARROW.hidden=true}
/* whether the want the tip tells of has been met meanwhile (a good came in, a home's need was filled, a road joined, workers came) */
function tipMet(){const o=TIP.o,d=B[o.t],g=TIP.k==='in'&&d&&(d.in||d.burns);return TIP.k==='in'?!!g&&(S.stock[g]||0)>=1&&!/^Waiting/.test(o.st||''):TIP.k==='nd'?!o.nd:TIP.k==='nw'?!o.nw:
 TIP.k==='rd'||TIP.k==='st'?!!o.c:TIP.k==='bl'?!(o.bld&&Object.keys(o.bld).some(k=>o.bld[k]>0&&(S.stock[k]||0)<1)):false}
function tipShow(){els();const now=performance.now();
 if(!$q('#ov').hidden||onFoot()||document.body.classList.contains('instudy')){CARD.hidden=true;ARROW.hidden=true;ring(null);return}
 /* the badge tapped: the building's card says the rest, and the hand then shows how to close it again; closed, the tip is over */
 if(sel===TIP.o&&$q('#info:not([hidden])'))TIP.ph='card';
 /* its want met before the badge was tapped (the grain came in): the tip goes, and the sign with it, and is told another time */
 if(TIP.ph!=='card'){if(tipMet()){if(!TIP.met)TIP.met=now;else if(now-TIP.met>1200){delete S.bdtip[TIP.k];tipEnd();return}}else TIP.met=0}
 if(TIP.ph==='card'){const x=$q('#info:not([hidden]) #infoX');if(!x||!$q('#lack').hidden){tipEnd();return}const who=NYC()?'greeley':'cren',[nm,role]=WHO[who];
  /* the want met while its card was opened (a good came in, a home's need was filled, a road joined): said plainly, so the card's
     "Working" or "All needs met" does not contradict the sign */
  const o=TIP.o,d=B[o.t],g=TIP.k==='in'&&d&&(d.in||d.burns),met=tipMet();
  /* the card's own way out of the want (Build a ship mill, How to get bricks): the hand on it, and a tap there leads on; else the ✕ */
  const go=!met&&$q('#info:not([hidden]) #stlGo'),gt=go&&go.offsetParent?go.textContent.trim():'',tg=gt?go:x,by='tipx'+(met?1:0)+gt;
  if(CARD.dataset.by!==by||CARD.hidden){CARD.dataset.by=by;ARROW.dataset.who=who;CARD.classList.remove('tgOut','tgPop');CARD.innerHTML=`<img class="tgFace" src="${face(who)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${met?g?`It just got ${g==='wood'?'timber':g} again, so it works now. Tap ✕ to close it.`:'It has just got what it needed, so all is well now. Tap ✕ to close it.':gt?`This card tells what the building needs. Tap “${gt}” on it.`:'This card tells what the building needs. Tap ✕ to close it.'}</p></div>`;CARD.hidden=false;void CARD.offsetWidth;CARD.classList.add('tgPop')}
  ring(tg);window.tgHi=TIP.o;const r=tg.getBoundingClientRect();ARROW.classList.remove('place','edge');ARROW.hidden=false;
  DH=[r.left-6,r.top-6,r.width+12,r.height+12,14];DHE=tg;place(r.left+r.width/2,r.top+r.height/2);FOL={el:tg,d:handAt(tg,r,fromBelow(tg,r)),dim:true};return}
 /* something is being placed (a road offered, a plot): the badges are hidden then, so the tip makes way and is told another time */
 if(document.body.classList.contains('placing')||!$q('#conf').hidden||mode){delete S.bdtip[TIP.k];tipEnd();return}
 const bds=[...document.querySelectorAll('#tags .bd')].filter(e=>e._o===TIP.o&&e.style.display!=='none'&&e.offsetParent),bd=bds.find(e=>e.textContent===TIP.ic)||bds[0];
 /* the card comes only with its badge on the screen; the badge gone for a while (scrolled away, or its want met): told another time */
 if(!bd){if(!TIP.lost)TIP.lost=now;else if(now-TIP.lost>4000){delete S.bdtip[TIP.k];tipEnd();return}CARD.hidden=true;ARROW.hidden=true;return}TIP.lost=0;
 const who=NYC()?'greeley':'cren',[nm,role]=WHO[who];
 if(CARD.dataset.by!=='tip'||CARD.hidden){CARD.dataset.by='tip';ARROW.dataset.who=who;GAP=0;CARD.classList.remove('tgOut','tgPop');
  CARD.innerHTML=`<img class="tgFace" src="${face(who)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${TIP.txt}</p><div class="tgB"><button class="pri" id="tgTipOk">Got it</button></div></div>`;
  CARD.hidden=false;void CARD.offsetWidth;CARD.classList.add('tgPop');$q('#tgTipOk').onclick=e=>{e.stopPropagation();tipEnd()}}
 ring(null);window.tgHi=TIP.o;
 const r=rectOf(bd),x=r.left+r.width/2,y=r.top+r.height/2,ty=r.top-2;ARROW.classList.remove('place','edge');delete ARROW.dataset.row;delete ARROW.dataset.go;
 ARROW.hidden=false;handTo(x,ty,'tip','');turn('');DH=[x-30,y-30,60,60,30];place(x,y);FOL=signOf(bd,'');FOL.o=TIP.o;FOL.tip=1}
/* the walking guide's hand, on the button its step is about (the circle, the map, Back), whether or not the city tutorial still runs */
function wgHand(){els();const ws=WG&&wgSteps()[WG.i],b=WG&&WG.b||{};let el=null,r=null;if(!ws||wgRest()){ARROW.hidden=true;return}
 if(ws.talk){if(b.ph==='walk'&&b.tp&&b.show&&onFoot()){const p=tScr(b.tp,2.05);if(p)r={left:p[0]-1,width:2,top:p[1],bottom:p[1]}}
  else if(b.ph==='build'&&!$q('#conf').hidden)el=$q('#confOk')}
 else if(onFoot())el=$q(wgElOn(ws)?ws.elOn:ws.el||'#none');
 if(el&&el.offsetParent)r=el.getBoundingClientRect();if(!r){ARROW.hidden=true;return}const up=!!el&&r.top<innerHeight*.3;
 ARROW.classList.remove('place','edge');ARROW.hidden=false;ARROW.dataset.who=NYC()?'greeley':'cren';if(el){FOL={el,d:handAt(el,r,up)};return}FOL=null;handOn(r,'dn','walk',true)}
function loop0(){window.tgHi=null;if(TIP&&S){tipShow();return}if(PRWALK&&TGPRACTICE){if(onFoot())PRWALK=2;else if(PRWALK===2){PRWALK=0;backHome()}}if(!tgOn()){if(ON){ON=false;if(CARD)CARD.hidden=true;if(ARROW)ARROW.hidden=true;ring(null);document.querySelectorAll('.tgRing2').forEach(e=>e.classList.remove('tgRing2'));document.body.classList.remove('tg')}if(FINC){finShow();return}if(WG&&(onFoot()||WG.b&&WG.b.ph==='build'))wgHand();else if(ARROW)ARROW.hidden=true;return}ON=true;if(onFoot()){
  /* the walk begun from the last card: the tutorial is done, the walking guide takes over */
  {const s=ST()[S.tg.i];if(s&&s.end){if(TGPRACTICE)PRWALK=2;end(false,true);return}}
  if(!wgOn()){if(CARD)CARD.hidden=true;ring(null)}wgHand();return}
 document.body.classList.add('tg');
 /* an open card, or the Emperor's study, hides the tutorial's card and arrow until it is closed */
 els();
 /* at the desk, in the step that sent him there: the tour of the desk */
 {const st_=document.body.classList.contains('instudy'),s=ST()[S.tg.i];if(!st_)DT=null;else if(s&&s.tap==='desk'&&TAPD===S.tg.i){deskTour();return}}
 /* the treasury open in its step: the hand on its Build button for more homes, which goes on to the homes */
 {const s=ST()[S.tg.i],fb=s&&s.tap==='money'&&TAPD===S.tg.i&&$q('#ov:not([hidden]) [data-fin="plot"]');if(fb){readThen(fb,`More homes bring more rent, ${NYC()?'Mr. Mayor':'Majesty'}.`,'Tap Build to place one.','fin',2000);return}}
 if(!$q('#ov').hidden||document.body.classList.contains('instudy')){if(CARD)CARD.hidden=true;if(ARROW)ARROW.hidden=true;ring(null);LASTSIG='';return}
 /* the supply for the step, kept up while it lasts: homes still being built draw on the store, and a shortage counted down brick by
    brick would redraw the card again and again */
 {const s=ST()[S.tg.i];if(s&&!S.tg.ok)supply(s)}
 try{show()}catch(e){console.warn('tutorial',e);return}
 /* a building the step asks for, once enough of it stands, puts the build tool away: the tutorial never invites a second one by mistake
    (its card moves on to the next thing to build); a footprint already waiting for another is put away with it */
 {const s=ST()[S.tg.i];if(mode&&s){const i=s.ks?s.ks.indexOf(mode):-1;
  if(i>=0&&own(mode)-(S.tg.b[mode]||0)>=s.n[i]||S.tg.ok&&(i>=0||mode==='road'&&s.road)){setMode(null);if(typeof barOpen==='function')barOpen(false)}}}
 /* the ring and the arrow come only with the card's own message: none while one card makes way for the next, while the card still holds
    its old words a moment after a build (STALE), or while it is not shown */
 if(GAP||STALE||!CARD||CARD.hidden){ring(null);if(ARROW)ARROW.hidden=true;window.tgHi=null;return}
 let t=target();
 {const s=ST()[S.tg.i];if(s&&!S.tg.ok)GK=s.move&&!HAND.drag?'drag':s.zoom&&!HAND.zoom?'pinch':''}
 /* a footprint waiting off the screen: the arrow first shows the way to it, and only once it is in view points at ✓ Build (not while
    the camera is still flying to a plot the tutorial has just put down, FLY) */
 if(t&&t.el&&t.el.id==='confOk'&&pend&&!/^[rl]/.test(pend)&&performance.now()>FLY){const[gx,gy]=pend.split(',').map(Number),f=(B[mode]&&B[mode].foot)||1,c=[gx+f/2,gy+f/2],q=projRaw(c[0],c[1]);if(q&&!inView(q))t={place:c,k:mode}}
 /* the first plot's arrows glow while they are explained (building higher has its own step and ring) */
 soft(moveHint()?$q('#conf .cfArrows'):null);
 /* new words on the card are read first: the ring, the hand and the dimming wait a moment (longer for a longer line), the card already
    in its place; a last sentence that tells what to tap (tgLate) shows only then */
 if(reading()){ring(null);ARROW.hidden=true;window.tgHi=t&&t.o||null;let x=null,y=null,el=t&&t.el&&!CARD.contains(t.el)?t.el:null;
  if(el){const r=rectOf(el);if(r.width){x=r.left+r.width/2;y=r.top+r.height/2}}else if(t&&t.place){const p=projRaw(t.place[0],t.place[1]);if(p&&inView(p)){x=p[0];y=p[1]}}
  place(x,y,el);return}
 {const l=CARD.querySelector('.tgLate:not(.on)');if(l)l.classList.add('on')}
 let ty=null,tx=null;ring(t&&!t.noRing&&t.el||null);
 let ap=null,edge=null,side=null,up=0,hel=null;if(t&&t.el){const r=rectOf(t.el);ty=r.top+r.height/2;tx=r.left+r.width/2;if(r.width)ap=[tx,r.top+4];
  /* a card off the side of its sliding row (the build cards, the kinds): the row slides it into view once, so the player sees the row
     slides; slid away again, the arrow sits at the row's edge pointing the way, with a line to slide the row */
  /* the card's own button: the arrow comes from below and points up at it, clear of the card's words, and the card stays put */
  if(CARD.contains(t.el)){if(r.width)ap=[tx,r.bottom-2];up=1;tx=ty=null}
  /* a button in the top bar or the open stores below it: the hand comes from below and points up at it */
  else if(r.width&&(r.top<90||t.el.closest('#top')||fromBelow(t.el,r))){ap=[tx,r.bottom-2];up=1}
  const row=t.el.closest('#builds,#cats,#subs');if(row){const w=row.getBoundingClientRect(),off=r.right>w.right+2?1:r.left<w.left-2?-1:0;
   if(off){const key=S.tg.i+'|'+(t.el.dataset.k||t.el.dataset.c||t.el.dataset.s||'');SIDEL=t.el;
    if(SLID!==key){SLID=key;const el=t.el;setTimeout(()=>{if(el.isConnected)el.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})},600)}
    side=[off>0?w.right-26:w.left+26,w.top+w.height/2,off>0?0:Math.PI];ap=null}}}
 if(t&&t.place){const p=projRaw(t.place[0],t.place[1]);if(p){const[px,py]=p,[L0,top,R0,B0]=viewBox(p[3]);
   if(inView(p)){ap=[px,py];ty=py;tx=px}
   else{const cx=(L0+R0)/2,cy=(top+B0)/2,dx=px-cx,dy=py-cy,k=Math.min(dx?Math.abs((R0-L0)/2/dx):1e9,dy?Math.abs((B0-top)/2/dy):1e9);edge=[cx+dx*k,cy+dy*k,Math.atan2(dy,dx)]}}}
 if(side){ARROW.classList.remove('place');ARROW.classList.add('edge');ARROW.hidden=false;handTo(side[0],side[1],'side','',true);turn(`rotate(${side[2]?90:-90}deg)`);
  delete ARROW.dataset.go;ARROW.dataset.row='1';const sp=ARROW.querySelector('span'),k=t.el.dataset.k,txt=`Slide the row to find the ${k&&B[k]?nm_(B[k].n):'next one'}.`;if(sp.textContent!==txt)sp.textContent=txt;
  sp.style.left=(side[2]?-10:-170)+'px';sp.style.top='-62px';place(side[0],side[1]);return}
 delete ARROW.dataset.row;
 /* the hole for the spotlight: round the button (not one on the card itself, which is never dimmed), or round the building or plot */
 if(t&&!edge){if(t.el&&!CARD.contains(t.el)){const r=rectOf(t.el);if(r.width){DH=[r.left-6,r.top-6,r.width+12,r.height+12,14];DHE=onMap(t.el)?null:t.el}}
  else if(t.place&&ap){const f=(t.o&&B[t.o.t]&&B[t.o.t].foot)||(t.k&&B[t.k]&&B[t.k].foot)||1,q=projRaw(t.place[0]+f/2,t.place[1]+f/2),r=Math.max(46,(q?Math.hypot(q[0]-ap[0],q[1]-ap[1]):30)+28);DH=[ap[0]-r,ap[1]-r,2*r,2*r,r]}}
 window.tgHi=t&&t.o||null;
 ARROW.classList.toggle('place',!!(t&&t.place)&&!edge&&!(t&&t.o));ARROW.classList.toggle('edge',!!edge);
 if(edge){ARROW.hidden=false;handTo(edge[0],edge[1],'edge','',true);turn(`rotate(${(edge[2]*180/Math.PI-90).toFixed(1)}deg)`);
  ARROW.dataset.go=t.place.join(',');const sp=ARROW.querySelector('span'),nm=t.k&&B[t.k]?B[t.k].n:'';const txt=`${nm?`The ${nm_(nm)} is this way.`:'It is this way.'} Swipe the map, or tap the hand.`;if(sp.textContent!==txt)sp.textContent=txt;
  /* the hint sits on the screen's side of the arrow */
  const ux=-Math.cos(edge[2]),uy=-Math.sin(edge[2]);sp.style.left=(ux*70-80)+'px';sp.style.top=(uy*70-18)+'px'}
 /* a button or a sign: its side is chosen below, once the card is placed, and only then is the hand set (never twice in one look).
    A place on the map: the hand on it, kept there by follow as the map moves */
 else if(ap){ARROW.hidden=false;delete ARROW.dataset.go;if(t&&t.el&&!t.place)hel=t.el;else{const k='p'+t.place[0]+','+t.place[1];handTo(ap[0],ap[1],k,'');turn('');
   FOL={pl:t.place,k,f:(t.o&&B[t.o.t]&&B[t.o.t].foot)||(t.k&&B[t.k]&&B[t.k].foot)||1,dim:true}}}else ARROW.hidden=true;
 place(tx,ty,t&&t.el);if(hel){const r=rectOf(hel);if(r.width){const d=handAt(hel,r,up);if(!CARD.contains(hel))FOL=signOf(hel,d)}}}
/* the time button is drawn again with every change of the stores: its ring and gold come from a class on the page instead, so they stay */
/* a chip at the top (a good, Stores, the money, the desk) is drawn again whenever a number changes, so its ring is a rule on the page
   naming it (TGST), not a class that would be lost at each redraw */
let TGST=null;
function topSel(el){if(!el||!el.matches)return null;if(el.matches('#stores [data-g]'))return`#stores [data-g="${el.dataset.g}"]`;if(el.matches('#stObj [data-o]'))return`#stObj [data-o="${el.dataset.o}"]`;if(el.matches('#stToday'))return'#stToday';if(el.matches('#stOut'))return'#stOut';for(const q of['#stores [data-st]','#res [data-money]','#res [data-desk]'])if(el.matches(q))return q;return null}
function ring(el){const sp=!!(el&&el.matches&&el.matches('#res [data-sp]')),sg=!!(el&&el.matches&&el.matches('#stlGo')),ts=topSel(el);document.body.classList.toggle('tgSpd',sp);document.body.classList.toggle('tgStl',sg);
 if(!TGST){TGST=document.createElement('style');document.head.appendChild(TGST)}const css=ts==='#stToday'?`${ts}{box-shadow:0 0 0 3px #e2b84a,0 0 18px 6px rgba(255,214,110,.6)!important}`:ts?`${ts}{outline:none!important;background:var(--brass)!important;color:var(--panel)!important;border-radius:9px;box-shadow:inset 0 0 0 2px #e2b84a,inset 0 0 0 4px #fff1c2!important}${ts} small,${ts} b,${ts} span{color:inherit!important}`:'';if(TGST.textContent!==css)TGST.textContent=css;
 if(sp||sg||ts)el=null;if(RING===el)return;if(RING)RING.classList.remove('tgRing');RING=el;if(el)el.classList.add('tgRing')}
/* upright: the card at the top when the target is in the lower half or a panel fills the bottom, else at the bottom; sideways: at the side away from it */
function place(tx,ty,el){const side=innerWidth>innerHeight*1.15,c=CARD;c.classList.toggle('side',side);let off='';
 if(side){{const t=$q('#toast');if(t)t.style.top=''}const left=tx!=null&&tx>innerWidth/2;c.classList.toggle('left',left);c.classList.toggle('right',!left);c.classList.remove('top','bot')}
 else{const low=['#mode','#conf','#info','#trade','#scn','#ov'].some(q=>{const e=$q(q);return e&&!e.hidden&&(e.offsetParent||q==='#ov')})||$q('#bar').classList.contains('open'),h=c.offsetHeight;let top=low||ty==null||ty>innerHeight*.45;
  /* nothing open below: the card goes to the side that leaves more room between it and the thing to tap, so the hand can come to it
     freely, and stays there unless the other side is clearly better */
  if(!low&&ty!=null&&h){const st=$q('#stage').getBoundingClientRect(),ra=ty-(st.top+8+h),rb=st.bottom-8-h-ty;top=c.classList.contains('bot')?ra>rb+70:ra>=rb-70;
   /* the thing to tap is at the top (a chip, the time button and its menu, the ✕ of a good's card): the card sits close under it, with
      room between them for the hand that points up, and below the good's card or the menu when one is open (--tgT, read by #tg.top) */
   if(el&&el.closest&&el.closest('#top,#lack,#spdMenu')){let y=el.getBoundingClientRect().bottom+90;for(const q of['#lack','#spdMenu']){const e=$q(q);if(e&&!e.hidden){const b=e.getBoundingClientRect();if(b.height)y=Math.max(y,b.bottom+8)}}
    y=Math.max(y,st.top+8);if(y+h<=st.bottom-8){top=true;off=Math.round(y-st.top)+'px'}}}
  /* nothing to point at for a moment (a step just done): the step's card stays where it is and does not jump up and down again; only
     from below a menu that has closed it comes back up under the top */
  if(!low&&ty==null&&h&&c.dataset.by==='city'&&c.classList.contains('top')){const o=c.style.getPropertyValue('--tgT');if(o)off=Math.min(parseInt(o),90)+'px'}
  if(c.style.getPropertyValue('--tgT')!==off){if(off)c.style.setProperty('--tgT',off);else c.style.removeProperty('--tgT')}
  /* a note that would sit under the card shows just below it */
  {const t=$q('#toast');if(t)t.style.top=top&&!c.hidden?(c.offsetTop+c.offsetHeight+6)+'px':''}c.classList.toggle('top',top);c.classList.toggle('bot',!top);c.classList.remove('left','right')}}

/* ---------- start, end, skip and the practice city ---------- */
function tgStart(force){if(!S||!L.y1857)return;if(!force&&(S.tgDone||S.t>yT(1866,6)))return;STEPS=null;S.tg={i:0};S.tgDone=0;TAPD=-1;base();LASTSIG='';loop()}
window.tgStart=tgStart;
/* the busiest street: where most people live within a short walk, and a market near (people come and go there). The walk after the
   tutorial starts there, and the walking guide takes the walker there if he starts somewhere empty, so there is someone to meet */
function busyAt(x,y,H_){let s=0;for(const h of H_){const d=Math.abs(h.x+1-x)+Math.abs(h.y+1-y);if(d<12)s+=h.t==='market'?150:(h.pop||0)}return s}
function busySpot(){const H_=S.list.filter(o=>!o.r&&(o.t==='house'&&o.pop>0||o.t==='market'&&!o.bld));if(!H_.length)return null;
 const rd=S.list.filter(o=>o.t==='road'&&!o.r),step=Math.max(1,Math.ceil(rd.length/400));let best=null,bs=-1;
 for(let k=0;k<rd.length;k+=step){const r=rd[k],s=busyAt(r.x,r.y,H_);if(s>bs){bs=s;best=r}}return best?{x:best.x,y:best.y,s:bs,H:H_}:null}
function walkBusy(){const b=busySpot()||S.list.find(o=>o.t==='stephan')||S.list.find(o=>o.t==='hofburg');if(b)walkOn(b.y*W+b.x)}
function end(skip,stay){if(!S)return;S.calm=300;const was=TGPRACTICE&&!stay;{const t=$q('#toast');if(t)t.style.top=''}S.tgDone=1;S.tg=null;ring(null);if(CARD)CARD.hidden=true;if(ARROW)ARROW.hidden=true;document.body.classList.remove('tg');
 S.ui=Object.assign(S.ui||{},{res:1,trade:1,hall:1,walk:1});BARSIG='';
 if(skip){for(const[g,v]of Object.entries({wood:40,bricks:60,stone:20,food:40,grain:20,beer:20}))S.stock[g]=(S.stock[g]||0)+v;toast('Tutorial skipped. Every building is open')}
 updateUI();save();if(was)backHome()}
async function backHome(){TGPRACTICE=false;const id=S.level,sv=await storedSave(id);if(sv&&restore(sv)){$q('#ov').hidden=true;toast('🏛️ Back in your city')}else showStart(id)}
window.tgPractice=function(){if(!S||!L.y1857)return;const id=S.level;save(true);TGPRACTICE=true;NEWMODE='hist';newGame(id);closeOv();S.tutSeen=1;setTimeout(()=>{if($q('#ov').hidden===false)closeOv();tgStart(true)},900)};
{const b=$q('#tgAgain');if(b)b.onclick=()=>{if(typeof sheet==='function')sheet(null);window.tgPractice()}}
/* a city loaded with its tutorial under way picks it up again */
setInterval(loop,100);

/* ---------- the walking guide: the first time the player walks (in either city, with or without the city tutorial), Crenneville or
   Greeley shows the stick, running, looking round, the walk map, the people who greet you and the way back. One line and one small
   goal a step; shown once, its step kept in localStorage ('gc-walkguide': the step, or 'done'), replayable from More ---------- */
/* the walking guide's progress belongs to the city (S.wg, kept in its save), so every new city shows it again */
let WG=null,WGSIG='';
const wgRead=()=>S&&S.wg!=null?S.wg:null,wgWrite=v=>{if(!S)return;if(v==null)delete S.wg;else S.wg=v};
const wgOn=()=>!!WG;
/* a scene, a case or a job of the street comes first: the talk step (the fifth) waits until it is over, and shows nothing meanwhile */
const wgRest=()=>!!WG&&WG.i===4&&onFoot()&&(guideBusy()||!!(S&&(S.job||S.sc&&!S.sc.end)))&&(!WG.b||!WG.b.ph||WG.b.ph==='walk');
/* the street keeps quiet while the walking guide runs (street.js hush), and nothing new comes to him (letGo) */
window.wgHush=()=>!!WG&&onFoot()&&!wgRest();
const WK_=()=>window.__G3&&window.__G3.walker;
function wgSteps(){const t=coarse,ny=NYC();return[
 {line:t?'Walk with the circle at the bottom left. Push it a little to stroll.':'Walk with W A S D or the arrow keys. Or click the street.',goal:'Walk 20 m',el:t?'#wkStick':null,p:b=>[Math.min(20,Math.floor(b.d)),20]},
 {line:t?'Push it all the way to run.':'Hold Shift to run.',goal:'Run for 3 seconds',el:t?'#wkStick':null,p:b=>[Math.min(3,Math.floor(b.run)),3]},
 {line:t?'Drag on the street with one finger to look round.':'Drag with the mouse to look round.',goal:'Turn the view',look:1,p:()=>[HAND.drag?1:0,1]},
 {line:t?'The round map at the top right shows where you are. Tap it for a big map.':'The round map at the top right shows where you are. Click it for a big map.',lineOn:t?'The red arrow in the ring is you. Tap Close under the map.':'The red arrow in the ring is you. Click Close under the map.',goal:'Open and close the big map',el:'#wkMap',elOn:'#wkBig b',p:b=>[(b.mo?1:0)+(b.mc?1:0),2]},
 /* a person: the hand shows one to walk up to; close by, they say what their street needs; he answers them; and where they asked for
    a building, the way to it: back to the city, the plot put down, ✓ Build (talkTick) */
 {line:'',goal:'Talk to a person',talk:1,p:b=>[b.talked?1:0,1]},
 {line:t?'Tap ⬅ Back at the top left to go back to the city.':'Click ⬅ Back at the top left to go back to the city.',goal:'Back to the city',el:'#wkExit',p:b=>[b.left?1:0,1]}]}
/* a guide step with a second place to tap once something is open (the big map open: the Close sign under it) */
const wgElOn=s=>!!(s&&s.elOn&&$q('#wkBig')&&!$q('#wkBig').hidden);
/* the talk step: walk (to the person the hand shows), hear (their line), reply (his answer), act (what they asked for, if a building
   that can be built), build (back in the city, the plot and ✓ Build), done */
function talkCard(txt,btn,on,no){const A=NYC()?'greeley':'cren',[nm,role]=WHO[A],sig=WG.i+'|'+txt+'|'+btn;els();
 if(sig!==WGSIG||CARD.hidden||CARD.dataset.by!=='walk'){WGSIG=sig;CARD.hidden=false;CARD.dataset.by='walk';LASTSIG='';
  CARD.innerHTML=`<img class="tgFace" src="${face(A)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${txt}</p><div class="tgGoal"><span>🎯 Talk to a person <b>0/1</b></span></div>${btn?`<div class="tgB">${btn}</div>`:''}</div>`;
  const r=$q('#wgRe');if(r&&on)r.onclick=e=>{e.stopPropagation();on()};const x=$q('#wgNo');if(x&&no)x.onclick=e=>{e.stopPropagation();no()}}place(null,null)}
/* the person of the talk step. A place in the crowd goes to another person once its owner is out of sight (people.js), so the one
   shown is known by their seed; they are grown up and in no hurry, within 90 m, and the straight way to them is open */
const TWALK=/^(road|stadtpark|garden|rail|tram|tramline|reichsbruecke)$/;let TSX=0,TSY=0;
function tOk(c){return!!c&&c.on&&c.x!==undefined&&(c.seed||0)<.92&&!c.run}
function tSame(b){const c=b.tp;return!!c&&c.on&&c.x!==undefined&&c.seed===b.ts}
/* where they are on the screen, up m over their feet (a head is about 1.7 m up), the lie of the ground counted in */
function tScr(c,up){const g=window.__G3,p=window.wkScr(c.x,(g&&g.TH?g.TH(c.x,c.z):0)+(c.y||.21)+up,c.z);if(p){p[0]+=TSX;p[1]+=TSY}return p}
/* in the free part of the screen: clear of the edges, of the circle at the bottom and of the card (r), with room for the hand */
function tWin(p,r){return!!p&&p[0]>24&&p[0]<innerWidth-24&&p[1]>120&&p[1]<innerHeight-150&&!(r&&p[0]>r.left-40&&p[0]<r.right+40&&p[1]>r.top-20&&p[1]<r.bottom+64)}
/* nothing built and no water on the straight way to them */
function tClear(w,c){const g=window.__G3,e0=g.E(0),e1=g.E(1)-e0,dx=c.x-w.x,dz=c.z-w.z,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/3));
 for(let k=1;k<n;k++){const x=Math.round((w.x+dx*k/n-e0)/e1),y=Math.round((w.z+dz*k/n-e0)/e1);if(x<0||y<0||x>=W||y>=H)return false;const i=y*W+x,o=S.b[i];if(o?!TWALK.test(o.t):S.tiles[i]===WATER)return false}return true}
function tDrop(b){if(tSame(b))b.tp.stop=Math.min(b.tp.stop||0,1);b.tp=null;b.show=0;b.auto=0}
function tDone(b){tDrop(b);b.talked=1;b.ph='done';return false}
/* the angle from the way he looks to them (more than 0: on his left), and the view turned to them a little each tick */
function tAng(w,c){const a=Math.atan2(c.x-w.x,c.z-w.z)-w.yaw;return Math.atan2(Math.sin(a),Math.cos(a))}
function tTurn(w,c){const a=tAng(w,c),aa=Math.abs(a);if(aa>.03)w.yaw+=Math.sign(a)*Math.min(.16,aa);w.pitch+=(-.1-w.pitch)*.3}
function talkTick(b,foot){const now=performance.now(),w=WK_(),M=NYC()?'Mr. Mayor':'Majesty';if(!b.ph)b.ph='walk';
 if(b.ph==='build'){if(cnt(b.act)>b.n0||!mode&&$q('#conf').hidden&&now-b.t>4000){b.talked=1;b.ph='done';WG.i=wgSteps().length-1;wgEnd(false);return true}
  talkCard(`Tap ✓ Build to build the ${nm_(B[b.act].n)}.`,'');return true}
 if(!foot||!w){if(b.tp&&b.ph==='walk')tDrop(b);return false}
 {const st=$q('#stage').getBoundingClientRect();TSX=st.left;TSY=st.top}
 if(b.ph==='walk'){if(w.tr)return true;b.tw=(b.tw||0)+1;
  const C=window.wkCrowd?window.wkCrowd():[],skip=b.tw>300?'<button class="tgSkip" id="wgNo">Skip this step</button>':'',sk=()=>{tDone(b)};
  /* two and a half minutes and nobody met: the step is let go, so no one is ever held here */
  if(b.tw>1500)return tDone(b);
  /* on a horse, in a cab or a boat, or in the water, nobody can be met */
  if(w.ride||w.wet){tDrop(b);talkCard('Go on foot first. Then walk up to a person.',skip,null,sk);return true}
  const cr=CARD&&!CARD.hidden?CARD.getBoundingClientRect():null;
  /* the one shown is kept while they are still the same person, near, and the way to them is open */
  if(b.tp&&(!tSame(b)||!tOk(b.tp)||Math.hypot(b.tp.x-w.x,b.tp.z-w.z)>90||b.tw%5===0&&!tClear(w,b.tp)))tDrop(b);
  /* once the step is two seconds old, a grown-up beside him greets him: the one shown first; else the nearest in front of him, or the
     nearest at all once he has stood still for three seconds, so nobody who passes behind his back cuts in; of two who walk together,
     the one who leads */
  b.st=!(w.spd>.05)&&!w.go?(b.st||0)+1:0;
  if(b.tw>20){let n=null,nd=2.6;if(b.tp&&Math.hypot(b.tp.x-w.x,b.tp.z-w.z)<3)n=b.tp;else for(const c of C){if(!tOk(c))continue;const d=Math.hypot(c.x-w.x,c.z-w.z);if(d<nd&&(b.st>30||Math.abs(tAng(w,c))<1.2)){nd=d;n=c}}
   if(n&&n.lead&&tOk(n.lead))n=n.lead;
   if(n){if(n!==b.tp)tDrop(b);b.tp=n;b.ts=n.seed;b.show=0;window.wkHold(n,30,true);const r=window.wkGreet(n,'feuerwehr');b.act=r&&r.a;b.blk=r&&r.b;b.ph='hear';b.t=now;talkCard('Listen to what they need.','');return true}}
  /* the nearest person he can walk straight to, one on the screen first; another is taken only when clearly nearer, and none while
     the view turns to the one picked */
  if(!b.tp||b.tw%5===0&&!b.auto){let best=null,bs=1e9,cs=1e9;
   for(const c of C){if(!tOk(c)||c.lead||c.role)continue;const d=Math.hypot(c.x-w.x,c.z-w.z);if(d>90)continue;const sc=d+(tWin(tScr(c,1.7),cr)?0:30);if(c===b.tp)cs=sc;if(sc<bs&&tClear(w,c)){bs=sc;best=c}}
   if(best&&best!==b.tp&&(!b.tp||bs<cs-Math.max(8,cs*.4))){tDrop(b);b.tp=best;b.ts=best.seed;b.fresh=1;b.idle=0}}
  if(!b.tp){b.none=(b.none||0)+1;let any=false;for(const c of C)if(c&&c.on){any=true;break}b.empty=any?0:(b.empty||0)+1;
   /* nobody in the streets at all, or nobody he could walk to for a minute and a half: the step is let go */
   if(b.empty>50||b.none>900)return tDone(b);
   talkCard('Walk along the street until you see people.',skip,null,sk);return true}
  b.none=0;b.empty=0;
  /* they stop where they are, turned to him, and wait; in view, the hand is over them (wgHand) */
  const T=b.tp,a=tAng(w,T),aa=Math.abs(a),up='Walk up to this person. The hand shows who.';window.wkHold(T,3,!!T.lead);
  if(tWin(tScr(T,1.7),cr)){b.show=1;b.fresh=0;b.idle=0;b.auto=0;talkCard(up,skip,null,sk);return true}
  b.show=0;
  /* out of view: while he stands and no finger is on the street the view turns to them by itself, at once for a person just picked,
     else after four seconds; until then the card says which way to turn */
  b.idle=!PTR.size&&!(w.spd>.05)&&!w.go?(b.idle||0)+1:0;
  if(b.idle>(b.fresh?2:40)){b.auto=1;tTurn(w,T);if(aa<.05&&tScr(T,1.7))b.show=1;talkCard(up,skip,null,sk);return true}
  b.auto=0;const dr=coarse?'Drag on the street':'Drag with the mouse';
  talkCard(aa>2.3?`A person is behind you. ${dr} to turn round.`:aa<.15?'A person is ahead of you. Walk on.':`A person is on your ${a>0?'left':'right'}. ${dr} to turn.`,skip,null,sk);return true}
 /* the person stays, turned to him, and their line stays up while it is read, and until it is answered */
 if(b.ph==='hear'||b.ph==='reply'){if(b.tp&&!tSame(b))b.tp=null;if(b.tp)window.wkHold(b.tp,30,true);
  /* the one who speaks is brought into view while he stands, so their words can be read: also one behind his back, whom the camera
     behind him still shows at the foot of the screen; a turn once begun is carried to its end */
  if(b.tp&&!PTR.size&&!(w.spd>.05)&&!w.go&&!w.ride){const p=tScr(b.tp,1.7),aa=Math.abs(tAng(w,b.tp));if(b.ph==='hear'&&(!p||p[0]<40||p[0]>innerWidth-40||aa>1.6))b.tn=1;
   if(b.tn){tTurn(w,b.tp);if(aa<.1)b.tn=0}}else b.tn=0}
 if(b.ph==='hear'){if(now-b.t>5000)b.ph='reply';talkCard('Listen to what they need.','');return true}
 /* his answer: yes (then the building, if it can be built now) or no; either way the step is done */
 if(b.ph==='reply'){const d=b.act&&B[b.act],n=d&&anA(nm_(d.n)),yes=d?`You shall have ${n}.`:'Thank you. I will remember it.',nay='Not now. The city has other needs first.',end=t=>{window.wkSay(t);sfx('click');b.t=performance.now();if(b.tp)b.tp.stop=8};
  talkCard(d?`They ask for ${n}. Say yes or no, ${M}.`:`Answer them, ${M}.`,`<button class="pri" id="wgRe">“${yes}”</button>${d?'<button id="wgNo">“Not now.”</button>':''}`,()=>{end(yes);
   const lk=b.act&&typeof lockOf==='function'?lockOf(b.act):'';if(b.act&&!lk)b.ph='act';else{b.ph='done';b.talked=1}},()=>{end(nay);b.ph='done';b.talked=1});return true}
 if(b.ph==='act'){const d=B[b.act],n=anA(nm_(d.n));talkCard(`They need ${n}. Tap the button: you go back to the city and place it there.`,`<button class="pri" id="wgRe">${d.i} Build ${n}</button>`,()=>{
   b.n0=cnt(b.act);b.t=performance.now();b.ph='build';if(window.wkBuild(b.act,b.blk))setTimeout(()=>{try{findSpot(b.blk?{x:b.blk.tx,y:b.blk.ty}:undefined)}catch(e){}},500)});return true}
 return false}
function wgBase(){WG.b={d:0,run:0,mo:0,mc:0,hi:0,left:0,t0:performance.now()};HAND.drag=0;const w=WK_();WG.px=w?w.x:null;WG.pz=w?w.z:null}
function wgStart(i){WG={i:i||0};finOff();
 /* on a fresh start the walker goes to the busiest street if where he stands is empty (the Ring, a field): there are people to meet */
 if(!WG.i){const w=WK_(),b=busySpot();const g=window.__G3;if(w&&b&&g&&g.E&&typeof walkAt==='function'){const e0=g.E(0),e1=g.E(1)-e0,here=busyAt((w.x-e0)/e1,(w.z-e0)/e1,b.H);if(here<b.s*.4)walkAt([b.x,b.y])}}
 wgBase();wgWrite(String(WG.i));WGSIG=''}
function wgEnd(skip){WG=null;LASTSIG='';wgWrite('done');ring(null);if(CARD&&!tgOn())CARD.hidden=true;if(!skip)FINC=1}
/* the advisor's last word after the walking guide: the city is the player's now */
let FINC=0;function finOff(){FINC=0;if(CARD&&CARD.dataset.by==='fin'){CARD.hidden=true;delete CARD.dataset.by}}
function finShow(){els();if(ARROW)ARROW.hidden=true;const A=NYC()?'greeley':'cren',[nm,role]=WHO[A];if(CARD.dataset.by==='fin'&&!CARD.hidden)return;CARD.dataset.by='fin';CARD.classList.remove('tgOut','tgPop');
 CARD.innerHTML=`<img class="tgFace" src="${face(A)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>Now that you know how it works, ${NYC()?'Mr. Mayor':'Majesty'}, the city is yours to build.</p><div class="tgB"><button class="pri" id="tgFin">To work</button></div></div>`;
 CARD.hidden=false;void CARD.offsetWidth;CARD.classList.add('tgPop');place(null,null);$q('#tgFin').onclick=()=>{FINC=0;CARD.hidden=true;delete CARD.dataset.by}}
function wgTick(){const foot=onFoot();
 if(!WG){if(foot&&wgRead()!=='done'){const v=+wgRead();wgStart(v>0&&v<6?v:0)}else return}
 const st=wgSteps(),s=st[WG.i];if(!s){wgEnd(false);return}const b=WG.b,w=WK_();
 /* the counts: metres walked, seconds run, the big map opened and closed, a greeting heard, the walk left */
 if(w&&WG.px!=null){const d=Math.hypot(w.x-WG.px,w.z-WG.pz);if(d<5)b.d+=d;if(w.run&&d>.01)b.run+=.1}if(w){WG.px=w.x;WG.pz=w.z}
 const big=$q('#wkBig');if(big&&!big.hidden)b.mo=1;else if(b.mo)b.mc=1;
 /* the big map open: the card goes right to the top, clear of the map and of the hand on it */
 if(CARD)CARD.classList.toggle('wgBig',!!(s.elOn&&big&&!big.hidden));
 const say=$q('#say');if(say&&!say.hidden)b.hi=1;
 if(s.talk&&wgRest()){tDrop(b);if(CARD&&!CARD.hidden&&CARD.dataset.by==='walk'){CARD.hidden=true;LASTSIG='';WGSIG=''}ring(null);return}
 if(s.talk&&talkTick(b,foot))return;
 /* off foot mid-guide: the guide waits for the next walk; the city tutorial, if it runs, keeps its card and ring (cleared once, not every tick) */
 if(!foot){if(WG.i===5){LASTSIG='';b.left=1}else{if(!tgOn()){if(CARD&&!CARD.hidden){LASTSIG='';CARD.hidden=true;ring(null)}}return}}
 const pr=s.p(b),done=pr[0]>=pr[1];
 if(done){sfx('chime');WG.i++;if(WG.i>=st.length){wgEnd(false);return}wgBase();wgWrite(String(WG.i));return}
 if(!foot)return;els();const A=NYC()?'greeley':'cren',[nm,role]=WHO[A],on=wgElOn(s),sig=[WG.i,pr[0],on].join('|');
 if(sig!==WGSIG||CARD.hidden||CARD.dataset.by!=='walk'){WGSIG=sig;CARD.hidden=false;CARD.dataset.by='walk';LASTSIG='';
  CARD.innerHTML=`<img class="tgFace" src="${face(A)}" alt=""><div class="tgBody"><small>${nm} · ${role}</small><p>${fnl(on&&s.lineOn?s.lineOn:s.line)}</p><div class="tgGoal"><span>🎯 ${s.goal} <b>${pr[0]}/${pr[1]}</b></span></div><div class="tgB">${WG.i===0?'<button class="tgSkip" id="wgSkip">Skip the walking guide</button>':''}</div></div>`;
  const k=$q('#wgSkip');if(k)k.onclick=()=>wgEnd(true)}
 const el=$q(on?s.elOn:s.el||'#none'),vis=el&&el.offsetParent?el:null;ring(on?null:vis);
 /* the card keeps clear of the stick and the map: at the top, or below the round map when that is the target */
 const r=vis&&vis.getBoundingClientRect();place(r?r.left+r.width/2:null,!on&&r&&r.top<innerHeight*.4?r.top+r.height/2:innerHeight)}
setInterval(wgTick,100);
window.wgReplay=()=>{WG=null;wgWrite(null);finOff();if(onFoot())wgStart(0);else toast(NYC()?'🚶 The walking guide starts on your next walk, Mr. Mayor':'🚶 The walking guide starts on your next walk, Majesty')};
{const b=$q('#wgAgain');if(b)b.onclick=()=>{if(typeof sheet==='function')sheet(null);window.wgReplay()}}
})();
