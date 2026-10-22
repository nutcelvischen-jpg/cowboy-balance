import {clamp} from './model.js';
export const angleDifference=(a,b)=>((a-b+540)%360)-180;
export function screenRoll(beta,gamma,screenAngle=0){
 if(!Number.isFinite(beta)||!Number.isFinite(gamma))return null;
 const a=((screenAngle%360)+360)%360;
 if(a===90)return beta;
 if(a===270)return -beta;
 if(a===180)return -gamma;
 return gamma;
}
export class TiltController {
 constructor(env=window,now=()=>performance.now()){
  this.env=env;this.now=now;this.samples=[];this.value=0;this.raw=0;this.zero=null;this.lastAt=-Infinity;this.enabled=false;this.waiters=[];
  this.receive=e=>{const roll=screenRoll(e.beta,e.gamma,this.orientation());if(roll===null)return;this.raw=roll;this.lastAt=this.now();this.samples.push({value:roll,time:this.lastAt});this.samples=this.samples.filter(s=>this.lastAt-s.time<1000);this.waiters.splice(0).forEach(f=>f());};
 }
 orientation(){return this.env.screen?.orientation?.angle??this.env.orientation??0;}
 async enable(){
  if(!this.env.isSecureContext)throw new Error('傾斜操控需要 HTTPS 網址。現在可以先選「觸控試玩」。');
  const API=this.env.DeviceOrientationEvent;
  if(!API)throw new Error('這台裝置沒有可用的方向感測器。請改用觸控或方向鍵。');
  if(typeof API.requestPermission==='function'){
   const result=await API.requestPermission();
   if(result!=='granted')throw new Error('沒有取得動作感測權限。可重試授權，或先用觸控試玩。');
  }
  if(!this.enabled){this.env.addEventListener('deviceorientation',this.receive);this.enabled=true;}
  if(this.now()-this.lastAt<1000)return;
  await new Promise((resolve,reject)=>{
   let timeout;
   const done=()=>{clearTimeout(timeout);resolve();};this.waiters.push(done);
   timeout=setTimeout(()=>{this.waiters=this.waiters.filter(f=>f!==done);reject(new Error('沒有收到傾斜資料。請在手機 Safari 或 Chrome 開啟，或選觸控試玩。'));},4000);
  });
 }
 calibrate(){
  const recent=this.samples.filter(s=>this.now()-s.time<1000);
  if(this.now()-this.lastAt>1500||recent.length===0)throw new Error('感測資料中斷了，請重新啟用傾斜。');
  const anchor=recent[0].value,values=recent.map(s=>angleDifference(s.value,anchor));
  if(Math.max(...values)-Math.min(...values)>6)throw new Error('手機還在晃動。用舒服的姿勢拿穩，再按一次。');
  this.zero=anchor+values.reduce((a,b)=>a+b,0)/values.length;this.value=0;
 }
 update(dt){const target=this.zero===null?0:clamp(angleDifference(this.raw,this.zero)/12);this.value+=(target-this.value)*(1-Math.exp(-12*dt));return this.value;}
 get stale(){return this.now()-this.lastAt>3500;}
 destroy(){this.env.removeEventListener('deviceorientation',this.receive);this.enabled=false;}
}
