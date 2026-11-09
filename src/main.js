import * as THREE from 'three';

const root = document.querySelector('#game-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ab2c2);
scene.fog = new THREE.Fog(0x8ab2c2, 65, 150);

const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.1, 320);
camera.position.set(43, 9.5, 0);
camera.lookAt(0, 1.15, 0);
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
const pitch = new THREE.Mesh(new THREE.PlaneGeometry(76, 120), grassMats[0]);
pitch.rotation.x=-Math.PI/2; pitch.receiveShadow=true; field.add(pitch);
for(let i=0;i<13;i++){
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(76, 8), grassMats[i%2]);
  stripe.rotation.x=-Math.PI/2; stripe.position.set(0,.008,-56+i*8.62); field.add(stripe);
}
const lineMat = new THREE.MeshBasicMaterial({color:0xf4f5e8});
function line(x1,z1,x2,z2,w=.13){
  const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz);
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,.035,len),lineMat);
  m.position.set((x1+x2)/2,.035,(z1+z2)/2); m.rotation.y=Math.atan2(dx,dz); field.add(m);
}
line(-38,-60,38,-60);line(-38,60,38,60);line(-38,-60,-38,60);line(38,-60,38,60);
line(-38,0,38,0);
line(-22,-60,-22,-42);line(22,-60,22,-42);line(-22,-42,22,-42);
line(-22,60,-22,42);line(22,60,22,42);line(-22,42,22,42);
line(-10,-60,-10,-52);line(10,-60,10,-52);line(-10,-52,10,-52);
line(-10,60,-10,52);line(10,60,10,52);line(-10,52,10,52); 
const circle = new THREE.Mesh(new THREE.TorusGeometry(9.15,.12,8,80),lineMat);circle.rotation.x=Math.PI/2;circle.position.y=.05;field.add(circle);
const spot = new THREE.Mesh(new THREE.CircleGeometry(.22,16),lineMat);spot.rotation.x=-Math.PI/2;spot.position.set(0,.06,0);field.add(spot);
function box(parent,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function goal(z){
 const g=new THREE.Group();scene.add(g);const white=mat(0xf7f5eb),net=new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.42});
 const dir=z<0?-1:1,w=9.76,h=3.2;
 box(g,w,.2,.2,0,h,z,white);box(g,.2,h,.2,-w/2,h/2,z,white);box(g,.2,h,.2,w/2,h/2,z,white);
 const back=new THREE.Mesh(new THREE.BoxGeometry(w-.15,h-.12,3.1),net);back.position.set(0,h/2,z+dir*1.5);g.add(back);
 return g;
}
goal(-59.7);goal(59.7);
// Instanced crowd seating gives the stadium a populated, layered 3D feel.
const crowdGeo=new THREE.SphereGeometry(.22,6,5);
const crowdMats=[mat(0x78919b),mat(0x9a7770),mat(0xd2c7a1),mat(0x456e69),mat(0x343d54)];
for(const side of [-1,1]){
 const crowd=new THREE.InstancedMesh(crowdGeo,crowdMats[0],420);
 const dummy=new THREE.Object3D();
 for(let n=0;n<420;n++){
  const row=Math.floor(n/70),col=n%70;
  dummy.position.set(side*(49+row*.8),7.1+row*.3,-57+col*1.62);
  dummy.scale.set(.8,.8,.8);dummy.updateMatrix();crowd.setMatrixAt(n,dummy.matrix);
  crowd.setColorAt(n,new THREE.Color([0x78919b,0x9a7770,0xd2c7a1,0x456e69,0x343d54][(n*7+row)%5]));
 }
 crowd.instanceMatrix.needsUpdate=true;scene.add(crowd);
}
// Low-profile stadium stands and floodlight towers
const standMat=mat(0x34424a), seatMat=mat(0x66747a);
for(const side of [-1,1]){
  box(scene,9,8,124,side*57,3,0,standMat);
  for(let r=0;r<5;r++) box(scene,9,.24,124,side*(52+r*.95),7.2+r*.28,0,seatMat);
  for(const z of [-46,-16,16,46]){box(scene,.4,20,.4,side*63,10,z,mat(0x25343a));box(scene,4.5,.3,2.2,side*63,20,z,mat(0xe9f3ff));}
}
for(const z of [-64,64]) box(scene,84,6,6,0,2,z,standMat);

const ball = new THREE.Mesh(new THREE.SphereGeometry(.36,24,18),mat(0xf7f7f2,.35));
ball.castShadow=true;ball.position.set(0,.38,0);scene.add(ball);
const ballMark=new THREE.Mesh(new THREE.SphereGeometry(.365,16,12),new THREE.MeshBasicMaterial({color:0x171717,wireframe:true,transparent:true,opacity:.25}));ball.add(ballMark);

function makePlayer(team,x,z,height=1.8,stats={},card=null){
 const group=new THREE.Group();scene.add(group);group.position.set(x,0,z);
 const home=team==='white',scale=height/1.8;
 const shirt=mat(home?0xf4f1e8:0x151b25),shorts=mat(home?0x26313a:0x090d14),skin=mat([0x8d5b3d,0xb9825c,0xd39a72,0x70462f][players.length%4]),socks=mat(home?0xf2f1e9:0x222a32),boots=mat(home?0xd8dce0:0xe3c35c,.42),trim=mat(home?0xa52b36:0x58b8c8);
 const sphere=(geo,material,x,y,z,sc=[1,1,1])=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(...sc);m.castShadow=true;group.add(m);return m;};
 const capsule=(r,len,material)=>new THREE.Mesh(new THREE.CapsuleGeometry(r,len,5,10),material);
 const torso=sphere(new THREE.SphereGeometry(.3,16,12),shirt,0,.99*scale,0,[1.04*scale,1.42*scale,.72*scale]);
 sphere(new THREE.SphereGeometry(.25,14,10),shorts,0,.57*scale,0,[1,.68,.8]);
 sphere(new THREE.CylinderGeometry(.075*scale,.085*scale,.14*scale,10),skin,0,1.37*scale,0);
 sphere(new THREE.SphereGeometry(.17*scale,20,16),skin,0,1.57*scale,.015);
 sphere(new THREE.SphereGeometry(.178*scale,16,10,0,Math.PI*2,0,Math.PI*.55),mat([0x191513,0x30231b,0x6b4228][players.length%3]),0,1.65*scale,-.005);
 sphere(new THREE.SphereGeometry(.035*scale,10,8),skin,-.177*scale,1.57*scale,0,[.65,1,1]);
 sphere(new THREE.SphereGeometry(.035*scale,10,8),skin,.177*scale,1.57*scale,0,[.65,1,1]);
 const eyeMat=mat(0x211a17,.35);
 sphere(new THREE.SphereGeometry(.018*scale,8,6),eyeMat,-.064*scale,1.59*scale,.158*scale);
 sphere(new THREE.SphereGeometry(.018*scale,8,6),eyeMat,.064*scale,1.59*scale,.158*scale);
 const nose=sphere(new THREE.ConeGeometry(.035*scale,.09*scale,8),skin,0,1.55*scale,.19*scale);nose.rotation.x=Math.PI/2;
 const legs=[],arms=[];
 for(const side of [-1,1]){
  sphere(new THREE.SphereGeometry(.115*scale,12,10),shirt,side*.29*scale,1.25*scale,0,[1,.95,1]);
  const armPivot=new THREE.Group();armPivot.position.set(side*.34*scale,1.23*scale,0);group.add(armPivot);
  const upper=capsule(.075*scale,.24*scale,shirt);upper.position.set(side*.025*scale,-.15*scale,0);upper.rotation.z=side*-.12;armPivot.add(upper);
  const fore=capsule(.062*scale,.22*scale,skin);fore.position.set(side*.055*scale,-.39*scale,.04*scale);fore.rotation.z=side*-.08;armPivot.add(fore);
  const hand=sphere(new THREE.SphereGeometry(.07*scale,10,8),skin,side*.4*scale,.68*scale,.06);group.remove(hand);armPivot.add(hand);hand.position.set(side*.07*scale,-.53*scale,.04*scale);arms.push(armPivot);
  const legPivot=new THREE.Group();legPivot.position.set(side*.14*scale,.49*scale,0);group.add(legPivot);
  const thigh=capsule(.09*scale,.22*scale,shorts);thigh.position.set(0,-.09*scale,0);legPivot.add(thigh);
  const shin=capsule(.062*scale,.25*scale,socks);shin.position.set(0,-.29*scale,.015*scale);legPivot.add(shin);
  const boot=sphere(new THREE.BoxGeometry(.16*scale,.105*scale,.29*scale),boots,0,-.48*scale,.09*scale);legPivot.add(boot);legs.push(legPivot);
 }
 group.rotation.y=home?Math.PI:0;
 const selectionMarker=new THREE.Group();
 const markerRing=new THREE.Mesh(new THREE.TorusGeometry(.58,.055,8,40),new THREE.MeshBasicMaterial({color:0xffdf45,transparent:true,opacity:.98,depthTest:false}));markerRing.rotation.x=Math.PI/2;markerRing.position.y=.055;markerRing.renderOrder=20;selectionMarker.add(markerRing);
 const arrowGeometry=new THREE.BufferGeometry();arrowGeometry.setAttribute('position',new THREE.Float32BufferAttribute([0,2.85,0,0,2.5,0,-.2,2.68,0,0,2.5,0,.2,2.68,0,0,2.5,0],3));
 const arrow=new THREE.LineSegments(arrowGeometry,new THREE.LineBasicMaterial({color:0xffdf45,depthTest:false}));arrow.renderOrder=21;selectionMarker.add(arrow);selectionMarker.visible=false;group.add(selectionMarker);
 const player={group,team,card,cardName:card?.name||'',rating:card?.rating||70,homePosition:group.position.clone(),legs,arms,selectionMarker,phase:Math.random()*Math.PI*2,stats:{speed:stats.speed??7.2,strength:stats.strength??70,agility:stats.agility??70,stamina:stats.stamina??100,shoot:stats.shoot??70,pass:stats.pass??70},velocity:new THREE.Vector3(),height,hasBall:false};
 players.push(player);return player;
}
const players=[];
const formationSlots=['GK','LB','CB1','CB2','RB','CM1','CM2','CM3','LW','ST','RW'];
const formationPresets={"4-3-3":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[0,17],[-14,8],[14,8],[-23,-11],[0,-21],[23,-11]],"4-4-2":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[-24,12],[-8,12],[8,12],[24,12],[-10,-20],[10,-20]],"4-2-3-1":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[-12,17],[12,17],[-22,-5],[0,-8],[0,-25],[22,-5]],"4-3-2-1":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[0,17],[-14,8],[14,8],[-12,-10],[0,-23],[12,-10]],"4-1-2-1-2":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[0,20],[-18,7],[18,7],[0,-2],[-10,-22],[10,-22]],"4-4-1-1":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[-24,12],[-8,12],[8,12],[24,12],[0,-5],[0,-24]],"4-2-2-2":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[-12,18],[12,18],[-18,-3],[18,-3],[-9,-22],[9,-22]],"4-3-1-2":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[0,17],[-14,8],[14,8],[0,-4],[-10,-23],[10,-23]],"4-5-1":[[0,45],[-25,29],[-9,31],[9,31],[25,29],[-25,9],[-12,14],[0,16],[12,14],[25,9],[0,-23]],"3-5-2":[[0,45],[-18,30],[0,33],[18,30],[-27,10],[-13,14],[0,17],[13,14],[27,10],[-10,-22],[10,-22]],"3-4-3":[[0,45],[-18,30],[0,33],[18,30],[-24,12],[-8,12],[8,12],[24,12],[-20,-16],[0,-22],[20,-16]],"3-4-1-2":[[0,45],[-18,30],[0,33],[18,30],[-24,12],[-8,12],[8,12],[24,12],[0,-3],[-10,-22],[10,-22]],"3-4-2-1":[[0,45],[-18,30],[0,33],[18,30],[-24,12],[-8,12],[8,12],[24,12],[-12,-7],[12,-7],[0,-24]],"5-3-2":[[0,45],[-30,30],[-15,32],[0,33],[15,32],[30,30],[-14,10],[0,15],[14,10],[-10,-22],[10,-22]],"5-4-1":[[0,45],[-30,30],[-15,32],[0,33],[15,32],[30,30],[-24,10],[-8,12],[8,12],[24,10],[0,-23]],"5-2-1-2":[[0,45],[-30,30],[-15,32],[0,33],[15,32],[30,30],[-12,14],[12,14],[0,-4],[-10,-22],[10,-22]],"5-2-3":[[0,45],[-30,30],[-15,32],[0,33],[15,32],[30,30],[-12,14],[12,14],[-20,-16],[0,-22],[20,-16]]};
let selectedFormation=localStorage.getItem('ut27-formation')||'4-3-3';if(!formationPresets[selectedFormation])selectedFormation='4-3-3';
let formationPoints=formationPresets[selectedFormation];
let squad3D=null,squad3DRenderer=null,squad3DCamera=null,squad3DPlayers=new Map(),squad3DResizeObserver=null;
function squadPitchLine(group,x1,z1,x2,z2,material,width=.14){
 const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz);
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,.045,len),material);
 mesh.position.set((x1+x2)/2,.055,(z1+z2)/2);mesh.rotation.y=Math.atan2(dx,dz);group.add(mesh);
}
function makeSquadMiniPlayer(player,index){
 let seed=0;for(const ch of String(player.id||player.name||index))seed=(seed*31+ch.charCodeAt(0))>>>0;
 const pick=(arr,n)=>arr[(seed>>>n)%arr.length];
 const group=new THREE.Group();
 const kitColors=[0x163d72,0x174e91,0x0c5a55,0x472b70,0x7b2434,0x253b43];
 const kit=new THREE.MeshStandardMaterial({color:pick(kitColors,3),roughness:.7});
 const trim=new THREE.MeshStandardMaterial({color:pick([0xf3d36c,0xe9edf4,0x45c4ad,0xd85b58],7),roughness:.55});
 const skin=new THREE.MeshStandardMaterial({color:pick([0xe6b98e,0xc98d65,0x9b6347,0xf0c9a4,0x754832],11),roughness:.86});
 const hair=new THREE.MeshStandardMaterial({color:pick([0x17191e,0x39261e,0x6b4930,0xb1a078,0x4b4b4b],15),roughness:.9});
 const shorts=new THREE.MeshStandardMaterial({color:0x172330,roughness:.8});
 const boot=new THREE.MeshStandardMaterial({color:pick([0xf0f1e9,0xd4b14d,0x20242b,0xe45d4f],19),roughness:.5});
 const sphere=(r,mat,pos,scale)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),mat);o.position.set(...pos);if(scale)o.scale.set(...scale);o.castShadow=true;group.add(o);return o;};
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.82,4,8),kit);torso.position.y=1.85;torso.castShadow=true;group.add(torso);
 const chest=new THREE.Mesh(new THREE.BoxGeometry(.82,.16,.54),trim);chest.position.set(0,2.1,0);group.add(chest);
 const shortMesh=new THREE.Mesh(new THREE.BoxGeometry(.72,.43,.48),shorts);shortMesh.position.y=1.22;shortMesh.castShadow=true;group.add(shortMesh);
 sphere(.29,skin,[0,2.72,0],[.9,1.06,.9]);
 const cap=sphere(.3,hair,[0,2.91,-.015],[1,.48,1]);cap.position.z=-.035;
 // Hair profile varies so the squad is not a row of identical silhouettes.
 const style=(seed>>>23)%3;
 if(style===1)sphere(.18,hair,[0,3.02,.08],[1,.42,1]);
 if(style===2){sphere(.13,hair,[-.22,2.82,0],[.45,1.1,1]);sphere(.13,hair,[.22,2.82,0],[.45,1.1,1]);}
 for(const side of [-1,1]){
  const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.62,3,6),skin);arm.position.set(side*.55,1.88,0);arm.rotation.z=side*-.16;arm.castShadow=true;group.add(arm);
  const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.47,3,6),skin);thigh.position.set(side*.2,.72,0);thigh.castShadow=true;group.add(thigh);
  const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.5,3,6),skin);leg.position.set(side*.2,.3,.015);leg.castShadow=true;group.add(leg);
  const shoe=new THREE.Mesh(new THREE.BoxGeometry(.22,.13,.42),boot);shoe.position.set(side*.2,.1,.12);shoe.castShadow=true;group.add(shoe);
 }
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.68,20),new THREE.MeshBasicMaterial({color:0x07170f,transparent:true,opacity:.24,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.035;group.add(shadow);
 group.scale.setScalar(player.position==='GK'?1.03:1);
 return group;
}
function initSquadPitch3D(){
 const host=$('#squad-pitch');if(!host||squad3DRenderer)return;
 squad3D=new THREE.Scene();squad3D.background=new THREE.Color(0x080e16);squad3D.fog=new THREE.Fog(0x080e16,105,220);
 squad3DCamera=new THREE.PerspectiveCamera(43,1,.1,300);
 squad3DCamera.position.set(0,92,116);squad3DCamera.lookAt(0,0,0);
 squad3D.add(new THREE.HemisphereLight(0xdcecff,0x101b19,2.15));
 const flood=new THREE.DirectionalLight(0xffe9c5,2.5);flood.position.set(-25,55,30);flood.castShadow=true;flood.shadow.mapSize.set(1024,1024);squad3D.add(flood);
 const pitchGroup=new THREE.Group();squad3D.add(pitchGroup);
 const grass=[0x14583b,0x1b6745],ground=new THREE.Mesh(new THREE.PlaneGeometry(120,76),new THREE.MeshStandardMaterial({color:grass[0],roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;pitchGroup.add(ground);
 for(let i=0;i<12;i++){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(10,76),new THREE.MeshStandardMaterial({color:grass[i%2],roughness:1}));stripe.rotation.x=-Math.PI/2;stripe.position.set(-55+i*10,.012,0);pitchGroup.add(stripe);}
 const white=new THREE.MeshBasicMaterial({color:0xe9eee7});
 const line=(x1,z1,x2,z2,w=.16)=>squadPitchLine(pitchGroup,x1,z1,x2,z2,white,w);
 line(-60,-38,60,-38);line(-60,38,60,38);line(-60,-38,-60,38);line(60,-38,60,38);
 line(0,-38,0,38);line(-60,-22,-42,-22);line(-42,-22,-42,22);line(-42,22,-60,22);line(60,-22,42,-22);line(42,-22,42,22);line(42,22,60,22);
 line(-60,-10,-52,-10);line(-52,-10,-52,10);line(-52,10,-60,10);line(60,-10,52,-10);line(52,-10,52,10);line(52,10,60,10);
 const circle=new THREE.Mesh(new THREE.RingGeometry(9.05,9.2,64),white);circle.rotation.x=-Math.PI/2;circle.position.y=.06;pitchGroup.add(circle);
 const spotMat=new THREE.MeshBasicMaterial({color:0xf6f5e8});
 for(const x of [-48,48,0]){const dot=new THREE.Mesh(new THREE.CircleGeometry(.42,16),spotMat);dot.rotation.x=-Math.PI/2;dot.position.set(x,.065,0);pitchGroup.add(dot);}
 const standMat=new THREE.MeshStandardMaterial({color:0x111c29,roughness:.9}),seatMat=new THREE.MeshStandardMaterial({color:0x344352,roughness:.8});
 for(const side of [-1,1]){
  const stand=new THREE.Mesh(new THREE.BoxGeometry(130,12,13),standMat);stand.position.set(0,4,side*48);pitchGroup.add(stand);
  for(let r=0;r<5;r++){const row=new THREE.Mesh(new THREE.BoxGeometry(130,.55,2.2),seatMat);row.position.set(0,8+r*.65,side*(41+r*1.35));pitchGroup.add(row);}
 }
 for(const side of [-1,1]){const goal=new THREE.Group();pitchGroup.add(goal);const gx=side*60,gm=new THREE.MeshBasicMaterial({color:0xe9eee7});for(const [x,y,z,w,h,d] of [[gx,3.5,-3.7,.22,7,.22],[gx,3.5,3.7,.22,7,.22],[gx,7,0,.22,.22,7.4]]){const bar=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),gm);bar.position.set(x,y,z);goal.add(bar);}}
 squad3DRenderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 squad3DRenderer.setPixelRatio(Math.min(devicePixelRatio,1.5));squad3DRenderer.outputColorSpace=THREE.SRGBColorSpace;squad3DRenderer.shadowMap.enabled=true;
 squad3DRenderer.domElement.className='squad-three-canvas';squad3DRenderer.domElement.setAttribute('aria-label','ملعب Ultimate Team ثلاثي الأبعاد');
 host.prepend(squad3DRenderer.domElement);
 squad3DResizeObserver=new ResizeObserver(()=>resizeSquadPitch3D());squad3DResizeObserver.observe(host);
 resizeSquadPitch3D();
}
function resizeSquadPitch3D(){
 if(!squad3DRenderer||!squad3DCamera)return;
 const host=$('#squad-pitch');if(!host)return;
 const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
 squad3DCamera.aspect=w/h;squad3DCamera.updateProjectionMatrix();
 squad3DRenderer.setSize(w,h,false);squad3DRenderer.render(squad3D,squad3DCamera);
}
function updateSquadPitch3D(){
 if(!$('#squad-pitch'))return;initSquadPitch3D();
 // The formation is turned onto a wide FUT-style broadcast pitch.
 const coords=formationPresets[selectedFormation]||formationPresets['4-3-3'];
 formationSlots.forEach((slot,i)=>{
  const player=clubPlayers.find(p=>p.id===squadAssignments[slot]||p.name===squadAssignments[slot]);
  const old=squad3DPlayers.get(slot);if(old){squad3D.remove(old);squad3DPlayers.delete(slot);}
  if(player){const [x,z]=coords[i]||[0,0];const marker=new THREE.Mesh(new THREE.CircleGeometry(1.15,24),new THREE.MeshBasicMaterial({color:0x07131a,transparent:true,opacity:.48,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.position.set(z, .08, x);squad3D.add(marker);squad3DPlayers.set(slot,marker);}
 });
 resizeSquadPitch3D();
}

let savedMatchClub=(()=>{try{return JSON.parse(localStorage.getItem('ut27-club')||'[]')}catch{return []}})();
let savedMatchLineup=(()=>{try{return JSON.parse(localStorage.getItem('ut27-squad')||'{}')}catch{return {}}})();
function matchCardForSlot(slot){const name=savedMatchLineup[slot];return savedMatchClub.find(p=>p.id===name||p.name===name)||null;}
function matchStats(card){const s=card?.stats||[72,70,70,70,70,70];return{speed:(s[0]||72)/10,strength:s[5]||70,agility:s[3]||70,stamina:100,shoot:s[1]||70,pass:s[2]||70};}
const white=formationPoints.map(([x,z],i)=>{const card=matchCardForSlot(formationSlots[i]);return makePlayer('white',x,z,i===0?1.9:1.8,matchStats(card),card);});
const black=formationPoints.map(([x,z],i)=>makePlayer('black',-x,-z,i===0?1.9:1.8,{speed:6.8+(i%4)*.25,strength:70+(i%5)*3,agility:70+(i%6)*2,stamina:100,shoot:72+(i%5)*3,pass:70+(i%6)*3}));
function updatePlayerNameTag(p,card){
 if(p.nameTag){p.group.remove(p.nameTag);p.nameTag.material.map?.dispose();p.nameTag.material.dispose();p.nameTag=null;}
 if(!card)return;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
 const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(5,15,25,.82)';ctx.fillRect(0,0,512,96);
 ctx.strokeStyle='#e8c96c';ctx.lineWidth=5;ctx.strokeRect(3,3,506,90);
 ctx.fillStyle='#fff';ctx.font='bold 31px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(card.name+'  '+card.rating,256,48,490);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));
 sprite.position.set(0,2.85,0);sprite.scale.set(2.8,.52,1);sprite.renderOrder=10;p.group.add(sprite);p.nameTag=sprite;
}
function applyMatchFormation(){formationPoints=formationPresets[selectedFormation]||formationPresets['4-3-3'];white.forEach((p,i)=>{const [x,z]=formationPoints[i];p.homePosition.set(x,0,z);p.group.position.set(x,0,z);});}
function refreshMatchRoster(){savedMatchClub=(()=>{try{return JSON.parse(localStorage.getItem('ut27-club')||'[]')}catch{return []}})();savedMatchLineup=(()=>{try{return JSON.parse(localStorage.getItem('ut27-squad')||'{}')}catch{return {}}})();white.forEach((p,i)=>{const card=matchCardForSlot(formationSlots[i]);p.card=card;p.cardName=card?.name||'';p.rating=card?.rating||70;const s=matchStats(card);Object.assign(p.stats,s);updatePlayerNameTag(p,card);});}
let controlled=white[9], scoreW=0,scoreB=0,elapsed=0,ballOwner=null;
const keys={};
let joystickInput={x:0,z:0};
let sprinting=false;
let keeperRushUntil=0;
let controlContext='attack';
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='Tab'||e.key.toLowerCase()==='q'){e.preventDefault();switchPlayer();}});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.key===' ')sprinting=false;});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key; b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false));});
const msg=document.querySelector('#message');
function closestTeamMate(){return white.filter(p=>p!==controlled).sort((a,b)=>a.group.position.distanceTo(ball.position)-b.group.position.distanceTo(ball.position))[0];}
function switchPlayer(){
 const next=white.filter(p=>p!==controlled).sort((a,b)=>a.group.position.distanceToSquared(ball.position)-b.group.position.distanceToSquared(ball.position))[0];
 if(next){controlled=next;msg.textContent=`التحكم الآن: ${controlled.cardName||'لاعب الفريق'}`;}
}
function forwardMate(){
 const options=white.filter(p=>p!==controlled).map(p=>({p,advance:ball.position.z-p.group.position.z,dist:p.group.position.distanceTo(ball.position)})).filter(x=>x.advance>1.2);
 return (options.length?options: white.filter(p=>p!==controlled).map(p=>({p,advance:0,dist:p.group.position.distanceTo(ball.position)}))).sort((a,b)=>a.dist-b.dist)[0]?.p||closestTeamMate();
}
function releaseBallToward(target,speed,lift=1.4){
 const dir=target.clone().sub(ball.position);dir.y=0;if(dir.lengthSq()<.01)dir.set(0,0,-1);dir.normalize();
 ballOwner=null;ballVel.copy(dir.multiplyScalar(speed));ballVel.y=lift;
}
function passBall(mode='normal'){
 if(ballOwner!==controlled){switchPlayer();msg.textContent='تبديل اللعب';return;}
 const target=forwardMate(),accuracy=THREE.MathUtils.clamp(controlled.stats.pass/100,.55,.98);
 const aim=target.group.position.clone().add(target.velocity.clone().multiplyScalar(mode==='run'?1.0:.28));
 aim.x+=(Math.random()-.5)*(1.8*(1-accuracy));aim.z+=(Math.random()-.5)*(1.2*(1-accuracy));
 const speed=mode==='power'?25+accuracy*5:mode==='run'?15+accuracy*5:13+accuracy*7;
 const lift=mode==='lift'?.9:mode==='lob'?4.2:mode==='power'?.25:1.1;
 releaseBallToward(aim,speed,lift);msg.textContent=mode==='power'?'تمريرة صاروخية!':mode==='run'?'تمرير وانطلاق!':mode==='lob'?'تمريرة عالية!':mode==='lift'?'تمريرة مرفوعة!':'تمرير أرضي!';
}
function throughBall(mode='ground'){
 if(ballOwner!==controlled){if(mode==='keeper'){const keeper=white[0];keeperRushUntil=elapsed+2.2;msg.textContent='اندفاع الحارس!';}return;}
 const target=forwardMate(),lead=target.group.position.clone().add(target.velocity.clone().multiplyScalar(.9)).add(new THREE.Vector3(0,0,-(3+controlled.stats.pass/25)));
 releaseBallToward(lead,mode==='lob'?19+controlled.stats.pass*.06:17+controlled.stats.pass*.055,mode==='lob'?5.4:0.35);msg.textContent=mode==='lob'?'بينية عالية بالطول!':'بينية أرضية!';
}
function tackle(){
 const rival=black.slice().sort((a,b)=>a.group.position.distanceTo(controlled.group.position)-b.group.position.distanceTo(controlled.group.position))[0];
 if(!rival||rival.group.position.distanceTo(controlled.group.position)>2.15){msg.textContent='اقترب من المنافس لتنفيذ الالتحام';return;}
 const distance=rival.group.position.distanceTo(controlled.group.position);
 const advantage=(controlled.stats.strength-rival.stats.strength)*.002+(controlled.stats.agility-rival.stats.agility)*.001;
 const success=THREE.MathUtils.clamp(.76+advantage-(distance-1)*.12,.48,.92);
 controlled.velocity.add(controlled.group.position.clone().sub(rival.group.position).normalize().multiplyScalar(3.5));
 if(Math.random()<success){
  if(ballOwner===rival||ball.position.distanceTo(controlled.group.position)<2.7){
   ballOwner=controlled;ballVel.set(0,0,0);msg.textContent='افتكاك ناجح!';
  }else{rival.group.position.add(controlled.group.position.clone().sub(rival.group.position).normalize().multiplyScalar(.7));msg.textContent='التحام ناجح';}
 }else{controlled.stats.stamina=Math.max(15,controlled.stats.stamina-5);msg.textContent='المنافس تفادى الالتحام';}
}
function shootBall(){
 if(ballOwner!==controlled&&ball.position.distanceTo(controlled.group.position)>2.3){msg.textContent='لاعبك بعيد عن الكرة';return;}
 const power=THREE.MathUtils.clamp(controlled.stats.shoot/100,.55,1);
 const target=new THREE.Vector3(THREE.MathUtils.clamp(-ball.position.x*.32,-5.2,5.2),0,-62);
 target.x+=(Math.random()-.5)*(3.2*(1-power));target.y=0;
 releaseBallToward(target,17+power*15,2.8+power*2.2);msg.textContent='تسديدة على المرمى!';
}
addEventListener('keydown',e=>{if(e.repeat)return;if(e.key.toLowerCase()==='j')passBall();if(e.key.toLowerCase()==='k')shootBall();if(e.key.toLowerCase()==='i')throughBall();if(e.key.toLowerCase()===' ')sprinting=true;if(e.key.toLowerCase()==='e')tackle();});
const passButton=document.querySelector('[data-action="pass"]');
const shootButton=document.querySelector('[data-action="shoot"]');
const throughButton=document.querySelector('[data-action="through"]');
const sprintTackleButton=document.querySelector('[data-action="sprint-tackle"]');
function updateTouchLabels(){
 const attacking=ballOwner?.team==='white';
 passButton.textContent=attacking?'تمرير':'تبديل اللعب';
 shootButton.textContent=attacking?'تسديد':'زحلقة';
 throughButton.textContent='بينية';
 sprintTackleButton.textContent=attacking?'جري ومراوغة':'جري والتحام';
}
function bindSwipe(button,handler){
 let start=null;
 button.addEventListener('pointerdown',e=>{e.preventDefault();start={x:e.clientX,y:e.clientY,id:e.pointerId};button.setPointerCapture?.(e.pointerId);});
 button.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;const dir=Math.hypot(dx,dy)>18?(Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down')):'tap';start=null;handler(dir);});
 ['pointercancel','lostpointercapture'].forEach(ev=>button.addEventListener(ev,()=>start=null));
}
bindSwipe(passButton,dir=>{if(ballOwner!==controlled){switchPlayer();msg.textContent='تبديل اللعب';return;}passBall(dir==='left'?'power':dir==='down'?'lift':dir==='up'?'lob':dir==='right'?'run':'normal');});
bindSwipe(throughButton,dir=>{if(ballOwner!==controlled){if(dir==='down')throughBall('keeper');else msg.textContent='استحوذ على الكرة لتنفيذ البينية';return;}throughBall(dir==='up'?'lob':'ground');});
bindSwipe(shootButton,dir=>{if(ballOwner!==controlled){tackle();msg.textContent='زحلقة!';return;}shootBall();});
let sprintTacklePointer=null;
sprintTackleButton.addEventListener('pointerdown',e=>{
 e.preventDefault();sprintTacklePointer=e.pointerId;
 const nearestOpponent=black.reduce((best,p)=>!best||p.group.position.distanceTo(controlled.group.position)<best.group.position.distanceTo(controlled.group.position)?p:best,null);
 if(ballOwner!==controlled&&nearestOpponent&&nearestOpponent.group.position.distanceTo(controlled.group.position)<3.2){tackle();sprinting=false;}
 else {sprinting=true;sprintTackleButton.classList.add('pressed');}
});
function releaseSprintTackle(e){if(e.pointerId!==sprintTacklePointer)return;sprintTacklePointer=null;sprinting=false;sprintTackleButton.classList.remove('pressed');}
updateTouchLabels();
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
 if(d.lengthSq()>.04){d.normalize();const staminaFactor=.78+.22*(p.stats.stamina/100);p.velocity.lerp(d.multiplyScalar(maxSpeed*staminaFactor),Math.min(1,dt*(p===controlled?11:7)));p.group.position.addScaledVector(p.velocity,dt);if(p.velocity.lengthSq()>.15)p.group.rotation.y=Math.atan2(p.velocity.x,p.velocity.z);}
 else p.velocity.multiplyScalar(Math.pow(.12,dt));
}
function resolveDuel(a,b){
 const delta=a.group.position.clone().sub(b.group.position);delta.y=0;const dist=delta.length();
 if(dist<.82){if(dist>.001)delta.normalize();const separation=(.82-dist)*.5;a.group.position.addScaledVector(delta,separation);b.group.position.addScaledVector(delta,-separation);}
}
function resetBall(){ballOwner=null;ball.position.set(0,.38,0);ballVel.set(0,0,0);white.forEach(p=>p.group.position.copy(p.homePosition));black.forEach(p=>p.group.position.copy(p.homePosition));}
const clockEl=document.querySelector('#clock'),scoreEl=document.querySelector('#score');
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);if(root.classList.contains('game-hidden'))return;const dt=Math.min(clock.getDelta(),.035);elapsed+=dt;
 // Human-controlled player
 const keyX=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 const keyZ=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 // Sideline camera mapping: stick right follows screen-right (pitch length), up moves away from the near touchline.
 const input=new THREE.Vector3(keyX+joystickInput.z,0,keyZ-joystickInput.x);
 if(input.lengthSq()>0){input.clampLength(0,1);const stamina=controlled.stats.stamina/100;const moveSpeed=controlled.stats.speed*(sprinting?1.62:1)*(.76+.24*stamina);controlled.velocity.lerp(input.clone().multiplyScalar(moveSpeed),Math.min(1,dt*13));controlled.group.position.addScaledVector(controlled.velocity,dt);controlled.group.rotation.y=Math.atan2(input.x,input.z);if(sprinting)controlled.stats.stamina=Math.max(12,controlled.stats.stamina-13*dt);}
 else{controlled.velocity.multiplyScalar(Math.pow(.035,dt));controlled.stats.stamina=Math.min(100,controlled.stats.stamina+7*dt);}
 // Teammates make passing lanes and offer forward support instead of all chasing the ball.
 for(const p of white){if(p!==controlled){const support=ballOwner===controlled&&p.homePosition.z<controlled.group.position.z?-.12:.22;const target=p.homePosition.clone().lerp(ball.position,support);target.z=THREE.MathUtils.clamp(target.z,-39,46);moveToward(p,target,dt,p.stats.speed*.78);p.stats.stamina=Math.min(100,p.stats.stamina+2*dt);}}
 // AI presses in layers; the ball carrier attacks the goal while nearby teammates support.
 const blackCarrier=ballOwner?.team==='black'?ballOwner:null;
 const pressing=new Set(black.slice().sort((a,b)=>a.group.position.distanceTo(ball.position)-b.group.position.distanceTo(ball.position)).slice(0,blackCarrier?2:3));
 for(const p of black){let target;if(p===blackCarrier)target=new THREE.Vector3(THREE.MathUtils.clamp(-p.group.position.x*.22,-18,18),0,58);else if(pressing.has(p))target=ball.position.clone().add(new THREE.Vector3(0,0,-1.15));else target=p.homePosition.clone().lerp(ball.position,.1);moveToward(p,target,dt,p.stats.speed*.82);p.stats.stamina=Math.min(100,p.stats.stamina+1.5*dt);}
 if(ballOwner?.team==='black'&&elapsed<keeperRushUntil){const keeper=white[0];moveToward(keeper,new THREE.Vector3(ball.position.x,0,Math.min(54,ball.position.z+3)),dt,keeper.stats.speed*1.15);}
 // Keep players inside the pitch
 for(const p of players){p.group.position.x=THREE.MathUtils.clamp(p.group.position.x,-36,36);p.group.position.z=THREE.MathUtils.clamp(p.group.position.z,-56,56);for(const q of players)if(q!==p&&q.team!==p.team)resolveDuel(p,q);}
 // Ball possession, close control and grounded/aerial ball physics.
 if(ballOwner){
  if(ballOwner.team==='black')ballOwner.group.rotation.y=0;
  const forward=new THREE.Vector3(Math.sin(ballOwner.group.rotation.y),0,Math.cos(ballOwner.group.rotation.y));
  const sprintTouch=ballOwner===controlled&&sprinting?1.18:.78;
  const dribbleTarget=ballOwner.group.position.clone().addScaledVector(forward,sprintTouch);dribbleTarget.y=.34;
  ball.position.lerp(dribbleTarget,Math.min(1,dt*(ballOwner===controlled?18:13)));ballVel.set(0,0,0);
  if(ballOwner.team==='black'&&ballOwner.group.position.z>37){const target=new THREE.Vector3(THREE.MathUtils.clamp(-ballOwner.group.position.x*.28,-4,4),0,-0);const dir=target.sub(ballOwner.group.position);dir.y=0;dir.normalize();ballOwner=null;ballVel.copy(dir.multiplyScalar(19));ballVel.y=3.4;msg.textContent='المنافس يسدد!';}
 }else{
  ballVel.y-=9.81*dt;ball.position.addScaledVector(ballVel,dt);
  if(ball.position.y<.36){ball.position.y=.36;if(ballVel.y<0)ballVel.y*=-.34;ballVel.x*=.985;ballVel.z*=.985;}
  ballVel.multiplyScalar(Math.pow(.992,dt*60));
  const nearest=players.slice().sort((a,b)=>a.group.position.distanceTo(ball.position)-b.group.position.distanceTo(ball.position))[0];
  if(nearest&&nearest.group.position.distanceTo(ball.position)<1.2&&ballVel.length()<6){ballOwner=nearest;if(nearest.team==='white'){controlled=nearest;msg.textContent='استحوذت على الكرة';}else msg.textContent='الخصم استحوذ على الكرة';}
 }
 // Contextual touch controls update immediately when possession changes.
 const nextContext=ballOwner?.team==='white'?'attack':'defense';
 if(nextContext!==controlContext){controlContext=nextContext;updateTouchLabels();}
 // Animate running limbs from each player's actual movement.
 for(const p of players){const motion=Math.min(1,p.velocity.length()/4),stride=Math.sin(elapsed*(sprinting&&p===controlled?17:13)+p.phase)*motion*.72;p.legs[0].rotation.x=stride;p.legs[1].rotation.x=-stride;p.arms[0].rotation.x=-stride*.58;p.arms[1].rotation.x=stride*.58;p.group.position.y=Math.abs(Math.sin(elapsed*13+p.phase))*.045*motion; p.group.rotation.z=THREE.MathUtils.clamp(-p.velocity.length()*.012,-.08,.08);if(p.selectionMarker)p.selectionMarker.visible=p===controlled;}
 // Goals
 if(Math.abs(ball.position.z)>58 && Math.abs(ball.position.x)<4.9 && ball.position.y<3.25){if(ball.position.z<0)scoreW++;else scoreB++;scoreEl.textContent=`${scoreW} - ${scoreB}`;msg.textContent='GOAL!';resetBall();}
 if(Math.abs(ball.position.x)>39||Math.abs(ball.position.z)>63){resetBall();}
 // Fixed sideline broadcast camera: switching players never moves or recentres the camera.
 ball.rotation.x+=ballVel.z*dt*.8;ball.rotation.z-=ballVel.x*dt*.8;
 clockEl.textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;
 renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(squad3DRenderer)resizeSquadPitch3D();});



// UT 27 interface controller: keeps the original Three.js match prototype intact.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const gameRoot = $('#game-root');
const appShell = $('#app-shell');
const languageScreen = $('#language-screen');
const quickMenu = $('#quick-menu');
const matchHud = $('#match-hud');
const matchControls = $('#match-controls');
const difficultyPanel = $('#difficulty-panel');
let selectedDifficulty = '';
let coins = Number(localStorage.getItem('ut27-coins') || 5436);
let currentTab = 'home';
let quickIndex = 0;
let activeQuickItems = [];
let lastPadButtons = [];

gameRoot.classList.add('game-hidden');

function setLanguage(lang) {
  localStorage.setItem('ut27-language', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const languageSetting=$('#language-setting');if(languageSetting)languageSetting.value=lang;
}
function showScreen(screen) {
  [languageScreen, appShell].forEach(el => el.classList.add('hidden'));
  screen.classList.remove('hidden');
}
function openApp() {
  showScreen(appShell);
  switchTab('home');
}
const savedLanguage = localStorage.getItem('ut27-language');
if (savedLanguage) { setLanguage(savedLanguage); openApp(); }
else showScreen(languageScreen);
$$('[data-language]').forEach(btn => btn.addEventListener('click', () => {
  setLanguage(btn.dataset.language);
  openApp();
}));


const eventPlayers = [
  {name:"Ousmane Dembélé",rating:91,position:"ST",featured:true,club:"Paris SG",competition:"UCL",stats:[91,90,85,94,56,71]},
  {name:"Jude Bellingham",rating:91,position:"CAM",featured:true,club:"Real Madrid",competition:"UCL",stats:[80,90,87,91,81,86]},
  {name:"Pedri",rating:91,position:"CM",featured:true,club:"Barcelona",competition:"UCL",stats:[80,81,91,92,82,81]},
  {name:"Luis Díaz",rating:90,position:"LM",featured:true,club:"Bayern Munich",competition:"UCL",stats:[88,86,87,90,47,78]},
  {name:"Aitana Bonmatí",rating:90,position:"CM",club:"Barcelona",competition:"UWCL",stats:[83,85,86,90,80,73]},
  {name:"Tabitha Chawinga",rating:89,position:"LW",club:"OL Lyonnes",competition:"UWCL",stats:[95,84,80,88,38,84]},
  {name:"Yui Hasegawa",rating:89,position:"CDM",club:"Manchester City",competition:"UWCL",stats:[81,76,89,89,84,78]},
  {name:"Ryan Gravenberch",rating:88,position:"CDM",club:"Liverpool",competition:"UCL",stats:[83,81,85,88,83,83]},
  {name:"Marcos Llorente",rating:88,position:"RB",club:"Atlético Madrid",competition:"UCL",stats:[92,83,83,85,81,84]},
  {name:"Alessandro Bastoni",rating:88,position:"CB",club:"Inter",competition:"UCL",stats:[82,49,81,80,88,84]},
  {name:"Sakina Karchaoui",rating:88,position:"RM",club:"PSG",competition:"UWCL",stats:[90,79,88,89,81,74]},
  {name:"Francisco Conceição",rating:87,position:"CAM",club:"Juventus",competition:"UEL",stats:[90,82,83,89,52,62]},
  {name:"Jérémy Doku",rating:87,position:"LW",club:"Manchester City",competition:"UCL",stats:[92,81,81,90,43,78]},
  {name:"Rafael Leão",rating:87,position:"LW",club:"Galatasaray",competition:"UCL",stats:[94,83,83,88,35,77]},
  {name:"Romelu Lukaku",rating:87,position:"ST",club:"Fenerbahçe",competition:"UCL",stats:[83,88,80,82,47,87]},
  {name:"Alyssa Thompson",rating:87,position:"LM",club:"Chelsea",competition:"UWCL",stats:[95,83,81,85,50,70]},
  {name:"Géraldine Reuteler",rating:86,position:"CM",club:"Arsenal",competition:"UWCL",stats:[91,84,83,87,71,80]},
  {name:"Andreia Jacinto",rating:86,position:"CM",club:"Real Madrid",competition:"UWCL",stats:[84,76,85,86,81,80]},
  {name:"Senne Lammens",rating:86,position:"GK",club:"Manchester United",competition:"UCL",stats:[84,87,81,87,49,86]},
  {name:"André-Frank Zambo Anguissa",rating:86,position:"CM",club:"Napoli",competition:"UCL",stats:[78,81,81,85,83,86]},
  {name:"Fikayo Tomori",rating:86,position:"CB",club:"AC Milan",competition:"UEL",stats:[86,46,68,73,85,84]},
  {name:"Maxim De Cuyper",rating:86,position:"LM",club:"Brighton",competition:"UECL",stats:[86,81,86,83,81,83]},
  {name:"Matthias Ginter",rating:86,position:"CB",club:"Freiburg",competition:"UECL",stats:[78,63,75,74,88,84]},
  {name:"Matías Soulé",rating:85,position:"RW",club:"Roma",competition:"UCL"},
  {name:"Younes Taha",rating:85,position:"CAM",club:"Twente",competition:"UECL",stats:[86,85,85,84,51,75]},
  {name:"Diogo Travassos",rating:85,position:"RB",club:"Braga",competition:"UECL",stats:[91,74,80,84,79,81]},
  {name:"Cristian Romero",rating:85,position:"CB",club:"Getafe",competition:"UECL",stats:[82,38,60,70,85,89]},
  {name:"Gabri Veiga",rating:85,position:"CM",club:"Porto",competition:"UCL"},
  {name:"Lamine Camara",rating:85,position:"CM",club:"Monaco",competition:"UECL",stats:[84,74,86,84,81,80]},
  {name:"Timothy Weah",rating:85,position:"RM",club:"Marseille",competition:"UEL",stats:[92,82,81,83,81,78]}
];
let clubPlayers=(()=>{try{return JSON.parse(localStorage.getItem('ut27-club')||'[]').filter(p=>p.club!=='UT Academy'&&!String(p.id||'').startsWith('starter-'))}catch{return []}})();
function saveClub(){localStorage.setItem('ut27-club',JSON.stringify(clubPlayers));}
saveClub(); // purge the old fake starter squad from previous builds
const leaguePlayerPools={
 'Premier League':[
  {name:'Erling Haaland',rating:91,position:'ST',club:'Manchester City',nation:'Norway',stats:[87,92,71,80,47,89],image:'https://assets.fodder.gg/renders/239085.webp'},
  {name:'Bruno Fernandes',rating:89,position:'CAM',club:'Manchester United',nation:'Portugal',stats:[67,85,92,85,68,75],image:'https://assets.fodder.gg/renders/212198.webp'},
  {name:'Gabriel',rating:89,position:'CB',club:'Arsenal',nation:'Brazil',stats:[64,44,64,66,91,84],image:'https://assets.fodder.gg/renders/232580.webp'},
  {name:'William Saliba',rating:88,position:'CB',club:'Arsenal',nation:'France',stats:[77,41,68,73,90,82],image:'https://assets.fodder.gg/renders/243715.webp'},
  {name:'Bukayo Saka',rating:87,position:'RW',club:'Arsenal',nation:'England',stats:[79,82,85,87,60,73],image:'https://assets.fodder.gg/renders/246669.webp'},
  {name:'Declan Rice',rating:88,position:'CDM',club:'Arsenal',nation:'England',stats:[72,75,86,81,85,84],image:'https://assets.fodder.gg/renders/234378.webp'}
 ],
 'LaLiga':[
  {name:'Kylian Mbappé',rating:91,position:'ST',club:'Real Madrid',nation:'France',stats:[96,91,80,92,29,76],image:'https://assets.fodder.gg/renders/231747.webp'},
  {name:'Lamine Yamal',rating:90,position:'RW',club:'FC Barcelona',nation:'Spain',stats:[86,84,87,93,38,61],image:'https://card-image.futmind.com/en/27/277643.png'},
  {name:'Jude Bellingham',rating:90,position:'CAM',club:'Real Madrid',nation:'England',stats:[79,86,83,88,79,85],image:'https://assets.fodder.gg/renders/252371.webp'},
  {name:'Pedri',rating:90,position:'CM',club:'FC Barcelona',nation:'Spain',stats:[76,75,89,91,77,75],image:'https://assets.fodder.gg/renders/251854.webp'},
  {name:'Vini Jr.',rating:89,position:'LW',club:'Real Madrid',nation:'Brazil',stats:[93,85,80,91,31,71],image:'https://assets.fodder.gg/renders/238794.webp'},
  {name:'Thibaut Courtois',rating:90,position:'GK',club:'Real Madrid',nation:'Belgium',stats:[87,89,78,90,46,90],image:'https://assets.fodder.gg/renders/192119.webp'}
 ],
 'Bundesliga':[
  {name:'Harry Kane',rating:90,position:'ST',club:'FC Bayern München',nation:'England',stats:[62,94,83,82,49,83],image:'https://assets.fodder.gg/renders/202126.webp'},
  {name:'Michael Olise',rating:90,position:'RM',club:'FC Bayern München',nation:'France',stats:[83,82,89,91,47,69],image:'https://assets.fodder.gg/renders/247827.webp'},
  {name:'Joshua Kimmich',rating:88,position:'CDM',club:'FC Bayern München',nation:'Germany',stats:[71,73,90,84,81,79],image:'https://assets.fodder.gg/renders/212622.webp'},
  {name:'Jamal Musiala',rating:87,position:'CAM',club:'FC Bayern München',nation:'Germany',stats:[79,81,79,90,62,65],image:'https://assets.fodder.gg/renders/256790.webp'},
  {name:'Nico Schlotterbeck',rating:87,position:'CB',club:'Borussia Dortmund',nation:'Germany',stats:[81,60,76,74,86,84],image:'https://assets.fodder.gg/renders/247819.webp'},
  {name:'Luis Díaz',rating:88,position:'LM',club:'FC Bayern München',nation:'Colombia',stats:[82,82,83,87,44,74],image:'https://assets.fodder.gg/renders/241084.webp'}
 ],
 'Serie A':[
  {name:'Alessandro Bastoni',rating:86,position:'CB',club:'Lombardia FC',nation:'Italy',stats:[74,47,76,78,86,82],image:'https://assets.fodder.gg/renders/237383.webp'},
  {name:'Mike Maignan',rating:87,position:'GK',club:'Milano FC',nation:'France',stats:[83,86,81,89,62,84],image:'https://assets.fodder.gg/renders/215698.webp'},
  {name:'Nicolò Barella',rating:87,position:'CM',club:'Lombardia FC',nation:'Italy',stats:[77,78,84,86,81,72],image:'https://assets.fodder.gg/renders/224232.webp'},
  {name:'Lautaro Martínez',rating:87,position:'ST',club:'Lombardia FC',nation:'Argentina',stats:[80,88,76,85,51,74],image:'https://assets.fodder.gg/renders/231478.webp'},
  {name:'Federico Dimarco',rating:86,position:'LB',club:'Lombardia FC',nation:'Italy',stats:[81,78,85,81,80,74],image:'https://assets.fodder.gg/renders/226268.webp'},
  {name:'Rafael Leão',rating:83,position:'LW',club:'Milano FC',nation:'Portugal',stats:[93,79,79,83,30,73],image:'https://assets.fodder.gg/renders/241721.webp'}
 ],
 'Ligue 1':[
  {name:'Ousmane Dembélé',rating:90,position:'ST',club:'Paris SG',nation:'France',stats:[90,89,83,93,55,70],image:'https://assets.fodder.gg/renders/231443.webp'},
  {name:'Vitinha',rating:90,position:'CM',club:'Paris SG',nation:'Portugal',stats:[72,81,88,91,75,70],image:'https://assets.fodder.gg/renders/255253.webp'},
  {name:'Achraf Hakimi',rating:88,position:'RB',club:'Paris SG',nation:'Morocco',stats:[92,79,81,82,82,81],image:'https://assets.fodder.gg/renders/235212.webp'},
  {name:'Nuno Mendes',rating:89,position:'LB',club:'Paris SG',nation:'Portugal',stats:[94,77,80,86,84,80],image:'https://assets.fodder.gg/renders/252145.webp'},
  {name:'Willian Pacho',rating:89,position:'CB',club:'Paris SG',nation:'Ecuador',stats:[80,34,63,65,90,86],image:'https://assets.fodder.gg/renders/256196.webp'},
  {name:'Khvicha Kvaratskhelia',rating:89,position:'LW',club:'Paris SG',nation:'Georgia',stats:[86,85,84,90,59,81],image:'https://assets.fodder.gg/renders/247635.webp'}
 ]
};
if(!localStorage.getItem('ut27-welcome-pack-claimed')&&clubPlayers.length===0){
 const all=Object.entries(leaguePlayerPools).flatMap(([league,pool])=>pool.map(p=>({...p,league})));
 const take=(arr,n)=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);};
 const chosen=[...take(all.filter(p=>p.position==='GK'),1),...take(all.filter(p=>['LB','RB','CB','LWB','RWB'].includes(p.position)),4),...take(all.filter(p=>['CM','CDM','CAM','LM','RM'].includes(p.position)),3),...take(all.filter(p=>['LW','RW','ST','CF'].includes(p.position)),3)];
 if(chosen.length===11){chosen.forEach((p,i)=>clubPlayers.push({...p,id:'welcome-'+Date.now()+'-'+i,tier:'Gold'}));saveClub();localStorage.setItem('ut27-welcome-pack-claimed','1');}
}
function makePackPlayers(league){
 const pool=(leaguePlayerPools[league]||[]).slice();
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,5).map((p,i)=>({...p,id:'pack-'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2),tier:'Gold',league}));
}
function renderClubCollection(){
 const list=$('#club-collection-list');if(!list)return;list.replaceChildren();$('#club-player-count').textContent=clubPlayers.length;
 clubPlayers.forEach((p,index)=>{const b=document.createElement('button');b.className='club-card';b.type='button';b.setAttribute('aria-label',p.name+' '+p.rating);
 const img=document.createElement('img');img.src=p.image||'';img.alt=p.name;img.loading='lazy';img.onerror=()=>{img.remove();b.classList.add('club-card-fallback');};
 const meta=document.createElement('span');meta.innerHTML='<b>'+p.rating+'</b><small>'+p.position+'</small><strong>'+p.name+'</strong>';
 b.append(img,meta);b.addEventListener('click',()=>{const slot=activeSquadSlot||formationSlots.find(k=>!squadAssignments[k]);if(!slot){openSquadPicker('ST');return;}squadAssignments[slot]=p.id||p.name;localStorage.setItem('ut27-squad',JSON.stringify(squadAssignments));activeSquadSlot='';$('#squad-picker').classList.add('hidden');renderSquad();});list.appendChild(b);});
}
const statLabels = ["PAC","SHO","PAS","DRI","DEF","PHY"];
const keeperStatLabels = ["DIV","HAN","KIC","REF","SPD","POS"];
function labelsForPlayer(player){return player.position==='GK'?keeperStatLabels:statLabels;}
function buildPlayerCard(player,index,featured=false) {
  const card=document.createElement('button');
  card.type='button';
  card.className=`visual-player-card card-tone-${index%6}${featured?' featured':''}`;
  card.setAttribute('aria-label',`فتح بطاقة ${player.name}، تقييم ${player.rating}`);
  card.dataset.playerIndex=String(index);
  const stats=player.stats||[];
  card.innerHTML=`<span class="card-rating">${player.rating}</span><span class="card-position">${player.position}</span><span class="card-portrait"></span><span class="card-player-name">${player.name}</span><span class="card-club">${player.club||''}</span><span class="card-stat-line">${stats.length===6?stats.map((v,i)=>labelsForPlayer(player)[i]+' '+v).join(' · '):'RTTK • FC 27'}</span><span class="card-foot-mark">RTTK</span>`;
  card.addEventListener('click',()=>openPlayerModal(player,index));
  card.addEventListener('pointermove',e=>{
    const b=card.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
    card.style.setProperty('--rx',((.5-y)*10).toFixed(2)+'deg');
    card.style.setProperty('--ry',((x-.5)*12).toFixed(2)+'deg');
  });
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
  return card;
}
function renderEventCards(){
 const grid=$('#event-card-grid'),featured=$('#featured-card-grid');if(!grid||!featured)return;
 const teamImage='https://www.fifplay.com/img/public/fc-27-rttk-team-1.jpg';
 grid.innerHTML='<img class="event-promo-image" src="'+teamImage+'" alt="جميع بطاقات RTTK الثلاثين" loading="eager"><div class="promo-image-fallback">تعذر تحميل صورة الحدث</div>';
 const eventImage=grid.querySelector('.event-promo-image');eventImage.addEventListener('error',()=>{eventImage.style.display='none';grid.querySelector('.promo-image-fallback').style.display='grid';});
 const featuredCards=[
  {name:'Jude Bellingham',url:'https://game-assets.fut.gg/cdn-cgi/image/quality%3D85%2Cwidth%3D300%2Cformat%3Dauto/2027/player-item/27-117692883.af95cec98e905362f438ec3549bb646aefd473f7826a316e42d9956f6a901ad7.webp'},
  {name:'Ousmane Dembélé',url:'https://game-assets.fut.gg/cdn-cgi/image/quality%3D85%2Cwidth%3D300%2Cformat%3Dauto/2027/player-item/27-50563091.8c496ff388f0f46d0374afbf5ad42e1ce26a9a91aa7984080f758610cf049408.webp'},
  {name:'Pedri',url:'https://game-assets.fut.gg/cdn-cgi/image/quality%3D85%2Cwidth%3D300%2Cformat%3Dauto/2027/player-item/27-50583502.09d055593de2c2d01ef7ac0fee7204e3c2e6a0cf0769dfd6f87f441726fe4f86.webp'},
  {name:'Luis Díaz',url:'https://game-assets.fut.gg/cdn-cgi/image/quality%3D85%2Cwidth%3D300%2Cformat%3Dauto/2027/player-item/27-134458812.906510988135428b0e4749f6d043850e12b57180637cd8efaba5ff5801a74e8f.webp'}
 ];
 featuredCards.forEach(p=>{const card=document.createElement('div');card.className='featured-real-card';card.setAttribute('role','img');card.setAttribute('aria-label',p.name+' RTTK');const img=document.createElement('img');img.src=p.url;img.alt=p.name+' RTTK';img.loading='eager';img.onerror=()=>{card.classList.add('image-fallback');card.textContent=p.name+' • RTTK';};card.appendChild(img);featured.appendChild(card);});
}

let selectedPlayer=null;
function openPlayerModal(player,index){
  selectedPlayer={player,index};
  $('#player-modal-title').textContent=player.name+` • ${player.position} • ${player.rating}`;
  $('#player-modal-art').className=`player-modal-art card-tone-${index%6}`;
  const statMarkup=player.stats?.length===6?player.stats.map((v,i)=>'<span><b>'+v+'</b><small>'+labelsForPlayer(player)[i]+'</small></span>').join(''):'<span class="stats-pending">تفاصيل السمات قيد التحديث</span>';
  $('#player-modal-art').innerHTML=player.image?'<img class="modal-real-card" src="'+player.image+'" alt="'+player.name+' Gold '+player.rating+'"><div class="modal-card-caption">'+(player.club||'')+' · '+(player.league||'Gold')+'</div>':'<b>'+player.rating+'</b><span>'+player.position+'</span><strong>'+player.name+'</strong><small>FC 27 • Gold</small><div class="modal-face-stats">'+statMarkup+'</div>';
  const modalImage=$('#player-modal-art').querySelector('img');if(modalImage)modalImage.onerror=()=>{$('#player-modal-art').innerHTML='<b>'+player.rating+'</b><span>'+player.position+'</span><strong>'+player.name+'</strong><small>FC 27 • Gold</small><div class="modal-face-stats">'+statMarkup+'</div>';};
  $('#player-actions').classList.add('hidden');
  $('#player-confirm').classList.remove('hidden');
  $('#player-modal').classList.remove('hidden');
}
function closePlayerModal(){$('#player-modal').classList.add('hidden');selectedPlayer=null;}
renderEventCards();

const squadAssignments = (()=>{try{return JSON.parse(localStorage.getItem('ut27-squad')||'{}')}catch{return {}}})();
Object.keys(squadAssignments).forEach(slot=>{const ref=squadAssignments[slot];if(!clubPlayers.some(p=>p.id===ref||p.name===ref))delete squadAssignments[slot];});
localStorage.setItem('ut27-squad',JSON.stringify(squadAssignments));
let activeSquadSlot = '';
const benchPanel = $('#bench-panel');
function renderBench(){
  const list=$('#bench-list'); if(!list)return;
  const used=new Set(Object.values(squadAssignments));
  const bench=clubPlayers.filter(p=>!used.has(p.id)&&!used.has(p.name));
  list.replaceChildren();
  bench.slice(0,12).forEach(p=>{
    const b=document.createElement('button');b.className='bench-player';b.type='button';
    b.innerHTML=(p.image?'<img src="'+p.image+'" alt="" loading="lazy">':'')+'<span><b>'+p.rating+'</b><br>'+p.position+'<br>'+p.name.split(' ').slice(-1)[0]+'</span>'; 
    b.addEventListener('click',()=>{const preferred=activeSquadSlot;const choices=p.position==='GK'?['GK']:['LB','CB1','CB2','RB','CM1','CM2','CM3','LW','ST','RW'];const slot=preferred&&!squadAssignments[preferred]?preferred:choices.find(s=>!squadAssignments[s]&&(s===p.position||(s.startsWith('CB')&&p.position==='CB')||(s.startsWith('CM')&&['CM','CDM','CAM'].includes(p.position))||(s==='LW'&&['LW','LM'].includes(p.position))||(s==='RW'&&['RW','RM'].includes(p.position))||(s==='ST'&&['ST','CF'].includes(p.position))||(s==='LB'&&['LB','LWB'].includes(p.position))||(s==='RB'&&['RB','RWB'].includes(p.position))));if(slot){squadAssignments[slot]=p.id||p.name;localStorage.setItem('ut27-squad',JSON.stringify(squadAssignments));activeSquadSlot='';renderSquad();}else openSquadPicker(p.position);});
    list.appendChild(b);
  });
}
function renderSquad(){
 updateSquadPitch3D();
 const select=$('#formation-select');if(select)select.value=selectedFormation;
 const coords=formationPresets[selectedFormation]||formationPresets['4-3-3'];
 $$('#squad-pitch [data-slot]').forEach((btn,i)=>{const player=clubPlayers.find(p=>p.id===squadAssignments[btn.dataset.slot]||p.name===squadAssignments[btn.dataset.slot]);const [x,z]=coords[i]||[0,0];const projected=new THREE.Vector3(z,1.35,x).project(squad3DCamera);btn.style.left=((projected.x+1)*50)+'%';btn.style.top=((1-projected.y)*50)+'%';btn.style.bottom='auto';btn.classList.toggle('selected',!!player);btn.innerHTML=player?'<span class="squad-card-rating">'+player.rating+'</span><span class="squad-card-position">'+player.position+'</span>'+(player.image?'<img class="squad-card-art" src="'+player.image+'" alt="" loading="lazy" onerror="this.remove()">':'<span class="squad-card-silhouette">⚽</span>')+'<span class="squad-card-name">'+player.name.split(' ').slice(-1)[0]+'</span>':'<span class="squad-card-empty">'+btn.dataset.slot+'</span>';});
 const label=$('#formation-label');if(label)label.textContent=selectedFormation;renderBench();renderClubCollection();
 const ratings=Object.values(squadAssignments).map(n=>clubPlayers.find(p=>p.id===n||p.name===n)?.rating||0);const ratingLabel=document.querySelector('.page[data-page="squad"] .mode-count');if(ratingLabel)ratingLabel.textContent='التقييم '+(ratings.length?Math.round(ratings.reduce((a,b)=>a+b,0)/ratings.length):0);
 const count=formationSlots.filter(slot=>squadAssignments[slot]&&clubPlayers.some(p=>p.id===squadAssignments[slot]||p.name===squadAssignments[slot])).length;const gateNote=$('#squad-gate-note');if(gateNote)gateNote.textContent='التشكيلة: '+count+'/11 لاعب';
}

function openSquadPicker(slot){
  activeSquadSlot=slot;
  const title=$('#squad-picker-title'),list=$('#squad-picker-list'),panel=$('#squad-picker');
  if(!title||!list||!panel)return;
  title.textContent='اختار اللاعب لمركز '+slot;
  list.replaceChildren();
  const assigned=Object.values(squadAssignments);
  const available=clubPlayers.filter(p=>(!assigned.includes(p.id)&&!assigned.includes(p.name))||squadAssignments[slot]===p.id||squadAssignments[slot]===p.name);
  available.forEach(p=>{
    const b=document.createElement('button');b.type='button';b.className='squad-pick-card';
    const img=p.image?'<img src="'+p.image+'" alt="" loading="lazy" onerror="this.remove()">':'<span class="pick-placeholder">⚽</span>';
    b.innerHTML=img+'<span><b>'+p.rating+' OVR</b><br>'+p.name+'<br>'+p.position+'</span>';
    b.addEventListener('click',()=>{squadAssignments[slot]=p.id||p.name;localStorage.setItem('ut27-squad',JSON.stringify(squadAssignments));activeSquadSlot='';panel.classList.add('hidden');renderSquad();});
    list.appendChild(b);
  });
  if(!available.length)list.innerHTML='<p class="bench-empty">مفيش لاعبين متاحين في النادي. افتح باك وأضف لاعبين الأول.</p>';
  panel.classList.remove('hidden');
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  requestAnimationFrame(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}));
}
$('#squad-pitch')?.addEventListener('click',e=>{const btn=e.target.closest('button[data-slot]');if(!btn)return;e.preventDefault();e.stopPropagation();openSquadPicker(btn.dataset.slot);});
$('#formation-select')?.addEventListener('change',e=>{selectedFormation=e.target.value;localStorage.setItem('ut27-formation',selectedFormation);renderSquad();});
$('#save-squad-for-match')?.addEventListener('click',()=>{const count=formationSlots.filter(slot=>squadAssignments[slot]&&clubPlayers.some(p=>p.id===squadAssignments[slot]||p.name===squadAssignments[slot])).length;if(count<11){$('#squad-gate-note').textContent='كمّل اختيار 11 لاعب من النادي قبل دخول المباراة.';return;}$('#squad-match-gate').classList.add('hidden');switchTab('play');difficultyPanel.classList.remove('hidden');difficultyPanel.scrollIntoView({behavior:'smooth',block:'nearest'});});
$('#close-squad-picker').addEventListener('click',()=>$('#squad-picker').classList.add('hidden'));
$('#toggle-bench').addEventListener('click',()=>benchPanel.classList.toggle('collapsed'));
renderSquad();


$('#player-confirm').addEventListener('click',()=>{
  $('#player-actions').classList.remove('hidden');
  $('#player-confirm').classList.add('hidden');
});
$$('[data-close-player]').forEach(btn=>btn.addEventListener('click',closePlayerModal));
$$('[data-player-action]').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.playerAction;
  if(action==='back'){closePlayerModal();}
  else if(action==='squad'){const p=selectedPlayer?.player;if(p&&!clubPlayers.some(x=>x.name===p.name)){clubPlayers.push({...p,id:'event-'+Date.now(),tier:'Special'});saveClub();renderSquad();}closePlayerModal();switchTab('squad');}
   else if(action==='sbc'){closePlayerModal();switchTab(action);}
  else {
    $('#player-modal-title').textContent='الأنماط الأساسية';
    $('#player-actions').innerHTML='<button type="button">أساسي</button><button type="button">هجومي</button><button type="button">دفاعي</button><button type="button" data-player-back>رجوع</button>';
    $('#player-actions').querySelector('[data-player-back]').addEventListener('click',()=>{
      $('#player-modal-title').textContent=selectedPlayer?.player.name||'لاعب الحدث';
      $('#player-actions').innerHTML='<button data-player-action="styles">الأنماط الأساسية</button><button data-player-action="squad">إضافة للتشكيلة</button><button data-player-action="sbc">استخدام في SBC</button><button data-player-action="back">رجوع</button>';
      $$( '#player-actions [data-player-action]' ).forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.playerAction;if(a==='back')closePlayerModal();else if(a==='squad'||a==='sbc'){closePlayerModal();switchTab(a);}else $('#player-modal-title').textContent='الأنماط الأساسية';}));
    });
  }
}));

function switchTab(tab) {
  currentTab = tab;
  if(tab==='squad'&&typeof renderSquad==='function')renderSquad();
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
$$( '.quick-items button' ).forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
let activeSbcChallenge='';
let selectedSbcPlayers=[];
function openSbcChallenge(card){
 activeSbcChallenge=card.querySelector('h3')?.textContent||'SBC Challenge';selectedSbcPlayers=[];
 $('#sbc-active-title').textContent=activeSbcChallenge;
 $('#sbc-result').textContent='';
 const pool=$('#sbc-player-pool');pool.replaceChildren();
 if(clubPlayers.length<3){$('#sbc-result').textContent='تحتاج إلى 3 لاعبين على الأقل في النادي لإكمال التحدي.';$('#sbc-submit').disabled=true;$('#sbc-submit-panel').classList.remove('hidden');return;}
 const alreadySelected=new Set(Object.values(squadAssignments));clubPlayers.forEach((p,index)=>{if(alreadySelected.has(p.id)||alreadySelected.has(p.name))return;const b=document.createElement('button');b.type='button';b.className='sbc-player-option';b.innerHTML='<b>'+p.rating+'</b><small>'+p.position+'</small><strong>'+p.name+'</strong>';b.addEventListener('click',()=>{if(selectedSbcPlayers.includes(index)){selectedSbcPlayers=selectedSbcPlayers.filter(x=>x!==index);b.classList.remove('selected');}else if(selectedSbcPlayers.length<3){selectedSbcPlayers.push(index);b.classList.add('selected');}$('#sbc-select-count').textContent='اختر 3 لاعبين من النادي ('+selectedSbcPlayers.length+'/3)';$('#sbc-submit').disabled=selectedSbcPlayers.length!==3;});pool.appendChild(b);});
 $('#sbc-select-count').textContent='اختر 3 لاعبين من النادي (0/3)';$('#sbc-submit').disabled=true;$('#sbc-submit-panel').classList.remove('hidden');
}
$$('#sbc-challenge-grid .challenge-card').forEach(card=>{card.tabIndex=0;card.addEventListener('click',()=>openSbcChallenge(card));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSbcChallenge(card);}});});
$('#sbc-cancel').addEventListener('click',()=>$('#sbc-submit-panel').classList.add('hidden'));
$('#sbc-submit').addEventListener('click',()=>{
 if(selectedSbcPlayers.length!==3)return;
 const consumed=selectedSbcPlayers.map(i=>clubPlayers[i]);
 const indexes=[...selectedSbcPlayers].sort((a,b)=>b-a);indexes.forEach(i=>clubPlayers.splice(i,1));
 consumed.forEach(p=>Object.keys(squadAssignments).forEach(slot=>{if(squadAssignments[slot]===p.id||squadAssignments[slot]===p.name)delete squadAssignments[slot];}));localStorage.setItem('ut27-squad',JSON.stringify(squadAssignments));
 const rewardSource=eventPlayers[Math.floor(Math.random()*eventPlayers.length)];
 const reward={...rewardSource,id:'sbc-reward-'+Date.now(),tier:'SBC Reward'};
 clubPlayers.push(reward);saveClub();renderSquad();
 $('#sbc-result').textContent='تم تسليم 3 لاعبين وإضافة '+reward.name+' ('+reward.rating+') إلى النادي.';
 $('#sbc-player-pool').replaceChildren();$('#sbc-select-count').textContent='اكتمل التحدي';$('#sbc-submit').disabled=true;selectedSbcPlayers=[];
});
$$('[data-sbc-tab]').forEach(btn => btn.addEventListener('click', () => {
  $$('[data-sbc-tab]').forEach(x => x.classList.toggle('selected', x === btn));
  const mode = btn.dataset.sbcTab;
  $$( '#sbc-challenge-grid .challenge-card' ).forEach(card => {
    const tag = card.querySelector('.event-tag')?.textContent.trim().toLowerCase() || '';
    card.classList.toggle('hidden', mode === 'upgrades' ? !tag.includes('upgrade') : mode === 'challenges' ? tag.includes('upgrade') : false);
  });
}));

$('#open-squad-battles').addEventListener('click',()=>{switchTab('squad');$('#squad-match-gate').classList.remove('hidden');$('#squad-match-gate').scrollIntoView({behavior:'smooth',block:'nearest'});});
$$( '[data-close-panel]' ).forEach(btn => btn.addEventListener('click', () => difficultyPanel.classList.add('hidden')));
$$( '[data-difficulty]' ).forEach(btn => btn.addEventListener('click', () => {
  $$('.difficulty-grid button').forEach(x => x.classList.remove('chosen'));
  btn.classList.add('chosen');
  selectedDifficulty = btn.dataset.difficulty;
  $('#difficulty-note').textContent = `الصعوبة المختارة: ${selectedDifficulty}`;
  $('#start-match').disabled = false;
}));
$('#start-match').addEventListener('click', () => {
  if (!selectedDifficulty) return;
  const filled=formationSlots.filter(slot=>squadAssignments[slot]&&clubPlayers.some(p=>p.id===squadAssignments[slot]||p.name===squadAssignments[slot])).length;
  if(filled<11){$('#difficulty-note').textContent='لازم تكمل الـ11 مركز في التشكيلة الأول.';return;}
  $('#difficulty-note').textContent = `بدأت المباراة على مستوى ${selectedDifficulty}`;
  applyMatchFormation();resetBall();elapsed=0;scoreW=0;scoreB=0;controlled=white[9];scoreEl.textContent='0 - 0';clockEl.textContent='00:00';
  appShell.classList.add('hidden');
  gameRoot.classList.remove('game-hidden');
  matchHud.classList.remove('hidden');
  matchControls.classList.remove('hidden');
  $('#message').textContent = `Squad Battles • ${selectedDifficulty}`;
  refreshMatchRoster();
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
$('#coin-count').textContent=coins.toLocaleString('en-US');$('#store-coins').textContent=coins.toLocaleString('en-US');

const leaguePackInfo={
 'Premier League':{title:'Premier League Gold Pack',flag:'🏴',price:1000},
 'LaLiga':{title:'LaLiga Gold Pack',flag:'🇪🇸',price:1000},
 'Bundesliga':{title:'Bundesliga Gold Pack',flag:'🇩🇪',price:1000},
 'Serie A':{title:'Serie A Gold Pack',flag:'🇮🇹',price:1000},
 'Ligue 1':{title:'Ligue 1 Gold Pack',flag:'🇫🇷',price:1000}
};
function showPackModal(name,price,league){
 const reveal=$('#pack-reveal-list');reveal.replaceChildren();
 if(price>coins){$('#pack-title').textContent=name;$('#pack-message').textContent='رصيدك من الكوينز غير كافٍ لفتح الباك.';}
 else{
  coins-=price;localStorage.setItem('ut27-coins',String(coins));$('#coin-count').textContent=coins.toLocaleString('en-US');$('#store-coins').textContent=coins.toLocaleString('en-US');
  const items=makePackPlayers(league);clubPlayers.push(...items);saveClub();renderSquad();
  $('#pack-title').textContent=name;$('#pack-message').textContent='مبروك! طلعت لك '+items.length+' كروت Gold حقيقية من '+league+'. اتضافوا كلهم لناديك.';
  items.forEach((p,index)=>{const b=document.createElement('button');b.type='button';b.className='pack-player-item';b.style.animationDelay=(index*.09)+'s';b.setAttribute('aria-label',p.name+' '+p.rating);
   const img=document.createElement('img');img.src=p.image;img.alt=p.name+' Gold '+p.rating;img.loading='eager';img.onerror=()=>{img.remove();b.classList.add('card-image-fallback');b.innerHTML='<b>'+p.rating+'</b><strong>'+p.name+'</strong><small>'+p.position+'</small>';};
   b.appendChild(img);b.addEventListener('click',()=>openPlayerModal(p,index));reveal.appendChild(b);});
 }
 $('#pack-modal').classList.remove('hidden');
}
let selectedPackLeague='';
$$('[data-select-league]').forEach(btn=>btn.addEventListener('click',()=>{
 selectedPackLeague=btn.dataset.selectLeague;
 const pack=leaguePackInfo[selectedPackLeague];if(!pack)return;
 $$('.league-pack-card').forEach(card=>card.classList.toggle('selected',card.dataset.league===selectedPackLeague));
 $('#selected-league-pack').classList.remove('hidden');
 $('#selected-pack-name').textContent=pack.title;
 $('#selected-pack-description').textContent='5 لاعبين Gold عشوائيين من '+selectedPackLeague+'، كل كارت بصورته وتقييمه وإحصائياته';
 $('#selected-pack-art').className='pack-art league-pack '+({'Premier League':'premier-pack','LaLiga':'laliga-pack','Bundesliga':'bundes-pack','Serie A':'serie-pack','Ligue 1':'ligue-pack'}[selectedPackLeague]);
 $('#selected-pack-art').innerHTML='<span>'+pack.flag+'</span><b>GOLD</b><small>5 PLAYERS</small>';
 $('#open-selected-pack').textContent='افتح الباك · '+pack.price.toLocaleString('en-US')+' 🪙';
}));
$('#open-selected-pack').addEventListener('click',()=>{const pack=leaguePackInfo[selectedPackLeague];if(pack)showPackModal(pack.title,pack.price,selectedPackLeague);});
$$( '[data-close-modal]' ).forEach(btn => btn.addEventListener('click', () => $('#pack-modal').classList.add('hidden')));

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