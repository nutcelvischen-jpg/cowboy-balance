export const clamp=(n,lo=-1,hi=1)=>Math.max(lo,Math.min(hi,n));
export const ROUND_SECONDS=30;
export function rng(seed=12345){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// Every impulse is announced. Alternating combos have >= 1.05 s between hits.
// The last portion of each six-second wave lets the player recover grip.
export function attackPlan(random){
 const waves=[[2.4,4.1],[6.9,8.05,9.5],[12.9,14.1,15.55],[18.9,20.05,21.2,22.35],[24.85,26,27.15,28.3,29.4]];
 return waves.flatMap((times,wave)=>{const direction=random()>.5?1:-1;return times.map((at,i)=>({at,direction:i%2?-direction:direction,strength:1.3+wave*.28+random()*.16,feint:wave===2||wave===4&&i===0}));});
}
export class Rodeo {
 constructor(seed=Date.now()){this.random=rng(seed);this.reset();}
 reset(){this.time=0;this.angle=.06;this.velocity=0;this.grip=100;this.phase='ready';this.bucks=0;this.attacks=attackPlan(this.random);this.attackIndex=0;this.lastBuck=-10;this.lastDirection=1;this.lastStrength=1;this.fallTime=0;this.fallDirection=0;this.accumulator=0;this.paused=false;this.input=0;}
 start(){this.reset();this.phase='playing';}
 get level(){return Math.min(5,1+Math.floor(this.time/6));}
 get remaining(){return Math.max(0,ROUND_SECONDS-this.time);}
 get nextAttack(){return this.attacks[this.attackIndex];}
 get nextBuck(){return this.nextAttack?.at??Infinity;}
 get buckDirection(){return this.nextAttack?.direction??0;}
 get cue(){const gap=this.nextBuck-this.time;return this.phase==='playing'&&gap>0&&gap<=.85?this.buckDirection:0;}
 get feint(){const a=this.nextAttack,gap=this.nextBuck-this.time;return this.phase==='playing'&&a?.feint&&gap>.85&&gap<1.2?-a.direction:0;}
 get recovery(){return this.phase==='playing'&&this.time%6>4.8&&this.time<24;}
 tick(dt,input=0){
  if(this.paused||!Number.isFinite(dt)||dt<=0)return;
  if(this.phase==='falling'){this.fallTime+=dt;if(this.fallTime>=1.6)this.phase='finished';return;}
  if(this.phase!=='playing')return;
  this.input=clamp(Number.isFinite(input)?input:0);this.accumulator+=dt;
  const h=1/120;
  while(this.accumulator>=h&&this.phase==='playing'){this.accumulator-=h;this.step(h);}
 }
 step(dt){
  this.time=Math.min(ROUND_SECONDS,this.time+dt);
  const a=this.nextAttack;
  if(a&&this.time+1e-9>=a.at){this.velocity+=a.direction*a.strength;this.lastBuck=this.time;this.lastDirection=a.direction;this.lastStrength=a.strength;this.bucks++;this.attackIndex++;}
  const intensity=.8+(this.level-1)*.42;
  const breathing=this.recovery ? .24 : 1;
  const warmup=Math.min(1,this.time/2);
  const sway=(.8*Math.sin(this.time*2.8)+.38*Math.sin(this.time*6.1+.8))*intensity*breathing*warmup;
  const acceleration=this.angle*2.3+this.input*7.4+sway-this.velocity*1.55;
  this.velocity+=acceleration*dt;this.angle+=this.velocity*dt;
  const danger=Math.max(0,Math.abs(this.angle)-.58);
  this.grip=clamp(this.grip+(danger>0?-danger*115:this.recovery?36:14)*dt,0,100);
  if(Math.abs(this.angle)>1.2||this.grip<=0){this.phase='falling';this.fallDirection=this.angle>=0?1:-1;this.fallTime=0;}
  else if(this.time>=ROUND_SECONDS-1e-9){this.time=ROUND_SECONDS;this.phase='won';this.accumulator=0;}
 }
}
