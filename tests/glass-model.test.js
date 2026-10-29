import test from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import * as models from '../dist/glass-model.js';
test('Blender exports a clear flared POKAL and rounded espresso cup without a label or saucer',async()=>{
 assert.ok((await stat(new URL('../assets/cafe-tumbler.blend',import.meta.url))).size>10000);
 assert.equal(models.cafeLogoPositions,undefined);
 for(const name of ['cafeGlass','espressoCup']){
  const p=models[name+'Positions'],n=models[name+'Normals'],ix=models[name+'Indices'];
  assert.equal(p.length,n.length);assert.equal(ix.length%3,0);assert.ok(ix.length>3000);assert.ok(ix.every(i=>i>=0&&i<p.length/3));
  const ys=p.filter((_,i)=>i%3===1);assert.ok(Math.min(...ys)>=0);
 }
 const p=models.cafeGlassPositions,radiusAt=y=>{let r=0;for(let i=0;i<p.length;i+=3)if(Math.abs(p[i+1]-y)<.02)r=Math.max(r,Math.hypot(p[i],p[i+2]));return r;};
 assert.ok(radiusAt(1.4)>radiusAt(.06)+.1);
 const p2=models.espressoCupPositions;for(let i=0;i<p2.length;i+=3)if(p2[i+1]<.015)assert.ok(Math.hypot(p2[i],p2[i+2])<.13,'rounded base has no saucer');
});
