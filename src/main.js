import * as THREE from 'three';

const root = document.querySelector('#game-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ab2c2);
scene.fog = new THREE.Fog(0x8ab2c2, 65, 150);

const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, 0.1, 250);
camera.position.set(0, 25, 34);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd9efff, 0x31452b, 2.0));
const sun = new THREE.DirectionalLight(0xfff1d6, 2.5);
sun.position.set(-22, 38, 18); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-48; sun.shadow.camera.right=48; sun.shadow.camera.top=42; sun.shadow.camera.bottom=-42;
scene.add(sun);

const mat = (color, roughness=.8) => new THREE.MeshStandardMaterial({color, roughness});
const grassMats = [mat(0x236d36), mat(0x28783b)];
const field = new THREE.Group(); scene.add(field);
const pitch = new THREE.Mesh(new THREE.PlaneGeometry(68, 104), grassMats[0]);
pitch.rotation.x=-Math.PI/2; pitch.receiveShadow=true; field.add(pitch);
for(let i=0;i<13;i++){
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(68, 8), grassMats[i%2]);
  stripe.rotation.x=-Math.PI/2; stripe.position.set(0,.008,-48+i*8); field.add(stripe);
}
const lineMat = new THREE.MeshBasicMaterial({color:0xf4f5e8});
function line(x1,z1,x2,z2,w=.13){
  const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz);
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,.035,len),lineMat);
  m.position.set((x1+x2)/2,.035,(z1+z2)/2); m.rotation.y=Math.atan2(dx,dz); field.add(m);
}
line(-34,-52,34,-52);line(-34,52,34,52);line(-34,-52,-34,52);line(34,-52,34,52);
line(-34,0,34,0);
line(-20,-52,-20,-36);line(20,-52,20,-36);line(-20,-36,20,-36);
line(-20,52,-20,36);line(20,52,20,36);line(-20,36,20,36);
line(-9,-52,-9,-46);line(9,-52,9,-46);line(-9,-46,9,-46);
line(-9,52,-9,46);line(9,52,9,46);line(-9,46,9,46); 
const circle = new THREE.Mesh(new THREE.TorusGeometry(9.15,.12,8,80),lineMat);circle.rotation.x=Math.PI/2;circle.position.y=.05;field.add(circle);
const spot = new THREE.Mesh(new THREE.CircleGeometry(.22,16),lineMat);spot.rotation.x=-Math.PI/2;spot.position.set(0,.06,0);field.add(spot);
function box(parent,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function goal(z){
 const g=new THREE.Group();scene.add(g);const white=mat(0xf0eee4), net= new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.32});
 const dir=z<0?-1:1, gz=z;
 box(g,7.32,.18,.18,0,2.44,gz,white);box(g,.18,2.44,.18,-3.66,1.22,gz,white);box(g,.18,2.44,.18,3.66,1.22,gz,white);
 const back=new THREE.Mesh(new THREE.BoxGeometry(7.2,2.35,2.2),net);back.position.set(0,1.2,gz+dir*1.05);g.add(back);
 return g;
}
goal(-51.7);goal(51.7);
// Instanced crowd seating gives the stadium a populated, layered 3D feel.
const crowdGeo=new THREE.SphereGeometry(.22,6,5);
const crowdMats=[mat(0x78919b),mat(0x9a7770),mat(0xd2c7a1),mat(0x456e69),mat(0x343d54)];
for(const side of [-1,1]){
 const crowd=new THREE.InstancedMesh(crowdGeo,crowdMats[0],420);
 const dummy=new THREE.Object3D();
 for(let n=0;n<420;n++){
  const row=Math.floor(n/70),col=n%70;
  dummy.position.set(side*(35+row*1.0),6.4+row*.27,-49+col*1.42);
  dummy.scale.set(.8,.8,.8);dummy.updateMatrix();crowd.setMatrixAt(n,dummy.matrix);
  crowd.setColorAt(n,new THREE.Color([0x78919b,0x9a7770,0xd2c7a1,0x456e69,0x343d54][(n*7+row)%5]));
 }
 crowd.instanceMatrix.needsUpdate=true;scene.add(crowd);
}
// Low-profile stadium stands and floodlight towers
const standMat=mat(0x34424a), seatMat=mat(0x66747a);
for(const side of [-1,1]){
  box(scene,8,7,110,side*39,3,-0,standMat);
  for(let r=0;r<5;r++) box(scene,8,.22,110,side*(35+r*.85),6.2+r*.24,0,seatMat);
  for(const z of [-38,-13,13,38]){box(scene,.35,18,.35,side*43,9,z,mat(0x25343a));box(scene,4,.25,2,side*43,18,z,mat(0xe9f3ff));}
}
for(const z of [-55,55]) box(scene,76,5,5,0,2,z,standMat);

const ball = new THREE.Mesh(new THREE.SphereGeometry(.36,24,18),mat(0xf7f7f2,.35));
ball.castShadow=true;ball.position.set(0,.38,0);scene.add(ball);
const ballMark=new THREE.Mesh(new THREE.SphereGeometry(.365,16,12),new THREE.MeshBasicMaterial({color:0x171717,wireframe:true,transparent:true,opacity:.25}));ball.add(ballMark);

function makePlayer(team,x,z,height=1.8,stats={}){
 const group=new THREE.Group();scene.add(group);group.position.set(x,0,z);
 const shirt=mat(team==='white'?0xf3f2e9:0x171b20), shorts=mat(team==='white'?0x26313a:0x090b0d), skin=mat(0xb9825c), socks=mat(team==='white'?0xf7f7f2:0x252a30), boots=mat(0xd7d8d4,.45);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34*height/1.8,.62*height/1.8,7,14),shirt);torso.position.y=height*.59;torso.castShadow=true;group.add(torso);
 const chestStripe=new THREE.Mesh(new THREE.BoxGeometry(.11,.72*height/1.8,.025),mat(team==='white'?0x9b2424:0x6bb9c8));chestStripe.position.set(0,height*.63,.335);group.add(chestStripe);
 const shortsMesh=new THREE.Mesh(new THREE.BoxGeometry(.52,.28,.34),shorts);shortsMesh.position.y=height*.29;shortsMesh.castShadow=true;group.add(shortsMesh);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.19*height/1.8,20,16),skin);head.position.y=height*.99;head.castShadow=true;group.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.195*height/1.8,16,10,0,Math.PI*2,0,Math.PI*.52),mat(0x201b18));hair.position.y=height*1.025;group.add(hair);
 const legGeo=new THREE.CapsuleGeometry(.105*height/1.8,.43*height/1.8,5,10);
 for(const s of [-1,1]){
  const leg=new THREE.Mesh(legGeo,socks);leg.position.set(s*.16*height/1.8,height*.19,0);leg.castShadow=true;group.add(leg);
  const boot=new THREE.Mesh(new THREE.BoxGeometry(.19,.12,.34),boots);boot.position.set(s*.16*height/1.8,.09,.09);boot.castShadow=true;group.add(boot);
  const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.43,5,10),shirt);arm.position.set(s*.38,height*.62,0);arm.rotation.z=s*.18;arm.castShadow=true;group.add(arm);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),skin);hand.position.set(s*.4,height*.36,.01);group.add(hand);
 }
 const player={group,team,stats:{speed:stats.speed??7.2,strength:stats.strength??70,agility:stats.agility??70,stamina:stats.stamina??100,shoot:stats.shoot??70,pass:stats.pass??70},velocity:new THREE.Vector3(),height,hasBall:false};
 players.push(player);return player;
}
const players=[];
const white=[makePlayer('white',-7,12,1.78),makePlayer('white',7,12,1.84),makePlayer('white',0,25,1.72)];
const black=[makePlayer('black',-7,-12,1.9),makePlayer('black',7,-12,1.75),makePlayer('black',0,-25,1.82)];
let controlled=white[0], scoreW=0,scoreB=0,elapsed=0;
const keys={};
let joystickInput={x:0,z:0};
let sprinting=false;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Tab'){e.preventDefault();const i=white.indexOf(controlled);controlled=white[(i+1)%white.length];}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.key===' ')sprinting=false;});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key; b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false));});
const msg=document.querySelector('#message');
function closestTeamMate(){return white.filter(p=>p!==controlled).sort((a,b)=>a.group.position.distanceTo(ball.position)-b.group.position.distanceTo(ball.position))[0];}
function passBall(){
 if(ball.position.distanceTo(controlled.group.position)>3.2){msg.textContent='اقترب من الكرة أولاً';return;}
 const target=closestTeamMate();const dir=target.group.position.clone().sub(ball.position).normalize();ballVel.copy(dir.multiplyScalar(15));ballVel.y=2.2;msg.textContent='تمرير!';
}
function throughBall(){
 if(ball.position.distanceTo(controlled.group.position)>4){msg.textContent='اقترب من الكرة أولاً';return;}
 const target=closestTeamMate();const dir=target.group.position.clone().sub(ball.position).normalize();ballVel.copy(dir.multiplyScalar(20));ballVel.y=3.1;msg.textContent='بينية للأمام!';
}
function tackle(){
 const rival=black.slice().sort((a,b)=>a.group.position.distanceTo(controlled.group.position)-b.group.position.distanceTo(controlled.group.position))[0];
 if(rival && rival.group.position.distanceTo(controlled.group.position)<2.25){
   const toward=controlled.group.position.clone().sub(rival.group.position).normalize();rival.group.position.addScaledVector(toward,1.1);
   ball.position.copy(controlled.group.position).add(new THREE.Vector3(0,.38,-.75));ballVel.set(0,0,0);msg.textContent='افتكاك ناجح للكرة!';
 } else msg.textContent='اقترب من المنافس لتنفيذ الالتحام';
}
function shootBall(){
 if(ball.position.distanceTo(controlled.group.position)>3.2){msg.textContent='اقترب من الكرة أولاً';return;}
 const dir=new THREE.Vector3(-ball.position.x*.025,0,-Math.sign(controlled.group.position.z||1));
 dir.x+=(Math.random()-.5)*.22;dir.normalize();
 const weakFoot=0.8;const power=controlled.stats.shoot*weakFoot/100;
 ballVel.copy(dir.multiplyScalar(13+power*15));ballVel.y=3+power*3;msg.textContent='تسديدة!';
}
addEventListener('keydown',e=>{if(e.repeat)return;if(e.key.toLowerCase()==='j')passBall();if(e.key.toLowerCase()==='k')shootBall();if(e.key.toLowerCase()==='i')throughBall();if(e.key.toLowerCase()===' ')sprinting=true;if(e.key.toLowerCase()==='e')tackle();});
document.querySelector('[data-action="pass"]').addEventListener('pointerdown',e=>{e.preventDefault();passBall();});
document.querySelector('[data-action="shoot"]').addEventListener('pointerdown',e=>{e.preventDefault();shootBall();});
document.querySelector('[data-action="through"]').addEventListener('pointerdown',e=>{e.preventDefault();throughBall();});
const sprintTackleButton=document.querySelector('[data-action="sprint-tackle"]');
let sprintTacklePointer=null;
sprintTackleButton.addEventListener('pointerdown',e=>{
 e.preventDefault();sprintTacklePointer=e.pointerId;
 const nearestOpponent=black.reduce((best,p)=>!best||p.group.position.distanceTo(controlled.group.position)<best.group.position.distanceTo(controlled.group.position)?p:best,null);
 if(nearestOpponent && nearestOpponent.group.position.distanceTo(controlled.group.position)<2.7){tackle();sprinting=false;}
 else {sprinting=true;sprintTackleButton.classList.add('pressed');}
});
function releaseSprintTackle(e){if(e.pointerId!==sprintTacklePointer)return;sprintTacklePointer=null;sprinting=false;sprintTackleButton.classList.remove('pressed');}
['pointerup','pointerleave','pointercancel','lostpointercapture'].forEach(ev=>sprintTackleButton.addEventListener(ev,releaseSprintTackle));
const stick=document.querySelector('#virtual-stick'),knob=document.querySelector('#stick-knob');
let stickPointer=null;
function updateStick(e){
 const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 let dx=e.clientX-cx,dy=e.clientY-cy;const max=rect.width*.32,len=Math.hypot(dx,dy);
 if(len>max){dx=dx/len*max;dy=dy/len*max;}
 joystickInput={x:dx/max,z:dy/max};knob.style.transform=`translate(${dx}px,${dy}px)`;
}
stick.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(stickPointer);updateStick(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)updateStick(e);});
function releaseStick(e){if(e.pointerId!==stickPointer)return;stickPointer=null;joystickInput={x:0,z:0};knob.style.transform='translate(0,0)';}
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stick.addEventListener(ev,releaseStick));
let ballVel=new THREE.Vector3();
function moveToward(p,target,dt,maxSpeed){
 const d=target.clone().sub(p.group.position);d.y=0;
 if(d.lengthSq()>.01){d.normalize();p.velocity.lerp(d.multiplyScalar(maxSpeed),Math.min(1,dt*5));p.group.position.addScaledVector(p.velocity,dt);p.group.rotation.y=Math.atan2(p.velocity.x,p.velocity.z);}
 else p.velocity.multiplyScalar(.85);
}
function resolveDuel(a,b){
 const delta=a.group.position.clone().sub(b.group.position);delta.y=0;const dist=delta.length();
 if(dist<.85){const powerA=a.stats.strength*.6+a.stats.agility*.25+a.stats.stamina*.15;const powerB=b.stats.strength*.6+b.stats.agility*.25+b.stats.stamina*.15;const winner=powerA>=powerB?a:b,loser=winner===a?b:a;delta.normalize();loser.group.position.addScaledVector(delta,-.18);winner.stats.stamina=Math.max(20,winner.stats.stamina-.025);}
}
function resetBall(){ball.position.set(0,.38,0);ballVel.set(0,0,0);white.forEach(p=>p.group.position.z=Math.abs(p.group.position.z));black.forEach(p=>p.group.position.z=-Math.abs(p.group.position.z));}
const clockEl=document.querySelector('#clock'),scoreEl=document.querySelector('#score');
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.035);elapsed+=dt;
 // Human-controlled player
 const input=new THREE.Vector3((keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joystickInput.x,0,(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joystickInput.z);
 if(input.lengthSq()>0){input.clampLength(0,1);const moveSpeed=controlled.stats.speed*(sprinting?1.48:1);controlled.velocity.lerp(input.clone().multiplyScalar(moveSpeed),Math.min(1,dt*8));controlled.group.position.addScaledVector(controlled.velocity,dt);controlled.group.rotation.y=Math.atan2(input.x,input.z);}
 else controlled.velocity.multiplyScalar(.82);
 // Teammates seek useful positions; opponents press the ball
 for(const p of white){if(p!==controlled){const target=ball.position.clone().add(new THREE.Vector3(p.group.position.x*.18,0,Math.max(4,p.group.position.z*.18)));moveToward(p,target,dt,p.stats.speed*.65);}}
 for(const p of black){const target=ball.position.clone();target.z+=Math.sign(-ball.position.z)*1.0;moveToward(p,target,dt,p.stats.speed*.72);}
 // Keep players inside the pitch
 for(const p of players){p.group.position.x=THREE.MathUtils.clamp(p.group.position.x,-32,32);p.group.position.z=THREE.MathUtils.clamp(p.group.position.z,-50,50);for(const q of players)if(q!==p&&q.team!==p.team)resolveDuel(p,q);}
 // Ball integration: custom gameplay physics (gravity, rolling drag, bounces)
 ballVel.y-=9.81*dt;ball.position.addScaledVector(ballVel,dt);
 if(ball.position.y<.36){ball.position.y=.36;if(ballVel.y<0)ballVel.y*=-.34;ballVel.x*=.985;ballVel.z*=.985;}
 ballVel.multiplyScalar(Math.pow(.992,dt*60));
 // Nearby player can collect a slow ball
 for(const p of players){const d=p.group.position.distanceTo(ball.position);if(d<.95&&ballVel.length()<5){ball.position.x=THREE.MathUtils.lerp(ball.position.x,p.group.position.x,Math.min(1,dt*7));ball.position.z=THREE.MathUtils.lerp(ball.position.z,p.group.position.z+ (p.team==='white'?-0.7:0.7),Math.min(1,dt*7));}}
 // Goals
 if(Math.abs(ball.position.z)>52 && Math.abs(ball.position.x)<3.65 && ball.position.y<2.5){if(ball.position.z<0)scoreW++;else scoreB++;scoreEl.textContent=`${scoreW} - ${scoreB}`;msg.textContent='GOAL!';resetBall();}
 if(Math.abs(ball.position.x)>34||Math.abs(ball.position.z)>56){resetBall();}
 // Camera follows ball and controlled player with a broadcast-like elevated view
 const focus=ball.position.clone().lerp(controlled.group.position,.28);const desired=new THREE.Vector3(focus.x*.28,22,focus.z+31);
 camera.position.lerp(desired,Math.min(1,dt*2.3));camera.lookAt(focus.x,0,focus.z-5);
 ball.rotation.x+=ballVel.z*dt*.8;ball.rotation.z-=ballVel.x*dt*.8;
 clockEl.textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;
 renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});



// UT 27 interface controller: keeps the original Three.js match prototype intact.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const gameRoot = $('#game-root');
const appShell = $('#app-shell');
const languageScreen = $('#language-screen');
const starterScreen = $('#starter-screen');
const quickMenu = $('#quick-menu');
const matchHud = $('#match-hud');
const matchControls = $('#match-controls');
const difficultyPanel = $('#difficulty-panel');
let selectedDifficulty = '';
let coins = 5436;
let currentTab = 'home';
let quickIndex = 0;
let activeQuickItems = [];
let lastPadButtons = [];

gameRoot.classList.add('game-hidden');

function setLanguage(lang) {
  localStorage.setItem('ut27-language', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $('#language-setting').value = lang;
  if (lang === 'en') {
    document.querySelector('[data-i18n="chooseLeague"]').textContent = 'Choose your starter league pack';
    document.querySelector('[data-i18n="chooseLeagueHint"]').textContent = 'Choose one league to receive your starter pack';
    document.querySelector('[data-i18n="continue"]').textContent = 'Continue';
  } else {
    document.querySelector('[data-i18n="chooseLeague"]').textContent = 'اختر باك الدوري التأسيسي';
    document.querySelector('[data-i18n="chooseLeagueHint"]').textContent = 'اختر دوريًا واحدًا لتحصل على باك البداية';
    document.querySelector('[data-i18n="continue"]').textContent = 'متابعة';
  }
}
function showScreen(screen) {
  [languageScreen, starterScreen, appShell].forEach(el => el.classList.add('hidden'));
  screen.classList.remove('hidden');
}
function openApp() {
  showScreen(appShell);
  switchTab('home');
}
const savedLanguage = localStorage.getItem('ut27-language');
if (savedLanguage) {
  setLanguage(savedLanguage);
  if (localStorage.getItem('ut27-starter-done') === 'yes') openApp();
  else showScreen(starterScreen);
} else showScreen(languageScreen);

$$('[data-language]').forEach(btn => btn.addEventListener('click', () => {
  setLanguage(btn.dataset.language);
  if (localStorage.getItem('ut27-starter-done') === 'yes') openApp();
  else showScreen(starterScreen);
}));

$$('.league-choice').forEach(btn => btn.addEventListener('click', () => {
  $$('.league-choice').forEach(x => x.classList.remove('chosen'));
  btn.classList.add('chosen');
  $('#starter-result').textContent = `تم اختيار ${btn.dataset.league} — باك البداية جاهز للفتح`;
  $('#starter-continue').classList.remove('hidden');
}));
$('#starter-continue').addEventListener('click', () => {
  localStorage.setItem('ut27-starter-done', 'yes');
  openApp();
  showPackModal('Starter Pack', 0);
});


const eventPlayers = [
  {name:"Senne Lammens",rating:86,position:"GK",featured:true},
  {name:"Marcos Llorente",rating:88,position:"RB",featured:true},
  {name:"Diogo Travassos",rating:85,position:"RB",featured:true},
  {name:"Alessandro Bastoni",rating:88,position:"CB",featured:true},
  {name:"Matthias Ginter",rating:86,position:"CB",featured:false},
  {name:"Fikayo Tomori",rating:86,position:"CB",featured:false},
  {name:"Cristian Romero",rating:85,position:"CB",featured:false},
  {name:"Maxim De Cuyper",rating:86,position:"LB",featured:false},
  {name:"Ryan Gravenberch",rating:88,position:"CDM",featured:false},
  {name:"Yui Hasegawa",rating:89,position:"CDM",featured:false},
  {name:"Pedri",rating:91,position:"CM",featured:false},
  {name:"Zambo Anguissa",rating:86,position:"CM",featured:false},
  {name:"Gabri Veiga",rating:85,position:"CM",featured:false},
  {name:"Lamine Camara",rating:85,position:"CM",featured:false},
  {name:"Aitana Bonmatí",rating:90,position:"CM",featured:false},
  {name:"Géraldine Reuteler",rating:86,position:"CM",featured:false},
  {name:"Andreia Jacinto",rating:86,position:"CM",featured:false},
  {name:"Jude Bellingham",rating:91,position:"CAM",featured:false},
  {name:"Francisco Conceição",rating:87,position:"CAM",featured:false},
  {name:"Matías Soulé",rating:85,position:"CAM",featured:false},
  {name:"Younes Taha",rating:85,position:"CAM",featured:false},
  {name:"Sakina Karchaoui",rating:88,position:"RM",featured:false},
  {name:"Timothy Weah",rating:85,position:"RM",featured:false},
  {name:"Ousmane Dembélé",rating:91,position:"RW",featured:false},
  {name:"Luis Díaz",rating:90,position:"LM",featured:false},
  {name:"Alyssa Thompson",rating:87,position:"LM",featured:false},
  {name:"Jérémy Doku",rating:87,position:"LW",featured:false},
  {name:"Rafael Leão",rating:87,position:"LW",featured:false},
  {name:"Tabitha Chawinga",rating:89,position:"LW",featured:false},
  {name:"Romelu Lukaku",rating:87,position:"ST",featured:false}
];
function buildPlayerCard(player,index,featured=false) {
  const card=document.createElement('button');
  card.type='button'; card.className=`visual-player-card card-tone-${index%6}${featured?' featured':''}`;
  card.setAttribute('aria-label',`فتح بطاقة ${player.name}، تقييم ${player.rating}`);
  card.dataset.playerIndex=String(index);
  card.innerHTML=`<span class="card-rating">${player.rating}</span><span class="card-position">${player.position}</span><span class="card-portrait"></span><span class="card-player-name">${player.name}</span><span class="card-foot-mark">RTTK</span>`;
  card.addEventListener('click',()=>openPlayerModal(player,index));
  return card;
}
function renderEventCards(){
  const grid=$('#event-card-grid'),featured=$('#featured-card-grid');
  if(!grid||!featured)return;
  grid.replaceChildren();featured.replaceChildren();
  eventPlayers.forEach((p,i)=>grid.appendChild(buildPlayerCard(p,i)));
  [23,17,10,24].forEach(i=>featured.appendChild(buildPlayerCard(eventPlayers[i],i,true)));
}
let selectedPlayer=null;
function openPlayerModal(player,index){
  selectedPlayer={player,index};
  $('#player-modal-title').textContent=player.name+` • ${player.position} • ${player.rating}`;
  $('#player-modal-art').className=`player-modal-art card-tone-${index%6}`; $('#player-modal-art').innerHTML=`<b>${'${player.rating}'}</b><span>${'${player.position}'}</span><strong>${'${player.name}'}</strong><small>ROAD TO THE KNOCKOUTS</small>`;
  $('#player-actions').classList.add('hidden');
  $('#player-confirm').classList.remove('hidden');
  $('#player-modal').classList.remove('hidden');
}
function closePlayerModal(){$('#player-modal').classList.add('hidden');selectedPlayer=null;}
renderEventCards();
$('#player-confirm').addEventListener('click',()=>{
  $('#player-actions').classList.remove('hidden');
  $('#player-confirm').classList.add('hidden');
});
$$('[data-close-player]').forEach(btn=>btn.addEventListener('click',closePlayerModal));
$$('[data-player-action]').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.playerAction;
  if(action==='back'){closePlayerModal();}
  else if(action==='squad'||action==='sbc'){closePlayerModal();switchTab(action);}
  else {
    $('#player-modal-title').textContent='الأنماط الأساسية';
    $('#player-actions').innerHTML='<button type="button">أساسي</button><button type="button">هجومي</button><button type="button">دفاعي</button><button type="button" data-player-back>رجوع</button>';
    $('#player-actions').querySelector('[data-player-back]').addEventListener('click',()=>{
      $('#player-modal-title').textContent=selectedPlayer?.player.name||'لاعب الحدث';
      $('#player-actions').innerHTML='<button data-player-action="styles">الأنماط الأساسية</button><button data-player-action="squad">إضافة للتشكيلة</button><button data-player-action="sbc">استخدام في SBC</button><button data-player-action="back">رجوع</button>';
      $('#player-actions [data-player-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.playerAction;if(a==='back')closePlayerModal();else if(a==='squad'||a==='sbc'){closePlayerModal();switchTab(a);}else $('#player-modal-title').textContent='الأنماط الأساسية';}));
    });
  }
}));

function switchTab(tab) {
  currentTab = tab;
  $$('.page').forEach(page => page.classList.toggle('active', page.dataset.page === tab));
  $$('.tab-btn, .bottom-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  if (tab === 'settings') $('#language-setting').value = localStorage.getItem('ut27-language') || 'ar';
  closeQuick();
}
$$('.tab-btn, .bottom-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
$$('[data-open-tab]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.openTab)));
$('#settings-shortcut').addEventListener('click', () => switchTab('settings'));

function openQuick() {
  activeQuickItems = $$('.quick-items button');
  quickIndex = Math.max(0, activeQuickItems.findIndex(btn => btn.dataset.tab === currentTab));
  quickMenu.classList.remove('hidden');
  activeQuickItems.forEach((btn, i) => btn.classList.toggle('focused', i === quickIndex));
}
function closeQuick() { quickMenu.classList.add('hidden'); }
function moveQuick(delta) {
  if (quickMenu.classList.contains('hidden')) return;
  quickIndex = (quickIndex + delta + activeQuickItems.length) % activeQuickItems.length;
  activeQuickItems.forEach((btn, i) => btn.classList.toggle('focused', i === quickIndex));
  activeQuickItems[quickIndex]?.scrollIntoView({block:'nearest'});
}
function chooseQuick() { if (!quickMenu.classList.contains('hidden')) activeQuickItems[quickIndex]?.click(); }
$('#close-quick').addEventListener('click', closeQuick);
$('#quick-menu-toggle').addEventListener('click', () => quickMenu.classList.contains('hidden') ? openQuick() : closeQuick());
$('.quick-items button').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
$$('[data-sbc-tab]').forEach(btn => btn.addEventListener('click', () => {
  $$('[data-sbc-tab]').forEach(x => x.classList.toggle('selected', x === btn));
  const mode = btn.dataset.sbcTab;
  $('#sbc-challenge-grid .challenge-card').forEach(card => {
    const tag = card.querySelector('.event-tag')?.textContent.trim().toLowerCase() || '';
    card.classList.toggle('hidden', mode === 'upgrades' ? !tag.includes('upgrade') : mode === 'challenges' ? tag.includes('upgrade') : false);
  });
}));

$('#open-squad-battles').addEventListener('click', () => {
  difficultyPanel.classList.remove('hidden');
  difficultyPanel.scrollIntoView({behavior:'smooth', block:'nearest'});
});
$$$('[data-close-panel]').forEach(btn => btn.addEventListener('click', () => difficultyPanel.classList.add('hidden')));
$$$('[data-difficulty]').forEach(btn => btn.addEventListener('click', () => {
  $$('.difficulty-grid button').forEach(x => x.classList.remove('chosen'));
  btn.classList.add('chosen');
  selectedDifficulty = btn.dataset.difficulty;
  $('#difficulty-note').textContent = `الصعوبة المختارة: ${selectedDifficulty}`;
  $('#start-match').disabled = false;
}));
$('#start-match').addEventListener('click', () => {
  if (!selectedDifficulty) return;
  $('#difficulty-note').textContent = `بدأت المباراة على مستوى ${selectedDifficulty}`;
  appShell.classList.add('hidden');
  gameRoot.classList.remove('game-hidden');
  matchHud.classList.remove('hidden');
  matchControls.classList.remove('hidden');
  $('#message').textContent = `Squad Battles • ${selectedDifficulty}`;
});
function leaveMatch() {
  gameRoot.classList.add('game-hidden');
  matchHud.classList.add('hidden');
  matchControls.classList.add('hidden');
  appShell.classList.remove('hidden');
  switchTab('play');
  difficultyPanel.classList.remove('hidden');
}
$('#leave-match').addEventListener('click', leaveMatch);

function showPackModal(name, price) {
  if (price > coins) { $('#pack-title').textContent = name; $('#pack-message').textContent = 'رصيدك من الكوينز غير كافٍ.'; }
  else {
    coins -= price;
    $('#coin-count').textContent = coins.toLocaleString('en-US');
    $('#store-coins').textContent = coins.toLocaleString('en-US');
    $('#pack-title').textContent = name;
    $('#pack-message').textContent = 'تم فتح باك تجريبي. العناصر المعروضة ليست لاعبين حقيقيين أو احتمالات رسمية.';
  }
  $('#pack-modal').classList.remove('hidden');
}
$$('.pack-open').forEach(btn => btn.addEventListener('click', () => showPackModal(btn.dataset.pack, Number(btn.dataset.price))));
$$$('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => $('#pack-modal').classList.add('hidden')));
$('#search-player').addEventListener('click', () => {
  const q = $('#player-search').value.trim();
  $('#market-results').innerHTML = q
    ? `<span>⌕</span><h3>البحث عن: ${q.replace(/[&<>"]/g, '')}</h3><p>السوق غير متصل بعد. سيتم تفعيل البحث بعد بناء قاعدة بيانات UT 27.</p>`
    : '<span>⌕</span><h3>اكتب اسم لاعب للبحث</h3>';
});
$('#language-setting').addEventListener('change', e => setLanguage(e.target.value));
$('#graphics-setting').addEventListener('change', e => localStorage.setItem('ut27-graphics', e.target.value));
$('#fps-setting').addEventListener('change', e => localStorage.setItem('ut27-fps', e.target.value));

// Controller support: L1/R1 switch top-level tabs; L2 opens quick navigation.
const mainTabOrder = ['home','play','objectives','squad','sbc','transfers','store'];
function shiftMainTab(delta) {
  const i = mainTabOrder.indexOf(currentTab);
  const next = mainTabOrder[(Math.max(i,0) + delta + mainTabOrder.length) % mainTabOrder.length];
  switchTab(next);
}
function pressed(pad, index) { return !!pad?.buttons?.[index]?.pressed; }
function pollGamepad() {
  const pad = navigator.getGamepads?.().find(Boolean);
  if (pad) {
    const now = pad.buttons.map(b => b.pressed);
    const just = i => !!now[i] && !lastPadButtons[i];
    if (just(4)) shiftMainTab(-1); // L1
    if (just(5)) shiftMainTab(1);  // R1
    if (just(6)) quickMenu.classList.contains('hidden') ? openQuick() : closeQuick(); // L2
    if (just(12)) moveQuick(-1);
    if (just(13)) moveQuick(1);
    if (just(0)) {
      if (!$('#player-modal').classList.contains('hidden')) {
        if ($('#player-actions').classList.contains('hidden')) $('#player-confirm').click();
      } else chooseQuick();
    } // X
    if (just(1)) {
      if (!quickMenu.classList.contains('hidden')) closeQuick();
      else if (!difficultyPanel.classList.contains('hidden')) difficultyPanel.classList.add('hidden');
    } // O
    lastPadButtons = now;
  } else lastPadButtons = [];
  requestAnimationFrame(pollGamepad);
}
requestAnimationFrame(pollGamepad);

// Keyboard fallback mirrors the controller for desktop testing.
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (!$('#player-modal').classList.contains('hidden')) {
    if (e.key.toLowerCase()==='x' && $('#player-actions').classList.contains('hidden')) $('#player-confirm').click();
    if (e.key==='Escape') closePlayerModal();
    return;
  }
  if (e.key === 'Escape' || e.key.toLowerCase() === 'l') {
    if (quickMenu.classList.contains('hidden')) openQuick(); else closeQuick();
  }
  if (!quickMenu.classList.contains('hidden')) {
    if (e.key === 'ArrowUp') moveQuick(-1);
    if (e.key === 'ArrowDown') moveQuick(1);
    if (e.key === 'Enter') chooseQuick();
  } else if (e.key === 'PageUp') shiftMainTab(-1);
  else if (e.key === 'PageDown') shiftMainTab(1);
});