import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://jkmrjeplpsfpciveycia.supabase.co';
const SUPABASE_KEY = 'sb_publishable_go8Ns2OeneQvMn5tT-8iBw_BPFVZMPD';
const API_URL = `${SUPABASE_URL}/functions/v1/campus-kart-api`;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d');
const canvasWrap = $('#raceCanvasWrap');

const RACERS = [
  { key: 'freshman_fred', name: 'Freshman Fred', emoji: '🎒', color: '#4da3ff', speed: 1.00, accel: 1.00, turn: 1.00, blurb: 'Balanced and still owns a campus map.' },
  { key: 'scholarship_sam', name: 'Scholarship Sam', emoji: '📚', color: '#54d68b', speed: .96, accel: .98, turn: 1.13, blurb: 'Takes corners with honors.' },
  { key: 'caffeine_chloe', name: 'Caffeine Chloe', emoji: '☕', color: '#ff6a8f', speed: 1.09, accel: 1.04, turn: .90, blurb: 'Fast enough to hear colors.' },
  { key: 'late_liam', name: 'Late-to-Class Liam', emoji: '⏰', color: '#ffad4a', speed: 1.02, accel: 1.16, turn: .94, blurb: 'Zero planning. Maximum launch.' },
  { key: 'senioritis_sid', name: 'Senioritis Sid', emoji: '🛋️', color: '#a978e8', speed: 1.08, accel: .88, turn: .88, blurb: 'Heavy kart. Heavier vibes.' },
  { key: 'parking_pat', name: 'Parking Pat', emoji: '🎫', color: '#e84b4b', speed: 1.04, accel: .96, turn: 1.02, blurb: 'Can ticket you while drifting.' },
];

const TRACKS = [
  {
    key: 'campus_loop', name: 'Campus Loop', icon: '🏫', road: 112, laps: 3, theme: '#5a9d62',
    tagline: 'Fountains, dorms, and one suspiciously fast shuttle.',
    points: [[225,560],[160,420],[175,250],[300,145],[535,120],[790,145],[1010,250],[1050,420],[955,575],[720,640],[470,635]],
    shortcut: [[300,145],[470,635]],
    pickups: [2,5,8], obstacles: [[600,130,'cone'],[1000,390,'cone'],[300,610,'cone']],
    sign: 'WELCOME TO CAMPUS — PLEASE IGNORE THE RACE CARS'
  },
  {
    key: 'parking_lot_panic', name: 'Parking Lot Panic', icon: '🅿️', road: 102, laps: 3, theme: '#74856a',
    tagline: 'Speed bumps, booths, cones, and absolutely no free parking.',
    points: [[180,610],[145,455],[205,315],[150,170],[360,115],[520,190],[690,105],[1035,150],[1030,335],[840,370],[1020,500],[900,635],[610,590],[390,650]],
    shortcut: [[205,315],[520,190]],
    pickups: [3,7,10], obstacles: [[500,190,'bump'],[850,365,'gate'],[690,585,'cone'],[990,505,'cone']],
    sign: 'STUDENT PARKING — PERMIT REQUIRED UNTIL 2097'
  },
  {
    key: 'library_after_dark', name: 'Library After Dark', icon: '📖', road: 98, laps: 3, theme: '#243b45',
    tagline: 'Quiet zone. Loud engines. Terrible policy compliance.',
    points: [[195,600],[145,420],[180,175],[440,120],[465,270],[720,270],[750,115],[1035,170],[1055,430],[940,635],[680,610],[650,455],[390,450],[365,630]],
    shortcut: [[465,270],[390,450]],
    pickups: [2,6,9,12], obstacles: [[455,205,'cart'],[700,270,'cart'],[650,520,'cart']],
    sign: 'LIBRARY QUIET ZONE — EXCEPT APPARENTLY THIS RACE'
  },
  {
    key: 'finals_week_frenzy', name: 'Finals Week Frenzy', icon: '📝', road: 94, laps: 3, theme: '#6c7351',
    tagline: 'Coffee, clocks, papers, and the consequences of procrastination.',
    points: [[170,590],[115,410],[180,250],[340,115],[520,190],[650,95],[830,165],[1040,120],[1080,325],[960,440],[1060,610],[800,645],[675,500],[490,610],[330,500]],
    shortcut: [[340,115],[490,610]],
    pickups: [1,4,8,11], obstacles: [[520,190,'coffee'],[940,440,'paper'],[675,500,'clock'],[250,210,'paper']],
    sign: 'MIDTERM AHEAD — NO TURNING BACK'
  },
  {
    key: 'road_to_graduation', name: 'Road to Graduation', icon: '🎓', road: 90, laps: 3, theme: '#5a604f',
    tagline: 'Every bad decision, now in one championship course.',
    points: [[155,610],[100,450],[170,330],[110,165],[325,105],[500,180],[610,90],[760,165],[1010,110],[1090,265],[1010,390],[1090,555],[900,660],[700,565],[560,655],[390,545],[270,650]],
    shortcut: [[170,330],[500,180]],
    pickups: [2,5,8,11,14], obstacles: [[485,175,'cone'],[1000,390,'ticket'],[700,565,'coffee'],[280,635,'cap']],
    sign: 'GRADUATION THIS WAY → PROBABLY'
  }
];

const ITEMS = [
  { key: 'energy', name: 'Energy Drink', icon: '⚡', desc: 'Instant speed boost.' },
  { key: 'textbook', name: 'Textbook Toss', icon: '📕', desc: 'Bonks the racer ahead.' },
  { key: 'ticket', name: 'Parking Ticket', icon: '🎫', desc: 'Slows a rival.' },
  { key: 'quiz', name: 'Pop Quiz', icon: '❓', desc: 'Scrambles a rival’s steering.' },
  { key: 'shield', name: 'Grad Cap Shield', icon: '🎓', desc: 'Blocks one attack.' },
  { key: 'coffee', name: 'Coffee Spill', icon: '☕', desc: 'Drops a slippery hazard.' },
  { key: 'allnighter', name: 'All-Nighter', icon: '🌙', desc: 'Huge boost, shaky steering.' },
  { key: 'tuition', name: 'Tuition Bill', icon: '💸', desc: 'Punishes whoever is leading.' },
];

const DIFFICULTY = {
  freshman: { ai: .90, score: .85 },
  junior: { ai: 1.00, score: 1.00 },
  senior: { ai: 1.08, score: 1.25 }
};

let settings = loadJSON('ckc_settings', { sound: true, shake: true, motion: false });
let profile = loadJSON('ckc_save', null) || defaultProfile();
let pendingAction = null;
let selectedRacer = profile.racer || 'freshman_fred';
let trackMode = 'quick';
let race = null;
let animationId = 0;
let lastFrame = performance.now();
let inputs = { gas:false, brake:false, left:false, right:false, drift:false };
let audioCtx = null, engineOsc = null, engineGain = null;
let roomChannel = null, roomCode = '', clientId = profile.client_id || randomId(), isHost = false, localReady = false, lobbyPlayers = [], onlineTrack = 'campus_loop';
let remoteCars = new Map();
let lastNetSend = 0;

profile.client_id = clientId;
saveLocal();

function defaultProfile(){
  return {
    save_token: crypto.randomUUID ? crypto.randomUUID() : uuidFallback(),
    client_id: randomId(), nickname:'', racer:'freshman_fred', difficulty:'junior',
    unlocked_racers:['freshman_fred','scholarship_sam'], unlocked_tracks:['campus_loop'], unlocked_vehicles:['starter_kart'],
    cup_progress:0, cup_points:0, wins:0, best_scores:{}, best_laps:{}, cup_started_at:null
  };
}
function loadJSON(key,fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } }
function saveLocal(){ localStorage.setItem('ckc_save', JSON.stringify(profile)); updateSaveStatus(); }
function uuidFallback(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)}); }
function randomId(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
function cleanName(v){ return String(v||'').trim().replace(/[^a-zA-Z0-9 _-]/g,'').replace(/\s+/g,' ').slice(0,18); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function lerp(a,b,t){ return a+(b-a)*t; }
function angleDiff(a,b){ let d=(b-a+Math.PI*3)%(Math.PI*2)-Math.PI; return d; }
function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
function showScreen(id){ $$('.screen').forEach(s=>s.classList.remove('active')); $('#'+id).classList.add('active'); if(id!=='race') stopRaceLoop(); }
function getRacer(key){ return RACERS.find(r=>r.key===key)||RACERS[0]; }
function getTrack(key){ return TRACKS.find(t=>t.key===key)||TRACKS[0]; }
function updateSaveStatus(){ $('#saveStatus').textContent = profile.nickname ? `Driver: ${profile.nickname} • ${profile.wins} wins • ${profile.unlocked_tracks.length}/5 tracks unlocked` : 'No driver profile yet.'; $('#continueBtn').disabled=!profile.nickname; }
function toast(msg,ms=1100){ const el=$('#raceMessage'); el.textContent=msg; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),ms); }
function beep(kind='menu'){
  if(!settings.sound) return;
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;
    const cfg={menu:[360,.05,.025],count:[520,.08,.04],go:[820,.2,.05],hit:[95,.09,.05],pickup:[650,.12,.04],boost:[260,.22,.035],win:[540,.5,.05],drift:[420,.08,.025]}[kind]||[360,.05,.025];
    o.type=kind==='win'?'sine':'square';o.frequency.setValueAtTime(cfg[0],t);if(kind==='win')o.frequency.exponentialRampToValueAtTime(1040,t+cfg[1]);g.gain.setValueAtTime(cfg[2],t);g.gain.exponentialRampToValueAtTime(.001,t+cfg[1]);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+cfg[1]);
  }catch{}
}
function ensureEngine(){
  if(!settings.sound||engineOsc) return;
  try{ audioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); engineOsc=audioCtx.createOscillator();engineGain=audioCtx.createGain();engineOsc.type='sawtooth';engineGain.gain.value=.008;engineOsc.frequency.value=55;engineOsc.connect(engineGain);engineGain.connect(audioCtx.destination);engineOsc.start(); }catch{}
}
function stopEngine(){ try{engineOsc?.stop()}catch{} engineOsc=null;engineGain=null; }
function shake(){ if(!settings.shake||settings.motion) return; canvasWrap.classList.remove('shake');void canvasWrap.offsetWidth;canvasWrap.classList.add('shake'); }
async function api(action,payload={}){ const r=await fetch(API_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,...payload})}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function cloudSave(){ saveLocal(); try{ await api('save',{save:profile}); }catch(e){ console.warn('Cloud save failed',e); } }
async function cloudLoad(){ if(!profile.save_token)return false; try{ const d=await api('load',{save_token:profile.save_token}); if(d.save){ const keepClient=profile.client_id; profile={...profile,...d.save,client_id:keepClient}; saveLocal(); return true; } }catch(e){console.warn('Cloud load failed',e);} return false; }

function renderRacers(){
  const grid=$('#racerGrid');grid.innerHTML='';
  RACERS.forEach(r=>{
    const unlocked=profile.unlocked_racers.includes(r.key);
    const b=document.createElement('button');b.type='button';b.className='racer-card'+(selectedRacer===r.key?' selected':'')+(unlocked?'':' locked');b.disabled=!unlocked;
    b.innerHTML=`<span class="emoji">${r.emoji}</span><strong></strong><small></small>`;b.querySelector('strong').textContent=r.name;b.querySelector('small').textContent=unlocked?r.blurb:'LOCKED';
    b.addEventListener('click',()=>{selectedRacer=r.key;beep('menu');renderRacers();});grid.appendChild(b);
  });
}
function renderTracks(mode){
  trackMode=mode;$('#trackModeLabel').textContent=mode==='trial'?'TIME TRIAL':'QUICK RACE';
  const grid=$('#trackGrid');grid.innerHTML='';
  TRACKS.forEach((t,i)=>{
    const unlocked=profile.unlocked_tracks.includes(t.key);
    const card=document.createElement('article');card.className='track-card'+(unlocked?'':' locked');
    card.innerHTML=`<span class="track-num">${String(i+1).padStart(2,'0')} ${t.icon}</span><h3></h3><p></p><button ${unlocked?'':'disabled'}>${unlocked?(mode==='trial'?'TIME TRIAL':'RACE'):'LOCKED'}</button>`;
    card.querySelector('h3').textContent=t.name;card.querySelector('p').textContent=t.tagline;
    card.querySelector('button').addEventListener('click',()=>startRace(mode,t.key));grid.appendChild(card);
  });
  showScreen('trackSelect');
}
function ensureProfile(action){
  if(profile.nickname){ action(); return; }
  pendingAction=action;selectedRacer='freshman_fred';$('#nickname').value='';$('#difficulty').value='junior';renderRacers();showScreen('profile');
}

function menuCup(){ ensureProfile(()=>startCup()); }
function startCup(){ if(profile.cup_progress>=5){profile.cup_progress=0;profile.cup_points=0;profile.cup_started_at=Date.now();} if(!profile.cup_started_at)profile.cup_started_at=Date.now();cloudSave();startRace('cup',TRACKS[profile.cup_progress].key); }
function menuQuick(){ ensureProfile(()=>renderTracks('quick')); }
function menuTrial(){ ensureProfile(()=>renderTracks('trial')); }
function menuContinue(){ ensureProfile(async()=>{await cloudLoad();startCup();}); }

function startRace(mode,trackKey,options={}){
  const track=getTrack(trackKey), racer=getRacer(options.racerKey||profile.racer), now=performance.now();
  remoteCars=new Map();
  const start=startingPose(track,0);
  const player=makeCar(profile.nickname||'Racer',racer,start.x,start.y,start.angle,false,clientId);
  const ai=[];
  if(mode!=='trial'&&mode!=='online'){
    const count=5;
    for(let i=0;i<count;i++){
      const rr=RACERS[(RACERS.findIndex(x=>x.key===racer.key)+i+1)%RACERS.length];
      const pose=startingPose(track,i+1);ai.push(makeCar(rr.name,rr,pose.x,pose.y,pose.angle,true,'ai'+i));
    }
  }
  const startAt = options.startAt || Date.now()+2800;
  race={mode,track,player,ai,cars:[player,...ai],startAt,started:false,finished:false,paused:false,startPerf:now,elapsed:0,finishers:[],itemCooldowns:new Map(),hazards:[],score:0,driftCount:0,itemUses:0,bestLap:null,lapStart:0,currentLapStart:0,onlineFinishShown:false};
  $('#trackNameHud').textContent=track.name.toUpperCase();$('#pauseTitle').textContent=mode==='online'?'RACE MENU':'PAUSED';$('#restartRaceBtn').style.display=mode==='online'?'none':'';$('#pauseRaceBtn').textContent=mode==='online'?'MENU':'PAUSE';$('#pauseOverlay').classList.add('hidden');
  showScreen('race');ensureEngine();updateHud();startRaceLoop();
}
function startingPose(track,slot){
  const p0=track.points[0],p1=track.points[1],a=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);
  const back=slot*34,side=(slot%2?1:-1)*Math.ceil(slot/2)*22;
  return {x:p0[0]-Math.cos(a)*back-Math.sin(a)*side,y:p0[1]-Math.sin(a)*back+Math.cos(a)*side,angle:a};
}
function makeCar(name,racer,x,y,angle,ai,id){
  return {id,name,racer,x,y,angle,speed:0,ai,nextWP:1,lap:0,finished:false,finishPlace:0,item:null,shield:false,boostUntil:0,slowedUntil:0,scrambleUntil:0,wobbleUntil:0,driftCharge:0,wasDrifting:false,lastItemAt:0,lastLapTime:0,progress:0,stunnedUntil:0};
}
function startRaceLoop(){ cancelAnimationFrame(animationId);lastFrame=performance.now();const loop=(t)=>{const dt=Math.min(.04,(t-lastFrame)/1000);lastFrame=t;if(race&&!race.paused)updateRace(t,dt);drawRace(t);if($('#race').classList.contains('active'))animationId=requestAnimationFrame(loop);};animationId=requestAnimationFrame(loop); }
function stopRaceLoop(){ cancelAnimationFrame(animationId);animationId=0;stopEngine(); }

function updateRace(t,dt){
  const nowDate=Date.now();
  if(!race.started){
    const rem=race.startAt-nowDate;
    const cd=$('#countdown');
    if(rem>0){const n=Math.ceil(rem/1000);cd.textContent=n>0?String(n):'';if(race._lastCount!==n){race._lastCount=n;beep('count');}}
    else{race.started=true;race.startPerf=t;race.currentLapStart=t;cd.textContent='GO!';beep('go');setTimeout(()=>{if($('#countdown').textContent==='GO!')$('#countdown').textContent='';},650);}
    updateHud();return;
  }
  if(race.finished) return;
  race.elapsed=t-race.startPerf;
  updatePlayer(race.player,t,dt);
  race.ai.forEach(c=>updateAI(c,t,dt));
  for(const c of race.cars) updateCarCommon(c,t,dt);
  updateHazards(t,dt);
  updatePositions();
  if(race.mode==='online') updateNetwork(t);
  if(engineOsc){engineOsc.frequency.value=55+Math.abs(race.player.speed)*.38;engineGain.gain.value=settings.sound?.006:0;}
  updateHud();
}
function updatePlayer(c,t,dt){
  if(c.finished||t<c.stunnedUntil)return;
  const stats=c.racer;
  const maxSpeed=250*stats.speed, accel=165*stats.accel;
  if(inputs.gas)c.speed+=accel*dt;
  if(inputs.brake)c.speed-=220*dt;
  c.speed*=Math.pow(.987,dt*60);
  c.speed=clamp(c.speed,-80,maxSpeed*(t<c.boostUntil?1.28:1));
  if(t<c.slowedUntil)c.speed=Math.min(c.speed,maxSpeed*.57);
  let steer=(inputs.left?-1:0)+(inputs.right?1:0);
  if(t<c.scrambleUntil)steer*=-1;
  if(t<c.wobbleUntil)steer+=Math.sin(t/85)*.35;
  const drift=inputs.drift&&Math.abs(steer)>.1&&Math.abs(c.speed)>70;
  const steerPower=(1.4*c.racer.turn)*(0.28+Math.min(1,Math.abs(c.speed)/140));
  c.angle+=steer*steerPower*dt*(c.speed<0?-1:1)*(drift?1.33:1);
  if(drift){c.driftCharge=Math.min(2.2,c.driftCharge+dt);c.speed*=Math.pow(.994,dt*60);if(Math.random()<.12)beep('drift');}
  if(c.wasDrifting&&!drift&&c.driftCharge>.28){const strength=clamp(c.driftCharge/2.2,.2,1);c.boostUntil=t+350+strength*650;c.speed+=45+strength*65;race.driftCount++;race.score+=Math.round(80+strength*180);beep('boost');toast(strength>.72?'SUPER STUDY DRIFT!':'DRIFT BOOST!');}
  c.wasDrifting=drift;if(!drift)c.driftCharge=0;
  c.x+=Math.cos(c.angle)*c.speed*dt;c.y+=Math.sin(c.angle)*c.speed*dt;
  enforceRoad(c);
  collideCars(c,[...race.ai,...remoteCars.values()]);
  checkPickups(c,t,true);
  updateCheckpoint(c,t);
}
function updateAI(c,t,dt){
  if(c.finished||t<c.stunnedUntil)return;
  const pts=race.track.points,target=pts[c.nextWP%pts.length];
  const desired=Math.atan2(target[1]-c.y,target[0]-c.x),d=angleDiff(c.angle,desired);
  const aiMult=DIFFICULTY[profile.difficulty].ai*(.96+((Number(c.id.slice(-1))||0)%4)*.018);
  c.angle+=clamp(d,-1,1)*1.85*c.racer.turn*dt;
  const curvePenalty=Math.min(.35,Math.abs(d)*.16),max=225*c.racer.speed*aiMult*(1-curvePenalty);
  c.speed=lerp(c.speed,max,dt*(.65*c.racer.accel));
  if(t<c.slowedUntil)c.speed=Math.min(c.speed,max*.58);
  if(t<c.boostUntil)c.speed*=1.0025;
  c.x+=Math.cos(c.angle)*c.speed*dt;c.y+=Math.sin(c.angle)*c.speed*dt;
  enforceRoad(c);checkPickups(c,t,false);updateCheckpoint(c,t);
  if(c.item&&t-c.lastItemAt>5000+Math.random()*5000){useItemFor(c,t);}
}
function updateCarCommon(c,t,dt){
  if(!c.ai)return;
  if(c.speed<0)c.speed*=Math.pow(.96,dt*60);
}
function nearestOnSegment(px,py,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,wx=px-ax,wy=py-ay,len=vx*vx+vy*vy;let u=len?((wx*vx+wy*vy)/len):0;u=clamp(u,0,1);const x=ax+u*vx,y=ay+u*vy;return{x,y,d:Math.hypot(px-x,py-y)};}
function nearestRoad(x,y){
  const pts=race.track.points;let best={d:1e9,x:0,y:0};
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],q=nearestOnSegment(x,y,a[0],a[1],b[0],b[1]);if(q.d<best.d)best=q;}
  if(race.track.shortcut){const s=race.track.shortcut,q=nearestOnSegment(x,y,s[0][0],s[0][1],s[1][0],s[1][1]);if(q.d<best.d)best=q;}
  return best;
}
function enforceRoad(c){
  const q=nearestRoad(c.x,c.y),half=race.track.road/2;
  if(q.d>half){c.speed*=.975;if(q.d>half+42){c.x=lerp(c.x,q.x,.12);c.y=lerp(c.y,q.y,.12);c.speed*=.82;}}
  c.x=clamp(c.x,25,1175);c.y=clamp(c.y,25,735);
  for(const [ox,oy,type] of race.track.obstacles){if(Math.hypot(c.x-ox,c.y-oy)<30){c.speed*=-.23;c.x+=Math.cos(c.angle+Math.PI)*14;c.y+=Math.sin(c.angle+Math.PI)*14;if(c===race.player){shake();beep('hit');toast(type==='gate'?'PARKING GATE!':type==='cart'?'BOOK CART!':type==='coffee'?'COFFEE EVERYWHERE!':'BONK!');}}}
}
function collideCars(c,others){
  for(const o of others){if(!o||o.id===c.id||o.finished)continue;const d=Math.hypot(c.x-o.x,c.y-o.y);if(d<31&&d>1){const nx=(c.x-o.x)/d,ny=(c.y-o.y)/d;c.x+=nx*(31-d)*.55;c.y+=ny*(31-d)*.55;c.speed*=.78;if(c===race.player&&Math.random()<.08){shake();beep('hit');}}}
}
function updateCheckpoint(c,t){
  const pts=race.track.points,target=pts[c.nextWP%pts.length];
  if(Math.hypot(c.x-target[0],c.y-target[1])<72){
    c.nextWP=(c.nextWP+1)%pts.length;
    if(c.nextWP===1){
      c.lap++;
      if(c===race.player){const lapTime=t-race.currentLapStart;race.currentLapStart=t;if(c.lap>0){race.bestLap=race.bestLap==null?lapTime:Math.min(race.bestLap,lapTime);if(c.lap<race.track.laps)toast(c.lap===race.track.laps-1?'FINAL LAP!':'LAP COMPLETE!');}}
      if(c.lap>=race.track.laps&&!c.finished)finishCar(c,t);
    }
  }
  c.progress=c.lap*pts.length+((c.nextWP-1+pts.length)%pts.length);
}
function finishCar(c,t){
  c.finished=true;c.speed*=.6;
  if(race.mode==='online'){
    if(c===race.player){sendBroadcast('finish',{id:clientId,nickname:profile.nickname,time_ms:Math.round(race.elapsed),stamp:Date.now()});race.finishers.push({id:clientId,name:profile.nickname,time:race.elapsed});setTimeout(()=>finishRace(),700);}
  }else{
    race.finishers.push({id:c.id,name:c.name,time:race.elapsed});c.finishPlace=race.finishers.length;
    if(c===race.player)finishRace();
  }
}
function updatePositions(){
  if(race.mode==='online'){
    const live=[race.player,...remoteCars.values()].filter(c=>!c.disconnected);
    live.forEach(c=>{if(c.progress==null)c.progress=(c.lap||0)*race.track.points.length+(c.nextWP||0);});live.sort((a,b)=>(b.finished?1:0)-(a.finished?1:0)||b.progress-a.progress);race.player.position=Math.max(1,live.findIndex(c=>c.id===clientId)+1);race.player.totalRacers=live.length;
  }else{
    const cars=race.cars.slice().sort((a,b)=>{if(a.finished&&b.finished)return a.finishPlace-b.finishPlace;if(a.finished)return-1;if(b.finished)return 1;return b.progress-a.progress;});race.player.position=cars.findIndex(c=>c===race.player)+1;race.player.totalRacers=cars.length;
  }
}
function checkPickups(c,t,isPlayer){
  if(c.item)return;const pts=race.track.points;
  race.track.pickups.forEach((idx,n)=>{const p=pts[idx%pts.length],key=`${c.id}:${n}`,until=race.itemCooldowns.get(key)||0;if(t<until)return;if(Math.hypot(c.x-p[0],c.y-p[1])<38){c.item=pickItem(c);race.itemCooldowns.set(key,t+4500);if(isPlayer){beep('pickup');toast(`${itemByKey(c.item).icon} ${itemByKey(c.item).name}`);}}});
}
function pickItem(c){
  const pos=c.position||3,total=c.totalRacers||6,behind=total>1?(pos-1)/(total-1):0,r=Math.random();
  if(behind>.65&&r<.28)return 'tuition';if(behind>.45&&r<.45)return 'allnighter';
  const pool=behind>.4?['energy','textbook','ticket','quiz','shield','coffee','allnighter']:['energy','textbook','shield','coffee','ticket'];return pool[Math.floor(Math.random()*pool.length)];
}
function itemByKey(k){return ITEMS.find(i=>i.key===k)||ITEMS[0];}
function usePlayerItem(){ if(!race?.started||race.player.finished||!race.player.item)return;useItemFor(race.player,performance.now()); }
function useItemFor(c,t){
  const item=c.item;if(!item)return;c.item=null;c.lastItemAt=t;if(c===race.player){race.itemUses++;race.score+=70;}
  if(item==='energy'){c.boostUntil=t+1300;c.speed+=80;beep('boost');if(c===race.player)toast('ENERGY BOOST!');return;}
  if(item==='shield'){c.shield=true;if(c===race.player)toast('GRAD CAP SHIELD!');return;}
  if(item==='allnighter'){c.boostUntil=t+1800;c.wobbleUntil=t+2200;c.speed+=95;beep('boost');if(c===race.player)toast('ALL-NIGHTER! HOLD ON!');return;}
  if(item==='coffee'){const h={id:randomId(),x:c.x-Math.cos(c.angle)*28,y:c.y-Math.sin(c.angle)*28,expires:t+9000};race.hazards.push(h);if(race.mode==='online'&&c===race.player)sendBroadcast('effect',{type:'hazard',hazard:h,source:clientId});return;}
  const target=findTarget(c,item);
  if(!target){if(c===race.player)toast('NO TARGET');return;}
  applyItemEffect(target,item,t);
  if(race.mode==='online'&&c===race.player&&target.id!==clientId)sendBroadcast('effect',{type:'item',item,target:target.id,source:clientId});
}
function findTarget(c,item){
  let pool=race.mode==='online'?[...remoteCars.values()].filter(x=>!x.finished):race.cars.filter(x=>x!==c&&!x.finished);
  if(!pool.length)return null;
  if(item==='tuition')return pool.concat(c===race.player?[race.player]:[]).sort((a,b)=>(a.position||9)-(b.position||9))[0];
  const ahead=pool.filter(x=>(x.progress||0)>=(c.progress||0)).sort((a,b)=>(a.progress||0)-(b.progress||0));return ahead[0]||pool[0];
}
function applyItemEffect(target,item,t){
  if(target.shield){target.shield=false;if(target===race.player)toast('SHIELD SAVED YOU!');return;}
  if(item==='textbook'){target.speed*=.35;target.stunnedUntil=t+520;if(target===race.player){shake();toast('TEXTBOOK BONK!');}}
  if(item==='ticket'){target.slowedUntil=t+1800;if(target===race.player)toast('PARKING TICKET!');}
  if(item==='quiz'){target.scrambleUntil=t+1500;if(target===race.player)toast('POP QUIZ! CONTROLS FLIPPED!');}
  if(item==='tuition'){target.slowedUntil=t+2400;if(target===race.player)toast('TUITION BILL!');}
}
function updateHazards(t){
  race.hazards=race.hazards.filter(h=>t<h.expires);
  for(const h of race.hazards){if(Math.hypot(race.player.x-h.x,race.player.y-h.y)<34&&t>(h.hitUntil||0)){h.hitUntil=t+1100;race.player.angle+=1.15;race.player.speed*=.62;shake();toast('COFFEE SPIN!');}}
}

function finishRace(){
  if(!race||race.finished)return;race.finished=true;const place=race.player.position||1,mode=race.mode,elapsed=Math.round(race.elapsed),track=race.track;
  const base=Math.max(0,7000-place*850-Math.round(elapsed/120))+race.driftCount*160+race.itemUses*90;
  race.score=Math.max(race.score,0)+Math.round(base*DIFFICULTY[profile.difficulty].score);
  let unlock='';
  if(mode==='trial'){
    const old=profile.best_laps[track.key];if(!old||elapsed<old){profile.best_laps[track.key]=elapsed;unlock='NEW PERSONAL BEST!';}
    submitTrial(track.key,elapsed);
  } else if(mode==='cup'){
    const cupPts=[1000,700,500,350,250,150][Math.min(5,place-1)];profile.cup_points+=cupPts+Math.round(race.score*.25);
    if(place<=3){profile.wins++;const idx=TRACKS.findIndex(t=>t.key===track.key);profile.cup_progress=Math.max(profile.cup_progress,idx+1);unlock=unlockProgress(idx);}
    if(profile.cup_progress>=5){profile.wins++;profile.unlocked_vehicles=[...new Set([...profile.unlocked_vehicles,'deans_golf_cart'])];unlock='🏆 CAMPUS CUP COMPLETE — DEAN’S GOLF CART UNLOCKED!';submitCup(true);}
  } else if(mode==='quick'){
    if(place===1){profile.wins++;const idx=TRACKS.findIndex(t=>t.key===track.key);unlock=unlockProgress(idx);}
  } else if(mode==='online'){
    if(place===1)profile.wins++;
  }
  profile.best_scores[track.key]=Math.max(profile.best_scores[track.key]||0,race.score);cloudSave();renderResult(place,elapsed,unlock);
}
function unlockProgress(idx){
  let msgs=[];const nextTrack=TRACKS[idx+1];if(nextTrack&&!profile.unlocked_tracks.includes(nextTrack.key)){profile.unlocked_tracks.push(nextTrack.key);msgs.push(`${nextTrack.icon} ${nextTrack.name} unlocked`);}
  const unlockOrder=['caffeine_chloe','late_liam','senioritis_sid','parking_pat'];const rkey=unlockOrder[Math.min(idx,unlockOrder.length-1)];if(rkey&&!profile.unlocked_racers.includes(rkey)){profile.unlocked_racers.push(rkey);msgs.push(`${getRacer(rkey).emoji} ${getRacer(rkey).name} unlocked`);}return msgs.join(' • ');
}
async function submitTrial(trackKey,timeMs){try{await api('submit_trial',{entry:{save_token:profile.save_token,nickname:profile.nickname,track_key:trackKey,time_ms:timeMs}});}catch(e){console.warn(e)}}
async function submitCup(completed){try{const bestEntries=Object.entries(profile.best_laps);const best=bestEntries.sort((a,b)=>a[1]-b[1])[0];await api('submit_cup',{entry:{save_token:profile.save_token,nickname:profile.nickname,cup_score:profile.cup_points,cup_time_ms:completed&&profile.cup_started_at?Date.now()-profile.cup_started_at:null,cup_wins:completed?1:0,best_track:best?.[0]||null,best_time_ms:best?.[1]||null}});}catch(e){console.warn(e)}}
function renderResult(place,elapsed,unlock){
  showScreen('result');$('#resultEyebrow').textContent=race.mode==='online'?'ONLINE RACE COMPLETE':race.mode==='trial'?'TIME TRIAL COMPLETE':'RACE COMPLETE';
  $('#resultTitle').textContent=race.mode==='trial'?'FINISHED!':ordinal(place)+' PLACE!';
  const quotes=['You drove like the tuition was due at midnight.','The registrar has no form for what just happened.','Your academic advisor felt a disturbance in the force.','Parking Services would like a word.'];$('#resultQuote').textContent=quotes[Math.floor(Math.random()*quotes.length)];
  $('#resultStats').innerHTML=`<div><b>${fmtTime(elapsed)}</b><small>Time</small></div><div><b>${race.bestLap?fmtTime(Math.round(race.bestLap)):'—'}</b><small>Best lap</small></div><div><b>${race.driftCount}</b><small>Drifts</small></div><div><b>${race.score.toLocaleString()}</b><small>Score</small></div>`;
  const box=$('#unlockBox');if(unlock){box.textContent=unlock;box.classList.remove('hidden');beep('win');}else box.classList.add('hidden');
  $('#resultNext').textContent=race.mode==='cup'&&profile.cup_progress<5?'NEXT CUP RACE':race.mode==='online'?'REMATCH LOBBY':'RACE AGAIN';
}
function ordinal(n){return n+(n===1?'ST':n===2?'ND':n===3?'RD':'TH');}
function fmtTime(ms){const total=Math.max(0,Math.round(ms)),m=Math.floor(total/60000),s=Math.floor(total%60000/1000),x=total%1000;return`${m}:${String(s).padStart(2,'0')}.${String(x).padStart(3,'0')}`;}
function updateHud(){
  if(!race)return;$('#positionText').textContent=race.mode==='trial'?'—':`${race.player.position||1}/${race.player.totalRacers||race.cars.length}`;$('#lapText').textContent=`${Math.min(race.track.laps,race.player.lap+1)}/${race.track.laps}`;$('#timerText').textContent=fmtTime(Math.round(race.elapsed));$('#speedText').textContent=Math.max(0,Math.round(Math.abs(race.player.speed)*.62));$('#itemText').textContent=race.player.item?itemByKey(race.player.item).icon:'—';
}

function drawRace(t){
  if(!race)return;const tr=race.track;ctx.fillStyle=tr.theme;ctx.fillRect(0,0,1200,760);drawDecor(tr);drawRoad(tr);drawPickups(t);drawHazards();drawObstacles(tr);const cars=race.mode==='online'?[...remoteCars.values(),race.player]:race.cars;cars.filter(Boolean).forEach(c=>drawCar(c,c===race.player));drawMiniMap();drawDriftFX();
}
function drawRoad(tr){
  const path=(points)=>{ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();};
  ctx.lineCap='round';ctx.lineJoin='round';path(tr.points);ctx.strokeStyle='#171a20';ctx.lineWidth=tr.road+24;ctx.stroke();path(tr.points);ctx.strokeStyle='#4d535e';ctx.lineWidth=tr.road;ctx.stroke();path(tr.points);ctx.setLineDash([28,28]);ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);
  if(tr.shortcut){ctx.beginPath();ctx.moveTo(...tr.shortcut[0]);ctx.lineTo(...tr.shortcut[1]);ctx.strokeStyle='#1a1d23';ctx.lineWidth=tr.road*.72+16;ctx.stroke();ctx.strokeStyle='#555c66';ctx.lineWidth=tr.road*.72;ctx.stroke();ctx.setLineDash([20,22]);ctx.strokeStyle='rgba(255,213,74,.46)';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);}
  const p0=tr.points[0],p1=tr.points[1],a=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);ctx.save();ctx.translate(p0[0],p0[1]);ctx.rotate(a);for(let y=-tr.road/2;y<tr.road/2;y+=12){ctx.fillStyle=(Math.floor((y+tr.road/2)/12)%2)?'#fff':'#111';ctx.fillRect(-6,y,12,12);}ctx.restore();
}
function drawDecor(tr){
  ctx.fillStyle='rgba(255,255,255,.14)';for(let i=0;i<18;i++){const x=(i*177+85)%1160,y=(i*91+60)%700;ctx.beginPath();ctx.arc(x,y,10+(i%3)*5,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#182033';ctx.fillRect(430,18,340,54);ctx.fillStyle='#f7f2d5';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText(tr.sign,600,50);
  if(tr.key==='campus_loop'){ctx.fillStyle='#b7c6db';ctx.fillRect(480,300,240,130);ctx.fillStyle='#75bde8';ctx.beginPath();ctx.arc(600,365,38,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eef7ff';ctx.fillRect(592,325,16,80);}
  if(tr.key==='library_after_dark'){ctx.fillStyle='#1b2638';ctx.fillRect(520,330,180,90);ctx.fillStyle='#d5bf82';for(let i=0;i<6;i++)ctx.fillRect(535+i*26,342,12,65);}
  if(tr.key==='road_to_graduation'){ctx.fillStyle='#2a2341';ctx.fillRect(875,500,165,74);ctx.fillStyle='#ffd54a';ctx.font='bold 21px system-ui';ctx.fillText('GRADUATION',958,545);}
}
function drawPickups(t){const pts=race.track.points;race.track.pickups.forEach((idx,n)=>{const p=pts[idx],pulse=1+Math.sin(t/180+n)*.12;ctx.save();ctx.translate(p[0],p[1]);ctx.scale(pulse,pulse);ctx.rotate(t/700+n);ctx.fillStyle='rgba(73,225,232,.25)';ctx.fillRect(-22,-22,44,44);ctx.strokeStyle='#66f2ff';ctx.lineWidth=4;ctx.strokeRect(-17,-17,34,34);ctx.fillStyle='#fff';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('?',0,7);ctx.restore();});}
function drawObstacles(tr){for(const [x,y,type] of tr.obstacles){ctx.save();ctx.translate(x,y);ctx.font='28px system-ui';ctx.textAlign='center';ctx.fillText(type==='cone'?'🔶':type==='gate'?'🚧':type==='cart'?'🛒':type==='coffee'?'☕':type==='paper'?'📄':type==='clock'?'⏰':type==='ticket'?'🎫':'🎓',0,10);ctx.restore();}}
function drawHazards(){for(const h of race.hazards){ctx.fillStyle='rgba(77,41,20,.78)';ctx.beginPath();ctx.ellipse(h.x,h.y,25,17,.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='18px system-ui';ctx.fillText('☕',h.x-9,h.y+6);}}
function drawCar(c,isPlayer){
  if(c.disconnected)return;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);if(c.shield){ctx.strokeStyle='#63efff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-18,11,42,20);ctx.fillStyle=c.racer?.color||'#bbb';roundRect(ctx,-22,-14,44,28,8);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-20,-19,12,7);ctx.fillRect(8,-19,12,7);ctx.fillRect(-20,12,12,7);ctx.fillRect(8,12,12,7);ctx.fillStyle='#e9f2ff';ctx.fillRect(2,-8,13,16);ctx.fillStyle=isPlayer?'#ffd54a':'#fff';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(c.name?.slice(0,12)||'Racer',0,-30);if(c.finished){ctx.font='20px system-ui';ctx.fillText('🏁',0,-48);}ctx.restore();}
function roundRect(c,x,y,w,h,r){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):(c.rect(x,y,w,h));}
function drawMiniMap(){
  const pts=race.track.points,scale=.14,ox=1018,oy=580;ctx.save();ctx.globalAlpha=.82;ctx.fillStyle='#0a1020';ctx.fillRect(990,545,195,195);ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.beginPath();ctx.moveTo(pts[0][0]-100,pts[0][1]-100);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]-100,pts[i][1]-100);ctx.closePath();ctx.strokeStyle='#aab6d3';ctx.lineWidth=16;ctx.stroke();const drawDot=(c,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(c.x-100,c.y-100,23,0,Math.PI*2);ctx.fill();};drawDot(race.player,'#ffd54a');if(race.mode==='online')[...remoteCars.values()].forEach(c=>drawDot(c,c.racer?.color||'#fff'));else race.ai.forEach(c=>drawDot(c,c.racer.color));ctx.restore();}
function drawDriftFX(){const c=race.player;if(!c.wasDrifting||settings.motion)return;const level=clamp(c.driftCharge/2.2,0,1);ctx.fillStyle=level>.72?'#ffd54a':level>.4?'#49e1e8':'#fff';for(let i=0;i<5;i++){const a=c.angle+Math.PI+(Math.random()-.5)*.7,d=25+Math.random()*22;ctx.fillRect(c.x+Math.cos(a)*d,c.y+Math.sin(a)*d,3+level*4,3+level*4);}}

// ---------- Online multiplayer ----------
function makeRoomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='K';for(let i=0;i<5;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}
async function connectRoom(code,host){
  await leaveRoom(false);roomCode=code.toUpperCase();isHost=host;localReady=false;remoteCars=new Map();
  roomChannel=supabase.channel(`kart-room-${roomCode}`,{config:{presence:{key:clientId},broadcast:{self:true}}});
  roomChannel
    .on('presence',{event:'sync'},syncPresence)
    .on('broadcast',{event:'start'},({payload})=>handleStartBroadcast(payload))
    .on('broadcast',{event:'state'},({payload})=>handleStateBroadcast(payload))
    .on('broadcast',{event:'effect'},({payload})=>handleEffectBroadcast(payload))
    .on('broadcast',{event:'finish'},({payload})=>handleFinishBroadcast(payload));
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Could not connect to room.')),8000);
    roomChannel.subscribe(async status=>{
      if(status==='SUBSCRIBED'){clearTimeout(timer);await trackPresence();$('#roomCodeLabel').textContent=roomCode;showScreen('lobby');resolve();}
      if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){clearTimeout(timer);reject(new Error('Realtime connection failed.'));}
    });
  });
}
async function trackPresence(){if(!roomChannel)return;await roomChannel.track({id:clientId,nickname:profile.nickname,racer:profile.racer,ready:localReady,host:isHost,online_at:new Date().toISOString()});}
function syncPresence(){
  if(!roomChannel)return;const raw=roomChannel.presenceState(),players=[];Object.values(raw).forEach(arr=>arr.forEach(p=>players.push(p)));lobbyPlayers=players.slice(0,4);
  const ids=new Set(players.map(p=>p.id));for(const id of remoteCars.keys())if(!ids.has(id))remoteCars.delete(id);
  renderLobby();
}
function renderLobby(){
  const box=$('#lobbyPlayers');box.innerHTML='';
  lobbyPlayers.forEach(p=>{const row=document.createElement('div');row.className='player-row';const r=getRacer(p.racer);row.innerHTML='<strong><span></span><span class="nm"></span></strong><span class="ready-pill"></span>';row.querySelector('strong span').textContent=r.emoji;row.querySelector('.nm').textContent=(p.nickname||'Racer')+(p.host?' 👑':'');const pill=row.querySelector('.ready-pill');pill.textContent=p.ready?'READY':'NOT READY';if(p.ready)pill.classList.add('ready');box.appendChild(row);});
  $('#hostStartBtn').style.display=isHost?'':'none';$('#lobbyTrack').disabled=!isHost;const allReady=lobbyPlayers.length>=2&&lobbyPlayers.every(p=>p.ready);$('#hostStartBtn').disabled=!isHost||!allReady;$('#lobbyHint').textContent=lobbyPlayers.length<2?'Waiting for at least one more racer…':allReady?(isHost?'Everyone is ready. Start when you are.':'Waiting for the host to start…'):'Waiting for everyone to ready up.';
}
function sendBroadcast(event,payload){try{roomChannel?.send({type:'broadcast',event,payload});}catch(e){console.warn(e)}}
function handleStartBroadcast(p){if(!p?.track||!p.startAt)return;onlineTrack=p.track;localReady=false;trackPresence();startRace('online',p.track,{startAt:p.startAt,racerKey:profile.racer});}
function updateNetwork(t){
  if(!roomChannel||t-lastNetSend<90)return;lastNetSend=t;const c=race.player;
  sendBroadcast('state',{id:clientId,nickname:profile.nickname,racer:profile.racer,x:+c.x.toFixed(1),y:+c.y.toFixed(1),angle:+c.angle.toFixed(3),speed:+c.speed.toFixed(1),lap:c.lap,nextWP:c.nextWP,progress:c.progress,item:c.item,shield:c.shield,finished:c.finished,stamp:Date.now()});
}
function handleStateBroadcast(p){if(!race||race.mode!=='online'||!p||p.id===clientId)return;const existing=remoteCars.get(p.id)||makeCar(p.nickname,getRacer(p.racer),p.x,p.y,p.angle,false,p.id);existing.name=p.nickname;existing.racer=getRacer(p.racer);existing.x=lerp(existing.x,p.x,.7);existing.y=lerp(existing.y,p.y,.7);existing.angle=p.angle;existing.speed=p.speed;existing.lap=p.lap;existing.nextWP=p.nextWP;existing.progress=p.progress;existing.item=p.item;existing.shield=p.shield;existing.finished=p.finished;existing.lastSeen=performance.now();remoteCars.set(p.id,existing);}
function handleEffectBroadcast(p){if(!race||race.mode!=='online'||!p||p.source===clientId)return;if(p.type==='hazard'&&p.hazard){race.hazards.push({...p.hazard,expires:performance.now()+8000});return;}if(p.type==='item'&&p.target===clientId)applyItemEffect(race.player,p.item,performance.now());}
function handleFinishBroadcast(p){if(!race||race.mode!=='online'||!p||p.id===clientId)return;if(!race.finishers.some(f=>f.id===p.id))race.finishers.push({id:p.id,name:p.nickname,time:p.time_ms});const rc=remoteCars.get(p.id);if(rc)rc.finished=true;}
async function leaveRoom(goMenu=true){if(roomChannel){try{await roomChannel.untrack();await supabase.removeChannel(roomChannel);}catch{}roomChannel=null;}roomCode='';isHost=false;localReady=false;lobbyPlayers=[];remoteCars=new Map();if(goMenu){showScreen('menu');updateSaveStatus();}}

// ---------- Leaderboards ----------
async function renderLeaderboard(board='cup'){
  showScreen('leaderboard');$$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.board===board));$('#trialTrackWrap').classList.toggle('hidden',board!=='trial');$('#boardStatus').textContent='Loading online scores…';
  try{const track=$('#trialTrackFilter').value||'campus_loop',data=await api('leaderboard',{board,track_key:track});renderBoardRows(board,data.entries||[]);$('#boardStatus').textContent='Live from the Campus Kart Chaos leaderboard.';}catch(e){$('#boardStatus').textContent='Leaderboard is temporarily unavailable.';$('#boardBody').innerHTML='<tr><td>Could not load scores.</td></tr>';}
}
function renderBoardRows(board,rows){
  const head=$('#boardHead'),body=$('#boardBody');body.innerHTML='';
  if(board==='cup')head.innerHTML='<tr><th>RANK</th><th>RACER</th><th>CUP SCORE</th><th>CUP TIME</th><th>WINS</th><th>BEST TRACK</th></tr>';
  else head.innerHTML='<tr><th>RANK</th><th>RACER</th><th>TRACK</th><th>TIME</th></tr>';
  if(!rows.length){body.innerHTML=`<tr><td colspan="6">No scores yet. Your name could be first.</td></tr>`;return;}
  rows.forEach((r,i)=>{const tr=document.createElement('tr');if(board==='cup'){tr.innerHTML=`<td>${i+1}</td><td class="n"></td><td>${Number(r.cup_score||0).toLocaleString()}</td><td>${r.cup_time_ms?fmtTime(r.cup_time_ms):'—'}</td><td>${r.cup_wins||0}</td><td class="t"></td>`;tr.querySelector('.n').textContent=r.nickname;tr.querySelector('.t').textContent=r.best_track?getTrack(r.best_track).name:'—';}else{tr.innerHTML=`<td>${i+1}</td><td class="n"></td><td class="t"></td><td>${fmtTime(r.time_ms)}</td>`;tr.querySelector('.n').textContent=r.nickname;tr.querySelector('.t').textContent=getTrack(r.track_key).name;}body.appendChild(tr);});
}

// ---------- UI wiring ----------
$('#cupBtn').addEventListener('click',()=>{beep('menu');menuCup();});
$('#quickBtn').addEventListener('click',()=>{beep('menu');menuQuick();});
$('#trialBtn').addEventListener('click',()=>{beep('menu');menuTrial();});
$('#continueBtn').addEventListener('click',()=>{beep('menu');menuContinue();});
$('#onlineBtn').addEventListener('click',()=>{beep('menu');ensureProfile(()=>{$('#onlineName').value=profile.nickname;showScreen('online');});});
$('#leaderBtn').addEventListener('click',()=>{beep('menu');renderLeaderboard('cup');});
$('#howBtn').addEventListener('click',()=>{beep('menu');showScreen('how');});
$('#settingsBtn').addEventListener('click',()=>{beep('menu');showScreen('settings');});
$$('.back').forEach(b=>b.addEventListener('click',()=>{beep('menu');showScreen('menu');updateSaveStatus();}));

$('#profileForm').addEventListener('submit',e=>{e.preventDefault();const name=cleanName($('#nickname').value);if(name.length<2){$('#profileError').textContent='Use at least 2 letters or numbers.';return;}profile.nickname=name;profile.difficulty=$('#difficulty').value;profile.racer=selectedRacer;$('#profileError').textContent='';cloudSave();const action=pendingAction;pendingAction=null;(action||(()=>showScreen('menu')))();});

$('#createRoomBtn').addEventListener('click',async()=>{const n=cleanName($('#onlineName').value);if(n.length<2){$('#onlineError').textContent='Enter a nickname first.';return;}profile.nickname=n;saveLocal();$('#onlineError').textContent='Connecting…';try{await connectRoom(makeRoomCode(),true);$('#onlineError').textContent='';}catch(e){$('#onlineError').textContent=e.message;}});
$('#showJoinBtn').addEventListener('click',()=>$('#joinBox').classList.toggle('hidden'));
$('#joinRoomBtn').addEventListener('click',async()=>{const n=cleanName($('#onlineName').value),code=$('#roomCodeInput').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(n.length<2||code.length<4){$('#onlineError').textContent='Enter a nickname and valid room code.';return;}profile.nickname=n;saveLocal();$('#onlineError').textContent='Connecting…';try{await connectRoom(code,false);$('#onlineError').textContent='';}catch(e){$('#onlineError').textContent=e.message;}});
$('#leaveRoomBtn').addEventListener('click',()=>leaveRoom(true));
$('#readyBtn').addEventListener('click',async()=>{localReady=!localReady;$('#readyBtn').textContent=localReady?'NOT READY':'I\'M READY';await trackPresence();});
$('#lobbyRacer').addEventListener('change',async e=>{profile.racer=e.target.value;saveLocal();await trackPresence();});
$('#lobbyTrack').addEventListener('change',e=>{if(isHost)onlineTrack=e.target.value;});
$('#hostStartBtn').addEventListener('click',()=>{if(!isHost||lobbyPlayers.length<2||!lobbyPlayers.every(p=>p.ready))return;const startAt=Date.now()+3300;sendBroadcast('start',{track:onlineTrack,startAt});});

$('#pauseRaceBtn').addEventListener('click',()=>togglePauseMenu());
$('#resumeBtn').addEventListener('click',()=>togglePauseMenu(false));
$('#restartRaceBtn').addEventListener('click',()=>{if(race?.mode!=='online')startRace(race.mode,race.track.key);});
$('#quitRaceBtn').addEventListener('click',()=>{if(race?.mode==='online')leaveRoom(true);else{showScreen('menu');updateSaveStatus();}});
$('#soundToggle').addEventListener('click',()=>{settings.sound=!settings.sound;saveSettings();if(settings.sound){beep('menu');ensureEngine();}else stopEngine();});
function togglePauseMenu(force){if(!race)return;if(race.mode==='online'){race.paused=false;$('#pauseOverlay').classList.toggle('hidden',force===false);return;}race.paused=force===false?false:!race.paused;$('#pauseOverlay').classList.toggle('hidden',!race.paused);if(!race.paused){lastFrame=performance.now();ensureEngine();}else stopEngine();}

$('#resultMenu').addEventListener('click',()=>{if(race?.mode==='online')leaveRoom(true);else{showScreen('menu');updateSaveStatus();}});
$('#resultNext').addEventListener('click',()=>{if(race.mode==='cup'&&profile.cup_progress<5)startCup();else if(race.mode==='online'){localReady=false;trackPresence();showScreen('lobby');renderLobby();}else startRace(race.mode,race.track.key);});

$$('.tabs button').forEach(b=>b.addEventListener('click',()=>renderLeaderboard(b.dataset.board)));
$('#trialTrackFilter').addEventListener('change',()=>renderLeaderboard('trial'));

function saveSettings(){localStorage.setItem('ckc_settings',JSON.stringify(settings));$('#soundSetting').checked=settings.sound;$('#shakeSetting').checked=settings.shake;$('#motionSetting').checked=settings.motion;$('#soundToggle').textContent=settings.sound?'🔊':'🔇';}
$('#soundSetting').addEventListener('change',e=>{settings.sound=e.target.checked;saveSettings();if(!settings.sound)stopEngine();});
$('#shakeSetting').addEventListener('change',e=>{settings.shake=e.target.checked;saveSettings();});
$('#motionSetting').addEventListener('change',e=>{settings.motion=e.target.checked;saveSettings();});

const keyMap={w:'gas',arrowup:'gas',s:'brake',arrowdown:'brake',a:'left',arrowleft:'left',d:'right',arrowright:'right',' ':'drift'};
window.addEventListener('keydown',e=>{if(!$('#race').classList.contains('active'))return;const k=e.key.toLowerCase();if(keyMap[k]){e.preventDefault();inputs[keyMap[k]]=true;}if(k==='e'){e.preventDefault();usePlayerItem();}if(k==='p'){e.preventDefault();togglePauseMenu();}});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(keyMap[k])inputs[keyMap[k]]=false;});
$$('.mobile-controls button').forEach(b=>{const c=b.dataset.control;const down=e=>{e.preventDefault();if(c==='item'){usePlayerItem();return;}if(c==='gas')inputs.gas=true;if(c==='brake')inputs.brake=true;if(c==='left')inputs.left=true;if(c==='right')inputs.right=true;if(c==='drift')inputs.drift=true;};const up=e=>{e.preventDefault();if(c==='gas')inputs.gas=false;if(c==='brake')inputs.brake=false;if(c==='left')inputs.left=false;if(c==='right')inputs.right=false;if(c==='drift')inputs.drift=false;};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);});

function populateStaticUI(){
  $('#itemGuide').innerHTML=ITEMS.map(i=>`<span>${i.icon} <b>${i.name}</b> — ${i.desc}</span>`).join('');
  const trackOpts=TRACKS.map(t=>`<option value="${t.key}">${t.name}</option>`).join('');$('#lobbyTrack').innerHTML=trackOpts;$('#trialTrackFilter').innerHTML=trackOpts;
  const available=RACERS.filter(r=>profile.unlocked_racers.includes(r.key));$('#lobbyRacer').innerHTML=available.map(r=>`<option value="${r.key}">${r.emoji} ${r.name}</option>`).join('');$('#lobbyRacer').value=profile.racer;
}

window.addEventListener('beforeunload',()=>{try{roomChannel?.untrack()}catch{}});

saveSettings();populateStaticUI();updateSaveStatus();renderRacers();
cloudLoad().then(()=>{populateStaticUI();updateSaveStatus();renderRacers();});
