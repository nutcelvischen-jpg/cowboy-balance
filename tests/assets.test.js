import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
function parse(name){
 const data=readFileSync(new URL(`../assets/models/${name}.glb`,import.meta.url));
 assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
 const size=data.readUInt32LE(12);return {bytes:data.length,json:JSON.parse(data.subarray(20,20+size).toString())};
}
for(const [file,pivots] of [['bull',['BullRoot','Head','Tail','Leg_LF','Leg_LB','Leg_RF','Leg_RB']],['cowboy',['CowboyRoot','Torso','Arm','Scarf']]]){
 test(`${file} is self-contained, has animated pivots and fits mobile geometry budget`,()=>{
  const {bytes,json:g}=parse(file);assert.ok(bytes<2_000_000);
  for(const n of pivots)assert.ok(g.nodes.some(x=>x.name===n),`Missing ${n}`);
  assert.ok(g.buffers.every(b=>!b.uri),'Must not depend on external buffers');
  assert.ok(!g.extensionsRequired?.length,'No external compression decoder needed');
  const triangles=g.meshes.reduce((total,m)=>total+m.primitives.reduce((t,p)=>t+g.accessors[p.indices].count/3,0),0);
  assert.ok(triangles<50_000,`Too many triangles: ${triangles}`);
  for(const a of g.accessors)for(const key of ['min','max'])if(a[key])assert.ok(a[key].every(Number.isFinite));
 });
}
test('Blender source geometry joints and transforms passed audit',()=>{
 const a=JSON.parse(readFileSync(new URL('../models/geometry-audit.json',import.meta.url)));
 assert.ok(a.transforms_clean);assert.ok(a.parts>100);assert.ok(a.joints.length>=50);
 assert.ok(a.joints.every(j=>j.ok&&j.overlap>=.005));
});
