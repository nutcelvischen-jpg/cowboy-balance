import test from 'node:test';
import assert from 'node:assert/strict';
import {bullPose} from '../motion.js';
import {Rodeo} from '../model.js';
const state=()=>Object.assign(new Rodeo(),{phase:'playing',time:25,lastBuck:24.88,lastStrength:2.8,lastDirection:1});
test('buck poses stay finite and bounded, in both directions',()=>{
 for(const direction of [-1,1])for(let age=0;age<2;age+=1/120){
  const g=state();g.time=g.lastBuck+age;g.lastDirection=direction;
  const p=bullPose(g,0);assert.ok(Math.abs(p.roll)<=.75);assert.ok(p.lift>=0&&p.lift<1);
  for(const v of Object.values(p).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(v));
  for(const leg of p.legs)assert.ok(Number.isFinite(leg.pitch)&&Number.isFinite(leg.roll));
 }
});
test('strong attacks visibly roll opposite ways; pose does not alter gameplay',()=>{
 const g=state(),before=JSON.stringify(g),right=bullPose(g,0);
 assert.equal(JSON.stringify(g),before);g.lastDirection=-1;const left=bullPose(g,0);
 assert.ok(right.roll<-.4);assert.ok(left.roll>.4);
});
test('paused simulation time freezes active poses',()=>{
 const g=state();assert.deepEqual(bullPose(g,10),bullPose(g,50000));
});
test('reduced motion removes jumps and camera impact and softens rolls',()=>{
 const g=state(),full=bullPose(g,0),quiet=bullPose(g,0,true);
 assert.equal(quiet.lift,0);assert.equal(quiet.impact,0);assert.ok(Math.abs(quiet.roll)<Math.abs(full.roll)*.25);
});
