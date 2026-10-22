import {clamp} from './model.js';
// Presentation only: these poses never feed back into the balance simulation.
export function bullPose(game,now,reduced=false){
 const idle=['ready','won'].includes(game.phase),t=idle?now*.0007:game.time;
 const active=game.phase==='playing',settling=game.phase==='falling'?Math.max(0,1-game.fallTime/.7):0;
 const activity=active?1:settling;
 const energy=(game.recovery?.35:1+game.level*.13)*activity;
 const age=Math.max(0,game.time-game.lastBuck),strength=clamp((game.lastStrength||1.7)/1.7,.85,1.5);
 const strike=age<.95?Math.exp(-age*4.8)*Math.sin(age*12):0;
 const leap=age<.65?Math.sin(age/.65*Math.PI)*.46*strength:0;
 const quiet=reduced?.22:1;
 const roll=clamp((Math.sin(t*5.2)*.12+Math.sin(t*10.7)*.045)*energy-game.lastDirection*strike*.92*strength*activity+(game.feint||0)*.14,-.75,.75)*quiet;
 return {
  yaw:-.5+(Math.sin(t*3.1)*.10*energy+game.lastDirection*strike*.13*activity)*quiet,
  roll:activity?roll:Math.sin(t)*.035*(reduced?0:1),
  pitch:(Math.sin(t*6.5)*.07*energy+strike*.40*strength*activity)*quiet,
  lift:reduced?0:activity?(Math.abs(Math.sin(t*6.5))*.09*energy+leap*activity):Math.abs(Math.sin(t))*.015,
  headPitch:(Math.sin(t*8.8)*.10*energy-strike*.18*activity)*quiet,
  headYaw:Math.sin(t*6.2)*.13*energy*quiet,
  tail:Math.sin(t*(activity?8:2))*(activity?.55:.18)*quiet,
  legs:Array.from({length:4},(_,i)=>({pitch:(Math.sin(t*6.5+(i%2)*Math.PI)*.31*energy+(i%2?-.65:.75)*strike*strength*activity)*quiet,roll:Math.sin(t*7+i)*.10*energy*quiet})),
  impact:Math.abs(strike)*activity*(reduced?0:1)
 };
}
