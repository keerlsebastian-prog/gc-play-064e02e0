const $=s=>document.querySelector(s);
const W=256,H=352,DYN=H-W,TW=64,TH=32;
const WATER=0,SAND=1,GRASS=2,FOREST=3,MOUNT=4,BRIDGE=5;
const GOODS=['food','grain','beer','wine','wool','cloth','wood','bricks','stone','iron','coal','cars'];
/* a building's picture for the build menu and its card: the same one as everywhere else (the drawn ones are private characters, below) */
const bIco=k=>B[k]?B[k].i:'';
const ICON={coal:'⚫',cars:'🚗',wine:'🍷',grain:'🌾',flour:'\uE000',bread:'🍞',meat:'🥩',coffee:'☕',furniture:'🪑',porcelain:'🍽️',beer:'🍺',stone:'🪨',iron:'⚙️',gold:'🪙',food:'🥕',wood:'🪵',tools:'🔨',bricks:'🧱',wool:'🧶',cloth:'👕',ore:'⛏️',tobacco:'🍂',cigars:'🚬',spices:'🌶️'};
/* flour has no picture among the emoji: in every text it is one private character (ICON.flour), and wherever that character reaches
   the page, as markup or as plain text (notes, the signs on the map), it is wrapped in <i class="gfl">, which draws a flour sack
   (index.html). The ship mill's water wheel (gwh), the brewery's barrel (gbr), the brickworks' kiln (gkn), the coal yard's heap of coal (gco), the stone wharf's block and hammer (gst),
   the grain farm's sheaf (gsh), the car factory's wheel (gcw), the tobacconist's pipe (gpi) and the farm's barn (gbn) are drawn the same way, each a private character of its own.
   A works never wears the picture of its good: the good's picture means the good, on a sign or in a chain. The character stays in the text, so code that compares a text with what it wrote last still matches */
(function(){if(typeof MutationObserver==='undefined')return;const F=/[\uE000-\uE009]/,CL={'\uE001':'gfl gwh','\uE002':'gfl gbr','\uE003':'gfl gkn','\uE004':'gfl gco','\uE005':'gfl gst','\uE006':'gfl gsh','\uE007':'gfl gcw','\uE008':'gfl gpi','\uE009':'gfl gbn'};
 const wrap=t=>{for(;;){const p=t.parentNode,i=t.nodeValue.search(F);if(!p||i<0||p.tagName==='I'&&p.className.slice(0,3)==='gfl')return;const r=i?t.splitText(i):t,rest=r.nodeValue.length>1?r.splitText(1):null,el=document.createElement('i');
  el.className=CL[r.nodeValue]||'gfl';p.replaceChild(el,r);el.appendChild(r);if(!rest)return;t=rest}};
 const scan=n=>{if(n.nodeType===3){if(F.test(n.nodeValue))wrap(n)}else if(n.nodeType===1&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'&&F.test(n.textContent)){
  const w=document.createTreeWalker(n,4),a=[];while(w.nextNode())if(F.test(w.currentNode.nodeValue))a.push(w.currentNode);a.forEach(wrap)}};
 new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')scan(m.target);else for(let k=0;k<m.addedNodes.length;k++)scan(m.addedNodes[k])}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true})})();
/* the coin character 🪙 draws as a grey disc on many phones: wherever a card or panel is built as markup, it becomes the drawn gold coin
   (cz); plain text (notes, the marks on the map) keeps the character */
const cz=h=>typeof h==='string'&&h.includes('🪙')?h.replace(/🪙 ?/g,()=>coinSvg().replace('class="coin"','class="coin ci"')+'\u2009'):h;
/* the treasury's coin in the top bar, drawn: a gold coin with the money's sign (fl., K or $), so it reads as money on every phone */
const coinSvg=()=>{const c=NYC()?'$':CUR()==='Kr.'?'K':'fl';return`<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><defs><radialGradient id="cnG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff3b8"/><stop offset=".45" stop-color="#e9bf45"/><stop offset="1" stop-color="#a87418"/></radialGradient></defs><circle cx="12" cy="12" r="10.6" fill="url(#cnG)" stroke="#6b4a10" stroke-width="1.4"/><circle cx="12" cy="12" r="7.8" fill="none" stroke="#b8862a" stroke-width="1"/><text x="12" y="12.8" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-weight="700" font-size="${c==='fl'?9:10.5}" fill="#6b4a10">${c}</text></svg>`};
const PRICE={coal:[12,7],cars:[180,100],wine:[24,14],grain:[8,5],flour:[12,7],bread:[16,9],meat:[18,10],coffee:[26,15],furniture:[40,24],porcelain:[60,36],beer:[18,10],stone:[18,10],iron:[30,18],food:[10,6],wood:[8,5],tools:[30,18],bricks:[20,12],wool:[12,7],cloth:[28,17],ore:[16,9],tobacco:[14,8],cigars:[40,24],spices:[45,28]};
const LV=[null,{n:'Labourers',max:6,tax:.015,need:'food'},{n:'Craftsmen',max:8,tax:.02,need:'beer'},{n:'Clerks',max:8,tax:.028,need:'cloth'},{n:'merchants',max:11,tax:.04,need:'wine'},{n:'Grand merchants',max:14,tax:.055,need:'wine'},{n:'Nobility',max:20,tax:.07,need:'wine'}];const LVB=LV.map(l=>l&&l.max);
const Ps=(p,a)=>{let s=0;for(let l=a;l<p.length;l++)s+=p[l]||0;return s};

const B={
 road:{n:'Road',i:'🛤️',cost:{gold:5},up:0,on:'land',d:'Links buildings to your warehouse or market. Drag your finger to lay a whole road.'},
 house:{n:'House',i:'🏠',foot:4,ds:4,cost:{wood:3},up:0,on:'land',d:'Home for pioneers. Needs a road to a warehouse or market.'},
 woodcutter:{n:'Woodcutter',i:'🪓',foot:4,ds:4,cost:{gold:50,wood:4},up:.1,on:'land',out:'wood',time:5,d:'Cuts wood from forest within 2 tiles.'},
 fisher:{n:'Fisher',i:'🎣',foot:4,ds:4,cost:{gold:80,wood:5,tools:2},up:.15,on:'coast',out:'food',time:4,d:'Catches fish. Must stand on the shore.'},
 sheep:{n:'Sheep farm',i:'🐑',foot:4,ds:4,cost:{gold:100,wood:4,tools:1},up:.15,on:'grass',out:'wool',time:6,d:'Needs open grass within 2 tiles.'},
 weaver:{n:'Weaver',i:'🧵',foot:4,ds:4,cost:{gold:150,wood:6,tools:3},up:.2,on:'land',in:'wool',out:'cloth',time:6,d:'Turns wool into cloth.'},
 market:{n:'Market',i:'⚖️',foot:4,ds:4,cost:{gold:200,wood:10,tools:4},up:.3,on:'land',radius:32,hub:1,d:'Pioneers nearby can become settlers. Extends your land and storage, and roads can end here.'},
 brick:{n:'Brickworks',i:'\uE003',foot:4,ds:4,cost:{gold:150,wood:6,tools:2},up:.2,on:'coast',out:'bricks',time:7,d:'Digs clay on a shore or in a clay pit, and fires bricks.'},
 mine:{n:'Ore mine',i:'⛰️',foot:4,ds:4,cost:{gold:200,wood:8,tools:4},up:.25,on:'mount',out:'ore',time:8,d:'Digs ore. Build on a mountain.'},
 smith:{n:'Toolsmith',i:'⚒️',foot:4,ds:4,cost:{gold:200,wood:8,tools:2},up:.25,on:'land',in:'ore',out:'tools',time:8,d:'Turns ore into tools.'},
 chapel:{n:'Chapel',i:'⛪',foot:4,ds:4,cost:{gold:300,wood:10,tools:4,bricks:6},up:.3,on:'land',radius:32,d:'Settlers nearby can become citizens.'},
 tobacco:{n:'Tobacco field',i:'🌿',foot:4,ds:4,cost:{gold:120,wood:4,tools:1},up:.15,on:'grass',out:'tobacco',time:7,crop:'tobacco',d:'Grows tobacco, but only on islands where it thrives.'},
 tobacconist:{n:'Tobacconist',i:'\uE008',foot:4,ds:4,cost:{gold:200,wood:6,tools:3,bricks:4},up:.25,on:'land',in:'tobacco',out:'cigars',time:7,d:'Rolls tobacco into cigars for citizens.'},
 spice:{n:'Spice farm',i:'🌶️',foot:4,ds:4,cost:{gold:150,wood:5,tools:2},up:.2,on:'grass',out:'spices',time:8,crop:'spices',d:'Grows spices for merchants. They never grow on your home island.'},
 tower:{n:'Cannon tower',i:'🏰',foot:4,ds:4,cost:{gold:250,wood:6,tools:4,bricks:6},up:.3,on:'land',range:6,d:'Fires at pirate ships within 6 tiles.'},
 shipyard:{n:'Shipyard',i:'⛵',foot:4,ds:4,cost:{gold:300,wood:12,tools:4},up:.25,on:'coast',d:'Builds trade ships. Ships settle new islands and bring their goods home.'},
 monument:{n:'Monument',i:'🏛️',cost:{gold:3000,wood:30,tools:20,bricks:40},up:0,on:'land',radius:10,d:''},
 karls:{n:'Karlskirche',i:'⛪',cost:{gold:1500,wood:20,tools:10,bricks:20},up:0,on:'land',foot:6,ds:3,lm:1,tour:20,radius:40,chap:1,d:'Baroque church with its great green dome and two columns. Settlers nearby can become citizens.'},
 oper:{n:'Staatsoper',i:'🎭',cost:{gold:2000,tools:15,bricks:30,cloth:10},up:0,on:'land',foot:5,ds:2.5,lm:1,tour:40,d:'The State Opera. Its visitors spend gold in your city.'},
 hofburg:{n:'Hofburg',i:'👑',cost:{gold:3000,tools:20,bricks:40},up:0,on:'land',foot:10,ds:5,lm:1,tour:60,radius:40,mkt:1,d:'The imperial palace of the Habsburgs. The Emperor lives and rules here.'},
 rad:{n:'Ferris Wheel',i:'🎡',cost:{gold:2500,wood:20,tools:30},up:0,on:'land',foot:6,ds:3,lm:1,tour:50,d:'A giant wheel like George Ferris\'s at the Chicago fair of 1893, and the wheels that went up at Coney Island after it.'},
 schoen:{n:'Hudson River estate',i:'🏰',cost:{gold:5000,tools:30,bricks:60,cloth:20},up:0,on:'land',foot:12,ds:6,lm:1,tour:100,d:'A country house and its gardens up the Hudson, like the Vanderbilts\' and Jay Gould\'s Lyndhurst.'},
 castleg:{n:'Castle Garden',i:'🧳',cost:{},up:0,on:'land',foot:4,ds:4,hist:1,d:'The old fort at the Battery, since 1855 the landing depot for immigrants. New arrivals come ashore here and walk to their first homes.'},
 stephan:{n:'Trinity Church',i:'⛪',cost:{},up:0,on:'land',foot:6,ds:6,lm:1,hist:1,radius:40,chap:1,d:'St. Stephen\'s Cathedral, the heart of New York since the Middle Ages.'},
 belved:{n:'Belvedere',i:'🏛️',cost:{},up:0,on:'land',foot:10,ds:5,lm:1,hist:1,tour:40,d:'Prince Eugene\'s baroque palaces and gardens.'},
 rathaus:{n:'Municipal Building',i:'🏛️',cost:{},up:0,on:'land',foot:6,ds:3,lm:1,hist:1,hub:1,d:'The city\'s offices outgrew City Hall: McKim, Mead & White\'s Municipal Building rose over Chambers Street in 1914. Goods can be delivered here.'},
 parlament:{n:'Tweed Courthouse',i:'🏛️',cost:{},up:0,on:'land',foot:6,ds:3,lm:1,hist:1,d:'The New York County Courthouse on Chambers Street, begun in 1861 and the Tweed Ring\'s richest plunder.'},
 votiv:{n:'Votivkirche',i:'⛪',cost:{},up:0,on:'land',foot:5,ds:2.5,lm:1,hist:1,radius:32,chap:1,d:'Neo-gothic church (1879). Settlers nearby can become citizens.'},
 secession:{n:'Secession',i:'🌼',cost:{gold:2500,bricks:20,tools:10},up:0,on:'land',foot:3,ds:1.5,lm:1,tour:40,d:'The exhibition hall of the New York Secession, crowned by its golden dome of leaves.'},
 pavillon:{n:'Stadtbahn pavilion',i:'🚉',cost:{gold:1200,tools:8,bricks:10},up:0,on:'land',foot:2,ds:1,lm:1,tour:20,d:'Otto Wagner\'s Jugendstil station at Karlsplatz.'},
 postspar:{n:'Postsparkasse',i:'🏦',cost:{gold:4000,tools:20,bricks:40},up:0,on:'land',foot:5,ds:2.5,lm:1,tour:60,d:'Otto Wagner\'s Postal Savings Bank, with its aluminium details.'},
 steinhof:{n:'Kirche am Steinhof',i:'⛪',cost:{gold:3500,tools:15,bricks:30},up:0,on:'land',foot:5,ds:2.5,lm:1,tour:50,radius:32,chap:1,d:'Otto Wagner\'s church with its golden dome.'},
 looshaus:{n:'Looshaus',i:'🏢',cost:{gold:3000,tools:15,bricks:30,cloth:10},up:0,on:'land',foot:3,ds:1.5,lm:1,tour:40,d:'Adolf Loos\'s "house without eyebrows" on Michaelerplatz, a scandal in 1911.'},
 palais:{n:'Fifth Avenue lot',i:'🏛️',foot:4,ds:4,cost:{},up:0,on:'land',d:'Sell a plot facing Fifth Avenue. A noble family pays you well and builds a grand palais, which needs bricks, stone and timber.'},
 sawmill:{n:'Timber wharf',i:'🪚',foot:4,ds:4,cost:{gold:120},up:.12,on:'coast',out:'wood',time:5,d:'Timber rafts float down the rivers from the Alps. Build on a riverbank.'},
 stonewh:{n:'Stone wharf',i:'\uE005',foot:4,ds:4,cost:{gold:180,wood:6},up:.15,on:'coast',out:'stone',time:8,d:'Barges bring stone from the Leitha quarries. Build on the rivers or the canal.'},
 ironyard:{n:'Iron merchant',i:'🔩',foot:4,ds:4,cost:{gold:250,wood:6,bricks:6},up:.2,on:'land',out:'iron',time:9,d:'Buys iron from the Styrian ironworks and sells it to your builders.'},
 garden:{n:'Vegetable garden',i:'🌱',foot:4,ds:4,cost:{gold:60},up:.06,on:'grass',out:'food',time:4,d:'Grows vegetables for the city. Needs open land around it.'},
 grainf:{n:'Grain farm',i:'\uE006',foot:4,ds:4,cost:{gold:80},up:.08,on:'grass',out:'grain',time:6,d:'Grows barley for the breweries. Needs open land around it.'},
 brewery:{n:'Brewery',i:'\uE002',foot:4,ds:4,cost:{gold:200,wood:4,bricks:6},up:.2,on:'land',in:'grain',out:'beer',time:6,d:'Brews beer from barley. Craftsmen and merchants want it.'},
 /* Vienna's bread (only Vienna builds them): the mill grinds the grain farms' wheat and rye, the bakery bakes the flour. Before the
    Danube regulation the mill is a ship mill moored at a bank (on: coast), after it a steam mill anywhere on land (millOn) */
 mill:{n:'Mill',i:'\uE001',foot:4,ds:4,cost:{gold:180,wood:6},up:.15,on:'coast',in:'grain',out:'flour',time:6,d:'Grinds wheat and rye from the grain farms into flour for the bakeries.'},
 bakery:{n:'Bakery',i:'🥨',foot:4,ds:4,cost:{gold:180,wood:4,bricks:4},up:.15,on:'land',in:'flour',out:'bread',time:5,d:'Bakes rye bread, Semmeln and Kipferl from the mills\' flour. Craftsmen and above want bread.'},
 /* Vienna's goods of a better home (only Vienna builds them): meat for the craftsmen, coffee for the clerks, furniture for the
    Bürger and porcelain for the grand Bürger (GX) */
 fleischer:{n:'Butcher',i:'🥩',foot:4,ds:4,cost:{gold:220,wood:4,bricks:6},up:.15,on:'land',out:'meat',time:6,d:'Oxen from Hungary come to the cattle market at St. Marx. The butcher sells beef, pork and sausages. Craftsmen and above want meat.'},
 roester:{n:'Coffee roaster',i:'☕',foot:4,ds:4,cost:{gold:320,wood:4,bricks:8},up:.2,on:'land',out:'coffee',time:7,d:'Coffee beans come by train from the port of Trieste and are roasted here. Julius Meinl opened his coffee shop in Vienna in 1862. Clerks and above want coffee.'},
 tischler:{n:'Joiner',i:'🪑',foot:4,ds:4,cost:{gold:380,wood:8,bricks:8},up:.2,on:'land',in:'wood',out:'furniture',time:8,d:'Makes chairs, tables and cupboards from timber, like the bentwood chairs of the Thonet brothers. Bürger and above want furniture.'},
 porzellan:{n:'Porcelain workshop',i:'🍽️',foot:4,ds:4,cost:{gold:600,bricks:14,stone:6},up:.25,on:'land',in:'coal',out:'porcelain',time:10,d:'Paints white porcelain from Bohemia and fires it in coal kilns, as the house of Josef Böck does. Needs coal. Grand Bürger want porcelain.'},
 bastion:{n:'City wall',i:'🧱',foot:2,ds:2,cost:{},up:0,on:'land',hist:1,d:'The old fortifications. Tear them down with 🧹 Demolish: each section gives stone.'},
 stadtpark:{n:'Stadtpark',i:'🌳',cost:{gold:400},proj:{wood:20,stone:10},up:0,on:'land',foot:8,ds:4,lm:1,tour:15,d:'Vienna\'s first public park on the old Glacis, opened in 1862.'},
 musikverein:{n:'Musikverein',i:'🎻',cost:{gold:800},proj:{bricks:120,stone:60,wood:30},up:0,on:'land',foot:4,ds:2,lm:1,tour:30,d:'The concert hall of the Society of Friends of Music, opened in 1870.'},
 rotunde:{n:'Exhibition Hall',i:'🎪',cost:{gold:1500},proj:{iron:120,wood:80,bricks:60},up:0,on:'land',foot:8,ds:4,lm:1,tour:80,d:'A great domed hall for fairs and shows, like the Crystal Palace that stood on Reservoir Square until it burned in 1858.'},
 brunnen:{n:'Hochstrahlbrunnen',i:'⛲',cost:{gold:600},proj:{stone:60,iron:20},up:0,on:'land',foot:3,ds:1.5,lm:1,tour:10,d:'The fountain for New York\'s new mountain-spring water main of 1873. Protects your city from cholera.'},
 vineyard:{n:'Wine merchant',i:'🍇',foot:4,ds:4,cost:{gold:300,wood:6,bricks:6},up:.25,on:'coast',out:'wine',time:8,d:'Imports French and Rhine wine from the ocean ships, and Hudson Valley wine by river barge. Build on the waterfront.'},
 heuriger:{n:'Heuriger',i:'🍷',foot:4,ds:4,cost:{gold:250,wood:6,bricks:4},up:.15,on:'land',tour:14,svc:1,d:'A wine tavern among the vines. Viennese and visitors come to drink the new wine and spend money, as long as you have wine in stock.'},
 kursalon:{n:'Kursalon',i:'🎶',cost:{gold:500},proj:{bricks:80,stone:40,wood:20},up:0,on:'land',foot:4,ds:2,lm:1,tour:30,d:'An Italian Renaissance spa hall in the Stadtpark, where waltzes play on the terrace.'},
 sperl:{n:'Café Sperl',i:'☕',cost:{gold:450},proj:{bricks:60,wood:30,stone:15},up:0,on:'land',foot:4,ds:2,lm:1,corner:1,tour:20,radius:20,d:'The coffeehouse of Vienna\'s artists on the Gumpendorfer Straße, open since 1880. Homes near it have their coffeehouse.'},
 kuenstler:{n:'Künstlerhaus',i:'🎨',cost:{gold:600},proj:{bricks:100,stone:60,wood:20},up:0,on:'land',foot:4,ds:2,lm:1,tour:30,d:'The exhibition house of New York\'s artists\' society, by Karlsplatz.'},
 epstein:{n:'Palais Epstein',i:'🏛️',cost:{gold:700},proj:{bricks:120,stone:60,wood:20,iron:10},up:0,on:'land',foot:4,ds:2,lm:1,tour:20,d:'Theophil Hansen\'s palace for the banker Gustav von Epstein, on the Ring.'},
 ephrussi:{n:'Banker\'s mansion',i:'🏛️',cost:{gold:700},proj:{bricks:120,stone:60,wood:20,iron:10},up:0,on:'land',foot:4,ds:2,lm:1,tour:20,d:'A brownstone palace on Fifth Avenue for one of the city\'s bankers, like those the Astors and the Vanderbilts built.'},
 imperial:{n:'Hotel Imperial',i:'🏨',cost:{gold:900},proj:{bricks:150,stone:80,wood:30,iron:20},up:0,on:'land',foot:4,ds:2,lm:1,tour:50,d:'Palais Württemberg on the Kärntner Ring, turned into a grand hotel for the World\'s Fair.'},
 coalyard:{n:'Coal yard',i:'\uE004',foot:4,ds:4,cost:{gold:220,wood:6,bricks:6},up:.18,on:'land',out:'coal',time:6,d:'Brings in coal from Bohemia and Silesia for your power stations.'},
 kraftwerk:{n:'Power station',i:'⚡',foot:4,ds:4,cost:{gold:1500,bricks:40,iron:20},up:.5,radius:42,svc:1,burns:'coal',d:'Needs coal: build a coal yard first. Burns coal to make electricity. Homes in its area get electric light, and workshops there produce 20% more.'},
 tram:{n:'Tram depot',i:'🚋',foot:4,ds:4,cost:{gold:500,wood:10,iron:6},up:.25,radius:30,svc:1,d:'Horse trams, and electric trams once electricity arrives, carry people around. Residents in its area are happier.'},
 autofabrik:{n:'Car factory',i:'\uE007',foot:4,ds:4,cost:{gold:2500,bricks:40,iron:30},up:.6,on:'land',in:'iron',out:'cars',time:14,d:'Builds motor cars, like Lohner and Gräf & Stift in New York. Cars sell for a fortune and fill your streets.'},
 kaffeehaus:{n:'Coffeehouse',i:'☕',foot:4,ds:4,cost:{gold:300,wood:4,bricks:6},up:.15,radius:16,svc:1,d:'merchants and nobility want a coffeehouse near their homes.'},
 feuerwehr:{n:'Fire station',i:'🚒',foot:4,ds:4,cost:{gold:350,bricks:8,wood:4},up:.2,radius:24,svc:1,d:'Puts out fires in its area before they destroy buildings.'},
 spital:{n:'Hospital',i:'🏥',foot:4,ds:4,cost:{gold:600,bricks:20,stone:6},up:.3,radius:28,svc:1,d:'Protects nearby residents from epidemics. Research makes it better.'},
 gaswerk:{n:'Gasworks',i:'🔥',foot:4,ds:4,cost:{gold:900,bricks:30,iron:10},up:.4,radius:44,svc:1,d:'Gas light for the streets and homes around it. The nobility want it once the gas mantle is invented.'},
 harbour:{n:'harbour harbour',i:'⚓',foot:4,ds:4,cost:{gold:500,wood:10,bricks:10},up:.2,on:'coast',svc:1,d:'A steamboat steamer pier. Its steamer trades your goods along the rivers. Tap it to choose a route.'},
 museen:{n:'Kunsthistorisches and Naturhistorisches Museum',i:'🖼️',cost:{gold:2000},proj:{bricks:500,stone:350,wood:60,iron:50},up:0,on:'land',foot:8,ds:4,lm:1,tour:70,d:'Semper and Hasenauer\'s twin museums of art and of natural history, facing each other across the Maria-Theresien-Platz with the Empress\'s monument between them.'},
 universitaet:{n:'University',i:'🎓',cost:{gold:1200},proj:{bricks:300,stone:150,wood:60,iron:20},up:0,on:'land',foot:4,ds:2,lm:1,tour:20,d:'The new main building of the University on the Ring. With it, research is faster.'},
 rossauer:{n:'Rossauer Kaserne',i:'🎖️',cost:{gold:900},proj:{bricks:220,stone:60,wood:40},up:0,on:'land',foot:4,ds:2,lm:1,tour:5,d:'A huge red-brick barracks by the canal. Once built, the army orders supplies from you and pays well.'},
 quarry:{n:'Quarry',i:'⛏️',foot:4,ds:4,cost:{gold:200,wood:6},up:.15,on:'mount',out:'stone',time:6,d:'Cuts Manhattan schist from the rocky hills of the upper island. Build on rocky hillside.'},
 rail:{n:'Railway track',i:'🚂',cost:{gold:12,iron:1},foot:1,tool:1,d:'Tap a start, then an end. Tracks need free land; they can cross roads and use bridges. Join a station to the map edge for a main line, or link two stations.'},
 tramline:{n:'Tram line',i:'🚋',cost:{gold:5},foot:1,tool:1,d:'Lay tram tracks along your streets. The cars run on the lines that pass a depot, so build one beside the line: horsecars first, electric streetcars once electricity arrives.'},
  elight:{n:'Electric light',i:'💡',cost:{gold:6},foot:1,tool:1,d:'Replace the gas lamps of a district with electric arc lamps, as Broadway was lit in 1880. Tap a street: every street within six blocks of it is lit. Needs electric power.'},
 bahnhof:{n:'Railway station',i:'🚉',foot:4,ds:4,cost:{gold:1500,bricks:40,iron:20,stone:10},up:.4,radius:32,svc:1,d:'Build it right beside a railway track. A track to the edge of the map makes it a main line station with travellers and cheaper materials. Tracks between stations bring commuters.'},
 schule:{n:'School',i:'🏫',foot:4,ds:4,cost:{gold:400,bricks:14,wood:6},up:.2,radius:24,svc:1,d:'A Volksschule: since 1869 every child goes to school for eight years. Craftsmen with a school nearby can become clerks.'},
 polizei:{n:'Police station',i:'👮',foot:4,ds:4,cost:{gold:450,bricks:12,stone:4},up:.25,radius:26,svc:1,d:'Keeps the streets safe and catches robbers. Upgrade it to a detective bureau.'},
 bank:{n:'Bank',i:'🏦',foot:4,ds:4,cost:{gold:1500,bricks:30,stone:20},up:.3,radius:24,sav:.15,svc:1,d:'Earns interest on the savings of the homes within its reach: the more people live there and the richer they are, the more. Robbers love banks: keep one near a police station.'},
 farm:{n:'Farm',i:'\uE009',foot:4,ds:4,cost:{gold:120,wood:6},up:.08,on:'grass',out:'food',time:5,d:'Chickens, cows and a barn: eggs, milk and meat for the city. Needs open land around it.'},
 muell:{n:'Waste collection',i:'🧹',foot:4,ds:4,cost:{gold:400,wood:8,bricks:6},up:.2,radius:34,svc:1,d:'Carts take away the rubbish. From 1870 homes from craftsmen up want clean streets.'},
 eislauf:{n:'Ice rink',i:'⛸️',foot:4,ds:4,cost:{gold:500,wood:20},up:.15,radius:30,svc:1,d:'The New York Skating Club opened its rink in 1867. Residents nearby are happier, especially in winter.'},
 reitschule:{n:'Riding school',i:'🐎',foot:4,ds:4,cost:{gold:1200,bricks:30,stone:20},up:.25,radius:30,svc:1,d:'A riding hall for the elegant world. Grand merchants and nobility nearby are happier.'},
 kaserne:{n:'Barracks',i:'🪖',foot:4,ds:4,cost:{gold:800,bricks:25,stone:10},up:.3,svc:1,d:'Each barracks makes the army stronger, which matters when diplomacy fails.'},
 tiergarten:{n:'Tiergarten Schönbrunn',i:'🦒',cost:{gold:700},proj:{wood:60,stone:30,iron:10},up:0,on:'land',foot:4,ds:2,lm:1,tour:45,d:'The imperial menagerie, the oldest zoo in the world, gets new enclosures and animals.'},
 burgtheater:{n:'Burgtheater',i:'🎭',cost:{gold:1500},proj:{bricks:260,stone:150,wood:50,iron:20},up:0,on:'land',foot:4,ds:2,lm:1,tour:60,d:'The new court theatre on the Ring, by Semper and Hasenauer.'},
 regulierung:{n:'harbour regulation',i:'🏗️',cost:{gold:2000},proj:{stone:300,wood:80,iron:30},up:0,on:'land',foot:4,ds:4,lm:1,tour:0,d:'A new straight bed for the rivers. Once finished, the river no longer floods the city.'},
 reichsbruecke:{n:'Kronprinz-Rudolf-Brücke',i:'🌉',cost:{gold:1500},proj:{iron:200,stone:120,wood:40},up:0,on:'coast',foot:4,ds:4,lm:1,tour:15,d:'An iron bridge across the new harbour, today\'s Reichsbrücke. Build it on the riverbank: when finished it spans the river.'},
 tower:{n:'Office tower',i:'🏙️',foot:4,ds:4,cost:{gold:2000,iron:40,stone:30,bricks:20},up:.3,tour:90,svc:1,d:'A steel-frame office building with elevators.'},
 parkrow:{n:'Park Row Building',i:'🏢',cost:{gold:2000},proj:{iron:180,stone:120,bricks:120},up:0,on:'land',foot:4,ds:4,lm:1,tour:50,d:'The tallest office building in the world in 1899, with its twin cupolas.'},
 singer:{n:'Singer Building',i:'🏢',cost:{gold:2500},proj:{iron:220,stone:100,bricks:150},up:0,on:'land',foot:4,ds:4,lm:1,tour:60,d:'The sewing-machine company\'s slender tower with its bulbous dome.'},
 metlife:{n:'Metropolitan Life Tower',i:'🕰️',cost:{gold:3000},proj:{iron:250,stone:180,bricks:100},up:0,on:'land',foot:4,ds:4,lm:1,tour:70,d:'A marble campanile with a giant clock on Madison Square.'},
 woolworth:{n:'Woolworth Building',i:'🏰',cost:{gold:4000},proj:{iron:320,stone:220,bricks:160},up:0,on:'land',foot:4,ds:4,lm:1,tour:90,d:'The Cathedral of Commerce: a Gothic skyscraper, the tallest in the world in 1913.'},
 liberty:{n:'Statue of Liberty',i:'🗽',cost:{gold:1500},proj:{stone:250,iron:120,wood:30},up:0,on:'land',foot:4,ds:4,lm:1,tour:70,d:'Liberty Enlightening the World, a gift from France. Built on Bedloe\'s Island: materials arrive by boat.'},
 flatiron:{n:'Flatiron Building',i:'🏢',cost:{gold:2500},proj:{iron:200,stone:120,bricks:100},up:0,on:'land',foot:4,ds:4,lm:1,tour:60,d:'A 22-storey steel-frame wedge at Madison Square.'},
 bridge:{n:'Bridge',i:'🌉',cost:{},up:0,on:'land',d:'Tap a riverbank or the water: a stone bridge is built straight across to the other bank. Each span costs 60 $, 3 stone and 2 timber.'},
 kontor:{n:'Warehouse',i:'⚓',foot:4,ds:4,cost:{gold:800,wood:12,tools:6},up:.3,on:'coast',radius:36,hub:1,d:'Claims land on a free shore. On a new island, your ship delivers it.'},
};
const ORDER=['road','house','woodcutter','fisher','sheep','weaver','market','brick','mine','smith','chapel','tobacco','tobacconist','spice','tower','shipyard','kontor'];
/* in the new start a church needs its road too: its people walk to it by the streets (the historic city keeps its old rule) */
const needsRoad=o=>o.t==='house'||!!B[o.t].out||!!B[o.t].proj||!!B[o.t].svc||!!(S&&S.scratch&&(o.t==='chapel'||B[o.t].chap));
/* the Statue of Liberty stands on Bedloe's Island, where no street can reach: its materials come by boat, so it is never asked for a road */
const roadAsk=o=>needsRoad(o)&&o.t!=='liberty';
/* a building left off the streets: one that needs a road and has none joined, or a market (a store, which works without a road) with no
   road along its sides. Either is offered its ready road once built, so the market joins the town's streets */
const lonely=o=>!o.r&&!o.h&&o.t!=='liberty'&&(needsRoad(o)?!o.c:o.t==='market'&&!perim(o).some(([x,y])=>inb(x,y)&&(S.tiles[y*W+x]===BRIDGE||!!S.b[y*W+x]&&S.b[y*W+x].t==='road'&&!S.b[y*W+x].r)));

/* ---------- utils ---------- */
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hs(i){let x=Math.imul(i^0x9e3779b9,0x85ebca6b);x^=x>>>13;x=Math.imul(x,0xc2b2ae35);x^=x>>>16;return(x>>>0)/4294967296}
const shC={};
function shade(hex,f){const k=hex+f;if(shC[k])return shC[k];const n=parseInt(hex.slice(1),16);const c=v=>Math.max(0,Math.min(255,v*f|0));return shC[k]=`rgb(${c(n>>16&255)},${c(n>>8&255)},${c(n&255)})`}
/* the grid is square, as wide as the map; tall: it runs on down the whole map, the rows below the square filled from a hash so the
   ones above keep their values (Vienna; New York's map was made with the square one and keeps it) */
function noise(r,cell,tall){const gw=Math.ceil(W/cell)+2,g=[];for(let i=0;i<gw*gw;i++)g.push(r());const sm=t=>t*t*(3-2*t);
 if(tall){const k=Math.floor(g[0]*1e6),gh=Math.ceil(H/cell)+2;for(let i=gw*gw;i<gw*gh;i++)g.push(hs(i*7919+k))}
 return(x,y)=>{const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=sm(fx-ix),ty=sm(fy-iy),v=(i,j)=>g[(iy+j)*gw+ix+i];
 return(v(0,0)*(1-tx)+v(1,0)*tx)*(1-ty)+(v(0,1)*(1-tx)+v(1,1)*tx)*ty}}
const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const fmt=n=>Math.floor(n).toLocaleString('en-US');
const D4=[[1,0],[-1,0],[0,1],[0,-1]];
const cap1=s=>s[0].toUpperCase()+s.slice(1);



/* ---------- landmarks ---------- */
const lmEntry=k=>(L.landmarks||[]).find(e=>e.k===k);
function lmNeedOK(e){const p=popTotals(),n=e.need;if(L.y1857&&UNLOCKALL)return true;if(L.y1857)return(!n.year||S.t>=yT(n.year))&&(!n.prest||(S.prest||0)>=n.prest)&&(!n.houses||S.list.filter(o=>o.t==='house'&&!o.h&&!o.bld).length>=n.houses)&&(!n.palais||S.list.filter(o=>o.t==='house'&&!o.h&&!o.bld&&o.lvl===6).length>=n.palais)&&(!n.built||S.list.some(o=>o.t===n.built&&!o.bld));if(n.year)return S.t>=yT(n.year);if(n.pop)return Ps(p,1)>=n.pop;if(n.cit)return Ps(p,4)>=n.cit;if(n.mer)return p[4]>=n.mer;return true}
const lmNeedTxt=e=>{const n=e.need;if(L.y1857){const a=[];if(n.year&&S.t<yT(n.year))a.push(`from ${n.year}`);if(n.prest&&(S.prest||0)<n.prest)a.push(`👑 ${n.prest}`);if(n.houses)a.push(`${n.houses} homes`);if(n.palais)a.push(`${n.palais} palais`);if(n.built)a.push(`a ${B[n.built].n}`);return a.join(', ')}return n.year?`from ${n.year}`:n.pop?`${n.pop} people`:n.cit?`${n.cit} citizens`:`${n.mer} merchants`};
/* a landmark's real site, brought in to the map's edge when it lies beyond it (Schönbrunn's Tiergarten) */
function lmReal(k){const e=lmEntry(k);if(!e)return null;const g=gtV(e.lat,e.lon);return[Math.max(5,Math.min(W-9,g[0])),Math.max(5,Math.min(H-9,g[1]))]}
function footTiles(t,x,y){const f=B[t].foot||1,r=[];for(let dy=0;dy<f;dy++)for(let dx=0;dx<f;dx++)r.push([x+dx,y+dy]);return r}

/* ---------- levels ---------- */
const G2=W-2,TU=Math.SQRT2/G2,KS=W/44;
const geo=(x,y)=>[(x-(y-DYN))/G2,(x+(y-DYN)-(W-1))/G2];
const gt=(E,S)=>[Math.round((G2*S+W-1+G2*E)/2),Math.round((G2*S+W-1-G2*E)/2)+DYN];
function pdist(E,S,pts){let m=1e9;for(let k=0;k<pts.length-1;k++){const[a,b]=pts[k],[c,d]=pts[k+1],dx=c-a,dy=d-b,l=dx*dx+dy*dy;let t=l?((E-a)*dx+(S-b)*dy)/l:0;t=Math.max(0,Math.min(1,t));m=Math.min(m,Math.hypot(E-a-t*dx,S-b-t*dy))}return m}
function yAt(pts,E){for(let k=0;k<pts.length-1;k++){const[a,b]=pts[k],[c,d]=pts[k+1];if((E-a)*(E-c)<=0&&a!==c)return b+(d-b)*(E-a)/(c-a)}return E<pts[0][0]?pts[0][1]:pts[pts.length-1][1]}
const near=(E,S,a,b,r)=>Math.hypot(E-a,S-b)<r;
const yAt0=p=>p[0];
function prj(D,lat,lon){const E=(lon-D.lon0)*Math.cos(D.lat0*Math.PI/180)*111.32/D.km,S_=(D.lat0-lat)*110.57/D.km;if(!D.rot)return[E,S_];const c=Math.cos(D.rot),n=Math.sin(D.rot);return[E*c-S_*n,E*n+S_*c]}
function inPoly(E,S,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[cc,d]=p[j];if((b>S)!==(d>S)&&E<(cc-a)*(S-b)/(d-b)+a)c=!c}return c}
const bump=(E,S,P,r,h)=>{const d=Math.hypot(E-P[0],S-P[1])/r;return d<1?h*(1-d*d)*(1-d*d):0};
function riverD(c,list){let m=9;for(const[pts,w]of list){const d=pdist(c.E,c.S,pts)-w*TU;if(d<m)m=d}return m}
const FIELD=1,VINE=2,REED=3,ROCK=4,FLOW=5,ORCH=6,AQUA=7,MARSH=8,CLAY=9;
let ELEV=new Float32Array(W*H),DECO=new Uint8Array(W*H);
/* QUAY: how far a tile's centre lies from the stone bank of a narrow river (Vienna's Donaukanal and Wien), in tiles; the 3D bank follows
   the river's own line, so a building nearer than about half a tile would hang over the water. null in a city without them */
let QUAY=null;
function mk_(D){const l=a=>{const r=[];for(let k=0;k<a.length;k+=2)r.push(prj(D,a[k],a[k+1]));return r};return[l,(a,b)=>prj(D,a,b)]}
const LEVELS={
 isles:{name:'Random islands',goal:500,sea:true,style:'isles',bg:'#1d5577',rival:{n:'Van Dijk Company'},mon:{n:'Lighthouse',i:'🗼',k:'lighthouse'},tag:'New map every time, pirates',
  blurb:'The original: a fresh set of islands every game. Spices grow only away from your home island.',
  spiceHint:'Merchants want spices. Place a warehouse on another island and your ship will found it',stock:{}}
};
const ORDERLV=['nyc1865'];
let L=LEVELS.isles,seaM=new Uint8Array(W*H),fert=new Uint8Array(W*H);
function bridge(t,E,S,pts){let[x0,y0]=gt(E,S),bi=-1,bd=99;
 for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=x0+dx,y=y0+dy;if(inb(x,y)&&t[y*W+x]===WATER&&Math.hypot(dx,dy)<bd){bd=Math.hypot(dx,dy);bi=y*W+x}}
 if(bi<0)return;[E,S]=geo(bi%W,bi/W|0);
 let best=0,bdd=1e9;for(let k=0;k<pts.length-1;k++){const m=pdist(E,S,[pts[k],pts[k+1]]);if(m<bdd){bdd=m;best=k}}
 let dE=-(pts[best+1][1]-pts[best][1]),dS=pts[best+1][0]-pts[best][0];const l=Math.hypot(dE,dS)||1;dE/=l;dS/=l;const m=new Map();
 for(const sg of[1,-1])for(let k=0;k<120;k++){const[x,y]=gt(E+sg*dE*k*TU*.25,S+sg*dS*k*TU*.25);if(!inb(x,y))break;const i=y*W+x;if(t[i]!==WATER&&t[i]!==BRIDGE)break;if(!m.has(i))m.set(i,k*sg)}
 const a=[...m.entries()].sort((p,q)=>p[1]-q[1]).map(p=>p[0]);
 a.forEach((i,k)=>{t[i]=BRIDGE;if(k){const p=a[k-1],px=p%W,py=p/W|0,qx=i%W,qy=i/W|0;if(px!==qx&&py!==qy){const m1=py*W+qx,m2=qy*W+px;if(t[m1]===WATER)t[m1]=BRIDGE;else if(t[m2]===WATER)t[m2]=BRIDGE}}});
 for(const e of[a[0],a[a.length-1]]){if(e==null)continue;const x=e%W,y=e/W|0;const land=n=>t[n]!==WATER&&t[n]!==BRIDGE;
  if(D4.some(([dx,dy])=>inb(x+dx,y+dy)&&land((y+dy)*W+x+dx)))continue;
  for(const[dx,dy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){if(inb(x+dx,y+dy)&&land((y+dy)*W+x+dx)){const o=y*W+x+dx;if(t[o]===WATER){t[o]=BRIDGE;break}}}}}
function buildWorld(id,seed){
 if(id==='isles'){const t=generate(seed),el=generate.el,e=new Float32Array(W*H),dc=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++){e[i]=Math.max(0,el[i])*.6;if(t[i]===GRASS){const r=hs(i*31+7);dc[i]=r<.06?FLOW:r<.09?ROCK:0}}
  return{t,sea:t.map(v=>v===WATER?1:0),fert:null,elev:e,deco:dc}}
 const D=LEVELS[id];if(!D._i){D.init(D);D._i=1}
 const ks=D.nscale||KS,r=rng(seed),tl=!!D.tallNoise,n1=noise(r,4*ks,tl),n2=noise(r,3*ks,tl),n3=noise(r,8*ks,tl);
 const t=new Uint8Array(W*H),sea=new Uint8Array(W*H),fe=new Uint8Array(W*H),el=new Float32Array(W*H),dc=new Uint8Array(W*H),zn=new Uint8Array(W*H);
 const nw=(D.W||[]).filter(r=>r[1]<2),qd=nw.length?new Float32Array(W*H):null;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,[E,S]=geo(x,y),c={E,S,x,y,n:n1(x,y),n2:n2(x,y),n3:n3(x,y),dw:9};
  if(qd)qd[i]=riverD(c,nw)/TU;c.h=D.elev(c,D);t[i]=D.terrain(c,D);el[i]=c.h;if(t[i]===WATER&&D.isSea&&D.isSea(c))sea[i]=1;fe[i]=D.fert(c,D);c.t=t[i];dc[i]=D.deco(c,t[i],D);if(D.zoneOf)zn[i]=D.zoneOf(c,D)}
 for(const b of(D.bridges||[]).concat(D.nb||[])){const[E,S]=b[0]>10?prj(D,b[0],b[1]):[b[0],b[1]];bridge(t,E,S,D.R[b[2]])}
 const out=t.slice();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(t[i]!==GRASS)continue;
  for(const[dx,dy]of D4){const n=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&t[n]===WATER&&(sea[n]||hs(i)<.5)){out[i]=SAND;if(dc[i]!==REED)dc[i]=0;break}}}
 const[sx,sy]=gt(...prj(D,...D.start));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=(sy+dy)*W+sx+dx;if(inb(sx+dx,sy+dy)&&(out[i]===FOREST||out[i]===MOUNT))out[i]=GRASS}
 return{t:out,sea,fert:fe,elev:el,deco:dc,zone:zn,quay:qd}}
function nearestLand(x0,y0,needCoast){let best=null,bd=1e9;
 for(let y=Math.max(0,y0-12);y<=Math.min(H-1,y0+12);y++)for(let x=Math.max(0,x0-12);x<=Math.min(W-1,x0+12);x++){const i=y*W+x,t=S.tiles[i];
  if((t!==SAND&&t!==GRASS)||S.b[i]||claim[i])continue;if(needCoast&&!coast(x,y))continue;const d=Math.hypot(x-x0,y-y0);if(d<bd){bd=d;best={x,y}}}return best}
let B0=null;
/* the city tables (research, the rival's milestones, laws, trade routes, endings, the Mayor's districts) and building changes a city makes:
   New York's own are kept and put back whenever a city is set up, so a visit to Vienna leaves New York as it was */
const BSAVE=new Map();let NY0=null;
function bset(o,ch){let m=BSAVE.get(o);if(!m)BSAVE.set(o,m={});for(const k in ch)if(!(k in m))m[k]=o[k];Object.assign(o,ch)}
function cityData(){if(!NY0)NY0={GOODS:GOODS.slice(),TECH:TECH.slice(),BPM:BPM.slice(),LAWS:LAWS.slice(),HOODS:HOODS.slice(),ENDS:Object.assign({},ENDS),ROUTES:Object.assign({},ROUTES),HOMEIT:HOMEIT.map(q=>q.slice())};
 for(const[o,m]of BSAVE)for(const k in m){if(m[k]===undefined)delete o[k];else o[k]=m[k]}BSAVE.clear();
 const put=(a,b)=>a.splice(0,a.length,...b),obj=(a,b)=>{for(const k in a)delete a[k];Object.assign(a,b)};
 put(GOODS,NY0.GOODS);if(S&&S.stock&&!(L.eco&&L.eco.bread)){delete S.stock.flour;delete S.stock.bread}put(TECH,NY0.TECH);put(BPM,NY0.BPM);put(LAWS,NY0.LAWS);put(HOODS,NY0.HOODS);put(HOMEIT,NY0.HOMEIT.map(q=>q.slice()));obj(ENDS,NY0.ENDS);obj(ROUTES,NY0.ROUTES);
 const c=L.cityData;if(!c)return;if(c.TECH)put(TECH,c.TECH);if(c.BPM)put(BPM,c.BPM);if(c.LAWS)put(LAWS,c.LAWS);if(c.HOODS)put(HOODS,c.HOODS);if(c.ENDS)obj(ENDS,c.ENDS);if(c.ROUTES)obj(ROUTES,c.ROUTES);if(c.homeit)for(const q of HOMEIT){const r=c.homeit[q[0]+'.'+q[1]];if(r)q[2]=r}}
function setupLevel(){cityData();if(!B0)B0=Object.fromEntries(Object.keys(B).map(k=>[k,[B[k].n,B[k].d]]));for(const k in B0){B[k].n=B0[k][0];B[k].d=B0[k][1]}
 B.monument.n=L.mon.n;B.monument.i=L.mon.i;B.monument.d=`${L.name}'s great landmark. Build it once your town is thriving to complete the level.`;
 B.kontor.d=L.sea?'Claims land on a free shore. On a new island, your ship delivers it.':'Claims more land anywhere and adds storage.';
 if(L.names)for(const k in L.names)B[k].n=L.names[k];if(L.descs)for(const k in L.descs)B[k].d=L.descs[k];if(typeof NY_NAMES!=='undefined'&&L.name==='New York'){for(const k in NY_NAMES)if(B[k])B[k].n=NY_NAMES[k];for(const k in NY_DESC)if(B[k])B[k].d=NY_DESC[k]}if(L.lvNames)L.lvNames.forEach((n,k)=>{if(k)LV[k].n=n});
 if(L.y1857){Object.assign(B.rad,{hist:0,cost:{gold:2500},proj:{iron:150,wood:40,stone:20},tour:70});Object.assign(B.karls,{hist:0,cost:{gold:800},proj:{bricks:180,stone:120,wood:40},tour:30,d:'Fischer von Erlach\'s baroque church with its green dome and two great columns. Craftsmen nearby can become merchants.'});
  Object.assign(B.votiv,{hist:0,cost:{gold:600},proj:{bricks:200,stone:150,wood:40},tour:20,d:'James Renwick\'s neo-gothic cathedral on Fifth Avenue, begun in 1858 and dedicated in 1879. Craftsmen nearby can become merchants.'});
  Object.assign(B.oper,{cost:{gold:1000},proj:{bricks:300,stone:150,wood:60,iron:40},d:'The Metropolitan Opera House on Broadway at 39th Street, opened in 1883 by the city\'s new money. Its visitors spend money in your city.'});
  Object.assign(B.house,{cost:{}});Object.assign(B.market,{cost:{gold:200,wood:6,bricks:4}});Object.assign(B.chapel,{cost:{gold:300,bricks:10,stone:4}});
  Object.assign(B.brick,{cost:{gold:150,wood:4},on:'clay',time:6});
  Object.assign(B.woodcutter,{n:'Woodcutter',cost:{gold:100},up:.08,on:'land',d:'Fells trees in the woods of upper Manhattan and Westchester for timber. Needs forest around it. You can also clear trees yourself with 🧹 Demolish.'});
  Object.assign(B.sheep,{cost:{gold:90},up:.08,d:'Raises sheep for wool, the raw material of the textile mills. Needs open pasture around it, out in the countryside.'});Object.assign(B.weaver,{n:'Textile mill',cost:{gold:260,wood:6,bricks:8},up:.18,time:7,d:typeof NY_DESC!=='undefined'&&NY_DESC.weaver||'Spins and weaves wool into cloth for the garment trade. Craftsmen and above want clothing.'})}
 if(L.setup){L.setup();if(L.names)for(const k in L.names)B[k].n=L.names[k];if(L.descs)for(const k in L.descs)B[k].d=L.descs[k]}if(L.eco)L.eco.set()
 EVENTS=L.events||NY_EVENTS;QUESTS=L.quests||NY_QALL;AUD=L.aud||NY_AUD;
 /* the page's title, the trader's words, the start button and the maps' labels follow the city */
 {const ny=L.name==='New York';try{document.title=`${L.name} 1865 · Great Cities 3D`}catch(e){}const tp=$('#trade p.m');if(tp)tp.textContent=`Merchants ${ny?'on South Street':'at the Naschmarkt'} buy and sell in lots of 5. Set a good to sell by itself, or full stores (over 80%) sell the rest cheaply.`;
  const sb=$('#startBtn');if(sb)sb.textContent=`${ny?'🗽':'🏰'} Start screen`;for(const[id,s]of[['#c',''],['#g3',' in 3D']]){const c=$(id);if(c)c.setAttribute('aria-label',`Map of ${L.name}${s}`)}}
 buildBar();mini.style.background=L.bg}
/* the build menu's groups, each with its icon and one word, and the buildings in it (the last field says what the group is for) */
const CATS=[['roads','🛤️','Streets',['road','bridge','tramline','tram','rail','bahnhof','elight'],'Every building needs a street to a market. Bridges, trams and railways come later.'],
 ['homes','🏠','Homes',['house','palais'],'Sell building plots: the homes fill with tenants, and their rent tax is your income.'],
 ['food','🌾','Food',['farm','garden','grainf','mill','bakery','fleischer','brewery','vineyard','roester','heuriger'],'Food keeps people in the city; beer and wine let them rise to craftsmen and Bürger.'],
 ['materials','🧱','Materials',['woodcutter','sawmill','brick','quarry','stonewh','ironyard'],'Timber, bricks, stone and iron: every new house and landmark is built from them.'],
 ['goods','🧵','Goods',['sheep','weaver','tischler','porzellan','coalyard','harbour','autofabrik'],'Clothing for the craftsmen, coal for the works, a harbour for trade.'],
 ['public','🚒','Services',['feuerwehr','polizei','schule','spital','muell','kaserne','gaswerk','kraftwerk'],'Fire, police, schools, hospitals and light keep the city safe, healthy and happy.'],
 ['town','🏘️','Town',['market','chapel','kaffeehaus','bank','eislauf','reitschule','tower'],'Markets bring the goods to the homes; churches and coffeehouses lift the people.'],
 ['monuments','⭐','Landmarks',null,'The great buildings of the real city: build them near their real sites.']];
/* the landmarks in small groups, so the row fits a phone; a landmark no group names goes to the last */
const LMG=[['culture','⛪','Culture',['votiv','oper','musikverein','universitaet','museen','secession','sperl','postspar','stephan','karls','rathaus','parlament']],['parks','🌳','Parks',['stadtpark','tiergarten','brunnen','belved','schoen']],['works','🌉','Great works',['reichsbruecke','liberty','rossauer','burgtheater','rad','hofburg']],['towers','🏢','Towers & mansions',['epstein','imperial','parkrow','flatiron','singer','metlife','woolworth']]];
const SHORTN={"St. Patrick's Cathedral":"St. Patrick's",'Metropolitan Opera House':'Met Opera','Seventh Regiment Armory':'7th Regt. Armory','Metropolitan Life Tower':'Met Life Tower','Waldorf-Astoria Hotel':'Waldorf-Astoria','New York Public Library':'Public Library','Grand Central Terminal':'Grand Central'};
let LMSUB='culture';
function lmGroups(){const ks=(L.landmarks||[]).map(e=>e.k),gs=LMG.map(g=>[g[0],g[1],g[2],g[3].filter(k=>ks.includes(k))]),last=gs[gs.length-1];for(const k of ks)if(!gs.some(g=>g[3].includes(k)))last[3].push(k);return gs.filter(g=>g[3].length)}
function catOrd(cat){if(cat[3])return cat[3].filter(k=>!(k==='quarry'&&NYC())&&!(k==='tower'&&!NYC())&&!((k==='mill'||k==='bakery')&&!ECO().bread)&&!(GXK[k]&&(NYC()||!ECO().meat)));const gs=lmGroups();return(gs.find(g=>g[0]===LMSUB)||gs[0]||[0,0,0,[]])[3]}
let CAT='homes',BARSIG='';
function lockOf(k){const d=B[k];if(d.tool)return k==='elight'&&!(S&&RES().electric)?'research':'';if(k==='tower'&&!(S&&RES().kaplan))return'research';if(d.lm){const e=lmEntry(k);if(!e)return'';if(S&&S.list.some(o=>o.t===k))return'built';return S&&!lmNeedOK(e)?lmNeedTxt(e):''}if(k==='gaswerk'&&!(S&&RES().auer))return'research';if(k==='kraftwerk'&&!(S&&RES().electric))return'research';if(k==='autofabrik'&&!(S&&RES().lohner))return'research';return''}
/* a build card's name stays inside its card: a long one is set a little smaller until it fits; a long German word that still does not
   fit is broken with a hyphen where its last part begins (Hochstrahl-brunnen), and anything else wherever it must; measured once the
   bar is on the screen */
const NMPART=/(brunnen|bahnhof|kirche|theater|garten|markt|schule|haus|halle|platz|park|hof|turm|brücke|bruecke|gasse|ring|werk|fabrik)$/i;
function fitNames(){requestAnimationFrame(()=>{for(const bb of document.querySelectorAll('#builds .bb')){const b=bb.querySelector('.bt b');if(!b)continue;b.style.fontSize='';b.style.overflowWrap='';
 const cs=getComputedStyle(bb),max=bb.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);if(max<=0)continue;const over=()=>b.scrollWidth>b.clientWidth+1||b.scrollWidth>max+1;
 let fs=parseFloat(getComputedStyle(b).fontSize);const f0=fs;while(over()&&fs>10.5){fs-=.5;b.style.fontSize=fs+'px'}
 if(over()&&!b.dataset.shy){b.dataset.shy=1;b.style.fontSize=f0+'px';b.innerHTML=b.textContent.split(' ').map(w=>{const m=w.length>9&&w.match(NMPART);return m&&m.index>2?w.slice(0,m.index)+'&shy;'+w.slice(m.index):w}).join(' ');b.style.hyphens='manual'}
 if(over())b.style.overflowWrap='anywhere'}})}
function buildBar(){if(L.order){const cat=CATS.find(c=>c[0]===CAT)||CATS[1],ord=catOrd(cat);
 $('#cats').innerHTML=CATS.map(c=>`<button class="cat${c[0]===CAT?' on':''}" data-c="${c[0]}"><i>${c[1]}</i><span>${c[2]}</span></button>`).join('');
 $('#cats').querySelectorAll('.cat').forEach(b=>b.onclick=()=>{CAT=b.dataset.c;BARSIG='';buildBar()});
 const sub=$('#subs'),gs=cat[3]?[]:lmGroups();if(sub){sub.hidden=gs.length<2;sub.innerHTML=gs.map(g=>{const n=g[3].filter(k=>!lockOf(k)).length;return`<button class="cat sub${g[0]===LMSUB?' on':''}" data-s="${g[0]}">${g[1]} ${g[2]}${n?` <b>${n}</b>`:''}</button>`}).join('');sub.querySelectorAll('.sub').forEach(b=>b.onclick=()=>{LMSUB=b.dataset.s;BARSIG='';buildBar()})}
 const lks=new Map(ord.map(k=>[k,lockOf(k)])),items=ord.filter(k=>lks.get(k)!=='built').sort((a,b)=>!!lks.get(a)-!!lks.get(b));BARSIG=CAT+'|'+LMSUB+'|'+ord.map(k=>lks.get(k)).join(',')+'|'+haveSig(ord);
 $('#builds').innerHTML=cz(items.length?items.map(k=>{const lk=lks.get(k);return `<button class="bb${lk?' locked':''}" data-k="${k}" title="${B[k].n}"><span class="bi">${bIco(k)}${lk?'<i>🔒</i>':''}</span><span class="bt"><b>${SHORTN[B[k].n]||B[k].n}</b><span class="c">${lk?(lk==='research'?'needs 🔬 research':lk):k==='rail'?'🪙12 ⚙️½ /tile':k==='tramline'?'🪙5 ⚙️¼ /tile':k==='elight'?'🪙6 /tile':k==='bridge'?'🪙60 🪨3 🪵2 /span':k==='house'||k==='palais'?'sell 🪙':costHave(B[k].cost)+(B[k].proj?' +🏗️':'')+(B[k].burns?' ⚫':'')}</span></span></button>`}).join(''):`<p class="m bbAll">All built. ${L.name} is proud of you.</p>`);
 const on=$('#cats .cat.on');if(on&&on.scrollIntoView)on.scrollIntoView({inline:'nearest',block:'nearest'});fitNames();return}
 if(false){const ord=[];$('#builds').innerHTML=ord.map(k=>`<button class="bb" data-k="${k}"><span>${B[k].i} ${B[k].n}</span><span class="c">${k==='bridge'?'🪙60 🪨3 🪵2 /span':k==='house'||k==='palais'?'sell 🪙':costHave(B[k].cost)+(B[k].proj?' +🏗️':'')}</span></button>`).join('');return}
 let ord=ORDER.filter(k=>L.sea||(k!=='shipyard'&&k!=='tower'));ord=L.zones?ord.filter(k=>k!=='kontor'&&k!=='mine'):ord.concat(['monument']);ord=ord.concat((L.landmarks||[]).map(e=>e.k));
 $('#builds').innerHTML=ord.map(k=>`<button class="bb" data-k="${k}"><span>${bIco(k)} ${B[k].n}</span><span class="c">${costStr(B[k].cost)}</span></button>`).join('')}

/* ---------- New York 1900 level ---------- */
const RAIL=10,ALLEE=11;
let ZONE=new Uint8Array(W*H),RAILM=new Uint8Array(W*H);
LEVELS.nyc1865={y1857:1,order:['road','bridge','house','palais','garden','grainf','brewery','vineyard','heuriger','sawmill','brick','stonewh','ironyard','harbour','coalyard','market','chapel','kaffeehaus','feuerwehr','spital','tram','gaswerk','kraftwerk','autofabrik'],name:'New York',lat:40.7081,lon:-74.0119,lat0:40.718,lon0:-73.994,km:8,rot:16*Math.PI/180,goal:0,sea:false,style:'wien1900',seed:1900,snow:false,hill:.7,bg:'#56673f',nscale:1.6,zones:true,
 start:[40.7081,-74.0119],base:75,realR:14,roadCol:'#aaa293',mon:{n:'Trinity Church',i:'⛪',k:'stephan'},tag:'New York 1865–1916',
 names:{heuriger:'Beer garden',stephan:'Trinity Church',hofburg:'City Hall',palais:'Fifth Avenue lot',votiv:'St. Patrick\'s Cathedral',stadtpark:'Central Park',tiergarten:'Central Park Zoo',oper:'Metropolitan Opera House',musikverein:'Carnegie Hall',brunnen:'Bethesda Fountain',reichsbruecke:'Brooklyn Bridge',rossauer:'Seventh Regiment Armory',universitaet:'New York Public Library',burgtheater:'Grand Central Terminal',imperial:'Waldorf-Astoria Hotel',epstein:'Vanderbilt Mansion',harbour:'Steamboat pier',kaffeehaus:'Coffee house',sawmill:'Lumber yard',stonewh:'Stone wharf',house:'Building lot',woodcutter:'Timber yard',fisher:'harbour fishery',market:'Market',chapel:'Parish church',brick:'Brickworks',weaver:'Textile mill',smith:'Tool works',sheep:'Sheep farm',tobacco:'Tobacco field',tobacconist:'Tobacco factory',spice:'Spice garden'},
 descs:{heuriger:'A German beer garden like the Atlantic Garden on the Bowery: music, beer and visitors. Needs beer in stock.',reichsbruecke:'The longest suspension bridge in the world. Build its anchorage on the Manhattan shore of the East River: over the years its two granite towers rise from the water, then the cables are spun, then the deck opens to Brooklyn.',tower:'A steel-frame office building with elevators. The later you build, the taller it gets. Rents bring in money every minute.',votiv:'A great Gothic cathedral on Fifth Avenue for the city\'s Irish Catholics.',stadtpark:'Olmsted and Vaux\'s park: lakes, meadows and bridges in the middle of Manhattan.',reichsbruecke:'The longest suspension bridge in the world. Build it on the Manhattan shore: when finished it spans the East River to Brooklyn.',oper:'A grand opera house on Broadway for the new millionaires.',musikverein:'Andrew Carnegie\'s concert hall on 57th Street.',brunnen:'The Angel of the Waters, the heart of Central Park.',rossauer:'A fortress-like armory for the city\'s most elegant regiment.',universitaet:'A marble palace of books on Fifth Avenue at 42nd Street.',burgtheater:'Vanderbilt\'s great railway terminal on 42nd Street.',imperial:'The most luxurious hotel in the world, on Fifth Avenue.',epstein:'A French château for the Vanderbilts on Fifth Avenue.',tiergarten:'The menagerie in Central Park.',house:'Sell a building lot. A builder pays you, then needs bricks and timber to put up tenements or brownstones.',palais:'A lot on Fifth Avenue. Millionaires pay a fortune and build a mansion. Must face Fifth Avenue.',brick:'Digs clay and fires bricks. Build in the Wienerberg or Laaer Berg clay pits.',market:'Goods are delivered here. Labourers nearby can become craftsmen.',chapel:'Craftsmen nearby can become merchants.'},
 lvNames:['','Labourers','Craftsmen','Clerks','Merchants','The well-to-do','The Four Hundred'],
 spiceHint:'Merchants want spices. They grow on the farms of Queens across the East River, part of Greater New York from 1898',
 landmarks:[{k:'votiv',lat:40.7585,lon:-73.9760,need:{year:1858},due:[1879,5]},{k:'stadtpark',lat:40.7655,lon:-73.9760,need:{year:1858},due:[1876,6]},{k:'reichsbruecke',lat:40.7090,lon:-73.9985,need:{year:1869},due:[1883,5]},{k:'tiergarten',lat:40.7660,lon:-73.9715,need:{year:1865,prest:40},due:[1866,1]},{k:'brunnen',lat:40.7665,lon:-73.9745,need:{year:1870,built:'stadtpark'},due:[1873,6]},{k:'rossauer',lat:40.7600,lon:-73.9680,need:{year:1877,houses:6},due:[1880,9]},{k:'epstein',lat:40.7600,lon:-73.9752,need:{year:1879,palais:2},due:[1882,1]},{k:'oper',lat:40.7540,lon:-73.9870,need:{year:1880,prest:120},due:[1883,10]},{k:'liberty',lat:40.6892,lon:-74.0445,need:{year:1884,prest:150},due:[1886,10]},{k:'musikverein',lat:40.7651,lon:-73.9799,need:{year:1889,prest:200},due:[1891,5]},{k:'imperial',lat:40.7484,lon:-73.9857,need:{year:1890,prest:250},due:[1893,3]},{k:'parkrow',lat:40.7114,lon:-74.0071,need:{year:1896,prest:250},due:[1899,4]},{k:'singer',lat:40.7096,lon:-74.0103,need:{year:1906,prest:350},due:[1908,5]},{k:'metlife',lat:40.7414,lon:-73.9870,need:{year:1907,prest:350},due:[1909,1]},{k:'woolworth',lat:40.7124,lon:-74.0083,need:{year:1910,prest:400},due:[1913,4]},{k:'universitaet',lat:40.7532,lon:-73.9822,need:{year:1897,prest:300},due:[1911,5]},{k:'flatiron',lat:40.7411,lon:-73.9897,need:{year:1900,prest:300},due:[1902,6]},{k:'burgtheater',lat:40.7527,lon:-73.9772,need:{year:1903,prest:350},due:[1913,2]}],
 hist:[['stephan',40.7081,-74.0119],['hofburg',40.7127,-74.0059],['market',40.7150,-74.0110],['market',40.7070,-74.0030],['market',40.7290,-73.9890],['market',40.7343,-73.9990],['market',40.6960,-73.9900]],
 init(D){const[l,p]=mk_(D);
  D.land=[l([40.7003,-74.0156,40.7040,-74.0185,40.7100,-74.0160,40.7170,-74.0130,40.7260,-74.0115,40.7330,-74.0105,40.7420,-74.0095,40.7500,-74.0080,40.7560,-74.0040,40.7620,-73.9990,40.7700,-73.9930,40.7800,-73.9880,40.7900,-73.9810,40.8000,-73.9740,40.8200,-73.9600,40.8500,-73.9450,40.8500,-73.9300,40.8100,-73.9300,40.7980,-73.9300,40.7850,-73.9410,40.7760,-73.9430,40.7680,-73.9500,40.7600,-73.9580,40.7520,-73.9660,40.7440,-73.9710,40.7380,-73.9730,40.7300,-73.9715,40.7240,-73.9720,40.7180,-73.9745,40.7120,-73.9780,40.7100,-73.9870,40.7085,-73.9960,40.7060,-74.0010,40.7030,-74.0080,40.7010,-74.0120]),
   l([40.6000,-74.0300,40.6600,-74.0200,40.6750,-74.0180,40.6830,-74.0080,40.6900,-74.0010,40.6960,-73.9985,40.7020,-73.9950,40.7040,-73.9880,40.7010,-73.9800,40.7030,-73.9740,40.7080,-73.9700,40.7150,-73.9660,40.7230,-73.9620,40.7300,-73.9600,40.7370,-73.9590,40.7420,-73.9590,40.7500,-73.9530,40.7580,-73.9470,40.7680,-73.9390,40.7800,-73.9250,40.8000,-73.9000,40.8000,-73.8000,40.6000,-73.8000]),
   l([40.6500,-74.1500,40.6500,-74.0700,40.6800,-74.0520,40.6950,-74.0520,40.7100,-74.0400,40.7180,-74.0340,40.7300,-74.0300,40.7380,-74.0280,40.7440,-74.0260,40.7550,-74.0230,40.7680,-74.0150,40.7800,-74.0070,40.8000,-73.9950,40.8500,-73.9700,40.8500,-74.1500]),
   l([40.6930,-74.0160,40.6920,-74.0120,40.6880,-74.0110,40.6855,-74.0170,40.6880,-74.0210,40.6915,-74.0200]),
   l([40.6915,-74.0480,40.6912,-74.0425,40.6878,-74.0412,40.6866,-74.0452,40.6884,-74.0485]),
   l([40.7004,-74.0408,40.7000,-74.0383,40.6983,-74.0383,40.6983,-74.0408]),
   l([40.7520,-73.9600,40.7720,-73.9440,40.7730,-73.9420,40.7530,-73.9575])];
  D.cpark=l([40.7644,-73.9730,40.7681,-73.9819,40.8003,-73.9580,40.7968,-73.9493]);
  D.ring=l([40.7312,-73.9970,40.7359,-73.9937,40.7500,-73.9834,40.7644,-73.9730]);
  D.city0=l([40.7003,-74.0156,40.7040,-74.0185,40.7100,-74.0160,40.7170,-74.0130,40.7260,-74.0115,40.7330,-74.0105,40.7420,-74.0095,40.7480,-74.0085,40.7440,-73.9720,40.7380,-73.9730,40.7300,-73.9715,40.7240,-73.9720,40.7180,-73.9745,40.7120,-73.9780,40.7100,-73.9870,40.7085,-73.9960,40.7060,-74.0010,40.7030,-74.0080,40.7010,-74.0120]);
  D.z0=l([40.7003,-74.0156,40.7040,-74.0185,40.7100,-74.0160,40.7170,-74.0130,40.7260,-74.0115,40.7330,-74.0105,40.7420,-74.0095,40.7500,-74.0080,40.7560,-74.0040,40.7620,-73.9990,40.7700,-73.9930,40.7600,-73.9580,40.7520,-73.9660,40.7440,-73.9710,40.7380,-73.9730,40.7300,-73.9715,40.7240,-73.9720,40.7180,-73.9745,40.7120,-73.9780,40.7100,-73.9870,40.7085,-73.9960,40.7060,-74.0010,40.7030,-74.0080,40.7010,-74.0120]);
  D.queens=l([40.7370,-73.9620,40.7420,-73.9590,40.7500,-73.9530,40.7580,-73.9470,40.7680,-73.9390,40.7800,-73.9250,40.8000,-73.9000,40.8000,-73.8000,40.7370,-73.8000]);
  D.city0b=l([40.6880,-74.0040,40.6960,-73.9985,40.7020,-73.9950,40.7040,-73.9880,40.7000,-73.9800,40.6920,-73.9760,40.6850,-73.9840]);
  D.keep=[[...p(40.7085,-73.9975),.045]];
  D.P={stephan:p(40.7081,-74.0119),clay1:p(40.7300,-73.9545),clay2:p(40.7180,-73.9610)};
  D.parks=[[p(40.7033,-74.0165),.012,'g'],[p(40.7308,-73.9973),.011,'g'],[p(40.7359,-73.9906),.008,'g'],[p(40.7420,-73.9880),.009,'g'],[p(40.7126,-74.0065),.008,'g'],[p(40.7265,-73.9817),.01,'g'],[p(40.7536,-73.9832),.009,'g'],[p(40.6910,-73.9750),.012,'g']];
  const P14=[40.7359,-73.9937],P59=[40.7644,-73.9730],st=(n,off)=>{const f=(n-14)/45;return[P14[0]+(P59[0]-P14[0])*f-off*.485/110570,P14[1]+(P59[1]-P14[1])*f+off*.875/84300]},
   seg=(n0,o0,n1,o1)=>{const a=st(n0,o0),b=st(n1,o1);return l([a[0],a[1],b[0],b[1]])};
  D.roadL={broadway:l([40.7045,-74.0135,40.7090,-74.0105,40.7128,-74.0070,40.7190,-74.0030,40.7255,-73.9980,40.7318,-73.9925,40.7359,-73.9906,40.7411,-73.9897,40.7466,-73.9880,40.7505,-73.9877,40.7580,-73.9855,40.7660,-73.9825]),
   bowery:l([40.7140,-73.9975,40.7200,-73.9935,40.7255,-73.9915,40.7300,-73.9905]),canal:l([40.7225,-74.0070,40.7195,-74.0010,40.7170,-73.9945]),houston:l([40.7285,-74.0050,40.7255,-73.9960,40.7225,-73.9870,40.7200,-73.9790]),
   chambers:l([40.7160,-74.0120,40.7140,-74.0045]),fulton:l([40.7110,-74.0100,40.7085,-74.0040]),wall:l([40.7075,-74.0105,40.7058,-74.0065]),hudson:l([40.7175,-74.0085,40.7260,-74.0075,40.7370,-74.0060]),
   grand:l([40.7210,-74.0005,40.7180,-73.9900,40.7160,-73.9800]),eastbway:l([40.7130,-73.9980,40.7140,-73.9880,40.7150,-73.9830]),
   av10:seg(14,-1350,59,-1350),av9:seg(14,-1100,59,-1100),av8:seg(14,-830,58,-830),av7:seg(14,-560,58,-560),av6:seg(14,-280,58,-280),av4:seg(14,290,58,290),av3:seg(14,600,59,600),av2:seg(14,870,59,870),av1:seg(14,1130,59,1100),
   s14:seg(14,-1350,14,1350),s23:seg(23,-1350,23,1130),s34:seg(34,-1350,34,1100),s42:seg(42,-1350,42,1100),s57:seg(57,-1350,57,1050),
   bkfulton:l([40.7025,-73.9930,40.6960,-73.9900,40.6920,-73.9870,40.6880,-73.9770,40.6840,-73.9650,40.6800,-73.9500]),atlantic:l([40.6910,-73.9985,40.6870,-73.9850,40.6840,-73.9700,40.6810,-73.9500]),
   court:l([40.6930,-73.9910,40.6850,-73.9930,40.6780,-73.9960]),flushing:l([40.6980,-73.9770,40.7000,-73.9600,40.7010,-73.9450]),bkbway:l([40.7105,-73.9655,40.7050,-73.9550,40.6990,-73.9450]),
   kent:l([40.7020,-73.9720,40.7100,-73.9670,40.7220,-73.9610,40.7300,-73.9580]),mhtnave:l([40.7230,-73.9500,40.7330,-73.9540,40.7380,-73.9555]),vernon:l([40.7420,-73.9550,40.7520,-73.9480,40.7600,-73.9420]),myrtle:l([40.6950,-73.9880,40.6940,-73.9700,40.6960,-73.9500])};
  D.linien=null;D.railL=[];D.R={};D.W=[]},
 elev(c,D){return Math.max(0,(c.n3-.5)*.06)},
 zoneOf(c,D){const{E,S}=c;if(inPoly(E,S,D.z0)||inPoly(E,S,D.city0b)||inPoly(E,S,D.land[4])||inPoly(E,S,D.land[5]))return 0;if(inPoly(E,S,D.land[2]))return 9;if(inPoly(E,S,D.queens))return 2;return 1},
 terrain(c,D){const{E,S}=c;let land=false;for(const pl of D.land)if(inPoly(E,S,pl)){land=true;break}c.dw=1;if(!land)return WATER;
  if(inPoly(E,S,D.cpark)){c.park='g';return c.n2>.55?FOREST:GRASS}
  for(const[pk,r,k]of D.parks)if(near(E,S,pk[0],pk[1],r)){c.park=k;break}
  if(c.park)return c.n2>.65?FOREST:GRASS;{const dc=Math.hypot(E-D.P.stephan[0],S-D.P.stephan[1]);if(!inPoly(E,S,D.z0)&&!inPoly(E,S,D.city0b)&&dc>.32&&c.n2>.58)return FOREST}return c.n2>.94?FOREST:GRASS},
 deco(c,t,D){if(t!==GRASS)return 0;const{E,S}=c,P=D.P,r=hs(c.x*977+c.y*131);if(c.park)return r<.3?FLOW:0;
  if(near(E,S,...P.clay1,.05)||near(E,S,...P.clay2,.04))return CLAY;const z=D.zoneOf(c,D);
  if(z>=2){const dc=Math.hypot(E-P.stephan[0],S-P.stephan[1]),fp=(dc-.3)/.3+(c.n3-.5)*1.4;if(fp>.5&&r<Math.min(.65,(fp-.5)*1.2))return FIELD}return r<.03?FLOW:0},
 fert(c,D){const{E,S}=c,P=D.P;let f=0;if(c.park)f|=32;if(near(E,S,...P.clay1,.06)||near(E,S,...P.clay2,.05))f|=4;if(D.zoneOf(c,D)>=1)f|=3;return f},
 bridges:[],
 prebuild(){const D=L;RAILM.fill(0);S.ringT=ringTiles();RINGSET=new Set(S.ringT);const rs=RINGSET,nearR=j=>{const x=j%W,y=j/W|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(rs.has((y+dy)*W+x+dx))return true;return false};
  for(const[t,la,lo]of S.scratch?startHist(D):D.hist){const f=B[t].foot||1,[cx,cy]=gt(...prj(D,la,lo)),x0=Math.round(cx-(f-1)/2),y0=Math.round(cy-(f-1)/2);
   const ok=(x,y)=>footTiles(t,x,y).every(([a,b])=>inb(a,b)&&!S.b[b*W+a]&&S.tiles[b*W+a]!==WATER&&S.tiles[b*W+a]!==BRIDGE&&!nearR(b*W+a));let fd=null;
   for(let r=0;r<12&&!fd;r++)for(let dy=-r;dy<=r&&!fd;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(t==='market'&&(((x0+dx)%5+5)%5!==1||((y0+dy)%5+5)%5!==1))continue;if(ok(x0+dx,y0+dy)){fd=[x0+dx,y0+dy];break}}
   if(fd){const o=place(t,fd[0],fd[1],0,true);o.h=1}}
  if(!S.scratch){S.ringDone=1;applyRing()}
  if(S.scratch)startRoads(D);else for(const[k,pts]of Object.entries(D.roadL)){const rt=routeWP(wpts(pts,8),{water:14,turn:.6,box:24});bridgeWet(rt);for(const i of rt){if(S.tiles[i]===BRIDGE||S.b[i])continue;const o=place('road',i%W,i/W|0,0,true);o.h=1;o.rn=k;if(k==='allee')o.al=1}linkRoute(rt)}
  dropOrphanBridges();
  for(const o of S.list)if(o.t==='road'&&o.al)for(const[dx,dy]of D4){const x=o.x+dx,y=o.y+dy,n=y*W+x;if(inb(x,y)&&!S.b[n]&&S.tiles[n]===GRASS)DECO[n]=ALLEE}
  if(false)for(const pts of D.railL)for(const i of rast(pts)){const tt=S.tiles[i];if(tt===WATER||tt===BRIDGE||S.b[i])continue;RAILM[i]=1;DECO[i]=RAIL;if(tt===FOREST){S.tiles[i]=GRASS;tcolSet(i)}}
  const nw=0;L.wall=null;WALLAT=null;
  S.walls0=nw;
  const cen=D.P.stephan,roads=Object.values(D.roadL);let hu=0;
  const blocks=[];
  if(!S.scratch)for(let y=1;y<H-5;y+=5)for(let x=1;x<W-5;x+=5){const[E,S2]=geo(x+1.5,y+1.5),z=ZONE[(y+2)*W+x+2],dc=Math.hypot(E-cen[0],S2-cen[1]),dr=pdist(E,S2,D.ring);
   let p,lvl,v='';
   if(inPoly(E,S2,D.city0)||inPoly(E,S2,D.city0b)){if(dr<3*TU)continue;if(D.keep&&D.keep.some(q=>Math.hypot(E-q[0],S2-q[1])<q[2]))continue;p=.9;lvl=4;v='old'}
   else continue;
   if(p<=0||hs(x*911+y*37)>p)continue;
   if(!footTiles('house',x,y).every(([a,b])=>{const j=b*W+a,tt=S.tiles[j];return(tt===GRASS||tt===SAND)&&!S.b[j]&&!RAILM[j]&&!(fert[j]&40)&&!nearR(j)}))continue;
   const o=place('house',x,y,0,true);o.h=1;o.lvl=lvl;o.pop=LV[lvl].max;o.v=v;hu+=o.pop;blocks.push(o)}
  if(!S.scratch){for(const o of S.list)if(o.t==='market'&&o.h)blocks.push(o);
  for(const o of S.list.slice())if(o.h&&B[o.t].lm){const f=B[o.t].foot||1;for(let k=-1;k<=f;k++)for(const[a,b]of[[o.x+k,o.y-1],[o.x+k,o.y+f],[o.x-1,o.y+k],[o.x+f,o.y+k]]){if(!inb(a,b))continue;const j=b*W+a,tt=S.tiles[j];
   if(S.b[j]||RAILM[j]||rs.has(j)||nearR(j)||(tt!==GRASS&&tt!==SAND&&tt!==FOREST))continue;const r=place('road',a,b,0,true);r.h=1;DECO[j]=0}}
  // streets around every block
  for(const o of blocks)for(let k=-1;k<=4;k++)for(const[a,b]of[[o.x+k,o.y-1],[o.x+k,o.y+4],[o.x-1,o.y+k],[o.x+4,o.y+k]]){if(!inb(a,b))continue;const j=b*W+a,tt=S.tiles[j];
   if(S.b[j]||RAILM[j]||rs.has(j)||nearR(j)||(tt!==GRASS&&tt!==SAND&&tt!==FOREST))continue;const r=place('road',a,b,0,true);r.h=1;DECO[j]=0}
  joinStreets();ringJunctions();pruneSpurs()}
  S.histU=hu;S.mult=S.scratch?40:550000/Math.max(1,hu);if(!RESTORING&&!S.scratch)starterCity()}
};
/* Vienna 1857–1916 (preview): the map and the city of the 2D Ringstraße game; its texts, events, requests and audiences are
   added further down, once the calendar and the requests exist */
LEVELS.wien1857={y1857:1,order:['road','bridge','house','palais','garden','grainf','brewery','vineyard','heuriger','sawmill','brick','stonewh','ironyard','harbour','coalyard','market','chapel','kaffeehaus','feuerwehr','spital','tram','gaswerk','kraftwerk','autofabrik'],name:'Vienna',lat:48.2085,lon:16.3725,lat0:48.203,lon0:16.365,km:6.5,goal:0,sea:false,ringOct:{quay:0,cut:3},tallNoise:1,style:'wien1900',seed:1900,snow:false,hill:.7,bg:'#56673f',nscale:1.6,zones:true,
 start:[48.2085,16.3731],base:75,realR:14,roadCol:'#aaa293',mon:{n:'Stephansdom',i:'⛪',k:'stephan'},tag:'Vienna 1857–1916',
 names:{house:'Zinshaus plot',woodcutter:'Timber yard',fisher:'Danube fishery',market:'Market',chapel:'Parish church',brick:'Brickworks',weaver:'Textile mill',smith:'Tool works',sheep:'Sheep farm',tobacco:'Tobacco field',tobacconist:'Tobacco factory',spice:'Spice garden'},
 descs:{house:'Sell a building plot. A builder pays you, then needs bricks and timber to put up an apartment block.',brick:'Digs clay and fires bricks. Build in the Wienerberg or Laaer Berg clay pits.',market:'Goods are delivered here. Labourers nearby can become craftsmen.',chapel:'Craftsmen nearby can become Bürger.'},
 lvNames:['','Labourers','Craftsmen','Clerks','Bürger','Grand Bürger','Nobility'],
 spiceHint:'Merchants want spices. They grow on the Marchfeld across the Danube, part of Vienna from 1904',
 /* the Stadtpark's lot lies a little south-east of the park's middle, on the Landstraße bank opposite the Kursalon, where the map's Wien
    leaves room for it; the rest of the park, on the city side and along the water, is laid out round it (greens.js) */
 landmarks:[{k:'karls',lat:48.1982,lon:16.3718,need:{year:1865,prest:60}},{k:'votiv',lat:48.2155,lon:16.3590,need:{year:1857},due:[1879,4]},{k:'rossauer',lat:48.2215,lon:16.3655,need:{year:1865,houses:6},due:[1869,10]},{k:'universitaet',lat:48.2132,lon:16.3601,need:{year:1873,prest:300},due:[1884,10]},{k:'tiergarten',lat:48.1815,lon:16.3030,need:{year:1865,prest:40},due:[1866,1]},{k:'regulierung',lat:48.2300,lon:16.4120,need:{year:1870},due:[1875,5]},{k:'reichsbruecke',lat:48.2255,lon:16.4060,need:{year:1872,built:'regulierung'},due:[1876,8]},{k:'burgtheater',lat:48.2105,lon:16.3612,need:{year:1874,prest:200},due:[1888,10]},{k:'rad',lat:48.2166,lon:16.3958,need:{year:1897},due:[1897,6]},{k:'kursalon',lat:48.2036,lon:16.3797,need:{year:1865,built:'stadtpark'},due:[1867,10]},{k:'kuenstler',lat:48.2006,lon:16.3706,need:{year:1865,prest:120},due:[1868,9]},{k:'epstein',lat:48.2077,lon:16.3601,need:{year:1868,palais:2},due:[1871,1]},{k:'ephrussi',lat:48.2142,lon:16.3618,need:{year:1872,palais:4},due:[1873,6]},{k:'imperial',lat:48.2017,lon:16.3728,need:{year:1872,prest:250},due:[1873,4]},{k:'stadtpark',lat:48.2015,lon:16.3821,need:{year:1860,houses:4},due:[1862,8]},{k:'oper',lat:48.2030,lon:16.3692,need:{year:1861,houses:8},due:[1869,5]},{k:'musikverein',lat:48.2005,lon:16.3727,need:{year:1867,prest:150},due:[1870,1]},{k:'rotunde',lat:48.2165,lon:16.4040,need:{year:1871,houses:20},due:[1873,5]},{k:'brunnen',lat:48.1990,lon:16.3755,need:{year:1871},due:[1873,10]}],
 hist:[['stephan',48.2085,16.3731],['hofburg',48.2062,16.3650],['schoen',48.1840,16.3122],['belved',48.1952,16.3810],
  ['market',48.1985,16.3618],['market',48.2165,16.3790],['market',48.2035,16.3910],['market',48.2105,16.3355],
  /* the old city's market by Am Hof, on the free lot at the Tiefer Graben (so no old house makes way for it): it serves the homes round
     the Hofburg, which is no market itself */
  ['market',48.2124,16.3688]],
 init(D){const[l,p]=mk_(D);
  D.R={danube:l([48.318,16.326,48.300,16.338,48.285,16.352,48.270,16.364,48.258,16.374,48.247,16.388,48.240,16.395,48.228,16.411,48.218,16.425,48.209,16.437,48.196,16.452,48.183,16.468,48.170,16.485]),
   canal:l([48.262,16.3695,48.259,16.369,48.250,16.368,48.240,16.366,48.230,16.365,48.222,16.367,48.216,16.372,48.212,16.378,48.208,16.386,48.202,16.395,48.196,16.405,48.190,16.416,48.183,16.428,48.176,16.443,48.170,16.460,48.173,16.481]),
   wien:l([48.1885,16.2950,48.1880,16.3200,48.1920,16.3380,48.1960,16.3520,48.1985,16.3625,48.1995,16.3700,48.2007,16.3760,48.2026,16.3806,48.2052,16.3828,48.2085,16.3842]),
   alte:l([48.258,16.400,48.250,16.410,48.242,16.418,48.234,16.424,48.226,16.430])};
  D.W=[[D.R.danube,5],[D.R.canal,1.05],[D.R.wien,.8],[D.R.alte,3.2]];
  D.old=l([48.2150,16.3640,48.2130,16.3600,48.2105,16.3592,48.2078,16.3590,48.2055,16.3610,48.2040,16.3640,48.2028,16.3670,48.2018,16.3700,48.2015,16.3730,48.2022,16.3760,48.2040,16.3790,48.2065,16.3805,48.2090,16.3815,48.2112,16.3825,48.2125,16.3800,48.2135,16.3775,48.2145,16.3735,48.2155,16.3690,48.2150,16.3640]);
  /* the Ring runs well outside the old town's edge, over the Glacis, so its palaces and monuments have room on both sides of it */
  D.ringC=p(48.2085,16.3731);D.ringS=1.5;D.ring=D.old.map(([E,S])=>[D.ringC[0]+(E-D.ringC[0])*D.ringS,D.ringC[1]+(S-D.ringC[1])*D.ringS]);
  const gur=[48.2350,16.3600,48.2290,16.3530,48.2225,16.3470,48.2160,16.3405,48.2090,16.3380,48.2010,16.3378,48.1950,16.3390,48.1895,16.3440,48.1858,16.3540,48.1852,16.3650,48.1858,16.3760,48.1872,16.3880,48.1890,16.3990,48.1915,16.4095];
  D.gurtel=l(gur);
  D.city0=l(gur.concat([48.196,16.405,48.202,16.395,48.208,16.386,48.212,16.378,48.216,16.372,48.222,16.367,48.230,16.365,48.236,16.3655]));
  D.P={stephan:p(48.2085,16.3731),doebl:p(48.2480,16.3350),glor:p(48.1785,16.3088),wienerberg:p(48.1650,16.3550),laaer:p(48.1660,16.3920),vine:p(48.2450,16.3450),praterstern:p(48.2185,16.3925)};
  D.parks=[[p(48.2245,16.3765),.055,'g'],[p(48.2088,16.3605),.018,'g'],[p(48.1795,16.3110),.1,'g'],[p(48.1830,16.3010),.045,'w'],[p(48.2340,16.3330),.035,'w']];
  D.roadL={ring:D.ring,gurtel:D.gurtel,
   mariahilf:l([48.2020,16.3605,48.1990,16.3500,48.1966,16.3376,48.1930,16.3270,48.1890,16.3175]),schoenbr:l([48.1958,16.3610,48.1935,16.3520,48.1905,16.3400,48.1878,16.3290,48.1860,16.3200,48.1852,16.3140]),wieden:l([48.1998,16.3690,48.1940,16.3665,48.1858,16.3640]),
   favoriten:l([48.1975,16.3725,48.1910,16.3735,48.1858,16.3745,48.1760,16.3775,48.1680,16.3800]),landstr:l([48.2060,16.3825,48.2000,16.3890,48.1935,16.3950,48.1890,16.4000]),
   simmering:l([48.1890,16.4000,48.1820,16.4170,48.1740,16.4330]),praterstr:l([48.2128,16.3800,48.2158,16.3865,48.2185,16.3925]),
   allee:l([48.2185,16.3925,48.2100,16.4085,48.2005,16.4290]),lassalle:l([48.2185,16.3925,48.2250,16.4030,48.2290,16.4105,48.2350,16.4195,48.2420,16.4320]),
   tabor:l([48.2140,16.3780,48.2200,16.3835,48.2270,16.3900,48.2335,16.3880,48.2420,16.3870,48.2520,16.3950]),alser:l([48.2150,16.3585,48.2155,16.3480,48.2160,16.3405,48.2165,16.3250]),
   waehring:l([48.2160,16.3605,48.2205,16.3550,48.2255,16.3480,48.2320,16.3400]),josefst:l([48.2088,16.3560,48.2095,16.3460,48.2100,16.3380,48.2105,16.3200]),
   thalia:l([48.2050,16.3385,48.2060,16.3250,48.2075,16.3100]),hernals:l([48.2160,16.3405,48.2200,16.3260,48.2230,16.3120]),triest:l([48.1855,16.3590,48.1760,16.3555,48.1650,16.3530]),
   kaertner:l([48.2020,16.3702,48.2055,16.3712,48.2085,16.3722]),graben:l([48.2087,16.3680,48.2088,16.3725]),rotenturm:l([48.2086,16.3738,48.2118,16.3775]),
   herren:l([48.2085,16.3668,48.2126,16.3650]),wollzeile:l([48.2085,16.3740,48.2072,16.3795]),doebling:l([48.2340,16.3570,48.2420,16.3520,48.2500,16.3480]),
   heiligenst:l([48.2350,16.3610,48.2450,16.3630,48.2550,16.3640]),bruenner:l([48.2500,16.3900,48.2600,16.3990,48.2700,16.4060])};
  D.linien=D.roadL.gurtel;delete D.roadL.ring;delete D.roadL.gurtel;delete D.roadL.lassalle;
  D.railL=[l([48.1966,16.3376,48.1950,16.3200,48.1930,16.3000,48.1900,16.2800]),l([48.1860,16.3780,48.1790,16.3830,48.1700,16.3870,48.1600,16.3900]),l([48.1850,16.3820,48.1800,16.4000,48.1750,16.4200,48.1700,16.4400]),
   l([48.2225,16.3920,48.2300,16.3900,48.2390,16.3900,48.2445,16.3915,48.2520,16.3980,48.2600,16.4050]),l([48.2255,16.3585,48.2330,16.3615,48.2420,16.3650,48.2500,16.3670])]},
 elev(c,D){const{E,S}=c,P=D.P;let h=Math.max(0,-E-.35)*.75+Math.max(0,-S-E*.6-.55)*.9+(c.n3-.5)*.08;h+=bump(E,S,P.doebl,.28,.45)+bump(E,S,P.glor,.07,.3)+bump(E,S,P.wienerberg,.15,.28)+bump(E,S,P.laaer,.12,.22);return Math.max(0,h)},
 zoneOf(c,D){if(inPoly(c.E,c.S,D.city0))return 0;const dS=yAt(D.R.danube,c.E);if(c.S<dS)return 2;if(c.S<yAt(D.R.canal,c.E))return 0;return 1},
 terrain(c,D){const{E,S,h}=c;c.dw=riverD(c,D.W);if(c.dw<(c.n-.5)*.4*TU)return WATER;
  const dS=yAt(D.R.danube,E);c.north=S<dS;c.flood=c.north&&pdist(E,S,D.R.danube)<21*TU;
  for(const[pk,r,k]of D.parks)if(near(E,S,pk[0],pk[1],r)){c.park=k;break}
  if(c.park)return c.park==='w'?(c.n2>.25?FOREST:GRASS):(c.n2>.6?FOREST:GRASS);
  if(!c.north&&S<yAt(D.R.canal,E)&&E>D.P.praterstern[0]+.02)return c.n2>.32?FOREST:GRASS;
  if(c.flood)return c.n2>.8?FOREST:GRASS;
  if(h>.45&&c.n2>.3||E<-.82&&c.n2>.4)return FOREST;
  if(h>.42&&c.n>.5||h>.6)return MOUNT;
  return c.n2>.87?FOREST:GRASS},
 deco(c,t,D){if(t!==GRASS&&t!==SAND)return 0;const{E,S,h}=c,P=D.P,r=hs(c.x*977+c.y*131);
  if(c.flood)return r<.45?MARSH:r<.7?REED:0;if(c.park)return r<.35?FLOW:0;if(c.dw<2*TU&&r<.35)return REED;if(t===SAND)return 0;
  if(near(E,S,...P.wienerberg,.07)||near(E,S,...P.laaer,.055))return CLAY;
  if(near(E,S,...P.vine,.16)&&h>.2)return VINE;
  const z=D.zoneOf(c,D),dc=Math.hypot(E-P.stephan[0],S-P.stephan[1]),fp=(dc-.42)/.35+(c.n3-.5)*1.6+(z===2?.4:0);if(fp>.55&&r<Math.min(.7,(fp-.55)*1.2))return FIELD;return r<.05?FLOW:0},
 fert(c,D){const{E,S}=c,P=D.P;let f=0;if(c.flood)f|=8;if(c.park)f|=32;if(near(E,S,...P.wienerberg,.08)||near(E,S,...P.laaer,.065))f|=4;
  const z=D.zoneOf(c,D);if(z===1&&S>.35)f|=1;if(z===2&&!c.flood)f|=2;return f},
 bridges:[[48.2482,16.3865,'danube'],[48.2445,16.3915,'danube'],[48.2290,16.4105,'danube'],
  [48.2285,16.3650,'canal'],[48.2232,16.3668,'canal'],[48.2185,16.3688,'canal'],[48.2132,16.3758,'canal'],[48.2125,16.3782,'canal'],[48.2110,16.3838,'canal'],[48.2075,16.3895,'canal'],[48.2010,16.3985,'canal'],[48.1925,16.4105,'canal'],
  [48.2040,16.3770,'wien'],[48.1990,16.3640,'wien'],[48.1965,16.3560,'wien'],[48.1925,16.3390,'wien'],[48.1885,16.3215,'wien']],
 prebuild(){const D=L;RAILM.fill(0);S.ringT=ringTiles();RINGSET=new Set(S.ringT);const rs=RINGSET,nearR=j=>{const x=j%W,y=j/W|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(rs.has((y+dy)*W+x+dx))return true;return false};
  for(const[t,la,lo]of S.scratch?startHist(D):D.hist){const f=B[t].foot||1,[cx,cy]=gt(...prj(D,la,lo)),x0=Math.round(cx-(f-1)/2),y0=Math.round(cy-(f-1)/2);
   const ok=(x,y)=>footTiles(t,x,y).every(([a,b])=>inb(a,b)&&!S.b[b*W+a]&&S.tiles[b*W+a]!==WATER&&S.tiles[b*W+a]!==BRIDGE&&!nearR(b*W+a));let fd=null;
   for(let r=0;r<12&&!fd;r++)for(let dy=-r;dy<=r&&!fd;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(t==='market'&&(((x0+dx)%5+5)%5!==1||((y0+dy)%5+5)%5!==1))continue;if(ok(x0+dx,y0+dy)){fd=[x0+dx,y0+dy];break}}
   if(fd){const o=place(t,fd[0],fd[1],0,true);o.h=1}}
  S.ringDone=1;applyRing();ringNames();
  if(S.scratch)startRoads(D);else for(const[k,pts]of Object.entries(D.roadL)){const wp=wpts(pts,8);if(D.old)ringGates(wp,pts);const rt=routeWP(wp,{water:14,turn:.6,box:24});bridgeWet(rt);for(const i of rt){if(S.tiles[i]===BRIDGE||S.b[i])continue;const o=place('road',i%W,i/W|0,0,true);o.h=1;o.rn=k;if(k==='allee')o.al=1}linkRoute(rt)}
  bridgeEnds(6);dropOrphanBridges();
  for(const o of S.list)if(o.t==='road'&&o.al)for(const[dx,dy]of D4){const x=o.x+dx,y=o.y+dy,n=y*W+x;if(inb(x,y)&&!S.b[n]&&S.tiles[n]===GRASS)DECO[n]=ALLEE}
  if(false)for(const pts of D.railL)for(const i of rast(pts)){const tt=S.tiles[i];if(tt===WATER||tt===BRIDGE||S.b[i])continue;RAILM[i]=1;DECO[i]=RAIL;if(tt===FOREST){S.tiles[i]=GRASS;tcolSet(i)}}
  const nw=0;L.wall=null;WALLAT=null;
  S.walls0=nw;
  const cen=D.P.stephan,roads=Object.values(D.roadL);let hu=0;
  const blocks=[];
  if(!S.scratch)for(let y=1;y<H-5;y+=5)for(let x=1;x<W-5;x+=5){const[E,S2]=geo(x+1.5,y+1.5),z=ZONE[(y+2)*W+x+2],dc=Math.hypot(E-cen[0],S2-cen[1]),dr=pdist(E,S2,D.old);
   let p,lvl,v='';
   if(inPoly(E,S2,D.old)){if(dr<4.2*TU)continue;p=.97;lvl=4;v='old'}
   else continue;
   if(p<=0||hs(x*911+y*37)>p)continue;
   if(!footTiles('house',x,y).every(([a,b])=>{const j=b*W+a,tt=S.tiles[j];return(tt===GRASS||tt===SAND)&&!S.b[j]&&!RAILM[j]&&!(fert[j]&40)&&!nearR(j)}))continue;
   const o=place('house',x,y,0,true);o.h=1;o.lvl=lvl;o.pop=LV[lvl].max;o.v=v;hu+=o.pop;blocks.push(o)}
  if(!S.scratch){for(const o of S.list)if(o.t==='market'&&o.h)blocks.push(o);
  for(const o of S.list.slice())if(o.h&&B[o.t].lm){const f=B[o.t].foot||1;for(let k=-1;k<=f;k++)for(const[a,b]of[[o.x+k,o.y-1],[o.x+k,o.y+f],[o.x-1,o.y+k],[o.x+f,o.y+k]]){if(!inb(a,b))continue;const j=b*W+a,tt=S.tiles[j];
   if(S.b[j]||RAILM[j]||rs.has(j)||nearR(j)||(tt!==GRASS&&tt!==SAND&&tt!==FOREST))continue;const r=place('road',a,b,0,true);r.h=1;DECO[j]=0}}
  // streets around every block
  for(const o of blocks)for(let k=-1;k<=4;k++)for(const[a,b]of[[o.x+k,o.y-1],[o.x+k,o.y+4],[o.x-1,o.y+k],[o.x+4,o.y+k]]){if(!inb(a,b))continue;const j=b*W+a,tt=S.tiles[j];
   if(S.b[j]||RAILM[j]||rs.has(j)||nearR(j)||(tt!==GRASS&&tt!==SAND&&tt!==FOREST))continue;const r=place('road',a,b,0,true);r.h=1;DECO[j]=0}
  /* twice: a street reached only through another loose one is joined on the second pass */
  joinStreets();joinStreets();ringJunctions();pruneSpurs()}
  S.histU=hu;S.mult=S.scratch?40:L.eco.unit;S.pop0=S.scratch?0:L.eco.pop0-hu*S.mult;if(!RESTORING&&!S.scratch){starterCity();starterAdd(L.starter);if(L.rails0)L.rails0()}}
};
function rast(pts){const out=[],seen=new Set();let prev=null;
 for(let k=0;k<pts.length-1;k++){const[a,b]=pts[k],[c,d]=pts[k+1],n=Math.max(1,Math.ceil(Math.hypot(c-a,d-b)/(TU*.3)));
  for(let j=0;j<=n;j++){const[x,y]=gt(a+(c-a)*j/n,b+(d-b)*j/n);if(!inb(x,y)){prev=null;continue}const i=y*W+x;
   if(prev!==null&&i!==prev){const px=prev%W,py=prev/W|0;if(px!==x&&py!==y){const m=py*W+x;if(!seen.has(m)){seen.add(m);out.push(m)}}}
   if(!seen.has(i)){seen.add(i);out.push(i)}prev=i}}return out}
function connectBridges(){const isR=i=>S.b[i]&&S.b[i].t==='road';
 for(let i=0;i<W*H;i++){if(S.tiles[i]!==BRIDGE)continue;const x=i%W,y=i/W|0;
  for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(!inb(nx,ny))continue;const t=S.tiles[n];if(t===WATER||t===BRIDGE||isR(n)||S.b[n])continue;
   const par=new Map([[n,-1]]),q=[n];let found=-1;
   for(let h=0;h<q.length&&found<0&&q.length<900;h++){const k=q[h],kx=k%W,ky=k/W|0;for(const[ex,ey]of D4){const mx=kx+ex,my=ky+ey,m=my*W+mx;if(!inb(mx,my)||par.has(m))continue;const tt=S.tiles[m];if(tt===WATER||tt===BRIDGE)continue;if(isR(m)){par.set(m,k);found=m;break}if(S.b[m])continue;par.set(m,k);q.push(m)}}
   if(found>=0){let c=par.get(found);while(c!==-1&&c!==undefined){if(!S.b[c]){const o=place('road',c%W,c/W|0,0,true);o.h=1}c=par.get(c)}}}}}
/* ---------- calendar & events ---------- */
const YEAR=250,Y0=1857,MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const yT=(y,m=1,f=0)=>(y-Y0)*YEAR+(m-1+f)*YEAR/12;
function dateStr(t){const mo=Math.floor(t/(YEAR/12));return`${MON[mo%12]} ${Y0+Math.floor(mo/12)}`}
const NY_EVENTS=[[yT(1866,7),'cholera66'],[yT(1868,6),'tweedbribe'],[yT(1871,7,.5),'nast'],[yT(1873,9,.6),'crash'],[yT(1874,1),'limit1'],[yT(1876,7),'centennial'],[yT(1882,9),'pearl'],[yT(1888,3,.4),'blizzard'],[yT(1890,11),'riisbook'],[yT(1892,1),'ellis'],[yT(1895,5),'teddy'],[yT(1898,1),'limit2'],[yT(1904,10,.9),'subway'],[yT(1911,3,.8),'triangle'],[yT(1912,4,.58),'titanic'],[yT(1909,9,.9),'hudsonfulton'],[yT(1916,11,.7),'end']];
let EVENTS=NY_EVENTS;
/* a long card shows its first sentence, the rest folded under "More"; a short last paragraph (the question) stays in view */
function fold(x){x=String(x);if(x.replace(/<[^>]*>/g,'').length<150)return x;let tail='';const b=x.lastIndexOf('<br><br>');if(b>0&&x.length-b<140){tail=x.slice(b);x=x.slice(0,b)}
 const m=/^[^<]{20,220}?(?<!\b(?:fl|kr|Mrs|Mr|Dr|St|Jr))[.!?]["”']?(\s|<br>)/.exec(x);if(!m||x.length-m[0].length<40)return x+tail;return`${m[0].trim()} <details class="more"><summary>More</summary>${x.slice(m[0].length).replace(/^(<br>)+/,'')}</details>${tail}`}
/* at: a building the card is about; the card then offers to show it */
function evOv(t,x,full,at){x=flx(full?x:fold(x));ov(`<h2>${t}</h2><p>${x}</p><div class="btns">${at?'<button id="ovShow">📍 Show me</button>':''}<button class="pri" id="ovOk">Continue</button></div>`);$('#ovOk').onclick=closeOv;
 if(at)$('#ovShow').onclick=()=>{closeOv();const f=(B[at.t]&&B[at.t].foot||1)/2|0;jumpTo(at.x+f,at.y+f)}}
function runEvents(){if(!L.zones||(S.ev<EVENTS.length&&S.t>=EVENTS[S.ev][0]&&(!letGo(true)||performance.now()<QUIET0)))return;while(S.ev<EVENTS.length&&S.t>=EVENTS[S.ev][0]){const k=EVENTS[S.ev][1];S.ev++;fireEvent(k);if(!$('#ov').hidden)break}}
function fireEvent(k){if(L.fire)return L.fire(k);const built=t=>S.list.some(o=>o.t===t&&!o.bld);switch(k){
 case'cholera66':startEpidemic('Cholera',.1);break;
 case'tweedbribe':decide('tweed','🎩 Boss Tweed\'s offer','William M. "Boss" Tweed runs Tammany Hall. His contractors offer you a share if the city\'s contracts go to his friends.',[['Take the money: +4,000 $, but corruption grows',()=>{S.stock.gold+=4000;E_({cor:25,prest:-5})}],['Refuse him: Tammany will make life hard',()=>E_({cor:-10,rev:10,ref:10})]]);break;
 case'nast':if((EMP().cor||0)>=20){S.prest=Math.max(0,S.prest-40);S.stock.gold-=3000;evOv('The Tweed Ring falls','July 1871: the New York Times and Thomas Nast\'s cartoons expose the Tweed Ring. Your name is in the ledgers too. Fines and fury: −3,000 $, 👑 −40.')}else{S.prest+=20;evOv('The Tweed Ring falls','July 1871: the New York Times and Thomas Nast\'s cartoons expose the Tweed Ring. Your hands are clean, and the city trusts you. 👑 +20')}EMP().cor=Math.max(0,(EMP().cor||0)-15);break;
 case'crash':S.stock.gold=Math.round(S.stock.gold*.8);evChoice('The Panic of 1873','18 September 1873: Jay Cooke & Company fails and the Stock Exchange closes for ten days. Banks fail and building stalls, and you lose a fifth of your treasury.',[['Ask J. P. Morgan to steady the banks: −3,000 $, lots recover by 1875',()=>{S.stock.gold-=3000;S.slump=yT(1875,1);S.prest+=10}],['Let the market sort it out: lots stay cheap until 1878, and the poor suffer',()=>{S.slump=yT(1878,1);S.bad=S.t+YEAR}]]);break;
 case'limit1':S.limit=1;GV++;recompute();evOv('The city moves north','Streets are graded and lots laid out above 42nd Street. Upper Manhattan is open for building.');break;
 case'centennial':S.prest+=5;toast('🇺🇸 America turns one hundred');break;
 case'pearl':if(!RES().electric)RES().electric=1;recompute();evOv('Let there be light','4 September 1882: Edison\'s Pearl Street Station lights the first blocks of Lower Manhattan. Electric power is here, and soon every neighbourhood will want it.');break;
 case'blizzard':for(const g of['food','beer'])S.stock[g]=Math.floor(S.stock[g]*.7);S.strike=S.t+YEAR/12;S.prest=Math.max(0,S.prest-5);evOv('The Great Blizzard','March 1888: snow drifts as high as houses bury the city for days. Work stops, food runs short, and the telegraph wires come down. Afterwards everyone talks about putting wires and trains underground.');break;
 case'riisbook':decide('riis','📷 How the Other Half Lives','Jacob Riis publishes his photographs of the tenements. Readers are shocked: dark rooms, no water, disease.',[['Pass a tenement reform: −2,500 $, the poor are happier',()=>{S.stock.gold-=2500;E_({ref:20,rev:-15});S.good=S.t+YEAR}],['Ignore it',()=>E_({rev:15})]]);break;
 case'ellis':S.refG={n:S.list.filter(o=>o.t==='house'&&!o.h&&o.lvl<6).length+5,due:S.t+YEAR};for(const o of S.list)if(o.t==='house'&&!o.h)o.pop=Math.min(maxPop(o),o.pop+1);evOv('Ellis Island opens','1 January 1892: the new immigration station opens in the harbour. Thousands arrive every day. Sell five new building lots within a year to house them.');break;
 case'teddy':decide('roosevelt','🎖️ The new Police Commissioner','Theodore Roosevelt wants to clean out corrupt policemen, close saloons on Sundays and break Tammany\'s grip on the precincts.',[['Back his crackdown',()=>E_({cor:-20,ref:10,prest:10,rev:5})],['Leave the precincts alone',()=>E_({cor:10})]]);break;
 case'limit2':S.limit=2;GV++;recompute();S.prest+=40;evOv('Greater New York','1 January 1898: Brooklyn, Queens, the Bronx and Staten Island join Manhattan. New York becomes the second-largest city in the world. You can now build across the East River. 👑 +40');break;
 case'subway':S.prest+=30;S.good=S.t+YEAR;evOv('The subway opens','27 October 1904: the first subway runs from City Hall to Harlem in fifteen minutes. 150,000 people ride it on the first night. 👑 +30');histStart('subway');break;
 case'titanic':evOv('The Titanic','18 April 1912: in pouring rain the Carpathia steams up the Hudson to Pier 54. On board are the 705 survivors of the Titanic, which sank four days earlier on her way to New York. Thousands wait silently on the piers.');break;
 case'hudsonfulton':S.prest+=15;evOv('The Hudson-Fulton Celebration','September 1909: warships from around the world fill the Hudson, Wilbur Wright flies around the Statue of Liberty, and airships drift over the city. 👑 +15');break;
 case'triangle':decide('roosevelt','🔥 The Triangle fire','25 March 1911: fire sweeps through the Triangle Shirtwaist factory near Washington Square. 146 garment workers die, many behind locked doors.',[['Pass strict factory safety laws: −2,000 $, reforms +20',()=>{S.stock.gold-=2000;E_({ref:20,rev:-10})}],['Blame the owners and move on',()=>E_({rev:20})]]);break;
 case'end':if(!S.won){S.won=true;S.endK=endKey();showEnd()}break}}
const histPop=()=>S.histU||0;
function dispPop(){const p=popTotals(),r=S.scratch?10:1000;return Math.round(((histPop()+Ps(p,1)+(S.newc||0))*(S.mult||1)+(S.pop0||0))/r)*r}
const fmtPop=n=>Math.round(n).toLocaleString('en-US');
function showEnd(who){save();const lm=(L.landmarks||[]).filter(e=>cnt(e.k)).length,k=S.endK||endKey(),[et,ex]=ENDS[k],early=['revolution','fallen','hungary'].includes(k)&&S.t<yT(1916,11);
 ov(`<h1>${et}</h1><p class="m">${early?dateStr(S.t):NYC()?`November 1916: your long service to ${L.name} comes to an end.`:'21 November 1916: after sixty-eight years on the throne, your reign comes to an end.'}</p><p>${ex}</p>
 <table class="stat"><tr><td>👥 People in ${L.name}</td><td>${fmtPop(dispPop())}</td></tr><tr><td>🏛️ New landmarks</td><td>${lm} of ${(L.landmarks||[]).length}</td></tr><tr><td>🔬 Discoveries</td><td>${Object.keys(S.res||{}).length} of ${TECH.length}</td></tr><tr><td>👑 Your prestige</td><td>${S.prest}</td></tr><tr><td>${RIVI()} ${RIVAL()}</td><td>${bpScore()}</td></tr><tr><td>🪙 Treasury</td><td>${money(S.stock.gold,1)}</td></tr></table>
 <p class="m">${S.prest>bpScore()?`${L.name} outshines ${RIVAL()}.`:`${RIVAL()} outshone ${L.name}.`}</p>
 <div class="btns"><button class="pri" id="ovOk">Keep exploring</button><button id="ovNew">Start again in 1865</button></div>`);
 $('#ovOk').onclick=closeOv;$('#ovNew').onclick=()=>{newGame(S.level||'nyc1865');closeOv();save()}}
/* ---------- Fifth Avenue 1857: walls, ring, plots, construction ---------- */
let RINGSET=null,HINTA=null,RESTORING=false,NEWMODE='hist',UNLOCKALL=false;
function nearRing(j){if(!RINGSET)return false;const x=j%W,y=j/W|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(RINGSET.has((y+dy)*W+x+dx))return true;return false}
const LMZ={stephan:.55,hofburg:.42,schoen:.4,belved:.45,karls:.5,votiv:.55,oper:.5,rad:.6};
/* Vienna's landmarks may stand outside the city limits of before 1892, as Schönbrunn did */
const canUse=(t,j)=>area[j]||(L.y1857&&B[t]&&(!!B[t].out||!!B[t].svc||t==='road'||t==='bridge'||L.ringOct&&!!B[t].lm)&&ZONE[j]<=1);
function gridRoute(pts){const G=5,nodes=[];let lastS=null;
 for(let k=0;k<pts.length-1;k++){const[a0,b0]=gt(pts[k][0],pts[k][1]),[a1,b1]=gt(pts[k+1][0],pts[k+1][1]),n=Math.max(1,Math.ceil(Math.hypot(a1-a0,b1-b0)));
  for(let s=0;s<=n;s++){const x=a0+(a1-a0)*s/n,y=b0+(b1-b0)*s/n,nx=Math.round(x/G)*G,ny=Math.round(y/G)*G,key=nx+','+ny;if(key!==lastS){nodes.push([nx,ny]);lastS=key}}}
 const out=[],add=(x,y)=>{if(inb(x,y))out.push(y*W+x)};
 for(let k=0;k<nodes.length-1;k++){let[x,y]=nodes[k];const[tx,ty]=nodes[k+1];
  if(x!==tx&&y!==ty){const hx=k%2?tx:x,hy=k%2?y:ty;while(x!==hx){add(x,y);x+=Math.sign(hx-x)}while(y!==hy){add(x,y);y+=Math.sign(hy-y)}}
  while(x!==tx){add(x,y);x+=Math.sign(tx-x)}while(y!==ty){add(x,y);y+=Math.sign(ty-y)}add(x,y)}
 return out}
function joinStreets(){const isR=i=>(S.b[i]&&S.b[i].t==='road')||S.tiles[i]===BRIDGE;
 const cp=new Int32Array(W*H).fill(-1),sizes=[];let nc=0;
 for(let i=0;i<W*H;i++){if(!isR(i)||cp[i]>=0)continue;const q=[i];cp[i]=nc;for(let h=0;h<q.length;h++){const k=q[h];for(const m of roadNb(k)){if(cp[m]<0){cp[m]=nc;q.push(m)}}}sizes.push(q.length);nc++}
 if(nc<2)return;let main=0;for(let c=1;c<nc;c++)if(sizes[c]>sizes[main])main=c;
 const ds=new Float32Array(W*H).fill(1e9),par=new Int32Array(W*H).fill(-1),bq=[],push=(i,d)=>{(bq[d]||(bq[d]=[])).push(i)};
 for(let i=0;i<W*H;i++)if(cp[i]===main){ds[i]=0;push(i,0)}
 const cost=(i,x,y)=>{const t=S.tiles[i];if(S.b[i]||(t!==GRASS&&t!==SAND&&t!==FOREST))return 0;return(RAILM[i]?6:0)+1};
 for(let d=0;d<bq.length;d++){const Lq=bq[d];if(!Lq)continue;for(const k of Lq){if(ds[k]<d)continue;const x=k%W,y=k/W|0;
  for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const m=ny*W+nx;
   if(isR(m)){if(cp[m]!==main&&ds[m]>d){ds[m]=d;par[m]=k}continue}
   const c=cost(m,nx,ny);if(!c)continue;const nd=d+c;if(nd<ds[m]&&nd<400){ds[m]=nd;par[m]=k;push(m,nd)}}}}
 const best=new Array(nc).fill(-1);for(let i=0;i<W*H;i++){const c=cp[i];if(c<0||c===main||ds[i]>=1e9)continue;if(best[c]<0||ds[i]<ds[best[c]])best[c]=i}
 const order=[...best.keys()].filter(c=>best[c]>=0).sort((a,b)=>ds[best[a]]-ds[best[b]]);
 const free=i=>{const t=S.tiles[i];return isR(i)||(!S.b[i]&&(t===GRASS||t===SAND||t===FOREST))};
  for(const c of order){const path=[];let k=par[best[c]];while(k>=0&&!isR(k)){path.push(k);k=par[k]}if(k<0&&!path.length)continue;
  const a=best[c],e=k>=0?k:path[path.length-1],line=tileLine(a%W,a/W|0,e%W,e/W|0);const use=line.every(free)?line:[a,...path,e];
  for(const t of use){if(isR(t))continue;const r=place('road',t%W,t/W|0,0,true);r.h=1;if(!RAILM[t])DECO[t]=0}linkRoute(use)}}
function ringJunctions(){const isRing=i=>S.b[i]&&S.b[i].k==='ring',road=i=>S.b[i]&&S.b[i].t==='road';
 const adj4=i=>{const x=i%W,y=i/W|0;return D4.some(([dx,dy])=>inb(x+dx,y+dy)&&isRing((y+dy)*W+x+dx))};
 // 1. drop second lanes running alongside the Ring
 for(let pass=0;pass<4;pass++){const cand=new Set();for(const o of S.list){if(o.t!=='road'||!o.h||o.k==='ring')continue;const i=o.y*W+o.x;if(adj4(i))cand.add(i)}
  let n=0;for(const i of cand){const nb=roadNb(i).filter(j=>!isRing(j));if(nb.every(j=>cand.has(j))&&nb.length<=2){const o=S.b[i];S.b[i]=null;S.list.splice(S.list.indexOf(o),1);n++}}if(!n)break}
 // 2. streets that stop one step short of the Ring are joined to it
 for(const o of S.list){if(o.t!=='road'||o.k==='ring')continue;const i=o.y*W+o.x;if(roadNb(i).some(isRing))continue;const x=o.x,y=o.y;let best=-1;
  for(const[dx,dy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const j=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&isRing(j)){best=j;break}}if(best>=0&&roadNb(i).length<=1)linkT(i,best)}}
function pruneSpurs(){for(let pass=0;pass<3;pass++){const ends=[];for(const o of S.list)if(o.t==='road'&&o.h&&o.k!=='ring'){const i=o.y*W+o.x;if(o.x<3||o.y<3||o.x>W-4||o.y>H-4)continue;if(roadNb(i).length<=1)ends.push(i)}
  for(const e of ends){const chain=[e];let prev=-1,cur=e;for(let n=0;n<40;n++){const nb=roadNb(cur).filter(j=>j!==prev);if(nb.length!==1)break;prev=cur;cur=nb[0];if(roadNb(cur).length>2)break;const ob=S.b[cur];if(!ob||!ob.h||ob.k==='ring')break;chain.push(cur)}
   const x=e%W,y=e/W|0,wet=D4.some(([dx,dy])=>inb(x+dx,y+dy)&&S.tiles[(y+dy)*W+x+dx]===WATER);if(chain.length<10||(wet&&chain.length<26))for(const j of chain){const ob=S.b[j];if(ob&&ob.t==='road'&&ob.h){S.b[j]=null;S.list.splice(S.list.indexOf(ob),1)}}}}}
function tileLine(x0,y0,x1,y1){return octi(x0,y0,x1,y1)}
/* ---------- Generalstadtplan 1904 overlay (Stadt Wien, data.wien.gv.at, CC BY 4.0) ---------- */
const PLAN={on:false,srs:'4326',cache:new Map(),loading:0,queue:[],fails:0,warned:false};
const tileF=(E,S_)=>[(G2*S_+W-1+G2*E)/2,(G2*S_+W-1-G2*E)/2+DYN];
const llE=(lat,lon)=>prj(L,lat,lon);
function scrLL(lat,lon,hw,hh){const[E,S_]=llE(lat,lon),[fx,fy]=tileF(E,S_);return[(fx-fy)*hw+cam.x,(fx+fy)*hh+cam.y+hh]}
function invLL(sx,sy,hw,hh){const a=(sx-cam.x)/hw,b=(sy-cam.y-hh)/hh,fx=(a+b)/2,fy=(b-a)/2,E=(fx-fy)/G2,S_=(fx+fy-(W-1))/G2;
 return[L.lat0-S_*L.km/110.57,L.lon0+E*L.km/(Math.cos(L.lat0*Math.PI/180)*111.32)]}
// WGS84 -> MGI / Austria GK East (EPSG:31256), used only if the service refuses plain lat/lon
function toGK(lat,lon){const d=Math.PI/180,aw=6378137,ew=.00669437999014,ab=6377397.155,fb=1/299.1528128,eb=2*fb-fb*fb;
 const ph=lat*d,la=lon*d,Nw=aw/Math.sqrt(1-ew*Math.sin(ph)**2);let X=Nw*Math.cos(ph)*Math.cos(la),Y=Nw*Math.cos(ph)*Math.sin(la),Z_=Nw*(1-ew)*Math.sin(ph);
 const as=Math.PI/648000,rx=5.137*as,ry=1.474*as,rz=5.297*as,sc=1+2.4232e-6;X-=577.326;Y-=90.129;Z_-=463.919;
 const x2=(X+rz*Y-ry*Z_)/sc,y2=(-rz*X+Y+rx*Z_)/sc,z2=(ry*X-rx*Y+Z_)/sc;
 const p=Math.hypot(x2,y2);let pb=Math.atan2(z2,p*(1-eb));for(let k=0;k<6;k++){const N=ab/Math.sqrt(1-eb*Math.sin(pb)**2);pb=Math.atan2(z2+eb*N*Math.sin(pb),p)}
 const lb=Math.atan2(y2,x2),l0=(16+20/60)*d,ep=eb/(1-eb),N=ab/Math.sqrt(1-eb*Math.sin(pb)**2),T=Math.tan(pb)**2,C=ep*Math.cos(pb)**2,A=(lb-l0)*Math.cos(pb);
 const e4=eb*eb,e6=e4*eb,M=ab*((1-eb/4-3*e4/64-5*e6/256)*pb-(3*eb/8+3*e4/32+45*e6/1024)*Math.sin(2*pb)+(15*e4/256+45*e6/1024)*Math.sin(4*pb)-(35*e6/3072)*Math.sin(6*pb));
 const x=N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep)*A**5/120),y=M+N*Math.tan(pb)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep)*A**6/720);
 return[x,y-5000000]}
function planChunk(lv,i,j){const dLa=lv?.024:.006,dLo=lv?.036:.009,la0=L.lat0+j*dLa,lo0=L.lon0+i*dLo,key=`${PLAN.srs}|${lv}|${i}|${j}`;
 let c=PLAN.cache.get(key);if(c)return c;const px=lv?1024:640;c={la0,lo0,la1:la0+dLa,lo1:lo0+dLo,img:null,ok:false,px};
 if(PLAN.srs==='4326')c.url=`https://data.wien.gv.at/daten/wms?service=WMS&request=GetMap&version=1.1.1&layers=GENLPLAN1904OGD&styles=&format=image/jpeg&srs=EPSG:4326&bbox=${lo0},${la0},${lo0+dLo},${la0+dLa}&width=${px}&height=${px}`;
 else{const g=[[la0,lo0],[la0,lo0+dLo],[la0+dLa,lo0],[la0+dLa,lo0+dLo]].map(([a,b])=>toGK(a,b)),xs=g.map(q=>q[0]),ys=g.map(q=>q[1]);c.bb=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  c.url=`https://data.wien.gv.at/daten/wms?service=WMS&request=GetMap&version=1.1.1&layers=GENLPLAN1904OGD&styles=&format=image/jpeg&srs=EPSG:31256&bbox=${c.bb.join(',')}&width=${px}&height=${Math.round(px*(c.bb[3]-c.bb[1])/(c.bb[2]-c.bb[0]))}`}
 PLAN.cache.set(key,c);PLAN.queue.push(c);planPump();return c}
function planPump(){while(PLAN.loading<6&&PLAN.queue.length){const c=PLAN.queue.shift();PLAN.loading++;const im=new Image();
 im.onload=()=>{PLAN.loading--;c.img=im;c.ok=true;PLAN.fails=0;gGV=-1;planPump()};
 im.onerror=()=>{PLAN.loading--;PLAN.fails++;if(PLAN.srs==='4326'&&PLAN.fails>=3){PLAN.srs='31256';PLAN.cache.clear();PLAN.queue.length=0;PLAN.fails=0;gGV=-1}
  else if(PLAN.fails>=6&&!PLAN.warned){PLAN.warned=true;toast('The 1904 plan could not be loaded. It needs an internet connection')}planPump()};im.src=c.url}}
function drawPlan(hw,hh,z){if(!PLAN.on||z<.1)return;const lv=z<.42?1:0,dLa=lv?.024:.006,dLo=lv?.036:.009;
 const cs=[[-gM,-gM],[vw+gM,-gM],[-gM,vh+gM],[vw+gM,vh+gM]].map(([x,y])=>invLL(x,y,hw,hh)),las=cs.map(q=>q[0]),los=cs.map(q=>q[1]);
 const j0=Math.floor((Math.min(...las)-L.lat0)/dLa),j1=Math.floor((Math.max(...las)-L.lat0)/dLa),i0=Math.floor((Math.min(...los)-L.lon0)/dLo),i1=Math.floor((Math.max(...los)-L.lon0)/dLo);
 if((j1-j0+1)*(i1-i0+1)>80)return;
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const c=planChunk(lv,i,j);if(!c.ok)continue;let TL,TR,BL;
  if(PLAN.srs==='4326'){TL=scrLL(c.la1,c.lo0,hw,hh);TR=scrLL(c.la1,c.lo1,hw,hh);BL=scrLL(c.la0,c.lo0,hw,hh)}
  else{const la=(c.la0+c.la1)/2,lo=(c.lo0+c.lo1)/2,g0=toGK(la,lo),gx=toGK(la,lo+.001),gy=toGK(la+.001,lo),a=(gx[0]-g0[0])/.001,b=(gy[0]-g0[0])/.001,cc=(gx[1]-g0[1])/.001,d=(gy[1]-g0[1])/.001,det=a*d-b*cc;
   const back=(X,Y)=>{const dx=X-g0[0],dy=Y-g0[1];return[la+(-cc*dx+a*dy)/det,lo+(d*dx-b*dy)/det]};const[bx0,by0,bx1,by1]=c.bb;
   TL=scrLL(...back(bx0,by1),hw,hh);TR=scrLL(...back(bx1,by1),hw,hh);BL=scrLL(...back(bx0,by0),hw,hh)}
  const w=c.img.naturalWidth,h=c.img.naturalHeight;ctx.save();ctx.globalAlpha=.88;
  ctx.transform((TR[0]-TL[0])/w,(TR[1]-TL[1])/w,(BL[0]-TL[0])/h,(BL[1]-TL[1])/h,TL[0],TL[1]);ctx.drawImage(c.img,0,0);ctx.restore()}}

/* ===================== New York 1865–1916: content ===================== */
const NY_NAMES={harbour:'Steamboat pier',kaffeehaus:'Coffee house',chapel:'Parish church',brick:'Brickyard',sawmill:'Lumber yard',stonewh:'Stone wharf',ironyard:'Iron merchant',coalyard:'Coal yard',weaver:'Textile mill',sheep:'Sheep farm',eislauf:'Skating pond',reitschule:'Riding academy',polizei:'Police precinct',muell:'Street cleaning',kaserne:'Armory',tram:'Horsecar depot',autofabrik:'Automobile works',heuriger:'Beer garden',vineyard:'Wine merchant',garden:'Vegetable garden',grainf:'Grain farm',brewery:'Brewery',woodcutter:'Woodcutter'};
const NY_DESC={stephan:'Trinity Church on Broadway at Wall Street, the tallest building in the city until 1890.',hofburg:'City Hall, home of the Mayor and the Common Council.',market:'A public market like Washington or Fulton Market. Goods are delivered here, and homes nearby can grow.',chapel:'A parish church for the immigrant neighbourhoods. Merchants and clerks want one nearby.',
 brick:'Digs clay on the banks of Greenpoint and Williamsburg and fires bricks for the city.',sawmill:'Lumber arrives by schooner from Maine and down the Hudson. Build on the waterfront.',stonewh:'Barges bring granite from Maine and brownstone from Connecticut. Build on the waterfront.',
 ironyard:'Buys iron from the Pennsylvania ironworks for your builders.',coalyard:'Coal barges from Pennsylvania supply your power stations.',sheep:'Raises sheep for wool, the raw material of the textile mills. Needs open pasture.',weaver:'Spins and weaves wool into cloth for the garment trade. Craftsmen and above want clothing.',
 garden:'Vegetable gardens in Brooklyn and Queens feed the city.',grainf:'Grain for bread and beer.',brewery:'German brewers in Williamsburg turn grain into lager. Craftsmen and above want beer.',woodcutter:'Fells trees in the woods of Brooklyn and upper Manhattan for timber.',
 kaffeehaus:'A coffee house and lunch room. The well-to-do and the Four Hundred want one near their homes.',gaswerk:'Gas light for the streets and homes around it. The rich want it once gas light is invented.',harbour:'A steamboat pier. Its steamer trades your goods along the coast and up the Hudson. Tap it to choose a route.',
 eislauf:'Skating on the Central Park lake was the city\'s favourite winter pleasure from 1858. Residents nearby are happier, especially in winter.',reitschule:'A riding academy for Fifth Avenue society. The well-to-do and the Four Hundred nearby are happier.',
 schule:'A public school of the Board of Education. Craftsmen with a school nearby can become clerks.',polizei:'A police precinct. Keeps the streets safe and catches robbers. Upgrade it to a detective bureau.',muell:'Street cleaning carts. From 1870 homes from craftsmen up want clean streets.',kaserne:'An armory for the National Guard.',
 tram:'Where the cars of your tram lines start: build it beside a line. Horsecars, and electric streetcars once electricity arrives, carry people around, and residents near the lines are happier.',autofabrik:'Builds motor cars, as the first automobile works around New York did. Cars sell for a fortune and fill your streets.',
 spital:'A hospital like Bellevue. Protects nearby residents from epidemics.',feuerwehr:'A fire station of the Metropolitan Fire Department. Puts out fires before they spread.',farm:'Chickens, cows and a barn on Long Island: eggs, milk and meat for the city.',bank:'Earns interest on the savings of the homes within its reach: the more people live there and the richer they are, the more. Robbers love banks: keep one near a police precinct.',heuriger:'A German beer garden like the Atlantic Garden on the Bowery: music, beer and visitors. Needs beer in stock.',vineyard:'Imports French and Rhine wine from the ocean ships, and Hudson Valley wine by river barge. Build on the waterfront.'};
const NY_CAST={
 tweed:{n:()=>'William M. "Boss" Tweed',r:()=>'Grand Sachem of Tammany Hall',y:[1865,1871.9],p:{hair:'#5a4632',st:'side',fh:'full',coat:'#2a2522',chain:1},who:'William M. Tweed, the boss of Tammany Hall: jovial, enormous, generous to his friends and ruthless with city money; he runs New York through patronage, kickbacks and the Irish vote.'},
 olmsted:{n:()=>'Frederick Law Olmsted',r:()=>'designer of Central Park',y:[1865,1895],p:{hair:'#6b5a46',st:'side',fh:'full',coat:'#3a3530'},who:'Frederick Law Olmsted, landscape architect of Central Park: idealistic, stubborn, convinced that a great park makes better citizens, and at war with politicians who want patronage jobs in it.'},
 roebling:{n:()=>'Washington Roebling',r:()=>'chief engineer of the Brooklyn Bridge',y:[1869.5,1883.5],p:{hair:'#3a2a1e',st:'side',fh:'moustache',coat:'#2a2522'},who:'Washington Roebling, who took over the Brooklyn Bridge after his father\'s death: brilliant, exhausted, crippled by the bends from the caissons, determined to finish at any cost.'},
 vanderbilt:{n:()=>'Cornelius Vanderbilt',r:()=>'the Commodore, railroad king',y:[1865,1877],p:{hair:'#e8e2d6',st:'side',fh:'mutton',coat:'#1d1b1a',bow:1},who:'Commodore Cornelius Vanderbilt, the richest man in America: blunt, crude, shrewd; he owns the New York Central and wants a grand depot on 42nd Street.'},
 edison:{n:()=>'Thomas Edison',r:()=>'inventor',y:[1878,1916],p:{hair:'#6b5a46',st:'side',coat:'#2a2522',bow:1},who:'Thomas Alva Edison, the Wizard of Menlo Park: brash, competitive, a showman; he wants to light New York with direct current from his stations.'},
 tesla:{n:()=>'Nikola Tesla',r:()=>'inventor',y:[1884.5,1916],p:{hair:'#1d1b1a',st:'side',fh:'moustache',coat:'#1d1b1a',bow:1},who:'Nikola Tesla, a Serbian-American inventor: visionary, elegant, eccentric; he believes alternating current will power the world.'},
 riis:{n:()=>'Jacob Riis',r:()=>'reporter and photographer',y:[1888,1914],p:{hair:'#6b5a46',st:'side',fh:'moustache',coat:'#2a2522',glasses:1},who:'Jacob Riis, a Danish immigrant reporter who photographs the tenements of the Lower East Side: passionate, moralizing, determined to make the city see how the other half lives.'},
 roosevelt:{n:()=>'Theodore Roosevelt',r:()=>'reformer, Police Commissioner from 1895',y:[1882,1916],p:{hair:'#6b4f2e',st:'side',fh:'moustache',coat:'#3a3530',glasses:1},who:'Theodore Roosevelt: energetic, loud, fearless, a reformer who walks the streets at night to catch lazy policemen and loves a fight with Tammany.'},
 morgan:{n:()=>'J. P. Morgan',r:()=>'banker',y:[1871,1913],p:{hair:'#8a8378',st:'bald',fh:'walrus',coat:'#1d1b1a'},who:'John Pierpont Morgan, the most powerful banker in America: gruff, private, used to dictating terms; he can save a bank panic or let it burn.'}};
const NY_QUESTS=[
 {id:'nyfire',at:[1866,1],who:'🚒 The Metropolitan Fire Department',role:'paid firemen since 1865',text:'The volunteer companies are gone and the city burns every winter: give us two modern fire stations.',short:'build two fire stations',goal:{type:'build',k:'feuerwehr',n:2},due:[1868,6],rew:{prest:20}},
 {id:'olmsted',at:[1866,4],who:'🌳 Frederick Law Olmsted',role:'designer of Central Park',text:'Central Park needs its visitors: run a horsecar line up the avenues so the people can reach it.',short:'build a horsecar depot',goal:{type:'build',k:'tram',n:1},due:[1868,6],rew:{prest:20,site:'stadtpark'}},
 {id:'homes',at:[1866,9],who:'🏛️ The Common Council',role:'city council',text:'Immigrants arrive by the thousand at Castle Garden: sell four new building lots.',short:'sell four building lots',goal:{type:'build',k:'house4',n:4},due:[1867,12],rew:{gold:1000,prest:10}},
 {id:'roebling',at:[1870,1],who:'🌉 Washington Roebling',role:'chief engineer of the Brooklyn Bridge',text:'My father died before the first stone was laid. Deliver 150 iron for the cables of his bridge.',short:'deliver 150 iron',goal:{type:'deliver',g:{iron:150}},due:[1872,1],rew:{prest:25,site:'reichsbruecke'}},
 {id:'docks',at:[1870,6],who:'⚓ General George B. McClellan',role:'engineer-in-chief of the new Department of Docks',text:'The wooden piers along South Street are rotting: open a steamboat pier.',short:'open a steamboat pier',goal:{type:'build',k:'harbour',n:1},due:[1872,9],rew:{gold:800,prest:10}},
 {id:'edison',at:[1883,1],who:'💡 Thomas Edison',role:'inventor',text:'My Pearl Street Station lights a few blocks. Build a power station and let me light the city.',short:'build a power station',goal:{type:'finish',k:['kraftwerk']},due:[1887,1],rew:{gold:2000,prest:20}},
 {id:'riis',at:[1891,3],who:'📷 Jacob Riis',role:'reporter and photographer',text:'I have photographed how the other half lives. Make New York happier: reach 70%.',short:'reach 70% happiness',goal:{type:'hap',v:.7},due:[1894,1],rew:{prest:25},fail:{unrest:60}},
 {id:'waring',at:[1895,2],who:'🧹 Colonel George E. Waring Jr.',role:'Street Cleaning Commissioner',text:'My White Wings will sweep every street: give me two street cleaning depots.',short:'build two street cleaning depots',goal:{type:'build',k:'muell',n:2},due:[1897,6],rew:{prest:20}},
 {id:'teddyq',at:[1895,6],who:'🎖️ Theodore Roosevelt',role:'Police Commissioner',text:'Bully! Give me two police stations and I\'ll clean up this town.',short:'build two police stations',goal:{type:'build',k:'polizei',n:2},due:[1897,6],rew:{prest:20}},
 {id:'parsons',at:[1900,3],who:'🚇 William Barclay Parsons',role:'chief engineer of the Rapid Transit Commission',text:'The subway will run from City Hall to Harlem: deliver 200 iron for rails and tunnels.',short:'deliver 200 iron',goal:{type:'deliver',g:{iron:200}},due:[1902,6],rew:{gold:2500,prest:25}},
 {id:'veiller',at:[1901,4],who:'🏚️ Lawrence Veiller',role:'secretary of the Tenement House Commission',text:'The new law gives every room a window. Show it works: reach 65% happiness.',short:'reach 65% happiness',goal:{type:'hap',v:.65},due:[1904,1],rew:{prest:25},fail:{unrest:40}},
 {id:'catskill',at:[1905,6],who:'💧 The Board of Water Supply',role:'builders of the Catskill Aqueduct',text:'We are bringing water 92 miles from the Catskills: deliver 200 stone for the aqueduct.',short:'deliver 200 stone',goal:{type:'deliver',g:{stone:200}},due:[1908,1],rew:{gold:2000,prest:20}},
 {id:'mckinney',at:[1881,3],who:'🩺 Dr. Susan McKinney Steward',role:'New York State\'s first Black woman physician',text:'Mr. Mayor, with the women of Brooklyn I am founding a hospital and dispensary for women and children, whoever they are and whatever they can pay. Build us a hospital.',short:'build a hospital',goal:{type:'build',k:'spital',n:1,more:1},due:[1884,1],rew:{prest:15}},
 {id:'wald',at:[1893,9],who:'🩺 Lillian Wald',role:'Henry Street Settlement',text:'Mr. Mayor, our nurses climb the tenement stairs of the Lower East Side to the sick who can pay nothing. A hospital nearer their homes would save hundreds.',short:'build a hospital',goal:{type:'build',k:'spital',n:1,more:1},due:[1896,6],rew:{prest:15}},
 {id:'payton',at:[1904,6],who:'🏠 Philip A. Payton Jr.',role:'Afro-American Realty Company',text:'Mr. Mayor, the new apartment houses of Harlem stand half empty, while Black families pay double for the worst rooms in the Tenderloin. My company leases them and lets them to our people. Sell four building lots so the city has more homes.',short:'sell four building lots',goal:{type:'build',k:'house4',n:4,more:1},due:[1906,6],rew:{gold:1200,prest:15}},
 {id:'perkins',at:[1911,4],who:'🔥 Frances Perkins',role:'Committee on Safety',text:'146 died in the Triangle fire. Give the city two more fire stations.',short:'build two more fire stations',goal:{type:'build',k:'feuerwehr',n:2,more:1},due:[1913,4],rew:{prest:30}}];
/* small goals at the left edge: no letter to accept, they simply give direction; missing a deadline costs nothing */
const NY_GOALS=[
 {id:'g_fire',quiet:1,i:'🚒',at:[1865,5],due:[1870,1],who:'🚒 The Metropolitan Fire Department',role:'paid firemen since 1865',short:'Build a fire station',text:'The new paid Metropolitan Fire Department needs its first station.',goal:{type:'build',k:'feuerwehr',n:1},rew:{gold:300,prest:5}},
 {id:'g_house',quiet:1,i:'🧳',at:[1865,5],due:[1868,1],who:'🧳 Castle Garden',role:'the immigrant landing depot at the Battery',short:'House 10,000 newcomers',text:'After the war immigrants land at Castle Garden by the hundred thousand: give them homes.',goal:{type:'grow',n:10000},rew:{gold:500,prest:5}},
 {id:'g_health',quiet:1,i:'🏥',at:[1866,1],due:[1869,1],who:'🏥 The Metropolitan Board of Health',role:'founded in 1866',text:'Cholera reached the harbour in 1866: the new Board of Health wants a hospital.',short:'Build a hospital',goal:{type:'build',k:'spital',n:1},rew:{prest:10}},
 {id:'g_market',quiet:1,i:'⚖️',at:[1866,6],due:[1872,1],who:'⚖️ The Common Council',role:'city council',short:'Open a public market',text:'Washington and Fulton Market are packed from dawn: open a market uptown.',goal:{type:'build',k:'market',n:1},rew:{gold:400}},
 {id:'g_million',quiet:1,i:'👥',at:[1868,1],due:[1880,6],who:'👥 The census',role:'counted every ten years',short:'Reach 1,000,000 people',text:'The 1880 census counted 1,206,299 New Yorkers.',goal:{type:'pop',n:1000000},rew:{prest:30}},
 {id:'g_lumber',quiet:1,i:'🪵',at:[1865,7],due:[1867,1],who:'🪵 The lumber dealers',role:'timber rafted down the Hudson',short:'Open a lumber yard',text:'Timber rafts come down the Hudson to the West Side yards.',goal:{type:'build',k:'sawmill',n:1},rew:{gold:200}},
 {id:'g_brick',quiet:1,i:'🧱',at:[1865,9],due:[1867,6],who:'🧱 The brickmakers',role:'clay pits of Greenpoint and Williamsburg',short:'Open a brickyard',text:'After the great fires New York builds in brick, dug from the clay of Greenpoint.',goal:{type:'build',k:'brick',n:1},rew:{gold:300}},
 {id:'g_church',quiet:1,i:'⛪',at:[1867,3],due:[1871,1],who:'⛪ The parishes',role:'Catholic, Episcopal, Lutheran and Dutch Reformed',short:'Build a parish church',text:'Every new neighbourhood wants its own parish church.',goal:{type:'build',k:'chapel',n:1},rew:{prest:10}},
 {id:'g_iron',quiet:1,i:'⚙️',at:[1868,1],due:[1872,1],who:'⚙️ The iron founders',role:'cast-iron fronts for Broadway',short:'Open an iron merchant',text:'The new stores on Broadway have cast-iron fronts.',goal:{type:'build',k:'ironyard',n:1},rew:{gold:400}},
 {id:'g_brew',quiet:1,i:'🍺',at:[1868,6],due:[1872,6],who:'🍺 The German brewers',role:'lager beer from Williamsburg',short:'Brew lager',text:'Since the Germans came, New York drinks lager.',goal:{type:'build',k:'brewery',n:1},rew:{gold:400}},
 {id:'g_skate',quiet:1,i:'⛸️',at:[1868,11],due:[1872,1],who:'⛸️ The skating clubs',role:'the skating mania of the 1860s',short:'Open a skating pond',text:'When the pond freezes, forty thousand New Yorkers come out on skates.',goal:{type:'build',k:'eislauf',n:1},rew:{prest:10}},
 {id:'g_depot',quiet:1,i:'🚂',at:[1869,6],due:[1874,1],who:'🚂 The railroads',role:'the New York Central and the New Haven',short:'Build a railway station',text:'Vanderbilt opens Grand Central Depot in 1871: give the trains a station.',goal:{type:'build',k:'bahnhof',n:1},rew:{gold:800,prest:10}},
 {id:'g_bank',quiet:1,i:'🏦',at:[1870,1],due:[1876,1],who:'🏦 Wall Street',role:'the banks and brokers',short:'Open a bank',text:'The money of the whole country flows through Wall Street.',goal:{type:'build',k:'bank',n:1},rew:{prest:10}},
 {id:'g_police',quiet:1,i:'👮',at:[1871,1],due:[1875,1],who:'👮 The Metropolitan Police',role:'the precincts of the city',short:'Build a police precinct',text:'The Orange riot of 1871 left sixty dead on Eighth Avenue.',goal:{type:'build',k:'polizei',n:1},rew:{prest:10}},
 {id:'g_coal',quiet:1,i:'⚫',at:[1872,1],due:[1876,1],who:'⚫ The coal dealers',role:'anthracite from Pennsylvania',short:'Open a coal yard',text:'Every stove, steamboat and gasworks burns Pennsylvania coal.',goal:{type:'build',k:'coalyard',n:1},rew:{gold:400}},
 {id:'g_cent',quiet:1,i:'🎆',at:[1875,6],due:[1876,7],who:'🎆 The Centennial committee',role:'a hundred years of independence',short:'Reach 👑 100 prestige',text:'On 4 July 1876 America turns one hundred.',goal:{type:'prest',n:100},rew:{gold:1000}},
 {id:'g_tenement',quiet:1,i:'🏘️',at:[1879,6],due:[1884,1],who:'🏘️ The tenement builders',role:'after the Tenement House Act of 1879',short:'House 50,000 newcomers',text:'The 1879 law brings the dumbbell tenement, and the immigrants keep coming.',goal:{type:'grow',n:50000},rew:{gold:1500,prest:10}},
 {id:'g_gas',quiet:1,i:'🔥',at:[1880,1],who:'🔥 The gas companies',role:'Manhattan, New York and Harlem Gas Light',short:'Light the streets with gas',text:'In 1884 six gas companies merge into Consolidated Gas. Research gas light, then build a gasworks.',goal:{type:'finish',k:['gaswerk']},rew:{gold:800,prest:10}},
 {id:'g_clean',quiet:1,i:'🧹',at:[1881,6],due:[1886,1],who:'🧹 The Department of Street Cleaning',role:'founded in 1881',short:'Clean the streets',text:'In 1881 the city founds a Department of Street Cleaning.',goal:{type:'build',k:'muell',n:1},rew:{prest:10}},
 {id:'g_hosp2',quiet:1,i:'🏥',at:[1892,1],due:[1894,1],who:'🏥 The Board of Health',role:'typhus and cholera in 1892',short:'Run two hospitals',text:'In 1892 typhus and cholera arrive on the steamships.',goal:{type:'build',k:'spital',n:2},rew:{prest:15}},
 {id:'g_greater',quiet:1,i:'🗽',at:[1890,1],due:[1898,1],who:'🗽 Andrew Haswell Green',role:'father of Greater New York',short:'Reach 2,000,000 people',text:'On 1 January 1898 the five boroughs become Greater New York.',goal:{type:'pop',n:2000000},rew:{prest:30}},
 {id:'g_cars',quiet:1,i:'🚗',at:[1900,11],due:[1910,1],who:'🚗 The Automobile Club of America',role:'the first auto show, Madison Square Garden 1900',short:'Build an automobile works',text:'The first automobile show fills Madison Square Garden in 1900.',goal:{type:'finish',k:['autofabrik']},rew:{gold:2000,prest:15}},
 {id:'g_power2',quiet:1,i:'⚡',at:[1904,1],due:[1910,1],who:'⚡ The New York Edison Company',role:'electric light for every street',short:'Run two power stations',text:'The subway, elevators and trolleys all run on current.',goal:{type:'build',k:'kraftwerk',n:2},rew:{gold:2000,prest:15}},
 {id:'g_3m',quiet:1,i:'👥',at:[1902,1],due:[1910,6],who:'👥 The census',role:'counted every ten years',short:'Reach 3,000,000 people',text:'The 1910 census counts almost four million in Manhattan and Brooklyn.',goal:{type:'pop',n:3000000},rew:{prest:30}},
 {id:'g_prest',quiet:1,i:'👑',at:[1911,1],due:[1916,12],who:'👑 The city\'s reputation',role:'the capital of the world',short:'Reach 👑 600 prestige',text:'By 1916 New York is the capital of the world.',goal:{type:'prest',n:600},rew:{gold:5000}}];
/* the great landmarks become goals once they are unlocked: build them before history did */
const lmGoals=L0=>(L0.landmarks||[]).filter(e=>e.due).map(e=>({id:'lm_'+e.k,quiet:1,lm:e.k,at:[e.need.year||1865,1],due:e.due,goal:{type:'finish',k:[e.k]},rew:{},need:()=>lmNeedOK(e)&&!S.list.some(o=>o.t===e.k),
 get i(){return B[e.k].i},get who(){return`${B[e.k].i} History`},role:'a landmark of the real city',get short(){const n=B[e.k].n;return`Build ${/^(St\. |Central Park|Carnegie|Grand Central)/.test(n)?'':'the '}${SHORTN[n]||n}`},
 get text(){const d=`${MON[e.due[1]-1]} ${e.due[0]}`;return S&&S.t>=yT(...e.due)?`The real one opened in ${d}. Your city still has none. Build it now.`:`The real one opened in ${d}. Build yours sooner for 👑 +40.`}}));const LM_GOALS=lmGoals(LEVELS.nyc1865);
const NY_AUD=[
 ['⚓ Irish longshoremen','The dockworkers of the East River piers ask for higher wages.',[['Grant it: −800 $, the city is happier for a year',()=>{S.stock.gold-=800;S.good=S.t+YEAR}],['Refuse: the docks grumble',()=>{S.unrest=(S.unrest||0)+40}]]],
 ['🎩 Tammany ward bosses','The ward bosses want city jobs for their men.',[['Hand out the jobs: +1,500 $ in "contributions", corruption grows',()=>{S.stock.gold+=1500;E_({cor:15})}],['Hire on merit',()=>E_({cor:-5,rev:5})]]],
 ['🚂 The Commodore\'s agents','Vanderbilt wants a franchise for a grand rail depot on 42nd Street.',[['Grant it: 👑 +10, but the neighbours complain about smoke',()=>{S.prest+=10;S.bad=S.t+YEAR/2}],['Refuse',()=>{}]]],
 ['⛪ Archbishop McCloskey','The Archbishop asks for help with parish schools for immigrant children.',[['Donate 600 $: 👑 +10, churches are cheaper for a year',()=>{S.stock.gold-=600;S.prest+=10;S.churchSale=S.t+YEAR}],['Decline politely: 👑 −3',()=>{S.prest=Math.max(0,S.prest-3)}]]],
 ['💎 Mrs. Astor\'s circle','The Four Hundred ask you to keep tenements away from Fifth Avenue.',[['Agree: Fifth Avenue lots sell 20% higher for two years',()=>{S.boom=S.t+YEAR*2;E_({rev:5})}],['Refuse',()=>{}]]],
 ['🔧 A young inventor','A man named Tesla shows you a motor that runs on alternating current and asks for money.',[['Fund him: −1,000 $, your next research is free',()=>{S.stock.gold-=1000;S.rfree=(S.rfree||0)+1}],['Send him away',()=>{}]]]];
function OLD_drawLiberty(cx,cy,hw,hh){const t=hw/4,t2=hh/4,tx=t>=4.5;poly([cx-hw*.95,cy,cx,cy-hh*.95,cx+hw*.95,cy,cx,cy+hh*.95],'#b9b2a2');
 for(let i=0;i<11;i++){const a=i/11*Math.PI*2,r=i%2?.9:1.5;ctx.fillStyle='#9e9787'}poly([cx-1.4*t,cy,cx,cy-.7*t2*2,cx+1.4*t,cy,cx,cy+.7*t2*2],'#a8a191');
 const blk=(y0,a,h,cl,cr,ct)=>{const L_=[cx-a*t,y0],C=[cx,y0+a*t2],R_=[cx+a*t,y0],T=[cx,y0-a*t2];poly([L_[0],L_[1],C[0],C[1],C[0],C[1]-h,L_[0],L_[1]-h],cl);poly([C[0],C[1],R_[0],R_[1],R_[0],R_[1]-h,C[0],C[1]-h],cr);poly([L_[0],L_[1]-h,C[0],C[1]-h,R_[0],R_[1]-h,T[0],T[1]-h],ct)};
 blk(cy,.8,1.5*t,'#c9c1ae','#aaa290','#d9d2c2');blk(cy-1.5*t,.58,1.1*t,'#d4ccb9','#b4ac99','#e3dccb');ctx.strokeStyle='rgba(80,70,55,.35)';ctx.lineWidth=Math.max(.5,t*.03);for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(cx-.8*t,cy-i*.37*t);ctx.lineTo(cx,cy+.8*t2-i*.37*t);ctx.lineTo(cx+.8*t,cy-i*.37*t);ctx.stroke()}
 const by=cy-2.6*t,g='#6aa58e',gd='#4f8a75';ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx-.42*t,by);ctx.quadraticCurveTo(cx-.5*t,by-1.4*t,cx-.25*t,by-2.4*t);ctx.lineTo(cx+.25*t,by-2.4*t);ctx.quadraticCurveTo(cx+.5*t,by-1.4*t,cx+.42*t,by);ctx.fill();
 ctx.fillStyle=gd;ctx.beginPath();ctx.moveTo(cx,by);ctx.quadraticCurveTo(cx+.45*t,by-1.4*t,cx+.25*t,by-2.4*t);ctx.lineTo(cx+.1*t,by-2.4*t);ctx.quadraticCurveTo(cx+.2*t,by-1.2*t,cx,by);ctx.fill();
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,by-2.65*t,.22*t,0,7);ctx.fill();ctx.strokeStyle=g;ctx.lineWidth=Math.max(1,t*.08);ctx.beginPath();for(let i=0;i<7;i++){const a=-Math.PI*.95+i*Math.PI*.9/6;ctx.moveTo(cx+Math.cos(a)*.2*t,by-2.75*t+Math.sin(a)*.2*t);ctx.lineTo(cx+Math.cos(a)*.42*t,by-2.75*t+Math.sin(a)*.42*t)}ctx.stroke();
 ctx.lineWidth=Math.max(1,t*.13);ctx.beginPath();ctx.moveTo(cx+.2*t,by-2.2*t);ctx.lineTo(cx+.45*t,by-3.3*t);ctx.stroke();ctx.fillStyle='#d9a92a';ctx.beginPath();ctx.ellipse(cx+.47*t,by-3.45*t,.1*t,.16*t,0,0,7);ctx.fill();
 ctx.fillStyle=gd;ctx.fillRect(cx-.35*t,by-1.9*t,.2*t,.35*t)}
function drawFlatiron(cx,cy,hw,hh){const t=hw/4,t2=hh/4,H=6.2*t,A=[cx-1.6*t,cy+.2*t2*2],Bp=[cx+1.5*t,cy-.4*t2*2],C=[cx+.2*t,cy+1.4*t2*2];
 const side=(p,q,col)=>{poly([p[0],p[1],q[0],q[1],q[0],q[1]-H,p[0],p[1]-H],col);ctx.strokeStyle='rgba(60,50,40,.35)';ctx.lineWidth=Math.max(.5,t*.03);for(let f=1;f<22;f++){const y=f/22*H;ctx.beginPath();ctx.moveTo(p[0],p[1]-y);ctx.lineTo(q[0],q[1]-y);ctx.stroke()}
  ctx.fillStyle='rgba(50,60,70,.55)';const n=Math.max(3,Math.round(Math.hypot(q[0]-p[0],q[1]-p[1])/(t*.22)));for(let i=1;i<n;i++){const u=i/n,x=p[0]+(q[0]-p[0])*u,y=p[1]+(q[1]-p[1])*u;for(let f=2;f<21;f+=1)ctx.fillRect(x-.03*t,y-f/22*H-.12*t,.06*t,.1*t)}};
 side(A,C,'#e3d6bd');side(C,Bp,'#cbbd9f');poly([A[0],A[1]-H,C[0],C[1]-H,Bp[0],Bp[1]-H],'#b3a487');ctx.fillStyle='#8a7d64';poly([A[0],A[1]-H,C[0],C[1]-H,Bp[0],Bp[1]-H,Bp[0],Bp[1]-H-.25*t,C[0],C[1]-H-.25*t,A[0],A[1]-H-.25*t],'#9c8e72')}
function drawBridgeTower(cx,cy,hw,hh){const t=hw/4,t2=hh/4,tx=t>=4.5;prismTex(cx,cy,.9,.45,4.2*t,7,3,'#8a8170',.05,t,t2,tx);
 for(const dx of[-.42,.28]){const x=cx+dx*t*1.6,y=cy+dx*t2*1.6-2.6*t;ctx.fillStyle='#3a3530';ctx.beginPath();ctx.moveTo(x-.22*t,y+1.5*t);ctx.lineTo(x-.22*t,y);ctx.quadraticCurveTo(x,y-.55*t,x+.22*t,y);ctx.lineTo(x+.22*t,y+1.5*t);ctx.fill()}
 ctx.strokeStyle='#5a5f66';ctx.lineWidth=Math.max(.7,t*.05);for(const s_ of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s_*.5*t,cy-4.1*t);ctx.quadraticCurveTo(cx+s_*2.6*t,cy-1.4*t,cx+s_*4.2*t,cy+.2*t);ctx.stroke();for(let i=1;i<6;i++){const u=i/6,x=cx+s_*(.5+3.7*u)*t,y=cy-4.1*t+(4.3*u*u)*t*.98;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,cy-.6*t+u*.8*t);ctx.stroke()}}}

/* ===================== challenge · Chicago · research · ships · war ===================== */
const COV={kaffee:null,fire:null,hosp:null,gas:null,elec:null,tram:null},COVK={bahnhof:'rail',kaffeehaus:'kaffee',sperl:'kaffee',feuerwehr:'fire',spital:'hosp',gaswerk:'gas',kraftwerk:'elec',tram:'tram',polizei:'police',schule:'school',muell:'trash',eislauf:'rink',reitschule:'ride',bank:'bank'};COV.school=COV.police=COV.trash=COV.rink=COV.ride=COV.rail=COV.bank=null;
const RES=()=>S.res||(S.res={});
function covCompute(){for(const k in COV)COV[k]=new Uint8Array(W*H);
 if(TRAMM&&cnt('tram'))for(let i=0;i<W*H;i++)if(TRAMM[i]){const x=i%W,y=i/W|0;for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++){const nx=x+dx,ny=y+dy;if(inb(nx,ny)&&dx*dx+dy*dy<=49)COV.tram[ny*W+nx]=1}}
 for(const o of S.list){const k=COVK[o.t];if(!k||o.r||o.bld||!o.c)continue;if(k==='rail'&&!(o.main||o.np))continue;if(k==='elec'&&S.stock.coal<1)continue;let R=B[o.t].radius;if(k==='tram'&&RES().electric)R*=1.5;if(k==='kaffee'&&RES().freud)R*=1.4;if(k==='hosp'&&RES().hygiene)R*=1.4;if(k==='hosp'&&RES().clinic)R*=1.2;if(UPG[o.t])R*=radMul(o);
  const[cx,cy]=fc(o),r=Math.ceil(R);for(let y=Math.max(0,Math.floor(cy-r));y<=Math.min(H-1,cy+r);y++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(W-1,cx+r);x++)if(Math.hypot(x-cx,y-cy)<=R)COV[k][y*W+x]=1}
 bankHomes()}
/* a bank lives on the homes round it: every home within its reach saves there, and the city's interest is a share (sav) of that
   home's rent. A home that several banks reach splits its savings between them, so two banks side by side earn no more than one.
   BKH: each working bank's homes, as pairs of the home and the number of banks that reach it */
const BKH=new Map(),BKC=new Map();
function bankHomes(){BKH.clear();BKC.clear();const bs=S.list.filter(o=>B[o.t].sav&&!o.r&&!o.bld&&o.c);if(!bs.length)return;for(const b of bs)BKH.set(b,[]);
 const at=[];for(const h of S.list){if(h.t!=='house'||h.r)continue;at.length=0;for(const b of bs){const[cx,cy]=fc(b);if(Math.hypot(h.x-cx,h.y-cy)<=B[b.t].radius)at.push(b)}
  if(at.length)BKC.set(h,at.length);for(const b of at)BKH.get(b).push(h,at.length)}}
const bankN=o=>{const a=BKH.get(o);return a?a.length/2:0};
/* what a new bank on the lot at gx,gy would earn per minute as the city stands: its share of every home it would reach */
function bankAt(gx,gy){const d=B.bank,cx=gx+(d.foot-1)/2,cy=gy+(d.foot-1)/2;let v=0;for(const h of S.list){if(h.t!=='house'||h.r||h.bld||!(h.pop>0)||Math.hypot(h.x-cx,h.y-cy)>d.radius)continue;v+=h.pop*LV[h.lvl].tax/((BKC.get(h)||0)+1)}return v*60*d.sav}
/* the interest of one bank, per minute (older cities without reach keep the flat sum) */
function bankInc(o){if(!L.y1857)return 60;const a=BKH.get(o);if(!a)return 0;let v=0;for(let i=0;i<a.length;i+=2){const h=a[i];if(h.pop>0&&!h.bld&&LV[h.lvl])v+=h.pop*LV[h.lvl].tax/a[i+1]}return v*60*B[o.t].sav}
/* the finished landmarks, for the homes that want one near them (looked up once a second of the game) */
let LMN=null,LMNT=-1,LMNS=null;
function lmNear(o,R){const t=Math.floor(S.t);if(LMNS!==S||LMNT!==t){LMNS=S;LMNT=t;LMN=S.list.filter(q=>B[q.t]&&B[q.t].lm&&!q.bld&&!q.wr&&!q.r)}
 return LMN.some(q=>{const c=fc(q);return Math.hypot(c[0]-o.x-1,c[1]-o.y-1)<=R})}
/* what a home asks for before it rises a stage: goods, then the services of a better street (a school and police for the clerks, a
   fire station and a hospital for the merchants, the tram and a landmark for the grand merchants). A row names the building that gives it, or the good,
   so the home's card can offer it. These only hold a rise back: a home that is already higher stays */
/* how high Vienna's house must be built before its people rise, said as what to do: how many times more, and the year from which the last
   of them may be built */
function tierAsk(o,tr){const t0=o.tier||0,n=tr-t0;if(n<=0)return'the house is high enough';const yr=Y0+S.t/YEAR;let late=0;for(let k=t0+1;k<=tr;k++){const y=TIERS_VI[k].yr;if(y&&yr<y)late=y}
 return`build the house higher${n>1?` ${n} times`:''}${t0<5&&tr>=5&&!RES().electric?' (research electric power first)':late?` (${n>1?'the last time ':''}only from ${late})`:''}`}
function nextStage(o){if(o.t!=='house'||o.h||o.lvl>=5)return null;const a=o.y*W+o.x,c=(o.y+2)*W+o.x+2,st=S.stock,cv=k=>!!(COV[k]&&(COV[k][a]||COV[k][c])),L_=o.lvl,rq=[],hp=STAGEH[L_],tr=NYC()?0:STAGET[L_];
 rq.push([o.pop>=maxPop(o),`the home is full (${o.pop}/${maxPop(o)} residents)`]);rq.push([(o.hap??1)>=hp,`happiness at least ${Math.round(hp*100)}% (now ${Math.round((o.hap??1)*100)}%)`]);
 if(tr)rq.push([(o.tier||0)>=tr,tierAsk(o,tr),'tier']);
 const cost={1:{bricks:6},2:{bricks:10,wood:4},3:{bricks:14,stone:8},4:{bricks:20,stone:14}}[L_];
 if(L_===1){rq.push([!!(mk[a]||mk[c]),'a market nearby','market']);rq.push([st.beer>=1,'beer in stock',0,'beer']);if(S.scratch&&breadOn())rq.push([st.bread>=1,'bread in stock',0,'bread'])}
 if(L_===2){rq.push([st.cloth>=1,'clothing in stock',0,'cloth']);rq.push([cv('school'),'a school nearby','schule']);rq.push([cv('police'),'a police station nearby','polizei'])}
 if(L_===3){rq.push([!!(ch[a]||ch[c]),'a church nearby','chapel']);rq.push([st.wine>=1,'wine in stock',0,'wine']);rq.push([cv('fire'),'a fire station nearby','feuerwehr']);rq.push([cv('hosp'),'a hospital nearby','spital'])}
 if(L_===4){rq.push([cv('kaffee'),'a coffeehouse nearby','kaffeehaus']);rq.push([cv('tram'),'a tram line or tram depot nearby','tram']);rq.push([lmNear(o,45),'a finished landmark nearby','lm']);const y=ECO().top;if(y&&!tr)rq.push([Y0+S.t/YEAR>=y,`not before ${y}`])}
 for(const g in GX)if(GX[g][1]===L_+1&&goodOn(g))rq.push([st[g]>=1,`${g} in stock`,0,g]);
 for(const g in cost)rq.push([st[g]>=cost[g],`${cost[g]} ${g} for the renovation`,0,g]);
 return{to:LV[L_+1].n,rq,cost,ok:rq.every(q=>q[0])}}
/* how happy a home must be before it rises (by the stage it leaves), and how high Vienna's house must be built first (the index in
   TIERS_VI): the clerks come with the courtyard wing of 1867, the Bürger with the fifth storey of 1883, the grand Bürger with the
   Secession house of 1898, so the rise of a street fills the whole reign */
const STAGEH={1:.7,2:.75,3:.8,4:.9},STAGET={2:2,3:4,4:6};
/* the goods of a better home: the works that make each, and the stage that wants it. A save from before them gets a year's grace
   (S.g2At), and the tutorial teaches without them */
const GX={meat:['fleischer',2],coffee:['roester',3],furniture:['tischler',4],porcelain:['porzellan',5]},GXK={fleischer:1,roester:1,tischler:1,porzellan:1};
const goodOn=g=>!NYC()&&!!ECO()[g]&&S.t>=(S.g2At||0)&&!(typeof tgOn==='function'&&tgOn());
function g2Init(grace){if(NYC()||!ECO().meat)return;for(const g in GX)if(S.stock[g]==null)S.stock[g]=0;if(S.g2At==null)S.g2At=grace?S.t+YEAR:0}
/* Vienna's bread: wanted from the craftsmen up once the city has bakeries to build (a save from before them gets a year's grace, S.breadAt) */
const breadOn=()=>!!ECO().bread&&S.t>=(S.breadAt||0);
/* the mill: a ship mill moored at a bank while the Danube runs wild, a steam mill anywhere on land once the regulation is finished
   (the floating mills of the river leave with it, harbour.js), and from 1876 in any case, as the real regulation was done in 1875 */
const millShip=()=>Y0+S.t/YEAR<1876&&!S.list.some(o=>o.t==='regulierung'&&!o.bld);
function millOn(){const sh=millShip();if(B.mill.n===(sh?'Ship mill':'Steam mill'))return;B.mill.on=sh?'coast':'land';B.mill.n=sh?'Ship mill':'Steam mill';B.mill.i=sh?'\uE001':'🏭';
 B.mill.d=sh?'A floating mill moored at the Danube bank: the current turns its wheel and grinds wheat and rye from the grain farms into flour for the bakeries. Build it on the riverbank.':'A steam mill of brick with its tall chimney: since the regulation the ship mills are gone from the Danube. Grinds wheat and rye from the grain farms into flour for the bakeries.'}
/* a yes or no the player is shown (a good is there, a store runs short) turns only once it has held for most of the last seconds:
   a store that hovers at one loaf must not switch every sign, card and face on and off with each delivery. Counted in the time of
   the game, stretched by the speed, so it is the same few seconds on the clock at every speed */
let STDS=null,STD={};
function steady(key,v,sure){if(STDS!==S){STDS=S;STD={}}let h=STD[key];if(!h){STD[key]=h={on:v,v:v?1:0,t:S.t};return v}
 const dt=Math.max(0,S.t-h.t);h.t=S.t;if(sure){h.v=v?1:0;h.on=v;return v}
 h.v+=((v?1:0)-h.v)*Math.min(1,dt/(6*(SPEEDS[spd]||1)));h.on=h.on?h.v>.3:h.v>.7;return h.on}
/* a good the homes need is there: at once when the stores hold a few of it, else only after it has stayed */
const hasGood=g=>steady('h'+g,S.stock[g]>=1,S.stock[g]>=5);
function houseNeeds(o){const a=o.y*W+o.x,c=(o.y+2)*W+o.x+2,st=S.stock,n=[],cv=(k)=>!!(COV[k]&&(COV[k][a]||COV[k][c]));
 n.push([hasGood('food'),'food','garden',3]);n.push([!!(mk[a]||mk[c]),'a market','market']);
 if(o.lvl>=2)n.push([hasGood('beer'),'beer','brewery']);
 if(o.lvl>=2&&breadOn())n.push([hasGood('bread'),'bread','bakery']);
 /* craftsmen already want clothing: without it they are less happy, but only clerks and above move out for it (the fifth entry) */
 if(o.lvl>=2)n.push([hasGood('cloth'),'clothing','weaver',2,o.lvl<3]);
 for(const g in GX)if(o.lvl>=GX[g][1]&&goodOn(g))n.push([hasGood(g),g,GX[g][0]]);
 if(o.lvl>=4){n.push([hasGood('wine'),'wine','vineyard']);if(o.lvl<6)n.push([!!(ch[a]||ch[c]),'a church','chapel'])}
 if(o.lvl>=5)n.push([cv('kaffee'),'a coffeehouse','kaffeehaus']);
 if(o.lvl>=2&&S.t>=yT(1870,1))n.push([cv('trash'),'waste collection','muell']);
 if(o.lvl>=3&&S.t>=yT(1868,1))n.push([cv('police'),'a police station nearby','polizei']);
 if(o.lvl>=5&&RES().auer)n.push([cv('gas')||cv('elec'),'gas or electric light',RES().electric?'kraftwerk':'gaswerk']);
 if(o.lvl>=2&&RES().electric)n.push([cv('elec'),'electric light, now that the city has it','kraftwerk',o.lvl>=4?3:2]);return n}
/* a card with choices shows its whole text: the choices only make sense with it (a card to read folds its rest under More) */
function evChoice(t,x,opts){x=flx(x);ov(`<h2>${t}</h2><p>${x}</p><div class="btns" style="flex-direction:column;align-items:stretch">${opts.map((o,k)=>`<button class="${k?'':'pri'}" data-c="${k}">${flx(o[0])}</button>`).join('')}</div>`);
 document.querySelectorAll('#ovCard [data-c]').forEach(b=>b.onclick=()=>{closeOv();opts[+b.dataset.c][1]()})}
/* ---------- street scenes: a fire or a march the Mayor can go and see to on foot (the 3D view draws them from S.sc and calls
   sceneAct when the Mayor steps in). Left alone, each ends as it always did ---------- */
const FIRE_T=50,MARCH_T=75;
function sceneShow(){const s=S&&S.sc,el=$('#scn');if(!el)return;if(!s||s.end||s.hid&&!s.ask){el.hidden=true;return}const a=!!s.ask;$('#scnTxt').textContent=a?s.q:s.txt;el.classList.toggle('ask',a);{const n=$('#scnNo');n.title=n.ariaLabel=a?s.no.replace(/^\S+\s/,''):'Hide this message'}el.hidden=false}
/* the Mayor is asked first: a scene that starts puts its question in the banner ("Fire on Mulberry Street! Will you go?") with a way
   to go and a way to stay away. Going is only the start: helping in person is what pleases the city. Staying away lets the scene end
   its own way at once, now and then at a small cost */
const sceneWhere0=(x,y)=>{try{return typeof sceneWhere==='function'&&sceneWhere(x,y)||''}catch(e){return''}};
function sceneAsk(s,q,no){s.ask=1;s.q=q;s.no=no;shown();return s}
function sceneGo(){const s=S&&S.sc;if(s){s.watch=1;s.wT=performance.now();if(s.ask){s.ask=0;sceneShow()}}}
/* the banner's ✕: on the question it lets the scene pass; on the plain message it only puts the message away, and the scene goes on by itself */
function sceneHide(){const s=S&&S.sc;if(!s||s.end)return;if(s.ask){sceneLeave();return}s.hid=1;sfx('click');sceneShow()}
function sceneLeave(){const s=S&&S.sc;if(!s||s.end)return;s.ask=0;sfx('click');
 if(s.k==='fire'){if(Math.random()<.4){s.o.fire=0;s.saved=1;s.end=S.t+4;sceneShow();toast('🚒 The firemen put it out without you')}else fireLost();return}
 if(s.k==='march'){sceneEnd();S.prest=Math.max(0,S.prest-2);toast('✊ The marchers go home angry 👑 −2');strikeChoice(s.wage);return}
 if(s.k==='rob'){robEnd(s);return}if(UW[s.k]){uwEnd(s);return}if(HIST[s.k])histEnd(s)}
/* one scene at a time: one that comes while another is on waits its turn (a fire, or a day of history), and starts when it ends */
function sceneEnd(){S.sc=null;CARDGAP=performance.now()+4000;sceneShow()}
function sceneWait(f,u){const q=S.scq||(S.scq=[]);if(q.length>=3)return false;f.u=!!u;f.at=performance.now();q.push(f);return true}
/* the game's clock between the sim's quarter-second steps: what has piled up toward the next one, for what moves smoothly with it */
const simNow=()=>S.t+acc;
function sceneTile(){const s=S.sc;if(!s)return null;if(!s.route)return[s.x+((s.f||1)-1)/2,s.y+((s.f||1)-1)/2];if(s.k==='rob'){const i=s.route[Math.min(s.route.length-1,Math.round((s.d||0)/10))];return[i%W,i/W|0]}const r=s.route,i=r[Math.min(r.length-1,Math.floor(Math.min(1,(S.t-s.t0)/(s.t1-s.t0))*(r.length-1)))];return[i%W,i/W|0]}
function fireStart(o){if(sceneHold(true,()=>{if(S.list.includes(o)&&!o.bld)fireStart(o)}))return;const f=B[o.t].foot||1,what=o.t==='house'?'a house you built':B[o.t].n.toLowerCase();S.sc={k:'fire',x:o.x,y:o.y,f,t0:S.t,t1:S.t+FIRE_T,o,txt:`🔥 Fire at ${what}!`};o.fire=1;{const w=sceneWhere0(o.x,o.y);sceneAsk(S.sc,`🔥 Fire ${w?`on ${w}`:`at ${what}`}! Will you go?`,'🚒 Leave it to the firemen')}sfx('boom');sceneShow();
 }
function fireLost(){const o=S.sc.o;o.fire=0;if(S.list.includes(o)&&!o.bld){o.bld={bricks:5,wood:3};o.bld0=8;if(o.t==='house')o.pop=0;GV++;recompute()}sfx('boom');
 toast(`🔥 Fire gutted your ${o.t==='house'?'building':B[o.t].n.toLowerCase()}; it will be rebuilt`);sceneEnd()}
/* the march sets off from the street by the unhappiest homes and heads for City Hall */
function marchRoute(){const homes=S.list.filter(o=>o.t==='house'&&!o.h&&!o.bld).sort((a,b)=>(a.hap??1)-(b.hap??1)),hall=S.list.find(o=>o.t==='hofburg')||S.list.find(o=>o.t==='stephan'),src=homes[0]||hall;if(!src)return null;
 let start=-1,bd=1e9;for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const x=src.x+dx,y=src.y+dy;if(!inb(x,y)||S.tiles[y*W+x]===BRIDGE)continue;const o=S.b[y*W+x];if(o&&o.t==='road'&&dx*dx+dy*dy<bd){bd=dx*dx+dy*dy;start=y*W+x}}if(start<0)return null;
 const tx=hall?hall.x:src.x,ty=hall?hall.y:src.y,r=[start],seen=new Set(r);let cur=start;
 for(let k=0;k<11;k++){let best=-1,bv=1e9;for(const n of roadNb(cur)){if(seen.has(n)||S.tiles[n]===BRIDGE)continue;const d=Math.hypot(n%W-tx,(n/W|0)-ty)+Math.random()*.4;if(d<bv){bv=d;best=n}}if(best<0)break;r.push(best);seen.add(best);cur=best}return r.length>=4?r:null}
function marchStart(wage){if(sceneHold(false,()=>{if(!marchStart(wage))strikeChoice(wage)}))return true;const route=marchRoute();if(!route)return false;const hall=S.list.some(o=>o.t==='hofburg');S.sc={k:'march',x:route[0]%W,y:route[0]/W|0,route,t0:S.t,t1:S.t+MARCH_T,wage,txt:hall?`✊ Workers march on ${HALLN()}`:'✊ Workers march through the streets'};
 {const w=sceneWhere0(S.sc.x,S.sc.y);sceneAsk(S.sc,`✊ Workers are marching ${hall?'on '+HALLN():w?`down ${w}`:'through the streets'}! Will you go out to them?`,'Let them march')}
 sceneShow();return true}
function strikeChoice(wage){const st=S.stock;evChoice('Strike!','Your workers have had enough: too little to eat, no beer, no decent homes. The workshops and wharves stand still. The farms keep working, so the city won\'t starve.',[[`Raise wages: −${money(wage,1)}, the strike ends and people are happier for half a year`,()=>{st.gold-=wage;S.good=S.t+YEAR/2;S.strikeCD=S.t+YEAR;S.prest=Math.max(0,S.prest-3)}],[`Wait it out: workshops stop until ${dateStr(S.t+YEAR/10)}`,()=>{S.strike=S.t+YEAR/10;S.strikeCD=S.t+YEAR*1.2}]])}
function sceneTick(){histTick();homeTick();nbTick();const s=S.sc;if(!s)return;if(s.end){if(S.t>=s.end)sceneEnd();return}if(s.k==='rob'&&s.gone){robEnd(s);return}
 /* a scene the player set out for waits for him (three minutes at most), whatever the game's speed */
 if(s.watch&&performance.now()-(s.wT||0)<180000)s.t1=Math.max(s.t1,S.t+12);if(S.t<s.t1)return;if(s.k==='fire')fireLost();else if(s.k==='march'){sceneEnd();strikeChoice(s.wage)}else if(s.k==='rob')robEnd(s);else if(UW[s.k])uwEnd(s);else histEnd(s)}
/* the Mayor steps in: joins the bucket line, or stops to speak to the marchers */
function sceneAct(){const s=S.sc;if(!s||s.end)return;s.ask=0;if(UW[s.k]){uwAct(s);return}if(HIST[s.k]){histAct(s);return}if(s.k==='rob'){robAct(s);return}
 if(s.k==='fire'){s.o.fire=0;s.saved=1;s.end=S.t+6;S.prest+=4;S.good=Math.max(S.good||0,S.t+YEAR/6);sfx('chime');sceneShow();toast(`🪣 The fire is out and the neighbours cheer ${NYC()?'their Mayor':'their Emperor'} 👑 +4`);return}
 const yr=Math.floor(Y0+S.t/YEAR),hours=yr>=1867?'the eight-hour day that the state made law in 1867 and nobody keeps':'shorter hours',half=Math.round(s.wage/2),st=S.stock,stop=()=>{s.end=S.t+5;s.talked=1;S.strikeCD=S.t+YEAR;sceneShow()};
 evChoice(`The marchers stop for ${YOU()}`,`Their spokesman climbs onto a cart. They want ${hours}, cheaper bread and decent homes, and a few hundred of them wait for your answer.`,[
  ['Promise them better homes and markets: no cost now, and they go home cheering. In a year they will look at how they live',()=>{stop();S.prest+=3;S.promise=S.t+YEAR;toast(`✊ The march breaks up with three cheers for ${YOU()} 👑 +3`)}],
  [`Meet them half way: a raise of −${money(half,1)}, and they are happier for half a year`,()=>{stop();st.gold-=half;S.good=Math.max(S.good||0,S.t+YEAR/2);S.prest+=1;toast('✊ They take the raise and go back to work 👑 +1')}],
  ['Send in the police: the march is broken up, but the wards will not forget it',()=>{stop();s.police=1;S.unrest=45;S.strikeCD=S.t+YEAR/2;S.prest=Math.max(0,S.prest-5);toast('👮 The police clear the street with their clubs 👑 −5')}]])}
function promiseDue(){S.promise=0;if((S.hap??1)<.5){S.unrest=Math.max(S.unrest||0,70);S.prest=Math.max(0,S.prest-6);toast('✊ You broke your promise to the workers 👑 −6')}else{S.prest+=3;toast(`✊ The workers say ${YOU()} has kept the promise 👑 +3`)}}
/* ---------- days of history as street scenes: Barnum's museum burns, the Brooklyn Bridge opens, Liberty is unveiled with a
   ticker-tape parade down Broadway, the first subway leaves City Hall. Only what the player's city has: the bridge and the statue
   open when the player finishes them (or on the real day, if they were finished before it). The Mayor who is there on foot is
   cheered; the 3D view draws each one (scenes.js) ---------- */
const HIST_T=90;
const histYr=()=>Math.floor(Y0+S.t/YEAR),histBuilt=t=>S.list.find(o=>o.t===t&&!o.bld&&!o.r);
/* the building nearest a real address, preferring the old city's own houses */
function histNear(la,lo,R){const[gx,gy]=gt(...prj(L,la,lo));let best=null,bd=R*R;
 for(const o of S.list){if(o.t==='road'||o.bld||o.r)continue;const f=B[o.t].foot||1;if(f>4)continue;const dx=o.x+(f-1)/2-gx,dy=o.y+(f-1)/2-gy,d=dx*dx+dy*dy+(o.h?0:30);if(d<bd){bd=d;best=o}}
 return best?{x:best.x,y:best.y,f:B[best.t].foot||1,o:best}:{x:gx,y:gy,f:1}}
function histRoad(la,lo){const[gx,gy]=gt(...prj(L,la,lo));for(let r=0;r<8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=gx+dx,y=gy+dy,i=y*W+x;if(inb(x,y)&&S.b[i]&&S.b[i].t==='road')return i}return -1}
/* Broadway from City Hall Park down to Bowling Green, along the city's own streets */
function broadwayRoute(){const a=histRoad(40.7128,-74.0087),b=histRoad(40.7052,-74.0137);if(a<0||b<0)return null;const par=new Map([[a,-1]]),q=[a];
 for(let h=0;h<q.length&&q.length<6000;h++){const k=q[h];if(k===b)break;for(const n of roadNb(k)){if(par.has(n)||S.tiles[n]===BRIDGE)continue;par.set(n,k);q.push(n)}}
 if(!par.has(b))return null;const r=[];for(let c=b;c!==-1;c=par.get(c))r.push(c);r.reverse();return r.length>=6?r:null}
const HIST={
 barnum:{at:[1865,7,.4],txt:'🔥 Barnum\'s Museum is burning!',act:'🪣 Help the firemen',prest:5,
  make:()=>histNear(40.7111,-74.0083,9),
  go:'🔥 13 July 1865: Barnum\'s American Museum at Broadway and Ann Street is on fire, and half the city runs to watch. Go there',
  att:()=>'🪣 You help the firemen at Barnum\'s. The museum is lost but no one dies: Anna Swan, the giantess, is carried out, monkeys and parrots flee over the roofs of Broadway, and within two months Barnum opens a new museum further up the street 👑 +5',
  miss:'🔥 Barnum\'s American Museum has burnt to the ground. Within two months Barnum opens a new one further up Broadway'},
 bridge:{at:[1883,5,.77],need:'reichsbruecke',txt:'🌉 The Brooklyn Bridge opens!',act:'🌉 Walk across with the crowd',prest:8,
  make:()=>{const o=histBuilt('reichsbruecke'),sp=o&&bbSpan(o);if(!sp)return null;return{x:sp.a%W,y:sp.a/W|0,o,span:sp}},
  go:'🌉 The Brooklyn Bridge opens! Crowds pour onto the promenade, and there will be fireworks over the East River. Go and walk across',
  att:()=>{const y=histYr(),ro=y>=1873?'Emily Warren Roebling, who carried her sick husband\'s orders to the work for years, is cheered, and Washington Roebling watches from his window in Brooklyn Heights':'Washington Roebling, who took over the work when his father died, is cheered';
   return`🌉 You walk across ${y===1883?'with President Chester A. Arthur and Governor Grover Cleveland':'among the first'}. ${ro}. By the next evening more than 150,000 people have crossed 👑 +8`},
  miss:'🌉 The Brooklyn Bridge is open, and all night long people walk across it to Brooklyn'},
 liberty:{at:[1886,10,.9],need:'liberty',txt:'🗽 Liberty unveiled: parade on Broadway',act:'🎩 Cheer the parade',prest:8,
  make:()=>{const r=broadwayRoute();return r?{x:r[0]%W,y:r[0]/W|0,route:r}:null},
  go:'🗽 Liberty Enlightening the World is unveiled today! A parade marches down Broadway, and the clerks throw ticker tape from the office windows. Go and see',
  att:()=>`🗽 You stand on Broadway as the parade passes${histYr()===1886?' in the rain':''}, and from every office window streams of ticker tape come down: the city's first ticker-tape parade. Out in the harbour Frédéric Auguste Bartholdi pulls the French flag from her face${histYr()===1886?', and President Grover Cleveland accepts her for the nation':''} 👑 +8`,
  miss:'🗽 Liberty is unveiled, and Broadway is ankle-deep in ticker tape'},
 subway:{txt:'🚇 The first subway leaves City Hall',act:'🚇 Take the controls',prest:6,
  make:()=>{const o=histBuilt('hofburg'),f=B.hofburg.foot||1;if(o)return{x:o.x+(f>>1),y:o.y+f,f:1,o};const[x,y]=gt(...prj(L,40.7127,-74.0059));return{x,y,f:1}},
  go:'🚇 Crowds gather at City Hall for the first ride. Walk there and take the controls',
  att:()=>'🚇 Down the stairs at City Hall you take the motorman\'s controller, as Mayor George B. McClellan Jr. did on the day, and drive the first train all the way to 103rd Street. That night 150,000 people ride 👑 +6',
  miss:'🚇 The subway is open, and New York takes to it at once'}};
/* each city its own days: New York's in New York, Vienna's (w) in Vienna */
const histHere=h=>!!h&&!!h.w===!NYC();
function histStart(k){if(!S||!histHere(HIST[k]))return;if(sceneHold(false,()=>histStart(k)))return;const h=HIST[k],s=h.make();if(!s){toast(h.miss);return}
 Object.assign(s,{k,t0:S.t,t1:S.t+HIST_T,txt:h.txt});sceneAsk(s,h.q||`${h.txt}${/[.!?]$/.test(h.txt)?'':'.'} Will you go?`,h.w?W_HALL:'🏛️ Stay at City Hall');S.sc=s;sfx(k==='barnum'||k==='w_ringfire'?'boom':'chime');sceneShow()}
function histTick(){if(S.t<(S.hdT||0))return;S.hdT=S.t+2;const hd=S.hd||(S.hd={});
 for(const k in HIST){const h=HIST[k];if(!h.at||hd[k]||!histHere(h))continue;const t=yT(...h.at);if(S.t<t||(h.need&&!histBuilt(h.need)))continue;hd[k]=1;if(S.t<t+YEAR/6)histStart(k)}}
function histAct(s){if(s.att)return;const h=HIST[s.k];s.att=1;S.prest+=h.prest;if(h.fx)E_(h.fx);S.good=Math.max(S.good||0,S.t+YEAR/4);sfx('chime');toast(h.att())}
function histEnd(s){if(!s.att)toast(HIST[s.k].miss);sceneEnd()}
/* ---------- Vienna's great days, as street scenes on its own streets (w: Vienna's; look: how scenes.js draws them, from the key):
   the ramparts levelled by the Schottentor, the crowds at the Rotunde and at the Börse in May 1873, the Makart-Festzug and the
   Jubilee procession on the Ring, the Ringtheater fire, the first May Day march to the Prater, Lueger's election at the Rathaus,
   mourning for the Empress at the Kapuzinergruft and Lueger's funeral procession. Each comes with its alert; the events' own cards
   (the treasury, the slump, the prestige) stay as they were ---------- */
/* the road tile nearest a real place, as a scene's spot */
function histSpot(la,lo){const r=histRoad(la,lo);return r<0?null:{x:r%W,y:r/W|0,f:1}}
/* from one road to another along the city's own streets */
function streetRoute(a,b){if(a<0||b<0)return null;const par=new Map([[a,-1]]),q=[a];
 for(let h=0;h<q.length&&q.length<9000;h++){const k=q[h];if(k===b)break;for(const n of roadNb(k)){if(par.has(n)||S.tiles[n]===BRIDGE)continue;par.set(n,k);q.push(n)}}
 if(!par.has(b))return null;const r=[];for(let c=b;c!==-1;c=par.get(c))r.push(c);r.reverse();return r.length>=6?r:null}
/* along the Ring from one place to another, the way that passes a third (the Ring's own tiles, in their order) */
function ringRoute(from,to,via){const r=S.ringT;if(!r||r.length<8)return null;const nr=(la,lo)=>{const[gx,gy]=gt(...prj(L,la,lo));let b=0,bd=1e9;for(let k=0;k<r.length;k++){const d=(r[k]%W-gx)**2+((r[k]/W|0)-gy)**2;if(d<bd){bd=d;b=k}}return b};
 const a=nr(...from),b=nr(...to),v=r[nr(...via)],lo=Math.min(a,b),hi=Math.max(a,b),mid=r.slice(lo,hi+1),out=mid.includes(v)?mid:r.slice(hi).concat(r.slice(0,lo+1)).reverse();if(a>b)out.reverse();
 return out.length>=6?out:null}
/* in Vienna the one who goes out is the Emperor: each day asks him in its own words (q), and he can stay in the Hofburg; what he does
   there can move the Empress's mood or Hungary's (fx, through E_) */
const W_HALL='🏰 Stay at the Hofburg',W_BURG=[48.2050,16.3620],W_OPER=[48.2030,16.3692],W_STUB=[48.2117,16.3822];
Object.assign(HIST,{
 w_walls:{w:1,at:[1865,9,.3],txt:'⛏️ The last ramparts come down by the Schottentor!',q:'⛏️ Majesty, the navvies are levelling the last ramparts by the Schottentor, and the Viennese have come out to watch. Will Your Majesty go?',act:'⛏️ Speak to the navvies',prest:4,
  make:()=>histSpot(48.2147,16.3622),
  att:()=>'⛏️ The navvies of the city expansion lower their picks and doff their caps as their Emperor walks the rubble by the Schottentor. "Es ist mein Wille", you wrote in 1857, and bastion by bastion the walls have come down since; only the Mölker Bastei will be left standing, and Hansen and Ferstel are already drawing what will rise on the Ring 👑 +4',
  miss:'⛏️ The ramparts by the Schottentor are carted away, and the Glacis lies open for the new city'},
 w_expo:{w:1,at:[1873,5,.02],txt:'🏛️ The World\'s Fair opens in the Prater!',q:'🏛️ Majesty, the World\'s Fair awaits its opening, and the Rotunde is full. Will Your Majesty open it?',act:'👑 Open the Weltausstellung',prest:6,fx:{sisi:5},
  make:()=>histSpot(48.2165,16.4040)||histSpot(48.2170,16.3960)||histSpot(48.2185,16.3920),
  att:()=>'👑 In the pouring rain you declare the Weltausstellung open beneath the great dome of the Rotunde, the biggest in the world, with the Empress at your side. Some fifty thousand exhibitors from thirty-five countries fill the Prater 👑 +6',
  miss:'🏛️ An archduke opens the World\'s Fair in your name, and Vienna fills with visitors from every land'},
 w_crash:{w:1,at:[1873,5,.29],txt:'📉 Panic at the Börse!',q:'📉 Majesty, the Börse has crashed, and a crowd of the ruined stands in the Herrengasse. Will Your Majesty go to them?',act:'🗣️ Speak to the crowd',prest:6,
  make:()=>histSpot(48.2108,16.3660),
  att:()=>'🗣️ On the steps of the Börse in the Palais Ferstel the ruined fall silent as their Emperor speaks: clerks, widows, small Bürger who bought shares on credit. The police keep the doors, the stockbrokers slip out by the Freyung. Black Friday wipes out a fortune in a day, and Vienna will speak of the Krach for a generation, but today no one storms the doors 👑 +6',
  miss:'📉 Black Friday: the Börse closes in panic, and the crowd in the Herrengasse disperses in silence'},
 w_makart:{w:1,at:[1879,4,.86],txt:'🎨 The Makart-Festzug is on the Ring!',q:'🎨 Majesty, for your silver wedding the city passes before the pavilion at the Burgtor, and the Empress is waiting there. Will Your Majesty go?',act:'👑 Greet the guilds',prest:6,fx:{sisi:10},
  make:()=>{const r=ringRoute(W_STUB,W_BURG,W_OPER);return r?{x:r[0]%W,y:r[0]/W|0,route:r}:null},
  att:()=>'👑 Beside Sissi in the imperial pavilion before the Burgtor you watch Vienna pass for your silver wedding: the guilds in Renaissance dress on their decorated floats, the hunters, the brewers, the bakers, and Hans Makart himself on horseback in a painter\'s dress of Rubens\'s day. The Empress, who hates being stared at, endures it for you 👑 +6',
  miss:'🎨 The Makart-Festzug passes the empty imperial pavilion at the Burgtor, and the city wonders where its Emperor was'},
 w_ringfire:{w:1,at:[1881,12,.25],txt:'🔥 The Ringtheater is burning!',q:'🔥 Majesty, the Ringtheater is burning, and the house was full! Will Your Majesty go?',act:'🪣 Stand with the firemen',prest:6,
  make:()=>histNear(48.2150,16.3640,6),
  att:()=>'🪣 You stand with the firemen and the police at the Ringtheater, where the gas lit the scenery before The Tales of Hoffmann and the doors opened inward. Hundreds die. Count Hans Wilczek founds the Vienna Voluntary Rescue Society the next day, and new laws come for every theatre 👑 +6',
  miss:'🔥 The Ringtheater has burnt out, and hundreds are dead. Vienna founds a rescue society the very next day'},
 w_mayday:{w:1,at:[1890,5,.0],txt:'✊ The workers march to the Prater for May Day!',q:'✊ Majesty, the workers are marching to the Prater, and the shops of the Innere Stadt are boarded up. Will Your Majesty watch them pass?',act:'👑 Watch them pass',prest:5,
  /* down the Praterstraße to the Prater: a street route never crosses a bridge, so from the Stubentor it found no way over the
     Donaukanal and the march never came */
  make:()=>{const r=streetRoute(histRoad(48.2140,16.3840),histRoad(48.2160,16.4000))||streetRoute(histRoad(...W_STUB),histRoad(48.2160,16.4000));return r?{x:r[0]%W,y:r[0]/W|0,route:r}:null},
  att:()=>'👑 You watch as tens of thousands march to the Prater for the eight-hour day, in their Sunday best and in perfect order, while the shops of the Innere Stadt are boarded up in fear. Victor Adler\'s party has called them out, and not a window is broken 👑 +5',
  miss:'✊ The workers march to the Prater in their Sunday best, and the day passes without a broken window'},
 w_lueger:{w:1,at:[1897,4,.25],txt:'🎩 Lueger is Mayor at last!',q:'🎩 Majesty, you have confirmed Lueger at last, and the crowd before the Rathaus is cheering him. Will Your Majesty go?',act:'👑 Receive the new Mayor',prest:5,
  make:()=>histSpot(48.2108,16.3572),
  att:()=>'👑 The crowd before the Rathaus roars "Hoch Lueger!" as handsome Karl bows to his Emperor. Since 1895 the council has elected him again and again and you have refused to confirm him, for the hatred of the Jews he preaches as much as for the mob that follows him; now you give way. Gas, power and the trams will be the city\'s own under him, and his speeches against the Jews will be heard from the Rathaus 👑 +5',
  miss:'🎩 Karl Lueger takes office as Mayor, and his Christian Socials cheer him at the Rathaus'},
 w_sisi:{w:1,at:[1898,9,.53],txt:'🕯️ Vienna buries its Empress today.',q:'🕯️ Majesty, the Empress\'s coffin is to be carried into the Kapuzinergruft, and all Vienna stands in black at the Neuer Markt. Will you walk behind it?',act:'🕯️ Follow the coffin',prest:5,
  make:()=>histSpot(48.2058,16.3697),
  att:()=>'🕯️ Through the silent crowd at the Neuer Markt you follow Sissi\'s coffin into the Kapuzinergruft. She was stabbed on the lakeside at Geneva by an anarchist, Luigi Lucheni, who wanted to kill a royal and found her. You are heard to say that you are spared nothing in this world 👑 +5',
  miss:'🕯️ The Empress is laid to rest in the Kapuzinergruft, and all Vienna wears black'},
 w_jubilee:{w:1,at:[1908,6,.37],txt:'👑 The Jubilee procession is on the Ring!',q:'👑 Majesty, for sixty years of your reign twelve thousand people are waiting to pass your stand at the Burgtor. Will Your Majesty go?',act:'👑 Take the salute',prest:6,
  make:()=>{const r=ringRoute(W_STUB,W_BURG,W_OPER);return r?{x:r[0]%W,y:r[0]/W|0,route:r}:null},
  att:()=>'👑 Twelve thousand people pass your stand at the Burgtor for sixty years of your reign: the peoples of the empire in their own costumes, from Galicia to Tyrol and Dalmatia, and the history of the house of Habsburg from Rudolf I on, in armour and on horseback. At seventy-seven you stand for three hours in the June sun 👑 +6',
  miss:'👑 The Jubilee procession passes an empty stand at the Burgtor'},
 w_funeral:{w:1,at:[1910,3,.43],txt:'🕯️ Lueger is carried to Stephansdom today.',q:'🕯️ Majesty, Karl Lueger is carried from the Rathaus to Stephansdom, and the streets are black with mourners. Will Your Majesty go?',act:'👑 Pay your respects',prest:4,
  make:()=>{const r=streetRoute(histRoad(48.2108,16.3572),histRoad(48.2085,16.3731));return r?{x:r[0]%W,y:r[0]/W|0,route:r}:null},
  att:()=>'👑 You pay your respects as a hearse drawn by black horses carries Karl Lueger from the Rathaus to Stephansdom. Hundreds of thousands line the streets for der schöne Karl, who made Vienna\'s gas, power and trams the city\'s own and brought it a second mountain-spring water main, and who made hatred of the Jews a vote-winner 👑 +4',
  miss:'🕯️ Karl Lueger is carried from the Rathaus to Stephansdom, and the streets are black with mourners'},
 /* the Empress in the Prater: she rides out early along the Hauptallee, and the Viennese wait under the chestnuts to see her */
 w_prater:{w:1,at:[1874,5,.4],txt:'🐎 The Empress rides in the Prater!',q:'🐎 Majesty, the Empress is out riding on the Hauptallee, and half the Prater has gathered under the chestnuts to see her. Will you ride out to join her?',act:'🐎 Ride beside her',prest:3,fx:{sisi:12},
  make:()=>histSpot(48.2120,16.4060)||histSpot(48.2160,16.4000)||histSpot(48.2185,16.3920),
  att:()=>'🐎 You ride beside Sissi down the Hauptallee. She is the finest horsewoman in Europe and rides you into the ground, laughing, while the Viennese crowd the chestnuts for a glimpse of her famous hair. When they come too close she lifts her fan before her face 👑 +3',
  miss:'🐎 The Empress rides alone in the Prater, behind her fan, and goes home before the crowd grows'},
 /* Mayerling: Crown Prince Rudolf is buried in the Kapuzinergruft on 5 February 1889 */
 w_rudolf:{w:1,at:[1889,2,.13],txt:'🕯️ The Crown Prince is buried today.',q:'🕯️ Majesty, Rudolf\'s coffin is to be carried into the Kapuzinergruft, and Vienna stands in black at the Neuer Markt. Will you walk behind your son?',act:'🕯️ Follow your son',prest:4,fx:{sisi:5},
  make:()=>histSpot(48.2058,16.3697),
  att:()=>'🕯️ You follow your son\'s coffin into the Kapuzinergruft. Sissi does not come: she will wear black for the rest of her life. Vienna is told that Rudolf took his life in a moment of madness, so that the Church may bury him; of Mary Vetsera, who died with him at Mayerling, nothing is said 👑 +4',
  miss:'🕯️ Crown Prince Rudolf is laid to rest in the Kapuzinergruft, and Vienna wears black'}});
/* ---------- word from City Hall: while the Mayor is out on foot (or riding), what the city raises for him to decide does not open over
   the street. Pressing matters (a strike, an epidemic, war, an empty treasury, unrest) come with a messenger boy who runs up to him
   (street.js draws him) and an alert: back to City Hall, which leaves the street and opens the matter, or later, and it comes back in
   a while. The rest wait quietly in the satchel, a 📨 count at the top, until he opens it or goes back to the map, where they open
   one after another. They are not kept in a save ---------- */
/* a letter from the city at most every 20 seconds, and the next note only once the last has been read */
let EVNEXT=0,TOBUSY=0,TOAT=0;const TOQ=[];
let msgAt='',SIMT=0,MSGRUN=0,msgOpen=null,msgHold=0,msgSig='';const MSG=[],URGENT=/strike|epidemic|cholera|typhus|fever|war\b|invad|treasury|bankrupt|riot|panic|defeat|victory|unrest|murder/i;
const onFoot=()=>document.body.classList.contains('walking');
function msgPush(t,f,o){const m=Object.assign({t:String(t).replace(/<[^>]*>/g,'').trim(),f,urg:URGENT.test(t),at:0},o||{});if(MSG.some(q=>q.t===m.t))return;if(MSG.length>=8){const i=MSG.findIndex(q=>!q.urg);MSG.splice(i<0?0:i,1)}MSG.push(m);if(!m.urg)sfx('click')}
{const ec=evChoice,eo=evOv,hold=t=>SIMT&&(onFoot()||!letGo(URGENT.test(t)));evChoice=function(t,x,o,full){if(hold(t))return msgPush(t,()=>ec(t,x,o,full));if(SIMT)shown();return ec(t,x,o,full)};
 evOv=function(t,x,full){if(hold(t))return msgPush(t,()=>eo(t,x,full),{info:1,t0:performance.now()});if(SIMT)shown();return eo(t,x,full)}}
/* ---------- the attention gate: one thing at a time. Whatever would come up by itself (a case, a council request, a letter from City
   Hall, a scene and its alert, a job or a ride offered in the street, a passer-by's chatter) asks first. quiet() is true while the gate
   is closed: while building (and for a minute after the last placement), while a case or a job is under way (then only its own prompts
   show), while a scene is being watched, while a panel is open. What waits comes out one at a time, at least 45 s apart (letGo); urgent
   things (a fire, an epidemic) may go first and sooner (10 s after the last), but never while a building is being placed or a case is on. Notes the city writes by
   itself go to the papers (news, in Stats), not over the map ---------- */
let BUILT=-1e9,ATT=0,QUIET0=0;
const building=()=>!!(S&&mode&&mode!=='demolish'&&!onFoot());
const panelOpen=()=>!$('#ov').hidden||!$('#info').hidden||!!document.querySelector('.panel.open,#trade:not([hidden])');
const watching=()=>{const s=S&&S.sc;return!!(s&&!s.end&&s.watch)};
/* offers in the street (a ride, a ferry) wait while a scene asks, a letter is up or a case is on */
/* no rides offered while a case, a letter or a scene the Emperor or the Mayor is attending wants him */
function offersWait(){return!!(S&&(S.case||msgOpen||(S.sc&&!S.sc.end&&(S.sc.ask||S.sc.watch))))}
function quiet(){if(!S)return true;return building()||performance.now()<BUILT+60000||guideBusy()||watching()||panelOpen()}
/* one card at a time, with a breath between: nothing new opens while a letter, a scene or a card is up, nor for a few seconds after one
   closes, nor while a note is still being read */
let CARDGAP=0;
function cardsQuiet(now){return!msgOpen&&!(S&&S.sc&&!S.sc.end)&&$('#ov').hidden&&now>=CARDGAP&&now>=TOBUSY+1500}
function letGo(urg){if(!S||building()||S.case)return false;const now=performance.now();if(!cardsQuiet(now))return false;if(urg)return!panelOpen()&&now>=ATT-35000;return!quiet()&&now>=ATT}
function shown(){ATT=performance.now()+45000}
function news(m){const n=S&&(S.news||(S.news=[]));if(!n)return;m=String(m).replace(/<[^>]*>/g,'');if(n.length&&n[n.length-1][1]===m)return;n.push([Math.round(S.t),m]);if(n.length>40)n.shift()}
/* what waits for the gate: the next scene, oldest first (an urgent one first), dropping what has gone stale */
function gateTick(now){const q=S.scq;if(!q||!q.length||S.sc)return;for(let i=q.length-1;i>=0;i--)if(!q[i].u&&now-(q[i].at||now)>240000)q.splice(i,1);
 const i=Math.max(0,q.findIndex(f=>f.u));if(!q[i]||!letGo(!!q[i].u))return;const f=q.splice(i,1)[0];SIMT=1;try{f()}finally{SIMT=0}sceneShow()}
/* a scene that comes while the gate is closed (or another scene is on) waits its turn */
function sceneHold(u,f){if(!S.sc&&letGo(u))return false;sceneWait(f,u);return true}
/* while a building or road is being placed nothing covers the map: letters wait in the queue, scene alerts and street voices hide, notes shrink to the top edge */
function placing(){return!!(S&&mode&&mode!=='demolish'&&!onFoot()&&(!coarse||pend||CONF||RA>=0||LA>=0))}
let PLC=false,ONC=false;function placeTick(){const p=placing();{const c=!!(S&&S.case);if(c!==ONC){ONC=c;document.body.classList.toggle('oncase',c)}}if(building())BUILT=performance.now();if(p===PLC)return;PLC=p;document.body.classList.toggle('placing',p);if(!p)$('#ov').classList.remove('held')}
function msgTick(now){const el=$('#msg'),n=$('#msgN');if(!el)return;
 placeTick();if(CONF)confArrows();if(TOQ.length&&now>TOBUSY+700&&!cardHeld())toast(TOQ.shift());gateTick(now);
 /* notes that have waited too long go to the papers rather than all at once */
 for(let i=MSG.length-1;i>=0;i--){const m=MSG[i];if(m.info&&!m.urg&&now-m.t0>150000){MSG.splice(i,1);news(m.t)}}
 if(!onFoot()){if(msgOpen){msgOpen=null;MSGRUN=0;el.hidden=true}if(!n.hidden)n.hidden=true;if(MSG.length&&now>msgHold){const i=MSG[0].asked?0:Math.max(0,MSG.findIndex(q=>q.urg)),m=MSG[i];if(m.asked&&!panelOpen()||letGo(m.urg)){MSG.splice(i,1);msgSig='';shown();m.f()}}return}
 if(!msgOpen){const m=MSG.find(q=>q.urg&&q.at<=now);if(m&&(m.foot?!S.case&&cardsQuiet(now):letGo(true))){msgShow(m,now);shown()}}
 const sig=msgOpen||S.case?'':String(MSG.length);if(sig!==msgSig){msgSig=sig;n.hidden=!sig||sig==='0';n.textContent=`📨 ${MSG.length}`}
 /* the satchel sits below a scene's card while one is up, never over it */
 if(!n.hidden){const c=$('#scn'),k=c.hidden?'':c.className+c.textContent;if(k!==msgAt){msgAt=k;n.style.top=k&&c.offsetParent?`${Math.round(c.getBoundingClientRect().bottom-c.offsetParent.getBoundingClientRect().top+8)}px`:''}}}
function msgShow(m,now){msgOpen=m;MSGRUN=now;msgSig='-';$('#msgTxt').textContent=m.t;$('#msgGo').textContent=m.go||`${NYC()?'🏛️':'👑'} Back to ${HALLN()}`;$('#msg small').textContent=`A message from ${HALLN()}`;$('#msgLater').textContent=m.later||'Later';$('#msg').hidden=false;$('#msgN').hidden=true}
function msgClose(){msgOpen=null;MSGRUN=0;msgSig='';CARDGAP=performance.now()+4000;$('#msg').hidden=true}
/* back to City Hall or the Hofburg for a message: every letter waiting in the satchel is read there, one after another, not only this one */
$('#msgGo').onclick=()=>{const m=msgOpen;if(!m)return;msgClose();sfx('click');const i=MSG.indexOf(m);if(i>=0)MSG.splice(i,1);
 if(m.foot){m.f();return}m.asked=1;for(const q of MSG)if(!q.foot)q.asked=1;MSG.unshift(m);msgHold=performance.now()+1300;hallView()};
/* back to City Hall: off the street and the map over City Hall Park, the hall in the middle, seen from above (centerOn ends the walk at once) */
function hallView(){const o=S.list.find(o=>o.t==='hofburg'&&!o.bld)||S.list.find(o=>o.t==='hofburg'),f=o?B.hofburg.foot||1:1,[x,y]=o?[o.x+(f-1)/2,o.y+(f-1)/2]:gt(...prj(L,40.7127,-74.0059));viewAt(x,y,Math.max(1.4,Math.min(2.2,Z)))}
/* the map over x,y from KZ/Z away; on foot the walk ends first, since ending it puts back the height it was walked from */
function viewAt(x,y,z){if(onFoot())centerOn(x,y);Z=z;centerOn(x,y);gGV=-1}
$('#msgLater').onclick=()=>{const m=msgOpen;if(!m)return;msgClose();if(m.no){const i=MSG.indexOf(m);if(i>=0)MSG.splice(i,1);m.no();return}m.at=performance.now()+45000};
$('#msgN').onclick=()=>{if(MSG.length)msgShow(MSG[0],performance.now())};
/* what City Hall sends word of by itself: the treasury running low, a council request falling due, the wards growing restless. On
   the map a toast; on foot a message */
function cityWarn(st){if(S.t<(S.cwT||0))return;S.cwT=S.t+3;dnTxt();
 /* the day the money changes (1892): told once, so the doubled numbers do not come as a shock */
 if(KR()&&!S.krTold){S.krTold=1;evOv('💰 New money: the krone','Austria now pays in kronen (Kr.) and no longer in gulden (fl.). One gulden is two kronen. So every price, every wage and your treasury now show twice the number. Nothing costs more: you are as rich as before.',true)}const foot=onFoot();
 /* a discovery that can be paid for and nobody at work on one: a card says so, soon after the last one is done and then every year and a half */
 {const a=resAvail();if(a.length&&S.t>(S.rsNT||0)&&!foot&&!$('#resBtn').hidden&&TUTI<0&&!(typeof tgOn==='function'&&tgOn())&&letGo(false)&&$('#ov').hidden){S.rsNT=S.t+YEAR*1.5;const t=a[0];
  evChoice('🔬 A discovery is waiting',`Your scholars are idle. They can now study: <b>${t[1]}</b> (${t[2]}).<br><br>${t[5]}<br><br>${S.rfree>0?'This one is free.':`It costs ${money(rsCost(t),1)} once.`}${a.length>1?` ${a.length-1} more ${a.length>2?'are':'is'} ready too.`:''}`,[['🔬 Open research',()=>showResearch()],['Later',()=>{}]]);return}}
 /* a need that turns critical (no bricks, wood, stone or food left, people without homes, an epidemic, a strike) is told once, as it
   starts, with where to look; told again only after it has passed and come back. Not in the quiet first minutes */
 if(performance.now()>QUIET0){const c=S.crit||(S.crit={}),now={};for(const g of['bricks','wood','stone','food'])if(GOODS.includes(g)&&st[g]<1)now['g_'+g]=`${ICON[g]} No ${g} left: tap ${ICON[g]} at the top to get more`;
  if(S.newc>=1)now.home='🧳 People are without homes: sell building plots';if(S.epi)now.epi=`🦠 ${S.epi.n} in the city`;if(S.strike>S.t)now.strike='✊ The workers are on strike';
  for(const k in c)if(!now[k])delete c[k];for(const k in now)if(!c[k]){c[k]=1;toast(now[k]);break}}
 if(st.gold<-300&&st.gold>=-3000&&S.t>(S.lowT||0)){S.lowT=S.t+YEAR/2;const t='💸 The treasury is in debt';if(foot||(letGo(true)&&$('#ov').hidden))evChoice(t,`${NYC()?'The city chamberlain':'The court treasurer'} reports ${money(-st.gold,1)} of debt. Below −${money(3000)} you get one last chance before ${NYC()?'the city goes into receivership':'the Reichsrat takes over'}.<br><br>Money comes from the rent tax of your homes: sell more building plots and let them fill. ${S.loan>0?`Your loan is still being repaid (${money(Math.ceil(S.loan),1)}), so goods sold in Trade tide you over.`:'A loan or goods sold in Trade tide you over.'}`,
  /* only what can still help: no second loan while one is being repaid, no higher taxes when they are high already, and the builders'
     buying stopped when that is what drains the treasury */
  [S.loan>0?null:['💰 Take a loan',()=>lackTrade('gold')],['🏠 Sell a building plot',()=>{setMode('house');findSpot()}],S.taxR==='high'?null:['⬆️ Raise the taxes',()=>{S.taxR='high';toast(`🪙 ${TAXD.high}`)}],
   S.autoBuy!==false&&S.flow&&S.flow.b>40?['🧱 Stop the builders buying materials',()=>{S.autoBuy=false;toast('🧱 Builders now wait for your own bricks and timber')}]:null,
   ['⚖️ Sell goods in Trade',()=>{closeInfo();tradeFill();$('#trade').hidden=false}],['Later',()=>{}]].filter(Boolean));else toast(`${t}: ${money(st.gold,1)}`)}
 for(const q of goalsOpen()){if(q.quiet)continue;const s_=S.q[q.id];if(s_.due==null||s_.warn||s_.due-S.t>YEAR/6)continue;s_.warn=1;const t=`🎯 ${q.who}: ${q.short}, ${dueStr(s_.due)}`;if(foot)evOv(t,`${questProgress(q)}. ${q.who} is asking after it at ${HALLN()}.`);else toast(t);break}
 if((S.unrest||0)>65&&S.t>(S.unrestW||0)){S.unrestW=S.t+YEAR/2;const ny=NYC(),t=ny?'✊ Unrest in the wards':'✊ Unrest in the Vorstädte';if(foot)evOv(t,ny?'The ward captains report trouble brewing: the working people want bread, beer and decent homes. If nothing changes they will march on City Hall.':'The police president reports trouble brewing: the working people want bread, beer and decent homes. If nothing changes they will march on the Hofburg.');else toast(ny?`${t}: the working people may soon march on City Hall`:`${t}: the working people may soon march on the Hofburg`)}}

/* ---------- the underworld, as the years had it: the Dead Rabbits and the Bowery Boys of the Five Points in the 1860s, the Whyos of
   Mulberry Bend from the 1870s, Monk Eastman's gang and Paul Kelly's Five Pointers on the Lower East Side from the 1890s, Black Hand
   letters in Little Italy from 1903 (fought by Joseph Petrosino's Italian Squad from 1905), and Tammany Hall, with Boss Tweed's Ring
   until his arrest in 1871. Each is a street scene the 3D view draws (scenes.js): a gang brawl, a shopkeeper squeezed for protection
   money, a Black Hand letter, a Tammany man with an envelope. Crime (S.crime) rises with what is let go and sinks with police stations
   and what is stopped; it makes homes less happy and robbers bolder ---------- */
const UW_T=80,oneOf=a=>a[Math.random()*a.length|0],crimeAdd=d=>{S.crime=Math.max(0,Math.min(100,(S.crime??30)+d))},prestDown=d=>{S.prest=Math.max(0,S.prest-d)};
function wardMood(x,y,r,h){const j=S.joy||(S.joy=[]);j.push({x:Math.round(x),y:Math.round(y),r,h,u:S.t+YEAR/2});if(j.length>12)j.shift()}
function gangOf(){const y=histYr();return y<1870?{n:'the Dead Rabbits',m:'the Bowery Boys',at:[40.7155,-73.9995],p:'Paradise Square in the Five Points'}
 :y<1895?{n:'the Whyos',m:y<1878?'the Dutch Mob':'a gang from the Fourth Ward',at:[40.7165,-73.999],p:'Mulberry Bend'}:{n:'Monk Eastman\'s gang',m:'Paul Kelly\'s Five Pointers',at:[40.7203,-73.99],p:'Rivington Street under the Allen Street El'}}
const bossOf=()=>{const y=histYr();return y<=1871?'Boss Tweed\'s Ring':y<1886?'Honest John Kelly\'s Tammany Hall':y<1902?'Richard Croker\'s Tammany Hall':'Charles F. Murphy\'s Tammany Hall'};
function uwSpot(at,R){const r=histRoad(at[0],at[1]);if(r<0)return null;const h=histNear(at[0],at[1],R||6);return{x:r%W,y:r/W|0,f:1,o:h.o||null,w:sceneWhere0(r%W,r/W|0)}}
const UW={
 brawl:{make(){const g=gangOf(),s=uwSpot(g.at);if(!s)return null;return Object.assign(s,{g,txt:`⚔️ Gang fight in ${g.p}`,q:`⚔️ ${ucf(g.n)} and ${g.m} are fighting in ${g.p}! Will you go?`,no:'👮 Leave it to the police'})},
  go:s=>`⚔️ Bricks and paving stones fly in ${s.g.p}: ${s.g.n} against ${s.g.m}. Go there`,act:'👮 Step in',title:()=>'⚔️ A street fight',
  text:s=>`Forty men with clubs, brickbats and ${histYr()<1890?'slung shots':'revolvers'} fill the street, ${s.g.n} on one side and ${s.g.m} on the other. The shopkeepers have put up their shutters and a roundsman watches from the corner, waiting for orders.`,
  opts:s=>[['👮 Send for the police reserves: the street is cleared (👑 +4)',()=>{s.res='police';crimeAdd(-6);S.prest+=4;wardMood(s.x,s.y,8,.06);return`👮 Whistles, then a double line of policemen with their locust clubs. ${ucf(s.g.n)} scatter into the alleys and the street cheers its Mayor 👑 +4`}],
   ['🚔 Raid their saloon as well: −300 $, the ward stays quiet for months (👑 +6)',()=>{s.res='police';S.stock.gold-=300;crimeAdd(-14);S.prest+=6;wardMood(s.x,s.y,12,.08);return`🚔 The police follow them to their saloon, smash the bar and lock up a dozen of ${s.g.n}. The ward is quieter than it has been in years 👑 +6`}],
   ['🤷 Let them fight · 👑 −1',()=>{s.res='left';crimeAdd(6);prestDown(1);return'The gangs fight on until they tire. The neighbours saw their Mayor watch and walk away 👑 −1'}]],
  left:s=>{crimeAdd(8);prestDown(2);wardMood(s.x,s.y,8,-.05);return`⚔️ The fight in ${s.g.p} goes on until dark. Two passers-by are hurt, and ${s.g.n} rule the block 👑 −2`}},
 shake:{make(){const g=gangOf(),s=uwSpot([g.at[0]+.003,g.at[1]+.004],8);if(!s)return null;return Object.assign(s,{g,tr:oneOf(['butcher','tailor','grocer','saloon keeper','cigar maker','baker']),txt:`💰 Protection money on ${s.w||'the Bowery'}`,q:`💰 Toughs from ${g.n} are squeezing a shopkeeper on ${s.w||'the Bowery'}! Will you go?`,no:'Not my affair'})},
  go:s=>`💰 Two toughs from ${s.g.n} lean on a ${s.tr}'s door. Go there`,act:'🗣️ Speak to the shopkeeper',title:s=>`💰 The ${s.tr} and the toughs`,
  text:s=>`The ${s.tr} stands in his doorway while two of ${s.g.n} explain, very politely, what happens to a shop whose owner forgets to pay them five dollars a week for "protection". Half the block is watching from behind its curtains.`,
  opts:s=>[['👮 Have them arrested on the spot (👑 +3)',()=>{s.res='police';crimeAdd(-4);S.prest+=3;return`👮 A roundsman collars both of them. The ${s.tr} shakes your hand in front of the whole street 👑 +3`}],
   ['🏛️ Post a policeman on the block for a year: −250 $ (👑 +4)',()=>{s.res='police';S.stock.gold-=250;crimeAdd(-10);wardMood(s.x,s.y,10,.08);S.prest+=4;return'🏛️ From tomorrow a roundsman walks the block day and night. The shops stop paying, and the street is happier for it 👑 +4'}],
   ['💵 Take a cut and look the other way: +150 $ (👑 −5)',()=>{s.res='left';S.stock.gold+=150;crimeAdd(8);const e=EMP();e.cor=Math.min(100,(e.cor||0)+6);prestDown(5);return`💵 A fold of bills finds its way into your coat. Word gets round that the Mayor can be squared, and every shop on ${s.w||'the street'} pays 👑 −5`}]],
  left:s=>{crimeAdd(5);wardMood(s.x,s.y,8,-.06);return`💰 The ${s.tr} pays. By the end of the month every shop on the block pays too, and prices go up to cover it`}},
 letter:{make(){const s=uwSpot([40.719,-73.997],8);if(!s)return null;const amt=oneOf([500,1000,2000]);return Object.assign(s,{amt,tr:oneOf(['grocer','baker','barber','druggist','wine merchant']),txt:'✉️ A Black Hand letter in Little Italy',q:`✉️ A shopkeeper on ${s.w||'Mulberry Street'} has had a Black Hand letter! Will you go?`,no:'Leave it to the precinct'})},
  go:s=>`✉️ A ${s.tr} on ${s.w||'Mulberry Street'} has a letter signed with a black hand: ${money(s.amt,1)}, or his shop is blown up. Go there`,act:'✉️ Read the letter',title:()=>'✉️ The Black Hand',
  text:s=>`The ${s.tr} shows you the letter, in Italian, signed with a hand printed in black ink and a dagger: ${fmt(s.amt)} dollars by Saturday, left under the stairs, or his shop and his children will be blown up. ${histYr()>=1905?`${histYr()>=1908?'Lieutenant':'Detective Sergeant'} Joseph Petrosino's Italian Squad, almost the only policemen in the city who speak the language, are on Elizabeth Street.`:'Hardly a policeman in the city speaks Italian, and the neighbours are too frightened to talk.'}`,
  opts:s=>{const sq=histYr()>=1905;return[[sq?'🕵️ Send for Petrosino\'s Italian Squad (👑 +8)':'👮 Send for the police (👑 +3)',()=>{s.res='police';if(Math.random()<(sq?.75:.4)){crimeAdd(sq?-12:-6);S.prest+=sq?8:3;return sq?'🕵️ Petrosino\'s men wait in the back of the shop for the collector and take him with the money in his hand. The whole street turns out to watch him led away 👑 +8':'👮 The police lie in wait under the stairs and catch the collector 👑 +3'}
     crimeAdd(3);return'The collector never comes. The police go home, and the letters go on'}],
    ['💵 Mark the bills and set a trap: −200 $',()=>{s.res='police';S.stock.gold-=200;if(Math.random()<.6){crimeAdd(-12);S.prest+=6;return'💵 The marked bills turn up in a saloon on Elizabeth Street the same night, and three men of the gang go to the Tombs 👑 +6'}prestDown(2);wardMood(s.x,s.y,6,-.06);return'💥 They saw through the trap. A week later a bomb blows in the shop front at night. No one is killed, but the street is terrified 👑 −2'}],
    ['Tell him to pay and keep quiet (👑 −3)',()=>{s.res='left';crimeAdd(8);prestDown(3);return'He pays. The next week three more shops on the street have letters of their own 👑 −3'}]]},
  left:s=>{crimeAdd(6);if(Math.random()<.5){wardMood(s.x,s.y,6,-.08);prestDown(2);return`💥 The ${s.tr} would not pay. In the night a bomb blows in his shop front. No one is killed, but no one on the street will talk to the police 👑 −2`}return`✉️ The ${s.tr} pays the ${fmt(s.amt)} dollars, and the Black Hand grows bolder`}},
 bribe:{make(){const y=histYr(),s=uwSpot(y>=1868&&Math.random()<.5?[40.734,-73.989]:[40.7127,-74.0059],6);if(!s)return null;const amt=y<=1871?2500:1500;return Object.assign(s,{amt,boss:bossOf(),txt:'🎩 A Tammany man waits for the Mayor',q:`🎩 A man from ${bossOf()} wants a quiet word with the Mayor${s.w?` on ${s.w}`:''}. Will you meet him?`,no:'Send word you are busy'})},
  go:s=>`🎩 A man in a silk hat from ${s.boss} is waiting for you in the street. Go and hear what he wants`,act:'🎩 Hear him out',title:()=>'🎩 A friend from Tammany',
  text:s=>`He tips his silk hat and talks of a contract to pave ${s.w||'the avenue'} at three times the fair price. An envelope shows inside his coat: ${money(s.amt,1)} "for the Mayor's trouble".${histYr()<=1871?' The Ring takes fifteen cents of every dollar the city spends, and the new County Courthouse on Chambers Street has already cost more than Alaska.':''}`,
  opts:s=>[['💵 Take the envelope (👑 −4, and the papers may find out)',()=>{s.res='left';S.stock.gold+=s.amt;const e=EMP();e.cor=Math.min(100,(e.cor||0)+10);prestDown(4);crimeAdd(3);S.expose=S.t+YEAR*(1+Math.random()*1.5);return`💵 ${money(s.amt,1)} go into the city purse with no questions asked 👑 −4`}],
   ['Refuse him politely (👑 +3, Tammany will not forget)',()=>{s.res='left';S.prest+=3;S.unrest=(S.unrest||0)+15;return'He shrugs and puts the envelope away. By evening the ward heelers are telling every saloon that the Mayor is no friend of the working man 👑 +3'}],
   ['👮 Have him arrested for bribery (👑 +7, the wards turn against you)',()=>{s.res='police';S.prest+=7;S.unrest=(S.unrest||0)+30;const e=EMP();e.cor=Math.max(0,(e.cor||0)-10);crimeAdd(-3);return`👮 The papers have it by the evening edition: the Mayor who had a man from ${s.boss} arrested in the street. The reformers cheer; the wards seethe 👑 +7`}]],
  left:s=>{S.unrest=(S.unrest||0)+8;return`🎩 The man from ${s.boss} waits an hour, then goes off to tell the ward heelers that the Mayor is no friend of theirs`}}};
/* Vienna's underworld (w), drawn like New York's (scenes.js maps each to a brawl, a shakedown, a letter or a man in a silk hat): the
   Platten, gangs of young Strizzis from the Vorstädte, fighting it out in Ottakring from the 1880s; a Strizzi and his mates squeezing
   a showman at the Wurstelprater; the brickmakers of the Wienerberg, paid not in coin but in tin tokens good only at the company's
   canteen, until Victor Adler went among them in disguise and wrote it up in 1888; a man from one of the building companies of the
   Ring, or later a contractor, with an envelope. Money is in gulden until the crown takes over */
const wFl=n=>`${fmt(n)} ${histYr()<1900?'fl.':'Kr.'}`,wPol=()=>histYr()>=1869?'the Sicherheitswache':'the police guard';
Object.assign(UW,{
 w_platte:{w:1,make(){const s=uwSpot([48.2105,16.3330],8);if(!s)return null;return Object.assign(s,{g:{n:'the Ottakring Platte',m:'the boys from Hernals'},txt:'⚔️ A Platte fight in Ottakring',q:'⚔️ Majesty, two Platten, the gangs of the Vorstädte, are fighting in Ottakring! Will Your Majesty go?',no:'👮 Leave it to the police'})},
  act:'👮 Order them apart',title:()=>'⚔️ Gang fight in Ottakring',
  text:s=>`Two gangs, ${s.g.n} and ${s.g.m}, are fighting in the street with knives: will you stop it? <br><br>Thirty young Strizzis with knives, belts and cobblestones fill the street, ${s.g.n} on one side and ${s.g.m} on the other, over a girl, a Beisl or nothing at all. The landlords have bolted their doors, and a Wachmann of ${wPol()} watches from the corner, waiting for orders.`,
  opts:s=>[[`👮 Send the police · 👑 +4`,()=>{s.res='police';crimeAdd(-6);S.prest+=4;wardMood(s.x,s.y,8,.06);return`👮 Whistles, then a double line of Wachmänner with drawn sabres. ${ucf(s.g.n)} scatter into the courtyards and the street cheers its Kaiser 👑 +4`}],
   [`🚔 The police, and close their Beisl · −${wFl(300)} · 👑 +6`,()=>{s.res='police';S.stock.gold-=300;crimeAdd(-14);S.prest+=6;wardMood(s.x,s.y,12,.08);return`🚔 The police follow them to their Beisl, close it down and lock up a dozen of ${s.g.n}. Ottakring is quieter than it has been in years 👑 +6`}],
   ['🤷 Let them fight · 👑 −1',()=>{s.res='left';crimeAdd(6);prestDown(1);return'The Platten fight on until they tire. The neighbours saw their Kaiser watch and drive on 👑 −1'}]],
  left:s=>{crimeAdd(8);prestDown(2);wardMood(s.x,s.y,8,-.05);return`⚔️ The fight in Ottakring goes on until dark. Two passers-by are knifed, and ${s.g.n} rule the street 👑 −2`}},
 w_strizzi:{w:1,make(){const s=uwSpot([48.2165,16.3955],8);if(!s)return null;return Object.assign(s,{tr:oneOf(['showman','Beisl landlord','sausage seller','carousel owner','puppet player']),txt:'💰 A Strizzi at the Wurstelprater',q:'💰 Majesty, a Strizzi and his mates are squeezing a showman at the Wurstelprater! Will Your Majesty go?',no:'Not my affair'})},
  act:'🗣️ Speak to the showman',title:()=>'💰 Protection money at the Prater',
  text:s=>`A Strizzi wants protection money from the ${s.tr}: will you step in? <br><br>The ${s.tr} stands by his booth while a Strizzi in a checked suit, his hat on the back of his head, explains with a smile what happens to a booth whose owner forgets to pay his share on a Sunday. Two of his mates lean on the rail, and the children on the swings have gone quiet.`,
  opts:s=>[['👮 Have them arrested · 👑 +3',()=>{s.res='police';crimeAdd(-4);S.prest+=3;return`👮 A Wachmann collars the Strizzi and one of his mates. The ${s.tr} bows to his Kaiser in front of the whole Prater 👑 +3`}],
   [`🏛️ A Wachmann at the Prater for a year · −${wFl(250)} · 👑 +4`,()=>{s.res='police';S.stock.gold-=250;crimeAdd(-10);wardMood(s.x,s.y,10,.08);S.prest+=4;return'🏛️ From tomorrow a Wachmann walks the booths day and night. The showmen stop paying, and the Prater is merrier for it 👑 +4'}],
   [`🤷 Leave it to the district police · 👑 −2`,()=>{s.res='left';crimeAdd(6);prestDown(2);return'The district police take a statement and go. Word gets round the Leopoldstadt that the Kaiser did not trouble himself 👑 −2'}]],
  left:s=>{crimeAdd(5);wardMood(s.x,s.y,8,-.06);return`💰 The ${s.tr} pays. By the end of the month every booth in the Wurstelprater pays too, and the rides cost a kreuzer more`}},
 w_blech:{w:1,make(){const s=uwSpot([48.1745,16.3560],8)||uwSpot([48.1790,16.3710],8);if(!s)return null;return Object.assign(s,{txt:'🪙 Tin money at the Wienerberg',q:'🪙 Majesty, the brickmakers of the Wienerberg beg their Kaiser to see how they are paid. Will Your Majesty go?',no:'Leave it to the owners'})},
  act:'🪙 Look at the tokens',title:()=>'🪙 Paid in tin, not money',
  text:()=>`The brickworks pay their workers in tin tokens that only buy at the company's own canteen: will you stop it? <br><br>A brickmaker from Bohemia holds out his week's pay: not a kreuzer of it in coin, only tin tokens stamped by the works, good at the company's own canteen at the company's prices. Fourteen hours a day at the kilns, his wife and children with him, and at night the families sleep on the drying floors.${histYr()>=1889?' Victor Adler went among them disguised as a worker and wrote it all up in his paper, the Gleichheit, and the whole city knows it now.':''}`,
  opts:()=>[[`🏛️ Make them pay in coin · −${wFl(300)} · 👑 +6`,()=>{S.stock.gold-=300;S.prest+=6;S.unrest=Math.max(0,(S.unrest||0)-25);S.good=Math.max(S.good||0,S.t+YEAR/4);return'🏛️ From the next payday the brickmakers are paid in gulden. In the canteen the prices fall by half overnight 👑 +6'}],
   ['📰 Tell the newspapers · 👑 +3 · the owners are angry',()=>{S.prest+=3;S.unrest=Math.max(0,(S.unrest||0)-10);return'📰 The Neue Freie Presse prints it on its front page. The owners protest to the Statthalter, and the brickmakers cheer you on the next Sunday 👑 +3'}],
   ['🤷 Leave it, it is the custom · 👑 −3',()=>{S.unrest=(S.unrest||0)+20;prestDown(3);return'The brickmakers go back to the kilns in silence. In the canteens of the Wienerberg no one drinks the Kaiser\'s health 👑 −3'}]],
  left:()=>{S.unrest=(S.unrest||0)+12;return'🪙 The brickmakers wait at the kilns until dark, and no one comes from the Hofburg'}},
 w_bau:{w:1,make(){const y=histYr(),s=uwSpot(y<=1873?[48.2142,16.3640]:[48.2108,16.3572],6);if(!s)return null;const amt=y<=1873?2500:1500,boom=y<=1873;return Object.assign(s,{amt,boom,txt:boom?'🎩 A man from a building company asks for an audience':'🎩 A contractor asks for an audience',q:`🎩 Majesty, ${boom?'a director of one of the new building companies of the Ring':'a contractor for the court\'s works'} begs a private word. Will Your Majesty receive him?`,no:'Send word you are busy'})},
  act:'🎩 Hear him out',title:()=>'🎩 A bribe for a favour',
  text:s=>s.boom?`A building company offers ${wFl(s.amt)} if you put in a word for it: will you take it? <br><br>He tips his top hat and speaks of a corner plot on the Ring, to be sold to his company at half its price, and of shares in it that double every month. He offers ${wFl(s.amt)} to the Stadterweiterungsfonds "in gratitude", if Your Majesty will speak a word to its commission. Building companies spring up in Vienna like mushrooms after rain, and half of them have never laid a brick.`:`A contractor offers ${wFl(s.amt)} if you put in a word for him: will you take it? <br><br>He tips his top hat and speaks of the paving of a whole district at three times the fair price. He offers ${wFl(s.amt)} to the court\'s charities "in gratitude", if Your Majesty will speak a word.`,
  opts:s=>[[`💵 Take it · +${wFl(s.amt)} · 👑 −4, the papers may find out`,()=>{s.res='left';S.stock.gold+=s.amt;const e=EMP();e.cor=Math.min(100,(e.cor||0)+10);prestDown(4);crimeAdd(3);S.expose=S.t+YEAR*(1+Math.random()*1.5);return`💵 ${wFl(s.amt)} go into the Fund with no questions asked 👑 −4`}],
   ['🙅 Refuse politely · 👑 +3 · his friends will not forget',()=>{s.res='left';S.prest+=3;S.unrest=(S.unrest||0)+10;return'He shrugs and puts the envelope away. By evening his friends at the Börse are saying the court is bad for business 👑 +3'}],
   ['👮 Hand him to the prosecutor · 👑 +7 · the Börse turns against you',()=>{s.res='police';S.prest+=7;S.unrest=(S.unrest||0)+25;const e=EMP();e.cor=Math.max(0,(e.cor||0)-10);crimeAdd(-3);return'👮 The evening papers have it: the Kaiser who handed a man of the building trade to the prosecutor. The coffee houses cheer; the Börse seethes 👑 +7'}]],
  left:()=>{S.unrest=(S.unrest||0)+6;return'🎩 The man waits an hour in the anteroom, then goes off to tell his friends at the Börse that the court is no friend of theirs'}}});
function uwTick(){if(S.crime==null)S.crime=30;
 if(S.t>=(S.uwC||0)){S.uwC=S.t+2;const pol=S.list.filter(o=>o.t==='polizei'&&!o.bld).length;S.crime+=(Math.max(8,34-pol*4)-S.crime)*.004}
 if(S.expose&&S.t>=S.expose){S.expose=0;if(Math.random()<.5){prestDown(15);{const y=histYr();evOv('📰 The envelope comes out',`${!NYC()?(y<1892?'Daniel Spitzer makes sport of you in his Wiener Spaziergänge in the Neue Freie Presse':y<1899?'The Neue Freie Presse prints the story of the gift':'Karl Kraus prints the story of the gift in Die Fackel'):y<=1872?'Thomas Nast draws you in Harper\'s Weekly with a moneybag for a head':'The New York Times prints the story of the Tammany envelope'}. ${NYC()?'The whole city is laughing at its Mayor':'All Vienna whispers about the court'}. 👑 −15`)}}}
 if(!S.uwT){S.uwT=S.t+YEAR*(.8+Math.random());return}if(S.t<S.uwT)return;S.uwT=S.t+YEAR*(1.2+Math.random()*1.3)*(S.crime>50?.7:1);
 const y=histYr(),ks=NYC()?['brawl','shake','bribe']:['w_strizzi','w_bau'];if(NYC()&&y>=1903)ks.push('letter','letter');if(!NYC()){if(y>=1880)ks.push('w_platte');if(y<1891)ks.push('w_blech')}uwStart(oneOf(ks))}
function uwStart(k){if(!S||!histHere(UW[k]))return false;if(sceneHold(false,()=>uwStart(k)))return true;const u=UW[k],s=u.make();if(!s)return false;
 Object.assign(s,{k,t0:S.t,t1:S.t+UW_T});sceneAsk(s,s.q,s.no);S.sc=s;sfx(k==='brawl'||k==='w_platte'?'boom':'chime');sceneShow();return true}
function uwAct(s){if(s.att)return;s.att=1;const u=UW[s.k];evChoice(u.title(s),u.text(s),u.opts(s).map(([l,f])=>[l,()=>{s.end=S.t+6;sceneShow();sfx('chime');toast(f())}]))}
function uwEnd(s){sceneEnd();toast(UW[s.k].left(s))}

/* ---------- murder cases: a body is found (under a sheet, a policeman beside it); the Mayor goes on foot, hears the police and two or
   three witnesses on the real streets, each sending him on to the next, and names the culprit. A right answer raises his standing, a
   wrong one costs it. Each case is data: who stands where (lat, lon), what they say (say: the line spoken aloud), the suspects and
   who did it; S.case holds the one under way (saved), and street.js walks it ---------- */
const CASES={
 fulton:{yr:[1865,1890],short:'The body at Fulton Market',title:'🕵️ Murder at Fulton Market!',prest:10,
  ask:'A ship chandler\'s clerk has been found dead behind the fish stalls of Fulton Market at first light, his pockets turned out. The roundsman of the Second Precinct is standing over him.',
  left:'🕵️ The clerk at Fulton Market is buried in Potter\'s Field, and no one is ever charged',
  steps:[{at:[40.7066,-74.0032],who:'The roundsman at Fulton Market',seed:.5,kind:9,body:1,go:'walk to Fulton Market and talk to the roundsman by the body',pl:'Fulton Market',say:'Under the sheet, sir. Poor devil never saw it coming.',
    txt:'"Thomas Byrne, sir, clerk to a ship chandler on South Street. Struck from behind, last night, and his week\'s wages gone. The fishwives found him. One of them, Mrs. Dolan, saw him drinking with a sailor off a Liverpool packet."'},
   {at:[40.7072,-74.0021],who:'Mrs. Dolan, who sells oysters at the market',seed:.86,go:'walk to the oyster stalls and talk to Mrs. Dolan',pl:'Oyster stalls',say:'I saw him, I did, with a sailor, God rest him.',
    txt:'"He was drinking with a sailor, a big Liverpool man with a tarred pigtail, and they quarrelled over cards. But the sailor went off to his ship at ten, I saw him go. After that Tom went along Water Street with a little man in a checked suit who stood all the drinks. Ask at the boarding house on Cherry Street where Tom lodged."'},
   {at:[40.7112,-73.993],who:'Mrs. Kerrigan, who keeps the boarding house on Cherry Street',seed:.7,go:'walk to Cherry Street and talk to Mrs. Kerrigan at the boarding house',pl:'Cherry Street',say:'He owed me two weeks, but he was a good lad.',
    txt:'"His partner in the chandlery, Mr. Platt, came here last week shouting about missing money. But a little man in a checked suit was asking for Tom too, two days ago: \'Shanghai\' Carey, who sells drunken men to ships short of a crew. Tom told me he had refused him. Carey drinks at the dive on Water Street by the old Sportsmen\'s Hall."'},
   {at:[40.7093,-74.0003],who:'The barkeeper of a Water Street dive',seed:.42,go:'walk to Water Street and talk to the barkeeper of the dive',pl:'Water Street',say:'I didn\'t see nothing, and I\'ll say it again.',
    txt:'"Carey was in here at midnight with blood on his cuff and money to burn, buying for the house. Said he\'d been paid back what he was owed. The sailor? His packet sailed at dawn. And Mr. Platt has never set foot in a place like this."'}],
  sus:[['Mr. Platt, the partner in the chandlery','He shouted about missing money'],['The Liverpool sailor','He quarrelled with the clerk over cards'],['"Shanghai" Carey, the crimp','He was turned down, and was flush with money that night']],did:2,
  win:'🕵️ The police take "Shanghai" Carey at the Water Street dive with Thomas Byrne\'s watch still in his pocket. He was turned away, and came back for the clerk\'s wages. The waterfront talks of nothing but the Mayor who walked the case himself. 👑 +10',
  lose:n=>`🕵️ ${n} is taken in, and let go a week later for want of any proof. The real killer drinks on Water Street, and the papers make sport of the Mayor turned detective. 👑 −6`},
 nathan:{yr:[1870,1885],short:'The Nathan murder',title:'🕵️ Murder at 12 West 23rd Street!',prest:12,
  ask:'Benjamin Nathan, the banker, vice-president of the Stock Exchange, has been found dead in the study of his house on West 23rd Street, facing Madison Square. His sons found him at dawn. The whole city is talking of it.',
  left:'🕵️ The police question everyone and charge no one. The Nathan murder joins the city\'s great unsolved crimes, as it did in the real New York',
  steps:[{at:[40.7414,-73.9932],who:'The precinct captain at the Nathan house',seed:.5,kind:9,body:1,go:'walk to 12 West 23rd Street and talk to the precinct captain',pl:'12 West 23rd Street',say:'A terrible business, Mr. Mayor. Terrible.',
    txt:'"He lies in the study, under the sheet. The safe stands open: his gold watch, his diamond studs and some money are gone. By the body lay a carpenter\'s dog, an iron clamp no banker ever owned, and it did the work. His son Washington came home late and they had words, the servants say. Speak to the newsboy who sleeps in the doorway of the Fifth Avenue Hotel across the square: he sees everything."'},
   {at:[40.7419,-73.9895],who:'A newsboy at the Fifth Avenue Hotel',seed:.95,go:'cross Madison Square and talk to the newsboy at the Fifth Avenue Hotel',pl:'Fifth Avenue Hotel',say:'',
    txt:'"Mr. Washington came home in a cab past midnight, singing, and went straight in and up to bed: I heard the window. But at five, when it was getting light, a man came up the area steps of the Nathan house with a bundle under his arm and walked fast toward Sixth Avenue. Red whiskers, and a carpenter\'s apron under his coat. Gold goes to the pawnshops on the Bowery in this town, mister."'},
   {at:[40.7196,-73.9934],who:'A pawnbroker on the Bowery',seed:.15,go:'walk down to the Bowery and talk to the pawnbroker',pl:'The Bowery',say:'I keep an honest shop, Mr. Mayor. Ask anyone.',
    txt:'"A fellow brought me a gold watch this morning with B. N. engraved on the case. I said I would need a day to find that much money, and he ran. Red whiskers. A carpenter who did odd jobs uptown, fixing shutters and the like. They call him Dutch Heiser, and he drinks in a cellar in Mulberry Bend. The Nathans\' own handyman? He was in here last month, but only to redeem his Sunday coat."'},
   {at:[40.716,-73.9989],who:'The keeper of a cellar saloon in Mulberry Bend',seed:.45,go:'walk to Mulberry Bend and talk to the keeper of the cellar saloon',pl:'Mulberry Bend',say:'Mind the steps. And mind your pockets.',
    txt:'"Dutch was flush last night, buying for the house, with a dried brown stain on his cuff. He boasted he knew a rich man\'s house on 23rd Street from fixing the shutters there last spring, and where the safe was. The banker\'s son? A swell like that has never been down these steps."'}],
  sus:[['Washington Nathan, the banker\'s son','He came home late and quarrelled with his father'],['William Kelly, the family\'s handyman','He had the run of the house'],['Dutch Heiser, a carpenter','He tried to pawn a watch marked B. N.']],did:2,
  win:'🕵️ Dutch Heiser is taken in Mulberry Bend with the diamond studs sewn into his coat lining. Every paper in the city has the Mayor on its front page. (In the real New York the Nathan murder of 1870 was never solved.) 👑 +12',
  lose:n=>`🕵️ ${n} is arrested and the papers hound him for weeks, but there is no proof, and he is let go. The real killer is never found, as in the real New York. 👑 −6`},
 barrel:{yr:[1903,1916],short:'The barrel murder',title:'🕵️ A body found in a barrel!',prest:12,
  ask:'At dawn a cleaning woman found a barrel on the sidewalk at East 11th Street and Avenue D, and in it the body of a man, stabbed. No one in the street will say a word. Detective Sergeant Joseph Petrosino is on his way.',
  left:'🕵️ The barrel murder is never brought to trial, and the Morello gang goes on as before',
  steps:[{at:[40.7268,-73.9766],who:'Detective Sergeant Joseph Petrosino',seed:.2,kind:9,body:1,go:'walk to East 11th Street and Avenue D and talk to Petrosino',pl:'East 11th Street',say:'Nobody saw nothing, Mr. Mayor. They never do.',
    txt:'"A man of about forty, from Sicily by his clothes. The barrel is from a pastry shop: there is sugar in the sawdust, and a mark on it from a café on Elizabeth Street that the Secret Service has been watching for counterfeiters. Go and look at it. I will have the morgue photographs shown round the Italian boarding houses."'},
   {at:[40.7224,-73.9944],who:'A waiter at the café on Elizabeth Street',seed:.38,go:'walk to Elizabeth Street and talk to the waiter at the café',pl:'Elizabeth Street',say:'I serve coffee, signore. I see nothing.',
    txt:'"He was here, the man in the photograph, two nights ago, with Morello\'s men. They ate, they argued in the back room, they left together. One of them they call the Ox, a big man. He had the dead man\'s watch on his chain yesterday. Then he had no watch. Ask the pawnshops on the Bowery."'},
   {at:[40.7187,-73.9935],who:'A pawnbroker on the Bowery',seed:.15,go:'walk down to the Bowery and talk to the pawnbroker',pl:'The Bowery',say:'A watch is a watch. I don\'t ask whose.',
    txt:'"A big Sicilian pawned this watch yesterday for one dollar, a good watch. Here is the stub. The café owner? He never comes in here himself, he sends men. The dead man\'s brother-in-law came asking for him too, but only this morning, crying."'}],
  sus:[['Pietro Inzerillo, the café owner','The barrel came from his café'],['The dead man\'s brother-in-law','He came asking after him'],['Tomasso Petto, "the Ox"','He pawned the dead man\'s watch']],did:2,
  win:'🕵️ Petto, "the Ox", is taken with the pawn ticket for the dead man\'s watch in his pocket. Petrosino shakes your hand on the steps of Police Headquarters. (In the real barrel murder of 1903 Petto was indicted, but the case never came to trial.) 👑 +12',
  lose:n=>`🕵️ ${n} is held for a week and let go. Petrosino says nothing, which is worse than anything he could say. 👑 −6`},
 /* Vienna's (w): Hugo Schenk, who promised servant girls marriage and took their savings, 1883–84. No body is found (nob): the girls
    have simply gone. It opens of itself in the autumn of 1883 (at) */
 schenk:{w:1,nob:1,yr:[1883,1884],at:[1883,10],short:'The vanished servant girls',title:'🕵️ The vanished servant girls',prest:12,
  ask:'A cook in the Josefstadt left her place to marry a gentleman she had met on a Sunday in the Prater, and took her savings book with her. Nothing has been heard of her since, and the Wachmann of the district says she is not the first servant girl this year to go that way.',
  left:'🕵️ The police find nothing, and more servant girls leave their places to marry a gentleman and are never seen again',
  steps:[{at:[48.2110,16.3505],who:'The mistress of a house in the Lange Gasse',seed:.66,go:'walk to the Lange Gasse in the Josefstadt and talk to the cook\'s mistress',pl:'Lange Gasse',say:'Fifteen years she cooked for us, Your Majesty. Fifteen years.',
    txt:'"Our cook Anna was thirty-four and had put by every kreuzer: eight hundred gulden in the Erste Spar-Casse on the Graben. In the spring she met an engineer in the Prater, a fine-spoken gentleman, and on All Saints\' she gave notice to marry him. A card came from Linz, \'we are happy\', and since then nothing. Ask at the Spar-Casse."'},
   {at:[48.2087,16.3700],who:'A clerk of the Erste Spar-Casse on the Graben',seed:.12,go:'walk to the Graben and talk to the clerk of the Spar-Casse',pl:'The Graben',say:'Our books are confidential, Your Majesty. But for you...',
    txt:'"She drew out every gulden the day before she left, and a gentleman waited for her at the door, tall, well dressed, who did the talking. He came in the summer too, with another girl, a lady\'s maid, who drew out her savings the same way. Both girls had found their places through the servants\' registry by the Naschmarkt."'},
   {at:[48.1987,16.3640],who:'The keeper of the servants\' registry by the Naschmarkt',seed:.84,go:'walk to the Naschmarkt and talk to the keeper of the servants\' registry',pl:'Naschmarkt',say:'I find good girls good places. That\'s all I do.',
    txt:'"A gentleman comes asking after girls, not young ones: cooks of thirty with a little put by, who want a husband before it is too late. Anna\'s sweetheart, Franz the Fiaker, came here shouting that she had jilted him. And the gentleman once let slip that he travelled by the Westbahn. The porters there see everyone."'},
   {at:[48.1966,16.3376],who:'A porter at the Westbahnhof',seed:.42,go:'walk out to the Westbahnhof and talk to the porter',pl:'Westbahnhof',say:'Your trunk, sir? Majesty! Forgive me.',
    txt:'"That gentleman, yes. Twice this year he took the Linz train with a girl and her trunk, and came back alone a day or two later, with the trunk. Franz the Fiaker? He has stood with his cab on the Graben every night this month, his mates will swear to it. And the registry woman has not left Vienna in twenty years."'}],
  sus:[['Franz, the Fiaker who courted Anna','She jilted him'],['The keeper of the servants\' registry','She knew which girls had savings'],['The "engineer" from the Prater','He took girls away by train, and came back alone']],did:2,
  win:'🕵️ On your word the police wait for the "engineer" at the Westbahnhof. His name is Hugo Schenk, and in his rooms they find the savings books of the missing girls. Vienna calls him the Dienstbotenmörder, the maid-murderer. (The real Hugo Schenk lured servant girls with promises of marriage, was arrested in Vienna in January 1884 and hanged that April.) 👑 +12',
  lose:n=>`🕵️ ${n} is held for a week and let go, and the papers whisper about the Kaiser turned detective. More girls give notice to marry a gentleman. 👑 −6`},
 /* the detective stories of the time, played in their Vienna: Auguste Groner's Joseph Müller of the Vienna police (from the 1890s) and
    Balduin Groller's Dagobert Trostler, the gentleman detective of the salons (1890s to 1910). Their authors died long ago, and the plots
    are theirs; Groner set the lamp in Hietzing, beyond the map's edge, so here it burns in Döbling */
 lamp:{w:1,yr:[1888,1912],short:'The lamp that went out',title:'🕵️ A shot among the villas!',prest:12,key:'Thorne asked the housekeeper to put out her red lamp whenever his wife went out',
  ask:'At first light a bookkeeper has been found shot in the back in a quiet lane among the villas of Döbling. A tramp has been taken with the dead man\'s watch. Joseph Müller of the police, a modest man his superiors underrate, does not believe it was the tramp.',
  left:'🕵️ A tramp is tried for the shot in Döbling, and the real killer goes free',
  steps:[{at:[48.2400,16.3480],who:'Joseph Müller of the Vienna police',seed:.3,kind:9,body:1,go:'walk to the lane in Döbling and look round with Joseph Müller',pl:'Döbling',say:'Shot from behind, Majesty, from close by.',
    items:[['the dead man\'s coat','Three hundred gulden sewn into Winkler\'s coat: no robber would have left them'],['the garden fence','A willow twig in the garden fence is freshly broken: someone came through from a garden'],['the footprints','Fine town shoes by the fence, not a tramp\'s boots']],
    txt:'"The tramp robbed a dead man, Majesty, nothing more. Leopold Winkler kept books for an importing house and had far more money than that pays. His landlady in the Wieden will know who wrote to him."'},
   {at:[48.1930,16.3660],who:'Winkler\'s landlady in the Wiedner Hauptstraße',seed:.8,sign:'Zimmer zu vermieten',go:'walk to the Wiedner Hauptstraße and question Winkler\'s landlady',pl:'Wieden',say:'Such a quiet lodger. Paid on the first, every month.',
    txt:'"Herr Winkler? Quiet, tidy, never late with the rent. What does Your Majesty want to know?"',
    q:[['Who wrote to him?','"A lady, in a fine hand, always from Döbling. He burnt the letters in the stove."','Winkler had letters from a lady in Döbling'],
     ['Did anyone come asking for him?','"A young gentleman, shouting about a debt of honour: a Herr Leining. He plays cards every evening at the Café Schwarzenberg on the Kärntner Ring."','Theobald Leining came shouting about a debt'],
     ['Where did his money come from?','"Not from his books, I can tell you. A new coat every season, and a gold watch."','Winkler had far more money than a bookkeeper earns']]},
   {do:'follow',at:[48.2025,16.3720],to:[48.2069,16.3693],who:'Theobald Leining',seed:.18,sign:'Café Schwarzenberg',go:'walk to the Café Schwarzenberg and follow Theobald Leining when he leaves, without him seeing you',pl:'Kärntner Ring',
    txt:'Leining hurries into the Dorotheum, the state pawnshop, with his gold watch, and comes out without it, counting notes. A man who pawns his watch the morning after has gained nothing by Winkler\'s death: he was paying Winkler for his sister, not killing him.',clue:'Leining pawned his own watch: Winkler\'s death gained him nothing'},
   {at:[48.2410,16.3500],who:'Adele Bernauer, housekeeper of the villa next to the painter Thorne\'s',seed:.9,go:'walk back to Döbling and question the housekeeper of the villa next door',pl:'The villas of Döbling',say:'I keep myself to myself, Majesty.',
    txt:'"The house next door is the painter Thorne\'s, Majesty. His young wife is Herr Leining\'s sister. I see a great deal from my window."',
    q:[['Why is there a red lamp in your window?','"I put it out whenever Frau Thorne goes out at night. Herr Thorne asked me to, months ago, and pays me for it."','Thorne asked the housekeeper to put out her red lamp whenever his wife went out'],
     ['Where does Herr Thorne work?','"In his studio, late into the night, with tall mirrors over his desk. He sees my window in them without turning round."','Thorne sees the housekeeper\'s window in the mirrors over his desk'],
     ['And on the night of the shot?','"I put the lamp out at nine, when she slipped out. A little later their garden gate creaked, twice."','The lamp went out at nine, and soon after the Thornes\' garden gate creaked']]}],
  sus:[['Johann Knoll, the tramp','He had the dead man\'s watch'],['Herbert Thorne, the painter','The red lamp, the mirrors, the garden gate'],['Theobald Leining, the half-brother','Winkler was blackmailing him']],did:1,
  win:'🕵️ Herbert Thorne breaks down when Müller tells him about the red lamp. When it went out he knew his wife had gone to Winkler, who was blackmailing her over her brother\'s cheating at cards, and he followed the man into the lane and shot him. Joseph Müller is promoted at last. (After Auguste Groner\'s Joseph Müller story of the lamp that went out, which she set in Hietzing.) 👑 +12',
  lose:n=>`🕵️ ${n} is held, and Joseph Müller shakes his head. The painter goes on painting behind his mirrors. 👑 −6`},
 letter:{w:1,yr:[1890,1914],short:'The registered letter',title:'🕵️ A shot in Ottakring!',prest:12,key:'Siders posted a registered letter at five, hours before the shot, to be delivered only after it',
  ask:'A quiet lodger in Ottakring, John Siders, lately home from America, has been found shot in his room. His friend Albert Graumann has been arrested, because his revolver lay beside the body. Joseph Müller of the police is not so sure.',
  left:'🕵️ Albert Graumann is tried for murder, and the prosecutor wins his case',
  steps:[{at:[48.2100,16.3200],who:'Joseph Müller, at the dead man\'s lodging',seed:.3,kind:9,sign:'Zimmer zu vermieten',go:'walk to Ottakring and look round the dead man\'s lodging with Joseph Müller',pl:'Ottakring',say:'Look round, Majesty. Touch nothing.',
    items:[['the revolver','Graumann\'s revolver lies by Siders\' right hand'],['the money box','The money box is empty, but it was opened with its own key'],['the blotter','On the blotter, in mirror writing: "Frankfurt" and "registered"']],
    txt:'"Graumann was here last night and they quarrelled, so they took him in. But a thief who opens a money box with its own key, and leaves the gun behind? Graumann\'s aunt lives in the Josefstadt. Let us hear her."'},
   {at:[48.2110,16.3480],who:'Babette Graumann, Albert\'s aunt',seed:.82,go:'walk to the Josefstadt and question Babette Graumann',pl:'Josefstadt',say:'My Albert never harmed a fly, Majesty.',
    txt:'"Albert is no murderer, Majesty! Ask me whatever you like."',
    q:[['Why was Albert\'s revolver there?','"Albert lent it to Siders himself, for the voyage home from America. Siders never gave it back."','Albert had lent Siders the revolver weeks before'],
     ['What did they quarrel about?','"About our ward, Eleonora Roemer. Siders courted her, and she went to her aunt in Frankfurt to be rid of him."','Siders courted Eleonora Roemer, who now lives in Frankfurt'],
     ['Did Siders have enemies?','"He asked about one man only, again and again: Prosecutor Schmidt, who is to try Albert now."','Siders asked again and again about Prosecutor Schmidt']]},
   {at:[48.2105,16.3505],who:'The clerk at the post office counter',seed:.4,sign:'K.k. Postamt',go:'walk to the post office in the Josefstädter Straße and question the clerk',pl:'Post office',say:'Registered, to Frankfurt. I remember the hand.',
    txt:'"Herr Siders? The gentleman from America, yes, Majesty. He was here yesterday."',
    q:[['Did he post a letter?','"A registered letter, at five in the afternoon, and he asked that it not be delivered before tomorrow. Here is the slip."','Siders posted a registered letter at five, hours before the shot, to be delivered only after it'],
     ['To whom?','"To a Fräulein Eleonora Roemer, in Frankfurt."','The letter went to Eleonora Roemer in Frankfurt']]},
   {at:[48.2135,16.3614],who:'An old clerk of the Landesgericht, at the Café Landtmann',seed:.14,sign:'Café Landtmann',go:'walk to the Café Landtmann on the Ring and question the old court clerk',pl:'Café Landtmann',say:'I never forget a face from the dock, Majesty.',
    txt:'"Thirty years at the Landesgericht, Majesty, and now I read the papers here all morning. Show me what you have."',
    q:[['Do you know this face?','"Siders? That is Theodor Bellmann! Sentenced for theft twelve years ago. He went to America when they let him out."','Siders was really Theodor Bellmann, once sentenced for theft'],
     ['Who sent him to prison?','"A young prosecutor: Gustav Schmidt. Bellmann swore in the dock that one day he would make Schmidt hang an innocent man."','Bellmann swore to make Prosecutor Schmidt hang an innocent man']]}],
  sus:[['Albert Graumann, his friend','His revolver lay by the body'],['A thief after his money','The money box is empty'],['No one: Siders shot himself','To see Graumann hanged and Schmidt disgraced']],did:2,
  win:'🕵️ The registered letter is fetched from Frankfurt. In it Theodor Bellmann tells Eleonora how he shot himself with Graumann\'s revolver and hid his money, so that Prosecutor Schmidt would send an innocent man to the gallows. Graumann walks free, and Schmidt thanks Your Majesty. (After Auguste Groner\'s Joseph Müller story of the registered letter.) 👑 +12',
  lose:n=>`🕵️ ${n} is held, and the prosecutor builds his case. A letter from Frankfurt arrives too late to stop the scandal. 👑 −6`},
 letters:{w:1,nob:1,yr:[1895,1914],short:'The anonymous letters',title:'🕵️ Anonymous letters!',prest:10,key:'This afternoon\'s letter is written in Dagobert\'s bronze ink',
  ask:'Frau Violet Grumbach, wife of the industrialist and once an actress, receives letter after letter in disguised capitals, each crueller than the last. Her friend Dagobert Trostler, the gentleman detective of the salons, asks Your Majesty to walk the case with him.',
  left:'🕵️ The letters go on, and Frau Grumbach leaves Vienna for a spa',
  steps:[{at:[48.2000,16.3850],who:'Dagobert Trostler, at the Grumbachs\' house',seed:.12,go:'walk to the Reisnerstraße and look over the letters with Dagobert Trostler',pl:'Reisnerstraße',say:'Paper tells more than people, Majesty.',
    items:[['this week\'s letter','Disguised capitals on heavy paper with a crowned swan for a watermark'],['the envelope','Crumbs of hand-rolled Turkish tobacco in the envelope'],['the visitors\' book','Of the friends of the house, Walter Frankenburg comes every Thursday']],
    txt:'"Paper tells more than people, Majesty. Only one stationer in Vienna sells the swan paper, on the Graben."'},
   {at:[48.2087,16.3695],who:'The stationer on the Graben',seed:.55,sign:'Papierhandlung',go:'walk to the Graben and question the stationer',pl:'The Graben',say:'Only the best customers take the swan, Majesty.',
    txt:'"The swan paper, Majesty? Our finest. Few can afford it."',
    q:[['Who buys it?','"Three customers: Herr Grumbach\'s own office, Hofrat Weiss, who is eighty, and Herr Walter Frankenburg of the Schottenring."','The swan paper: Grumbach\'s office, the old Hofrat Weiss and Walter Frankenburg'],
     ['Has anyone bought much of late?','"Herr Frankenburg took a whole box, a month ago. He is just leaving, there, by the door."','Frankenburg bought a whole box of swan paper a month ago']]},
   {do:'follow',at:[48.2087,16.3700],to:[48.2153,16.3655],who:'Walter Frankenburg',seed:.25,go:'follow Walter Frankenburg from the Graben, without him seeing you',pl:'The Graben',
    txt:'Frankenburg walks to his club on the Schottenring and sits down at his usual desk in the reading room. Dagobert Trostler is already there behind a newspaper, and winks: this morning he filled that desk\'s ink well himself, with a bronze ink.',clue:'Dagobert filled the ink well at Frankenburg\'s desk with a bronze ink'},
   {at:[48.2005,16.3855],who:'Dagobert Trostler, with this afternoon\'s letter',seed:.12,go:'walk back to the Reisnerstraße and see this afternoon\'s letter with Dagobert Trostler',pl:'Reisnerstraße',say:'Hold it to the light, Majesty.',
    txt:'"It came by the four o\'clock post, Majesty. Hold it to the window."',
    q:[['What do you see?','"The capitals shine like bronze in the light."','This afternoon\'s letter is written in Dagobert\'s bronze ink'],
     ['Who else uses that desk?','"No one, Majesty. The servants keep it for Herr Frankenburg."','Only Frankenburg writes at that desk']]}],
  sus:[['Walter Frankenburg, the old friend','The swan paper, the tobacco, the bronze ink'],['Herr Grumbach\'s clerk','His office buys the swan paper'],['Franz, the Grumbachs\' butler','He knows the house and its evenings']],did:0,
  win:'🕵️ Faced with his own bronze capitals, Walter Frankenburg confesses: he loved Violet once, and could not bear her happy. As Dagobert does things, there is no court and no scandal: Frankenburg leaves Vienna for good, after a handsome gift to Frau Grumbach\'s charity. (After Balduin Groller\'s Dagobert story of the anonymous letters.) 👑 +10',
  lose:n=>`🕵️ ${n} is dismissed in disgrace, and the next letter comes all the same. Dagobert Trostler says nothing, which is worse. 👑 −6`},
 vault:{w:1,yr:[1898,1914],short:'The bank break-in',title:'🕵️ The vault is empty!',prest:12,key:'The cobbler patched that left sole for the night porter Hartwanger',
  ask:'Over Whitsun burglars broke into the vault of a building bank in the Schottengasse and emptied a safe: 164,000 kronen. Oberkommissär Skrinsky is sure it was an English gang. Dagobert Trostler, who sits on the bank\'s board, asks Your Majesty to look for yourself.',
  left:'🕵️ Skrinsky hunts an English gang across Europe, and the money is never seen again',
  steps:[{at:[48.2125,16.3640],who:'Oberkommissär Skrinsky, at the bank',seed:.45,kind:9,sign:'Allgemeine Baubank',go:'walk to the bank in the Schottengasse and question Oberkommissär Skrinsky',pl:'Schottengasse',say:'International work, Majesty. The best I have seen.',
    txt:'"An English gang, Majesty, the same as at the Schottenhof. I have wired every frontier."',
    q:[['What did they take?','"164,000 kronen from the small safe. The big one they never touched."','Only the small safe was opened, the one the night porter dusts'],
     ['What did they leave behind?','"Two English collars, a London cigar and a cufflink stamped Birmingham!"','English collars, a London cigar, a Birmingham cufflink, all lying in plain sight']]},
   {at:[48.2106,16.3676],who:'Dagobert Trostler, in the bank\'s back yard',seed:.12,go:'walk round to the bank\'s back yard on Am Hof and search it with Dagobert Trostler',pl:'Am Hof',say:'Too many clues, Majesty, and all of them laid out.',
    items:[['the footprints','One man\'s boots in the sand of the yard, in and out, again and again'],['a boot print','The left sole is patched across the ball'],['the iron bar','The iron bar comes from the bank\'s own coal cellar']],
    txt:'"English gentlemen do not leave their collars behind, Majesty. One man did this, and he knew the house. A cobbler knows every patched sole in his street."'},
   {at:[48.2133,16.3685],who:'A cobbler in the Wipplingerstraße',seed:.7,sign:'Schuhmacher',go:'walk to the Wipplingerstraße and question the cobbler',pl:'Wipplingerstraße',say:'I know every sole in this street, Majesty.',
    txt:'"A drawing of a sole, Majesty? Let me see."',
    q:[['Whose sole is this?','"That patch is mine, a fortnight old: the bank\'s night porter, Hartwanger. Always short of money since his wife fell ill."','The cobbler patched that left sole for the night porter Hartwanger'],
     ['And the cashier\'s boots?','"From the Kärntner Straße, Majesty, at four times my price."','The cashier has his boots made in the Kärntner Straße']]},
   {do:'follow',at:[48.2125,16.3640],to:[48.2180,16.3560],who:'Hartwanger, the night porter',seed:.5,go:'wait at the bank and follow Hartwanger home, without him seeing you',pl:'Schottengasse',
    txt:'Hartwanger lets himself into a house in the Alsergrund and, before he goes up, carries a heavy bag down into its coal cellar by lantern light. He comes up without the bag.',clue:'Hartwanger carried a heavy bag down into his coal cellar'}],
  sus:[['The English gang of the Schottenhof job','The collars, the cigar, the cufflink'],['Hartwanger, the night porter','One man\'s boots, a patched left sole'],['The bank\'s cashier','He has the keys to the vault']],did:1,
  win:'🕵️ Hartwanger goes white when Dagobert lays the drawing of his sole on the table, and leads him down to his coal cellar, where the money lies under the coal. As Dagobert does things, the bank gets its money back without a trial, and the porter a little of it for his sick wife, to repay in time. Skrinsky does not speak to him for a month. (After Balduin Groller\'s Dagobert story of the bank break-in.) 👑 +12',
  lose:n=>`🕵️ ${n} is suspected, and Skrinsky\'s wires go out to every frontier. The money stays where it is, under someone\'s coal. 👑 −6`}};
/* ---------- Empress Elisabeth, in Vienna: her own wishes as they came, each one a choice for the Emperor that moves her mood
   (EMP().sisi) and Hungary's (hun); and the days that were simply hers (note). Her mood tells by itself: a happy Empress keeps
   Hungary close, an unhappy one is away for months and the court talks. It ends with Geneva, 10 September 1898 (the level's own
   event, and the burial in the street) ---------- */
const SISI=[
 {id:'ultim',at:[1865,8,.8],t:'👑 The Empress\'s ultimatum',x:'Majesty, a letter from the Empress at Ischl. Count Gondrecourt, whom your mother chose as tutor to the Crown Prince, drills the seven-year-old Rudolf with cold baths and pistol shots in the night to harden him. Sissi writes that either the upbringing of her children is hers, or she leaves.',
  o:[['Give her the children\'s upbringing, as you did: Gondrecourt goes',{sisi:25,rud:15}],['Side with your mother, Archduchess Sophie',{sisi:-25,rud:-10,prest:3}]]},
 {id:'andrassy',at:[1867,1,.6],t:'👑 Sissi pleads for Hungary',x:'Majesty, the Empress has learnt Hungarian, and Count Gyula Andrássy and the Hungarians trust her as they trust no one in Vienna. After Königgrätz she begs you to give Hungary its own government, with Andrássy at its head.',
  o:[['Appoint Andrássy, as you did in February 1867',{sisi:15,hun:25}],['Keep Hungary governed from Vienna',{sisi:-20,hun:-25}]]},
 {id:'kron',at:[1867,6,.3],t:'👑 The coronation in Buda',x:'Majesty, on 8 June you and the Empress are crowned King and Queen of Hungary. Hungary has not forgotten 1849: Count Batthyány shot in Pest, thirteen generals executed at Arad, and no mercy from you. Now the country gives you both a gift of gold for the coronation. The Empress asks you to give it to the widows and orphans of the Honvéd, the Hungarian soldiers who fought against you.',
  o:[['Give the gold to the Honvéd widows and orphans, as you did',{sisi:10,hun:15,prest:-2}],['Keep the gift',{sisi:-10,hun:-15}]]},
 {id:'valerie',at:[1868,4,.7],note:'👶 22 April 1868: the Empress gives birth to Archduchess Marie Valerie in Buda. Sissi calls her her Hungarian child, and keeps her close as she was never allowed to keep the others',fx:{sisi:10,hun:5}},
 {id:'hunt',at:[1876,2,.2],t:'🐎 The Empress wants to hunt in England',x:'Majesty, the Empress wants to ride to hounds in England this spring, with her own horses and grooms. She is the finest horsewoman in Europe, and the court ceremony of the Carnival weighs on her.',
  o:[['Let her go: the horses and the house cost 1,500',{gold:-1500,sisi:15}],['Ask her to stay for the Carnival balls',{sisi:-15,prest:3}]]},
 {id:'hermes',at:[1882,5,.2],t:'🏡 A villa for the Empress',x:'Majesty, Sissi longs for a house of her own, far from the court. In the Lainzer Tiergarten Carl von Hasenauer could build her a villa among the deer, her "castle of dreams".',
  o:[['Build it for her, as you did: −3,000',{gold:-3000,sisi:20}],['Not now',{sisi:-10}]]},
 {id:'schratt',at:[1886,5,.2],t:'🎭 A portrait from the Empress',x:'Majesty, Sissi has had Heinrich von Angeli paint the Burgtheater actress Katharina Schratt, and gives you the portrait. She would like you to have a friend in Vienna while she travels.',
  o:[['Accept it, and take tea with Frau Schratt',{sisi:10}],['Thank her, and put it away',{sisi:-5}]]},
 {id:'poems',at:[1887,2,.4],t:'🖋️ The Empress writes poems',x:'Majesty, the court whispers that the Empress writes poems in secret, in the manner of Heinrich Heine, whom she calls her master. In them she is Titania, the fairy queen, and you are Oberon. Some mock the court, and some say the time of kings will pass. She keeps them locked away, for readers of a later time.',
  o:[['Leave her the poems',{sisi:12}],['Ask to read them',{sisi:-15}]]},
 {id:'mayerling',at:[1889,1,.97],card:1},
 {id:'achill',at:[1890,3,.2],t:'🏛️ The Achilleion',x:'Majesty, Sissi wants a palace of her own on Corfu, the Achilleion, for her hero Achilles. She will pay for it from her own fortune and asks only your blessing. She will be away from Vienna more than ever.',
  o:[['Give her your blessing',{sisi:15,prest:-2}],['Ask her to stay in Vienna',{sisi:-20}]]},
 {id:'sophie',at:[1897,5,.15],note:'🔥 May 1897: the Empress\'s sister Sophie, Duchess of Alençon, dies in the fire at the Bazar de la Charité in Paris. Sissi hardly speaks for weeks',fx:{sisi:-10}}];
function sisiTick(){if(NYC()||S.t>=yT(1898,9,.33))return;const e=EMP(),d=e.done||(e.done={});
 /* her mood, once a year: Hungary warms to a happy Empress; an unhappy one is away, and the court talks */
 if(S.t>=(e.sisiY||0)){e.sisiY=S.t+YEAR;if(e.sisi>=60)E_({hun:3});else if(e.sisi<25)S.prest=Math.max(0,S.prest-2)}
 if(S.case||S.sc||MSG.length||TUTI>=0||!letGo(false))return;
 for(const q of SISI){if(d['si_'+q.id]||S.t<yT(...q.at))continue;d['si_'+q.id]=1;
  if(q.note){if(q.fx)E_(q.fx);toast(q.note);return}
  if(q.card){E_({sisi:-30,prest:-10});e.heir='ff';evOv('🕯️ Mayerling','30 January 1889. Majesty, Crown Prince Rudolf has been found dead at the hunting lodge of Mayerling in the Wienerwald. He shot the seventeen-year-old Baroness Mary Vetsera, and then himself. The court gives out that he died of a stroke, then that his mind was disturbed, and has her buried at Heiligenkreuz by night. It is Sissi who has to tell you. From this day she wears only black. Your nephew Franz Ferdinand is to be the heir.');return}
  evChoice(q.t,q.x,q.o.map(([l,fx])=>[l,()=>E_(fx)]));return}}
/* the city's other voices, 1865-1916: news of the people the Mayor's and the Emperor's own histories leave out, and their petitions,
   each on its day (VOICES: c the city, note a line in the papers, or t, x and o a decision; voiceFx: good, bad and unrest as for the
   audiences, say a word after, the rest as E_). A day long past when a save is loaded is let go. Sources: docs/HISTORY.md */
const VOICES=[
 {c:'ny',id:'procession',at:[1865,5,.15],t:'🕯️ After Lincoln\'s funeral',x:'Mr. Mayor, a delegation from the city\'s Black churches. Last month the Common Council barred Black New Yorkers from Lincoln\'s funeral procession, and only an order from the War Department let some two hundred of them march, at its very end, under police guard. Two years after the Draft Riots, many of the families who fled to Brooklyn have not come back.',
  o:[['Receive them at City Hall and say the Council was wrong',{ref:10,prest:5,say:'🕯️ The papers print your words. Tammany\'s aldermen grumble'}],['Say nothing: the Council has spoken',{rev:5}]]},
 {c:'ny',id:'thirteenth',at:[1865,12,.6],note:'⛓️ December 1865: the 13th Amendment is law. Slavery is ended in every state of the Union'},
 {c:'ny',id:'suffrage69',at:[1869,10,.8],t:'🗳️ Equal suffrage on the ballot',x:'Mr. Mayor, in November New York\'s voters decide whether to strike the rule that a Black man may vote only if he owns $250 of property, a rule no white man has had to meet since 1826. The voters said no in 1846 and again in 1860, and Tammany\'s men will vote no again.',
  o:[['Speak for equal suffrage',{ref:10,prest:5,say:'🗳️ The vote is lost all the same. The 15th Amendment will settle it'}],['Keep out of it',{rev:3,say:'🗳️ The voters keep the property rule. The 15th Amendment will settle it'}]]},
 {c:'ny',id:'fifteenth',at:[1870,4,.1],note:'🗳️ The 15th Amendment is law: Black men in New York vote without the $250 property rule'},
 {c:'ny',id:'cra73',at:[1873,4,.8],t:'⚖️ The Civil Rights Act of 1873',x:'Mr. Mayor, Albany has passed a law that no hotel, theatre, school or streetcar may turn anyone away for their colour. The pastors of the city\'s Black churches ask you to see that the police and the licence office enforce it.',
  o:[['Order the police and the licence office to enforce it',{ref:10,prest:5,bad:1,say:'⚖️ Some theatre owners complain loudly. The churches thank you'}],['Leave it to the courts',{}]]},
 {c:'ny',id:'exclusion',at:[1882,5,.2],note:'🚫 May 1882: Congress bars Chinese workers from the United States. On Mott Street, men can no longer bring their wives and children over'},
 {c:'ny',id:'cra83',at:[1883,10,.5],note:'⚖️ The Supreme Court strikes down the federal Civil Rights Act. New York\'s own law of 1873 still stands'},
 {c:'ny',id:'fortune',at:[1890,1,.3],note:'📰 T. Thomas Fortune of the New York Age calls Black Americans together in the Afro-American League, to fight lynching and Jim Crow in the courts'},
 {c:'ny',id:'wells',at:[1892,9,.85],t:'📰 A testimonial for Ida B. Wells',x:'Mr. Mayor, a mob in Memphis destroyed her newspaper for telling the truth about lynching, and Ida B. Wells now writes for the New York Age. On 5 October the Black women of New York and Brooklyn, led by Victoria Earle Matthews and Maritcha Lyons, honour her at Lyric Hall and raise the money to print her pamphlet, Southern Horrors. They invite the Mayor.',
  o:[['Go, and speak against lynching',{ref:10,prest:10,say:'📰 At Lyric Hall the women of the city raise the money for Southern Horrors'}],['Send your regrets',{}]]},
 {c:'ny',id:'tenderloin',at:[1900,8,.5],t:'🚨 The Tenderloin, 15 August 1900',x:'Mr. Mayor, a plainclothes policeman, Robert Thorpe, has died after a fight with Arthur Harris, a young Black man who says Thorpe seized his wife on Eighth Avenue. Tonight white mobs drag Black New Yorkers off the streetcars between 27th and 42nd Street and beat them, and many policemen join in instead of stopping it.',
  o:[['Send the reserves to protect them, and investigate the precinct',{ref:15,cor:-10,prest:5,unrest:-10,say:'🚨 The mobs break up by morning. The Citizens\' Protective League asks for the guilty officers to be named'}],['Leave it to the precinct captains',{rev:10,prest:-10,unrest:20,say:'🚨 The beatings go on into a second night. The Police Board later clears its own men'}]]},
 {c:'ny',id:'naacp',at:[1909,6,.05],note:'✊ At a conference in New York, W. E. B. Du Bois, Ida B. Wells, Mary White Ovington and others found the movement that becomes the NAACP'},
 {c:'ny',id:'lemlich',at:[1909,11,.7],t:'✊ The Uprising of the 20,000',x:'Mr. Mayor, at Cooper Union a young shirtwaist maker, Clara Lemlich, has called for a general strike, and twenty thousand garment workers, most of them young Jewish and Italian women, have walked out. The police arrest their pickets and the judges fine them, while the owners\' hired toughs go free.',
  o:[['Order the police to protect the picket lines',{ref:10,rev:-10,cor:-5,say:'✊ By February most of the shops have settled with the union'}],['Let the police break the strike',{rev:15,unrest:20,say:'✊ The strike drags on through the winter'}]]},
 {c:'ny',id:'urban',at:[1910,10,.3],note:'🏠 George Edmund Haynes and Ruth Standish Baldwin found what becomes the National Urban League, to find work and homes for Black newcomers from the South'},
 {c:'ny',id:'crisis',at:[1910,11,.1],note:'📰 The first number of The Crisis, edited by W. E. B. Du Bois for the NAACP'},
 {c:'ny',id:'clef',at:[1912,5,.05],note:'🎺 James Reese Europe\'s Clef Club Orchestra plays Carnegie Hall: a whole evening of Black American music, the first there'},
 {c:'ny',id:'parade12',at:[1912,5,.12],note:'🗳️ Thousands of women march down Fifth Avenue for the vote, all in white'},
 {c:'ny',id:'tubman',at:[1913,3,.3],note:'🕯️ Harriet Tubman has died at Auburn, upstate, who led the enslaved to freedom'},
 {c:'ny',id:'hellfighters',at:[1916,6,.5],note:'🎖️ Harlem\'s own regiment, the 15th New York Infantry, is mustered'},
 {c:'w',id:'dezember',at:[1867,12,.7],note:'📜 The December Constitution: every citizen is equal before the law, whatever his faith or his people. Vienna\'s Jews may live, own and teach where they will'},
 {c:'w',id:'hainisch',at:[1870,3,.5],t:'📚 Marianne Hainisch',x:'Majesty, Marianne Hainisch has spoken to the Women\'s Employment Association: no Gymnasium and no university in the land takes a girl, and widows must earn their bread untaught. She asks for a Gymnasium for girls.',
  o:[['Give it the Crown\'s support: −800 fl.',{gold:-800,ref:10,prest:5,say:'📚 The ministry drags its feet, but a door is open'}],['Girls\' schooling is a matter for the family',{}]]},
 {c:'w',id:'concordat',at:[1870,7,.6],note:'⛪ Austria ends the Concordat of 1855. Marriage and the schools are the state\'s again, not the Church\'s'},
 {c:'w',id:'komensky',at:[1883,9,.5],t:'🏫 A Czech school in Favoriten',x:'Majesty, the Komenský Society asks to open a school where the children of the Czech brickmakers of the Wienerberg can learn in their own language. Tens of thousands of Viennese speak Czech at home, and not one public school teaches in it. The German nationalists in the council call it an invasion.',
  o:[['Let it open with the Emperor\'s goodwill',{boh:10,ger:5,prest:5,say:'🏫 The Komenský school opens in Favoriten, paid for by its parents'}],['Vienna\'s schools stay German',{boh:-10,ger:-5}]]},
 {c:'w',id:'schoenerer',at:[1888,3,.2],note:'📰 Georg von Schönerer and his men storm the offices of the Neues Wiener Tagblatt. The German nationalists\' hatred of the Jews has gone into the streets'},
 {c:'w',id:'popp',at:[1892,1,.2],note:'📰 The Arbeiterinnen-Zeitung appears, the first paper of Austria\'s working women. Adelheid Popp, at work in a factory since she was ten, will edit it'},
 {c:'w',id:'girlsgym',at:[1892,9,.6],note:'📚 The first Gymnasium course for girls opens in Vienna, paid for by the Association for Women\'s Education'},
 {c:'w',id:'herzl',at:[1896,2,.5],note:'📖 Theodor Herzl of the Neue Freie Presse publishes Der Judenstaat. The Dreyfus affair and Vienna\'s own antisemites have convinced him that the Jews need a state of their own'},
 {c:'w',id:'ashanti',at:[1896,7,.3],note:'📰 In the Prater\'s Tiergarten am Schüttel, families from the Gold Coast are put on show behind a fence, for a fee. Peter Altenberg comes day after day to talk with them as people'},
 {c:'w',id:'possanner',at:[1897,4,.1],note:'🩺 Gabriele Possanner is the first woman to graduate as a doctor at the University of Vienna. From the autumn women may study there, in the arts'},
 {c:'w',id:'leopoldstadt',at:[1897,5,.5],t:'✡️ A delegation from the Leopoldstadt',x:'Majesty, Jewish merchants and doctors of the Leopoldstadt. Since Lueger took the Rathaus his Christian Socials tell Vienna to buy only from Christians, and gangs of students shout down Jewish professors. They ask whether the Emperor still holds them his equal subjects.',
  o:[['Make it known that the Emperor protects all his peoples alike',{ref:10,ger:5,prest:5,say:'✡️ The Neue Freie Presse prints your words. The Christian Social papers sneer'}],['Stay above party quarrels',{ger:5,say:'✡️ The delegation leaves without an answer'}]]},
 {c:'w',id:'badeni',at:[1897,11,.8],t:'🔥 The Badeni riots',x:'Majesty, Count Badeni\'s language ordinances make Czech equal to German in the offices of Bohemia and Moravia. In the Reichsrat the German nationalists blow whistles and throw inkwells, and in the streets students and workers fight the police outside the Parliament.',
  o:[['Stand by Badeni and the equality of languages',{boh:15,ger:15,rev:10,unrest:20,say:'🔥 The riots go on for days'}],['Dismiss Badeni to calm the streets',{boh:-15,ger:-10,say:'🔥 Prague answers with riots of its own, against the Germans and the Jews'}]]},
 {c:'w',id:'medicine',at:[1900,9,.5],note:'🩺 Women may study medicine at the University of Vienna'},
 {c:'w',id:'meitner',at:[1906,2,.05],note:'⚛️ Lise Meitner takes her doctorate in physics at the University of Vienna, only the second woman to do so there'},
 {c:'w',id:'suffrage07',at:[1907,5,.6],note:'🗳️ For the first time every man in Austria votes, rich or poor, with an equal vote. The Social Democrats win 87 seats. Women still have no vote at all'},
 {c:'w',id:'teuerung',at:[1911,9,.55],t:'🥖 The hunger march, 17 September 1911',x:'Majesty, a hundred thousand Viennese march on the Rathaus against the price of meat and bread, while the farmers\' party keeps cheap Argentine meat out of the country. In Ottakring the crowd smashes windows and street lamps, and the army is called out.',
  o:[['Let the meat in and cut the duties: −1,500 fl.',{gold:-1500,rev:-15,ref:10,say:'🥖 Prices fall a little, and the farmers\' deputies are furious'}],['Let the army clear the streets',{rev:15,prest:-10,unrest:20,say:'🥖 Soldiers fire in Ottakring, and people are killed'}]]}];
function voiceFx(fx){const o=Object.assign({},fx);if(o.good){S.good=Math.max(S.good||0,S.t+YEAR*o.good);delete o.good}if(o.bad){S.bad=Math.max(S.bad||0,S.t+YEAR*o.bad);delete o.bad}
 if(o.unrest){S.unrest=Math.max(0,(S.unrest||0)+o.unrest);delete o.unrest}const m=o.say;delete o.say;E_(o);if(m)setTimeout(()=>toast(m),400)}
function voicesTick(){if(!L.y1857)return;const e=EMP(),d=e.done||(e.done={}),c=NYC()?'ny':'w';if(S.case||S.sc||MSG.length||TUTI>=0||!$('#ov').hidden||!letGo(false))return;
 for(const q of VOICES){if(q.c!==c||d['vo_'+q.id]||S.t<yT(...q.at))continue;d['vo_'+q.id]=1;if(S.t>yT(...q.at)+YEAR*2)continue;
  if(q.note){toast(q.note);return}evChoice(q.t,q.x,q.o.map(([l,fx])=>[l,()=>voiceFx(fx)]));return}}
/* one guided thing at a time: while a case or a street job is on, the next case, day of history or underworld scene waits its turn */
function guideBusy(){return!!(S&&(S.case||(S.job&&S.job.st==='on')))}
/* each city its own cases; one with a date (at) opens when that comes, the rest by chance within their years */
const caseHere=c=>!!c&&!!c.w===!NYC();
function caseTick(){if(S.case||S.sc||MSG.length||TUTI>=0||!letGo(false))return;const y=histYr(),cd=S.csd||{},ks=Object.keys(CASES).filter(k=>!cd[k]&&caseHere(CASES[k])&&y>=CASES[k].yr[0]&&y<=CASES[k].yr[1]);
 {const k=ks.find(k=>CASES[k].at&&S.t>=yT(...CASES[k].at));if(k&&!(S.csT&&S.t<S.csT&&Object.keys(cd).length)){caseStart(k);return}}
 if(!S.csT){S.csT=S.t+YEAR*(1+Math.random());return}if(S.t<S.csT)return;S.csT=S.t+YEAR*(2+Math.random()*2);const kr=ks.filter(k=>!CASES[k].at);if(kr.length)caseStart(oneOf(kr))}
/* onto the street at tile i at once, or by way of the map where the walk can't start there */
function walkOn(i){if(typeof walkAt==='function'&&walkAt([i%W,i/W|0]))return;if(typeof walkThere==='function')walkThere(i%W,i/W|0)}
/* now: taken from the casebook, so no question first */
function caseStart(k,now){const c=CASES[k];if(!S||!caseHere(c)||S.case)return false;const ti=c.steps.map(p=>histRoad(p.at[0],p.at[1])),tt=c.steps.map(p=>p.to?histRoad(p.to[0],p.to[1]):-1);if(ti.some(i=>i<0)||c.steps.some((p,j)=>p.to&&tt[j]<0))return false;(S.csd||(S.csd={}))[k]=1;S.csT=Math.max(S.csT||0,S.t+YEAR*(2+Math.random()*2));
 const go=()=>{S.case={k,n:0,ti,tt,notes:[]};sfx('click');if(onFoot())evOv(c.title,`${c.ask}<br><br><span class="m">${ucf(c.steps[0].go)}: follow the red arrow.</span>`,true);else walkOn(ti[0])},no=()=>{prestDown(1);(S.csr||(S.csr={}))[k]='left';toast(c.left)};
 if(now){go();return true}
 if(onFoot())msgPush(c.title,go,{foot:1,urg:true,go:'🕵️ Take the case',later:'Leave it to the police',no});
 else evChoice(c.title,`${c.ask}<br><br>Will you look into it yourself?`,[['🚶 Walk there and take the case',go],['👮 Leave it to the police',no]]);return true}
/* ---------- a case played, not only read. A step may be a witness to question (q: each question may give a clue), things to search
   at a place (items: walk up to each and look at it, street.js), or someone to follow at a distance without being seen (do:'follow',
   to where he goes). Every clue goes into the notebook (📓, S.case.notes), and a case with a key ends in naming the culprit and then
   the clue that proves it; the right one with the wrong proof walks free ---------- */
function caseClue(t){const cs=S.case;if(!cs||!t)return;const n=cs.notes||(cs.notes=[]);if(n.includes(t))return;n.push(t);toast(`📓 ${t}`)}
/* on to the next step (its clue noted unless it was let go); false after the last */
function caseAdv(skip){const cs=S.case,c=cs&&CASES[cs.k];if(!c)return false;const p=c.steps[cs.n];if(p.clue&&!skip)caseClue(p.clue);if(cs.n>=c.steps.length-1)return false;cs.n++;cs.hail=0;cs.got=null;cs.fw=null;return true}
/* a step done: what was learnt, and the way on; after the last, the naming */
function caseDone(t,x){const cs=S.case,c=cs&&CASES[cs.k];if(!c)return;sfx('click');
 if(cs.n>=c.steps.length-1){const p=c.steps[cs.n];if(p.clue)caseClue(p.clue);if(!c.key){evChoice(t,`${x}<br><br><b>Whom do you name?</b>`,c.sus.map(([n,w],k)=>[`${n}<br><span class="m">${w}</span>`,()=>caseName(k)]));return}
  evChoice(t,x,[['🕵️ Name the culprit',caseAccuse]]);return}
 caseAdv();evOv(t,`${x}<br><br><span class="m">Next: ${c.steps[cs.n].go}.</span>`,true)}
/* the Mayor speaks to whoever the case has led him to: a card to read, or questions to ask one by one */
function caseTalk(){const cs=S.case,c=cs&&CASES[cs.k];if(!c)return;const p=c.steps[cs.n];if(p.q){sfx('click');caseQuiz(p,[]);return}caseDone(p.who,p.txt)}
function caseQuiz(p,asked){const cs=S.case,c=CASES[cs.k],last=cs.n>=c.steps.length-1,left=p.q.map((q,i)=>i).filter(i=>!asked.includes(i));
 ov(`<h2>${p.who}</h2><p>${p.txt}</p>${asked.map(i=>`<p class="m">❓ ${p.q[i][0]}</p><p>${p.q[i][1]}</p>`).join('')}
 <div class="btns" style="flex-direction:column;align-items:stretch">${left.map(i=>`<button data-q="${i}">❓ ${p.q[i][0]}</button>`).join('')}<button class="pri" id="qDone">${last&&c.key?'🕵️ Name the culprit':asked.length?'That will do':'No questions'}</button></div>`);
 const sc=$('#ovCard');sc.scrollTop=sc.scrollHeight;
 document.querySelectorAll('#ovCard [data-q]').forEach(b=>b.onclick=()=>{const i=+b.dataset.q;sfx('click');if(p.q[i][2])caseClue(p.q[i][2]);caseQuiz(p,asked.concat(i))});
 $('#qDone').onclick=()=>{closeOv();if(last){if(p.clue)caseClue(p.clue);if(c.key)caseAccuse();else caseDone(p.who,p.txt);return}caseAdv();toast(`🕵️ Next: ${c.steps[cs.n].go}`)}}
/* a thing looked at in a search (street.js), and when all are seen, what they add up to */
function caseLook(i){const cs=S.case,c=cs&&CASES[cs.k],p=c&&c.steps[cs.n];if(!p||!p.items||!p.items[i])return;const g=cs.got||(cs.got=[]);if(g.includes(i))return;g.push(i);sfx('click');caseClue(p.items[i][1]);
 if(g.length>=p.items.length)setTimeout(()=>{if(S.case===cs)caseDone(p.who||`🔍 ${p.pl}`,p.txt)},900)}
/* the end of a follow: he arrived with the Mayor still behind him, or he saw him, or he was lost */
function caseFollow(ok,why){const cs=S.case,c=cs&&CASES[cs.k],p=c&&c.steps[cs.n];if(!p)return;if(ok){caseDone(p.who,p.txt);return}sfx('click');
 evChoice(why==='seen'?'👀 He has seen you!':'🌫️ You have lost him',why==='seen'?'You came too close, and he turned round. Keep further back: close enough to see him, not so close that he notices.':'He was too far ahead and turned a corner. Stay closer behind him.',
  [['🔁 Try again',()=>{cs.fw=null}],['⏩ Let him go',()=>{if(caseAdv(true))toast(`🕵️ Next: ${c.steps[cs.n].go}`);else caseAccuse()}]])}
/* the notebook, from the case banner */
function caseNotes(){const cs=S.case,c=cs&&CASES[cs.k];if(!c)return;const n=cs.notes||[];evOv(`📓 ${c.short.replace(/^./,m=>m.toUpperCase())}`,n.length?n.map(t=>`📓 ${t}`).join('<br>'):'Nothing noted yet.',true)}
function caseAccuse(){const cs=S.case,c=cs&&CASES[cs.k];if(!c)return;const n=cs.notes||[];
 evChoice('🕵️ Whom do you name?',n.length?`<span class="m">${n.map(t=>`📓 ${t}`).join('<br>')}</span>`:'',c.sus.map(([nm,w],k)=>[`${nm}<br><span class="m">${w}</span>`,()=>c.key&&n.length?caseProve(k):caseName(k)]))}
function caseProve(k){const cs=S.case,c=CASES[cs.k],n=cs.notes||[];
 evChoice('🕵️ What proves it?',`You name <b>${c.sus[k][0]}</b>. Which of your clues proves it?`,n.map(t=>[`📓 ${t}`,()=>caseName(k,t===c.key)]))}
function caseName(k,proof){const cs=S.case,c=cs&&CASES[cs.k];if(!c)return;S.case=null;const right=k===c.did,weak=right&&proof===false;(S.csr||(S.csr={}))[cs.k]=right&&!weak?'win':weak?'weak':'lose';
 if(weak){S.prest+=3;sfx('click');evOv('🕵️ The right one, the wrong proof',`${c.sus[k][0]} is the one, but the proof you give does not hold, and the court lets them go for now. The papers call it a near thing. 👑 +3`,true)}
 else if(right){S.prest+=c.prest;crimeAdd(-6);S.good=Math.max(S.good||0,S.t+YEAR/4);sfx('chime');evOv('🕵️ Case closed',c.win,true)}else{prestDown(6);evOv('🕵️ The wrong man',c.lose(c.sus[k][0]),true)}}
/* the casebook (City › Cases): the case under way and the way to it, the cases that can be taken now, the ones closed, and how many
   are still to come in the years ahead; a case need not wait for chance to bring it */
/* the cases that wait: one at a time, the oldest first, and the next only once the wait after the last case is over (S.csT),
   so a city that is late for several does not get them all in one go */
function caseOpen(){if(!S)return[];const y=histYr(),cd=S.csd||{},ks=Object.keys(CASES).filter(k=>caseHere(CASES[k])&&!cd[k]&&y>=CASES[k].yr[0]&&y<=CASES[k].yr[1]&&!(CASES[k].at&&S.t<yT(...CASES[k].at))).sort((a,b)=>CASES[a].yr[0]-CASES[b].yr[0]);
 return S.csT&&S.t<S.csT&&Object.keys(cd).length?[]:ks.slice(0,1)}
function showCases(){if(!S)return;const y=histYr(),cd=S.csd||{},cr=S.csr||{},ks=Object.keys(CASES).filter(k=>caseHere(CASES[k])),op=caseOpen(),cs=S.case,cc=cs&&CASES[cs.k];
 const row=(k,st,btn)=>`<div class="law"><div><b>${CASES[k].short.replace(/^./,c=>c.toUpperCase())}</b><br><span class="m">${st}</span></div>${btn||''}</div>`;
 const done=ks.filter(k=>cd[k]&&k!==(cs&&cs.k)),later=ks.filter(k=>!cd[k]&&y<=CASES[k].yr[1]&&!op.includes(k)).length;
 ov(`<h2>🕵️ Cases</h2>${cc?row(cs.k,`Under way: ${cc.steps[cs.n].go}.`,'<button class="pri" id="csGo">📍 Show the way</button>'):''}
 ${op.length?(cc?'<p class="m">Close the case under way to take another.</p>':'')+op.map(k=>row(k,CASES[k].title,cc?'':`<button class="pri" data-cs="${k}">Take it</button>`)).join(''):cc?'':'<p class="m">No case waits for you now.</p>'}
 ${done.map(k=>row(k,{win:'✅ Solved',weak:'⚖️ The right one, but no proof',lose:'❌ The wrong suspect named',left:'👮 Left to the police'}[cr[k]]||'Closed')).join('')}
 ${later?`<p class="m">🔒 ${later===1?'One more case':later+' more cases'} in the years to come.</p>`:''}<div class="btns"><button id="ovOk">Close</button></div>`);
 const g=$('#csGo');if(g)g.onclick=()=>{closeOv();walkOn(cs.ti[cs.n])};document.querySelectorAll('#ovCard [data-cs]').forEach(b=>b.onclick=()=>{closeOv();caseStart(b.dataset.cs,true)})}
/* ---------- famous people of the day, met on foot at their own place in their own years (street.js puts them on the walk under a
   ⭐); a word with each goes into the album (City › Album, S.met). Each: the city (c), the years, where (at, pl), the look (seed, kind),
   the line called out (say), what they tell (txt) and the album's line (fact). folk: not a famous name but one of the many who came
   to the city from all over the Empire; the album lists them apart, as the people of Vienna ---------- */
const FAMOUS=[
 {k:'ziegel',folk:1,c:'w',yr:[1865,1895],at:[48.1860,16.3600],pl:'the Matzleinsdorfer Linie, on the road to the Wienerberg brickworks',i:'🧱',who:'a brickmaker from Bohemia',seed:.33,say:'Majesty! Come and see how we live.',
  txt:'"I am from a village in the south of Bohemia. Here they call us the Ziegelböhm, the brick Bohemians. We work from before sunrise until dark. They pay us in tin tokens, and only the canteen of the works takes them. At night we sleep at the works, many families in one room."',fact:'The bricks of the Ring were made at the Wienerberg, mostly by Czech workers. The doctor Viktor Adler wrote about their lives on 1 December 1888. After a strike in 1895 they won an 11-hour day and a free Sunday.'},
 {k:'sandler',folk:1,c:'w',yr:[1865,1900],at:[48.1885,16.3580],pl:'the Matzleinsdorfer Linie, on the road to the Wienerberg brickworks',i:'⏳',who:'a Sandler',seed:.47,say:'A little sand, Majesty, so the clay comes out clean.',
  txt:'"I am the Sandler. I throw sand into the wooden moulds before the clay goes in, so that the brick does not stick. It is the lowest work at the brickworks, and the worst paid. When there is no work, I sleep where I can."',fact:'The Sandler sanded the brick moulds. Today the Viennese call a homeless man a Sandler. Many say the word comes from this work, but nobody knows for sure.'},
 {k:'koechin',folk:1,c:'w',yr:[1865,1916],at:[48.1990,16.3650],pl:'the Naschmarkt',i:'🥘',who:'a cook from Bohemia',seed:.87,say:'Good plums, Majesty! Tonight I make Powidl.',
  txt:'"I came from Budweis at fifteen, with one bag. Now I cook for a family on the Ring. My lady thinks that Buchteln, Powidl and Kolatschen are Viennese. I learned them all from my mother at home."',fact:'Thousands of cooks and maids came to Vienna from Bohemia and Moravia. In 1900 one Viennese in four was born there, and the food of Vienna still shows it.'},
 {k:'galiz',folk:1,c:'w',yr:[1869,1914],at:[48.2170,16.3810],pl:'the Taborstraße in the Leopoldstadt',i:'🧵',who:'a pedlar from Galicia',seed:.28,say:'Ribbons, buttons, thread! Also for an Emperor.',
  txt:'"I am from Brody, in Galicia. The train brought me to the Nordbahnhof, and from there it is a short walk to the Leopoldstadt. Since 1867 we may live where we want and do any work. I carry my shop on my back. My son will go to the Gymnasium."',fact:'About 40,000 Jews lived in Vienna in 1869, and almost 100,000 in 1890. Many came from Galicia and lived in the Leopoldstadt. The constitution of 1867 gave them equal rights.'},
 {k:'rastel',folk:1,c:'w',yr:[1860,1914],at:[48.2035,16.3555],pl:'the Spittelberg',i:'🪤',who:'a Slovak tinker',seed:.12,say:'Pots to mend! Mousetraps!',
  txt:'"I am a Rastelbinder, from the hills near Trentschin in the north of Hungary. At home there is no land for us. So we walk from town to town with wire and tin on our backs. A cracked pot? I bind it with wire, and it holds ten more years."',fact:'Rastelbinder: Slovak tinkers from the north of Hungary, who mended pots with wire and sold mousetraps from door to door.'},
 {k:'gottsch',folk:1,c:'w',yr:[1860,1914],at:[48.2150,16.3850],pl:'an inn on the Praterstraße',i:'🍊',who:'a pedlar from Gottschee',seed:.42,say:'Oranges, figs, sweets! Try your luck, Majesty.',
  txt:'"We are from Gottschee, a German island in the woods of Carniola. The land there is poor, so in winter the men go out with a basket: oranges, figs, sugar things. Pay a few Kreuzer and draw a number from my bag. With luck, the sweets are yours."',fact:'Pedlars from Gottschee in Carniola (today Kočevje in Slovenia) had the right to trade across the land since 1492. In Vienna they sold fruit from the south and sweets in the inns.'},
 {k:'ida',c:'w',yr:[1865,1898],at:[48.2090,16.3660],pl:'the Hofburg, at the Empress\'s rooms',i:'📖',who:'Ida Ferenczy',seed:.89,say:'Majesty! The Empress is reading Hungarian with me.',
  txt:'"I am from Kecskemét, a small town on the Hungarian plain. I am no countess, and the ladies of the court do not forgive me for it. But the Empress chose me herself, in 1864. We speak only Hungarian. She speaks it without a fault now. Better than Your Majesty, if I may say so."',fact:'Ida Ferenczy from Kecskemét, reader to Empress Elisabeth from 1864 and her closest friend to the end. Through her the Empress came to know Andrássy and Deák.'},
 {k:'sissi',c:'w',yr:[1865,1888],at:[48.2093,16.4110],pl:'the Prater\'s Hauptallee',i:'👑',who:'Empress Sissi',seed:.86,say:'Franz! Alone in the Prater, without your generals?',
  txt:'"I ride here at six, before Vienna wakes and stares. The Hungarians cheer me, and the court counts my hours away. Walk with me as far as the Lusthaus, and for once let no one bow."',fact:'Elisabeth, Empress of Austria and Queen of Hungary, and one of the finest riders in Europe.'},
 {k:'strauss',c:'w',yr:[1868,1898],at:[48.2036,16.3797],pl:'the Kursalon',i:'🎻',who:'Johann Strauss',seed:.2,say:'Majesty! Tonight, a new waltz.',
  txt:'"The Blue Danube? The singers hated the words, and the Viennese hum it all the same. Tonight on the terrace I play something new. If Your Majesty taps a foot, half Vienna buys the score tomorrow."',fact:'The Waltz King. On the Beautiful Blue Danube was first played in February 1867.'},
 {k:'bruckner',c:'w',yr:[1868,1896],at:[48.2066,16.3655],pl:'the Hofburg',i:'🎹',who:'Anton Bruckner',seed:.35,say:'Your Majesty is too kind to an old organist.',
  txt:'"I play the organ in Your Majesty\'s chapel on Sundays and teach harmony at the University. The critics say my symphonies are too long, Hanslick most of all. If Your Majesty could perhaps ask Herr Hanslick to write a little less badly of me..."',fact:'Composer and court organist, who asked the Emperor to stop the critic Hanslick\'s bad reviews.'},
 {k:'schnitzler',c:'w',yr:[1890,1897],at:[48.2081,16.3664],pl:'Café Griensteidl',i:'☕',who:'Arthur Schnitzler',seed:.15,say:'A doctor by day, Majesty. By night we write.',
  txt:'"Hofmannsthal, Bahr, Altenberg and I sit here half a day over one coffee. Bahr says we are Young Vienna. The waiters say we are bad for business."',fact:'Doctor and playwright of Young Vienna, regulars of Café Griensteidl until it closed in 1897.'},
 {k:'freud',c:'w',yr:[1891,1916],at:[48.2185,16.3631],pl:'Berggasse 19',i:'🛋️',who:'Sigmund Freud',seed:.25,say:'I walk the whole Ring every day, Majesty. It clears the head.',
  txt:'"My patients lie on a couch and tell me their dreams, and in the dreams are the wishes they will not admit by day. The professors laugh at me. In a hundred years they will laugh less."',fact:'Doctor of the mind. The Interpretation of Dreams appeared in November 1899.'},
 {k:'wagner',c:'w',yr:[1894,1916],at:[48.2003,16.3698],pl:'Karlsplatz',i:'📐',who:'Otto Wagner',seed:.4,say:'Nothing that is not useful can be beautiful, Majesty.',
  txt:'"These pavilions for the Stadtbahn: an iron frame, slabs of marble, golden sunflowers. The old architects dress a railway station up as a castle. A station should look like what it is."',fact:'Architect of the Stadtbahn (from 1894) and the Postsparkasse.'},
 {k:'mahler',c:'w',yr:[1897,1907],at:[48.2030,16.3692],pl:'the Court Opera',i:'🎼',who:'Gustav Mahler',seed:.3,say:'The doors close when the music begins, Majesty. For everyone.',
  txt:'"Latecomers wait outside until the interval now, and the claque is paid no more. They say I break the opera\'s traditions. Tradition, Majesty, is mostly sloppiness."',fact:'Director of the Court Opera from 1897 to 1907.'},
 {k:'olbrich',c:'w',yr:[1895,1897],at:[48.1998,16.3612],pl:'the Café Sperl',i:'☕',who:'Joseph Maria Olbrich',seed:.7,say:'We meet here, Majesty. We call ourselves the Club of Seven.',
  txt:'"We are young painters and architects: Hoffmann, Moser, Kurzweil and I. We sit here, draw and talk about a new art. The Künstlerhaus shows only the old. One day we will build a house of our own."',fact:'Architect. The Club of Seven met at the Café Sperl from 1895. In 1897 its members helped to found the Secession. Olbrich built its hall in 1898.'},
 {k:'klimt',c:'w',yr:[1898,1916],at:[48.2003,16.3657],pl:'the Secession',i:'🎨',who:'Gustav Klimt',seed:.55,say:'To every age its art, Majesty. It says so over our door.',
  txt:'"We left the old artists\' house because it would show nothing new. This hall is ours: white walls, a dome of golden laurel leaves. Come and see the frieze before the newspapers tell you what to think of it."',fact:'Painter, first president of the Vienna Secession in 1897.'},
 {k:'suttner',c:'w',yr:[1902,1914],at:[48.2072,16.3793],pl:'the Zedlitzgasse',i:'🕊️',who:'Bertha von Suttner',seed:.88,say:'Lay down your arms, Majesty. Before someone makes you take them up.',
  txt:'"I wrote a novel and the world read it: Lay Down Your Arms! Now I write to kings and ministers. A great war would not last a summer, they all say. I have read what the new guns do."',fact:'Writer and campaigner for peace, in 1905 the first woman to win the Nobel Peace Prize.'},
 {k:'schiele',c:'w',yr:[1907,1916],at:[48.2017,16.3665],pl:'the Academy of Fine Arts',i:'✏️',who:'Egon Schiele',seed:.1,say:'They want me to draw plaster busts, Majesty.',
  txt:'"At the Academy they want me to copy plaster busts for three more years. I showed my drawings to Klimt. He said: much talent. Far too much, say the professors."',fact:'Painter. He came to the Academy at sixteen, in 1906, and met Klimt in 1907.'},
 {k:'olmsted',c:'ny',yr:[1865,1878],at:[40.7644,-73.9730],pl:'Central Park',i:'🌳',who:'Frederick Law Olmsted',seed:.3,say:'Mr. Mayor! Every rock here was set by hand.',
  txt:'"People think we found this park. We built it: millions of cartloads of earth, the lakes dug by hand, the cross streets sunk so the carriages pass unseen. A park for everyone, rich and poor on the same grass."',fact:'Landscape architect who designed Central Park with Calvert Vaux.'},
 {k:'edison',c:'ny',yr:[1882,1890],at:[40.7076,-74.0039],pl:'Pearl Street Station',i:'💡',who:'Thomas Edison',seed:.35,say:'Direct current, Mr. Mayor. Safe and sure.',
  txt:'"Pearl Street Station lit Wall Street by electric light on the fourth of September 1882. That young Tesla says alternating current is better. Alternating current kills people, Mr. Mayor."',fact:'Inventor. His Pearl Street Station lit lower Manhattan from September 1882.'},
 {k:'bly',c:'ny',yr:[1887,1895],at:[40.7115,-74.0065],pl:'the World on Park Row',i:'📰',who:'Nellie Bly',seed:.86,say:'Ten days in a madhouse, Mr. Mayor. Ask me anything.',
  txt:'"I pretended to be mad, and they sent me to Blackwell\'s Island: cold baths, rotten food, nurses who beat the women. I wrote it all for the World, and now the city spends a million dollars more on its asylums."',fact:'Reporter for the World. In 1889–90 she went round the world in 72 days.'},
 {k:'riis',c:'ny',yr:[1888,1897],at:[40.7160,-73.9989],pl:'Mulberry Bend',i:'📷',who:'Jacob Riis',seed:.45,say:'Mind the flash powder, Mr. Mayor.',
  txt:'"I bring the flash into the back alleys at night so that uptown cannot say it did not know. Five cents for a spot on a floor to sleep. Look at the pictures, then tear the Bend down and give these children a park."',fact:'Reporter and photographer. How the Other Half Lives appeared in 1890.'},
 {k:'houdini',c:'ny',yr:[1893,1916],at:[40.7343,-73.9890],pl:'Huber\'s Museum on 14th Street',i:'🔗',who:'Harry Houdini',seed:.2,say:'Lock me up, Mr. Mayor. Any lock you like.',
  txt:'"Ten shows a day at Huber\'s Museum, between the fat lady and the flea circus. Handcuffs, a trunk, a straitjacket. There is no lock I cannot open, and I will never tell you how."',fact:'Escape artist. He began in the dime museums of 14th Street.'},
 {k:'roosevelt',c:'ny',yr:[1895,1897],at:[40.7250,-73.9952],pl:'Police Headquarters, 300 Mulberry Street',i:'🎖️',who:'Theodore Roosevelt',seed:.4,say:'Bully! The Mayor out at midnight too!',
  txt:'"I walk the beats at night with Riis to see which patrolmen are asleep in the saloons. Half of them were. The saloons close on Sundays now, and the whole city hates me for it."',fact:'President of the Police Board 1895–97, later President of the United States.'},
 {k:'tesla',c:'ny',yr:[1895,1902],at:[40.7262,-73.9988],pl:'the laboratory on East Houston Street',i:'⚡',who:'Nikola Tesla',seed:.15,say:'Alternating current, Mr. Mayor. The future runs in waves.',
  txt:'"Edison laughed when I asked for the money he had promised me. Now Westinghouse lights whole cities with my motors. One day there will be power without wires, Mr. Mayor, and pictures through the air."',fact:'Inventor of the alternating-current motor. He came to New York in 1884 with four cents in his pocket.'},
 {k:'twain',c:'ny',yr:[1904,1908],at:[40.7330,-73.9963],pl:'21 Fifth Avenue',i:'✒️',who:'Mark Twain',seed:.6,say:'The reports of my death are greatly exaggerated, Mr. Mayor.',
  txt:'"I live at 21 Fifth Avenue now and wear a white suit to annoy the neighbours. I dictate my life story in bed. It is not to be printed until a hundred years after I die, so I can be entirely truthful."',fact:'Writer. He lived at 21 Fifth Avenue from 1904 to 1908.'}];
const famHere=f=>f.c===(NYC()?'ny':'w');
/* a word with one: the card, and into the album */
function famMeet(k){const f=FAMOUS.find(q=>q.k===k);if(!f||!S)return;(S.met||(S.met={}))[k]=Math.floor(histYr());S.prest+=3;sfx('chime');
 evOv(`${f.i} ${f.who}`,`${f.txt}<br><br><span class="m">📔 ${f.fact}</span>`,true);setTimeout(()=>toast(`📔 ${f.who} is in your album · 👑 +3`),600)}
/* the album: those met, with what they are remembered for; those who can be met now, and where; how many are still to come */
function showAlbum(){if(!S)return;const y=histYr(),met=S.met||{},fs=FAMOUS.filter(famHere),m=fs.filter(f=>met[f.k]),now=fs.filter(f=>!met[f.k]&&y>=f.yr[0]&&y<=f.yr[1]),later=fs.filter(f=>!met[f.k]&&y<f.yr[0]).length;
 const row=(ic,b,t)=>`<div class="law"><div><b>${ic} ${b}</b><br><span class="m">${t}</span></div></div>`,up=s=>s[0].toUpperCase()+s.slice(1),
  part=fk=>m.filter(f=>!f.folk===!fk).map(f=>row(f.i,up(f.who),f.fact)).join('')+now.filter(f=>!f.folk===!fk).map(f=>row('⭐',up(f.who),`At ${f.pl} now`)).join(''),folk=part(1);
 ov(`<h2>📔 Album</h2><p class="m">${m.length} of ${fs.length} met. Walk the streets: whoever can be met stands under a ⭐.</p>
 ${NYC()?'':`<div class="btns" style="margin:4px 0 8px"><button data-por="fj">👑 The Emperor: two sides</button><button data-por="el">🌹 Elisabeth: beyond the legend</button></div>`}
 ${part(0)}${folk?`<p class="finH">People of Vienna, from all over the Empire</p>${folk}`:''}
 ${later?`<p class="m">🔒 ${later===1?'One more':later+' more'} in the years to come.</p>`:''}<div class="btns"><button id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=closeOv;document.querySelectorAll('#ovCard [data-por]').forEach(b=>b.onclick=()=>showPortrait(b.dataset.por))}
/* the two portraits in the album: Franz Joseph and Elisabeth as the records show them, the hard sides with the fair ones */
const PORTRAIT={fj:['👑 Franz Joseph: two sides',[
  ['The hard ruler','He came to the throne at eighteen, in the revolution of 1848. In 1849 his army put down free Hungary. Count Batthyány and thirteen generals were executed, and he refused them mercy. From the end of 1851 he ruled alone, without a parliament. Only lost wars, in 1859 and 1866, made him share power.'],
  ['The fair ruler','Under him the constitution of 1867 gave Jews and all other citizens equal rights. He refused several times to confirm Karl Lueger as mayor, who had won votes with hatred of Jews, and gave way only in 1897. He learned the languages of his peoples: Hungarian, Czech, Italian and Polish. In 1907 he backed the vote for every man.'],
  ['The man','He rose before five and worked at his desk all day, like the first clerk of his own state. Historians call him dutiful and no great thinker: he kept the old Empire going from one year to the next, and changed only when he had to.']]],
 el:['🌹 Elisabeth: beyond the legend',[
  ['Not the girl of the films','She married at sixteen, in 1854, and never got used to the court. She was shy and restless, and spent hours each day on her hair, her riding and her exercises. Archduchess Sophie raised her first children. She did not fight for women or for the poor.'],
  ['The friend of Hungary','She learned Hungarian so well that she spoke it better than the Emperor. She pressed him to make peace with Hungary, and in June 1867 she was crowned Queen beside him. Her reader and closest friend, Ida Ferenczy, was a Hungarian of no high rank.'],
  ['The poet who doubted kings','She loved the poet Heinrich Heine and wrote a secret diary in verse. In it she is Titania, the fairy queen, and the Emperor is Oberon. The poems mock the court, and some say the time of kings will pass. She wanted the money from the poems to go to people persecuted for their ideas.'],
  ['Always away','From the 1870s she was seldom in Vienna: Gödöllő, England, Corfu, the sea. On 10 September 1898 the Italian anarchist Luigi Lucheni killed her in Geneva. He had wanted to kill any royal person, and she was the one in town.']]]};
function showPortrait(k){const p=PORTRAIT[k];if(!p)return;ov(`<h2>${p[0]}</h2>${p[1].map(([h,t])=>`<p class="finH">${h}</p><p class="ppl">${t}</p>`).join('')}<div class="btns"><button class="pri" id="ovOk">Back to the album</button></div>`);$('#ovOk').onclick=showAlbum}
const monthOf=t=>Math.floor(((t%YEAR+YEAR)%YEAR)/YEAR*12);
/* --- Chicago, the rival capital --- */
const BPM=[[1871,10,15,'The Great Chicago Fire burns a third of the city, and it rebuilds bigger'],[1885,5,40,'Chicago raises the first steel-frame skyscraper'],[1893,5,80,'Chicago\'s World\'s Columbian Exposition dazzles the world'],[1900,1,30,'Chicago reverses the flow of its river'],[1909,7,40,'Daniel Burnham\'s Plan of Chicago']];
function bpScore(t=S.t){let s=Math.max(0,Math.floor((t-yT(1865,5))/(YEAR/3)))*2+((S&&S.emp&&S.emp.bpB)||0);for(const[y,m,p]of BPM)if(t>=yT(y,m))s+=p;return s}
/* --- research --- */
const TECH=[['hygiene','Metropolitan Board of Health','New York, 1866',1866,30,'Hospitals cover a larger area and protect your city from cholera.'],
 ['mendel','Refrigerated rail cars','Gustavus Swift, 1878',1870,40,'Farms and vegetable gardens produce 25% more.'],
 ['boltzmann','Bessemer steel','Andrew Carnegie\'s mills',1875,80,'Every workshop produces 10% more.'],
 ['auer','Gas light for all','the gas companies merge, 1884',1880,90,'Unlocks the Gasworks. Gas light becomes a need of the well-to-do.'],
 ['electric','Electric power','Edison\'s Pearl Street Station, 1882',1882,120,'Unlocks the Power station. From now on every neighbourhood expects electric light.'],
 ['einstein','Alternating current','Nikola Tesla and George Westinghouse',1888,150,'Research runs 50% faster. 👑 +40.'],
 ['kaplan','Elevators and steel frames','Otis electric elevators, 1889',1889,160,'Skyscrapers! Office towers unlock, and homes grow taller every year: by 1909 they hold up to 80% more people. Workshops produce 15% more.'],
 ['freud','Vaudeville and Coney Island','the amusement age',1895,100,'Coffee houses reach further. 👑 +30.'],
 ['radium','Columbia on Morningside Heights','1897',1897,140,'👑 +60, and scientists come to visit.'],
 ['lohner','The motor car','the first automobiles on Fifth Avenue',1900,130,'Unlocks the Car factory. Cars start to appear on your streets.'],
 ['landsteiner','Modern hospitals','Bellevue and Mount Sinai',1901,110,'Residents near a hospital are 10% happier.']];
function prodMult(o){const r=RES();let m=lawProd();if(COV.elec&&COV.elec[o.y*W+o.x])m*=1.2;if(r.mendel&&(o.t==='garden'||o.t==='grainf'||o.t==='vineyard'||o.t==='farm'&&ECO().fix))m*=1.25;if(r.boltzmann)m*=1.1;if(r.kaplan)m*=1.15;return m}
/* research: each item costs money once (ten florins or dollars for each of its old points, t[4]) and is then studied for about two
   minutes (RSDUR seconds at 1×, quicker when time runs faster, with a University, compulsory schooling or the "runs faster" item), one
   at a time; S.rs holds the one under way (its key and how far it has got, p). It goes on while a panel is open, though the city's time
   stands still then, so its bar is seen to fill. S.rfree counts researches given for nothing (a reward, a patron, the tutorial's first) */
const RSDUR=120,rsCost=t=>t[4]*10;
function rsSpeed(){return(S.list.some(o=>o.t==='universitaet'&&!o.bld)?1.5:1)*(RES().einstein?1.5:1)*(LAW().schule?1.3:1)}
function rsLeft(){return S.rs?Math.max(0,RSDUR-(S.rs.p||0)):0}
function rsDone(){const t=TECH.find(q=>q[0]===S.rs.k);S.rs=null;if(!t)return;RES()[t[0]]=1;const bonus={freud:30,radium:60,einstein:40}[t[0]]||0;S.prest+=bonus+10;sfx('chime');recompute();toast(`🔬 ${t[1]} researched. ${t[5]}`);S.rsNT=S.t+10;
 if(!$('#ov').hidden&&$('#rsList'))showResearch()}
/* the bar of the research under way, kept up to date while its panel is open (the top bar's round, every second) */
function rsBar(){const b=$('#rsBar');if(!b||!S.rs)return;const k=1-rsLeft()/RSDUR;b.style.width=(k*100).toFixed(1)+'%';const m=$('#rsMin');if(m)m.textContent=rsMin()}
const rsMin=()=>{const s=rsLeft()/Math.max(1,SPEEDS[spd]||1)/rsSpeed();return`${Math.floor((1-rsLeft()/RSDUR)*100)}% done, ${s<60?'under a minute left':`about ${Math.ceil(s/60)} min left`}`};
function showResearch(){const r=RES(),yr=Math.floor(Y0+S.t/YEAR),gold=S.stock.gold||0,free=S.rfree>0,on=S.rs&&S.rs.k;
 ov(`<h2>🔬 Research</h2><p>Each discovery costs money once and helps your city for good. One at a time: it takes about two minutes.</p>${free?'<p class="m">🎁 Your next research is free.</p>':''}<div class="plc" id="rsList">${TECH.map(t=>{const[k,n,who,y,,e]=t,c=rsCost(t),done=r[k],open=yr>=y,now=on===k,can=open&&!done&&!on&&(free||gold>=c);
  return `<button ${done||!can?'disabled':''} data-t="${k}" class="rsI${can?' pri':''}${now?' rsOn':''}" style="opacity:${done?.6:open||now?1:.45}"><span class="rsP">${done?'Done':now?'Under way':open&&free?'Free':money(c,1)}</span><b>${done?'✅':now?'⏳':open?'🔬':'🔒'} ${n}</b><span class="m">${cap1(who)}</span><span class="rsE">${e}</span>${done?'':`<span class="m">${now?`<span id="rsMin">${rsMin()}</span>`:can?'Tap to start.':open&&on?'One research at a time.':open?'Not enough money yet.':`From ${y}.`}</span>`}${now?'<span class="rsB"><i id="rsBar"></i></span>':''}</button>`}).join('')}</div><div class="btns"><button class="pri" id="ovOk">Close</button></div>`);
 rsBar();$('#ovOk').onclick=closeOv;document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=TECH.find(q=>q[0]===b.dataset.t),c=rsCost(t);if(S.rs)return;
  if(S.rfree>0)S.rfree--;else{if((S.stock.gold||0)<c)return;S.stock.gold-=c}S.rs={k:t[0],p:0};
  sfx('click');toast(`🔬 Research begun: ${t[1]}`);showResearch()})}
/* --- harbour shipping --- */
const ROUTES={linz:{n:'Albany & the Erie Canal',sell:{bricks:13,beer:15},buy:{grain:4,food:5}},pest:{n:'Boston',sell:{beer:17,bricks:14},buy:{cloth:9,iron:16}},galati:{n:'Liverpool',sell:{beer:20,cloth:22},buy:{wine:12,iron:15}}};
function shipPath(o){if(o.wpath)return o.wpath;const st=[];for(const[x,y]of perim(o))if(inb(x,y)&&S.tiles[y*W+x]===WATER)st.push(y*W+x);if(!st.length)return o.wpath=[];
 const par=new Map(st.map(i=>[i,-1])),q=st.slice(),d=new Map(st.map(i=>[i,0]));let far=st[0];
 for(let h=0;h<q.length;h++){const k=q[h];if(d.get(k)>d.get(far))far=k;if(d.get(k)>=55)continue;const x=k%W,y=k/W|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(!inb(nx,ny)||par.has(n)||S.tiles[n]!==WATER)continue;par.set(n,k);d.set(n,d.get(k)+1);q.push(n)}}
 const p=[];let c=far;while(c!==-1){p.push(c);c=par.get(c)}return o.wpath=p.reverse()}
function harbourTick(o,dt,st){if(o.bld)return;if(S.epi&&(!o.vs||o.vs==='idle')){o.st='Quarantine: no sailing';return}if(!o.c){o.st='Needs a road to a market';return}const R=ROUTES[o.route||'pest'],mo=monthOf(S.t);
 if(!o.vs)o.vs='idle';if(o.vs==='idle'){if(mo===11||mo<=1){o.st='Ice on the rivers: no sailing';return}
  o.cargo={};for(const g in R.sell){const n=Math.min(20,Math.max(0,Math.floor(st[g]-10)));if(n>0){st[g]-=n;o.cargo[g]=n}}o.vs='out';o.vt=0;o.st=`Steaming to ${R.n}`;return}
 o.vt+=dt;const T=40;if(o.vs==='out'&&o.vt>=T){let inc=0;for(const g in o.cargo)inc+=o.cargo[g]*R.sell[g];o.inc=inc;o.vs='back';o.vt=0;o.buys={};
  for(const g in R.buy){const room=cap()-st[g],n=Math.max(0,Math.min(20,room,Math.floor((st.gold+inc-200)/R.buy[g]/2)));if(n>0){o.buys[g]=n;inc-=n*R.buy[g]}}o.net=inc;o.st=`Returning from ${R.n}`}
 else if(o.vs==='back'&&o.vt>=T){st.gold+=o.net||0;for(const g in o.buys||{})st[g]=Math.min(cap(),st[g]+o.buys[g]);float(o.x+1,o.y+1,`⚓ ${o.net>=0?'+':''}${money(Math.round(o.net||0))}`);o.vs='idle';o.st='In port'}}
function drawShips(hw,hh){for(const o of S.list){if(o.t!=='harbour'||!o.vs||o.vs==='idle')continue;const p=shipPath(o);if(p.length<2)continue;
 const f=Math.min(1,o.vt/40),pos=(o.vs==='out'?f:1-f)*(p.length-1),k=Math.min(p.length-2,Math.floor(pos)),t=pos-k,a=p[k],b=p[k+1],x=(a%W)*(1-t)+(b%W)*t,y=(a/W|0)*(1-t)+(b/W|0)*t,[sx,sy]=scr(x,y),z=Z*1.6;
 if(sx<-40||sx>vw+40||sy<-40||sy>vh+40)continue;ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(sx,sy+2*z,11*z,3*z,0,0,7);ctx.fill();
 poly([sx-9*z,sy-1*z,sx+9*z,sy-1*z,sx+7*z,sy+2.5*z,sx-7*z,sy+2.5*z],'#f4f1ea');poly([sx-9*z,sy-1*z,sx+9*z,sy-1*z,sx+9*z,sy-2.5*z,sx-9*z,sy-2.5*z],'#2a2522');
 ctx.fillStyle='#f4f1ea';ctx.fillRect(sx-4*z,sy-6*z,8*z,3.5*z);ctx.fillStyle='#b8322a';ctx.fillRect(sx-1*z,sy-11*z,2.2*z,5*z);ctx.fillStyle='#1d1b1a';ctx.fillRect(sx-1*z,sy-11.5*z,2.2*z,1.2*z);
 ctx.fillStyle='#7a5532';ctx.beginPath();ctx.arc(sx,sy+.5*z,2.6*z,0,7);ctx.fill();ctx.fillStyle='rgba(200,200,200,.6)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(sx-2*z-i*3*z,sy-13*z-i*2*z,(1.6+i*.8)*z,0,7);ctx.fill()}}}
/* --- the army --- */
function newContract(need,pay,months,txt){S.ctr={need,pay,due:S.t+YEAR*months/12,txt};toast(`🎖️ ${txt}: ${costStr(need)}, pays ${money(pay,1)}`)}
function contractTick(st){const c=S.ctr;if(!c)return;if(S.t<c.due){if(Object.keys(c.need).every(g=>st[g]>=c.need[g]+5)){for(const g in c.need)st[g]-=c.need[g];st.gold+=c.pay;S.ctrOK=(S.ctrOK||0)+1;S.prest+=c.war?8:4;toast(`🎖️ Delivered to the army: +${money(c.pay)}`);S.ctr=null}return}
 S.prest=Math.max(0,S.prest-(c.war?12:3));if(c.war)S.bad=S.t+YEAR/2;toast(`🎖️ The army's order could not be filled. 👑 −${c.war?12:3}`);S.ctr=null}
/* --- smoke from works chimneys hangs over the streets around them; homes in it are less happy --- */
const SMOKY={brewery:1,brick:1.4,kraftwerk:2.5,gaswerk:1.6,autofabrik:2,coalyard:1,ironyard:.8};
let SMOKEM=null;
function smokeMapUpd(){if(!SMOKEM||SMOKEM.length!==W*H)SMOKEM=new Float32Array(W*H);SMOKEM.fill(0);
 for(const o of S.list){const k=SMOKY[o.t];if(!k||o.bld||o.r)continue;const f=B[o.t].foot||1,cx=o.x+(f-1)/2,cy=o.y+(f-1)/2,R=14;
  for(let y=Math.max(0,Math.floor(cy-R));y<=Math.min(H-1,Math.ceil(cy+R));y++)for(let x=Math.max(0,Math.floor(cx-R));x<=Math.min(W-1,Math.ceil(cx+R));x++){const d=Math.hypot(x-cx,y-cy);if(d<R)SMOKEM[y*W+x]+=k*(1-d/R)}}}
/* --- the main tick for all of it --- */
function extTick(dt,st){const p=popTotals(),tot=Ps(p,1),r=RES();
 // happiness
 S.hT=(S.hT||0)+dt;if(S.hT>=2){S.hT=0;smokeMapUpd();let sw=0,sh=0;
 /* the homeless share is the city's, worked out once for the round of houses (it counts every home, so once a house made a big city slow) */
 const hsh=homelessShare();for(const o of S.list){if(o.t!=='house'||o.h||o.bld||o.r)continue;const n=houseNeeds(o);let tw=0,ok=0;for(const q of n){const w=q[3]||1;tw+=w;if(q[0])ok+=w}let h=ok/tw;
  h+=lawHap(o)+TAXR[S.taxR||'normal'][1];if(S.good>S.t)h+=.08;
  if(r.landsteiner&&COV.hosp&&COV.hosp[o.y*W+o.x])h+=.1;if(COV.tram&&COV.tram[o.y*W+o.x])h+=.08;if(hsh>.02)h-=Math.min(.25,hsh*.8);if(S.epi)h-=.15;if(S.crime>40)h-=(S.crime-40)*.002;if(COV.rail&&COV.rail[o.y*W+o.x])h+=.06;if(COV.rink&&COV.rink[o.y*W+o.x])h+=monthOf(S.t)===11||monthOf(S.t)<=1?.1:.04;if(COV.ride&&COV.ride[o.y*W+o.x]&&o.lvl>=5)h+=.08;if(S.infl>S.t)h-=.1;if(S.bad>S.t&&o.lvl>=4)h-=.2;if(S.war)h-=.1;if(S.war===2&&S.ration)h-=.1;{const f=o.lvl>=4?.09:.05,c=o.x+1+(o.y+1)*W;h-=Math.min(.35,(SMOKEM[c]||0)*f)}h=Math.max(0,Math.min(1,h));o.hap=o.hap==null?h:o.hap+(h-o.hap)*(h<o.hap?.35:.12);h=o.hap;
  if(h<.45&&o.pop>1&&Math.random()<.15)o.pop--;sw+=o.pop;sh+=o.pop*h}S.hap=sw?sh/sw:1}
 // strikes
 if(tot>30&&(S.hap??1)<.45)S.unrest=(S.unrest||0)+dt;else S.unrest=Math.max(0,(S.unrest||0)-dt*.5);
 if(S.unrest>90&&!(S.strike>S.t)&&S.t>(S.strikeCD||0)&&!S.sc){S.unrest=0;const wage=1000+Math.round(tot*2);if(!marchStart(wage))strikeChoice(wage)}
 sceneTick();if(S.promise&&S.t>=S.promise)promiseDue();uwTick();caseTick();sisiTick();voicesTick();cityWarn(st);
 // fires
 /* in the new start the city is young: no fire before 1870 and twenty buildings of the player's own, and a word of warning first,
    a year before the first can come, so a fire station can go up in time */
 S.fireT=(S.fireT||0)+dt;if(S.fireT>=10){S.fireT=0;const own=S.list.filter(o=>!o.h&&!o.r&&!o.bld&&(o.t==='house'||B[o.t].out));
  const young=S.scratch&&(S.t<yT(1870,1)||own.length<20||!(S.fireWarn&&S.t>=S.fireWarn));
  if(S.scratch&&!S.fireWarn&&S.t>=yT(1870,1)&&own.length>=20){S.fireWarn=S.t+YEAR;if(!cnt('feuerwehr'))evOv('🔥 A word about fire',`${NYC()?'Mr. Mayor':'Majesty'}, a growing city burns easily. A fire station keeps the homes near it safe. Build one before the first fire comes.`)}
  if(!young&&own.length>=6&&Math.random()<10/(YEAR*2.2)){const o=own[Math.random()*own.length|0];
  if(COV.fire&&COV.fire[o.y*W+o.x]){toast('🚒 Fire! Your fire brigade puts it out in time')}else fireStart(o)}}
 // loans
 if(S.loan>0){const E=ECO(),pay=Math.min(S.loan,E.loan[0]/(E.loanY*YEAR)*dt);S.loan-=pay;st.gold-=pay;CU().l+=pay}
 // research
 // Chicago
 S.bpi=S.bpi||0;while(S.bpi<BPM.length&&S.t>=yT(BPM[S.bpi][0],BPM[S.bpi][1])){toast(`${RIVI()} ${BPM[S.bpi][3]}. ${RIVAL()} 👑 ${bpScore()}`);S.bpi++}
 // army
 if(cnt('rossauer')&&!S.list.some(o=>o.t==='rossauer'&&o.bld)&&!S.ctr&&S.t>=(S.ctrT||0)){S.ctrT=S.t+YEAR*3;newContract({food:30+Math.round(tot/20),beer:15,iron:8},1200+tot*3,4,'The army orders supplies')}
 if(S.war&&!S.ctr&&S.t>=(S.ctrT||0)){S.ctrT=S.t+YEAR/4;S.ctr=null;newContract({food:60+Math.round(tot/10),iron:25,wood:20},2500,3,'War quota for the front');S.ctr.war=1}
 contractTick(st);
 if(S.refG&&S.t>=S.refG.due){const n=S.list.filter(o=>o.t==='house'&&!o.h&&o.lvl<6).length;if(n>=S.refG.n){S.prest+=40;evOv('The refugees have homes','You housed the newcomers. 👑 +40.')}else{S.prest=Math.max(0,S.prest-30);evOv('Refugees without homes','Too few new homes were built for the newcomers. 👑 −30.')}S.refG=null}
 // power stations burn coal
 {const ks=S.list.filter(o=>o.t==='kraftwerk'&&!o.bld&&o.c);if(ks.length){const had=st.coal>=1;st.coal=Math.max(0,st.coal-ks.length*.03*dt);for(const o of ks)o.st=st.coal>=1?'Generating electricity':'No coal';if(had!==(st.coal>=1))covCompute()}}
 // ships
 for(const o of S.list)if(o.t==='harbour'&&!o.r)harbourTick(o,dt,st);
 crisisTick();crimeTick();diploTick();storyTick();empireTick(dt);invasionTick(dt);
 // characters and audiences
 S.qT=(S.qT||0)+dt;if(S.qT>=1.5){S.qT=0;questTick(st);if(L.y1857&&$('#ov').hidden)audienceTick()}}
function drawSvc(k,cx,cy,z,hw,hh,s){
 if(k==='coalyard'){for(let i=0;i<3;i++){const px=cx-hw*.35+i*hw*.3,py=cy+hh*.1-i*hh*.05;ctx.fillStyle='#2a2826';ctx.beginPath();ctx.moveTo(px-hw*.18,py);ctx.lineTo(px,py-10*z);ctx.lineTo(px+hw*.18,py);ctx.closePath();ctx.fill()}box(cx+hw*.45,cy-hh*.2,s*.22,10*z,'#b5583a','#3a3530',5*z);return}
 if(k==='kraftwerk'){box(cx-hw*.08,cy,s*.62,16*z,'#c97a56','#4a4f55',8*z);for(const dx of[.32,.5]){const px=cx+hw*dx,py=cy-hh*.25;ctx.fillStyle='#8a4b35';ctx.fillRect(px-2*z,py-34*z,4*z,34*z);ctx.fillStyle='rgba(120,120,120,.5)';ctx.beginPath();ctx.arc(px,py-38*z,3.5*z,0,7);ctx.fill()}
  ctx.fillStyle='#f2d27a';ctx.font=`${Math.max(8,14*z)}px system-ui`;ctx.textAlign='center';ctx.fillText('⚡',cx-hw*.08,cy-24*z);return}
 if(k==='tram'){box(cx,cy,s*.8,10*z,'#e9dcc0','#8a4a36',9*z);for(let i=0;i<2;i++){const px=cx-hw*.25+i*hw*.4,py=cy+hh*.42-i*hh*.2;ctx.fillStyle='#b8322a';ctx.fillRect(px-6*z,py-6*z,12*z,5*z);ctx.fillStyle='#efe3c8';ctx.fillRect(px-6*z,py-6*z,12*z,2*z)}
  if(RES().electric){ctx.strokeStyle='#2a1d14';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(cx-hw*.6,cy+hh*.1-14*z);ctx.lineTo(cx+hw*.6,cy-hh*.3-14*z);ctx.stroke()}return}
 if(k==='autofabrik'){box(cx-hw*.05,cy,s*.8,13*z,'#d9cdb6','#6d737a',3*z);for(let i=0;i<4;i++){const px=cx-hw*.4+i*hw*.22;poly([px,cy-13*z-i*hh*.11,px+hw*.11,cy-19*z-i*hh*.11,px+hw*.22,cy-13*z-i*hh*.11],'#8a9097')}
  ctx.fillStyle='#8a4b35';ctx.fillRect(cx+hw*.4,cy-34*z,3.5*z,28*z);ctx.fillStyle='#1d1b1a';ctx.fillRect(cx+hw*.2,cy+hh*.35-4*z,9*z,4*z);return}
 if(k==='kaffeehaus'){const t=hw/4,t2=hh/4,tx=t>=4.5;poly([cx-hw*.9,cy,cx,cy-hh*.9,cx+hw*.9,cy,cx,cy+hh*.9],'#d6cdb9');prismTex(cx-t*.3,cy-t2*.3,1.15,1.15,1.35*t,5,3,'#5f8e7c',.45*t,t,t2,tx);
  for(let i=0;i<4;i++){const u=.25+i*.38,[ax,ay]=[cx+(u-1.45)*t,cy+(u+1.45)*t2-.4*t];poly([ax-.17*t,ay,ax+.17*t,ay+.09*t,ax+.17*t,ay+.09*t-.14*t,ax-.17*t,ay-.14*t],i%2?'#f4f1ea':'#7a2f2a')}
  for(let i=0;i<3;i++){const px=cx+t*(.6+i*.35),py=cy+t2*(1.2-i*.35);ctx.fillStyle='#4a3020';ctx.fillRect(px-.02*t,py-.35*t,.04*t,.35*t);ctx.beginPath();ctx.ellipse(px,py-.38*t,.28*t,.1*t,0,0,7);ctx.fillStyle=i%2?'#f4f1ea':'#7a2f2a';ctx.fill();ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(px,py-.06*t,.12*t,.05*t,0,0,7);ctx.fill()}return}
 if(false){ctx.fillStyle='#7a2f2a';ctx.fillRect(cx-hw*.42,cy-6*z,hw*.5,2.4*z);for(let i=0;i<3;i++){const tx=cx+hw*.28+i*4*z,ty=cy+hh*.2-i*2*z;ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(tx,ty-2*z,2*z,1*z,0,0,7);ctx.fill();ctx.fillStyle='#5a3b26';ctx.fillRect(tx-.4*z,ty-2*z,.8*z,2*z)}return}
 if(k==='feuerwehr'){const t=hw/4,t2=hh/4,tx=t>=4.5;poly([cx-hw*.9,cy,cx,cy-hh*.9,cx+hw*.9,cy,cx,cy+hh*.9],'#cfc6b4');prismTex(cx-t*.2,cy+t2*.2,1.3,.9,1.1*t,8,2,'#5a5f66',.4*t,t,t2,tx);
  for(let i=0;i<3;i++){const u=-1+i*.75,[ax,ay]=[cx+(u-1.1)*t-.2*t,cy+(u+1.1)*t2+.2*t2];ctx.fillStyle='#3a2a1e';ctx.beginPath();ctx.moveTo(ax-.2*t,ay);ctx.lineTo(ax-.2*t,ay-.4*t);ctx.arc(ax,ay-.4*t,.2*t,Math.PI,0);ctx.lineTo(ax+.2*t,ay);ctx.fill()}
  const[tx_,ty_]=[cx+t*.95,cy-t2*.95];prismTex(tx_,ty_,.3,.3,2.6*t,8,4,'#5a5f66',.5*t,t,t2,tx);
  const wx=cx+t*.9,wy=cy+t2*1.6;ctx.fillStyle='#b8322a';ctx.fillRect(wx-.35*t,wy-.3*t,.7*t,.22*t);ctx.fillStyle='#2a1d14';ctx.beginPath();ctx.arc(wx-.22*t,wy-.06*t,.08*t,0,7);ctx.arc(wx+.22*t,wy-.06*t,.08*t,0,7);ctx.fill();drawHorse(wx+.6*t,wy,1,.5,t*.11,'#2a2522',0);return}
 if(false){box(cx+hw*.32,cy-hh*.18,s*.16,28*z,'#c4694a','#5a3022',4*z);ctx.fillStyle='#2a1d14';ctx.fillRect(cx-hw*.3,cy-7*z,4*z,6*z);ctx.fillRect(cx-hw*.1,cy-5*z,4*z,6*z);return}
 if(k==='spital'){box(cx,cy,s*.82,14*z,'#f3f1ea','#8a8580',8*z);ctx.fillStyle='#c0392b';const y=cy-26*z;ctx.fillRect(cx-1.2*z,y-4*z,2.4*z,8*z);ctx.fillRect(cx-4*z,y-1.2*z,8*z,2.4*z);return}
 if(k==='gaswerk'){const r=hw*.32;ctx.fillStyle='#6d737a';ctx.fillRect(cx-r,cy-20*z,r*2,20*z);ctx.beginPath();ctx.ellipse(cx,cy,r,r/2,0,0,Math.PI);ctx.fill();ctx.fillStyle='#8a9097';ctx.beginPath();ctx.ellipse(cx,cy-20*z,r,r/2,0,0,7);ctx.fill();
  ctx.strokeStyle='#4a4f55';ctx.lineWidth=1;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(cx-r,cy-i*5*z);ctx.lineTo(cx+r,cy-i*5*z);ctx.stroke()}box(cx+hw*.45,cy+hh*.1,s*.2,10*z,'#b5583a','#5a3022',4*z);return}
 if(k==='harbour'){poly([cx-hw*.8,cy,cx,cy-hh*.8,cx+hw*.8,cy,cx,cy+hh*.8],'#9c7a54');ctx.strokeStyle='rgba(60,40,20,.4)';ctx.lineWidth=.7;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx-hw*.8+(i+3)*hw*.23,cy+(i+3)*hh*.11-hh*.0);ctx.lineTo(cx+(i+3)*hw*.11,cy-hh*.8+(i+3)*hh*.23);ctx.stroke()}
  box(cx-hw*.2,cy-hh*.1,s*.3,10*z,'#f1e9d6','#5f8e7c',6*z);ctx.strokeStyle='#3a3530';ctx.lineWidth=Math.max(1,z*1.2);ctx.beginPath();ctx.moveTo(cx+hw*.35,cy);ctx.lineTo(cx+hw*.35,cy-24*z);ctx.lineTo(cx+hw*.65,cy-18*z);ctx.stroke();return}}

/* ===================== characters, petitions and city laws ===================== */
const LAW=()=>S.laws||(S.laws={});
/* the laws: key, name, from the year, the price to enact, then what it brings and what it costs, short; {20} is a sum in the city's money */
const LAWS=[
 ['bauordnung','Tenement House Act',1867,800,'😊 Residents’ happiness +8%','🏗️ Lots sell for 10% less'],
 ['schule','Compulsory schooling',1874,1500,'🔬 Research 30% faster · 😊 Happiness +4%','🪙 Costs {20} a minute'],
 ['kinder','Factory Act',1886,600,'😊 Happiness +5% · 👑 +10','🏭 Workshops −5%'],
 ['sonntag','Sunday closing',1895,500,'😊 Happiness of labourers and craftsmen +10%','🏭 Workshops −8%'],
 ['kommunal','A city-owned subway',1900,3000,'🚋 Subway, gas and power: upkeep halved, +{40} a minute each','😊 Happiness of the upper classes −4%']];
function lawHap(o){const l=LAW();let h=0;if(l.bauordnung)h+=.08;if(l.schule)h+=.04;if(l.kinder)h+=.05;if(l.sonntag&&o.lvl<=2)h+=.1;if(l.kommunal&&o.lvl>=4)h-=.04;return h}
const lawProd=()=>(LAW().kinder?.95:1)*(LAW().sonntag?.92:1);
function showCityHall(){setTimeout(()=>{const b=$('#recBtn');if(b)b.onclick=recruit;document.querySelectorAll('[data-aud]').forEach(x=>x.onclick=()=>{closeOv();openAudience(x.dataset.aud)});const hb=$('#myHouse');if(hb)hb.onclick=showHome},0);const yr=Math.floor(Y0+S.t/YEAR),l=LAW(),act=QUESTS.filter(q=>!q.quiet&&S.q&&S.q[q.id]&&S.q[q.id].st==='active');
 ov(`<h2>${HALLB()}</h2>${act.length?`<h3 style="margin:8px 0 4px">Requests</h3>${act.map(q=>`<p class="m"><b>${q.who}</b>: ${q.short} <i>by ${dateStr(S.q[q.id].due)}</i>. ${questProgress(q)}</p>`).join('')}`:'<p class="m">No open requests right now.</p>'}
 ${audienceList()}${homeHall()}${showEmpire()}${showDiplo()}
 ${lawList(l,yr)}
 <div class="btns"><button class="pri" id="ovOk">Close</button></div>`);$('#ovOk').onclick=closeOv;
 document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const L_=LAWS.find(q=>q[0]===b.dataset.l),k=L_[0];if(l[k]){delete l[k];S.prest=Math.max(0,S.prest-5);toast(`📜 ${L_[1]} repealed. 👑 −5`)}else{if(S.stock.gold<L_[3]){toast(`Enacting this law costs ${money(L_[3])}`);return}S.stock.gold-=L_[3];l[k]=1;if(k==='kinder')S.prest+=10;sfx('chime');toast(`📜 ${L_[1]} is now law`)}recompute();showCityHall()})}
/* ---------- the Mayor's own house: bought with his own purse in a fine neighbourhood of the year, refurbished room by room and on the
   front, shown in the city (home.js draws it and its rooms). His purse is apart from the treasury: a salary of 10,000 $ a year, from
   1898 15,000 $ under the Greater New York charter, paid monthly, and a gift or a fee of 40 $ for each crown of standing he earns in
   quests and scenes. A finer house raises his standing, and now and then he can give a dinner for the city's notables ---------- */
const HOODS=[['wsq','Washington Square',40.7312,-73.9973,1857,[30000,52000],3,'A Greek Revival row house of red brick on the north side of the square, with a white marble stoop'],
 ['murray','Murray Hill',40.7486,-73.9801,1857,[26000,60000],3,'A brownstone on Madison Avenue, among the merchant families of the Hill'],
 ['gram','Gramercy Park',40.7378,-73.9862,1857,[38000,70000],4,'A house on the square with a gold key to the private park'],
 ['fifth','Fifth Avenue',40.7650,-73.9715,1885,[220000,420000],8,'A limestone mansion facing Central Park on Millionaires\' Row']];
/* what can be done to the house: room, item, name, price, standing, from the year */
const HOMEIT=[['parlour','paper','Wallpaper',350,1],['parlour','carpet','A carpet',600,1],['parlour','suite','Parlour suite',1500,2],['parlour','piano','A Steinway piano',800,2],['parlour','paint','Paintings',900,1],['parlour','portrait','Your portrait in oils',600,2],
 ['dining','paper','Wallpaper',300,1],['dining','carpet','A carpet',500,1],['dining','table','Dining table and chairs',1200,2],['dining','silver','Silver and china',900,1],
 ['study','paper','Wallpaper',250,1],['study','library','A library',1000,2],['study','desk','Desk and leather chair',600,1],['study','phone','A telephone',150,1,1878],
 ['bed','paper','Wallpaper',250,1],['bed','carpet','A carpet',400,1],['bed','bed','Bedroom set',900,1],
 ['house','gas','Gas chandeliers',500,1],['house','elec','Electric light',1500,2,1882],
 ['front','paint','Fresh paint',300,1],['front','stoop','A new brownstone stoop',1200,1],['front','rail','Iron railings',600,1],['front','mansard','A mansard storey',6000,3]];
const ROOMS={parlour:'Parlour',dining:'Dining room',study:'Study',bed:'Bedroom',house:'Lighting',front:'The front'};
/* the style of the year: Rococo and Renaissance Revival, then Eastlake and the Aesthetic Movement, then Colonial Revival and Beaux-Arts */
const homeEra=()=>{const y=Y0+S.t/YEAR;return y<1880?'r':y<1900?'e':'c'},ERAN={r:'Renaissance Revival',e:'Eastlake',c:'Colonial Revival'};
const hood=k=>HOODS.find(h=>h[0]===k);
function hoodPrice(h){const y=Math.max(1865,Math.min(1915,Y0+S.t/YEAR)),[a,b]=h[5];return Math.round((a+(b-a)*(y-1865)/50)/500)*500}
/* the lot he can buy: a finished house lot (not a tower or a block of flats) near the place itself */
function hoodLot(h){const[gx,gy]=gt(...prj(L,h[2],h[3]));let best=null,bd=1e9;for(const o of S.list){if(o.t!=='house'||o.bld||(o.tier||0)>=2)continue;const d=Math.hypot(o.x+2-gx,o.y+2-gy);if(d<12&&d<bd){bd=d;best=o}}return best}
const homeLot=()=>S.home?S.list.find(o=>o.t==='house'&&o.x===S.home.x&&o.y===S.home.y)||null:null;
function homeStanding(){const H_=S.home;if(!H_)return 0;let s=hood(H_.k)[6];for(const it of HOMEIT)if(H_.it[it[0]+'.'+it[1]])s+=it[4];return s}
function homeTick(){if(!L.y1857)return;if(S.purse==null){S.purse=20000;S.purseP=S.prest||0;S.salT=S.t}
 while(S.t>=S.salT+YEAR/12){S.salT+=YEAR/12;S.purse+=Math.round((Y0+S.salT/YEAR>=1898?15000:10000)/12)}
 const dp=(S.prest||0)-(S.purseP||0);if(dp>0)S.purse+=dp*40;S.purseP=S.prest||0;
 const H_=S.home;if(!H_)return;if(!homeLot()){S.home=null;GV++;toast('🏠 Your house is gone from its lot, and with it your home in the city');return}
 if(H_.sc&&S.t>=H_.sc){H_.sc=0;S.prest=Math.max(0,S.prest-25);S.unrest=(S.unrest||0)+30;sfx('alarm');evOv('📰 Scandal!',`The Times prints the vouchers: the city treasury paid for the Mayor's house in ${hood(H_.k)[1]}. Cartoons of you carrying sacks of money fill Harper's Weekly. 👑 −25, and the wards are angry`)}}
function homeBuy(k,city){const h=hood(k),o=hoodLot(h),p=hoodPrice(h);if(!o)return toast(`🏠 No house is for sale in ${h[1]} yet: sell building lots there first`);
 if(city){if(S.stock.gold<p)return toast('The treasury cannot pay for it');S.stock.gold-=p}else{if(S.purse<p){const m=Math.ceil((p-S.purse)/((Y0+S.t/YEAR>=1898?15000:10000)/12));return evOv('🏠 Not enough in your purse',`The house in ${h[1]} costs ${money(p,1)} and your purse holds ${money(S.purse,1)}. Your salary would save the rest in about ${m} months; quests and scenes that raise your standing bring fees and gifts sooner. Or buy in a cheaper neighbourhood, or let the city pay, at a risk.`)}S.purse-=p}
 const was=S.home;S.home={k,x:o.x,y:o.y,it:{},din:-1e9,sc:city&&Math.random()<.6?S.t+YEAR*(.2+Math.random()*.6):0};if(was&&!city)S.purse+=Math.round(hoodPrice(hood(was.k))*.8);
 S.prest+=h[6];S.purseP=S.prest;GV++;sfx('chime');closeOv();toast(`🏠 The house in ${h[1]} is yours. 👑 +${h[6]}`)}
/* an improvement, in the style of the year; done again later it is refitted in the newer style, without the standing a second time */
function homeItem(r,k){const it=HOMEIT.find(q=>q[0]===r&&q[1]===k),H_=S.home;if(!it||!H_)return false;const key=r+'.'+k,era=homeEra(),had=H_.it[key];
 if(it[5]&&Y0+S.t/YEAR<it[5])return toast(`Not before ${it[5]}`),false;if(had===era)return false;if(S.purse<it[3])return toast(`Your purse holds ${money(S.purse,1)}`),false;
 S.purse-=it[3];H_.it[key]=era;if(!had)S.prest+=it[4];S.purseP=S.prest;if(r==='front')GV++;sfx('coin');toast(`${it[2]}${had?' refitted':''} · −${money(it[3],1)}${had?'':` · 👑 +${it[4]}`}`);return true}
/* a dinner for the city's notables, twice a year at most, once the dining room can seat them */
function homeDinner(){const H_=S.home,st=homeStanding();if(!H_)return;if(!H_.it['dining.table'])return toast('🍽️ First a dining table that seats twelve');if(S.t-H_.din<YEAR/2)return toast(`🍽️ The next dinner can be given after ${dateStr(H_.din+YEAR/2)}`);
 const k=Math.min(2,.6+st/20),pay=c=>{if(S.purse<c){toast(`Your purse holds ${money(S.purse,1)}`);return false}S.purse-=c;H_.din=S.t;return true};
 evChoice('🍽️ A dinner at your house',`Twelve covers, oysters, terrapin and canvasback duck, champagne. The finer your house (standing ${st}), the more the evening counts. Whom do you invite?`,[
  ['🐯 The Tammany aldermen: −400 $, the Council is friendlier and the wards calmer',()=>{if(!pay(400))return;S.unrest=Math.max(0,(S.unrest||0)-Math.round(25*k));S.prest+=Math.round(2*k);toast('🐯 The aldermen promise their votes')}],
  ['💎 Mrs. Astor\'s Four Hundred: −800 $, the rich are happier for half a year',()=>{if(!pay(800))return;S.good=Math.max(S.good||0,S.t+YEAR/2*k);S.prest+=Math.round(4*k);toast('💎 Ward McAllister declares your table the best of the season')}],
  ['📰 Reformers and newspapermen: −300 $, less graft in the departments',()=>{if(!pay(300))return;const e=EMP();e.cor=Math.max(0,(e.cor||0)-Math.round(8*k));S.prest+=Math.round(3*k);toast('📰 The editors leave happy')}],
  ['Not now',()=>{}]])}
/* the house, from City Hall: the purse, the houses for sale, or his own house and its front */
function homeHall(){if(!L.y1857||!NYC())return'';homeTick();const H_=S.home;return`<h3 style="margin:8px 0 4px">🏠 Your house</h3><p class="m">Your own purse: <b>${money(S.purse,1)}</b> (salary ${money(Y0+S.t/YEAR>=1898?'15,000':'10,000')} a year)${H_?` · ${hood(H_.k)[1]}, standing ${homeStanding()}`:''}</p><div class="btns"><button id="myHouse">${H_?'🏠 Your house':'🏠 Buy a house'}</button></div>`}
function showHome(){homeTick();const H_=S.home,yr=Y0+S.t/YEAR;
 if(!H_||showHome.buy){showHome.buy=0;ov(`<h2>🏠 A house of your own</h2><p class="m">Your purse: <b>${money(S.purse,1)}</b>, from your salary and the fees and gifts your standing brings.</p>${HOODS.filter(h=>yr>=h[4]).map(h=>{const o=hoodLot(h),p=hoodPrice(h);return`<p><b>${h[1]}</b> · ${money(p,1)}<br><span class="m">${h[7]}.${o?'':' No house there yet: sell building lots there first.'}</span></p>${o&&(!H_||H_.k!==h[0])?`<div class="btns" style="justify-content:flex-start"><button data-hb="${h[0]}" class="${S.purse<p?'':'pri'}">${S.purse<p?`Your purse is ${money(p-S.purse,1)} short`:'Buy it from your purse'}</button><button data-hc="${h[0]}">Have the city pay (risky)</button></div>`:''}`}).join('')}<div class="btns"><button class="pri" id="ovOk">Close</button></div>`);
  $('#ovOk').onclick=closeOv;document.querySelectorAll('[data-hb]').forEach(b=>b.onclick=()=>homeBuy(b.dataset.hb,false));
  document.querySelectorAll('[data-hc]').forEach(b=>b.onclick=()=>evChoice('🏛️ The treasury pays?','A friendly alderman can put the house on the city\'s books as "repairs to public buildings". Nobody need know. Probably.',[['Do it',()=>homeBuy(b.dataset.hc,true)],['No, that is not how I govern',()=>{S.prest+=1;toast('👑 +1')}]]));return}
 const h=hood(H_.k),fr=HOMEIT.filter(q=>q[0]==='front');
 ov(`<h2>🏠 Your house in ${h[1]}</h2><p class="m">${h[7]}. Your purse: <b>${money(S.purse,1)}</b> · standing <b>${homeStanding()}</b> · furnished in the style of the day: ${ERAN[homeEra()]}</p>
 <h3 style="margin:8px 0 4px">The front</h3><div class="plc">${fr.map(q=>{const on=H_.it['front.'+q[1]];return`<button data-hi="${q[1]}" ${on?'disabled':''} style="text-align:left"><b>${on?'✅':'🔨'} ${q[2]}</b>${on?'':` · ${money(q[3],1)} · 👑 +${q[4]}`}</button>`}).join('')}</div>
 <div class="btns"><button id="homeIn">🚪 Go inside</button><button id="homeGo">📍 Go there</button><button id="homeMove">Move house</button><button class="pri" id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=closeOv;$('#homeGo').onclick=()=>{closeOv();centerOn(H_.x+2,H_.y+2)};$('#homeIn').onclick=()=>{closeOv();if(window.homeEnter)window.homeEnter(false)};$('#homeMove').onclick=()=>{showHome.buy=1;showHome()};
 document.querySelectorAll('[data-hi]').forEach(b=>b.onclick=()=>{if(homeItem('front',b.dataset.hi))showHome()})}
/* characters and their requests */
const NY_QALL=NY_QUESTS.concat(NY_GOALS,LM_GOALS);let QUESTS=NY_QALL;
const qcount=(k,g)=>{if(g&&(g.near||g.out||k==='palais')){const c=g.near&&ringAt(g.near);return S.list.filter(o=>o.t==='house'&&!o.h&&!o.r&&(k==='palais'?o.lvl===6:o.lvl<6)&&(!c||Math.hypot(o.x+1.5-c[0],o.y+1.5-c[1])<=12)&&(!g.out||ZONE[o.y*W+o.x]>=1)).length}
 return k==='house4'?S.list.filter(o=>o.t==='house'&&!o.h&&o.lvl<6).length:S.list.filter(o=>o.t===k&&!o.h&&!o.bld).length};
function questDone(q,st){const g=q.goal,s_=S.q[q.id];
 if(g.type==='build')return qcount(g.k,g)>=(g.k==='house4'||g.more?s_.base||0:0)+g.n;if(g.type==='prest')return(S.prest||0)>=g.n;
 if(g.type==='deliver')return Object.keys(g.g).every(k=>st[k]>=g.g[k]+5);
 if(g.type==='finish')return g.k.some(k=>S.list.some(o=>o.t===k&&!o.bld));
 if(g.type==='site')return S.list.some(o=>o.t===g.k);
 if(g.type==='hap')return(S.hap??0)>=g.v;
 if(g.type==='grow')return grown(s_)>=g.n;if(g.type==='pop')return dispPop()>=g.n;
 if(g.type==='res')return!!RES()[g.k];return false}
const plN=(w,n)=>{if(w==='street cleaning')w='street cleaning depot';if(w==='building lot'&&n>1)return'new homes';return n===1?w:/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':/(s|sh|ch)$/.test(w)?w+'es':w+'s'};
const grown=s_=>Ps(popTotals(),1)*(S.mult||1)-(s_.base||0);
/* in German the building's name is German already and takes no English plural ("2 feuerwaches"), so the count goes without it:
   the goal's own words name the building */
const deOn=()=>!!(window.I18N&&window.I18N.on);
/* progress as two numbers for the goals list, or null where a sentence fits better */
function questNums(q){const g=q.goal,s_=S.q[q.id];if(s_.st==='offered')return null;if(g.type==='finish'&&goalSite(q))return null;if(g.type==='build')return[Math.min(g.n,Math.max(0,qcount(g.k,g)-(g.k==='house4'||g.more?s_.base||0:0))),g.n];if(g.type==='prest')return[Math.min(g.n,S.prest||0),g.n];if(g.type==='grow')return[Math.max(0,Math.round(grown(s_)/100)*100),g.n];
 if(g.type==='pop')return[dispPop(),g.n];if(g.type==='finish')return[g.k.some(k=>S.list.some(o=>o.t===k&&!o.bld))?1:0,1];return null}
const goalSite=q=>{const g=q.goal,k=g.type==='finish'?g.k[0]:g.type==='build'?g.k:null;return k&&S.list.find(o=>o.t===k&&o.bld&&!o.h)};
/* a goal whose last building is already going up: nothing left for the player to do but wait */
const goalBusy=q=>{const g=q.goal;return!!goalSite(q)&&(g.type==='finish'||questNums(q)[0]+1>=g.n)};
function questProgress(q){const g=q.goal,s_=S.q[q.id];if(s_&&s_.st==='offered')return'Waiting for your answer';{const o=goalSite(q);if(o&&(g.type==='finish'||questNums(q)[0]+1>=g.n))return`🏗️ Under construction, ${Math.round(siteProg(o)*100)}%`}const of_=deOn()?' / ':' of ';if(g.type==='grow'||g.type==='pop'){const[a,b]=questNums(q);return`${fmtPop(a)}${of_}${fmtPop(b)}`}if(g.type==='build'){const n=questNums(q)[0],d=B[g.k==='house4'?'house':g.k];return`${n}${of_}${g.n}${d&&!deOn()?' '+plN(d.n.toLowerCase(),g.n):''}${g.near&&!deOn()?' on the '+g.near:''}`}if(g.type==='prest')return`👑 ${Math.floor(S.prest||0)}${of_}${g.n}`;if(g.type==='hap')return`Now ${Math.round((S.hap??0)*100)}%`;
 if(g.type==='deliver')return Object.entries(g.g).map(([k,v])=>`${ICON[k]} ${Math.floor(S.stock[k])}/${v+5}`).join(' ');return''}
function card(q,html,opts){evChoice(`${q.who}`,`<span class="m">${q.role}</span><br>${html}`,opts)}
const rewStr=r=>[r.gold?`${money(r.gold,1)}`:'',r.prest?`👑 ${r.prest}`:'',r.joy?'a happier city for a year':'',r.rfree?'one free research':'',r.site?'faster construction':''].filter(Boolean).join(', ');
/* a new goal or request at most every game year, never more than two open, and only while the player is not placing or reading */
/* when no goal is left for the years ahead, the census sets the next: a population a little above today's, round. Its id carries the
   number, so a saved one comes back after a reload */
function autoGoal(n){const id='auto_pop_'+n;let q=QUESTS.find(x=>x.id===id);if(q)return q;
 q={id,quiet:1,i:'👥',at:[Y0,1],who:'👥 The census',role:'counts the city',short:`Reach ${fmtPop(n)} people`,text:'The city keeps growing. More homes and more work bring more people.',goal:{type:'pop',n},rew:{prest:15},need:()=>false};QUESTS.push(q);return q}
let AUTOQ=null;
function questTick(st){S.q=S.q||{};if(AUTOQ!==S){AUTOQ=S;for(const id in S.q)if(id.startsWith('auto_pop_'))autoGoal(+id.slice(9))}
 /* every landmark that is unlocked and not yet begun is a goal of its own, also after its day in history has passed (then with no deadline) */
 for(const q of QUESTS){if(!q.lm)continue;const s_=S.q[q.id];if((!s_||s_.st==='missed')&&q.need()){S.q[q.id]={st:'active',due:S.t<yT(...q.due)?yT(...q.due):null};GOALSIG=''}}
 let open=0,live=0,next=null,nextQ=null,soon=null;for(const q of QUESTS){const s_=S.q[q.id];if(q.lm)continue;if(s_){if(s_.st==='active'||s_.st==='offered')open++;if(s_.st==='active'&&q.quiet)live++;continue}
  const at=yT(...q.at);if((S.t>=at||q.quiet&&S.t>=at-2*YEAR)&&(!q.due||S.t<yT(...q.due)-(q.quiet?0:-YEAR*2))&&(!q.need||q.need())&&qNew(q)){if(!next||at<yT(...next.at))next=q;if(q.quiet&&(!nextQ||at<yT(...nextQ.at)))nextQ=q}
  /* the next small goal of the years ahead, taken early when nothing else is on the list */
  if(q.quiet&&at>S.t&&(!q.need||q.need())&&qNew(q)&&(!soon||at<yT(...soon.at)))soon=q}
 /* the goals list is never empty: with no goal on it the next comes at once, from the years ahead if need be, or from the census */
 if(!live){const g=nextQ||soon||(L&&L.y1857?autoGoal(S.scratch?Math.max(500,Math.ceil(dispPop()*1.3/500)*500):Math.max(50000,Math.ceil(dispPop()*1.15/50000)*50000)):null);if(g)next=g}
 if(next&&open<2&&(S.t>=yT(...next.at)||!open||!live)&&(S.t>=(S.gNext||0)||!live)&&(next.quiet||$('#ov').hidden&&!placing()&&!MSG.length)){const q=next,g=q.goal;
  if(q.quiet){S.q[q.id]={st:'active',due:q.due?yT(...q.due):null,base:g.type==='grow'?grown({}):g.type==='build'&&(g.k==='house4'||g.more)?qcount(g.k,g):0};if(questDone(q,st))S.q[q.id].st='had';else S.gNext=S.t+YEAR*(L.ringOct?.4:1);GOALSIG=''}
  else if(letGo(false)){S.q[q.id]={st:'offered',at:S.t};S.gNext=S.t+YEAR;questOffer(q);GOALSIG='';return}}
 for(const q of QUESTS){const s_=S.q[q.id];if(!s_)continue;
  if(s_.st==='offered'&&S.t>=Math.max(yT(...q.due),(s_.at||0)+YEAR)){s_.st='declined';GOALSIG='';continue}
  if(s_.st!=='active')continue;
  if(questDone(q,st)){const r=q.rew;if(q.goal.type==='deliver')for(const k in q.goal.g)st[k]-=q.goal.g[k];if(r.gold)st.gold+=r.gold;if(r.prest)S.prest+=r.prest;if(r.joy)S.good=S.t+YEAR;if(r.rfree)S.rfree=(S.rfree||0)+r.rfree;
   if(r.site){const o=S.list.find(o=>o.t===r.site&&o.bld);if(o)for(const k in o.bld)o.bld[k]=Math.floor(o.bld[k]*.7)}s_.st='done';sfx('chime');GOALSIG='';if(q.quiet){toast(`🎯 ${ucf(q.short)}: done! ${rewStr(r)}`);continue}toast(`${q.who} thanks you: ${q.short}, done. ${rewStr(r)}`);continue}
  if(q.quiet){if(s_.due!=null&&S.t>=s_.due){if(q.lm)s_.due=null;else s_.st='missed';GOALSIG=''}continue}
  if(S.t>=s_.due){s_.st='failed';S.prest=Math.max(0,S.prest-10);if(q.fail&&q.fail.unrest)S.unrest=(S.unrest||0)+q.fail.unrest;toast(`${q.who.split(' ')[0]} Missed: ${q.short} 👑 −10`)}}}
/* a request's letter: it waits in the goals list until the player answers it */
const reqDue=q=>Math.max(yT(...q.due),S.t+YEAR*1.5);
function questOffer(q){card(q,`${q.text}<br><br><b>Reward:</b> ${rewStr(q.rew)}. <b>Deadline:</b> ${dateStr(reqDue(q))}.`,
 [['Accept',()=>{S.q[q.id]={st:'active',due:reqDue(q),base:q.goal.type==='build'?qcount(q.goal.k):0};GOALSIG=''}],['Decline (👑 −5)',()=>{S.q[q.id]={st:'declined'};S.prest=Math.max(0,S.prest-5);GOALSIG=''}],['Decide later',()=>{}]])}
/* the goals list at the left edge: the council's open requests first, then the small goals, soonest deadline first */
let GOALSIG='',GOALV=[];
const ucf=t=>t[0].toUpperCase()+t.slice(1),goalIcon=q=>q.i||q.who.split(' ')[0];
function dueStr(t){const mo=Math.floor(t/(YEAR/12));return mo%12?`by ${dateStr(t)}`:`before ${Y0+mo/12}`}
function goalAct(q){const g=q.goal;if(g.type==='build'||g.type==='finish'){const k=g.type==='finish'?g.k[0]:g.k==='house4'?'house':g.k;return k==='gaswerk'&&!RES().auer?'research':k}
 if(g.type==='grow'||g.type==='pop')return'house';if(g.type==='res')return'research';if(g.type==='hap')return'hall';return null}
function goalsOpen(){if(!S||!S.q)return[];const st=q=>S.q[q.id]&&S.q[q.id].st,dueOf=q=>S.q[q.id].due??(q.due?yT(...q.due):1e12);
 const all=QUESTS.filter(q=>st(q)==='active'||st(q)==='offered').sort((a,b)=>(!!a.quiet-!!b.quiet)||(dueOf(a)-dueOf(b)));
 /* three of the requests and small goals, and with them up to three landmarks still to build */
 return all.filter(q=>!q.lm).slice(0,3).concat(all.filter(q=>q.lm).slice(0,3))}
function goalsUI(){const el=$('#goals');if(!el)return;const act=L&&L.y1857?goalsOpen():[];let sig=S.gcol?'c':'o';for(const q of act){const n=questNums(q);sig+=`|${q.id}:${n?n[0]:questProgress(q)}`}
 if(sig===GOALSIG)return;GOALSIG=sig;GOALV=act;el.hidden=!act.length;if(!act.length)return;el.classList.toggle('col',!!S.gcol);
 el.innerHTML=`<button class="gh" aria-expanded="${!S.gcol}">🎯 Goals${S.gcol?` <b>${act.length}</b>`:''}<span>${S.gcol?'▸':'▾'}</span></button>`+(S.gcol?'':act.map((q,k)=>{const s_=S.q[q.id],n=questNums(q),r=q.rew,
  sub=s_.st==='offered'?`✉️ New request · ${dueStr(reqDue(q))}`:[n?`${fmtPop(n[0])} / ${fmtPop(n[1])}${q.goal.type==='build'&&!deOn()?' '+plN(B[q.goal.k==='house4'?'house':q.goal.k].n.toLowerCase(),n[1]):''}`:questProgress(q),s_.due!=null?dueStr(s_.due):q.lm?'not built yet':'',r.gold?`+${money(r.gold,1)}`:r.prest?`👑 ${r.prest}`:''].filter(Boolean).join(' · ');
  return`<button class="gl${q.quiet?'':' req'}" data-g="${k}"><span class="gi">${goalIcon(q)}</span><span class="gt"><b>${ucf(q.short)}</b><small>${sub}</small>${n?`<i style="width:${Math.min(100,Math.round(n[0]/n[1]*100))}%"></i>`:''}</span></button>`}).join(''))}
function goalCard(q){const s_=S.q[q.id];if(s_.st==='offered'){questOffer(q);return}const a=goalAct(q),site=a&&B[a]&&(B[a].lm||q.goal.type==='finish')&&S.list.find(o=>o.t===a&&o.bld&&!o.h);
 const go0=a==='research'?'🔬 Open research':a==='hall'?HALLB():site?'📍 Go there':a&&B[a]?`🔨 Build ${B[a].lm?'the '+B[a].n:anA(B[a].n.toLowerCase())}`:'';
 /* a prestige goal says where prestige comes from, and offers the next landmark the city has not built */
 const pr=q.goal.type==='prest',lq=pr&&goalsOpen().find(g=>g.lm&&g.id!==q.id),go=lq?`🔨 Build the ${B[lq.lm].n}`:go0;
 ov(`<h2>${goalIcon(q)} ${ucf(q.short)}</h2><p class="m">${q.who.slice(q.who.indexOf(' ')+1)}, ${q.role}</p><p>${q.text}</p>${pr?`<p class="m"><b>How to get prestige:</b><br>🏛️ Finish a landmark: 👑 +80 (before its real date: +120)<br>🔬 Finish a discovery: 👑 +10 or more<br>🎯 Do goals and requests with a 👑 reward<br>🕵️ Solve cases, help at fires and robberies</p>`:''}
  <table class="stat">${!site&&a&&B[a]&&B[a].cost?`<tr><td>Pay now</td><td>${costOf(B[a].cost)}</td></tr>${B[a].proj?`<tr><td>While it is built</td><td>${costOf(B[a].proj)}</td></tr>`:''}`:''}<tr><td>Progress</td><td>${questProgress(q)||'Not yet'}</td></tr>${s_.due!=null?`<tr><td>Deadline</td><td>${dateStr(s_.due)}</td></tr>`:''}${q.lm&&s_.due==null?'':`<tr><td>Reward</td><td>${rewStr(q.rew)||'👑 +40 prestige for beating history'}</td></tr>`}</table>
  <div class="btns">${go?`<button class="pri" id="gGo">${go}</button>`:''}<button id="ovOk"${go?'':' class="pri"'}>Close</button></div>`);
 $('#ovOk').onclick=closeOv;const b=$('#gGo');if(b)b.onclick=()=>{closeOv();if(site){centerOn(site.x+2,site.y+2);gGV=-1;openInfo(site);return}goalGo(lq||q)}}
/* a goal's build button: to the Ring section it names first, then the build tool with the footprint ready */
function goalGo(q){const a=goalAct(q),c=q.goal.near&&ringAt(q.goal.near);if(c&&B[a]&&!B[a].lm){setMode(a);findSpot({x:c[0],y:c[1]});return}const h=HINTA;HINTA=a;hintAct();HINTA=h}
$('#goals').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!S)return;if(b.classList.contains('gh')){S.gcol=!S.gcol;GOALSIG='';goalsUI();return}const q=GOALV[+b.dataset.g];if(q)goalCard(q)});
/* audiences at the Hofburg: petitioners, choices */
let AUD=NY_AUD;
/* the lie of Vienna's land for the 3D view, as [lat, lon, metres above the Danube plain, radius km, sharpness, and for a ridge or a
   valley its stretch along an axis and the axis's angle in the map's frame, and how much the flanks are scored into spurs and
   gullies; a stretch of -1 levels a summit within the radius for the buildings on it]. The Wienerwald in the north-west: Leopoldsberg (425 m) over the Danube's gap, Kahlenberg (484 m), Hermannskogel (542 m)
   and the ridge between them, Cobenzl and the Latisberg above Grinzing, the Nussberg and the Reisenberg spur falling to the
   vineyards, the Schreiberbach's valley down to Nussdorf and the Reisenbach's down to Grinzing; then Schafberg, Wilhelminenberg and
   Heuberg to the south-west. They stand nearer the city than they do and higher above the plain (the ridge from the Leopoldsberg over
   the Kahlenberg to the Hermannskogel some 1,300 m against the Ring), since the map is drawn some three and a half times smaller across than the people and
   houses on it: so they rise over Grinzing's streets as steep wooded mountains. The Türkenschanze, the Hohe Warte and the brick-clay hills of the Wienerberg and Laaer Berg in the south stay low */
LEVELS.wien1857.topo=[[48.2720,16.3509,600,.85,3,1.3,120,.1],[48.2689,16.3437,450,1.35,2.6,1.3,100,.09],[48.2667,16.3210,760,1,2,0,0,.09],[48.2680,16.3325,420,.55,2,2.4,126,.1],
 [48.2606,16.3368,320,.55,2.2,1.6,254,.12],[48.2615,16.3587,140,.4,2,1.8,171,.2],[48.2521,16.3447,150,.4,2,2.2,10,.2],[48.2459,16.3298,220,.6,2,1.4,200,.25],
 [48.2647,16.3582,-110,.22,2,3.2,-5],[48.2573,16.3481,-100,.22,2,3.2,15],[48.2689,16.3437,0,.18,0,-1],[48.2720,16.3509,0,.15,0,-1],
 [48.236,16.296,240,.95,2,0,0,.25],[48.219,16.283,260,1,2,0,0,.25],[48.2245,16.262,280,1.1,2,0,0,.25],[48.203,16.250,220,1.1,2,0,0,.25],
 [48.2485,16.3585,30,.55,2],[48.2355,16.3300,30,.8,2],[48.2150,16.3020,35,1,1.7],[48.1650,16.3550,32,.9,2],[48.1660,16.3920,26,.8,2]];
/* Vienna's own: the names and texts of the 2D game where New York changed them, its events, its requests from the mayors, architects
   and composers of the Ringstraße years, and the petitioners at the Hofburg */
const W_TXT={tower:['Cannon tower','Fires at pirate ships within 6 tiles.'],oper:['Court Opera',''],rad:['Riesenrad','The giant Ferris wheel of the Prater, built in 1897.'],schoen:['Schönbrunn','The imperial summer palace and its gardens.'],stephan:['Stephansdom','St. Stephen\'s Cathedral, the heart of Vienna since the Middle Ages.'],rathaus:['Rathaus','The new City Hall (1883). Goods can be delivered here.'],parlament:['Parliament','The Imperial Council building on the Ringstraße (1883).'],secession:['Secession','The exhibition hall of the Vienna Secession, crowned by its golden dome of leaves.'],palais:['Palais plot','Sell a plot facing the Ringstraße. A noble family pays you well and builds a grand palais, which needs bricks, stone and timber.'],sawmill:['Timber wharf','Timber rafts float down the Danube from the Alps. Build on a riverbank.'],stonewh:['Stone wharf','Barges bring stone from the Leitha quarries. Build on the Danube or the canal.'],brewery:['Brewery','Brews beer from barley. Craftsmen and Bürger want it.'],grainf:['Grain farm','Grows wheat and rye for the mills and barley for the breweries, which compete for it. Needs open land around it.'],bakery:['Bakery','Bakes rye loaves, Kaisersemmeln, Kipferl, Salzstangerl and pretzels from the mills\' flour. From the craftsmen up, Vienna wants its bread.'],stadtpark:['Stadtpark','Vienna\'s first public park on the old Glacis, opened in 1862.'],rotunde:['Rotunde','The giant domed hall of the 1873 World\'s Fair in the Prater.'],brunnen:['Hochstrahlbrunnen','The fountain for Vienna\'s new mountain-spring water main of 1873. Protects your city from cholera.'],vineyard:['Vineyard','Grows wine on the sunny slopes of Grinzing, Nussdorf and Sievering. Bürger and nobility want wine.'],kuenstler:['Künstlerhaus','The exhibition house of Vienna\'s artists\' society, by Karlsplatz.'],ephrussi:['Palais Ephrussi','Theophil Hansen\'s palace for the banker Ignaz von Ephrussi, by the Schottentor.'],autofabrik:['Car factory','Builds motor cars, like Lohner and Gräf & Stift in Vienna. Cars sell for a fortune and fill your streets.'],kaffeehaus:['Coffeehouse','Bürger and nobility want a coffeehouse near their homes.'],harbour:['Danube harbour','A DDSG steamer pier. Its steamer trades your goods along the Danube. Tap it to choose a route.'],quarry:['Quarry','Cuts sandstone in the hills of the Wienerwald. Build on rocky hillside.'],tramline:['Tram line','Lay tram tracks along your roads. Trams run once you have a tram depot: horse trams first, electric ones from 1897.'],eislauf:['Ice rink','The Vienna Skating Club opened its rink in 1867. Residents nearby are happier, especially in winter.'],reitschule:['Riding school','A riding hall for the elegant world. Grand Bürger and nobility nearby are happier.'],regulierung:['Danube regulation','A new straight bed for the Danube. Once finished, the river no longer floods the city.'],reichsbruecke:['Kronprinz-Rudolf-Brücke','An iron bridge across the new Danube, today\'s Reichsbrücke. Build it on the riverbank: when finished it spans the river.'],bridge:['Bridge','Tap a riverbank or the water: a stone bridge is built straight across to the other bank. Each span costs 60 fl., 3 stone and 2 timber.']};
Object.assign(LEVELS.wien1857,{
 setup(){for(const k in W_TXT)if(B[k]){B[k].n=W_TXT[k][0];if(W_TXT[k][1])B[k].d=W_TXT[k][1]}
  B.elight.d='Replace the gas lamps of a district with electric arc lamps. Tap a street: every street within six blocks of it is lit. Needs electric power.';
  /* the vineyards and the Heurigen among them stand on the vine slopes of the hills, Grinzing, Nussdorf and Sievering, never in the city
     (New York's wine merchant, whose key they share, stands on the waterfront) */
  bset(B.vineyard,{on:'vine'});bset(B.heuriger,{on:'vine'});
  /* the great churches and Ring buildings at their real heights need lots nearer their real size (the 3D models scale with them) */
  for(const[k,f]of[['stephan',9],['votiv',7],['rathaus',9],['karls',9],['parlament',10],['museen',12]])bset(B[k],{foot:f});
  bset(B.rathaus,{hist:0,cost:{gold:1500},proj:{bricks:400,stone:250,wood:60,iron:40},tour:40});bset(B.parlament,{hist:0,cost:{gold:1500},proj:{bricks:350,stone:300,wood:50,iron:40},tour:40,hub:0});
bset(B.rad,{hist:0,cost:{gold:2500},proj:{iron:150,wood:40,stone:20},tour:70});bset(B.secession,{cost:{gold:900},proj:{bricks:120,stone:40,iron:20},tour:40});bset(B.postspar,{cost:{gold:1800},proj:{bricks:300,stone:200,iron:60},tour:30,d:'Otto Wagner\'s Postal Savings Bank on the Georg-Coch-Platz, its marble plates held by aluminium bolts.'});bset(B.karls,{hist:0,cost:{gold:800},proj:{bricks:180,stone:120,wood:40},tour:30,d:'Fischer von Erlach\'s baroque church with its green dome and two great columns. Craftsmen nearby can become Bürger.'});
  bset(B.votiv,{hist:0,cost:{gold:600},proj:{bricks:200,stone:150,wood:40},tour:20,d:'Neo-gothic church for the Emperor\'s escape from an assassin in 1853. Craftsmen nearby can become Bürger.'});
  bset(B.oper,{cost:{gold:1000},proj:{bricks:300,stone:150,wood:60,iron:40},d:'The Court Opera, the first great building of the Ringstraße. Its visitors spend money in your city.'});
  bset(B.house,{cost:{}});bset(B.market,{cost:{gold:200,wood:6,bricks:4}});bset(B.chapel,{cost:{gold:300,bricks:10,stone:4}});
  bset(B.brick,{cost:{gold:150,wood:4},on:'clay',time:6});
  bset(B.woodcutter,{n:'Woodcutter',cost:{gold:100},up:.08,on:'land',d:'Fells trees in the Wienerwald and the Prater woods for timber. Needs forest around it. You can also clear trees yourself with 🧹 Demolish.'});
  bset(B.sheep,{cost:{gold:90},up:.08,d:'Raises sheep for wool, the raw material of the textile mills. Needs open pasture around it, out in the countryside.'});bset(B.weaver,{n:'Textile mill',cost:{gold:260,wood:6,bricks:8},up:.18,time:7,d:'Spins and weaves wool into cloth, like the mills of Schottenfeld and Gumpendorf. Craftsmen and above want clothing.'})},
 intro(){S.scratch?evOv('1 May 1865, Majesty','Today you open the Ringstraße. Only the Stephansdom and your Hofburg stand inside it. Count Crenneville will show you where to begin.',true):evChoice('1 May 1865, Majesty','Today the Ringstraße opens. Sell its plots, raise the Court Opera, and outshine Budapest by 1916.',[['🏠 Sell the first plots',()=>{HINTA='house';hintAct()}]])},
 events:[[yT(1866,7,.1),'koenig'],[yT(1867,1),'u_musik'],[yT(1867,6,.25),'ausgleich'],[yT(1869,5,.8),'operdate'],[yT(1870,6),'parade'],[yT(1871,1),'u_expo'],[yT(1873,5),'expo'],[yT(1873,5,.3),'crash'],[yT(1873,7),'cholera'],[yT(1873,10,.8),'water'],[yT(1874,1),'phase1'],[yT(1878,7,.9),'bosnia'],[yT(1881,12,.25),'ringfire'],[yT(1890,5),'mayday'],[yT(1892,1),'limit1'],[yT(1894,1),'gurtel'],[yT(1898,9,.33),'sisi'],[yT(1898,12),'jub50'],[yT(1904,1),'limit2'],[yT(1908,12),'jub60'],[yT(1910,1),'twomio'],[yT(1914,6,.9),'sarajevo'],[yT(1914,7,.9),'war'],[yT(1914,9),'refugees'],[yT(1915,4),'bread'],[yT(1916,11,.7),'end']],
 fire(k){const built=t=>S.list.some(o=>o.t===t&&!o.bld);switch(k){
 case'demol':toast('⛏️ March 1858: demolition of the bastions begins at the Rotenturmtor. Use 🧹 Demolish on the walls');break;
 case'solferino':S.stock.gold-=Math.min(Math.max(0,S.stock.gold),1000);evOv('Solferino, June 1859','Austria loses the Battle of Solferino in Italy, and with it Lombardy. The war costs your treasury 1,000 Gulden.');break;
 case'u_park':toast('🌳 The Stadtpark is unlocked: Vienna\'s first public park, on the old Glacis');break;
 case'u_oper':evOv('A new Court Opera','The architects Eduard van der Nüll and August Sicard von Sicardsburg are chosen to build a Court Opera on the Ringstraße. You can now start construction near its 📍.');break;
 case'ringdate':if(S.ringDone)toast('📅 1 May 1865: the real Ringstraße opens today. Yours was ready in time');else evOv('1 May 1865','On this day Franz Joseph opened the real Ringstraße with a grand procession. In your Vienna the Ring isn\'t finished yet: pick 🛤️ Road to see the rest of its route in gold.');break;
 case'koenig':S.slump=yT(1868,1);newContract({food:60,iron:20},2000,3,'The army needs supplies for the war with Prussia');S.ctr.war=1;evOv('Königgrätz, July 1866','Prussia defeats Austria at Königgrätz. Confidence collapses, and building plots sell for much less until 1868.');break;
 case'u_musik':toast('🎻 The Musikverein is unlocked: the Society of Friends of Music wants a concert hall');break;
 case'ausgleich':S.prest+=10;toast('👑 June 1867: Franz Joseph is crowned King of Hungary in Budapest. The empire becomes Austria-Hungary');break;
 case'operdate':toast(built('oper')?'🎭 25 May 1869: the real Court Opera opens with Don Giovanni. Yours is already playing!':'🎭 25 May 1869: the real Court Opera opens with Don Giovanni. Finish yours to catch up');break;
 case'parade':toast('🎖️ 1870: the army gives up its parade ground by the Hofburg. Soon the Rathaus and Parliament will rise here');break;
 case'u_expo':evOv('A World\'s Fair for Vienna','Vienna will host the World\'s Fair in the Prater in 1873. Build the Rotunde in time, and the Hochstrahlbrunnen for the new mountain-spring water main.');break;
 case'expo':if(S.scratch){if(!S.fair)freeFair();break}if(built('rotunde')){S.stock.gold+=4000;S.prest+=50;evOv('The World\'s Fair opens','On 1 May 1873 the Emperor opens the World\'s Fair in your Rotunde. Visitors pour in from around the world: +4,000 Gulden, 👑 +50 prestige.')}else evOv('The World\'s Fair opens','On 1 May 1873 the World\'s Fair opens in the Prater, but your Rotunde isn\'t ready. The visitors\' money goes elsewhere.');break;
 case'crash':S.stock.gold=Math.round(S.stock.gold*.8);evChoice('Black Friday, 9 May 1873','The Vienna stock exchange crashes, just days after the fair opens. Banks fail, building stalls, and you lose a fifth of your treasury. What will the city do?',[['Rescue the banks: −3,000 fl., plot prices recover by 1874',()=>{S.stock.gold-=3000;S.slump=yT(1874,1);S.prest+=10}],['Let them fail: plots stay cheap until 1876, and the Bürger are angry for a year',()=>{S.slump=yT(1876,1);S.bad=S.t+YEAR}]]);break;
 case'cholera':startEpidemic('Cholera',S.list.some(o=>o.t==='brunnen'&&!o.bld)?.03:.09);break;
 case'water':toast('💧 24 October 1873: the real First Mountain-Spring Water Main opens, bringing Alpine water to Vienna');break;
 case'phase1':showPhase1();break;
 case'bosnia':newContract({food:80,beer:30,iron:30},3500,4,'The army occupies Bosnia and needs supplies');S.ctr.war=1;break;
 /* a new game's Vienna has no Ringtheater unless it has built a stage of its own: then the fire is news from the real city */
 case'ringfire':if(S.scratch&&!built('oper')&&!built('burgtheater')){toast('🔥 8 December 1881: the real Ringtheater burns during a performance, and hundreds die');break}if(cnt('feuerwehr'))toast('🔥 8 December 1881: the Ringtheater burns. Your fire brigade saves many lives');else{S.prest=Math.max(0,S.prest-30);evOv('The Ringtheater fire','On 8 December 1881 the Ringtheater burns during a performance, and hundreds die. Without a fire brigade the city could do little. 👑 −30. Build fire stations.')}break;
 case'mayday':S.unrest=(S.unrest||0)+((S.hap??1)<.7?50:0);toast('✊ 1 May 1890: tens of thousands of workers march to the Prater for the first May Day. Keep them happy');break;
 case'refugees':if(S.peace)break;S.refG={n:S.list.filter(o=>o.t==='house'&&!o.h&&o.lvl<6).length+3,due:S.t+YEAR};evOv('Refugees from Galicia','Tens of thousands flee the fighting in Galicia and arrive in Vienna. Sell at least three new Zinshaus plots within a year to house them.');break;
 case'limit1':S.limit=1;recompute();evOv('Greater Vienna','On 1 January 1892 the suburbs beyond the Linienwall become Vienna\'s districts 11 to 19. You can now build outside the Gürtel.');break;
 case'gurtel':toast('🚧 The old Linienwall comes down. Work begins on the Gürtel and Otto Wagner\'s Stadtbahn');break;
 case'sisi':evOv('Mourning for the Empress','On 10 September 1898 Empress Sissi is assassinated in Geneva. Vienna mourns with its Emperor.');break;
 case'jub50':S.stock.gold+=3000;sfx('chime');toast(`🎉 December 1898: fifty years of Franz Joseph on the throne. The court gives the city ${money(3000,1)}`);break;
 case'limit2':S.limit=2;recompute();evOv('Floridsdorf joins Vienna','In 1904 Floridsdorf across the Danube becomes the 21st district. The Marchfeld farmland is now yours to develop. The flood plain along the river stays empty.');break;
 case'jub60':S.stock.gold+=6000;sfx('chime');toast(`🎉 Diamond jubilee: a great parade on the Ringstraße. +${money(6000,1)}`);break;
 case'twomio':{const p=dispPop();toast(p>=2e6?'🏙️ Vienna passes 2 million people, just like the real city in 1910!':`The real Vienna reached 2 million in 1910. Yours has ${fmtPop(p)}`);break}
 case'sarajevo':if((S.tension??25)<35&&!S.war){S.peace=1;S.prest+=150;evOv('Sarajevo, June 1914','Archduke Franz Ferdinand visits Sarajevo. Thanks to years of careful diplomacy, Europe is calm, the visit passes without shots, and the Great War never comes. 👑 +150');break}evOv('Sarajevo, 28 June 1914','Archduke Franz Ferdinand, heir to the throne, and his wife Sophie are assassinated in Sarajevo. Europe holds its breath.');break;
 case'war':if(S.peace||S.war)break;S.war=1;for(const o of S.list)if(o.t==='house'&&!o.h)o.pop=Math.max(1,Math.floor(o.pop*.8));S.ctrT=S.t;evOv('War','On 28 July 1914 Austria-Hungary declares war on Serbia, and within days Europe is at war. Workers are called up, factories slow down and food grows scarce. Your task now is to hold Vienna together.');break;
 case'bread':if(S.peace)break;S.war=2;evChoice('Bread rationing','Grain from Hungary barely arrives. How strictly should Vienna ration bread?',[['Strict rationing: food lasts, but people are unhappier',()=>{S.ration=1}],['Keep the markets open: everyone is fed for now, but food runs out fast',()=>{S.ration=0}]]);break;
 case'end':if(!S.won){S.won=true;S.endK=endKey();showEnd()}break}},
 aud:[
 ['🧱 A delegation of brickmakers','The Bohemian brickmakers of the Wienerberg ask for higher wages. They work 14 hours a day.',[['Grant it: −800 fl., the city is happier for a year',()=>{S.stock.gold-=800;S.good=S.t+YEAR}],['Refuse: the brickmakers grumble',()=>{S.unrest=(S.unrest||0)+40}]]],
 ['🎩 The bankers of the Ring','The bankers ask the city to back new building companies on the Ring.',[['Back them: plots sell 20% higher for two years, but a crash would hurt more',()=>{S.boom=S.t+YEAR*2}],['Stay cautious',()=>{}]]],
 ['⛪ The Archbishop','The Archbishop of Vienna asks for help with the new suburban parishes.',[['Donate 600 fl.: 👑 +10, churches are cheaper for a year',()=>{S.stock.gold-=600;S.prest+=10;S.churchSale=S.t+YEAR}],['Decline politely: 👑 −3',()=>{S.prest=Math.max(0,S.prest-3)}]]],
 ['🔧 Siegfried Marcus','An inventor in Mariahilf shows a carriage that moves without horses and asks for money.',[['Fund him: −1,000 fl., your next research is free',()=>{S.stock.gold-=1000;S.rfree=(S.rfree||0)+1}],['Send him away',()=>{}]]],
 ['🎨 The young artists','Painters want a public exhibition of modern art.',[['Fund it: −700 fl., 👑 +15',()=>{S.stock.gold-=700;S.prest+=15}],['Too modern for Vienna: 👑 −2',()=>{S.prest=Math.max(0,S.prest-2)}]]],
 ['⚖️ The market women of the Naschmarkt','They ask for lower market fees.',[['Lower the fees: city income −10% for a year, but goods sell 20% better',()=>{S.fees=S.t+YEAR}],['Keep the fees',()=>{S.unrest=(S.unrest||0)+15}]]],
 ['🎖️ The War Ministry','The army asks the city to house a garrison battalion.',[['Agree: +1,500 fl., the Bürger are unhappier for a year',()=>{S.stock.gold+=1500;S.bad=S.t+YEAR}],['Refuse: 👑 −5',()=>{S.prest=Math.max(0,S.prest-5)}]]],
 ['🩺 Doctors of the General Hospital','The doctors ask for money for a new clinic.',[['Grant 900 fl.: hospitals reach further for good',()=>{S.stock.gold-=900;RES().clinic=1}],['Not now',()=>{}]]]]});
/* Vienna's steady goals, on the same pace as New York's: the Ring palaces section by section, the city's trades and services, its census
   counts and the new districts of 1892 */
const W_RING=[['Schottenring',48.2158,16.3655],['Franzensring',48.2110,16.3596],['Burgring',48.2060,16.3612],['Opernring',48.2030,16.3665],['Kärntner Ring',48.2016,16.3718],['Kolowratring',48.2026,16.3768],['Parkring',48.2060,16.3802],['Stubenring',48.2100,16.3822],['Franz-Josefs-Kai',48.2140,16.3762]];
/* a place on the real Ring, moved out with the wider Ring (L.ringS), on the grid; ringAt is the Ring tile nearest a section */
function ringPt(la,lo){return ringE(...prj(L,la,lo))}
function ringE(E,S_){const c=L.ringC,k=L.ringS||1;return c?gt(c[0]+(E-c[0])*k,c[1]+(S_-c[1])*k):gt(E,S_)}
const ringAt=n=>{const r=W_RING.find(q=>q[0]===n);if(!r)return null;const g=ringPt(r[1],r[2]);if(!S||!S.ringT||!S.ringT.length)return g;let b=S.ringT[0],bd=1e9;for(const i of S.ringT){const d=(i%W-g[0])**2+((i/W|0)-g[1])**2;if(d<bd){bd=d;b=i}}return[b%W,b/W|0]};
const W_GOALS=[
 /* the first steps of the economy, each with why it matters: food, plots that pay taxes, timber, barley and beer so labourers become
    craftsmen, clothing for clerks, wine for the Bürger */
 {id:'w_food',quiet:1,i:'🥕',at:[1865,5],due:[1873,1],who:'🥕 The Naschmarkt',role:'where Vienna buys its food',short:'Build a farm or a vegetable garden',text:'Majesty, the people need food in stock or they leave the city. A farm or a vegetable garden on open land outside the walls feeds them.',goal:{type:'finish',k:['farm','garden']},rew:{gold:300}},
 {id:'w_plots',quiet:1,i:'🏠',at:[1865,5],due:[1873,1],who:'🏠 The Stadterweiterungsfonds',role:'sells the building plots',short:'Sell three Zinshaus plots',text:'Every plot you sell brings a builder, and then tenants who pay rent tax. More homes, more money for the Ring.',goal:{type:'build',k:'house4',n:3,more:1},rew:{gold:400}},
 {id:'w_wood',quiet:1,i:'🪵',at:[1865,6],due:[1873,1],who:'🪵 The master builders',role:'of the Ringstraße',short:'Open a timber wharf',text:'Every new house needs timber as well as bricks. Rafts float it down the Danube: build a timber wharf on the bank.',goal:{type:'build',k:'sawmill',n:1},rew:{gold:300}},
 {id:'w_grain',quiet:1,i:'🌾',at:[1865,8],due:[1873,1],who:'🌾 The brewers of Schwechat',role:'Anton Dreher\'s men',short:'Grow barley on a grain farm',text:'Craftsmen want their beer, and beer wants barley. Start with a grain farm on open land.',goal:{type:'build',k:'grainf',n:1},rew:{gold:300}},
 {id:'w_beer',quiet:1,i:'🍺',at:[1865,10],due:[1874,1],who:'🍺 The innkeepers',role:'of the Vorstädte',short:'Open a brewery',text:'With beer in stock, labourers in a full, happy home near a market can step up to craftsmen, who pay more.',goal:{type:'build',k:'brewery',n:1},rew:{gold:400,prest:5}},
 {id:'w_bread',quiet:1,i:'🥨',at:[1866,2],due:[1874,6],who:'🥨 The bakers\' guild',role:'of the Vorstädte',short:'Open a bakery',text:'Majesty, craftsmen want their bread and their Semmeln as well as their beer. A grain farm grows the wheat and rye, a mill grinds it into flour, and a bakery bakes it.',goal:{type:'build',k:'bakery',n:1},rew:{gold:400}},
 {id:'w_cloth',quiet:1,i:'🧵',at:[1866,6],due:[1875,1],who:'🧵 The tailors',role:'of the Mariahilfer Straße',short:'Open a textile mill',text:'Craftsmen want clothing and are unhappy without it. A textile mill makes it.',goal:{type:'build',k:'weaver',n:1},rew:{gold:400,prest:5}},
 {id:'w_wine',quiet:1,i:'🍷',at:[1867,6],due:[1876,1],who:'🍷 The wine growers',role:'of Grinzing and Nussdorf',short:'Plant a vineyard',text:'Clerks near a church become Bürger once there is wine in stock. Plant a vineyard on the sunny slopes of the Wienerwald.',goal:{type:'build',k:'vineyard',n:1},rew:{gold:500,prest:5}},
 {id:'w_ring1',quiet:1,i:'🏛️',at:[1865,5],due:[1868,1],who:'🏛️ The Stadterweiterungsfonds',role:'sells the Ring plots for the Emperor',short:'Two palaces on the Opernring',text:'Majesty, the fund sells the plots of the old Glacis. The Opernring by the new Court Opera should fill first.',goal:{type:'build',k:'palais',n:2,near:'Opernring'},rew:{gold:600,prest:10}},
 {id:'w_market',quiet:1,i:'⚖️',at:[1865,6],due:[1868,1],who:'⚖️ The Naschmarkt traders',role:'fruit and vegetables by the Wien river',short:'Open a market',text:'The market women by the Wien river want a proper market hall for the new districts.',goal:{type:'build',k:'market',n:1},rew:{gold:400}},
 {id:'w_brick',quiet:1,i:'🧱',at:[1865,8],due:[1867,6],who:'🧱 Heinrich Drasche',role:'owner of the Wienerberg brickworks',short:'Open a brickworks',text:'Majesty, your Ring eats bricks by the million. The clay of the Wienerberg is the best in the empire.',goal:{type:'build',k:'brick',n:1},rew:{gold:300}},
 {id:'w_fire',quiet:1,i:'🚒',at:[1866,1],due:[1870,1],who:'🚒 The fire brigade',role:'the city\'s firemen since 1686',short:'Build a fire station',text:'The new districts on the Glacis need a fire station of their own.',goal:{type:'build',k:'feuerwehr',n:1},rew:{gold:300,prest:5}},
 {id:'w_ring2',quiet:1,i:'🏛️',at:[1866,6],due:[1870,1],who:'🏛️ The Stadterweiterungsfonds',role:'sells the Ring plots for the Emperor',short:'Two palaces on the Kärntner Ring',text:'The bankers and industrialists want to live on the Kärntner Ring, between the Opera and the Stadtpark.',goal:{type:'build',k:'palais',n:2,near:'Kärntner Ring'},rew:{gold:800,prest:10}},
 {id:'w_sisi1',quiet:1,i:'🐎',at:[1866,9],due:[1870,1],who:'👑 Empress Sissi',role:'your wife, the finest horsewoman of the court',short:'Build a riding school',text:'Franz, I ride every morning, and the city has nowhere for it. A riding hall, please, for me and for Vienna.',goal:{type:'build',k:'reitschule',n:1},rew:{prest:15}},
 {id:'w_coffee',quiet:1,i:'☕',at:[1867,1],due:[1871,1],who:'☕ The coffee-house owners',role:'Vienna\'s second living rooms',short:'Open a coffeehouse',text:'Newspapers, billiards and a Melange: every new street wants its coffeehouse.',goal:{type:'build',k:'kaffeehaus',n:1},rew:{prest:10}},
 {id:'w_ring3',quiet:1,i:'🏛️',at:[1868,1],due:[1873,1],who:'🏛️ The Stadterweiterungsfonds',role:'sells the Ring plots for the Emperor',short:'Two palaces on the Schottenring',text:'By the Votivkirche the Schottenring waits for the stock exchange and the bankers\' palaces.',goal:{type:'build',k:'palais',n:2,near:'Schottenring'},rew:{gold:900,prest:10}},
 {id:'w_church',quiet:1,i:'⛪',at:[1868,6],due:[1872,1],who:'⛪ The Archdiocese',role:'new parishes for the suburbs',short:'Build a parish church',text:'Every new quarter wants its own parish church.',goal:{type:'build',k:'chapel',n:1},rew:{prest:10}},
 {id:'w_pop1',quiet:1,i:'👥',at:[1869,1],due:[1880,12],who:'👥 The census',role:'counted in 1869 and 1880',short:'Reach 700,000 people',text:'Majesty, the census of 1880 counted 726,000 Viennese in the old city and its suburbs.',goal:{type:'pop',n:700000},rew:{prest:30}},
 {id:'w_sisi2',quiet:1,i:'💍',at:[1877,4],due:[1879,4],who:'👑 Empress Sissi',role:'your wife',text:'For our silver wedding in April 1879 Makart plans a great procession on the Ring. Let the people be happy that day.',short:'70% happiness for the silver wedding',goal:{type:'hap',v:.7},rew:{prest:25,joy:1}},
 {id:'w_ring4',quiet:1,i:'🏛️',at:[1870,1],due:[1876,1],who:'🏛️ The Stadterweiterungsfonds',role:'sells the Ring plots for the Emperor',short:'Two palaces on the Parkring',text:'Along the Stadtpark the Parkring wants palaces with a view of the trees.',goal:{type:'build',k:'palais',n:2,near:'Parkring'},rew:{gold:900,prest:10}},
 {id:'w_tram',quiet:1,i:'🐎',at:[1868,6],due:[1874,1],who:'🐎 The Vienna Tramway Company',role:'horse trams since 1865',short:'Build a tram depot',text:'The first horse tram ran from the Schottentor to Hernals in 1865. Give the line a depot.',goal:{type:'build',k:'tram',n:1},rew:{gold:600}},
 {id:'w_hosp',quiet:1,i:'🏥',at:[1873,8],due:[1877,1],who:'🏥 The doctors of the General Hospital',role:'after the cholera of 1873',short:'Build a hospital',text:'Cholera came with the World\'s Fair. The suburbs need a hospital of their own.',goal:{type:'build',k:'spital',n:1},rew:{prest:10}},
 {id:'w_ring5',quiet:1,i:'🏛️',at:[1875,1],due:[1882,1],who:'🏛️ The Stadterweiterungsfonds',role:'sells the Ring plots for the Emperor',short:'Two palaces on the Stubenring',text:'The last stretch of the Ring, by the Donaukanal, is still empty.',goal:{type:'build',k:'palais',n:2,near:'Stubenring'},rew:{gold:1000,prest:15}},
 {id:'w_police',quiet:1,i:'👮',at:[1878,1],due:[1883,1],who:'👮 The police directorate',role:'k.k. Polizeidirektion Wien',short:'Build a police station',text:'The new districts grow faster than the police can follow.',goal:{type:'build',k:'polizei',n:1},rew:{prest:10}},
 {id:'w_greater',quiet:1,i:'🗺️',at:[1892,1],due:[1896,1],who:'🗺️ Greater Vienna',role:'the suburbs joined in 1892',short:'Sell 6 plots beyond the Gürtel',text:'Majesty, by your decree Ottakring, Hernals, Währing and the other suburbs are part of Vienna now: build them up.',goal:{type:'build',k:'house4',n:6,out:1,more:1},need:()=>S.limit>=1,rew:{gold:2000,prest:15}},
 {id:'w_pop2',quiet:1,i:'👥',at:[1890,1],due:[1900,12],who:'👥 The census',role:'counted in 1900',short:'Reach 1,500,000 people',text:'With the new districts, the census of 1900 counted 1,675,000 Viennese.',goal:{type:'pop',n:1500000},rew:{prest:40}},
 {id:'w_gas',quiet:1,i:'🔥',at:[1896,1],due:[1900,1],who:'🔥 The city gasworks',role:'municipal gas from 1899',short:'Build a gasworks',text:'The city buys out the English gas company: build a municipal gasworks in Simmering.',goal:{type:'finish',k:['gaswerk']},rew:{gold:1500}},
 {id:'w_power',quiet:1,i:'⚡',at:[1900,1],due:[1903,1],who:'⚡ The city electricity works',role:'municipal power from 1902',short:'Build a power station',text:'The city wants its own power for the electric trams.',goal:{type:'build',k:'kraftwerk',n:1},rew:{gold:2000}},
 {id:'w_pop3',quiet:1,i:'👥',at:[1902,1],due:[1910,12],who:'👥 The census',role:'counted in 1910',short:'Reach 2,000,000 people',text:'The census of 1910 counted 2,031,000 Viennese: the sixth-largest city in the world.',goal:{type:'pop',n:2000000},rew:{prest:50}},
 {id:'w_prest',quiet:1,i:'👑',at:[1908,1],due:[1914,1],who:'👑 The Kaiser\'s jubilee',role:'sixty years of Franz Joseph',short:'Reach 1,200 prestige',text:'Sixty years on the throne, Majesty: for your diamond jubilee Vienna should outshine Budapest in every way.',goal:{type:'prest',n:1200},rew:{gold:3000}}];
LEVELS.wien1857.landmarks.push({k:'rathaus',lat:48.2108,lon:16.3573,need:{year:1872,prest:250},due:[1883,9]},{k:'parlament',lat:48.2084,lon:16.3584,need:{year:1874,prest:250},due:[1883,12]},
 /* the twin museums on the Maria-Theresien-Platz (begun 1871, the Natural History opened 1889, the Art History 17 October 1891), Olbrich's Secession (1898), Wagner's Postsparkasse (1906) */
 {k:'museen',lat:48.2045,lon:16.3610,need:{year:1871,prest:300},due:[1891,10]},{k:'secession',lat:48.2003,lon:16.3657,need:{year:1897,prest:200},due:[1898,11]},
 /* the Café Sperl at the corner of the Gumpendorfer Straße and the Lehárgasse (1880): a landmark that also serves as a coffeehouse */
 {k:'sperl',lat:48.1998,lon:16.3612,need:{year:1880}},{k:'postspar',lat:48.2106,lon:16.3800,need:{year:1903,prest:300},due:[1906,12]});
const W_TECH=[['hygiene','Hospital hygiene','after Ignaz Semmelweis',1865,30,'Hospitals cover a larger area and protect your city from cholera.'],
 ['mendel','Laws of heredity','Gregor Mendel, Brünn',1866,40,'Farms, vegetable gardens and vineyards produce 25% more.'],
 ['boltzmann','Statistical physics','Ludwig Boltzmann, Vienna',1877,80,'Every workshop produces 10% more.'],
 ['auer','The gas mantle','Carl Auer von Welsbach',1885,90,'Unlocks the Gasworks. Gas light becomes a need of the nobility, and makes them happier.'],
 ['electric','Electric power','International Electrical Exhibition in the Rotunde, Vienna 1883',1883,120,'Unlocks the Power station and electric trams. From now on every neighbourhood expects electric light: unhappy until it gets it.'],
 ['freud','Psychoanalysis','Sigmund Freud, Berggasse 19',1899,100,'Coffeehouses reach further. 👑 +30.'],
 ['lohner','The motor car','the Lohner-Porsche electric car, Vienna 1900',1900,130,'Unlocks the Car factory. Cars start to appear on your streets.'],
 ['landsteiner','Blood groups','Karl Landsteiner, Vienna',1901,110,'Residents near a hospital are 10% happier.'],
 ['radium','Radium Institute','with uranium ore from Joachimsthal, the same source as Marie Curie\'s',1910,140,'👑 +60, and scientists come to visit.'],
 ['einstein','Relativity in Prague','Albert Einstein, professor in Prague 1911–12',1911,150,'Research runs 50% faster. 👑 +40.'],
 ['kaplan','The Kaplan turbine','Viktor Kaplan, Brünn',1912,160,'Every workshop produces another 15% more.']];
const lawFx=t=>t.replace(/\{(\d+)\}/g,(m,n)=>money(+n));
const W_LAWS=[
 ['bauordnung','Building code',1865,800,'😊 Residents’ happiness +8%','🏗️ Plots sell for 10% less'],
 ['schule','Compulsory schooling',1869,1500,'🔬 Research 30% faster · 😊 Happiness +4%','🪙 Costs {20} a minute'],
 ['kinder','Child labour ban',1885,600,'😊 Happiness +5% · 👑 +10','🏭 Workshops −5%'],
 ['sonntag','Sunday rest',1895,500,'😊 Happiness of labourers and craftsmen +10%','🏭 Workshops −8%'],
 ['kommunal','Municipal utilities',1897,3000,'🚋 Gas, power and trams: upkeep halved, +{40} a minute each','😊 Happiness of the Bürger −4%']];
const W_ROUTES={linz:{n:'Linz',sell:{wine:22,bricks:13},buy:{grain:6,wood:7}},pest:{n:'Budapest',sell:{beer:17,bricks:14},buy:{grain:5,food:6}},galati:{n:'Black Sea (Galați)',sell:{wine:28,beer:20},buy:{iron:18,stone:11}}};
const W_BPM=[[1867,6,10,'Budapest becomes the capital of the Kingdom of Hungary in the new Dual Monarchy'],[1873,11,40,'Buda, Pest and Óbuda unite to form Budapest'],[1876,4,25,'The Margaret Bridge opens across the Danube in Budapest'],
 [1884,9,40,'The Hungarian State Opera opens on Andrássy Avenue'],[1896,5,70,'Budapest celebrates the Millennium and opens the first underground railway on the Continent'],[1902,10,60,'The Hungarian Parliament is inaugurated on the Danube']];
const W_ENDS={tammany:['An empire of favours','Vienna grew, and so did the favours at court. The Ring plots went to friends of friends, and after the crash of 1873 the newspapers never stopped writing about it.'],
 golden:['A golden age','Vienna became the most brilliant city of the empire: the Ring, the music, the coffeehouses, the science. Your successor inherits a capital the world admires.'],
 peace:['Budapest shines brighter','You built well, but Budapest grew faster. The empire endures, its heart beating more and more in Hungary.'],
 revolution:['Revolution in Vienna','Hungry, ignored and angry, your people rise. Barricades go up on the Ring, the ministers flee, and your reign ends before its time.']};
const W_HOODS=[['wieden','Wieden',48.1960,16.3680,1857,[20000,40000],3,'A Biedermeier house with a courtyard garden in the Wieden'],
 ['josef','Josefstadt',48.2105,16.3500,1857,[24000,48000],3,'A town house among the lawyers and professors of the Josefstadt, a step from the University'],
 ['ring','Parkring',48.2050,16.3790,1865,[60000,140000],5,'A floor of a palace on the Parkring, with a view over the Stadtpark'],
 ['cottage','Cottage-Viertel',48.2290,16.3380,1873,[45000,90000],4,'An English-style villa in the new Cottage quarter of Währing, among professors and artists'],
 ['hietz','Hietzing',48.1870,16.3010,1885,[150000,320000],8,'A villa by the gardens of Schönbrunn, among the families of the court']];
/* Vienna's streets by the engine's road names, and the Ring by its sections, named for the nearest stretch */
Object.assign(LEVELS.wien1857,{streetNames:{mariahilf:'Mariahilfer Straße',schoenbr:'Schönbrunner Straße',wieden:'Wiedner Hauptstraße',favoriten:'Favoritenstraße',landstr:'Landstraßer Hauptstraße',simmering:'Simmeringer Hauptstraße',
 praterstr:'Praterstraße',allee:'the Prater Hauptallee',tabor:'Taborstraße',alser:'Alser Straße',waehring:'Währinger Straße',josefst:'Josefstädter Straße',thalia:'Thaliastraße',hernals:'Hernalser Hauptstraße',triest:'Triester Straße',
 kaertner:'Kärntner Straße',graben:'the Graben',rotenturm:'Rotenturmstraße',herren:'Herrengasse',wollzeile:'Wollzeile',doebling:'Döblinger Hauptstraße',heiligenst:'Heiligenstädter Straße',bruenner:'Brünner Straße',schwedenbr:'the Schwedenbrücke',donaustr:'Obere Donaustraße',
 ...Object.fromEntries(W_RING.map(r=>['r_'+r[0],r[0]]))},
 boroughs:{mariahilf:'Mariahilf',schoenbr:'Margareten',wieden:'Wieden',favoriten:'Favoriten',landstr:'Landstraße',simmering:'Simmering',praterstr:'Leopoldstadt',allee:'the Prater',tabor:'Leopoldstadt',alser:'Alsergrund',waehring:'Währing',
 josefst:'Josefstadt',thalia:'Ottakring',hernals:'Hernals',triest:'Favoriten',doebling:'Döbling',heiligenst:'Heiligenstadt',bruenner:'Floridsdorf',schwedenbr:'Leopoldstadt',donaustr:'Leopoldstadt'}});
function ringNames(){if(!S.ringT)return;const P=W_RING.map(r=>[r[0],...ringPt(r[1],r[2])]);for(const i of S.ringT){const o=S.b[i];if(!o||o.t!=='road')continue;const x=i%W,y=i/W|0;let b=null,bd=1e9;for(const q of P){const d=(q[1]-x)**2+(q[2]-y)**2;if(d<bd){bd=d;b=q[0]}}o.rn='r_'+b}}
const W_REAL={stephan:'Stephansdom has watched over Vienna since the Middle Ages.',votiv:'The real Votivkirche was consecrated in April 1879, for the Emperor\'s silver wedding.',oper:'The real Court Opera opened on 25 May 1869 with Don Giovanni.',
 stadtpark:'The real Stadtpark opened in August 1862, Vienna\'s first public park on the old Glacis.',kursalon:'The real Kursalon opened in 1867; Johann Strauss conducted there.',musikverein:'The real Musikverein opened in January 1870.',
 rathaus:'The real Rathaus by Friedrich von Schmidt was finished in September 1883.',museen:'The real Natural History Museum opened in August 1889, the Art History Museum on 17 October 1891.',secession:'The real Secession opened in November 1898 with the second exhibition of the Secessionists.',postspar:'The real Postsparkasse opened in December 1906.',parlament:'The real Parliament by Theophil Hansen opened in December 1883.',universitaet:'The real University on the Ring opened in October 1884.',
 burgtheater:'The real Burgtheater by Semper and Hasenauer opened in October 1888.',regulierung:'The real Danube regulation was finished in 1875: a straight new bed, and no more floods.',reichsbruecke:'The real Kronprinz-Rudolf-Brücke, later the Reichsbrücke, opened in August 1876.',
 rotunde:'The real Rotunde was the heart of the World\'s Fair of 1873.',brunnen:'The real Hochstrahlbrunnen celebrated the mountain-spring water main in October 1873.',rad:'The real Riesenrad turned for the first time in June 1897.',
 imperial:'The real Hotel Imperial, once the Palais Württemberg, opened for the World\'s Fair of 1873.',epstein:'The real Palais Epstein by Theophil Hansen was finished in 1871.',ephrussi:'The real Palais Ephrussi was finished in 1873.',
 kuenstler:'The real Künstlerhaus opened in 1868.',rossauer:'The real Rossauer Kaserne was finished in 1869.',tiergarten:'The Schönbrunn menagerie, the oldest zoo in the world, opened in 1752.',karls:'Fischer von Erlach\'s Karlskirche was finished in 1737.',
 sperl:'The real Café Sperl opened in 1880 and is still open today. From 1895 young artists met here. In 1897 they helped to found the Secession.'};
/* the DDSG's local steamers on the Danube, in the form of New York's ferry lines (name, years, one landing, its name, the other, its name)
   and the kind of boat: Nussdorf to the stage by the Reichsbrücke (the Praterkai before the bridge of 1876), and on down the Prater to
   Freudenau (the Praterspitz lies beyond the map) */
LEVELS.wien1857.ferries=[['DDSG steamer',1837,1875,48.2600,16.3700,'Nussdorf',48.2302,16.4083,'the Praterkai','ddsg'],['DDSG steamer',1876,1916,48.2600,16.3700,'Nussdorf',48.2302,16.4083,'the Reichsbrücke','ddsg'],
 ['DDSG steamer',1837,1875,48.2278,16.4127,'the Praterkai',48.2045,16.4410,'Freudenau','ddsg'],['DDSG steamer',1876,1916,48.2278,16.4127,'the Reichsbrücke',48.2045,16.4410,'Freudenau','ddsg']];
LEVELS.wien1857.cityData={TECH:W_TECH,LAWS:W_LAWS,ROUTES:W_ROUTES,BPM:W_BPM,ENDS:W_ENDS,HOODS:W_HOODS,homeit:{'parlour.piano':'A Bösendorfer piano'}};
/* Vienna's main stations of 1865 with their lines: the Westbahnhof (1858), the Südbahnhof and the Staatsbahnhof of the line to
   Hungary side by side, the Nordbahnhof at the Praterstern; and the three Stadtbahn lines, from the Gürtel and the rivers of the map */
Object.assign(LEVELS.wien1857,{
 mainRail:[[1858,48.1966,16.3376,[-.001,-.008]],[1841,48.1860,16.3780,[-.008,.0037]],[1846,48.1850,16.3825,[-.002,.008]],[1838,48.2225,16.3920,[.008,.0028]]],
 rails0(){sbLines();UNLOCKALL=true;try{for(const[y0,la,lo,dir]of L.mainRail)if(Y0+S.t/YEAR>=y0)railTo(la,lo,dir)}finally{UNLOCKALL=false}railIndex()},
 sb(){const D=L,P=(la,lo)=>prj(D,la,lo),TU2=2.2*TU,
  off=(pts,d)=>pts.map((q,k)=>{const a=pts[Math.max(0,k-1)],b=pts[Math.min(pts.length-1,k+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[q[0]-dy/l*d,q[1]+dx/l*d]}),
  near=(pts,q)=>pts.reduce((b,x,k)=>Math.hypot(x[0]-q[0],x[1]-q[1])<Math.hypot(pts[b][0]-q[0],pts[b][1]-q[1])?k:b,0);
  const wl=off(D.R.wien.slice(0,-1),TU2),m=near(wl,P(48.1912,16.3335)),hl=P(48.2470,16.3645),dl=off(D.R.canal.slice(2,9).reverse(),-TU2);
  return[{k:'g',n:'on the Gürtel',at:[1898,6],pts:[hl,P(48.2400,16.3625)].concat(D.gurtel.slice(0,7),[wl[m]]),hi:['Nußdorfer Straße','Gumpendorfer Straße'],
    st:[['Heiligenstadt',48.2470,16.3645],['Nußdorfer Straße',48.2312,16.3567],['Währinger Straße',48.2262,16.3497],['Michelbeuern',48.2212,16.3455],['Alser Straße',48.2165,16.3412],['Josefstädter Straße',48.2112,16.3390],
     ['Burggasse',48.2050,16.3380],['Westbahnhof',48.1985,16.3380],['Gumpendorfer Straße',48.1948,16.3388],['Meidling-Hauptstraße',48.1912,16.3335]]},
   {k:'w',n:'in the Wiental',at:[1898,6],pts:wl.slice(0,m+1),st:[['Hütteldorf',48.1885,16.2960],['Hietzing',48.1878,16.3040],['Schönbrunn',48.1880,16.3185],['Meidling-Hauptstraße',48.1912,16.3335]]},
   {k:'v',n:'down the Wien to the Hauptzollamt',at:[1899,6],pts:wl.slice(m),st:[['Meidling-Hauptstraße',48.1912,16.3335],['Margaretengürtel',48.1935,16.3430],['Pilgramgasse',48.1965,16.3540],['Kettenbrückengasse',48.1985,16.3605],
     ['Karlsplatz',48.2010,16.3690,'karls'],['Stadtpark',48.2042,16.3770],['Hauptzollamt',48.2068,16.3812]]},
   {k:'d',n:'along the Donaukanal',at:[1901,8],pts:[wl[wl.length-1]].concat(dl,[hl]),st:[['Hauptzollamt',48.2068,16.3812],['Schwedenplatz',48.2125,16.3770],['Salztorbrücke',48.2155,16.3730],['Roßauer Lände',48.2225,16.3672],
     ['Friedensbrücke',48.2275,16.3655],['Spittelau',48.2355,16.3655],['Heiligenstadt',48.2470,16.3645]]}]}});
LEVELS.wien1857.quests=[
 {id:'zelinka',at:[1866,3],who:'🎩 Andreas Zelinka',role:'Mayor of Vienna',text:'Majesty, the workers who build your Ringstraße sleep in sheds by the Wienerberg. Give them homes: sell four new Zinshaus plots.',short:'sell four Zinshaus plots',goal:{type:'build',k:'house4',n:4},due:[1866,12],rew:{gold:1000,prest:10}},
 {id:'ferstel',at:[1866,2],who:'📐 Heinrich von Ferstel',role:'Architect of the Votivkirche',text:'My Votivkirche needs Leitha stone for its towers. Can you deliver 60 stone?',short:'deliver 60 stone',goal:{type:'deliver',g:{stone:60}},due:[1867,6],rew:{prest:20,site:'votiv'}},
 {id:'strauss',at:[1867,2],who:'🎻 Johann Strauss',role:'Composer',text:'This month my Blue Danube waltz has its premiere. But Vienna has no proper concert hall! Finish the Musikverein or the Kursalon.',short:'finish the Musikverein or the Kursalon',goal:{type:'finish',k:['musikverein','kursalon']},due:[1870,6],rew:{prest:30,joy:1}},
 {id:'felder',at:[1868,12],who:'🎩 Cajetan Felder',role:'Mayor of Vienna',text:'Cholera returns every few summers. Build a hospital before it strikes again.',short:'build a hospital',goal:{type:'build',k:'spital',n:1},due:[1871,6],rew:{gold:1500,prest:10}},
 {id:'hansen',at:[1870,3],who:'📐 Theophil Hansen',role:'Architect',text:'My palaces on the Ring devour bricks. Deliver 100 bricks and I\'ll mention your name to the Emperor.',short:'deliver 100 bricks',goal:{type:'deliver',g:{bricks:100}},due:[1871,9],rew:{gold:1200,prest:15}},
 {id:'expo',at:[1872,1],who:'🎩 Cajetan Felder',role:'Mayor of Vienna',text:'The whole world comes to Vienna next year. Make sure the city is a happy one: at least 70% happiness by the opening of the World\'s Fair.',short:'reach 70% happiness',goal:{type:'hap',v:.7},due:[1873,5],rew:{prest:25,gold:1000}},
 {id:'uni',at:[1877,1],who:'📐 Heinrich von Ferstel',role:'Architect of the University',text:'The University needs its new home on the Ring. Start its construction.',short:'start building the University',goal:{type:'site',k:'universitaet'},due:[1878,12],rew:{prest:15,rfree:1}},
 {id:'fire',at:[1882,1],who:'🎩 Eduard Uhl',role:'Mayor of Vienna',text:'Majesty, after the Ringtheater fire, never again. Every district needs a fire brigade: please build two fire stations.',short:'build two fire stations',goal:{type:'build',k:'feuerwehr',n:2},due:[1883,12],rew:{prest:25}},
 {id:'adler',at:[1889,1],who:'✊ Victor Adler',role:'Leader of the workers\' party',text:'Your workers live in damp, crowded rooms. Make them happier: at least 70% happiness by 1891, or we march.',short:'reach 70% happiness',goal:{type:'hap',v:.7},due:[1891,1],rew:{prest:20},fail:{unrest:80}},
 {id:'wagner',at:[1894,3],who:'📐 Otto Wagner',role:'Architect of the Stadtbahn',text:'My Stadtbahn needs iron for its bridges and stations. Deliver 80 iron.',short:'deliver 80 iron',goal:{type:'deliver',g:{iron:80}},due:[1897,6],rew:{prest:25,gold:1500}},
 {id:'lueger',who:'lueger',at:[1897,5],who:'🎩 Karl Lueger',role:'Mayor of Vienna',text:'The city should make its own light. Build a gasworks or a power station.',short:'build a gasworks or power station',goal:{type:'finish',k:['gaswerk','kraftwerk']},due:[1903,1],rew:{gold:3000,prest:15}},
 {id:'fonds',at:[1866,9],who:'📜 The Stadterweiterungsfonds',role:'Fund for the city expansion',text:'The Fund pays for the Ring\'s monuments from the plots it sells along it. Sell two palais plots on the Ring this year, and the Court Opera\'s next bills are paid.',short:'sell two palais plots',goal:{type:'build',k:'palais',n:2,more:1},due:[1867,9],rew:{gold:1500,prest:5}},
 {id:'oberst',at:[1868,3],who:'👑 The Obersthofmeisteramt',role:'The Emperor\'s household',text:'His Majesty wishes his Court Opera to open next spring, as promised. The stonemasons are short: deliver 60 stone to the Ring before the year is out.',short:'deliver 60 stone',goal:{type:'deliver',g:{stone:60}},due:[1868,12],rew:{prest:20}},
 {id:'felder2',at:[1869,6],who:'🎩 Cajetan Felder',role:'Mayor of Vienna',text:'Every spring the Danube floods the Leopoldstadt. The state, the province and the city will share the cost of a new, straight bed: start the Danube regulation.',short:'start the Danube regulation',goal:{type:'site',k:'regulierung'},due:[1871,6],rew:{gold:1000,prest:15}},
 {id:'fonds2',at:[1872,4],who:'📜 The Stadterweiterungsfonds',role:'Fund for the city expansion',text:'The parade ground by the Hofburg is the city\'s now. The Fund asks for homes round the new Rathaus quarter: sell four more Zinshaus plots.',short:'sell four Zinshaus plots',goal:{type:'build',k:'house4',n:4},due:[1873,4],rew:{gold:1200,prest:5}},
 {id:'lueger2',at:[1902,3],who:'🎩 Karl Lueger',role:'Mayor of Vienna',text:'The trams are the city\'s own now, and they shall run on electricity from our own works to every district. Build two more tram depots.',short:'build two tram depots',goal:{type:'build',k:'tram',n:2,more:1},due:[1905,1],rew:{gold:2000,prest:15}},
 {id:'sisi66',at:[1866,7,.5],who:'👑 Empress Sissi',role:'Empress of Austria',text:'Franz, the wounded from Königgrätz lie on straw in the corridors, and I go to them every day. Build a hospital for them.',short:'build a hospital',goal:{type:'build',k:'spital',n:1,more:1},due:[1867,6],rew:{prest:15}},
 {id:'semper',at:[1871,9],who:'📐 Gottfried Semper',role:'Architect of the Kaiserforum',text:'Majesty, with Hasenauer I will build you two museums facing each other across the Ring, and a forum joining them to the Hofburg. For a start, deliver 120 bricks and 40 iron.',short:'deliver 120 bricks and 40 iron',goal:{type:'deliver',g:{bricks:120,iron:40}},due:[1873,9],rew:{prest:20}},
 {id:'schmidt',at:[1872,6],who:'📐 Friedrich von Schmidt',role:'Architect of the Rathaus',text:'Majesty, my Rathaus is rising on the old parade ground, a Gothic town hall for a city of Bürger. Its tower needs stone: deliver 100 stone.',short:'deliver 100 stone',goal:{type:'deliver',g:{stone:100}},due:[1874,6],rew:{prest:15,gold:800}},
 {id:'hasenauer',at:[1875,3],who:'📐 Carl von Hasenauer',role:'Architect of the Burgtheater',text:'Majesty, the court theatre is to move from the Michaelerplatz to the Ring, facing the Rathaus. Start the new Burgtheater.',short:'start the Burgtheater',goal:{type:'site',k:'burgtheater'},due:[1877,12],rew:{prest:15}},
 {id:'taaffe',at:[1880,3],who:'🎖️ Count Eduard Taaffe',role:'Minister-President',text:'Majesty, the nations quarrel in the Reichsrat, and a contented capital keeps them quiet. Keep Vienna at 70% happiness through next year.',short:'reach 70% happiness',goal:{type:'hap',v:.7},due:[1881,12],rew:{prest:20}},
 {id:'suttner',at:[1905,12],who:'🕊️ Bertha von Suttner',role:'Nobel Peace Prize 1905',text:'Congratulate me with deeds, not words: put the city\'s money into medicine instead of cannons. Research Karl Landsteiner\'s blood groups.',short:'research blood groups',goal:{type:'res',k:'landsteiner'},due:[1909,1],rew:{prest:30}},
 {id:'possanner2',at:[1897,6],who:'🩺 Dr. Gabriele Possanner',role:'the first woman doctor of the University of Vienna',text:'Majesty, I may practise now, but the hospitals hardly let a woman on their wards. Build a new hospital, and let its doors be open to women physicians.',short:'build a hospital',goal:{type:'build',k:'spital',n:1,more:1},due:[1900,6],rew:{prest:15}},
 /* the First Mountain Spring Pipeline: Eduard Suess's water commission (1864) chose the springs at Kaiserbrunn under the Rax and the Schneeberg,
    built 1870-73; the Emperor opened it at the Hochstrahlbrunnen on 24 October 1873 */
 {id:'suess',at:[1870,1],who:'🪨 Eduard Suess',role:'Geologist, of the city\'s water commission',text:'Majesty, Vienna drinks from wells beside its cesspits and from filtered Danube water, and the cholera comes back every few summers. Your Majesty\'s own spring at Kaiserbrunn, under the Rax and the Schneeberg, can run down to the city by gravity alone, some 95 kilometres. Deliver 120 stone and 40 iron for the aqueduct.',short:'deliver stone and iron for the mountain water',goal:{type:'deliver',g:{stone:120,iron:40}},due:[1873,10],rew:{prest:25,gold:1500}}].concat(W_GOALS,lmGoals(LEVELS.wien1857));
function audienceTick(){if(!S.audT)S.audT=S.t+YEAR*.8;if(S.t<S.audT||!$('#ov').hidden||!letGo(false))return;S.audT=S.t+YEAR*(1.2+Math.random()*.6);S.aud=S.aud||[];
 const pool=AUD.map((a,i)=>i).filter(i=>!S.aud.includes(i));if(!pool.length)S.aud=[];const i=(pool.length?pool:AUD.map((a,i)=>i))[Math.random()*(pool.length||AUD.length)|0];S.aud.push(i);
 const[w,t,opts]=AUD[i];if(NYC())evChoice('🏛️ Office hours at City Hall',`<b>${w}</b>: ${t}`,opts);
 /* twice a week Franz Joseph received anyone who asked, from archdukes to peasants, standing at his desk in the Hofburg */
 else evChoice('🏰 Audience at the Hofburg',`<b>${w}</b>: ${t}`,opts)}

/* ---------- undo ---------- */
const UNDO=[];
/* what was built can be taken back step by step from the pill at the right above the bar: it stays for two minutes after
   the last step and counts the steps left; later from More */
let undoT=0;function undoShow(){const n=UNDO.length,b=$('#undoBtn');if(b)b.disabled=!n;const p=$('#undoPill');if(!p)return;clearTimeout(undoT);p.hidden=!n;
 const t=n>1?`↶ Undo (${n})`:'↶ Undo';p.textContent=t;const m=$('#modeUndo');if(m)m.textContent=t;if(n)undoT=setTimeout(()=>p.hidden=true,120000)}
function pushUndo(e){UNDO.push(e);if(UNDO.length>25)UNDO.shift();undoShow()}
function removeObj(o){for(const[fx,fy]of footTiles(o.t,o.x,o.y)){const j=fy*W+fx;if(S.b[j]===o)S.b[j]=null}const k=S.list.indexOf(o);if(k>=0)S.list.splice(k,1)}
/* a step in the player's words, for the card that asks before anything is taken back */
function undoName(e){return e.k==='obj'?`${B[e.o.t].i} ${B[e.o.t].n}`:e.k==='roads'?`${B.road.i} ${e.objs.length>1?`${e.objs.length} tiles of road`:'1 tile of road'}`:e.k==='bridge'?'🌉 Bridge':`🌲 ${e.tiles.length>1?`${e.tiles.length} tiles of trees cut`:'1 tile of trees cut'}`}
/* Undo asks first: its card lists the last steps, the newest on top. A tap on a step marks all down to it, and only the button takes them back */
function undoAsk(){if(!S)return;if(!UNDO.length){toast('Nothing to undo');return}const l=UNDO.slice().reverse().slice(0,10);let n=1;
 const draw=()=>{ov(`<h2>↶ Undo</h2><p>Remove what you just built? You get the cost back.</p>${l.length>1?'<p class="m">Tap a step to remove everything down to it.</p>':''}
 <div class="stepL">${l.map((e,i)=>`<button data-u="${i}" class="${i<n?'on':''}"><i>${i+1}</i><span>${undoName(e)}</span><em>${i<n?'✕':''}</em></button>`).join('')}</div>
 <div class="btns"><button class="pri" id="undoYes">${n>1?`Remove ${n} steps`:'Remove the last step'}</button><button id="ovOk">Keep everything</button></div>`);
  document.querySelectorAll('#ovCard [data-u]').forEach(b=>b.onclick=()=>{n=+b.dataset.u+1;draw()});
  $('#undoYes').onclick=()=>{closeOv();for(let i=0;i<n;i++)undo(n>1);if(n>1)toast(`↶ ${n} steps removed`)}};draw()}
function undo(quiet){const e=UNDO.pop(),toast=quiet?()=>{}:window.toast;undoShow();if(!e){toast('Nothing to undo');return}const st=S.stock;
 if(e.k==='obj'){if(!S.list.includes(e.o)){toast('That was already removed');return}removeObj(e.o);for(const g in e.cost)st[g]+=e.cost[g];if(e.plot)st.gold-=e.plot;toast(`↶ Undone: ${B[e.o.t].n}`)}
 else if(e.k==='roads'){for(const o of e.objs)if(S.list.includes(o))removeObj(o);st.gold+=e.gold;toast('↶ Road removed')}
 else if(e.k==='bridge'){for(const i of e.tiles){S.tiles[i]=WATER;tcolSet(i)}for(const o of e.ends)if(S.list.includes(o))removeObj(o);for(const g in e.cost)st[g]+=e.cost[g];toast('↶ Bridge removed')}
 else if(e.k==='forest'){st.gold+=e.gold;st.wood=Math.max(0,st.wood-e.wood);for(const i of e.tiles){S.tiles[i]=FOREST;tcolSet(i)}toast('↶ Trees replanted')}
 GV++;recompute()}
/* ---------- clearing woods ---------- */
function clearForest(t){const tiles=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=t.x+dx,y=t.y+dy;if(!inb(x,y))continue;const i=y*W+x;if(S.tiles[i]===FOREST&&!S.b[i])tiles.push(i)}
 if(!tiles.length)return false;const g=tiles.length*3;if(S.stock.gold<g){toast(`Clearing costs ${money(g)}`);return true}S.stock.gold-=g;S.stock.wood=Math.min(cap(),S.stock.wood+tiles.length);
 for(const i of tiles){S.tiles[i]=GRASS;tcolSet(i)}GV++;recompute();float(t.x,t.y,`🪓 +${tiles.length} 🪵`);sfx('build');pushUndo({k:'forest',tiles,gold:g,wood:tiles.length});return true}
/* ---------- services age, can be renovated and upgraded ---------- */
const UPG={market:['Market hall',{gold:800,bricks:30,stone:15,iron:8}],chapel:['Parish church with tower',{gold:700,bricks:30,stone:20}],kaffeehaus:['Grand café',{gold:600,bricks:15,stone:8}],
 feuerwehr:['Main fire station',{gold:700,bricks:25,iron:6}],spital:['General hospital wing',{gold:1200,bricks:40,stone:20}],polizei:['Detective bureau',{gold:900,bricks:20,stone:10}]};
const radMul=o=>(o.up2?1.4:1)*((o.cond??1)<.4?.6:1);
function ageTick(dt){for(const o of S.list){if(!UPG[o.t]||o.h||o.bld)continue;const was=(o.cond??1)<.4;o.cond=Math.max(0,(o.cond??1)-dt/(YEAR*12));if(!was&&o.cond<.4){recompute();toast(`🏚️ Your ${(o.up2?UPG[o.t][0]:B[o.t].n).toLowerCase()} is run down: tap it to renovate`)}}}
function serviceButtons(o,el){if(!UPG[o.t]||o.h||o.bld)return;const c=Math.round((o.cond??1)*100),rc={gold:150,bricks:10,stone:6};
 el.insertAdjacentHTML('beforeend',`<p class="m">Condition: <b>${c}%</b>${c<40?' · run down, it reaches fewer homes':''}${o.up2?` · upgraded to ${UPG[o.t][0]}`:''}</p><p>${c<85?`<button id="renoBtn">🔧 Renovate (${costStr(rc)})</button> `:''}${o.up2?'':`<button id="upgBtn">⬆ ${UPG[o.t][0]} (${costStr(UPG[o.t][1])})</button>`}</p>`);
 const pay=c_=>{for(const g in c_)if(S.stock[g]<c_[g]){toast(shortBy(g,c_[g]));return false}for(const g in c_)S.stock[g]-=c_[g];return true};
 const r=el.querySelector('#renoBtn');if(r)r.onclick=()=>{if(!pay(rc))return;o.cond=1;recompute();sfx('build');toast('🔧 Renovated');renderInfo()};
 const u=el.querySelector('#upgBtn');if(u)u.onclick=()=>{if(!pay(UPG[o.t][1]))return;o.up2=1;o.cond=1;GV++;recompute();sfx('chime');deed(o);toast(`⬆ Now a ${UPG[o.t][0]}`);renderInfo()}}

/* ===================== crime, crises, diplomacy and war ===================== */
function nearWater(o,r){for(let dy=-r;dy<=r+3;dy++)for(let dx=-r;dx<=r+3;dx++){const x=o.x+dx,y=o.y+dy;if(inb(x,y)&&S.tiles[y*W+x]===WATER)return true}return false}
/* a wrecked building (o.wr: 1 the flood, 2 the fire) stands as a ruin and does nothing until the player pays to rebuild it; then it is
   a building site that needs bricks and timber like any other */
function ruin(o,why){o.bld={bricks:5,wood:3};o.bld0=8;o.wr=why||1;o.st='Wrecked';if(o.t==='house')o.pop=0}
const rebuildCost=o=>Math.max(20,Math.round((o.t==='house'?30+20*(o.lvl||1):(B[o.t].cost.gold||0)*.3)/10)*10);
function rebuild(o){const c=rebuildCost(o),st=S.stock;if(!o.wr)return;if(st.gold<c){toast(`Not enough money: rebuilding costs ${money(c,1)}`);return}st.gold-=c;S.spB=(S.spB||0)+c;CU().b+=c;o.wr=0;o.st='Under construction';sfx('build');GV++;recompute();updateUI();
 const n=S.list.filter(q=>q.wr&&!q.h&&!q.r).length;toast(n?`🔨 The builders start. ${n} more ${n>1?'ruins wait':'ruin waits'}`:'🔨 The builders start. No ruins are left');closeInfo()}
const CRISES=[
 ['bigfire',()=>{const own=S.list.filter(o=>!o.h&&!o.bld&&(o.t==='house'||B[o.t].out));if(own.length<6)return false;const c=own[Math.random()*own.length|0];let lost=0,saved=0;
  for(const o of own){if(Math.hypot(o.x-c.x,o.y-c.y)>8)continue;if(COV.fire&&COV.fire[o.y*W+o.x]){saved++;continue}ruin(o,2);lost++}GV++;recompute();
  evOv('🔥 The great fire',`Fire races through the streets around ${dateStr(S.t)}. ${lost} of your buildings burn down. Tap each ruin to rebuild it.${saved?` Your fire brigades save ${saved}.`:' Not one fire station was close enough.'}`,0,S.list.find(o=>o.wr===2&&Math.hypot(o.x-c.x,o.y-c.y)<=8)||c);return true}],
 ['flood',()=>{if(cnt('regulierung')&&!S.list.some(o=>o.t==='regulierung'&&o.bld))return false;const hit=S.list.filter(o=>!o.h&&!o.bld&&(o.t==='house'||B[o.t].out)&&nearWater(o,2));if(hit.length<2)return false;
  for(const o of hit)ruin(o);GV++;recompute();evOv(NYC()?'🌊 The harbour floods':'🌊 The Danube floods',`Spring ice dams the rivers and the water floods the low districts. ${hit.length} buildings by the water are wrecked. Tap each ruin to rebuild it.`,0,hit[0]);return true}],
 ['epidemic',()=>{if(!S.epi){startEpidemic('Typhus',.07);return true}return false},'epidemic_v',()=>{const hs_=S.list.filter(o=>o.t==='house'&&!o.h&&!o.bld);if(hs_.length<5)return false;const water=S.list.some(o=>o.t==='brunnen'&&!o.bld);let dead=0;
  for(const o of hs_){const cov=COV.hosp&&COV.hosp[o.y*W+o.x],f=cov?.9:water?.7:.5,n=Math.floor(o.pop*f);dead+=o.pop-n;o.pop=Math.max(0,n)}S.prest=Math.max(0,S.prest-10);
  evOv('🦠 Epidemic',`Typhus spreads through the crowded districts. Your city loses about ${fmtPop(dead*S.mult)} people. Homes near a hospital lose far fewer${water?', and the clean water helps':''}. 👑 −10`);return true}],
 ['depression',()=>{S.depr=S.t+YEAR*2;S.slump=Math.max(S.slump||0,S.t+YEAR*2);evOv('📉 The economy stalls','Orders dry up, banks stop lending and factories lay off workers. For two years taxes bring in less, plots sell cheaply and the city buys your goods for less.');return true}]];
function crisisTick(){if(S.t<yT(1867,6))return;if(!S.crT)S.crT=S.t+YEAR*(2+Math.random()*2);if(S.t<S.crT||!$('#ov').hidden)return;S.crT=S.t+YEAR*(3+Math.random()*2.5);
 const order=CRISES.slice().sort(()=>Math.random()-.5);for(const[k,f]of order)if(f()){S.lastCrisis=k;break}}
/* crime: robbers, banks and detectives */
function crimeTick(){if(!S.robT)S.robT=S.t+YEAR*(2+Math.random()*2);if(S.t<S.robT||!$('#ov').hidden)return;S.robT=S.t+YEAR*(2.5+Math.random()*2)*((S.crime??30)>50?.7:1);
 const banks=S.list.filter(o=>o.t==='bank'&&!o.bld);if(!banks.length)return;const b=banks[Math.random()*banks.length|0],cov=COV.police&&COV.police[b.y*W+b.x],det=S.list.some(o=>o.t==='polizei'&&o.up2&&!o.bld);
 const loss=Math.min(3000,Math.round(S.stock.gold*.15));if(cov&&Math.random()<.6){S.prest+=5;toast('👮 The police foil a bank robbery 👑 +5');return}
 if(!robStart(b,loss,cov,det)){S.stock.gold-=loss;robOutcome(loss,cov,det)}}
/* what follows a robbery nobody stopped in the street */
function robOutcome(loss,cov,det){const yr=Math.floor(Y0+S.t/YEAR),big=yr>=1879&&NYC()?' Not since George Leonidas Leslie\'s gang took nearly $3 million from the Manhattan Savings Institution in 1878 has the city seen anything so bold.':'';
 if(det)evChoice('🕵️ Bank robbery!',`Masked robbers empty the vault of your bank: −${money(loss,1).replace(/\.$/,'')}.${big} Your detective bureau has a lead.`,[[`Send the detectives (−${money(200)})`,()=>{S.stock.gold-=200;if(Math.random()<.65){S.stock.gold+=loss;S.prest+=10;evOv('🕵️ Case solved',`The detectives track the gang to ${NYC()?'a saloon on the Bowery':'a tavern in Ottakring'}. The money is back. 👑 +10`)}else toast(NYC()?'🕵️ The trail goes cold in the Five Points':'🕵️ The trail goes cold in the Brigittenau')}],['Let it go',()=>{}]]);
 else evOv('💰 Bank robbery!',`Masked robbers empty the vault of your bank: −${money(loss,1).replace(/\.$/,'')}.${big}${cov?'':' No police station covers it.'} A police station with a detective bureau could have caught them.`)}
/* the robbery as a street scene: the gang runs out of the bank to a wagon and drives off along the streets, away from the bank.
   The 3D view moves the wagon in real time (so the game's speed never makes it outrun the Mayor) and writes how far it has got
   (s.d), whether the Mayor is close (s.close) and when it is gone (s.gone); if he points the police to it, they catch it */
const ROB_T=240;
function robRoute(b){const f=B[b.t].foot||1;let start=-1,bd=1e9;for(const[x,y]of perim(b)){if(!inb(x,y))continue;const i=y*W+x;if(S.b[i]&&S.b[i].t==='road'&&S.tiles[i]!==BRIDGE){const d=Math.hypot(x-b.x-(f-1)/2,y-b.y-(f-1)/2)+Math.random()*.5;if(d<bd){bd=d;start=i}}}if(start<0)return null;
 const r=[start],seen=new Set(r),cx=b.x+(f-1)/2,cy=b.y+(f-1)/2;let cur=start,dir=-1;
 for(let k=0;k<26;k++){const nb=roadNb(cur).filter(n=>!seen.has(n)&&S.tiles[n]!==BRIDGE);if(!nb.length)break;
  const far=nb.filter(n=>Math.hypot(n%W-cx,(n/W|0)-cy)>=Math.hypot(cur%W-cx,(cur/W|0)-cy)),pool=far.length?far:nb,ahead=pool.find(n=>n-cur===dir),nx=ahead!==undefined&&Math.random()<.75?ahead:pool[Math.random()*pool.length|0];
  dir=nx-cur;r.push(nx);seen.add(nx);cur=nx}return r.length>=8?r:null}
function robStart(b,loss,cov,det){if(!NYC())return false;if(S.sc||!letGo(false))return sceneWait(()=>{if(!S.list.includes(b)||!robStart(b,loss,cov,det)){S.stock.gold-=loss;robOutcome(loss,cov,det)}});const route=robRoute(b);if(!route)return false;
 S.stock.gold-=loss;S.sc={k:'rob',x:route[0]%W,y:route[0]/W|0,route,b,loss,cov,det,t0:S.t,t1:S.t+ROB_T,d:0,txt:'💰 Bank robbers getting away!'};{const w=sceneWhere0(S.sc.x,S.sc.y);sceneAsk(S.sc,`💰 Robbers are getting away from your bank${w?` on ${w}`:''}! Will you give chase?`,'👮 Leave it to the police')}sfx('boom');sceneShow();
 sfx('click');return true}
function robAct(s){if(s.caught||!s.close)return;const yr=Math.floor(Y0+S.t/YEAR);s.caught=1;s.end=S.t+8;S.stock.gold+=s.loss;S.prest+=8;S.good=Math.max(S.good||0,S.t+YEAR/6);sfx('chime');sceneShow();
 toast(`👮 You wave the police after the wagon. They cut it off at the corner and take the robbers with the sacks: ${money(s.loss,1)} back in the vault${yr>=1880&&yr<1895?', and Inspector Thomas Byrnes\'s detectives march them to Police Headquarters on Mulberry Street':', and the gang spends the night at Police Headquarters on Mulberry Street'} 👑 +8`)}
function robEnd(s){sceneEnd();robOutcome(s.loss,s.cov,s.det)}
/* diplomacy */
const NATIONS=[];
const REL=()=>S.rel||(S.rel={prussia:-30,russia:0,italy:-30,france:10,serbia:0,ottoman:10});
const ten=d=>{S.tension=Math.max(0,Math.min(100,(S.tension??25)+d))};
function armyStr(){const e=EMP();return 20+(e.regs||0)*10+S.list.filter(o=>o.t==='kaserne'&&!o.bld&&o.c!==false).length*4+(S.list.some(o=>o.t==='rossauer'&&!o.bld)?15:0)+(S.ctrOK||0)*2+(RES().boltzmann?5:0)+(RES().kaplan?5:0)+(e.heir==='ff'&&e.ffLoyal?5:0)}
const relm=(o)=>{for(const k in o)REL()[k]=Math.max(-100,Math.min(100,REL()[k]+o[k]))};
function fightWar(foe,why){const n=NATIONS.find(q=>q[0]===foe),allies=NATIONS.filter(q=>q[0]!==foe&&REL()[q[0]]>=60).length,mine=armyStr()+allies*15,theirs=n[3]+Math.max(0,Math.floor((Y0+S.t/YEAR-1865)/2)),win=Math.random()<mine/(mine+theirs);
 if(win){S.prest+=60;relm({[foe]:30});ten(-10);evOv(`⚔️ Victory over ${n[1]}`,`${why} Your army of ${mine} wins the campaign${allies?` with help from ${allies} ally${allies>1?'s':''}`:''}. 👑 +60`)}
 else{S.prest=Math.max(0,S.prest-50);S.infl=S.t+YEAR*3;relm({[foe]:10});for(const o of S.list)if(o.t==='house'&&!o.h)o.pop=Math.max(1,Math.floor(o.pop*.85));
  evOv(`⚔️ Defeat against ${n[1]}`,`${why} Your army of ${mine} is beaten. War debts and lost markets bring three years of inflation: everything you buy costs far more, and taxes are worth less. 👑 −50`)}}
const DIPLO=[];
function diploTick(){S.dp=S.dp||0;if(!$('#ov').hidden)return;if(S.dp<DIPLO.length&&S.t>=yT(DIPLO[S.dp][0],DIPLO[S.dp][1])){const[,, t,x,o,who]=DIPLO[S.dp++];decide(who,`👑 ${t}`,`Your advisers await your decision, ${NYC()?'Mr. Mayor':'Majesty'}.<br><br>${x}<br><br><span class="m">Tension in Europe: ${Math.round(S.tension??25)}%</span>`,o);return}
 if(!S.war&&!S.peace&&S.t>=yT(1905,1)&&(S.tension??25)>=85){S.war=1;S.ctrT=S.t;for(const o of S.list)if(o.t==='house'&&!o.h)o.pop=Math.max(1,Math.floor(o.pop*.8));evOv('⚔️ The Great War breaks out early','Years of crises have pushed Europe over the edge. A shot in the Balkans sets off the Great War years before 1914: workers go to the front and the army demands quotas.');return}
}
function showEmpire(){{const e=EMP(),bar=(v,good)=>`<b style="color:${(good?v>=50:v<50)?'#2f7a4a':'#b8322a'}">${Math.round(v)}%</b>`;return `<h3 style="margin:8px 0 4px">🏛️ Your city</h3><table class="stat cityV">${[['Corruption',e.cor||0,0],['Reforms',e.ref,1],['Unrest',e.rev,0],['Crime',S.crime??30,0]].map(([n,v,g])=>`<tr><td>${n}</td><td>${bar(v,g)}</td></tr>`).join('')}</table>`}const e=EMP(),bar=(v,good)=>`<b style="color:${(good?v>=50:v<50)?'#2f7a4a':'#b8322a'}">${Math.round(v)}%</b>`;
 return `<h3 style="margin:8px 0 4px">👑 Your empire</h3><p class="m">Heir: <b>${e.heir==='rudolf'?'Crown Prince Rudolf':'Archduke Franz Ferdinand'}</b> · Hungary's loyalty ${bar(e.hun,1)} · Bohemia ${bar(e.boh,1)} · German nationalist anger ${bar(e.ger,0)} · Reforms ${bar(e.ref,1)} · Revolutionary mood ${bar(e.rev,0)}</p>
 <h3 style="margin:8px 0 4px">🪖 Your army: ${armyStr()}</h3><p class="m">${e.regs||0} regiments of ${regCap()} your barracks can house. Each regiment adds 10 strength and costs ${money(12)} per minute plus food.</p><p><button id="recBtn">🪖 Raise a regiment (${costStr(REGC)})</button></p>${e.inv?`<p class="m">⚠️ <b>${NATIONS.find(q=>q[0]===e.inv.k)[1]}</b> ${e.inv.march?`is marching on ${L.name}!`:`will invade on ${dateStr(e.inv.at)} with an army of ${e.inv.str}.`}</p>`:''}`}
function showDiplo(){return'';const r=REL(),n=NATIONS.map(([k,nm,f,str])=>`<p class="m">${f} <b>${nm}</b>: ${r[k]>=60?'ally':r[k]>=20?'friendly':r[k]>-20?'neutral':r[k]>-60?'hostile':r[k]>-60?'hostile':'enemy, may invade'} (${r[k]}) · army ${str+Math.floor((Y0+S.t/YEAR-1865)/2)}</p>`).join('');
 return `<h3 style="margin:8px 0 4px">🌍 Europe</h3><p class="m">Tension: <b>${Math.round(S.tension??25)}%</b>${(S.tension??25)>=70?' · war is close':(S.tension??25)<35?' · calm':''}. Your army: <b>${armyStr()}</b> (barracks, the Rossauer Kaserne and filled army orders make it stronger).</p>${n}<p class="m">Keep tension low by 1914, and the shots in Sarajevo may never be fired.</p>`}
function drawStation(cx,cy,hw,hh,o){const t=hw/4,t2=hh/4,tx=t>=4.5;poly([cx-hw*.9,cy,cx,cy-hh*.9,cx+hw*.9,cy,cx,cy+hh*.9],'#cfc6b4');
 prismTex(cx-t*.6,cy-t2*.6,.7,1.5,1.4*t,9,2,'#74706a',.35*t,t,t2,tx);const[hx,hy]=[cx+t*.5,cy+t2*.5],ax=1.3,ay=.8;
 poly([hx-ax*t+ay*t*0-ay*t,hy-ax*t2*0+0,hx,hy-ay*t2*0,hx,hy],'#00000000');
 const L1=[hx-t*ax-t*ay,hy-t2*ax+t2*ay],C1=[hx+t*ax-t*ay,hy+t2*ax+t2*ay],R1=[hx+t*ax+t*ay,hy+t2*ax-t2*ay],T1=[hx-t*ax+t*ay,hy-t2*ax-t2*ay],H1=.9*t;
 poly([L1[0],L1[1],C1[0],C1[1],C1[0],C1[1]-H1,L1[0],L1[1]-H1],'#b8a888');poly([C1[0],C1[1],R1[0],R1[1],R1[0],R1[1]-H1,C1[0],C1[1]-H1],'#9e8f78');
 ctx.fillStyle='#8fb0bd';ctx.beginPath();ctx.moveTo(L1[0],L1[1]-H1);ctx.quadraticCurveTo((L1[0]+T1[0])/2,(L1[1]+T1[1])/2-H1-1.2*t,T1[0],T1[1]-H1);ctx.lineTo(R1[0],R1[1]-H1);ctx.quadraticCurveTo((C1[0]+R1[0])/2,(C1[1]+R1[1])/2-H1-1.2*t,C1[0],C1[1]-H1);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(60,70,80,.5)';ctx.lineWidth=Math.max(.6,t*.04);for(let i=1;i<6;i++){const f=i/6;ctx.beginPath();ctx.moveTo(L1[0]+(C1[0]-L1[0])*f,L1[1]+(C1[1]-L1[1])*f-H1);ctx.quadraticCurveTo(L1[0]+(C1[0]-L1[0])*f+(T1[0]-L1[0])/2,L1[1]+(C1[1]-L1[1])*f+(T1[1]-L1[1])/2-H1-1.2*t,L1[0]+(C1[0]-L1[0])*f+(T1[0]-L1[0]),L1[1]+(C1[1]-L1[1])*f+(T1[1]-L1[1])-H1);ctx.stroke()}
 const[kx,ky]=[cx-t*1.3,cy+t2*.1];prismTex(kx,ky,.3,.3,2.4*t,9,3,'#5f8e7c',.5*t,t,t2,tx);ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.arc(kx-.15*t,ky-2*t,.14*t,0,7);ctx.fill();ctx.strokeStyle='#1d1b1a';ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();ctx.moveTo(kx-.15*t,ky-2*t);ctx.lineTo(kx-.15*t,ky-2.1*t);ctx.stroke()}
function drawSvc2(k,cx,cy,z,hw,hh,s){const t=hw/4,t2=hh/4,tx=t>=4.5;poly([cx-hw*.9,cy,cx,cy-hh*.9,cx+hw*.9,cy,cx,cy+hh*.9],'#cfc6b4');
 if(k==='polizei'){prismTex(cx,cy,1.2,.9,1.2*t,4,2,'#5a5f66',.4*t,t,t2,tx);const[fx,fy]=[cx+t*.2,cy-1.6*t];ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.6,t*.04);ctx.beginPath();ctx.moveTo(fx,fy+.4*t);ctx.lineTo(fx,fy-.6*t);ctx.stroke();poly([fx,fy-.6*t,fx+.5*t,fy-.5*t,fx,fy-.4*t],'#1d1b1a');poly([fx,fy-.4*t,fx+.5*t,fy-.3*t,fx+.5*t,fy-.5*t],'#d9b13b');return}
 if(k==='bank'){prismTex(cx,cy,1.5,1.2,1.6*t,3,3,'#67635e',.3*t,t,t2,tx);const a=[cx-t*1.5-t*1.2*0,cy+t2*1.2-t2*1.5*0];const L1=[cx-t*1.5+(-1.2)*t*0-t*1.2,cy-t2*1.5+t2*1.2],C1=[cx+t*1.5-t*1.2,cy+t2*1.5+t2*1.2];
  for(let i=0;i<6;i++){const f=(i+.5)/6,x=L1[0]+(C1[0]-L1[0])*f,y=L1[1]+(C1[1]-L1[1])*f;ctx.fillStyle='#f4efe2';ctx.fillRect(x-.05*t,y-1.1*t,.1*t,1.1*t)}poly([L1[0],L1[1]-1.15*t,C1[0],C1[1]-1.15*t,(L1[0]+C1[0])/2,(L1[1]+C1[1])/2-1.7*t],'#efe5cc');return}
 if(k==='farm'){prismTex(cx-t*.6,cy-t2*.6,.8,.6,.8*t,0,1,'#8a4a36',.7*t,t,t2,tx);poly([cx+t*.2,cy+t2*.2-.0,cx+t*1.6,cy+t2*.9,cx+t*.4,cy+t2*1.6,cx-t*1,cy+t2*.9],'#8fa95a');
  for(let i=0;i<6;i++){const px=cx+t*(.2+((i*37)%10)/10*1.1),py=cy+t2*(.5+((i*53)%10)/10*.9);if(i<3){ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(px,py-.08*t,.12*t,.08*t,0,0,7);ctx.fill();ctx.fillStyle='#c0392b';ctx.fillRect(px+.08*t,py-.18*t,.03*t,.05*t)}else{ctx.fillStyle=i%2?'#f4f1ea':'#5a3420';ctx.beginPath();ctx.ellipse(px,py-.16*t,.3*t,.15*t,0,0,7);ctx.fill();ctx.fillStyle='#2a2522';ctx.beginPath();ctx.ellipse(px+.12*t,py-.2*t,.1*t,.06*t,0,0,7);ctx.fill()}}return}
 if(k==='muell'){prismTex(cx-t*.4,cy-t2*.4,1,.8,.9*t,4,1,'#74706a',.35*t,t,t2,tx);for(let i=0;i<2;i++){const px=cx+t*(.6+i*.5),py=cy+t2*(1.1-i*.4);ctx.fillStyle='#4f5a3a';ctx.fillRect(px-.25*t,py-.35*t,.5*t,.25*t);ctx.fillStyle='#2a1d14';ctx.beginPath();ctx.arc(px-.15*t,py-.08*t,.07*t,0,7);ctx.arc(px+.15*t,py-.08*t,.07*t,0,7);ctx.fill()}return}
 if(k==='eislauf'){ctx.fillStyle='#d8eef6';ctx.beginPath();ctx.ellipse(cx,cy,1.5*t,.75*t,0,0,7);ctx.fill();ctx.strokeStyle='#f4f1ea';ctx.lineWidth=Math.max(1,t*.08);ctx.stroke();prismTex(cx-t*1.2,cy-t2*1.2,.5,.4,.6*t,9,1,'#5f8e7c',.3*t,t,t2,tx);
  for(let i=0;i<6;i++)drawPerson(cx+Math.cos(i*1.1+S.t*.3)*t*.9,cy+Math.sin(i*1.1+S.t*.3)*t*.4,t*.09,i%PEOPLE.length);return}
 if(k==='reitschule'){prismTex(cx,cy,1.6,.9,1.3*t,12,2,'#5f8e7c',.5*t,t,t2,tx);poly([cx+t*.4,cy+t2*1.6,cx+t*1.6,cy+t2*1,cx+t*1.2,cy+t2*1.8,cx,cy+t2*2.4],'#c9b995');drawHorse(cx+t*.8,cy+t2*1.7,1,.5,t*.12,'#f4f1ea',S.t*3);return}
 if(k==='kaserne'){prismTex(cx,cy,1.6,1.2,1.4*t,8,3,'#5a5f66',.3*t,t,t2,tx);for(const[u,v]of[[1.6,1.2],[1.6,-1.2],[-1.6,1.2]]){const[x,y]=[cx+(u-v)*t,cy+(u+v)*t2];prismTex(x,y,.3,.3,1.9*t,8,2,'#5a5f66',.25*t,t,t2,tx)}return}
 if(k==='regulierung'){ctx.fillStyle='#9c9282';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(cx-t+i*.5*t,cy+t2*(.5-i*.25),.35*t,.18*t,0,0,7);ctx.fill()}prismTex(cx+t*.6,cy-t2*.4,.4,.4,.7*t,4,1,'#3a3530',.2*t,t,t2,tx);ctx.strokeStyle='#3a3530';ctx.lineWidth=Math.max(1,t*.06);ctx.beginPath();ctx.moveTo(cx+t*.6,cy-t2*.4-.9*t);ctx.lineTo(cx-t*.6,cy-1.4*t);ctx.stroke();return}
 if(k==='reichsbruecke'){drawAnchorage(cx,cy,hw,hh);return}
 if(k==='tiergarten'){for(const[u,v,c]of[[-1,-1,'#8fa95a'],[1,-1,'#c9b995'],[-1,1,'#8fa95a'],[1,1,'#9fc0cf']]){const[x,y]=[cx+(u-v)*t,cy+(u+v)*t2];poly([x,y-.7*t2,x+.8*t,y,x,y+.7*t2,x-.8*t,y],c);ctx.strokeStyle='#5a4632';ctx.lineWidth=.8;ctx.stroke()}
  const ani=[['#9c8f80',.45,.3],['#d9a441',.3,.25],['#2a2522',.25,.2],['#e8d5b0',.3,.2]];ani.forEach(([c,a,b],i)=>{const[x,y]=[cx+((i%2?1:-1)-(i<2?-1:1))*t,cy+((i%2?1:-1)+(i<2?-1:1))*t2];ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y-b*t,a*t,b*t,0,0,7);ctx.fill();if(i===1){ctx.fillRect(x+.2*t,y-1*t,.08*t,.6*t)}});
  const[px,py]=[cx,cy];ctx.fillStyle='#efe5cc';ctx.beginPath();ctx.ellipse(px,py-.3*t,.45*t,.25*t,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(px,py-.5*t,.35*t,.35*t,0,Math.PI,0);ctx.fillStyle='#5f8e7c';ctx.fill();return}}
function finishBridge_old(o){let best=null;for(const[x,y]of perim(o)){if(!inb(x,y))continue;for(const[dx,dy]of D4){let cx=x+dx,cy=y+dy;const run=[];while(inb(cx,cy)&&S.tiles[cy*W+cx]===WATER&&run.length<60){run.push(cy*W+cx);cx+=dx;cy+=dy}
  if(run.length&&inb(cx,cy)&&S.tiles[cy*W+cx]!==WATER&&(!best||run.length<best.run.length))best={run,a:y*W+x,e:cy*W+cx}}}
 if(!best)return;for(const i of best.run){S.tiles[i]=BRIDGE;tcolSet(i)}for(const e of[best.a,best.e])if(!S.b[e])place('road',e%W,e/W|0,0,true);GV++;recompute()}

/* ===================== railways and trams ===================== */
const D8=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]];
let RL=new Map(),TL=new Map(),TRAMM=null,RV=0,TRAINS=[],TRAMS=[],TRK=-1,LA=-1,LPV=null;
const addLink=(M,a,b)=>{(M.get(a)||M.set(a,[]).get(a)).includes(b)||M.get(a).push(b);(M.get(b)||M.set(b,[]).get(b)).includes(a)||M.get(b).push(a)};
function railIndex(){RL=new Map();TL=new Map();RAILM.fill(0);if(!TRAMM||TRAMM.length!==W*H)TRAMM=new Uint8Array(W*H);TRAMM.fill(0);
 for(const[a,b]of S.rails||[]){addLink(RL,a,b);RAILM[a]=RAILM[b]=1}for(const[a,b]of S.trams||[]){addLink(TL,a,b);TRAMM[a]=TRAMM[b]=1}RV++;TRK=-1;
 /* the trees are felled where a track is laid, the wood lots and the street trees alike */
 for(let i=0;i<W*H;i++)if(RAILM[i]&&!S.b[i]){if(S.tiles[i]===FOREST){S.tiles[i]=GRASS;tcolSet(i)}if(DECO&&DECO[i]===ALLEE)DECO[i]=0}}
function railPas(i){const t=S.tiles[i];if(t===BRIDGE)return true;if(t===WATER||t===MOUNT)return false;const o=S.b[i];if(o)return o.t==='road';return canUse('road',i)}
function linePlan(kind,a,b){if(a===b)return null;const tram=kind==='tramline',pas=tram?(i=>{const o=S.b[i];return S.tiles[i]===BRIDGE||(o&&o.t==='road')}):railPas;if(!pas(a)||!pas(b))return null;
 const ax=a%W,ay=a/W|0,bx=b%W,by=b/W|0,m=40+Math.round(Math.hypot(ax-bx,ay-by)*.5),x0=Math.max(0,Math.min(ax,bx)-m),x1=Math.min(W-1,Math.max(ax,bx)+m),y0=Math.max(0,Math.min(ay,by)-m),y1=Math.min(H-1,Math.max(ay,by)+m),M=tram?TL:RL;
 const g=new Map([[a,0]]),par=new Map(),dirOf=new Map([[a,-1]]),hp=[[0,a]];let n=0;const pop=()=>{let bi=0;for(let i=1;i<hp.length;i++)if(hp[i][0]<hp[bi][0])bi=i;const r=hp[bi];hp[bi]=hp[hp.length-1];hp.pop();return r};
 while(hp.length&&n++<200000){const[,k]=pop();if(k===b)break;const x=k%W,y=k/W|0,gk=g.get(k);
  const nbs=tram?rdNb(k).map(j=>{const dx=j%W-x,dy=(j/W|0)-y;return D8.findIndex(q=>q[0]===dx&&q[1]===dy)}).filter(d=>d>=0):[0,1,2,3,4,5,6,7];
  for(const d of nbs){const[dx,dy]=D8[d],nx=x+dx,ny=y+dy;if(nx<x0||nx>x1||ny<y0||ny>y1)continue;const j=ny*W+nx;if(!pas(j))continue;
   if(!tram&&dx&&dy&&!(pas(y*W+nx)||pas(ny*W+x)))continue;if(!tram){const rk=isRd(k)&&S.tiles[k]!==BRIDGE,rj=isRd(j)&&S.tiles[j]!==BRIDGE;if((rk||rj)&&dx&&dy)continue}const linked=(M.get(k)||[]).includes(j);let c=(dx&&dy?1.41:1)*(linked?.3:1);const pd=dirOf.get(k);if(pd>=0&&pd!==d)c+=tram?.2:.8;if(!tram&&S.b[j]&&S.b[j].t==='road'&&!linked)c+=1.5;
   const ng=gk+c;if(ng<(g.get(j)??1e9)){g.set(j,ng);par.set(j,k);dirOf.set(j,d);hp.push([ng+Math.hypot(nx-bx,ny-by),j])}}}
 if(!g.has(b))return null;const tiles=[b];let c=b;while(c!==a){c=par.get(c);tiles.push(c)}tiles.reverse();let nw=0;for(let i=1;i<tiles.length;i++)if(!(M.get(tiles[i-1])||[]).includes(tiles[i]))nw++;
 return{tiles,n:nw,cost:tram?{gold:nw*5,iron:Math.ceil(nw/4)}:{gold:nw*12,iron:Math.ceil(nw/2)}}}
/* why a line can't go from a to b: the tiles straight there, the first one in the way and what is wrong with it (the preview shows it
   in red). Tracks cross a street square on at a level crossing, never diagonally, and never through a building; they may run straight
   down a street, as the Hudson River Railroad ran down Eleventh Avenue behind a flagman on horseback; tram lines keep to the streets */
function lineWhy(kind,a,b){const tram=kind==='tramline',ax=a%W,ay=a/W|0,bx=b%W,by=b/W|0,n=Math.max(Math.abs(bx-ax),Math.abs(by-ay)),tiles=[];let bad=-1,why='';
 for(let s_=0;s_<=n;s_++){const x=Math.round(ax+(bx-ax)*s_/Math.max(1,n)),y=Math.round(ay+(by-ay)*s_/Math.max(1,n)),i=y*W+x;if(tiles[tiles.length-1]===i)continue;const pv=tiles[tiles.length-1];tiles.push(i);if(bad>=0)continue;
  const o=S.b[i],t=S.tiles[i],rd=isRd(i)&&t!==BRIDGE,prd=pv!=null&&isRd(pv)&&S.tiles[pv]!==BRIDGE,dg=pv!=null&&pv%W!==x&&(pv/W|0)!==y;
  if(tram){if(!rd&&t!==BRIDGE){bad=i;why=t===WATER?'🌊 Tram lines need a bridge':'🛣️ Tram lines run along streets'}continue}
  if(t===WATER){bad=i;why='🌊 Tracks need a bridge over water'}else if(t===MOUNT){bad=i;why='⛰️ Too steep for tracks'}else if(o&&o.t!=='road'){bad=i;why=`🏠 ${B[o.t].n} in the way`}
  else if((rd||prd)&&dg){bad=i;why='🛣️ Cross the street straight on'}}
 return{tiles,bad,why:why||'No route to there'}}
function buildLinePlan(kind,p){for(const g in p.cost)if(S.stock[g]<p.cost[g]){toast(`This ${kind==='rail'?'track':'tram line'} needs ${costStr(p.cost)}`);return false}
 for(const g in p.cost)S.stock[g]-=p.cost[g];const arr=kind==='rail'?(S.rails||(S.rails=[])):(S.trams||(S.trams=[])),M=kind==='rail'?RL:TL;
 for(let i=1;i<p.tiles.length;i++){const a=p.tiles[i-1],b=p.tiles[i];if(!(M.get(a)||[]).includes(b))arr.push([a,b])}railIndex();GV++;recompute();sfx('build');return true}
/* ---------- electric street light, put up by hand: once electric power is researched, the 💡 tool lights the streets round a tapped
   road with arc lamps (every street tile joined to it within 6 tiles), 6 $ a tile; the 3D city swaps the gas lamps there. The lit
   tiles are kept in S.elx and saved with the game ---------- */
function lightPlan(i){const o=S.b[i];if(!o||o.t!=='road')return null;const lit=new Set(S.elx||[]),x0=i%W,y0=i/W|0,seen=new Set([i]),q=[i],out=[];
 while(q.length){const j=q.pop();if(!lit.has(j))out.push(j);for(const k of roadNb(j)){if(seen.has(k))continue;if(Math.max(Math.abs(k%W-x0),Math.abs((k/W|0)-y0))>6)continue;seen.add(k);q.push(k)}}
 return{tiles:out,cost:{gold:out.length*6}}}
function lightClick(t,pt){if(!inb(t.x,t.y))return;if(!RES().electric){toast('Research electric power first (🔬 Research)');return}const i=t.y*W+t.x,p=lightPlan(i);
 if(!p){toast('Tap a street to light it');return}if(!p.tiles.length){toast('These streets already have electric light');return}
 const k='e'+i;if((pt==='touch'||pt==='pen')&&pend!==k){pend=k;hover={x:t.x,y:t.y};toast(`Tap again: arc lamps along ${p.tiles.length} tiles of street for ${costStr(p.cost)}`);return}pend=null;
 for(const g in p.cost)if((S.stock[g]||0)<p.cost[g]){toast(`Electric light here needs ${costStr(p.cost)}`);return}for(const g in p.cost)S.stock[g]-=p.cost[g];
 (S.elx=S.elx||[]).push(...p.tiles);float(t.x,t.y,'💡 Electric light');sfx('build');GV++}
function lineClick(kind,t,pt){if(!inb(t.x,t.y))return;const k=t.y*W+t.x,nm=kind==='rail'?'track':'tram line';
 if(LA<0){const ok=kind==='rail'?railPas(k):(S.b[k]&&S.b[k].t==='road'||S.tiles[k]===BRIDGE);if(!ok){toast(kind==='rail'?'Tracks need free land, a road crossing or a bridge':'Tram lines run on roads. Tap a road');return}LA=k;LPV=null;toast(`Start set. ${pt==='mouse'?'Click':'Tap'} where the ${nm} should go`);return}
 if(k===LA){LA=-1;LE=-1;LPV=null;pend=null;confHide();toast('Start cleared');return}const p_=linePlan(kind,LA,k);if(!p_){toast(lineWhy(kind,LA,k).why);return}
 if(pt==='touch'||pt==='pen'){if(LE>=0&&CONF==='line'&&near1(k,LE)){confOk();return}LE=k;hover={x:k%W,y:k/W|0};confShow('line');return}
 pend=null;if(buildLinePlan(kind,p_)){toast(`${kind==='rail'?'🚂 Track':'🚋 Tram line'} built. ${pt==='mouse'?'Click':'Tap'} on to continue, or the end point to stop`);LA=k;LPV=null}}
function stationOK(o){return stationTiles(o).length>0}
/* a station's track side, where the lines run into its train shed: the side the tracks already touch, or else the side away from the
   street it fronts. It must be open (free land or track, no building, street or water) for at least two of its four tiles. ry turns
   the station's front to the opposite side (the 3D view's facing) */
const SSIDE=[[0,(x,y,k)=>[x+k,y+4]],[Math.PI/2,(x,y,k)=>[x+4,y+k]],[Math.PI,(x,y,k)=>[x+k,y-1]],[-Math.PI/2,(x,y,k)=>[x-1,y+k]]];
function stationSide(x,y){let ti=-1,bn=0,fr=0,fn=-1;for(let s_=0;s_<4;s_++){let nr=0,nd=0;for(let k=0;k<4;k++){const[a,b]=SSIDE[s_][1](x,y,k);if(!inb(a,b))continue;const i=b*W+a;if(RAILM[i])nr++;if(isRd(i))nd++}if(nr>bn){bn=nr;ti=s_}if(nd>fn){fn=nd;fr=s_}}
 if(ti<0)ti=(fr+2)%4;const tiles=[];let open=0;for(let k=0;k<4;k++){const[a,b]=SSIDE[ti][1](x,y,k);if(!inb(a,b))continue;const i=b*W+a;tiles.push(i);const t=S.tiles[i];if(RAILM[i]||(!S.b[i]&&t!==WATER&&t!==MOUNT&&t!==BRIDGE))open++}
 return{side:ti,tiles,ok:open>=2,ry:SSIDE[(ti+2)%4][0]}}
function stationTiles(o){const r=[];for(const[x,y]of perim(o))if(inb(x,y)&&RAILM[y*W+x])r.push(y*W+x);return r}
function railBFS(from,M){const par=new Map(from.map(i=>[i,-1])),q=from.slice();for(let h=0;h<q.length;h++){for(const n of M.get(q[h])||[])if(!par.has(n)){par.set(n,q[h]);q.push(n)}}return{par,seen:q}}
const pathTo=(par,t)=>{const p=[];let c=t;while(c!==-1&&c!==undefined){p.push(c);c=par.get(c)}return p.reverse()};
/* the line tiles a depot sends its cars onto: any within three tiles of its lot */
function depotTiles(o){const r=[];for(let y=o.y-3;y<o.y+7;y++)for(let x=o.x-3;x<o.x+7;x++){if(!inb(x,y))continue;const i=y*W+x;if(TL.has(i))r.push(i)}return r}
/* the depot and the tram line are called after the cars of their years */
function tramNames(){if(!NYC())return;const el=!!RES().electric;B.tram.n=el?'Tram depot':'Horsecar depot';B.tramline.n=el?'Trolley line':'Horsecar line'}
/* the runs change with the lines, and when a station or tram depot is finished */
function railKey(){let n=0;for(const o of S.list)if((o.t==='bahnhof'||o.t==='tram')&&!o.bld)n++;return RV+':'+S.list.length+':'+n}
function trainsRebuild(){TRK=railKey();TRAINS=[];TRAMS=[];const sts=S.list.filter(o=>o.t==='bahnhof'&&!o.bld);for(const o of sts){o.main=false;o.np=0}
 for(let i=0;i<sts.length;i++){const o=sts[i],st=stationTiles(o);if(!st.length)continue;const{par,seen}=railBFS(st,RL);
  const edge=seen.find(j=>{const x=j%W,y=j/W|0;return x<=3||y<=3||x>=W-4||y>=H-4});if(edge!==undefined){o.main=true;const p=pathTo(par,edge);if(p.length>2)TRAINS.push({p,f:0,dir:1,w:0,main:1})}
  for(let k=i+1;k<sts.length;k++){const t2=stationTiles(sts[k]).find(j=>par.has(j));if(t2!==undefined){o.np++;sts[k].np++;const p=pathTo(par,t2);if(p.length>2)TRAINS.push({p,f:Math.random(),dir:1,w:0})}}}
 /* a line no station's train runs on still has a goods train going up and down it, end to end */
 {const done=new Set();for(const t of TRAINS)for(const j of t.p)done.add(j);for(const s0 of RL.keys()){if(done.has(s0))continue;const{seen}=railBFS([s0],RL);seen.forEach(j=>done.add(j));const a=seen.find(j=>RL.get(j).length===1)??seen[0];
  const{par,seen:s2}=railBFS([a],RL),p=pathTo(par,s2[s2.length-1]);if(p.length>=8)TRAINS.push({p,f:0,dir:1,w:0,goods:1})}}
 /* the cars run on the lines that pass a finished depot (within three tiles of it), starting from there */
 if(cnt('tram')){const dep=new Set();for(const o of S.list)if(o.t==='tram'&&!o.bld)for(const i of depotTiles(o))dep.add(i);
  /* how far along the track each tile is from a depot: every run's cars set out from its point nearest one */
  const dd=new Map([...dep].map(i=>[i,0])),dq=[...dep];for(let h=0;h<dq.length;h++)for(const j of TL.get(dq[h])||[])if(!dd.has(j)){dd.set(j,dd.get(dq[h])+1);dq.push(j)}
  const done=new Set();for(const s0 of TL.keys()){if(done.has(s0))continue;const{seen}=railBFS([s0],TL);seen.forEach(j=>done.add(j));if(!seen.some(j=>dep.has(j)))continue;const ends=seen.filter(j=>(TL.get(j)||[]).length===1),cov=new Set();
  /* the longest run first, then one from each branch end no run reaches yet, on to the far end of the network: so every branch has
     its cars, turning at the junctions where it meets the others */
  for(let r=0;r<8;r++){const a=r?ends.find(j=>!cov.has(j)):ends[0]??seen[0];if(a==null)break;
  const{par,seen:s2}=railBFS([a],TL),far=s2[s2.length-1],p=pathTo(par,far);let nw=0;for(const j of p)if(!cov.has(j)){nw++;cov.add(j)}if(p.length<3)continue;const st=[];for(let k=3,last=-9;k<p.length-3;k++){if(k-last<9||S.tiles[p[k]]===BRIDGE)continue;const a=p[k-1],c=p[k+1];if(p[k]-a!==c-p[k])continue;const o=Math.abs(c-p[k])===1?W:1;if(isRd(p[k]+o)&&isRd(p[k]-o))continue;st.push(k);last=k}
  const n=Math.max(1,Math.round(nw/28)),di=p.reduce((b,j,k)=>(dd.get(j)??1e9)<(dd.get(p[b])??1e9)?k:b,0),f0=di/(p.length-1);for(let k=0;k<n;k++)TRAMS.push({p,st,f:(f0+k/n)%1,dir:k%2?-1:1,w:0})}}}
 covCompute()}
function moveRun(tr,dt,sp){if(tr.w>0){tr.w-=dt;return}tr.f+=tr.dir*dt*sp/Math.max(1,tr.p.length-1);if(tr.f>=1){tr.f=1;tr.dir=-1;tr.w=4}else if(tr.f<=0){tr.f=0;tr.dir=1;tr.w=4}}
/* a tram halts a moment at each stop it passes (the stops along its run, every few blocks on a straight) */
function tramRun(tr,dt,sp){const L_=tr.p.length-1,q0=tr.f*L_;moveRun(tr,dt,sp);if(tr.w>0||!tr.st)return;const q1=tr.f*L_;if(q0===q1)return;
 for(const s_ of tr.st)if(s_!==tr.ls&&(q0-s_)*(q1-s_)<=0){tr.f=s_/L_;tr.w=2.5;tr.ls=s_;return}}
/* a train pulls away slowly and brakes into the end of its run: about 40 km/h at most (a goods train 30), half a link a second
   at the start, then a wait at the platform */
function trainRun(tr,dt){const L_=Math.max(1,tr.p.length-1);if(tr.w>0){tr.w-=dt;tr.v=0;return}const d=tr.dir>0?(1-tr.f)*L_:tr.f*L_,vm=tr.goods?.8:1.1,vt=Math.min(vm,Math.sqrt(2*.09*d)+.03);
 let v=tr.v||0;v=vt<v?vt:Math.min(vt,v+.09*dt);tr.v=v;tr.f+=tr.dir*v*dt/L_;if(tr.f>=1){tr.f=1;tr.dir=-1;tr.w=8;tr.v=0}else if(tr.f<=0){tr.f=0;tr.dir=1;tr.w=8;tr.v=0}}
/* the runs are rebuilt with the game's own clock; the cars move every frame (railMove, from the loop) so they glide instead of
   hopping four times a second */
function railTick(dt){if(TRK!==railKey())trainsRebuild();tramNames();sbTick()}
function railMove(dt){if(!S||!L.y1857)return;for(const t of SBTR)sbRun(t,dt);if(TRK!==railKey())return;for(const t of TRAINS)trainRun(t,dt);for(const t of TRAMS)tramRun(t,dt,elTram()?1.3:.7)}
/* Vienna's horsecars turn electric with the city's first electric line of 1897, years after the Electrical Exhibition brought the
   research; New York's with the research */
function elTram(){return!!RES().electric&&(!S||NYC()||Y0+S.t/YEAR>=1897)}
/* Otto Wagner's Stadtbahn, built by the state under the law of 1892 and run with steam: the Gürtel line on its arches (1898), the
   Wiental line in its walled cutting beside the Wien (1898, on to the Hauptzollamt in 1899) and the Donaukanal line along the canal
   (1901). The level gives each line (L.sb) from its own rivers and Gürtel; sbLines lays it as a run of tiles with its height (up on
   the arches, ramps at their ends) and its stations. Nobody may build on it once the law is passed, and in its opening year whatever
   stands in its way comes down. SBL: the lines open now; SBTR: their trains, which halt at every station */
let SBL=[],SBK='',SBS=null,SBTR=[],SBRES=null;const SBH=7.6;
function sbLines(){if(L._sb&&L._sbS===S.level)return L._sb;L._sbS=S.level;const out=[];SBRES=new Uint8Array(W*H);
 for(const ln of L.sb?L.sb():[]){const t=rast(ln.pts);let best=[],cur=[];
  /* the longest unbroken run on the map */
  for(const i of t){const j=cur[cur.length-1];if(j!=null&&Math.abs(j%W-i%W)+Math.abs((j/W|0)-(i/W|0))!==1){if(cur.length>best.length)best=cur;cur=[]}cur.push(i)}if(cur.length>best.length)best=cur;
  const p=best;if(p.length<8)continue;for(const i of p)SBRES[i]=1;
  const st=[];for(const[n,la,lo,k]of ln.st){const[x,y]=gt(...prj(L,la,lo));let q=-1,bd=12;p.forEach((i,j)=>{const d=Math.hypot(i%W-x,(i/W|0)-y);if(d<bd){bd=d;q=j}});if(q>=0)st.push({q,n,k})}st.sort((a,b)=>a.q-b.q);
  const h=new Float32Array(p.length);if(ln.hi){const a=st.find(o=>o.n===ln.hi[0]),b=st.find(o=>o.n===ln.hi[1]);if(a&&b){const qa=Math.min(a.q,b.q)-3,qb=Math.max(a.q,b.q)+3;for(let k=0;k<p.length;k++){const d=k<qa?qa-k:k>qb?k-qb:0;h[k]=SBH*Math.max(0,1-d/9)}}}
  out.push({k:ln.k,n:ln.n,at:ln.at,p,h,st})}
 return L._sb=out}
const sbRes=j=>!!SBRES&&!!SBRES[j]&&!!L.sb&&S.t>=yT(1892,1);
function sbTick(){if(!L.sb){if(SBL.length||SBTR.length){SBL=[];SBTR=[]}SBK='';return}const all=sbLines(),op=all.filter(l=>S.t>=yT(...l.at)),k=S.level+S.seed+':'+op.map(l=>l.k).join('');if(k===SBK&&SBS===S)return;SBK=k;SBS=S;SBL=op;
 let gone=0;for(const l of op){for(const i of l.p){const o=S.b[i];if(o&&o.t!=='road'&&!B[o.t].lm&&!B[o.t].hist&&!o.r){removeObj(o);gone++}}
  if(S.t-yT(...l.at)<8&&l.st.length)toast(`🚆 The Stadtbahn opens ${l.n}, ${l.st[0].n} to ${l.st[l.st.length-1].n}`)}
 if(gone){recompute();GV++}
 SBTR=[];for(const l of op){const n=Math.max(1,Math.round(l.p.length/55));for(let j=0;j<n;j++)SBTR.push({l,p:l.p,f:(j+.5)/n,dir:j%2?-1:1,w:0,v:0,st:l.st.map(o=>o.q)})}}
/* a Stadtbahn train runs up to about 45 km/h between stations, brakes into each and halts half a minute, and turns at the end */
/* a Stadtbahn train turns at the last station on its line, so it never waits out on the open track beyond it */
function sbRun(t,dt){const L_=Math.max(1,t.p.length-1);if(t.w>0){t.w-=dt;t.v=0;return}const lo=t.st.length?t.st[0]:0,hi=t.st.length?t.st[t.st.length-1]:L_;let q=t.f*L_;if(q<lo-.01||q>hi+.01){q=Math.max(lo,Math.min(hi,q));t.f=q/L_}
 let nx=t.dir>0?hi:lo;for(const s_ of t.st)if(t.dir>0?s_>q+.01&&s_<nx:s_<q-.01&&s_>nx)nx=s_;
 const d=Math.abs(nx-q),vt=Math.min(1.25,Math.sqrt(2*.1*d)+.03);let v=t.v||0;v=vt<v?vt:Math.min(vt,v+.1*dt);t.v=v;const st=v*dt;
 if(st>=d){t.f=nx/L_;t.v=0;t.w=nx===lo||nx===hi?10:3;if(nx===lo)t.dir=1;else if(nx===hi)t.dir=-1}else t.f+=t.dir*st/L_}
/* a station with its line out to the edge of the map, in the direction (dla,dlo); left out where no track gets through */
function railTo(la,lo,dir,keep){const st=placeNear('bahnhof',la,lo,10);if(!st)return null;st.bld=null;linkRoad(st);const e=devEdge(la,lo,dir),sd=stationSide(st.x,st.y).tiles.filter(i=>railPas(i)&&!S.b[i]);
 for(const i of sd)if(devLine('rail',i,e))return st;if(!keep)removeObj(st);return keep?st:null}
function posOn(p,q){q=Math.max(0,Math.min(p.length-1.001,q));const k=Math.floor(q),u=q-k,a=p[k],b=p[k+1];return[(a%W)*(1-u)+(b%W)*u,(a/W|0)*(1-u)+(b/W|0)*u]}
function drawCar(x0,y0,x1,y1,w,h,side,top){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*w,ny=dx/l*w*.6;poly([x0+nx,y0+ny,x1+nx,y1+ny,x1+nx,y1+ny-h,x0+nx,y0+ny-h],side);poly([x0-nx,y0-ny,x1-nx,y1-ny,x1-nx,y1-ny-h,x0-nx,y0-ny-h],shade(side,.85));poly([x0+nx,y0+ny-h,x1+nx,y1+ny-h,x1-nx,y1-ny-h,x0-nx,y0-ny-h],top)}
function drawRail(){const z=Z*1.5;for(const tr of TRAINS){const p=tr.p,L_=p.length-1,pos=tr.f*L_,back=tr.dir>0?-1:1;
  for(let c=3;c>=0;c--){const q0=pos+back*c*1.25,q1=q0+back*1.05;if(q0<0||q0>L_||q1<0||q1>L_)continue;const[a,b]=[scr(...posOn(p,q0)),scr(...posOn(p,q1))];if(a[0]<-60||a[0]>vw+60||a[1]<-60||a[1]>vh+60)continue;
   if(c===0){drawCar(a[0],a[1],b[0],b[1],3.2*z,5*z,'#1d1b1a','#3a3530');ctx.fillStyle='#b8322a';ctx.beginPath();ctx.arc(b[0],b[1]-1.5*z,1.6*z,0,7);ctx.fill();ctx.fillStyle='#2a2522';ctx.fillRect(a[0]-1*z,a[1]-11*z,2*z,6*z);
    if(tr.w<=0){ctx.fillStyle='rgba(230,230,225,.55)';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(a[0]-(b[0]-a[0])*.3*i/2,a[1]-13*z-i*3*z,(1.8+i)*z,0,7);ctx.fill()}}}
   else drawCar(a[0],a[1],b[0],b[1],3*z,5.5*z,tr.main?'#2f5a3a':'#6b2f2a','#3a3530')}}
 for(const tr of TRAMS){const p=tr.p,L_=p.length-1,q0=tr.f*L_,q1=q0+(tr.dir>0?-1:1)*1.2;if(q1<0||q1>L_)continue;const[a,b]=[scr(...posOn(p,q0)),scr(...posOn(p,q1))];if(a[0]<-40||a[0]>vw+40||a[1]<-40||a[1]>vh+40)continue;
  if(true)continue;
  if(RES().electric){drawCar(a[0],a[1],b[0],b[1],2.8*z,6*z,'#b8322a','#efe3c8');ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.6,.5*z);ctx.beginPath();ctx.moveTo((a[0]+b[0])/2,(a[1]+b[1])/2-6*z);ctx.lineTo((a[0]+b[0])/2+3*z,(a[1]+b[1])/2-12*z);ctx.stroke()}
  else{drawCar(a[0],a[1],b[0],b[1],2.6*z,5*z,'#2f6a4a','#e8dcc0');const ux=(a[0]-b[0]),uy=(a[1]-b[1]),l=Math.hypot(ux,uy)||1;drawHorse(a[0]+ux/l*6*z,a[1]+uy/l*6*z,ux/l,uy/l,z*.75,HORSE[(p.length)%HORSE.length],performance.now()/90)}}}
function drawTrackLayer(hh){const seg=(M,fn)=>{const done=new Set();for(const[a,ns]of M)for(const b of ns){const k=a<b?a+'_'+b:b+'_'+a;if(done.has(k))continue;done.add(k);const[x0,y0]=scr(a%W,a/W|0),[x1,y1]=scr(b%W,b/W|0);fn(x0,y0,x1,y1)}};
 const ln=(x0,y0,x1,y1,w,c,dash)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([])};ctx.lineCap='round';
 seg(RL,(x0,y0,x1,y1)=>ln(x0,y0,x1,y1,hh*.95,'#9c9282'));seg(RL,(x0,y0,x1,y1)=>ln(x0,y0,x1,y1,hh*.7,'#5a4632',[hh*.12,hh*.22]));
 seg(RL,(x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*hh*.2,ny=dx/l*hh*.2;ln(x0+nx,y0+ny,x1+nx,y1+ny,Math.max(.7,hh*.07),'#3a3530');ln(x0-nx,y0-ny,x1-nx,y1-ny,Math.max(.7,hh*.07),'#3a3530')});
 seg(TL,(x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l*hh*.14,ny=dx/l*hh*.14;ln(x0+nx,y0+ny,x1+nx,y1+ny,Math.max(.6,hh*.05),'#4a4540');ln(x0-nx,y0-ny,x1-nx,y1-ny,Math.max(.6,hh*.05),'#4a4540')})}

/* ===================== the four threads: family, nations, society, foreign; army and invasions; eight endings ===================== */
const EMP=()=>S.emp||(S.emp={cor:0,hun:100,boh:40,ger:20,rev:10,ref:0,rud:40,heir:'rudolf',ffLoyal:0,sisi:50,trial:0,regs:0,inv:null,bpB:0,done:{}});
const cl=v=>Math.max(0,Math.min(100,v));
function E_(o){const e=EMP();for(const k in o){if(k==='prest')S.prest=Math.max(0,S.prest+o[k]);else if(k==='gold')S.stock.gold+=o[k];else if(k==='ten')ten(o[k]);else if(k in REL())relm({[k]:o[k]});else e[k]=k==='bpB'?(e.bpB+o[k]):cl((e[k]||0)+o[k])}}
const STORY=[];
function storyTick(){const e=EMP();if(!$('#ov').hidden)return;
 for(const q of STORY){if(e.done[q.id]||S.t<yT(...q.at))continue;if(q.need&&!q.need()){e.done[q.id]=1;continue}e.done[q.id]=1;
  if(q.auto){if(e.rud>=60){e.heir='rudolf';E_({ref:10,prest:10});evOv('🤴 Rudolf lives','January 1889. Trusted with real work and a voice of his own, Crown Prince Rudolf does not go to Mayerling in despair. He remains your heir, and a liberal reformer.')}
   else{e.heir='ff';S.prest=Math.max(0,S.prest-10);evOv('🕯️ Mayerling','30 January 1889. Crown Prince Rudolf dies at the hunting lodge of Mayerling. Your nephew Franz Ferdinand becomes the new heir.')}return}
  decide(q.who,q.t,`${q.x}<br><br><span class="m">Your advisers await your decision, ${NYC()?'Mr. Mayor':'Majesty'}.</span>`,q.o.map(([l,fx])=>[l,()=>{if(fx.lue){S.laws=S.laws||{};delete fx.lue;S.good=S.t+YEAR}if(q.id==='suff1'&&fx.ref)e.done.suff1ok=1;E_(fx)}]));return}}
/* pressure that builds by itself */
function empireTick(dt){const e=EMP();e.yT=(e.yT||0)+dt;if(e.yT<YEAR/4)return;e.yT=0;
 e.rev=cl(e.rev+((S.hap??1)<.5?4:(S.hap??1)<.65?1:-2)+(S.war?3:0)+(e.ger>70?1:0)-(e.ref>=40?1:0));
 e.hun=cl(e.hun+(e.trial?-.4:e.hun<50?.6:0));if(e.boh<20)e.rev=cl(e.rev+1);
 if(e.rev>=70&&!e.revW){e.revW=1;evOv('⚠️ Revolution in the air','Red flags in Tompkins Square, strikes in the shops of the East Side. If you don\'t make your people happier or grant reforms, they will rise.')}
 if(e.hun<=20&&!e.hunW){e.hunW=1;evOv('⚠️ Brooklyn stirs','Brooklyn\'s aldermen talk of going their own way for good. Treat the city across the river better, or it will never join New York.')}
 if(e.rev>=100)return endGame('revolution');if(e.hun<=0&&S.t>=yT(1880,1))return endGame('hungary')}
/* the army: regiments housed in barracks */
const regCap=()=>S.list.filter(o=>o.t==='kaserne'&&!o.bld&&o.c!==false).length*3+(S.list.some(o=>o.t==='rossauer'&&!o.bld)?4:0);
const REGC={gold:600,iron:15,cloth:10};
function recruit(){const e=EMP();if(e.regs>=regCap()){toast('Build barracks first: each one houses 3 regiments, the Rossauer Kaserne 4');return}for(const g in REGC)if(S.stock[g]<REGC[g]){toast(`A regiment needs ${costStr(REGC)}`);return}for(const g in REGC)S.stock[g]-=REGC[g];e.regs++;sfx('build');toast(`🪖 Regiment raised. You have ${e.regs}`);showCityHall()}
/* invasions */
const ADJ=k=>({prussia:S.t<yT(1871,1)?'Prussian':'German',russia:'Russian',italy:'Italian',france:'French',serbia:'Serbian',ottoman:'Ottoman'})[k];
function invPos(){const e=S.emp;if(!e||!e.inv||!e.inv.march)return null;const f=Math.min(1,(S.t-e.inv.march)/45),st=S.list.find(o=>o.t==='stephan')||{x:W/2,y:H/2},s0={prussia:[W*.5,2],russia:[W-3,H*.3],italy:[W*.3,H-3],france:[2,H*.5],serbia:[W*.8,H-3],ottoman:[W-3,H*.8]}[e.inv.k]||[2,2];return[s0[0]+(st.x-s0[0])*f*.92,s0[1]+(st.y-s0[1])*f*.92]}
function invasionTick(dt){return;const e=EMP();if(S.peace&&!e.inv)return;
 if(!e.inv){if(S.t<yT(1867,1)||(e.invT||0)>S.t||!$('#ov').hidden)return;const foe=NATIONS.map(q=>q[0]).find(k=>REL()[k]<=-60);if(!foe||(S.tension??25)<65)return;
  const n=NATIONS.find(q=>q[0]===foe),theirs=n[3]+Math.floor((Y0+S.t/YEAR-1865)/2);e.inv={k:foe,at:S.t+YEAR/2,str:theirs};e.invT=S.t+YEAR*6;
  evChoice(`⚠️ ${n[1]} masses troops on the border`,`${n[2]} An army of <b>${theirs}</b> gathers. Yours is <b>${armyStr()}</b>. In six months they will march on ${L.name}.<br><br>Raise regiments in ${HALLN()}, or buy peace now.`,[['Prepare to fight',()=>{}],['Offer concessions: −3,000 $, 👑 −20',()=>{S.stock.gold-=3000;S.prest=Math.max(0,S.prest-20);relm({[foe]:45});ten(-15);e.inv=null}]]);return}
 if(!e.inv.march&&S.t>=e.inv.at){e.inv.march=S.t;toast(`⚔️ The ${ADJ(e.inv.k)} army is marching on New York!`)}
 if(e.inv.march&&S.t>=e.inv.march+45&&$('#ov').hidden){const k=e.inv.k,n=NATIONS.find(q=>q[0]===k),mine=armyStr(),th=e.inv.str;e.inv=null;
  if(Math.random()<mine/(mine+th*1.1)){S.prest+=80;relm({[k]:40});ten(-20);evOv(`🛡️ ${L.name} holds`,`Your army of ${mine} throws back the ${ADJ(k)} invasion at the gates of the city. Bells ring from Trinity Church. 👑 +80`)}
  else if(mine<th*.5)endGame('fallen',n[1]);
  else{const own=S.list.filter(o=>!o.h&&!o.bld&&(o.t==='house'||B[o.t].out));own.sort(()=>Math.random()-.5).slice(0,Math.ceil(own.length*.2)).forEach(ruin);S.stock.gold=Math.round(S.stock.gold*.5);S.prest=Math.max(0,S.prest-80);S.infl=S.t+YEAR*3;E_({hun:-15,rev:15});relm({[k]:30});ten(-10);GV++;recompute();
   evOv(`🏴 ${L.name} occupied`,`The ${ADJ(k)} army defeats yours and occupies ${L.name} for months. They take half your treasury, burn a fifth of your buildings and leave three years of inflation behind. 👑 −80`)}}}
function drawInvasion(){const e=S.emp;if(!e||!e.inv||!e.inv.march)return;const f=Math.min(1,(S.t-e.inv.march)/45),st=S.list.find(o=>o.t==='stephan')||{x:W/2,y:H/2},sx0={prussia:[W*.5,2],russia:[W-3,H*.3],italy:[W*.3,H-3],france:[2,H*.5],serbia:[W*.8,H-3],ottoman:[W-3,H*.8]}[e.inv.k]||[2,2];
 const x=sx0[0]+(st.x-sx0[0])*f*.92,y=sx0[1]+(st.y-sx0[1])*f*.92,col={prussia:'#1f2a44',russia:'#3a4a2a',italy:'#5a6448',france:'#2f4f8a',serbia:'#5a3a2a',ottoman:'#8a2f2a'}[e.inv.k]||'#333';
 for(let r=0;r<4;r++)for(let c=0;c<8;c++){const[px,py]=scr(x+c*.7-r*.4,y+r*.7+c*.3);if(px<-20||px>vw+20||py<-20||py>vh+20)continue;const z=Z*1.4,bob=Math.sin(performance.now()/120+c+r)*.4*z;
  ctx.fillStyle=col;ctx.fillRect(px-1*z,py-5.4*z+bob,2*z,3.4*z);ctx.fillRect(px-.8*z,py-2*z,.7*z,2*z);ctx.fillRect(px+.1*z,py-2*z,.7*z,2*z);ctx.fillStyle='#e8c9a8';ctx.beginPath();ctx.arc(px,py-6.3*z+bob,.9*z,0,7);ctx.fill();ctx.fillStyle='#2a2522';ctx.fillRect(px-.9*z,py-7.4*z+bob,1.8*z,.8*z);ctx.strokeStyle='#5a4632';ctx.lineWidth=Math.max(.5,.3*z);ctx.beginPath();ctx.moveTo(px+1.2*z,py-3*z+bob);ctx.lineTo(px+1.6*z,py-9*z+bob);ctx.stroke()}}
/* endings */
function endKey(){{const e=EMP(),ahead=S.prest>bpScore();if((e.cor||0)>=50)return'tammany';return ahead?'golden':'peace'}const e=EMP(),ahead=S.prest>bpScore();if(e.hun<=15)return'hungary';if(S.war)return ahead?'holds':'collapse';if(e.trial&&e.ref>=40)return'federation';if(e.heir==='rudolf'&&e.ref>=30)return'rudolf';return ahead?'golden':'peace'}
const ENDS={tammany:['Tammany\'s town','The city grew, but the machine grew faster. New York is great and gaudy, and its contracts still run through Tammany Hall.'],golden:['The Empire City','New York outgrew every rival. The Brooklyn Bridge, the subway, the skyscrapers of Broadway: the world now measures itself against your city.'],peace:['The second city','You built well, but Chicago built faster. New York is still a giant, yet the future seems to be happening on Lake Michigan.'],revolution:['The city riots','Hungry, ignored and angry, the wards rise. Barricades go up on the Bowery and your administration falls.']};
function endGame(k,who){if(S.lost||S.won)return;S.won=true;S.endK=k;showEnd(who)}

/* ===================== portraits of the great figures ===================== */
const tsarName=()=>S.t<yT(1881,3)?'Tsar Alexander II':S.t<yT(1894,11)?'Tsar Alexander III':'Tsar Nicholas II';
;
const CAST=NY_CAST;const castNow=()=>Object.keys(CAST).filter(k=>{const c=CAST[k],y=Y0+S.t/YEAR;return y>=c.y[0]&&y<=c.y[1]&&(!c.need||c.need())});
const PORTS={};
function portrait(k,w=120,h=140){const key=k+'|'+w+'|'+(k==='tsar'?tsarName():'')+(k==='lueger'&&S.t>=yT(1897,4)?'m':'');if(PORTS[key])return PORTS[key];const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const g=c.getContext('2d');g.scale(2*w/120,2*h/140);
 const P=CAST[k].p,v=x=>typeof x==='function'?x():x,fh=v(P.fh),skin='#ecd0b4';
 g.fillStyle='#d9c9a8';g.beginPath();g.ellipse(60,70,56,66,0,0,7);g.fill();g.strokeStyle='#b8933a';g.lineWidth=3;g.stroke();g.save();g.beginPath();g.ellipse(60,70,54,64,0,0,7);g.clip();
 g.fillStyle=P.coat;g.beginPath();g.moveTo(8,140);g.quadraticCurveTo(12,100,40,94);g.lineTo(80,94);g.quadraticCurveTo(108,100,112,140);g.fill();
 if(P.fem){g.fillStyle=skin;g.beginPath();g.moveTo(36,100);g.quadraticCurveTo(60,112,84,100);g.lineTo(80,94);g.lineTo(40,94);g.fill()}
 if(P.col){g.fillStyle=P.col;g.fillRect(46,92,28,8)}if(P.ep){g.fillStyle='#d9a92a';g.beginPath();g.ellipse(26,104,12,5,-.3,0,7);g.ellipse(94,104,12,5,.3,0,7);g.fill()}
 if(P.sash){g.strokeStyle=P.sash;g.lineWidth=7;g.beginPath();g.moveTo(34,98);g.lineTo(86,140);g.stroke()}if(P.braid){g.strokeStyle='#d9a92a';g.lineWidth=1.5;for(let i=0;i<4;i++){g.beginPath();g.moveTo(48,104+i*8);g.lineTo(72,104+i*8);g.stroke()}}
 if(P.btn){g.fillStyle='#d9a92a';for(let i=0;i<3;i++){g.beginPath();g.arc(60,106+i*10,2,0,7);g.fill()}}if(v(P.chain)){g.strokeStyle='#d9a92a';g.lineWidth=2.5;g.beginPath();g.arc(60,96,20,.3,Math.PI-.3);g.stroke()}
 if(P.bow){g.fillStyle='#f4f1ea';g.fillRect(52,92,16,8);g.fillStyle='#111';g.beginPath();g.moveTo(52,96);g.lineTo(60,93);g.lineTo(60,99);g.fill();g.beginPath();g.moveTo(68,96);g.lineTo(60,93);g.lineTo(60,99);g.fill()}
 g.fillStyle=skin;g.fillRect(52,80,16,16);g.beginPath();g.ellipse(60,60,P.fem?17:19,P.fem?22:24,0,0,7);g.fill();g.beginPath();g.ellipse(41,62,3,5,0,0,7);g.ellipse(79,62,3,5,0,0,7);g.fill();
 g.fillStyle=P.hair;const st=P.st;
 if(st==='braids'){g.beginPath();g.ellipse(60,42,24,14,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(60,34,22,9,0,0,7);g.fill();g.strokeStyle=shade(P.hair,1.4);g.lineWidth=1.5;for(let i=0;i<5;i++){g.beginPath();g.arc(42+i*9,34,4,0,Math.PI);g.stroke()}g.beginPath();g.ellipse(40,66,6,16,.2,0,7);g.ellipse(80,66,6,16,-.2,0,7);g.fill()}
 else if(st==='bald'){g.beginPath();g.ellipse(60,48,20,8,0,Math.PI,0);g.fill()}
 else if(st==='crew'){g.beginPath();g.ellipse(60,42,19,10,0,Math.PI,0);g.fill()}
 else if(st==='curly'){for(let i=0;i<7;i++){g.beginPath();g.arc(42+i*6,40+Math.abs(3-i)*2,7,0,7);g.fill()}}
 else{g.beginPath();g.ellipse(60,42,21,13,0,Math.PI,0);g.fill();if(st==='side'){g.beginPath();g.moveTo(40,44);g.quadraticCurveTo(52,34,78,40);g.lineTo(80,46);g.fill()}}
 g.fillStyle='#2a1d14';g.beginPath();g.arc(52,60,1.8,0,7);g.arc(68,60,1.8,0,7);g.fill();g.strokeStyle=shade(P.hair,.9);g.lineWidth=2;g.beginPath();g.moveTo(47,55);g.lineTo(56,54);g.moveTo(64,54);g.lineTo(73,55);g.stroke();
 g.strokeStyle='#b8957a';g.lineWidth=1.5;g.beginPath();g.moveTo(60,60);g.lineTo(58,68);g.lineTo(61,69);g.stroke();
 if(!fh||P.fem){g.strokeStyle='#a0605a';g.lineWidth=1.5;g.beginPath();g.moveTo(55,75);g.quadraticCurveTo(60,77,65,75);g.stroke()}
 g.fillStyle=P.hair==='#8a8378'?'#e8e2d6':shade(P.hair,1.1);
 if(fh==='full'){g.beginPath();g.moveTo(41,62);g.quadraticCurveTo(42,92,60,94);g.quadraticCurveTo(78,92,79,62);g.quadraticCurveTo(70,78,60,74);g.quadraticCurveTo(50,78,41,62);g.fill()}
 if(fh==='mutton'){g.beginPath();g.moveTo(41,58);g.quadraticCurveTo(38,84,52,80);g.lineTo(50,64);g.fill();g.beginPath();g.moveTo(79,58);g.quadraticCurveTo(82,84,68,80);g.lineTo(70,64);g.fill()}
 if(fh==='goatee'){g.beginPath();g.moveTo(57,78);g.lineTo(63,78);g.lineTo(60,90);g.fill()}
 if(fh&&fh!=='full'||fh==='full'){g.beginPath();if(fh==='upturned'){g.moveTo(60,71);g.quadraticCurveTo(48,76,42,64);g.quadraticCurveTo(50,72,60,69);g.quadraticCurveTo(70,72,78,64);g.quadraticCurveTo(72,76,60,71)}else if(fh==='walrus'){g.ellipse(60,73,13,5,0,0,7)}else{g.ellipse(60,72,11,3.5,0,0,7)}g.fill()}
 if(P.glasses){g.strokeStyle='#2a2522';g.lineWidth=1.2;g.beginPath();g.arc(52,60,5,0,7);g.moveTo(73,60);g.arc(68,60,5,0,7);g.moveTo(57,60);g.lineTo(63,60);g.stroke()}
 if(P.hat==='pickel'){g.fillStyle='#1d1b1a';g.beginPath();g.ellipse(60,42,22,12,0,Math.PI,0);g.fill();g.fillRect(38,40,44,5);g.fillStyle='#d9a92a';g.beginPath();g.moveTo(57,30);g.lineTo(63,30);g.lineTo(60,16);g.fill();g.beginPath();g.arc(60,37,4,0,7);g.fill()}
 if(P.acc==='stars'){g.fillStyle='#fffbe8';for(const[x,y]of[[46,36],[60,31],[74,36],[53,44],[67,44]]){g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?1.2:3;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.fill()}}
 g.restore();PORTS[key]=c.toDataURL();return PORTS[key]}
let AI_OK=false;
function decide(who,title,text,opts){evChoice(title,text,opts)}
function audienceList(){return''}

/* ===================== the Brooklyn Bridge and the skyscrapers ===================== */
function bbSpan(o){if(o._span!==undefined)return o._span;let best=null;const ok=i=>S.tiles[i]===WATER||S.tiles[i]===BRIDGE;
 for(const[x,y]of perim(o)){if(!inb(x,y)||ok(y*W+x))continue;for(const[dx,dy]of D4){let cx=x+dx,cy=y+dy;const run=[];while(inb(cx,cy)&&ok(cy*W+cx)&&run.length<60){run.push(cy*W+cx);cx+=dx;cy+=dy}
  if(run.length>=6&&inb(cx,cy)&&!ok(cy*W+cx)&&(!best||run.length<best.run.length))best={run,a:y*W+x,e:cy*W+cx}}}return o._span=best}
function finishBridge(o){const b=bbSpan(o);if(!b)return;for(const i of b.run){S.tiles[i]=BRIDGE;tcolSet(i)}for(const e of[b.a,b.e])if(!S.b[e])place('road',e%W,e/W|0,0,true);GV++;recompute()}
function granite(x,y,w,d,H,arches,t){const c1='#c4b89c',c2='#a39579',c3='#d6cbb0';poly([x-w,y,x,y+d,x,y+d-H,x-w,y-H],c1);poly([x,y+d,x+w*.55,y+d*.45,x+w*.55,y+d*.45-H,x,y+d-H],c2);poly([x-w,y-H,x,y+d-H,x+w*.55,y+d*.45-H,x-w*.45,y-d*.55-H],c3);
 ctx.fillStyle='#8a7d64';ctx.fillRect(x-w,y-H-.06*t,w*1.55,.06*t);
 if(arches)for(const f of[.28,.72]){const ax=x-w+w*f,ay=y+d*f-.25*t,aw=w*.17,ah=arches;ctx.fillStyle='#3a3530';ctx.beginPath();ctx.moveTo(ax-aw,ay);ctx.lineTo(ax-aw,ay-ah*.7);ctx.quadraticCurveTo(ax-aw,ay-ah,ax,ay-ah*1.08);ctx.quadraticCurveTo(ax+aw,ay-ah,ax+aw,ay-ah*.7);ctx.lineTo(ax+aw,ay);ctx.fill()}}
function drawBBridges(){const t=32*Z,dk=16*Z*.38;for(const o of S.list){if(o.t!=='reichsbruecke'||o.r)continue;const sp=bbSpan(o);if(!sp)continue;const p=o.bld?siteProg(o):1,run=sp.run,n=run.length;
 const pt=i=>{const[x,y]=scr(i%W,i/W|0);return[x,y]},A=pt(sp.a),Bq=pt(sp.e),T1=pt(run[Math.round(n*.24)]),T2=pt(run[Math.round(n*.76)]);
 if(Math.max(A[0],Bq[0])<-200||Math.min(A[0],Bq[0])>vw+200||Math.max(A[1],Bq[1])<-300||Math.min(A[1],Bq[1])>vh+300)continue;
 const H=4.2*t*Math.min(1,p/.55),Hc=H-.15*t,dx=Bq[0]-A[0],dy=Bq[1]-A[1],L_=Math.hypot(dx,dy)||1,nx=-dy/L_,ny=dx/L_*.5,w=.95*t,d=.45*t;
 if(p>.3)granite(Bq[0],Bq[1],.7*t,.35*t,1.4*t,0,t);
 const cable=(s_,side)=>{const off=[nx*s_*t*.42,ny*s_*t*.42],a=[A[0]+off[0],A[1]+off[1]-1.4*t],b=[Bq[0]+off[0],Bq[1]+off[1]-1.4*t],t1=[T1[0]+off[0],T1[1]+off[1]-Hc],t2=[T2[0]+off[0],T2[1]+off[1]-Hc],m=[(t1[0]+t2[0])/2,(t1[1]+t2[1])/2];
  ctx.strokeStyle=side?'#3f444a':'#5a5f66';ctx.lineWidth=Math.max(1,t*.07);ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo((a[0]+t1[0])/2,(a[1]+t1[1])/2+.9*t,...t1);ctx.quadraticCurveTo(m[0],m[1]+H*1.55,...t2);ctx.quadraticCurveTo((t2[0]+b[0])/2,(t2[1]+b[1])/2+.9*t,...b);ctx.stroke();
  ctx.lineWidth=Math.max(.5,t*.025);ctx.strokeStyle='rgba(70,75,82,.75)';ctx.beginPath();
  for(let k=1;k<14;k++){const u=k/14,x=t1[0]+(t2[0]-t1[0])*u,deckY=T1[1]+(T2[1]-T1[1])*u+off[1]-dk,cy=(1-u)*(1-u)*t1[1]+2*u*(1-u)*(m[1]+H*1.55)+u*u*t2[1];ctx.moveTo(x,cy);ctx.lineTo(x,deckY)}
  for(const[tp,base]of[[t1,T1],[t2,T2]])for(let k=1;k<=5;k++){for(const sg of[-1,1]){const u=k/5*.42*sg,x=base[0]+dx*u,y=base[1]+dy*u+off[1]-dk;ctx.moveTo(tp[0],tp[1]+.2*t);ctx.lineTo(x,y)}}ctx.stroke()};
 if(p>.6)cable(-1,1);
 for(const T of[T1,T2])if(H>.2*t)granite(T[0]+w*.3,T[1]+d*.2,w,d,H,H>2*t?1.9*t:0,t);
 if(p>.6)cable(1,0)}}
function drawAnchorage(cx,cy,hw,hh){const t=hw/4;granite(cx+.3*t,cy+.3*t,1.2*t,.6*t,1.5*t,0,t);for(let i=0;i<3;i++){const x=cx-.7*t+i*.5*t,y=cy+.2*t+i*.15*t;ctx.fillStyle='#3a3530';ctx.beginPath();ctx.moveTo(x-.13*t,y);ctx.lineTo(x-.13*t,y-.5*t);ctx.quadraticCurveTo(x,y-.75*t,x+.13*t,y-.5*t);ctx.lineTo(x+.13*t,y);ctx.fill()}}
/* skyscrapers */
const skyYear=()=>Y0+S.t/YEAR;
const SKY={tower:null,
 parkrow:{w:1.3,d:.9,H:7.2,c:5,top:'twin'},singer:{pod:[1.6,1.5,3.2,1],w:.62,d:.62,H:10,c:8,top:'bulb'},
 metlife:{pod:[1.5,1.2,2.6,12],w:.85,d:.85,H:10.5,c:12,top:'campanile'},woolworth:{pod:[1.6,1.3,4.4,12],w:.85,d:.8,H:12,c:12,top:'gothic'}};
function skyTop(kind,x,y,w,t,col){if(kind==='twin'){for(const dx of[-.55,.55]){const cx=x+dx*w*t;ctx.fillStyle='#d9cdb6';ctx.fillRect(cx-.2*t,y-.6*t,.4*t,.6*t);ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.ellipse(cx,y-.6*t,.24*t,.36*t,0,Math.PI,0);ctx.fill();ctx.fillStyle='#d9a92a';ctx.fillRect(cx-.02*t,y-1.1*t,.04*t,.2*t)}return}
 if(kind==='bulb'){ctx.fillStyle='#4f5f58';ctx.beginPath();ctx.moveTo(x-w*t*1.05,y);ctx.quadraticCurveTo(x-w*t*1.25,y-1.1*t,x,y-1.7*t);ctx.quadraticCurveTo(x+w*t*1.25,y-1.1*t,x+w*t*1.05,y);ctx.fill();ctx.fillStyle='#efe5cc';ctx.fillRect(x-.12*t,y-2.2*t,.24*t,.55*t);ctx.fillStyle='#4f5f58';ctx.beginPath();ctx.moveTo(x-.16*t,y-2.2*t);ctx.lineTo(x,y-2.6*t);ctx.lineTo(x+.16*t,y-2.2*t);ctx.fill();ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();ctx.moveTo(x,y-2.6*t);ctx.lineTo(x,y-3.1*t);ctx.stroke();poly([x,y-3.1*t,x+.3*t,y-3*t,x,y-2.9*t],'#b8322a');return}
 if(kind==='campanile'){ctx.fillStyle='#efe9dc';ctx.fillRect(x-w*t*.75,y-.9*t,w*t*1.5,.9*t);ctx.fillStyle='#2a2522';for(const dx of[-.35,0,.35]){ctx.fillRect(x+dx*w*t-.06*t,y-.75*t,.12*t,.55*t)}ctx.fillStyle='#c9b995';ctx.beginPath();ctx.moveTo(x-w*t*.85,y-.9*t);ctx.lineTo(x,y-2.6*t);ctx.lineTo(x+w*t*.85,y-.9*t);ctx.fill();ctx.fillStyle='#d9a92a';ctx.beginPath();ctx.arc(x,y-2.75*t,.14*t,0,7);ctx.fill();ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.arc(x-w*t*.4,y+1.4*t,.28*t,0,7);ctx.fill();ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();ctx.moveTo(x-w*t*.4,y+1.4*t);ctx.lineTo(x-w*t*.4,y+1.22*t);ctx.moveTo(x-w*t*.4,y+1.4*t);ctx.lineTo(x-w*t*.28,y+1.45*t);ctx.stroke();return}
 if(kind==='gothic'){ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.moveTo(x-w*t*.95,y);ctx.lineTo(x,y-2.4*t);ctx.lineTo(x+w*t*.95,y);ctx.fill();ctx.fillStyle='#4f7a6a';ctx.beginPath();ctx.moveTo(x,y-2.4*t);ctx.lineTo(x+w*t*.95,y);ctx.lineTo(x+w*t*.3,y);ctx.fill();
  ctx.fillStyle='#ece6d8';for(const dx of[-1,1])for(const k of[0,1]){const px=x+dx*w*t*(.95-k*.45),py=y-k*.5*t;ctx.beginPath();ctx.moveTo(px-.07*t,py);ctx.lineTo(px,py-.7*t);ctx.lineTo(px+.07*t,py);ctx.fill()}ctx.strokeStyle='#d9a92a';ctx.lineWidth=Math.max(.6,t*.04);ctx.beginPath();ctx.moveTo(x,y-2.4*t);ctx.lineTo(x,y-3*t);ctx.stroke();return}
 if(kind==='mansard'){ctx.fillStyle='#4a4f55';ctx.beginPath();ctx.moveTo(x-w*t*1.05,y);ctx.lineTo(x-w*t*.85,y-.7*t);ctx.lineTo(x+w*t*.85,y-.7*t);ctx.lineTo(x+w*t*1.05,y);ctx.fill();return}
 if(kind==='dome'){ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.ellipse(x,y,w*t*.5,.8*t,0,Math.PI,0);ctx.fill();ctx.fillStyle='#d9a92a';ctx.fillRect(x-.03*t,y-1.2*t,.06*t,.4*t);return}
 ctx.fillStyle='#7a5532';ctx.fillRect(x-.18*t,y-.55*t,.36*t,.45*t);ctx.beginPath();ctx.moveTo(x-.2*t,y-.55*t);ctx.lineTo(x,y-.8*t);ctx.lineTo(x+.2*t,y-.55*t);ctx.fill()}
function drawSky_old(k,cx,cy,hw,hh,o){const t=hw/4,t2=hh/4,tx=t>=4.5,fh=.33*t;poly([cx-hw*.92,cy,cx,cy-hh*.92,cx+hw*.92,cy,cx,cy+hh*.92],'#bdb4a2');let sp=SKY[k];
 if(k==='tower'){const v=(hs(o.x*31+o.y*17)*4)|0,fl=Math.round(9+Math.max(0,Math.min(16,(skyYear()-1888)*.7)));sp={w:1.25,d:1.25,H:fl*fh/t,c:[3,6,12,9][v],top:['flat','mansard','dome','flat'][v]}}
 let base=0;if(sp.pod){const[pw,pd,ph,pc]=sp.pod;prismTex(cx,cy,pw,pd,ph*t,pc,Math.round(ph*t/fh),'#4a4540',.04*t,t,t2,tx);base=ph*t}
 const H=sp.H*t;prismTex(cx,cy-base,sp.w,sp.d,H,sp.c,Math.round(H/fh),'#4a4540',.04*t,t,t2,tx);
 if(k==='woolworth'&&tx){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(.5,t*.04);for(let i=-3;i<=3;i++){const x=cx-sp.w*t*.5+i*sp.w*t*.13,y=cy-base+sp.d*t2*.5+i*.02*t;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-H);ctx.stroke()}}
 skyTop(sp.top,cx,cy-base-H-.04*t,sp.w,t)}

/* ===================== epidemics, immigrant liners and airships ===================== */
function startEpidemic(name,sev){if(S.epi)return;S.histU0=S.histU0||S.histU;const prot=(cnt('spital')?.45:1)*(RES().hygiene?.6:1)*(S.list.some(o=>o.t==='brunnen'&&!o.bld)?.75:1);
 S.epi={n:name,t0:S.t,t1:S.t+YEAR*.45,sev,dead:0,cost:0,prot,pop0:dispPop()};
 evOv(`🦠 ${name}!`,`It starts in the crowded tenements by the docks and spreads street by street. For months the harbour is under quarantine, taxes collapse and the city pays for doctors, disinfection and burials.${prot<.6?' Your hospitals and health measures will save many lives.':' Without hospitals and a health board, this will be terrible.'}`)}
function epiTick(dt,st){const e=S.epi;
 if(!e){if(S.histU0&&S.histU<S.histU0)S.histU=Math.min(S.histU0,S.histU+S.histU0*.15*dt/YEAR);
  const sh=homelessShare();if(sh>.15&&S.t>yT(1866,9)&&Math.random()<dt*sh*.8/YEAR)startEpidemic('Cholera in the tenements',.08);return}
 if(S.t>=e.t1){const lost=Math.max(0,e.pop0-dispPop());S.prest=Math.max(0,S.prest-Math.round(e.dead*(S.mult||1)/2000));
  evOv(`${e.n}: it is over`,`The epidemic has passed. <b>About ${fmtPop(e.dead*(S.mult||1))} people died.</b> It cost the city ${money(Math.round(e.cost),1)} in doctors and quarantine, on top of months of lost taxes and trade. ${e.prot<.6?'Your hospitals kept it from being worse.':'Hospitals, clean water and a health board would have saved thousands.'}`);S.epi=null;return}
 const crowd=1+homelessShare()*2,r=e.sev*e.prot*crowd*dt/(e.t1-e.t0);let d=0;
 for(const o of S.list){if(o.t!=='house'||o.r||o.bld)continue;const cov=COV.hosp&&COV.hosp[o.y*W+o.x]?.5:1,poor=o.lvl<=2?1.4:o.lvl>=5?.5:1;o.epA=(o.epA||0)+o.pop*r*cov*poor;while(o.epA>=1&&o.pop>1){o.pop--;o.epA-=1;d++}}
 const hd=S.histU*r*1.1;S.histU=Math.max(0,S.histU-hd);d+=hd;const nd=(S.newc||0)*r*1.6;S.newc=Math.max(0,(S.newc||0)-nd);d+=nd;e.dead+=d;
 const c=(2.5+S.list.filter(o=>o.t==='spital'&&!o.bld).length*1.5)*dt;st.gold-=c;e.cost+=c}
/* immigrants */
const homelessShare=()=>{const p=popTotals(),tot=(S.histU||0)+Ps(p,1)+(S.newc||0);return tot?(S.newc||0)/tot:0};
const LINERS=[[1865,'SS Great Eastern',1,'#1d1b1a','#1d1b1a',1],[1866,'SS City of Paris',1,'#1d1b1a','#c9a227',1],[1872,'RMS Oceanic',1,'#1d1b1a','#c9a227',1],[1881,'SS City of Rome',3,'#1d1b1a','#c9a227',1],[1889,'RMS Teutonic',2,'#1d1b1a','#c9a227',0],
 [1889,'SS City of New York',3,'#1d1b1a','#b8322a',0],[1897,'SS Kaiser Wilhelm der Grosse',4,'#1d1b1a','#c9a227',0],[1901,'RMS Celtic',1,'#1d1b1a','#c9a227',0],[1907,'RMS Lusitania',4,'#1d1b1a','#b8322a',0],[1907,'RMS Mauretania',4,'#1d1b1a','#b8322a',0],[1911,'RMS Olympic',4,'#1d1b1a','#c9a227',0],[1913,'SS Imperator',3,'#1d1b1a','#c9a227',0]];
let IMMS=[],IMMPATH=null,IMMDOCK=-1;
function immDock(){const ellis=S.t>=yT(1892,1),[la,lo]=ellis?[40.6995,-74.0396]:[40.7033,-74.0170],e=prj(L,la,lo),[gx,gy]=gt(e[0],e[1]);let best=-1,bd=1e9;
 for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){const x=gx+dx,y=gy+dy;if(!inb(x,y)||S.tiles[y*W+x]!==WATER)continue;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=y*W+x}}return best}
function immPath(){const dk=immDock();if(dk===IMMDOCK&&IMMPATH)return IMMPATH;IMMDOCK=dk;if(dk<0)return IMMPATH=[];const par=new Map([[dk,-1]]),q=[dk],dist=new Map([[dk,0]]);let far=dk;
 for(let h=0;h<q.length;h++){const k=q[h],x=k%W,y=k/W|0;if(x<=1||y<=1||x>=W-2||y>=H-2){far=k;break}for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(!inb(nx,ny)||par.has(n)||S.tiles[n]!==WATER)continue;par.set(n,k);q.push(n)}}
 const p=[];let c=far;while(c!==-1&&c!==undefined){p.push(c);c=par.get(c)}const sm=[];for(let i=0;i<p.length;i+=2)sm.push(p[i]);if(sm[sm.length-1]!==dk)sm.push(dk);return IMMPATH=sm}
function skyCap(){return RES().kaplan?1+Math.min(.8,Math.max(0,(Y0+S.t/YEAR-1889)*.04)):1}
/* a ready-made skyline to look around in */
function demo1913(){UNLOCKALL=true;try{S.t=yT(1913,6);S.ev=EVENTS.findIndex(e=>e[0]>S.t);if(S.ev<0)S.ev=EVENTS.length;S.limit=2;for(const t of TECH)RES()[t[0]]=1;S.prest=900;
 Object.assign(S.stock,{gold:60000,bricks:250,stone:250,wood:250,iron:200,coal:200,food:250,beer:200,wine:200,cloth:200});S.crT=S.robT=S.audT=S.immT=S.t+YEAR*2;S.q=Object.fromEntries(QUESTS.map(q=>[q.id,{st:'done'}]));EMP().done=Object.fromEntries(STORY.map(q=>[q.id,1]));
 for(const k of['votiv','stadtpark','tiergarten','brunnen','reichsbruecke','liberty','oper','musikverein','imperial','universitaet','flatiron','parkrow','singer','metlife','woolworth','burgtheater','epstein','rossauer']){let o=S.list.find(q=>q.t===k);const e=lmEntry(k);if(!o&&e)o=placeNear(k,e.lat,e.lon,20);if(!o)continue;o.bld=null;linkRoad(o);if(k==='reichsbruecke')finishBridge(o)}
 const spots=[[40.7065,-74.0095],[40.7085,-74.0075],[40.7050,-74.0060],[40.7100,-74.0100],[40.7125,-74.0105],[40.7150,-74.0060],[40.7185,-74.0040],[40.7475,-73.9890],[40.7505,-73.9860],[40.7550,-73.9850],[40.7580,-73.9800],[40.7445,-73.9910]];
 for(const[la,lo]of spots){const o=placeNear('tower',la,lo,8);if(o){linkRoad(o)}}
 for(const[m,la,lo]of[['coalyard',40.7180,-73.9610],['kraftwerk',40.7280,-73.9760],['kraftwerk',40.7520,-73.9950],['spital',40.7400,-73.9780],['feuerwehr',40.7200,-73.9950]]){const o=placeNear(m,la,lo,12);if(o)linkRoad(o)}
 S.elx=[];for(let i=0;i<W*H;i++)if(S.b[i]&&S.b[i].t==='road')S.elx.push(i);
 let n=0;for(const o of S.list)if(o.t==='house'&&o.h&&o.lvl===4){if(n%3===0)o.lvl=5;if(n%2===0)hEra(o,1868+(n*7%45));n++}
 for(let k=0;k<8;k++){setMode('house');if(!findSpot())break;const[gx,gy]=pend.split(',').map(Number);tryBuild(gx,gy);setMode(null);const o=S.list[S.list.length-1];if(o&&o.t==='house'){o.bld=null;o.lvl=4+(k%2);o.pop=maxPop(o);hEra(o,1880+k*4);linkRoad(o)}}
 pend=null;confHide&&confHide();}finally{UNLOCKALL=false}GV++;recompute();const w=S.list.find(o=>o.t==='woolworth')||S.list.find(o=>o.t==='stephan');Z=.55;centerOn(w.x+4,w.y+8);gGV=-1;
 evOv('New York, June 1913','The Woolworth Building has just opened, the tallest building in the world. Lower Manhattan bristles with towers, the Brooklyn Bridge carries trams to Brooklyn, and liners crowd the harbour.<br><br>Look around: zoom out over Lower Manhattan, follow Broadway up to Madison Square and the Flatiron, and over to the Statue of Liberty.')}
function immTick(dt,st){histRoomTick(dt);{const f=skyCap();for(let l=2;l<=6;l++)LV[l].max=Math.round(LVB[l]*f)}const y=Y0+S.t/YEAR;if(!S.immT)S.immT=S.t+YEAR*.15;
 if(NYC()&&S.t>=S.immT&&!S.epi&&$('#ov').hidden){const gap=y<1880?YEAR/3.5:y<1900?YEAR/5:y<1915?YEAR/8:YEAR/2;S.immT=S.t+gap*(.7+Math.random()*.6);const cand=LINERS.filter(l=>l[0]<=y&&l[0]>=y-14),l=(cand.length?cand:LINERS.filter(l=>l[0]<=y))[Math.random()*(cand.length||1)|0],p=immPath();
  if(p.length>3){const pax=Math.round((y<1880?8:y<1900?12:18)*(.8+Math.random()*.4));IMMS.push({l,p,f:0,ph:'in',pax,w:0});toast(`🚢 The ${l[1]} brings immigrants`)}}
 for(const s_ of IMMS){const L_=s_.p.length-1;if(s_.ph==='in'){s_.f+=dt*1.6/L_;if(s_.f>=1){s_.f=1;s_.ph='dock';s_.w=8;S.newc=(S.newc||0)+s_.pax;float(s_.p[L_]%W,s_.p[L_]/W|0,`🧳 +${fmtPop(s_.pax*(S.mult||1))}`);
   toast(`🧳 ${fmtPop(s_.pax*(S.mult||1))} immigrants land at ${S.t>=yT(1892,1)?'Ellis Island':'Castle Garden'}`)}}
  else if(s_.ph==='dock'){s_.w-=dt;if(s_.w<=0)s_.ph='out'}else{s_.f-=dt*1.6/L_;if(s_.f<=0)s_.dead=1}}
 IMMS=IMMS.filter(s_=>!s_.dead);
 if(S.newc>0){let room=0;const hs_=S.list.filter(o=>o.t==='house'&&!o.h&&!o.r&&!o.bld&&o.pop<maxPop(o));for(const o of hs_){if(S.newc<1)break;if(Math.random()<dt*.6){o.pop++;S.newc--}}
  /* newcomers nobody houses drift into the old city; a new game has no old city, so they move on */
  {const a=S.newc*.3*dt/YEAR;S.newc-=a;if(!S.scratch)S.histU=(S.histU||0)+a}
  st.food=Math.max(0,st.food-S.newc*.03*dt);S.unrest=(S.unrest||0)+homelessShare()*dt*.2}}
function drawLiner(s_){const p=s_.p,L_=p.length-1,pos=s_.f*L_,k=Math.min(L_-1,Math.floor(pos)),u=pos-k,a=p[k],b=p[Math.min(L_,k+1)],x=(a%W)*(1-u)+(b%W)*u,y=(a/W|0)*(1-u)+(b/W|0)*u,[sx,sy]=scr(x,y);
 if(sx<-120||sx>vw+120||sy<-120||sy>vh+120)return;const a2=p[Math.max(0,k-1)],[px,py]=scr(a2%W,a2/W|0),[qx,qy]=scr(b%W,b/W|0);let dx=qx-px,dy=qy-py;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;if(s_.ph==='out'){dx=-dx;dy=-dy}
 const t_=32*Z,z=t_/4.5,Lh=(s_.l[2]>=4?6:s_.l[2]>=2?4.6:3.6)*t_,w=.5*t_,nx=-dy,ny=dx*.5,P=(f,o,h=0)=>[sx+dx*Lh*f+nx*w*o,sy+dy*Lh*f+ny*w*o-h];
 ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(sx-dx*Lh*.55,sy-dy*Lh*.55,Lh*.4,3*z,Math.atan2(dy,dx),0,7);ctx.fill();
 poly([...P(-.5,-1),...P(.42,-1),...P(.55,0),...P(.42,1),...P(-.5,1)],'#7a2a22');poly([...P(-.5,-1,0),...P(.42,-1,0),...P(.55,0,0),...P(.55,0,3.5*z),...P(.42,-1,3.5*z),...P(-.5,-1,3.5*z)],s_.l[3]);
 poly([...P(-.5,1,0),...P(-.5,-1,0),...P(-.5,-1,3.5*z),...P(-.5,1,3.5*z)],shade(s_.l[3],.8));poly([...P(-.5,-1,3.5*z),...P(.42,-1,3.5*z),...P(.55,0,3.5*z),...P(.42,1,3.5*z),...P(-.5,1,3.5*z)],'#e9e1d0');
 poly([...P(-.35,-.6,3.5*z),...P(.25,-.6,3.5*z),...P(.25,.6,3.5*z),...P(-.35,.6,3.5*z),...P(-.35,.6,6*z),...P(.25,.6,6*z),...P(.25,-.6,6*z),...P(-.35,-.6,6*z)].slice(0,16),'#f4f1ea');
 ctx.fillStyle='#2a2522';for(let i=0;i<8;i++){const[hx,hy]=P(-.45+i*.11,-1,2.2*z);ctx.fillRect(hx,hy,.9*z,.9*z)}
 const nf=s_.l[2];for(let i=0;i<nf;i++){const f=nf===1?0:-.25+i*.5/(nf-1),[fx,fy]=P(f,0,6*z);ctx.fillStyle=s_.l[4];ctx.fillRect(fx-1.3*z,fy-7*z,2.6*z,7*z);ctx.fillStyle='#1d1b1a';ctx.fillRect(fx-1.3*z,fy-7*z,2.6*z,1.6*z);
  if(s_.ph!=='dock'){ctx.fillStyle='rgba(90,90,90,.35)';for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(fx-dx*(4+j*5)*z,fy-9*z-j*3*z,(2+j)*z,0,7);ctx.fill()}}}
 if(s_.l[5]){ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.6,.5*z);for(const f of[-.4,.38]){const[mx,my]=P(f,0,3.5*z);ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx,my-16*z);ctx.stroke()}}}
/* airships */
let AIRS=[];
function airTick(dt){const y=Y0+S.t/YEAR;if(y<1906)return;if(!S.airT)S.airT=S.t+30;if(S.t>=S.airT&&AIRS.length<2){S.airT=S.t+(y<1910?90:45)*(.6+Math.random()*.8);const fromW=Math.random()<.5;AIRS.push({x:fromW?-10:W*.3+Math.random()*W*.5,y:fromW?H*.3+Math.random()*H*.4:-10,vx:fromW?1:.15,vy:fromW?.15:1,big:y>=1910})}
 for(const a of AIRS){a.x+=a.vx*dt*.9;a.y+=a.vy*dt*.9}AIRS=AIRS.filter(a=>a.x<W+20&&a.y<H+20)}
function drawAirships(){for(const a of AIRS){const[sx,sy]=scr(a.x,a.y),t_=32*Z,z=t_/4,alt=6*t_,Lh=(a.big?5:3.6)*t_,ang=Math.atan2(a.vy*16+a.vx*16,(a.vx-a.vy)*32);if(sx<-200||sx>vw+200||sy-alt<-100||sy>vh+200)continue;
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(sx,sy,Lh*.6,Lh*.14,ang*.5,0,7);ctx.fill();
 const cx=sx,cy=sy-alt;ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.cos(ang)>0?.15:-.15);const g=ctx.createLinearGradient(0,-Lh*.2,0,Lh*.2);g.addColorStop(0,'#e9e6df');g.addColorStop(1,'#9a968c');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,Lh*.6,Lh*.15,0,0,7);ctx.fill();
 ctx.strokeStyle='rgba(80,75,65,.4)';ctx.lineWidth=Math.max(.5,z*.3);for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*Lh*.15,-Lh*.14);ctx.lineTo(i*Lh*.15,Lh*.14);ctx.stroke()}
 const back=Math.cos(ang)>0?-1:1;ctx.fillStyle='#8a867c';ctx.beginPath();ctx.moveTo(back*Lh*.5,0);ctx.lineTo(back*Lh*.66,-Lh*.16);ctx.lineTo(back*Lh*.62,0);ctx.lineTo(back*Lh*.66,Lh*.16);ctx.fill();
 ctx.fillStyle='#4a4540';ctx.fillRect(-Lh*.12,Lh*.14,Lh*.24,Lh*.06);ctx.restore()}}

let WALLAT=null,TRAF=[],TRAFK=-1,TPOOL=null;
const gscr=(q,hw,hh)=>{const fx=(G2*q[1]+W-1+G2*q[0])/2,fy=(G2*q[1]+W-1-G2*q[0])/2;return[(fx-fy)*hw+cam.x,(fx+fy)*hh+cam.y+hh]};
/* ---------- the city wall: continuous rampart, bastions, ditch and gates ---------- */
function buildWall(rs){const Rg=L.ring,pts=[];
 for(let k=0;k<Rg.length-1;k++){const[a,b]=Rg[k],[c,d]=Rg[k+1],n=Math.max(1,Math.ceil(Math.hypot(c-a,d-b)/(TU*.55)));for(let q=0;q<n;q++)pts.push([a+(c-a)*q/n,b+(d-b)*q/n])}
 const N=pts.length,off=2.4*TU,th=.5*TU,bat=.14*TU,smp=[];
 for(let k=0;k<N;k++){const p0=pts[(k-4+N)%N],p1=pts[(k+4)%N];let nx=-(p1[1]-p0[1]),ny=p1[0]-p0[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const q=pts[k];
  if(!inPoly(q[0]+nx*TU*.6,q[1]+ny*TU*.6,Rg)){nx=-nx;ny=-ny}const c=[q[0]+nx*off,q[1]+ny*off],at=d=>[c[0]-nx*d,c[1]-ny*d];
  smp.push({c,n:[nx,ny],o:at(th),i:at(-th),ot:at(th-bat),it:at(-th+bat*.4),d:at(th+.85*TU)})}
 const tileOf=q=>{const[x,y]=gt(q[0],q[1]);return inb(x,y)?y*W+x:-1};
 const land=j=>j>=0&&S.tiles[j]!==WATER&&S.tiles[j]!==BRIDGE,isRoadT=j=>j>=0&&S.b[j]&&S.b[j].t==='road';
 const cellsOf=ts=>{const out=[];for(const j of ts){if(j<0)continue;const x=(j%W)&~1,y=(j/W|0)&~1;if(!out.some(c=>c[0]===x&&c[1]===y))out.push([x,y])}return out};
 let nw=0;const put=(x,y)=>{const b0=S.b[y*W+x];if(b0&&b0.t==='bastion')return b0;if(!inb(x+1,y+1)||b0)return null;
  if(!footTiles('bastion',x,y).every(([u,v])=>{const k=v*W+u,tt=S.tiles[k];return(tt===GRASS||tt===SAND||tt===FOREST)&&!S.b[k]&&!rs.has(k)}))return null;const ob=place('bastion',x,y,0,true);ob.h=1;nw++;return ob};
 for(const s of smp){const ts=[s.o,s.c,s.i].map(tileOf);s.ti=ts[1];if(ts.some(isRoadT)){s.gate=1;continue}if(!ts.every(land)){s.wet=1;continue}}
 for(let k=0;k<N;k++)if(smp[k].gate){for(const d of[-1,1]){const m=smp[(k+d+N)%N];if(!m.wet)m.gate2=1}}
 for(const s of smp){if(s.gate||s.wet)continue;const ts=[s.o,s.c,s.i].map(tileOf);for(const[x,y]of cellsOf(ts))put(x,y);const ob=S.b[s.ti];s.ob=ob&&ob.t==='bastion'?ob:null}
 for(const s of smp){if(s.gate||s.wet||s.ob||s.ti<0)continue;const x0=s.ti%W,y0=s.ti/W|0;let best=null,bd=9;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const o=inb(x0+dx,y0+dy)?S.b[(y0+dy)*W+x0+dx]:null;if(o&&o.t==='bastion'){const d=Math.hypot(dx,dy);if(d<bd){bd=d;best=o}}}s.ob=best;if(!best)s.wet=1}
 const bas=[];for(let k=7;k<N;k+=16){const s=smp[k],l=smp[(k-3+N)%N],r=smp[(k+3)%N];if(s.gate||s.wet||l.gate||l.wet||r.gate||r.wet)continue;
  const ox=-s.n[0],oy=-s.n[1],tip=[s.c[0]+ox*(.5*TU+2.2*TU),s.c[1]+oy*(.5*TU+2.2*TU)],s1=[l.o[0]+ox*1.15*TU,l.o[1]+oy*1.15*TU],s2=[r.o[0]+ox*1.15*TU,r.o[1]+oy*1.15*TU];
  const P_=[l.o,s1,tip,s2,r.o],cen=[P_.reduce((a,q)=>a+q[0],0)/5,P_.reduce((a,q)=>a+q[1],0)/5];if(!land(tileOf(tip))||!land(tileOf(s1))||!land(tileOf(s2)))continue;
  const gx=P_.map(q=>gt(q[0],q[1])),x0=Math.min(...gx.map(q=>q[0])),x1=Math.max(...gx.map(q=>q[0])),y0=Math.min(...gx.map(q=>q[1])),y1=Math.max(...gx.map(q=>q[1])),ts=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!inb(x,y))continue;const[E,S2]=geo(x,y);if(inPoly(E,S2,P_))ts.push(y*W+x)}
  if(ts.some(isRoadT))continue;const obs=cellsOf(ts).map(([x,y])=>put(x,y)).filter(Boolean);if(!obs.length)continue;
  const top=P_.map(q=>[q[0]+(cen[0]-q[0])*.08,q[1]+(cen[1]-q[1])*.08]);bas.push({p:P_,top,tip,cen,ti:tileOf(cen),obs,k})}
 const gates=[];for(let k=0;k<N;k++){if(!smp[k].gate||smp[(k-1+N)%N].gate)continue;let e=k;while(smp[(e+1)%N].gate&&e-k<N)e++;if(e-k>9)continue;
  let ia=(k-1+N)%N,ib=(e+1)%N,n1=0,n2=0;while(!smp[ia].ob&&n1++<6)ia=(ia-1+N)%N;while(!smp[ib].ob&&n2++<6)ib=(ib+1)%N;const a=smp[ia],b=smp[ib];
  if(!a.ob&&!b.ob)continue;gates.push({a,b,ti:smp[(k+((e-k)>>1))%N].ti})}
 L.wall={smp,bas,gates};WALLAT=new Map();const add=(t,it)=>{if(t<0)return;if(!WALLAT.has(t))WALLAT.set(t,[]);WALLAT.get(t).push(it)};
 for(let k=0;k<N;k++){const s=smp[k],t=smp[(k+1)%N];if(s.ob||t.ob)add(tileOf([(s.c[0]+t.c[0])/2,(s.c[1]+t.c[1])/2]),{t:'s',k})}
 for(const b of bas)add(b.ti,{t:'b',b});for(const g of gates)add(g.ti,{t:'g',g});return nw}
const wOn=s=>!!(s&&s.ob&&S.b[s.ob.y*W+s.ob.x]===s.ob);
function wallSeg(k,hw,hh){const W_=L.wall,N=W_.smp.length,a=W_.smp[k],b=W_.smp[(k+1)%N];const A=wOn(a),Bn=wOn(b);if(!A&&!Bn)return;
 const hW=hh*1.55,hp=hh*.28,P_=q=>gscr(q,hw,hh),up=(p,h)=>[p[0],p[1]-h];
 if(!A||!Bn){const s=A?a:b,o=P_(s.o),i=P_(s.i),ot=up(P_(s.ot),hW),it=up(P_(s.it),hW);poly([...o,...i,...it,...ot],'#a58e6e');
  ctx.fillStyle='#8c7a5c';for(let r=0;r<3;r++){const q=P_(s.c);ctx.beginPath();ctx.arc(q[0]+(r-1)*hh*.4,q[1]+hh*(.2+hs(k*3+r)*.3),hh*.18,0,7);ctx.fill()}return}
 const ao=P_(a.o),bo=P_(b.o),ai=P_(a.i),bi=P_(b.i),aot=up(P_(a.ot),hW),bot=up(P_(b.ot),hW),ait=up(P_(a.it),hW),bit=up(P_(b.it),hW),ac=P_(a.c);
 if(Math.max(ao[0],bi[0])<-60||Math.min(ao[0],bi[0])>vw+60||Math.max(ao[1],bi[1])<-60||Math.min(ao[1],bi[1])>vh+60+hW)return;
 const outVis=ao[1]-ac[1]>-1e-6,dx=bo[0]-ao[0],dy=bo[1]-ao[1],lit=dx*dy>0;
 if(!outVis)poly([...ai,...bi,...bit,...ait],lit?'#97815f':'#ad987a');
 poly([...ait,...bit,...bot,...aot],'#8aa456');
 if(Z>=.4){const am=up(P_(a.c),hW),bm=up(P_(b.c),hW);ctx.strokeStyle='rgba(225,210,170,.75)';ctx.lineWidth=Math.max(.8,hh*.13);ctx.beginPath();ctx.moveTo(...am);ctx.lineTo(...bm);ctx.stroke()}
 if(outVis){poly([...ao,...bo,...bot,...aot],lit?'#9b8466':'#bca684');
  if(Z>=.3){ctx.strokeStyle='rgba(60,45,30,.28)';ctx.lineWidth=.6;ctx.beginPath();for(const f of[.22,.44,.66]){const p=[ao[0]+(aot[0]-ao[0])*f,ao[1]+(aot[1]-ao[1])*f],q=[bo[0]+(bot[0]-bo[0])*f,bo[1]+(bot[1]-bo[1])*f];ctx.moveTo(...p);ctx.lineTo(...q)}
   if(k%2===0){ctx.moveTo((ao[0]+aot[0])/2,(ao[1]+aot[1])/2+hW*.05);ctx.lineTo((ao[0]*.78+aot[0]*.22),(ao[1]*.78+aot[1]*.22))}ctx.stroke()}}
 if(k%4!==3){const pa=up(aot,hp),pb=up(bot,hp);poly([...aot,...bot,...pb,...pa],outVis?'#d6c8a8':'#c2b393');if(Z>=.3){ctx.strokeStyle='#efe5cc';ctx.lineWidth=Math.max(.6,hh*.06);ctx.beginPath();ctx.moveTo(...pa);ctx.lineTo(...pb);ctx.stroke()}}
 if(outVis&&Z>=.3){ctx.strokeStyle='#e4d7b8';ctx.lineWidth=Math.max(.8,hh*.08);ctx.beginPath();ctx.moveTo(...aot);ctx.lineTo(...bot);ctx.stroke()}}
function wallBastion(b,hw,hh){if(!b.obs.some(o=>S.b[o.y*W+o.x]===o))return;const hW=hh*1.55,hp=hh*.28,P_=q=>gscr(q,hw,hh),up=(p,h)=>[p[0],p[1]-h];
 const g=b.p.map(P_),tp=b.top.map(q=>up(P_(q),hW)),c=P_(b.cen);if(Math.max(...g.map(q=>q[0]))<-80||Math.min(...g.map(q=>q[0]))>vw+80||Math.max(...g.map(q=>q[1]))<-80||Math.min(...g.map(q=>q[1]))>vh+80+hW)return;
 const ed=[];for(let k=0;k<4;k++){const A=g[k],C=g[k+1],T1=tp[k],T2=tp[k+1],mx=(A[0]+C[0])/2,my=(A[1]+C[1])/2;if(my-c[1]>0)ed.push([A,C,T1,T2,my])}ed.sort((a,b)=>a[4]-b[4]);
 poly(tp.flat(),'#8fa95a');
 for(const[A,C,T1,T2]of ed){const lit=(C[0]-A[0])*(C[1]-A[1])>0;poly([...A,...C,...T2,...T1],lit?'#9b8466':'#bca684');
  if(Z>=.3){ctx.strokeStyle='rgba(60,45,30,.28)';ctx.lineWidth=.6;ctx.beginPath();for(const f of[.22,.44,.66]){ctx.moveTo(A[0]+(T1[0]-A[0])*f,A[1]+(T1[1]-A[1])*f);ctx.lineTo(C[0]+(T2[0]-C[0])*f,C[1]+(T2[1]-C[1])*f)}ctx.stroke()}}
 for(let k=0;k<4;k++){const pa=up(tp[k],hp),pb=up(tp[k+1],hp);poly([...tp[k],...tp[k+1],...pb,...pa],'#d6c8a8')}
 if(Z>=.3){ctx.strokeStyle='#efe5cc';ctx.lineWidth=Math.max(.6,hh*.06);ctx.beginPath();ctx.moveTo(...up(tp[0],hp));for(let k=1;k<5;k++)ctx.lineTo(...up(tp[k],hp));ctx.stroke()}
 if(Z>=.35){const ct=up(c,hW);for(let k=0;k<3;k++)treeR(ct[0]+(k-1)*hw*.55,ct[1]+(k%2?hh*.25:-hh*.15),Z*.8,TREEC[(b.k+k)%4])}
 const t=up(P_(b.tip),hW+hp),s=hw*.16;poly([t[0]-s,t[1],t[0],t[1]+s*.5,t[0],t[1]+s*.5-hh*.7,t[0]-s,t[1]-hh*.7],'#cbbd9e');poly([t[0],t[1]+s*.5,t[0]+s,t[1],t[0]+s,t[1]-hh*.7,t[0],t[1]+s*.5-hh*.7],'#ae9f80');
 poly([t[0]-s*1.1,t[1]-hh*.7,t[0],t[1]+s*.55-hh*.7,t[0]+s*1.1,t[1]-hh*.7,t[0],t[1]-hh*1.25],'#5f8e7c')}
function wallGate(gt_,hw,hh){if(!wOn(gt_.a)&&!wOn(gt_.b))return;const hW=hh*1.55,P_=q=>gscr(q,hw,hh),A=P_(gt_.a.c),Bq=P_(gt_.b.c);
 if(Math.max(A[0],Bq[0])<-80||Math.min(A[0],Bq[0])>vw+80||Math.max(A[1],Bq[1])<-80||Math.min(A[1],Bq[1])>vh+80+hW*2)return;
 const tw=(p)=>{const s=hw*.42,h=hW*1.45;poly([p[0]-s,p[1],p[0],p[1]+s*.5,p[0],p[1]+s*.5-h,p[0]-s,p[1]-h],'#d9cdb2');poly([p[0],p[1]+s*.5,p[0]+s,p[1],p[0]+s,p[1]-h,p[0],p[1]+s*.5-h],'#b6a688');
  poly([p[0]-s,p[1]-h,p[0],p[1]+s*.5-h,p[0]+s,p[1]-h,p[0],p[1]-s*.5-h],'#e8dcc0');return h};
 const ha=wOn(gt_.a)?tw(A):0,hb=wOn(gt_.b)?tw(Bq):0;if(ha&&hb){const h=Math.min(ha,hb),y1=A[1]-h,y2=Bq[1]-h;poly([A[0],y1,Bq[0],y2,Bq[0],y2+hh*.55,A[0],y1+hh*.55],'#cfc2a4');
  const mx=(A[0]+Bq[0])/2,my=(y1+y2)/2;poly([mx-hw*.45,my,mx,my-hh*.75,mx+hw*.45,my],'#e3d7bb');ctx.strokeStyle='rgba(60,45,30,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(A[0],y1+hh*.55);ctx.lineTo(Bq[0],y2+hh*.55);ctx.stroke()}}
function drawWallItem(it,hw,hh){if(it.t==='s')wallSeg(it.k,hw,hh);else if(it.t==='b')wallBastion(it.b,hw,hh);else wallGate(it.g,hw,hh)}
function drawDitch(hw,hh){if(!L.wall)return;const sm=L.wall.smp,N=sm.length;for(let k=0;k<N;k++){const a=sm[k],b=sm[(k+1)%N];if(!wOn(a)||!wOn(b))continue;
 const p=[a.o,b.o,b.d,a.d].map(q=>gscr(q,hw,hh));if(Math.max(...p.map(q=>q[0]))<-gM||Math.min(...p.map(q=>q[0]))>vw+gM||Math.max(...p.map(q=>q[1]))<-gM||Math.min(...p.map(q=>q[1]))>vh+gM)continue;
 poly(p.flat(),'#6f8b45');ctx.strokeStyle='#5c7438';ctx.lineWidth=Math.max(.6,hh*.08);ctx.beginPath();ctx.moveTo(...p[3]);ctx.lineTo(...p[2]);ctx.stroke()}}
/* ---------- street life: horses, carriages and New Yorkers of every kind ---------- */
const HORSE=['#7a4a2a','#8b4a22','#5a3420','#b8b2a6','#2a2522','#9c6b3c'];
const PEOPLE_OLD=[['gent','#22201e','#1b1918'],['lady','#6b2f4a','#efe3c8'],['lady','#2f4f6e','#e8d5b0'],['lady','#5a6b3a','#e8d5b0'],['worker','#5a4632','#4a3a28'],['maid','#2a2a33','#f4f1ea'],['soldier','#3d5a8a','#c0392b'],['child','#8a3b2e','#d9c79c'],['vendor','#6b4f2e','#c9a227'],['priest','#1d1b1a','#1d1b1a']];
function pickKind(){const r=Math.random(),cars=RES().lohner&&S.t>=yT(1900,1)?Math.min(.3,(Y0+S.t/YEAR-1900)/40):0;
 if(r<cars)return'a';const q=Math.random();return q<.5?'p':q<.68?'f':q<.78?'e':q<.94?'c':'o'}
function OLD_drawHorse(x,y,ux,uy,z0,col,ph){const z=z0*1.35;const ang=Math.atan2(uy,ux),lg=Math.sin(ph)*1.1*z;
 ctx.strokeStyle=shade(col,.7);ctx.lineWidth=Math.max(.6,.7*z);ctx.beginPath();for(const[dx,s_]of[[-1.6,1],[-1,-1],[1.2,1],[1.8,-1]]){const bx=x+ux*dx*z,by=y+uy*dx*z;ctx.moveTo(bx,by-1.6*z);ctx.lineTo(bx+s_*lg*.4,by)}ctx.stroke();
 ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-2.6*z,3*z,1.4*z,ang,0,7);ctx.fill();
 ctx.beginPath();ctx.ellipse(x+ux*3.2*z,y+uy*3.2*z-4*z,1.2*z,.8*z,ang-.6,0,7);ctx.fill();
 ctx.strokeStyle=col;ctx.lineWidth=Math.max(.8,1.1*z);ctx.beginPath();ctx.moveTo(x+ux*2.2*z,y+uy*2.2*z-3*z);ctx.lineTo(x+ux*3*z,y+uy*3*z-4.2*z);ctx.stroke();
 ctx.strokeStyle=shade(col,.55);ctx.lineWidth=Math.max(.5,.6*z);ctx.beginPath();ctx.moveTo(x-ux*3*z,y-uy*3*z-2.8*z);ctx.lineTo(x-ux*3.6*z,y-uy*3.6*z-1*z);ctx.stroke()}
function drawPerson_old(x,y,z,k){const[kind,c1,c2]=PEOPLE[k],s=kind==='child'?.7:1;ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+1.2*z,y+.4*z,1.8*z*s,.7*z*s,0,0,7);ctx.fill();
 if(kind==='lady'){ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(x-1.6*z,y);ctx.lineTo(x+1.6*z,y);ctx.lineTo(x+.7*z,y-4.2*z);ctx.lineTo(x-.7*z,y-4.2*z);ctx.fill();ctx.fillRect(x-.7*z,y-6*z,1.4*z,2*z)}
 else{ctx.fillStyle=kind==='soldier'?'#c9c3b5':shade(c1,.8);ctx.fillRect(x-.8*z*s,y-2.4*z*s,.7*z*s,2.4*z*s);ctx.fillRect(x+.1*z*s,y-2.4*z*s,.7*z*s,2.4*z*s);ctx.fillStyle=c1;ctx.fillRect(x-1*z*s,y-5.4*z*s,2*z*s,3.2*z*s)}
 if(kind==='maid'){ctx.fillStyle=c2;ctx.fillRect(x-.7*z,y-4.6*z,1.4*z,3*z)}if(kind==='soldier'){ctx.fillStyle=c2;ctx.fillRect(x-1*z,y-3*z,2*z,.5*z)}
 const hy=y-(kind==='lady'?6.9:6.3)*z*s;ctx.fillStyle='#e8c9a8';ctx.beginPath();ctx.arc(x,hy,.95*z*s,0,7);ctx.fill();
 if(kind==='gent'){ctx.fillStyle='#111';ctx.fillRect(x-.8*z,hy-2.6*z,1.6*z,1.9*z);ctx.fillRect(x-1.3*z,hy-.9*z,2.6*z,.4*z)}
 else if(kind==='lady'){ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(x,hy-.8*z,1.8*z,.6*z,0,0,7);ctx.fill();ctx.fillStyle=c1;ctx.beginPath();ctx.arc(x,hy-1.1*z,.6*z,0,7);ctx.fill()}
 else if(kind==='worker'||kind==='vendor'){ctx.fillStyle=c2;ctx.fillRect(x-1*z,hy-1.3*z,2*z,.6*z)}
 else if(kind==='soldier'){ctx.fillStyle='#2a3550';ctx.fillRect(x-.8*z,hy-1.9*z,1.6*z,1.1*z)}
 else if(kind==='maid'){ctx.fillStyle='#f4f1ea';ctx.fillRect(x-.8*z,hy-1.3*z,1.6*z,.5*z)}
 else if(kind==='priest'){ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x,hy-.9*z,1.6*z,.5*z,0,0,7);ctx.fill()}
 if(kind==='vendor'){ctx.fillStyle='#a0763f';ctx.beginPath();ctx.ellipse(x+1.6*z,y-3.2*z,1.4*z,.9*z,0,0,7);ctx.fill();ctx.fillStyle='#d9483a';ctx.beginPath();ctx.arc(x+1.4*z,y-3.8*z,.45*z,0,7);ctx.fill()}}
function drawWheel(x,y,r){ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.6,r*.35);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke()}
function OLD_drawRig(a,cx,cy,ux,uy,nx,ny,z,now){const ph=(now/90+a.seed*7)%(Math.PI*2),hc=a.hc,body=(cx_,cy_)=>({x:cx_,y:cy_});
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(cx+ux*3*z+1.5*z,cy+uy*3*z+.8*z,(a.t==='o'?10:8)*z,2.4*z,Math.atan2(uy,ux),0,7);ctx.fill();
 const pairs=a.t==='e'||a.t==='c'&&a.seed<.5?[0]:[-1,1];for(const s_ of pairs)drawHorse(cx+ux*7*z+nx*s_*1.2*z,cy+uy*7*z+ny*s_*1.2*z,ux,uy,z,HORSE[(hc+(s_>0?1:0))%HORSE.length],ph+s_);
 if(a.t==='f'){for(const s_ of[-1,1])drawWheel(cx+nx*s_*2.6*z-ux*1.5*z,cy+ny*s_*2.6*z-uy*1.5*z-1.3*z,1.4*z);poly([cx-3*z,cy-2*z,cx+3*z,cy-2*z,cx+3*z,cy-5*z,cx-3*z,cy-5*z],a.bc);
  ctx.fillStyle='#1d1b1a';ctx.beginPath();ctx.ellipse(cx-ux*1.6*z,cy-uy*1.6*z-5*z,2.6*z,2.2*z,0,Math.PI,0);ctx.fill();drawPerson(cx+ux*2.4*z,cy+uy*2.4*z-3*z,z*.8,0)}
 else if(a.t==='e'){for(const s_ of[-1,1])drawWheel(cx+nx*s_*2.4*z,cy+ny*s_*2.4*z-1.2*z,1.3*z);box(cx,cy-2*z,5*z,5*z,'#1d1b1a','#2b2522',0,true);ctx.fillStyle='#3a4a58';ctx.fillRect(cx-1.4*z,cy-6*z,2.8*z,1.6*z);drawPerson(cx+ux*2.6*z,cy+uy*2.6*z-3.6*z,z*.75,0)}
 else if(a.t==='c'){for(const s_ of[-1,1])drawWheel(cx+nx*s_*2.8*z,cy+ny*s_*2.8*z-1.4*z,1.7*z);box(cx,cy-1.5*z,6*z,2.4*z,'#8a5e3b','#a4774c',0,true);
  const ld=a.ld;if(ld===0){for(let i=0;i<3;i++){ctx.fillStyle='#7a4a2a';ctx.beginPath();ctx.ellipse(cx-2*z+i*2*z,cy-5.2*z,1*z,1.3*z,0,0,7);ctx.fill();ctx.strokeStyle='#3a2a1a';ctx.lineWidth=.5;ctx.stroke()}}
  else if(ld===1){for(let i=0;i<3;i++){ctx.fillStyle='#d9c79c';ctx.beginPath();ctx.ellipse(cx-2*z+i*2*z,cy-4.8*z-(i%2)*.8*z,1.2*z,.9*z,0,0,7);ctx.fill()}}
  else{ctx.fillStyle='#b5583a';ctx.fillRect(cx-2.5*z,cy-6*z,5*z,2.2*z);ctx.fillStyle='#9c4a30';ctx.fillRect(cx-1.5*z,cy-7.4*z,3*z,1.4*z)}drawPerson(cx+ux*3.2*z,cy+uy*3.2*z-2.6*z,z*.75,4)}
 else if(a.t==='o'){for(const s_ of[-1,1])for(const d of[-2.5,2])drawWheel(cx+nx*s_*2.6*z+ux*d*z,cy+ny*s_*2.6*z+uy*d*z-1.3*z,1.4*z);box(cx,cy-2*z,9*z,6*z,'#b8322a','#efe3c8',0,true);
  ctx.fillStyle='#2c3a44';for(let i=0;i<3;i++)ctx.fillRect(cx-3.5*z+i*2.6*z,cy-6.5*z,1.8*z,1.6*z);for(let i=0;i<3;i++)drawPerson(cx-2.4*z+i*2.4*z,cy-8.6*z,z*.6,i*3%PEOPLE.length)}}

/* ---------- street life: Fiaker, carts and people ---------- */
const isRd=i=>i>=0&&i<W*H&&((S.b[i]&&S.b[i].t==='road')||S.tiles[i]===BRIDGE);
const rdNb=i=>roadNb(i);
function spawnAgent(a,pool){const st=pool[Math.random()*pool.length|0];const nb=rdNb(st);if(!nb.length)return null;
 const t=pickKind();return Object.assign(a||{},{t,a:st,b:nb[Math.random()*nb.length|0],f:Math.random(),sp:t==='p'?.12+Math.random()*.08:t==='c'?.35:t==='o'?.4:t==='a'?1.2:.5+Math.random()*.2,side:Math.random()<.5?1:-1,pk:Math.random()*PEOPLE.length|0,hc:Math.random()*HORSE.length|0,ld:Math.random()*3|0,seed:Math.random(),bc:['#1d1b1a','#2f4a3a','#3a2a4a','#5a1f1b'][Math.random()*4|0],col:'#2d2a28'})}
function trafPool(){const sd=S.list.find(o=>o.t==='stephan'),c=sd?[sd.x+3,sd.y+3]:[W/2,H/2],near=[],all=[];
 for(let i=0;i<W*H;i++)if(isRd(i)&&S.tiles[i]!==BRIDGE){all.push(i);if(Math.hypot(i%W-c[0],(i/W|0)-c[1])<34)near.push(i)}
 for(const o of S.list)if(!o.h&&o.t==='house')for(const[x,y]of perim(o))if(inb(x,y)&&isRd(y*W+x))for(let k=0;k<6;k++)near.push(y*W+x);return{near,all}}
function trafTick(dt){if(!S||!L.y1857)return;let pu=0;for(const o of S.list)if(o.t==='house'&&!o.bld)pu+=o.pop||0;
 /* Vienna's old town is a handful of blocks standing for half a million people: its streets fill by the city's population, with Fiaker among them */
 const want=Math.min(LOWEND?70:170,Math.round(L.ringOct?Math.max(pu/6,dispPop()/5000):pu/6));
 if(TRAFK!==S.list.length>>4){TRAFK=S.list.length>>4;TPOOL=trafPool()}if(!TPOOL)TPOOL=trafPool();
 if(TRAF.length<want&&Math.random()<.3){const a=spawnAgent(null,Math.random()<.75&&TPOOL.near.length?TPOOL.near:TPOOL.all);if(a)TRAF.push(a)}else if(TRAF.length>want)TRAF.pop();
 for(const a of TRAF){if(!isRd(a.a)||!isRd(a.b)){if(!spawnAgent(a,TPOOL.near.length?TPOOL.near:TPOOL.all))a.a=a.b=-1;continue}
  /* the 3D view can hold a vehicle for a moment (someone crossing in front); otherwise it follows whatever is ahead in its lane,
     on this stretch or the next, easing down to the speed of a slower one instead of running into it */
  if(a.hold>0){a.hold-=dt;continue}
  let v=a.sp;{const gap=a.t==='p'?.22:.6;let d=9,bs=a.sp;for(const b of TRAF){if(b===a||(b.t==='p')!==(a.t==='p'))continue;let dd=9;if(b.a===a.a&&b.b===a.b&&b.f>a.f)dd=b.f-a.f;else if(a.nb!==undefined&&b.a===a.b&&b.b===a.nb)dd=1-a.f+b.f;if(dd<d){d=dd;bs=b.hold>0?0:b.sp}}
   if(d<gap){const k=Math.max(0,(d-gap*.5)/(gap*.5));v=Math.min(a.sp,bs+(a.sp-bs)*k)*Math.min(1,k*1.5)}}
  /* vehicles ease down into a corner (or a turn round at a dead end) and pick up again out of it: the slowest at the tile's centre */
  if(a.t!=='p'){const A_=a.f<.5,ds=A_?a.f:1-a.f,bent=A_?a.pa!==undefined&&a.pa>=0&&a.b-a.a!==a.a-a.pa:a.nb!==undefined&&a.nb-a.b!==a.b-a.a;if(bent&&ds<.45){const e=ds/.45;v*=.55+.45*e*e*(3-2*e)}}
  a.f+=dt*v;if(a.f>=.5&&a.nb===undefined){const nb=rdNb(a.b).filter(n=>n!==a.a);a.nb=nb.length?nb[Math.random()*nb.length|0]:a.a}
  while(a.f>=1){a.f-=1;const prev=a.a;a.a=a.b;a.b=a.nb!==undefined&&isRd(a.nb)?a.nb:(()=>{const nb=rdNb(a.a).filter(n=>n!==prev);return nb.length?nb[Math.random()*nb.length|0]:prev})();a.nb=undefined;a.pa=prev}}}
function trafPos(a){const P_=i=>[i%W,(i/W)|0],A=P_(a.a),Bp=P_(a.b),mAB=[(A[0]+Bp[0])/2,(A[1]+Bp[1])/2],bz=(p0,c,p1,u)=>[(1-u)*(1-u)*p0[0]+2*u*(1-u)*c[0]+u*u*p1[0],(1-u)*(1-u)*p0[1]+2*u*(1-u)*c[1]+u*u*p1[1]];
 if(a.f<.5){const Pa=a.pa!==undefined&&a.pa>=0?P_(a.pa):[2*A[0]-Bp[0],2*A[1]-Bp[1]],mPA=[(Pa[0]+A[0])/2,(Pa[1]+A[1])/2];return bz(mPA,A,mAB,a.f+.5)}
 const N=a.nb!==undefined&&a.nb>=0?P_(a.nb):[2*Bp[0]-A[0],2*Bp[1]-A[1]],mBN=[(Bp[0]+N[0])/2,(Bp[1]+N[1])/2];return bz(mAB,Bp,mBN,a.f-.5)}
function trafBuckets(){const m=new Map();for(const a of TRAF){const tp=trafPos(a),x=tp[0],y=tp[1],i=Math.round(y)*W+Math.round(x);a.x=x;a.y=y;if(!m.has(i))m.set(i,[]);m.get(i).push(a)}return m}
function drawAgent(a,hw,hh){const z=Z*(a.t==='p'?1.15:1.25);{const dx0=(a.b%W)-(a.a%W),dy0=(a.b/W|0)-(a.a/W|0);if(a.sx===undefined||Math.hypot(a.x-a.sx,a.y-a.sy)>2.5){a.sx=a.x;a.sy=a.y;a.hx=dx0;a.hy=dy0;a.lx=a.x;a.ly=a.y}
  const k=1;a.sx+=(a.x-a.sx)*k;a.sy+=(a.y-a.sy)*k;const mx=a.x-a.lx,my=a.y-a.ly;a.lx=a.x;a.ly=a.y;const ml=Math.hypot(mx,my);if(ml>1e-4){const w=.35;a.hx=a.hx*(1-w)+mx/ml*w;a.hy=a.hy*(1-w)+my/ml*w}}
 const[cx0,cy0]=scr(a.sx,a.sy),dx=a.hx,dy=a.hy;let ux=DX(dx,dy)*hw,uy=DY(dx,dy)*hh;const l=Math.hypot(ux,uy)||1;ux/=l;uy/=l;
 const nx=-uy,ny=ux,off=a.t==='p'?a.side*hh*.62:-hh*.25,cx=cx0+nx*off,cy=cy0+ny*off;
 if(cx<-30||cx>vw+30||cy<-30||cy>vh+30)return;
 if(a.t==='p'){drawPerson(cx,cy,z,a.pk||0,Math.hypot(a.x-a.sx,a.y-a.sy)<.004);return}
 if(a.t==='f'||a.t==='e'||a.t==='c'||a.t==='o'){drawRig(a,cx,cy,ux,uy,nx,ny,z,performance.now());return}
 if(false){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(cx+1.5*z,cy+.5*z,2*z,.8*z,0,0,7);ctx.fill();ctx.fillStyle=a.col;ctx.fillRect(cx-.9*z,cy-4.6*z,1.8*z,4.4*z);
  ctx.fillStyle='#e8c9a8';ctx.beginPath();ctx.arc(cx,cy-5.4*z,.95*z,0,7);ctx.fill();ctx.fillStyle='#1f1b18';ctx.fillRect(cx-1*z,cy-7*z,2*z,1.1*z);return}
 if(a.t==='a'){drawAuto(a,cx,cy,z);return}
 if(a.t==='a_old'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(cx+2*z,cy+.8*z,6*z,2*z,Math.atan2(uy,ux),0,7);ctx.fill();box(cx,cy-1*z,6*z,3.5*z,a.side>0?'#5a1f1b':'#1f2a3a','#2a2522',0,true);ctx.fillStyle='#d9e4ea';ctx.fillRect(cx-1.5*z,cy-6*z,3*z,1.6*z);ctx.fillStyle='#111';for(const s_ of[-1,1]){ctx.beginPath();ctx.arc(cx+nx*s_*2.6*z+ux*2*z,cy+ny*s_*2.6*z+uy*2*z,1.2*z,0,7);ctx.fill();ctx.beginPath();ctx.arc(cx+nx*s_*2.6*z-ux*2*z,cy+ny*s_*2.6*z-uy*2*z,1.2*z,0,7);ctx.fill()}return}
 const hx=cx+ux*6.5*z,hy=cy+uy*6.5*z;
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(cx+ux*3*z+2*z,cy+uy*3*z+.8*z,7*z,2.2*z,Math.atan2(uy,ux),0,7);ctx.fill();
 for(const s_ of[-1,1]){ctx.fillStyle='#6b4325';ctx.beginPath();ctx.ellipse(hx+nx*s_*1.1*z,hy+ny*s_*1.1*z-2.6*z,3*z,1.5*z,Math.atan2(uy,ux),0,7);ctx.fill();
  ctx.fillStyle='#4a2d18';ctx.beginPath();ctx.arc(hx+ux*2.6*z+nx*s_*1.1*z,hy+uy*2.6*z+ny*s_*1.1*z-3.6*z,.9*z,0,7);ctx.fill()}
 if(a.t==='f'){box(cx,cy-1.2*z,5*z,5*z,'#1d1b1a','#2b2522',0,true);ctx.fillStyle='#3a4a58';ctx.fillRect(cx-1.6*z,cy-5.6*z,3.2*z,1.6*z);ctx.fillStyle='#1f1b18';ctx.fillRect(cx+ux*2.6*z-.7*z,cy+uy*2.6*z-8.6*z,1.4*z,2.2*z)}
 else{box(cx,cy-1*z,5.5*z,3*z,'#8a5e3b','#a4774c',0,true);ctx.fillStyle='#c9a227';ctx.fillRect(cx-2*z,cy-6*z,4*z,1.6*z)}
 ctx.fillStyle='#2b1d12';for(const s_ of[-1,1]){ctx.beginPath();ctx.arc(cx+nx*s_*2.4*z,cy+ny*s_*2.4*z,1.3*z,0,7);ctx.fill()}}
function linkT(a,b){const A=S.b[a],B_=S.b[b];if(!A||!B_||A.t!=='road'||B_.t!=='road'||a===b)return;if(Math.abs(a%W-b%W)>1||Math.abs((a/W|0)-(b/W|0))>1)return;(A.lk||(A.lk=[])).includes(b)||A.lk.push(b);(B_.lk||(B_.lk=[])).includes(a)||B_.lk.push(a)}
function linkRoute(ts){for(let k=1;k<ts.length;k++)linkT(ts[k-1],ts[k])}
function roadNb(i){const x=i%W,y=i/W|0,r=[],Rr=(a,b)=>inb(a,b)&&isRd(b*W+a),lk=S.b[i]&&S.b[i].lk;
 for(const[dx,dy]of D4)if(Rr(x+dx,y+dy))r.push((y+dy)*W+x+dx);
 for(const[dx,dy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){const n=(y+dy)*W+x+dx;if(Rr(x+dx,y+dy)&&((lk&&lk.includes(n))||(!Rr(x+dx,y)&&!Rr(x,y+dy))))r.push(n)}return r}
function octi(x0,y0,x1,y1){const out=[],dx=x1-x0,dy=y1-y0,sx=Math.sign(dx),sy=Math.sign(dy),n=Math.min(Math.abs(dx),Math.abs(dy)),m=Math.max(Math.abs(dx),Math.abs(dy))-n,ax=Math.abs(dx)>Math.abs(dy);
 let x=x0,y=y0;out.push(y*W+x);const st=k=>{for(let i=0;i<k;i++){if(ax)x+=sx;else y+=sy;out.push(y*W+x)}};const m1=m>>1;st(m1);for(let i=0;i<n;i++){x+=sx;y+=sy;out.push(y*W+x)}st(m-m1);return out}
function octiRoute(pts,minSeg=6){const t=[];for(const q of pts){const g=gt(q[0],q[1]);if(!t.length||t[t.length-1][0]!==g[0]||t[t.length-1][1]!==g[1])t.push(g)}
 const s_=[t[0]];for(let k=1;k<t.length;k++){const a=s_[s_.length-1];if(Math.hypot(t[k][0]-a[0],t[k][1]-a[1])>=minSeg||k===t.length-1)s_.push(t[k])}
 const out=[],seen=new Set();for(let k=0;k<s_.length-1;k++)for(const i of octi(s_[k][0],s_[k][1],s_[k+1][0],s_[k+1][1]))if(!seen.has(i)&&i>=0&&i<W*H){seen.add(i);out.push(i)}return out}
function rast8(pts){const out=[],seen=new Set();for(let k=0;k<pts.length-1;k++){const[a,b]=pts[k],[c,d]=pts[k+1],n=Math.max(1,Math.ceil(Math.hypot(c-a,d-b)/(TU*.3)));
 for(let j=0;j<=n;j++){const[x,y]=gt(a+(c-a)*j/n,b+(d-b)*j/n);if(!inb(x,y))continue;const i=y*W+x;if(!seen.has(i)){seen.add(i);out.push(i)}}}return out}
function placeNear(t,lat,lon,maxR=18){const[cx,cy]=gtV(lat,lon),f=B[t].foot||1;
 for(let r=0;r<=maxR;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=Math.round(cx-(f-1)/2)+dx,y=Math.round(cy-(f-1)/2)+dy;
  const e=canPlace(t,x,y);if(e&&!e.startsWith('Not enough'))continue;if(!spotGood(t,x,y,f))continue;return place(t,x,y,0,true)}return null}
function linkRoad(o){if(!o)return;recompute();if(o.c)return;const st=[];
 for(const[x,y]of perim(o))if(inb(x,y)){const j=y*W+x;if(!S.b[j]&&S.tiles[j]!==WATER&&S.tiles[j]!==BRIDGE)st.push(j)}
 const par=new Map(st.map(j=>[j,-1])),q=st.slice();
 for(let h=0;h<q.length&&h<60000;h++){const k=q[h],x=k%W,y=k/W|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(!inb(nx,ny)||par.has(n))continue;
  if(((S.b[n]&&S.b[n].t==='road')||S.tiles[n]===BRIDGE)&&dist[n]>=0){let c=k;while(c!==-1){place('road',c%W,c/W|0,0,true);c=par.get(c)}recompute();return}
  const tt=S.tiles[n];if(S.b[n]||tt===WATER||tt===BRIDGE||tt===MOUNT)continue;par.set(n,k);q.push(n)}}}
const STARTER=[['sheep',40.6850,-73.9450],['weaver',40.7100,-73.9620],['brick',40.7300,-73.9545],['brick',40.7180,-73.9610],['sawmill',40.7520,-74.0060],['stonewh',40.7120,-73.9790],['garden',40.6900,-73.9550],['garden',40.6960,-73.9500],['grainf',40.6800,-73.9500],['brewery',40.7180,-73.9590],['ironyard',40.7290,-73.9745]];
function starterCity(){UNLOCKALL=true;try{starterCity0()}finally{UNLOCKALL=false}}
function starterCity0(){recompute();for(const[t,la,lo]of STARTER){const o=placeNear(t,la,lo);if(o)linkRoad(o)}
 /* the Votivkirche and Central Park under way in 1865; Vienna's Stadtpark has been open since 1862 */
 for(const[t,done]of[['votiv',.25],['stadtpark',NYC()?.6:1]]){const e=lmEntry(t);if(!e)continue;const o=placeNear(t,e.lat,e.lon,10);if(!o)continue;
  if(done>=1){o.bld=null;linkRoad(o);continue}const P_=B[t].proj;o.bld={};for(const g in P_)o.bld[g]=Math.ceil(P_[g]*(1-done));o.bld0=Object.values(P_).reduce((a,b)=>a+b,0);linkRoad(o)}
 recompute()}
function landPath(a,b,maxN=4000){const ok=i=>S.tiles[i]!==WATER,par=new Map([[a,-1]]),q=[a];
 for(let h=0;h<q.length&&h<maxN;h++){const k=q[h];if(k===b){const out=[];let c=k;while(c!==-1){out.push(c);c=par.get(c)}return out.reverse()}const x=k%W,y=k/W|0;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(!inb(nx,ny)||par.has(n)||!ok(n))continue;if(dx&&dy&&(!ok(y*W+nx)||!ok(ny*W+x)))continue;par.set(n,k);q.push(n)}}return null}
let RA=-1,RPV=null,SLINE=null;const near1=(a,b)=>Math.max(Math.abs(a%W-b%W),Math.abs((a/W|0)-(b/W|0)))<=1;
function buildLine(ln){const nw=ln.filter(i=>!(S.b[i]&&S.b[i].t==='road')&&S.tiles[i]!==BRIDGE);const bad=nw.find(i=>canPlace('road',i%W,i/W|0));if(bad!==undefined){toast(canPlace('road',bad%W,bad/W|0)||'Something is in the way');return}
 const c=nw.length*5;buildPlan({tiles:ln,cost:c,n:nw.length})}
function roadPas(i){const t=S.tiles[i];if(t===BRIDGE)return true;if(t===WATER||t===MOUNT)return false;const o=S.b[i];if(o)return o.t==='road';if(window.sceneryOn&&window.sceneryOn(i%W,i/W|0))return false;return canUse('road',i)}
function roadPlan(a,b){if(a===b||!roadPas(a)||!roadPas(b))return null;{const ax=a%W,ay=a/W|0,bx=b%W,by=b/W|0,dx=bx-ax,dy=by-ay;if(!dx||!dy||Math.abs(dx)===Math.abs(dy)){const n=Math.max(Math.abs(dx),Math.abs(dy)),ln=[];let ok=true;for(let i=0;i<=n;i++){const j=(ay+Math.sign(dy)*i)*W+ax+Math.sign(dx)*i;if(!roadPas(j)||i&&dx&&dy&&(!roadPas(j-Math.sign(dx))||!roadPas(j-Math.sign(dy)*W))){ok=false;break}ln.push(j)}if(ok){const isR=i=>S.tiles[i]===BRIDGE||(S.b[i]&&S.b[i].t==='road'),nw=ln.filter(i=>!isR(i)).length;return{tiles:ln,n:nw,cost:nw*5}}}}const ax=a%W,ay=a/W|0,bx=b%W,by=b/W|0,m=26+Math.round(Math.hypot(ax-bx,ay-by)*.25),X0=Math.max(0,Math.min(ax,bx)-m),X1=Math.min(W-1,Math.max(ax,bx)+m),Y0=Math.max(0,Math.min(ay,by)-m),Y1=Math.min(H-1,Math.max(ay,by)+m);
 const isR=i=>S.tiles[i]===BRIDGE||(S.b[i]&&S.b[i].t==='road'),hh_=i=>{const dx=Math.abs(i%W-bx),dy=Math.abs((i/W|0)-by);return(Math.max(dx,dy)+.414*Math.min(dx,dy))*.35};
 const g=new Map([[a,0]]),par=new Map([[a,-1]]),dir=new Map([[a,-1]]),hp=[[hh_(a),a]];
 const push=e=>{hp.push(e);let k=hp.length-1;while(k){const q=(k-1)>>1;if(hp[q][0]<=hp[k][0])break;[hp[q],hp[k]]=[hp[k],hp[q]];k=q}};
 const pop=()=>{const top=hp[0],e=hp.pop();if(hp.length){hp[0]=e;let k=0;for(;;){const l=2*k+1,r=l+1;let m_=k;if(l<hp.length&&hp[l][0]<hp[m_][0])m_=l;if(r<hp.length&&hp[r][0]<hp[m_][0])m_=r;if(m_===k)break;[hp[m_],hp[k]]=[hp[k],hp[m_]];k=m_}}return top};
 const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];let n=0;
 while(hp.length&&n++<400000){const[f,k]=pop();if(k===b)break;const x=k%W,y=k/W|0,gk=g.get(k);if(f-hh_(k)>gk+1e-6)continue;
  for(let d=0;d<8;d++){const[dx,dy]=D8[d],nx=x+dx,ny=y+dy;if(nx<X0||nx>X1||ny<Y0||ny>Y1)continue;const j=ny*W+nx;if(!roadPas(j))continue;
   if(dx&&dy&&(!roadPas(y*W+nx)||!roadPas(ny*W+x)))continue;
   const c=(dx&&dy?1.414:1)*(isR(j)?.35:1)+(RAILM[j]&&!isR(j)?4:0)+(dir.get(k)>=0&&dir.get(k)!==d?.4:0),ng=gk+c;
   if(ng<(g.has(j)?g.get(j):1e9)){g.set(j,ng);par.set(j,k);dir.set(j,d);push([ng+hh_(j),j])}}}
 if(!par.has(b))return null;const tiles=[];let c=b;while(c!==-1){tiles.push(c);c=par.get(c)}tiles.reverse();
 const nw=tiles.filter(i=>!isR(i)).length;return{tiles,n:nw,cost:nw*5}}
/* a road is never refused for money: with an empty treasury it is laid on credit, so a new building can always be joined to the streets */
function buildPlan(p){const made=[];
 for(const i of p.tiles){if(S.tiles[i]===BRIDGE||S.b[i])continue;made.push(place('road',i%W,i/W|0,0,true));S.stock.gold-=5}if(made.length)pushUndo({k:'roads',objs:made,gold:made.length*5});linkRoute(p.tiles);recompute();GV++;sfx('build');roadNews();return true}
/* a road just built: a note that no road reaches there gives way at once, and an open panel or the nudge says so straight away */
function roadNews(){const tl=$('#toast');if(/No road/.test(tl.textContent)){TOAT=0;tl.classList.remove('show')}for(let k=TOQ.length-1;k>=0;k--)if(/No road/.test(TOQ[k]))TOQ.splice(k,1);const n=$('#nudge');if(n&&!n.hidden&&/road/i.test(n.textContent))n.hidden=true;if(sel&&!$('#info').hidden)openInfo(sel)}
function snapRoad(k,ref){const o=S.b[k];if(!o||o.t==='road')return k;let best=k,bd=1e9;for(const[x,y]of perim(o)){if(!inb(x,y))continue;const j=y*W+x;if(!roadPas(j))continue;const d=Math.hypot(x-ref%W,y-(ref/W|0));if(d<bd){bd=d;best=j}}return best}
function roadClick(t,pt){if(!inb(t.x,t.y))return;let k=t.y*W+t.x;
 /* the first tap on a building that no road reaches shows its shortest road, ready to build */
 if(RA<0){const o=S.b[k];if(o&&o.t!=='road'&&!o.r&&B[o.t]&&roadAsk(o)&&!o.c&&roadRoute(o)){roadOffer(o,'road');return}}
 k=snapRoad(k,RA>=0?RA:k);
 if(RA<0){if(!roadPas(k)){toast('A road can\'t start here');return}RA=k;RPV=null;if(pt!=='mouse')hover=null;toast(pt==='mouse'?'Start set. Click where the road should go':'Start set. Tap where the road should go');return}
 if(k===RA){RA=-1;RE=-1;RPV=null;pend=null;confHide();toast('Road start cleared');return}
 /* on a phone the end shown once is built by a second tap on it (or right beside it), as the ✓ does */
 if((pt==='touch'||pt==='pen')&&RE>=0&&CONF==='road'&&near1(k,RE)){confOk();return}
 const p_=roadPlan(RA,k);if(!p_){toast('No route found to there');return}
 if(pt==='touch'||pt==='pen'){RE=k;hover={x:k%W,y:k/W|0};confShow('road');return}
 pend=null;if(buildPlan(p_)){RA=k;RPV=null;toast(`Road built: ${fullStop(money(p_.cost))} ${pt==='mouse'?'Click':'Tap'} on to continue, or the end point to stop`)}}
function snapLand(x,y){const ok=(a,b)=>inb(a,b)&&S.tiles[b*W+a]!==WATER&&S.tiles[b*W+a]!==MOUNT&&(!S.b[b*W+a]||S.b[b*W+a].t==='road');if(ok(x,y))return y*W+x;
 for(let r=1;r<=8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(ok(x+dx,y+dy))return(y+dy)*W+x+dx}return -1}
function wpts(pts,minSeg){const t=[];for(const q of pts){const g=gt(q[0],q[1]);if(!t.length||Math.hypot(g[0]-t[t.length-1][0],g[1]-t[t.length-1][1])>=minSeg)t.push(g)}
 const l=gt(pts[pts.length-1][0],pts[pts.length-1][1]);if(t.length&&(t[t.length-1][0]!==l[0]||t[t.length-1][1]!==l[1]))t.push(l);return t.map(([x,y])=>snapLand(x,y)).filter(i=>i>=0)}
function astar(a,b,o){const W_=o.water,ax=a%W,ay=a/W|0,bx=b%W,by=b/W|0,m=o.box||28,X0=Math.max(0,Math.min(ax,bx)-m),X1=Math.min(W-1,Math.max(ax,bx)+m),Y0=Math.max(0,Math.min(ay,by)-m),Y1=Math.min(H-1,Math.max(ay,by)+m);
 const isR=i=>S.tiles[i]===BRIDGE||(S.b[i]&&S.b[i].t==='road'),wet=i=>S.tiles[i]===WATER;
 const pas=i=>{const t=S.tiles[i];if(t===MOUNT)return false;if(S.b[i]&&S.b[i].t!=='road')return false;if(t===WATER)return W_<1e8;return true};
 const hf=i=>{const dx=Math.abs(i%W-bx),dy=Math.abs((i/W|0)-by);return(Math.max(dx,dy)+.414*Math.min(dx,dy))*.35};
 const g=new Map([[a,0]]),par=new Map([[a,-1]]),dir=new Map([[a,-1]]),hp=[[hf(a),a]];
 const push=e=>{hp.push(e);let k=hp.length-1;while(k){const q=(k-1)>>1;if(hp[q][0]<=hp[k][0])break;[hp[q],hp[k]]=[hp[k],hp[q]];k=q}};
 const pop=()=>{const top=hp[0],e=hp.pop();if(hp.length){hp[0]=e;let k=0;for(;;){const l=2*k+1,r=l+1;let q=k;if(l<hp.length&&hp[l][0]<hp[q][0])q=l;if(r<hp.length&&hp[r][0]<hp[q][0])q=r;if(q===k)break;[hp[q],hp[k]]=[hp[k],hp[q]];k=q}}return top};
 const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];let n=0;
 while(hp.length&&n++<120000){const[f,k]=pop();if(k===b)break;const gk=g.get(k);if(f-hf(k)>gk+1e-6)continue;const x=k%W,y=k/W|0;
  for(let d=0;d<8;d++){const[dx,dy]=D8[d],nx=x+dx,ny=y+dy;if(nx<X0||nx>X1||ny<Y0||ny>Y1)continue;const j=ny*W+nx;if(!pas(j))continue;
   if(dx&&dy){const a1=y*W+nx,a2=ny*W+x;if(!pas(a1)||!pas(a2)||wet(j)||wet(k)||wet(a1)||wet(a2))continue}
   if(wet(j)&&dir.get(k)>=0&&dir.get(k)!==d&&wet(k))continue;
   const c=(dx&&dy?1.414:1)*(isR(j)?.35:wet(j)?W_:1)+(RAILM[j]&&!isR(j)?3:0)+(dir.get(k)>=0&&dir.get(k)!==d?(o.turn||.6):0),ng=gk+c;
   if(ng<(g.has(j)?g.get(j):1e9)){g.set(j,ng);par.set(j,k);dir.set(j,d);push([ng+hf(j),j])}}}
 if(!par.has(b))return null;const out=[];let c=b;while(c!==-1){out.push(c);c=par.get(c)}return out.reverse()}
function routeWP(wp,o){const out=[];for(let k=0;k<wp.length-1;k++){const p_=astar(wp[k],wp[k+1],o);if(!p_)continue;for(const i of p_)if(out[out.length-1]!==i)out.push(i)}return out}
/* a Vienna street that crossed a river diagonally, between two water tiles meeting at a corner (as the road tool once allowed), gets a
   bridge tile on one of those corners, so it no longer runs over the water */
function wetCorners(){if(!L.y1857||NYC())return;const isR=i=>S.tiles[i]===BRIDGE||(S.b[i]&&S.b[i].t==='road');let n=0;
 for(let y=0;y<H-1;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!isR(i))continue;for(const dx of[-1,1]){if(x+dx<0||x+dx>=W)continue;const j=i+W+dx,a=i+dx,b=i+W;if(isR(j)&&!isR(a)&&!isR(b)&&S.tiles[a]===WATER&&S.tiles[b]===WATER){const c=!S.b[a]?a:!S.b[b]?b:-1;if(c>=0){S.tiles[c]=BRIDGE;tcolSet(c);n++}}}}
 if(n)GV++}
function bridgeWet(ts){for(const i of ts)if(S.tiles[i]===WATER){S.tiles[i]=BRIDGE;tcolSet(i)}}
/* a bridge of the map is met by a street at both ends: an end with none is joined to the nearest street within r tiles of open land,
   by a short road that runs straight and at most once at a slant */
function bridgeEnds(r){const seen=new Set(),free=j=>!S.b[j]&&!RAILM[j]&&(S.tiles[j]===GRASS||S.tiles[j]===SAND||S.tiles[j]===FOREST),rd=j=>S.b[j]&&S.b[j].t==='road';
 for(let i=0;i<W*H;i++){if(S.tiles[i]!==BRIDGE||seen.has(i))continue;const q=[i],ld=[];seen.add(i);
  for(let h=0;h<q.length;h++){const k=q[h],x=k%W,y=k/W|0;for(const[dx,dy]of D4){if(!inb(x+dx,y+dy))continue;const n=(y+dy)*W+x+dx,t=S.tiles[n];if(t===BRIDGE){if(!seen.has(n)){seen.add(n);q.push(n)}}else if(t!==WATER)ld.push([n,dx,dy])}}
  /* its two ends: the landings farthest apart */
  let a=null,b=null,bd=-1;for(const u of ld)for(const v of ld){const e=(u[0]%W-v[0]%W)**2+((u[0]/W|0)-(v[0]/W|0))**2;if(e>bd){bd=e;a=u;b=v}}if(bd<4)continue;
  for(const[e,ox,oy]of[a,b]){if(rd(e)||!free(e))continue;const ex=e%W,ey=e/W|0;let best=null,bt=-1,bl=1e9;
   for(let ty=ey-r;ty<=ey+r;ty++)for(let tx=ex-r;tx<=ex+r;tx++){if(!inb(tx,ty)||!rd(ty*W+tx))continue;const dx=tx-ex,dy=ty-ey;if(ox*dx+oy*dy<0)continue;
    const p=octi(ex,ey,tx,ty).slice(0,-1),l=p.length+Math.hypot(dx,dy)*.01;if(l<bl&&p.every(free)){bl=l;best=p;bt=ty*W+tx}}
   if(!best)continue;for(const j of best){const o=place('road',j%W,j/W|0,0,true);o.h=1;DECO[j]=0}linkRoute(best.concat(bt))}}}
function dropOrphanBridges(){const seen=new Set();for(let i=0;i<W*H;i++){if(S.tiles[i]!==BRIDGE||seen.has(i))continue;const q=[i];seen.add(i);let ends=0;
  for(let h=0;h<q.length;h++){const k=q[h],x=k%W,y=k/W|0;for(const[dx,dy]of D4){if(!inb(x+dx,y+dy))continue;const n=(y+dy)*W+x+dx;if(S.tiles[n]===BRIDGE){if(!seen.has(n)){seen.add(n);q.push(n)}}else if(S.b[n]&&S.b[n].t==='road')ends++}}
  if(ends<2)for(const k of q){S.tiles[k]=WATER;tcolSet(k)}}}
/* with the Ring laid wider than the old town (L.old), a street of the old town that ends near the old edge runs on across the Glacis to
   the Ring, and a road from the suburbs that starts on the Glacis starts at the Ring instead */
function ringGates(wp,pts){const near=g=>{let b=S.ringT[0],bd=1e9;for(const i of S.ringT){const d=(i%W-g[0])**2+((i/W|0)-g[1])**2;if(d<bd){bd=d;b=i}}return b};
 for(const end of[0,1]){const q=end?pts[pts.length-1]:pts[0],inO=inPoly(q[0],q[1],L.old),inR=inPoly(q[0],q[1],L.ring);if(!inR||inO&&pdist(q[0],q[1],L.old)/TU>=8)continue;
  const r=near(ringE(q[0],q[1])),at=end?wp.length-1:0;if(inO){if(end)wp.push(r);else wp.unshift(r)}else wp[at]=r}}
function ringTiles(){if(S.ringV===2)return ringReal();if(L.ringOct)return ringOct(L.ringOct);const p_=routeWP(wpts(L.ring,7),{water:40,turn:.8,box:24});bridgeWet(p_);const seen=new Set();return p_.filter(i=>!seen.has(i)&&seen.add(i))}
/* a ring that closes on itself (Vienna's Ring with its Kai) is laid as a convex octagon of long straight and diagonal runs, never a
   zigzag: each of its eight sides starts on the real line's outermost point that way and is drawn in a tile at a time until the ring
   encloses no water and keeps a tile of land from it (only the quay side may run on the water's edge), then each side is let out again
   as far as it can go. Every corner is cut by a diagonal of at least o.cut tiles */
function ringOct(o){const P=L.ring.map(q=>gt(q[0],q[1])),N8=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]],NL=N8.map(([a,b])=>Math.hypot(a,b)),c=o.cut||3;
 const d0=N8.map(([a,b])=>Math.max(...P.map(([x,y])=>a*x+b*y))),d=d0.slice(),xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const wet=i=>S.tiles[i]===WATER||S.tiles[i]===BRIDGE||S.tiles[i]===MOUNT,near=(x,y,r)=>{for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++)if(!inb(x+a,y+b)||wet((y+b)*W+x+a))return true;return false};
 const cap=k=>k&1?Math.min(d0[k],d[k-1]+d[(k+1)%8]-c):d0[k];
 /* the sides that must come in: a side tile too near the water moves its own side (a corner its diagonal), water inside the ring the side nearest it */
 const scan=T=>{const mv=new Set();for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let t=0,ok=true,mk=-1,ms=1e9;for(let k=0;k<8;k++){const v=N8[k][0]*x+N8[k][1]*y;if(v>d[k]){ok=false;break}if(v===d[k])t|=1<<k;const s=(d[k]-v)/NL[k]-(k&1?.01:0);if(s<ms){ms=s;mk=k}}
  if(!ok)continue;if(T&&t)T.push([x,y]);if(t?near(x,y,t>>o.quay&1?0:1):wet(y*W+x)){if(t){mk=-1;for(let k=0;k<8;k++)if(t>>k&1&&(mk<0||k&1))mk=k}mv.add(mk)}}for(let k=1;k<8;k+=2)if(d[k]>cap(k))mv.add(k);return mv};
 for(let n=0;n<160;n++){const mv=scan();if(!mv.size)break;for(const k of mv)d[k]--}
 for(let n=0;n<4;n++){let ch=false;for(const k of[0,2,4,6,1,3,5,7])while(d[k]<cap(k)){d[k]++;if(scan().size){d[k]--;break}ch=true}if(!ch)break}
 const T=[];scan(T);let cx=0,cy=0;for(const[x,y]of T){cx+=x;cy+=y}cx/=T.length;cy/=T.length;T.sort((a,b)=>Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx));
 /* the same way round as the real line, from the point nearest its start */
 let ar=0;for(let k=0;k<P.length-1;k++)ar+=P[k][0]*P[k+1][1]-P[k+1][0]*P[k][1];if(ar<0)T.reverse();let s0=0,bd=1e9;for(let k=0;k<T.length;k++){const e=(T[k][0]-P[0][0])**2+(T[k][1]-P[0][1])**2;if(e<bd){bd=e;s0=k}}
 return T.slice(s0).concat(T.slice(0,s0)).map(([x,y])=>y*W+x)}
/* the Ring on its real line (new games, S.ringV=2): the real Ring traced in long straight and diagonal runs; where the map's canal or the
   Wien lies on the line or beyond it (the Kai runs on the canal's bank), the point is drawn in towards the cathedral to the last tile that
   keeps two tiles of land from the water. L.ring follows, so plots inside it, beside it and the palais lots go by the same line */
/* RINGV2S: the new games' Ring size against the real line (1 would be true scale, 1.6 by 1.5 km on the map). The map is 36 m a tile
   while the 3D city is drawn at 10 m a tile, so at true scale the landmarks' lots looked about three times too big: the owner chose
   half as large again, the size of the older games' Ring. What lies on and inside the Ring moves out with it (ringStretch) */
const RINGV2S=1.5;
function ringReal(){const c=L.ringC,P=L.old.map(q=>gt(c[0]+(q[0]-c[0])*RINGV2S,c[1]+(q[1]-c[1])*RINGV2S)),cx=P.reduce((a,p)=>a+p[0],0)/P.length,cy=P.reduce((a,p)=>a+p[1],0)/P.length;
 const wetNear=(x,y)=>{for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const t=inb(x+a,y+b)?S.tiles[(y+b)*W+x+a]:WATER;if(t===WATER||t===BRIDGE)return true}return false};
 const Q=P.map(([x,y])=>{const d=Math.hypot(x-cx,y-cy)||1;let fx=x,fy=y;for(let k=0;k<=d;k++){const ax=Math.round(cx+(x-cx)*k/d),ay=Math.round(cy+(y-cy)*k/d);if(wetNear(ax,ay))break;fx=ax;fy=ay}return geo(fx,fy)});
 L.ring=Q;return ringTilesOld(5)}
function ringTilesOld(ms=13){const raw=octiRoute(L.ring,ms),out=[];let last=-1,wet=[];
 for(const i of raw){if(S.tiles[i]===WATER){wet.push(i);continue}if(wet.length&&last>=0){const p_=landPath(last,i,6000),dd=Math.max(Math.abs(last%W-i%W),Math.abs((last/W|0)-(i/W|0)));
  if(p_&&p_.length<=dd*2.2+4)for(const j of p_.slice(1,-1))out.push(j);else for(const j of wet){S.tiles[j]=BRIDGE;tcolSet(j);out.push(j)}}wet=[];if(out[out.length-1]!==i)out.push(i);last=i}
 const seen=new Set();return out.filter(i=>!seen.has(i)&&seen.add(i))}
function ringPct(){if(!S.ringT)return 0;let n=0;for(const i of S.ringT)if(S.b[i]&&S.b[i].t==='road')n++;return n/Math.max(1,S.ringT.length)}
function ringDistT(x,y){const[E,S2]=geo(x,y);return pdist(E,S2,L.ring)/TU}
function applyRing(){for(const i of S.ringT){if(!S.b[i]&&S.tiles[i]!==BRIDGE&&S.tiles[i]!==WATER){const o=place('road',i%W,i/W|0,0,true);o.h=1}const o=S.b[i];if(o&&o.t==='road')o.k='ring'}linkRoute(S.ringT);
 for(const i of S.ringT){const x=i%W,y=i/W|0;for(const[dx,dy]of D4){const n=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&!S.b[n]&&S.tiles[n]===GRASS&&!RINGSET.has(n))DECO[n]=ALLEE}}GV++}
function checkRing(){if(!S.ringT||S.ringDone||ringPct()<.9)return;S.ringDone=1;applyRing();recompute();
 const early=S.t<=yT(1865,5);S.prest+=100+(early?50:0);sfx('chime');
 evOv('The Fifth Avenue opens',`${early?'Ahead of history! ':''}Fifth Avenue is laid out and paved from Washington Square up the island to Central Park, lined with trees, the finest street in the city.<br><br>Fifth Avenue lots now sell for half as much again. 👑 +${100+(early?50:0)} prestige.`)}
function plotValue(o,m){const[cx,cy]=fc(o),d=ringDistT(cx,cy),[E,S2]=geo(cx,cy),inside=inPoly(E,S2,L.ring);
 let v=m==='palais'?450*(S.ringDone?1.5:1):inside?150:d<9?110:ZONE[Math.round(cy)*W+Math.round(cx)]===0?50:30;if(S.slump>S.t)v*=.45;if(LAW().bauordnung)v*=.9;if(S.boom>S.t)v*=1.2;return Math.round(v/5)*5}
function afterPlace(o,m){const d=B[m];
 if(o.t==='house'){const v=plotValue(o,m);o.plotV=v;S.stock.gold+=v;float(o.x+1,o.y+1,`+${money(v,1)} plot sold`);sfx('chime');o.bld=m==='palais'?{bricks:12,stone:8,wood:4}:{bricks:6,wood:2};o.pop=0}
 else if(d.proj){o.bld=Object.assign({},d.proj);toast(`🏗️ Work on the ${d.n} begins`)}
 if(o.bld)o.bld0=Object.values(o.bld).reduce((a,b)=>a+b,0);recompute()}
const siteProg=o=>o.bld&&o.bld0?1-Object.values(o.bld).reduce((a,b)=>a+Math.max(0,b),0)/o.bld0:1;
const REAL={};
Object.assign(REAL,{stephan:'Trinity Church, finished in 1846, was the tallest building in New York until 1890.',votiv:'The real St. Patrick\'s Cathedral was dedicated in May 1879.',stadtpark:'Central Park was built from 1858 and largely finished by 1876.',reichsbruecke:'The real Brooklyn Bridge opened on 24 May 1883, the longest suspension bridge in the world.',liberty:'The real Statue of Liberty was dedicated on 28 October 1886.',oper:'The real Metropolitan Opera House opened on Broadway in October 1883.',musikverein:'The real Carnegie Hall opened in May 1891 with Tchaikovsky conducting.',flatiron:'The real Flatiron Building was finished in 1902.',burgtheater:'The real Grand Central Terminal opened in February 1913.',universitaet:'The real New York Public Library opened in May 1911.',imperial:'The real Waldorf Hotel opened in 1893 on Fifth Avenue.',epstein:'William K. Vanderbilt\'s mansion on Fifth Avenue was finished in 1882.',rossauer:'The real Seventh Regiment Armory was finished in 1880.',tiergarten:'The Central Park menagerie began in the 1860s.',brunnen:'The real Bethesda Fountain was unveiled in 1873.',parkrow:'The real Park Row Building opened in 1899 and was the world\'s tallest office building.',singer:'The real Singer Building was finished in 1908.',metlife:'The real Metropolitan Life Tower was the world\'s tallest building from 1909 to 1913.',woolworth:'The real Woolworth Building opened in April 1913, 241 metres tall.'});
/* the year a house was last built or raised: the 3D city draws it in the style of that year */
function hEra(o,y){o.ey=y||Math.floor(Y0+S.t/YEAR);if(o.h)(S.hey=S.hey||{})[o.x+','+o.y]=o.ey}
function finishBuild(o){if(o.t==='reichsbruecke')finishBridge(o);{const k=o.t==='reichsbruecke'?'bridge':o.t==='liberty'?'liberty':'';if(k&&!(S.hd||{})[k]){(S.hd=S.hd||{})[k]=1;setTimeout(()=>{if(S)histStart(k)},0)}}if(o.t==='house'){hEra(o);float(o.x+1,o.y+1,o.lvl===6?'🏛️ Mansion finished':'🏠 Home built');return}
 const e=lmEntry(o.t);if(!e)return;const early=!!e.due&&S.t<=yT(e.due[0],e.due[1]),pts=80+(early?40:0);S.prest+=pts;sfx('chime');
 const nm=`${/^(St\.|Central|Carnegie|Grand|Bethesda|Brooklyn|Trinity)/.test(B[o.t].n)?'':'The '}${B[o.t].n} is finished`;
 /* in the first year of a city, a landmark that was already rising when the game began is finished with a note, not a card */
 if(L.prebuild&&S.t<yT(1866,5)){toast(`🏛️ ${nm} 👑 +${pts}`);return}
 evOv(nm,`${early?'You beat history! ':''}${(NYC()?REAL:W_REAL)[o.t]||''}<br><br>👑 +${pts} prestige.`)}
function tearWall(o){const c=40;if(S.stock.gold<c){toast(`Tearing down a wall section costs ${c} 🪙`);return}
 const[ox,oy]=fc(o),sec=S.list.filter(q=>q.t==='bastion'&&Math.hypot(fc(q)[0]-ox,fc(q)[1]-oy)<=5.2);S.stock.gold-=c;let st=0;
 for(const q of sec){for(const[fx,fy]of footTiles(q.t,q.x,q.y))S.b[fy*W+fx]=null;S.list.splice(S.list.indexOf(q),1);S.wallGone.push(q.x*1000+q.y);st+=4}
 S.stock.stone=Math.min(cap(),S.stock.stone+st);float(o.x,o.y,`+${st} 🪨`);sfx('build');GV++;recompute();
 if(!S.list.some(q=>q.t==='bastion')&&!S.wallsDone){S.wallsDone=1;S.prest+=50;evOv('The walls are gone','The last of the old bastions has been torn down. For the first time in centuries, the inner city opens freely onto the Glacis. 👑 +50 prestige.')}}
function jumpTo(x,y){if(Z<.4)Z=.55;centerOn(x,y);gGV=-1}
function jumpNear(list){const c=pick(vw/2,vh/2);let b=null,bd=1e9;for(const[x,y]of list){const d=Math.hypot(x-c.x,y-c.y);if(d<bd){bd=d;b=[x,y]}}if(b)jumpTo(b[0],b[1])}
const reqOpen=()=>(S.q?QUESTS.filter(q=>!q.quiet&&S.q[q.id]&&S.q[q.id].st==='active'):[]).sort((a,b)=>S.q[a.id].due-S.q[b.id].due)[0];
function hintAct(){const a=HINTA;if(!a)return;if(a==='case'){const cs=S.case;if(cs)walkOn(cs.ti[cs.n]);return}
 if(a==='walls'){setMode('demolish');jumpNear(S.list.filter(q=>q.t==='bastion').map(fc))}
 else if(a==='ring'){setMode('road');jumpNear(S.ringT.filter(i=>!S.b[i]).map(i=>[i%W,i/W|0]))}
 else if(a==='road')setMode('road');
 else if(a==='hall')showCityHall();
 else if(a==='research')showResearch();
 else if(a==='inv'){const p_=invPos();if(p_)jumpTo(p_[0],p_[1])}
 else if(B[a]){const site=S.list.find(o=>o.t===a&&!o.h);if(site&&B[a].lm){jumpTo(site.x+2,site.y+2);openInfo(site);return}setMode(a);if(B[a].lm){const rp=lmReal(a);if(rp){jumpTo(rp[0],rp[1]);const f=B[a].foot||1,nv=nearValid(a,Math.round(rp[0]-(f-1)/2),Math.round(rp[1]-(f-1)/2),12);if(nv){pend=nv.join(',');hover={x:nv[0]+((f-1)>>1),y:nv[1]+((f-1)>>1)};confShow('build')}}}else findSpot()}}
function OLD_drawSite(o,cx,cy,t){const f=B[o.t].foot||1,t2=t/2,pr=siteProg(o),k=f*.46;
 poly([cx,cy-t2*f*.95,cx+t*f*.95,cy,cx,cy+t2*f*.95,cx-t*f*.95,cy],'#b8a17c');
 const h=Math.max(.15,pr)*t*(o.t==='house'?1.5:1.9),ux=t*k,uy=t2*k,C=[cx,cy+t2*k*2],R_=[cx+t*k*2*.5+ux*0,cy];
 const Lf=[cx-ux-ux*0,cy],Cc=[cx,cy+uy*2-uy];
 // walls rising
 const A=[cx-t*k,cy],Bp=[cx,cy+t2*k],Cp=[cx+t*k,cy];
 poly([...A,...Bp,Bp[0],Bp[1]-h,A[0],A[1]-h],'#c98a62');poly([...Bp,...Cp,Cp[0],Cp[1]-h,Bp[0],Bp[1]-h],'#a86e4c');
 poly([A[0],A[1]-h,Bp[0],Bp[1]-h,Cp[0],Cp[1]-h,cx,cy-t2*k-h],'#d9a27a');
 // scaffolding
 ctx.strokeStyle='#7a5a3a';ctx.lineWidth=Math.max(.6,t*.05);ctx.beginPath();
 for(let s=0;s<=4;s++){const p=[A[0]+(Bp[0]-A[0])*s/4,A[1]+(Bp[1]-A[1])*s/4],q=[Bp[0]+(Cp[0]-Bp[0])*s/4,Bp[1]+(Cp[1]-Bp[1])*s/4];ctx.moveTo(p[0],p[1]+2);ctx.lineTo(p[0],p[1]-h-t*.15);ctx.moveTo(q[0],q[1]+2);ctx.lineTo(q[0],q[1]-h-t*.15)}
 for(let l=1;l<=3;l++){const y=h*l/3;ctx.moveTo(A[0],A[1]-y);ctx.lineTo(Bp[0],Bp[1]-y);ctx.lineTo(Cp[0],Cp[1]-y)}ctx.stroke();
 // crane
 const kx=cx+t*k*.3,ky=cy-t2*k*.6,kh=h+t*1.3;ctx.strokeStyle='#c9a227';ctx.lineWidth=Math.max(.8,t*.07);ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(kx,ky-kh);ctx.lineTo(kx-t*1.1,ky-kh+t*.12);ctx.moveTo(kx,ky-kh);ctx.lineTo(kx+t*.4,ky-kh+t*.08);ctx.stroke();
 ctx.strokeStyle='#333';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(kx-t*.9,ky-kh+t*.1);ctx.lineTo(kx-t*.9,ky-kh+t*.6);ctx.stroke();
 // material piles
 const piles=[['#b5583a',-.55],['#a7a297',.45],['#9c7448',.1]];for(const[c,d]of piles){const px=cx+d*t*f*.5,py=cy+t2*f*.55;poly([px-t*.18,py,px,py+t2*.18,px+t*.18,py,px,py-t2*.18],c);poly([px-t*.18,py,px,py+t2*.18,px,py+t2*.18-t*.12,px-t*.18,py-t*.12],shade(c,.8));poly([px,py+t2*.18,px+t*.18,py,px+t*.18,py-t*.12,px,py+t2*.18-t*.12],shade(c,.65))}}
function drawBastion(cx,cy,hw,hh){const t=hw/2,t2=hh/2,h=t*.6,P_=(u,v,z)=>[cx+(u-v)*t,cy+(u+v)*t2-(z||0)];
 const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>[u*.98,v*.98]);
 const g=pts.map(([u,v])=>P_(u,v)),tp=pts.map(([u,v])=>P_(u*.85,v*.85,h));
 poly([...g[3],...g[2],...tp[2],...tp[3]],'#c2b497');poly([...g[2],...g[1],...tp[1],...tp[2]],'#9d917a');
 poly([...tp[0],...tp[1],...tp[2],...tp[3]],'#86a14c');
 ctx.strokeStyle='rgba(60,50,40,.35)';ctx.lineWidth=.6;ctx.beginPath();for(let l=1;l<3;l++){const y=h*l/3;ctx.moveTo(g[3][0],g[3][1]-y);ctx.lineTo(g[2][0],g[2][1]-y);ctx.lineTo(g[1][0],g[1][1]-y)}ctx.stroke()}
const RB={kursalon:{w:1.8,d:1.0,f:2,k:0,roof:'#74706a',mid:[.55,1.15,3,6,'#74706a'],terr:1},
 kuenstler:{w:1.7,d:1.3,f:2,k:3,roof:'#8a4a36',mid:[.6,1.4,3,3,'#8a4a36'],ped:1},
 epstein:{w:1.6,d:1.6,f:4,k:3,roof:'#67635e',corner:1},ephrussi:{w:1.6,d:1.6,f:4,k:5,roof:'#74706a',corner:1,dome:1},
 imperial:{w:1.8,d:1.5,f:5,k:3,roof:'#5f8e7c',mid:[.5,1.55,6,3,'#5f8e7c'],flag:1},
 burgtheater:{w:1.9,d:1.4,f:4,k:12,roof:'#5f8e7c',mid:[.7,1.6,5,3,'#5f8e7c'],ped:1,flag:1},
 hofburg:{w:1.8,d:.9,f:2,k:3,roof:'#5f8e7c',mid:[.5,1.1,3,2,'#5f8e7c'],flag:1},
 universitaet:{w:1.9,d:1.6,f:4,k:3,roof:'#67635e',mid:[.6,1.7,5,3,'#5f8e7c'],ped:1},rossauer:{w:1.9,d:1.9,f:3,k:8,roof:'#74706a',corner:1,flag:1}};
function drawRingB(k,cx,cy,hw,hh){const c=RB[k],ds=B[k].ds||1,t=hw/ds,t2=hh/ds,tex=t>=4.5,fh=.3*t;
 if(c.terr)poly([cx-t*2,cy,cx,cy-t2*2,cx+t*2,cy,cx,cy+t2*2],'#d9cba8');
 prismTex(cx,cy,c.w,c.d,c.f*fh+.25*t,c.k,c.f,c.roof,t*.45,t,t2,tex);
 if(c.mid){const[ax,ay,f,kk,rf]=c.mid,mx=cx+(c.d-ay*.0)*0,my=cy;prismTex(mx-t*(c.d-.1)*0,my+t2*(c.d*.0),ax,ay,f*fh+.3*t,kk,f,rf,t*.5,t,t2,tex);
  if(c.ped){const a=[cx-t*ax+t*ay*0,cy],b=[cx+t*ax,cy];const P1=[cx-t*ax-t*ay*.0+(-t*ay),cy-t2*ax*0+t2*ay],h=f*fh+.3*t;const L1=[cx-t*ax-t*ay,cy-t2*ax+t2*ay-h],L2=[cx+t*ax-t*ay,cy+t2*ax+t2*ay-h];poly([...L1,...L2,(L1[0]+L2[0])/2,(L1[1]+L2[1])/2-t*.7],'#efe5cc')}}
 if(c.corner){const h=c.f*fh+.25*t;for(const[u,v]of[[c.w,c.d],[c.w,-c.d],[-c.w,c.d]]){const px=cx+(u-v)*t*.98,py=cy+(u+v)*t2*.98-h;ctx.fillStyle='#e8dcc0';ctx.fillRect(px-t*.18,py-t*.4,t*.36,t*.4);
   if(c.dome){ctx.beginPath();ctx.ellipse(px,py-t*.4,t*.2,t*.28,0,Math.PI,0);ctx.fillStyle='#5f8e7c';ctx.fill()}else{ctx.fillStyle='#d4c6a6';ctx.fillRect(px-t*.22,py-t*.46,t*.44,t*.08)}}}
 if(c.flag){const h=c.f*fh+.3*t+t*.6,px=cx,py=cy+t2*.0-h;ctx.strokeStyle='#3a3530';ctx.lineWidth=Math.max(.6,t*.04);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-t*.9);ctx.stroke();poly([px,py-t*.9,px+t*.5,py-t*.78,px,py-t*.62],'#c0392b');poly([px,py-t*.81,px+t*.5,py-t*.69,px+t*.5,py-t*.75,px,py-t*.87],'#f4f1ea')}
 if(c.terr){for(const[u,v]of[[1.7,1.6],[-.4,1.7],[.9,1.75]]){const px=cx+(u-v)*t,py=cy+(u+v)*t2;treeR(px,py,t*.13,TREEC[1])}}}
/* ---------- detailed Trinity Church and markets ---------- */
function drawStephan(cx,cy,hw,hh){return drawTrinity(cx,cy,hw,hh)}
function drawTrinity(cx,cy,hw,hh){const t=hw/6,t2=hh/6,tex=t>=3.5,S_=(u,v,h=0)=>[cx+(u-v)*t,cy+(u+v)*t2-h];poly([...S_(-3,-3),...S_(3,-3),...S_(3,3),...S_(-3,3)],'#7a8a5a');
 for(let i=0;i<14;i++){const u=-2.6+(i*1.37)%5.2,v=-2.6+(i*2.11)%5.2;if(Math.abs(u)<1.6&&Math.abs(v)<1.2)continue;const[x,y]=S_(u,v);ctx.fillStyle='#d9d2c2';ctx.fillRect(x-.06*t,y-.22*t,.12*t,.22*t)}
 const[nx,ny]=S_(.3,0);prismTex(nx,ny,1.7,.75,1.5*t,7,2,'#4a4540',1.2*t,t,t2,tex);
 const tier=(u,v,a,h0,h1)=>{const[x,y]=S_(u,v);prismTex(x,y-h0,a,a,h1-h0,7,Math.max(1,Math.round((h1-h0)/(.9*t))),'#5a3a2e',.01,t,t2,tex)};tier(-1.8,0,.5,0,2.4*t);tier(-1.8,0,.42,2.4*t,3.6*t);
 {const[x,y]=S_(-1.8,0,3.6*t),a=.4*t,ht=3.4*t;poly([x-a,y,x,y+a*.5,x,y-ht],'#7a5444');poly([x,y+a*.5,x+a,y,x,y-ht],'#5a3a2e');ctx.fillStyle='#d9a92a';ctx.fillRect(x-.03*t,y-ht-.3*t,.06*t,.3*t)}}
function drawStephan_V(cx,cy,hw,hh){const t=hw/6,t2=hh/6,tex=t>=3.5,S_=(u,v,h=0)=>[cx+(u-v)*t,cy+(u+v)*t2-h];
 poly([...S_(-3,-3),...S_(3,-3),...S_(3,3),...S_(-3,3)],'#cfc6b4');
 const tier=(u,v,a,h0,h1,k)=>{const[x,y]=S_(u,v);prismTex(x,y-h0,a,a,h1-h0,k,Math.max(1,Math.round((h1-h0)/(.9*t))),'#8a8170',.01,t,t2,tex)};
 // north tower stump with its Renaissance cupola (behind the nave)
 tier(-.4,-1.35,.5,0,1.9*t,7);{const[x,y]=S_(-.4,-1.35,1.9*t);ctx.fillStyle='#e8dcc0';ctx.fillRect(x-.25*t,y-.35*t,.5*t,.35*t);ctx.beginPath();ctx.ellipse(x,y-.35*t,.32*t,.42*t,0,Math.PI,0);ctx.fillStyle='#4f8f74';ctx.fill();ctx.fillStyle='#d9a92a';ctx.fillRect(x-.03*t,y-1*t,.06*t,.3*t)}
 // the nave and choir with the famous patterned roof
 const[nx,ny]=S_(-.5,0),h=1.7*t,ax=2.3,ay=.95,rh=2.1*t;prismTex(nx,ny,ax,ay,h,7,2,'#6e6448',rh,t,t2,tex);
 {const ux=t*ax,uy=t2*ax,vx=-t*ay,vy=t2*ay,q=ax-ay,Lf=[nx-ux+vx,ny-uy+vy-h],C=[nx+ux+vx,ny+uy+vy-h],P1=[nx+t*q,ny+t2*q-h-rh],P2=[nx-t*q,ny-t2*q-h-rh];
  ctx.save();ctx.beginPath();ctx.moveTo(...Lf);ctx.lineTo(...C);ctx.lineTo(...P1);ctx.lineTo(...P2);ctx.closePath();ctx.clip();
  const cols=['#d9b13b','#2f6a4a','#e8e0c8','#2a2522'];for(let r=0;r<9;r++){const f0=r/9,a=[Lf[0]+(P2[0]-Lf[0])*f0,Lf[1]+(P2[1]-Lf[1])*f0],b=[C[0]+(P1[0]-C[0])*f0,C[1]+(P1[1]-C[1])*f0];
   ctx.strokeStyle=cols[r%4];ctx.lineWidth=Math.max(1,t*.12);ctx.beginPath();const n=14;for(let i=0;i<=n;i++){const x=a[0]+(b[0]-a[0])*i/n,y=a[1]+(b[1]-a[1])*i/n+(i%2?-t*.16:t*.16);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}ctx.restore()}
 // the two Heathen Towers at the west front
 for(const v of[-.55,.55]){const[x,y]=S_(-2.95,v);tier(-2.95,v,.28,0,2.1*t,7);const[px,py]=S_(-2.95,v,2.1*t);poly([px-.3*t,py,px,py+.15*t,px+.3*t,py,px,py-.9*t],'#8a8170')}
 // the south tower, the Steffl
 const su=-.1,sv=1.4;tier(su,sv,.45,0,2.3*t,7);tier(su,sv,.38,2.3*t,4.1*t,7);tier(su,sv,.31,4.1*t,5.5*t,7);
 {const[x,y]=S_(su,sv,5.5*t),a=.33*t,ht=4.6*t;poly([x-a,y,x,y+a*.5,x,y-ht],'#c9bc98');poly([x,y+a*.5,x+a,y,x,y-ht],'#a99c7a');
  ctx.strokeStyle='rgba(70,60,40,.5)';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();for(let i=1;i<7;i++){const f=i/7;ctx.moveTo(x-a*(1-f),y-ht*f);ctx.lineTo(x+a*(1-f),y-ht*f)}ctx.stroke();
  ctx.fillStyle='#d9a92a';ctx.beginPath();ctx.arc(x,y-ht-.08*t,.07*t,0,7);ctx.fill()}}
function OLD_drawMarket(cx,cy,hw,hh,o){const t=hw/4,t2=hh/4,S_=(u,v,h=0)=>[cx+(u-v)*t,cy+(u+v)*t2-h];
 poly([...S_(-1.9,-1.9),...S_(1.9,-1.9),...S_(1.9,1.9),...S_(-1.9,1.9)],'#d6cdb9');
 if(o&&o.up2){prismTex(cx,cy,1.7,1.2,1.3*t,4,2,'#9fb7c2',.8*t,t,t2,t>=4.5);const[ax,ay]=S_(0,0,1.3*t+.8*t);ctx.fillStyle='#d9a92a';ctx.fillRect(ax-.04*t,ay-.4*t,.08*t,.4*t);return}
 const aw=[['#b8322a','#f4f1ea'],['#2f6f5e','#f4f1ea'],['#3d5a8a','#f4f1ea'],['#c9a227','#7a3b2e']];const spots=[];
 for(const u of[-1.25,0,1.25])for(const v of[-1.25,0,1.25])if(u||v)spots.push([u,v]);spots.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
 let k=0;for(const[u,v]of spots){if(u===-1.25&&v===-1.25)continue;const[x,y]=S_(u,v),c=aw[(k++)%4],w=t*.42,h=t*.36;
  poly([x-w,y,x,y+w*.5,x,y+w*.5-h,x-w,y-h],'#9c7448');poly([x,y+w*.5,x+w,y,x+w,y-h,x,y+w*.5-h],'#7a5532');
  for(let s=0;s<4;s++){const f0=s/4,f1=(s+1)/4,A=[x-w*1.15+w*1.15*f0,y-h+w*.58*f0+w*.1],Bq=[x-w*1.15+w*1.15*f1,y-h+w*.58*f1+w*.1];poly([...A,...Bq,Bq[0]+w*.55,Bq[1]-w*.75,A[0]+w*.55,A[1]-w*.75],c[s%2])}
  for(let s=0;s<3;s++){ctx.fillStyle=['#d9483a','#e8c547','#6b8f3a'][s];ctx.beginPath();ctx.arc(x-w*.4+s*w*.3,y-h*.55+s*w*.15,t*.05,0,7);ctx.fill()}}
 const[px,py]=S_(-1.25,-1.25);prismTex(px,py,.55,.55,1.1*t,0,2,'#5f8e7c',.45*t,t,t2,t>=4.5);
 const[ux,uy]=S_(-1.25,-1.25,1.1*t+.45*t);ctx.fillStyle='#d9a92a';ctx.fillRect(ux-.03*t,uy-.35*t,.06*t,.35*t)}

function drawLandmark3(k,cx,cy,z,hw,hh,now){const ds=B[k].ds||1,t=hw/ds,t2=hh/ds;
 if(k==='stadtpark'){const f=B[k].foot/2;poly([cx,cy-t2*f,cx+t*f,cy,cx,cy+t2*f,cx-t*f,cy],'#7fa552');
  ctx.strokeStyle='#e3d3a8';ctx.lineWidth=Math.max(1,t*.18);ctx.beginPath();ctx.moveTo(cx-t*f*.8,cy);ctx.quadraticCurveTo(cx,cy-t2*f*.5,cx+t*f*.8,cy);ctx.moveTo(cx,cy-t2*f*.8);ctx.quadraticCurveTo(cx+t*f*.25,cy,cx,cy+t2*f*.8);ctx.stroke();
  ctx.beginPath();ctx.ellipse(cx-t*f*.3,cy+t2*f*.2,t*f*.28,t2*f*.22,0,0,7);ctx.fillStyle='#4f8fae';ctx.fill();ctx.strokeStyle='#cfc4a8';ctx.lineWidth=1;ctx.stroke();
  for(let i=0;i<14;i++){const a=hs(i*31+7)*2-1,b=hs(i*17+3)*2-1;if(Math.hypot(a+.3,b-.2)<.38)continue;treeR(cx+(a-b)*t*f*.42,cy+(a+b)*t2*f*.42,t*.16,TREEC[i%4])}
  prismTex(cx+t*f*.45,cy-t2*f*.3,.9,.5,t*.9,0,2,'#74706a',t*.3,t,t2,t>=4.5);return}
 if(k==='musikverein'){prismTex(cx,cy,1.8,1.15,t*1.5,1,3,'#8a4a36',t*.55,t,t2,t>=4.5);
  const a=[cx-t*1.8+t*1.15*0-t*0,cy];return}
 if(k==='rotunde'){const rx=t*3.3,ry=rx/2,hd=t*1.1,hc=t*2.6;
  ctx.beginPath();ctx.ellipse(cx,cy,rx*1.08,ry*1.08,0,0,7);ctx.fillStyle='#b8a17c';ctx.fill();
  for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5]){const px=cx+Math.cos(a)*rx*.98,py=cy+Math.sin(a)*ry*.98;if(Math.sin(a)<-.5)continue;prismTex(px,py,.55,.55,hd*.8,3,2,'#8a8f96',t*.3,t,t2,t>=4.5)}
  ctx.beginPath();ctx.ellipse(cx,cy-hd,rx,ry,0,0,Math.PI);ctx.lineTo(cx-rx,cy);ctx.ellipse(cx,cy,rx,ry,0,Math.PI,0,true);ctx.closePath();
  const gr=ctx.createLinearGradient(cx-rx,0,cx+rx,0);gr.addColorStop(0,'#efe6d2');gr.addColorStop(1,'#a99c84');ctx.fillStyle=gr;ctx.fill();
  ctx.fillStyle='rgba(40,50,60,.55)';for(let i=0;i<16;i++){const a=Math.PI*(i+.5)/16,px=cx+Math.cos(a)*rx,py=cy+Math.sin(a)*ry;ctx.fillRect(px-t*.08,py-hd*.8,t*.16,hd*.5)}
  ctx.beginPath();ctx.moveTo(cx-rx,cy-hd);ctx.ellipse(cx,cy-hd,rx,ry,0,Math.PI,0,true);ctx.lineTo(cx,cy-hd-hc);ctx.closePath();
  const g2=ctx.createLinearGradient(cx-rx,0,cx+rx,0);g2.addColorStop(0,'#b9bec4');g2.addColorStop(1,'#6d737a');ctx.fillStyle=g2;ctx.fill();
  ctx.strokeStyle='rgba(40,40,40,.25)';ctx.lineWidth=.7;ctx.beginPath();for(let i=-6;i<=6;i++){ctx.moveTo(cx+i*rx/6.5,cy-hd+Math.sqrt(Math.max(0,1-(i/6.5)**2))*ry);ctx.lineTo(cx,cy-hd-hc)}ctx.stroke();
  const ly=cy-hd-hc*.82;ctx.fillStyle='#efe6d2';ctx.fillRect(cx-t*.35,ly-t*.5,t*.7,t*.5);
  ctx.beginPath();ctx.ellipse(cx,ly-t*.5,t*.42,t*.42,0,Math.PI,0);ctx.fillStyle='#d9a92a';ctx.fill();ctx.fillStyle='#d9a92a';ctx.fillRect(cx-t*.04,ly-t*1.25,t*.08,t*.35);return}
 if(k==='brunnen'){const rx=t*1.35,ry=rx/2;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.fillStyle='#cfc5b0';ctx.fill();
  ctx.beginPath();ctx.ellipse(cx,cy-t*.12,rx*.88,ry*.88,0,0,7);ctx.fillStyle='#4f9fc8';ctx.fill();
  ctx.strokeStyle='rgba(235,248,255,.9)';ctx.lineWidth=Math.max(.8,t*.07);ctx.beginPath();
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,px=cx+Math.cos(a)*rx*.62,py=cy-t*.12+Math.sin(a)*ry*.62;ctx.moveTo(px,py);ctx.quadraticCurveTo(px+(cx-px)*.3,py-t*1.2,px+(cx-px)*.6,py-t*.2)}
  ctx.moveTo(cx,cy-t*.12);ctx.lineTo(cx,cy-t*2.4);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy-t*2.4,t*.18,0,7);ctx.fillStyle='rgba(235,248,255,.85)';ctx.fill();return}}
function hint1900(){const st=S.stock,p=popTotals(),tot=Ps(p,1),ny=NYC();const H=(t,a)=>{HINTA=a||null;return t};
 if(S.case&&CASES[S.case.k]){const c=CASES[S.case.k];return H(`🕵️ ${c.short}: ${c.steps[S.case.n].go} ›`,'case')}
 if(S.war)return H(`${dateStr(S.t)}. War: production is slower and food runs out faster`);
 const lone=S.list.find(o=>o.t!=='liberty'&&!o.r&&!o.h&&needsRoad(o)&&!o.c);if(lone)return H(`Connect your ${lone.t==='house'?(lone.lvl===6?'palais':'building'):B[lone.t].n.toLowerCase()} by road to a market ›`,'road');
 if(S.scratch){if(!S.list.some(o=>o.t==='market'))return H(`Build a market near ${ny?'Trinity Church':'the Stephansdom'}: everything you produce is delivered there ›`,'market');
  if(!cnt('garden'))return H('Build a vegetable garden for food, and connect it by road ›','garden');
  if(!cnt('sawmill'))return H(ny?'Build a timber wharf on the rivers Canal ›':'Build a timber wharf on the Danube Canal ›','sawmill');
  if(!cnt('brick'))return H('Build brickworks in the Wienerberg clay pits ›','brick');
  if(!S.list.some(o=>o.t==='house'&&!o.h))return H('Sell your first building lots near the market. Builders pay you ›','house');
}
 {const a=resAvail();if(a.length&&S.t%40<14&&!reqOpen())return H(`🔬 Ready to research: ${a[0][1]} (${a[0][2]}). Tap here ›`,'research')}
 if(cnt('kraftwerk')&&(S.stock.coal||0)<1)return H(cnt('coalyard')?'⚫ Your power stations have run out of coal: blackout! Build another coal yard ›':'⚫ Your power station needs coal: build a coal yard ›','coalyard');
 if(!S.list.some(o=>o.t==='house'&&!o.h&&o.lvl===6))return H(ny?(S.ringDone?'Sell your first Fifth Avenue lot facing Fifth Avenue. Millionaires pay well ›':'Fifth Avenue lots must face Fifth Avenue. Lay it first ›'):S.ringDone?'Sell your first palais plot on the Ringstraße. Noble families pay well ›':'Palais plots must face the Ringstraße. Lay it first ›',S.ringDone?'palais':'ring');
 if(!S.list.some(o=>o.t==='house'&&!o.h&&o.lvl<6))return H('Sell building lots along the new avenues. Their residents pay taxes ›','house');
 const wt=S.list.find(o=>o.bld&&o.c&&(o.st||'').startsWith('Waiting'));if(wt){const g=wt.st.split(' ').pop(),act={bricks:'brick',wood:'sawmill',stone:'stonewh',iron:'ironyard',food:'garden',beer:'brewery',grain:'grainf',flour:'mill',bread:'bakery',meat:'fleischer',coffee:'roester',furniture:'tischler',porcelain:'porzellan'}[g];
  return H(`Construction is waiting for ${g}. Build more ${act?B[act].n.toLowerCase()+'s':'producers'}, or let builders buy it (⚖️ Trade) ›`,act)}
 if(S.epi)return H(`🦠 ${S.epi.n} rages until ${dateStr(S.epi.t1)}. Hospitals in the poor wards save lives ›`,'spital');
 if((S.newc||0)>=1&&homelessShare()>.03)return H(`🧳 ${fmtPop(Math.round(S.newc*(S.mult||1)/100)*100)} immigrants have no homes. Sell building lots, or tap a home and build it higher ›`,'house');
 if(S.emp&&S.emp.inv&&S.emp.inv.march)return H(`⚔️ The ${ADJ(S.emp.inv.k)} army is marching on ${L.name}. Tap to see it ›`,'inv');
 if(S.emp&&S.emp.inv&&!S.emp.inv.march)return H(`⚠️ ${NATIONS.find(q=>q[0]===S.emp.inv.k)[1]} will invade on ${dateStr(S.emp.inv.at)}. Raise regiments ${ny?'in City Hall':'at the Hofburg'} ›`,'hall');
 {const act=reqOpen();if(act){const a=act.goal.type==='build'?(act.goal.k==='house4'?'house':act.goal.k):act.goal.type==='finish'?act.goal.k[0]:null;return H(`${goalIcon(act)} ${ucf(act.short)}: ${questProgress(act)}, by ${dateStr(S.q[act.id].due)} ›`,a||'hall')}}
 if(S.ctr)return H(`🎖️ The army wants ${costStr(S.ctr.need)} by ${dateStr(S.ctr.due)}. Keep it in stock`);
 if(S.refG)return H(`House the newcomers: sell ${Math.max(0,S.refG.n-S.list.filter(o=>o.t==='house'&&!o.h&&o.lvl<6).length)} more building lots by ${dateStr(S.refG.due)} ›`,'house');
 if(tot>0&&st.food<20)return H('Food is running low. Build another vegetable garden ›','garden');
 if(tot>20&&(S.hap??1)<.6){const cnt_={};for(const o of S.list)if(o.t==='house'&&!o.h&&!o.bld)for(const q of houseNeeds(o))if(!q[0])cnt_[q[2]]=(cnt_[q[2]]||0)+o.pop;const top=Object.entries(cnt_).sort((a,b)=>b[1]-a[1])[0];
  if(top)return H(`Your residents are unhappy. Most of all they miss a ${B[top[0]]?B[top[0]].n.toLowerCase():top[0]} ›`,top[0])}
 if(cnt('kraftwerk')&&(S.stock.coal||0)<1)return H(cnt('coalyard')?'⚫ Your power stations have run out of coal. Build another coal yard ›':'⚫ Your power station needs coal: build a coal yard ›','coalyard');
 if(RES().electric&&!cnt('kraftwerk')&&S.t%70<20)return H('Electricity is here: build a power station and coal yards to feed it ›','kraftwerk');
 if(RES().lohner&&!cnt('autofabrik')&&S.t%70<20)return H('Build a car factory: motor cars sell for a fortune ›','autofabrik');

 if(Ps(p,2)>0&&st.beer<15)return H('Beer is running low. Build a grain farm and another brewery ›','brewery');
 if(breadOn()&&Ps(p,2)>0&&st.bread<15)return H('Bread is running low: build a bakery, and a mill if flour is short ›',cnt('bakery')&&st.flour<1?(st.grain<1?'grainf':'mill'):'bakery');
 if(Ps(p,2)>0&&st.cloth<15)return H(cnt('weaver')?'Clothing is running low. Build more sheep farms and another textile mill ›':'Your craftsmen want clothing: build a sheep farm and a textile mill ›',cnt('sheep')?'weaver':'sheep');
 if(Ps(p,4)>0&&st.wine<15)return H(ny?'Wine is running low. Open another wine merchant on the waterfront ›':'Wine is running low. Plant another vineyard on the slopes ›','vineyard');
 if(cnt('vineyard')&&!cnt('heuriger')&&S.t%80<20)return H(ny?'Open a beer garden: visitors pay for the new wine ›':'Open a Heuriger: visitors pay for the new wine ›','heuriger');
 const op=S.list.find(o=>o.t==='oper'&&o.bld);if(op&&S.t%60<30)return H(ny?`The opera house is ${Math.round(siteProg(op)*100)}% built. The real Metropolitan Opera House opened in October 1883 ›`:`The Court Opera is ${Math.round(siteProg(op)*100)}% built. The real one opened in May 1869 ›`,'oper');
 if(p[2]+p[3]>=10&&!S.list.some(o=>(o.t==='chapel'||B[o.t].chap)&&!o.h&&!o.bld))return H(ny?'Craftsmen near a church become merchants: build a parish church ›':`Craftsmen near a church become ${LV[4].n}: build a parish church ›`,'chapel');
 {const e=(L.landmarks||[]).find(e=>lmNeedOK(e)&&!cnt(e.k));if(e&&S.t%40<20)return H(`${B[e.k].i} The ${B[e.k].n} is unlocked. Start construction near its 📍 ›`,e.k)}
 if(S.rate<0)return H('You are losing money. Sell more plots or grow your districts');
 return H(`${dateStr(S.t)}: build ${L.name}'s monuments before history does`)}
/* the Neue Burg (Vienna): the Emperor orders it himself at the Hofburg, from 1881, the year the work really began. It then rises in
   stages over NBYEARS years (the real work took until 1913). S.nb is the day he ordered it; nbStage is the state the model shows,
   as a year of the real work (0: not begun, 1913: finished), and S.nbS the last one shown */
const NBCOST={gold:5000,bricks:40,stone:30},NBYEARS=8;
function nbStage(){if(!S||S.nb==null)return 0;const p=(S.t-S.nb)/(YEAR*NBYEARS);return p>=1?1913:1881+2*Math.floor(Math.max(0,p)*16)}
function nbTick(){if(!S||NYC())return;if(S.nb==null){if(!S.nbTold&&Y0+S.t/YEAR>=1881&&S.list.some(o=>o.t==='hofburg'&&!o.bld)){S.nbTold=1;toast('👑 Majesty, you can now build the Neue Burg. Tap the Hofburg.')}return}
 const st=nbStage();if(st===S.nbS)return;S.nbS=st;GV++;if(st===1913){S.prest+=60;sfx('chime');toast('👑 The Neue Burg is finished · 👑 +60')}}
function nbCard(el){const yr=Y0+S.t/YEAR,st=nbStage();
 if(S.nb!=null){el.insertAdjacentHTML('beforeend',st===1913?'<p class="m">🏛️ The Neue Burg stands on the Heldenplatz.</p>':`<p class="m">🏗️ The Neue Burg is rising: ${Math.min(99,Math.round((S.t-S.nb)/(YEAR*NBYEARS)*100))}% done.</p>`);return}
 if(yr<1881){el.insertAdjacentHTML('beforeend','<p class="m">🏛️ From 1881 you can build the Neue Burg here: a great curved wing on the Heldenplatz.</p>');return}
 el.insertAdjacentHTML('beforeend',`<p class="m">🏛️ The Neue Burg: a great curved wing on the Heldenplatz. It takes ${NBYEARS} years to build.</p><p><button id="nbBtn" class="pri">⬆ Build the Neue Burg (${costStr(NBCOST)})</button></p>`);
 el.querySelector('#nbBtn').onclick=()=>{for(const g in NBCOST)if((S.stock[g]||0)<NBCOST[g]){toast(shortBy(g,NBCOST[g]));return}for(const g in NBCOST)S.stock[g]-=NBCOST[g];S.nb=S.t;S.nbTold=1;S.nbS=nbStage();GV++;sfx('chime');toast('🏗️ The work on the Neue Burg begins');save(true);renderInfo()}}
function infoExtra(o,tg){const el0=tg||$('#infoBody');if(o&&el0&&o.t==='hofburg'&&!o.bld&&!NYC())nbCard(el0);if(o&&el0&&o.t==='harbour'&&!o.bld){el0.insertAdjacentHTML('beforeend',`<p class="m">Route: ${Object.entries(ROUTES).map(([k,r])=>`<button data-rt="${k}" style="margin:2px;${(o.route||'pest')===k?'outline:2px solid #d9a92a':''}">${r.n}</button>`).join('')}<br>${(()=>{const r=ROUTES[o.route||'pest'];return `Sells ${Object.entries(r.sell).map(([g,v])=>ICON[g]+' '+v+' $').join(', ')} · buys ${Object.entries(r.buy).map(([g,v])=>ICON[g]+' '+v+' $').join(', ')}`})()}</p>`);
  el0.querySelectorAll('[data-rt]').forEach(b=>b.onclick=()=>{o.route=b.dataset.rt;openInfo(o)})}
 if(o&&el0&&o.t==='house'&&!o.h&&!o.bld){const n=houseNeeds(o),miss=n.filter(q=>!q[0]).map(q=>q[1]),ns=nextStage(o);
  el0.insertAdjacentHTML('beforeend',`<p class="m">👥 <b>${LV[o.lvl].n}</b> live here: ${o.pop} of ${maxPop(o)}<br>Stage ${o.lvl===6?'palais':o.lvl+' of 5'} · ${(o.hap??1)>=.75?'😊':(o.hap??1)>=.5?'😐':'😠'} Happiness ${Math.round((o.hap??1)*100)}%${SMOKEM&&SMOKEM[o.x+1+(o.y+1)*W]>.8?' · 🏭 smoky air':''}${miss.length?'. Missing: '+miss.join(', '):'. All needs met'}</p>`+
   (ns?`<p class="m"><b>To become ${ns.to}:</b><br>${ns.rq.map(q=>`${q[0]?'✅':'❌'} ${q[1].replace(/\bwood\b/,'timber')}`).join('<br>')}<br>They rise by themselves when all is met.</p>`:o.lvl===5?'<p class="m">The highest stage for a building.</p>':''))}
 if(o&&el0&&!o.bld&&B[o.t]&&B[o.t].out&&!o.h){const d=B[o.t],st=S.stock,pc=Math.round(Math.min(1,(o.p||0)/(d.time||1))*100);
  el0.insertAdjacentHTML('beforeend',`<p class="m">${whatOf(o.t)?`${o.t==='bakery'?'Bakes':o.t==='mill'?'Grinds':o.t==='farm'?'Gives':o.t==='fisher'?'Catches':'Grows'} ${whatOf(o.t)}<br>`:''}${d.in?`${st[d.in]>=1?'✅':'❌'} Needs ${ICON[d.in]} ${d.in}: <b>${Math.floor(st[d.in])}</b> in your stores${st[d.in]>=1?'':` · build ${{grain:'a grain farm',flour:'a mill',wool:'a sheep farm',iron:'an iron merchant',coal:'a coal yard'}[d.in]||'more producers'}`}<br>`:''}Makes ${ICON[d.out]} ${d.out}: <b>${Math.floor(st[d.out])}</b> of ${cap()} in your stores<br>Next batch: ${pc}%${o.st?` · ${o.st}`:''}</p>`)}
 if(o&&el0)serviceButtons(o,el0);
 if(o&&el0)tierButton(o,el0);
 if(o&&el0&&o.t==='kraftwerk'&&!o.bld){const c=Math.floor(S.stock.coal||0),n=S.list.filter(q=>q.t==='kraftwerk'&&!q.bld&&q.c).length;el0.insertAdjacentHTML('beforeend',`<p class="m">${c>=1?'✅':'❌'} Needs ⚫ coal: <b>${c}</b> in your stores · your power stations burn about ${Math.round(n*.03*60*10)/10} per minute${c>=1?'':' · <b>blackout</b>: build a coal yard (Industry)'}${cnt('coalyard')?'':'<br>You have no coal yard yet.'}</p>`)}
 if(o&&el0&&o.t==='tram'&&!o.bld){const dt=new Set(depotTiles(o)),n=TRAMS.filter(t=>t.p.some(j=>dt.has(j))).length;el0.insertAdjacentHTML('beforeend',`<p class="m">${dt.size?`✅ ${n} car${n===1?'':'s'} run from here along the lines it touches. Lay more line along the streets and they go further.`:`❌ No tram line passes the depot. Lay one along the street beside it: 🛤️ Roads &amp; rail, ${B.tramline.n}.`}</p>`)}
 if(o&&el0&&o.t==='bahnhof'&&!o.bld)el0.insertAdjacentHTML('beforeend',`<p class="m">${!stationOK(o)?'❌ No railway track touches the station. Lay one right beside it.':`${o.main?'✅ Main line to the provinces: travellers bring 40 $ per minute and materials cost 15% less.':'❌ No main line yet: run a track to the edge of the map.'}<br>${o.np?`✅ Linked to ${o.np} other station${o.np>1?'s':''}: commuters bring ${money(o.np*15)} per minute.`:'Link it to another station by track for commuter trains.'}`}</p>`);
 if(!o||!o.bld)return;const el=tg||$('#infoBody');if(!el)return;const left=Object.entries(o.bld).filter(([g,v])=>v>0).map(([g,v])=>`${ICON[g]}${Math.ceil(v)}`).join(' ');
 el.insertAdjacentHTML('beforeend',`<p class="m">🏗️ Under construction: ${Math.round(siteProg(o)*100)}% done. Still needs ${left}.</p>`)}
function showPhase1(){const done=(L.landmarks||[]).filter(e=>S.list.some(o=>o.t===e.k&&!o.bld)).map(e=>`${B[e.k].i} ${B[e.k].n}`);
 ov(`<h2>1865–1873 complete</h2><p>${NYC()?'Eight years after Fifth Avenue opened, here is how your New York has grown.':'Eight years after the Ringstraße opened, here is how your Vienna has grown.'}</p>
 <p><b>👑 ${S.prest} prestige</b> · 👥 ${fmtPop(dispPop())} people</p><p>${done.length?'Finished: '+done.join(', '):'No monuments finished yet.'}</p>
 <p class="m">${NYC()?'The next chapter, 1874–1892 with the elevated railways, the Fifth Avenue mansions, the Metropolitan Museum and Carnegie Hall, is coming in an update. You can keep building in the meantime.':'Next come the Rathaus, the Parliament, the University and the Burgtheater, and the Danube in its new bed. Keep building.'}</p>
 <div class="btns"><button class="pri" id="ovOk">Keep building</button></div>`);$('#ovOk').onclick=closeOv}

/* ---------- world ---------- */
/* money: dollars in New York; in Vienna gulden (fl.) until the currency reform of 1892, then kronen (Kr.), two to the gulden. The engine counts in one unit, only the display changes */
function KR(){try{return!!S&&!!L&&!!L.y1857&&L.name!=='New York'&&S.t>=yT(1892,1)}catch(e){return false}}
function CUR(){try{return!L||!L.y1857||L.name==='New York'?'$':KR()?'Kr.':'fl.'}catch(e){return'$'}}
function mn(v){if(!KR())return v;const n=typeof v==='number'?v:+v;return isNaN(n)?v:Math.round(n*2)}
function money(v,f){const x=mn(v);return`${f&&typeof x==='number'?fmt(x):x} ${CUR()}`}
/* a sum at the end of a sentence: one full stop, also after "fl." */
const fullStop=t=>/\.$/.test(t)?t:t+'.'
/* a Vienna text written in gulden shows in kronen after 1892 */
function flx(t){return typeof t==='string'&&KR()?t.replace(/([\d,]+) fl\./g,(m,n)=>money(+n.replace(/,/g,''),1)):t}
/* who the player is: the Mayor at City Hall in New York, Emperor Franz Joseph at the Hofburg in Vienna */
function HALLN(){return!L||L.name==='New York'||!L.y1857?'City Hall':'the Hofburg'}
function HALLB(){return HALLN()==='City Hall'?'🏛️ City Hall':'👑 Hofburg'}
function YOU(){return HALLN()==='City Hall'?'the Mayor':'the Emperor'}
/* the rival city: Chicago for New York, Budapest for Vienna */
function RIVAL(){return L&&L.name!=='New York'?'Budapest':'Chicago'}
function RIVI(){return L&&L.name!=='New York'?'🏛️':'🌆'}
let S=null,area=new Uint8Array(W*H),claim=new Uint8Array(W*H),mk=new Uint8Array(W*H),ch=new Uint8Array(W*H),dist=new Int16Array(W*H),nxt=new Int32Array(W*H);
let comp=new Int16Array(W*H),comps=[],tcol=[];

function generate(seed){
 const r=rng(seed),n1=noise(r,5*KS),n2=noise(r,4*KS),n3=noise(r,5*KS),n4=noise(r,3*KS);
 const isl=[{x:W/2,y:H/2,r:12.5*KS},{x:8*KS,y:8*KS,r:6.5*KS},{x:W-8*KS,y:H-8*KS,r:6.5*KS},{x:W-8*KS,y:8*KS,r:6*KS},{x:8*KS,y:H-8*KS,r:6*KS}];
 const t=new Uint8Array(W*H),el=new Float32Array(W*H),own=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let e=-1;for(const s of isl)e=Math.max(e,1-Math.hypot(x-s.x,y-s.y)/s.r);
  let ow=0,be=-9;isl.forEach((s,k)=>{const v=1-Math.hypot(x-s.x,y-s.y)/s.r;if(v>be){be=v;ow=k}});
  e+=(n1(x,y)-.5)*.5;if(x<2||y<2||x>W-3||y>H-3)e=-1;el[y*W+x]=e;t[y*W+x]=e>.12?GRASS:WATER;own[y*W+x]=ow}
 // keep islands apart with a channel of water
 const t0=t.slice();for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(t0[i]===WATER)continue;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const n=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&t0[n]!==WATER&&own[n]!==own[i]&&own[i]!==0)t[i]=WATER}}
 const out=t.slice();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(t[i]===WATER)continue;
  let c=false;for(const[dx,dy]of D4)if(!inb(x+dx,y+dy)||t[(y+dy)*W+x+dx]===WATER)c=true;
  if(c)out[i]=SAND;else if(n3(x,y)>.6&&el[i]>.42)out[i]=MOUNT;else if(n2(x,y)*.7+n4(x,y)*.3>.53)out[i]=FOREST}
 const main=(x,y)=>Math.hypot(x-W/2,y-H/2)<12*KS;
 let mc=0,fc=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(main(x,y)){if(out[y*W+x]===MOUNT)mc++;if(out[y*W+x]===FOREST)fc++}
 if(mc<4){const cx=W/2+5,cy=H/2-4;for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx;x++)if(out[y*W+x]!==WATER&&out[y*W+x]!==SAND)out[y*W+x]=MOUNT}
 if(fc<25){for(let y=H/2-6;y<H/2;y++)for(let x=W/2-7;x<W/2-2;x++)if(out[y*W+x]===GRASS)out[y*W+x]=FOREST}
 generate.el=el;return out;
}
function findIslands(){comp.fill(-1);comps=[];
 for(let i=0;i<W*H;i++){if(S.tiles[i]===WATER||comp[i]>=0)continue;const id=comps.length,q=[i],c={id,tiles:[],cx:0,cy:0};comp[i]=id;
  while(q.length){const k=q.pop();c.tiles.push(k);const x=k%W,y=k/W|0;c.cx+=x;c.cy+=y;
   for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(inb(nx,ny)&&S.tiles[n]!==WATER&&comp[n]<0){comp[n]=id;q.push(n)}}}
  c.cx/=c.tiles.length;c.cy/=c.tiles.length;comps.push(c)}
 if(S.level&&S.level!=='isles')return;
 const big=comps.filter(c=>c.tiles.length>=12*KS*KS).sort((a,b)=>b.tiles.length-a.tiles.length);
 comps.forEach(c=>c.fert=[]);
 const ferts=[['tobacco'],['spices','tobacco'],['spices'],['tobacco','spices'],['spices']];
 big.forEach((c,k)=>{c.fert=ferts[k]||[];c.rank=k});
 S.mainComp=big[0]?big[0].id:0;
 S.rivalComp=big.length>=2?big[big.length-1].id:-1;
 // make sure the rival's home doesn't hold the only spice land
 if(S.rivalComp>=0){const rc=comps[S.rivalComp];rc.fert=['tobacco'];if(!big.some(c=>c.id!==S.mainComp&&c.fert.includes('spices')))big.filter(c=>c.id!==S.mainComp).forEach(c=>{if(!c.fert.includes('spices'))c.fert.push('spices')})}
 fert.fill(0);for(const c of comps)for(const k of c.tiles)fert[k]=(c.fert.includes('tobacco')?1:0)|(c.fert.includes('spices')?2:0);
}
function colorTiles(){tcol=[];for(let i=0;i<W*H;i++)tcolSet(i)}
function OLD_tcolSet(i){const t=S.tiles[i];if(t===WATER||t===BRIDGE){tcol[i]=null;return}
 const x=i%W,y=i/W|0,e=k=>ELEV[k]||0,gx=e(y*W+Math.min(W-1,x+1))-e(y*W+Math.max(0,x-1)),gy=e(Math.min(H-1,y+1)*W+x)-e(Math.max(0,y-1)*W+x);
 const sh=Math.max(.7,Math.min(1.3,1+(gx+gy*.35)*2.8)),v=Math.round((.95+hs(i)*.1)*sh*(1-(ELEV[i]||0)*.07)*100)/100;
 tcol[i]=shade(t===SAND?'#dfc68a':t===GRASS?'#86a94e':t===FOREST?'#6a9142':'#9a8f78',v)}
function coast(x,y){const t=S.tiles[y*W+x];if(t!==SAND&&t!==GRASS)return false;
 for(const[dx,dy]of D4)if(inb(x+dx,y+dy)&&S.tiles[(y+dy)*W+x+dx]===WATER)return true;return false}
function waterNb(x,y){for(const[dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]])if(inb(x+dx,y+dy)&&S.tiles[(y+dy)*W+x+dx]===WATER)return[dx,dy];return null}
const mine_=o=>!o.r;
function recompute(){if(L&&L.y1857&&!S.tcol2){S.tcol2=1;for(let i=0;i<W*H;i++)tcolSet(i)}GV++;area.fill(0);claim.fill(0);mk.fill(0);ch.fill(0);
 /* New York's City Hall serves the homes round it as a market (in a city begun empty, once a first real market stands); Vienna's Hofburg does not:
    its homes need a real market in reach */
 const mk0=NYC()&&(!S.scratch||S.list.some(o=>o.t==='market'&&!o.bld));
 for(const o of S.list){let R=B[o.t].radius;if(!R||o.bld)continue;if(L.y1857&&UPG[o.t]&&!o.h)R*=radMul(o);const own=o.r?2:1,[ox,oy]=fc(o);
  for(let y=Math.max(0,Math.floor(oy-R));y<=Math.min(H-1,Math.ceil(oy+R));y++)for(let x=Math.max(0,Math.floor(ox-R));x<=Math.min(W-1,Math.ceil(ox+R));x++)
   if(Math.hypot(x-ox,y-oy)<=R+.3){const i=y*W+x;
    if(o.t==='chapel'||o.t==='monument'||B[o.t].chap){ch[i]=1;continue}
    if(!claim[i])claim[i]=own;if(o.t==='market'||B[o.t].mkt&&mk0)mk[i]=1}}
 /* in Vienna the Stephansdom is the inner city's parish church as well as its cathedral: the homes around it have their church */
 if(L.y1857&&!NYC())for(const o of S.list){if(o.t!=='stephan'||o.r)continue;const[ox,oy]=fc(o),R=B.chapel.radius||32;
  for(let y=Math.max(0,Math.floor(oy-R));y<=Math.min(H-1,Math.ceil(oy+R));y++)for(let x=Math.max(0,Math.floor(ox-R));x<=Math.min(W-1,Math.ceil(ox+R));x++)if(Math.hypot(x-ox,y-oy)<=R+.3)ch[y*W+x]=1}
 if(L.zones){for(let i=0;i<W*H;i++)area[i]=ZONE[i]<=S.limit}else for(let i=0;i<W*H;i++)area[i]=claim[i]===1;
 // road network: distance to nearest hub
 dist.fill(-1);nxt.fill(-1);const q=[];
 const isRoad=i=>S.tiles[i]===BRIDGE||(S.b[i]&&S.b[i].t==='road'&&!S.b[i].r);
 const isHub=i=>S.b[i]&&B[S.b[i].t].hub&&!S.b[i].r;
 for(const o of S.list){if(o.r||!B[o.t].hub)continue;for(const[x,y]of perim(o)){const n=y*W+x;if(inb(x,y)&&isRoad(n)&&dist[n]<0){dist[n]=0;nxt[n]=o.y*W+o.x;q.push(n)}}}
 for(let h=0;h<q.length;h++){const k=q[h];for(const n of roadNb(k)){if(isRoad(n)&&dist[n]<0){dist[n]=dist[k]+1;nxt[n]=k;q.push(n)}}}
 const vgap=L.y1857&&!NYC();
 for(const o of S.list){if(o.r||o.h||!needsRoad(o))continue;o.c=false;o.path=null;const i=o.y*W+o.x;let best=-1;
  for(const[x,y]of perim(o)){const n=y*W+x;if(!inb(x,y))continue;
   if(isHub(n)&&S.b[n]!==o){o.c=true;o.path=[i,n];break}
   if(isRoad(n)&&dist[n]>=0&&(best<0||dist[n]<dist[best]))best=n}
  if(!o.c&&best>=0){const p=[i];let c=best;while(c>=0&&isRoad(c)){p.push(c);c=nxt[c]}p.push(c);o.c=true;o.path=p}
  /* Vienna's plots lie on a grid with a narrow strip between them: a building across that strip from a market (or the Hofburg) is
     joined to it, as if built against it, so a home beside the market needs no road of its own */
  if(!o.c&&vgap){const f=B[o.t].foot||1;for(let k=0;k<f&&!o.c;k++)for(const[x,y,dx,dy]of[[o.x+k,o.y-1,0,-1],[o.x+k,o.y+f,0,1],[o.x-1,o.y+k,-1,0],[o.x+f,o.y+k,1,0]]){
    if(!inb(x,y)||!inb(x+dx,y+dy)||S.b[y*W+x])continue;const g=y*W+x,n=(y+dy)*W+x+dx;if(isHub(n)&&S.b[n]!==o){o.c=true;o.path=[i,g,n];break}}}}
 for(const o of S.list)if(!o.r&&o.path)o.home=!L.sea||comp[o.path[o.path.length-1]]===S.mainComp;
 if(L.y1857&&S.ringT&&!S.ringDone)setTimeout(checkRing,0);
 if(L.y1857)covCompute();
}
const cnt=t=>S.list.reduce((n,o)=>n+(o.t===t&&!o.r),0);
function cap(){return L.zones?150+30*cnt('market'):40+40*(cnt('kontor')-1)+20*cnt('market')}
function count(x,y,r,f){let n=0;for(let j=y-r;j<=y+r;j++)for(let i=x-r;i<=x+r;i++){if(!inb(i,j)||(i===x&&j===y))continue;if(f(j*W+i))n++}return n}
function popTotals(){const p=[0,0,0,0,0,0,0];for(const o of S.list)if(o.t==='house'&&!o.r&&!o.h)p[o.lvl]+=o.pop;return p}
function rivalPop(){let n=0;for(const o of S.list)if(o.r&&o.t==='house')n+=o.pop;return n}

function place(t,x,y,r,skip){let pal=0;if(t==='palais'){t='house';pal=1}const i=y*W+x,o={t,x,y,p:0,st:''};if(r)o.r=1;
 if(t==='house'){o.lvl=pal?6:1;o.pop=1;o.g=Math.random()*4}
 if(t==='fisher')o.wd=waterNb(x,y)||[1,0];
 if(t==='tower')o.cd=0;
 for(const[fx,fy]of footTiles(t,x,y)){const j=fy*W+fx;if(S.tiles[j]===FOREST){S.tiles[j]=GRASS;tcolSet(j)}DECO[j]=0;S.b[j]=o}
 if(B[t].lm){const rp=lmReal(t),[ox,oy]=fc(o);o.real=rp&&Math.hypot(ox-rp[0],oy-rp[1])<=(L.realR||4)?1:0}
 if((B[t].foot||1)>1)for(const[a,b]of perim(o)){if(!inb(a,b))continue;const j=b*W+a;if(S.tiles[j]===FOREST&&!(fert[j]&32)){S.tiles[j]=GRASS;tcolSet(j)}}
 GV++;S.list.push(o);if(!skip)recompute();return o}

function shoreNear(c){let best=null,bd=1e9;for(const k of c.tiles){const x=k%W,y=k/W|0;
 if(S.tiles[k]===SAND&&!S.b[k]&&coast(x,y)&&!claim[k]){const d=Math.hypot(x-c.cx,y-c.cy);if(d<bd){bd=d;best={x,y}}}}return best}
function initRival(){if(!L.rival)return;let s=null;if(S.level==='isles'){if(S.rivalComp<0)return;s=shoreNear(comps[S.rivalComp])}else{const[x,y]=gt(...prj(L,...L.rival.at));s=nearestLand(x,y,false)}if(!s)return;
 place('kontor',s.x,s.y,1);for(let k=0;k<3;k++)rivalHouse();S.rv={won:false,next:S.t+900,h:0}}
function rivalHouse(){const cand=[];
 for(let i=0;i<W*H;i++){if(claim[i]!==2||S.b[i])continue;const t=S.tiles[i];if(t===WATER||t===MOUNT||t===BRIDGE)continue;const x=i%W,y=i/W|0;
  if(count(x,y,1,n=>S.b[n]&&S.b[n].r))cand.push(i)}
 if(!cand.length)return false;const i=cand[Math.random()*cand.length|0];place('house',i%W,i/W|0,1,true);return true}

function newGame(id,seed){id=id||'isles';L=LEVELS[id];
 seed=seed||(id==='isles'?(Math.random()*1e9|0):L.seed);const w=buildWorld(id,seed);seaM=w.sea;ELEV=w.elev;DECO=w.deco;ZONE=w.zone;QUAY=w.quay||null;
 S={v:3,level:id,seed,tiles:w.t,b:new Array(W*H).fill(null),list:[],stock:Object.assign({gold:2500,food:20,wood:40,tools:15},L.stock||{}),t:0,won:false,lost:false,rate:0,pnext:420,pir:null,carts:[],ships:[],sites:[],out:{},stats:{sunk:0,raids:0,hist:[]},tax:0,up:0};
 for(const g of GOODS)S.stock[g]=S.stock[g]||0;
 claim.fill(0);findIslands();if(w.fert)fert.set(w.fert);colorTiles();setupLevel();
 if(L.prebuild){S.scratch=NEWMODE==='scratch';if(S.scratch&&L.old)S.ringV=2;startSet();S.limit=0;S.ev=0;S.war=0;S.prest=0;S.ringDone=0;S.wallGone=[];S.slump=0;S.autoBuy=true;S.t=yT(1865,5);Object.assign(S.stock,S.scratch?START0:{gold:4000,wood:80,bricks:120,stone:60,iron:20,food:120,grain:30,beer:60,wine:40,wool:20,cloth:40});if(ECO().bread){S.breadAt=S.t;Object.assign(S.stock,{flour:S.scratch?0:10,bread:S.scratch?0:40})}S.g2At=null;g2Init(!S.scratch);L.prebuild();S.base0=S.tiles.slice();
  /* a new city: no requests, voices, scenes or events for its first two minutes, only the opening card and the first steps */
  ATT=Math.max(ATT,performance.now()+120000);QUIET0=performance.now()+120000;INTROP=1;setTimeout(()=>{INTROP=0;L.intro?L.intro():S.scratch?evOv('An empty Manhattan','1 May 1865. Only Trinity Church, City Hall and Castle Garden stand at the foot of the island, with Broadway and a few streets. Everything else is yours to build: homes and markets, farms and works, wharves and monuments.<br><br>Start with homes for the newcomers from Castle Garden, then a market and food. Plots you sell pay for the rest.'):evChoice('New York, 1865','You are the Mayor. Sell lots, build the city, and beat Chicago by 1916.',[['🏠 Sell the first lots',()=>{HINTA='house';hintAct()}]])},600);
  const rh=S.list.find(o=>o.t==='market')||S.list.find(o=>o.t==='stephan');S.mainComp=comp[rh.y*W+rh.x]||0;recompute();const sd=S.list.find(o=>o.t==='stephan')||rh;Z=.35;centerOn(sd.x+3,sd.y+3);gGV=-1;return}
 let best=null,bd=1e9;
 if(id==='isles'){for(const k of comps[S.mainComp].tiles){const x=k%W,y=k/W|0;if(S.tiles[k]===SAND&&coast(x,y)){const d=Math.hypot(x-W/2,y-(H/2+3));if(d<bd){bd=d;best={x,y}}}}}
 else{const[x,y]=gt(...prj(L,...L.start));best=nearestLand(x,y,false);S.mainComp=comp[best.y*W+best.x]}
 place('kontor',best.x,best.y);initRival();recompute();
 Z=.9;centerOn(best.x,best.y);
}

/* ---------- money popups ----------
   Taxes, rents and upkeep are booked a little every tick. For the popups every home and paying building settles its
   account once a quarter, each at its own moment of the quarter: what it paid or cost since its last settling floats up
   over it, if the camera is near. PAY holds running totals per unit of tax (h), of the old city's taxes (b) and of time (u),
   so settling costs nothing until a building is looked at. */
const PAY={h:0,b:0,u:0,bm:0},PAYQ=YEAR/4;let payI=0;
function payAmt(o){const d=B[o.t];let v=0;
 if(o.t==='house'&&!o.h){if(o.pop>0)v+=o.pop*LV[o.lvl].tax*(PAY.h-o.mh)}
 else{const u=PAY.u-o.mu;if(d.tour&&!o.bld&&(!d.svc||o.st==='Open'))v+=d.tour*(o.real?2:1)*(o.h?.4:1)/60*u;if(d.sav&&!o.bld&&o.st==='Open')v+=bankInc(o)/60*u;if(!o.h||o.t==='market'||d.tour)v-=d.up*(LAW().kommunal&&(o.t==='gaswerk'||o.t==='kraftwerk'||o.t==='tram')?.5:1)*u}
 o.mh=PAY.h;o.mu=PAY.u;return v}
/* looks at n more buildings; show(o,amount) floats the amount if o is in view and the popups allow one more */
function payScan(n,show){if(!S||!L.y1857)return;const ls=S.list,N=ls.length;if(!N)return;
 for(let k=0;k<n;k++){if(payI>=N)payI=0;const o=ls[payI++];if(o.r||!B[o.t])continue;
  if(o.h&&o.t==='house'){const v=PAY.b-PAY.bm;if(v>=4&&show(o,v))PAY.bm=PAY.b;else if(v>90)PAY.bm=PAY.b;continue}
  if(o.mh===undefined){o.mh=PAY.h;o.mu=PAY.u;o.mq=Math.floor((S.t+((o.x*73+o.y*151)%97)/97*PAYQ)/PAYQ);continue}
  const q=Math.floor((S.t+((o.x*73+o.y*151)%97)/97*PAYQ)/PAYQ);if(q===o.mq)continue;o.mq=q;const v=payAmt(o);if(Math.abs(v)>=1)show(o,v)}}
/* ---------- each city's economy (docs/ECONOMY_REVIEW.md) ----------
   New York keeps its first numbers (ECO_NY), with the same fixes and loan. Vienna has its own (L.eco): its people eat and drink half as much and pay more rent from
   the craftsmen up, surplus beyond 80% of the stores sells at 30% of the price and one unit every 5 s per good, landmark sites take a
   load from store every 0.8 s (buying one at most every 2.2 s), a loan is repaid over ten years, one resident counts as 430 Viennese on
   top of the suburbs not drawn (550,000 in all at the start), and a raised home short of a good keeps its storeys, "find a spot" counts
   only the player's homes, and Mendel's research helps farms too (fix). So that the city does not grow rich too fast once its homes are
   full of Bürger: the Grand Bürger come from 1875 (top), and markets, churches, coffeehouses and the city's services cost about half as
   much again to run (up) */
/* New York has the same fixes, and the same ten-year loan (it cost $288 a minute over five) */
const ECO_NY={food:.008,beer:.004,cloth:.003,wine:.004,sellN:6,sellF:1,lmT:2.2,loan:[5500,5250],loanY:10,fix:1};
LEVELS.wien1857.eco={food:.004,beer:.002,bread:.002,meat:.002,coffee:.0015,furniture:.0008,porcelain:.0006,cloth:.0015,wine:.002,sellN:1,sellF:.3,lmT:.8,loan:[5500,5250],loanY:10,unit:430,pop0:550000,fix:1,
 top:1875,up:{market:.4,chapel:.4,kaffeehaus:.25,polizei:.35,muell:.3,feuerwehr:.3,spital:.4},
 set(){GOODS.splice(GOODS.indexOf('grain')+1,0,'flour','bread','meat');GOODS.splice(GOODS.indexOf('wine')+1,0,'coffee');GOODS.splice(GOODS.indexOf('cloth')+1,0,'furniture','porcelain');if(S){for(const g of['flour','bread','meat','coffee','furniture','porcelain'])S.stock[g]=S.stock[g]||0;millOn()}bset(LV[2],{tax:.025});bset(LV[3],{tax:.04});bset(LV[4],{tax:.05});bset(B.vineyard,{time:6});for(const k in this.up)bset(B[k],{up:this.up[k]});const r=lmEntry('rad');if(r)r.need.year=1896}};
/* New York's new start eats, drinks and pays rent as Vienna does (docs/ECONOMY_REVIEW.md, section 4); its historic start keeps ECO_NY */
const ECO_NEW={food:.004,beer:.002,cloth:.0015,wine:.002,sellN:1,sellF:.3,lmT:.8,loan:[5500,5250],loanY:10,fix:1};
const ECO=()=>L&&L.eco||(S&&S.scratch?ECO_NEW:ECO_NY);
/* Vienna's first workshops, placed after the starter city of a new game: sheep in Währing, the mills of Schottenfeld, the Wienerberg and
   Laaer Berg brickworks, timber and stone on the Donaukanal, market gardens in Favoriten and Meidling, barley in Ottakring, the St. Marx
   brewery and an iron merchant in the Landstraße; a second grain farm in the fields of Favoriten, a ship mill on the Danube by the Brigittenau
   and a bakery in the Josefstadt */
LEVELS.wien1857.starter=[['sheep',48.2280,16.3300],['weaver',48.2000,16.3420],['brick',48.1700,16.3550],['brick',48.1660,16.3900],['sawmill',48.2170,16.3830],['stonewh',48.2120,16.3920],
 ['garden',48.1650,16.3750],['garden',48.1750,16.3300],['grainf',48.2150,16.3100],['brewery',48.1880,16.4030],['ironyard',48.1950,16.3800],
 ['grainf',48.1600,16.3800],['mill',48.2400,16.3850],['bakery',48.2100,16.3480]];
/* ---------- the new start (docs/ECONOMY_START.md) ----------
   A new game opens nearly empty on 1 May 1865 (S.scratch). Vienna: the Stephansdom, the Hofburg as the first store and treasury, the
   Ringstraße on its real line (S.ringV=2; older saves keep their wider eight-sided Ring) and five streets joining them. New York: Trinity
   Church, City Hall as the first store, Castle Garden at the Battery, Broadway to Union Square, Wall Street, Chambers Street and the
   Bowery (with Park Row from City Hall to it, and Battery Place to Castle Garden); Fifth Avenue is the player's to lay. Everything else is open land. The store is no market until the player builds one */
/* the tutorial gives no rewards, so the treasury holds what they used to bring (about 2,000 fl.) from the start */
const START0={gold:5000,wood:30,bricks:20,stone:10,food:20,grain:0,beer:0,wine:0,cloth:0,wool:0,iron:0};
LEVELS.wien1857.start0=[['stephan',48.2085,16.3731],['hofburg',48.2062,16.3650]];
LEVELS.nyc1865.start0=[['stephan',40.7081,-74.0119],['hofburg',40.7127,-74.0059],['castleg',40.7033,-74.0170]];
/* the joining streets, by their real lines: Kärntner Straße to the Kärntnertor, Graben and Kohlmarkt to the Michaelertor, Herrengasse
   to the Schottentor, Rotenturmstraße to the Kai (the old Schwedenbrücke takes it over the canal), and the passage from the Hofburg over the Heldenplatz to the Burgtor */
LEVELS.wien1857.roads0={kaertner:[48.2018,16.3700,48.2055,16.3712,48.2085,16.3722],graben:[48.2087,16.3725,48.2087,16.3680],kohlmarkt:[48.2087,16.3680,48.2075,16.3668],
 herren:[48.2080,16.3665,48.2126,16.3650],rotenturm:[48.2086,16.3738,48.2118,16.3775],burg:[48.2062,16.3640,48.2058,16.3612],
 /* and the ways out to the first works: from the Kärntnertor over the Wien by the Elisabethbrücke (1854), up the Wiedner Hauptstraße to
    the Matzleinsdorf line and along the Triester Straße to the Wienerberg's clay pits; over the canal by the Schwedenbrücke into the
    Leopoldstadt, and along its bank, the Obere Donaustraße, where ship mills and timber rafts tie up; and on by the Praterstraße
    (the old Jägerzeile, renamed in 1862) to the Praterstern and down the Hauptallee under its chestnuts, past the Wurstelprater, to
    the Lusthaus */
 praterstr:[48.2140,16.3802,48.2158,16.3865,48.2185,16.3925],allee:[48.2185,16.3925,48.2100,16.4085,48.2014,16.4272],
 wieden:[48.2018,16.3700,48.2004,16.3694,48.1960,16.3672,48.1900,16.3640,48.1855,16.3590,48.1790,16.3560,48.1720,16.3550],
 schwedenbr:[48.2118,16.3775,48.2128,16.3790,48.2140,16.3802],donaustr:[48.2172,16.3712,48.2156,16.3760,48.2140,16.3802,48.2122,16.3845]};
LEVELS.nyc1865.roads0={broadway:[40.7045,-74.0135,40.7090,-74.0105,40.7128,-74.0070,40.7190,-74.0030,40.7255,-73.9980,40.7318,-73.9925,40.7359,-73.9906],
 wall:[40.7075,-74.0105,40.7058,-74.0065],chambers:[40.7160,-74.0120,40.7140,-74.0045],parkrow:[40.7118,-74.0072,40.7130,-74.0030,40.7140,-73.9975],
 bowery:[40.7140,-73.9975,40.7200,-73.9935,40.7255,-73.9915,40.7300,-73.9905],battery:[40.7036,-74.0160,40.7045,-74.0135]};
function startHist(D){const l=D.start0||D.hist.filter(h=>h[0]==='stephan');return S.ringV===2&&L.old?l.filter(h=>h[0]!=='hofburg'):l}
function startRoads(D){const hb=S.ringV===2&&L.old?hofburgV2():null;for(const[k,a]of Object.entries(D.roads0||{})){const wp=[];for(let j=0;j<a.length;j+=2){const g=gtV(a[j],a[j+1]);if(!wp.length||wp[wp.length-1][0]!==g[0]||wp[wp.length-1][1]!==g[1])wp.push(g)}
  if(hb)hbEnds(k,wp,hb);if(S.ringV===2&&RINGEND[k]!==undefined)ringEnd(wp,RINGEND[k]);
  const rt=routeWP(wp.map(([x,y])=>snapLand(x,y)).filter(i=>i>=0),{water:14,turn:.6,box:24});bridgeWet(rt);for(const i of rt){if(S.tiles[i]===BRIDGE||S.b[i])continue;const o=place('road',i%W,i/W|0,0,true);o.h=1;o.rn=k;if(k==='allee')o.al=1}linkRoute(rt)}
 /* the square round the cathedral */
 const sd=S.list.find(o=>o.t==='stephan');if(sd){const f=B.stephan.foot||1;for(let k=-1;k<=f;k++)for(const[a,b]of[[sd.x+k,sd.y-1],[sd.x+k,sd.y+f],[sd.x-1,sd.y+k],[sd.x+f,sd.y+k]]){if(!inb(a,b))continue;const j=b*W+a,tt=S.tiles[j];
  if(S.b[j]||nearRing(j)||(tt!==GRASS&&tt!==SAND&&tt!==FOREST))continue;const r=place('road',a,b,0,true);r.h=1;r.rn='platz';DECO[j]=0}}}
/* ---------- the Ring zone at the new games' size ----------
   A place on or inside the real Ring moves out from the cathedral by RINGV2S, as the Ring does; beyond it the stretch fades out over
   twice the Ring's reach, so the suburbs, the rivers' banks and the hills keep their own places. Landmark sites (the Opera at the
   Kärntnertor, Parliament, Rathaus, University, Votivkirche, the museums, the Stadtpark), the joining streets and the Hofburg's gardens
   go by it, so they still face the larger Ring */
function ringStretch(E,S_){if(!(S&&S.ringV===2&&L.old&&L.ringC)||RINGV2S===1)return[E,S_];const c=L.ringC;if(!L.ringRmax)L.ringRmax=Math.max(...L.old.map(q=>Math.hypot(q[0]-c[0],q[1]-c[1])));
 const R=L.ringRmax,dx=E-c[0],dy=S_-c[1],d=Math.hypot(dx,dy);if(d<1e-9)return[E,S_];const k=RINGV2S-1,d2=d<=R?d*RINGV2S:d+k*R*Math.max(0,1-(d-R)/(2*R));return[c[0]+dx*d2/d,c[1]+dy*d2/d]}
/* the rivers do not move: a place across the canal or the Wien from the cathedral keeps its real spot (the Stadtpark on the Landstraße
   bank), and one on the city side stops a tile short of the water */
function gtV(lat,lon){const e=prj(L,lat,lon),p0=gt(...e);if(!(S&&S.ringV===2&&L.old)||RINGV2S===1)return p0;const p1=gt(...ringStretch(...e)),c=gt(...L.ringC);
 const wetOn=(a,b)=>{const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let k=0;k<=n;k++){const x=Math.round(a[0]+(b[0]-a[0])*k/(n||1)),y=Math.round(a[1]+(b[1]-a[1])*k/(n||1));if(inb(x,y)&&S.tiles[y*W+x]===WATER)return k/(n||1)}return -1};
 if(wetOn(c,p0)>=0)return p0;const f=wetOn(p0,p1);if(f<0)return p1;const n=Math.max(Math.abs(p1[0]-p0[0]),Math.abs(p1[1]-p0[1]))||1,g=Math.max(0,f-2/n);return[Math.round(p0[0]+(p1[0]-p0[0])*g),Math.round(p0[1]+(p1[1]-p0[1])*g)]}
/* the Hofburg in a new Vienna: inside the Ring on its south-west side, the Heldenplatz (the lot's +y side, its Burgtor 1.6 tiles left
   of the middle) opening onto the Ring and the Burgtor at the Ring's inner edge; nothing of it on or past the Ring */
function hofburgV2(){const f=B.hofburg.foot,[tx,ty]=gtV(48.2062,16.3650),inR=(x,y)=>{const[E,S2]=geo(x,y);return inPoly(E,S2,L.ring)};
 let best=null,bs=1e9;for(let y=ty-18;y<=ty+18;y++)for(let x=tx-18;x<=tx+18;x++){const t=footTiles('hofburg',x,y);if(!t.every(([a,b])=>inb(a,b)&&!S.b[b*W+a]&&S.tiles[b*W+a]!==WATER&&S.tiles[b*W+a]!==BRIDGE&&!nearRing(b*W+a)&&inR(a,b)))continue;
  /* the Burgtor's tile and the Ring tile below it: as near as the Ring allows, and near the Hofburg's stretched place */
  const gx=x+Math.round(f/2-1.6),gy=y+f;let rd=0;while(rd<12&&!(RINGSET.has((gy+rd)*W+gx)||RINGSET.has((gy+rd)*W+gx-1)||RINGSET.has((gy+rd)*W+gx+1)))rd++;
  const sc=rd*6+Math.hypot(x+f/2-tx,y+f/2-ty);if(sc<bs){bs=sc;best=[x,y]}}
 if(!best)return null;const o=place('hofburg',best[0],best[1],0,true);o.h=1;return o}
/* the streets that meet the Hofburg in a new Vienna end at its gates: the Kohlmarkt (and the Herrengasse from it) at the Michaelertor,
   the corner toward the cathedral; the Burg passage from the Leopoldine wing's passage through the Burgtor straight to the Ring */
/* the streets that run out to a gate of the Ring (Kärntner Straße from the Kärntnertor, the Herrengasse to the Schottentor, the
   Rotenturmstraße to the Kai) meet it at its nearest tile, wherever the stretch has put their real gate */
const RINGEND={kaertner:0,herren:-1,rotenturm:-1,wieden:0,schwedenbr:0};
function ringEnd(wp,e){const j=e<0?wp.length-1:e,[x,y]=wp[j];let b=null,bd=1e9;for(const i of S.ringT){const d=(i%W-x)**2+((i/W|0)-y)**2;if(d<bd){bd=d;b=i}}if(b!=null)wp[j]=[b%W,b/W|0]}
function hbEnds(k,wp,hb){const f=B.hofburg.foot,sd=S.list.find(o=>o.t==='stephan');let mx=hb.x+f,my=hb.y-1;if(sd){let bd=1e9;for(const[a,b]of perim(hb)){const d=Math.hypot(a-sd.x,b-sd.y);if(d<bd){bd=d;mx=a;my=b}}}
 if(k==='kohlmarkt')wp[wp.length-1]=[mx,my];if(k==='herren')wp[0]=[mx,my];
 if(k==='burg'){const gx=hb.x+Math.round(f/2-1.6);let y=hb.y+f;while(y<H-1&&!RINGSET.has(y*W+gx))y++;wp.length=0;wp.push([gx,hb.y+f],[gx,y])}}
/* before a city is laid out, new or loaded: Vienna's Ring at its real size or the older wider one, and the store that takes the goods */
function startSet(){if(L.old){if(!L.ring15)L.ring15=L.ring;const v2=S.ringV===2;L.ring=v2?L.old:L.ring15;L.ringS=v2?RINGV2S:1.5}
 if(S.scratch){bset(B.grainf,{time:4.5});bset(B.sheep,{time:4.5});if(!L.eco){bset(LV[2],{tax:.025});bset(LV[3],{tax:.04});bset(LV[4],{tax:.05});bset(B.vineyard,{time:6});
  /* New York's clay lies across the East River with no bridge before 1883: in a new game its first bricks come as most of the city's did,
     by barge down the Hudson from the Haverstraw yards to a brick wharf on Manhattan's own waterfront */
  bset(B.brick,{on:'coast',n:'Brick wharf',d:'Barges bring bricks down the Hudson from the Haverstraw brickyards. Build it on the waterfront.'})}}
 if(S.scratch)bset(B.hofburg,{hub:1,d:NYC()?'City Hall: the first store and treasury. Goods are delivered here.':'The imperial palace: the first store and treasury. Goods are delivered here.'})}
/* the housing ladder of a new game (docs/ECONOMY_START.md): a home keeps its class only while that class's needs are met. Its sign shows
   the first unmet need at once (o.nd); after a game month without it families move out down to the size of the class below, after a
   year the home steps down a class and looks it. Waste collection, police and light only weigh on happiness */
const LADDER={fleischer:1,roester:1,tischler:1,porzellan:1,garden:1,market:1,brewery:1,bakery:1,weaver:1,vineyard:1,chapel:1,kaffeehaus:1};
function homeLadder(o){const all=houseNeeds(o).filter(q=>!q[0]&&LADDER[q[2]]),miss=all.filter(q=>!q[4]);const md=all.length&&B[all[0][2]],nd=all.length?(md&&(ICON[md.out]||md.i))||'!':'';o.ndw=all.length?all[0][1]:'';if(nd!==(o.nd||'')){o.nd=nd;GV++}
 if(!miss.length){o.lk=0;return false}if(!o.lk)o.lk=S.t;const t=S.t-o.lk;
 if(t>=YEAR&&o.lvl>1){o.lvl--;o.pop=Math.min(o.pop,maxPop(o));o.lk=S.t;float(o.x,o.y,`⬇ ${LV[o.lvl].n}`);GV++;return true}
 if(t>=YEAR/12){const lo=o.lvl>1?Math.round(LV[o.lvl-1].max*(TIERS()[o.tier||0].cap||1)):Math.ceil(LV[1].max/2);if(o.pop>lo)o.pop--}return true}
/* a new game counts only the player's people: the real city's census goals are left out, the city's own census sets the next */
const qNew=q=>!(S.scratch&&q.goal&&q.goal.type==='pop'&&!q.id.startsWith('auto_pop_'));
/* workers in a new game: every work that makes goods needs two families (WORK) from homes within WKR tiles (about 3.5 km, as far as the
   brickmakers walked from the Vorstädte to the Wienerberg); each family
   works in one place, the oldest works are staffed first. Farms, vineyards, woodcutters and fishers have their own hands. A work with
   too few shows its want over the roof (o.nw) and works the slower for it */
const WORK=2,WKR=140,FARMHANDS={garden:1,farm:1,grainf:1,sheep:1,vineyard:1,woodcutter:1,fisher:1,tobacco:1,spice:1};
function workStaff(){const hs=[];for(const o of S.list)if(o.t==='house'&&!o.h&&!o.bld&&!o.r&&o.pop>0){const[x,y]=fc(o);hs.push([x,y,o.pop])}
 for(const o of S.list){const d=B[o.t];if(!d||!d.out||o.h||o.r||FARMHANDS[o.t])continue;let w=0;if(!o.bld){const[x,y]=fc(o);for(const h of hs){if(h[2]<=0||Math.abs(h[0]-x)>WKR||Math.abs(h[1]-y)>WKR||Math.hypot(h[0]-x,h[1]-y)>WKR)continue;const k=Math.min(WORK-w,h[2]);h[2]-=k;w+=k;if(w>=WORK)break}}
  /* while the tutorial runs every work has its hands: it does not teach workers, and a brewery left without them made no beer, so
     the homes never moved up and the tutorial stood still */
  if(typeof tgOn==='function'&&tgOn())w=WORK;
  o.wk=w;const nw=!o.bld&&w<WORK?'👷':'';if(nw!==(o.nw||'')){o.nw=nw;GV++}}}
/* once in the first years of a new game, when the treasury falls below 300, a grant keeps the city going: the Emperor's privy purse
   in Vienna, the Common Council in New York */
function purseCheck(){if(S.purseG||S.stock.gold>=300||S.t>=yT(1870,1))return;S.purseG=1;S.stock.gold+=1000;
 evOv(NYC()?'A grant from the Common Council':'From your privy purse',NYC()?'The treasury is almost empty. The Common Council votes the Mayor a grant of $1,000 to keep the work going. It will not do so twice.':'Majesty, the treasury is almost empty. The keeper of your privy purse sends 1,000 gulden to keep the work going. He will not do so twice.')}
/* the free part (owner's decision D1, set anew on 12 Nov 2026): a new game is free up to 1900, with no limit on the time played.
   It ends on a day of the calendar the real city celebrated, FREEDAY; the card then tells that day, with fireworks, and the end is
   kept as S.capEnd. Until the full game is bought the calendar stands still (the city can still be looked at and walked, and
   choosing a speed brings the card back); with ?dev it goes on. The high point about eight years in, Vienna's World Exhibition on
   1 May 1873 and New York's Bethesda Fountain on 31 May 1873, is a card with fireworks and the city's results (S.fair). FREEPLAY, a
   limit in seconds of play (S.freeP), is no longer used and stands at no limit; a game it once stopped runs again when loaded.
   There is no payment yet: fullGame() is the one place that will ask the store */
const fullGame=()=>{if(typeof DEV!=='undefined'&&DEV)return true;try{return localStorage.getItem('gc-full')==='1'}catch(e){return false}};
const freeEndT=()=>NYC()?yT(1873,5,.97):yT(1873,5),FREEPLAY=Infinity;
const FREEDAY={ny:{t:yT(1900,3,.77),k:'stephan',h:'The first spade for the subway',
  p:'24 March 1900. Before City Hall Mayor Van Wyck breaks the ground for the subway with a silver spade. Thousands watch, bands play and guns fire a salute. In four years trains will run under Broadway.',
  q:'24 March 1900. On this day the real New York broke ground for its subway. Mayor Van Wyck dug the first earth before City Hall with a silver spade, and thousands watched.'},
 wien:{t:yT(1900,8,.58),k:'stephan',h:'The Emperor is seventy',
  p:'18 August 1900. Emperor Franz Joseph is 70 years old today, and has ruled for almost 52 years. Vienna hangs out its flags, the bells of the Stephansdom ring, and in the evening lights burn in the windows.',
  q:'18 August 1900. On this day Emperor Franz Joseph was 70 years old. He had ruled for almost 52 years, and the real Vienna hung out its flags for him.'}};
const freeDay=()=>FREEDAY[NYC()?'ny':'wien'],freeCapT=()=>freeDay().t;
function fireworks(){if(!document.getElementById('fwCss')){const c=document.createElement('style');c.id='fwCss';c.textContent='.fw{position:fixed;inset:0;pointer-events:none;z-index:40;overflow:hidden}.fw i{position:absolute;width:5px;height:5px;border-radius:50%;opacity:0;animation:fwb 1.6s ease-out forwards}@keyframes fwb{0%{transform:translate(0,0);opacity:1}80%{opacity:.9}100%{transform:translate(var(--x),var(--y));opacity:0}}';document.head.appendChild(c)}
 const el=document.createElement('div');el.className='fw';const cols=['#f2d24b','#e8789a','#b58ad8','#f4f1e6','#e0603a','#7fc4e8'];
 for(let b=0;b<7;b++){const x=10+Math.random()*80,y=8+Math.random()*40,col=cols[b%cols.length],d=b*.45;for(let k=0;k<26;k++){const a=k/26*Math.PI*2,r=60+Math.random()*50,i=document.createElement('i');i.style.cssText=`left:${x}%;top:${y}%;background:${col};box-shadow:0 0 6px ${col};animation-delay:${d}s;--x:${Math.cos(a)*r}px;--y:${Math.sin(a)*r+20}px`;el.appendChild(i)}}
 document.body.appendChild(el);setTimeout(()=>el.remove(),5200)}
function freeResults(){const by=[0,0,0,0,0,0,0];let homes=0;for(const o of S.list)if(o.t==='house'&&!o.h&&!o.bld){by[Math.min(6,o.lvl||1)]++;homes++}
 const works=S.list.filter(o=>!o.h&&!o.bld&&B[o.t]&&B[o.t].out).length,lms=S.list.filter(o=>!o.h&&!o.bld&&B[o.t]&&B[o.t].lm).map(o=>B[o.t].n);
 const cls=by.map((n,l)=>n&&l?`${n} ${LV[l].n.toLowerCase()}`:'').filter(Boolean).join(', ');
 return`<ul style="margin:6px 0 0;padding-left:18px"><li>${fmtPop(dispPop())} people in ${homes} home${homes===1?'':'s'}${cls?`: ${cls}`:''}</li><li>${works} works and farms</li>${lms.length?`<li>${lms.join(', ')}</li>`:''}<li>${money(Math.round(S.stock.gold),1)} in the treasury</li></ul>`}
function freeFair(){S.fair=1;const ny=NYC();
 if(!ny&&cnt('rotunde')&&!S.list.some(o=>o.t==='rotunde'&&o.bld)){S.stock.gold+=4000;S.prest=(S.prest||0)+50}
 fireworks();
 ov(`<h2>${ny?'The Angel of the Waters':'The World Exhibition opens'}</h2><p>${ny?'31 May 1873. On Bethesda Terrace in Central Park the fountain of the Angel of the Waters is unveiled. Emma Stebbins made it, the first woman to be asked for a public work of art in New York.':'1 May 1873. In the Prater the Emperor opens the World Exhibition under the great Rotunde: 53,000 exhibitors from 35 countries, and Vienna shows itself to the world.'}</p>
 <p><b>Your ${L.name} after eight years:</b></p>${freeResults()}<div class="btns"><button class="pri" id="ovOk">Continue</button></div>`);save()}
function freeEnd(day){S.freeEnd=1;spd=0;if(day){S.capEnd=1;fireworks()}freeBuy(day);save()}
function freeBuy(day){const yr=Math.floor(Y0+S.t/YEAR),d=day&&freeDay();
 ov(`<h2>${d?d.h:'Your city goes on to 1916'}</h2>${d?`<p>${S.list.some(o=>o.t===d.k&&!o.bld)?d.p:d.q}</p>`:''}<p>This is the end of the free part. ${yr>1865?`You have led ${L.name} from 1865 to ${yr}:`:`Your ${L.name} so far:`}</p>${freeResults()}
 <p style="margin-top:10px">One purchase opens Vienna and New York to 1916, with their landmarks, their events and the Historic start with the whole old city.</p>
 <div class="btns" style="flex-direction:column;align-items:stretch"><button class="pri" id="feBuy">Unlock the full game</button><button id="feLook">Look around my city</button></div>`);
 $('#feBuy').onclick=()=>{if(fullGame()){closeOv();spd=1;return}toast('Purchases open with the app release')};$('#feLook').onclick=()=>{closeOv();if(!fullGame())toast(`The calendar stands still. ${coarse?'Tap':'Click'} the speed at the top to unlock the full game`)}}
/* the free part's clock: the play after the tutorial, while the city runs or the player was at work in it in the last half minute. Once
   a second it is looked at, and the card comes when nothing else is on the screen */
let FREEC=0;
function freeTick(dt){if(S.tg&&!S.tgDone||S.won||S.lost||!SPEEDS[spd]&&performance.now()-LASTACT>30000||window.wgHush&&window.wgHush())return;
 S.freeP=(S.freeP||0)+dt;if((FREEC+=dt)<1)return;FREEC=0;
 if(S.freeP>=FREEPLAY&&!fullGame()&&$('#ov').hidden&&$('#msg').hidden&&!mode&&!guideBusy()&&!(S.sc&&!S.sc.end)&&!onFoot()&&!document.body.classList.contains('instudy'))freeEnd()}
function starterAdd(list){UNLOCKALL=true;try{for(const[t,la,lo]of list){const o=placeNear(t,la,lo);if(o)linkRoad(o)}}finally{UNLOCKALL=false}recompute()}
/* ---------- simulation ---------- */
function sim(dt){
 if(S.scratch&&S.freeEnd&&!fullGame())return;if(S.scratch&&!S.fair&&S.t>=freeEndT())freeFair();
 if(S.scratch&&S.t>=freeCapT()&&!(S.tg&&!S.tgDone)&&!fullGame()){freeEnd(1);return}
 const st=S.stock,c=cap(),E=ECO();let up=0,free=false;if(E.bread)millOn();if(S.scratch){S.wsT=(S.wsT||0)+dt;if(S.wsT>=5){S.wsT=0;workStaff();purseCheck()}}
 let tour=0,bkI=0;const warF=S.war?.7:1;for(const o of S.list){if(o.r||o.h&&o.t!=='market'&&!B[o.t].tour)continue;const d=B[o.t];
  if(o.t==='kontor'&&!free){free=true}else up+=d.up*(LAW().kommunal&&(o.t==='gaswerk'||o.t==='kraftwerk'||o.t==='tram')?.5:1);if(LAW().kommunal&&!o.bld&&(o.t==='gaswerk'||o.t==='kraftwerk'||o.t==='tram'))tour+=40;if(o.t==='bahnhof'&&!o.bld)tour+=(o.main?40:0)+(o.np||0)*15;
  if(d.sav){if(o.bld)continue;if(!o.c){o.st='Needs a road to a market';continue}const v=bankInc(o);o.st=v>0?'Open':'No homes within reach';tour+=v;bkI+=v;continue}
  if(d.tour){if(o.bld)continue;if(d.svc){if(!o.c){o.st='Needs a road to a market';continue}if(o.t==='heuriger'){if(st.beer<1){o.st='No beer in stock';continue}st.beer=Math.max(0,st.beer-.02*dt)}o.st='Open'}tour+=d.tour*(o.real?2:1)*(o.h?.4:1);continue}
  if(o.t==='tower'){o.cd-=dt;if(S.pir&&o.cd<=0){const p=pirPos();if(Math.hypot(p.x-o.x,p.y-o.y)<=d.range){o.cd=1.6;S.pir.hp--;fx.push({a:[o.x,o.y],b:[p.x,p.y],t:performance.now()});sfx('boom');if(S.pir.hp<=0)sinkPirate()}}continue}
  if(!d.out||o.bld)continue;
  if(!o.c){o.st='No road to a warehouse or market';continue}
  if(S.strike>S.t&&!(o.t==='garden'||o.t==='grainf'||o.t==='farm')){o.st='On strike';continue}
  let eff=1;if(S.scratch&&!FARMHANDS[o.t]){const w=o.wk??WORK;if(!w){o.st='No workers: build homes nearby';continue}eff=w/WORK}
  const[ccx,ccy]=fc(o),RR=(B[o.t].foot||1)+3,AR=(2*RR+1)**2;
  if(o.t==='woodcutter'){const n=count(Math.round(ccx),Math.round(ccy),RR,i=>S.tiles[i]===FOREST&&!S.b[i]&&!(fert[i]&32))/AR;eff=Math.min(1,n/.3);if(n<.04){o.st='Needs more woodland nearby';continue}}
  if(o.t==='sheep'||o.t==='garden'||o.t==='grainf'){const n=count(Math.round(ccx),Math.round(ccy),RR,i=>S.tiles[i]===GRASS&&!S.b[i]&&!(fert[i]&40))/AR;eff=Math.min(1,n/.5);if(n<.12){o.st='Needs open grassland around it';continue}}
  eff*=warF;
  if(d.in&&st[d.in]<1){o.st=`Waiting for ${d.in}`;continue}
  {const oc=comp[o.path[o.path.length-1]];if(o.home?st[d.out]>=c:((S.out[oc]||{})[d.out]||0)>=30){o.st='Storage full';continue}}
  o.p+=dt*eff*(L.y1857?prodMult(o):1);o.st=eff<.99?`Working at ${Math.round(eff*100)}%`:'Working';
  if(o.p>=d.time){o.p-=d.time;if(d.in)st[d.in]-=1;S.carts.push({path:o.path.slice(),s:0,g:d.out})}
 }
 if(L.y1857)for(const o of S.list){if(!o.bld||o.r)continue;if(o.wr){o.st='Wrecked';continue}if(!o.c&&o.t!=='liberty'){o.st='Needs a road to a market';continue}o.bt=(o.bt||0)+dt;const slow=!!B[o.t].proj&&E.lmT<2.2;if(o.bt<(B[o.t].proj?E.lmT:.6))continue;o.bt=0;let took=false,wait='',thr='';
  let bought='';for(const g in o.bld){if(o.bld[g]<=0)continue;if(st[g]>=1){st[g]-=1;o.bld[g]-=1;took=true;break}
   const pr=Math.round(PRICE[g][0]*1.2*(S.infl>S.t?1.8:1)*(S.list.some(o=>o.t==='bahnhof'&&o.main)?.85:1));if(S.autoBuy!==false&&st.gold>=pr+100){if(slow&&S.t-(o.bb||-9)<2.2){thr=thr||g;continue}st.gold-=pr;S.spB=(S.spB||0)+pr;CU().b+=pr;o.bld[g]-=1;took=true;bought=g;if(slow)o.bb=S.t;break}wait=wait||g}
  const left=Object.values(o.bld).reduce((a,b)=>a+Math.max(0,b),0);o.st=left?(took?(bought?`Under construction, buying ${bought}`:'Under construction'):thr?`Under construction, buying ${thr}`:`Waiting for ${wait}`):'';
  if(!left){o.bld=null;o.st='';GV++;finishBuild(o)}}
 if(L.y1857){extTick(dt,st);ageTick(dt);railTick(dt);epiTick(dt,st);immTick(dt,st);airTick(dt)}
 // carts
 /* goods carts: a new game's first works lie far out (the Wienerberg is a long haul from the Hofburg), so its carts come in four tiles a second */
 for(const k of S.carts){k.s+=dt*(S.scratch?4:L.y1857?.9:3.6);if(k.s>=k.path.length-1){const e=k.path[k.path.length-1],oc=comp[e];
  if(!L.sea||oc===S.mainComp)st[k.g]=Math.min(c,st[k.g]+1);else{const o2=S.out[oc]=S.out[oc]||{};o2[k.g]=Math.min(30,(o2[k.g]||0)+1)}
  float(e%W,e/W|0,`+1 ${ICON[k.g]}`);k.done=1}}
 S.carts=S.carts.filter(k=>!k.done);
 const p=popTotals(),tot=Ps(p,1);
 st.food=Math.max(0,st.food-tot*E.food*dt*(S.war===2?(S.ration?1.05:1.4):S.war?1.2:1));
 if(L.y1857&&tot>0&&st.food<15&&S.autoBuy!==false&&st.gold>300){const n=Math.min(4*dt,30-st.food),c=n*PRICE.food[0]*1.3;st.food+=n;st.gold-=c;S.spF=(S.spF||0)+c;CU().f+=c;S.fbT=S.t+YEAR/40;if(!(S.fiT>S.t)){S.fiT=S.t+YEAR/2;if(!(S.fcT>S.t)&&$('#ov').hidden&&!mode&&TUTI<0&&!(typeof tgOn==='function'&&tgOn())){S.fcT=S.t+YEAR*2;foodCard()}else toast('⚠️ Food ran out. The city now buys food at +30%. Build farms or vegetable gardens.')}}
 st.beer=Math.max(0,st.beer-(Ps(p,2))*E.beer*dt);if(E.bread&&breadOn())st.bread=Math.max(0,st.bread-Ps(p,2)*E.bread*dt);if(S.emp&&S.emp.regs)st.food=Math.max(0,st.food-S.emp.regs*.02*dt);for(const g in GX)if(goodOn(g))st[g]=Math.max(0,(st[g]||0)-Ps(p,GX[g][1])*E[g]*dt);st.cloth=Math.max(0,st.cloth-Ps(p,2)*E.cloth*dt);st.wine=Math.max(0,st.wine-(Ps(p,4))*E.wine*dt);
 if(L.y1857){S.sellT=(S.sellT||0)+dt;if(S.sellT>=5){S.sellT=0;let inc=0;for(const g of GOODS){const a=S.as&&S.as[g];if(a){/* the player's standing order: all above the part of the stores to keep goes to the trader, 5 at a time at the trader's price */
   const n=Math.min(5,Math.floor(st[g]-c*a));if(n>0){st[g]-=n;inc+=n*PRICE[g][1]}continue}
  const lim=c*.8;if(st[g]>lim){const n=Math.min(E.sellN,Math.floor(st[g]-lim));if(n>0){st[g]-=n;inc+=n*PRICE[g][1]*E.sellF*(S.fees>S.t?1.2:1)*(S.depr>S.t?.6:1)}}}if(inc){st.gold+=inc;S.sold=(S.sold||0)+inc;CU().s+=inc}}}
 let tax=0;for(let l=1;l<=6;l++)tax+=p[l]*LV[l].tax;const bs=L.base&&!S.scratch?L.base/60:0;tax+=bs;let fm=1;if(S.war)fm*=.8;if(L.y1857)fm*=(.55+.45*(S.hap??1))*(S.fees>S.t?.9:1);tax*=fm*TAXR[S.taxR||'normal'][0];if(LAW().schule)tax-=20/60;if(S.emp&&S.emp.regs)tax-=S.emp.regs*12/60;
 {let f2=1;if(S.depr>S.t)f2*=.85;if(S.epi)f2*=.45;if(S.infl>S.t)f2*=.7;tax*=f2;fm*=f2}PAY.h+=fm*dt;PAY.b+=bs*fm*dt;PAY.u+=dt;
 st.gold+=(tax-up+tour/60)*dt;S.rate=(tax-up)*60+tour;S.tax=tax*60;S.up=up*60;S.tour=tour;S.bkI=bkI;
 /* the money shown per minute is what the treasury really gained over the last minute, purchases included; when builders' and food
    purchases eat much of the income, a tip says so */
 S.gT=(S.gT||0)+dt;if(S.gT>=5){S.gT=0;(S.gh=S.gh||[]).push(st.gold);if(S.gh.length>13)S.gh.shift();if(S.gh.length>=4)S.net=(st.gold-S.gh[0])/((S.gh.length-1)*5)*60;
  /* and over the same minute what went to the builders' materials, emergency food and the loan, and what full stores sold, so the
     finances card adds up to it */
  {const u=CU(),h=S.fh=S.fh||[];h.push([u.b,u.f,u.s,u.l]);if(h.length>13)h.shift();if(h.length>=4){const a=h[0],z=h[h.length-1],k=60/((h.length-1)*5);S.flow={b:(z[0]-a[0])*k,f:(z[1]-a[1])*k,s:(z[2]-a[2])*k,l:(z[3]-a[3])*k}}}
  S.spN=(S.spN||0)+1;if(S.spN>=12){S.spN=0;const b=S.spB||0,f=S.spF||0;if(b+f>Math.max(60,Math.abs(S.rate)*.4)&&!(S.spW>S.t)){S.spW=S.t+YEAR;
   toast(b>=f?`🧱 Builders bought bricks and timber for ${money(b,1)} this minute, at market price +20%. ${NYC()?'A brickyard and a lumber yard':'A brickworks and a timber wharf'} save that, or switch buying off under ⚖️ Trade`:`🥕 Emergency food imports cost ${money(f,1)} this minute. Farms and vegetable gardens feed the city for less`)}S.spB=0;S.spF=0}}
 const has=g=>st[g]>.5;
 for(const o of S.list){if(o.t!=='house'||o.r||o.h||o.bld)continue;o.g+=dt;if(o.g<4)continue;o.g=0;
  const i=o.y*W+o.x;
  if(!has('food')){if(o.pop>1)o.pop--;continue}
  if(!o.c)continue;
  if(S.scratch&&o.lvl<6&&homeLadder(o))continue;
  let lack=false;for(let l=2;l<=o.lvl;l++)if(!has(LV[l].need))lack=true;
  if(lack){if(o.pop>Math.round(LV[o.lvl-1].max*(E.fix&&o.lvl<6?TIERS()[o.tier||0].cap:1)))o.pop--;continue}
  if(o.pop<maxPop(o)){o.pop++;continue}
  if(S.war)continue;
  if(L.y1857){/* a home rises by itself once every row of nextStage is met; the renovation is paid from the stores */
   const up_=nextStage(o);if(up_&&up_.ok){for(const g in up_.cost)st[g]-=up_.cost[g];o.lvl++;hEra(o);float(o.x,o.y,`⭐ ${LV[o.lvl].n}`);deed(o);GV++}continue}
  if(false){if(o.lvl===1&&mk[i]&&has('beer')&&st.bricks>=2){st.bricks-=2;o.lvl=2;float(o.x,o.y,'⬆ Craftsmen');sfx('chime')}
   else if(o.lvl===2&&ch[i]&&has('beer')&&has('wine')&&st.bricks>=3&&st.stone>=2){st.bricks-=3;st.stone-=2;o.lvl=3;float(o.x,o.y,'⬆ merchants');sfx('chime')}continue}
  if(o.lvl===1&&mk[i]&&has('cloth')&&st.wood>=2&&st.tools>=1){st.wood-=2;st.tools-=1;o.lvl=2;float(o.x,o.y,'⬆ Settlers');sfx('chime')}
  else if(o.lvl===2&&ch[i]&&has('cigars')&&st.wood>=3&&st.tools>=2){st.wood-=3;st.tools-=2;o.lvl=3;float(o.x,o.y,'⬆ Citizens');sfx('chime')}
  else if(o.lvl===3&&has('spices')&&st.bricks>=4&&st.tools>=2){st.bricks-=4;st.tools-=2;o.lvl=4;float(o.x,o.y,'⬆ Merchants');sfx('chime')}
 }
 rivalTick(dt);pirateTick(dt,tot);for(const sh of S.ships)shipTick(sh,dt);
 S.t+=dt;runEvents();
 if(S.t-(S.stats.last||0)>=30){S.stats.last=S.t;const h=S.stats.hist;h.push([Math.round(S.t),tot,rivalPop()]);if(h.length>240)S.stats.hist=h.filter((_,k)=>k%2===0)}
 if(!S.won&&tot>=L.goal&&cnt('monument')){S.won=true;sfx('chime');showWin()}
 /* bankruptcy: below −300 the treasurer warns (uiTick); below −3000 he gives a last chance, a loan or goods sold, and half a year to bring the treasury back (a full
    year when more comes in than goes out). When the time is up and the treasury is still growing, it gets another half year; only a
    treasury that stays below and shrinks loses the game */
 if(S.lost&&S.lastT==null)S.lost=false;/* a game lost under the old rule, at once at −300, gets its chance too */
 if(!S.lost){if(st.gold>=-3000)S.lastT=0;else if(!S.lastT){S.lastT=S.t+(runNet()>0?YEAR:YEAR/2);S.lastG=st.gold;lastChance()}
  else if(S.t>S.lastT){if(runNet()>0&&st.gold>S.lastG){S.lastT=S.t+YEAR/2;S.lastG=st.gold;toast(`⚠️ The treasury is still at ${money(st.gold,1)}, but it grows. You have until ${dateStr(S.lastT)}.`)}else{S.lost=true;showLose()}}}
}
function rivalTick(dt){if(!S.rv)return;S.rv.h+=dt;if(S.rv.h<5)return;S.rv.h=0;
 const target=L.goal*Math.pow(S.t/4500,1.5)+12,hs_=S.list.filter(o=>o.r&&o.t==='house');
 if(hs_.length<Math.ceil(target/12))rivalHouse();
 if(rivalPop()<target){const c=hs_.filter(o=>o.pop<20);if(c.length){const o=c[Math.random()*c.length|0];o.pop++;o.lvl=o.pop<=4?1:o.pop<=8?2:o.pop<=14?3:4}}
 if(S.t>=S.rv.next){S.rv.next=S.t+900;
  const sp=rivalSpot();if(sp){place('kontor',sp.x,sp.y,1);toast(`The ${L.rival.n} has claimed more land`)}}
 const rp=rivalPop();if(!S.rv.won&&rp>=L.goal){S.rv.won=true;ov(`<h1>Outpaced</h1><p>The ${L.rival.n} reached ${L.goal} people first. Your colony can keep growing.</p><div class="btns"><button class="pri" id="ovOk">Keep building</button></div>`);$('#ovOk').onclick=closeOv}
}

function rivalSpot(){let you=false;for(let i=0;i<W*H;i++)if(claim[i]===1&&(fert[i]&2)){you=true;break}
 const rk=S.list.filter(o=>o.r&&o.t==='kontor');if(!rk.length)return null;let best=null,bd=1e9;
 for(let i=0;i<W*H;i++){const t=S.tiles[i];if((t!==SAND&&t!==GRASS)||S.b[i]||claim[i])continue;const x=i%W,y=i/W|0;
  if(L.sea&&!coast(x,y))continue;if(S.level==='isles'&&comp[i]===S.mainComp)continue;
  let ok=true;for(let dy=-4;dy<=4&&ok;dy++)for(let dx=-4;dx<=4;dx++){if(inb(x+dx,y+dy)&&claim[(y+dy)*W+x+dx]){ok=false;break}}if(!ok)continue;
  if(!you){let f=false;for(let dy=-7;dy<=7&&!f;dy++)for(let dx=-7;dx<=7;dx++){if(inb(x+dx,y+dy)&&(fert[(y+dy)*W+x+dx]&2)){f=true;break}}if(f)continue}
  const d=Math.min(...rk.map(o=>Math.hypot(o.x-x,o.y-y)));if(d<bd){bd=d;best={x,y}}}
 return best}

/* ---------- pirates ---------- */
let fx=[];
function pirPos(){const p=S.pir,a=p.cur,b=p.next;return{x:(a%W)*(1-p.f)+(b%W)*p.f,y:(a/W|0)*(1-p.f)+(b/W|0)*p.f}}
function pirateTick(dt,tot){
 if(!L.sea)return;
 if(!S.pir){if(S.t<S.pnext)return;if(tot<30){S.pnext=S.t+60;return}spawnPirate();S.pnext=S.t+240+Math.random()*120;return}
 const p=S.pir;p.f+=dt*1.7;
 while(p.f>=1){p.f-=1;p.cur=p.next;
  if(p.dist[p.cur]===0){raid();return}
  const x=p.cur%W,y=p.cur/W|0;let n=-1;for(const[dx,dy]of D4){const k=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&p.dist[k]>=0&&p.dist[k]<p.dist[p.cur]){n=k;break}}
  if(n<0){S.pir=null;return}p.next=n}
}
function spawnPirate(){
 const targets=S.list.filter(o=>!o.r&&o.t!=='road'&&waterNb(o.x,o.y));if(!targets.length)return;
 const kon=targets.filter(o=>o.t==='kontor');const tg=Math.random()<.5&&kon.length?kon[Math.random()*kon.length|0]:targets[Math.random()*targets.length|0];
 const[wx,wy]=waterNb(tg.x,tg.y),w0=(tg.y+wy)*W+tg.x+wx;
 const d=waterBFS(w0);
 const edge=[];let far=w0;for(let i=0;i<W*H;i++){if(d[i]<0)continue;if(d[i]>d[far])far=i;const x=i%W,y=i/W|0;if((x<2||y<2||x>W-3||y>H-3)&&d[i]>=10*KS&&seaM[i])edge.push(i)}
 const s=edge.length?edge[Math.random()*edge.length|0]:far;
 const x=s%W,y=s/W|0;let n=s;for(const[dx,dy]of D4){const k=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&d[k]>=0&&d[k]<d[s]){n=k;break}}
 S.pir={cur:s,next:n,f:0,hp:6,dist:d,tg};
 toast(`🏴‍☠️ Pirates sighted! They're sailing for your ${B[tg.t].n.toLowerCase()}`);sfx('alarm');
}
function raid(){const st=S.stock,tg=S.pir.tg;const g=Math.min(400,Math.max(0,Math.floor(st.gold*.2)));st.gold-=g;
 for(const k of['food','cloth','tools','cigars','spices','bricks'])st[k]=Math.floor(st[k]*.6);
 float(tg.x,tg.y,'🔥 Raided');S.stats.raids++;sfx('alarm');toast(`Pirates raided your ${B[tg.t].n.toLowerCase()}, taking ${g} gold and some goods. Cannon towers keep them away`);S.pir=null}
function sinkPirate(){const p=pirPos();float(Math.round(p.x),Math.round(p.y),'💥 +150 🪙');S.stock.gold+=150;S.stats.sunk++;sfx('boom');sfx('coin');toast('Your cannons sank the pirate ship. Reward: 150 gold');S.pir=null}

/* ---------- ships ---------- */
function waterBFS(w0){const d=new Int16Array(W*H).fill(-1);if(w0<0)return d;d[w0]=0;const q=[w0];
 for(let h=0;h<q.length;h++){const k=q[h],x=k%W,y=k/W|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(inb(nx,ny)&&S.tiles[n]===WATER&&d[n]<0){d[n]=d[k]+1;q.push(n)}}}return d}
function dock(x,y){const w=waterNb(x,y);return w?(y+w[1])*W+x+w[0]:-1}
const cargoN=sh=>Object.values(sh.cargo).reduce((a,b)=>a+b,0);
function shipPos(sh){const a=sh.cur,b=sh.next,f=sh.f;return{x:(a%W)*(1-f)+(b%W)*f,y:(a/W|0)*(1-f)+(b/W|0)*f}}
function homeKontor(sh){let best=null,bd=1e9;for(const o of S.list){if(o.r||o.t!=='kontor'||comp[o.y*W+o.x]!==S.mainComp)continue;const d=dock(o.x,o.y);if(d<0)continue;
 const dd=Math.hypot(o.x-sh.cur%W,o.y-(sh.cur/W|0));if(dd<bd){bd=dd;best=d}}return best}
function sailTo(sh,dest,task){if(dest==null||dest<0)return false;const d=waterBFS(dest);if(d[sh.cur]<0)return false;sh.dist=d;sh.next=sh.cur;sh.f=0;sh.task=task;return true}
function shipTick(sh,dt){
 sh.cd=(sh.cd||0)-dt;
 if(S.pir&&sh.cd<=0){const p=pirPos(),q=shipPos(sh);if(Math.hypot(p.x-q.x,p.y-q.y)<=2.5){sh.cd=1.8;S.pir.hp--;fx.push({a:[q.x,q.y],b:[p.x,p.y],t:performance.now(),low:1});sfx('boom');if(S.pir.hp<=0)sinkPirate()}}
 if(!sh.task){
  const site=S.sites.find(s=>!s.ship||s.ship===sh.id);
  if(site&&sailTo(sh,dock(site.x,site.y),{k:'found',s:site})){site.ship=sh.id;return}
  if(cargoN(sh)>0&&sailTo(sh,homeKontor(sh),{k:'unload'}))return;
  let bc=-1,bn=4;for(const c in S.out){const n=Object.values(S.out[c]).reduce((a,b)=>a+b,0);if(n>bn&&!S.ships.some(o=>o!==sh&&o.task&&o.task.c==c)){bn=n;bc=+c}}
  if(bc>=0){const k=S.list.find(o=>!o.r&&o.t==='kontor'&&comp[o.y*W+o.x]===bc);if(k&&sailTo(sh,dock(k.x,k.y),{k:'load',c:bc}))return}
  return}
 sh.f+=dt*2.2;
 while(sh.f>=1||sh.next===sh.cur){if(sh.next!==sh.cur){sh.f-=1;sh.cur=sh.next}
  if(sh.dist[sh.cur]===0){arrive(sh);return}
  const x=sh.cur%W,y=sh.cur/W|0;let n=-1;for(const[dx,dy]of D4){const k=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&sh.dist[k]>=0&&sh.dist[k]<sh.dist[sh.cur]){n=k;break}}
  if(n<0){sh.task=null;return}sh.next=n}
}
function arrive(sh){const t=sh.task;sh.task=null;sh.f=0;sh.next=sh.cur;const p=shipPos(sh);
 if(t.k==='found'){const s=t.s;S.sites.splice(S.sites.indexOf(s),1);const i=s.y*W+s.x;
  if(!S.b[i]&&claim[i]!==2){place('kontor',s.x,s.y);float(s.x,s.y,'⚓ Founded');toast('Your ship founded a new warehouse');sfx('horn')}
  else{for(const k in B.kontor.cost)S.stock[k]+=B.kontor.cost[k];toast('That shore was taken before your ship arrived. Materials refunded')}}
 if(t.k==='load'){const o=S.out[t.c]||{};let room=30-cargoN(sh);for(const g in o){const n=Math.min(room,o[g]);if(n>0){sh.cargo[g]=(sh.cargo[g]||0)+n;o[g]-=n;room-=n}}
  float(Math.round(p.x),Math.round(p.y),`📦 ${cargoN(sh)} loaded`)}
 if(t.k==='unload'){const c=cap();let n=0;for(const g in sh.cargo){S.stock[g]=Math.min(c,S.stock[g]+sh.cargo[g]);n+=sh.cargo[g]}sh.cargo={};
  if(n){float(Math.round(p.x),Math.round(p.y),`+${n} goods home`);sfx('horn')}}
}
function buildShip(yd){const c={gold:400,wood:15,tools:6};for(const k in c)if(S.stock[k]<c[k])return toast(`Not enough ${k} for a ship`);
 if(S.ships.length>=3)return toast('Your fleet is at its limit of 3 ships');
 const d=dock(yd.x,yd.y);if(d<0)return toast('This shipyard has no water to launch from');
 for(const k in c)S.stock[k]-=c[k];S.ships.push({ship:1,id:Date.now()%1e7+S.ships.length,cur:d,next:d,f:0,task:null,cargo:{},cd:0});
 sfx('horn');toast('A new trade ship is ready');renderInfo()}


/* ---------- rendering ---------- */
const cv=$('#c');let ctx=cv.getContext('2d');
let vw=0,vh=0,cam={x:0,y:0},Z=1,mode=null,sel=null,hover=null,floats=[];
function resize(){gGV=-1;const r=cv.parentElement.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,LOWEND?1.5:2);vw=r.width;vh=r.height;cv.width=vw*d;cv.height=vh*d;ctx.setTransform(d,0,0,d,0,0)}
/* VIEW0: the last place the flat view was centred on, which the 3D camera takes up if the city was ready before it */
let VIEW0=null;function centerOn(x,y){VIEW0=[x,y];const hw=TW/2*Z,hh=TH/2*Z;cam.x=vw/2-VX(x,y)*hw;cam.y=vh/2-VY(x,y)*hh-hh}
function pick(px,py){const a=(px-cam.x)/(TW/2*Z),b=(py-cam.y)/(TH/2*Z),m_=RU(Math.floor((a+b)/2),Math.floor((b-a)/2));return{x:m_[0],y:m_[1]}}
function zoomAt(px,py,nz){lastZoomT=performance.now();nz=Math.max(.035,Math.min(3.2,nz));const wx=(px-cam.x)/Z,wy=(py-cam.y)/Z;Z=nz;cam.x=px-wx*Z;cam.y=py-wy*Z}
/* the last thing the player did on the map, and when (a building, a home that moved up, the middle of a new road, the end of a new
   line): a step of the tutorial that it completes sends its gold stars up from there (tutorial.js) */
let DEED=null,DEEDT=0;function deed(o){DEED=o;DEEDT=performance.now()}
const FPOOL=[];function float(x,y,txt,c='f',d=1600,h=10){const f=FPOOL.pop()||{};f.x=x;f.y=y;f.txt=txt;f.c=c;f.d=d;f.h=h;f.t=performance.now();floats.push(f);if(floats.length>40)FPOOL.push(floats.shift())}
let scr=(x,y)=>{const v=RVw(x,y);return[(v[0]-v[1])*TW/2*Z+cam.x,(v[0]+v[1])*TH/2*Z+cam.y+TH/2*Z]};

function poly(p,f){ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function dia(cx,cy,hw,hh,f,stroke){poly([cx,cy-hh,cx+hw,cy,cx,cy+hh,cx-hw,cy],f);if(stroke){ctx.strokeStyle=f;ctx.lineWidth=1;ctx.stroke()}}
function box(cx,cy,s,h,wall,roof,rh,flat){const q=s/2;
 poly([cx-s,cy,cx,cy+q,cx,cy+q-h,cx-s,cy-h],wall);
 poly([cx,cy+q,cx+s,cy,cx+s,cy-h,cx,cy+q-h],shade(wall,.78));
 if(flat){poly([cx,cy-q-h,cx+s,cy-h,cx,cy+q-h,cx-s,cy-h],roof);return}
 const ay=cy-h-rh;
 poly([cx-s,cy-h,cx,cy-q-h,cx,ay],shade(roof,1.12));poly([cx,cy-q-h,cx+s,cy-h,cx,ay],roof);
 poly([cx-s,cy-h,cx,cy+q-h,cx,ay],shade(roof,.95));poly([cx,cy+q-h,cx+s,cy-h,cx,ay],shade(roof,.78))}
function tree(x,y,z,c){ctx.fillStyle='#5a3e26';ctx.fillRect(x-1.2*z,y-5*z,2.4*z,5*z);poly([x,y-21*z,x-7*z,y-3*z,x+7*z,y-3*z],c);poly([x,y-26*z,x-5*z,y-12*z,x+5*z,y-12*z],shade(c,1.18))}
function mountain(cx,cy,hw,hh,z,h){const hm=L.hill||1,px=cx+(h-.5)*8*z,py=cy-(30*z+h*10*z)*hm;
 poly([cx-hw*.95,cy,px,py,cx+hw*.1,cy+hh*.75],'#a89c84');poly([cx+hw*.1,cy+hh*.75,px,py,cx+hw*.95,cy],'#7b705e');
 if(L.snow!==false)poly([px,py,px-7*z,py+10*z,px-2*z,py+8*z,px+1*z,py+11*z,px+6*z,py+8*z],'#f2efe7')}
function roadTile(i,x,y,cx,cy,hw,hh){const rc=L.roadCol||'#bba57e';ctx.strokeStyle=rc;ctx.lineCap='round';ctx.lineWidth=hh*.7;ctx.beginPath();
 for(const[dx,dy]of D4){const n=(y+dy)*W+x+dx;if(inb(x+dx,y+dy)&&((S.b[n]&&!S.b[n].r)||S.tiles[n]===BRIDGE)){ctx.moveTo(cx,cy);ctx.lineTo(cx+DX(dx,dy)*hw/2,cy+DY(dx,dy)*hh/2)}}
 ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,hw*.32,hh*.36,0,0,7);ctx.fillStyle=rc;ctx.fill()}

function drawB(o,cx,cy,z,hw,hh,now){
 const s=hw*.55,on=(o.st||'').startsWith('Working'),rv=o.r;
 if(o.bld&&o.t!=='house'){drawSite(o,cx,cy,hw/(B[o.t].ds||1));return}
 if(L.y1857&&COMP[o.t]){drawCompound(o,cx,cy,hw,hh);return}
 if(L.y1857&&CIVIC[o.t]){const f=B[o.t].foot||4,ds=B[o.t].ds||1,t=hw/ds*(f/4);CIVIC[o.t](o,LP(cx,cy,t),t);return}
 if(L.y1857&&o.t==='stephan'){drawStephan(cx,cy,hw,hh);return}
 if(L.y1857&&o.t==='market'){drawMarket(cx,cy,hw,hh,o);return}
 if(L.y1857&&o.t==='hofburg'){drawRingB('hofburg',cx,cy,hw,hh);return}
 if(L.y1857&&B[o.t].lm&&LMZ[o.t])z*=LMZ[o.t];
 switch(o.t){
 case'house':drawHouse(o,cx,cy,z,hw);break;
 case'bastion':if(!L.wall)drawBastion(cx,cy,hw,hh);break;
 case'stadtpark':case'musikverein':case'rotunde':case'brunnen':drawLandmark3(o.t,cx,cy,z,hw,hh,now);break;
 case'stonewh':{box(cx-hw*.12,cy,s*.7,9*z,'#b3aa9a','#6d6a66',7*z);for(let k=0;k<4;k++)box(cx+hw*.32+(k%2)*6*z,cy+hh*.12-(k>>1)*4*z,4.5*z,3.5*z,'#cfc8ba','#bdb6a8',0,true);break}
 case'brewery':{box(cx,cy,s,13*z,'#d8c3a0','#8a4a36',9*z);ctx.fillStyle='#7a3b2e';ctx.fillRect(cx+s*.3,cy-30*z,4*z,14*z);ctx.beginPath();ctx.ellipse(cx-s*.25,cy-17*z,5*z,5*z,0,Math.PI,0);ctx.fillStyle='#b87333';ctx.fill();break}
 case'monument':drawMonument(cx,cy,z,hw,hh,now);break;
 case'karls':case'oper':case'hofburg':case'rad':case'schoen':drawLandmark(o.t,cx,cy,z,hw,hh,now);break;
 case'stephan':drawMonument(cx,cy,z,hw,hh,now,'stephan');break;
 case'belved':case'rathaus':case'parlament':case'votiv':case'secession':case'pavillon':case'postspar':case'steinhof':case'looshaus':drawLandmark2(o.t,cx,cy,z,hw,hh,now);break;
 case'kontor':{box(cx,cy,hw*.78,16*z,'#c8a673','#6b4a32',11*z);
  ctx.strokeStyle='#3a2a1c';ctx.lineWidth=1.6*z;ctx.beginPath();ctx.moveTo(cx,cy-27*z);ctx.lineTo(cx,cy-52*z);ctx.stroke();
  const w=Math.sin(now/300)*2*z;poly([cx,cy-52*z,cx+15*z,cy-47*z+w,cx,cy-42*z],rv?'#2a5db0':'#c0392b');break}
 case'sawmill':case'woodcutter':box(cx-hw*.12,cy,s*.75,9*z,'#8a5e3b','#5f7f3a',8*z);
  for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(cx+hw*.38+k*3*z,cy+hh*.25-k*2*z,2.8*z,0,7);ctx.fillStyle='#c49a6c';ctx.fill();ctx.strokeStyle='#7a5532';ctx.lineWidth=.8*z;ctx.stroke()}break;
 case'fisher':{const[dx,dy]=o.wd||[1,0];const bx=cx+DX(dx,dy)*hw*.55,by=cy+DY(dx,dy)*hh*.55+Math.sin(now/400+o.x)*1.5*z;
  box(cx,cy,s*.75,9*z,'#cdb48c','#3c6e8f',8*z);
  poly([bx-8*z,by,bx+8*z,by,bx+5*z,by+4*z,bx-5*z,by+4*z],'#6b4a32');poly([bx,by-14*z,bx,by-1*z,bx+7*z,by-2*z],'#f4f1ea');break}
 case'sheep':{ctx.strokeStyle='#8a6a44';ctx.lineWidth=1.2*z;ctx.beginPath();ctx.moveTo(cx,cy-hh*.8);ctx.lineTo(cx+hw*.8,cy);ctx.lineTo(cx,cy+hh*.8);ctx.lineTo(cx-hw*.8,cy);ctx.closePath();ctx.stroke();
  box(cx-hw*.3,cy-hh*.2,s*.45,7*z,'#b08a5a','#8a3b2a',6*z);
  for(let k=0;k<3;k++){const a=now/2500+k*2.1+o.x;const sx=cx+Math.cos(a)*hw*.4,sy=cy+hh*.15+Math.sin(a)*hh*.35;
   ctx.beginPath();ctx.ellipse(sx,sy,4*z,2.8*z,0,0,7);ctx.fillStyle='#f5f3ee';ctx.fill();ctx.fillStyle='#333';ctx.fillRect(sx+3*z,sy-1.5*z,1.8*z,1.8*z)}break}
 case'vineyard':{for(let r=-3;r<=3;r++){const ax=cx+r*hw*.11-hw*.32,ay=cy+r*hh*.11+hh*.32;ctx.strokeStyle='#6b4a2a';ctx.lineWidth=Math.max(.6,z*.6);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax+hw*.62,ay-hh*.62);ctx.stroke();
   for(let k=0;k<5;k++){const px=ax+hw*.62*k/4.5,py=ay-hh*.62*k/4.5;ctx.fillStyle=(k+r)%2?'#5f8a32':'#4d7428';ctx.beginPath();ctx.ellipse(px,py-2*z,2.6*z,2.2*z,0,0,7);ctx.fill();if((k+r)%3===0){ctx.fillStyle='#6b2f5a';ctx.beginPath();ctx.arc(px+1*z,py-1*z,1*z,0,7);ctx.fill()}}}
  box(cx+hw*.5,cy-hh*.1,s*.3,8*z,'#f1e9d6','#9c5a3c',6*z);break}
 case'heuriger':{box(cx-hw*.12,cy,s*.62,10*z,'#f3ecd8','#8a4a36',8*z);ctx.fillStyle='#3f6b2a';ctx.beginPath();ctx.ellipse(cx-hw*.12,cy-14*z,3.2*z,2.2*z,0,0,7);ctx.fill();
  for(let k=0;k<3;k++){const tx=cx+hw*.28+k*5*z,ty=cy+hh*.25-k*2*z;ctx.fillStyle='#7a5532';ctx.fillRect(tx-2.5*z,ty-3*z,5*z,1.4*z);ctx.fillStyle='#a8834f';ctx.fillRect(tx-.5*z,ty-2*z,1*z,2.4*z)}
  treeR(cx+hw*.45,cy-hh*.2,z*.7,'#58873a');break}
 case'bahnhof':drawStation(cx,cy,hw,hh,o);break;
 case'liberty':drawLiberty(cx,cy,hw,hh);break;
 case'tower':case'parkrow':case'singer':case'metlife':case'woolworth':drawSky(o.t,cx,cy,hw,hh,o);break;
 case'flatiron':drawFlatiron(cx,cy,hw,hh);break;
 case'polizei':case'bank':case'farm':case'muell':case'eislauf':case'reitschule':case'kaserne':case'regulierung':case'reichsbruecke':case'tiergarten':drawSvc2(o.t,cx,cy,z,hw,hh,s);break;
 case'burgtheater':case'kursalon':case'kuenstler':case'epstein':case'ephrussi':case'imperial':case'universitaet':case'rossauer':drawRingB(o.t,cx,cy,hw,hh);break;
 case'kaffeehaus':case'feuerwehr':case'spital':case'gaswerk':case'harbour':case'kraftwerk':case'tram':case'autofabrik':case'coalyard':drawSvc(o.t,cx,cy,z,hw,hh,s);break;
 case'garden':case'grainf':case'tobacco':case'spice':{const col={tobacco:'#6f8f2e',spice:'#b0472c',garden:'#5f9a3a',grainf:'#d9b84a'}[o.t];
  for(let r=-1;r<=1;r++)for(let k=-1;k<=1;k++){const px=cx+(r-k)*hw*.28,py=cy+(r+k)*hh*.28;ctx.beginPath();ctx.ellipse(px,py-3*z,4*z,4.5*z,0,0,7);ctx.fillStyle=shade(col,.9+((r+k+2)%3)*.1);ctx.fill()}
  box(cx-hw*.45,cy-hh*.1,s*.35,6*z,'#a07a50','#6b4a32',5*z);break}
 case'weaver':box(cx,cy,s,12*z,'#e3d6bf','#7b4f8b',10*z);break;
 case'tobacconist':box(cx,cy,s,12*z,'#c9a27a','#5a3a28',10*z);break;
 case'brick':{box(cx-hw*.1,cy,s*.8,10*z,'#b5654a','#5b3a2e',7*z);ctx.fillStyle='#7a3b2e';ctx.fillRect(cx+s*.3,cy-24*z,4*z,12*z);
  for(let k=0;k<4;k++){ctx.fillStyle='#c0623f';ctx.fillRect(cx+hw*.3+(k%2)*5*z,cy+hh*.1-(k>>1)*3*z,4.5*z,2.6*z)}break}
 case'quarry':case'mine':{ctx.beginPath();ctx.moveTo(cx-7*z,cy-2*z);ctx.lineTo(cx-7*z,cy-12*z);ctx.quadraticCurveTo(cx,cy-20*z,cx+7*z,cy-12*z);ctx.lineTo(cx+7*z,cy-2*z);ctx.closePath();ctx.fillStyle='#2b241d';ctx.fill();
  ctx.strokeStyle='#8a5e3b';ctx.lineWidth=2*z;ctx.stroke();box(cx+hw*.35,cy+hh*.3,4*z,4*z,'#6b6b6b','#3a3a3a',0,true);break}
 case'ironyard':case'smith':{box(cx,cy,s,12*z,'#8f8a82','#47464a',9*z);ctx.fillStyle='#5a4a40';ctx.fillRect(cx+s*.35,cy-26*z,4*z,12*z);
  if(on)for(let k=0;k<3;k++){const ph=((now/1200)+k/3)%1;ctx.beginPath();ctx.arc(cx+s*.35+2*z+ph*6*z,cy-28*z-ph*18*z,(2+ph*4)*z,0,7);ctx.fillStyle=`rgba(200,200,200,${.6*(1-ph)})`;ctx.fill()}break}
 case'market':box(cx,cy,hw*.8,3*z,'#b8a37e','#cbb68f',0,true);
  box(cx-hw*.3,cy-hh*.05,hw*.22,7*z,'#8c6a46','#d9473a',5*z);box(cx+hw*.25,cy+hh*.12,hw*.22,7*z,'#8c6a46','#e8c547',5*z);box(cx+hw*.05,cy-hh*.4,hw*.2,7*z,'#8c6a46','#3f8f6a',5*z);break;
 case'chapel':box(cx+hw*.12,cy+hh*.05,s*.8,14*z,'#f4f1ea','#7a3b2e',9*z);box(cx-hw*.28,cy-hh*.08,hw*.17,30*z,'#efebe2','#555f6e',16*z);break;
 case'tower':{box(cx,cy,s*.6,26*z,'#9c958a','#7d776d',0,true);
  for(let k=-1;k<=1;k+=2){box(cx+k*s*.4,cy-26*z,s*.14,5*z,'#9c958a','#8a847a',0,true)}
  ctx.fillStyle='#2b2b2b';ctx.fillRect(cx-2*z,cy-20*z,9*z,3*z);break}
 }
 if(!rv&&!o.h&&needsRoad(o)&&!o.c&&o.t!=='liberty'){badge(cx,cy-38*z,z,'#c27a12','🛤')}
 else if(!rv&&B[o.t].out&&o.st&&!on)badge(cx,cy-38*z,z,'#c0392b','!')
}
function badge(x,y,z,col,t){ctx.beginPath();ctx.arc(x,y,7.5*z,0,7);ctx.fillStyle=col;ctx.fill();ctx.fillStyle='#fff';ctx.font=`bold ${10*z}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+.5)}
function ship(cx,cy,z,now,hp){const b=Math.sin(now/350)*1.5*z;cy+=b;
 poly([cx-14*z,cy,cx+14*z,cy,cx+9*z,cy+6*z,cx-9*z,cy+6*z],'#3b2616');
 ctx.fillStyle='#4a3420';ctx.fillRect(cx-1*z,cy-26*z,2*z,26*z);
 poly([cx-11*z,cy-24*z,cx+11*z,cy-24*z,cx+9*z,cy-5*z,cx-9*z,cy-5*z],'#1a1a1a');
 ctx.beginPath();ctx.arc(cx,cy-15*z,3.4*z,0,7);ctx.fillStyle='#eee';ctx.fill();
 ctx.fillStyle='#333';ctx.fillRect(cx-12*z,cy-34*z,24*z,3*z);ctx.fillStyle='#e04b3a';ctx.fillRect(cx-12*z,cy-34*z,24*z*hp/6,3*z)}

function tradeShip(cx,cy,z,now,n,hi){const b=Math.sin(now/380+cx)*1.5*z;cy+=b;
 if(hi){ctx.beginPath();ctx.ellipse(cx,cy+3*z,20*z,9*z,0,0,7);ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.stroke()}
 poly([cx-15*z,cy,cx+15*z,cy,cx+10*z,cy+6*z,cx-10*z,cy+6*z],'#7a4a26');
 for(let k=0;k<Math.min(3,Math.ceil(n/10));k++){ctx.fillStyle='#c49a6c';ctx.fillRect(cx-9*z+k*6*z,cy-4*z,5*z,4*z)}
 ctx.fillStyle='#4a3420';ctx.fillRect(cx-1*z,cy-30*z,2*z,30*z);
 poly([cx-11*z,cy-27*z,cx+11*z,cy-27*z,cx+9*z,cy-7*z,cx-9*z,cy-7*z],'#f4efe2');
 poly([cx,cy-34*z,cx+9*z,cy-31*z,cx,cy-29*z],'#c0392b')}
function OLD_night(){if(L.zones)return 0;const ph=(S.t%420)/420;return Math.max(0,-Math.cos(ph*2*Math.PI))**.9*.42}

/* ---------- detailed houses & monuments ---------- */
let NF=0;const GLOW=[];
const HUT={s:.44,h:9,rh:9,wall:['#a37a4f','#9a7048'],roof:'#d6b55c',F:1,win:1,planks:1};
const STY={
 isles:{1:HUT,2:{s:.5,h:13,rh:10,wall:['#eadfc8','#e4d6bb'],roof:'#b5503a',F:1,win:1,chim:1},3:{s:.55,h:21,rh:12,wall:['#f1ebde','#e8dcc6'],roof:'#4f6a8a',F:2,win:2,chim:1},4:{s:.58,h:28,rh:13,wall:['#b5654a','#c47b5c'],roof:'#33404f',F:3,win:2,corn:1,chim:1}},
 vienna:{1:HUT,2:{s:.5,h:14,rh:12,wall:['#f4ecd8','#efe4cc'],roof:'#9c3d2c',F:1,win:1,timber:1,chim:1},3:{s:.56,h:22,rh:12,wall:['#f0dfa8','#efe6cf','#ead2a0'],roof:'#8e3b2b',F:2,win:2,chim:1},4:{s:.6,h:30,rh:12,wall:['#f2cf63','#ecdcb0','#e9c46a'],roof:'#5f9e86',F:3,win:2,corn:1}},
 prague:{1:HUT,2:{s:.5,h:14,rh:14,wall:['#f6f0e2'],roof:'#c0462e',F:1,win:1,timber:1,chim:1},3:{s:.54,h:22,rh:16,wall:['#f2c9c2','#cfe3d0','#f3e2b8'],roof:'#b8432c',F:2,win:2,chim:1},4:{s:.58,h:30,rh:17,wall:['#e8b4b8','#bcd9c9','#f1d9a6','#d6c8e6'],roof:'#3d5a6c',F:3,win:2,corn:1}},
 rome:{1:{...HUT,roof:'#c98a52'},2:{s:.52,h:13,rh:5,wall:['#e3b07a','#d9a06b'],roof:'#b8582f',F:1,win:1,shut:1},3:{s:.56,h:21,rh:5,wall:['#d98d55','#e0a86e','#c97a48'],roof:'#b4502b',F:2,win:2,shut:1},4:{s:.6,h:29,rh:4,wall:['#c96e3f','#e2b48a','#d4925c'],roof:'#a9492a',F:3,win:2,corn:1,shut:1}},
 venice:{1:{...HUT,roof:'#c98a52'},2:{s:.48,h:15,rh:7,wall:['#e7c3a6','#d9a48e'],roof:'#b65a3a',F:1,win:1,arch:1,vchim:1},3:{s:.5,h:24,rh:7,wall:['#e8a598','#f1d3a1','#c7d3c6','#e5b8b0'],roof:'#b4573a',F:2,win:2,arch:1,vchim:1},4:{s:.55,h:32,rh:7,wall:['#d98c7e','#f0c98d','#b9cfc4','#e9d7c3'],roof:'#a94f34',F:3,win:2,arch:1,corn:1,vchim:1}}};
function fP(cx,cy,s,h,sd){const q=s/2,ax=sd<0?cx-s:cx,ay=sd<0?cy:cy+q,bx=sd<0?cx:cx+s,by=sd<0?cy+q:cy;return(u,v)=>[ax+(bx-ax)*u,ay+(by-ay)*u-v*h]}
function fq(P,u0,u1,v0,v1,col){const p=[...P(u0,v0),...P(u1,v0),...P(u1,v1),...P(u0,v1)];if(col)poly(p,col);return p}
function drawHouse(o,cx,cy,z,hw){
 if(L.style==='wien1900'){if(o.bld){drawSite(o,cx,cy,hw/4);return}if(NYC()&&o.tier>=3&&typeof drawSky==='function'){drawSky('tower',cx,cy,hw,hw/2,o);return}drawBlockNY(o,cx,cy,hw);if(!o.h&&!o.c&&o.t!=='liberty')badge(cx,cy-2.6*hw/4,z/4,'#c27a12','🛤');return}
 const st_=STY[L.style]||STY.isles,sp=o.v==='old'&&st_.old?st_.old:st_[o.lvl],k=hs(o.x*73+o.y*131),s=hw*sp.s,h=sp.h*z,rh=sp.rh*z;
 const wall=sp.wall[(k*sp.wall.length)|0],roof=o.r?(o.lvl>2?'#24585c':'#2e6f73'):sp.roofs?sp.roofs[(hs(o.x*17+o.y*29)*sp.roofs.length)|0]:sp.roof;
 box(cx,cy,s,h,wall,roof,rh);if(z<.42)return;
 const PL=fP(cx,cy,s,h,-1),PR=fP(cx,cy,s,h,1),F=sp.F,n=sp.win,lit=NF>.05;
 ctx.lineWidth=.8*z;
 if(sp.planks){ctx.strokeStyle='rgba(60,38,20,.5)';ctx.beginPath();for(const P of[PL,PR])for(let v=.25;v<1;v+=.25){ctx.moveTo(...P(0,v));ctx.lineTo(...P(1,v))}ctx.stroke()}
 if(sp.timber){ctx.strokeStyle='#5a3a24';ctx.lineWidth=1.1*z;ctx.beginPath();for(const P of[PL,PR]){for(const[a,b,c,d]of[[0,.5,1,.5],[0,.97,1,.97],[.03,0,.03,1],[.97,0,.97,1],[.5,0,.5,1],[.03,.5,.5,.97],[.97,.5,.5,.97]]){ctx.moveTo(...P(a,b));ctx.lineTo(...P(c,d))}}ctx.stroke()}
 if(sp.corn){for(const P of[PL,PR]){fq(P,0,1,.95,1.02,shade(wall,1.15));for(let f=1;f<F;f++)fq(P,0,1,f/F-.015,f/F+.015,shade(wall,1.1))}}
 for(let f=0;f<F;f++)for(const[P,sd]of[[PL,-1],[PR,1]])for(let j=0;j<n;j++){
  if(sd>0&&f===0&&j===0)continue;
  const uc=(j+.5)/n,uw=.3/n+.07,v0=(f+.3)/F,v1=(f+.76)/F;
  if(sp.shut)fq(P,uc-uw*.95,uc+uw*.95,v0,v1,'#4f7a4a');
  const q=fq(P,uc-uw/2,uc+uw/2,v0,v1,sd<0?'#3b4a5a':'#2f3b48');
  if(hs(o.x*7+o.y*11+f*3+j+sd)<.75)GLOW.push([q,190+((k*50)|0)]);
  if(sp.arch)fq(P,uc-uw/2,uc+uw/2,v1,v1+.07/F,shade(wall,1.18));
  else if(o.lvl>2)fq(P,uc-uw/2-.02,uc+uw/2+.02,v1,v1+.04/F,shade(wall,.85))}
 const du=.5/n;fq(PR,du-.11,du+.11,0,o.lvl===1?.62:.68/F,'#5a3a24');
 if(o.lvl>2)fq(PR,du-.13,du+.13,.68/F,.74/F,shade(wall,.8));
 const chx=cx+s*.3,chy=cy-h-rh*.45;
 if(sp.chim){ctx.fillStyle='#7a4a3a';ctx.fillRect(chx,chy-7*z,3.2*z,8*z);ctx.fillStyle='#5a3328';ctx.fillRect(chx-.6*z,chy-7.5*z,4.4*z,1.4*z)}
 houseExtras(o,sp,cx,cy,s,h,rh,z,wall,PL,PR);
 if(sp.vchim){ctx.fillStyle='#b65a3a';ctx.fillRect(chx+.6*z,chy-6*z,2.2*z,7*z);poly([chx-1*z,chy-10*z,chx+4.4*z,chy-10*z,chx+3*z,chy-6*z,chx+.4*z,chy-6*z],'#8a3f28')}
}
function drawMonument(cx,cy,z,hw,hh,now,mk){
 switch(mk||L.mon.k){
 case'stephan':{box(cx+hw*.18,cy+hh*.12,hw*.6,17*z,'#d9cfb9','#2f6a5a',17*z);
  const s=hw*.6,X=cx+hw*.18,Y=cy+hh*.12,h=17*z;ctx.strokeStyle='#e8c547';ctx.lineWidth=1.3*z;ctx.beginPath();
  for(let k=1;k<=3;k++){const t=k/4;ctx.moveTo(X-s+s*t*.5,Y-h-17*z*t);ctx.lineTo(X-s*.5+s*t*.25,Y-h+s*.25-17*z*t*.6);ctx.lineTo(X,Y-h-17*z*t)}ctx.stroke();
  box(cx-hw*.34,cy-hh*.14,hw*.17,46*z,'#cfc4ab','#b9ad92',28*z);
  for(const P of[fP(cx-hw*.34,cy-hh*.14,hw*.17,46*z,-1),fP(cx-hw*.34,cy-hh*.14,hw*.17,46*z,1)])for(let v=.2;v<.9;v+=.22)fq(P,.3,.7,v,v+.12,'#5d5446');break}
 case'vitus':{box(cx+hw*.15,cy+hh*.12,hw*.58,19*z,'#b9b2a4','#3f5f55',14*z);
  box(cx-hw*.4,cy+hh*.05,hw*.15,40*z,'#9d968a','#35514a',20*z);box(cx-hw*.15,cy-hh*.3,hw*.15,40*z,'#9d968a','#35514a',20*z);
  for(const P of[fP(cx+hw*.15,cy+hh*.12,hw*.58,19*z,-1),fP(cx+hw*.15,cy+hh*.12,hw*.58,19*z,1)])for(let j=0;j<4;j++)fq(P,.1+j*.22,.2+j*.22,.25,.8,'#4a5a6a');break}
 case'campanile':{box(cx+hw*.2,cy+hh*.15,hw*.5,12*z,'#efe4cf','#efe4cf',0,true);
  for(const[a,b]of[[.05,.1],[.3,.22],[.32,0]]){ctx.beginPath();ctx.arc(cx+hw*a,cy+hh*b-14*z,5*z,Math.PI,0);ctx.fillStyle='#8aa79a';ctx.fill()}
  box(cx-hw*.3,cy-hh*.15,hw*.17,44*z,'#b4553c','#6faf8f',18*z);
  for(const P of[fP(cx-hw*.3,cy-hh*.15,hw*.17,44*z,-1),fP(cx-hw*.3,cy-hh*.15,hw*.17,44*z,1)]){fq(P,0,1,.82,.98,'#f2ecdf');fq(P,.25,.75,.85,.95,'#3a3530')}break}
 case'colosseum':{const rx=hw*.85,ry=hh*.85,H_=22*z,yb=cy;
  const arc=(yy,a0,a1,stp)=>{const p=[];for(let a=a0;stp>0?a<=a1+1e-6:a>=a1-1e-6;a+=stp)p.push(cx+Math.cos(a)*rx,yy+Math.sin(a)*ry);return p};
  ctx.beginPath();ctx.ellipse(cx,yb-H_,rx,ry,0,0,7);ctx.fillStyle='#cdb88f';ctx.fill();
  ctx.beginPath();ctx.ellipse(cx,yb-H_+2*z,rx*.62,ry*.62,0,0,7);ctx.fillStyle='#a8916a';ctx.fill();
  poly([...arc(yb,0,Math.PI,Math.PI/24),...arc(yb-H_,Math.PI,0,-Math.PI/24)],'#dcc9a2');
  ctx.fillStyle='#7d6a4c';for(let r=0;r<3;r++)for(let a=.15;a<Math.PI-.1;a+=Math.PI/11){const x=cx+Math.cos(a)*rx*.98,y=yb+Math.sin(a)*ry*.98-H_*(r+.25)/3.2;ctx.fillRect(x-1.4*z,y-4*z,2.8*z,4*z)}
  poly([cx-rx*.2,yb-H_-ry*.95,cx+rx*.55,yb-H_-ry*.8,cx+rx*.5,yb-H_-ry*.8-6*z,cx-rx*.15,yb-H_-ry*.95-9*z],'#dcc9a2');break}
 default:{box(cx,cy,hw*.2,40*z,'#f4f1ea','#c0392b',8*z);for(const P of[fP(cx,cy,hw*.2,40*z,-1),fP(cx,cy,hw*.2,40*z,1)]){fq(P,0,1,.3,.42,'#c0392b');fq(P,0,1,.62,.74,'#c0392b')}
  ctx.beginPath();ctx.arc(cx,cy-43*z,(3+NF*6)*z,0,7);ctx.fillStyle=`rgba(255,230,140,${.6+NF*.4})`;ctx.fill()}}
}

function prism(cx,cy,ax,ay,h,wall,roof,rh,hw,hh){const ux=hw*ax,uy=hh*ax,vx=-hw*ay,vy=hh*ay;
 const C=[cx+ux+vx,cy+uy+vy],Rr=[cx+ux-vx,cy+uy-vy],Bk=[cx-ux-vx,cy-uy-vy],Lf=[cx-ux+vx,cy-uy+vy],U=p=>[p[0],p[1]-h];
 poly([...Lf,...C,...U(C),...U(Lf)],wall);poly([...C,...Rr,...U(Rr),...U(C)],shade(wall,.78));
 const Ct=U(C),Rt=U(Rr),Bt=U(Bk),Lt=U(Lf),M=[cx,cy-h];
 if(!rh)poly([...Ct,...Rt,...Bt,...Lt],roof);
 else if(ax>=ay){const k=(ax-ay)/ax,P1=[M[0]+ux*k,M[1]+uy*k-rh],P2=[M[0]-ux*k,M[1]-uy*k-rh];
  poly([...Rt,...Bt,...P2,...P1],shade(roof,1.1));poly([...Bt,...Lt,...P2],shade(roof,1.05));poly([...Lt,...Ct,...P1,...P2],shade(roof,.95));poly([...Ct,...Rt,...P1],shade(roof,.8))}
 else{const k=(ay-ax)/ay,P1=[M[0]+vx*k,M[1]+vy*k-rh],P2=[M[0]-vx*k,M[1]-vy*k-rh];
  poly([...Lt,...Bt,...P2,...P1],shade(roof,1.1));poly([...Rt,...Bt,...P2],shade(roof,1.05));poly([...Lt,...Ct,...P1],shade(roof,.95));poly([...Ct,...Rt,...P2,...P1],shade(roof,.8))}
 const F=(A,Bp)=>(u,v)=>[A[0]+(Bp[0]-A[0])*u,A[1]+(Bp[1]-A[1])*u-v*h];return{L:F(Lf,C),R:F(C,Rr),top:M}}
function winGrid(P,cols,rows,v0,v1,col,frame){for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const u0=(c+.28)/cols,u1=(c+.72)/cols,a=v0+(v1-v0)*(r+.2)/rows,b=v0+(v1-v0)*(r+.75)/rows;
 if(frame)fq(P,u0-.02/cols*3,u1+.02/cols*3,a-.02,b+.03,frame);const q=fq(P,u0,u1,a,b,col);if(hs(c*7+r*13+cols)<.7)GLOW.push([q,200])}}
function dome(x,y,rx,ry,col){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,Math.PI,0);ctx.fillStyle=col;ctx.fill();ctx.beginPath();ctx.ellipse(x-rx*.3,y-ry*.45,rx*.25,ry*.35,0,0,7);ctx.fillStyle=shade(col,1.2);ctx.fill()}
function drawLandmark(k,cx,cy,z,hw,hh,now){
 switch(k){
 case'karls':{const b=prism(cx+hw*.25,cy-hh*.25,.62,.5,22*z,'#efe6d2','#ddd2bb',0,hw,hh);winGrid(b.R,3,2,.15,.85,'#46566a');
  const[mx,my]=b.top;ctx.fillStyle='#e9dfc9';ctx.fillRect(mx-11*z,my-12*z,22*z,13*z);dome(mx,my-12*z,13*z,17*z,'#5f9883');ctx.fillStyle='#e9dfc9';ctx.fillRect(mx-2.5*z,my-35*z,5*z,7*z);dome(mx,my-35*z,3.5*z,5*z,'#5f9883');
  const por=b.L;poly([...por(.32,.75),...por(.68,.75),...por(.5,1.15)],'#f4ecd9');for(let j=0;j<5;j++)fq(por,.33+j*.075,.36+j*.075,0,.75,'#f7f1e4');
  for(const u of[.08,.92]){const[px,py]=por(u,0);ctx.fillStyle='#f1e8d4';ctx.fillRect(px-2.8*z,py-44*z,5.6*z,44*z);ctx.fillStyle='#b9a98a';for(let j=0;j<6;j++)ctx.fillRect(px-2.8*z,py-(8+j*6)*z,5.6*z,1.6*z);ctx.fillStyle='#e9dfc9';ctx.fillRect(px-3.6*z,py-48*z,7.2*z,4*z);dome(px,py-48*z,2.6*z,4*z,'#5f9883')}break}
 case'oper':{const b=prism(cx,cy,.9,.7,24*z,'#ddcfae','#5e8a80',13*z,hw,hh);
  for(let j=0;j<7;j++){fq(b.L,.06+j*.13,.15+j*.13,.04,.32,'#5b4a38')}winGrid(b.L,7,1,.42,.9,'#3e4c5c','#efe3c4');winGrid(b.R,5,2,.1,.9,'#3e4c5c','#efe3c4');
  for(const u of[.2,.8]){const[px,py]=b.L(u,1);ctx.strokeStyle='#3a2a1c';ctx.lineWidth=1.2*z;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py-14*z);ctx.stroke();poly([px,py-14*z,px+8*z,py-12*z+Math.sin(now/300+u)*z,px,py-10*z],'#c0392b')}break}
 case'hofburg':{const b=prism(cx,cy,.95,.6,26*z,'#efe9dc','#7a8a84',8*z,hw,hh);winGrid(b.L,9,3,.08,.92,'#46566a','#f8f4ea');winGrid(b.R,6,3,.08,.92,'#46566a','#f8f4ea');
  const[px,py]=b.L(.5,1);ctx.fillStyle='#efe9dc';ctx.fillRect(px-9*z,py-9*z,18*z,10*z);dome(px,py-9*z,11*z,16*z,'#5f9883');ctx.fillStyle='#e8c547';ctx.fillRect(px-1*z,py-30*z,2*z,6*z);
  const[qx,qy]=b.R(.85,1);dome(qx,qy-2*z,6*z,9*z,'#5f9883');break}
 case'rad':{prism(cx,cy,.55,.55,5*z,'#9e8f78','#b8a888',0,hw,hh);const hx=cx,hy=cy-50*z,Rw=38*z,a0=now/9000;
  ctx.strokeStyle='#3d3d44';ctx.lineWidth=2.4*z;ctx.beginPath();ctx.moveTo(cx-18*z,cy-4*z);ctx.lineTo(hx,hy);ctx.lineTo(cx+18*z,cy-4*z);ctx.moveTo(cx-10*z,cy+2*z);ctx.lineTo(hx,hy);ctx.lineTo(cx+10*z,cy+2*z);ctx.stroke();
  ctx.strokeStyle='#8a2f24';ctx.lineWidth=2.2*z;ctx.beginPath();ctx.arc(hx,hy,Rw,0,7);ctx.stroke();ctx.lineWidth=.8*z;ctx.beginPath();ctx.arc(hx,hy,Rw*.93,0,7);
  for(let j=0;j<16;j++){const a=a0+j*Math.PI/8;ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(a)*Rw,hy+Math.sin(a)*Rw)}ctx.stroke();
  for(let j=0;j<15;j++){const a=a0+j*2*Math.PI/15,gx=hx+Math.cos(a)*Rw,gy=hy+Math.sin(a)*Rw;ctx.fillStyle='#c0392b';ctx.fillRect(gx-3.2*z,gy,6.4*z,5*z);ctx.fillStyle=NF>.05?'#ffd27a':'#f3e7c9';ctx.fillRect(gx-2.2*z,gy+1*z,4.4*z,2*z)}
  ctx.beginPath();ctx.arc(hx,hy,3*z,0,7);ctx.fillStyle='#3d3d44';ctx.fill();break}
 case'schoen':{poly([cx,cy-hh*1.9,cx+hw*1.9,cy,cx,cy+hh*1.9,cx-hw*1.9,cy],'#7fae58');
  ctx.strokeStyle='#e9dcc0';ctx.lineWidth=2*z;ctx.beginPath();ctx.moveTo(cx-hw*.95,cy+hh*.95);ctx.lineTo(cx+hw*.5,cy-hh*.5);ctx.moveTo(cx-hw*1.2,cy+hh*.2);ctx.lineTo(cx+hw*.2,cy+hh*1.2);ctx.stroke();
  for(const[a,b2]of[[-.6,.6],[.1,.9],[-.9,.1]]){ctx.beginPath();ctx.ellipse(cx+hw*a,cy+hh*b2,6*z,3*z,0,0,7);ctx.fillStyle='#c94f6a';ctx.fill()}
  const b=prism(cx+hw*.55,cy-hh*.55,1.2,.36,24*z,'#efc24a','#6f6e6a',7*z,hw,hh);winGrid(b.L,13,3,.06,.92,'#4e5a63','#f7ecd0');winGrid(b.R,3,3,.06,.92,'#4e5a63','#f7ecd0');
  const[px,py]=b.L(.5,1);poly([px-14*z,py,px+14*z,py,px,py-9*z],'#f3d26e');break}}}

function bridgeDeck(x,y,cx,cy,hw,hh){if(L.y1857&&S){const d_=bbSet().get(y*W+x);if(d_){bbDeck(x,y,cx,cy,hw,hh,d_);return}}const solid=(a,b)=>inb(a,b)&&S.tiles[b*W+a]!==WATER?1:0,ax=solid(x-1,y)+solid(x+1,y)>=solid(x,y-1)+solid(x,y+1)?0:1;
 let gx=ax===0?1:0,gy=ax===0?0:1;{const nb=roadNb(y*W+x);if(nb.length){let dx,dy;if(nb.length>=2){dx=(nb[nb.length-1]%W)-(nb[0]%W);dy=((nb[nb.length-1]/W)|0)-((nb[0]/W)|0)}else{dx=(nb[0]%W)-x;dy=((nb[0]/W)|0)-y}const l=Math.max(Math.abs(dx),Math.abs(dy))||1;gx=Math.round(dx/l);gy=Math.round(dy/l);if(!gx&&!gy)gx=1}}
 {const r_=RD(gx,gy);gx=r_[0];gy=r_[1]}const nl=Math.hypot(gx,gy),A=[(gx-gy)*hw,(gx+gy)*hh];let Bv=[(-gy-gx)*hw/nl,(-gy+gx)*hh/nl];if(Bv[1]<0||(Bv[1]===0&&Bv[0]<0))Bv=[-Bv[0],-Bv[1]];
 const e=hh*.38,w=.34,p=(a,b,h)=>[cx+a*A[0]+b*Bv[0],cy+a*A[1]+b*Bv[1]-h];
 const endA=!solid(x-(ax===0?1:0),y-(ax===0?0:1))?0:1,endB=!solid(x+(ax===0?1:0),y+(ax===0?0:1))?0:1;
 poly([...p(-.5,w,e),...p(.5,w,e),...p(.5,w,0),...p(-.5,w,0)],ax===0?'#a39579':'#b8aa8c');
 const c0=p(0,w,0),l0=p(-.34,w,0),r0=p(.34,w,0),top=p(0,w,e*1.55);ctx.beginPath();ctx.moveTo(l0[0],l0[1]);ctx.quadraticCurveTo(top[0],top[1],r0[0],r0[1]);ctx.closePath();ctx.fillStyle='#1f4d63';ctx.fill();
 poly([...p(-.5,-w,e),...p(.5,-w,e),...p(.5,w,e),...p(-.5,w,e)],'#cdc2ab');
 if(Z>=.3){const cb=cobble();poly([...p(-.5,-w*.62,e),...p(.5,-w*.62,e),...p(.5,w*.62,e),...p(-.5,w*.62,e)],cb)}
 ctx.strokeStyle='#efe7d6';ctx.lineWidth=Math.max(1,hh*.1);ctx.lineCap='round';ctx.beginPath();
 for(const b of[-w,w]){const a0=p(-.5,b,e+hh*.1),a1=p(.5,b,e+hh*.1);ctx.moveTo(a0[0],a0[1]);ctx.lineTo(a1[0],a1[1])}ctx.stroke();
 ctx.strokeStyle='#8f826b';ctx.lineWidth=Math.max(.6,hh*.05);ctx.beginPath();for(const b of[-w,w])for(const a of[-.5,0,.5]){const q0=p(a,b,e),q1=p(a,b,e+hh*.14);ctx.moveTo(q0[0],q0[1]);ctx.lineTo(q1[0],q1[1])}ctx.stroke()}
function bridgeTile(x,y,cx,cy,hw,hh){const z=Z;poly([cx-hw*.92,cy+3*z,cx,cy+hh*.92+3*z,cx+hw*.92,cy+3*z,cx,cy+hh*.92],'#6e624f');
 poly([cx,cy-hh*.92,cx+hw*.92,cy,cx,cy+hh*.92,cx-hw*.92,cy],'#b3a58f');
 ctx.strokeStyle='#8a7c67';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy-hh*.92);ctx.lineTo(cx+hw*.92,cy);ctx.lineTo(cx,cy+hh*.92);ctx.lineTo(cx-hw*.92,cy);ctx.closePath();ctx.stroke()}


/* ---------- cached ground layer ---------- */
const gC=document.createElement('canvas'),gX=gC.getContext('2d');let gKey='',GV=0,WV=[];
function diaF(cx,cy,hw,hh,f){poly([cx,cy-hh-.5,cx+hw+.8,cy,cx,cy+hh+.5,cx-hw-.8,cy],f)}
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
let gz=1,gcx=0,gcy=0,gM=0,gcw=0,gch=0,lastZoomT=0,gGV=-1;
let RSEG=[],RSEGR=[],RSEGJ=[],BRG=[];
function renderGround(){RSEG=[];RSEGR=[];RSEGJ=[];BRG=[];const d=Math.min(2,window.devicePixelRatio||1);gM=Math.round(Math.max(vw,vh)*.35);gcw=vw+2*gM;gch=vh+2*gM;
 const w=Math.round(gcw*d),h=Math.round(gch*d);if(gC.width!==w||gC.height!==h){gC.width=w;gC.height=h}
 gX.setTransform(d,0,0,d,d*gM,d*gM);const c0=ctx;ctx=gX;WV=[];
 ctx.fillStyle=L.bg;ctx.fillRect(-gM,-gM,gcw,gch);
 const z=Z,hw=TW/2*z,hh=TH/2*z,det=z>=.42,tz=z<.5,hz=z<.22;
 if(L.y1857){groundPre(hw,hh,z);if(z>=.25)drawClayPits(hw,hh,z)}
 visTiles(gM,(x,y)=>{const sx=VX(x,y)*hw+cam.x,sy=VY(x,y)*hh+cam.y+hh,i=y*W+x,t=S.tiles[i];
  if(t===BRIDGE){diaF(sx,sy,hw,hh,'#2f86a8');if(L.y1857)BRG.push([x,y,sx,sy]);else bridgeTile(x,y,sx,sy,hw,hh);return}
  if(t===WATER){let sh=false;for(let dy=-1;dy<=1&&!sh;dy++)for(let dx=-1;dx<=1;dx++)if(inb(x+dx,y+dy)&&S.tiles[(y+dy)*W+x+dx]!==WATER){sh=true;break}
   if(!L.y1857){if(sh)diaF(sx,sy,hw,hh,'#2f86a8');else if(!seaM[i])diaF(sx,sy,hw,hh,'#2a79a0')}WV.push(i);return}
  if(!L.y1857)diaF(sx,sy,hw,hh,tcol[i]);
  if(L.y1857&&DECO[i]===CLAY);else if(det&&DECO[i])drawDeco(DECO[i],i,sx,sy,hw,hh,z);
  else if(DECO[i]===FIELD||DECO[i]===VINE||DECO[i]===MARSH||DECO[i]===CLAY)dia(sx,sy,hw*.9,hh*.9,DECO[i]===FIELD?['#d9c477','#a7c25e','#b38a5e','#e2d35c','#c9b26a','#9fb85a'][(hs(i*53+11)*6)|0]:DECO[i]===VINE?'#6f8a3c':DECO[i]===MARSH?'#7f9c5c':'#b5764a');
  if(claim[i]===2)dia(sx,sy,hw,hh,'rgba(40,90,180,.16)');
  if(S.b[i]&&S.b[i].t==='road'&&(L.y1857||!S.b[i].k)){const ringT=S.b[i].k==='ring',SG=ringT?RSEGR:RSEG;if(!L.roadL){roadTile(i,x,y,sx,sy,hw,hh);return}const nb=[];for(const n of roadNb(i)){const dx=n%W-x,dy=(n/W|0)-y;nb.push([sx+DX(dx,dy)*hw*.5,sy+DY(dx,dy)*hh*.5,dx,dy,ringT&&S.b[n]&&S.b[n].k==='ring'])}
   if(nb.length===2&&!(nb[0][2]===-nb[1][2]&&nb[0][3]===-nb[1][3])&&nb[0][4]===nb[1][4])(nb[0][4]?RSEGR:RSEG).push(nb[0][0],nb[0][1],nb[1][0],nb[1][1]);else if(nb.length)for(const q of nb){(q[4]?RSEGR:RSEG).push(sx,sy,q[0],q[1]);if(ringT&&!q[4])RSEGJ.push(sx,sy,q[0],q[1])}else RSEG.push(sx,sy,sx+.01,sy)}});
 drawPlan(hw,hh,z);drawDitch(hw,hh);
 if(L.roadL){const P=q=>{const fx=(G2*q[1]+W-1+G2*q[0])/2,fy=(G2*q[1]+W-1-G2*q[0])/2;return[(fx-fy)*hw+cam.x,(fx+fy)*hh+cam.y+hh]};
  const line=(pts,w,col,dash)=>{ctx.beginPath();pts.forEach((q,k)=>{const[a,b]=P(q);k?ctx.lineTo(a,b):ctx.moveTo(a,b)});ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineJoin='round';ctx.lineCap='round';if(dash)ctx.setLineDash(dash);ctx.stroke();if(dash)ctx.setLineDash([])};
  for(const pts of L.y1857?[]:L.railL){line(pts,hh*.9,'#8a7f70');if(z>=.3)line(pts,hh*.55,'#5a4b3c',[hh*.12,hh*.3]);line(pts,Math.max(.7,hh*.14),'#34302b')}
  const cob=z>=.3?cobble():'#8a8378';
  if(L.linien){line(L.linien,hh*.9,'#6f7f45');line(L.linien,hh*.45,'#8d9a5c')}
  if(false&&L.y1857&&L.ring){if(S.ringDone){const Wr=hh*3.1;line(L.ring,Wr,'#d2cbbb');line(L.ring,Wr*.88,'#8e877b');line(L.ring,Wr*.85,cob);line(L.ring,Wr*.6,'#c9b995');line(L.ring,Wr*.3,'#8e877b');line(L.ring,Wr*.27,cob)}
}
  for(const[k,pts]of L.y1857?[]:Object.entries(L.roadL)){
   if(k==='ring'||k==='gurtel'){const W=hh*(k==='ring'?3.1:2.7);line(pts,W,'#d2cbbb');line(pts,W*.88,'#8e877b');line(pts,W*.85,cob);line(pts,W*.6,'#c9b995');line(pts,W*.3,'#8e877b');line(pts,W*.27,cob);if(z>=.3){line(pts,Math.max(.6,hh*.06),'#3f3a35')}}
   else if(k==='allee'){line(pts,hh*1.7,'#cdbd98')}
   else{const W=hh*1.75;line(pts,W,'#d2cbbb');line(pts,W*.8,'#8e877b');line(pts,W*.76,cob)}}
  const sgA=(A,w,col)=>{if(!A.length)return;ctx.beginPath();for(let k=0;k<A.length;k+=4){ctx.moveTo(A[k],A[k+1]);ctx.lineTo(A[k+2],A[k+3])}ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()};
  const Wd=hh*1.75,Wr=hh*3.7;
  // Ring avenues first, then the streets cross them, then the Ring's carriageway, then the junction mouths are opened
  sgA(RSEGR,Wr,'#d2cbbb');sgA(RSEGR,Wr*.86,'#c9b995');
  sgA(RSEG,Wd*1.14,'#cdc5b2');ctx.setLineDash([Math.max(1,hh*.04),hh*.32]);sgA(RSEG,Wd*1.1,'rgba(110,100,85,.28)');ctx.setLineDash([]);sgA(RSEG,Wd*.74,'#5f5a52');sgA(RSEG,Wd*.7,cob);
  sgA(RSEGR,Wr*.5,'#8e877b');sgA(RSEGR,Wr*.46,cob);sgA(RSEGJ,Wd*.76,cob);if(z>=.3)sgA(RSEGR,Math.max(.6,hh*.05),'#3f3a35');if(L.y1857&&(RL.size||TL.size))drawTrackLayer(hh)
  if(BRG.length){BRG.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));for(const[x,y,sx,sy]of BRG)bridgeDeck(x,y,sx,sy,hw,hh)}
  if(hz&&WALLAT){const its=[...WALLAT.entries()].sort((a,b)=>((a[0]%W)+(a[0]/W|0))-((b[0]%W)+(b[0]/W|0)));for(const[,l]of its)for(const it of l)drawWallItem(it,hw,hh)}}
 drawPiersGround();
 if(tz)visTiles(gM+hw*24,(x,y)=>{const i=y*W+x,t=S.tiles[i],o=S.b[i],cx=VX(x,y)*hw+cam.x,cy=VY(x,y)*hh+cam.y+hh;
  if(!o){if(t===MOUNT)mountain(cx,cy,hw,hh,z,hs(i));else if(t===FOREST&&z>=.2)treeR(cx+(hs(i)-.5)*6*z,cy+hh*.25,z*1.15,TREEC[(hs(i)*4)|0]);else if(DECO[i]===ALLEE&&z>=.09)alleeTrees(i,cx,cy,hw,hh,z);return}
  if(hz&&o.h&&o.t!=='road'){const f=B[o.t].foot||1;{const ft=FT(o,f);if(x!==ft[0]||y!==ft[1])return}const[ox,oy]=scr(o.x+(f-1)/2,o.y+(f-1)/2),ds=B[o.t].ds||1;drawB(o,ox,oy,z*ds,hw*ds,hh*ds,0)}});
 ctx=c0;gz=Z;gcx=cam.x;gcy=cam.y;gGV=GV}
function drawDeco(d,i,cx,cy,hw,hh,z){const r=hs(i*53+11),T=[cx,cy-hh*.88],Rr=[cx+hw*.88,cy],Bm=[cx,cy+hh*.88],Lf=[cx-hw*.88,cy];
 switch(d){
 case FIELD:{const cols=['#d9c477','#a7c25e','#b38a5e','#e2d35c','#c9b26a','#9fb85a'],col=cols[(r*cols.length)|0],ax=hs(i*7+3)<.5;
  poly([...T,...Rr,...Bm,...Lf],col);ctx.strokeStyle=shade(col,.82);ctx.lineWidth=Math.max(.6,.9*z);ctx.beginPath();
  for(let k=1;k<5;k++){const t=k/5,a=ax?lerp(T,Lf,t):lerp(T,Rr,t),b=ax?lerp(Rr,Bm,t):lerp(Lf,Bm,t);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke();break}
 case VINE:{ctx.fillStyle='#4d6a2a';for(let k=1;k<5;k++){const t=k/5,a=lerp(T,Lf,t),b=lerp(Rr,Bm,t);for(let j=1;j<6;j++){const q=lerp(a,b,j/6);ctx.beginPath();ctx.arc(q[0],q[1]-1.2*z,1.5*z,0,7);ctx.fill()}}break}
 case REED:{ctx.strokeStyle='#8f9a4e';ctx.lineWidth=Math.max(.6,.8*z);ctx.beginPath();for(let k=0;k<5;k++){const px=cx+(hs(i+k*7)-.5)*hw*1.1,py=cy+(hs(i+k*13)-.5)*hh*1.1;for(const e of[-1.6,0,1.6]){ctx.moveTo(px,py);ctx.lineTo(px+e*z,py-5*z)}}ctx.stroke();break}
 case ROCK:{for(let k=0;k<2;k++){const px=cx+(hs(i+k*7)-.5)*hw,py=cy+(hs(i+k*11)-.5)*hh;ctx.beginPath();ctx.ellipse(px,py,3*z,2*z,0,0,7);ctx.fillStyle=k?'#8e877a':'#a59e90';ctx.fill()}break}
 case FLOW:{const fc=['#f4f1e6','#f2d24b','#b58ad8','#e8789a'];for(let k=0;k<6;k++){ctx.fillStyle=fc[(hs(i+k*3)*4)|0];ctx.fillRect(cx+(hs(i+k*7)-.5)*hw*1.1,cy+(hs(i+k*11)-.5)*hh*1.1,1.6*z,1.6*z)}break}
 case ORCH:{for(let k=0;k<4;k++){const px=cx+((k&1)-.5)*hw*.7+((k>>1)-.5)*hw*.2,py=cy+((k>>1)-.5)*hh*.8;ctx.fillStyle='#6b5a3a';ctx.fillRect(px-.6*z,py-3*z,1.2*z,3*z);ctx.beginPath();ctx.arc(px,py-4.5*z,3.2*z,0,7);ctx.fillStyle='#8fa27a';ctx.fill()}break}
 case AQUA:{ctx.fillStyle='#c9a77a';ctx.fillRect(cx-hw*.85,cy-11*z,hw*1.7,8*z);ctx.fillStyle='#7d6346';for(let k=0;k<4;k++){const ax=cx-hw*.7+k*hw*.45;ctx.beginPath();ctx.moveTo(ax-hw*.13,cy-3*z);ctx.lineTo(ax-hw*.13,cy-7*z);ctx.quadraticCurveTo(ax,cy-10*z,ax+hw*.13,cy-7*z);ctx.lineTo(ax+hw*.13,cy-3*z);ctx.fill()}break}
 case MARSH:{poly([...T,...Rr,...Bm,...Lf],'#7f9c5c');for(let k=0;k<2;k++){ctx.beginPath();ctx.ellipse(cx+(hs(i+k*5)-.5)*hw*.8,cy+(hs(i+k*9)-.5)*hh*.8,5*z,2.2*z,0,0,7);ctx.fillStyle='#4f93b0';ctx.fill()}break}
 case RAIL:{break;ctx.strokeStyle='#857a6c';ctx.lineWidth=hh*.55;ctx.lineCap='butt';ctx.beginPath();for(const[dx,dy]of D4){const n=(i/W|0)*W+i%W;const x=i%W+dx,y=(i/W|0)+dy;if(inb(x,y)&&RAILM[y*W+x]){ctx.moveTo(cx,cy);ctx.lineTo(cx+DX(dx,dy)*hw/2,cy+DY(dx,dy)*hh/2)}}ctx.stroke();
  ctx.strokeStyle='#3b3631';ctx.lineWidth=Math.max(.6,hh*.12);ctx.stroke();break}
 case ALLEE:{break;for(let k=0;k<2;k++){const px=cx+(k?.25:-.25)*hw,py=cy+(k?-.1:.1)*hh;ctx.fillStyle='#6b5a3a';ctx.fillRect(px-.5*z,py-3*z,1*z,3*z);ctx.beginPath();ctx.arc(px,py-4.5*z,3.4*z,0,7);ctx.fillStyle=k?'#4f7d38':'#5a8a40';ctx.fill()}break}
 case CLAY:{poly([...lerp([cx,cy],T,.85),...lerp([cx,cy],Rr,.85),...lerp([cx,cy],Bm,.85),...lerp([cx,cy],Lf,.85)],'#b5764a');poly([...lerp([cx,cy],T,.5),...lerp([cx,cy],Rr,.5),...lerp([cx,cy],Bm,.5),...lerp([cx,cy],Lf,.5)],'#93583a');break}}}

/* ---------- footprint helpers ---------- */
const fc=o=>{const f=B[o.t].foot||1;return[o.x+(f-1)/2,o.y+(f-1)/2]};
function perim(o){const f=B[o.t].foot||1,r=[];for(let k=0;k<f;k++)r.push([o.x+k,o.y-1],[o.x+k,o.y+f],[o.x-1,o.y+k],[o.x+f,o.y+k]);return r}
const orig=(t,x,y)=>{const f=(B[t]&&B[t].foot)||1;return[x-((f-1)>>1),y-((f-1)>>1)]};
/* ---------- textured facades & Viennese perimeter blocks ---------- */
const FSTY=[{w:'#6b4535',f:'#8a5a46',h:'t',g:'door'},{w:'#9c4a32',f:'#c46a4a',h:'s',g:'shop'},{w:'#7a4a3a',f:'#a8705a',h:'a',g:'door'},{w:'#d6cdb9',f:'#ece6d8',h:'p',g:'arcade',pil:1},{w:'#a3533a',f:'#c97a5a',h:'s',g:'shop'},{w:'#8a5a46',f:'#b07a62',h:'t',g:'door'},{w:'#cbbd9f',f:'#e3d8c0',h:'a',g:'arcade',pil:1},{w:'#5a3a2e',f:'#7a5040',h:'p',g:'gothic'},{w:'#b4614a',f:'#e3c9a8',h:'p',g:'gothic'},{w:'#9c4a32',f:'#c46a4a',h:'t',g:'shop'},{w:'#6b4535',f:'#8a5a46',h:'s',g:'door'},{w:'#c9b48e',f:'#e8dcc0',h:'a',g:'shop'},{w:'#d6cdb9',f:'#ece6d8',h:'t',g:'arcade',pil:1}],FSTY_V=[{w:'#e6d9bd',f:'#f4eee1',h:'s',g:'shop'},{w:'#e3c27b',f:'#f6ecd6',h:'t',g:'rust'},{w:'#ecdcc6',f:'#f7efe2',h:'a',g:'door'},{w:'#d8ccb4',f:'#ece3cf',h:'t',g:'rust',pil:1},
 {w:'#d6d2ca',f:'#f5f3ee',h:'s',g:'shop'},{w:'#e8cfc0',f:'#f8eee6',h:'a',g:'shop'},{w:'#d9cdb6',f:'#eee5d1',h:'a',g:'arcade',pil:1},{w:'#cfc5b0',f:'#e3dac7',h:'p',g:'gothic'},{w:'#b4614a',f:'#e3c9a8',h:'p',g:'gothic'},{w:'#e8c766',f:'#f6ecd0',h:'t',g:'shop'},{w:'#c9cfb4',f:'#eef0e4',h:'s',g:'door',pil:1},{w:'#e3a78c',f:'#f6e6dc',h:'a',g:'shop'},{w:'#d2b99a',f:'#efe3d0',h:'t',g:'arcade'}];
function shHex(h,f){const n=parseInt(h.slice(1),16),c=v=>Math.max(0,Math.min(255,v*f|0));return`rgb(${c(n>>16&255)},${c(n>>8&255)},${c(n&255)})`}
function cellUpper(x,s){x.fillStyle=s.w;x.fillRect(0,0,256,128);
 if(s.pil){x.fillStyle='rgba(255,255,255,.2)';x.fillRect(16,0,24,128);x.fillRect(216,0,24,128)}
 const wx=92,wy=26,ww=72,wh=76;x.fillStyle=s.f;x.fillRect(wx-10,wy-8,ww+20,wh+16);
 if(s.h==='a'||s.h==='p'){x.beginPath();x.moveTo(wx-10,wy+4);if(s.h==='a')x.arc(wx+ww/2,wy+4,ww/2+10,Math.PI,0);else{x.lineTo(wx+ww/2,wy-30);x.lineTo(wx+ww+10,wy+4)}x.fill()}
 x.fillStyle='#2a333d';if(s.h==='a'){x.beginPath();x.moveTo(wx,wy+4);x.arc(wx+ww/2,wy+4,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.lineTo(wx,wy+wh);x.fill()}
 else if(s.h==='p'){x.beginPath();x.moveTo(wx,wy+wh);x.lineTo(wx,wy+6);x.lineTo(wx+ww/2,wy-22);x.lineTo(wx+ww,wy+6);x.lineTo(wx+ww,wy+wh);x.fill()}else x.fillRect(wx,wy,ww,wh);
 x.fillStyle='rgba(175,205,230,.32)';x.fillRect(wx,wy,ww,wh*.4);x.fillStyle=s.f;x.fillRect(wx+ww/2-4,wy-8,8,wh+8);x.fillRect(wx,wy+wh*.38,ww,6);
 x.fillStyle='rgba(0,0,0,.25)';x.fillRect(wx-13,wy+wh+9,ww+26,5);x.fillStyle=s.f;x.fillRect(wx-15,wy+wh+4,ww+30,7);
 if(s.h==='s'){x.fillStyle=s.f;x.fillRect(wx-17,wy-20,ww+34,10)}
 if(s.h==='t'){x.fillStyle=s.f;x.beginPath();x.moveTo(wx-19,wy-11);x.lineTo(wx+ww/2,wy-30);x.lineTo(wx+ww+19,wy-11);x.fill()}
 x.fillStyle='rgba(0,0,0,.1)';x.fillRect(0,122,256,6)}
function cellGround(x,s){x.fillStyle=s.g==='rust'||s.g==='arcade'?shHex(s.w,.9):s.w;x.fillRect(0,0,256,128);
 if(s.g==='rust'||s.g==='arcade'||s.g==='gothic'){x.fillStyle='rgba(0,0,0,.15)';for(let r=0;r<8;r++)x.fillRect(0,r*16,256,3)}
 if(s.g==='shop'){x.fillStyle='#4a3424';x.fillRect(26,18,204,110);x.fillStyle='#22303a';x.fillRect(38,32,124,88);x.fillRect(174,32,44,96);x.fillStyle='rgba(190,215,235,.3)';x.fillRect(38,32,124,30);x.fillStyle='#e9dfc9';x.fillRect(26,6,204,14)}
 else if(s.g==='door'||s.g==='rust'){x.fillStyle=s.f;x.beginPath();x.moveTo(74,128);x.lineTo(74,60);x.arc(128,60,54,Math.PI,0);x.lineTo(182,128);x.fill();
  x.fillStyle=s.g==='door'?'#5a3c28':'#2a333d';x.beginPath();x.moveTo(88,128);x.lineTo(88,62);x.arc(128,62,40,Math.PI,0);x.lineTo(168,128);x.fill()}
 else if(s.g==='arcade'){x.fillStyle='#3a3530';x.beginPath();x.moveTo(40,128);x.lineTo(40,56);x.arc(128,56,88,Math.PI,0);x.lineTo(216,128);x.fill()}
 else{x.fillStyle='#2a333d';x.beginPath();x.moveTo(92,128);x.lineTo(92,50);x.lineTo(128,16);x.lineTo(164,50);x.lineTo(164,128);x.fill()}}
const FAC=new Map();const CW=24;
function facade(k,bays,floors){const key=k+'|'+bays+'|'+floors;if(FAC.has(key))return FAC.get(key);
 const c=document.createElement('canvas');c.width=bays*CW;c.height=floors*CW+4;const x=c.getContext('2d'),s=FSTY[k];
 for(let f=0;f<floors;f++)for(let b=0;b<bays;b++){x.save();x.translate(b*CW,4+(floors-1-f)*CW);x.scale(CW/256,CW/128);if(f===0)cellGround(x,s);else cellUpper(x,s);x.restore()}
 x.fillStyle=shHex(s.f,.98);x.fillRect(0,0,c.width,4);x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,4,c.width,2);x.fillStyle='rgba(0,0,0,.08)';x.fillRect(0,4+(floors-1)*CW-2,c.width,2);
 FAC.set(key,c);return c}
function faceImg(img,A,Bp,h){ctx.save();ctx.transform((Bp[0]-A[0])/img.width,(Bp[1]-A[1])/img.width,0,h/img.height,A[0],A[1]-h);ctx.drawImage(img,0,0);ctx.restore()}
function prismTex(cx,cy,ax,ay,h,k,floors,roof,rh,t,t2,tex){const ux=t*ax,uy=t2*ax,vx=-t*ay,vy=t2*ay,U=p=>[p[0],p[1]-h];
 const C=[cx+ux+vx,cy+uy+vy],Rr=[cx+ux-vx,cy+uy-vy],Bk=[cx-ux-vx,cy-uy-vy],Lf=[cx-ux+vx,cy-uy+vy];
 if(tex){faceImg(facade(k,Math.max(1,Math.round(ax*8)),floors),Lf,C,h);faceImg(facade(k,Math.max(1,Math.round(ay*8)),floors),C,Rr,h);poly([...C,...Rr,...U(Rr),...U(C)],'rgba(15,20,35,.3)')}
 else{poly([...Lf,...C,...U(C),...U(Lf)],FSTY[k].w);poly([...C,...Rr,...U(Rr),...U(C)],shHex(FSTY[k].w,.74))}
 const Ct=U(C),Rt=U(Rr),Bt=U(Bk),Lt=U(Lf),M=[cx,cy-h];
 if(ax>=ay){const q=(ax-ay)/ax,P1=[M[0]+ux*q,M[1]+uy*q-rh],P2=[M[0]-ux*q,M[1]-uy*q-rh];
  poly([...Rt,...Bt,...P2,...P1],shade(roof,1.12));poly([...Bt,...Lt,...P2],shade(roof,1.05));poly([...Lt,...Ct,...P1,...P2],roof);poly([...Ct,...Rt,...P1],shade(roof,.76))}
 else{const q=(ay-ax)/ay,P1=[M[0]+vx*q,M[1]+vy*q-rh],P2=[M[0]-vx*q,M[1]-vy*q-rh];
  poly([...Lt,...Bt,...P2,...P1],shade(roof,1.12));poly([...Rt,...Bt,...P2],shade(roof,1.05));poly([...Lt,...Ct,...P1],roof);poly([...Ct,...Rt,...P2,...P1],shade(roof,.76))}
 if(tex&&ctx.lineWidth!==undefined){ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...Ct);ctx.lineTo(...C);ctx.stroke()}}
const ROOFS=['#8a4a36','#7b4230','#74706a','#67635e','#965a3e','#5f8e7c','#a6532f','#5a5f66'];
function blockVariant(o){return(hs(o.x*13+o.y*7)*48)|0}
function drawBlock(o,cx,cy,hw){const t=hw/4,t2=t/2,tex=t>=4.5,vr=blockVariant(o),lv=o.lvl,old=o.v==='old';
 let sd=vr*7919+lv*104729+(old?31:0)+1;const r=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646};
 const S=(u,v)=>[cx+(u-v)*t,cy+(u+v)*t2],fl=(old?4:[0,2,3,3,4,5,5][lv])+(o.tier?(NYC()?[0,2,4,7]:[0,1,1,2,3,3,4])[o.tier]||0:0)+(L.y1857&&lv>=4&&RES().kaplan?Math.max(0,Math.min(6,Math.floor((skyYear()-1889)/4))):0),H=1.85;
 const sty=()=>old?[2,5,0,2,9][(r()*5)|0]:lv>=6?[3,3,4,1,12][(r()*5)|0]:lv===5?[3,1,4,6,10,12][(r()*6)|0]:lv>=3?[0,1,4,5,3,9,10,11][(r()*8)|0]:[0,4,5,2,9,11][(r()*6)|0];
 const rf=()=>old?ROOFS[[0,1,4,2][(r()*4)|0]]:lv>=5?ROOFS[[2,3,5,0][(r()*4)|0]]:ROOFS[[0,1,2,3,4][(r()*5)|0]];
 const fh=.3*t,lots=[];
 poly([...S(-H,-H),...S(H,-H),...S(H,H),...S(-H,H)],lv===1?'#7fa152':'#b3aa97');
 if(lv===1){for(const[u,v]of[[-1,-1],[1,-1],[-1,1],[1,1]])if(r()<.85)lots.push({u:u*.95,v:v*.95,ax:.55,ay:.42,f:2})}
 else{const d=old?.7+r()*.1:.6+r()*.08,split=len=>{const out=[];let p=0;while(p<len-.3){let l=Math.min(len-p,.6+r()*.55);if(len-p-l<.4)l=len-p;out.push([p,l]);p+=l}return out};
  for(const[p,l]of split(2*H))lots.push({u:-H+p+l/2,v:-H+d/2,ax:l/2,ay:d/2});
  for(const[p,l]of split(2*H-2*d))lots.push({u:-H+d/2,v:-H+d+p+l/2,ax:d/2,ay:l/2});
  for(const[p,l]of split(2*H-2*d))lots.push({u:H-d/2,v:-H+d+p+l/2,ax:d/2,ay:l/2});
  for(const[p,l]of split(2*H))lots.push({u:-H+p+l/2,v:H-d/2,ax:l/2,ay:d/2});
  for(const L_ of lots){L_.f=Math.max(2,fl+(r()<.35?1:0)-(r()<.2?1:0));if(lv===2&&r()<.22)L_.skip=1}}
 lots.sort((a,b)=>(a.u+a.v)-(b.u+b.v));
 for(const L_ of lots){if(L_.skip)continue;const[x,y]=S(L_.u,L_.v),h=L_.f*fh+.25*t;prismTex(x,y,L_.ax,L_.ay,h,sty(),L_.f,'#4a4540',t*.04,t,t2,tex);
  if(tex&&L_.f>=3&&r()<.6){const wx=x+(r()-.5)*L_.ax*t*.6,wy=y-h-.08*t;ctx.fillStyle='#7a5532';ctx.fillRect(wx-.1*t,wy-.32*t,.2*t,.26*t);ctx.beginPath();ctx.moveTo(wx-.12*t,wy-.32*t);ctx.lineTo(wx,wy-.46*t);ctx.lineTo(wx+.12*t,wy-.32*t);ctx.fill();ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(wx-.08*t,wy-.06*t);ctx.lineTo(wx-.08*t,wy+.04*t);ctx.moveTo(wx+.08*t,wy-.06*t);ctx.lineTo(wx+.08*t,wy+.04*t);ctx.stroke()}
  if(tex&&lv<=3&&L_.f>=3&&r()<.5){ctx.strokeStyle='rgba(20,18,16,.75)';ctx.lineWidth=Math.max(.5,t*.025);const ex=x-L_.ax*t*.45,ey=y+L_.ay*t2*.1;ctx.beginPath();for(let f=1;f<L_.f;f++){const yy=ey-f*fh;ctx.moveTo(ex,yy);ctx.lineTo(ex+.35*t,yy+.17*t);ctx.moveTo(ex+.05*t,yy);ctx.lineTo(ex+.3*t,yy-fh+.17*t)}ctx.stroke()}}
 if(lv===6&&tex){const[x,y]=S(H-.3,H-.3),h=(fl+1)*fh+.25*t;ctx.fillStyle='#ece3cf';ctx.fillRect(x-.22*t,y-h-.5*t,.44*t,.5*t);ctx.beginPath();ctx.ellipse(x,y-h-.5*t,.26*t,.36*t,0,Math.PI,0);ctx.fillStyle='#5f8e7c';ctx.fill()}}
function shadowOf(o,ox,oy,hw,hh){const f=B[o.t].foot||1;let H;
if(o.t==='bastion')return;
 if(o.t==='house'&&L.style==='wien1900')H=(o.v==='old'?4:[0,2,3,3,4,5,5][o.lvl])*.3*hw+.3*hw;else H=spriteH0(o)*(B[o.t].ds||1)*Z*.7*(L.y1857&&LMZ[o.t]?LMZ[o.t]:1);
 const k=o.t==='house'?.92:1,T=[ox,oy-hh*f*k],R_=[ox+hw*f*k,oy],Bm=[ox,oy+hh*f*k],L_=[ox-hw*f*k,oy],dx=H*.8,dy=H*.32;
 poly([...T,T[0]+dx,T[1]+dy,R_[0]+dx,R_[1]+dy,Bm[0]+dx,Bm[1]+dy,...Bm,...L_],'rgba(25,32,45,.2)')}
function OLD_treeR(x,y,z,c){ctx.fillStyle='rgba(20,30,25,.2)';ctx.beginPath();ctx.ellipse(x+4.5*z,y+1.2*z,6.5*z,2.6*z,0,0,7);ctx.fill();
 ctx.fillStyle='#5b4632';ctx.fillRect(x-.8*z,y-5*z,1.6*z,5*z);const r=5.4*z;
 ctx.beginPath();ctx.arc(x,y-9*z,r,0,7);ctx.fillStyle=c;ctx.fill();ctx.beginPath();ctx.arc(x-1.7*z,y-10.6*z,r*.62,0,7);ctx.fillStyle=shade(c,1.2);ctx.fill();
 ctx.beginPath();ctx.arc(x+2*z,y-7.4*z,r*.48,0,7);ctx.fillStyle=shade(c,.82);ctx.fill()}
const TREEC=['#4c7a33','#58873a','#3f6c2c','#628f3f'];
function alleeTrees(i,cx,cy,hw,hh,z){for(let k=0;k<2;k++){const px=cx+(k?.26:-.26)*hw,py=cy+(k?-.12:.12)*hh;treeR(px,py,z*.82,TREEC[(hs(i*3+k)*4)|0])}}
function forestTile(i,cx,cy,hw,hh,z){if((ELEV[i]||0)>.35){const a=hs(i),b=hs(i+999);tree(cx-hw*.35+a*6*z,cy-hh*.1,z*.85,'#3e6b2c');tree(cx+hw*.3-b*5*z,cy-hh*.05,z*.8,'#4a7a33');tree(cx+(a-b)*8*z,cy+hh*.4,z*.95,'#3a6229');return}
 const a=hs(i),b=hs(i+77);treeR(cx-hw*.3+a*4*z,cy-hh*.15,z*.95,TREEC[(a*4)|0]);treeR(cx+hw*.28-b*4*z,cy,z*.9,TREEC[(b*4)|0]);treeR(cx+(a-b)*6*z,cy+hh*.42,z,TREEC[((a+b)*2)|0]%4?TREEC[1]:TREEC[3])}
let COBP=null,COBZ=0;
function cobble(){if(COBP&&COBZ===Z)return COBP;const c=document.createElement('canvas');c.width=24;c.height=16;const x=c.getContext('2d');x.fillStyle='#7d776e';x.fillRect(0,0,24,16);
 for(let r=0;r<4;r++)for(let k=-1;k<5;k++){const ox=k*6+(r%2)*3,oy=r*4;x.fillStyle=['#958e83','#8c857a','#9a9387','#888175'][(r*5+k+8)%4];x.beginPath();x.ellipse(ox+3,oy+2,2.6,1.6,0,0,7);x.fill()}
 COBP=ctx.createPattern(c,'repeat');if(COBP.setTransform&&window.DOMMatrix)COBP.setTransform(new DOMMatrix([Z*.7,Z*.35,-Z*.7,Z*.35,0,0]));COBZ=Z;return COBP}

/* ---------- sprite cache for static buildings ---------- */
const SPR=new Map();
const useSprite=o=>o.t==='house'||o.t==='market'||(B[o.t].lm&&o.t!=='rad'&&o.t!=='brunnen');
function sprKey(o,zb){let v='';if(o.t==='house'&&L.style==='wien1900')return`h|${o.lvl}${o.v||''}|t${o.tier||0}|${o.lvl>=4&&RES().kaplan?Math.floor((skyYear()-1889)/4):0}|${blockVariant(o)}|${o.h?'h':o.c?'c':'n'}|${o.bld?'b'+Math.floor(siteProg(o)*5):''}|${zb}`;if(o.t==='house'){const st=STY[L.style]||STY.isles,sp=o.v==='old'&&st.old?st.old:st[o.lvl];v=`${o.lvl}${o.v||''}${(hs(o.x*73+o.y*131)*sp.wall.length)|0}${sp.roofs?(hs(o.x*17+o.y*29)*sp.roofs.length)|0:0}`}
 return`${o.t}|${v}|${o.t==='tower'?Math.floor(skyYear()):''}|${o.up2?'u':''}|${o.h?'h':o.c?'c':'n'}|${o.bld?'b'+Math.floor(siteProg(o)*5):''}|${zb}`}
function getSprite(o,zb){const key=sprKey(o,zb);if(SPR.has(key))return SPR.get(key);if(SPR.size>500)SPR.clear();
 const f=B[o.t].foot||1,ds=B[o.t].ds||1,hwT=TW/2*zb,hhT=TH/2*zb,d=Math.min(2,window.devicePixelRatio||1);
 const left=f*hwT*1.15+12,up=(o.t==='house'&&L.style==='wien1900')?3.4*hwT+f*hhT*.6+12:(spriteH0(o)+95)*ds*zb+f*hhT*.3+12,down=f*hhT*1.15+12,w=Math.ceil(left*2),h=Math.ceil(up+down);
 if(w*h*d*d>2.6e6){SPR.set(key,null);return null}
 const c=document.createElement('canvas');c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);const cx2=c.getContext('2d');cx2.setTransform(d,0,0,d,d*left,d*up);
 const c0=ctx,g0=GLOW.length,nf=NF;ctx=cx2;NF=0;try{drawB(o,0,0,zb*ds,hwT*ds,hhT*ds,0)}finally{ctx=c0;NF=nf}
 const sp={c,left,up,w,h,glow:GLOW.splice(g0)};SPR.set(key,sp);return sp}
/* ---------- visible tile iteration ---------- */
function visTiles(m,cb){const hw=TW/2*Z,hh=TH/2*Z,a0=(-m-cam.x)/hw,a1=(vw+m-cam.x)/hw,b0=(-m-cam.y)/hh-2,b1=(vh+m-cam.y)/hh+1;
 const s0=Math.max(0,Math.floor(b0)),s1=Math.min(W+H-2,Math.ceil(b1)),d0=Math.floor(a0),d1=Math.ceil(a1);
 for(let s=s0;s<=s1;s++){let dS=Math.max(d0,-s,s-2*(H-1)),dE=Math.min(d1,s,2*(W-1)-s);if((dS+s)&1)dS++;
  for(let d=dS;d<=dE;d+=2){const m_=RU((s+d)>>1,(s-d)>>1);cb(m_[0],m_[1])}}}
/* ---------- 1900 drawings ---------- */
STY.wien1900={1:{s:.62,h:12,rh:10,wall:['#efe3c4','#e8dcc0','#f1e9d6'],roof:'#a8553a',F:2,win:3,chim:1},
 2:{s:.7,h:18,rh:10,wall:['#ecdcb6','#e6d2a8','#efe6d3','#e9d5bd'],roof:'#9b4b33',roofs:['#9b4b33','#a65a3c','#8c4430'],F:3,win:4,chim:1,corn:1},
 3:{s:.78,h:26,rh:9,wall:['#e9d9b8','#dfd0b4','#ead7a7','#d9c9b0','#e4cfb9'],roof:'#7d4232',roofs:['#7d4232','#6d6964','#8a4e36','#75716b'],F:4,win:5,corn:1,shop:1,chim:1},
 4:{s:.82,h:34,rh:9,wall:['#f0e6d0','#e8dcc2','#f2dfae','#ddd5c8'],roof:'#5f8e7c',F:5,win:5,corn:1,shop:1,turret:1,gold:1},
 old:{s:.8,h:28,rh:16,wall:['#efe1bb','#e7d3a6','#f2e8d2','#e3c99a','#ead9c0'],roof:'#8f5a3c',roofs:['#8f5a3c','#7a4a34','#6d6964','#9a5e3e'],F:4,win:4,corn:1,chim:1}};
function houseExtras(o,sp,cx,cy,s,h,rh,z,wall,PL,PR){
 if(sp.shop){for(const P of[PL,PR])for(let j=0;j<sp.win;j++){const u0=(j+.12)/sp.win,u1=(j+.88)/sp.win,v=.92/sp.F;fq(P,u0,u1,v*.82,v*.98,j%2?'#a8402c':'#e8dcc8');fq(P,u0,u1,v*.82,v*.86,'#7d2e20')}}
 if(sp.gold)for(const P of[PL,PR])fq(P,0,1,.9,.925,'#c9a54a');
 if(sp.turret){const[tx,ty]=PL(1,1);const ts=s*.17,th=rh*1.5;box(tx,ty+ts*.5,ts,th,wall,'#5f8e7c',0,true);
  ctx.beginPath();ctx.ellipse(tx,ty+ts*.5-th,ts*1.02,ts*1.25,0,Math.PI,0);ctx.fillStyle='#5f8e7c';ctx.fill();ctx.fillStyle='#c9a54a';ctx.fillRect(tx-.6*z,ty+ts*.5-th-ts*1.25-4*z,1.2*z,4*z)}}
function drawLandmark2(k,cx,cy,z,hw,hh,now){
 switch(k){
 case'belved':{poly([cx,cy-hh*1.9,cx+hw*1.9,cy,cx,cy+hh*1.9,cx-hw*1.9,cy],'#86b05e');
  for(const[a,b2]of[[-.5,.5],[.15,.95],[-.95,.15]]){ctx.beginPath();ctx.ellipse(cx+hw*a,cy+hh*b2,9*z,4.5*z,0,0,7);ctx.fillStyle='#5c9bc0';ctx.fill()}
  ctx.strokeStyle='#e9dcc0';ctx.lineWidth=1.6*z;ctx.beginPath();ctx.moveTo(cx-hw*1.1,cy+hh*1.1);ctx.lineTo(cx+hw*.5,cy-hh*.5);ctx.stroke();
  const lw=prism(cx-hw*.85,cy+hh*.85,.75,.18,11*z,'#f3efe6','#6c9a86',5*z,hw,hh);winGrid(lw.L,9,1,.15,.85,'#4a5866');
  const b=prism(cx+hw*.6,cy-hh*.6,1.15,.32,22*z,'#f5f2ea','#5f9883',8*z,hw,hh);winGrid(b.L,13,2,.1,.9,'#4a5866','#fbf8f1');winGrid(b.R,3,2,.1,.9,'#4a5866');
  for(const u of[.12,.5,.88]){const[px,py]=b.L(u,1);dome(px+hw*.12,py-6*z,7*z,9*z,'#5f9883')}break}
 case'rathaus':{const b=prism(cx,cy,.9,.7,26*z,'#d6ccb6','#5b6670',10*z,hw,hh);winGrid(b.L,9,3,.08,.85,'#3d4a5a','#efe6d2');winGrid(b.R,7,3,.08,.85,'#3d4a5a','#efe6d2');
  const[tx,ty]=b.L(.5,1);box(tx,ty+hh*.08,hw*.13,44*z,'#d9cfba','#5b6670',22*z);ctx.fillStyle='#c9a54a';ctx.fillRect(tx-1.2*z,ty-74*z,2.4*z,7*z);
  for(const u of[.08,.92]){const[px,py]=b.L(u,1);poly([px-3*z,py,px+3*z,py,px,py-14*z],'#5b6670')}break}
 case'parlament':{const b=prism(cx,cy,1,.7,20*z,'#ebe3d1','#d8cfba',0,hw,hh);winGrid(b.L,12,2,.1,.8,'#4a5562');winGrid(b.R,8,2,.1,.8,'#4a5562');
  for(let j=0;j<8;j++)fq(b.L,.3+j*.055,.322+j*.055,0,.95,'#f8f4ea');poly([...b.L(.28,.95),...b.L(.74,.95),...b.L(.51,1.32)],'#f3ecdd');
  for(const u of[.04,.96]){const[px,py]=b.L(u,1);ctx.fillStyle='#4f5a52';ctx.fillRect(px-4*z,py-8*z,8*z,8*z)}break}
 case'votiv':{const b=prism(cx+hw*.15,cy-hh*.05,.55,.8,20*z,'#e5ded0','#6f777e',14*z,hw,hh);winGrid(b.R,6,1,.2,.85,'#4a5866');
  for(const u of[.25,.75]){const[px,py]=b.L(u,0);box(px,py,hw*.12,56*z,'#e5ded0','#6f777e',30*z);const q=fP(px,py,hw*.12,56*z,-1);for(let v=.2;v<.95;v+=.18)fq(q,.3,.7,v,v+.1,'#4a5866')}break}
 case'secession':{const b=prism(cx,cy,.8,.8,16*z,'#f6f3ec','#ece9e0',0,hw,hh);fq(b.L,.3,.7,0,.75,'#ece7dc');fq(b.L,.42,.58,0,.5,'#3a3a3a');
  fq(b.L,.05,.95,.82,.9,'#c9a54a');const[mx,my]=b.top;for(const[ax,ay]of[[-.55,0],[.55,0]]){ctx.fillStyle='#f6f3ec';ctx.fillRect(mx+ax*hw*.8-2*z,my-12*z,4*z,12*z)}
  ctx.beginPath();ctx.arc(mx,my-11*z,11*z,0,7);ctx.fillStyle='#b8902a';ctx.fill();
  for(let j=0;j<46;j++){const a=hs(j*13)*6.283,r=hs(j*7+1)*10*z;ctx.beginPath();ctx.arc(mx+Math.cos(a)*r,my-11*z+Math.sin(a)*r*.95,1.6*z,0,7);ctx.fillStyle=j%3?'#e4c25a':'#8f6d1c';ctx.fill()}break}
 case'pavillon':{const b=prism(cx,cy,.75,.42,12*z,'#f2efe6','#5f9e86',5*z,hw,hh);fq(b.L,0,1,.68,.86,'#5f9e86');fq(b.L,.38,.62,0,.68,'#e8e2d2');
  for(const u of[.2,.5,.8]){const[px,py]=b.L(u,.78);ctx.beginPath();ctx.arc(px,py,2.6*z,0,7);ctx.fillStyle='#c9a54a';ctx.fill()}
  for(const u of[.02,.98]){const q=b.L(u,0);ctx.fillStyle='#5f9e86';ctx.fillRect(q[0]-1*z,q[1]-12*z,2*z,12*z)}break}
 case'postspar':{const b=prism(cx,cy,1,.8,30*z,'#e6e5e2','#8b9096',0,hw,hh);winGrid(b.L,10,5,.12,.92,'#3e4a56');winGrid(b.R,8,5,.12,.92,'#3e4a56');
  fq(b.L,0,1,0,.12,'#a8aaa8');ctx.fillStyle='#8d9196';for(let j=0;j<40;j++){const q=b.L((j%10+.5)/10,.1+((j/10|0)+.5)*.2);ctx.fillRect(q[0]-.5*z,q[1]-.5*z,1*z,1*z)}
  for(const u of[.05,.95]){const[px,py]=b.L(u,1);ctx.fillStyle='#f4f4f2';ctx.fillRect(px-2*z,py-10*z,4*z,10*z)}break}
 case'steinhof':{const b=prism(cx,cy,.65,.65,20*z,'#f4f2ec','#e8e4d8',0,hw,hh);winGrid(b.L,3,1,.25,.85,'#4a5866');winGrid(b.R,3,1,.25,.85,'#4a5866');
  const[mx,my]=b.top;ctx.fillStyle='#f4f2ec';ctx.fillRect(mx-12*z,my-10*z,24*z,10*z);dome(mx,my-10*z,15*z,20*z,'#c7a64a');ctx.fillStyle='#c7a64a';ctx.fillRect(mx-1.2*z,my-36*z,2.4*z,7*z);
  for(const u of[.06,.94]){const[px,py]=b.L(u,0);box(px,py,hw*.08,30*z,'#f4f2ec','#5f9883',0,true);dome(px,py-30*z,4*z,6*z,'#5f9883')}break}
 case'looshaus':{const b=prism(cx,cy,.75,.75,30*z,'#f3f0ea','#8a7e72',8*z,hw,hh);fq(b.L,0,1,0,.28,'#4f7a5e');fq(b.R,0,1,0,.28,'#4f7a5e');
  for(let j=0;j<4;j++)fq(b.L,.2+j*.2,.24+j*.2,0,.28,'#e7e3da');winGrid(b.L,6,3,.36,.95,'#3e4a56');winGrid(b.R,6,3,.36,.95,'#3e4a56');break}}}

let SPOT=null,SPOTK='';
function spotGood(m,x,y,f){if(m==='sheep')return count(x+((f-1)>>1),y+((f-1)>>1),f+3,i=>S.tiles[i]===GRASS&&!S.b[i]&&!(fert[i]&40))/((2*f+7)**2)>=.25;if(m==='vineyard')return true;if(m!=='woodcutter'&&m!=='sheep'&&m!=='garden'&&m!=='grainf')return true;const cx=x+((f-1)>>1),cy=y+((f-1)>>1),RR=f+3,AR=(2*RR+1)**2;
 if(m==='woodcutter')return count(cx,cy,RR,i=>S.tiles[i]===FOREST&&!S.b[i]&&!(fert[i]&32))/AR>=.08;
 return count(cx,cy,RR,i=>S.tiles[i]===GRASS&&!S.b[i]&&!(fert[i]&40))/AR>=.2}
function spots(m){const key=m+'|'+GV+'|'+S.list.length+'|'+S.limit;if(SPOTK===key)return SPOT;SPOTK=key;
 const f=B[m].foot||1,cov=new Uint8Array(W*H),anc=[];
 for(let y=0;y<=H-f;y++)for(let x=0;x<=W-f;x++){const i0=y*W+x;if(!canUse(m,i0)||S.b[i0])continue;const e=canPlace(m,x,y);if(e&&!e.startsWith('Not enough'))continue;if(!spotGood(m,x,y,f))continue;
  anc.push(i0);for(let dy=0;dy<f;dy++)for(let dx=0;dx<f;dx++)cov[(y+dy)*W+x+dx]=1}
 SPOT={cov,anc};return SPOT}
/* the home whose card asked for a service: the spot suggested must reach it, and when no free spot does the player is told */
let FORH=null;
function spotFor(h,sp){const f=B[mode].foot||1,R=B[mode].radius,pts=[[h.x,h.y],[h.x+2,h.y+2]];let best=-1,bd=1e9;
 for(const a of sp.anc){const ax=a%W,ay=a/W|0,cx=ax+(f-1)/2,cy=ay+(f-1)/2;if(!pts.some(([x,y])=>Math.hypot(x-cx,y-cy)<=R-.5))continue;
  const d=Math.hypot(cx-h.x,cy-h.y)+(needsRoad({t:mode})&&!byRoad(ax,ay,f)?R:0);if(d<bd){bd=d;best=a}}return best}
function findSpot(at){setTimeout(()=>{if(pend&&!pend.startsWith('r')&&!pend.startsWith('l')&&(matchMedia('(pointer:coarse)').matches))confShow('build')},0);if(!mode||mode==='road'||mode==='demolish'||!B[mode]||B[mode].lm)return false;const sp=spots(mode);
 if(!sp.anc.length){toast(S.limit<1?'No free spot for this yet. More land opens in 1892':'No free spot for this right now');return false}
 const fh=FORH&&B[mode].radius&&S.list.includes(FORH)?FORH:null;FORH=null;
 if(fh){const a=spotFor(fh,sp);if(a<0){const d=B[mode],m=mode;evChoice(`${d.i} No free spot near this home`,`${anA(d.n.toLowerCase()).replace(/^a/,'A')} reaches ${d.radius} tiles, and no free plot that close to this home is left. Make room nearer to it: pull down a building there, or use a plot that is still empty. A spot further away helps other homes, but not this one.`,[['🔍 Show the nearest free spot',()=>{setMode(m);findSpot({x:fh.x,y:fh.y})}],['Close',()=>setMode(null)]]);return false}
  const ax=a%W,ay=a/W|0,h=(B[mode].foot||1)-1>>1;if(Z<.4)zoomAt(vw/2,vh/2,.55);centerOn(ax+h,ay+h);hover={x:ax+h,y:ay+h};pend=ax+','+ay;if(matchMedia('(pointer:coarse)').matches)confShow('build');toast('Found a spot that reaches this home. Tap the green area to build');return true}
 const c=at||pick(vw/2,vh/2),f=B[mode].foot||1;let best=-1,bd=1e9;for(const a of sp.anc){const d=Math.hypot(a%W-c.x,(a/W|0)-c.y)+(needsRoad({t:mode})&&!byRoad(a%W,a/W|0,f)?14:0)+(L.y1857&&f===4&&(a%W%5!==1||(a/W|0)%5!==1)?6:0);if(d<bd){bd=d;best=a}}
 /* a service (waste collection, police, fire station, hospital, coffeehouse) is suggested where most people live without one in reach:
    the residents of the houses it would reach that no other covers, more for the better homes, less for a spot with no road */
 {const ck=COVK[mode],R=B[mode].radius;if(ck&&R&&COV[ck]&&mode!=='bahnhof'&&mode!=='tram'){const G=4,gw=Math.ceil(W/G),gh=Math.ceil(H/G),need=new Float32Array(gw*gh);let any=0;const hx=ECO().fix;
  for(const o of S.list){if(o.t!=='house'||o.r||o.h&&hx&&ck!=='bank'||COV[ck][o.y*W+o.x])continue;const v=(o.pop||1)*(1+(o.lvl||1)/3);need[((o.y/G)|0)*gw+((o.x/G)|0)]+=v;any+=v}
  if(any>0){const rc=Math.ceil(R/G),st=Math.max(1,Math.ceil(sp.anc.length/6000));let bs=-1e9;for(let n=0;n<sp.anc.length;n+=st){const a=sp.anc[n],ax=a%W+f/2,ay=(a/W|0)+f/2,gx=(ax/G)|0,gy=(ay/G)|0;let sc=0;
    for(let y=Math.max(0,gy-rc);y<=Math.min(gh-1,gy+rc);y++)for(let x=Math.max(0,gx-rc);x<=Math.min(gw-1,gx+rc);x++){const dx=(x+.5)*G-ax,dy=(y+.5)*G-ay;if(dx*dx+dy*dy<=R*R)sc+=need[y*gw+x]}
    if(needsRoad({t:mode})&&!byRoad(a%W,a/W|0,f))sc*=.7;sc-=Math.hypot(a%W-c.x,(a/W|0)-c.y)*.01;if(sc>bs){bs=sc;best=a}}}}}
 const ax=best%W,ay=best/W|0,h=(f-1)>>1;if(Z<.4)zoomAt(vw/2,vh/2,.55);centerOn(ax+h,ay+h);hover={x:ax+h,y:ay+h};pend=ax+','+ay;if(matchMedia('(pointer:coarse)').matches)confShow('build');toast(coarse?'Found a spot. Tap the green area to build':'Found a spot. Click it to build');return true}
function byRoad(x,y,f){for(let k=0;k<f;k++)for(const[a,b]of[[x+k,y-1],[x+k,y+f],[x-1,y+k],[x+f,y+k]])if(inb(a,b)&&dist[b*W+a]>=0)return true;return false}
function canFarm(t,i){const c=B[t].crop;return!c||!!(fert[i]&(c==='tobacco'?1:2))}
let ZBF=1,ZBH=0;
function draw(now){{const zn=Math.min(2,2**(Math.round(Math.log2(Z)*3)/3)),pin=performance.now()-lastZoomT<250||ptrs.size>1;if(!pin||!ZBH||Z/ZBH>2.2||Z/ZBH<.45)ZBH=zn;ZBF=ZBH}
 if(!S){ctx.fillStyle=L.bg;ctx.fillRect(0,0,vw,vh);return}
 clampCam();NF=night();GLOW.length=0;
 const z=Z,hw=TW/2*z,hh=TH/2*z,mw=hw*2,mh=70*z,tz=z<.5,hz=z<.22;
 const bm=mode&&mode!=='demolish'?mode:null;
 const ho=hover&&bm?orig(bm,hover.x,hover.y):null;
 const R=bm&&B[bm].radius&&hover&&inb(hover.x,hover.y)?B[bm].radius:0;
 {const zooming=performance.now()-lastZoomT<180,sc=Z/gz,X0=cam.x+(-gM-gcx)*sc,Y0=cam.y+(-gM-gcy)*sc,cover=X0<=1&&Y0<=1&&X0+gcw*sc>=vw-1&&Y0+gch*sc>=vh-1;
  const pinching=zooming||ptrs.size>1;if(gGV<0||(!pinching&&(!cover||Math.abs(sc-1)>.002))||(!pinching&&ptrs.size===0&&gGV!==GV)){renderGround();ctx.drawImage(gC,0,0,gC.width,gC.height,-gM,-gM,gcw,gch)}
  else ctx.drawImage(gC,0,0,gC.width,gC.height,X0,Y0,gcw*sc,gch*sc)}
 if(z>=.5)for(const i of WV){if(hs(i*7+Math.floor(now/1100))<.05){const x=i%W,y=i/W|0,sx=VX(x,y)*hw+cam.x,sy=VY(x,y)*hh+cam.y+hh;if(sx<0||sx>vw||sy<0||sy>vh)continue;ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.2*z;ctx.beginPath();ctx.moveTo(sx-6*z,sy);ctx.lineTo(sx+6*z,sy);ctx.stroke()}}
 const SP=bm&&bm!=='road'&&bm!=='bridge'&&!B[bm].lm?spots(bm):null;
 if(bm||R){const[hcx,hcy]=ho?[ho[0]+((B[bm].foot||1)-1)/2,ho[1]+((B[bm].foot||1)-1)/2]:[0,0];
  visTiles(0,(x,y)=>{const sx=VX(x,y)*hw+cam.x,sy=VY(x,y)*hh+cam.y+hh,i=y*W+x,t=S.tiles[i];if(t===WATER||t===BRIDGE)return;
   if(bm&&bm!=='bridge'&&(!canUse(bm,i)||RAILM[i]||(fert[i]&40)||!canFarm(bm,i)))dia(sx,sy,hw,hh,'rgba(10,20,30,.32)');else if(SP){if(SP.cov[i])dia(sx,sy,hw,hh,'rgba(150,255,160,.22)');else dia(sx,sy,hw,hh,'rgba(10,20,30,.2)')}
   if(bm==='road'&&RINGSET&&!S.ringDone&&RINGSET.has(i)&&!S.b[i])dia(sx,sy,hw,hh,'rgba(235,185,50,.55)');
   if(R&&Math.hypot(x-hcx,y-hcy)<=R+.3)dia(sx,sy,hw,hh,'rgba(255,230,140,.22)')})}
 if(mode==='road'&&SLINE){const okL=SLINE.every(i=>(S.b[i]&&S.b[i].t==='road')||S.tiles[i]===BRIDGE||!canPlace('road',i%W,i/W|0));for(const i of SLINE){const[sx,sy]=scr(i%W,i/W|0);dia(sx,sy,hw,hh,okL?'rgba(90,210,120,.5)':'rgba(220,70,50,.5)')}}
 if((mode==='rail'||mode==='tramline')&&LA>=0){let pv=null;if(hover&&inb(hover.x,hover.y)){const hk=hover.y*W+hover.x,key=LA+'>'+hk;if(!LPV||LPV.key!==key){LPV={key,p:linePlan(mode,LA,hk)}}pv=LPV.p}const[ax,ay]=scr(LA%W,LA/W|0);dia(ax,ay,hw,hh,'rgba(217,169,42,.8)');
  if(pv){for(const i of pv.tiles){const[sx,sy]=scr(i%W,i/W|0);dia(sx,sy,hw,hh,'rgba(90,210,120,.45)')}const e=pv.tiles[pv.tiles.length-1],[ex,ey]=scr(e%W,e/W|0);ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillStyle='#1d1b1a';ctx.fillText(costStr(pv.cost),ex,ey-hh*1.4)}}
 if(mode==='road'&&RA>=0){let pv=null;if(hover&&inb(hover.x,hover.y)){const hk=snapRoad(hover.y*W+hover.x,RA),key=RA+'>'+hk;if(!RPV||RPV.key!==key){const p_=roadPlan(RA,hk);RPV={key,p:p_}}pv=RPV.p}
  if(pv){const okC=S.stock.gold>=pv.cost;for(const i of pv.tiles){const[sx,sy]=scr(i%W,i/W|0);dia(sx,sy,hw,hh,okC?'rgba(90,210,120,.45)':'rgba(220,70,50,.45)')}
   const e=pv.tiles[pv.tiles.length-1],[ex,ey]=scr(e%W,e/W|0);ctx.font=`600 ${Math.max(11,12*Math.max(z,.6))}px system-ui`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillText(`${money(pv.cost)}`,ex+1,ey-hh-1);ctx.fillStyle='#fff';ctx.fillText(`${money(pv.cost)}`,ex,ey-hh-2)}
  const[sx,sy]=scr(RA%W,RA/W|0);ctx.beginPath();ctx.arc(sx,sy-hh*.3,Math.max(5,hh*.45),0,7);ctx.fillStyle='#d9a92a';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke()}
 if(mode&&B[mode]&&B[mode].lm){const rp=lmReal(mode);if(rp){const[sx,sy]=scr(rp[0],rp[1]),rr=L.realR||4;ctx.beginPath();ctx.ellipse(sx,sy,hw*rr,hh*rr,0,0,7);ctx.strokeStyle='rgba(255,211,77,.9)';ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
  ctx.font=`${Math.max(18,22*z)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('📍',sx,sy)}}
 if(L.y1857){const nw=performance.now(),dA=Math.min(.1,(nw-(window.ARTLAST||nw))/1000);window.ARTLAST=nw;drawSurf();drawWaterfront(dA)}
 const TB=L.y1857&&z>=.3?trafBuckets():null,OQ=L.y1857?buildOQ(hw,hh):null;
 visTiles(hw*26,(x,y)=>{const i=y*W+x,t=S.tiles[i],o=S.b[i];
  if(!hz&&WALLAT){const wp=WALLAT.get(i);if(wp)for(const it of wp)drawWallItem(it,hw,hh)}
  if(TB){const ag=TB.get(i);if(ag)for(const a of ag)drawAgent(a,hw,hh)}
  if(OQ){const q=OQ.get(i);if(q)for(const f of q)f()}
  const cx=VX(x,y)*hw+cam.x,cy=VY(x,y)*hh+cam.y+hh;
  if(!o){if(tz)return;if(t===MOUNT)mountain(cx,cy,hw,hh,z,hs(i));else if(t===FOREST)forestTile(i,cx,cy,hw,hh,z);else if(DECO[i]===ALLEE)alleeTrees(i,cx,cy,hw,hh,z);return}
  if(o.t==='road')return;if(hz&&o.h)return;
  const f=B[o.t].foot||1;if(f>1){const ft=FT(o,f);if(x!==ft[0]||y!==ft[1])return}
  if(t===MOUNT&&f===1)mountain(cx,cy,hw,hh,z,hs(i));
  const[ox,oy]=f>1?scr(o.x+(f-1)/2,o.y+(f-1)/2):[cx,cy],ds=B[o.t].ds||1;
  if(ox<-hw*f*2||ox>vw+hw*f*2||oy<-hh*f*2||oy>vh+300*z*ds)return;
  if(o===sel){ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox,oy-hh*f);ctx.lineTo(ox+hw*f,oy);ctx.lineTo(ox,oy+hh*f);ctx.lineTo(ox-hw*f,oy);ctx.closePath();ctx.stroke()}
  if(z>=.18&&o.t!=='road')shadowOf(o,ox,oy,hw,hh);
  if(useSprite(o)&&z<.85){const zb=ZBF,sp=getSprite(o,zb);if(sp){const sc=Z/zb;ctx.drawImage(sp.c,ox-sp.left*sc,oy-sp.up*sc,sp.w*sc,sp.h*sc);
   if(NF>.01&&!L.zones)for(const g of sp.glow){const q=g[0].slice();for(let k=0;k<q.length;k+=2){q[k]=ox+q[k]*sc;q[k+1]=oy+q[k+1]*sc}GLOW.push([q,g[1]])}return}}
  drawB(o,ox,oy,z*ds,hw*ds,hh*ds,now)});
 if(hover&&mode&&inb(hover.x,hover.y)){const o=S.b[hover.y*W+hover.x];
  const[gx,gy]=mode==='demolish'||!B[mode]?[hover.x,hover.y]:orig(mode,hover.x,hover.y);
  const ok=mode==='demolish'?!!o&&!o.r&&(!o.h||o.t==='bastion'):!canPlace(mode,gx,gy);const col=mode==='demolish'?'rgba(220,70,50,.45)':ok?'rgba(90,210,120,.5)':'rgba(220,70,50,.45)';
  const bp=mode==='bridge'?bridgePlan(gx,gy):null,tl=bp&&bp.run?[...bp.run,bp.a,bp.end].map(i=>[i%W,i/W|0]):null;
  for(const[fx,fy]of tl||(mode==='demolish'||!B[mode]?[[gx,gy]]:footTiles(mode,gx,gy))){if(!inb(fx,fy))continue;const[sx,sy]=scr(fx,fy);dia(sx,sy,hw,hh,col)}}
 if(L.y1857){{drawPlumes();drawClouds()}drawShips(hw,hh);for(const s_ of IMMS)drawLiner(s_);drawRail();drawInvasion();drawBBridges();drawAirships();for(const o of S.list){const d=B[o.t];const need=d&&(d.in||d.burns);if(!need||o.h||o.bld||S.stock[need]>=1)continue;const[x,y]=scr(o.x+1.5,o.y+1.5);if(x<-20||x>vw+20||y<-40||y>vh+20)continue;badge(x,y-30*Z,Z,'#c0392b',ICON[need])}}
 for(const k of (L.y1857?[]:S.carts)){const j=Math.min(Math.floor(k.s),k.path.length-2),f=k.s-j,a=k.path[j],b=k.path[j+1];
  const[cx,cy]=scr((a%W)*(1-f)+(b%W)*f,(a/W|0)*(1-f)+(b/W|0)*f);if(cx<-20||cx>vw+20||cy<-20||cy>vh+20)continue;
  const cz=Math.max(z,.35);box(cx,cy-2*cz,5*cz,4*cz,'#7a5532','#9c7448',0,true);ctx.beginPath();ctx.arc(cx-3*cz,cy+1*cz,1.6*cz,0,7);ctx.arc(cx+3*cz,cy+1*cz,1.6*cz,0,7);ctx.fillStyle='#2b1d12';ctx.fill();
  ctx.font=`${9*cz}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ICON[k.g],cx,cy-10*cz)}
 for(const sh of S.ships){const p=shipPos(sh),[cx,cy]=scr(p.x,p.y);tradeShip(cx,cy,z,now,cargoN(sh),sh===sel)}
 if(S.pir){const p=pirPos(),[cx,cy]=scr(p.x,p.y);ship(cx,cy,z,now,S.pir.hp)}
 const nf=NF;if(nf>.01){ctx.fillStyle=`rgba(10,20,55,${nf})`;ctx.fillRect(0,0,vw,vh);
  if(!L.zones)for(const g of GLOW)poly(g[0],`rgba(255,${g[1]},110,${Math.min(1,.2+nf*2.2)})`)}
 fx=fx.filter(f=>now-f.t<350);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${Math.max(11,12*Math.max(z,.6))}px system-ui`;
 floats=floats.filter(f=>now-f.t<1600);
 for(const f of floats){const k=(now-f.t)/1600,[cx,c0]=scr(f.x,f.y),cy=c0-46*Math.max(z,.4)-k*24;
  ctx.globalAlpha=1-k;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillText(f.txt,cx+1,cy+1);ctx.fillStyle='#fff';ctx.fillText(f.txt,cx,cy);ctx.globalAlpha=1}
}

/* ---------- building rules ---------- */
const BSPAN={gold:60,stone:3,wood:2};
function bridgePlan(x,y){if(!inb(x,y))return{err:'Outside the map'};const W_=i=>S.tiles[i]===WATER,i0=y*W+x;let best=null;
 const tryRun=(sx,sy,dx,dy)=>{const run=[];let cx=sx,cy=sy;while(inb(cx,cy)&&W_(cy*W+cx)&&run.length<20){run.push(cy*W+cx);cx+=dx;cy+=dy}
  if(!run.length||!inb(cx,cy)||W_(cy*W+cx))return null;const e=cy*W+cx;if(S.tiles[e]===BRIDGE)return null;return{run,end:e}};
 if(W_(i0)){for(const[dx,dy]of[[1,0],[0,1]]){let ax=x,ay=y;while(inb(ax-dx,ay-dy)&&W_((ay-dy)*W+ax-dx))ax-=dx,ay-=dy;if(!inb(ax-dx,ay-dy))continue;const st=(ay-dy)*W+ax-dx;if(S.tiles[st]===BRIDGE)continue;
   const r=tryRun(ax,ay,dx,dy);if(r&&(!best||r.run.length<best.run.length))best={run:r.run,a:st,end:r.end}}}
 else{if(S.tiles[i0]===BRIDGE)return{err:'There is already a bridge here'};for(const[dx,dy]of D4){if(!inb(x+dx,y+dy)||!W_((y+dy)*W+x+dx))continue;const r=tryRun(x+dx,y+dy,dx,dy);if(r&&(!best||r.run.length<best.run.length))best={run:r.run,a:i0,end:r.end}}}
 if(!best)return{err:W_(i0)||D4.some(([dx,dy])=>inb(x+dx,y+dy)&&W_((y+dy)*W+x+dx))?'Too wide to bridge here, or no bank on the other side':'Tap a riverbank or the water'};
 if(best.run.length>18)return{err:'Too wide to bridge here'};
 for(const e of[best.a,best.end]){const o=S.b[e];if(o&&o.t!=='road')return{err:'A building is in the way on the bank'};if(!area[e]&&!canUse('road',e))return{err:L.zones?'That bank lies outside the city limits':'Not your land'}}
 const n=best.run.length,cost={};for(const k in BSPAN)cost[k]=BSPAN[k]*n;for(const k in cost)if(S.stock[k]<cost[k])return Object.assign(best,{err:`Not enough ${k==='gold'?'money':k}: this bridge needs ${costStr(cost)}`,cost});
 return Object.assign(best,{cost})}
function buildBridge(x,y){const p=bridgePlan(x,y);if(p.err){toast(p.err);return false}
 for(const k in p.cost)S.stock[k]-=p.cost[k];for(const i of p.run){S.tiles[i]=BRIDGE;tcolSet(i)}const ends=[];
 for(const e of[p.a,p.end])if(!S.b[e]&&S.tiles[e]!==WATER)ends.push(place('road',e%W,e/W|0,0,true));pushUndo({k:'bridge',tiles:p.run.slice(),ends,cost:Object.assign({},p.cost)});
 GV++;recompute();sfx('build');float(p.end%W,p.end/W|0,`🌉 ${p.run.length} spans`);toast(`Bridge built: ${costStr(p.cost)}`);return true}
/* a street on a slant, between two tiles that touch only at a corner, runs across the corner of the tiles beside it */
function diagCut(x,y){for(const[dx,dy]of[[1,1],[1,-1],[-1,1],[-1,-1]]){if(!inb(x+dx,y)||!inb(x,y+dy))continue;const a=y*W+x+dx,b=(y+dy)*W+x;if(isRd(a)&&isRd(b)&&roadNb(a).includes(b))return true}return false}
function canPlace(t,x,y){if(t==='bridge'){const p=bridgePlan(x,y);return p.err||''}
 const d=B[t];if(!d)return'?';if(d.hist)return'This is a historic building';
 if(!L.zones&&(d.foot||1)===1){
  if(!inb(x,y))return'Outside the map';const i=y*W+x,tl=S.tiles[i];if(S.b[i])return'Something is already built here';if(tl===WATER)return"You can't build on water";if(tl===BRIDGE)return'Bridges already work as roads';
  if(!area[i])return'Outside your land: build a warehouse or market nearby';for(const k in d.cost)if(S.stock[k]<d.cost[k])return shortBy(k,d.cost[k]);return''}
 if(d.lm){const e=lmEntry(t);if(!e)return'Not available in this city';if(cnt(t))return`You've already built the ${d.n}`;if(!lmNeedOK(e))return`Unlocks ${lmNeedTxt(e)}`}
 const ft=footTiles(t,x,y),f=d.foot||1;let mt=0,gr=0,coastOk=false,clay=false;
 for(const[fx,fy]of ft){if(!inb(fx,fy))return'Too close to the edge';const j=fy*W+fx,tt=S.tiles[j];
  if(S.b[j])return f>1?`Needs a free ${f}×${f} area`:'Something is already built here';
  if(tt===WATER)return"You can't build on water";if(tt===BRIDGE)return'Bridges already work as roads';
  if(RAILM[j])return'The railway runs here';if(t!=='road'&&!d.tool&&diagCut(fx,fy))return'A street runs across this corner';if(t!=='road'&&!d.tool&&(sbRes(j)||t==='bahnhof'&&L.sb&&SBRES&&SBRES[j]))return'🚆 The Stadtbahn will run here (the law of 1892)';if(fert[j]&32)return'This is a park';{const sc_=window.sceneryOn&&window.sceneryOn(fx,fy);if(sc_&&!(d.lm&&window.parkOnly&&window.parkOnly(fx,fy)))return`${sc_[0].replace(/^\S+\s/,'')} stands here`}if(fert[j]&8)return'Flood plain: the rivers floods here';
  if(QUAY&&QUAY[j]<.6&&t!=='road'&&!d.tool&&d.on!=='coast')return'Too close to the river: leave its bank free';
  if(L.y1857&&t!=='road'&&t!=='bridge'&&nearRing(j))return NYC()?'Leave Fifth Avenue and its avenues free':'Leave the Ringstraße free';
  if(!canUse(t,j))return L.zones?(S.limit<1?'Outside the city limits until 1892':S.limit<2?(NYC()?'Across the rivers: part of New York from 1904':'Across the Danube: part of Vienna from 1904'):'Outside the city'):'Outside your land: build a warehouse or market nearby';
  if(tt===MOUNT)mt++;if(tt===GRASS)gr++;if(coast(fx,fy))coastOk=true;if(fert[j]&4)clay=true}
 if(t==='bahnhof'&&!stationSide(x,y).ok)return'🚉 Keep the track side clear: the side away from the street';
 const n=ft.length,on=t==='kontor'&&!L.sea?'land':d.on;
 if(on==='mount'){if(mt<n/2)return t==='quarry'?'Quarries need the rocky hills of the Wienerwald':'Ore mines need a hillside'}else if(mt>0)return'Too steep here';
 if(on==='coast'&&!coastOk&&!(t==='brick'&&clay))return t==='brick'?'Needs a riverbank or a clay pit':'Must be built on the riverbank';
 if(on==='grass'&&gr<n*.75)return'Needs open grassland';
 if(L.y1857&&t!=='road'&&!d.tool){for(const[fx,fy]of footTiles(t,x,y))if(inb(fx,fy)&&RAILM[fy*W+fx])return'A railway track is in the way'}
 if(t==='gaswerk'&&!RES().auer)return'Research the gas mantle first (🔬 Research)';
 if(t==='tower'&&!RES().kaplan)return'Research elevators and steel frames first (🔬 Research)';
 if(t==='kraftwerk'&&!RES().electric)return'Research electric power first (🔬 Research)';
 if(t==='autofabrik'&&!RES().lohner)return'Research the motor car first (🔬 Research)';
 if(on==='clay'&&!clay)return NYC()?'Needs clay: build on the clay banks of Greenpoint or Williamsburg':'Needs clay: build in the clay pits of the Wienerberg or the Laaer Berg';
 if(on==='vine'&&count(x+((f-1)>>1),y+((f-1)>>1),f+2,i=>DECO[i]===VINE)<3)return'Vineyards need the sunny slopes of Grinzing and Nussdorf';
 if(on==='rail'){let ok=false;for(const[fx,fy]of ft){for(const[dx,dy]of[[0,0],...D4])if(inb(fx+dx,fy+dy)&&RAILM[(fy+dy)*W+fx+dx])ok=true}if(!ok)for(const[a,b]of perim({t,x,y}))if(inb(a,b)&&RAILM[b*W+a])ok=true;if(!ok)return'Must stand beside a railway line'}
 if(t==='palais'&&ringDistT(x+f/2,y+f/2)>6)return NYC()?'Fifth Avenue lots must face Fifth Avenue':'Palais plots must face the Ringstraße';
 const[cx,cy]=[x+((f-1)>>1),y+((f-1)>>1)];if(!canFarm(t,cy*W+cx))return`${cap1(d.crop)} won't grow here`;
 if(t!=='road')for(const k in d.cost)if(S.stock[k]<d.cost[k])return shortBy(k,d.cost[k]);
 return'';
}
/* "Not enough bricks: 8 needed, 0 in store", money as money; the words before the colon are what the shortage tools read */
function shortBy(k,need){const h=Math.floor(S.stock[k]||0);return k==='gold'?`Not enough money: it costs ${money(need,1)}, you have ${money(h,1)}`:`Not enough ${k}: ${need} needed, ${h} in store`}
const newIsle=i=>L.sea&&!S.list.some(o=>!o.r&&B[o.t].hub&&comp[o.y*W+o.x]===comp[i]);
function tryBuild(x,y,quiet){if(mode==='kraftwerk'&&!cnt('coalyard')&&!quiet)setTimeout(()=>toast('⚫ Power stations burn coal. Build a coal yard too (Industry)'),600);if(mode==='chapel'&&S.churchSale>S.t&&!B.chapel._half){B.chapel._full=Object.assign({},B.chapel.cost);for(const k in B.chapel.cost)B.chapel.cost[k]=Math.ceil(B.chapel.cost[k]/2);B.chapel._half=1}else if(B.chapel._half&&!(S.churchSale>S.t)){B.chapel.cost=B.chapel._full;B.chapel._half=0}if(mode==='bridge')return buildBridge(x,y);const e=canPlace(mode,x,y);if(e){if(!(quiet&&e.startsWith('Something')))toast(e);return false}
 const d=B[mode];for(const k in d.cost)S.stock[k]-=d.cost[k];sfx('build');
 if(mode==='kontor'&&newIsle(y*W+x)){S.sites.push({x,y});toast('Your ship will sail the warehouse there');setMode(null);return true}
 {const o=place(mode,x,y);if(L.y1857)afterPlace(o,mode);pushUndo({k:'obj',o,cost:Object.assign({},d.cost),plot:o.plotV||0})}
 if(!canAfford(mode)){const m=Object.keys(d.cost).find(k=>S.stock[k]<d.cost[k]);toast(m?`Not enough ${m==='gold'?'money':m} for another ${d.n.toLowerCase()}`:`Out of materials for another ${d.n.toLowerCase()}`);setMode(null)}return true}
function canAfford(t){if(DEV||t==='road')return true;const c=B[t].cost;for(const k in c)if(S.stock[k]<c[k])return false;return true}
function demolish(o){if(o.r){toast(`That belongs to the ${L.rival.n}`);return}
 if(o.h){if(o.t==='bastion'){tearWall(o);return}toast('Part of the historic city');return}
 if(o.t==='kontor'&&cnt('kontor')===1){toast('You need at least one warehouse');return}
 for(const[fx,fy]of footTiles(o.t,o.x,o.y))S.b[fy*W+fx]=null;S.list.splice(S.list.indexOf(o),1);S.stock.wood+=Math.floor((B[o.t].cost.wood||0)/2);
 recompute();if(sel===o)closeInfo()}

/* ---------- input ---------- */
const ptrs=new Map();let drag=null,pinch=null,pend=null;
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*(vw/(r.width||vw)),(e.clientY-r.top)*(vh/(r.height||vh))]}
function startPinch(){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:Z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2}}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const[ox,oy]=pos(e);ptrs.set(e.pointerId,{x:ox,y:oy});
 if(ptrs.size===1){drag={sx:ox,sy:oy,lx:ox,ly:oy,moved:false};
  }
 else if(ptrs.size===2){if(drag)drag.moved=true;startPinch()}});
cv.addEventListener('pointermove',e=>{const[ox,oy]=pos(e);
 if(e.pointerType==='mouse')hover=pick(ox,oy);
 const p=ptrs.get(e.pointerId);if(!p)return;p.x=ox;p.y=oy;
 if(ptrs.size===2&&pinch){const[a,b]=[...ptrs.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  zoomAt(mx,my,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d);cam.x+=mx-pinch.mx;cam.y+=my-pinch.my;pinch.mx=mx;pinch.my=my;return}
 if(drag&&drag.paint){const t=pick(ox,oy);hover=t;let dx=t.x-drag.sx,dy=t.y-drag.sy,ax=Math.abs(dx),ay=Math.abs(dy);if(ax+ay>=1){drag.painted=true;RA=-1;RPV=null;
  let sx_=Math.sign(dx),sy_=Math.sign(dy),n;if(ax>2*ay){sy_=0;n=ax}else if(ay>2*ax){sx_=0;n=ay}else n=Math.round((ax+ay)/2);const ln=[];for(let i=0;i<=n;i++){const x=drag.sx+sx_*i,y=drag.sy+sy_*i;if(inb(x,y))ln.push(y*W+x)}SLINE=ln}return}
 if(drag){if(Math.hypot(ox-drag.sx,oy-drag.sy)>8)drag.moved=true;
  if(drag.moved){cam.x+=ox-drag.lx;cam.y+=oy-drag.ly}drag.lx=ox;drag.ly=oy}});
function up(e){const had=ptrs.has(e.pointerId);ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;
 if(ptrs.size===0){if(had&&drag&&drag.paint&&drag.painted&&SLINE){buildLine(SLINE);SLINE=null}
  else if(had&&drag&&drag.paint&&!drag.painted&&e.type==='pointerup'){const[ox,oy]=pos(e);roadClick(pick(ox,oy),e.pointerType)}
  else if(had&&drag&&!drag.moved&&!drag.paint&&e.type==='pointerup'){const[ox,oy]=pos(e);tap(ox,oy,e.pointerType)}drag=null}
 else if(ptrs.size===1){const[p]=[...ptrs.values()];drag={sx:p.x,sy:p.y,lx:p.x,ly:p.y,moved:true}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hover=null});
cv.addEventListener('wheel',e=>{e.preventDefault();const[ox,oy]=pos(e);zoomAt(ox,oy,Z*Math.exp(-e.deltaY*.0015))},{passive:false});
window.addEventListener('keydown',e=>{const m={ArrowLeft:[1,0],a:[1,0],ArrowRight:[-1,0],d:[-1,0],ArrowUp:[0,1],w:[0,1],ArrowDown:[0,-1],s:[0,-1]}[e.key];
 if(m&&$('#ov').hidden){cam.x+=m[0]*40;cam.y+=m[1]*40}if(e.key==='Escape')setMode(null)});
const SPH={bastion:5,kontor:34,monument:80,tower:34,market:16,tobacco:12,spice:12,sheep:14,mine:22};
function spriteH(o){return spriteH0(o)*(B[o.t].ds||1)}
function spriteH0(o){if(o.t==='house')return L.style==='wien1900'?[0,12,15,15,19,23,23][o.lvl]:[0,20,28,38,50][o.lvl];if(B[o.t].lm)return 72;return SPH[o.t]||28}
function pickBuilding(px,py){const hw=TW/2*Z,hh=TH/2*Z;let best=null,bd=-1;
 for(const o of S.list){if(o.t==='road')continue;const f=B[o.t].foot||1,[cx,cy]=f>1?scr(o.x+.5,o.y+.5):scr(o.x,o.y),w=hw*.62*f+5;
  if(px>cx-w&&px<cx+w&&py>cy-spriteH(o)*Z-4&&py<cy+hh*.75*f){const dp=o.x+o.y+(f-1)*2;if(dp>bd){bd=dp;best=o}}}return best}
const coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
function tap(px,py,pt){if(!S)return;if(mode==='road'){roadClick(pick(px,py),pt);return}if(mode==='rail'||mode==='tramline'){lineClick(mode,pick(px,py),pt);return}if(mode==='elight'){lightClick(pick(px,py),pt);return}
 if(!mode)for(const sh of S.ships){const p=shipPos(sh),[cx,cy]=scr(p.x,p.y);if(Math.hypot(px-cx,py-(cy-12*Z))<24*Z){openInfo(sh);return}}
 const t=pick(px,py);
 if(mode==='demolish'||!mode){let o=pickBuilding(px,py)||(inb(t.x,t.y)?S.b[t.y*W+t.x]:null);if(o&&o.h&&o.t==='road'&&!mode)o=null;
  if(!mode){if(o)openInfo(o);else{const sc_=window.sceneryAt&&inb(t.x,t.y)?window.sceneryAt(t.x,t.y):null;closeInfo();if(sc_)evOv(sc_[0],sc_[1])}return}
  if(!o){if(mode==='demolish'&&inb(t.x,t.y)&&S.tiles[t.y*W+t.x]===FOREST)clearForest(t);return}const k=o.x+','+o.y;if((pt==='touch'||pt==='pen')&&pend!==k){pend=k;hover={x:o.x,y:o.y};toast(`Tap again to remove the ${B[o.t].n.toLowerCase()}`);return}
  pend=null;demolish(o);return}
 if(!inb(t.x,t.y))return;hover=t;
 let[gx,gy]=orig(mode,t.x,t.y);
 if(pt==='touch'||pt==='pen'){let k=gx+','+gy;if(pend&&pend!==k&&!pend.startsWith('r')){const[px_,py_]=pend.split(',').map(Number),f=B[mode]?B[mode].foot||1:1;if(t.x>=px_-1&&t.x<=px_+f&&t.y>=py_-1&&t.y<=py_+f){k=pend;[gx,gy]=[px_,py_]}}
  if(pend!==k){const nv=nearValid(mode,gx,gy,3);if(nv)[gx,gy]=nv;k=gx+','+gy;pend=k;hover={x:gx+((B[mode]&&B[mode].foot||1)-1>>1),y:gy+((B[mode]&&B[mode].foot||1)-1>>1)};confShow('build');const e=canPlace(mode,gx,gy);if(e)toast(e);return}pend=null;confHide()}
 userBuild(gx,gy)}

/* ---------- touch placement: a ghost you can nudge, and a big Build button ---------- */
let CONF=null,CFIND=false;
function nearValid(m,gx,gy,r){if(!canPlace(m,gx,gy))return[gx,gy];for(let d=1;d<=r;d++)for(let dy=-d;dy<=d;dy++)for(let dx=-d;dx<=d;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==d)continue;if(!canPlace(m,gx+dx,gy+dy))return[gx+dx,gy+dy]}return null}
function confShow(kind){CONF=kind;const el=$('#conf');el.hidden=false;CFK='';confArrows();$('#mode').style.visibility='hidden';confUpdate()}
/* the nudge arrows follow the camera: each button takes the map direction closest to its corner, and its arrow turns to point exactly where that step moves the building on screen */
const CFD=[[1,0],[0,1],[-1,0],[0,-1]],CFA=[45,135,225,315];let CFK='',CFV=null;
function confArrows(){const g=window.__G3,bs=document.querySelectorAll('#conf [data-mv]');if(!g||!g.camera||!g.E||bs.length!==4)return;const cm=g.camera,E=g.E,v=CFV||(CFV=cm.position.clone()),h=hover||{x:W/2,y:H/2};
 v.set(E(h.x),0,E(h.y)).project(cm);const cx=v.x*cm.aspect,cy=v.y;const ang=d=>{v.set(E(h.x+d[0]),0,E(h.y+d[1])).project(cm);return(Math.atan2(v.x*cm.aspect-cx,v.y-cy)*180/Math.PI+360)%360};
 const a=CFD.map(ang),key=a.map(v=>Math.round(v/3)).join();if(key===CFK)return;CFK=key;let best=0,bs_=1e9;const od=CFD.map((d,i)=>i).sort((i,j)=>a[i]-a[j]);
 for(let sh=0;sh<4;sh++){let e=0;for(let k=0;k<4;k++){const v=Math.abs(a[od[(k+sh)%4]]-CFA[k])%360;e+=Math.min(v,360-v)}if(e<bs_){bs_=e;best=sh}}
 const pos=['↗','↘','↙','↖'];bs.forEach(b=>{const k=pos.indexOf(b.dataset.c||b.textContent);b.dataset.c=pos[k];const i=od[(k+best)%4];b.dataset.mv=CFD[i].join(',');b.innerHTML=`<i style="display:inline-block;font-style:normal;transform:rotate(${Math.round(a[i])}deg)">↑</i>`})}
function confHide(){CONF=null;const el=$('#conf');if(el)el.hidden=true;const m=$('#mode');if(m)m.style.visibility=''}
function confUpdate(){const el=$('#conf');if(!el||!CONF)return;let ok=false,label='';CFIND=false;
 if(CONF==='build'&&pend&&!pend.startsWith('r')&&!pend.startsWith('l')){const[gx,gy]=pend.split(',').map(Number),e=canPlace(mode,gx,gy);ok=!e;label=ok?`✓ Build|${B[mode].n}`:e;
  /* refused for where it stands (no clay, not on the waterfront, the river bank...): the button then takes the player to a spot where it can */
  CFIND=!ok&&!B[mode].lm&&!/Not enough|Research|cost|gold|money|fl\.|\$/i.test(e);if(CFIND)label='📍 Show me where|'+e}
 else if(CONF==='road'&&RA>=0&&RE>=0){const p_=roadPlan(RA,RE);RPV=p_?{key:RA+'>'+RE,p:p_}:null;ok=!!p_;label=p_?`✓ Build road|${p_.n} tile${p_.n===1?'':'s'} · ${money(p_.cost)}`:'No route to there'}
 else if(CONF==='line'&&LA>=0&&LE>=0){const p_=linePlan(mode,LA,LE);LPV=p_?{key:LA+'>'+LE,p:p_}:null;ok=!!p_;label=p_?`✓ Build|${p_.n} tiles · ${costStr(p_.cost)}`:'No route to there'}
 /* the button in two lines: what is done large, what it takes or why not smaller beneath ("✓ Build road" / "2 tiles · 10 fl.") */
 /* a reason with its numbers ("Not enough bricks: 10 needed, 0 in store") breaks at its colon */
 if(!String(label).includes('|')&&/^[^:]{4,40}: /.test(label))label=String(label).replace(': ','|');
 const b=$('#confOk'),[l1,l2]=String(label).split('|'),esc=t=>t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));b.innerHTML=l2?`<b>${esc(l1)}</b><small>${esc(l2)}</small>`:`<b>${esc(l1)}</b>`;b.classList.toggle('one',!l2);b.disabled=!ok&&!CFIND}
function confMove(dx,dy){if(CONF==='build'&&pend){let[gx,gy]=pend.split(',').map(Number);gx+=dx;gy+=dy;if(!inb(gx,gy))return;pend=gx+','+gy;const f=B[mode].foot||1;hover={x:gx+((f-1)>>1),y:gy+((f-1)>>1)}}
 else if(CONF==='road'&&RE>=0){const x=RE%W+dx,y=(RE/W|0)+dy;if(!inb(x,y))return;RE=y*W+x;hover={x,y}}
 else if(CONF==='line'&&LE>=0){const x=LE%W+dx,y=(LE/W|0)+dy;if(!inb(x,y))return;LE=y*W+x;hover={x,y}}confUpdate()}
function confOk(){if(CONF==='build'&&CFIND){CFIND=false;findSpot();return}
 if(CONF==='build'&&pend){const[gx,gy]=pend.split(',').map(Number);pend=null;confHide();userBuild(gx,gy)}
 else if(CONF==='road'&&RA>=0&&RE>=0){const p_=roadPlan(RA,RE);if(p_&&ROADQ&&buildPlan(p_)){const q=ROADQ;backTo(ROADB);LASTACT=performance.now();
  /* the road is in the network at once (buildPlan recomputes it): should the building still not be reached, say so and offer the next way */
  if(S.list.includes(q)&&needsRoad(q)&&!q.c){toast(`🛤️ That road doesn't reach your ${B[q.t].n.toLowerCase()} yet`);setTimeout(()=>{if(S.list.includes(q)&&!q.c)roadOffer(q,ROADB)},1600)}else toast(`🛤️ Road built: ${money(p_.cost)}`)}
  else if(p_&&buildPlan(p_)){RA=RE;RE=-1;RPV=null;confHide();toast(`Road built: ${fullStop(money(p_.cost))} Tap the next point to continue`)}}
 else if(CONF==='line'&&LA>=0&&LE>=0){const p_=linePlan(mode,LA,LE);if(p_&&buildLinePlan(mode,p_)){LA=LE;LE=-1;LPV=null;confHide();toast('Built. Tap the next point to continue')}}}
/* ✕ on the pad leaves the tool altogether: no card is left behind to close a second time */
/* back to the building's tool after its road: still without Find a spot, just built */
function backTo(m){setMode(m);const mf=$('#modeFind');if(m&&mf)mf.hidden=true}
function confNo(){if(ROADQ){backTo(ROADB);return}pend=null;if(CONF==='road'){RA=-1;RE=-1;RPV=null}if(CONF==='line'){LA=-1;LE=-1;LPV=null}confHide();setMode(null)}
let RE=-1,LE=-1;
/* the tool stays open after a building is placed, for the next of the same by a tap on the map, without Find a spot (a landmark, a
   bridge or a trading post closes it); ✕ closes it. A building with no road first gets the shortest road to a street as a ready
   preview, and once that road is built or turned down the tool comes back */
let LASTB=null,ROADQ=null,ROADB=null,LASTACT=performance.now();
function userBuild(gx,gy){const m=mode;if(!tryBuild(gx,gy))return false;LASTACT=BUILT=performance.now();const o=S.list[S.list.length-1];
 if(o&&(o.t===m||m==='palais'))deed(o);
 if(o&&B[o.t]&&B[o.t].lm&&L.y1857&&!NYC())o.fy=lmFace(o);
 LASTB=B[m]&&!B[m].lm&&m!=='bridge'&&m!=='kontor'?m:null;if(mode&&mode!==LASTB)setMode(null);else{pend=null;confHide();const mf=$('#modeFind');if(mf)mf.hidden=true;
  /* the tool stays in the hand. The long note of what the building is has done its work: a short line says that it stands and that
     one more can be put down, and on a phone no plot is left lying on the new building */
  if(B[m]&&m!=='road'&&m!=='tramline'&&m!=='elight'){moreUI();if(coarse)hover=null}}againUI();
 if(o&&lonely(o))setTimeout(()=>{if(S&&(!mode||mode===LASTB&&!pend)&&S.list.includes(o)&&lonely(o))roadOffer(o,mode)},350);return true}
/* a landmark the player places in Vienna keeps the way it faced when placed: to the side with the most street, or with none yet
   toward the Stephansdom, the city's centre. A road laid later does not turn it (o.fy: 1 south, 2 east, 3 north, 4 west) */
function lmFace(o){const f=B[o.t].foot||1,isR=(x,y)=>inb(x,y)&&(S.tiles[y*W+x]===BRIDGE||!!S.b[y*W+x]&&S.b[y*W+x].t==='road');
 const sides=[[1,k=>[o.x+k,o.y+f]],[2,k=>[o.x+f,o.y+k]],[3,k=>[o.x+k,o.y-1]],[4,k=>[o.x-1,o.y+k]]],N=[0,0,0,0,0];let best=0,bn=0;
 for(const[s,fn]of sides){let n=0;for(let k=0;k<f;k++){const[a,b]=fn(k);if(isR(a,b))n++}N[s]=n;if(n>bn){bn=n;best=s}}
 /* a corner house turns its cut corner to the crossing: a street in front of it and one on its right */
 if(B[o.t].corner){let cs=0,cn=0;for(let s=1;s<5;s++){const m=Math.min(N[s],N[s%4+1]);if(m>cn){cn=m;cs=s}}if(cs)return cs}
 if(best)return best;
 const c=S.list.find(q=>q.t==='stephan'&&q!==o);if(!c)return 1;const dx=c.x+2-(o.x+f/2),dy=c.y+2-(o.y+f/2);return Math.abs(dx)>Math.abs(dy)?(dx>0?2:4):(dy>0?1:3)}
/* while the tool stays in the hand after a build, the line above the bottom bar says what the next tap builds and what it costs, in red
   when the stores cannot pay for it, with Done to put the tool down; the Build button shows the building with a small plus (buildBtnUI).
   moreUI draws the line (updateUI calls it too, so the red follows the stores) */
const moreOK=m=>!!B[m]&&m===LASTB&&m!=='road'&&m!=='tramline'&&m!=='elight';let MORESIG='';
function moreUI(){const m=mode;if(!moreOK(m)){MORESIG='';return}const c=B[m].cost||{},k=DEV?null:Object.keys(c).find(k=>(S.stock[k]||0)<c[k]),sig=m+'|'+(k||'');if(sig===MORESIG)return;MORESIG=sig;
 $('#modeTxt').innerHTML=`<b>✅ ${B[m].i} ${B[m].n} built.</b>${Object.keys(c).length?` One more costs ${costStr(c)}`:''}${k?`<span class="again no2">Not enough ${k==='gold'?'money':k} for one more.</span>`:`<span class="again">👆 ${coarse?'Tap':'Click'} the map to build one more</span>`}`;
 $('#mode').classList.toggle('more',true);$('#modeDone').textContent='Done';$('#modeDone').setAttribute('aria-label','Done')}
function buildBtnUI(){const t=$('#buildBtn');if(!t)return;const v=$('#bar').classList.contains('open'),m=mode;
 t.innerHTML=v?'<i>✕</i><span>Close</span>':B[m]&&m!=='road'&&m!=='tramline'&&m!=='elight'?`<i class="bbm">${B[m].i}<b>＋</b></i><span>${B[m].n}</span>`:'<i>🔨</i><span>Build</span>'}
/* the build-again chip is not shown: it read as a stray button under the build cards */
function againUI(){const b=$('#againBtn');if(!b)return;b.hidden=true;if(LASTB){b.textContent=`＋ ${B[LASTB].i}`;b.setAttribute('aria-label',`Build another ${B[LASTB].n.toLowerCase()}`);b.title=`Build another ${B[LASTB].n.toLowerCase()}`}}
$('#againBtn').onclick=()=>{if(!S||!LASTB)return;barOpen(false);setMode(LASTB);findSpot()};
function roadRoute(o){const src=new Int32Array(W*H).fill(-1),q=[];for(const[x,y]of perim(o)){if(!inb(x,y))continue;const i=y*W+x;if(src[i]<0&&roadPas(i)&&!S.b[i]){src[i]=i;q.push(i)}}
 for(let h=0,tries=0;h<q.length&&h<90000;h++){const k=q[h];if(dist[k]>=0&&src[k]!==k){if(roadPlan(src[k],k))return[src[k],k];if(++tries>12)return null;continue}const x=k%W,y=k/W|0;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const n=ny*W+nx;if(src[n]<0&&roadPas(n)){src[n]=src[k];q.push(n)}}}return null}
function roadOffer(o,back){closeInfo();const r=roadRoute(o);if(!r){setMode('road');toast(`🛤️ No road reaches your ${B[o.t].n.toLowerCase()} yet. Tap a start, then an end`);return}
 setMode('road');RA=r[0];RE=r[1];ROADQ=o;ROADB=back||null;hover={x:RE%W,y:RE/W|0};confShow('road');toast(`🛤️ No road reaches your ${B[o.t].n.toLowerCase()} yet. Tap ✓ for the shortest one`)}

/* ---------- building higher: the player decides when homes grow upwards ---------- */
const NYC=()=>L&&L.name==='New York';
const TIERS_NY=[{n:'Rowhouse',cap:1},{n:'Six-storey walk-up',cap:1.5,cost:{gold:300,bricks:8,wood:4}},
 {n:'Elevator apartment house',cap:2.2,cost:{gold:900,bricks:16,stone:8,iron:6},need:()=>Y0+S.t/YEAR>=1880,lock:'from 1880, when the first passenger elevators arrive'},
 {n:'Apartment skyscraper',cap:3.5,cost:{gold:2500,iron:25,stone:15,bricks:20},need:()=>!!RES().kaplan,lock:'after you research elevators and steel frames'}];
/* (a step's need may look at the home itself: the courtyard wing comes once Clerks live there)
   Vienna's houses grow in seven steps, each one seen in the street (vienna.js: a storey more, the courtyard wing, the Gründerzeit front,
   the Jugendstil front): saves from before the steps were seven are read across by tierMig */
const TIERS_VI=[{n:'Old house',cap:1},{n:'An extra storey',cap:1.3,cost:{gold:250,bricks:8,wood:4}},
 {n:'A courtyard wing',cap:1.6,cost:{gold:400,bricks:12,wood:6},yr:1867,need:o=>Y0+S.t/YEAR>=1867&&(!o||(o.lvl||1)>=2),lock:'once Craftsmen live here, from 1867'},
 {n:'Gründerzeit apartment block',cap:2,cost:{gold:700,bricks:16,stone:8},yr:1870,need:o=>Y0+S.t/YEAR>=1870&&(!o||(o.lvl||1)>=3),lock:'once Clerks live here, from 1870'},
 {n:'A fifth storey and a mezzanine',cap:2.4,cost:{gold:1000,bricks:18,stone:10},yr:1883,need:()=>Y0+S.t/YEAR>=1883,lock:'from 1883, under the new building code'},
 {n:'Modern block with lift',cap:2.8,cost:{gold:1800,bricks:20,stone:12,iron:10},need:o=>!!RES().electric&&(!o||(o.lvl||1)>=4),get lock(){return`once ${LV[4].n} live here and you have researched electric power`}},
 {n:'Secession apartment house',cap:3.2,cost:{gold:2600,bricks:24,stone:14,iron:12},yr:1898,need:()=>Y0+S.t/YEAR>=1898,lock:'from 1898, when Otto Wagner builds on the Wienzeile'}];
function tierMig(){if(!S)return;if(NYC()||S.tierV>=2){if(!NYC())S.tierV=2;return}const m=[0,1,3,5];
 for(const o of S.list)if(o.t==='house'&&!o.h&&o.tier)o.tier=m[o.tier]??o.tier;if(S.htiers)for(const k in S.htiers)S.htiers[k]=m[S.htiers[k]]??S.htiers[k];S.tierV=2;GV++}
const TIERS=()=>NYC()?TIERS_NY:TIERS_VI;
function maxPop(o){const T=o.t==='house'&&o.lvl<6?TIERS()[o.tier||0]:null;return Math.round(LV[o.lvl].max*(T?T.cap:1))}
function raiseHome(o){const nx=(o.tier||0)+1,T=TIERS()[nx];if(!T)return;if(T.need&&!T.need(o)){toast(`Possible ${T.lock}`);return}
 for(const g in T.cost)if((S.stock[g]||0)<T.cost[g]){toast(shortBy(g,T.cost[g]));return}for(const g in T.cost)S.stock[g]-=T.cost[g];
 if(!NYC())S.tierV=2;const before=maxPop(o);o.tier=nx;hEra(o);const delta=maxPop(o)-before;if(o.h){S.htiers=S.htiers||{};S.htiers[o.x+','+o.y]=nx;S.histRoom=(S.histRoom||0)+delta}
 GV++;recompute();sfx('build');setTimeout(()=>sfx('chime'),350);float(o.x+1,o.y+1,`🏗️ ${T.n}`);deed(o);toast(`🏗️ ${T.n}: room for about ${fmtPop(delta*(S.mult||1))} more people`);
 /* the card says so too, in a green band at its top for a few seconds, and the house is shown rising */
 OKUP={o,t:performance.now()+5000,t0:performance.now(),n:T.n,d:fmtPop(delta*(S.mult||1))};renderInfo()}
let OKUP=null;
/* a home that can be built higher now: the next level is open (and not waiting for the tutorial's end) and its cost is in store */
/* while the tutorial runs one home is built higher, once: after that every home waits for the tutorial's end */
const tgOneUp=()=>S.list.some(q=>q.t==='house'&&!q.h&&(q.tier||0)>=1);
/* any: whatever is in store (labels.js greys the ⬆ of a home that could go up but whose materials are short) */
function canRaise(o,any){if(o.t!=='house'||o.bld||o.r||o.h||o.lvl>=6)return false;const nx=TIERS()[(o.tier||0)+1];if(!nx||nx.need&&!nx.need(o))return false;
 /* in the tutorial the arrows wait for its step on building higher, and a home goes up one level only */
 if(typeof tgOn==='function'&&tgOn()&&((o.tier||0)>=1||tgOneUp()||typeof tgRaiseOk==='function'&&!tgRaiseOk()))return false;if(any)return true;for(const g in nx.cost)if((S.stock[g]||0)<nx.cost[g])return false;return true}
/* the homes that can be built higher now (one that can be paid for first), and about what their new residents pay each minute once
   they have moved in */
function raiseGain(){let n=0,g=0,first=null;const ts=TIERS(),f=(L.y1857?.55+.45*(S.hap??1):1)*TAXR[S.taxR||'normal'][0];
 for(const o of S.list){if(!canRaise(o,true))continue;n++;if(!first||canRaise(o)&&!canRaise(first))first=o;g+=(Math.round(LV[o.lvl].max*ts[(o.tier||0)+1].cap)-maxPop(o))*LV[o.lvl].tax*60*f}return{n,g,first}}
function tierButton(o,el){if(OKUP&&OKUP.o===o&&performance.now()<OKUP.t)el.insertAdjacentHTML('afterbegin',`<div class="okUp${performance.now()-OKUP.t0<700?' new':''}">✅ <b>${OKUP.n} built!</b><br>Room for about ${OKUP.d} more people.</div>`);
 if(o.t!=='house'||o.bld||o.lvl>=6)return;const ts=TIERS(),cur=ts[o.tier||0];let nx=ts[(o.tier||0)+1];
 if(!nx){el.insertAdjacentHTML('beforeend',`<p class="m">🏗️ ${cur.n}: as high as it gets.</p>`);return}
 /* while the tutorial runs the button waits for its step on building higher, and a home goes up one level only, so one thing is learnt at a time */
 const tgw=typeof tgOn==='function'&&tgOn()&&((o.tier||0)>=1||tgOneUp()||typeof tgRaiseOk==='function'&&!tgRaiseOk());if(tgw)nx={...nx,lock:(o.tier||0)>=1||tgOneUp()?'after the tutorial':'later in the tutorial'};const ok=!tgw&&(!nx.need||nx.need(o)),gain=Math.round((nx.cap/cur.cap-1)*100);
 el.insertAdjacentHTML('beforeend',cz(`<p class="m">🏗️ Now: <b>${cur.n}</b>. Build higher so more ${LV[o.lvl]?LV[o.lvl].n:'people'} can live on the same plot.</p><p><button id="tierBtn"${ok&&typeof tgRaiseOn==='function'&&tgRaiseOn()?' class="tgRing"':''} ${ok?'':'disabled'}>${ok?`<i class="upI${canRaise(o)?'':' dim'}">⬆</i>`:'🔒'} ${nx.n} (+${gain}% homes)${ok?`<br><span class="tbC">${costStr(nx.cost)}</span>`:` · ${nx.lock}`}</button></p>`));
 const b=el.querySelector('#tierBtn');if(b)b.onclick=()=>raiseHome(o)}
/* the home's card lists every row of the next stage, met or not, and offers the rise; with more homes ready, all of them at once */
function histRoomTick(dt){if(!(S.histRoom>0)||S.scratch)return;const m=Math.min(S.histRoom,Math.max(0,S.newc||0),1.5*dt);if(m>0){S.newc-=m;S.histRoom-=m;S.histU=(S.histU||0)+m}
 const g=Math.min(S.histRoom,.04*dt);S.histRoom-=g;S.histU=(S.histU||0)+g}

/* ===================== New York in detail: buildings, skyscrapers, people, waterfront ===================== */
const NYPAL={brick:['#9c4a32','#a85a3e','#8a3f2c','#b0644a','#7e3a2a'],brown:['#6b4535','#7a4e3c','#5e3b2e','#835a46'],cream:['#e3d8c0','#d9cdb1','#ece3cf','#cfc2a6'],lime:['#e9e2d2','#f1ebdd','#ddd4c0']};
function nyFace(x,y,ax,ay,t,t2){return{L:(s,h)=>{const u=-ax+2*ax*s,v=ay;return[x+(u-v)*t,y+(u+v)*t2-h]},R:(s,h)=>{const u=ax,v=ay-2*ay*s;return[x+(u-v)*t,y+(u+v)*t2-h]},nL:[-t,t2],nR:[t,t2]}}
function nyBand(F,face,h0,h1,col,out=0,s0=0,s1=1){const P=F[face],n=face==='L'?F.nL:F.nR,a=P(s0,h0),b=P(s1,h0),c=P(s1,h1),d=P(s0,h1),o=[n[0]*out,n[1]*out];poly([a[0]+o[0],a[1]+o[1],b[0]+o[0],b[1]+o[1],c[0]+o[0],c[1]+o[1],d[0]+o[0],d[1]+o[1]],col)}
function nyDecor(L_,x,y,h,t,t2,kind,r,fh){const F=nyFace(x,y,L_.ax,L_.ay,t,t2),gf=fh*1.15;
 // cornice: a projecting band, crisp light edge on top
 const cc=kind==='cast'||kind==='mansion'?'#f4efe3':kind==='brown'?'#4a3328':'#5a3a2a';
 for(const f of['L','R']){nyBand(F,f,h-.1*t,h+.02*t,cc,.06);nyBand(F,f,h+.02*t,h+.05*t,'rgba(255,255,255,.35)',.07)}
 // belt course above the ground floor
 for(const f of['L','R'])nyBand(F,f,gf,gf+.04*t,kind==='cast'?'#f7f3ea':'rgba(0,0,0,.18)',.02);
 // shopfronts and striped awnings
 if(kind!=='mansion'&&r()<.75){const cols=[['#2f5a3a','#e8dcc0'],['#7a2a22','#efe3c8'],['#2f4f6e','#efe3c8'],['#8a6a1e','#f4efe2'],['#5a2a4a','#efe3c8']];
  for(const f of['L','R']){const len=f==='L'?L_.ax:L_.ay,n=Math.max(1,Math.round(len*2.2)),P=F[f],nv=f==='L'?F.nL:F.nR;
   for(let i=0;i<n;i++){if(r()<.25)continue;const s0=(i+.12)/n,s1=(i+.88)/n,c=cols[(r()*cols.length)|0];
    nyBand(F,f,.05*t,gf*.78,'rgba(30,40,50,.55)',.0,s0,s1);
    const a=P(s0,gf*.92),b=P(s1,gf*.92),o=.16;const a2=[a[0]+nv[0]*o,a[1]+nv[1]*o+.12*t],b2=[b[0]+nv[0]*o,b[1]+nv[1]*o+.12*t];
    const lp=(p,q,u)=>[p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u],sh=P(s0,gf*.92-.3*t),sh2=P(s1,gf*.92-.3*t);poly([...a,...b,...sh2,...sh],'rgba(0,0,0,.16)');
    const k=4;for(let j=0;j<k;j++){const u0=j/k,u1=(j+1)/k,A1=lp(a,b,u0),A2=lp(a,b,u1),B1=lp(a2,b2,u0),B2=lp(a2,b2,u1),g=ctx.createLinearGradient(0,Math.min(A1[1],A2[1]),0,Math.max(B1[1],B2[1]));g.addColorStop(0,shade(c[j%2]==='#efe3c8'||c[j%2]==='#e8dcc0'||c[j%2]==='#f4efe2'?'#e8dcc0':c[j%2],1.1));g.addColorStop(1,shade(c[j%2]==='#efe3c8'||c[j%2]==='#e8dcc0'||c[j%2]==='#f4efe2'?'#e8dcc0':c[j%2],.85));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(...A1);ctx.lineTo(...A2);ctx.lineTo(...B2);ctx.lineTo(...B1);ctx.closePath();ctx.fill();
     const vh_=.08*t;poly([...B1,...B2,B2[0],B2[1]+vh_,B1[0],B1[1]+vh_],shade(c[j%2]==='#efe3c8'||c[j%2]==='#e8dcc0'||c[j%2]==='#f4efe2'?'#e8dcc0':c[j%2],.75))}
    ctx.fillStyle=shade(c[0],.7);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...a2);ctx.lineTo(a2[0],a2[1]+.08*t);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(...b2);ctx.lineTo(b2[0],b2[1]+.08*t);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(30,25,20,.35)';ctx.lineWidth=Math.max(.4,t*.012);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.moveTo(a2[0],a2[1]+.08*t);ctx.lineTo(b2[0],b2[1]+.08*t);ctx.stroke()}}}
 // stoops of the brownstones
 if(kind==='brown'){const P=F.L,n=Math.max(1,Math.round(L_.ax*2.4));for(let i=0;i<n;i++){const s=(i+.5)/n,a=P(s-.07,0),b=P(s+.07,0),o=[F.nL[0]*.3,F.nL[1]*.3],top=gf*.55;
  poly([a[0],a[1]-top,b[0],b[1]-top,b[0]+o[0],b[1]+o[1],a[0]+o[0],a[1]+o[1]],'#7a5a48');poly([b[0],b[1]-top,b[0],b[1],b[0]+o[0],b[1]+o[1]],'#5e4436');
  ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(a[0],a[1]-top-.15*t);ctx.lineTo(a[0]+o[0],a[1]+o[1]-.12*t);ctx.stroke()}}
 // cast-iron fronts: slender columns
 if(kind==='cast'){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(.5,t*.03);for(const f of['L','R']){const P=F[f],len=f==='L'?L_.ax:L_.ay,n=Math.max(2,Math.round(len*4));ctx.beginPath();for(let i=0;i<=n;i++){const a=P(i/n,0),b=P(i/n,h-.1*t);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}ctx.stroke()}}
 if(kind==='mansion'||(kind==='cast'&&r()<.4))nyMansard(F,h,t,kind==='mansion'?'#f1ebdd':'#efe7d6');
 // chimneys
 if(kind!=='cast'&&r()<.7){for(let i=0;i<1+((r()*2)|0);i++){const p=F.L(.2+r()*.6,h);const q=[p[0]+(r()*.3)*t,p[1]-L_.ay*t2*(.3+r()*.6)];ctx.fillStyle=kind==='brown'?'#5a3a2e':'#8a3f2c';ctx.fillRect(q[0]-.05*t,q[1]-.28*t,.1*t,.28*t);ctx.fillStyle='#2a2522';ctx.fillRect(q[0]-.06*t,q[1]-.3*t,.12*t,.04*t)}}}
function nyLaundry(S,H,d,t,r){ctx.strokeStyle='rgba(60,50,40,.7)';ctx.lineWidth=Math.max(.4,t*.015);const cols=['#f4f1ea','#e8c9a8','#9fb7c2','#c94f3a','#efe3c8'];
 for(let k=0;k<3;k++){const v=-H+d+.35+k*.55,a=S(-H+d+.1,v),b=S(H-d-.1,v);ctx.beginPath();ctx.moveTo(a[0],a[1]-.9*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-.7*t,b[0],b[1]-.9*t);ctx.stroke();
  for(let i=1;i<7;i++){if(r()<.3)continue;const u=i/7,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u-.9*t+Math.sin(u*Math.PI)*.2*t;ctx.fillStyle=cols[(r()*cols.length)|0];ctx.fillRect(x-.05*t,y,.1*t,.14*t)}}}
function drawBlockNY(o,cx,cy,hw){const t=hw/4,t2=t/2,tex=t>=4.5,vr=blockVariant(o),lv=o.lvl,old=o.v==='old';
 let sd=vr*7919+lv*104729+(old?31:0)+1;const r=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646};
 const S=(u,v)=>[cx+(u-v)*t,cy+(u+v)*t2],fl=(old?4:[0,2,3,4,4,5,5][lv])+(o.tier?(NYC()?[0,2,4,7]:[0,1,1,2,3,3,4])[o.tier]||0:0)+(lv>=4&&RES().kaplan?Math.max(0,Math.min(6,Math.floor((skyYear()-1889)/4))):0),H=1.85,fh=.3*t;
 poly([...S(-H,-H),...S(H,-H),...S(H,H),...S(-H,H)],'#b3aa97');
 const d=old?.72+r()*.08:.62+r()*.08;
 // backyards: gardens, trees, laundry
 poly([...S(-H+d,-H+d),...S(H-d,-H+d),...S(H-d,H-d),...S(-H+d,H-d)],lv>=4?'#7f9f55':'#8a8a6a');
 if(tex){for(let i=0;i<(lv>=4?4:2);i++){const[x,y]=S(-H+d+.3+r()*(2*H-2*d-.6),-H+d+.3+r()*(2*H-2*d-.6));ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x+.1*t,y+.05*t,.28*t,.12*t,0,0,7);ctx.fill();ctx.fillStyle='#4a3a28';ctx.fillRect(x-.05*t,y-.6*t,.1*t,.6*t);ctx.fillStyle=['#5f8a3a','#6f9a44','#7e9a3a','#a8913a'][(r()*4)|0];ctx.beginPath();ctx.arc(x,y-.85*t,.42*t,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(x-.12*t,y-.98*t,.2*t,0,7);ctx.fill()}
  if(lv<=3)nyLaundry(S,H,d,t,r)}
 const lots=[],split=len=>{const out=[];let p=0;while(p<len-.3){let l=Math.min(len-p,.45+r()*.5);if(len-p-l<.35)l=len-p;out.push([p,l]);p+=l}return out};
 for(const[p,l]of split(2*H))lots.push({u:-H+p+l/2,v:-H+d/2,ax:l/2,ay:d/2});
 for(const[p,l]of split(2*H-2*d))lots.push({u:-H+d/2,v:-H+d+p+l/2,ax:d/2,ay:l/2});
 for(const[p,l]of split(2*H-2*d))lots.push({u:H-d/2,v:-H+d+p+l/2,ax:d/2,ay:l/2});
 for(const[p,l]of split(2*H))lots.push({u:-H+p+l/2,v:H-d/2,ax:l/2,ay:d/2});
 const kinds=old?['federal','federal','cast','brick','brown']:lv>=6?['mansion']:lv===5?['brown','cast','cast','mansion','brick']:lv===4?['brown','brown','cast','brick','federal']:lv===3?['brick','brown','cast','brick','federal']:['brick','brick','brick','brown','federal'];
 const styOf={brick:[1,4,9],brown:[0,2,5,10],cast:[3,6,12,11],mansion:[3,12],federal:[1,4,9,7]};
 for(const L_ of lots){L_.kind=kinds[(r()*kinds.length)|0];L_.f=Math.max(2,(L_.kind==='federal'?Math.min(3,fl-1):fl)+(r()<.4?1:0)-(r()<.25?1:0)+(L_.kind==='cast'?1:0))}
 lots.sort((a,b)=>(a.u+a.v)-(b.u+b.v));
 for(const L_ of lots){const[x,y]=S(L_.u,L_.v),h=L_.f*fh+.3*t,st=styOf[L_.kind];prismTex(x,y,L_.ax,L_.ay,h,st[(r()*st.length)|0],L_.f,'#4a4540',t*.03,t,t2,tex);
  if(!tex)continue;{const tc=NYTINT[(r()*NYTINT.length)|0];if(tc){const F=nyFace(x,y,L_.ax,L_.ay,t,t2);nyBand(F,'L',0,h,tc,0);nyBand(F,'R',0,h,tc,0)}}
  if(L_.kind==='federal'){nyDecor(L_,x,y,h,t,t2,'fed',r,fh);nyGable(x,y,L_.ax,L_.ay,h,t,t2,shade('#9c4a32',.9),['#4a3e3a','#5a4a44','#3f4850'][(r()*3)|0]);continue}
  nyDecor(L_,x,y,h,t,t2,L_.kind,r,fh);if(L_.f>=4&&r()<.2)nySign(nyFace(x,y,L_.ax,L_.ay,t,t2),h,t,r);
  if(L_.f>=4&&r()<.55&&L_.kind!=='mansion'){const wx=x+(r()-.5)*L_.ax*t*.6,wy=y-h-.1*t;ctx.fillStyle='#7a5532';ctx.fillRect(wx-.11*t,wy-.34*t,.22*t,.28*t);ctx.strokeStyle='rgba(40,25,15,.6)';ctx.lineWidth=Math.max(.3,t*.012);for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(wx-.11*t,wy-.34*t+k*.07*t);ctx.lineTo(wx+.11*t,wy-.34*t+k*.07*t);ctx.stroke()}
   ctx.fillStyle='#5a3a24';ctx.beginPath();ctx.moveTo(wx-.13*t,wy-.34*t);ctx.lineTo(wx,wy-.5*t);ctx.lineTo(wx+.13*t,wy-.34*t);ctx.fill();ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(wx-.09*t,wy-.06*t);ctx.lineTo(wx-.09*t,wy+.06*t);ctx.moveTo(wx+.09*t,wy-.06*t);ctx.lineTo(wx+.09*t,wy+.06*t);ctx.stroke()}
  if(L_.kind==='brick'&&L_.f>=3&&r()<.65){ctx.strokeStyle='rgba(20,18,16,.8)';ctx.lineWidth=Math.max(.5,t*.024);const F=nyFace(x,y,L_.ax,L_.ay,t,t2),P=F.L;ctx.beginPath();
   for(let f=1;f<L_.f;f++){const a=P(.25,f*fh+.3*t),b=P(.6,f*fh+.3*t),o=[F.nL[0]*.12,F.nL[1]*.12];ctx.moveTo(a[0]+o[0],a[1]+o[1]);ctx.lineTo(b[0]+o[0],b[1]+o[1]);if(f<L_.f-1){const c=P(.3,f*fh+.3*t+fh);ctx.moveTo(b[0]+o[0],b[1]+o[1]);ctx.lineTo(c[0]+o[0],c[1]+o[1])}}ctx.stroke()}}}

/* ---------- stunning skyscrapers ---------- */
function skyShade(x,y,ax,ay,H,t,t2){const F=nyFace(x,y,ax,ay,t,t2);for(const f of['L','R']){const P=F[f],a=P(0,0),b=P(1,0),c=P(1,H),d=P(0,H),g=ctx.createLinearGradient(0,a[1],0,d[1]);
 g.addColorStop(0,'rgba(20,25,35,.18)');g.addColorStop(.55,'rgba(255,255,255,0)');g.addColorStop(1,f==='L'?'rgba(255,244,220,.28)':'rgba(255,244,220,.12)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.closePath();ctx.fill()}}
function skyPiers(x,y,ax,ay,H,t,t2,n,col){const F=nyFace(x,y,ax,ay,t,t2);ctx.strokeStyle=col;ctx.lineWidth=Math.max(.6,t*.045);ctx.beginPath();for(const f of['L','R']){const P=F[f],len=f==='L'?ax:ay,k=Math.max(2,Math.round(len*n));for(let i=0;i<=k;i++){const a=P(i/k,0),b=P(i/k,H);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}}ctx.stroke()}
function skyBelts(x,y,ax,ay,H,t,t2,every,fh,col){const F=nyFace(x,y,ax,ay,t,t2);for(let h=every*fh;h<H-fh;h+=every*fh)for(const f of['L','R'])nyBand(F,f,h,h+.05*t,col,.02)}
function skyLit(x,y,ax,ay,H,t,t2,fh,seed){let sd=seed;const r=()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646};const F=nyFace(x,y,ax,ay,t,t2);ctx.fillStyle='rgba(255,214,120,.75)';
 for(let i=0;i<Math.round(H/fh*1.2);i++){const f=r()<.6?'L':'R',p=F[f](.08+r()*.84,fh*(1+Math.floor(r()*(H/fh-2)))+fh*.35);ctx.fillRect(p[0]-.04*t,p[1]-.07*t,.08*t,.1*t)}}
function skyBase(x,y,ax,ay,t,t2,fh){const F=nyFace(x,y,ax,ay,t,t2);for(const f of['L','R']){nyBand(F,f,0,fh*1.4,'rgba(60,50,40,.25)',0);const P=F[f],len=f==='L'?ax:ay,n=Math.max(1,Math.round(len*1.6));
 for(let i=0;i<n;i++){const s=(i+.5)/n,a=P(s-.12/n*2,0),b=P(s+.12/n*2,0),top=fh*1.2;ctx.fillStyle='#2a2c30';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0],a[1]-top*.7);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-top*1.15,b[0],b[1]-top*.7);ctx.lineTo(b[0],b[1]);ctx.fill()}}}
function skyFlag(x,y,t){ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-.9*t);ctx.stroke();const w=.42*t,h=.24*t,fx=x,fy=y-.9*t,wv=Math.sin(performance.now()/400)*.03*t;
 for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#f4f1ea':'#b8322a';ctx.fillRect(fx,fy+i*h/7+wv*(i%2),w,h/7+.5)}ctx.fillStyle='#2f4f8a';ctx.fillRect(fx,fy,w*.42,h*.55)}
function drawSky(k,cx,cy,hw,hh,o){const t=hw/4,t2=hh/4,tx=t>=4.5,fh=.33*t;poly([cx-hw*.92,cy,cx,cy-hh*.92,cx+hw*.92,cy,cx,cy+hh*.92],'#bdb4a2');
 for(let i=0;i<5;i++){const a=i*1.26,px=cx+Math.cos(a)*hw*.75,py=cy+Math.sin(a)*hh*.75;ctx.fillStyle='#3a2e22';ctx.fillRect(px-.02*t,py-.3*t,.04*t,.3*t);ctx.fillStyle='#d9b85a';ctx.beginPath();ctx.arc(px,py-.32*t,.05*t,0,7);ctx.fill()}
 let sp=SKY[k],seed=(o.x*131+o.y*71)|0||7;
 if(k==='tower'){const v=(hs(o.x*31+o.y*17)*5)|0,fl=Math.round(10+Math.max(0,Math.min(18,(skyYear()-1888)*.8)));sp={w:1.3,d:1.3,H:fl*fh/t,c:[3,6,12,11,0][v],top:['flat','mansard','dome','temple','flat'][v],set:skyYear()>=1900&&fl>16}}
 let base=0;if(sp.pod){const[pw,pd,ph,pc]=sp.pod;prismTex(cx,cy,pw,pd,ph*t,pc,Math.round(ph*t/fh),'#4a4540',.04*t,t,t2,tx);if(tx){skyShade(cx,cy,pw,pd,ph*t,t,t2);skyBelts(cx,cy,pw,pd,ph*t,t,t2,3,fh,'rgba(255,255,255,.35)');skyBase(cx,cy,pw,pd,t,t2,fh)}base=ph*t}
 let H=sp.H*t,w=sp.w,d=sp.d;
 if(sp.set){const H1=H*.62;prismTex(cx,cy-base,w,d,H1,sp.c,Math.round(H1/fh),'#4a4540',.04*t,t,t2,tx);if(tx){skyPiers(cx,cy-base,w,d,H1,t,t2,3,'rgba(255,255,255,.22)');skyBelts(cx,cy-base,w,d,H1,t,t2,5,fh,'rgba(255,255,255,.4)');skyShade(cx,cy-base,w,d,H1,t,t2);if(!sp.pod)skyBase(cx,cy-base,w,d,t,t2,fh);skyLit(cx,cy-base,w,d,H1,t,t2,fh,seed)}
  base+=H1;H-=H1;w*=.72;d*=.72}
 prismTex(cx,cy-base,w,d,H,sp.c,Math.round(H/fh),'#4a4540',.04*t,t,t2,tx);
 if(tx){skyPiers(cx,cy-base,w,d,H,t,t2,k==='woolworth'?6:3,k==='woolworth'?'rgba(255,255,255,.45)':'rgba(255,255,255,.22)');skyBelts(cx,cy-base,w,d,H,t,t2,k==='woolworth'?8:5,fh,'rgba(255,255,255,.38)');skyShade(cx,cy-base,w,d,H,t,t2);if(!sp.pod&&!sp.set)skyBase(cx,cy-base,w,d,t,t2,fh);skyLit(cx,cy-base,w,d,H,t,t2,fh,seed+3)
  const F=nyFace(cx,cy-base,w,d,t,t2);for(const f of['L','R']){nyBand(F,f,H-.18*t,H,'#f4efe3',.07);nyBand(F,f,H-.24*t,H-.18*t,'rgba(0,0,0,.25)',.05)}}
 const topY=cy-base-H-.04*t;
 if(sp.top==='temple'){const tw=w*t*.9;ctx.fillStyle='#efe9dc';for(let i=0;i<6;i++){const px=cx-tw+i*tw*2/5;ctx.fillRect(px-.04*t,topY-.8*t,.08*t,.8*t)}poly([cx-tw-.1*t,topY-.8*t,cx+tw+.1*t,topY-.8*t,cx,topY-1.3*t],'#d9cdb1');ctx.fillStyle='#d9a92a';ctx.beginPath();ctx.arc(cx,topY-1.35*t,.08*t,0,7);ctx.fill()}
 else skyTop(sp.top,cx,topY,w,t);
 if(tx&&(k!=='tower'||(o.x+o.y)%3===0))skyFlag(cx+w*t*.5,topY-(sp.top==='flat'?0:.4*t),t)}
/* ---------- people of every kind, walking ---------- */
const PEOPLE=(()=>{const out=[],coats=['#1d1b1a','#2f3a4a','#3a2a24','#4a3a2a','#2a3a2e','#5a2a24','#3d3550'],dresses=['#6b2f4a','#2f4f6e','#5a6b3a','#7a3b2e','#3a4a6e','#8a6a3a','#5a2a4a','#2f5a5a','#9a5a6a'],hats=['top','bowler','bowler','cap','straw'];
 for(let i=0;i<10;i++)out.push(['gent',coats[i%coats.length],hats[i%2?0:1],'#1a1a1a']);for(let i=0;i<12;i++)out.push(['lady',dresses[i%dresses.length],['#efe3c8','#e8d5b0','#f4f1ea','#d9c9a8'][i%4],i%3===0?'parasol':'']);
 for(let i=0;i<6;i++)out.push(['worker',['#5a4632','#4a5a6a','#6b5a46','#3a4a3a'][i%4],'cap','#e8dcc0']);out.push(['newsboy','#5a4632','cap','#f4f1ea'],['newsboy','#3a3a4a','cap','#f4f1ea'],['police','#1f2a44','helmet','#d9a92a'],['police','#1f2a44','helmet','#d9a92a'],
 ['nanny','#2a2a33','bonnet','#f4f1ea'],['vendor','#6b4f2e','cap','#c9a227'],['vendor','#4a3a2a','straw','#d9483a'],['sailor','#1f2a44','sailor','#f4f1ea'],['immigrant','#5a4632','shawl','#8a3b2e'],['immigrant','#3a2a24','shawl','#2f4f6e'],['child','#8a3b2e','cap','#d9c79c'],['child','#2f4f6e','bonnet','#efe3c8'],['priest','#1d1b1a','wide','#1d1b1a']);return out})();
function drawPerson(x,y,z,k,still){const P=PEOPLE[((k%PEOPLE.length)+PEOPLE.length)%PEOPLE.length],[kind,c1,hat,c2]=P,s=(kind==='child'||kind==='newsboy'?.72:1)*(.93+((k*37)%13)/100),Z_=z*s,ph=performance.now()/170+k*1.7+x*.05,sw=still?0:Math.sin(ph),skin=['#ecd0b4','#e2bf9c','#c99a72','#f0d8c0'][k%4];
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+1.3*z,y+.5*z,2*Z_,.75*Z_,0,0,7);ctx.fill();
 if(kind==='nanny'){const px=x+2.4*z,py=y;ctx.fillStyle='#2a2a33';ctx.beginPath();ctx.ellipse(px,py-2.6*z,1.6*z,1.1*z,0,0,7);ctx.fill();ctx.fillStyle='#efe3c8';ctx.beginPath();ctx.ellipse(px,py-3.1*z,1.2*z,.5*z,0,0,7);ctx.fill();ctx.strokeStyle='#1d1b1a';ctx.lineWidth=Math.max(.4,.3*z);ctx.beginPath();ctx.arc(px-.9*z,py-.6*z,.6*z,0,7);ctx.arc(px+.9*z,py-.6*z,.6*z,0,7);ctx.stroke()}
 if(kind==='vendor'){const px=x+2.6*z,py=y;ctx.fillStyle='#7a5532';ctx.fillRect(px-1.8*z,py-3.2*z,3.6*z,1.4*z);for(let i=0;i<5;i++){ctx.fillStyle=['#d9483a','#e8c547','#6b8f3a','#d9483a','#c9782a'][i];ctx.beginPath();ctx.arc(px-1.3*z+i*.65*z,py-3.4*z,.42*z,0,7);ctx.fill()}ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.4,.3*z);ctx.beginPath();ctx.arc(px,py-.9*z,.9*z,0,7);ctx.stroke()}
 // legs
 if(kind==='lady'||kind==='nanny'||kind==='immigrant'&&k%2===0){ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(x-1.7*Z_,y);ctx.quadraticCurveTo(x-1.2*Z_,y-3*Z_,x-.7*Z_,y-4.4*Z_);ctx.lineTo(x+.7*Z_,y-4.4*Z_);ctx.quadraticCurveTo(x+1.4*Z_,y-2.8*Z_,x+2*Z_,y);ctx.fill();ctx.fillStyle=shade(c1,.8);ctx.beginPath();ctx.ellipse(x+1.1*Z_,y-3.2*Z_,.8*Z_,1*Z_,0,0,7);ctx.fill();
  ctx.fillStyle=c1;ctx.fillRect(x-.75*Z_,y-6.3*Z_,1.5*Z_,2.1*Z_)}
 else{ctx.strokeStyle=kind==='police'||kind==='sailor'?'#1a2238':shade(c1,.7);ctx.lineWidth=Math.max(.6,.7*Z_);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-.35*Z_,y-2.5*Z_);ctx.lineTo(x-.35*Z_+sw*.7*Z_,y);ctx.moveTo(x+.35*Z_,y-2.5*Z_);ctx.lineTo(x+.35*Z_-sw*.7*Z_,y);ctx.stroke();
  ctx.fillStyle='#1d1b1a';ctx.beginPath();ctx.ellipse(x-.35*Z_+sw*.7*Z_+.3*Z_,y,.5*Z_,.25*Z_,0,0,7);ctx.ellipse(x+.35*Z_-sw*.7*Z_+.3*Z_,y,.5*Z_,.25*Z_,0,0,7);ctx.fill();
  ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(x-1.05*Z_,y-2.3*Z_);ctx.lineTo(x+1.05*Z_,y-2.3*Z_);ctx.lineTo(x+.9*Z_,y-5.6*Z_);ctx.lineTo(x-.9*Z_,y-5.6*Z_);ctx.fill();ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.moveTo(x+.1*Z_,y-2.3*Z_);ctx.lineTo(x+1.05*Z_,y-2.3*Z_);ctx.lineTo(x+.9*Z_,y-5.6*Z_);ctx.lineTo(x+.1*Z_,y-5.6*Z_);ctx.fill();if(kind==='gent'){ctx.fillStyle=shade(c1,.85);ctx.beginPath();ctx.moveTo(x-1.05*Z_,y-2.3*Z_);ctx.lineTo(x-1.3*Z_,y-1.4*Z_);ctx.lineTo(x-.4*Z_,y-2.3*Z_);ctx.fill()}
  if(kind==='gent'){ctx.fillStyle='#f4f1ea';ctx.fillRect(x-.2*Z_,y-5.5*Z_,.4*Z_,1.1*Z_)}if(kind==='worker'){ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.3,.2*Z_);ctx.beginPath();ctx.moveTo(x-.5*Z_,y-5.5*Z_);ctx.lineTo(x-.5*Z_,y-2.6*Z_);ctx.moveTo(x+.5*Z_,y-5.5*Z_);ctx.lineTo(x+.5*Z_,y-2.6*Z_);ctx.stroke()}
  if(kind==='police'){ctx.fillStyle='#d9a92a';for(let i=0;i<3;i++)ctx.fillRect(x-.08*Z_,y-5.2*Z_+i*.8*Z_,.16*Z_,.16*Z_)}if(kind==='sailor'){ctx.fillStyle='#f4f1ea';ctx.fillRect(x-.9*Z_,y-5.6*Z_,1.8*Z_,.5*Z_)}}
 // arms
 ctx.strokeStyle=kind==='lady'||kind==='nanny'?c1:shade(c1,.85);ctx.lineWidth=Math.max(.5,.55*Z_);ctx.beginPath();ctx.moveTo(x-.9*Z_,y-5.3*Z_);ctx.lineTo(x-1.2*Z_-sw*.5*Z_,y-3.2*Z_);ctx.moveTo(x+.9*Z_,y-5.3*Z_);ctx.lineTo(x+1.2*Z_+sw*.5*Z_,y-3.2*Z_);ctx.stroke();
 if(kind==='newsboy'){ctx.fillStyle='#e8e2d2';ctx.fillRect(x+.9*Z_,y-4.4*Z_,1.3*Z_,1*Z_);ctx.strokeStyle='#2a2522';ctx.lineWidth=.4;ctx.strokeRect(x+.9*Z_,y-4.4*Z_,1.3*Z_,1*Z_)}
 if(kind==='immigrant'){ctx.fillStyle='#8a6a44';ctx.beginPath();ctx.ellipse(x-1.5*Z_,y-3.5*Z_,1*Z_,.8*Z_,0,0,7);ctx.fill();ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(x-1.1*Z_,y-5.8*Z_);ctx.lineTo(x+1.1*Z_,y-5.8*Z_);ctx.lineTo(x,y-4.2*Z_);ctx.fill()}
 if(kind==='police'){ctx.strokeStyle='#4a3a2a';ctx.lineWidth=Math.max(.4,.3*Z_);ctx.beginPath();ctx.moveTo(x+1.2*Z_,y-3.2*Z_);ctx.lineTo(x+1.8*Z_,y-4.5*Z_);ctx.stroke()}
 // head
 const hy=y-6.9*Z_;ctx.fillStyle=skin;ctx.beginPath();ctx.arc(x,hy,.95*Z_,0,7);ctx.fill();ctx.fillStyle='rgba(60,40,30,.5)';ctx.fillRect(x-.6*Z_,hy-.6*Z_,1.2*Z_,.35*Z_);
 if(Z_>=2.2){ctx.fillStyle='#2a1d14';ctx.fillRect(x-.38*Z_,hy-.12*Z_,.2*Z_,.18*Z_);ctx.fillRect(x+.18*Z_,hy-.12*Z_,.2*Z_,.18*Z_);ctx.fillStyle='rgba(150,70,60,.6)';ctx.fillRect(x-.22*Z_,hy+.42*Z_,.44*Z_,.1*Z_);
  if(kind==='gent'&&k%3===0){ctx.fillStyle='#4a3428';ctx.beginPath();ctx.ellipse(x,hy+.55*Z_,.6*Z_,.35*Z_,0,0,Math.PI);ctx.fill()}
  ctx.fillStyle=skin;for(const s_ of[-1,1]){ctx.beginPath();ctx.arc(x+s_*(1.2*Z_)+s_*(s_>0?sw:-sw)*.5*Z_,y-3.1*Z_,.32*Z_,0,7);ctx.fill()}
  if(kind==='gent'||kind==='police'||kind==='worker'){ctx.fillStyle=kind==='worker'?'#efe7d6':'#f4f1ea';ctx.beginPath();ctx.moveTo(x-.45*Z_,y-5.7*Z_);ctx.lineTo(x,y-5.1*Z_);ctx.lineTo(x+.45*Z_,y-5.7*Z_);ctx.fill();ctx.fillStyle=kind==='police'?'#d9a92a':'#1d1b1a';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x,y-4.8*Z_+i*.7*Z_,.1*Z_,0,7);ctx.fill()}}
  if(kind==='lady'){ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(x-.5*Z_,y-6.2*Z_);ctx.lineTo(x+.5*Z_,y-6.2*Z_);ctx.lineTo(x,y-5.6*Z_);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=Math.max(.3,.12*Z_);ctx.beginPath();ctx.moveTo(x-.75*Z_,y-4.3*Z_);ctx.lineTo(x+.75*Z_,y-4.3*Z_);for(let i=-2;i<=2;i++){ctx.moveTo(x+i*.35*Z_,y-4.2*Z_);ctx.lineTo(x+i*.5*Z_,y-.3*Z_)}ctx.stroke()}}
 const H_=kind==='lady'?'lady':hat;
 if(H_==='top'){ctx.fillStyle='#111';ctx.fillRect(x-.75*Z_,hy-2.6*Z_,1.5*Z_,1.9*Z_);ctx.fillRect(x-1.25*Z_,hy-.85*Z_,2.5*Z_,.38*Z_)}
 else if(H_==='bowler'){ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.ellipse(x,hy-.95*Z_,.95*Z_,.85*Z_,0,Math.PI,0);ctx.fill();ctx.fillRect(x-1.25*Z_,hy-.95*Z_,2.5*Z_,.32*Z_)}
 else if(H_==='straw'){ctx.fillStyle='#e8d29a';ctx.fillRect(x-1.3*Z_,hy-.95*Z_,2.6*Z_,.3*Z_);ctx.fillRect(x-.75*Z_,hy-1.6*Z_,1.5*Z_,.7*Z_);ctx.fillStyle='#2a2522';ctx.fillRect(x-.75*Z_,hy-1.1*Z_,1.5*Z_,.18*Z_)}
 else if(H_==='cap'){ctx.fillStyle=kind==='child'?c1:'#3a3530';ctx.beginPath();ctx.ellipse(x,hy-.75*Z_,1.05*Z_,.5*Z_,0,0,7);ctx.fill();ctx.fillRect(x,hy-.75*Z_,1.3*Z_,.22*Z_)}
 else if(H_==='helmet'){ctx.fillStyle='#1f2a44';ctx.beginPath();ctx.ellipse(x,hy-1.1*Z_,.9*Z_,1.1*Z_,0,Math.PI,0);ctx.fill();ctx.fillRect(x-1.1*Z_,hy-1.1*Z_,2.2*Z_,.3*Z_);ctx.fillStyle='#d9a92a';ctx.beginPath();ctx.arc(x,hy-1.5*Z_,.22*Z_,0,7);ctx.fill()}
 else if(H_==='sailor'){ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(x,hy-.85*Z_,1*Z_,.45*Z_,0,0,7);ctx.fill()}
 else if(H_==='bonnet'||H_==='shawl'){ctx.fillStyle=H_==='shawl'?c2:'#f4f1ea';ctx.beginPath();ctx.arc(x,hy-.15*Z_,1.15*Z_,Math.PI*.95,Math.PI*2.05);ctx.fill()}
 else if(H_==='wide'){ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x,hy-.9*Z_,1.7*Z_,.5*Z_,0,0,7);ctx.fill()}
 else if(H_==='lady'){ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(x,hy-.85*Z_,1.75*Z_,.55*Z_,0,0,7);ctx.fill();ctx.fillStyle=c1;ctx.beginPath();ctx.arc(x,hy-1.15*Z_,.62*Z_,0,7);ctx.fill();ctx.strokeStyle=['#c94f3a','#2f5a3a','#f4f1ea'][k%3];ctx.lineWidth=Math.max(.4,.35*Z_);ctx.beginPath();ctx.moveTo(x+.4*Z_,hy-1.4*Z_);ctx.quadraticCurveTo(x+1.6*Z_,hy-2.4*Z_,x+1.8*Z_,hy-1.2*Z_);ctx.stroke();
  if(c2&&P[3]==='parasol'){ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.3,.2*Z_);ctx.beginPath();ctx.moveTo(x+1.2*Z_,y-3.4*Z_);ctx.lineTo(x+1.6*Z_,hy-2.4*Z_);ctx.stroke();ctx.fillStyle=['#f4f1ea','#e8c9d0','#cfe0d8'][k%3];ctx.beginPath();ctx.arc(x+1.6*Z_,hy-2.3*Z_,1.9*Z_,Math.PI,0);ctx.fill()}}}
/* ---------- the waterfront: piers, a forest of masts, boats, glittering water, gas lamps ---------- */
let PIERS=null,BOATS=[],SHIM=null,LAMPS=null,LAMPK=-1,ARTT=0;
function pierFree(x,y){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const i=(y+dy)*W+(x+dx),o=S.b[i];if(o&&o.t!=='road')return false}return true}
function wfInit(){PIERS=[];SHIM=[];const isW=(x,y)=>inb(x,y)&&S.tiles[y*W+x]===WATER;
 for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const i=y*W+x;if(S.tiles[i]===WATER){if(hs(i*7)<.02)SHIM.push([x,y,hs(i*13)*6.28]);continue}
  /* the timber piers along the waterfront are New York's; another city brings its own landing stages (L.piers) */
  if(!NYC()&&!L.piers||S.tiles[i]===MOUNT||ZONE[i]>2||hs(i*3)>.16)continue;for(const[dx,dy]of D4){if(!isW(x+dx,y+dy))continue;let n=0;while(n<4&&isW(x+dx*(n+1),y+dy*(n+1)))n++;if(n<4)continue;if(!pierFree(x,y)||PIERS.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)<5))break;
   PIERS.push({x,y,dx,dy,len:3,ship:hs(i*11)<.55?1:hs(i*17)<.5?2:0});break}}
 for(let k=0;k<8;k++)BOATS.push(newBoat(k))}
function newBoat(k){const isW=i=>S.tiles[i]===WATER;let st=-1;const LF0=landField();for(let n=0;n<400&&st<0;n++){const i=(hs(k*977+n*131+ARTT)*W*H)|0;if(isW(i)&&LF0[i]<.01)st=i}if(st<0)return null;
 const LF=landField(),deep=n=>LF[n]<.01&&!(PIERS||[]).some(p=>Math.abs(p.x+p.dx*2-n%W)+Math.abs(p.y+p.dy*2-((n/W)|0))<4);const par=new Map([[st,-1]]),q=[st];for(let h=0;h<q.length&&q.length<900;h++){const x=q[h]%W,y=q[h]/W|0;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,n=ny*W+nx;if(inb(nx,ny)&&!par.has(n)&&isW(n)&&deep(n)){par.set(n,q[h]);q.push(n)}}}
 const end=q[q.length-1],p=[];let c=end;while(c!==-1&&c!==undefined){p.push(c);c=par.get(c)}return{p:p.reverse(),f:0,kind:['tug','sloop','ferry','tug','sloop','schooner','tug','sloop'][k%8],k}}
function boatPos(b){const L_=b.p.length-1,q=b.f*L_,k=Math.min(L_-1,Math.floor(q)),u=q-k,a=b.p[k],c=b.p[Math.min(L_,k+1)];return[(a%W)*(1-u)+(c%W)*u,(a/W|0)*(1-u)+(c/W|0)*u,(c%W)-(a%W),((c/W)|0)-((a/W)|0)]}
function drawMast(x,y,h,t){ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.6,t*.05);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke();ctx.lineWidth=Math.max(.4,t*.03);ctx.beginPath();for(let i=1;i<4;i++){const yy=y-h*i/4.2,w=(.55-i*.1)*t;ctx.moveTo(x-w,yy);ctx.lineTo(x+w,yy)}ctx.stroke();ctx.fillStyle='rgba(240,232,214,.9)';for(let i=1;i<4;i++){const yy=y-h*i/4.2,w=(.5-i*.1)*t;ctx.fillRect(x-w,yy,2*w,.07*t)}}
function drawHull(x,y,ux,uy,len,beam,col,t){const nx=-uy,ny=ux*.5,P=(f,o)=>[x+ux*len*f+nx*beam*o,y+uy*len*f*.5+ny*beam*o];
 poly([...P(-.5,-1),...P(.4,-1),...P(.55,0),...P(.4,1),...P(-.5,1)],col);poly([...P(-.5,-1),...P(.4,-1),...P(.4,-.7),...P(-.5,-.7)],'rgba(255,255,255,.18)');ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+2,y+3,len*.5,beam*.6,Math.atan2(uy*.5,ux),0,7);ctx.fill()}
let PIERGV=-1;
function drawPiersGround(){if(!S||!L.y1857)return;if(!PIERS||PIERGV!==GV){const b=BOATS;wfInit();BOATS=b.length?b:BOATS;PIERGV=GV}const t=32*Z;
 for(const p of PIERS){const[sx,sy]=scr(p.x,p.y),[ex,ey]=scr(p.x+p.dx*p.len,p.y+p.dy*p.len),ux=ex-sx,uy=ey-sy,l=Math.hypot(ux,uy)||1,nx=-uy/l,ny=ux/l,w=.32*t;
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.moveTo(sx+nx*w+3,sy+ny*w*.5+3);ctx.lineTo(ex+nx*w+3,ey+ny*w*.5+3);ctx.lineTo(ex-nx*w+3,ey-ny*w*.5+3);ctx.lineTo(sx-nx*w+3,sy-ny*w*.5+3);ctx.fill();
  poly([sx+nx*w,sy+ny*w*.5,ex+nx*w,ey+ny*w*.5,ex-nx*w,ey-ny*w*.5,sx-nx*w,sy-ny*w*.5],'#8a6a44');ctx.strokeStyle='rgba(60,40,20,.5)';ctx.lineWidth=Math.max(.4,Z*.4);ctx.beginPath();for(let i=1;i<8;i++){const f=i/8;ctx.moveTo(sx+ux*f+nx*w,sy+uy*f+ny*w*.5);ctx.lineTo(sx+ux*f-nx*w,sy+uy*f-ny*w*.5)}ctx.stroke();
  if(Z>.3&&p.ship!==2){const f=.55,cx_=sx+ux*f,cy_=sy+uy*f;ctx.fillStyle='#6b5a46';ctx.fillRect(cx_-.35*t,cy_-.45*t,.7*t,.4*t);ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.moveTo(cx_-.4*t,cy_-.45*t);ctx.lineTo(cx_,cy_-.7*t);ctx.lineTo(cx_+.4*t,cy_-.45*t);ctx.fill()}}}
function drawWaterfront(dt){if(!S||!L.y1857)return;if(!PIERS)wfInit();ARTT+=dt;const t=32*Z,now=performance.now();
 // glitter on the water
 if(Z>.18){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=Math.max(.6,Z*.9);ctx.beginPath();for(const[x,y,p]of SHIM){const[sx,sy]=scr(x,y);if(sx<-20||sx>vw+20||sy<-20||sy>vh+20)continue;const a=Math.sin(now/700+p);if(a<.3)continue;const w=6*Z*a;ctx.moveTo(sx-w,sy);ctx.quadraticCurveTo(sx,sy-2*Z,sx+w,sy)}ctx.stroke()}
 // piers with moored ships
 for(const p of PIERS){const[sx,sy]=scr(p.x,p.y);if(sx<-150||sx>vw+150||sy<-200||sy>vh+150)continue;const[ex,ey]=scr(p.x+p.dx*p.len,p.y+p.dy*p.len),ux=(ex-sx),uy=(ey-sy),l=Math.hypot(ux,uy)||1,nx=-uy/l,ny=ux/l;
  const w=.32*t;
  if(p.ship&&Z>.12){continue;drawShip(p.x+p.dx*p.len*.55-p.dy*1.35,p.y+p.dy*p.len*.55+p.dx*1.35,p.dx,p.dy,p.ship===1?2.4:1.9,p.ship===1?'ship':'steamer');continue;const mx=(sx+ex)/2+nx*w*2.2,my=(sy+ey)/2+ny*w*1.1,len=l*.95,dux=ux/l,duy=uy/l;
   if(p.ship===1){drawHull(mx,my,dux,duy,len,.38*t,'#2a2522',t);for(const f of[-.25,.05,.3])drawMast(mx+dux*len*f,my+duy*len*f*.5-.2*t,2.2*t,t);ctx.strokeStyle='rgba(60,50,40,.5)';ctx.lineWidth=Math.max(.3,Z*.3);ctx.beginPath();ctx.moveTo(mx-dux*len*.5,my-duy*len*.25);ctx.lineTo(mx+dux*len*-.25,my+duy*len*-.125-2.4*t);ctx.lineTo(mx+dux*len*.3,my+duy*len*.15-2.4*t);ctx.lineTo(mx+dux*len*.6,my+duy*len*.3);ctx.stroke()}
   else{drawHull(mx,my,dux,duy,len*.8,.34*t,'#1d1b1a',t);ctx.fillStyle='#f4f1ea';ctx.fillRect(mx-.35*t,my-.55*t,.7*t,.4*t);ctx.fillStyle='#b8322a';ctx.fillRect(mx-.08*t,my-1.15*t,.16*t,.6*t);ctx.fillStyle='#1d1b1a';ctx.fillRect(mx-.08*t,my-1.2*t,.16*t,.1*t)}}}
 // boats under way
 for(let i=0;i<BOATS.length;i++){let b=BOATS[i];if(!b){BOATS[i]=newBoat(i+((ARTT|0)%97));continue}b.f+=dt*(b.kind==='ferry'?.6:.35)/Math.max(1,b.p.length-1);if(b.f>=1){BOATS[i]=newBoat(i*7+((ARTT*10)|0));continue}
  const[x,y,ddx,ddy]=boatPos(b);{let blocked=false;for(let j2=0;j2<i;j2++){const o2=BOATS[j2];if(!o2)continue;const q=boatPos(o2);if(Math.hypot(q[0]-x,q[1]-y)<1.8){blocked=true;break}}if(blocked)b.f-=dt*(b.kind==='ferry'?.6:.35)/Math.max(1,b.p.length-1)}
  const[sx,sy]=scr(x,y);if(sx<-80||sx>vw+80||sy<-120||sy>vh+80)continue;const[qx,qy]=scr(x+ddx,y+ddy),ux=qx-sx,uy=qy-sy,l=Math.hypot(ux,uy)||1,dux=ux/l,duy=uy/l;
  ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=Math.max(.6,Z);ctx.beginPath();ctx.moveTo(sx-dux*.6*t,sy-duy*.3*t);ctx.lineTo(sx-dux*1.6*t+duy*.3*t,sy-duy*.8*t);ctx.moveTo(sx-dux*.6*t,sy-duy*.3*t);ctx.lineTo(sx-dux*1.6*t-duy*.3*t,sy-duy*.8*t);ctx.stroke();
  {continue}
  if(b.kind==='tug'){drawHull(sx,sy,dux,duy,1.2*t,.3*t,'#7a2a22',t);ctx.fillStyle='#efe3c8';ctx.fillRect(sx-.25*t,sy-.5*t,.5*t,.35*t);ctx.fillStyle='#1d1b1a';ctx.fillRect(sx-.06*t,sy-.95*t,.12*t,.45*t);ctx.fillStyle='rgba(80,80,80,.45)';for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(sx-dux*j*.35*t,sy-1.15*t-j*.25*t,(.15+j*.08)*t,0,7);ctx.fill()}}
  else if(b.kind==='ferry'){drawHull(sx,sy,dux,duy,2.2*t,.45*t,'#efe3c8',t);ctx.fillStyle='#f4f1ea';ctx.fillRect(sx-.7*t,sy-.6*t,1.4*t,.4*t);ctx.fillStyle='#2f5a3a';ctx.fillRect(sx-.7*t,sy-.68*t,1.4*t,.1*t);ctx.fillStyle='#1d1b1a';ctx.fillRect(sx-.07*t,sy-1.2*t,.14*t,.55*t)}
  else{drawHull(sx,sy,dux,duy,(b.kind==='schooner'?1.6:1)*t,.25*t,b.kind==='schooner'?'#3a2a1e':'#f4f1ea',t);const mh=(b.kind==='schooner'?1.9:1.3)*t;ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.5,Z*.5);ctx.beginPath();ctx.moveTo(sx,sy-.1*t);ctx.lineTo(sx,sy-mh);ctx.stroke();
   ctx.fillStyle='rgba(248,244,232,.95)';ctx.beginPath();ctx.moveTo(sx+.05*t,sy-mh);ctx.lineTo(sx+.05*t+dux*.0,sy-.25*t);ctx.lineTo(sx-dux*.9*t+duy*.2*t,sy-.3*t);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(235,228,212,.95)';ctx.beginPath();ctx.moveTo(sx,sy-mh*.92);ctx.lineTo(sx+dux*.7*t,sy-.3*t);ctx.lineTo(sx+.05*t,sy-.3*t);ctx.fill()}}}
function OLD_drawLamps(){if(!S||Z<.35)return;if(LAMPK!==GV){LAMPK=GV;LAMPS=[];for(const o of S.list){if(o.t!=='road')continue;const i=o.y*W+o.x;if(ZONE[i]>1)continue;const nb=roadNb(i).length;if(nb>=3&&hs(i*5)<.6)LAMPS.push([o.x,o.y])}}
 const z=Z,lit=monthOf(S.t)>=9||monthOf(S.t)<=2;for(const[x,y]of LAMPS){const[sx0,sy0]=scr(x,y),sx=sx0+10*z,sy=sy0-2*z;if(sx<-20||sx>vw+20||sy<-40||sy>vh+20)continue;
  ctx.strokeStyle='#1d1b1a';ctx.lineWidth=Math.max(.6,.9*z);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,sy-14*z);ctx.stroke();ctx.fillStyle='#2a2522';ctx.fillRect(sx-1.6*z,sy-17.5*z,3.2*z,3.5*z);ctx.fillStyle=lit?'rgba(255,214,120,.95)':'rgba(240,230,200,.8)';ctx.fillRect(sx-1.1*z,sy-17*z,2.2*z,2.5*z);
  if(lit){ctx.fillStyle='rgba(255,200,110,.18)';ctx.beginPath();ctx.arc(sx,sy-15.5*z,6*z,0,7);ctx.fill()}}}

/* ===================== round two: terrain without squares, lamps, dormers, ships, horses, variety, market ===================== */
function vnoise(x,y,s,seed){const fx=x/s,fy=y/s,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,sm=q=>q*q*(3-2*q),h=(a,b)=>hs((a*374761+b*668265+seed*1013)&0x7fffffff);const a=h(x0,y0),b=h(x0+1,y0),c=h(x0,y0+1),d=h(x0+1,y0+1),u=sm(tx),v=sm(ty);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function mixHex(a,b,t){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16),m=(s)=>Math.round(((pa>>s)&255)*(1-t)+((pb>>s)&255)*t);return'#'+((1<<24)|(m(16)<<16)|(m(8)<<8)|m(0)).toString(16).slice(1)}
function tcolSet(i){const t=S.tiles[i];if(t===WATER||t===BRIDGE){tcol[i]=null;return}
 const x=i%W,y=i/W|0,e=k=>ELEV[k]||0,gx=e(y*W+Math.min(W-1,x+1))-e(y*W+Math.max(0,x-1)),gy=e(Math.min(H-1,y+1)*W+x)-e(Math.max(0,y-1)*W+x);
 const sh=Math.max(.75,Math.min(1.25,1+(gx+gy*.35)*2.6)),n1=vnoise(x,y,9,1),n2=vnoise(x,y,3.5,2),v=(.9+n1*.15+(n2-.5)*.05)*sh*(1-(ELEV[i]||0)*.06);
 const base=t===SAND?mixHex('#dcc287','#e6d29c',n2):t===GRASS?mixHex(mixHex('#7c9f47','#93ae55',vnoise(x,y,13,3)),'#a3a95a',Math.max(0,vnoise(x,y,17,4)-.6)*1.2):t===FOREST?mixHex('#5f8a3c','#6f9644',n2):'#9a8f78';
 tcol[i]=shade(base,Math.round(v*100)/100)}
const GBLOB=['rgba(105,150,58,.22)','rgba(150,172,82,.2)','rgba(78,118,46,.2)','rgba(176,178,98,.16)','rgba(120,160,70,.18)'];

/* clay pits dug down into the ground: walls on the far side, a wet floor, terraces, planks */
function clayPit(i,x,y,sx,sy,hw,hh,z){const v=RVw(x,y),isC=(a,b)=>{const m=RU(a,b);return inb(m[0],m[1])&&DECO[m[1]*W+m[0]]===CLAY};
 const ul=isC(v[0]-1,v[1]),ur=isC(v[0],v[1]-1),dr=isC(v[0]+1,v[1]),dl=isC(v[0],v[1]+1),dp=hh*(.85+hs(i*3)*.3);
 const L_=[sx-hw,sy],T=[sx,sy-hh],R_=[sx+hw,sy],Bt=[sx,sy+hh];ctx.save();ctx.beginPath();ctx.moveTo(...L_);ctx.lineTo(...T);ctx.lineTo(...R_);ctx.lineTo(...Bt);ctx.closePath();ctx.clip();
 ctx.fillStyle=mixHex('#74492f','#8e5e3c',vnoise(x,y,4,5));ctx.fillRect(sx-hw,sy-hh,2*hw,2*hh);
 if(hs(i*7)<.22){ctx.fillStyle='rgba(120,140,150,.55)';ctx.beginPath();ctx.ellipse(sx+(hs(i*5)-.5)*hw*.6,sy+hh*.25,hw*(.25+hs(i*9)*.25),hh*(.15+hs(i*11)*.12),0,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(sx+(hs(i*5)-.5)*hw*.6-hw*.08,sy+hh*.2,hw*.08,hh*.04,0,0,7);ctx.fill()}
 ctx.strokeStyle='rgba(60,38,22,.35)';ctx.lineWidth=Math.max(.5,z*.6);ctx.beginPath();for(let k=0;k<4;k++){const yy=sy-hh*.2+k*hh*.25+hs(i+k)*hh*.1;ctx.moveTo(sx-hw*.5+hs(i*13+k)*hw*.3,yy);ctx.lineTo(sx+hw*.1+hs(i*17+k)*hw*.4,yy+hh*.06)}ctx.stroke();
 const wall=(a,b,col,steps)=>{const g2=ctx.createLinearGradient(0,a[1],0,a[1]+dp);g2.addColorStop(0,shade(col,1.12));g2.addColorStop(1,shade(col,.78));ctx.fillStyle=g2;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(b[0],b[1]+dp);ctx.lineTo(a[0],a[1]+dp);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(50,30,18,.35)';ctx.lineWidth=Math.max(.4,z*.5);ctx.beginPath();for(let k=1;k<=steps;k++){const f=k/(steps+1),o=dp*f;ctx.moveTo(a[0],a[1]+o);ctx.lineTo(b[0],b[1]+o)}ctx.stroke();
  ctx.strokeStyle='rgba(20,12,6,.35)';ctx.lineWidth=Math.max(.6,z*.8);ctx.beginPath();ctx.moveTo(a[0],a[1]+dp);ctx.lineTo(b[0],b[1]+dp);ctx.stroke();
  ctx.fillStyle='rgba(70,110,40,.85)';for(let k=0;k<6;k++){const f=(k+.5)/6,px=a[0]+(b[0]-a[0])*f,py=a[1]+(b[1]-a[1])*f;ctx.beginPath();ctx.moveTo(px-2*z,py);ctx.lineTo(px,py+(2+hs(i+k*3)*3)*z);ctx.lineTo(px+2*z,py);ctx.fill()}};
 if(!ul)wall(L_,T,'#9a6a44',2);if(!ur)wall(T,R_,'#b07a4e',2);
 if(!ul&&!ur){ctx.fillStyle='#8a5c3a';ctx.beginPath();ctx.moveTo(T[0]-hw*.08,T[1]);ctx.lineTo(T[0]+hw*.08,T[1]);ctx.lineTo(T[0],T[1]+dp);ctx.fill()}
 if(z>=.5&&hs(i*19)<.1&&(!ul||!ur)){ctx.strokeStyle='#8a6a44';ctx.lineWidth=Math.max(1,z*2.2);ctx.beginPath();const a=!ul?[sx-hw*.55,sy-hh*.45]:[sx+hw*.55,sy-hh*.45];ctx.moveTo(...a);ctx.lineTo(sx-hw*.05,sy+hh*.15+dp*.2);ctx.stroke();ctx.strokeStyle='rgba(40,25,10,.4)';ctx.lineWidth=Math.max(.4,z*.4);ctx.stroke()}
 if(z>=.6&&hs(i*23)<.07){const bx=sx+hw*.15,by=sy+hh*.35;ctx.fillStyle='#5a4028';ctx.beginPath();ctx.moveTo(bx-4*z,by-3*z);ctx.lineTo(bx+4*z,by-3*z);ctx.lineTo(bx+3*z,by);ctx.lineTo(bx-3*z,by);ctx.fill();ctx.fillStyle='#8a5c3a';ctx.beginPath();ctx.ellipse(bx,by-3*z,3.5*z,1.2*z,0,0,7);ctx.fill();ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.5,z*.6);ctx.beginPath();ctx.arc(bx+4.5*z,by-.5*z,1.2*z,0,7);ctx.moveTo(bx-4*z,by-2.5*z);ctx.lineTo(bx-7*z,by-1*z);ctx.stroke()}
 ctx.restore();
 ctx.strokeStyle='rgba(45,30,18,.55)';ctx.lineWidth=Math.max(.6,z*.9);ctx.beginPath();if(!ul){ctx.moveTo(...L_);ctx.lineTo(...T)}if(!ur){ctx.moveTo(...T);ctx.lineTo(...R_)}if(!dr){ctx.moveTo(...R_);ctx.lineTo(...Bt)}if(!dl){ctx.moveTo(...Bt);ctx.lineTo(...L_)}ctx.stroke();
 ctx.strokeStyle='rgba(150,120,80,.5)';ctx.lineWidth=Math.max(.8,z*1.4);ctx.beginPath();if(!dr){ctx.moveTo(R_[0],R_[1]-1);ctx.lineTo(Bt[0],Bt[1]-1)}if(!dl){ctx.moveTo(Bt[0],Bt[1]-1);ctx.lineTo(L_[0],L_[1]-1)}ctx.stroke()}

let CLAYF=null,CLAYGV=-1;
function clayField(){if(CLAYF&&CLAYGV===GV)return CLAYF;CLAYGV=GV;const a=new Float32Array(W*H);for(let i=0;i<W*H;i++)a[i]=DECO[i]===CLAY&&!(S.b[i]&&S.b[i].t!=='road')?1:0;const b=new Float32Array(W*H);
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let s_=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const w=dx||dy?(dx&&dy?.5:1):2;s_+=a[(y+dy)*W+x+dx]*w;n+=w}b[y*W+x]=s_/n}return CLAYF=b}
function drawClayPits(hw,hh,z){const F=clayField(),lv=.5,floor=new Path2D(),segs=[];let any=false;
 visTiles(gM,(x,y)=>{if(x<1||y<1||x>=W-2||y>=H-2)return;const c=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]],v=c.map(([a,b])=>F[b*W+a]);if(v.every(q=>q<=lv))return;any=true;
  const pl=[],cut=[];for(let k=0;k<4;k++){const p=c[k],q=c[(k+1)%4],vp=v[k],vq=v[(k+1)%4];if(vp>lv)pl.push(p);if((vp>lv)!==(vq>lv)){const t_=(lv-vp)/(vq-vp),ip=[p[0]+(q[0]-p[0])*t_,p[1]+(q[1]-p[1])*t_];pl.push(ip);cut.push(ip)}}
  if(pl.length>2){pl.forEach((p,k)=>{const P_=scr(p[0],p[1]);k?floor.lineTo(P_[0],P_[1]):floor.moveTo(P_[0],P_[1])});floor.closePath()}
  const gx=(v[1]+v[2])-(v[0]+v[3]),gy=(v[2]+v[3])-(v[0]+v[1]);for(let k=0;k+1<cut.length;k+=2)segs.push([cut[k],cut[k+1],gx,gy])});
 if(!any)return;const dp=hh*1.05;
 ctx.fillStyle='#835538';ctx.fill(floor);ctx.strokeStyle='#835538';ctx.lineWidth=1;ctx.stroke(floor);
 ctx.save();ctx.clip(floor);
 if(z>=.3){ctx.strokeStyle='rgba(60,38,22,.22)';ctx.lineWidth=Math.max(.5,z*.6);ctx.beginPath();visTiles(gM,(x,y)=>{if(F[y*W+x]<.7)return;const i=y*W+x,[sx,sy]=scr(x,y);for(let k=0;k<2;k++){const yy=sy-hh*.3+k*hh*.5+hs(i+k)*hh*.2;ctx.moveTo(sx-hw*.45+hs(i*13+k)*hw*.3,yy);ctx.lineTo(sx+hw*.1+hs(i*17+k)*hw*.35,yy+hh*.05)}});ctx.stroke();
  visTiles(gM,(x,y)=>{const i=y*W+x;if(F[i]<.85)return;const[sx,sy]=scr(x,y);if(hs(i*7)<.12){ctx.fillStyle='rgba(118,138,150,.6)';ctx.beginPath();ctx.ellipse(sx+(hs(i*5)-.5)*hw*.5,sy,hw*(.3+hs(i*9)*.3),hh*(.18+hs(i*11)*.12),0,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.ellipse(sx+(hs(i*5)-.5)*hw*.5-hw*.1,sy-hh*.04,hw*.09,hh*.04,0,0,7);ctx.fill()}
   if(z>=.6&&hs(i*23)<.05){const bx=sx,by=sy;ctx.fillStyle='#5a4028';ctx.beginPath();ctx.moveTo(bx-4*z,by-3*z);ctx.lineTo(bx+4*z,by-3*z);ctx.lineTo(bx+3*z,by);ctx.lineTo(bx-3*z,by);ctx.fill();ctx.fillStyle='#8a5c3a';ctx.beginPath();ctx.ellipse(bx,by-3*z,3.5*z,1.2*z,0,0,7);ctx.fill();ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.5,z*.6);ctx.beginPath();ctx.arc(bx+4.5*z,by-.5*z,1.2*z,0,7);ctx.moveTo(bx-4*z,by-2.5*z);ctx.lineTo(bx-7*z,by-1*z);ctx.stroke()}})}
 for(const[p,q,gx,gy]of segs){const A=scr(p[0],p[1]),Bq=scr(q[0],q[1]),m=[(p[0]+q[0])/2,(p[1]+q[1])/2],gl=Math.hypot(gx,gy)||1,M0=scr(m[0],m[1]),M1=scr(m[0]+gx/gl*.3,m[1]+gy/gl*.3);if(M1[1]-M0[1]<=0)continue;
  const lit=(Bq[0]>A[0])===(Bq[1]>A[1])?1.12:.86,col=shade('#a06c46',lit),top=Math.min(A[1],Bq[1]),g=ctx.createLinearGradient(0,top,0,top+dp);g.addColorStop(0,col);g.addColorStop(1,shade('#a06c46',lit*.7));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...Bq);ctx.lineTo(Bq[0],Bq[1]+dp);ctx.lineTo(A[0],A[1]+dp);ctx.closePath();ctx.fill();
  if(z>=.35){ctx.strokeStyle='rgba(50,30,18,.3)';ctx.lineWidth=Math.max(.4,z*.5);ctx.beginPath();for(const f of[.35,.68]){ctx.moveTo(A[0],A[1]+dp*f);ctx.lineTo(Bq[0],Bq[1]+dp*f)}ctx.stroke();ctx.fillStyle='rgba(70,110,40,.85)';for(let k=0;k<3;k++){const f=(k+.5)/3,px=A[0]+(Bq[0]-A[0])*f,py=A[1]+(Bq[1]-A[1])*f;ctx.beginPath();ctx.moveTo(px-2*z,py);ctx.lineTo(px,py+(2+hs((p[0]*7+k)|0)*3)*z);ctx.lineTo(px+2*z,py);ctx.fill()}}
  ctx.strokeStyle='rgba(20,12,6,.3)';ctx.lineWidth=Math.max(.6,z*.8);ctx.beginPath();ctx.moveTo(A[0],A[1]+dp);ctx.lineTo(Bq[0],Bq[1]+dp);ctx.stroke()}
 ctx.restore();ctx.lineCap='round';
 for(const[p,q,gx,gy]of segs){const A=scr(p[0],p[1]),Bq=scr(q[0],q[1]),m=[(p[0]+q[0])/2,(p[1]+q[1])/2],gl=Math.hypot(gx,gy)||1,M0=scr(m[0],m[1]),M1=scr(m[0]+gx/gl*.3,m[1]+gy/gl*.3),back=M1[1]-M0[1]>0;
  ctx.strokeStyle=back?'rgba(45,30,18,.55)':'rgba(160,130,90,.6)';ctx.lineWidth=Math.max(.7,z*(back?1:1.6));ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...Bq);ctx.stroke()}}
function groundPre(hw,hh,z){visTiles(gM,(x,y)=>{const i=y*W+x,t=S.tiles[i],sx=VX(x,y)*hw+cam.x,sy=VY(x,y)*hh+cam.y+hh;if(t===WATER||t===BRIDGE){diaF(sx,sy,hw,hh,seaM&&seaM[i]?'#2a79a0':'#2d80a5');return}diaF(sx,sy,hw,hh,tcol[i])});drawShore(z);
 if(z<.25){drawClayPits(hw,hh,z);return}visTiles(gM,(x,y)=>{const i=y*W+x,t=S.tiles[i];if(t!==GRASS&&t!==FOREST&&t!==SAND)return;if(S.b[i]&&S.b[i].t==='road')return;const sx=VX(x,y)*hw+cam.x,sy=VY(x,y)*hh+cam.y+hh;
  if(DECO[i]===CLAY)return;
  if(t===SAND){ctx.fillStyle='rgba(255,245,210,.25)';ctx.beginPath();ctx.ellipse(sx+(hs(i*3)-.5)*hw,sy+(hs(i*5)-.5)*hh,hw*.5,hh*.35,0,0,7);ctx.fill();return}
  for(let k=0;k<3;k++){const r1=hs(i*7+k*131),r2=hs(i*11+k*71),r3=hs(i*13+k*37);ctx.fillStyle=GBLOB[(r3*GBLOB.length)|0];ctx.beginPath();ctx.ellipse(sx+(r1-.5)*hw*1.15,sy+(r2-.5)*hh*1.15,hw*(.38+r3*.4),hh*(.32+r1*.34),0,0,7);ctx.fill()}
  if(z>=.6){ctx.strokeStyle='rgba(55,85,28,.38)';ctx.lineWidth=Math.max(.5,z*.55);ctx.beginPath();for(let k=0;k<6;k++){const gx=sx+(hs(i*17+k)-.5)*hw*1.5,gy=sy+(hs(i*19+k)-.5)*hh*1.5;ctx.moveTo(gx,gy);ctx.lineTo(gx-1.1*z,gy-2.8*z);ctx.moveTo(gx,gy);ctx.lineTo(gx+.9*z,gy-2.4*z);ctx.moveTo(gx,gy);ctx.lineTo(gx+.1*z,gy-3.2*z)}ctx.stroke();
   if(hs(i*23)<.25){const fx=sx+(hs(i*29)-.5)*hw,fy=sy+(hs(i*31)-.5)*hh,fc=['#f4f1ea','#e8c547','#d98ab0','#c9d8f0'][(hs(i*37)*4)|0];for(let k=0;k<4;k++){ctx.fillStyle=fc;ctx.beginPath();ctx.arc(fx+(hs(i*41+k)-.5)*6*z,fy+(hs(i*43+k)-.5)*3*z,.9*z,0,7);ctx.fill()}}}})}
/* cast-iron gas lamps */
function drawLamps(){if(!S||Z<.35)return;if(LAMPK!==GV){LAMPK=GV;LAMPS=[];for(const o of S.list){if(o.t!=='road')continue;const i=o.y*W+o.x;if(ZONE[i]>1)continue;const nb=roadNb(i).length;if(nb>=3&&hs(i*5)<.7)LAMPS.push([o.x,o.y])}}
 const z=Z*1.1,lit=monthOf(S.t)>=9||monthOf(S.t)<=2;for(const[x,y]of LAMPS){const[sx0,sy0]=scr(x+.42,y+.42),sx=sx0,sy=sy0;if(sx<-20||sx>vw+20||sy<-50||sy>vh+20)continue;
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+3*z,sy+.6*z,4*z,1*z,0,0,7);ctx.fill();
  ctx.fillStyle='#22262a';ctx.beginPath();ctx.moveTo(sx-1.3*z,sy);ctx.lineTo(sx+1.3*z,sy);ctx.lineTo(sx+.8*z,sy-2.2*z);ctx.lineTo(sx-.8*z,sy-2.2*z);ctx.fill();
  ctx.fillStyle='#2a2f34';ctx.beginPath();ctx.moveTo(sx-.55*z,sy-2.2*z);ctx.lineTo(sx+.55*z,sy-2.2*z);ctx.lineTo(sx+.32*z,sy-15*z);ctx.lineTo(sx-.32*z,sy-15*z);ctx.fill();
  ctx.fillStyle='#3a4046';ctx.fillRect(sx-.7*z,sy-6*z,1.4*z,.6*z);ctx.fillRect(sx-1.6*z,sy-14.6*z,3.2*z,.5*z);
  const gy=sy-15.2*z;ctx.fillStyle=lit?'rgba(255,214,130,.95)':'rgba(222,226,214,.85)';ctx.beginPath();ctx.moveTo(sx-1.2*z,gy);ctx.lineTo(sx+1.2*z,gy);ctx.lineTo(sx+1.7*z,gy-3.4*z);ctx.lineTo(sx-1.7*z,gy-3.4*z);ctx.fill();
  ctx.strokeStyle='#22262a';ctx.lineWidth=Math.max(.4,.3*z);ctx.beginPath();ctx.moveTo(sx,gy);ctx.lineTo(sx,gy-3.4*z);ctx.stroke();
  ctx.fillStyle='#22262a';ctx.beginPath();ctx.moveTo(sx-2*z,gy-3.4*z);ctx.lineTo(sx+2*z,gy-3.4*z);ctx.lineTo(sx,gy-5.2*z);ctx.fill();ctx.fillRect(sx-.25*z,gy-6.2*z,.5*z,1*z);
  if(lit){const g=ctx.createRadialGradient(sx,gy-1.7*z,0,sx,gy-1.7*z,9*z);g.addColorStop(0,'rgba(255,205,120,.35)');g.addColorStop(1,'rgba(255,205,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,gy-1.7*z,9*z,0,7);ctx.fill()}}}
/* dormers that sit on the roof slope */
function nyDormer(e0,e1,t0,t1,f,w,t,col){const lp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u],b0=lp(e0,t0,f),b1=lp(e1,t1,f),dh=.24*t,mid=lp(b0,b1,.5);
 poly([b0[0],b0[1],b1[0],b1[1],b1[0],b1[1]-dh,b0[0],b0[1]-dh],col);const i0=lp(b0,b1,.22),i1=lp(b0,b1,.78);poly([i0[0],i0[1]-.05*t,i1[0],i1[1]-.05*t,i1[0],i1[1]-dh*.82,i0[0],i0[1]-dh*.82],'#2c3a44');
 ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(i0[0],i0[1]-dh*.82);ctx.lineTo(i1[0],i1[1]-dh*.82);ctx.lineTo(lp(i0,i1,.5)[0],lp(i0,i1,.5)[1]-dh*.5);ctx.fill();
 poly([b0[0]-(b1[0]-b0[0])*.08,b0[1]-dh-(b1[1]-b0[1])*.08,b1[0]+(b1[0]-b0[0])*.08,b1[1]-dh+(b1[1]-b0[1])*.08,mid[0],mid[1]-dh-.2*t],'#3a4248')}
function nyMansard(F,h,t,dcol){const A=F.L(0,h+.05*t),B=F.L(1,h+.05*t),C=F.R(1,h+.05*t),inset=.2,top=h+.6*t,Ai=F.L(inset,top),Bi=F.L(1-inset*.55,top),Ci=F.R(1-inset,top);
 poly([A[0],A[1],B[0],B[1],Bi[0],Bi[1],Ai[0],Ai[1]],'#4f5a63');poly([B[0],B[1],C[0],C[1],Ci[0],Ci[1],Bi[0],Bi[1]],'#3f4850');
 ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();for(let k=1;k<4;k++){const u=k/4,p=[A[0]+(Ai[0]-A[0])*u,A[1]+(Ai[1]-A[1])*u],q=[B[0]+(Bi[0]-B[0])*u,B[1]+(Bi[1]-B[1])*u];ctx.moveTo(...p);ctx.lineTo(...q)}ctx.stroke();
 const lp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u],nL=3,nR=2;
 for(let k=0;k<nL;k++){const s0=(k+.3)/nL,s1=(k+.7)/nL;nyDormer(lp(A,B,s0),lp(A,B,s1),lp(Ai,Bi,s0),lp(Ai,Bi,s1),.18,0,t,dcol)}
 for(let k=0;k<nR;k++){const s0=(k+.3)/nR,s1=(k+.7)/nR;nyDormer(lp(B,C,s0),lp(B,C,s1),lp(Bi,Ci,s0),lp(Bi,Ci,s1),.18,0,t,shade(dcol,.85))}
 ctx.strokeStyle='#2a2f34';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(...Ai);ctx.lineTo(...Bi);ctx.lineTo(...Ci);ctx.stroke()}
function nyGable(x,y,ax,ay,h,t,t2,wall,roof){const P=(u,v,hh)=>[x+(u-v)*t,y+(u+v)*t2-hh],rh=Math.min(ax,ay)*1.1*t+.2*t,A=P(-ax,ay,h),B=P(ax,ay,h),C=P(ax,-ay,h),Rl=P(-ax,0,h+rh),Rr=P(ax,0,h+rh);
 poly([...A,...B,...Rr,...Rl],roof);poly([...B,...C,...Rr],wall);ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(...Rl);ctx.lineTo(...Rr);ctx.stroke();
 const n=Math.max(1,Math.round(ax*2.4)),lp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];for(let k=0;k<n;k++){const s0=(k+.38)/n,s1=(k+.62)/n;nyDormer(lp(A,B,s0),lp(A,B,s1),lp(Rl,Rr,s0),lp(Rl,Rr,s1),.22,0,t,'#e3d8c0')}
 ctx.fillStyle='#2c3a44';const g=lp(lp(B,C,.5),Rr,.45);ctx.fillRect(g[0]-.06*t,g[1]-.1*t,.12*t,.14*t);
 const ch=lp(Rl,Rr,.2);ctx.fillStyle='#7e3a2a';ctx.fillRect(ch[0]-.06*t,ch[1]-.35*t,.12*t,.35*t)}
function nySign(F,h,t,r){const words=['OYSTERS','DRY GOODS','HATS','TOBACCO','PIANOS','SOAP','BAKERY','HARDWARE','SHOES','COFFEE','CIGARS','LAGER'],w=words[(r()*words.length)|0],P=F.R,a=P(.12,h*.82),b=P(.88,h*.82),c=P(.12,h*.55);
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.restore();const dx=b[0]-a[0],dy=b[1]-a[1],L_=Math.hypot(dx,dy)||1,hh=a[1]-c[1];ctx.save();ctx.translate(a[0],a[1]);ctx.transform(dx/L_,dy/L_,0,1,0,0);
 ctx.fillStyle='rgba(240,232,210,.18)';ctx.fillRect(0,0,L_,hh);ctx.fillStyle='rgba(248,242,228,.55)';ctx.font=`bold ${Math.max(4,hh*.55)}px Georgia, serif`;ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(w,L_/2,hh*.5,L_*.92);ctx.restore()}
const NYTINT=['rgba(140,60,30,.13)','rgba(50,35,25,.16)','rgba(210,180,120,.14)','rgba(80,100,125,.1)','rgba(170,90,60,.12)','rgba(120,140,90,.08)',null,null,null];
/* ships, built in 3D from the hull up */
function OLD_drawShip(cx_,cy_,gdx,gdy,len,type){const l=Math.hypot(gdx,gdy)||1;gdx/=l;gdy/=l;const px=-gdy,py=gdx,t=32*Z,bm=type==='ferry'?.32:type==='tug'?.24:.2;
 const P=(u,v,h)=>{const[sx,sy]=scr(cx_+gdx*u*len+px*v*len,cy_+gdy*u*len+py*v*len);return[sx,sy-h*t]};
 const out=type==='ferry'?[[-.5,-bm],[.5,-bm],[.55,0],[.5,bm],[-.5,bm],[-.55,0]]:[[-.5,-bm*.85],[-.1,-bm],[.3,-bm*.8],[.5,0],[.3,bm*.8],[-.1,bm],[-.5,bm*.85]];
 const hd=type==='tug'?.28:type==='ferry'?.3:.24,hc=type==='ship'?'#1f1c1a':type==='steamer'?'#24201e':type==='tug'?'#6e2620':type==='ferry'?'#e8e0cc':type==='schooner'?'#2f2a26':'#efe9dc';
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();out.forEach(([u,v],k)=>{const[a,b]=P(u*1.04,v*1.2,0);k?ctx.lineTo(a+2,b+2):ctx.moveTo(a+2,b+2)});ctx.fill();
 for(let k=0;k<out.length;k++){const a=out[k],b=out[(k+1)%out.length],A0=P(a[0],a[1],0),B0=P(b[0],b[1],0),A1=P(a[0],a[1],hd),B1=P(b[0],b[1],hd);if((B0[0]-A0[0])*1<0&&B0[1]-A0[1]<0)continue;
  poly([...A0,...B0,...B1,...A1],k%2?hc:shade(hc,.85));if(type!=='ferry')poly([...A1,...B1,B1[0],B1[1]+.05*t,A1[0],A1[1]+.05*t],type==='ship'?'#c9a227':'#f4f1ea')}
 ctx.fillStyle=type==='ferry'?'#f4f1ea':'#a08060';ctx.beginPath();out.forEach(([u,v],k)=>{const[a,b]=P(u,v,hd);k?ctx.lineTo(a,b):ctx.moveTo(a,b)});ctx.fill();
 ctx.strokeStyle='rgba(60,40,20,.35)';ctx.lineWidth=Math.max(.3,Z*.3);ctx.beginPath();for(let u=-.4;u<.4;u+=.12){const a=P(u,-bm*.8,hd),b=P(u,bm*.8,hd);ctx.moveTo(...a);ctx.lineTo(...b)}ctx.stroke();
 const mast=(u,mh,yards)=>{const b=P(u,0,hd),top=[b[0],b[1]-mh*t];ctx.strokeStyle='rgba(50,40,30,.55)';ctx.lineWidth=Math.max(.3,Z*.25);ctx.beginPath();for(const s of[-1,1]){const d=P(u-.04,s*bm,hd);ctx.moveTo(...top);ctx.lineTo(...d)}ctx.stroke();
  ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.6,t*.045);ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(...top);ctx.stroke();
  for(let k=0;k<yards;k++){const hy=mh*(.38+k*.2),ww=bm*(1.25-k*.18),a=P(u,-ww,hd+hy),c=P(u,ww,hd+hy);ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.stroke();ctx.strokeStyle='rgba(244,238,222,.95)';ctx.lineWidth=Math.max(.8,t*.07);ctx.beginPath();ctx.moveTo(a[0],a[1]+.03*t);ctx.lineTo(c[0],c[1]+.03*t);ctx.stroke()}return top};
 if(type==='ship'){const tops=[mast(-.28,2.3,3),mast(.02,2.6,3),mast(.3,2.2,3)];const bw=P(.5,0,hd),bs=P(.78,0,hd+.35);ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.5,t*.035);ctx.beginPath();ctx.moveTo(...bw);ctx.lineTo(...bs);ctx.stroke();ctx.strokeStyle='rgba(50,40,30,.5)';ctx.lineWidth=Math.max(.3,Z*.25);ctx.beginPath();ctx.moveTo(...bs);ctx.lineTo(...tops[2]);ctx.moveTo(...tops[0]);ctx.lineTo(...tops[1]);ctx.lineTo(...tops[2]);ctx.stroke();
  const st=P(-.5,0,hd+.1),wv=Math.sin(performance.now()/350)*.04*t;ctx.fillStyle='#b8322a';ctx.fillRect(st[0]-.3*t,st[1]-.25*t+wv,.3*t,.18*t);ctx.fillStyle='#f4f1ea';ctx.fillRect(st[0]-.3*t,st[1]-.19*t+wv,.3*t,.05*t)}
 else if(type==='schooner'||type==='sloop'){const top=mast(type==='schooner'?-.05:.05,type==='schooner'?2:1.5,0);const ax=type==='schooner'?.22:.1;const a=P(-.42,0,hd+.2),b=P(.05,0,hd+.15),f=P(.5,0,hd+.1);
  ctx.fillStyle='rgba(248,244,232,.95)';ctx.beginPath();ctx.moveTo(top[0],top[1]+.1*t);ctx.lineTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.fill();ctx.fillStyle='rgba(236,230,214,.95)';ctx.beginPath();ctx.moveTo(top[0],top[1]+.15*t);ctx.lineTo(f[0],f[1]);ctx.lineTo(b[0]+.1*t,b[1]);ctx.fill();if(type==='schooner')mast(-.3,1.7,0)}
 else{const box=(u0,u1,w,h0,h1,c)=>{const a=P(u0,-w,h0),b=P(u1,-w,h0),c2=P(u1,w,h0),d=P(u0,w,h0),a1=P(u0,-w,h1),b1=P(u1,-w,h1),c1=P(u1,w,h1),d1=P(u0,w,h1);poly([...d,...c2,...c1,...d1],shade(c,.9));poly([...b,...c2,...c1,...b1],shade(c,.78));poly([...a1,...b1,...c1,...d1],c)};
  if(type==='ferry'){box(-.42,.42,bm*.85,hd,hd+.35,'#f4f1ea');box(-.3,.3,bm*.6,hd+.35,hd+.6,'#efe7d6')}else box(-.25,type==='tug'?.15:.2,bm*.7,hd,hd+.3,'#efe3c8');
  const f=P(type==='tug'?.02:0,0,hd+(type==='ferry'?.6:.3));ctx.fillStyle=type==='steamer'?'#b8322a':'#1d1b1a';ctx.fillRect(f[0]-.09*t,f[1]-.7*t,.18*t,.7*t);ctx.fillStyle='#1d1b1a';ctx.fillRect(f[0]-.1*t,f[1]-.75*t,.2*t,.12*t);
  if(type!=='ferry'||true){ctx.fillStyle='rgba(90,90,90,.35)';for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(f[0]-gdx*j*.3*t,f[1]-.95*t-j*.25*t,(.14+j*.08)*t,0,7);ctx.fill()}}
  if(type==='steamer'){mast(-.35,1.6,1);mast(.35,1.6,1)}}}
/* horses that look like horses */
function OLD_drawHorse(x,y,ux,uy,z0,col,ph){const z=z0*1.35,s=ux>=0?1:-1,g=Math.sin(ph),g2=Math.sin(ph+Math.PI),dark=shade(col,.62),light=shade(col,1.15);
 ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x+1.5*z,y+.4*z,4*z,1.1*z,0,0,7);ctx.fill();
 const leg=(lx,sw,c)=>{ctx.strokeStyle=c;ctx.lineWidth=Math.max(.6,.75*z);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+lx*z,y-2*z);ctx.quadraticCurveTo(x+(lx+sw*.3)*z,y-1*z,x+(lx+sw*.7)*z,y-.1*z);ctx.stroke();ctx.fillStyle='#1d1b1a';ctx.fillRect(x+(lx+sw*.7)*z-.4*z,y-.35*z,.8*z,.4*z)};
 leg(-1.7*s,g*s,dark);leg(1.5*s,g2*s,dark);
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-2.6*s*z,y-2.4*z);ctx.bezierCurveTo(x-2.9*s*z,y-4.2*z,x-1*s*z,y-4.3*z,x+.5*s*z,y-4*z);ctx.bezierCurveTo(x+2*s*z,y-4.2*z,x+2.8*s*z,y-3.6*z,x+2.6*s*z,y-2.3*z);ctx.bezierCurveTo(x+1.2*s*z,y-1.6*z,x-1.2*s*z,y-1.6*z,x-2.6*s*z,y-2.4*z);ctx.fill();
 ctx.fillStyle=light;ctx.beginPath();ctx.ellipse(x-.2*s*z,y-3.8*z,1.8*z,.35*z,0,0,7);ctx.fill();
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x+1.9*s*z,y-3.7*z);ctx.quadraticCurveTo(x+2.6*s*z,y-5.4*z,x+3.1*s*z,y-6.2*z);ctx.lineTo(x+3.9*s*z,y-5.8*z);ctx.quadraticCurveTo(x+3.4*s*z,y-4.6*z,x+2.7*s*z,y-2.8*z);ctx.fill();
 ctx.beginPath();ctx.ellipse(x+3.9*s*z,y-5.5*z,1.25*z,.55*z,s*.55,0,7);ctx.fill();ctx.fillStyle=dark;ctx.beginPath();ctx.moveTo(x+3.15*s*z,y-6.3*z);ctx.lineTo(x+3.35*s*z,y-7*z);ctx.lineTo(x+3.55*s*z,y-6.2*z);ctx.fill();
 ctx.strokeStyle=dark;ctx.lineWidth=Math.max(.6,.6*z);ctx.beginPath();ctx.moveTo(x+3*s*z,y-6.2*z);ctx.quadraticCurveTo(x+2.2*s*z,y-5.2*z,x+1.8*s*z,y-3.9*z);ctx.stroke();
 ctx.beginPath();ctx.moveTo(x-2.6*s*z,y-3.6*z);ctx.quadraticCurveTo(x-3.5*s*z,y-3.2*z+g*.2*z,x-3.2*s*z,y-1.7*z);ctx.stroke();
 ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.4,.35*z);ctx.beginPath();ctx.ellipse(x+2.3*s*z,y-3.6*z,.5*z,.9*z,s*.4,0,7);ctx.moveTo(x+2*s*z,y-3.2*z);ctx.lineTo(x-1.5*s*z,y-3.3*z);ctx.moveTo(x+4.4*s*z,y-5.3*z);ctx.lineTo(x+1.9*s*z,y-3.3*z);ctx.stroke();
 leg(-2.1*s,g2*s,col);leg(1.9*s,g*s,col)}
/* the market with love */
function drawMarket(cx,cy,hw,hh,o){const t=hw/4,t2=hh/4,S_=(u,v,h=0)=>[cx+(u-v)*t,cy+(u+v)*t2-h],tx=t>=4.5;
 poly([...S_(-1.9,-1.9),...S_(1.9,-1.9),...S_(1.9,1.9),...S_(-1.9,1.9)],'#cfc4ad');
 if(tx){ctx.strokeStyle='rgba(120,105,85,.25)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();for(let k=-7;k<=7;k++){const a=S_(k*.26,-1.9),b=S_(k*.26,1.9),c=S_(-1.9,k*.26),d=S_(1.9,k*.26);ctx.moveTo(...a);ctx.lineTo(...b);ctx.moveTo(...c);ctx.lineTo(...d)}ctx.stroke()}
 if(o&&o.up2){prismTex(cx,cy,1.7,1.2,1.4*t,4,2,'#9fb7c2',.5*t,t,t2,tx);const F=nyFace(cx,cy,1.7,1.2,t,t2);nyMansard(F,1.4*t,t,'#efe7d6');
  for(const f of['L','R']){const P=F[f],n=f==='L'?5:4;for(let k=0;k<n;k++){const s=(k+.5)/n,a=P(s-.06,0),b=P(s+.06,0);ctx.fillStyle='#2a2c30';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-.6*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-.95*t,b[0],b[1]-.6*t);ctx.lineTo(...b);ctx.fill()}}
  const[ax,ay]=S_(0,0,2.1*t);ctx.fillStyle='#ece3cf';ctx.fillRect(ax-.25*t,ay-.7*t,.5*t,.7*t);ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.arc(ax,ay-.4*t,.15*t,0,7);ctx.fill();ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(ax,ay-.4*t);ctx.lineTo(ax,ay-.5*t);ctx.moveTo(ax,ay-.4*t);ctx.lineTo(ax+.07*t,ay-.38*t);ctx.stroke();
  ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.ellipse(ax,ay-.7*t,.3*t,.42*t,0,Math.PI,0);ctx.fill();if(tx)skyFlag(ax,ay-1.1*t,t);return}
 // the market house at the back: brick, arched windows, cupola with a clock
 const[px,py]=S_(-1.15,-1.15);prismTex(px,py,.7,.6,1.15*t,1,2,'#5f8e7c',.4*t,t,t2,tx);
 if(tx){const F=nyFace(px,py,.7,.6,t,t2);for(const f of['L','R']){nyBand(F,f,1.05*t,1.15*t,'#efe7d6',.04)}const[qx,qy]=S_(-1.15,-1.15,1.55*t);ctx.fillStyle='#efe7d6';ctx.fillRect(qx-.14*t,qy-.42*t,.28*t,.42*t);ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.arc(qx,qy-.22*t,.09*t,0,7);ctx.fill();ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.3,t*.015);ctx.stroke();ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.ellipse(qx,qy-.42*t,.18*t,.26*t,0,Math.PI,0);ctx.fill();skyFlag(qx,qy-.68*t,t*.8)}
 const aw=[['#b8322a','#f4f1ea'],['#2f6f5e','#f4f1ea'],['#3d5a8a','#f4f1ea'],['#c9a227','#7a3b2e'],['#6b2f4a','#f4f1ea']],spots=[];
 for(const u of[-1.25,0,1.25])for(const v of[-1.25,0,1.25])if(!(u===-1.25&&v===-1.25)&&!(u===0&&v===0))spots.push([u,v]);spots.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
 const goods=[['#d9483a','#c93a2e','#e85a44'],['#e8c547','#d9b23a','#f0d860'],['#6b8f3a','#5a7e30','#7aa046'],['#c9782a','#e08a3a','#b86a22'],['#8a4a7a','#6b3a6a','#a05a8a'],['#efe7d6','#d9cdb1','#c9b99a']];
 let k=0;for(const[u,v]of spots){const[x,y]=S_(u,v),c=aw[(k)%aw.length],w=t*.48,h=t*.42;k++;
  poly([x-w,y,x,y+w*.5,x,y+w*.5-h*.45,x-w,y-h*.45],'#8a6440');poly([x,y+w*.5,x+w,y,x+w,y-h*.45,x,y+w*.5-h*.45],'#6e4e30');poly([x-w,y-h*.45,x,y-h*.45+w*.5,x+w,y-h*.45,x,y-h*.45-w*.5],'#a07a50');
  if(tx){const gd=goods[(k*3)%goods.length];for(let i=0;i<7;i++){const gx=x-w*.55+(i%4)*w*.32+(i>3?w*.15:0),gy=y-h*.5+(i>3?w*.12:0);ctx.fillStyle=gd[i%3];ctx.beginPath();ctx.arc(gx,gy,t*.055,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(gx-t*.015,gy-t*.02,t*.018,0,7);ctx.fill()}
   ctx.strokeStyle='#4a3420';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(x-w*.95,y-h*.45);ctx.lineTo(x-w*.95,y-h*1.1);ctx.moveTo(x+w*.95,y-h*.45);ctx.lineTo(x+w*.95,y-h*1.1);ctx.stroke()}
  for(let s=0;s<5;s++){const f0=s/5,f1=(s+1)/5,A=[x-w*1.15+w*1.15*f0,y-h*1.1+w*.58*f0],Bq=[x-w*1.15+w*1.15*f1,y-h*1.1+w*.58*f1];poly([...A,...Bq,Bq[0]+w*.62,Bq[1]-w*.62,A[0]+w*.62,A[1]-w*.62],c[s%2])}
  for(let s=0;s<5;s++){const f0=s/5,f1=(s+1)/5,A=[x+w*1.15*f0,y-h*1.1+w*.58-w*.58*f0+.0],Bq=[x+w*1.15*f1,y-h*1.1+w*.58-w*.58*f1];poly([...A,...Bq,Bq[0]-w*.55,Bq[1]-w*.62,A[0]-w*.55,A[1]-w*.62],shade(c[s%2],.82))}
  if(tx&&k%2===0){const[bx,by]=S_(u+.55,v+.35);ctx.fillStyle='#6b4a2e';ctx.beginPath();ctx.ellipse(bx,by-.12*t,.1*t,.14*t,0,0,7);ctx.fill();ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.3,t*.015);ctx.beginPath();ctx.moveTo(bx-.1*t,by-.08*t);ctx.lineTo(bx+.1*t,by-.08*t);ctx.moveTo(bx-.1*t,by-.18*t);ctx.lineTo(bx+.1*t,by-.18*t);ctx.stroke()}}
 if(tx){const[cx2,cy2]=S_(0,0);ctx.fillStyle='#8a8a86';ctx.beginPath();ctx.ellipse(cx2,cy2,.42*t,.21*t,0,0,7);ctx.fill();ctx.fillStyle='#5a8aa8';ctx.beginPath();ctx.ellipse(cx2,cy2-.03*t,.34*t,.16*t,0,0,7);ctx.fill();ctx.fillStyle='#9a9a94';ctx.fillRect(cx2-.05*t,cy2-.45*t,.1*t,.42*t);ctx.beginPath();ctx.ellipse(cx2,cy2-.45*t,.16*t,.07*t,0,0,7);ctx.fill();
  ctx.strokeStyle='rgba(220,240,255,.8)';ctx.lineWidth=Math.max(.4,t*.02);const tt=performance.now()/300;ctx.beginPath();for(const s of[-1,1]){ctx.moveTo(cx2,cy2-.5*t);ctx.quadraticCurveTo(cx2+s*.2*t,cy2-.62*t,cx2+s*.28*t,cy2-.1*t)}ctx.stroke();
  for(let i=0;i<5;i++){const a=i*1.3+.4,r=1.55,[vx,vy]=S_(Math.cos(a)*r*.75,Math.sin(a)*r*.75);drawPerson(vx,vy,t*.022,(i*7+(o?o.x:0))%PEOPLE.length)}}}

/* ===================== turning the view, the shoreline, ships with body ===================== */
let ROT=0;
function RVw(x,y){return ROT===0?[x,y]:ROT===1?[W-1-y,x]:ROT===2?[W-1-x,H-1-y]:[y,H-1-x]}
function RU(x,y){return ROT===0?[x,y]:ROT===1?[y,W-1-x]:ROT===2?[W-1-x,H-1-y]:[H-1-y,x]}
function RD(dx,dy){return ROT===0?[dx,dy]:ROT===1?[-dy,dx]:ROT===2?[-dx,-dy]:[dy,-dx]}
function VX(x,y){const v=RVw(x,y);return v[0]-v[1]}function VY(x,y){const v=RVw(x,y);return v[0]+v[1]}
function DX(dx,dy){const v=RD(dx,dy);return v[0]-v[1]}function DY(dx,dy){const v=RD(dx,dy);return v[0]+v[1]}
function FT(o,f){let best=null,bs=-1e9;for(const[x,y]of[[o.x+f-1,o.y+f-1],[o.x,o.y+f-1],[o.x+f-1,o.y],[o.x,o.y]]){const s_=VY(x,y);if(s_>bs){bs=s_;best=[x,y]}}return best}
function rotateView(d){const c=pick(vw/2,vh/2);ROT=(ROT+d+4)%4;centerOn(c.x,c.y);gGV=-1;LAMPK=-1;GV++;try{drawMini()}catch(e){}toast(['View from the south','View from the west','View from the north','View from the east'][ROT])}
/* shoreline: smooth contours over a softened land field */
let LANDF=null,LANDGV=-1;
function landField(){if(LANDF&&LANDGV===GV)return LANDF;LANDGV=GV;const a=new Float32Array(W*H);for(let i=0;i<W*H;i++)a[i]=S.tiles[i]===WATER||S.tiles[i]===BRIDGE?0:1;const b=new Float32Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s_=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const w=dx||dy?(dx&&dy?.5:1):2;s_+=a[Y*W+X]*w;n+=w}b[y*W+x]=s_/n}return LANDF=b}
function contour(lv,path,urbanPath){const F=landField();visTiles(gM,(x,y)=>{if(x>=W-1||y>=H-1)return;const a=F[y*W+x],b=F[y*W+x+1],c=F[(y+1)*W+x+1],d=F[(y+1)*W+x];const k=(a>lv?1:0)|(b>lv?2:0)|(c>lv?4:0)|(d>lv?8:0);if(k===0||k===15)return;
 const ip=(p,q,va,vb)=>{const t_=(lv-va)/((vb-va)||1e-6);return[p[0]+(q[0]-p[0])*t_,p[1]+(q[1]-p[1])*t_]},T=ip([x,y],[x+1,y],a,b),Rr=ip([x+1,y],[x+1,y+1],b,c),Bt=ip([x,y+1],[x+1,y+1],d,c),Lf=ip([x,y],[x,y+1],a,d);
 const segs={1:[[Lf,T]],2:[[T,Rr]],3:[[Lf,Rr]],4:[[Rr,Bt]],5:[[Lf,T],[Rr,Bt]],6:[[T,Bt]],7:[[Lf,Bt]],8:[[Bt,Lf]],9:[[Bt,T]],10:[[T,Rr],[Bt,Lf]],11:[[Bt,Rr]],12:[[Rr,Lf]],13:[[Rr,T]],14:[[T,Lf]]}[k];
 const pth=urbanPath&&ZONE[y*W+x]<=1&&ZONE[y*W+x]!==undefined&&(S.b[y*W+x]||S.b[y*W+x+1]||S.b[(y+1)*W+x])?urbanPath:path;for(const[p,q]of segs){const P=scr(p[0],p[1]),Q=scr(q[0],q[1]);pth.moveTo(P[0],P[1]);pth.lineTo(Q[0],Q[1])}})}
function drawShore(z){if(z<.16)return;const hw=TW/2*z,t=hw;ctx.lineCap='round';ctx.lineJoin='round';
 const sh=new Path2D();contour(.3,sh);ctx.strokeStyle='rgba(120,196,206,.28)';ctx.lineWidth=t*1.5;ctx.stroke(sh);ctx.strokeStyle='rgba(150,214,214,.3)';ctx.lineWidth=t*.8;ctx.stroke(sh);
 const sand=new Path2D(),urb=new Path2D();contour(.52,sand,urb);
 ctx.strokeStyle='#c9b27c';ctx.lineWidth=t*1.05;ctx.stroke(sand);ctx.strokeStyle='#ddc68f';ctx.lineWidth=t*.7;ctx.stroke(sand);
 ctx.strokeStyle='#8f897d';ctx.lineWidth=t*1.05;ctx.stroke(urb);ctx.strokeStyle='#a39d90';ctx.lineWidth=t*.75;ctx.stroke(urb);
 if(z>=.45){ctx.strokeStyle='rgba(60,55,48,.45)';ctx.lineWidth=Math.max(.5,t*.04);ctx.setLineDash([t*.18,t*.1]);ctx.stroke(urb);ctx.setLineDash([])}
 const foam=new Path2D();contour(.4,foam);ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(.8,t*.07);ctx.stroke(foam);
 const grass=new Path2D();contour(.72,grass);ctx.strokeStyle='rgba(120,150,70,.55)';ctx.lineWidth=t*.5;ctx.stroke(grass);
 if(z>=.5){const pb=new Path2D();contour(.47,pb);ctx.strokeStyle='rgba(140,128,110,.5)';ctx.lineWidth=Math.max(.6,t*.05);ctx.setLineDash([t*.06,t*.3]);ctx.stroke(pb);ctx.setLineDash([])}}
/* ships with body: sheer, shading, copper, gunports, rails, hatches, real rigging */
function drawShip(cx_,cy_,gdx,gdy,len,type){const l=Math.hypot(gdx,gdy)||1;gdx/=l;gdy/=l;const px=-gdy,py=gdx,t=32*Z,bm=type==='ferry'?.3:type==='tug'?.24:.19,moving=type!=='ship'&&type!=='steamer'||false;
 const sheer=u=>1+Math.pow(Math.abs(u)*2,2.2)*.35;
 const P=(u,v,h)=>{const[sx,sy]=scr(cx_+gdx*u*len+px*v*len,cy_+gdy*u*len+py*v*len);return[sx,sy-h*t]};
 const N=14,out=[];for(let k=0;k<=N;k++){const u=-.5+k/N,w=type==='ferry'?bm:bm*(u>.15?Math.sqrt(Math.max(0,1-Math.pow((u-.15)/.37,2))):u<-.42?.85+(u+.5)*1.8:1);out.push([u,-w])}for(let k=N;k>=0;k--){const[u,v]=out[k];out.push([u,-v])}
 const hd=type==='tug'?.27:type==='ferry'?.28:.24,hc=type==='ship'?'#1f1c1a':type==='steamer'?'#24201e':type==='tug'?'#6e2620':type==='ferry'?'#e8e0cc':type==='schooner'?'#2c2a28':'#efe9dc';
 ctx.fillStyle='rgba(10,30,45,.35)';ctx.beginPath();out.forEach(([u,v],k)=>{const[a,b]=P(u*1.03,v*1.25,0);k?ctx.lineTo(a,b+1.5):ctx.moveTo(a,b+1.5)});ctx.fill();
 ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(.6,Z*.7);ctx.beginPath();out.forEach(([u,v],k)=>{const[a,b]=P(u*1.06,v*1.35,0);k?ctx.lineTo(a,b):ctx.moveTo(a,b)});ctx.closePath();ctx.stroke();
 for(let k=0;k<out.length-1;k++){const a=out[k],b=out[k+1];const A0=P(a[0],a[1],0),B0=P(b[0],b[1],0),A1=P(a[0],a[1],hd*sheer(a[0])),B1=P(b[0],b[1],hd*sheer(b[0]));const nx_=(B0[1]-A0[1]),ny_=-(B0[0]-A0[0]);if(ny_<0&&Math.abs(ny_)>Math.abs(nx_)*.2)continue;
  const lit=Math.max(.6,Math.min(1.15,.85+(-nx_/(Math.hypot(nx_,ny_)||1))*.25));const g=ctx.createLinearGradient(0,A1[1],0,A0[1]);g.addColorStop(0,shade(hc,lit*1.08));g.addColorStop(1,shade(hc,lit*.72));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(...A0);ctx.lineTo(...B0);ctx.lineTo(...B1);ctx.lineTo(...A1);ctx.closePath();ctx.fill();
  if(type==='ship'||type==='schooner'){poly([...A0,...B0,B0[0],B0[1]-.035*t,A0[0],A0[1]-.035*t],'#6f7d52')}
  if(type==='ship'||type==='steamer'){const m=(f)=>[A0[0]+(A1[0]-A0[0])*f,A0[1]+(A1[1]-A0[1])*f],n_=(f)=>[B0[0]+(B1[0]-B0[0])*f,B0[1]+(B1[1]-B0[1])*f];poly([...m(.62),...n_(.62),...n_(.82),...m(.82)],type==='ship'?'#efe7d6':'#c9a227');if(type==='ship'&&k%2===0){const c=[(m(.66)[0]+n_(.66)[0])/2,(m(.66)[1]+n_(.66)[1])/2];ctx.fillStyle='#1d1b1a';ctx.fillRect(c[0]-.03*t,c[1]-.09*t,.06*t,.06*t)}}}
 const deckPts=out.map(([u,v])=>P(u*.97,v*.9,hd*sheer(u)));ctx.fillStyle=type==='ferry'?'#efe7d6':'#a8875e';ctx.beginPath();deckPts.forEach(([a,b],k)=>k?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.fill();
 ctx.strokeStyle='rgba(70,48,24,.35)';ctx.lineWidth=Math.max(.3,Z*.25);ctx.beginPath();for(let v=-.6;v<=.6;v+=.3){for(let u=-.45;u<.45;u+=.05){const a=P(u,v*bm,hd*sheer(u)),b=P(u+.05,v*bm,hd*sheer(u+.05));if(u===-.45)ctx.moveTo(...a);ctx.lineTo(...b)}}ctx.stroke();
 if(Z>.5){ctx.strokeStyle='rgba(40,30,20,.7)';ctx.lineWidth=Math.max(.3,Z*.3);ctx.beginPath();for(let k=1;k<N;k+=1){const[u,v]=out[k],a=P(u,v*.97,hd*sheer(u)),b=[a[0],a[1]-.09*t];ctx.moveTo(...a);ctx.lineTo(...b)}ctx.stroke()}
 const box=(u0,u1,w,h0,h1,c)=>{const a=P(u0,-w,h0),b=P(u1,-w,h0),c2=P(u1,w,h0),d=P(u0,w,h0),a1=P(u0,-w,h1),b1=P(u1,-w,h1),c1=P(u1,w,h1),d1=P(u0,w,h1);poly([...d,...c2,...c1,...d1],shade(c,.92));poly([...b,...c2,...c1,...b1],shade(c,.78));poly([...a1,...b1,...c1,...d1],shade(c,1.05))};
 if(type==='ship'||type==='schooner'){box(-.12,-.02,bm*.4,hd,hd+.06,'#5a4632');box(.12,.2,bm*.35,hd,hd+.05,'#5a4632');box(-.48,-.3,bm*.75,hd*1.15,hd*1.15+.16,'#6b5240')}
 const mast=(u,mh,yards,set)=>{const b=P(u,0,hd),top=[b[0],b[1]-mh*t];ctx.strokeStyle='rgba(40,32,24,.55)';ctx.lineWidth=Math.max(.3,Z*.22);ctx.beginPath();for(const s of[-1,1]){for(let q=0;q<3;q++){const d=P(u-.03+q*.025,s*bm*.98,hd);ctx.moveTo(top[0],top[1]+mh*t*.12);ctx.lineTo(...d)}}ctx.stroke();
  const gw=Math.max(.8,t*.06);ctx.fillStyle='#4a3622';ctx.beginPath();ctx.moveTo(b[0]-gw/2,b[1]);ctx.lineTo(b[0]+gw/2,b[1]);ctx.lineTo(top[0]+gw/4,top[1]);ctx.lineTo(top[0]-gw/4,top[1]);ctx.fill();ctx.fillStyle='#3a2a1a';ctx.fillRect(b[0]-gw*1.4,b[1]-mh*t*.45,gw*2.8,gw*.6);
  for(let k=0;k<yards;k++){const hy=mh*(.42+k*.19),ww=bm*(1.35-k*.2),a=P(u,-ww,hd+hy),c=P(u,ww,hd+hy);
   if(set){const d2=P(u,-ww*.92,hd+hy-mh*.17),c2=P(u,ww*.92,hd+hy-mh*.17),bel=[gdx*.12*t,gdy*.06*t];const g=ctx.createLinearGradient(a[0],a[1],c[0],c[1]);g.addColorStop(0,'rgba(236,228,206,.97)');g.addColorStop(.5,'rgba(252,248,236,.98)');g.addColorStop(1,'rgba(214,204,182,.97)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.quadraticCurveTo((c[0]+c2[0])/2+bel[0],(c[1]+c2[1])/2+bel[1],...c2);ctx.quadraticCurveTo((a[0]+c[0])/2+bel[0]*1.6,(d2[1]+c2[1])/2+bel[1]*1.6,...d2);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(120,105,80,.4)';ctx.lineWidth=.5;ctx.stroke()}
   ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.stroke();
   if(!set){ctx.strokeStyle='rgba(232,224,204,.98)';ctx.lineWidth=Math.max(1,t*.075);ctx.beginPath();ctx.moveTo(a[0],a[1]+.035*t);ctx.lineTo(c[0],c[1]+.035*t);ctx.stroke();ctx.strokeStyle='rgba(160,145,118,.6)';ctx.lineWidth=Math.max(.4,t*.025);ctx.beginPath();ctx.moveTo(a[0],a[1]+.065*t);ctx.lineTo(c[0],c[1]+.065*t);ctx.stroke()}}
  return top};
 if(type==='ship'){const set=false,tops=[mast(-.27,2.3,3,set),mast(.03,2.65,4,set),mast(.3,2.2,3,set)],bw=P(.5,0,hd*sheer(.5)),bs=P(.82,0,hd*sheer(.5)+.4);ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.6,t*.04);ctx.beginPath();ctx.moveTo(...bw);ctx.lineTo(...bs);ctx.stroke();
  ctx.strokeStyle='rgba(40,32,24,.6)';ctx.lineWidth=Math.max(.3,Z*.25);ctx.beginPath();ctx.moveTo(...bs);ctx.lineTo(...tops[2]);ctx.moveTo(bs[0],bs[1]);ctx.lineTo(tops[2][0],tops[2][1]+.6*t);ctx.moveTo(...tops[0]);ctx.lineTo(...tops[1]);ctx.lineTo(...tops[2]);const st=P(-.5,0,hd*sheer(-.5));ctx.moveTo(...st);ctx.lineTo(...tops[0]);ctx.stroke();
  const fl=P(-.5,0,hd*sheer(-.5)+.15),wv=Math.sin(performance.now()/350)*.04*t;ctx.strokeStyle='#3a2a1e';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(fl[0],fl[1]+.1*t);ctx.lineTo(fl[0]-.1*t,fl[1]-.3*t);ctx.stroke();for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#f4f1ea':'#b8322a';ctx.fillRect(fl[0]-.1*t-.34*t,fl[1]-.3*t+i*.045*t+wv*(i%2),.34*t,.045*t)}ctx.fillStyle='#2f4f8a';ctx.fillRect(fl[0]-.1*t-.34*t,fl[1]-.3*t,.15*t,.12*t)}
 else if(type==='schooner'||type==='sloop'){const um=type==='schooner'?.1:.08,mh=type==='schooner'?2:1.55;mast(um,mh,0,false);if(type==='schooner')mast(-.2,mh*.9,0,false);
  const sail=(u0,mh_,gaff,boom,c)=>{const a=P(u0,0,hd+.12),b=P(u0,0,hd+mh_*.95),g2=P(u0-gaff,0,hd+mh_*.8),e=P(u0-boom,0,hd+.16);const sideL=(P(.1,0,0)[0]-P(-.1,0,0)[0])>0;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...g2);ctx.lineTo(...e);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(110,95,70,.55)';ctx.lineWidth=Math.max(.4,Z*.4);ctx.stroke();
   ctx.strokeStyle='rgba(120,105,80,.25)';ctx.lineWidth=Math.max(.3,Z*.25);ctx.beginPath();for(let k2=1;k2<4;k2++){const f2=k2/4,p=[a[0]+(b[0]-a[0])*f2,a[1]+(b[1]-a[1])*f2],q=[e[0]+(g2[0]-e[0])*f2,e[1]+(g2[1]-e[1])*f2];ctx.moveTo(...p);ctx.lineTo(...q)}ctx.stroke();ctx.strokeStyle='#5a4028';ctx.lineWidth=Math.max(.5,Z*.6);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...e);ctx.moveTo(...b);ctx.lineTo(...g2);ctx.stroke()};
  if(type==='schooner')sail(-.2,mh*.9,.26,.3,'rgba(240,234,218,.97)');sail(um,mh,.36,.44,'rgba(248,244,232,.98)');const jt=P(um,0,hd+mh*.85),jb=P(.62,0,hd+.12),jf=P(um+.05,0,hd+.14);ctx.fillStyle='rgba(236,230,212,.97)';ctx.beginPath();ctx.moveTo(...jt);ctx.lineTo(...jb);ctx.lineTo(...jf);ctx.fill();ctx.strokeStyle='rgba(110,95,70,.5)';ctx.lineWidth=Math.max(.4,Z*.4);ctx.stroke();
  const bs=P(.5,0,hd*sheer(.5)),be=P(.66,0,hd*sheer(.5)+.1);ctx.strokeStyle='#5a4028';ctx.beginPath();ctx.moveTo(...bs);ctx.lineTo(...be);ctx.stroke()}
 else{if(type==='ferry'){box(-.42,.42,bm*.8,hd,hd+.2,'#ece6d8');const wl0=P(-.4,bm*.8,hd+.08),wl1=P(.4,bm*.8,hd+.08);ctx.strokeStyle='#3a4a58';ctx.lineWidth=Math.max(.8,t*.05);ctx.setLineDash([t*.05,t*.04]);ctx.beginPath();ctx.moveTo(...wl0);ctx.lineTo(...wl1);ctx.stroke();ctx.setLineDash([]);box(-.12,.12,bm*.45,hd+.2,hd+.36,'#f4f1ea');box(-.5,-.4,bm*.3,hd,hd+.24,'#e3dccb');box(.4,.5,bm*.3,hd,hd+.24,'#e3dccb');const wl=P(0,bm,hd+.2);ctx.fillStyle='#2f5a3a';ctx.beginPath();ctx.ellipse(wl[0],wl[1],.32*t,.22*t,0,Math.PI,0);ctx.fill()}
  else{box(-.28,type==='tug'?.12:.22,bm*.7,hd,hd+.3,'#efe3c8');box(-.2,type==='tug'?.05:.12,bm*.55,hd+.3,hd+.42,'#e6d8b8');if(type==='steamer'){box(.24,.34,bm*.35,hd,hd+.12,'#8a6a44')}}
  const f=P(type==='tug'?.0:-.02,0,hd+(type==='ferry'?.6:.42));const g=ctx.createLinearGradient(f[0]-.1*t,0,f[0]+.1*t,0);const fc=type==='steamer'?'#b8322a':'#1d1b1a';g.addColorStop(0,shade(fc,1.15));g.addColorStop(1,shade(fc,.7));ctx.fillStyle=g;ctx.fillRect(f[0]-.1*t,f[1]-.75*t,.2*t,.75*t);ctx.fillStyle='#1d1b1a';ctx.fillRect(f[0]-.11*t,f[1]-.8*t,.22*t,.12*t);
  ctx.fillStyle='rgba(80,80,80,.32)';for(let j=0;j<4;j++){ctx.beginPath();ctx.arc(f[0]-gdx*j*.32*t+Math.sin(performance.now()/500+j)*.05*t,f[1]-1*t-j*.28*t,(.13+j*.09)*t,0,7);ctx.fill()}
  if(type==='steamer'){mast(-.36,1.5,1,false);mast(.36,1.5,1,false)}if(type==='tug'){const fd=P(.42,0,hd*sheer(.42));ctx.fillStyle='#3a2a1e';ctx.beginPath();ctx.arc(fd[0],fd[1]+.05*t,.08*t,0,7);ctx.fill()}}}

/* ---------- trees of many kinds ---------- */
function treeR(x,y,z,c){const a=(x-cam.x)/(TW/2*Z),b=(y-cam.y)/(TH/2*Z),m_=RU(Math.round((a+b)*4),Math.round((b-a)*4)),sd=hs((m_[0]*7919+m_[1]*104729)&0x7fffffff),sd2=hs((m_[0]*31+m_[1]*977+5)&0x7fffffff),sz=z*(.82+sd2*.45)*2.1;
 const pn=vnoise(m_[0]/4,m_[1]/4,7,9),kind=pn<.36?(sd<.8?'conifer':'round'):pn<.74?(sd<.78?'round':sd<.88?'poplar':sd<.95?'birch':'willow'):(sd<.55?'round':sd<.9?'autumn':'birch');
 ctx.fillStyle='rgba(20,30,25,.2)';ctx.beginPath();ctx.ellipse(x+4.5*sz,y+1.2*sz,(kind==='poplar'?3.5:6.5)*sz,2.4*sz,0,0,7);ctx.fill();
 const gf=.95+sd2*.1,g=pn<.5?c:mixHex(c,'#6f8f3a',.35);
 if(kind==='conifer'){ctx.fillStyle='#4a3626';ctx.fillRect(x-.6*sz,y-3*sz,1.2*sz,3*sz);const cc=['#2f5a35','#36633a','#294f30'][(sd2*3)|0];for(let k=0;k<4;k++){const yy=y-3*sz-k*3.2*sz,w=(5.2-k*1.1)*sz;ctx.fillStyle=shade(cc,1+k*.05);ctx.beginPath();ctx.moveTo(x-w,yy);ctx.lineTo(x+w,yy);ctx.lineTo(x,yy-5*sz);ctx.fill();ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.moveTo(x,yy-5*sz);ctx.lineTo(x+w,yy);ctx.lineTo(x+w*.2,yy);ctx.fill()}return}
 if(kind==='poplar'){ctx.fillStyle='#5b4632';ctx.fillRect(x-.6*sz,y-4*sz,1.2*sz,4*sz);ctx.fillStyle=shade(g,1.05*gf);ctx.beginPath();ctx.ellipse(x,y-11*sz,2.6*sz,8*sz,0,0,7);ctx.fill();ctx.fillStyle=shade(g,1.25*gf);ctx.beginPath();ctx.ellipse(x-.9*sz,y-12.5*sz,1.2*sz,5.5*sz,0,0,7);ctx.fill();ctx.fillStyle=shade(g,.8*gf);ctx.beginPath();ctx.ellipse(x+1.1*sz,y-9.5*sz,1.1*sz,5*sz,0,0,7);ctx.fill();return}
 if(kind==='birch'){ctx.fillStyle='#ece8dc';ctx.fillRect(x-.6*sz,y-7*sz,1.2*sz,7*sz);ctx.fillStyle='#2a2522';for(let k=0;k<4;k++)ctx.fillRect(x-.6*sz,y-1.5*sz-k*1.5*sz,.8*sz,.3*sz);const bc='#8fb05a';for(const[dx,dy,r]of[[0,-10,3.8],[-2.2,-8.5,2.8],[2.3,-8.8,2.6],[.5,-12.5,2.4]]){ctx.fillStyle=shade(bc,1+dy*.01);ctx.beginPath();ctx.arc(x+dx*sz,y+dy*sz,r*sz,0,7);ctx.fill()}return}
 if(kind==='willow'){ctx.fillStyle='#5b4632';ctx.fillRect(x-.9*sz,y-5*sz,1.8*sz,5*sz);const wc='#7a9a48';ctx.fillStyle=wc;ctx.beginPath();ctx.ellipse(x,y-9*sz,6*sz,4*sz,0,Math.PI,0);ctx.fill();ctx.strokeStyle=shade(wc,.9);ctx.lineWidth=Math.max(.6,1.1*sz);ctx.beginPath();for(let k=-5;k<=5;k++){ctx.moveTo(x+k*1.1*sz,y-9*sz);ctx.quadraticCurveTo(x+k*1.25*sz,y-5*sz,x+k*1.15*sz,y-2.2*sz-Math.abs(k)*.3*sz)}ctx.stroke();ctx.strokeStyle=shade(wc,1.2);ctx.lineWidth=Math.max(.5,.6*sz);ctx.beginPath();for(let k=-4;k<=4;k+=2){ctx.moveTo(x+k*sz,y-10*sz);ctx.quadraticCurveTo(x+k*1.1*sz,y-6*sz,x+k*sz,y-3.5*sz)}ctx.stroke();return}
 ctx.fillStyle='#5b4632';ctx.beginPath();ctx.moveTo(x-1*sz,y);ctx.lineTo(x+1*sz,y);ctx.lineTo(x+.6*sz,y-5.5*sz);ctx.lineTo(x-.6*sz,y-5.5*sz);ctx.fill();
 const col=kind==='autumn'?['#c9782a','#d9a13a','#b8462e','#a85a2a','#d4b43c'][(sd2*5)|0]:kind==='fruit'?'#6f9a44':g,r=(kind==='fruit'?4.2:5.4)*sz,cy=y-(kind==='fruit'?7.5:9)*sz;
 const lobes=[[0,0,1],[-2,-1.6,.7],[2.1,-1.2,.66],[-1.2,1.3,.6],[1.6,1.5,.55],[.3,-2.6,.55]];for(const[dx,dy,f]of lobes){ctx.fillStyle=shade(col,(.86+(-dy)*.06+(-dx)*.03)*(kind==='autumn'?1:gf));ctx.beginPath();ctx.arc(x+dx*sz,cy+dy*sz,r*f,0,7);ctx.fill()}
 ctx.fillStyle='rgba(255,255,230,.14)';ctx.beginPath();ctx.arc(x-1.8*sz,cy-2.2*sz,r*.45,0,7);ctx.fill();
 if(kind==='fruit'){for(let k=0;k<7;k++){ctx.fillStyle=k%2?'#f4f1ea':'#e8a8c0';ctx.beginPath();ctx.arc(x+(hs(k*13+(sd*1e4|0))-.5)*7*sz,cy+(hs(k*17+(sd*1e4|0))-.5)*5*sz,.6*sz,0,7);ctx.fill()}}}
/* ---------- smooth turning: the city swings round, then settles on the new side ---------- */
let TURNING=false;
function isoRot(phi){const c=Math.cos(phi),s=Math.sin(phi),MR=[[c-s,-s-c],[.5*c+.5*s,-.5*s+.5*c]],Mi=[[.5,1],[-.5,1]];return[MR[0][0]*Mi[0][0]+MR[0][1]*Mi[1][0],MR[1][0]*Mi[0][0]+MR[1][1]*Mi[1][0],MR[0][0]*Mi[0][1]+MR[0][1]*Mi[1][1],MR[1][0]*Mi[0][1]+MR[1][1]*Mi[1][1]]}
function setTurn(phi){const m=isoRot(phi);cv.style.transformOrigin='50% 50%';cv.style.transform=phi?`matrix(${m[0]},${m[1]},${m[2]},${m[3]},0,0)`:''}
function animTurn(from,to,ms,done){const t0=performance.now();const step=now=>{const u=Math.min(1,(now-t0)/ms),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;setTurn(from+(to-from)*e);if(u<1)requestAnimationFrame(step);else done&&done()};requestAnimationFrame(step)}
function turnSmooth(d){if(TURNING)return;TURNING=true;cv.style.transition='opacity .18s ease, transform .18s ease';cv.style.opacity='0';cv.style.transform=`scale(.96) translateX(${-d*18}px)`;setTimeout(()=>{rotateView(d);cv.style.transition='none';cv.style.transform=`scale(.96) translateX(${d*18}px)`;requestAnimationFrame(()=>{cv.style.transition='opacity .26s ease, transform .26s ease';cv.style.opacity='1';cv.style.transform='';setTimeout(()=>{cv.style.transition='';TURNING=false},280)})},190)}

/* ===================== round four: building sites, boats, Liberty, bridge, waves, industry and farms ===================== */
const LP=(cx,cy,t)=>(u,v,h=0)=>[cx+(u-v)*t,cy+(u+v)*t/2-h];
function OLD_boxP(P,u0,v0,u1,v1,h0,h1,cl,cr,ct){const a=P(u0,v1,h0),b=P(u1,v1,h0),c=P(u1,v0,h0),a1=P(u0,v1,h1),b1=P(u1,v1,h1),c1=P(u1,v0,h1),d1=P(u0,v0,h1);poly([...a,...b,...b1,...a1],cl);poly([...b,...c,...c1,...b1],cr);if(ct)poly([...a1,...b1,...c1,...d1],ct)}
/* building sites that look like building sites */
function drawSite(o,cx,cy,t){const f=B[o.t].foot||1,pr=siteProg(o),P=LP(cx,cy,t),k=f*.4,tx=t>=4.5,hT=(o.t==='house'?1.6:B[o.t].lm?2.6:1.5)*t*(f>=4?1:.8),H_=Math.max(.12,pr)*hT,wH=Math.max(0,pr-.12)*hT;
 poly([...P(-f/2,-f/2),...P(f/2,-f/2),...P(f/2,f/2),...P(-f/2,f/2)],'#a8916c');if(tx){ctx.fillStyle='rgba(90,70,45,.25)';for(let i=0;i<14;i++){const[x,y]=P((hs(o.x*7+i)-.5)*f,(hs(o.y*11+i)-.5)*f);ctx.beginPath();ctx.ellipse(x,y,t*.12,t*.05,0,0,7);ctx.fill()}}
 poly([...P(-k,-k),...P(k,-k),...P(k,k),...P(-k,k)],'#7a6a58');
 const brick='#a85a3e',bk=(u0,v0,u1,v1,h)=>{if(h<=0)return;const a=P(u0,v1),b=P(u1,v1),c=P(u1,v0),a1=P(u0,v1,h),b1=P(u1,v1,h),c1=P(u1,v0,h);poly([...a,...b,...b1,...a1],shade(brick,1));poly([...b,...c,...c1,...b1],shade(brick,.8));
  if(tx){ctx.strokeStyle='rgba(60,30,20,.3)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();for(let y_=t*.08;y_<h;y_+=t*.08){const p=P(u0,v1,y_),q=P(u1,v1,y_),r=P(u1,v0,y_);ctx.moveTo(...p);ctx.lineTo(...q);ctx.lineTo(...r)}ctx.stroke();
   const fl=Math.floor(h/(t*.33));ctx.fillStyle='#2a2522';for(let fI=0;fI<fl;fI++){const yy=fI*t*.33+t*.12;for(let s_=0;s_<4;s_++){const uu=u0+(s_+.5)*(u1-u0)/4,p=P(uu,v1,yy);ctx.fillRect(p[0]-.05*t,p[1]-.14*t,.1*t,.14*t);const vv=v0+(s_+.5)*(v1-v0)/4,q=P(u1,vv,yy);ctx.fillRect(q[0]-.05*t,q[1]-.14*t,.1*t,.14*t)}}}};
 const bc=P(-k,-k,0);bk(-k,-k,k,k,wH);
 if(tx&&H_>wH){ctx.strokeStyle='#8a6a40';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();const n=Math.max(3,Math.round(f*2.5));for(let i=0;i<=n;i++){const u=-k+2*k*i/n;for(const[p0,p1]of[[P(u,k+.12,0),P(u,k+.12,H_+.2*t)],[P(k+.12,u,0),P(k+.12,u,H_+.2*t)]]){ctx.moveTo(...p0);ctx.lineTo(...p1)}}
  for(let y_=t*.33;y_<=H_+.1*t;y_+=t*.33){ctx.moveTo(...P(-k,k+.12,y_));ctx.lineTo(...P(k+.12,k+.12,y_));ctx.lineTo(...P(k+.12,-k,y_))}ctx.stroke();
  ctx.strokeStyle='rgba(138,106,64,.7)';ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();for(let i=0;i<n;i+=2){const u=-k+2*k*i/n,u2=-k+2*k*(i+1)/n;ctx.moveTo(...P(u,k+.12,0));ctx.lineTo(...P(u2,k+.12,Math.min(H_,t*.66)));ctx.moveTo(...P(k+.12,u,0));ctx.lineTo(...P(k+.12,u2,Math.min(H_,t*.66)))}ctx.stroke()}
 if(f>=3&&tx){const m=P(-k-.2,-k-.2,0),mh=hT+.9*t;ctx.strokeStyle='#5a4028';ctx.lineWidth=Math.max(.8,t*.06);ctx.beginPath();ctx.moveTo(...m);ctx.lineTo(m[0],m[1]-mh);const bt=P(.2,.2,mh*.92);ctx.lineTo(...bt);ctx.stroke();ctx.lineWidth=Math.max(.4,t*.02);ctx.beginPath();ctx.moveTo(m[0],m[1]-mh);ctx.lineTo(...P(-k-.2,-k+.5,0));ctx.moveTo(m[0],m[1]-mh);ctx.lineTo(...P(-k+.5,-k-.2,0));ctx.stroke();
  const sw=Math.sin(performance.now()/900+o.x)*.08*t,ld=[bt[0]+sw,bt[1]+mh*.5];ctx.strokeStyle='#2a2522';ctx.beginPath();ctx.moveTo(...bt);ctx.lineTo(...ld);ctx.stroke();ctx.fillStyle=brick;ctx.fillRect(ld[0]-.12*t,ld[1],.24*t,.12*t)}
 if(tx){const pile=(u,v,c,h)=>boxP(P,u-.18,v-.12,u+.18,v+.12,0,h*t,shade(c,1),shade(c,.8),shade(c,1.15));pile(f/2-.35,-f/2+.45,'#a85a3e',.18);pile(f/2-.35,-f/2+.85,'#a85a3e',.12);
  const lg=P(-f/2+.45,f/2-.35);ctx.fillStyle='#8a6a44';for(let i=0;i<4;i++){ctx.fillRect(lg[0]-.3*t,lg[1]-.06*t*i-.06*t,.6*t,.05*t)}const sd_=P(f/2-.4,f/2-.45);ctx.fillStyle='#d6c08a';ctx.beginPath();ctx.ellipse(sd_[0],sd_[1],.28*t,.14*t,0,Math.PI,0);ctx.fill();
  const wi=PEOPLE.findIndex(p=>p[0]==='worker');if(t>=8)for(let i=0;i<3;i++){const[x,y]=P(-f/2+.3+i*.9*(f/4),f/2-.15);drawPerson(x,y,t*.028,wi+i)}}}
/* Liberty on her star fort */
function drawLiberty(cx,cy,hw,hh){const t=hw/4,P=LP(cx,cy,t),tx=t>=4.5;
 const star=[];for(let i=0;i<22;i++){const a=i*Math.PI/11-Math.PI/2,r=i%2?1.15:1.75;star.push([Math.cos(a)*r,Math.sin(a)*r])}
 const wh=.22*t;ctx.fillStyle='#8f897d';ctx.beginPath();star.forEach(([u,v],i)=>{const p=P(u,v);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.fill();
 for(let i=0;i<star.length;i++){const a=star[i],b=star[(i+1)%star.length],A=P(...a),Bp=P(...b);if(Bp[0]<A[0])continue;poly([...A,...Bp,Bp[0],Bp[1]-wh,A[0],A[1]-wh],i%2?'#a39d90':'#8f897d')}
 ctx.fillStyle='#7fa056';ctx.beginPath();star.forEach(([u,v],i)=>{const p=P(u*.9,v*.9,wh);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.fill();
 let h=wh;const tier=(r,hh_,c)=>{boxP(P,-r,-r,r,r,h,h+hh_*t,shade(c,1.02),shade(c,.82),shade(c,1.12));h+=hh_*t};
 tier(.62,.28,'#b9b1a0');tier(.5,.95,'#c9c1ae');
 if(tx){for(const[side,sgn]of[['L',1],['R',1]]){for(let i=0;i<3;i++){const s=(i+.5)/3,p=side==='L'?P(-.5+s,.5,wh+.28*t+.45*t):P(.5,.5-s,wh+.28*t+.45*t);ctx.fillStyle='#4a4540';ctx.fillRect(p[0]-.06*t,p[1]-.3*t,.12*t,.3*t);ctx.fillStyle='#d9d2c2';ctx.fillRect(p[0]-.09*t,p[1]-.33*t,.03*t,.33*t);ctx.fillRect(p[0]+.06*t,p[1]-.33*t,.03*t,.33*t)}}}
 tier(.55,.08,'#e3dccb');tier(.4,.35,'#d4ccb9');tier(.44,.06,'#e3dccb');
 const top=P(0,0,h),sx=top[0],sy=top[1],u=t*.95,g=ctx.createLinearGradient(sx-u*.4,0,sx+u*.4,0);g.addColorStop(0,'#86bca2');g.addColorStop(.55,'#6aa48b');g.addColorStop(1,'#4d826d');
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx-.38*u,sy);ctx.quadraticCurveTo(sx-.42*u,sy-1.2*u,sx-.22*u,sy-2.1*u);ctx.lineTo(sx+.2*u,sy-2.1*u);ctx.quadraticCurveTo(sx+.44*u,sy-1.1*u,sx+.36*u,sy);ctx.closePath();ctx.fill();
 if(tx){ctx.strokeStyle='rgba(40,80,64,.45)';ctx.lineWidth=Math.max(.4,t*.025);ctx.beginPath();for(let i=-2;i<=2;i++){ctx.moveTo(sx+i*.08*u,sy-.05*u);ctx.quadraticCurveTo(sx+i*.1*u+.04*u,sy-1*u,sx+i*.06*u,sy-1.9*u)}ctx.stroke()}
 ctx.fillStyle='#5f9a82';ctx.beginPath();ctx.moveTo(sx-.24*u,sy-2.05*u);ctx.lineTo(sx-.34*u,sy-1.55*u);ctx.lineTo(sx-.18*u,sy-1.5*u);ctx.lineTo(sx-.1*u,sy-1.95*u);ctx.fill();
 ctx.fillStyle='#4f8a74';ctx.save();ctx.translate(sx-.33*u,sy-1.62*u);ctx.rotate(-.25);ctx.fillRect(-.09*u,-.13*u,.2*u,.3*u);ctx.restore();
 ctx.fillStyle='#78b098';ctx.beginPath();ctx.arc(sx,sy-2.27*u,.13*u,0,7);ctx.fill();ctx.fillStyle='#6aa48b';ctx.fillRect(sx-.06*u,sy-2.16*u,.12*u,.1*u);
 ctx.fillStyle='#5f9a82';for(let i=0;i<7;i++){const a=-Math.PI*(.15+i*.7/6);ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*.12*u,sy-2.32*u+Math.sin(a)*.08*u);ctx.lineTo(sx+Math.cos(a)*.34*u,sy-2.32*u+Math.sin(a)*.26*u);ctx.lineTo(sx+Math.cos(a+.12)*.12*u,sy-2.32*u+Math.sin(a+.12)*.08*u);ctx.fill()}
 ctx.strokeStyle='#5f9a82';ctx.lineWidth=Math.max(1,.1*u);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx+.14*u,sy-1.95*u);ctx.lineTo(sx+.24*u,sy-2.5*u);ctx.lineTo(sx+.27*u,sy-2.95*u);ctx.stroke();
 ctx.fillStyle='#4f8a74';ctx.fillRect(sx+.22*u,sy-3.05*u,.1*u,.12*u);ctx.fillStyle='#c9a227';ctx.beginPath();ctx.moveTo(sx+.2*u,sy-3.05*u);ctx.lineTo(sx+.34*u,sy-3.05*u);ctx.lineTo(sx+.3*u,sy-3.12*u);ctx.lineTo(sx+.24*u,sy-3.12*u);ctx.fill();
 const fl=Math.sin(performance.now()/180)*.02*u;ctx.fillStyle='#f0c040';ctx.beginPath();ctx.moveTo(sx+.2*u,sy-3.12*u);ctx.quadraticCurveTo(sx+.18*u+fl,sy-3.32*u,sx+.27*u,sy-3.42*u);ctx.quadraticCurveTo(sx+.36*u+fl,sy-3.3*u,sx+.34*u,sy-3.12*u);ctx.fill();
 if(tx){const gl=ctx.createRadialGradient(sx+.27*u,sy-3.25*u,0,sx+.27*u,sy-3.25*u,.5*u);gl.addColorStop(0,'rgba(255,220,120,.35)');gl.addColorStop(1,'rgba(255,220,120,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(sx+.27*u,sy-3.25*u,.5*u,0,7);ctx.fill()}}
/* the Brooklyn Bridge deck is steel, not stone */
let BBSET=null,BBGV=-1;
function bbSet(){if(BBSET&&BBGV===GV)return BBSET;BBGV=GV;BBSET=new Map();for(const o of S.list)if(o.t==='reichsbruecke'&&!o.bld){const sp=bbSpan(o);if(!sp)continue;const a=sp.run[0],b=sp.run[1]||a,d=[(b%W)-(a%W),((b/W)|0)-((a/W)|0)];for(const i of sp.run)BBSET.set(i,d)}return BBSET}
function bbDeck(x,y,cx,cy,hw,hh,d){const[dx,dy]=d,ux=DX(dx,dy)*hw*.5,uy=DY(dx,dy)*hh*.5,px=-DY(dx,dy)*hw*.5*.55,py=DX(dx,dy)*hh*.5*.55,lift=hh*.9,A=[cx-ux,cy-uy-lift],Bq=[cx+ux,cy+uy-lift];
 poly([A[0]+px,A[1]+py,Bq[0]+px,Bq[1]+py,Bq[0]+px,Bq[1]+py+hh*.35,A[0]+px,A[1]+py+hh*.35],'#3f444a');
 ctx.strokeStyle='rgba(160,165,170,.6)';ctx.lineWidth=Math.max(.4,hh*.05);ctx.beginPath();for(let k=0;k<=4;k++){const f=k/4,X=A[0]+px+(Bq[0]-A[0])*f,Y=A[1]+py+(Bq[1]-A[1])*f;ctx.moveTo(X,Y);ctx.lineTo(X+(Bq[0]-A[0])*.125,Y+(Bq[1]-A[1])*.125+hh*.35);ctx.moveTo(X,Y+hh*.35);ctx.lineTo(X+(Bq[0]-A[0])*.125,Y+(Bq[1]-A[1])*.125)}ctx.stroke();
 poly([A[0]-px,A[1]-py,Bq[0]-px,Bq[1]-py,Bq[0]+px,Bq[1]+py,A[0]+px,A[1]+py],'#8a8478');poly([A[0]-px*.3,A[1]-py*.3,Bq[0]-px*.3,Bq[1]-py*.3,Bq[0]+px*.3,Bq[1]+py*.3,A[0]+px*.3,A[1]+py*.3],'#b9a98a');
 ctx.strokeStyle='#2a2f34';ctx.lineWidth=Math.max(.4,hh*.06);ctx.beginPath();ctx.moveTo(A[0]-px,A[1]-py-hh*.12);ctx.lineTo(Bq[0]-px,Bq[1]-py-hh*.12);ctx.moveTo(A[0]+px,A[1]+py-hh*.12);ctx.lineTo(Bq[0]+px,Bq[1]+py-hh*.12);ctx.stroke()}
/* moving surf along the shore */
let SURF=null,SURFGV=-1;
function surfSegs(){if(SURF&&SURFGV===GV)return SURF;SURFGV=GV;SURF=[];const F=landField(),lv=.4;for(let y=0;y<H-1;y++)for(let x=0;x<W-1;x++){const a=F[y*W+x],b=F[y*W+x+1],c=F[(y+1)*W+x+1],d=F[(y+1)*W+x];const k=(a>lv?1:0)|(b>lv?2:0)|(c>lv?4:0)|(d>lv?8:0);if(k===0||k===15)continue;
 const ip=(p,q,va,vb)=>{const t_=(lv-va)/((vb-va)||1e-6);return[p[0]+(q[0]-p[0])*t_,p[1]+(q[1]-p[1])*t_]},T=ip([x,y],[x+1,y],a,b),Rr=ip([x+1,y],[x+1,y+1],b,c),Bt=ip([x,y+1],[x+1,y+1],d,c),Lf=ip([x,y],[x,y+1],a,d);
 const segs={1:[[Lf,T]],2:[[T,Rr]],3:[[Lf,Rr]],4:[[Rr,Bt]],5:[[Lf,T],[Rr,Bt]],6:[[T,Bt]],7:[[Lf,Bt]],8:[[Bt,Lf]],9:[[Bt,T]],10:[[T,Rr],[Bt,Lf]],11:[[Bt,Rr]],12:[[Rr,Lf]],13:[[Rr,T]],14:[[T,Lf]]}[k];
 const gx=(b+c)-(a+d),gy=(c+d)-(a+b),gl=Math.hypot(gx,gy)||1;for(const[p,q]of segs)SURF.push([p[0],p[1],q[0],q[1],-gx/gl,-gy/gl,hs(x*31+y*17)*6.28])}return SURF}
function drawSurf(){if(!S||Z<.22)return;const segs=surfSegs(),now=performance.now()/1000;ctx.lineCap='round';
 for(let w=0;w<2;w++){ctx.lineWidth=Math.max(.8,Z*(w?1.2:1.8));ctx.beginPath();let any=false;for(const[x1,y1,x2,y2,nx,ny,ph]of segs){const s_=(now*.55+ph*.15+w*.5)%1,off=.08+s_*.55;
  const A=scr(x1+nx*off,y1+ny*off);if(A[0]<-30||A[0]>vw+30||A[1]<-30||A[1]>vh+30)continue;const Bq=scr(x2+nx*off,y2+ny*off);ctx.moveTo(...A);ctx.lineTo(...Bq);any=true}
  if(any){ctx.strokeStyle=`rgba(255,255,255,${w?.28:.4})`;ctx.stroke()}}
 ctx.lineWidth=Math.max(1,Z*2.2);ctx.beginPath();for(const[x1,y1,x2,y2,nx,ny,ph]of segs){const p=.5+.5*Math.sin(now*1.6+ph);if(p<.5)continue;const off=.04+p*.06,A=scr(x1+nx*off,y1+ny*off);if(A[0]<-30||A[0]>vw+30||A[1]<-30||A[1]>vh+30)continue;const Bq=scr(x2+nx*off,y2+ny*off);ctx.moveTo(...A);ctx.lineTo(...Bq)}ctx.strokeStyle='rgba(255,255,255,.55)';ctx.stroke()}

/* ---------- working yards and farms ---------- */
function OLD_gableP(P,u0,v0,u1,v1,h,rh,wall,roof){const vm=(v0+v1)/2,A=P(u0,v1,h),Bq=P(u1,v1,h),C=P(u1,v0,h),Rl=P(u0,vm,h+rh),Rr=P(u1,vm,h+rh);poly([...A,...Bq,...Rr,...Rl],roof);poly([...Bq,...C,...Rr],wall);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(...Rl);ctx.lineTo(...Rr);ctx.stroke()}
function gambrelP(P,u0,v0,u1,v1,h,rh,wall,roof){const vm=(v0+v1)/2,q=(v1-v0)*.18,A=P(u0,v1,h),Bq=P(u1,v1,h),C=P(u1,v0,h),K1=P(u0,v1-q,h+rh*.62),K2=P(u1,v1-q,h+rh*.62),Rl=P(u0,vm,h+rh),Rr=P(u1,vm,h+rh),K3=P(u1,v0+q,h+rh*.62);
 poly([...A,...Bq,...K2,...K1],roof);poly([...K1,...K2,...Rr,...Rl],shade(roof,1.15));poly([...Bq,...C,...K3,...Rr,...K2],wall)}
function chimney(P,u,v,h0,hgt,t,smoke){smoke=false;const b=P(u,v,h0),top=[b[0],b[1]-hgt*t];ctx.fillStyle='#8a3f2c';ctx.fillRect(b[0]-.09*t,top[1],.18*t,hgt*t);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(b[0],top[1],.09*t,hgt*t);ctx.fillStyle='#2a2522';ctx.fillRect(b[0]-.11*t,top[1]-.05*t,.22*t,.07*t);
 if(smoke){for(let i=0;i<5;i++){ctx.fillStyle=`rgba(${110+i*15},${110+i*15},${115+i*15},${.42-i*.06})`;ctx.beginPath();ctx.arc(top[0]+i*.18*t,top[1]-.2*t-i*.3*t,(.12+i*.07)*t,0,7);ctx.fill()}}}
function prop(P,kind,u,v,t){switch(kind){
 case'bricks':for(let i=0;i<3;i++)boxP(P,u-.2+i*.15,v-.12,u-.08+i*.15,v+.12,0,.16*t,'#b0644a','#8a4a36','#c27a5e');break;
 case'logs':for(let r=0;r<3;r++)for(let i=0;i<3-r;i++){const p=P(u,v-.25+i*.2+r*.1,.07*t+r*.12*t);ctx.fillStyle='#7a5532';ctx.fillRect(p[0]-.35*t,p[1]-.06*t,.5*t,.12*t);ctx.fillStyle='#d9b88a';ctx.beginPath();ctx.ellipse(p[0]+.15*t,p[1],.04*t,.06*t,0,0,7);ctx.fill()}break;
 case'planks':boxP(P,u-.3,v-.12,u+.3,v+.12,0,.18*t,'#c9a46e','#a8854f','#d9b88a');boxP(P,u-.25,v-.1,u+.25,v+.1,.18*t,.3*t,'#c9a46e','#a8854f','#e0c290');break;
 case'blocks':for(let i=0;i<4;i++)boxP(P,u-.25+(i%2)*.26,v-.2+((i/2)|0)*.24,u-.03+(i%2)*.26,v+.02+((i/2)|0)*.24,0,.2*t,'#b9b1a0','#9a9284','#d4ccb9');break;
 case'bars':for(let i=0;i<5;i++){const a=P(u-.3,v-.15+i*.07,.03*t+i%2*.03*t),b=P(u+.3,v-.15+i*.07,.03*t+i%2*.03*t);ctx.strokeStyle='#4a4f55';ctx.lineWidth=Math.max(.8,t*.05);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}break;
 case'coal':{const p=P(u,v);ctx.fillStyle='#24211f';ctx.beginPath();ctx.ellipse(p[0],p[1],.42*t,.2*t,0,Math.PI,0);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.ellipse(p[0]-.1*t,p[1]-.12*t,.15*t,.05*t,0,0,7);ctx.fill();break}
 case'clay':{const p=P(u,v);ctx.fillStyle='#b5764a';ctx.beginPath();ctx.ellipse(p[0],p[1],.4*t,.2*t,0,0,7);ctx.fill();ctx.fillStyle='#8a5a38';ctx.beginPath();ctx.ellipse(p[0],p[1]+.03*t,.28*t,.12*t,0,0,7);ctx.fill();break}
 case'barrels':for(let i=0;i<4;i++){const p=P(u-.15+(i%2)*.25,v-.1+((i/2)|0)*.22);ctx.fillStyle='#7a5532';ctx.fillRect(p[0]-.09*t,p[1]-.22*t,.18*t,.22*t);ctx.beginPath();ctx.ellipse(p[0],p[1]-.22*t,.09*t,.04*t,0,0,7);ctx.fillStyle='#9a7448';ctx.fill();ctx.fillStyle='#2a2522';ctx.fillRect(p[0]-.09*t,p[1]-.17*t,.18*t,.02*t);ctx.fillRect(p[0]-.09*t,p[1]-.07*t,.18*t,.02*t)}break;
 case'bales':for(let i=0;i<3;i++)boxP(P,u-.25+i*.18,v-.12,u-.1+i*.18,v+.12,0,.18*t,'#efe7d6','#cfc4ad','#f8f2e4');break;
 case'wagon':{const p=P(u,v);ctx.fillStyle='#7a5532';ctx.fillRect(p[0]-.35*t,p[1]-.3*t,.6*t,.18*t);ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();ctx.arc(p[0]-.25*t,p[1]-.08*t,.08*t,0,7);ctx.arc(p[0]+.15*t,p[1]-.08*t,.08*t,0,7);ctx.stroke();drawHorse(p[0]+.5*t,p[1],1,0,t*.02,'#6b4a2e',1);break}
 case'cars':for(let i=0;i<2;i++){const p=P(u+i*.3,v);ctx.fillStyle=['#1d1b1a','#2f4f6e'][i];ctx.fillRect(p[0]-.18*t,p[1]-.16*t,.36*t,.1*t);ctx.fillRect(p[0]-.08*t,p[1]-.24*t,.18*t,.09*t);ctx.fillStyle='#2a2522';ctx.beginPath();ctx.arc(p[0]-.1*t,p[1]-.05*t,.05*t,0,7);ctx.arc(p[0]+.11*t,p[1]-.05*t,.05*t,0,7);ctx.fill()}break}}
function animal(P,kind,u,v,t){const p=P(u,v),z=t*.022;if(kind==='cow'){ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(p[0],p[1]-2.6*z,2.6*z,1.4*z,0,0,7);ctx.fill();ctx.fillStyle='#1d1b1a';ctx.beginPath();ctx.ellipse(p[0]-.8*z,p[1]-2.9*z,.9*z,.7*z,0,0,7);ctx.ellipse(p[0]+1*z,p[1]-2.4*z,.7*z,.5*z,0,0,7);ctx.fill();ctx.fillStyle='#2a2522';ctx.fillRect(p[0]-2*z,p[1]-1.5*z,.5*z,1.5*z);ctx.fillRect(p[0]+1.5*z,p[1]-1.5*z,.5*z,1.5*z);ctx.fillStyle='#1d1b1a';ctx.beginPath();ctx.ellipse(p[0]+2.8*z,p[1]-3.1*z,.9*z,.65*z,.3,0,7);ctx.fill()}
 else if(kind==='sheep'){ctx.fillStyle='#ece8dc';ctx.beginPath();ctx.arc(p[0],p[1]-2*z,1.5*z,0,7);ctx.arc(p[0]+1.1*z,p[1]-2.2*z,1.2*z,0,7);ctx.arc(p[0]-1*z,p[1]-2.1*z,1.1*z,0,7);ctx.fill();ctx.fillStyle='#2a2522';ctx.beginPath();ctx.ellipse(p[0]+2.2*z,p[1]-2.3*z,.6*z,.5*z,0,0,7);ctx.fill();ctx.fillRect(p[0]-1*z,p[1]-.9*z,.35*z,.9*z);ctx.fillRect(p[0]+.9*z,p[1]-.9*z,.35*z,.9*z)}
 else{ctx.fillStyle=['#f4f1ea','#b8622e','#2a2522'][(u*7+v*3|0)&1?0:1];ctx.beginPath();ctx.ellipse(p[0],p[1]-.6*z,.7*z,.5*z,0,0,7);ctx.fill();ctx.fillStyle='#c93a2e';ctx.fillRect(p[0]+.4*z,p[1]-1.3*z,.3*z,.3*z)}}
function fence(P,f,t){ctx.strokeStyle='rgba(244,240,230,.85)';ctx.lineWidth=Math.max(.4,t*.018);const e=f/2-.08;ctx.beginPath();for(const h of[.08,.16]){ctx.moveTo(...P(-e,e,h*t));ctx.lineTo(...P(e,e,h*t));ctx.lineTo(...P(e,-e,h*t))}for(let i=0;i<=10;i++){const s=-e+2*e*i/10;ctx.moveTo(...P(s,e,0));ctx.lineTo(...P(s,e,.2*t));ctx.moveTo(...P(e,s,0));ctx.lineTo(...P(e,s,.2*t))}ctx.stroke()}
function rows(P,u0,v0,u1,v1,c1,c2,n,t){for(let i=0;i<n;i++){const a=u0+(u1-u0)*i/n,b=u0+(u1-u0)*(i+.55)/n;poly([...P(a,v0),...P(b,v0),...P(b,v1),...P(a,v1)],i%2?c1:c2)}}
const COMP={brick:1,sawmill:1,stonewh:1,ironyard:1,coalyard:1,brewery:1,weaver:1,kraftwerk:1,autofabrik:1,gaswerk:1,vineyard:1,garden:1,grainf:1,farm:1,sheep:1};
function bldP(P,u0,v0,u1,v1,h,sty,fl,t){const[x,y]=P((u0+u1)/2,(v0+v1)/2);prismTex(x,y,(u1-u0)/2,(v1-v0)/2,h,sty,fl,'#3f3a36',t*.02,t,t/2,t>=4.5)}
function yardWall(P,t,col){const e=1.95,h=.22*t;ctx.fillStyle=col;const seg=(a,b)=>{const A=P(...a),Bq=P(...b);poly([...A,...Bq,Bq[0],Bq[1]-h,A[0],A[1]-h],col);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(Math.min(A[0],Bq[0]),Math.min(A[1],Bq[1])-h-1,Math.abs(Bq[0]-A[0]),1.5)};
 seg([-e,e],[-.5,e]);seg([.5,e],[e,e]);seg([e,e],[e,-e]);for(const u of[-.5,.5]){const p=P(u,e);ctx.fillStyle=shade(col,.8);ctx.fillRect(p[0]-.07*t,p[1]-h*1.6,.14*t,h*1.6);ctx.fillStyle='#efe7d6';ctx.fillRect(p[0]-.08*t,p[1]-h*1.6-.04*t,.16*t,.05*t)}}
function yardFloor(P,t,o){if(t<4.5)return;ctx.strokeStyle='rgba(70,55,40,.28)';ctx.lineWidth=Math.max(.8,t*.07);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...P(-.15,1.95));ctx.quadraticCurveTo(...P(-.1,.6),...P(.6,.1));ctx.moveTo(...P(.15,1.95));ctx.quadraticCurveTo(...P(.2,.7),...P(.9,.3));ctx.stroke();
 for(let i=0;i<10;i++){const p=P((hs(o.x*5+i)-.5)*3.5,(hs(o.y*9+i)-.5)*3.5);ctx.fillStyle=i%2?'rgba(60,50,40,.14)':'rgba(255,250,235,.1)';ctx.beginPath();ctx.ellipse(p[0],p[1],(.15+hs(i)*.25)*t,(.07+hs(i+3)*.1)*t,0,0,7);ctx.fill()}}
const propS=(P,k,u,v,t)=>prop(P,k,u,v,t*1.7);
function drawCompound(o,cx,cy,hw,hh){const t=hw/4,P=LP(cx,cy,t),f=4,tx=t>=4.5,on=(o.st||'').startsWith('Working'),k=o.t,sd=hs(o.x*13+o.y*7);
 const yard={brick:'#a8916c',sawmill:'#b39a74',stonewh:'#a39d90',ironyard:'#8f897d',coalyard:'#5a5650',gaswerk:'#8f897d',kraftwerk:'#8f897d',autofabrik:'#a39d90',weaver:'#b3aa97',brewery:'#b3aa97',vineyard:'#b3aa97'}[k];
 if(yard){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],yard);yardFloor(P,t,o);if(tx){ctx.strokeStyle='rgba(60,50,40,.18)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();for(let i=-6;i<=6;i++){ctx.moveTo(...P(i*.3,-1.95));ctx.lineTo(...P(i*.3,1.95))}ctx.stroke()}}
 if(yard&&k!=='coalyard')yardWall(P,t,k==='stonewh'||k==='gaswerk'?'#8f897d':'#9c4a32');else if(k==='coalyard')yardWall(P,t,'#5a4a3e');
 switch(k){
 case'brick':{for(const[u,v]of[[-1.1,-.3],[-1.1,.8]]){const p=P(u,v);ctx.fillStyle='#8a3f2c';ctx.beginPath();ctx.ellipse(p[0],p[1]-.1*t,.55*t,.28*t,0,0,Math.PI);ctx.fill();ctx.fillStyle='#a85a3e';ctx.beginPath();ctx.ellipse(p[0],p[1]-.1*t,.55*t,.55*t,0,Math.PI,0);ctx.fill();ctx.fillStyle='#2a2522';ctx.beginPath();ctx.ellipse(p[0]+.1*t,p[1]-.05*t,.14*t,.2*t,0,Math.PI,0);ctx.fill()}
  bldP(P,-.2,-1.8,1.8,-.4,1.3*t,1,2,t);gableP(P,-.2,-1.8,1.8,-.4,1.3*t,.45*t,'#8a4a36','#4a3e3a');chimney(P,-1.6,-1.4,0,2.4,t,on);propS(P,'bricks',.6,.5,t);propS(P,'bricks',.6,1.1,t);propS(P,'clay',-.2,1.4,t);break}
 case'sawmill':{boxP(P,-1.6,-1.6,.2,-.4,0,.8*t,'#9a7448','#7a5532');gableP(P,-1.6,-1.6,.2,-.4,.8*t,.5*t,'#7a5532','#5a4a3e');propS(P,'logs',-1,.6,t);propS(P,'logs',-1,1.3,t);propS(P,'planks',.8,-.2,t);propS(P,'planks',.9,.7,t);propS(P,'planks',.9,1.4,t);chimney(P,-.2,-1.4,.8*t,.9,t,on);break}
 case'stonewh':{bldP(P,-1.8,-1.8,.1,-.4,1*t,12,2,t);gableP(P,-1.8,-1.8,.1,-.4,1*t,.35*t,'#7f786c','#4f5a63');propS(P,'blocks',.6,-.6,t);propS(P,'blocks',.6,.5,t);propS(P,'blocks',-.6,.8,t);propS(P,'blocks',.7,1.4,t);
  const m=P(1.5,-1.5),mh=2.2*t;ctx.strokeStyle='#5a4028';ctx.lineWidth=Math.max(.8,t*.06);ctx.beginPath();ctx.moveTo(...m);ctx.lineTo(m[0],m[1]-mh);ctx.lineTo(...P(.2,.2,mh*.8));ctx.stroke();break}
 case'ironyard':{bldP(P,-1.8,-1.8,.8,0,1.3*t,4,2,t);for(let i=0;i<3;i++)gableP(P,-1.8+i*.867,-1.8,-.933+i*.867,0,1.3*t,.32*t,'#56483c',i%2?'#3f4850':'#4f5a63');propS(P,'bars',1,0,t);propS(P,'bars',1,.8,t);propS(P,'bars',-.6,1.2,t);propS(P,'wagon',.4,1.5,t);break}
 case'coalyard':{bldP(P,-1.8,-1.8,-.3,-.5,1*t,9,2,t);gableP(P,-1.8,-1.8,-.3,-.5,1*t,.35*t,'#3a322c','#2a2522');propS(P,'coal',.5,-.5,t);propS(P,'coal',-.3,.6,t);propS(P,'coal',.8,.9,t);propS(P,'wagon',-.9,1.4,t);break}
 case'brewery':{bldP(P,-1.8,-1.8,.7,.1,2.1*t,1,5,t);nyMansard(nyFace(...P(-.55,-.85),1.25,.95,t,t/2),2.1*t,t,'#efe7d6');chimney(P,.5,-1.6,2.1*t,1.3,t,on);propS(P,'barrels',1,.2,t);propS(P,'barrels',1,.9,t);propS(P,'wagon',-.6,1.3,t);break}
 case'weaver':{bldP(P,-1.8,-1.6,1.4,0,2.6*t,1,6,t);
  chimney(P,1.5,-1.6,0,3,t,on);const tw=P(-1.7,-.2,2.2*t);ctx.fillStyle='#a85a3e';ctx.fillRect(tw[0]-.15*t,tw[1]-.6*t,.3*t,.6*t);ctx.fillStyle='#4f5a63';ctx.beginPath();ctx.moveTo(tw[0]-.2*t,tw[1]-.6*t);ctx.lineTo(tw[0],tw[1]-1*t);ctx.lineTo(tw[0]+.2*t,tw[1]-.6*t);ctx.fill();propS(P,'bales',.6,1,t);propS(P,'wagon',-.6,1.3,t);break}
 case'kraftwerk':{bldP(P,-1.8,-1.8,1.1,.3,2.2*t,1,4,t);gableP(P,-1.8,-1.8,1.1,.3,2.2*t,.6*t,'#6e3226','#4f5a63');if(tx){const F=nyFace(...P(-.35,-.75),1.45,1.05,t,t/2);for(let i=0;i<6;i++){winF(F.L,(i+.5)/6,.11,.35*t,1.3*t,'#d9c79c',true);winF(F.L,(i+.5)/6,.08,.38*t,1.22*t,'#2c3a44',true)}for(let i=0;i<4;i++)winF(F.R,(i+.5)/4,.13,.35*t,1.3*t,'#2c3a44',true)}
  chimney(P,1.4,-1.5,0,3.4,t,on);chimney(P,1.4,-.7,0,3.4,t,on);propS(P,'coal',.6,1.2,t);propS(P,'coal',-.6,1.3,t);break}
 case'autofabrik':{bldP(P,-1.8,-1.7,1.4,.4,1.1*t,4,2,t);for(let i=0;i<5;i++){const u0=-1.8+i*.64;const a=P(u0,.4,1.1*t),b=P(u0+.64,.4,1.1*t),c=P(u0,.4,1.55*t);poly([...a,...b,...c],'#4f5a63');poly([...c,...b,...P(u0+.64,-1.7,1.1*t),...P(u0,-1.7,1.55*t)],'rgba(200,220,235,.7)')}chimney(P,1.6,-1.6,0,2.4,t,on);propS(P,'cars',.2,1.2,t);break}
 case'gaswerk':{for(const[u,v]of[[-.8,-.6],[.7,.5]]){const p=P(u,v),r=.62*t,hg=(on?1.2:.8)*t;ctx.fillStyle='#5f6b72';ctx.fillRect(p[0]-r,p[1]-hg,2*r,hg);ctx.beginPath();ctx.ellipse(p[0],p[1],r,r*.5,0,0,Math.PI);ctx.fill();ctx.fillStyle='#7d8a92';ctx.beginPath();ctx.ellipse(p[0],p[1]-hg,r,r*.5,0,0,7);ctx.fill();
  ctx.strokeStyle='#2a2f34';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();for(let i=0;i<=6;i++){const x=p[0]-r*1.1+i*r*2.2/6;ctx.moveTo(x,p[1]+r*.3*Math.sin(i/6*Math.PI));ctx.lineTo(x,p[1]-1.6*t)}ctx.moveTo(p[0]-r*1.1,p[1]-1.6*t);ctx.lineTo(p[0]+r*1.1,p[1]-1.6*t);ctx.moveTo(p[0]-r*1.1,p[1]-.8*t);ctx.lineTo(p[0]+r*1.1,p[1]-.8*t);ctx.stroke()}
  boxP(P,.6,-1.7,1.7,-.9,0,.8*t,'#8a3f2c','#6e3226');gableP(P,.6,-1.7,1.7,-.9,.8*t,.3*t,'#6e3226','#4f5a63');chimney(P,1.6,-1.6,.8*t,1.2,t,on);break}
 case'vineyard':{bldP(P,-1.8,-1.8,.8,-.1,1.5*t,9,3,t);gableP(P,-1.8,-1.8,.8,-.1,1.5*t,.45*t,'#8a4a36','#4a3e3a');if(tx){const F=nyFace(...P(-.5,-.95),1.3,.85,t,t/2);winF(F.L,.5,.2,0,.6*t,'#2a2c30',true)}propS(P,'barrels',1,.3,t);propS(P,'barrels',.4,1.2,t);propS(P,'barrels',1.2,1.2,t);propS(P,'wagon',-.8,1.3,t);break}
 case'garden':{poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#7a6a48');rows(P,-1.8,-.4,1.8,1.8,'#6f9a44','#5a7e30',14,t);for(let i=0;i<8;i++){const p=P(-1.6+i*.45,-1.2);ctx.fillStyle=['#d9483a','#e8c547','#c9782a'][i%3];ctx.beginPath();ctx.arc(p[0],p[1],.06*t,0,7);ctx.fill()}
  boxP(P,-1.8,-1.9,-.4,-1.2,0,.35*t,'rgba(200,225,235,.75)','rgba(170,200,215,.75)');gableP(P,-1.8,-1.9,-.4,-1.2,.35*t,.25*t,'rgba(170,200,215,.7)','rgba(215,235,245,.75)');boxP(P,.6,-1.9,1.6,-1.1,0,.6*t,'#efe7d6','#cfc4ad');gableP(P,.6,-1.9,1.6,-1.1,.6*t,.35*t,'#cfc4ad','#6b4a3a');fence(P,f,t);if(tx){animal(P,'hen',.2,-.9,t);animal(P,'hen',.4,-.7,t)}break}
 case'grainf':{poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#d9c477');rows(P,-1.9,-.2,1.9,1.9,'#e2d35c','#cdb24e',18,t);
  for(const[u,v]of[[-.4,.6],[.6,1.2],[1.3,.4]]){const p=P(u,v);ctx.fillStyle='#c9a24e';ctx.beginPath();ctx.moveTo(p[0]-.22*t,p[1]);ctx.quadraticCurveTo(p[0],p[1]-.7*t,p[0]+.22*t,p[1]);ctx.fill()}
  boxP(P,-1.8,-1.9,-.3,-.9,0,.7*t,'#9c3a2e','#7e2e24');gambrelP(P,-1.8,-1.9,-.3,-.9,.7*t,.7*t,'#7e2e24','#4a3e3a');const sp=P(.3,-1.5);ctx.fillStyle='#a8a296';ctx.fillRect(sp[0]-.2*t,sp[1]-1.7*t,.4*t,1.7*t);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(sp[0],sp[1]-1.7*t,.2*t,1.7*t);ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.ellipse(sp[0],sp[1]-1.7*t,.2*t,.22*t,0,Math.PI,0);ctx.fill();
  const wm=P(1.4,-1.4);ctx.fillStyle='#efe7d6';ctx.beginPath();ctx.moveTo(wm[0]-.2*t,wm[1]);ctx.lineTo(wm[0]+.2*t,wm[1]);ctx.lineTo(wm[0]+.12*t,wm[1]-1.1*t);ctx.lineTo(wm[0]-.12*t,wm[1]-1.1*t);ctx.fill();const ang=performance.now()/1500+sd;ctx.strokeStyle='#5a4028';ctx.lineWidth=Math.max(.6,t*.05);ctx.beginPath();for(let i=0;i<4;i++){const a=ang+i*Math.PI/2;ctx.moveTo(wm[0],wm[1]-1.1*t);ctx.lineTo(wm[0]+Math.cos(a)*.6*t,wm[1]-1.1*t+Math.sin(a)*.6*t)}ctx.stroke();fence(P,f,t);break}
 case'farm':case'sheep':{poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#7fa056');if(tx){ctx.fillStyle='rgba(60,90,30,.18)';for(let i=0;i<10;i++){const p=P((hs(o.x+i*7)-.5)*3.6,(hs(o.y+i*11)-.5)*3.6);ctx.beginPath();ctx.ellipse(p[0],p[1],.3*t,.12*t,0,0,7);ctx.fill()}}
  boxP(P,-1.8,-1.9,-.2,-.8,0,.75*t,'#9c3a2e','#7e2e24');gambrelP(P,-1.8,-1.9,-.2,-.8,.75*t,.75*t,'#7e2e24','#4a3e3a');if(tx){const F=nyFace(...P(-1,-1.35),.8,.55,t,t/2);winF(F.L,.5,.3,.02*t,.55*t,'#efe7d6');const a=F.L(.35,.02*t),b=F.L(.65,.02*t);ctx.strokeStyle='#7e2e24';ctx.lineWidth=Math.max(.4,t*.03);ctx.beginPath();ctx.moveTo(a[0],a[1]-.55*t);ctx.lineTo(...b);ctx.moveTo(b[0],b[1]-.55*t);ctx.lineTo(...a);ctx.stroke();winF(F.R,.5,.25,.35*t,.2*t,'#efe7d6')}
  boxP(P,.5,-1.9,1.5,-1.1,0,.6*t,'#efe7d6','#cfc4ad');gableP(P,.5,-1.9,1.5,-1.1,.6*t,.35*t,'#cfc4ad','#5a4a44');if(tx){const F=nyFace(...P(1,-1.5),.5,.4,t,t/2);for(let i=0;i<3;i++)winF(F.L,(i+.5)/3,.14,.22*t,.18*t,'#2c3a44');for(let i=0;i<2;i++)winF(F.R,(i+.5)/2,.18,.22*t,.18*t,'#2c3a44');winF(F.L,.5,.12,0,.2*t,'#5a4028')}
  if(k==='farm'){const sp=P(.1,-1.6);ctx.fillStyle='#a8a296';ctx.fillRect(sp[0]-.18*t,sp[1]-1.3*t,.36*t,1.3*t);ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.ellipse(sp[0],sp[1]-1.3*t,.18*t,.2*t,0,Math.PI,0);ctx.fill()}
  fence(P,f,t);if(tx){const an=k==='farm'?['cow','cow','cow','hen','hen','hen']:['sheep','sheep','sheep','sheep','sheep','sheep','sheep'];an.forEach((a,i)=>animal(P,a,-1.2+((i*1.37+sd*3)%3),.1+((i*.91+sd*2)%1.6),t))}
  const hs_=P(1.3,1.3);ctx.fillStyle='#c9a24e';ctx.beginPath();ctx.moveTo(hs_[0]-.25*t,hs_[1]);ctx.quadraticCurveTo(hs_[0],hs_[1]-.8*t,hs_[0]+.25*t,hs_[1]);ctx.fill();break}}}

/* ===================== civic buildings, monuments and trams with love ===================== */
function OLD_box3(P,u0,u1,v0,v1,h0,h1,cl,cr,ct,cb){const faces=[[[u0,v1],[u1,v1],cl],[[u1,v1],[u1,v0],cr],[[u1,v0],[u0,v0],cb||cl],[[u0,v0],[u0,v1],cb||cr]];
 for(const[a,b,c]of faces){const A=P(a[0],a[1],h0),Bq=P(b[0],b[1],h0),ny_=-(Bq[0]-A[0]);if(ny_<0)continue;const A1=P(a[0],a[1],h1),B1=P(b[0],b[1],h1);poly([...A,...Bq,...B1,...A1],c)}
 if(ct)poly([...P(u0,v1,h1),...P(u1,v1,h1),...P(u1,v0,h1),...P(u0,v0,h1)],ct)}
function columns(P,u0,u1,v,h0,h1,n,t,col){for(let i=0;i<n;i++){const u=u0+(u1-u0)*(i+.5)/n,a=P(u,v,h0),b=P(u,v,h1);ctx.fillStyle=col;ctx.fillRect(a[0]-.06*t,b[1],.12*t,a[1]-b[1]);ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(a[0]+.02*t,b[1],.04*t,a[1]-b[1])}}
function pediment(P,u0,u1,v,h,ph,col){const a=P(u0,v,h),b=P(u1,v,h),c=P((u0+u1)/2,v,h+ph);poly([...a,...b,...c],col);ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.lineTo(...b);ctx.stroke()}
function cupola(P,u,v,h,t,col,top){const b=P(u,v,h);ctx.fillStyle=col;ctx.fillRect(b[0]-.22*t,b[1]-.55*t,.44*t,.55*t);ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(b[0],b[1]-.55*t,.22*t,.55*t);ctx.fillStyle='#2c3a44';for(const dx of[-.12,.08])ctx.fillRect(b[0]+dx*t,b[1]-.45*t,.06*t,.25*t);
 ctx.fillStyle=top||'#5f8e7c';ctx.beginPath();ctx.ellipse(b[0],b[1]-.55*t,.27*t,.4*t,0,Math.PI,0);ctx.fill();ctx.fillStyle='#d9a92a';ctx.fillRect(b[0]-.02*t,b[1]-1.1*t,.04*t,.18*t);ctx.beginPath();ctx.arc(b[0],b[1]-1.1*t,.04*t,0,7);ctx.fill()}
function clockFace(x,y,r){ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.4,r*.15);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-r*.7);ctx.moveTo(x,y);ctx.lineTo(x+r*.5,y+r*.1);ctx.stroke()}
function lawn(P,t,c){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],c||'#7fa056');if(t>=4.5){ctx.fillStyle='rgba(60,90,30,.15)';for(let i=0;i<8;i++){const p=P((hs(i*7)-.5)*3.4,(hs(i*11)-.5)*3.4);ctx.beginPath();ctx.ellipse(p[0],p[1],.3*t,.12*t,0,0,7);ctx.fill()}}}
function path_(P,pts,w,t,c){ctx.strokeStyle=c||'#d6c9a8';ctx.lineWidth=w*t;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.stroke()}
function wagon(P,u,v,t,body,horses){const p=P(u,v);ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(p[0]+.1*t,p[1],.45*t,.12*t,0,0,7);ctx.fill();ctx.fillStyle=body;ctx.fillRect(p[0]-.35*t,p[1]-.42*t,.55*t,.3*t);ctx.fillStyle=shade(body,.75);ctx.fillRect(p[0]+.2*t,p[1]-.42*t,.08*t,.3*t);ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();ctx.arc(p[0]-.25*t,p[1]-.1*t,.1*t,0,7);ctx.arc(p[0]+.12*t,p[1]-.1*t,.1*t,0,7);ctx.stroke();for(let i=0;i<(horses||1);i++)drawHorse(p[0]+.55*t+i*.04*t,p[1]+i*.06*t,1,0,Z*.8,['#6b4a2e','#3a2a20'][i%2],i)}
function people(P,list,t){for(const[u,v,k]of list){const p=P(u,v);drawPerson(p[0],p[1],Z*1.1,k)}}
const CIVIC={
 spital(o,P,t){lawn(P,t);path_(P,[[0,2],[0,.5]],.35,t);bldP(P,-1.85,-1.5,-.7,.1,1.6*t,1,3,t);gableP(P,-1.85,-1.5,-.7,.1,1.6*t,.45*t,'#8a4a36','#4a3e3a');bldP(P,.7,-1.5,1.85,.1,1.6*t,1,3,t);gableP(P,.7,-1.5,1.85,.1,1.6*t,.45*t,'#8a4a36','#4a3e3a');
  bldP(P,-.75,-1.7,.75,.35,2.4*t,12,4,t);nyMansard(nyFace(...P(0,-.675),.75,1.025,t,t/2),2.4*t,t,'#f1ebdd');box3(P,-.45,.45,.35,.75,0,.9*t,'#e9e2d2','#cfc6b2');columns(P,-.45,.45,.75,0,.9*t,4,t,'#f4efe3');pediment(P,-.5,.5,.75,.9*t,.35*t,'#e3dccb');cupola(P,0,-.7,3*t,t,'#ece6d8');skyFlag(...P(0,-.7,3.95*t),t);
  for(const[u,v]of[[-1.4,1.2],[1.4,1.2],[-1.5,.6],[1.5,.6]])treeR(...P(u,v),Z*1.05,TREEC[1]);wagon(P,.8,1.5,t,'#efe7d6',1);people(P,[[-.5,1.3,30],[.3,1.1,22],[-.8,1.6,13]],t)},
 feuerwehr(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');bldP(P,-1.6,-1.6,.6,.3,2*t,1,3,t);const F=nyFace(...P(-.5,-.65),1.1,.95,t,t/2);for(const f of['L','R'])nyBand(F,f,1.92*t,2.05*t,'#efe7d6',.05);
  for(const s of[.28,.72]){const a=F.L(s-.17,0),b=F.L(s+.17,0);ctx.fillStyle='#9c2a22';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-.75*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-1.1*t,b[0],b[1]-.75*t);ctx.lineTo(...b);ctx.fill();ctx.strokeStyle='#efe7d6';ctx.lineWidth=Math.max(.5,t*.03);ctx.stroke()}
  bldP(P,.6,-1.6,1.2,-1,3.6*t,1,6,t);const tp=P(.9,-1.3,3.6*t);ctx.fillStyle='#4f5a63';ctx.beginPath();ctx.moveTo(tp[0]-.42*t,tp[1]);ctx.lineTo(tp[0],tp[1]-.6*t);ctx.lineTo(tp[0]+.42*t,tp[1]);ctx.fill();ctx.fillStyle='#c9a227';ctx.beginPath();ctx.arc(tp[0],tp[1]-.2*t,.08*t,0,7);ctx.fill();
  const e=P(-.2,1.3);ctx.fillStyle='#b8322a';ctx.fillRect(e[0]-.4*t,e[1]-.35*t,.7*t,.2*t);ctx.fillStyle='#d9a92a';ctx.fillRect(e[0]+.05*t,e[1]-.8*t,.18*t,.5*t);ctx.beginPath();ctx.ellipse(e[0]+.14*t,e[1]-.8*t,.09*t,.04*t,0,0,7);ctx.fill();ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();ctx.arc(e[0]-.25*t,e[1]-.1*t,.12*t,0,7);ctx.arc(e[0]+.2*t,e[1]-.1*t,.12*t,0,7);ctx.stroke();for(let i=0;i<4;i++){ctx.fillStyle=`rgba(90,90,90,${.35-i*.07})`;ctx.beginPath();ctx.arc(e[0]+.14*t+i*.08*t,e[1]-1*t-i*.22*t,(.08+i*.05)*t,0,7);ctx.fill()}
  drawHorse(e[0]+.75*t,e[1],1,0,Z*.8,'#f4f1ea',0);drawHorse(e[0]+.8*t,e[1]+.08*t,1,0,Z*.8,'#d9d4c8',1);people(P,[[.9,.9,30],[1.2,1.1,24]],t)},
 polizei(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');bldP(P,-1.6,-1.6,1.2,.3,2.2*t,12,3,t);nyMansard(nyFace(...P(-.2,-.65),1.4,.95,t,t/2),2.2*t,t,'#f1ebdd');box3(P,-.4,.4,.3,.75,0,.15*t,'#cfc6b2','#b9b1a0','#e3dccb');
  for(const u of[-.45,.45]){const p=P(u,.8);ctx.fillStyle='#22262a';ctx.fillRect(p[0]-.03*t,p[1]-.7*t,.06*t,.7*t);ctx.fillStyle='#3f8a52';ctx.beginPath();ctx.arc(p[0],p[1]-.78*t,.1*t,0,7);ctx.fill();const g=ctx.createRadialGradient(p[0],p[1]-.78*t,0,p[0],p[1]-.78*t,.35*t);g.addColorStop(0,'rgba(120,220,140,.45)');g.addColorStop(1,'rgba(120,220,140,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1]-.78*t,.35*t,0,7);ctx.fill()}
  wagon(P,1,1.3,t,'#1f2a44',1);people(P,[[-.8,1.2,24],[.1,1.4,25],[-.2,1.0,0]],t);skyFlag(...P(1,-1.4,2.8*t),t)},
 kaffeehaus(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#b3aa97');bldP(P,-1.6,-1.7,1.2,0,2*t,9,4,t);nyMansard(nyFace(...P(-.2,-.85),1.4,.85,t,t/2),2*t,t,'#efe7d6');const F=nyFace(...P(-.2,-.85),1.4,.85,t,t/2);
  nyBand(F,'L',.05*t,.55*t,'rgba(255,214,140,.5)',0);const cols=['#2f5a3a','#efe3c8'];for(let i=0;i<8;i++){const a=F.L(i/8,.62*t),b=F.L((i+1)/8,.62*t);poly([...a,...b,b[0]-.2*t,b[1]+.22*t,a[0]-.2*t,a[1]+.22*t],cols[i%2])}
  for(const[u,v]of[[-1.2,.6],[-.4,.7],[.4,.6],[-.8,1.3],[0,1.4],[.8,1.3]]){const p=P(u,v);ctx.fillStyle='#4a3a2a';ctx.fillRect(p[0]-.015*t,p[1]-.25*t,.03*t,.25*t);ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.ellipse(p[0],p[1]-.25*t,.13*t,.06*t,0,0,7);ctx.fill();ctx.fillStyle=['#b8322a','#2f5a3a','#c9a227'][Math.abs(u*10|0)%3];ctx.beginPath();ctx.moveTo(p[0]-.3*t,p[1]-.75*t);ctx.lineTo(p[0],p[1]-1*t);ctx.lineTo(p[0]+.3*t,p[1]-.75*t);ctx.fill()}
  people(P,[[-1,.9,12],[-.2,1,3],[.6,.9,15],[-.6,1.6,7],[.2,1.7,14]],t)},
 chapel(o,P,t){lawn(P,t,'#86a24e');for(let i=0;i<12;i++){const p=P(.8+(i%4)*.3,.2+((i/4)|0)*.45);ctx.fillStyle='#b9b1a0';ctx.fillRect(p[0]-.05*t,p[1]-.16*t,.1*t,.16*t);ctx.beginPath();ctx.arc(p[0],p[1]-.16*t,.05*t,Math.PI,0);ctx.fill()}
  box3(P,-1.3,.6,-1.3,-.1,0,1.4*t,'#c9c1ae','#aaa290','#ddd6c4');gableP(P,-1.3,-1.3,.6,-.1,1.4*t,.9*t,'#aaa290','#4f5a63');const F=nyFace(...P(-.35,-.7),.95,.6,t,t/2);ctx.fillStyle='#2c3a44';for(let i=0;i<4;i++){const p=F.L((i+.5)/4,.4*t);ctx.beginPath();ctx.moveTo(p[0]-.06*t,p[1]);ctx.lineTo(p[0]-.06*t,p[1]-.5*t);ctx.lineTo(p[0],p[1]-.62*t);ctx.lineTo(p[0]+.06*t,p[1]-.5*t);ctx.lineTo(p[0]+.06*t,p[1]);ctx.fill()}
  const g=F.R(.5,1.6*t);ctx.fillStyle='#6b2f4a';ctx.beginPath();ctx.arc(g[0],g[1],.18*t,0,7);ctx.fill();ctx.strokeStyle='#efe7d6';ctx.lineWidth=Math.max(.4,t*.02);ctx.stroke();
  box3(P,.6,1.2,-.7,-.1,0,2.6*t,'#c9c1ae','#aaa290','#ddd6c4');const sp=P(.9,-.4,2.6*t);ctx.fillStyle='#4f5a63';ctx.beginPath();ctx.moveTo(sp[0]-.4*t,sp[1]);ctx.lineTo(sp[0],sp[1]-1.8*t);ctx.lineTo(sp[0]+.4*t,sp[1]);ctx.fill();ctx.fillStyle='#3f4850';ctx.beginPath();ctx.moveTo(sp[0],sp[1]-1.8*t);ctx.lineTo(sp[0]+.4*t,sp[1]);ctx.lineTo(sp[0]+.1*t,sp[1]);ctx.fill();ctx.strokeStyle='#d9a92a';ctx.lineWidth=Math.max(.5,t*.03);ctx.beginPath();ctx.moveTo(sp[0],sp[1]-1.8*t);ctx.lineTo(sp[0],sp[1]-2.1*t);ctx.moveTo(sp[0]-.08*t,sp[1]-2*t);ctx.lineTo(sp[0]+.08*t,sp[1]-2*t);ctx.stroke();clockFace(...P(.6,-.4,2.1*t),.12*t);
  for(const[u,v]of[[-1.6,1.2],[1.6,1.5],[-1.6,-1.6]])treeR(...P(u,v),Z*1.05,TREEC[0]);people(P,[[-.4,1.2,35],[0,1.4,5],[.2,1.3,11]],t)},
 bank(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#b3aa97');for(let i=0;i<3;i++)box3(P,-1.6+i*.08,1.6-i*.08,-1.6+i*.08,.9-i*.08,i*.1*t,(i+1)*.1*t,'#d9d2c2','#bdb4a2','#e9e2d2');
  box3(P,-1.3,1.3,-1.4,.2,.3*t,1.9*t,'#e3dccb','#c9c1ae');columns(P,-1.25,1.25,.65,.3*t,1.75*t,6,t,'#f4efe3');box3(P,-1.35,1.35,.2,.75,1.75*t,1.95*t,'#e9e2d2','#cfc6b2','#f1ebdd');pediment(P,-1.35,1.35,.75,1.95*t,.55*t,'#e3dccb');poly([...P(-1.35,.75,1.95*t),...P(-1.35,-1.4,1.95*t),...P(1.35,-1.4,1.95*t),...P(1.35,.75,1.95*t)],'#9a948a');
  {const a=P(-.15,.2,.3*t),b=P(.15,.2,.3*t);poly([...a,...b,b[0],b[1]-.6*t,a[0],a[1]-.6*t],'#6b4a2e')}skyFlag(...P(0,-.6,2.5*t),t);people(P,[[-.6,1.4,1],[.5,1.3,10],[1,1.6,3]],t)},
 tram(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');ctx.strokeStyle='#5a5650';ctx.lineWidth=Math.max(.6,t*.03);ctx.beginPath();for(const u of[-1,-.2,.6]){for(const d of[-.1,.1]){ctx.moveTo(...P(u+d,.2));ctx.lineTo(...P(u+d,1.95))}}ctx.stroke();
  bldP(P,-1.7,-1.7,1.5,.2,1.5*t,1,2,t);gableP(P,-1.7,-1.7,1.5,.2,1.5*t,.5*t,'#8a4a36','#4f5a63');const F=nyFace(...P(-.1,-.75),1.6,.95,t,t/2);for(const u of[-1,-.2,.6]){const s=(u+1.7)/3.2,a=F.L(s-.1,0),b=F.L(s+.1,0);ctx.fillStyle='#2a2c30';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-.7*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-1*t,b[0],b[1]-.7*t);ctx.lineTo(...b);ctx.fill()}
  const sx=o.x+1.5,sy=o.y+1.5;drawTram([sx-.2+.3,sy+1.1],[sx-.2+.3,sy+.2],RES().electric,o.x)},
 heuriger(o,P,t){lawn(P,t,'#7a9a48');for(const[u,v]of[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.2],[0,-1.7]])treeR(...P(u,v),Z*1.05,TREEC[2]);
  const bp=P(-1,-1);ctx.fillStyle='#efe7d6';for(let i=0;i<6;i++){const a=i*Math.PI/3,x=bp[0]+Math.cos(a)*.4*t,y=bp[1]+Math.sin(a)*.2*t;ctx.fillRect(x-.02*t,y-.6*t,.04*t,.6*t)}ctx.fillStyle='#5f8e7c';ctx.beginPath();ctx.moveTo(bp[0]-.5*t,bp[1]-.6*t);ctx.lineTo(bp[0],bp[1]-1*t);ctx.lineTo(bp[0]+.5*t,bp[1]-.6*t);ctx.fill();
  for(let r=0;r<3;r++){const v=-.2+r*.6;box3(P,-.4,1.4,v-.08,v+.08,.18*t,.24*t,'#8a6a44','#6b4f30','#a07a50');for(const s of[-.2,.2])box3(P,-.4,1.4,v+s-.04,v+s+.04,.08*t,.12*t,'#6b4f30','#5a4028','#8a6a44')}
  ctx.strokeStyle='rgba(60,50,40,.6)';ctx.lineWidth=Math.max(.3,t*.012);for(let k=0;k<3;k++){const a=P(-1.6,-.5+k*.7,1.4*t),b=P(1.6,-.5+k*.7,1.4*t);ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+.3*t,...b);ctx.stroke();for(let i=1;i<8;i++){const f=i/8,x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f+Math.sin(f*Math.PI)*.3*t;ctx.fillStyle=['#f0c040','#e8783a','#f4f1ea'][i%3];ctx.beginPath();ctx.arc(x,y+.06*t,.05*t,0,7);ctx.fill()}}
  people(P,[[0,.2,0],[.6,.3,13],[1,.9,6],[.2,.9,22],[-.2,1.4,15],[.8,1.5,3]],t)},
 eislauf(o,P,t){lawn(P,t,'#86a24e');const c=P(.2,.2);ctx.fillStyle='#dfeaf0';ctx.beginPath();ctx.ellipse(c[0],c[1],1.9*t,.9*t,0,0,7);ctx.fill();ctx.strokeStyle='rgba(150,180,200,.6)';ctx.lineWidth=Math.max(.4,t*.02);for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(c[0],c[1],(.4+i*.25)*t,(.2+i*.12)*t,0,0,7);ctx.stroke()}
  box3(P,-1.8,-1,-1.8,-1.2,0,.7*t,'#9a7448','#7a5532');gableP(P,-1.8,-1.8,-1,-1.2,.7*t,.35*t,'#7a5532','#9c3a2e');skyFlag(...P(-1.4,-1.5,1.05*t),t*.8);
  for(let i=0;i<8;i++){const a=i*.8+performance.now()/4000,p=[c[0]+Math.cos(a)*(.8+i%3*.35)*t,c[1]+Math.sin(a)*(.4+i%3*.17)*t];drawPerson(p[0],p[1],Z*1.1,[0,12,3,14,22,33,5,16][i])}},
 reitschule(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#c9b48a');bldP(P,-1.8,-1.8,1.6,-.2,1.3*t,9,2,t);const a=P(-1.8,-.2,1.3*t),b=P(1.6,-.2,1.3*t),c=P(1.6,-1.8,1.3*t),ra=P(-1.8,-1,2.2*t),rb=P(1.6,-1,2.2*t);
  ctx.fillStyle='#4f5a63';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.quadraticCurveTo(b[0],rb[1],...rb);ctx.lineTo(...ra);ctx.quadraticCurveTo(a[0],ra[1],...a);ctx.fill();ctx.fillStyle='#3f4850';ctx.beginPath();ctx.moveTo(...b);ctx.quadraticCurveTo(b[0],rb[1],...rb);ctx.quadraticCurveTo(c[0],rb[1],...c);ctx.fill();
  fence(P,4,t);const h=P(.4,1);drawHorse(h[0],h[1],1,0,Z*.85,'#3a2a20',performance.now()/120);drawPerson(h[0]+.05*t,h[1]-.25*t,Z*1.1,1);const h2=P(-.8,1.3);drawHorse(h2[0],h2[1],-1,0,Z*.85,'#8a6a4a',performance.now()/120+1)},
 kaserne(o,P,t){CIVIC.rossauer(o,P,t)},
 rossauer(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');bldP(P,-1.6,-1.6,1.4,.4,2*t,1,3,t);const crenel=(u0,v0,u1,v1,h)=>{for(let i=0;i<10;i++){const f=(i+.25)/10;box3(P,u0+(u1-u0)*f,u0+(u1-u0)*(f+.05),v1-.06,v1,h,h+.15*t,'#8a4a36','#6e3226','#a85a3e');box3(P,u1-.06,u1,v0+(v1-v0)*f,v0+(v1-v0)*(f+.05),h,h+.15*t,'#8a4a36','#6e3226','#a85a3e')}};crenel(-1.6,-1.6,1.4,.4,2*t);
  for(const[u,v]of[[-1.6,.4],[1.4,.4],[1.4,-1.6]]){const p=P(u,v);ctx.fillStyle='#9c4a32';ctx.fillRect(p[0]-.3*t,p[1]-2.9*t,.6*t,2.9*t);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(p[0],p[1]-2.9*t,.3*t,2.9*t);for(let i=0;i<4;i++){ctx.fillStyle='#a85a3e';ctx.fillRect(p[0]-.3*t+i*.17*t,p[1]-3.05*t,.1*t,.16*t)}ctx.fillStyle='#2c3a44';ctx.fillRect(p[0]-.04*t,p[1]-2.3*t,.08*t,.3*t)}
  const F=nyFace(...P(-.1,-.6),1.5,1,t,t/2),g1=F.L(.42,0),g2=F.L(.58,0);ctx.fillStyle='#2a2522';ctx.beginPath();ctx.moveTo(...g1);ctx.lineTo(g1[0],g1[1]-.8*t);ctx.quadraticCurveTo((g1[0]+g2[0])/2,(g1[1]+g2[1])/2-1.2*t,g2[0],g2[1]-.8*t);ctx.lineTo(...g2);ctx.fill();skyFlag(...P(1.4,-1.6,3.05*t),t);people(P,[[0,1.2,29],[.3,1.3,29]],t)},
 muell(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#9a9284');bldP(P,-1.7,-1.7,.6,-.4,1.2*t,4,2,t);gableP(P,-1.7,-1.7,.6,-.4,1.2*t,.45*t,'#56483c','#4a3e3a');wagon(P,-.6,.6,t,'#f4f1ea',1);wagon(P,.6,1.3,t,'#f4f1ea',1);people(P,[[.2,.4,29],[-.2,1.2,22]],t)},
 hofburg(o,P,t){lawn(P,t,'#86a24e');path_(P,[[0,2],[0,.6]],.5,t,'#d9cdb1');bldP(P,-1.85,-1.3,-.6,.3,1.5*t,3,2,t);bldP(P,.6,-1.3,1.85,.3,1.5*t,3,2,t);bldP(P,-.7,-1.4,.7,.5,1.8*t,3,2,t);columns(P,-.6,.6,.55,.0,1.6*t,6,t,'#f4efe3');
  box3(P,-.4,.4,-.8,0,1.8*t,2.6*t,'#ece6d8','#cfc6b2','#f1ebdd');box3(P,-.28,.28,-.68,-.12,2.6*t,3.2*t,'#ece6d8','#cfc6b2');faceClock(P(-1,0,2.25*t),P(0,0,2.25*t),.16*t);faceClock(P(.4,1,2.25*t),P(.4,-.4,2.25*t),.16*t);cupola(P,0,-.4,3.2*t,t*.9,'#ece6d8','#5f8e7c');const st=P(0,-.4,4.2*t);ctx.fillStyle='#c9a227';ctx.fillRect(st[0]-.03*t,st[1]-.3*t,.06*t,.3*t);
  for(const[u,v]of[[-1.5,1.3],[1.5,1.3],[-1.2,1.7],[1.2,1.7]])treeR(...P(u,v),Z*1.05,TREEC[1]);people(P,[[-.3,1.4,1],[.2,1.6,13],[.5,1.2,3]],t)},
 votiv(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#b3aa97');box3(P,-1.6,1,-1,-.1,0,1.8*t,'#ece8de','#d4cfc2','#f4f1ea');gableP(P,-1.6,-1,1,-.1,1.8*t,1*t,'#d4cfc2','#5a6a70');box3(P,-.6,.1,-1.7,.6,0,1.6*t,'#ece8de','#d4cfc2');
  const F=nyFace(...P(-.3,-.55),1.3,.45,t,t/2);ctx.fillStyle='#2c3a44';for(let i=0;i<6;i++){const p=F.L((i+.5)/6,.3*t);ctx.beginPath();ctx.moveTo(p[0]-.07*t,p[1]);ctx.lineTo(p[0]-.07*t,p[1]-.8*t);ctx.lineTo(p[0],p[1]-1*t);ctx.lineTo(p[0]+.07*t,p[1]-.8*t);ctx.lineTo(p[0]+.07*t,p[1]);ctx.fill()}
  for(const v of[-1.2,.2]){box3(P,1,1.6,v,v+.5,0,3.4*t,'#ece8de','#d4cfc2','#f4f1ea');const b=P(1.3,v+.25,3.4*t);ctx.fillStyle='#e3ded2';ctx.beginPath();ctx.moveTo(b[0]-.35*t,b[1]);ctx.lineTo(b[0],b[1]-2.2*t);ctx.lineTo(b[0]+.35*t,b[1]);ctx.fill();ctx.fillStyle='#c9c3b6';ctx.beginPath();ctx.moveTo(b[0],b[1]-2.2*t);ctx.lineTo(b[0]+.35*t,b[1]);ctx.lineTo(b[0]+.08*t,b[1]);ctx.fill();
   for(const dx of[-.3,.3]){ctx.fillStyle='#e3ded2';ctx.beginPath();ctx.moveTo(b[0]+dx*t-.06*t,b[1]);ctx.lineTo(b[0]+dx*t,b[1]-.45*t);ctx.lineTo(b[0]+dx*t+.06*t,b[1]);ctx.fill()}ctx.fillStyle='#2c3a44';const w=P(1.6,v+.25,2.4*t);ctx.fillRect(w[0]-.06*t,w[1]-.6*t,.12*t,.6*t)}
  const r=P(1.6,-.2,2*t);ctx.fillStyle='#6b2f4a';ctx.beginPath();ctx.arc(r[0],r[1],.25*t,0,7);ctx.fill();ctx.strokeStyle='#f4f1ea';ctx.lineWidth=Math.max(.5,t*.03);ctx.stroke();people(P,[[1.8,0,35],[1.8,.5,13],[1.9,-.4,3]],t)},
 universitaet(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#b3aa97');for(let i=0;i<3;i++)box3(P,-1.7,1.7,-1.6,.9-i*.1,i*.1*t,(i+1)*.1*t,'#e3dccb','#c9c1ae','#ece6d8');
  bldP(P,-1.8,-1.6,1.8,.3,1.9*t,12,3,t);box3(P,-.9,.9,.3,.75,.3*t,1.9*t,'#ece6d8','#d4ccb9');for(let i=0;i<3;i++){const u=-.6+i*.6,a=P(u-.18,.75,.3*t),b=P(u+.18,.75,.3*t);ctx.fillStyle='#2a2c30';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-.8*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-1.2*t,b[0],b[1]-.8*t);ctx.lineTo(...b);ctx.fill()}columns(P,-.9,.9,.8,.3*t,1.9*t,6,t,'#f4efe3');box3(P,-.95,.95,.3,.85,1.9*t,2.15*t,'#f1ebdd','#d4ccb9','#f4efe3');
  for(const u of[-.6,.6]){const p=P(u,1.3,.3*t);ctx.fillStyle='#d4ccb9';ctx.fillRect(p[0]-.2*t,p[1]-.15*t,.4*t,.15*t);ctx.fillStyle='#c9c1ae';ctx.beginPath();ctx.ellipse(p[0],p[1]-.25*t,.18*t,.1*t,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(p[0]+.12*t,p[1]-.35*t,.07*t,0,7);ctx.fill()}people(P,[[-.3,1.6,3],[.2,1.7,12],[1,1.5,0]],t)},
 burgtheater(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');bldP(P,-1.8,-1.8,1.8,.4,2.2*t,12,4,t);box3(P,-1.3,1.3,.4,.8,0,2.5*t,'#ece6d8','#d4ccb9','#f4efe3');
  for(let i=0;i<3;i++){const u=-.85+i*.85,a=P(u-.28,.8,.2*t),b=P(u+.28,.8,.2*t);ctx.fillStyle='#3a4a58';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-1.4*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-2*t,b[0],b[1]-1.4*t);ctx.lineTo(...b);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=Math.max(.4,t*.015);ctx.beginPath();for(let k=1;k<4;k++){ctx.moveTo(a[0]+(b[0]-a[0])*k/4,a[1]+(b[1]-a[1])*k/4);ctx.lineTo(a[0]+(b[0]-a[0])*k/4,a[1]+(b[1]-a[1])*k/4-1.5*t)}ctx.stroke()}
  columns(P,-1.3,1.3,.85,.2*t,2.3*t,8,t,'#f4efe3');const top=P(0,.8,2.5*t);faceClock(P(-1,.8,2.85*t),P(0,.8,2.85*t),.28*t);ctx.fillStyle='#c9b48a';ctx.beginPath();ctx.ellipse(top[0],top[1]-.8*t,.5*t,.3*t,0,Math.PI,0);ctx.fill();ctx.fillStyle='#8a9a8a';ctx.beginPath();ctx.arc(top[0],top[1]-1.05*t,.12*t,0,7);ctx.fill();skyFlag(...P(1.5,-1.5,2.4*t),t);people(P,[[-.8,1.4,0],[-.3,1.3,12],[.3,1.5,3],[.9,1.3,13],[0,1.7,24]],t)},
 oper(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');bldP(P,-1.8,-1.8,1.6,.5,2.4*t,6,4,t);nyMansard(nyFace(...P(-.1,-.65),1.7,1.15,t,t/2),2.4*t,t,'#efe7d6');const F=nyFace(...P(-.1,-.65),1.7,1.15,t,t/2);
  for(let i=0;i<7;i++){const a=F.L((i+.15)/7,0),b=F.L((i+.85)/7,0);ctx.fillStyle='#2a2c30';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-.5*t);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-.75*t,b[0],b[1]-.5*t);ctx.lineTo(...b);ctx.fill();ctx.fillStyle='rgba(255,214,130,.6)';ctx.fillRect((a[0]+b[0])/2-.04*t,(a[1]+b[1])/2-.4*t,.08*t,.3*t)}
  wagon(P,.8,1.3,t,'#1d1b1a',2);people(P,[[-.6,1.3,1],[-.3,1.2,12],[0,1.4,3],[.3,1.5,15]],t)}};
CIVIC.musikverein=(o,P,t)=>{CIVIC.oper(o,P,t)};CIVIC.sperl=(o,P,t)=>{CIVIC.kaffeehaus(o,P,t)};CIVIC.imperial=(o,P,t)=>{poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#a39d90');bldP(P,-1.6,-1.6,1.4,.4,3.6*t,9,9,t);nyMansard(nyFace(...P(-.1,-.6),1.5,1,t,t/2),3.6*t,t,'#efe7d6');for(const[u,v]of[[-1.6,.4],[1.4,-1.6]]){const b=P(u,v,3.6*t);ctx.fillStyle='#4f5a63';ctx.beginPath();ctx.moveTo(b[0]-.3*t,b[1]);ctx.lineTo(b[0],b[1]-1*t);ctx.lineTo(b[0]+.3*t,b[1]);ctx.fill()}skyFlag(...P(0,-.6,4.2*t),t);wagon(P,.8,1.3,t,'#1d1b1a',2);people(P,[[-.5,1.3,1],[0,1.4,12]],t)};
CIVIC.epstein=(o,P,t)=>{lawn(P,t,'#86a24e');bldP(P,-1.4,-1.5,1.2,.2,2.2*t,12,3,t);const F=nyFace(...P(-.1,-.65),1.3,.85,t,t/2);nyMansard(F,2.2*t,t,'#f1ebdd');for(const[u,v]of[[-1.4,.2],[1.2,-1.5]]){const p=P(u,v);ctx.fillStyle='#e9e2d2';ctx.fillRect(p[0]-.28*t,p[1]-3*t,.56*t,3*t);ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(p[0],p[1]-3*t,.28*t,3*t);ctx.fillStyle='#4f5a63';ctx.beginPath();ctx.moveTo(p[0]-.34*t,p[1]-3*t);ctx.lineTo(p[0],p[1]-4.1*t);ctx.lineTo(p[0]+.34*t,p[1]-3*t);ctx.fill()}for(const[u,v]of[[-1.6,1.4],[1.5,1.2]])treeR(...P(u,v),Z*1.05,TREEC[1])};
/* trams that look like trams */
function drawTram(pa,pb,electric,seed){const dx=pb[0]-pa[0],dy=pb[1]-pa[1],l=Math.hypot(dx,dy)||1,ax=dx/l,ay=dy/l,px=-ay,py=ax,t=32*Z*.78,cx=(pa[0]+pb[0])/2,cy=(pa[1]+pb[1])/2,len=(electric?1.15:.95)*.78,w=.2*.78;
 const P=(u,v,h)=>{const[sx,sy]=scr(cx+ax*u*len+px*v,cy+ay*u*len+py*v);return[sx,sy-h*t]};
 const body=electric?['#c9a227','#efe3c8','#7a2a22']:['#2f6a4a','#efe3c8','#c9a227'][0]?(seed%3===0?['#b8322a','#efe3c8','#c9a227']:seed%3===1?['#2f6a4a','#efe3c8','#c9a227']:['#c9a227','#efe3c8','#7a2a22']):0;
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();const s0=P(-.5,-w,0),s1=P(.5,-w,0),s2=P(.5,w,0),s3=P(-.5,w,0);ctx.moveTo(s0[0]+2,s0[1]+2);ctx.lineTo(s1[0]+2,s1[1]+2);ctx.lineTo(s2[0]+2,s2[1]+2);ctx.lineTo(s3[0]+2,s3[1]+2);ctx.fill();
 box3(P,-.5,.5,-w,w,.06,.32,shade(body[0],1.05),shade(body[0],.82),null);box3(P,-.42,.42,-w,w,.32,.62,shade(body[1],1.02),shade(body[1],.85),null);
 const win=(side)=>{for(let i=0;i<6;i++){const u0=-.4+i*.135,u1=u0+.1,v=side*w,a=P(u0,v,.37),b=P(u1,v,.37),c=P(u1,v,.58),d=P(u0,v,.58);poly([...a,...b,...c,...d],'#3a4a58');if(hs(seed*7+i+side)<.6){const m=P((u0+u1)/2,v,.45);ctx.fillStyle='#2a2522';ctx.beginPath();ctx.arc(m[0],m[1],.04*t,0,7);ctx.fill()}}};
 const visL=(P(0,w,0)[1]>P(0,-w,0)[1]);win(visL?1:-1);
 box3(P,-.5,.5,-w-.02,w+.02,.62,.66,'#4a4540','#3a3530','#5a5550');box3(P,-.3,.3,-w*.55,w*.55,.66,.76,'#efe3c8','#d9cdb1','#6b5a4a');
 for(const e of[-.58,.58]){const a=P(e,0,.06);box3(P,Math.min(e,e*.86),Math.max(e,e*.86),-w*.85,w*.85,.06,.1,'#4a4540','#3a3530','#5a5550')}
 ctx.fillStyle='#1d1b1a';for(const u of[-.32,.32]){const p=P(u,visL?w:-w,.04);ctx.beginPath();ctx.arc(p[0],p[1],.06*t,0,7);ctx.fill()}
 const sign=P(electric?.5:-.5,0,.72);ctx.fillStyle='#f4f1ea';ctx.fillRect(sign[0]-.12*t,sign[1]-.06*t,.24*t,.09*t);ctx.fillStyle='#2a2522';ctx.fillRect(sign[0]-.08*t,sign[1]-.03*t,.16*t,.025*t);
 const dr=P(.55,0,.06);drawPerson(dr[0],dr[1],Z*1.1,electric?24:29);
 if(electric){const b=P(-.2,0,.76),tp=P(-.75,0,1.35);ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.6,t*.02);ctx.beginPath();ctx.moveTo(...b);ctx.lineTo(...tp);ctx.stroke();ctx.fillStyle='#2a2522';ctx.beginPath();ctx.arc(tp[0],tp[1],.03*t,0,7);ctx.fill();const hl=P(.62,0,.25);ctx.fillStyle='rgba(255,230,160,.9)';ctx.beginPath();ctx.arc(hl[0],hl[1],.04*t,0,7);ctx.fill()}
 else{const h1=P(.82,-.07,0),h2=P(.82,.07,0),ux_=scr(cx+ax,cy+ay)[0]-scr(cx,cy)[0],uy_=scr(cx+ax,cy+ay)[1]-scr(cx,cy)[1],ul=Math.hypot(ux_,uy_)||1;drawHorse(h1[0],h1[1],ux_/ul,uy_/ul,Z*.85,HORSE[seed%HORSE.length],performance.now()/90);drawHorse(h2[0],h2[1],ux_/ul,uy_/ul,Z*.85,HORSE[(seed+1)%HORSE.length],performance.now()/90+1.3)}}

/* ===================== correct depth: lamps, trams and ships are drawn in their tile's turn ===================== */
function buildOQ(hw,hh){const Q=new Map(),add=(x,y,f)=>{const k=Math.round(y)*W+Math.round(x);let a=Q.get(k);if(!a)Q.set(k,a=[]);a.push(f)};
 if(Z>=.35&&S){if(LAMPK!==GV){LAMPK=GV;LAMPS=[];for(const o of S.list){if(o.t!=='road')continue;const i=o.y*W+o.x;if(ZONE[i]>1)continue;if(roadNb(i).length>=3&&hs(i*5)<.7)LAMPS.push([o.x,o.y])}}for(const[x,y]of LAMPS)add(x,y,()=>lampOne(x,y))}
 if(typeof TRAMS!=='undefined')for(const tr of TRAMS){const p=tr.p,L_=p.length-1,q0=tr.f*L_,q1=q0+(tr.dir>0?-1:1)*1.2;if(q1<0||q1>L_)continue;const pa=posOn(p,q0),pb=posOn(p,q1),fr=VY(pa[0],pa[1])>VY(pb[0],pb[1])?pa:pb;add(fr[0],fr[1],()=>drawTram(pb,pa,!!RES().electric,(p.length*7)|0))}
 if(PIERS&&Z>.12)for(const p of PIERS){if(!p.ship)continue;const x=p.x+p.dx*p.len*.55-p.dy*1.35,y=p.y+p.dy*p.len*.55+p.dx*1.35;add(x,y,()=>drawShip(x,y,p.dx,p.dy,p.ship===1?2.4:1.9,p.ship===1?'ship':'steamer'))}
 if(Z>=.35&&S.t>=yT(1870,1))for(const[x,y,d]of poleList())add(x+.38,y-.38,()=>drawPole(x,y,d));
 if(RES().electric&&TL&&TL.size&&Z>=.3){const t=32*Z;for(const[i,nb]of TL){const x=i%W,y=(i/W)|0;for(const n of nb){if(n<i)continue;const nx=n%W,ny=(n/W)|0;add(Math.max(x,nx),Math.max(y,ny),()=>{const a=scr(x,y),b=scr(nx,ny);ctx.strokeStyle='rgba(30,28,26,.6)';ctx.lineWidth=Math.max(.4,Z*.4);ctx.beginPath();for(const o of[-.05,.05]){ctx.moveTo(a[0]+o*t,a[1]-.55*t);ctx.lineTo(b[0]+o*t,b[1]-.55*t)}ctx.stroke()})}}}
 for(const k of S.carts){if(k.path.length<2)continue;const j=Math.min(Math.floor(k.s),k.path.length-2),f=k.s-j,a=k.path[j],b=k.path[j+1],x=(a%W)*(1-f)+(b%W)*f,y=(a/W|0)*(1-f)+(b/W|0)*f,ri=Math.round(y)*W+Math.round(x);if(!(S.b[ri]&&S.b[ri].t==='road'))continue;if(k.hc===undefined)k.hc=(Math.random()*8)|0;const hc=k.hc;add(x,y,()=>drawDelivery(x,y,(b%W)-(a%W),((b/W)|0)-((a/W)|0),k.g,hc))}
 for(const b of BOATS){if(!b)continue;const[x,y,ddx,ddy]=boatPos(b);add(x,y,()=>drawShip(x,y,ddx||1,ddy,b.kind==='ferry'?1.15:b.kind==='schooner'?1.6:b.kind==='tug'?1:1.1,b.kind))}
 return Q}
function lampOne(x,y){const z=Z*.8,lit=NF>.12,[sx,sy]=scr(x+.42,y+.42);if(sx<-20||sx>vw+20||sy<-50||sy>vh+20)return;
 ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+3*z,sy+.6*z,4*z,1*z,0,0,7);ctx.fill();ctx.fillStyle='#22262a';ctx.beginPath();ctx.moveTo(sx-1.3*z,sy);ctx.lineTo(sx+1.3*z,sy);ctx.lineTo(sx+.8*z,sy-2.2*z);ctx.lineTo(sx-.8*z,sy-2.2*z);ctx.fill();
 ctx.fillStyle='#2a2f34';ctx.beginPath();ctx.moveTo(sx-.55*z,sy-2.2*z);ctx.lineTo(sx+.55*z,sy-2.2*z);ctx.lineTo(sx+.32*z,sy-15*z);ctx.lineTo(sx-.32*z,sy-15*z);ctx.fill();ctx.fillStyle='#3a4046';ctx.fillRect(sx-.7*z,sy-6*z,1.4*z,.6*z);ctx.fillRect(sx-1.6*z,sy-14.6*z,3.2*z,.5*z);
 const gy=sy-15.2*z;ctx.fillStyle=lit?'rgba(255,214,130,.95)':'rgba(222,226,214,.85)';ctx.beginPath();ctx.moveTo(sx-1.2*z,gy);ctx.lineTo(sx+1.2*z,gy);ctx.lineTo(sx+1.7*z,gy-3.4*z);ctx.lineTo(sx-1.7*z,gy-3.4*z);ctx.fill();ctx.strokeStyle='#22262a';ctx.lineWidth=Math.max(.4,.3*z);ctx.beginPath();ctx.moveTo(sx,gy);ctx.lineTo(sx,gy-3.4*z);ctx.stroke();
 ctx.fillStyle='#22262a';ctx.beginPath();ctx.moveTo(sx-2*z,gy-3.4*z);ctx.lineTo(sx+2*z,gy-3.4*z);ctx.lineTo(sx,gy-5.2*z);ctx.fill();ctx.fillRect(sx-.25*z,gy-6.2*z,.5*z,1*z);
 if(lit){const g=ctx.createRadialGradient(sx,gy-1.7*z,0,sx,gy-1.7*z,9*z);g.addColorStop(0,'rgba(255,205,120,.35)');g.addColorStop(1,'rgba(255,205,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,gy-1.7*z,9*z,0,7);ctx.fill()}}
/* ===================== precise faces: light, edges, stone courses, slates ===================== */
function faceFill(pts,col,t,courses){if(typeof col!=='string'||col[0]!=='#'){poly(pts,col);return}let y0=1e9,y1=-1e9;for(let k=1;k<pts.length;k+=2){y0=Math.min(y0,pts[k]);y1=Math.max(y1,pts[k])}
 const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,1.07));g.addColorStop(1,shade(col,.9));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let k=2;k<pts.length;k+=2)ctx.lineTo(pts[k],pts[k+1]);ctx.closePath();ctx.fill();
 if(courses&&t>=6&&pts.length===8){ctx.save();ctx.clip();ctx.strokeStyle='rgba(0,0,0,.07)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();const[ax,ay,bx,by,cx_,cy_,dx,dy]=pts;for(let f=.1;f<1;f+=.1){ctx.moveTo(ax+(dx-ax)*f,ay+(dy-ay)*f);ctx.lineTo(bx+(cx_-bx)*f,by+(cy_-by)*f)}ctx.stroke();ctx.restore()}
 ctx.strokeStyle='rgba(30,25,20,.22)';ctx.lineWidth=Math.max(.4,t*.015);ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let k=2;k<pts.length;k+=2)ctx.lineTo(pts[k],pts[k+1]);ctx.closePath();ctx.stroke()}
function box3(P,u0,u1,v0,v1,h0,h1,cl,cr,ct,cb){const t=Math.abs(P(1,0)[0]-P(0,0)[0]),faces=[[[u0,v1],[u1,v1],cl],[[u1,v1],[u1,v0],cr],[[u1,v0],[u0,v0],cb||cl],[[u0,v0],[u0,v1],cb||cr]];
 const C0=P((u0+u1)/2,(v0+v1)/2,h0),vis=faces.filter(([a,b])=>P((a[0]+b[0])/2,(a[1]+b[1])/2,h0)[1]>C0[1]+.01).sort((x,y)=>P((x[0][0]+x[1][0])/2,(x[0][1]+x[1][1])/2,h0)[1]-P((y[0][0]+y[1][0])/2,(y[0][1]+y[1][1])/2,h0)[1]);
 for(const[a,b,c]of vis){const A=P(a[0],a[1],h0),Bq=P(b[0],b[1],h0),A1=P(a[0],a[1],h1),B1=P(b[0],b[1],h1),lit=(Bq[1]-A[1])*(Bq[0]-A[0])>0?1:.86;faceFill([...A,...Bq,...B1,...A1],typeof c==='string'&&c[0]==='#'&&lit<1&&c===cl?shade(c,.84):c,t,true)}
 if(!ct&&typeof cl==='string'&&cl[0]==='#')ct=shade(cl,1.1);if(ct){faceFill([...P(u0,v1,h1),...P(u1,v1,h1),...P(u1,v0,h1),...P(u0,v0,h1)],ct,t,false);ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=Math.max(.5,t*.02);ctx.beginPath();ctx.moveTo(...P(u0,v1,h1));ctx.lineTo(...P(u1,v1,h1));ctx.lineTo(...P(u1,v0,h1));ctx.stroke()}}
function boxP(P,u0,v0,u1,v1,h0,h1,cl,cr,ct){box3(P,u0,u1,v0,v1,h0,h1,cl,cr,ct)}
function gableP(P,u0,v0,u1,v1,h,rh,wall,roof){const t=Math.abs(P(1,0)[0]-P(0,0)[0]),vm=(v0+v1)/2,A=P(u0,v1,h),Bq=P(u1,v1,h),C=P(u1,v0,h),Rl=P(u0,vm,h+rh),Rr=P(u1,vm,h+rh);
 faceFill([...A,...Bq,...Rr,...Rl],roof,t,false);if(t>=5&&typeof roof==='string'&&roof[0]==='#'){ctx.strokeStyle='rgba(0,0,0,.14)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();for(let f=.12;f<1;f+=.12){ctx.moveTo(A[0]+(Rl[0]-A[0])*f,A[1]+(Rl[1]-A[1])*f);ctx.lineTo(Bq[0]+(Rr[0]-Bq[0])*f,Bq[1]+(Rr[1]-Bq[1])*f)}ctx.stroke()}
 faceFill([...Bq,...C,...Rr],wall,t,true);ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=Math.max(.5,t*.02);ctx.beginPath();ctx.moveTo(...Rl);ctx.lineTo(...Rr);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...Bq);ctx.stroke()}
/* ===================== Gothic churches built stone by stone ===================== */
function lancet(a,b,hgt,glass,t){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],w=Math.hypot(b[0]-a[0],b[1]-a[1]);ctx.fillStyle='rgba(60,55,50,.55)';ctx.beginPath();ctx.moveTo(a[0]-1,a[1]+1);ctx.lineTo(a[0]-1,a[1]-hgt*.72);ctx.quadraticCurveTo(a[0],m[1]-hgt*1.02,m[0],m[1]-hgt-1.2);ctx.quadraticCurveTo(b[0],m[1]-hgt*1.02,b[0]+1,b[1]-hgt*.72);ctx.lineTo(b[0]+1,b[1]+1);ctx.fill();
 const g=ctx.createLinearGradient(0,m[1]-hgt,0,m[1]);g.addColorStop(0,glass[0]);g.addColorStop(.5,glass[1]);g.addColorStop(1,glass[2]);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(a[0],a[1]-hgt*.72);ctx.quadraticCurveTo(a[0],m[1]-hgt*.98,m[0],m[1]-hgt);ctx.quadraticCurveTo(b[0],m[1]-hgt*.98,b[0],b[1]-hgt*.72);ctx.lineTo(...b);ctx.fill();
 if(t>=6){ctx.strokeStyle='rgba(230,225,210,.7)';ctx.lineWidth=Math.max(.4,t*.012);ctx.beginPath();ctx.moveTo(m[0],m[1]);ctx.lineTo(m[0],m[1]-hgt*.8);for(const f of[.3,.6])ctx.moveTo(a[0]+(b[0]-a[0])*.1,a[1]+(b[1]-a[1])*.1-hgt*f),ctx.lineTo(b[0]-(b[0]-a[0])*.1,b[1]-(b[1]-a[1])*.1-hgt*f);ctx.stroke()}}
function rose(x,y,r,t){ctx.fillStyle='rgba(60,55,50,.6)';ctx.beginPath();ctx.ellipse(x,y,r*1.12,r*1.12,0,0,7);ctx.fill();const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#d9a92a');g.addColorStop(.45,'#8a2a3a');g.addColorStop(1,'#2f4f8a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
 ctx.strokeStyle='rgba(235,230,215,.8)';ctx.lineWidth=Math.max(.4,r*.06);ctx.beginPath();for(let k=0;k<12;k++){const a=k*Math.PI/6;ctx.moveTo(x+Math.cos(a)*r*.25,y+Math.sin(a)*r*.25);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.moveTo(x+r*.25,y);ctx.arc(x,y,r*.25,0,7);ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,7);ctx.stroke()}
function OLD_spire(P,cu,cv,s,h,sh,col,t){const a=P(cu-s,cv+s,h),b=P(cu+s,cv+s,h),c=P(cu+s,cv-s,h),ap=P(cu,cv,h+sh);faceFill([...a,...b,...ap],shade(col,1.04),t,false);faceFill([...b,...c,...ap],shade(col,.8),t,false);
 if(t>=6){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=Math.max(.4,t*.015);for(const e of[a,b,c]){for(let f=.15;f<.9;f+=.12){const x=e[0]+(ap[0]-e[0])*f,y=e[1]+(ap[1]-e[1])*f;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(e===a?-1:1)*.05*t,y-.04*t);ctx.stroke()}}
  for(const f of[.35]){const m1=[(a[0]+b[0])/2,(a[1]+b[1])/2],m2=[(b[0]+c[0])/2,(b[1]+c[1])/2];for(const m of[m1,m2]){const p=[m[0]+(ap[0]-m[0])*f,m[1]+(ap[1]-m[1])*f];ctx.fillStyle=shade(col,.92);ctx.beginPath();ctx.moveTo(p[0]-.1*t,p[1]+.05*t);ctx.lineTo(p[0],p[1]-.22*t);ctx.lineTo(p[0]+.1*t,p[1]+.05*t);ctx.fill()}}}
 ctx.strokeStyle='#c9a227';ctx.lineWidth=Math.max(.6,t*.03);ctx.beginPath();ctx.moveTo(...ap);ctx.lineTo(ap[0],ap[1]-.35*t);ctx.moveTo(ap[0]-.09*t,ap[1]-.25*t);ctx.lineTo(ap[0]+.09*t,ap[1]-.25*t);ctx.stroke();
 for(const[du,dv]of[[-s,s],[s,s],[s,-s]]){const p=P(cu+du,cv+dv,h);ctx.fillStyle=shade(col,.95);ctx.beginPath();ctx.moveTo(p[0]-.06*t,p[1]);ctx.lineTo(p[0],p[1]-.45*t);ctx.lineTo(p[0]+.06*t,p[1]);ctx.fill()}}
function OLD_gothicTower(P,cu,cv,s,h,col,t){box3(P,cu-s,cu+s,cv-s,cv+s,0,h,col,shade(col,.84));for(const[du,dv]of[[-s,s],[s,s],[s,-s]])box3(P,cu+du-.06,cu+du+.06,cv+dv-.06,cv+dv+.06,0,h*.92,shade(col,.97),shade(col,.8));
 for(const[face,fu,fv]of[['L',1,0],['R',0,1]]){const lev=[h*.42,h*.78];for(const hy of lev){if(face==='L'){lancet(P(cu-s*.45,cv+s,hy),P(cu-s*.05,cv+s,hy),.5*t,['#2a2c30','#3a3e44','#2a2c30'],t);lancet(P(cu+s*.05,cv+s,hy),P(cu+s*.45,cv+s,hy),.5*t,['#2a2c30','#3a3e44','#2a2c30'],t)}else{lancet(P(cu+s,cv+s*.45,hy),P(cu+s,cv+s*.05,hy),.5*t,['#22252a','#30343a','#22252a'],t);lancet(P(cu+s,cv-s*.05,hy),P(cu+s,cv-s*.45,hy),.5*t,['#22252a','#30343a','#22252a'],t)}}}
 const cf=P(cu,cv+s,h*.62);clockFace(cf[0],cf[1],.13*t);box3(P,cu-s-.04,cu+s+.04,cv-s-.04,cv+s+.04,h,h+.08*t,shade(col,1.05),shade(col,.85),shade(col,1.1))}
function OLD_gothicChurch(P,t,o,col,roofCol,twin,big){const u0=big?-1.7:-1.5,u1=big?1.1:.7,v0=big?-1.15:-1,v1=big?-.05:-.15,wh=(big?1.9:1.35)*t,rh=(big?1.1:.85)*t,glass=['#2f4f8a','#8a2a3a','#c9a227'];
 box3(P,u0,u1,v0,v1,0,wh,col,shade(col,.84));
 const nb=big?6:4;for(let i=0;i<=nb;i++){const u=u0+(u1-u0)*i/nb;box3(P,u-.07,u+.07,v1,v1+.14,0,wh*.88,shade(col,.98),shade(col,.78),shade(col,1.05));const tp=P(u,v1+.07,wh*.88);ctx.fillStyle=shade(col,.95);ctx.beginPath();ctx.moveTo(tp[0]-.05*t,tp[1]);ctx.lineTo(tp[0],tp[1]-.3*t);ctx.lineTo(tp[0]+.05*t,tp[1]);ctx.fill()}
 for(let i=0;i<nb;i++){const uA=u0+(u1-u0)*(i+.28)/nb,uB=u0+(u1-u0)*(i+.72)/nb;lancet(P(uA,v1,wh*.22),P(uB,v1,wh*.22),wh*.6,glass,t)}
 gableP(P,u0,v0,u1,v1,wh,rh,shade(col,.84),roofCol);
 const ge=P(u1,(v0+v1)/2,wh+rh*.38);rose(ge[0],ge[1],(big?.32:.22)*t,t);const pa=P(u1,(v0+v1)/2-.18,0),pb=P(u1,(v0+v1)/2+.18,0);lancet(pa,pb,.75*t,['#3a2a20','#4a3628','#3a2a20'],t);
 if(big){box3(P,-.55,.05,-1.65,.55,0,wh,col,shade(col,.84));gableP(P,-.55,-1.65,.05,.55,wh,rh,shade(col,.84),roofCol);const te=P(-.25,.55,wh+rh*.3);rose(te[0],te[1],.26*t,t);for(const u of[-.55,.05]){const p=P(u,.55,wh);ctx.fillStyle=shade(col,.95);ctx.beginPath();ctx.moveTo(p[0]-.06*t,p[1]);ctx.lineTo(p[0],p[1]-.5*t);ctx.lineTo(p[0]+.06*t,p[1]);ctx.fill()}}
 const th=(big?3.4:2.5)*t,ts=big?.32:.3;if(twin){for(const cv of[v0+.05,v1-.05]){gothicTower(P,u1+.25,cv,ts,th,col,t);spire(P,u1+.25,cv,ts,th+.08*t,(big?2.4:1.8)*t,col,t)}}else{gothicTower(P,u1+.2,v1-.15,ts,th,col,t);spire(P,u1+.2,v1-.15,ts,th+.08*t,1.9*t,roofCol==='#4f5a63'?'#5a6670':col,t)}
 for(let k=0;k<4;k++)box3(P,u1+.55+k*.06,u1+.62+k*.06,(v0+v1)/2-.35,(v0+v1)/2+.35,0,(.12-k*.03)*t,shade(col,.95),shade(col,.8),shade(col,1.05))}
CIVIC.chapel=function(o,P,t){lawn(P,t,'#86a24e');for(let i=0;i<10;i++){const p=P(-1.6+(i%5)*.32,.55+((i/5)|0)*.42);ctx.fillStyle='#a39d90';ctx.fillRect(p[0]-.05*t,p[1]-.16*t,.1*t,.16*t);ctx.beginPath();ctx.arc(p[0],p[1]-.16*t,.05*t,Math.PI,0);ctx.fill();ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(p[0],p[1]-.16*t,.05*t,.16*t)}
 path_(P,[[1.95,-.6],[1.1,-.6]],.3,t,'#cfc4ad');gothicChurch(P,t,o,'#b5ad9c','#4f5a63',false,false);for(const[u,v]of[[-1.7,-1.7],[1.6,1.5],[-1.7,1.6]])treeR(...P(u,v),Z*1.05,TREEC[0]);people(P,[[1.5,-.2,35],[1.6,.3,5],[1.4,.6,11]],t)};
CIVIC.votiv=function(o,P,t){poly([...P(-1.95,-1.95),...P(1.95,-1.95),...P(1.95,1.95),...P(-1.95,1.95)],'#b3aa97');gothicChurch(P,t,o,'#e6e1d5','#5f6b72',true,true);people(P,[[1.75,-.9,35],[1.8,-.3,13],[1.85,.3,3],[1.7,.9,12]],t)};

/* ---------- Gothic, second pass: octagonal spires, stepped buttresses, parapets, a detailed transept ---------- */
function spire(P,cu,cv,s,h,sh,col,t){const n=8,pts=[];for(let k=0;k<n;k++){const a=k*Math.PI*2/n+Math.PI/8;pts.push([cu+Math.cos(a)*s,cv+Math.sin(a)*s])}const ap=P(cu,cv,h+sh),c0=P(cu,cv,h);
 const faces=[];for(let k=0;k<n;k++){const a=pts[k],b=pts[(k+1)%n],A=P(a[0],a[1],h),Bq=P(b[0],b[1],h);const mid=[(a[0]+b[0])/2-cu,(a[1]+b[1])/2-cv],ms=P(cu+mid[0],cv+mid[1],h);if(ms[1]<c0[1]-1)continue;faces.push([A,Bq,ms[0]-c0[0]])}
 faces.sort((x,y)=>Math.abs(y[2])-Math.abs(x[2]));for(const[A,Bq,dx]of faces){const lit=dx<0?1.06+(-dx/(s*t*2))*.08:.88-(dx/(s*t*2))*.12;faceFill([...A,...Bq,...ap],shade(col,lit),t,false)}
 if(t>=6){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(.4,t*.014);for(const[A]of faces){for(let f=.12;f<.92;f+=.1){const x=A[0]+(ap[0]-A[0])*f,y=A[1]+(ap[1]-A[1])*f;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(A[0]<ap[0]?-1:1)*.045*t,y-.035*t);ctx.stroke()}}
  ctx.strokeStyle='rgba(60,55,50,.35)';ctx.beginPath();for(const f of[.3,.55,.78]){const pr=faces.map(([A])=>[A[0]+(ap[0]-A[0])*f,A[1]+(ap[1]-A[1])*f]);pr.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p))}ctx.stroke()}
 for(const[A,Bq]of faces.slice(0,3)){const m=[(A[0]+Bq[0])/2,(A[1]+Bq[1])/2];ctx.fillStyle=shade(col,.95);ctx.beginPath();ctx.moveTo(m[0]-.07*t,m[1]);ctx.lineTo(m[0],m[1]-.35*t);ctx.lineTo(m[0]+.07*t,m[1]);ctx.fill();ctx.fillStyle='#2c2f34';ctx.fillRect(m[0]-.02*t,m[1]-.16*t,.04*t,.12*t)}
 ctx.strokeStyle='#c9a227';ctx.lineWidth=Math.max(.6,t*.03);ctx.beginPath();ctx.moveTo(...ap);ctx.lineTo(ap[0],ap[1]-.32*t);ctx.moveTo(ap[0]-.08*t,ap[1]-.23*t);ctx.lineTo(ap[0]+.08*t,ap[1]-.23*t);ctx.stroke()}
function pinnacle(p,t,col,hgt){ctx.fillStyle=shade(col,1.02);ctx.fillRect(p[0]-.05*t,p[1]-hgt*.45,.1*t,hgt*.45);ctx.fillStyle=shade(col,.85);ctx.fillRect(p[0],p[1]-hgt*.45,.05*t,hgt*.45);ctx.fillStyle=shade(col,.98);ctx.beginPath();ctx.moveTo(p[0]-.06*t,p[1]-hgt*.45);ctx.lineTo(p[0],p[1]-hgt);ctx.lineTo(p[0]+.06*t,p[1]-hgt*.45);ctx.fill()}
function faceClock(Pa,Pb,r){const dx=Pb[0]-Pa[0],dy=Pb[1]-Pa[1],l=Math.hypot(dx,dy)||1;ctx.save();ctx.translate(Pb[0],Pb[1]);ctx.transform(dx/l,dy/l,0,1,0,0);
 ctx.fillStyle='rgba(60,55,50,.55)';ctx.beginPath();ctx.arc(0,0,r*1.22,0,7);ctx.fill();ctx.fillStyle='#e9e2d2';ctx.beginPath();ctx.arc(0,0,r*1.12,0,7);ctx.fill();ctx.fillStyle='#f6f2e8';ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
 ctx.strokeStyle='#2a2522';ctx.lineWidth=Math.max(.3,r*.08);ctx.beginPath();for(let k=0;k<12;k++){const a=k*Math.PI/6,i0=k%3?.8:.68;ctx.moveTo(Math.cos(a)*r*i0,Math.sin(a)*r*i0);ctx.lineTo(Math.cos(a)*r*.92,Math.sin(a)*r*.92)}ctx.stroke();
 ctx.lineWidth=Math.max(.4,r*.12);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(r*.12,-r*.62);ctx.moveTo(0,0);ctx.lineTo(r*.5,r*.18);ctx.stroke();ctx.fillStyle='#c9a227';ctx.beginPath();ctx.arc(0,0,r*.1,0,7);ctx.fill();ctx.restore()}
function gothicTower(P,cu,cv,s,h,col,t){box3(P,cu-s,cu+s,cv-s,cv+s,0,h,col,shade(col,.84));
 for(const[du,dv]of[[-s,s],[s,s],[s,-s]]){for(const[f0,f1,w]of[[0,.4,.085],[.4,.72,.065],[.72,.9,.045]])box3(P,cu+du-w,cu+du+w,cv+dv-w,cv+dv+w,h*f0,h*f1,shade(col,.95),shade(col,.76),shade(col,1.04))}
 for(const f of[.4,.72]){const F=nyFace(...P(cu,cv),s,s,t,t/2);nyBand(F,'L',h*f,h*f+.05*t,shade(col,1.1),.03);nyBand(F,'R',h*f,h*f+.05*t,shade(col,.95),.03)}
 for(const hy of[h*.48,h*.78]){lancet(P(cu-s*.5,cv+s,hy),P(cu-s*.08,cv+s,hy),.55*t,['#2a2c30','#3a3e44','#2a2c30'],t);lancet(P(cu+s*.08,cv+s,hy),P(cu+s*.5,cv+s,hy),.55*t,['#2a2c30','#3a3e44','#2a2c30'],t);lancet(P(cu+s,cv+s*.5,hy),P(cu+s,cv+s*.08,hy),.55*t,['#22252a','#30343a','#22252a'],t);lancet(P(cu+s,cv-s*.08,hy),P(cu+s,cv-s*.5,hy),.55*t,['#22252a','#30343a','#22252a'],t)}
 if(t>=6){ctx.strokeStyle='rgba(200,195,180,.6)';ctx.lineWidth=Math.max(.4,t*.012);for(const hy of[h*.48,h*.78]){const a=P(cu-s*.5,cv+s,hy),b=P(cu-s*.08,cv+s,hy);for(let k=1;k<5;k++){ctx.beginPath();ctx.moveTo(a[0],a[1]-k*.1*t);ctx.lineTo(b[0],b[1]-k*.1*t);ctx.stroke()}}}
 faceClock(P(cu-1,cv+s,h*.3),P(cu,cv+s,h*.3),.13*t);faceClock(P(cu+s,cv+1,h*.3),P(cu+s,cv,h*.3),.13*t);box3(P,cu-s-.05,cu+s+.05,cv-s-.05,cv+s+.05,h,h+.1*t,shade(col,1.05),shade(col,.85),shade(col,1.1));
 for(const[du,dv]of[[-s,s],[s,s],[s,-s],[0,s],[s,0]]){pinnacle(P(cu+du,cv+dv,h+.1*t),t,col,.6*t)}}
function gothicChurch(P,t,o,col,roofCol,twin,big){const u0=big?-1.7:-1.5,u1=big?1.1:.7,v0=big?-1.15:-1,v1=big?-.05:-.15,wh=(big?1.9:1.35)*t,rh=(big?1.1:.85)*t,glass=['#2f4f8a','#8a2a3a','#c9a227'];
 box3(P,u0,u1,v0,v1,0,wh,col,shade(col,.84));const nb=big?6:4;
 for(let i=0;i<nb;i++){const uA=u0+(u1-u0)*(i+.28)/nb,uB=u0+(u1-u0)*(i+.72)/nb;lancet(P(uA,v1,wh*.2),P(uB,v1,wh*.2),wh*.62,glass,t)}
 for(let i=0;i<=nb;i++){const u=u0+(u1-u0)*i/nb;for(const[f0,f1,w]of[[0,.55,.08],[.55,.86,.06]])box3(P,u-w,u+w,v1,v1+w*2.2,wh*f0,wh*f1,shade(col,.97),shade(col,.78),shade(col,1.05));pinnacle(P(u,v1+.08,wh*.86),t,col,.45*t)}
 box3(P,u0,u1,v1-.02,v1+.02,wh,wh+.08*t,shade(col,1.05),shade(col,.85),shade(col,1.1));gableP(P,u0,v0,u1,v1,wh+.06*t,rh,shade(col,.84),roofCol);
 const ge=P(u1,(v0+v1)/2,wh+rh*.38);rose(ge[0],ge[1],(big?.32:.22)*t,t);
 if(big){const tu0=-.6,tu1=.1,tv0=-1.7,tv1=.6;box3(P,tu0,tu1,tv0,tv1,0,wh,col,shade(col,.84));
  for(let i=0;i<3;i++){const vA=tv0+(tv1-tv0)*(i+.3)/3,vB=tv0+(tv1-tv0)*(i+.7)/3;lancet(P(tu1,vB,wh*.2),P(tu1,vA,wh*.2),wh*.6,glass,t)}
  for(const v of[tv0+.05,(tv0+tv1)/2,tv1-.05])box3(P,tu1,tu1+.16,v-.07,v+.07,0,wh*.8,shade(col,.97),shade(col,.78),shade(col,1.05));
  gableP(P,tu0,tv0,tu1,tv1,wh+.06*t,rh,shade(col,.84),roofCol);const te=P((tu0+tu1)/2,tv1,wh*.55);rose(te[0],te[1],.3*t,t);const tp=P((tu0+tu1)/2,tv1,0);lancet(P(tu0+.12,tv1,0),P(tu1-.12,tv1,0),.8*t,['#3a2a20','#4a3628','#3a2a20'],t);
  for(const u of[tu0,tu1])pinnacle(P(u,tv1,wh+.06*t),t,col,.7*t);const fl=P((tu0+tu1)/2,(v0+v1)/2,wh+rh+.06*t);ctx.fillStyle=shade(roofCol,1.2);ctx.beginPath();ctx.moveTo(fl[0]-.12*t,fl[1]);ctx.lineTo(fl[0],fl[1]-.9*t);ctx.lineTo(fl[0]+.12*t,fl[1]);ctx.fill()}
 const th=(big?3.5:2.5)*t,ts=big?.3:.28;
 if(twin){for(const cv of[v0+.08,v1-.08]){gothicTower(P,u1+.25,cv,ts,th,col,t);spire(P,u1+.25,cv,ts*.86,th+.1*t,(big?2.6:1.9)*t,col,t)}box3(P,u1+.1,u1+.45,v0+.4,v1-.4,0,wh*1.1,col,shade(col,.84));const pp=P(u1+.45,(v0+v1)/2,0);lancet(P(u1+.45,(v0+v1)/2+.15,0),P(u1+.45,(v0+v1)/2-.15,0),.9*t,['#3a2a20','#4a3628','#3a2a20'],t)}
 else{gothicTower(P,u1+.2,v1-.15,ts,th,col,t);spire(P,u1+.2,v1-.15,ts*.86,th+.1*t,1.9*t,roofCol==='#4f5a63'?'#5a6670':col,t)}
 for(let k=0;k<4;k++)box3(P,u1+.55+k*.06,u1+.62+k*.06,(v0+v1)/2-.35,(v0+v1)/2+.35,0,(.12-k*.03)*t,shade(col,.95),shade(col,.8),shade(col,1.05))}
/* the Vanderbilt château: limestone, steep roofs, a proper round turret */
function turret(P,u,v,r,h,rh,col,t){const b=P(u,v,0),top=P(u,v,h),rw=r*t*1.1;const g=ctx.createLinearGradient(b[0]-rw,0,b[0]+rw,0);g.addColorStop(0,shade(col,1.1));g.addColorStop(.6,shade(col,.92));g.addColorStop(1,shade(col,.74));ctx.fillStyle=g;ctx.fillRect(b[0]-rw,top[1],2*rw,b[1]-top[1]);ctx.beginPath();ctx.ellipse(b[0],b[1],rw,rw*.5,0,0,Math.PI);ctx.fill();
 ctx.fillStyle='#2c3a44';for(const f of[.35,.65]){ctx.fillRect(b[0]-.05*t,b[1]-(b[1]-top[1])*f-.2*t,.1*t,.22*t)}ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=Math.max(.4,t*.012);ctx.beginPath();for(const f of[.3,.6,.95]){const y=b[1]-(b[1]-top[1])*f;ctx.ellipse(b[0],y,rw,rw*.5,0,0,Math.PI)}ctx.stroke();
 const g2=ctx.createLinearGradient(b[0]-rw,0,b[0]+rw,0);g2.addColorStop(0,'#6b7880');g2.addColorStop(1,'#3a444c');ctx.fillStyle=g2;ctx.beginPath();ctx.moveTo(b[0]-rw*1.12,top[1]);ctx.lineTo(b[0],top[1]-rh);ctx.lineTo(b[0]+rw*1.12,top[1]);ctx.ellipse(b[0],top[1],rw*1.12,rw*.56,0,0,Math.PI);ctx.fill();ctx.strokeStyle='#c9a227';ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();ctx.moveTo(b[0],top[1]-rh);ctx.lineTo(b[0],top[1]-rh-.25*t);ctx.stroke()}
CIVIC.epstein=(o,P,t)=>{lawn(P,t,'#86a24e');path_(P,[[0,1.95],[0,.6]],.4,t,'#d9cdb1');const col='#e9e2d2';box3(P,-1.5,1.2,-1.5,.35,0,1.9*t,col,shade(col,.84));
 const F=nyFace(...P(-.15,-.575),1.35,.925,t,t/2);for(let r=0;r<3;r++)for(const[fc,n]of[['L',7],['R',5]])for(let i=0;i<n;i++)winF(F[fc],(i+.5)/n,.42/n,.25*t+r*.55*t,.3*t,'#2c3a44')
 for(const f of['L','R'])nyBand(F,f,1.85*t,1.95*t,'#f4efe3',.05);
 const A=P(-1.5,.35,1.95*t),Bq=P(1.2,.35,1.95*t),C=P(1.2,-1.5,1.95*t),Ai=P(-1.2,.05,3.1*t),Bi=P(.9,.05,3.1*t),Ci=P(.9,-1.2,3.1*t);faceFill([...A,...Bq,...Bi,...Ai],'#5a6670',t,false);faceFill([...Bq,...C,...Ci,...Bi],'#46525a',t,false);faceFill([...Ai,...Bi,...Ci,...P(-1.2,-1.2,3.1*t)],'#6b7880',t,false);
 ctx.strokeStyle='rgba(0,0,0,.14)';ctx.lineWidth=Math.max(.3,t*.012);ctx.beginPath();for(let f=.15;f<1;f+=.15){ctx.moveTo(A[0]+(Ai[0]-A[0])*f,A[1]+(Ai[1]-A[1])*f);ctx.lineTo(Bq[0]+(Bi[0]-Bq[0])*f,Bq[1]+(Bi[1]-Bq[1])*f)}ctx.stroke();
 for(let i=0;i<4;i++){const s0=(i+.3)/4,s1=(i+.7)/4,lp=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];nyDormer(lp(A,Bq,s0),lp(A,Bq,s1),lp(Ai,Bi,s0),lp(Ai,Bi,s1),.3,0,t,'#efe7d6');const pk=lp(lp(A,Bq,(s0+s1)/2),lp(Ai,Bi,(s0+s1)/2),.3);ctx.fillStyle='#efe7d6';ctx.beginPath();ctx.moveTo(pk[0]-.12*t,pk[1]-.24*t);ctx.lineTo(pk[0],pk[1]-.55*t);ctx.lineTo(pk[0]+.12*t,pk[1]-.24*t);ctx.fill()}
 for(const[u,v]of[[-.9,-.6],[.5,-.9]]){const p=P(u,v,3.1*t);ctx.fillStyle='#d9d2c2';ctx.fillRect(p[0]-.08*t,p[1]-.5*t,.16*t,.5*t);ctx.fillStyle='#2a2522';ctx.fillRect(p[0]-.1*t,p[1]-.54*t,.2*t,.06*t)}
 turret(P,-1.5,.35,.32,2.3*t,1.3*t,col,t);turret(P,1.2,.35,.26,2.1*t,1.1*t,col,t);box3(P,-.35,.35,.35,.75,0,.9*t,col,shade(col,.84),shade(col,1.05));const d=P(0,.75,0);ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.moveTo(d[0]-.14*t,d[1]);ctx.lineTo(d[0]-.14*t,d[1]-.45*t);ctx.quadraticCurveTo(d[0],d[1]-.65*t,d[0]+.14*t,d[1]-.45*t);ctx.lineTo(d[0]+.14*t,d[1]);ctx.fill();
 for(const[u,v]of[[-1.7,1.5],[1.6,1.4],[1.7,-1.6]])treeR(...P(u,v),Z*1.05,TREEC[1]);wagon(P,.9,1.3,t,'#1d1b1a',2);people(P,[[-.4,1.2,1],[.3,1.4,12]],t)};

/* ===================== horses, carriages and cars that follow the street ===================== */
function drawHorse(x,y,ux,uy,z0,col,ph){const z=z0*1.3;let l=Math.hypot(ux,uy)||1;ux/=l;uy/=l;const gx=(ux+2*uy)/2,gy=(2*uy-ux)/2,gl=Math.hypot(gx,gy)||1,f=Math.min(1.3,Math.max(.5,(1/gl)/1.118)),dx=ux*f,dy=uy*f,px=-uy*.55,py=ux*.28,away=uy<-.15;
 const dark=shade(col,.6),light=shade(col,1.2),H=[x-dx*1.6*z,y-dy*1.6*z-2.75*z],C=[x+dx*1.5*z,y+dy*1.5*z-2.85*z],N=[C[0]+dx*.85*z,C[1]+dy*.85*z-1.7*z],No=[N[0]+dx*1.25*z,N[1]+dy*1.25*z+.65*z];
 ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x+1.2*z,y+.3*z,(1.4+2.6*Math.abs(ux))*z,1*z,0,0,7);ctx.fill();ctx.lineCap='round';
 const leg=(bx,by,sw,c)=>{const kx=bx+dx*sw*.35*z,ky=by+1.3*z,fx=bx+dx*sw*.8*z,fy=by+2.75*z;ctx.strokeStyle=c;ctx.lineWidth=Math.max(.6,.62*z);ctx.beginPath();ctx.moveTo(bx,by+.4*z);ctx.lineTo(kx,ky);ctx.lineTo(fx,fy-.25*z);ctx.stroke();ctx.fillStyle='#1d1b1a';ctx.beginPath();ctx.ellipse(fx,fy-.1*z,.38*z,.22*z,0,0,7);ctx.fill()};
 const g=Math.sin(ph),g2=Math.sin(ph+Math.PI);const legs=s=>{leg(H[0]+px*s*z*.9,H[1]+py*s*z*.9,s>0?g:g2,s>0?col:dark);leg(C[0]+px*s*z*.9,C[1]+py*s*z*.9,s>0?g2:g,s>0?col:dark)};
 const headNeck=()=>{ctx.strokeStyle=col;ctx.lineWidth=1.35*z;ctx.beginPath();ctx.moveTo(C[0],C[1]-.3*z);ctx.lineTo(...N);ctx.stroke();ctx.lineWidth=1.05*z;ctx.beginPath();ctx.moveTo(...N);ctx.lineTo(...No);ctx.stroke();ctx.strokeStyle=dark;ctx.lineWidth=Math.max(.5,.55*z);ctx.beginPath();ctx.moveTo(C[0]-dx*.2*z,C[1]-.9*z);ctx.lineTo(N[0]-dx*.15*z,N[1]-.45*z);ctx.stroke();
  ctx.lineWidth=Math.max(.4,.3*z);ctx.beginPath();ctx.moveTo(N[0]+px*.25*z,N[1]-.4*z);ctx.lineTo(N[0]+px*.25*z+dx*.1*z,N[1]-1*z);ctx.moveTo(N[0]-px*.25*z,N[1]-.4*z);ctx.lineTo(N[0]-px*.25*z+dx*.1*z,N[1]-1*z);ctx.stroke();ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.3,.25*z);ctx.beginPath();ctx.moveTo(N[0]+dx*.3*z,N[1]-.1*z);ctx.lineTo(No[0]-dx*.2*z,No[1]-.1*z);ctx.stroke()};
 legs(-1);if(away)headNeck();
 ctx.strokeStyle=col;ctx.lineWidth=2.35*z;ctx.beginPath();ctx.moveTo(...H);ctx.lineTo(...C);ctx.stroke();ctx.strokeStyle=shade(col,.82);ctx.lineWidth=1.2*z;ctx.beginPath();ctx.moveTo(H[0],H[1]+.6*z);ctx.lineTo(C[0],C[1]+.6*z);ctx.stroke();ctx.strokeStyle=light;ctx.lineWidth=Math.max(.5,.55*z);ctx.beginPath();ctx.moveTo(H[0]+dx*.3*z,H[1]-.75*z);ctx.lineTo(C[0]-dx*.3*z,C[1]-.75*z);ctx.stroke();
 ctx.strokeStyle=dark;ctx.lineWidth=Math.max(.6,.7*z);ctx.beginPath();ctx.moveTo(H[0]-dx*.5*z,H[1]-.3*z);ctx.quadraticCurveTo(H[0]-dx*1.1*z,H[1]+.3*z+Math.sin(ph*.5)*.15*z,H[0]-dx*1*z,H[1]+1.7*z);ctx.stroke();
 ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.4,.4*z);ctx.beginPath();ctx.moveTo(C[0]+px*.9*z,C[1]+py*.9*z-.9*z);ctx.lineTo(C[0]-px*.9*z,C[1]-py*.9*z-.9*z);ctx.moveTo(x+px*1.1*z,y+py*1.1*z-2.4*z);ctx.lineTo(x-px*1.1*z,y-py*1.1*z-2.4*z);ctx.stroke();
 if(!away)headNeck();legs(1)}
function OLD_rigFrame(a,cx,cy){const hx=a.hx||1,hy=a.hy||0,hl=Math.hypot(hx,hy)||1,gx=hx/hl,gy=hy/hl,qx=-gy,qy=gx,bx=a.sx??a.x,by=a.sy??a.y,s0=scr(bx,by),ox=cx-s0[0],oy=cy-s0[1];return(u,v,h)=>{const s=scr(bx+gx*u+qx*v,by+gy*u+qy*v);return[s[0]+ox,s[1]+oy-(h||0)*32*Z]}}
function wheelAt(p,r){ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.6,r*.25);ctx.beginPath();ctx.ellipse(p[0],p[1]-r,r*.55,r,0,0,7);ctx.stroke();ctx.lineWidth=Math.max(.3,r*.1);ctx.beginPath();ctx.moveTo(p[0],p[1]-2*r);ctx.lineTo(p[0],p[1]);ctx.moveTo(p[0]-r*.55,p[1]-r);ctx.lineTo(p[0]+r*.55,p[1]-r);ctx.stroke()}
function drawRig(a,cx,cy,ux,uy,nx,ny,z,now){const ph=(now/90+a.seed*7)%(Math.PI*2),P=rigFrame(a,cx,cy),t=32*Z,A0=P(0,0),A1=P(1,0),sux=A1[0]-A0[0],suy=A1[1]-A0[1],away=suy<0;
 const sp={o:[.95,.27,.5,'#7a2a22'],e:[.55,.22,.4,a.bc||'#1f2a3a'],f:[.42,.2,.32,'#1d1b1a'],c:[.5,.22,.22,a.bc||'#5a3a24']}[a.t]||[.5,.22,.3,'#333'],[Ln,Wd,Ht,bc]=sp,two=a.t==='o'||(a.t==='e'&&a.seed>.5);
 const horses=()=>{for(const s of two?[-1,1]:[0]){const hp=P(Ln/2+.42,s*.075,0);drawHorse(hp[0],hp[1],sux,suy,z*.95,HORSE[(a.hc+(s>0?1:0))%HORSE.length],ph+s)}const yk=P(Ln/2+.05,0,.18),yh=P(Ln/2+.42,0,.2);ctx.strokeStyle='#2a1d14';ctx.lineWidth=Math.max(.4,.3*z);ctx.beginPath();ctx.moveTo(...yk);ctx.lineTo(...yh);ctx.stroke()};
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();const sh=[P(-Ln/2,-Wd/2),P(Ln/2,-Wd/2),P(Ln/2,Wd/2),P(-Ln/2,Wd/2)];ctx.moveTo(sh[0][0]+2,sh[0][1]+2);for(const q of sh)ctx.lineTo(q[0]+2,q[1]+2);ctx.fill();
 if(away)horses();
 const wr=(a.t==='f'?.11:.085)*t*RS;for(const[u,v]of a.t==='f'?[[0,-Wd/2-.02]]:[[-Ln/2+.08,-Wd/2-.02],[Ln/2-.1,-Wd/2-.02]])wheelAt(P(u,v,0),wr);
 if(a.t==='c'){box3(P,-Ln/2,Ln/2,-Wd/2,Wd/2,.12,.2,shade(bc,1),shade(bc,.8),shade(bc,.65));const s1=P(-Ln/2+.1,0,.2),s2=P(Ln/4,0,.2);drawPerson(s1[0],s1[1]+.05*t,z*.75,(a.pk||0)+3);drawPerson(s2[0],s2[1]+.05*t,z*.75,(a.pk||0)+12)}
 else if(a.t==='f'){box3(P,-Ln/2,Ln/4,-Wd/2,Wd/2,.12,.3,shade(bc,1.05),shade(bc,.8),null);const hd=P(-Ln/4,0,.42);ctx.fillStyle='#2a2522';ctx.beginPath();ctx.ellipse(hd[0],hd[1],.15*t,.12*t,0,Math.PI,0);ctx.fill();const dr=P(-Ln/2-.02,0,.32);drawPerson(dr[0],dr[1]+.08*t,z*.75,1)}
 else{box3(P,-Ln/2,Ln/2,-Wd/2,Wd/2,.1,Ht,shade(bc,1.04),shade(bc,.82),shade(bc,.7));const vis=P(0,Wd/2,0)[1]>P(0,-Wd/2,0)[1]?Wd/2:-Wd/2,n=a.t==='o'?5:2;for(let i=0;i<n;i++){const u0=-Ln/2+.05+i*(Ln-.1)/n,u1=u0+(Ln-.1)/n-.04,q=[P(u0,vis,Ht-.17),P(u1,vis,Ht-.17),P(u1,vis,Ht-.05),P(u0,vis,Ht-.05)];poly(q.flat(),'#3a4a58');ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(q[3][0],q[3][1],2,2)}
  if(a.t==='o'){box3(P,-Ln/2,Ln/2,-Wd/2-.01,Wd/2+.01,Ht,Ht+.03,'#c9a227','#a8851e','#efe3c8');const rs=P(-.1,0,Ht+.03);drawPerson(rs[0],rs[1]+.06*t,z*.7,5);drawPerson(rs[0]+.12*t,rs[1]+.1*t,z*.7,16)}const dr=P(Ln/2,0,Ht);drawPerson(dr[0],dr[1]+.08*t,z*.75,a.t==='o'?24:1)}
 if(!away)horses()}
function drawAuto(a,cx,cy,z){const P=rigFrame(a,cx,cy),t=32*Z,col=a.side>0?'#5a1f1b':'#1f2a3a',Ln=.42,Wd=.2;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();const sh=[P(-Ln/2,-Wd/2),P(Ln/2,-Wd/2),P(Ln/2,Wd/2),P(-Ln/2,Wd/2)];ctx.moveTo(sh[0][0]+2,sh[0][1]+2);for(const q of sh)ctx.lineTo(q[0]+2,q[1]+2);ctx.fill();
 for(const[u,v]of[[-Ln/2+.07,-Wd/2],[Ln/2-.07,-Wd/2],[-Ln/2+.07,Wd/2],[Ln/2-.07,Wd/2]])wheelAt(P(u,v,0),.07*t*RS);box3(P,-Ln/2,Ln/2,-Wd/2,Wd/2,.07,.16,shade(col,1.05),shade(col,.8),shade(col,.9));box3(P,Ln/2-.12,Ln/2,-Wd/2+.03,Wd/2-.03,.16,.2,'#2a2522','#1d1b1a','#3a3530');
 box3(P,-Ln/2,-Ln/2+.16,-Wd/2,Wd/2,.16,.24,shade(col,.95),shade(col,.75),'#3a2a20');const ws=P(Ln/2-.13,0,.27);ctx.strokeStyle='rgba(200,215,225,.8)';ctx.lineWidth=Math.max(.5,t*.02);ctx.beginPath();ctx.moveTo(...P(Ln/2-.13,-Wd/2,.16));ctx.lineTo(...P(Ln/2-.13,-Wd/2,.3));ctx.lineTo(...P(Ln/2-.13,Wd/2,.3));ctx.lineTo(...P(Ln/2-.13,Wd/2,.16));ctx.stroke();
 const d=P(.0,0,.16);drawPerson(d[0],d[1]+.06*t,z*.72,1);const lp=P(Ln/2,Wd/2-.04,.12);ctx.fillStyle='rgba(255,230,160,.9)';ctx.beginPath();ctx.arc(lp[0],lp[1],.025*t,0,7);ctx.fill()}

/* ===================== round six: scale, steam, clouds, wires, sidewalks, night ===================== */
const RS=.68;
function rigFrame(a,cx,cy){const hx=a.hx||1,hy=a.hy||0,hl=Math.hypot(hx,hy)||1,gx=hx/hl,gy=hy/hl,qx=-gy,qy=gx,bx=a.sx??a.x,by=a.sy??a.y,s0=scr(bx,by),ox=cx-s0[0],oy=cy-s0[1];return(u,v,h)=>{const s=scr(bx+(gx*u+qx*v)*RS,by+(gy*u+qy*v)*RS);return[s[0]+ox,s[1]+oy-(h||0)*32*Z*RS]}}
/* steam and smoke that billow */
const PLUME={brick:[[-1.6,-1.4,2.4,'s']],sawmill:[[-.2,-1.4,1.7,'s']],brewery:[[.5,-1.6,3.4,'w']],weaver:[[1.5,-1.6,3,'s']],kraftwerk:[[1.4,-1.5,3.4,'s'],[1.4,-.7,3.4,'s']],autofabrik:[[1.6,-1.6,2.4,'s']],gaswerk:[[1.6,-1.6,2,'s']]};
function drawPlumes(){if(!S||Z<.18)return;const now=performance.now()/1000,t=32*Z;for(const o of S.list){const sp=PLUME[o.t];if(!sp||o.bld||!(o.st||'').startsWith('Working'))continue;const f=B[o.t].foot||4,[cx,cy]=scr(o.x+(f-1)/2,o.y+(f-1)/2);if(cx<-200||cx>vw+200||cy<-300||cy>vh+200)continue;
 for(const[u,v,h,kind]of sp){const x0=cx+(u-v)*t,y0=cy+(u+v)*t/2-h*t-.1*t,seed=hs(o.x*7+o.y*3+u*10);for(let k=0;k<9;k++){const age=((now*.22+k/9+seed)%1),r=(.12+age*.75)*t,x=x0+age*1.4*t+Math.sin(now*.8+k+seed*6)*.12*t*age,y=y0-age*2.3*t,a=(kind==='w'?.55:.42)*(1-age)*Math.min(1,age*6);
  const g=ctx.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);const c0=kind==='w'?'255,255,255':age<.25?'95,92,90':'205,205,208';g.addColorStop(0,`rgba(${c0},${a})`);g.addColorStop(1,`rgba(${c0},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}}}}
/* clouds drifting over, with their shadows on the city */
function drawClouds(){if(!S)return;const now=performance.now()/1000,t=32*Z,vis=Math.min(1,Math.max(0,(1.05-Z)/.6));for(let i=0;i<7;i++){const bx=((hs(i*31)*W+now*1.2+i*40)%(W+80))-40,by=hs(i*57)*H*.9+10,sz=6+hs(i*13)*8;
 const[sx,sy]=scr(bx,by);if(sx<-sz*t*1.4||sx>vw+sz*t*1.4||sy<-sz*t-12*t||sy>vh+sz*t)continue;ctx.fillStyle='rgba(20,25,35,.07)';for(let k=0;k<6;k++){const ox=(hs(i*7+k)-.5)*sz*t*.8,oy=(hs(i*11+k)-.5)*sz*t*.25;ctx.beginPath();ctx.ellipse(sx+ox,sy+oy,sz*t*.28,sz*t*.14,0,0,7);ctx.fill()}
 if(vis<=0)continue;const cy0=sy-11*t;for(let k=0;k<8;k++){const ox=(hs(i*7+k)-.5)*sz*t*.9,oy=(hs(i*19+k)-.5)*sz*t*.18,r=sz*t*(.14+hs(i*23+k)*.12),g=ctx.createRadialGradient(sx+ox-r*.3,cy0+oy-r*.4,r*.1,sx+ox,cy0+oy,r);g.addColorStop(0,`rgba(255,255,255,${.55*vis})`);g.addColorStop(.7,`rgba(240,242,246,${.35*vis})`);g.addColorStop(1,'rgba(240,242,246,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx+ox,cy0+oy,r,0,7);ctx.fill()}}}
/* telegraph poles with sagging wires, trolley wires over electric tram lines */
let POLES=null,POLEGV=-1;
function poleList(){if(POLES&&POLEGV===GV)return POLES;POLEGV=GV;POLES=[];if(!S)return POLES;const isR=(x,y)=>inb(x,y)&&S.b[y*W+x]&&S.b[y*W+x].t==='road';for(const o of S.list){if(o.t!=='road')continue;const i=o.y*W+o.x;if(ZONE[i]>1||((o.x*7+o.y*3)%4))continue;const nb=roadNb(i);if(nb.length!==2)continue;const d=[(nb[0]%W)-o.x,((nb[0]/W)|0)-o.y];if((nb[1]%W)-o.x!==-d[0]||((nb[1]/W)|0)-o.y!==-d[1])continue;let ok=true;for(let k=1;k<=4;k++)if(!isR(o.x+d[0]*k,o.y+d[1]*k)){ok=false;break}POLES.push([o.x,o.y,ok?d:null])}return POLES}
function poleTop(x,y){const[sx,sy]=scr(x+.38,y-.38);return[sx,sy-.62*32*Z]}
function drawPole(x,y,d){const t=32*Z,[sx,sy]=scr(x+.38,y-.38),top=sy-.62*t;ctx.strokeStyle='#4a3a2a';ctx.lineWidth=Math.max(.6,t*.035);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx,top);ctx.stroke();ctx.lineWidth=Math.max(.5,t*.025);ctx.beginPath();for(const k of[0,.07]){ctx.moveTo(sx-.12*t,top+k*t);ctx.lineTo(sx+.12*t,top+k*t)}ctx.stroke();
 if(d){const[ex,ey]=poleTop(x+d[0]*4,y+d[1]*4);ctx.strokeStyle='rgba(30,28,26,.55)';ctx.lineWidth=Math.max(.4,Z*.45);ctx.beginPath();for(const[ox,oy]of[[-.1,0],[.1,0],[-.05,.07],[.05,.07]]){const a=[sx+ox*t,top+oy*t],b=[ex+ox*t,ey+oy*t];ctx.moveTo(...a);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+.18*t,...b)}ctx.stroke()}}
function drawTrolleyWires(){if(!S||!RES().electric||!TL||!TL.size||Z<.3)return;const t=32*Z;ctx.strokeStyle='rgba(30,28,26,.6)';ctx.lineWidth=Math.max(.4,Z*.4);ctx.beginPath();for(const[i,nb]of TL){const x=i%W,y=(i/W)|0;for(const n of nb){if(n<i)continue;const a=scr(x,y),b=scr(n%W,(n/W)|0);if(Math.max(a[0],b[0])<-40||Math.min(a[0],b[0])>vw+40||Math.max(a[1],b[1])<-60||Math.min(a[1],b[1])>vh+40)continue;for(const o of[-.05,.05]){ctx.moveTo(a[0]+o*t,a[1]-.55*t);ctx.lineTo(b[0]+o*t,b[1]-.55*t)}}}ctx.stroke()}
/* night falls: a toggle between automatic, day and night */
/* the time of day for the light, a day every six minutes: it runs on only while the view moves, the player walks or a card covers the
   city, so the sun and its shadows hold still while the player looks at the city, and catch up (up to six times as fast) when the
   picture changes anyway (frame.js calls dayGo). After 45 seconds of looking the day goes on at its own pace, so the night always comes */
let DAYT=null,DAYW=0,DAYD=0,DAYS=null;
function dayT(){return DAYT==null?performance.now()/1000%360:DAYT}
function dayGo(now,go){const t=now/1000;/* a saved game goes on at its own time of day, so the night also comes to who plays in short visits */
 if(S&&DAYS!==S){DAYS=S;if(S.dayT!=null){DAYT=S.dayT%360;DAYW=t;DAYD=0;return}}if(DAYT==null){DAYT=t%360;DAYW=t;return}const dt=Math.max(0,Math.min(5,t-DAYW));DAYW=t;DAYD+=dt;const st=go?Math.min(DAYD,dt*6+.02):Math.max(0,DAYD-45);if(st>0){DAYT=(DAYT+st)%360;DAYD-=st}}
function night(){if(!L||!L.y1857)return 0;const m=S&&S.dnm||'auto';if(m==='day')return 0;if(m==='night')return .42;const ph=dayT()/360;return Math.max(0,-Math.cos(ph*2*Math.PI)-.25)**.9*.5}
function dnTxt(){const b=$('#dnBtn');if(b&&S)b.textContent={auto:'🌓 Day and night: by themselves',day:'☀️ Always day',night:'🌙 Always night'}[S.dnm||'auto']}
function cycleNight(){const m=['auto','day','night'],c=S.dnm||'auto';S.dnm=m[(m.indexOf(c)+1)%3];gGV=-1;dnTxt();toast({auto:'🌓 Day and night change by themselves',day:'☀️ Always day',night:'🌙 Always night'}[S.dnm])}

/* ===================== round seven: solid boxes, wall-true windows, real delivery wagons, spacing ===================== */
function winF(Pf,s,ws,h0,hh,col,arch){const a=Pf(s-ws/2,h0),b=Pf(s+ws/2,h0);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);if(arch){ctx.lineTo(b[0],b[1]-hh*.82);ctx.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2-hh*1.08,a[0],a[1]-hh*.82)}else{ctx.lineTo(b[0],b[1]-hh);ctx.lineTo(a[0],a[1]-hh)}ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(240,232,214,.55)';ctx.lineWidth=Math.max(.4,hh*.05);ctx.beginPath();ctx.moveTo(a[0],a[1]+.5);ctx.lineTo(b[0],b[1]+.5);ctx.stroke()}
function drawDelivery(x,y,hx,hy,g,hc){const a={sx:x,sy:y,hx,hy,x,y},[cx,cy]=scr(x,y),P=rigFrame(a,cx,cy),A0=P(0,0),A1=P(1,0),sux=A1[0]-A0[0],suy=A1[1]-A0[1],away=suy<0,t=32*Z,Ln=.32,Wd=.15,col='#6b4f30';
 ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();const sh=[P(-Ln/2,-Wd/2),P(Ln/2,-Wd/2),P(Ln/2,Wd/2),P(-Ln/2,Wd/2)];ctx.moveTo(sh[0][0]+2,sh[0][1]+2);for(const q of sh)ctx.lineTo(q[0]+2,q[1]+2);ctx.fill();
 const horse=()=>{const hp=P(Ln/2+.3,0,0);drawHorse(hp[0],hp[1],sux,suy,Z*.85,HORSE[(hc||0)%HORSE.length],performance.now()/110+(hc||0))};if(away)horse();
 for(const[u,v]of[[-Ln/2+.08,-Wd/2-.01],[Ln/2-.08,-Wd/2-.01],[-Ln/2+.08,Wd/2+.01],[Ln/2-.08,Wd/2+.01]])wheelAt(P(u,v,0),.05*t*RS*2);
 box3(P,-Ln/2,Ln/2,-Wd/2,Wd/2,.1,.2,shade(col,1.05),shade(col,.8),shade(col,1.15));
 const goods={food:'#d9a13a',grain:'#e2d35c',beer:'#7a5532',wine:'#7a2a3a',wool:'#efe7d6',cloth:'#b8322a',wood:'#a8854f',bricks:'#a85a3e',stone:'#b9b1a0',iron:'#4a4f55',coal:'#24211f',cars:'#1d1b1a'}[g]||'#c9b48a';
 if(g==='wood'||g==='bricks'||g==='stone'||g==='iron'||g==='coal')box3(P,-Ln/2+.03,Ln/2-.03,-Wd/2+.02,Wd/2-.02,.2,.3,shade(goods,1.05),shade(goods,.8),shade(goods,1.15));
 else{const top=[P(-Ln/2+.02,0,.42),P(Ln/2-.02,0,.42)],L1=P(-Ln/2+.02,Wd/2,.2),L2=P(Ln/2-.02,Wd/2,.2),R1=P(-Ln/2+.02,-Wd/2,.2),R2=P(Ln/2-.02,-Wd/2,.2);ctx.fillStyle='#e9e2d0';ctx.beginPath();ctx.moveTo(...R1);ctx.quadraticCurveTo(R1[0],top[0][1],...top[0]);ctx.lineTo(...top[1]);ctx.quadraticCurveTo(R2[0],top[1][1],...R2);ctx.lineTo(...L2);ctx.quadraticCurveTo(L2[0],top[1][1],...top[1]);ctx.lineTo(...top[0]);ctx.quadraticCurveTo(L1[0],top[0][1],...L1);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(120,105,80,.5)';ctx.lineWidth=Math.max(.3,Z*.3);ctx.stroke()}
 const dr=P(Ln/2,0,.2);drawPerson(dr[0],dr[1]+.04*t,Z*.6,29);if(!away)horse()}

/* ---------- first-minutes guide, feedback, low-end phones ---------- */
const LOWEND=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory&&navigator.deviceMemory<=3);
if(LOWEND)document.documentElement.classList.add('lowend');
const FEEDBACK_TO='';
/* three tips, each a line, the next one when the last is done: playing within the first half minute */
const TUT=[
 ()=>`<b>🏠 Homes first:</b> 🔨 Build › 🏠 Homes, then tap a green spot. The builder pays you at once.`,
 ()=>`<b>🛤️ Every building needs a road</b> to a market: 🔨 Build › 🛤️ Roads & rail, tap a start and an end, then ✓.`,
 ()=>`<b>👆 Tap any building</b> to see what it needs. ▶ 1× changes the speed.`];
let TUTI=-1,INTROP=0;
function tutDoneKey(){return'tut-done-'+(L&&L.name||'')}
function tutStart(){try{if(localStorage.getItem(tutDoneKey()))return}catch(e){}TUTI=0;tutShow()}
function tutShow(){const el=$('#tut');if(!el)return;if(TUTI<0||TUTI>=TUT.length){el.hidden=true;return}el.hidden=false;
 el.innerHTML=`<div>${TUT[TUTI]()}</div><div class="tutB"><button id="tutSkip">Skip</button><button id="tutNext" class="pri">${TUTI===TUT.length-1?'Done':'Next'}</button></div>`;
 $('#tutNext').onclick=()=>{TUTI++;if(TUTI>=TUT.length)tutEnd();else tutShow()};$('#tutSkip').onclick=tutEnd}
function tutEnd(){TUTI=-1;const el=$('#tut');if(el)el.hidden=true;try{localStorage.setItem(tutDoneKey(),'1')}catch(e){}}
function tutTick(){if(TUTI===0&&S&&S.list.some(o=>o.t==='house'&&!o.h)){TUTI=1;tutShow()}else if(TUTI===1&&S&&UNDO.some(u=>u.k==='roads')){TUTI=2;tutShow()}}
function showFeedback(){const info=S?`${L.name} · ${dateStr(S.t)} · ${fmtPop(dispPop())} people · ${navigator.userAgent}`:navigator.userAgent;
 ov(`<h2>💬 Feedback</h2><p class="m">What was fun, what was confusing, what broke? Every note helps.</p><textarea id="fbIn" rows="6" style="width:100%;box-sizing:border-box;font:inherit;padding:8px;border-radius:8px;user-select:text;-webkit-user-select:text" placeholder="Your feedback…"></textarea>
 <div class="btns"><button class="pri" id="fbSend">Send by e-mail</button><button id="fbCopy">Copy</button><button id="fbClose">Close</button></div>`);
 const txt=()=>`${$('#fbIn').value}\n\n---\n${info}`;
 $('#fbSend').onclick=()=>{location.href=`mailto:${FEEDBACK_TO}?subject=${encodeURIComponent('Game feedback: '+L.name)}&body=${encodeURIComponent(txt())}`};
 $('#fbCopy').onclick=async()=>{try{await navigator.clipboard.writeText(txt());toast('Copied')}catch(e){toast('Select the text and copy it')}};$('#fbClose').onclick=closeOv}

/* ---------- UI ---------- */
/* tips closed with a tap while walking stay closed */
let TSHUT;try{TSHUT=new Set(JSON.parse(localStorage.getItem('gcTipShut')||'[]'))}catch(e){TSHUT=new Set()}
/* on foot a note waits while a letter or a scene's question is up, so the two never lie on each other */
const cardHeld=()=>document.body.classList.contains('walking')&&(!!msgOpen||!!(S&&S.sc&&!S.sc.end&&S.sc.ask));
const TKEEP=/^(⚠️|Not enough|💰 Not enough|No free spot|No spot|No route|Not possible|Not before|Can't|Cannot|You can't|You cannot|You need|You've already|Something is already|Outside|Too close|A street runs|Bridges already|Flood plain|Not available|This is a|This road needs|The treasury cannot|The railway|🚆|Unlocks|Possible |Tap again|Copied|Select the text|Press and hold|No save code|That save|Your game is loaded|Nothing to undo|↶|Research |Build barracks first|Lay a street first|Start a city first|Your storage is full|Your fleet|Part of the historic|That belongs|That was already|These two cards|Those do not|✍️|Purchases open|The calendar stands still)|stands here$/;
let toastT;function toast(m){if(cardHeld()&&!SIMT){if(!TOQ.includes(m)){TOQ.push(m);if(TOQ.length>3)TOQ.shift()}return}if(TSHUT.has(m)&&document.body.classList.contains('walking'))return;const lm=/^Not enough (\w+)/.exec(m);if(lm&&S&&lackShow(lm[1]==='money'?'gold':lm[1],m))return;/* a note the city writes by itself goes to the papers; one that answers the player stays long enough to read, and a second one
  waits a moment unless the first has been up a while */
 if(SIMT){news(m);return}
 /* in the city view no note pops up by itself: what the city or a step reports goes to the papers. Only the answer to a tap still shows,
    why it cannot be done, what a second tap will do, a copy or a load done (walking keeps its notes: the street has no other voice) */
 if(!document.body.classList.contains('walking')&&!TKEEP.test(m)){news(m);return}
 const now=performance.now(),el=$('#toast');if(el.classList.contains('show')&&m!==el.textContent&&now<TOAT+1500){if(!TOQ.includes(m)){TOQ.push(m);if(TOQ.length>2)TOQ.shift()}return}
 const d=Math.max(3500,Math.min(5500,m.length*45));TOBUSY=now+d;TOAT=now;el.textContent=m;toastAt(el);el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),d)}
/* on the map the note goes just under the top bar and the goals list or any banner at the top, so it never covers a card the player is
   reading, and never lower than about the middle of the screen */
function toastAt(el){const b=document.body.classList;if(b.contains('walking')||b.contains('placing'))return;const pr=el.offsetParent?el.offsetParent.getBoundingClientRect().top:0;let y=0;
 for(const id of['#top','#goals','#lack','#nudge']){const e=$(id);if(!e||e.hidden||!e.offsetParent)continue;const r=e.getBoundingClientRect();if(r.height&&r.top<innerHeight*.4)y=Math.max(y,r.bottom)}
 el.style.setProperty('--toastTop',Math.round(Math.min(innerHeight*.45,Math.max(0,y-pr)+6))+'px')}
$('#toast').addEventListener('click',e=>{const el=e.currentTarget,b=document.body.classList;if(b.contains('walking')||!el.classList.contains('show'))return;el.classList.remove('show');clearTimeout(toastT);TOBUSY=0});
/* "Not enough bricks": the way out, a brickyard to build or a lot to buy */
let lackT;const PROD_ALT={food:['garden','farm'],wood:['sawmill','woodcutter']};
function prodOf(g){const ks=(PROD_ALT[g]||[]).concat(L.order||[],CATS.flatMap(c=>c[3]||[]));return ks.find(k=>B[k]&&B[k].out===g&&!B[k].lm&&(!L.order||L.order.includes(k)||CATS.some(c=>c[3]&&c[3].includes(k))))}
const anA=w=>/^[aeiou]/i.test(w)?'an '+w:'a '+w;
function lackChain(g,d=0){const p=prodOf(g);if(!p||d>3)return null;const c=B[p].cost||{},m=Object.keys(c).find(k=>(S.stock[k]||0)<c[k]);if(!m)return{p,via:[]};if(m==='gold')return{p,via:[],gold:1};const q=lackChain(m,d+1);if(!q)return{p,via:[],m};q.via.push(p);return q}
function lackShow(g,txt){const ch=g==='gold'?null:lackChain(g),p=ch&&ch.p,tr=g==='gold'||GOODS.includes(g)&&!!PRICE[g];if(!p&&!tr)return false;
 const via=ch&&ch.via.length?B[ch.via[ch.via.length-1]]:null,why=(via?` ${anA(via.n.toLowerCase()).replace(/^./,c=>c.toUpperCase())} needs ${ICON[B[p].out]||''}${B[p].out||'goods'} first.`:'')+
  /* the works that makes it costs more money than there is: said here, and the button still builds it (the next card then shows the
     ways to more money), so a short good always leads to what makes it */
  (ch&&ch.gold&&B[p].cost&&B[p].cost.gold?` ${anA(B[p].n.toLowerCase()).replace(/^./,c=>c.toUpperCase())} costs ${money(B[p].cost.gold,1)} You have ${money(Math.floor(S.stock.gold),1)}`:'');
 $('#lackTxt').innerHTML=cz(`${ICON[g]||''} ${txt.replace(/^Not enough gold/,'Not enough money').replace(/[<>&]/g,'').replace(/\.$/,'')}.${why}`);const b=$('#lackBuild'),t=$('#lackTrade');
 /* short of money: homes pay the rent, so more of them is the first way out, said here with a button to mark a plot (where one can be paid for) */
 if(g==='gold'&&B.house){const hc=B.house.cost||{},can=Object.keys(hc).every(k=>(S.stock[k]||0)>=hc[k]);$('#lackTxt').insertAdjacentHTML('beforeend',cz(` Homes pay rent: more ${B.house.n.toLowerCase().replace('zinshaus','Zinshaus')}s bring more money.`));
  b.hidden=!can;if(can){b.textContent=`${B.house.i} Build ${anA(B.house.n.toLowerCase().replace('zinshaus','Zinshaus'))}`;b.onclick=()=>lackGo('house')}}else
 b.hidden=!p;if(p){const lk=lockOf(p);b.textContent=lk==='research'?`🔬 Research the ${B[p].n.toLowerCase()}`:`${B[p].i} ${via?'First ':'Build '}${anA(B[p].n.toLowerCase())}`;b.onclick=()=>lackGo(p)}
 /* and the other workshop that makes it, where there is one: wood from a timber yard in the woods as well as a wharf on the water */
 {const b2=$('#lackBuild2'),p2=p&&!via&&Object.keys(B).find(k=>k!==p&&B[k].out===g&&!B[k].lm&&(!L.order||L.order.includes(k)||CATS.some(c=>c[3]&&c[3].includes(k))));b2.hidden=!p2;
  if(p2){b2.textContent=lockOf(p2)==='research'?`🔬 Research the ${B[p2].n.toLowerCase()}`:`${B[p2].i} Build ${anA(B[p2].n.toLowerCase())}`;b2.onclick=()=>lackGo(p2)}}
 /* short of money: the finances overview, with every way to more money (taxes, more homes, trade, a loan), not straight to a loan */
 t.hidden=!tr;t.textContent=g==='gold'?'💰 Ways to more money':`⚖️ Buy ${g}: ${money(PRICE[g][0],1)} each`;t.onclick=()=>g==='gold'?($('#lack').hidden=true,setMode(null),showFinances('o')):lackTrade(g);
 const el=$('#lack');el.hidden=false;clearTimeout(lackT);lackT=setTimeout(()=>el.hidden=true,9000);sfx('click');return true}
function lackGo(p){$('#lack').hidden=true;if(lockOf(p)==='research'){setMode(null);showResearch();return}
 const c=CATS.find(c=>c[3]&&c[3].includes(p));if(c&&CAT!==c[0]){CAT=c[0];BARSIG='';buildBar()}
 const h=HINTA;HINTA=p;hintAct();HINTA=h;const bb=$(`#builds .bb[data-k="${p}"]`);if(bb)bb.scrollIntoView({inline:'center',block:'nearest'});
 const d=B[p],need=[ONTXT[d.on]||'',d.in?`${ICON[d.in]||''} ${d.in} delivered`:'',needsRoad({t:p})?'a road to a market':''].filter(Boolean);
 setTimeout(()=>{const m=Object.keys(d.cost).find(k=>S.stock[k]<d.cost[k]);if(m)lackShow(m,shortBy(m,d.cost[m]).replace(/^Not enough \w+/,`$& for ${anA(d.n.toLowerCase())}`));else toast(`${d.i} ${d.n}${need.length?': needs '+need.join(', ').replace(/, ([^,]*)$/,' and $1'):''}. ${coarse?'Tap Build to place it here, or tap elsewhere':'Click the map to place it'}`)},250)}
const ONTXT={get clay(){return NYC()?'the clay banks of Greenpoint or Williamsburg':'the clay pits of the Wienerberg or the Laaer Berg'},coast:'the waterfront',grass:'open grassland',rail:'a railway line beside it'};
$('#lackX').onclick=()=>$('#lack').hidden=true;
/* a quiet next step: after a while with nothing done, one line points at the most useful thing, minutes apart, never while building, reading or during a case or scene */
let NUDGET=performance.now(),NUDGEH=0;
function nudgeNext(){const own=S.list.filter(o=>!o.r&&!o.h&&!o.ship);
 {const o=own.find(o=>roadAsk(o)&&!o.c&&!o.bld);if(o)return[`Your ${B[o.t].n.toLowerCase()} has no road. Build one?`,'🛤️ Build a road',()=>{jumpTo(o.x+1,o.y+1);roadOffer(o)}]}
 for(const o of own){if(!o.bld||o.wr)continue;const g=Object.keys(o.bld).find(g=>o.bld[g]>0&&S.stock[g]<1),p=g&&prodOf(g);if(p&&!cnt(p))return[`${ICON[g]||''} ${cap1(g)} ${g.endsWith('s')?'are':'is'} short: build ${anA(B[p].n.toLowerCase())}${B[p].on&&ONTXT[B[p].on]?' on '+ONTXT[B[p].on]:''}`,`${B[p].i} Build ${anA(B[p].n.toLowerCase())}`,()=>lackGo(p)]}
 {const q=goalsOpen().find(q=>S.q[q.id].st==='active'&&goalAct(q)&&!goalBusy(q));if(q){const a=goalAct(q);return[`${goalIcon(q)} ${ucf(q.short)}: ${questProgress(q)}`,a==='research'?'🔬 Open research':a==='hall'?HALLB():`🔨 Build ${B[a].lm?'the '+B[a].n:anA(B[a].n.toLowerCase())}`,()=>goalGo(q)]}}
 {const n={};for(const o of own)if(o.t==='house'&&!o.bld)for(const m of houseNeeds(o))if(!m[0]&&B[m[2]])n[m[2]]=(n[m[2]]||0)+1;const k=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];
  if(k&&n[k]>=2)return[`${n[k]} homes want ${houseNeeds(own.find(o=>o.t==='house'&&houseNeeds(o).some(m=>!m[0]&&m[2]===k))).find(m=>m[2]===k)[1]}`,`${B[k].i} Build ${anA(B[k].n.toLowerCase())}`,()=>lackGo(k)]}
 return null}
function nudgeShow(t,bl,fn){$('#nudgeTxt').textContent=t;const b=$('#nudgeGo');b.textContent=bl;b.onclick=()=>{$('#nudge').hidden=true;LASTACT=performance.now();fn()};$('#nudge').hidden=false;NUDGEH=performance.now()+16000}
$('#nudgeX').onclick=()=>{$('#nudge').hidden=true};
function nudgeTick(){const el=$('#nudge');if(!S||!el||!L.y1857)return;const now=performance.now(),busy=placing()||!!mode||quiet()||!!S.case||guideBusy()||!!S.sc||!$('#ov').hidden||MSG.length||!$('#msg').hidden||!$('#lack').hidden||onFoot()||TUTI>=0||spd===0||now<TOBUSY||!$('#scn').hidden||!$('#job').hidden||!$('#info').hidden||!$('#trade').hidden||!!document.querySelector('.sheet:not([hidden])');
 if(!el.hidden){if(busy||now>NUDGEH)el.hidden=true;return}if(busy)return;
 if(!S.wkTip&&Z>=2&&now-NUDGET>20000){S.wkTip=1;NUDGET=now;nudgeShow('🚶 Walk these streets yourself?','🚶 Walk',()=>$('#zWk').click());return}
 if(now-LASTACT<75000||now-NUDGET<240000)return;const n=nudgeNext();NUDGET=now;if(n)nudgeShow(...n)}
setInterval(nudgeTick,1500);
function lackTrade(g){$('#lack').hidden=true;closeInfo();tradeFill();$('#trade').hidden=false;
 const r=g==='gold'?$('#loanBtn'):$(`#tradeRows [data-buy="${g}"]`),el=r&&(r.closest('.tr')||r);if(!el)return;el.classList.add('hl');el.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>el.classList.remove('hl'),2600)}
const costStr=c=>Object.entries(c).map(([k,v])=>`${ICON[k]}${k==='gold'?mn(v):v}`).join(' ');
/* the same on a build card: a cost not in store (or not in the treasury) in red with ✗ */
/* a cost as what is in store against what it takes, each good with its icon: 383/1000, green when there is enough, red when not */
const costOf=c=>Object.entries(c).map(([k,v])=>{const h=k==='gold'?mn(Math.floor(S.stock.gold||0)):Math.floor(S.stock[k]||0),n=k==='gold'?mn(v):v;return`<span class="cst ${(S.stock[k]||0)>=v?'ok':'no2'}">${ICON[k]}\u2009${typeof h==='number'?fmt(h):h}/${typeof n==='number'?fmt(n):n}</span>`}).join(' ');
const costHave=c=>Object.entries(c).map(([k,v])=>{const ok=(S.stock[k]||0)>=v;return`<span class="${ok?'':'lack'}">${ok?'':'✗ '}${ICON[k]}${k==='gold'?mn(v):v}</span>`}).join(' ');
const haveSig=ord=>ord.map(k=>Object.entries(B[k].cost||{}).every(([g,v])=>(S.stock[g]||0)>=v)?1:0).join('');
/* the build menu stays folded away while playing: 🏗️ Build opens it, picking something or tapping the map folds it again */
function barOpen(v){const b=$('#bar');b.classList.toggle('open',v);if(v)fitNames();const t=$('#buildBtn');t.classList.toggle('on',v);buildBtnUI();if(v)sheet(null);if(v){BARSIG='';buildBar()}}
$('#buildBtn').onclick=()=>{const v=!$('#bar').classList.contains('open');if(v&&mode)setMode(null);barOpen(v)};
cv.addEventListener('pointerdown',()=>{if(!mode&&$('#bar').classList.contains('open'))barOpen(false)});
$('#builds').addEventListener('click',e=>{const b=e.target.closest('.bb');if(!b)return;if(b.classList.contains('locked')){const lk=lockOf(b.dataset.k);toast(lk==='research'?`🔒 ${B[b.dataset.k].n}: unlock it with 🔬 Research first`:/^(Unlocks|Opens)/.test(lk)?`🔒 ${B[b.dataset.k].n}: ${lk[0].toLowerCase()+lk.slice(1)}`:`🔒 ${B[b.dataset.k].n}: unlocks ${lk}`);return}setMode(mode===b.dataset.k?null:b.dataset.k);if(mode)barOpen(false)});
setInterval(()=>{if(S&&L.order){const cat=CATS.find(c=>c[0]===CAT)||CATS[1],ord=catOrd(cat);if(CAT+'|'+LMSUB+'|'+ord.map(lockOf).join(',')+'|'+haveSig(ord)!==BARSIG)buildBar()}},1500);
function setMode(m){mode=m;pend=null;ROADQ=null;ROADB=null;if(m)LASTACT=performance.now();RA=-1;RPV=null;LA=-1;LPV=null;RE=-1;LE=-1;confHide();closeInfo();$('#trade').hidden=true;
 document.querySelectorAll('.bb').forEach(b=>b.classList.toggle('on',b.dataset.k===m));
 $('#demoBtn').classList.toggle('on',m==='demolish');
 $('#mode').hidden=!m;{const st=!B[m]||m==='road'||m==='bridge'||m==='rail'||m==='tramline'||m==='elight';$('#modeDone').textContent=st?'Done':'✕ Cancel';$('#modeDone').setAttribute('aria-label',st?'Done':'Cancel')}$('#modeFind').hidden=!m||m==='road'||m==='bridge'||m==='rail'||m==='tramline'||m==='elight'||m==='demolish'||!B[m]||!!B[m].lm;
 if(m==='rail')$('#modeTxt').innerHTML='<b>🚂 Railway</b>: tap a start, then an end to see the route, then tap again to build. '+money(12)+' and half an iron per tile. Run a line to the edge of the map for a main line.';
 else if(m==='tramline')$('#modeTxt').innerHTML=NYC()&&(tramNames(),1)?`<b>🚋 ${B.tramline.n}</b>: tap a start and an end on your roads, then tap again to build. The cars start from a ${B.tram.n.toLowerCase()}.`:'<b>🚋 Tram line</b>: tap a start and an end on your roads, then tap again to build. Trams need a tram depot.';
 else if(m==='elight')$('#modeTxt').innerHTML='<b>💡 Electric light</b>: tap a street to put up arc lamps along it and the streets round it, '+money(6)+' a tile. Tap again to confirm.';
 else if(m==='demolish')$('#modeTxt').innerHTML='<b>Demolish</b>: tap one of your buildings or roads to remove it. You get half its wood back.';
 else if(m==='road')$('#modeTxt').innerHTML=coarse?'<b>🛤️ Road</b>: tap a start point, then an end point to see the route and its price. Tap the end again to build. Dragging just moves the map.':'<b>🛤️ Road</b>: click a start point, then an end point. The route is straight where it can be and planned around obstacles where it must. Dragging moves the map.';
 else if(m)$('#modeTxt').innerHTML=`<b>${B[m].i} ${B[m].n}</b>: ${B[m].d}${needsRoad({t:m})?' Connect it by road.':''}${B[m].cost&&Object.keys(B[m].cost).length?` Costs ${costStr(B[m].cost)}.`:''}${B[m].proj?` Needs ${costStr(B[m].proj)} delivered over time.`:''}${B[m].lm&&lmEntry(m)?' Build it near the 📍 real location for twice the visitors.':''} ${coarse?'Tap a spot, nudge it with the arrows, then tap Build.':'Click the map to build.'}`;
 $('#mode').classList.remove('more');MORESIG='';moreUI();buildBtnUI()}
$('#modeDone').onclick=()=>setMode(null);
/* keep the page scrolled by 1px so the app's swipe-down-to-close gesture doesn't fire while panning the map */
(function(){const keep=()=>{if(window.scrollY<1)window.scrollTo(0,1)};keep();setTimeout(keep,60);setTimeout(keep,400);window.addEventListener('scroll',keep,{passive:true});window.addEventListener('resize',()=>setTimeout(keep,50));
 for(const ev of['touchstart','touchmove'])cv.addEventListener(ev,e=>{e.preventDefault();keep()},{passive:false});document.addEventListener('touchend',()=>setTimeout(keep,0),{passive:true})})();

/* the app fills what the browser shows between its bars: 100dvh reaches under Safari's bottom bar on some iPhones, and the body's
   padding under the camera cut-out pushed the tabs further down */
(function(){const app=$('#app');if(!app)return;const fit=()=>{const cs=getComputedStyle(document.body),h=innerHeight-parseFloat(cs.paddingTop||0)-parseFloat(cs.paddingBottom||0);app.style.height=Math.max(240,Math.round(h))+'px'};
 fit();addEventListener('resize',fit);if(window.visualViewport)visualViewport.addEventListener('resize',fit);addEventListener('orientationchange',()=>{setTimeout(fit,300);setTimeout(fit,900)})})();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)save(true)});window.addEventListener('pagehide',()=>{if(S)save(true)});
for(const ev of['gesturestart','gesturechange','gestureend'])document.addEventListener(ev,e=>e.preventDefault(),{passive:false});
/* a page the phone has zoomed in all the same (Safari lets a pinch through on iPhone, and keeps the zoom after turning the phone and
   even after a reload) shows only part of the bars: setting the viewport again with a maximum scale of 1 puts it back to its own
   size, on loading, after turning the phone, and whenever it is found enlarged */
if(window.visualViewport){const vm=document.querySelector('meta[name=viewport]');if(vm){const v0=vm.content,v1=v0.replace('initial-scale=1,','initial-scale=1.0,minimum-scale=1,');let alt=false;
 const unzoom=()=>{if(visualViewport.scale>1.02){alt=!alt;vm.content=alt?v1:v0}};visualViewport.addEventListener('resize',unzoom);addEventListener('orientationchange',()=>{setTimeout(unzoom,300);setTimeout(unzoom,900)});addEventListener('pageshow',()=>setTimeout(unzoom,50));setTimeout(unzoom,0)}}
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
/* Safari's own pinch gestures zoom the page past the touch guard (and over a card or panel): they are stopped too, so a pinch only zooms the map */
for(const t of['gesturestart','gesturechange','gestureend'])document.addEventListener(t,e=>e.preventDefault(),{passive:false});
{let lt=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lt<320&&!(e.target.closest&&e.target.closest('canvas')))e.preventDefault();lt=n},{passive:false})}
$('#undoBtn').onclick=undoAsk;$('#undoPill').onclick=undoAsk;$('#modeUndo').onclick=undoAsk;
$('#modeFind').onclick=()=>findSpot();
$('#dnBtn').onclick=cycleNight;addEventListener('keydown',e=>{if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='q'||e.key==='Q')turnSmooth(-1);if(e.key==='e'||e.key==='E')turnSmooth(1)});
$('#fbBtn').onclick=()=>{setMode(null);showFeedback()};
$('#confOk').onclick=confOk;$('#confNo').onclick=confNo;document.querySelectorAll('#conf [data-mv]').forEach(b=>b.onclick=()=>{const[dx,dy]=b.dataset.mv.split(',').map(Number);confMove(dx,dy)});
$('#autoBuy').onchange=e=>{if(S)S.autoBuy=e.target.checked};
$('#planBtn').onclick=()=>{PLAN.on=!PLAN.on;PLAN.warned=false;$('#planBtn').classList.toggle('on',PLAN.on);$('#planCred').hidden=!PLAN.on;gGV=-1;if(PLAN.on)toast('📜 The real Generalstadtplan of 1904: a guide to the city you are building')};
$('#zPl').onclick=()=>$('#homeBtn').onclick();$('#zIn').onclick=()=>zoomAt(vw/2,vh/2,Z*1.5);$('#zOut').onclick=()=>zoomAt(vw/2,vh/2,Z/1.5);
$('#hint').onclick=()=>hintAct();
$('#demoBtn').onclick=()=>setMode(mode==='demolish'?null:'demolish');
const SPEEDS=[0,1,2,4,8,16,32];let spd=1;
const spdTxt=()=>`${spd===0?'⏸<i class="cur"> Paused</i>':`<i class="ic">${spd>1?'⏩':'▶'} </i>${SPEEDS[spd]}×`}`;
/* the speed, chosen from a small menu under its button: pause, 1×, 2×, 4× or 8× (keys still step through them) */
function spdMenu(){let m=$('#spdMenu');if(m){m.remove();return}const c=$('#res [data-sp]');if(!c)return;const r=c.getBoundingClientRect();m=document.createElement('div');m.id='spdMenu';
 m.innerHTML=[0,1,2,4,8].map(v=>`<button data-v="${v}" class="${SPEEDS[spd]===v?'on':''}">${v===0?'⏸ Pause':`${v>1?'⏩':'▶'} ${v}×`}</button>`).join('');
 m.style.left=Math.max(8,r.left)+'px';m.style.top=(r.bottom+6)+'px';document.body.appendChild(m);sfx('click');
 m.onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;e.stopPropagation();m.remove();sfx('click');if(S&&S.scratch&&S.freeEnd&&+b.dataset.v&&!fullGame()){freeBuy();return}spd=SPEEDS.indexOf(+b.dataset.v);if(S)updateUI()};
 const off=e=>{if(e.target.closest&&e.target.closest('#spdMenu,#res [data-sp]'))return;const mm=$('#spdMenu');if(mm)mm.remove();document.removeEventListener('pointerdown',off,true)};setTimeout(()=>document.addEventListener('pointerdown',off,true),0)}
function spdCycle(){spd=(spd+1)%SPEEDS.length;toast(spd===0?'⏸ Paused':`${spd>1?'⏩':'▶'} Speed ${SPEEDS[spd]}×`);if(S)updateUI()}
const PLACES=[['⛪','Trinity Church & Wall Street',40.7081,-74.0119],['🏛️','City Hall',40.7127,-74.0059],['🌉','Brooklyn Bridge site',40.7075,-73.9970],['🗽','Bedloe\'s Island',40.6892,-74.0445],['🌳','Central Park, south end',40.7650,-73.9760],['🏰','Fifth Avenue',40.7500,-73.9830],['🍺','Williamsburg breweries',40.7150,-73.9600],['🧱','Greenpoint brickyards',40.7300,-73.9545],['⚓','East River piers',40.7060,-74.0000]];
function goGeo(la,lo){const[x,y]=gt(...prj(L,la,lo));if(Z<.35)Z=.45;centerOn(x,y);gGV=-1}
$('#homeBtn').onclick=()=>{const mine=S.list.filter(o=>!o.h&&!o.r&&o.t!=='road');
 ov(`<h2>Places</h2><div class="plc">${PLACES.map((p,k)=>`<button data-p="${k}">${p[0]} ${p[1]}</button>`).join('')}${mine.length?'<button data-p="mine">📌 Your newest building</button>':''}</div><div class="btns"><button class="pri" id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=closeOv;document.querySelectorAll('.plc button').forEach(b=>b.onclick=()=>{const k=b.dataset.p;closeOv();if(k==='mine'){const o=mine[mine.length-1];if(Z<.35)Z=.45;centerOn(...fc(o));gGV=-1;sel=o}else goGeo(PLACES[k][2],PLACES[k][3])})};
function clampCam(){const hw=TW/2*Z,hh=TH/2*Z,a=(vw/2-cam.x)/hw,b=(vh/2-cam.y-hh)/hh,fx=(a+b)/2,fy=(b-a)/2,cx=Math.max(0,Math.min(W,fx)),cy=Math.max(0,Math.min(H,fy));if(cx!==fx||cy!==fy)centerOn(cx,cy)}
$('#helpBtn').onclick=()=>showHelp();

function openInfo(o){if(o.t==='road')return closeInfo();if(sel!==o)INFODET=false;sel=o;LASTACT=performance.now();$('#trade').hidden=true;$('#info').hidden=false;$('#infoDemo').hidden=!!o.r||!!o.h||!!o.ship||(o.t==='kontor'&&cnt('kontor')===1);
 const a=$('#infoAct');a.hidden=!(o.t==='shipyard'&&!o.r);if(!a.hidden){a.textContent='Build ship (🪙400 🪵15 🔨6)';a.onclick=()=>buildShip(o)}$('#info .btns').hidden=$('#infoDemo').hidden&&$('#infoAct').hidden;renderInfo();sfx('click')}
function closeInfo(){sel=null;$('#info').hidden=true}
/* the panel refreshes four times a second; a finger on it holds the refresh, so a button is not swapped out between touch and tap */
let INFOHOLD=0;for(const ev of['pointerdown','touchstart'])$('#info').addEventListener(ev,()=>{INFOHOLD=performance.now()+900},{passive:true});
$('#infoClose').onclick=closeInfo;$('#infoX').onclick=closeInfo;$('#infoDemo').onclick=()=>{if(sel)demolish(sel)};
function renderInfo(){const o=sel;if(!o)return;const d=B[o.t],i=o.y*W+o.x,st=S.stock;
 const mark=b=>b?'<span class="ok">✓</span>':'<span class="no2">✗</span>';
 if(o.ship){const t=o.task;const n=cargoN(o);$('#infoBody').innerHTML=`<h2>⛵ Trade ship</h2><p>${!t?'Waiting in port':t.k==='found'?'Sailing a new warehouse to its island':t.k==='load'?'Sailing to collect goods from an outpost':'Bringing goods home'}</p>
  <p>Cargo: ${n?Object.entries(o.cargo).filter(e=>e[1]).map(([g,v])=>`${ICON[g]} ${v}`).join(' '):'empty'} <span class="m">(holds 30)</span></p><p class="m">Ships work on their own. They settle islands you mark with a warehouse, collect goods from outposts, and shoot at pirates nearby.</p>`;return}
 if(o.h){$('#infoBody').innerHTML=`<h2>${bIco(o.t)} ${d.n}</h2><p class="m">${o.t==='house'?'Part of the historic city.':d.d||''}</p>${o.t==='house'?`<p>${LV[o.lvl].n}, about ${fmtPop(maxPop(o)*(S.mult||1))} residents</p>`:''}`;infoExtra(o);return}
 if(o.r){$('#infoBody').innerHTML=`<h2>${bIco(o.t)} ${d.n}</h2><p>Part of the ${L.rival.n} colony.${o.t==='house'?` ${o.pop} residents live here.`:''}</p><p class="m">The rival colony has ${rivalPop()} people in total.</p>`;return}
 let h=`<p class="m">${d.d}</p>`;
 if(roadAsk(o))h+=`<p>${mark(o.c)} ${o.c?'Connected by road':'No road to a warehouse or market'}</p>`;
 if(o.t==='house'&&!L.y1857){const L=LV[o.lvl];h+=`<p><b>${L.n}</b>: ${o.pop} of ${L.max} residents</p><p>`;
  for(let l=1;l<=o.lvl;l++)h+=`${mark(st[LV[l].need]>.5)} ${ICON[LV[l].need]} ${cap1(LV[l].need)} &nbsp;`;h+='</p>';
  const up={1:[[mk[i],'Market nearby'],[st.cloth>.5,'👕 Cloth'],[st.wood>=2&&st.tools>=1,'2 🪵 1 🔨']],
   2:[[ch[i],'Chapel nearby'],[st.cigars>.5,'🚬 Cigars'],[st.wood>=3&&st.tools>=2,'3 🪵 2 🔨']],
   3:[[st.spices>.5,'🌶️ Spices'],[st.bricks>=4&&st.tools>=2,'4 🧱 2 🔨']]}[o.lvl];
  if(up)h+=`<p class="m" style="margin-top:8px">To become ${LV[o.lvl+1].n.toLowerCase()} when full:</p><p>${up.map(([a,b])=>`${mark(a)} ${b}`).join(' &nbsp;')}</p>`;
  h+=`<p class="m">Pays ${(L.tax*60*o.pop).toFixed(0)} 🪙 per minute in taxes.</p>`}
 else if(d.out){h+=`<p>Makes ${ICON[d.out]} ${d.out}${d.in?` from ${ICON[d.in]} ${d.in}`:''}</p><p>${o.st||'Starting up'}</p><progress max="${d.time}" value="${o.p}"></progress>`}
 else if(o.t==='tower'&&!L.y1857)h+=`<p>${S.pir?'Pirates are at sea.':'The coast is clear.'}</p>`;
 else if(d.sav&&L.y1857){const n=bankN(o),on=o.c&&!o.bld;h+=`<p>Reach: ${d.radius} tiles.</p>${on?`<p>${n?(n===1?'1 home saves here':`${n} homes save here`):'No homes within reach yet'}.</p>`:''}${n?`<p>Interest: <b>${bankInc(o).toFixed(0)} 🪙 per minute</b></p>`:''}<p class="m">A home that two banks reach saves half in each.</p>`}
 else if(d.radius)h+=COVK[o.t]?`<p>Reach: ${d.radius} tiles.</p>`:`<p>Reach: ${d.radius} tiles. Storage holds ${cap()} of each good.</p>`;
 if(o.t==='kontor'&&L.sea&&comp[i]!==S.mainComp){const ob=S.out[comp[i]]||{},e=Object.entries(ob).filter(x=>x[1]>=1);
  h+=`<p><b>Outpost store</b>: ${e.length?e.map(([g,v])=>`${ICON[g]} ${Math.floor(v)}`).join(' '):'empty'}</p><p class="m">${S.ships.length?'Your ships bring these home once 5 or more are waiting.':'Build a shipyard and a ship to bring these home.'}</p>`}
 if(o.t==='shipyard')h+=`<p>Your fleet: ${S.ships.length} of 3 ships</p>`;
 if(o.t==='kontor'&&!o.r){let b=0;for(let dy=-7;dy<=7;dy++)for(let dx=-7;dx<=7;dx++)if(inb(o.x+dx,o.y+dy))b|=fert[(o.y+dy)*W+o.x+dx];h+=`<p class="m">${b?`Land nearby grows: ${[b&1?'🍂 tobacco':'',b&2?'🌶️ spices':''].filter(Boolean).join(', ')}`:'No tobacco or spices grow nearby'}</p>`}
 if(o.t==='monument')h+=`<p>The pride of ${L.name}. It also lets nearby settlers become citizens.</p>`;
 if(d.lm)h+=`<p>Visitors bring <b>${d.tour*(o.real?2:1)} 🪙 per minute</b>${o.real?' (twice as many, since it stands near its real location)':'.'}</p>`;
 if(d.up)h+=`<p class="m">Upkeep: ${(d.up*60).toFixed(0)} 🪙 per minute</p>`;
 const sx=infoStatus(o),el=$('#infoBody');
 el.innerHTML=cz(`<h2>${bIco(o.t)} ${d.n}</h2><div class="stl"><span>${sx[0]}</span>${sx[1]?'<button id="stlGo" class="pri"></button>':''}</div>${chainCard(o.t)}<div class="chips">${infoChips(o).map(c=>`<span>${c}</span>`).join('')}</div><div id="infoActs"></div><details id="infoDet"${INFODET?' open':''}><summary>Details</summary><div id="infoDetB">${h}</div></details>`);
 const dt=$('#infoDetB');infoExtra(o,dt);if(sx[1]){const b=$('#stlGo');b.textContent=sx[1][0];b.onclick=sx[1][1]}$('#infoDet').ontoggle=e=>INFODET=e.target.open;
 for(const b of dt.querySelectorAll('#tierBtn,#renoBtn,#upgBtn'))$('#infoActs').appendChild(b);
 /* a home just built higher says so right under its name, not in the folded details */
 {const ok=dt.querySelector('.okUp');if(ok)el.querySelector('h2').after(ok)}}
/* the panel at a glance: one line with what matters most now and a button that fixes it, then a few numbers; the rest folds away */
let INFODET=false;
/* why a good is short when its works stand: more works use it than works make it (two works on one grain farm). Null when that is not it */
function lackWhy(g){const p=prodOf(g);if(!p||!B[p])return null;const m=cnt(p),u=S.list.filter(o=>!o.h&&B[o.t]&&B[o.t].in===g).length;if(!m||u<=m)return null;
 const n=B[p].n.toLowerCase();return{p,m,u,txt:`${u} works need ${g==='wood'?'timber':g}, and you have only ${m} ${m>1?n.replace(/y$/,'ie')+'s':n}`}}
function infoStatus(o){const d=B[o.t],st=S.stock,bl=k=>B[k]?[`${B[k].i} Build ${anA(B[k].n.toLowerCase())}`,()=>{closeInfo();lackGo(k)}]:null;
 /* a site short of a material says so, and its one button opens every way to more of it (lackShow: build its works, or buy) */
 if(o.wr)return[`🏚️ Wrecked by the ${o.wr===2?'fire':'flood'}. It stays a ruin until you rebuild it.`,[`🔨 Rebuild: ${money(rebuildCost(o),1)}`,()=>rebuild(o)]];
 if(o.bld&&roadAsk(o)&&!o.c)return[`🏗️ Under construction, ${Math.round(siteProg(o)*100)}%. ⚠️ No road reaches it yet.`,['🛤️ Build a road',()=>roadOffer(o)]];
 if(o.bld){const g=Object.keys(o.bld).find(g=>o.bld[g]>0&&st[g]<1),gn=g==='wood'?'timber':g;return[`🏗️ Under construction, ${Math.round(siteProg(o)*100)}%${g?`. ${ICON[g]||''} ${gn[0].toUpperCase()+gn.slice(1)} ${/s$/.test(gn)?'are':'is'} missing.`:''}`,g?[`${ICON[g]||''} How to get ${gn}`,()=>{if(!lackShow(g,`No ${gn} left`))lackTrade(g)}]:null]}
 if(roadAsk(o)&&!o.c)return['⚠️ No road reaches it',['🛤️ Build a road',()=>roadOffer(o)]];
 if(o.t==='house'){const m=houseNeeds(o).find(n=>!n[0]);if(m){const b=bl(m[2]);if(b&&B[m[2]].radius){const go=b[1];b[1]=()=>{FORH=o;go();FORH=null}}return[`⚠️ Needs ${m[1]}`,b]}const ns=nextStage(o);if(!ns)return['😊 All needs met',null];if(ns.ok)return[`⭐ Soon ${ns.to} live here`,null];
  /* the next stage: what the people of this home still ask for, first what the player can build or buy */
  const q=ns.rq.find(q=>!q[0]&&(q[2]||q[3]))||ns.rq.find(q=>!q[0]);let b=null;
  if(q[2]==='lm')b=['⭐ Show the landmarks',()=>{closeInfo();CAT='monuments';BARSIG='';buildBar();toast('⭐ Build a landmark near this home')}];
  else if(q[2]==='tier')b=null;
  else if(q[2]){b=bl(q[2]);if(b&&B[q[2]].radius){const go=b[1];b[1]=()=>{FORH=o;go();FORH=null}}}
  else if(q[3]){const g=q[3],gn=g==='wood'?'timber':g==='cloth'?'clothing':g;b=[`${ICON[g]||''} How to get ${gn}`,()=>{closeInfo();if(!lackShow(g,`No ${gn} left`))lackTrade(g)}]}
  return[`⭐ To become ${ns.to}: ${q[1]}`,b]}
 if(d.in&&st[d.in]<1){const p=prodOf(d.in),w=lackWhy(d.in);if(w)return[`⚠️ No ${ICON[d.in]||''} ${d.in}: ${w.txt}`,[`${B[w.p].i} Build one more ${B[w.p].n.toLowerCase()}`,()=>{closeInfo();lackGo(w.p)}]];return[`⚠️ No ${ICON[d.in]||''} ${d.in} to work with`,p&&p!==o.t?bl(p):PRICE[d.in]?[`⚖️ Buy ${d.in}`,()=>lackTrade(d.in)]:null]}
 if(o.t==='kraftwerk'&&(st.coal||0)<1)return['⚠️ Blackout: no coal',cnt('coalyard')?null:bl('coalyard')];
 if(o.t==='bahnhof'&&!stationOK(o))return['⚠️ No track touches the station',['🛤️ Lay track',()=>{closeInfo();setMode('rail')}]];
 if(UPG[o.t]&&(o.cond??1)<.4)return['⚠️ Run down: it reaches fewer homes',null];
 /* a bank with no savers in its reach earns nothing, and says so */
 if(d.sav&&L.y1857&&!(bankInc(o)>0))return[bankN(o)?'⚠️ The homes within reach are empty: it earns nothing yet':'⚠️ No homes within reach: it earns nothing',['🏠 Build homes',()=>{closeInfo();setMode('house');try{findSpot({x:o.x,y:o.y})}catch(e){}}]];
 /* short of hands (the 👷 over it): homes near it bring workers, and the button places one there */
 if(o.nw)return['👷 Not enough workers: build homes nearby',['🏠 Build homes',()=>{closeInfo();setMode('house');try{findSpot({x:o.x,y:o.y})}catch(e){}}]];
 /* working, but from the stores alone: nothing in the city makes what it works with (bought, or there from the start). The card says
    so, and its button leads to the works that makes it, before the stores run empty */
 if(d.in&&d.out&&!chainMakers(d.in).some(k=>cnt(k))){const p=prodOf(d.in);if(p&&p!==o.t&&B[p]){const lk=lockOf(p),n=chainNm(p,1),gn=d.in==='wood'?'timber':d.in,left=Math.floor(st[d.in]);
   return[left<30?`⚠️ Only ${left} ${gn} left, and you have no ${n}.`:`✅ Working with ${gn} from the stores.<br>⚠️ You have no ${n} yet.`,
    lk==='research'?[`🔬 Research the ${n}`,()=>{closeInfo();lackGo(p)}]:lk?(PRICE[d.in]?[`⚖️ Buy ${gn}`,()=>lackTrade(d.in)]:null):bl(p)]}}
 if(d.sav&&L.y1857){const n=bankN(o);return[n===1?'✅ 1 home saves here':`✅ ${n} homes save here`,null]}
 return[d.out?`✅ Working, next batch ${Math.round(Math.min(1,(o.p||0)/(d.time||1))*100)}%`:'✅ Working',null]}
function infoChips(o){const d=B[o.t],st=S.stock,c=[];
 if(o.t==='house'&&!o.bld){const hp=Math.round((o.hap??1)*100);c.push(`👥 ${o.pop} of ${maxPop(o)}`);if(LV[o.lvl]&&LV[o.lvl].tax)c.push(`🪙 ${money((LV[o.lvl].tax*60*o.pop).toFixed(0))}/min`);c.push(`${hp>=75?'😊':hp>=50?'😐':'😠'} ${hp}%`);c.push(o.lvl===6?'🏛️ Mansion':`⭐ Stage ${o.lvl} of 5`)}
 else if(d.out&&!o.bld){c.push(`${ICON[d.out]} ${Math.floor(st[d.out])} in store`);if(d.in)c.push(`${ICON[d.in]} ${Math.floor(st[d.in])} to use`)}
 if(d.lm&&!o.bld)c.push(`🎟️ ${money(d.tour*(o.real?2:1))}/min`);if(UPG[o.t]&&!o.bld)c.push(`🔧 ${Math.round((o.cond??1)*100)}%`);if(d.sav&&!o.bld&&o.c&&L.y1857){const v=bankInc(o);if(v>0)c.push(`🪙 ${money(v.toFixed(0))}/min`)}if(d.up)c.push(`− ${money((d.up*60).toFixed(0))}/min`);return c.slice(0,4)}

/* selling by itself: for each good the player may set how much to keep (half or a quarter of the stores, or none); the rest is sold */
const ASK=[0,.5,.25,.02];
$('#tradeRows').innerHTML=cz(GOODS.map(g=>`<div class="tr"><span>${ICON[g]} ${cap1(g)}</span><span data-s="${g}"></span>
 <div class="b"><button data-buy="${g}">Buy 5 for ${PRICE[g][0]*5} 🪙</button><button data-sell="${g}">Sell 5 for ${PRICE[g][1]*5} 🪙</button></div><button class="tra" data-as="${g}"></button></div>`).join(''));
$('#tradeRows').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const st=S.stock;
 if(b.dataset.buy){const g=b.dataset.buy,c=PRICE[g][0]*5;if(st.gold<c)return toast(`You cannot afford 5 ${g} (${money(c)})`);if(st[g]+5>cap())return toast('Your storage is full');st.gold-=c;st[g]+=5;sfx('coin')}
 if(b.dataset.as){const g=b.dataset.as,a=S.as||(S.as={}),i=(ASK.indexOf(a[g]||0)+1)%ASK.length;if(ASK[i])a[g]=ASK[i];else delete a[g];sfx('click');tradeFill();
  if(a[g])toast(`🔁 ${cap1(g)}: all above ${Math.round(cap()*a[g])} is sold by itself`);return}
 if(b.dataset.sell){const g=b.dataset.sell;if(st[g]<5)return toast(`You need 5 ${g} to sell`);st[g]-=5;st.gold+=PRICE[g][1]*5;sfx('coin')}
 updateUI();if(CONF)confUpdate()});
/* each time the trader opens: the loan and the prices in the money of the day (kronen in Vienna from 1892, as the treasury shows them),
   and no motor cars on offer before the motor car comes */
/* the loan button says where the loan stands: one to take, one being repaid, or one that can be paid off now (not straight after
   it was taken, so a second tap does not undo it) */
const loanPayable=ln=>S.stock.gold>=ln&&S.t-(S.loanAt||-1e9)>60;
function tradeFill(){if(!S)return;$('#autoBuy').checked=S.autoBuy!==false;const ln=Math.ceil(S.loan||0);
 $('#loanBtn').textContent=ln>0?(loanPayable(ln)?`🏦 Repay the loan now: ${money(ln,1)}`:`🏦 Loan: ${money(ln,1)} still to repay`):`🏦 City loan: ${money(5000,1)} now, repay ${money(ECO().loan[cnt('bank')?1:0],1)} over ${ECO().loanY} years`;
 for(const g of GOODS){const b=$(`#tradeRows [data-buy="${g}"]`),s=$(`#tradeRows [data-sell="${g}"]`);if(!b||!s)continue;for(const[e,t]of[[b,`Buy 5 for ${fmt(mn(PRICE[g][0]*5))} 🪙`],[s,`Sell 5 for ${fmt(mn(PRICE[g][1]*5))} 🪙`]])if(e.dataset.t!==t){e.dataset.t=t;e.innerHTML=cz(t)}
  {const e=$(`#tradeRows [data-as="${g}"]`),a=S.as&&S.as[g],k=a?Math.round(cap()*a):0,t=a?`🔁 Sells by itself: keeps ${k<2?'none':k}`:'🔁 Sell by itself: off';if(e&&e.dataset.t!==t){e.dataset.t=t;e.textContent=t;e.classList.toggle('on',!!a)}}
  const row=b.closest('.tr');if(row)row.style.display=g==='cars'&&!RES().lohner&&!(S.stock.cars>=1)?'none':''}}
$('#tradeBtn').onclick=()=>{tradeFill();const v=!$('#trade').hidden;setMode(null);$('#trade').hidden=v};
$('#tradeClose').onclick=$('#tradeX').onclick=()=>$('#trade').hidden=true;

function hint(){if(L.zones)return hint1900();const st=S.stock,p=popTotals(),tot=Ps(p,1);
 if(S.level==='venice'&&!cnt('woodcutter')&&S.stock.wood<30)return'Venice has little forest. Use a ship to settle the mainland for wood and ore';
 if(S.pir&&!cnt('tower'))return'Pirates are coming! Cannon towers near the shore can sink them';
 if(!cnt('woodcutter'))return'Start with a woodcutter beside the forest 🌲';
 const lone=S.list.find(o=>!o.r&&needsRoad(o)&&!o.c);if(lone)return`Lay a road from your ${B[lone.t].n.toLowerCase()} to the warehouse or a market`;
 if(!cnt('house'))return'Build a few houses along a road so settlers move in';
 if(!cnt('fisher'))return'Your people need food: build a fisher on the shore';
 if(st.food<1&&tot>0)return'Food has run out and people are leaving. Build another fisher';
 if(st.wood<4&&cnt('woodcutter')<2)return'Wood is low. A second woodcutter helps';
 if(!cnt('market')&&tot>=16)return'Build a market so full houses can become settlers';
 if(p[2]>0&&(!cnt('sheep')||!cnt('weaver')))return'Settlers wear cloth: build a sheep farm and a weaver';
 if(p[2]>0&&st.cloth<1)return'Cloth has run out. Add another sheep farm and weaver';
 if(st.tools<4&&!cnt('smith'))return'Tools are scarce: buy some, or build an ore mine and toolsmith';
 if(!cnt('brick')&&p[2]>=20)return'Chapels and towers need bricks: build a brickworks on the shore';
 if(!cnt('chapel')&&p[2]>=40)return'Build a chapel so settlers can become citizens';
 if(cnt('chapel')&&!cnt('tobacconist'))return'Citizens want cigars: grow tobacco and build a tobacconist';
 if(tot>=L.goal&&!cnt('monument'))return`Build the ${L.mon.n} to complete ${L.name}`;
 {const e=(L.landmarks||[]).find(e=>lmNeedOK(e)&&!cnt(e.k));if(e&&S.t%40<20)return`${B[e.k].i} ${B[e.k].n} is unlocked. Build it near its 📍 real location for twice the visitors`}
 if(L.sea&&p[3]>=30&&!cnt('shipyard'))return'Build a shipyard on the shore. Ships let you settle other islands';
 if(p[3]>=40&&!cnt('spice'))return L.spiceHint;
 if(L.sea&&!cnt('tower')&&S.t>300)return'Pirates roam these waters. A cannon tower by the warehouse is wise';
 if(S.rate<0)return'You are losing gold. Grow your town or sell surplus goods';
 if(tot>=Math.ceil(L.goal*.4)&&!cnt('monument'))return`The ${L.mon.n} is unlocked. Build it before you reach ${L.goal} residents`;
 return`Grow ${L.name} to ${L.goal} residents and build the ${L.mon.n}`}

let RESN=-1;
function resAvail(){if(!S)return[];const y=Math.floor(Y0+S.t/YEAR),r=RES();return S.rs?[]:TECH.filter(t=>!r[t[0]]&&y>=t[3]&&(S.rfree>0||(S.stock.gold||0)>=rsCost(t)))}
/* the red counts: on Research, what can be researched now; on the City tab, that and the laws that can be enacted now */
function lawsAvail(){if(!S)return 0;const y=Math.floor(Y0+S.t/YEAR),l=LAW();return LAWS.filter(([k,n,yr,c])=>!l[k]&&y>=yr&&S.stock.gold>=c).length}
/* a red count on a button, gone at zero */
function dot(el,n){if(!el)return;let d=el.querySelector('.rdot');if(!n){if(d)d.remove();return}if(!d){d=document.createElement('b');d.className='rdot';el.appendChild(d)}d.textContent=n}
/* and on Cases, the cases that can be taken now. The City tab counts only what a button it opens shows, so its number is always
   found inside */
function resBadge(){const b=$('#resBtn');if(!b)return;const sh=id=>!$('#'+id).hidden,n=sh('resBtn')?resAvail().length:0,l=sh('hallBtn')?lawsAvail():0,cn=S.case||!sh('caseBtn')?0:caseOpen().length;if(n*1e4+l*100+cn===RESN)return;RESN=n*1e4+l*100+cn;
 b.innerHTML=`🔬 Research${n?` <span class="rdot">${n}</span>`:''}`;b.classList.toggle('glow',n>0);dot($('#hallBtn'),l);dot($('#caseBtn'),cn);const t=$('#tCity');t.classList.toggle('glow',n+l+cn>0);dot(t,n+l+cn)}
function updateUI(){if(!S)return;tutTick();resBadge();if(mode&&!pend)moreUI();const st=S.stock,p=popTotals(),tot=Ps(p,1),c=cap();
 const r=Math.round(runNet());
 let h=S.pir?'<span class="chip alert">🏴‍☠️ Pirates!</span>':'';
 if(L.zones)h+=`<span class="chip${S.war?' alert':''}">${S.war?'⚔️':'📅'} ${dateStr(S.t)}</span>`;
 h+=`<span class="chip">${L.y1857?'🪙 $':'🪙'} ${fmt(st.gold)} <small class="${r>=0?'pos':'neg'}">${r>=0?'+':''}${r}/min</small></span>`+(L.zones?`<span class="chip">👥 ${fmtPop(dispPop())}</span>`:`<span class="chip">👥 ${tot} <small>/ ${L.goal}</small></span>`);
 if(S.rv)h+=`<span class="chip">🚩 Rival ${rivalPop()}</span>`;
 const needed={food:tot>0,wine:Ps(p,4)>0,beer:Ps(p,2)>0,bricks:1,wood:1,stone:1};if(L.y1857)h+=`<span class="chip">👑 ${S.prest||0} vs 🌆 ${bpScore()}</span><span class="chip${(S.hap??1)<.5?' alert':''}">${(S.hap??1)>=.75?'😊':(S.hap??1)>=.5?'😐':'😠'} ${Math.round((S.hap??1)*100)}%</span>${S.loan>0?`<span class="chip">🏦 −${fmt(S.loan)}</span>`:''}${S.strike>S.t?`<span class="chip alert">✊ Strike until ${dateStr(S.strike)}</span>`:''}${S.newc>=1?`<span class="chip alert">🧳 ${fmtPop(Math.round(S.newc*(S.mult||1)/100)*100)} without homes</span>`:''}${S.epi?`<span class="chip alert">🦠 ${S.epi.n}: ${fmtPop(Math.round(S.epi.dead*(S.mult||1)/100)*100)} dead</span>`:''}`;
 for(const g of GOODS)h+=`<span class="chip${st[g]<1&&needed[g]?' low':''}">${ICON[g]} ${Math.floor(st[g])}<small>/${c}</small></span>`;
 /* the two rows at the top are drawn again only when they change, and never while a finger is on them: a chip that is replaced under the finger loses its tap */
 if(!topHeld()){const rh=L.y1857?topBar():h;if(rh!==RSIG){RSIG=rh;const el=$('#res');el.innerHTML=rh;if(L.y1857)resFit(el)}
  if(L.y1857){let sh=storesStrip();if(sh!==STSIG){const el=$('#stores');el.innerHTML=sh;el.classList.toggle('open',STOPEN);if(storesFit(el))el.innerHTML=sh=storesStrip();STSIG=sh}}}
 rsBar();uiTick();goalsUI();drawMini();
 document.querySelectorAll('.bb').forEach(b=>{const k=b.dataset.k,e=B[k].lm&&lmEntry(k),lock=e&&!lmNeedOK(e),done=e&&cnt(k);b.classList.toggle('no',lock||done||!canAfford(k));
  if(e){const c=b.querySelector('.c'),txt=done?'✓ Built':lock?`🔒 ${lmNeedTxt(e)}`:costStr(B[k].cost);if(c.textContent!==txt)c.textContent=txt}});
 if(sel&&performance.now()>INFOHOLD)renderInfo();
 if(!$('#trade').hidden)document.querySelectorAll('[data-s]').forEach(el=>el.textContent=`${Math.floor(st[el.dataset.s])} in store`)}

/* ---------- sound ---------- */
let AC=null,NB=null,muted=false;const lastS={};
function ac(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate;NB=AC.createBuffer(1,n/2|0,n);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 if(AC.state==='suspended')AC.resume()}catch(e){}}
document.addEventListener('pointerdown',ac);
function tone(f,t0,dur,type,vol,f2){const a=AC,t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.02)}
function hiss(t0,dur,freq,vol){const a=AC,t=a.currentTime+t0,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;f.type='lowpass';f.frequency.value=freq;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(a.destination);s.start(t);s.stop(t+dur)}
function sfx(k){if(muted||!AC||AC.state!=='running')return;const now=performance.now();if(now-(lastS[k]||0)<({boom:250,chime:1500,coin:250,horn:1200,alarm:2000}[k]||100))return;lastS[k]=now;
 try{switch(k){case'build':tone(200,0,.15,'triangle',.2,70);hiss(0,.08,900,.12);break;
  case'chime':[523,659,784].forEach((f,i)=>tone(f,i*.09,.35,'sine',.09));break;
  case'coin':tone(988,0,.08,'square',.04);tone(1319,.07,.2,'square',.04);break;
  case'boom':hiss(0,.45,420,.35);tone(90,0,.3,'sine',.22,40);break;
  case'alarm':for(let i=0;i<3;i++){tone(660,i*.3,.14,'square',.05);tone(440,i*.3+.15,.14,'square',.05)}break;
  case'horn':tone(110,0,.7,'sawtooth',.05,100);tone(165,0,.7,'sine',.06);break;
  case'click':tone(1400,0,.03,'square',.025);break}}catch(e){}}
$('#soundBtn').onclick=()=>{muted=!muted;$('#soundBtn').textContent=muted?'🔇 Muted':'🔊 Sound';ac()};

/* ---------- minimap ---------- */
const mini=$('#mini');let mctx=mini.getContext('2d');const MS=150/(W+H),MW=(W+H)*MS,MH=(W+H)*MS/2,MOX=H*MS;
function sizeMini(){const d=window.devicePixelRatio||1;mini.width=MW*d;mini.height=MH*d;mini.style.width=MW+'px';mini.style.height=MH+'px';mctx.setTransform(d,0,0,d,0,0)}
const MC={1:'#dfc68a',2:'#86a94e',3:'#4f7a35',4:'#9a8f78',5:'#a39582'};
const mB=document.createElement('canvas');let mGV=-1;
const MC1={0:[29,85,119],1:[223,198,138],2:[134,169,78],3:[78,120,52],4:[154,143,120],5:[163,149,130]};
function drawMini(){if(!S)return;
 if(mGV!==GV){mGV=GV;const w=Math.round(MW*2),h=Math.round(MH*2);mB.width=w;mB.height=h;const c=mB.getContext('2d'),img=c.createImageData(w,h),dt=img.data,ms=MS*2,mox=MOX*2;
  for(let py=0;py<h;py++)for(let px=0;px<w;px++){const a=(px-mox)/ms,b=py/(ms/2),x=Math.floor((a+b)/2),y=Math.floor((b-a)/2),k=(py*w+px)*4;
   if(!inb(x,y)){dt[k+3]=0;continue}const i=y*W+x,t=S.tiles[i],o=S.b[i];let col;
   if(o)col=o.t==='road'?[200,190,172]:o.h?(o.t==='house'?[206,178,140]:[240,232,214]):[250,226,150];else if(t===WATER)col=seaM[i]?[29,85,119]:[59,143,180];else if(DECO[i]===FIELD)col=[196,184,112];else if(DECO[i]===RAIL)col=[110,100,88];else col=MC1[t];
   const dm=L.zones&&!area[i]?.62:1;dt[k]=col[0]*dm;dt[k+1]=col[1]*dm;dt[k+2]=col[2]*dm;dt[k+3]=255}
  c.putImageData(img,0,0)}
 mctx.clearRect(0,0,MW,MH);mctx.drawImage(mB,0,0,MW,MH);
 const dot=(x,y,c)=>{mctx.fillStyle=c;mctx.beginPath();mctx.arc(MOX+(x-y)*MS+MS*.5,(x+y)*MS/2+MS*.5,2.4,0,7);mctx.fill()};
 for(const sh of S.ships){const p=shipPos(sh);dot(p.x,p.y,'#fff')}
 if(S.pir){const p=pirPos();dot(p.x,p.y,'#e0403a')}
 const k=MS/(TW/2*Z);mctx.strokeStyle='rgba(255,255,255,.9)';mctx.lineWidth=1;if(ROT===0)mctx.strokeRect(MOX+(0-cam.x)*k,(0-cam.y)*k/2,vw*k,vh*k/2);else{const c=pick(vw/2,vh/2);mctx.beginPath();mctx.arc(MOX+(c.x-c.y)*MS,(c.x+c.y)*MS/4,4,0,7);mctx.stroke()}}
function miniJump(e){const a=(e.offsetX-MOX)/MS,b=e.offsetY*4/MS;centerOn((a+b)/2,(b-a)/2);gGV=-1;drawMini()}
let miniDown=false;
mini.addEventListener('pointerdown',e=>{miniDown=true;mini.setPointerCapture(e.pointerId);miniJump(e)});
mini.addEventListener('pointermove',e=>{if(miniDown)miniJump(e)});
mini.addEventListener('pointerup',()=>miniDown=false);mini.addEventListener('pointercancel',()=>miniDown=false);

/* ---------- statistics ---------- */
function showStats(){const p=popTotals(),tot=Ps(p,1),st=S.stock;
 const made={},used={};GOODS.forEach(g=>{made[g]=0;used[g]=0});
 for(const o of S.list){if(o.r)continue;const d=B[o.t];if(!d.out||!(o.st||'').startsWith('Working'))continue;const m=(o.st.match(/\d+/)?+o.st.match(/\d+/)[0]/100:1)*60/d.time;made[d.out]+=m;if(d.in)used[d.in]+=m}
 used.food+=tot*.008*60;used.cloth+=(Ps(p,2))*.004*60;used.cigars+=(Ps(p,4))*.004*60;used.spices+=p[4]*.004*60;
 const rows=GOODS.filter(g=>made[g]||used[g]).map(g=>`<tr><td>${ICON[g]} ${cap1(g)}</td><td>${made[g].toFixed(1)}</td><td class="${used[g]>made[g]+.05?'no2':''}">${used[g].toFixed(1)}</td></tr>`).join('');
 const h=S.stats.hist.concat([[Math.round(S.t),tot,rivalPop()]]),mx=Math.max(50,...h.map(r=>Math.max(r[1],r[2]))),tm=Math.max(60,h[h.length-1][0]);
 const line=k=>h.map(r=>`${(r[0]/tm*300).toFixed(1)},${(110-r[k]/mx*100).toFixed(1)}`).join(' ');
 const mins=Math.floor(S.t/60);
 /* New York and Vienna: the people by class as the top bar counts them (the historic city, the player's homes, those without one),
    and the money as the finance card has it; the rest is the island game's */
 const hc=!!L.y1857,mu=S.mult||1,r=mn(Math.round(runNet()));
 ov(`<h2>${L.name}</h2><p class="m">${hc?dateStr(S.t):`${mins} minutes since landing`}</p>
 ${hc?`<table class="stat">${[1,2,3,4,5,6].filter(k=>p[k]>0).map(k=>`<tr><td>${LV[k].n}</td><td>${fmtPop(p[k]*mu)}</td></tr>`).join('')}${histPop()>0?`<tr><td>In the historic city</td><td>${fmtPop(histPop()*mu)}</td></tr>`:''}${S.newc>=1?`<tr><td>Without a home</td><td>${fmtPop(S.newc*mu)}</td></tr>`:''}<tr><td><b>Total</b></td><td><b>${fmtPop(dispPop())}</b></td></tr></table>
 <h2 style="margin-top:14px">Money per minute</h2>
 <table class="stat"><tr><td>Taxes</td><td class="ok">+${money(Math.round(S.tax||0),1)}</td></tr><tr><td>Upkeep</td><td class="no2">−${money(Math.round(S.up||0),1)}</td></tr>${S.bkI?`<tr><td>Bank interest</td><td class="ok">+${money(Math.round(S.bkI),1)}</td></tr>`:''}${S.tour-(S.bkI||0)>=.5?`<tr><td>Visitors to landmarks</td><td class="ok">+${money(Math.round(S.tour-(S.bkI||0)),1)}</td></tr>`:''}<tr><td><b>Net</b></td><td><b>${r>=0?'+':''}${fmt(r)} ${CUR()}</b></td></tr></table>`:
 `<table class="stat"><tr><td>🌾 Pioneers</td><td>${p[1]}</td></tr><tr><td>🏡 Settlers</td><td>${p[2]}</td></tr><tr><td>🏛️ Citizens</td><td>${p[3]}</td></tr><tr><td>💼 Merchants</td><td>${p[4]}</td></tr><tr><td><b>Total</b></td><td><b>${tot} of ${L.goal}</b></td></tr></table>
 <h2 style="margin-top:14px">Gold per minute</h2>
 <table class="stat"><tr><td>Taxes</td><td class="ok">+${Math.round(S.tax)}</td></tr><tr><td>Upkeep</td><td class="no2">−${Math.round(S.up)}</td></tr>${S.bkI?`<tr><td>Bank interest</td><td class="ok">+${Math.round(S.bkI)}</td></tr>`:''}${S.tour-(S.bkI||0)>=.5?`<tr><td>Visitors to landmarks</td><td class="ok">+${Math.round(S.tour-(S.bkI||0))}</td></tr>`:''}<tr><td><b>Net</b></td><td><b>${Math.round(S.rate)}</b></td></tr></table>`}
 <h2 style="margin-top:14px">Goods per minute</h2>
 ${rows?`<table class="stat"><tr><td class="m">Good</td><td class="m">Made</td><td class="m">Used</td></tr>${rows}</table>`:'<p class="m">Nothing is being made yet.</p>'}
 <h2 style="margin-top:14px">${L.zones?'Your growth':`The race to ${L.goal}`}</h2>
 <svg viewBox="0 0 300 115" width="100%" role="img" aria-label="Population over time, you and the rival"><line x1="0" y1="110" x2="300" y2="110" stroke="currentColor" opacity=".25"/>
 <polyline fill="none" stroke="#3b7dd8" stroke-width="2" points="${line(2)}"/><polyline fill="none" stroke="var(--brass)" stroke-width="2.5" points="${line(1)}"/></svg>
 <div class="legend"><span><i style="background:var(--brass)"></i>You ${hc?fmtPop(tot*mu):tot}</span>${L.rival?`<span><i style="background:#3b7dd8"></i>${L.rival.n} ${rivalPop()}</span>`:''}</div>
 ${hc?'':`<table class="stat" style="margin-top:12px"><tr><td>⛵ Ships</td><td>${S.ships.length}</td></tr><tr><td>⚓ Warehouses</td><td>${cnt('kontor')}</td></tr><tr><td>${L.mon.i} ${L.mon.n}</td><td>${cnt('monument')?'Built':'Not yet'}</td></tr><tr><td>🏴‍☠️ Pirates sunk</td><td>${S.stats.sunk}</td></tr><tr><td>🔥 Raids suffered</td><td>${S.stats.raids}</td></tr></table>`}
 ${S.news&&S.news.length?`<h2 style="margin-top:14px">📰 In the papers</h2>${S.news.slice(-12).reverse().map(([t,m])=>`<p class="m" style="margin:4px 0"><b>${dateStr(t)}</b> · ${m}</p>`).join('')}`:''}
 <div class="btns"><button class="pri" id="ovOk">Back to the city</button></div>`);$('#ovOk').onclick=closeOv}
/* ---------- how goods are made: every chain from field to shop, how many of one work keep the next busy, how many people one
   feeds, and what the city has against what its works need (opened from the Emperor's desk) ---------- */
const chainMakers=g=>Object.keys(B).filter(k=>B[k].out===g&&!B[k].lm);
const chainUsers=g=>Object.keys(B).filter(k=>B[k].in===g&&!B[k].lm);
/* every good some work makes, the city's daily needs first, then what is built with */
const chainGoods=()=>{const o=['food','bread','meat','beer','wine','coffee','cloth','furniture','porcelain','cigars','spices','tools','cars','bricks','wood','stone','iron','coal'],all=new Set(Object.keys(B).filter(k=>!B[k].lm).map(k=>B[k].out).filter(Boolean));return[...o.filter(g=>all.has(g)),...[...all].filter(g=>!o.includes(g))]};
/* a work's name in a sentence, one or many: small, except Vienna's German nouns */
function chainNm(k,n){let s=B[k].n;if(!/haus|heurig|garten/i.test(s))s=s.replace(/\b(?!Danube\b)[A-Z]/g,c=>c.toLowerCase());if(n===1||/s$/.test(s))return s;return/[^aeiou]y$/.test(s)?s.slice(0,-1)+'ies':s+'s'}
/* how many makers keep how many users busy, in small whole numbers */
function chainRatio(p,c){const need=B[p].time/B[c].time;for(let b=1;b<=6;b++){const a=Math.round(need*b);if(a>=1&&Math.abs(a/b-need)<=.04)return[a,b]}return[Math.max(1,Math.round(need*4)),4]}
/* what each input good's users need of its makers, against what the city has */
function chainNeeds(){const out=[];for(const g of chainGoods()){const us=chainUsers(g),mk=chainMakers(g)[0];if(!mk||!us.length)continue;let need=0;const by=[];
  for(const u of us){const n=cnt(u);if(!n)continue;need+=n*B[mk].time/B[u].time;by.push(`${n} ${chainNm(u,n)}`)}if(!by.length)continue;
  const want=Math.max(1,Math.ceil(need-.05)),have=chainMakers(g).reduce((a,k)=>a+cnt(k),0);out.push({g,mk,want,have,by,need})}return out}
/* the goods at the end of a chain: not made into anything else, or wanted for building */
function chainEnds(){const usedIn=new Set(Object.keys(B).map(k=>B[k].in).filter(Boolean)),mats=new Set(Object.keys(B).flatMap(k=>Object.keys(B[k].cost||{})));
 return{mats,ends:chainGoods().filter(g=>!usedIn.has(g)||mats.has(g))}}
/* a good's chain as stages from field to shop: each stage the works that can do it (one, or a choice of several), and how many of each
   stage keep the last one busy, in the smallest whole numbers that feed it well enough (80% to 150% of what it uses) */
function chainOf(g){const lock=k=>{const l=lockOf(k);return l&&l!=='built'?l:''},mk=chainMakers(g).sort((a,b)=>!!lock(a)-!!lock(b)),st=[mk];
 if(mk.length===1){let k=mk[0];while(B[k].in){const p=chainMakers(B[k].in);if(!p.length||st.some(q=>q.includes(p[0])))break;st.unshift(p);k=p[0]}}
 const n=st.map(()=>1);for(let i=st.length-2;i>=0;i--){const need=B[st[i][0]].time/B[st[i+1][0]].time;
  const r=[[1,1],[1,2],[2,1],[2,3],[3,2],[1,3],[3,1]].find(([x,y])=>x/y/need>=.8&&x/y/need<=1.5)||[Math.max(1,Math.round(need)),1];n[i]=n[i+1]*r[0]/r[1]}
 const m=[1,2,3,4,6].find(m=>n.every(v=>Math.abs(v*m-Math.round(v*m))<.01))||1;return{st,lock,n:n.map(v=>Math.max(1,Math.round(v*m)))}}
/* a works is called too few only where the chain is really held up: its own good is not piling up in the store, and it is not
   itself waiting for the good before it (then the works before it is the one to add to). With enough works by the numbers, it is
   still one short when its good is gone and so is the good at the chain's end */
/* the chain drawn as one card, a line for each works from top to bottom: how many of each, an arrow down to the next, the good at the end; beside each works what the city
   has of it (none yet, too few, or how many). A works that feeds another chain too (the grain farm: mill and brewery) says so, and
   is counted against what all its users need. me: the works whose card this is on, marked. Also says what to build next, if anything */
function chainStrip(g,nd,me){const c=chainOf(g),L_=c.st.length,multi=L_>1;let want=null,lowW=null,lk='';
 const tiles=c.st.map((q,i)=>{const have=q.reduce((a,k)=>a+cnt(k),0),nx=i<L_-1?c.st[i+1].reduce((a,k)=>a+cnt(k),0):0,d0=B[q[0]],sh=nd&&i<L_-1&&nd.find(r=>r.g===d0.out),oth=sh?chainUsers(d0.out).filter(u=>cnt(u)&&!c.st[i+1].includes(u)):[],wantN=oth.length?sh.want:Math.ceil(nx*c.n[i]/(c.n[i+1]||1)-.01),also=oth.length?`<br>Also feeds ${oth.map(u=>'the '+chainNm(u,1)).join(' and ')}`:'',full=(S.stock[d0.out]||0)>=5,dry=!!d0.in&&(S.stock[d0.in]||0)<2,low=!!(have&&!full&&!dry&&(have<wantN||(S.stock[d0.out]||0)<1&&(S.stock[B[c.st[L_-1][0]].out]||0)<5));
  if(!have){const k=q.find(k=>!c.lock(k));if(k){if(!want)want=k}else if(!lk)lk=c.lock(q[0])}else if(low&&!lowW)lowW=q[0];
  return q.map((k,j)=>{const h=cnt(k),lo=low&&!j;return`<span class="ct${k===me?' me':''}${!h?' none':lo?' low':''}"><b>${multi?c.n[i]+'× ':''}${B[k].i} ${B[k].n}</b><small>${!h&&c.lock(k)?'🔒 Later':!h?'None yet':lo?(have<wantN?`You have ${have}, need ${wantN}`:`You have ${have}, need 1 more`):`You have ${h}`}${h&&!j?also:''}</small></span>`}).join('<i class="cor">or</i>')}).join('<i class="ca">↓</i>');
 return{html:`<div class="chst">${tiles}<span class="ce">${ICON[g]||''} ${cap1(g==='wood'?'timber':g)}</span></div>`,want:want||lowW,lk,any:c.st.some(q=>q.some(k=>cnt(k)))}}
/* on a works' card: the chains it is part of, from the first works to the good in the shops (not for a works that stands alone) */
function chainCard(k){const d=B[k];if(!d||d.lm||!d.out||typeof S==='undefined'||!S)return'';const nd=chainNeeds();
 return chainEnds().ends.filter(g=>{const c=chainOf(g);return c.st.length>1&&c.st.some(q=>q.includes(k))}).slice(0,3).map(g=>chainStrip(g,nd,k).html).join('')}
/* how goods are made: one card for each good the city makes, its name with its state at the right (enough, short), the chain as tiles,
   and where something is short or missing the choices: build the works it lacks, or buy the good. The goods not made yet (or locked)
   are folded away under one line */
function showChains(){const{ends}=chainEnds(),nd=chainNeeds(),str={};for(const g of ends)str[g]=chainStrip(g,nd);
 const row=(g,later)=>{const s=str[g],want=later&&s.lk?null:s.want,chip=later?(s.lk?'<span class="chs lk">🔒 Later</span>':'<span class="chs no">Not made yet</span>'):want?'<span class="chs short">⚠️ Short</span>':'<span class="chs ok">✅ Enough</span>';
  const buy=want&&GOODS.includes(g)&&PRICE[g];
  const acts=want?`<div class="cha"><button class="pri" data-cb="${want}">${B[want].i} Build ${anA(chainNm(want,1))}</button>${buy?`<button data-cbuy="${g}">⚖️ Buy ${g==='wood'?'timber':g}</button>`:''}</div>`:'';
  return`<div class="chn${later?' lk':''}"><h3><span>${ICON[g]||''} ${cap1(g==='wood'?'timber':g)}</span>${chip}</h3>${s.html}${later&&s.lk?`<p class="m">${s.lk==='research'?'Needs research first.':`Opens ${s.lk}.`}</p>`:''}${acts}</div>`};
 const made=ends.filter(g=>str[g].any),rest=ends.filter(g=>!str[g].any),bm=g=>/^(bricks|wood|stone|iron)$/.test(g),ppl=made.filter(g=>!bm(g)),bld=made.filter(bm);
 ov(`<h2>🏭 How goods are made</h2><p class="m">Each card is one chain: the works from top to bottom, and the good at the end. The numbers say how many works fit together: 1× grain farm keeps 1× mill busy. A works that feeds two chains must be built for each.</p>
 ${made.length?'':'<p class="m">Your city makes no goods yet.</p>'}
 ${ppl.length?`<h4 class="chG">For your people</h4>${ppl.map(g=>row(g)).join('')}`:''}
 ${bld.length?`<h4 class="chG">For building</h4>${bld.map(g=>row(g)).join('')}`:''}
 ${rest.length?`<details class="chMore"><summary>More goods (${rest.length})</summary>${rest.map(g=>row(g,true)).join('')}</details>`:''}
 <div class="btns"><button class="pri" id="ovOk">Close</button></div>`);$('#ovOk').onclick=closeOv;
 document.querySelectorAll('#ovCard [data-cb]').forEach(b=>b.onclick=()=>{closeOv();lackGo(b.dataset.cb)});
 document.querySelectorAll('#ovCard [data-cbuy]').forEach(b=>b.onclick=()=>{closeOv();lackTrade(b.dataset.cbuy)})}
$('#statsBtn').onclick=()=>{setMode(null);showStats();addJump()};
/* fast-forward for testing later eras: decisions are taken with the first option */
function addJump(){const c=$('#ovCard');if(!c||!S)return;const y=Math.floor(Y0+S.t/YEAR),ys=[1870,1875,1880,1885,1890,1895,1900,1905,1910].filter(v=>v>y).slice(0,5);if(!ys.length)return;
 const d=document.createElement('div');d.innerHTML=`<h3 style="margin:10px 0 4px">⏩ Jump ahead</h3><p class="m">Let time run fast to a later year. Events and decisions on the way are taken for you with the first option.</p><div style="display:flex;flex-wrap:wrap;gap:6px">${ys.map(v=>`<button data-jy="${v}">${v}</button>`).join('')}</div>`;
 const b=c.querySelector('.btns');c.insertBefore(d,b);d.querySelectorAll('[data-jy]').forEach(x=>x.onclick=()=>jumpYear(+x.dataset.jy))}
let JUMPING=false;
async function jumpYear(year){if(JUMPING)return;JUMPING=true;closeOv();const target=yT(year,1),log=[];let g=0;
 try{while(S.t<target&&!S.won&&!S.lost&&g++<400000){sim(.5);if(!$('#ov').hidden){const h=document.querySelector('#ovCard h2,#ovCard h1');if(h)log.push(h.textContent);const c=document.querySelector('#ovCard [data-c="0"]');if(c)c.click();else{const o=$('#ovOk');if(o)o.click();else closeOv()}}
  if(g%500===0){updateUI();await new Promise(r=>setTimeout(r,0))}}}finally{JUMPING=false}
 GV++;recompute();save();if(!S.won&&!S.lost)evOv(`⏩ ${dateStr(S.t)}`,`Time flew. ${log.length} events and decisions happened on the way, each answered with the first option.${log.length?`<br><br><span class="m">${log.slice(-14).join(' · ')}</span>`:''}`)}
$('#resBtn').onclick=()=>{setMode(null);showResearch()};
$('#hallBtn').onclick=()=>{setMode(null);showCityHall()};
$('#caseBtn').onclick=()=>{setMode(null);showCases()};
$('#albumBtn').onclick=()=>{setMode(null);showAlbum()};
$('#loanBtn').onclick=()=>{const b=$('#loanBtn'),ln=Math.ceil(S.loan||0);
 if(ln>0){if(loanPayable(ln)){S.stock.gold-=ln;S.loan=0;sfx('coin');toast('🏦 The loan is repaid')}else toast(`🏦 ${money(ln,1)} still to repay: it comes out of the treasury by itself`);tradeFill();return}
 S.stock.gold+=5000;S.loan=ECO().loan[cnt('bank')?1:0];S.loanAt=S.t;sfx('coin');try{updateUI()}catch(e){}toast(`🏦 City loan: +${money(5000,1)} now, ${money(S.loan,1)} repaid over ${ECO().loanY===10?'ten':'five'} years`);tradeFill();b.classList.add('hl');setTimeout(()=>b.classList.remove('hl'),1800)};

/* ---------- overlays ---------- */
function ov(html){$('#ovCard').innerHTML=cz(html);LASTACT=performance.now();{const c=$('#ovCard'),b=c.querySelector('#ovOk')||[...c.querySelectorAll('button')].find(b=>b.textContent.trim()==='Close');if(b){b.onclick=closeOv;c.insertAdjacentHTML('afterbegin','<button class="x" aria-label="Close">✕</button>');c.firstChild.onclick=()=>b.click()}}$('#ov').classList.toggle('held',!window.event&&placing());$('#ov').hidden=false}
/* a card closed: the next one waits a minute (letGo), so the city can be played between them */
function closeOv(){EVNEXT=performance.now()+20000;CARDGAP=performance.now()+4000;ATT=Math.max(ATT,performance.now()+60000);if(S&&TUTI<0&&S.t<yT(1865,6)&&!S.tutSeen&&!INTROP){S.tutSeen=1;setTimeout(tutStart,300)}$('#ov').hidden=true}
const HELP=`<ul class="help">
<li><b>Goal:</b> grow New York from 1865 to 1916 and outshine Chicago. Your prestige 👑 against Chicago's decides the ending.</li>
<li><b>Homes:</b> sell building lots near a market. Builders pay you, then need bricks and timber. Homes grow through five classes, from labourers to the well-to-do; Fifth Avenue lots bring the Four Hundred. Tap a home to see what it needs to grow.</li>
<li><b>🏗️ Build higher:</b> tap a home and raise it: six-storey walk-ups from the start, elevator apartment houses from 1880, apartment skyscrapers after you research steel frames. Each step houses far more people on the same lot.</li>
<li><b>🚢 Immigrants:</b> liners land newcomers at Castle Garden, from 1892 at Ellis Island. Without homes they eat into the food rations, make the city unhappy and raise the risk of epidemics.</li>
<li><b>Goods:</b> lumber yards, brickyards and stone wharves on the waterfront; farms, breweries and textile mills; wine merchants for the rich. Everything needs a road to a market. Red bubbles on the map show missing goods.</li>
<li><b>Roads & rail:</b> tap a start, tap an end, then ✓ Build. Railways, stations and horsecar lines too.</li>
<li><b>City Hall:</b> requests from Olmsted, Roebling, Edison, Riis and Roosevelt, laws, and corruption: Tammany Hall is always tempting.</li>
<li><b>🔬 Research:</b> from the Board of Health to electric power and steel frames. The button glows when a discovery is ready.</li>
<li><b>Crises:</b> cholera, fires, blizzards, panics. Hospitals, fire stations and clean water save lives and money.</li>
<li><b>Monuments:</b> Central Park, St. Patrick's, the Brooklyn Bridge, the Statue of Liberty, Carnegie Hall, the great skyscrapers.</li></ul>`;
const W_HELP=`<ul class="help">
<li><b>Goal:</b> you are Emperor Franz Joseph, from 1865 to 1916, with Empress Sissi at your side. Fill the new Ringstraße and outshine Budapest: your prestige 👑 against Budapest's decides the ending.</li>
<li><b>Homes:</b> sell Zinshaus plots near a market. Builders pay you, then need bricks and timber. Homes grow from labourers to Bürger; palais plots facing the Ring bring the nobility. Tap a home to see what it needs to grow.</li>
<li><b>🏗️ Build higher:</b> tap a home and add storeys, as the Gründerzeit did from the 1870s on.</li>
<li><b>Goods:</b> timber and stone from the Danube wharves, bricks from the Wienerberg, farms, breweries, Heurigen and textile mills. Everything needs a road to a market. Red bubbles on the map show missing goods.</li>
<li><b>Roads & rail:</b> tap a start, tap an end, then ✓ Build. Railways, stations and tram lines too.</li>
<li><b>👑 Hofburg:</b> requests from the mayors, Ferstel, Hansen, Strauss, Otto Wagner and the Empress, laws, and audience days for your petitioners.</li>
<li><b>🔬 Research:</b> from Semmelweis's hygiene to Auer's gas mantle, electric power and Landsteiner's blood groups.</li>
<li><b>Money:</b> gulden (fl.) until 1892, then kronen (Kr.), two to the gulden.</li>
<li><b>Crises:</b> Königgrätz, the crash of 1873, cholera, the Ringtheater fire. Hospitals, fire stations and clean water save lives and money.</li>
<li><b>Monuments:</b> the Court Opera, the Votivkirche, the Rathaus, the Parliament, the University, the Burgtheater, the Danube regulation and the Riesenrad.</li></ul>`;
function showHelp(){ov(`<h2>How to play</h2>${NYC()?HELP:W_HELP}<div class="btns"><button class="pri" id="ovOk">Back to the city</button></div>`);$('#ovOk').onclick=closeOv}
function showWin(){save();setProgress(S.level);ov(`<h1>${L.name} thrives</h1><p>${L.goal} people live in your city and the ${L.mon.n} towers over it. Level complete!</p><div class="btns"><button class="pri" id="ovOk">Keep building</button><button id="ovNew">Choose another city</button></div>`);
 $('#ovOk').onclick=closeOv;$('#ovNew').onclick=()=>showStart()}
/* the stores ran out of food and the city buys it from outside: a card says so once (then every two years at most), what it costs
   and what to build instead */
function foodCard(){const f=PRICE.food[0],bt=k=>B[k]&&!lockOf(k)?[`${B[k].i} ${B[k].n} · ${money(B[k].cost.gold,1)}`,()=>{setMode(k);findSpot()}]:null;
 evChoice('🥕 The city is buying food',`Your stores have no food left<br>So the people do not go hungry, the city now buys food from outside. That costs <b>30% more</b> than the market price: ${money(Math.round(f*1.3*10)/10,1)} for each ${ICON.food} in place of ${money(f,1)}<br><br>Your own food costs much less. Build more of it:`,
  [bt('garden'),bt('farm'),bt('fisher'),['Later',()=>{}]].filter(Boolean))}
function lastChance(){const up=runNet()>0,st=S.stock;evChoice('⚠️ Last chance: the treasury is empty',`The treasury is at <b>${money(st.gold,1)}</b><br>Bring it back above −${money(3000)} by <b>${dateStr(S.lastT)}</b>, or ${NYC()?'the city goes into receivership':'the Reichsrat takes over'} and the game ends.${up?'<br><br>More money comes in than goes out, so you have a full year.':''}<br><br>${S.loan>0?'Sell goods in Trade to fill it now.':'Take a loan or sell goods in Trade to fill it now.'}`,
 [S.loan>0?null:['💰 Take a loan',()=>lackTrade('gold')],['⚖️ Sell goods in Trade',()=>{closeInfo();tradeFill();$('#trade').hidden=false}],S.taxR==='high'?null:['⬆️ Raise the taxes',()=>{S.taxR='high';toast(`🪙 ${TAXD.high}`)}],['Later',()=>{}]].filter(Boolean))}
function showLose(){ov(`<h1>Bankrupt</h1><p>The treasury of ${L.name} ran dry, ${NYC()?'and the state legislature in Albany has removed you from office':'and the Reichsrat takes the city\'s finances out of your hands'}.</p><div class="btns"><button class="pri" id="ovNew">Try ${L.name} again</button><button id="ovPick">Choose another city</button></div>`);
 $('#ovNew').onclick=()=>{ldShow(S.level);setTimeout(()=>{newGame(S.level);closeOv();save();ldEnd()},60)};$('#ovPick').onclick=()=>showStart()}

/* ---------- Europe map ---------- */
const EU={main:[-5.6,36.0,-6.3,36.8,-7.4,37.2,-8.9,37.0,-8.8,38.7,-9.5,38.8,-8.9,40.2,-8.7,41.8,-9.3,43.0,-8.0,43.7,-5.8,43.6,-3.8,43.4,-1.8,43.4,-1.3,44.5,-1.2,46.2,-2.2,47.1,-4.5,47.8,-4.7,48.4,-3.0,48.8,-1.6,48.7,-1.6,49.6,0.1,49.4,1.6,50.2,2.5,51.1,3.6,51.5,4.7,52.9,6.9,53.4,8.6,53.9,8.6,55.0,8.1,56.5,10.0,57.6,10.4,56.5,10.0,55.0,10.9,54.0,12.5,54.4,14.2,53.9,16.5,54.5,18.6,54.7,21.0,55.0,21.1,56.0,21.0,57.0,22.6,57.8,24.1,57.0,24.4,58.3,23.5,59.2,25.0,59.5,28.0,59.5,30.2,59.9,28.5,60.5,25.0,60.2,22.9,59.8,21.4,60.8,21.5,62.5,23.0,63.8,25.4,65.0,24.5,65.8,22.0,65.6,20.0,63.8,17.5,62.4,17.2,61.0,18.7,60.2,18.0,59.3,16.5,57.5,16.6,56.2,14.3,55.5,13.0,55.6,12.6,56.2,11.9,57.7,11.2,59.0,10.5,59.5,9.6,59.0,8.0,58.1,5.6,58.9,5.0,60.4,5.0,62.0,8.0,63.5,40,67,40,47,38.0,46.8,35.0,45.3,33.5,44.5,32.5,45.3,31.0,46.6,29.6,45.2,28.6,44.2,27.9,43.2,28.0,42.0,29.0,41.2,27.0,40.4,26.2,40.0,26.0,40.8,24.0,40.7,22.9,40.6,23.7,39.9,22.6,39.3,23.0,38.3,24.0,38.1,23.0,37.0,22.4,36.4,21.6,36.9,21.3,37.9,20.7,39.0,20.0,39.7,19.4,40.8,19.5,41.8,18.5,42.5,17.0,43.3,15.9,43.6,15.0,44.5,14.2,45.1,13.6,45.6,12.3,45.4,12.3,44.5,13.5,43.6,14.6,42.2,16.2,41.9,16.9,41.1,18.5,40.1,17.2,40.4,16.6,39.6,17.1,39.0,16.5,38.4,15.7,38.0,16.0,39.5,15.6,40.0,14.4,40.6,13.0,41.2,12.3,41.7,11.1,42.4,10.5,43.3,9.8,44.1,8.8,44.4,7.7,43.8,7.3,43.7,6.0,43.1,4.8,43.4,3.5,43.3,3.1,42.4,3.2,41.9,2.2,41.4,0.9,41.0,0.0,39.9,-0.3,39.5,0.2,38.8,-0.5,38.3,-0.8,37.6,-2.1,36.7,-4.4,36.7],
 isl:[[-5.7,50.0,-4.2,50.4,-3.0,50.7,-1.0,50.8,1.4,51.2,1.7,52.5,0.3,53.0,0.1,53.6,-1.2,54.6,-1.6,55.6,-2.5,56.0,-1.8,57.5,-3.1,58.6,-5.0,58.6,-5.6,57.3,-6.2,56.4,-5.6,55.3,-4.9,54.9,-3.3,54.9,-3.0,53.9,-3.1,53.3,-4.6,53.3,-4.2,52.3,-5.3,51.8,-4.2,51.6,-3.0,51.5,-4.5,51.1],
  [-6.0,52.1,-6.2,53.3,-5.6,54.6,-6.2,55.2,-7.3,55.4,-8.5,55.0,-8.7,54.3,-10.0,54.2,-9.6,53.4,-10.3,52.2,-9.8,51.6,-8.3,51.8],
  [12.4,37.8,13.4,38.2,15.6,38.3,15.1,37.3,15.1,36.7,14.3,36.8],[8.4,39.0,9.6,39.2,9.8,40.5,9.5,41.2,8.2,40.9],[8.6,41.4,9.2,41.4,9.5,42.0,9.4,43.0,8.6,42.5],
  [23.5,35.3,24.5,35.2,26.3,35.1,25.5,35.4,24.0,35.6],[11.0,55.4,12.6,55.6,12.3,56.1,11.3,55.9],[2.4,39.4,3.4,39.6,3.2,39.9,2.6,39.8],
  [29.1,41.2,31.0,41.1,33.0,42.0,36.0,41.7,40,41,40,36.5,36.0,36.2,32.0,36.1,29.5,36.3,27.4,37.0,26.3,38.3,26.6,39.5,26.2,40.0,27.0,40.4,28.9,40.9],
  [-11,34.5,-6.9,34.0,-6.0,35.8,-5.3,35.9,-2.0,35.1,1.0,36.5,3.0,36.8,6.0,37.0,9.8,37.3,11.1,37.0,10.5,36.1,11.1,35.2,10.1,34.3,10.5,33.5,15,32.2,20,31.0,40,30,40,25,-11,25]],
 danube:[8.2,48.0,10.0,48.4,12.1,49.0,13.4,48.6,16.4,48.2,17.1,48.1,18.9,47.8,19.0,47.5,19.0,46.0,20.3,45.3,20.5,44.8,22.5,44.6,25.0,43.7,28.0,44.1,28.2,45.4,29.6,45.2]};
const euX=lon=>((lon+6)*.64*14).toFixed(1),euY=lat=>((57-lat)*14).toFixed(1);
const euPts=a=>{let r='';for(let k=0;k<a.length;k+=2)r+=`${euX(a[k])},${euY(a[k+1])} `;return r};
function europeSVG(prog){const lab={vienna:[7,4,'start'],prague:[-7,-3,'end'],venice:[-7,4,'end'],rome:[7,4,'start']};
 return`<svg id="euro" viewBox="0 0 323 301" role="img" aria-label="Map of Europe with playable cities"><rect width="323" height="301" fill="#1d5577"/>
 ${[EU.main,...EU.isl].map(a=>`<polygon points="${euPts(a)}" fill="#8fae5a" stroke="#5f7d3a" stroke-width="1" stroke-linejoin="round"/>`).join('')}
 <polyline points="${euPts(EU.danube)}" fill="none" stroke="#7fc4e0" stroke-width="1.6"/>
 ${['vienna','prague','venice','rome'].map(id=>{const v=LEVELS[id],x=euX(v.lon),y=euY(v.lat),[dx,dy,an]=lab[id];
  return`<g class="pin" data-play="${id}" tabindex="0" role="button" aria-label="Play ${v.name}"><circle cx="${x}" cy="${y}" r="11" fill="transparent"/><circle cx="${x}" cy="${y}" r="5.5" fill="${prog[id]?'#4caf6a':'#e0b84e'}" stroke="#fff" stroke-width="2"/>
  <text x="${+x+dx}" y="${+y+dy}" text-anchor="${an}" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#fff" stroke="#16222f" stroke-width="3" paint-order="stroke">${v.name}${prog[id]?' ✓':''}</text></g>`}).join('')}</svg>`}
/* the cities on the start card: New York, and Vienna as a preview; each has its own save, and the card and a reload open the one
   played last */
const CITIES=[['nyc1865','🗽','New York',''],['wien1857','🏰','Vienna','preview']];
const cityKey=()=>DEV?'ns3d-dev-city':'ns3d-city';
function lastCity(){try{const c=localStorage.getItem(cityKey());if(LEVELS[c]&&LEVELS[c].prebuild)return c}catch(e){}return'nyc1865'}
const CITYTXT={nyc1865:['New York 1865','You are the <b>Mayor of New York</b>. It is 1865, and the city is about to grow: build it faster than history did.'],
 wien1857:['Vienna 1865','You are <b>Emperor Franz Joseph</b>. It is 1865: the walls of Vienna are coming down, and the Ring is rising. Empress Sissi is at your side.']};
async function showStart(id){id=id||lastCity();const sv=await storedSave(id),nm=LEVELS[id].name,[tt,tx]=CITYTXT[id];
 ov(`<div class="btns" style="margin:0 0 10px">${CITIES.map(([k,i,n,tag])=>`<button class="${k===id?'pri':''}" data-city="${k}">${i} ${n}${tag?` <small>${tag}</small>`:''}</button>`).join('')}</div>
 <h1 style="font-size:32px">${tt}</h1><p class="m" style="margin-top:-8px">Great Cities · preview</p><p>${tx}</p>
 <div class="btns"><button class="pri" id="${sv?'ovCont':'ovNew'}">${sv?'Continue your city':'Begin in 1865'}</button><button id="ovHelp">How to play</button><button id="ovGames">💾 Saved games</button><button id="ovHist" title="The whole old city as it stood in 1865"${fullGame()?'':' style="opacity:.6"'}>🏛️ Historic start${fullGame()?'':' <small>with the full game</small>'}</button>${DEV?'<button id="ovDev">🛠️ Dev: a built city of any year</button>':''}</div>
 ${sv?'<p style="margin-top:28px;text-align:right"><button class="plain" id="ovNew">Start again in 1865</button></p>':''}
 ${storeOK?'':`<p class="m" style="margin-top:10px">Automatic saving isn\'t available where this game is open. Use 💾 Saved games to copy a save code.</p>`}`);
 document.querySelectorAll('#ovCard [data-city]').forEach(b=>b.onclick=()=>{if(b.dataset.city!==id)showStart(b.dataset.city)});
 const busy=b=>{b.textContent=`Building ${nm}…`;document.querySelectorAll('#ovCard button').forEach(x=>x.disabled=true);ldShow(id)};
 const oth=sv?[]:gmOther(gmCur(id)),fresh=(m)=>{if(!sv)gmDrop(gmCur(id));NEWMODE=m==='hist'?'hist':'scratch';newGame(id);closeOv();save();ldEnd()};
 /* the Historic start: the whole old city of 1865 with its streets, houses and first works, as the game began before; it comes with the full game */
 $('#ovHist').onclick=()=>{if(!fullGame()){toast('The Historic start opens with the full game: the whole old city as it stood in 1865');return}
  const go=()=>{busy($('#ovHist'));setTimeout(()=>fresh('hist'),60)};if(!sv){go();return}
  ov(`<h2>Historic start?</h2><p>This replaces your city with the whole old ${nm} of 1865. Start again?</p><div class="btns"><button class="pri" id="ovOk">Keep my city</button><button id="ovYes">Historic start</button></div>`);
  $('#ovOk').onclick=()=>showStart(id);$('#ovYes').onclick=()=>{busy($('#ovYes'));setTimeout(()=>fresh('hist'),60)}};
 if(sv)$('#ovCont').onclick=()=>{busy($('#ovCont'));setTimeout(()=>{if(restore(sv)){closeOv();toast(`Welcome back. It is ${dateStr(S.t)}`);ldEnd()}else fresh()},60)};
 $('#ovNew').onclick=()=>{if(oth.length){gmAsk(oth,()=>showStart(id),()=>{busy($('#ovYes'));setTimeout(fresh,60)});return}if(!sv){busy($('#ovNew'));setTimeout(fresh,60);return}
  ov(`<h2>Start again?</h2><p>This replaces your city. Start again?</p><div class="btns"><button class="pri" id="ovOk">Keep my city</button><button id="ovYes">Start again in 1865</button></div>`);
  $('#ovOk').onclick=()=>showStart(id);$('#ovYes').onclick=()=>{busy($('#ovYes'));setTimeout(fresh,60)}};
 if(DEV)$('#ovDev').onclick=()=>devStart(id);$('#ovGames').onclick=()=>showGames(true);
 $('#ovHelp').onclick=()=>{if(oth.length){gmAsk(oth,()=>showStart(id),()=>{busy($('#ovYes'));setTimeout(()=>{fresh();S.tutSeen=1;try{localStorage.removeItem(tutDoneKey())}catch(e){}tutStart()},60)});return}busy($('#ovHelp'));setTimeout(()=>{if(!(sv&&restore(sv)))fresh();S.tutSeen=1;closeOv();ldEnd();try{localStorage.removeItem(tutDoneKey())}catch(e){}tutStart()},60)}}
/* a reload (the phone drops a background tab) goes straight back into the city played last; the start card is for a first visit or the More menu */
async function boot(){ldStep(.35,'Raising the houses…');const sv=await storedSave(lastCity());if(sv&&restore(sv)){$('#ov').hidden=true;toast(`Welcome back. It is ${dateStr(S.t)}`);ldEnd();return}showStart();ldEnd()}
/* the loading screen (index.html) while a city is built: it stays until the new city has been drawn */
const ldStep=(p,t)=>{if(window.loadStep)loadStep(p,t)},ldShow=k=>{if(window.loadShow)loadShow(k)},ldEnd=()=>{if(window.loadEnd)loadEnd()};
/* ---------- save / load ---------- */
let storeOK=false,lastSaved=0;
const STORE={async get(k){try{const v=localStorage.getItem(k);return v==null?null:{value:v}}catch(e){return null}},async set(k,v){try{localStorage.setItem(k,v);return{key:k}}catch(e){return null}}};
const TYPES0=['road','house','woodcutter','fisher','sheep','weaver','market','brick','mine','smith','chapel','tobacco','tobacconist','spice','tower','shipyard','kontor','monument','karls','oper','hofburg','rad','schoen','stephan','belved','rathaus','parlament','votiv','secession','pavillon','postspar','steinhof','looshaus'];
const TYPES=TYPES0.concat(['palais','sawmill','stonewh','ironyard','garden','grainf','brewery','bastion','stadtpark','musikverein','rotunde','brunnen','vineyard','heuriger','kursalon','kuenstler','epstein','ephrussi','imperial','kaffeehaus','feuerwehr','spital','gaswerk','harbour','universitaet','rossauer','coalyard','kraftwerk','tram','autofabrik','quarry','polizei','bank','farm','muell','eislauf','reitschule','kaserne','tiergarten','burgtheater','regulierung','reichsbruecke','bahnhof','liberty','flatiron','tower','parkrow','singer','metlife','woolworth','museen','mill','bakery','castleg','schule','fleischer','roester','tischler','porzellan','sperl']);
/* developer mode (open the game with ?dev): unlimited money and goods, every discovery made by the year of the calendar, every landmark unlocked, no height
   limit; it keeps its own save so the real city is never touched */
const DEV=/[?&]dev\b/.test(location.search);
/* a link can name the city (?city=wien or ?city=ny, with ?dev too): it becomes the city to open, as if it had been played last */
{const m=/[?&]city=(\w+)/.exec(location.search),k=m&&{wien:'wien1857',vienna:'wien1857',ny:'nyc1865',nyc:'nyc1865',newyork:'nyc1865'}[m[1].toLowerCase()];if(k)try{localStorage.setItem(cityKey(),k)}catch(e){}}
/* the tutorial's practice city keeps its own slot (tutorial.js) */
const saveKey=id=>window.TGPRACTICE?`ns3d-practice-${id}`:gmCur(id);
/* ---------- saved games ---------- */
/* every game has a slot of its own: a city's first game keeps the old key, each further one gets its own. The list (name, city, date, people) and
   the game played last in each city are kept beside the saves. The full game keeps as many games as the player likes, the free game one in all */
const gBase=id=>`${DEV?'ns3d-dev-':'ns3d-save-'}${id}`,GKEY=DEV?'ns3d-dev-games':'ns3d-games';
let GM=null;
function gm(){if(GM)return GM;GM={cur:{},list:[]};try{const d=JSON.parse(localStorage.getItem(GKEY)||'null');if(d&&Array.isArray(d.list))GM={cur:d.cur||{},list:d.list}}catch(e){}
 /* a city saved before the list was kept is its first game */
 for(const[c,,n]of CITIES){const k=gBase(c);if(GM.list.some(g=>g.k===k))continue;try{const v=localStorage.getItem(k);if(!v)continue;const d=JSON.parse(v);GM.list.push({k,c,n,t:d.t||0,ts:d.ts||0})}catch(e){}}
 return GM}
function gmWrite(){try{localStorage.setItem(GKEY,JSON.stringify(GM))}catch(e){}}
function gmCur(id){const m=gm(),has=k=>m.list.some(g=>g.k===k);if(has(m.cur[id]))return m.cur[id];if(has(gBase(id)))return gBase(id);
 const l=m.list.filter(g=>g.c===id).sort((a,b)=>(b.ts||0)-(a.ts||0));return l.length?l[0].k:gBase(id)}
function gmName(c){const nm=(CITIES.find(x=>x[0]===c)||[0,0,LEVELS[c].name])[2],have=gm().list.filter(g=>g.c===c).map(g=>g.n);if(!have.includes(nm))return nm;for(let i=2;;i++)if(!have.includes(`${nm} ${i}`))return`${nm} ${i}`}
/* each save writes the game's line in the list */
function gmTouch(){if(window.TGPRACTICE||!S)return;const k=saveKey(S.level),m=gm();let g=m.list.find(g=>g.k===k);if(!g)m.list.push(g={k,c:S.level,n:gmName(S.level)});
 g.t=Math.round(S.t);g.p=dispPop();g.ts=Date.now();m.cur[S.level]=k;gmWrite()}
/* the free game keeps one game in all: a new game in another slot takes the place of the games it has */
const gmOther=k=>fullGame()?[]:gm().list.filter(g=>g.k!==k);
function gmDrop(k){const m=gm(),o=gmOther(k);if(!o.length)return;for(const g of o){try{localStorage.removeItem(g.k)}catch(e){}if(m.cur[g.c]===g.k)delete m.cur[g.c]}m.list=m.list.filter(g=>!o.includes(g));gmWrite()}
const gmAsk=(o,back,yes)=>{ov(`<h2>Begin a new game?</h2><p>The free game keeps one game. A new game takes the place of <b>${gEsc(o[0].n)}</b>.</p><p>A deleted game cannot be brought back.</p><div class="btns"><button class="pri" id="ovOk">Keep my city</button><button id="ovYes">Begin in 1865</button></div>`);$('#ovOk').onclick=back;$('#ovYes').onclick=yes};
const gEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* the menu of saved games: open one, name it, delete it, begin a new one; from More and from the start screen */
async function showGames(fromStart){if(window.TGPRACTICE){showSave();return}setMode(null);const ok=S&&!S.lost?await save(true):false;if(S&&!ok&&!storeOK){showSave();return}
 const m=gm(),full=fullGame(),here=S&&!S.lost?saveKey(S.level):null,again=()=>showGames(fromStart);
 const rows=m.list.slice().sort((a,b)=>(b.k===here)-(a.k===here)||(b.ts||0)-(a.ts||0));
 ov(`<h2>💾 Saved games</h2>${ok?'<p class="m">Your city is saved. The game also saves by itself.</p>':''}
 <div class="gameL">${rows.map(g=>{const ci=CITIES.find(c=>c[0]===g.c)||[];return`<div class="gRow${g.k===here?' on':''}"><button class="gGo" data-k="${g.k}"><b>${gEsc(g.n)}</b><small>${ci[1]||''} ${ci[2]||''}${g.t?` · ${dateStr(g.t)}`:''}${g.p!=null?` · 👥 ${shortN(g.p)}`:''}</small>${g.k===here?'<small class="gNow">Open now</small>':''}</button><button class="gEd" data-k="${g.k}" aria-label="Name">✏️</button>${g.k===here?'':`<button class="gDel" data-k="${g.k}" aria-label="Delete">🗑️</button>`}</div>`}).join('')||'<p class="m">No saved game yet.</p>'}</div>
 ${full?'':'<p class="m">The free game keeps one game. With the full game you keep as many as you like, each with its own name.</p>'}
 <div class="btns"><button class="pri" id="gNew">＋ New game</button>${S&&!S.lost?'<button id="gCode">Save code</button>':''}<button id="ovOk">Back</button></div>`);
 const of=b=>m.list.find(g=>g.k===b.dataset.k);
 $('#ovOk').onclick=()=>fromStart?showStart():closeOv();$('#gNew').onclick=()=>showNewGame(fromStart);if($('#gCode'))$('#gCode').onclick=showSave;
 document.querySelectorAll('#ovCard .gGo').forEach(b=>b.onclick=()=>{const g=of(b);if(!g)return;if(g.k===here){closeOv();return}gameOpen(g)});
 document.querySelectorAll('#ovCard .gEd').forEach(b=>b.onclick=()=>{const g=of(b);if(!g)return;
  ov(`<h2>✏️ Name of the game</h2><input id="gName" maxlength="28" value="${gEsc(g.n)}"><div class="btns"><button class="pri" id="gSave">Save the name</button><button id="ovOk">Back</button></div>`);
  $('#ovOk').onclick=again;$('#gSave').onclick=()=>{const v=$('#gName').value.trim();if(v){g.n=v;gmWrite()}again()}});
 document.querySelectorAll('#ovCard .gDel').forEach(b=>b.onclick=()=>{const g=of(b);if(!g)return;
  ov(`<h2>🗑️ Delete this game?</h2><p><b>${gEsc(g.n)}</b>${g.t?` · ${dateStr(g.t)}`:''}${g.p!=null?` · 👥 ${shortN(g.p)}`:''}</p><p>A deleted game cannot be brought back.</p><div class="btns"><button class="pri" id="ovOk">Keep it</button><button id="gYes">Delete</button></div>`);
  $('#ovOk').onclick=again;$('#gYes').onclick=()=>{try{localStorage.removeItem(g.k)}catch(e){}m.list=m.list.filter(x=>x!==g);if(m.cur[g.c]===g.k)delete m.cur[g.c];gmWrite();again()}})}
function gameOpen(g){let d=null;try{d=JSON.parse(localStorage.getItem(g.k))}catch(e){}if(!d){toast('This save could not be loaded');return}
 document.querySelectorAll('#ovCard button').forEach(x=>x.disabled=true);ldShow(g.c);
 setTimeout(()=>{const m=gm(),was=m.cur[g.c];m.cur[g.c]=g.k;if(restore(d)){gmWrite();try{localStorage.setItem(cityKey(),g.c)}catch(e){}UNDO.length=0;undoShow();closeOv();toast(`Welcome back. It is ${dateStr(S.t)}`)}else{m.cur[g.c]=was;toast('This save could not be loaded')}ldEnd()},60)}
/* a new game: the city, a name (full game) and the start. The free game has one game in all, so a second one takes the first one's place */
function showNewGame(fromStart,city){const m=gm(),full=fullGame();city=city||(S?S.level:lastCity());const has=m.list.some(g=>g.c===city),oth=has?[]:gmOther(gBase(city));
 ov(`<h2>＋ New game</h2><div class="btns" style="margin:0 0 10px">${CITIES.map(([k,i,n])=>`<button class="${k===city?'pri':''}" data-city="${k}">${i} ${n}</button>`).join('')}</div>
 ${full?`<p class="m">Name of the game</p><input id="gName" maxlength="28" value="${gEsc(gmName(city))}">`:has||oth.length?`<p>The free game keeps one game. A new game takes the place of the one you have.</p>`:''}
 <div class="btns"><button class="pri" id="gBegin">Begin in 1865</button>${full?'<button id="gHist" title="The whole old city as it stood in 1865">🏛️ Historic start</button>':''}<button id="ovOk">Back</button></div>`);
 document.querySelectorAll('#ovCard [data-city]').forEach(b=>b.onclick=()=>{if(b.dataset.city!==city)showNewGame(fromStart,b.dataset.city)});
 $('#ovOk').onclick=()=>showGames(fromStart);
 const go=mode=>{const name=full?$('#gName').value.trim():'';if(oth.length){gmAsk(oth,()=>showGames(fromStart),()=>gameNew(city,'',mode));return}if(full||!has){gameNew(city,name,mode);return}
  ov(`<h2>Start again?</h2><p>This replaces your city. Start again?</p><div class="btns"><button class="pri" id="ovOk">Keep my city</button><button id="ovYes">Start again in 1865</button></div>`);
  $('#ovOk').onclick=()=>showGames(fromStart);$('#ovYes').onclick=()=>gameNew(city,'',mode)};
 $('#gBegin').onclick=()=>go();if($('#gHist'))$('#gHist').onclick=()=>go('hist')}
async function gameNew(city,name,mode){document.querySelectorAll('#ovCard button').forEach(x=>x.disabled=true);if(S&&!S.lost&&!window.TGPRACTICE)await save(true);window.TGPRACTICE=false;
 const m=gm(),base=gBase(city),k=!m.list.some(g=>g.k===base)?base:fullGame()?`${base}-${Date.now().toString(36)}`:gmCur(city);
 if(k===base)gmDrop(k);m.list=m.list.filter(g=>g.k!==k);m.list.push({k,c:city,n:name||gmName(city),t:0,ts:Date.now()});m.cur[city]=k;gmWrite();ldShow(city);
 setTimeout(()=>{NEWMODE=mode==='hist'?'hist':'scratch';newGame(city);UNDO.length=0;undoShow();closeOv();save();ldEnd()},60)}
function devTick(){if(!S||S.lost)return;for(const g of GOODS)S.stock[g]=Math.max(S.stock[g]||0,9999);S.stock.gold=Math.max(S.stock.gold||0,1e7);if(!L.y1857)for(const t of TECH)RES()[t[0]]=1;else{const y=devYr();for(const t of TECH)if(t[3]<=y)RES()[t[0]]=1}UNLOCKALL=true;S.limit=Math.max(S.limit||0,2);S.prest=Math.max(S.prest||0,1500)}
if(DEV)setInterval(devTick,400);
/* the dev sheet (🛠️ at the left edge): the weather (weather.js fills its row), a jump to any year, a built city of any year, and every
   street scene, case, request and event on the spot, to test without playing there */
const devYr=()=>Math.floor(Y0+S.t/YEAR);
/* a jump to a year keeps the city as it is and moves the calendar: the date, the discoveries made by then and none made later, the
   year's events, history scenes and requests from then on; the timers move along with it so nothing from the years skipped falls
   due at once. Buildings stay as they are, going back too */
const DEVT=['crT','robT','audT','immT','uwT','uwC','csT','hdT','fiT','strikeCD','pnext','good','strike','depr','slump','boom','expose','lowT','ctrT','warT','peace'];
function devYear(y){if(!S||!L.y1857)return;y=Math.max(1865,Math.min(1916,y|0));const t0=S.t;S.t=Math.min(yT(1916,10),yT(y)+(S.t%YEAR+YEAR)%YEAR);const d=S.t-t0;
 for(const k of DEVT)if(typeof S[k]==='number'&&S[k]>0)S[k]+=d;if(S.joy)for(const w of S.joy)w.u+=d;S.scq=[];if(S.sc){if(S.sc.o)S.sc.o.fire=0;S.sc=null}sceneShow();
 S.ev=EVENTS.findIndex(e=>e[0]>S.t);if(S.ev<0)S.ev=EVENTS.length;for(const t of TECH)if(t[3]<=y)RES()[t[0]]=1;else delete RES()[t[0]];
 const hd=S.hd||(S.hd={});for(const k in HIST){const h=HIST[k];if(!h.at)continue;if(yT(...h.at)<S.t)hd[k]=1;else delete hd[k]}
 S.q=S.q||{};for(const q of QUESTS){const s_=S.q[q.id];if(yT(...q.at)>S.t)delete S.q[q.id];else if(s_&&s_.st==='active'&&s_.due!=null&&s_.due<=S.t)s_.st='missed'}
 GOALSIG='';GV++;recompute();updateUI();toast(`🛠️ It is now ${dateStr(S.t)}`)}
/* tram and railway lines of the real city, each from the year it ran: [first year, points along it]. Horsecars on the avenues from the
   1850s, the Broadway surface line from 1885, trolleys over the Brooklyn Bridge from 1898 */
const DEVTRAM=[[1865,[[40.7127,-74.0050],[40.7190,-73.9940],[40.7300,-73.9890],[40.7470,-73.9790],[40.7620,-73.9660]]],[1865,[[40.7120,-74.0100],[40.7320,-74.0010],[40.7500,-73.9880],[40.7650,-73.9765]]],
 [1865,[[40.7140,-74.0090],[40.7400,-74.0020],[40.7550,-73.9910],[40.7670,-73.9830]]],[1865,[[40.7030,-73.9940],[40.6920,-73.9880],[40.6890,-73.9800],[40.6800,-73.9500]]],
 [1885,[[40.7050,-74.0135],[40.7200,-74.0020],[40.7359,-73.9911],[40.7420,-73.9890],[40.7580,-73.9855],[40.7680,-73.9819]]],[1898,[[40.7120,-74.0045],[40.7000,-73.9900]]]];
/* stations and their line out to the edge of the map: the Hudson River Railroad's St. John's Park terminal (1868) up the West Side,
   the Harlem line from 42nd Street (Grand Central Depot, 1871) up Fourth Avenue, the Long Island Rail Road from Flatbush Avenue (1877) */
const DEVRAIL=[[1868,40.7215,-74.0090,[.012,.006]],[1871,40.7545,-73.9760,[.012,.006]],[1877,40.6840,-73.9776,[-.002,.012]]];
/* what the dev city builds in each city: services [kind, year, lat, lon], tram lines (the depots by the lines up to dc.depot) and
   stations with their line out. Vienna's horse trams: Schottentor to Hernals in 1865, the Ring in 1868, the Praterstraße, Mariahilfer,
   Wiedner and Landstraßer Hauptstraße lines of the Wiener Tramway-Gesellschaft by 1869; its main stations stand from the start
   (rails0), the Franz-Josefs-Bahnhof from 1872 */
const DEVC={nyc1865:{tram:DEVTRAM,rail:DEVRAIL,depot:1865,svc:[['feuerwehr',1865,40.7200,-73.9950],['polizei',1865,40.7215,-73.9990],['spital',1865,40.7400,-73.9780],['market',1865,40.7110,-74.0120],['bank',1865,40.7065,-74.0090],
  ['coalyard',1865,40.7180,-73.9610],['gaswerk',1880,40.7330,-73.9740],['kraftwerk',1882,40.7280,-73.9760],['kraftwerk',1890,40.7520,-73.9950],['autofabrik',1900,40.7600,-73.9600]]},
 wien1857:{depot:1869,rail:[[1872,48.2255,16.3585,[.008,.0028]]],
  svc:[['feuerwehr',1865,48.2108,16.3680],['polizei',1865,48.2125,16.3625],['spital',1865,48.2195,16.3505],['bank',1865,48.2098,16.3662],['coalyard',1865,48.1905,16.4000],
   ['gaswerk',1899,48.1855,16.4180],['kraftwerk',1902,48.1825,16.4250],['autofabrik',1904,48.2380,16.3500]],
  tram:[[1865,[[48.2150,16.3600],[48.2160,16.3405],[48.2200,16.3260],[48.2230,16.3120]]],
   [1868,[[48.2150,16.3640],[48.2130,16.3600],[48.2105,16.3592],[48.2078,16.3590],[48.2055,16.3610],[48.2040,16.3640],[48.2028,16.3670],[48.2018,16.3700],[48.2015,16.3730],[48.2022,16.3760],[48.2040,16.3790],[48.2065,16.3805],[48.2090,16.3815],[48.2112,16.3825],[48.2125,16.3800],[48.2135,16.3775],[48.2145,16.3735],[48.2155,16.3690],[48.2150,16.3640]]],
   [1868,[[48.2128,16.3800],[48.2158,16.3865],[48.2185,16.3925]]],[1869,[[48.2020,16.3605],[48.1990,16.3500],[48.1966,16.3376],[48.1930,16.3270]]],
   [1869,[[48.1998,16.3690],[48.1940,16.3665],[48.1858,16.3640]]],[1869,[[48.2060,16.3825],[48.2000,16.3890],[48.1935,16.3950]]]]}};
function devTile(la,lo){const[x,y]=gt(...prj(L,la,lo));return inb(x,y)?y*W+x:-1}
function devLine(kind,a,b){const p=a>=0&&b>=0&&linePlan(kind==='rail'?'rail':'tramline',a,b);if(!p)return false;const arr=kind==='rail'?(S.rails||(S.rails=[])):(S.trams||(S.trams=[])),M=kind==='rail'?RL:TL;
 for(let i=1;i<p.tiles.length;i++){const u=p.tiles[i-1],v=p.tiles[i];if(!(M.get(u)||[]).includes(v))arr.push([u,v])}railIndex();return true}
/* the last tile on the map going from (la,lo) in steps of (dla,dlo), where a track can run */
function devEdge(la,lo,[dla,dlo]){let k=-1;for(let n=0;n<400;n++){const i=devTile(la+dla*n/8,lo+dlo*n/8);if(i<0)break;if(railPas(i))k=i}return k}
function devCity(y,id){id=id||(S&&S.level)||'nyc1865';NEWMODE='hist';newGame(id);const dc=DEVC[id]||DEVC.nyc1865;closeOv();UNLOCKALL=true;try{devYear(y);S.limit=2;S.prest=Math.max(S.prest,Math.min(900,(y-1865)*20));S.crT=S.robT=S.audT=S.immT=S.uwT=S.csT=S.t+YEAR/2;
 for(const e of L.landmarks){if(!e.due||e.due[0]>y)continue;let o=S.list.find(q=>q.t===e.k);if(!o)o=placeNear(e.k,e.lat,e.lon,20);if(!o)continue;o.bld=null;linkRoad(o);if(e.k==='reichsbruecke')finishBridge(o)}
 for(const o of S.list)if(o.bld&&o.h)o.bld=null;
 const spots=[[40.7065,-74.0095],[40.7085,-74.0075],[40.7050,-74.0060],[40.7100,-74.0100],[40.7125,-74.0105],[40.7150,-74.0060],[40.7185,-74.0040],[40.7475,-73.9890],[40.7505,-73.9860],[40.7550,-73.9850],[40.7580,-73.9800],[40.7445,-73.9910]];
 if(y>=1890&&NYC())for(const[la,lo]of spots.slice(0,Math.round(spots.length*Math.min(1,(y-1889)/20)))){const o=placeNear('tower',la,lo,8);if(o)linkRoad(o)}
 for(const[m,y0,la,lo]of dc.svc){if(y<y0)continue;const o=placeNear(m,la,lo,12);if(o)linkRoad(o)}
 let n=0;for(const o of S.list)if(o.t==='house'&&o.h&&y>=1880&&o.lvl<4&&(n++%2===0))o.lvl=Math.min(4,o.lvl+1+(y>=1900));
 for(let k=0,N=Math.min(40,(y-1865)>>1);k<N;k++){setMode('house');if(!findSpot())break;const[gx,gy]=pend.split(',').map(Number);tryBuild(gx,gy);setMode(null);const o=S.list[S.list.length-1];if(o&&o.t==='house'){o.bld=null;o.lvl=Math.min(6,3+(y>=1885)+(y>=1900)*(k%2));o.pop=maxPop(o);linkRoad(o)}}
 for(const[y0,pts]of dc.tram)if(y>=y0)for(let k=1;k<pts.length;k++)devLine('tram',histRoad(...pts[k-1]),histRoad(...pts[k]));
 /* a depot by the first stop of each line of 1865, joined to it along the streets if it stands further off */
 for(const[y0,pts]of dc.tram){if(y0>dc.depot||y<y0)continue;const a=histRoad(...pts[0]),o=placeNear('tram',...pts[0],12);if(!o)continue;o.bld=null;linkRoad(o);if(depotTiles(o).length)continue;
  const b=perim(o).map(([x,q])=>inb(x,q)?q*W+x:-1).find(i=>i>=0&&isRd(i));if(b!=null&&a>=0)devLine('tram',b,a)}
 for(const[y0,la,lo,dir]of dc.rail)if(y>=y0)railTo(la,lo,dir,true);
 pend=null;confHide&&confHide();}finally{UNLOCKALL=false}for(const g of GOODS)S.stock[g]=Math.max(S.stock[g]||0,9999);S.stock.gold=Math.max(S.stock.gold||0,1e7);
 railIndex();GV++;recompute();const w=S.list.find(o=>o.t==='hofburg')||S.list.find(o=>o.t==='stephan');Z=.55;centerOn(w.x+4,w.y+8);gGV=-1;save(true);toast(`🛠️ ${L.name} in ${dateStr(S.t)}, built`);
 /* the new game's welcome to 1865 comes a moment later: not for a city of another year */
 setTimeout(()=>{const h=$('#ovCard h2');if(!$('#ov').hidden&&h&&/^(New York, 1865|1 May 1865)/.test(h.textContent))closeOv()},700)}
/* the launcher: everything starts now, where the city has room for it; a scene already on is cleared first */
function devClear(){if(!S)return;S.scq=[];if(S.sc){if(S.sc.o)S.sc.o.fire=0;S.sc=null;sceneShow()}}
const devHall=()=>S.list.find(o=>o.t==='hofburg')||S.list.find(o=>o.t==='stephan');
function devFire(){const c=devHall(),hs=S.list.filter(o=>o.t==='house'&&!o.bld&&!o.fire&&c&&Math.hypot(o.x-c.x,o.y-c.y)<30);const o=hs[Math.random()*hs.length|0];if(!o)return toast('No house near City Hall');fireStart(o)}
function devRob(){let b=S.list.find(o=>o.t==='bank'&&!o.bld);if(!b){UNLOCKALL=true;try{b=placeNear('bank',...(NYC()?[40.7065,-74.0090]:[48.2098,16.3662]),14)}finally{UNLOCKALL=false}if(b){b.bld=null;linkRoad(b);GV++}}if(b&&!NYC()){S.stock.gold-=1000;robOutcome(1000,false,false);return}/* Vienna has no chase in the street: the robbery comes as its card */
 if(!b||!robStart(b,1000,false,false))toast('No street for a robbery here')}
function devQuest(q){const due=Math.max(yT(...q.due),S.t+YEAR*2);S.q[q.id]={st:'offered'};card(q,`${q.text}<br><br><b>Reward:</b> ${rewStr(q.rew)}. <b>Deadline:</b> ${dateStr(due)}.`,
 [['Accept',()=>{S.q[q.id]={st:'active',due,base:q.goal.type==='build'?qcount(q.goal.k):0};GOALSIG=''}],['Decline (👑 −5)',()=>{S.q[q.id]={st:'declined'};S.prest=Math.max(0,S.prest-5)}]])}
function devGoal(q){const g=q.goal;S.q[q.id]={st:'active',due:q.due?Math.max(yT(...q.due),S.t+YEAR*2):null,base:g.type==='grow'?grown({}):g.type==='build'&&g.k==='house4'?qcount(g.k):0};S.gcol=false;GOALSIG='';goalsUI();toast(`🎯 ${q.short}`)}
const DEVUW={brawl:'⚔️ Gang fight',shake:'💰 Protection money',letter:'✋ Black Hand letter',bribe:'🎩 Tammany envelope',w_platte:'⚔️ Gang fight in Ottakring',w_strizzi:'💰 Protection money at the Prater',w_blech:'🪙 Tin money at the Wienerberg',w_bau:'🎩 A bribe for a favour'},DEVJOB={water:'💧 Water for a family',child:'🧒 Lost child',newc:'🧳 Newcomers',cart:'📦 Spilt cart'};
/* the dev sheet's lists, each for the city being played (the history, underworld scenes, cases, requests and goals of New York or Vienna) */
const DEVQ=()=>[['Street scenes',[['🔥 Fire',devFire],['✊ March',()=>{if(!marchStart(1000))strikeChoice(1000)}],['🛑 Strike',()=>strikeChoice(1000)],['💰 Bank robbery',devRob],...(NYC()?[['🚢 Immigrant ship',()=>{S.immT=S.t}]]:[]),
  ['📨 Messenger',()=>{if(!onFoot())return toast(`The messenger comes when ${YOU()} is out on foot: walk first`);msgPush(NYC()?'✊ The longshoremen threaten a strike':'✊ The brickmakers of the Wienerberg threaten a strike',()=>strikeChoice(1000),{urg:true})}]]],
 ['History',Object.keys(HIST).filter(k=>histHere(HIST[k])).map(k=>[HIST[k].txt,()=>{(S.hd||(S.hd={}))[k]=1;histStart(k)}])],
 ['Underworld',Object.keys(UW).filter(k=>histHere(UW[k])).map(k=>[DEVUW[k]||k,()=>{if(!uwStart(k))toast('No spot for it here')}])],
 ['Murder cases',Object.keys(CASES).filter(k=>caseHere(CASES[k])).map(k=>[`🕵️ ${CASES[k].short}`,()=>{S.case=null;if(!caseStart(k))toast('No streets for this case here')}])],
 ['Small jobs (on foot)',Object.keys(DEVJOB).map(k=>[DEVJOB[k],()=>{if(!(window.streetJob&&window.streetJob(k)))toast(onFoot()?'No room for this one here: walk on a little':'Walk the city first')}])],
 [NYC()?'Council requests':'Requests to the court',QUESTS.filter(q=>!q.quiet).map(q=>[`${goalIcon(q)} ${ucf(q.short)}`,()=>devQuest(q)])],
 ['Goals',QUESTS.filter(q=>q.quiet).map(q=>[`${goalIcon(q)} ${q.short}`,()=>devGoal(q)])],
 ['Office hours',AUD.map(([w,t,o])=>[w,()=>evChoice(NYC()?'🏛️ Office hours at City Hall':'👑 Audience day at the Hofburg',`${NYC()?'Visitors wait in your office at City Hall':'Petitioners wait in the audience hall of the Hofburg'}: <b>${w}</b>.<br><br>${t}`,o)])],
 ['Calendar events',EVENTS.filter(e=>e[1]!=='end').map(([t,k])=>[`${k} · ${dateStr(t)}`,()=>fireEvent(k)])],
 ['Crises',CRISES.map(([k,f])=>[k,()=>{if(!f())toast('Not possible right now')}])]];
const devShut=()=>{$('#devSheet').hidden=true};
function devOpen(){if(!S)return toast('Start a city first');const el=$('#devBody'),yo=[];for(let y=1865;y<=1916;y++)yo.push(`<option${y===devYr()?' selected':''}>${y}</option>`);
 if(el.dataset.built!==S.level){el.dataset.built=S.level;const q=DEVQ();DEVQ.fn=[];
  el.innerHTML=`<h3>Weather</h3><div class="dr" id="devWx"></div><h3>Year</h3><div class="dr"><select id="devY"></select><button id="devGo">⏩ Go to this year</button><button id="devCity">🏙️ Built city of this year</button></div>
   <p>Go keeps your city and moves the calendar, research and traffic to that year (buildings stay as they are, going back too). Built city starts the dev save afresh: streets, houses, landmarks, tram and rail lines, stations and money of that year.</p>
   <h3>Now</h3><div class="dr"><button id="devEnd">⏹ End the scene</button><button id="devCash">💰 Money and goods</button></div>`+
   q.map(([h,bs])=>`<h3>${h}</h3><div class="dr">${bs.map(([l,f])=>`<button data-dq="${DEVQ.fn.push(f)-1}">${l}</button>`).join('')}</div>`).join('');
  if(window.devWx)window.devWx($('#devWx'));
  $('#devGo').onclick=()=>{devYear(+$('#devY').value);devShut()};
  $('#devCity').onclick=()=>{const b=$('#devCity');if(!b.dataset.armed){b.dataset.armed=1;b.textContent='Tap again: replaces the dev save';return}delete b.dataset.armed;b.textContent='🏙️ Built city of this year';b.disabled=true;const y=+$('#devY').value;setTimeout(()=>{try{devCity(y)}finally{b.disabled=false;devShut()}},40)};
  $('#devEnd').onclick=()=>{devClear();if(S.job&&window.streetJob)S.job=null;devShut()};$('#devCash').onclick=()=>{devTick();toast('💰 Money and goods filled up')};
  el.addEventListener('click',e=>{const b=e.target.closest('[data-dq]');if(!b||!S)return;devShut();if(!/Small jobs|Council|Requests|Goals|Office|Calendar|Crises/.test(b.parentElement.previousElementSibling.textContent))devClear();closeOv();ATT=0;DEVQ.fn[+b.dataset.dq]()})}
 $('#devY').innerHTML=yo.join('');$('#devSheet').hidden=false}
if(DEV){$('#devBtn').hidden=false;$('#devBtn').onclick=()=>{if($('#devSheet').hidden)devOpen();else devShut()};$('#devX').onclick=devShut}
/* a built city from the start screen: pick the year */
function devStart(id='nyc1865'){const nm=LEVELS[id].name;const yo=[];for(let y=1865;y<=1916;y++)yo.push(`<option${y===1900?' selected':''}>${y}</option>`);
 ov(`<h2>🛠️ A built ${nm}</h2><p class="m">A playable city of the year you pick, in the dev save: streets, houses, landmarks, tram and rail lines, stations and plenty of money.</p>
 <p><select id="devSY" style="font-size:16px;padding:6px 10px;border-radius:8px">${yo.join('')}</select></p><div class="btns"><button class="pri" id="devSGo">Build ${nm}</button><button id="devSBack">Back</button></div>`);
 $('#devSBack').onclick=()=>showStart(id);$('#devSGo').onclick=()=>{const b=$('#devSGo'),y=+$('#devSY').value;b.textContent=`Building ${nm}…`;b.disabled=true;ldShow(id);setTimeout(()=>{devCity(y,id);ldEnd()},60)}}
function snapshot(){const base=S.base0||buildWorld(S.level,S.seed).t,ch=[];for(let i=0;i<W*H;i++)if(base[i]!==S.tiles[i])ch.push(i,S.tiles[i]);
 return{v:5,hv:2,yr:YEAR,ts:Date.now(),g:W,level:S.level,seed:S.seed,ch,limit:S.limit,ev:S.ev,war:S.war,prest:S.prest,ringDone:S.ringDone,autoBuy:S.autoBuy,scratch:S.scratch,ringV:S.ringV,x:{dayT:Math.round(dayT()),rsNT:S.rsNT,as:S.as,home:S.home,purse:S.purse,purseP:S.purseP,salT:S.salT,dnm:S.dnm,gcol:S.gcol,htiers:S.htiers,tierV:S.tierV,taxR:S.taxR,hey:S.hey,histRoom:S.histRoom,histU:S.histU,strikeCD:S.strikeCD,fiT:S.fiT,newc:S.newc,epi:S.epi,histU0:S.histU0,immT:S.immT,emp:S.emp,endK:S.endK,rails:S.rails,trams:S.trams,elx:S.elx,rel:S.rel,tension:S.tension,dp:S.dp,warT:S.warT,peace:S.peace,infl:S.infl,depr:S.depr,crT:S.crT,robT:S.robT,ctrOK:S.ctrOK,laws:S.laws,q:S.q,aud:S.aud,audT:S.audT,good:S.good,boom:S.boom,fees:S.fees,churchSale:S.churchSale,res:S.res,rfree:S.rfree,rs:S.rs,loan:S.loan,bpi:S.bpi,ctr:S.ctr,ctrT:S.ctrT,strike:S.strike,unrest:S.unrest,bad:S.bad,ration:S.ration,refG:S.refG,promise:S.promise,hd:S.hd,crime:S.crime,news:S.news,uwT:S.uwT,expose:S.expose,csT:S.csT,csd:S.csd,csr:S.csr,met:S.met,case:S.case,lowT:S.lowT,unrestW:S.unrestW,ui:S.ui,wkTip:S.wkTip,gNext:S.gNext,breadAt:S.breadAt,purseG:S.purseG,freeEnd:S.freeEnd,capEnd:S.capEnd,freeP:S.freeP,fair:S.fair,tg:S.tg,tgDone:S.tgDone,tgMv:S.tgMv,wg:S.wg,bdtip:S.bdtip,calm:S.calm,fireWarn:S.fireWarn,nb:S.nb,nbS:S.nbS,nbTold:S.nbTold,krTold:S.krTold,g2At:S.g2At},wallGone:S.wallGone,slump:S.slump,wallsDone:S.wallsDone,list:S.list.filter(o=>!o.h).map(o=>[TYPES.indexOf(o.t),o.x,o.y,o.lvl||0,o.pop||0,o.r?1:0,o.bld||0,o.bld0||0,o.lk||0,o.route||0,o.cond??1,o.up2||0,o.tier||0,o.ey||0,o.fy||0,o.wr||0]),stock:Object.fromEntries(Object.entries(S.stock).map(([k,v])=>[k,Math.round(v*10)/10])),
  t:Math.round(S.t),won:S.won,rv:S.rv,pnext:Math.round(S.pnext),ships:S.ships.map(o=>[o.cur,o.cargo]),sites:S.sites.map(o=>[o.x,o.y]),out:S.out,stats:S.stats}}
async function save(force){if(!S||S.lost)return false;cloudSave(force===true);
 try{const r=await STORE.set(saveKey(S.level),JSON.stringify(snapshot()),false);if(r){storeOK=true;lastSaved=Date.now();try{localStorage.setItem(cityKey(),S.level)}catch(e){}gmTouch();return true}}catch(e){}return false}
async function storedSave(id){const loc=await storedSave0(id);const cl=id==='nyc1865'?await cloudLoad():null;if(cl&&(!loc||(cl.ts||0)>(loc.ts||0))){storeOK=true;return cl}return loc}
async function storedSave0(id){
 for(const k of id==='isles'?[saveKey(id),'new-shores-save']:[saveKey(id)]){try{const r=await STORE.get(k);if(r&&r.value){storeOK=true;return JSON.parse(r.value)}}catch(e){}}
 if(!storeOK){try{const r=await STORE.set('new-shores-probe','1');storeOK=!!r}catch(e){}}return null}
async function getProgress(){try{const r=await STORE.get('ns-progress');if(r&&r.value)return JSON.parse(r.value)}catch(e){}return{}}
async function setProgress(id){try{const p=await getProgress();p[id]=1;await STORE.set('ns-progress',JSON.stringify(p))}catch(e){}}
function restore(d){try{
 if((d.g||44)!==W){setTimeout(()=>toast('That save is from the older, smaller map and can\'t be loaded. Start the city fresh'),300);return false}
 const lvl=d.level&&LEVELS[d.level]?d.level:'isles';L=LEVELS[lvl];const w=buildWorld(lvl,d.seed);
 let tiles,list;
 if(d.v>=3){tiles=w.t.slice();for(let k=0;k<d.ch.length;k+=2)tiles[d.ch[k]]=d.ch[k+1];
  list=d.list.map(a=>({t:TYPES[a[0]],x:a[1],y:a[2],lvl:d.hv?a[3]:({1:1,2:2,3:4,4:6}[a[3]]||a[3]),pop:a[4],r:a[5],bld:a[6]||null,bld0:a[7]||0,lk:a[8]||null,route:a[9]||null,cond:a[10]??1,up2:a[11]||0,tier:a[12]||0,ey:a[13]||0,fy:a[14]||0,wr:a[15]||0}))}
 else{tiles=Uint8Array.from(d.tiles);list=d.list}
 seaM=w.sea;ELEV=w.elev;DECO=w.deco;ZONE=w.zone;QUAY=w.quay||null;
 S={v:4,level:lvl,seed:d.seed,tiles,b:new Array(W*H).fill(null),list:[],stock:d.stock,t:d.yr===YEAR?d.t:Math.round(d.t*YEAR/(d.yr||420)),won:d.won,lost:false,rate:0,rv:d.rv||null,pnext:d.pnext||d.t+300,pir:null,carts:[],
  ships:(d.ships||[]).map((o,k)=>{const cur=Array.isArray(o)?o[0]:o.cur,cargo=(Array.isArray(o)?o[1]:o.cargo)||{};return{ship:1,id:k+1,cur,next:cur,f:0,task:null,cargo,cd:0}}),
  sites:(d.sites||[]).map(o=>Array.isArray(o)?{x:o[0],y:o[1]}:o),out:d.out||{},stats:d.stats||{sunk:0,raids:0,hist:[]},tax:0,up:0};
 for(const g of GOODS)S.stock[g]=S.stock[g]||0;
 claim.fill(0);findIslands();if(w.fert)fert.set(w.fert);colorTiles();setupLevel();
 if(L.prebuild){S.scratch=!!d.scratch;S.ringV=d.ringV||0;startSet();S.limit=d.limit||0;S.ev=d.ev||0;S.war=d.war||0;S.autoBuy=d.autoBuy!==false;S.tiles=w.t.slice();colorTiles();RESTORING=true;try{L.prebuild()}finally{RESTORING=false}S.base0=S.tiles.slice();
  for(let k=0;k<(d.ch||[]).length;k+=2){const i=d.ch[k];if(!S.b[i]){S.tiles[i]=d.ch[k+1];tcolSet(i)}}
  Object.assign(S,d.x||{});if(S.freeEnd){S.fair=1;if(S.capEnd&&S.t<freeCapT())S.capEnd=0;if((S.freeP||0)<FREEPLAY&&!S.capEnd)S.freeEnd=0}if(S.freeEnd&&!fullGame())spd=0;if(ECO().bread&&S.breadAt==null)S.breadAt=S.t+YEAR;g2Init(1);setTimeout(tierMig,0);setTimeout(()=>{if(S&&(S.htiers||S.hey)){for(const o of S.list)if(o.h&&o.t==='house'){const k=o.x+','+o.y;if(S.htiers&&S.htiers[k])o.tier=S.htiers[k];if(S.hey&&S.hey[k])o.ey=S.hey[k]}GV++}},0);if(d.x&&d.x.histU0==null)S.histU0=0;if(L.y1857)setTimeout(()=>{if(S){railIndex();GV++}},0);S.prest=d.prest||0;S.ringDone=d.ringDone||0;S.wallGone=d.wallGone||[];S.slump=d.slump||0;S.wallsDone=d.wallsDone||0;
  {const gone=new Set(S.wallGone);for(const q of S.list.filter(q=>q.t==='bastion'&&gone.has(q.x*1000+q.y))){for(const[fx,fy]of footTiles(q.t,q.x,q.y))S.b[fy*W+fx]=null;S.list.splice(S.list.indexOf(q),1)}}
  /* a building of the player's takes its spot from anything the prebuilt city lays there now, except the Ring and the rivers: a building
     that stands on Vienna's Ring or right beside it, where the Ring now runs, or in a river or on its bank where the river now flows, is
     cleared and its cost paid back, so the boulevard stays whole and nothing hangs over the water; a landmark moves to the nearest free
     spot by its real site instead, with the work done on it; a street that now lies in a river is left out (a bridge takes it across) */
  /* a landmark that has since grown to a lot nearer its real size (Vienna's great churches and Ring buildings) may no longer fit the corner
     a saved city gave it: it slides by up to its growth onto free ground over its old lot, or else moves to the nearest free ground, or is paid back */
  const GROWN={stephan:6,votiv:5,rathaus:6,karls:6,parlament:6,museen:8},own=new Map();
  if(L.y1857)for(const q of list){if(!q.t||!B[q.t]||B[q.t].hist)continue;for(const[fx,fy]of footTiles(q.t,q.x,q.y))if(inb(fx,fy)){const j=fy*W+fx;own.set(j,(own.get(j)||0)+1)}}
  const grownFits=(q,x,y,mine)=>footTiles(q.t,x,y).every(([fx,fy])=>{if(!inb(fx,fy))return false;const j=fy*W+fx,ob=S.b[j];return(own.get(j)||0)===(mine.has(j)?1:0)&&!(ob&&!ob.h)&&S.tiles[j]!==WATER&&!nearRing(j)});
  let paid=0;const moved=[];for(const q of list){if(!q.t||B[q.t].hist)continue;
   if(L.y1857&&GROWN[q.t]&&(B[q.t].foot||1)>GROWN[q.t]){const mine=new Set(footTiles(q.t,q.x,q.y).filter(([fx,fy])=>inb(fx,fy)).map(([fx,fy])=>fy*W+fx));
    if(!grownFits(q,q.x,q.y,mine)){const g=B[q.t].foot-GROWN[q.t];let fit=null;for(let dy=-g;dy<=0&&!fit;dy++)for(let dx=-g;dx<=0;dx++)if(grownFits(q,q.x+dx,q.y+dy,mine)){fit=[q.x+dx,q.y+dy];break}
     for(let r=1;r<=24&&!fit;r++)for(let dy=-r;dy<=r&&!fit;dy++)for(let dx=-r;dx<=r;dx++)if(Math.max(Math.abs(dx),Math.abs(dy))===r&&grownFits(q,q.x+dx,q.y+dy,mine)){fit=[q.x+dx,q.y+dy];break}
     if(fit){if(Math.max(Math.abs(fit[0]-q.x),Math.abs(fit[1]-q.y))>g)moved.push(B[q.t].n);q.x=fit[0];q.y=fit[1]}else{for(const gd in B[q.t].cost||{})S.stock[gd]=(S.stock[gd]||0)+B[q.t].cost[gd];paid++;continue}}}
   const qd=B[q.t],qt=footTiles(q.t,q.x,q.y).filter(([fx,fy])=>inb(fx,fy)).map(([fx,fy])=>fy*W+fx);
   /* the Stadtpark's lot now lies opposite the Kursalon: what a saved city had built there gives way to it, as on the Ring's ground */
   const onSP=j=>S.b[j]&&S.b[j].t==='stadtpark';
   if(L.ringOct&&q.t==='road'&&qt.some(j=>S.tiles[j]===WATER||onSP(j)))continue;
   if(L.ringOct&&q.t!=='road'&&q.t!=='bridge'&&!qd.tool&&qt.some(j=>nearRing(j)||onSP(j)||qd.on!=='coast'&&(S.tiles[j]===WATER||QUAY&&QUAY[j]<.6))){
    const le=qd.lm&&lmEntry(q.t),mv=le&&placeNear(q.t,le.lat,le.lon,30);if(mv){if(q.bld){mv.bld=q.bld;mv.bld0=q.bld0}mv.cond=q.cond;moved.push(qd.n);continue}
    for(const g in qd.cost||{})S.stock[g]=(S.stock[g]||0)+qd.cost[g];paid++;continue}
   for(const[fx,fy]of footTiles(q.t,q.x,q.y)){const ob=inb(fx,fy)&&S.b[fy*W+fx];if(ob&&ob.h)removeObj(ob)}const o=place(q.t,q.x,q.y,q.r,true);if(q.t==='house'){o.lvl=q.lvl||1;o.pop=q.pop||0}if(q.bld){o.bld=q.bld;o.bld0=q.bld0}if(q.lk)o.lk=Array.isArray(q.lk)?q.lk.slice():q.lk;if(q.route)o.route=q.route;o.cond=q.cond;if(q.up2)o.up2=1;if(q.tier)o.tier=q.tier;if(q.ey)o.ey=q.ey;if(q.fy)o.fy=q.fy;if(q.wr)o.wr=q.wr}
  if(S.ringDone)applyRing();wetCorners();if(paid)setTimeout(()=>toast(`🛤️ The Ring and the Wien run on their real lines now. ${paid===1?'One of your buildings':paid+' of your buildings'} stood in their way: cleared and paid back`),1500);if(moved.length)setTimeout(()=>toast(`🏗️ ${moved.join(' and ')} moved a little, off the Ring's line, with the work done on ${moved.length>1?'them':'it'}`),1600);
  const rh=S.list.find(o=>o.t==='market')||S.list.find(o=>o.t==='stephan');S.mainComp=comp[rh.y*W+rh.x];recompute();const sd=S.list.find(o=>o.t==='stephan')||rh;Z=.35;centerOn(sd.x+3,sd.y+3);gGV=-1;
  /* a city loaded: two quiet minutes too before the next card, whatever came due while it was away */
  ATT=Math.max(ATT,performance.now()+120000);QUIET0=performance.now()+120000;return true}
 for(const q of list){if(!q.t)continue;const o=place(q.t,q.x,q.y,q.r,true);if(q.t==='house'){o.lvl=q.lvl||1;o.pop=q.pop||1}}
 const k=S.list.find(o=>o.t==='kontor'&&!o.r);if(lvl!=='isles')S.mainComp=comp[k.y*W+k.x];recompute();
 if(!S.rv)initRival();
 Z=.9;centerOn(k.x,k.y);
 if(!d.v)setTimeout(()=>toast('New: houses and workshops now need roads to your warehouse or a market'),400);
 return true}catch(e){console.error(e);return false}}
const encode=d=>'NS3-'+btoa(unescape(encodeURIComponent(JSON.stringify(d))));
/* short save codes: compressed and URL-safe */
async function packCode(d){const json=JSON.stringify(d);if(window.CompressionStream){try{const cs=new CompressionStream('deflate-raw'),w=cs.writable.getWriter();w.write(new TextEncoder().encode(json));w.close();
 const buf=new Uint8Array(await new Response(cs.readable).arrayBuffer());let bin='';for(let i=0;i<buf.length;i+=8192)bin+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return'RS1-'+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(e){}}return encode(d)}
async function unpackCode(c){c=(c||'').replace(/[\s\u200b]+/g,'').replace(/[‐-―−]/g,'-');const m=c.match(/RS1-([A-Za-z0-9_-]+)/);if(m){try{let b=m[1].replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 const ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(u);w.close();return JSON.parse(await new Response(ds.readable).text())}catch(e){return null}}return decode(c)}
let CLOUD=null;const cloudReady=async()=>false;async function cloudSave(){return false}
async function cloudLoad(){return null}
function decode(c){c=(c||'').trim().replace(/\s+/g,'');const m=c.match(/NS3-([A-Za-z0-9+/=]+)/);if(!m)return null;try{return JSON.parse(decodeURIComponent(escape(atob(m[1]))))}catch(e){return null}}
async function copyText(t,ta){try{await navigator.clipboard.writeText(t);return true}catch(e){}
 try{ta.focus();ta.select();ta.setSelectionRange(0,t.length);return document.execCommand('copy')}catch(e){return false}}
async function showSave(){if(!S)return;setMode(null);const ok=await save(true),code=await packCode(snapshot());
 const when=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
 ov(`<h2>💾 Game saved</h2>
 <p>${ok?`Saved at ${when}.`:'Automatic saving isn\'t available where this game is open, so copy this save code and keep it somewhere safe, like Notes.'}</p>
 <p class="m" style="margin-top:10px">${ok?'For extra safety, you can also keep this save code. Paste it back with <b>Load a save code</b> on the start screen.':'To continue later, open the game, tap <b>Load a save code</b> and paste it in.'}</p>
 <textarea id="codeBox" readonly rows="4" style="width:100%;margin-top:8px;font:12px ui-monospace,Menlo,monospace;background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;resize:none;user-select:text;-webkit-user-select:text">${code}</textarea>
 <div class="btns"><button class="${ok?'':'pri'}" id="codeCopy">Copy save code</button>${navigator.share?'<button id="codeShare">Share…</button>':''}<button class="${ok?'pri':''}" id="ovOk">Back to the city</button></div>`);
 $('#ovOk').onclick=closeOv;
 $('#codeCopy').onclick=async()=>toast(await copyText(code,$('#codeBox'))?'Save code copied':'Press and hold the code to copy it');
 if(navigator.share)$('#codeShare').onclick=()=>navigator.share({title:`${L.name} save`,text:code}).catch(()=>{})}
function showLoadCode(fromStart){ov(`<h2>Load a save code</h2><p class="m">Paste the code you copied from 💾 Saved games. It starts with RS1- (or NS3- for older codes).</p>
 <textarea id="codeIn" rows="5" placeholder="RS1-… or NS3-…" style="width:100%;margin-top:8px;font:12px ui-monospace,Menlo,monospace;background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;resize:none;user-select:text;-webkit-user-select:text"></textarea>
 <div class="btns"><button class="pri" id="codeLoad">Load game</button>${navigator.clipboard&&navigator.clipboard.readText?'<button id="codePaste">Paste</button>':''}<button id="codeBack">Back</button></div>`);
 if($('#codePaste'))$('#codePaste').onclick=async()=>{try{$('#codeIn').value=await navigator.clipboard.readText()}catch(e){toast('Press and hold in the box to paste')}};
 $('#codeLoad').onclick=async()=>{const raw=$('#codeIn').value;if(!/(RS1|NS3)-/.test(raw))return toast('No save code found. It should start with RS1- or NS3-');const d=await unpackCode(raw);if(!d)return toast("That code is incomplete or damaged. Copy it again in one piece");if(!restore(d))return toast("This save could not be loaded");closeOv();save(true);toast('Your game is loaded')};
 $('#codeBack').onclick=()=>fromStart?showStart():closeOv()}
$('#saveBtn').onclick=()=>showGames();
/* the bottom tabs: Build, City, Walk, speed and More; City and More open small sheets that close on a tap outside */
function sheet(id){for(const el of document.querySelectorAll('.sheet'))el.hidden=el.id!==id||!el.hidden;$('#tCity').classList.toggle('on',!$('#shCity').hidden);$('#tMore').classList.toggle('on',!$('#shMore').hidden)}
$('#tCity').onclick=()=>{barOpen(false);sheet('shCity')};$('#tMore').onclick=()=>{barOpen(false);sheet('shMore')};
$('#tWalk').onclick=()=>{sheet(null);barOpen(false);setMode(null);$('#zWk').click()};
for(const el of document.querySelectorAll('.sheet'))el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;b.classList.remove('newb');setTimeout(()=>sheet(null),0)});
document.addEventListener('pointerdown',e=>{if(e.target.closest&&(e.target.closest('.sheet')||e.target.closest('#tCity')||e.target.closest('#tMore')))return;if(document.querySelector('.sheet:not([hidden])'))sheet(null)},true);
/* buttons arrive as the city needs them: City and Research from the start (to see what is coming), Trade when goods pile up, City Hall with the first letter or law, Walk from the start. A city further on shows all */
const UIK={res:['tCity','resBtn'],trade:['tCity','tradeBtn'],hall:['tCity','hallBtn'],walk:['tWalk']};
function uiTick(){if(!S)return;{const hb=$('#hallBtn'),hl=HALLB();let lb=hb.querySelector('span');if(!lb){hb.textContent='';lb=document.createElement('span');hb.prepend(lb)}if(lb.textContent!==hl)lb.textContent=hl}const own=S.list.filter(o=>!o.h&&!o.r&&o.t!=='road').length;
 /* Walk is there from the start (it had come and gone with the save it was loaded from); a tab that opens is saved at once */
 if(!S.ui)S.ui=!L.y1857||S.t>yT(1866,6)?{res:1,trade:1,hall:1,walk:1}:{b0:own,walk:1};const u=S.ui,c=cap(),fresh=[];u.walk=1;u.res=1;
 const on={res:()=>resAvail().length>0,trade:()=>GOODS.some(g=>S.stock[g]>=c*.6),hall:()=>MSG.length>0||!$('#msg').hidden||QUESTS.some(q=>S.q&&S.q[q.id]&&!q.quiet)||lawsAvail()>0||S.t>=yT(1867,1),walk:()=>own>=(u.b0||0)+4||Z>=2};
 for(const k in on)if(!u[k]&&on[k]()){u[k]=1;fresh.push(k)}
 for(const k in UIK)for(const id of UIK[k]){const el=$('#'+id);if(id==='tCity'){el.hidden=!(u.res||u.trade||u.hall)}else el.hidden=!u[k]}
 for(const k of fresh)for(const id of UIK[k]){const el=$('#'+id);el.classList.add('newb');setTimeout(()=>el.classList.remove('newb'),8000)}if(fresh.length){RESN=-1;setTimeout(()=>save(),300)}}
/* the top bar: date, money and people always in view; a tap opens the rest */
/* big numbers kept short so the three chips fit a phone's width: 10.0M, 700k; the overview has them in full */
const shortN=n=>{const a=Math.abs(n);return a>=1e6?(n/1e6).toFixed(a>=1e8?0:1)+'M':a>=1e4?Math.round(n/1e3)+'k':fmt(n)};
/* the stores at a glance: the goods the city uses now, the short ones red and first */
let STSIG='',RSIG='',NEEDG=new Set(),WHY=[];
let TOPDN=0;const topHeld=()=>TOPDN>0&&performance.now()-TOPDN<1500;
{const t=$('#top'),up=()=>{if(TOPDN)setTimeout(()=>{TOPDN=0},90)};t.addEventListener('pointerdown',()=>{TOPDN=performance.now()});t.addEventListener('pointerup',up);t.addEventListener('pointercancel',()=>{TOPDN=0});t.addEventListener('pointerleave',up);t.addEventListener('click',()=>{TOPDN=0},true)}
/* the top row never cuts a number short: when its chips do not fit, they give up some padding first, then some letter size.
   Measured only when the words or the length of a number change, not at every redraw */
let RFK='';function resFit(el){const k=innerWidth+'|'+el.textContent.replace(/\d/g,'0');if(k===RFK)return;RFK=k;el.classList.remove('t1','t2','t3');for(const c of['t1','t2','t3']){if(el.scrollWidth<=el.clientWidth+1)return;el.classList.add(c)}}
function goodsNeed(){const n=new Set(['food','wood','bricks']);for(const o of S.list){if(o.r||o.h||o.wr)continue;if(o.bld){for(const g in o.bld)if(o.bld[g]>0)n.add(g);continue}const d=B[o.t];if(d.in)n.add(d.in);if(o.t==='house'){if(o.lvl>=2)n.add('beer');if(o.lvl>=2)n.add('cloth');if(o.lvl>=4)n.add('wine')}if(o.t==='kraftwerk')n.add('coal')}return n}
const goodShort=(g,c,n)=>n.has(g)&&steady('s'+g,S.stock[g]<Math.max(3,c*.08));
/* the goods always in one order, building stuff first, so a good stays where the finger found it; and a good once shown stays in the
   strip (STSEEN, for this city), so nothing jumps about as numbers change. A short one only turns red */
const STORD=['wood','bricks','stone','food','grain','beer','wine','wool','cloth','iron','coal','cars'];let STSEEN=new Set(),STSS=null;
function goodsOrder(){if(STSS!==S){STSS=S;STSEEN=new Set()}for(const g of NEEDG)STSEEN.add(g);return STORD.filter(g=>GOODS.includes(g)).concat(GOODS.filter(g=>!STORD.includes(g)))}
let NEEDT=0;let STOPEN=false,STFIT=99,STKEY='',STMEAS=false;
function storesStrip(){const c=cap(),now=performance.now();if(now>NEEDT){NEEDG=goodsNeed();NEEDT=now+2000}const sh=goodsOrder().filter(g=>STOPEN?S.stock[g]>=1||STSEEN.has(g):STSEEN.has(g));
 /* the strip: the goods the city needs; a tap on Stores opens it out to every good in store, in rows, and closes it again;
   a good running short shows in red. The goods sit in the frame of the stores, under a gabled storehouse, so the stores read as
   what holds them and not as one more good. Closed, the strip is one row: as many goods as fit (storesFit), then “+3” for the rest,
   red when one of those runs short */
 if(!STOPEN){const k=innerWidth+'|'+(S.fbT>S.t?1:0)+sh.map(g=>g+shortN(Math.floor(S.stock[g])).length).join();if(k!==STKEY){STKEY=k;STFIT=99;STMEAS=true}}
 const n=STOPEN?sh.length:Math.min(sh.length,STFIT),more=sh.slice(n);
 return`<span class="lager"><b data-st>${WH_SVG}<span>Stores ${STOPEN?'▴':'▾'}</span></b>${sh.slice(0,n).map(g=>`<span data-g="${g}" class="${goodShort(g,c,NEEDG)||g==='food'&&S.fbT>S.t?'low':''}">${ICON[g]} ${shortN(Math.floor(S.stock[g]))}${g==='food'&&S.fbT>S.t?' · buying':''}</span>`).join('')}${more.length?`<b data-more class="${more.some(g=>goodShort(g,c,NEEDG))?'low':''}">+${more.length}</b>`:''}${STOPEN&&!$('#tradeBtn').hidden?'<b data-trade>⚖️ Trade</b>':''}</span>`}
/* how many goods fit in the one closed row: measured once when the goods or the length of their numbers change, not at every redraw */
function storesFit(el){if(STOPEN||!STMEAS)return false;STMEAS=false;const lg=el.querySelector('.lager');if(!lg)return false;const R=lg.getBoundingClientRect().right-6,gs=lg.querySelectorAll('[data-g]');
 if(!gs.length||gs[gs.length-1].getBoundingClientRect().right<=R)return false;let n=0;for(const g of gs){if(g.getBoundingClientRect().right>R-(gs.length-n>10?42:34))break;n++}STFIT=n;return true}
const WH_SVG='<svg viewBox="0 0 18 15" aria-hidden="true"><path d="M1.5 6.5 9 1.5l7.5 5V14h-15z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 14V9h6v5M6 9l6 5M12 9l-6 5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
/* a good tapped in the strip: how many there are, and the way to more (build what makes it, taken straight to a spot, or buy it) */
/* what each farm and workshop of the food chain gives, and where a good comes from ("what food?") */
const WHAT={garden:'cabbage, potatoes, onions and carrots',farm:'milk, eggs and meat',fisher:'fish',mill:'wheat and rye into flour',bakery:'rye loaves, Kaisersemmeln, Kipferl, Salzstangerl and pretzels',fleischer:'beef, pork and sausages',roester:'roasted coffee',tischler:'chairs, tables and cupboards',porzellan:'painted cups and plates'};
const whatOf=k=>k==='grainf'?(ECO().bread?'wheat and rye for the mills, barley for the breweries':''):WHAT[k]||'';
function goodFrom(g){if(g==='flour')return'from mills, which grind the grain farms\' wheat and rye';const ks=g==='food'?['garden','farm'].concat(cnt('fisher')?['fisher']:[]):g==='bread'?['bakery']:GX[g]?[GX[g][0]]:[];
 const pl=k=>GXK[k]?B[k].n.toLowerCase()+'s':B[k].n.toLowerCase().replace(/(farm|garden|mill|bakery|fisher)$/,m=>({farm:'farms',garden:'gardens',mill:'mills',bakery:'bakeries',fisher:'fishers'})[m]);
 return ks.length?'from '+ks.map(k=>`${pl(k)} (${WHAT[k]})`).join(ks.length>2?', ':' and '):''}
/* the stores card (a tap on the strip): every good with how many are in store and how full its store is; a good tapped in the strip
   or in the card is marked, with where it comes from and the way to more */
function showStores(sel){const st=S.stock,c=cap();NEEDG=goodsNeed();setMode(null);const f=sel?goodFrom(sel):'',n=sel?Math.floor(st[sel]||0):0;
 ov(`<h2>Stores</h2><p class="m">Each good has room for ${c}. Tap a good to see more.</p><div class="gbar big">${goodsOrder().map(g=>`<div data-sg="${g}" class="${goodShort(g,c,NEEDG)?'low':''}${g===sel?' sel':''}"><span>${ICON[g]||''} ${cap1(g)}<b>${Math.floor(st[g])} / ${c}</b></span><i><b style="width:${Math.min(100,Math.round(st[g]/c*100))}%"></b></i></div>`).join('')}</div>
 ${sel?`<p>${ICON[sel]||''} <b>${cap1(sel)}</b>: ${n<1?'none left':n>=c?'the store is full':`${n} of ${c}, ${Math.round(n/c*100)}% full`}${f?`. It comes ${f}`:''}.</p>`:''}
 <div class="btns">${sel?'<button class="pri" id="stMore">How to get more</button>':''}<button${sel?'':' class="pri"'} id="stOk">Close</button></div>`);
 $('#stOk').onclick=closeOv;if(sel)$('#stMore').onclick=()=>{closeOv();goodTip(sel)};document.querySelectorAll('[data-sg]').forEach(d=>d.onclick=()=>showStores(d.dataset.sg))}
function goodTip(g){const n=Math.floor(S.stock[g]||0),f=goodFrom(g),t=(n<1?`No ${g} left`:`${cap1(g)}: ${n} in store`)+(f?`, ${f}`:'');setMode(null);if(!lackShow(g,t))toast(`${ICON[g]||''} ${t}`)}
/* the smiley tapped: why people are unhappy, each reason with a way to help */
/* the people card (a tap on the people or the mood in the top bar): how many live here and whether the city grows, and why; the mood,
   how the people share into happy and unhappy, and every trouble with what it costs and a button that helps */
function hapShow(){const hp=Math.round((S.hap??1)*100),m=S.mult||1;WHY=hapWhy(6,.005);const GOODL=hapGood(),gs=GOODL.reduce((a,q)=>a+q.p,0);
 let n=0,room=0,sad=0,pH=0,pM=0,pL=0,P=0;for(const o of S.list){if(o.t!=='house'||o.h||o.r||o.bld)continue;n++;room+=Math.max(0,maxPop(o)-o.pop);const h=o.hap??1;if(h<.45&&o.pop>1)sad++;P+=o.pop;if(h>=.7)pH+=o.pop;else if(h>=.5)pM+=o.pop;else pL+=o.pop}
 const pc=v=>P?Math.round(v/P*100):0,g=[];
 if(!n)g.push('➡ Nobody lives here yet. Build homes.');
 else if(S.stock.food<=.5)g.push('⬇ <b class="no2">Shrinking</b>: there is no food, so people leave.');
 else if(room>0)g.push(`⬆ <b class="ok">Growing</b>: people move into the free homes. There is room for ${fmtPop(Math.round(room*m))} more.`);
 else g.push('➡ <b>Not growing</b>: all homes are full. Build more homes, or build homes higher.');
 if(S.newc>=1)g.push(`🧳 ${fmtPop(Math.round(S.newc*m))} people have no home yet.`);
 if(sad)g.push(`⬇ People leave ${fmt(sad)} very unhappy ${sad>1?'homes':'home'} (below 45%).`);
 ov(`<h2>👥 People ${fmtPop(dispPop())}</h2>${g.map(t=>`<p class="ppl">${t}</p>`).join('')}
 <h2 style="margin-top:14px">${hp>=70?'😊':hp>=50?'😐':'☹️'} Happiness ${hp}%</h2>
 ${P?`<div class="hbar"><i class="h1" style="flex:${pH}"></i><i class="h2" style="flex:${pM}"></i><i class="h3" style="flex:${pL}"></i></div><p class="m hleg"><span>😊 happy ${pc(pH)}%</span><span>😐 so-so ${pc(pM)}%</span><span>☹️ unhappy ${pc(pL)}%</span></p>`:''}
 ${WHY.length?`<p class="finH">What troubles the people</p>`+WHY.map((w,k)=>`<div class="why"><span>${w.t}<small>costs about ${w.p<1?'less than 1':w.p}% happiness</small></span>${w.b?`<button data-why="${k}">${w.b[0]}</button>`:''}</div>`).join(''):'<p class="m">Nothing troubles the people much right now.</p>'}
 ${GOODL.length?`<p class="finH">What pleases the people</p>`+GOODL.map(q=>`<div class="why"><span>${q.t}<small>adds about ${q.p}% happiness</small></span></div>`).join('')+(WHY.length?`<p class="m">These add about ${gs}% together. That is why happiness is ${hp}% though some needs are not met.</p>`:''):''}
 ${L.y1857&&P?(mx=>`<p class="finH">Where your people were born</p><div class="hbar">${mx.map((q,i)=>`<i class="w${i+1}" style="flex:${q[1]}"></i>`).join('')}</div><p class="m bleg">${mx.map((q,i)=>`<span><i class="wk w${i+1}"></i>${q[0]} <b>${q[1]}%</b></span>`).join('')}</p><p class="m">About as in the real Vienna of ${Math.floor(histYr())}. Most Viennese came from somewhere else, or their parents did.</p>`)(bornMix(histYr())):''}
 <p class="m" style="margin-top:10px">${L.y1857?'Happy people pay more taxes. ':''}People leave a home when it is below 45%. Tap a home to see what it needs.</p>
 <div class="btns"><button class="pri" id="ovOk">Close</button></div>`);
 $('#ovOk').onclick=closeOv;document.querySelectorAll('[data-why]').forEach(b=>b.onclick=()=>{closeOv();WHY[+b.dataset.why].b[1]()})}
/* where the people of Vienna were born, of each hundred. The city itself and Bohemia, Moravia and Silesia follow the counts of 1856,
   1880, 1900 and 1910 (the Bohemian share of 1880 is not known and lies on the line between 1856 and 1900), the years between on a
   straight line. The others share what is left as they stood about 1900: Lower Austria 11, the other Alpine lands 4, the lands of the
   Hungarian crown 8, Galicia and Bukovina 6, abroad (most from the German states) 2 */
const BORN=[[[1856,44],[1880,38.5],[1900,46],[1910,48]],[[1856,22.5],[1900,25.5],[1910,23]]],
 BORNR=[['Lower Austria',11],['Alpine lands',4],['Hungary',8],['Galicia, Bukovina',6],['Abroad',2]];
function bornMix(y){const at=a=>{if(y<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(y<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(y-a[i-1][0])/(a[i][0]-a[i-1][0]);return a[a.length-1][1]},v=Math.round(at(BORN[0])),b=Math.round(at(BORN[1])),r=100-v-b,
 out=[['Vienna',v],['Bohemia, Moravia',b]];let left=r;for(const[n,w]of BORNR){const p=n==='Abroad'?left:Math.round(r*w/31);out.push([n,p]);left-=p}return out}
/* what lifts the mood beyond the needs of the homes, as the happiness round adds it (extTick), in percent of all the people */
function hapGood(){const l=LAW(),r=RES(),w=monthOf(S.t)===11||monthOf(S.t)<=1,G={},add=(t,v)=>{G[t]=(G[t]||0)+v};let P=0;
 for(const o of S.list){if(o.t!=='house'||o.h||o.bld||o.r||!o.pop)continue;P+=o.pop;const a=o.y*W+o.x,cv=k=>COV[k]&&COV[k][a];
  if(l.bauordnung)add('🏛️ The building code',o.pop*.08);if(l.schule)add('🎓 The school law',o.pop*.04);if(l.kinder)add('🧒 The child labour law',o.pop*.05);if(l.sonntag&&o.lvl<=2)add('⛪ The free Sunday',o.pop*.1);
  if(S.taxR==='low')add('🪙 Low taxes',o.pop*.05);if(S.good>S.t)add('📰 Good news',o.pop*.08);if(r.landsteiner&&cv('hosp'))add('🏥 The modern hospital',o.pop*.1);
  if(cv('tram'))add('🚋 The tramway',o.pop*.08);if(cv('rail'))add('🚂 The railway',o.pop*.06);if(cv('rink'))add('⛸️ The ice rink',o.pop*(w?.1:.04));if(cv('ride')&&o.lvl>=5)add('🐎 The riding school',o.pop*.08)}
 return P?Object.entries(G).map(([t,v])=>({t,p:Math.round(v/P*100)})).filter(q=>q.p>=1).sort((a,b)=>b.p-a.p):[]}
/* the tax rate: what it does to the rent tax and to the mood of every home */
const TAXR={low:[.85,.05],normal:[1,0],high:[1.25,-.08]},TAXN={low:'Low',normal:'Normal',high:'High'},
 TAXD={low:'Low taxes: less money, happier people.',normal:'Normal taxes.',high:'High taxes: more money, less happy people.'};
/* the laws in three groups, to see at a glance: those in force (green, a small Repeal), those that can be enacted now (a gold Enact
   with the price, greyed when the treasury is short), and those still to come, a short line each with the year */
function lawList(l,yr){const row=([k,n,y,c,pro,con],on)=>`<div class="law${on?' on':''}"><div class="lh"><b>${on?'✅ ':''}${n}</b>${on?`<button data-l="${k}">Repeal</button>`:`<button class="pri" data-l="${k}" ${S.stock.gold<c?'disabled':''}>Enact · ${money(c)}</button>`}</div><span class="ok">✔ ${lawFx(pro)}</span><br><span class="no2">✘ ${lawFx(con)}</span></div>`;
 const inF=LAWS.filter(q=>l[q[0]]),can=LAWS.filter(q=>!l[q[0]]&&yr>=q[2]),later=LAWS.filter(q=>!l[q[0]]&&yr<q[2]);
 return`<h3 style="margin:8px 0 4px">Laws</h3>${inF.length?`<p class="m lawg">In force</p>${inF.map(q=>row(q,1)).join('')}`:''}${can.length?`<p class="m lawg">Ready to enact</p>${can.map(q=>row(q,0)).join('')}`:''}
 ${later.length?`<p class="m lawg">Later</p>${later.map(([k,n,y])=>`<p class="m lawl">🔒 ${n} · from ${y}</p>`).join('')}`:''}`}
/* the coin tapped: the money only, where it comes from and goes, the tax rate, and the ways to more when it runs short */
/* the money that moved besides the rates: counted as it goes (CU), per minute in S.flow */
const CU=()=>S.cu||(S.cu={b:0,f:0,s:0,l:0});
/* the city's running balance a minute: rent and visitors, and goods the stores sell by themselves, less upkeep, the materials the builders buy for what is being
   built (a monument's site can eat all the income for years, and the player must see that), emergency food and the loan's repayments.
   The price paid once to place a building, plots sold once and goods sold by hand are left out; the
   treasury's own change (S.net) still holds them */
function runNet(){if(!L||!L.y1857||S.net==null)return S.net!=null?S.net:S.rate;const fl=S.flow||{b:0,f:0,s:0,l:0};return(S.tax||0)+(S.tour||0)+(fl.s||0)-(S.up||0)-(fl.b||0)-(fl.f||0)-(fl.l||0)}
/* the card in three tabs: Overview (the treasury, the balance a minute, how long the money lasts and the one best step), In & out (each
   line of money in and out, and what building cost apart from it), Taxes. The tab stays chosen while the card is redrawn */
let FINTAB='o';
/* the taxes of a minute at tax level k, from the taxes now (S.tax): the level's own factor, and in Vienna the mood too, which the level
   moves and which the taxes follow. The fixed costs taken off the taxes (the school law, the regiments) stay as they are */
function taxAt(k){const c=S.taxR||'normal',ded=(LAW().schule?20:0)+(S.emp&&S.emp.regs?S.emp.regs*12:0),hf=h=>L&&L.y1857?.55+.45*Math.max(0,Math.min(1,h)):1,h0=S.hap??1;
 return((S.tax||0)+ded)*TAXR[k][0]/TAXR[c][0]*hf(h0+TAXR[k][1]-TAXR[c][1])/hf(h0)-ded}
function showFinances(tab){if(tab)FINTAB=tab;const st=S.stock,r0=Math.round(runNet()),r=mn(r0),tr=S.taxR||'normal',short=st.gold<1000||r<0;
 const fl=S.flow||{b:0,f:0,s:0,l:0};
 const sg=v=>`${Math.round(v)>0?'+':Math.round(v)<0?'−':''}${money(Math.round(Math.abs(v)),1)}`;
 const line=(ic,t,v,always)=>!always&&!v?'':`<tr><td>${ic} ${t}</td><td class="${v>=0?'ok':'no2'}">${sg(v)}</td></tr>`;
 const cur=CUR(),curWhy=cur==='fl.'?'fl. means gulden (also called florin), the money of Austria.':cur==='Kr.'?'Kr. means krone, the money of Austria since 1892. One gulden became two kronen.':'';
 let body='';
 if(FINTAB==='i'){
  /* three parts: the income with its sum below it, the expenses with theirs, and the trend (what is left of the two) set apart below
     them. Every line is rounded first, so the sums on the card add up exactly */
  const ti=[S.tax||0,(S.tour||0)-(S.bkI||0),fl.s||0,S.bkI||0].map(Math.round),to=[S.up||0,fl.f||0,fl.l||0,fl.b||0].map(Math.round),si=ti[0]+ti[1]+ti[2]+ti[3],so=to[0]+to[1]+to[2]+to[3],exact=!!(L&&L.y1857),tot=exact?si-so:r0;
  const inc=line('🏠','Rent from homes',ti[0],1)+line('🏦','Bank interest',ti[3])+line('🎟️','Visitors',ti[1])+line('⚖️','Goods sold',ti[2]);
  const out=line('🔧','Upkeep',-to[0],1)+line('🏗️','Building sites',-to[3])+line('🥕','Emergency food',-to[1])+line('🏦','Loan repayment',-to[2]);
  body=`<p class="finH">Each minute</p>
  <div class="finIO"><div class="finB"><div class="finBh">Income</div><table class="stat finT">${inc}<tr class="finTot"><td>Total</td><td class="ok">${sg(si)}</td></tr></table></div>
  <div class="finB"><div class="finBh">Expenses</div><table class="stat finT">${out}<tr class="finTot"><td>Total</td><td class="${so?'no2':''}">${sg(-so)}</td></tr></table></div></div>
  <div class="finSum${tot<0?' neg':''}"><span>Trend</span><b class="${tot>=0?'ok':'no2'}">${sg(tot)}</b></div>
  ${S.loan>0?`<p class="m">🏦 Loan still to repay: ${money(Math.ceil(S.loan),1)}</p>`:''}`}
 else if(FINTAB==='t'){
  body=`<p class="m" style="margin:2px 0 8px">Every home pays you rent tax. Higher taxes bring more money, but make people less happy.</p>
  <div class="finTabs">${['low','normal','high'].map(k=>`<button data-tax="${k}" class="${tr===k?'on':''}">${TAXN[k]}</button>`).join('')}</div>
  <p class="finH">With ${fmt(dispPop())} people, each minute</p>
  <table class="stat finT taxT">${['low','normal','high'].map(k=>{const v=taxAt(k),d=Math.round(v)-Math.round(taxAt(tr)),h=Math.round((TAXR[k][1]-TAXR[tr][1])*100);
   return`<tr class="${tr===k?'on':''}"><td>${TAXN[k]}</td><td>${h?`${h>0?'+':'−'}${Math.abs(h)}% happy`:''}</td><td class="${d<0?'no2':'ok'}">${tr===k?'now':sg(d)}</td><td><b>${sg(v)}</b></td></tr>`}).join('')}</table>`}
 else{
  const gs=money(st.gold,1),rs=sg(r0),rr=runNet();
  body=`<div class="finTiles"><div><span>Treasury</span><b class="${gs.length>10?'sm':''}">${gs}</b></div><div class="${r<0?'neg':''}"><span>Trend<i>each minute</i></span><b class="${r>=0?'ok':'no2'}${rs.length>10?' sm':''}">${rs}</b></div></div>
  ${curWhy?`<p class="finCur">${curWhy}</p>`:''}
  <p class="finH">${short?'Ways to more money':'More money'}</p>
  <div class="finWays">${rr<0&&tr==='low'?`<div class="why"><span>${coinSvg()} Set taxes back to Normal</span><button data-tax="normal">Normal</button></div>`:''}
  <div class="why"><span>🏠 Build more homes</span><button data-fin="plot">Build</button></div>
  ${tr!=='high'?`<div class="why"><span>${coinSvg()} Raise the taxes</span><button data-ftab="t">Taxes</button></div>`:''}
  ${(u=>`<div class="why"><span>⬆️ Upgrade homes<small>${u.n?`${u.n} can be upgraded: about ${sg(Math.max(1,u.g))} each minute`:'No home can be upgraded now'}</small></span>${u.n?'<button data-fin="up">Show</button>':''}</div>`)(raiseGain())}
  <div class="why"><span>⚖️ Sell goods</span><button data-fin="trade">Trade</button></div>
  ${S.loan>0?`<div class="why"><span>🏦 Loan to repay: ${money(Math.ceil(S.loan),1)}</span></div>`:'<div class="why"><span>💰 Borrow money</span><button data-fin="loan">Loan</button></div>'}
  ${S.autoBuy!==false&&fl.b>40?'<div class="why"><span>🧱 Builders buy materials at +20%</span><button data-fin="nobuy">Stop buying</button></div>':''}</div>`}
 ov(`<h2>${coinSvg()} Finances</h2>
 <div class="finTabs">${[['o','Overview'],['i','In & out'],['t','Taxes']].map(([k,n])=>`<button data-ftab="${k}" class="${FINTAB===k?'on':''}">${n}</button>`).join('')}</div>
 ${body}
 <div class="btns"><button class="pri" id="ovOk">Close</button></div>`);$('#ovOk').onclick=closeOv;
 document.querySelectorAll('[data-ftab]').forEach(b=>b.onclick=()=>{sfx('click');showFinances(b.dataset.ftab)});
 document.querySelectorAll('[data-tax]').forEach(b=>b.onclick=()=>{S.taxR=b.dataset.tax;sfx('click');toast(`🪙 ${TAXD[S.taxR]}`);showFinances()});
 document.querySelectorAll('[data-fin]').forEach(b=>b.onclick=()=>{closeOv();const k=b.dataset.fin;if(k==='plot'){setMode('house');findSpot()}else if(k==='nobuy'){S.autoBuy=false;toast('🧱 Builders now wait for your own bricks and timber')}else if(k==='up'){const u=raiseGain().first;if(u){if(window.deskClose)window.deskClose();setMode(null);jumpTo(u.x+1,u.y+1);openInfo(u)}}else lackTrade(k==='loan'?'gold':'')})}
/* why people are unhappy: the biggest losses in the happiness sum, each with a way to help */
function hapWhy(max=3,min=.015){const L_={},add=(k,v,t,b)=>{const q=L_[k]||(L_[k]={v:0,n:0,t,b});q.v+=v;q.n++;return q};let P=0,smo=null,sv=0;const r=RES();
 const bl=k=>B[k]?[`${B[k].i} Build ${anA(B[k].n.toLowerCase())}`,()=>lackGo(k)]:null;
 for(const o of S.list){if(o.t!=='house'||o.h||o.bld||o.r||!o.pop)continue;P+=o.pop;const n=houseNeeds(o);let tw=0;for(const q of n)tw+=q[3]||1;
  for(const q of n)if(!q[0]){const nm=q[1].replace(/,.*/,''),gd=/^(food|beer|clothing|wine)$/.test(nm);add('n'+q[2],o.pop*(q[3]||1)/tw,gd?`not enough ${nm}`:`no ${nm.replace(/^an? /,'').replace(/ nearby$/,'')}${/^an? /.test(nm)?' nearby':''}`,bl(q[2])).o=o}
  const f=o.lvl>=4?.09:.05,sm=Math.min(.35,(SMOKEM&&SMOKEM[o.x+1+(o.y+1)*W]||0)*f);if(sm>.02){add('smoke',o.pop*sm,'factory smoke',null);if(sm>sv){sv=sm;smo=o}}
  if(S.bad>S.t&&o.lvl>=4)add('bad',o.pop*.2,`the wealthy are angry with ${HALLN()}`,null)}
 if(!P)return[];const hs_=homelessShare();if(hs_>.02)add('home',P*Math.min(.25,hs_*.8),'people without homes',bl('house'));
 if(S.epi)add('epi',P*.15,`${S.epi.n} is spreading`,B.spital&&!cnt('spital')?bl('spital'):null);if(S.crime>40)add('crime',P*(S.crime-40)*.002,'crime',B.polizei?bl('polizei'):null);
 if(S.infl>S.t)add('infl',P*.1,'rising prices',null);if(S.taxR==='high')add('tax',P*.08,'high taxes',['🪙 Lower the taxes',()=>{setMode(null);showFinances('t')}]);if(S.war)add('war',P*(S.war===2&&S.ration?.2:.1),S.ration?'the war and rationing':'the war',null);
 if(smo)L_.smoke.b=['📍 Show me',()=>{jumpTo(smo.x+1,smo.y+1);openInfo(smo)}];
 return Object.values(L_).filter(q=>q.v/P>=min).sort((a,b)=>b.v-a.v).slice(0,max).map(q=>{const homes=q.n>1&&!/^(people|the war|rising|crime|.* is spreading)/.test(q.t)?` (${fmt(q.n)} blocks)`:'';
  if(q.o&&!q.b)q.b=['📍 Show me',()=>{jumpTo(q.o.x+1,q.o.y+1);openInfo(q.o)}];return{t:ucf(q.t)+homes,b:q.b,p:Math.round(q.v/P*100)}})}
/* money in the top bar: in thousands on a narrow phone, so the trend beside it stays in view */
const topN=v=>innerWidth<430&&Math.abs(v)>=1000?(v/1e3).toFixed(Math.abs(v)>=1e4?0:1)+'k':shortN(v);
/* the top bar: date, speed, money and its trend, people and their mood (a face and the share, red below half; a tap on it tells why).
   A need that turns critical is told once as it starts (cityWarn), not counted here */
function topBar(){const st=S.stock,r=mn(Math.round(runNet())),hp=Math.round((S.hap??1)*100);
 return`<span class="chip${S.war?' alert':''}">${S.war?'⚔️ ':'<i class="ic">📅 </i>'}${dateStr(S.t).replace(/^\d+ /,'')}</span><span class="chip sp" data-sp role="button" aria-label="Game speed">${spdTxt()}</span><span class="chip" data-money role="button">${coinSvg()} ${NYC()?'$'+topN(st.gold):topN(mn(st.gold))+'<i class="cur"> '+CUR()+'</i>'} <small class="${r>=0?'pos':'neg'}">${r>=0?'▲':'▼'}${Math.abs(r)>=1000?(Math.abs(r)/1e3).toFixed(Math.abs(r)>=1e4?0:1)+'k':Math.abs(r)}<i class="cur">/min</i></small></span><span class="chip pp">👥 ${shortN(dispPop())}<b class="hp${hp<50?' neg':hp<65?' mid':''}" data-hap role="button" aria-label="Happiness">${hp>=70?'😊':hp>=50?'😐':'☹️'} ${hp}%</b></span>`}
function showOverview(){const st=S.stock,c=cap(),r=mn(Math.round(runNet())),hp=Math.round((S.hap??1)*100),al=[];NEEDG=goodsNeed();WHY=hp<65?hapWhy():[];
 if(S.pir)al.push('🏴‍☠️ Pirates are at sea');if(S.strike>S.t)al.push(`✊ Strike until ${dateStr(S.strike)}`);if(S.newc>=1)al.push(`🧳 ${fmtPop(Math.round(S.newc*(S.mult||1)/100)*100)} people without homes`);if(S.epi)al.push(`🦠 ${S.epi.n}: ${fmtPop(Math.round(S.epi.dead*(S.mult||1)/100)*100)} dead`);
 const low=g=>st[g]<1&&['bricks','wood','stone','food'].includes(g);for(const g of GOODS)if(low(g))al.push(`${ICON[g]} No ${g} left`);
 ov(`<h2>${L.name}, ${dateStr(S.t)}</h2>${al.length?`<p class="no2">${al.join('<br>')}</p>`:''}
 <table class="stat"><tr><td>🪙 Treasury</td><td>${money(st.gold,1)}</td></tr><tr><td>Taxes</td><td class="ok">+${money(Math.round(S.tax||0),1)}/min</td></tr><tr><td>Upkeep</td><td class="no2">−${money(Math.round(S.up||0),1)}/min</td></tr>${S.bkI?`<tr><td>Bank interest</td><td class="ok">+${money(Math.round(S.bkI),1)}/min</td></tr>`:''}${S.tour-(S.bkI||0)>=.5?`<tr><td>Visitors</td><td class="ok">+${money(Math.round(S.tour-(S.bkI||0)),1)}/min</td></tr>`:''}<tr><td><b>Net</b></td><td><b>${r>=0?'+':''}${fmt(r)} ${CUR()}/min</b></td></tr>${S.loan>0?`<tr><td>🏦 City loan</td><td>−${money(S.loan,1)}</td></tr>`:''}
 <tr><td>👥 People</td><td>${fmtPop(dispPop())}</td></tr><tr><td>${hp>=75?'😊':hp>=50?'😐':'😠'} Happiness</td><td>${hp}%</td></tr>${L.y1857?`<tr><td>👑 Prestige</td><td>${S.prest||0} vs ${RIVI()} ${RIVAL()} ${bpScore()}</td></tr>`:''}</table>
 ${WHY.length?`<h2 style="margin-top:12px">😠 Why people are unhappy</h2>${WHY.map((w,k)=>`<div class="why"><span>${w.t}</span>${w.b?`<button data-why="${k}">${w.b[0]}</button>`:''}</div>`).join('')}`:''}
 <h2 style="margin-top:12px">Stores <small class="m">(each holds ${c})</small></h2><div class="gbar">${goodsOrder().map(g=>`<div class="${goodShort(g,c,NEEDG)?'low':''}"><span>${ICON[g]} ${cap1(g)}<b>${Math.floor(st[g])}</b></span><i><b style="width:${Math.min(100,Math.round(st[g]/c*100))}%"></b></i></div>`).join('')}</div>
 <p class="m">${['food','bread'].filter(g=>GOODS.includes(g)).map(g=>`${ICON[g]} ${cap1(g)} comes ${goodFrom(g)}.`).join(' ')}</p>
 <div class="btns"><button id="ovStats">📊 Stats</button><button class="pri" id="ovOk">Close</button></div>`);$('#ovOk').onclick=closeOv;$('#ovStats').onclick=()=>{closeOv();$('#statsBtn').click()};document.querySelectorAll('[data-why]').forEach(b=>b.onclick=()=>{closeOv();WHY[+b.dataset.why].b[1]()})}
$('#res').onclick=e=>{if(!S)return;if(e.target.closest('[data-sp]')){spdMenu();return}if(e.target.closest('[data-money]')){setMode(null);showFinances('o');return}if(e.target.closest('.pp')){setMode(null);hapShow();return}if(L.y1857){setMode(null);showOverview()}};$('#stores').onclick=e=>{if(!S||!L.y1857)return;const g=e.target.closest('[data-g]');if(g){showStores(g.dataset.g);return}if(e.target.closest('[data-trade]')){$('#tradeBtn').click();return}if(e.target.closest('[data-st],[data-more]')){STOPEN=!STOPEN;STSIG='';updateUI();return}showStores()};$('#startBtn').onclick=()=>{setMode(null);showStart()};
/* the scene banner: fly there, or walk there (the 3D view sets walkThere) */
/* going there frames the whole scene from a little way off and up (the 3D camera flies to KZ/Z): the burning building with its engines
   and onlookers, the whole march or the robbers' street, the bridge from end to end, the head of a parade */
function sceneView(){const s=S&&S.sc,t=sceneTile();if(!t)return null;let d=130,x=t[0],y=t[1];
 if(s.k==='fire'||s.k==='barnum'||s.k==='w_ringfire')d=95+(s.f||1)*22;else if(s.k==='liberty')d=230;else if(s.k==='bridge'&&s.span)d=90+(s.span.run.length+2)*8;
 else if(s.route&&s.k!=='rob'){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const i of s.route){const a=i%W,b=i/W|0;x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b)}x=(x0+x1)/2;y=(y0+y1)/2;d=90+Math.max(x1-x0,y1-y0)*11}
 else if(s.k==='rob')d=170;else if(UW[s.k])d=110;return[x,y,240/Math.min(1600,d)]}
$('#scnGo').onclick=()=>{sceneGo();if(typeof walkTo==='function'&&walkTo())return;const v=sceneView();if(v)viewAt(v[0],v[1],v[2])};$('#scnNo').onclick=sceneHide;
/* how high the card open at the bottom stands, for the page's style: the scene's message and the errand's sit just above it */
if(typeof ResizeObserver==='function'){const ps=[...document.querySelectorAll('.panel')],ro=new ResizeObserver(()=>{let h=0;for(const p of ps)if(!p.hidden)h=Math.max(h,p.offsetHeight);document.body.style.setProperty('--cardH',h+'px')});ps.forEach(p=>ro.observe(p))}

setInterval(save,15000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});

/* ---------- loop ---------- */
let last=performance.now(),acc=0,uiT=0;
/* the next frame is asked for first, so that an error in one frame is logged and the game runs on instead of standing still */
let FERR=0;function frameErr(e){if(FERR++<5)console.error(e)}
/* time spent in each part of a frame and the longest gap between frames, summed until the developer's minute report reads and clears
   them (frame.js) */
const PERF={n:0,sim:0,simX:0,ui:0,uiX:0,draw:0,drawX:0,gap:0,slow:0,last:0};
function perfAdd(k,v){PERF[k]+=v;if(v>PERF[k+'X'])PERF[k+'X']=v}
function frame(now){requestAnimationFrame(frame);try{const dt=Math.min(.1,(now-last)/1000);last=now;const p0=performance.now();
 if(PERF.last){const g=now-PERF.last;if(g>50)PERF.slow++;if(g>PERF.gap)PERF.gap=g}PERF.last=now;
 if(S&&$('#ov').hidden&&SPEEDS[spd]){trafTick(dt*Math.min(2,SPEEDS[spd]));railMove(dt*Math.min(2,SPEEDS[spd]))}
 /* the simulation takes at most some 8 ms of a frame: what is left waits for the next, and more than two seconds owed are let go, so a
    big city at a high speed runs its time a little slower instead of the screen standing still */
 if(S&&S.rs&&SPEEDS[spd]&&!S.lost){S.rs.p=(S.rs.p||0)+dt*SPEEDS[spd]*rsSpeed();if(S.rs.p>=RSDUR)rsDone()}
 if(S&&S.scratch&&!S.freeEnd)freeTick(dt);
 if(S&&$('#ov').hidden&&SPEEDS[spd]){acc+=dt*SPEEDS[spd];SIMT=1;try{const t0=performance.now();while(acc>=.25){sim(.25);acc-=.25;if(performance.now()-t0>8)break}}finally{SIMT=0}if(acc>2)acc=2}
 const p1=performance.now();if(S)msgTick(now);
 uiT+=dt;if(uiT>.25){uiT=0;updateUI();checkSize()}
 const p2=performance.now();draw(now);PERF.n++;perfAdd('sim',p1-p0);perfAdd('ui',p2-p1);perfAdd('draw',performance.now()-p2)}catch(e){frameErr(e)}}
window.addEventListener('resize',()=>{resize()});
if(window.ResizeObserver)new ResizeObserver(()=>resize()).observe(cv.parentElement);
function checkSize(){const r=cv.parentElement.getBoundingClientRect();if(Math.abs(r.width-vw)>.5||Math.abs(r.height-vh)>.5)resize()}
resize();sizeMini();L=LEVELS.nyc1865;boot();requestAnimationFrame(frame);
