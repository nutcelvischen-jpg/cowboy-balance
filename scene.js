import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clamp} from './model.js';
import {bullPose} from './motion.js';
const C={bull:0x754529,dark:0x3a2923,nose:0xa97451,cream:0xf9dc99,shirt:0xd46931,pants:0x305b69,hat:0xc58a43,skin:0xc78b61,red:0xae3928};
export class Arena {
 constructor(canvas){
  this.canvas=canvas;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.setClearColor(0x234b4e);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene=new T.Scene();this.scene.fog=new T.Fog(0x234b4e,16,35);this.camera=new T.PerspectiveCamera(38,1,.1,70);this.camera.position.set(0,4.8,10.5);this.camera.lookAt(0,1.55,0);
  const hemi=new T.HemisphereLight(0xffecc5,0x284248,1.8);this.scene.add(hemi);const sun=new T.DirectionalLight(0xffe0b8,2.6);sun.position.set(-5,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.bias=-.001;this.scene.add(sun);const rim=new T.DirectionalLight(0xffba66,1.4);rim.position.set(3,5,-4);this.scene.add(rim);
  this.materials=new Map();this.world();this.makeBull();this.makeRider();this.attachBullRig();this.resize();this.ready=this.loadCharacters();
 }
 async loadCharacters(){
  const loader=new GLTFLoader();
  // Load both before swapping so a slow or missing asset never leaves half a rider.
  const [bullAsset,riderAsset]=await Promise.all([
   loader.loadAsync(new URL('./assets/models/bull.glb',import.meta.url).href),
   loader.loadAsync(new URL('./assets/models/cowboy.glb',import.meta.url).href)
  ]);
  const node=(root,name)=>{const n=root.getObjectByName(name);if(!n)throw new Error(`Missing character pivot: ${name}`);return n;};
  const bull=bullAsset.scene,rider=riderAsset.scene;
  const head=node(bull,'Head'),tail=node(bull,'Tail'),legs=['LF','LB','RF','RB'].map(n=>node(bull,'Leg_'+n));
  const torso=node(rider,'Torso'),arm=node(rider,'Arm'),scarf=node(rider,'Scarf');
  for(const root of [bull,rider])root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  this.scene.remove(this.bullRig);
  for(const old of [this.bull,this.rider]){this.scene.remove(old);old.traverse(o=>{if(o.isMesh)o.geometry.dispose();});}
  Object.assign(this,{bull,rider,head,tail,legs,torso,arm,scarf});this.scene.add(bull,rider);this.attachBullRig();
  this.canvas.dataset.characters='blender';
 }
 attachBullRig(){
  // Rotate around the torso, not a point underneath the hooves.
  this.bullRig=new T.Group();this.scene.add(this.bullRig);this.bullRig.add(this.bull);
  this.bull.position.set(0,-1.35,0);this.bullRig.position.set(0,1.35,0);
  this.bullRig.rotation.order='YXZ';
 }
 mat(color){if(!this.materials.has(color))this.materials.set(color,new T.MeshStandardMaterial({color,roughness:1,flatShading:true}));return this.materials.get(color);}
 mesh(geo,color,parent,pos=[0,0,0],scale=[1,1,1]){const o=new T.Mesh(geo,this.mat(color));o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 ball(parent,color,pos,scale,detail=1){return this.mesh(new T.IcosahedronGeometry(1,detail),color,parent,pos,scale);}
 box(parent,color,pos,scale){return this.mesh(new T.BoxGeometry(1,1,1),color,parent,pos,scale);}
 rod(parent,a,b,r,color){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A);const o=this.mesh(new T.CylinderGeometry(r,r,d.length(),7),color,parent);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 world(){
  const ground=this.mesh(new T.CircleGeometry(35,64),0xc79759,this.scene);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
  const ring=this.mesh(new T.CylinderGeometry(5.4,5.5,.13,48),0xe2b773,this.scene,[0,-.04,0]);ring.castShadow=false;
  for(let i=0;i<23;i++){const a=(i/22)*Math.PI+Math.PI;const x=Math.cos(a)*6.4,z=Math.sin(a)*6.4;this.box(this.scene,0x855d3a,[x,.7,z],[.13,1.4,.13]);if(i<22){const b=((i+1)/22)*Math.PI+Math.PI;for(const y of [.45,1.05])this.rod(this.scene,[x,y,z],[Math.cos(b)*6.4,y,Math.sin(b)*6.4],.05,0xd3ab72);}}
  for(let i=0;i<9;i++){const x=-20+i*5,z=-15-(i%3)*2;const rock=this.mesh(new T.CylinderGeometry(1.5,3,3+(i%3)*2,5),i%2?0x376367:0x2e595d,this.scene,[x,1.2,z]);rock.rotation.y=i;}
  for(const [x,z,s]of [[-7,-4,1],[-9,-10,1.3],[8,-8,1.2]]){const cactus=new T.Group();this.scene.add(cactus);cactus.position.set(x,0,z);cactus.scale.setScalar(s);this.rod(cactus,[0,0,0],[0,2.2,0],.16,0x3e6456);this.rod(cactus,[0,1,0],[-.6,1,0],.12,0x3e6456);this.rod(cactus,[-.6,1,0],[-.6,1.7,0],.12,0x3e6456);this.rod(cactus,[0,1.4,0],[.55,1.4,0],.12,0x3e6456);this.rod(cactus,[.55,1.4,0],[.55,1.9,0],.12,0x3e6456);}
  const edge=this.mesh(new T.TorusGeometry(5.15,.025,4,96),0xad7943,this.scene,[0,.035,0]);edge.rotation.x=-Math.PI/2;
  for(let i=0;i<16;i++){const a=Math.PI+i/15*Math.PI,x=Math.cos(a)*6.4,z=Math.sin(a)*6.4;const flag=this.mesh(new T.ConeGeometry(.19,.34,3),i%2?0xc65c39:0xe9c67b,this.scene,[x,1.4,z]);flag.rotation.z=Math.PI;}
  this.dust=[];for(let i=0;i<18;i++){const d=this.ball(this.scene,0xf0ca86,[0,.1,0],[.04,.04,.04],0);d.visible=false;this.dust.push(d);}
 }
 makeBull(){
  this.bull=new T.Group();this.scene.add(this.bull);
  this.ball(this.bull,C.bull,[0,1.45,0],[.8,.65,1.1],2);this.ball(this.bull,C.dark,[0,1.75,.63],[.7,.55,.65]);
  this.head=new T.Group();this.head.position.set(0,1.55,1.05);this.bull.add(this.head);this.ball(this.head,C.bull,[0,0,0],[.61,.56,.62]);this.ball(this.head,C.nose,[0,-.23,.46],[.53,.31,.30]);
  for(const side of [-1,1]){this.ball(this.head,C.dark,[side*.22,-.19,.73],[.055,.035,.035]);this.ball(this.head,C.cream,[side*.36,.13,.42],[.095,.075,.065]);this.ball(this.head,0x201c19,[side*.36,.13,.48],[.04,.047,.022]);const ear=this.ball(this.head,C.bull,[side*.65,.23,-.03],[.31,.10,.19],0);ear.rotation.z=side*.35;
   const horn=new T.Mesh(new T.ConeGeometry(.12,.72,8),this.mat(C.cream));horn.position.set(side*.64,.51,.1);horn.rotation.z=-side*.8;this.head.add(horn);horn.castShadow=true;
  }
  this.legs=[];for(const x of [-.53,.53])for(const z of [-.65,.65]){const leg=new T.Group();leg.position.set(x,1.25,z);this.bull.add(leg);this.rod(leg,[0,0,0],[0,-.72,.04],.14,C.bull);this.box(leg,C.dark,[0,-.85,.09],[.28,.27,.36]);this.legs.push(leg);}
  this.tail=new T.Group();this.tail.position.set(0,1.6,-1.0);this.bull.add(this.tail);this.rod(this.tail,[0,0,0],[.2,-.05,-.8],.047,C.bull);this.ball(this.tail,C.dark,[.22,-.05,-.88],[.11,.12,.18],0);
  this.ball(this.bull,0xa65630,[0,2.0,-.1],[.61,.13,.62]);this.box(this.bull,C.dark,[0,2.1,-.1],[.72,.08,.58]);
  const rope=this.mesh(new T.TorusGeometry(.73,.037,5,32),C.cream,this.bull,[0,1.52,.4]);rope.rotation.x=Math.PI/2;rope.scale.y=.85;
 }
 makeRider(){
  this.rider=new T.Group();this.scene.add(this.rider);
  this.ball(this.rider,C.pants,[0,.08,0],[.40,.23,.31]);
  for(const s of [-1,1]){this.rod(this.rider,[s*.24,.05,0],[s*.69,-.36,.15],.15,C.pants);this.rod(this.rider,[s*.69,-.36,.15],[s*.71,-.87,.3],.12,C.pants);this.box(this.rider,C.dark,[s*.72,-.95,.39],[.23,.20,.43]);}
  this.torso=new T.Group();this.rider.add(this.torso);this.ball(this.torso,C.shirt,[0,.56,0],[.37,.52,.25]);this.box(this.torso,0x543523,[0,.2,.01],[.70,.095,.47]);this.box(this.torso,C.cream,[0,.20,.27],[.16,.12,.035]);
  this.rod(this.torso,[-.28,.83,0],[-.47,.37,.43],.10,C.shirt);this.rod(this.torso,[-.47,.37,.43],[-.08,.1,.53],.08,C.skin);this.ball(this.torso,C.skin,[-.08,.1,.53],[.1,.10,.10]);
  this.arm=new T.Group();this.arm.position.set(.30,.87,0);this.torso.add(this.arm);this.rod(this.arm,[0,0,0],[.35,.3,0],.10,C.shirt);this.rod(this.arm,[.35,.3,0],[.37,.73,.04],.075,C.skin);this.ball(this.arm,C.skin,[.37,.78,.04],[.10,.12,.10]);
  this.ball(this.torso,C.skin,[0,1.22,.015],[.23,.29,.22],1);this.ball(this.torso,C.dark,[0,1.33,-.1],[.24,.18,.18],0);this.box(this.torso,C.dark,[-.085,1.25,.217],[.038,.04,.018]);this.box(this.torso,C.dark,[.085,1.25,.217],[.038,.04,.018]);this.ball(this.torso,C.skin,[0,1.17,.24],[.07,.08,.07],0);
  this.mesh(new T.CylinderGeometry(.52,.53,.055,12),C.hat,this.torso,[0,1.48,0],[1,1,.78]);this.mesh(new T.CylinderGeometry(.24,.31,.27,10),C.hat,this.torso,[0,1.62,0],[1,1,.85]);this.mesh(new T.CylinderGeometry(.30,.31,.055,10),C.dark,this.torso,[0,1.51,0],[1,1,.85]);
  this.mesh(new T.ConeGeometry(.19,.3,3),C.red,this.torso,[0,.98,.24]).rotation.z=Math.PI;this.scarf=this.mesh(new T.ConeGeometry(.12,.48,3),C.red,this.torso,[-.20,1.0,-.2]);this.scarf.rotation.z=-1.4;
 }
 resize(){
  const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;
  this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.fov=36;
  const topSpace=r.height<400?92:128,usable=Math.max(180,r.height-topSpace-22);
  const height=Math.max(5.1*r.height/usable,4.2/this.camera.aspect);
  const distance=height/(2*Math.tan(T.MathUtils.degToRad(18)));
  this.cameraOffset=new T.Vector3(.42,.25,1).normalize().multiplyScalar(distance);this.viewWidth=height*this.camera.aspect;this.camera.position.copy(this.cameraOffset).add(new T.Vector3(0,2,0));this.camera.lookAt(0,2,0);
  this.camera.setViewOffset(r.width,r.height,0,-topSpace/2,r.width,r.height);this.camera.updateProjectionMatrix();
 }
 draw(game,now){
  const t=['ready','won'].includes(game.phase)?now*.0007:game.time;
  const running=game.phase==='playing',pose=bullPose(game,now,this.reduced);
  this.bullRig.position.set(0,1.35+pose.lift,0);
  this.bullRig.rotation.set(pose.pitch,pose.yaw,pose.roll,'YXZ');
  this.head.rotation.set(pose.headPitch,pose.headYaw,-pose.roll*.18);
  this.tail.rotation.y=pose.tail;
  this.legs.forEach((leg,i)=>{leg.rotation.set(pose.legs[i].pitch,0,pose.legs[i].roll);});
  // Raise the rig only when necessary to keep the kicking hooves above the sand.
  this.bullRig.updateMatrixWorld(true);
  const bullBounds=new T.Box3().setFromObject(this.bull);
  this.bullRig.position.y+=Math.max(0,.04-bullBounds.min.y);
  this.bullRig.updateMatrixWorld(true);
  const seat=this.bullRig.localToWorld(new T.Vector3(0,.78,-.18));
  this.rider.position.copy(seat);
  this.rider.quaternion.copy(this.bullRig.quaternion).multiply(new T.Quaternion().setFromEuler(new T.Euler(-pose.pitch*.45,0,-pose.roll*.65-game.angle*.65)));
  this.torso.rotation.x=running?Math.sin(t*6.5)*.06:0;
  this.arm.rotation.z=Math.sin(t*(running?6:3))*(running?.30:.15);
  this.scarf.rotation.x=Math.sin(t*8)*(running?.55:.2);
  const falling=['falling','finished'].includes(game.phase);
  if(falling){
   const p=clamp(game.fallTime/1.05,0,1),side=game.fallDirection||1;
   this.rider.position.x=seat.x*(1-p)+side*p*2.5;
   this.rider.position.y=seat.y+Math.sin(p*Math.PI)*1.1-p*1.85;
   const landing=new T.Quaternion().setFromEuler(new T.Euler(p*.7,pose.yaw,-side*p*1.5));
   this.rider.quaternion.slerp(landing,p);
   this.rider.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(this.rider);
   if(bounds.min.y<.04)this.rider.position.y+=.04-bounds.min.y;
  }
  const dustAge=game.time-game.lastBuck;this.dust.forEach((d,i)=>{d.visible=running&&dustAge<.65&&!this.reduced;if(d.visible){const a=i*2.399;const r=.6+dustAge*(1+i%3);d.position.set(Math.sin(a)*r,.05+Math.sin(dustAge/.65*Math.PI)*.25,Math.cos(a)*r);d.scale.setScalar((1-dustAge/.65)*(.05+(i%3)*.02));}});
  // Reframe a fall to include the landing; keep normal play camera fixed.
  const fallProgress=falling?clamp(game.fallTime/1.05,0,1):0;
  const target=new T.Vector3(0,2,0);
  if(falling){
   this.rider.updateMatrixWorld(true);this.bull.updateMatrixWorld(true);
   const union=new T.Box3().setFromObject(this.bull).union(new T.Box3().setFromObject(this.rider));
   const centre=union.getCenter(new T.Vector3());centre.y+=.25;
   target.lerp(centre,fallProgress);
  }
  this.camera.position.copy(this.cameraOffset).add(target);this.camera.lookAt(target);
  // Brief, bounded impact kick: HUD and balance meter remain stationary.
  if(running&&!this.reduced){const shake=pose.impact*.055;this.camera.position.x+=Math.sin(t*38)*shake;this.camera.position.y+=Math.cos(t*31)*shake*.6;}
  this.camera.zoom=1-fallProgress*(1-Math.min(1,this.viewWidth/8.6));this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene,this.camera);
 }
}
